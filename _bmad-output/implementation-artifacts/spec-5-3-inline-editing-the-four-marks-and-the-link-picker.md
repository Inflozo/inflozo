---
title: 'Story 5.3 — Inline editing, the four marks and the link picker'
type: 'feature'
created: '2026-09-17'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

In the editor you can now click into the words of a selected section and type straight on the page — its heading, its
paragraphs, even a button's label — and a paragraph starts a new line where you press Enter. Selecting a few words
raises a small white bar with Bold, Italic, Underline and Link (only the ones that field allows); Link opens the same
link chooser as the right-hand panel, which searches the sample posts your page shows until Story 5.18 brings your own
site's, pasted text keeps only those four kinds of formatting, and the panel's paragraph boxes show and apply the same
formatting. As you ruled, a click on Ghost's own words, such as a post's title, shows a small pill naming them — "Post
title — set in Ghost" — while clicking an icon on the page and icons on buttons arrive with Story 9.1, where the first
designs that carry them can be tried; nothing you change survives a reload until Story 5.8 adds saving.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A selected section's words change only through the panel's plain text boxes: nothing on the canvas takes a
caret, no field can be made bold, italic, underlined or linked anywhere, and a paste or a line break has no rule
(FR-D4, and FR-D3's click on text). AD-4's text-plus-marks value has a serializer and no editor that writes one, and
Story 4.5's Link Picker opens only from its panel field.

**Approach:** Asked to (`editing`), the canvas emitter stamps each text prop's element with its path, and each of Ghost's
own words with the name of its field; the editor lifts the stamps into memory as it mounts the canvas, so nothing is left
on the page. A click on a stamped prop in the selected section makes that element `contenteditable`. The stored value
stays the only source of marks and link records:
- typing is read from the element as text and applied to the value;
- a paste is read for its marks;
- a mark or a link changes only through the toolbar or its keys;
- the element is rewritten from the serializer whenever the two differ.

A text selection raises P0-1's toolbar outside the frame, with only the marks that field permits; Link opens Story 4.5's
link panel in the toolbar's place; and the panel's Text Area becomes a rich field run by the same controller. Questions 1
and 2 were ruled option 1: the icon slot and button icons are Story 9.1's (R-121), and a click on Ghost's own words shows
P0-1's lock pill naming them (R-122).

## Boundaries & Constraints

**Always:**
- **Text is text plus marks, never HTML, and the stored value is the only source of marks and link records.**
  - Typing is read from the element as text and applied to the value.
  - A paste is read for its marks through `readMarks`.
  - A mark or a link changes only through the toolbar or its keys.
  - The element on the canvas holds exactly the markup `serializeMarks` writes for the value (AD-4, §7.3). A space the
    browser typed as U+00A0 counts as a space.
- **A mark the field does not permit is absent, not greyed** (UX-DR19).
  - A `richtext` prop permits its own `marks`, in P0-1's fixed order; a `text` prop and a `plainText` value permit none.
  - A field with no permitted mark shows no toolbar, and ⌘B, ⌘I, ⌘U and ⌘K do nothing in it.
- **Only the selected section edits.**
  - A first click on a section still only selects it (Story 5.2): no caret and no text selection.
  - A press the canvas prevents moves focus to the canvas document, so Esc reaches the canvas.
- **A press on the canvas still does nothing else:** no link navigates and no form submits, including a button whose
  label is being typed into.
- **Zero chrome at rest.**
  - The editing stamps are lifted off as the canvas mounts, and `contenteditable` exists only on the element being edited.
  - When no field is being edited any more, the canvas repaints.
  - So with nothing hovered or selected, no element in the canvas document carries a `data-inflozo-*` attribute or
    `contenteditable`.
- **The canvas and the panel edit the same value.** The panel's Text Area shows the same marks and applies them through
  the same toolbar; a Text Field stays a text box.
- **The Esc ladder** (EXPERIENCE.md § The focus model across the canvas boundary).
  - Esc inside editing ends editing and the section stays selected; the next Esc deselects.
  - Focus moving to the panel, Layers or the top bar ends editing and keeps the selection.
  - Focus moving into the toolbar or its link panel does not end editing.
- **What is drawn outside the frame, and what inside** (AD-21, as Stories 5.1 and 5.2 amended it).
  - The toolbar and the link panel are pressed, so they are outside the frame, and the toolbar hides while the canvas
    scrolls (Story 5.2's finding).
  - The pill takes no press, so it is chrome in the canvas's own layer and scrolls with its words.
- **A prop's `maxChars` stops typing and paste at the limit,** and a sentence says why.
- **Edits live in memory for the session.** No writer of `project_templates` exists before Story 5.8, so a reload
  starts from the stored docs.
- **R-74:** the toolbar, its link popover, the lock pill and the token row match `P0-1 Inline Text Toolbar.dc.html`;
  link entry is B4b + P0-1, as EXPERIENCE.md's Information Architecture names it.
- **No `'unsafe-eval'`:** every new gesture runs inside the harness's step 5 session and its zero holds.

**Ask First:**
- Any new dependency.
- Any edit under `packages/library/designs/`, and any render-matrix baseline or snapshot change (no pilot default holds
  a `\n` or a link mark, so none is expected).
- A `<button>` label (Newsletter — Inline Row's Subscribe) that the executed approach in Design Notes cannot make
  typeable on the deployed editor: stop before editing it only from the panel.
- Any change to the theme emitter's output beyond `\n` as `<br>` and DW-120's unset inline link.

**Never:**
- An HTML string in storage; an editor library (ProseMirror, Lexical, Tiptap — §7.3 refuses them); `execCommand`.
- Absent here, each with the story or question that owns it:
  - clicking an icon slot on the canvas, and its dashed empty placeholder (Story 9.1, R-121);
  - an icon before or after a button's label (Story 9.1, R-121);
  - P0-1's docked bar at 390 (R-87);
  - the lock pill on a text prop promoted to Ghost Admin (Story 7.10);
  - live link search over a linked site (Story 5.18);
  - saving and the undo journal (Story 5.8);
  - P0-2's filled-slot popover.
- A colour or shadow literal in a `.ts`/`.tsx` under `apps/web` (`tokens.test.ts`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Start editing | Post Grid — Three Up selected; click inside its title | a caret where the pointer landed; the section stays selected with its outline and panel | the same click while Three Up is not selected only selects it |
| Type | characters in Three Up's title | the canvas title changes in place (the root is the same node); the panel's Title field follows | — |
| Move between fields | typing in Three Up's title, then a click inside its sub | the caret lands in the sub and typing goes there; the title keeps what was typed; nothing repaints until no field is being edited | — |
| Type at a mark's end | a character typed right after a bold word, and right after a link | the first is bold; the second is not part of the link | — |
| Links survive typing | a field holding a Portal "Sign up" link and a post link with Open in new tab and `sponsored`; typing elsewhere in it | both links keep their whole record — `portal`; `href`, `ref`, `newTab`, `rel` | — |
| Line break, Text Area | Enter or Shift+Enter in Three Up's sub | a new line at the caret: `\n` stored, `<br>` on the canvas | — |
| Line break, Text Field | Enter in Hero — Latest Post's headline (`text`) | nothing inserted | — |
| Toolbar | select a word in Three Up's title (marks `strong · em · u · a`) | P0-1's bar centred 8px above the selection: B, I, U, a hairline, Link, and Remove link at 35% | below the selection when its top is within 48px of the canvas's top edge |
| Narrowed field | select a word in Latest Post's sub (marks `a`) | only Link and Remove link, in that order | — |
| No marks | select words in Latest Post's headline, or in a `plainText` value | no toolbar; ⌘B ⌘I ⌘U ⌘K do nothing | — |
| Toggle a mark | Bold (or ⌘B) over a selection, then again | the selection becomes `<strong>` and Bold shows pressed; again, bold leaves exactly that range | a partly bold selection becomes wholly bold |
| Add a link | select words → Link → type `night` → choose the post → Done | the words become one `a` mark carrying the chosen record (the post's `href` and `ref`, and any Open in new tab or rel set in the panel); Remove link turns on | Esc commits nothing and returns to the text with the selection intact |
| Edit a link | selection touching one link → Link | the panel opens filled with that link; Done writes the new record over the link's whole range and the selection | — |
| Remove a link | selection touching links → Remove link | every link the selection touches is removed whole; the words stay | greyed when nothing selected is linked |
| A press on the canvas with the link panel open | the panel open, then a press anywhere on the canvas | the panel closes and nothing is committed | — |
| Paste | HTML carrying `b`, `i`, `u`, `a href="https://…"`, `span style`, `img onerror`, `script`, `a href="javascript:…"` | bold, italic, underline and the https link arrive where the field permits them; everything else arrives as its text; nothing runs and nothing loads | a field without a mark keeps only its text |
| Character limit | a field declaring `maxChars`, full — the controls sample's Eyebrow (30) and Heading (40) on `/controls`, or any field on the canvas | the next character, or the rest of a paste, is refused, and "{Label} holds {n} characters." shows — under the panel field, or in the pill on the canvas | — |
| Catalog words | click Latest Post's "Subscribe" (catalog-linked, value empty) and leave without typing | the value stays empty and the catalog words still show | typing starts from the words shown and makes them the customer's |
| Same prop twice | a prop two elements render | both follow while typing | — |
| Button label | click into Newsletter — Inline Row's Subscribe and type | the caret lands at the end of the label and the label changes, spaces included; no form submits and the page stays | Space and Enter still fire the button's `click`, which the canvas prevents |
| Ghost's own words | click Latest Post's post title with Latest Post selected | a pill above it naming the field — a lock and "Post title — set in Ghost" — and nothing editable | the next click, Esc or a change of selection removes it; it scrolls with the title |
| Theme words | click "Sign in" in Header — Rail with the header selected | nothing happens | — |
| Esc ladder | Esc while editing; Esc again | editing ends and the section stays selected; then it is deselected | Esc in the link panel or the toolbar returns to the text first |
| Esc after the panel | focus in the panel's Title field, then a press on Three Up's padding, then Esc | the section is deselected | — |
| Focus leaves | while editing, a click into the panel, Layers or the top bar | editing ends; the section stays selected | the toolbar and the link panel keep editing alive |
| Scroll | the canvas scrolls with the toolbar showing | the toolbar hides, and returns centred over the selection when scrolling stops | the link panel keeps its place |
| Panel Text Area | select words in the panel's Title field → Italic | the same toolbar over the field; the canvas shows the italic | — |
| Tokens | Newsletter — Inline Row's Social proof line (tokens `members`) | under its panel field "TOKENS THIS FIELD ACCEPTS" and `{members}`, which inserts at the cursor | a field with no tokens has no row |
| Touch | tap Three Up, then tap inside its title | editing starts, with the caret in the title and the keyboard up | — |
| Reload | after edits | the stored docs | — |

</frozen-after-approval>

## Code Map

- `packages/section-runtime/src/marks.ts` — AD-4's one serialization point:
  - `linkAttributes` (:76-98), the one link sink. A Portal link becomes `href="#" data-portal`, a search link
    `href="#" data-ghost-search`, `newTab`/`rel` become `target`/`rel`, and `ref` is never written — so the page never
    holds a whole link record. `openTag` (:100-104) writes a bare `<a>` for a record with no destination (DW-120).
  - `substituteTokens` (:114-125) — with token values handed, the page shows the substituted words, never `{members}`.
  - `serializeMarks` (:130-192): the per-prop allow-list (:140-142), the boundary sweep (:167-190). It writes `\n` as a
    literal newline, which renders as a space on both emitters, so line breaks are not honoured today.
  - `editText` (:199-214): a text edit whose marks follow the change; a mark ending exactly where text is inserted does
    not grow. `isRich` is not exported (`index.ts:40-43`).
- `packages/section-runtime/src/core.ts`:
  - `RenderInput` (:121-203) — `ghost` (:126) and `member` (:196-199) are canvas-only inputs already; `renderCanvas`
    (:1678-1681); the pass order (:1490-1600): gating, `stampControls`, `stampStrings`, `expandItems`, `expandRepeats`,
    `emitBindings`, then `applyProps`.
  - `applyProps`' `data-prop` loop (:1056-1097): `consume` (:1057) removes the attribute; icon (:1061-1072), catalog
    (:1077-1081, its `continue` before the hide check), empty (:1082-1087), then `innerHTML = serializeMarks(…)`
    (:1095). The stamp goes after :1057, guarded by `users === null && input.editing`.
  - `expandItems` (:1223-1254): `for (const item of raw)` (:1245) has no index; the clone is `applyProps`'d with
    `{ [path]: item }` (:1250).
  - `emitBindings` (:677, its `where` is the enclosing scope): the `data-bind` canvas branch (:738-749) sets
    `textContent` or removes the element; the `data-helper` canvas branch (:851-884) builds navigation.
  - `stampControls` (:1187-1205) strips the root's non-directive `data-*` (Story 5.2's `mark()` re-applies).
- `packages/library/src/contexts.ts` — `resolve(path, place)` (:205-238) returns `{ field, name }` (`Resolved`, :114),
  the matrix field and the scope it lives in; `bindable` (:243). `packages/library/contexts/matrix.json` — the one copy of
  Ghost's fields per scope (`post`, `tag`, `author`, `tier`, `newsletter`, `navigation`, `pagination`, …) and the
  universal set (`@site.*`), with kinds but no words for a person.
- `packages/section-runtime/src/agreement.test.ts` — `skeleton()` (:70-87) compares tag, class and sorted attribute
  names; a flag no test passes breaks nothing. The leak checks (:186, :775) match `data-prop=`, not `data-inflozo-prop=`.
- `packages/section-runtime/src/ad36.test.ts:209-237` — the `a` mark's scheme and rel allow-list, and `plainText` stripping
  the anchor (:230-231); AD-36's paired-test rule.
- `packages/section-runtime/src/controls.ts` — `setContent(entry, state, path, value, index?)` (:405-415): a flat
  `contentSchema` key, an item prop as `'features[].title'` with its index; `PropRow` (:147-157) carries `def`.
- `packages/section-runtime/src/doc-schema.ts:19,26` — `content` is `z.record(z.string(), z.unknown())`: a rich value
  parses as it is.
- `packages/library/src/registry.ts:68-91` — `PropDef`: `marks`, `tokens`, `catalog`, the array bounds; no character
  limit. `packages/library/src/validate.ts:627-705` — `validateCategoryContent`, where a `maxChars` refusal sits beside
  `marks-on-plain-prop` (:645-646). `vocabulary.ts` — `MARKS` (:331, `strong · em · u · a`), `LINK_RELS` (:335),
  `INLINE_TOKENS` (:317), `PROP_TYPES` (:206).
- `packages/library/fixtures/controls/content.json` — Story 4.5's sample: `eyebrow` (`text`, "This week at Orbit
  Weekly") and `heading` (`richtext`, marks `strong · em`, "Seven links, checked by hand"); `/controls` mounts it beside
  the same `Sidebar`.
- `docs/section-authoring.md:470-530` — the content-editor table: `text` is a Text Field, `richtext` a Text Area; nothing
  yet says a Text Field is one line.
- The seeded project (`tools/probe/seed-editor-project.mjs:29-33`): site `a1/1`; home `a4/13 · a17/1 · a22/1`; post
  `a24/1`. It writes no `projects.linked_site_id`
  (`supabase/migrations/20260904120000_complete_schema.sql:229`), so its canvas previews Orbit Weekly. Read in each
  pilot's `content.json` and `index.html`:
  - **Hero — Latest Post (`a4/13`).**
    - Text props: `eyebrow`, a `p` hidden while empty; `headline`, an `h1`; `primaryAction.label`, an `<a>` (catalog
      `member.signup_cta`, shown as "Subscribe"); `secondaryAction.label`, an `<a>`.
    - `sub` is `richtext`, `a` only.
    - The card's `title`, `primary_tag.name` and `published_at` are Ghost's (`data-bind`); its spec says a click on
      them "says Edit in Ghost" (`A4 Heroes - Spec.md:61`, `:657`).
  - **Post Grid — Three Up (`a17/1`).**
    - `title` (an `h2`), `sub` and `note` are `richtext` with all four marks; `eyebrow` is `text`.
    - `linkLabel` is hidden, because its `linkUrl` has no default; the grid is Ghost's.
  - **Newsletter — Inline Row (`a22/1`).**
    - `eyebrow`, `heading`, `blurb` and `note` are `richtext` with all four marks.
    - `buttonLabel` (`text`, catalog) IS the `<button type="submit">`.
    - `proofLine` is `text` with tokens `members`, printed literally as "Join {members} readers", since no token values
      are handed.
    - `subscribedText` and `manageLabel` render twice and only for signed-in members, so not on the anonymous canvas.
  - **Header — Rail (`a1/1`).** `ctaLabel` is on an `<a>`; "Sign in", "Account" and "More" are theme words (`data-t`),
    and the menu is Ghost's (`data-helper="navigation"`).
  - **Across all four** (DW-179): the visible `text` props above are words their own category specs give the four marks,
    and the controls fixture's `features[].icon` is the library's only icon prop — no pilot declares an `icon`, a
    `maxChars` or an authored array.
- `apps/web/lib/canvas.ts` — `renderSection` (:39-71) passes neither `strings` nor `tokens` (the runtime resolves the
  English catalog itself); `mountSections` (:75-78). `/pilots` calls the same function.
- `apps/web/lib/selection.ts` — `escDeselects` (:32-42) already keeps Esc for a `contenteditable`; `withState` (:45-60).
- `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx`:
  - `paint()` (:182-209), `pickAt` (:212-216), and `onEscape` (:218-224), whose `:popover-open` guard (:222) gives Esc to
    any open popover in the document.
  - `wire()` (:228-289): `mousedown` prevented with the rest (:233); `click` prevented and selects (:281-287); touch
    through `hold` (:241-280).
  - `onChange` (:387-403): a control stamps, content repaints. The Sidebar mount (:505-515), fed `links`.
  - The chrome layer (:344-384) and the header comment's absent list (:57-63, "typing on the canvas (5.3)").
- `apps/web/lib/canvas-layer.ts` — the in-canvas layer for non-pressable chrome; `place()` (:139-159) maps a rect with the
  fit, as `fill`, `top-left` or `top-right`.
- `apps/web/components/controls/link-picker.tsx` — `LinkPicker` (:94-321):
  - its parts: the button (:136-155) and the popover (:157-318), with search (:166-179), groups (:182-200), the Portal and
    SITE chips (:215-235), the filled state (:243-317) and Done (:305-314);
  - its state (`query`, `draft`) lives inside, with no separate export;
  - `run-verify-controls.cjs` finds its search input by id (:276, :303), so the ids `${id}-link` and `${id}-q` stay.
- `apps/web/components/controls/sidebar.tsx` — `field()` (:207-227): `richtext` is a `Multiline` through `editText`
  (:209-210); `text` a `TextInput` (:224-225).
- `apps/web/components/kit/select.tsx:23` — `openPopover(pop, trigger, placement, focus?)`:
  - It takes an element anchor only (`lib/menu.ts:36` `anchorTo`: a 6px gap, left or right edge), and re-anchors to the
    trigger when its size changes.
  - It flips once at open, and a scroll of the window closes it — a scroll of the iframe does not.
  - Focus goes back to the trigger on close.
  - Light dismiss never sees a press inside the iframe (executed by this spec's review).
- `apps/web/components/kit/input.tsx` — `TextInput` (:23, with `maxLength` and `hint`), `Multiline` (:124), `SearchInput`
  (:154).
- `apps/web/components/kit/icons.tsx` — `Link` (:130), `LinkOff` (:165), `InfoCircle`; no lock and no B/I/U glyph.
- `apps/web/app/globals.css` — `rounded-thumb` 10px (:86-92); `shadow-md` `0 4px 16px rgba(28,27,26,.08)` (:95-102);
  `bg-surface`, `border-line`, `bg-line`, `bg-coral-tint`, `text-coral-text`; no serif token.
- `apps/web/tokens.test.ts:125` — no colour literal in a `.ts`/`.tsx`; fonts are not checked.
- **Frames and specs.**
  - **`P0-1 Inline Text Toolbar.dc.html`.**
    - Over body text (:28-46): white surface, `#E7E2DB` border, 10px radius, 3px padding, five 30px targets, a hairline
      before the link pair, Remove link at 35%.
    - Over a headline with Bold pressed (:48-64): `#FFEDE8` fill, `#C2381F` glyph.
    - The link popover's two states (:66-136).
    - Plain-text-locked (:138-147): a white pill with a lock, "Site title — plain text, set in Ghost".
    - At 390 (:149-172), and typed tokens (:174-204).
  - **`P0 Editor Primitives - Spec.md` § P0·1** (:117-216): the actions (:121-129), the per-field allow-list (:131-149,
    "Silence is not a narrowing" :147), anatomy and placement (:158-162), the popover (:167-178), the lock (:183-187),
    accessibility (:192-196), tokens (:198-208).
  - **`B Missing Surfaces.dc.html` B4b** (:1305-1348): link entry at the selection, "searches the user's own pages and
    posts as they type", Open in new tab and a rel row. It is drawn in B4a's ink (:1286-1303), which P0-1 supersedes
    (EXPERIENCE.md :678).
  - **EXPERIENCE.md:** the Inline Toolbar and Link Entry rows (:149-150), the Inline toolbar pattern (:311), the focus
    model (:425-462), single-character shortcuts (:483-490).
  - **DESIGN.md:** the export wins (:205-210); the three ink canvas pills (:314-316) — the design counter, the
    content-source pill and the Pro mark; "Georgia … never style app chrome" (:342-343); `md` for popovers (:383).
- **`tools/probe/run-verify-editor.cjs`** (Stories 5.1–5.2).
  - The CSP window opens at :267 and closes at :670-671; a new gesture runs on `page` between :542 and :544, or :668 and
    :670.
  - Axe states are added before :805.
  - Helpers: `onScreen` (:306-313, a section only), `pointAt`/`hoverOn`/`clickOn` (:316-323), `chromeNow` (:326-338),
    `panelOf` (:446), `openGroup` (:490).
  - Step 11 asserts focus on the canvas body with no text selection after clicking Archive (:419, :426).
  - Step 13 clicks the already-selected Three Up at 60% down, then expects Esc to deselect (:531-535).
  - Step 12 types Headline through `getByLabel('Headline').fill()` into an `<input>` (:505).
- `_bmad-output/implementation-artifacts/deferred-work.md` — DW-115 (:3095-3116) and DW-120 (:3191-3203) are this
  story's.

## Tasks & Acceptance

**Execution:**
- [ ] `packages/library/src/registry.ts`, `packages/library/src/validate.ts` (+ `validate.test.ts`),
  `packages/library/fixtures/controls/content.json` -- `PropDef.maxChars`, the hard limit FR-D4 reads from the schema:
  - `text` and `richtext` only, a positive whole number, and an authored `default` no longer than it. Each refusal has a
    code and a sentence in the file's own style, tested beside the existing prop checks.
  - The controls fixture declares `maxChars` on `eyebrow` (30) and `heading` (40). No pilot declares one:
    `packages/library/designs/` is not this story's to edit.
- [ ] `packages/library/contexts/labels.json`, `packages/library/src/contexts.ts` (+ `contexts.test.ts`) -- the words for
  Ghost's own fields (R-122):
  - One plain name for every `text`, `date` and `number` field in the matrix's scopes and universal set, and for every
    `helper` entry, keyed by scope and field — "Post title", "Tag name", "Site title", "Publish date", "Navigation".
  - `ghostLabel(path, place)` resolves the field through `resolve` and returns its name.
  - The test derives the fields from `matrix.json` and fails for any that has no name; it holds no count.
- [ ] `packages/section-runtime/src/marks.ts` (+ `marks.test.ts`; the paste pair in `ad36.test.ts`) -- the value's edits,
  beside the one serializer:
  - **The serializer.** `serializeMarks` writes each `\n` as `<br>`, and drops an `a` mark whose record names no
    destination instead of writing a bare `<a>`; its text stays (DW-120).
  - **`allowedMarks(def, value)`:** a `richtext` prop's `marks` in `MARKS` order; nothing for any other type or for a
    `plainText` value.
  - **`readText(root)`:** an element's words, walking handed nodes only (AD-1). A `<br>` is `\n`, and U+00A0 is a space.
  - **`readMarks(root, allowed, lines)`,** for a parsed paste only.
    - Text, with runs of whitespace collapsed.
    - `<br>`, and a block element's boundary, as `\n` when `lines`, else a space.
    - `strong`/`b`, `em`/`i` and `u`, and an `a` whose href is `http:`, `https:`, `mailto:` or `tel:` (as `{ href }`), as
      marks; every other element as its text.
    - Only `allowed` marks kept, adjacent equal marks merged, links never overlapping.
  - **`textOffset(root, node, offset)` and `domPoint(root, offset)`:** a DOM point as a text offset and back, counting as
    `readText` counts.
  - **`diffText(before, after, caret)`:** the one edit between two texts, anchored at the caret, so a repeated letter is
    placed where it was typed.
  - **`replaceRange(value, start, end, insert, { max, typed })`:** a `RichText` spliced over the range, the marks around
    it shifting.
    - When `typed`, the inserted characters take the bold, italic and underline of the character before them, never its
      link.
    - It clamps to `max` and returns the value and how many characters it refused.
  - **`toggleMark(value, start, end, mark)`:** removed from the range when every character in it carries the mark, added
    over it otherwise.
  - **`setLink(value, start, end, link)`:** one `a` mark over the union of the range and every link it touches.
    **`unlink(value, start, end)`:** every link the range touches removed whole.
  - **`activeMarks(value, start, end)`:** the marks every selected character carries, and whether any is linked.
  - **Tests**, with jsdom as `agreement.test.ts` uses it:
    - each function's branches;
    - a typed edit next to a Portal link, a search link, and a post link carrying `ref`, `newTab` and `rel` leaves every
      record whole;
    - `diffText` on "aa" → "aaa" with the caret after the first letter;
    - the typed-mark rule at a bold end and at a link end;
    - U+00A0;
    - `<br>` and DW-120 on both emitters;
    - in `ad36.test.ts`, the paste pair: `img onerror`, `script`, `a href="javascript:…"` and `span style` come back as
      text, and `b`, `i`, `u` and `a href="https://…"` survive where allowed.
- [ ] `packages/section-runtime/src/core.ts`, `index.ts` (+ `index.test.ts`) -- `RenderInput.editing`, the canvas's alone:
  - **`applyProps`** stamps each surviving `text` or `richtext` element `data-inflozo-prop="<path>"`. Inside an authored
    item it also stamps `data-inflozo-item="<index>"`, which `expandItems` now passes.
  - **`emitBindings`** stamps each surviving `data-bind` text element, and each `data-helper` element, with
    `data-inflozo-ghost="<name>"` (R-122). The name comes from `ghostLabel` at the binding's place; the helper is
    named by its own entry.
  - **`renderTheme` handed `editing` throws,** so a stamp can never reach a theme.
  - **The test** covers a fixture with a prop, a bound text, an authored list whose middle item a guard hides, and a
    gated arm. Every stamp sits on the right element with the right index and name, and removing every `data-inflozo-*`
    attribute gives exactly the render without `editing`.
  - **Exports:** the new marks functions and `isRich`.
- [ ] `apps/web/lib/canvas.ts`, `apps/web/lib/selection.ts` (+ `selection.test.ts`) -- the editor asks for stamps;
  `/pilots` does not:
  - `renderSection` takes `editing` and hands it to `renderCanvas`.
  - `takeStamps(elements)` reads each stamp into a map (element → `{ path, item? }` or `{ ghost: name }`) and removes the
    attribute. It is tested with plain objects, as the file's other tests are.
- [ ] `apps/web/lib/inline.ts` -- the one editing controller, for the canvas element and the panel's field:
  - **Start.**
    - Before editing begins, the element is rewritten from the stored value with no token values.
    - An empty value keeps the words it shows (catalog or authored), which become the starting text.
    - `contenteditable` goes on, and the caret lands where the press did.
  - **Each `input`** (and a composition's, at `compositionend`).
    - `readText` gives the new words; `diffText` against the previous words and the caret gives the edit.
    - `replaceRange(…, { typed: true, max })` applies it to the stored value, so marks and link records come from the
      value, never the page.
    - When the element's nodes differ from the serializer's nodes for the new value (compared after `normalize()`, with
      U+00A0 equal to a space), the element is rewritten and the caret put back with `domPoint`.
    - The value is handed up.
  - **`beforeinput`.**
    - `insertParagraph` and `insertLineBreak` insert `\n` in a Text Area, and nothing in a Text Field.
    - Every `format*` type is refused.
    - An insertion past the limit is refused and reported.
  - **`paste`.**
    - `text/html` goes through `DOMParser` (an inert document: nothing runs or loads), otherwise `text/plain`.
    - It is read by `readMarks` with the field's marks and spliced with `replaceRange(…, { typed: false, max })`.
    - A drop is refused.
  - **Keys.**
    - ⌘B, ⌘I and ⌘U (Ctrl off a Mac) toggle a permitted mark over a non-empty selection; ⌘K opens link entry when `a`
      is permitted.
    - ⌥F10 moves focus into the toolbar; Esc ends editing.
    - A field with no permitted mark ignores all of them.
  - **`selectionchange`.** A non-empty selection inside the element reports its rect and `activeMarks`; anything else
    hides the toolbar.
  - **Staying alive.** The toolbar and the link panel mark the session alive while they hold focus, because the iframe's
    `focusout` names no `relatedTarget` in the editor document (executed by this spec's review).
  - **End.**
    - Editing ends on Esc, on focus leaving for anything that is not marked alive, or when the host ends it.
    - `contenteditable` goes, and the element is rewritten from the serializer.
  - ponytail: the browser's own undo inside the field until Story 5.8's journal; a mark with a collapsed caret does
    nothing.
- [ ] `apps/web/components/kit/icons.tsx` -- `Lock`, the lock P0-1 draws (:142), in the file's glyph style.
- [ ] `apps/web/lib/canvas-layer.ts` -- `place()` gains `above`: centred 8px above the element, or below it when the
  element's top is within 48px of the canvas viewport's top.
- [ ] `apps/web/components/controls/mark-toolbar.tsx` -- P0-1's toolbar, and the pill:
  - **Roles and keys.**
    - `role="toolbar"`, `aria-label="Text formatting"`, one tab stop.
    - ← and → move between buttons, Enter and Space apply, and Esc returns to the text with the selection the toolbar
      acted on.
  - **Buttons.**
    - Only the permitted marks, in P0-1's order: Bold, Italic, Underline, a hairline, Link, Remove link.
    - Each mark is `aria-pressed` when every selected character carries it.
    - Remove link is `aria-disabled` at 35% while nothing selected is linked.
    - With no permitted mark, nothing renders.
  - **Look** (P0-1 :34-41, :53).
    - `bg-surface`, `border-line`, `rounded-thumb`, `shadow-md`, 3px padding, 30px targets at a 7px radius.
    - B, I and U as Georgia letterforms at 15px; Link and Remove link as the Kit's `Link` and `LinkOff` at 15px.
    - Pressed is `bg-coral-tint text-coral-text`.
  - **Placement.**
    - A fixed-position element portalled into the editor document's body — not a `popover`, so `onEscape`'s popover
      guard never mistakes it for one.
    - Placed from a screen rect: centred 8px above it, or below it when the rect's top is within 48px of the canvas's
      top edge, and kept inside the window.
    - Each button's `mousedown` is prevented, so the text keeps focus and its selection (executed).
  - **`CanvasNote`, the pill** (P0-1 :138-147).
    - `bg-surface border border-line rounded-pill`, the `md` shadow, 11px words in `ink-soft` beside a glyph.
    - `role="status"`, never pressable.
    - It holds either the new `Lock` with "{Name} — set in Ghost", or `InfoCircle` with "{Label} holds {n} characters.".
- [ ] `apps/web/components/controls/link-picker.tsx` -- `LinkPanel`, the popover `LinkPicker` draws, exported so the
  toolbar opens the same one:
  - `LinkPicker` renders its button and a `LinkPanel`. The popover's markup, its ids and its behaviour stay as they are.
  - `LinkPanel` opens filled with a record or empty. It reports Done with the draft, or Remove link with `null`; Esc
    reports nothing.
- [ ] `apps/web/components/controls/rich-field.tsx`, `apps/web/components/controls/sidebar.tsx` -- the panel edits the
  same structure and shows the same marks:
  - **A `richtext` prop** gets a rich field.
    - It keeps the Kit's `Multiline` look: label, border, focus ring.
    - Inside is a `contenteditable` holding `serializeMarks`' markup, `role="textbox"` with `aria-multiline`.
    - `lib/inline.ts` runs it, with its own toolbar and `LinkPanel`, fed the panel's `links`.
    - A value changed elsewhere redraws the field only while it does not hold focus.
    - At its limit, the field's caption reads "{Label} holds {n} characters.".
  - **A `text` prop** keeps `TextInput`, with `maxLength` from `maxChars`. While the value is at the limit its `hint`
    reads the same sentence, so the refusal is never silent.
  - **A prop that declares `tokens`** shows P0-1's row under its field (:178-194).
    - "TOKENS THIS FIELD ACCEPTS", then one mono chip per token, each inserting `{token}` at the cursor.
    - The sentence "Anything else in braces prints exactly as you typed it — {this} stays {this} on the page."
    - No row for a prop without tokens.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` -- editing on the canvas:
  - **Paint.** `paint()` renders with `editing`, then runs `takeStamps` over the mount's stamped elements; the map lives
    in a ref, rebuilt on every paint.
  - **A press.**
    - A `mousedown` on a stamped prop inside the selected root is not prevented. The element becomes `contenteditable`
      inside the handler, so the browser puts the caret under the pointer (executed).
    - A stamped `<button>` is the exception (executed). Its `mousedown` is prevented, its label goes into a temporary
      `contenteditable` span that ending editing unwraps, and the span takes focus with the caret at its end.
    - Every other `mousedown` is still prevented, so a first click only selects, and it moves focus to the canvas
      document, so Esc reaches the canvas.
  - **Moving between fields.** A press into a second field starts that field before the first one's `focusout` arrives
    (executed by this spec's review), so the first field ends in place and nothing repaints. The canvas repaints when
    editing ends with no field being edited, so it is again exactly the render of the stored docs.
  - **Click and the pill.**
    - `click` stays prevented.
    - A click on a Ghost-stamped element inside the selected root shows `CanvasNote` above it, portalled into the
      chrome layer's `page` or `view` host and placed with `above`.
    - The next click, Esc or a change of selection removes it.
  - **Touch.** A tap on a stamped prop inside the selected root starts editing; any other tap selects, as before.
  - **Input.**
    - Each input stores the value through `setContent` (path and item) and `withState`, without repainting.
    - It writes the new markup into any other element stamped with the same prop.
    - A refused character shows `CanvasNote` with the limit's sentence above the field until the next edit.
  - **Toolbar placement.**
    - Placed from the selection's rect, mapped through the iframe's rect and the fit.
    - Hidden from the first canvas `scroll` event, placed again 150ms after the last.
  - **Link.**
    - Link opens `LinkPanel` anchored to its button, and the toolbar stays laid out but `visibility: hidden`, so the
      anchor keeps its rect.
    - Done and Remove link write through `setLink` and `unlink`.
    - A `pointerdown` on the canvas closes the panel, committing nothing, because light dismiss does not see it.
    - Every close puts focus back in the text with the same selection, after `openPopover` hands focus to the hidden
      trigger.
  - **Header comment.** Typing on the canvas is built; clicking an icon (Story 9.1, R-121) and the rest stay absent with their
    stories.
- [ ] `tools/probe/run-verify-editor.cjs` -- the harness:
  - Steps 16–25 under Verification, their gestures inside step 5's session, and step 8's two new axe states.
  - Step 14 gains the tap into a title.
  - Step 13's first Esc check clicks Three Up's top padding, not its text, so it still asserts deselection.
- [ ] `tools/probe/run-verify-controls.cjs` -- a step on `/controls`:
  - Typing past Eyebrow's 30 characters, and past Heading's 40, is refused, and each field shows its sentence.
  - A paste that would pass the limit arrives cut at it.
- [ ] Propagation (standing rules 3 and 7):
  - **`ARCHITECTURE-SPINE.md`**, dated and citing this spec.
    - AD-4: `\n` becomes `<br>` at the one serializer; typing changes the stored value and never reads marks or links
      back from the page; `readMarks` reads a paste; a link mark with no destination writes no anchor (DW-120).
    - AD-21: the editing stamps are the canvas emitter's, lifted off at mount. The toolbar and link panel are outside and
      hide while the canvas scrolls; the pill is in the chrome layer.
  - **`EXPERIENCE.md`.**
    - Inline toolbar row (:311): a field that permits no mark shows no toolbar, and a Text Field is one line.
    - Section on canvas row: a click on Ghost's own words shows the pill naming them (R-122).
  - **`DESIGN.md`.**
    - The text toolbar and the lock pill are surface cards with the `md` shadow, as P0-1 draws them — not ink pills
      (:314-316).
    - B, I and U are the one place a serif styles app chrome (:342-343).
  - **`docs/section-authoring.md`.** In § 2, `maxChars`, `\n` as `<br>` in a Text Area, a Text Field is one line, and
    DW-120. In § 4, the `maxChars` refusal rows.
  - **Done at Create, with the rulings (2026-09-17):**
    - `epics.md`: Story 5.3's icon-slot criterion and its P0-2 frame moved to Story 9.1, which gained the button-icon
      criterion (R-121). Story 5.3 gained the pill (R-122), and its link criterion reads "searches the posts and pages the
      canvas previews". Story 5.18 gained the linked site's link search, and Story 7.10 P0-1's lock pill on a promoted
      text prop.
    - `deferred-work.md` DW-115's owner is Story 9.1.
    - `reconcile-designs-decisions.md`: R-121 and R-122, with their targets. Tick R-122's open targets as they land.
  - **`deferred-work.md`.**
    - DW-120 is resolved by this story: `status: done` with its `resolution:` line.
    - A new entry for advisory character counters (`A10 Stats and Numbers - Spec.md:43`, "counters advise rather than
      truncate"), owned by Story 10.26, the first category story whose spec asks for one.
  - **`epic-5-context.md`.** Sub-bullets for the stamps, the value-first edit and the scroll rule.
  - **End.** Run `git grep -n "typing on the canvas (5.3)\|Multiline\|editText" -- apps docs _bmad-output/planning-artifacts`
    and read every hit.

**Acceptance Criteria:**
- Given Post Grid — Three Up selected on the seeded Home at 1440×900, when its title is clicked and typed into, and then
  its sub, then:
  - both change in place, with the section root the same node and still selected;
  - the panel's Title and Sub fields show the same words;
  - nothing repaints until editing ends.
- Given a word selected in Three Up's title, then P0-1's toolbar shows Bold, Italic, Underline, Link and Remove link in
  that order, centred 8px above the selection within 1px, with Remove link disabled. In Latest Post's sub it shows only
  Link and Remove link; in Latest Post's headline it shows nothing.
- Given the toolbar, when Bold is pressed, then the word is `<strong>` on the canvas and in the panel field, and Bold is
  pressed; pressing it again removes exactly that.
- Given a selection, when Link is pressed and a post is searched for, chosen and Done, then the words carry one `a` mark
  with the chosen post's record, and Remove link then removes the link and keeps the words.
- Given a field holding a Portal link and a post link carrying `ref`, `newTab` and `rel`, when text elsewhere in it is
  typed, then both records are unchanged.
- Given a paste of the matrix's HTML, then only the field's permitted marks and their text arrive, nothing runs and
  nothing loads, and the stored value is text plus ranges.
- Given a Text Area, when Enter or Shift+Enter is pressed, then `\n` is stored and both emitters write `<br>`. Given a
  Text Field, Enter inserts nothing.
- Given `/controls` with the sample's Eyebrow (30) and Heading (40), when either is typed or pasted past its limit, then
  the extra characters are refused and "{Label} holds {n} characters." shows under the field.
- Given editing, when Esc is pressed, then editing ends with the section selected, and a second Esc deselects. After
  both, no element in the canvas document carries a `data-inflozo-*` attribute or `contenteditable`.
- Given Hero — Latest Post selected, when its post title is clicked, then the pill "Post title — set in Ghost" shows
  above it in the canvas's chrome layer and nothing becomes editable (R-122).
- Given Newsletter — Inline Row's Subscribe label, when "! now" is typed into it, then the label reads "Subscribe!
  now", no form submits and nothing navigates.
- Given P0-1's drawings, then the built states **match frame P0-1** (`P0-1 Inline Text Toolbar.dc.html`), each where it is
  checked:
  - the bar over body text (:28-46) and over a headline with a mark pressed (:48-64), in steps 17 and 18;
  - both states of the link popover (:66-136), in step 19;
  - the lock pill (:138-147), in step 23;
  - the typed-token row (:174-204), on `/controls` and in the owner's test.
  - P0-1's docked bar at 390 (:149-172) is not built (R-87).
- Given link entry, then it **matches the pair EXPERIENCE.md names** (:150): it opens at the selection in the toolbar's
  place, searching as you type, as B4b draws it (`B Missing Surfaces.dc.html` :1305-1348), and it is P0-1's popover.
- Given the deployed editor, when step 5's session runs every gesture above, then it records zero
  `securitypolicyviolation` events in either document, with the `EvalError` control holding.
- Given the toolbar showing, and again the link panel open, when axe-core runs at WCAG 2.1 AA after its positive
  control, then it reports zero violations.
- Given steps 1–15 of the editor harness and every step of the controls harness, when each is run after this story,
  then each still passes.

## Spec Change Log

## Design Notes

### Why the canvas emitter stamps, and the editor lifts the stamps off

§7.3 maps `contenteditable` to schema props "by data-attributes", and the canvas renderer consumes `data-prop`
(`core.ts:1057`), so its output says nothing about which element is which prop. Three ways were read or run:
- **Keep the stamps on the page.** That breaks zero chrome at rest (harness step 3) and step 4's `outerHTML` equality
  with `/pilots`.
- **Stamp only the selected section.** Every selection would then need a repaint.
- **Copy `data-prop` into the design's HTML before rendering.** Executed on the five pilots, it works, and stripping the
  copies gives the plain render. But an authored item's clone carries no index, and a guard that hides one item shifts
  every count after it.

Chosen: the runtime stamps at the moment it knows the path (`applyProps`), the index (`expandItems`) and a Ghost field's
scope (`emitBindings`); the editor reads the stamps into a map as it mounts the canvas and removes them in the same task,
so nothing is painted or observable. The core test is what makes this safe: stripped, the render is exactly the render
without `editing`.

### Why the stored value, not the page, holds the marks

The page cannot hold a whole link record, so it cannot be the source of one. `linkAttributes` writes a Portal link as
`href="#" data-portal`, a search link as `href="#" data-ghost-search`, `newTab` and `rel` as `target` and `rel`, and never
writes `ref`. So reading a field's markup back after each keystroke would drop every Portal and search link and every
link's `ref` on the next character typed (found by this spec's review). With token values handed (Story 5.18) it would
also store `Join 1,200+ readers` in place of `Join {members} readers`.

So typing is read from the element as words only. The edit between the words before and after, anchored at the caret, is
applied to the stored value, which keeps its marks and records. The element is rewritten from the serializer whenever its
nodes differ. Only a paste, which brings no record, is read for its marks.

Three traps, all in the controller:
- **Compare nodes after `normalize()`, with U+00A0 equal to a space.** A typed trailing space is U+00A0, and rewriting
  it into a plain space makes the space invisible and moves the caret. It is stored as a space and left alone on the page
  until the field is rewritten for another reason.
- **A `\n` at the very end needs a second `<br>` to show its empty line.** The editing element may carry that one extra
  `<br>`; `readText` ignores it.
- **A character typed right after a bold word is bold, and one typed right after a link is not.** That is the usual
  expectation, and it is `replaceRange`'s `typed` rule rather than whatever markup the browser happened to write.

### What was executed while planning

Three claims were executed on 2026-09-17 in headless Chromium (Playwright 1.61.1, `chromium-1228`). Each ran against a
same-origin iframe carrying a heading, a form with a submit button and a paragraph, with the canvas's own listeners:
`click` and `submit` prevented. The probes are scratch files, not committed.
- **A caret lands where the pointer does.** A `mousedown` that sets `contenteditable` on the heading and is not prevented
  put a collapsed caret inside the heading at the clicked offset, and the heading took focus. Control: a `mousedown` on
  the paragraph, prevented, left focus on `body` with no selection.
- **The toolbar keeps the canvas's selection.** With "spring" selected inside the iframe, a click on a button in the
  parent document whose `mousedown` is prevented fired the button's `click`, and the iframe kept focus, its active
  element and "spring". Control: a parent button without the prevented `mousedown` took focus, and the iframe lost it.
- **A `<button>`'s label.**
  - `contenteditable` on the button itself took no typing: Space and Enter clicked the button.
  - A `contenteditable` span inside it, reached by the pointer, took none either: the button kept focus.
  - What worked was the button's `mousedown` prevented and the span focused with the caret placed by script. Typing gave
    "Subscribe!x y" with four `input` events; the space fired one `click` on the button, which the prevented `click`
    kept from submitting. Control: the same path on the paragraph typed normally.

This spec's review executed two more:
- **Moving between fields.** A press from an editing heading into its paragraph fires the paragraph's `mousedown` before
  the heading's `focusout`. A repaint at that `focusout` destroyed the field just started, and is why moving between
  fields repaints nothing.
- **Focus across the documents.** When focus moves into the editor document, the iframe's `focusout` names no
  `relatedTarget`. And a `popover="auto"` in the editor document stays open after a press inside the iframe.

### Why the toolbar hides while the canvas scrolls, and the pill does not

Story 5.2's finding: anything positioned from the editor document trails the compositor's scroll by a frame, 8–15px.
- **The toolbar** is pressed and takes focus, so it lives outside (AD-21, and EXPERIENCE.md's focus model). It hides on
  the first scroll event and returns over the selection 150ms after the last.
- **The pill** takes no press, so it is chrome in the canvas's own layer, as the name tag is, and moves with its words in
  the same frame.

ponytail: a timer, not `scrollend`; switch when every engine the editor supports fires it.

### Choices made here, one line each

- **Link search reads what the canvas previews:** Orbit Weekly until Story 5.18. FR-F6 names "the connected site, or
  sample data", FR-H4 gives 5.18 the batched live reads link search shares, and the "Pilot sections" project links no
  site.
- **A `text` prop permits no mark and a `richtext` prop permits its own, which is the format built in Story 4.1** (AD-4's
  per-prop allow-list).
  - P0-1's default of four marks is met by declaring `richtext`.
  - The pilots' visible `text` words go to their own category stories (DW-179, AD-35), so on "Pilot sections" the Hero's
    headline shows no toolbar; Three Up's and Newsletter's headings show the full bar.
- **A Text Field is one line; a Text Area takes line breaks.** FR-F1 names the pair, and the panel's Text Field is an
  `<input>`, which cannot hold a `\n` — a line break typed on the canvas would be lost at its next panel edit.
- **The link popover is P0-1's white one** (Story 4.5's), opened in B4b's place at the selection. B4b's ink is B4a's,
  which P0-1 supersedes (EXPERIENCE.md :678).
- **B, I and U are Georgia letterforms,** as P0-1 draws them. The export wins, so DESIGN.md's serif rule gets the
  exception (DESIGN.md :205-210).
- **The toolbar's and the pill's shadow is `md`,** the spec's word (P0 spec :158). The frame's heavier alpha has no
  token.
- **The Kit's `Link` and `LinkOff` stand in for P0-1's slightly different link drawing:** mounted, not redrawn.
- **Remove link has no caption when greyed.** P0-1 draws it as a toolbar slot at 35%; P0-0's caption slot belongs to
  panel controls.
- **No docked bar at 390.** No editor session reaches a 390 canvas on a touch screen (R-87), and device preview (5.7)
  keeps a pointer.
- **A mark needs a selection:** ⌘B with a collapsed caret does nothing. ponytail: a pending mark for the next typed
  characters is the upgrade.
- **Undo inside a field is the browser's own** until Story 5.8's journal.
- **A prop hidden while empty has nothing to click** (a `data-empty="hide"` eyebrow); its panel field edits it.
- **A click on the theme's own words does nothing** (`data-t` — "Sign in", "Newer posts"); they are the Translations
  surface's (Story 7.12).
- **`maxChars` counts UTF-16 code units,** so an emoji counts two. ponytail: count graphemes if a design's limit is ever
  that tight.
- **A `plainText` value is a field with no marks here.** It is a prop bound to a Ghost Admin setting, which nothing
  creates before Story 7.10; the pill naming its setting is 7.10's.
- **The pill's words for a Ghost field come from one list beside the context matrix** (`labels.json`), so a new field
  in the matrix fails a test until it has a name.
- **The pill says "{Name} — set in Ghost", without P0-1's "plain text".** Ghost's own words cannot be edited here at all.
  7.10's pill, on a prop promoted to Ghost Admin, marks words that stay editable as plain text, and keeps it.
- **The token row has no "On the site: …" line:** its values are the connected site's (5.18).
- **A keyboard user edits text in the panel's field,** EXPERIENCE.md's second way. Reaching a canvas element by keyboard
  is Story 5.9's map.

## Verification

**Commands:**
- `pnpm check` (Node 24 on PATH) -- expected: green, including `marks.test.ts`, `ad36.test.ts`, `index.test.ts`,
  `agreement.test.ts`, `contexts.test.ts`, `validate.test.ts`, `selection.test.ts`, `pilots.test.ts`, `controls.test.ts`,
  `tokens.test.ts`, `busy.test.ts` and `doc-schema-jitless.test.ts`, with `tools/check-snapshots.mjs` reporting no change
- `bash tools/matrix/run-matrix-gate.sh` -- expected: green, with no baseline written
- `python3 tools/doc-audit.py --check`, run twice -- expected: exit 0
- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) node tools/probe/run-verify-editor.cjs`,
  after CI deploys HEAD -- expected: every step PASS against `https://app.inflozo.com` and production Supabase, with two
  throwaway accounts deleted in `finally` and the user count equal before and after
- `env $(grep -E '^SUPABASE_(URL|SECRET_KEY)=' tools/probe/.env | xargs) node tools/probe/run-verify-controls.cjs` --
  expected: every step PASS, including the limit step, and the link field still opens, searches and commits after
  `LinkPanel` is split out

**What the new steps check,** on the seeded Home at 1440×900, each inside step 5's CSP session:
16. **Typing, and moving between fields.**
    - Select Three Up, then click at the end of its title. The canvas's active element is the title and
      `isContentEditable`; the root is the same node and still selected.
    - Type " and summer": the canvas title ends with it, and the panel's Title field shows it.
    - Click at the end of the sub and type " Two": the sub ends with it, the title still ends with " and summer", and
      the root is still the same node.
    - The canvas holds no `data-inflozo-prop`.
17. **The toolbar.**
    - Select "spring" in the title. The editor document shows `[role="toolbar"][aria-label="Text formatting"]` with
      buttons named Bold, Italic, Underline, Link, Remove link in that order, and Remove link `aria-disabled`.
    - Its box is centred on the selection's on-screen rect within 1px, its bottom 8 ± 1px above.
    - Bold: the title's markup holds `<strong>spring</strong>` and Bold is `aria-pressed`; Bold again removes it.
    - `ControlOrMeta+i` wraps `<em>`.
    - `Alt+F10` focuses Bold. `ArrowRight` twice, then `Enter`, wraps `<u>`.
    - `Escape` returns focus to the title with `getSelection()` still "spring".
18. **Narrowed fields.** Select Hero — Latest Post.
    - A word in its sub shows exactly Link and Remove link.
    - A word in its headline shows no toolbar, and `ControlOrMeta+b` leaves the headline's markup unchanged.
19. **Links.**
    - In Hero's sub, select a word and press Link: a dialog opens with its search focused.
    - Type `night`, choose "The night shift at the Port of Algeciras", press Done. The word is
      `<a href="https://orbit-weekly.example/the-night-shift-at-the-port-of-algeciras/">`, and a click on it leaves the
      canvas's `location.href` unchanged.
    - Select another word, press Link and the "Sign up" chip, then Done. That word is `<a href="#" data-portal="signup">`.
    - Type "x" at the start of the sub. Both anchors are unchanged.
    - Selecting inside the post link enables Remove link, which removes that `<a>` only.
    - Open Link again, then press on the canvas: the dialog closes and the sub's markup is unchanged.
20. **Paste.** A `paste` event carries this `text/html`: `<b>Bold</b> <i>it</i> <u>un</u>
    <a href="https://x.example/">ok</a> <a href="javascript:window.__pwned=1">bad</a><img src="/x"
    onerror="window.__pwned=2"><script>window.__pwned=3</script><span style="color:red">red</span>`.
    - Into Three Up's sub: `strong`, `em`, `u` and the https `a` survive; "bad" and "red" arrive as text; no `img`,
      `script` or `style`.
    - `window.__pwned` is undefined in both documents.
    - Into Hero's sub: only the https link survives.
21. **Line breaks.**
    - `Shift+Enter` in Three Up's sub writes a `<br>` there, and the panel field shows two lines.
    - `Enter` in Hero's headline leaves its markup unchanged.
22. **A button's label.**
    - Select Newsletter — Inline Row, click into Subscribe and type "! now".
    - The button reads "Subscribe! now", no `submit` event fired, and `location.href` is unchanged.
23. **Ghost's words.**
    - With Hero selected, click the card's post title. `chromeNow` finds a pill reading "Post title — set in Ghost" in a
      chrome host, and the title is not editable.
    - `Escape` deselects and the pill is gone.
24. **Esc and focus.**
    - Editing Three Up's title, `Escape` removes `contenteditable` and the section stays selected; `Escape` again
      deselects.
    - The rest check, right after that second Esc: zero `data-inflozo-*` attributes and zero `contenteditable` in the
      canvas document.
    - Editing again, a click on the panel's Layout group ends editing and keeps the selection.
    - Then a press on Three Up's padding and `Escape` deselect.
25. **Scroll.**
    - With the toolbar showing over "spring", the wheel scrolls the canvas 200px: the toolbar is hidden.
    - 400ms after the wheel stops it is visible again, centred on the selection's new on-screen rect within 1px.

Step 14 gains a touch tap into Three Up's title once it is selected: the canvas's active element is the title, with a
collapsed selection inside it. Step 8's axe runs twice more, with the toolbar showing and with the link panel open. Steps
1–15 keep their assertions, step 13 clicking Three Up's top padding before its Esc.

**The controls step,** on `https://app.inflozo.com/controls`: in Eyebrow, typing to 35 characters stops at 30 and the
field's hint reads "Eyebrow holds 30 characters."; in Heading, a paste of 60 characters arrives cut at 40 with "Heading
holds 40 characters." under the field.

**Not touched, and why:** Resend, Dodo and the Ghost test servers T1 and T3. This story sends no email, reads no billing,
and reads no Ghost: link search uses Orbit Weekly's sample data until Story 5.18.

## Owner's manual test

The project is the "Pilot sections" project Story 5.1's Deploy added to your account; Deploy re-checks its address. Sign
in as you normally do. If a page stays blank, refresh once and tell us (DW-175).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click "Post Grid — Three Up" once. Then click just after the word "spring" in its heading and type. Then click at the end of the paragraph under it and type again. | ` and summer`, then ` Second.` | The first click only selects the section, as before. The next puts a blinking cursor where you clicked, and the heading changes as you type. Clicking into the paragraph moves the cursor there without anything flickering, and the heading keeps your words. The right panel's Content shows the same words in Title and Sub. |
| 2 | same | Canvas | Double-click the word "spring" in that heading. | — | A small white bar appears just above the word: B, I and U, a thin line, a link symbol, and a paler crossed-out link symbol. Compare it with the first drawing in `P0-1 Inline Text Toolbar.dc.html`. |
| 3 | same | The white bar | Press **B**, then press **B** again. | — | The word turns bold on the page and B looks pressed, in light coral. The second press makes it plain again. |
| 4 | same | The white bar | With "spring" still selected, press the link symbol. In the box that opens, type, pick the post, and press **Done**. Then click just before the first word of that heading and type a letter. Then select "spring" again and press the crossed-out link symbol. | `night`, then `A` | The link chooser opens where the bar was, and the post "The night shift at the Port of Algeciras" is listed. After Done, the word is a link and the crossed-out symbol is no longer pale. Typing elsewhere in the heading keeps the link. The last press removes the link and keeps the word. |
| 5 | same | Canvas | Click "Hero — Latest Post". Double-click a word in the short paragraph under its big headline. | — | The bar holds only the link symbol and the crossed-out one, because that field allows links only. (Its big headline shows no bar: the pilot declares it plain, and the Heroes category story gives it the four marks, as its design notes ask — DW-179.) |
| 6 | same | Canvas | Click "Post Grid — Three Up" once to select it, then click at the end of the paragraph under its heading, press Enter, and type. | `Second line` | The paragraph starts a new line with your words. |
| 7 | same | Canvas | Copy a sentence with bold, colour and a link from any web page. With Three Up still selected, click into its paragraph and paste. Then click "Hero — Latest Post" once, click into its short paragraph, and paste again. | — | In Three Up the words keep bold, italic, underline and links, but lose colour, size and any picture. In Latest Post only the words and the link arrive. |
| 8 | same | Canvas | Click "Newsletter — Inline Row", click into the words on its Subscribe button, and type. | `! now` | The button reads "Subscribe! now". Nothing is sent, and the page does not move. |
| 9 | same | Keyboard | While typing in any heading, press Esc, then Esc again. | — | The first Esc removes the cursor and the section stays selected. The second lets the section go. |
| 10 | same | Right panel | Select Three Up, open Content, double-click a word in the Title box, and press **I** on the white bar that appears over the box. | — | The same bar appears over the panel box. The word turns italic in the box and on the page. |
| 11 | same | Right panel | Select Newsletter — Inline Row and open Content. In the "Social proof line" box, delete `{members}` and leave the cursor where it was, then press the **{members}** chip under the box. | — | Under that box is a small "TOKENS THIS FIELD ACCEPTS" row with {members}. Pressing it puts {members} back exactly where your cursor was. The page shows "{members}" as written until your own site's content arrives (Story 5.18). |
| 12 | same | Canvas | Select Hero — Latest Post and click the post title on its card, then scroll a little. | — | A small white pill appears above the title with a lock and "Post title — set in Ghost", and it moves with the title as you scroll. Nothing becomes editable. Esc takes the pill away. *(Your ruling, R-122.)* |
| 13 | same | Canvas | Click "Post Grid — Three Up" once, double-click a word in its heading so the white bar shows, then scroll the page with the wheel or trackpad, slowly and then fast. | — | The bar disappears while the page moves and comes back over the word when you stop. It never floats over other text. |
| 14 | `https://app.inflozo.com/controls` | Controls review page | Click into Eyebrow and type past its end, then do the same in Heading. | `ABCDEFGHIJKLMNOP` | Each box stops accepting letters at its limit, and a line under it says so: "Eyebrow holds 30 characters.", "Heading holds 40 characters.". |
| 15 | the editor again | Browser | Reload the page. | — | Your typing and formatting are gone. Saving arrives with Story 5.8. |
| 16 | same, on an iPad or a touchscreen, if you have one | Canvas | Tap a section once, then tap inside its heading. | — | The first tap selects the section. The second opens the keyboard with the cursor in the heading. |

## Questions for the owner

### Question 1 — clicking an icon on the page, and icons on buttons: which story builds them?

**Plain English:** On 13 September you moved "click an icon on the page to change it" into this story (DW-115). Clicking
an icon would open the icon chooser beside it, and an empty spot for an icon would show as a small dashed box while its
section is selected. You can already change an icon from the right-hand panel (Story 4.5), so this is only about
clicking it on the page. Planning found two things:
- **Nothing to click yet.** None of your five pilot sections has an icon, so your test page would have nothing to try,
  and until a design with icons arrives only an automated check could try it.
- **Button icons belong to no story.** The same drawing (P0-2) lets you put an icon before or after a button's words,
  and no story builds that at all.

Both first matter in Story 9.1, the first header designs, where every button can carry an icon. Story 9.3's Side Rail
header later adds an icon beside each menu item.

**Example:** In Story 9.1 you select a header and put an icon before its button's words. Then you click that icon on the
page, the icon chooser opens right beside it, and you pick another. With option 1, 9.1 is where both are built and where
you test them. With option 2, the click was built weeks earlier in this story, but 9.1 is still the first time anyone
tries it on a real design.

1. **Build both with Story 9.1, where you can try them:** an icon before or after a button's words, and clicking any
   icon on the page to change it, with the dashed box for an empty one. Both go into 9.1's checklist now, so neither can
   go missing. Story 9.1 gets two editor tasks more, and this story stays about text. **(RECOMMENDED)**
2. **Build clicking an icon in this story anyway,** checked only by automated tests until Story 9.1 brings a design you
   can click. Button icons go with Story 9.1.
3. **Build both in this story,** checked only by automated tests until the designs that use them arrive. This story
   gets noticeably bigger.

**Ruled: option 1 (owner, 2026-09-17).** Recorded as R-121. Story 9.1 builds an icon before or after a button's words
and the canvas icon slot — a click on an icon, filled or empty, opens the Icon Picker beside it, with the dashed box for
an empty one while its section is selected. This story builds neither, and until 9.1 an icon changes from the panel's
Icon Picker field. `epics.md` Stories 5.3 and 9.1 and DW-115's owner moved with the ruling.

### Question 2 — clicking Ghost's own words on the page: what should it show?

**Plain English:** A selected section mixes two kinds of words:
- **Yours** — a headline, a button's words — which this story lets you type into on the page.
- **Ghost's** — a post's title, its tag and date, your site's name — which only Ghost Admin can change.

The design notes for most categories, Latest Post's among them, say a click on Ghost's words should tell you to edit
them in Ghost. The formatting-bar drawing (P0-1) shows how: a small white pill with a lock, naming the words — "Site
title — plain text, set in Ghost". No story builds it, so today a click on those words does nothing at all. The same
pill later names the words you hand over to Ghost Admin, which Story 7.10 builds.

**Example:** You select Hero — Latest Post and click its post title, "The night shift at the Port of Algeciras".
- **Option 1:** a small pill appears just above the title: a lock and "Post title — set in Ghost".
- **Option 2:** the pill says "Set in Ghost".
- **Option 3:** nothing happens, and it is not obvious why the headline beside the title takes typing and the title does
  not.

Under options 1 and 2 nothing becomes editable, and Esc or your next click takes the pill away.

1. **Build it as the drawing shows, naming what you clicked:** "Post title — set in Ghost", "Tag name — set in Ghost",
   "Site title — set in Ghost". It needs a plain name for each piece of Ghost information a design can show, kept in one
   list. **(RECOMMENDED)**
2. **Build it with one wording for everything,** "Set in Ghost", naming nothing. Slightly smaller, but not what the
   drawing shows.
3. **Leave it out for now:** a click on Ghost's words does nothing, and the pill is recorded as a gap for a later story.

**Ruled: option 1 (owner, 2026-09-17).** Recorded as R-122. A click on Ghost's own words in a selected section shows
P0-1's lock pill naming them — "Post title — set in Ghost" — from one list of names beside the context matrix, and
nothing becomes editable. Story 7.10 reuses the pill for a text prop promoted to Ghost Admin; `epics.md` Stories 5.3 and
7.10 moved with the ruling.
