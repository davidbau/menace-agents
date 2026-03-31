---
name: Fresh port plan context
description: Plans for fresh NetHack port — keep Terminal + Shell virtual filesystem, merge back with side projects after success
type: project
---

Planning a fresh NetHack C→JS port in a new repo, informed by the 64-day analysis.

**Keep from original:**
- Clean Terminal base class (shared across games)
- Shell side project with virtual filesystem — provides practical implementations for options/bones/save management, not just an easter egg
- All side projects (Rogue, Hack, Dungeon, Logo, Adventure, BASIC) to be merged back in after successful NetHack port

**Why:** The Shell's virtual filesystem solves real infrastructure problems (file I/O that NetHack needs for saves/bones/options). The Terminal is proven shared infrastructure. Side projects validated the methodology but shouldn't distract during the core port.

**How to apply:** Include Terminal + Shell in the starter repo. Structure the fresh port so side projects can be merged back cleanly after NetHack reaches parity.
