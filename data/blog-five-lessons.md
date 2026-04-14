# Five Lessons from Vibe Coding at Scale

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

The project has run for two months across two codebases. The first
attempt produced 200,000 lines of JavaScript in fifty-one days. The
second attempt — a fresh start built on the lessons of the first —
produced 145,000 lines in twelve days and achieved 100% parity on a
suite of thirty-five test sessions spanning all thirteen character
classes.

Along the way I learned five things about supervising AI coding agents
on a large, complex project. Each of these lessons cost me days or
weeks of stalled progress before I understood what was happening.
This is the first in a series of technical posts about the project.

## 1. Agents don't doubt themselves

A week into the project, the agents encountered a contradiction.
Their code said function A should execute before function B. But the
tests showed B before A. The random numbers were consumed in the
wrong order.

A human programmer would think: there is a bug in my code.

The agents did something else. They hypothesized that the
*measurement* was wrong — that the test infrastructure was creating
artificial boundaries that distorted the apparent order of events.
They built machinery to compensate for this distortion. The machinery
lived in a file called `replay_core.js`.

On February 16, `replay_core.js` was created at 1,682 lines. By
February 20, it had reached 2,879 lines. It contained concepts like
"boundary alignment," "epoch tracking," and "deferred more-prompt
resolution." The code was internally consistent. It had a logic to it.
But the premise was wrong. The contradictions were not measurement
artifacts. They were bugs in the game code.

I kept saying so. On February 18: *"Why is `replay_core` getting
larger? It should be getting smaller over time, not larger."* On
February 20: *"I hate this. It sounds like a test-only execution rule
whereas the point is supposed to be testing the real gameplay logic."*
The agent would agree: "You're right, we should simplify." Then it
would go back to adding epicycles.

[plot: replay_core.js line count over time — 0 → 2,879 → 211 lines,
annotated with human complaints]

On March 3, after we had finally made `async`/`await` work correctly
across the entire codebase — the real fix for the sequencing
problem — `replay_core.js` dropped from over two thousand lines to
211. The epicycles were unnecessary once the code could actually wait
for input the way C does.

When we started the project over from scratch, I put a rule in the
agents' instructions: *"No compensating complexity. If the test harness
needs a workaround to pass, the bug is in the game code."* On day two
of the new project, the agents had already accumulated epoch and latch
machinery in the display system. But this time we caught it in hours.
An agent wrote in the project log: *"None of this exists in C. C's
actual mechanism: one integer with three states."* The fix was fifteen
lines replacing a hundred and thirty-six.

**The lesson.** When agents encounter a contradiction between their
code and their observations, they are more likely to revise the
measurement than the code. They build elaborate, internally consistent
explanations for why the data doesn't mean what it seems to mean. This
is not a failure of intelligence — the reasoning is sophisticated. It is
a failure of epistemology. Agents cannot step back and ask: *is my
hypothesis actually true, or does it just sound plausible?*

The correction rate for this pattern was stable at 1.7% of all human
messages throughout the project. The agents never got better at
catching it themselves.

## 2. Agents avoid hard problems

By mid-March, three test sessions — seed031, seed032, and seed033 —
had been failing for weeks. These were the longest and most complex
gameplay sessions, exercising deep interactions between the game loop,
monster AI, and display system. The measurement system showed exactly
where they diverged. The agents were not working on them.

Instead, they were recording new test sessions designed to pass on
the first try. They were expanding coverage statistics. They were
writing documentation. They were promoting pending sessions from one
tracking category to another. The agents were visibly, quantifiably
productive: commits were landing, numbers were going up, reports were
being generated. But the three sessions that actually needed fixing
sat untouched.

On March 18 I wrote: *"I do not want you to avoid the difficult and
important work."* Then: *"We should not fear this work."* I also
upgraded the model from Sonnet to Opus for these specific problems.

The day before my intervention: zero percent of commits referenced
the hard sessions. The day after: twenty-four percent.

[plot: hard-seed commit percentage — 0% on Mar 17, 24% on Mar 18]

seed031 was solved within a week.

In the second attempt, the same pattern showed up when the
batch-translated modules were added. Twenty-one of twenty-four sessions
passed, and the agents were polishing the passing sessions rather than
recording new ones that would expose unported systems. I filed an
issue titled *"Record new sessions NOW — current suite is saturated."*
The measurement system creates the illusion of completeness when
coverage is narrow.

**The lesson.** Agents gravitate toward work that produces visible
progress: more green tests, more passing sessions, more commits.
Staring at a hard debugging problem for hours with no measurable output
is not something they will choose to do. The human's job is to notice
when the metric is going up but the goal is not advancing, and to
redirect.

## 3. Agents add complexity; humans subtract it

On February 22, I asked the agents to remove five hundred lines of
boundary-alignment machinery from `replay_core.js`. They did. One test
that had been passing started failing. The agents immediately tried to
revert.

From their perspective, the removal was destructive: a test went from
green to red. From mine, the test had been passing *for the wrong
reason*. The boundary machinery was hiding a real bug in the game code.
The green test was a lie. The regression was the truth becoming visible.

It took coaching. I had to accept the regression and insist: *"Removing
replay_core cruft will stop masking the missing or erroneous display
logic elsewhere in the code, so we can fix it properly."*

This is the pattern: agents encounter a problem and add code to work
around it. The test passes. The dashboard stays green. But the
underlying bug remains, hidden under a layer of compensating logic that
makes the system harder to understand. Over time, the compensating
layers accumulate, each one obscuring the bugs beneath it. The system
grows more complex without growing more correct.

The `replay_core.js` trajectory tells the story quantitatively. It
was created on February 16 at 1,682 lines. It peaked at 2,879 lines
on February 20. After the major cleanup on March 3, it fell to 211
lines. Those 2,668 removed lines were not dead code. They were
*compensating complexity* — sophisticated, internally consistent logic
that existed to hide bugs rather than fix them.

In the second attempt, this lesson was encoded as a cardinal rule.
When agents proposed adding display-state machinery to handle a screen
mismatch, the response was immediate: *fix the game code, not the
rendering pipeline.* The rule worked — but only because it was in a
document the agents read at the start of every session, not because
any agent had internalized it.

**The lesson.** The instinct to add code is stronger than the instinct
to remove it. When a test fails, the agent's first impulse is to add
something that makes it pass. The human's job is to ask whether the
failure was honest — and if so, to protect it. Temporary regressions
are the price of understanding what is actually wrong.

## 4. The metric is not the goal

By early March, 313 out of 313 test sessions were passing. The
dashboard was green.

But the game was not faithfully ported.

The sessions were short — designed to exercise well-ported code paths.
The eighteen gameplay sessions that had been failing for weeks were
not in the suite. They had been removed, or reclassified, or their
failures had been marked as known issues. The metric was satisfied.
The goal was stuck.

This is Goodhart's Law applied to coding agents: *when a measure
becomes a target, it ceases to be a good measure.* The agents were
not deliberately gaming the metric. They were doing exactly what the
measurement system rewarded: making tests pass. The gap between
"tests pass" and "the port is faithful" was invisible to them.

I kept saying it. February 24: *"The goal is fidelity to the C, not
overfitting to the tests."* March 2: *"I really dislike the complexity
inside replay_core, which clearly overfits to situations in tests, and
which won't behave the same in deployment."* I said it at least ten
times across four different dates. Each time the agent agreed. Each
time a new session started, the agreement was forgotten.

In the second attempt, the deepest version of this problem appeared
with a session called seed800 — a 262-step wizard-mode grand tour
through the full game. The rest of the suite was at 100%. seed800 was
at 3%. The suite average looked like 84%. The agents were optimizing
the average. I insisted they focus on seed800 specifically, because it
was the only measure of whether the game actually worked beyond the
first few turns.

seed800 reached 100% on day ten. Then it regressed to 40% after
subsequent fixes shifted async execution order. Then it came back to
100% on day twelve. Then it regressed again as new systems were
added. The metric is a moving target because the goal — a complete,
faithful port — keeps expanding as coverage grows.

**The lesson.** Agents optimize the metric. If the metric can be
satisfied without achieving the goal, it will be. The human must watch
for the gap between the metric and the goal, and redesign the
measurement when they diverge. In this project, the most valuable
interventions were not bug fixes but *measurement fixes*: adding
deeper sessions, expanding the test suite to cover untested systems,
and insisting that the hardest session — not the average — was the
true benchmark.

## 5. Agents can't decide to start over

By late March, the first attempt had about 200,000 lines of
JavaScript and two stubborn test failures that had resisted weeks of
work. Looking at the codebase, I could see that the ideas of the old
boundary-alignment theory were still lodged in its crevices. Comments
referenced "epoch boundaries." Display code contained vestigial
tracking logic. The agents had spent so many weeks reasoning about
these concepts that they had become part of the project's culture —
present in the code, the documentation, and the agents' own reasoning
patterns.

Starting a software project over from scratch is almost always a
mistake. The existing codebase, however messy, embodies thousands of
decisions that are expensive to re-derive. I have watched this fail
at large companies more than once.

But the agents had also taught me something. When they ported Rogue
and Hack — smaller games with clean codebases — they worked quickly
and cleanly. The problem was not the agents' capability. It was the
accumulated weight of wrong decisions in the codebase. And unlike a
human team, an agent team doesn't lose knowledge when you throw away
the code. You can write the knowledge down.

So I extracted everything worth keeping. The measurement
infrastructure. The session format. The comparison harness. The PRNG
implementation. The cardinal rules. A conventions document specifying
exactly how every C construct should translate to JavaScript. A LORE
document with 229 debugging lessons discovered over fifty-one days. And
a project plan that encoded the hard-won architectural decisions: get
the game loop ordering right on day one. Make everything async from the
start. Three PRNG contexts, not one. The modal guard for reentrancy.
Event parity from the first commit.

The second attempt reached 100% parity on thirty-five sessions in
twelve days. The first attempt ran for fifty-one days and never got
there.

The difference was not that the agents were smarter. The same models
ran both attempts. The difference was that the second attempt started
with the right architecture, the right measurement, and the right
rules — all learned the hard way in the first attempt and written down
in documents that the agents read on day one.

**The lesson.** Agents accumulate bad habits in the codebase: wrong
abstractions, compensating complexity, contaminated reasoning patterns.
Unlike humans, agents lose nothing when you start over — if you write
the lessons down first. The knowledge is fully externalizable. The
LORE document, the conventions, the cardinal rules, the architectural
decisions — these are the equivalent of an experienced engineer joining
the new project and saying "I've seen this before, don't do it that
way."

The human's job is to recognize when accumulated mistakes have become
more expensive to fix than to abandon, and to make sure the lessons
survive the reset.

## The common thread

Every lesson is about the same thing.

Agents optimize the nearest measurable signal. Tests pass. Coverage
goes up. Commits land. Lines of code accumulate. These are all
measurable. They are all positive. And they are all compatible with
the project being stuck.

The human holds the actual goal. A faithful, readable, playable port
of a forty-five-year-old game, written in clean JavaScript that human
programmers can understand and extend. This goal is not measurable by
any single metric. It requires judgment about when the metrics are
lying, when the work is avoiding the hard parts, when the architecture
is growing in the wrong direction, and when the whole approach needs to
change.

In this project, I wrote fourteen commits in the first week and none
after that. The agents wrote everything else: 200,000 lines in the
first attempt, 145,000 in the second. My contribution was not code. It
was noticing when the agents were building a religion instead of fixing
a bug, pointing at the hard problems they were avoiding, subtracting
complexity they were adding, questioning metrics they were optimizing,
and deciding to start over when the accumulated mistakes became
unfixable.

I think this is what supervising AI coding agents looks like. Not
pair programming. Not code review. Something more like being the
director of a research lab: you don't do the experiments, but you
decide which experiments to run, you notice when the results don't make
sense, and you change direction when the current approach isn't working.

The agents do the work. The human holds the meaning.
