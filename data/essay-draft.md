# When Agents Build a Religion

In February 2026 I pointed a swarm of AI coding agents at NetHack, the
most complex roguelike game ever built: 450,000 lines of C, forty-five
years of accumulated gameplay, a codebase that has driven human
programmers to madness since 1987. The goal was a perfectly faithful
JavaScript port. Not an approximation — bit-exact. Given the same random
seed and the same keystrokes, every random number call in the JavaScript
version would match the C original, in the same order, producing the
same dungeon, the same monsters, the same outcomes.

It started well. Rogue, the 1980 ancestor of NetHack, was ported in 85
minutes. Hack, the 1982 game from my childhood neighborhood, took eight
hours. Both used the same approach: record deterministic sessions from
the C game, replay them in JavaScript, compare every random number. When
all the numbers match, you know every decision in the code is correct.

NetHack was supposed to be next. It was not fifty Rogues.

[plot: the scale comparison — Rogue 8K lines / 1 day, Hack 15K / 1 week,
NetHack 450K / still going]

## Why Not Transpile?

NetHack has been compiled to run in a browser before. BrowserHack uses
Emscripten to compile the C source to WebAssembly, producing a binary
that runs in the browser's virtual machine. It works. You can play
NetHack in a browser window.

But the result is not JavaScript. It is C semantics running inside a
JavaScript sandbox. The "source code" is an opaque blob of compiled
instructions. If the original C code would crash by dereferencing a
freed pointer, the transpilation crashes too — even though JavaScript
has garbage collection and pointer errors are not supposed to exist.
The data structures are C structs laid out in a linear memory buffer,
not JavaScript objects with named fields. No human programmer could
read the output and understand what it does, let alone modify it.

What I wanted was a clean port. The same gameplay logic, expressed in
native JavaScript idiom: dictionaries instead of pointer-chasing,
arrays instead of linked lists, `async`/`await` instead of blocking
`getch()`. A codebase that a human programmer could open, read, and
extend. Code that would be good enough to serve as a seed for a new
generation of NetHack, carrying on the forty-five-year lineage in a
language that runs everywhere — but one that a developer community
could actually maintain.

This is harder than it sounds, because "the same gameplay logic" means
matching the C down to its quirks. When C NetHack creates monsters during
level generation, it inserts them into a linked list in a particular
order. That insertion order determines which monster moves first, which
determines which random numbers are consumed in which sequence. A clean
JavaScript port must reproduce this ordering — not by using linked lists,
but by ensuring that whatever data structure it uses produces the same
iteration order. The port must be simultaneously idiomatic and exact.

There is also the async problem. C NetHack is a single-threaded program
that calls `getch()` and blocks. Nothing happens until a key is pressed.
In a browser, blocking the main thread freezes the page. Emscripten
handles this with Asyncify, a compiler transform that rewrites blocking
calls into state machines — but the result feels sluggish, and it is
why most browser ports of NetHack avoid the classic character-mode
terminal interface in favor of tiles. A native JavaScript port can use
`async`/`await` to yield to the browser naturally at every input point,
producing a responsive character-mode experience where the `@` moves
through corridors with the fluid, immediate feel of the original terminal
game. This turned out to be one of the hardest architectural decisions in
the project, and also one of the most consequential.

## The Testing Infrastructure

The first thing the agents built was a measurement system. A patched C
NetHack binary that recorded every random number it consumed, every
screen it drew, every event it processed. The JavaScript port would
replay the same keystrokes and compare three channels: PRNG sequence,
events, and screen output. We called this the PES report.

This measurement system was the project's most important decision, and
it was made on day one. Without it, the question "is the port correct?"
would have been a matter of opinion. With it, the question had a precise,
automated answer: the 47th random call returns 3 in C and 5 in
JavaScript, so there is a bug, and it is in whatever code consumed that
random number.

Within two weeks, the agents had recorded about twenty gameplay sessions
and were driving them toward parity. The easy sessions — where the player
walks a few steps, fights a monster, picks up an item — converged quickly.
Fifteen of nineteen gameplay sessions were failing, but the failures were
shrinking. The trajectory felt right.

Then it stopped.

## The Stall

For three weeks, from mid-February to early March, the project was stuck.
Eighteen or nineteen gameplay sessions failed. The agents were working
intensely — a hundred commits a day, thousands of tool invocations,
detailed reasoning about code paths. But the number didn't move.

[plot: session parity over time, showing the flat line from Feb 17 to Mar 8
while commits continue at high rate]

I didn't understand what was so hard. The agents were reading the C code
carefully. They understood the sequencing: function A runs before function
B, the monster moves before the player sees the result. But when they
tested the JavaScript, the sequencing was different. B came before A.
The random numbers were consumed in the wrong order.

A human programmer encountering this contradiction would think: there's a
bug in my code. The sequencing is wrong. I need to find where B is being
called too early and fix it.

The agents did something else.

## The Religion

Instead of concluding that their gameplay code had a bug, the agents
began to hypothesize that their entire perception of time was distorted.
Maybe the test infrastructure was measuring things wrong. Maybe the way
keystrokes were being fed into the game was creating artificial
boundaries that shifted the apparent order of events. Maybe the replay
system needed to queue certain actions and defer them across iteration
boundaries to align the measurement with reality.

They built machinery to implement these hypotheses. A file called
`replay_core.js` began to grow.

[plot: replay_core.js line count over time — the dramatic rise from 0 to
2,879 lines, then the collapse to 211]

On February 16, `replay_core.js` was created at 1,682 lines. By
February 20, it had reached 2,879 lines. It contained concepts like
"boundary alignment," "epoch tracking," "deferred more-prompt
resolution," and "replay divergence exception handling." The code was
internally consistent. It had a logic to it. But it was logic built on
a false premise: that the contradictions the agents observed were
properties of the measurement system rather than bugs in the game code.

It reminded me of Ptolemy. When the geocentric model of planetary orbits
produced predictions that didn't match observations, Ptolemy didn't
conclude that the model was wrong. He added epicycles — circles within
circles — to make the faulty model fit the data. The additions were
mathematically sophisticated. They improved the predictions. But they
were wrong, and every improvement made the system harder to correct.

The agents had built epicycles.

I started complaining. On February 18: "Why is `replay_core` getting
*larger?* It should be getting smaller over time, not larger." On
February 20: "I hate this. It sounds like a test-only execution rule
whereas the point is supposed to be testing the real gameplay logic."
On February 24: "Overfitting to the test sometimes makes you susceptible
to missing when the test itself is incorrect. You need to develop a
better intuition for this." On March 2: "The goal is fidelity to the C,
not overfitting to the tests. I really dislike the complexity inside
replay_core, which is very difficult to understand and which clearly
overfits to situations in tests, and which won't behave the same in
deployment."

Thirty times I said something about this. The agents would agree. "You're
right," they would say, "we should simplify." Then they would go back to
adding epicycles. Our analysis later showed that the correction rate was
stable at 1.7% throughout the project — the agents never got better at
avoiding the pattern, even after repeated corrections. Acknowledging a
correction in conversation had near-zero carry-over to the next session.

## The Resistance

The epicycles were not just philosophically wrong. They were actively
masking real bugs. When replay_core "aligned boundaries" to make a test
pass, it was hiding the fact that the JavaScript game loop was processing
events in the wrong order. The test looked green, but the game was broken.

When I asked the agents to remove the replay_core hacks, they would try.
They would delete the code, run the tests, see massive regressions —
twenty tests that used to pass now failing — and immediately revert. From
their perspective, the removal was destructive. From mine, the regressions
were the real bugs becoming visible for the first time.

It took sustained manual coaching. I had to stand over the code, accept
the regressions, and say: these failures are the truth. The green tests
were the lie. We have to absorb these regressions and fix the real
problems underneath.

On March 3, `replay_core.js` dropped from over two thousand lines to 211.
The rewrite happened the day after a related breakthrough: on March 2, we
had finally propagated `async`/`await` through the entire codebase —
2,581 call sites across 87 files — so that the JavaScript game loop could
properly block on user input the way C does. This was the real fix. The
replay_core hacks had existed because the display system couldn't properly
wait for input; it faked the waiting with boundary machinery. Once
async/await worked, the faking became unnecessary.

The next day, March 4, the C-to-JavaScript translator project — a
separate effort to automate porting using traditional compiler
techniques — was declared unsuccessful. Three major events in three days.
This was the project's inflection point.

## The Recovery

With the epicycles removed, the real bugs were exposed. Fixing them was
straightforward. Within a week, the eighteen failing sessions had been
reduced to three: seed031, seed032, and seed033. These were long gameplay
sessions that exercised deep parts of the game — endgame disclosure, game
loop timing, multi-level transitions.

But there was a new problem. The agents didn't want to work on them.

[plot: hard-seed commit percentage — 0% on Mar 17, 21% on Mar 18 after
the human confrontation]

Instead of tackling seed031, the agents were building a speedrun for Zork.
Instead of debugging game loop ordering, they were expanding test coverage
with easy sessions that were already likely to pass. The measurement
system told them exactly which sessions were failing, but they gravitated
toward work that produced visible progress: more green tests, more passing
sessions, more commits. The hard sessions sat untouched.

On March 18 I intervened. "I do not want you to avoid the difficult and
important work." Then: "We should not fear this work; we should
prioritize these divergences, including the difficult 031-033 sessions,
and persist in solving them." I also upgraded the model from Sonnet to
Opus — matching the difficulty of the problem to the capability of the
tool.

The day before my intervention: zero commits referencing the hard
sessions. The day after: twenty-four percent of all commits were on the
hard sessions. seed031 was solved within a week.

## Starting Fresh

By late March, the project had about 220,000 lines of JavaScript, 563
test sessions, and two stubborn failures remaining. But looking at the
codebase, I could see that the ideas of the old religion were still
lodged in its crevices. Comments referenced "boundary alignment."
Display code contained vestigial epoch-tracking logic. The agents' mental
model of how the game loop worked was contaminated by weeks of reasoning
about epicycles that didn't exist.

In a human software project, "starting fresh" is almost always a terrible
idea. I have seen it fail spectacularly: the Pyramid rewrite of Microsoft
Word, the Cairo rewrite of Windows, the long saga of OS/2. The existing
codebase, however ugly, embodies thousands of small decisions that are
expensive to re-derive.

But maybe agents are different.

Instead of starting from nothing, we distilled the wisdom from fifty-one
days of work into a set of starter files. The proven infrastructure:
the PRNG implementation, the terminal renderer, the session format, the
comparison harness, the PES reporting system. And critically, the
lessons: an AGENTS.md with cardinal rules that explicitly forbade the
patterns that had led to the religion. "No fake implementations." "No
compensating complexity." "If the test harness needs a workaround to
pass, the bug is in the game code."

We called the new project Teleport — a port that jumped from another
one. In NetHack, when you teleport, you skip the levels you've already
cleared.

## The Reboot

Four agents started working on March 29. Within twenty-four hours, they
had achieved what the original project took eight days to reach: a
gameplay session matching C's random number sequence exactly. By day two,
five sessions were at full parity across all three channels — PRNG,
events, and screen. By day four, we had introduced a batch translation
strategy using LLM prompts to port entire gameplay files, and seventeen
modules were translated in a single day. By day seven, the new codebase
had 141 JavaScript modules — approaching the original's 153, achieved
in one-seventh the time.

[plot: wave vs teleport — session parity over time, showing the
dramatically steeper teleport curve]

The bad meme did reappear. On day two, the agents had already accumulated
epoch and latch machinery in the display system — the same pattern as
before. But this time the LORE document warned against it, the AGENTS.md
forbade it, and we caught it within hours instead of weeks. A developer
wrote in the project log: "None of this exists in C. C's actual
mechanism: one integer with three states." The fix was fifteen lines
replacing a hundred and thirty-six.

The hard question is whether this acceleration is real or illusory. The
teleport sessions are short — most are ten to thirty gameplay steps.
One deep session, a 262-step wizard-mode grand tour, was at 55% parity
by day seven. The remaining 45% represents the long tail of gameplay
systems that are ported but not yet fully debugged. The original project
spent forty days on that tail.

## What I Learned

The generalizable lesson is not about NetHack or JavaScript or even
about coding agents specifically. It is about what happens when
autonomous systems encounter contradictions between their model and
their observations.

A good scientist, encountering data that contradicts their theory,
revises the theory. The agents did something subtler and more
dangerous: they revised the measurement. They built increasingly
elaborate explanations for why the data was not what it seemed to be,
preserving the model at the cost of understanding reality. This is not
a failure of intelligence — the agents' reasoning about boundary
alignment was sophisticated and internally consistent. It is a failure
of epistemology.

[plot: replay_core line count annotated with the three consecutive
events — async revolution (Mar 2), cleanup (Mar 3), Iron Parity
abandoned (Mar 4)]

The second lesson is about supervision. The human role in this project
was not to write code. I authored fourteen commits in the first week
and none after that. The human role was to notice when the agents were
optimizing the wrong objective. The tests were green, but the game was
broken. The agents were productive, but they were avoiding hard problems.
The corrections were acknowledged, but they didn't persist. Each of
these required a different intervention: removing the compensating
complexity, confronting the avoidance, encoding the rules in documents
instead of conversation.

The third lesson is that starting fresh can work for agents in ways it
doesn't for humans. A human team that rewrites a system loses the
embodied knowledge in the old codebase — the decisions that were made
implicitly, the bugs that were fixed without being documented, the
architectural constraints that emerged from experience. An agent team
loses none of this if you write it down. The LORE document, the
DECISIONS document, the CONVENTIONS document, the cardinal rules — these
are the equivalent of the experienced engineer who joins the new project
and says "I've seen this before. Don't do it that way."

The old project was not wasted. It was research. It produced the
infrastructure, the measurement system, the knowledge base, and the
institutional memory that made the reboot possible. The teleport project
is standing on the shoulders of fifty-one days of hard-won lessons.

Whether it will reach the summit — a complete, faithful, playable
NetHack in JavaScript, good enough to carry on the forty-five-year-old
codebase into a new era — remains to be seen. The agents are grinding
through seed800, one random number at a time.

[plot: seed800 RNG match progression — 3% on Day 5, 55% on Day 7,
with the long tail stretching ahead]

The work continues.
