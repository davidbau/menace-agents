# A Vibe Coding Religious Experience

Have you ever gotten the feeling that your super smart AIs might not
know what they are talking about?

This is particularly an issue after they have written 100,000 lines
of intricate computer code that you have not looked at whatsoever.

I have been vibe coding a large project for a couple months now, and
I have come to appreciate just how wrong AI agents can be while
sounding absolutely, confidently, terrifyingly right. Not wrong about
small things. Wrong about the fundamental nature of the problem they
are solving. Wrong in a way that produces thousands of lines of
sophisticated, internally consistent, totally misguided code.

Let me tell you about it.

Last December I wrote about
[two rules for vibe coding](https://davidbau.com/archives/2025/12/16/vibe_coding.html):
*test*, and *test the tests*. Have your AI agents write automated
tests so they can check their own work. Then make sure the tests are
honest. These rules work well for small projects. A single agent
ported [Rogue](https://mazesofmenace.net/rogue/), the classic 1980
dungeon game, from C to JavaScript in eighty-five minutes.
[Hack](https://mazesofmenace.net/hack/), the 6,000-line 1982 game
that became NetHack, took a few hours. *Test and test the tests* was
all they needed.

Then I pointed the agents at
[NetHack](https://mazesofmenace.net/) itself: 450,000 lines of C,
forty-five years of accumulated gameplay. The
[Mazes of Menace](https://mazesofmenace.net/) project records
deterministic sessions from the C game and replays them in JavaScript,
comparing every random number call and every onscreen detail. Given the
same seed and the same keystrokes, every random number and every
onscreen detail must match, in order. Every divergence is a bug.

This worked at first. Within two weeks the agents had a playable game
in the browser and a growing suite of test sessions. Four of nineteen
gameplay sessions matched perfectly. Fifteen more to go, and each day
the gap was closing. The trajectory felt right.

Then it stopped. And I discovered that *test and test the tests* is
necessary but not sufficient. I needed three more rules.

## Doubt the faith of AI

For three weeks, from mid-February to early March, the number of
failing sessions refused to move. Eighteen. Sometimes seventeen. Then
eighteen again. The agents were working hard, a hundred commits a day,
thousands of lines of code. But the number didn't budge.

The agents were reading the C source carefully. They understood the
sequencing: this function runs before that function, the monster moves
before the player sees the result. But when they tested the
JavaScript, the sequencing was different. The random numbers were
consumed in the wrong order.

A human programmer encountering this would think: there is a bug in my
code. The sequencing is wrong.

The agents thought something else. They hypothesized that the
*measurement* was wrong. Maybe the test infrastructure was creating
artificial boundaries that distorted the apparent order of events.
Maybe the replay system needed to queue certain actions and defer
them across iteration boundaries to align properly.

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

The code was internally consistent. It had a logic to it. It was a
theology. When I asked, skeptically, *"what is a 'sparse boundary
frame'?"*, the agent responded not by questioning the concept but by
writing a section heading: **"Explaining sparse boundary frames."**
It was teaching me its religion.

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
The next day, `replay_core.js` dropped from over two thousand lines
to 211. The church was demolished.

And then the failing sessions started falling. The eighteen became
fourteen. Then three. The progress that had been stuck for weeks began
moving again, because the real bugs were now exposed instead of hidden.

But the religion was not gone. Its ideas were encoded in 200,000 lines
of code. Comments referenced "boundary alignment." Display functions
had vestigial epoch-tracking logic. The agents' reasoning patterns
were contaminated. You could take down the church, but the ideology
lived on in every corner of the codebase.

I will come back to what we did about that.

## Simplify

The replay_core story was the dramatic case, but the underlying pattern
appeared everywhere. The agents' instinct, always, was to add code
rather than remove it.

When a test failed, the first impulse was to add something that made
it pass. When a screen didn't match, the first impulse was to add
display-state tracking. When monster movement diverged, the first
impulse was to add a special case for that monster type. Each addition
fixed one symptom. Each addition also buried the disease a little
deeper.

The human correction was always the same word: *simplify.* February
23: *"I don't like how you complexified replay_core. It should be as
simple as possible."* March 3: *"Removing replay_core cruft will stop
masking the missing display logic, so we can fix it properly."*
March 6: *"We have been constantly chasing replay_core issues for this
whole project. It has been a tax I would like to be free of."*

The agents also had a related habit: they preferred easy problems over
hard ones. By mid-March, three specific sessions had been failing for
weeks. The agents knew exactly which ones. The measurement system told
them exactly where the divergence started, down to the individual random
number call. But instead of working on these sessions, they were
recording new tests designed to pass on the first try. They were
expanding coverage statistics. Writing documentation. Reorganizing
files. The dashboard numbers kept going up. The hard problems sat.

On March 18 I wrote: *"I do not want you to avoid the difficult and
important work."* Then: *"We should not fear this work."* I also
switched the model from Sonnet to Opus for these problems, matching
the difficulty of the task to the capability of the tool.

[plot: hard-seed commit percentage: 0% on Mar 17, 24% on Mar 18]

The day before: zero commits on the hard sessions. The day after:
twenty-four percent. The hardest one was solved within a week.

Adding complexity and avoiding difficulty are two sides of the same
coin. Both produce visible progress while the real problem remains
untouched. The human's job is to notice when the dashboard is going
up but the project is not moving, and to insist: simplify, and do the
hard thing.

## Goodhart's Law

By early March, 313 of 313 test sessions were passing. The dashboard
was entirely green.

The game was not faithfully ported.

The sessions were short, exercising code paths that worked well. The
eighteen gameplay sessions that had been stuck for weeks were no longer
in the count. They had been reclassified, or their failures marked as
known issues. The metric was satisfied. The goal was stuck.

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

## The restart

Eventually I decided to do something that experienced software
engineers consider almost universally unwise. I threw away 200,000
lines of code and started over.

The codebase was contaminated. The religion's ideas were in the
comments, in the variable names, in the architectural assumptions
baked into how the display system worked. I could not get the agents
to stop thinking in epicycles because the epicycles were in the code
they read every time they started a new session.

In human software projects, starting fresh is usually a disaster. The
old code, however ugly, embodies thousands of decisions that cost real
effort to re-derive. I have watched this fail more than once at large
companies.

But I had noticed something. When the agents ported smaller games,
they worked cleanly and fast. The problem was not their ability. It was
the accumulated weight of wrong decisions in the codebase. And unlike
a human team, an agent team does not lose knowledge when you throw
away the code. You can write the knowledge down.

I spent three days extracting lessons. A LORE document with hundreds
of debugging discoveries. Eighteen architectural decisions. A
conventions document. Cardinal rules forbidding the patterns that had
led to the religion. And a project plan that started with the insight
that had been hardest to learn: get the game loop ordering right on
day one, before writing anything else.

The new project started on March 29 with four agents. Within twelve
days, the suite hit 100% parity across thirty-five sessions covering
all thirteen character classes. The original ran for fifty-one days
and never got there.

On day two of the new project, the agents had already started building
epoch and latch machinery in the display system. The same religion,
emerging independently. But this time the cardinal rules flagged it,
and we caught it in hours. An agent wrote in the project log: *"None
of this exists in C. C's actual mechanism: one integer with three
states."* Fifteen lines replaced a hundred and thirty-six.

The project is still running. The suite has expanded to forty-five
sessions. Six agents from three model families. A 262-step grand tour
through the full game passes on all three channels. Deeper sessions are
exposing new bugs whose fixes cascade in unpredictable ways. The
grinding continues. But the architecture is clean, the measurement
catches regressions within minutes, and the lessons of the first
attempt are built into every document the agents read.

Whether this port will become a complete, faithful, playable NetHack
in JavaScript remains to be seen. But the role of the programmer in
the age of AI coding has become clearer to me over these months. You
do not write the code. You do not review every line. You watch for
religions, you simplify, you question the metrics, and you decide
when to start over. You keep the agents honest.

The agents do the work. The human holds the meaning.
