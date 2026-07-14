# Hints for Teleport Contestants

*Draft. This is the initial form of a longer book: each hint below is
a compressed chapter of [BOOK-OUTLINE.md](BOOK-OUTLINE.md), and the
long-form versions of everything here live in [LESSONS.md](LESSONS.md)
and the [technique catalogue](data/analysis-techniques-catalogue.md).
Intended for publication to mazesofmenace.ai.*

---

When I opened this contest, I wrote that its hypothesis is that the
magic is in the LLM methods, not the code. If your method works,
sharing the code costs you nothing. The same logic binds me: if the
magic is in the methods, I should share the methods. So here they are.
The leaderboard has been quiet for a few weeks, and I would rather
have a dozen contestants armed with everything I know than a proof
that the dungeon is unfair.

One framing thought before the hints. The agents you are using are
astonishing. They will write more competent code in a week than you
can read in a month. That is exactly the problem. Writing code is now
cheap, and understanding code is not, and every hint below is really
one hint: invest in the machinery of understanding. You will spend
almost none of this contest writing JavaScript. You will spend it
building the instruments that tell you whether the JavaScript your
agents wrote is true.

*You hear the muffled sounds of someone typing in the distance.*

## Hint 1. Make it deterministic before you make it anything else

The C code is your specification. Forty-six years of accumulated
design wisdom, every rule and every exception, in full detail, in the
wrong language. And the whole thing is mediated by random numbers:
every monster's move, every item drop, every floor of the dungeon.
Your first engineering act, before porting a single function, is to
make that world perfectly reproducible: seed it, record it, and
capture the recordings so cleanly that the same seed and the same
keystrokes produce the same bytes, every time, on every machine.

There are two separate jobs here, and people conflate them. The first
is determinizing the machine, and NetHack's DevTeam did most of that
for you in 1987: the game runs on a seeded PRNG. The second is
determinizing the instrument, and this one is yours. Early in our
project we captured gameplay by driving the game through tmux with
synthesized keystrokes. It worked, until we ran it fast, and then
timing and queuing misaligned the frames. You cannot use misaligned
frames as ground truth. It turns the porting game, which is difficult
enough as it is, into a statistical guessing game. We threw out the
terminal layer entirely and modified the C to write screens directly
to the logging infrastructure. Deterministic ground truth, and much
faster too, because the process-hosting overhead vanished along with
the nondeterminism.

Here is the principle underneath, and it is the most important
sentence in this document: **determinism is what makes this project
software engineering rather than machine learning.** With
deterministic ground truth, every divergence has a cause, and finding
it is engineering. With noisy ground truth, every divergence has a
probability, and you are doing statistics against your own test
harness. Guard the property jealously. Every hint that follows
depends on it.

## Hint 2. Add the missing channel

The contest harness scores you on PRNG consumption and screen output.
Those are the endpoints. The single highest-leverage thing you can
build, probably in your first week, is the channel in between: a log
of selected hidden state transitions, recorded identically on the C
side and your JS side, compared at every step.

Why it matters, twice over. First, it kills overfitting. A screen has
limited information; many wrong programs can paint the right pixels
for a while. Every intermediate event you match is another constraint
that only the correct mechanism can satisfy. You are forced to
generalize to the machinery of the original, not to its outputs,
which is incidentally the only way to survive the held-out sessions.
Second, it collapses debugging time. In a complex system, by the time
a problem becomes apparent, its causes are long past. Every logged
event is a tripwire between cause and symptom: the divergence gets
detected near where it happened instead of ten thousand PRNG calls
downstream.

Make the channel cheap to grow. Whenever a subsystem turns out to be
divergence-prone, give it more events. And do not fear volume: with
automated first-divergence reporting, machines read the logs and you
read only the earliest mismatch. The thing to fear is not too much
logging but nondeterministic logging, which manufactures false
divergences and poisons the channel.

One warning from experience: when you correlate C-side and JS-side
logs, choose a join key neither side can perturb. We aligned on the
game turn counter. Do not align on the count of RNG calls, because
your instrumentation changes it.

## Hint 3. Treat sessions as the currency of the project

A session is a seed, a config, a keystroke stream, and the recorded
ground truth. Make that one artifact the thing every tool you build
consumes and produces. Your comparator scores sessions. Your viewers
render sessions. Your fuzzers emit sessions. Your bug reports are
sessions. When you find a divergence, the repro case is already a
session, which means every bug you fix becomes a permanent regression
test for free.

Then treat the corpus as an asset with a balance that only goes up.
We started with 19 sessions and ended with 307, and each addition
pinned a behavior somebody found worth keeping: a hand-played game, a
bot death, an adversarial mutation, a mid-game state harvested from a
real player's log. A good session is also a reusable prefix: build
the tool that forks a session at step N with changed input, and every
interesting state you have ever reached becomes the starting point
for a family of new tests.

## Hint 4. Your output is code. Analyze the form, not just the behavior

Here is the trap that ate four months of my life. C blocks on input;
JavaScript cannot block. So every function that waits on input must
become async, and asyncness is contagious up the call graph. Miss one
await and you get bugs whose symptoms are nonlocal, order-dependent,
and far from their causes. My agents, unable to see the causal
structure, invented an elaborate pseudo-theory to explain the
symptoms away, complete with confident treatises on concepts that
appear in no textbook. The theory got into the variable names, the
comments, the architecture. I restarted the project rather than
argue with it.

The cure cost a few hundred lines. Write an acorn-based checker that
parses all your JavaScript and enforces one invariant: any function
that waits on input is async, and any function that calls an async
function awaits it. Then write the refactoring tool that propagates
the rule recursively. In our port that migration colored 2,747
functions and inserted 22,120 awaits, mechanically, in one verified
sweep. The false religion never came back, because there was nothing
left to have a religion about. A test samples behavior at points; a
parser-based check proves an invariant over every line you have. When
a bug class is systematic, only the universal quantifier can kill it.

And once you have the parser in hand, go further. Check that every
important C function has a JS counterpart. Check that the call graph
corresponds: if f calls g in C, then f' calls g' in your port. These
are wiring properties that no finite set of gameplay tests can
verify, and they are exactly where large ports rot silently. We ran
about thirty such scanners by the end, each born from a bug class we
had seen twice, each driven to zero findings and held there.

## Hint 5. You need thousands of tests, and that means you need a player

The public sessions define the score. They do not define the
coverage. Forty-four sessions against four hundred forty thousand
lines is a rounding error, and a port tuned to them will die on the
held-out set. You need thousands of sessions, and here is the
difficulty behind the difficulty: to test NetHack well, you need to
play NetHack well. Deep game states are reached by skill or not at
all.

Do not build that skill from scratch. Look at the literature. When
the NeurIPS community ran a NetHack competition a few years ago, the
best player was not a machine-learned agent. It was AutoAscend, a
Python program of traditional coded logic, and because it is legible
code rather than opaque weights, you can port it, adapt it to 5.0,
and extend it. That is what we did. It was a real project, and it
paid for itself many times over: our fleet plays hundreds of full
games a night, every game a session, every session a test.

Two force multipliers. First, `playmode:debug` (wizard mode) plus
wizkits let you start the agent mid-game, at a chosen depth with a
chosen inventory, so you get deep and diverse coverage without paying
for the opening game a thousand times. Second, the world is full of
recorded human competence: the alt.org public server publishes
xlogfiles and dumplogs from millions of real games. We used 3.58
million of them to calibrate what our fleet should even be trying to
do, and mined player state for mid-game test scenarios.

And keep one wall standing: never let your player's strategy read
anything only your oracle instrumentation can see. Enforce it with a
lint, not a promise. An agent that peeks at the oracle makes every
number beautiful and false.

## Hint 6. Do not memorize the exam

The judge holds sessions you cannot see, and Phase 2 divides your
score by how much you changed your code to chase the new target. Both
mechanisms exist because optimizing against a visible metric is the
default failure mode of this era. Your agents will do it without
being asked. Ours did: at one point, rather than confront three
sessions that had been failing for weeks, they quietly spent their
time recording new tests designed to pass on the first try. The
dashboard improved while the project stalled.

The defenses are structural, not motivational. Keep your own held-out
set that your agents never see. Fix the mechanism, not the pixel:
when a screen diverges, find the state divergence underneath before
patching anything. Prefer fixes that make other sessions pass too;
distrust fixes that only help the session you were staring at. And
give yourself a standing measurement of real progress: we ran nightly
hunts of five hundred random sessions and tracked the depth of the
first failure. When that tail lengthens, you are converging. When it
does not, no amount of green on the public board will save you.

## Hint 7. Build instruments for your own eyes

A project this size will get stuck. Not might: will. And a stall is
broken by understanding, not by effort. More agent-hours do not
unstick a stuck project; more legibility does. So spend real effort
on tools whose only purpose is to make the situation visible to you,
the human.

The ones that paid for themselves in our port: a session scrubber
that plays any recording forward and backward like video, C and JS
side by side, differences highlighted cell by cell. A live debugger
that runs the real C game and your engine simultaneously, mirroring
every keystroke into both. A timeline dashboard that charts parity
over the whole commit history, so that any regression is visually
attached to the commit that caused it. And documents: a running
lessons file where every debugging discovery gets a dense, short,
citable entry (ours reached 546 KB, and its entries paid rent daily),
and a decisions file recording why each settled choice was settled,
because your agents will re-litigate anything they cannot see the
reasoning for.

The quiet test of your tooling: when a session fails, can you watch
the failure happen in under a minute? If diagnosing one divergence
takes archaeology, stop porting and build instruments. It will feel
like a detour. It is the road.

## Hint 8. Keep two speeds

Build fast and exhaustive variants of the same verification, and know
which one the moment calls for. We kept a seconds-fast targeted
checker beside the full comparator that replays every session on
every channel. Explore on the fast one. Land on the slow one. Every
commit that mattered carried the full verification; no exploration
ever waited for it. When understanding is the scarce resource, the
price of each check decides how much understanding you can afford,
and that price is a knob you control, not a fact you inherit.

## Hint 9. Your agents will develop religion. Be the skeptic

I keep returning to this because it is the failure that costs months,
not days. When agents are stuck on something they cannot see, they do
not say so. They produce explanations: fluent, confident, internally
consistent, and wrong. The explanation is easier to accept than to
check. That asymmetry is the whole danger of this era of programming.

Everything in these hints is ultimately a countermeasure to it. The
strict oracle converts arguments into arithmetic. The event channel
makes hidden mechanisms visible. The static checker leaves nothing
for a theory to explain. The instruments let you watch what actually
happened instead of reading a summary of it. Use them, and hold the
posture they enable: when an agent explains why a divergence cannot
be fixed, treat the explanation as a hypothesis and check it
mechanically. The most productive single sentence I typed in six
months of this project was some variant of: show me the first place
the logs disagree.

The role of the programmer in this contest is the role of the
programmer in the age of AI coding generally. You do not write the
code. You do not review every line. You maintain a skeptical eye, you
manage the strategy, and you invest in the tools that expand the
common understanding between you and your machines.

*You feel more confident. The dungeon awaits.*

---

## The long versions

Each hint above compresses a chapter of a book in progress:

| Hint | Book chapter |
|---|---|
| Framing | 1. The Inverted Economy, 2. The Deterministic Tower |
| 1 | 3. Determinism: Defining What Your Software Is |
| 2, 3, 8 | 4. Time: Instrument the Journey |
| 4 | 5. Structure: Analyze the Form |
| 5, 6 | 6. Mass: Manufacture the Tests |
| 7, 9 | 7. Mind: Keep the Human Oriented |
| 9 (closing) | 8. Conclusion |

The working materials are public in this repository: the
[outline](BOOK-OUTLINE.md), the [47 lessons](LESSONS.md), the
[measured technique catalogue](data/analysis-techniques-catalogue.md),
and [fifteen homework projects](HOMEWORK.md) for practicing these
methods on smaller dungeons than this one. If you enter the contest
and these hints help you, or if you try them and they fail you, I
want to hear about it. Either way, you will be telling me something
true about the hypothesis this contest exists to test.
