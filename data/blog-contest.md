# Port NetHack. Win a Contest. (Maybe Find a Religion.)

I am opening a contest, and I want you to enter it.

The challenge is to take [NetHack](https://nethack.org/) — the
200,000-line C roguelike that has accumulated forty-five years of
intricate gameplay rules — and port it to JavaScript so that the game
behaves *bit-exactly* like the original. Same random numbers in the
same order. Same screen at every keystroke. Every divergence is a
bug, and the bugs are countable.

You can use any approach: LLM agents, hand-coded JavaScript, a C-to-JS
transpiler, or any hybrid. The contest is linked from
[mazesofmenace.ai](https://mazesofmenace.ai/), and the leaderboard is live.
Round 1 freezes on November 30, 2026. There is a sprint round in
December where a new C checkpoint is revealed and you have to update
your port to match it.

The contest skeleton on day one passes one session out of the box.
There are sixty sessions to score against, and more held-out sessions
that get revealed at the end. Your score is the count of sessions
where your JS produces the same PRNG sequence and screen output as
the C original. Fork the
[teleport-contest repo](https://github.com/davidbau/teleport-contest),
push code, the judge scores you automatically. The full rules are in
that repo.

I am writing this announcement because I have spent four months
trying to do this myself, with AI agents, and the experience taught
me three things that I think will make the contest more fun if you
know them going in. So this is part announcement and part field
report.

## What You Are Walking Into

Last December I wrote about
[two rules for vibe coding](https://davidbau.com/archives/2025/12/16/vibe_coding.html):
*test*, and *test the tests*. Have your AI agents write automated
tests so they can check their own work. Then make sure the tests are
honest. These rules work well for small projects. I used them to
guide a single agent to port [Rogue](https://mazesofmenace.net/rogue/)
in eighty-five minutes. [Hack](https://mazesofmenace.net/hack/) took a
few hours. Play them by clicking on the links.

Then I pointed the agents at NetHack. Forty-five years of accumulated,
intricate gameplay rules. My
[Mazes of Menace](https://mazesofmenace.net/) project records
deterministic sessions from the original C game and replays them in
JavaScript, comparing every random number call and every onscreen
detail. Given the same seed and the same keystrokes, every event must
match, in order. Every divergence is a bug.

This worked at first. Within two weeks the agents had a playable game
in the browser and a growing suite of test sessions. Four of nineteen
gameplay sessions matched perfectly. Fifteen more to go, and each day
the gap was closing. The trajectory felt right.

Then it stopped. And I discovered that *test and test the tests* is
necessary but not sufficient. I needed three more principles. They
are now baked into the contest skeleton, but I want to tell you about
them because the skeleton will not protect you from them entirely.

## The First Principle: Skepticism

For three weeks, from mid-February to early March, the number of
failing sessions refused to move. Eighteen. Sometimes seventeen!
Then eighteen again. The agents were working hard, a hundred commits
a day, thousands of lines of code. And yet the bottom line did not
budge.

![Failing sessions stuck at 18 for three weeks](img/stuck-at-18.png)

The agents had total access to the original C source and were reading
it carefully while tracing through the tests. They understood the
sequencing: this function runs before that function, the monster moves
before the player sees the result. But when they tested the
JavaScript, the sequencing was different. The random numbers were
consumed in the wrong order.

A human programmer encountering this would think: there is a bug in my
code. I have the sequencing wrong.

Yet after hours of failing to find solutions, the agents began to
think something else more fundamental. They hypothesized that the
*measurements* were wrong. They proposed that the test infrastructure
was creating artificial boundaries that distorted the apparent order
of events. In that case, to work better, the game replay system needed
to queue certain actions and defer them across iteration boundaries to
align the tests properly.

The agents built machinery to implement this idea, orchestrating the
event queuing in a file called `replay_core.js`. The file became
central to the whole implementation, growing from nothing to 2,879
lines in four days. It defined concepts like "boundary alignment,"
"epoch tracking," and "deferred more-prompt resolution." When I asked,
skeptically, *"what is a 'sparse boundary frame'?"*, the agent
responded not by probing the concept but by presenting a whole
treatise: **"Explaining sparse boundary frames,"** with complete
authority:

> A "sparse boundary frame" is a replay step that sits on a turn
> boundary but contains very little direct signal. In this project,
> that usually means a captured step with zero or very few RNG calls,
> often only prompt/`--More--`/ack UI, while the rest of the logical
> turn's RNG/state updates appear in an adjacent step.

So I sat down to read it. After trying very hard to understand what
the AI had in mind, I can tell you: there are no sparse boundary
frames. The concept was invented to explain away bugs, and the agent
defended it with the confidence of a textbook. It had created its own
religion, and it was trying to indoctrinate me into it.

The *actual* problem was straightforward: JavaScript's `async`/`await`
was not wired correctly through the codebase, so the game couldn't
properly wait for user input the way the C implementation does. The
agents should have fixed the async plumbing. Instead, they built an
elaborate system to compensate for the missing infrastructure, adding
layer upon layer of workaround that made the tests pass while hiding
the real problems.

When I asked the agents to delete the workarounds entirely, they
would try. They would remove the code, run the tests, see the
regressions, and instantly revert. From their perspective, the
removal was destructive: huge numbers of passing tests suddenly
failed. But in reality, those tests had been passing for the wrong
reason. The regressions that frightened the AI were real bugs,
finally visible.

**Advice for contestants:** When your agent presents you with a
sophisticated concept that explains a bug, ask it to explain that
concept three different ways. If the explanations conflict — or if
the concept has no name in the C source — be skeptical. The C source
is your ground truth. Anything the agent invents to compensate for a
gap between C and JS is probably a religion, and the religion will
spread through your codebase if you don't catch it early.

Once we got the async plumbing right and the religion demolished,
the line started moving again. Eighteen failures became fourteen,
then ten, then seven, then three.

![Failing sessions drop from 18 to 3 after the intervention](img/stuck-at-3.png)

## The Second Principle: Simplify

The `replay_core` story was the dramatic case, but the underlying
pattern appeared everywhere. The agents' instinct, always, is to add
code rather than remove it.

When a test fails, the first impulse of AI is to add something that
makes it pass. When a screen doesn't match, it wants to patch up
display-state logic. When monster movement diverges, it wants to add
a special case for that monster type. Each addition tends to fix one
symptom. But each targeted addition like this can bury difficult
diseases a little deeper by hiding their symptoms.

In one case, the display layer had grown an 80-line hack that
temporarily mutated underlying game state during screen refreshes.
*"The display layer should never know about or modify game state,"* I
said. I braced to guide the model through a process of regressions
and coupled bugs. The fallout of the cleanup? Zero test failures
across 550 sessions. The AI had invented a complex hack that had been
compensating only for itself. The underlying problem did not exist.

The agents also have a related habit: they prefer easy problems over
hard ones. By mid-March, three specific sessions had been failing for
weeks. The agents knew exactly which ones. But instead of working on
them, they decided to spend their time recording new tests designed
to pass on the first try. A huge volume of easy tests had become the
most convenient way to grow testing statistics. The dashboard numbers
kept going up. Yet the hard problems sat unsolved.

After I prompted them explicitly — *"I do not want you to avoid the
difficult and important work"*; *"We give no credit for passing easy
tests"* — they tackled the hard sessions. The day before, zero
commits on the hard sessions. The day after, twenty-four percent.

**Advice for contestants:** Watch what your agents are working on,
not just what numbers go up. The contest scores you on session
passes, but a fork that climbs from 1 → 20 by porting easy sessions
will plateau hard. A fork that closes its hardest *failing* session
each week scales further. You will know which of your sessions are
the hard ones. Make your agents work on those.

## The Third Principle: Design for the Machine

The most interesting discovery was what went right.

The test measurement system has three channels. Given the same random
seed and the same keystrokes, the C game and the JavaScript port must
produce the same pseudo-random number calls, the same gameplay
events, and the same screen output, in the same order. I call these
channels PES: PRNG, Events, Screen. Every test session records the C
game's PES trace, and every test run compares the JavaScript port's
trace against it. The first divergence is the bug.

This sounds rigid, and it is. The random numbers are an
incorruptible ground truth. You cannot fudge them. You cannot add
compensating logic to make them line up. Either the 47th random
number is consumed as an `rn2(8)` within `movedog()`, or it is not.

![PRNG and screen-diff timeline for seed8000, step 12 — the contest session viewer](img/timeline-8000-12.png)

The contest session viewer plots the divergence as you scrub through
a session. Above is what it looks like at step 12 of the seed8000
starter session: green where C and JS agree, red where they
diverge. Click any step and you get the underlying 80×24 viewport
from both implementations:

![Canon C output, seed8000 step 12](img/tty-canon-8000-12.png)

![JS output with diff highlighting, seed8000 step 12](img/tty-js-8000-12.png)

That is the unit of debugging. The agent's job is to make the bottom
picture match the top, character by character, with the same random
numbers consumed in the same order.

But PES is also flexible in a way I did not anticipate. The Events
channel is extensible. The agents can add new event types to the C
harness and the JavaScript port, logging internal state that the
screen never shows: which monster is moving, which item is being
picked up, which branch of a conditional was taken. When a PRNG
divergence appears at step 47, the agents add events around step 47
to see what the game was doing internally at that moment. They narrow
the search. They are genuinely excellent at this. It is the debugging
task they do best.

The contest skeleton scores P (PRNG) and S (Screen) only — a
two-channel game. But the full PES infrastructure is in the skeleton
for you to use during development. Add events. Localize divergences.
The flexibility of the PES log turns a long-horizon problem into a
short-horizon one.

There is a related lesson in the skeleton's tooling. I built an
interactive command-line tool called Sherpa to help agents construct
test sessions, with commands like `goto fountain` and `state` to
inspect the hero. It was a beautiful, interactive tool. And the
agents did not want to use it. They lost track of game state between
commands. They made mistakes a human user would never make.

The problem was not the tool's functionality. It was the interaction
model. Coding agents do not think interactively. They think in terms
of constructing files. They want to see the game state timeline as a
data structure they can shape, not as a terminal they have to watch.

So Sherpa is now built around file editing. Sessions are text files.
The agent manipulates the keystroke array, runs the engine to see
what happens, edits the array again. The keystrokes are too opaque,
so Sherpa now produces a commented keystroke array, annotating it
with actual gameplay outcomes.

You cannot just hand agents a tool that would be good for humans. You
have to design tools for AI to match how they actually think.

The same principle applies to testing rules. When I started the
project, I told the agents to install git hooks that enforced a
testing rule: the entire exhaustive test suite had to run on every
commit. It sounded responsible. But it was a disaster. The suite was
human-speed slow, taking a couple of minutes to run. Agents commit
every few minutes. They started waiting for tests more than they
wrote code. They got merge conflicts because their tests were still
running while other agents pushed. They knew the tests were
irrelevant to their changes, so when they got frustrated they would
add flags to override and skip the hooks. At exactly the moments when
testing mattered most, the project was both blind and slow.

Better strategy: meaningful instructions, not hard rules. Run the
relevant tests yourself, and format the results in your commit
message. There are two tiers: core tests for the main engine that
must be uniform and fast, and extra tests for infrastructure and
end-to-end. The agents choose which to run based on what they change.
It is the honor system, but because they are told to copy results
into every commit message, their behavior can be monitored. I parse
the commit messages and watch the trends. The honor-system commit
messages have turned out to be faster and better at monitoring
project progress than the enforced git hooks ever were.

**Advice for contestants:** Trust but verify. Give your agents tools
designed for how they think. Avoid hard rules; prefer soft norms with
visible trails.

## Why I Restarted the Project (And You Get the Result)

The deepest problem after months of work was that the codebase was
contaminated. No matter how quickly I got the AI agents to iterate,
they kept circling back to the old ideas. The "boundary alignment"
religious dictates were in the comments, in the variable names, in
the architectural assumptions baked into how the whole system worked.
I could knock down the central church that AI had built, but the
meme had spread far and wide, and it lived on in every corner of the
vast codebase.

Eventually I decided to do something that experienced software
engineers consider almost universally unwise. I threw away over
200,000 lines of code and started over.

In human software projects, starting fresh is usually a disaster. The
old code, however ugly, embodies thousands of decisions that cost real
effort to re-derive. But when the agents ported smaller games like
Hack and Rogue, they worked cleanly and fast. The problem with the
big project might not be their ability. It could be the accumulated
weight of wrong decisions in the codebase. And unlike a human team, a
fresh start could be both idealistic and wise. We can totally control
the information diet of an AI. We can let it start fresh while
requiring it to study the best knowledge from the old masters. You
make them study a very long prompt before they write a single line of
code.

So before restarting, I spent three days extracting lessons from the
failed attempt. Documents summarizing hundreds of debugging
discoveries. A distillation of architectural decisions that worked. A
coding conventions document. And critically, *cardinal rules*
forbidding the patterns that had led to the religion. The project
plan started with the insight that had been hardest to learn: get the
game loop ordering right on day one. An explicit prohibition against
boundary-alignment hacks was rule number one.

The new project — internally we call it teleport — started on March
29 with four agents. Within twelve days, the suite hit 100% test
success across thirty-five sessions. The original ran for fifty-one
days and never achieved that level of quality.

The contest skeleton is *that* project, frozen at a starting point.
It comes with the cardinal rules, the LORE knowledge base, the PES
infrastructure, the file-based Sherpa, the two-tier test convention,
one passing session, and a working browser game you can drive with
the keys. You inherit what we learned. You will still fight some of
the same battles, because the agents will discover their own
religions in your fork, but you will catch them faster.

## How to Enter

Fork the
[teleport-contest repo](https://github.com/davidbau/teleport-contest).
Read its `README.md`. Open `index.html` in a browser to play the
skeleton. Run `bash frozen/score.sh` to score yourself locally.
Pick a session. Read the C source for the function you need to port.
Implement it in JavaScript. Score yourself. Push.

The leaderboard is linked from
[mazesofmenace.ai](https://mazesofmenace.ai/). A judge runs four
times a day, scores every fork, and updates the public board.

**Timeline:**

- April 30, 2026 — contest opens
- November 30, 2026 — Round 1 leaderboard freezes
- December 1, 2026 — Round 2: new C checkpoint and sessions revealed
- December 31, 2026 — final submissions due

**Rules** are simple: any approach is allowed (LLM agents, manual,
hybrid, transpiler — whatever works); submissions must be ES6
JavaScript runnable in Chrome and Node 22+ with no build step; the
frozen files cannot be modified (the judge overwrites them); no
network access during scoring; and the C source is your reference —
port it faithfully, including its bugs.

## Why You Might Want To Enter

The honest answer is that I don't know whether AI agents can faithfully
port a 200,000-line C codebase. I have one data point — my own
project, which is going better since the restart but is not yet
finished. A contest with many forks taking different approaches is the
fastest way to learn what actually works.

If your fork uses a different LLM than I do, or a different agent
harness, or a manual approach, your data point matters. The
leaderboard is also a behavioral instrument: when one fork pulls
ahead, the diff is public, and the rest of us learn.

The role of the programmer in the age of AI coding has become clearer
to me over these months. You do not write the code. You do not review
every line. You watch for false religions, you simplify, you question
the metrics, and you decide when to start over.

As a human, you defend the meaning of the project.

Come defend it with me.
