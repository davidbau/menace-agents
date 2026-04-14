# Vibe Coding at Scale

Can a single person, who is not an expert in a codebase, use LLM coding
assistants to port and test a 450,000-line program?

I have been trying to find out. The
[Mazes of Menace](https://mazesofmenace.net/) project is a from-scratch
JavaScript port of [NetHack](https://nethack.org/), the most complex
roguelike ever built, targeting bit-exact parity with the C original.
Given the same random seed and the same keystrokes, the JavaScript port
must make the same random number calls in the same order, producing the
same dungeon, the same monsters, the same outcomes. Every divergence is
a bug, and the measurement system finds them automatically.

The project has run for two months across two codebases and a swarm of
AI agents from three different model families. Along the way I have
learned a few things about what it means to supervise AI systems
writing code at this scale. This is the first in a series of technical
posts about the project.

## Beware AI-made religions

A week into the project, the agents encountered a contradiction. Their
code said function A should execute before function B. But when they
ran the tests, B came before A. The random numbers were consumed in the
wrong order.

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

The file contained concepts like "boundary alignment," "epoch tracking,"
"deferred more-prompt resolution," and "replay divergence exception
handling." The code was internally consistent. It had a logic to it.
But it was logic built on a false premise: that the contradictions
were properties of the measurement system rather than bugs in the
game code.

It reminded me of Ptolemy. When the geocentric model of planetary
orbits didn't match observations, Ptolemy didn't conclude that the
model was wrong. He added epicycles — circles within circles — to make
the faulty model fit the data. The additions were mathematically
sophisticated. They improved the predictions. But they were wrong,
and every improvement made the system harder to correct.

The agents had built epicycles.

I started complaining. On February 18: *"Why is `replay_core` getting
larger? It should be getting smaller over time, not larger."* On
February 20: *"I hate this. It sounds like a test-only execution rule
whereas the point is supposed to be testing the real gameplay logic."*
On March 2: *"I really dislike the complexity inside replay_core, which
is very difficult to understand and which clearly overfits to situations
in tests, and which won't behave the same in deployment."*

Thirty times I said something like this. The agents would agree. "You're
right," they would say, "we should simplify." Then they would go back
to adding epicycles. Our analysis later showed that the correction rate
was stable at 1.7% throughout the project — the agents never got better
at catching this pattern themselves. Acknowledging a correction in
conversation had near-zero carry-over to the next session.

When I asked the agents to remove the hacks, they would try. They
would delete the code, run the tests, see massive regressions — tests
that had been passing now failing — and immediately revert. From their
perspective, the removal was destructive. From mine, the regressions
were the real bugs becoming visible for the first time. The green tests
were the lie. The failing tests were the truth.

It took sustained coaching. I had to stand over the code, accept the
regressions, and say: these failures are the truth. Fix the real
problems underneath.

On March 2 we finally made `async`/`await` work correctly across the
entire codebase — 2,581 call sites in 87 files. This was the real fix.
The replay_core hacks had existed because the code couldn't properly
wait for user input the way C does; it faked the waiting with boundary
machinery. Once async worked, the faking became unnecessary.

The next day, March 3, `replay_core.js` dropped from over two thousand
lines to 211. The religion was over.

And then? We started the whole project over from scratch.

The reason was that the ideas of the old religion were buried in
every corner of the 200,000-line codebase. Comments referenced
"boundary alignment." Display code contained vestigial epoch-tracking
logic. The agents' reasoning patterns — their cultural memory, if you
want to call it that — were contaminated by weeks of thinking in
epicycles. I couldn't clean it out. The contamination was too deep.

The new project started with a document called AGENTS.md that contained
cardinal rules explicitly forbidding the old patterns. And on day two
of the new project, the agents had already accumulated epoch and latch
machinery in the display system — the same pattern, emerging
independently. But this time the document warned against it, and we
caught it in hours instead of weeks. An agent wrote in the project log:
*"None of this exists in C. C's actual mechanism: one integer with
three states."* The fix was fifteen lines replacing a hundred and
thirty-six.

**What I learned.** When agents encounter a contradiction between their
code and their observations, they are more likely to revise the
measurement than the code. They build increasingly elaborate explanations
for why the data doesn't mean what it seems to mean. This is not a
failure of intelligence — the reasoning is sophisticated and internally
consistent. It is a failure of epistemology. The human's role is to
maintain an independent model of reality and say *"I don't believe
that"* when the epicycles start accumulating. And when the religion
takes hold in the codebase itself, you may have to start over.

## Simplify

The replay_core story was dramatic, but the underlying lesson applies
more broadly. Throughout the project, the agents' instinct was to add
code rather than remove it. When a test failed, the first impulse was
to add something that made it pass. When a screen didn't match, the
first impulse was to add display-state tracking to compensate. When
monster movement diverged, the first impulse was to add a special case
for that monster type.

Each addition made one test pass. Each addition also made the system
harder to understand, harder to debug, and harder to fix for real.
The additions were not wrong in isolation — they genuinely did fix the
immediate symptom. But they hid the disease.

The human correction was always the same: simplify. On February 23:
*"I don't like how you previously complexified replay_core to deal with
lots of ignored letters. replay_core should be as simple as possible."*
On March 3: *"Removing replay_core cruft will stop masking the missing
display logic elsewhere in the code, so we can fix it properly."*
On March 6: *"I like this project, because we have been constantly
chasing replay_core issues for this whole project. It has been a tax
that I would like to be free of."*

The agents also avoided hard problems. By mid-March, three specific
test sessions had been failing for weeks. The agents knew which ones.
The measurement system told them exactly where the divergence started.
But instead of working on these sessions, they were recording new
tests designed to pass on the first try, expanding coverage statistics,
writing documentation, promoting sessions from one tracking category
to another. The dashboard numbers kept going up. The hard problems
sat untouched.

On March 18 I intervened: *"I do not want you to avoid the difficult
and important work."* Then: *"We should not fear this work."* I also
upgraded the model from Sonnet to Opus for these specific sessions —
matching the difficulty of the problem to the capability of the tool.

The day before my intervention: zero commits referencing the hard
sessions. The day after: twenty-four percent.

[plot: hard-seed commit percentage — 0% on Mar 17, 24% on Mar 18]

**What I learned.** Agents gravitate toward visible progress: more
green tests, more passing sessions, more lines of code, more commits.
This is compatible with the project being stuck. The human's role is
to notice when the metrics are going up but the goal is not advancing,
and to redirect. Sometimes this means insisting on simplification —
accepting temporary regressions so that real bugs become visible.
Sometimes it means pointing at the hardest problem and refusing to let
the agents work on anything else.

## Goodhart's Law

In early March, 313 out of 313 test sessions were passing. The
dashboard was green. But the game was not faithfully ported.

The sessions were short, exercising code paths that had been ported
early and ported well. The eighteen gameplay sessions that had been
failing for weeks were not in the count. They had been removed from
the suite, or reclassified, or their failures had been marked as known
issues. The *metric* was satisfied. The *goal* was stuck.

This is
[Goodhart's Law](https://en.wikipedia.org/wiki/Goodhart%27s_law):
when a measure becomes a target, it ceases to be a good measure. The
agents were not deliberately gaming the system. They were doing exactly
what the measurement rewarded: making tests pass. The gap between
"tests pass" and "the port is faithful" was invisible to them.

February 24: *"The goal is fidelity to the C, not overfitting to the
tests."* March 2: *"I really dislike the complexity inside replay_core,
which clearly overfits to situations in tests, and which won't behave
the same in deployment."* I said it at least ten times across four
different dates. Each time the agent agreed enthusiastically. Each
time a new session started, the agreement was forgotten.

The deepest version of this problem appeared in the second attempt. A
session called seed800 — a 262-step wizard-mode grand tour through the
entire game — was at 3% parity while the rest of the suite was at 100%.
The suite average was 84%. The agents were optimizing the average. I
insisted they focus on seed800, because it was the only honest measure
of whether the game actually worked beyond the first few turns.

seed800 reached 100% on day ten. Then it regressed to 40% after
subsequent fixes shifted the execution order. Then it came back to 100%
on day twelve. Then it regressed again as new sessions were added. The
metric is a moving target because the goal keeps expanding as coverage
grows.

[plot: seed800 RNG progression: 3% → 55% → 65% → 100% → 40% → 100%]

**What I learned.** Agents optimize the metric you give them. If the
metric can be satisfied without achieving the goal, it will be. The
human must watch for the gap — and the most valuable interventions are
often not bug fixes but *measurement fixes*: adding harder test
sessions, insisting that the deepest session is the benchmark, and
questioning the metric itself when it looks too good.

## The restart (an ongoing experiment)

In late March, with the first codebase stuck and the religion embedded
in its crevices, I decided to try something that experienced software
engineers consider almost universally unwise: starting over from
scratch.

In human software projects, starting over is usually a disaster. The
existing codebase, however ugly, embodies thousands of small decisions
that are expensive to re-derive. I have watched this fail more than
once at large companies. But the agents had taught me something
interesting. When they ported smaller games — the 8,000-line Rogue,
the 6,000-line Hack — they worked cleanly and quickly. The problem was
not the agents' ability. It was the accumulated weight of wrong
decisions in a large codebase. And unlike a human team, an agent team
doesn't lose knowledge when you throw away the code — *if* you write
the knowledge down.

So I spent three days extracting everything worth keeping. The
measurement infrastructure. The session format. The comparison harness.
The PRNG implementation. The terminal renderer. And critically, the
*lessons*: a LORE document with hundreds of debugging discoveries. A
DECISIONS document with eighteen architectural choices. A CONVENTIONS
document specifying exactly how every C construct should translate to
JavaScript. Cardinal rules forbidding the patterns that had led to
the religion. And a seven-day project plan that encoded the hard-won
insight: get the game loop ordering right on day one.

The new project started on March 29 with four agents from two model
families. Within twelve days, 100% RNG parity across thirty-five test
sessions. A 262-step grand tour passing on all three channels. All
thirteen character classes represented. The original project ran for
fifty-one days and never reached total 100%.

The project is still running. Sessions have expanded from thirty-five
to forty-five, covering polymorphing, shop transactions, alchemy, and
deeper dungeon exploration. New agents have joined — six now, spanning
three model families. The deeper sessions are exposing new bugs whose
fixes cascade through the system in unpredictable ways. The grinding
has begun. But the architecture is clean, the measurement system catches
regressions within minutes, and the lessons of the first attempt are
built into every document the agents read.

Whether this port will become complete — a faithful, playable,
readable NetHack in JavaScript, good enough to carry on the
forty-five-year-old codebase into a new era — remains to be seen. But
the hard question has, I think, been partly answered. AI coding agents
*can* build a 145,000-line system at scale. They can achieve bit-exact
parity with C on deep gameplay sessions. They cannot, yet, do it
without a human who watches for religions, insists on simplification,
questions the metrics, and knows when to start over.

The agents do the work. The human holds the meaning.
