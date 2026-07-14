# Book Outline

**Companions:** [LESSONS.md](LESSONS.md) (the 47 lessons the book
teaches), [HOMEWORK.md](HOMEWORK.md) (the 15 exercises, attached
per-chapter below), [data/analysis-techniques-catalogue.md](data/analysis-techniques-catalogue.md)
(the evidence base), [REPORT.md](REPORT.md) (the full case-study
analysis).

**The thesis in two sentences.** LLM agents have inverted the
economics of programming: writing code is now cheap, and understanding
code is not. Software is the one branch of engineering whose
components never fail statistically, so unbounded complexity is
possible there and only there; the discipline of this book is how to
accept the astonishing output of statistical machines without letting
their failure mode into the deterministic tower.

**The shape.** Eight chapters: an introduction, a first-principles
chapter on what software is, a foundations chapter that draws the
determinism boundary and introduces the model problem, four technique
chapters (Time, Structure, Mass, Mind), and a conclusion.

**First-draft strategy.** The book's initial draft is
[HINTS.md](HINTS.md): the same material compressed into advice for
the mazesofmenace.ai contest participants, one hint per chapter,
published to the audience that needs it most and will stress-test
every claim. What the contestants do with the hints becomes evidence
for the conclusion chapter.

**Conventions held throughout:**
- Every chapter opens with a concrete scene from the case study, not a
  generality.
- Every chapter carries one **history-of-exactness sidebar** (Knuth,
  Compaq, web2c, DOOM demos, the emulator scene, FoundationDB, Yoga,
  Pernosco): every community that ever needed exactness invented this
  methodology independently, and that thread argues the thesis better
  than any claim.
- Every chapter ends with exercises drawn from HOMEWORK.md.
- The **Goodhart immune system** (Lesson 46) is not a chapter; it is
  woven as a thread, one defense surfacing in each pillar chapter, and
  named as a whole in the conclusion.
- Numbers are real and cited to the catalogue; no rounded-up war
  stories.

---

## 1. The Inverted Economy

The drafted introduction (finalized in conversation; to be committed
as the chapter's opening pass).

- Let me say plainly what LLM coding agents are: astonishing. Half a
  million lines of high-quality code from one part-time engineer,
  including hundreds of thousands of lines no human has ever read.
  This book is about how to deal with that new challenge.
- The inversion: writing is cheap; understanding is not; the two costs
  used to be paid together (code arrived understood because a person
  had just thought it into existence); agents break the link, and
  understanding becomes a product you must manufacture separately.
- The case-study seed, told compactly: the first four-month attempt,
  the agents' invented "sparse boundary frames" religion, easy-point
  chasing while three sessions stayed red, contamination of 200K
  lines, the restart from a distilled-lessons prompt, the second
  attempt that worked.
- The failure modes generalized: complexity outruns reading; agents
  optimize whatever is measured; the human drifts into approving work
  he cannot inspect; speed governs everything because the price of
  each verification decides how much understanding you can afford.
- The question the book answers: how do you make understanding as
  cheap as writing? Determinism first; then four kinds of tools
  (instrumentation in time, analysis of structure, tests in mass,
  orientation for the mind); one defensive habit throughout, because
  every measurement will be gamed by the optimizers it measures. Some
  of those optimizers are your agents. One of them is you.
- Closing: the role of the programmer. You do not write the code. You
  do not review every line. Skepticism, strategy, and tools for the
  common understanding of humans and AIs.

*Historical calibration (sidebar or footnote):* what half a million
lines historically cost. Chromium: ~30M lines, staff in the thousands,
two decades; the long-run industry rate near 2,000 high-quality lines
per engineer-year; NetHack's own DevTeam: ~a dozen volunteers at a
time, 100+ contributors, 39 years for 442,901 lines. And the porting
discount honestly stated: loose "functionally equivalent" migration
runs 5–20× cheaper than de novo, but *exactness* historically explodes
cost (Compaq: $1M and nine months of clean-room for eight kilobytes;
Wine: thirty years and unfinished). The writing was never the
expensive part of exactness. The knowing was.

*Exercises:* none. Discussion: where in your own work has
understanding already fallen behind production?

---

## 2. The Deterministic Tower: What Makes Software a Special Kind of Engineering

First principles; the one chapter with no NetHack in it, readable
standalone by a skeptic.

- **Engineering under statistics.** Physical materials fail
  statistically: fatigue, tolerance, variance, safety factors.
  Reliability multiplies across components, so physical systems decay
  exponentially with part count; a 747 is a few million parts and sits
  near the practical ceiling, purchased with redundancy that itself
  costs more with every part. Physical engineering is the art of
  living under that ceiling.
- **The digital abstraction.** Transistors are as statistical as
  steel; the digital gate quantizes noise away and error correction
  finishes the job, delivering per-operation failure rates so low that
  a chain of a trillion sequential operations can be expected exact.
  (Sidebar: von Neumann, 1952 — reliable organisms from unreliable
  components; the deliberate construction of a deterministic platform
  on statistical physics.)
- **The consequence.** On that platform the only failures left are
  logical flaws: problems in the design of the reasoning itself. So
  the complexity ceiling lifts: a browser is thirty-five million lines
  executing flawlessly for billions of user-hours. The towering
  edifice is possible only here. Software engineering is what
  "watching out for logical flaws" grew into.
- **Learning-based methods, by analogy.** Neural networks also build
  towers of complexity, absorbed from data rather than designed — but
  on the statistical side, with statistical failures: error rates,
  distribution shift, and the compounding decay of chained decisions,
  the same exponential that limits bridges. Different levers (data,
  scale, optimization vs. abstraction, composition, invariants),
  different capabilities (the unformalizable vs. the exact).
- **The hybrid architecture.** Real systems contain both, composed in
  both directions: statistical components supply inputs to
  deterministic cores (perception into a planner); deterministic
  scaffolds constrain, check, and feed the statistical parts (a
  language model calling typed tools); and, increasingly, statistical
  components sit *on top*, steering deterministic substrates — an LLM
  agent driving compilers, shells, and test suites is exactly this.
- **Choosing the boundary: when to build a component deterministic.**
  The choice is the engineer's, driven by named properties.
  - *Demands on behavior:* very high quality (required error rates
    below anything statistical components promise); predictable
    behavior on novel out-of-domain inputs (a deterministic system's
    behavior off-distribution is exactly its behavior on it);
    reproducibility; explainability.
  - *Structure in the problem:* large amounts of structured world
    knowledge already in rule form; many computable invariants (a
    deterministic component can be *held* to them; a statistical one
    only sampled against them); high compositional complexity (chains
    of deterministic decisions don't decay; depth of composition is a
    statistical component's poison); interaction with rigid rule-based
    neighbors (exact interfaces force exact citizens).
  - **Algebraic composability** — when operations on the system must
    themselves be objects of computation: undone (inverses), replayed,
    reordered, merged, transformed against each other, type-checked
    before running. Undo stacks, transaction reconciliation, compilers.
    RTX as the worked example: rollback, replay-N, and reconciliation
    are possible only because every effect is a reified operation with
    an inverse. Nothing statistical has an analog: you cannot invert a
    forward pass, rebase one model's output against another's, or
    type-check the composition of two policies. Where the value lies
    in the algebra of operations, the component must be deterministic,
    because **the algebra is the specification.**
  - *The mirror list,* briefly: statistical is right when no formal
    spec can exist (perception, language, taste), when errors degrade
    gracefully, when data is cheaper than rules, when requirements
    drift faster than code.
  - *The real asymmetry.* Composition runs both ways — statistical
    components learn, model, steer, and manipulate deterministic
    systems, and an LLM coding assistant is precisely a statistical
    machine operating a deterministic substrate. What is asymmetric is
    the direction guarantees flow. A deterministic gate can convert a
    statistical output into a certainty: the generated code passes the
    suite, or it does not. A statistical assessor can only convert a
    deterministic system's behavior into a judgment — confidence,
    never proof. **Judgment composes both ways; certification flows
    one way.** So the architectural rule is not "determinism on the
    outside" but: wherever a property must *hold* rather than be
    *likely*, a deterministic gate must stand between the statistical
    component and the consequence. (This is the whole book's stack in
    one sentence: agents steer from above; the gates certify from
    below; the first attempt failed as statistical steering without
    deterministic gating.)
- **The landing: software speaks the language of accountability.** In
  a deterministic system, "why did this happen?" has an answer: a
  finite, walkable chain — this output, because this rule, applied to
  this input, in this state. That is the shape in which accountability
  is conducted everywhere: contracts, audits, regulations, safety
  cases. A statistical system answers "why" only with "the weights,
  the data" — true, but useless to an auditor or a court. Wherever
  society will demand an account, the accountable layer must be
  deterministic, whatever statistical machinery feeds it.
- **Software in the AI era: converging expectations.** Three ways the
  separation erases, all raising the bar on the deterministic side:
  (1) complexity expectations inflate — agent-built software will
  absorb far more complexity than previous iterations, because
  construction is cheap and the tower is the only place unbounded
  complexity survives; (2) software will be measured against ML
  systems and expected to compete (the NetHack player agent as the
  standing existence proof that the deterministic entry can win);
  (3) interfaces turn statistical — inputs and outputs are
  increasingly embeddings, token streams, and model outputs, so
  deterministic cores must consume and emit statistical signals
  without absorbing statistical failure: guards, canonicalizations,
  recorded boundaries. Interface engineering becomes boundary defense.
- The running example seeded: NetHack's player agent — nothing in
  "play this game well" says which kind of machine it should be; the
  ML community assumed statistical; the leading implementation is
  deterministic, and this book's project chose deterministic twice
  over, because a deterministic agent is also a replayable instrument.

*Sidebars:* von Neumann 1952; ECC and bit-flip rates; 747 parts vs.
Chrome lines. *Exercises:* discussion — draw the
statistical/deterministic boundary in a self-driving car, a search
engine, and a coding-agent session; argue where it should move.

---

## 3. Determinism: Defining What Your Software Is

The bridge from theory to practice, and the introduction of the model
problem. Determinism is an act of definition, not cleanup.

- **The boundary defines the software.** What lies inside the
  deterministic line — runnable, testable, checkable, replayable — is
  your software; everything else (clock, network, user, entropy,
  model) is environment, reached through APIs. Until the line is
  drawn, you have behavior entangled with the world, not software.
- **The guard against the natural misreading:** the *doors* are your
  software too — often the hardest part. Drawing the line is how you
  take responsibility for the environment, not how you disclaim it.
- **The inventory of nondeterminism.** Wall-clock time, PRNGs, IO and
  its timing, scheduling, iteration order, floating-point environment,
  user input, network peers, model outputs. Each gets the same
  treatment: name it, put it behind an interface, turn it into an
  input — the clock a parameter, the PRNG a seed, the user a recorded
  keystroke stream, the model a recorded transcript.
- **API boundaries at the randomness line** (randomness as the emblem;
  the line is the *nondeterminism* line). Place interfaces exactly
  where determinism ends; every door recordable. This is where WASM's
  import boundary, oracle emitters, and the AI-participant recording
  of later chapters all hang.
- **Two determinisms, named separately:** determinize the *machine*
  (seeds, virtual time — NetHack's DevTeam did this in 1987), then
  determinize the *instrument* (capture ground truth at the source
  with nothing between the system and the log — the NOMUX story:
  tmux-and-keystroke capture misaligning frames at speed, poisoning
  ground truth; the fix modifying the C to emit directly; determinism
  and speed bought by the same subtraction).
- **Sometimes you must simulate.** When the real environment cannot be
  captured — hardware, live networks, other players, time itself —
  build the stand-in: virtual clocks, mock peers, simulated terminals.
  Simulation completes the definition: the construction of an
  environment your software can be fully known against.
- **You are in good company** (the industrial validation): FoundationDB
  building a distributed database on deterministic simulation;
  TigerBeetle designing for it from day one; Antithesis making a
  business of a deterministic hypervisor; every property-based testing
  framework printing a seed with each failure. The best engineers
  converged on determinize-then-test independently.
- **Enter NetHack: the model problem** that sustains the rest of the
  book. The C code stands in the place of a model of what humans wish
  to see in the dungeon — forty-six years of accumulated design
  wisdom, in full detail, every rule and exception — but written in a
  language other than the one we must implement in. Sharpened to
  *revealed* intent: after 46 years the artifact and the intent have
  fused; the bugs are lore; there is no spec but the behavior — which
  is the situation of every legacy system on earth, and what makes the
  model problem representative rather than quaint. The whole system is
  mediated by statistics: random numbers thread through every
  monster's move and every dungeon floor. So the first engineering act
  is to make this world deterministic — seed the randomness so the
  dungeon's distribution becomes a function, capture inputs and
  outputs at the source — producing a perfectly deterministic
  simulation of the reference, so its complex rules can be reproduced
  and reasoned about at all.
- **What the foundation buys, immediately:** the strict oracle and the
  session. "Match every random number": choosing an unreasonably
  strict, mechanical definition of correct, on independent channels
  (PRNG, events, screen, cursor — each masking bug classes the others
  expose). And the session — seed, config, keystrokes, recorded ground
  truth in one replayable artifact — as the unit of testing: every
  tool consumes and produces it; every bug becomes a permanent test;
  the corpus grows 19 → 307 across the project. Determinism → oracle →
  session is a dependency chain: replay enables exact comparison
  enables accumulable artifacts. (Full machinery of channels,
  corpus economics, and forking deferred to chapters 4 and 6.)
- Recursion worth one sentence: NetHack's dungeon is itself a
  statistical world on a deterministic core — chapter 2's hybrid
  architecture in miniature, designed in 1987.

*Sidebars:* Knuth's fixed-point arithmetic (determinism designed in,
1982); the WASM import boundary as the modern codification.
*Exercises:* FLAC and git (determinism you must earn); Rogue steps
1–3 (patch the reference, define the session, build the comparator —
the NOMUX exercise).

---

## 4. Time: Instrument the Journey

Knowledge from observation; the timescales pillar. Lessons 42, 17–21,
31, 25, 8–9.

- **On time travel and logging** (the chapter's opening theory).
  Reproducibility is necessary but not enough. In a complex system, by
  the time a problem becomes apparent its causes are long past:
  debugging is a backward problem in a forward-running universe, and
  computation destroys its own history as it runs — state overwritten,
  causes evaporating the moment they finish causing. The discipline is
  deciding in advance which history to save from destruction. Four
  escalating capabilities, each making questions about the past
  cheaper: reproducibility makes the past *revisitable* (O(t) per
  question, and blind); logging makes it *queryable* (a log is an
  index into time — every logged fact is a question pre-answered);
  snapshots and reversible execution make it *navigable* (scrub, jump,
  step backward); forking makes it *branchable* (counterfactuals as an
  engineering operation). And on a deterministic substrate a log is a
  *certificate*, not a diary: log and replay cross-validate — logging
  without determinism is testimony; with it, evidence.
- **The aggregate dimension.** One run's log answers the causal
  question (why did this happen?); logs across many runs answer the
  statistical ones (what usually happens, what changed, where do
  failures cluster) — patterns invisible in any single trace:
  first-failure-depth distributions, divergence clustering, the
  session×commit heatmap. The chapter-2 echo: a deterministic system
  generates uniquely clean data about itself, every point replayable,
  so you reason statistically about the tower without importing
  statistical failure into it. Aggregate log analysis is where Time
  hands off to Mass.
- **The same move at four timescales:** record selected state against
  time, then query and aggregate — within a run (the E channel),
  across a run (RTX, the scrubbers), across a fleet (nightly hunt
  reports), across the project (parity trailers; the timeline
  dashboard as the project's own E channel).
- The E channel as the central move: don't just test the destination,
  checkpoint the journey. Each observed intermediate event is
  simultaneously a **constraint** (wrong mechanisms can't fake the
  right output) and a **probe** (a symptom can never drift far from
  its cause). P as a control-flow hash, S as the endpoint, E as
  curated semantic checkpoints between — covering what P can't see and
  S sees too late.
- Cause-to-symptom distance as the economics of debugging; every
  checkpoint a pre-paid bisection probe.
- The volume paradox dissolved: logging's three costs (runtime,
  storage, attention); only attention is scarce, and attention cost is
  set by report design (first-divergence reporting); the real ceilings
  are signal purity (nondeterministic logging manufactures false
  divergences) and contract weight (each event pins an internal).
- Instrumenting the reference (recorder probes): when attribution
  stalls, log the *reference's* internal state inline with the trace,
  and join the two systems' logs on a shared monotonic key — chosen so
  neither side can perturb it (game turns, not call counts).
- Reversibility as instrumentation of time itself: RTX — journaled,
  invertible effects; rollback, replay-N; the engine behind scrubbing
  and (later) collaboration. Callback to chapter 2's algebraic
  composability: this is what the algebra buys.
- Measurement woven into history: parity trailers in every commit,
  revert-safe by construction; the timeline dashboard and
  session×commit heatmap as *views* over disciplined data.
- Doneness as a distribution: steady-state divergence hunts;
  first-failure depth as the metric; the lengthening tail as the shape
  of "done."
- **Timescales as a knob** (this pillar owns tempo): fast and
  exhaustive variants of the same verification; fast while exploring,
  exhaustive at landing; pinning the world (hash-pinned worktrees)
  while measuring it. What a hunt costs; when to run which.
- *Goodhart thread:* the frozen ruler. Judges that never move
  (monk's 44-session judge making a ceiling legible); canonical
  recordings, never re-records.

*Sidebars:* TRIP, 1984 — the internal-trace channel Knuth shipped with
TeX; golden logs and test ROMs of the emulator scene. *Exercises:*
CPU emulator (a pre-built E channel, then the day Harte passes and
nestest fails); DOOM per-tic traces; FLAC 10× under a frozen oracle.

---

## 5. Structure: Analyze the Form

Knowledge from structure; the formal pillar. Lessons 43, 12–16, 11,
28.

- Tests are existential; static checks are universal. Your output is
  code, a formal language: properties of *all* executions are
  checkable when no finite test set implies them.
- Semantic gaps between source and target breed *correlated* bug
  classes — blocking IO vs. event loop, pointers vs. references — and
  correlated error demands whole-artifact treatment: the defect is in
  the translation rule, not the instance.
- The async story in full: the effect system neither language had,
  built in a few hundred lines on a parser; the checker as propagating
  *fixer* (2,747 functions colored, 22,120 awaits inserted, one
  verified migration); the cure for confabulation is a checkable
  invariant — nothing left to have a religion about.
- Structure preservation directly checked: every reference function
  has a counterpart, every call edge a matching edge — the port as a
  homomorphism, verified in seconds, untestable by any suite.
- Scanners ratcheted to zero and held (844 → 266 → 0; suppressions
  only shrink); tiny permanent guards for recurring foot-guns.
- **The monk narrative lives here:** the readable-transpiler
  counter-experiment — genuine methodological innovation, a hard
  24/44 ceiling, and the diagnosis: the killer constraint (cross-file
  async coloring) was global, the architecture was local, and the bet
  was never made falsifiable early. Method cannot rescue an untested
  premise. Paired with the inverse case: why transpilation *won* for
  TeX (Knuth wrote it to be translated; the Pascal→C gap is narrow) —
  the semantic gap decides the method.
- *Goodhart thread:* lint-enforced boundaries — mechanical walls the
  optimizer cannot argue with (the fairness boundary previewed; fully
  in chapter 6).

*Sidebars:* web2c — the production TeX everyone runs is a mechanical
translation of the author's own source; the published-but-wrong OT
algorithms, refuted by mechanical checking. *Exercises:* Lua (the
coroutine memo, due week one, pass/fail); awk (references that
disagree); the awk→JS compiler judged by your own interpreter.

---

## 6. Mass: Manufacture the Tests

Knowledge from volume; the statistical pillar, wielded *for* the
deterministic tower. Lessons 44, 22–26, 32, 39.

- The supplied suite defines the score, not the coverage; at scale you
  need a generator; for interactive systems the generator's ceiling is
  its *competence* as a user. To test NetHack well you must play
  NetHack well.
- **Import competence; don't synthesize it.** The four forms: codified
  (the NeurIPS-winning symbolic agent, ported across a version gap —
  possible only because the champion was legible code, not weights);
  recorded (3.58M human games; DOOM's demo archive; VimGolf); live
  (the human contest; one deeply-exercised 737-step session driving
  71% of a phase); amortized (wizard mode and state injection turning
  moderate competence into deep coverage — don't start every test in
  the lobby).
- The evaluator/evaluatee inversion: anyone who used your system to
  benchmark agents has built an agent that can test your system.
- The deterministic autoagent (chapter 2's question answered in
  practice): policy as a pure function of observation plus seed; the
  fleet as a replayable instrument; pre-registered experiment matrices
  (88 of them) as the discipline; "determinism is what turns an agent
  from a demo into an instrument."
- Adversarial search for the tail mass fuzzing misses; session
  mutation and beam search toward earliest divergence; forking — a
  good test is a *prefix*, and a forkable corpus compounds.
- External ground truth, earlier than feels necessary: the NAO data
  reframing the whole campaign (the fleet over-surviving and
  under-descending); a project that measures only itself optimizes the
  wrong thing with precision.
- *Goodhart thread:* held-out test cases — you can't overfit what you
  can't see (the contest's secret sessions; the sealed arXiv sample);
  and the fairness boundary in full: the lint-enforced wall between
  the agent's strategy and oracle data, because an agent that reads
  the oracle makes every number beautiful and false.

*Sidebars:* the DSDA demo archive — thirty years of recorded expert
competence, curated free; the NeurIPS NetHack Challenge result.
*Exercises:* perft (the corpus of master games); the deterministic
autoagent; DOOM's inherited corpus; Rogue step 5 (hunts and
first-failure depth).

---

## 7. Mind: Keep the Human Oriented

Knowledge as the capacity to decide; the agency pillar. Lessons 45,
34–38, 1–7, 10, 30, 2, 40.

- Stuck is a comprehension state, not an effort state: more
  agent-hours don't unstick a project; more legibility does. The human
  is the loop's scarcest resource and narrowest channel; engineer the
  interface before the stall.
- The legibility foursquare (micro/macro × what-is/why-so):
  failing-session scrubbers and the cell-level parity debugger; the
  project timeline and heatmap; per-subsystem design docs; metadesign
  documents about the process itself. Plus the two contents the grid
  hides: legibility of *absence* (coverage maps, open questions) and
  of *intent* (plans — shortest half-life of all artifacts; keep them
  small and regenerate).
- Human-in-the-loop without human-legible instruments is
  human-in-name-only: an unobserved supervisor is a rubber stamp, and
  the religion survived precisely because no instrument made the
  mechanism visible to the person responsible for doubting it.
- Memory: institutional knowledge compounds only when entries are
  dense, short, and *cited* (LORE: 229 topics, cross-cited; strategy
  docs written and never cited, decayed); memory scopes (project-wide
  vs. per-agent); decision logs against re-litigation.
- Deciding in advance: pre-registration converting "does this help?"
  from argument to lookup; exhaustion criteria making "stop" a legible
  event; the restart as a priced decision — when the frame itself is
  contaminated, restart is cheaper than repair.
- The fleet as diversified mind: different models, different blind
  spots; identities, worktrees, commit trailers; knowledge flowing
  through the repo, never through chat; the watchdog (delegated
  supervision); not every role survives selection.
- Tools for the agents' minds: sherpa — stateless, one invocation one
  observation, high-level verbs; how an AI *writes* a test, as
  scrubbers are how a human reads one.
- *Goodhart thread:* pre-registration as the defense of judgment —
  goalposts driven into concrete before the evidence arrives.

*Sidebars:* Pernosco — collaborative time-travel debugging as a
product; Etherpad and the lineage of shared sessions. *Exercises:*
the time-machine terminal; every project's build-the-scrubber step;
Rogue's harness graded as heavily as its port.

---

## 8. Conclusion: The Tower and Its Builders

- **The immune system, named.** The thread that ran through all four
  pillars assembled in one place: held-out cases defend Mass; frozen
  judges and canonical recordings defend Time; lint-enforced
  boundaries defend Structure; pre-registration defends Mind. One
  principle four ways, because a loop full of optimizers games any
  measurement not structurally defended — and both original failure
  modes were Goodhart events. Much of the book, re-read, was this
  chapter in disguise.
- **The replication experiment.** The contest as the framework's own
  medicine: publish the problem, hand over the tools, score everyone
  with a judge that cannot be sweet-talked, punish overfitting by
  design (secret sessions; score divided by change-churn). The interim
  record reported honestly, whatever it is at press time — a dozen
  contestants, the stall, the methods published mid-contest, and what
  happened next. The chapter's ending is not yet written, and saying
  so is its strength.
- **The ladder.** Every verified session becomes shareable; every
  shared session can admit a recorded machine participant;
  verification survives each rung. The boundary-recording motif as
  chapter 2's hybrid architecture, engineered: the statistical
  component quarantined behind a recorded interface. AI in the loop,
  verifiability preserved.
- **The role of the programmer**, closing where chapter 1 opened: you
  do not write the code; you do not review every line; you maintain a
  skeptical eye, you manage the strategy, and you invest in the tools
  that expand the common understanding of humans and AIs — and you
  decide where the boundary goes, and you defend it.

*Exercises:* the capstones — TeX passing TRIP; AI-assisted
collaborative digram, the one project with nothing to port.

---

## Appendices

- **A. The fifteen projects** — HOMEWORK.md, with Track C (the
  collaboration ladder).
- **B. The 47 lessons** — reference card form: lesson / illustration /
  signs-you-need-it.
- **C. The technique catalogue** — the evidence base with measured
  numbers.
- **D. A reader's guide to the public record** — the logs, the repos,
  the contest, and how to check the book's claims yourself.

## Consolidation map (from the earlier 16-chapter draft)

| Absorbed material | Now lives in |
|---|---|
| Three Attempts (case-study chapter) | Seeded in ch. 1; NetHack introduced properly in ch. 3; monk in ch. 5; contest in ch. 8 |
| Choosing the Oracle | Decision in ch. 3 (with the model problem); machinery in ch. 4 |
| The Session as unit | Introduced in ch. 3; corpus economics and forking in ch. 6 |
| Decide in Advance | Ch. 7 (judgment), with the 88-matrix practice in ch. 6 |
| Defend the Measurements (Goodhart) | Woven per pillar (chs. 4–7); assembled in ch. 8 |
| The Tempo (economy) | Condition in ch. 1; the knob owned by ch. 4 (timescales) |
| The Fleet / multi-agent | Ch. 7 (diversified mind) |
| Replication / contest | Ch. 8 |
| Epilogue | Ch. 8 closing |
