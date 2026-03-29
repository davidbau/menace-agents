# Reusable Infrastructure from wave/ for a Fresh NetHack C-to-JS Port

This document catalogs code in `/Users/davidbau/git/mazesofmenace/wave/` that is reusable
as a starting point for a fresh NetHack C-to-JS port, organized by category. It also identifies
what should NOT be reused.

---

## 1. PRNG Implementation

### `js/isaac64.js` — 189 lines
**The foundational piece.** A faithful JavaScript port of NetHack's ISAAC64 PRNG, producing
bit-exact output matching the C implementation. Uses `BigInt` for 64-bit unsigned arithmetic.

Exports: `isaac64_init`, `isaac64_reseed`, `isaac64_update`, `isaac64_next_uint64`,
`isaac64_next_uint`, `lower_bits`, `upper_bits`, `isaac64_mix`.

**Dependencies:** None (self-contained, no imports).

**Portability:** Drop-in. Zero game logic. Works in Node.js and browser.

**Why essential:** NetHack's entire determinism depends on this. Without bit-exact PRNG, no
session comparison is possible. The BigInt approach solves the JS 64-bit arithmetic problem
cleanly.

### `js/xoshiro256.js` — 224 lines
JavaScript port of xoshiro256** matching Lua 5.4's `math.random()`. Required for themed room
selection which bypasses the ISAAC64 logger.

**Dependencies:** `runtime_env.js` (for env flag checks).

**Portability:** Nearly drop-in; only the seeding integration requires game-specific knowledge.

**Why essential:** NetHack 3.7 Lua-scripted special rooms use `math.random` internally.
Without xoshiro256** bit-exact parity, themed room contents diverge invisibly.

### `js/rng.js` — 738 lines
High-level RNG wrappers: `initRng`, `rn2`, `rnd`, `rn1`, `rnl`, `rne`, `rnz`, `d`.
Includes per-call logging infrastructure for comparison with C traces. Two contexts (CORE and
DISP) match C's dual-PRNG design.

**Dependencies:** `isaac64.js`, `runtime_env.js`.

**Portability:** The logging infrastructure is coupled to wave-specific comparison formats.
The core `rn2`/`rnd`/`d` functions are portable as-is. The logging tags and cosmic display
machinery are game-logic entangled and should be stripped for a fresh start.

**Why essential:** Provides the same API surface as C's `rnd.c` — every game file uses these
function names. Matching call signatures avoids a translation layer.

### Golden test reference data: `test/comparison/golden/isaac64_seed*.txt`
Four files (seed 0, 42, 1000000, max_uint64) with 500 raw uint64 values each, generated from
the C implementation. Used by `test/unit/isaac64.test.js` for bit-exact verification.

**Portability:** Fully portable — these are ground truth values, not code.

---

## 2. C Comparison Harness

### `test/comparison/c-harness/run_session.py` — 3,088 lines
The core Python harness that drives the C NetHack binary under tmux, captures per-step RNG
traces and screen output, and writes self-contained session JSON files. Supports gameplay,
chargen, wizload, interface, and keylog recording modes.

Key capabilities:
- Builds V4 session format with `env` + `nethackrc` fields
- Controls timing with `NETHACK_KEY_DELAY_S` / `NETHACK_KEY_DELAYS_S` env vars
- Captures screen output via nomux (direct PTY) method
- Extracts RNG log, event log, repaint trace from per-keystroke C output

**Dependencies:** Python 3, tmux, the patched C NetHack binary, `NETHACK_SEED` env var.

**Portability:** Requires adaptation only for the tmux/PTY capture mechanism. The session JSON
schema and recording logic are portable. The `build_v4_fields()` function is especially reusable
as it defines the canonical seed+nethackrc session bootstrap format.

**Why essential:** Without this harness there is no ground truth. All parity work flows through
sessions recorded here.

### `test/comparison/c-harness/rerecord.py` — 736 lines
Rebuilds recorded sessions from their embedded `regen` metadata, dispatching to the appropriate
generator (run_session.py, gen_option_sessions.py, etc.). Supports parallel execution.

**Portability:** Drop-in once `run_session.py` paths are updated.

**Why essential:** Sessions recorded against early C patches become stale when patches change.
Rerecord from metadata instead of maintaining source keystroke files.

### `test/comparison/c-harness/validate_session.py` — 432 lines
Replays a session against C and checks message parity between recording and replay.

**Portability:** Nearly drop-in.

### `test/comparison/c-harness/patches-clean/` — 19 patches, ~4,654 total lines
The clean, rebased patch series that instruments the C NetHack 3.7 source for testing:

| Patch | Purpose |
|-------|---------|
| `001-deterministic-runtime.patch` | `NETHACK_SEED`, `NETHACK_FIXED_DATETIME` env vars |
| `002-deterministic-qsort.patch` | Stable sort eliminates platform-dependent ordering |
| `003-rng-log-core.patch` | Per-call RNG logging with caller identity via macro trick |
| `004-rng-log-lua-context.patch` | Lua RNG caller context propagation |
| `006-checkpoint-autodump.patch` | Per-keystroke state dumps |
| `007-no-animation-delays.patch` | Skip `nh_delay_output` in headless mode |
| `008-keylog-input-tracing.patch` | Log every key processed by `nhgetch` |
| `009-event-log-core.patch` | Structured event log (world events per step) |
| `010-monster-ai-event-logs.patch` | Monster AI decision logging |
| `011-repaint-trace-core.patch` | Display repaint tracing |
| `012-runstep-step-debug.patch` | Step boundary markers |
| `013-exp-trace.patch` | Experience/level-up tracing |
| `014-world-event-hooks.patch` | World event callback hooks |
| `015-test-move-events.patch` | Move-level event tracing |
| `016-nomux-capture.patch` | PTY screen capture without tmux (nomux mode) |
| `017-rng-display-logging.patch` | Display-context RNG call logging |
| `018-cosmic-display-logs.patch` | Cosmic display log infrastructure |
| `019-midlog-infrastructure.patch` | Mid-step logging framework |

**Portability:** These apply to NetHack 3.7.0 at a specific commit. Reusable as-is for any
new port targeting the same C version.

**Why essential:** The patches define the observation surface. Without them, C is a black box.
The RNG macro trick in `003` (non-recursive `#define rn2(x) (log_caller(), rn2(x))`) is
particularly elegant and took significant iteration to get right.

### `test/comparison/c-harness/setup.sh` and `setup-clean.sh` — 278 / 292 lines
Build scripts that clone NetHack 3.7 at a pinned commit, apply the patch series, and compile
a TTY-only binary. Handles macOS and Linux. Enforces clang (not gcc) for cross-platform
argument-evaluation-order determinism.

**Portability:** Drop-in for any new port targeting the same C version.

**Why essential:** The clang-vs-gcc note is critical — GCC evaluates function arguments in a
different order than clang, causing RNG sequence differences in calls like
`set_wounded_legs(rn2(2) ? ... , rn1(10, 10))`. Sessions recorded on macOS with clang must
be replayed with clang.

### `test/comparison/c-harness/nomux_capture.c` — small C helper
Direct PTY screen capture helper. Used by the nomux capture patches.

---

## 3. Session Format and Recording

The session format (V4) is defined by the fields written by `run_session.py` and consumed
by `session_loader.js`. Key schema elements:

```json
{
  "seed": 42,
  "env": {"NETHACK_SEED": "42", "NETHACK_FIXED_DATETIME": "20000110090000"},
  "nethackrc": "OPTIONS=name:Wizard,...\n",
  "options": {"role": "Valkyrie", "name": "Wizard", ...},
  "startup": {"rng": [...], "screen": [...], "screenAnsi": [...]},
  "steps": [
    {
      "key": "h",
      "rng": ["rn2(12)=3", "rnd(6)=4", ...],
      "screen": [...],
      "screenAnsi": [...],
      "events": [...],
      "repaint": [...]
    }
  ],
  "regen": {"mode": "gameplay", "moves": "hhlh...", "seed": 42}
}
```

### `test/comparison/session_loader.js` — 511 lines
Normalizes session JSON across format versions (V1 through V4). Handles datetime inference,
keylog metadata, and multi-source fallbacks.

**Portability:** Requires only minor renaming for a fresh project.

### `test/comparison/session_recorder.js` — 170 lines
JS-side session recorder — records the JS replay output in the same format as C-recorded sessions.

**Portability:** Requires adaptation to the new game's module structure.

---

## 4. Test Framework

### `test/comparison/session_comparator.js` — 269 lines
Orchestrates comparison between a C-recorded session and a JS replay. Compares three channels:
- RNG traces (sequence of `rn2(n)=v` entries)
- Event logs
- Screen output (plain and ANSI)

Returns first-divergence positions for each channel.

**Portability:** Mostly game-agnostic. Requires minor adaptation for new session schema.

### `test/comparison/comparators.js` — 936 lines
Low-level comparison utilities: RNG sequence normalization, event log comparison, mapdump
checkpoint comparison, symset normalization.

**Portability:** Large portions are game-agnostic (RNG sequence comparison, screen diff).
The mapdump and symset sections are NetHack-specific.

### `test/comparison/session_test_runner.js` — 1,436 lines
Test runner that loads session suites, runs JS replay against C-recorded sessions, and reports
PES (PRNG/Event/Screen) results. Supports parallel workers.

**Portability:** The parallel worker infrastructure and suite management are fully portable.
The game-specific imports need updating.

### `test/comparison/session_worker.js` — companion worker thread
Worker thread implementation for parallel session testing.

### `test/unit/isaac64.test.js` — 177 lines
Unit tests verifying JS ISAAC64 produces bit-exact output matching C golden files.

**Portability:** Drop-in for any new project that copies `isaac64.js` and the golden files.

### `test/unit/rng.test.js` — comprehensive RNG unit tests
Tests for all RNG wrapper functions.

**Why the test suite matters:** The session-based tests caught divergences that unit tests
missed entirely. Unit tests are necessary but not sufficient — the session comparison pipeline
is the real oracle.

---

## 5. PES Report System

### `scripts/pes-report.mjs` — 699 lines
Displays per-session parity status as "step of first divergence / total steps" for PRNG, Event,
and Screen channels. Color-coded terminal output (GREEN=100%, YELLOW=≥80%, RED=≤25%).

Reads from git notes or live test results. Includes `--diagnose` mode for AI-readable summaries.

**Dependencies:** `test/comparison/comparison_artifacts.js` for artifact discovery.

**Portability:** The scoring/reporting logic is fully game-agnostic. Requires only that
the session test runner produces comparison artifacts in the expected format.

**Why essential:** Three-channel PES breakdown is a dramatically better diagnostic than a
binary pass/fail. Knowing "RNG diverges at step 3 but screen matches through step 47"
locates bugs precisely.

### `scripts/comparison-window.mjs` — 503 lines
Inspects comparison artifacts at specific divergence points. Shows C vs JS side-by-side for
RNG traces, events, and screens with configurable context window.

**Portability:** Nearly game-agnostic once the artifact format is matched.

### `test/comparison/comparison_artifacts.js`
Artifact discovery and indexing for comparison results.

---

## 6. Display / Terminal Infrastructure

### `js/terminal.js` — 440 lines
Shared character-cell terminal base class used by NetHack, Hack, Rogue, BASIC, and Adventure.
Provides a `grid[row][col] = {ch, color, attr}` structure with optional DOM rendering.

Features:
- 16 NetHack color constants (CLR_BLACK through CLR_WHITE)
- Attribute flags (ATR_NONE, ATR_INVERSE, ATR_BOLD, ATR_UNDERLINE)
- DOM rendering with DejaVu Sans Mono font metrics
- Canvas line-height computation for box-drawing character alignment
- Headless mode (no DOM) for testing

**Dependencies:** None (self-contained). DOM optional.

**Portability:** Fully portable and game-agnostic. The class is explicitly shared across all
games in the project.

**Why essential:** Any browser-based terminal game needs this exact infrastructure. Building
it from scratch is non-trivial (font metrics, color constants, cursor management, DOM span
recycling).

### `js/screen_capture.js` — 205 lines
Free functions for screen grid capture and restore:
- `getScreenLines` / `setScreenLines` — plain text
- `getScreenAnsiLines` / `setScreenAnsiLines` — ANSI color-coded
- `getAttrLines` — attribute grid
- `DEC_TO_UNICODE` map for VT100 alternate character set

**Dependencies:** `terminal.js` (color constants only).

**Portability:** Fully portable. Game-agnostic.

**Why essential:** The ANSI encode/decode round-trip is essential for storing session screens
in JSON. The DEC special graphics map handles box-drawing characters correctly.

### `js/runtime_env.js` — 33 lines
Thin wrapper for `process.env` that works in both Node.js and browser (no-op in browser).
Exports `getEnv`, `envFlag`, `hasEnv`, `writeStderr`.

**Dependencies:** None.

**Portability:** Drop-in. Essential for any code that needs env-flag gating.

### `js/trace.js` — 68 lines
Cell-level tracing functions for display debugging. Enables per-cell write logging via
`WEBHACK_TRACE_CELL=col,row` env var.

**Portability:** Portable with namespace rename.

---

## 7. Build / Deploy Infrastructure

### `_config.yml` — GitHub Pages Jekyll configuration
Configures GitHub Pages with `jekyll-theme-minimal`, `jekyll-optional-front-matter`,
`jekyll-relative-links`, and `jekyll-titles-from-headings`. Sets up `doc` layout for
docs/, AGENTS.md, PROJECT_PLAN.md paths.

**Portability:** Drop-in for any GitHub Pages project. Update title/description fields.

### `package.json` — npm configuration
Defines test scripts, audit scripts, session management commands. Uses only `puppeteer` as
a runtime dependency and `acorn`/`acorn-walk` as dev dependencies.

**Portability:** The script names and commands are a useful template. Strip game-specific
scripts (coverage:rogue, coverage:hack) and keep the session/comparison/audit commands.

### `.nvmrc` — Node.js version pin
Single-file Node.js version declaration for nvm.

### `setup.sh` — project setup
Installs npm dependencies and sets up git hooks.

### `.githooks/` — git hook infrastructure
Hooks that run tests on commit, log results to git notes, and sync notes to JSONL.
Includes `commit-with-tests.sh` which gates commits on test passage.

**Portability:** The git notes / JSONL test history approach is reusable for any project.

---

## 8. Comparison / Diff Tools

### `scripts/compare-sessions.mjs` — 116 lines
Compares two session JSON files and reports differences in RNG traces, screen output, and
step counts.

**Portability:** Nearly game-agnostic.

### `scripts/comparison-window.mjs` — 503 lines (see section 5)

### `scripts/dump-js-replay.mjs`
Dumps JS replay output in a format comparable to C session recording.

### `scripts/cell-trace.mjs`
Per-cell display tracing tool.

### `scripts/event-divergence-window.mjs`
Shows event log divergences with context.

---

## 9. AGENTS.md / Documentation Templates

### `AGENTS.md` (= `CLAUDE.md`) — agent operating instructions
Defines the agent workflow: PES coverage pipeline, session lifecycle, parity-fix discipline.
The document structure is a template for any C-to-JS porting project:

- **Current Mission** section: defines the active phase and immediate priority
- **Source of Truth and Priorities**: establishes C behavior > documentation > test outputs
- **Execution Model**: single-threaded, one input owner, no synthetic queues
- **Required Resources**: what to read before working

**Portability:** The structure and discipline it encodes (coverage pipeline, no masking, C
execution model enforcement) is directly reusable. Only the game-specific phase content changes.

---

## 10. Modal Guard / Async Infrastructure

### `js/modal_guard.js` — 139 lines
Enforces the C single-threaded contract in JS: when a modal operation (more, yn_function,
getlin, direction prompt) is waiting for input, no other game code may execute.

Exports: `enterModal`, `exitModal`, `assertNotInModal`, `getModalOwner`,
`getViolationCount`, `resetModalGuard`, `setViolationHandler`.

Controlled by `WEBHACK_MODAL_GUARD` env var (default: on).

**Dependencies:** None.

**Portability:** Drop-in. Game-agnostic. Only the caller strings change.

**Why essential:** This is the guard that prevents the #1 class of async ordering bugs.
Without it, missing `await` on async calls silently causes divergent execution order.

### `js/sync_assert.js` — 150 lines
Asserts that an async function completed without yielding (for code that must behave
synchronously, e.g., level generation called from a sync context).

Exports: `sync`, `syncValue`, `getSyncViolationCount`, `resetSyncAssert`.

**Dependencies:** None.

**Portability:** Drop-in. Game-agnostic.

**Why essential:** Level generation in C is pure synchronous computation. In JS it becomes
`async` due to dynamic import of level data. `sync()` asserts that no real yield occurred,
catching cases where a lazy-loaded module wasn't pre-loaded.

### `js/origin_awaits.js` — 59 lines
Canonical async origin wrappers: `nhimport`, `nhfetch`, `nhload`, `display_sync`. Every
external await that isn't an input wait must flow through these, so the game state machine
knows when an origin await is in progress.

**Dependencies:** `gstate.js`.

**Portability:** Requires renaming (`nh*` prefix) and updating the gstate import.

**Why essential:** Distinguishes "waiting for input" (modal) from "waiting for external
resource" (origin). Without this distinction, the async execution model breaks down.

### `js/gstate.js` — 165 lines
Global game state reference and execution/origin guard state. Implements the synclock guard
(WEBHACK_STRICT_SINGLE_THREAD) that detects reentrancy violations.

**Dependencies:** `runtime_env.js`.

**Portability:** Requires minor adaptation for game-specific state structure.

---

## What Should NOT Be Reused

### `js/replay_core.js` — 490 lines
**Do not reuse as-is.** This module accumulated significant compensating complexity during
the port — workarounds for async boundary detection, multiple fallback paths for input
waiting, and game-specific imports. A fresh port should design a clean replay engine from
scratch using the session format as the interface contract.

What is reusable from it: the session format assumptions and the `drainUntilInput` concept
(race between command completion and input-wait sentinel).

### `js/replay_compare.js` — 560 lines
Partially reusable (ANSI stripping, screen comparison utilities) but entangled with NetHack-
specific game initialization (makemon, dungeon, player roles). Extract the utility functions;
don't import the file wholesale.

### `js/storage.js` — 1,386 lines
Game logic entangled with browser localStorage persistence. NetHack-specific save/restore
hierarchy. Do not reuse — start fresh.

### `tools/c_translator/` — ~5,491 lines total
The C-to-JS translation scaffold (Python, using clang's libclang). This was an experiment in
semi-automated porting and produced low-quality output that required extensive manual cleanup.
The strategy it embodies — "translate C to JS automatically then patch" — accumulated technical
debt faster than it produced parity gains. Do not reuse this approach.

What IS useful from it: the `compile_profile.json` (clang flags for parsing NetHack headers),
and the concept of the capability matrix for tracking which C constructs can be auto-translated.

### `scripts/generators/*.py` — ~3,752 lines total
The constant/object/monster/symbol generators are reusable IF targeting the same NetHack C source.
`gen_constants.py` (926 lines), `gen_monsters.py` (740 lines), `gen_objects.py` (1,123 lines)
extract data from C headers and patch corresponding JS files. The `marker_patch.py` utility
(82 lines) is a clean, reusable pattern for maintaining generated blocks in hand-edited files.

**Portability:** Reusable for a fresh NetHack 3.7 port targeting the same source commit.
Requires path updates.

### All of `js/` except the explicitly listed files
The 200+ game logic files in `js/` are NetHack-specific ports. Many contain parity bugs
discovered during the wave project. A fresh port should re-port from C source, treating
wave's JS files as references to compare against rather than as authoritative implementations.

---

## Summary: Highest-Priority Reuse Candidates

| Priority | File(s) | Lines | Why |
|----------|---------|-------|-----|
| Critical | `js/isaac64.js` | 189 | Bit-exact PRNG — must get right first |
| Critical | `js/modal_guard.js` | 139 | Prevents #1 async bug class |
| Critical | `test/comparison/c-harness/patches-clean/` | ~4,654 | C observation surface |
| Critical | `test/comparison/c-harness/run_session.py` | 3,088 | Session recording engine |
| High | `js/rng.js` (core functions) | ~200 | RNG API surface |
| High | `js/terminal.js` | 440 | Display infrastructure |
| High | `js/screen_capture.js` | 205 | Screen encode/decode |
| High | `test/comparison/session_comparator.js` | 269 | PES comparison logic |
| High | `test/comparison/session_loader.js` | 511 | Session format normalization |
| High | `scripts/pes-report.mjs` | 699 | Three-channel parity dashboard |
| High | `test/comparison/c-harness/setup.sh` | 278 | C binary build script |
| High | `js/sync_assert.js` | 150 | Async-in-sync-context guard |
| Medium | `js/xoshiro256.js` | 224 | Lua RNG (needed for Lua levels) |
| Medium | `js/runtime_env.js` | 33 | Env access abstraction |
| Medium | `js/gstate.js` | 165 | Global state and synclock guard |
| Medium | `js/origin_awaits.js` | 59 | External await wrappers |
| Medium | `test/comparison/c-harness/rerecord.py` | 736 | Session re-recording |
| Medium | `scripts/comparison-window.mjs` | 503 | Divergence inspection tool |
| Low | `scripts/generators/marker_patch.py` | 82 | Generated-block patching pattern |
| Low | `_config.yml` | 72 | GitHub Pages config template |
| Low | `AGENTS.md` structure | — | Agent workflow template |

---

## Key Engineering Insights for a Fresh Port

1. **PRNG first, everything else second.** Get `isaac64.js` verified with golden files before
   writing a single line of game logic. The comparison harness is useless without it.

2. **Build the C harness before porting.** Record 5-10 sessions from scratch in pure C before
   writing any JS. The sessions define the test suite; code written without them is unverifiable.

3. **clang, not gcc.** Sessions recorded on macOS or Linux must use clang consistently.
   gcc's different argument evaluation order corrupts RNG logs.

4. **The async execution model is the hardest problem.** `modal_guard.js` and `sync_assert.js`
   are the answers. Deploy them from day one, not as retrofits.

5. **Don't use the c_translator.** Manual porting with the C source open in one window and the
   JS file in another, guided by C sessions, produces better results faster than any automation.

6. **The session format is the interface.** If both C harness and JS engine write sessions in
   the same format, the comparison pipeline is trivially simple. Design the format before both
   implementations.
