# Teleport Repo Cleanup Audit

Audit date: 2026-03-27
Scope: Every preserved file in /Users/davidbau/git/teleport/

---

## 1. BROKEN -- Will cause errors

### 1.1 Missing files imported in multiple places

**`js/replay_core.js`** and **`js/replay_compare.js`** -- These files are imported by 10+ files but do NOT exist on disk and are NOT tracked by git.

| Importing file | Line(s) | Import |
|---|---|---|
| `test/comparison/session_test_runner.js` | 9-10 | `import { replaySession } from '../../js/replay_core.js'` / `import { prepareReplayArgs } from '../../js/replay_compare.js'` |
| `test/comparison/session_recorder.js` | 4-5 | Same imports |
| `test/comparison/session_runtime.js` | 9, 26 | Same imports |
| `test/comparison/session_helpers.js` | 24, 40, 55-56 | Same imports |
| `test/comparison/comparator_policy.js` | 15 | `import { getGameplayRawStepBase } from '../../js/replay_compare.js'` |
| `test/comparison/dbgmapdump.js` | 11-12 | Same imports |
| `test/e2e/headless_browser_parity.e2e.test.js` | 304 | Dynamic import of `replay_core.js` |
| `test/unit/dothrow_prompt.test.js` | 6-7 | Same imports |
| `test/unit/pager_quicklook_prompt.test.js` | 6-7 | Same imports |
| `scripts/movement-propagation.mjs` | 18-19 | Same imports |
| `scripts/debug_dog_display.mjs` | 2 | `import { replaySession } from '../js/replay_core.js'` |

**Fix:** These files were removed in the "clean slate" commit (43fb9aae4) but many importers still reference them. Either recreate them as thin wrappers over the new infrastructure, or update all importers to use the current equivalent API.

---

**`js/promo.js`** -- Imported by `js/nethack.js` line 11 but does not exist on disk and is not tracked by git.

| File | Line | Import |
|---|---|---|
| `js/nethack.js` | 11 | `import { Promo } from './promo.js'` |

**Fix:** Either create `promo.js` or remove the import and all Promo references from `nethack.js` (lines 11, 106, 107, etc.).

---

## 2. STALE -- Misleading references to old approaches

### 2.1 Old branding in VERSION_STRING

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/const.js` | 14 | `VERSION_STRING` contains `"Royal Jelly"` and `"vibe-coded by The Hive"` -- old project branding | Update to Teleport branding or make neutral |

### 2.2 `package.json` name is `"webhack"`

| File | Line | Issue | Fix |
|---|---|---|---|
| `package.json` | 2 | `"name": "webhack"` | Rename to `"teleport"` or `"teleport-nethack"` |

### 2.3 Comment references stale file name

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/nethack.js` | 1 | Comment says `// menace.js -- Browser-only game startup wiring.` but file is `nethack.js` | Update comment to `// nethack.js` |

### 2.4 V3 fallback code in `js/nethack.js`

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/nethack.js` | 149 | Comment `// V4: use env + nethackrc if available; fall back to V3 options` | AGENTS.md says "V4 session format only" -- the V3 fallback branch (lines 168-184) is dead code per Decision 12 |
| `js/nethack.js` | 169 | `// V3 fallback` code block that handles `session.options` | Remove the V3 fallback branch |

### 2.5 Stale comment referencing `replay_core`

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/input.js` | 45 | Comment: `"replay_core should feed keys via runtime queue"` | Update to reference current replay mechanism |

### 2.6 `keylog.js` source identifier says `"menace-js"`

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/keylog.js` | 60 | `source: 'menace-js'` in keylog metadata | Update to `'teleport'` or equivalent |

### 2.7 V3 references in `test/comparison/session_recorder.js`

| File | Line | Issue | Fix |
|---|---|---|---|
| `test/comparison/session_recorder.js` | 68 | Comment: `// Split a V3 screen string into ANSI and plain-text line arrays.` | V3 is obsolete per AGENTS.md Decision 12; update comment if the function serves V4 |

### 2.8 V3 reference in `test/comparison/session_test_runner.js`

| File | Line | Issue | Fix |
|---|---|---|---|
| `test/comparison/session_test_runner.js` | 486 | `// V3 format: steps[0] is startup, steps[1..] are per-keystroke.` | Remove or update V3 comment |

### 2.9 Stale session_loader.js comments

| File | Line | Issue | Fix |
|---|---|---|---|
| `test/comparison/session_loader.js` | 86 | `// v3 canonical: ANSI-compressed screen is stored directly in 'screen'.` | Remove v3 reference |

### 2.10 AGENTS.md references removed `docs/LORE.md` workflow

| File | Lines | Issue | Fix |
|---|---|---|---|
| `AGENTS.md` | 25, 51-52 | References writing LORE entries to `docs/LORE.md` -- this was previously superseded by doc diff entries | Review and update the LORE workflow instructions, or note that LORE is a living document and reference is fine |

### 2.11 `docs/DECISIONS.md` uses "WebHack" naming

| File | Line | Issue | Fix |
|---|---|---|---|
| `docs/DECISIONS.md` | 295 | `"how does WebHack handle these?"` | Replace `WebHack` with `Teleport` |

### 2.12 `setup.sh` uses old branding

| File | Lines | Issue | Fix |
|---|---|---|---|
| `setup.sh` | 2 | `# Unified setup script for Mazes of Menace` | Update to Teleport |
| `setup.sh` | 7-8 | `"Mazes of Menace - Setup"` banner | Update to Teleport |

### 2.13 `scripts/setup-testing.sh` uses old branding

| File | Line | Issue | Fix |
|---|---|---|---|
| `scripts/setup-testing.sh` | 13 | `"Mazes of Menace - Testing Setup"` | Update to Teleport |

### 2.14 Dead `HeadlessDisplay` re-export and deleted-class comments

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/headless.js` | 543-557 | Long comments about deleted HeadlessDisplay/HeadlessGame classes, re-export "for backward compatibility" | Clean up commentary; the re-export is fine but the comments read as migration notes, not documentation |

### 2.15 `animation.js` back-compat alias

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/animation.js` | 315-316 | `// Back-compat name used by old tests/examples.` / `export const initAnimations = initAnimation;` | Check if any code still uses `initAnimations`; if not, remove the alias |

### 2.16 `player.js` migration re-export comment

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/player.js` | 29 | `// Re-export for backward compatibility during migration` | Migration is complete; update comment or remove if re-exports are now the canonical path |

### 2.17 `headless.js` legacy session comment

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/headless.js` | 462 | `// Legacy sessions used an empty-string key as a game-ready marker.` | Only V4 sessions should exist; remove or update the comment |

### 2.18 `headless.js` legacy fallback for nethackrc

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/headless.js` | 528-540 | `// Prefer nethackrc, fall back to options for legacy callers.` -- function `extractCharacterFromSession` has a V3-style options fallback path | Remove the fallback if V4-only is policy |

### 2.19 `storage.js` legacy options migration code

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/storage.js` | 758 | `items.push({ key, label: 'Options/flags (legacy)' });` | Review if legacy option migration code is still needed |
| `js/storage.js` | 1297 | `// Fallback: read old menace-options JSON and auto-migrate` | Either keep as user data migration or remove |

### 2.20 `async-context-map.json` contains stale file references

| File | Lines | Issue | Fix |
|---|---|---|---|
| `scripts/async-context-map.json` | 20935+ | Contains many references to `js/replay_core.js` and `js/replay_compare.js` which no longer exist | Regenerate this map |

---

## 3. COSMETIC -- Branding, naming, comments

### 3.1 "Royal Jelly" / "Mazes of Menace" branding throughout

These are places where the old project name appears. The project is now "Teleport" so these should be updated (unless "Mazes of Menace" is kept as the in-game dungeon name per NetHack lore, which is fine).

**Branding that should change to "Teleport":**

| File | Line | Text | Fix |
|---|---|---|---|
| `index.html` | 8 | `<title>NetHack Royal Jelly -- Mazes of Menace</title>` | Update to Teleport branding |
| `index.html` | 6 | Meta description mentions "Mazes of Menace" | Update |
| `index.html` | 17 | `og:title` contains `"NetHack Royal Jelly -- Mazes of Menace"` | Update |
| `index.html` | 975 | Console log says `'NetHack Royal Jelly - Mazes of Menace'` | Update |
| `_config.yml` | 3 | `title: Mazes of Menace` | Update to Teleport |
| `_config.yml` | 4 | `description: JavaScript port of NetHack 3.7` | Fine or update |
| `_layouts/doc.html` | 18, 28, 30 | JavaScript that injects build number after "Royal Jelly" | Update |
| `shell/index.html` | 7 | `"A simulated 1982 Unix shell -- the secret heart of Mazes of Menace."` | Update |
| `shell/index.html` | 9 | `<title>Unix Shell 1982 -- Mazes of Menace</title>` | Update |
| `shell/sh/DESIGN.md` | 4 | `"implemented in JavaScript for the Mazes of Menace wave shell."` | Update |

**In-game/lore references to "Mazes of Menace" (probably keep as-is -- this is the NetHack dungeon name):**

| File | Line | Text |
|---|---|---|
| `shell/commands.js` | 370 | `nethack - Exploring The Mazes of Menace` (man page text) |
| `shell/bin/nethack.js` | 1, 6 | `// nethack -- Explore the Mazes of Menace` |
| `shell/filesystem.js` | 102 | `Welcome to the Mazes of Menace!` (MOTD) |
| `js/mailcorpus_plain.js` | 2587 | `"Word has it you are quite familiar with the Mazes of Menace."` |
| `test/comparison/comparator_policy.js` | 446 | Regex matching `"Welcome to the Mazes of Menace!"` |
| `test/comparison/message_display.test.js` | 164 | Test string `"NetHack Royal Jelly -- Welcome to the Mazes of Menace!"` |

### 3.2 `menace-*` localStorage key names

These are used as localStorage keys in production. Changing them would break existing saves for users. These are cosmetic only but should be noted.

| File | Lines | Keys |
|---|---|---|
| `js/storage.js` | 34-41 | `menace-save`, `menace-autosave`, `menace-bones-`, `menace-save-meta`, `menace-autosave-meta`, `menace-options`, `menace-topten`, `menace-fs` |
| `shell/filesystem.js` | 14 | `menace-shadow` |
| `index.html` | 995+ | Multiple references to `menace-options`, `menace-autosave`, `menace-save` |
| `shell/index.html` | 488+ | Multiple references to `menace-options` |

**Fix:** Either leave as-is (avoid breaking existing user saves) or add a migration path.

### 3.3 `js/glyphs.js` -- Massive TODO stub file

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/glyphs.js` | 1-358 | 23 TODO comments for unimplemented glyph customization functions. File contains auto-translated stubs that reference undefined variables (`gs`, `glyphmap`, `MAX_GLYPH`, `custom_nhcolor`, `NUM_GRAPHICS`, `zero_find`, `nonzero_black`, etc.) | Either implement or mark as intentionally stubbed. The auto-translated code references C globals that don't exist in JS -- these would throw at runtime if called |

### 3.4 `js/utf8map.js` -- Stub with undefined variable references

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/utf8map.js` | 1-46 | Auto-translated stub. References `gs.sym_customizations` and other undefined C globals. Would throw at runtime if called. | Same as glyphs.js -- either implement properly or document as dead code |

### 3.5 `js/botl.js` -- Many TODO stubs

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/botl.js` | 35-133 | 9 TODO comments for unimplemented status line functions | These are translator stubs; clean up or implement |

### 3.6 `js/rumors.js` -- Many TODO stubs

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/rumors.js` | 129-204 | 8 TODO comments for unimplemented rumor/oracle functions | Clean up or implement |

### 3.7 `js/monst.js` -- Seduction attack TODOs

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/monst.js` | 42-46 | TODO for seduction attack arrays `c_sa_yes[]` / `c_sa_no[]` | Clean up or implement |

### 3.8 `js/objnam.js` -- Fruit name TODO

| File | Line | Issue | Fix |
|---|---|---|---|
| `js/objnam.js` | 359 | `fruit_nam = 'slime mold'; // TODO: use configured pl_fruit option` | Wire up the fruit configuration |

### 3.9 `js/allmain.js` -- Several TODO stubs

| File | Lines | Issue | Fix |
|---|---|---|---|
| `js/allmain.js` | 461 | `// TODO: wire tele() when available` | Implement or remove if tele() is now wired |
| `js/allmain.js` | 465 | `// TODO: wire polyself() when available` | Same |
| `js/allmain.js` | 467 | `const nightBonus = 0; // TODO: night() not ported` | `night()` IS ported in `calendar.js` -- wire it up |
| `js/allmain.js` | 470 | `// TODO: wire you_were() when available` | Implement or remove |

### 3.10 `shell/shell.js` line 706 -- Dungeon/Menace text replacement

| File | Line | Issue | Fix |
|---|---|---|---|
| `shell/shell.js` | 706 | `line = line.replace('Welcome to Dungeon.', 'Welcome to the Mazes of Menace!');` | This is an in-game text replacement for the Zork/Dungeon game -- probably intentional and should keep |

### 3.11 Test files reference `menace-topten` key

| File | Lines | Issue | Fix |
|---|---|---|---|
| `test/unit/topten.test.js` | 345 | `assert.equal(TOPTEN_KEY, 'menace-topten');` | If key name changes, update test |
| `test/comparison/session_test_runner.js` | 431-432 | Hardcoded `'menace-topten'` | Same |

### 3.12 `test/comparison/comparator_policy.js` -- Royal Jelly regex patterns

| File | Lines | Issue | Fix |
|---|---|---|---|
| `test/comparison/comparator_policy.js` | 446 | Regex `NetHack Royal Jelly -- Welcome to the Mazes of Menace!` | Update to match new version string |
| `test/comparison/comparator_policy.js` | 476 | Comment `JS: "NetHack 3.7.0 Royal Jelly..."` | Update comment |
| `test/comparison/comparator_policy.js` | 640 | Comment `C old version output vs Royal Jelly version branding` | Update comment |
| `test/comparison/comparator_policy.js` | 650 | Regex `NetHack 3\.7\.0 Royal Jelly #[0-9]+` | Update to match new version string |

### 3.13 `test/comparison/message_display.test.js` -- Royal Jelly test fixture

| File | Line | Issue | Fix |
|---|---|---|---|
| `test/comparison/message_display.test.js` | 164 | Test string `'NetHack Royal Jelly -- Welcome to the Mazes of Menace!'` | Update when version string changes |

---

## 4. Summary by category

### BROKEN (2 groups, ~15 affected files)
1. **`js/replay_core.js` and `js/replay_compare.js`** -- imported by 10+ test/script files but deleted from repo. This breaks all session testing.
2. **`js/promo.js`** -- imported by `js/nethack.js` but does not exist. This breaks browser game startup.

### STALE (20 issues)
- V3 fallback code in `nethack.js` (dead per Decision 12)
- Stale file-name comment in `nethack.js` (says "menace.js")
- Stale `replay_core` reference in `input.js`
- `keylog.js` source identifier
- V3 comments in test comparison infrastructure (3 locations)
- Legacy/migration comments in `headless.js`, `player.js`, `animation.js`
- `async-context-map.json` contains 50+ references to deleted files
- `setup.sh` and `setup-testing.sh` branding
- `docs/DECISIONS.md` uses "WebHack"
- `package.json` name is "webhack"

### COSMETIC (13 issues)
- "Royal Jelly" in VERSION_STRING, index.html title/meta, console log
- "Mazes of Menace" in config, shell HTML, doc layout
- `menace-*` localStorage keys (leave as-is to avoid breaking saves)
- 40+ TODO/stub comments in glyphs.js, utf8map.js, botl.js, rumors.js, monst.js, objnam.js, allmain.js
- `allmain.js` line 467: `night()` IS ported but TODO says it isn't

---

## 5. Priority recommendations

1. **Immediate:** Create `js/replay_core.js` and `js/replay_compare.js` (or update all importers). Without these, the entire session test infrastructure is broken.
2. **Immediate:** Create `js/promo.js` (or remove the import from `nethack.js`). Without this, the browser game cannot start.
3. **High:** Update VERSION_STRING and `index.html` title to Teleport branding.
4. **High:** Remove V3 fallback code from `nethack.js` lines 168-184.
5. **Medium:** Update `package.json` name from "webhack" to "teleport".
6. **Medium:** Fix `allmain.js` line 467 -- `night()` is already ported in `calendar.js`, wire it.
7. **Medium:** Regenerate `scripts/async-context-map.json`.
8. **Low:** Clean up TODO stubs in `glyphs.js`, `utf8map.js`, `botl.js`, `rumors.js`.
9. **Low:** Update setup script banners and doc branding.
10. **Defer:** `menace-*` localStorage keys -- changing these requires a migration path for existing users.
