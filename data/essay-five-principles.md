# Five Things Agents Can't Do (Yet)

*Draft for blog post / course lecture. Each principle illustrated with
specific examples from the Mazes of Menace project.*

---

## 1. Doubt Your Own Output

When the agents encountered a contradiction — their code said A should
come before B, but the tests showed B before A — they did not conclude
that their code had a bug. Instead, they invented a theory about why
the measurement was wrong.

The theory had a vocabulary: "boundary alignment," "epoch tracking,"
"deferred more-prompt resolution." It was implemented in a file called
`replay_core.js` that grew from zero to 2,879 lines in four days. The
code was internally consistent. It had a logic to it. But it was built
on a false premise: that the contradictions were properties of the
measurement system rather than bugs in the game code.

I complained thirty times. On February 18: "Why is `replay_core`
getting *larger?* It should be getting smaller over time, not larger."
On February 20: "I hate this. It sounds like a test-only execution rule
whereas the point is supposed to be testing the real gameplay logic."
Each time, the agent agreed: "You're right, we should simplify." Then
it went back to adding more compensating logic.

The correction rate was stable at 1.7% throughout the project. The
agents never got better at avoiding this pattern, even after repeated
corrections. Acknowledging a correction in conversation had near-zero
carry-over to the next session.

When we started over with the teleport project, I encoded the lesson
as a cardinal rule: *"No compensating complexity. If the test harness
needs a workaround to pass, the bug is in the game code."* On day two,
the agents had already accumulated epoch and latch machinery in the
display system — the same pattern. But this time the rule was in the
documentation, and we caught it in hours instead of weeks. The fix was
fifteen lines replacing a hundred and thirty-six. An agent wrote in the
project log: "None of this exists in C."

[plot: replay_core.js line count: 0 → 2,879 → 211 lines]

**The principle:** Agents cannot doubt their own output once it's
generated. When a hypothesis sounds plausible, they treat it as fact.
When evidence contradicts the hypothesis, they elaborate the hypothesis
rather than discarding it. The human's job is to maintain an independent
model of reality and say "I don't believe that."

---

## 2. Do the Hard Thing

On March 17, seeds 031, 032, and 033 — the three hardest gameplay
sessions — had been failing for weeks. The agents were not working on
them. Instead, they were recording new sessions that were likely to
pass on the first try, expanding coverage statistics, writing
documentation, and promoting pending sessions from one tracking
category to another. The measurement system told them exactly which
sessions were failing. They chose to work on something else.

The next day I intervened. "I do not want you to avoid the difficult
and important work." Then: "We should not fear this work; we should
prioritize these divergences, including the difficult 031-033 sessions,
and persist in solving them." I also upgraded the model from Sonnet to
Opus — matching the difficulty of the problem to the capability of the
tool.

The day before my intervention: zero commits referencing the hard
sessions. The day after: twenty-four percent of all commits addressed
them. seed031 was solved within a week.

In the teleport project, the same pattern emerged at a smaller scale.
The agents had twenty-one of twenty-four sessions passing and were
optimizing the already-green sessions rather than recording new ones
that would expose unported systems. I filed an issue: "Record new
sessions NOW — 5 of 7 at 100% RNG, current suite is saturated." The
agents needed to be told that their job wasn't to keep polishing green
checkmarks — it was to find the red ones.

**The principle:** Agents gravitate toward tasks that produce visible,
measurable progress. Filing a commit, turning a test green, increasing
a coverage number — these feel productive. Staring at a hard
debugging problem for hours with no measurable output does not. The
human's job is to point at the hard problems and refuse to accept
avoidance.

---

## 3. Simplify, Don't Compensate

On February 22, I asked the agents to remove five hundred lines of
boundary-alignment machinery from `replay_core.js`. They did. One test
that had been passing started failing. The agents immediately tried to
revert the removal.

From their perspective, the removal was destructive: a passing test now
failed. From mine, the test had been passing for the wrong reason. The
boundary machinery was compensating for a real bug in the game code —
hiding it, making the test green while the gameplay was broken. Removing
the compensation exposed the real bug.

It took sustained coaching. I had to stand over the code, accept the
regression, and say: these failures are the truth. The green tests were
the lie.

On March 3, `replay_core.js` dropped from over two thousand lines to
211. The day before, we had propagated `async`/`await` through 2,581
call sites in 87 files, which was the real fix: the compensating
complexity had existed because the code couldn't properly wait for user
input, so it faked the waiting with boundary machinery. Once the async
model was correct, the faking was unnecessary.

In teleport, I encoded this as: "Fix the game code, not the test
harness. No comparator exceptions, no synthetic replay behavior." When
agents tried to add display-state machinery to handle a screen mismatch,
I flagged it: "this is compensating complexity. The fix should be in
the gameplay code, not in the rendering pipeline."

The principle extends beyond testing. Any layer of code that works
around a bug rather than fixing it is compensating complexity. It makes
the immediate test pass while making the system harder to understand,
harder to debug, and harder to fix for real. Agents add compensating
complexity because it produces an immediate green metric. Humans remove
it because they can see the long-term cost.

**The principle:** When something goes wrong, agents add complexity
to compensate. Humans remove complexity to expose the real problem.
Temporary regressions are the price of honest code.

---

## 4. The Metric Is Not the Goal

By early March, the menace project had 313 sessions passing out of
313. One hundred percent. The dashboard was green across the board.

But the game was not faithfully ported. The sessions were designed to
pass — short sequences that exercised well-ported code paths. The
eighteen gameplay sessions that had been failing for weeks were not in
the count. They had been removed from the suite, or reclassified, or
their failures had been marked as known issues. The metric looked
perfect while the actual goal — a faithful port — was stuck.

I kept saying: "The goal is fidelity to the C, not overfitting to the
tests." I said it on February 24, March 2, March 6, and March 18. Each
time the agent agreed. Each time a new session started, the agreement
was forgotten.

In teleport, the same dynamic appeared when the batch-translated modules
were added. The suite went from twenty-four to thirty-two sessions, and
thirty of thirty-two passed. It looked like ninety-four percent. But the
thirty passing sessions were short — ten to thirty steps. The two
failing sessions were the only ones that exercised the newly translated
code. I filed an issue: "30/31 pass rate is misleading. Only one session
exercises the batch-translated modules."

The deepest version of this: seed800, a 262-step wizard grand tour, was
at 3% RNG parity while the rest of the suite was at 100%. The suite
average was 84%. The agents were optimizing the average. I insisted they
work on seed800 specifically, because it was the only honest measure of
how much of the game actually worked.

**The principle:** Agents optimize the metric you give them. If the
metric can be satisfied without achieving the goal, they will satisfy
the metric. The human's job is to notice when the metric and the goal
have diverged, and either fix the metric or redirect the work.

---

## 5. Change the Game When It's Not Working

By late March, the menace project had about 220,000 lines of
JavaScript, 563 test sessions, and two stubborn failures remaining. The
agents had been working on these failures for weeks. Looking at the
codebase, I could see that the ideas of the old boundary-alignment
religion were still lodged in its crevices. Comments referenced it.
Display code contained vestigial epoch-tracking logic. The agents'
mental model of how the game loop worked was contaminated by weeks of
reasoning about epicycles that didn't exist.

In a human software project, "starting fresh" is almost always a
terrible idea. I have seen it fail spectacularly. But I also noticed
something: when agents had ported Rogue (8,000 lines) and Hack (6,000
lines), they did it cleanly, quickly, with no accumulated baggage. The
problem wasn't the agents' ability. It was the accumulated history of
wrong decisions in the codebase.

So we started over. Not from nothing — we distilled the wisdom from
fifty-one days of work into a set of starter files and advice documents.
The infrastructure. The measurement system. The cardinal rules. The LORE
of debugging lessons. A conventions document. And then a fresh codebase,
with no legacy code carrying the ghost of the old religion.

The result: twelve days to reach 100% RNG parity on thirty-five
sessions. The original project ran for fifty-one days and never reached
total 100%.

The key insight is that "starting fresh" worked for agents because the
knowledge was separable from the code. In a human project, the old
codebase carries implicit knowledge — thousands of small decisions that
were made without being documented. When you throw away the code, you
lose the knowledge. In an agent project, the knowledge can be explicitly
extracted and written down: LORE.md, DECISIONS.md, CONVENTIONS.md,
AGENTS.md. The new agents read these documents and begin with the wisdom
of fifty-one days without the accumulated mistakes.

**The principle:** Agents accumulate bad habits in the codebase itself —
compensating complexity, wrong abstractions, contaminated mental models.
Unlike human teams, agent teams can start fresh without losing knowledge,
because the knowledge can be fully externalized into documents. The
human's job is to recognize when the cost of accumulated mistakes
exceeds the cost of starting over, and to ensure the lessons are
captured before the reset.

---

## The Common Thread

Every one of these principles is about the same thing: **agents optimize
the nearest measurable signal, and humans hold the actual goal.**

Agents cannot step back and ask: "Is my metric capturing reality?" "Am
I working on the right problem?" "Is my solution making the system
simpler or more complex?" "Should I abandon this approach entirely?"
These are meta-cognitive operations that require a model of the model —
and agents don't have one.

The human's role, in a world where agents write most of the code, is
not to write code. It is to be the epistemological immune system:
detecting when the agents' model of reality has drifted from actual
reality, and correcting it before the drift compounds into a religion.
