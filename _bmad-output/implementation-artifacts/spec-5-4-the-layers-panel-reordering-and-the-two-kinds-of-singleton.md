---
title: 'Story 5.4 — The Layers panel, reordering, and the two kinds of singleton'
type: 'feature'
created: '2026-09-18'
status: 'in-progress'
owner_test: pending
baseline_commit: 0aa7cd10b8b4cad1b8df0ac8de774aacf64289f4
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

The list on the left of the editor stops being a picture of your page and becomes the place you work on it: drag a
section to move it, press a row to select it, and use the little "…" beside a row to hide, rename, copy or remove it. Hovering a section on the page itself now raises a small white pill in its corner with Copy, Remove
and a grip you can drag. Your header, announcement bar and footer sit together in their own group at the top, above a
thin line, because they are one shared thing that appears on every page — so they cannot be copied, and removing or
hiding one asks first and tells you it changes every page; nothing you do here survives a reload until Story 5.8 adds saving.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Layers panel is a read-only mirror of the canvas (`editor.tsx`, `interactive={false}`) — a row cannot
be pressed, dragged, renamed, hidden or removed, and the canvas has no quick actions, so structure can only be changed
by editing the seeded doc by hand. The project doc has nowhere to store a hidden section, a per-instance audience or a
new order, and the two singleton rules the product depends on — one shared site-wide instance, one Post Content
section per layout — exist only as prose (FR-D5, R-37).

**Approach:** Give the doc the two fields it lacks (`hidden`, `memberVisibility`, both defaulted so every stored doc
still parses), put every section operation in one pure module the editor, Story 5.8's journal and Epic 7's compiler
all read, and draw B7's two-group Layers panel over it: a pinned Site-wide card and the page's own rows *(the card
became the page group's own shape with a hairline under it — R-126, owner, 2026-09-18)*, each row
interactive with D8e's four states and UX-DR10's keys. The canvas gains S4b's quick-action pill with the three
controls R-118 assigns to this story. The placement rules that have no surface yet — the Post Content singleton and
the non-placeable treatments — land as tested predicates that Story 5.10's Section Picker will call.

## Boundaries & Constraints

**Always:**
- **The frames are the authority (R-74).** Layers is `B Missing Surfaces.dc.html` B7 (:1538-1580); a row's four states
  are `D8 Editor Below 1440.dc.html` D8e (:368-400); the canvas pill is `S4 Editor.dc.html` S4b (:181, the
  `top:10px;right:10px` group). Anything not drawn is extrapolated from the nearest frame and named as such.
- **Nothing reorders until the drop**, and every reorderable list draws the same dashed landing slot with the rows
  between sliding aside (EXPERIENCE.md :308, the owner's finding 9 of 2026-09-13). Layers is one of those lists.
- **Every drag has a keyboard path** (UX-DR10): `↑ ↓` move focus between rows, `⌥↑`/`⌥↓` move the section with the
  move announced politely (UX-DR12), `Enter` selects, `Space` toggles visibility.
- **Absent, not greyed** (UX-DR3, R-118): the pill carries Duplicate, Delete and the drag handle and nothing else —
  `◀ ▶` arrive with 5.11, the hairline "+" with 5.10.
- **A press on a Layers ROW keeps the selection; the empty space below the rows lets it go** (R-123 as amended). This
  story owns all three Layers rules together — the row's press, the drag's start, and that ground's press.
- **Pressable chrome lives outside the iframe** (AD-21, as amended by 5.1–5.3). The pill is therefore placed from the
  editor document and, like P0-1's toolbar, hides from the first canvas `scroll` and is placed again 150 ms after the
  last — anything anchored from the editor document trails the compositor by a frame (the owner's finding, 5.2).
- **Hidden is retained, never removed.** A hidden instance stays in the doc, renders `''` on the canvas, and is
  excluded from compilation by Epic 7.
- **Counts are derived** (standing rule 4): the site-wide card's template count is the number of canvases
  `lib/editor.ts` opens; the page group's count is its own rows. No literal number is written down.
- **Real infrastructure** (R-82): the deployed editor on `app.inflozo.com`, through `tools/probe/run-verify-editor.cjs`
  in its CSP session, over the "Pilot sections" project Story 5.1 seeded. Never a second seed.

**Ask First:**
- Both of this story's questions are ruled (**R-124** and **R-125**, owner, 2026-09-18) and are not reopened: Member
  visibility is drawn at the head of the panel's **Section settings**, and the **Pro tag keeps the section's
  top-right corner** with the pill directly to its left. Anything that would move either is a new question.
- Any change to what a *design* declares. `memberVisibility` is an instance field, never an entry in a design's
  `controlSchema`: the runtime gates a section through `RenderInput.visibility`, and a declared control would stamp a
  second, inert copy of the value on the root (DW-186).

**Never:**
- Never persist anything. `project_templates` is not written before Story 5.8; every edit here lives in the editor's
  `useState` for the session, and a reload starts from the stored doc.
- Never make a Layers row's press deselect, and never make the top bar a ground (R-123's second half).
- Never reorder a site-wide section against a page section: the card boundary is the rule, and B7 draws no line.
- Never build the design arrows, the hairline "+", "+ Add section", View as, or the Section Picker's refusal surface —
  they are 5.11, 5.10 and 5.14's. This story provides the refusal *rule*, not the picker that shows it.
- Never change `sectionRoots`, `takeStamps`, `stampControls` or the chrome-layer contract; a hidden section reaches
  them as the empty render they already handle.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Press a row | Home, nothing selected | That section is selected: canvas outline, row in coral tint, panel headed by its layer name. The selection is NOT lost by the press | N/A |
| Press below the rows | a section selected | Deselected, editing ended — R-123's third ground. Its geometry is read from the last **row**, not the list's last child, which is no longer the same element | N/A |
| Press a group heading (or, until R-126 removed it, the footed note) | a section selected | The selection stays: only the empty space below the rows is a ground (R-123 as amended). **Amended by R-126 (owner, 2026-09-18):** the note is gone, so a group heading is the one non-row surface left to press | N/A |
| Drag a row | 3 page rows, grip pressed on row 1 | Row 1 lifts; a dashed slot the row's height shows where it lands; rows between slide; nothing moves until the drop, then the canvas repaints in the new order | A drop outside the row's own group returns without a change |
| `⌥↓` on a focused row | row 1 of 3 focused | The section moves to position 2, focus follows it, and "Moved to position 2 of 3" is announced politely | At the last position the key does nothing |
| `Space` on a focused row | row shown | Hidden: the section leaves the canvas and the row's words go ink-soft. **Amended by R-126 (owner, 2026-09-18), which renegotiated this frozen row:** the eye is no longer on the row, so what reads as hidden is the ink-soft name plus the row's `⋯` menu offering Show. The key itself is unchanged | N/A |
| Hide every section | all page rows hidden | The canvas draws an empty page; the template is still *designed* (`isDesigned` true), never untouched | N/A |
| Delete the last section | one page row | The row goes, the page group shows its count as 0, and only the Site-wide card remains (EXPERIENCE § State Patterns, UX-DR6) | N/A |
| Duplicate a page section | Newsletter selected | A copy with a new `instanceId`, the same layer name and the same stored values lands directly after it (the precedent `duplicateItem` sets) | N/A |
| Duplicate a site-wide section | Header — Rail | Duplicate is **absent** from that row's menu and from its pill — it is one shared instance (FR-D5) | N/A |
| Delete / hide a site-wide section | Header — Rail | A confirm in the app's one dialog vocabulary, focus on Cancel, naming that it affects every template | Cancel changes nothing |
| A second Post Content | a doc already holding an `a25/…` | `placementRefusal` returns "this layout already prints the article"; Duplicate refuses with it (R-37, FR-I1) | The sentence is shown where the action was pressed |
| A non-placeable design in a doc | `a32/…`, `a33/…` or `a34/…` | `editorData` throws a sentence naming the instance — a treatment is chosen outside the canvas and never placed, so it can never reach Layers | The app's error boundary shows it |
| Member visibility ≠ Everyone | Newsletter set to Paid members | The section is not drawn (the canvas previews an anonymous visitor); its Layers row stays, and the control says why | N/A |
| Pointer moves from the section onto the pill | pill showing | The hover and the pill stay — the canvas document's `pointerout` with a null `relatedTarget` must not clear a hover the pointer is still inside | N/A |
| The canvas scrolls | pill showing | The pill hides on the first `scroll` and is placed again 150 ms after the last, like P0-1's toolbar | N/A |

</frozen-after-approval>

## Code Map

- **The doc and its rules**
  - `packages/section-runtime/src/doc-schema.ts` — `instanceSchema` (:22-31) is a `z.strictObject`, so this story's two
    fields are added HERE, in the same change as the writer (the file's own header says so). **Both must be
    `.default(…)`, never required:** every stored doc — the seeded one included — lacks them, and a required field
    would fail `parseDoc` for the whole editor. `docSchema` (:32-44) and its unique-`instanceId` refine are unchanged.
    `MEMBER_STATES` comes from `@inflozo/library` through `core.ts:29` and is `everyone · anonymous · free · paid`.
  - `packages/section-runtime/src/core.ts` — `RenderInput.visibility` (:200-202) **already exists and already works on
    both emitters** (Story 4.10): `gateMembers` (:1484-1500) removes the root on the canvas when the handed visitor is
    not the audience, and wraps it in Ghost's own `{{#if @member}}` on the theme. `refuseConditionsAndMembers`
    (:1453-1470) refuses a root that carries both a `data-members` and a `visibility`. Nothing in the runtime changes.
  - `packages/section-runtime/src/controls.ts` — `moveItem` (:469-479) is the announce wording to reuse verbatim:
    `Moved to position ${to + 1} of ${items.length}`. `duplicateItem` (:448-455) sets the precedent for where a copy
    lands: directly after its original, same values.
  - `packages/library/src/vocabulary.ts` — `pillRefusal` (:195-203), `PILL_CHARS` 12, `PILL_TRACK` 233.
    **Executed while planning:** `pillRefusal(['Everyone','Logged out','Free','Paid'])` returns `"Logged out" is wider
    than one of 4 pills` (widths 54 · 66 · 25 · 25 against a 58.3 px pill), and so does the four-word set. R-114
    therefore makes Member visibility a **named select**, which is what `A22-1 Inline Row.dc.html:69` draws.
  - `packages/library/src/registry.ts` — `SectionRegistryEntry` (:155-…): `id` is `{category}/{n}`, `tier` is
    `free | pro`, `compileTarget` is a set. There is **no** placeable flag; A32/A33/A34 and A25 are named in
    `sections-inventory.md` (:30, :594, :860) and nowhere in code yet.
- **The editor**
  - `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` — the whole story lands here:
    - the header comment (:28-84), whose ABSENT list (:77-82) names "Layers' grip, eye, thumbnails and a pressable
      row (5.4)" and "the hover pill's Duplicate, Delete and drag handle (5.4)" — both lines come out in this change.
    - `Placed`/`Pick`/`same`/`stackOf` (:127-137) and `canvasStack` in `lib/editor.ts:47-51`; `latest` (:201-202),
      `mark` (:205-212), `choose` (:213-222), `point` (:223-228).
    - `paint()` (:229-268) — `renderSection(… visibility: 'everyone' …)` (:252) is the hardcode this story replaces;
      a hidden instance must render `''` so `sectionRoots` (`lib/selection.ts:12-15`) yields its null root.
    - `wire()`'s `pointerout` (:451-453) clears the hover on a null `relatedTarget` — the trap the pill must not fall
      into; the `scroll` listener (:436-446) sets `scrolling` **only while a field is being edited** and must also
      fire while the pill shows.
    - the Layers `<aside>` (:642-670): `stack.map` (:665-667) becomes B7's two groups, and the mono
      "This page · {label}" line (:650-652) moves into B7's own group header, which is where B7 prints it.
      **R-123's third ground (:659-662) has to be re-anchored, not merely kept:** it reads
      `lastElementChild.getBoundingClientRect().bottom`, and the list's last child stops being the last row the moment
      the page group is inside it (and, since R-126 removed the note, the rename dialog is the list's last child).
    - the chrome layer (:565-603): `place(el, root, scale, how)` with `'fill' | 'top-left' | 'top-right' | 'above'`,
      kept on its root by a `requestAnimationFrame` loop. **The pill cannot live here** — a React portal into the
      canvas document gets no React events — which is why AD-21 puts pressable chrome outside.
    - `badge` (:718-726) is R-119's `ProBadge`, placed `'top-right'` 8 px inside; `onChange` (:606-628) is the one
      place a control change stamps rather than repaints.
  - `apps/web/app/(app)/app/(authed)/projects/[id]/read.ts` — `editorData` (:55-…) checks every instance's design
    loudly (`entry.compileTarget.includes(file)`, :77-79); the non-placeable refusal joins it there.
  - `apps/web/lib/canvas.ts` — `renderSection` (:38-71) already takes `visibility: MemberState`; only its caller changes.
  - `apps/web/lib/selection.ts` — `sectionRoots` (:12-15) maps `''` to a null root; `withState` (:45-60) is the
    doc-update shape to follow for the new operations.
- **The parts to mount, not redraw**
  - `apps/web/components/kit/layers-row.tsx` — `LayersRow`'s `interactive` branch (:42-58) already draws grip, thumb,
    name button and eye; `SiteWideGroup` (:73-…) already draws the pinned white card with its count. Both are
    Story 1.3's and have never been used. **Two corrections this story makes:** the card's icon is `DragGrip`, which
    promises a drag the card does not have (B7's note: site-wide sections cannot be reordered against page sections)
    — moot since R-126 took the card and its glyph away altogether; and D8e's focus ring belongs on the ROW, over
    whichever state it is in, not on the name button alone.
  - `apps/web/components/controls/item-list.tsx` (:104-190) — the app's one drag gesture, built to the owner's
    finding 9: `layout.current` captured at `pointerdown`, `shift(i)`, `slotTop`, the `to` computed from how many
    other rows' middles the dragged row's middle has passed, `setPointerCapture`, the 2° tilt under `motion-safe`, and
    `⌥↑`/`⌥↓`. The maths is what Layers needs; the `ControlState` plumbing is not.
  - `apps/web/components/kit/dialog.ts` — `sheet`, `title`, `openOnCancel` (focus on `[data-cancel]`),
    `closeOnBackdrop`. `apps/web/app/(app)/app/(authed)/project-menu.tsx` (:14-27, :303-340) is the nearest built
    example of a ⋯ menu carrying Rename · Duplicate · a rule · Delete with an S12c-shaped rename dialog behind it.
  - `apps/web/components/kit/select.tsx` `Menu` + `apps/web/lib/menu.ts` `openMenu`/`arrowKeys` — the menu vocabulary.
  - `apps/web/components/kit/icons.tsx` — `Grip` (:255), `Eye`/`EyeOff` (:81, :87), `Copy` (:332), `Trash` (:94),
    `Globe` (:305), `Pencil` (:119). No new glyph is needed.
  - `apps/web/components/controls/sidebar.tsx` — `model.groups.map` (:308-328) draws one `Accordion` per group;
    `SIDEBAR_GROUPS` (`vocabulary.ts:154`) puts `settings` first.
- **Frames, read**
  - `B Missing Surfaces.dc.html` B7 (:1538-1580): the card (white, `#E7E2DB`, radius 10, padding 9) with its header
    row — a glyph, `SITE-WIDE` at 10/600 with `0.04em`, and a mono right-aligned template count; then
    `THIS PAGE · HOME` at the same weight with the section count in mono; the selected row in `#FFEDE8`/`#C2381F` at
    600 with its eye; a hidden row (`About, short`) in `#6B6459` with eye-off; and a footed note above a hairline:
    "Editing a site-wide section changes it on all N templates. We say so the first time, then stop."
  - `D8 Editor Below 1440.dc.html` D8e (:368-400): REST · FOCUSED, HOVER · THE WASH (the 40 % coral wash, with the
    eye), SELECTED · FOCUSED — the ring is `box-shadow:0 0 0 2px #C2381F` on the row, over whichever state it is in.
  - `S4 Editor.dc.html` S4b (:181): the pill at `top:10px;right:10px` — white, `1px #E7E2DB`, radius 24, the `md`
    shadow, 3 px padding, 26 px round targets with `#FFEDE8` on hover, icons at 13 px and the grip at 10×13.
  - `A22-1 Inline Row.dc.html:69` — Member visibility drawn as a 36 px named select. `A4-13 Latest Post.dc.html:256`
    draws it as a four-way pill row with the hint "Who sees the whole section."; R-114 (which post-dates the export
    and deliberately did not touch it) turns that set into a select.
  - `A22 Newsletter - Spec.md:291` — `memberVisibility` (Member visibility), enum required: **Everyone (default) ·
    Logged out · Free members · Paid members**, scope SECTION, compiled server-side; `:171-173` — "Both are in the
    panel, one under the other, and the panel says which is which."
- **Ledger** — `deferred-work.md` DW-163 (:3915-3929) is this story's to close; DW-107 and DW-122 have no owner and
  stay open.

## Tasks & Acceptance

**Execution:**

- [x] `packages/section-runtime/src/doc-schema.ts` -- add `hidden: z.boolean().default(false)` and
      `memberVisibility: z.enum(MEMBER_STATES).default('everyone')` to `instanceSchema`, with a comment saying why each
      is defaulted rather than required -- the schema is strict at both levels, so a required field would break every
      stored doc on the next read.
- [x] `packages/library/src/placement.ts` (new) + `index.ts` -- `NON_PLACEABLE` (A32, A33, A34 — the treatments
      `sections-inventory.md` § Placeable sections vs non-placeable treatments names), `POST_CONTENT` (A25),
      `isPlaceable(designId)` and `placementRefusal(designId, present)` returning
      `this layout already prints the article` for a second Post Content and `null` otherwise -- the rules FR-D5 and
      R-37 state in prose exist nowhere in code, and Story 5.10's picker calls the same function.
- [x] `packages/library/src/placement.test.ts` (new) -- the matrix's placement rows: each non-placeable category
      refused, a first `a25/…` allowed and a second refused with the sentence, an ordinary design unaffected.
- [x] `packages/section-runtime/src/doc-edit.ts` (new) + `index.ts` -- one pure module over `ProjectDoc`:
      `moveSection`, `duplicateSection`, `removeSection`, `renameSection`, `setHidden`, `setMemberVisibility`, and
      `isDesigned(doc)` (`instances.length > 0`). Each returns the next doc or a refusal sentence; `moveSection`
      returns `{ doc, announce }` in `moveItem`'s exact wording -- one place decides what a section operation means,
      so 5.8's journal and Epic 7's compiler read the rules rather than re-deriving them.
- [x] `packages/section-runtime/src/doc-edit.test.ts` (new) -- every operation and every refusal, including: hiding
      every instance leaves `isDesigned` true and removing them all makes it false; a duplicate carries a new
      `instanceId` and lands directly after its original; a rename refuses an empty or blank name.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/read.ts` -- refuse a non-placeable design beside the existing
      `compileTarget` check, in the same sentence shape -- a treatment can then never reach Layers, by construction.
- [x] `apps/web/lib/reorder.ts` (new) + `apps/web/reorder.test.ts` (new) -- lift the drag geometry out of
      `item-list.tsx` unchanged: `captureLayout(rows)`, `shift(drag, i)`, `slotTop(drag, layout)` and
      `landingAt(layout, from, pointerY, startY)` -- one gesture, one implementation (standing rule 3); the owner's
      finding 9 governs every list, and a second copy is how they drift apart.
- [x] `apps/web/components/controls/item-list.tsx` -- call `lib/reorder.ts` in place of its inline maths, with no
      change in behaviour -- proved by `controls.test.ts` and the controls harness staying green.
- [x] `apps/web/components/kit/layers-row.tsx` -- make the interactive row the story's row: D8e's focus ring on the
      ROW (over rest, wash or tint), the grip `aria-hidden` and pointer-only (its keyboard path is the row's
      `⌥`-arrows), the hidden row's words `text-ink-soft`, and the `…` overflow. **Delivered as R-126 amends it
      (owner, 2026-09-18):** the eye is not on the row at all — Hide/Show leads the `…` menu — the name is drawn at
      `text-helper-caption`, and `SiteWideGroup` is no longer a card with a glyph but the page group's own shape with
      a hairline under it.
- [x] `apps/web/components/controls/layers.tsx` (new) -- B7's panel body **as R-126 amends it**: the `SITE-WIDE`
      group with the derived template count and its rows, a hairline, then the `THIS PAGE · {label}` group with its
      own derived count, both drawn the same; the dashed landing slot; the `↑ ↓ / ⌥↑ ⌥↓ / Enter / Space` key handling
      with roving tabindex; a polite `aria-live` for the move; the `…` menu (Hide/Show · Rename · Duplicate · Delete,
      Duplicate absent on a site-wide row); and the S12c-shaped rename dialog -- one component, so `editor.tsx` keeps
      its shape. *(As first written this task named the pinned card, its glyph and B7's footed note; R-126 removed all
      three on the deployed story.)*
- [x] `apps/web/components/controls/section-pill.tsx` (new) -- S4b's quick-action pill in the editor document,
      anchored to the hovered section's on-screen rect through the frame's rect and the fit: Duplicate (absent on a
      site-wide section), Delete, and the drag grip. **R-125: the Pro tag keeps the corner it was given at 5.2 and the
      pill sits directly to its left** — its right edge a gap short of the badge's left when the badge is showing,
      S4b's 10 px inset from the section's right when it is not. It hides from the first canvas `scroll` and is placed
      again 150 ms after the last, and holding the pointer over it keeps the hover -- R-118 gives it these three
      controls and no others.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` -- wire it: the two new components, one `docs`
      update path per operation through `doc-edit.ts`, `renderSection`'s `visibility` fed from the instance, a hidden
      instance rendering `''`, the site-wide confirm dialogs, the `pointerout` guard and the `scroll` listener firing
      for the pill as well as for an edited field; delete the two ABSENT lines this story fills and record what it
      built in the header comment -- that comment is the file's map and is read before the code.
- [x] `apps/web/components/controls/sidebar.tsx` -- take an optional `visibility` prop and draw Member visibility as
      R-114's named select at the head of **Section settings**, with A22's four values (Everyone · Logged out · Free
      members · Paid members), its drawn hint, and a second hint line when the chosen audience is not the one the
      canvas previews. Where a design declares no other Section-settings row, the group is drawn for this row alone,
      first, as `SIDEBAR_GROUPS` orders it -- R-124 (owner, 2026-09-18) puts it here and not in Layers.
- [x] `tools/probe/run-verify-editor.cjs` -- add the story's steps from 28 on, inside step 5's CSP session so the
      no-`unsafe-eval` zero is read after them (the spine's rule for every Epic 5 story that adds a gesture), and add
      a Layers-and-pill state to the axe pass at step 8. Measure the pill against step 15's scroll capture, as the
      epic context directs.

**Acceptance Criteria:**

- Given the Home canvas, when the Layers panel is drawn, then it matches B7 **as R-126 amends it**: a `SITE-WIDE`
  group and a `THIS PAGE · HOME` group drawn in the SAME shape — heading, right-aligned mono count, rows — divided by
  one hairline, with no card, no glyph and no footed note. Each count is derived; `Site-wide` and its template count
  sit on one line.
- Given a Layers row, when it is at rest, hovered, selected, or holds keyboard focus, then it **matches D8e** — and a
  focused-and-selected row reads as both, because the ring is drawn over the state the row is already in.
- Given a hovered section on the canvas, when the pill is drawn, then it **matches S4b**'s group at
  `top:10px;right:10px` carrying Duplicate, Delete and the drag grip — and neither `◀ ▶` nor a divider, which are
  Story 5.11's (R-118).
- Given a section selected by pressing its Layers row, when the press lands, then the selection is made and not lost —
  and a press on the empty space below the rows still lets it go (R-123 as amended).
- Given a row dragged by its grip, when the pointer moves, then nothing in the doc or on the canvas changes and a
  dashed slot the row's height shows where it will land; on the drop the doc changes once and the canvas repaints.
- Given a focused row, when `⌥↑` or `⌥↓` is pressed, then the section moves one place, focus follows it, and the move
  is announced politely in `moveItem`'s words.
- Given a section hidden from its row's `⋯` menu (R-126), when the canvas repaints, then that section is not drawn,
  its row's words are ink-soft and its menu now reads Show, and the instance is still in the doc. `Space` on the
  focused row does the same thing, the eye having left the row and not the keyboard.
- Given every section on a template hidden, when the doc is read, then the template is still designed; given every
  section removed, then it is not.
- Given a site-wide section, when its row menu or its pill is opened, then Duplicate is absent; when Delete or Hide is
  chosen, then a confirm opens with focus on Cancel, naming that it affects every template.
- Given a doc already holding a Post Content section, when a second placement is asked for, then `placementRefusal`
  answers "this layout already prints the article" and nothing is placed.
- Given a doc naming an A32, A33 or A34 design, when the editor reads it, then it throws a sentence naming the
  instance rather than showing that design in Layers.
- Given a CTA-bearing section, when it is selected, then Member visibility is the first row of the panel's **Section
  settings** and nothing about it is drawn in Layers (R-124); when its audience is set to anything but Everyone, then
  the canvas stops drawing it, its Layers row stays, and the control says why the canvas is empty there.
- Given a Pro design selected on a Free plan and hovered, when both the Pro tag and the pill are drawn, then the tag
  is exactly where R-119 put it — 8 px inside the section's top-right — and the pill sits to its left, neither
  overlapping the other (R-125).
- Given the canvas is scrolled while a section is hovered, when the scroll starts, then the pill hides; 150 ms after
  the last scroll event it is placed again on its section, with no frame in which it sits away from it.
- Given any `⋯` menu in the app, when it opens beside a trigger closer to a window edge than the menu is wide, then no
  part of it is off screen — `openMenu` clamps both edges, not only the one it anchors (R-126, the owner's finding).
- Given a Layers row, when its name is drawn, then it is at the caption size and the row carries the `⋯` and nothing
  else, so the name has the width to say itself without truncating (R-126).
- Given `pnpm check`, when it runs, then every new test passes and no existing one changed meaning.

### Review Findings

Five layers on 2026-09-18 (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra verifier)
over the diff since `0aa7cd10`; 8 dismissed as noise or unreachable. Patches applied at Review, in the same phase:

- [ ] [Review][Decision] A drop past the end of a row's own group: land at the end (as it does, and as every list does) or snap back (as the frozen matrix row says)? — Question 4 under `## Questions for the owner`.
- [x] [Review][Patch] The CSP recorder was no longer attached to the main harness session, so step 5's zero was vacuous and its control could only fail — restored, with the history in a comment [tools/probe/run-verify-editor.cjs:153]
- [x] [Review][Patch] Step 27 still pressed B7's footed note, which R-126 removed, and threw before any Story 5.4 step — the entry dropped; step 28 asserts the note's absence [tools/probe/run-verify-editor.cjs:1190]
- [x] [Review][Patch] Step 29 counted every `button` in the row, the closed ⋯ menu's included, against "name · More" — scoped to the row's own children [tools/probe/run-verify-editor.cjs:1263]
- [x] [Review][Patch] The Member visibility second hint said the section was not drawn for every audience but Everyone — wrong for "Logged out", which the canvas previews and draws; now shown only when the audience is not the previewed visitor, and step 37 checks it [apps/web/components/controls/sidebar.tsx:353]
- [x] [Review][Patch] A press on a row's name left focus on the `tabIndex=-1` button, so ⌥-arrows, Space and Enter did nothing after a click — the press now focuses the row, and the button's ring class goes with it [apps/web/components/kit/layers-row.tsx:89]
- [x] [Review][Patch] The rename field kept abandoned text when the same row was renamed again after Cancel — `renaming` is let go on close so the field remounts [apps/web/components/controls/layers.tsx:343]
- [x] [Review][Patch] The menu's DOM id and the rename field's key used the bare `instanceId`, which the file's own comment says is unique per doc, not across the two groups — keyed on `{doc}:{instanceId}`, harness selectors following [apps/web/components/controls/layers.tsx:206]
- [x] [Review][Patch] The layout was captured in a layout effect AFTER the render that started the drag, so the slot's first frame read the previous drag's numbers — one re-render before paint after the measure [apps/web/components/controls/layers.tsx:154]
- [x] [Review][Patch] The roving tab stop did not follow a canvas selection, so Tab into Layers landed on the first row — it prefers the selected row until a key steps it [apps/web/components/controls/layers.tsx:141]
- [x] [Review][Patch] `kit/visibility.tsx` gained `onToggle`/`tabIndex` and a comment about a Layers row that no longer uses it — reverted to the baseline; `rowRef` on `LayersRow` was declared and never passed — removed [apps/web/components/kit/visibility.tsx, layers-row.tsx:43]
- [x] [Review][Patch] `carriesMemberVisibility` had no unit test — four cases added [apps/web/pilots.test.ts]
- [x] [Review][Patch] The template count was derived twice in `editor.tsx`; the confirm's body said "every page" then "all N templates" — one constant, one word [apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx:121]
- [x] [Review][Patch] The canvas pill's grip drag had no check anywhere — step 35 now holds it past the next section, asserts the slot in Layers and nothing reordered, then the reorder and the announce on the drop [tools/probe/run-verify-editor.cjs:1462]
- [x] [Review][Patch] Stale text against R-126 in `editor.tsx`'s header, `layers.tsx`'s comments, the harness header and step comments, and this spec (Intent, one matrix row, Code Map, two tasks, Design Notes, manual test 8, Verification) — corrected; DW-183's ledger text repeated the wrong root cause — corrected
- [x] [Review][Patch] R-126's outstanding targets (`EXPERIENCE.md`, `DESIGN.md`, `epic-5-context.md`), which the ruling assigns to this Review — propagated and ticked
- [x] [Review][Defer] A pill-grip drag over a site doc whose doc order differs from canvas order measures the landing in canvas order — the site doc holds one instance today [apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx:155] — deferred, DW-189
- [x] [Review][Defer] A refusal on a hidden or gated section has no root to show its sentence on — reachable only through R-37's Post Content refusal, and no A25 design exists yet [apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx:232] — deferred to Story 5.10, DW-190

## Design Notes

### "Live canvas follow" and "nothing reorders until the drop" are not in conflict

FR-D5 and this story's card in `epics.md` say a drag reorders "with the canvas following live"; EXPERIENCE.md :308
says "nothing reorders until the drop", of Layers by name. The second is the later and more specific of the two: it is
the owner's own finding 9 of 2026-09-13, taken on Story 4.5 and written to cover *every* editable list. So the canvas
follows the drop with no save step between, and the dashed slot is what follows the pointer. Recorded here rather than
asked, because the owner has already ruled the general case.

### Why the two new instance fields are defaulted, and why `memberVisibility` is not a control

`docSchema` is strict at both levels on purpose — "a field this schema does not name fails loudly rather than being
dropped". The corollary is that a *required* new field fails just as loudly for every doc written before it, which is
every doc that exists. `.default(…)` keeps the input optional and the output total, so `DocInstance.hidden` is a
`boolean` everywhere downstream and no reader needs a `?? false`.

`memberVisibility` is an instance field and not an entry in a design's `controlSchema` because the runtime already
gates a section through `RenderInput.visibility`, which `renderCanvas` and `renderTheme` both honour (Story 4.10). A
declared control would additionally stamp `data-member-visibility` on the root through `stampControls` — a second copy
of the value that nothing reads and that would drift. The category specs list it in their control tables (A22's
:291); what they are describing is the panel ROW, and the row is what this story draws.

### The one drag, in one place

`item-list.tsx` already holds the gesture the owner approved: the slot, the slide, the pointer capture, the tilt, the
`⌥`-arrows. Layers needs the same gesture over different data. Copying the maths would give the app two
implementations of one owner ruling, which is precisely what standing rule 3 forbids; so the geometry moves to
`lib/reorder.ts` and both lists call it. The pointer handlers stay with each list, because what they commit differs.

### Where the pill lives, and the two traps it walks into

AD-21's amendments settled that non-pressable chrome is painted inside the canvas layer and everything pressable is
outside it. The pill is pressed, so it is outside — and a React portal into the canvas document would not give it
events in any case, since React's delegation is attached in the editor document. Being outside costs it two things,
both already solved once: it trails the compositor during a scroll (so it hides and re-places exactly as P0-1's
toolbar does), and the pointer crossing from the iframe onto it reaches the canvas document as a `pointerout` with a
null `relatedTarget`, which today clears the hover. The second needs a guard the toolbar never needed.

### The counts, and the one word the frame does not draw

B7 prints "on all 9 templates" and a page count of 6. Neither number is written down: the template count is
`Object.keys(CANVASES).length` from `lib/editor.ts` — the canvases the editor opens today, which grows on its own as
Story 5.5 opens more — and the page count is the group's own rows. FR-D5 calls the card's mark "a globe badge"; B7
draws an arrow-on-a-stem the Kit has no glyph for. The Kit's `Globe` was used at Dev — and **removed by R-126**
(owner, 2026-09-18, finding 5): the group has no glyph now, and the word `Site-wide` in the heading is the mark.

### What is deliberately not built

Hovering a Layers row does **not** outline its section on the canvas — the mirroring Story 5.2 built runs one way and
nothing asks for the other (DW-188). B7's note was drawn always rather than "the first time, then stop" (there was no
per-user memory to remember a first time in before Story 5.8), and then **R-126 removed the note itself**, which
closed DW-184 rather than deferring it.

## Verification

**Commands, and what each returned.** Run on this machine at the Dev phase against the real services (R-82); a key is
named by its variable and never printed.

- `pnpm check` -- **exit 0.** Every package suite green: `@inflozo/library` 149/149 (its new `placement.test.ts` among
  them), `@inflozo/theme-compiler` 1/1, `@inflozo/ghost-shim` 34/34, `@inflozo/section-runtime` 178/178 (the new
  `doc-edit.test.ts` and the two `doc-schema.test.ts` cases for the defaulted fields), `apps/web` 343/343 (the new
  `reorder.test.ts`), and the render-matrix suite 8/8 — `fail 0` in every one. `agreement.test.ts` and `ad36.test.ts`
  ran unchanged inside `section-runtime`'s count.
- `bash supabase/tests/run-rls-gate.sh` -- **exit 0**, the gate's every `PASS` and no abort. Nothing in this story
  touches the schema: `project_templates.doc` is `jsonb` and both new fields live inside it, so there is **no Schema
  phase** (R-99). The gate is the control that the story did not move the database under the code.
- `python3 tools/doc-audit.py --check` -- **exit 0, twice**, `documentation gate: PASS (0 warning(s))` both times.
- `python3 -c` over `packages/library/control-groups.json` -- executed rather than asserted (standing rule 1), because
  which categories carry R-124's row decides where the new control is drawn: **ten** categories file `Member
  visibility` under `settings` — `a4` and `a22` among them, `a1`, `a17` and `a24` not. Both pilots the owner's test
  uses therefore behave as the test script says.

**The real services this story's push hit (R-82).**

- **GitHub Actions**, read with `GITHUB_TOKEN`: the Dev commit `2f43fc1c` and the board commit `308043ca` each ran
  workflow **CI** to `success` with all three jobs green — `check`, `rls`, `deploy` — and **Render matrix** to
  `success`. A red gate would have skipped `deploy` and published nothing (DW-7).
- **Vercel**, read with `VERCEL_TOKEN` / `VERCEL_TEAM_ID` / `VERCEL_PROJECT`: the production deployment for both commits
  is **READY** (`2f43fc1c` and `308043ca`), so `app.inflozo.com` serves this story's code now.
- **Supabase** is reached by the editor harness below, through `SUPABASE_URL` / `SUPABASE_SECRET_KEY`.

**The deployed editor harness** — `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' \
tools/probe/.env | xargs) OUT_DIR=… node tools/probe/run-verify-editor.cjs`, against the deployed `app.inflozo.com`
and the live Supabase, each run refusing to start unless the served deployment is this checkout's HEAD. Run at Dev
rather than waiting for Review, because a step written and never executed proves nothing.

| run | result | what it said |
|---|---|---|
| 1 | **3 FAIL, 220 PASS** | every Story 5.4 step passed but three assertions. All three were the CHECK disagreeing with deliberate behaviour, not the product: step 29 read the `focus-visible` ring after a PROGRAMMATIC `.focus()`, which correctly draws none (the owner reaches it by Tab); step 36's two measured the pill 10px below a corner that had scrolled above the canvas card, where the clamp — the matrix row's own "like P0-1's toolbar" — deliberately puts it at the card's edge instead. |
| 2 | **0 FAIL, 201 PASS** | with those two corrected: the ring reached by keyboard reads `rgb(194, 56, 31) 0 0 0 2px` over the coral tint, and the pill is **0.0px outside its section in every frame** of a real 1080px wheel scroll (100 frames, 29 hidden, 71 placed). Stopped afterwards on a 30s signed-in stall — DW-183, its third observation. |
| 3 | 1 FAIL, 203 PASS | the DW-183 retry under test; withdrawn (below). |
| 4 | **0 FAIL, 83 PASS** | stopped at a signed-in `goto` that exceeded 60s twice. |
| 5 | 1 FAIL, 222 PASS | the complete walk, no stall; the one FAIL is step 5's own control, which is why the retry was withdrawn. |
| 6 | **0 FAIL, 83 PASS** | the reverted tree. Stopped at step 16's signed-in `goto` — the same call site as run 4 — before reaching step 5's control, so it neither confirms nor disputes it. |

**What the harness established on the deployed site** *(runs 1–6, all BEFORE R-126 changed the panel; the run on the
final tree is under **At Review** below)*. B7's card, groups and footed note, with both counts DERIVED —
it read `on all 6 templates` from the canvases `lib/editor.ts` opens and `3` from the group's own rows, and after
removing every page section the same span read `0`. A press on a row selects without deselecting, and a press on a
group heading or on B7's footed note keeps the selection while the empty space below the rows lets it go (R-123 as
amended, all four grounds). D8e's four states. Hide and Show, and `Space` on the focused row. `⌥↓`/`⌥↑` with
`Moved to position 3 of 3` announced politely and focus following. The drag showing a dashed slot the row's own height
with nothing reordered until the drop. The `⋯` menu — `Rename · Duplicate · Delete` on a page row and
`Rename · Delete` on the site-wide one — and the rename dialog opening on Cancel and refusing a blank name. The
site-wide confirm, focused on Cancel, naming all 6 templates, reached from the row AND from the pill. S4b's pill:
white, 1px, radius 24, 3px padding, carrying exactly Duplicate, Delete and the grip, **10px inside the section's
top-right**, keeping the hover when the pointer crosses onto it from the iframe. **R-125 measured: the Pro tag's right
edge is 8.01px inside the section's right (R-119 untouched) and the pill's right edge sits 6.02px to its left,
neither overlapping.** R-124's Member visibility as the first Section-settings row reading `Everyone`, with A22's four
values in a named select, nothing about it in Layers, and the section leaving the canvas when set to Paid members
while its row stays. A reload restoring the stored doc, nothing persisted. Zero axe violations at WCAG 2.1 AA with the
pill showing and a row's menu open. Both throwaway accounts deleted, `users 9 → 9`.

**The one thing the harness has NOT established for the final tree, stated plainly.** Step 5's CSP session zero is a
result only when its own control passes — the control plants two `new Function('')` refusals and requires the recorder
to see both (standing rule 2). It passed in runs 1 and 2, covering these gestures. It failed in runs 3 and 5, both of
which carried an experimental DW-183 retry; that retry has been **withdrawn** (it also broke `page.goBack` and could
re-spend the single-use magic-link token). *As written at Dev this paragraph went on: "and the harness is back to the
shape whose control passed". **That was wrong, and Review found why** (below): the retry commit had deleted the one
line that attaches the CSP recorder to the main session, and the withdrawal did not put it back — so the control
failed for a reason that had nothing to do with retrying, and would have failed on the reverted tree too.*


**At Review (2026-09-18) — five layers over the diff since `0aa7cd10`, and the real services hit again (R-82).**

- **GitHub Actions**, read with `GITHUB_TOKEN`: HEAD `035b2ba0` ran **CI** to `success` (`check`, `rls`, `deploy`
  all green) and **Render matrix** to `success`; the same for the four commits before it. Negative control: a bogus
  value in place of `GITHUB_TOKEN` → HTTP 401.
- **Vercel**, read with `VERCEL_TOKEN` / `VERCEL_TEAM_ID`: the production deployment of `app.inflozo.com` is **READY**
  and its `githubCommitSha` is HEAD. Negative control: a bogus token → HTTP 403.
- **Supabase**, read with `SUPABASE_URL` / `SUPABASE_SECRET_KEY` (R-99): `git diff 0aa7cd10..HEAD -- supabase/` is
  empty and the live `project_templates` columns are `doc, project_id, template_key, updated_at, user_id` — both new
  fields live inside `doc`, so production's schema is as new as the code. **Never persisted, held:** the owner's
  "Pilot sections" docs (home 3, post 1, site 1 instances) carry no `hidden` and no `memberVisibility` anywhere, and
  their `updated_at` predates the story's first deploy. Negative control: a bogus secret → HTTP 401.
- **The deployed harness, run 7 — on HEAD `035b2ba0` as deployed: `0 FAIL, 139 PASS, aborted (exit 2)`** at step 27,
  `TypeError: Cannot read properties of undefined (reading 'getBoundingClientRect')` — the step still pressed B7's
  footed note, which R-126 had removed. Deterministic, not DW-183; both accounts deleted, `users 9 → 9`. So **no
  Story 5.4 step had executed on the tree under review, and step 5's control had not passed** — and reading the
  harness showed the second reason it could not have: `ad50f413` (the DW-183 retry) deleted
  `await recorder(context, violations)` and `35a17b53` (its withdrawal) never restored it, so the main session's
  `violations` had no writer. Both are patched below; **run 8, on the patched tree once deployed, is recorded under
  `## Review run` at the end of this section.**
- `pnpm check` on the patched tree — recorded with run 8.

**Manual checks:**

- The pill measured against step 15's screencast: in every captured frame of a synthesized scroll gesture it is either
  hidden or on its section — never between the two.
- `packages/library/designs/` holds no A25, A32, A33 or A34 design, so the Post Content refusal and the non-placeable
  refusal cannot be exercised on the deployed editor. They are proved by unit test alone (`placement.test.ts` and
  `doc-edit.test.ts`), and the owner's test does not ask for them.
- DW-183: a harness run that stops on a 30-second Playwright timeout at a signed-in navigation, with 0 FAIL, is that
  ledger entry and not a fault — re-run it. This story adds steps, so it is the story DW-183 names: if a third stall
  happens here, record which step it was and close DW-183 with the pattern.

**Matrix coverage at Dev.** Every doc rule in the I/O matrix — the two singletons, hide-is-retained, `isDesigned`,
where a duplicate lands, the rename refusal — is covered by a unit test that RAN and passed above. Every rule that is
a gesture on a screen is covered by a harness check, and the harness is the run recorded here.

## Owner's manual test

The project is the "Pilot sections" project Story 5.1's Deploy added to your account; Deploy re-checks its address.
Sign in as you normally do. Nothing you change here survives a reload — saving arrives with Story 5.8.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the list on the left. | — | At the top, SITE-WIDE with "6 templates" on the **same line** and "Header — Rail" under it; a thin line; then "THIS PAGE · HOME" with its own count and three rows — both groups drawn the same way, no box, no globe, and no sentence at the foot. *(Your changes of 2026-09-18, R-126.)* |
| 2 | same | Layers | Press the row "Post Grid — Three Up". | — | The section is selected on the page, the row turns coral, and the right-hand panel is headed by its name — exactly as clicking the section does. |
| 3 | same | Layers | Drag "Newsletter — Inline Row" by the six dots on its left, up above "Post Grid — Three Up", and let go. | — | While you drag, a dashed empty box shows where it will land and the other row slides out of the way; nothing on the page moves until you let go, and then the page redraws in the new order. |
| 4 | same | Keyboard | Press Tab until a row has a coral outline all the way round it, then press the down arrow twice, then hold Option (or Alt) and press the up arrow. | — | The outline moves down one row at a time. Option-up moves the section itself one place up, and the page follows. |
| 5 | same | Layers | Press the "…" beside "Post Grid — Three Up" and choose **Hide**. Then open "…" again and choose **Show**. | — | The section disappears from the page and the row's words go grey; the menu now offers Show instead of Hide. Show brings it back. *(R-126: the eye moved into this menu so the name has the room.)* |
| 6 | same | Layers | Press the "…" beside "Hero — Latest Post". Check no part of the menu is cut off, then choose **Rename**, type a new name and press Save. | `Top of the page` | The menu opens fully on screen — nothing clipped on the left. A small box asks for the name; after Save the row and the right-hand panel's heading both read your name. *(R-126.)* |
| 7 | same | Layers | Press "…" beside "Newsletter — Inline Row" and choose **Duplicate**. Then press "…" on the new row and choose **Delete**. | — | A second copy of the section appears directly below, on the list and on the page, with the same words. Delete takes it away again. |
| 8 | same | Layers | Press "…" beside "Header — Rail" in the SITE-WIDE group at the top. | — | The menu has Rename and Delete but **no Duplicate** — your header is one shared thing, not a copy per page. |
| 9 | same | Layers | Press "…" beside "Header — Rail" and choose **Hide**. | — | A box asks first and says it affects every page. Cancel leaves everything as it was. |
| 10 | same | Canvas | Put the pointer over "Post Grid — Three Up" on the page itself, without clicking. | — | A small white pill appears in its top-right corner with a copy icon, a bin and six dots. Compare it with S4b in `S4 Editor.dc.html`. Move the pointer onto the pill — it stays. |
| 11 | same | Canvas | Press the copy icon on that pill, then press the bin on the new copy. | — | The section is copied directly below and then removed, the same as from the list. |
| 12 | same | Canvas | Drag the six dots on the pill up or down the page and let go. | — | The dashed box in the list on the left shows where it will land; on release the page redraws in the new order. |
| 13 | same | Canvas | Hover a section so the pill shows, then scroll the page with the wheel or trackpad. | — | The pill disappears while the page moves and comes back on its section when you stop. It is never left floating over the wrong section. |
| 14 | same | Right panel | Select "Newsletter — Inline Row" and open **Section settings**. | — | "Member visibility" is the first row there, reading "Everyone", with a short line under it saying what it decides. Nothing about it appears in the Layers list. *(Your ruling, R-124.)* |
| 15 | same | Right panel | Change it to **Paid members**. | — | The section disappears from the page, its row stays in the list, and a second line under the control says the page is being previewed as a visitor who is not signed in. Set it back to Everyone and the section returns. |
| 16 | same | Canvas | Select "Hero — Latest Post" (the one with the Pro mark) and keep the pointer on it. | — | The "✦ Pro" tag is exactly where it has always been, in the top-right corner, and the pill sits directly to its left. Neither covers the other. *(Your ruling, R-125.)* |
| 17 | same | Layers | Hide every row under "THIS PAGE · HOME" from its "…" menu, then Delete them all the same way. | — | With all of them hidden the page is blank but the rows stay. After deleting them all, only the Site-wide group is left, its count reading 0. |
| 18 | same | Browser | Reload. | — | Everything is back as it started. Saving arrives with Story 5.8. |

## Owner's test findings

Five, from his own look at the deployed story on 2026-09-18, before the formal test. All five are one finding —
**the 240px Layers panel was spending its width on everything except the name** — and all five are fixed inside this
story (R-80). They change what B7 draws, so they are recorded as a ruling, **R-126**, in
`reconcile-designs-decisions.md`: R-74 makes the export the design authority, and a departure from it that is not
written down is one the next reader will "correct" back.

| # | What he said | What was done |
|---|---|---|
| 1 | "Site-Wide at top of Layers is 2 line. Can we reduce the text, so it all spans in single line only" | The count's words are now `N templates` rather than `on all N templates`, and the heading is one line. Still derived (standing rule 4). The harness MEASURES the heading's height against the page group's rather than trusting it. |
| 2 | "The ... three dots menu opens but it cuts off from the left." | Root cause, and not in Layers: `anchorTo` can only clamp the edge it anchors, because it runs while the popover is still `display:none` and has no width. A 210px menu right-aligned to a ⋯ near x=202 starts at −8. `openMenu` now clamps BOTH edges once the box has a width — so every menu in the app is fixed, not the one that found it (standing rule 3). |
| 3 | "reduce the font size on the cards in Layers, and jst show ... three dots menu on top right. Add the Hide option in that menu" | The name is `text-helper-caption`; the eye is gone from the row; Hide/Show leads the `⋯` menu. `Space` on the focused row still toggles visibility — a key is not a control and costs no width, so UX-DR10 is untouched. A hidden row reads as hidden by its ink-soft name and by its menu saying Show. |
| 4 | "'Editing a site-wide section changes it on all 6 templates.' seems duplicated information" | B7's footed note removed. It also **closes DW-184**, which existed only to decide when that note should stop being shown. The warning is not lost: a site-wide Delete or Hide still opens a confirm naming every template, which is the moment it matters. |
| 5 | "Keep Site-wie and This page section design same ... Add a thin divider line between them. Remove the icon." | `SiteWideGroup` is no longer a white card: it draws the heading, the right-aligned mono count and the rows exactly as the page group does, with one hairline between the two and no glyph. |

**What was deliberately NOT changed by these five,** because nothing he said reaches them: D8e's four row states and
the ring on the ROW, the drag and its dashed slot, every keyboard path, the two singletons, R-123's grounds, and
R-124 and R-125, which are about the settings panel and the canvas.

## Questions for the owner

### Question 1 — where should "who can see this section" live: the right-hand panel, or the Layers list?

Some sections ask the reader to do something — subscribe, sign up, upgrade. Those sections can be set to show only to
certain people: everyone, only people who are signed out, only free members, or only paying members. **Example:** your
newsletter band on the home page. You might want paying readers not to be asked to subscribe again, so you set that
band to "Logged out" and it quietly disappears for them on the live site.

The question is only *where the setting sits*, not what it does.

The writing disagrees with itself, which is why this is yours. The requirements document mentions it in the paragraph
about the Layers list. But the actual drawings put it in the right-hand panel: `A4-13 Latest Post.dc.html` draws the
row inside that section's settings, `A22-1 Inline Row.dc.html` draws it there too, and the A22 category notes say in
so many words that it and its sister setting are "both in the panel, one under the other, and the panel says which is
which". Your own ruling R-113 already files it under **Section settings** in the panel.

1. **The right-hand panel, at the top of "Section settings", where the drawings put it.** (RECOMMENDED) — it sits
   beside the other things that change how that one section behaves, and it is where you will already be looking.
2. **The Layers list**, as one more control on the section's row.
3. **Both** — the row shows who it is for, and the panel is where you change it.

**Ruled: option 1 (owner, 2026-09-18).** *"The right-hand panel, at the top of 'Section settings', where the drawings
put it."* Recorded as **R-124**; it closes DW-163.

### Question 2 — the Pro mark and the new hover buttons want the same corner

On 17 September you ruled (R-119) that when a Pro design is selected on a Free plan, a small "✦ Pro" tag sits 8 px
inside the section's **top-right corner**. This story adds the hover pill — copy, bin and a drag grip — and the
drawing puts that pill in the **same top-right corner**. On a Pro section that you have selected and are hovering,
both want the same spot, so one has to move. **Example:** "Hero — Latest Post" on your home page is a Pro design.
Select it, keep the pointer on it, and today both would be drawn on top of each other.

1. **The Pro tag keeps the corner; the pill sits directly to its left.** (RECOMMENDED) — nothing you already approved
   moves, and the price tag stays exactly where you put it.
2. **The pill keeps the corner; the Pro tag moves to the bottom-right** of the section.
3. **The pill keeps the corner; the Pro tag moves to the top-left**, beside the section's name tag.

**Ruled: option 1 (owner, 2026-09-18).** *"The Pro tag keeps the corner; the pill sits directly to its left."*
Recorded as **R-125**; R-119 stands untouched.

### Question 3 — should right-click replace the "…" button, or sit beside it?

You asked for a right-click menu on the Layers rows **and** on the sections in the middle of the page, for every
section, and for the "…" button to go. The right-click part is a clear win and I would build it either way. The only
decision is whether the "…" button disappears with it.

**Example:** you right-click "Newsletter — Inline Row" — in the list or on the page itself — and the same little menu
opens under your pointer: Hide · Rename · Duplicate · Delete. That works exactly as you describe.

What removing the "…" costs, in plain terms:

- **A right-click menu is invisible.** Nothing on screen says it is there. You know, because you asked for it; someone
  using Inflozo for the first time has no way to discover that Rename or Delete exist.
- **There is no right-click on a tablet or phone.** The editor already answers touch (press and hold shows a section,
  a tap selects it). Hold is taken, so on touch there would be no way at all to reach Rename, Duplicate or Delete.
- **Keyboard.** There is a keyboard equivalent of right-click (the Menu key, or Shift+F10), so that path survives —
  but it is obscure, and today the "…" is simply the next thing you reach with Tab.

1. **Add right-click everywhere, and keep the "…" on the row.** (RECOMMENDED) — you get the fast path you want on both
   the list and the page, and the button stays as the visible, touchable, tab-reachable way in. This is how Figma,
   Finder and File Explorer all work: the right-click menu is the shortcut, never the only door.
2. **Add right-click everywhere and remove the "…" entirely**, exactly as asked. The rows get a little more width for
   names, and the actions become invisible and unreachable on touch.
3. **Add right-click everywhere, and keep the "…" only on the Layers rows** — the canvas gets right-click plus the
   hover pill it already has (copy, bin, drag), and the row keeps its button.

**Ruled: withdrawn — none of the three (owner, 2026-09-18).** *"Ignore it for now. Lets keep like it is now."*
Layers and the canvas keep exactly what R-126 left: the `…` button on each row as its only control, and the hover
pill on the canvas. **Nothing was built for this question** — it was asked and withdrawn inside Story 5.4's Dev, so
there is no code, no test and no ledger entry behind it. If right-click is wanted later it starts from this block,
which already carries the three options and what each costs.

### Question 4 — when you drag a row past the end of its own group, should it land at the end, or snap back?

In the Layers list, a row can only be moved within its own group — a page section never mixes with the site-wide ones.
The written plan says a drop that lands *outside* the group should put the row back where it started. What is built
lands it at the nearest end of its group instead, which is what every other draggable list in Inflozo does (your
finding 9 of 13 September, "nothing reorders until the drop", applies to every list, and the item lists in the panel
already land at the end). **Example:** you drag "Newsletter — Inline Row" up above the SITE-WIDE heading and let go.

1. **Land it at the top of its own group.** (RECOMMENDED) — same feel as the item lists you already approved; a drag
   that overshoots still does what you meant.
2. **Snap it back to where it was**, exactly as the plan's words say — an overshoot cancels the move.

**Ruled:** _(awaiting the owner)_
