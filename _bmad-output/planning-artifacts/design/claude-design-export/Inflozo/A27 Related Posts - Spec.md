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

**2 · Counts of 2, 3 and 4, and fewer posts than slots.** **Show is Two · Three · Four**, on A17's
divisions: 636 · 416 · 306 across 1,296 on a 24 px gutter. **Fewer posts than the count is the common
case and is not an error state** ⚑ — the cells keep their width and sit at the left, exactly as A17
settled it. **Nothing stretches, centres, rebalances or promotes.** Exactly one post → one cell, one row,
one tile. **Two designs ship at Four** (10 Carousel, which needs the overflow; 11 Index, which is a list
before it is anything) and **one forces One** (12 Next Up, whose Show control is disabled with its reason
shown ⚑ — reviewed in this pass and **kept**; A17·12 Bento's precedent, the only other override in the
library). At Hand-picked, **Show and Order hide**: the picked list is the count and the order.

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
| `count` | enum req | Two · Three · Four — **Four in 10 and 11**, **forced One in 12**; hidden at Hand-picked |
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
| 3 | Thumb Rows | `feed · none · page · few · left · a small picture beside every row` | Plate at the thumb; no pictures at all → 2 Rows | 5 | — |
| 4 | Panel | `grid-of-N · none · surface · few · top · the set on a raised panel` | Empty → the panel goes with the section | 6 | — |
| 5 | Contrast Band | `grid-of-N · none · contrast · few · top · inverted closing band` | Empty → the band goes with the section | 6 | — |
| 6 | Lead and List | `split · none · page · few · left · one lead against a short list` | One post → the list column is not drawn | 5 | — |
| 7 | Rail | `edge rail · none · page · few · none · the head in the margin` | No rail below 1,200; empty → both columns go | 4 | — |
| 8 | Overlay | `grid-of-N · none · page · few · background · titles over their pictures` | Plate tile with dark type; none at all → 9 Big Type | 4 | — |
| 9 | Big Type | `stack · none · page · few · none · titles at display size` | The title is always there; nothing else is read | 4 | — |
| 10 | Carousel | `carousel · none · page · few · top · a strip that runs past the edge` | Fewer cards, no overflow, no arrows | 6 | `carousel` |
| 11 | Index | `table · none · page · few · none · dated rows in fixed columns` | Em dash in the tag cell — the one placeholder ⚑ | 4 | — |
| 12 | Next Up | `media frame · none · page · one · left · one post at the size of a decision` | Plate at 560 × 373; never a hand-off | 6 | — |

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

- **How many, and which counts each design is built for.** Show Two · Three · Four. Designed for three:
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
| `count` | enum | no | Two · Three · Four | All twelve · default Three · **Four in 10 and 11** ⚑ · **forced One in 12** ⚑ |
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
| `primary_author.name` · `profile_image` | ref | yes | Meta in 1–7, 9, 10, 12 · missing photograph → A1's initials circle · not read by 8, 11 |
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

**Archetype.** grid-of-N. **One departure: Show Four collapses to two across at 834** ⚑ rather than
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
honest cost of the value and is drawn. No author photograph → A1's initials circle. No excerpt on any post
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

**Flagged ⚑.** The 48 px row gap from A17 · the hairline above the head, now Top divider Line · "Keep
reading" as the default head · **the eyebrow returning as a value and Off as its default** · **the eyebrow
breaking title alignment on a post with no tag** · Show Four collapsing to two across at 834 · the mobile
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
**Many** → the first N. **Show Four costs one row, 88 px** — the cheapest Four in the category.

**Empty state.** No excerpt on a post → that row ends at its meta; none on any post → three
title-and-meta rows, which is the design at Excerpt Off. No author photograph → A1's initials circle.
**A missing feature image is invisible here**, which is the design's reason to exist.

**Behaviour module.** **none.** **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>` (h2, or `aria-label` at None). A `<ul>` of rows, each title
an h3 inside the row's single link; the whole row is the target and **the hairline is a border on the
`<li>`, not an `<hr>`** ⚑. Dates `<time datetime>`. Focus is A6's ring on the row box.

**Reconciled.** Padding retired into **Vertical spacing**; **Rule stays**, because a hairline between rows
is not the seam above a section, and **Top divider is the seam** — both can be on at once. `relatedBy`
widens to seven sources, **Order** arrives, **When empty flips**, and the archive link gets its Link Picker.
**Five controls of its own.**

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

**Controls.** Heading · Thumbnail (Small 96 · Medium 128) · Ratio (Landscape 3:2 · Square 1:1) · Meta (Date
· Date and reading time · Author and date · Off) · Rule (Hairlines · None). Then the universal trio and the
Data group. **No Excerpt control** ⚑: on at one line above 767, off below. **No Tag row** ⚑ — the tag is
already drawn here, as the plate's one word when a picture is missing, and a second place for it would
print it twice in the same row. **Quick: Heading, Thumbnail, Ratio, Meta.**

**Data.** As the category. **0** → When empty. **1** → one row, no reserved height, no second hairline.
**Many** → the first N. Four rows is 532 px, the count this design is built for.

**Empty state.** No feature image → A17's tag plate at the thumbnail's box, tag centred at 13,
`aria-hidden`; no tag either → a plain plate. **No image on any post in the set → the thumbnail column is
not drawn and the design is 2 Rows** ⚑, named in the editor (A17's hand-off rule). No excerpt → the row is
title and date.

**Behaviour module.** **none.** **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>` (h2 / `aria-label`). A `<ul>` of rows; **the picture is
inside the row's single link**, so there is one tab stop per post. Title h3. Dates `<time datetime>`, full
at every width — **never abbreviated** ⚑. Focus is A6's ring round the row box including the picture.

**Reconciled.** Padding retired into **Vertical spacing**; Rule stays, for design 2's reason. **No Tag
row**, and the reason is now written down rather than inherited. `relatedBy` widens to seven sources,
**Order** arrives, **When empty flips**, the archive link gets its Link Picker. **Five controls of its own.**

**Flagged ⚑.** The 22 px rule inset · the date at the right edge · the excerpt with no control · refusing a
64 px thumbnail and Wide 16:9 · **refusing the Tag row the other picture designs gained** · the forced 96 at
≤ 767 · the date moving under the title on a phone · the hand-off to 2 Rows.

---

## 4 · Panel

**Descriptor.** The three-card set lifted onto one `surface` panel at the pack radius, head inside, page
ground visible on all four sides. **A plane instead of a hairline.**

**Structural descriptor.** `grid-of-N · none · surface · few · top · the set on a raised panel` —
containment `none` and ground `surface`, **A26·3 Card's precedent taken verbatim**: the plane is the
section's ground rather than a box round the section.

**Archetype.** grid-of-N. **One departure: Show Four collapses to two across at 834** ⚑, as 1.

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

**Controls.** Heading · Band (Full bleed · Inset) · Ratio · Excerpt (**disabled at Show Four, with its
reason shown** ⚑) · Meta · **Tag (Off · Primary tag)**. Then the universal trio — **Background role locked
at Contrast and Top divider locked at None**, both with the reason shown — and the Data group. **Quick:
Heading, Band, Ratio, Meta.**

**Data.** As the category. **0** → When empty; on Hide **the band goes with it** — an empty inverted band is
the loudest possible nothing ⚑. **1** → one 416 cell at the left; the band keeps its height. **Many** → the
first N.

**Empty state.** No image → the plate as **a 7% lift of the band** ⚑, its tag in the carried muted colour.
No author photograph → A1's initials circle at a 16% lift ⚑. No excerpt → the card ends at its meta. At
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

**Flagged ⚑.** The 72% muted line · the 7% plate lift and 16% avatar lift · Inset dropping one spacing step ·
Excerpt disabled at Show Four · the carried-colour underline, ring and eyebrow · the band drawing its own
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
ends at its meta and the rows are unaffected. No author photograph → A1's initials circle (lead only; rows
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

**Controls.** Rail (Left · Right) · Rail contents (Label · Label and link · Label and count) · Excerpt ·
Meta. Then the universal trio and the Data group. **No Heading control** ⚑ — the rail is the head, so the
head string is edited on canvas and named in the Content group instead. **Quick: Rail, Rail contents,
Excerpt, Meta.** **Four controls of its own — the joint minimum in A27.**

**Data.** As the category. **0** → When empty; on Hide the rail goes with the body ⚑. **1** → one row beside
the rail; the columns hold and nothing re-centres. **Many** → the first N. **The count value counts the
posts drawn**, not the posts that matched ⚑.

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

**Flagged ⚑.** A25's 240 · 48 · 1,008 division · the rail holding 240 at every value · refusing sticky ·
refusing a Rule control · no Heading control · the excerpt clamped at 700 inside a 1,008 row · the count
counting what is drawn · **the Link Picker row appearing only at Label and link** · tab order putting the
archive link first.

---

## 8 · Overlay

**Descriptor.** The title and its date over the picture, on 4:5 tiles with a warm scrim from the foot.
**The picture-forward design, and the one with a precondition.**

**Structural descriptor.** `grid-of-N · none · page · few · background · titles over their pictures` — the
only `background` in A27; separated from 1 by media placement alone.

**Archetype.** grid-of-N. **Two departures:** the scrim steps at ≤ 767 ⚑, and **the design hands off to
9 Big Type when no post in the set has a picture** ⚑.

**Responsive rule.** **1440** three 416 × 520 tiles (4:5), 24 gutter, title 22 white, meta 13, scrim 68% →
6% at 62% of the height, 24 px padding inside the tile. **834** three 235 × 294, title 17, padding 18
inside, spacing 80. **≤ 767** one 350 × 437 tile per row, 24 row gap, title 19, **scrim 80% at every value**
⚑, spacing 64.

**Content fields.** `headingText` · `fallbackHeading`. Per post: `title` · `url` · `feature_image` +
`feature_image_alt` · `primary_tag.name` · `published_at` · `primary_author.name`. **`custom_excerpt` and
`reading_time` are kept and never drawn** ⚑ — so **A24's `readingTimeSuffix` is not read here** either, and
the panel says so rather than offering a row that does nothing.

**Controls.** Heading · Ratio (Portrait 4:5 · Landscape 3:2 · Square 1:1) · Scrim (Light · Medium) · Meta
(Date · Author and date · Off). Then the universal trio and the Data group. **No Excerpt control** ⚑. **No
Tag row** ⚑ — the tag is already the plate tile's one word, and a tag over a photograph is a third thing
competing with the title for a scrim's worth of contrast. **Quick: Heading, Ratio, Scrim, Meta.**

**Data.** As the category. **0** → When empty. **1** → one tile at the left at its full 416 × 520. **Many**
→ the first N. **A set with no pictures at all is the precondition failing** and the design hands off ⚑.

**Empty state.** One post without a picture → **a plate tile: hover surface, title in `text`, meta in
`text-muted`, no scrim and no white type** ⚑; no tag either → a plain plate. **No picture on any post → hand
off to 9 Big Type**, named in the editor ⚑ (A17·8's rule). No author photograph is never visible: this design
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

**Flagged ⚑.** Portrait 4:5 as the default · the 68% → 6% gradient and Medium's 80% · refusing Wide 16:9 ·
refusing an excerpt, reading time and a tag eyebrow · **Background role unlocked where A17 locked it** · the
plate tile with dark type · the phone's forced 80% scrim · the dark re-tune · the hand-off to 9 Big Type.

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
universal trio and the Data group. **No Rule control** ⚑. **No Tag row** ⚑ — this design reads no tag at any
value, which is exactly what makes it 8 Overlay's hand-off destination. **Quick: Heading, Title size,
Alignment, Meta.**

**Data.** As the category. **0** → When empty. **1** → one title and its byline, no hairline at all ⚑.
**Many** → the first N. **It is also the destination of 8 Overlay's hand-off**, arriving with the same Data
group and its own defaults ⚑.

**Empty state.** No byline fields → the title stands alone, which is Meta Off. **A missing picture, excerpt
or tag is invisible here** — the design reads none of them, which is why it is the hand-off destination.
**There is no state in which it draws an empty row.**

**Behaviour module.** **none.** **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>`, head h2 — **at 13 px above 44 px titles the head is visually
smaller than the h3s beneath it**, a hierarchy the DOM does not share and which is stated ⚑. Titles h3 inside
one `<a>` per post, bylines outside the link. Focus is A6's ring round the title-and-byline block. Dates
`<time datetime>`.

**Reconciled.** Padding retired into **Vertical spacing**. **No Tag row.** `relatedBy` widens to seven
sources and **Order** arrives — and **it lands hardest here**: four titles at 44 px in publication order is a
series index, which is a page this design could not previously draw. **When empty flips.** **Four controls of
its own.**

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
**shipping at Show Four here** ⚑. **Quick: Card size, Ratio, Meta, Arrows.**

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
widens to seven sources, **Order** arrives, **When empty flips**, and Show still ships at Four. **Six
controls of its own.**

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
spacing 80. **≤ 767** **stacked**: number and tag above the title, date and reading time below it, hairline
held, title 19, spacing 64. **No column is dropped at any width** ⚑.

**Content fields.** `headingText` · `fallbackHeading`. Per post: `title` · `url` · `primary_tag.name` ·
`published_at` · `reading_time`. **`feature_image`, `custom_excerpt` and the author fields are kept and
never drawn** ⚑.

**Controls.** Heading · Columns (Date · Date and tag · Date, tag and reading time) · Numbering (Numbers ·
None) · Rule (Hairlines · None). Then the universal trio and the Data group, **shipping at Show Four here**
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
Dates `<time datetime>`, written in full. The number is `aria-hidden` ⚑.

**Reconciled.** Padding retired into **Vertical spacing**; **Rule stays**, being the hairline between index
rows, and **Top divider is the seam above the section**. **No Tag row.** `relatedBy` widens to seven sources
and **Order** arrives — **oldest-first is what a numbered index of a series wants**, and 01 then means first
published rather than most recent, which the panel says. **When empty flips**, and Show still ships at Four.
**Four controls of its own.**

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
photograph → A1's initials circle at 28 px. At Tag: Primary tag with no tag, the eyebrow is not drawn and the
title moves up 21 px.

**Behaviour module.** **none.** **No-JS: pixel-identical.**

**Accessibility.** `<section aria-labelledby>` — **the label is the h2 and the post title is the h3**, and
**the whole block is one `<a>`** ⚑ named by the title, so the section has exactly one tab stop. **At Tag:
Primary tag two 13 px tracked lines stack** — the label above the tag — and the eyebrow is inside the link
while the label is not ⚑. The picture carries `feature_image_alt` or `alt=""`. Date is `<time datetime>`.
Focus is A6's ring round picture and text together.

**Reconciled.** Padding retired into **Vertical spacing**. **Show stays forced to One with its reason drawn**
— reviewed this pass and kept: this design is one post at the size of a decision, and two of them is 1 Three
Up at Show Two. **Tag** joins above the 34 px title, which is the one place in A27 where an eyebrow sits
under another eyebrow — drawn rather than refused, and flagged. `relatedBy` widens to seven sources, and
**Featured matters most here**; **Order** arrives and decides which post appears; **When empty flips**. **Six
controls of its own.**

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
