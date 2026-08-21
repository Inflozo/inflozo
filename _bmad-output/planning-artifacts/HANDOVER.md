---
title: Inflozo — handover for a fresh session
created: 2026-08-21
purpose: everything a new chat needs to continue, without reading the previous conversation
---

# Handover

## What Inflozo is

A visual site builder for **Ghost**. Users drag ready-made sections onto a canvas; the product
compiles the design into a Ghost theme and deploys it to the customer's own Ghost site. The owner is
**Umang**, a solo founder who is not an engineer — every finding lands in plain language, with
numbered options and one marked **(RECOMMENDED)**.

## Read these first, in this order

| | |
|---|---|
| `planning-artifacts/INDEX.md` | Every document with a one-line brief. **Start here.** Four statuses: **live** (edit these), **tool** (runnable), **record** (dated — *never edit*), **retired**. |
| `planning-artifacts/BUILD-BOARD.html` | Where the project stands, what is next, prompts with copy buttons. |
| `planning-artifacts/build-sequence.md` | The six steps from PRD to first story. Governs on any conflict with the board. |
| `.../architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` | The invariants everything is built from. |

## Where the project is

**Steps 1 and 2 are complete.** The architecture, the schema and its runnable proof, both compiler
emitters, four stress rounds, a reliability round and three propagation audits — all applied.
Nothing there needs revisiting.

**Step 3 — the design work — is the critical path and it is the owner's own work**, running in
Claude Design. That is the only thing gating everything downstream.

## The immediate task

**12 of 34 categories are done.** The export is at
`design/claude-design-export/` (a zip plus `unpacked/`): **12 spec files, 225 design frames**,
covering A1 Headers through A12 About and Team.

**The specs are good** — detailed and per-design, carrying content fields, controls, data binding,
responsive rules, behaviour, empty states and accessibility. The category files also record
"shared components established here, reused verbatim", so component continuity across categories is
already being handled inside the design work.

**Four fields are missing from all 12**, because the prompt they were produced with asked for six of
the ten the reconciliation step checks:

| Missing field | Recoverable? |
|---|---|
| **Descriptor** — one line: what makes this design *this* design | Yes, from the frame and its existing spec |
| **Archetype** — one of: grid-of-N, split, stack, bar, nav, edge rail, overlay, feed, form, carousel, table, media frame, sticky, article body | Yes, from the responsive rule already written |
| **Structural descriptor (tuple)** — `archetype · primary axis · item-count class · media placement · emphasis mechanism` | Mostly. Must be **unique within its category** — check after deriving |
| **no-JS degradation** — what the design does with JavaScript off | Only where a behaviour module exists. Some may need an actual design answer |

**The prompt is already corrected** at `design/claude-design-prompt-3-library.md`, so categories 13
onward will carry all ten.

**Next actions, in order:**

1. Read the 12 spec files and **derive the four missing fields** where they are recoverable. Report
   which ones genuinely are not, rather than inventing them.
2. Check the **structural tuples are unique within each category** — FR-G5's whole uniqueness
   guarantee runs on the tuple, not on prose.
3. Decide with the owner whether the export's frames belong in git (13 MB unpacked) and where the
   specs land — `sections-inventory.md` is where the build reads them from.
4. Once two or three more categories exist, run **step 4** (`/bmad-review` — the prompt is in
   `build-sequence.md`). Do not wait for all 34.

## Also outstanding

- **Design prompt 2 is run but not exported.** Once it is on disk, **step 5** (journeys and flows)
  can run alongside the remaining categories instead of after them.
- Three gates with triggers, all in `VERIFY-AT-BUILD.md`: Supabase **Pro** before the live project
  holds customer data (Free has no backups at all); **Ghost(Pro) Starter** before public launch;
  turn on Dodo's renewal reminder.

## Standing rules — these were each learned expensively

1. **A claim about an external platform is a hypothesis until executed or read in its source.** Five
   confident claims about Ghost entered this project as normative text and were later proven false.
   **Cite or execute. Never assert.**
2. **A result whose control did not pass is not a result.** Three probes in one session returned a
   convincing "held" that was really a broken test.
3. **Propagate, never localise.** A finding is not closed until it reaches an invariant, a register
   row, or a comment beside the code. `python3 tools/doc-audit.py --check` enforces this and exits
   non-zero on drift. Run it before any commit that adds a document.
4. **Counts are derived, never restated.** Every count in this project has gone stale at least once.
5. **Never edit a document marked `record`** in `INDEX.md`. Correcting its figures falsifies the
   history the project relies on.
6. **Flag, do not guess.** If two decisions contradict, stop and ask.

## How the owner wants to work

Numbered decisions with a recommendation. Plain language — no jargon that isn't explained in the
same sentence. Short. He has asked more than once for less explanation and more instruction: give
the steps and the copy-ready text, and keep the reasoning brief unless he asks for it.

## Verify the ground before trusting it

```bash
python3 tools/doc-audit.py --check     # documentation gate — must pass
cd tools/stress && node test-ad36.js && node test-renderer-agreement.js
```

The database proof is `architecture-.../RLS-TEST.sql`; run it against a Postgres 17 container with
`PRELUDE.sql` then `SCHEMA.sql` first. It is a **gate** — it aborts on failure rather than printing
one. Branch is `round-4`.
