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
covering A1 Headers through A12 About and Team. The specs are good — detailed and per-design — and
the corrected prompt at `design/claude-design-prompt-3-library.md` means categories 13 onward carry
all ten required fields natively.

**The four fields the 12 were missing are now derived** — `design/derived-fields-A1-A12.md`, one
entry per design across all 186. Every structural tuple is unique within its category, verified by
`python3 tools/tuple-check.py`, which `doc-audit.py --check` now runs. Nothing was invented: where
the spec's text could not answer, the entry says **NEEDS DESIGN ANSWER**, and the gaps are rolled up
by root cause at the top of that file — a handful of owner answers (the shared email form without
JavaScript, the disclosure fallback for headers and footers, A7's resting billing cadence, the
rails and the marquee, plus a short singles list) resolves the lot.

**Repeating items now have controls specified.** The owner asked for FAQ questions, stats and team
cards to share one design control and for a way to add more items. Half was already guaranteed —
AD-3 writes control values onto the *section root*, so per-item design is impossible by
construction — and half was genuinely missing: no control in FR-F1's vocabulary adds, removes or
reorders an item. That is **item 44 in `VERIFY-AT-BUILD.md`**, and all 34 prompts in
`CATEGORY-PROMPTS.html` now carry the right block: 12 categories author their own items and get
add/remove/reorder, 11 pull from Ghost and are told explicitly **not** to show an Add button, 11 do
not repeat. Item 44 also records that §7.3's list of 11 disagrees with the content-model scan on
A3, A22 and A23 — reconcile before E4 opens rather than picking one.

**Next actions, in order:**

1. The owner re-copies **8 of the 12** already-designed categories' patch prompts, which changed
   when the repeat blocks were added: **A3, A5, A8, A9, A10, A11, A12** (add/remove/reorder) and
   **A7** (Ghost tiers, count rules). A1, A2, A4 and A6 are unchanged. The 22 build prompts already
   carry the right block.
2. Get the owner's answers to `derived-fields-A1-A12.md` §"What needs a design answer", and edit
   those entries in place as answers arrive.
3. Decide with the owner whether the export's frames belong in git — `.gitignore` already ignores
   `unpacked/`, but the files were committed in the same commit that added the rule, so intent and
   repo disagree; the zip alone carries the full export — and when the specs plus derived fields
   merge into `sections-inventory.md`, which is where the build reads them from.
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
