# NetHack C-to-JS Porting Lessons

Distilled from 17,000+ lines of LORE.md and supporting docs (DECISIONS.md,
AGENTS.md, RNG_ALIGNMENT_GUIDE.md, GAME_LOOP_REORDER_PLAN.md, ASYNC_CLEANUP.md,
SYNCLOCK_PROGRAMMING_GUIDE.md) covering 64+ days of porting NetHack 3.7 C to
JavaScript.

---

## Part 1: The Cardinal Rules

Quoted from LORE.md "The Cardinal Rules" section:

> ### 0. The single-threaded contract is enforced
>
> C NetHack is single-threaded. When `more()` blocks in `wgetch()`, no
> game code runs until the key arrives. JS `await` yields the event loop,
> but `js/modal_guard.js` enforces the same invariant at runtime: if any
> game code (moveloop, monster AI, combat) fires while a modal wait (more,
> yn, getlin, getdir, menu) is active, it throws immediately.
>
> The most common violation: calling an async function without `await`.
> The orphaned Promise fires later during an unrelated `await`, breaking
> execution order. The modal guard catches this instantly.

> ### 1. The RNG is the source of truth
>
> If the RNG sequences diverge, everything else is noise. A screen mismatch
> caused by an RNG divergence at step 5 tells you nothing about the screen
> code -- it tells you something consumed or failed to consume a random number
> at step 5. Fix the RNG first. Always.

> ### 2. Read the C, not the comments
>
> C comments lie. C code does not. When porting behavior, trace the actual
> execution path in C and replicate it exactly. Comments explain intent, but
> parity requires matching *implementation*, including its bugs. When a comment
> says "this does X" and the code does Y, port Y.

> ### 3. Follow the first divergence
>
> The test harness reports the first mismatch per channel for a reason. Every
> subsequent mismatch is a cascade. Fix the first one, re-run, and repeat.
> Chasing divergence #47 when divergence #1 is unsolved is like fighting the
> Wizard of Yendor while the Riders watch -- dramatic, but unproductive.

---

## Part 2: Recurring C-to-JS Divergence Patterns

### Pattern 1: RNG Call Ordering Differences

**Frequency**: ~40+ LORE entries. The single most pervasive issue.

**Example** (LORE): *"In C, `for (i=1; i<=d(5,5); i++)` evaluates `d(5,5)` once. In JavaScript, the condition is re-evaluated every iteration. If the condition contains an RNG call, JS consumes RNG on every loop pass while C consumed it once. Always hoist RNG calls out of loop conditions."* -- and -- *"C does not specify the evaluation order of function arguments. GCC and Clang evaluate them in different orders... `set_wounded_legs(rn2(2) ? RIGHT_SIDE : LEFT_SIDE, rn1(10, 10));` Clang evaluates left-to-right... GCC evaluates right-to-left."*

**Root cause**: C's undefined argument evaluation order, single-evaluation loop conditions, composite RNG functions (like `d(n,x)` logging only the composite result), and the cascading nature of RNG drift (one extra/missing call shifts the entire subsequent sequence).

**How to prevent**: (1) Hoist ALL RNG calls out of loop conditions. (2) Standardize on Clang evaluation order (left-to-right). (3) Pre-evaluate multi-argument RNG expressions into temporaries. (4) Use composite RNG wrappers (`c_d()`) that match C logging conventions. (5) Build per-step RNG comparison into CI from day one.

### Pattern 2: Missing or Wrong Async/Await

**Frequency**: ~20+ entries, including the single most common modal violation.

**Example** (LORE Cardinal Rule 0): *"The most common violation: calling an async function without `await`. The orphaned Promise fires later during an unrelated `await`, breaking execution order."*

**Root cause**: C is synchronous and blocking. Every C function that calls `nhgetch()`, `more()`, `yn_function()`, or `getlin()` blocks the thread. In JS these become async, and every caller in the chain must also be async+await. A single missing await creates a "fire-and-forget" Promise that runs during an unrelated suspension point.

**How to prevent**: (1) Enforce a modal guard that throws immediately if game code runs during an active modal wait. (2) Use origin primitives -- only 6 functions create Promises (`nhgetch`, `nh_delay_output`, `display_sync`, `nhimport`, `nhfetch`, `nhload`). Every other await flows through these. (3) Static analysis / lint to catch missing awaits on async calls in game code.

### Pattern 3: Integer Division and Truncation

**Frequency**: ~10+ entries.

**Example** (LORE): *"C integer division truncates toward zero. JavaScript `/` produces floats. Every C division of integers must use `Math.trunc()` or `| 0` in JS. Missing a single truncation can shift coordinates by one cell, which shifts room geometry, which shifts corridor layout, which shifts the entire RNG sequence."*

**Root cause**: JS has only `Number` (IEEE 754 double). C integer arithmetic truncates implicitly. A coordinate off by 0.5 rounds differently, changing room placement, corridor routing, and everything downstream.

**How to prevent**: (1) Wrap all C integer divisions with `Math.trunc()` or use `| 0` for non-negative values. (2) Consider a lint rule for bare `/` in ported code. (3) Pay special attention to Lua `for` loop upper bounds (Lua `for x = 0, n` is `x <= n` with float n; the JS translation must use `Math.floor()`).

### Pattern 4: C Pointer/Struct Semantics vs JS References

**Frequency**: ~15+ entries.

**Example** (LORE): *"C functions like `finddpos()` return FALSE while leaving valid coordinates in output parameters. FALSE means 'didn't find ideal position,' not 'output is invalid.' JS translations that return `null` on failure break callers that expect coordinates regardless of the success flag."* Also: *"C's `m_ap_type` is an enum: M_AP_NOTHING=0... JS was using both string values and numeric constants inconsistently across ~10 files."*

**Root cause**: C uses output parameters (pointers), union types (overlay bytes for different purposes), null-char sentinels (`'\0'` is falsy in C but truthy in JS), and zero-initialization (`*mtmp = zeromonst`). JS has none of these natively.

**How to prevent**: (1) Port output-parameter functions as returning `{ success, x, y }` objects, never `null`. (2) Track C union/overlay fields explicitly (e.g., `blessedftn`/`horizontal`/`disturbed` sharing one byte). (3) Check `'\0'` sentinel returns explicitly in JS. (4) Audit all C fields initialized to non-zero after zero-init -- those are the dangerous ones where JS `undefined` silently differs from the C default.

### Pattern 5: Game Loop Phase Ordering

**Frequency**: ~15+ entries, including the 5 hardest remaining bugs.

**Example** (LORE/GAME_LOOP_REORDER_PLAN): *"C's `moveloop_core()` processes one game tick per call in a strict phase sequence: bookkeeping (A), monsters (B), display (C), then player input (D/E/F), then cleanup (G). Phase B (monster movement) runs BEFORE Phase F (player command). The JS port initially ran Phase B AFTER the player command..."*

**Root cause**: C's game loop is a simple `for(;;)` with phases in fixed order. JS initially flattened too much work into the per-key `run_command()` path, changing the relative ordering of monster turns, player commands, and turn-end processing.

**How to prevent**: (1) Structure `_gameLoopStep()` as one `moveloop_core()` iteration with phases in C order. (2) Never use deferral flags or synthetic continuation tokens. (3) Gate monster movement (`context.move`) exactly as C does. (4) Test with sessions where phase ordering matters (safety prevention, run-mode stops).

### Pattern 6: C Macro Expansion Surprises

**Frequency**: ~8+ entries.

**Example** (LORE): *"C uses `STR18(x) = 18 + x` for strength maximums. A human's STR max is `STR18(100) = 118`, not `18`. When attribute redistribution rolls `rn2(100)` and the attribute hasn't hit its max, C continues -- but JS with `max=18` stops early, causing an extra RNG retry."* Also: `#define opoisoned otrapped` -- C aliases object bits that JS must track jointly.

**Root cause**: C macros encode domain knowledge (STR18 encoding, field aliasing, bit-flag unions) that disappears in the preprocessed code and must be explicitly reconstructed in JS.

**How to prevent**: (1) Read the actual macro definitions, not just the expanded code. (2) Create a mapping table of all non-obvious macros. (3) Test attribute/property edge cases with boundary values.

### Pattern 7: Global State Mutation Order

**Frequency**: ~15+ entries.

**Example** (LORE): *"`find_ac()` -- JS recomputed AC immediately inside `mhitu` armor erosion. C `erode_armor()` does not call `find_ac()` there; AC refresh is deferred."* Also: *"JS emitted the teleport vanish line twice during `AD_SEDU`... The duplicate forced an extra `--More--`, shifted key consumption, and cascaded into RNG/event drift."*

**Root cause**: C code relies on specific ordering of state mutations within a turn. Computing state too early (AC refresh), emitting messages too many times, or updating visibility before the canonical point all create cascading divergences.

**How to prevent**: (1) Match state update timing exactly to C -- if C defers `find_ac()`, JS must too. (2) Trace message emission paths to ensure no duplicates. (3) Port complete functions, not partial stubs.

### Pattern 8: Display/Rendering Model Differences

**Frequency**: ~12+ entries.

**Example** (LORE): *"C uses **incremental** rendering (newsym): the centipede was visible at an earlier step, then became mundetected, but no newsym() was called at that tile to clear the old glyph. JS does a **full re-render** every frame."* Also: *"Out-of-sight object memory is not just a remembered character; C rendering preserves the remembered object color."*

**Root cause**: C's TTY display is incremental and stateful -- glyphs persist until explicitly redrawn. JS tends toward full-frame rendering. Additionally, C's `newsym()` path through `wall_angle()`, `seenv` bits, and `wall_info` modes is complex and must be replicated.

**How to prevent**: (1) Implement incremental rendering with remembered glyph state (`lev->glyph`). (2) Cache remembered terrain glyph/color in `newsym()`. (3) Port `set_wall_state()` and `wall_info` for wall glyph selection. (4) Never synthesize display from live state for unseen cells.

### Pattern 9: String/NUL-Termination Handling

**Frequency**: ~5+ entries.

**Example** (LORE): *"`vault_occupied()` returns `'\0'` (null char) for 'no vault found'. In C, `'\0'` is falsy. In JS, `'\0'` is a non-empty string -- truthy. This caused `gd_sound()` to always return false in JS."* Also: translator safety blocks for `hacklib.c`-style string functions with pointer mutation idioms.

**Root cause**: C strings are mutable char arrays with NUL termination. JS strings are immutable. C sentinel values (`'\0'`) have different truthiness. C pointer-arithmetic string scanning has no JS equivalent.

**How to prevent**: (1) Explicitly check for `'\0'` sentinels: `result && result !== '\0'`. (2) Gate automated translation of string/pointer-heavy C functions. (3) Never mechanically lower `p++` string mutation to JS.

### Pattern 10: Struct Field Initialization Timing

**Frequency**: ~8+ entries.

**Example** (LORE): *"C's `makemon.c:1293` sets `mtmp->mcansee = mtmp->mcanmove = 1` for every newly created monster. JS `makemon()` never initialized these fields, leaving them `undefined`... `!undefined` is `true`, so all monsters were treated as immobile."*

**Root cause**: C zero-initializes structs (`*mtmp = zeromonst`) then sets specific fields to non-zero. In JS, unset fields are `undefined`, which behaves differently from both `0` and `1` in boolean/arithmetic contexts.

**How to prevent**: (1) Find ALL fields that C explicitly sets to non-zero after zero-init. (2) Initialize those in JS constructors. (3) Use `=== 0` or explicit boolean checks rather than truthiness where C semantics require it (e.g., `mcanmove` being `0` vs `false` vs `undefined`).

### Additional Pattern: Stubs Cascade

**Frequency**: ~10+ entries.

**Example** (LORE): *"A vault gold stub consumes RNG without creating gold -> no `^place` events -> monsters don't path toward gold that doesn't exist -> pet AI diverges -> RNG shifts -> every subsequent turn is wrong. The failure manifests in `dog_move`, but the root cause is in `mklev`."*

**Root cause**: Partial ports that consume RNG calls without creating game objects appear to maintain parity but create invisible state drift that cascades into seemingly unrelated subsystems.

**How to prevent**: (1) Port complete subsystems, not RNG-consuming stubs. (2) If you must stub, track exactly which objects/effects are missing. (3) Get large-scale logic correct BEFORE entering bug burndown.

---

## Part 3: The Hardest Bugs

### 1. Pet AI RNG Parity ("The Final Boss")
- **Symptom**: Pet movement diverges after a few turns; cascades into all subsequent RNG.
- **Root cause**: `dog_move` in `dogmove.c` is the most RNG-sensitive subsystem. Movement candidate evaluation (`mfndpos`), trap avoidance (`rn2(40)` gated on `trap.tseen`), food evaluation, multi-attack combat each consume RNG in specific orders. Wizard mode makes all traps visible, changing pet behavior.
- **Duration**: Referenced throughout Phases 2-3; the dominant debugging target for weeks.
- **Technique**: Side-by-side RNG trace comparison at the step level; snapshot monster/object state at divergence point; audit every `mfndpos` candidate and trap-avoidance check.

### 2. Game Loop Reordering (seed031/032/033)
- **Symptom**: Monster turns attributed to wrong step; safety prevention fires incorrectly; "." command rejected when it should succeed.
- **Root cause**: JS ran Phase B (monsters) AFTER the player command instead of BEFORE. When `cmd_safety_prevention` checked for nearby monsters, they hadn't moved yet.
- **Duration**: Multi-week investigation across 3 sessions. Required gate-based proof methodology.
- **Technique**: Gate-based evidence: prove the owner of the first divergence, extract without reordering, move one boundary at a time, sweep the area.

### 3. Special Level Deferred Execution
- **Symptom**: RNG shifted by thousands of calls on special levels.
- **Root cause**: C creates objects/monsters immediately (consuming RNG) but defers placement until after corridors are generated. JS deferred both creation and placement.
- **Duration**: Multi-day investigation; required tracing the full `sp_lev.c` execution order.
- **Technique**: RNG trace comparison showing exact point of divergence mapped to corridor generation calls.

### 4. Vision System Pointer Table Corruption
- **Symptom**: Infinite loop / live-lock in `vision.js` during pet-path `do_clear_area()` calls. Session times out with 0 comparable metrics.
- **Root cause**: `fill_point()`/`dig_point()` had multiple C-port mismatches (wrong left/right pointer targets), corrupting row pointer tables and causing pathological LOS scanning cost.
- **Duration**: Required CPU profiling to identify the hotspot; then branch-by-branch realignment with C source.
- **Technique**: CPU profiling identified dominant self time in vision.js; then line-by-line comparison with `nethack-c/patched/src/vision.c`.

### 5. Replay Orchestration vs Game Orchestration
- **Symptom**: `replay_core.js` grew to ~1700 lines; test failures were ambiguous between real divergences and boundary-matching artifacts.
- **Root cause**: Three independent implementations drove the same post-rhack orchestration independently. Comparison logic drove execution, making it impossible to distinguish game bugs from harness bugs.
- **Duration**: Architectural realization after weeks of debugging; required separating concerns completely.
- **Technique**: Unified `run_command()` in `allmain.js` for all drivers; moved RNG comparison to post-hoc flat matching.

### 6. Gas Spore Target Refresh Timing (seed031)
- **Symptom**: Gas spore gets `near=1` when it should get `near=0`, causing different flee behavior.
- **Root cause**: JS advanced the hero 2 extra squares before the gas spore's next turn due to command-boundary ownership bugs. The spore's `set_apparxy` refreshed to the hero's already-closer position.
- **Duration**: 6+ LORE entries on 2026-03-21 alone, exploring and discarding multiple hypotheses.
- **Technique**: `WEBHACK_MONMOVE_TRACE` over specific gameplay steps; tracing exact hero/monster positions per turn; ruling out formula bugs to isolate timing.

### 7. Wizard Death Flow
- **Symptom**: `seed331` screen parity fails at death sequence; `Die? [yn]` prompt mishandled.
- **Root cause**: JS had ad-hoc wizard bypass instead of routing through `end.c` `done_in_by()` path. Prompt accepted any non-y key as n; death message `--More--` boundary was wrong; disclose prompt was not entered in same key cycle.
- **Duration**: Multiple fix iterations across `end.js`, `mhitu.js`, `allmain.js`, `replay_core.js`.
- **Technique**: Step-by-step comparison of C death flow vs JS; each fix exposed the next boundary.

### 8. Trap Type Constant Inconsistencies
- **Symptom**: Boots blocked while in pit (should be allowed); boots allowed while in beartrap (should be blocked).
- **Root cause**: C defines trap types as a contiguous enum; JS had different values in 6+ files. `TT_BEARTRAP=1` in C but `PIT=1` in JS.
- **Duration**: Quick to fix once found, but the inconsistency was pervasive.
- **Technique**: Grep for all trap type definitions; compare values against C enum.

### 9. Headless `--More--` Status Refresh Timing
- **Symptom**: HP shows as 0 one `--More--` too early during monster combat.
- **Root cause**: Unconditional status refresh in `more()` was too broad for headless internal `putstr_message()` waits during `context.mon_moving`. Complex gating needed: suppress only when specific conditions align (mon_moving + fromTopMoreBoundary + not sleep/wake boundary).
- **Duration**: Required balancing 4 different sessions (hi11, seed331, seed323, seed100) simultaneously.
- **Technique**: Narrowing the refresh suppression condition until all 4 sessions passed.

### 10. Branch/Vault Ludios Source Handling (seed327/332)
- **Symptom**: Knox portal placement and branch room threshold differ between C and JS.
- **Root cause**: C keeps Ludios branch source floating until `mk_knox_portal()` decides to bind it. JS pre-bound it. Also, C snapshots branch presence once at makelevel start; JS recomputed it late after vault/portal mutations.
- **Duration**: Required understanding dungeon topology initialization deeply.
- **Technique**: Traced `init_dungeons()` branch source handling; snapshot branch placement at makelevel start.

---

## Part 4: Architecture Lessons

### Game Loop Structure
- Structure `_gameLoopStep()` as one `moveloop_core()` iteration with C's exact phase sequence: bookkeeping (A), monsters (B), display (C), player input (D/E/F), cleanup (G).
- Monster movement (Phase B) must run BEFORE the next player command, gated by `context.move`.
- No deferral flags, no synthetic continuation tokens, no queuing. The C game loop is a `for(;;)` -- match it directly.
- Occupations and multi-repeat dispatch one step and return to the outer loop.
- The loop is circular: "first" is the same as "last." But turn 0 must be handled correctly (`context.move` starts at 0, so Phase B skips on the first iteration).

### Async Handling
- Define exactly 6 origin primitives where all suspension occurs: `nhgetch`, `nh_delay_output`, `display_sync`, `nhimport`, `nhfetch`, `nhload`.
- Every other `await` in gameplay code must flow through one of these.
- Enforce a modal guard that throws if game code fires during an active modal wait.
- The async call stack routes keys exactly like C's synchronous call stack -- no boundary dispatch table needed.
- `display_sync()` (setTimeout(0)) is needed because the browser only paints when JS yields. C paints automatically on blocking input reads.

### RNG Management
- Use ISAAC64 with BigInt for bit-exact C compatibility. No substitutes.
- Build per-step RNG trace comparison from the start. The test harness should report first mismatch per channel.
- Match C's RNG logging conventions: exclude composite entries, midlog markers, source tags.
- `rn2(1)` is the canonical no-op RNG consumer (always returns 0).
- Pre-evaluate all RNG calls out of: loop conditions, function argument lists, conditional expressions that C evaluates in a different order.

### Display System
- Implement incremental rendering matching C's `newsym()` model. Cache remembered terrain glyph/color for unseen cells.
- Port `set_wall_state()` for wall glyph selection.
- Never synthesize display from live state for out-of-sight cells.
- Separate display RNG (hallucination names) from gameplay RNG.
- `--More--` must be a true blocking boundary that consumes keys via `nhgetch()`.

### C Patterns Needing Special Translation Strategies
1. **Output parameters**: Return `{ success, ...data }` objects, never null.
2. **Union/overlay fields**: Track all shared-byte fields explicitly.
3. **NUL sentinels**: Always check `!== '\0'` explicitly.
4. **Zero-init + non-zero fields**: Audit and initialize all non-zero defaults.
5. **Integer division**: Always `Math.trunc()` or `| 0`.
6. **Pointer arithmetic strings**: Do not auto-translate; hand-port string functions.
7. **Macro-encoded values**: Build a mapping table (STR18, field aliases, bit unions).
8. **Enum constants**: Centralize in one file; never define locally.
9. **C boolean truthiness**: `0`, `false`, and `undefined` all behave differently in JS.
10. **Argument evaluation order**: Pre-evaluate into temporaries.

---

## Part 5: Day-1 Knowledge Base

If you are starting a NetHack C-to-JS port today, read this first.

### The Three Laws
1. **RNG is the source of truth.** If RNG diverges, fix that first. Everything else cascades from it.
2. **Read the C, not the comments.** Port implementation, including bugs. Comments lie.
3. **Follow the first divergence.** Never chase divergence #47 when #1 is unsolved.

### Critical Architecture Decisions (get these right from day 1)
- Use ISAAC64 BigInt RNG for bit-exact parity with C.
- Use async/await with Promise-based input queue (not Web Workers, not state machine).
- Structure the game loop as one `moveloop_core()` iteration per step.
- Define 6 origin await primitives. All other async flows through them.
- Enforce single-threaded execution with a runtime modal guard.
- Use ES6 modules without a build step. Single `game` global state object.

### The Top 5 JS Translation Traps
1. **Loop conditions re-evaluate**: `for (i=1; i<=d(5,5); i++)` -- hoist `d(5,5)`.
2. **Integer division produces floats**: Always `Math.trunc()`.
3. **`'\0'` is truthy in JS**: Check `!== '\0'` explicitly.
4. **`undefined` is not `0`**: `!undefined === true`, `undefined & flag === 0`. Find all C fields set to non-zero after zero-init.
5. **Missing `await` is silent**: The orphaned Promise fires later during an unrelated yield.

### RNG Parity Checklist
- [ ] Hoist all RNG calls out of loop conditions
- [ ] Pre-evaluate multi-arg RNG expressions (C argument eval order is undefined)
- [ ] Build with Clang on all platforms (left-to-right arg eval)
- [ ] Use composite RNG wrappers (`c_d()`) matching C logging conventions
- [ ] `rn2(1)` for no-op RNG consumption, never `rn2(100)`
- [ ] Pin datetime for deterministic replay (moon phase, Friday 13th affect Luck)

### Port Order (what to do first)
1. ISAAC64 RNG -- bit-exact with C.
2. Level generation (`makelevel`, `sp_lev`) -- complete, not stubbed.
3. Post-level init (pet creation, inventory, attributes).
4. Game loop with correct phase ordering.
5. Movement and basic combat.
6. Pet AI (the "final boss" -- get everything else right first).
7. Special levels, shops, traps.
8. Display system (incremental, with remembered glyphs).

### Anti-Patterns That Will Cost You Weeks
- **RNG-consuming stubs**: Consuming the right random numbers without creating game objects creates invisible state drift that cascades into seemingly unrelated systems.
- **"Close enough" partial ports**: If you've read the C and written the RNG calls, finish the function. Stubs accumulate compounding debugging pain.
- **Replay-driven orchestration**: Don't contort the game engine to produce output matching C's step boundaries. Run the game naturally, compare post-hoc.
- **Comparator exceptions to hide divergences**: Fix the game code, never mask the comparator.
- **Multiple orchestration implementations**: Use one shared `run_command()` for browser, tests, and selfplay. What you test must be what you deploy.

### Debugging Toolkit
- **Per-step RNG trace comparison**: The first mismatch tells you which function diverged.
- **Step snapshots**: Compare C and JS monster/object state at divergence point. Catches hidden-state drift before it surfaces as RNG mismatch.
- **Event parity**: `^die`, `^pickup`, `^place` etc. Full RNG parity can hide behavioral gaps; events expose missing state transitions.
- **First-divergence triage table**:
  - JS has 0 RNG, C has full turn: Unimplemented command or `tookTime:false`
  - Same functions, different args: Hidden state drift from earlier step
  - Wrong function name: JS uses different RNG wrapper
  - Extra/missing calls in turn-end: Missing subsystem
- **Gate-based investigation**: Prove the owner, extract without reordering, move one boundary, sweep the area.

### Key C Files to Understand Deeply
- `moveloop_core()` in `allmain.c` -- the game loop structure
- `dogmove.c` -- pet AI (most RNG-sensitive subsystem)
- `sp_lev.c` -- special level engine (deferred execution model)
- `monmove.c` -- monster movement and `postmov()` sequencing
- `vision.c` -- FOV raycasting (pointer table maintenance is subtle)
- `rnd.c` -- RNG wrappers and ISAAC64 integration
- `display.c` -- `newsym()`, `set_wall_state()`, incremental rendering
- `trap.c` -- trap effects and `dotrap()` gating
- `uhitm.c` / `mhitu.c` -- combat RNG sequences
