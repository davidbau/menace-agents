# Narrative Draft: Supervising Agents on a 450K LOC Project

> Draft recollection from David Bau, April 5 2026.
> To be fact-checked against agent logs, commits, and timeline data.

## The Dream

Started menace as a C-NetHack porting project without much infrastructure.
Quickly got a playable JS game up and running but obviously missing details
from the original. The dream: a perfectly faithful port, good enough to serve
as a seed for a new generation of the game code in non-crashing, browser-
friendly, widely-portable JS while carrying on the 45-year-old codebase
unbroken, without losing maintainability or detailed gameplay.

## The Testing Infrastructure

Set up testing infrastructure based on replicating session recordings of the
original C NetHack running in tmux. Eventually grew to the PES (PRNG/Events/
Screen) architecture. Recorded hundreds of sessions to replicate.

## The Progress Phase

The agent swarm was able to get the vast majority of sessions to match exactly
between JS and C. Except for about 40 of them. Then after further work, got it
down to about 18 or 19 failing sessions. Project seemed to be making good
headway. Plan was to get this initial set to 100% parity then expand coverage.

## The Stall

For weeks and weeks of commits, the project was stuck at 18-19 sessions.
Despite agents working very hard and making many commits. Didn't understand
what was so hard about these "hard sessions."

## The Experiments

Tried guiding agents to do various things:
- Created a Lua-to-JS compiler (narrowly tailored to level files) — **successful**
- Created a C-to-JS compiler (aimed at game files) — **totally unsuccessful**,
  littered codebase with garbage code
- Created a C-to-JS compiler for static initialization code — **successful and
  important** (constants without circular imports)

Despite all this work, still stuck at the core of unsolved sessions.

## The Religion

Looking at details of what was going wrong, realized agents had been making
code worse in a specific way. Agents would read code carefully, understand
sequencing ("A comes before B"), but test code and see different sequencing
("B comes before A"). They would intensely study these contradictions, become
frustrated, and start inventing weird explanations — rather than blaming a bug
in gameplay code, they would hypothesize that their perception of sequencing
was distorted, that there must be a bug in the test infrastructure, in how
C or JS was being run or measured.

This "religion" was characterized by words like "boundary-alignment-queue-
replay-divergence-exception" etc. Reminded me of Ptolemy's attempt to repair
a faulty model of planetary orbits by adding more circles within circles.

## The Resistance to Removal

Identified central places where this hack logic lived. When asking agents to
remove this code, they would repeatedly quickly revert the removals because
removals caused huge test regressions. Took manual coaching to remove the code
and create scaffolding to prevent its return: non-reentrancy assertions, lots
of advice in documentation and agent guidelines.

## The Genuine Bugs

Around the same time, also noticed genuine bugs in the test infrastructure
and bugs in the patched C that altered gameplay. Got new infrastructure into
place, rerecorded all sessions, absorbed regressions, set agents to fix
things properly.

## The Recovery

With coaching to prevent re-discovery of the old "boundary adjustment"
religion, got from about 18 failures to about 3. But not zero. The last 3
were very stubborn — long gameplay sessions. Let agents work on them for
several more weeks. Progress was so slow it didn't seem on track.

## The Permeation

Looking at details, agents were still spending inordinate time reasoning about
"boundary adjustments." The ideas of the old religion were hidden in all
crevices of the ~220K line codebase. Seemed impossible to get rid of the buggy
ideas permeating the whole culture of the project.

## The Decision to Start Fresh

Someone suggested: start fresh. In human-made large-scale coding, "starting
fresh" is almost always terrible — Pyramid (Word rewrite), Cairo (Windows
rewrite), OS/2. But maybe agents are different.

## The Healthy Seed

Instead of totally fresh, distilled wisdom and positive lessons from 50 days
into starter files and advice documents as a "healthy seed" for teleport.
AGENTS.md with cardinal rules forbidding the "boundary adjustment" religion.

## The Teleport Result

The bad meme showed up once during teleport but was eliminated in a few hours.
Progress has been steadier and more monotonic. Incorporated many hard-won
lessons about code architecture AND metacoding technique:
- PES stats tracked on every commit
- Simple commit-message standards instead of slow test hooks
- Test efficiency: maximum coverage-per-step, fast routine testing
- Adopted successful tools: autoconstant translation, Lua→JS
- Instead of unsuccessful C→JS compiler, created LLM-driven bulk translation
- Last 7 days as productive as many weeks of the previous project

## Questions for Fact-Check

1. How many sessions were in the "stuck at ~40" phase? When?
2. How many sessions were in the "stuck at ~18-19" phase? When?
3. When exactly was the boundary-adjustment religion identified?
4. What was the replay_core line count over time?
5. When were the C harness bugs found?
6. What was the trajectory from 18→3 failures?
7. How long were agents stuck at 3?
8. Can we find specific commit messages or human messages showing the religion?
9. Can we find the revert pattern (agent removes hack, sees regression, reverts)?
10. What was the exact commit count / human message count during the stuck period?
