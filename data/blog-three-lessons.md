# Vibe Coding a Holy Mess

Have you ever gotten the feeling that your super smart AIs might not
know what exactly they are talking about?

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
all they needed; they could build and grow and program against a
high-quality test suite to near 100\% coverage.

Then I pointed the agents at
[NetHack](https://mazesofmenace.net/), the modern descendent of
those old games: 450,000 lines of C, representing forty-five years
of accumulated, intricate gameplay rules. My
[Mazes of Menace](https://mazesofmenace.net/) project constructs
tests by recording deterministic sessions from the original C
game to be replayed and reproduced in JavaScript. Each test
compares every random number call and every onscreen detail. Given the
same seed and the same keystrokes, every event must match, in order.
Every divergence is a bug.

This worked at first. Within two weeks the agents had a playable game
in the browser and a growing suite of test sessions. Four of nineteen
gameplay sessions matched perfectly. Fifteen more to go, and each day
the gap was closing. The trajectory felt right.

Then it stopped. And I discovered that *test and test the tests* is
necessary but not sufficient. I needed three more principles.

## The First Principle: Skepticism

For three weeks, from mid-February to early March, the number of
failing sessions refused to move. Eighteen. Sometimes seventeen! Then
eighteen again. The agents were working hard, a hundred commits a day,
thousands of lines of code. And yet the bottom line did not budge.

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
of events.  In that case, to work better, the game replay system needed
to queue certain actions and defer them across iteration boundaries
to align the tests properly.

The agents built machinery to implement this idea, orchestrating
the event queuing in a file called `replay_core.js`. The file became
central to the whole implementation, growing from nothing to
2,879 lines in four days. It defined concepts like "boundary alignment,"
"epoch tracking," and "deferred more-prompt resolution." Here is a
real commit message from the agents, explaining the AI theory:

> When a non-digit command step follows an accumulated count digit but
> there is deferred boundary RNG targeting a later step, that command
> key in C was consumed by `runmode_delay_output` mid-occupation rather
> than by `parse()`. Emit an empty pass-through frame and clear
> `pendingCount` so the next digit step re-accumulates cleanly.

Have you ever gotten a headache-inducing explanation like this from
your coding agent? Does it make you wonder if your AI knows
something that you don't?

The idea had a logic to it, an internal consistency.
It was not just a little hack. It was an entire theology.
When I asked, skeptically, *"what is a 'sparse boundary frame'?"*, the
agent responded not by probing the concept but by presenting
a whole treatise: **"Explaining sparse boundary frames,"**, with
complete authority:

> A "sparse boundary frame" is a replay step that sits on a turn
> boundary but contains very little direct signal. In this project,
> that usually means a captured step with zero or very few RNG calls,
> often only prompt/`--More--`/ack UI, while the rest of the logical
> turn's RNG/state updates appear in an adjacent step. So it's "sparse"
> in data, and a "boundary" because it splits one underlying C turn
> across neighboring captured frames.

So I sat down to read it. After trying very hard to understand what the
AI had in mind, I can tell you: there are no sparse boundary frames. The
concept was invented to explain away bugs, and the agent defended
it with the confidence of a textbook. It had created its own
religion, and it was trying to indoctrinate me into it.

[plot: replay_core.js line count: 0 to 2,879 to 211 lines]

The *actual* problem underlying many of the bugs was straightforward:
JavaScript's `async`/`await` was not wired correctly through the
codebase, so the game couldn't properly wait for user input the way
the C implementation does. The agents should have fixed the async
plumbing. Instead, they built an elaborate system to compensate for
the missing infrastructure, adding layer upon layer of workaround
that made the tests pass while hiding the real problems.

Although I had very little idea what was going on among the 200,000
lines of AI-generated code, the smell of AI hackery didn't go unnoticed
by me. Looking back in the logs, on February 18 I asked *"Why is
replay_core getting larger? It should be getting smaller over time,
not larger."* On February 20: *"I hate this. It sounds like a test-only
execution rule whereas the point is supposed to be testing the real
gameplay logic."* On March 2: *"I really dislike the complexity
inside replay_core, which clearly overfits to situations in tests,
and which won't behave the same in deployment."*

I said something like this thirty times. Each time, the agent would
agree. "You're right, we should simplify." It would start cleaning up
the code and I would turn my attention away, satisfied. Then when
I wasn't looking it would go back to adding more tangled rules
to its dogma.

When I asked the agents to delete the workarounds entirely, they would try.
They would remove the code, run the tests, see the regressions....
and instantly revert. From their perspective, the removal was destructive:
huge numbers of passing tests suddenly failed. But in reality,
those tests had been passing for the wrong reason. The regressions
that frightened the AI were real bugs, finally visible.

Getting the agents to hold steady through the regressions took
sustained coaching. I had to stand next to the code and say:
these failures are the truth. The green tests were the lie. Let
the tests fail, and use them to reveal the real problems
underneath.

On March 2 after weeks of pushing back,
we finally got async/await wired correctly across the entire
codebase, fixing 2,581 call sites in 87 files. This was the real
fix. The next day, I was able to banish the AI's made-up religion.
We got the tangled rules in `replay_core.js` reduced from over
two thousand lines to 211. The church of boundary hallucinations
was finally demolished.

And, wonderfully, the failing sessions started going green. The eighteen
failures became fourteen, ten, seven. Then three. The progress that had 
been stuck for weeks began moving again, because the real bugs were now
exposed instead of hidden.

But when we got down to the last three sessions, progress slowed to a
crawl. And the problem was that the old religion was not totally gone.
Its misguided ideas were encoded everywhere, hidden in thousands of
dark corners among 200,000 lines of complex code. Comments referenced
"boundary alignment." Display functions had vestigial epoch-tracking
logic. The agents' reasoning patterns were contaminated: if they
wanted to understand the existing code, they had to keep adopting
the old theology of boundary alignment. We could knock down
the central church that AI had built, but that was not the only
home for the bad ideas.  The meme had spread far and wide,
and it lived on in every corner of the vast codebase.

I will come back to what we did about that.

## The Second Principle: Simplify

The `replay_core` story was the dramatic case, but the underlying pattern
appeared everywhere. The agents' instinct, always, is to add code
rather than remove it.

When a test fails, the first impulse of AI is to add something that makes
it pass. When a screen doesn't match, it wants to patch up display-state
logic. When monster movement diverges, it wants to add a special
case for that monster type. Each addition tends to fix one symptom.
But each targeted addition like this can bury difficult diseases a
little deeper by hiding their symptoms.

In one case, the display layer had grown an 80-line hack that
temporarily mutated game underlying state based on screen refreshes.
*"The display layer should never know about or modify game state,"*
I said. I braced to guide the model through a process of regressions
and coupled bugs. The fallout of the cleanup? Zero test failures
across 550 sessions. The AI had invented a complex hack that had
been compensating only for itsself. The underlying problem did not exist.

The agents also have a related habit: they prefer easy problems over
hard ones. By mid-March, three specific sessions had been failing for
weeks. The agents knew exactly which ones. But instead of working
on these sessions, they decided to spend their time recording new
tests designed to pass on the first try. A huge volume of easy
tests had become the most convenient way to grow testing statistics.
And they spewed lots of documentation. Reorganized files. The dashboard
numbers kept going up. Yet the hard problems sat unsolved.

AI agents can be prompted out of this avoidance: after I prompted
them explicitly: *"I do not want you to avoid the difficult and
important work."*;  *"We give no credit for passing easy tests."*;
*"We should not fear this work."*  Their behavior was changed.

[plot: hard-seed commit percentage: 0% on Mar 17, 24% on Mar 18]

The day before my comments: zero commits on the hard sessions.
The day after: twenty-four percent. Being a hard boss was able to
lead to solving one of the three super hard sessions within the week.

Adding complexity and avoiding difficulty are two sides of the same
coin. Both produce apparent progress while leaving the real problem
untouched. As a human coder, I have found my role is to notice when
the dashboard is going up but the project is not actually moving, and
to insist: *simplify*.  And do not fear doing the hard thing to
achieve simplicity.

## The Third Principle: Design for the Machine

The most interesting discovery was what went right.

The test measurement system I built for this project has three channels.
Given the same random seed and the same keystrokes, the C game and the
JavaScript port must produce the same pseudo-random number calls, the
same gameplay events, and the same screen output, in the same order.
I call these channels PES: PRNG, Events, Screen. Every test session
records the C game's PES trace, and every test run compares the
JavaScript port's trace against it. The first divergence is the bug.

This sounds rigid, and it is. The random numbers are an incorruptible
ground truth. You cannot fudge them. You cannot add compensating logic
to make them line up. Either the 47th random number is consumed
as an `rn2(8)` within the `movedog()` step, or it is not.

But PES is also flexible in a way I did not anticipate. The Events
channel is extensible. The agents can add new event types to the C
harness and the JavaScript port, logging internal state that the
screen never shows: which monster is moving, which item is being
picked up, which branch of a conditional was taken. When a PRNG
divergence appears at step 47, the agents add events around step 47
to see what the game was doing internally at that moment. They narrow
the search. They are genuinely excellent at this. It is the debugging
task they do best.

The flexibility of the PES log turns a long-horizon problem into a
short-horizon one. Without it, the problem is "the game is wrong
somewhere in 200,000 lines of code." With it, the problem is "the
47th random number diverges, and here is the event that consumed it."
The agents can hold a short-horizon contradiction in their context
window. They can solve the puzzle in a single session. The PES log
has been the most consistently helpful tool in the entire project.

The flip side: building tools *for* agents is harder than I expected,
because agents do not think the way I do.

I have been developing a tool called Sherpa to help agents construct
test sessions. A test session is a sequence of keystrokes that
exercises some part of the game. Building a good one requires playing
NetHack interactively: exploring a dungeon, finding a monster,
navigating to it, fighting it, checking what happened. I asked agents
to build Sherpa as an interactive command-line tool. Type `rooms` to
see the rooms on the level. Type `goto fountain` to pathfind to
the nearest fountain. Type `state` to inspect the hero. It was a
beautiful, interactive tool.

And the agents did not want to use it. When directly instructed, they
could be convinced to start up sherpa and enter commands one at a time,
but they were slow and reluctant. They lost track of the game state
between commands. They made mistakes that a human user would never make,
like losing track of which room they were in and wondering what
happened.

The problem was not the tool's functionality. It was the interaction
model. Coding agents do not think interactively. They think in terms of
constructing files. They are comfortable editing a text file listing of
command codes, adding entries, truncating to a checkpoint, branching to
try an alternative. They want to see the game state timeline as a data
structure they can shape, not as a terminal they have to watch.

So now I have rebuilt Sherpa around file editing. Sessions are text
files. The agent manipulates the keystroke array, runs the engine to
see what happens, edits the array again. This approach also has some
drawbacks because the keystrokes are too opaque, providing no insight
or structure, so Sherpa is now built around a compilation model
that produces a commented keystroke array, annotating it with actual
gameplay outcomes.  This approach has been much more fruitful,
allowing the AI agent to construct more complex, difficult gameplay
sessions, and coverage numbers have started to come up. The lesson:
you cannot just hand agents a tool that would be good for humans.
You have to design tools for AI to match how they actually think.

The same principle applies in situations where an AI is much
faster and better than a human. When I started the project, I
told the agents to install git hooks that enforced a testing rule:
the entire exhaustive test suite had to run on every commit.
It sounded responsible. But it was a disaster. The suite was
human-speed slow, taking a couple minutes to run, and it got slower
as the project got bigger.  This is not bad when a commit represents a day
of work. But agents were making a lot of commits, one every few
minutes, and as the codebase grew, the agents would spend an increasing
portion of their time waiting for commit tests.  They would change some
detail in one corner of the code and wait for thousands of
slow, unrelated tests to complete, and the tests were slow enough
that they would often cause the agents to run into merge problems
due to other agents changing the code while the tests were running.
They knew it was irrelevant, so when they got frustrated with
the slowness, they would add flags to override and skip the hooks.
So at exactly the moments when testing mattered most, the project
was both blind and slow.

I have found that a better strategy is to avoid such hard rules.
Instead, I give the agents meaningful instructions: run the
relevant tests yourself, and format the results in your commit
message. I explain to them that there are two tiers of tests. Core
tests for the main engine that must be uniform and fast, and extra
tests that do infrastructure checks, end-to-end browser tests,
and anything else. The agents choose which to run based on what
they change. It is the honor system, but because they are told to
copy their test results into every commit message, their behavior
can be monitored.

Trust but verify. The agents are now fast because they are not waiting
for a gatekeeper. They have full and immediate visibility into the
impact of what they are doing. And because the results are so
consistently written into the commit messages, I can parse them
automatically to build analytics tracking project progress over time.
I can see which tests were run, what the results were, and which agents
are skipping them. The honor-system commit messages have turned out
to be faster and better at monitoring the progress of the project
than the enforced git hooks ever were.

I learned that slow testing imposes a serious cost. The new rule:
each test must test something new. Each step in a test must aim to cover
some additional functionality, some additional code path. As the
suite grows, old sessions that are subsumed by newer ones get
retired. Redundant tests are not just wasteful; they are actively
harmful, because they slow the agents down without adding information,
and slow agents cut corners.  We have to keep in mind that agents
are often committing new changes every ten minutes, so overhead
needs to be low.

## The restart

The deepest problem after months of work was that the codebase was
contaminated. No matter how quickly I got the AI agents to iterate,
they kept circling back to the old ideas.
The old "boundary alignment" religious dictates were in the comments,
in the variable names, in the architectural assumptions baked into how
the whole system worked. I could not get the agents
to stop thinking these thoughts, because these ideas were baked
into the code they read every time they started a new session.

Eventually I decided to do something that experienced software
engineers consider almost universally unwise. I threw away over
200,000 lines of code and started over.

In human software projects, starting fresh is usually a disaster. The
old code, however ugly, embodies thousands of decisions that cost real
effort to re-derive. The empty page attracts a breed of idealistic
engineer that doesn't appreciate the difficulty of the problem.
I have watched this "grass is greener" sentiment fail spectacularly
more than once at large companies.

But still, the idea was enticing for the AI project. When the agents ported
smaller games, they worked cleanly and fast. The problem with the
big project might not be their ability. It could be the accumulated
weight of wrong decisions in the codebase. And unlike a human team,
a frest start might be able to be both idealistic and wise.  We can
totally control the information diet of an AI.  We can let it start
fresh while requiring it to study the best knowledge from the
old masters. You make them study a very long prompt before they
write a single line of code.

So, before restarting the project, I spent three days extracting lessons
from the 200,000-line failed attempt. Documents summarizing hundreds
of debugging discoveries. A distillation of eighteen successful
architectural decisions. A coding conventions document to capture
details that worked. And critically, cardinal rules forbidding the patterns
that had led to the religion. The project plan started with the insight
that had been hardest to learn: get the game loop ordering right on
day one, before writing anything else. An explicit prohibition against
the dangerous boundary alignment religion was rule number one.

The new project started on March 29 with four agents. Within twelve
days, the suite hit 100% test success across thirty-five sessions covering
all the core aspects of the system. The original ran for fifty-one days
and never achieved that level of quality.

Had I succeeded in banishing the bad old ideas?  Actually, not completely.
On day two, despite my efforts, the same old religion had begun emerging
independently as agents began to construct an event reordering system to
deal with difficult problems. But this time the cardinal rules flagged it,
and we caught it in hours. An agent wrote in the project log:
*"None of this exists in C. C's actual mechanism: one integer with
three states."* Following its new guidelines, the agent was able to
self-correct, replacing the first hundred and thirty-six lines of
ideological errors with a simple fifteen-line function.

The project is still running. The suite has expanded to forty-five
sessions. Six agents collaborating: Claude, Codex, and Gemini.  They
are constructing deeper test sessions that are exposing new bugs
whose fixes cascade in unpredictable ways. The
grinding continues. But the architecture is clean, the measurement
catches regressions within minutes, and I am starting to gain
confidence that, if left unattended, the agents will not make
a holy mess of the project.

Every once in a while I see the agents push a commit with adjustments
to the test infrastructure or changes in event ordering, and I
challenge them. But now, they know what I am watching out for. They
explain that they've got it handled, that the solutions are simple
and systematic, and they are not building a tower of hacks.

Whether this port will become a complete, faithful, playable NetHack
in JavaScript remains to be seen. But the role of the programmer in
the age of AI coding has become clearer to me over these months. You
do not write the code. You do not review every line. You watch for
false religions, you simplify, you question the metrics, and you decide
when to start over.

As a human, you own the meaning of the project.
