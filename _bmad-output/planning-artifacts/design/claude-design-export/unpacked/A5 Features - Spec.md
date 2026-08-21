# A5 Features — written specification

16 designs · Paper pack · drawn in this project as `A5-1 Three Up.dc.html` … `A5-16 Panel.dc.html`, with the category's shared artefacts in `A5-0 Category Proof.dc.html`.

Read `A5-0` first. It carries the four settlements §8 asks A5 to make, the head and item ladders, the rules all sixteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated sixteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**.

---

## 0. The shared floor

Everything in this section applies to all sixteen unless a design says otherwise.

**The frames draw the section alone on the page ground.** A4 drew the site header above every hero because a hero sits under one. A feature section has an ordinary section above and below it, so a header over these frames would say something false about where the section sits. Where a design's rule concerns its neighbour — 16 Panel's inset, 13 Spotlight's foot — the neighbour is drawn and the caption says so.

**Colour.** Role tokens only — `background`, `surface`, `text`, `text-muted`, `border`, `accent`, `contrast`. Accent is spent once or twice: an icon container at Accent, one section action, a tab's active underline. Two designs spend it per item and say so — 11 Checklist's mark and 15 Index's numerals — and both offer a value that uses no accent at all.

**The head.** Eyebrow 13 px uppercase tracked `.08em` in `text-muted`. Section title in the pack's heading font at Medium 34 / Large 40 / Display 48 on desktop, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390, on a 780 px measure. Sub 17 px muted on 620. The head's ladder is A4's stepped down one full size: a feature section is not the top of a page, and a 60 px line in the middle of one competes with the hero above it.

**The item.** The item title's size is not a control — **it steps with the column count**: 24 px at Two, 21 at Three, 19 at Four; 22 / 20 / 18 at 834; 20 at every count on a phone. Body 16 px in `text-muted`, 15 px at Four across — the brief's floor, and the reason Four is the last count offered. Item meta 13 px muted. **Three designs read the ladder off the column's measure rather than the count** — 5 Split Head, 9 Bento and 14 Scroller — and each says so on its own frame.

**Padding and gaps.** Padding Compact 64 · Comfortable 96 · Spacious 132 at 1440, 80 at 834, 64 at 390 — A4's values unchanged. Item gaps 32 px between columns and 40 px between rows at 1440; 24 and 32 at 834; 28 px stacked at 390. Page margin 72 / 40 / 20. Everything on the 8 px grid. Designs that depart: 4 Cards and 8 Media Top use a 32 px row gap (the card's padding is already separating), 2 Two Up uses 44, 7 Alternating Media 72, 15 Index 44, 10 Contrast Band runs the whole padding scale one step tighter at 44 · 64 · 88, and 16 Panel fixes the section's padding at 96 and controls the panel's instead.

**Headings and landmarks.** The section is a `<section aria-labelledby>` named by its own title, an `<h2>`. Item titles are `<h3>`. **The items are a list** — a `<ul>` of `<li>` — because a feature set is a count of things and a screen reader should say how many. With no section title the section is not a labelled region and the item titles step to h2.

**The section action.** At most one, under the set, centred with a centred head and at the left margin with a left one. It is A1·1's button at A1·1's size — accent fill, 14 px/600, padding 9×17 — **not A4's hero scale**: a button in the middle of a page is not the page's first ask. A row of actions is A6's. 5 Split Head is the only design whose action is not under the set.

**Responsive floor.** Every count is one column at ≤ 767 unless the design names another arrangement — 3 Four Up keeps two where its body copy is hidden, 11 Checklist keeps two, 14 Scroller keeps its rail, 15 Index keeps two at Compact. At 1080 and below Four becomes two and Three becomes two; Two stays two. A design that changes arrangement at a width states the width in words.

**Data.** **Nothing in A5 comes from Ghost.** Features are authored — there is no feature object in the API — and every number a reader sees is typed by the site owner. Every design is offered on every route.

**Empty.** No items authored → the section does not render and the editor names the field. No eyebrow, sub, action or note → each simply absent. Per-design empty states are below.

**Motion.** Hover only, 160 ms ease-out, one transition per state change, except 12 Tabs. Nothing scales, lifts or fades on hover anywhere in A5. Reduced motion removes transitions and keeps states.

**Content.** Orbit Weekly throughout: six items — the weekly letter, the full archive, field notes, reader threads, the source files and the printed quarterly — with Office hours, a reading list and three more authored for the frames that need them, each named in its caption.

---

## 1. Three Up

A centred head over three bare items on the page's own ground. The category's floor: it sets the item, the grid, the head and the section action, and the fifteen designs after it are departures from it.

**Fields.** `eyebrow` · `title` · `sub` · `items[]` (`itemTitle` req · `itemBody` · `itemIcon` · `itemLinkLabel` · `itemLinkUrl`) · `primaryAction` · `note`. `itemImage`, `itemImageAlt`, `itemMeta`, `tabLabel` kept and not drawn.

**Controls.** Padding · Media (Icon · Icon in a tint · Icon in accent · None) · Head alignment (Centred · Left) · Ground (Background · Surface · Contrast) · Below the set (Action · Note · Nothing) · Item link (None · Text link).

**Picture is not offered.** A photograph needs an edge to sit against and these items have none — a picture on the page ground with text under it is 8 Media Top without its card. **Icon in accent disables the Action value** of Below the set, with the reason shown: six accent squares and an accent button is the accent spent seven times.

**The grid.** Three 410 px columns on a 1296 px content width, 32/40 gaps, the head 780 / 620 px and centred, 64 px above the set and 56 px below it. A short last row keeps its column width and stays left-aligned; fewer than three items divides the row by the item count. **The items stay left-aligned at both head alignments** — centring six short paragraphs in three narrow columns leaves the body copy two ragged edges.

**Responsive.** Three across down to 1081; two across at 1080 and below (gaps 24/32, padding 80, title 34, item title 20); one column at ≤ 767 with 28 px between items, 24 with Media None, the head left-aligned whatever the control says, the action full width at 48 px.

**Empty.** No body on an item → the item ends. No item with body → the row gap tightens 40 → 32. No icon → the fall-back mark.

**a11y.** The floor, as §0. Icons `aria-hidden` at every treatment, including Icon in accent where they are the most conspicuous thing in the section. Zoom: at 200% text the three columns become one and the 40 px container does not grow.

**Flagged.** The 410 px item and the 64/56 px separations, the action's return to A1·1's metrics, the four Media values, refusing Picture, disabling the action at Icon in accent, the items' independence from the head's alignment, the 1080 breakpoint, the 28/24 px mobile gaps, and the container's dark-mode step to `#2B2620` on a surface ground.

---

## 2. Two Up

Two items across a 632 px column each, for features that need a sentence rather than a phrase. The extra width creates the problem 1 never has, and this design settles it.

**Fields.** As 1.

**Controls.** Padding · Media (48 px container) · Item arrangement (Icon beside the text · Stacked) · Head alignment (Left · Centred, **Left being the default**) · Below the set (Action · Note · Nothing, **Note the default**) · Item link (None · Text link).

**No Ground control.** Two items on `surface` is 16 Panel and two on `contrast` is 10 Contrast Band; both exist as designs with the controls this one would need, and the editor names them.

**The grid.** Two 632 px columns, 32 px between, 44 px between rows. **The body is capped at a 520 px measure inside the 632 px item** — about 78 characters a line, and the reason this is not 1 with a column removed. Icon beside the text is the default because a 48 px container and its 20 px gap leave 564 px, at which the cap is doing almost nothing. The icon's top aligns to the title's cap height, a 3 px optical lift.

**Responsive.** Two across at every width above 767 — the only count that survives the tablet unchanged. **Below 1081 the arrangement is Stacked whatever the control says** (container 44, title 22, gaps 24/36). One column at ≤ 767, link label 15 → 16 px with a 44 px target that extends past the label.

**Empty.** As 1. An odd item count leaves the last cell empty; one item takes the full width with the 520 px cap holding it.

**a11y.** As §0, plus one addition — **six link labels must differ**, and the editor advises when they do not without appending the item's title to the accessible name. At 400% zoom the container is dropped and the arrangement becomes Stacked.

**Flagged.** The 520 px body cap, the 44 px row gap, the 48 px container, Left as the default head alignment, dropping Ground and both named destinations, the 3 px cap-height lift, the 1081 arrangement rule, the six-labels advisory, and the 400% behaviour.

---

## 3. Four Up

Four items across 300 px each, the densest grid the ladder allows, and the design for eight or more.

**Fields.** As 1.

**Controls.** Padding · Media (36 px container) · **Body copy (Show · Hide)** · Head alignment · Ground · Item link (None · Text link at a **14 px label**, unavailable at Body copy Hide).

**Why no fifth column.** A fifth column on 1296 px is a 233 px item, where a 19 px title takes twelve characters a line and the body would fall to 13 px, under the brief's floor of 15. The answer is Body copy Hide at four columns rather than a fifth column.

**Body copy Hide** removes the paragraph from the DOM rather than hiding it visually, keeps the copy in the editor, tightens the row gap 40 → 32, and keeps two columns at ≤ 767.

**Responsive.** Four across down to 1081; **two across at 1080 and below — never three**, since 754 px in three is the 235 px item this design already refused. At ≤ 767: one column with body copy (title 20, body 16 — both larger than at 1440); **two columns with body copy hidden** (165 px each, title 18, gaps 20/24).

**Empty.** As 1. Six items give a row of four and a row of two, left-aligned at their column width.

**a11y.** The short row is announced as nothing — six `<li>` in one list, no element in the empty cell. Accent-fill glyphs are measured against the fill, 4.9:1 light and 6.1:1 dark, with the glyph in the pack's background colour rather than white.

**Flagged.** The 36 px container and the container ladder, the 14 px link label, the 233 px refusal, Body copy as a control and its three consequences, the two-column phone rule and its tie to that control, the 1080 step, and drawing two extra items in the Body copy frame alone.

---

## 4. Cards

1's grid with each item on its own plane. Settles the plane, the row-height stretch and Whole item — the three things half the category borrows.

**Fields.** As 1. At Whole item the card's accessible name is `itemTitle` and `itemLinkLabel` is unused and kept.

**Controls.** Padding (the section's) · Card treatment (Hairline · Tinted · Raised) · Media · Head alignment · Item link (None · Text link · Whole item) · Below the set.

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

**Fields.** As 1, with `primaryAction` and `note` drawn **in the head column**. The section title is effectively required — a head column with no title is a column of sub, and the editor says so rather than rendering it.

**Controls.** Padding · Head width (Narrow 380 · Medium 440 · Wide 520, gutter 64 at all three) · Head behaviour (Stays at the top · Follows the scroll) · Media (Icon · Icon in a tint · None, **default None**; Icon in accent not offered, the accent being spent on the action) · Below the head (Action · Note · Nothing) · Item link (None · Text link).

**The division.** 440 + 64 + 792 at the default, the grid in two 380 px columns. **The item title is read off the column's measure rather than the count** — 380 px is Three Up's column within thirty pixels — and at Head width Wide it steps 21 → 19, since 340 px is Four Up's.

**Follows the scroll** is `position: sticky` with a 96 px top offset, bounded by the section, **offered only where the grid is at least 240 px taller than the head** (about five items) and only above 1080. Reduced motion does not change it: sticky is a position, not an animation.

**Responsive.** The column division holds to 1081. **At 1080 and below the head goes above the grid on a 600 px measure and the grid keeps two columns**; Head width and Head behaviour are both unavailable and the panel says why. One column at ≤ 767, the action full width at 48 px **still in the head**.

**Empty.** No sub → the action rises to 24 px under the title. Fewer than three items → the grid divides by the item count and the head keeps its width.

**a11y.** Head then list in the DOM at every width. The action is inside the `<header>` and is the section's first tab stop: the offer, then its evidence. Sticky moves nothing in the DOM, traps no focus, and is dropped at 200% zoom.

**Flagged.** The 440/64/792 division and all three head widths, the measure-read title and its step at Wide, the sticky offset and its 240 px threshold, reduced motion leaving sticky alone, the action's place in the head at every width, None as the media default, refusing Icon in accent, and the 1080 stack.

---

## 6. Rows

One item per full-width row, a hairline between. The only arrangement in A5 where an item has as much room as it wants.

**Fields.** As 1, **plus `itemMeta`** (≤ 24) — the design that introduces it. `itemBody` is **unclamped** here, as on 13.

**Controls.** Padding · Rules (Between · Between and outer · None) · Media (40 px, at the row's left, top-aligned to the title) · Item meta at the right (Show · Hide) · Head alignment (Left · Centred, Left default) · Item link (None · Text link · **Whole row**).

**The row.** 28 px of padding above and below, fixed; a 40 px container; a 24 px title; a 16 px body on a **620 px measure**; the meta 13 px muted, never wrapping, top-aligned to the title with a 6 px optical lift — A4·17's rule, carried. **Rules None steps the row padding 28 → 36**, since with no hairline the space between two titles was doing all the separating.

**Hover at Whole row.** Hover surface across the content width **and 16 px beyond it on each side**, the title underlined, the icon's tint inverted, the meta unchanged, nothing moving. Focus is a 2 px accent ring on the row's box at the pack radius — the one place a row has corners.

**Responsive.** The row holds at every width. **At 1080 and below the meta leaves the right-hand end and sits under the body**, left-aligned at 13 px; row padding 24, title 22. At ≤ 767 the row stacks — container, title, body, meta — at 20 px of row padding, 24 at Rules None; **the icon never moves beside the title**.

**Empty.** No meta on an item → that row's right end is empty and the others keep theirs. No body → the row is a title and a meta, about 84 px tall.

**a11y.** A list, **not a table**: the meta is a fact about its own item rather than a cell in a shared column, and nothing is sortable or comparable across rows. Hairlines are `border-top` on the `<li>`, never `<hr>`. **“Members only” in the meta is plain text** with no glyph, badge or state — A5 does not know a reader's membership and A32 Paywall owns everything that does.

**Flagged.** The 28 px row padding and its step at None, the 620 px body measure, the unclamped body, the meta's lift and its 1080 destination, the 16 px hover overhang, the ring's radius on a square row, the stacked phone order, and the members-only wording.

---

## 7. Alternating Media

Picture-and-text rows whose sides alternate, for two to four features that each need showing.

**Fields.** As 1 plus `itemImage` (≥ 1200 px) and `itemImageAlt`. `itemIcon`, `itemMeta`, `tabLabel`, `primaryAction` and `note` kept and not drawn — four rows each carrying a link is already four asks. **Two to four items;** above four the editor names 8 Media Top and the items are kept. The frames draw items 1–4 of the category's six, the only place in A5 a design's frames carry less than the authored set.

**Controls.** Padding · First row's picture (Left · Right) · Alternate sides (On · Off, **no effect at ≤ 767**) · Picture treatment (Flush · Framed inset) · Head alignment · Item link (None · Text link).

**The row.** Two 620 px halves on a 56 px gutter, the picture **3:2 and fixed** (620 × 413) to agree with A24 and A4·13, 72 px between rows, item title 28 px — the largest in A5 — body 16 px on a 520 px measure. The picture centres against the text where the text is taller. **Framed inset** is A4·3's mount unchanged: 14 px of surface, one hairline, the picture at half the pack radius, and the row grows 413 → 441 px.

**Whole item is not offered.** A 1,296 px row is not a target a reader aims at, and the picture does not respond to a pointer for the same reason.

**Responsive.** Two halves down to 768 — 361 px each on a 32 px gutter at 834, title 24, row gap 56, and the design's real limit rather than its breakpoint. At ≤ 767 every row stacks with **the picture always first** and the crop goes **3:2 → 16:9**, the only crop change in A5; title 22, 40 px between items, the mount 10 px.

**Empty.** An item with no picture becomes a **text tile**: the 3:2 box in hover surface carrying the title at 19 px bottom-left, the title not repeated beside it, the crop held. No item with a picture → the section is 6 Rows at a 28 px title, named.

**a11y.** Picture then text in the DOM on every row; alternation is `row-reverse`, never a source reorder. `alt` empty by default and authorable, the editor asking what the picture adds. **The text tile is `aria-hidden`** — unlike A4·13's deliberate repeat, because the h3 beside it already says the words.

**Flagged.** The 3:2 crop and its agreement with A24, the 56 px gutter, the 72 px row gap, the 28 px title, the centring rule, the two-control alternation and its phone exception, reusing A4·3's mount and the 441 px it costs, the 16:9 phone crop, the text tile's `aria-hidden`, refusing a whole-item link, the four-row advice, and drawing four of six items.

---

## 8. Media Top

A picture across the top of every item, three across, on 4 Cards' plane. Where 7 hands off at the fifth item.

**Fields.** As 7, with `primaryAction` and `note` drawn.

**Controls.** Padding · Item plane (Card · None) · Head alignment · Ground (Background · Surface, **no Contrast** — six photographs on an inverted band is 10's problem and 10 draws icons) · Item link (None · Text link · Whole item, **available at both planes**) · Below the set.

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

**Fields.** As 8, and **only the first item's `itemImage` is drawn**; the small tiles use `itemIcon`. Pictures on later items are kept and unused, and the editor says which item's picture is showing. **Three items minimum, six intended, nine advised as the ceiling** — below three it names 4 Cards, above nine it advises it.

**Controls.** Padding · Large tile (Left · Right — **grid placement, never a source reorder**) · Large tile media (Picture · Icon · None) · Small tile media (Icon · Icon in a tint · None, **no Picture**) · Item link (None · Text link · Whole item) · Head alignment.

**No Ground control.** The tiles are the surfaces; a surface ground needs 4 Cards' step-up on every tile and six lifted tiles on a lifted ground read as one block with seams. `contrast` is 10 Contrast Band, which the editor names.

**The grid.** Three 410 px columns, 190 px rows, 32 px gap; **the first item spans 2 × 2 (852 × 412) and the rest fill the remaining cells in written order**. Tiles are 4 Cards' Hairline plane, padding 28 large and 24 small. Large title 28 px (7's), small title 19 px with 15 px body (3's). The large picture's crop is **derived from the tile's remaining height** and is dropped below 120 px with the reason named.

**Two media controls is the category's one exception** to settlement 2's section-wide rule: an 852 px tile and a 410 px tile want different things.

**Responsive.** The 2 × 2 block holds to 1081. At 1080 and below two columns, **the large tile spanning both as a full-width row**, the small tiles pairing off, and **an odd last tile spanning both columns** — the one place in A5 a short row is filled rather than left. One column at ≤ 767: the large tile keeps a 16:9 picture and a 22 px title, the small tiles keep their glyphs, body back to 16 px.

**Empty.** No picture on item one → the tile is title and body with the space returned to the text, **not a text tile**: the tile is large enough to carry words alone.

**a11y.** The large tile is an item like the others — size is CSS, not markup; no “featured” label, no `aria-current`. **Emphasis is visual only, and that is the design's honest limit;** 13 Spotlight says it structurally. Tab order follows the DOM, which at Large tile Right differs from the eye by one tile.

**Flagged.** The 190 px row and 2 × 2 span, the fill order, the item-count floor and ceiling, the derived crop and its 120 px floor, two media controls as the settlement's exception, refusing Picture on small tiles, dropping Ground, the tablet's spanning odd tile, and the phone's stated limit.

---

## 10. Contrast Band

The whole set on the inverted ground. Ground is not a control here: it is the design.

**Fields.** As 1. **One band per page** is the editor's advice, not a rule.

**Controls.** Padding (**44 · 64 · 88** — one step tighter, A4·9's values carried) · Band edges (Full bleed · Page margin; pack radius and 56 px inner padding there, always full bleed at ≤ 767) · Media (Icon · **Icon in a lift** · None) · Head alignment · Below the set · Item link (None · Text link).

**What the band changes.** The icon container is a **10% lift of the carried colour** rather than a surface tint — there is no surface on a band and the packs do not define one. Hairlines are **28% of the carried colour** (A4·9's). The action is a **solid `text`-coloured fill carrying the band's colour**, hovering 3% darker. **Focus rings are the carried colour rather than the accent** — 12.8:1 against 3.2:1, the one design in A5 where the ring's colour changes. The 40 px container holds at every width, because the lift is the only thing separating a glyph from the band.

**Two refusals, both with their ratio shown.** An accent fill carrying the band's colour is 3.2:1 in Paper, so the accent action is **disabled with its number** per §7·4 — and it stays disabled even in a pack whose accent would pass, because a control whose availability varied by pack would make one design twelve. **Icon in accent** is not offered either: six accent squares on an inverted band is the loudest object in the library. **Picture** is not offered: a photograph on a band needs a scrim A5 does not have, and 8 Media Top on the page's own ground is what the editor names.

**Dark.** Paper's dark `contrast` is `#EDE7DA` carrying `#171511`, so **the band is light in dark mode** — the one design in A5 whose modes are not variations of each other. Muted is `#57524A` and the icon's lift is dropped, with Icon the default and the substitution named.

**Responsive.** Three across to 1081, two at 1080 and below (band padding 56 at Comfortable, item title 20), one column at ≤ 767 at 44 px, always full bleed. The lift and the hairline are ratios and do not change with width.

**a11y.** The band is not a landmark, a region or a theme boundary — a background colour on a section that already has a name. Forced colours drop the band's colour and nothing depends on the inversion.

**Flagged.** The 10% lift and its 40 px box at every width, dropping the lift in dark, refusing Picture and Icon in accent, the carried-colour focus ring, the 3% action hover, the 56 px inner padding at Page margin, the one-band advice, and reusing A4·9's padding, hairline and action rather than inventing new ones.

---

## 11. Checklist

Two columns of one-line items with a small mark at the left. The design settlement 4's title-only item was written for.

**Fields.** `eyebrow` · `title` · `sub` · `items[]` with **`itemTitle` only** · `primaryAction` · `note`. Everything else is kept and not drawn — the largest set of kept-and-unused fields in A5 — and the editor names **3 Four Up at Body copy Show** for a site that wants a line under each entry. Two to twelve items, and twelve is comfortable here; about 40 characters an entry advised, 24 for the two-column phone.

**Controls.** Padding · Mark (Check · Dot · Rule) · Density (Compact 12 · Comfortable 16 · Spacious 24) · Rules between entries (Show · Hide) · On a phone (Keep two columns · One column) · Below the set.

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

**Fields.** As 8 **plus `tabLabel`** (≤ 20, hard) — the only design that draws it; absent, the tab reads `itemTitle` clipped to 20 with the clip disclosed. `itemIcon`, `itemMeta`, `primaryAction` and `note` kept and not drawn — a section action under a panel would look like the panel's own. **Two to six items; six is the ceiling** and seven names 6 Rows or 4 Cards.

**Controls.** Padding · Tabs and head (Left · Centred — one control for both) · Panel media (Picture · None, **no Icon**) · Picture side (Right · Left, **the same on every panel, no alternation**) · Ground (Background · Surface, **no Contrast**) · Item link (None · Text link).

**The tab** is A1·1's nav item verbatim: 15 px, muted resting, `text` at 500 with a 2 px accent underline active, **hover to full strength with no underline** — a hover that borrows the underline makes every pass of the pointer look like a selection. 28 px apart at 1440, 20 at 834, 18 on a phone; 44 px tall at every width. The accent's one appearance in the design.

**The panel** is 7's geometry — two 620 px halves, 56 px gutter, picture 3:2 — 48 px under the row and **its height is the tallest item's, measured once and held**, so switching never moves the section's foot. Switching is a 160 ms cross-fade of the whole panel; nothing under reduced motion. A site whose items differ by more than about 120 px of text is advised toward 6 Rows.

**Six tabs is the ceiling.** Six labels at 15 px with 28 px between them is about 900 px of 1,296; at seven the row wraps, and a wrapped tab row is a menu.

**While editing.** The behaviour does not run. **The panel draws whichever item is selected in the sidebar's item list** and the row follows it; clicking a tab selects its label for editing. **A published page always opens on the first item, and there is no default-tab control.**

**Responsive.** At 1080 and below the panel stacks — **picture above text always** — and the row holds on one line at 20 px, the tightest it ever is and the reason the 20-character cap is enforced. At ≤ 767 **the row scrolls sideways**, bleeding to the page edges so a clipped label says there is more; no arrows, no fade mask; crop 3:2 → 16:9; labels 16 px. **It never becomes an accordion** — A9 FAQ owns those.

**a11y.** `role="tablist"` of `<button role="tab">` labelled by the section's title; roving `tabindex`, arrow keys, Home and End, **activation follows the arrows**, no auto-rotation, no live region. Panels are `role="tabpanel"`, `tabindex="0"`, each containing its own h3 which **repeats the tab's label deliberately**. Hidden panels are `hidden` — not in the tree, pictures not fetched, not found by in-page search — and **a reader who does not touch the tabs sees one feature of six**, which is the design's stated cost.

**Flagged.** The fixed panel height, the 48/40 px gaps, the hover's refusal of the underline, the tab spacing, the six-tab ceiling and its arithmetic, the editing model and the refusal of a default-tab control, activation following the arrows, the sideways-scrolling phone row, the deliberate h3 repeat, and refusing Icon, Contrast and Whole item.

---

## 13. Spotlight

One feature at picture scale with the rest reduced to single lines beneath it. Where 9 Bento makes the first item bigger, this design makes it the subject.

**Fields.** As 8. **Only the first item's `itemImage`, `itemBody`, `itemLinkLabel` and `itemLinkUrl` are drawn**; the rest contribute their `itemTitle` alone. `itemBody` is **unclamped** on the spotlight. **The spotlight is the first item and there is no control for it** — a user drags an item to the top. The frames spotlight the full archive rather than the weekly letter, which is that re-ordering, stated.

**Controls.** Padding · Spotlight media (Picture · None; 3:2 fixed, no Icon; **at None the title steps 34 → 30**) · Picture side (Left · Right) · The rest (Entries under the spotlight · Beside the text · Hidden) · Mark (Check · Dot · Rule — 11's values) · Item link (None · Text link, **on the spotlight only**).

**No head alignment:** the head is always left, as on 11. **The entries are never links** — 11's rule, carried. **Whole item is not offered:** a link over a 760 px picture and its text is a target the size of a window.

**The arrangement.** 760 px of picture, a 40 px gutter, 496 px of text — wider picture and narrower column than 7's even halves, which one row can afford. Item title 34 px, the largest in A5. The entries are 11's entry verbatim, in three columns on a 40 px gutter, 36 px under a hairline, **filled across rather than down**: five short lines under a picture are read as a group. At Beside the text the entries take the 496 px column and **the picture grows to 560 px tall at the same 3:2**. Hidden makes this the category's one-item section, and the items it hides are kept.

**Responsive.** At 1080 and below the spotlight stacks — picture first, always — title 30, body on 620, entries two columns. At ≤ 767 one column, crop 3:2 → 16:9, title 26, **entries stay 17 px**.

**Empty.** No picture on the first item → the design is its own Spotlight media None, **with no text tile**: one item has no row rhythm to protect, and an empty 760 px box is worse than the words alone. No items past the first → the spotlight alone, no rule.

**a11y.** **One `<ul>`, the spotlight being its first `<li>`** — not a figure plus a list. All titles are h3 whatever their size. Nothing is `aria-current` or labelled featured. At The rest Hidden the other items are **absent from the DOM** and the editor says how many are held back.

**Flagged.** The 760/40/496 division, the 34 px title and its step at None, the unclamped body, reusing 11's entry with the fill reversed, the three values of The rest, the picture's growth at Beside the text, refusing a text tile, refusing entry links and a whole-item link, dropping head alignment, and re-ordering the category's items.

---

## 14. Scroller

A rail of cards that overflows sideways instead of wrapping. The library's overflow model.

**Fields.** As 8; `itemMeta`, `tabLabel`, `primaryAction` and `note` kept and not drawn — the head carries the arrows where the action would sit. **Five items minimum** (below five the editor names 4 Cards: a rail with nothing off-screen is a grid with a scrollbar), **nine advised as the ceiling**, naming 4 Cards again and A17 Post Grids for a long set. **One rail per page**, flagged rather than prevented. **Never for pricing or anything a reader compares.**

**Controls.** Padding · Card width (Narrow 280 · Medium 320 · Wide 380 — **Wide steps the title to 21 and the body to 16**, the measure rule) · Media (Picture · Icon · None; 16:9 fixed, a missing picture becoming 8's text tile) · Rail edges (Bleeds right · Page margin — always bleeds right at ≤ 767, and **at Page margin, Rail controls None is unavailable**) · Rail controls (Arrows · A rule · None, **no dots at any value**, None by default on a phone) · Item link (None · Text link · Whole item).

**The rail.** Cards 24 px apart (20 at 834, 16 on a phone), the card 8 Media Top's narrowed with 20 px of text padding. **The right bleed is the affordance:** a card sliced by the window says “more this way” better than an arrow, and the rail does not bleed past a final card. Arrows are A1·14's 38 px icon button, outlined, in the head's right, 40% and `disabled` at an end. The rule is a 3 px track 240 px wide, 24 px under the rail, **not draggable and not a scrollbar**. Snap is **`proximity`**; an arrow press moves one card to the left margin.

**Responsive.** **The arrangement does not change at any width** — card 320 / 300 / 280, gap 24 / 20 / 16 — which is the argument for the design existing. The sub leaves the head at 834 to keep the arrows on its line.

**a11y.** A `<ul>` in an `overflow-x: auto` box — **not a carousel, not a tablist**, every item in the tree at all times. The rail is `tabindex="0"` with an `aria-label` naming the section, the one place in A5 a non-interactive element takes a tab stop. Arrows are `<button>`s labelled “Previous features” and “Next features” in words with the glyph `aria-hidden`. **Tabbing to an off-screen card scrolls it fully into view, ring included**, instantly under reduced motion, which also drops snap. **Nothing moves on its own:** no autoplay, no timer, no loop, no swipe hint.

**Flagged.** The three card widths and their type steps, the 24 px gap, the right bleed and its refusal past the last card, the arrows' place in the head, the rule's geometry and its refusal to be draggable, refusing dots, proximity snap, one card per press, the focus-scroll rule, the five-item floor and nine-item advice, the one-rail rule, and the sets the design refuses.

---

## 15. Index

A large numeral where the icon would be. The editorial answer to the media question, and the design that has to hold a boundary.

**Fields.** `eyebrow` · `title` · `sub` · `items[]` with `itemTitle`, `itemBody` (not at Compact) and `itemMeta` · `primaryAction` · `note`. **The numeral is not a field** — it is generated from the item's position. Two to twelve items; Letters run A to L.

**Controls.** Padding · Numeral (**01 · 1 · A**; 01 pads to two digits so every rule starts at the same x) · Numeral colour (Muted · Accent, Accent advised for three or four items) · Arrangement (Full · Compact) · Rule under the numeral (Show · Hide) · Item meta (Show · Hide).

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

**Fields.** As 1 plus `itemMeta`, drawn on the icon's line at the cell's right. `primaryAction` and `note` are kept and not drawn: **an action under a panel belongs to the page rather than the panel**, and A6 CTA Banners is the section for one.

**Controls.** Panel padding (**Compact 32 · Comfortable 48 · Spacious 64** — A3·12's values; the section's own padding is fixed at 96) · Inset (**Snug 16 · Comfortable 40 · Wide 72** inside the page margin — A4·8 Card's values unchanged, so a site running both reads one shape) · Dividers (Both · Between rows · None) · Media (Icon · Icon in a tint · None — **no accent value and no Picture**) · Item meta · Item link (None · Text link · Whole item).

**The panel.** A3·12's plane — `surface`, one hairline, sm shadow, pack radius; **a hairline and no shadow in dark**. 32 px between a cell and the divider beside it, so two items are 64 px apart across a 1 px line, and **no divider reaches the panel's edge**: a line that touches the border makes a cell, and a cell implies a column of comparable things. At Between rows a 32 px gutter returns between columns; at None the gaps are 32 and 24. The head sits above the panel at the page margin, and **the gap under it is always 48** whatever the inset.

**Hover at Whole item.** The **cell** takes a hover-surface block at a 6 px radius, stopping 16 px short of the divider on each side (4 px on a phone), so the hairlines stay visible and the panel itself does not change. The title underlines, the icon's tint inverts, nothing scales. Focus is the ring on that same block, and **it never crosses a divider**.

**Responsive.** Three across to 1081. At 1080 and below two across with **inset 40 → 24, panel padding 48 → 32, cell padding 32 → 24**. At ≤ 767 one column, the panel keeping a **16 px inset inside the page's 20** (A4·18's rule), padding 20, dividers rows only, and the Inset control ignored.

**Empty.** A short last row leaves its cells empty and **the dividers stop where the items do** — a hairline into an empty cell draws a box around nothing.

**a11y.** The panel is **not a landmark, region, group or table** — one `<ul>` with a background and a border, the dividers being `border` properties on the items. No header row, no axis, nothing comparable down a column. Forced colours keep the border and the dividers, which is the practical argument for drawing them as borders.

**Flagged.** The 48/32 padding pair and the 64 px effective gap, the divider's edge rule, the three divider values and the gutter's return, the head's position outside the panel and its fixed 48 px gap, the cell-block hover with its 16 px inset, 6 px radius and 4 px phone value, refusing Picture, the accent and a section action, the tablet's three-way step, and reusing A3·12's plane and padding with A4·8's inset unchanged.

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
