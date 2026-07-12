# Forty-One Generalizable Lessons

**Companion to:** [data/analysis-techniques-catalogue.md](data/analysis-techniques-catalogue.md) (the 40 techniques, same numbering) and [REPORT.md](REPORT.md) Chapter 2.

This document inverts the catalogue. There, the NetHack-specific
technique is the subject and its effectiveness is the evidence. Here,
the **generalizable lesson is the thing to learn**, and the specific
technique is the **concrete illustration — an existence proof of how
seriously the lesson can be taken**. The numbers in each illustration
matter not because a student should hit them, but because they show
the ceiling: this is what the lesson looks like when you refuse to do
it halfway.

Format of every entry:

- **Lesson** — the transferable principle. If a student remembers one
  sentence, it's this one. No NetHack in it.
- **Illustration** — what the project actually built, with the
  numbers.
- **Signs you need it** — how to recognize, in a different project,
  that this lesson is the one that's missing.

A suggested grouping into nine teaching arcs is at the
[end](#the-nine-arcs).

---

## Why these lessons exist: the three failure modes of the first attempt

The public contest announcement
([mazesofmenace.ai/announcement](https://mazesofmenace.ai/announcement/))
tells the origin story candidly: the first four-month attempt at the
port failed, and the post-mortem named three failure modes. They are
worth teaching *before* the lessons, because nearly every lesson below
is a countermeasure to one of them.

**Failure mode 1: agents develop religion.** Stuck on hard
async-sequencing bugs, the agents constructed an elaborate
pseudo-technical framework ("sparse boundary frames") that *explained*
the bugs instead of fixing them — confident reasoning masking
fundamental misunderstanding. The countermeasures are Arcs IV and V:
purpose-built checkers and unreasonably strict oracles, which convert
confident narrative into arithmetic that either passes or does not.

**Failure mode 2: agents chase easy points.** After early progress,
the project plateaued — agents accumulated easy passing tests to
inflate the visible metrics rather than confront the three sessions
that stayed red. "An agent that spends all its time chasing easy
points will plateau hard." The countermeasures are Arc II and
Lesson 25: pre-registered criteria, exhaustion definitions, and
doneness measured as a tail — plus the standing human instruction,
preserved in the logs: *"do not avoid the difficult divergences."*

**Failure mode 3: flawed framing contaminates everything.** The
religion of failure mode 1 didn't stay in one file — it spread into
200,000 lines of variable names, comments, signatures, and structural
assumptions, until no local fix could remove it. The response was the
project's hardest decision: discard all code and restart from a
distilled-lessons prompt. The countermeasure is Lesson 28 (make the
killer constraint falsifiable early) — and the willingness, when the
frame itself is contaminated, to treat restart as cheaper than repair.

The successful port this document draws on **is that restart**. Its
technique stack is what four months of failure taught.

---

## Arc I: Memory — knowledge must outlive the conversation

### 1. Institutional memory compounds only if entries are dense, short, and cited

**Lesson.** AI agents (and rotating human teams) have no memory across
sessions: every discovery not written down is re-purchased at full
price. But writing things down is not enough — knowledge compounds
only when entries are *dense* (name the exact file, line, root cause,
fix, and validation case), *short* (a page or less, findable), and
*actually cited* by later work. Documentation that is written but
never cited is decay, not memory. Measure the citation rate, not the
page count.

**Illustration.** `LORE.md`: 910 KB and 229 debugging topics on the
first port; imported and extended to 546 KB on the second. During one
four-day autonomous run, 942 commits produced 185 LORE entries — and
later entries cite earlier ones directly. Meanwhile, long strategic
design documents written in the same period decayed uncited. The
project also counted the failure mode: 27 recorded instances of an
agent failing to apply a lesson from *its own* conversation.

**Signs you need it.** The same bug gets rediscovered; a fix comes
with no record of why; new sessions start from zero on problems the
project has already solved.

### 2. Knowledge has scopes — give each collaborator a notebook of their own

**Lesson.** Project-wide memory and personal memory are different
artifacts. Lessons about *how a particular collaborator works* — their
audit patterns, their recurring traps — belong at per-collaborator
scope, written by that collaborator for their own future use. A single
shared encyclopedia flattens this and loses it.

**Illustration.** Per-agent auto-memory directories: 210 files for the
audit-lead agent, 169 for the transpiler agent, 38 for the porting
agent — growing at +47 and +33 files per fortnight. The files
cross-cite: one agent's memory builds on its own earlier entries and
on other agents' published ones. These directories became the fastest
way to learn what any agent knows without replaying its sessions.

**Signs you need it.** Your shared docs are cluttered with notes only
one person uses; individuals keep re-learning their own past mistakes.

### 3. Write the door, not the room — per-subsystem entry documents

**Lesson.** The purpose of a design doc is to let a newcomer enter a
subsystem cold. Write one per subsystem, keep it current at the
boundary (what the subsystem promises, how to test it), and don't
confuse it with a record of everything inside.

**Illustration.** ~40 per-subsystem docs (combat, vision, monsters,
options, …). New agents — including agents running on entirely
different models — were onboarded by pointing at the relevant door
document rather than at the code.

**Signs you need it.** Onboarding anyone (human or agent) to a
subsystem requires a live tour by the one person who knows it.

### 4. Different collaborators need different onboarding — write the role, not just the task

**Lesson.** When collaborators differ in kind — different models,
different seniority, different failure modes — a single CONTRIBUTING
file underserves all of them. Write per-role documents that say what
this collaborator is for, what they're trusted with, and what traps
they specifically fall into.

**Illustration.** `AGENTS.md` plus model-specific role docs (e.g.
`GEMINI_ROLE.md` scoping the Gemini agent to infrastructure and stub
consolidation). Agent identities carried into commit trailers
(`Co-Authored-By: agent:xorn`), making each role's output measurable.

**Signs you need it.** You give every collaborator identical
instructions and get wildly non-identical failure modes.

### 5. Record why, or re-argue it forever

**Lesson.** Decisions without recorded rationale get re-litigated —
and agents are *eager* re-litigators, happy to reopen any settled
question they can't see the reasoning for. A running decisions log
(one line of what, a paragraph of why) is the cheapest re-litigation
insurance there is.

**Illustration.** `DECISIONS.md`, cumulative across the project's
life. Referenced when agents proposed reverting settled choices; the
answer was a link, not a debate.

**Signs you need it.** The same architectural argument recurs monthly
with different participants and the same conclusion.

---

## Arc II: Deciding in advance — pre-commitment beats judgment under temptation

### 6. Pre-register the success criteria before running the experiment

**Lesson.** Decide *before* the run what result will count as success,
what will count as failure, and what action each outcome triggers.
Post-hoc judgment is motivated judgment — for people and, acutely, for
agents evaluating their own work. Pre-registration converts "does this
change help?" from an argument into a lookup.

**Illustration.** 88 pre-registered experiment matrices (m1–m88) for
the auto-player campaign, each with acceptance criteria fixed in
advance. Directly prevented at least three revert wars, at a cost of
roughly fifty lines of discipline per experiment.

**Signs you need it.** Changes get merged because their author felt
they helped; reverts of reverts appear in the log.

### 7. Define "exhausted" before you start, so you can stop without a fight

**Lesson.** Every approach should carry its own stopping rule: the
observable condition under which you'll conclude the approach has
given all it has. Without one, sunk-cost momentum decides — projects
keep tuning what needed replacing. With one, hitting the ceiling is a
legible, even collegial, event.

**Illustration.** Phase gates with exhaustion criteria on the
auto-player campaign. When reactive playbooks bottomed out at a firm
104-death floor across tuning attempts, the pre-declared criteria made
the verdict "architecture-limited, not tuning-limited" — and the phase
ended cleanly rather than consuming another month.

**Signs you need it.** Nobody can say what evidence would make the
team abandon the current approach.

---

## Arc III: The loop — iteration speed is a knob you set per decision

### 8. Keep a fast and an exhaustive variant of the same verification — and know which one this moment calls for

**Lesson.** Verification speed is not a fixed property of a project;
it's a per-decision choice. Build paired variants of your core check —
one tuned for seconds, one for completeness — and move between them
deliberately: fast while exploring, exhaustive as a change comes in
for landing. Teams that only have the slow check stop running it;
teams that only have the fast one ship holes.

**Illustration.** `pes-fast` (seconds, targeted) beside `pes-report`
(the full 1,000-line reporter over every session and channel); 6-minute
sweep variants beside overnight hunts. The rhythm this enabled: one
agent landing 5–10 commits per day, *each* carrying full 307/307
exhaustive verification at the moment of landing — exploration never
paid the landing cost, landing never accepted the exploration
discount.

**Signs you need it.** People skip the test suite because it's slow;
or the "quick check" has quietly become the only check.

### 9. Pin the world while you measure it

**Lesson.** Long-running measurements must run against an immutable
snapshot of the code, isolated from ongoing churn — otherwise results
are unattributable and reruns cost everything. Make pinning cheap and
default for any measurement that outlives a coffee break.

**Illustration.** Hash-pinned git worktrees (`--isolate`) for every
experiment matrix. Rerunning any historical matrix costs zero
archaeology: the tree it ran against still exists, by construction.

**Signs you need it.** "Was that regression the change or the
environment?" is a recurring question; nobody can rerun last month's
benchmark.

### 10. Autonomy needs a babysitter — make the babysitter automatic

**Lesson.** Long-running autonomous work stalls, loops, and drifts.
The fix is not to watch it yourself; it's a cheap supervisory process
whose only job is to notice stall states and nudge. One level of
automated supervision buys many hours of unattended progress.

**Illustration.** A watchdog agent role, introduced in the first port,
that monitored autonomous porting sessions overnight and nudged them
out of stalls — the enabling condition for multi-hundred-commit
unattended runs.

**Signs you need it.** Overnight jobs are found dead (or worse, busily
looping) in the morning.

### 11. Every recurring foot-gun deserves a tiny permanent guard

**Lesson.** When the same mechanical mistake appears twice, spend the
ten lines to make it impossible at commit time. Guards are cheaper
than cleanup, and agents — who make mechanical mistakes at mechanical
scale — make them essential.

**Illustration.** An autostash-verify hook (~10 LoC) after conflict
markers got committed: verification runs against what will actually
land, and conflict-marker commits ended permanently.

**Signs you need it.** Code review keeps catching the same class of
mechanical error.

---

## Arc IV: Purpose-built static analysis — write checkers for *your* invariants

### 12. Generic linters check the language; you must check your task

**Lesson.** Every serious project has task-specific invariants no
off-the-shelf tool knows about. When your work is "make X conform to
Y" — a port, a migration, an API contract — build a checker that
mechanically diffs the *structure* of your artifact against the
reference. The checker converts an unbounded review problem into a
finite finding count.

**Illustration.** `skeleton-diff` (~2 KLoC): extracts the control-flow
skeleton of every ported JS function and diffs it against the C
original. Finding counts driven 89→47, then 114→12 in successive
audit waves — each number a measured claim about structural
conformance of a 450 KLoC port.

**Signs you need it.** Conformance to the reference is being checked
by eyeball, and confidence is a feeling rather than a count.

### 13. Make findings attributable: check per-unit, not per-project

**Lesson.** A conformance checker that says "something is wrong
somewhere" doesn't direct work. Decompose checking to the smallest
attributable unit (function, endpoint, table) so each finding names
its owner and each fix visibly retires its finding.

**Illustration.** `spine-diff`, the per-function refinement of
skeleton-diff: each divergent function is its own finding, so audit
waves could be planned, assigned to agents, and burned down like a
ticket queue.

**Signs you need it.** Your analysis tool's output is a wall of text
nobody can turn into a task list.

### 14. When a bug class recurs, write its scanner — then ratchet to zero and hold

**Lesson.** The second time you fix instances of the same bug class,
stop and write a scanner for the class. Then drive its findings to
zero and *keep* them at zero — a suppression list that only shrinks. A
scanner at zero is a proof; a scanner at "some findings, probably
fine" is noise.

**Illustration.** ~30 `scan-*.mjs` semantic scanners, one per observed
bug class. The aggregate finding count went 844→266→0 — with "zero
unmatched suppressions" reached and then maintained as a standing
invariant.

**Signs you need it.** Fix commits come in themed batches; the same
pattern keeps being fixed in new places.

### 15. Cheap runtime sanity checks are a fleet, not a feature

**Lesson.** Alongside static scanners, accumulate small runtime
checkers — each one asserting a single invariant while the system
actually runs. Individually trivial; as a fleet, they catch what
static analysis structurally cannot.

**Illustration.** ~30 `check-*.mjs` runtime checkers (keylog
faithfulness, option-parser coverage, …) run as pre-flight before
risky operations, most consequentially before the project-wide async
migration.

**Signs you need it.** Bugs keep surfacing in categories your static
tools can't express.

### 16. One purpose-built check can make an impossible migration routine

**Lesson.** Some migrations are "impossible" only because one property
can't be verified by hand at scale. Identify that single property,
write the checker for exactly it, and the migration becomes a
mechanical, verifiable sweep.

**Illustration.** `check-async.mjs`, verifying async/await coloring
consistency across the codebase. It made a migration adding 2,747
async function heads and 22,120 `await` insertions *possible at all* —
and when parity dipped 24.75%→21.94% during the flip, the dip was a
budgeted, documented cost rather than a mystery. (It also caught a
conformance check that had been silently inert since inception — the
checker checked the checkers.)

**Signs you need it.** A migration everyone agrees is right sits
unstarted because no one can verify it by hand.

---

## Arc V: Oracles — make correctness a measurement, not an opinion

### 17. Choose an unreasonably strict oracle, and verify on independent channels

**Lesson.** The most important decision in a correctness-critical
project is what "correct" *means*, mechanically. Choose the strictest
equivalence you can afford — stricter than feels reasonable — and
verify it on multiple independent channels, because each channel masks
bug classes the others expose. A strict oracle converts all debugging
downstream of it from argument into arithmetic.

**Illustration.** "Match every random number": the port must consume
the PRNG identically to the C original — plus, on independent
channels, identical event streams and identical terminal screens.
The strictness looked fanatical; it is the single decision the whole
project's success traces back to. By the end: 307/307 sessions, 3.8
million RNG events, 100% match.

**Signs you need it.** "Works correctly" means "looked right when we
tried it"; disagreements about whether a change regressed anything are
settled by seniority.

### 18. When the suite passes but bugs persist, add an orthogonal channel

**Lesson.** A passing suite is a statement about your channels, not
about your system. When bugs slip through green runs, the fix is often
not more tests on existing channels but a *new orthogonal channel* —
another independently-measured dimension of behavior.

**Illustration.** The fourth channel: cursor position, added after
realizing screen-content comparison masked cursor drift. It
immediately exposed divergences that three channels at 100% had been
hiding for months.

**Signs you need it.** Users report bugs your comprehensive suite
can't even express.

### 19. Weave measurements into version control, not beside it

**Lesson.** Any measurement log kept *beside* the repository drifts
from it: entries go stale, reverts leave ghosts. Record measurements
*in* the commits themselves (trailers, notes), and history becomes
atomic, revert-safe, and reconstructible by a parser instead of
maintained by a human.

**Illustration.** Every commit carries a parity trailer
(`Parity: 307/307 …; RNG:3808565/3808565(100%)`). A ~120-line parser
reconstructs the entire project's quality timeline from `git log` on
demand. Reverting a commit reverts its measurement — for free,
forever.

**Signs you need it.** The metrics spreadsheet and the repo disagree,
and nobody knows which is right.

### 20. Reversibility is infrastructure — and infrastructure needs its own oracle

**Lesson.** If your domain needs replay, rollback, or time-travel,
journaling/reversibility must be built as first-class infrastructure —
and it needs its own verification oracle, because subtly-wrong
rollback is worse than none. Test the journal like you test the
product.

**Illustration.** The reversible-transactions engine: ten modules of
proxy-membrane journaling, with dedicated oracles (`rtx-oracle`,
replay-N verification) invoked 234 times in one agent's month. Each
hardening issue closed with the oracle green — rollback correctness
measured, not assumed.

**Signs you need it.** Undo/replay features are "mostly working";
state corruption bugs appear after rollbacks.

### 21. Freeze the ruler while you change the thing being measured

**Lesson.** When iterating on a generator (a compiler, a pipeline, a
model), freeze the evaluation. A moving benchmark makes progress
unmeasurable and — just as valuable — makes *ceilings* invisible. A
frozen judge turns even failure into a crisp, publishable finding.

**Illustration.** The counter-experiment's frozen 44-session judge
(`frozen/score.sh`). It measured the transpiler's climb to 24/44 and
then made the plateau undeniable — the clearest single piece of
evidence that the approach's limit was architectural, not incremental.

**Signs you need it.** The benchmark and the system change in the same
commit; progress claims can't be compared across weeks.

---

## Arc VI: The test-case economy — tests are generated, harvested, and bred

### 22. Harness human effort where humans are irreplaceable — and one deep case beats many shallow ones

**Lesson.** Automated inputs cluster around what automation finds
easy. Real humans, using the system in earnest, reach states no
generator visits. Harness that scarce effort deliberately —
recordings, contests, bounties — and prefer depth: one long, rich,
deeply-exercised case exposes more distinct behaviors than a pile of
shallow ones.

**Illustration.** A single hand-recorded 737-step session — captured
with the deterministic recorder by a human playing in earnest — drove
39 commits and 71% of a phase's progress on its own, exposing menu
paths, container interactions, and prompt gating no random or
bot-generated session had ever touched.

**Signs you need it.** Your test inputs all look alike; field reports
describe scenarios your corpus can't reach.

### 23. The best fuzzer is a competent automated user — even if building one is a project in itself

**Lesson.** Random input fuzzes the parser; a *competent* automated
user fuzzes the system — it reaches deep, semantically meaningful
states at fuzzing scale. Building one is real engineering, a project
inside the project. Budget it honestly; it pays back as a coverage
engine that runs every night.

**Illustration.** A full automatic game-player: strategy, planning,
combat, and pathfinding layers, its own 546 KB lessons file, its own
test suite, even a puzzle solver. As a fleet it delivered
500-session × 100-turn nightly hunts at under 5% actionable
divergence, plus 15,000-step behavioral baselines no other input
source could produce.

**Signs you need it.** Coverage is stuck at the shallow states; deep-state
bugs arrive only from production.

### 24. Mass covers the middle; adversarial search covers the tail

**Lesson.** Broad random/behavioral fuzzing and directed adversarial
search are complements, not substitutes. Once mass fuzzing plateaus,
add machinery that *hunts*: seed scouting, input mutation, beam search
toward the earliest failure.

**Illustration.** Thirteen adversarial scripts — seed scouts, index
probes, session mutators, grid sweeps — run as the backstop behind the
mass fleet, finding the corner cases the fleet's distribution never
touches.

**Signs you need it.** New bugs cluster in exotic states your fuzzer's
distribution almost never samples.

### 25. Define doneness as a distribution, and watch its tail

**Lesson.** "Is it done?" should be a standing measurement, not a
meeting. Pick a steady-state metric with a tail — time-to-first-failure
under sustained realistic load is a good one — and run it on a rhythm.
When the tail lengthens run over run, you are converging; when it
stops lengthening, that's your remaining-work signal.

**Illustration.** Nightly 500×100 divergence hunts with
*first-failure depth* as the metric: consecutive runs showing depths
of 7, 32, 51, 112, 479. The lengthening tail is the port's endgame,
visible in a single number per night.

**Signs you need it.** "Almost done" has been the status for months,
unfalsifiably.

### 26. Don't always start from the lobby — boot tests from realistic deep states

**Lesson.** Test entry points cluster at cold start, so early states
get exercised thousands of times while deep states go untested. Build
the machinery to *boot directly into* realistic mid-life states —
ideally harvested from real usage data.

**Illustration.** A mid-game harness booting sessions from states
reconstructed out of real players' public game logs — 40 mid/late-game
scenarios that put test coverage where tutorial-start sessions never
reach.

**Signs you need it.** Bug reports come from hour ten; your tests all
live in minute one.

---

## Arc VII: Generation and collaboration — automate the bulk, diversify the minds

### 27. Automate the bulk mechanically; hand-craft the boundaries

**Lesson.** In large migrations, purity loses. Full automation
produces wrongness at the hard boundaries; full hand-work never
finishes. The winning shape is hybrid: batch-automate the mechanical
mass (with dedup, import-fixing, and stub tooling around it), and
spend human/agent judgment only where structure genuinely changes.

**Illustration.** The hybrid pipeline: LLM batch translation for C
functions up to ~1,000 lines, subagent hand-porting above that, ten
Python generators for pure data tables — ~450 KLoC ported into 172
modules. This was the winning approach across all three attempts.

**Signs you need it.** The migration plan is either "we'll script all
of it" or "we'll rewrite it all carefully" — with no per-unit triage
in between.

### 28. Test the killer constraint first — an architectural bet must be falsifiable early

**Lesson.** Before betting a project on an architecture, identify the
property most likely to kill it and design the *first* experiment to
stress exactly that. A bet whose fatal flaw only becomes visible at
scale will consume months producing genuine-looking progress before it
fails. (Corollary: when it does fail, a frozen ruler — Lesson 21 —
is what makes the failure legible instead of arguable.)

**Illustration.** The counter-experiment: transpile-first, with
hand-editing forbidden. Its killer constraint — that some correctness
properties (async coloring) are *whole-program* and cannot be resolved
one file at a time — was discoverable in week one, but wasn't tested
until months of taxonomy work had climbed to a hard 24/44 ceiling. The
methodology was excellent; the bet was never falsifiable-early, and
that was the actual mistake.

**Signs you need it.** The plan's riskiest assumption is scheduled to
be validated last, after the easy wins.

### 29. Small purpose-built translators for small embedded languages

**Lesson.** Big systems embed little languages — DSLs, config formats,
level data. Don't force them through your main pipeline and don't port
their content by hand: a few hundred lines of purpose-built translator
per little language is usually the whole job.

**Illustration.** Two small Lua→JS translators (general-purpose and
AST-transform variants) ported all 126 special level definitions —
content the main C pipeline couldn't touch.

**Signs you need it.** A corner of the migration is stalled because
its source isn't in the "main" language.

### 30. Diversify the minds: different models have different blind spots

**Lesson.** A single model (or a single person) doing everything has
*correlated* failures — the same blind spot applied everywhere.
Heterogeneous collaborators, each with identity, territory, and an
audit trail, catch each other's misses. Route knowledge through the
shared repository (commits, docs, cited memory), never through
ephemeral side-channels.

**Illustration.** Six named agents across three model families, each
in its own git worktree with identity trailers on every commit — one
on the reversibility engine (2,255 commits in 26 days), one running
the fuzzer fleet, one on main-tree porting, one on infrastructure.
Cross-agent memory citations are observable in the logs. Not every
role survived — two went dormant — and that selection is part of the
technique.

**Signs you need it.** Review keeps missing the same category of
error, because reviewer and author share the blind spot.

### 31. Instrument the reference, and join traces on a shared clock

**Lesson.** When your system disagrees with a reference and you can't
tell *where*, stop instrumenting only your side — instrument the
reference implementation too, and emit both traces against a shared
monotonic key. Choosing the join key is the critical design decision:
a key that either side can perturb (like "number of calls so far")
will silently misalign the traces.

**Illustration.** Env-gated probes compiled into the original C
engine, logging internal state inline with the RNG trace, joined to JS
probes on the *game-turn counter* — explicitly not on RNG-call index,
which the instrumentation itself perturbs. One root cause traced this
way (a checkpoint-save nulling state it shouldn't) closed a
five-effect causal chain; another single fix recovered 13,842 steps of
parity in one session.

**Signs you need it.** You know the outputs diverge but every
attribution attempt dead-ends; your logs from the two systems can't be
lined up.

### 32. Get external ground truth, earlier than feels necessary

**Lesson.** A project that only measures itself against itself will
optimize the wrong thing with great precision. Find external ground
truth — real usage data, public baselines, competitor behavior — and
calibrate your metrics against it. Expect it to *reframe* your goals,
not just validate them.

**Illustration.** 3.58 million real human game records plus 108 top
players' config files. The data showed the bot fleet was
over-surviving but under-progressing relative to humans (reaching
depth 3 where humans in-band reach 11–12) — inverting the campaign's
priorities. The team's verdict: this arrived late and should have
arrived in month one.

**Signs you need it.** Your KPIs improve monotonically while the thing
they proxy for doesn't.

---

## Arc VIII: The unit of testing — one artifact to accumulate, see, fork, and author

### 33. The unit of testing is a design decision — choose one replayable, accumulable artifact

**Lesson.** Deliberately choose the artifact your testing is
denominated in, and demand four properties of it: deterministic to
*replay*, *comparable* across implementations, *meaningful* to a human,
and *accumulable* — such that finding a bug permanently adds a test.
Then make every tool in the project consume and produce that one
artifact. Get this right and your test suite becomes an appreciating
asset; get it wrong and every tool needs its own format and every bug
dies without leaving a test behind.

**Illustration.** The *session* — seed, config, keystroke stream, plus
recorded ground truth — as a single JSON artifact. The corpus grew
19 → 38 → 82 → 307 sessions over the project, each addition pinning a
behavior worth keeping: human recordings, bot deaths, adversarial
mutations, real-player mid-game states. Some fifteen tool families
share the format; a bug becomes a regression test at near-zero
marginal cost.

**Signs you need it.** Bugs get fixed without leaving tests behind;
each test tool has its own bespoke input format.

### 34. Coverage's job is to direct the next test, not to score the suite

**Lesson.** Treat coverage as a *curation* instrument: it should tell
you where the next valuable test case must come from and which
existing cases are redundant. A coverage percentage in a CI gate
changes behavior; a coverage *map* in front of a human changes
strategy.

**Illustration.** A published per-line coverage dashboard over the
whole session corpus, plus rankers that score each session by marginal
coverage and flag redundant ones. Gaps in the map directed the human
contest and the mid-game harness at specific unexercised subsystems.

**Signs you need it.** Coverage is a number people cite but nobody
looks inside; new tests duplicate old ones' coverage.

### 35. History deserves a dashboard: regression-to-commit attribution should be a glance

**Lesson.** Quality-over-time data is only as useful as the speed of
the question "which change bent this curve?" Build the view where
measurement history and change history are the same axis — every
regression visually attached to the commit that caused it. (This is
the payoff of weaving measurements into version control, Lesson 19:
the dashboard is just a view over disciplined data.)

**Illustration.** A timeline dashboard rendering the full commit
history: pass-rate skyline, coverage curve, and a session×commit
heatmap where each cell's color encodes three channels — so "which
sessions broke at which commit" is answered by looking.

**Signs you need it.** Answering "when did this regress?" requires
someone to write a script.

### 36. Build the instrument that lets you watch a failure happen

**Lesson.** When failures number in the dozens, diagnosis speed
dominates discovery speed. Build the instrument that plays reference
and implementation side by side, on the same inputs, with the
difference highlighted at the finest meaningful granularity — turning
a failure report from a diff to be decoded into an event to be
watched.

**Illustration.** A live debugger running the real C game and the JS
engine simultaneously, mirroring every keystroke into both, with
cell-level divergence overlay on the terminal grid — plus resume-from-
any-step, and an embedded agent pane for in-context triage. This is
where "22 divergences found" became "22 root causes understood."

**Signs you need it.** Each failure takes hours of log archaeology
before anyone can say what actually happened.

### 37. Recorded behavior should scrub like video

**Lesson.** Humans understand behavior temporally. Any recorded
execution worth keeping is worth being able to scrub — step forward
and back, jump, replay — like film on an editing table. Counting
failures tells you how many; scrubbing tells you why.

**Illustration.** Self-contained HTML scrubbers generated for any
session (every frame embedded, arrow keys to step, including
thousands-of-turns bot games — "why did seed 5 die at turn 3200?" is
answered without re-running anything), plus a live scrub bar over the
running game backed by a ring of rollback snapshots.

**Signs you need it.** Understanding one recorded failure means
re-running it with print statements.

### 38. The test harness should drive the production artifact itself

**Lesson.** A separate "test build" or viewer app inevitably drifts
from the real thing, and then your tests verify the drift. Give the
production artifact itself the hooks to load, replay, and expose any
recorded case — so the thing you test is exactly the thing you ship.

**Illustration.** The playable game page accepts URL parameters
(`?seed=…&replay=1`) that load any corpus session — including failing
ones — into the production engine. Every debugging and replay tool
drives that same surface. Drift between "the game" and "the harness's
idea of the game" is structurally zero.

**Signs you need it.** Bugs reproduce in production but not in the
test build, or vice versa.

### 39. A good test is a prefix: make tests forkable, and the corpus breeds

**Lesson.** A valuable test case is not just a check — it's a
*reusable path to an interesting state*. Build the machinery to fork
any recorded case at any point with changed input, and your corpus
stops being a frozen suite and starts compounding: every case seeds
families of new ones.

**Illustration.** Three fork mechanisms over the same session format:
a live fork API (re-base the input prefix, replay to derive state,
new lineage-tracked branch), an interactive mid-replay fork in the
debugger (human takes over from any step), and offline mutation with
insert/replace/delete/splice plus beam search toward the earliest
divergence.

**Signs you need it.** Reaching an interesting state for a new test
means hand-replaying twenty minutes of setup.

### 40. Tools for AI agents must be stateless: one invocation, one observation

**Lesson.** Agents are bad at babysitting long-lived interactive
processes — sessions time out, context runs dry, state goes stale
mid-conversation. Design agent-facing tools so every invocation is
self-contained: load declared state, perform one high-level verb,
print the observation, exit. And make the verbs *high-level* (go to,
run until, verify) — an agent micromanaging keystrokes wastes its
context on what a pathfinder should do. The tool's files, not the
process, hold the state; which also means every step is reviewable
and resumable by anyone.

**Illustration.** A session-authoring CLI built explicitly for agents:
each invocation replays a human-readable "keyplan" file and runs one
verb — `goto`, `fight`, `autocombat`, `run-until` (stop on message,
event, or step count), `check` (replay with embedded assertions).
~150 keyplans authored this way became test fixtures, including
multi-segment save/reload scenarios that unlocked a whole class of
suite expansion. It is how an AI *writes* a test, the way scrubbers
are how a human *reads* one.

**Signs you need it.** Your agents keep abandoning half-finished
interactive workflows; automation state lives in a process that dies
with the session.

---

## Arc IX: Replication — you don't know your method works until strangers try it

### 41. Open your problem to the world, with a judge you can't sweet-talk

**Lesson.** An in-house success proves less than it feels like it
proves: maybe it was the method, maybe it was luck, access, or the
author's decade of domain familiarity. The strongest test of a
methodology claim is a replication experiment — publish the problem,
hand outsiders your tools, score everyone with an automated held-out
judge, and design the scoring against overfitting (secret test cases;
penalties for change-churn that chases the metric). This is also the
deepest form of self-skepticism: an open invitation to prove your
claims wrong. And note the asymmetry that makes it cheap: if your
method is what matters, sharing the code costs you nothing.

**Illustration.** The public porting contest: fork a playable skeleton
(engine wired, logic empty), port 442,901 lines by any method —
"AI agents, hand-coding, transpilers, monks chanting in caves" — with
an automated judge scoring every fork every two hours against public
sessions plus a secret held-out suite, and a Phase 2 that divides your
score by how much you changed your code to chase the new target. The
stated hypothesis: *"the magic is in the LLM methods, not the code
itself."* Interim result: roughly a dozen contestants with the same
models, source, and harness are all struggling — and the in-house
counter-experiment plateaued at 24/44 on the same judge. Early
returns favor the hypothesis; the real verdict lands when Phase 1
closes.

**Signs you need it.** Your methodology claims rest entirely on your
own team's one success; nobody outside has ever tried to reproduce it.

---

## The Nine Arcs

For teaching, the forty-one lessons compress into nine arcs — each a
candidate module, each with one anchor sentence:

| Arc | Lessons | The one sentence |
|---|---|---|
| I. Memory | 1–5 | Knowledge that isn't dense, scoped, and cited is re-purchased at full price. |
| II. Deciding in advance | 6–7 | Pre-commit the criteria for success and for giving up, before the evidence arrives. |
| III. The loop | 8–11 | Iteration speed is a per-decision knob: fast while exploring, exhaustive at landing. |
| IV. Purpose-built analysis | 12–16 | Write checkers for your invariants, drive them to zero, and hold. |
| V. Oracles | 17–21 | Choose an unreasonably strict definition of correct, and freeze the ruler. |
| VI. The test economy | 22–26 | Tests are harvested from humans, generated by agent-users, bred adversarially — and doneness is a tail you watch. |
| VII. Generation & collaboration | 27–32 | Automate the bulk, hand-craft the boundaries, diversify the minds, and calibrate against external ground truth. |
| VIII. The unit of testing | 33–40 | Choose one replayable artifact; then build the tools to accumulate it, see it, fork it, and let agents author it. |
| IX. Replication | 41 | You don't know your method works until strangers try it against a judge you can't sweet-talk. |

Two lessons sit above the arcs and are worth teaching first and last:

**The meta-lesson of the successful port:** techniques compounded only
when they were *named, measured, and cited*. Every entry above that
worked has all three; every one that stagnated is missing at least
one.

**The meta-lesson of the failed port:** the counter-experiment's
methodology was in places *better* than the successful port's — its
forensics and taxonomy were genuine innovations — and it failed
anyway, because the architectural bet underneath it was never made
falsifiable early. Method cannot rescue an untested premise
(Lesson 28). Rigor about the wrong constraint is still rigor about
the wrong constraint.

---

And the sentence that frames the whole curriculum, from the contest
announcement:

> "The role of the programmer in the age of AI coding has become
> clearer to me over these months. You do not write the code. You do
> not review every line. You maintain a skeptical eye, you manage the
> strategy, and you invest in tools to expand the common understanding
> of humans and AIs."
