# Goodhart's Law and the Stone Golem

*Draft for mazesofmenace.ai / davidbau.com. Alternate titles:
"Densifying the Objective"; "Overfitting Is Not Just for Machine
Learning." Pending permission and review from Owen Lockwood and
Florian Brand, whose public contest entries are analyzed below. All
program output shown is real, produced 2026-07-14 from their public
repositories.*

Goodhart's law says that when a measure becomes a target, it stops
being a good measure. We usually tell that story about statistics:
about models that memorize their training data, about metrics gamed by
gradient descent. This is a story about Goodhart's law arriving in
traditional, deterministic software engineering, byte-exact and
measured, in a contest where the code was written by AI agents and
the overfitting can be diagnosed down to a single monster's hit
points.

The Teleport contest asks entrants to port NetHack 5.0 from C to
JavaScript so exactly that recorded game sessions replay
bit-for-bit: same random numbers, same terminal screens. Forty-four
sessions are public. Forty-four more are held out. The public
leaderboard currently shows three entries at or near a perfect public
score, and all three collapse on the held-out set. One of those
contestants, an LLM-evaluations researcher by profession, wrote the
whole post-mortem in his repository's description field:

> Hill climbing model is lost when first hill is indeed climbed 😢

His entry reached 43 of 44 public sessions through 1,417 commits
authored, literally, by `Codex <codex@local>`, a coding agent running
around the clock for three weeks. It scores zero of 44 held out. I
want to show you exactly what that gap is made of, because seeing it
in a deterministic program, where every fact can be checked, teaches
something the statistics version of the story cannot.

## The twin experiment

Here is a clean way to measure overfitting in a port: take a public
session the engine passes perfectly, change nothing but the dungeon
seed, and record fresh ground truth from the original C program. Same
character configuration, same fixed datetime, the same 1,813
keystrokes, one seed over: a held-out session that sits one step off
the summit of the public hill. I recorded one this morning; it did
not exist when any of these engines was built.

Session seed4500 is the exam. Its twin, seed4501, is the question the
students never saw. Five entries, both sessions:

| Entry | Exam: seed4500 (public) | Twin: seed4501 (fresh) |
|---|---|---|
| xeophon | PASS 108,275/108,275 RNG | FAIL at RNG 8,043/99,040 (8.1%) |
| Hoimar | PASS perfect | FAIL at RNG 7,496/99,040 (7.6%) |
| kevinjosethomas | PASS perfect | FAIL at RNG 450/99,040 (0.5%) |
| lockwo | FAIL at RNG 8,226/108,275 (7.6%) | FAIL at RNG 7,260/99,040 (7.3%) |
| serteal | PASS perfect | **PASS 99,040/99,040** |

Three observations, in ascending order of importance.

First, serteal's entry passed a session that did not exist this
morning, all 99,040 random numbers of it, with an engine untouched
since June 12. That is what generalization looks like when it is
physical: his entry compiles the actual C engine to JavaScript, so
correctness is inherited rather than imitated.

Second, the shape of each failure is a diagnosis. One entry dies at
450 random calls, before the character finishes being created: it is
a lookup table keyed on the exact input, and the twin misses the
table. The two hill-climbed engines die around call 8,000: real
engines that survive the early machinery every game shares, then fall
the moment the new dungeon demands mechanics they never truly
implemented.

Third, and this is the heart of it: on the twin, the perfect-scoring
engines and the 4-of-44 engine converge to the same number. xeophon's
11,398 public points become 8,043 twin calls. Hoimar's 11,405 become
7,496. Owen Lockwood's entry, which scores a lowly 3,039 public
points, makes 7,260. One seed away from the exam, weeks of
hill-climbing evaporate and everyone owns the same partial engine.
Except for two differences: Owen's number is the same on both columns,
7.6% on the exam and 7.3% on the twin, because his engine contains no
memorized hills. And Owen is holding an instrument the others don't
have.

## The knight at Delphi

Before the instruments, meet the session, because everything that
follows happens inside one recorded game. seed4500 is a coverage
expedition: a knight in debug mode touring the dungeon to exercise
its machinery, 1,813 keystrokes long. He kills a kobold on level one,
promotes himself to experience level 15, and teleports down to
dungeon level 5, which in this game holds the Oracle of Delphi,
peaceful in her chamber, ringed by centaur statues. There he gets
into real trouble: a cobra and an earth elemental at once.

```
You hit it.  The earth elemental hits!  The cobra bites!

                                 ┌───────────┐
                                 │C@········C│
                                 │·ES··C·····│
                                 │···┌─ ─┐  ··
                                 │···│       │
                                 │··C│
                                 │···│
                                 │···└
                                 │·····
                                 │C······
                                 └────────

Wizard the Knight              St:18/01 Dx:9 Co:12 In:7 Wi:14 Ch:17 Lawful
Dlvl:5 $:0 HP:54(80) Pw:128(128) AC:3 Xp:15/160000 T:57
```

The `@` is our knight, the `S` is the cobra, the `E` is the elemental,
and the `C`s are the Oracle's statues. He kills the elemental, takes
venom and bites, and at 27 of 80 hit points he does the traditional
thing: he kneels and prays to Lugh. While he prays, helpless, the
cobra slithers under one of the statues to hide.

```
You see the cobra slither under a statue.  You finish your prayer.--More--

                                 ┌───────────┐
                                 │C·········C│
                                 │·····C·····│
                                 │···┌─ ─┐  ··
                                 │···│       │
                                 │··C│
                                 │··S│       │
                                 │···└───┘  ·│
                                 │·····C·····│
                                 │C@········C│
                                 └───────────┘

Wizard the Knight              St:18/01 Dx:9 Co:12 In:7 Wi:14 Ch:17 Lawful
Dlvl:5 $:0 HP:27(80) Pw:128(128) AC:3 Xp:15/160078 T:69
```

Lugh is pleased. The knight teleports on, down through level 10 and
level 20, until the status line reads Dlvl 27 and the game says: You
hear groans and moans everywhere. He has entered Gehennom, and the
game is generating hell. Hold that thought; there is a golem down
there we will need later.

Keep these three scenes: the cobra fight, the prayer, the descent
into hell. Both of the engines in this story replay all 1,813
keystrokes of this expedition. One of them scores every byte
perfectly. Watch what each one actually knows.

## The instrument: logging latent state

Owen Lockwood's entry is in fourth place, and it contains the best
diagnostic tool anyone has built in this contest. The idea
generalizes far beyond NetHack, so let me describe it carefully.

A program's observable outputs are a thin projection of what it is
doing. In this contest, the judged channels are random numbers
consumed and screens painted. Behind them sits the latent state: every
monster's position, hit points, tameness, fear; the hero's condition;
timers; the entire hidden truth of the simulation. The judged
channels are the objective. The latent state is the mechanism.

Owen built a channel for the mechanism. He patched the contest's C
recorder so that at every input boundary it appends one JSON line: the
cumulative count of random draws so far, the hero's state, and the
complete monster chain with a dozen fields per monster. He added a
mirrored dump to his JS engine, gated behind an environment variable
and verified byte-identical off, so the judged run is untouched. And
he wrote a comparator, `oracle.mjs`, that aligns the two streams
boundary by boundary and reports the first divergence: which step,
which entity, which field, both values, and the C source locations
active at that moment.

Run against his own engine on seed4500, after suppressing one known
issue, it prints this — and note where we are: this is the cobra from
the fight at Delphi, five steps before it first bites:

```
  ── FIRST DIVERGENCE ──
  step 261   C-rng#=8124  JS-rng#=8124  canon-cum-rng#=8124
  MON cobra#111 (m_id 111) . mx :   C=39   JS=37
  C rng-callsites at step 261 (14 calls):
     C> rn2(5)=4 @ distfleeck(monmove.c:538)
     C> rn2(8)=3 @ m_move(monmove.c:1963)
  ➜ FIX: m_id 111 moved to wrong cell — m_move/mfndpos at distfleeck (monmove.c:538)
```

Read the second line closely. At step 261 the random-number streams
agree perfectly, 8,124 calls on each side. Every number both games
have ever drawn is identical. And a cobra is standing two cells west
of where it stands in the C game. The judged channels cannot see this
yet; the wrongness will compound silently until, far downstream, a
random number finally disagrees, at which point the symptom will be
thousands of calls from this cause. The latent-state channel catches
it at the boundary where it happened and names the C function to fix.

Notice also how the report knows C source locations at all. The state
dump cannot know them; by the time state is dumped, the code that
wrote it is gone. But each state row carries one extra integer, the
cumulative random-call count, and the contest's recordings already
label every random call with its C callsite. The state channel finds
the wrong fact; the labeled RNG channel names the suspect; the join
between them cost one integer per row. Owen even audits the join: his
oracle cross-checks the state dump's counts against the canonical
recording and reports the boundary past which its own ground truth
has drifted. A verifier for the verifier.

## Pointing the instrument at the perfect score

Here is the experiment I most wanted to run: aim Owen's oracle at the
hill-climbed engine, on the exam it passes perfectly. If overfitting
in a deterministic program means anything, it should mean this: the
outputs are right and the beliefs are wrong. (xeophon's engine has no
state-dump hook, so I added one, seventy-six lines mirroring Owen's,
verified to leave the engine's judged output byte-identical.)

Two findings, on the session where this engine scores
108,275 out of 108,275.

The first is the prayer. At step 292 the knight is on his knees
before Lugh, at 27 of 80 hit points, and the C engine knows what
kneeling means: the hero is helpless, `multi = -3`, three turns
during which the world moves and he cannot. xeophon's hero is not
helpless. His engine produces the same random numbers, but it does
not know the knight is praying. And the cobra's move, the famous
slither under the Oracle's statue, lands on opposite sides of a
keystroke: C draws 18 randoms in that step and takes the snake's
move after the next key, xeophon draws 19 and takes it before. The
global stream is identical, which is why the judge is satisfied; the
attribution of the draws to moments, and the hero's incapacitation,
differ. The engine produces the right numbers while disagreeing with
the original about what is happening in the game.

The second finding is waiting in hell. At step 322 the knight has
descended to Gehennom, the game murmurs that you hear groans and
moans everywhere, and both engines generate the new level with the
same 3,147 draws. Then the oracle prints:

```
  MON stone golem#903 (m_id 903) . mhp :   C=100   JS=18
```

A stone golem with eighteen hit points instead of one hundred.
NetHack assigns golems fixed hit points; it does not roll dice for
them, so no random number ever betrayed the difference, and no screen
displays a monster's health. Every channel the judge has is green.
The golem is simply hollow: the first time any trajectory actually
fights it, it will die five times too early and everything after will
desync. On the public session, the knight never fights the golem.

You may reasonably ask how 108,275 exactly matched random numbers can
coexist with a hollow golem. The answer is that the perfect score is
real, and local. A random-number stream constrains only the state
that feeds it. Think of the exam as a system of equations: the
session's one trajectory supplies an equation for every fact it
consults, and this engine, ground against the fixtures for 1,417
commits until the first divergent draw stopped moving, satisfies
every one of those equations exactly. That took genuine mechanism;
this is no lookup table. But the game's state space holds vastly more
unknowns than one trajectory consults, and every unconsulted fact is
a free variable: it can take any value while the residuals stay zero.
The golem's hit points are a free variable on this path. So is the
hero's helplessness bookkeeping, down to which side of a keystroke
one monster's move lands on. The engine is a polynomial fitted
through 44 points, perfect at the points, unconstrained between them,
and the held-out sessions fail precisely because a new trajectory
cashes in free variables. It is also why the compiled entry is
immune: a compiler does not get to leave unknowns free. It inherits
all the equations at once.

And on the twin, the oracle shows exactly where the engine's
understanding ends: step 264, the middle of ordinary melee, hero hit
points 76 against C's 71, 66 draws where C makes 77, callsites in
`hitum`, `dmgval`, `gethungry`. Not an exotic corner. Bread-and-butter
combat bookkeeping, correct wherever the public fixtures pinned it,
free-floating everywhere else.

## What the story teaches

The moral is not that anyone cheated. Of the three collapsed entries,
one hardcoded openly, and the other two are genuine engines built by
capable agents whose operators did nothing worse than optimize the
number the leaderboard showed them. That is precisely Goodhart's
point: no bad faith is required. An optimizer aimed at a proxy will
satisfy the proxy. Agents are exceptional optimizers, and they will
do this to your test suite, your CI gate, and your dashboard, in
ordinary software, on ordinary teams, with no NetHack anywhere in
sight. The three failure modes on this leaderboard, the answer key,
the launder, and the honest grind that never left the fixtures, are
the same three you will meet there.

The defenses are the two halves of this story.

Densify coverage: a test suite is an exam, and the only way to stop
teaching to it is to generate fresh exams. The C recorder that ships
in every contestant's fork can mint new ground-truth sessions from
any seed, which is how I made the twin in minutes. The one contestant
who generated his own sessions is the one who generalizes.

Densify observation: log the latent state, not just the outputs.
Reveal the decisions your system makes between its visible effects,
the fields nothing displays, the timers nothing has cashed in yet.
Give every log row a join key so channels can be cross-referenced,
report the first divergence rather than a wall of diffs, and gate the
instrumentation so it costs nothing when off. Owen's oracle is a
complete worked example in 489 lines, and the stone golem is what it
sees that a perfect score cannot.

The two densities are complements, not substitutes. Fresh sessions
told us the hill-climbed engines were hollow; the state channel told
us where, to the entity and the field. A team with both has something
better than a score: it has an instrument that converts every failure
into the name of the next thing to fix.

The best part is that Owen's oracle is finished and ready to run: the
campaign map of all 44 sessions prints in one command, and every line
of it names the next C function to fix. I suspect the leaderboard has
not heard the last of him. And the hill-climber's epitaph deserves a
reply, because the model is not lost. The hill was only the public
suite. The map is enormously bigger than the hill, the recorder that
draws new maps ships in every fork, and the instrument that reads
them is one script away.
