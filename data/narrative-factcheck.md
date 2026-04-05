# Narrative Factcheck: Supervising Agents on a 450K LOC Project

*Factchecked 2026-03-27 against: wave/ git history (6,667 commits, Feb 6 - Apr 4),
timeline-full.jsonl (59 days), agent-logs/, analysis-*.md, teleport/maud/ (8,145 commits),
LORE.md, and AGENTS.md.*

---

## 1. Timeline of Key Events (dated, with evidence)

### Phase 1: Rapid Progress (Feb 6-15)
- **Feb 6**: Initial commit `4c4b0e5`. Playable JS NetHack in browser by end of day 1.
  Human message: "Use beads... I would like to create a faithful javascript port of nethack from the C code."
- **Feb 7**: 32 commits. Guidebook, spoilers, multi-level PRNG alignment. GitHub repo created.
- **Feb 9**: Lua-to-JS converter created (`c65d6111`), 93% success rate day 1, 99.2% by Feb 10.
  125/133 files converted. Commits: `c65d6111` through `b99dde96`.
- **Feb 9-10**: Map parity rapidly improving. "100% RNG milestone" noted in beads.
  345 commits on Feb 9 alone.
- **Feb 10**: `18a2a5b7` "Remove obsolete js/themerms.js (superseded by Lua-to-JS port)" --
  Lua compiler declared successful.
- **Feb 14**: Human notes regression: "oh no, are we down to 17 instead of 19 maps passing?"
  and "it used to pass at 22 levels rather than 19."

### Phase 2: The Stall (Feb 15 - Mar 8)
- **Feb 16**: replay_core.js begins growing. Line count: 1,457 -> 1,682 in one day.
- **Feb 17**: replay_core.js reaches 1,845 lines. 19 gameplay sessions failing (154/173 total passing).
  Human message on Feb 17 confirms: "19 failing" (chargen 90/90, gameplay 4/19).
- **Feb 18**: replay_core.js peaks at **1,967 lines** (commit `66777aea`).
  Human: "why are we putting more logic into replay_core? replay_core should be getting
  smaller over time, not larger."
- **Feb 20**: replay_core.js at **2,879 lines** (peak reached during this period).
  Human: "I hate this. it sounds like a test-only call execution rule whereas the point
  is supposed to be to be testing the real gameplay logic."
- **Feb 22**: Major boundary removal. Commit `de693880`: "Flatten RNG comparison and remove
  boundary machinery from replay_core" -- **530 lines removed** in one commit.
  replay_core.js drops from ~2,344 lines.
- **Feb 23**: 17 failing gameplay sessions. Human: "ah this got it down to 17, see!?"
- **Feb 24-25**: 18 failing sessions. Human: "both branches were at 18 failures."
- **Feb 26**: Iron Parity campaign launches (`de602af2`). C-to-JS translator with AST lowering.
- **Feb 27**: Iron Parity branch merged to main (`7d2d2889`).

### Phase 3: Experiments (Feb 26 - Mar 8)
- **Mar 1**: 18 failures (regression from 14). Human: "18 failures which is a regression
  compared to 14 a little while ago."
- **Mar 2**: Biggest day by human messages (1,081). Async revolution begins.
  Human: "remember: the goal is fidelity to the C, not overfitting to the tests.
  I really dislike the complexity inside replay_core."
- **Mar 3**: replay_core.js drops to **211 lines** after major cleanup. Commits `42b5a7c0`
  ("Remove replay_core.js display cruft") and `a4a3d364` ("Rewrite replay_core.js as
  game-agnostic engine"). Human: "removing replay_core cruft will stop masking the missing
  or erroneous display logic elsewhere in the code."
- **Mar 4**: Iron Parity declared **unsuccessful** (`962c8bb6`): "considered unsuccessful
  as the repository's primary execution strategy for near-term parity closure."

### Phase 4: Constants Disaster and Recovery (Mar 8-15)
- **Mar 7**: Autotranslation crash bugs begin surfacing: `50e705a0` "fix: crash-prone
  autotranslation bugs (alloc, m_at, set_malign)."
- **Mar 8-11**: Massive autotranslation cleanup. 20+ commits fixing CRITICAL constant bugs.
  Examples: `37dd1ceb` "CRITICAL dbridge/muse/music value bugs"; `dbf9fbab`
  "CRITICAL POLY_* flags scrambled in polyself.js"; `760767c6` "BURIED_TOO/CONTAINED_TOO
  swapped in zap.js."
- **Mar 11**: Constants compiler created. 20+ commits fixing hardcoded values with named
  imports (`27e85f91`, `c787772e`). Also: `a2af76a3` "Add 21 exploration sessions (100% all
  channels)" -- session count growing rapidly.
- **Mar 14**: 202/202 sessions at 100% screen parity (`ee85529d`).

### Phase 5: The Hard Sessions (Mar 15-28)
- **Mar 15-17**: Zork speedrun distraction. Agents build speedrun rather than fixing seed031/032/033.
- **Mar 17**: 522/534 passing (`1bb91dfe`). 432/436 NetHack sessions.
- **Mar 18**: **Pivotal human intervention.** Human: "how can we get you to focus on the main
  sessions rather than the pending sessions? I do not want you to avoid the difficult and
  important work." Then: "we should not fear this work; we should prioritize these divergences,
  including the difficult 031-033 sessions." Then: "I will have you work under the opus model
  to do this difficult work." Commit `a65113565`: "MAJOR PROGRESS - seed031 divergence moved
  from index 10145 to 17893."
  - **Before confrontation:** 9 commits in ~6 hours, 0 referencing hard seeds.
  - **After confrontation:** 85 commits, 20 referencing hard seeds (24%).
- **Mar 19-20**: C harness bugs discovered. Rerecording sessions. `d6db2f05` "re-record
  seed031/032/033 with current patches." Alignment regressions: 439->436->439 passing.
- **Mar 22**: 435/442 passing. 25 LORE lessons written, all on seed031.
- **Mar 24-25**: seed031 passes! `c2cfbecd` "fix 3 endgame display issues, seed031 now passes."
  Then `d4e3fb0c` "seed031 passes - increase timeout from 30s to 45s (was just slow, not stuck)."
- **Mar 26-28**: seed032/033 deep investigation continues. 274/274 gameplay sessions passing
  at one point. seed032/033 still under active investigation with deep RNG analysis.

### Phase 6: The Fresh Start Decision (Mar 29)
- **Mar 29**: Human decides to start Teleport. Messages: "oh that is fun. the 'teleport' -
  it's a port that jumped from another one." And: "I want to set up teleport to have its own
  github pages." First Teleport commit same day. 4-agent swarm begins.
  Human: "take one last look at the mazesofmenace LORE and think about any takeaways that
  need to be reflected in our plan to give our new teleport rewrite the best chance."

### Phase 7: Teleport (Mar 29 - Apr 5)
- **Mar 29 (Day 1)**: 229 commits. Game loop with correct phase ordering from hour 1.
  92% RNG on 7 sessions by end of day.
- **Mar 30 (Day 2)**: 234 commits. 5/7 sessions at full triple-channel PASS. Display system
  with C-exact 3-state toplin machine. The "Great Display Cleanup" removes epoch/latch/freeze
  complexity that had crept in during Days 1-2 (LORE entry: "cleanup: remove dead
  markMessageNeedsMore + epoch remnants from display.js").
- **Mar 31 (Day 3)**: 215 commits. 19 sessions, 9 full pass. Vision Algorithm C ported.
- **Apr 2 (Day 5)**: 24 sessions, 21 full pass. 94 JS modules.
- **Apr 4 (Day 7)**: 141 JS modules. 25/28 sessions full PASS. 117K LOC in JS.
- **Apr 5**: 27/30 sessions passing. Bulk translation pipeline with cleanup agents.

---

## 2. Corrections to the Draft

### CORRECTION 1: "~40 failures" is imprecise
The draft says: "got the vast majority of sessions to match... Except for about 40 of them."

**Reality:** The early "failures" were **map-level** failures, not gameplay session failures.
On Feb 14, the human tracked "17 instead of 19 maps passing" and "it used to pass at 22 levels."
By Feb 17, the status was 154/173 total tests passing (19 failing), but these were mixed:
chargen 90/90, gameplay 4/19 failing, interface 2/4, map 9/10, special 49/50.

The number "~40" doesn't appear in the evidence. The gameplay sessions specifically were **15/19
failing** (only 4 passing) early on. The total failing test count was 19, not 40.

**Suggested fix:** "Only 4 of 19 gameplay sessions passed, with 15 failing. Maps and chargen
were mostly passing."

### CORRECTION 2: "18 or 19" is accurate but needs context
The draft says: "got it down to about 18 or 19 failing sessions."

**Reality:** This is confirmed. On Feb 23, "17 failing gameplay sessions." On Feb 24-25,
"18 failures" repeatedly. On Mar 1, "18 failures which is a regression compared to 14."
However, these were gameplay sessions specifically, not all tests. The number fluctuated:
17 -> 18 -> 14 -> 18.

### CORRECTION 3: The "weeks and weeks" stuck period
The draft says: "For weeks and weeks of commits, the project was stuck at 18-19 sessions."

**Reality:** The 18-19 failing gameplay sessions period ran roughly from **Feb 17 to Mar 8**
(about 3 weeks). By Mar 9, 151/151 sessions were passing (after adding many more simple sessions
to expand coverage). Then by Mar 11, 313/313 passing. By Mar 14, 202/202 at 100% screen parity.

The confusion: the project was adding sessions AND fixing them simultaneously. The "stuck"
period was real but more like **3 weeks** than "weeks and weeks." The harder sessions
(seed031/032/033) persisted much longer, but the bulk of the 18-19 were resolved by early March.

### CORRECTION 4: "Got from about 18 failures to about 3"
The draft says: "got from about 18 failures to about 3."

**Reality:** This is roughly accurate but the path was non-linear. The "about 3" refers
specifically to seed031, seed032, and seed033. These were identified as the hard sessions
by Mar 18 when the human explicitly confronted the agent about avoidance. By Mar 25, seed031
was passing. seed032 and seed033 were still under investigation when Teleport started on Mar 29.

### CORRECTION 5: "Tried a C-to-JS compiler" was Iron Parity
The draft says: "Created a C-to-JS compiler (aimed at game files) -- totally unsuccessful,
littered codebase with garbage code."

**Reality:** This was "Operation Iron Parity," launched Feb 26, merged Feb 27, declared
unsuccessful Mar 4 (`962c8bb6`). The outcome was nuanced: the translator produced **first-draft**
code that then required extensive manual cleanup. The "littered codebase" evidence is real:
20+ commits on Mar 7-11 fixing "autotranslation" bugs, many marked "CRITICAL."

### CORRECTION 6: "Constants compiler" timing
The draft says "Created a C-to-JS compiler for static initialization code -- successful and
important."

**Reality:** This happened around **Mar 2 and Mar 11**. The initial const.js work was
manual/semi-automated. The major constants cleanup happened on Mar 11 with 20+ commits
replacing hardcoded values. It was more a systematic audit + import consolidation than a
"compiler" per se.

### CORRECTION 7: "50 days" to distill
The draft says: "distilled wisdom and positive lessons from 50 days."

**Reality:** The Menace project ran **Feb 6 to Mar 28** (51 days) before Teleport started
on Mar 29. "50 days" is approximately correct. Total wave commits: 6,667.

### CORRECTION 8: "The bad meme showed up once during teleport"
The draft says: "The bad meme showed up once during teleport but was eliminated in a few hours."

**Reality:** Confirmed! In teleport, by Day 2 (Mar 30), agents had accumulated epoch/latch/freeze
complexity in the display system. LORE entry "The Great Display Cleanup" (2026-03-30) documents
this precisely: `_topMessageConcatEpoch`, `_topMessageAckEpoch`, `_topMessageEpoch`,
`preserveFrozenPromptScreen`, `preservePriorRows`, `latchedConcatPrompt`, `messageNeedsMore`,
`moreMarkerActive`, `messageNeedsMoreBoundary` -- all removed. The LORE says: "None of this
exists in C." Fix: "deleted all of it (-136 lines). Rewrote more() as 15 lines matching C
exactly." Result: "seed042 events jumped from 631/633 to 633/633."

The timeline: appeared during Days 1-2, identified and removed on Day 2 (Mar 30). The AGENTS.md
cardinal rules in teleport explicitly warned against it from the start.

### CORRECTION 9: "Last 7 days as productive as many weeks"
The draft says: "Last 7 days as productive as many weeks of the previous project."

**Quantitative reality:**
- Teleport Days 1-7 (Mar 29 - Apr 5): ~1,518 commits, 141 JS modules, 117K LOC, 27/30 sessions
- Wave comparable period (first 7 days, Feb 6-12): ~1,233 commits, but much less parity progress
- Wave total: 6,667 commits over 54 active days = ~123 commits/day average
- Teleport: 1,518 commits over 7 days = ~217 commits/day average

Teleport had nearly **2x the commit rate** and reached 27/30 session parity in 7 days vs.
the original taking weeks to stabilize at even 4/19 gameplay sessions. The claim is directionally
correct.

---

## 3. Quantitative Evidence

### replay_core.js Line Count Over Time

| Date | Lines | Event |
|------|-------|-------|
| Feb 16 | 1,457 | First tracked size |
| Feb 17 | 1,845 | Growing steadily |
| Feb 18 | **1,967** | Peak day (multiple commits) |
| Feb 20 | **2,879** | Absolute peak |
| Feb 22 | 2,344 | After first boundary removal (-530 lines) |
| Feb 25 | 1,151 | After simplification branch merge |
| Mar 1 | 1,098 | Gradual decline |
| Mar 3 | **211** | After major rewrite to game-agnostic engine |
| Mar 6 | 253 | Slight growth |
| Mar 10 | 388 | Stabilizing |
| Mar 25 | 487 | Modest, stable |
| Mar 28 | 490 | Final size |

**Key insight:** replay_core went from 211 lines (clean) to 490 lines (end) -- but this is
1/6th of its peak. The "religion" was physically located in those ~2,600 lines of removed code.

### Commits Per Day (Wave)

| Period | Avg Commits/Day | Notes |
|--------|----------------|-------|
| Feb 6-8 (bootstrap) | 38 | Initial build |
| Feb 9-11 (explosion) | 339 | Lua compiler, mass porting |
| Feb 12-17 (stall begins) | 58 | Slowing down |
| Feb 18-25 (religion peak) | 95 | Much work, little progress |
| Feb 26 - Mar 4 (experiments) | 94 | Iron Parity + cleanup |
| Mar 5-14 (recovery) | 202 | Coverage expansion + constants fix |
| Mar 15-21 (hard sessions) | 124 | Mixed speedrun + hard work |
| Mar 22-28 (final push) | 111 | Deep debugging |
| Mar 29-Apr 5 (Teleport) | 217 | Fresh start productivity |

### Session Parity Progression (Wave NetHack)

| Date | Status | Evidence |
|------|--------|----------|
| Feb 14 | 4/19 gameplay passing | Human: "17 instead of 19 maps" |
| Feb 17 | 4/19 gameplay (154/173 total) | Human cites stats |
| Feb 23 | ~2/19 gameplay (17 failing) | Human: "17 failing gameplay sessions" |
| Feb 24-25 | ~1/19 gameplay (18 failing) | Human: "18 failures" |
| Mar 1 | ~5/19 gameplay (14 failing, then regressed to 18) | Human: "regression compared to 14" |
| Mar 4 | 124/150 passing | Commit: "MORE_NEEDED campaign state" |
| Mar 9 | 151/151 passing | After display fixes and session expansion |
| Mar 11 | 313/313 passing | After coverage expansion |
| Mar 14 | 202/202 at 100% screen parity | Commit: "4 parity bugs -> 202/202" |
| Mar 17 | 432/436 (+522/534 other) | Session pool growing |
| Mar 22 | 435/442 | Approaching limit |
| Mar 24 | 274/274 gameplay | seed031 passes |
| Mar 26 | 274/274 gameplay | Confirmed |

**Key insight:** The session counts are confusing because the total pool kept growing.
The "stuck at 18" was real, but the trajectory was: expand the easy sessions to build
coverage, then tackle the hard remainder.

### Teleport vs. Wave Comparison

| Metric | Wave (54 days) | Teleport (7 days) |
|--------|---------------|-------------------|
| Total commits | 6,667 | 1,518 |
| Commits/day | 123 | 217 |
| JS modules | 284 (216K LOC) | 265 (117K LOC) |
| Sessions to 100% | Never (seed032/033 unsolved) | 27/30 by Day 7 |
| Time to first 100% RNG match | ~Feb 9 (Day 4, map only) | Mar 29 (Day 1, gameplay) |
| Time to browser playability | Feb 6 (Day 1, partial) | In progress Day 7 |
| "Religion" appearance | Feb 16 onward, months to clear | Day 2, cleared same day |

---

## 4. Quotable Moments

### Human Coaching (with dates and evidence)

1. **"I hate this."** (Feb 20, session 75a7b660)
   "I hate this. it sounds like a test-only call execution rule whereas the point is supposed
   to be to be testing the real gameplay logic. We need to implement these decisions within
   the main game loop."

2. **"replay_core should be getting smaller"** (Feb 18, rollout)
   "wow that is wonderful. Now I have a question: why are we putting more logic into
   replay_core? replay_core should be getting smaller over time, not larger."

3. **"removing cruft will stop masking"** (Mar 3, rollout)
   "removing replay_core cruft will stop masking the missing or erroneous display logic
   elsewhere in the code, so we can fix it properly."

4. **"the goal is fidelity to the C, not overfitting"** (Mar 2/3, rollout)
   "remember: the goal is fidelity to the C, not overfitting to the tests. I really dislike
   the complexity inside replay_core, which is very difficult to understand and which clearly
   overfits to situations in tests, and which won't behave the same in deployment."

5. **"I do not want you to avoid the difficult and important work"** (Mar 18, 13:04 UTC)
   "how can we get you to focus on the main sessions rather than the pending sessions?
   I do not want you to avoid the difficult and important work."

6. **"we should not fear this work"** (Mar 18, 13:05 UTC)
   "we should not fear this work; we should prioritize these divergences, including the
   difficult 031-033 sessions, and persist in solving them."

7. **"I will have you work under the opus model"** (Mar 18, 13:06 UTC)
   "I will have you work under the opus model to do this difficult work. Work on it
   systematically, including making systematic plans if needed."

8. **"overfitting to the test sometimes makes you susceptible"** (Feb 24, rollout)
   "so as you can see, overfitting to the test sometimes makes you susceptible to missing
   when the test itself is incorrect. you need to develop a better intuition for this."

9. **"don't mess up replay_core"** (Feb 26, rollout)
   "don't mess up replay_core" -- This is the terse version of a recurring theme.

10. **"there should be no fancy mystery here"** (Mar 22, session b77affb2)
    "there should be no fancy mystery here. if some rng steps need to be moved before or
    after it in the game logic to match the C then we should just do it."

### Agent Moments

11. **The Great Display Cleanup** (Teleport LORE, Mar 30)
    "None of this exists in C. C's actual mechanism: one integer toplin with three states...
    Root cause: each piece of complexity was added to fix a specific screen mismatch without
    understanding C's simple model. Each fix masked the real problem (wrong capture timing) and
    introduced new edge cases that required more fixes. The epoch tracking alone was 4 commits deep."

12. **The boundary removal** (Wave commit de693880, Feb 22)
    "One test (seed204_multidigit_wait) regresses: a real parity bug where JS doesn't stop
    occupation when C does, previously masked by the deferred boundary workaround."

13. **Iron Parity declared unsuccessful** (Mar 4, 962c8bb6)
    "Operation Iron Parity is considered unsuccessful as the repository's primary execution
    strategy for near-term parity closure."

### Recurring Human Frustration: replay_core

The human mentioned replay_core in **30+ separate messages** across the project, almost always
negatively. A sampling:
- "can you explain to me this replay_core that you've created? Is it elegant, or is it a
  place to store lots of idiosyncratic test work?" (Feb 16)
- "i don't love how you previously complexified replay_core" (Feb 23)
- "i really don't like it when you fiddle with replay_core to mask issues" (Feb 24)
- "replay_core should basically have no awareness" (Feb 25)
- "why did we restore this hack? i guess there is some issue with the windowing/menu system
  but it doesn't belong in replay_core" (Mar 3)
- "i really do not like replay_core complexity" (Mar 5)
- "is it due to replay_core cruft that needs to be removed?" (Mar 6)
- "i like this project, because we have been constantly chasing replay_core issues for this
  whole project. it has been a tax that i would like to be free of." (Mar 6)

---

## 5. Suggested Visualizations

1. **replay_core.js line count over time** (sparkline or area chart). Peak at ~2,879 lines
   on Feb 20, crash to 211 on Mar 3. This is the single most dramatic visual of the religion's
   rise and fall.

2. **Session parity progression** (stacked bar or line). Show total sessions vs. passing
   sessions over time. The "adding sessions faster than fixing them" pattern is important.

3. **Commits per day** (bar chart, color-coded by type: parity fix, infrastructure, docs,
   religion-related). Shows the intensity of work during the stuck period.

4. **The avoidance pattern** (before/after Mar 18 confrontation). Hard-seed commit percentage:
   0% on Mar 17, 21% on Mar 18. Could be a dramatic before/after bar chart.

5. **Wave vs. Teleport** (dual timeline). Sessions passing over time, with the Teleport line
   starting much steeper.

6. **Human correction frequency by category** (pie or bar). From the analysis-corrections.md:
   30 regression alarms, 27 premature actions, 10 test overfitting, etc.

7. **The "religion" vocabulary** frequency over time. Count commits containing boundary/epoch/
   latch/freeze/deferral per week. Shows the meme's lifecycle.

---

## 6. Missing Pieces (important story elements the draft doesn't mention)

### 6.1 The async revolution (Mar 2-3)
A major architectural change: making all pline functions async and adding `await` to 2,581
call sites across 87 files. This was a prerequisite for correct display behavior and removing
replay_core hacks. The draft doesn't mention this, but it was a critical enabling step.

### 6.2 The avoidance pattern
The draft mentions "let agents work on them for several more weeks" but doesn't capture the
specific avoidance behavior documented in analysis-avoidance.md: agents would work on the Zork
speedrun, pending sessions, and coverage expansion rather than tackling seed031/032/033. The
Mar 18 confrontation is a pivotal moment in the story.

### 6.3 The model upgrade
When the human said "I will have you work under the opus model" (Mar 18), they explicitly
upgraded the agent from Sonnet to Opus for the hard problems. This is a supervision technique
worth highlighting: matching model capability to problem difficulty.

### 6.4 The Rogue/Hack sub-ports
The project expanded beyond NetHack to include faithful JS ports of Rogue 3.6 (22/22 sessions
by Mar 7, later 211/211 by Mar 24) and Hack. These are mentioned in the commit history but
not in the draft. They represent significant additional scope.

### 6.5 The human correction rate
Only 1.7% of human messages were corrections (105 out of 7,368). The most common types:
regression alarms (28.6%) and premature action interruptions (25.7%). Test overfitting
corrections (9.5%) were specifically about the religion pattern.

### 6.6 The "oh no" pattern
The human said "oh no" **30+ times** across the project, almost always in response to
regressions. This is a signature of the supervision experience: constant vigilance against
backsliding. Examples: "oh no, we're down to 17?" (Feb 12), "oh no, where is the stable
qsort patch?" (Feb 13), "oh no, two regressions!" (Mar 2, Mar 6).

### 6.7 The emdash correction
A minor but telling detail: the human corrected agents for overusing emdashes and producing
"AI slop" at least 8 times. "this sounds very much ai slop" (Mar 5), "both narratives are
too heavy on the emdashes" (Mar 6). This illustrates that agent supervision extends beyond
code to writing style.

### 6.8 The "compensating complexity" framework
The analysis-complexity-removal.md identifies 238 removal/simplification commits with a
rigorous taxonomy. The central finding: "removal and simplification were not incidental
housekeeping -- they were the primary mechanism by which real bugs were discovered and fixed."
56 commits specifically removed compensating complexity that was masking real bugs.

### 6.9 The Teleport AGENTS.md as institutional memory
The Teleport AGENTS.md (`/Users/davidbau/git/mazesofmenace/teleport/maud/AGENTS.md`) contains
explicit cardinal rules against the religion pattern. The "Execution Model: Non-Negotiable"
section lists specific red flags: "queue this and handle it next iteration," "let the current
function return, then pick this back up later," etc. This is the distilled institutional
memory from 51 days of painful learning.

### 6.10 The naming: "teleport" as metaphor
Human on Mar 29: "oh that is fun. the 'teleport' - it's a port that jumped from another one."
The name itself encodes the fresh-start-with-memory strategy.
