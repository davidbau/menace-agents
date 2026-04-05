# Precise Timeline and Visualization Specifications

## The Interleaved Timeline

This is the exact sequencing of key events, showing how they overlapped:

```
Feb 6:  PROJECT STARTS. Playable JS NetHack by end of day 1.
Feb 7:  Guidebook, spoilers, multi-level PRNG alignment.
Feb 8:  C comparison harness begins. Map-level comparison.
Feb 9:  LUA→JS COMPILER created (125/133 files, 93% day 1).
        345 commits in one day — the most productive single day.
Feb 10: Lua compiler declared successful (99.2%). PRNG 100% milestone.
Feb 12: Regression noted: "oh no, down to 17 instead of 19 maps."
Feb 14: 4/19 gameplay sessions passing. 154/173 total tests.
        Session recording infrastructure solidifying.

Feb 16: REPLAY_CORE.JS CREATED. 1,682 lines by end of day.
        │ This is Day 0 of the "religion."
        │
Feb 17: replay_core reaches 1,845 lines. 19 gameplay sessions failing.
Feb 18: replay_core at 1,967 lines. Human: "why is replay_core getting LARGER?"
Feb 20: replay_core peaks at 2,879 LINES. ← THE PEAK OF THE RELIGION
        Human: "I hate this test-only execution rule."
        │
Feb 22: │ FIRST MAJOR REMOVAL: -530 lines from replay_core.
        │ One test regresses: "a real parity bug... previously masked."
Feb 23: │ 17 failing gameplay sessions. Human: "ah, down to 17!"
Feb 24: │ 18 failures. Human: "overfitting makes you susceptible."
        │
Feb 26: ├─── IRON PARITY LAUNCHES (C→JS translator with AST lowering)
Feb 27: │    Iron Parity branch merged to main.
        │
Mar 1:  │    18 failures (regression from 14). Human: "a regression!"
        │
Mar 2:  ├─── ASYNC REVOLUTION BEGINS
        │    "Add await to 28 unawaited async function calls"
        │    "Propagate async/await across all pline call sites"
        │    "--More-- message queueing and async pline infrastructure"
        │    1,081 human messages — the most interactive single day.
        │    Human: "the goal is fidelity to the C, not overfitting"
        │
Mar 3:  ├─── REPLAY_CORE COLLAPSES TO 211 LINES ← THE CLEANUP
        │    "Remove replay_core.js display cruft"
        │    "Rewrite replay_core.js as game-agnostic engine"
        │    Human: "removing cruft will stop masking the real bugs"
        │
Mar 4:  └─── IRON PARITY DECLARED UNSUCCESSFUL
             "considered unsuccessful as primary execution strategy"

Mar 5:  CONSTANTS WORK begins. Auto-import from C headers.
        Human: "I like this project — we've been chasing replay_core
        issues this whole project. A tax I would like to be free of."

Mar 6:  ROGUE PORT STARTS. C harness built. 22 sessions by Mar 7.
        HACK PORT STARTS. Phase 0 scaffold.
        245 commits — second most productive day.

Mar 7:  Rogue: 22/22 sessions at 100% screen parity in ONE DAY.
Mar 7-11: Autotranslation bug cleanup (20+ CRITICAL fixes).

Mar 8-11: FOUR AUTONOMOUS DAYS. Zero human messages. 942 commits.
          Agents self-directed. 313/313 sessions by Mar 11.

Mar 9:  151/151 sessions passing (after expansion).
Mar 11: 313/313 passing. Constants import campaign (20+ commits).
        44 LORE lessons — biggest learning day.

Mar 14: SHELL EASTER EGG created. "A little unix shell simulation."
        202/202 sessions at 100% screen parity.

Mar 15-17: ZORK SPEEDRUN DISTRACTION.
           Agents build speedrun instead of fixing seed031-033.
           (The avoidance pattern in action.)

Mar 18: THE CONFRONTATION.
        Human: "I do not want you to avoid the difficult work."
        Human: "We should not fear this work."
        Human: "I will have you work under the opus model."
        Before: 0% of commits reference hard seeds.
        After: 21% of commits reference hard seeds.
        SONNET → OPUS MODEL UPGRADE for hard problems.

Mar 19-20: C harness bugs discovered. Sessions rerecorded.

Mar 21: LOGO INTERPRETER created. "1982-era Logo with turtle graphics."

Mar 22: 25 LORE lessons all on seed031. Peak debugging intensity.

Mar 24: Rogue reaches 211/211 (100%). seed031 passes!

Mar 25: seed031 confirmed passing. 274/274 gameplay sessions.
        Menace-agents timeline project begins.

Mar 26: ASYNC CASCADE: 400+ awaits, 200+ functions made async.
        "Complete async cascade — await all 70 violations across 28 files."

Mar 27: MENACE-AGENTS ANALYSIS PROJECT created.
        64-day retrospective analysis begins.

Mar 28: Strategy effectiveness ranked. TELEPORT REPO CREATED.

Mar 29: TELEPORT DAY 1. 4-agent swarm begins.
        Game loop with correct phase ordering from hour 1.

Mar 30: Teleport Day 2. 5/7 triple-channel PASS.
        "GREAT DISPLAY CLEANUP" — the bad meme appears and is killed.
        "None of this exists in C." -136 lines removed.

Apr 4:  Teleport Day 7. 141 JS modules (vs 153 in 54-day original).
        25/28 sessions full PASS. seed800 at 55%.
```

## Key Insight: The Async Revolution and replay_core Cleanup Were SIMULTANEOUS

The async revolution (Mar 2) and the replay_core collapse (Mar 3) happened
on consecutive days. This is not coincidence: making pline/more/nhgetch async
was the PREREQUISITE for removing the replay_core hacks. The hacks existed
because the display system couldn't properly wait for user input — it faked
the waiting with boundary/epoch/latch machinery. Once async/await was
properly propagated, the real blocking behavior worked and the hacks became
unnecessary.

The Iron Parity failure (declared Mar 4) happened the very next day.
Three major events in three days: async revolution, replay_core cleanup,
Iron Parity abandoned. This was the project's inflection point.

## Visualization Specifications

### Viz 1: The replay_core.js Line Count (The Rise and Fall of the Religion)

**Type:** Area chart with annotated markers.

**X axis:** Date (Feb 8 to Mar 28)
**Y axis:** Line count (0 to 3000)
**Data points:**
```
Feb 8:     0 (not yet created)
Feb 16: 1682
Feb 17: 1845
Feb 18: 2198
Feb 20: 2879 ← PEAK (annotate: "Peak: 2,879 lines")
Feb 22: 2344 (annotate: "First removal: -530 lines")
Feb 24: 2017
Feb 26: 1121
Feb 28: 1121
Mar 1:  1098
Mar 3:   211 ← COLLAPSE (annotate: "Rewrite: 211 lines")
Mar 5:   248
Mar 10:  388
Mar 14:  426
Mar 25:  487
Mar 28:  490
```

**Color:** Red fill for the area above 500 lines (the "religion zone"),
green fill below 500 (the "healthy zone").

**Annotations:**
- Feb 20: "Human: 'I hate this test-only execution rule'"
- Mar 3: "Human: 'removing cruft will stop masking the real bugs'"
- Arrow from peak to trough: "2,668 lines of compensating complexity removed"

### Viz 2: Session Parity Progression (The Expanding Pool)

**Type:** Stacked area chart or dual-axis line chart.

**X axis:** Date (Feb 6 to Apr 5)
**Lines/areas:**
- Total sessions (growing over time): 19 → 151 → 313 → 442 → 534 → 563
- Passing sessions: tracks total closely after Mar 9 but GAP during Feb 17-Mar 8
- Failing sessions: the persistent gap (18-19 during stall, then 3, then 0/2)

**Key data points:**
```
Feb 14:   4/19 passing (15 failing)
Feb 17:   4/19 (still 15 failing)
Feb 23:   2/19 (17 failing)
Feb 24:   1/19 (18 failing)
Mar 1:    5/19 (14 failing, then regressed to 18)
Mar 4:  124/150 (pool expanding, 26 failing)
Mar 9:  151/151 (all passing after expansion!)
Mar 11: 313/313
Mar 14: 202/202 at 100% screen
Mar 17: 522/534
Mar 22: 435/442
Mar 24: 274/274 gameplay (seed031 passes!)
```

**Annotations:**
- Feb 17-Mar 8 zone highlighted: "The Stall: 18-19 failures for 3 weeks"
- Mar 9: "Breakthrough: 151/151 after session expansion"
- Mar 24: "seed031 passes!"

**Insight to convey:** The "stuck at 18" was real but the pool was also
expanding. The agents were adding easy sessions (expanding coverage)
while the hard sessions persisted.

### Viz 3: The Avoidance Pattern (Before/After Mar 18)

**Type:** Two side-by-side bar charts, or a single split bar.

**Data:**
- Mar 17 (day before confrontation): 0 commits referencing seed031/032/033
  out of 48 total commits (0%)
- Mar 18 (day of confrontation): 20 commits referencing hard seeds
  out of 85 total (24%)
- Mar 19-22: sustained hard-seed work

**Optional:** Show what agents were doing INSTEAD on Mar 15-17:
Zork speedrun (16 commits), coverage expansion (30 commits),
Shell improvements (8 commits). None on the hard sessions.

### Viz 4: Wave vs Teleport (Dual Timeline)

**Type:** Two overlapping line charts on the same time axis.

**X axis:** "Day N" (0 to 54 for wave, 0 to 7 for teleport)
**Y axis:** Percentage of sessions at 100% RNG parity

**Wave line:**
```
Day 0: 0%
Day 3: ~21% (4/19)
Day 8: first single-session 100% RNG match
Day 14: mixed (expanding pool)
Day 33 (Mar 9): 100% (151/151)
Day 46 (Mar 22): 98.4% (435/442)
Day 48 (Mar 24): 100% gameplay (274/274)
```

**Teleport line (much steeper):**
```
Day 0: 0%
Day 1: 14% (1/7 at 100%)
Day 2: 71% (5/7)
Day 3: 89% (17/19)
Day 4: 79% (15/19, more sessions added)
Day 5: 88% (21/24)
Day 7: 89% (25/28)
```

**Key insight:** Teleport's line is dramatically steeper because:
1. Infrastructure was pre-built (no bootstrap period)
2. Game loop ordering was correct from hour 1 (no replay_core religion)
3. Session format was V4 from the start (no format evolution)

### Viz 5: The "Religion" Vocabulary Frequency

**Type:** Heatmap or bar chart by week.

**Data:** Count of commits containing "boundary", "epoch", "latch", "freeze",
"deferral", "alignment", "queue" in the subject or body, per week.

```
Week of Feb 10: ~5
Week of Feb 17: ~25 (PEAK — the religion is being built)
Week of Feb 24: ~18 (still active)
Week of Mar 3:  ~12 (cleanup happening)
Week of Mar 10:  ~3 (mostly gone)
Week of Mar 17:  ~1 (residual)
Week of Mar 24:  ~0
Teleport Day 2:  ~8 (brief reappearance, killed same day)
```

### Viz 6: Human Corrections by Category

**Type:** Horizontal bar chart.

**Data (from analysis-corrections.md):**
```
Regression alarm:     30 (28.6%)  "oh no, we're down to..."
Premature action:     27 (25.7%)  "wait, hold on..."
Test overfitting:     10 (9.5%)   "don't fake-pass..."
Quality/style:        10 (9.5%)   "emdashes", "AI slop"
Complexity creep:      8 (7.6%)   "replay_core getting bigger"
Factual error:         6 (5.7%)   "the human has NO expertise"
Avoidance:             5 (4.8%)   "don't avoid the difficult..."
Scope creep:           4 (3.8%)
Process violation:     3 (2.9%)
Premature commitment:  2 (1.9%)
```

### Viz 7: Commits Per Day (Full Project)

**Type:** Bar chart, color-coded by chapter.

**X axis:** Date (Feb 6 to Apr 5)
**Y axis:** Commits (0 to 350)

**Color bands:**
- Founding (Feb 6-12): Blue
- Measurement (Feb 13-15): Teal
- Porting Grind (Feb 16-20): Green
- Codex Sprint (Feb 21-25): Yellow
- Iron Parity (Feb 26-Mar 5): Red (the failed experiment)
- Expansion (Mar 6-11): Purple (peak productivity)
- Ecosystem (Mar 12-19): Dark blue
- Convergence (Mar 20-25): Gray
- Analysis (Mar 26-28): Light gray
- Teleport (Mar 29-Apr 5): Gold

**Peak days annotated:**
- Feb 9: 345 (Lua compiler day)
- Mar 6: 245 (Rogue + Hack start)
- Mar 10: 310 (autonomous sprint)
- Apr 1: 239 (teleport batch translation)

### Viz 8: The Sub-Ports as Scale Validation

**Type:** Small-multiples or grouped bar chart.

**Shows for each game: time to 100% parity, session count, LOC**

```
                Time to 100%   Sessions   JS LOC   C LOC
Rogue 3.6       1 day          22→211    ~15K     ~8K
Hack 1982       ~1 week        122       ~25K     ~15K
NetHack 3.7     51 days        563       ~216K    ~250K
                (never 100%)
Teleport NH     7 days          28       ~117K    ~250K
                (25/28 pass)
```

**The scale lesson:** Rogue and Hack proved the methodology works.
NetHack proved it breaks at scale — not because the approach is wrong,
but because compensating complexity accumulates faster than it can be removed.

## Additional Plot Ideas

### The "oh no" frequency
A small sparkline showing when the human said "oh no" — concentrated
during the stall period and regression episodes.

### Agent model usage over time
Haiku vs Sonnet vs Opus vs Codex usage by week. Shows the Mar 18
pivot from Sonnet to Opus for hard problems.

### The menace-agents project as meta-analysis
A small timeline showing: analysis started Mar 27, 7 deep-dive studies,
teleport created Mar 28, 4-agent swarm Mar 29. The "analysis led to
action" loop.
