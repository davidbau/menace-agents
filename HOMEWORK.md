# Homework: Verified-Exact Porting Exercises

**Companion to:** [LESSONS.md](LESSONS.md) (the 47 lessons these exercises
teach) and [data/analysis-techniques-catalogue.md](data/analysis-techniques-catalogue.md)
(the full-scale techniques the exercises practice in miniature).

Each project below was chosen by the same checklist:

- a **deterministic reference implementation** exists (or determinism is
  cheaply achievable) — Lesson 0;
- a **frozen judge already exists** — someone else paid to build a
  conformance test, golden trace, or torture input;
- a **real-world corpus** exists for held-out testing — Lesson 46;
- the port crosses an **instructive semantic gap** — Lesson 43;
- the judge doubles as an **autograder**, so the exercise scales to any
  class size.

## The two tracks

Every project has two assignments built on the same substrate:

**Track A — the port.** Reimplement the reference so that a mechanical
judge cannot tell the two apart. Nothing is a matter of opinion: the
deliverable passes or it does not. Track A teaches the verification
stack — the oracle, the E channel, the checkers, the corpus, the
divergence hunt. The artifact is almost beside the point; the *method
artifacts* (instrumentation, static checks, generated tests, legibility
tools) are what get graded alongside the pass rate.

**Track B — the extension.** Build something that did not exist before,
at the same standard of fidelity Track A demanded. The constraint is
the lesson: high-quality extension means *the frozen oracle still
passes* while the new capability is added, or it means *becoming the
reference* — publishing new verified ground truth that others can
port against. Track A consumes ground truth; Track B produces it.

A note on training-data contamination: several of these substrates have
existing ports in every model's training data. For homework this is
fine — students are graded on demonstrating the method, not on the
novelty of the artifact. For *benchmarks* it matters; see the notes on
each project.

## The ladder

| # | Project | Scale | Frozen judge | Emphasized pillar |
|---|---------|-------|--------------|-------------------|
| 1 | Chess movegen + perft | weekend | perft tables | Oracles, volume |
| 2 | CPU emulator (CHIP-8 → 6502/GB) | 1–2 weeks | Harte JSON tests, nestest.log, Blargg ROMs | Time (E channel) |
| 3 | FLAC decoder | 1–2 weeks | bit-exact PCM vs libFLAC | Determinism, economy |
| 4 | Git plumbing | 2–3 weeks | hash equality (self-judging) | Substrate |
| 5 | awk, byte-exact | 2–3 weeks | one-true-awk + POSIX + script corpus | Structure |
| 6 | Lua interpreter | 2–4 weeks | PUC official test suite | Structure (semantic gap) |
| 7 | Rogue with PRNG parity | 2–4 weeks | **none — students build it** | The whole stack |
| 8 | DOOM, demo-sync faithful | 4–8 weeks | DSDA demo corpus | Mass, determinism |
| 9 | TeX passing TRIP (capstone) | 6–12 weeks | TRIP / etrip / arXiv | Everything |

---

## 1. Chess move generation + perft

**Reference & ground truth.** `perft(n)` — the exact count of legal
move sequences from a position to depth n. Published tables exist for
the start position and standard trap positions (Kiwipete and friends:
en-passant pins, underpromotion, castling through check). A one-count
divergence at depth 6 means a bug; bisecting it by dividing perft per
move is divergence-hunting in miniature.

**Track A.** A legal move generator whose perft matches the published
tables on all standard positions, plus Chess960 castling. Judge is a
30-line script. Millions of recorded games (PGN archives) are the
imported-competence corpus: replay them and assert every played move
is generated and legal.

**Track B.** Two options. (a) Write a fast bitboard generator and
*cross-verify it against your own slow, obviously-correct one* over
millions of random positions — the dual-implementation oracle, plus
optimization under a frozen judge. (b) Become the reference: compute
and publish verified perft tables for a variant that lacks them,
with the verification methodology documented.

**Teaches.** Lessons 17 (strict oracle), 25 (doneness), 44 (imported
corpus). **Watch out for:** the temptation to debug by staring;
force the bisection discipline from day one.

---

## 2. CPU emulator (CHIP-8, then 6502 or Game Boy)

**Reference & ground truth.** The emulator scene independently invented
the whole methodology, and left it lying around: Tom Harte's
ProcessorTests are per-instruction JSON records of complete before/after
CPU state — a pre-built E channel with thousands of cases per opcode;
NES's `nestest.log` is a golden instruction-by-instruction trace to
diff — a session; Blargg's and Mooneye's test ROMs are adversarial
torture inputs. Every real cartridge is a held-out test.

**Track A.** CHIP-8 as the two-day warm-up, then a 6502 or Game Boy
CPU passing the Harte tests instruction-by-instruction, then
`nestest.log` line-for-line, then the Blargg ROMs. Tiering matters:
functional accuracy first, cycle accuracy as the stretch goal — the
loose/exact regime distinction made concrete.

**Track B.** (a) A time-travel debugger: snapshot ring + rollback +
scrubber over the running emulator — RTX in miniature, with the
determinism Track A verified making it possible. (b) Become the
reference: publish Harte-style JSON ground truth for a chip that lacks
coverage, generated from instrumented hardware or a verified emulator,
with the instrumentation method documented (Lesson 31: instrument the
reference).

**Teaches.** Lessons 42 (E channel — you are handed one; notice how it
feels), 0 (determinism), 20 (reversibility). **Watch out for:**
passing Harte tests while failing nestest — integration order bugs
that per-instruction tests can't see; that gap *is* the lecture.

---

## 3. FLAC decoder

**Reference & ground truth.** Lossless means the decode side is
bit-exact *by definition*: every FLAC file must decode to
byte-identical PCM against libFLAC. Unbounded corpus — any music
collection, plus files you generate yourself from WAV with chosen
encoder settings.

**Track A.** A decoder producing byte-identical PCM over a large
corpus, including the adversarial corners (odd bit depths, unusual
block sizes, mid-stream metadata). Held-out: files encoded with
settings the student never saw.

**Track B.** Make it an order of magnitude faster — SIMD, workers,
WebGPU, whatever — **without changing one output bit**. Optimization
under a frozen oracle is a skill in itself, and this is its cleanest
possible exercise. Companion lecture: the MP3 conformance spec defines
correctness with an RMS *tolerance* — the loose regime written into a
standard — and comparing the two specs teaches students to ask where
behavior is exactly specified and where it is free.

**Teaches.** Lessons 0, 8 (fast/exhaustive variants of the verify
loop). **Watch out for:** floating-point in the decode path; the
format is integer all the way down, and reaching for floats is the
classic self-inflicted nondeterminism.

---

## 4. Git plumbing, byte-exact

**Reference & ground truth.** Content addressing makes the system
*self-judging*: if your `commit` produces the same SHA as real git's,
every byte beneath it matched — object formats, canonical sorting,
timestamps controlled. No harness needed; the hash is the judge. Any
repository on Earth is a test case.

**Track A.** `init` / `hash-object` / `add` / `commit` / `log` /
`checkout`, producing hash-identical objects and valid packs; verify
by round-tripping real repositories and cross-checking with
`git fsck` and `git cat-file`. Determinism discipline is the hidden
curriculum: author dates, committer identity, and index ordering must
be pinned before anything matches (Lesson 0 in a new costume).

**Track B.** Wire-protocol interoperability: clone from and push to
real git servers, byte-verified — your objects, their server, no
translation layer. Alternative: a new storage backend (e.g., SQLite)
that is bit-compatible at every interface — same hashes, same wire
format — demonstrating that exact compatibility and internal
innovation are independent axes.

**Teaches.** Lessons 0, 33 (choose an artifact that verifies itself).
**Watch out for:** "it works on repos I created" — real-world
repositories are the held-out set, and they are full of history your
generator never produces.

---

## 5. awk, byte-exact

**Reference & ground truth.** The one-true-awk (bwk) and gawk, POSIX
semantics, and fifty years of real awk scripts in the wild as corpus.
Byte-exact includes stdout, stderr, exit codes, and error messages.

**Track A.** An awk whose output is byte-identical to the reference
across a curated corpus of real scripts plus a generated adversarial
set (numeric/string coercion edges, uninitialized variables, getline
in all its forms, locale pitfalls). Differential testing against *two*
references (bwk awk and gawk) teaches an honest subtlety: references
disagree, and the student must decide what the oracle is — spec,
implementation, or intersection.

**Track B.** An awk-to-JavaScript compiler, differentially verified
against the student's own interpreter over the whole corpus: every
script compiled must produce byte-identical output to the same script
interpreted. New artifact, and the oracle is self-referential — Track
A becomes the judge for Track B.

**Teaches.** Lessons 43 (the compiler *is* applied static analysis),
24 (adversarial generation), 46 (what do you do when references
disagree?). **Watch out for:** locale and floating-point formatting;
`printf %g` will consume a weekend if the student lets it.

---

## 6. Lua interpreter

**Reference & ground truth.** PUC-Rio's reference implementation
(~30K lines of clean C) ships with the official test suite. Bit-exact
here means: values, error *messages*, integer/float arithmetic
semantics, string formatting, iteration order where defined.

**Track A.** A Lua 5.4 in JS/TS passing the official suite. The
pedagogical core is **coroutines**: Lua has stackful coroutines,
JavaScript does not, and the student faces a genuine cross-cutting
semantic gap — the same *shape* of problem as C-blocking-IO-to-async
that dominated the NetHack port. The student who tries to test their
way through it will suffer instructively; the student who confronts
the gap architecturally (CPS transform, generator lowering, or an
explicit stack machine) and writes the checker for their invariant
will not. Assign the postmortem: which were you?

**Track B.** Serializable VM state: snapshot a running Lua program —
including live coroutines — to bytes, restore it elsewhere, resume
identically. The reference implementation cannot do this. Verify by
record/replay: a snapshotted-and-restored run must produce output
identical to an uninterrupted one. A genuinely new capability, held to
an exact-equivalence standard.

**Teaches.** Lessons 43 and 28 (test the killer constraint *first* —
require a coroutine design memo in week one, before any porting).
**Watch out for:** deferring coroutines to the end. That is the
monk mistake, and it should cost the grade the memo was designed to
protect.

---

## 7. Rogue with PRNG parity — build the harness yourself

**Reference & ground truth.** Original Rogue (~15K lines of 1980s C),
seeded PRNG. **Deliberately, no pre-built judge exists.** Every other
project hands students a frozen judge; this one makes them build the
entire verification stack — because that skill, not any particular
port, is the course.

**Track A.** In order: (1) make the C reference deterministic and
recordable — patch it to log PRNG calls and screens directly, no
terminal middleware (the NOMUX exercise; Lesson 0); (2) define the
session artifact (Lesson 33); (3) build the comparator with PRNG,
event, and screen channels (Lessons 17, 42); (4) port the game to
parity on a session corpus; (5) run seeded divergence hunts and report
first-failure depth (Lesson 25). Grade the harness as heavily as the
port.

**Track B.** A mini-autoascend: an automatic Rogue player competent
enough to fuzz deep game states, with a fairness boundary separating
its strategy from oracle data (Lesson 46), plus wizard-style state
injection for depth. Students rediscover why building the player is a
project inside the project — and why it pays.

**Teaches.** The entire stack, in miniature, in the order the real
project learned it. This is the midterm. **Watch out for:** students
porting game code before the recorder is trustworthy; enforce the
sequencing.

---

## 8. DOOM, demo-sync faithful

**Reference & ground truth.** DOOM's demo files replay recorded input
tick-by-tick, and desync unless the engine reproduces the original's
behavior exactly — PRNG calls, movement arithmetic, monster AI, all of
it. The community has curated this for decades: Chocolate Doom exists
precisely to preserve vanilla behavior, and the DSDA archive holds
tens of thousands of expert speedrun demos — recorded competence,
free, each one a session (the NAO xlogfile of this substrate).

**Track A.** A JS DOOM that plays a corpus of DSDA demos without
desync, verified by per-tic state traces harvested from an
instrumented Chocolate Doom (Lesson 31: students must instrument the
reference to get their E channel — it is not handed to them this
time). Held-out: demos from map/category combinations never seen
during development.

**Track B.** Rollback netcode built on the determinism Track A proved:
peer-to-peer play with prediction and rollback, verified by the
property that a rolled-back-and-replayed timeline is bit-identical to
a never-interrupted one. Alternative with real users waiting for it:
desync *diagnosis* tooling for the speedrun community — given a demo
that desyncs on a modern port, localize the first divergent tick and
the responsible subsystem, with a scrubber.

**Teaches.** Lessons 44 (the corpus is already collected — notice how
much that is worth), 31, 20. **Watch out for:** undefined behavior in
the original C (uninitialized reads that historical binaries resolved
consistently); this is where "faithful to what, exactly?" stops being
philosophical.

---

## 9. TeX passing TRIP — the capstone

**Reference & ground truth.** `tex.web`, the most thoroughly
documented program in existence, and TRIP, the 1984 ancestor of this
whole methodology: a single adversarial session exercising nearly
every line, judged on an internal-trace channel (`trip.log`, tracing
on — an E channel) and an output channel (`trip.dvi` via `dvitype`),
with an explicit tolerance list. Passing TRIP has gated use of the
name "TeX" for forty years. Human baseline on the record: NTS took
funded years to get there, and its successor never did.

**Track A.** A from-scratch TeX in a modern language passing TRIP —
which, as far as the record shows, has never been done in JavaScript,
Rust, or Python. Then e-TeX's `etrip`, then load a frozen LaTeX format
and hold a sealed sample of DVI-era arXiv papers as the held-out
corpus (every paper compiles to ground-truth DVI bytes under canonical
TeX). Optional experiment worth publishing on its own: port once with
Knuth's literate prose available, once with it stripped, and measure
whether the world's best program documentation actually helps agents.

**Track B.** Three shapes, ascending ambition. (a) A Knuth-Plass
paragraph-breaking library for the web, verified to choose the *same
breakpoints* as TeX on a corpus — TeX-fidelity paragraphs as an
embeddable component. (b) The exact math core: port `mlist_to_hlist`
with scaled-point arithmetic and TFM metrics, emit SVG, verify glyph
placements against DVI ground truth over a million arXiv formulas —
TeX-exact math native to the web, the thing MathJax's architecture
cannot become. (c) Modern fonts: HarfBuzz shaping alongside TRIP
conformance in compatibility mode — the XeTeX path, walked with a
verification stack.

**Teaches.** Everything, plus the history: the student ends the course
by extending a verification tradition Knuth started before they were
born. **Watch out for:** TRIP overfitting — it is one public test and
Knuth himself warned that passing it proves conformance, not
correctness; the sealed arXiv sample is not optional (Lesson 46).

---

## Further directions

- **Metafont + TRAP** — TeX's sibling has its own torture test; a
  natural second capstone or paired-team project.
- **SQL engine vs. sqllogictest** — millions of queries with ground
  truth agreed across multiple engines; conformance-corpus testing
  without a single reference implementation. Post-capstone scale.
- **NetHack** — the final boss. Not homework; independent study. The
  full account of what it takes is in [REPORT.md](REPORT.md) and
  [LESSONS.md](LESSONS.md), and the contest remains open.

## A note on why every project is a *port*

The exercises all take the same shape — reproduce a reference exactly,
then extend it without breaking the oracle — because that shape is the
one that makes agent work verifiable end to end (Lesson 17) while
still demanding every pillar: determinism, instrumentation, formal
checking, test volume, and human orientation. Students who internalize
the shape can transfer it to work that is not a port at all: the
transferable object is the verification stack and the habit of
choosing an oracle you cannot sweet-talk, not the porting itself.
