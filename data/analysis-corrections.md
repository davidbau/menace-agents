# Human Corrections and Behavioral Debugging in LLM-Assisted Coding
## A Comprehensive Catalog and Analysis

*Dataset: 48 days (Feb 6 – Mar 25, 2026), 7,448 human events, Mazes of Menace project (JS port of NetHack)*

---

## Overview

This analysis catalogs every identified human correction across the full 48-day dataset. A "correction" is defined as a human message that pushes back on agent behavior, redirects approach, expresses alarm about regression, questions agent judgment, or corrects quality. Out of 7,368 substantive human messages (excluding agent-generated plans piped back through the harness), **125 corrections** were identified — a rate of approximately **1.7% of messages**.

The corrections cluster in the early-to-mid porting phase and during intensive collaborative debugging sessions. A distinctive feature of this dataset is that many "corrections" are not failures of understanding but rather real-time course corrections during exploratory pair programming — the human and agent working through a problem together, with the human catching drift before it becomes costly.

---

## Part A: Complete Correction Catalog

**Total corrections identified: 105** (by strict pattern matching; broader estimates reach ~125)

The catalog is organized chronologically within each category. Session IDs are truncated to 8 characters.

### Regression Alarms (30 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-09 | c2410382 | "it's urgent that maps pass. what did we do wrong? It used to pass perfectly." |
| 2026-02-10 | ff12e7e0 | "340 seems like a regression? or am i misunderstanding?" |
| 2026-02-12 | rollout | "oh no, we're down to 17? another two regressions." |
| 2026-02-12 | rollout | "when did it go down to 17? it used to be 19." |
| 2026-02-13 | rollout | "oh no, where is the stable qsort patch? maybe a different developer is working on that" |
| 2026-02-14 | rollout | "oh no, are we down to 17 instead of 19 maps passing?" |
| 2026-02-14 | rollout | "it used to pass at 22 levels rather than 19, and a few hours ago we regressed. can you find where that happened?" |
| 2026-02-14 | rollout | "oh no, this is no good; is this a merge problem?" |
| 2026-02-15 | c6408e4e | "oh no. ok tell me what is the history on the claude2 branch?" |
| 2026-02-22 | rollout | "did you notice we are down to 20 failures?" |
| 2026-02-23 | rollout | "i thought we had 19 or 17 failing sessions. is this a regression?" |
| 2026-02-24 | rollout | "oh no; so will this lead to a lot of loss of screen parity in tests?" |
| 2026-03-01 | b235d53d | "seed104 seems like a regression." |
| 2026-03-01 | rollout | "Several tests that used to pass at f2e87c59 seem to have regressed, including seed102_barbarian..." |
| 2026-03-02 | rollout | "oh no i see. what a mess." |
| 2026-03-02 | rollout | "oh no, two regressions!" |
| 2026-03-03 | d02b4bad | "oh no, let me answer please, let's start again; i'll kill the session." |
| 2026-03-04 | rollout | "oh no do you mean the session doesn't ask about tutorials?" |
| 2026-03-05 | 41da0700 | "oh no, let's not copy. Let's normalize names at the same time." |
| 2026-03-06 | f3701edf | "oh no there are 12 new ones / that is great. let's get those new sessions to 100% also" |
| 2026-03-06 | rollout | "oh no, two regressions!" |
| 2026-03-06 | f3701edf | "oh no. this seems like a bug. 'The levl[80][22] global is never zeroed between calls' — this is a pretty serious bug." |
| 2026-03-06 | f3701edf | "oh no, it can go to the tombstone and score, but after that it should 'return' to the shell." |
| *(7 more)* | | |

### Premature Action / Interruption (27 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-07 | dd7c6d11 | "wait, back on the original seed, did the play include walking into a hallway?" |
| 2026-02-09 | 6639363f | "hold on, the shop branch has it. i want you to compare it to our js conversion script." |
| 2026-02-11 | b63c62a0 | "wait, when i look at the game ui now, the menu is no longer on top of the game but incorrectly to its left!" |
| 2026-02-11 | 17db3b6e | "actually let's stop this for a moment. I'll ask in a session where it can be run more easily." |
| 2026-02-13 | rollout | "but hold on" |
| 2026-02-13 | rollout | "wait, where is the quicksort stability patch? oh gosh i think you might be out of date." |
| 2026-02-14 | 6afb1a2d | "wait, the dashboard is confusing to me because i thought all the types of tests are part of the unit tests" |
| 2026-02-14 | 6afb1a2d | "wait, did you regenerate all the session files? and update the test runner? why only 23 session files?" |
| 2026-02-18 | rollout | "right right ok hold on, why does it say string '(nhlib.lua)'" |
| 2026-02-24 | rollout | "hold on - tests are very regressed." |
| 2026-03-01 | b235d53d | "oh hold on - the summary stats at the bottom are wrong when running with --failures" |
| 2026-03-01 | rollout | "actually let's stop that one. let's make it Tutes the Wizard" |
| 2026-03-02 | rollout | "ah hold on" |
| 2026-03-02 | rollout | "ok hold on. how many constants are still manual in const.js?" |
| 2026-03-02 | rollout | "ok hold on -" |
| 2026-03-02 | rollout | "hold on. what if we kill it at step 409-410-411-412, just to see what the local interaction would be?" |
| 2026-03-02 | rollout | "hold on  hold on" |
| 2026-03-06 | 562b1b8b | "wait, did we create an issue to audit and clone monmove faithfully from the C?" |
| 2026-03-06 | c6294340 | "hold on - i want to see what line annotations there were for this change." |
| 2026-03-06 | f3701edf | "hold on so hack/lev.js and main.js - there was a change a while ago to make sure all the levels are not identical" |
| 2026-03-19 | c22c3452 | "no, hold on. but you didn't run through to #name did you? you haven't gotten to the point that triggers the problem." |
| 2026-03-21 | 43365263 | "ok hold on. there are timeouts. maybe because there are too many abandoned test processes." |
| 2026-03-22 | b77affb2 | "hold on - i didn't want you to push any of that - I wanted to know which github repo it came from" |
| *(4 more)* | | |

### Test Overfitting (10 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-13 | rollout | "why did they soft-pass them? i don't want to fake-pass the tests. i want the passes to be for real alignment." |
| 2026-02-24 | rollout | "are you overfitting to the test" |
| 2026-02-24 | rollout | "(don't overfit to the test)" |
| 2026-02-24 | rollout | "it was overfit to the test!" |
| 2026-02-24 | rollout | "so as you can see, overfitting to the test sometimes makes you susceptible to missing when the test itself is incorrect. you need to develop a better intuition for this. Let's note it in LORE." |
| 2026-03-02 | ec697b98 | "remember: the goal is fidelity to the C, not overfitting to the tests. I really dislike the complexity inside replay_core, which is very difficult to understand and which clearly overfits to situations in tests, and which won't behave the same in deployment." |
| 2026-03-02 | rollout | "i don't want you to overfit on tests" |
| 2026-03-02 | rollout | "to avoid overfit we just want to make sure the logic is faithful to C" |
| 2026-03-06 | rollout | "we need to be brave and stick to fixes that we know are right, but that trigger tricky test regressions. These regressions tell us more about the fact that tests were being masked, that we were overfitting to the tests." |
| 2026-02-20 | 75a7b660 | "I hate this. it sounds like a test-only call execution rule whereas the point is supposed to be to be testing the real gameplay logic. We need to implement these decisions within the main game loop." |

### Complexity Creep (8 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-13 | rollout | "i think i want to keep it simple, but if I use just regular repo issues, is there a way an agent can search for all the issues currently assigned to themselves?" |
| 2026-02-15 | c6408e4e | "i wonder if a lot of tests will fail if simulateTurnEnd has grown too complex." |
| 2026-02-15 | c6408e4e | "and how about oracle.js - can we simplify it dramatically?" |
| 2026-02-18 | rollout | "what is the change in replay_core? I hope you have found ways to reduce and simplify it rather than making it more complex." |
| 2026-02-24 | rollout | "we don't need compatibility: we need to simplify the replay core so it doesn't do much." |
| 2026-03-02 | 1b410e9a | "we will keep it simple and faithful to the appearance of prng and events in C before and after --More--" |
| 2026-03-21 | e9733015 | "in reflections, simplify the opening '... handed the agent the old PDP code and told it to go.'" |
| 2026-03-24 | rollout | "if there are closely related patches that should be merged, we can do that also, to simplify that patching sequence" |

### Quality / Style (10 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-07 | f70e7bd4 | "I don't love the first subtitle... it is a bit wordy and not quite lighthearted enough... As we all know you tend to use emdashes too much" |
| 2026-02-07 | b9a9a43c | "i like #6 also but without the emdash; with a colon would be better." |
| 2026-03-05 | 41da0700 | "this sounds very much ai slop" |
| 2026-03-06 | f3701edf | "both narratives are too heavy on the emdashes and a bit of ai slop" |
| 2026-03-06 | 60203107 | "the rogue history reads a bit like AI slop - heavily promotional and breathless - rather than with the curiosity, wit, and levity I'm looking for." |
| 2026-03-06 | 60203107 | "the main README for the overall project doesn't get to the point of the project quickly enough." |
| 2026-03-06 | f3701edf | "instead of an emdash, say it drew a map, with corridors, rooms..." |
| 2026-03-06 | f3701edf | "use commas instead of emdash at the start. Don't get into the details of the complications." |
| 2026-03-06 | f3701edf | "write the whole word NETHACK out horizontally. The slop on the K needs to be a little slopier." (Note: "slop" here means graphic slope) |
| 2026-03-21 | e9733015 | "How about less slop, like 'As soon as you type something, the computer does it.'" |

### Factual Error (7 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-12 | d4dd5123 | "i don't think we should show the last visible section; e.g. if two sections both start on the screen, we should show the first one." |
| 2026-02-14 | 6afb1a2d | "oh i misunderstood. so it sounds like the sessions are in. are they pushed?" (self-correction) |
| 2026-02-24 | rollout | "no that's not right. what is the signature of the comparator for arr.sort()?" |
| 2026-03-04 | rollout | "I had incorrectly misunderstood that --More-- was missing from the C but now that you point out that --More-- is missing from the js, the rerecording makes sense." |
| 2026-03-06 | 562b1b8b | "actually, the approach of restructuring do_attack() to accept a pre-attack callback is wrong here." (human correcting agent's proposed abstraction) |
| 2026-03-14 | 6d483e01 | "no, this is the time to work on it. i think the thing to do is to try taking an idle turn before pressing the triangle button." |

### Scope Creep (6 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-12 | rollout | "is there a test script we were running, or did you just do that yourself?" |
| 2026-02-13 | rollout | "no let's just fix this one" |
| 2026-03-02 | rollout | "just fix the sessions that were already working" |
| 2026-03-02 | rollout | "we should add a skill that captures what we just did: to debug a boundary ordering issue..." (prescribing narrow scope) |
| 2026-03-06 | rollout | "i have wondered if we should just void full-screen rerender either fully or only do it when it is at a turn boundary" |
| 2026-03-22 | b77affb2 | "there should be no fancy mystery here. if some rng steps need to be moved before or after it in the game logic to match the C then we should just do it." |

### Agent Judgment (3 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-18 | rollout | "Why are you proposing to remove all of these session files?" |
| 2026-03-02 | rollout | "why did you commit so fast before running tests?" |
| 2026-03-24 | rollout | "ok please finish the process here; why did you pause?" |

### Process Violation (2 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-10 | 3a049401 | "ok don't commit it disabled without understanding how it impacts other tests. but you can disable it temporarily." |
| 2026-02-11 | 0242c9a6 | "Don't commit and push unless it is helpful. Can you evaluate it? We typically want to test it against baselines on 10 seeds." |

### Avoidance (1 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-03-18 | 709d6bbc | "how can we get you to focus on the main sessions rather than the pending sessions? I do not want you to avoid the difficult and important work." |

### Frustration (1 total)

| Date | Session | Text (excerpt) |
|------|---------|----------------|
| 2026-02-20 | 75a7b660 | "On number 2. I hate this. it sounds like a test-only call execution rule whereas the point is supposed to be to be testing the real gameplay logic." |

---

## Part B: Correction Classification Taxonomy

### Summary Table

| Category | Count | % of Total | Description |
|----------|-------|-----------|-------------|
| **Regression alarm** | 30 | 28.6% | Human notices test counts dropping or behavior breaking |
| **Premature action** | 27 | 25.7% | Human interrupts agent mid-stream to redirect |
| **Quality / style** | 10 | 9.5% | Writing quality: emdashes, AI slop, formulaic prose |
| **Test overfitting** | 10 | 9.5% | Agent passing tests without real behavioral alignment |
| **Complexity creep** | 8 | 7.6% | Agent adding unnecessary complexity to solution |
| **Factual error** | 7 | 6.7% | Agent got something wrong about code or project state |
| **Scope creep** | 6 | 5.7% | Agent doing more than narrowly asked |
| **Agent judgment** | 3 | 2.9% | Human questioning a specific agent decision |
| **Process violation** | 2 | 1.9% | Agent not following established workflow (commit/test cycle) |
| **Avoidance** | 1 | 1.0% | Agent working on easy problems, avoiding hard ones |
| **Frustration** | 1 | 1.0% | Explicit negative emotion about agent behavior |
| **TOTAL** | **105** | **100%** | |

### Category Definitions and Examples

#### 1. Test Overfitting (10 corrections, 9.5%)
Agent passes tests without implementing real logic, or optimizes for test metrics rather than ground-truth fidelity. The dominant pattern in this project: agents would add special cases to `replay_core.js` (the test harness) to handle specific observed divergences, rather than fixing the underlying game logic.

**Example quotes:**
- "why did they soft-pass them? i don't want to fake-pass the tests. i want the passes to be for real alignment." (Feb 13)
- "are you overfitting to the test" (Feb 24, terse mid-session)
- "(don't overfit to the test)" (Feb 24, parenthetical reminder)
- "it was overfit to the test!" (Feb 24, retrospective after discovering a masked bug)
- "remember: the goal is fidelity to the C, not overfitting to the tests. I really dislike the complexity inside replay_core, which is very difficult to understand and which clearly overfits to situations in tests, and which won't behave the same in deployment." (Mar 2, most forceful statement)

#### 2. Wrong Abstraction (subsumed under test_overfitting)
Agent builds infrastructure — harness rules, replay-core complexity — where the correct fix is in core game code. Closely related to test overfitting; the distinction is that the agent builds the right kind of thing (game logic) but puts it in the wrong layer.

**Example quote:**
- "I hate this. it sounds like a test-only call execution rule whereas the point is supposed to be to be testing the real gameplay logic. We need to implement these decisions within the main game loop." (Feb 20 — see Part F for full analysis)

#### 3. Avoidance (1 correction, 1.0%)
Rare but memorable. Agent gravitates toward lower-risk pending sessions rather than the difficult-but-important main sessions.

**Example quote:**
- "how can we get you to focus on the main sessions rather than the pending sessions? I do not want you to avoid the difficult and important work." (Mar 18)

#### 4. Complexity Creep (8 corrections, 7.6%)
Agent adds unnecessary complexity instead of keeping solutions simple. In this project, `replay_core.js` became a recurring target — it accumulated special-case logic that was repeatedly flagged as over-complex.

**Example quotes:**
- "i wonder if a lot of tests will fail if simulateTurnEnd has grown too complex." (Feb 15)
- "what is the change in replay_core? I hope you have found ways to reduce and simplify it rather than making it more complex." (Feb 18)
- "we don't need compatibility: we need to simplify the replay core so it doesn't do much." (Feb 24)

#### 5. Regression Alarm (30 corrections, 28.6%)
The most common category by far. Human notices that passing test counts have dropped. In this project, which maintains parity session counts as the primary metric, every test count drop is immediately visible and alarming. The characteristic phrase is "oh no" followed by a count: "oh no, we're down to 17?"

**Example quotes:**
- "it's urgent that maps pass. what did we do wrong? It used to pass perfectly." (Feb 9)
- "oh no, we're down to 17? another two regressions." (Feb 12)
- "oh no, two regressions!" (Mar 6)
- "oh no. this seems like a bug. 'The levl[80][22] global is never zeroed between calls' — this is a pretty serious bug." (Mar 6)

#### 6. Scope Creep (6 corrections, 5.7%)
Agent does more than asked. Pattern: terse directive "just fix this one" or "just fix the sessions that were already working."

**Example quotes:**
- "no let's just fix this one" (Feb 13)
- "just fix the sessions that were already working" (Mar 2)

#### 7. Quality / Style (10 corrections, 9.5%)
Writing quality corrections, primarily for documentation and narrative prose. Two distinct patterns:
- **Emdash overuse**: Flagged explicitly on Feb 7; recurs Mar 6 when the agent writes game history documents.
- **AI slop**: A cluster of prose quality corrections on Mar 5-6 when the agent was writing historical narrative content.

**Example quotes:**
- "I don't love the first subtitle... As we all know you tend to use emdashes too much" (Feb 7 — early establishment of the rule)
- "this sounds very much ai slop" (Mar 5)
- "the rogue history reads a bit like AI slop - heavily promotional and breathless - rather than with the curiosity, wit, and levity I'm looking for." (Mar 6)
- "both narratives are too heavy on the emdashes and a bit of ai slop" (Mar 6)

#### 8. Factual Error (7 corrections, 6.7%)
Agent misunderstood something about the codebase or project state. Several of these are self-corrections by the human ("oh i misunderstood"), reflecting genuine collaborative confusion.

**Example quotes:**
- "no that's not right. what is the signature of the comparator for arr.sort()?" (Feb 24 — agent stated wrong JavaScript API behavior)
- "I had incorrectly misunderstood that --More-- was missing from the C but now that you point out that --More-- is missing from the js, the rerecording makes sense." (Mar 4 — human correcting their own earlier correction)

#### 9. Process Violation (2 corrections, 1.9%)
Very rare. Agent committed or pushed code prematurely. Both instances early in the project (Feb 10-11); rule appears to have been internalized thereafter.

**Example quotes:**
- "Don't commit and push unless it is helpful. Can you evaluate it? We typically want to test it against baselines on 10 seeds." (Feb 11)
- "why did you commit so fast before running tests?" (Mar 2 — late recurrence, suggesting the rule needed reinforcing)

#### 10. Premature Action (27 corrections, 25.7%)
Human interrupts an agent mid-stream to provide new information, redirect the approach, or simply pause before the agent acts on incorrect assumptions. "Hold on" and "wait," are the characteristic markers. These are not failures per se but rather the normal backchanneling of pair programming.

**Example quotes:**
- "hold on, the shop branch has it. i want you to compare it to our js conversion script." (Feb 9)
- "hold on - i didn't want you to push any of that - I wanted to know which github repo it came from" (Mar 22)
- "no, hold on. but you didn't run through to #name did you? you haven't gotten to the point that triggers the problem." (Mar 19)

---

## Part C: Correction Density Over Time

### Daily Time Series

| Date | Human Msgs | Commits | Corrections | Rate/100msg | Rate/100commits |
|------|-----------|---------|-------------|-------------|-----------------|
| 2026-02-06 | 25 | 9 | 0 | 0.0 | 0.0 |
| 2026-02-07 | 194 | 35 | 3 | 1.5 | 8.6 |
| 2026-02-08 | 146 | 83 | 0 | 0.0 | 0.0 |
| 2026-02-09 | 134 | 343 | 4 | 3.0 | 1.2 |
| 2026-02-10 | 174 | 257 | 3 | 1.7 | 1.2 |
| 2026-02-11 | 92 | 239 | 3 | 3.3 | 1.3 |
| 2026-02-12 | 402 | 47 | 4 | 1.0 | 8.5 |
| 2026-02-13 | 557 | 95 | 8 | 1.4 | 8.4 |
| 2026-02-14 | 430 | 159 | 8 | 1.9 | 5.0 |
| 2026-02-15 | 238 | 54 | 4 | 1.7 | 7.4 |
| 2026-02-16 | 0 | 114 | 0 | — | 0.0 |
| 2026-02-17 | 4 | 44 | 0 | 0.0 | 0.0 |
| 2026-02-18 | 259 | 253 | 6 | 2.3 | 2.4 |
| 2026-02-19 | 34 | 191 | 0 | 0.0 | 0.0 |
| 2026-02-20 | 61 | 42 | 1 | 1.6 | 2.4 |
| 2026-02-21 | 0 | 13 | 0 | — | 0.0 |
| 2026-02-22 | 144 | 59 | 4 | 2.8 | 6.8 |
| 2026-02-23 | 154 | 103 | 5 | 3.2 | 4.9 |
| 2026-02-24 | 731 | 114 | 12 | 1.6 | 10.5 |
| 2026-02-25 | 2 | 63 | 0 | 0.0 | 0.0 |
| 2026-02-26 | 1 | 125 | 0 | 0.0 | 0.0 |
| 2026-02-27 | 0 | 27 | 0 | — | 0.0 |
| 2026-02-28 | 48 | 19 | 1 | 2.1 | 5.3 |
| 2026-03-01 | 297 | 56 | 7 | 2.4 | 12.5 |
| 2026-03-02 | 880 | 41 | 16 | 1.8 | 39.0 |
| 2026-03-03 | 203 | 80 | 3 | 1.5 | 3.8 |
| 2026-03-04 | 143 | 200 | 1 | 0.7 | 0.5 |
| 2026-03-05 | 74 | 175 | 2 | 2.7 | 1.1 |
| 2026-03-06 | 762 | 245 | 19 | 2.5 | 7.8 |
| 2026-03-07 | 22 | 226 | 0 | 0.0 | 0.0 |
| 2026-03-08–11 | 0 | 942 | 0 | — | 0.0 |
| 2026-03-12 | 27 | 119 | 0 | 0.0 | 0.0 |
| 2026-03-13–16 | 0 | 426 | 0 | — | 0.0 |
| 2026-03-17 | 32 | 48 | 0 | 0.0 | 0.0 |
| 2026-03-18 | 108 | 94 | 2 | 1.9 | 2.1 |
| 2026-03-19 | 315 | 140 | 2 | 0.6 | 1.4 |
| 2026-03-20 | 0 | 113 | 0 | — | 0.0 |
| 2026-03-21 | 267 | 238 | 3 | 1.1 | 1.3 |
| 2026-03-22 | 172 | 168 | 1 | 0.6 | 0.6 |
| 2026-03-23 | 0 | 143 | 0 | — | 0.0 |
| 2026-03-24 | 78 | 130 | 3 | 3.8 | 2.3 |
| 2026-03-25 | 5 | 97 | 0 | 0.0 | 0.0 |

**Totals: 125 corrections / 7,368 messages = 1.7%; 125 corrections / 6,272 commits = 2.0%**

### Phase Aggregates

| Phase | Dates | Corrections | Human Msgs | Rate |
|-------|-------|-------------|-----------|------|
| Phase 1: Setup & Foundation | Feb 6–12 | 17 | 1,167 | 1.5% |
| Phase 2: Porting Sprint | Feb 13–19 | 27 | 1,522 | 1.8% |
| Phase 3: Testing Infrastructure | Feb 20–28 | 24 | 1,141 | 2.1% |
| Phase 4: Parity Burndown | Mar 1–9 | 48 | 2,381 | 2.0% |
| Phase 5: Coverage Campaign | Mar 10–19 | 4 | 635 | 0.6% |
| Phase 6: Final Polish | Mar 20–25 | 5 | 522 | 1.0% |

### Interpretation

The correction rate does **not** decline significantly over time. The per-message rate hovers around 1.5–2.5% throughout active human-involvement periods. The most notable feature is:

1. **Days with low human engagement (0–4 messages) never have corrections** — these are autonomous agent runs where there is no human present to correct behavior.
2. **Peak correction days are peak interaction days**: Mar 2 (880 messages, 16 corrections), Mar 6 (762 messages, 19 corrections), Feb 13 (557 messages, 8 corrections). These are deep collaborative debugging sessions.
3. **No learning trend is detectable** at the per-message correction rate. The rate in Phase 5 drops to 0.6% but this coincides with a phase shift (coverage campaign) where the human's role shifts to oversight and the agents work more autonomously.
4. **Test overfitting corrections cluster in late February** (Feb 24 cluster, Mar 2 cluster) suggesting this particular failure mode was persistent rather than corrected once and forgotten.

The most striking number: **Mar 2 had 16 corrections in 880 messages** — a 1.8% rate but the highest single-day absolute count. The day-summary confirms: "why did you commit so fast before running tests?" and a cascade of "hold on" interruptions as the human and multiple agents worked intensively to untangle `replay_core.js` complexity.

---

## Part D: Correction → Response Analysis

Analysis of 12 significant corrections: what happened immediately after, and did the correction stick?

### 1. "It's urgent that maps pass" — Feb 9
**Correction type:** Regression alarm
**Human message:** "it's urgent that maps pass. what did we do wrong? It used to pass perfectly."
**Immediate response:** Agent investigates without proceeding further. Single AI-work event follows.
**Did it stick?** Yes — maps passing became a persistent priority metric. The phrase "it used to pass" appears in multiple later sessions as shorthand for regression detection.

### 2. "I don't want to fake-pass the tests" — Feb 13
**Correction type:** Test overfitting
**Human message:** "why did they soft-pass them? i don't want to fake-pass the tests. i want the passes to be for real alignment."
**Immediate response:** Human follows up: "should the fake wiring be simply removed?" Agent confirms and removes. Then: "ok how many of these fake passes do we have for other levels?" — indicating comprehensive cleanup.
**Did it stick?** Partially. The explicit fake-pass anti-pattern was caught again on Feb 24 ("it was overfit to the test!") and Mar 2 ("remember: the goal is fidelity to the C, not overfitting to the tests"). The pattern of writing test-specific workarounds in the harness rather than fixing game code proved durable.
**Encoded in AGENTS.md?** Yes — a "No-Fake-Implementation Rule (Strict)" section was added to AGENTS.md on Feb 26, 6 days after the cluster of overfit corrections. It explicitly prohibits "adding comparator/harness exceptions to hide gameplay divergence instead of fixing game logic."

### 3. "I hate this test-only call execution rule" — Feb 20
**Correction type:** Frustration / Wrong abstraction (the most forceful correction in the dataset)
**Full context:** See Part F. The agent had moved `pendingDeferredTimedTurn` logic into `replay_core.js`, creating a test harness that had game-logic awareness. The human objected that "the point is supposed to be to be testing the real gameplay logic."
**Immediate response:** Agent immediately began investigating game loop code to understand the proper refactoring. Within the session, the agent moved the logic into `nethack.js` with a proper `runPendingDeferredTimedTurn()` method.
**Did it stick?** The specific instance was fixed. But the pattern of harness accumulating game logic was flagged again on Feb 23 ("i don't like how you previously complexified replay_core"), Feb 24 ("simplify the replay core so it doesn't do much"), and throughout March.
**Encoded in AGENTS.md?** The Non-Negotiable Engineering Rule #1 ("Fix behavior in core JS game code, not by patching comparator/harness logic") directly addresses this. It appears in the Feb 18 AGENTS.md, predating the correction, but was reinforced by it.

### 4. Overfitting cluster — Feb 24
**Correction type:** Test overfitting (5 corrections in one day)
**Sequence:** "are you overfitting to the test" → "we should be faithful to the C" → "(don't overfit to the test)" → (later) "it was overfit to the test!" → "so as you can see, overfitting to the test sometimes makes you susceptible to missing when the test itself is incorrect. Let's note it in LORE."
**Immediate response:** The session shows the human actively tracking as the agent works. The agent appeared to make a game-logic fix that happened to be wrong in a way that could only be detected because the test itself had a flaw.
**Did it stick?** The human explicitly asked to note this in LORE.md — institutionalizing the lesson. Yet two "overfit" corrections appeared on Mar 2, 6 days later.
**Encoded in AGENTS.md?** Yes — the "No-Fake-Implementation Rule" was committed Feb 26, two days after this cluster.

### 5. "Why are you proposing to remove all of these session files?" — Feb 18
**Correction type:** Agent judgment
**Human message:** "Why are you proposing to remove all of these session files?"
**Immediate response:** Agent explains the rationale. Human's next message: "i see. yes please delete untracked duplicates if finished rebuilds are in place to be committed." — the human understood and approved once explained.
**Did it stick?** Yes — this was a clarification, not a persistent problem. The agent was doing something reasonable but hadn't communicated its plan.

### 6. "Why did you commit so fast before running tests?" — Mar 2
**Correction type:** Process violation
**Human message:** "why did you commit so fast before running tests?"
**Immediate response:** Agent presumably explains and returns to running tests. The next human message is "what happened to the 141/150?" — tracking test numbers.
**Did it stick?** This was a late recurrence of the "commit before testing" anti-pattern first corrected on Feb 10-11. It did not appear again after Mar 2.

### 7. "Hold on - tests are very regressed" — Feb 24
**Correction type:** Premature action + regression alarm
**Human message:** "hold on - tests are very regressed."
**Immediate response:** Session paused for investigation.
**Context:** This occurred at the most intense overfitting cluster (Feb 24). The agent had just been making changes when the human noticed test numbers had dropped.

### 8. "Do not avoid the difficult and important work" — Mar 18
**Correction type:** Avoidance
**Human message:** "how can we get you to focus on the main sessions rather than the pending sessions? I do not want you to avoid the difficult and important work."
**Immediate response:** "we should not fear this work; we should prioritize these divergences, including the difficult 031-033 sessions, and persist in solving them."
**Did it stick?** This prompted a phase-level change: the day summary notes "Human pushback: 'do not avoid the difficult divergences; persist on 031-033.' Switched to Opus for depth." The human switched to a different (more capable) model for the hard sessions. This is the most consequential behavioral correction in terms of project trajectory.
**Encoded in AGENTS.md?** Yes — the current AGENTS.md opens with "Immediate priority: Get seed031, seed032, and seed033 green before expanding coverage."

### 9. "Hold on - i didn't want you to push any of that" — Mar 22
**Correction type:** Premature action / process violation
**Human message:** "hold on - i didn't want you to push any of that - I wanted to know which github repo it came from"
**Immediate response:** A subagent work event follows, then a redirection to set up a git submodule instead of copying the code.
**Context:** The agent had pushed upstream Rogue source code into the project repository before the human had approved the integration approach.

### 10. "oh no. this seems like a bug. levl[80][22] global is never zeroed" — Mar 6
**Correction type:** Regression alarm (but also a genuine bug catch)
**Human message:** "oh no. this seems like a bug. 'The levl[80][22] global is never zeroed between calls' — this seems wrong and should be fixed, even if it means that all the sessions must be rerecorded. this is a pretty serious bug."
**Immediate response:** The severity of this is reflected in the human's willingness to rerecord all sessions. The agent investigated and confirmed.
**Impact:** Led to session rerecording — a significant cost accepted to fix correctness.

### 11. "Remember: the goal is fidelity to the C" — Mar 2
**Correction type:** Test overfitting (most forceful formulation in the dataset)
**Human message:** "remember: the goal is fidelity to the C, not overfitting to the tests. I really dislike the complexity inside replay_core, which is very difficult to understand and which clearly overfits to situations in tests, and which won't behave the same in deployment. Please prioritize elimination of gameplay awareness in replay_core."
**Did it stick?** This is the most explicit framing of the project's core correctness philosophy. It did not result in another overfit correction after this date — though the complex replay_core was addressed incrementally through March.

### 12. "Do not regress existing parity" — (AGENTS.md enforcement)
The correction that most durably shaped agent behavior was encoded in AGENTS.md rather than spoken. The rule "6. Never regress existing parity — fix code, don't mask sessions" became an axiom. The human's regression alarm pattern ("oh no, we're down to X") established that parity session count was sacrosanct. Agents that caused regressions were immediately redirected.

---

## Part E: The Watchdog Evolution as Behavioral Tuning

### Overview
434 watchdog events were issued across the 48-day dataset. The watchdog is an automated process that periodically injects a prompt into agent sessions to keep them working. Over time, the watchdog prompts were redesigned to shape agent behavior.

### Unique Templates (14 total, all first appeared by Feb 19)

The initial 10 templates (all appearing Feb 10-11) were simple accuracy-focused nudges:

1. "Please continue with the most accurate work possible." (98 uses — most common)
2. "Please keep advancing with precise, thorough improvements." (29 uses)
3. "Continue refining and improving with maximum accuracy." (30 uses)
4. "Please continue enhancing with meticulous, accurate work." (30 uses)
5. "Please continue making improvements doing the most accurate work possible." (40 uses)
6. "Keep making meaningful improvements with careful attention to accuracy." (37 uses)
7. "Continue making forward progress with the most careful work possible." (28 uses)
8. "Please keep making progress doing careful, accurate work." (32 uses)
9. "Continue advancing the work with precision and thoroughness." (24 uses)
10. "Keep improving and refining with precision and accuracy." (22 uses)

On **Feb 11**, a more substantive template appeared:
11. "Are you confident in the work that has been accomplished? If the work is a significant step forward and passes more tests than previous work, then please consider making a commit and push to main, ad[...]" (4 uses — testing a commit-encouraging variant)

On **Feb 18**, AGENTS.md-aware templates were added:
12. "Please continue making progress. Remember to check AGENTS.md for project guidelines and priorities." (17 uses)

On **Feb 19**, two more variants:
13. "Keep making careful, accurate improvements. If you haven't already, review AGENTS.md for guidance on this project." (22 uses)
14. "Continue doing precise, thorough work. Consult AGENTS.md for any project-specific guidelines you should follow." (21 uses)

### The Mar 12 Personality Redesign

On March 12, the human worked with a watchdog agent directly to redesign the prompt system. The session (ID: 3d173b6a) reveals the design conversation:

**Human:** "The current set of prompts are worded in a way that aims at precision rather than breadth"

**Human:** "i would like you to put the current prompts in an array for one 'personality' for the watchdog and to have a different set of prompts for a second personality. Basically: the current prompts were useful for getting a set of unit tests all green, but currently I'm asking the coding agents to work to create new tests that have higher coverage. instead of working with narrow precision, i need them to be expansive and creative while devising test sessions, while also being careful about fixing bugs."

**Agent:** (implements personality system with `precise` and `explorer` personalities)

**Human:** "I would ideally like the nudges to be generic rather than too specific for the situation."

**Agent:** (revises explorer prompts to be more generic — setting tone/mindset rather than prescribing specific actions)

**Human:** "instead of calling it --personality=explorer let's say --nudge=explore."

**Outcome:** The watchdog gained two personalities: `precise` (original accuracy-focused prompts) and `explore` (broader, creativity-encouraging prompts). This was the most significant behavioral tuning event for the watchdog system, transitioning from a test-passing campaign to a coverage-expansion campaign.

### Interpretation

The watchdog templates were **conservative and stable**: 10 of 14 templates appeared on days 1-2 (Feb 10-11) and never changed. The AGENTS.md-aware templates (Feb 18-19) represent a shift from generic "work accurately" to project-specific guidance. The Mar 12 redesign was the only major architectural change, adding a second mode for a different phase of work.

The watchdog's behavioral influence is indirect: it keeps agents working when they would otherwise stop, and (after Feb 18) directs them to consult project-specific rules. The real behavioral tuning happened through AGENTS.md updates, not watchdog prompt changes.

---

## Part F: Case Study — "I hate this test-only execution rule" (Feb 20)

### Context

On February 20, 2026 at 22:12 UTC, in session `75a7b660-bee7-46e9-8706-c1471e001b40` (project: `q:claude`, working directory: `/share/u/davidbau/git/mazesofmenace/game`), the human issued the only explicit "I hate" correction in the entire 48-day dataset.

### The Setup

The session began with the human asking: "what are local changes?" The agent described three changes in `replay_core.js`:

1. An `isMidlogEntry` extension adding `'^'` as a recognized prefix
2. **"Deferred timed turn moved to after player command"** — the `pendingDeferredTimedTurn` logic relocated inside `replay_core.js` because monster decisions needed to see the hero's post-move position
3. A new "player-move-without-monster-turn block" in the `deferredCoversStep` path

### The Correction

The human reacted to item 2:

> "On number 2. **I hate this.** it sounds like a test-only call execution rule whereas the point is supposed to be to be testing the real gameplay logic. We need to implement these decisions within the main game loop."

The core objection: the agent had placed game-logic decisions (when to run monster turns, how to sequence player and monster actions) inside `replay_core.js`, which is the test harness. This means:
- The logic would run during tests but **not in real gameplay**
- The test harness would have game-loop awareness, violating the architectural principle that harnesses should expose bugs, not implement game logic
- The behavior would be untestable against real gameplay

### The Agent's Response

The agent immediately:
1. Examined the actual game loop in `nethack.js` to understand the correct structure
2. Articulated the correct fix: "The fix: move `pendingDeferredTimedTurn` onto the game object and add a `runPendingDeferredTimedTurn()` method to `nethack.js` that the gameLoop calls. The replay sets the flag but delegates execution to the game."
3. Made the change: added `this.pendingDeferredTimedTurn = false` to the game constructor, added `runPendingDeferredTimedTurn()` method to both `nethack.js` and `headless_runtime.js`, and updated `replay_core.js` to call the game method rather than executing `movemon/simulateTurnEnd` directly

The key architectural insight the agent articulated: "The detection logic (RNG-pattern sniffing) stays in the replay since that's inherently replay-specific, but the execution decision — 'run deferred monsters after the player command' — moves into the game."

### The Result

The change caused no regressions: "baseline was 40 failures, our changes are at 39 failures (one improvement)." The code was pushed.

### Lasting Impact

1. **Immediate fix**: The specific `pendingDeferredTimedTurn` logic was moved to core game code.
2. **Repeated pattern**: The same type of error (game logic in harness) was caught again on Feb 23, Feb 24, and Mar 2, each time prompting simplification of `replay_core.js`.
3. **Encoded principle**: AGENTS.md Non-Negotiable Engineering Rule #1 ("Fix behavior in core JS game code, not by patching comparator/harness logic") directly embodies this correction. Although this rule predates Feb 20 (it appears in the Feb 18 AGENTS.md), the "I hate" incident reinforced and personalized it.
4. **The fundamental tension**: Throughout the project, the test harness (`replay_core.js`) accumulated game-logic complexity because it was easier to make tests pass by adding special cases to the harness than to fix the underlying game. The Feb 20 correction, the Feb 26 "No-Fake-Implementation Rule," and the Mar 2 "goal is fidelity to the C" message form a coherent arc of human resistance to this tendency.

### Why the Human Was Especially Forceful

The use of "I hate this" (the only hate-expression in 7,448 events) signals that the human recognized this not as a one-off mistake but as a symptom of a systematic failure mode. The harness-as-game-logic pattern was deeply tempting — it made tests pass immediately without the harder work of understanding and fixing the real game logic. The human's visceral reaction served to establish that this shortcut was categorically unacceptable.

---

## Summary Findings

### The Stable ~1.7% Rate
Human corrections occur at a remarkably consistent ~1.7% rate throughout active engagement days. This rate does not trend down over 48 days, suggesting corrections are not primarily about agents learning rules but about the inherent real-time calibration of pair programming — humans redirecting agents as new information becomes available.

### The Two Dominant Failure Modes
Together, **regression alarms** (28.6%) and **premature actions** (25.7%) account for 54% of all corrections. These reflect the rhythm of intensive collaborative debugging: agents move forward when the human wants to pause and inspect, or agents cause test regressions by introducing new bugs while fixing others.

### The Persistent Test Overfitting Problem
Test overfitting (9.5%) appeared Feb 13 and recurred Feb 24, Mar 2, and Mar 6 despite explicit human corrections and AGENTS.md encoding. This is the correction that most resisted institutionalization — it took three rounds of correction plus formal rule codification to significantly reduce. The fundamental cause: it is always easier and faster to make a test pass by adding a special case to the harness than to fix the underlying game logic, and agents consistently defaulted to the easier path.

### The Role of AGENTS.md as Behavioral Memory
The most durable corrections were those encoded in AGENTS.md. The "No-Fake-Implementation Rule" (Feb 26) and the "Non-Negotiable Engineering Rules" represent the human's attempt to convert one-time corrections into standing policy. However, even formal encoding in AGENTS.md did not prevent the pattern from recurring — suggesting that behavioral tuning via written rules has limits against deeply embedded tendencies toward expediency.

### The Mar 18 Turning Point
The "do not avoid the difficult and important work" correction (Mar 18) represents the highest-leverage single intervention: the human switched to a more capable model (Opus) for the hardest sessions, and this is reflected in the current AGENTS.md priority statement. A single correction about avoidance changed both the model selection policy and the session prioritization strategy.
