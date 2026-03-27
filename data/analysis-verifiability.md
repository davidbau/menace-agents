# Analysis: Making Agent Work Verifiable — Measurement Precision in the MazesOfMenace Project

*Research analysis of LLM-assisted coding — how quantitative verification transformed the development process.*
*Based on data from 48 days (Feb 6 – Mar 25, 2026), 6,272 commits, and raw session logs.*

---

## Part A: Measurement Precision Timeline

### Evolution of Verification Approach

The project moved through three distinct measurement eras, each replacing "does it look right?" with ever-more-precise tools.

#### Era 1 (Feb 6–7): Visual / Cell-Count Comparison
The very first comparison framework, introduced on Feb 6, reported C-vs-JS divergences in raw cell counts.

**Commit `342f2f51` (Feb 6, "Add C ground truth comparison testing framework"):**
> Current C-vs-JS divergences: ~500-900 cells per map (bugs to fix in JS)

**Commit `e553c35d` (Feb 6, "PRNG alignment: simulate C Lua themerooms for near-identical maps"):**
> C-vs-JS map comparison: 800-1000 cells → 2-38 cells per seed.

This framing — raw diff counts — was the earliest quantitative signal. Progress was measured as "how many cells differ?"

By Feb 7, the comparison was already precise enough to declare perfect matches:

**Commit `89379b99` (Feb 7, "Achieve 10/10 perfect C-vs-JS map alignment across all test seeds"):**
> Achieve 10/10 perfect C-vs-JS map alignment across all test seeds

And to report per-seed results with exact numbers:

**Commit `157ac22f` (Feb 7, "Fix venom shuffle fencepost…"):**
> seed=42 PERFECT, seed=555 PERFECT, seed=100: 1 diff, seed=999: 3 diffs

#### Era 2 (Feb 8–12): RNG Call-Level Matching
On Feb 8, the team moved from comparing output cells to comparing RNG calls directly — a fundamentally more precise metric. A comparison framework tracked each RNG call by index.

**Commit `aff06777` (Feb 8, "Add mid-level function tracing (midlog)"):**
> files with midlog traces (~5% size overhead)

The golden comparison metric `X/63 seeds matching` appeared explicitly:

| Date | Commit | Metric | Note |
|------|--------|--------|------|
| Feb 8 (00:00) | `34b57073` | 47/63 seeds (74.6%) | First golden comparison report |
| Feb 8 (03:57) | `735e93c4` | 55/63 → 58/63 | 8 RNG alignment bugs fixed |
| Feb 8 (03:57) | `815c2137` | 54/63 → (regressed) | Themeroom fills temporarily broke 4 seeds |
| Feb 8 (04:12) | `8ed143c7` | 58/63 → 59/63 | mkgrave epitaph RNG |
| Feb 8 (05:07) | `3381c8f8` | **55/63 → 63/63 (100%)** | All seeds perfect |

**Commit `7aa31599` (Feb 8, "Fix makelevel RNG alignment: all 2491 entries match C trace exactly"):**
> Three bugs in level generation caused RNG divergence from C NetHack

This commit introduces exact RNG call counting — a trace of 2491 entries that must match one-for-one.

By Feb 9–10, the RNG alignment metric expanded from seed-level map comparison to a continuous call index:

**Commit `c9ef161a` (Feb 9, "BREAKTHROUGH: Achieve 100% RNG alignment at depth 1!"):**
> Depth 1: ✅ 100% RNG alignment (2565 calls match perfectly)

**Commit `42dc2f65` (Feb 9, "Implement rnd_misc_item and pet arrival for depth 2+ maps"):**
> - Session start: 809 calls matched (32.7%)
> - After kobold fix: 1192 calls matched (48.1%)
> - After rnd_defensive_item: 2430 calls matched (98.1%)
> - **After rnd_misc_item + pet arrival: 2476/2476 calls matched (100.0%)**

**Commit `fb3fa970` (Feb 10, "MAJOR BREAKTHROUGH: 94.5% RNG alignment (1890/2000 calls matching!)"):**
> - RNG alignment: 417→1890 matching calls (20.8% → 94.5%)
> - First mismatch: call 418 → call 1891 (1472 call improvement!)
> - Gap: 169 → -110 calls (JS now makes 110 fewer, expected)
> - ALL 1890 JS RNG calls match C perfectly!

The specific index ("call 418 → call 1891") made it possible to target the exact line of C code causing divergence.

#### Era 3 (Mar 1+): PES Report — Three-Channel Parity
On Mar 1, a new system was introduced: the PES (PRNG / Event / Screen) report, which tracked divergence across three independent channels with step-level precision.

**Commit `f9669000` (Mar 1, "pes-report: add PES session parity report with AI diagnoses"):**
> New scripts:
> - scripts/pes-report.mjs: instant PES (PRNG/Event/Screen) table from git notes; color-coded by divergence step; inline AI category notes
> - scripts/gen-pes-diagnoses.mjs: batch claude -p call to generate cat+tldr diagnoses for all failing sessions

This system replaced the single overall pass/fail with three independent signals:
- **P** (PRNG): which RNG call first diverges
- **E** (Events): which game event first diverges
- **S** (Screen): which screen row first diverges

**Commit `c4015b6f` (Mar 6, "fix: Phase 4 complete — all 22 sessions at 100% screen parity"):**
> Result: 22/22 sessions pass at 100% screen parity (PES report).

**Commit `bcbab358` (Mar 4, "skill: expand parity-rng-triage with workflow improvements"):**
> - Add run-and-report.sh as primary survey tool (PES table with color)

The divergence call index continued to narrow:

**Commit `d6839951` (Feb 9):**
> Depth 3 RNG divergence moved from call 1094 to 1095 (essentially fixed)

**Commit `07a91c49` (Feb 10):**
> Improves oracle RNG alignment from call 9 → call 10 (87% → 90%)

### Summary: Measurement Precision Milestones

| Date | Measurement Unit | Typical Precision |
|------|----------------|-------------------|
| Feb 6 | Cell count diffs | "500-900 cells" |
| Feb 7 | Per-seed perfect/diff | "seed=42: 0 diffs, seed=999: 3 diffs" |
| Feb 8 | Golden ratio (X/63 seeds) | "55/63 → 63/63 (100%)" |
| Feb 8–9 | RNG call index | "2491 entries match exactly" |
| Feb 10 | RNG call index with gap | "call 418 → call 1891" |
| Mar 1 | PES three-channel | "P/E/S divergence step per session" |
| Mar 8+ | Session pass rate | "150/151 sessions passing (99.3%)" |

### Commits Citing Specific Numeric Metrics by Chapter

The following counts how many commits in each chapter included quantitative evidence (specific numbers, percentages, pass rates, cell counts, RNG call counts) vs. "blind" commits with no such citations:

| Chapter | Name | Total Commits | Quantitative | Blind | Quant% |
|---------|------|---------------|-------------|-------|--------|
| founding | Founding (Feb 6–12) | 1,013 | 256 | 757 | 25.3% |
| measurement | Measurement (Feb 13–15) | 308 | 1 | 307 | 0.3% |
| porting-grind | Porting Grind (Feb 16–20) | 644 | 15 | 629 | 2.3% |
| codex-sprint | Codex Sprint (Feb 21–25) | 352 | 9 | 343 | 2.6% |
| iron-parity | Iron Parity (Feb 26–Mar 5) | 723 | 25 | 698 | 3.5% |
| expansion | Expansion (Mar 6–11) | 1,413 | 89 | 1,324 | 6.3% |
| ecosystem | Ecosystem (Mar 12–19) | 930 | 113 | 817 | 12.2% |
| convergence | Convergence (Mar 20–25) | 889 | 147 | 742 | 16.5% |

**Interpretation:**
- The "Founding" chapter has 25% quantitative because this was the intense RNG alignment phase — nearly every commit cited pass rates, cell counts, or call indices.
- The "Measurement" chapter appears to show almost no quantitative commits because during Feb 13–15 the team was establishing the recording infrastructure itself (deterministic sessions, oracle test framework). The commits were process/infrastructure, not fix-and-measure.
- From the Expansion chapter onward (Mar 6+), the proportion rose steadily as the PES system matured and parity session counts grew into the hundreds.
- The Convergence chapter (final week) reached 16.5% — driven by the session-by-session approach: every commit cited "X/563 sessions passing."

---

## Part B: The Session Pass Rate Time Series

The complete progression of cited session pass rates, extracted from commit bodies:

### Precursor: Map-Level Golden Comparison (Feb 8)

Before session pass rates existed, the team tracked "golden comparisons" — how many of 63 test seeds produced pixel-perfect map matches:

| Date | From | To | Delta | Commit |
|------|------|----|-------|--------|
| Feb 8 (00:00) | — | 47/63 (74.6%) | baseline | `34b57073` |
| Feb 8 (03:39) | 47/63 | 55/63 (87.3%) | +8 | `815c2137` |
| Feb 8 (03:57) | 55/63 | 58/63 (92.1%) | +3 | `735e93c4` |
| Feb 8 (04:12) | 58/63 | 59/63 (93.7%) | +1 | `8ed143c7` |
| Feb 8 (05:07) | 55/63 | **63/63 (100%)** | +8 | `3381c8f8` |

(Note: the jump from 59→63 without intermediate commits represents 4 additional seeds fixed in the same session.)

### Session Pass Rate Series (First Mention: Feb 18)

The "sessions passing" metric — tracking replay sessions against C reference screens — first appeared in commit bodies on Feb 18:

| Date | Sessions | Rate | Context |
|------|---------|------|---------|
| Feb 18 | 184/205 | 89.8% | First mention: screen compare |
| Feb 20 | 193/206 | 93.7% | counted-command replay fix |
| Mar 3 | 3,199/3,234 | 98.9% | Large suite during FOV work |
| Mar 3 | 3,207/3,234 | 99.2% | After display cruft removal |
| Mar 6 | 22/22 | 100% | Phase 4 complete (focused set) |
| Mar 8 | 150/151 | 99.3% | findtravelpath fix |
| Mar 9 | 151/151 | 100% | 6 browser/headless divergences fixed |
| Mar 11 | 120/120 | 100% | ring of warning (hack subset) |
| Mar 11 | 214/214 | 100% | getobj re-prompt fix |
| Mar 11 | 286/286 | 100% | spellbook fix |
| Mar 11 | 294/294 | 100% | ring/amulet prinv |
| Mar 11 | 301/301 | 100% | 6 more promoted |
| Mar 11 | 314/314 | 100% | status line (full set) |
| Mar 12 | 122/122 | 100% | hack subset with findit |
| Mar 12 | 123/123 | 100% | dosearch-trap |
| Mar 12 | 128/128 | 100% | trapdoor fixes |
| Mar 12 | 139/139 | 100% | new parity sessions |
| Mar 12 | 262/262 | 100% | wizMap/spellbook |
| Mar 12 | 268/268 | 100% | RUBOUTS/DECgraphics |
| Mar 13 | 172/174 | 98.9% | new coverage sessions |
| Mar 13 | 175/177 | 98.9% | door-run, sleep trap |
| Mar 13 | 194/196 | 99.0% | identify, gem, pit |
| Mar 13 | 214/217 | 98.6% | async fix |
| Mar 13 | 215/217 | 99.1% | pline fix |
| Mar 13 | 219/221 | 99.1% | menu dismiss |
| Mar 13 | 220/221 | 99.5% | status refresh revert |
| Mar 13 | 220/230 | 95.7% | read.js scroll identify |
| Mar 13 | 224/224 | 100% | exercise() calls |
| Mar 14 | 201/201 | 100% | coverage report (74.2%) |
| Mar 14 | 220/231 | 95.2% | polyself fixes |
| Mar 14 | 232/233 | 99.6% | throw/potion/teleport |
| Mar 14 | 234/235 | 99.6% | wizMap/display |
| Mar 14 | 235/236 | 99.6% | AT_EXPL fix |
| Mar 14 | 236/237 | 99.6% | multiple |
| Mar 14 | 237/238 | 99.6% | set_wear |
| Mar 14 | 253/256 | 98.8% | readobjnam |
| Mar 14 | 254/257 | 98.8% | mineralize |
| Mar 15 | 257/258 | 99.6% | wizard identify |
| Mar 15 | 258/258 | 100% | display fixes |
| Mar 15 | 258/261 | 98.9% | polymon newsym |
| Mar 15 | 259/261 | 99.2% | t04_s706 |
| Mar 17 | 424/429 | 98.8% | --More-- fix |
| Mar 22 | 201/201 | 100% | mklev seeding restored |
| Mar 22 | 562/568 | 98.9% | Gate 6 (506 sessions to V4) |
| Mar 23 | 29/36 | 80.6% | Rogue: early room gen |
| Mar 23 | 128/211 | 60.7% | Rogue: baseline |
| Mar 23 | 202/211 | 95.7% | Rogue: bow name fixes |
| Mar 24 | 210/211 | 99.5% | Rogue: ntimes++ fix |
| Mar 24 | 211/211 | 100% | Rogue: 100% complete |
| Mar 24 | 207/207 | 100% | hack: multigame sessions |
| Mar 24 | 553/563 | 98.2% | display-only comparator |
| Mar 24 | 554/563 | 98.4% | seed301 luck divergence |
| Mar 25 | 555/563 | 98.6% | disturb/Rogue stealth |
| Mar 25 | 556/563 | 98.8% | goto_level ordering |
| Mar 25 | 559/563 | 99.3% | mimic light-blocking |
| Mar 25 | 560/563 | 99.5% | glass gem shop pricing |

**Key observation:** The metric shifted from a single large pool to multiple independent pools as the project expanded to multiple game types:
- `hack` sessions: the main NetHack port (peaked at 314/314 and then 562/568)
- `rogue` sessions: a separate Rogue port (29/36 → 211/211 in 2 days)
- Combined cross-game: 562/568 after Gate 6 (Mar 22)

The final combined total (Mar 25) was **560/563 (99.5%)** with specific seeds known by number.

---

## Part C: Case Study — The PRNG Alignment Breakthrough (Feb 8–11)

### Context and Git Log

The commits in the wave repository for Feb 8–10:

```
Feb 10:  fb3fa970  MAJOR BREAKTHROUGH: 94.5% RNG alignment (1890/2000 calls matching!)
Feb 10:  ca8da2a1  WIP: luaRngCounter investigation - complex gap pattern discovered (417/2000)
Feb 10:  b280dfa1  Add seed 4 trace and debugging infrastructure (291/2000)
Feb 10:  91fe4a0a  Fix HeadlessGame and improve RNG alignment to call 292 (292/2659)
Feb 8:   3381c8f8  Fix 8 RNG alignment bugs, golden comparison 55/63 → 63/63 (100%)
Feb 8:   7aa31599  Fix makelevel RNG alignment: all 2491 entries match C trace exactly
Feb 8:   735e93c4  Fix mktrap_victim to use mkcorpstat, golden comparison 55/63 → 58/63
Feb 8:   815c2137  Implement all 15 themeroom fills with selection API and des.* helpers
Feb 8:   34b57073  Fix 5 RNG alignment bugs, golden comparison 47/63 → 55/63
Feb 8:   d59f3e87  Fix isok() off-by-one and add broad C-vs-JS golden comparison tooling
```

### The Breakthrough Session (Feb 10–11)

The breakthrough happened in a long-running Claude session on the `menace` project (session ID: `ef4a4c4e-e546-431a-9e4c-bbcab14ea01c`). The human's prompts were brief — essentially "continue" requests every 30 minutes:

**Human (Feb 11, 01:50):**
> keep working on the next step as carefully and accurately as possible!

**Human (Feb 11, 02:01):**
> write this detail into bd tasks, then clear context, then begin

The session summary (captured in compact agent log `agent-acompact-fd23e9.jsonl`) documents three breakthroughs in sequence:

#### Breakthrough 1: MT Init Timing (14.5% → 20.8%)

The agent discovered that JavaScript module exports of primitives are copies, not references:

> **Discovery**: Primitives are copied on import, functions return live data!
> **Fix**: Changed `_mtInitialized` from exported primitive to getter function `isMtInitialized()`
> **Result**: 291 → 417 matching calls (14.5% → 20.8%)

#### Breakthrough 2: Short-Circuit Evaluation in create_room (20.8% → 94.5%)

This is the primary breakthrough, documented in real-time in the session log:

**Agent (Feb 11, 02:13):**
> Great progress! The divergence moved from call 292 to call 418 - that's 126 calls of progress!
>
> Looking at the pattern:
> - C call 418: `rn2(11)` @ create_room
> - C call 419: `rn2(3)` @ create_room
> - C call 420: `rn2(2)` @ rnd_rect
> - JS call 418: `rn2(2)` (matches C's call 420)
>
> JS is missing 2 RNG calls from create_room.

**Agent (Feb 11, 02:21):**
> I found it! The condition at line 395-397 short-circuits, preventing `rn2(map.nroom)` from being called. But C trace shows it DOES call `rn2(3)` even when `yabs+dy=9` (not > 10).
>
> This means C's code structure is different - it likely calls `rn2(map.nroom)` BEFORE checking `(yabs + dy > ROWNO/2)`. Let me fix the evaluation order.

**Agent (Feb 11, 02:22) — The Announcement:**
> **INCREDIBLE BREAKTHROUGH!** 🎉🎉🎉
>
> ### Results:
> - ✅ **1890/1890 calls matching (100% of JS calls!)**
> - ✅ **94.5% alignment with C (1890/2000 total)**
> - ✅ **First mismatch pushed from call 418 → call 1891** (1472 call improvement!)
> - ✅ **Gap reduced from 169 to -110 calls**
>
> The fix for calling `rn2(map.nroom)` unconditionally worked perfectly!

The fix itself was one condition restructuring in `dungeon.js` (commit `fb3fa970`):

> Fixed missing rn2(map.nroom) call in create_room by restructuring condition to call rn2() BEFORE checking (yabs + dy > ROWNO/2). C calls rn2(map.nroom) at sp_lev.c:1564 regardless of whether the subsequent condition (line 1566+) evaluates to true.

**Key insight captured in the commit body:**
> - Split condition into two parts
> - Always call rn2(map.nroom) when ly==0 && hy>=ROWNO-1
> - Only apply yabs adjustment if BOTH nroom_check AND position check pass
> - **Prevents short-circuit evaluation from skipping RNG call**

#### Breakthrough 3: Map Contents Callback Fix
After the RNG alignment, the agent also discovered that `des.map()` was not executing its contents callback — fixing this further improved test pass rates from 83 to 90.6%.

### Agent Summary of Session (from compact log)

The session summary (agent-acompact-fd23e9) captured the three-breakthrough progression:

> **RNG Alignment: 94.5% (1890/2000 calls)**
> - Three major breakthroughs in one session!
>   1. **MT Init Timing** (14.5% → 20.8%)
>   2. **create_room nroom check** (20.8% → 94.5%)
>   3. **des.map contents callback** (test fixes)
>
> **Key Technical Discoveries:**
> 1. JavaScript module import bug: Primitives copy values, use getter functions for live data
> 2. C RNG condition evaluation: Doesn't short-circuit like JavaScript && operator
> 3. Missing contents execution: des.map() wasn't calling its contents callback

### Before and After: What the Numbers Made Possible

Before the RNG alignment framework existed (before Feb 6), progress was invisible except through visual inspection. After:

- Commit `342f2f51` (Feb 6): First C-ground-truth framework — "~500-900 cells per map"
- Commit `e553c35d` (Feb 6): "800-1000 cells → 2-38 cells per seed" after one fix
- Commit `34b57073` (Feb 8): "47/63 → 55/63" after 5 bugs fixed
- Commit `fb3fa970` (Feb 10): "call 418 → call 1891" after one condition restructure

Each fix was immediately measurable. The human could tell from commit messages whether progress was real.

### The Five Days: Feb 8–12 Progression

| Date | Key Metric | What Changed |
|------|-----------|--------------|
| Feb 8 | 47/63 → 63/63 seeds (100%) | Map-level golden comparison complete |
| Feb 8 | 2491 RNG entries match exactly | Seed-level trace exact match |
| Feb 8 | 565/682 gameplay steps passing | Session replay introduced |
| Feb 9 | 1090/1164 tests (93.6%) | Special levels, pet AI, trap avoidance |
| Feb 9 | 2476/2476 calls (100%) at depth 2 | Depth 2 perfect alignment |
| Feb 10 | 1890/2000 calls (94.5%) | Cross-seed RNG alignment major breakthrough |
| Feb 11 | Map-relative coordinate system discovered | All special-level mismatches root-caused |

---

## Part D: What Verification Enabled — Quantitative Commit Analysis by Chapter

### Methodology

A commit is counted as "quantitative" if its body contains any of:
- `X/Y sessions passing` or `X/Y tests passing`
- A percentage (e.g., `94.5%`)
- A cell count reduction (e.g., `738→0 cells`)
- A golden comparison result
- An RNG call count match (e.g., `2491 entries match`)
- A specific divergence call index (e.g., `diverges at call 1094`)

A commit is "blind" if it contains none of these.

### Results by Chapter

| Chapter | Period | Total | Quant | Blind | Quant% | Dominant metric |
|---------|--------|-------|-------|-------|--------|-----------------|
| Founding | Feb 6–12 | 1,013 | 256 | 757 | **25.3%** | Cell diffs, golden X/63, RNG call index |
| Measurement | Feb 13–15 | 308 | 1 | 307 | 0.3% | (Infrastructure only — no session metrics yet) |
| Porting Grind | Feb 16–20 | 644 | 15 | 629 | 2.3% | Session pass rates emerging |
| Codex Sprint | Feb 21–25 | 352 | 9 | 343 | 2.6% | CODEMATCH function counts |
| Iron Parity | Feb 26–Mar 5 | 723 | 25 | 698 | 3.5% | PES report introduced Mar 1 |
| Expansion | Mar 6–11 | 1,413 | 89 | 1,324 | **6.3%** | Session rates 22→314/314 |
| Ecosystem | Mar 12–19 | 930 | 113 | 817 | **12.2%** | Parity sessions dozens per day |
| Convergence | Mar 20–25 | 889 | 147 | 742 | **16.5%** | 550–563 sessions, rogue 100% |

### Interpretation

**Founding (25.3%)** stands out as the highest quantitative ratio because this was the period of active measurement infrastructure construction. Every RNG alignment fix was immediately verified with a test run; every commit cited the before/after. The team was measuring everything because they'd just built the ability to measure.

**Measurement (0.3%)** is paradoxically the chapter with the least quantitative evidence: the agents were building the measurement apparatus — recording deterministic sessions, building the oracle framework, enforcing fixed datetimes. None of that generates pass rates in commit messages; it generates tooling.

**Porting Grind through Iron Parity (2–3%):** This was the period of mass porting — 73 CODEMATCH functions in one day, Codex sprinting. Commits were predominantly "port function X" with no measurement cited, because individual function ports don't move pass rates in visible ways. The improvements accumulate invisibly in CODEMATCH coverage numbers, not test pass rates.

**Expansion through Convergence (6–17%):** As the PES system matured and session counts grew into the hundreds, agents routinely cited "X/Y sessions passing" in every fix commit. By March 25, nearly every parity commit cited the specific session count. The verification system had become the natural unit of progress.

### What Agents Could and Couldn't Do Without Numbers

**Without numbers:** An agent improving the pet AI in Feb 8 was told "keep going." The human couldn't evaluate whether the change was good without running the tests. The session log shows the human saying:

> "please fix regressions and make sure things pass"
> "is this enough progress to warrant a commit and push?"

**With numbers:** By March, the human's messages became shorter and less directive. The session logs show:

> "Please continue with the most accurate work possible."

The human had delegated evaluation to the metrics. When the agent reported "556/563 sessions passing," the human knew without visual inspection whether to approve the commit, ask for more work, or investigate a specific failing seed.

### The Most Diagnostic Commits

The final week (Mar 20–25) shows the system at full maturity. Every parity commit cites a specific seed:

**Commit `480cb875` (Mar 24, "parity: fix seed301 luck divergence"):**
> parity: fix seed301 luck divergence — three-part fix for Archeologist
> 554/563 sessions passing

**Commit `dc1f8cd2` (Mar 25, "parity: match C goto_level message ordering — fixes seed332"):**
> 556/563 sessions passing

The commit body identified the seed by number. The fix addressed one specific session. The pass rate moved from 555 to 556. This granularity — one session, one seed, one fix, one number — was impossible in the visual comparison era.

---

## Summary: The Transformation

| Axis | Day 1 (Feb 6) | Day 48 (Mar 25) |
|------|--------------|-----------------|
| **How verification worked** | Visual cell count: "~500-900 cells differ" | PES report: `P/E/S` per session, per step |
| **Agent autonomy** | Human approves each commit | "Please continue" every 30 min |
| **What a "pass" meant** | "looks like a nethack map" | 563 sessions × 50-100 steps × 3 channels = 0 divergences |
| **Time to know if a fix worked** | Re-run, visually inspect | `npm test` → exact pass count |
| **Specificity of failure** | "map doesn't look right" | "diverges at call 10148 in session seed301, P channel only" |
| **Human cognitive load** | High (must evaluate quality) | Low (number tells the story) |

The central insight: making agent work verifiable didn't just improve quality — it changed the nature of the collaboration. The human became a target-setter and exception handler, not an evaluator. The agent became a metric-optimizer with a clear, measurable definition of success. Every quantitative commit message is evidence that this handoff worked.
