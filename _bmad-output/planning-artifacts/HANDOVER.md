---
title: Inflozo — handover for a fresh session
status: live
created: 2026-08-21
updated: 2026-08-31
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
| `planning-artifacts/build-sequence.md` | The build steps from PRD to first story. Governs on any conflict with the board. |
| `.../architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` | The invariants everything is built from. |

## Where the project is

**Steps 1–4 are complete, and so is the inventory merge.** The architecture, the schema and its
runnable proof, both compiler emitters, four stress rounds, a reliability round and three propagation
audits are all applied. Every design category is drawn, specified, patched twice and exported. The
library inventory is now **generated from the design export** and gated, so it cannot drift.

**Never write a library count into a document.** Every count in this project has gone stale at least
once. Derive them:

```bash
python3 tools/inventory-gen.py --check    # categories · designs · [Free], from the export
python3 tools/derive-module-reach.py      # the behaviour registry, and which designs declare what
python3 tools/verify-design-pass.py       # one check per ruling, against the export
python3 tools/doc-audit.py --check        # the documentation gate
```

## The immediate task

**Step 5 — journeys and flows (`/bmad-ux`).** It is the critical path and it is blocked by nothing.
The stress-tested prompt is `STEP-5-PROMPT.txt` and inside `build-sequence.md` step 5. **Two
standing rulings now govern everything after it (2026-09-02, `reconcile-designs-decisions.md`
§A10): R-74** — the Claude Design export is the design authority for every surface until the
project finishes, extrapolate rather than invent — **and R-75** — the owner sees Inflozo's own UI
as a static clickable prototype on his machine (**step 5b**, new) before dynamic build; **step 6
does not open until he has walked it.**
Its inputs are prompt 2's exported app screens (S1–S14, M1–M9) and **§37.7 of
`prds/…/reconcile-designs.md`** — the editor surfaces with no frame and the flows drawn on wrong
semantics. §37.7 was re-verified against the current export on 2026-08-31 and **still stands**; the
delta is §A4 of `reconcile-designs-decisions.md` (`reconcile-designs.md` is a `record` and was not
edited). Two of §37.7's items are now fixed: the design totals printed on the marketing screens, and
P0's per-prop mark allowlist.

**ANY UI OR UX TASK STARTS IN THE DESIGN EXPORT — THE WHOLE DIRECTORY** *(owner, 2026-08-31 — since 2026-09-02 ruling **R-74**, binding until the project finishes)*. It is
the largest investment in this project and it is never to be missed. The full map is in `CLAUDE.md`;
the short version is that it holds far more than the screen frames — the design system itself
(`Calibration Set`, `Editor Sidebar Kit`, `R Responsive System`), every drawn design, a per-category
`-0 Category Proof` carrying that category's tokenisation proof and roster, the per-category spec
files, **the executable render kits** (`*-kit.js`, `_build/*.js`, `interactions.js`, `support.js`),
the per-category session prompts and the original brief.

**"Design artifacts are non-normative" is scoped to behaviour, not to look:** the PRD decides what a
surface does, the export decides what it is built from. A surface with no frame is **extrapolated from
the nearest one that has** — same components, same tokens — and drawn in the same Claude Design
project, never invented in prose beside it.

**Step 4 owes nothing normative any more.** R-30 … R-38 were propagated on 2026-08-31 — the ledger is
in `reconcile-designs-decisions.md` under §A3, one row per ruling. `Appendix D` gained a new §D.0 (every
pack token marked computed or authored), AD-10 gained the refusal to fetch from a video provider, AD-23
the corollary that a fact nobody fetches needs no fixture, and AD-27 the five doc-schema row shapes.

**Nothing from the merge is owed a normative half any more.** R-2, R-10 and R-29 landed 2026-08-31 on
the owner's instruction to clear them before step 5, and R-29's long-outstanding FR is written —
**FR-Q10**, owned by E7. R-10 #1 and #7 are **withdrawn**, each refuted by execution.

**What is left of step 4 is DESIGN work, and it is IN PROGRESS:** the owner is running
`DESIGN-PATCH-PROMPTS-2.html` in Claude Design — 20 prompts, P0 first.

**When the patched export lands, there is a runbook and it is on the build board.** In short: replace
the folder, then `verify-design-pass.py` (it also guards the two repo-side hand edits), then re-derive
— `export-roster` → `inventory-gen --write` → `tuple-check` → `derive-module-reach` →
`derive-content-lines` / `derive-control-lines` — then `doc-audit --check` **twice** (its sub-tools
regenerate on failure, so the first run often self-heals). The only human step is last: read what each
prompt flagged as unsure, and bring anything genuinely open to the owner as a numbered decision.

## What has already landed, so it is not redone

- **Step 4a (2026-08-27)** — `prds/…/reconcile-designs.md`, with `reconcile-designs.findings.json`
  beside it. A `record`; never edit it.
- **Step 4b, the Ghost Build Room (2026-08-27)** — `prds/…/reconcile-designs-decisions.md`. Extended
  2026-08-31 with §A2 (the design patch pass), §A3 (the §F asks) and §A4 (§37.7 re-verified).
  **Read its §B before trusting any D-number anywhere in this project: D3, D17 and D26 are reversed
  and D27 is reversed in half.**
- **Register item 47 is CLOSED by execution — and its premise was wrong.** There is **no per-template
  `{{#get}}` budget**: Ghost races *each* get against its own 5000 ms timeout on both majors, and 150
  gets on one template resolved in full (`MEASUREMENTS.md` §30). The owner then withdrew R-20's
  provisional cap: **no hard cap, the panel warns past 25**, with the cost stated per page rather than
  per section. `prd.md` FR-H2 carries it. Register item **52** records that Ghost 6 dedups identical
  `{{#get}}` queries within one render and Ghost 5 does not.
- **The inventory merge.** A23 Search is deleted whole (R-24) along with `A1-9 Search-Forward` and
  `A4-15 Search`; the deleted numbers leave permanent holes. The inventory's rosters, totals and every
  per-category `Content:` / `Controls:` / `Data:` union are generated from the export; research §7's
  design-list columns are re-derived by `tools/derive-module-reach.py`.
  `derived-fields-A1-A12.md` is **retired** — `tools/tuple-check.py` reads the export instead and
  gates every live design, not 186 of them.
- **The design patch pass (2026-08-31)** — one prompt per category from `DESIGN-PATCH-PROMPTS.html`.
  `tools/verify-design-pass.py` confirms every structural check; six prose scans are flagged `LOOK`
  by design, because they cannot tell a violation from a spec recording that it removed the thing.
- **`confetti` is deleted from the behaviour registry** — no design declared it — joining
  `search-overlay`, `search-expand` and `command-palette`.

## Also outstanding

- Three gates with triggers, all in `VERIFY-AT-BUILD.md`: Supabase **Pro** before the live project
  holds customer data (Free has no backups at all); **Ghost(Pro) Starter** before public launch;
  turn on Dodo's renewal reminder.
- The probe list `reconcile-designs-decisions.md` §E: **E-2** (`feature_image_caption`'s stored
  shape), **E-3** (`@member` prefill under `cacheMembersContent`) and **E-4** (`<details name>` under
  the Baseline linter). E-1 has run.

## Standing rules — these were each learned expensively

> **On numbering.** These seven are the same rules as `CLAUDE.md`'s. `build-sequence.md` carries its
> own seven-item list in a different order, and **every "standing rule N" citation in the repo and in
> `tools/` uses that list's numbering** — so "standing rule 3" means *counts are derived* and
> "standing rule 4" means *a finding must reach an owning document*. Cite the rule by its words, not
> by its number.

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
7. **A propagation list cannot audit itself.** End every schema or vocabulary change by grepping the
   repo for the old name. The list of places to update is exactly the thing that misses one — the
   six-slot tuple change had three named targets across two sessions and the grep still found the
   PRD's FR-G5, the most normative of them all, sitting outside every list.

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
one.

**Work happens directly on `main`** — there are no feature branches and no pull-request review, so
the documentation gate is the only thing between a mistake and the live branch. Never push a red gate.
