# Final Audit: teleport repo cleanliness
**Date:** 2026-03-27

---

## 1. CLEAN FILES

These files pass inspection -- no stale references, clean code, clear purpose:

### Root
- `favicon.svg` -- clean SVG, simple @ glyph
- `_config.yml` -- clean Jekyll config, properly branded "Teleport"
- `CNAME` -- `mazesofmenace.ai` (correct)
- `_data/version.yml` -- auto-generated, clean
- `.nvmrc` -- `25` (clean)
- `PROJECT_PLAN.md` -- clean, well-structured 7-day plan

### js/ (core infrastructure)
- `js/isaac64.js` -- clean port of ISAAC64 (one bug: see ISSUES)
- `js/rng.js` -- clean, well-documented, no broken imports
- `js/modal_guard.js` -- clean, well-documented
- `js/sync_assert.js` -- clean
- `js/origin_awaits.js` -- clean
- `js/screen_capture.js` -- clean
- `js/browser_input.js` -- clean
- `js/more_keys.js` -- clean
- `js/storage.js` -- clean
- `js/gstate.js` -- clean
- `js/game.js` -- clean
- `js/runtime_env.js` -- clean
- `js/trace.js` -- clean
- `js/hacklib.js` -- clean, thorough port of hacklib.c
- `js/const.js` -- auto-generated, clean
- `js/objects.js` -- auto-generated, clean
- `js/monsters.js` -- auto-generated, clean
- `js/version.js` -- auto-generated, clean
- `js/analyze_leaf_deps.py` -- clean utility
- `js/encode_corpus.mjs` -- clean build script

### shell/
- `shell/vi.js` -- clean vi simulator
- `shell/spacewar.js` -- clean Spacewar! engine
- `shell/bin/loader.js` -- clean command registry
- `shell/bin/nethack.js` -- clean
- `shell/bin/dungeon.js` -- clean
- `shell/bin/spacewar.js` -- clean
- `shell/bin/README.md` -- clean

### shell/sh/
- `shell/sh/index.js` -- clean
- (Other sh/ files not fully read but import chains appear healthy within the shell subsystem)

### docs/
- `docs/DECISIONS.md` -- clean, 15 well-written design decisions
- `docs/SESSION_FORMAT.md` -- clean V4 spec (two minor issues, see below)
- `docs/LORE.md` -- clean, valuable porting knowledge

### scripts/
- `scripts/pes-report.mjs` -- clean (one stale doc ref, see below)
- `scripts/compare-sessions.mjs` -- has broken import (see ISSUES)
- `scripts/comparison-window.mjs` -- has broken import (see ISSUES)
- `scripts/validate_session_schema.mjs` -- clean
- `scripts/setup-testing.sh` -- multiple stale references (see ISSUES)
- `scripts/generators/gen_constants.py` -- clean
- `scripts/generators/gen_objects.py` -- clean
- `scripts/generators/gen_monsters.py` -- clean
- `scripts/generators/marker_patch.py` -- clean (utility used by generators)

### skills/
- `skills/port-function/SKILL.md` -- clean
- `skills/parity-check/SKILL.md` -- clean
- `skills/lore-entry/SKILL.md` -- clean

### test/comparison/c-harness/
- `setup.sh` / `setup-clean.sh` -- clean
- `run_session.py` -- has "webhack-" temp dir prefixes (cosmetic, see ISSUES)
- `rerecord.py` -- clean
- `validate_session.py` -- has "webhack-" temp dir prefix (cosmetic)
- `NOMUX_STATUS.md` -- clean
- `patches-clean/` -- 19 clean patches
- `patches/` -- 38 legacy patches (pre-clean series)

---

## 2. ISSUES

### CRITICAL: Broken imports (will crash at runtime)

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `shell/shell.js` | 12 | `import ... from '../js/render.js'` -- **file does not exist** | Change to import from `'../js/terminal.js'` (where CLR_* are exported) |
| `shell/talk.js` | 5 | `import ... from '../js/render.js'` -- **file does not exist** | Change to import from `'../js/terminal.js'` |
| `shell/commands.js` | 16-19 | `import ... from '../js/mail.js'` and `'../js/mailcorpus.js'` -- **both files do not exist** | Either create stubs, remove imports, or gate with try/catch |
| `shell/filesystem.js` | 5 | `import { HOME_FILES } from '../js/mailcorpus.js'` -- **file does not exist** | Remove or stub |
| `scripts/compare-sessions.mjs` | 7-9 | Imports from `../test/comparison/session_loader.js`, `session_recorder.js`, `session_comparator.js` -- **none exist** | These are part of the old test infrastructure not yet built |
| `scripts/comparison-window.mjs` | 6 | Imports from `../test/comparison/comparison_artifacts.js` -- **does not exist** | Same issue |
| `js/isaac64.js` | 187 | Reference to `ISAAC64_MASK` -- **undefined constant** | Should be `MASK` (defined on line 6 as `0xFFFFFFFFFFFFFFFFn`) |

### CRITICAL: .gitmodules references 4 deleted game submodules

`.gitmodules` defines submodules for `dungeon/fortran-upstream`, `hack/hack-c/upstream`, `rogue/rogue-c/upstream`, `adventure/adventure-c/original`. **None of these directories exist in the repo.** The submodule entries should be removed entirely.

### HIGH: package.json has 19+ scripts referencing missing files

The following npm scripts reference files that do not exist:

| Script | Missing Target |
|--------|---------------|
| `test` | `scripts/run-test-gates.mjs` |
| `test:all` | `scripts/run-test-gates.mjs` |
| `test:unit` | `scripts/test-unit-core.mjs` |
| `test:core` | `test/comparison/session_test_runner.js` |
| `test:session` | `test/comparison/sessions.test.js` |
| `replay:dump` | `scripts/dump-js-replay.mjs` |
| `session:names` | `scripts/check-session-filename-length.mjs` |
| `session:redundancy` | `scripts/check-session-redundancy.mjs` |
| `session:stats` | `scripts/session-suite-stats.mjs` |
| `session:marginal` | `scripts/session-marginal-coverage.mjs` |
| `codematch:missing` | `scripts/codematch-missing-summary.mjs` |
| `audit:synclock` | `scripts/synclock_audit.mjs` |
| `audit:browser-safety` | `scripts/audit-browser-safety.mjs` |
| `translator:check-policy` | `scripts/check-translator-file-policy.mjs` |
| `translator:check-annotations` | `scripts/check-translator-annotations.mjs` |
| `coverage:rogue` | `rogue/scripts/run-coverage.sh` -- **rogue/ directory does not exist** |
| `coverage:hack` | `hack/scripts/run-coverage.sh` -- **hack/ directory does not exist** |
| All `coverage:session-parity:*` | `scripts/run-session-parity-coverage*.sh` / `.mjs` |

### HIGH: AGENTS.md references 5 non-existent doc files

| Reference | Status |
|-----------|--------|
| `docs/MODULES.md` | Does not exist |
| `docs/DEVELOPMENT.md` | Does not exist |
| `docs/SESSION_FORMAT_V4.md` | Does not exist (correct file is `docs/SESSION_FORMAT.md`) |
| `docs/TESTING.md` | Does not exist |
| `docs/TESTING_GIT_NOTES.md` | Does not exist (referenced in `scripts/setup-testing.sh` too) |
| `docs/PESREPORT.md` | Does not exist (referenced in `scripts/pes-report.mjs`) |

### HIGH: AGENTS.md references non-existent directories/files

| Reference | Status |
|-----------|--------|
| `js/allmain.js` | Does not exist (listed as key file) |
| `nethack-c/` | Does not exist (submodule not initialized, referenced as C source authority) |
| `dat/` | Does not exist (referenced in directory structure) |
| `tools/` | Does not exist (referenced in directory structure) |
| `test/comparison/sessions/` | Does not exist (no session files yet) |
| `test/comparison/session_test_runner.js` | Does not exist |
| `test/comparison/rng_step_diff.js` | Does not exist |
| `.githooks/` | Does not exist |

### HIGH: Shell has dead references to deleted games

| File | Line(s) | Issue |
|------|---------|-------|
| `shell/shell.js` | 763 | Dynamic import of `'../adventure/js/advent.js'` -- adventure/ dir does not exist |
| `shell/shell.js` | 908-914, 947-953 | `window.location.href` for `/hack/`, `/rogue/`, `/basic/`, `/logo/` -- none exist |
| `shell/js/entry.js` | 67-70 | Same `/hack/`, `/rogue/`, `/basic/`, `/logo/` navigation |
| `shell/index.html` | 606-607 | Click handlers for `hm-hack` and `hm-rogue` -- hack/rogue dirs don't exist |

### MEDIUM: Old branding / naming

| File | Line | Issue |
|------|------|-------|
| `js/terminal.js` | 1 | Comment says "for all apps (NetHack, Hack, Rogue, Logo, BASIC)" -- only NetHack exists |
| `package-lock.json` | 2, 8 | `"name": "webhack"` -- should be `"teleport"` |
| `_layouts/doc.html` | 51, 55 | References `mazesofmenace.net` (CNAME is `mazesofmenace.ai`) |
| `docs/SESSION_FORMAT.md` | 39, 62 | `"recorded_with": { "menace": "abc123" }` -- "menace" key is old project name |
| `test/comparison/c-harness/run_session.py` | multiple | Temp dir prefixes `webhack-wizload-`, `webhack-chargen-`, etc. |
| `test/comparison/c-harness/validate_session.py` | 280-281 | Temp dir prefix `webhack-validate-` |

### MEDIUM: Old thinking / stale concepts

| File | Line | Issue |
|------|------|-------|
| `package.json` | 25-26 | `translator:check-policy` and `translator:check-annotations` -- translator was explicitly rejected (PROJECT_PLAN.md "What NOT To Do") |
| `package.json` | 27-28 | `coverage:rogue` and `coverage:hack` -- deleted games |
| `test/unit/translator_*.test.js` | all 7 files | Tests for the deleted C-to-JS translator tool (`tools/c_translator/main.py` does not exist) |
| `test/fixtures/translator_*.c` | all 4 files | Fixture files for the deleted translator |
| `test/unit/replay_core_render_architecture.test.js` | | References deleted `replay_core.js` |
| `.gitignore` | 18 | `selfplay/.nethack-home/` -- selfplay was explicitly rejected |
| `.gitignore` | 36 | `adventure/js/adventure-data.json`, `adventure/scripts/dump-messages` -- adventure/ deleted |
| `.gitignore` | 33 | `# rogue/rogue-c/patched/` -- rogue deleted |

### MEDIUM: `menace-` localStorage keys in tests

`test/unit/storage.test.js` uses `menace-save`, `menace-topten`, `menace-bones-*`, `menace-options`, `menace-fs` as localStorage keys extensively. `test/unit/topten.test.js` line 345 asserts `TOPTEN_KEY === 'menace-topten'`. This suggests the main game code still uses `menace-*` prefixed localStorage keys.

### LOW: WEBHACK_ environment variable prefix

Multiple files use `WEBHACK_` prefixed env vars (e.g., `WEBHACK_MODAL_GUARD`, `WEBHACK_STRICT_SINGLE_THREAD`, `WEBHACK_COSMIC_DISPLAY_LOGS`, `WEBHACK_YN_TRACE`, `WEBHACK_SYNC_ASSERT`, etc.). These work but are named after the old project. Not blocking but worth noting.

### LOW: setup-testing.sh references deleted infrastructure

| Line | Issue |
|------|-------|
| 86 | `docs/TESTING.md` does not exist |
| 87 | `docs/TESTING_GIT_NOTES.md` does not exist |
| 90-91 | References `oracle/index.html` and GitHub Pages oracle URL -- oracle dashboard may not exist |
| 81 | References `.githooks/commit-with-tests-notes.sh` -- `.githooks/` does not exist |
| 52 | `chmod +x .githooks/*.sh .githooks/pre-*` -- `.githooks/` does not exist |

### LOW: `test/comparison/c-harness/patches/` (legacy series)

The `patches/` directory contains 38 older patches alongside the 19 clean `patches-clean/` series. The clean series is the current one. The legacy patches should be removed or documented as historical.

### LOW: README.md "Merge Plan" section

README.md lines 81-92 describe merging back into the "Mazes of Menace" parent project. This is process documentation that a fresh-start reader doesn't need and references the old project.

### LOW: origin_awaits.js redundant expressions

Line 35: `game.map || game.map || null` (duplicated condition)
Line 36: `game.u || game.u || null` (duplicated condition)

---

## 3. WISDOM CHECK

### What is well-captured

- **Cardinal Rules** (AGENTS.md, LORE.md, PROJECT_PLAN.md) -- excellently documented in 3 places, consistent
- **Anti-patterns** (AGENTS.md "Common C-to-JS Pitfalls") -- 6 critical pitfalls clearly stated
- **Known hard areas** (PROJECT_PLAN.md) -- 8 areas with rationale and day assignments
- **Porting lessons** (LORE.md) -- structured debugging techniques, comparison window usage
- **Decision log** (DECISIONS.md) -- 15 major decisions with full rationale
- **Session format** (SESSION_FORMAT.md) -- detailed V4 spec
- **Port order** (AGENTS.md, PROJECT_PLAN.md) -- clear 7-phase ordering
- **What NOT to do** (PROJECT_PLAN.md) -- explicit rejection of translator, selfplay, side projects

### What is missing or inadequate

1. **No `docs/MODULES.md`** -- AGENTS.md references it for "circular import policy" but the file doesn't exist. ESM circular import guidance should be written or the reference removed.

2. **No `docs/DEVELOPMENT.md`** -- Referenced as dev setup docs. `setup.sh` exists but there's no written dev guide.

3. **No test infrastructure docs** -- `docs/TESTING.md` and `docs/TESTING_GIT_NOTES.md` are referenced but missing.

4. **CODEMATCH.md is entirely `[ ]` markers** -- Every function is "not started." This is accurate for a fresh port but provides no porting progress information. It would benefit from a note explaining it's the starting state.

5. **No guidance on which C functions to port first** -- PROJECT_PLAN.md lists files-by-day but CODEMATCH.md doesn't indicate priority. The AGENTS.md "Port Order" section is good but doesn't go to function-level.

6. **No save/restore architecture notes** -- This is one of the hardest systems to port and isn't covered in DECISIONS.md or LORE.md.

---

## 4. OVERALL ASSESSMENT

### The Good

The **core JS infrastructure is solid and clean.** The 20 files in `js/` are well-written, well-documented, and serve clear purposes. The PRNG (isaac64.js + rng.js), terminal, input system, modal guard, and screen capture are production-quality code ready for the port to build on.

The **documentation quality is high.** AGENTS.md, DECISIONS.md, LORE.md, SESSION_FORMAT.md, and PROJECT_PLAN.md collectively form excellent guidance for an agent starting the port. The Cardinal Rules, anti-patterns, and "What NOT To Do" sections are particularly valuable.

The **shell subsystem is functional** and provides a compelling user-facing interface. The shell/bin/ loader architecture is clean and extensible.

The **C harness** (test/comparison/c-harness/) is well-built with comprehensive patches and recording infrastructure.

### The Bad

The repo has **significant cruft from the parent project ("Mazes of Menace")**:

1. **`.gitmodules`** references 4 deleted game submodules (hack, rogue, adventure, dungeon)
2. **`package.json`** has ~19 scripts pointing at missing files, plus 2 referencing deleted game dirs
3. **`package-lock.json`** still says `"name": "webhack"`
4. **Shell code** has dead navigation to `/hack/`, `/rogue/`, `/basic/`, `/logo/` and a dynamic import of deleted `adventure/js/advent.js`
5. **Two broken imports** (`js/render.js` does not exist, imported by shell.js and talk.js)
6. **Two broken imports** (`js/mail.js` and `js/mailcorpus.js` do not exist, imported by commands.js and filesystem.js)
7. **7 translator test files** and **4 translator fixture files** for a deleted tool
8. **AGENTS.md** references 5 non-existent doc files and multiple non-existent script/test files
9. **One real bug**: `isaac64.js` line 187 references undefined `ISAAC64_MASK` (should be `MASK`)

### Is it ready?

**Not quite.** A fresh agent starting the port would immediately hit broken imports in the shell and non-functional npm scripts. The core `js/` infrastructure works in isolation, but the integration layer (shell, scripts, tests) has too many dangling references.

### Priority fixes before starting the port

1. **Fix `isaac64.js`** -- `ISAAC64_MASK` -> `MASK` (line 187)
2. **Fix shell imports** -- `render.js` -> `terminal.js` in shell.js and talk.js
3. **Stub or remove mail imports** -- commands.js and filesystem.js import non-existent mail modules
4. **Clean `.gitmodules`** -- remove all 4 deleted submodule entries
5. **Clean `package.json`** -- remove scripts referencing deleted files/dirs; fix `package-lock.json` name
6. **Clean `shell/shell.js` and `entry.js`** -- remove dead game navigation (hack/rogue/basic/logo/adventure)
7. **Fix AGENTS.md** -- remove/correct references to non-existent docs and files
8. **Delete translator artifacts** -- 7 test files, 4 fixture files
9. **Clean `.gitignore`** -- remove selfplay, adventure, rogue lines
10. **Fix `_layouts/doc.html`** -- `mazesofmenace.net` -> `mazesofmenace.ai`

After these fixes, the repo would be genuinely clean and ready for a fresh-eyed agent to begin porting.
