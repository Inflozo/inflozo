# A27 Related Posts — written specification

12 designs · Paper pack · drawn 23 August 2026

**Controls-reconciliation patch — 25 August 2026.** The category was audited, design by design,
against the PRD's control vocabulary and Ghost's verified data surface, thinking like a user editing
their own site. This revision reuses the shared editor primitives from **P0 · Editor primitives** by
name — the **P0·1** inline text toolbar with its link popover, the **P0·2** icon slot and Icon Picker,
the **P0·3** item controls, the **P0·4** member-aware action editor, the **P0·5** "Populate from…"
data panel and the **P0·6** editor state switcher — and never redraws them. Six rules now sit on every
design: the **universal trio outside each control list** (with each design's old Padding row retired
into it), the shared Related block recut as the **Data group** with **relatedBy widened to seven
sources**, **Order Newest · Oldest**, **whenEmpty flipped to Hide the section**, the three head strings
**inline-editable** with the archive link finally carrying a **Link Picker**, and the reading-time
suffix bound to **A24's site-level string**. Six card designs gained **Tag: Off · Primary tag**. What
each design gained is in a **Reconciled** paragraph at the foot of its entry, and the frame-by-frame
list is in **Reconciliation notes** at the end.

**Design patch pass — 30 August 2026 (this document's current state).** The ten library-wide rules were
checked against all twelve designs and three of them changed what a site renders. **The count control
became a number picker, 1–4**, with 4 as every design's greyed ceiling and its reason on the control;
**two hand-offs were deleted** — 3 Thumb Rows and 8 Overlay now draw their own plates and their panels
advise; 9 Big Type lost its destination sentence; six panels gained the reason for a choice they had
quietly withheld; the author circle shows **one letter**; **11 Index's numbers are named as a CSS
counter**; and **7 Rail's "Label and count" is marked as an open question rather than guessed**, because
a Ghost template cannot count what it drew, and **the owner ruled that the rail draws the topic's
total**. **Nothing was renumbered**, and no arrangement, type scale,
colour pack or spacing step moved. Every change carries the name of the rule that required it in **Patch
notes** at the end.

**[Free] designs:** 1 Three Up · 2 Rows

*(Shortlisted in this pass — 1 Three Up, 2 Rows, 9 Big Type, 11 Index, 7 Rail: the five plainest
designs, none of which needs the customer to own good photography — and **ruled by the owner on
30 August 2026: 1 Three Up and 2 Rows**.)*

The frames are `A27-0 Category Proof.dc.html` and `A27-1` … `A27-12`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(A27·1 in three packs, light and dark), the stress frame, the roster and the four settlements in
full. The shared field list is repeated below because the build reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A26 are specified in root-level `<ID> — Spec.md` files and
this follows them. Moving them is a paste, not a rewrite.)*

---

## 0 · The category layer

### What A27 is

The offer to keep reading. **A26 owns the space directly under the article, A34 owns pagination, A3
owns the site, and this category owns the set of other posts between them** — two to four of them,
chosen by a query the user configures.

**The user does not author the set.** There is no repeater, no Add that creates a post, no Remove that
deletes one, no per-post styling anywhere in the category. The section is handed a query, Ghost answers
it, and the twelve designs draw whatever comes back. **One amendment from this pass:** at **Related by:
Hand-picked** the user *chooses and orders* posts through the Ghost post picker, storing references —
**picking is not authoring**, and every refusal above still holds.

A27 inherits **A17's post card, page margins, cell divisions, ratios, tag plate, hover and focus rules
and editor behaviour**; A17's padding ladder, now resolved by Vertical spacing; A1's avatar and initials
fallback; A1·14's icon button; A6's focus ring and its rule for a control on a band; A19's rule that no
design filters, dims, tints or borders a photograph; A25's 240 · 48 · 1,008 rail division; A26·3's call
that a plane is a ground rather than a containment; **A24's `readingTimeSuffix`**. **A27 adds nothing
to the component vocabulary** — which is the point of running it after A17.

### The four settlements (§8 of the brief)

**1 · How relatedness is chosen, and what the spec promises.** ⚑ **Widened in this pass** from three
values to seven, in the Data group: **Same tag** (default) · **Same author** · **Featured** · **By tag**
· **By author** · **Latest** · **Hand-picked**. Same tag compiles to
`{{#get "posts" filter="tags:[{{#foreach tags}}{{slug}},{{/foreach}}]+id:-{{id}}" limit=N
include="authors,tags"}}` — **it matches any of the current post's tags, not only the primary one** ⚑.
Same author swaps `tags:[…]` for `authors:[…]`. **Featured** is `featured:true+id:-{{id}}` — "more of
our best" is a real related-set, and the one a site with a small archive actually wants ⚑. **By tag** and
**By author** take a chosen tag or author instead of inheriting this post's, which is **how a series
orders its own rail** ⚑ — the set stops depending on what this particular post happens to be tagged.
**Latest** keeps `id:-{{id}}` alone. **Hand-picked** reads `postRefs`.

**What it does not promise.** **Ghost cannot rank by number of shared tags** ⚑, so at Same tag "related"
means *shares at least one tag* and nothing more. A post carrying a broad tag matches broadly. **This is
a finding for the architect**: relevance ranking needs a query the theme layer cannot express. The
widened source set is the honest answer in the meantime — **a user who wants a precise set can now name
one** rather than arguing with a query.

One consequence, drawn everywhere: the tag that made a post related is not necessarily its primary tag,
so A27 drew A17's card without its tag eyebrow. ⚑ **Amended in this pass:** the argument holds *at Same
tag* and does not survive the widened source set — at Featured, Latest, By author and Hand-picked the set
is mixed and the tag is the one word that says what a card is. **The eyebrow returns as a value, not as a
default: Tag: Off (default) · Primary tag**, on the six card designs that can place it (1, 4, 5, 10, 12
and 6's lead). The tag also survives, as before, in the plate and in 11 Index's tag column.

**2 · Counts of 2, 3 and 4, and fewer posts than slots.** **Show is a number picker, 1–4** ⚑ *(this pass — item counts are a number picker, never a row of fixed buttons)*, on A17's divisions: 636 · 416 · 306 across 1,296 on a 24 px gutter. **Fewer posts than the count is the common
case and is not an error state** ⚑ — the cells keep their width and sit at the left, exactly as A17
settled it. **Nothing stretches, centres, rebalances or promotes.** Exactly one post → one cell, one row,
one tile. **Two designs ship at 4** (10 Carousel, which needs the overflow; 11 Index, which is a list before it is anything) and **one is locked at 1** (12 Next Up, whose picker is drawn greyed with its reason visible and whose − and + stay clickable so they can say why ⚑ — reviewed in this pass and **kept**; A17·12 Bento's precedent, the only other override in the library). **4 is every design's ceiling, greyed with its reason on the control** ⚑ — the cell divisions on 1, 4, 5 and 8, and on the rest that a longer list of posts is A18's page. At Hand-picked, **Show and Order hide**: the picked list is the count and the order.

**3 · Reusing A17's post card rather than inventing one.** Taken verbatim: DOM order image → tag →
title → excerpt → meta; the title in the heading font at 26 / 22 / 19 / 17 by cell; **the whole card one
`<a>`** named by its title; no card fill, border, shadow or radius; the image carrying the radius; named
ratios; the tag plate; **hover a 2 px accent underline, focus A6's ring**; and A17's seven refusals — no
zoom, lift, scale, shadow bloom, fade, wash or appearing "Read more". ⚑ **The one change is now a
control, not a removal:** the tag eyebrow is **Off by default and available at Primary tag**, so DOM
order matches A17's in both states and switching designs never re-orders what a screen reader hears.
Nine of the twelve use the card or part of it; **2 Rows, 9 Big Type and 11 Index read no image field at
all**, which is what makes them the hand-off destinations.

**4 · Zero related posts: hide, or fall back.** **A control, not a rule** ⚑ — **When empty** in the Data
group: **Hide the section** or **Show latest posts**. ⚑ **The default flipped in this pass to Hide the
section**, and that flip is the point of the row: the shipped default must match the library's empty-feed
rule, because **an empty "More like this" panel is worse than its absence**, and P0·5 states the rule
library-wide ("a secondary feed renders nothing at zero items — heading and container together"). **Show
latest posts remains a choosable value**, and when it falls back **the head changes to `fallbackHeading`**,
default "Latest from Orbit Weekly" ⚑, so the page never claims a relationship it does not have. **What
never renders:** a placeholder card, an outline, a "No related posts" line, a sample post or a reserved
height. On Hide the whole section goes — head, plane, band, rail and all ⚑. **In the editor** the section
draws its outline at the count plus one line naming the query ("No other posts tagged Reporting. This
section will not appear on the site."), never published — A17's editor rule, inherited whole ⚑, and the
fallback head is seen through **P0·6's simulate entry** rather than by emptying the site.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The universal trio, outside every design's control list.** **Background role** (Background · Surface
  · Contrast), **Vertical spacing** (Compact 64 · Comfortable 96 · Spacious 132; 80 at 834; 64 at 390)
  and **Top divider** (None · Line · Fade). **Every design's old Padding row was Vertical spacing under
  another name and is gone** — including 4 Panel's "the space above and below the panel" and 5 Contrast
  Band's "the band's own", which resolves *inside* the band because the band **is** the section. ⚑
  **Rule 3's "band-internal padding" exemption was considered and declined on 5**, and that is recorded.
  **1 Three Up's Divider (On · Off) was Top divider under another name and is gone too** — Line is what
  On drew, Fade is new, and Line stays that design's default. **2 Rows, 3 Thumb Rows and 11 Index keep
  Rule**, which is the hairline *between* rows and a genuinely different thing. **Background role is
  locked at Contrast on 5**, with the reason shown; **Top divider is locked None on 5** for the same
  reason. **Nothing else is locked** — including 4 Panel (the plane is always one step from the page) and
  8 Overlay (the *pictures* are the tiles' grounds; the section's ground shows in the gutters).
- **The seam.** **A27 draws its own top padding and does not collapse against the footer above it** ⚑ —
  Vertical spacing's 64 · 96 · 132; 80 at 834, 64 at 390. Where an A26 footer and an A27 section are both
  on the route the two paddings sit adjacent. **Nothing in the product expresses "collapse against the
  section above" today, and that is finding 1** — the same route rule A26 raised.
- **The measures.** Content 1,296 · 754 · 350 on 72 · 40 · 20 margins, A17's, unchanged. Two designs also
  use the article measure: **2 Rows** defaults to 720, **7 Rail** draws 240 · 48 · 1,008.
- **The cells.** Two 636 · Three 416 · Four 306 on a 24 gutter, 48 row gap. **Two depart and both say
  so:** 4 Panel's 392 inside its fixed 40 px inset, 10 Carousel's 306 · 360 · 416 strip.
- **The head.** One control, three values — **Label** 13 px uppercase tracked .08em · **Heading** 28 px
  in the heading font · **None** — all reading one `headingText`, default "Keep reading" ⚑. **12 Next Up
  defaults to "Next up"** ⚑; **7 Rail has no Heading control** because its rail is the head. At None the
  section takes `aria-label="Related posts"` ⚑.
- **The type.** Titles 34 in 12 · 26 at 636 · 22 at 416 · 20 in 11 · 19 at 306 · 17 at 235 · 44/56 in 9.
  Excerpts 15/1.6 clamped by line (17 in 12). Meta 13, **14 in 9 and 12** ⚑. The eyebrow, at Tag: Primary
  tag, is A17's exactly: 13 uppercase tracked .08em in `text-muted`. **Nothing below 13.**
- **Accent, twice at most.** **The title's 2 px hover underline and A6's focus ring** ⚑ — and nowhere else
  in the category. **On the band and on a picture both take the carried colour instead** (A6's rule). No
  tag, date, byline, head, rule, eyebrow or number is ever accent.
- **Targets.** **One link per post and one tab stop per post** ⚑ — card, row, tile, index row, or the whole
  block in 12. Nothing sub-44. The carousel's arrows are A1·14's 38 px buttons in 44 px targets.
- **Responsive floor.** **Margin furniture leaves at 1,200** (7) · **splits collapse at 834** (6, 12) ·
  **grids go to one column at ≤ 767** · **rows, tables and strips do not collapse at all** (2, 3, 7's body,
  9, 10, 11 above 767). Every element that leaves a width has a stated destination.
- **Dark.** A17's step: ground `#171511`, surface `#211D17`, plate `#2A251E`, hairline `#332E27`, warm
  shadows dropped and the hairline carrying every plane. **Photographs untouched in both modes**; only
  8 Overlay's scrim re-tunes ⚑. 5 Contrast Band's band is *lighter* than the page in dark, which is Paper's
  `contrast` working correctly.
- **Print.** **No A27 section prints** ⚑ — related posts are navigation, and a printed page cannot be
  navigated. It is the first category that prints nothing at all, and it is one line in the stylesheet.
- **Behaviour.** **One design declares a module** — 10 Carousel's `carousel`. The other eleven declare
  none and are pixel-identical without JavaScript. `core` is assumed by the theme, not declared per
  design. **Nothing this pass added needs a module**: Hand-picked, Order and the widened sources all
  compile server-side, so **there is no "ARCHITECT: registry addition" anywhere in A27** ⚑.
- **Editing.** **Every visible authored text edits inline with P0·1** — `headingText`, `fallbackHeading`
  and `archiveLinkLabel`, and nothing else, the link popover carrying **Open in new tab** and rel
  **nofollow · noreferrer · sponsored**. **Ghost-owned content is never inline-editable** ⚑ — clicking a
  post title, tag name, author name or excerpt says **"Edit in Ghost"**. **Every URL field opens the
  Ghost-aware Link Picker.** **A27 authors no image** ⚑, so rule 10's Image focus has nothing to attach
  to: the crop is named by the Ratio ladder and the focal point belongs to the post, in Ghost. **A27 draws
  no button** ⚑, so rule 11's optional icon has nowhere to sit — the archive link is text with an accent
  underline, and **P0·2's Icon Picker never opens in this category**. **There is no Preview control** and
  there never was one to remove.
- **Member awareness.** **Member Visibility lands nowhere in A27** ⚑, and that is a judgement rather than
  an omission: **nothing here is a CTA.** A related post is navigation and the archive link is a route, so
  there is no offer to gate and **P0·4's member-aware action editor never opens**. Recorded in the
  Reconciliation notes.
- **No fixed English visitor-facing string ships.** Three authored strings with the defaults above, and
  **one site-level string** — the reading-time suffix, which is **A24's `readingTimeSuffix`** ⚑ and never
  a second hardcoded literal, so the post header and the related cards agree and a translated site
  translates it once. **8 Overlay draws no reading time at all** and does not read it.
- **Refused category-wide, each with a reason:** a "Related" badge ⚑ · a per-post pin ⚑ (Hand-picked is
  the whole set or none of it; per-post promotion inside a query is 6 Lead and List, which is a design) ·
  a relevance score ⚑ · tag colours (A26·8's argument) · relative dates (A17's) · `shuffle` ⚑ (a set that
  changes on reload cannot be proof-read) · `load-more` and `infinite-scroll` (A34 owns pagination; a
  related set has no page 2) ⚑ · a comment count (A28) · an author's other posts (A21) · autoplay ⚑.

### The Data group — what replaces the Related block

**P0·5 "Populate from…" cut for a post route**, identical in all twelve, **below** each design's own
controls and **not counted toward the control budget** ⚑. It replaces the three-field Related block.

| Field | Type | Values |
|---|---|---|
| `relatedBy` | enum req | Same tag · Same author · **Featured** · **By tag** · **By author** · Latest · **Hand-picked** |
| `relatedTag` | ref opt | read at By tag · P0·5's live-searched tag select, single pick |
| `relatedAuthor` | ref opt | read at By author · P0·5's author select, single pick |
| `postRefs` | ref[] opt | read at Hand-picked · the Ghost post picker's references, **drag order = drawn order** |
| `count` | int req | **A number picker, 1–4** ⚑ — default 3 · **4 in 10 and 11** · **locked at 1 in 12**, greyed with its reason · 4 is every design's ceiling, with its reason on the control · hidden at Hand-picked |
| `order` | enum req | **Newest · Oldest** — new; disabled at Hand-picked |
| `whenEmpty` | enum req | **Hide the section (default)** · Show latest posts |

**No Add, no Remove, no drag handle and no per-post styling** at any query value: the set is Ghost's
answer, it carries P0·3's "From Ghost" mark and its sentence, and **Hand-picked picks posts rather than
authoring them** — its rows drag and unpick, and an unpublished pick drops out server-side with an
"Unpublished" note on its row. ⚑ **This overrules the old answer** — "where a site wants a hand-picked
set, use a tag the site controls" — on A17's own argument: **a tag invented to arrange a layout pollutes
the site's public tag namespace**, appearing on the post and in every tag list on the site.

### Control budget

The old 4–7 norm is lifted where this pass added rows. **The ceiling is the PRD's ~15 visible controls
per design, plus the universal trio and the Data group.** No A27 design comes close: **four is the
minimum (7, 8, 9, 11) and six the maximum (4, 5, 10, 12)**. Quick Controls are the 3–5 highest-impact
rows, named on each control-panel frame's header line.

### The roster

| # | Design | Tuple | When the set is short or a field is missing | Ctl | Module |
|---|---|---|---|---|---|
| 1 | Three Up | `grid-of-N · none · page · few · top · three equal cards under one hairline` | Cells keep their width at the left | 5 | — |
| 2 | Rows | `feed · none · page · few · none · hairline rows on the measure` | Row ends at its meta; no image field read | 5 | — |
| 3 | Thumb Rows | `feed · none · page · few · left · a small picture beside every row` | Plate at the thumb; no pictures at all → a column of plates ⚑ | 5 | — |
| 4 | Panel | `grid-of-N · none · surface · few · top · the set on a raised panel` | Empty → the panel goes with the section | 6 | — |
| 5 | Contrast Band | `grid-of-N · none · contrast · few · top · inverted closing band` | Empty → the band goes with the section | 6 | — |
| 6 | Lead and List | `split · none · page · few · left · one lead against a short list` | One post → the list column is not drawn | 5 | — |
| 7 | Rail | `edge rail · none · page · few · none · the head in the margin` | No rail below 1,200; empty → both columns go | 4 | — |
| 8 | Overlay | `grid-of-N · none · page · few · background · titles over their pictures` | Plate tile with dark type; none at all → every tile plated ⚑ | 4 | — |
| 9 | Big Type | `stack · none · page · few · none · titles at display size` | The title is always there; nothing else is read | 4 | — |
| 10 | Carousel | `carousel · none · page · few · top · a strip that runs past the edge` | Fewer cards, no overflow, no arrows | 6 | `carousel` |
| 11 | Index | `table · none · page · few · none · dated rows in fixed columns` | Em dash in the tag cell — the one placeholder ⚑ | 4 | — |
| 12 | Next Up | `media frame · none · page · one · left · one post at the size of a decision` | Plate at 560 × 373; the design stays itself | 6 | — |

**The tuples did not move in this pass.** Tag: Primary tag does not change any design's five closed
slots — an eyebrow is a card part, not an archetype, a containment, a ground, an item-count or a media
placement — and Hand-picked does not change item-count, because **a picked set of two to four is still
`few`**. Recorded rather than resolved by editing the tuple.

### Tuple uniqueness — the honest statement

**All twelve are distinct on the five closed slots.** **Archetype carries the category** — grid-of-N
four, feed two, and one each of split, edge rail, stack, carousel, table and media frame — because
**containment never moves at all: twelve `none`, no card, no box, no pill** ⚑ (4 Panel's plane and
5 Contrast Band's band are their *grounds*, A26·3's call).

**Ground separates the three that share `grid-of-N · few · top`:** 1 on `page`, 4 on `surface`, 5 on
`contrast` — the same cards, three grounds, three designs, which is precisely what the ground slot exists
to say. ⚑ **And this is why only 5 locks Background role:** 4's plane survives every value by staying one
step from the page, while 5 *is* its ground. **Count does almost nothing here:** eleven `few` and one
`one` ⚑, with no `many`, no `none` and no `variable` — a related set is two to four posts by
construction and the Data group's ceiling is four. **Media does the remaining work:** four `top`, four
`none`, two `left`, one `background`.

**What the check cannot promise.** 2 Rows and 7 Rail differ only in whether the head is in the margin;
1 Three Up and 10 Carousel differ only in whether the row overflows. Both pairs are separated on
archetype, which is a real structural claim — but **the finer distinction between them rests on the
emphasis phrase, which no machine reads.**

### Repeating items — the whole category, in one place

**There is no field in A27 that is an array the user authors** ⚑. Checked against all twelve content
models, and still true after this pass: `postRefs` is an array of **references**, so P0·3's **Ghost-sourced
list** rules apply to it and its authored-list rules do not. **One thing repeats — the related posts — and
it is Ghost's answer to a query, or a picked list of Ghost's posts.**

- **How many, and which counts each design is built for.** Show is a number picker, 1–4 ⚑. Designed for three:
  1, 2, 3, 4, 5, 6, 7, 8, 9. Designed for four: 10, 11. Designed for one: 12.
- **No Add button anywhere** — rule 8's Ghost-sourced rule. At Hand-picked the footer control is
  **"＋ Pick a post…"**, which opens the picker and lands a real post; **Remove is never disabled** and
  **drag reorders**. At every other value there is no list at all.
- **Fewer than expected.** Cells keep their width at the left (1, 4, 5, 8, 10); rows and index rows simply
  stop (2, 3, 7, 9, 11); 6 draws its lead and omits the list column; 12 is unaffected.
- **Exactly one.** One cell / one row / one tile / one title, never stretched, centred or promoted. In 6
  the split collapses to the lead alone; in 10 there is no strip, no peek and no arrows.
- **Exactly zero.** When empty decides, category-wide: **no section at all (default)**, or latest posts
  under the fallback head.
- **Order.** ⚑ **Selectable in all twelve now — Newest · Oldest** — and **disabled at Hand-picked**, where
  the drag order is the order. 6's lead is the first post in the set; 11's numbers are drawn order, not a
  ranking, at both values.
- **Which fields of each post are shown** is per design, below; **what happens when an optional one is
  missing** is each design's Empty state, and every one of them is stated.
- **Design controls apply to every post at once** — a control writes one value onto the section — so
  **per-post styling is not expressible by construction**. "Make the first one bigger" is 6 Lead and List,
  which is a design rather than a setting.

### The shared field list — the contract that makes design-switching safe

| Field | Type | Optional | Limit | Read by |
|---|---|---|---|---|
| `headingText` | text | yes | 40 ch | All twelve · default "Keep reading" ⚑ · **"Next up" in 12** ⚑ · the rail's label in 7 · **inline (P0·1)** |
| `fallbackHeading` | text | yes | 40 ch | All twelve, drawn only when the set is empty at Show latest ⚑ · default "Latest from Orbit Weekly" · **inline** |
| `archiveLinkLabel` | text | yes | 24 ch | 1–7 at Heading Heading, and 7's rail at Label and link · default "Browse the archive" ⚑ · kept and not drawn by 8–12 · **inline** |
| `archiveLinkUrl` | link | yes | a Ghost route or URL | **New** ⚑ · the **Link Picker**, pre-filled with the archive the query points at · same designs as the label |
| `tagEyebrow` | enum | no | Off · Primary tag | **New** ⚑ · 1, 4, 5, 10, 12 and 6's lead · default Off |
| `relatedBy` | enum | no | seven values, above | All twelve · default Same tag |
| `relatedTag` · `relatedAuthor` | ref | yes | — | **New** ⚑ · read at By tag / By author |
| `postRefs` | ref[] | yes | 1–4 | **New** ⚑ · read at Hand-picked |
| `count` | int | no | 1–4 · a number picker ⚑ | All twelve · default 3 · **4 in 10 and 11** ⚑ · **locked at 1 in 12, drawn greyed with its reason** ⚑ |
| `order` | enum | no | Newest · Oldest | **New** ⚑ · all twelve · default Newest |
| `whenEmpty` | enum | no | Hide the section · Show latest posts | All twelve · **default Hide the section** ⚑, flipped |
| `readingTimeSuffix` | text | no | "min read" | **A24's site-level string** ⚑, read not re-declared · every design that draws reading time; **not read by 8** |

Per post — read from Ghost, never authored, never inline-editable:

| Field | Type | Optional | Read by |
|---|---|---|---|
| `title` · `url` | string | no | All twelve; the title is the link's accessible name in all twelve |
| `feature_image` · `feature_image_alt` | image | yes | 1, 3, 4, 5, 6 (lead), 8, 10, 12 · missing → A17's plate · **not read by 2, 7, 9, 11** |
| `primary_tag.name` | string | yes | The plate in 1, 3, 4, 5, 6, 8, 10, 12 · a column in 11 · **and the card eyebrow at Tag: Primary tag** in 1, 4, 5, 10, 12, 6's lead ⚑ |
| `custom_excerpt` | text | yes | 1, 2, 3, 4, 5, 6 (lead), 7, 10, 12 · **Ghost's generated excerpt is refused** ⚑ (A17's rule) · kept and not drawn by 8, 9, 11 |
| `published_at` | date | no | All twelve · written in full, **never abbreviated and never relative** ⚑ · `<time datetime>` |
| `primary_author.name` · `profile_image` | ref | yes | Meta in 1–7, 9, 10, 12 · missing photograph → A1's one-letter initials circle · not read by 8, 11 |
| `reading_time` | int | no | A Meta value in 1–7, 9, 10, 12 · a column in 11 · never drawn in 8 ⚑ · suffixed by A24's string |

**Four authored strings, one link, six enums and three references is the entire authored surface of A27**
⚑ — up from three strings and three enums, and every addition is a control the user asked for by editing
their own site. Every design draws a subset of this list and not one needs a field the list does not have,
which is what makes switching designs safe with the content preserved. **9 Big Type reads the fewest**
(title, url, date, author, reading time); **1, 6 and 12 read all of it.**

---

## 1 · Three Up

**Descriptor.** Three related posts as three equal cards under a labelled hairline, on the content width.
**A17's post card at 416, unchanged.** The category's default and the one the other eleven depart from.

**Structural descriptor.** `grid-of-N · none · page · few · top · three equal cards under one hairline`
— containment `none` because the cards are the item's geometry, not the section's.

**Archetype.** grid-of-N. **One departure: Show 4 collapses to two across at 834** ⚑ rather than
three-plus-one.

**Responsive rule.** **1440** three 416 cells, 24 gutter, 48 row gap, image 3:2 at 277, title 22, excerpt
two lines, meta with a 24 px avatar. **834** three 235 cells, title 17, excerpt one line, spacing 80.
**≤ 767** one column at 350, row gap 40, title 19, excerpt one line, **meta drops the author and keeps the
date** ⚑, spacing 64. Ratio and image box hold at every width. At Tag: Primary tag the eyebrow adds 21 px
above the title at every width and nothing else moves.

**Content fields.** `headingText` · `fallbackHeading` · `archiveLinkLabel` + `archiveLinkUrl` (drawn at
Heading Heading only). Per post: `title` · `url` · `feature_image` + `feature_image_alt` ·
`primary_tag.name` (the plate, and the eyebrow at Tag: Primary tag) · `custom_excerpt` · `published_at` ·
`primary_author.name` + `profile_image` · `reading_time`.

**Controls.** Heading (Label · Heading · None) · Ratio (Landscape 3:2 · Wide 16:9 · Square 1:1) · Excerpt
(Off · One line · Two lines) · Meta (Author and date · Date only · Date and reading time · Off) · **Tag
(Off · Primary tag)**. Then the universal trio and the Data group. **Quick: Heading, Ratio, Excerpt, Meta.**

**Data.** The Data group's query. **0** → When empty. **1** → one 416 cell at the left; nothing stretches,
centres or promotes. **Many** → the first N in the chosen order; the rest are not drawn and are not counted
anywhere.

**Empty state.** No `custom_excerpt` → that card ends at its meta and its neighbours keep theirs ⚑. No
feature image → A17's tag plate (hover surface, same box and radius, primary tag centred at eyebrow size,
`aria-hidden`); no tag either → a plain plate. **At Tag: Primary tag a post with no tag draws no eyebrow
and its title sits where the others' eyebrows are** ⚑ — the row of titles stops aligning, which is the
honest cost of the value and is drawn. No author photograph → A1's one-letter initials circle. No excerpt on any post
→ titles and meta, 120 px shorter.

**Behaviour module.** **none.** **No-JS: pixel-identical** — hover and focus are CSS over server-rendered
markup; `core` is assumed by the theme rather than declared by the design.

**Accessibility.** `<section aria-labelledby>` named by the head (h2; `aria-label="Related posts"` at
Heading None ⚑). Cards a `<ul>` of `<li>`; each title an h3 inside the card's single `<a>`. **The eyebrow
is inside the link and before the title**, so the accessible name reads "Reporting — The night shift at the
Port of Algeciras" ⚑; it is text, never a link, because A20 owns tag destinations. Tab order is the set's
order. Image carries `feature_image_alt` or `alt=""`. Focus is A6's ring on the card box, inner gap the
page ground.

**Reconciled.** Padding retired into **Vertical spacing** and **Divider (On · Off)** into **Top divider
(None · Line · Fade)**, both outside the list — Line is what On drew, Fade is new, and Line stays the
default because the hairline above the head is the seam this design is built on. **Tag: Off · Primary tag**
returns A17's eyebrow as a value. `relatedBy` widens to seven sources, **Order** arrives, **When empty
flips to Hide the section**, and the archive link gets the Link Picker it never had. **Five controls of its
own.**

**Patched (design patch pass, 30 August 2026).** **Show became a number picker, 1–4, default 3** — *item counts are a number picker* — with 4 greyed and the divisions as its reason. The author circle shows **one letter** — *avatars with no photograph*. Nothing else changed: the eyebrow's reason, the refusal of Portrait 4:5 and the plate were already written down, and this design never named another design.

**Flagged ⚑.** The 48 px row gap from A17 · the hairline above the head, now Top divider Line · "Keep
reading" as the default head · **the eyebrow returning as a value and Off as its default** · **the eyebrow
breaking title alignment on a post with no tag** · Show 4 collapsing to two across at 834 · the mobile
meta dropping the author · refusing Portrait 4:5 at three across · the excerpt stepping to one line at 306
and at 834.

---

## 2 · Rows

**Descriptor.** Related posts as titled rows on the article's measure, separated by hairlines, **with no
pictures anywhere**. The design for an archive that is not illustrated.

**Structural descriptor.** `feed · none · page · few · none · hairline rows on the measure` — separated
from 3 Thumb Rows by media placement alone, which is the honest difference.

**Archetype.** feed. **No departures** — a stack of rows is already what the ladder collapses everything
else into.

**Responsive rule.** **1440** rows at 720 (or 1,296 at Width Content), title 22, excerpt one clamped line,
meta with a 24 px avatar, hairline between rows at 24 px either side, label above the first rule. **834**
rows at 754, everything held, spacing 80. **≤ 767** rows at 350, title 19, **excerpt off and meta reduced
to the date** ⚑, hairline inset 20, spacing 64.

**Content fields.** `headingText` · `fallbackHeading` · `archiveLinkLabel` + `archiveLinkUrl`. Per post:
`title` · `url` · `custom_excerpt` · `published_at` · `primary_author.name` + `profile_image` ·
`reading_time`. **It reads no image field at all** — the one design in A27 that does not.

**Controls.** Heading · Width (On the measure · Content width) · Rule (Hairlines · None) · Excerpt (Off ·
One line · Two lines) · Meta. Then the universal trio and the Data group. **No Tag row** ⚑ — this design
draws no card eyebrow and no picture, which is its reason to exist. **Quick: Heading, Width, Excerpt, Meta.**

**Data.** As the category. **0** → When empty. **1** → one row and its rule; no reserved space below it.
**Many** → the first N. **Show 4 costs one row, 88 px** — the cheapest Four in the category.

**Empty state.** No excerpt on a post → that row ends at its meta; none on any post → three
title-and-meta rows, which is the design at Excerpt Off. No author photograph → A1's one-letter initials circle.
**A missing feature image is invisible here**, which is the design's reason to exist.

**Behaviour module.** **none.** **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>` (h2, or `aria-label` at None). A `<ul>` of rows, each title
an h3 inside the row's single link; the whole row is the target and **the hairline is a border on the
`<li>`, not an `<hr>`** ⚑. Dates `<time datetime>`. Focus is A6's ring on the row box.

**Reconciled.** Padding retired into **Vertical spacing**; **Rule stays**, because a hairline between rows
is not the seam above a section, and **Top divider is the seam** — both can be on at once. `relatedBy`
widens to seven sources, **Order** arrives, **When empty flips**, and the archive link gets its Link Picker.
**Five controls of its own.**

**Patched.** **Show became a number picker, 1–4, default 3** — 4 costs one row, 88 px, and is the greyed ceiling because a longer list of posts is A18's page. **The absent Ratio and Tag rows now carry their reason** — *a design may offer fewer choices, and must say why*: this design reads no image field and draws no eyebrow, which is its reason to exist. The author circle shows **one letter**.

**Flagged ⚑.** The 24 px rule inset · the label above the first rule · one line as the default excerpt ·
the excerpt going off at ≤ 767 · Width Content existing for A25·2 Plain's sake · **Rule and Top divider
coexisting as two separate rows** · refusing a tag column, a tag eyebrow and a row number.

---

## 3 · Thumb Rows

**Descriptor.** A17's card turned on its side: a 96 or 128 px picture at the left of each row, the title
beside it, the meta at the right edge, on the content width. **The one picture design whose shape survives
a phone.**

**Structural descriptor.** `feed · none · page · few · left · a small picture beside every row`

**Archetype.** feed. **No departures** — the row is already the collapsed form.

**Responsive rule.** **1440** rows at 1,296; thumbnail 128 × 85 (or 96 × 64), gap 24, title 22, excerpt one
clamped line at 720, date at the right edge, hairline between rows at 22 px either side. **834** rows at
754, everything held, spacing 80. **≤ 767** rows at 350, **thumbnail forced to 96** ⚑, gap 16, title 19,
**excerpt off**, **date moves under the title** ⚑, spacing 64.

**Content fields.** `headingText` · `fallbackHeading` · `archiveLinkLabel` + `archiveLinkUrl`. Per post:
`title` · `url` · `feature_image` + `feature_image_alt` · `primary_tag.name` (plate only) ·
`custom_excerpt` · `published_at` · `primary_author.name` · `reading_time`.

**Controls.** Heading · Thumbnail (Small 96 · Medium 128) · Ratio (Landscape 3:2 · Square 1:1 — **Wide 16:9 and Portrait 4:5 refused, with their reasons now on the panel** ⚑: a 72 px crop beside two lines of type reads as a strip, a 160 px crop sets the row's height instead of the words) · Meta (Date
· Date and reading time · Author and date · Off) · Rule (Hairlines · None). Then the universal trio and the
Data group. **No Excerpt control** ⚑: on at one line above 767, off below. **No Tag row** ⚑ — the tag is
already drawn here, as the plate's one word when a picture is missing, and a second place for it would
print it twice in the same row. **Quick: Heading, Thumbnail, Ratio, Meta.**

**Data.** As the category. **0** → When empty. **1** → one row, no reserved height, no second hairline.
**Many** → the first N. Four rows is 532 px, the count this design is built for.

**Empty state.** No feature image → A17's tag plate at the thumbnail's box, tag centred at 13,
`aria-hidden`; no tag either → a plain plate. **No image on any post in the set → every row draws its plate and this design stays itself** ⚑ — the thumbnail column holds its 128 (or 96) at the set ratio, each plate carrying that post's primary tag, or nothing where a post has none. **The panel advises and never switches**: "no post in this set has a picture — 2 Rows reads better here". No excerpt → the row is
title and date.

**Behaviour module.** **none.** **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>` (h2 / `aria-label`). A `<ul>` of rows; **the picture is
inside the row's single link**, so there is one tab stop per post. Title h3. Dates `<time datetime>`, full
at every width — **never abbreviated** ⚑. Focus is A6's ring round the row box including the picture.

**Reconciled.** Padding retired into **Vertical spacing**; Rule stays, for design 2's reason. **No Tag
row**, and the reason is now written down rather than inherited. `relatedBy` widens to seven sources,
**Order** arrives, **When empty flips**, the archive link gets its Link Picker. **Five controls of its own.**

**Patched.** **The hand-off is deleted** — *no design ever turns into another design*: where no post in the set has a picture, **every row draws its plate** and the panel advises "2 Rows reads better here". **Three narrowings gained reasons** — Wide 16:9, Portrait 4:5 and the 96 px floor — and **the absent Excerpt row gained one**. **Show became a number picker, 1–4, default 3.** The author circle shows **one letter**.

**Flagged ⚑.** The 22 px rule inset · the date at the right edge · the excerpt with no control · refusing a
64 px thumbnail and Wide 16:9 · **refusing the Tag row the other picture designs gained** · the forced 96 at
≤ 767 · the date moving under the title on a phone · the column of plates when no post in the set has a picture, advised rather than switched.

---

## 4 · Panel

**Descriptor.** The three-card set lifted onto one `surface` panel at the pack radius, head inside, page
ground visible on all four sides. **A plane instead of a hairline.**

**Structural descriptor.** `grid-of-N · none · surface · few · top · the set on a raised panel` —
containment `none` and ground `surface`, **A26·3 Card's precedent taken verbatim**: the plane is the
section's ground rather than a box round the section.

**Archetype.** grid-of-N. **One departure: Show 4 collapses to two across at 834** ⚑, as 1.

**Responsive rule.** **1440** panel 1,296, inset 40, three 392 cells on a 24 gutter, 44 row gap, title 22,
head inside at 28. **834** panel 754, inset 32, three 222 cells, title 17, spacing 80. **≤ 767** panel 350,
inset 20, one column at 310, title 19, excerpt one line, meta date only, spacing 64. **The panel never goes
full bleed** ⚑.

**Content fields.** `headingText` · `fallbackHeading` · `archiveLinkLabel` + `archiveLinkUrl`. Per post:
as 1, unchanged, including the eyebrow at Tag: Primary tag.

**Controls.** Heading · Panel (Filled · Outlined) · Ratio · Excerpt · Meta · **Tag (Off · Primary tag)**.
Then the universal trio and the Data group. **The 40 px inset is fixed and has no control** ⚑ — unlike
A17·17 Panel's Inset ladder, and that difference is recorded rather than resolved. **Quick: Heading, Panel,
Ratio, Meta.**

**Data.** As the category. **0** → When empty; on Hide **the panel goes with the section** — there is no
empty plane ⚑. **1** → one 392 cell at the left of a full-width panel. **Many** → the first N.

**Empty state.** No image → the plate, **taking the page ground inside a Filled panel and the hover surface
inside an Outlined one** ⚑ — always one step from what it sits on. No excerpt → the card ends at its meta.
No head text → the panel opens with the cards. At Tag: Primary tag the eyebrow sits in `text-muted` against
the plane, not against the page.

**Behaviour module.** **none.** **No-JS: pixel-identical.** The plane, the `sm` shadow and the dark-mode
hairline are token substitutions in CSS.

**Accessibility.** `<section aria-labelledby>` — **the panel is the section, not a `<div>` inside it** ⚑,
so no extra landmark is announced. Head h2, titles h3, cards a `<ul>` of `<li>`. Focus is A6's ring on the
card box, **its inner gap taking the panel's colour rather than the page's**.

**Reconciled.** Padding — "the space above and below the panel" — retired into **Vertical spacing**. **The
40 px inset stays fixed with no control**, and the difference from A17·17's Inset ladder is recorded rather
than settled uninstructed. **Background role is not locked** ⚑: the plane is one step from the page at every
value, and at Contrast the panel lifts *off* the band rather than becoming 5 Contrast Band, whose cards sit
*on* it. **Tag** joins, `relatedBy` widens to seven sources, **Order** arrives, **When empty flips**. **Six
controls of its own.**

**Patched.** **Show became a number picker, 1–4, default 3.** **Portrait 4:5's absence now carries its reason** — three 392 portraits are 490 px tall each. The fixed 40 px inset is recorded again, unchanged. The author circle shows **one letter**. The Contrast sentence stays a denial: the panel lifts off the band rather than becoming 5 Contrast Band.

**Flagged ⚑.** The 392 cell and the fixed 40 px inset · the head always inside the panel · the plate
stepping to the page ground on a filled panel · `sm` and never `md` · the dark-mode hairline the light panel
does not have · **Background role deliberately unlocked, with its reason drawn** · refusing a full-bleed
panel on a phone.

---

## 5 · Contrast Band

**Descriptor.** The three-card set on the inverted band, edge to edge, with the head and every foreground
in the carried colour. **The only A27 design that changes the colour of the page.**

**Structural descriptor.** `grid-of-N · none · contrast · few · top · inverted closing band`

**Archetype.** grid-of-N. **One departure: the band ignores the page margin** ⚑ and draws its own, so the
section is 1440 wide where every other design is 1,296.

**Responsive rule.** **1440** band full width, Vertical spacing 96 inside it, 72 horizontal, content 1,296,
three 416 cells, head 28. **834** 80/40, content 754, three 235 cells. **≤ 767** 64/20, content 350, one
column, meta date only. **At Band Inset** the band is the content width at the pack radius with one spacing
step less, inset 48 above 767 and 24 below.

**Content fields.** `headingText` · `fallbackHeading` · `archiveLinkLabel` + `archiveLinkUrl`. Per post:
as 1.

**Controls.** Heading · Band (Full bleed · Inset) · Ratio · Excerpt (**disabled at Show 4, with its
reason shown** ⚑) · Meta · **Tag (Off · Primary tag)**. Then the universal trio — **Background role locked
at Contrast and Top divider locked at None**, both with the reason shown — and the Data group. **Quick:
Heading, Band, Ratio, Meta.**

**Data.** As the category. **0** → When empty; on Hide **the band goes with it** — an empty inverted band is
the loudest possible nothing ⚑. **1** → one 416 cell at the left; the band keeps its height. **Many** → the
first N.

**Empty state.** No image → the plate as **a 7% lift of the band** ⚑, its tag in the carried muted colour.
No author photograph → A1's one-letter initials circle at a 16% lift ⚑. No excerpt → the card ends at its meta. At
Tag: Primary tag the eyebrow takes **the carried muted colour at 72%**, never the accent.

**Behaviour module.** **none.** The inversion is a token substitution. **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>`, head h2 on the band, titles h3. **Focus and hover both take
the carried colour rather than the accent** ⚑ (A6's rule; Paper's accent on Paper's band is 3.1:1), and the
ring's inner gap is the band's own colour. Contrast is measured against the band, never against the page.

**Reconciled.** Padding — "the band's own" — retired into **Vertical spacing**, which resolves *inside* the
band because the band **is** the section. ⚑ **Rule 3's "band-internal padding" exemption was considered and
declined**, and that is recorded rather than decided quietly. **Background role is locked at Contrast and
Top divider at None**, both with the reason drawn: every other ground turns this design into 1 Three Up with
more padding, and a divider above an inverted band draws a boundary the band already draws by existing.
**Tag** joins in the carried muted colour. `relatedBy` widens to seven sources, **Order** arrives, **When
empty flips**. **Six controls of its own.**

**Patched.** **Show became a number picker, 1–4, default 3**, and **Excerpt is still disabled at 4** with its reason shown. **Portrait 4:5's absence now carries its reason** — three 416 portraits are 520 px tall each. The author circle shows **one letter**, at the 16% lift. Both locks and the declined padding exemption are unchanged.

**Flagged ⚑.** The 72% muted line · the 7% plate lift and 16% avatar lift · Inset dropping one spacing step ·
Excerpt disabled at Show 4 · the carried-colour underline, ring and eyebrow · the band drawing its own
page margin · **the two locks and the declined padding exemption** · refusing an accent band.

---

## 6 · Lead and List

**Descriptor.** One related post as a 636 card with its picture and excerpt, the rest as titled rows in a
588 column beside it, 72 px apart. **The lead is the first in the set, not a choice.**

**Structural descriptor.** `split · none · page · few · left · one lead against a short list` — media
`left` describes the lead's picture at the default value; Lead Right mirrors the columns visually and does
not change the tuple.

**Archetype.** split. **One departure: it collapses at 834 rather than 767** ⚑.

**Responsive rule.** **1440** lead 636 with a 424 image and a 26 px title; list 588, rows at 20 with a
hairline between them and no avatars; gutter 72; head above a full-width hairline. **834** **stacked**: lead
754 above, list 754 below, 36 px apart, **a hairline above the first row** ⚑, spacing 80. **≤ 767** the same
stack at 350, lead title 22, lead excerpt one line, meta date only, spacing 64.

**Content fields.** `headingText` · `fallbackHeading` · `archiveLinkLabel` + `archiveLinkUrl`. Per post:
`title` · `url` · `feature_image` + `feature_image_alt` (lead only) · `primary_tag.name` (the lead's plate,
and the lead's eyebrow at Lead tag: Primary tag) · `custom_excerpt` (lead only) · `published_at` ·
`primary_author.name` + `profile_image` (lead only) · `reading_time`.

**Controls.** Heading · Lead (Left · Right) · Lead excerpt (Off · One line · Two lines) · Meta · **Lead tag
(Off · Primary tag)**. Then the universal trio and the Data group. **Still no Ratio** ⚑. **Quick: Heading,
Lead, Lead excerpt, Meta.**

**Data.** As the category, and **the set's order decides the lead** ⚑ — so **Order Newest · Oldest now
changes which post leads**, which is the sharpest thing this pass did to any design. **0** → When empty.
**1** → **the list column is not drawn and the lead keeps 636**; the split collapses rather than the card
stretching ⚑. **2** → lead and one row, the column at its full 588. **Many** → the first N.

**Empty state.** Lead with no picture → A17's plate at 636 × 424, tag centred ⚑. Lead with no excerpt → it
ends at its meta and the rows are unaffected. No author photograph → A1's one-letter initials circle (lead only; rows
draw no avatar). **No post in the set with a picture → the lead is a plate, not a hand-off** — the list
carries the section ⚑. **The rows are unaffected at both Lead tag values.**

**Behaviour module.** **none.** **No-JS: pixel-identical.** Lead Right is `flex-direction: row-reverse`,
which does not touch DOM order.

**Accessibility.** `<section aria-labelledby>`, head h2. **One `<ul>` for the whole set** — the lead is its
first `<li>` ⚑ — so a screen reader hears four related posts, not one post and a list of three. Titles h3.
**Reading order matches visual order at Lead Left and deliberately does not at Lead Right**, stated in the
editor ⚑. Focus is A6's ring on the card box and the row box.

**Reconciled.** Padding retired into **Vertical spacing**. **Lead tag: Off · Primary tag** returns the
eyebrow **on the lead only**, because the rows carry no eyebrow at any value — they carry no picture and no
excerpt either, which is what makes them rows rather than small cards. `relatedBy` widens to seven sources
and **Order** arrives, which here **chooses the lead**; **When empty flips**; the archive link gets its Link
Picker. **Five controls of its own.**

**Patched.** **Show became a number picker, 1–4, default 3**, counting the whole set with the lead included. **The absent Ratio row and the absent row excerpt now carry their reasons.** The lead's plate stays **a plate and not a hand-off**. The lead's author circle shows **one letter**.

**Flagged ⚑.** The 72 px gutter · the 20 px row title and the rows' missing avatars · the lead being the
set's first post · **Order deciding the lead** · **the eyebrow on the lead only** · refusing Ratio and a row
excerpt · the 834 collapse · the hairline above the first row when stacked · Lead Right's reading order ·
one `<ul>` for lead and rows together.

---

## 7 · Rail

**Descriptor.** The head in a 240 px margin column and the posts as rows in the 1,008 px body beside it.
**A25's rail division, applied to the end of a post.**

**Structural descriptor.** `edge rail · none · page · few · none · the head in the margin`

**Archetype.** edge rail. **Its ladder is inherited whole: the margin leaves at 1,200** ⚑, not at 834 and
not at 767 — so the rail exists at neither drawn responsive width.

**Responsive rule.** **1440** rail 240, gutter 48, body 1,008; rows at 22 with a one-line excerpt clamped
at 700, hairline between rows at 22 px either side. **< 1,200** **no rail**: label and link above the body,
a hairline under them, rows at the content width. **834** that stack at 754, spacing 80. **≤ 767** at 350,
title 19, excerpt off, meta date only, spacing 64. It is a **collapse, not a hand-off** — the design keeps
its name and its controls, and Rail Left / Rail Right stop applying ⚑.

**Content fields.** `headingText` (the rail's label) · `fallbackHeading` · `archiveLinkLabel` (default
"Browse the archive") + `archiveLinkUrl`. Per post: `title` · `url` · `custom_excerpt` · `published_at` ·
`primary_author.name` · `reading_time`. **No image field** — as 2 Rows.

**Controls.** Rail (Left · Right) · Rail contents (Label · Label and link · Label and count — **the count is the topic's total** ⚑, ruled 30 August 2026) · Excerpt ·
Meta. Then the universal trio and the Data group. **No Heading control** ⚑ — the rail is the head, so the
head string is edited on canvas and named in the Content group instead. **Quick: Rail, Rail contents,
Excerpt, Meta.** **Four controls of its own — the joint minimum in A27.**

**Data.** As the category. **0** → When empty; on Hide the rail goes with the body ⚑. **1** → one row beside
the rail; the columns hold and nothing re-centres. **Many** → the first N. **The count value is the topic's total, not the posts drawn** ⚑ — *corrected in the design patch pass, and* **ruled by the owner on 30 August 2026**: a Ghost template cannot count what it drew, so the number is the total Ghost's query matched — "Keep reading · 12 posts · Browse the archive" — and **the panel says what it counts**, because the total does not match the rows below it. It comes from the get helper's own `pagination.total` and nothing computes it here.

**Empty state.** No excerpt on a post → that row ends at its meta. No archive link label → the rail is the
label alone. **A missing feature image is invisible here.**

**Behaviour module.** **none** ⚑ — and the rail is **not sticky**, so `scroll-spy` is not declared. **No-JS:
pixel-identical.**

**Accessibility.** `<section aria-labelledby>` named by the rail's label, which **is the h2** ⚑ — a heading
in the margin, not a caption. Rows a `<ul>`, titles h3. **Tab order is rail then body at both Rail values**,
so the archive link is reached before the posts ⚑. Focus is A6's ring on the row box and on the link.

**Reconciled.** Padding retired into **Vertical spacing**. **Rail contents: Label and link** now opens the
**Link Picker** for the archive link that value draws — the row appears only at that value, and the label
was previously a string with nowhere to go. `relatedBy` widens to seven sources, **Order** arrives, **When
empty flips**. **No Heading control still**, and the reason is now in the Content group where the head string
lives. **Four controls of its own.**

**Patched.** **Rail contents: Label and count draws the topic's total** — *Ghost's templates cannot count, add, or
remember*, **ruled by the owner on 30 August 2026**: a template cannot count what it drew, so the claim
that the count counts the posts drawn is withdrawn and the number is the total the query matched, with
the panel saying so. **Show became a number picker, 1–4, default 3.** **The absent Heading and Rule rows now carry their reasons.** The collapse below 1,200 stays **a collapse and not a hand-off**. The author circle shows **one letter**.

**Flagged ⚑.** A25's 240 · 48 · 1,008 division · the rail holding 240 at every value · refusing sticky ·
refusing a Rule control · no Heading control · the excerpt clamped at 700 inside a 1,008 row · **the count being the topic's total rather than the rows drawn, because a template cannot count what it drew** · **the Link Picker row appearing only at Label and link** · tab order putting the
archive link first.

---

## 8 · Overlay

**Descriptor.** The title and its date over the picture, on 4:5 tiles with a warm scrim from the foot.
**The picture-forward design, and the one with a precondition.**

**Structural descriptor.** `grid-of-N · none · page · few · background · titles over their pictures` — the
only `background` in A27; separated from 1 by media placement alone.

**Archetype.** grid-of-N. **One departure:** the scrim steps at ≤ 767 ⚑. **The hand-off to 9 Big Type is deleted in the design patch pass** — where no post has a picture every tile is a plate and the design stays itself.

**Responsive rule.** **1440** three 416 × 520 tiles (4:5), 24 gutter, title 22 white, meta 13, scrim 68% →
6% at 62% of the height, 24 px padding inside the tile. **834** three 235 × 294, title 17, padding 18
inside, spacing 80. **≤ 767** one 350 × 437 tile per row, 24 row gap, title 19, **scrim 80% at every value**
⚑, spacing 64.

**Content fields.** `headingText` · `fallbackHeading`. Per post: `title` · `url` · `feature_image` +
`feature_image_alt` · `primary_tag.name` · `published_at` · `primary_author.name`. **`custom_excerpt` and
`reading_time` are kept and never drawn** ⚑ — so **A24's `readingTimeSuffix` is not read here** either, and
the panel says so rather than offering a row that does nothing.

**Controls.** Heading · Ratio (Portrait 4:5 · Landscape 3:2 · Square 1:1) · Scrim (Light · Medium) · Meta
(Date · Author and date · Off). Then the universal trio and the Data group. **No Excerpt control** ⚑ — **the reason is now on the panel**: a second block of white type under the title competes with it for one scrim's worth of contrast. **No Tag row** ⚑ — the tag is already the plate tile's one word, and a tag over a photograph is a third thing
competing with the title for a scrim's worth of contrast. **Quick: Heading, Ratio, Scrim, Meta.**

**Data.** As the category. **0** → When empty. **1** → one tile at the left at its full 416 × 520. **Many**
→ the first N. **A set with no pictures at all draws twelve — or three — plates and the design stays itself** ⚑; the panel advises 9 Big Type and the site decides.

**Empty state.** One post without a picture → **a plate tile: hover surface, title in `text`, meta in
`text-muted`, no scrim and no white type** ⚑; no tag either → a plain plate. **No picture on any post → every tile draws its plate and this design stays itself** ⚑ — the 4:5 box and the gutters hold, the type goes dark, no scrim is drawn, and the tag is the plate's one word. **The panel advises and never switches**: "no post in this set has a picture — 9 Big Type reads better here". No author photograph is never visible: this design
draws no avatar.

**Behaviour module.** **none.** The scrim is a CSS gradient over a server-rendered image. **No-JS:
pixel-identical.**

**Accessibility.** `<section aria-labelledby>`, head h2, tiles a `<ul>` of `<li>`, titles h3 inside one `<a>`
per tile. **The picture is a CSS background, not an `<img>`** ⚑ — it carries nothing the title does not — so
`feature_image_alt` is read and unused, and the editor says so. **A scrim cannot guarantee contrast over an
unknown photograph** ⚑; Medium and the phone's step are mitigations, not promises. Focus is A6's ring outside
the tile.

**Reconciled.** Padding retired into **Vertical spacing**, and on the way this design **gains the row it
never had as a control of its own**. ⚑ **Background role is not locked here, unlike A17·8 Overlay:** the
*pictures* are the tiles' grounds, and this section's ground is the page it sits on — it shows in the 24 px
gutters and behind a plate tile, so all three values do something visible. **No Tag row**, with its reason
written down. `relatedBy` widens to seven sources, **Order** arrives, **When empty flips**. **Four controls
of its own.**

**Patched.** **The hand-off is deleted** — *no design ever turns into another design*: where no post has a picture **every tile draws its plate**, the box and gutters holding, and the panel advises "9 Big Type reads better here". **The absent Excerpt row now carries its reason.** **Show became a number picker, 1–4, default 3.** No avatar is drawn here at any value, so the one-letter rule applies nowhere.

**Flagged ⚑.** Portrait 4:5 as the default · the 68% → 6% gradient and Medium's 80% · refusing Wide 16:9 ·
refusing an excerpt, reading time and a tag eyebrow · **Background role unlocked where A17 locked it** · the
plate tile with dark type · the phone's forced 80% scrim · the dark re-tune · the all-plate state when no post has a picture, advised rather than switched.

---

## 9 · Big Type

**Descriptor.** Three or four related titles at 44 or 56 px, one under another, hairlines between, a byline
under each. **No pictures, no excerpts — the design 8 Overlay hands off to.**

**Structural descriptor.** `stack · none · page · few · none · titles at display size`

**Archetype.** stack. **No departures** — it is drawn in its collapsed form at every width.

**Responsive rule.** **1440** titles 44 (or 56), line height 1.08, tracking −0.025em, measure 1,180 (1,000
at Centre), hairline 28 px either side, byline 14. **834** titles 34 (or 42), measure 754, spacing 80.
**≤ 767** **titles 30 at both values** ⚑, measure 350, hairline 22 px either side, byline held at 14,
spacing 64.

**Content fields.** `headingText` · `fallbackHeading`. Per post: `title` · `url` · `published_at` ·
`primary_author.name` · `reading_time`. **`feature_image`, `custom_excerpt` and `primary_tag` are kept and
never drawn** ⚑ — this design reads the fewest fields in A27.

**Controls.** Heading · Title size (Large 44 · Display 56) · Alignment (Left · Centre) · Meta. Then the
universal trio and the Data group. **No Rule control** ⚑. **No Tag row** ⚑ — this design reads no tag at any value, which is exactly what makes it the design to place when an archive is not illustrated. **No Rule control** now carries its reason ⚑: the hairline between 44 px titles is what stops two of them reading as one paragraph, so it is structure here rather than decoration. **Quick: Heading, Title size,
Alignment, Meta.**

**Data.** As the category. **0** → When empty. **1** → one title and its byline, no hairline at all ⚑.
**Many** → the first N. **Nothing arrives here by substitution** ⚑ — 8 Overlay draws its own plate tiles and stays itself. This is the design a site *places* when its archive is not illustrated, which is a choice made in the panel.

**Empty state.** No byline fields → the title stands alone, which is Meta Off. **A missing picture, excerpt
or tag is invisible here** — the design reads none of them, which is why it is the design to place when an archive is not illustrated.
**There is no state in which it draws an empty row.**

**Behaviour module.** **none.** **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>`, head h2 — **at 13 px above 44 px titles the head is visually
smaller than the h3s beneath it**, a hierarchy the DOM does not share and which is stated ⚑. Titles h3 inside
one `<a>` per post, bylines outside the link. Focus is A6's ring round the title-and-byline block. Dates
`<time datetime>`.

**Reconciled.** Padding retired into **Vertical spacing**. **No Tag row.** `relatedBy` widens to seven sources and **Order** arrives — and **it lands hardest here**: four titles at 44 px in publication order is a
series index, which is a page this design could not previously draw. **When empty flips.** **Four controls of
its own.**

**Patched.** **The destination sentence is deleted** — *no design ever turns into another design*: nothing arrives here by substitution, and this is the design a site **places** when its archive is not illustrated. **The absent Rule row now carries its reason.** **Show became a number picker, 1–4, default 3.** The author circle shows **one letter**.

**Flagged ⚑.** The 1,180 and 1,000 measures · the 28 px hairline inset · the 14 px byline · the 6 px
underline offset · both title sizes converging on 30 at ≤ 767 · refusing a Rule control and a tag ·
**Order mattering more here than anywhere else** · allowing Display + Centre while noting it · the head being
visually smaller than the titles.

---

## 10 · Carousel

**Descriptor.** A snapping strip of cards that runs past the right edge, with two arrow buttons on the
head's line. **The only design in A27 that declares a behaviour module.**

**Structural descriptor.** `carousel · none · page · few · top · a strip that runs past the edge` — count
`few` and not `many` because the Data group's ceiling is four ⚑.

**Archetype.** carousel. **One departure: it does not collapse** ⚑ — the arrangement at 390 is the
arrangement at 1440 with less of it on screen.

**Responsive rule.** **1440** cards 360 × 240 on a 24 gutter, strip clipped by the viewport, arrows 38 px at
the head right, title 19, excerpt one line, meta date. **834** cards held at 360, arrows held, spacing 80.
**≤ 767** **cards 300, arrows hidden at both values** ⚑, spacing 64, snap unchanged — **a cut card and the
snap are the overflow signal, and that needs no control** ⚑.

**Content fields.** `headingText` · `fallbackHeading`. Per post: as 1, including the eyebrow at Tag: Primary
tag. **`archiveLinkLabel` is kept and not drawn** — the head's right belongs to the arrows ⚑.

**Controls.** Heading · Card size (Small 306 · Medium 360 · Large 416) · Ratio (Landscape 3:2 · Square 1:1) ·
Meta · Arrows (On · Off) · **Tag (Off · Primary tag)**. Then the universal trio and the Data group,
**shipping at Show 4 here** ⚑. **Quick: Card size, Ratio, Meta, Arrows.**

**Data.** As the category. **0** → When empty. **1** → one card at the left; no strip, no arrows, no snap ⚑.
**2–3** → no overflow on a desktop, so no arrows; the strip still snaps at 834 and below. **4** → the design
as drawn (1,512 of cards against a 1,296 content width, the fourth card cut by the page edge).

**Empty state.** No image → A17's tag plate at the card's box. No excerpt → the card ends at its meta.
**The strip never draws an empty slot to keep its overflow** ⚑.

**Behaviour module.** **`carousel`**, from the registry. **Edit-safe: no** — behaviours do not run while
editing, and **the resting state is slide 1 and the primary frame** ⚑. **The scrolled strip, the disabled
left arrow and the cut fourth card are designable states reached through P0·6's simulate entry**, never
through a sidebar control ⚑: a "Preview" row in a panel is the editor doing the editor's job badly. **No-JS
degradation, quoted:** "The slide track is a native horizontally-scrollable `scroll-snap` strip — **fully
usable**, only dots and arrow buttons are hidden." **This design draws no dots in either branch** ⚑.

**Accessibility.** `<section aria-labelledby>`, head h2, cards a `<ul>` of `<li>`, titles h3. **The strip is
a scroll container with `tabindex="0"` and a name**, so it can be scrolled from the keyboard ⚑; tabbing
through the cards scrolls them into view natively. Arrows are real `<button>`s with `aria-label`s, and the
disabled one is `aria-disabled` rather than removed. Focus is A6's ring on the card and on the buttons.

**Reconciled.** Padding retired into **Vertical spacing**; the card's own height stays with Card size and
Ratio, which is a different ladder and keeps its own names. **Tag** joins — and it earns its 21 px twice
over on a strip, because a card half off the right edge is read by its first two lines. **No new state
control**: the editor shows slide 1 at rest and the scrolled strip comes from **P0·6's simulate entry**; the
hidden arrows at ≤ 767 stay uncontrolled, since snap and a cut card already signal the overflow. `relatedBy`
widens to seven sources, **Order** arrives, **When empty flips**, and Show still ships at 4. **Six
controls of its own.**

**Patched.** **Show became a number picker, 1–4, shipping at 4** — the count this design is built for. **The Ratio refusals now carry their reason** — 16:9 at 360 is a 203 px banner, 4:5 is 450 px tall and lifts the arrows off the head's line. The hidden arrows at ≤ 767 stay uncontrolled, and the registry's no-JavaScript line is unchanged. The author circle shows **one letter**.

**Flagged ⚑.** Shipping the Data group at Four · the 1,512 strip against a 1,296 content width · card-start
snapping · the disabled left arrow being drawn · 300 px cards and no arrows at ≤ 767 · **the scrolled state
living in P0·6 rather than in a control** · refusing dots and autoplay · the strip clipped by the viewport
rather than a box.

---

## 11 · Index

**Descriptor.** Related posts as a numbered, ruled index: number, title, tag, date and optionally reading
time, in fixed columns. **The densest design in A27 — four posts in 240 px.**

**Structural descriptor.** `table · none · page · few · none · dated rows in fixed columns` — separated from
2 Rows by archetype: rows there are a title and a meta line that wrap as prose; here every value is in a
column that aligns down the page.

**Archetype.** table. **One departure: it stacks at 767 rather than scrolling horizontally** ⚑.

**Responsive rule.** **1440** grid 44 / 1fr / 180 / 160 (/ 96 at Columns All) on a 24 gap, rows 52 px, title
20, meta 13, tabular numerals, hairline between rows. **834** the same grid at 754, tag 140, date 150,
spacing 80. **≤ 767** **stacked**: number and tag above the title, date and reading time below it, hairline held, title 19, spacing 64 — **by grid placement, so the source order is unchanged and a screen reader hears the same row at every width** ⚑. **No column is dropped at any width** ⚑.

**Content fields.** `headingText` · `fallbackHeading`. Per post: `title` · `url` · `primary_tag.name` ·
`published_at` · `reading_time`. **`feature_image`, `custom_excerpt` and the author fields are kept and
never drawn** ⚑.

**Controls.** Heading · Columns (Date · Date and tag · Date, tag and reading time) · Numbering (Numbers ·
None) · Rule (Hairlines · None). Then the universal trio and the Data group, **shipping at Show 4 here**
⚑. **No Tag row** ⚑ — the tag is already a *column* here, governed by Columns, and an eyebrow above a title
inside a ruled grid would print it twice in the same row. **Quick: Columns, Numbering, Rule, Heading.**

**Data.** As the category. **0** → When empty. **1** → one row, numbered 01, no hairline. **2** → two rows;
**the columns keep their widths and do not redistribute** ⚑. **Many** → the first N, numbered in drawn order.

**Empty state.** No tag on a post → **an em dash in the tag cell** ⚑, **the category's only placeholder**,
drawn because a blank cell in a ruled grid reads as a rendering fault. No reading time → the cell is blank
(Ghost always supplies one, so this is theoretical, and flagged) ⚑. **A missing picture or excerpt is
invisible here.**

**Behaviour module.** **none.** **No-JS: pixel-identical.** No sorting, no filtering, nothing measured — and
**Order is a query value, not a sortable column head** ⚑.

**Accessibility.** `<section aria-labelledby>`, head h2. **It is a `<ul>` of rows, not a `<table>`** ⚑ — the
columns present one post each rather than a data relationship, and a four-row table with no header row
announces a structure that is not there. Titles h3 inside the row's single link, which spans every column.
Dates `<time datetime>`, written in full. The number is `aria-hidden` ⚑ **and is a CSS counter at `decimal-leading-zero`, never a computed index** ⚑ — nothing adds it, so the numeral cannot disagree with the row beside it.

**Reconciled.** Padding retired into **Vertical spacing**; **Rule stays**, being the hairline between index
rows, and **Top divider is the seam above the section**. **No Tag row.** `relatedBy` widens to seven sources
and **Order** arrives — **oldest-first is what a numbered index of a series wants**, and 01 then means first
published rather than most recent, which the panel says. **When empty flips**, and Show still ships at 4.
**Four controls of its own.**

**Patched.** **The numbers are named as a CSS counter at `decimal-leading-zero`** — *Ghost's templates cannot count, add, or remember*: nothing adds them, so a numeral cannot disagree with its row. **The ≤ 767 stack is named as grid placement**, source order unchanged — *CSS cannot see content, and cannot reorder the DOM*. **Show became a number picker, 1–4, shipping at 4.** **The absent Ratio and Tag rows now carry their reasons.** No avatar is drawn here.

**Flagged ⚑.** The 44 / 1fr / 180 / 160 / 96 columns · tabular numerals · the em-dash tag cell · numbers as
drawn order rather than ranking · **01 meaning first-published at Order Oldest** · shipping at Four ·
stacking rather than scrolling at 767 · dropping no column at any width · a `<ul>` rather than a `<table>` ·
refusing a header row and a sortable column.

---

## 12 · Next Up

**Descriptor.** One related post as a 560 px picture beside a 34 px title, an excerpt and a byline. **The
only design in A27 that forces a value in the Data group.**

**Structural descriptor.** `media frame · none · page · one · left · one post at the size of a decision` —
the only `one` and the only `media frame` in A27.

**Archetype.** media frame. **One departure: it stacks at 834** ⚑, where the ladder would hold a media frame
to 767.

**Responsive rule.** **1440** picture 560 × 373 (or 560 × 560 at Square, **text column centred** ⚑), gutter
72, text 664, label 13, title 34, excerpt two lines clamped at 600, byline 14 with a 28 px avatar. **834**
**stacked**: picture 754 × 503, text below at 754, title 30, spacing 80. **≤ 767** picture 350 × 233, title
26, excerpt one line, meta date only, spacing 64. **Media Left / Right stop applying when stacked** ⚑.

**Content fields.** `headingText` (**default "Next up"** ⚑) · `fallbackHeading`. Per post: `title` · `url` ·
`feature_image` + `feature_image_alt` · `primary_tag.name` (the plate, and the eyebrow at Tag: Primary tag) ·
`custom_excerpt` · `published_at` · `primary_author.name` + `profile_image` · `reading_time`.

**Controls.** Heading · Media (Left · Right) · Ratio (Landscape 3:2 · Square 1:1) · Excerpt · Meta · **Tag
(Off · Primary tag)**. Then the universal trio and the Data group, **with Show forced to One and disabled,
its reason shown** ⚑ — **reviewed in this pass and kept**. **Quick: Heading, Media, Ratio, Excerpt.**

**Data.** As the category, and **the query's first result is the post** ⚑ — so **Order decides which post it
is**, and at Related by: Featured "next up" becomes the site's best rather than its newest, which is a real
editorial choice this design could not previously make. **0** → When empty. **1** → the design as drawn.
**Many** → **the rest are not drawn and nothing indicates they exist** ⚑ — no counter, no "more like this".

**Empty state.** No picture → **A17's plate at 560 × 373 carrying the post's tag** ⚑; **not a hand-off**,
because one title alone in 1,296 px is a headline in a field. No excerpt → label, title and byline. No author
photograph → A1's one-letter initials circle at 28 px. At Tag: Primary tag with no tag, the eyebrow is not drawn and the
title moves up 21 px.

**Behaviour module.** **none.** **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>` — **the label is the h2 and the post title is the h3**, and
**the whole block is one `<a>`** ⚑ named by the title, so the section has exactly one tab stop. **At Tag:
Primary tag two 13 px tracked lines stack** — the label above the tag — and the eyebrow is inside the link
while the label is not ⚑. The picture carries `feature_image_alt` or `alt=""`. Date is `<time datetime>`.
Focus is A6's ring round picture and text together.

**Reconciled.** Padding retired into **Vertical spacing**. **Show stays forced to One with its reason drawn**
— reviewed this pass and kept: this design is one post at the size of a decision, and two of them is 1 Three
Up at Show 2. **Tag** joins above the 34 px title, which is the one place in A27 where an eyebrow sits
under another eyebrow — drawn rather than refused, and flagged. `relatedBy` widens to seven sources, and
**Featured matters most here**; **Order** arrives and decides which post appears; **When empty flips**. **Six
controls of its own.**

**Patched.** **Show is a number picker locked at 1**, drawn greyed with its reason visible and **− and + still clickable so they can say why** — *item counts are a number picker*, and *the Remove button never greys out* read across to a locked value. **The Ratio refusals now carry their reason** — at 560 a 16:9 picture is 315 px and a 4:5 is 700 px. The plate stays **a plate and not a hand-off**. The 28 px author circle shows **one letter**.

**Flagged ⚑.** The 560 / 72 / 664 division · the 600 px excerpt clamp · the 28 px avatar · "Next up" as its
own default head · **forcing Show to One, kept** · **the label-above-eyebrow stack** · centring the text
column at Square · the 834 stack · the plate instead of a hand-off · drawing no rule anywhere · refusing a
previous/next pair.

---

## Findings for the architect

1. **Route awareness.** A27 cannot know that an A26 footer sits directly above it, so the two paddings sit
   adjacent — 192 px at Comfortable on both. The same mechanism A26 asked for (a section that knows what
   precedes it on the route) resolves this and A26's newsletter rule together. **Unchanged by this pass.**
2. **Relevance ranking.** Ghost's `{{#get}}` filter matches any listed tag but cannot order by how many
   matched. At Same tag, "related" therefore means *shares at least one tag*. A better set needs either
   Ghost's Content API at build time or a ranking the theme layer cannot express. **Narrowed by this pass:**
   a user who needs a precise set now has By tag, By author and Hand-picked, so the missing capability is
   ranking rather than control.
3. **A hand-picked set is resolved.** ⚑ **Closed by this pass.** It is `postRefs` through the Ghost post
   picker, on A17's ruling, and the old answer — a tag the site controls — is withdrawn because such a tag
   pollutes the site's public tag namespace.
4. **The archive link's default target.** `archiveLinkUrl` is pre-filled with *the archive the query points
   at*, which needs the product's tag-route decision to be settled — Ghost's default is `/tag/{slug}/`, but a
   site with a custom `routes.yaml` may not have one. **The Link Picker is always editable, so this is a
   default-quality question rather than a blocker** ⚑.

---

## Reconciliation notes

**Frames changed in this pass — thirteen, and every one of them.** `A27-0 Category Proof` (the settlements,
the field table, the repeating-items section and a new reconciliation banner), and all twelve design frames:
`A27-1 Three Up`, `A27-2 Rows`, `A27-3 Thumb Rows`, `A27-4 Panel`, `A27-5 Contrast Band`, `A27-6 Lead and
List`, `A27-7 Rail`, `A27-8 Overlay`, `A27-9 Big Type`, `A27-10 Carousel`, `A27-11 Index`, `A27-12 Next Up`.
**On all twelve:** the control-panel frame was rebuilt — Padding retired, the universal trio added outside
the list, a Content group added for the authored strings, the Related block replaced by the Data group, and
an Editing group added naming the P0 primitives; the panel header line and footer count were rewritten with
the design's Quick Controls; and a **Reconciled** paragraph was added to the panel card and to the spec
frame. **Section frames redrawn on six** — 1, 4, 5, 6, 10 and 12 — each gaining a drawn **Tag: Primary tag**
state in its states frame, because the eyebrow is new visible content. **No other section frame was
redrawn**: nothing else in this pass changes what the site renders at the defaults.

**Where this pass conflicts with something A27 already ruled, one line each.**

- **"Order is not selectable anywhere in A27" is withdrawn.** It was a settled rule on the proof frame and
  in the repeating-items section; **Order Newest · Oldest** now exists in all twelve. The old rule's
  argument — that the query has one order — was a description of the query, not a reason to withhold the
  control.
- **"When empty defaults to Show latest posts" is withdrawn.** The old default's argument survives (a post
  route that ends abruptly is worse than one offering the newest thing) and is now what the *value* is for;
  the *default* follows the library's empty-feed rule instead.
- **"A hand-picked set is only expressible as a tag the site controls" is withdrawn**, on A17's own
  argument. The refusals it protected — no Add that creates a post, no per-post styling, no pin — all still
  hold.
- **"A27 draws A17's card without its tag eyebrow" is amended, not withdrawn.** It remains true at the
  default, and the argument for it remains true at Same tag. It is now a value on six designs.
- **The 4–7 control norm is superseded** by the PRD's ~15 ceiling for this category. A27 ranges 4–6, so no
  design was cut to fit.
- **Rule 3's "band-internal padding" exemption was declined on 5 Contrast Band.** The band *is* the section,
  so its vertical padding is Vertical spacing under another name. A17's identical call on its own contrast
  band is the precedent. Recorded rather than resolved silently.
- **4 Panel's fixed 40 px inset was left without a control**, where A17·17 Panel has an Inset ladder. The
  patch did not name it; the two categories now disagree, and that disagreement is recorded rather than
  settled uninstructed.
- **8 Overlay's Background role was left unlocked**, where A17·8 Overlay locks it at Background. The A27
  design's ground is `page` and its media placement `background` is per tile, so the row governs the
  gutters and plate tiles rather than the design's identity. Recorded.
- **Member Visibility lands nowhere in A27**, and **P0·4's member-aware action editor never opens.** Nothing
  in the category is a CTA: a related post is navigation and the archive link is a route. A judgement, not
  an omission.
- **P0·2's Icon Picker never opens either.** A27 draws no button, so rule 11's optional icon has nothing to
  attach to.
- **Rule 10's Image focus lands nowhere.** A27 authors no image; the crop is named by the Ratio ladder and
  the focal point belongs to the post, in Ghost.
- **No registry addition was needed.** Hand-picked, Order and the four new sources all compile server-side.
  10 Carousel's `carousel` remains the category's only module, and no frame carries an "ARCHITECT: registry
  addition" note.
- **No Preview control was removed, because none existed.** Rule 7 is satisfied by construction; 10
  Carousel's scrolled state was already a drawn frame and is now attributed to P0·6's simulate entry.
- **Two open questions, named rather than answered.** (1) The archive link's default target depends on the
  product's tag-route decision — finding 4. (2) `count` is still an enum of Two · Three · Four while A17
  moved to a 1–100 stepper; **A27 keeps the enum**, because the three values are three sets of cell
  divisions rather than a quantity, and a related set of nine posts is a grid rather than a related set.
  Flagged for the owner.


---

## Patch notes — related posts patch, 30 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are
named, never numbered: the letter-and-number codes elsewhere in this project are filing labels and mean
nothing outside it.

**Frames changed — thirteen, and every one of them.** `A27-0 Category Proof` gains a **DESIGN PATCH
PASS** section: the numbering line, the free-designs shortlist and recommendation, the deleted hand-off
map with what each design draws instead, the one-letter avatar, the number-picker count, the two numbers
a template does not compute, the rules that land nowhere, and the two open questions. **All twelve design
frames** gain a **DESIGN PATCH** block naming, rule by rule, what changed in that design and what was
already satisfied. **The drawn content changed on all twelve** where the count control lives — the Show
row in the Data group is now a number picker — **and on four more places besides**: `A27-3 Thumb Rows`
and `A27-8 Overlay` (the hand-off sentences replaced by the all-plate state and the panel's advice),
`A27-9 Big Type` (the destination sentence gone), and `A27-7 Rail` (the count control marked as an
open question). **Six panels gained the reason for a narrowing** — 3, 4, 5, 10, 12 on Ratio, 3 again on
Thumbnail. **No arrangement moved, and no type scale, colour pack or spacing step changed.**

### What changed, and the rule that required it

1. **The count control is a number picker, 1–4, in all twelve designs** — *item counts are a number
   picker, never a row of fixed buttons*. It was a segmented row of three fixed words — Two · Three ·
   Four — in eleven panels, and a greyed row of four in 12 Next Up. Defaults are unchanged in substance:
   **3 in designs 1–9, 4 in 10 Carousel and 11 Index, 1 in 12 Next Up**. **4 is every design's ceiling,
   greyed with its reason on the control** ⚑ — the cell divisions on 1, 4, 5 and 8 (2 → 636, 3 → 416,
   4 → 306 across 1,296, and there is no fifth), and on the rows, rail, stack, strip and index that a
   longer list of posts is A18's page and A34 owns pagination. **The minimum is 1**, which every design
   already drew as its one-post state.
2. **12 Next Up's locked value is drawn greyed with its reason, and its − and + still speak** — *item
   counts are a number picker*, read together with *the Remove button never greys out*. The number
   cannot move and the control says why at the click ("this design is one post at the size of a
   decision; two of them is 1 Three Up at 2") rather than doing nothing. **Reviewed this pass and
   kept.**
3. **The enum the previous pass kept — and flagged for the owner — is closed by the rule.** The old
   argument was that Two · Three · Four are three sets of cell divisions rather than a quantity. That
   argument is now what **the greyed ceiling and its reason** say, and the quantity is a number.
4. **Two hand-offs are deleted, and each design draws its own state instead** — *no design ever turns
   into another design*. **3 Thumb Rows**: "the thumbnail column is not drawn and the design is 2 Rows"
   is gone; where no post in the set has a picture **every row draws its plate** at 128 (or 96) in the
   set ratio, carrying that post's primary tag or nothing. **8 Overlay**: "hand off to 9 Big Type" is
   gone; **every tile draws its plate**, the 4:5 box and the gutters holding, the type dark and no scrim
   drawn. **Both panels advise and neither switches** — "no post in this set has a picture — 2 Rows
   reads better here" / "…9 Big Type reads better here".
5. **9 Big Type is no longer a destination** — *no design ever turns into another design*. "It is also
   the destination of 8 Overlay's hand-off" is deleted, in the design entry and on the frame. It is the
   design a site **places** when its archive is not illustrated, which is a choice made in the panel.
   The roster's short-set column changed in the same three rows, and 8 Overlay's second departure — the
   hand-off — is withdrawn, leaving it one.
6. **Three denials were kept as denials.** 6 Lead and List's 636 × 424 plate, 7 Rail's collapse below
   1,200 and 12 Next Up's 560 × 373 plate each say explicitly that they are **not** a hand-off. Those
   sentences are the rule being obeyed, so they stay.
7. **The author circle shows one letter** — *avatars with no photograph*. Every author in A27 comes from
   Ghost, which cannot make two initials out of a name, so "Jane Doe" shows **J**. Ten designs draw the
   circle at Meta: Author and date; **8 Overlay and 11 Index draw no avatar at all**. No list in this
   category is typed by the site, so the two-initial form has no subject here — and the frames drew a
   photograph placeholder rather than initials, so nothing drawn had to be redrawn.
8. **7 Rail's count is the topic's total** — *Ghost's templates cannot count, add, or remember*,
   **ruled by the owner on 30 August 2026**. The old sentence, "the count value counts the posts drawn,
   not the posts that matched", is **withdrawn**: a template cannot count what it drew, and Ghost cannot
   return "3 of 12". The rail reads "Keep reading · 12 posts · Browse the archive", the number comes
   from the query's own total, and **the panel says what it counts** — the alternatives he refused were
   dropping the value (editors lose the one place that says how big the topic is) and letting an editor
   type the number (it goes stale silently the next time they publish).
9. **11 Index's numerals are named as a CSS counter at `decimal-leading-zero`** — *Ghost's templates
   cannot count, add, or remember*. Nothing adds 01, so the numeral cannot disagree with the row beside
   it; they remain drawn order rather than a ranking, and `aria-hidden`. At Order Oldest 01 means
   first published, which the panel already said.
10. **11 Index's phone arrangement is named as grid placement** — *CSS cannot see content, and cannot
    reorder the DOM at a breakpoint*. Number and tag above the title and the date below it are grid
    areas; **the source order is unchanged**, so a screen reader hears the same row at every width.
11. **Six silent narrowings gained their reasons** — *a design may offer fewer choices on a shared
    control, and must say why*. **3 Thumb Rows**: Wide 16:9 refused (a 72 px crop beside two lines of
    type reads as a strip), Portrait 4:5 refused (a 160 px crop sets the row's height instead of the
    words), nothing below 96 px (a smaller picture stops carrying a subject), and the absent Excerpt row
    (a thumbnail row that also carries prose is a row card). **4 Panel** and **5 Contrast Band**:
    Portrait 4:5 refused (392 portraits are 490 px tall; 416 portraits are 520 px). **10 Carousel**:
    Wide 16:9 and Portrait 4:5 refused on a strip (a 203 px banner; a 450 px card that lifts the arrows
    off the head's line). **12 Next Up**: the same two refused (315 px is shorter than the text beside
    it; 700 px is taller than a phone's screen). **8 Overlay's absent Excerpt row** and **9 Big Type's
    absent Rule row** gained reasons too, and **2 Rows**, **6 Lead and List**, **7 Rail** and
    **11 Index** had their absent rows written down rather than implied.
12. **Nothing was renumbered and no design was deleted.** Twelve designs, 1 to 12, no gap created or
    closed, no number reused.

### Rules and facts that were already satisfied, checked design by design

| Rule or fact | Where it lands in A27 |
|---|---|
| **The Remove button never greys out** | **One subject, and it was already right.** The category's only repeating list is the **Hand-picked post picker**, and Remove was never dimmed on it. One sentence was added rather than changed: **there is no minimum to defend** — unpicking the last post empties the list, *When empty* then decides, and the panel says that at the click. Nothing else in twelve designs is a list: no Add creates a post and no Remove deletes one. The rule also read across to 12 Next Up's locked count, which now explains itself at the click. |
| **Slider labels** | **No subject.** A27 draws no slider. Every scale row names what it affects and reuses the standard words — **Vertical spacing** reads Compact · Comfortable · Spacious; 3 Thumb Rows' **Thumbnail** reads Small 96 · Medium 128; 10 Carousel's **Card size** reads Small 306 · Medium 360 · Large 416; 9 Big Type's **Title size** reads Large 44 · Display 56. No invented three-word vocabulary anywhere. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A27 exposes no gap control at any width: the 24 px gutters, the 48 px row gap, 6 Lead and List's 72 px division, 4 Panel's 40 px inset and A25's 240 · 48 · 1,008 rail are fixed values in the arrangement. No Tight/Even/Airy or Tight/Standard/Wide existed to rename. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all twelve; the six that were silent are in **What changed** above. **The colour swatch row is Base**, and **there is no "Inherit" value anywhere in A27** — none was removed because none existed. No design renames a shared control or adds a choice to one. The reasoned narrowings that were already right: 1 Three Up's refusal of Portrait 4:5, 8 Overlay's refusal of Wide 16:9 and its absent Tag row, 11 Index's absent Tag row, 3 Thumb Rows' absent Tag row, 5 Contrast Band's two locks and its Excerpt disabled at 4, 7 Rail's absent Heading control, 12 Next Up's Square note. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject, and it is worth stating why.** **Every action in twelve designs is a link to a post or an archive route.** No Sign up, no Subscribe, no paid tier, no Portal deep link — so nothing renders conditionally on self-signup or a payment provider, and nothing opens Ghost's pop-up. Member Visibility is offered nowhere: a related post is navigation, and the archive link is a route. |
| **The no-JavaScript notice** | **No subject, and no promise to withdraw.** A27 holds **no subscribe field and no sign-in field** in twelve designs, so there is nothing for the notice to replace, and no sentence here ever said a reader could subscribe without JavaScript. The per-design line stands unchanged: **eleven designs are pixel-identical**, and 10 Carousel is a native `scroll-snap` strip minus its arrow buttons, quoted from the registry. Nothing in this pass needed a module, and **there is no "ARCHITECT: registry addition" anywhere in A27**. |
| **Ghost's templates cannot count, add, or remember** | Two subjects, both in **What changed** — 7 Rail's count and 11 Index's numerals. Everything else was already clean: the set is one `{{#get}}` loop at the chosen number; **the editor's count line ("4 posts matched. 3 drawn.") is editor text that never reaches a reader**; 6 Lead and List's lead is the loop's first item, not a computed promotion; 10 Carousel draws **no dots and no "3 of 5"**; nothing anywhere shows a total, a saving, an "and 2 others", or a heading that appears only when a value changes. |
| **CSS cannot see content** | **Already right, and now stated per design.** Every excerpt clamp is `line-clamp` **by line, never by character count**; a long title wraps and pushes nothing; 11 Index's em dash in an empty tag cell is a server-side conditional, not a measurement; **8 Overlay's scrim cannot read a photograph** and Medium and the phone's forced 80% are named as mitigations rather than promises. **Nothing in A27 reorders the DOM at a breakpoint** — 6's stack and 12's stack are one column of the same order, 11's phone arrangement is grid placement, and 6's Lead Right is `row-reverse`. |
| **Some fields we drew do not exist** | **Nothing missing is read.** A27 reads eleven post fields, all of which Ghost gives a theme: `title`, `url`, `feature_image` + `feature_image_alt`, `primary_tag.name`, `custom_excerpt`, `published_at`, `primary_author.name` + `profile_image`, `reading_time`, plus `featured` and the tag and author filters as the query. **No member join date, no member newsletter list, no newsletter cadence, no site address and no "posts per page" setting appears anywhere** — *When empty* is this section's own field, not a Ghost admin setting, and the reading-time suffix is A24's site-level string, read and not re-declared. |
| **Inside a blog post's body we own the stylesheet and nothing else** | **Applies nowhere.** All twelve are placeable sections that sit **after** the article, never inside its body: their markup, their ARIA and their words are ours end to end. A33 is the category for Ghost-rendered body content. Recorded, applied nowhere. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest designs, none of which needs the customer to own good photography — **1 Three Up · 2 Rows · 9 Big Type · 11 Index · 7 Rail** — and **recommended 1 Three Up and 2 Rows**, which he **ruled on 30 August 2026**. The line the merge reads is at the head of this document, on its own line, in the required shape. |

### The owner's rulings — 30 August 2026

**Nothing in this category is left open to him.**

1. **The free designs are 1 Three Up and 2 Rows** — *the two free designs are the owner's choice*.
   Between them a free site gets the shape the rest of the category is built from, plus one design that
   needs no photographs at all, so a free customer is never stuck. The pairs he refused: **1 with
   11 Index** (a ruled, numbered list of dates is a strong editorial statement for a default) and
   **2 with 9 Big Type** (no free design would ever show a picture).
2. **7 Rail's "Label and count" draws the topic's total** — *Ghost's templates cannot count, add, or
   remember*. Recorded in **What changed** above.

### The questions as they were put to him

**QUESTION 1 — Which two designs are free**

Every category ships two designs a free customer can use. For this one — the block of "keep reading"
posts at the end of an article — five are plain enough to ship without looking unfinished, and none of
them needs the customer to have good photographs.

1. **1 Three Up and 2 Rows (RECOMMENDED — and his ruling).** Three equal cards, and a list of titles with hairlines
   between them. Recommended because between them a free site gets the shape the rest of the category
   is built from, plus one design that needs no pictures at all — so a free customer is never stuck.
   *What it gives up:* the free tier shows no dense list of dates.
   *What a visitor sees:* three cards with pictures under "Keep reading", or four titles with dates.
2. **1 Three Up and 11 Index.** Cards, plus a numbered list of dates in columns.
   *Costs:* a ruled index is a strong editorial statement for a default, and a site that wants a plain
   list of titles without numbers has neither option.
   *What a visitor sees:* three cards, or "01 The night shift at the Port of Algeciras · Reporting ·
   12 March 2026 · 8 min read".
3. **2 Rows and 9 Big Type.** The two designs that read no pictures at all.
   *Costs:* **no free design would ever show a picture**, so a free customer with good photography
   cannot use it at the end of an article.
   *What a visitor sees:* titles and dates, or titles at 44 px.

**QUESTION 2 — The number in the rail's margin**

7 Rail puts the heading in a narrow column at the side of the page, and one of its three settings is
"Label and count" — the heading plus a number. We have since tested what a Ghost theme can actually do:
**it cannot count the posts it just drew.** It can ask Ghost how many posts exist in that topic, and
Ghost will answer; it cannot say "3 of 12". So the number can be the topic's total, or it can go.

1. **Show the topic's total (RECOMMENDED — and his ruling).** The rail reads "Keep reading · 12 posts · Browse the
   archive". Recommended because the number is then true, useful, and sits beside the archive link it
   belongs with — it tells a reader how much more there is.
   *Costs:* the number does not match the three rows below it, so a reader could read it as "12 shown".
   The panel would say what it counts.
2. **Drop "Label and count" entirely.** The setting becomes Label · Label and link, and 7 Rail keeps
   four controls of its own.
   *Costs:* editors lose the one place in the category that says how big the topic is.
   *What a visitor sees:* "Keep reading · Browse the archive", and nothing else in the margin.
3. **Keep the setting and let the editor type the number.** The rail draws whatever the editor writes.
   *Costs:* it goes stale silently the day the next post is published, and nobody notices — which is
   the failure this whole pass exists to catch.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12** — twelve designs,
   no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the
   required shape, and names **1 Three Up** and **2 Rows** — both of which exist in this category's
   roster. It is **the owner's own choice, ruled on 30 August 2026**.

— End of specification —
