# Infrastructure Compounding Analysis: Mazes of Menace Port

**Study period:** February 6 – March 25, 2026 (48 days)
**Project:** JavaScript port of NetHack (C) to run faithfully in a web browser
**Codebase:** `/Users/davidbau/git/mazesofmenace/wave/`
**Agent logs:** `/Users/davidbau/git/mazesofmenace/agent-logs/`
**Timeline:** `data/timeline.jsonl` (48 days, 6,272 commit events, 7,448 human events, 4,500 agent directives, 434 watchdog events)

---

## Part A: Infrastructure Inventory

### 1. ISAAC64 PRNG Port

**Created:** 2026-02-06 (Day 1)
**Creator:** Human (H)
**Commit:** `0c296c75dc`
**Purpose:** NetHack's C source uses the ISAAC64 pseudo-random number generator. Without an exact port, the JS version would generate entirely different random numbers for every game event — monster placement, item generation, dungeon layout — making comparison with C impossible. This was the foundation on which all C-vs-JS comparison testing rests.
**Files:**
- `js/isaac64.js` — direct port of `nethack-c/src/isaac64.c` (public domain)
- `js/rng.js` — updated to use ISAAC64, matching `rnd.c RND()` macro
- `test/unit/isaac64.test.js` — 14 tests for C compatibility
- `test/comparison/isaac64_reference.c` — C reference value generator

**Commit body excerpt:**
> "239 tests pass (all suites)."

---

### 2. C Comparison Harness (Screen Capture + RNG Trace)

**Created:** 2026-02-06 (Day 1)
**Creator:** Human (H)
**Commit:** `342f2f515e` ("Add C ground truth comparison testing framework")
**Purpose:** Solved the fundamental verification problem: how do you know if the JS port is faithful? The harness runs the original C NetHack binary under controlled conditions, captures PRNG call sequences and terminal screen output, and produces reference traces that JS output can be compared against. This made the entire parity-testing regime possible.
**Files:**
- `test/comparison/c_vs_js_map.test.js` — comparison test runner
- `test/comparison/run_session.py` / C harness scripts — session capture
- Frozen at C commit `79c688cc6` for reproducibility

**Evolution:**
- 2026-02-06: Initial PRNG call logging (`324b9ef818`)
- 2026-02-08: Mid-level function tracing (`midlog`) added to C harness (`aff067773c`)
- 2026-02-08: Added `__func__` to PRNG caller context, reduced capture delays (`590254091f`)
- 2026-02-08: macOS support added (`fddca6b715`)
- Later: `dbgmapdump` step snapshot tool, movement propagation tracer (Mar 2026)

---

### 3. Session Format (V1 → V4 Evolution)

**V1 created:** 2026-02-08 (Day 3)
**Creator:** Agents A (Claude Opus) and B (Claude Sonnet)
**Commits:** `8d989aec7c` ("Add session JSON format for C reference captures"), `ea911137ec` ("Migrate trace and screen comparison tests to session JSON format")
**Purpose:** Unified the test data format so that C reference captures (PRNG traces, screen snapshots, keystroke sequences, RNG logs, checkpoints) could be stored as structured JSON and replayed by the JS test runner. Replaced ad-hoc scripts and individual golden files with a common schema.

**V3 created:** 2026-02-15
**V4 created:** 2026-03-22 — migrated all 506 sessions; key change was replacing `options` dict with `env` + `nethackrc` for startup configuration matching how the actual C binary is invoked.

**Format evolution tracked in:**
- `docs/SESSION_FORMAT_V3.md`
- `docs/SESSION_FORMAT_V4.md`
- `docs/COLLECTING_SESSIONS.md`

**Key structural elements (V4):**
```json
{
  "version": 4,
  "env": { "NETHACK_SEED": "42", "NETHACK_FIXED_DATETIME": "20000110090000" },
  "nethackrc": "OPTIONS=name:Wizard,role:Valkyrie,...",
  "steps": [ ... ],
  "checkpoints": { ... }
}
```

Each step contains: keystroke, rng call log (with C caller context), screen (ANSI RLE-compressed), structured events, and optional typgrid/flaggrid.

---

### 4. GitHub Pages Deployment

**Created:** 2026-02-07 (Day 2)
**Creator:** Agent B (Claude Sonnet)
**Commit:** `96c2cad0f7` ("Add panel toggles, track spoilers/index.html for GitHub Pages")
**Purpose:** Made the project publicly accessible at `mazesofmenace.net`, enabling the spoiler guide and later the oracle dashboard to be hosted as static sites. Also triggered automatic deployment via GitHub Actions.
**Key files:** `spoilers/index.html`, GitHub Actions workflow

---

### 5. Unit Test Framework

**Active from:** Day 1 (initial commit) through entire project
**Formalized:** 2026-02-08
**Creator:** Multiple agents (A, B, D initially)
**Purpose:** Standard `node:test` + Jest-style tests for individual JS modules. Unit tests caught regressions in isolated components (RNG, dungeon generation, character creation, inventory) without needing to run the full game.

**Scale progression (from commit bodies):**
- Day 1: 130 unit tests
- Day 3 (Feb 8): 330 unit tests
- Day 9 (Feb 14): ~500+ unit tests
- Eventually: 1,900+ tests including all session-based tests

**Key files:**
- `test/unit/*.test.js` — per-module tests
- `package.json` test scripts

---

### 6. E2E Test Framework

**Created:** 2026-02-07 (Day 2) — pre-existing from initial commit
**Commits:** `73b5cae03e` ("Speed up E2E tests, fix unit test hang, fix help/inventory E2E tests")
**Creator:** Agent A (Claude Opus)
**Purpose:** Browser-level tests using Playwright that verify the game renders correctly in a real browser: status line colors, DECgraphics rendering, keyboard input, menu display. Caught browser-specific bugs that headless tests missed (e.g., `#ccc` being normalized to `rgb(204,204,204)`).
**Files:** `test/e2e/game.e2e.test.js` and related fixtures

**Scale:** Grew from 34 tests (Day 2) to 31+ tests (March); 21/31 → 31/31 passing by Mar 9.

---

### 7. C-vs-JS Comparison Tests

**Created:** 2026-02-06 (Day 1) and expanded 2026-02-08–09
**Creator:** Human (H) initiated; Agents A, P, Q expanded
**Commits:** `324b9ef818` (PRNG call logging), `8d989aec7c` (session JSON format), `ed1fe90c5d` (special level infrastructure)
**Purpose:** The core verification loop: run the same seed in C and JS, compare PRNG call sequences cell-by-cell, screen character-by-character, event-by-event. Progress was tracked per session as `N/M` comparisons matching.

**Key milestone:** Feb 7, `89379b99ee` — "Achieve 10/10 perfect C-vs-JS map alignment across all test seeds"
**Later (map + special levels):** `3381c8f8d6` — "golden comparison 55/63 → 63/63 (100%)"

---

### 8. CODEMATCH.md Tracking Document

**Created:** 2026-02-19 (Day 14)
**Creator:** Agent U (Claude Sonnet) primarily
**Commit:** `beee13b62c` ("Add docs/CODEMATCH.md tracking C-to-JS file correspondence")
**Purpose:** Structured inventory of every C source file and its JS equivalent, with per-file status (`[ ]` not started, `[~]` needs alignment, `[a]` aligned, `[p]` partial, `[x]` complete). Gave agents a navigable map of what had been ported and what remained, reducing duplicated work and providing a shared basis for prioritizing effort.
**Files:** `docs/CODEMATCH.md`, `docs/C_PARITY_WORKLIST.md`

---

### 9. AGENTS.md Persistent Context

**Created:** 2026-02-17 (Day 12)
**Creator:** Human (H) and Agent U
**Commits:** `7235fbf5c7` ("docs: define phased roadmap and agent operating rules"), `8ff10f97` ("docs: codify work types, selfplay phase, and porting lore"), `19076db4` ("docs: move AGENTS guide to repository root")
**Purpose:** Persistent instructions for LLM agents — project phases, current priorities, coding discipline (e.g., "trace before theorize"), anti-patterns to avoid, and skills (movement propagation triage, area parity sweep, etc.). AGENTS.md gave every new agent session immediate access to the accumulated project knowledge without requiring the human to re-explain context.

**Evolution:** Grew substantially over time, especially after Mar 14 when the watchdog system started referencing it explicitly ("Consult AGENTS.md for any project-specific guidelines you should follow").

**Files:** `/AGENTS.md` (repository root)

---

### 10. Watchdog Agent System

**First observed:** 2026-02-10 (Day 5) — 150 watchdog events on that day
**Purpose:** An automated system that periodically injects continuation prompts into agent sessions: "Please continue with the most accurate work possible." / "Continue making forward progress." Kept long-running autonomous coding sessions from stalling. The watchdog messages are recorded as `type: "watchdog"` events in the timeline.

**Total watchdog events:** 434 across the 48-day period
**Key insight:** The watchdog did not direct the work; it simply prevented stall. Unique message variants (~14 distinct messages) occasionally added "Consult AGENTS.md" as the project accumulated shared context there.

**Watchdog events by date:**
- Feb 10: 150 (first appearance — burst during autonomous coding)
- Feb 11: 10, Feb 12: 2, Feb 18: 11, Feb 19: 10
- Mar 4: 13, Mar 5: 14, Mar 6: 15, Mar 7: 7
- Mar 17: 6, Mar 18: 112, Mar 21: 38, Mar 24: 30

---

### 11. Oracle / Git Notes Scoring System

**Git notes infra created:** 2026-02-11 (Day 6)
**Oracle dashboard created:** 2026-02-14 (Day 9)
**Oracle renamed from `floatingeye`:** 2026-02-15
**Oracle operational (backfill complete):** 2026-02-18
**Commits:**
- `79fe10a9d6` — "Add post-commit hook to stamp test notes immediately"
- `2ab0f26343` — "Redesign test workflow: pending.jsonl + git notes (no more loop)"
- `2c2fb8d199` — "Add detailed test notes system for project health tracking"
- `0b087255` — "Add Oracle's Test Chamber dashboard with parchment styling"
- `9a5a3ccb9` — "oracle: rename floatingeye to oracle with themed UI"
- `20856c75`, `75a1d677` — Oracle backfill and aggregation scripts
- `9651bc403f` — Backfill: 1232 commit test results exported to notes-test-results.jsonl

**Purpose:** Each commit gets a git note containing per-session test results (PRNG match counts, screen match counts, first divergence step, timing). The Oracle dashboard (`oracle/index.html`) visualizes this across the full commit history, making regression detection and progress tracking instant. The `rebuild.sh` script aggregates notes into `oracle/results.jsonl` for the dashboard.

**Key files:**
- `.githooks/pre-push` — auto-creates notes, enforces note for every pushed commit
- `oracle/rebuild.sh` — aggregates notes into results.jsonl
- `oracle/results.jsonl` — commit history mirror (synced via ~60 "Sync oracle/results.jsonl" commits)
- `oracle/index.html` — visualization dashboard
- `scripts/collect-test-results.mjs`, `scripts/generate-detailed-note.sh`

**Score structure per commit:**
```json
{
  "commit": "abc1234",
  "stats": { "total": 200, "pass": 197, "fail": 3 },
  "categories": { "gameplay": {...}, "chargen": {...}, "special": {...}, "map": {...} },
  "sessions": {
    "seed1_gameplay": {
      "status": "fail",
      "firstDivergences": { "rng": {"step": 46}, "event": {"step": 47}, "screen": {"step": 45} }
    }
  }
}
```

---

### 12. PES Report Format

**Created:** 2026-03-01 (Day 24)
**Creator:** Agent U (Claude Sonnet)
**Commit:** `f96690009` ("pes-report: add PES session parity report with AI diagnoses")
**Purpose:** The Oracle dashboard showed overall pass/fail per session, but debugging required knowing *where* in a session divergence first occurred. The PES (PRNG / Event / Screen) report shows a color-coded table of first-divergence step per channel per session. The `--diagnose` flag invokes Claude to generate triage TL;DRs. The `--failures` flag filters to failing sessions.

**Files:**
- `scripts/pes-report.mjs` — instant report from git notes
- `scripts/gen-pes-diagnoses.mjs` — batch Claude invocation for AI diagnoses
- `scripts/run-and-report.sh` — run sessions then show report
- `docs/PESREPORT.md` — documentation
- `oracle/pes-diagnoses.json` — cached AI diagnoses

---

### 13. LORE.md Knowledge Base

**Created:** 2026-02-18 (Day 13) as a stub
**Commits:** `d20cf200e7` ("docs: fix AGENTS.md title, restore push discipline, add docs/LORE.md stub"), grew through March
**Purpose:** Accumulated project-specific discoveries that don't fit in code comments — e.g., the precise ordering of RNG calls in specific C functions, edge cases discovered through debugging, session-specific root-cause analyses (seed032 staircase offset, etc.). Agents consult LORE.md when encountering known-difficult areas.
**Files:** `docs/LORE.md`

---

### 14. Iron Parity / C-to-JS Translator

**Designed:** 2026-02-26 (Day 21)
**Creator:** Multiple agents (primarily ?)
**Commits:** `688a6c806e` ("docs: add iron parity scope baseline"), `6a18adabda` ("docs: add C-first canonical naming"), `82e471b1a9` ("translator: add NIR snapshot pipeline and spec"), `de602af206` ("docs: launch iron parity workflow")
**Purpose:** A semi-automated C-to-JS translator pipeline (NIR = normalized intermediate representation) designed to systematically port the ~800 remaining C functions that were still missing or misaligned. The translator produced draft JS from C source, which agents then reviewed and patched. The goal was to eliminate the manual burden of per-function porting.

**Files:**
- `docs/IRON_PARITY_PLAN.md`
- `docs/C_TRANSLATOR_ARCHITECTURE_SPEC.md`
- `docs/C_TRANSLATOR_NIR_SPEC.md`
- `docs/C_TRANSLATOR_PARSER_IMPLEMENTATION_SPEC.md`
- `docs/C_TRANSLATOR_OUTPARAM_AND_FORMAT_ARCHITECTURE.md`
- `docs/C_TRANSLATOR_99_PERCENT_CAPABILITY_GAPS.md`
- Multiple `translator/*` scripts

---

### 15. Selfplay Agent

**Created:** 2026-02-09 (Day 4)
**Creator:** Agent S (Claude Sonnet)
**Commit:** `2b88976384` ("Add selfplay NetHack AI agent: foundation with perception, pathfinding, and autonomous play")
**Purpose:** An autonomous NetHack-playing AI that operates the JS port, exploring dungeons, fighting monsters, and descending floors. Used as a stress test for the game engine (crashes, hangs, edge cases that only appear with real gameplay) and to generate diverse test coverage. Also ran against the original C binary (`c095e7bd`) to compare behavior.
**Files:** `selfplay/` directory — agent brain, danger assessment, exploration, pathfinding

---

### 16. Debug Tools (dbgmapdump, Movement Propagation, etc.)

**dbgmapdump created:** 2026-03-07 (Day 30)
**Creator:** Multiple agents
**Commits:** `a848164a69` ("Add dbgmapdump step snapshots and rerecord seeds 031-033"), `8678836ded` ("tools: improve dbgmapdump triage flow"), `510529b726` ("dbgmapdump: enable runstep events by default")
**Purpose:** When the PES report showed a divergence at step N, `dbgmapdump` dumps the full game state (map, monsters, objects, RNG log) at each step around N in both C and JS, enabling direct comparison. Movement propagation tools (Mar 18+) traced monster movement call chains to identify specific function-level divergences.

**Files:**
- `docs/DBGMAPDUMP_TOOL.md`
- `docs/MOVEMENT_PROPAGATION_TOOL.md`
- `docs/TRIAGE_TOOLS_DESIGN.md`
- Various scripts in `scripts/`

---

### 17. Session Recording/Replay System

**Created:** 2026-02-08 (Day 3); `keylog` recorder added 2026-02-15
**Creator:** Agents A, B, then R (for backfill work)
**Purpose:** The C harness captures keystroke sequences and game state; these are stored as session files. The JS replay runner re-executes the same keystroke sequence in the JS port and compares output. This enabled the shift from "does the JS produce a valid game?" to "does the JS produce *exactly the same game* as C?"

**Key scripts:**
- `selfplay/c_runner.js` / `test/comparison/session_runner.js`
- `scripts/keylog_to_session.py` — convert manual keylog captures
- `scripts/run_session.py` — C harness session collection
- 4-worker parallel test runner with per-session timeout (internal 6s, external 10s)

---

### 18. Coverage Tracking

**Istanbul coverage:** 2026-03-10 (Day 33)
**Commit:** `b35f6ab0ce` ("coverage: publish full istanbul parity report at /coverage")
**Session-based parity coverage:** started Mar 10–11
**Purpose:** Two-layer coverage: (1) Istanbul code coverage of which JS lines are executed during parity sessions; (2) session-parity coverage tracking which fraction of the C codebase has sessions exercising it. The coverage campaign drove work by surfacing untested code paths.

**Files:**
- `coverage/` — Istanbul HTML report (published to GitHub Pages)
- `docs/COVERAGE.md`
- `scripts/coverage-gap.mjs` — parity session coverage gap report

---

## Part B: Before/After Productivity Impact

### Methodology

Metrics were computed from `data/timeline.jsonl`. "Commits/day" counts all commits in `commits[]`. "Human events/day" counts events where `type === "human"`. "Sessions/day" counts entries in `sessions[]`. Windows are the 7 days before and 7 days after each infrastructure introduction date.

### Infrastructure Introduction Points

| Infrastructure Item | Date Introduced | Commits/day Before | Commits/day After | Human Events/day Before | Human Events/day After | Sessions/day Before | Sessions/day After |
|---|---|---|---|---|---|---|---|
| C Harness + ISAAC64 | Feb 6 (Day 1) | 0 (project start) | 144.7 | 0 | 171.1 | 0 | 103.6 |
| Session Format V1 | Feb 8 (Day 3) | 22.0 | 174.7 | 113.0 | 279.9 | 106.0 | 74.3 |
| Selfplay + Comparison Tests | Feb 9 (Day 4) | 42.3 | 170.6 | 129.7 | 290.7 | 179.0 | 28.4 |
| Git Notes + Watchdog | Feb 11 (Day 6) | 145.4 | 107.4 | 139.8 | 247.0 | 124.8 | 20.3 |
| Oracle Dashboard designed | Feb 14 (Day 9) | 157.0 | 122.4 | 246.7 | 148.4 | 99.0 | 42.1 |
| AGENTS.md | Feb 17 (Day 12) | 137.9 | 100.7 | 271.4 | 95.4 | 18.6 | 41.1 |
| CODEMATCH.md | Feb 19 (Day 14) | 109.4 | 83.6 | 271.6 | 161.4 | 30.9 | 21.6 |
| Iron Parity / C Translator | Feb 26 (Day 21) | 83.6 | 78.3 | 161.4 | 226.0 | 21.6 | 33.3 |
| PES Report | Mar 1 (Day 24) | 72.9 | 146.1 | 154.4 | 344.3 | 8.0 | 88.7 |
| dbgmapdump tools | Mar 7 (Day 30) | 116.6 | 199.0 | 347.7 | 7.6 | 70.9 | 124.9 |

### Interpretation Notes

**Commits/day** is not a reliable standalone indicator here because:
1. The project had huge variation driven by multi-agent parallelism (e.g., Day 4: 343 commits from 71 concurrent sessions)
2. Infrastructure days often produced few commits of their own while unlocking more work subsequently

**The more telling signal is sessions/day and quality of sessions.** The key question is whether sessions consistently pass more tests.

**Session pass rate progression (from commit bodies):**

| Date | Pass Rate | Context |
|---|---|---|
| Feb 9 | 81.6% (985/1207 tests) | Before C-vs-JS session framework stabilized |
| Feb 9 | 93.6% (1090/1164) | After selfplay + comparison test burst |
| Feb 16 | 83.3% (140/168 sessions) | Phase 3 headless runtime unification |
| Feb 18 | 89.8% (184/205 sessions) | After oracle backfill operational |
| Feb 20 | 93.7% (193/206 sessions) | Steady state with oracle guidance |
| Mar 8 | 99.3% (150/151 sessions) | High-density debug phase |
| Mar 9 | 100% (151/151 sessions) | Phase complete milestone |
| Mar 11–12 | 100% on all batches (120, 139, 262, 268 sessions) | Coverage campaign |
| Mar 14 | 100% (201/201 sessions) | 74.2% code coverage milestone |
| Mar 22 | 97.0% (551/568 sessions) | Gate 8 migration |
| Mar 24–25 | 98–99.5% (553-560/563 sessions) | Final state |

### Two-Phase Aggregate Comparison

| Metric | Phase 1 (Feb 6–17, 12 days) | Phase 2 (Feb 18–Mar 25, 36 days) |
|---|---|---|
| Total commits | 1,479 | 4,793 |
| Average commits/day | 123.2 | 133.1 |
| Average sessions/day | 63.8 | 66.3 |
| Average human events/day | 202.3 | 139.4 |

The Phase 2 oracle/notes period shows **8% more commits per day with 31% fewer human events per day**, suggesting agents were more autonomous and required less correction/redirection per unit of output.

### Weekly Commit Rates (showing acceleration)

| Week | Commits | Avg/day | Notes |
|---|---|---|---|
| Feb 6–12 | 1,013 | 144.7 | Initial burst; all infra being built |
| Feb 13–19 | 910 | 130.0 | Oracle design + AGENTS.md period |
| Feb 20–26 | 519 | 74.1 | Consolidation; iron parity design |
| Feb 27–Mar 5 | 598 | 85.4 | Recovery; PES report |
| Mar 6–12 | 1,532 | **218.9** | Peak productivity; coverage campaign with oracle guidance |
| Mar 13–19 | 811 | 115.9 | Steady-state parity work |
| Mar 20–25 | 889 | 148.2 | Final push |

The **Mar 6–12 peak (219 commits/day)** coincides with the coverage campaign enabled by the oracle system and PES report providing precise per-session diagnostics.

---

## Part C: Case Study — The Oracle System

### Session: `6afb1a2d-03fe-47ac-b823-0979af6ff4fe`

**Date:** 2026-02-14 (Day 9)
**Model:** claude-opus-4-5-20251101
**Project:** project-root
**Session size:** 43,390 messages (very long, multiple context-window resets)
**Location:** `/Users/davidbau/git/mazesofmenace/agent-logs/project-root/6afb1a2d-03fe-47ac-b823-0979af6ff4fe.jsonl`

### The Human's Opening Request

> "This project has had more than 1000 commits and I would like to track its progress on matching recorded sessions from the C nethack. I would also like to track its progress in terms of other tests, code written, functions written, code changes, tests changed, docs written, etc. For each commit I would like to gather information in a standard form that we can later analyze, summarize and visualize. For example, I would like to know which unit tests pass and fail, and for the tests that have many session traces, which sessions pass, and for sessions that have many steps, which parts of which long sessions that are failing overall, which parts are passing. Currently we have git 'notes' system that is supposed to do some of this, but it doesn't seem to be used in practice. Let's redesign the system to actually contain useful information about the detailed state and health of the project at each commit. Once we have a good redesign, I will ask you to backfill notes to fill in the information and create scripts to keep the information up to date after each commit."

This single message launched the entire oracle infrastructure.

### The Agent's Design Proposal (message [125])

After exploring the codebase, the agent proposed a two-tier schema:

> "**Tier 1 (always captured):** Aggregate stats + individual test pass/fail status — Stored in git notes — ~50KB per commit (manageable for 1000+ commits)
>
> **Tier 2 (on-demand):** Full step-level detail for session tests — Stored in separate files: `teststats/details/<commit>.json` — Only generated when needed (failing sessions, recent commits)"

The agent identified the key missing capability: "Individual test results — only aggregate pass/fail counts captured" and "Step-level detail for sessions — can't see *where* in a 72-step session divergence occurs."

### Human Steering of Design (selected exchanges)

**On scale and priorities:**
> [message 133] "I want you to write this design in a bit more detail in the appropriate document, then implement and run it on 5 representative checkpoints sampled from different points in history. Then revise the plan based on practical findings, then scale it up to 1000 checkpoints."

**On dashboard naming (the whimsical moment):**
> [5031] "well, let's make the dashboard the default index.html inside /teststats. Is there a character in the game called a monitor? I am trying to think of a better directory name."
> [5098] "i think floatingeye is pretty funny!"

This named the dashboard "floatingeye" (renamed to "oracle" on Feb 15).

**On session step granularity:**
> [11454] "yes, let's measure things at the granularity of (1) session passing (2) turn [or for chargen, attribute] passing (3) screen passing (4) prng matching for each of these sessions. Can we do that for all the session types?"

**On rngFingerprint vs. full logs (a correction):**
> [23568] "yes my question is: what the heck is an rng fingerprint? I don't think we ever want these. I think we always want the full rng log. Not only do we want the full rng log, but I think we want the rng log supplemented with midlevel logging for more context."
>
> [23592] "when a test breaks, if we do not have detailed logs, it is impossible to fix problems"
>
> [23606] "let us delete rngFingerprint references. This is a useless concept. Yes, all generators should output full rng arrays. They should be synchronized with keystroke inputs in gameplay (so we know which rng comes before which game step)."

This was the pivotal design correction: the agent had proposed compact RNG fingerprints for storage efficiency; the human overrode this in favor of full logs for debuggability. This decision later enabled the PES report and dbgmapdump tools.

**On unifying session formats:**
> [23698] "ok great. Yes, and every session file should contain an options object at the start describing what settings are used to reproduce the session in C nethack. name, class, race, etc. Wizard mode, decgraphics, pickup, etc."
>
> [24907] "I don't see any \<mksobj to balance all the \>mksobj; midlog markers should always be balanced. Also I don't see any options at the top of the file, or keystrokes. Shouldn't we have a unified session format that looks just like gameplay?"

**On scoring metrics:**
> [23756] "ok so that is great. so when reporting results of a session, what is the data that we want to provide to communicate its success at a fine-grained level? i guess (1) number of rng calls that match [out of the number saved] (2) number of typgrids that match..."
>
> [23770] "so we should have a json report structure that identifies each session, which session type it is, and the stats on what matches in the run at this fine grained level. I think four metrics 1. rng calls that match; 2 keys for which the rng calls match; 3 typgrids that match; 4 screens that match."
>
> [23779] "yes plus divergence details on failure."

This defined the PRNG / Event / Screen (PES) schema that became the backbone of all subsequent testing.

**On session file storage:**
> [28637] "yeah VB compact ensure_ascii=True. Let's go ahead and regenerate all the session files for the whole project."

**On golden branch strategy:**
> [34010] "so test infrastructure can be duplicated. On main we use the test infrastructure for normal unit testing and debugging and etc. But on golden we use it for backfill. As the test infrastructure evolves, we might update both and rerun backfills for older commits."

### Git History of Oracle-Related Files

Oracle file additions (from `git log --diff-filter=A`):

| Date | Commit | Subject |
|---|---|---|
| 2026-02-14 | `0b087255` | Add Oracle's Test Chamber dashboard with parchment styling |
| 2026-02-14 | `2c2fb8d1` | Add detailed test notes system for project health tracking |
| 2026-02-14 | `9651bc40` | backfill: add special level testing and export notes to JSONL |
| 2026-02-14 | `343e8e8d` | Rename teststats to floatingeye |
| 2026-02-15 | `9a5a3ccb` | oracle: rename floatingeye to oracle with themed UI |
| 2026-02-15 | `75a1d677` | Add oracle backfill infrastructure |
| 2026-02-15 | `20856c75` | Add oracle backfill and aggregation scripts |
| 2026-02-15 | `895c076b` | test: unified result format with timing and git notes integration |
| 2026-02-16 | `2ec84274` | WIP: experimental oracle-based session testing |
| 2026-02-18 | `a37040a8` | hooks: enforce notes for every pushed commit |
| 2026-02-18 | `ae30863b` | hooks: auto-create missing test notes during pre-push |
| 2026-02-18 | `39bacf77` | oracle: backfill 200 commits of test history (Feb 15-18) |
| 2026-03-01 | `f9669000` | pes-report: add PES session parity report with AI diagnoses |
| 2026-03-10 | `b35f6ab0` | coverage: publish full istanbul parity report at /coverage |

**Key pre-oracle git notes work:**

| Date | Commit | Subject |
|---|---|---|
| 2026-02-11 | `79fe10a9` | Add post-commit hook to stamp test notes immediately |
| 2026-02-11 | `2ab0f263` | Redesign test workflow: pending.jsonl + git notes (no more loop) |
| 2026-02-11 | `822e5fd4` | Auto-push test notes to GitHub immediately after tests run |

**Critical design commit body (`2c2fb8d1`, Feb 14, by Human+Opus 4.5):**
```
Add detailed test notes system for project health tracking

Implements:
- scripts/collect-test-results.mjs: Detailed test result collection
- scripts/collect-code-metrics.sh: Git diff statistics
- scripts/generate-detailed-note.sh: Combined note generation
- scripts/backfill-detailed-notes.sh: Historical backfill
- scripts/test-5-commits.sh: Test on representative commits
- docs/TESTING_DETAILED_NOTES.md: System documentation
```

### Key Design Decisions Shaped by Human-Agent Dialogue

1. **Full RNG logs instead of fingerprints** — Human overrode agent's efficiency optimization. Enabled all later debugging tools.

2. **Four metrics per session (PRNG / Events / Screens / TypeGrids)** — Human enumerated these explicitly; became the PES report structure.

3. **Golden branch for backfill** — Human introduced the idea of separating test infrastructure from development to allow re-running historical commits against current fixtures.

4. **Session format unification** — Human pushed for all session types (map, special level, chargen, gameplay) to share the same top-level structure with `env`, `nethackrc`, `steps`.

5. **Per-session result granularity** — Human overrode agent's aggregate-only approach: "I don't want totals. What I'd really want in a unified test result format is results for individual sessions."

6. **Dashboard name: "oracle"** — Named by the human after initially wanting "monitor"; selected "floatingeye" (a NetHack creature), later renamed to "oracle" (another NetHack creature at a named level).

### Oracle System Impact on Subsequent Development

Once the oracle was operational (Feb 18 with backfill complete), agents could self-direct: they could inspect the oracle dashboard, identify which sessions were failing, examine PES divergence steps, and submit fixes without human guidance. The human events/day dropped from 202.3 (Phase 1) to 139.4 (Phase 2), while commits/day increased from 123.2 to 133.1. The oracle closed the feedback loop between commit and measurable quality.

---

## Summary: Infrastructure Compounding Effect

The infrastructure items did not operate independently — each built on the previous:

1. **ISAAC64 + C Harness (Day 1)** → made C-vs-JS comparison possible at all
2. **Session Format V1 (Day 3)** → unified test data, enabled reproducible replay
3. **Git Notes / Pre-commit Hooks (Day 6)** → automated test result recording per commit
4. **Oracle Dashboard (Day 9–13)** → made commit-level quality instantly visible
5. **AGENTS.md (Day 12)** → gave persistent context to autonomous agents, reducing per-session human overhead
6. **CODEMATCH.md (Day 14)** → gave agents navigable map of what remained
7. **PES Report (Day 24)** → turned oracle pass/fail into step-level triage diagnostics
8. **dbgmapdump (Day 30)** → turned PES divergence step into function-level diff

Each layer made the next layer possible and made each agent session more effective. The result is that a task requiring precise, detailed human analysis in Week 1 (e.g., "why does seed 42 diverge?") became a self-directed agent task by Week 4 ("the PES report shows divergence at step 46; dbgmapdump shows the RNG call sequence; fix it").

The session pass rate trajectory tells the compounding story most clearly:
- Week 1: ~82–94% on limited session sets, high per-session human cost
- Week 4 (Feb 18–24): 84–94% on 200+ sessions, with oracle guidance
- Week 5–6 (Mar 1–12): 99–100% on 120–300 session batches, largely autonomous
- Final state (Mar 25): 98–99.5% on 563 sessions across all game categories
