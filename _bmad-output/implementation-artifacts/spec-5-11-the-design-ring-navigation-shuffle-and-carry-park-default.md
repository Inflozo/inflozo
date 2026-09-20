---
title: 'Story 5.11 — The design ring: navigation, shuffle, and carry / park / default'
type: 'feature'
created: '2026-09-20'
status: 'in-review'
owner_test: issues
review_loop_iteration: 1
baseline_commit: 'e74f84cc690eafbc994a8aeecc8b85e2ecea4122'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story a placed section is no longer stuck with the look it arrived in: with it selected you
press `]` for the next design, `[` for the previous one, click the ◀ ▶ arrows that now appear on the
section itself, or pick a thumbnail from the new **Design** block at the top of the right-hand panel —
and the section changes in place, keeping every word you typed. A **Shuffle** button on the section itself does the
same thing but chooses for you, and the panel always says where you are — **Design** · *"7 of 18"* — so
browsing feels like a ring rather than a corridor with no end.

The promise underneath it is that browsing is **safe**: a setting both designs have keeps your value, a
setting only the design you are leaving has is **put aside against that design** and comes back exactly
as it was if you return, and a setting only the new design has starts at its own sensible default. One
press of `⌘Z` undoes any of it.

**One thing to know before you test it:** the library holds exactly one design per category today (the
five pilots), so in your own editor the ring has nowhere to go yet — the arrows are simply not there, and
the counter says "1 of 1". You try the real thing on the internal **Controls review** page, which
gets three sample designs and working arrows (your ruling R-158, 2026-09-20) — and where `[` and `]` work too,
after your test of it.

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
  is the affordance on the section, `S4 Editor.dc.html` **S4b** and `S6 Variant Shuffle.dc.html:67` are the
  pill it is drawn in, and S6 is the shuffle surface and the mid-swap moment. **R-159 settles the one place
  they disagree**: S4b + S6 govern the pill, B1b governs the affordance, and Shuffle is built in both the
  panel and the pill. — **AMENDED by the owner's test of the deployed page, 2026-09-20 (finding 3):** Shuffle
  is built in the **pill only**; S6`:140`'s `Try a design` card and B1a`:395`'s `Cycle designs` footer are not
  drawn at all (finding 4), and the counter prints `7 of 18` rather than `Design 7 of 18` (finding 2), because
  the label beside it already says the word. The rest of this bullet stands.
- **Announced politely** (UX-DR12): *"Design 8 of 18 — Image Backdrop"* through `#editor-said`, from the
  one place both the key and the button reach (the rule `onDuplicate` already follows).

**Ask First:**
- **Both questions are ruled** — **R-158** (option 1) and **R-159** (option 2), owner, 2026-09-20. Nothing
  below waits on him. — **AMENDED:** his test of the deployed page amended R-159 the same day (finding 3), and
  a **Question 3** is now open — which value wins where carry and restore disagree. Nothing waits on that one
  either: what is built is documented and tested, and the other reading is one line.
- Authoring **any design under `packages/library/designs/`** is Epic 9's and Epic 10's work (AD-35, R-158 in
  his own words) — HALT rather than adding one, however convenient a second pilot would be.
- A **third** place for Shuffle, or a key for it: FR-D11's map is thirteen actions and a fourteenth key, and
  R-145 forbids a fifteenth. HALT rather than inventing one.

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
| Ring of one | every category today | `[`/`]` do nothing and announce nothing; the arrows and Shuffle are **absent**; the block reads **"1 of 1"** beside its `Design` label (amended by the owner's test, 2026-09-20, finding 2 — it read "Design 1 of 1") with one sentence saying more are coming | N/A |
| Key with a caret | the caret in a canvas text prop or a panel field | `[` types `[`; no swap (WCAG 2.1.4, `shortcutFor`'s single-key arm) | N/A |
| Carried control | `align` declared by both | keeps its value, in light **and** in dark | N/A |
| Parked control | `tint` (a `darkOverride` control) declared only by the outgoing design | removed from `controls`/`darkOverrides`, written to `parkedControls[outgoingId]`; the root loses the attribute (`stampControls`) | N/A |
| Defaulted control | a control only the incoming design declares | takes its declared default; nothing is stored for it | N/A |
| The round trip | shuffle away, shuffle back | every parked value restored **exactly**, dark override included, and the parked record for that design cleared | N/A |
| Surplus items | 3 authored items, the incoming design fits 2 | 2 render on **both** emitters; item 3 is untouched in the doc; the panel reads **"3 items · 2 shown in this design"** | N/A |
| Shuffle | ring ≥ 2, from the **section pill** — its one seat since the owner's finding 3, 2026-09-20; it read "from the panel card **or** the pill (R-159)" | lands on a **different** design of the same ring, carrying under the same rule, one edit, announced | ring of 1 → the control is absent |
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

**Execution.** No migration, no DDL, **no Schema phase** (R-99). **Both questions are ruled — R-158 (option 1)
and R-159 (option 2), owner, 2026-09-20** — so the list below is the whole of it: two more fixture designs and
a real ring on `/controls`, no shipped design authored, and Shuffle in both the panel and the section's pill — **the last
of which his test of the deployed page amended the same day: Shuffle's one seat is the pill's** (findings 2–4 below).

- [x] `packages/library/fixtures/controls/2/` and `…/3/` (`design.json`, `index.html`, `style.css` each) --
      **the ring fixture (R-158), and the only ring in the repo**: same `bindingContext`/`compileTarget` as
      design 1 so all three share one partition; each **carries** `columns` and `align`; design 2 **drops**
      `tint` (the `darkOverride: true` control) and `rule` and **adds** one control of its own; design 3
      drops and adds a different pair, so a parked value must survive an **intermediate** design (1 → 2 → 3
      → 1); and design 2's features list carries `data-items-limit="2"` against the fixture's three default
      items. Every arm of carry / park / default and the surplus-item rule is then a real render, not a mock.
      **`packages/library/designs/` is not touched** (AD-35, R-158).
- [x] `packages/library/src/vocabulary.ts` -- `data-items-limit` joins `DIRECTIVES` beside
      `data-repeat-limit`, with its own grammar and summary -- one table the validator, the canvas emitter
      and the theme emitter all read, so a new attribute cannot be honoured in one place and ignored in another.
- [x] `packages/library/src/validate.ts` -- refuse `data-items-limit` on an element with no `data-items`
      (`core.ts:513`'s rule, which already exists for `data-repeat-limit`) -- a modifier with nothing to
      modify would ship verbatim.
- [x] `packages/library/src/registry.ts` -- `DesignJson` and `SectionRegistryEntry` gain optional
      **`surface`**, carried by `assembleEntry` -- FR-D13's A30 partition needs a declaration to partition
      on, and one optional field is inert until A30 lands in Epic 10.
- [x] `packages/library/src/placement.ts` -- **`ringFor(entries, entry)`**: the designs of the same category
      that are `isPlaceable` and share the entry's `bindingContext` set, `compileTarget` set and `surface`,
      in id order; plus `samePartition(a, b)` as its one comparison -- the ring and the picker then answer
      from one file and can never drift.
- [x] `packages/section-runtime/src/core.ts` -- `expandItems` renders at most `data-items-limit` copies and
      **`itemsShown(html, path)`** reports the cap -- one shared function, so both emitters agree by
      construction and `agreement.test.ts` needs no new case to stay honest.
- [x] `packages/section-runtime/src/doc-schema.ts` -- `parkedControls` on `instanceSchema`, keyed by design
      id, each value `{ controls, darkOverrides }`, **`.default({})`** -- required would stop every stored
      doc parsing, the seeded project included.
- [x] `packages/section-runtime/src/controls.ts` -- `ControlState` gains `parkedControls`, and
      **`switchControls(from, to, state)`** returns the next `controls`, `darkOverrides` and
      `parkedControls`: a name both declare carries, a name only `from` declares is moved into
      `parkedControls[fromId]` (its dark override with it), a name only `to` declares is left unstored so
      `resolveControls` gives its default, and a parked record for `to` is restored and then cleared. Also
      `PropRow.list.shown` -- the panel prints "N items · M shown in this design" from the engine's own count.
- [x] `packages/section-runtime/src/doc-edit.ts` -- **`switchDesign(doc, instanceId, to, ring)`**: pure, the
      next doc or a sentence, shaped exactly as `insertSection` is; refuses a design outside the instance's
      ring and writes nothing -- the one place a design change happens, so 5.12's Remix and Epic 8's swap
      call it rather than reimplementing the rule.
- [x] `apps/web/lib/ring.ts` -- new, pure and importless but for the library (`node --test` cannot load a
      `.tsx`): the position words (`7 of 18` beside the block's own `Design` label — amended at the owner's
      finding 2, having read `Design 7 of 18` — and the pill's `7 / 18`), the announcement sentence, which
      KEEPS the word because a sentence read aloud has no label beside it, the
      strip model (the first N tiles and a `+N` tile, N derived from the strip's own shape), `step(at, len,
      by)` with UX-DR5's wrap, `shuffleTo(ring, at, random)` (a caller-supplied random — AD-1 keeps the core
      free of randomness), and the one-design sentence.
- [x] `apps/web/components/editor/design-picker.tsx` -- new: **B1a's block**, drawn above the settings
      groups (FR-F3: the design picker is not a setting and sits outside every group). The label, ◀ ▶ and
      the mono counter; the 4-column strip whose tiles are `SectionPreview` at the tile's size with the
      active one coral-ringed and a Pro tile ✦-marked; the active design's name and descriptor; and the
      `Cycle designs` footer with the `[` `]` chips. `← →` cross the strip (`EXPERIENCE.md:503`), reusing
      `icon-picker.tsx`'s `gridKeys` -- never a second arrow implementation. With one design: the counter,
      no arrows, and one sentence.
      **BUILT, THEN AMENDED BY THE OWNER'S TEST (2026-09-20):** the footer and its chips are REMOVED (finding 4)
      and the counter prints `1 of 3`, not `Design 1 of 3`, because the label beside it already says the word
      (finding 2). The label, the arrows, the counter, the strip, the name and the sentence stand.
- [x] `apps/web/components/editor/design-picker.tsx` -- **R-159, place one of two**: S6`:140`'s
      **`Try a design`** card at the block's foot — the destination design's preview, its name, the words
      *"Same words, new look"* and its tier badge, pressing it being the Shuffle. It is the one place that
      shows where a shuffle would take you **before** you press. Absent where the ring holds one.
      **BUILT, THEN REMOVED AT THE OWNER'S TEST (2026-09-20, finding 3), AMENDING R-159:** Shuffle keeps one
      seat, the section pill's. The held `shuffleSeed` went with the card in both surfaces and the random is
      drawn at the press; Shuffle is therefore pointer-only, and `[` / `]` are the keyboard's way to every
      design it could have reached.
- [x] `apps/web/components/controls/section-pill.tsx` -- S4b's **◀ ▶** at the head of the pill with S6's
      mono counter between them, and — **R-159, place two of two** — a Shuffle control (the Kit's `Refresh`,
      **icon-only**, its words as accessible name and hover `title`) **before** S4b's divider, because the
      divider separates *which design* from *this section*. Each carries its title and accessible name
      (*"Previous design — ["*, as the frame writes it). All three are absent where the ring holds one,
      exactly as Duplicate is absent on a site-wide row.
- [x] `apps/web/lib/keymap.ts` -- land `[` and `]` (`gesture: 'prev' | 'next'`, `shift: false`, no `meta`),
      dropping their `story` key -- they become `SINGLE_KEY` members and the `?` card lists them with no
      second list touched.
- [x] `apps/web/app/…/(editor)/editor.tsx` -- the `prev`/`next`/`shuffle` arms of `run()`; one `onDesign`
      handler the panel, the pill and the keys all call; the swap through `apply` → `commit` so it is one
      edit and one `⌘Z`; the polite announcement from that one place; and the panel head gaining the
      category word beside the layer name (`:1893`'s own note).
- [x] `apps/web/lib/canvas-chrome.css` -- the swap's settle: a 180ms fade on the incoming root keyed on
      `[data-inflozo-swapped]`, removed on the next frame, inert under `prefers-reduced-motion`
      (`EXPERIENCE.md:878`'s beat, and every transition instant under reduced motion). `mark()` re-applies
      it after the stamp, because `stampControls` strips what it does not own.
- [x] `apps/web/components/controls/item-list.tsx` -- the header prints `{count} items · {shown} shown in
      this design` when the design shows fewer than the instance holds -- FR-D13's exact sentence, from
      `PropRow.list`.
- [x] `apps/web/lib/controls-review.ts` · `app/(app)/app/(authed)/controls/page.tsx` · `review.tsx` --
      **R-158**: `samples()` returns all three fixture designs and the review page mounts the design picker
      (and both Shuffle seats it can carry) over them,
      holding `parkedControls` in its own state through the same pure `switchControls` -- the only surface on
      the deployed site where the rule itself can be exercised before Epic 9, for the owner's test and for
      R-82's.
- [x] `apps/web/app/(app)/app/harness/editor/page.tsx` -- the three fixture designs join the harness's
      `entries` and one section of the fixture category joins its Home doc, with a comment saying why (the
      library holds no ring yet) -- so the keyboard journey walks a **real** `[`/`]` on every commit. Check
      the picker stops that count rail rows or cards still pass.
- [x] `packages/library/src/placement.test.ts` · `packages/section-runtime/src/{controls,doc-edit,doc-schema,
      index}.test.ts` · `apps/web/{ring,keymap}.test.ts` (`pilots.test.ts` was named here and not touched at Dev — its
      selector-key check covered the new chrome rule by derivation; the Review gave it the `extra` case) -- the I/O matrix's rows as unit tests: every
      partition arm, the wrap, carry/park/default and the exact round trip (dark override included), the
      item cap on both emitters, `parkedControls` defaulting for a doc written before it, and `[`/`]` both
      sides of the caret.
- [x] `tools/keyboard/journey.spec.mjs` -- `[` and `]` leave the deferred loop at `:401` and get a stop of
      their own over the fixture ring: `]` changes the design and announces its position, `[` comes back,
      the parked value returns, `← →` cross the strip, and both keys are inert with a caret in a field.
- [x] `tools/probe/run-verify-editor.cjs` -- **first, DW-209**: execute the wheel hypothesis and fix what it
      shows. Then this story's steps after the last on file, inside step 5's one CSP session, with one
      `axeRun()` over the panel block and the pill — **no second node exception** (R-149).
- [x] `tools/probe/run-verify-controls.cjs` -- **R-158**: the deployed ring walk on `/controls`: the arrows
      change the design, a carried value survives, a parked one returns exactly, and the item count sentence
      reads as the engine counts it.
- [x] `apps/web/app/(app)/app/(authed)/controls/review.tsx` -- **the owner's finding 1 (2026-09-20)**: `[` and
      `]` bound on this route too, through the editor's own `shortcutFor` + `holdsCaret` rather than a second key
      table (R-145, standing rule 3), on the page's document and the frame's -- the page advertised the keys and
      they reached nothing, because the editor's binding is `editor.tsx`'s and this route does not mount it.
- [x] `docs/section-authoring.md` -- `data-items-limit` documented in the directive table and in the list
      rule beside `data-repeat-limit` -- the authoring vocabulary is a documented deliverable (FR-G3), and a
      cap no author can find is a cap no design will use.

### Review Findings

Review of 2026-09-20 (`review_loop_iteration` 1), five layers over the diff since `e74f84cc`, each rated after reading
the code at its location. Every patch below is applied; the four deferred items are DW-211 to DW-214.

- [x] [Review][Patch] `/controls`'s `[` `]` had the caret half of WCAG 2.1.4's condition and not the overlay half: `]` swapped the design under an open picker, a `<select>` or a held key (three layers) [`apps/web/app/(app)/app/(authed)/controls/review.tsx` `onKey`] — `singleKeyOwned` in `lib/keymap.ts`, shared; proved by a new step of the deployed walk, which **FAILED on the unpatched production first** (`2 of 3 · popover open: 0`)
- [x] [Review][Patch] the R-159 amendment reached the spec and the code and not the ruling's own document, `epics.md`, `EXPERIENCE.md`'s B1 row or `epic-5-context.md`, all of which still said "both places" and "Design 1 of 1" [`reconcile-designs-decisions.md` R-159] — an amendment paragraph and its targets, dated
- [x] [Review][Patch] four comments described the removed surfaces as present [`editor.tsx:139,146,1480,2020` · `section-pill.tsx:191` · `fixtures/controls/3/index.html:7`]
- [x] [Review][Patch] DW-210's `status:` word was one the story board cannot read ("does not reproduce") [`deferred-work.md`] — `closed`
- [x] [Review][Patch] DW-209 was `done` with step 15's pass "to record" — the shape `story-board.py` names as the standing-rule-2 failure [`deferred-work.md`] — the pass recorded, and the forwarding now asserted with the pointer ON each pill (`run-verify-editor.cjs` step 87, `run-verify-controls.cjs` `ring — DW-209`) rather than remembered from one Dev-time execution
- [x] [Review][Patch] `wheelToCanvas` was written twice [`editor.tsx` · `review.tsx`] — `wheelToFrame` in `lib/canvas.ts`, one implementation
- [x] [Review][Patch] `markSwapped`'s timer was never cleared, so a swap 180ms before leaving marked a torn-down canvas [`editor.tsx`] — a ref, cleared in the unmount cleanup
- [x] [Review][Patch] `shuffleTo` with `at` outside the ring skewed the draw (index 0 never drawn) [`apps/web/lib/ring.ts`] — null, with the case in `ring.test.ts`
- [x] [Review][Patch] `surface` was typed and never validated: `"surface": "signupp"` assembled clean and made its own one-design ring; `RingEntry.surface` was `string` [`packages/library/src/validate.ts` · `placement.ts`] — `bad-surface` against the exported `SURFACES`, and the type
- [x] [Review][Patch] the harness wrote the ring's membership down (`ring[1]`, `ring[2]`, `startsWith('controls/')`) [`apps/web/app/(app)/app/harness/editor/page.tsx`] — derived from `ring`
- [x] [Review][Patch] the strip was a `radiogroup` whose arrows move focus without selecting — a radio's arrow selects; a listbox's need not [`apps/web/components/editor/design-picker.tsx`] — `listbox` / `option` / `aria-selected`, the semantics of what it does
- [x] [Review][Patch] `tools/stress/test-vocabulary.mjs` validated `controls/1` alone while a comment beside the ring said every fixture design passed through it [`tools/stress/test-vocabulary.mjs`] — every numbered directory, derived
- [x] [Review][Patch] `pilotsCanvasDocument`'s new `extra` parameter was asserted nowhere — reverting it left `pnpm keyboard` green over an unstyled ring [`apps/web/pilots.test.ts`] — two assertions
- [x] [Review][Patch] `data-inflozo-swapped` was asserted nowhere — never setting it, or never clearing it, failed nothing [`tools/keyboard/journey.spec.mjs`] — on after `]`, off within the fade
- [x] [Review][Patch] the carry assertion asked two designs, not every one [`apps/web/controls.test.ts`]; two literal counts in new prose [`vocabulary.ts` · `keymap.test.ts`]; the review screenshot captured a shuffled state [`run-verify-controls.cjs`]
- [x] [Review][Patch] three departures from the spec's letter were built and not listed: the settle is removed on a 180ms timeout, not "the next frame"; `strip()` slides rather than showing the first N; the item-list task's `pilots.test.ts` — listed under `## Verification` now
- [x] [Review][Defer] the editor's own pill ◀ ▶ and Shuffle are wired but never pressed by any gate [`editor.tsx`] — deferred, DW-211 (a mouse-allowed spec beside the journey; a new gate file, not a patch)
- [x] [Review][Defer] a capped list's row loses its min–max range [`item-list.tsx`] — deferred, DW-212 (the sentence is the one the owner just approved)
- [x] [Review][Defer] `itemsShown` reads the first `data-items` bound to a path [`controls.ts`] — deferred, DW-213 (a validator rule with no positive case today)
- [x] [Review][Defer] the 180ms settle is drawn where no ring exists and not on `/controls` [`canvas-chrome.css`] — deferred, DW-214

Dismissed as noise: a `parkedControls` key refinement (this code is the record's only writer, and refusing a key would make a stored doc unparsable rather than safer); a pre-existing `parkedControls[from.id]` being overwritten (unreachable — a restore clears the record for the design you are on); keying `/controls`'s `Sidebar` by design (the editor keeps the panel mounted across a swap on purpose, so the open groups survive browsing, and `/controls` matches it); a double scroll below the tablet breakpoint on `/controls` (an internal page at a width it is not reviewed at); the journey's FR-D5 stop having a dead arm on production-shaped data; and the walk's `inputValue().catch(...)` on a rich field.

**Acceptance Criteria:**
- Given a selected section whose ring holds more than one design, when I press `]`, use the on-section ▶ or
  click a thumbnail, then the section renders as that design in place, keeping every word, picture, item and
  shared setting; **one** journal entry is written and one `⌘Z` restores exactly what was there.
- Given the panel, when a section is selected, then its Design block is **`B Missing Surfaces.dc.html` B1a as
  the owner's test of 2026-09-20 left it** — the `Design` label, ◀ ▶ around a mono counter reading *"{n} of
  {m}"* and **not** repeating the label's word (finding 2), the 4-column strip of 44px tiles with the active
  one coral-ringed and a Pro tile ✦-marked, and the active design's name and descriptor beneath. B1a's
  `Cycle designs` footer is **not** drawn (finding 4), and neither is S6's `Try a design` card (finding 3).
- Given a hovered or selected section, when its quick-action pill is drawn, then it **matches
  `S6 Variant Shuffle.dc.html`'s pill** — ◀ ▶ then the mono `{n} / {m}` counter then S4b's divider and the
  three controls already built — and B1b's claim holds: the counter and arrows ride on the section itself.
- Given Shuffle, when I press it in its **one** seat — the section pill's icon (R-159 as amended by the owner's
  finding 3) — then the section lands on a **different** design of the same ring under the identical carry /
  park / default rule, in one edit; the control is icon-only with its words as accessible name and hover title;
  and the panel carries no Shuffle card, which the keyboard journey and the deployed `/controls` walk each
  assert **absent** rather than assume.
- Given a control only the outgoing design declares, when I move away and back, then its value — and its
  dark override — are restored exactly, and at no point is it written to the section root.
- Given a category whose designs differ on `bindingContext`, `compileTarget` or `surface`, when I cycle or
  shuffle, then only designs in the instance's own partition are ever reachable, by any of the four doors.
- Given a ring of one design, when a section is selected, then the arrows and Shuffle are **absent** — not
  greyed, not captioned as errors — the counter reads *"1 of 1"* beside its `Design` label, and one plain
  sentence says the category has one design so far.
- Given the keyboard alone, when I press `[` and `]` with the shell focused — **in the editor and on
  `/controls`** (the owner's finding 1) — then the design changes and the position is announced; with the caret
  in any field the same keys type their characters and change nothing; and `pnpm keyboard` proves both on every
  commit, the deployed `/controls` walk proving the same two on production.
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

**Why fixture designs and not library ones (R-158).** The whole story is about what happens **between** two
designs, and `packages/library/designs/` holds exactly one per category — so without a second design
somewhere, every assertion in this spec would be vacuous and a green test suite would prove nothing.
`packages/library/fixtures/controls/` already exists as a real, validated, assembled category with an
authored array and a dark-override control, already read by unit tests and by one deployed page, and is not
the shipped library — so two more designs there are the honest fixture the rule can be proved against without
touching a pilot (AD-35) or pretending Epic 9 has happened. **Three in the ring, not two**: with two, `◀` and
`▶` do the same thing and a parked value is only ever restored from the design next door, so the one path
worth proving — a value parked against design 1 surviving while the customer is on design 3 — has no room to
exist. The owner's *"a couple of samples"* is those two new ones.

**What this story deliberately does not do.** It does not animate a true crossfade of two renders: the frame
draws a mid-moment and `EXPERIENCE.md:878` says 180ms, and the smallest honest reading is a fade on the
incoming root — a real crossfade would need both trees mounted at once inside the canvas document, which is
a second paint path for a visual flourish. It does not build S4c's pinned card (R-113), B1b's ink pill or its
`⋯` (R-126: the `⋯` is the Layers row's one control), and it binds no key for Shuffle — FR-D11's map has
thirteen actions and a fourteenth key, and R-145 forbids inventing a fifteenth.

## Verification

**As built.** The departures from the spec's letter, each for a mechanical reason — the first four from Dev, two
from the Dev verification itself, and three listed at the Review:
- **`itemsShown` lives in `controls.ts`, not `core.ts`.** `core.ts` already imports `controls.ts` (`resolveControls`,
  `withData`), so a reader in core that the panel called would be an import cycle. The CAP ITSELF is applied in
  `expandItems` exactly as specified — one shared function, both emitters — and `controls.ts` has the tag scan
  already. The comment beside it says so.
- **`agreement.test.ts` gained one attribute, not a case.** Its leak fixture is DERIVED from `RENDERED_DIRECTIVES`
  (`assert.ok(everyDirectiveSrc.includes(d))`), so a new rendered directive must appear in it or the partition test
  fails. `data-items-limit="1"` joined the `data-items` element there, and the same test now asserts the cap is
  honoured and leak-free on BOTH emitters — the proof got stronger, not weaker. `ad36.test.ts` is untouched.
- **`instanceSchema.designId` widened from `/^a\d+\/\d+$/` to `categoryOf`'s own rule.** The ring fixture's
  category is `controls`, and the keyboard harness stores one of its sections; a shape check whose grammar
  disagreed with the library's would have refused a doc the library assembles. Everything the old pattern refused
  it still refuses (`doc-schema.test.ts`), path traversal and casing included.
- **On `/controls` the pill draws its RING GROUP ALONE** (`sectionControls={false}`). That page holds one sample and
  no doc, so Duplicate, Delete and the drag grip would be three dead controls (UX-DR3). The owner's manual test
  step 12 was corrected to say so rather than the pill being made to draw them.
- **`LIMIT_RE` is exported from the vocabulary and read in three places.** The 1–100 grammar had been written out
  in `vocabulary.ts`, `core.ts` and `controls.ts` — three copies of one rule is the drift standing rule 3 forbids,
  and the whole reason `data-items-limit` joined `DIRECTIVES` was that one table decides it. `data-repeat-limit`
  reads the same constant.
- **The settle comes off on a 180ms timeout, not "the next frame"** (the task's words). Removing the attribute on the
  next frame would cancel the animation rather than end it; `markSwapped` waits the fade's own length. Listed at the Review.
- **`strip()` slides; it does not show "the first N".** B1a draws the first twelve of eighteen with a `+6`, which is right
  until the customer cycles past the twelfth — the window slides just far enough to keep the active tile on screen, and
  the `+N` still says how many are not shown. Unreachable today (no ring is longer than the strip). Listed at the Review.
- **The strip is a `listbox`, not a `radiogroup`** (the Review, 2026-09-20). `← →` move FOCUS across the tiles and Enter
  or a press is the swap; a radio's arrow selects on its own, and here an arrow that swapped would write one edit per
  press. `option` / `aria-selected` say what the strip does.
- **`PanelLabel` takes an optional `id`, and the editor's panel head names both its parts.** Story 5.11 put S4c's
  category word under the layer name inside a wrapper, so "the first `<span>` in the Controls panel" — which five
  checks of the deployed walk used to read the heading — became the wrapper, whose `textContent` runs the two
  together ("Header — RailHeaders") and whose computed type is not the label's. `#editor-panel-name` and
  `#editor-panel-category` are read by name now, and the walk asserts the category word as well.

**DW-209, EXECUTED (standing rule 1) and FIXED.** Driven in Chromium through this repository's own Playwright over
the keyboard harness: a wheel synthesised over `[data-add-section]` scrolled the canvas document **0px**, and the
identical wheel over the iframe **500px** — so the hypothesis holds as a MECHANISM, though at the harness's own
geometry `(700, 600)` fell on the iframe rather than on the pill, which is why the deployed check fails *most* runs
rather than all. The fix is the ledger's own: both pills forward their wheel to the canvas
(`section-pill.tsx`'s `onWheel` → `editor.tsx`'s `wheelToCanvas`), and the same control re-run after it reads
**500px** on both pills. A customer felt the identical stall, so this is a fix and not a test repair.

**THE OWNER'S FOUR FINDINGS, FIXED AND PROVED ON PRODUCTION.** He tested the deployed `/controls` at `905efa4e`;
all four are fixed inside this story (R-80) and each is now a check of the deployed walk, because a removal nobody
checks comes back. What he found, and what the live page answers, is in `## Owner's test findings` above; the
run's own lines are below.

**DW-210 no longer reproduces.** Step 17's window scroll range on `/controls` reads **0** at `730e713a`, after his
findings 3 and 4 took the card and the footer out of the panel; it measured 24, 30 and 35px at `6a09cecc` and
`1b5e4805`. The shorter panel is the LIKELY cause and not a proved one — no control isolated it — and the ledger
entry says exactly that rather than claiming a fix.

**Run at Fix (2026-09-20), against the deployed build `6b0a2da4` — every gate, and both deployed walks clean:**
- `pnpm check` — **exit 0**, lint, typecheck and every package test green, `agreement.test.ts` and `ad36.test.ts`
  among them (the control: no mode and no ring reaches the theme emitter). Its own run prints the count.
- `pnpm keyboard` — **29 stops, 0 fail**, six of them this story's: `]` and `[` over the fixture ring with the
  position announced, a parked value surviving an intermediate design and coming back exactly, `← →` across the
  strip, both keys inert with the caret in a field and in a canvas `contenteditable`, the block carrying no
  Shuffle card and no key chips with `]` alone still reaching every design in one-edit steps, and a site-wide
  section drawing the same block counted by its ring and not its doc.
- `python3 tools/doc-audit.py --check` — **PASS, 0 warnings** (run twice; the sub-tools regenerate on the first).
- `bash supabase/tests/run-rls-gate.sh` — **exit 0**. No migration is in this story; this is the control that
  none crept in.
- `node tools/probe/run-verify-controls.cjs` on **production** (R-82, `SUPABASE_URL` + `SUPABASE_SECRET_KEY`) —
  **0 FAIL, 100 PASS**. The ring walk in full: the Design block counts a real ring of three and does **not**
  repeat its own label (`1 of 3`); ▶ changes the section in place and announces *"Design 2 of 3 — Controls
  sample — a banded pair"*; a carried setting and the typed words survive; the parked control leaves the panel
  **and the section root** (`tintAttr: null`); the cap reads *"3 items · 2 shown in this design"* and draws two
  of three; ▶ at the end wraps and the parked value comes back exactly **the long way round, through an
  intermediate design** (`Strong` → `Strong`); ◀ wraps the other way; the block carries `0 card · 0 chips ·
  3 previews`; **`]` and `[` cycle the design on this page** (`1 of 3 → 2 of 3 → 1 of 3`) and type their
  characters with the caret in the Heading field, changing nothing; and the pill's icon-only Shuffle reads its
  words as its name and its title and **lands on a different design carrying the words**. Step 17's window
  scroll range is **0** (DW-210).
- `node tools/probe/run-verify-editor.cjs` on **production** (R-82, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
  `VERCEL_TOKEN`, `VERCEL_TEAM_ID`) — **0 FAIL, 454 PASS, clean on the first attempt** (no DW-204 death).
  Step 86, this story's: the Design block is at the head of the panel, above every settings group and inside
  none (`aboveGroups: true`); with one design the counter reads **`1 of 1`**, the sentence says why, and the
  arrows, the strip, the card and the chips are all **absent**; the section's own pill agrees, carrying only
  Story 5.4's Duplicate and Delete; `[` and `]` do nothing and announce nothing; and the `?` card lists
  **`[`** and **`]`**. Step 5's scripted session records **zero** `securitypolicyviolation` events in either
  document. Step 8's axe is **zero** at every state, B1a's Design block and S4b's ring group included, with no
  exception beyond R-149's one. Step 15's sticky-scroll check **passes** — DW-209 executed and fixed, not retried.
- CI at each push: `check`, `rls` and `deploy` green; Vercel READY on `app.inflozo.com`.

**Not hit by this story, and not claimed:** Resend, Dodo and the Ghost test servers T1/T3. Nothing here sends
mail, takes a payment or reads a Ghost — the ring is the editor's own doc and the library's own entries.

**THE REVIEW (2026-09-20, R-82).** The Real-infra verifier re-ran every claim above against production at `2ee6f4a8`
before a patch was applied and every one held with the same tallies: the deployed build was HEAD (Vercel API,
`VERCEL_TOKEN` + `VERCEL_TEAM_ID`, `githubCommitSha` = `git rev-parse HEAD`, READY); `run-verify-controls.cjs` **0 FAIL /
100 PASS**; `run-verify-editor.cjs` **0 FAIL / 454 PASS** on its third attempt (two DW-204 deaths first, each with 0 FAIL
and a clean account cleanup); `pnpm check` exit 0; `pnpm keyboard` 29 passed; no file under `supabase/migrations/` in the
diff (R-99's control); and the negative control — the controls walk with `SUPABASE_URL` pointed at a wrong host —
refused before any browser step. Then the patches: `pnpm check` **exit 0** and `pnpm keyboard` **29 passed** again with
the new cases in them, and `run-verify-controls.cjs` re-run against the STILL-UNPATCHED production as the control for
its new overlay-guard step: **1 FAIL / 101 PASS**, the one FAIL being exactly that step (`2 of 3 · popover open: 0` —
`]` swapped the design under the open picker and closed it), and its new DW-209 step PASSING (`top: 70, range: 70`).
**After the Review push (`56d801c7`; CI `check`, `rls`, `deploy` and the render matrix all green; Vercel READY built
from it), on production:**
- `node tools/probe/run-verify-controls.cjs` (`SUPABASE_URL` + `SUPABASE_SECRET_KEY`) — **0 FAIL / 102 PASS**. The new
  overlay-guard step now PASSES (`1 of 3 · popover open: 1` — `]` under the open picker changed nothing and left it up),
  the new DW-209 step reads `top: 300, range: 665`, and the account count is `13 → 13`. (A first run beside the editor
  walk died at a `page.reload` timeout with 0 FAIL, and its count control read `13 → 15` because the other recorder's
  accounts were alive — the two walks are run one after the other from now on.)
- `node tools/probe/run-verify-editor.cjs` (the four variables) — **one complete run: 455 PASS**, step 87's two new
  checks green (**300px** of canvas scroll with the pointer on the quick-action pill and **300px** on the "+ Add
  section" pill), step 5's CSP count zero, step 8's axe zero, step 15 passing, step 86 unchanged; its one FAIL was the
  final user-count control (`14 → 13`), broken by the controls walk running beside it and not by the site. Two solo
  re-runs to clear that control both died at step 53's soft navigation with **0 FAIL and 492 PASS** each — DW-204's
  shape, recorded there; a HARNESS ERROR with no FAIL is not a result, so the count control stands unproved on this
  build and everything else stands proved.

**Commands:**
- `pnpm check` -- expected: lint, typecheck and every package test green, including the partition, carry / park /
  default, round-trip, item-cap and `parkedControls`-default cases, with `agreement.test.ts` and `ad36.test.ts`
  green (the control: no mode and no ring reaches the theme emitter).
- `pnpm keyboard` -- expected: 0 fail, and the deferred-key stop carries four owed keys, not six.
- `python3 tools/doc-audit.py --check` -- expected: exit 0 (run twice).
- `bash supabase/tests/run-rls-gate.sh` -- expected: the gate passes; the control that no migration crept in.
- `node tools/probe/run-verify-editor.cjs` (real production, R-82) -- expected: 0 FAIL, step 5's CSP count zero,
  step 8's axe zero with R-149's single exception, step 15's sticky scroll passing, and step 86's absence case.
- `node tools/probe/run-verify-controls.cjs` (real production, R-82) -- expected: 0 FAIL, the whole ring walk
  including the owner's four findings.

**Manual checks:**
- Open `/projects/<id>` on production beside `B Missing Surfaces.dc.html` B1a and `S6 Variant Shuffle.dc.html`
  and compare the panel block and the pill part for part (R-74) — remembering that B1a's `Cycle designs` footer
  and S6`:140`'s `Try a design` card are deliberately **not** drawn, on the owner's findings 4 and 3.
- Confirm on the deployed editor that a section whose category holds one design draws **no** arrows and no
  Shuffle anywhere — the pill, the panel and the strip agree, and nothing is greyed (UX-DR3).

## Owner's manual test

Do this on the real site after Deploy confirms the URLs. Use the **Pilot sections** project — the one seeded
to your account at Story 5.1.

1. **URL:** `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` · **Screen:** the editor,
   on Home. Click any section on the canvas. **Expect:** at the top of the right-hand panel, above the
   settings groups, a new **Design** block: the word **Design** on the left, a counter reading **"1 of 1"**
   on the right, and the design's name underneath. Nothing else — no key chips along the bottom and no
   Shuffle card (your findings 3 and 4).
2. **Same screen.** Look for arrows beside that counter. **Expect:** there are **none**, and one plain
   sentence says this category has one design so far. This is the rule you set at R-118 — a control that
   could do nothing is not there at all, rather than there and dead.
3. **Same screen.** Hover any section on the canvas and look at the small white pill in its top-right
   corner. **Expect:** the same answer — Duplicate, Delete and the drag handle, and **no** ◀ ▶, no counter
   and **no Shuffle**, because there is nowhere to go. (When Epic 9 fills a category, all four appear here on
   their own.)
4. **Same screen.** With a section selected, press `]`, then `[`. **Expect:** nothing happens and nothing is
   announced — no flicker, no error.
5. **Same screen.** Press `?` to open the keyboard card. **Expect:** it now lists **Previous design `[`** and
   **Next design `]`** among the shortcuts. They were deliberately missing until today.
6. **URL:** `https://app.inflozo.com/controls` · **Screen:** the **Controls review** page — an internal
   page we use to check the panel, not a customer screen. **Expect:** a sample section on the left and its
   panel on the right, and the panel now has the same **Design** block at the top — this time reading
   **"1 of 3"**, with three thumbnails and working ◀ ▶ arrows (your ruling R-158: three samples, so
   the arrows really differ and the counter really counts).
7. **Same screen.** In the panel, change a couple of settings — **Dummy data:** set **Alignment** to
   *Centre* and **Card tint** to *Strong* — and type something into the heading so you can recognise it.
8. **Same screen.** Press **▶**. **Expect:** the sample section **changes shape in place**, your heading text
   is still there word for word, **Alignment is still Centre** (both designs have it), and **Card tint has
   disappeared from the panel** — the new design does not have that setting.
9. **Same screen.** Press **▶** once more so you are on the third design, then press **▶** again.
   **Expect:** it wraps round to the first — **and Card tint is set to Strong again**, exactly as you left it,
   even though you went the long way round. This is the whole promise of the story: browsing costs you nothing.
10. **Same screen.** Look at the **Features** list in the panel while the second design is showing.
    **Expect:** it reads **"3 items · 2 shown in this design"**, and the section on the left draws two — the
    third is not gone, it is waiting.
11. **Same screen.** Look at the foot of the Design block. **Expect:** **nothing** there — no *Try a design*
    card and no *Cycle designs* line with `[` `]` chips. Both were built and both are now gone, on your findings
    3 and 4. Shuffle has one home, and you press it in the next step.
12. **Same screen.** Rest the pointer on the sample section itself and look at the small white pill in its
    top-right corner. **Expect:** ◀, the counter, ▶, then a **circular-arrow Shuffle button** — Shuffle's one
    home now. Press it: it jumps you to another design in the ring, carrying your words the same way. Rest on it
    and a label says what it is — in that pill everything is a picture, so the words are in the label rather
    than printed.
    **And expect nothing else in that pill here.** This internal page holds one sample and no page to put it on,
    so Duplicate, Delete and the drag handle have nothing to act on and are **not drawn** — the same rule you
    set at R-118. You saw all three in their real place at step 3.
13. **Same screen.** Use the keyboard only: click anywhere on the page that is not a text field, then press
    `]` and `[`. **Expect:** the same changes as the arrows — this is your finding 1, and it did not work
    before. Now click into the heading field in the panel and type `[`. **Expect:** the character `[` appears
    in your text and **the design does not change** — this is the most important step on this list.

## Owner's test findings

**Tested on the deployed `/controls` on 2026-09-20, at `905efa4e`. Four findings, all four fixed inside this
story (R-80), and one of them amends a ruling he made at Create.**

1. **`[` and `]` did not cycle the design on `/controls`.** True, and the block was advertising them. The
   editor's key binding is `editor.tsx`'s and this route does not mount the editor, so the keys reached
   nothing here. `review.tsx` now binds them through the editor's own `shortcutFor` + `holdsCaret` — the same
   match and the same WCAG 2.1.4 guard, never a second key table (R-145, standing rule 3) — on the page's
   document **and** the frame's, because a press with the pointer over the sample is delivered to the frame.
2. **"Design 1 of 3" says the word twice.** B1a draws the label **Design** on the left and the counter
   **`7 of 18`** on the right; the counter was printing the label's word as well. `position()` now returns
   `1 of 3`. The **announcement keeps it** — *"Design 2 of 3 — …"* — because a sentence read aloud has no
   label beside it to supply the word (UX-DR12).
3. **Remove `Try a design` from the panel.** Done, and **this amends R-159**: Shuffle had two seats and now
   has one, the section pill's icon-only control — which is Question 2's option 3. What is lost is the one
   thing the card did that the button cannot: name and picture the destination *before* the press. What that
   simplifies is real — the held `shuffleSeed` state went with it in both surfaces, and the random is now drawn
   at the press. **A consequence worth stating: in the EDITOR, Shuffle is now pointer-only.** Its one seat is
   the quick-action pill, which is drawn on hover, so without a pointer it is not in the tab order at all; and
   FR-D11's map is full, so R-145 forbids giving it a key. What that costs is nothing in reach — `[` and `]`
   get to every design a Shuffle could have landed on — and `journey.spec.mjs` proves exactly that on every
   commit. (On `/controls` the pill is drawn whenever the sample is, so there it *is* tabbable; that page is an
   internal review surface and not the customer's.)
4. **Remove the `Cycle designs` / `[` `]` footer.** Done. The keys are still advertised in the `?` card, which
   is R-147's one place for them, and both removals are asserted **absent** by the keyboard journey and by the
   deployed `/controls` walk — a removal nobody checks comes back.

**Where 2, 3 and 4 landed.** All three are the shared `DesignPicker`, so they apply to the editor's own panel
as well as `/controls`. `/controls` exists to review that panel, so a block that differed between the two
would make his test of it prove nothing — and the editor would otherwise have kept "Design · Design 1 of 1"
for him to find at Epic 9.

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

**Ruled: option 1 (owner, 2026-09-20).** *"Build it, and make the Controls review page a real ring … I do not
want to build all designs. Just a couple of samples enough for testing."* Recorded as **R-158**. The samples
are **two new fixture designs** under `packages/library/fixtures/controls/`, giving a ring of three — three
rather than two because with two, `◀` and `▶` are indistinguishable and no parked value can be shown
surviving an **intermediate** design (1 → 2 → 3 → 1). **`packages/library/designs/` is not touched**: no
shipped design is authored here and Epics 9 and 10 still author every one of them (AD-35).

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

**Ruled: option 2 (owner, 2026-09-20).** *"In both places."* Recorded as **R-159**.
**AMENDED by his test of the deployed page the same day** — *"Remove 'Try a Design' in controls panel"* — which
takes the panel seat away again and leaves option 3's answer: **the section pill only**. What the amendment costs
is named under `## Owner's test findings` above, including that Shuffle is now pointer-only. The rest of R-159
stands: **S4b + S6 govern the pill, B1b governs the affordance**, and in the pill the control is icon-only. *(As ruled,
before the amendment:)* the panel keeps S6's **`Try a design`** card, and the section's pill gains a Shuffle control **with
the ring, before the divider** — the divider in the built pill separates *which design* from *this section*. In the pill it is **icon-only**
(the Kit's `Refresh`, its words carried as accessible name and hover title) through `DESIGN.md:534-536`'s
carve-out, the one R-132's mode button and R-136's moon badge already use: every other control in that pill
is a 26px round icon target and a word would be the only text in it. Both are absent where the ring holds
one design. **R-159 also settles the pill itself** — S4b + S6 govern it, B1b governs the affordance.

### Question 3 — you changed a setting on one design, then went back to an earlier one that also has it. Which value should it show?

Two of the promises in this story pull in opposite directions in one narrow case, and the spec did not say
which wins. It is reachable today on the Controls review page, so you may well hit it while testing.

**An example.** *Rule under heading* is a setting that samples **1** and **3** both have, and sample **2**
does not.

1. On sample 1 you set **Rule under heading** to *None*.
2. You press ▶ to sample 2. That sample has no such setting, so the value is **put aside against sample 1**
   — "it comes back exactly as you left it".
3. You press ▶ to sample 3, which has the setting again. It starts at its own default, *Line*. You change it
   to something else — say you leave it on *Line*.
4. You press ▶ once more and wrap round to sample 1. **What should Rule under heading say?**

*None* is what you left sample 1 with. *Line* is what you set two seconds ago. Both rules in the spec are
being kept; they simply disagree here.

1. **(RECOMMENDED) Show *None* — what you left that design with.** Going back to a design always looks
   exactly the way you left it, which is the promise the whole story is sold on and the one your test of it
   checks (step 9). This is what is built today.
2. **Show *Line* — what you set most recently.** The setting follows you as you browse and only the ones a
   design does not have are ever put aside. Simpler to say in one sentence, but it means returning to a
   design does *not* always look the way you left it, and the thing that changed it is a design you have
   since left.

**Ruled:** _(awaiting the owner)_

Nothing waits on this. The built behaviour is option 1, it is documented beside the code and covered by a
test, and switching to option 2 later is one line. It is here because it is a choice you would want to make
rather than inherit.
