# Menace + Teleport + Monk Rollup — Updated 2026-07-11

> A combined analysis of three human-led agent porting projects:
> menace (48 days, completed Mar 25), teleport (~104 days in, active),
> and monk (~68 days in, hit architectural ceiling). This rollup extends
> [REPORT.md](REPORT.md) through the current period. Two snapshot rollups
> are preserved below: the May 1 rollup (day 33 of teleport, before monk
> was fully established), and the July 11 rollup (day 104 of teleport,
> day 68 of monk).

---

# Rollup 2: July 11, 2026 — Day 104 of teleport, Day 68 of monk

> The extended teleport port ran another 71 days after the May 1 rollup.
> During that period, the project quietly forked a second time: a monk
> port using a "readable transpiler first" approach was spun up on May 5.
> Both are analyzed here.

## The Three Projects in One Table

| Metric | Menace (final) | Teleport (day 104) | Monk (day 68) |
|---|---|---|---|
| Duration | 48 days | 104 days | 68 days |
| Approach | CODEMATCH hand-porting | Translator + hand-port hybrid | Readable transpiler + patchFile |
| Result | 556/563 sessions | 307/307 fixed suite at 100% | 24/44 fixed suite |
| Codebase | ~450 KLoC C → JS | ~450 KLoC C → JS | ~450 KLoC C → JS |
| PRNG events at 100% | (unpublished total) | 3.8 M | 4804/4804 seed0013 |
| Session channels | 3 (RNG, Events, Screen) | 4 (RNG, Events, Screen, Cursor) | 3 (RNG, Events, Screen) |
| Active agents | 4-5 (final month) | 5 (maud, cleaver, xorn, golem, contestant) | 1 (monk) |
| Signature technique | LORE + CODEMATCH | Autoascend as fuzzer + RTX oracle | PRNG-index-aligned C recorder probes |
| Model diversity | Claude Opus 4.6 + Codex GPT-5 | Claude Opus 4.7+, Codex GPT-5.3, Gemini | Claude Opus 4.7 |
| Auto-memory files | 229 (LORE topics) | 210 (cleaver) + 169 (monk) + 38 (maud) | 169 |
| Verdict | Successful, browser-playable | Successful, converging to <5% divergence rate | Architectural ceiling; genuine methodology innovations |

## Teleport: What Changed May 1 → July 11

Since the previous rollup (day 33), teleport ran another 71 days. Headline
changes:

- **Session channel model expanded from 3 to 4** — Cursor was added as a
  separate parity channel, enabling detection of divergences that were
  previously masked when cursor position drifted independently of screen
  content. All 307 sessions now match on all 4 channels.
- **Xorn's 26-day continuous Codex rollout** — the Jun 2 rollout ran
  continuously through July 11, producing 2,255 commits and closing 186
  issues, dominantly on RTX (reversible-transaction) engine work. Xorn's
  scan-semantic tightening drove findings from 844 → 266 (June) and
  eventually to 0 unmatched suppressions (July 9).
- **The autoascend campaign** — cleaver ran 88 pre-registered matrices
  (m1–m88) turning autoascend into both a productivity multiplier and
  a fuzzer. The fleet's autoascend baseline at m87: 59 deaths / 130
  sessions / 0 hard-stops / 43 depth-4+ / 49 median depth. Sokoban
  chain live end-to-end (first organic solve seed21 t1129).
- **The RTX (reversible transactions) engine** — 10 core modules plus
  5 diagnostic tools plus 234 rtx-oracle invocations. RTX_JOURNALING is
  what enables multiplayer, rollback, and replay-based verification.
  Issues #825 (Phase 1), #827 (proxy traps), #861 (occupation
  journaling), #862 (replay-N Luck), #865 (visual cache rollback) all
  landed with 263/263 → 307/307 depth-5 oracle passing.
- **The 500×100 divergence hunt as steady-state measurement** — a
  Jul 7 hunt found 22 actionable divergences in 500 sessions (4.4%).
  By Jul 11 the first-failure depth had lengthened to 7, 32, 51, 112,
  479 across five consecutive hunts. The tail lengthening is the port
  becoming done.
- **Estimation engine + oracle calibration** — HUNGER_BANDS midpoints
  refit from 966K oracle-emitter records: Satiated 1500 → 1055,
  Normal 575 → 489. Prayer estimator refitted from 800 → 1300 for
  lycanthropy (invalid rate 22.24% → 1.05%).
- **The parity pivot to autoascend performance** — David explicitly
  redirected cleaver on Jul 1: "i'm more interested in performance
  benchmarking to improve the quality of the autoascend agents."
  Divergence hunts were deferred to xorn; cleaver focused on fleet
  behavior. Phase 2 reactive playbooks hit a firm 104-death floor;
  Phase 3 pre-emptive design pending.

### Agent activity May 1 → July 11

| Agent | Model | Role | Latest activity |
|---|---|---|---|
| maud | Claude Opus 4.7+ | Main-tree porting, subagent orchestrator | Jul 11 (active) |
| cleaver | Claude Opus 4.7+ | Autoascend campaign lead, audit methodology | Jul 11 (active, new session Jun 27) |
| xorn | Codex GPT-5.3-Codex-Spark | RTX engine, 500×100 hunts, scan-semantic | Jul 11 (active, continuous Jun 2 rollout, 2.0 GB) |
| golem | Gemini | Infrastructure, stub consolidation | Sparse (last major work Apr–May) |
| contestant | Claude | Contest tree | Dormant (May 3 only) |
| naga | Claude Opus 4.6+ | (dormant since Apr 7) | — |

## Monk: The Third Port

A parallel port launched on May 5 as a counter-experiment: could a single
high-quality **readable transpiler** produce JavaScript idiomatic enough
that the port would not need CODEMATCH-style hand curation?

### Architecture

Monk is built on three pillars:

1. **The translator** (`tools/c2js/build.mjs`) — a single-pass transpiler
   that lowers C to readable JS on a **single translation unit (single-TU)** model.
2. **The frozen 44-session judge** (`frozen/score.sh`) — `js/translated/` is
   a hand-curated snapshot the translator drifted past. The scored engine
   is the frozen snapshot.
3. **PatchFile discipline** (`build-engine.mjs`) — hand-fixes injected via
   regex-anchored patchFiles that get re-applied on regen. NH_EMIT_ASYNC=1
   gates the async injection pass.

### What worked

- **24/44 PASS reached** — a genuine accomplishment against a real C codebase.
- **7-class translator lowering-bug taxonomy formalized**:
  - #11 char-buffer walker writes (`*ptr++=c`) — OPEN
  - #13 `&scalar @ genericptr_t` — CLOSED
  - #14 char-element compound-assign (`buf[i]+=N`) — CLOSED
  - #15 pointer arithmetic — MOSTLY LANDED
  - #16 await-coloring indirect callbacks — PARTIAL
  - #172 postfix `*ptr++` read — CLOSED
  - #18 char* OUT-param demotion — **REVERTED** (unit tests passed, full build regressed 20→8)
- **Scalar-ptr-writeback exhaustively closed** (3 of 3 instances) — the
  set-mon-data fix alone drove +13842 PRNG on seed0108.
- **Save/restore PRNG fully matched** — seed0013-friday13 4804/4804.
- **Recorder-probe methodology** — monk's signature. UMOVE2, DOGM, RUNCHK,
  DGOAL C-side probes correlated by `game.moves`. Seed0015 root confirmed
  end-to-end via one probe session.

### Where it hit the ceiling

- **Cross-TU async coloring is architecturally unresolvable at single-TU
  scope.** The async closure (functions transitively calling `pline` →
  `win_nhgetch`) spans 100+ files. Full-tree regen with NH_EMIT_ASYNC=1
  reorders PRNG (breaks seed8000 at call 516) because await insertion
  changes control flow.
- **PatchFile discipline turns hand-fixes into maintenance debt.** When
  the translator advances past a patchFile anchor, the patch silently
  no-ops. Whole-file patches must use `return JSON.parse("<double-src-encoded>")`;
  literal strings fail silently. Six+ patchFiles are currently "drifted."
- **Frozen scored engine decouples judge from translator.** Every
  translator-only advance is *latent* — verified by self-test but
  invisible to the 44-session score until regen + re-curation. Fixes
  like d8a6da1 (circle_ptr), ff83690 (string-demotion), 2245f3f (glyphs)
  are stranded.
- **String-vs-buffer OUT-param demotion trap** (#18) — the classification
  is load-bearing for 12 exercised display functions. Fixing it broke
  more than it fixed.
- **Capture-js-trace multi-segment mirage** — `scripts/capture-js-trace.mjs`
  does not thread storage across segments, so segment 2's restore never
  sees segment 1's save. This produced false "div at getbones rn2(3)"
  verdicts on save/restore sessions. The judge threads storage correctly.

### The verdict on monk

Monk's approach is architecturally limited, but **its methodology
innovations are real** — particularly the PRNG-index-aligned recorder
probes. The catalogue in [analysis-techniques-catalogue.md](data/analysis-techniques-catalogue.md)
credits monk as the origin for that technique even though monk itself
cannot land it in the scored engine.

## What Both Projects Prove Together

1. **Iteration speed is a per-decision knob, not a fixed tool property.**
   Both projects paired fast/slim (`pes-fast`, `parity-line`, `skeleton-diff
   | head`) with exhaustive/slow (`pes-report`, `parity-history`, full-tree
   scan). Fast during exploration; exhaustive at landing.
2. **Autoascend as fuzzer scales what human recordings cannot.** Building
   a competent auto-player was a project inside a project, but it
   paid back many times over as a coverage engine.
3. **PES parity history in git commit trailers is a quiet-but-load-bearing
   design decision.** Metrics are correlated to commits by design; the
   record is queryable via `parity-history.mjs` parsing `git log`.
4. **Multi-agent collaboration compounds when blind spots differ across
   models.** Claude, Codex, Gemini working on different niches; xorn's
   verify-before-push discipline complements cleaver's pre-registration
   discipline complements monk's forensics discipline.
5. **NAO (nethack.alt.org) top-player data is a load-bearing external
   ground truth.** 3.58 M game histories, 108 top-player RC files, 239
   dumplogs reframed the autoascend fleet metric from "early deaths"
   to "depth pacing" and grounded Phase 3 architecture in the human
   depth distribution.

## Open Questions for the Next Rollup

1. **Can Phase 3 pre-emptive gates break through the 104-death floor?**
   Phase 2 reactive playbooks hit a firm ceiling. Phase 3 requires
   detecting danger *before* the damage window opens.
2. **Will monk's latent translator fixes ever land, or is monk complete
   as a preserved counter-experiment?** Landing them requires a
   multi-week re-convergence.
3. **When does the 500×100 hunt tail become long enough to declare the
   port done?** Recent first-failure depths of 7 to 479 suggest it is
   approaching but has not reached done-ness.
4. **Does the estimation-engine calibration methodology generalize
   beyond hunger + prayer?** More estimators (uluck, ualign,
   pet_hungrytime) are pending.
5. **Is there a fourth port worth attempting** — one that starts with
   teleport's LORE plus monk's recorder-probe methodology as inherited
   infrastructure?

---

# Rollup 1: May 1, 2026 — Day 33 of teleport (original)

> The original May 1 rollup. Preserved verbatim below. This was written
> before monk was established as a distinct third project.

---

## The Two Projects in One Table

| Metric | Menace (final, Day 48) | Teleport (Day 33, May 1) |
|---|---|---|
| Duration | 48 days, completed | 33 days, ongoing |
| Total commits | 6,272 | ~5,040 (origin/main since Mar 29) |
| Commits/day average | 131 | 153 |
| Session suite | 563 sessions | 82 sessions |
| Passing | 556/563 (98.8%) | 80/82 (97.6%) |
| Codebase | ~450,000 lines C → JS | ~450,000 lines C → JS (same target) |
| LORE knowledge base | 17,242 lines, 229 topics | ~16,000+ lines, 440+ topics |
| Active agents | ~4-5 (cleaver, mac, maud, xorn) | 4 (cleaver, xorn, maud, mac) |
| Browser playable | Yes | **No** |

The headline: **teleport reached parity numbers at day 33 that took menace
~46 days to achieve, on a smaller-but-deeper session suite, but has not
yet shipped browser playability — the original goal of the whole project.**

---

## What Changed Since the Apr 22 Snapshot

The previous teleport analysis covered through Apr 22 (52/72 passing).
Since then, in 9 days:

- **1,145 new commits** on origin/main (avg 127/day; peak 211 on Apr 30)
- **Session suite grew** 72 → 82 (added 10 deep sessions including a
  full ascension run, a 9-segment bones round-trip, and a 115,000-step
  coverage session)
- **Pass rate climbed** 52/72 → 73/73 (Apr 27, first all-pass) → 78/78
  (Apr 28) → 80/82 (May 1, after suite expansion)
- **Model upgrade mid-project**: cleaver transitioned from Claude Opus 4.6
  to 4.7 around Apr 28, no disruption
- **New methodology emerged**: the "wiring-oversight audit" — Waves III,
  IV, and V — produced 60+ commits and ~40 LORE entries
- **Sherpa tooling matured**: multi-segment keyplans, named-target
  aliases, `run-until` verb — order-of-magnitude improvement in
  session-authoring speed
- **PROJECT_PLAN.md was archived** (moved to `docs/archive/`) on Apr 27 —
  the plan-driven phase ended; agents now operate from LORE + AGENTS.md

### Daily commit cadence, Apr 22 → May 1

```
Apr 22:    4 (partial, cutoff)
Apr 23:  102
Apr 24:  123
Apr 25:  104
Apr 26:   77   ← lowest day, fn-dedup cleanup
Apr 27:  119
Apr 28:  135   ← 78/78 milestone day
Apr 29:  124
Apr 30:  211   ← peak, seed0030 RNG closure + bones port
May  1:  145
```

### Agent attribution since Apr 22

| Agent | Commits | Share | Model |
|---|---|---|---|
| cleaver | 712 | 62% | Opus 4.6 → 4.7 |
| xorn | 128 | 11% | Codex GPT-5.4 |
| maud | 96 | 8% | Opus 4.6 / Sonnet 4 |
| mac | 17 | 1% | Opus 4.6 |
| (no trailer) | 192 | 17% | mixed |

Cleaver dominated this period. Two long sessions account for most of it:
`session:33dfde3e` (429 commits, all Opus 4.7) and `session:7a17c938`
(141 commits). Agents golem (Gemini) and naga have been silent since
Apr 22 — the heterogeneous swarm has effectively contracted to a
two-agent (cleaver + xorn) primary core, with maud doing infrastructure
support.

---

## What's Working — Validated by 33 More Days

### 1. Verifiable measurement is still the highest-leverage decision

Every commit since Apr 22 references concrete numbers: "73/73 sessions
passing", "seed0030 RNG 81/81", "events 73/82 → 74/82". Agents now
operate in a fully self-scoring environment. The PES (PRNG/Events/Screen)
three-channel system — extended in this period to handle multi-segment
bones round-trips — remained the load-bearing measurement infrastructure.

### 2. Infrastructure compounds, again

Three new compounding investments landed in this period:

- **Sherpa multi-segment keyplans** (Apr 29) — enables one session file
  to record multiple character lifetimes in one bones round-trip,
  preserving `record`, `xlogfile`, `livelog`, `save/*`, `bonD*` files
  across `---segment---` dividers. This unlocked seed0030 (9-segment,
  10-death) which menace could not have tested at all.
- **`run-until` verb** (May 1) — replays a keyplan until a pline/event
  match, then truncates. Lets agents author sessions to a *game event*
  (e.g., "until Oracle prompt") without knowing the exact step count.
- **Contest leaderboard judge** (running 4×/day since Apr 18) — 34
  automated scoring commits since Apr 22. External-facing, public
  scoreboard. No-touch infrastructure that keeps progress visible.

### 3. Autonomous knowledge capture continues

40+ new LORE topics added since Apr 22. The format has matured —
modern entries name the C source line, the JS divergence, the fix, and
the validation seed:

> *seed0020/0026: ghitm wire-up. dothrow's throw_gold path was calling a
> local stub for ghost-hit handling instead of the canonical ghitm()
> from monst.js. The stub returned plausible damage but skipped the
> ghost-flee, peace-status, and bones-pair side effects.*

LORE is now functioning *exactly* as menace's REPORT.md predicted: as a
discipline of articulation. Each entry is a forced verification.

### 4. Heterogeneous swarm coordinates without thrash

Despite the headline being "cleaver-dominant", xorn (Codex GPT-5.4) and
maud (Opus) operated alongside on independent subsystems with zero
documented merge conflicts. Co-author trailers + `Agent:` trailers
preserved provenance. Human review burden remained near zero.

### 5. Model upgrade as routine maintenance

Cleaver's transition from Opus 4.6 → 4.7 (visible in trailers around
Apr 28) was invisible from project metrics — no regression, no drop in
commit cadence. The infrastructure is *agent-agnostic* enough that model
upgrades don't disrupt the work.

---

## What's NOT Working

### 1. Browser playability — the original goal — has slipped

Menace shipped a browser-playable game by Day 48. Teleport at Day 33 has
**zero commits** mentioning `browser`, `playable`, `interactive`,
`wasm`, `canvas`, or `dom` in the Apr 22 → May 1 period. The
`tools/parity-debugger/` localhost:8080 tool is a *developer* tool
(visualizing C/JS divergence), not a playable game. The project has
optimized hard for parity numbers and not at all for the original
ship-criterion.

### 2. seed4500 (knight-coverage) is teleport's seed031

The 115,210-step coverage session is the lone remaining failing
session. Multiple targeted fixes during the period each moved the first
divergence further into the run, but never closed it. Status at end of
day May 1:

```
seed4500-knight-coverage  RNG 104,907/115,210 (91%)
                          Events 22,109/36,484 (61%)
                          Screen 1,595/1,909 (84%)
First divergence: step 104,908 in m_move
```

This is the same pattern menace saw with seed031-033: thousands of
matched RNG calls before a deep ordering divergence. The agents have
not yet been explicitly redirected to confront it the way menace's
human did on Mar 18.

### 3. PROJECT_PLAN.md was archived rather than updated

On Apr 27, `PROJECT_PLAN.md` was moved into `docs/archive/`. This is
not necessarily wrong — once the plan was internalized in AGENTS.md and
LORE, the plan document was redundant. But it's worth noting: the
*explicit roadmap* phase ended. From Apr 27 onward, agents operate from
*emergent* priorities (the failing-sessions list + LORE-flagged
audits) rather than a top-down plan.

### 4. Mild scope-creep on commit bundling

Recent commits bundle multiple unrelated fixes:

- `parity: three more wiring-oversights — fruitname makesingular,
  hide-or-spinweb prompt, EMagical_breathing pw bonus`
- `agent:golem - Deduplicate map_trap, Invocation_lev, and implement
  restrict_name/retouch_equipment` (single commit, 4 separate functions)

This makes regression bisection harder. No catastrophic incidents yet,
but the pattern from Apr 22's analysis has continued.

### 5. CODEMATCH.md falling behind

The function-by-function port tracker (`docs/CODEMATCH.md`) was last
content-updated on Apr 27 (`docs: update CODEMATCH.md — 73/73`). The
Apr 28 → May 1 porting waves (~150 commits, dozens of new ports) are
not reflected. It still lists 173 done / 118 partial / 6 not-started —
stale by ~5 days.

---

## New Patterns That Emerged This Period

### The "wiring-oversight audit" methodology

A named, repeatable practice that emerged in this period and produced
60+ commits across three named "Waves" (III, IV, V). The pattern:

> **Silent fakery**: JS function returns a plausible value but skips
> C's side effects. The test session appears to pass locally, but
> divergence accumulates downstream.

The audit method:
1. Identify a JS function that should mirror a C function
2. Read the C function side-by-side
3. Catalog every observable side effect (pline calls, RNG draws, livelog
   entries, state mutations) that JS skips
4. Wire the missing side effect, verify against PES
5. Document in LORE as a Wave entry

Wave V (May 1 alone): 17 commits, ~25 silent-fakery instances closed,
PES held at 80/82 throughout.

This is a methodology that *did not exist* in menace. Menace's
debugging was reactive (find the divergence, fix it). Teleport's
wiring-audit is *proactive* — agents systematically search for stubs
that look complete but aren't.

### The bones round-trip as a parity test

Menace tested single-character sessions only. Teleport's seed0030
(9-segment ten-diverse-deaths) is the first multi-character bones
round-trip session: character A dies on Mines L1, character B finds
the ghost. The full round-trip exercises:
- Save/restore across character lifetimes
- Bones file format (`bonD*`)
- Ghost monster normalization (sleeping, peace status)
- Trap-array reverse-on-load
- Stairs-add ordering
- Cemetery memory (`cs_buf0/cs_buf1` zeroing)

Each of those generated a LORE entry on May 1. This is a *new class of
parity bug* that menace's session format couldn't surface.

### Model upgrade as a project event

Menace ran a single model family throughout (Sonnet → Opus on demand).
Teleport demonstrated that mid-project model upgrades (4.6 → 4.7) are
operationally routine. The session ID in commit trailers
(`session:33dfde3e`) acts as a fingerprint — it's possible to attribute
commits to a specific model run, which is new attribution granularity.

---

## Combined Lessons: Menace + Teleport Together

### Lessons from REPORT.md that the teleport data validates

| Lesson | Validation in teleport |
|---|---|
| Verifiable measurement | PES extended to 3-channel + multi-segment; still load-bearing |
| Infrastructure compounds | Sherpa, multi-segment, contest judge — three new compounding investments |
| Agents avoid hard problems | Mild — seed4500 still untouched as intensely as it could be |
| Autonomous knowledge capture | 40+ new LORE topics; mature format |
| Remove complexity to expose bugs | "Silent fakery" frame is the same lesson, sharpened |
| Human's role: behavioral correction | Hard to assess — human appears mostly absent in this period |
| Agent emotions / behavioral patterns | Same patterns persist (commit bundling = scope expansion) |

### What teleport adds beyond menace

1. **Pre-loading lessons works at scale** — a fresh restart with menace's
   knowledge base achieved Day 48 menace-quality parity numbers in
   ~half the time.
2. **Heterogeneous swarms are stable** — Opus 4.6 + Opus 4.7 + Codex
   GPT-5.4 in one repo, no friction.
3. **Audit methodologies are agent-discoverable** — wiring-oversight
   was not in any plan document; it emerged from agents reading their
   own LORE and noticing the silent-fakery pattern.
4. **Multi-segment sessions test things single-segment can't** — bones,
   save/restore, character handoff are now testable.
5. **Model upgrades are non-events** — when the infrastructure is
   solid, swapping the underlying LLM mid-project doesn't require
   re-onboarding.

### What teleport reveals as still missing

1. **Goal-driven prioritization** — once the plan was archived,
   priorities became "what's the failing session today?" Browser
   playability — the actual ship goal — has been deprioritized
   indefinitely. No agent or human has scheduled it.
2. **Human-in-the-loop confrontation** — menace's seed031 was solved
   only after explicit human intervention. Teleport's seed4500 has
   received no equivalent intervention; the avoidance pattern is mild
   but real.
3. **Scope discipline** — multi-fix commits and the "while I'm here…"
   pattern are growing. No active countermeasure.

---

## The Productivity Picture

### Commits per day, both projects

```
                          Menace             Teleport
Week 1                       145/day          207/day  (Day 1-7)
Week 2                       103/day          196/day  (Day 8-14)
Week 3                       129/day          134/day  (Day 15-21)
Week 4                        70/day          146/day  (Day 22-28)
Week 5 (Day 29-33)           236/day          124/day
                          ↑ peak             still steady
```

Menace's peak was Mar 8-11 (236/day, four days with zero human
messages). Teleport has not had a comparable autonomous peak — its
cadence is *steadier* (between 100-200/day) but lower-amplitude. This
is consistent with teleport agents having pre-loaded lessons: they
don't need a sudden burst of autonomous discovery because the
discoveries are already in LORE.

### Where the work concentrated

**Menace (week 5, Mar 8-11)**: 942 commits on RNG parity for the
existing session suite, 189 LORE entries on RNG-alignment patterns.
Single-channel debugging.

**Teleport (week 5, Apr 27 - May 1)**: 735 commits split across:
- Wiring-oversight audits (Waves III, IV, V): ~60 commits
- Bones parity arc (seed0030): ~50 commits
- Endgame/ascension (seed0010): ~30 commits
- Three-channel cleanup (events + screen on the 78 already-passing
  sessions): the rest

Three-channel work is intrinsically more complex — fewer "easy" fixes,
more correlated failures across channels. The lower commit cadence
reflects deeper per-commit work, not slower agents.

---

## Open Questions for the Next Rollup

1. **Will seed4500 close without human intervention?** Or will it
   require a menace-style "do not avoid" confrontation?
2. **When does browser playability become a goal again?** Currently no
   one is scheduled to work on it. The contest infrastructure suggests
   externalized scoring but no playable demo.
3. **Is the wiring-oversight audit method generalizable beyond
   NetHack?** Or is it specific to porting C with extensive side
   effects?
4. **Can a third project bootstrap from teleport's LORE?** Teleport
   bootstrapped from menace; what does a third-generation port look
   like with two LORE generations stacked?
5. **What happens when the suite stops growing?** Suite size has
   plateaued around 80 sessions. The next phase is *deepening* existing
   sessions or *broadening* into new gameplay categories. Either choice
   reshapes the work.

---

## Appendix: Where the Data Came From

| Source | Scope |
|---|---|
| `data/teleport-timeline.jsonl` | Mar 29 → Apr 13 daily metrics (16 rows) |
| `git log origin/main` | Apr 14 → May 1 commit subjects, trailers, dates |
| `teleport/golem/docs/LORE.md` | Topic count, recent additions |
| `teleport/golem/docs/CODEMATCH.md` | Function-port tracking (stale 5d) |
| `teleport/golem/scripts/pes-report.mjs` | Per-session PRNG/Events/Screen |
| `agent-logs/` | 34 GB of raw session JSONL (synced May 1) |
| [REPORT.md](REPORT.md) | Menace lessons (the prior-art baseline) |

The teleport repo is a 4-worktree layout with origin/main shared
across all worktrees. Local `teleport/golem` is currently 1,346
commits behind origin/main; all current-period analysis used
origin/main directly.
