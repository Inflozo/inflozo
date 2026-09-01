# Documentation audit — 1 September 2026

Every written document in this project was read or scanned against the files on disk: the 33 category
specifications, `P0 Editor Primitives - Spec.md`, `Actions Split - Migration Record.md`, the 32 session
briefs in `New Session Prompts/`, and the two index canvases (`Index.dc.html`, `Index - Categories.dc.html`),
which carry the project's status numbers and are treated here as documents.

**The library as the files actually stand:** **466 designs across 33 categories**, plus **7 P0 primitive
pages**. **536 canvas pages** in total. A23 Search is deleted; four design numbers are retired and not
reused — **A1·9 Search-Forward**, **A2·13 Consent**, **A4·15 Search**, **A9·12 Filter**.

Per-category counts: A1 15 · A2 14 · A3 16 · A4 17 · A5 16 · A6 15 · A7 15 · A8 15 · A9 14 · A10 15 ·
A11 15 · A12 15 · A13 15 · A14 15 · A15 15 · A16 15 · A17 18 · A18 15 · A19 15 · A20 15 · A21 15 ·
A22 16 · A24 16 · A25 12 · A26 15 · A27 12 · A28 10 · A29 14 · A30 13 · A31 10 · A32 12 · A33 6 · A34 10.

---

## What was stale, and what it now reads

### The two indexes — the worst of it

`Index.dc.html` linked **20 pages that do not exist**: the whole of A23 (16 links, including a
non-existent `A23 Search - Spec.md`) and the four deleted designs. It also **omitted 8 pages that do
exist** — the seven P0 primitives and `S14 Editor Cards`. Its header read 485 / 485 designs, 34 / 34
categories and 548 canvas pages; the footer named A33 as the most recent category.

Fixed. A23 and the four deleted designs are gone from the data; each affected category now carries a
`r:[…]` list of retired numbers, so the remaining designs keep their **real** numbers (A1 runs
… 8, 10, 11 …) and the card header says "15 designs · 9 retired". P0 joins the Foundations section,
S14 joins Product, and the totals read 466 / 466, 33 / 33, 536 pages, most recent A34.

`Index - Categories.dc.html` carried the same totals plus a live **A23 Search · 15 designs** row and
pre-deletion counts for A1 (16), A2 (15) and A4 (18). All corrected; the footer now reads
"33 CATEGORIES · 466 DESIGNS · 33 CATEGORY SPECS + P0 · MOST RECENT: A34 PAGINATION STYLES".

### The session briefs

All 32 briefs opened with "**485 designs across 34 categories**" and headed §3 "the rules that keep
485 designs coherent". Both corrected; §1 now states the real figure and names the deletion and the
four retired numbers, so a fresh session pasted the brief starts from the truth.

`New Session Prompts/A02 Announcement Bars.md` also claimed "Sixteen header designs are drawn" and
pointed at `A1 Headers — Spec.md` (em dash; the file is `A1 Headers - Spec.md`). Both corrected.

**`A2 - New Session Prompt.md` (project root) was deleted.** It was a byte-identical duplicate of
`New Session Prompts/A02 Announcement Bars.md` except for one line — the retired clause "Designs may
hand off to other designs. A1·11 becomes A1·1 below 1200 …" — i.e. it was the superseded copy. If you
want it back, it is the folder copy plus that one struck clause.

### Hand-off: the rule that moved and the sentences that did not follow

Hand-off was retired library-wide (patch Part A·A8; P0·8 rule 8). Most categories record the deletion
correctly. Three did not:

- **A20 §on 12 Panel** still read "12 Panel still hands off to 1 Chips below four references", two
  hundred lines above its own patch note deleting that hand-off — and the drawn canvas has been
  correct since 29 August. Corrected to the amended state.
- **A16 · 15 Cover, spec field 7** still read "No image → A19's vocabulary: **Hand off** — the section
  renders as 2 Centred", contradicting A16's own patch note 5. Corrected to render-as-itself, panel
  advises; the Flagged line follows.
- **P0's "still outstanding elsewhere" list** was itself out of date. Re-checked file by file:
  A9·4, A19·7 and A29·5 are now clear. `A6-13 Overlap` and `A8-14 Slim Line` still draw the old
  language, and **A22·6 and A22·7 still hand off in substance** — the list now says exactly that.

### A19's missing-image vocabulary

A19 replaced **Hand off** with **Ground** in the design patch pass, and A24 added **Hide**. Five
inherited-vocabulary tables still credited A19 with "Reflow · Plate · Hand off" — A16, A21, A22, A25,
A26 — as did A33's missing-image rule and A26's inheritance paragraph. All now read Reflow · Plate ·
Ground, with the correction dated.

### The Actions split

`P0 Editor Primitives - Spec.md` open item 8 said the migration record "lists all 35 designs and 34
frames". The record lists **36** designs and 36 rewritten control tables and panels (7 + 1 + 14 + 1 +
11 + 2). Corrected to match the record.

---

## Open items left alone, deliberately

These are decisions or drawing work, not wording, so nothing was changed:

1. **A22·6 Image Split and A22·7 Cover still hand off** — no image → 5 Panel and → 4 Contrast Band.
   A22's own patch notes name them as "left as found" because no rule in that pass reached them. They
   are the last two live hand-offs in the library and need a ruling on what each draws instead.
2. **`A6-13 Overlap` and `A8-14 Slim Line`** still draw hand-off language on the canvas
   (A6·13 names §7·8's hand-off as a live mechanism; A8·14's states caption reads "the design hands
   off to 1 Single"). Both are frame edits in their own categories.
3. **Six citations of A23**, a category that was deleted before it was drawn, are used as precedent:
   A20's "A23's tag-chips repeater is the exact precedent" (twice), A21's "A22 Cover and A23 Cover",
   A24's "the same ruling A23·12 reached" (twice), A29's "a search field in the head (A23's)" and
   A33's canvas-furniture credit. Each needs re-attributing to a category that exists, or striking —
   which one is a judgement about where the ruling really came from.
4. **`_build/` generators still carry pre-split vocabulary**, as `Actions Split - Migration Record.md`
   already raises: re-running them would regenerate the old Actions panels.
5. **A5, A6 and A7 each keep a "Hand-offs out of A…" section.** They read as cross-category advice
   ("A17 is named for larger counts") rather than render-time hand-off, so the content looks current,
   but the heading is the retired word. Renaming them is a call for the owner.
