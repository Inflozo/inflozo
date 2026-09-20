---
title: 'Story 5.10 — The Section Picker'
type: 'feature'
created: '2026-09-19'
status: 'in-progress'
owner_test: issues
baseline_commit: '5ab1ddd7f53d42a7e2931c318da1fa0da38ef3ad'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story you can **add a section to a page**. Press `⌘K`, or the "+ Add section" button that
now appears between two sections when you hover the gap, and a full-screen picker opens over the
editor: a list of categories down the left, a search box above it, and a grid of cards on the right,
**each one a live miniature of the real section already wearing your own colours and your own
content** — not a stock screenshot. Click Add on a card and that section lands exactly where you
asked for it, one press of `⌘Z` away from being gone again.

Two quieter promises come with it. **You are only ever shown what can actually work on the page you
are on** — a section that prints an article is not offered on your home page, and it is simply not
there rather than greyed out with an excuse. And **Pro sections are yours to try**: they carry a
gold ✦ Pro tag, you can add them, design with them and undo them freely, and nothing asks you for
money until the day you ship.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no way to put a section on a page. Every Epic 5 story so far has edited
sections that Story 5.1's seed script put there (`tools/probe/seed-editor-project.mjs`, the owner's
ruling of 2026-09-17), and the editor says so in its own header: *"'+ Add section' and the hairline
'+' between sections (5.10)"* are listed among the affordances **absent, not greyed** until their
story (`editor.tsx:156`, R-118). `doc-edit.ts` can move, duplicate, remove, rename, hide and clear a
section and **cannot insert one**; `keymap.ts:64` carries `⌘K` as a deferred row bound to nothing
(R-145); and `packages/library/src/placement.ts` was written at Story 5.4 with a header naming this
story as the caller its two functions are waiting for. An empty canvas today is empty with no way out.

**Approach:** One pure query decides what may be placed here — `isPlaceable`, the design's
`compileTarget`, and its `bindingContext` intersected with the resources the template actually has —
and the rail, the grid, the counts and the empty states are all readers of that one answer, so a
design that cannot work is never drawn rather than drawn and refused. The overlay is a native modal
`<dialog>`, which gives `Esc`, the focus trap and the return of focus for nothing and keeps the
picker out of R-149's one axe exception. Each card's preview is **the same render the canvas makes**
— `renderSection` into a lazily-created `/canvas` iframe, `inert` so nothing inside is focusable —
so the preview and the section you get are the same code by construction, and when Epic 6 replaces
the token set the picker follows with no change at all.

## Boundaries & Constraints

**Always:**
- **The canvas is open and enforcement is at the exits** (FR-L3, UX-DR19). A Free user may add any
  Pro design. The ✦ Pro tag is a `<span>`, never a button; **no upgrade sheet on click, ever** —
  that is B13's job, once, at deploy (`B Missing Surfaces.dc.html:1424`, already enforced by
  `kit/badge.tsx`).
- **Only what can work is offered, and what cannot is absent** (FR-D12, UX-DR3). A non-placeable
  treatment's category never appears in the rail; a design whose `compileTarget` or `bindingContext`
  does not fit this canvas is never drawn and never counted. Nothing is greyed and nothing carries an
  excuse, because the test is *could this ever do anything here* and the answer is no (R-33, R-68).
- **One gesture is one edit, one transaction and one undo step** (AD-15, AD-16). The insert goes
  through `commit(written, touched)` — the editor's single doc-write door — so `⌘Z` puts it back with
  no extra code, and AD-22's round trip (an edit materialises an untouched template) is free.
- **Counts are derived, never written down** (standing rule). The rail's per-category count is a
  runtime figure over what is offered *on this canvas*; `ALL CATEGORIES` carries no number at all
  (A7 item 1 deleted it from S5a and S5c on purpose — a library total is never printed).
- **No colour literal under `apps/web`** (`tokens.test.ts`), and every token this surface uses must
  already be drawn in the export. All of S5a's and S4b's literals already resolve to existing tokens;
  **no new colour or shadow is needed**.
- **Chrome that is pressed lives outside the frame** (AD-21, as Story 5.1 amended it). The insertion
  hairline is painted inside the canvas document from `canvas-chrome.css`, keyed on a
  `data-inflozo-*` attribute (`pilots.test.ts:40` enforces the key); the **"+ Add section" pill is
  pressed**, so it follows `SectionPill`'s pattern in the editor's own body and pays that component's
  two documented costs (hidden from the first canvas `scroll`, replaced 150 ms after the last).
- **A site-wide section is marked, never explained** (R-152). The Kit's `Globe` on the picker card, a hover
  `title`, the same words as its accessible name — and **no sentence, toast or banner anywhere**. Layers gains no
  glyph: R-126 removed B7's on the owner's own test and stands.
- **Motion degrades.** The hairline and pill share S4b's `addline` breath — an **opacity** pulse,
  never a scale — and the overlay rises on `--duration-overlay` (200 ms, scale 0.98 → 1); both go
  through `globals.css`'s existing `prefers-reduced-motion` block, never around it.

**Ask First:**
- Any **global binding beyond FR-D11's map**, or any change to what an existing key does. This story
  lands `⌘K` and narrows it (Design Notes); anything further is the owner's.
- **A new colour, shadow or radius**, or a Kit component drawn differently from the frame it comes
  from. The badge sizes disagree between S5's cards and the Kit — see the Design Note, which takes
  the Kit's and says why.
- **Questions 1, 2 and 3 below.** Each is open; the tasks they govern are marked.

**Never:**
- **No upgrade sheet, no lock, no paywall in the picker** (UX-DR19) — a Pro card is a price tag.
- **No second axe exception.** R-149's node filter is one rule on one element, the canvas iframe. The
  picker's preview frames are `inert`, so `frame-focusable-content` has nothing to report on them.
- **No second implementation of anything.** The grid's arrow keys are `icon-picker.tsx`'s `gridKeys`;
  the rail is `radioKeys`/`tabStop`; the search field is the Kit's `SearchInput`; the refusal is
  `placementRefusal`; the render is `renderSection`. Nothing here re-authors an existing part.
- **No "Free only" switch in the rail** (R-150) and **no sun/moon segmented in the header** (R-151) — the first is
  not built at all, the second is R-132's one button. Neither is greyed; both are absent (UX-DR3).
- **No design ring, no ◀ ▶, no thumbnail strip, no Shuffle** — all Story 5.11's (R-118). This story
  places a section; it never changes one.
- **No new payload route and no per-design fetch.** `read.ts` already ships every placeable design to
  the editor for exactly this story; its ceiling is **DW-200** and stays there.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Open at a gap | hover between two sections, press the "+ Add section" pill | picker opens; the insertion point is **that gap** | N/A |
| Open by key | `⌘K`, a section selected, shell has focus | picker opens; insertion point is **after the selection** (`duplicateSection`'s precedent) | N/A |
| Open by key, nothing selected | `⌘K`, shell has focus | picker opens; insertion point is the **end of this canvas's own stack** | N/A |
| Open on an empty canvas | the canvas has no sections | the canvas's one affordance is "+ Add section"; pressing it opens the picker at the end | N/A |
| Place | Add pressed, or `Enter` on a focused card | one instance at the invoked position, one journal entry, one undo step; picker closes; focus returns to the invoking control; the placement announced politely | `placementRefusal` → the sentence in the picker, nothing written |
| Second Post Content | an `a25` design, the layout already has one | the card is drawn; Add **refuses** with *"this layout already prints the article"* in the picker's own refusal line (**DW-190**) | the doc is untouched |
| Site-wide design | a design compiling to `default.hbs` (a header, a footer) | its card carries the `Globe`; it lands in the **Site-wide group**, not at the invoked position — the stack order is derived, not stored (`editor.test.ts:103`) — and the placement is announced politely, with **no visible sentence** (R-152) | N/A |
| A second header | the site doc already holds one, and another header is picked | **it replaces the first**, in one transaction, so `⌘Z` restores the old one (R-152). Category for category: a header replaces a header, never a footer | N/A |
| Wrong template | a design whose `compileTarget` excludes this canvas's file | never drawn, never counted in the rail | N/A |
| Wrong resource | a design whose `bindingContext` does not intersect this template's | never drawn, never counted | assembly refuses a design whose contexts fit none of its own targets |
| Non-placeable | an `a32` / `a33` / `a34` design | its category is **absent from the rail entirely** | N/A |
| Search, no matches | a query matching no offered design | the category rail stays; the grid says what was searched for (UX-DR6) | N/A |
| Nothing offered here | a canvas on which no design can be placed (today, `error`) | the rail is empty and the grid says so | N/A |
| `⌘K` with a caret | the caret is in a text field or a `contenteditable` | the picker does **not** open — `⌘K` is the **link** mark there (`inline.ts:230`), or the browser's | N/A |
| A preview that throws | `renderSection` fails for one design | that card keeps its skeleton and stays addable; every other card is unaffected | the failure is logged, never printed to the customer |

</frozen-after-approval>

## Code Map

**The frames, read**
- `S5 Section Picker.dc.html` — **S5a** (`:26`, *"section picker — Heroes, one card hovered · 1440"*) and
  **S5c** (`:180`, *"dark preview on (app chrome stays light)"*). **There is no S5b**, no loading frame,
  no empty-search frame and no zero-result frame anywhere in the export; those three are extrapolated
  from these two (R-74) and their rule — not their sentence — is `EXPERIENCE.md:346`.
  - Scrim `:28` `rgba(28,27,26,.4)` = `--color-scrim`. Panel `:29` — **`position:absolute; inset:22px`**,
    `--color-paper`, `--radius-lg`, `--shadow-modal`, `display:flex; overflow:hidden`. Not a centred box.
  - Rail `:30` — `width:240px`, `border-right` `--color-line`, `padding:16px 12px`. Search `:31-35` is the
    Kit's field, placeholder **`Find a section…`** (`:33`) with the **`⌘K`** chip (`:34`). Heading `:37`
    **`ALL CATEGORIES`**, mono 10.5px, **no number beside it**. Rows `:38-71` — `padding:7px 10px`,
    `--radius-sm`, hover `rgba(28,27,26,.04)`, **active `--color-coral-tint` on `--color-coral-text` at 600**,
    count on the right in mono 11px inheriting the row's colour. *The drawn names and counts are stress-fill
    fiction* — 34 invented categories against a real roster — so the rail is built from the catalogue.
  - Rail footer `:73-76` — the **`Free only`** label and the Kit's toggle, off. **Not built (R-150).**
  - Header `:79-86` — the category title in Bricolage 20px/700 (`:80`); the meta line in mono 12px
    (`:81` **`18 designs · shown in your pack: Paper`**, and S5c `:235` **`18 designs · pack: Paper · dark mode`**
    — the two frames disagree, reconciled in the Design Notes); the sun/moon **segmented** `:82-85`
    (**superseded by R-132's one button, R-151 — the position is kept**); the close **×** `:86`, 32px, with **no `aria-label` drawn** — it gets one (A7 item 9).
  - Grid `:88` — `<div tabindex="0" role="group" aria-label="Designs">`, **CSS multi-column** with
    `column-gap:16px`, cards `break-inside:avoid; margin-bottom:16px`.
  - Card `:101` — `--color-surface`, 1px `--color-line`, `--radius` 12px, `--shadow-sm`; hover
    `--shadow-canvas-page` and `translateY(-2px)` over `--duration-fast`. Preview ground
    `--color-paper-raised`. Footer `:99` — the design name 13px/600 and the tier badge.
  - Hovered card `:89-100` — a `rgba(28,27,26,.25)` wash over the preview with **`bottom:41px`, so the name
    and badge stay legible**, and a coral **`Add`** button (13px/600, `8px 22px`, `--radius` 12px).
  - **S5c changes three things and nothing else:** the meta line, which segment is active, and **the
    preview interiors alone**. Card chrome, borders, rail and panel stay light — *"app chrome stays light"*.
- `S4 Editor.dc.html:181` — **S4b**, all five hover children on one line. The two this story builds:
  the **hairline**, `position:absolute; bottom:-1px; left:0; right:0; height:2px; background:#FF5941`
  (= `--color-coral`), and the **pill**, `bottom:-13px; left:50%; translateX(-50%)`, `--color-surface` on a
  1px `--color-coral` border, `--color-coral-text`, 11px/600, `4px 11px`, `--radius-pill`, `--shadow-sm`,
  text **`+ Add section`**. Both carry `animation: addline 1.6s ease-in-out infinite`, defined at `:19`
  as an **opacity** breath `.55 → 1 → .55`. The other three children (name tag, outline, quick-action pill)
  are already built at 5.2 and 5.4; `◀ ▶` and the divider stay 5.11's (`section-pill.tsx:13-14`).
- `S4 Editor.dc.html:172` — the **Layers footer's** `+ Add section`: a full-width 32px `<button>`, dashed
  `--color-line-strong`, `--radius-sm`, 13px/500 `--color-ink-soft`, hovering to `--color-coral-deep` on
  `--color-coral`. Redrawn identically at 834 and 720 (`D8 Editor Below 1440.dc.html:72`, `:202`). It is
  the Kit's `AddButton` (`kit/button.tsx:87`), which `/kit` already draws with these very words.
- `Editor Sidebar Kit.dc.html:57` search · `:161-162` badges · `:246` skeleton · `:220-223` the Layers row,
  whose rest/hover/selected treatment **is** the rail row's, which is why the rail needs no new tokens.

**The normative text**
- `prd.md:229` **FR-D12** — the whole surface in one paragraph: full-screen, rail, search, live previews
  in the project's pack and content source, Free/Pro badges with the canvas open, insertion at the
  invoked position, the `bindingContext`/`compileTarget` filter as *"FR-H7's prevention rule, applied to
  placement"*, and the non-placeable treatments absent from the rail.
- `prd.md:219` **FR-D2** (the hairline "+") · `prd.md:228` **FR-D11** (`⌘K`) · `prd.md:431` **FR-L3**
  (the exits, not the picker) · `prd.md:473` **NFR-1**, which names *"Section Picker preview lazy rendering"*.
- `EXPERIENCE.md:151` the surface row and its two doors · `:346` the state row (empty · loading · error ·
  refusal) · `:502` **`↑ ↓ ← → across the grid, Enter places, Esc closes and returns focus to the invoking
  position`** · `:875` the walkthrough's beat 2, which is where *"the section lands where it was invoked"*
  and the picker closing behind it are stated · `:60` tablet-and-desktop only, so there is no 390 frame to miss.
- `epics.md:1841-1866` — this story's own criteria, including R-145's *"`⌘K` is bound HERE"*.
- `sections-inventory.md:19-25` — the placeable / non-placeable carve-out, stated as a rule with its count
  derived; `:732`, `:749`, `:760` — A32, A33, A34 and why each is chosen elsewhere.
- `appendix-b1-template-contexts.md:78-101` — **§3's master matrix, one row per template.** This is the
  source for the template → resource table the `bindingContext` half of the filter needs; §3a's wrapper
  rule and §5's `{{#get}}` column are what put `tags`/`authors`/`tiers` on templates that do not carry
  them natively, and R-7 is what keeps them off `error.hbs` and `private.hbs`.

**What exists and is extended, never rebuilt**
- `packages/library/src/placement.ts` — **written for this story.** Its header: *"offered (Story 5.10's
  Section Picker, which calls the same two functions)"*. `NON_PLACEABLE` `:18`, `POST_CONTENT` `:22`,
  `categoryOf` `:25`, `isPlaceable` `:29`, `placementRefusal(designId, present)` `:40` returning
  *"this layout already prints the article"* or `null`. The two answers are deliberately different
  shapes — absent for one, a sentence for the other (UX-DR3).
- `packages/section-runtime/src/doc-edit.ts:54` — **`duplicateSection` is the template for the insert**:
  pure, `ProjectDoc | string`, the caller passes the new id, and it already calls `placementRefusal` over
  `doc.instances.map(i => i.designId)`. `withInstances` `:30` and `missing` `:25` are the internals to mirror.
- `packages/section-runtime/src/doc-schema.ts:24` — `instanceSchema`, `z.strictObject`, strict at both
  levels, and its header's standing rule: **a new field arrives with its writer and always `.default(…)`**.
  This story adds none. `synthesize.ts:115-126` is where a fresh instance's shape is already written once.
- `packages/section-runtime/src/controls.ts:486` — `defaultContent(contentSchema)`, the new instance's content.
- `apps/web/lib/canvas.ts:39` — **`renderSection(doc, entry, state, o)`**, client-safe, the one door both
  `/pilots` and the editor already use; `mountSections` `:78`; `canvasSrc(appPrefixed)` `:16`.
  `apps/web/lib/pilots.ts:109-119` — `pilotsCanvasDocument()` puts **every** design's stylesheet into the
  one `/canvas` document, so a preview frame needs no CSS plumbing of its own.
- `apps/web/app/…/(editor)/read.ts:193-210` — `EditorData` already carries **every placeable design** with
  its `rows`, `tier` and `previewSeed`, loaded eagerly with a comment naming this story. `validate.ts:608`:
  *"previewSeed is required — the Section Picker renders every design from it."* Its ceiling is **DW-200**.
- `apps/web/lib/keymap.ts:64` — `{ action: 'Add section', chips: ['⌘K'], story: '5.10' }`, the table's first
  row. Landing it is that row plus one `Gesture` member plus one `run()` arm; `sheetRows()` `:105` and
  `SINGLE_KEY` `:110` both derive, so the `?` card grows on its own. **`shortcutFor` `:136` is where the
  caret rule lives** and where this story narrows it.
- `apps/web/lib/inline.ts:230` — `KEYS = { b:'strong', i:'em', u:'u', k:'a' }`. **`⌘K` is already the link
  mark**, and at `:240` a field that does not permit it *returns without `preventDefault`* on purpose, so
  the key reaches the browser. That path is what makes the narrowing necessary rather than tidy.
- `apps/web/app/…/(editor)/editor.tsx` — `commit(written, touched)` `:375` (the one doc-write door),
  `journalise` `:436`, `apply`/`edit`/`refuse` `:1334-1360`, `run(gesture)` `:907`, `onShortcut` `:931`,
  the `latest` ref `:362`, `pillBox()` `:1428` (the editor-side placement a pressed "+" reuses), the
  chrome-layer table `:1295-1312` (one row per placed element), `paint()` `:675`, `choose` `:659`.
- `apps/web/components/controls/section-pill.tsx:18-22` — **the reason a pressed control cannot be a portal
  into the canvas document**: React's delegation is attached in the editor document, so a portal there
  receives no React events at all. `:13-14` already names the hairline "+" as this story's.
- `apps/web/lib/canvas-layer.ts:139` — `place(el, root, fit, how)` and its **`'above'`** mode, built for
  P0-1's pill: centred on the root, clamped to both edges, flipping below when it would be cut off.
- `apps/web/components/controls/icon-picker.tsx` — **the app's worked example of this exact surface**:
  `SearchInput` `:229`, a category list, a filtered grid `:135`, an empty state `:278-285`, and
  **`gridKeys(event)` `:181`** — a roving-tabindex arrow grid over `data-cell`. Lift it; do not write a second.
- `apps/web/components/kit/` — `dialog.ts` (`openOnCancel`, `closeOnBackdrop`, `sheet`), `input.tsx:154`
  `SearchInput`, `badge.tsx:12` `ProBadge` / `:20` `FreeBadge`, `loading.tsx:4` `Skeleton`,
  `button.tsx:87` `AddButton`, `segmented.tsx:27` `tabStop` / `:34` `radioKeys`, `greyed.ts:60` `ring` /
  `:67` `slimScrollbar`, `empty-panel.tsx:4` `EmptyPanel`.
- `apps/web/components/editor/mode-toggle.tsx:24` — `modeShown` and `ModeToggle`, R-132's one button, if
  Question 2 is ruled that way.
- `apps/web/lib/style-pack.ts:53` — `PRESETS`, each with a `name` (`'Paper'`). The project's own
  `projects.style_pack` (`complete_schema.sql:223`) is **not** in `EditorData` today; the meta line's
  pack name is two lines in `read.ts`.

**The gates that will run it**
- `apps/web/tokens.test.ts:126` no colour literal under `apps/web`, three named exemptions only; `:31`
  every `--color-*` must occur verbatim in a `.dc.html`; `:78` every token name has a `DESIGN.md` twin.
- `apps/web/busy.test.ts` — R-98 both halves; `:242` every `router.push` near a pending signal.
- `apps/web/pilots.test.ts:40` every selector in `canvas-chrome.css` is keyed on `[data-inflozo-`, and the
  canvas document embeds the file verbatim; `:79` every file read at runtime is traced in
  `next.config.ts`'s `PILOTS_FILES` or the deployed function throws ENOENT.
- `apps/web/editor.test.ts:103` — the stack order (site-wide non-`a3` → canvas → `a3` footers, each in doc
  order). **This is why a site-wide design cannot land at an invoked position.** `node --test` strips types
  but cannot load a `.tsx`, so every pure part of this story belongs in a `lib/*.ts`.
- `tools/keyboard/journey.spec.mjs:401` — the deferred-key loop `⌘K` comes out of; `:128` the test that
  reads the spec file itself and **fails if a mouse or tap API appears in it**.
- `tools/probe/run-verify-editor.cjs` — **step 5's one CSP context is the spine of the walk** and every new
  interaction belongs inside it; **step 8** is axe, with R-149's node filter inlined twice (`:3408`, `:3418`),
  one rule on one element. This story adds one `axeRun()` with the picker open, and its own steps after
  the last one on file.

**The ledger**
- **DW-190** (low) — *"a refusal shown 'where the action was pressed' has nowhere to go when the section has
  no root"*; `owner: Story 5.10 (the Section Picker, which draws the refusal surface for placement)`. This
  story gives the refusal a home and **closes it**.
- **DW-200** (medium) — the editor is handed every placeable design. Named to the first Epic 9 story that
  makes the payload a problem; this story is the second caller it predicted, and adds nothing to it.
- **DW-177** (open) — four designs in the library are named by no story; unrelated, but the rail's
  derivation is where a category with no title would surface, so the validator rule below is its tripwire.

## Tasks & Acceptance

**Execution.** No migration and no schema change, so **no Schema phase** (R-99). **All three questions are ruled —
R-150, R-151 and R-152, option 1 each (owner, 2026-09-19), R-152 with an amendment in his own words** — so the list
below is the whole of it: no Free-only switch, R-132's one button in the header, and site-wide designs offered with a
globe on the card instead of a sentence.

- [x] `packages/library/designs/*/content.json` -- add `title` per category, from the export's roster
      (`a1` Headers · `a4` Heroes · `a17` Post Grids · `a22` Newsletter · `a24` Post Headers) -- the rail
      needs a display name and the category directory is the only place one can live without a second
      list that can drift from it.
- [x] `packages/library/src/registry.ts` -- `CategoryContent` gains `title: string`; `SectionRegistryEntry`
      gains `categoryTitle`; `assembleEntry` carries it -- one field, one source, and every future category
      story authors its own with its designs.
- [x] `packages/library/src/validate.ts` -- `validateCategoryContent` requires a non-empty `title` that is
      not the bare id; **and refuse at assembly a design whose `bindingContext` intersects the contexts of
      none of its own `compileTarget`s** -- an authoring error must be loud, never a design silently missing
      from the picker (standing rule 3).
- [x] `packages/library/src/placement.ts` -- add `CONTEXTS_BY_TARGET`, the template → resource table cited
      to `appendix-b1-template-contexts.md` §3 and §5, and `offeredOn(entry, file)` = `isPlaceable` ∧
      `compileTarget.includes(file)` ∧ a non-empty `bindingContext` intersection; plus `byCategory`, numeric
      (`a17` sorts after `a4`, which a string sort gets wrong) -- one pure query the rail, the grid, the
      counts and every empty state read.
- [x] `packages/section-runtime/src/doc-edit.ts` -- `insertSection(doc, at, instance)` beside
      `duplicateSection`, same shape, same `placementRefusal` call, caller-supplied id -- the whole
      data-layer change.
- [x] `apps/web/lib/picker.ts` -- new and pure: the rail model (offered categories in numeric order with
      their runtime counts), the search filter over design and category names, the invoked position, and the
      three empty-state sentences -- `node --test` reaches a `lib/*.ts` and cannot reach a `.tsx`.
- [x] `apps/web/lib/keymap.ts` -- land `⌘K` (`gesture: 'add'`, `keys: ['k']`, `meta: true`, the `story` key
      gone) and **add `'add'` to `shortcutFor`'s in-field exclusion beside `undo` and `redo`** -- `⌘K` is
      already the link mark in a text field (`inline.ts:230`) and must yield to a caret; the fix belongs in
      the shared function, not in the caller.
- [x] `apps/web/components/editor/section-picker.tsx` -- new: S5a's overlay as a native modal `<dialog>`
      (`Esc`, the focus trap and focus return are the platform's), the 240px rail as a radio group over
      `radioKeys`/`tabStop`, the Kit's `SearchInput`, the multi-column grid over `icon-picker.tsx`'s
      `gridKeys`, and the card with its hover wash, `Add` button and tier badge. **The rail footer's `Free only`
      row is NOT built** (R-150), the header's dark control is `mode-toggle.tsx` reused verbatim at the segmented's
      drawn position (R-151), and a site-wide design's card carries the Kit's `Globe` (`kit/icons.tsx:412`) beside
      its name with a hover `title` and the same words as its accessible name (R-152).
- [x] `apps/web/components/editor/section-preview.tsx` -- new: one card's live preview. An
      `IntersectionObserver` creates an `inert` `/canvas` iframe only when the card nears the viewport
      (NFR-1), `renderSection` paints it, and it is sized to R-137's Desktop width and fitted to the card so
      the design's own media queries fire as they will on the site. The Kit's `Skeleton` holds the space
      until then, and a render that throws keeps the skeleton and leaves the card addable.
- [x] `apps/web/lib/canvas-chrome.css` -- the insertion hairline as one rule keyed on `[data-inflozo-insert]`,
      with S4b's `addline` opacity breath, degrading through `globals.css`'s reduced-motion block -- painted
      chrome belongs inside the frame and takes no press.
- [x] `apps/web/app/…/(editor)/editor.tsx` -- the `add` arm in `run()`; the picker's open state and its
      invoked position; the insert through `commit` so it is one edit and one undo step; the pressed
      **"+ Add section"** pill on the hovered gap, placed like `SectionPill` and added as one row to the
      chrome table; the Layers footer's `AddButton`; the empty canvas's one affordance; and the polite
      announcement through `#editor-said`, **naming the Site-wide group when that is where a section went** — the
      announcement only, **never a visible sentence, toast or banner** (R-152). Site-wide designs are offered on
      every canvas; **a second one in the same category replaces the first**, in the same transaction, so `⌘Z`
      restores the old one.
- [x] `apps/web/app/…/(editor)/read.ts` -- read `projects.style_pack` and hand the editor the preset's name
      for the meta line -- the only new field `EditorData` gains.
- [x] `apps/web/picker.test.ts` · `packages/library/src/placement.test.ts` · `apps/web/keymap.test.ts` --
      the I/O matrix's rows as unit tests: every filter arm, the numeric order, the three empty states, the
      refusal, the insert positions, and `⌘K` both ways across the caret.
- [x] `tools/keyboard/journey.spec.mjs` -- `'ControlOrMeta+k'` leaves the deferred loop at `:401` and gets
      its own stop: open, arrow across the grid, `Enter` places, focus returns to the invoking control,
      `Esc` closes; plus one asserting `⌘K` with the caret in a field does **not** open it.
- [x] `tools/probe/run-verify-editor.cjs` -- this story's steps after the last on file, inside step 5's one
      CSP session, and one more `axeRun()` with the picker open -- **asserting no second node exception is
      needed** (R-149), which is what the `inert` preview frames buy.

**The Fix phase (R-153, the owner's test of 2026-09-20).** Four changes, one fault.

- [x] `apps/web/components/editor/section-picker.tsx` -- the grid becomes `COLUMNS` (4) tracks over a fixed `ROW`,
      packed `dense`; the arrow step follows it (`right: 1`, `down: COLUMNS`, one constant for both the layout and
      the keys); and the card is a flex column whose footer holds the `Add` as a centred icon between the name and
      the tier badge, with S5a's wash demoted to `pointer-events-none` decoration.
- [x] `apps/web/lib/picker.ts` -- `spanFor(aspect)`, with `WIDE_UNDER` and `TALL_OVER`: the only place a card's
      shape is decided, and pure, so `node --test` reaches it.
- [x] `apps/web/components/editor/section-preview.tsx` -- the preview FILLS its tile instead of setting its own
      height, reports its drawn aspect once, crops what is taller and centres what is shorter.
- [x] `apps/web/picker.test.ts` -- `spanFor` over a band, a hero, a feed, an undrawn card and both thresholds.
- [x] `tools/keyboard/journey.spec.mjs` -- the arrow walk is a real grid's now: `→` is the next card, `←` returns,
      `↓` crosses a row.
- [x] `tools/probe/run-verify-editor.cjs` -- step 83 gains the three assertions his findings deserve on the
      deployed site: four columns, a band two wide and a feed two tall, and the `Add` an icon in the footer strip,
      centred on the card and whole.

**Acceptance Criteria:**
- Given a canvas with sections, when I hover the gap between two of them, then a 2px coral hairline and the
  **"+ Add section"** pill appear on that boundary and breathe in opacity; **and both match `S4 Editor.dc.html:181`**.
- Given the picker open, when I look at it, then it **matches `S5 Section Picker.dc.html` S5a** — the 22px-inset
  panel, the 240px rail under `ALL CATEGORIES` with no number, the search field reading `Find a section…` with
  its `⌘K` chip, the category title and meta line, and the card grid with its hover wash and coral `Add` — and
  with the dark preview on it **matches S5c**, whose only changes are the preview interiors: the app chrome stays light.
- Given a Free plan, when a Pro design is shown, then it carries `✦ Pro`, it can be added, and **nothing asks
  for money** (UX-DR19); **and the rail carries no Free-only switch** (R-150).
- Given a site-wide design, when its card is drawn, then it carries the `Globe` with a hover title and the same
  accessible name, **and no sentence, toast or banner appears anywhere when it is placed** (R-152); and picking a
  second one in that category replaces the first in one `⌘Z`-able edit.
- Given the picker open, when I press the header's dark control, then it is **one button that swaps its glyph**
  (R-132, R-151), the previews invert and the app chrome stays light, and the canvas behind agrees on the mode.
- Given any canvas, when the picker opens, then every design drawn can actually be placed there, every category
  in the rail has at least one, and no non-placeable treatment's category appears at all.
- Given a placement, when it lands, then it is **one** edit, one journal entry and one `⌘Z` away from gone.
- Given the keyboard alone, when I use the picker, then `⌘K` opens it, arrows cross the grid, `Enter` places,
  `Esc` closes and focus returns to the control that opened it — and `pnpm keyboard` proves it on every commit.
- Given the deployed editor, when the walk runs, then step 5's CSP count is still zero and step 8's axe is zero
  with the picker open, **with no exception beyond R-149's one**.

## Design Notes

**The filter is one query, and the `bindingContext` half is made loud rather than silent.** Today
`compileTarget` alone gives the same answer as both together on every design in the repo, and
`bindingContext` has no runtime reader at all — so a mistake in the template → resource table would hide a
design invisibly, which is the worst failure this surface has. The table is therefore paired with a
**validator rule**: a design whose contexts fit none of its own targets is refused at assembly with a
sentence. A table that is wrong then breaks a build for a real design instead of quietly shrinking a rail.

**The preview is the canvas's own render, at the canvas's own device width.** A design's stylesheet carries
media queries that key on the **viewport**, so a shadow root sized to a card would apply the desktop rules at
card width and draw a broken miniature. R-137 settled the same point for the canvas — *"the iframe's CSS
pixel size IS the device's, so media queries fire"* — and a picker card is the identical problem: the frame
is Desktop-wide and a `transform` fits it into the card. The frames are created only as cards approach the
viewport, which is NFR-1's *"Section Picker preview lazy rendering"* read literally. `/canvas` is one
document the browser caches once and every card reuses; its weight is **DW-200**'s, not this story's, and
this story adds nothing to it.

**`inert` on the preview frame is what keeps NFR-5 at zero.** The canvas iframe needed `tabindex="-1"` and
cost R-149 an axe exception, because the canvas must stay pointer-editable and `inert` would have taken the
pointer with it. A preview takes no pointer — the card above it is the target — so `inert` is available here
and is strictly better: nothing inside is focusable or in the accessibility tree, so
`frame-focusable-content` has nothing to say, and R-149 stays one rule on one element. Each frame keeps a
`title` for `frame-title`.

**The overlay is a native `<dialog>`, not a div.** `Esc`, the focus trap and the return of focus to the
invoking control are three of `EXPERIENCE.md:502`'s four requirements, and the platform gives all three
free; `shortcuts-sheet.tsx` is the precedent in this codebase. It also settles a subtlety: `onShortcut`
already yields every single-key binding to `dialog[open]`, so `L`, `.`, `1` `2` `3` and `Del` go quiet while
the picker is open with no new guard — which is correct, and is why Question 2 exists at all.

**`⌘K` is narrowed, in the shared function.** `shortcutFor` lets a `⌘`-modified gesture through with the
caret in a field (only `undo` and `redo` are held back), and `⌘K` is already the **link** mark there
(`inline.ts:230`). Worse, a field that does not permit links returns *without* `preventDefault` on purpose,
so the key would fall through to the picker instead of the browser. Adding `'add'` to that one exclusion
list fixes every caller at once. It does not make `⌘K` a `SINGLE_KEY`: it stays `⌘`-modified, so it needs no
WCAG 2.1.4 focus condition and still works while a popover is open.

**Two reconciliations, both stated rather than asked.** (1) The meta line is **one** template —
`{n} designs · shown in your pack: {pack}`, S5a's words byte-for-byte — with **` · dark mode`** appended when
the dark preview is on, which is the only thing S5c's line actually adds; S5c's shortening of the rest is
treated as drawing drift, not a second string. (2) The tier badges are the **Kit's** `ProBadge` and
`FreeBadge`, not S5's card-local sizes (10px/`1px 8px` against the Kit's own): one badge vocabulary across
the product beats a per-surface size, and `kit/badge.tsx` is already what B10 and the canvas Pro tag use.

**The insert positions, and the one that cannot be honoured.** `⌘K` with a selection inserts **after** it —
`duplicateSection`'s own precedent — and with nothing selected, at the end of this canvas's stack; the "+"
inserts at its gap. A **site-wide** design is the exception: the stack order is *derived*
(`editor.test.ts:103` — site-wide non-`a3`, then the canvas, then `a3` footers), so a header cannot land
between two canvas sections however it was invoked. Changing that would mean changing Story 5.4's stack rule,
which is out of this story's scope, so **R-152 moves the information earlier instead of explaining it later**: the
card carries the `Globe` before you press, rather than a sentence after. A second site-wide design in the same
category **replaces** the first — the behaviour a single shared header implies — in the same transaction, so `⌘Z`
puts the old one back. The only thing said aloud is the polite `#editor-said` announcement every placement already
makes, which is a screen reader's sole access to a glyph and a hover.

## Dev notes (2026-09-20)

**Two things the spec did not foresee, both found by executing rather than reading.**

1. **`offeredOn(entry, file)` alone hides every site-wide design from every canvas.** A header compiles to
   `default.hbs` and nothing else, so a picker opened on Home and asked only about `home.hbs` offered no Headers
   category at all — and R-152 and the owner's manual test step 10 both require one. `lib/picker.ts`'s `offeredHere`
   therefore asks about **two** files, the canvas's and the site's, and `isSiteWide` decides where each one lands.
   The library's `offeredOn` is unchanged and still answers one file at a time.
2. **`ModeToggle` hard-coded `id="editor-mode"`.** R-151 puts a second one in the picker's header, which made the id
   duplicate — and the deployed walk finds the top bar's sun by exactly that id (steps 46-53). The id is a parameter
   now, defaulted, and the picker's is `picker-mode`.

**Three smaller decisions, each made rather than asked (routine judgement calls).**

- **`pilots.test.ts`'s chrome-selector reader learned at-rules.** The hairline needs a `@keyframes` and a
  `prefers-reduced-motion` block, and the reader split on `}` and read `@media (…)` as an unkeyed selector. It now
  drops a `@keyframes` block whole (it carries no selector) and strips a wrapping at-rule's opener, so the rules
  **inside** one are still read and still held to the `data-inflozo-` key. Both cases carry a control assertion.
- **`globals.css` cannot reach the canvas document**, so the hairline's reduced-motion degrade is written in
  `canvas-chrome.css` beside it, for the same preference the browser reports in both. The pressed pill and the
  overlay go through `globals.css`'s existing block, as the spec says.
- **The card's press target is S5a's wash itself** (`top:0 … bottom:41px`), with `Add` centred in it. One
  interactive element per card, the whole picture as a target, the name and badge legible below it — and no
  interactive content nested over an `inert` frame, which is what would have cost a second axe finding.

**Not executed here, and owed to Review (R-82):** the deployed walk. `tools/probe/run-verify-editor.cjs` gains steps
81-85 and one more `axeRun()` with the picker open; none of it has run against production, because the code is not
published yet. Everything else in § Verification below is green on this machine.


## Owner's test findings

**Tested on the deployed editor, 2026-09-20. Four findings, all one fault — the grid.** In his own words:

> *"The section picker needs major work in the grid/layout it shows the sections. Right now, I cannot clearly see what
> Rail section is. It is very thin. When I hover over it Add button is cut off. Do following changes: 1. Make the grid
> 4 columns only. 2. On hover, show the Add button (only show icon, no text) in the bottom strip of the section between
> name and Free/Pro. The Add icon buttons should be center aligned. 3. For thin/wider sections, can we span two columns,
> so they are clearly visible. 4. For Longer sections we can span them two rows."*

**Recorded as R-153** (`reconcile-designs-decisions.md` §A10), because it supersedes a frame and R-74 makes the export
the design authority: **S5a and S5c are superseded on the grid's shape and the `Add`'s seat alone**, and every other
pixel of both frames stands. The register entry carries why the frame was wrong; the short version is that S5a`:88` is
**CSS multi-column** (`column-width:300px`), which gives every card a column's width and **its own content's height** —
so the `a1` header, about 100px tall at Desktop width, was drawn as a ~20px sliver. The cut-off `Add` is the same
geometry: S5a's hover wash **is** the button, `top:0 → bottom:41px`, so on a section shorter than the pill inside it the
pill is cropped. The frame was drawn with stress-fill cards of one comfortable height; the real library is not one
height, and the miniature is this surface's whole point.

**The fix, in one line each.**
1. **Four columns** of a fixed row unit (`COLUMNS`, `ROW` in `section-picker.tsx`), packed `dense` so a two-column band
   leaves no hole behind it.
2. **The `Add` is an icon in the footer strip**, centred on the card between the name and the tier badge — on hover, on
   focus, and always where there is no pointer to hover with (a tablet is inside this surface's range,
   `EXPERIENCE.md:60`). S5a's wash stays as the hover treatment, decoration only: `pointer-events-none` and
   `aria-hidden`, so there is still exactly one interactive element per card.
3. **A band spans two columns** and **4. a feed spans two rows** — `lib/picker.ts`'s `spanFor`, measured from the
   design's **own drawn aspect** (its height at Desktop width), which the preview already knows, so no design carries a
   hand-written shape and a new category needs no entry anywhere.

**One thing his four changes needed that he did not ask for, and it is stated rather than asked:** a tile's height is
now the grid's, not the content's, so a **taller** section is cropped at the bottom and a **shorter** one is **centred**
in its tile rather than hung from the top. Without that a band still sat against the rule with all its air beneath it.

## Verification

**Run on 2026-09-20 at `e794046b`, on this machine unless a line says otherwise. Every one green.**

| Command | Returned |
|---|---|
| `pnpm check` | **exit 0** — lint, typecheck and every package's tests, `fail 0` in each of the six runs it prints (apps/web, section-runtime, library, ghost-shim, theme-compiler, and the root matrix cases). Browser-free by design. |
| `pnpm keyboard` | **exit 0 — 20 passed**, including this story's three new stops: `⌘K` opens the picker, the arrows cross the grid, `Enter` places and `Esc` returns focus (`journey.spec.mjs:426`); R-152's globe, the replacement and its one `⌘Z` (`:474`); and `⌘K` with the caret in a field **not** opening it (`:499`). `:128`'s no-pointer assertion still passes over the grown spec. |
| `node --test --experimental-strip-types apps/web/picker.test.ts apps/web/keymap.test.ts apps/web/editor.test.ts` | **34 pass · 0 fail** — the rail in numeric order counted at runtime, the site-wide row, the empty rail, the absent non-placeable, the search across the rail, the three empty states, the meta line, `invokedAt`, and `⌘K` bound, listed and yielding to a caret. |
| `node --test --experimental-strip-types packages/library/src/placement.test.ts packages/library/src/validate.test.ts` | **0 fail** — `CONTEXTS_BY_TARGET` against appendix B1 §3/§5 with R-7 holding §5 off `error.hbs` and `private.hbs`, each of `offeredOn`'s three conditions withholding a design on its own, `byCategory` numeric, and the two new refusals: `context-unreachable` (a design whose contexts fit none of its own targets) and `category-title`. |
| `node --test --experimental-strip-types packages/section-runtime/src/doc-edit.test.ts` | **19 pass · 0 fail** — `insertSection` at the invoked position, a position off either end **clamped** rather than refused, a blank or duplicate id refused with nothing written, and R-37's second Post Content refused with the sentence the picker shows (**DW-190**). |
| `pnpm build` | **exit 0**, and the **route table is unchanged** — the diff since `5ab1ddd7` adds no `page.tsx`, `route.ts` or `layout.tsx`; the only route file it touches is the editor harness page. |
| `python3 tools/doc-audit.py --check`, twice | **PASS (0 warnings)** both times. |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0** against the PostgreSQL 17 container with every file in `supabase/migrations/` applied — run as the control that this story touches no database. |

**Real services this phase hit (R-82).** One, and it is the control R-99 exists for: `read.ts` now selects
`projects.style_pack`, so the column was read **out of the production database** before the code that needs it
shipped — `GET {SUPABASE_URL}/rest/v1/projects?select=id,name,style_pack` with `SUPABASE_SECRET_KEY`
(variable names only; no value printed) returned **HTTP 200** with `style_pack` present on every project and
`{"preset":"paper"}` on **Pilot sections** `b6d4db35-8e5e-45e1-a70f-4daa28916d51`, which `placeholderFor(…).name`
resolves to `Paper` for S5a's meta line. No migration, no write, no Schema phase. Ghost (T1/T3), Resend and Dodo
are not read by this story.

**CI on the Dev commit.** `e794046b`'s `check` job went **red on `python3 tools/doc-audit.py --check`** and
`deploy` was skipped — **DW-132**, not this story: the run crossed midnight, so the generated boards' `updated:`
stamp went from 2026-09-19 to 2026-09-20 between the pre-commit hook and CI. The regenerated boards ride on this
phase's second commit and CI is green from there.

**The Fix phase, re-run 2026-09-20 after R-153.** `pnpm check` **exit 0** · `pnpm keyboard` **20 passed** (the
picker's arrow walk rewritten for a real grid: `→` the next card, `←` back, `↓` a whole row) ·
`node --test --experimental-strip-types apps/web/picker.test.ts` **12 pass · 0 fail**, `spanFor`'s two new tests
among them · `python3 tools/doc-audit.py --check` green twice · `pnpm build` **exit 0**. And the grid was
**photographed** on the harness editor at 1600 and 1280 (`tools/keyboard`'s own dev server, Chromium): four tracks
at both widths, `a1/1` two columns wide, `a17/1` two rows tall, `a4/13` and `a22/1` one tile each, and the hovered
card's `+` centred in its footer strip between the name and the badge.

**Owed to Review, and not run here (R-82).** The deployed walk. `tools/probe/run-verify-editor.cjs` gains
**steps 81-85** inside step 5's one CSP session — the picker's shape against S5a and S5c, the rail, the search,
R-152's globe and its accessible name, the hairline and the pressed pill measured on a hovered gap, the placement
and its one `⌘Z` — plus **one more `axeRun()` with the picker open**, whose exit criterion is **zero with no
exception beyond R-149's one**. None of it has executed, because the code is not published yet.
`env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) OUT_DIR=/tmp/p5
node tools/probe/run-verify-editor.cjs` is the command; 0 FAIL across every step is the expectation.

**The matrix, row by row.** Every row of § I/O & Edge-Case Matrix is asserted by a test that ran above, except
the two noted:

| Row | Proved by |
|---|---|
| Open at a gap | `picker.test.ts` `invokedAt` (the gap **is** the position) · probe step 85 for the pill itself |
| Open by key, with and without a selection | `keymap.test.ts` `⌘K is bound…` · `journey.spec.mjs:426` |
| Open on an empty canvas | `picker.test.ts` the three empty states |
| Place | `doc-edit.test.ts` `insertSection` · `journey.spec.mjs:426` (places, closes, focus returns) |
| Second Post Content | `doc-edit.test.ts` R-37's sentence (**DW-190**) |
| Site-wide design · a second header | `picker.test.ts` R-152 ×2 · `journey.spec.mjs:474` (globe, replace, one `⌘Z`) |
| Wrong template · wrong resource | `placement.test.ts` `offeredOn`'s three conditions · `validate.test.ts` `context-unreachable` |
| Non-placeable | `placement.test.ts` · `picker.test.ts` |
| Search, no matches · nothing offered here | `picker.test.ts` the search across the rail, and the three empty states |
| `⌘K` with a caret | `keymap.test.ts` · `journey.spec.mjs:499`, both a panel field and a canvas `contenteditable` |
| A preview that throws | **read, not executed** — `section-preview.tsx:113`'s `catch` keeps the `Skeleton`, leaves the card addable and `console.warn`s; it is a `.tsx`, which `node --test` cannot load, and no harness forces a `renderSection` throw. The smallest honest statement is that this row is covered by inspection alone. |

## Owner's manual test

Do this on the real site after Deploy confirms the URL. Use the **Pilot sections** project — the one seeded
to your account at Story 5.1.

1. **URL:** `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` · **Screen:** the editor,
   on Home. Move the mouse slowly over the gap between two sections. **Expect:** a thin coral line appears on
   the boundary and a small white "**+ Add section**" pill sits on it, both gently pulsing.
2. **Same screen.** Click that pill. **Expect:** a picker fills the window over a dimmed editor — categories
   down the left, a search box above them, and cards on the right. **Each card shows a small live picture of
   the real section**, in your own colours, with your own words in it — not a stock image.
3. **Same screen.** Look at the left list. **Expect:** only categories that can go on a home page — today
   **Heroes**, **Post Grids** and **Newsletter**. Each has a number beside it. The heading above them reads
   **ALL CATEGORIES** with no number of its own.
4. **Same screen.** Type `hero` into the search box. **Dummy data:** the word `hero`. **Expect:** the cards
   narrow to matching ones. Now type `zzzz`. **Expect:** the category list on the left **stays exactly where
   it is**, and the card area says it found nothing for "zzzz" — never a blank white space.
5. **Same screen.** Clear the search, hover any card. **Expect:** the card lifts slightly and a coral **Add**
   button appears over the picture — with the section's name and its Free or ✦ Pro tag still readable below it.
6. **Same screen.** Click **Add** on any card. **Expect:** the picker closes and that section is now on the
   page, **in the gap you started from**. Press `⌘Z` once. **Expect:** it is gone again, in one press.
7. **Same screen.** Press `⌘K`. **Expect:** the same picker opens. Press `Esc`. **Expect:** it closes and the
   editor is exactly as you left it.
8. **Same screen.** Click into a headline on the canvas so the text cursor is in it, then press `⌘K`.
   **Expect:** the picker does **not** open — `⌘K` is the link button while you are writing. This is the most
   important step on this list.
9. **Same screen.** Open the picker again and find a card tagged **✦ Pro**. Click it. **Expect:** it is added
   like any other, and **nothing asks you to upgrade**. That question is only asked the day you ship.
10. **Same screen.** Open the picker and find the **Headers** category. **Expect:** each card there shows a small
    **globe** beside its name; rest the pointer on the globe and a label appears saying it is site-wide and shows on
    every template. **There is no sentence, banner or pop-up about this anywhere.**
11. **Same screen.** Add that header. **Expect:** it appears at the very **top** of the page rather than in the gap
    you were in, and it **replaces** the header that was already there — your site has one header. Press `⌘Z` once:
    the old header is back.
12. **Same screen.** Open the picker and look at its top-right. **Expect:** a single **sun** button. Press it —
    it becomes a **moon**, and every card's picture turns dark while the picker itself stays light. Press it again
    to come back. Close the picker: the page behind you is in the mode you just chose.
13. **URL:** the same editor, then switch the template to **Post** using the switcher in the top bar. Press
    `⌘K`. **Expect:** a **different** list of categories — the ones that work on an article. The home-page-only
    ones are simply not there, with no greyed-out rows and no explanations.
14. **Same screen.** Use only the keyboard: `⌘K` to open, arrow keys to move between cards, `Enter` to place
    one. **Expect:** it works, and when the picker closes the outline is back on the button you started from.

**Added after your test of 2026-09-20 (R-153) — these are the four you asked for.**

15. **Same screen.** Open the picker. **Expect:** the cards sit in **four columns**, never five thin ones.
16. **Same screen.** Look at the **Rail** header card. **Expect:** it is **twice as wide** as an ordinary card, so you
    can read what it is. Look at **Three Up**, the post grid. **Expect:** it is **twice as tall**. Everything else is
    one ordinary card.
17. **Same screen.** Hover any card. **Expect:** a small round coral **+** button appears in the **bottom strip**, in
    the **middle**, with the section's name to its left and its Free or ✦ Pro tag to its right. It is a plus sign with
    no word beside it, and it is **never cut off**, on any card, however short the picture above it is. Click it:
    the section is added exactly as before.

## Questions for the owner

### Question 1 — should the picker have a "Free only" switch?

The picker's drawing has a small switch at the bottom of the category list reading **Free only**. Turning it
on would hide every Pro section from the list. A while ago you were asked almost the same question about Site
Remix, and you took the switch **out** (**R-77**) — because Inflozo's promise is that the canvas is open: you
can use anything, and only the day you ship do we ask about Pro. A "Free only" switch quietly says the
opposite. It also has a practical cost: a small fraction of the library is Free, so flipping it on empties
most categories and the picker suddenly looks bare.

**Example.** You are on the Free plan and you open the picker on Heroes. Today you would see every hero
design, some with a small gold ✦ Pro tag, and you can add any of them. With the switch on, most of them
disappear and Heroes might show one or two cards.

1. **No switch — the picker always shows everything, Pro tagged.** (RECOMMENDED) — this is exactly what you
   already ruled for Site Remix in R-77, and it keeps one story across the product: browse freely, decide at
   the exit. The ✦ Pro tag still tells you which ones cost money.
2. **Keep the switch, off by default.** You can narrow the list to what you can ship for free. The cost is
   that most categories look nearly empty when it is on, and a Free user who flips it may never discover the
   designs that would make them upgrade.

**Ruled: option 1 (owner, 2026-09-19).** No switch — the picker always shows everything, Pro tagged. Recorded as
**R-150**; S5a and S5c are superseded on the rail footer alone.

### Question 2 — how do you switch the picker's previews to dark?

The picker's drawing has a two-button sun/moon control in its header, so you can see the sections in dark
mode before choosing one. But in September you ruled how the dark control looks everywhere else: **one
button that swaps its own glyph** — a sun while you are in light, a moon while you are in dark (**R-132**).
The picker's drawing shows a different shape for the same job. There is also a mechanical wrinkle: while the
picker is open, the `.` key and the top bar's own sun are out of reach, so without something in the picker
there is no way to see dark previews without closing it first.

**Example.** You are designing a site that offers dark mode. You open the picker to choose a hero. You want
to check the one you like does not look wrong for your dark readers — so you want to flip the previews to
dark without losing your place in the picker.

1. **One button in the picker's header, exactly like the editor's** (sun in light, moon in dark), flipping the
   same setting the canvas uses. (RECOMMENDED) — one shape for one job everywhere, it honours R-132, and the
   picker and the page behind it always agree about which mode you are looking at.
2. **The two-button sun/moon pair exactly as the picker is drawn.** Faithful to the drawing, but it is a
   second shape for a control you have already settled, and the product then has two ways of showing one thing.
3. **No control in the picker at all** — the previews simply show whichever mode the canvas is already in. The
   least to build, but to compare a design in dark you must close the picker, press `.`, and open it again.

**Ruled: option 1 (owner, 2026-09-19).** One button in the picker's header, exactly like the editor's, flipping the
same setting the canvas uses. Recorded as **R-151**; `mode-toggle.tsx` is reused verbatim at the segmented's drawn
position.

### Question 3 — should headers and footers be in this picker?

Headers, footers and announcement bars are **shared**: one header appears on every page of your site, not
just the one you are looking at. The picker's drawing lists them as categories like any other. But because
they are shared, they cannot land where you asked for them — a header always draws at the top of the page,
whatever gap you pressed "+" in. So pressing "+" halfway down your home page and choosing a header puts it
somewhere else, which may read as a bug rather than a rule. **There is a second half to this**: your site has
one header, so if the picker offers headers it must also answer what happens when you pick a *second* one —
today nothing in the code refuses it, and you would get two.

**Example.** You hover the gap between your hero and your post grid, press "+", and pick a header design. The
header appears right at the top of the page instead of in that gap, and a message says it was added to every
template.

1. **Offer them, and say plainly where they went — and picking a second one replaces the first.**
   (RECOMMENDED) — it is what the drawing shows, it is the only way to add a header at all today, and a clear
   sentence ("Header added — it shows on every template") turns the surprise into an explanation. Replacing
   rather than stacking is what you would expect of a header, and `⌘Z` still puts the old one back.
2. **Offer them only from the Layers panel's Site-wide group**, with its own small "+", and keep this picker
   to sections that belong to the page you are on. Tidier in principle, but it is a second picker entry point
   that nothing is drawn for, and it is more to build now.
3. **Leave them out of this story entirely.** Least to build, but then there is no way to add or replace a
   header until a later story, and a project that loses its header cannot get one back.

**Ruled: option 1, amended (owner, 2026-09-19).** Offer them; a second one in the same category replaces the first.
**And in his own words:** *"Do not add a text message that this is shown on all templates. Instead for such Global
sections — use a Globe icon with proper title/label visible on hover."* Recorded as **R-152**. So there is **no
sentence, no toast and no banner**: a site-wide design carries the Kit's `Globe` on its **picker card**, with a hover
`title` and the same words as its accessible name, and the mark therefore arrives *before* the press rather than
after it. **Layers gains no glyph** — R-126 removed B7's on his own test and is not reversed. **The polite
`#editor-said` announcement stays**, because a glyph and a hover are invisible to a screen reader, every other
placement already announces (UX-DR12), and it is not a visible message — which is what the amendment struck.
