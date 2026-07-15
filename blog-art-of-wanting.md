# The Practice of Wanting

*Draft for davidbau.com / mazesofmenace.ai — new version for a
general audience, with specific hints for contestants. Title TBD
(the January post owns "The Art of Wanting"; alternates: "Wanting,
at Scale"; "The Work of Wanting, in Practice"). Pending permission
and review from Owen Lockwood and Florian Brand, whose public
contest entries are discussed below. All program output is real.
[TODO: link for the code-modernization writeup by the company
recently acquired by Anthropic; technique 4 needs DB's development.]*

This week nearly two hundred people — among them fifteen Nobel
laureates, the chief economists of OpenAI and Anthropic, Jack Clark,
Eric Schmidt, and Vinod Khosla — signed a statement titled "We Must
Act Now." "A.I. may become radically more powerful over the next 10
years," they wrote. It "could bring risks, including large-scale job
displacement, as well as opportunities such as major gains in living
standards."

I believe in the radical power. But I have a different prediction
about the work. In January I wrote about
[the art of wanting](https://davidbau.com/archives/2026/01/17/the_art_of_wanting.html):
the idea that as AI takes over the production of things, the
distinctly human work that remains is deciding what we want —
understanding our choices, specifying them with care, and staying
attentive to what we got. Here I want to make that prediction
concrete. I do not think AI will simply displace white-collar work.
I think the main effect of AI deployment will be to make the world
dramatically more complex, and the main challenge humans will face
is navigating that complexity: figuring out what we want, in detail,
in a world where nearly anything can be built. Our need to want
particular things is vast and detailed, and it is not something AI
can do well on its own.

## What we want is enormous

Complexity is emblematic of the great things humans create. When
architects deliver the plans for a building, the plans embody
thousands or millions of little decisions about what somebody wants —
where light falls in a stairwell, how a door closes, which noises
carry. When the Sweetgreen restaurant chain writes the operating
manual for its stores, the manual is millions of little guidelines
for how to create one particular kind of salad eatery and not some
other kind. A jumbo jet is not just a machine for flying through the
air; it is the accumulation of millions of small choices about how
things should be done to create a particular experience for the
passengers, the pilots, and the staff of the airline. In any project
of consequence there is an infinite number of choices to be made, and
there is a difference between dialing it in and making those choices
with attention and care.

Can't an AI make those decisions for us? Won't it be easy? Can't we
just point the AI at some examples and let it figure out what we
want, in its infinite wisdom?

I have been running an experiment on exactly this question.

## A trial problem: porting NetHack

For the past months I have been studying a task that is a scale model
of this problem. Instead of a restaurant-running manual to represent
what humans want, I have the NetHack codebase: 450,000 lines of C and
Lua that enumerate the detailed rules for, basically, how to play a
particular kind of Dungeons & Dragons on a computer. It was developed
over four decades by a devoted group of engineers who call themselves
the devteam, and it stands as an example of "what the devteam wants"
in this particular world — every rule about what a dwarf does with a
pick-axe, what happens when you drink from a fountain, how a pet pony
grows. It is an easier problem than most real-world problems, but it
is difficult in the interesting way, because of its complexity.

The seemingly simple task I have been giving to AI: implement the
same game, down to the last detail, in a different programming
language.

"Porting" code between languages is one of the difficult unsolved
problems in computer science, because different languages are
inherently different. In C, a lot of code is written to manage
memory, allocating and deallocating the blocks in which data is
stored. In JavaScript, a lot of code is written to avoid ever
blocking the main thread, arranging callbacks that respond when
events occur. C code does not tend to contain event handlers
everywhere, and JavaScript does not tend to free and allocate memory
everywhere. (You could write JavaScript in a C style, or vice versa,
but the result would be unreadable.) To translate one into the other
you must understand the *essence* of what the programmer really
wanted, and then express it in the other language while adjusting all
the *details* to fit the other idiom. This is hard enough that there
is a whole industry, called code modernization, in which companies
compete for contracts to rewrite code from older languages like MUMPS
or COBOL into modern ones. [TODO: link — a company recently acquired
by Anthropic wrote about doing such a port.]

And porting is a perfect test of the "just tell it what you want"
theory, because the source program is the most detailed specification
of intent you will ever hand an AI. The C code already distills what
the devteam wants in more detail than any human would ever write down
for another human. If an AI can figure out what we want from
examples and instructions, this should be the easy case: every answer
is in the input. It is the type of thing an AI should be able to do
essentially perfectly, with very little human supervision.

So I have been testing the theory by executing a port of NetHack. I
have written before about
[what this project did to my view of computer science](https://davidbau.com/archives/2026/03/20/does_computer_science_still_exist.html),
and this spring it became
[a contest, called Teleport](https://davidbau.com/archives/2026/05/06/the_teleport_contest.html): port NetHack 5.0 from C to
JavaScript so exactly that recorded play sessions replay bit for bit —
same random numbers drawn, same terminal screens painted. Forty-four
recorded sessions are public. Forty-four more are held out. Here is
the leaderboard as I write:

![The agentic leaderboard, with xeophon boxed in red and lockwo boxed in blue](images/leaderboard-agentic-2026-07-14.png)

The two entries I want to examine are **xeophon** (the agent deployed
by [Florian Brand](https://florianbrand.com/)), at the top of the
agentic category with a nearly perfect score, and **lockwo** (Owen
Lockwood's agent), in fourth place. Because the best contestants are
overfitting, and the way it happens is worth seeing up close.

## What overfitting looks like

Consider session 0103, a short recorded game that both agents
reproduce perfectly — for every keystroke of input, both programs
produce exactly the same screen output as the original C NetHack. The
game even supplies its own soundtrack: a few steps in, the message
line reads, "You've been through the dungeon on a pony with no name."
Then the knight's pony meets a kobold zombie:

<pre>
 <b>NetHack session 0103: Sir the Knight</b>

 The saddled pony bites the kobold zombie.  │  The kobold zombie is destroyed!
                                            │
      ---------------                       │       ---------------
      |.....@u......|                       │       |.....@.......|
      |...&lt;...Z.....|                       │       |...&lt;.u.......|
      |.............|                       │       |.............|
      ---.-----------                       │       ---.-----------
                                            │
  @  the knight     (60,2)   HP  4/16       │   @  the knight     (60,2)   HP  4/16
  u  saddled pony   (61,2)   HP  7/7        │   u  saddled pony   (60,3)   HP  7/8  ← grew
  Z  kobold zombie  (62,3)   HP  2/2        │   <s>Z  kobold zombie  (62,3)   HP  0/2</s>
</pre>

The `Z` disappears from the map and the pony steps forward.
Underneath each frame I have printed what the game's memory holds at
that moment — position and hit points for the hero `@`, the pony `u`,
and the zombie `Z`. None of those hit points appear anywhere on the
screen. Two things happen in NetHack when a pet makes a kill, and
neither of them touches the screen. The victim is struck from the
monster ledger — the crossed-out row is the zombie's entry at the
moment of removal, bitten down to 0 of its 2 hit points and taken off
the books. And the killer grows from the experience: the pony's
maximum hit points rise from 7 to 8. The original C NetHack does
both. **lockwo** does both also, matching the internals. But look at
what **xeophon** does:

<pre>
 <b>xeophon's port</b>

 The saddled pony bites the kobold zombie.  │  The kobold zombie is destroyed!
                                            │
      ---------------                       │       ---------------
      |.....@u......|                       │       |.....@.......|
      |...&lt;...Z.....|                       │       |...&lt;.u.......|
      |.............|                       │       |.............|
      ---.-----------                       │       ---.-----------
                                            │
  @  the knight     (60,2)   HP  4/16       │   @  the knight     (60,2)   HP  4/16
  u  saddled pony   (61,2)   HP  7/7        │   u  saddled pony   (60,3)   HP  <span style="color:#c00">7/7  ← never grows</span>
  Z  kobold zombie  (62,3)   HP  2/2        │   <s>Z  kobold zombie  (62,3)   HP  <span style="color:#c00">2/2</span></s>
</pre>

Look closely, because **xeophon** seems to get almost everything
right. The screens are identical: **xeophon** scores perfectly on
this game, matching every screen, so at this step the pony steps and
the zombie is eliminated, exactly as they should be. But look at
**xeophon**'s internal representation of the pony and the zombie, and
you will notice that the hit points are wrong. The zombie took no
damage before it was removed — it goes off the books at 2/2, where
the real one died at 0/2 — and the pony didn't grow its additional
maximum hit point. It is as if no combat occurred.

How did **xeophon** get the screen to look right without doing the
combat? The source code answers. When a pet's kill unfolds behind a
`--More--` prompt, the work is done by a hand-built state machine
whose name gives the story away:

```js
if (game._command_mode === 'ponyDamageMore') {
    ...
    d(1, 2);                        // the bite's damage dice — rolled, discarded
    ...
    const messages = [`The ${targetName} is destroyed!`];
    ...
        rnd((data.mlevel ?? 0) + 1); // grow_up's roll — burned, growth never applied
    ...
    game.level.monsters = (game.level?.monsters || []).filter(mon => mon !== target);
```

(The comments are mine; the code has none.) The judge checks two
things: the screens, and a counter of random numbers drawn. So this
code prints the right message, deletes the monster from a list so the
map repaints correctly, and rolls the same dice C would roll — then
throws the results away. The dice are rolled for their count, not
their consequences. The whole machine is gated, one file over, on the
condition `if (mon.saddled && mon.data?.name === 'pony')` — not "when
a steed's kill resolves during message paging," but literally *when a
saddled pony does this*, because the only creature that ever needed
this path in the public sessions was this knight's pony. Meanwhile
**lockwo**, which does the combat for real — its port of the growth
function actually grows the pony — *fails* this same session, docked
three screens of cosmetic display misses, 57 of 60. The exam and the
truth have parted company: the failing engine keeps the truer world.

Nobody demanded this. Nobody hardcoded a screen. The agent was
rewarded for matching screens and dice, it is an exceptional
optimizer, and the errors that survive such optimization are, by
natural selection, exactly the ones the judge cannot see.

## We care how things are done

Here is what I find most instructive about the pony. The contest
never actually cared about the screens. The screens were a proxy — a
convenient, checkable stand-in for the real goal, which was to
recreate the *game*: the world, the rules, the growth of ponies. This
is an excellent example of how we don't really care about matching
some outcomes; we care how things are done. And when we ask AI to do
things the way we want, it is not enough for it to match an outcome.
We need ways to understand, guide, and constrain the way things are
done as well.

There are four main techniques I know for doing this, and as I have
been porting NetHack I have found that all four are necessary. Each
deserves an article of its own, and I will write more about them in
the future; but they come down to these.

**1. Taming time.** Focus not just on the endpoint but on the hidden
processes that get there. An outcome is one moment; the work is a
trajectory, and almost all of it is invisible in the result. This is
where Owen's instrumentation shines. He patched the contest's C
recorder to dump, at every keystroke, the hidden state of the
simulation — every monster's position, hit points, tameness, fear —
taught his own engine to dump the same, and built a comparator that
reports the first disagreement and names the C function that was
executing when it happened. Instrumenting the steps and states along
the way demystifies hidden state, and lets you build assertions
about what states you want, in what order, and when. The pony's
missing hit point flags at the moment of the kill, while it is still
just a wrong number in a ledger — not ten thousand events later,
when it finally bends something visible and the archaeology begins.
*Hint for contestants: the recorder ships in every fork; a
per-keystroke state dump plus a diff is an afternoon of work, and it
converts invisible wrongness into a work queue.*

**2. Regularizing the structure.** Create systematic mandates about
the mechanisms used, the way a type-checker makes sure a system
follows particular rules. Both top contestants gave their agents
written standing orders, and both forbade hardcoding and required
citations to the C source. The difference is what the rules made
*structural*. **lockwo**'s every task was required to name the C
function being ported, with the C source attached; its merge gate
accepted a change only if the total score strictly improved and no
session regressed. Under those mandates, "fake the dice" is not a
reachable move — the structure of the work only admits ports of
causes. **xeophon**'s rules were fine sentiments checked by nothing
structural, and the loop's natural unit of work collapsed to "make
the next divergent screen match." *Hint for contestants: hand your
agent the enclosing C function, never the failing screen, and let a
mechanical gate — not a sentiment — enforce your rules.*

**3. Amassing experience.** Collect and compose real-world tests and
simulated hypotheticals. The forty-four public sessions are real
experience, but they stop measuring anything once you have fit them.
So I manufactured hypotheticals: I took the exact keystrokes of a
public session, changed nothing but the dungeon seed, and recorded
fresh ground truth from the original C program — a held-out session
of my own, one seed away from the exam. On that fresh ground,
**xeophon**'s world held a grid bug — NetHack's little joke monster,
which can only step north, south, east, or west — parked three
squares from its true position, in the dark, on the far side of the
map, for sixty straight keystrokes. **lockwo**, on the same fresh
ground, tracked the bug square for square, move for move. An engine
that learned the sessions drifts the moment the world is new; an
engine that learned the game does not. *Hint for contestants:
generate your own held-out twins before the judges generate theirs.*

**4. Amplifying human insight.** In the end a human must judge, and
the tools that matter most are the ones that put human judgment
where it counts. Owen's oracle does not just detect that something
is wrong; it prints, at the end of each report, the name of the C
function to fix. It converts an ocean of hidden state into a short
list a person can reason about, prioritize, and veto. [TODO: DB to
develop this one further — future article.]

I think these four techniques are emblematic of what "white-collar
work" will entail in a world of AI. AI will make all four easier by
automating many things — but it will not do them for us. The
backbone of each is judgment. We need to judge what we care about
enough to instrument, to measure, to set rules for, to understand —
because we do not care about everything, and we cannot check
everything. AI will not do the caring for us. In dealing with the
complexity it creates, there will be an enormous amount of judgment
required, and that judgment is the work.

## The work ahead

Which brings me back to the statement and its warning about
large-scale displacement. What this small, controlled experiment
suggests is not that the work disappears; it is that the work moves.
The two agents here wrote, between them, more correct systems code
in weeks than most teams write in years. But every place the port
went right, a person had decided, with attention and care, how it
should be done: what to instrument, what rules to make structural,
what experience to amass, where to point their own attention. And
every place it went hollow, an outcome had been allowed to stand in
for the wanting.

NetHack's 450,000 lines are four decades of a devteam deciding, rule
by rule, what they want a world to be. The AI era will ask that kind
of deciding of us everywhere — in our buildings, our restaurants,
our jets, our institutions — because when the machines can build
almost anything, the burden shifts to knowing what we want built,
and to noticing what we actually got. That is not a job that is
going away. It is the job that is arriving.
