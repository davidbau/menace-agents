# Techniques Catalogue: Every Programming Approach Tried Across Menace, Teleport, and Monk

**Study period:** 2026-02-06 through 2026-07-11 (156 days across three ports)
**Projects:** menace (48 days), teleport (~104 days ongoing), monk (~68 days, ceiling)
**Codebases:** `/wave` (menace), `/teleport/maud` + siblings (teleport), quadro `teleport-monk` (monk)
**Agent logs:** `/agent-logs/` (33 GB, ~10k jsonl files + 570+ auto-memory md files)
**Timeline sources:** git commit trailers (`Parity: M/T (P%)`), auto-memory dirs, xorn Codex rollouts (~4.5 GB across 3 rollouts)

This is the exhaustive per-technique catalogue. Every named script, every
reusable methodology, every measurement tool, every documentation artifact
that made a measurable difference on any of the three ports. Where evidence
supports it, effectiveness is quantified.

The catalogue is organized as (1) a **master table** of 41 techniques with
columns for infrastructure cost, measured impact, verdict, and evidence
citation; then (2) **per-technique deep-dives** grouped into 10 thematic
categories.

One theme runs through nearly every entry: **the session — a recorded
series of input/output events — became the unit of testing.** Techniques
33–40 (Category 9) are the tools built around that unit: visualizing it,
scrubbing it, loading it live, forking it, and authoring it.

---

## Master Table

| # | Technique | Category | Infra cost | Measured impact | Verdict | Origin |
|---|---|---|---|---|---|---|
| 1 | LORE.md as institutional memory | Documentation | 546 KB (teleport) / 910 KB (menace) | Prevents zero-carry-over; 229 topics reused | Compounded | menace |
| 2 | Auto-memory dirs (per-agent) | Documentation | 210+169+38 md files | Cross-agent citation; methodology retained | Load-bearing | teleport |
| 3 | Per-subsystem design docs | Documentation | ~40 docs (COMBAT, VISION, MONSTERS, etc.) | Onboarding; agent priorities | Compounded | menace |
| 4 | Per-agent role docs | Documentation | AGENTS.md, GEMINI_ROLE.md | Model-specific onboarding | Compounded | teleport |
| 5 | DECISIONS.md rationale log | Documentation | 1 file, cumulative | Prevents re-litigation | Compounded | menace |
| 6 | Pre-registered decision rules | Planning | ~50 LoC discipline | ≥3 revert wars prevented | Load-bearing | teleport (cleaver) |
| 7 | Phase gates + exhaustion criteria | Planning | Roadmap docs | Phase 2 exhaustion legible | Load-bearing | teleport (cleaver) |
| 8 | Iteration speed as a knob | Metatooling | 2× tool variants | 5-10 commits/day (xorn) | Load-bearing | teleport |
| 9 | Worktree pinning per sweep | Metatooling | `--isolate` flag | Matrix rerun cost 0 | Compounded | teleport |
| 10 | Watchdog agent | Metatooling | 1 agent role | Overnight work | Compounded | menace |
| 11 | Autostash-verify discipline | Metatooling | ~10 LoC hook + rule | Prevents committed conflict markers | Load-bearing | teleport |
| 12 | Structural static analysis (skeleton-diff) | Static analysis | 2 KLoC tool | matchedFindings 89→47, 114→12 | Load-bearing | teleport |
| 13 | Spine-diff per-function | Static analysis | 2 tools (js + ts variants) | Bug-class isolation | Load-bearing | teleport |
| 14 | Semantic scanners (~30 scan-*.mjs) | Static analysis | ~2 KLoC across scripts | 844→266→0 findings | Load-bearing | teleport |
| 15 | Runtime sanity checkers (~30 check-*.mjs) | Static analysis | ~2 KLoC across scripts | Enables async flip | Load-bearing | teleport |
| 16 | check-async.mjs (async coloring) | Static analysis | 1 script | Makes async flip possible | Load-bearing | teleport (monk-originated) |
| 17 | PES three-channel testing | Testing | 40 modes + 38 sessions | 307/307 at 100%, 3.8M RNG events | Foundational | menace |
| 18 | PES fourth channel (Cursor) | Testing | Extension | Divergences that Screen masked | Load-bearing | teleport (Jun 2026) |
| 19 | PES history in git trailers | Testing | ~120 LoC parser | Parity delta ↔ commit correlation | Quiet win | menace |
| 20 | RTX (reversible transactions) | Testing | 10 modules + 5 tools | #825/#827/#861/#862/#865 closed | Load-bearing | teleport (xorn) |
| 21 | Frozen 44-session judge (monk) | Testing | frozen/score.sh | 24/44 ceiling made legible | Diagnostic | monk |
| 22 | Hand-recorded deep human sessions | Test generation | Recorder + hand-authored sessions | seed0007: +51/72 PES steps | Multiplier | menace + teleport |
| 23 | Autoascend agent as fuzzer | Test generation | Whole `autoascend/` (546 KB LESSONS.md) | 500×100 hunts <5% actionable | Signature | teleport |
| 24 | Adversarial search (13 scripts) | Test generation | 13 adversarial-*.mjs | Tail coverage | Backstop | teleport |
| 25 | 500×100 divergence hunts | Test generation | ~500 LoC runner | First-failure depth 7→479 | Steady state | teleport |
| 26 | Mid-game harness from NAO states | Test generation | midgame-divergence-hunt.mjs | Deep sessions from real player states | Load-bearing | teleport |
| 27 | Translator + hand-port hybrid | Code generation | Batch pipeline + generators | ~450 KLoC ported | Working baseline | menace → teleport |
| 28 | Readable transpiler first | Code generation | tools/c2js/build.mjs | 24/44 ceiling | Failed as approach | monk |
| 29 | Lua-to-JS transpilers | Code generation | lua_to_js.py, lualevel_to_js.py | 126 special levels ported | Load-bearing | menace |
| 30 | Multi-agent collaboration | Collaboration | Worktrees + trailers | Different blind spots per model | Compounded | menace |
| 31 | Recorder-probe forensics | Forensics | C probes + rebuild | +13842 P on seed0108 | Genuine innovation | monk |
| 32 | NAO xlogfile + top-player configs | External data | 108 rc files, 239 dumplogs | Reframed fleet metric | Late but load-bearing | teleport |
| 33 | Session as unit of test + curated corpus | Testing | Recorder + `.session.json` + corpus | Corpus 19→307 sessions; every tool consumes it | Foundational | menace → teleport |
| 34 | Coverage dashboard + per-session ranking | Visualization | `run-coverage.sh` + `coverage/` (45 MB) + 3 cov-\*.mjs | Uncovered code visible per line; redundant sessions pruned | Load-bearing | teleport |
| 35 | Timeline dashboard (parity over commits) | Visualization | `gen-timeline.mjs` (643 LoC) + `timeline/` (104 MB data) | Regression ↔ commit legible; session×commit heatmap | Load-bearing | teleport |
| 36 | Parity-debugger (live C-vs-JS side-by-side) | Visualization | ~3.9 KLoC server + client | Cell-level divergence overlay; resume/fork any step | Load-bearing | teleport |
| 37 | Session viewers + timeline scrubbers | Visualization | 4 generator scripts + RTX live scrubber | Any session scrubbable ←/→, incl. failed ones | Load-bearing | teleport |
| 38 | Live game page as session loader | Visualization | `?replay=1` URL params + `session_loader` | Diverged sessions load in the real engine | Quiet win | teleport |
| 39 | Session forking (resume + changed input) | Test generation | mp fork API + debugger fork + `session-mutate` | Any session → family of new tests | Load-bearing | teleport |
| 40 | Sherpa (keyplan session builder for AI) | Agent tooling | `sherpa/` ~680 KB, 24 modules, 150+ keyplans | AI-authorable sessions; run-until verb; assertions | Load-bearing | teleport |
| 41 | Public porting contest with held-out judge | External validation | Skeleton repo + judge (2 h cycle) + leaderboard | ~12 contestants struggling as of Jul 2026 — the methods, not the code, are the differentiator | Replication experiment (in progress) | teleport |

---

## Category 1: Documentation as Institutional Memory

### 1. LORE.md — the debugging encyclopedia

**Problem addressed.** Agents have no memory across sessions. Every debug
discovery is at risk of being re-discovered, or worse, silently forgotten.

**Infrastructure.**
- `menace: wave/docs/LORE.md` — 910 KB, 229 topics (menace-era, closed)
- `teleport/maud/docs/LORE.md` — 546 KB (imported + extended)
- `teleport/maud/autoascend/LESSONS.md` — 546 KB (220+ entries, cleaver-authored)

**How measured.** LORE citations in commits and in later LORE entries.
LORE-cascade case study in Chapter 1 §4 shows the mechanism: when 942
autonomous commits produced 185 LORE entries (Mar 8-11), later entries
cited the earlier ones directly. Cross-agent citations in teleport are
common: cleaver cites monk's `feedback_firstdiv_vs_total_p.md`; monk cites
`feedback_recorder_umove_instrumentation.md` from an earlier session.

**Outcome.** LORE is the highest-leverage documentation artifact across
all three ports. It works because entries are dense (name the C source
line, the JS divergence, the fix, the validation seed) and short (a page
or less). Long strategic design docs written but not cited decay silently.

**Effectiveness signal.** LORE-citation rate; count of "same bug rediscovered
after prior LORE entry existed" (target: near zero).

**Failed variant.** Chapter 1 §7 documents "zero-carryover / sycophancy" —
27 instances where an agent didn't apply a lesson from within its own
conversation. LORE is a partial countermeasure but does not fully cure the
pattern.

---

### 2. Auto-memory dirs (per-agent, per-session persistent)

**Problem addressed.** Even LORE lives at project scope. Per-agent lessons
(cleaver's audit patterns, monk's translator taxonomy) benefit from
per-agent scope: they're written for the agent's own future use.

**Infrastructure.**
- `~/.claude/projects/<slug>/memory/*.md` — Claude Code's memory system
- `agent-logs/teleport-cleaver/memory/` — 210 files (July 2026)
- `agent-logs/teleport-monk/memory/` — 169 files
- `agent-logs/teleport-maud/memory/` — 38 files

**How measured.** Growth rate (+47 cleaver files in 13 days, +33 monk files).
Cross-citation: cleaver's `session_2026_07_07_matched_pair.md` builds on
her own `retirement_pattern_2026_06_29.md`; monk's late memories cite
earlier lowering-bug analyses.

**Outcome.** Per-agent memory dirs are the fastest-growing knowledge base
in teleport. Cleaver's dir grew +47 files in 13 days across July; monk's
dir grew +33. They are the primary source for cross-referencing what a
specific agent has learned.

---

### 3. Per-subsystem design docs

**Problem addressed.** Onboarding cost when a new agent enters a subsystem.

**Infrastructure.** `teleport/maud/docs/`:
- `COMBAT.md`, `VISION.md`, `MONSTERS.md`, `HALLUCINATION.md`, `WEAPONS.md`
- `MAPMAKING.md`, `SESSION_FORMAT.md`, `GAMESTATE.md`, `EVENTS.md`
- `MIDGAME_HARNESS_DESIGN.md`, `MULTIPLAYER_PROTOCOL.md`, `REVERSIBLE_TRANSACTIONS.md`
- `TAS_MAKER.md`, `PARITY_DEBUGGER.md`, `DBGMAPDUMP_TOOL.md`
- `SHADOW_MODE.md`, `SCREEN_HISTORY.md`, `ESTIMATION_ENGINE_DESIGN.md`

**How measured.** Referenced when agents encounter the subsystem for the
first time; used as context in agent prompts.

**Outcome.** Compounded — new agents onboard faster when a subsystem has
a design doc. Docs that go stale (like `CODEMATCH.md` at menace end)
lose their value.

---

### 4. Per-agent role docs

**Problem addressed.** Different LLMs have different strengths. Same
prompt to Claude Opus vs Codex vs Gemini produces different work.

**Infrastructure.**
- `AGENTS.md` — canonical, symlinked to README
- `GEMINI_ROLE.md` — Gemini-specific (infrastructure, stub consolidation)
- Implicit: xorn works from Codex system prompt; maud/cleaver from Claude

**Outcome.** Compounded. Golem (Gemini) has a distinctive role because
GEMINI_ROLE.md tells it what it's good at. Xorn's verify-before-push
discipline is documented in the Codex-side prompt.

---

### 5. DECISIONS.md rationale log

**Problem addressed.** Decisions get re-litigated when the original
rationale is forgotten.

**Infrastructure.** `teleport/maud/docs/DECISIONS.md`.

**Outcome.** Compounded. Ported forward from menace. Prevents Chapter 1
§6 "correction taxonomy" repeats.

---

## Category 2: Planning and Pre-Registration

### 6. Pre-registered decision rules

**Problem addressed.** Post-hoc reasoning about experimental results.
"Deaths went from 32 to 40 — was that a regression or noise?" is
un-answerable *after* the sweep. Pre-registering "advance only if
Dlvl≥4 ≥ 31 AND deaths ≤ 45 AND hard-stops = 0" answers it before
the data comes in.

**Infrastructure.** `LESSONS.md` (cleaver) `01e2cc7a1` documents the rule.
Matrix docs in `autoascend_perf_campaign_2026_07_01.md`.

**Measured effectiveness.** ≥3 documented revert wars prevented:
- matrix14 (AC-band confound) — would have reverted then re-landed on
  hp*2<hpMax; pre-registered rule caught it in one sweep
- matrix27 (unbounded rest gate)
- matrix13 (milestone-split discrimination)

**Outcome.** Load-bearing for the entire autoascend campaign.

**Failed variant.** Chapter 2 documents "Phase 2 exhausted" as premature —
the ceiling was real but the pause left points on the table that turn-economy
fixes (v48-v60) later recovered.

---

### 7. Phase gates + explicit exhaustion criteria

**Problem addressed.** Knowing when to stop pursuing a direction.

**Infrastructure.** Phase 0/1/2/3 named. `phase_2_1_exhausted_2026_07_09.md`
records the exit criteria and the exit evidence.

**Outcome.** Load-bearing. When "exhausted" is a formal declaration, the
next phase's design starts from an honest baseline. When it's implicit,
the same ground is re-plowed.

---

## Category 3: Metatooling

### 8. Iteration speed as a knob (fast vs exhaustive tool variants)

**Problem addressed.** Fixed tool speed is either too fast for landing
verification, or too slow for exploration.

**Infrastructure (pairs).**
- `scripts/pes-fast.mjs` (exploration) ↔ `scripts/pes-report.mjs` (landing)
- `scripts/parity-line.mjs` (single) ↔ `scripts/parity-history.mjs` (aggregate)
- `skeleton-diff.mjs | head -30` (top risk) ↔ full-tree `--csv`
- `pes-viewer.mjs` (interactive) ↔ `bpes.mjs`, `bpes-smoke.mjs` (batch)
- Depth-3 RTX oracle ↔ depth-10 RTX oracle
- 5k-step sweep ↔ 15k-step audit

**Measured effectiveness.** Xorn's 5–10 commits/day cadence is only
possible because unit-test loops complete in seconds; full-parity
verification runs in parallel. Cleaver's 6-minute matrix sweeps (10
parallel workers × 130 seeds × 5k steps) enable rapid hypothesis testing;
15k audits run overnight on candidates that passed.

**Outcome.** Load-bearing. Turning iteration speed into a per-decision
choice was one of the top-3 productivity multipliers.

---

### 9. Worktree pinning per sweep

**Problem addressed.** Mid-sweep commits split load-time behavior between
old and new code across seeds, voiding the matrix.

**Infrastructure.**
- `measure-autoascend.mjs --isolate --workers=8 --dump-dir`
- `/tmp/aa-vNN-tree` — pinned worktree snapshot
- `feedback_no_worktree_edits_during_sweep.md` — the rule

**Measured effectiveness.** matrix61 was re-run at ~1.5h cost after
discovering mid-sweep commits. After the rule was codified, that class
of error stopped.

---

### 10. Watchdog agent

**Problem addressed.** Agents that finish a task and stop; humans not
available to prompt continuation.

**Infrastructure.** Documented in menace's `data/analysis-infrastructure.md`.
Imported by teleport.

**Outcome.** Compounded from menace; enables the "zero human messages
for 3 days" pattern of Chapter 1 §4.

---

### 11. Autostash-verify discipline

**Problem addressed.** `git pull --rebase --autostash` can silently commit
conflict markers when the stash apply produces conflicts that get merged
along with the next commit.

**Infrastructure.** `feedback_autostash_verify.md` codifies:
1. Always `git status` after autostash
2. Re-run tests after stash apply (pre-rebase pass doesn't carry)
3. Grep for `<<<<<<<` before adding files

**Outcome.** Load-bearing after an incident where markers landed in a commit.

---

## Category 4: Static Analysis

### 12. Structural static analysis (skeleton-diff)

**Problem addressed.** Dormant divergences — code paths no recorded
session exercises but that will diverge on first hit.

**Infrastructure.** `tools/skeleton-diff/`:
- `skeleton-diff.mjs` — regex function pairer, 23 modes
- `extract.mjs`, `count.mjs` — C↔JS AST + metric counters
- `duplicate-defs-allowlist.mjs`, `conform-batch.mjs`, `preflight.mjs`

**Measured effectiveness.**
- Issue #575 helper extraction (cleaver, Jun 11): matchedFindings 89→47 across 31 commits
- Single Jun 14 session: 114→12 (102 closed) via risk-banded constant renaming + FLAG_EQUIV bridges
- scan-semantic v0.9 tightening (xorn commit `94818d6e0`): 844→266 findings (-68%)

**Canonical false-positive catalogue** (in `code_analysis_tools.md`):
hoisted locals, optional-chaining guards, cross-file relocations,
inline-expanded C macros (`Luck` → `u.uluck + u.moreluck`), `#if 0` C
functions (`leather_cover`, `bury_monst`, `escape_tomb`), platform-only
helpers (`msg_mon_movement` on `a11y`, `do_positionbar` under
`POSITIONBAR`, `elemental_clog`), `#if MICRO||WIN32CON` console abort,
`SAFERHANGUP`, binary-save / JSON-save mismatch.

---

### 13. Spine-diff per-function

**Problem addressed.** Whole-function shape comparison — call sequence,
branch structure, loop count.

**Infrastructure.**
- `tools/skeleton-diff/spine-diff.mjs --fn <name>`
- `tools/skeleton-diff/ts-spine-diff.mjs` — tree-sitter AST variant
- `spine.mjs`, `ts-spine.mjs` — call-chain extraction

**Measured effectiveness.** Issue #575 double-`destroy_items` in
`mcast_lightning`, missing oil/grease in `disarm_squeaky_board`, missing
boulder-reshuffle in `bhitpile` — all caught by spine-diff before
production divergence.

---

### 14. Semantic scanners (~30 scan-*.mjs)

**Problem addressed.** Bug classes with a recognizable AST shape.

**Infrastructure.** In `tools/skeleton-diff/`:
- `scan-semantic.mjs` (core)
- `scan-rng-order.mjs`, `scan-callers.mjs`, `scan-operand-provenance.mjs`
- `scan-misrouted-state.mjs`, `scan-state-writes.mjs`, `scan-cmd-loops.mjs`
- `scan-ecmd-turnuse.mjs`, `scan-cref-aliases.mjs`, `scan-array-parity.mjs`
- `scan-botl-direct-writes.mjs`, `scan-msg-case.mjs`, `scan-string-tables.mjs`
- `scan-strings.mjs`, `scan-struct-assign.mjs`, `scan-subroom-index.mjs`
- `scan-undef-zero.mjs`, `cross-file-sweep.mjs`, `preflight.mjs`

In `scripts/`:
- `scan-deferrals.mjs`, `scan-else-if-starvation.mjs`
- `scan-init-only-functions.mjs`, `scan-process-access.mjs`
- `scan-raw-struct-writes.mjs`, `scan-shortcircuit-hoist.mjs`
- `scan-state-escapes.mjs`

**Measured effectiveness.** Xorn drove semantic findings to zero
unmatched suppressions on Jul 9 (commit `b0412c016`).

**Discipline.** Suppressions are named and retired: when a suppression
catches 0 findings, retire it (`spine_suppression_decay.md`).
Platform-conditional false positives need *narrow* per-rule
suppressions, never added to umbrella entries like
`unported-rng-call-followups`.

---

### 15. Runtime sanity checkers (~30 check-*.mjs)

**Problem addressed.** Not all bugs are visible at static-analysis time.
Runtime checks close the loop.

**Infrastructure.** `scripts/check-*.mjs`:
- `check-rng-order.mjs`, `check-rng-arg-order.mjs`, `check-rng-loop-cond.mjs`
- `check-c-refs.mjs`, `check-cref-guard.mjs`, `check-cref-literals.mjs`
- `check-const-redef.mjs`, `check-deprecated-options.mjs`, `check-macro-numeric-guard.mjs`
- `check-missing-imports.mjs`, `check-reexports-from-const.mjs`
- `check-keylog-faithful.mjs`, `check-option-parser-coverage.mjs`
- `check-placement-helper.mjs`, `check-nethackrc-directives.mjs`
- `check-object-menu-glyphs.mjs`, `check-browser-nethackrc-defaults.mjs`
- `check-browser-safe.mjs`, `check-contest-rules.mjs`
- `check-toplin-marker-owners.mjs`, `check-vision-drain.mjs`
- `check-roomno-lookups.mjs`, `check-statelist-surgery.mjs`
- `check-bot-disabled-parity.mjs`

---

### 16. check-async.mjs — the async coloring analyzer

**Problem addressed.** Awaits landing in non-async contexts silently
fail. Async transitivity is easy to break during hand-porting.

**Infrastructure.** `scripts/check-async.mjs` — one script, deep impact.

**Measured effectiveness.** `check-async.mjs` is what made the async flip
possible. When monk's June 12 async flip (commits `806ebb8`→`3c8edb4`)
migrated the prompt bridge from sync-polling to `await`, `check-async`
caught the cascade: 2,747 async heads had to be added and 22,120 `await`
insertions had to propagate. A long-inert conformance check finally
fired — it had been checking strings *after* `stripCommentsAndStrings`
since inception. PRNG parity dropped 24.75% → 21.94% before rebounding,
an accepted cost documented in `feedback_async_flip_over_parity.md`.

**Outcome.** Load-bearing. Named as the earliest and most consequential
static tool in teleport's history.

---

## Category 5: Testing Infrastructure

### 17. PES three-channel testing

**Problem addressed.** A JS replay is either bit-exact-correct or it
isn't. But "isn't" has many failure modes: PRNG divergence, event
ordering, screen rendering.

**Infrastructure.**
- `scripts/pes-report.mjs` — ANSI-colored three-channel report, ~40 modes
- `oracle/results.jsonl` (29 MB), `history.jsonl` (1.1 MB)
- `oracle/pes-diagnoses.json` — cached AI diagnostic summaries
- 38 curated parity sessions, 99 keyplans, 78 divergence-repro dirs
- Diagnosis tools: `first-divergence.mjs`, `divergence-context.mjs`,
  `screen-diff.mjs`, `compare-display-events.mjs`, `compare-display-rng.mjs`

**Measured effectiveness.** Maud's early observation (day 3-4): PES 11/19
PASS, but RNG 19/19 and Events 19/19 both at 100%. The reframing —
"infrastructure isn't the blocker, vision/display is" — set the priority
list for the next 4 weeks.

By July 11: 307/307 sessions passing, 3.8 M RNG events at 100% across
all four channels.

**Outcome.** Foundational. Teleport's version of Chapter 1 §1 "make
agent work verifiable."

---

### 18. PES fourth channel (Cursor)

**Problem addressed.** Cursor position can drift independently of screen
content — a class of divergence that Screen alone masked.

**Infrastructure.** Added mid-2026 as an extension of the three-channel
harness. Every PES report now cites RNG / Events / Screen / Cursor.

**Measured effectiveness.** By July 11, all 307 sessions match on all
4 channels. The Cursor channel exposed cases that would have shipped
as "screen matches, but cursor is one cell off."

---

### 19. PES parity history in git commit trailers

**Problem addressed.** External parity logs drift from reality. A
separate log needs to be maintained; the maintenance is imperfect;
reverts don't remove entries.

**Infrastructure.**
- Commit convention: `Parity: MATCHED/TOTAL (PCT%) [session:m/t ...]`
- `scripts/parity-history.mjs` — parses `git log --format='COMMIT %h %aI %an%nBODY%n%B%nENDBODY'`

**Design property.** Every parity delta in project history is correlated
with the commit that caused it — automatically, atomically, and
revert-safe. Reverts remove the trailer with the code.

**Measured effectiveness.** Every xorn commit carries lines like
`307/307 passing; RNG:3808565/3808565(100%)` verbatim. Parity-history.mjs
reconstructs the timeline on demand.

**Outcome.** A quiet but load-bearing design decision. The parity record
is woven into git rather than external.

---

### 20. RTX (reversible transactions) engine

**Problem addressed.** Multiplayer, rollback, and replay-N verification
all require that command effects be journaled and reversible.

**Infrastructure** (all under `js/rtx/`):
- Core: `journal.js`, `journal_install.js`, `rng_snapshot.js`,
  `input_transcript.js`, `effects_sink.js`, `raw_clone.js`,
  `visual_snapshot.js`, `proxy_profile.js`, `screen_history.js`,
  `rollback_control.js`
- Specs: `docs/REVERSIBLE_TRANSACTIONS.md`, `docs/MULTIPLAYER_RTX.md`
- Tools: `scripts/rtx-oracle.mjs`, `rtx-replay-oracle.mjs`,
  `measure-rtx-journal-memory.mjs`, `measure-rtx-journal-overhead.mjs`,
  `measure-transaction-diff.mjs`
- Xorn tooling: 234 rtx-oracle invocations across the June rollout,
  10,270+ `RTX_*` log references

**Measured effectiveness.**
- Issue #825 (Phase 1, June 25): proxy-root journaling publishes real
  command writes and validates rollback against diff oracle; 263/263 passing
- Issue #827 (June 26): setPrototypeOf/preventExtensions membrane traps
- Issue #861 (`58f96610`, June 28): occupation continuation journaling
- Issue #862: replay-N Luck restoration (5/5 sessions)
- Issue #865 (`75554d48`, June 28): visual cache rollback consolidation

**Outcome.** Load-bearing for a specific but critical class of
correctness (multiplayer, rollback, replay).

---

### 21. Frozen 44-session judge (monk)

**Problem addressed.** How do you score progress on a translator
when the output isn't stable?

**Infrastructure.** `frozen/score.sh` — scores a committed
`js/translated/` snapshot against 44 sessions. Fresh translator output
is verified independently via self-test.

**Measured effectiveness.** Monk reached 24/44 PASS. Made monk's
architectural ceiling legible: translator-only advances (d8a6da1
circle_ptr, ff83690 string-demotion, 2245f3f glyphs) are latent —
verified but stranded.

**Outcome.** Diagnostic. Failed as an approach; succeeded as a way to
name the failure.

---

## Category 6: Test-Case Generation

### 22. Hand-recorded deep human sessions

**Problem addressed.** Random or autoascend-generated sessions don't
exercise the paths a real human takes.

**Infrastructure.**
- The deterministic recorder (patched C NetHack) for capturing
  ground-truth sessions from real play
- `test/comparison/sessions/` includes seed0007 (737-step hand-recorded)
- `docs/MIDGAME_HARNESS_DESIGN.md` — booting NAO player states

**Measured effectiveness.** seed0007 alone: 737 steps, 39 commits, PES
advance 51/72 steps (71%). Exposed chargen filter-menu paths, container
loot accelerators, escape-prompt gating, stairway_at bug — none of
which random sessions had touched.

**Principle** (`mp_demo_pipeline_2026_07_02.md`): *one deeply-exercised
session beats many shallow ones.*

**Outcome.** A productivity multiplier when amortization is right.
(An earlier draft of this entry conflated hand-recorded sessions with
the public contest; the contest is a *porting* competition, catalogued
separately as #41 — though its session viewer and recorder tooling are
what make hand-recording available to outsiders too.)

---

### 23. Autoascend agent as fuzzer

**Problem addressed.** Human recordings are expensive per-session. Random
seeds are cheap but exercise the same tutorial paths.

**Infrastructure** — an entire project inside a project:
- `autoascend/` — 179 KB agent state machine
- `LESSONS.md` — 546 KB, 220+ entries
- 33 knowledge subdirs (roles, races, items, monsters, abilities)
- Strategy / planning / combat / exploration layers
- 27 state-tracking files
- 272 test subdirectories in `test/autoascend/`
- Sokoban solver: 10 files in `autoascend/soko_solver/`
- Contest fairness boundary: `EPISTEMOLOGY.md`, enforced by lint

**Fleet infrastructure.**
- `autoascend-parity-sweep.mjs` — sweep seed families for divergence
- `autoascend-divergence-hunt.mjs` — targeted hunts
- `autoascend-run-report.mjs`, `autoascend-final-state-report.mjs`,
  `autoascend-replay-viz.mjs`
- `aa-hunt/` — harvested results (100+ role×seed keylogs + sessions)
- `aa-sweep-launch.mjs`, `aa-matrix-diff.mjs`, `aa-wear-probe.mjs`

**Measured effectiveness.**
- 500×100 hunts run at sub-5% actionable divergence rate
- 88 pre-registered matrices (m1–m88) landed the autoascend baseline at
  m87: **59 deaths / 130 sessions / 0 hard-stops / 43 depth-4+ / 49 median depth**
- Sokoban chain live end-to-end (first organic solve seed21 t1129)
- Doubles as fuzzer and behavioral-correctness measurement at 15k-step horizons

**Outcome.** Signature technique. Building a competent auto-player was
a project inside a project — nontrivial engineering — but paid back many
times over as coverage.

**Failed variant.** Static tilt-policies (strategic depth arc, Jul 10):
0/12 weapons helped, 1/12 armor landed, descent gate regressed. Modules
preserved as infrastructure but default-off. Lesson: measurement at
15k+ steps required.

---

### 24. Adversarial search (13 scripts)

**Problem addressed.** Random 500×100 misses adversarial-corner-case
divergences. Directed search of the input space finds tail cases.

**Infrastructure.** `scripts/`:
- `adversarial-campaign.mjs` — orchestration
- `adversarial-seed-scout.mjs` — find divergence-prone seeds
- `adversarial-index-probe.mjs` + `-fast`, `-tiered`, `-fast-tiered`
- `adversarial-session-mutate.mjs`, `adversarial-session-scout.mjs`,
  `adversarial-session-search.mjs`
- `adversarial-sweep-grid.mjs` — grid-sweep parameter space
- `adversarial-probe-and-curate.mjs`, `curate-adversarial-candidates.mjs`

**Outcome.** Backstop for the tail. Autoascend fuzzing covers the mass;
adversarial probing covers what mass doesn't reach.

---

### 25. 500×100 divergence hunts

**Problem addressed.** Steady-state measurement: is the port done?

**Infrastructure.**
- `autoascend-divergence-hunt.mjs` — main runner
- `midgame-divergence-hunt.mjs` — from mid-game snapshots
- `rerecord.py` — separates recording truncation from real divergence
- 40 NAO midgame/lategame scenarios × 69 RC files as input corpus

**Measured effectiveness.** Jul 7 sample: 22 actionable divergences in
500 sessions (4.4%). Jul 11 recent hunts: first-failure depths of 7,
32, 51, 112, 479 across five consecutive runs. The tail is lengthening;
the port is becoming done.

**Xorn's stopping policy.** Rather than collecting 10+ divergences
pre-batch, xorn runs until first actionable failure, then decides:
- Screen-only with shared mismatches → collect 2–5 siblings to fix once
- RNG-first or structural state drift → fix one-at-a-time

This preserves regression attribution and avoids stale bulk fixes.

---

### 26. Mid-game harness from NAO states

**Problem addressed.** Chargen and Dlvl 1 are heavily exercised. Mid-game
and late-game are not.

**Infrastructure.**
- `docs/MIDGAME_HARNESS_DESIGN.md` — boot NAO player states for AutoAscend
- `scripts/midgame-divergence-hunt.mjs` — hunt from mid-game snapshots
- `test/comparison/rerecord_midgame.test.mjs` — record NAO states

**Outcome.** Load-bearing. Extends the coverage frontier past what
tutorial-start sessions reach.

---

## Category 7: Code Generation

### 27. Translator + hand-porting hybrid (teleport's approach)

**Problem addressed.** Pure hand-porting is slow. Pure transpilation
produces JS that's either wrong or unreadable at architectural
boundaries.

**Infrastructure.**
- `scripts/batch-translate.mjs` — batch C-function translation via LLM
- `scripts/translate-prompt.md`, `docs/CONVENTIONS.md`, `docs/TRANSLATE_PIPELINE.md`
- `scripts/dedup-stubs.mjs`, `dedup-functions.mjs`, `dedup-move-import.mjs`
- `scripts/standardize-imports.mjs`, `resolve-imports.mjs`, `auto-import.mjs`
- `scripts/instrument_stubs.mjs`

**Python data generators** (`scripts/generators/`):
- `gen_constants.py`, `gen_allopt.py`, `gen_objects.py`, `gen_monsters.py`
- `gen_artifacts.py`, `gen_symbols.py`, `gen_epitaphs.py`, `gen_roles.py`
- `gen_role_skills.py`, `gen_themeroom_meta.py`

**Measured effectiveness.** ~450 KLoC of C ported to ~172 JS modules.
Batch pipeline works up to ~1,000-line C files; larger files need
subagent-per-file hand-porting.

**Outcome.** The working baseline. Teleport's whole thesis.

---

### 28. Readable transpiler first (monk's approach)

**Problem addressed.** Same as #27, but with a different hypothesis:
if the transpiler is good enough, hand-porting is unnecessary.

**Infrastructure** (on monk port, not local):
- `tools/c2js/build.mjs` — single-pass transpiler
- 7-class lowering-bug taxonomy (formal, tracked)
- Frozen 44-session judge (`frozen/score.sh`)
- PatchFile discipline via `build-engine.mjs` (`NH_EMIT_ASYNC=1 BUILD_ENGINE_SOFT=1`)

**Lowering-bug taxonomy** (the intellectual output):

| Class | Description | Status |
|---|---|---|
| #11 | Char-buffer walker writes (`*ptr++=c`) | OPEN (77 TODO stubs) |
| #13 | `&scalar @ genericptr_t` — {value} ref-cell | CLOSED (afeb335 + 86c7cee) |
| #14 | Char-element compound-assign (`buf[i]+=N`) | CLOSED (ca728f7) |
| #15 | Pointer arithmetic (`&arr[i]`, `p-q`) | MOSTLY LANDED (d8a6da1) |
| #16 | Await-coloring indirect callbacks | PARTIAL (7 sites landed) |
| #172 | Postfix `*ptr++` read | CLOSED (0d048b4, b5d7366) |
| #18 | Char* OUT-param demotion | **REVERTED** (unit tests passed, full build 20→8) |

**Measured effectiveness.** 24/44 PASS ceiling reached. seed0013 4804/4804
PRNG. Scalar-ptr-writeback (3 of 3) closed with +13842 P on seed0108.

**Outcome.** Architecturally limited. See "The Architectural Indictment"
in Chapter 2.

---

### 29. Lua-to-JS transpilers

**Problem addressed.** NetHack special levels are written in Lua. The
main C→JS transpiler doesn't help.

**Infrastructure.**
- `lua_to_js.py` — general Lua→JS
- `lualevel_to_js.py` — full AST transform for dungeon levels
- `postprocess_levels.py`, `marker_patch.py`

**Measured effectiveness.** 126 special levels ported (menace era).

---

## Category 8: Collaboration and Forensics

### 30. Multi-agent collaboration

**Problem addressed.** Different LLMs have different blind spots. Same
model doing everything has correlated failures.

**Infrastructure.**
- Named agents per worktree: `maud/`, `cleaver/`, `xorn/`, `golem/`,
  `contestant/`, `monk/`
- Worktree pinning: `/tmp/aa-vNN-tree` — matrix runs against a hash-pinned
  worktree
- Agent identity trailers: `Co-Authored-By: agent:xorn` in commits
- Auto-memory dirs (per-agent) rsync'd to `agent-logs/`
- Cross-agent knowledge flows through shared repo (commits, docs, memory
  citations), never direct message-passing

**Measured effectiveness** — specialization is real:
- **xorn** (Codex GPT-5.3-Codex-Spark) — RTX engine, 500×100 hunts,
  scan-semantic tightening. 2,255 commits in 26 days.
- **cleaver** (Claude Opus 4.7+) — autoascend fleet campaign, 88 matrices,
  audit methodology. 210+ memory files.
- **maud** (Claude Opus 4.7+) — main-tree porting, subagent orchestration.
- **golem** (Gemini) — infrastructure, stub consolidation (per GEMINI_ROLE.md).
- **monk** (Claude Opus) — the transpiler counter-experiment.

**Cross-citation is measurable.** Cleaver cites monk's
`feedback_firstdiv_vs_total_p.md`; monk's memory cites cleaver's
`retirement_pattern`. Lessons cross agents through the git-backed
memory system.

**Outcome.** Compounded. Different-model agents are worth the coordination
cost because their blind spots differ.

**Failed variant.** naga and contestant went dormant. Not every attempted
agent role survives selection.

---

### 31. Recorder-probe forensics (monk's signature)

**Problem addressed.** PRNG-index divergence is easy to detect but hard
to attribute. When a state field disagrees between C and JS, which
call site caused it?

**Infrastructure** (monk port, `nethack-c/recorder/src/`):
- Env-gated C-side probes: `UMOVE2`, `DOGM`, `DGOAL`, `RUNCHK`,
  `place_monster.call`, `tty_nhgetch`, `dochug`, `m_move`
- Log arbitrary C-side state inline with the RNG trace
- **Correlate JS probes by `game.moves`, NOT by RNG-call-index** —
  a critical trap; `_rngLog.length` counts rng + trace, not just rng
- `KEEP_RNG_LOG=/tmp/X.rnglog node scripts/record-session.mjs ...`

**Measured effectiveness.** Seed0015 root confirmed end-to-end:
`game.stairs` nulled incorrectly on `ins_chkpt` checkpoint saves
(C frees only on FREEING mode 4; JS did unconditionally) →
`On_stairs(hero)=false` → pet dog `appr=0` → inventory-dogfood
`obj_resists` diff. Fixed via mode gating; **+129 P / +14 S**
(div 8386→8537 = 99.7%). set-mon-data write-through +13842 P on
seed0108 → full PRNG.

**Verified for all 4 savelev callers.**

**Outcome.** Genuine methodological innovation. Monk's project is
architecturally limited, but this technique alone is worth harvesting
for teleport.

**Failed variant.** Re-record faithfulness
(`feedback_rerecord_not_canonical_faithful.md`): the local recorder
binary can diverge from `sessions/*.session.json` because trap-effect
eval-order is C-unspecified. Rule: always diff JS-replay vs *canonical*
session JSON, never vs re-record.

---

### 32. NAO xlogfile + top-player configs

**Problem addressed.** Ports without external ground truth measure
themselves against themselves.

**Infrastructure.**
- `research/nao-rcfiles/` — 108 top-player `.nethackrc` files collected
- `HUMAN_BASELINES.md` — 3.58 M human games from https://alt.org/nethack/xlogfile
- 239 NAO dumplogs analyzed for ID-rate baselines
- Mid-game harness boots NAO player states

**Measured effectiveness.** NAO data reframed the whole autoascend
campaign. The fleet was over-surviving early but under-pacing depth.
Without external data this wouldn't have been visible.

- 3.58 M human games: 15k-turn reach 3.7% (autoascend fleet: 12%)
- Human depth in-band Dlvl 11–12 vs autoascend fleet Dlvl 3
- ID-rate baselines from 239 dumplogs

Phase 3 architecture (pre-emptive gates, non-reactive planning) is
grounded in the human depth distribution as the target.

**Outcome.** A late but load-bearing addition. Estimation engine
calibration also gains ground truth from NAO-parametric fits.

---

## Category 9: The Session as the Unit of Testing — Visualization and Interactive Tooling

### 33. The session as the unit of testing (and the curated corpus)

**Problem addressed.** A parity port needs a test artifact that is at
once reproducible (deterministic replay), comparable (C and JS both
consume it), human-meaningful (it's a game someone played), and
accumulable (finding a bug should permanently add a test). Unit tests
satisfy none of the last three.

**The design.** A *session* is a recorded series of input/output
events: seed + datetime + nethackrc + the keystroke stream, plus the
C-side ground truth captured during recording (RNG calls, display
events, screens, cursor). Serialized as `.session.json`
(`test/comparison/sessions/`), normalized by `scripts/session_loader.mjs`,
optionally multi-segment (save/reload/bones round-trips).

**Everything consumes or produces sessions.** PES scores them (#17),
coverage runs them (#34), viewers render them (#37), the live game
loads them (#38), forking mutates them (#39), sherpa authors them
(#40), the contest collects them (#22), autoascend emits them (#23),
adversarial search breeds them (#24), the recorder probes annotate
them (#31). One artifact, one interchange format, ~15 tool families.

**Measured effectiveness.** The corpus is an accumulating asset:
19 sessions (maud, day 3) → 38 curated parity sessions → 45 → 82
(May 1, bones/polyself/shops/alchemy expansion) → 307 (July 11, all
passing on all 4 channels). Each addition pins a behavior someone
found worth testing — a human recording, an autoascend death, an
adversarial mutation, a NAO mid-game state. Value is measured, not
assumed: `cov-per-session.mjs` and `cov-rank-redundant.mjs` rank which
sessions add coverage and which are redundant.

**Outcome.** Foundational — arguably the central design decision after
"match every random number." It's the reason bugs convert into
regression tests at near-zero marginal cost, and the reason the
Category 9 tooling below could exist at all.

**Failed variant.** Re-recording is not canonical (#31's caveat): the
local recorder can diverge from the stored session because C
trap-effect evaluation order is unspecified. Rule: always diff against
the canonical `.session.json`, never against a re-record.

---

### 34. Code-coverage dashboard with per-session ranking

**Problem addressed.** "What has the session corpus *not* exercised?"
is invisible from pass/fail counts. Humans needed to see uncovered
code to know where the next valuable session should come from.

**Infrastructure.**
- `scripts/run-coverage.sh` — runs `c8` over the whole PES session
  corpus (`session_test_runner.mjs`), emits an Istanbul HTML report,
  re-themes it with a NetHack skin, flattens the index so every file
  shows on one page, and pushes to GitHub Pages
- `coverage/` (~45 MB, committed) — per-file, per-line/branch pages
  (`monsters.js.html` 857 KB, `objects.js.html` 1.09 MB, ...) plus
  machine-readable `coverage-summary.json` / `coverage-final.json`
- `scripts/cov-per-session.mjs`, `cov-analyze-subsets.mjs`,
  `cov-rank-redundant.mjs` — which sessions earn their keep
- `sherpa/coverage.js` — coverage awareness inside the authoring tool

**Measured effectiveness.** Headline numbers visible at a glance
(lines 64.3%, functions 51.0%, branches 59.9%, statements 78.3% as of
July). The per-session rankers turn coverage from a vanity metric into
corpus curation: redundant sessions identified, gaps directed the
contest and midgame-harness efforts toward unexercised subsystems.

**Outcome.** Load-bearing for corpus curation and for humans deciding
where test-generation effort goes next.

---

### 35. Timeline dashboard: parity and coverage over commits

**Problem addressed.** `parity-history.mjs` (#19) prints an ASCII
timeline, but regressions hide in text. Humans needed to *see* the
pass-rate trajectory and spot which commit bent the curve.

**Infrastructure.**
- `timeline/index.html` (~57 KB) — single-page dashboard with
  hand-rolled canvas charts (no chart library): the default **PES
  skyline** (total tested steps with per-channel RNG/Events/Screen
  lines), a **coverage-over-commits** chart, and a **session×commit
  heatmap** — rows are sessions, columns are commits, each cell blends
  green=RNG% / purple=Events% / blue=Screen%, with retired-row folding
- Per-commit expandable failure tables (session / PRNG / Events /
  Screen fractions)
- `scripts/gen-timeline.mjs` (643 LoC) — walks the full git log,
  parses `Parity-Status:` / `Coverage-Status:` trailers (#19's data),
  writes `timeline/data.json` (104 MB) + 289 detail-chunk files
- `timeline/VIEWER_SPEC.md` — design doc; Layer 3 (step-by-step replay
  of historic commits from raw.githubusercontent.com) specced

**Measured effectiveness.** Every regression is attributable by sight:
the heatmap makes "which sessions broke at which commit" a one-glance
query that previously required scripting. Built entirely on the
git-trailer convention — the dashboard is a *view* over #19, proving
the revert-safe trailer design pays compound interest.

**Outcome.** Load-bearing. The human-facing complement to the
CLI reporters (`parity-history.mjs`, `parity-dashboard.mjs`).

---

### 36. Parity-debugger: live side-by-side C vs JS

**Problem addressed.** Once PES flags a divergence, a human (or agent)
needs to *watch* it happen: the same keystrokes driving real C NetHack
and the JS engine simultaneously, with the difference highlighted.

**Infrastructure** (`tools/parity-debugger/`, ~3.9 KLoC):
- `server.mjs` (~950 LoC) — localhost server that spawns the real C
  binary via node-pty, tails its RNG/event log, and records sessions
- `debugger.js` (~88 KB client) — C terminal as a 24×80 grid beside a
  hidden JS-engine iframe (`/?seed=…&replay=1&logrng=1`) mirroring
  every keystroke; **cell-level divergence overlay** with C / JS /
  Diff toggle; Log/RNG/Events/Config side panes
- Session workflow: pick any recorded session from
  `test/comparison/sessions/` (including failed ones), replay, **resume
  from any step**, fork mid-replay (see #39)
- An embedded Claude CLI pane for in-context triage
- `docs/PARITY_DEBUGGER.md`

**Outcome.** Load-bearing for divergence diagnosis. This is where
"22 actionable divergences in 500 sessions" becomes 22 understood
root causes: the cell-level overlay turns a failing session from a
JSON diff into something a human can watch and reason about.

---

### 37. Session viewers and timeline scrubbers

**Problem addressed.** Divergences and agent behaviors live deep
inside thousand-step sessions. Humans needed to scrub a whole session
forward/back the way a video editor scrubs film.

**Infrastructure** — two scrubber families:
- **Generated, self-contained HTML** (no server; every frame embedded):
  - `scripts/session-viewer.mjs` (403 LoC) — one session, step
    forward/back, flip C vs JS, diffs highlighted
  - `scripts/pes-viewer.mjs` (568 LoC) — all sessions, one tab each,
    per-step screen + PRNG/Events comparison, DEC-graphics parsed
    into a colored 24×80 grid
  - `scripts/playthrough-viz.mjs` (168 LoC) — scrubber from any keylog
  - `scripts/autoascend-replay-viz.mjs` (202 LoC) → `autoascend-viz/`
    — per-seed scrubbers (0.3–4.1 MB each) over thousands of agent
    turns, with an index table (steps/XL/depth/outcome); used to see
    where the bot stalls or dies
- **Live scrubber backed by RTX** (`mp.html` + `multiplayer/client/`):
  a bottom scrub bar over the running game; scrubbing is purely local —
  the client keeps a ring of RTX snapshots and `rollbackToStep(N)`
  thaws the nearest anchor ≤ N and replays forward
  (`docs/MULTIPLAYER_PROTOCOL.md` §7). This is the RTX engine (#20)
  surfaced as a human affordance.

**Outcome.** Load-bearing. The scrubbers are how failed sessions get
*understood* rather than just counted — and the autoascend scrubbers
are how fleet-behavior questions ("why did seed 5 die at t3200?") get
answered without re-running anything.

---

### 38. The live game page as a session loader

**Problem addressed.** A separate "test viewer" app would drift from
the real engine. The page a human plays should be the page that
replays a diverged session.

**Infrastructure.**
- URL-parameter surface in `js/nethack.js` (`parseUrlParams`):
  `?seed=`, `?datetime=`, `?nethackrc=`, `?replay=1` (session-replay
  mode, matching recording conditions), `?logrng=1`, `?pet=`
- `js/session_loader` + `gameFromSession()` / `runSegment()` in
  `js/jsmain.js` — multi-segment replay through the production engine
- The parity-debugger (#36) and multiplayer client both drive this
  same surface rather than a parallel implementation

**Outcome.** Quiet win. Zero drift between "the game" and "the test
harness's idea of the game," because they are one artifact. Any
session in the corpus — including failing ones — is a URL away from
running live.

---

### 39. Session forking: resume at a point with changed input

**Problem addressed.** A valuable session is a reusable *prefix*: the
interesting state it reaches can seed many new tests. Re-recording
from scratch to explore "what if the player had done X at step N
instead?" wastes the prefix.

**Infrastructure** — three fork mechanisms:
- **Multiplayer fork API** — `POST /api/heads/<parent>/fork
  {at_step: N}`: the server re-bases the parent keystream prefix,
  replays it to re-derive fork-point state, and returns a new head;
  fork markers render in the scrub bar; lineage tracked by
  `scripts/mp-head-lineage.mjs` (`docs/MULTIPLAYER_PROTOCOL.md` §7.2)
- **Parity-debugger fork** (#36) — stop a replay at any step; the
  server captures C state and the human takes over live from there
- **Offline mutation** — `scripts/adversarial-session-mutate.mjs`
  forks a `.session.json` at `--index N` with
  `--mode insert|replace|delete|splice`, then beam-searches for the
  earliest C-vs-JS divergence (the engine behind #24's session-mutate
  arm); the midgame harness (#26) is the same idea with NAO states as
  the fork point

**Outcome.** Load-bearing. Forking is what makes the session corpus
(#33) *compound*: every accumulated session becomes a launch pad for
families of new tests instead of a single frozen check.

---

### 40. Sherpa: a session builder designed for AI agents

**Problem addressed.** Agents are bad at babysitting long-lived
interactive processes. Authoring a new test session by "playing the
game" over a pty burns context and goes stale mid-conversation. The
tool an AI needs is *stateless*: every invocation self-contained.

**Infrastructure** (`sherpa/`, ~680 KB, 24 modules):
- Keyplans (`.kp`): human-readable header (`seed:` / `datetime:` /
  `nethackrc:`) + quoted key-string lines + `#` comments + `#>`
  checkable assertions. ~150 keyplans in `sherpa/keyplans/`
  (including `deaths/`, `nhbug/` corpora)
- Stateless CLI (`main.js`): each invocation loads a keyplan, replays
  it against the C binary (or JS engine via `js_engine.js`), runs one
  verb, prints the observation. Verbs: `init`, `map`, `state`,
  `screen`, `try <keys>`, `goto <target>`, `pickup`, `throw`, `fight`,
  `autocombat`, `search`, `open`, `save`, `import`, `check`
- `run_until.js` — the "run-until" verb: `--pline`, `--pline-regex`,
  `--event`, `--steps` stop conditions
- Multi-segment keyplans (save/reload/bones round-trips) via
  `segment_args.js`; `--update` edits the keyplan in place;
  `check` replays with assertion verification
- Pathfinding and observation layers (`navigate.js`, `pathfind.js`,
  `map_render.js`, `observe.js`, `combat.js`) so `goto`/`autocombat`
  are single verbs rather than key-by-key micromanagement
- Exports `.session.json` fixtures directly into the PES corpus
- `docs/SHERPA_DESIGN.md`

**Measured effectiveness.** The 150-keyplan corpus and the multi-
segment keyplans behind the bones round-trip sessions (suite expansion
45→82) were sherpa-authored. Cited in the Wiring-Oversight chapter as
the unlock for bones round-trips.

**Outcome.** Load-bearing. Sherpa is the bridge between agents and the
session corpus: it is how an AI *writes* a test, the same way the
scrubbers (#37) are how a human *reads* one.

---

## Category 10: The Contest as Replication Experiment

### 41. A public porting contest with an automated held-out judge

**Problem addressed.** After a successful in-house result, the
methodological claim is untested: did the port succeed because of the
technique stack, or because of luck, model access, or the author's
familiarity with the domain? The strongest test of a methodology claim
is whether strangers can replicate the result with the same tools.

**Infrastructure.**
- **The Teleport Contest** — announced at
  https://mazesofmenace.ai/announcement/ (opened May 6, 2026; Phase 1
  freezes Nov 29, 2026; Phase 2 closes Dec 31, 2026)
- `teleport-contest` skeleton repo — a playable NetHack shell with
  PRNG and terminal wired up and `js/` nearly empty; contestants fork
  it and port the 442,901 lines of C/Lua themselves, by any method:
  "AI agents, hand-coding, transpilers, monks chanting in caves"
- `judge/` — automated scoring of every fork on a 2-hour cycle:
  44 public sessions at launch (now 59 public + 65 **secret held-out**
  sessions per the judge lists), leaderboard, sandboxed execution,
  no network access during scoring
- Anti-overfitting design: held-out sessions catch suites-teaching-to-
  the-test; **Phase 2 scores against a *new* target divided by a
  penalty proportional to how much the code changed to chase it** —
  rewarding solutions that generalize over solutions that overfit
- Contestant tooling handed over: the session viewer with color-coded
  screen/PRNG diff highlighting, recorder patches for making
  deterministic recordings, analysis tools
- The announcement doubles as the project's candid **origin story**:
  the first four-month attempt failed via three named failure modes —
  agents inventing pseudo-technical "religion" ("sparse boundary
  frames") to rationalize async bugs; agents chasing easy points until
  a hard plateau; and the flawed framing contaminating 200 K lines of
  names, comments, and structure — leading to a full restart from a
  distilled-lessons prompt. That restart is the teleport port this
  catalogue documents.

**The stated hypothesis** (contest README): *"the magic is in the LLM
methods, not the code itself. If your method works, sharing the code
costs you nothing. If it doesn't, no one was going to copy your code
anyway."*

**Relation to monk.** The in-house counter-experiment (#28) was scored
against the contest's launch-era 44-session public suite
(`frozen/score.sh`) — monk is effectively an internal contestant
testing the readable-transpiler strategy under contest conditions,
reaching 24/44.

**Measured effectiveness (interim, updated 2026-07-14).** Thirteen
entrants; the field split exactly along methods lines (full analysis:
[CONTEST-FIELD-REPORT.md](../CONTEST-FIELD-REPORT.md)). One entry
(serteal, an Emscripten wasm2js compile of the C engine plus a
self-built trace-fuzzing oracle) reached 43/44 on the held-out suite —
blocked only by the playability speed gate, the NTS story replaying.
Three "agentic" entries aced the public suite and collapsed on
held-out (2.4–15.4% RNG): a verbatim answer key, a laundered overfit,
and a disciplined-but-fixture-bound grind — none ever generated fresh
sessions from the C recorder they all shipped. One active entrant
(richie3366) is climbing fast on a cause-cited divergence-first loop.
The refined verdict: the differentiator is specifically *verification
methods* — self-generated ground truth, state-level channels,
Goodhart-resistant gates — not model, architecture, or commit volume.
Phase 1 runs through November 2026.

**Outcome.** In progress — but already the project's most rigorous
piece of self-skepticism: it invites the world to prove the
methodology claims wrong.

---

## Cross-Cutting Scorecard: What Compounded, What Didn't

### Techniques that compounded across all three ports

1. **PES (three-channel) parity** — foundational since menace
2. **LORE + auto-memory** — porting institutional memory forward
3. **PES history in git commit trailers** — atomic, revert-safe measurement
4. **Multi-agent collaboration** — different blind spots per model

### Techniques introduced by teleport that compounded

1. **Iteration speed as a knob** (pes-fast vs pes-report, etc.)
2. **Pre-registered decision rules**
3. **Autoascend as fuzzer**
4. **Adversarial search**
5. **RTX (reversible transactions)**
6. **check-async.mjs** (originated with monk's async flip, then adopted broadly)
7. **NAO xlogfile external ground truth**
8. **Estimation engine oracle calibration**
9. **The session corpus as an accumulating asset** (19→307 sessions; every bug becomes a test)
10. **Human-insight visualization suite** (coverage + timeline dashboards, parity-debugger, scrubbers)
11. **Session forking** (any session prefix seeds families of new tests)
12. **Sherpa** (stateless keyplan authoring — how an AI writes a test)

### Techniques introduced by monk that innovated but did not scale

1. **Recorder-probe forensics** — genuine innovation, ready to be harvested
   for teleport if the effort is made
2. **7-class lowering-bug taxonomy** — the intellectual output survives
   the ceiling
3. **Frozen judge as ceiling-diagnostic** — an unintended positive: it
   made the architectural limit legible

### Techniques that failed

1. **Readable transpiler first (monk's core thesis)** — architecturally
   limited by cross-TU async coloring
2. **String-vs-buffer OUT-param demotion (#18)** — trap; full-build
   regressed 20→8 PASS despite unit tests
3. **Capture-js-trace for multi-segment sessions** — mirage; does not
   thread storage across segments
4. **Phase 2 reactive playbooks** — hit firm 104-death floor,
   architecture-limited
5. **Strategic depth arc (static tilt-policies)** — 0/12 weapons helped,
   1/12 armor landed with regression
6. **PROJECT_PLAN.md as ongoing planning artifact** — archived Apr 27,
   emergent priorities took over

---

## Meta-Observations

**0. The session became the unit of testing.** One theme runs through
the whole catalogue: a *session* — a recorded series of input/output
events — is the artifact every tool consumes or produces. Accumulating
valuable sessions (each one exposing a behavior that needed testing)
turned out to be the same thing as accumulating tests; visualizing
sessions is how humans gained insight; forking sessions is how tests
generated more tests; sherpa is how agents author them. See #33–40.

**1. The techniques compound only when they're named, measured, and
cited across agents.** Everything in this catalogue that compounded had
a name, a measurement, and a paper trail. Everything that stagnated
either lacked a measurement or had a measurement its authors didn't
want to face.

**2. Iteration-speed discipline is a per-decision knob.** Fast during
exploration, exhaustive at landing. The habit turned out to be one of
the top-3 productivity multipliers.

**3. External ground truth is under-invested-in early.** NAO xlogfile
came late in teleport but reframed the whole autoascend campaign.
Future ports should invest earlier.

**4. Architectural bets that resist measurement fail.** Monk's readable
transpiler is architecturally limited because the single-TU model
cannot see cross-TU async coloring. This is not a tuning problem; it's
a bet that resists the measurement infrastructure.

**5. Building a game-playing agent as a fuzzer was worth it.** Autoascend
was a project inside a project, but as a coverage engine it multiplied
what human recordings alone could produce.

**6. The 500×100 tail is the terminal measurement.** When the tail is
long enough that overnight hunts produce no actionable regressions,
the port is done. This is teleport's currently-approaching endgame.

**7. The methodology claim is being externally tested.** The contest
(#41) is a live replication experiment, and by July 14, 2026 the field
had split precisely along methods lines: the one contestant who built
his own verification apparatus (self-generated fuzz corpora) nearly
solved the held-out suite; three who optimized against the public
fixtures aced public and collapsed on held-out; the fastest genuine
climber runs a cause-cited divergence-first loop. Early returns favor
the contest's hypothesis in refined form — the magic is specifically
in the *verification* methods. Final evidence arrives with Phase 1's
close in November 2026. See
[CONTEST-FIELD-REPORT.md](../CONTEST-FIELD-REPORT.md).

---

## References

- [LESSONS.md](../LESSONS.md) — the generalizable lesson behind each technique (same numbering), for teaching
- [REPORT.md](../REPORT.md) — Chapter 1 (menace) + Chapter 2 (teleport + monk)
- https://mazesofmenace.ai/announcement/ — the public contest announcement, including the candid three-failure-mode origin story of the restart
- `teleport/maud/contest/README.md` + `teleport/maud/judge/` — contest rules, judge, leaderboard, public/held-out session lists
- [ROLLUP.md](../ROLLUP.md) — May 1 + July 11 rollups
- [chapters.json](chapters.json) — chapter index (menace + teleport + monk)
- [analysis-infrastructure.md](analysis-infrastructure.md) — menace-era infrastructure timeline
- [analysis-verifiability.md](analysis-verifiability.md) — measurement precision timeline
- [analysis-strategy-effectiveness.md](analysis-strategy-effectiveness.md) — menace strategy scorecard
- [analysis-reusable-code.md](analysis-reusable-code.md) — reusable code inventory
- [audit-teleport-cleanup.md](audit-teleport-cleanup.md), [audit-teleport-final.md](audit-teleport-final.md) — early teleport audits
- Agent memory dirs: `agent-logs/teleport-{maud,cleaver,monk}/memory/`
- Xorn Codex rollouts: `agent-logs/quadro-codex-sessions/2026/{03,05,06}/`
