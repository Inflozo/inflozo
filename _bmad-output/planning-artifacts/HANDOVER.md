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

**Steps 1, 2, 3 and 4 are complete.** The architecture, the schema and its runnable proof, both
compiler emitters, four stress rounds, a reliability round and three propagation audits — all
applied. All 34 design categories, the P0 editor primitives and the controls-reconciliation pass
are exported to disk (2026-08-25). Nothing there needs revisiting.

**Step 4 is done, both halves (2026-08-27).** 4a (`/bmad-review`, unattended) wrote
`prds/…/reconcile-designs.md` — 1,086 findings, 41 probe families, a 1,078-row owner-flag register.
4b (the Ghost Build Room, with the owner present) wrote
**`prds/…/reconcile-designs-decisions.md` — 29 rulings**, which is the file the merge works from.
Four probe families left the register that night (two closed by execution against T1/T3, two deleted
by a ruling) and **four approved decisions were superseded: D3, D17, D26, and D27 in half** — see
§B of that file, and `MEASUREMENTS.md` §29 for the executions.

**The critical path is now the inventory merge (Tier 3 below) and step 5** — journeys and flows
(`/bmad-ux`), which is no longer blocked.

## The immediate task

**All 34 categories are designed.** The export is at `design/claude-design-export/` — the zip is
authoritative, and the owner's extraction sits beside it in `Inflozo/`: 34 spec files, the design
frames, the S1–S13 app screens and M1–M9 pages.

**The live work is the inventory merge — driven by `prds/…/reconcile-designs-decisions.md`.** Steps
4a and 4b are both done (2026-08-27); the section below is kept because the controls pass is still
the origin of the 39 decisions, **three and a half of which the Ghost Build Room has since
reversed** — read that file's §B before trusting any D-number here.

**The controls reconciliation — `CONTROL-PROMPTS.html` (complete 2026-08-25).** The owner audited
A1–A3's sidebar controls and found systemic gaps; a full review extended that audit to all 34
categories against the PRD's control vocabulary and Ghost's verified data surface. That file
carries one primitives prompt (P0 — run first) plus one patch prompt per category, **39 recorded
decisions — all ruled by the owner on 2026-08-24**: Tabler icons (D1) · prefix navigation ships
JS-required with no no-JS accommodation (D2) · ~~third-party search allowed, vendored MiniSearch
inside `search-overlay`~~ **(D3 — REVERSED 2026-08-27: Ghost's native search only; no engine is
vendored and FR-G7's zero-third-party rule is restored whole)** · A31's 10 designs accepted, counts
re-derived at merge (D11) · visitor-clock dates deferred (D13) — and the architect carry-forwards
(registry additions, FR-H2 deltas, build-contract rules, verify-before-build items). The prompts
carry the rulings verbatim. **Also reversed 2026-08-27: D17** (Ghost's accent setting is linked to,
never written — AD-10 stays at four writes) and **D26** (gap names stay Tight · Normal · Loose, so
Appendix C does not move); **D27 in half** (A15's Upload source is cut, taking the Ambient loop with
it; the embed autoplay refusal stands).

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

**P0 and all 34 patches have been run and re-exported (2026-08-25)** — every spec now ends with a
`Reconciliation notes` section, and the export carries `P0-1`…`P0-6`, the P0 spec and `S14 Editor
Cards`.

**Next actions, in order:**

1. ✅ **Step 4a done (2026-08-27)** — `prds/…/reconcile-designs.md`, with
   `reconcile-designs.findings.json` beside it.
2. ✅ **Step 4b done (2026-08-27)** — `prds/…/reconcile-designs-decisions.md`, 29 rulings. Its Tier-1
   and Tier-2 propagation landed the same day: `MEASUREMENTS.md` §29 (the executions),
   `VERIFY-AT-BUILD.md` items 47–51 and the four families that left the register,
   `CONTROL-PROMPTS.html` (the reversals marked in place), and the spine.
3. ✅ **Register item 47 is CLOSED by execution (2026-08-27)** — and **its premise was wrong.**
   `tools/probe/run-verify-47.py` against T1/T3: there is **no per-template `{{#get}}` budget.** Ghost
   races *each* get against a 5000 ms timeout of its own, identically on both majors, and **150 gets on
   one template resolved in full** with no abort marker and no degraded header. `MEASUREMENTS.md` §30.
   So **R-20's cap stands at twelve**, now on a *latency* budget (≈ 10 ms per pick) rather than a
   platform limit — item 47 anticipated only the downward correction. **Raising it above twelve is a new
   owner decision and was deliberately not taken.** Register item **52** records a second finding: Ghost 6
   dedups identical `{{#get}}` queries within one render and Ghost 5 does not.
4. 🟡 **The inventory merge — Tier 3. The normative half has landed; the 34 specs have not.**
   The per-ruling ledger is in `reconcile-designs-decisions.md`, immediately under the propagation
   table, and it is the honest list. **What landed:** the inventory is now **generated from the export**
   (`tools/export-roster.py` → `tools/inventory-gen.py`), so R-16's supersede cannot drift back —
   Appendix A's totals and all 33 rosters, plus `prd.md` Appendix I's counts, are regenerated and gated
   by `doc-audit --check`. **A23 Search is deleted entirely** (R-24 as the owner tightened it), taking
   `A1-9 Search-Forward` and `A4-15 Search` with it, so the library is **33 categories**. Every restated
   count in `prd.md` is now derived or removed. `tools/tuple-check.py` reads the merged library and
   passes, mutation-tested red. `derived-fields-A1-A12.md` is **retired**. Roughly twenty rulings have
   their normative half in. **What has NOT landed, and must not be mistaken for done:** the 34 category
   specs are untouched; `sections-inventory.md`'s per-category `Content:` / `Controls:` / `Data:` union
   lines are still pre-merge; and `research-section-js-libraries.md` §7's two design-list columns are
   still pre-merge. The last two were **deliberately not machine-derived** — the export declares fields
   and modules in five different prose shapes and a regex union produced nonsense, and a wrong
   `contentSchema` is worse than a stale one because it is the storage contract park-and-restore runs on.
5. **Step 5 — journeys and flows** (`/bmad-ux`). No longer blocked. §37.7 of `reconcile-designs.md`
   lists the editor surfaces with no frame and the flows drawn on wrong semantics; those are step 5's
   input, not the merge's.

## Also outstanding

- ✅ **`design/derived-fields-A1-A12.md` is superseded and retired (2026-08-27).** It covered 12
  categories by deriving four fields from the export's prose; all 33 live categories now carry them
  natively. `tools/tuple-check.py` reads the export through `tools/export-roster.py` instead and gates
  **every** live design, not 186 of them. The file is kept for provenance and marked `retired` in
  `INDEX.md` — do not build from it.

- **Design prompt 2's output is now on disk** — the S1–S13 app screens and M1–M9 pages are in the
  export zip (verified 2026-08-21). **Step 5** (journeys and flows) can therefore run alongside the
  remaining categories instead of after them.
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
one. Branch is `round-4`.
