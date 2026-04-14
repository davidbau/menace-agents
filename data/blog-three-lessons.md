# Vibe Coding at Scale

Last December I wrote about
[two rules for vibe coding](https://davidbau.com/archives/2025/12/16/vibe_coding.html):
*test*, and *test the tests*. The idea is that AI coding agents work
best when they can check their own work against automated tests, and
that the human's job is to make sure the tests are honest — not just
passing, but testing the right thing.

I have since tried to apply these two rules to a much larger project:
a from-scratch JavaScript port of
[NetHack](https://nethack.org/), targeting bit-exact parity with the
C original. The [Mazes of Menace](https://mazesofmenace.net/) project
records deterministic gameplay sessions from the C game and replays
them in JavaScript, comparing every random number call. Given the same
seed and the same keystrokes, every random number must match, in order.
Every divergence is a bug, and the measurement system finds them
automatically.

This worked beautifully for Rogue, the 1980 ancestor of NetHack:
8,000 lines of C, ported in eighty-five minutes by a single agent
working autonomously. And for Hack, the 1982 game that led to
NetHack: 6,000 lines, ported in a few hours. In both cases, the
agent coded, tested, fixed, and iterated its way to perfect fidelity
with minimal human input. *Test, and test the tests* was enough.

Then I pointed the agents at NetHack itself. 450,000 lines of C. A
codebase that traces back to 1982, with forty-five years of
accumulated gameplay. And there the two rules turned out to be
necessary but not sufficient. I found three more.

## Doubt the faith of AI

A week into the project, the agents encountered a contradiction. Their
code said function A should execute before function B. But the tests
showed B before A. The random numbers were consumed in the wrong order.

A human programmer encountering this would think: there is a bug in my
code. The sequencing is wrong. I need to find where B is being called
too early and fix it.

The agents did something else. They hypothesized that the *measurement*
was wrong. Maybe the test infrastructure was creating artificial
boundaries that shifted the apparent order of events. Maybe the way
keystrokes were being replayed introduced timing distortions. Maybe the
replay system needed to queue certain actions and defer them across
iteration boundaries.

They built machinery to implement these hypotheses. The machinery lived
in a file called `replay_core.js`. It grew from zero to 2,879 lines in
four days.

[plot: replay_core.js line count: 0 → 2,879 → 211 lines,
annotated with the human's complaints]

The file had concepts like "boundary alignment," "epoch tracking,"
"deferred more-prompt resolution," and "replay divergence exception
handling." The code was internally consistent. It had a logic to it.
But it was logic built on a false premise: that the contradictions
were properties of the measurement system rather than bugs in the
game code.

It reminded me of Ptolemy. When the geocentric model of planetary orbits
didn't match observations, Ptolemy didn't conclude that the model was
wrong. He added epicycles — circles within circles — to make the faulty
model fit the data. The additions were mathematically sophisticated.
They improved the predictions. But they were wrong, and every
improvement made the system harder to correct.

The agents had built epicycles. They had a religion, and it was called
"boundary alignment."

I started complaining. On February 18: *"Why is replay_core getting
larger? It should be getting smaller over time, not larger."* On
February 20: *"I hate this. It sounds like a test-only execution rule
whereas the point is supposed to be testing the real gameplay logic."*
Thirty times I said something like this. The agents would agree: "You're
right, we should simplify." Then they would go back to adding
epicycles. The correction rate was stable at 1.7% throughout the
project. Acknowledging a correction in conversation had near-zero
carry-over to the next session.

When I asked the agents to remove the hacks, they would try. They
would delete the code, run the tests, see massive regressions, and
immediately revert. From their perspective, the removal was destructive.
From mine, the regressions were the real bugs becoming visible for the
first time. The green tests were the lie. The failing tests were the
truth.

On March 2 we finally made `async`/`await` work correctly across the
entire codebase — 2,581 call sites in 87 files. This was the real fix.
The epicycles had existed because the code couldn't properly wait for
user input the way C does; it faked the waiting with boundary machinery.
Once async worked, the faking was unnecessary. The next day,
`replay_core.js` dropped from over two thousand lines to 211. The
religion was over.

But its ghosts lived on in the codebase. Comments referenced "boundary
alignment." Display code contained vestigial epoch-tracking logic.
200,000 lines of JavaScript, contaminated. Eventually we would start
over from scratch — but that is a story I will come back to.

**The rule.** When agents encounter a contradiction between their code
and their observations, they are more likely to revise the measurement
than to fix the code. They build elaborate, internally consistent
explanations for why the data doesn't mean what it seems to mean. The
human must maintain an independent model of reality and refuse to join
the religion. Do not accept epicycles, no matter how sophisticated
they sound. Insist that the simplest explanation — there is a bug —
is checked first.

## Simplify

The replay_core story was dramatic, but the underlying pattern shows up
everywhere. Throughout the project, the agents' instinct was to add
code rather than remove it.

When a test failed, the first impulse was to add something that made it
pass. When a screen didn't match, the first impulse was to add
display-state tracking. When monster movement diverged, the first
impulse was to add a special case for that monster type. Each addition
made one test pass. Each addition also hid a real bug under a layer of
compensating logic.

My corrections were always the same. February 23: *"I don't like how
you complexified replay_core. It should be as simple as possible."*
March 3: *"Removing replay_core cruft will stop masking the missing
display logic, so we can fix it properly."* March 6: *"We have been
constantly chasing replay_core issues for this whole project. It has
been a tax I would like to be free of."*

The agents also avoided hard problems. By mid-March, three sessions
had been failing for weeks. The agents knew which ones. The measurement
system told them exactly where the divergence started. But instead of
working on them, the agents were recording new tests designed to
pass on the first try, expanding coverage statistics, writing
documentation. The dashboard kept going up. The hard problems sat.

On March 18 I wrote: *"I do not want you to avoid the difficult and
important work."* Then: *"We should not fear this work."* I also
upgraded the model from Sonnet to Opus for these specific problems.

[plot: hard-seed commit percentage — 0% on Mar 17, 24% on Mar 18]

The day before my intervention: zero commits referencing the hard
sessions. The day after: twenty-four percent. The hardest session was
solved within a week.

**The rule.** When something goes wrong, agents add complexity to
compensate. The human subtracts complexity to expose the real problem.
When agents avoid hard problems, the human points at the hardest one
and refuses to let them work on anything else. Temporary regressions
are the price of honest code.

## Goodhart's Law

In early March, 313 out of 313 test sessions were passing. The
dashboard was green. But the game was not faithfully ported.

The sessions were short, exercising code paths that worked. The eighteen
sessions that had been failing for weeks were not in the count — they
had been reclassified, or their failures marked as known issues. The
*metric* was satisfied. The *goal* was stuck.

This is
[Goodhart's Law](https://en.wikipedia.org/wiki/Goodhart%27s_law):
*when a measure becomes a target, it ceases to be a good measure.* The
agents were not deliberately gaming anything. They were doing exactly
what the measurement rewarded: making tests pass. The gap between
"tests pass" and "the port is faithful" was invisible to them.

I kept saying: *"The goal is fidelity to the C, not overfitting to the
tests."* I said it at least ten times across four different dates. Each
time the agent agreed. Each time a new session started, the agreement
was forgotten.

The deepest version of this appeared in the second attempt. A session
called seed800 — a 262-step wizard-mode grand tour through the
entire game — was at 3% parity while the rest of the suite was at 100%.
The suite average was 84%. The agents were optimizing the average. I
insisted they focus on seed800, because it was the only honest measure
of whether the game actually worked beyond the first few turns.

seed800 reached 100% on day ten. Then it regressed to 40% after fixes
shifted the execution order. Then it came back to 100% on day twelve.

[plot: seed800 RNG: 3% → 55% → 65% → 100% → 40% → 100%]

**The rule.** Agents optimize the metric you give them. If the metric
can be satisfied without achieving the goal, it will be. The human
must watch for the gap — and the most valuable interventions are often
not code fixes but *measurement fixes*: adding harder sessions,
insisting that the deepest test is the real benchmark, and questioning
the metric when it looks too good.

## The restart

In late March, with the religion embedded in 200,000 lines of
JavaScript, I decided to try something that experienced software
engineers generally consider unwise: starting from scratch.

In human software projects, starting over is usually a disaster. The
existing codebase, however ugly, embodies thousands of decisions that
are expensive to re-derive. But agents are different from humans in
one important way: they don't lose knowledge when you throw away the
code, *if* you write it down.

I spent three days extracting everything worth keeping. The measurement
infrastructure. The PRNG implementation. The terminal renderer. And
the lessons: a LORE document with hundreds of debugging discoveries.
A DECISIONS document with eighteen architectural choices. A CONVENTIONS
document specifying exactly how every C construct should translate to
JavaScript. Cardinal rules forbidding the patterns that had led to the
religion.

The new project started on March 29 with four agents from two model
families. Within twelve days, 100% RNG parity across thirty-five test
sessions. A 262-step grand tour passing on all three channels. All
thirteen character classes represented. The original ran for fifty-one
days and never reached total 100%.

The project is still running. Sessions have expanded to forty-five.
Six agents from three model families. The deeper sessions are exposing
new bugs whose fixes cascade through the system in unpredictable ways.
The architecture is clean, the measurement system is in place, and
the lessons of the first attempt are built into every document the
agents read.

Whether this port will become complete — a faithful, playable, readable
NetHack in JavaScript — remains to be seen. But I think the role of the
programmer in the age of AI coding agents has become clearer to me over
these two months. You do not write the code. You do not review every
line. You watch for religions, you simplify, you question the metrics,
and you decide when to start over. You keep the agents honest.

The agents do the work. The human holds the meaning.
