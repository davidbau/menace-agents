# Strategic Lessons from LORE.md for the Teleport Port

Distilled from 17,242 lines of LORE.md, analysis-porting-lessons.md,
analysis-strategy-effectiveness.md, and the current Teleport DECISIONS.md
and PROJECT_PLAN.md. Focused on architectural and strategic knowledge that
prevents weeks of wasted work -- not individual bug fixes.

---

## Part 1: The 10 Most Important Lessons Not Yet in the Plan

### Lesson 1: The replay/comparison system must never drive game execution

**Source:** LORE "Separate game orchestration from comparison", Strategy 13
(replay_core simplification), multiple entries about replay_core growing to
~1700 lines.

**The lesson:** The old port's `replay_core.js` grew to 1700 lines because
it tried to produce RNG logs in step-sized chunks matching C's screen-frame
boundaries. Three independent implementations (browser, headless, replay)
each drove post-rhack orchestration independently. When comparison logic
drives execution, you cannot distinguish game bugs from harness bugs.

**What the plan should say:** "There is exactly one `run_command()` function
in `allmain.js`, used by both browser and test harness. The test harness
feeds keys and collects output post-hoc. RNG comparison is flat-stream
post-hoc alignment, not loop-control. `replay_core` should never exceed
~200 lines. If it grows past 300, something is architecturally wrong."

**Current plan gap:** The plan mentions "C harness" and "PES report" but
does not specify that game execution must be identical in browser and test
modes with zero comparison-driven code paths.

---

### Lesson 2: Event parity is as important as RNG parity -- build it from day 1

**Source:** LORE "Meta-lesson: event parity is a high-value bug finder",
"Meta-lesson: event parity can unlock PRNG parity", multiple entries about
`^place`, `^die`, `^pickup` events exposing bugs RNG alone cannot.

**The lesson:** Full RNG parity can hide real behavioral gaps. A vault gold
stub that consumes the right RNG but never creates the gold object passes
RNG checks but produces no `^place` events. Monsters then cannot path
toward gold that does not exist. Pet AI diverges. The failure manifests in
`dog_move`, but the root cause is in `mklev`. Event-stream mismatches
expose these invisible state transitions.

**What the plan should say:** "From Day 1, every bottleneck function
(`mondead`, `mpickobj`, `mdrop_obj`, `place_object`, `maketrap`, `deltrap`,
`make_engr_at`) logs a `^`-prefixed event into the RNG stream. The PES
report has three channels: PRNG, Events, Screen. Event mismatches are
first-class bugs, not informational noise."

**Current plan gap:** The plan mentions PES reporting but does not specify
the event instrumentation architecture or which bottleneck functions need
event logging.

---

### Lesson 3: Stubs that consume RNG without creating objects are worse than no-ops

**Source:** LORE "Port large-scale logic before entering bug burndown",
"Missing objects cascade", Strategy 12 ("No Fake Implementations"),
Strategy 4 (CODEMATCH partial failure).

**The lesson:** 68% of failing sessions (13 of 19 analyzed) traced back to
level generation stubs that consumed RNG without creating game objects.
Each stub created invisible state drift: missing floor objects changed
monster pathing, pet food evaluation, trap avoidance decisions, and
downstream RNG for every subsequent turn. Agents repeatedly produced
"close enough" stubs that consumed the right random numbers but skipped
actual effects, creating compounding debugging pain.

**What the plan should say:** "There are exactly two acceptable states for a
function: (1) fully ported with real effects, or (2) not ported at all with
a clear TODO marker. There is no third state where a function consumes RNG
but skips the actual game effect. If you have read the C code and written
the RNG calls, finish the function -- wire the messages, create the objects,
apply the effects. A function named after its C counterpart must do what the
C counterpart does."

**Current plan gap:** The plan says "No fake implementations" but does not
explain WHY stubs are specifically worse than missing functions, or the
compounding-debt mechanism.

---

### Lesson 4: The `--More--` boundary is a true blocking synchronization point

**Source:** LORE "Stair transition --More-- lesson: C DOES block",
"Trapdoor --More-- must defer post-turn processing to dismissal key",
multiple entries about prompt-owned turn advancement.

**The lesson:** `--More--` in C is not a display hint. It is a true blocking
call to `wgetch()` that suspends ALL game processing. When a `--More--`
appears during a stair transition, monster throw, or combat sequence, the
game state freezes until the player presses space. If JS treats `--More--`
as non-blocking or cosmetic, the space key that C consumed as dismissal
reaches the command parser in JS, producing `"Unknown command ' '."` and
desyncing all subsequent steps. This applies to EVERY `--More--` in the
game, including those inside `pline()` overflow, death sequences, and
mid-combat messaging.

**What the plan should say:** "`more()` calls `nhgetch()` and blocks. The
dismissal key is consumed by `more()`, not by the command parser. Only
space/enter/esc dismiss `--More--` (matching C's `xwaitforspace` semantics).
Non-dismissal keys keep the current `--More--` frame visible. This is not
optional polish -- it is a synchronization invariant."

**Current plan gap:** The plan mentions `--More--` handling but does not
specify the blocking semantics or dismissal key set.

---

### Lesson 5: Centralize bottleneck functions exactly as C does

**Source:** LORE "Mirror C's bottleneck architecture, don't scatter logic",
"Death drops use placeFloorObject, not mdrop_obj".

**The lesson:** C routes ALL monster deaths through `mondead()`, all pickups
through `mpickobj()`, all drops through `mdrop_obj()`. The old JS port
scattered this logic across 10+ call sites with inconsistent behavior --
some logged events, some dropped inventory, some did neither. Additionally,
death inventory drops use `place_object()` directly (producing `^place`
events), NOT `mdrop_obj()` (which produces `^drop` events). Getting this
wrong creates false event divergences that waste debugging time.

**What the plan should say:** "Port the bottleneck functions first:
`mondead`, `mpickobj`, `mdrop_obj`, `place_object`, `obj_extract_self`,
`mkcorpstat`, `maketrap`, `deltrap`, `make_engr_at`, `del_engr`. All game
code flows through these. Never inline bottleneck logic at call sites."

**Current plan gap:** Not mentioned.

---

### Lesson 6: Vision system pointer tables are a correctness minefield

**Source:** LORE "Vision pointer-table parity fix removes replay live-lock
hotspot" -- `fill_point()`/`dig_point()` had multiple C-port mismatches
causing corrupted row pointer tables and pathological LOS scanning cost
(infinite loop / timeout with 0 comparable metrics).

**The lesson:** The vision system (`vision.c`) maintains left/right pointer
tables for each row that track which cells are visible. `fill_point()` and
`dig_point()` update these tables when terrain changes. A wrong left/right
pointer target in any branch corrupts the tables, causing `view_from()`
recursion to enter pathological scanning patterns that appear as timeouts
or infinite loops. This bug manifested only when pet AI called
`do_clear_area()`, making it seem like a pet AI problem when it was really
a vision system problem. The fix required branch-by-branch realignment
with `nethack-c/patched/src/vision.c`.

**What the plan should say:** "Port `vision.c` with extreme care.
`fill_point()` and `dig_point()` must match C branch-by-branch. Test with
CPU profiling: if `vision.js` ever dominates self-time, the pointer tables
are corrupted. The symptom will appear as a pet AI or monster movement
timeout, not as a vision bug."

**Current plan gap:** The plan mentions "Algorithm C raycasting (full, not
simplified)" but does not warn about the pointer table maintenance trap.

---

### Lesson 7: Calendar-dependent behavior must be deterministic from day 1

**Source:** LORE "Repro harness datetime should be explicit and selectable",
"Browser keylogs now preserve deterministic datetime", "Recorder datetime
parity guard for Luck-sensitive replays".

**The lesson:** NetHack's behavior depends on the current date: `phase_of_the_moon()`
affects Luck, `friday_13th()` affects Luck, and these shift `rnl()` calls
throughout gameplay. If the replay harness does not pin the datetime, the
same seed produces different games on different days. This caused recurring
"mystery divergences" that disappeared when re-run the same day. The fix
required pinning datetime at session recording time AND preserving it through
browser keylog recording and replay.

**What the plan should say:** "Every session records a `datetime` field.
Replay always uses the session datetime, never the current wall clock.
The browser pins datetime at game init via URL parameter `?datetime=`.
`getnow()` in JS returns the pinned time. This is a day-1 requirement,
not a polish item."

**Current plan gap:** Not mentioned in the plan or DECISIONS.md.

---

### Lesson 8: C argument evaluation order is implementation-defined and affects RNG

**Source:** LORE "Clang required for cross-platform determinism",
"Wizard-session Medusa drift: somex/somey eval order mattered".

**The lesson:** C does not specify function argument evaluation order. GCC
evaluates right-to-left, Clang evaluates left-to-right. When two RNG calls
appear as arguments to the same function (`somex(croom), somey(croom)`),
the evaluation order determines which RNG call happens first. The old port
had Medusa divergences because JS evaluated `somey` before `somex` while
the C harness (built with Clang) evaluated `somex` first. The fix: always
pre-evaluate RNG-containing arguments into temporaries in left-to-right
order matching Clang, and always build the C harness with Clang.

**What the plan should say:** "When porting any C function call with multiple
RNG-consuming arguments, extract each argument into a temporary variable in
left-to-right order. This includes: `set_wounded_legs(rn2(2)?, rn1(10,10))`,
`somex(croom), somey(croom)`, and any similar pattern. Build C harness with
`CC=clang` only."

**Current plan gap:** The plan mentions "Integer arithmetic" as a known hard
area but does not mention argument evaluation order.

---

### Lesson 9: The `owornmask` invariant must be maintained from startup

**Source:** LORE "Keep magic_negation inventory-only; fix owornmask state
instead" -- startup equipment paths set player slot pointers without
synchronizing `owornmask`, causing `magic_negation()` to produce wrong
values.

**The lesson:** C's `magic_negation()` reads protection values from
inventory items via `owornmask`. If startup equipment code sets slot
pointers (e.g., `player.uwep = sword`) without also setting
`sword.owornmask |= W_WEP`, then `magic_negation()` sees the item as
unworn and returns 0. This produced a phantom `rn2(20)` in elemental
attack paths that cascaded through all subsequent combat. The same class
of bug appears whenever any equip/unequip path modifies slot pointers
without updating `owornmask`.

**What the plan should say:** "Every function that sets an equipment slot
pointer must also set the corresponding `owornmask` bit. Every function
that clears a slot must clear the bit. This includes `u_init` startup
equipment, `do_wear`, `do_takeoff`, `doswapwep`, and `dowield`. Test by
verifying `magic_negation()` produces the same value as C after startup."

**Current plan gap:** Not mentioned.

---

### Lesson 10: The deferred_goto / level transition ordering is exact

**Source:** LORE "Trapdoor fall parity depends on immediate deferred_goto
ordering", "seed033 upstairs return must prefer actual stairway arrival
over dndest", "seed033 tutorial exit must restore cached main level".

**The lesson:** Level transitions in C follow an exact sequence:
(1) trap/stair triggers `schedule_goto()` setting `u.utotype`, (2) control
returns to `moveloop_core()`, (3) `deferred_goto()` executes BEFORE monster
movement (Phase B) on the NEXT iteration, (4) `goto_level()` does the
actual transition including `docrt()` which triggers `--More--`. If JS
runs `deferred_goto()` at a different point (e.g., after monster movement,
or immediately inside the trap handler), all subsequent RNG diverges
because monster turns happen on the wrong level. Additionally, arrival
position selection has a strict priority: real stair coordinates before
`dndest`/`updest` fallbacks.

**What the plan should say:** "Level transitions use `schedule_goto()` to
set intent, then `deferred_goto()` at the top of the next `moveloop_core()`
iteration processes the transition. Never process level transitions inside
trap handlers or command handlers. Arrival position priority: `dnstair` /
`upstair` coordinates first, `dndest` / `updest` only as fallback."

**Current plan gap:** The plan mentions "Game loop ordering" but does not
detail level transition timing.

---

## Part 2: Dependency Graph of Subsystems

Based on LORE entries about what blocks what, here is the porting dependency
graph. An arrow `A -> B` means "A must be ported before B can be verified."

```
ISAAC64 RNG (js/rng.js)
    |
    v
Constants + Data Tables (const.js, monsters.js, objects.js)
    |
    v
Global State Structure (gstate.js, decl.c equivalent)
    |
    +---> o_init.c (object class shuffling, 198 RNG calls)
    |         |
    |         v
    +---> dungeon.c (dungeon tree init, branch topology)
    |         |
    |         v
    +---> u_init.c (character creation, initial equipment)
    |         |     -- depends on owornmask discipline (Lesson 9)
    |         |     -- depends on STR18 encoding (LORE: STR18(100)=118)
    |         v
    +---> mklev.c (makelevel, rooms, corridors)
    |     |   -- depends on rect.c (rectangle allocator)
    |     |   -- depends on mkroom.c (room filling)
    |     |   -- depends on mkmap.c (cave-style levels)
    |     |   -- depends on mkobj.c (object creation)
    |     |   -- depends on makemon.c (monster creation)
    |     |   -- depends on engrave.c (headstone engravings)
    |     |   -- ALL must create real objects, not stubs (Lesson 3)
    |     |
    |     v
    +---> sp_lev.c (special levels) [HARD]
    |     |   -- must create objects immediately, defer placement (LORE)
    |     |   -- des.map() coordinates are relative to map origin
    |     |   -- wallification must run twice around transforms
    |     |   -- full finalization pipeline mandatory (mineralize etc.)
    |     |   -- depends on ~141 level files (mechanical conversion)
    |     |
    |     v
    +---> display.c (newsym, incremental rendering) [HARD]
    |     |   -- remembered glyphs for unseen cells (Lesson: never
    |     |      synthesize from live state for out-of-sight)
    |     |   -- separate display RNG from gameplay RNG
    |     |   -- wall_info / set_wall_state for wall glyph selection
    |     |   -- bogusmon byte-offset selection for hallucination
    |     |
    |     v
    +---> vision.c (Algorithm C raycasting) [HARD]
    |     |   -- fill_point/dig_point pointer tables (Lesson 6)
    |     |   -- gas-cloud LOS blocking
    |     |
    |     v
    +---> allmain.c (moveloop_core, game loop) [CRITICAL]
    |     |   -- Phase A: bookkeeping (deferred_goto!, settrack, moves++)
    |     |   -- Phase B: monsters (movemon, gated by context.move)
    |     |   -- Phase C: display (newsym, flush_screen)
    |     |   -- Phase D/E/F: player input (rhack)
    |     |   -- Phase G: cleanup (turn-end bookkeeping)
    |     |   -- context.move starts at 0, Phase B skips on turn 0
    |     |   -- deferred_goto BEFORE Phase B (Lesson 10)
    |     |
    |     v
    +---> cmd.c (rhack, command dispatch)
    |     |   -- depends on input.js (nhgetch, promise queue)
    |     |   -- depends on modal_guard.js + sync_assert.js
    |     |
    |     v
    +---> hack.c (domove, movement)
    |     |   -- visible-hostile run stop gate
    |     |   -- spoteffects ordering (pits before pickup, else after)
    |     |   -- depends on trap.c (dotrap for stepped traps)
    |     |
    |     v
    +---> monmove.c (m_move, dochug, monster AI)
    |     |   -- depends on postmov() for redraw sequencing
    |     |   -- hider restrap before dochug (pre-dochug gate)
    |     |   -- AT_WEAP wield turn before movement
    |     |   -- MMOVE_* status codes through m_move/dochug
    |     |   -- depends on m_search_items (full intent gates)
    |     |
    |     v
    +---> dogmove.c (dog_move, pet AI) [FINAL BOSS]
    |         -- most RNG-sensitive subsystem
    |         -- wizard mode makes all traps visible (changes tseen)
    |         -- mfndpos candidate evaluation order
    |         -- trap avoidance: rn2(40) gated on trap.tseen
    |         -- food evaluation (corpse age depends on move count)
    |         -- pet melee multi-attack RNG ordering
    |         -- flee state resets mtrack history
    |         -- depends on EVERYTHING above being correct
    |
    +---> uhitm.c / mhitu.c / mhitm.c (combat)
    |         -- mattacku negation RNG (rn2(10) even when no effect)
    |         -- knockback RNG (rn2(3) + rn2(6) unconditional)
    |         -- passive erosion messaging/timing
    |         -- wielded launcher melee uses ranged damage
    |
    +---> save.c / restore.c / bones.c (serialization)
    |         -- depends on all state structures being complete
    |         -- waterlevel save/restore needs full bubble state
    |         -- level identity must survive round-trip
    |
    +---> end.c (death sequence)
              -- "You die..." forces more() before prompt concatenation
              -- wizard death flow routes through done_in_by
              -- disclose prompt in same key cycle
```

### What the current plan gets wrong

1. **Day 2 puts display AFTER special levels.** Display (`newsym`,
   remembered glyphs) should be ported alongside or before special levels,
   because special level verification requires seeing the map correctly.
   The dependency is bidirectional -- sp_lev needs display for validation,
   display needs sp_lev for test data.

2. **Day 3 puts combat before monster movement.** In LORE, combat cannot be
   verified until monster movement is correct, because combat RNG is
   consumed inside monster turns. The plan should port `monmove.c` alongside
   combat, not after it.

3. **Day 4 treats pet AI as one afternoon's work.** Pet AI took the old port
   WEEKS and was the dominant debugging target. The plan should allocate a
   full day to pet AI alone, after everything else is verified.

4. **Save/restore is scheduled for Day 5 afternoon.** Save/restore depends
   on every state structure being complete. It should be Day 6 or later,
   after all game systems are verified working.

---

## Part 3: Specific Architectural Warnings

### Game Loop Structure (exact phase sequence)

Based on LORE "Game Loop Phase Ordering", "moveloop turn-end bookkeeping",
"coupled A/B parity fix pattern", and the GAME_LOOP_REORDER_PLAN:

```
moveloop_core() {
  // Phase A: Bookkeeping
  if (deferred_goto_pending) {
    deferred_goto();    // BEFORE monsters, BEFORE player
  }
  // ... other bookkeeping (lycanthrope checks, timeout processing)

  // Phase B: Monsters (gated by context.move)
  if (context.move) {
    movemon();          // single-pass, returns somebody_can_move
    // outer loop continues based on u.umovement and monscanmove
  }

  // Phase C: Display
  // newsym, flush_screen, status line refresh

  // Phase D: Player Input
  await rhack(await nhgetch());

  // Phase E/F: Post-command processing
  // run_command handles occupation continuation, multi-repeat

  // Phase G: Turn-end
  // mcalcdistress, mcalcmove, spawn
  // u_calc_moveamt
  // settrack
  // moves++ (in THIS order, not earlier)
  // dosounds, gethungry, exerchk (only when no occupation)
}
```

Critical details:
- `context.move` starts at 0, so Phase B skips on turn 0
- `movemon()` is single-pass, returns `somebody_can_move`; the outer loop
  handles the `u.umovement` / `monscanmove` re-entry
- `deferred_goto()` runs at the TOP, before anything else
- Turn-end dosounds/gethungry/exerchk only fire when `occupation === null`
- Do NOT use deferral flags or synthetic continuation tokens

### Input Handling (nhgetch -> modal stack)

Based on LORE Cardinal Rule 0, DECISIONS 1/14/16/17:

```
6 Origin Primitives (all async suspension flows through these):
  nhgetch()           -- player keystroke
  nh_delay_output()   -- animation delay
  display_sync()      -- browser paint yield (setTimeout(0))
  nhimport()          -- dynamic module import
  nhfetch()           -- HTTP fetch
  nhload()            -- file load

Modal Guard (js/modal_guard.js):
  - throws if game code fires during an active modal wait
  - active modals: --More--, yn_function, getlin, getdir, menu

Sync Assert (js/sync_assert.js):
  - throws if a synchronous context yields
  - synchronous contexts: level generation, save/restore

--More-- semantics:
  - more() calls nhgetch() and blocks
  - dismissal keys: space, enter, esc (matching xwaitforspace)
  - non-dismissal keys keep the --More-- frame visible
  - "You die..." forces more() before prompt concatenation
```

### Display Pipeline (newsym -> map rendering -> status -> messages)

Based on LORE "unseen map memory parity", "Off-FOV map rendering must not
synthesize trap glyphs", "Display RNG divergence needs caller-tagged
diagnostics", "remembered object glyphs need remembered colors":

```
newsym(x, y):
  if cell is in sight:
    compute glyph from live state (monster > object > trap > terrain)
    update remembered glyph: loc.mem_terrain, loc.mem_obj, loc.mem_trap
    update remembered color
  else (out of sight):
    use REMEMBERED glyph/color, not live state
    NEVER synthesize from live trap.tseen or live terrain
    NEVER query live monster/object state for unseen cells

Display RNG:
  - hallucination names use a SEPARATE display RNG context
  - bogusmon selection is byte-offset based (rn2(7320)), not uniform
  - display RNG divergence is invisible in gameplay RNG logs
  - use caller-tagged diagnostics (RNG_LOG_DISP_CALLERS=1) to debug

Status line:
  - bot() / flush_screen timing is context-dependent
  - HP display at --More-- boundaries can show pre- or post-damage
    depending on the SPECIFIC sequence of pline/flush_screen/bot calls
  - do not unconditionally refresh status at every --More--

TTY coordinate mapping:
  - map cell x renders at terminal column x-1
  - 1-based map coordinates, 0-based terminal columns
```

### Level Generation (makelevel -> sp_lev -> room filling -> placement)

Based on LORE "Deferred execution: create immediately, place later",
"Map-relative coordinates after des.map()", "The full finalization pipeline
is mandatory", "Wallification must run twice around transforms":

```
C execution order for special levels:
  1. Parse level script, create rooms     (RNG: room geometry)
  2. Create objects/monsters IMMEDIATELY   (RNG: identity, properties)
  3. Generate corridors                    (RNG: corridor layout)
  4. Place deferred objects/monsters       (no RNG)
  5. Finalize: fill_ordinary_room for OROOM, wallify, bound_digging,
     mineralize

If JS defers BOTH creation AND placement to after corridors,
the RNG shifts by thousands of calls.

After des.map() at origin (xstart, ystart), ALL subsequent coordinates
are MAP-RELATIVE. des.door(8, 3) means absolute (xstart+8, ystart+3).

Wallification runs TWICE:
  1. wallify() before geometric transforms (flip, rotate)
  2. fix_wall_spines() after transforms
Omitting the second pass corrupts wall corner types.

Finalization pipeline (ALL steps required, even for special levels):
  - deferred placement
  - fill_ordinary_room() for OROOM types
  - wallification (twice around transforms)
  - bound_digging()
  - mineralize()   -- omitting this alone causes ~922 missing RNG calls
```

### Object System (mkobj -> o_init -> identification -> naming)

Based on LORE "object age and thrown-kill ownership", "lspo_object
special-obj spe handling", "Armor AC comes from objectData[otyp].oc1":

```
Object creation invariants:
  - obj.age = current move count (not hardcoded 1)
    Affects corpse freshness and pet food classification
  - context.ident starts at 2, consumed by next_ident() in order
  - thrown stacks: C computes multishot BEFORE splitobj/next_ident
  - special-level objects (statue/egg/corpse/tin/figurine) get
    branch-specific spe handling (default 0), not randomized spe

Object naming:
  - armor class uses oc_name_known (nn) directly, not gated by dknown
  - xname() for ARMOR_CLASS follows boots/gloves exception path
  - known vs unknown naming affects monster pickup messages

Object properties:
  - AC protection is objectData[otyp].oc1, NOT item.ac
  - enchantment is item.spe, NOT item.enchantment
  - #define opoisoned otrapped -- C aliases bits that must be tracked

Constants:
  - trap type enum values MUST match C exactly
  - TT_BEARTRAP=1 in C; wrong values in JS broke pit/beartrap checks
  - centralize all constants in one file, never define locally
```

### Monster System (makemon -> monmove -> dog AI -> combat)

Based on LORE "Pet AI is the final boss", "dochug phase ordering",
"m_move parity", "Monster item-search parity", "AT_WEAP monsters":

```
Monster creation:
  - mcansee = mcanmove = 1 (C sets these explicitly after zero-init)
  - JS undefined is NOT 0 and NOT 1; !undefined === true
  - rndmonst_adj must use live hero ulevel, not hardcoded 1
  - peace_minded() RNG width is role-sensitive
  - makemon_rnd_goodpos uses cansee (IN_SIGHT), not couldsee (LOS)

Monster movement (dochug phases):
  Phase 1: hider restrap (pre-dochug, can consume rn2(3))
  Phase 2: AT_WEAP wield gate (hostile in-range can spend turn wielding)
  Phase 3: undirected spell attempt BEFORE m_move()
  Phase 4: m_move() -> postmov() -> mintrap()
  Phase 5: attack/flee evaluation
  -- MMOVE_DIED status must halt post-move processing
  -- m_search_items: broad scan, per-item intent filtering (not pre-gated)
  -- M2_COLLECT alone does NOT imply gold-targeting (needs M2_GREEDY)

Pet AI (dog_move) -- the "final boss":
  - wizard mode sets trap.tseen=true on ALL traps
  - when tseen=true, pets roll rn2(40) for trap avoidance
  - when tseen=false, NO roll at all
  - movement candidate evaluation (mfndpos) order matters
  - food evaluation depends on obj.age (which depends on move count)
  - flee state resets mtrack history (mon_track_clear)
  - m_balks_at_approaching uses mux/muy, not player.x/y
  - requires EVERYTHING else to be correct first

Combat:
  - mattacku: non-physical hits consume rn2(10) negation RNG
    even when no special effect applied
  - hitum: mhitm_knockback (rn2(3) + rn2(6)) after every melee attack
  - AD_LEGS: rn2(2) side selection, rnd(60-DEX) duration
  - passive erosion: find_ac() is DEFERRED, not immediate
  - wielded launcher/ammo in melee: ranged damage semantics (rnd(2))
  - thrwmu retreat gate uses u.ux0/u.uy0 pre-command position
```

---

## Part 4: Lessons the Plan Already Captures Well

The Teleport plan and DECISIONS.md already correctly specify:

1. **ISAAC64 BigInt RNG** (Decision 8) -- the most consequential day-1
   choice.

2. **Async/await with Promise queue** (Decision 1) -- correct rejection of
   Web Workers and state machines.

3. **Modal guard + sync assert dual guards** (Decision 17) -- both
   directions of async failure caught.

4. **Game loop phase ordering** (Decision 15) -- monsters before player,
   no deferral flags. The plan gets this right at the structural level.

5. **ES6 modules without build step** (Decision 3) -- simplicity.

6. **Single `game` global state object** (Decision 7) -- mirrors C.

7. **Lua-to-JS direct conversion** (Decision 11) -- correct rejection of
   embedding a Lua interpreter.

8. **Per-step RNG trace comparison** -- the plan builds this from Day 1.

9. **"No fake implementations" rule** -- stated in the plan's daily
   discipline section.

10. **Port order** -- the plan correctly puts RNG first, level generation
    second, game loop third, pet AI last. The broad strokes are right even
    if some day-level scheduling needs adjustment per Part 2 above.

11. **Known hard areas table** -- correctly identifies game loop ordering,
    pet AI, special levels, vision, hallucination RNG, integer arithmetic,
    and async boundaries.

12. **Cardinal Rules** -- "RNG is source of truth", "Read the C not the
    comments", "Follow the first divergence" are all captured.
