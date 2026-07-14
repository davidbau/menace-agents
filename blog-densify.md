# Densifying the Objective

*Draft for mazesofmenace.ai / davidbau.com. Pending: Owen Lockwood's
permission and review. All output below is real: his oracle.mjs, run
unmodified against his engine, on 2026-07-14.*

The Teleport contest scores a port the only way a contest can: from
the outside. Your JavaScript NetHack replays a recorded session, and
the judge checks that it consumed the same random numbers and painted
the same screens as the original C program. Pass or fail, session by
session.

That score is the right judge. It is a terrible teacher. It is
sparse: a session with twelve thousand random-number calls either
matches or it does not, and when it does not, the failure tells you
almost nothing about where, in four hundred thousand lines of ported
logic, the mistake lives. Optimizing against a sparse objective is
slow for a human and dangerous for an AI agent, because an agent that
cannot find the cause will find something else: a special case, a
patch that moves the symptom, an explanation. Three teams on the
leaderboard have perfect or near-perfect public scores and
single-digit held-out scores. Every one of them optimized the score
the judge shows.

In our own port, the countermeasure was what we called the events
channel. Between the inputs and the screens, we logged selected hidden
state transitions on both sides, C and JS, and compared those too.
Every logged event is a constraint that the mechanism has to satisfy,
not just the output, and every event is a tripwire that catches a
divergence near its cause instead of ten thousand calls downstream. We
grew the channel opportunistically: whenever a subsystem proved
troublesome, it earned more events.

One contestant, Owen Lockwood, generalized this idea in a way I find
elegant, and his repo is public, so I can show you exactly what he
built.

## What Owen built

Instead of curating events, he snapshots the whole latent state. Three
pieces, each small:

First, a C-side channel. He patched the contest's recorder binary so
that at every input boundary, once per keystroke, it appends one JSON
line to a file: the cumulative count of random-number calls so far,
the hero's position and hit points, and the complete monster chain,
every monster with its identity, species, position, hit points,
tameness, and status bits. One line from a real recording, abbreviated:

```json
{"rng":2360,"ux":47,"uy":18,"uhp":10,"uhpmax":10,"multi":0,
 "mons":[{"m_id":65,"name":"kitten","pm":32,"mx":47,"my":17,
          "mhp":6,"mhpmax":6,"mtame":10,"mpeaceful":1,...},
         {"m_id":16,"name":"newt","pm":322,"mx":27,"my":16,...}, ...]}
```

Second, a JS-side mirror. His port has a dump hook emitting the same
schema at the same boundaries, gated behind an environment variable
and verified to be a byte-exact no-op when disabled, so the judged
run is untouched. The scored channels were never modified. This is a
private channel, built purely to make development see.

Third, a comparator, `oracle.mjs`, that aligns the two streams
boundary by boundary and reports the first divergence with full
provenance: which step, which monster, which field, the C value, the
JS value, and the C source locations active at that moment. The
report ends with a line that begins with an arrow and the word FIX.

## Watching it run

Owen kept his C-side recorder patch on his own machine, so to see the
tool work I rebuilt that half from his documentation: about sixty
lines added to the contest recorder, emitting his schema. A good sign
that the reconstruction is faithful: his code comments record that he
verified 1,814 boundaries on the session seed4500, and my regenerated
channel produced exactly 1,814 rows. Then I ran his oracle,
unmodified, against his engine. First report:

```
════════ ORACLE: seed4500-knight-coverage  seed=4500 ════════
  C-source: /private/tmp/gt/seed4500.state.jsonl (state)   boundaries C=1814 JS=1814
  ✓ C-recorder rng# matches canonical session across the aligned range
  ── FIRST DIVERGENCE ──
  step 0   C-rng#=2776  JS-rng#=2778  canon-cum-rng#=2776
  MON newt#31 (m_id 31) . pm :   C=322   JS=321
  ➜ FIX: pmidx enum offset for m_id 31 (same species, index C=322 JS=321) —
     fix the PM_ table ordering in JS (a missing/extra permonst entry)
```

Notice what the tool did there. The newt is the right species in both
games, but its numeric index into the monster table is off by one, and
the comparator knows the difference between a real species mismatch
and an enumeration offset: Owen ordered the compared fields so that a
true identity error is reported first and an index skew is reported
last, with its own diagnosis. Triage knowledge, encoded in a sort
order.

His tool also has a flag for exactly this situation: when a divergence
class is known and queued, you suppress it and ask for the next one.
`--ignore pm` produces the report I find genuinely beautiful:

```
  ── FIRST DIVERGENCE ──
  step 261   C-rng#=8124  JS-rng#=8124  canon-cum-rng#=8124
  MON cobra#111 (m_id 111) . mx :   C=39   JS=37
  C rng-callsites at step 261 (14 calls):
     C> rn2(5)=4 @ distfleeck(monmove.c:538)
     C> rn2(8)=3 @ m_move(monmove.c:1963)
     C> rn2(5)=3 @ postmov(monmove.c:1696)
  ➜ FIX: m_id 111 moved to wrong cell — m_move/mfndpos at distfleeck (monmove.c:538)
```

Sit with this one a moment. At step 261, the random-number streams
agree perfectly: 8,124 calls on the C side, 8,124 on the JS side,
both equal to the canonical recording. Every number the two games
have ever drawn is identical. And a cobra is standing two cells west
of where it should be. The judge's channels cannot see this yet. The
snake is not necessarily even on screen. But the state is wrong, and
the wrongness will compound silently, turn after turn, until
somewhere far downstream a random number finally disagrees or a
screen finally differs, at which point the symptom will be ten
thousand calls away from this cause. Owen's channel catches it at the
boundary where it happened, tells you it is a state-tracking bug and
not an RNG over-draw (the counts agreeing is how you know), and hands
you the C function to port correctly.

## How a state dump learns a callsite

A fair question: the state dump fires after the fact, so how does the
report name C source locations? It cannot, and does not, on its own.
The provenance comes from a join between two channels. Each state row
carries one extra integer, the cumulative RNG count at its boundary.
And the canonical session recordings already annotate every RNG call
with its C callsite. So when the state channel finds the first wrong
fact, the oracle slices the canonical trace to that boundary's window
and prints the pre-labeled calls that were executing. The state
channel finds the wrong fact; the RNG channel names the suspect.
Neither channel could do it alone, and the join cost one integer per
row.

Owen even distrusts his own instrument correctly: the oracle
cross-checks the state dump's RNG counts against the canonical
recording and reports the boundary past which its own ground truth
has drifted and should not be believed. He built a verifier for his
verifier.

## Why this works

Count the information. The judge offers one bit per session. The
screens offer a few thousand comparable cells, all at the end of the
pipeline. Owen's channel offers dozens of comparable facts at every
input boundary, hundreds of boundaries per session, every fact
attributable to an entity and a field. He densified the objective:
the same porting problem, but with a feedback signal fine enough that
a search process, human or agent, can actually follow it.

And matching latent state does something the public score cannot: it
forces the port to be right for the right reasons. You can
special-case your way to a matching screen. You cannot special-case
your way to every monster's hit points agreeing at every boundary of
sessions you have never seen. It is no coincidence that Owen's entry
shows no gap between its public and held-out scores, while the
entries tuned against public screens collapse on the held-out set.

The best part is that Owen's oracle is finished and ready to run: the
campaign map of all 44 sessions prints in one command, and every line
of it names the next C function to fix. I suspect the leaderboard has
not heard the last of him. If you are entering this contest, the
lesson is worth more than any hint I could write about porting
itself: before you optimize the objective the judge gives you, spend
a week building the dense objective the judge doesn't. The C recorder
ships in your fork. The rest is one script.
