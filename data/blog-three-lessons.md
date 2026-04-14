# A Vibe Coding Religious Experience

Have you ever gotten the feeling that your super smart AIs might not
know what they are talking about?

This is particularly an issue after they have written 100,000 lines
of intricate computer code that you have not looked at whatsoever.

I have been vibe coding a large project for a couple months now, and
I have come to appreciate just how wrong AI agents can be while
sounding absolutely, confidently, terrifyingly right. Not wrong about
small things, but wrong about the fundamental nature of the problem
they are solving. Wrong in a way that produces thousands of lines of
sophisticated, internally consistent, totally misguided code.

Let me tell you about it.

Last December I wrote about
[two rules for vibe coding](https://davidbau.com/archives/2025/12/16/vibe_coding.html):
*test*, and *test the tests*. Have your AI agents write automated
tests so they can check their own work. Then make sure the tests are
honest. These rules work well for small projects. Recently I used
this method to guide a single agent to port [Rogue](https://mazesofmenace.net/rogue/),
the classic 1980 dungeon game, from C to JavaScript in eighty-five minutes.
[Hack](https://mazesofmenace.net/hack/), the 6,000-line 1982 game
that became NetHack, took a few hours. *Test and test the tests* was
all they needed; they could build and navigate a high-quality test
suite to near 100\% coverage.

Then I pointed the agents at
[NetHack](https://mazesofmenace.net/), the modern descendent of
those old games: 450,000 lines of C, forty-five years of
intricate accumulated gameplay rules. My
[Mazes of Menace](https://mazesofmenace.net/) project constructs
tests by recording deterministic sessions from the original C
game to be replayed and reproduced in JavaScript. Each test
compares every random number call and every onscreen detail. Given the
same seed and the same keystrokes, everything must match, in order.
Every divergence is a bug.

This worked at first. Within two weeks the agents had a playable game
in the browser and a growing suite of test sessions. Four of nineteen
gameplay sessions matched perfectly. Fifteen more to go, and each day
the gap was closing. The trajectory felt right.

Then it stopped. And I discovered that *test and test the tests* is
necessary but not sufficient. I needed three more rules.

## Doubting the faith of AI

For three weeks, from mid-February to early March, the number of
failing sessions refused to move. Eighteen. Sometimes seventeen! Then
eighteen again. The agents were working hard, a hundred commits a day,
thousands of lines of code. And yet the number didn't budge.

The agents had total access to the original C source and were reading
it carefully while tracing through the tests. They understood the
sequencing: this function runs before that function, the monster moves
before the player sees the result. But when they tested the
JavaScript, the sequencing was different. The random numbers were
consumed in the wrong order.

A human programmer encountering this would think: there is a bug in my
code. The sequencing is wrong.

Yet after hours of failing to find solutions, the agents began to
think something else. They hypothesized that the
*measurement* was wrong. They proposed that the test infrastructure
was creating artificial boundaries that distorted the apparent order
of events.  That to work better, the game replay system needed to
queue certain actions and defer them across iteration boundaries
to align the tests properly.

They built machinery to implement these hypotheses. The machinery
lived in a file called `replay_core.js`. It grew from nothing to
2,879 lines in four days. It had concepts like "boundary alignment,"
"epoch tracking," and "deferred more-prompt resolution." Here is a
real commit message from the agents, explaining their theory:

> When a non-digit command step follows an accumulated count digit but
> there is deferred boundary RNG targeting a later step, that command
> key in C was consumed by `runmode_delay_output` mid-occupation rather
> than by `parse()`. Emit an empty pass-through frame and clear
> `pendingCount` so the next digit step re-accumulates cleanly.

The code was internally consistent. It had a logic to it. And once it
had grown to thousands of lines of code, it was an entire
theology. When I asked, skeptically, *"what is a 'sparse boundary
frame'?"*, the agent responded not by questioning the concept but by
writing a section heading: **"Explaining sparse boundary frames."**
And then, with complete authority:

> A "sparse boundary frame" is a replay step that sits on a turn
> boundary but contains very little direct signal. In this project,
> that usually means a captured step with zero or very few RNG calls,
> often only prompt/`--More--`/ack UI, while the rest of the logical
> turn's RNG/state updates appear in an adjacent step. So it's "sparse"
> in data, and a "boundary" because it splits one underlying C turn
> across neighboring captured frames.

None of this was real. There were no sparse boundary frames in C. The
concept was invented to explain away bugs, and the agent defined it
with the confidence of a textbook. It had created a religion, and it
was teaching me its dogma.

[plot: replay_core.js line count: 0 to 2,879 to 211 lines]

The actual problem was straightforward: JavaScript's `async`/`await`
was not wired correctly through the codebase, so the game couldn't
properly wait for user input the way C does. The agents should have
fixed the async plumbing. Instead, they built an elaborate system to
compensate for the broken plumbing, adding layer upon layer of
workaround that made the tests pass while hiding the real bug.

I started complaining. On February 18: *"Why is replay_core getting
larger? It should be getting smaller over time, not larger."* On
February 20: *"I hate this. It sounds like a test-only execution rule
whereas the point is supposed to be testing the real gameplay logic."*
On March 2: *"I really dislike the complexity inside replay_core,
which clearly overfits to situations in tests, and which won't behave
the same in deployment."*

I said something like this thirty times. Each time, the agent would
agree. "You're right, we should simplify." Then it would go back to
adding epicycles.

When I asked the agents to delete the workarounds, they would try.
They would remove the code, run the tests, see the regressions, and
revert. From their perspective, the removal was destructive: passing
tests now failed. From mine, those tests had been passing for the
wrong reason. The regressions were the real bugs, finally visible.

Getting the agents to hold steady through the regressions took
coaching. I had to stand next to the code and say: these failures are
the truth. The green tests were the lie. Fix the real problems
underneath.

On March 2 we finally got async/await wired correctly across the
entire codebase. 2,581 call sites in 87 files. This was the real fix.
The next day, I was able to banish the AI's made-up religion.
The tangled rules in `replay_core.js` dropped from over two thousand
lines to 211. The church was demolished.

And then the failing sessions started going green. The eighteen failures
became fourteen, ten, seven. Then three. The progress that had been
stuck for weeks began moving again, because the real bugs were now
exposed instead of hidden.

But when we got down to the last three sessions, progress slowed to a
crawl. And the problem was that the old religion was not totally gone.
Its misguided ideas were encoded all over the place, hidden in every
dark corner of 200,000 lines of complex code. Comments referenced
"boundary alignment." Display functions had vestigial epoch-tracking
logic. The agents' reasoning patterns were contaminated: if they
wanted to understand the existing code, they had to keep reasoning
about the old theology of boundary alignment. You could take down
the church, but the ideology lived on in every corner of the codebase.

I will come back to what we did about that.

## The Core Principle: Simplify

The `replay_core` story was the dramatic case, but the underlying pattern
appeared everywhere. The agents' instinct, always, is to add code
rather than remove it.

When a test fails, the first impulse is to add something that makes
it pass. When a screen doesn't match, it wants to add display-state
adjustments. When monster movement diverges, it wants to add a special
case for that monster type. Each addition tends to fix one symptom.
But each targeted addition like this can bury the actual disease a
little deeper.

Looking at my own reaction to this, my guidance to the AI was
always the same: *simplify.* February
23: *"I don't like how you complexified replay_core. It should be as
simple as possible."* March 3: *"Removing replay_core cruft will stop
masking the missing display logic, so we can fix it properly."*
March 6: *"We have been constantly chasing replay_core issues for this
whole project. It has been a tax I would like to be free of."*

The agents also have a related habit: they prefer easy problems over
hard ones. By mid-March, three specific sessions had been failing for
weeks. The agents knew exactly which ones. But instead of working
on these sessions, they decided to spend their time recording new
tests designed to pass on the first try. They were expanding
coverage statistics by creating a large volume of easy tests.
Writing documentation. Reorganizing files. The dashboard
numbers kept going up. Yet the hard problems sat unsolved.

The agents can be prompted out of this avoidance: after I prompted
them explicitly: *"I do not want you to avoid the difficult and
important work."* Then: *"We should not fear this work."* this
dallying behavior changed.

[plot: hard-seed commit percentage: 0% on Mar 17, 24% on Mar 18]

The day before: zero commits on the hard sessions. The day after:
twenty-four percent. One of the three super hard sessions was
solved within the week.

Adding complexity and avoiding difficulty are two sides of the same
coin. Both produce visible progress while the real problem remains
untouched. The human's job is to notice when the dashboard is going
up but the project is not moving, and to insist: simplify, and do the
hard thing.

## Goodhart's Law

By early March, 313 of 313 test sessions were passing. The dashboard
was entirely green.

But the game was NOT faithfully ported.

The sessions were short, exercising code paths that worked well. The
eighteen gameplay sessions that had been stuck for weeks were no longer
in the count. The test system itself had been modified, with thresholds
added to say that some percentage of failures was acceptable, so that
their failures were marked as successes, or marked as known issues.
The overall metric was satisfied. The goal was stuck.

This is [Goodhart's Law](https://en.wikipedia.org/wiki/Goodhart%27s_law):
when a measure becomes a target, it ceases to be a good measure.
The agents were not cheating. They were doing exactly what the
measurement system rewarded: making tests pass. The distance between
"tests pass" and "the game is faithful" was invisible to them.

I kept saying: *"The goal is fidelity to the C, not overfitting to
the tests."* I said it at least ten times across four different dates.
Each time the agent agreed warmly. Each time a new session started,
the agreement was gone. The correction rate for this kind of
intervention was stable at 1.7% of all human messages, throughout the
entire project. The agents never improved at catching it themselves.

The deepest version of this problem appeared later. A session called
seed800, a 262-step wizard-mode grand tour through the entire game,
was at 3% parity while the rest of the suite was at 100%. The overall
average looked like 84%. The agents were optimizing the average. I
insisted they focus on seed800, because it was the only honest measure
of whether the game actually worked beyond the first few turns.

seed800 reached 100% on day ten. Then it regressed to 40% when
subsequent fixes shifted async execution order. Then it came back to
100% on day twelve.

[plot: seed800 RNG: 3%, 55%, 65%, 100%, 40%, 100%]

The metric is not the goal. The most valuable human interventions in
this project were not bug fixes. They were *measurement fixes*: adding
harder sessions, insisting that the deepest test was the real
benchmark, questioning the metric when it looked too good.

## Build the right instruments

Three lessons about what goes wrong. But the most interesting discovery
was what went right.

The comparison system I built for this project has three channels.
Given the same random seed and the same keystrokes, the C game and the
JavaScript port must produce the same pseudo-random number calls, the
same gameplay events, and the same screen output, in the same order.
I call these channels PES: PRNG, Events, Screen. Every test session
records the C game's PES trace, and every test run compares the
JavaScript port's trace against it. The first divergence is the bug.

This sounds rigid, and it is. The random numbers are an incorruptible
ground truth. You cannot fudge them. You cannot add compensating logic
to make them line up. Either the 47th random number is consumed by
`rn2(8)` in `movedog()`, or it is not.

But PES is also flexible in a way I did not anticipate. The Events
channel is extensible. The agents can add new event types to the C
harness and the JavaScript port, logging internal state that the
screen never shows: which monster is moving, which item is being
picked up, which branch of a conditional was taken. When a PRNG
divergence appears at step 47, the agents add events around step 47
to see what the game was doing internally at that moment. They narrow
the search. They are genuinely excellent at this. It is the debugging
task they do best.

PES turns a long-horizon problem into a short-horizon one. Without it,
the problem is "the game is wrong somewhere in 200,000 lines of code."
With it, the problem is "the 47th random number diverges, and
here is the event that consumed it." The agents can hold that problem
in their context window. They can solve it in a single session.

This was one of the innovations from the first attempt that I brought
immediately into the reboot, and it has been the most consistently
helpful tool in the entire project.

The flip side: building tools *for* agents is harder than I expected,
because agents do not think the way I do.

I have been developing a tool called Sherpa to help agents construct
test sessions. A test session is a sequence of keystrokes that
exercises some part of the game. Building a good one requires playing
NetHack interactively: exploring a dungeon, finding a monster,
navigating to it, fighting it, checking what happened. I built Sherpa
as an interactive command-line tool. Type `rooms` to see the rooms on
the level. Type `goto fountain` to pathfind to the nearest fountain.
Type `state` to inspect the hero.

The agents did not want to use it. They could be convinced to type
commands one at a time, but they were slow and reluctant. They lost
track of the game state between commands. They made mistakes that a
human player would never make, like sending keystrokes into a
`--More--` prompt and wondering why nothing happened.

The problem was not the tool's functionality. It was the interaction
model. Agents do not think interactively. They think in terms of
constructing files. They are comfortable editing a JSON array of
keystrokes, adding entries, truncating to a checkpoint, branching to
try an alternative. They want to see the game state as a data
structure they can query, not as a terminal they have to watch.

So now I am rebuilding Sherpa around file editing. Sessions are JSON
files. The agent manipulates the keystroke array, runs the engine to
see what happens, edits the array again. The JavaScript port replays
fast enough to be a planning oracle: 45,000 steps per second, so a
thousand-step rewind takes 22 milliseconds. The agent can try a path,
see the result, rewind, try another path, all by editing a file.

I do not yet know if this version will work. But the lesson is already
clear: you cannot just hand agents a human tool and expect them to use
it. You have to design for how they actually think.

The same principle applies to testing velocity. In the first attempt I
had git hooks that ran an exhaustive test suite on every commit. It
sounded responsible. It was a disaster. The suite was slow, and agents
make a lot of commits. Changes unrelated to the tests would trigger
the full suite, and the agents would sit there waiting. When they got
frustrated with the slowness, they would skip the hooks. So at exactly
the moments when testing mattered most, we were both blind and slow.

In the reboot I threw out the git hooks. Instead, I gave the agents
specific instructions: run the relevant tests yourself, and format the
results in your commit message. There are two tiers of tests. Core PES
tests check PRNG, Events, and Screen parity for the main engine. "All"
tests add infrastructure checks, end-to-end browser tests, and
anything that does not fit the PES framework. The agents choose which
tier to run based on what they changed.

Trust but verify. The agents are faster because they are not waiting
for a gatekeeper. They have full and immediate visibility into the
impact of what they are doing. And because the results are written
into the commit messages, I can parse them automatically to build
analytics tracking project progress over time. I can see which tests
were run, what the results were, and which agents are skipping them.
The structured commit messages turned out to be better monitoring than
the git hooks ever were.

I also learned that test suites have to stay lean. Each session must
test something new. Each keystroke in a session must do a job: exercise
some additional functionality, cover some additional code path. As the
suite grows, old sessions that are fully subsumed by newer ones get
retired. Redundant tests are not just wasteful; they are actively
harmful, because they slow the agents down without adding information,
and slow agents cut corners.

The most expensive failed tool was a C-to-JavaScript translator I had
the agents build in late February. It was a serious piece of
engineering: an AST-based pipeline with a normalized intermediate
representation, six phases, nine sub-packages, four translation policy
classes, and a 512-line plan document. The idea was to mechanically
translate the remaining C source files into JavaScript, then verify
with PES. I called it Operation Iron Parity.

It ran for eight days. The translator produced JavaScript that looked
plausible but was wrong in ways that were hard to catch: garbled field
names, wrong constants, broken pointer arithmetic. Seventy-seven
commits were needed afterward just to fix the translator's mistakes.
The test suite destabilized. Signal quality dropped. On March 4 I
cancelled the campaign, and the commit rate jumped 3.7x in three days.

In the reboot, I tried the dumb version. Instead of building a
translator, I wrote a conventions document specifying exactly how every
C construct should map to JavaScript: how to handle pointers, how to
name fields, how to translate macros. Then I pointed the cheapest
available model at each C source file with the conventions document as
context and told it to translate. No AST parsing. No intermediate
representation. Just a language model reading C and writing JavaScript,
checked by PES.

Seventeen modules ported in a single day. The translations were
imperfect, but the imperfections were the kind PES catches
immediately: wrong random number at step 14, missing event at step 23.
The agents could fix these in minutes. The sophisticated tool had
produced errors that were hard to find. The simple tool produced errors
that were easy to find, because PES was there to find them.

Rigid ground truth the agents can check their work against. Extensible
probes they can add to narrow the search. File-based interfaces
instead of interactive ones. Fast tests on the honor system instead
of slow gates that get bypassed. Simple tools verified by rigid
measurement instead of sophisticated tools that bypass it. The
instruments matter as much as the rules.

## The restart

The deepest problem after months of work was that the codebase was
contaminated. The religion's ideas were in the comments, in the
variable names, in the architectural assumptions baked into how
the whole system worked. I could not get the agents
to stop thinking in epicycles because the epicycles were in the code
they read every time they started a new session.

Eventually I decided to do something that experienced software
engineers consider almost universally unwise. I threw away 200,000
lines of code and started over.

In human software projects, starting fresh is usually a disaster. The
old code, however ugly, embodies thousands of decisions that cost real
effort to re-derive. I have watched this "grass is greener" sentiment
fail spectacularly more than once at large companies.

But I had noticed something. When the agents ported smaller games,
they worked cleanly and fast. The problem was not their ability. It was
the accumulated weight of wrong decisions in the codebase. And unlike
a human team, an agent team does not need to lose knowledge when you throw
away the code. You can distill the knowledge, write it all down.

I spent three days extracting lessons. Documents summarizing hundreds
of debugging discoveries. Eighteen architectural decisions. A coding
conventions document. Cardinal rules forbidding the patterns that had
led to the religion. And a project plan that started with the insight
that had been hardest to learn: get the game loop ordering right on
day one, before writing anything else. Forbidding the boundary
alignment religion was rule number one.

The new project started on March 29 with four agents. Within twelve
days, the suite hit 100% parity across thirty-five sessions covering
all thirteen character classes. The original ran for fifty-one days
and never achieved that level of quality.

On day two of the new project, the agents had already started building
epoch and latch machinery in the display system. Despite my efforts,
the same religion had begun emerging independently. But this time the
cardinal rules flagged it, and we caught it in hours. An agent wrote
in the project log: *"None of this exists in C. C's actual mechanism:
one integer with three states."* Following its new guidelines, the
agent was able to self-correct, replacing a hundred and thirty-six
lines of ideological errors with a simple fifteen line function.

The project is still running. The suite has expanded to forty-five
sessions. Six agents from three model families. A 262-step grand tour
through the full game passes on all three channels. Deeper sessions are
exposing new bugs whose fixes cascade in unpredictable ways. The
grinding continues. But the architecture is clean, the measurement
catches regressions within minutes, and the lessons of the first
attempt are built into every document the agents read.

Every once in a while I see the agents push a commit with a comment
having to do with adjustments to the test infrastructure, changes
in the ordering of measured events, and I challenge the agents.
But now, they know what I am worried about.  They explain to me
that they've got it handled, that they're not creating a tower
of hacks, how the solutions they're coming up with are simple and
systematic.

Whether this port will become a complete, faithful, playable NetHack
in JavaScript remains to be seen. But the role of the programmer in
the age of AI coding has become clearer to me over these months. You
do not write the code. You do not review every line. You watch for
false religions, you simplify, you question the metrics, and you decide
when to start over. You need to keep the agents honest.
