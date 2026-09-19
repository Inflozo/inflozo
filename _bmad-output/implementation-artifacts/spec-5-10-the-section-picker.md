---
title: 'Story 5.10 — The Section Picker'
type: 'feature'
created: '2026-09-19'
status: 'ready-for-dev'
owner_test: pending
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
| Site-wide design | a design compiling to `default.hbs` (a header, a footer) | lands in the **Site-wide group**, not at the invoked position, and the announcement says so — the stack order is derived, not stored (`editor.test.ts:103`) | N/A |
| A second header | the site doc already holds one, and another is picked | **Question 3** — no rule exists today: `placementRefusal` knows only `a25`, and `canDuplicate` (`editor.tsx:1725`) governs duplication, not placement | settled with Q3, not guessed |
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
  - Rail footer `:73-76` — the **`Free only`** label and the Kit's toggle, off. **Question 1.**
  - Header `:79-86` — the category title in Bricolage 20px/700 (`:80`); the meta line in mono 12px
    (`:81` **`18 designs · shown in your pack: Paper`**, and S5c `:235` **`18 designs · pack: Paper · dark mode`**
    — the two frames disagree, reconciled in the Design Notes); the sun/moon **segmented** `:82-85`
    (**Question 2**); the close **×** `:86`, 32px, with **no `aria-label` drawn** — it gets one (A7 item 9).
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

**Execution.** No migration and no schema change, so **no Schema phase** (R-99). Three questions are open;
the tasks they govern are marked **[Q1]**, **[Q2]**, **[Q3]** and are not started until each is ruled.

- [ ] `packages/library/designs/*/content.json` -- add `title` per category, from the export's roster
      (`a1` Headers · `a4` Heroes · `a17` Post Grids · `a22` Newsletter · `a24` Post Headers) -- the rail
      needs a display name and the category directory is the only place one can live without a second
      list that can drift from it.
- [ ] `packages/library/src/registry.ts` -- `CategoryContent` gains `title: string`; `SectionRegistryEntry`
      gains `categoryTitle`; `assembleEntry` carries it -- one field, one source, and every future category
      story authors its own with its designs.
- [ ] `packages/library/src/validate.ts` -- `validateCategoryContent` requires a non-empty `title` that is
      not the bare id; **and refuse at assembly a design whose `bindingContext` intersects the contexts of
      none of its own `compileTarget`s** -- an authoring error must be loud, never a design silently missing
      from the picker (standing rule 3).
- [ ] `packages/library/src/placement.ts` -- add `CONTEXTS_BY_TARGET`, the template → resource table cited
      to `appendix-b1-template-contexts.md` §3 and §5, and `offeredOn(entry, file)` = `isPlaceable` ∧
      `compileTarget.includes(file)` ∧ a non-empty `bindingContext` intersection; plus `byCategory`, numeric
      (`a17` sorts after `a4`, which a string sort gets wrong) -- one pure query the rail, the grid, the
      counts and every empty state read.
- [ ] `packages/section-runtime/src/doc-edit.ts` -- `insertSection(doc, at, instance)` beside
      `duplicateSection`, same shape, same `placementRefusal` call, caller-supplied id -- the whole
      data-layer change.
- [ ] `apps/web/lib/picker.ts` -- new and pure: the rail model (offered categories in numeric order with
      their runtime counts), the search filter over design and category names, the invoked position, and the
      three empty-state sentences -- `node --test` reaches a `lib/*.ts` and cannot reach a `.tsx`.
- [ ] `apps/web/lib/keymap.ts` -- land `⌘K` (`gesture: 'add'`, `keys: ['k']`, `meta: true`, the `story` key
      gone) and **add `'add'` to `shortcutFor`'s in-field exclusion beside `undo` and `redo`** -- `⌘K` is
      already the link mark in a text field (`inline.ts:230`) and must yield to a caret; the fix belongs in
      the shared function, not in the caller.
- [ ] `apps/web/components/editor/section-picker.tsx` -- new: S5a's overlay as a native modal `<dialog>`
      (`Esc`, the focus trap and focus return are the platform's), the 240px rail as a radio group over
      `radioKeys`/`tabStop`, the Kit's `SearchInput`, the multi-column grid over `icon-picker.tsx`'s
      `gridKeys`, and the card with its hover wash, `Add` button and tier badge. **[Q1]** the `Free only`
      row · **[Q2]** the header's mode control.
- [ ] `apps/web/components/editor/section-preview.tsx` -- new: one card's live preview. An
      `IntersectionObserver` creates an `inert` `/canvas` iframe only when the card nears the viewport
      (NFR-1), `renderSection` paints it, and it is sized to R-137's Desktop width and fitted to the card so
      the design's own media queries fire as they will on the site. The Kit's `Skeleton` holds the space
      until then, and a render that throws keeps the skeleton and leaves the card addable.
- [ ] `apps/web/lib/canvas-chrome.css` -- the insertion hairline as one rule keyed on `[data-inflozo-insert]`,
      with S4b's `addline` opacity breath, degrading through `globals.css`'s reduced-motion block -- painted
      chrome belongs inside the frame and takes no press.
- [ ] `apps/web/app/…/(editor)/editor.tsx` -- the `add` arm in `run()`; the picker's open state and its
      invoked position; the insert through `commit` so it is one edit and one undo step; the pressed
      **"+ Add section"** pill on the hovered gap, placed like `SectionPill` and added as one row to the
      chrome table; the Layers footer's `AddButton`; the empty canvas's one affordance; and the polite
      announcement through `#editor-said`, **naming the Site-wide group when that is where a section went**.
      **[Q3]** whether site-wide designs are offered here at all.
- [ ] `apps/web/app/…/(editor)/read.ts` -- read `projects.style_pack` and hand the editor the preset's name
      for the meta line -- the only new field `EditorData` gains.
- [ ] `apps/web/picker.test.ts` · `packages/library/src/placement.test.ts` · `apps/web/keymap.test.ts` --
      the I/O matrix's rows as unit tests: every filter arm, the numeric order, the three empty states, the
      refusal, the insert positions, and `⌘K` both ways across the caret.
- [ ] `tools/keyboard/journey.spec.mjs` -- `'ControlOrMeta+k'` leaves the deferred loop at `:401` and gets
      its own stop: open, arrow across the grid, `Enter` places, focus returns to the invoking control,
      `Esc` closes; plus one asserting `⌘K` with the caret in a field does **not** open it.
- [ ] `tools/probe/run-verify-editor.cjs` -- this story's steps after the last on file, inside step 5's one
      CSP session, and one more `axeRun()` with the picker open -- **asserting no second node exception is
      needed** (R-149), which is what the `inert` preview frames buy.

**Acceptance Criteria:**
- Given a canvas with sections, when I hover the gap between two of them, then a 2px coral hairline and the
  **"+ Add section"** pill appear on that boundary and breathe in opacity; **and both match `S4 Editor.dc.html:181`**.
- Given the picker open, when I look at it, then it **matches `S5 Section Picker.dc.html` S5a** — the 22px-inset
  panel, the 240px rail under `ALL CATEGORIES` with no number, the search field reading `Find a section…` with
  its `⌘K` chip, the category title and meta line, and the card grid with its hover wash and coral `Add` — and
  with the dark preview on it **matches S5c**, whose only changes are the preview interiors: the app chrome stays light.
- Given a Free plan, when a Pro design is shown, then it carries `✦ Pro`, it can be added, and **nothing asks
  for money** (UX-DR19).
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
between two canvas sections however it was invoked. It goes to the Site-wide group and the announcement says
so. Changing that would mean changing Story 5.4's stack rule, which is out of this story's scope — hence
Question 3, which asks the smaller question instead.

## Verification

**Commands:**
- `pnpm check` -- expected: green (lint, typecheck, every package test). It is browser-free by design.
- `pnpm keyboard` -- expected: green, with the picker's stop among the journey's; the run prints its own count.
- `node --test --experimental-strip-types apps/web/picker.test.ts apps/web/keymap.test.ts apps/web/editor.test.ts`
  -- expected: 0 fail, the matrix's rows asserted and `⌘K` proved both sides of the caret.
- `node --test --experimental-strip-types packages/library/src/placement.test.ts packages/library/src/validate.test.ts`
  -- expected: 0 fail, including a synthetic design whose contexts fit none of its targets being refused.
- `pnpm build` -- expected: exit 0, and the route table unchanged (this story adds no route).
- `python3 tools/doc-audit.py --check`, twice -- expected: green; any new file under `tools/` has a catalogue row.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, run as the control that this story touches no database.
- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) OUT_DIR=/tmp/p5
  node tools/probe/run-verify-editor.cjs` -- expected: 0 FAIL across every step on the **deployed** editor
  (R-82); step 5's CSP count still zero behind its `EvalError` control; **step 8's axe zero with the picker
  open and R-149's filter unchanged** — a second exception would be a failure of this story, not a finding.

**Real services (R-82).** The Review phase runs the walk above against production with real Supabase
sessions, on the **Pilot sections** project seeded at Story 5.1. Nothing here reads Ghost, Resend or Dodo;
`projects.style_pack` is read from the real database by the deployed editor. Keys by variable name only.

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
10. **Same screen.** Open the picker and add a **Header** (under Headers). **Expect:** it appears at the very
    top of the page rather than where you were, replacing the header that was there, and the editor says so —
    a header is shared by every template. *This whole step is Question 3 below; if it reads wrong, say so.*
11. **URL:** the same editor, then switch the template to **Post** using the switcher in the top bar. Press
    `⌘K`. **Expect:** a **different** list of categories — the ones that work on an article. The home-page-only
    ones are simply not there, with no greyed-out rows and no explanations.
12. **Same screen.** Use only the keyboard: `⌘K` to open, arrow keys to move between cards, `Enter` to place
    one. **Expect:** it works, and when the picker closes the outline is back on the button you started from.

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

**Ruled:** _(awaiting the owner)_

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

**Ruled:** _(awaiting the owner)_

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

**Ruled:** _(awaiting the owner)_
