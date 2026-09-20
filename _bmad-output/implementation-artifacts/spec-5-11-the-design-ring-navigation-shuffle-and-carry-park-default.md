---
title: 'Story 5.11 — The design ring: navigation, shuffle, and carry / park / default'
type: 'feature'
created: '2026-09-20'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story a placed section is no longer stuck with the look it arrived in: with it selected you
press `]` for the next design, `[` for the previous one, click the ◀ ▶ arrows that now appear on the
section itself, or pick a thumbnail from the new **Design** block at the top of the right-hand panel —
and the section changes in place, keeping every word you typed. A **Shuffle** button does the same thing
but chooses for you, and the panel always says where you are — *"Design 7 of 18"* — so browsing feels
like a ring rather than a corridor with no end.

The promise underneath it is that browsing is **safe**: a setting both designs have keeps your value, a
setting only the design you are leaving has is **put aside against that design** and comes back exactly
as it was if you return, and a setting only the new design has starts at its own sensible default. One
press of `⌘Z` undoes any of it.

**One thing to know before you test it:** the library holds exactly one design per category today (the
five pilots), so in your own editor the ring has nowhere to go yet — see Question 1.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A section can be placed (5.10), edited, hidden, moved and deleted — and cannot be *changed
into another design*, which is §1.2's central claim and the product's most-used control (FR-D19,
`B Missing Surfaces.dc.html:349`: *"the most-used control in the product, and the one that was never
drawn"*). Every seat is already reserved and empty: `keymap.ts:68-69` carries `[` and `]` as deferred
rows bound to nothing (R-145), `section-pill.tsx:13-14` says *"S4b also draws `◀ ▶` and the divider —
those arrive with Story 5.11"*, `editor.tsx:1891` says *"S4c's category word and '4 / 18' are the design
picker's (5.11)"*, and `doc-schema.ts`'s header names `parkedControls` as this story's field. Nothing in
the product can move a section from one design to another at all, so nothing can lose anything yet
either — and the loss is what the whole rule exists to prevent.

**Approach:** **One pure switch, four doors.** `switchControls` in `controls.ts` decides what carry /
park / default *means* over one instance's stored slice; `switchDesign` in `doc-edit.ts` is the one doc
operation that calls it; and the panel's arrows and thumbnails, the on-section ◀ ▶, `[` / `]` and
Shuffle all reach it through `editor.tsx`'s existing `apply` → `commit`, so a swap is one edit, one
journal entry and one `⌘Z` with no new machinery (AD-15, AD-16). Which designs are *in* the ring is one
pure library query beside `offeredOn` — same category, same `bindingContext`, same `compileTarget`, same
declared `surface` — so the partition rule and the placement rule can never drift apart.

## Boundaries & Constraints

**Always:**
- **Nothing is lost, and the three words are exact** (FR-D19, FR-D13). A control **both** designs declare
  **carries** its value; one only the **outgoing** design declares is **parked against that design id** and
  restored exactly on return — its dark override with it (AD-30: an override is a second value of the
  same control); one only the **incoming** design declares takes **its own default**. Content is never
  parked and never touched: `contentSchema` is the **category's union** (FR-G3), so every prop, item and
  `data` value stays in the instance verbatim and is invisible only because the new markup does not name it.
- **"Design" is the only word** (Appendix H, `EXPERIENCE.md:288`). Not layout, not variant, not variation.
  Only the *feature name* "Variant Shuffle" keeps the old word.
- **The ring is partitioned and a swap can never land on a design this template cannot render** (FR-D13,
  FR-G3): equal `bindingContext` **and** equal `compileTarget` — A29's tag vs author, A31's error vs
  private vs custom page — plus A30's explicitly declared `surface` (signup · signin · member home),
  which neither `[`/`]` nor Shuffle ever crosses.
- **One gesture is one edit** (AD-15, AD-16): a swap and a Shuffle each go through `apply` → `commit`
  once, so `⌘Z` is one press. A Shuffle is *not* several edits.
- **`[` and `]` are single-key bindings** and carry WCAG 2.1.4's condition: live only while the shell
  holds focus, inert while a field or a `contenteditable` holds the caret, refused while a dialog or a
  popover is open. They land in `KEYMAP` and the `?` card derives (R-145, R-141).
- **Absent, never greyed** (UX-DR3, R-118): where the ring holds one design there is nothing to move to,
  so the arrows and Shuffle are **not drawn** and the panel says why in one sentence (R-12's shape — a
  control at its floor stays honest rather than vanishing without explanation).
- **The export is the authority** (R-74): `B Missing Surfaces.dc.html` **B1a** is the panel block, **B1b**
  is the affordance on the section, `S4 Editor.dc.html` **S4b** and `S6 Variant Shuffle.dc.html` are the
  pill it is drawn in, and S6 is the shuffle surface and the mid-swap moment.
- **Announced politely** (UX-DR12): *"Design 8 of 18 — Image Backdrop"* through `#editor-said`, from the
  one place both the key and the button reach (the rule `onDuplicate` already follows).

**Ask First:**
- **Question 1** — what this story gives the owner to test, given a library of one design per category.
- **Question 2** — where Shuffle's control lives: the panel, the section pill, or both.
- Authoring a **second shipped design** in `packages/library/designs/` is Epic 9's work (AD-35) and is not
  taken here without his ruling.

**Never:**
- No migration and **no Schema phase** (R-99): `parkedControls` lives inside `project_templates.doc`,
  which is `jsonb` and carries no DDL for its shape.
- Not Site Remix (5.12), not the Pro exit sheet's swap (Epic 8's B13 — it *uses* this ring later), not the
  Section Picker (5.10), not the `⇧R` key.
- No new Ghost read, no new registry payload: `read.ts` already hands the editor **every placeable
  design** (DW-200), which is exactly what a ring needs.
- Never edit `packages/library/designs/` — the pilots are provisional and a defect goes to their owning
  category story (AD-35).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Next design | a section selected, ring of 3, at 2 | design 3 renders in place; **one** edit, one `⌘Z`; *"Design 3 of 3 — {name}"* announced | N/A |
| Past the last | at 3 of 3, `]` | wraps to 1 — a dead key at the end of a list reads as broken (UX-DR5, B1's note) | N/A |
| Ring of one | every category today | `[`/`]` do nothing and announce nothing; the arrows and Shuffle are **absent**; the block reads **"Design 1 of 1"** with one sentence saying more are coming | N/A |
| Key with a caret | the caret in a canvas text prop or a panel field | `[` types `[`; no swap (WCAG 2.1.4, `shortcutFor`'s single-key arm) | N/A |
| Carried control | `align` declared by both | keeps its value, in light **and** in dark | N/A |
| Parked control | `tint` (a `darkOverride` control) declared only by the outgoing design | removed from `controls`/`darkOverrides`, written to `parkedControls[outgoingId]`; the root loses the attribute (`stampControls`) | N/A |
| Defaulted control | a control only the incoming design declares | takes its declared default; nothing is stored for it | N/A |
| The round trip | shuffle away, shuffle back | every parked value restored **exactly**, dark override included, and the parked record for that design cleared | N/A |
| Surplus items | 3 authored items, the incoming design fits 2 | 2 render on **both** emitters; item 3 is untouched in the doc; the panel reads **"3 items · 2 shown in this design"** | N/A |
| Shuffle | ring ≥ 2 | lands on a **different** design of the same ring, carrying under the same rule, one edit, announced | ring of 1 → the control is absent |
| Outside the partition | a design of the same category with different `bindingContext`/`compileTarget`/`surface` | never in the strip, never reached by a key or a Shuffle | `switchDesign` answers a sentence and writes nothing |
| Site-wide section | the header selected | the same ring rules; the swap writes the **site** doc, and the section stays in the Site-wide group | N/A |
| Nothing selected | `[` or `]` with no selection | nothing happens, nothing announced — `⌘D`'s own rule | N/A |

</frozen-after-approval>

## Code Map

**The frames, read — and the one place they disagree**
- `B Missing Surfaces.dc.html:345` — **B1**, *"Design 7 of 18"*, and its note: three affordances, one model.
  - **B1a** `:355` · **the panel block, 320 actual width.** Card `:356` (`--color-paper`, 1px `--color-line`,
    `--radius` 12, `--shadow-sm`, 16px padding, 14px gaps). Head `:357-360`: the section name at 13.5/600 and
    a `⋯` (already the Layers row's control, R-126 — **not rebuilt here**). The block `:363-371`: the label
    **`Design`** (12/500 `--color-ink-soft`) with **◀ `7 of 18` ▶** to its right — 26px targets, `--radius`
    7, 1px `--color-line` on `--color-surface`; the counter **mono 11.5/500, `min-width:74px`, centred**, so
    the number does not shift width as it counts. The strip `:373-387`: a **4-column grid, 7px gaps, tiles
    44px tall**, the active one ringed `0 0 0 2px --color-coral`, a Pro tile marked with a **7px ✦** in its
    top-right corner, and — where the ring is longer than the strip — a final **`+6`** tile `:386` in mono 10.5 on
    `--color-paper-sunk`: *"twelve of the eighteen … because a scrollbar at 44px tall is a worse target than
    a tile"*. Under the strip `:388-390`: the active design's **name** (12/600) and its descriptor
    (*"· copy left, signup right"*, 11.5 `--color-ink-soft`). Footer `:393-397` (`:395`): a `--color-line` rule, the
    words **`Cycle designs`** and the two ink key chips **`[`** and **`]`**.
  - **B1b** `:425` · **on the section itself** — the claim is *"the same counter and arrows riding on the
    section, so a user never has to look right to change a design"*. It draws them in an **ink pill at the
    section's top-left**, with **Shuffle** and a `⋯` in the same pill.
  - **The disagreement, and how it is settled (R-74, the S5a/S5c precedent).** `S4 Editor.dc.html:181`
    (**S4b**) and `S6 Variant Shuffle.dc.html:67` both draw this as the **white quick-action pill at
    `top:10px;right:10px`** — and S6, the later editor frame, draws it complete: **◀ · ▶ · the mono
    `4 / 18` counter (10px `--color-ink-soft`, `padding:0 4px`) · the 1px divider · Duplicate · Delete ·
    grip**. That pill is built (`section-pill.tsx`, Story 5.4) and its corner is already ruled (R-125), and
    R-118 said in the owner's own terms that **◀ ▶ arrive with this story in S4b's pill**. So **S4b + S6
    govern the pill** and **B1b governs the affordance** — its counter and arrows, on the section. B1b's
    ink pill, its top-left position and its `⋯` are **not** built; its Shuffle is Question 2.
- `S6 Variant Shuffle.dc.html` — **the surface, and the mid-moment.** `:26` is a full 1440 editor with the
  hero mid-swap: the outgoing design at `translateX(-88%)` and `opacity:.4` behind the incoming one, which
  is annotated **"same feature photo"** — the frame's way of saying the content carried. The sidebar draws
  the category word and a **`4 / 18`** mono pill at the panel head, and the Design block's label tinted
  `--color-coral-tint` while the swap lands. `Try a design` (`:140`, renamed from "Try a variant" by A7 item
  21) is a **card showing the design you would go to** — its thumbnail, its name, the words **"Same words,
  new look"**, and its tier badge — drawn inside the Style group, which R-113 abolished, so its position is
  Question 2 and its contents are the frame's.
- `EXPERIENCE.md:146-152` (the three surfaces and their doors) · `:309` (the design picker's rule) · `:503`
  (**`← →` across the thumbnail strip, mirroring `[` and `]`**) · `:541` (the polite sentence) · `:878`
  (the walkthrough's climax beat: *"a 180ms slide-fade … she presses `[` three times and is back exactly
  where she started, because a control that only the design she left had was parked, not discarded"*).

**The normative text**
- `prd.md:239` **FR-D19** — the ring, the three doors, position, the one word, carry / park / default, and
  *"it writes no `data-*` attribute — it swaps which design renders"*.
- `prd.md:230` **FR-D13** — Shuffle, the partition rule (A29/A31 mechanical, **A30 declares `surface`**),
  props preserved invisibly, and the list rule: *"a design renders only as many list items as its structure
  fits (8 items shuffled into a 3-card layout shows 3) … the sidebar shows the count"*.
- `prd.md:219` **FR-D2** (◀ ▶ among the hover quick actions) · `:228` **FR-D11** (`[` `]`) · `:654` (the doc
  column, which names **`parkedControls`** — *"values retained against the design they came from"*) ·
  `:360` **FR-Q3** (*"shuffling away is not deleting"* — a promoted control's binding parks with its value;
  **Epic 7's**, and this story's parking is what it will read) · `:810` (E5's exit gate, Story 5.23's).
- `epics.md:1896-1929` — this story's criteria, including R-145's *"`[` and `]` are bound HERE"*.

**What exists and is extended, never rebuilt**
- `packages/library/src/placement.ts` — `categoryOf` `:31`, `isPlaceable` `:35`, `CONTEXTS_BY_TARGET` `:88`,
  **`offeredOn` `:98`** and `byCategory` `:109`. The ring is the same family of question ("what fits where")
  and belongs in this file beside them, with the header's story line extended.
- `packages/library/src/registry.ts:159` — `SectionRegistryEntry` (`bindingContext`, `compileTarget`,
  `categoryTitle`, `tier`, `descriptor`, `previewSeed`); `DesignJson` `:127`; `assembleEntry` is the one
  door an entry is built through. **There is no `surface` field today** — A30 is Epic 10's and the library
  holds no `a30` design, so this story adds the optional field the partition rule names and nothing declares.
- `packages/library/src/vocabulary.ts:548` — **`DIRECTIVES`, the one table** the validator and both emitters
  read. `data-items` `:606`, `data-repeat-limit` `:596` (grammar `1–100`) are the shapes to copy.
- `packages/section-runtime/src/core.ts:1249` — **`expandItems`**, ONE function for both emitters (*"the
  theme bakes N static copies … so the two trees are identical"*), which is why a per-design item cap
  applied here is `agreement.test.ts`-safe by construction. `core.ts:309-318` is the stripped-directive
  list; `:513` is the guard that refuses a `data-repeat-limit` with no `data-repeat`.
- `packages/section-runtime/src/controls.ts` — `ControlState` `:32` (the instance's stored slice, which
  grows here), `declared` `:64`, `resolveAll` `:82`, `resolveControls` `:115`, **`storedFor` `:149`** (what
  a mode means, and the reason a parked dark override is not a special case), `darkOverridesInForce` `:232`,
  `PropRow.list` `:193` (`{ item, min, max, count, atMax, props }` — where the "shown" count belongs),
  `sidebar` `:351`, `defaultContent` `:486`.
- `packages/section-runtime/src/doc-schema.ts:24` — `instanceSchema`, strict at both levels, and its header:
  *"`parkedControls` (5.11) … still to come"*, **always `.default(…)`**, never required, or every stored doc
  stops parsing (`hidden`'s own comment `:33-38` is the rule in full).
- `packages/section-runtime/src/doc-edit.ts` — `withOne` `:31`, `duplicateSection` `:54`, **`insertSection` `:74`** (5.10's, the shape to copy: pure, next doc or a sentence), `removeSection` `:85`.
- `apps/web/app/…/(editor)/editor.tsx` — `apply` `:1391` (the one doc-write door, which paints and clears a
  dead selection), `edit`/`refuse` `:1414-1424`, `layerNameOf` `:1427`, `onDuplicate` `:1433` (**the
  announcement pattern**: one handler both the key and the button call), `onPlace` `:1499`, `run(gesture)`
  `:937`, `onShortcut` `:965` (the dialog/popover and `SELECT` guards), `paint` `:698` (**a design change is
  simply a re-render from the stack** — no new painting path), `mark` `:623`, the panel head `:1891`
  and the `<Sidebar>` mount `:1899`.
- `apps/web/components/controls/section-pill.tsx` — S4b's pill, its one `requestAnimationFrame` placement
  loop, `INSET`/`GAP` and R-125's badge clamp. `:13-14` names this story's two additions by name.
- `apps/web/components/editor/section-preview.tsx` — **one card's live preview**: an `IntersectionObserver`,
  an `inert` `/canvas` frame at `DESKTOP` width fitted by transform, `previewSrc` (R-155's one-stylesheet
  address), a skeleton until drawn, a zero-width measurement ignored. **The strip's tiles are this component
  at 64×44** — never a second thumbnail mechanism, and never hand-drawn mini-diagrams.
- `apps/web/lib/picker.ts` — the model to follow for `lib/ring.ts`: pure, importing only the library,
  unit-tested by `picker.test.ts`, every count derived.
- `apps/web/lib/keymap.ts:68-69` — `{ action: 'Previous design', chips: ['['], story: '5.11' }` and its
  twin. Landing them is those two rows plus two `Gesture` members plus two `run()` arms; `sheetRows()` `:105`
  and `SINGLE_KEY` `:110` both derive, so the `?` card grows on its own.
- `apps/web/components/kit/icons.tsx` — `ChevronLeft` `:81`, `ChevronRight` `:86`, **`Refresh` `:219`**
  (B1b's shuffle glyph), `ProBadge`/`FreeBadge` in `kit/badge.tsx:12,20`, `Skeleton` in `kit/loading.tsx:4`,
  `ring`/`slimScrollbar` in `kit/greyed.ts:60,67`, the shortcut chips in `kit/dialog.ts`.
- `apps/web/lib/canvas-chrome.css` — painted chrome inside the frame, **every selector keyed on
  `[data-inflozo-`** (`pilots.test.ts:40`); `editor.tsx`'s `mark()` re-applies chrome attributes after every
  stamp, because `stampControls` strips every root `data-*` it does not own.
- **The ring fixture's home.** `packages/library/fixtures/controls/` is a fixture **category** with a
  `content.json` (an `array` prop `features`, min 2 max 6, three default items) and one design `1/`
  declaring `columns` · `card` · `align` · `icons` · `rule` · `image` · **`tint` (`darkOverride: true`)`.
  `assembleEntry` and `validateDesign` already run over it (`apps/web/lib/controls-review.ts:29` `sample()`),
  `controls.test.ts:18` already imports it, and `next.config.ts:17` already traces it for the deployed
  function. It is **not** the shipped library, so a second design here breaks no AD-35 rule.
- `apps/web/app/(app)/app/(authed)/controls/page.tsx` + `review.tsx` — the deployed internal review surface
  for the panel, with in-memory state and nothing saved; `tools/probe/run-verify-controls.cjs` already walks
  it on production.
- `apps/web/app/(app)/app/harness/editor/page.tsx` — the test-only mount of the **real** `Editor` (R-146),
  typed against `EditorData`; its fixture is derived from the library on purpose.

**The gates that will run it**
- `apps/web/tokens.test.ts:126` no colour literal under `apps/web`; `:31` every `--color-*` occurs verbatim
  in a `.dc.html`. `apps/web/busy.test.ts` — R-98's two halves. `apps/web/pilots.test.ts:40` — the chrome
  selector key. `apps/web/editor.test.ts:103` — the derived stack order.
- `packages/section-runtime/src/agreement.test.ts` and `ad36.test.ts` — §7.3's two-emitter proof, which the
  item cap must leave green (it is one shared function).
- `tools/keyboard/journey.spec.mjs:401` — the deferred-key loop `[` and `]` come out of; `:128` refuses a
  mouse or tap API anywhere in the spec file.
- `tools/probe/run-verify-editor.cjs` — step 5's one CSP session is the spine; step 8 is axe with R-149's
  single node exception; the last numbered steps on file are 80 and 85.

**The ledger**
- **DW-209** (medium) — *owner: **Story 5.11's Dev**, before its own deployed walk.* The live walk's sticky
  scroll check fails most runs; the hypothesis is that the wheel is sent at x=700, where 5.10's "+ Add
  section" pill sits, and a wheel over a pill in the parent page does not scroll the canvas inside the frame.
  **Execute the hypothesis before fixing it** (standing rule 1), and if it holds the fix is the pill
  forwarding its wheel — a customer would feel the identical stall.
- **DW-200** (medium) — every placeable design is handed to the editor eagerly. The strip is its third
  predicted caller and adds nothing to it.
- **DW-205** (low, 5.23's) — an identical announcement twice running is silent. A ring of two alternates
  names, so this story does not make it worse; do not fix it here.
- **DW-207** (low, 5.23's) — three Section Picker leftovers. Untouched.

## Tasks & Acceptance

**Execution.** No migration, no DDL, **no Schema phase** (R-99). Tasks marked **[Q1]** and **[Q2]** depend on
a ruling and are written for the recommended option.

- [ ] `packages/library/fixtures/controls/2/` (`design.json`, `index.html`, `style.css`) -- **the ring
      fixture, and the only two-design ring in the repo**: same `bindingContext`/`compileTarget` as design 1
      so it is in the same partition; **carries** `columns` and `align`; **drops** `tint` (the
      `darkOverride: true` control) and `rule`; **adds** one control of its own; and its features list
      carries `data-items-limit="2"` against the fixture's three default items. Every arm of carry / park /
      default and the surplus-item rule is then a real render, not a mock.
- [ ] `packages/library/src/vocabulary.ts` -- `data-items-limit` joins `DIRECTIVES` beside
      `data-repeat-limit`, with its own grammar and summary -- one table the validator, the canvas emitter
      and the theme emitter all read, so a new attribute cannot be honoured in one place and ignored in another.
- [ ] `packages/library/src/validate.ts` -- refuse `data-items-limit` on an element with no `data-items`
      (`core.ts:513`'s rule, which already exists for `data-repeat-limit`) -- a modifier with nothing to
      modify would ship verbatim.
- [ ] `packages/library/src/registry.ts` -- `DesignJson` and `SectionRegistryEntry` gain optional
      **`surface`**, carried by `assembleEntry` -- FR-D13's A30 partition needs a declaration to partition
      on, and one optional field is inert until A30 lands in Epic 10.
- [ ] `packages/library/src/placement.ts` -- **`ringFor(entries, entry)`**: the designs of the same category
      that are `isPlaceable` and share the entry's `bindingContext` set, `compileTarget` set and `surface`,
      in id order; plus `samePartition(a, b)` as its one comparison -- the ring and the picker then answer
      from one file and can never drift.
- [ ] `packages/section-runtime/src/core.ts` -- `expandItems` renders at most `data-items-limit` copies and
      **`itemsShown(html, path)`** reports the cap -- one shared function, so both emitters agree by
      construction and `agreement.test.ts` needs no new case to stay honest.
- [ ] `packages/section-runtime/src/doc-schema.ts` -- `parkedControls` on `instanceSchema`, keyed by design
      id, each value `{ controls, darkOverrides }`, **`.default({})`** -- required would stop every stored
      doc parsing, the seeded project included.
- [ ] `packages/section-runtime/src/controls.ts` -- `ControlState` gains `parkedControls`, and
      **`switchControls(from, to, state)`** returns the next `controls`, `darkOverrides` and
      `parkedControls`: a name both declare carries, a name only `from` declares is moved into
      `parkedControls[fromId]` (its dark override with it), a name only `to` declares is left unstored so
      `resolveControls` gives its default, and a parked record for `to` is restored and then cleared. Also
      `PropRow.list.shown` -- the panel prints "N items · M shown in this design" from the engine's own count.
- [ ] `packages/section-runtime/src/doc-edit.ts` -- **`switchDesign(doc, instanceId, to, ring)`**: pure, the
      next doc or a sentence, shaped exactly as `insertSection` is; refuses a design outside the instance's
      ring and writes nothing -- the one place a design change happens, so 5.12's Remix and Epic 8's swap
      call it rather than reimplementing the rule.
- [ ] `apps/web/lib/ring.ts` -- new, pure and importless but for the library (`node --test` cannot load a
      `.tsx`): the position words (`Design 7 of 18`, and the pill's `7 / 18`), the announcement sentence, the
      strip model (the first N tiles and a `+N` tile, N derived from the strip's own shape), `step(at, len,
      by)` with UX-DR5's wrap, `shuffleTo(ring, at, random)` (a caller-supplied random — AD-1 keeps the core
      free of randomness), and the one-design sentence.
- [ ] `apps/web/components/editor/design-picker.tsx` -- new: **B1a's block**, drawn above the settings
      groups (FR-F3: the design picker is not a setting and sits outside every group). The label, ◀ ▶ and
      the mono counter; the 4-column strip whose tiles are `SectionPreview` at the tile's size with the
      active one coral-ringed and a Pro tile ✦-marked; the active design's name and descriptor; and the
      `Cycle designs` footer with the `[` `]` chips. `← →` cross the strip (`EXPERIENCE.md:503`), reusing
      `icon-picker.tsx`'s `gridKeys` -- never a second arrow implementation. With one design: the counter,
      no arrows, and one sentence.
- [ ] `apps/web/components/editor/design-picker.tsx` **[Q2]** -- S6's **`Try a design`** card at the block's
      foot: the destination design's preview, its name, the words *"Same words, new look"* and its tier
      badge, pressing it being the Shuffle. Absent where the ring holds one.
- [ ] `apps/web/components/controls/section-pill.tsx` -- S4b's **◀ ▶** at the head of the pill with S6's
      mono counter between them and S4b's divider after, each with its title and accessible name
      (*"Previous design — ["*, as the frame writes it). Absent where the ring holds one, exactly as
      Duplicate is absent on a site-wide row.
- [ ] `apps/web/lib/keymap.ts` -- land `[` and `]` (`gesture: 'prev' | 'next'`, `shift: false`, no `meta`),
      dropping their `story` key -- they become `SINGLE_KEY` members and the `?` card lists them with no
      second list touched.
- [ ] `apps/web/app/…/(editor)/editor.tsx` -- the `prev`/`next`/`shuffle` arms of `run()`; one `onDesign`
      handler the panel, the pill and the keys all call; the swap through `apply` → `commit` so it is one
      edit and one `⌘Z`; the polite announcement from that one place; and the panel head gaining the
      category word beside the layer name (`:1893`'s own note).
- [ ] `apps/web/lib/canvas-chrome.css` -- the swap's settle: a 180ms fade on the incoming root keyed on
      `[data-inflozo-swapped]`, removed on the next frame, inert under `prefers-reduced-motion`
      (`EXPERIENCE.md:878`'s beat, and every transition instant under reduced motion). `mark()` re-applies
      it after the stamp, because `stampControls` strips what it does not own.
- [ ] `apps/web/components/controls/item-list.tsx` -- the header prints `{count} items · {shown} shown in
      this design` when the design shows fewer than the instance holds -- FR-D13's exact sentence, from
      `PropRow.list`.
- [ ] `apps/web/lib/controls-review.ts` · `app/(app)/app/(authed)/controls/page.tsx` · `review.tsx` **[Q1]**
      -- `samples()` returns both fixture designs and the review page mounts the design picker over them,
      holding `parkedControls` in its own state through the same pure `switchControls` -- the only surface on
      the deployed site where the rule itself can be exercised before Epic 9, for the owner's test and for
      R-82's.
- [ ] `apps/web/app/(app)/app/harness/editor/page.tsx` -- the two fixture designs join the harness's
      `entries` and one section of the fixture category joins its Home doc, with a comment saying why (the
      library holds no ring yet) -- so the keyboard journey walks a **real** `[`/`]` on every commit. Check
      the picker stops that count rail rows or cards still pass.
- [ ] `packages/library/src/placement.test.ts` · `packages/section-runtime/src/{controls,doc-edit,doc-schema,
      index}.test.ts` · `apps/web/{ring,keymap,pilots}.test.ts` -- the I/O matrix's rows as unit tests: every
      partition arm, the wrap, carry/park/default and the exact round trip (dark override included), the
      item cap on both emitters, `parkedControls` defaulting for a doc written before it, and `[`/`]` both
      sides of the caret.
- [ ] `tools/keyboard/journey.spec.mjs` -- `[` and `]` leave the deferred loop at `:401` and get a stop of
      their own over the fixture ring: `]` changes the design and announces its position, `[` comes back,
      the parked value returns, `← →` cross the strip, and both keys are inert with a caret in a field.
- [ ] `tools/probe/run-verify-editor.cjs` -- **first, DW-209**: execute the wheel hypothesis and fix what it
      shows. Then this story's steps after the last on file, inside step 5's one CSP session, with one
      `axeRun()` over the panel block and the pill — **no second node exception** (R-149).
- [ ] `tools/probe/run-verify-controls.cjs` **[Q1]** -- the deployed ring walk on `/controls`: the arrows
      change the design, a carried value survives, a parked one returns exactly, and the item count sentence
      reads as the engine counts it.
- [ ] `docs/section-authoring.md` -- `data-items-limit` documented in the directive table and in the list
      rule beside `data-repeat-limit` -- the authoring vocabulary is a documented deliverable (FR-G3), and a
      cap no author can find is a cap no design will use.

**Acceptance Criteria:**
- Given a selected section whose ring holds more than one design, when I press `]`, use the on-section ▶ or
  click a thumbnail, then the section renders as that design in place, keeping every word, picture, item and
  shared setting; **one** journal entry is written and one `⌘Z` restores exactly what was there.
- Given the panel, when a section is selected, then its Design block **matches `B Missing Surfaces.dc.html`
  B1a** — the `Design` label, ◀ ▶ around a mono counter reading *"{n} of {m}"*, the 4-column strip of 44px
  tiles with the active one coral-ringed and a Pro tile ✦-marked, the active design's name and descriptor
  beneath, and the `Cycle designs` footer carrying the `[` and `]` chips.
- Given a hovered or selected section, when its quick-action pill is drawn, then it **matches
  `S6 Variant Shuffle.dc.html`'s pill** — ◀ ▶ then the mono `{n} / {m}` counter then S4b's divider and the
  three controls already built — and B1b's claim holds: the counter and arrows ride on the section itself.
- Given Shuffle, when I use it, then the section lands on a **different** design of the same ring under the
  identical carry / park / default rule, in one edit, and the surface **matches
  `S6 Variant Shuffle.dc.html`**'s card wording (*"Same words, new look"*).
- Given a control only the outgoing design declares, when I move away and back, then its value — and its
  dark override — are restored exactly, and at no point is it written to the section root.
- Given a category whose designs differ on `bindingContext`, `compileTarget` or `surface`, when I cycle or
  shuffle, then only designs in the instance's own partition are ever reachable, by any of the four doors.
- Given a ring of one design, when a section is selected, then the arrows and Shuffle are **absent** — not
  greyed, not captioned as errors — the counter reads *"Design 1 of 1"*, and one plain sentence says the
  category has one design so far.
- Given the keyboard alone, when I press `[` and `]` with the shell focused, then the design changes and the
  position is announced; with the caret in any field the same keys type their characters and change nothing;
  and `pnpm keyboard` proves both on every commit.
- Given the deployed editor, when the walk runs, then step 5's CSP count is still zero and step 8's axe is
  zero over the new block and pill, with no exception beyond R-149's one.

## Design Notes

**Content needs no parking, and that is what keeps this story small.** `contentSchema` is the **category's**
union (FR-G3) and a ring never leaves its category, so every prop, every list item and every `data` value
stays in the instance byte for byte across a swap — invisible only because the incoming markup does not name
it. What genuinely differs design to design is `controlSchema`, which is **per design** (FR-F7), so the
park-and-restore domain is exactly the category's control union and nothing else. The one content-shaped
consequence is the list cap, which is a *render* rule rather than a storage one: the items are all still there.

**The item cap needs a declaration, because nothing can derive it.** "As many as its structure fits" is
decided by a design's CSS — a three-card grid is three cards because of `grid-template-columns`, which no
parser can read back. `PropDef.max` is the **category union's** ceiling and cannot narrow per design. So the
design declares it where it declares everything else about its list: on the `data-items` element, as
`data-items-limit`, exactly mirroring `data-repeat-limit`'s existing grammar and guard. It is applied inside
`expandItems`, the single function both emitters share, so the canvas and the shipped theme cannot disagree
about how many items a design shows.

**Parked values are keyed by design id, and both maps park together.** A dark override is a second value of
the *same* control (AD-30, `storedFor`), so parking `tint` while leaving `darkOverrides.tint` behind would
restore the light value and lose the dark one — "restored exactly" means both. Hence
`parkedControls[designId] = { controls, darkOverrides }`. A restore **clears** that design's record, so a
doc cannot accumulate a second stale copy of a value the customer has since changed.

**The strip's tiles are the picker's previews, not a new thumbnail system.** B1a draws mini-diagrams, which
are stress-fill fiction for eighteen designs nobody had authored; the real answer is already built and
already lazy — `SectionPreview` renders the design itself into an `inert` `/canvas` frame carrying only that
design's stylesheet (R-155), created on intersection. A 64×44 tile shows shape and ground, which is what the
frame's note asks of it (*"recognising design 14 when you are on 7"*). Its cost is DW-200's, not this story's.

**The ring's membership is a library question, not an editor one.** `ringFor` sits beside `offeredOn` because
they answer the same question from two directions — what may be placed **here**, and what this instance may
become — and both are `bindingContext` ∧ `compileTarget` (∧ `surface`). Two implementations of that rule is
precisely the drift standing rule 3 forbids, and 5.12's Remix and Epic 8's "swap to a Free design" are the
two callers already waiting for it.

**Why a fixture design and not a library one.** The whole story is about what happens **between** two
designs, and `packages/library/designs/` holds exactly one per category — so without a second design
somewhere, every assertion in this spec would be vacuous and a green test suite would prove nothing.
`packages/library/fixtures/controls/` already exists as a real, validated, assembled category with an
authored array and a dark-override control, already read by unit tests and by one deployed page, and is not
the shipped library — so a second design there is the honest fixture the rule can be proved against without
touching a pilot (AD-35) or pretending Epic 9 has happened.

**What this story deliberately does not do.** It does not animate a true crossfade of two renders: the frame
draws a mid-moment and `EXPERIENCE.md:878` says 180ms, and the smallest honest reading is a fade on the
incoming root — a real crossfade would need both trees mounted at once inside the canvas document, which is
a second paint path for a visual flourish. It does not build S4c's pinned card (R-113), B1b's ink pill or its
`⋯` (R-126: the `⋯` is the Layers row's one control), and it binds no key for Shuffle — FR-D11's map has
thirteen actions and a fourteenth key, and R-145 forbids inventing a fifteenth.

## Verification

**Commands:**
- `pnpm check` -- expected: lint, typecheck and every package test green, including the new partition,
  carry / park / default, round-trip, item-cap and `parkedControls`-default cases, with `agreement.test.ts`
  and `ad36.test.ts` **untouched and green** (the control: no mode and no ring reaches the theme emitter).
- `pnpm keyboard` -- expected: the journey's new stop passes — `]` changes the design over the fixture ring
  and announces its position, `[` restores it with its parked value, `← →` cross the strip, both keys are
  inert with a caret — and the deferred-key stop now carries four owed keys, not six.
- `python3 tools/doc-audit.py --check` -- expected: exit 0 (run twice; the sub-tools regenerate on the first
  failure).
- `bash supabase/tests/run-rls-gate.sh` -- expected: the gate passes. No migration is in this story; this is
  the control that none crept in.
- `node tools/probe/run-verify-editor.cjs` (real production, R-82) -- expected: every step passes on
  `app.inflozo.com`, step 5's CSP violation count is zero, step 8's axe is zero with R-149's single node
  exception, **and step 15's sticky scroll check passes** (DW-209 executed and fixed, not merely retried).
- `node tools/probe/run-verify-controls.cjs` (real production, R-82) -- expected: the deployed ring walk
  passes — the arrows change the design, a carried value survives, a parked one returns exactly.

**Manual checks:**
- Open `/projects/<id>` on production beside `B Missing Surfaces.dc.html` B1a and `S6 Variant Shuffle.dc.html`
  and compare the panel block and the pill part for part (R-74).
- Confirm on the deployed editor that a section whose category holds one design draws **no** arrows and no
  Shuffle anywhere — the pill, the panel and the strip agree, and nothing is greyed (UX-DR3).

## Owner's manual test

Do this on the real site after Deploy confirms the URLs. Use the **Pilot sections** project — the one seeded
to your account at Story 5.1.

1. **URL:** `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` · **Screen:** the editor,
   on Home. Click any section on the canvas. **Expect:** at the top of the right-hand panel, above the
   settings groups, a new **Design** block: a counter reading **"Design 1 of 1"**, one small picture of the
   section beneath it, its name, and a line along the bottom reading **Cycle designs** with two key chips
   `[` and `]`.
2. **Same screen.** Look for arrows beside that counter. **Expect:** there are **none**, and one plain
   sentence says this category has one design so far. This is the rule you set at R-118 — a control that
   could do nothing is not there at all, rather than there and dead.
3. **Same screen.** Hover any section on the canvas and look at the small white pill in its top-right
   corner. **Expect:** the same answer — Duplicate, Delete and the drag handle, and **no** ◀ ▶, because
   there is nowhere to go. (When Epic 9 fills a category, the arrows and a counter appear here on their own.)
4. **Same screen.** With a section selected, press `]`, then `[`. **Expect:** nothing happens and nothing is
   announced — no flicker, no error.
5. **Same screen.** Press `?` to open the keyboard card. **Expect:** it now lists **Previous design `[`** and
   **Next design `]`** among the shortcuts. They were deliberately missing until today.
6. **URL:** `https://app.inflozo.com/controls` · **Screen:** the **Controls review** page — an internal
   page we use to check the panel, not a customer screen. **Expect:** a sample section on the left and its
   panel on the right, and the panel now has the same **Design** block at the top — this time reading
   **"Design 1 of 2"**, with two thumbnails and working ◀ ▶ arrows.
7. **Same screen.** In the panel, change a couple of settings — **Dummy data:** set **Alignment** to
   *Centre* and **Card tint** to *Strong* — and type something into the heading so you can recognise it.
8. **Same screen.** Press **▶**. **Expect:** the sample section **changes shape in place**, your heading text
   is still there word for word, **Alignment is still Centre** (both designs have it), and **Card tint has
   disappeared from the panel** — the new design does not have that setting.
9. **Same screen.** Press **◀** to come back. **Expect:** the first design returns **and Card tint is set to
   Strong again**, exactly as you left it. This is the whole promise of the story: browsing costs you nothing.
10. **Same screen.** Look at the **Features** list in the panel while the second design is showing.
    **Expect:** it reads **"3 items · 2 shown in this design"**, and the section on the left draws two — the
    third is not gone, it is waiting.
11. **Same screen.** Press the **Try a design** card at the foot of the Design block (Shuffle). **Expect:**
    it moves you to the other design in one go, carrying your words the same way, and the card names the
    design it would take you to next.
12. **Same screen.** Use the keyboard only: click the section once, then press `]` and `[`. **Expect:** the
    same changes as the arrows. Now click into the heading field in the panel and type `[`. **Expect:** the
    character `[` appears in your text and **the design does not change** — this is the most important step
    on this list.

## Questions for the owner

### Question 1 — you cannot see a design change in your own editor yet. What should this story give you to test?

The library holds **one design per category** today — the five pilot sections. This story builds everything
that happens when a section moves from one design to another, but in your own editor there is nowhere to
move to until Epic 9 authors the rest of each category.

**An example.** On Home your Hero category holds exactly one design ("Latest Post"). Pressing `]` on it can
only ever give you the same design back, so your test of it would be a test of *absence* — "the arrows are
correctly not there" — rather than a test of the thing itself.

There is one real two-design sample in the repository already: the sample section on our internal **Controls
review** page (`app.inflozo.com/controls`), which is where we check the settings panel. Giving it a second
design costs about a day's work either way, because the automated tests need it too.

1. **(RECOMMENDED) Build it, and make the Controls review page a real ring.** Your editor gets the Design
   block, the counter and the honest "one design so far" answer; the Controls review page gets two designs,
   working arrows and a Shuffle, so you can press ▶, watch a section change shape, watch your typed words
   carry, press ◀ and watch a setting you changed come back exactly. The automated walk proves the same rule
   on the live site. When Epic 9 fills a category, the editor's own arrows appear with no further work.
2. **Build it and test only the editor.** Steps 1–5 of the test above and nothing else; the carry / park /
   default rule is proven by automated tests only, and the first time you see a design actually change is
   when Epic 9 lands a second Hero.
3. **Pause Story 5.11 and author a second Hero design first.** Authoring a library design is a category
   story's work (Epic 9), roughly a story of its own, and Site Remix (5.12) and the play-loop gate (5.23)
   both sit on this mechanism and would wait for it. Not recommended, but it is the only way the *editor*
   itself becomes real today.

**Ruled:** _(awaiting the owner)_

### Question 2 — where should the Shuffle button live?

Shuffle is the same ring as the arrows, chosen for you instead of by you. Two drawings put it in two
different places and one of them is in a card we no longer build (your ruling R-113 removed the pinned
"Quick Controls" card from the panel).

**An example.** You are looking at a hero you like the words of but not the look of. Either you reach for
the small pill on the section itself, where the arrows already are — or you look at the panel on the right,
where a card shows you the design you would land on next, with its name and its Free or ✦ Pro tag, and you
press it.

1. **(RECOMMENDED) In the panel only**, as the **Try a design** card at the foot of the Design block — the
   design's picture, its name, the words "Same words, new look" and its tier tag, exactly as
   `S6 Variant Shuffle.dc.html` draws them. It shows you where you are going before you press, which a
   button on the section cannot, and it keeps the section's own pill small.
2. **In both places** — the panel card, plus a Shuffle button in the pill on the section, as
   `B Missing Surfaces.dc.html` B1b draws it. Closest to both drawings; the cost is that the pill on a
   hovered section grows to eight controls and covers more of what you are looking at.
3. **On the section only**, in the pill beside the arrows. Fewest places to look, but you cannot see what
   you are shuffling into until it has happened.

**Ruled:** _(awaiting the owner)_
