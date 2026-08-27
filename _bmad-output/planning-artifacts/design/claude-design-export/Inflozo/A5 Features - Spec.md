# A5 Features — written specification

16 designs · Paper pack · drawn in this project as `A5-1 Three Up.dc.html` … `A5-16 Panel.dc.html`, with the category's shared artefacts in `A5-0 Category Proof.dc.html`.

Read `A5-0` first. It carries the four settlements §8 asks A5 to make, the head and item ladders, the rules all sixteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated sixteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**.

**Specification-only pass, this session.** Every design now carries five added fields — descriptor, structural descriptor, archetype, behaviour module and items — at the head of its section, above its content fields. Nothing drawn changed, no frame moved, and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand as written. **No module rename was needed.** This document had named no modules at all — it wrote behaviour as motion, state and hand-offs rather than as JavaScript — so nothing here had to be corrected against the fixed 31-module registry (FR-G7). Every module name below is the registry's, and every no-JS sentence is quoted from it rather than composed here.

**A5 uses two modules.** `tabs` on **12 Tabs** and `carousel` on **14 Scroller**. **Fourteen of the sixteen declare nothing at all**, which is what a feature set should be: the head, the items, the icons, the pictures, the numerals and the section action are all in the HTML before any script runs. **Only one design in A5 loses content without JavaScript — 12 Tabs — and the registry's own degradation gives it back.**

**`core` is assumed, not declared per design.** The only JS-conditional CSS in the category belongs to those two designs, and `core`'s own line covers it: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than sixteen times. *Flagged: not listing it per design is mine, as it was in A3 and A4.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. Both are edit-safe, which is why every frame in A5 is a resting state — the tab panel drawn as whichever item the sidebar has selected, the rail still and scrollable by hand.

**The item controls are in the same pass.** A5's one repeater is `items[]` and **all sixteen designs draw more than one of it**, so each carries its own **Items** block: where the list sits, what Add produces, what Remove does at the floor, whether order is load-bearing, the counts the arrangement is designed for, what happens outside them, and what the section renders at zero. The rules the sixteen share are in §0 rather than repeated sixteen times.

**Third pass — the controls-reconciliation patch (this document's current state), 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface, reusing the shared **P0 editor primitives by name** — the P0·1 inline toolbar and link popover, the P0·2 icon slots and Icon Picker, the P0·3 item controls, the P0·4 member-aware action editor, the P0·5 populate-from panel, the P0·6 state switcher — never redesigning them. Every design gains the universal trio outside its own list; every Padding row and every Ground row retires into it; Member visibility lands on the eleven CTA-bearing designs; `itemIcon` becomes the P0·2 icon slot wherever it is drawn; every `itemImage` gains Image focus in the Image Picker popover; and **Content source: Authored · From posts** lands on 8 Media Top, 13 Spotlight and 14 Scroller — the owner's ruling, and the first Ghost data in A5. No layout was redesigned, no module changed, and no section frame moved. Where this pass conflicts with an earlier ruling, the conflict is recorded — one line each — in the closing **Reconciliation notes**, which open with every frame changed.

**Two findings**, at the end: the double heading `tabs` gives 12 with JavaScript off, and the fact that no registry sentence covers 14's rule.

---

## 0. The shared floor

Everything in this section applies to all sixteen unless a design says otherwise.

**The frames draw the section alone on the page ground.** A4 drew the site header above every hero because a hero sits under one. A feature section has an ordinary section above and below it, so a header over these frames would say something false about where the section sits. Where a design's rule concerns its neighbour — 16 Panel's inset, 13 Spotlight's foot — the neighbour is drawn and the caption says so.

**Colour.** Role tokens only — `background`, `surface`, `text`, `text-muted`, `border`, `accent`, `contrast`. Accent is spent once or twice: an icon container at Accent, one section action, a tab's active underline. Two designs spend it per item and say so — 11 Checklist's mark and 15 Index's numerals — and both offer a value that uses no accent at all.

**The head.** Eyebrow 13 px uppercase tracked `.08em` in `text-muted`. Section title in the pack's heading font at Medium 34 / Large 40 / Display 48 on desktop, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390, on a 780 px measure. Sub 17 px muted on 620. The head's ladder is A4's stepped down one full size: a feature section is not the top of a page, and a 60 px line in the middle of one competes with the hero above it.

**The item.** The item title's size is not a control — **it steps with the column count**: 24 px at Two, 21 at Three, 19 at Four; 22 / 20 / 18 at 834; 20 at every count on a phone. Body 16 px in `text-muted`, 15 px at Four across — the brief's floor, and the reason Four is the last count offered. Item meta 13 px muted. **Three designs read the ladder off the column's measure rather than the count** — 5 Split Head, 9 Bento and 14 Scroller — and each says so on its own frame.

**Spacing and gaps.** Section spacing is the universal **Vertical spacing** control (below), resolving Compact 64 · Comfortable 96 · Spacious 132 at 1440, 80 at 834, 64 at 390 — A4's values unchanged. Item gaps 32 px between columns and 40 px between rows at 1440; 24 and 32 at 834; 28 px stacked at 390. Page margin 72 / 40 / 20. Everything on the 8 px grid. Designs that depart: 4 Cards and 8 Media Top use a 32 px row gap (the card's padding is already separating), 2 Two Up uses 44, 7 Alternating Media 72, 15 Index 44, 10 Contrast Band resolves the whole spacing scale one step tighter at 44 · 64 · 88, and 16 Panel fixes the section's spacing at 96 — its Vertical spacing locked, reason shown — and controls the panel's own padding instead.

**The universal trio — this pass.** Every placeable section carries **Background role** (Background · Surface · Contrast), **Vertical spacing** (Compact · Comfortable · Spacious) and **Top divider** (None · Line · Fade, default None) **outside its own control list**. The old per-design Padding rows were Vertical spacing under another name and retire everywhere; the old Ground rows (1, 3, 8, 12) retire into Background role with their constraints kept. Contrast is disabled with its reason shown on the five designs that draw photographs — 7, 8, 12, 13 and 14 — because a photograph on a band needs a scrim A5 does not have, and on 4 Cards, whose planes are drawn on no band anywhere in A5. Background role locks where the ground is the design's identity: **10 Contrast Band** at Contrast (the lift, hairline, action fill and ring re-derive from the carried colour), **9 Bento** and **16 Panel** at Background, each with its reason shown. 2 Two Up's old "no Ground control" ruling survives as the control's advice line rather than a lock — a recorded conflict.

**Member visibility — this pass.** Everyone · Logged out · Free members · Paid members, on the eleven designs that draw the section action: 1, 2, 3, 4, 5, 6, 8, 10, 11, 13 and 15. It hides the whole section server-side; a single action's audience is P0·4's member-aware editor, and the two are scope-tagged apart, as P0·4 draws. The five designs that keep `primaryAction` undrawn — 7, 9, 12, 14 and 16 — bear no CTA and carry no row, stated on each frame.

**Editing — this pass.** Every visible authored text edits inline with the P0·1 toolbar — bold, italic, underline, link, the link popover carrying open-in-new-tab and rel nofollow / noreferrer / sponsored: eyebrow, title, sub, itemTitle, itemBody, itemMeta, itemLinkLabel, tabLabel, the note and the section action's label. Ghost-owned content — post titles, excerpts and feature images arriving through From posts — is never inline-editable: clicking it shows the plain-text lock pill and "Edit in Ghost". Every URL field — `itemLinkUrl` and the section action — opens the Ghost-aware Link Picker. Every button accepts an optional icon before or after its label from the P0·2 Icon Picker, always Small and label-coloured.

**The icon slot — this pass.** `itemIcon` is a **P0·2 icon slot** wherever it is drawn: click opens the Icon Picker; the slot's popover carries Size (Small · Medium · Large) and Colour role (Text · Muted · Accent · On-accent, a role failing AA disabled with its ratio shown); an empty slot renders the design's fall-back mark. On 10 Contrast Band the colour roles re-derive from the carried colour and the empty mark draws in the lift. **The component inventory's "contained 1:1 upload" alternative is dropped** — an upload cannot recolour for dark mode and sits outside the closed vocabulary.

**Image fields — this pass.** Every `itemImage` carries **Image focus** (Centre · Top · Bottom), reachable from the Image Picker popover — never a hidden field and never a panel row — on every design that draws one: 7 Alternating Media, 8 Media Top, 9 Bento's item 1, 12 Tabs, 13 Spotlight and 14 Scroller. The fixed 3:2 and 16:9 crops no longer decapitate portraits.

**Visitor-facing strings.** A5 ships almost none: every sentence a reader sees is an authored field already. The exceptions are named — 14 Scroller's arrow labels ("Previous features" / "Next features") are theme translation-catalog strings, as is the label-as-heading 12 Tabs' module emits with JavaScript off. Editor advisories, placeholder copy and repeater warnings are editor chrome, never theme strings.

**No "Preview" controls.** A5 never had one and none was added; states while editing are the P0·6 switcher's job, and A5's two behavioural designs rest as drawn.

**Headings and landmarks.** The section is a `<section aria-labelledby>` named by its own title, an `<h2>`. Item titles are `<h3>`. **The items are a list** — a `<ul>` of `<li>` — because a feature set is a count of things and a screen reader should say how many. With no section title the section is not a labelled region and the item titles step to h2.

**The section action.** At most one, under the set, centred with a centred head and at the left margin with a left one. It is A1·1's button at A1·1's size — accent fill, 14 px/600, padding 9×17 — **not A4's hero scale**: a button in the middle of a page is not the page's first ask. A row of actions is A6's. 5 Split Head is the only design whose action is not under the set.

**Responsive floor.** Every count is one column at ≤ 767 unless the design names another arrangement — 3 Four Up keeps two where its body copy is hidden, 11 Checklist keeps two, 14 Scroller keeps its rail, 15 Index keeps two at Compact. At 1080 and below Four becomes two and Three becomes two; Two stays two. A design that changes arrangement at a width states the width in words.

**Data.** Features are authored — there is no feature object in the API — and every number a reader sees is typed by the site owner, **with one owner-ruled exception this pass: 8 Media Top, 13 Spotlight and 14 Scroller carry Content source (Authored · From posts) through the P0·5 panel** — picture ← the post's feature image, title ← post title, body ← excerpt, item link ← the post. Bound, the item list is the P0·3 Ghost-sourced list — no Add, no Remove, no drag — and post content is plain-text-locked. The other thirteen stay authored-only, and the hand-off note pointing post-shaped wants at A17 stays for them. Every design is offered on every route.

**Empty.** No items authored → the section does not render and the editor names the field. No eyebrow, sub, action or note → each simply absent. Per-design empty states are below.

**The item list.** A5 has one repeater and every design draws it: **`items[]` — `itemTitle` (req), `itemBody`, `itemIcon`, `itemImage` + `itemImageAlt`, `itemMeta`, `itemLinkLabel` + `itemLinkUrl`, `tabLabel`** — every field authored, nothing from Ghost. The list sits in the sidebar as **Items**, under the head's own fields and above the design controls: one row per item carrying its title, a drag handle and a remove action, with **Add item** at the foot. Selecting an item on the canvas selects its row and opens that item's content fields. Keyboard: ⌥↑ / ⌥↓ moves the focused row. **The list is the P0·3 authored item list by name** — drag rows, per-row overflow with Duplicate · Remove, Add at the foot with placeholder content, the range line in the group head; on 8, 13 and 14 at Content source: From posts it becomes the P0·3 Ghost-sourced list instead.

**Add item lands last in every design in A5** — there is no design here where a new item arrives anywhere but the end of the set — and it arrives carrying content rather than an empty shell: `itemTitle` “A new feature”, `itemBody` “One sentence on what it gives a reader.”, the fall-back mark for `itemIcon`, no picture, no link, with the title selected for typing. A design that draws pictures gets its own text-tile rule for the moment before one is chosen, which is the empty state it already specifies rather than a gap. *Flagged: the placeholder's wording and the land-last rule are mine.*

**Remove** is on the row and is undoable. Each design states its own floor below; where removing crosses one, the sidebar names the design that suits the smaller set and offers the switch, and nothing is deleted that removal did not delete. **Removing an item renumbers nothing anywhere except 15 Index**, which says so and warns first.

**Order** is authored order, DOM order and visual order in all sixteen — 9 Bento's Large tile Right and 7's alternation are grid placement, never a source reorder. Order is **load-bearing on five designs and reading order only on the other eleven**: 9 Bento (item 1 is the large tile), 12 Tabs (item 1 is what a published page opens on), 13 Spotlight (item 1 is the spotlight), 14 Scroller (the first cards are what a reader sees before scrolling) and 15 Index (position generates the numeral). Each says so on its own repeater rather than leaving it to be discovered.

**Counts.** Every design names the band its arrangement is drawn for and what it does at each end. **The category ceiling is nine**, past which Add is disabled and the editor names A17 Post Grids — with three stated exceptions that run to twelve: 3 Four Up, 11 Checklist and 15 Index.

**Zero items** → **the section does not render**, in all sixteen: no head over an empty set, no placeholder items, no empty cells, no band or panel with nothing in it. The editor names `items[]` as the field it needs. This is §0's empty state restated in item terms, and no design in A5 varies it.

**Two rules about item controls, and they are architectural rather than stylistic.** (1) **A design control writes one value onto the section and the stylesheet reads it, so it applies to every item at once.** “Make card 3 bigger”, “give the second item the accent” and “centre only the last one” are not expressible by construction. Where the category needs one item larger than its neighbours, that is a separate design — **9 Bento and 13 Spotlight are exactly that**, and both take the emphasis from the item's position rather than from a per-item control. (2) **Inside an item the user edits content only** — its text, its picture, its link. Never its layout, spacing, alignment or emphasis. Selecting an item on the canvas gives that item's fields and nothing else. **The one thing that looks like an exception is not one:** 9 Bento's two media controls are two section values read by two grid areas, so the item in the large area takes the large treatment whichever item is dragged there.

**Inside an item, shared.** `itemTitle` is required in all sixteen; every other field is optional. Which fields a design draws is on its own Fields line and what a drawn field's absence looks like is on its own Empty line — the fall-back mark for a missing icon, the text tile for a missing picture, an ended item for a missing body, an empty rule end for a missing meta. A field a design does not draw is **kept rather than cleared**, so switching designs keeps the pictures, metas and tab labels and switching back draws them again. *Flagged: the keep-on-switch rule is mine, as it was in A2 and A4.*

**Motion.** Hover only, 160 ms ease-out, one transition per state change, except 12 Tabs. Nothing scales, lifts or fades on hover anywhere in A5. Reduced motion removes transitions and keeps states.

**Content.** Orbit Weekly throughout: six items — the weekly letter, the full archive, field notes, reader threads, the source files and the printed quarterly — with Office hours, a reading list and three more authored for the frames that need them, each named in its caption.

---

## 1. Three Up

A centred head over three bare items on the page's own ground. The category's floor: it sets the item, the grid, the head and the section action, and the fifteen designs after it are departures from it.

**Descriptor.** The category's floor — a centred head over three bare items on the page's own ground, adding nothing to the item, the grid, the head or the action, and the arrangement the fifteen designs after it are departures from.

**Structural descriptor.** `grid-of-N · none · page · many · none · three bare columns`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Head, items, icons and the section action are server-rendered, and every state in the design is a CSS hover or focus. **JS off:** identical — which is what gives the designs that hand back here somewhere to hand back to.

**Items.**

- **Add.** **Add item** at the foot of the list, landing **last** — the end of the last row — with §0's placeholder content.
- **Remove.** On the row, undoable, **never disabled**: this design has no floor to defend above one. At one item the row divides by the item count and the item takes the content width, and the sidebar names 13 Spotlight for a section whose subject is one feature.
- **Reorder.** Drag. **Reading order only** — no column is larger, accented or first in anything but sequence, and there is no control that would make one so.
- **Counts.** Designed for **three, six or nine** — full rows of three. Below three the row divides by the item count and the items keep their left alignment; two items are 632 px each, which is 2 Two Up without its body cap, and the sidebar says so. A short last row keeps its column width rather than centring. Add is disabled at nine with A17 Post Grids named.
- **Zero.** The section does not render.
- **Inside an item.** `itemTitle` (req) · `itemBody` · `itemIcon` · `itemLinkLabel` + `itemLinkUrl` — all editable, all but the title optional. No body → the item ends. No item with a body → the row gap tightens 40 → 32 across the whole set, a section value read off the list rather than a per-item one. No icon → the fall-back mark. Empty link pair → the item is text. `itemImage`, `itemMeta` and `tabLabel` are kept and never drawn.

*Flagged, this pass: the three-six-nine reading of the grid, the two-item hand-off wording, and the nine-item ceiling being the category's rather than this design's.*

**Fields.** `eyebrow` · `title` · `sub` · `items[]` (`itemTitle` req · `itemBody` · `itemIcon` · `itemLinkLabel` · `itemLinkUrl`) · `primaryAction` · `note`. `itemImage`, `itemImageAlt`, `itemMeta`, `tabLabel` kept and not drawn.

**Controls.** Media (Icon · Icon in a tint · Icon in accent · None) · Head alignment (Centred · Left) · Below the set (Action · Note · Nothing) · Item link (None · Text link) · Member visibility. Universal: Background role (the old Ground row, all three values — Contrast is still the band without 10's own controls) · Vertical spacing resolving 64 · 96 · 132 · Top divider.

**Picture is not offered.** A photograph needs an edge to sit against and these items have none — a picture on the page ground with text under it is 8 Media Top without its card. **Icon in accent disables the Action value** of Below the set, with the reason shown: six accent squares and an accent button is the accent spent seven times.

**The grid.** Three 410 px columns on a 1296 px content width, 32/40 gaps, the head 780 / 620 px and centred, 64 px above the set and 56 px below it. A short last row keeps its column width and stays left-aligned; fewer than three items divides the row by the item count. **The items stay left-aligned at both head alignments** — centring six short paragraphs in three narrow columns leaves the body copy two ragged edges.

**Responsive.** Three across down to 1081; two across at 1080 and below (gaps 24/32, padding 80, title 34, item title 20); one column at ≤ 767 with 28 px between items, 24 with Media None, the head left-aligned whatever the control says, the action full width at 48 px.

**Empty.** No body on an item → the item ends. No item with body → the row gap tightens 40 → 32. No icon → the fall-back mark.

**a11y.** The floor, as §0. Icons `aria-hidden` at every treatment, including Icon in accent where they are the most conspicuous thing in the section. Zoom: at 200% text the three columns become one and the 40 px container does not grow.

**Flagged.** The 410 px item and the 64/56 px separations, the action's return to A1·1's metrics, the four Media values, refusing Picture, disabling the action at Icon in accent, the items' independence from the head's alignment, the 1080 breakpoint, the 28/24 px mobile gaps, and the container's dark-mode step to `#2B2620` on a surface ground.

---

## 2. Two Up

Two items across a 632 px column each, for features that need a sentence rather than a phrase. The extra width creates the problem 1 never has, and this design settles it.

**Descriptor.** The only design that caps its body copy inside a column wider than the cap — a 520 px measure in a 632 px item — which is the whole of what separates it from 1 Three Up with a column removed.

**Structural descriptor.** `grid-of-N · none · page · few · none · capped 520 px measure`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The cap is a `max-width`, the icon-beside-text arrangement is a flex direction, and the 1081 override that forces Stacked is a media query. **JS off:** identical.

**Items.**

- **Add.** Last, with §0's content — a sentence rather than a phrase in the body, which is what this design exists for.
- **Remove.** Never disabled. At one item the item takes the full 1,296 px **and the 520 px cap holds**, so the design at one item is a capped paragraph rather than a stretched one.
- **Reorder.** Drag. **Reading order only**, left to right then down.
- **Counts.** Designed for **two or four** — even counts, one or two rows. An odd count leaves the last cell empty rather than widening it. Add is disabled at six, with 1 Three Up named for a set that has outgrown a sentence an item and 6 Rows for one that has not.
- **Zero.** The section does not render.
- **Inside an item.** As 1. No body → the item is a title and an icon and the cap does nothing. **Link labels must differ across the set** — the design's own a11y rule — and the editor advises as the list is edited rather than at save, without appending the item's title to the accessible name.
- **Zero styling per item.** Item arrangement, the container size and the cap are one value each on the section: an item whose sentence needs a wider measure than its neighbours is 6 Rows.

*Flagged, this pass: the even-count preference, the six-item cap and both named hand-offs.*

**Fields.** As 1.

**Controls.** Media (48 px container) · Item arrangement (Icon beside the text · Stacked) · Head alignment (Left · Centred, **Left being the default**) · Below the set (Action · Note · Nothing, **Note the default**) · Item link (None · Text link) · Member visibility. Universal: Background role · Vertical spacing · Top divider.

**Ground, reconciled.** The old "no Ground control" ruling meets the universal Background role and loses the row-refusal, not the argument: the control ships, and its advice line still names 16 Panel for two items on `surface` and 10 Contrast Band for two on `contrast`. Recorded in the Reconciliation notes.

**The grid.** Two 632 px columns, 32 px between, 44 px between rows. **The body is capped at a 520 px measure inside the 632 px item** — about 78 characters a line, and the reason this is not 1 with a column removed. Icon beside the text is the default because a 48 px container and its 20 px gap leave 564 px, at which the cap is doing almost nothing. The icon's top aligns to the title's cap height, a 3 px optical lift.

**Responsive.** Two across at every width above 767 — the only count that survives the tablet unchanged. **Below 1081 the arrangement is Stacked whatever the control says** (container 44, title 22, gaps 24/36). One column at ≤ 767, link label 15 → 16 px with a 44 px target that extends past the label.

**Empty.** As 1. An odd item count leaves the last cell empty; one item takes the full width with the 520 px cap holding it.

**a11y.** As §0, plus one addition — **six link labels must differ**, and the editor advises when they do not without appending the item's title to the accessible name. At 400% zoom the container is dropped and the arrangement becomes Stacked.

**Flagged.** The 520 px body cap, the 44 px row gap, the 48 px container, Left as the default head alignment, dropping Ground and both named destinations, the 3 px cap-height lift, the 1081 arrangement rule, the six-labels advisory, and the 400% behaviour.

---

## 3. Four Up

Four items across 300 px each, the densest grid the ladder allows, and the design for eight or more.

**Descriptor.** The only design that offers to remove its own body copy — the control that buys a fourth column, and the reason the ladder stops there rather than at a fifth.

**Structural descriptor.** `grid-of-N · none · page · many · none · optional body copy`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Body copy Hide removes the paragraph server-side rather than hiding it in the browser, so there is no state to restore and nothing keyed off `.js-enabled`. **JS off:** identical at both values of the control.

**Items.**

- **Add.** Last. At **Body copy Hide** the placeholder body is still written and still kept — the copy stays in the editor at that value, which is the control's own rule — and it is simply not drawn.
- **Remove.** Never disabled. Below four the row divides by the item count; at three the section is 1 Three Up at a 36 px container and the sidebar names it.
- **Reorder.** Drag. **Reading order only.**
- **Counts.** Designed for **eight or twelve** — full rows of four, and this is the design for the long set. Six items give a row of four and a row of two, left-aligned at their column width. **Add is disabled at twelve**, one of the three places in A5 that pass nine, with A17 Post Grids named.
- **Zero.** The section does not render.
- **Inside an item.** `itemTitle` (req) · `itemBody` (drawn at Show, kept at Hide) · `itemIcon` · the link pair, **unavailable at Body copy Hide** — a 14 px label under a hidden paragraph is a link to nowhere the reader has been told about. No icon → the fall-back mark at 36 px. `itemImage`, `itemMeta` and `tabLabel` kept, never drawn.

**Fields.** As 1.

**Controls.** Media (36 px container) · **Body copy (Show · Hide)** · Head alignment · Item link (None · Text link at a **14 px label**, unavailable at Body copy Hide) · Member visibility. Universal: Background role (the old Ground row) · Vertical spacing · Top divider.

**Why no fifth column.** A fifth column on 1296 px is a 233 px item, where a 19 px title takes twelve characters a line and the body would fall to 13 px, under the brief's floor of 15. The answer is Body copy Hide at four columns rather than a fifth column.

**Body copy Hide** removes the paragraph from the DOM rather than hiding it visually, keeps the copy in the editor, tightens the row gap 40 → 32, and keeps two columns at ≤ 767.

**Responsive.** Four across down to 1081; **two across at 1080 and below — never three**, since 754 px in three is the 235 px item this design already refused. At ≤ 767: one column with body copy (title 20, body 16 — both larger than at 1440); **two columns with body copy hidden** (165 px each, title 18, gaps 20/24).

**Empty.** As 1. Six items give a row of four and a row of two, left-aligned at their column width.

**a11y.** The short row is announced as nothing — six `<li>` in one list, no element in the empty cell. Accent-fill glyphs are measured against the fill, 4.9:1 light and 6.1:1 dark, with the glyph in the pack's background colour rather than white.

**Flagged.** The 36 px container and the container ladder, the 14 px link label, the 233 px refusal, Body copy as a control and its three consequences, the two-column phone rule and its tie to that control, the 1080 step, and drawing two extra items in the Body copy frame alone.

---

## 4. Cards

1's grid with each item on its own plane. Settles the plane, the row-height stretch and Whole item — the three things half the category borrows.

**Descriptor.** The design that settles the plane — every item on its own surface at a fixed 28 px padding, stretched to the row's height with its text held at the top — the three things half the category borrows rather than re-deciding.

**Structural descriptor.** `grid-of-N · none · page · many · none · one plane per item`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The three treatments, the dark substitution, the row-height stretch, the hover's ground step and Whole item are CSS and an `<a>`. **JS off:** identical.

**Items.**

- **Add.** Last, with §0's content. The new card stretches to the row's height like every other and its text sits at the top, so a card with less to say arrives with space at its foot rather than padded out.
- **Remove.** Never disabled. At one item the card takes the content width and the sidebar names 13 Spotlight, or A6 CTA Banners where the single card carries an action — a 1,296 px card holding one title is a banner.
- **Reorder.** Drag. **Reading order only. No card is featured**, and there is no control that would make one so: the plane, the padding and the treatment are section values, which is why 9 Bento exists.
- **Counts.** Designed for **three, six or nine**. Below three the row divides by the item count. Add is disabled at nine with A17 Post Grids named.
- **Zero.** The section does not render — no empty planes.
- **Inside an item.** As 1. At **Whole item** the card's accessible name is `itemTitle` and `itemLinkLabel` is kept and unused, so an item's link label is not editable at that value and the sidebar names the control holding it. `itemLinkUrl` stays editable at every value — it is the card's destination at Whole item.

**Fields.** As 1. At Whole item the card's accessible name is `itemTitle` and `itemLinkLabel` is unused and kept.

**Controls.** Card treatment (Hairline · Tinted · Raised) · Media · Head alignment · Item link (None · Text link · Whole item) · Below the set · Member visibility. Universal: Background role with Contrast unavailable (planes on an inverted band are drawn nowhere in A5; 10 draws bare items) · Vertical spacing · Top divider. The 28 px card padding stays fixed and is no control.

**The card.** Three 410 px columns, `surface`, the pack radius on all four corners, **28 px of padding as a fixed value rather than a control**, 32 px between columns and rows. Hairline adds one `border` hairline and the sm shadow; Tinted is the hover surface with neither; Raised is the md shadow with neither, and **a hairline instead of the shadow in dark** — A4·18's rule, carried, which makes Raised and Hairline the same object in dark, and the editor says so rather than hiding the value.

**The container steps away from the card, not the page:** hover surface on a surface card, `surface` on a tinted one, `#2B2620` on a dark card.

**Hover at Whole item.** The plane steps one value, the title takes a 1 px underline at a 3 px offset, a picture inside darkens 4%, **nothing scales, lifts or gains a shadow** — Raised keeps its md shadow unchanged. Focus is a 2 px accent ring 2 px outside the card.

**The row stretch.** The planes stretch to the row's height and the text stays at the top of each. The shorter card is not padded out, its title is not centred and its body is not stretched: empty space at a card's foot is the honest shape of an item with less to say.

**Responsive.** Three across to 1081, two at 1080 and below with card padding 28 → 24 and the gutter 24 — the one width where the gap between cards equals the space inside one. One column at ≤ 767, **16 px between cards** rather than 28, padding 24.

**a11y.** At Whole item the card is one `<a>` inside the `<li>` wrapping the h3 and the paragraph, named by the title, with no `aria-label` over it; one tab stop per item; focus on the card's edge, not the title's. The three link values are exclusive because a link inside a link cannot be described — the panel disables rather than warns.

**Flagged.** The 28 px fixed card padding, the 32 px row gap and 48 px action gap, the three treatments, the inverting container tint, reusing A4·18's dark substitution, the hover's ground step and the refusal of a lift, the ring's 2 px offset, and the 16 px phone gap.

---

## 5. Split Head

The head as a left column beside a two-across grid, with the section's one action inside it.

**Descriptor.** The only design whose head is a column beside the items rather than a block above them, and the only one whose section action sits inside that head at every width.

**Structural descriptor.** `split · none · page · many · none · head column beside grid`

**Archetype.** split

**Behaviour module.** **none.** Follows the scroll is `position: sticky` with a bounded 96 px offset — CSS, not script — which is why reduced motion does not change it and why it needs no fallback. **`scroll-spy` is the near miss and is deliberately not declared:** its job is tracking which item is current, and nothing in this head is current. **JS off:** identical, sticky included.

**Items.**

- **Add.** Last. The list sits under **Head width** in the panel, the head's own fields being above it.
- **Remove.** Never disabled, with one consequence worth stating: **Follows the scroll is available only while the grid is at least 240 px taller than the head** — about five items — so removing items can withdraw the value, and the panel says why rather than leaving a control that does nothing.
- **Reorder.** Drag. **Reading order only.**
- **Counts.** Designed for **four to eight** — a two-across grid beside a 440 px head. Fewer than three divides the grid by the item count and the head keeps its width. Add is disabled at nine with A17 named.
- **Zero.** The section does not render. **The head column is not drawn over an empty grid** — a head with nothing beside it is a column of sub, which is the same argument as the effectively-required title.
- **Inside an item.** `itemTitle` (req) · `itemBody` · `itemIcon` (media default None) · the link pair. `primaryAction` and `note` belong to the head rather than to any item, so no item can carry the section's one action.

**Fields.** As 1, with `primaryAction` and `note` drawn **in the head column**. The section title is effectively required — a head column with no title is a column of sub, and the editor says so rather than rendering it.

**Controls.** Head width (Narrow 380 · Medium 440 · Wide 520, gutter 64 at all three) · Head behaviour (Stays at the top · Follows the scroll) · Media (Icon · Icon in a tint · None, **default None**; Icon in accent not offered, the accent being spent on the action) · Below the head (Action · Note · Nothing) · Item link (None · Text link) · Member visibility. Universal: Background role · Vertical spacing · Top divider. Where the head's action targets a Portal action it takes P0·4's member-aware editor, scope-tagged apart from the section row.

**The division.** 440 + 64 + 792 at the default, the grid in two 380 px columns. **The item title is read off the column's measure rather than the count** — 380 px is Three Up's column within thirty pixels — and at Head width Wide it steps 21 → 19, since 340 px is Four Up's.

**Follows the scroll** is `position: sticky` with a 96 px top offset, bounded by the section, **offered only where the grid is at least 240 px taller than the head** (about five items) and only above 1080. Reduced motion does not change it: sticky is a position, not an animation.

**Responsive.** The column division holds to 1081. **At 1080 and below the head goes above the grid on a 600 px measure and the grid keeps two columns**; Head width and Head behaviour are both unavailable and the panel says why. One column at ≤ 767, the action full width at 48 px **still in the head**.

**Empty.** No sub → the action rises to 24 px under the title. Fewer than three items → the grid divides by the item count and the head keeps its width.

**a11y.** Head then list in the DOM at every width. The action is inside the `<header>` and is the section's first tab stop: the offer, then its evidence. Sticky moves nothing in the DOM, traps no focus, and is dropped at 200% zoom.

**Flagged.** The 440/64/792 division and all three head widths, the measure-read title and its step at Wide, the sticky offset and its 240 px threshold, reduced motion leaving sticky alone, the action's place in the head at every width, None as the media default, refusing Icon in accent, and the 1080 stack.

---

## 6. Rows

One item per full-width row, a hairline between. The only arrangement in A5 where an item has as much room as it wants.

**Descriptor.** The only design that gives each item a full-width row of its own with a hairline between, and the design that introduces `itemMeta` at the row's right end.

**Structural descriptor.** `stack · none · page · many · none · hairline-divided full-width rows`

**Archetype.** stack

**Behaviour module.** **none.** Hairlines are `border-top` on the `<li>`, the 16 px hover overhang is a negative inline margin, and Whole row is an `<a>`. **JS off:** identical.

**Items.**

- **Add.** Last — the bottom row, under the last hairline. The placeholder arrives with no meta, so a new row's right end is empty until something is typed there.
- **Remove.** Never disabled. At one item the design is a single row between two rules, and at **Rules None** it is a title, a body and a meta with no rule at all, which the sidebar names 13 Spotlight for.
- **Reorder.** Drag, and it is the only thing that sets the reading order — nothing else here distinguishes one row from another. **Reading order only.**
- **Counts.** Designed for **three to seven**, and there is no arrangement to break: the row holds at every count and every width, which is what the design is for. Add is disabled at nine with A17 named.
- **Zero.** The section does not render.
- **Inside an item.** `itemTitle` (req) · `itemBody` (**unclamped** here) · `itemIcon` · `itemMeta` (≤ 24) · the link pair. No meta → that row's right end is empty and the others keep theirs. No body → the row is a title and a meta, about 84 px tall. **“Members only” typed into a meta is plain text and stays plain text** — no glyph, no badge, no state; A32 Paywall owns everything that knows a reader's membership.

**Fields.** As 1, **plus `itemMeta`** (≤ 24) — the design that introduces it. `itemBody` is **unclamped** here, as on 13.

**Controls.** Rules (Between · Between and outer · None) · Media (40 px, at the row's left, top-aligned to the title) · Item meta at the right (Show · Hide) · Head alignment (Left · Centred, Left default) · Item link (None · Text link · **Whole row**) · Member visibility. Universal: Background role · Vertical spacing · Top divider.

**The row.** 28 px of padding above and below, fixed; a 40 px container; a 24 px title; a 16 px body on a **620 px measure**; the meta 13 px muted, never wrapping, top-aligned to the title with a 6 px optical lift — A4·17's rule, carried. **Rules None steps the row padding 28 → 36**, since with no hairline the space between two titles was doing all the separating.

**Hover at Whole row.** Hover surface across the content width **and 16 px beyond it on each side**, the title underlined, the icon's tint inverted, the meta unchanged, nothing moving. Focus is a 2 px accent ring on the row's box at the pack radius — the one place a row has corners.

**Responsive.** The row holds at every width. **At 1080 and below the meta leaves the right-hand end and sits under the body**, left-aligned at 13 px; row padding 24, title 22. At ≤ 767 the row stacks — container, title, body, meta — at 20 px of row padding, 24 at Rules None; **the icon never moves beside the title**.

**Empty.** No meta on an item → that row's right end is empty and the others keep theirs. No body → the row is a title and a meta, about 84 px tall.

**a11y.** A list, **not a table**: the meta is a fact about its own item rather than a cell in a shared column, and nothing is sortable or comparable across rows. Hairlines are `border-top` on the `<li>`, never `<hr>`. **“Members only” in the meta is plain text** with no glyph, badge or state — A5 does not know a reader's membership and A32 Paywall owns everything that does.

**Flagged.** The 28 px row padding and its step at None, the 620 px body measure, the unclamped body, the meta's lift and its 1080 destination, the 16 px hover overhang, the ring's radius on a square row, the stacked phone order, and the members-only wording.

---

## 7. Alternating Media

Picture-and-text rows whose sides alternate, for two to four features that each need showing.

**Descriptor.** The only design where the picture changes sides from row to row, and the only one capped at four items because every row spends a half-page on one.

**Structural descriptor.** `split · none · page · few · left · sides alternate per row`

**Archetype.** split

**Behaviour module.** **none.** Alternation is `row-reverse` on even rows, both crops are fixed aspect boxes, and Framed inset is A4·3's mount. **`lightbox` is the near miss and is not declared:** nothing here is a thumbnail and no picture is clickable, which the design already says when it refuses a whole-item link. **JS off:** identical.

**Items.**

- **Add.** Last — the bottom row — **and it takes whichever side the alternation gives it**: side is a function of position, never a per-item control. The new row arrives with no picture and draws the design's own text tile until one is chosen.
- **Remove.** Never disabled, with one consequence: **removing a row re-sides every row below it**, which the sidebar says before it happens. This and 15 Index's renumbering are the two removals in A5 that change how the remaining items are drawn.
- **Reorder.** Drag. **Load-bearing in one way only** — position decides which side each picture takes. Nothing is emphasised by being first, and no row is larger than another.
- **Counts.** **Two to four**, the design's own band. One row is not an alternation and the sidebar names 13 Spotlight. **Add is disabled at four** with 8 Media Top named and the items kept — the design's own rule. Alternate sides Off puts every picture on the same side and does not lift the cap: four full-width picture rows is a reading limit, not a layout one.
- **Zero.** The section does not render.
- **Inside an item.** `itemTitle` (req) · `itemBody` (520 px cap) · `itemImage` (≥ 1200 px) + `itemImageAlt` (empty by default, authorable) · the link pair. No picture → the **text tile**, holding the crop, carrying the title at 19 px bottom-left, `aria-hidden` because the h3 beside it already says the words. `itemIcon`, `itemMeta` and `tabLabel` kept, never drawn.

**Fields.** As 1 plus `itemImage` (≥ 1200 px) and `itemImageAlt`. `itemIcon`, `itemMeta`, `tabLabel`, `primaryAction` and `note` kept and not drawn — four rows each carrying a link is already four asks. **Two to four items;** above four the editor names 8 Media Top and the items are kept. The frames draw items 1–4 of the category's six, the only place in A5 a design's frames carry less than the authored set.

**Controls.** First row's picture (Left · Right) · Alternate sides (On · Off, **no effect at ≤ 767**) · Picture treatment (Flush · Framed inset) · Head alignment · Item link (None · Text link). Universal: Background role with Contrast unavailable (a photograph on a band needs a scrim A5 does not have) · Vertical spacing · Top divider. No Member visibility: no section action is drawn. Every picture carries Image focus in the Image Picker popover.

**The row.** Two 620 px halves on a 56 px gutter, the picture **3:2 and fixed** (620 × 413) to agree with A24 and A4·13, 72 px between rows, item title 28 px — the largest in A5 — body 16 px on a 520 px measure. The picture centres against the text where the text is taller. **Framed inset** is A4·3's mount unchanged: 14 px of surface, one hairline, the picture at half the pack radius, and the row grows 413 → 441 px.

**Whole item is not offered.** A 1,296 px row is not a target a reader aims at, and the picture does not respond to a pointer for the same reason.

**Responsive.** Two halves down to 768 — 361 px each on a 32 px gutter at 834, title 24, row gap 56, and the design's real limit rather than its breakpoint. At ≤ 767 every row stacks with **the picture always first** and the crop goes **3:2 → 16:9**, the only crop change in A5; title 22, 40 px between items, the mount 10 px.

**Empty.** An item with no picture becomes a **text tile**: the 3:2 box in hover surface carrying the title at 19 px bottom-left, the title not repeated beside it, the crop held. No item with a picture → the section is 6 Rows at a 28 px title, named.

**a11y.** Picture then text in the DOM on every row; alternation is `row-reverse`, never a source reorder. `alt` empty by default and authorable, the editor asking what the picture adds. **The text tile is `aria-hidden`** — unlike A4·13's deliberate repeat, because the h3 beside it already says the words.

**Flagged.** The 3:2 crop and its agreement with A24, the 56 px gutter, the 72 px row gap, the 28 px title, the centring rule, the two-control alternation and its phone exception, reusing A4·3's mount and the 441 px it costs, the 16:9 phone crop, the text tile's `aria-hidden`, refusing a whole-item link, the four-row advice, and drawing four of six items.

---

## 8. Media Top

A picture across the top of every item, three across, on 4 Cards' plane. Where 7 hands off at the fifth item.

**Descriptor.** The only design that runs a picture across the top of every item in a grid, at a 16:9 crop it argues for explicitly against 7's 3:2.

**Structural descriptor.** `grid-of-N · none · page · many · top · picture across card top`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The crop is a fixed aspect box under `overflow: hidden`, the 4% hover darkening is a CSS filter, and Whole item is an `<a>` wrapping picture, h3 and body. **`lightbox` is again the near miss and again not declared** — a card's picture is part of the card's link, not a thumbnail of a larger file. **JS off:** identical; `loading="lazy"` and the explicit dimensions are attributes.

**Items.**

- **Add.** Last. The new card arrives picture-less and draws the 16:9 **text tile**, which is the design's own empty rule rather than a hole in the grid.
- **Remove.** Never disabled. At one item the sidebar names 13 Spotlight; at no item with a picture the design **is** 4 Cards, which it already says.
- **Reorder.** Drag. **Reading order only** — no card is featured at either plane value.
- **Counts.** Designed for **three, six or nine**. Below three the row divides by the item count. Add is disabled at nine with A17 named, and **this is the design 7 hands off to at the fifth item.**
- **Zero.** The section does not render.
- **Inside an item.** `itemTitle` (req) · `itemBody` · `itemImage` + `itemImageAlt` (**empty by default, and it should stay empty inside a linked card** — the editor names what filling it does to the link's name) · the link pair. No picture → the text tile. `itemIcon` is kept and drawn at no value: a card with a photograph and a glyph has two media.

**Fields.** As 7, with `primaryAction` and `note` drawn.

**Controls.** Item plane (Card · None) · Head alignment · Item link (None · Text link · Whole item, **available at both planes**) · Below the set · Member visibility. Universal: Background role with Contrast unavailable — six photographs on an inverted band is 10's problem, and 10 draws icons — · Vertical spacing · Top divider. **Data:** Content source (Authored · From posts) with the P0·5 panel — picture ← feature image, title ← post title, body ← excerpt, item link ← the post; bound, the Items list loses Add, Remove and drag and post content is plain-text-locked. Image focus rides in the Image Picker popover.

**The card.** 4 Cards' plane and gaps unchanged, with the picture **16:9, fixed** (410 × 231), flush to the top corners at the card's radius under `overflow: hidden`, and 24 px of text padding rather than 28.

**Why 16:9 and not 7's 3:2.** At 410 px wide, 16:9 is 231 px and 3:2 is 273 — two thirds of the card against three quarters. Six cards at 3:2 make a section where the words are a caption band under a grid of photographs; 7 can afford 3:2 because its picture has a half-page beside it. The disagreement is stated on both designs.

**Hover at Whole item.** The plane steps, the title underlines, **the picture darkens 4%** — `brightness(.96)`, `1.04` in dark, a filter rather than an overlay so a photograph's colour survives it. Nothing scales.

**Whole item at Item plane None** is settlement 3's one exception: the item has no card but the picture is the edge.

**Responsive.** Three across to 1081, two at 1080 and below (365 px card, 207 px picture, title 20). One column at ≤ 767, 16 px between cards at Card and 28 at None, text padding 20, **the crop held at every width**.

**Empty.** A picture-less item becomes the **text tile** at 16:9. No item with a picture → the design is 4 Cards, named.

**a11y.** At Whole item one `<a>` per card wrapping picture, h3 and body. `alt` empty by default **and it should stay empty inside a linked card** — the editor names what filling it does to the link's name. Pictures carry dimensions and `loading="lazy"`. The 4% brightness carries no meaning; the underline does.

**Flagged.** The 16:9 crop and its arithmetic, the flush corners, the 24 px text padding, the two plane values, Whole item at plane None, dropping the Contrast ground, the 4% figure and its dark inversion, the 16 / 28 px phone gaps, and drawing Office hours in the no-picture frame alone.

---

## 9. Bento

One tile at four times the size of the others, with the rest filling the cells around it.

**Descriptor.** The only design that draws one item at four times the size of the others, taking that emphasis from the item's position in the list rather than from any control.

**Structural descriptor.** `grid-of-N · none · page · many · inline · one tile spanning four cells`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The 2 × 2 span is a grid placement, Large tile Left/Right is `grid-column`, and the derived crop is an aspect box measured in CSS. **JS off:** identical — **and this is the design whose emphasis survives with no script precisely because it is geometry rather than state.**

**Items.**

- **Add.** Last, filling the next free cell in written order. A new item is a **small tile whatever it contains**: size follows position, so the only way to make an item large is to drag it to the top of the list, and the repeater says that in place of the per-item control it does not have.
- **Remove.** **Removing item 1 promotes item 2 into the large tile**, carrying its picture, body and link into a tile four times the size — the one consequence here worth warning about, and the sidebar says so before it happens. Below three the editor names 4 Cards.
- **Reorder.** Drag. **Load-bearing:** position 1 is the large tile and the rest fill the remaining cells in written order. Tab order follows the DOM, which at Large tile Right differs from the eye by one tile — the design's own note.
- **Counts.** **Three minimum, six intended, nine advised as the ceiling** — the design's own numbers. An odd tile count is left short at 1440 and **spanned across both columns at 1080**, the one place in A5 a short row is filled rather than left.
- **Zero.** The section does not render.
- **Inside an item.** `itemTitle` (req) · `itemBody` · `itemIcon` (the small tiles' media) · `itemImage` + `itemImageAlt` — **drawn on item 1 only**, later items' pictures kept, unused, and the sidebar names which item's picture is showing · the link pair. No picture on item 1 → the tile is title and body with the space returned to the text, **not a text tile**. **Emphasis is visual only and that is the design's stated limit**; 13 Spotlight says it structurally.

**Fields.** As 8, and **only the first item's `itemImage` is drawn**; the small tiles use `itemIcon`. Pictures on later items are kept and unused, and the editor says which item's picture is showing. **Three items minimum, six intended, nine advised as the ceiling** — below three it names 4 Cards, above nine it advises it.

**Controls.** Large tile (Left · Right — **grid placement, never a source reorder**) · Large tile media (Picture · Icon · None) · Small tile media (Icon · Icon in a tint · None, **no Picture**) · Item link (None · Text link · Whole item) · Head alignment. Universal: Background role locked at Background (the tiles are the surfaces) · Vertical spacing · Top divider. No Member visibility: no section action is drawn. Item 1's picture carries Image focus in the Image Picker popover.

**Background role, reconciled.** The old refusal becomes the universal control's lock: Background role ships locked at Background with the old argument as its shown reason — a surface ground needs 4 Cards' step-up on every tile, and six lifted tiles on a lifted ground read as one block with seams; `contrast` is 10 Contrast Band, which the lock's note still names.

**The grid.** Three 410 px columns, 190 px rows, 32 px gap; **the first item spans 2 × 2 (852 × 412) and the rest fill the remaining cells in written order**. Tiles are 4 Cards' Hairline plane, padding 28 large and 24 small. Large title 28 px (7's), small title 19 px with 15 px body (3's). The large picture's crop is **derived from the tile's remaining height** and is dropped below 120 px with the reason named.

**Two media controls is the category's one exception** to settlement 2's section-wide rule: an 852 px tile and a 410 px tile want different things.

**Responsive.** The 2 × 2 block holds to 1081. At 1080 and below two columns, **the large tile spanning both as a full-width row**, the small tiles pairing off, and **an odd last tile spanning both columns** — the one place in A5 a short row is filled rather than left. One column at ≤ 767: the large tile keeps a 16:9 picture and a 22 px title, the small tiles keep their glyphs, body back to 16 px.

**Empty.** No picture on item one → the tile is title and body with the space returned to the text, **not a text tile**: the tile is large enough to carry words alone.

**a11y.** The large tile is an item like the others — size is CSS, not markup; no “featured” label, no `aria-current`. **Emphasis is visual only, and that is the design's honest limit;** 13 Spotlight says it structurally. Tab order follows the DOM, which at Large tile Right differs from the eye by one tile.

**Flagged.** The 190 px row and 2 × 2 span, the fill order, the item-count floor and ceiling, the derived crop and its 120 px floor, two media controls as the settlement's exception, refusing Picture on small tiles, dropping Ground, the tablet's spanning odd tile, and the phone's stated limit.

---

## 10. Contrast Band

The whole set on the inverted ground. Ground is not a control here: it is the design.

**Descriptor.** The only design whose ground is the design rather than a control — the whole set on the inverted band, with the icon lift, the hairline, the action and the focus ring all re-derived from the carried colour.

**Structural descriptor.** `grid-of-N · none · contrast · many · none · inverted band throughout`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The band, the 10% lift, the 28% hairline, the carried-colour focus ring and the light-in-dark inversion are token arithmetic in CSS; the disabled accent action is a panel state, not a runtime one. **JS off:** identical.

**Items.**

- **Add.** Last, with §0's content, the fall-back mark drawn in a **lift** rather than a tint — there is no surface on a band.
- **Remove.** Never disabled. At one item the row divides by the item count, and one item alone on an inverted band is A6 CTA Banners' shape rather than this one, which the sidebar names.
- **Reorder.** Drag. **Reading order only.**
- **Counts.** Designed for **three, six or nine**. Add is disabled at nine with A17 named. **One band per page** is the editor's advice and is about the page rather than the list, so it is never enforced on the repeater.
- **Zero.** The section does not render, and it matters more here than anywhere in the category: **an inverted band with no items is 132 px of colour.**
- **Inside an item.** As 1 — `itemTitle` (req) · `itemBody` · `itemIcon` · the link pair. `itemImage` is kept and drawn at no value: the design refuses Picture, a photograph on a band needing a scrim A5 does not have, and the reason is on the control. No icon → the fall-back mark in the lift, or nothing at all at Media None.

**Fields.** As 1. **One band per page** is the editor's advice, not a rule.

**Controls.** Band edges (Full bleed · Page margin; pack radius and 56 px inner padding there, always full bleed at ≤ 767) · Media (Icon · **Icon in a lift** · None) · Head alignment · Below the set · Item link (None · Text link) · Member visibility. Universal: Background role locked at Contrast — the ground is the design — · Vertical spacing resolving **44 · 64 · 88** (one step tighter, A4·9's values carried; a departure survives as a resolution, never a duplicate row) · Top divider.

**What the band changes.** The icon container is a **10% lift of the carried colour** rather than a surface tint — there is no surface on a band and the packs do not define one. Hairlines are **28% of the carried colour** (A4·9's). The action is a **solid `text`-coloured fill carrying the band's colour**, hovering 3% darker. **Focus rings are the carried colour rather than the accent** — 12.8:1 against 3.2:1, the one design in A5 where the ring's colour changes. The 40 px container holds at every width, because the lift is the only thing separating a glyph from the band.

**Two refusals, both with their ratio shown.** An accent fill carrying the band's colour is 3.2:1 in Paper, so the accent action is **disabled with its number** per §7·4 — and it stays disabled even in a pack whose accent would pass, because a control whose availability varied by pack would make one design twelve. **Icon in accent** is not offered either: six accent squares on an inverted band is the loudest object in the library. **Picture** is not offered: a photograph on a band needs a scrim A5 does not have, and 8 Media Top on the page's own ground is what the editor names.

**Dark.** Paper's dark `contrast` is `#EDE7DA` carrying `#171511`, so **the band is light in dark mode** — the one design in A5 whose modes are not variations of each other. Muted is `#57524A` and the icon's lift is dropped, with Icon the default and the substitution named.

**Responsive.** Three across to 1081, two at 1080 and below (band padding 56 at Comfortable, item title 20), one column at ≤ 767 at 44 px, always full bleed. The lift and the hairline are ratios and do not change with width.

**a11y.** The band is not a landmark, a region or a theme boundary — a background colour on a section that already has a name. Forced colours drop the band's colour and nothing depends on the inversion.

**Flagged.** The 10% lift and its 40 px box at every width, dropping the lift in dark, refusing Picture and Icon in accent, the carried-colour focus ring, the 3% action hover, the 56 px inner padding at Page margin, the one-band advice, and reusing A4·9's padding, hairline and action rather than inventing new ones.

---

## 11. Checklist

Two columns of one-line items with a small mark at the left. The design settlement 4's title-only item was written for.

**Descriptor.** The only design whose item is a title and nothing else, spending the accent once per entry on a mark that says the entry is included.

**Structural descriptor.** `grid-of-N · none · page · many · none · accent mark per entry`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The three marks are CSS, the two-column fill is `grid-auto-flow: column`, and **nothing here is a checkbox** — no input, no role, no `aria-checked`, nothing to persist. **JS off:** identical.

**Items.**

- **Add.** **Add entry** at the foot of the list, landing last — the foot of the second column, or of the first at an odd count. The entry arrives as **“Another thing included”** and nothing else: no body, no icon, no picture, no link, because the design draws none of them.
- **Remove.** Never disabled. **A one-entry list renders one entry in the first column** and the sidebar suggests prose instead — the design's own empty rule.
- **Reorder.** Drag. **Reading order only, and it runs down the first column then the second**, so dragging an entry up moves it within its own column rather than across to the other.
- **Counts.** **Two to twelve, and twelve is comfortable here** — the design's own numbers, and the only design in A5 that says a long list is what it is for. About **40 characters an entry** advised, 24 for the two-column phone. Add is disabled at twelve; a longer list of one-liners is a navigation list, and the sidebar names 6 Rows for entries that have grown into features and 3 Four Up at Body copy Show for a line under each.
- **Zero.** The section does not render.
- **Inside an item.** `itemTitle` **only** (req). Every other field on the shape is kept and not drawn — **the largest kept-and-unused set in A5** — so an item authored on 4 Cards keeps its body, icon and picture here and shows none of them, and the sidebar says how many fields are being held. At **On a phone: Keep two columns** the site may author a shorter wording for the phone, **the one piece of per-width content in A5**; it is a second string on the same entry, never a second list. *Flagged, this pass: reading it as a per-entry string rather than a parallel list is mine.*

**Fields.** `eyebrow` · `title` · `sub` · `items[]` with **`itemTitle` only** · `primaryAction` · `note`. Everything else is kept and not drawn — the largest set of kept-and-unused fields in A5 — and the editor names **3 Four Up at Body copy Show** for a site that wants a line under each entry. Two to twelve items, and twelve is comfortable here; about 40 characters an entry advised, 24 for the two-column phone.

**Controls.** Mark (Check · Dot · Rule) · Density (Compact 12 · Comfortable 16 · Spacious 24) · Rules between entries (Show · Hide) · On a phone (Keep two columns · One column) · Below the set · Member visibility. Universal: Background role · Vertical spacing (section spacing; Density stays the entry ladder, a genuinely different name) · Top divider.

**No head alignment** — the head is always left, because the list is. **No item link and no media:** eight one-line links is a navigation list, and a glyph beside a check mark is two marks doing one job.

**The list.** Two columns on a 1000 px measure with a 64 px gutter, filled **down the first column then the second** (`grid-auto-flow: column`, `ceil(n / 2)` rows) so visual order and DOM order agree; an odd count puts the extra entry at the foot of the first column. Entry 17 px in the **body font at 500**, still an `<h3>`. Mark 16 px with a 14 px gap and a 3 px optical lift. The hairline at Rules Show runs to the end of its own column, never across both.

**The accent.** Check and Dot spend the accent once per entry — a stated departure from §2's twice, on the argument that at Check the mark is the only thing making eight lines a list of things included. **A check is a claim;** Dot is for a list that is only a list, and Rule uses no accent at all.

**Responsive.** Two columns at every width, gutter 64 / 40 / 20, entry 17 / 17 / 16, mark 16 / 16 / 14. At ≤ 767 the phone control decides: Keep two columns needs short entries and lets the site **write a shorter set for the phone — the only per-width content in A5**; One column keeps the desktop wording at 350 px.

**Empty.** A one-entry list renders one entry in the first column, and the editor suggests prose instead.

**a11y.** A `<ul>` of `<li>` with h3 entries — visual size is not heading level. **The mark is `aria-hidden` at all three values** and **nothing here is a checkbox**: no role, no `aria-checked`, no input.

**Flagged.** The 1000 px measure, the 17 px body-font entry, the mark's geometry and its three values, the accent departure, the column fill direction and odd-count rule, the hairline's extent, the three densities, the phone control and its per-width wording, dropping head alignment, and refusing body copy, icons and item links.

---

## 12. Tabs

One item at a time behind a labelled row of tabs. The category's only behaviour, and its only design whose resting state hides most of its content.

**Descriptor.** The only design that shows one item at a time, and the only one whose resting state hides most of what is authored in it.

**Structural descriptor.** `carousel · none · page · few · right · one panel behind tabs`

**Archetype.** carousel

*Why: one item of several shown at a time behind an explicit control, which is the reading A2·9 Rotator takes. The closed list has no `tabs` value, and `nav` would say the labels navigate, which they do not. **The module is `tabs` and the archetype is `carousel`;** the disagreement is stated rather than smoothed.*

**Behaviour module.** `tabs`. Edit-safe: it does not run while the section is edited — the panel draws whichever item the sidebar has selected and the row follows it, which is why every frame is a resting state. **JS off:** “All panels render stacked and visible, each preceded by its tab label as a heading.” **That returns the design's stated cost:** with JavaScript a reader who never touches the tabs sees one feature of six, and without it they see all six. The 160 ms cross-fade and the measured-and-held panel height go with the module — there is nothing to hold still once the panels are stacked — while the phone row's sideways scroll is `overflow-x` and survives. **Finding:** the label-as-heading the registry emits sits above a panel that already contains an h3 repeating that label, so with JavaScript off every feature is announced twice. Named at the end rather than resolved here — the degradation is an acceptance criterion (FR-G4) and the deliberate h3 repeat is this design's own rule.

**Items.**

- **Add.** Last — the right end of the tab row. The item arrives with §0's content and **no `tabLabel`**, so its tab reads the title clipped to 20 characters with the clip disclosed, which is the design's own rule, and the sidebar names the field. **Add is disabled at six** with 6 Rows and 4 Cards named: six labels at 15 px with 28 px between them is about 900 px of 1,296, and at seven the row wraps.
- **Remove.** On the row, undoable, and **the canvas returns to whichever item the sidebar then selects** rather than to a removed panel. Removing to one leaves one tab over one panel, which is a feature with a label above it; the sidebar names 4 Cards and offers the switch. Below two there is no tab set.
- **Reorder.** Drag. **Load-bearing:** item 1 is what a published page opens on and **there is no default-tab control**, so whatever every reader must read belongs in position 1 — the same rule A2·9 Rotator states, for the same reason. It is also the first panel in the no-JS stack.
- **Counts.** **Two to six**, the design's own band and its arithmetic. A site whose items differ by more than about 120 px of text is advised toward 6 Rows, and the sidebar measures that as the list is edited rather than at save. *Flagged, this pass: where the advisory surfaces.*
- **Zero.** The section does not render — no tab row above an empty panel.
- **Inside an item.** `itemTitle` (req) · `tabLabel` (opt, ≤ 20, hard) · `itemBody` · `itemImage` + `itemImageAlt` · the link pair. Empty `tabLabel` → the clipped title. **No picture on one item of six at Panel media Picture → that panel draws 8 Media Top's text tile at 3:2**, since Panel media is a section value and cannot be set for one panel. *Flagged, this pass.* `itemIcon` and `itemMeta` kept, never drawn.

**Fields.** As 8 **plus `tabLabel`** (≤ 20, hard) — the only design that draws it; absent, the tab reads `itemTitle` clipped to 20 with the clip disclosed. `itemIcon`, `itemMeta`, `primaryAction` and `note` kept and not drawn — a section action under a panel would look like the panel's own. **Two to six items; six is the ceiling** and seven names 6 Rows or 4 Cards.

**Controls.** Tabs and head (Left · Centred — one control for both) · Panel media (Picture · None, **no Icon**) · Picture side (Right · Left, **the same on every panel, no alternation**) · Item link (None · Text link). Universal: Background role with Contrast unavailable (a tab row on a band needs an active state the packs do not define) · Vertical spacing · Top divider. No Member visibility: no section action is drawn. Every panel picture carries Image focus in the Image Picker popover.

**The tab** is A1·1's nav item verbatim: 15 px, muted resting, `text` at 500 with a 2 px accent underline active, **hover to full strength with no underline** — a hover that borrows the underline makes every pass of the pointer look like a selection. 28 px apart at 1440, 20 at 834, 18 on a phone; 44 px tall at every width. The accent's one appearance in the design.

**The panel** is 7's geometry — two 620 px halves, 56 px gutter, picture 3:2 — 48 px under the row and **its height is the tallest item's, measured once and held**, so switching never moves the section's foot. Switching is a 160 ms cross-fade of the whole panel; nothing under reduced motion. A site whose items differ by more than about 120 px of text is advised toward 6 Rows.

**Six tabs is the ceiling.** Six labels at 15 px with 28 px between them is about 900 px of 1,296; at seven the row wraps, and a wrapped tab row is a menu.

**While editing.** The behaviour does not run. **The panel draws whichever item is selected in the sidebar's item list** and the row follows it; clicking a tab selects its label, and `tabLabel` edits inline on canvas with P0·1 — confirmed this pass. **A published page always opens on the first item, and there is no default-tab control.** The repeater head now says so in words — "drag a feature to the first position to change what opens first" — rather than leaving it to be discovered.

**Responsive.** At 1080 and below the panel stacks — **picture above text always** — and the row holds on one line at 20 px, the tightest it ever is and the reason the 20-character cap is enforced. At ≤ 767 **the row scrolls sideways**, bleeding to the page edges so a clipped label says there is more; no arrows, no fade mask; crop 3:2 → 16:9; labels 16 px. **It never becomes an accordion** — A9 FAQ owns those.

**a11y.** `role="tablist"` of `<button role="tab">` labelled by the section's title; roving `tabindex`, arrow keys, Home and End, **activation follows the arrows**, no auto-rotation, no live region. Panels are `role="tabpanel"`, `tabindex="0"`, each containing its own h3 which **repeats the tab's label deliberately**. Hidden panels are `hidden` — not in the tree, pictures not fetched, not found by in-page search — and **a reader who does not touch the tabs sees one feature of six**, which is the design's stated cost.

**Flagged.** The fixed panel height, the 48/40 px gaps, the hover's refusal of the underline, the tab spacing, the six-tab ceiling and its arithmetic, the editing model and the refusal of a default-tab control, activation following the arrows, the sideways-scrolling phone row, the deliberate h3 repeat, and refusing Icon, Contrast and Whole item.

---

## 13. Spotlight

One feature at picture scale with the rest reduced to single lines beneath it. Where 9 Bento makes the first item bigger, this design makes it the subject.

**Descriptor.** The only design that makes one item the subject and reduces every other to a single line, and the only one whose remaining items can be dropped from the DOM by a control.

**Structural descriptor.** `split · none · page · variable · left · item at picture scale`

**Archetype.** split

**Behaviour module.** **none.** The 760/40/496 division, the picture's growth at Beside the text and the three values of The rest are grid and CSS; at **Hidden** the entries are absent server-side rather than hidden in the browser, so nothing is downloaded and unread. **JS off:** identical.

**Items.**

- **Add.** Last — the end of the entry list, **never the spotlight**. The only way to change the spotlight is to drag an item to the top, which is the design's own rule and the reason there is no Spotlight control.
- **Remove.** Never disabled. **Removing item 1 promotes item 2 to the spotlight**, carrying its body, picture and link into the large slot — the one removal in A5 that changes what the section is about, and the sidebar says so before it happens. Removing to one leaves the spotlight alone with no rule under it.
- **Reorder.** Drag. **Load-bearing in the strongest sense in A5:** position 1 is the subject; position among the entries is reading order only, filled across rather than down.
- **Counts.** Designed for **four to seven** — a spotlight and three to six entries. One item is the design's own one-item section, which is also what **The rest: Hidden** makes of any count, the items it hides being kept and counted. Add is disabled at nine, and a longer list of one-liners is 11 Checklist, which the sidebar names.
- **Zero.** The section does not render.
- **Inside an item.** On item 1: `itemTitle` (req) · `itemBody` (**unclamped**) · `itemImage` + `itemImageAlt` · the link pair, the only link in the design. On every other item **the title is drawn and the rest is kept and not drawn** — the fields stay editable in the sidebar because any item may be dragged to the top at any moment, and the sidebar marks which fields are being held rather than greying them out. *Flagged, this pass: keeping them editable is mine.* **The entries are never links** — 11's rule, carried. No picture on item 1 → the design is its own Spotlight media None, **with no text tile**.

**Fields.** As 8. **Only the first item's `itemImage`, `itemBody`, `itemLinkLabel` and `itemLinkUrl` are drawn**; the rest contribute their `itemTitle` alone. `itemBody` is **unclamped** on the spotlight. **The spotlight is the first item and there is no control for it** — a user drags an item to the top. The frames spotlight the full archive rather than the weekly letter, which is that re-ordering, stated.

**Controls.** Spotlight media (Picture · None; 3:2 fixed, no Icon; **at None the title steps 34 → 30**) · Picture side (Left · Right) · The rest (Entries under the spotlight · Beside the text · Hidden) · Mark (Check · Dot · Rule — 11's values) · Item link (None · Text link, **on the spotlight only**) · Member visibility. Universal: Background role with Contrast unavailable (the photograph-scrim rule) · Vertical spacing · Top divider. **Data:** Content source (Authored · From posts) with the P0·5 panel — the spotlight is the first post, the entries the rest; picture ← feature image, title ← post title, body ← excerpt, spotlight link ← the post; bound, the Items list loses Add, Remove and drag and post content is plain-text-locked. **The note naming A19 Featured and Spotlight for a post-shaped spotlight is drawn on the design itself**, beside the source control. Image focus rides in the Image Picker popover.

**No head alignment:** the head is always left, as on 11. **The entries are never links** — 11's rule, carried. **Whole item is not offered:** a link over a 760 px picture and its text is a target the size of a window.

**The arrangement.** 760 px of picture, a 40 px gutter, 496 px of text — wider picture and narrower column than 7's even halves, which one row can afford. Item title 34 px, the largest in A5. The entries are 11's entry verbatim, in three columns on a 40 px gutter, 36 px under a hairline, **filled across rather than down**: five short lines under a picture are read as a group. At Beside the text the entries take the 496 px column and **the picture grows to 560 px tall at the same 3:2**. Hidden makes this the category's one-item section, and the items it hides are kept.

**Responsive.** At 1080 and below the spotlight stacks — picture first, always — title 30, body on 620, entries two columns. At ≤ 767 one column, crop 3:2 → 16:9, title 26, **entries stay 17 px**.

**Empty.** No picture on the first item → the design is its own Spotlight media None, **with no text tile**: one item has no row rhythm to protect, and an empty 760 px box is worse than the words alone. No items past the first → the spotlight alone, no rule.

**a11y.** **One `<ul>`, the spotlight being its first `<li>`** — not a figure plus a list. All titles are h3 whatever their size. Nothing is `aria-current` or labelled featured. At The rest Hidden the other items are **absent from the DOM** and the editor says how many are held back.

**Flagged.** The 760/40/496 division, the 34 px title and its step at None, the unclamped body, reusing 11's entry with the fill reversed, the three values of The rest, the picture's growth at Beside the text, refusing a text tile, refusing entry links and a whole-item link, dropping head alignment, and re-ordering the category's items.

---

## 14. Scroller

A rail of cards that overflows sideways instead of wrapping. The library's overflow model.

**Descriptor.** The only design that overflows sideways instead of wrapping, with a card sliced by the window as its affordance — and the only one whose arrangement is identical at every width.

**Structural descriptor.** `carousel · none · page · many · top · rail bleeding off-screen right`

**Archetype.** carousel

**Behaviour module.** `carousel`. Edit-safe, and nothing in the design moves on its own at any time, so the rail in the editor is the rail a reader gets. **JS off:** “The slide track is a native horizontally-scrollable `scroll-snap` strip — **fully usable**, only dots and arrow buttons are hidden.” Every card, picture and link stays reachable by scrolling; the rail keeps its `tabindex="0"` and its `aria-label`; snap is a CSS property and survives; and **tabbing to an off-screen card still scrolls it into view, that being the browser's own behaviour rather than the module's.** Two consequences, both flagged: the design **offers no dots**, so the only control the registry sentence removes here is the arrow pair; and **Rail controls: A rule is read as an indicator and goes with them**, since the registry names dots and arrows and does not name a rule — the second finding at the end.

**Items.**

- **Add.** Last — the right end of the rail, off-screen, which is where a new card belongs in the one design that has an off-screen. The card arrives picture-less and draws 8 Media Top's text tile at 16:9.
- **Remove.** On the row, and **Remove is disabled at five** with the reason shown and 4 Cards named: a rail with nothing off-screen is a grid with a scrollbar. That is the design's own floor rather than a soft limit; six to five is allowed and leaves the rail at it.
- **Reorder.** Drag. **Load-bearing in one way:** the first two or three cards are what a reader sees before scrolling, so order decides what is seen at all. Nothing beyond that is emphasised — no card is larger, and Card width is one value on the rail.
- **Counts.** **Five minimum, nine advised as the ceiling** — the design's own numbers. Add is disabled at nine, naming 4 Cards for a set that should wrap and A17 Post Grids for a long one. **One rail per page**, flagged rather than prevented, and about the page rather than the list. **Never for pricing or anything a reader compares**, which is A7's.
- **Zero.** The section does not render — no rail, no arrows, no rule.
- **Inside an item.** `itemTitle` (req) · `itemBody` · `itemIcon` · `itemImage` + `itemImageAlt` · the link pair. No picture at Media Picture → the text tile. `itemMeta` and `tabLabel` kept, never drawn.

**Fields.** As 8; `itemMeta`, `tabLabel`, `primaryAction` and `note` kept and not drawn — the head carries the arrows where the action would sit. **Five items minimum** (below five the editor names 4 Cards: a rail with nothing off-screen is a grid with a scrollbar), **nine advised as the ceiling**, naming 4 Cards again and A17 Post Grids for a long set. **One rail per page**, flagged rather than prevented. **Never for pricing or anything a reader compares.**

**Controls.** Card width (Narrow 280 · Medium 320 · Wide 380 — **Wide steps the title to 21 and the body to 16**, the measure rule) · Media (Picture · Icon · None; 16:9 fixed, a missing picture becoming 8's text tile) · Rail edges (Bleeds right · Page margin — always bleeds right at ≤ 767, and **at Page margin, Rail controls None is unavailable**) · Rail controls (Arrows · A rule · None, **no dots at any value**, None by default on a phone) · Item link (None · Text link · Whole item). Universal: Background role with Contrast unavailable (the photograph-scrim rule) · Vertical spacing · Top divider. No Member visibility: no section action is drawn — the head carries the arrows instead. **Data:** Content source (Authored · From posts) with the P0·5 panel, the same mapping as 8; bound, the Items list loses Add, Remove and drag, the five-card floor still holds, and **rail behaviour is unchanged — same snap, same arrows, same rule**. Image focus rides in the Image Picker popover. The arrow labels are theme translation-catalog strings.

**The rail.** Cards 24 px apart (20 at 834, 16 on a phone), the card 8 Media Top's narrowed with 20 px of text padding. **The right bleed is the affordance:** a card sliced by the window says “more this way” better than an arrow, and the rail does not bleed past a final card. Arrows are A1·14's 38 px icon button, outlined, in the head's right, 40% and `disabled` at an end. The rule is a 3 px track 240 px wide, 24 px under the rail, **not draggable and not a scrollbar**. Snap is **`proximity`**; an arrow press moves one card to the left margin.

**Responsive.** **The arrangement does not change at any width** — card 320 / 300 / 280, gap 24 / 20 / 16 — which is the argument for the design existing. The sub leaves the head at 834 to keep the arrows on its line.

**a11y.** A `<ul>` in an `overflow-x: auto` box — **not a carousel, not a tablist**, every item in the tree at all times. The rail is `tabindex="0"` with an `aria-label` naming the section, the one place in A5 a non-interactive element takes a tab stop. Arrows are `<button>`s labelled “Previous features” and “Next features” in words with the glyph `aria-hidden`. **Tabbing to an off-screen card scrolls it fully into view, ring included**, instantly under reduced motion, which also drops snap. **Nothing moves on its own:** no autoplay, no timer, no loop, no swipe hint.

**Flagged.** The three card widths and their type steps, the 24 px gap, the right bleed and its refusal past the last card, the arrows' place in the head, the rule's geometry and its refusal to be draggable, refusing dots, proximity snap, one card per press, the focus-scroll rule, the five-item floor and nine-item advice, the one-rail rule, and the sets the design refuses.

---

## 15. Index

A large numeral where the icon would be. The editorial answer to the media question, and the design that has to hold a boundary.

**Descriptor.** The only design whose most conspicuous element is not authored — a numeral generated from the item's position, sitting where every other design puts its media.

**Structural descriptor.** `grid-of-N · none · page · many · none · generated position numeral`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The numerals are generated server-side from the list's order, so they are in the HTML like any other text; the rule, the meta's two positions and the two arrangements are CSS. **JS off:** identical.

**Items.**

- **Add.** Last, **taking the next numeral** — 07 after 06, G after F. The item arrives with §0's content; at **Compact** the placeholder body is written, kept and not drawn.
- **Remove.** Never disabled, and it is the one removal in A5 with a consequence for every item after it: **deleting an item renumbers the rest**, which the editor says before it happens. A reader's “see item 04” survives nothing.
- **Reorder.** Drag. **Load-bearing:** position generates the numeral, so moving an item renumbers it and its neighbours. **This is the only design in A5 where reordering changes what is drawn rather than only where.**
- **Counts.** **Two to twelve** — Letters run A to L, which is where twelve comes from. Designed for six or nine at **Full** and eight or twelve at **Compact**. Above twelve Add is disabled: Letters has no thirteenth value, and A17 Post Grids is named.
- **Zero.** The section does not render, and **the numerals do not exist without items** — there is no 01 over an empty grid.
- **Inside an item.** `itemTitle` (req) · `itemBody` (not drawn at Compact) · `itemMeta` · **and no numeral**: it is generated, not a field, so it cannot be typed, skipped, or moved independently of its item. `itemIcon` and `itemImage` are kept and never drawn — the numeral is the media. No meta → that rule's right end is empty and the others keep theirs. **Ordinal language in a title** — First, Then, Next, Finally, Step — makes the editor name A13 Process and offer the Letters value; it advises and does not prevent.

**Fields.** `eyebrow` · `title` · `sub` · `items[]` with `itemTitle`, `itemBody` (not at Compact) and `itemMeta` · `primaryAction` · `note`. **The numeral is not a field** — it is generated from the item's position. Two to twelve items; Letters run A to L.

**Controls.** Numeral (**01 · 1 · A**; 01 pads to two digits so every rule starts at the same x) · Numeral colour (Muted · Accent, Accent advised for three or four items) · Arrangement (Full · Compact) · Rule under the numeral (Show · Hide) · Item meta (Show · Hide) · Member visibility. Universal: Background role · Vertical spacing · Top divider.

**No item link, no head alignment, no media control:** the numeral is the media and the head is always left.

**The item.** 1 Three Up's grid; the numeral 44 px in the heading font on a hairline running the item's width, with the meta at the rule's other end; title 21, body 16, row gap 44. **Compact** is four across with the body dropped, the numeral at 32 and the meta unavailable. At **Rule Hide** the numeral sits 14 px above the title and the meta moves under the body.

**The boundary with A13 Process.** A number implies an order, and **these numerals are an index rather than a sequence**: they count the items so a reader can refer to one, and nothing joins one to the next — no connector, no line between numerals, no state. A13 owns ordered steps. Where item titles use ordinal language — First, Then, Next, Finally, Step — the editor names A13 and offers the Letters value. It advises and does not prevent.

**Responsive.** Three across to 1081, two at 1080 and below (numeral 40, row gap 36). At ≤ 767 one column at Full (numeral 36, rule the full width, row gap 28) and **two columns at Compact** (numeral 30, title 18).

**Empty.** No meta on an item → that rule's right end is empty. **Deleting an item renumbers the rest**, which the editor says before it happens.

**a11y.** The numeral is `aria-hidden` and **not part of the heading**; the list is a `<ul>` and **never an `<ol>`**, because an ordered list says the order matters and this design says it does not. The meta is third in the DOM whatever its position.

**Flagged.** The 44 px numeral and its ladder, the muted default, the rule-and-meta row, the 44 px row gap, the three numeral values and the padding rule, Letters and its reason, the two arrangements, dropping the meta at Compact, refusing item links, the `ul`-not-`ol` decision, the renumbering warning, and the whole A13 boundary.

---

## 16. Panel

The whole set on one surface panel, inset from the page, divided internally by hairlines rather than separated by gaps. The only design in A5 whose items share a plane.

**Descriptor.** The only design whose items share one plane, separated by hairlines that stop short of the panel's edge rather than by gaps of page ground.

**Structural descriptor.** `grid-of-N · card · surface · many · none · shared plane, hairline dividers`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The plane, the inset, the three divider values, the cell-block hover at its 6 px radius and the dark substitution are all CSS. **JS off:** identical.

**Items.**

- **Add.** Last, into the next cell. **The panel grows by a row rather than the cells shrinking** — the plane is sized by its contents, which is what a shared plane means, and the inset and the head's 48 px gap do not move.
- **Remove.** Never disabled, and **the dividers stop where the items do**: a short last row leaves its cells empty and unruled rather than drawing a box around nothing. At one item the panel holds one cell, and the sidebar names A6 CTA Banners for a single offer on a plane.
- **Reorder.** Drag. **Reading order only** — no cell is emphasised and the hover block is identical in every one.
- **Counts.** Designed for **three, six or nine** — full rows of three inside the panel. Below three the row divides by the item count and the panel keeps its padding. Add is disabled at nine with A17 named.
- **Zero.** The section does not render. **No empty panel**, which is 10's argument in a second place: a surface plane with a hairline, a shadow and nothing in it is furniture.
- **Inside an item.** `itemTitle` (req) · `itemBody` · `itemIcon` · `itemMeta` (on the icon's line at the cell's right) · the link pair. At **Whole item** the cell is the link, `itemLinkLabel` is kept and unused, and `itemLinkUrl` is the cell's destination. No meta → that cell's right end is empty. `itemImage` is kept and drawn at no value — the design refuses Picture.

**Fields.** As 1 plus `itemMeta`, drawn on the icon's line at the cell's right. `primaryAction` and `note` are kept and not drawn: **an action under a panel belongs to the page rather than the panel**, and A6 CTA Banners is the section for one.

**Controls.** Panel padding (**Compact 32 · Comfortable 48 · Spacious 64** — A3·12's values; the section's own spacing is fixed at 96) · Inset (**Snug 16 · Comfortable 40 · Wide 72** inside the page margin — A4·8 Card's values unchanged, so a site running both reads one shape) · Dividers (Both · Between rows · None) · Media (Icon · Icon in a tint · None — **no accent value and no Picture**) · Item meta · Item link (None · Text link · Whole item). Universal: Background role locked at Background (the panel is the surface, and the inset needs the page's own ground around it) · Vertical spacing locked at the fixed 96, reason shown — Panel padding and Inset are genuinely different ladders and keep their names · Top divider. No Member visibility: `primaryAction` is kept and not drawn.

**The panel.** A3·12's plane — `surface`, one hairline, sm shadow, pack radius; **a hairline and no shadow in dark**. 32 px between a cell and the divider beside it, so two items are 64 px apart across a 1 px line, and **no divider reaches the panel's edge**: a line that touches the border makes a cell, and a cell implies a column of comparable things. At Between rows a 32 px gutter returns between columns; at None the gaps are 32 and 24. The head sits above the panel at the page margin, and **the gap under it is always 48** whatever the inset.

**Hover at Whole item.** The **cell** takes a hover-surface block at a 6 px radius, stopping 16 px short of the divider on each side (4 px on a phone), so the hairlines stay visible and the panel itself does not change. The title underlines, the icon's tint inverts, nothing scales. Focus is the ring on that same block, and **it never crosses a divider**.

**Responsive.** Three across to 1081. At 1080 and below two across with **inset 40 → 24, panel padding 48 → 32, cell padding 32 → 24**. At ≤ 767 one column, the panel keeping a **16 px inset inside the page's 20** (A4·18's rule), padding 20, dividers rows only, and the Inset control ignored.

**Empty.** A short last row leaves its cells empty and **the dividers stop where the items do** — a hairline into an empty cell draws a box around nothing.

**a11y.** The panel is **not a landmark, region, group or table** — one `<ul>` with a background and a border, the dividers being `border` properties on the items. No header row, no axis, nothing comparable down a column. Forced colours keep the border and the dividers, which is the practical argument for drawing them as borders.

**Flagged.** The 48/32 padding pair and the 64 px effective gap, the divider's edge rule, the three divider values and the gutter's return, the head's position outside the panel and its fixed 48 px gap, the cell-block hover with its 16 px inset, 6 px radius and 4 px phone value, refusing Picture, the accent and a section action, the tablet's three-way step, and reusing A3·12's plane and padding with A4·8's inset unchanged.

---

## Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All sixteen checked against each other; no two are the same, and every emphasis phrase is four words or fewer.

| # | Design | Tuple |
|---|---|---|
| 1 | Three Up | grid-of-N · none · page · many · none · three bare columns |
| 2 | Two Up | grid-of-N · none · page · few · none · capped 520 px measure |
| 3 | Four Up | grid-of-N · none · page · many · none · optional body copy |
| 4 | Cards | grid-of-N · none · page · many · none · one plane per item |
| 5 | Split Head | split · none · page · many · none · head column beside grid |
| 6 | Rows | stack · none · page · many · none · hairline-divided full-width rows |
| 7 | Alternating Media | split · none · page · few · left · sides alternate per row |
| 8 | Media Top | grid-of-N · none · page · many · top · picture across card top |
| 9 | Bento | grid-of-N · none · page · many · inline · one tile spanning four cells |
| 10 | Contrast Band | grid-of-N · none · contrast · many · none · inverted band throughout |
| 11 | Checklist | grid-of-N · none · page · many · none · accent mark per entry |
| 12 | Tabs | carousel · none · page · few · right · one panel behind tabs |
| 13 | Spotlight | split · none · page · variable · left · item at picture scale |
| 14 | Scroller | carousel · none · page · many · top · rail bleeding off-screen right |
| 15 | Index | grid-of-N · none · page · many · none · generated position numeral |
| 16 | Panel | grid-of-N · card · surface · many · none · shared plane, hairline dividers |

**Containment is `none` fifteen times, and that is the honest answer.** A5's sections sit on the page's own ground; where an item is drawn as a card — 4 Cards, 8 Media Top, 9 Bento, 14 Scroller — **that plane is the item's geometry, not the section's**, which is exactly what the slot excludes. **16 Panel is the one contained design**, because there the section itself is a single surface object inset from the page with the page's ground visible around it — A3·12's plane reused, and `card` for the same reason A3·12 is. 10 Contrast Band at **Band edges: Page margin** is the one place a `box` could have been claimed, and it is a control value on a design whose default is full bleed, not a second design.

**Ground does almost no separating in A5, and that is itself the finding.** Fourteen designs are `page`; 10 Contrast Band is `contrast`, where the ground *is* the design; 16 Panel is `surface`, its own plane. Nine designs offer a Ground control whose values include Surface and Contrast, and **the control's range is not the tuple**: 1 Three Up set to Contrast is not 10 Contrast Band, because 10 re-derives the icon lift, the hairline, the action fill and the focus ring from the carried colour and refuses three media values outright. That difference lives in the designs, not in the slot — which is why **the sixth slot carries more weight in A5 than in any earlier category.**

**Item count: the repeating unit in A5 is the feature.** Twelve designs are `many`. Three are `few` — 2 Two Up (two or four), 7 Alternating Media (two to four, its own cap) and 12 Tabs (two to six, its own ceiling). **13 Spotlight is the only `variable`**, because The rest turns one section from a one-item design into an eleven-item one, which is the author deciding how many in the strongest sense the slot allows. `none` and `one` are unused: **there is no A5 design without a repeating item**, and the design that comes closest — 13 at The rest: Hidden — is that control value rather than a design of its own.

**Media placement is `none` ten times, and the icon is why the slot is easy to get wrong.** A 40 px glyph in an item is a mark, not media placement; eleven designs draw one and none of them claims a placement for it. Where a photograph is drawn, the placement is the photograph's: 7 `left` (its first row's default, alternating from there — the control moves the default, not the design), 13 `left` (the spotlight's default side), 8 and 14 `top` (across the card), 12 `right` (the panel's default side) and 9 `inline` — **the library's first `inline`**, because Bento's picture is neither beside nor above its text but inside the tile, filling whatever height the words leave. `background`, `edge` and `full-bleed` are unused: **no A5 design puts a picture behind its own text**, which 10's refusal of Picture states as a rule.

**The cluster, stated rather than left to trip someone.** Five designs share `grid-of-N · none · page · many · none` and separate on the sixth slot alone — 1 Three Up (three bare columns), 3 Four Up (optional body copy), 4 Cards (one plane per item), 11 Checklist (accent mark per entry) and 15 Index (generated position numeral). That is more designs on one prefix than any earlier category has carried, and it is what a features category is: bare grids on the page's own ground. Each of the five earns its place on something no control can express — 3's control removes a field from the DOM and buys a column; 4's plane changes the item's geometry, its hover and its link model; 11's item is a title with no body at all; 15's most conspicuous element is generated rather than authored; and 1 is the floor the other four are departures from. **Two more sit beside the cluster** and differ by one slot each: 2 Two Up on count, 16 Panel on containment and ground.

**Not used as a separator.** Padding, head alignment, item link, media treatment, density, rules, insets, `itemMeta` and the Ground control's own range never appear in a tuple: they are controls, and two designs that differ only by a control setting are one design. Neither does the fallback web — that 7, 8, 9, 12, 13 and 14 all resolve to 4 Cards or 6 Rows when their pictures or their counts are absent is a hand-off, not a structure.

**One name that does not match its archetype.** 12 Tabs is `carousel` while its module is `tabs`: one item of several at a time behind an explicit control is A2·9 Rotator's reading, the closed list has no tabs value, and `nav` would say the labels navigate, which they do not. 12 and 14 are the category's two `carousel`s and differ on three further slots.

---

## Behaviour modules — roster

Two of the registry's 31, and nothing coined. Fourteen designs declare nothing at all.

| # | Design | Modules | Note |
|---|---|---|---|
| 1 | Three Up | none | the floor: markup and CSS only |
| 2 | Two Up | none | the 520 px cap is a `max-width` |
| 3 | Four Up | none | Body copy Hide is server-side, not a runtime state |
| 4 | Cards | none | Whole item is an `<a>` wrapping the card |
| 5 | Split Head | none | Follows the scroll is `position: sticky`; `scroll-spy` is the near miss |
| 6 | Rows | none | hairlines are borders; Whole row is an `<a>` |
| 7 | Alternating Media | none | alternation is `row-reverse`; `lightbox` is the near miss |
| 8 | Media Top | none | the 4% darkening is a CSS filter |
| 9 | Bento | none | the 2 × 2 span is grid placement, so the emphasis needs no script |
| 10 | Contrast Band | none | band, lift, hairline and ring are token arithmetic |
| 11 | Checklist | none | nothing here is a checkbox |
| 12 | Tabs | `tabs` | with JS off all six panels render stacked — finding 1 |
| 13 | Spotlight | none | The rest: Hidden drops items server-side |
| 14 | Scroller | `carousel` | the strip stays usable without JS; the rule — finding 2 |
| 15 | Index | none | numerals are generated server-side |
| 16 | Panel | none | dividers are `border` properties on the items |

**`core` is not listed per design**, as above. **A5 is the least behavioural category so far** — fourteen of sixteen sections are markup and CSS end to end, which is what a feature set should be: the words a reader came for are in the HTML before anything runs.

---

## Two findings

**1 · 12 Tabs is announced twice with JavaScript off.** `tabs` degrades to “All panels render stacked and visible, each preceded by its tab label as a heading.” This design's panels each contain their own h3 which **repeats the tab's label deliberately** — its own accessibility rule, written before this pass. Stacked, that gives every feature a label heading and then an h3 saying the same words. Both sides are fixed points: the degradation is an acceptance criterion (FR-G4) and the h3 repeat is the design's. **Named for the architect rather than resolved here** — either the module's heading is suppressed where a panel already carries one, or this design's h3 repeat is dropped in the no-JS branch, and neither is a specification-pass decision.

**2 · 14 Scroller's rule has no registry sentence.** `carousel`'s degradation names dots and arrow buttons. This design **refuses dots** and offers **Rail controls: A rule** instead — a 3 px static track, 240 px wide, not draggable and not a scrollbar — so nothing in the registry says what becomes of it. Read here as an indicator and hidden with the arrows, which at least prevents a control that is visible and inert. **Named rather than resolved:** either the registry's sentence gains the rule, or the rule is specified as a CSS-only progress element that survives, and that is the architect's call.

---

## Category artefacts

In `A5-0 Category Proof.dc.html`:

- **The four settlements** §8 asks A5 to make — grid counts of 2, 3 and 4 and what 5 and 7 do; media per item and whether a pack supplies icons; whether an item is a link and what its hover is; and an item with a title and no body beside one with 90 characters of title. **All four answers are invented**, and each is flagged there, on the frames that draw it, and in this document.
- **The ladders** — the head's, and the item's, with the note that the item title's size is not a control.
- **The category-wide rules** — padding, gaps, margins, headings and landmarks, the accent budget, the section action, the responsive floor, and the fact that nothing comes from Ghost.
- **The roster** — all sixteen, what each is for, what it settles, and its default media.
- **The shared field list** — fifteen names, the union of everything the sixteen need, with types, caps and which designs draw each. **No `secondaryAction`:** a feature section has already been chosen, and the second button in the middle of a page is nearly always the first button's competitor.
- **The tokenisation proof** — 4 Cards in Paper, Tangerine and Ink, light and dark, six frames, with only tokens changing.
- **The stress frame** — seven stresses at once on 4 Cards: a 31-character eyebrow, a 118-character title, a 218-character sub, seven items in a three-across grid, a 92-character item title, an item with no body, an item with no icon, and a 24-character link label. With the mobile frame and what the editor says about each.
- **The consistency pass** — §8, written after all sixteen were drawn: what was checked, the nine things that were wrong, and the pattern in them. Every control list in this document was rewritten from its drawn panel as part of it; where the two ever disagree again, **the drawn panel is the authority**.

## Hand-offs out of A5

| Boundary | Owner |
|---|---|
| A row of actions, or a second one | A6 CTA Banners |
| Anything a reader compares — plans, tiers, feature matrices | A7 Pricing and Tiers |
| A set of questions and answers, and every accordion | A9 FAQ |
| Numbers as the subject rather than a fact about an item | A10 Stats and Numbers |
| Ordered steps, with connectors and a state per step | A13 Process |
| A set of pictures as the subject | A14 Galleries |
| Anything longer than nine items, and any set of posts | A17 Post Grids |
| The post as subject | A19 Featured and Spotlight |
| Access, membership and what a reader may see | A32 Paywall |
| Rotating anything | A2·9 Rotator |

---

## Reconciliation notes

**Frames changed in this pass.** All sixteen control-panel frames — Padding rows retired into Vertical spacing and Ground rows (1, 3, 8, 12) into Background role; the universal trio drawn outside each list, locked with the reason shown on 9, 10 and 16 (Background role) and on 16 (Vertical spacing), Contrast disabled with its reason on 4, 7, 8, 12, 13 and 14; Member visibility drawn on 1, 2, 3, 4, 5, 6, 8, 10, 11, 13 and 15; the P0·2 icon-slot note drawn under every Media row that places `itemIcon` (1, 2, 3, 4, 5, 6, 9, 10, 14, 16); the Image-focus note drawn under every picture control (7, 8, 9, 12, 13, 14); the P0·5 **Data** group drawn on 8, 13 and 14, with 13 carrying the A19 note on the design itself and 14 the rail-unchanged note; 12's repeater head rewritten in words; every footer count updated; a Reconciled card added to every spec block. **No section frame was redrawn** — nothing in this pass changes what a reader sees at rest — and no "Preview" control existed in A5 to remove.

**Conflicts with earlier rulings, one line each.**

1. **§0's "Nothing in A5 comes from Ghost"** — loses to the owner's populate-from-posts ruling on 8, 13 and 14; the other thirteen stay authored-only and the A17 hand-off note stands for them.
2. **2's "No Ground control"** — the universal Background role ships everywhere; the refusal survives as the control's advice line naming 16 Panel and 10 Contrast Band, not as a lock.
3. **9's "No Ground control"** — reconciled the other way: the seams argument is structural, so Background role ships locked at Background with the reason shown.
4. **10's Padding scale and ground** — the 44 · 64 · 88 scale survives as Vertical spacing's resolution, and the band locks Background role at Contrast per the ground-is-identity rule.
5. **16's fixed 96** — Vertical spacing ships locked with the reason shown; Panel padding and Inset keep their names as genuinely different ladders, never duplicates.
6. **8's and 12's "no Contrast" Ground values** — carried into Background role as disabled values with their original reasons; 7, 13 and 14 gain the same disable from 10's photograph-scrim argument, which had never been applied to them, and 4's planes gain it by extension.
7. **The component inventory's "contained 1:1 upload"** on `itemIcon` — dropped per the category ruling: an upload cannot recolour for dark mode and sits outside the closed vocabulary; the P0·2 slot popover's Size and Colour role replace it, and the fall-back mark is what an empty slot renders.
8. **Member visibility's trigger** — the audit names the "Below the set: Action" row; 3, 6, 13 and 15 draw the action from fields with no such row, so the control lands on all eleven CTA-bearing designs per ground rule 9, and the five that keep `primaryAction` undrawn (7, 9, 12, 14, 16) carry none, stated on each frame.
9. **12's refused default-tab control** — stands; this pass adds only the repeater head's wording, "drag a feature to the first position to change what opens first", and confirms `tabLabel` edits inline on canvas.
10. **13's A19 note** — moved from prose onto the design itself, drawn beside the Content source control; the hand-off table keeps its row.
11. **14's five-item floor under From posts** — the floor holds against a bound feed: fewer than five matching posts and the editor names 4 Cards, the same sentence as authored mode; snap, arrows and the rule are unchanged at both sources.
12. **Fixed English** — 14's arrow labels ("Previous features" / "Next features") were the category's one visitor-facing literal pair; they are theme translation-catalog strings now. Everything else a reader sees was already an authored field.
13. **The six-control norm** — 8, 13 and 14 now run a Data group beside their lists; all sixteen stay legal under the lifted ~15 ceiling plus the universal trio and the Data group, and Quick Controls stay the 3–5 highest-impact per design.
14. **A5-0 Category Proof** — its shared field list and category rules predate this pass (the icon slot, Image focus in the popover, Member visibility, the Data group on three designs); A5-0 was not redrawn, and per the consistency rule the drawn panels are the authority until it is.
15. **The two findings stand** — 12's double heading with JavaScript off and 14's rule having no registry sentence remain **ARCHITECT: registry** questions; nothing in this pass touched either, and no module name was coined.
