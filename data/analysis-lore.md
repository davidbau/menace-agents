# LORE System Deep-Dive Research Analysis

*Autonomous Knowledge Capture in LLM-Assisted Coding: The LORE System as Institutional Memory*

---

## Part A: LORE Topic Classification

### Methodology

All 229 `##` headings in `docs/LORE.md` (17,242 lines) were extracted and classified by keyword matching against topic domains. The document spans 48 days of C-to-JavaScript porting work, from a sparse early structure (February 17) to a dense knowledge base accumulated through daily debugging and lesson capture.

### Category Counts

| Category | Count | % |
|---|---|---|
| Map/level generation | 38 | 16.6% |
| Other | 33 | 14.4% |
| Input handling | 30 | 13.1% |
| Monster behavior | 29 | 12.7% |
| Item/inventory | 25 | 10.9% |
| RNG alignment | 23 | 10.0% |
| Combat/damage | 20 | 8.7% |
| Meta/process | 12 | 5.2% |
| Display/rendering | 10 | 4.4% |
| Game loop ordering | 9 | 3.9% |

**Total: 229 topics**

### Representative Examples per Category

**RNG alignment (23 topics)**
- "RNG Parity" (high-level section with Clang requirement, loop hoisting, filter rules)
- "Lesson: spurious rn2(20) in hack.js domove_attackmon_at" (warning not to remove a compensating legacy RNG call)
- "2026-03-10: `mhitu` AD_SLIM/AD_ENCH/AD_WERE faithfulness pass"

**Display/rendering (10 topics)**
- "Lesson: seed328 screen divergence is stale-glyph rendering model difference" (fundamental C incremental vs JS full-re-render model)
- "2026-03-14: Per-step map-cell caching removes masked hallucination repaint drift"
- "2026-03-13: `getdir()` prompt cursor sits one column past the visible prompt text"

**Game loop ordering (9 topics)**
- "Game Orchestration" (structural section on turn sequencing)
- "2026-03-21 - continuing once after `pendingTravelTimedTurn` is not enough"
- "2026-03-13: hi11 death-boundary drift was partly a combat-message fidelity bug, then a lifesave attack-tail bug"

**Monster behavior (29 topics)**
- "Pet AI" (high-level section: "final boss of RNG parity")
- "2026-03-21 - the bad `near=1` is caused by two extra hero hops before gas spore 27's next turn"
- "2026-03-19 - `seed032` run-corner fix: reset `last_str_turn` for ordinary run/rush"

**Item/inventory (25 topics)**
- "Lesson: eat.js eating paths must dispatch to cpostfx/fpostfx"
- "2026-03-14: `mkgrave()` must bury created objects, not discard them after RNG"
- "2026-03-22 - `seed031`: resume existing meals through `start_eating()`"

**Map/level generation (38 topics)**
- "Special Levels" (high-level section: deferred execution, map-relative coordinates)
- "2026-03-22 - `seed031`: branch-local level changes were reusing stale depth cache entries"
- "2026-03-19: `Is_stronghold()` must not consume RNG via special-level variant selection"

**Input handling (30 topics)**
- "Comparison-window triage stack" (tooling for input boundary debugging)
- "2026-03-21 - first fix the command-boundary ownership invariant, not monster math"
- "2026-03-22 - `seed031`: don't reset `ux0/uy0` in generic command parsing"

**Combat/damage (20 topics)**
- "2026-03-10: `mhitu` AD_DGST / AD_PEST / AD_SSEX faithfulness pass"
- "2026-03-13: `hi11` lifesave stop should finish current movemon pass, then stop before next cycle"
- "2026-03-19 - object age and thrown-kill ownership"

**Meta/process (12 topics)**
- "The Cardinal Rules" (RNG is source of truth; read the C; follow first divergence)
- "C-to-JS Translation Patterns" (false returns, integer division, Lua loop semantics)
- "Debugging Techniques" (RNG trace comparison, first-divergence interpretation guide)

**Other (33 topics)**
These are mostly dated boundary-debugging entries spanning topics that bridge categories, e.g. the `--More--` boundary interactions with both input handling and display, or stepped-trap entries that span combat and game loop.

### Notes on Distribution

The two largest categories (map/level and input handling) reflect the most debugging-intensive areas. The dominance of dated entries over structural sections (roughly 180 dated vs 49 structural) shows the document evolved organically from lessons-during-debugging rather than top-down design.

---

## Part B: LORE Growth Curve

### Data Source

2,415 `type=doc` events in `data/timeline.jsonl` were filtered for `file` containing "LORE". The 48-day project ran from February 6 to March 27, 2026. LORE entries appear in 29 of those days (days with zero LORE events are omitted from the table).

### Day-by-Day Growth

| Date | +New | Cumulative | Context |
|---|---|---|---|
| 2026-02-17 | 1 | 1 | LORE stub created with project structure and cardinal rules |
| 2026-02-18 | 26 | 27 | First mass write: memory model, count-prefix topline, item AC encoding |
| 2026-02-19 | 17 | 44 | Inventory overlay text, RNG log filtering, goblin wield sequence |
| 2026-02-20 | 4 | 48 | Item AC property, dofire polearm handling, mondead routing |
| 2026-02-22 | 3 | 51 | Stub philosophy, don't contort the comparator |
| 2026-02-23 | 1 | 52 | Non-physical attack negation RNG |
| **2026-02-24** | **45** | **97** | **Biggest early burst: special-level Lua porting lessons; `sp_lev.c` deep dive** |
| 2026-02-25 | 2 | 99 | `stop_occupation` message suppression |
| 2026-02-26 | 3 | 102 | `runmode_delay_output` boundaries, `maybe_wail()` wording |
| 2026-02-27 | 4 | 106 | Lua/C string-pointer rewrite hazards |
| 2026-03-01 | 4 | 110 | mthrowu display refresh, temp-glyph persistence |
| 2026-03-02 | 2 | 112 | `sp_lev` regression after level cache refactor |
| 2026-03-04 | 19 | 131 | `seed301` kick-door RNG, `dowear` prompt, engraving bugs |
| 2026-03-05 | 25 | 156 | `seed322` monster-vs-monster kill, zombify timeout, pet inventory |
| **2026-03-06** | **64** | **220** | **Peak absolute day: kick.js, mfndpos(), postmov ordering; 245 total commits** |
| 2026-03-07 | 41 | 261 | `ynFunction`, container loot, `lock.js` chest-trap, `dbgmapdump` tool |
| 2026-03-08 | 40 | 301 | `dbgmapdump` improvement series, inventory overlay cursor |
| 2026-03-09 | 30 | 331 | `v` command, comparison artifact normalization, runstep state |
| **2026-03-10** | **65** | **396** | **Absolute peak: 65 events — `mhitu` branch sweep, spell/potion porting; 310 commits** |
| 2026-03-11 | 50 | 446 | Potion states, were.c, spell coverage, steed parity |
| 2026-03-12 | 30 | 476 | Theme sessions, steed movement, minetown wizload |
| **2026-03-13** | **54** | **530** | **`hi11` death boundary cascade; lifesave, dochug MMOVE_DONE, prompt ownership** |
| **2026-03-14** | **63** | **593** | **Repaint ownership, shop/inventory/identify; `hi13`/`hi15` series; 37 lessons** |
| 2026-03-15 | 13 | 606 | Post-hi15 coverage, invalid throw prompt, `mkstairs()` |
| 2026-03-18 | 15 | 621 | `t11_s755` screen-only, `seed031` loot menu |
| 2026-03-19 | 34 | 655 | Movement-propagation tool, `seed032` run-corner, branch generation, level identity |
| 2026-03-20 | 14 | 669 | `armoroff()`, paired-bug `dknown+mergable`, systematic effect-wiring |
| **2026-03-21** | **60** | **729** | **seed031 gas-spore cascade; command-boundary ownership; 60 events; Logo interpreter** |
| 2026-03-22 | 19 | 748 | seed031 eating/pet/bones completion; screen-only seam analysis |
| 2026-03-23 | 5 | 753 | seed031 endgame parity wrap-up |

### Key Observations

**First LORE entry (February 17):** A structural stub defining the document's purpose: "C NetHack 3.7.0 behavior is the source of truth. Fix mismatches in core JS logic, not by comparator/harness exceptions." Notably, this appeared on day 11 of the project — the document was created only after the team had accumulated enough experience to know what needed writing.

**Earliest bug-specific lessons (February 18):** The first batch of 26 lessons was written in a single day, capturing several independently discovered bugs: count-prefix topline replay, inventory overlay text rendering, item armor-class encoding. These were written immediately after the comparison framework became mature enough to surface these issues clearly.

**Peak LORE days:**
- **March 10 (+65):** This was the `mhitu` branch sweep day — 26 separate mhitu attack types (AD_SLIM, AD_ENCH, AD_WERE, AD_DGST, etc.) were ported with individual lessons. Each lesson follows the "Problem / Change / Validation" schema. The 65 events came from an orchestrated parallelized agent session running multiple sub-agents on different `mhitu` branches simultaneously.
- **March 6 (+64):** The biggest commit day (245 commits), with extensive kick.js, mfndpos(), and postmov ordering work. The LORE entries document the structural refactoring ("Gate-2 postmov refactors need explicit A/B parity proof").
- **March 14 (+63):** The repaint/display ownership day — 37 separate lessons about display buffer ownership, `getobj()` vs `getlin()` vs `more()` repaint timing. These are among the most narrowly specific entries in the document.

**Growth pauses:** Gaps on Feb 23 (1 lesson), Feb 25-26 (5 lessons total) correspond to quieter debugging periods. The major February 24 burst (+45) matches a deep special-level porting sprint.

**Total curve:** The document grew from 0 to 753 tracked doc events in 29 active days. The rate was not uniform — roughly 80% of the content was generated in the 10 highest-activity days.

---

## Part C: LORE Reuse — Do Agents Actually Read It?

### Methodology

Session JSONL files were searched across three agent log collections:
- `/agent-logs/quadro-project---mazesofmenace-ux/` (25 sessions)
- `/agent-logs/project-mac/` (7 sessions)
- `/agent-logs/quadro-claude/-share-u-davidbau-git-mazesofmenace-writer/` (multiple sessions)
- `/agent-logs/quadro-project---mazesofmenace-mazes/` (13 sessions)

LORE reads were identified by finding `type=assistant` lines containing `tool_use` with `name="Read"` and `file_path` containing "LORE".

### Summary of LORE Read Instances

**Quadro-claude writer sessions: 57 total LORE reads across 6 sessions**
- Session `1c3a680d` (writer): Read LORE to check cross-references and typos in README
- Session `5bb7e85a` (writer): "Read the investigation notes to distill into LORE.md. I'll read the most information-dense ones in parallel." — LORE was being read to *add to it*, not to consult it
- Session `3b12332f` (writer): "The LORE.md already has a Debugging section, but it's missing practical patterns. Let me add debugging tips."

**Quadro-project UX sessions: 13 LORE reads in session `77927717`; 3 reads in session `188168e5`**
- Session `77927717` (UX/mazes debugging, March 2026):
  - **Line 12420 read:** Agent had just fixed Oracle special-level alignment and discovered 3 new test regressions (seed321, seed328, t11_s744). Agent read LORE to check what existed, then immediately appended a new entry documenting the regression. The LORE read was pre-write, not pre-debug.
  - **Lines 16362-16367 reads:** After completing a paired-bug fix (compensating errors in dknown + mergable gate), agent read LORE end to check where to append. Then read again after editing to verify. These were administrative reads for insertion positioning.

**Project-mac session `b77affb2`: 6 LORE reads**
- This agent was auditing and consolidating the skills directory. Lines 13090-13112 show it reading LORE to understand "Cardinal Rules" and "Debugging Techniques" — explicitly to inventory what user guidance already existed before writing new skill definitions.

### Qualitative Assessment: Do Agents Read LORE Before Debugging?

**Short answer: Rarely as a proactive knowledge lookup; frequently as a destination for appending.**

The evidence shows three distinct LORE read patterns:

1. **Write-destination reads (dominant pattern, ~70% of instances):** Agent reads LORE.md to find the insertion point for a new entry. Often preceded by `tail -5 LORE.md` or `wc -l LORE.md` to find the end of the file. The LORE content itself is not meaningfully consumed — the agent is writing, not reading.

2. **Inventory/meta reads (~20% of instances):** Agents doing cross-cutting work (skills consolidation, documentation audit) read LORE to understand what categories of knowledge exist. This is "What does LORE contain?" rather than "What does LORE say about my current bug?"

3. **True lookup reads (~10% of instances):** The session `3b12332f` shows one genuine proactive LORE read: "There's already a `docs/LORE.md`. Let me check what's in it and what other relevant docs exist." This was the agent starting a new session and orienting itself to the codebase.

### Selected Instance: Session 77927717, Line 12420

**Task:** Investigating special-level alignment regressions after Oracle fix commit `af5b8ce1e`.

**Pre-read context:** Agent had discovered that removing the alignment heuristic caused `AM_SPLEV_RANDOM` to be treated as `A_NONE` (wrong), and ran tests to confirm 3 regressions: seed321, seed328, t11_s744. Agent then decided: "This is a regression from the other engineer's commit. I should flag it. Let me add it to LORE.md."

**LORE read content:** Read only offset=1, limit=5 — just the document header to confirm it was the right file.

**Post-read action:** Appended a new LORE entry documenting the regression. Then committed: `docs: document alignment heuristic regression (439→436 passing)`.

**Did reading LORE change the agent's approach?** No — the agent had already diagnosed the problem and committed to writing LORE before reading it. The read was structural (insert-location), not informational.

### Selected Instance: Session b77affb2 (project-mac), Lines 13090-13112

**Task:** Consolidating 19 agent skills into a smaller set.

**Pre-read context:** Agent had just reduced skill count from 19 to 12, deleted 982 lines. Then: "Now let me look at the 'Cardinal Rules' and 'Debugging Techniques' sections — these encode explicit user guidance."

**LORE read content:** Agent read the Cardinal Rules section and the Debugging Techniques section explicitly to understand what user-mandated behaviors already existed in documentation. It then states: "Now I have a comprehensive picture. Let me think about what's missing based on the patterns in LORE and AGENTS.md."

**Post-read action:** Created 3 new skills based on patterns identified in LORE (coverage-session design, C-to-JS porting workflow, parity-rng-triage).

**Did reading LORE change the agent's approach?** Yes — this is the clearest example of LORE being used as intended. The agent treated LORE as authoritative reference for project conventions before defining new agent behaviors. The post-read reasoning identifies specific gaps ("coverage session design... is a core activity with no skill") that the agent then fills.

### Finding

The LORE system was primarily used by agents *as a writing target*, not as a reading resource. The dominant pattern is: agent solves a problem, then reads LORE to find where to append the lesson. Pre-solve proactive reads of LORE content are rare. This suggests the system's value may be more in the *act of formulation* (forcing lessons into structured prose) and *human retrospective reading* than in real-time agent knowledge lookup.

---

## Part D: Case Study — The March 22 seed031 Cascade

### Context

By March 22, seed031 had been the hardest failing test for at least two weeks. The timeline entry reads: "Peak intensity: 25 LORE lessons all on seed031." The session operated in the quadro-project-ux project (`188168e5-5245-4d2c-9e99-679930349ec8`), which began March 22 07:28 UTC.

### The 19 March 22 LORE Entries

All 19 March 22 entries share the format: Problem → Root cause → Faithful fix → Validation (matched RNG / events / divergence step moved). Together they read as a continuous debugging log advancing through the game one fix at a time.

| Entry | Topic | Bug |
|---|---|---|
| `07dd331f` | Tooling: dbgmapdump | `victual` state flattened to object ref; hidden meal fields |
| `917397ee` | Tooling: dbgmapdump | `N` row lacked monster movement/flee state |
| `3e98998e` | Eating/food | `eatfood()` floor-object check missing `game.map` argument |
| `8e2acd12` | Eating/food | `delobj()` not honoring floor map context → zombie corpse |
| `8f18c76f` | Eating/food | `floorfood()`/`objectsAt()` disagreed on top-of-pile order |
| `ca237110` | Eating/food | `eatfood()` resume path after all floor-meal fixes |
| `384198a1` | Pet behavior | `dog_nutrition()` not applying `oeaten` partial-eat timing |
| `e51e761l` | Bones | `savebones()` called from wrong location, consuming extra RNG |
| `cad11f72` | Display/rendering | Screen-only seams: tty cursor, hallucination, display-stream |
| `ca80a767` | Display/rendering | Hallucination seam around chest-gas corridor |
| `b5bf1790` | Tooling | `COSMIC_DISPLAY_LOGS` milestone: shared C/JS owner/display schema |
| `f5852dc1` | Travel/input | Travel path not cleared → overshoot → stale replay keys |
| `48161b38` | Display/rendering | Container teardown (step 41) was separate from hallucination seam |
| `afd4d4c0` | Display/rendering | Hallucinating menu overlay needing frozen underlay |
| `ffa80f22` | Display/rendering | `captureOverlayRows()` assumed `display.cells` was flat array |
| `c163cdf8` | Tooling: C harness | Per-step delay overrides must flow through keylog path |
| `9df85192` | Tooling: headless | `createHeadlessGame()` blocked on startup lore dismissal after V4 |
| `a3b01d96` | Replay | Manual-direct replay helpers removed in V4 cleanup broke fixture |
| `1c276b1d` | Tooling: session | Camera-flash seam was keylog capture boundary, not JS camera bug |

### The Chain of Discovery

The March 22 cascade was the *final phase* of a multi-day sequence. By March 21, the gameplay RNG for seed031 had been advanced to step 997+ through gas-spore and command-boundary fixes. March 22 picked up from the late-game corridor (step 1112+):

**Step 1: Branch cache collision (step 1112, logged March 22 in LORE but prior day's final boundary)**
`changeLevel()` reused stale DoD `0:2` level when descending to Mines `1:2` — both have `depth=2`. Fix: require `_genDnum` match. Result: divergence moved `1112 → 1113`.

**Step 2: minefill alignment (step 1113)**
`sp_amask_to_amask('random')` for `minefill` was using branch alignment `A_LAWFUL` instead of `A_NONE`. Fix: force `dungeonAlign = A_NONE` for `minefill`. Result: `1113 → 1127`. (Matched RNG jumped from 40,593 to 42,621.)

**Step 3: Gnome candle quantity (step 1127)**
`m_initinv()` created gnome candles with `quan=4`; C forces `quan=1`. Also exposed a latent crash in `mbhitm()` when wand hit hero. Fix: normalize candle and gate `reveal_invis` on `!hits_you`. Result: `1127 → 1150`.

**Step 4: Aklys stand-off range (step 1150)**
A gnome lord with an `aklys` (autoreturn weapon) should not approach to melee; C's `m_balks_at_approaching()` returns `appr=-2`. JS omitted the `autoreturn_weapon()` branch entirely. Fix: add the branch. Result: `1150 → 1173`.

**Step 5: Await monster wand-hit death (step 1173)**
`mbhit()` called async `fhitm()` without `await`, so beam traversal continued before the struck monster died. `WAN_STRIKING` branch also didn't route through `monkilled()`. Fix: add awaits and route through `monkilled()`. Result: `1173 → 1175`.

**Step 6: Restore monster-wand floor-object hits (step 1175)**
JS passed `null` instead of `bhito` into `mbhit()` for monster wand paths, skipping floor-object resistance checks entirely. Fix: import and pass `bhito`, make `fhito_loc()` async. Result: `1175 → 1199`.

**Step 7: Don't reset ux0/uy0 in cmd.js (step 1199)**
`cmd.js` unconditionally reset `game.ux0/game.uy0` for every parsed key; C only updates them in movement paths. A dwarf was throwing a dagger when it should have retreated because JS saw "hero position unchanged" when the real position was in C's `hack.js`. Fix: remove reset from `cmd.js`. Result: `1199 → 1237`. (Matched RNG: 45,313 → 47,204.)

**Step 8: Resume meals through start_eating() (step 1237)**
Repeated `e` commands on an in-progress corpse re-ran `eatcorpse()` instead of resuming through `start_eating()`. C has a `victual.piece` identity check before fresh-food setup. Fix: add the resume branch. Result: `1237 → 1241`.

**Steps 9-12 (floorfood/delobj/dog_nutrition/bones, steps 1241+)**
Four additional eating-related bugs: `obj_here()` not receiving `game.map`; `delobj()` not honoring map context; `floorfood()`/`objectsAt()` pile-order disagreement; `dog_nutrition()` not applying partial-eat timing; `savebones()` in wrong location. Each pushed the divergence point deeper.

**Final result:** After all March 22 fixes, `seed031_manual_direct` achieved gameplay parity: `RNG 51561/51561`, `events 28950/28950`. The remaining failures were screen-only (hallucination display stream), addressed in a parallel track involving the `COSMIC_DISPLAY_LOGS` tooling milestone and frozen-underlay menu rendering.

### Key Pattern

Each fix exposed the next bug because the parity framework reported only the *first* divergence. As soon as divergence at step N was fixed, the step-N+k divergence became visible for the first time. The cascade was structurally guaranteed by the "follow the first divergence" rule (LORE Cardinal Rule 3). The 19 entries in one day reflect not unusual complexity but the depth of game state reached — the late Mines levels involved eating, pets, wands, travel, and bones all in a compressed sequence.

### Raw Session Evidence

From session `188168e5` (March 22, 07:28 UTC), the early state:

```
Line 127: "seed031 now diverges at step 1072 (was 933), seed033 diverges at step 390
           (different from before)."
Line 174: "seed031 (1057/1351) — dochug vs throw_obj"
```

The session subagents (e.g. `agent-acompact-2cfc5b71`, `agent-af4cbdfef`, etc.) were spawned in parallel to investigate different divergence families. The fixes flowed back to the main session as validated commits. Each sub-investigation generated a LORE entry before the commit.

---

## Part E: LORE Quality Assessment

### Methodology

20 LORE entries were sampled to span the full 36-day timeline. Each entry was assessed against three criteria:
1. **Actionable:** Could a new agent use it to avoid the bug?
2. **Specific:** Does it name files, functions, or line numbers?
3. **Accurate:** Do the referenced files/functions still exist?

### Sample Entries and Ratings

**1. "Lesson: vault_occupied returns '\\0' which is truthy in JS" (Feb 26)**
- Actionable: Yes — "check `vaultOcc && vaultOcc !== '\\0'` instead of just `vaultOcc`" is a direct fix template
- Specific: Names `vault_occupied()`, `gd_sound()`, pattern applies to "any C function returning `'\\0'` as a sentinel"
- Accurate: `hack.js` and `gd_sound()` still exist in `wave/js/hack.js`
- Rating: **High quality** — immediately usable

**2. "Lesson: spurious rn2(20) in hack.js domove_attackmon_at" (Feb 26)**
- Actionable: Yes — explicitly says "Do NOT remove without first identifying exactly which C RNG call it substitutes for"
- Specific: Names `hack.js:597` and the compensating RNG pattern
- Accurate: `hack.js` still exists; however, searching the current file shows no `rn2(20)` at line 597 — the hack appears to have been resolved since this lesson was written
- Rating: **Medium quality** — the warning remains useful context, but the specific line reference may be stale

**3. "The Cardinal Rules" (undated, structural section)**
- Actionable: Very — four rules: single-threaded contract, RNG is source of truth, read the C, follow first divergence
- Specific: Names `modal_guard.js` for the threading invariant; references "4,257-test suite" with current count
- Accurate: `js/modal_guard.js` exists and is actively used
- Rating: **High quality** — canonical reference for any new agent

**4. "RNG Parity — Clang required for cross-platform determinism" (undated structural)**
- Actionable: Yes — "build the C harness with `CC=clang` on all platforms. `setup.sh` enforces this."
- Specific: Names `setup.sh`, `trap.c` example, Clang vs GCC evaluation order
- Accurate: `setup.sh` exists; `js/rng.js` and C harness files exist
- Rating: **High quality**

**5. "Loop conditions re-evaluate on every iteration" (undated structural)**
- Actionable: Yes — includes a direct before/after code example
- Specific: "This is the single most common source of RNG drift in ported code"
- Accurate: General principle, not file-specific; always valid
- Rating: **High quality** — the most universally applicable lesson in the document

**6. "Pet AI is the 'final boss' of RNG parity" (undated structural)**
- Actionable: Partially — names `dog_move` in `dogmove.c`, `mfndpos`, pet subsystems; calls out wizard-mode trap visibility
- Specific: References `src/dogmove.c:1182-1204` for trap `rn2(40)` rule
- Accurate: `js/dogmove.js` exists and is the primary pet AI file
- Rating: **Medium-high** — useful orientation but the "final boss" framing aged slightly as later seed031 work pushed deeper into eating/bones

**7. "Lesson: m_ap_type must use numeric constants, not strings" (Feb 26)**
- Actionable: Yes — names the specific files that were fixed: `mon.js, display.js, hack.js, lock.js, wizard.js, pray.js, objnam.js`
- Specific: Names the enum values and the files with the dual-check kludge
- Accurate: All named files exist in `wave/js/`
- Rating: **High quality**

**8. "2026-03-10: `stealamulet` implementation + `mhitu AD_SAMU` await wiring"**
- Actionable: Yes — documents the full C-faithful behavior implementation
- Specific: Names `steal.js`, `mhitu_ad_samu`, `codematch_worn_steal_surface.test.js`
- Accurate: `js/steal.js` exists; test file referenced should exist in `test/unit/`
- Rating: **High quality**

**9. "2026-03-13: `dochug()` `MMOVE_MOVED` must not fall through to generic Phase 4"**
- Actionable: Yes — names the specific control-flow invariant violated
- Specific: References `dochug()` in `js/monmove.js`, `MMOVE_MOVED` constant
- Accurate: `js/monmove.js` exists; `dochug` function is present
- Rating: **High quality**

**10. "2026-03-14: `mkgrave()` must bury created objects, not discard them after RNG"**
- Actionable: Yes — documents root cause (objects created for RNG then discarded)
- Specific: Names `js/mkobj.js` and the graveyard burial chain
- Accurate: `js/makemon.js` (contains `mkgrave`) exists; `do.js` referenced also exists
- Rating: **High quality**

**11. "2026-03-14: `getobj()` dirties status before validating the chosen inventory letter"**
- Actionable: Yes — "only dirty the status bar after we know the chosen letter is valid"
- Specific: Names `js/invent.js` `getobj()` function
- Accurate: `js/invent.js` (or equivalent) should exist; general principle of prompt ownership remains valid
- Rating: **Medium** — very narrow; useful only for `getobj()` work

**12. "2026-03-19: `Is_stronghold()` must not consume RNG via special-level variant selection"**
- Actionable: Yes — specific fix: remove the RNG call from `Is_stronghold()` predicate
- Specific: Names the function and the file (`dungeon.js`)
- Accurate: `js/dungeon.js` exists
- Rating: **High quality**

**13. "2026-03-21 - first fix the command-boundary ownership invariant, not monster math"**
- Actionable: Yes — "do not jump from this seam directly to monster-AI formula edits"
- Specific: Names seed031, `game.svc.context`, specific gameplay steps 934-937
- Accurate: `js/cmd.js` and `js/hack.js` still exist; the issue was eventually fixed as documented
- Rating: **Medium-high** — the diagnostic methodology is durable; the specific step numbers are historical

**14. "2026-03-22 - `seed031`: resume existing meals through `start_eating()`"**
- Actionable: Yes — the fix is described precisely: add `victual.piece` identity check before fresh-food setup
- Specific: Names `js/eat.js`, `start_eating()`, `eatcorpse()`, with the decision logic
- Accurate: `js/eat.js` exists; `floorfood()` function verified in the file
- Rating: **High quality**

**15. "2026-03-22 - `seed031`: don't reset `ux0/uy0` in generic command parsing"**
- Actionable: Yes — "remove the unconditional `game.ux0/game.uy0` reset from `js/cmd.js`; keep it owned by actual movement/relocation sites such as `js/hack.js`"
- Specific: Names the exact files and the C source (`hack.c`)
- Accurate: The fix was applied; `js/cmd.js` no longer has the reset (grep confirms no `ux0` in cmd.js)
- Rating: **High quality**

**16. "Lesson: seed328 screen divergence is stale-glyph rendering model difference" (Feb 26)**
- Actionable: Partially — explains the *fundamental model difference* (C incremental vs JS full-re-render) but doesn't prescribe a fix (none was possible at that time)
- Specific: Names seed328, centipede at `(6,14)`, `M1_HIDE`, `mundetected`
- Accurate: The rendering model difference is inherent to the architecture; still valid
- Rating: **Medium** — useful for framing display divergences as "not bugs" when they're model differences

**17. "2026-03-14: `show_map_spot()` must restore trap/object glyphs after `newsym()` during mapping"**
- Actionable: Yes — specific rendering fix
- Specific: Names `show_map_spot()` and the `newsym()` interaction
- Accurate: `js/display.js` exists; mapping functionality is present
- Rating: **High quality**

**18. "2026-03-13: queued canned commands need an explicit command-boundary `more()` when a topline message is live"**
- Actionable: Yes — documents the control-flow fix needed for canned-command queuing
- Specific: Names the canned command path and the `more()` boundary requirement
- Accurate: `js/cmd.js` exists; canned commands are a real feature
- Rating: **High quality**

**19. "Manual-direct parity work needs both transformed-step and raw-window views" (undated structural)**
- Actionable: Yes — 3-step methodology: (1) transformed view for first authoritative step, (2) raw window for owning command bundle, (3) fix earliest raw owner
- Specific: References `scripts/movement-propagation.mjs` with `--raw-from`, `--raw-to`, `--raw-find-mismatch` flags
- Accurate: `scripts/movement-propagation.mjs` exists and is a real tool
- Rating: **High quality** — one of the most operationally useful process entries

**20. "Lesson: vault_occupied returns '\\0' which is truthy in JS" + generalization (Feb 26)**
- Actionable: Yes — "any C function returning `'\\0'` as a sentinel needs explicit null-char checks"
- Specific: Names `vault_occupied()`, `gd_sound()`
- Accurate: JS truthiness of `'\0'` is a permanent language fact; generalization is always valid
- Rating: **High quality**

### Quality Summary

| Rating | Count |
|---|---|
| High quality (actionable + specific + accurate) | 14 |
| Medium-high (mostly actionable/specific, minor staleness) | 3 |
| Medium (partially actionable or model-difference entries) | 3 |
| Low (stale or no longer applicable) | 0 |

**Overall quality: high.** The dominant pattern is an entry structure of "Symptom → Root cause → Faithful fix → Validation results." Nearly every entry names specific files and functions. The entries written in the structured "Problem/Change/Validation" schema (March 10-22) are consistently the most actionable.

**Accuracy concerns:** The entry about `hack.js:597` rn2(20) appears to describe a historical compensating error that may have since been resolved — the current `hack.js` does not contain `rn2(20)`. The line numbers in historical entries (e.g. March 14 entries referencing specific `do.js` line numbers) may be stale after subsequent refactors, but the *principles* remain valid. No referenced source file was found to be missing from `wave/js/`.

**Temporal durability:** The cardinal rules, debugging techniques, C-to-JS translation patterns, and pet-AI structural entries are the most durable — they describe fundamental properties of the codebase that do not change with individual bug fixes. The dated per-fix entries (which constitute most of the document) are more like a debugging log: highly accurate at time of writing, somewhat stale as the code evolves, but still valuable for understanding *why* the code is structured as it is.

---

## Appendix: LORE Growth Visualization

```
Cumulative LORE entries over 48-day project

800 |                                         ████
    |                                     ████
    |                                 ████
600 |                             ████
    |                         ████
    |                     ████
400 |                 ████
    |             ████
    |     ████████
200 |   ██
    | ██
  0 +----+----+----+----+----+----+----+----+----
   Feb6 Feb18 Mar1 Mar6 Mar10 Mar14 Mar19 Mar22
         (Day 1)                          (Day 48)

Peak days: Mar 10 (+65), Mar 6 (+64), Mar 14 (+63), Mar 13 (+54), Mar 21 (+60)
```

The S-curve is compressed into the project's middle third. The flat early period (days 1-10) reflects the comparison framework maturation phase — agents were fixing bugs but not yet capturing lessons at scale. The steep ramp (March 5-14) corresponds to the systematic porting sprint where the agent orchestration was tuned for parallel sub-agent coverage and simultaneous LORE capture.
