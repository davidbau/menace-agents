# Homework: Fifteen Ports and Fifteen Extensions

*Companion to [LESSONS.md](LESSONS.md), which explains the principles
these projects teach, and the [technique catalogue](data/analysis-techniques-catalogue.md),
which documents the full-scale project the exercises imitate.*

Each of these projects asks you to rebuild a famous piece of software
so exactly that a mechanical judge cannot tell your version from the
original. Then each asks you to build something new on top of your
copy, held to the same standard of quality.

The first nine projects look old fashioned. Chess programs, chip
emulators, a text formatter from 1982. That is deliberate. Old
programs are deterministic: they consult no network, no clock, no
outside world, so they can be replayed and compared byte for byte. And
old programs have accumulated something priceless: decades of test
culture. For every one of those projects, some community has already
built the measuring instruments, the torture tests, the golden
reference logs. You get to inherit them.

The last six projects are modern and interactive: collaborative
editing, terminals, vim, WebAssembly, a game-playing agent engineered
for exact replay, and finally an AI-assisted collaborative diagram
editor, the one project on the list whose reference implementation
does not exist. They are on the
list because they pass the same test the old ones do, an exact,
machine-checkable definition of correct, but with a difference that is
itself the lesson: in modern interactive software, determinism is not
inherited. It must be purchased, with recorded sessions, captured
inputs, and judges you sometimes have to harvest from the reference
yourself. The old wing teaches you the method where determinism is
free. The modern wing teaches you to buy it where it isn't.

Why ports at all? Because a port is the one kind of project where an
AI agent's work can be verified completely. There is a right answer
for every byte. You will spend almost none of your time writing code.
You will spend it building the machinery that determines whether the
code your agents wrote is true: recorders, comparators, checkers, test
generators, visualizations. That machinery, not the port, is the
skill this course teaches. The second track of each project, the
extension, is where you learn that the same machinery lets you build
new things at a level of fidelity that used to be unaffordable.

Every project passes the same checklist: a deterministic reference
exists, a frozen judge already exists (or, in one deliberate case, you
must build it), a real-world corpus exists for held-out testing, and
the port crosses some gap between languages that makes the work
instructive rather than mechanical. The judge doubles as an
autograder, so none of the grading is a matter of opinion.

| # | Project | Scale | The judge |
|---|---------|-------|-----------|
| 1 | Chess move generation | a weekend | published perft tables |
| 2 | A CPU emulator | 1–2 weeks | golden state traces, test ROMs |
| 3 | A FLAC audio decoder | 1–2 weeks | byte-identical output vs. the reference |
| 4 | Git, from scratch | 2–3 weeks | hash equality (the math is the judge) |
| 5 | The awk language | 2–3 weeks | byte-exact runs of 50 years of scripts |
| 6 | The Lua language | 2–4 weeks | the official test suite |
| 7 | Rogue, with PRNG parity | 2–4 weeks | none. You build it. |
| 8 | DOOM, demo-faithful | 4–8 weeks | 30 years of recorded speedruns |
| 9 | TeX, passing TRIP | 6–12 weeks | Knuth's 1984 torture test |
| 10 | A collaborative editor | 2–4 weeks | convergence fuzzing + a live Etherpad server |
| 11 | A terminal emulator | 2–3 weeks | vttest, esctest, and recorded real sessions |
| 12 | Vim's editing engine | 3–5 weeks | headless vim itself + the VimGolf corpus |
| 13 | A WebAssembly interpreter | 3–5 weeks | the official spec test suite |
| 14 | A deterministic autoagent | 3–5 weeks | replay: same seed, same game, byte for byte |
| 15 | AI-assisted collaborative digram | 4–6 weeks | convergence + byte-identical rendering, AI recorded at the boundary |

---

## 1. Chess move generation, verified by counting

Chess is easy to describe and surprisingly hard to implement exactly.
The pawn moves one square forward, except when it moves two, except
when it captures diagonally, except when it captures a pawn that isn't
on the square it's capturing (en passant), except when any of those
moves is illegal because it would expose your own king. A move
generator is a function that takes a chess position and lists every
legal move. Every chess program has one at its core, and almost every
first attempt at one is wrong in ways that take weeks to notice.

The chess programming community solved the verification problem
decades ago with something called perft, short for performance test.
Perft(n) counts every sequence of legal moves from a position, n moves
deep. From the starting position there are 20 first moves, 400
two-move sequences, 8,902 three-move sequences, and at depth six,
exactly 119,060,324. Not approximately. Exactly. These numbers are
published, cross-checked by generations of chess programmers, along
with counts for trap positions with names like Kiwipete that were
constructed to contain every nasty interaction at once: en passant
captures that expose the king, castling through attacked squares,
promotions on the seventh rank.

This is the purest possible introduction to working against an exact
oracle. One number summarizes a hundred million execution paths. If
your generator misses one en passant pin somewhere in that tree, the
count is wrong, and the count cannot be argued with. When it is wrong,
you learn the bisection discipline: perft can be split per move, so a
wrong count at depth six can be narrowed, move by move, to the exact
position where your program and the truth disagree. You will use this
skill in every project that follows.

**The assignment.** Build a move generator that matches the published
perft tables for the standard positions and the trap positions,
including Chess960 castling. Then import competence: take a database
of a few million recorded master games and replay all of them,
asserting that every move actually played appears in your generated
move list. Real games exercise corners that random testing never
reaches.

**The extension.** Your first generator should be written to be
obviously correct, which means it will be slow. Serious chess programs
use bitboards: the board represented as 64-bit integers, one bit per
square, with moves generated by bit arithmetic at a hundred times the
speed. Write the fast version, and verify it against your own slow
version over millions of random positions. Two implementations,
written differently, agreeing everywhere: this is the
dual-implementation oracle, and it is how you make a program fast
without losing your grip on whether it is still right. Alternatively,
become the reference: pick a chess variant that lacks published perft
tables, compute them, document your verification method, and publish.
Every future implementer of that variant will test against you.

---

## 2. A CPU emulator: running 1989 software, bit for bit

A CPU executes instructions: load this number, add these registers,
jump if the result was zero. An emulator is a program that pretends to
be a particular chip, faithfully enough that software written for the
real silicon runs unmodified. Emulation is how software history
survives. Every time you see an old game running in a browser, an
emulator is underneath, and its quality is measured by a brutal
standard: the original cartridge ROM, byte for byte the same bits
that shipped in 1989, either runs correctly or it does not.

Why is this hard? A chip like the 6502 (the processor in the Apple II,
the Commodore 64, and the NES) has a few hundred instruction variants,
and each one has exact semantics: not just what it computes but which
status flags it sets, in what order, in how many cycles. The flags are
single bits recording things like whether the last addition carried or
came out zero, and real programs branch on them constantly. Get one
flag subtly wrong in one instruction and some game, somewhere,
misbehaves in a way that looks like anything but a flag bug.

Here is what makes this project a gift: the emulator community
independently invented the same verification methodology our NetHack
project used, and left the instruments lying around. Tom Harte's
ProcessorTests are JSON files containing, for every instruction,
thousands of test cases, each recording the complete CPU state before
and after: an intermediate-event channel, prebuilt. The NES community
maintains nestest.log, a golden log of a real test program's
execution, one line per instruction with every register value, so you
can diff your emulator's trace against truth line by line. And
programmers like Blargg wrote test ROMs: programs that run on the
emulated machine itself, probe its behavior, and print pass or fail on
its screen. Torture tests, golden traces, held-out real cartridges.
The whole stack is waiting for you.

**The assignment.** Warm up with CHIP-8, a toy virtual machine from
the 1970s with about 35 instructions; it takes a weekend and teaches
the shape. Then build a 6502 or Game Boy CPU. Pass the Harte tests
instruction by instruction, then match nestest.log line for line, then
pass the Blargg ROMs. Notice the day your emulator passes every
per-instruction test and still fails the golden log. The bugs that
live between instructions, in the integration, are the reason
single-unit testing is never enough, and it is better to learn that
here than on a million-line project.

**The extension.** Your emulator is deterministic; you proved it.
Determinism buys you time travel. Keep a ring of state snapshots and
you can rewind a running game like video: scrub backwards, step
forward one instruction at a time, fork an alternate timeline from any
point. Build that debugger. It is a small version of the reversible
execution engine our project spent months on, and once you have used
one you will not want to debug any other way. Or become the
reference: find a processor that lacks Harte-style test coverage,
instrument real hardware or a trusted emulator to record
before-and-after state for every instruction, and publish the JSON.
That contribution outlives the course.

---

## 3. A FLAC decoder: compression with a perfect answer key

Audio compression comes in two kinds. Lossy formats like MP3 shrink
music by throwing away detail your ear probably won't miss. Lossless
formats keep every bit: FLAC, the standard lossless format used by
archives, libraries, and everyone who cares, is like zip for music.
Compress a recording, decompress it, and you must get back the exact
original samples. Not close. Exact.

That definition makes FLAC a jewel for this course, because the test
is absolute and the corpus is infinite. Decode any FLAC file with your
decoder and with the reference implementation, and the outputs must
match byte for byte. Any music collection is a test suite. There is
no judgment call anywhere.

The difficulty is all in the exactness. FLAC works by linear
prediction: it predicts each audio sample from the samples before it
and stores only the prediction error, using a variable-length integer
code. The arithmetic is integer arithmetic, specified to the bit, and
the temptation you must resist is floating point. The moment a float
sneaks into your decode path, your output will be almost right, which
in this course is a synonym for wrong. This project is where the
discipline of exact arithmetic gets into your hands.

**The assignment.** A decoder that produces byte-identical output
across a large corpus: normal files, plus adversarial ones you encode
yourself with strange block sizes, odd bit depths, and every encoder
setting. The held-out set is files encoded with settings you never
tested against.

**The extension.** Make it ten times faster without changing one
output bit. Vectorize, parallelize across workers, move it to the
GPU, restructure however you like: the frozen judge is that every
file still decodes identically. Optimizing under an exact oracle is
its own skill, and this is its cleanest exercise: total freedom on
one axis, zero freedom on the other. As a closing seminar, read the
MP3 conformance spec, which defines a correct decoder as one within a
numerical tolerance of the reference. Some standards demand exactness
and some price it out. Learning to spot which kind of spec you are
holding is worth a lecture on its own.

---

## 4. Git, from scratch, judged by mathematics

You use git every day. This project is about discovering that
underneath the commands, git is a small, beautiful database with one
central idea: everything is stored under the fingerprint of its own
content. Every file, every directory listing, every commit is hashed,
and the hash is its name. Two objects with the same name are the same
bytes, guaranteed by the mathematics of the hash function.

That idea does something remarkable for us: it makes the system
self-judging. If your from-scratch git commits a directory tree and
produces the same 40-character commit hash as real git, then every
byte of every object underneath agreed: file contents, directory
structure, timestamps, author, message, formats, everything. There is
no test harness to build. The hash is the judge, and it cannot be
sweet-talked.

The difficulty is precision across a wide surface. Git's object
formats are exact: headers, compression, the canonical sort order of
directory entries (which is not quite alphabetical, and the difference
will cost you an afternoon). And matching hashes forces the
determinism discipline on you immediately: commit timestamps,
timezone offsets, author identity all feed the hash, so your test
setup must pin every one of them. In our terminology, you cannot even
begin until you have bought determinism, and this project makes you
buy it in the first hour.

**The assignment.** Implement init, hash-object, add, commit, log, and
checkout, producing hash-identical objects on real repositories. Take
repositories from the wild, replay their content through your
implementation, and verify with git's own consistency checkers. Wild
repositories are the held-out set; they contain history your own test
repos never will.

**The extension.** Interoperate over the wire. Git has a network
protocol; implement enough of it that your client can clone a
repository from a real server, and push back, byte-verified on both
ends. Interop with a server you do not control, against an
implementation you did not write, is a different and more honest
standard than passing your own tests. Alternatively, keep the outside
bit-identical and change the inside: store objects in SQLite instead
of files, with every hash and every wire byte unchanged. Exact
compatibility on the surface and innovation underneath are independent
axes. Proving that with your own hands is the point.

---

## 5. awk: porting a whole language in three weeks

awk is a tiny programming language from 1977, named for its authors
Aho, Weinberger, and Kernighan, designed for one job: processing text
a line at a time, split into columns. It is still everywhere. Fifty
years of shell scripts, build systems, and one-liners depend on it,
which means fifty years of real programs exist to test against.

The excitement here is scope: this is a complete programming language,
with variables, functions, regular expressions, and arrays, and it is
small enough to port completely in weeks. Byte-exact for a language
implementation means something stricter than you might expect: not
just correct results but identical output formatting, identical error
messages, identical exit codes. The devil lives in the corners: awk's
rules for when a value is a string and when it is a number, what an
uninitialized variable equals, the exact rounding of `printf %g`.

And this project teaches one honest lesson none of the others do. Run
the classic awk and GNU awk on the same corner cases and you will
discover that the references disagree with each other. Now what is
your ground truth? The spec, one implementation, or the behaviors they
share? You will have to decide, document the decision, and defend it.
Real verification work always contains this moment, and it is better
to meet it on a small language than a large one.

**The assignment.** An awk that is byte-exact against the reference on
a curated corpus of real scripts from the wild, plus a generated
adversarial set aimed at the coercion rules, the getline variants, and
the formatting edge cases. Differential-test against both references
and maintain an explicit, documented list of every place they
disagree and what you chose.

**The extension.** Write a compiler: awk source in, JavaScript out,
running much faster than your interpreter. The judge is one you built
yourself. Every script in the corpus, compiled and run, must produce
byte-identical output to the same script interpreted. Your Track A
interpreter becomes the oracle for your Track B compiler. When the
two disagree, one of them is wrong, and finding out which one is the
best debugging education I know.

---

## 6. Lua: the port with a trap in the middle

Lua is a small, elegant scripting language from PUC-Rio in Brazil,
and you have probably run it without knowing: it is the embedded
language inside World of Warcraft, Roblox, Redis, and Neovim. The
reference implementation is about thirty thousand lines of unusually
clean C, and it ships with an official test suite that checks
everything down to the text of error messages. A real language, used
by millions of people, small enough to port completely. That is a
rare combination.

But I am assigning Lua for one specific reason, and I will tell you
the trap in advance because knowing about it will not save you from
it. Lua has coroutines: functions that can pause themselves in the
middle, even deep inside nested calls, and be resumed later. C can
implement that by saving the machine stack. JavaScript cannot pause a
call stack; the language forbids it. So somewhere in your port, a
capability the source language takes for granted must be rebuilt on
top of a target language that lacks it, and the problem cuts across
every function in the interpreter. You cannot fix it locally. You
cannot test your way out of it. You must confront it as architecture:
transform the interpreter so every call can suspend, or lower
coroutines onto JavaScript generators, or build an explicit stack
machine. Each choice ripples through everything.

This is the same shape of problem that dominated our NetHack port,
where C's blocking input had to become JavaScript's async, and it is
the shape that killed our second experimental port, which deferred
the question and hit an architectural ceiling it could never climb
out of. The gap between language semantics is where porting projects
die, and the deaths are always scheduled early and discovered late.

**The assignment.** A Lua 5.4 passing the official suite, error
messages and all. But the first deliverable, due in week one before
any porting begins, is a design memo on coroutines: which strategy,
why, and a working prototype of one coroutine pausing inside three
nested calls. Test the killer constraint first. The memo is graded
pass/fail, and starting the port without it fails the project. I am
not being dramatic; I am pricing the lesson at its historical cost.

**The extension.** Give Lua something the reference cannot do:
serialize a running program. Snapshot the entire state of the VM,
live coroutines included, to bytes; restore it in a fresh process,
possibly on a different machine; resume exactly where it left off.
This is genuinely useful (it is how durable workflow engines and game
saves want to work) and it has an exact standard of correctness: a
program that is snapshotted, restored, and resumed must produce
output byte-identical to the same program run without interruption.
New capability, frozen oracle. That combination is the theme of this
whole course.

---

## 7. Rogue: this time, nobody hands you the judge

Rogue is the 1980 game that named the roguelike genre: descend a
randomly generated dungeon, drawn in ASCII, and die. It is about
fifteen thousand lines of old C, and its dungeons are generated from a
seeded random number generator, which means the game is secretly
deterministic: same seed, same dungeon, same monsters, and given the
same keystrokes, the same game, every time.

Every previous project handed you a judge that some community spent
decades building: perft tables, processor tests, torture inputs. This
project hands you nothing, on purpose, because building the judge is
the curriculum. This is the project that is a miniature of the real
one. In our first NetHack-family port, agents brought Rogue to near
total parity in days once the verification machinery existed. The
machinery was the hard part. Now it is your turn to learn why.

**The assignment**, in strict order, and the order is the lesson:

1. Make the reference deterministic and observable. Patch the C so it
   records its random-number calls and screen output directly from
   inside the program, with no terminal emulator or timing machinery
   between the game and the log. If you capture through a terminal
   layer you will get misaligned frames, and misaligned ground truth
   converts engineering into guesswork. This step looks like plumbing.
   It is the foundation of everything.
2. Define your session artifact: seed, keystrokes, and the recorded
   truth, in one replayable file. Every later tool consumes this one
   format.
3. Build the comparator with three channels: random-number stream,
   game events, final screens. The middle channel, the events, is the
   one beginners skip and experts consider the point: it catches
   divergences near their causes instead of thousands of steps later.
4. Now, and only now, port the game, driving your session corpus to
   parity.
5. Run divergence hunts across hundreds of fresh seeds and report
   first-failure depth: how deep into a session the first mismatch
   appears. Watch that number grow as your port converges. That
   number is what done looks like.

The harness is graded as heavily as the port, because the harness is
what you will still know how to build ten years from now.

**The extension.** Build a player. An automatic Rogue player that can
survive and descend is a test generator of a kind money cannot buy:
it reaches game states that random keystrokes never touch, and every
game it plays becomes a session in your corpus. Keep a strict wall
between the player's strategy and any information it could only get
from your oracle instrumentation, and enforce the wall mechanically.
An automated player that quietly reads the oracle is the fastest way
to make all your numbers beautiful and false.

---

## 8. DOOM: judged by thirty years of recorded speedruns

DOOM, from 1993, has a feature that makes it perfect for us: demos.
The game records your inputs, thirty-five times a second, into a small
file, and can replay them later. Nothing else is recorded, only the
inputs, so a replay stays correct only if the engine recomputes every
tick of the game identically: every monster's movement, every pseudo-
random damage roll, every collision, in exactly the original order. If
your engine computes one thing differently, the replayed player walks
into a wall while the recorded inputs keep going, and the whole replay
dissolves into nonsense. The community's word for this is desync, and
their intolerance for it built us a judge of terrifying thoroughness:
the Doom Speed Demo Archive holds tens of thousands of expert
recorded runs, and a faithful engine must play all of them, from 1994
to now, without desyncing once.

Notice what this gives you compared to the earlier projects: the
corpus of expert play, which in Rogue you had to generate with your
own bot, already exists here, curated by thirty years of speedrunners.
Recorded human competence, free. And the culture of exactness exists
too: a project called Chocolate Doom preserves the original engine's
behavior deliberately, bugs included, precisely so there is a living
reference.

The hard parts are the original's fixed-point arithmetic, its
256-entry random number table, monster behavior full of decades-old
quirks, and, most instructively, places where the original C does
things the C standard calls undefined but the 1993 binary resolved
one consistent way. Faithful to what, exactly, the standard or the
binary? You will develop opinions.

**The assignment.** A JavaScript DOOM that plays a corpus of archive
demos without desync. For ground truth beyond pass/fail, instrument
the reference: modify Chocolate Doom to log a fingerprint of game
state every tick, then diff your engine's fingerprints against it, so
a desync is localized to the exact tick and subsystem where reality
diverged rather than discovered minutes later as a ghost walking into
a wall. Held out: demos from map and category combinations you never
tested during development.

**The extension.** Rollback netplay. Modern online fighting games hide
network delay with a trick that only works on a deterministic engine:
predict the remote player's inputs, and when the real inputs arrive
and differ, rewind the game a few ticks and replay with corrections,
faster than perception. You have proven your engine deterministic, so
you have earned the trick. The correctness standard is exact: a
timeline that was rolled back and replayed must end bit-identical to
one that never was. Or serve the community that gave you your test
corpus: build the desync diagnosis tool speedrunners lack, one that
takes a demo that desyncs on a modern engine and reports the first
divergent tick and the subsystem responsible. They will actually use
it.

---

## 9. TeX: the capstone, and a forty-year-old torture test

TeX is the typesetting program Donald Knuth wrote in 1982 because he
could not stand how the second edition of his book looked. It is
still, today, the program that typesets essentially all of
mathematics and physics. It is about twenty-five thousand lines, and
it is the most thoroughly documented program ever written: Knuth
published the entire annotated source code as a book you can buy.

Knuth also did something in 1984 that this whole course has secretly
been about: he built a verification tradition for ports of his
program. It is called the TRIP test. TRIP is a single input file of
concentrated malice, designed not to look like a document but to
march through every dark alley of the program: error recovery,
boundary values, the strangest corners of the macro language. A port
must reproduce TeX's outputs on TRIP, and not only the final output:
it must match the trace log, in which TeX prints its internal
workings, box by box, so the test constrains how the program computed,
not just what came out. Knuth then attached the strongest incentive in
software: you may only call your program TeX if it passes. Every
serious TeX port for forty years has been judged this way. When you
take this project on, you are joining that tradition, and here is the
striking fact: no from-scratch TeX in JavaScript, Rust, or Python has
ever passed TRIP. The one hand reimplementation that ever passed, a
Java system called NTS, took a funded team years around the turn of
the millennium, and the project that tried to succeed it never got
there. That is the human baseline you are being measured against.

Why is it hard? TeX is a macro language of unusual depth, an
arbitrary-precision paragraph optimizer, a hyphenation engine, and a
compulsively exact arithmetic discipline: Knuth did all the
typesetting math in fixed-point integers specifically so that every
computer ever built would compute identical documents. Determinism
was designed in, in 1982, for exactly the reasons this course keeps
repeating.

**The assignment.** A from-scratch TeX passing TRIP, matching Knuth's
master log and output files through the standard comparison tools.
Then the e-TeX extension and its own torture test. Then load a frozen
LaTeX (LaTeX, the system most people actually use, is not a separate
program: it is a large macro library that runs on top of TeX, so a
faithful engine gets it nearly free) and face the held-out corpus: a
sealed sample of real arXiv papers, each of which compiles under
canonical TeX to exact ground-truth output. And one optional
experiment I would genuinely like to see published: since Knuth's
source is a book of prose explaining the code, run the port twice,
once with the prose available to your agents and once with it
stripped, and measure whether the finest documentation in the history
of programming actually helps.

**The extension.** Three options, in ascending ambition. First:
extract TeX's paragraph-breaking algorithm, the one that chooses line
breaks by optimizing over the whole paragraph while browsers still
mostly decide line by line, and package it as a web library, verified
to choose the same break points as real TeX across a corpus.
Typography of TeX's quality, native to the web, as a component.
Second: extract the mathematics engine. What MathJax approximates at
great and honorable effort, you make exact: port TeX's math layout
with its fixed-point arithmetic and font metrics, render to SVG, and
verify glyph positions against ground truth over a million arXiv
formulas. Third: modern fonts, the path the XeTeX project took,
grafting contemporary font shaping onto the engine while keeping TRIP
conformance in compatibility mode. Each option is a real contribution
to a forty-year ecosystem, and each is held to the standard the
ecosystem already speaks: exact agreement with the reference where
agreement is claimed.

---

## 10. A collaborative editor: correctness means convergence

You have used Google Docs: several cursors moving at once, no save
button, no conflicts, no locked files. Under the hood, every keystroke
becomes a small operation broadcast to the other participants, and the
hard problem is reconciling operations that happened concurrently, so
that everyone's copy of the document ends up the same. Two families of
algorithms do this: operational transformation, which rewrites
concurrent operations against each other, and CRDTs, data structures
designed so that merging cannot conflict. The classic open-source
system is Etherpad, built in 2008 and open-sourced when Google
acquired the team; its changeset protocol, called easysync, is
documented, and a real Etherpad server is a download away.

What makes this a course project is that the correctness property is
exact and machine-checkable: **convergence**. After any pattern of
concurrent edits, delivered in any order the protocol allows, every
replica must hold the byte-identical document. And the field carries a
famous warning that belongs in this course: several published,
peer-reviewed collaborative-editing algorithms were later shown by
mechanical checking to violate their own claimed properties. Confident,
plausible, wrong, and undetected until somebody built the judge. Your
fuzzer gets to rediscover why paper arguments are not oracles.

**The assignment.** Implement easysync exactly: changesets that parse,
compose, and transform byte-compatibly with the reference. Prove it
two ways. First, interoperate: your client joins a pad on a stock
Etherpad server, edits alongside a stock client, and never diverges.
Second, fuzz for convergence: generate random concurrent edit
histories, deliver them in many permitted orders, and assert that all
replicas converge to identical bytes. Held out: fuzz seeds and
concurrency patterns you never ran during development. (A
CRDT-compatible implementation, verified against Automerge, is an
acceptable alternative substrate; the oracle is the same.)

**The extension.** Time travel for documents. Your protocol already
records every operation, which means a document's entire history is a
replayable session: build the scrubber that plays a document backward
and forward like video, and the fork that branches a document at any
past revision into a new live pad. The oracle is replay: reconstructing
any historical revision from the operation log must reproduce the
stored document byte for byte. Hold onto this project when it is done.
The verified collaboration core you built here is a load-bearing part
of project 15, where the collaborators stop all being human.

---

## 11. A terminal emulator: the instrument our project had to fight

The terminal window you use every day is an emulator of a piece of
1978 hardware, the DEC VT100. Every command-line program speaks to it
in escape sequences: invisible byte codes that mean move the cursor
here, switch to red, scroll this region. Get them right and vim and
htop paint perfectly. Get one subtly wrong and the screen turns to
garbage, but only for some programs, only sometimes. This is not an
antique concern: xterm.js, a terminal emulator in JavaScript, sits
under the terminal panel of VS Code, so you probably used one today.

The difficulty is accretion: hundreds of sequences and modes layered
over forty-five years, including famous traps like the last-column
wrap rule, which defers wrapping in a way that bites essentially every
implementer. And the ground truth exists twice over. vttest is a
torture program from the 1980s, still maintained, that walks an
emulator through the dark corners. esctest is a suite of per-sequence
unit tests built for iTerm2. For a corpus, asciinema, the tool people
use to record and share terminal sessions, has a public archive of
thousands of real recordings, which are simply the raw output bytes.
Replay those bytes into your terminal and into a trusted reference
which you have instrumented to dump its cell grid (you build the
ground-truth channel yourself, the same move as the DOOM project),
and compare grids cell by cell: character, color, attributes, cursor.

One personal note. Our NetHack project's first infrastructure
investment was *removing* a terminal layer, because its timing and
queuing destroyed the determinism of our recordings. In this project
you build that layer itself, exactly, and you will come to understand
from the inside why it was the thing that had to go.

**The assignment.** A VT100/xterm-subset terminal that passes the
vttest and esctest scenarios within your scoped subset, and renders
grid-identical to the reference across an asciinema corpus. Held out:
recordings you never replayed during development.

**The extension.** The time-machine terminal. Because your replay is
exact, your entire terminal history becomes a database: scrub any
session backward and forward like video, search across time by screen
contents, find the moment that error message was visible and step
backward to what caused it. No mainstream terminal offers this.
Alternatively, performance under a frozen oracle: a GPU-rendered
terminal, cell-identical to the reference on the whole corpus, fast
enough to brag about, with zero fidelity budget spent.

---

## 12. Vim's editing engine: verify what everyone else imitates

Vim is the modal editor: in normal mode, keystrokes form a little
language, where `d2w` deletes two words and `ci(` changes the text
inside parentheses. Millions of programmers have it in their fingers,
and because they do, every modern editor ships a "vim mode": VS Code's,
CodeMirror's, IntelliJ's. Here is the open secret: all of them are
approximations. Hand-written imitations, each famous among vim users
for being almost right, with corners (registers, counts applied to odd
operators, undo grouping) that quietly differ. None of them is
verified against vim. The economics never allowed it. You know by now
where this is going.

The ground truth is free, because vim itself is replayable: it can run
headless, read a keystroke script, and write out the resulting buffer.
So an input file plus a keystroke sequence is a session, and the
reference's exact answer costs one command to produce. Better still,
there is a corpus of recorded expert play: VimGolf, a long-running
game where players solve editing challenges in the fewest possible
keystrokes. Thousands of challenges, each with an input file, a target
output, and recorded solutions of absurd cleverness that exercise
exactly the obscure command interactions an imitation gets wrong.
DOOM has speedrun demos; vim has golf.

**The assignment.** An engine for a scoped subset of vim (normal mode
plus the basics of ex commands) that matches headless vim byte-exact,
buffer and cursor position both, across the VimGolf corpus for your
subset, plus adversarial random-keystream fuzzing run differentially
against real vim. Keep a documented registry of the version-dependent
corners you discover; there will be some, and deciding what counts as
truth when the reference itself wobbles between versions is part of
the assignment.

**The extension.** Ship the exact vim mode: a drop-in replacement for
the vim mode of CodeMirror or Monaco that is verified rather than
imitative, with its corpus pass rate published as the feature. This is
the MathJax lesson from our TeX study, replayed on an editor: an
entire genre of almost-right imitations exists because exactness used
to be unaffordable. It is not unaffordable anymore, and this is a
genre-sized opportunity small enough to fit in a semester.

---

## 13. A WebAssembly interpreter: a spec that names its own freedom

WebAssembly is the portable binary format that every browser runs; C,
C++, and Rust compile to it, and it is the closest thing the modern
web has to a machine. Unlike almost all modern infrastructure, it was
*designed* deterministic: the specification commits to same module,
same inputs, same results, on every platform. And where the designers
could not deliver that (one place: the bit patterns inside
floating-point NaN values), the spec says so, out loud, precisely. A
standard that names its own nondeterminism is a rare document, and
learning to read a spec for exactly where behavior is pinned and where
it is free is one of the durable skills of this course.

The judge comes with the standard: the official spec test suite,
thousands of machine-runnable assertions maintained alongside the
specification itself. Beyond it lies differential testing: run modules
from the wild through your interpreter and through production engines
(V8, wasmtime) and compare.

**The assignment.** An interpreter passing the spec suite, then
surviving differential fuzzing against two production engines. The
graded subtlety is your comparator: it must canonicalize NaN bits
exactly where the spec grants freedom, and nowhere else. An oracle
that is too loose passes wrong programs; one that is too strict fails
correct ones; encoding the spec's declared freedom into the judge,
precisely, is the assignment inside the assignment.

**The extension.** Time-travel debugging for WebAssembly. Here is the
gift of the module boundary: all nondeterminism enters a WASM program
through its imports. Record the import calls and replay is exact,
which means reverse execution is buildable: run a wild module, capture
the boundary, then step backward through the execution. The systems
community spent years building this for native code. The WASM boundary
makes it a term project, verified by the property that a replayed run
is bit-identical to the recorded one.

---

## 14. A deterministic autoagent: an automatic player you can replay

In project 7 you built a small automatic player as a test generator.
This project takes the idea seriously, because the idea deserves it.
When the machine-learning community ran a NetHack competition at
NeurIPS, the winner was not a neural network. It was a symbolic Python
program, hand-coded strategy, and the fact that it was legible code
rather than opaque weights is what made it possible for our project to
port it, extend it, and run it as a nightly fleet: hundreds of full
games a night, used as a fuzzer against our own port. None of that
works unless the agent itself is deterministic.

Here is the principle: an agent is software too, and it deserves the
same engineering discipline as the system it plays. The agent's policy
must be a pure function of what it has observed plus a seed. A glance
at the wall clock, one call to an unseeded random number, the
iteration order of a hash map leaking into a tie-break: any of these
means the same dungeon produces different games on different nights.
Then a bug that appeared on Tuesday cannot be reproduced on Wednesday,
and your fleet's numbers are weather, not measurements. Determinism is
what turns an agent from a demo into an instrument.

The competence is hard too, and honestly so: surviving a roguelike
requires real planning, pathfinding, resource management, retreat.
That is why this project is worth weeks. But competence without
replayability is worth almost nothing to an engineer, and the
discipline is the part no one teaches.

**The assignment.** A deterministic automatic player for your own
project-7 Rogue port, or for a Game Boy game on your own project-2
emulator. Two kinds of ground truth, both mechanical. First,
determinism itself: the same seed must produce the byte-identical
keystroke stream, run twice, on two machines, a week apart; record a
whole fleet night and replay it exactly. Second, competence against
pre-registered criteria: before each improvement, write down the
acceptance numbers (median survival turns, depth reached across N
seeds); after the run, read them. No post-hoc judgment. Our NetHack
campaign ran eighty-eight numbered experiment matrices under exactly
this discipline, and the pre-registration prevented at least three
wars of reverts. Every game your agent plays becomes a session in
your test corpus, which is the reason the project exists at all: a
deterministic competent agent is a test factory.

**The extension.** Turn the agent into the instrument it wants to be.
Nightly sweeps of hundreds of seeds against your port, reporting
first-failure depth; an estimation layer in the agent calibrated
against oracle ground truth, with a mechanically enforced wall (a lint,
not a promise) between the agent's strategy and any data only the
oracle can see, because an agent that quietly reads the oracle makes
every number beautiful and false. Or the forward-looking variant: let
a large language model propose strategy *offline*, compiled into
deterministic playbooks the agent executes, so the intelligence
improves while the fleet stays exactly replayable. Nondeterminism
quarantined at a recorded boundary: you will use the same move in
project 15.

---

## 15. AI-assisted collaborative digram: the finale, with nothing to port

I have a project called digram: a visual programming language for
diagrams. One diagram exists in three synchronized forms, a readable
textual program, a direct-manipulation canvas, and publication-grade
SVG or PDF, with a constraint solver keeping them consistent. And the
pipeline is deterministic end to end, on purpose: the same source
renders to byte-identical SVG on any machine, in Node or in a browser,
with even the text measurement running through one shared path. That
purchase was made early, before it was needed, and this project is
where it pays out.

This is the last project because it is the only one with no reference
implementation. You are not porting anything. You are composing
verified parts into something that does not exist yet: Google-Docs
style collaboration where one of the collaborators is an AI. The
industry is bolting assistants onto editors at a furious pace this
year, and almost none of the results can be verified in any serious
sense. Yours will be, because every layer underneath was built like a
port: judged, fuzzed, replayable.

**The assignment.** Collaborative digram. Your project-10
collaboration core carries edits to the digram source, so several
people manipulate one live diagram: one dragging a box on the canvas,
another typing in the textual form, because the three-forms
architecture means participants can edit different projections of the
same artifact. The oracle is inherited and, for once, visible:
convergence means byte-identical source on every replica, and
determinism means byte-identical rendered SVG on every screen.
Convergence you can see. Fuzz it with concurrent structured edits and
held-out seeds, as in project 10. And there is an honest research seam
here: concurrent edits to a constraint program can conflict
*semantically*, two people moving the same box through different
constraints, in ways no textual merge can detect. Surfacing those
conflicts to users without ever breaking convergence is a genuinely
open problem, and you will be standing in the right place to work on
it.

**The extension.** Admit the machine. An AI agent joins the session as
an ordinary participant, speaking the same operation protocol as
everyone else: you drag a box, and it renames the labels, aligns the
arrows, drafts a whole diagram from a sentence of description. Two
disciplines separate this from a demo. First, because the agent's
edits are ordinary operations, convergence cannot break by
construction, and any edit that would make the constraint program
unsolvable is rejected or repaired mechanically before broadcast.
Second, the agent is the one nondeterministic component in a system
you have made deterministic everywhere else, so you treat it the way
WebAssembly treats imports and the way project 14 treats strategy:
record its operations at the boundary. Every session, machine
contributions included, replays bit for bit; every AI edit is
attributable, reviewable, and scrubbable in the document's history
using the time travel you built in project 10. AI in the loop,
verifiability preserved. That sentence is the whole course, and this
is the project where you get to say it about something you built.

---

## Further directions

Metafont, the font-drawing companion Knuth wrote alongside TeX, has
its own torture test, TRAP, and makes a natural second capstone. A
SQL engine tested against sqllogictest, a corpus of millions of
queries whose correct answers were agreed by running multiple
independent database engines, teaches conformance testing when there
is no single reference implementation. A spreadsheet recalculation
engine can be verified against headless LibreOffice, with a lovely
self-referential extension: an incremental recalculator verified to
match your own full recalculator on every edit. An H.264 video
decoder against the ITU conformance bitstreams repeats the FLAC/MP3
lesson at industrial scale: decoding is specified exactly, encoding
is left free, and the spec tells you which is which. A JavaScript
interpreter measured against test262 is the heavyweight version of
the Lua project. A flexbox layout engine can be verified against
fixtures harvested from an instrumented headless Chrome, which is
exactly how Meta's Yoga project keeps React Native layout
browser-identical (instrument the reference, farm the truth), with a
worthy extension in placing canvas-measured, Knuth-Plass-broken text
inside the boxes: browser-exact layout with TeX-quality paragraphs.
And NetHack itself remains the final boss: not homework, an
expedition. The full account of what it takes is in
[REPORT.md](REPORT.md) and [LESSONS.md](LESSONS.md).

## Why every project is a port

Because a port is where agent work can be verified end to end. There
is a right answer for every byte, so nothing rests on my judgment or
your persuasion, and every one of the disciplines this course cares
about gets exercised for real: determinism, instrumentation, static
checking, test generation at scale, and the tools that keep you
oriented inside a codebase you did not write and will never fully
read. The ports are the training weights. The transferable strength
is the habit they build: before you let agents loose on a problem,
choose an oracle you cannot sweet-talk, and build the machinery that
makes their work checkable. That habit survives long after you stop
porting other people's programs, because it is not really a fact
about ports. It is what programming is turning into.

Project 15 is the deliberate exception that proves it: nothing in it
is a port, and nothing in it would be trustworthy without the
verified layers underneath. Building the new thing on top of the
checked things is the destination the fourteen ports were the road to.
