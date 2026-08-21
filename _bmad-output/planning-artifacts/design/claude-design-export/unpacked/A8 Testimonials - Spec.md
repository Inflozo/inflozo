# A8 Testimonials — written specification

15 designs · Paper pack · drawn in this project as `A8-1 Single.dc.html` … `A8-15 Overlap.dc.html`, with the category's shared artefacts in `A8-0 Category Proof.dc.html`.

Read `A8-0` first. It carries the four settlements §8 asks A8 to make, the quote ladder, the attribution block, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass — including **the six amendments the drawn designs forced on it**. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**Nothing comes from Ghost. That is the category.** Ghost has no testimonial, review or endorsement resource, so **every word in these fifteen designs is authored in the section**, in a repeater. Comments are refused as a source — a reader who replied under a post agreed to be read there, not lifted into a marketing band, and A28 Comments owns that surface. Members are refused too: a name and an email in Ghost's members table are private data. **A8 is the first category in the library that reads no Ghost resource at all**, which means it has no missing-data branch: the only failure available is an empty repeater, and the answer is that the section does not render. **Flagged**: both refusals.

**The shared field list — fourteen fields.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 20 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 120. Per quote in `quotes[]`, one to twelve: `quote` text **req 40–300** · `name` text **req** ≤ 40 · `role` text opt ≤ 40 · `org` text opt ≤ 40 · `avatar` image opt, square, ≥ 88 px. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. `image` is read by 8 Portrait and 15 Overlap and **kept by the other thirteen**. The role line's combined cap is 40 characters advised, 80 possible, and the editor advises against filling both.

**Quote length: 40 at the floor, 300 at the ceiling, and the ceiling is hard.** Under 40 a quote is a slogan the site wrote itself; over 300 it is an excerpt from a post, and the editor names A19 Featured. **A quote is never truncated, clamped, faded or given a “read more” at any width or any value.** What happens instead is the **step-down**, carried from A4·16: above 180 characters the quote renders one value below its design's step on the ladder, above 260 two, measured from the authored string and **disclosed under the size control**. The card grows, the row grows with it, and its neighbours are honestly unequal in content. Three designs are exceptions and each states it: **3 Two Up stops at one step**, **5 Wall has nowhere to step** (its quote is the ladder's floor), **14 Slim Line never reaches a threshold** (its own ceiling is 120). **Flagged**: floor, ceiling, both thresholds, all three exceptions.

**The quote ladder is A8's one new scale.** Small 17 · Card 20 · Feature 27 · Display 40 at 1440; 16 · 19 · 24 · 34 at 834; 16 · 18 · 22 · 28 at 390. Line height 1.45 · 1.45 · 1.35 · 1.2; tracking 0 · 0 · −0.01em · −0.02em. **Heading font at regular weight and roman at every step** — a quotation set in italic is one the design is performing, and one set bold is a headline. **Flagged**: the whole ladder; the regular weight is A4·16's.

**The head is A6's title ladder unchanged** — Medium 34 · Large 40 · Display 48 at 1440, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390 — on a 780 px measure; sub 17 px muted on 620; eyebrow 13 px uppercase tracked `.08em` muted; **head to quotes 48 px**. The head keeps the pack's bold weight while the quotes take regular, which is what stops a 34 px title and a 27 px quotation reading as one voice. **Four designs draw no title**: 8 Portrait and 10 Big Quote keep the field and never draw it; **12 Rows and 14 Slim Line draw no head at all**.

**The quote card is one component, at four scales.** `surface`, a 1 px `border`, the pack radius, **no shadow on a page ground**. Padding follows the card's width: 20 in 5 Wall's 306, 28 in a 416, 32 in 3 Two Up's 632, 40 in 13 Highlight's 848 and 15 Overlap's. **Quote to attribution follows the quote's step**: 16 at Small, 20 at Card, 24 at Feature, 32 at Display. Blockquote takes the slack and **the figcaption is pinned to the card's foot**, so cards of unequal content keep their attributions level. Name 15/600, role line 14 px muted. **15 Overlap's card is the one exception to the shadow rule** — it sits over a photograph and carries the md warm shadow, dropped in dark where the plane step does the work.

**The attribution.** The name is required; role, organisation and avatar are not. **Role and organisation are two fields drawn as one line, comma-joined**, 14 px muted — a three-line attribution under a two-line quote is a caption taller than its subject. Where only one is authored it sits alone. **Where there is no avatar the block closes up** — no circle, no initials, no indent held for it — with one exception: **11 Faces draws the initials fallback**, because its tab row is a fixed row of circles. Avatar sizes: **44 at Feature and Display, 36 in a card, 32 in 5 Wall, 36 everywhere on a phone**; none at all in 8 Portrait (the photograph is the same person), 12 Rows or 14 Slim Line.

**Refused at every value, in all fifteen.** No rating, score, star, tick or “verified” mark — Ghost stores none of it and the mark implies a review system behind it. No date, source, post link or “as seen in” on a quote. No organisation logo (A11 Logo Walls owns marks). No decorative quote glyph — the 120 px grey `“` is the trope this category most obviously reaches for, and it takes a display moment the quotation has earned. **The quotation marks are typed characters in the authored string**, never a `::before` and never substituted. **The quote field is plain text**: no bold, italic, links, line breaks or lists inside somebody else's sentence; ellipses and square brackets are typed by the author. No “+4 more”, no pagination, no “load more”. **Flagged**: all of them.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the set a `<ul>` of `<li>`, each holding **A4·16's figure: `<figure>` → `<blockquote><p>` + `<figcaption>`**, so the attribution is programmatically the quotation's source. **There is not one `<h3>` in the whole category** — a quotation is not a heading at any size, including 10 Big Quote's and 13 Highlight's 40 px. **Four designs have no `<h2>` and take no `aria-labelledby`** rather than being labelled by invented text: 8 Portrait, 10 Big Quote, 12 Rows, 14 Slim Line. **No `cite` attribute and no `schema.org/Review` markup anywhere**: `cite` takes a URL for a source document and a reader's letter has none; review markup invites a star rating into a search result no reader gave. **Single-quote designs use no `<ul>`** — a list of one is not drawn as a list where the design only ever holds one.

**The avatar is `aria-hidden` and takes no alt text**, initials fallback included: the name it sits beside is already text. **Alt text exists in exactly two designs** — 8 Portrait's photograph and 15 Overlap's band, both `<img>` elements with `imageAlt`, `alt=""` where none is authored, never a filename.

**Nothing in A8 is a link except the optional section link**, and 11 Faces' tabs and 7 Slider's arrows are its only `<button>`s. Names are not links, avatars are not links, cards are not links: a card whose only destination is the quotation it already shows is a link to nowhere. **Hover on a card does nothing** — no lift, no shadow, no border change, no scale.

**There is no accent by default.** A testimonial section asks a reader for nothing, so most of the fifteen spend the accent zero times. It appears in exactly three places: **the optional link's underline** (label in `text`, underline in `accent` — accent on `background` is 3.3:1 and fails AA as text), **11 Faces' active tab underline**, and **a focus ring**. 9 Contrast Band substitutes the band's carried colour for all three, because the pack's dark accent is 2.3:1 on the light band. 12 Rows and 14 Slim Line can contain no accent pixel at all.

**Motion: two behaviours in the category**, both reader-driven — 7 Slider's rail and 11 Faces' tabs. Both 160 ms ease-out, both instant under reduced motion, neither runs while editing, and **every frame in A8 is a resting state**. Nothing advances on a timer, fades between quotes on its own, loops, or hints at a swipe; no parallax, no scroll reveal. **Focus** is A6's ring verbatim: 2 px accent, 2 px outside, the inner gap taking the ground it sits on, the carried colour on a band. **Forced colours** keep every hairline and drop the band; the striped placeholder becomes a bordered box; **15 Overlap moves its head above the band**, the one arrangement change forced colours causes in A8.

**Section padding Compact 64 · Comfortable 96 · Spacious 132**, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. Two designs carry their own scale: **9 Contrast Band's band at 44 · 64 · 88** (A4·9's) and **14 Slim Line's at 32 · 44 · 56** (A7·8's).

**Responsive floor.** Three or more cards hold above 1081; **at 1080 and below the columned designs take 2 Three Up's two-column grid**, last row left-aligned; at ≤ 767 one column at 16 px apart, card padding 24, quote at the phone step, attribution unchanged. **The authored order is the drawn order at every width in all fifteen** — nothing is sorted by length, nothing shuffled, and no design promotes a quote with an avatar over one without. 5 Wall is the one design whose visual order is not left-to-right, and it says so in the editor: **its columns read down, then across**.

**Empty.** No eyebrow, sub, note or link → absent. No avatar → the block closes up. No role and no organisation → the name alone. **No quotes → the section does not render**; the editor shows the empty repeater and its Add quote control and never draws a frame with a placeholder person in it. One quote where a design wants more → the design named in its panel. A quote past 180 or 260 characters → the step-down, disclosed at the size control.

**The count drawn, and what is not drawn.** Each design draws a stated count and **the panel says how many are authored and not drawn** — “3 of 7 drawn” beside the design picker. **Twelve is the category ceiling**, reached by 5 Wall and 7 Slider only; the repeater stops accepting a thirteenth and names them.

**The hand-off map — eight designs hand off, three receive.** To **1 Single**: 2 Three Up, 4 Grid, 6 Split Head, 12 Rows and 13 Highlight at one quotation; 8 Portrait and 15 Overlap with no photograph; 14 Slim Line past 120 characters. To **2 Three Up**: 5 Wall at three or fewer, 7 Slider at three. To **4 Grid**: 7 Slider at four. To **12 Rows**: 6 Split Head with no title, 11 Faces at ≤ 767 and at two quotations. Every hand-off is named in the sidebar before the frame changes under the site, and none of them is a fallback for missing data.

**Content.** Orbit Weekly's readers throughout. Head: eyebrow **Readers**, title **“What readers say about the Thursday letter”**, sub **“Every quote here was sent to us by a member, and is used with their permission.”**, note **“Quotes are used with permission and trimmed only for length.”**, link **“Read more letters”**. The first three quotes are the three attribution cases in order — **Mariam Okonjo** · Reader since 2019 · avatar; **Dan Whitlock** · Flight software engineer, Kestrel Aerospace · avatar; **Priya Raghunathan** · Physics teacher, Leeds · no avatar — then **Tomas Alvarez**, **Ruth Nakamura**, **Jonas Ekwueme**, **Cormac Deane**, **Elif Şahin**, **Adaeze Kalu**, **Peter Lindqvist**, **Sofia Brandt**, **Hannah Beeck**. **Every organisation named is fictional** — Kestrel Aerospace, Halden Observatory, Fieldnote — because a real employer beside an invented quotation is a claim about a real company.

---

## 1 · Single

One quotation at Feature 27 on a 780 px measure, the attribution beneath it, no card. The design six others hand off to at a count of one, and the one a site picks deliberately when it has one endorsement it trusts.

**Fields** · head fields, note, link pair, and **the first item of `quotes[]` only**. `image` kept, not drawn.

**Controls** · Padding: Compact 64 · Comfortable 96 · Spacious 132. Ground: Background · Surface. **Head: Eyebrow · Eyebrow and title · None** — the title is fixed at Medium 34 with no size control, the only capped head in A8. Quote size: Card 20 · Feature 27 · Display 40. Alignment: Centred · Flush left. Attribution: Below · Above.

**Arrangement** · one column on 780, centred in the 1,296 width or set at the left margin; no card, border or shadow; avatar 44. Eyebrow to quote 20, quote to attribution 20, attribution to note 32, note to link 10; head to quote 48 where a title is drawn. **Attribution Above drops the eyebrow** and is offered here, on 8 Portrait and on 10 Big Quote only.

**Responsive** · there is no collapse. At 834: padding 80, quote Feature 24, measure 690, avatar 44. At ≤ 767: padding 64, quote Feature 22, avatar 36, gaps 20 → 18, link target 44 px. Alignment and Attribution are obeyed at every width.

**Empty** · as the floor. At head None the section has no `<h2>` and no accessible name.

**a11y** · figure, blockquote, figcaption; **no `<ul>`**; the eyebrow is not a heading; reading order is quote then source at both Attribution values. One focus stop. Contrast 15.8:1 / 5.6:1 light, 15.1:1 / 6.4:1 dark, ring 3.3:1 / 6.3:1.

**Flagged** · the 780 measure and its 690 tablet step; the 44 px feature avatar and its drop to 36; capping the title at Medium 34 and defaulting to Eyebrow; Attribution Above and the eyebrow it displaces; the 32 px attribution-to-note gap; the wording of the step-down disclosure.

---

## 2 · Three Up

Three cards of 416 on a 24 px gutter under a centred head. **The quote card's home, and the collapse target every columned design in A8 names at 1080.**

**Fields** · head fields, note, link pair, **first three of `quotes[]`**. `image` kept, not drawn.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: Medium 34 · Large 40 · Display 48, unavailable at head None. **Cards: Surface · Ground · Hairline columns.** Card padding: Compact 20 · Comfortable 28 · Spacious 36, **relabelled “Column inset” at Hairline columns** — the one place in A8 a control changes what it measures. Quote size: Small 17 · Card 20.

**Arrangement** · 416 · 24 · 416 · 24 · 416 = 1,296, equal height, `surface` fill, hairline border, pack radius, **no shadow at any value**. Blockquote takes the slack, figcaption pinned to the foot, 20 px gap, avatar 36. Head to cards 48, cards to note 40, note to link 10; **the foot follows the head's alignment**. At Hairline columns: no gutter, a 1 px rule with a 32 px inset either side, running the full height of the tallest column.

**Responsive** · three columns above 1081. **At 1080 and below two columns** — at 834: 365 px each on 24, third card starting a second row under the first, **last row left-aligned**; padding 80, card padding 24, title 34, quote 19. At ≤ 767 one column at 16 px, authored order, card padding 24, quote 18, internal gap 20. **Hairline columns becomes hairline rows on a phone**, the inset becoming a 24 px vertical padding. Rows are equal within a row, never across a grid.

**Empty** · **two quotes → two cards of 416 centred, not widened**; one quote → hands off to 1 Single, named in the panel; four or more authored → three drawn, the panel naming 4 Grid for six and 5 Wall for twelve.

**a11y** · `<ul>` of three figures, DOM order = authored order at every width, one `<h2>`, no `<h3>`. Cards are not links and carry no hover state. One focus stop. Quote 16.6:1 / 15.1:1, role 5.9:1 / 6.4:1, ground text 5.6:1 / 6.8:1. **At cards Ground the hairline is 1.3:1** — a boundary, not information.

**Flagged** · 416 / 24 as the category's card grid; pinning the figcaption to the foot; the three Cards values, the 32 px hairline inset and the control's rename; holding the card width at two quotes; the one-quote hand-off; the left-aligned final row; Hairline columns turning into rows on a phone.

---

## 3 · Two Up

Two cards of 632 on a 32 px gutter, the quotation at Feature 27 inside the card. Every control is 2 Three Up's at this card's scale, so switching keeps all six values.

**Fields** · as 2 Three Up, **first two of `quotes[]`**.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Cards: Surface · Ground · Hairline columns. **Card padding: Compact 24 · Comfortable 32 · Spacious 40.** Quote size: Card 20 · Feature 27.

**Arrangement** · 632 · 32 · 632 = 1,296. The 32 px gutter because two planes need a wider gap than three to read as two things. Feature 27 in a 632 card is a 42-character line — the only card in A8 that takes the step. Avatar stays 36. Shared card otherwise verbatim.

**The one-step cap** · **this design's step-down stops at one step**: 300 characters lands at Card 20, not Small 17, because 632 px at Small is a 62-character line and reads as small print. The sidebar says “Feature · stepped down to Card, N characters · this design stops at one step”. The step-down is per quotation, not per row.

**Responsive** · the pair holds down to 767. At 834: two columns of 365 on 24, padding 80, card padding 24, title 34, and **the quote forced from Feature to the tablet Card 19**, disclosed at the control — the only width-driven size change in A8 that is not a length step-down. At ≤ 767 one column, 16 px apart, quote at the phone Card 18. **The cap holds at every width.**

**Empty** · **one quote → one 632 card centred; this design does not hand off.** Three or more authored → two drawn, the panel naming 2 Three Up and 4 Grid.

**a11y** · as 2 Three Up with two items. **The step-down is never announced** — no attribute, class or label tells a screen reader a quote was set smaller. At Hairline columns the rule is a `border-left`, not a separator role.

**Flagged** · the 32 px gutter and 632 card; Feature 27 inside a card; the card-padding scale one step above Three Up's; **the one-step cap and its disclosure**; the forced Feature → Card at 834; keeping the frame at one quote; holding the avatar at 36 at Feature.

---

## 4 · Grid

Six cards, three columns and two rows, on Three Up's 416 / 24 grid. **Settles the row-stretch rule: rows are equal within themselves and never across the grid.**

**Fields** · head fields, note, link pair, **first four or six of `quotes[]`** by Quotes shown.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Columns: Two · Three.** Quotes shown: Four · Six. Cards: Surface · Ground.

**Arrangement** · 416 cells on a 24 px column and row gap at three columns; 632 on 32 at two. **Card padding is not a control — it follows the column count**, 28 at three and 32 at two. Shared card verbatim. Each row is as tall as its own tallest quotation; the slack falls at the foot of the short cards inside a row. **Equal-across-the-grid is refused** (every short quote pays for one long one) and **packed is refused** (that is 5 Wall, which uses columns and no equal heights). **Hairline columns is not offered**: a vertical rule that stops between two rows is a table's rule without a table's header, and 12 Rows is the honest version of that idea.

**Responsive** · three columns above 1081; **two at 1080 and below at both Columns values**, disclosed as “Two at this width” — six cards become three rows of two, three row heights. At 834: 365 cells on 24, padding 80, card padding 24, title 34, quote 19. At ≤ 767 one column, 16 px apart, **and every card is its own height because there is no row.**

**Empty** · **fewer authored than shown draws what exists** — five at Six is five cards and the last cell is absent, not empty. Three or fewer → drawn as authored in one row; one → hands off to 1 Single.

**a11y** · **one `<ul>` of six, never two lists of three**; the equal-height stretch is invisible to assistive technology; **six cards, one focus stop.**

**Flagged** · six as the ceiling; rows equal within a row; both refused alternatives; card padding following the column count; refusing Hairline columns in a two-row grid; the “Two at this width” disclosure; drawing what exists rather than padding the grid.

---

## 5 · Wall

Up to twelve quotations in three or four CSS columns at their natural heights. **The many answer**, and the design that gives up equal heights entirely.

**Fields** · head fields, note, link pair, **first six, nine or twelve of `quotes[]`**. `avatar` is read at Cards Surface and Ground and **not drawn at Cards None**.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Columns: Three · Four.** Quotes shown: Six · Nine · Twelve. Cards: Surface · Ground · None. **There is no quote-size control: the quote is Small 17.**

**Arrangement** · `column-count` on the list — 306 px columns at four, 416 at three, 24 px column gap — items 24 px apart down a column (32 at Cards None), `break-inside: avoid` on each. Card padding 20, **internal gap 16 rather than the category's 20**, avatar 32, name 14/600, role 13 muted. No shadow. **Natural heights, no stretch, an uneven bottom edge** — the shortest column finishes above the tallest and the section's padding starts from the lowest. **Cards None drops the avatar and opens the rhythm to 32.**

**Reading order** · **authored order runs down each column and then across.** The DOM is one sequence in authored order and the visual order agrees with it; only the eye's habit of reading rows disagrees. **The editor says so at the repeater**: “On the wall, quotes read down each column.” No quote is moved between columns to balance heights.

**The step-down does not apply.** Small is the ladder's floor, so a long quotation simply takes more of its column — the one design where length costs nothing but height.

**Responsive** · four columns at 1440 and above only; three from 1439 to 1081; **two at 1080 and below**, disclosed as “Two at this width”; one at ≤ 767, where the arrangement is a plain stack 16 px apart and the reading-order rule no longer applies. At 834: padding 80, quote 16, items 20 px apart.

**Empty** · fewer than six authored → drawn as authored; **three or fewer → hands off to 2 Three Up**, since three cards in three columns is Three Up with smaller type.

**a11y** · one `<ul>` with `column-count`, never three lists; `break-inside: avoid` so no quotation is split from its attribution; **twelve quotations, one focus stop**; the 13 px role line checked as body text at 5.9:1 / 6.4:1.

**Flagged** · twelve as the ceiling; fixing the quote at Small 17 with no control; **the suspended step-down**; the 16 px internal gap and 32 px avatar; the 306/24 measure and its 1440 floor; Cards None dropping the avatar; the uneven bottom edge as a stated outcome; the hand-off at three or fewer; the editor's reading-order line.

---

## 6 · Split Head

A5·5's division: the head in a 416 px column at the left margin, the quotations as rows in an 824 px column at the right. **Settles where the note and the link go when the head is not above the quotes.**

**Fields** · every field except `image`, **first two, three or four of `quotes[]`**.

**Controls** · Padding: 64 · 96 · 132. **Title size: Medium 34 · Large 40** — Display 48 is not offered in a 416 px column. Quotes shown: Two · Three · Four. Rows: Hairline · Cards. Head column: Left · Right. **Foot: Under the head · Under the quotes.**

**Arrangement** · 416 · 56 · 824 = 1,296; the 56 px gutter is A5·5's, the widest in A8, because the two columns are two kinds of thing. Both columns top-aligned; **the head never sticks and is never vertically centred**. Rows: quote Card 20 on a 60-character measure, attribution 20 px under it, **32 px above and below each rule, rules between the quotations and never around them**, avatar 36. At Rows Cards: the shared card, padding 28, 16 px apart, no rules. Head to sub 12, sub to foot 20.

**The foot** · **default under the head** — the note and the link are the publication speaking and the quotations are readers speaking, so keeping the site's two sentences together stops the section ending in the site's own voice. **Under the quotes takes a rule above it**, the same hairline that separates two quotations, which is why it is the second value: it makes the note look like a fourth item in the list. **The note and the link always travel together.**

**Head column Right** is `flex-direction: row-reverse` — visual only, the head is read first at both values.

**Responsive** · **the split is what leaves.** At 1080 and below the head goes above the rows, full width on a 620 px measure, and the rows take the whole column; **Head column Right draws left**, having nothing to be right of; **the foot at Under the head lands above the quotes**, disclosed in the sidebar. At 834: padding 80, title 30, quote 19, row padding 28. At ≤ 767: title 26, quote 18, row padding 24, internal gap 16.

**Empty** · no eyebrow or sub → the head column closes up. **No title → hands off to 12 Rows**, named in the panel. No note and no link → the foot is absent and the control unavailable. One quote → hands off to 1 Single.

**a11y** · one `<h2>` in the head column; **the two columns are a flex row, not two landmarks** — no `aside`, no roles, no second heading. Hairlines are `border-top` on the items, never `<hr>`. One focus stop. No motion at any value.

**Flagged** · the 416/56/824 division; capping the title at Large 40; **the foot's default and the rule above the second value**; keeping note and link together; the 32 px row padding and rules-between rule; top-aligning rather than centring the head; the collapse target and the foot's disclosure at 1080; the hand-off to 12 Rows.

---

## 7 · Slider

**A5·14 Scroller's rail carrying quote cards** — settlement 3, built. A `<ul>` in an `overflow-x:auto` box, every quotation in the tree at all times, proximity snap, A1·14's outlined arrows in the head, no dots, one card per press, bleeding past the right margin.

**Fields** · head fields, note, link pair, **five to twelve items of `quotes[]`, all drawn**. **`sub` is not drawn at 834 and below.**

**Controls** · Padding: 64 · 96 · 132. Title size: 34 · 40 · 48. **Card width: Narrow 320 · Medium 416 · Wide 632** — A8's own scale, wider than A5·14's 280/320/380 because a card holding only type needs a reading measure. Rail edges: Bleeds right · Contained. Rail controls: Arrows · None. Cards: Surface · Ground.

**The rail** · 24 px gutter; **proximity snap, not mandatory** — a reader who drags halfway between two cards is left between them. One card per arrow press (the card plus its gutter). A1·14's outlined 38 px icon button with a 19 px glyph in the head's right; **40% and `disabled` at an end**; **no dots at any value**; bleeding past the right margin at rest and both margins once scrolled, the first card sliced by the page's left margin. **No loop**: at the last card the right arrow goes to 40% and stays there. **Every card is as tall as the longest quotation in the set**, not the tallest on screen, so the section never jumps as it scrolls — this design's cost, disclosed at the count control.

**Reduced motion** · **allowed, because the reader drives it.** The arrangement is unchanged; the arrow's animated scroll becomes instant and snap is dropped. A5·14's own rule. **If the rail advanced on its own, reduced motion would have to stop it — the honest way to avoid that argument is not to build the timer.**

**Responsive** · **the arrangement does not change at any width.** At 834: padding 80, margin 40, card padding one value down, title 34, quote 19, **Wide reads “Medium at this width”**, and the sub is not drawn. At ≤ 767: card 300 px at every width value, gutter 16, Rail controls default to None, and **where arrows are kept they move under the rail at 44 px square**.

**Empty** · **five is the floor** — four cards fit at 1440 without a cut, and a rail with nothing past its edge is a row that scrolls for no reason. **Four → 4 Grid; three or fewer → 2 Three Up**, both named in the panel.

**a11y** · every quotation in the DOM at all times, in authored order — nothing hidden, nothing lazy, so a screen reader hears twelve and Ctrl-F finds the eleventh. Arrows are `<button>`s labelled “Previous quotes” / “Next quotes” — **plural, because a press moves the rail rather than selecting a quote** — with `aria-controls`. The rail is a `tabindex="0"` scroll container named by the `<h2>`; **tabbing to an off-screen card scrolls it fully into view with its ring**. No card is a link. Arrow glyph 15.8:1 / 15.1:1, unavailable 6.3:1 / 6.2:1.

**Flagged** · citing A5·14 rather than designing a carousel; the reduced-motion answer; the 320/416/632 scale; the five-quote floor and twelve ceiling; **the set-wide equal height and its cost**; dropping the sub at 834; the 44 px arrows under the rail on a phone.

---

## 8 · Portrait

One quotation beside one photograph of the person who said it. With 15 Overlap the only design that reads `image`, and the only one where the photograph is a person. **The avatar is not drawn** — a 36 px circle of the same face beside a 632 px photograph of it is the same fact twice.

**Fields** · `eyebrow`, `note`, link pair, **`image` and `imageAlt`**, and the first item of `quotes[]` (`quote`, `name`, `role`, `org`). **`title`, `sub` and `avatar` are kept and never drawn.**

**Controls** · Padding: 64 · 96 · 132. **Division: Even 632/632 · Quote-led 760/504 · Image-led 504/760**, all on a 32 px gutter. Image side: Left · Right. **Crop: Portrait 4:5 · Square 1:1 · Match the text.** Quote size: Card 20 · Feature 27 — Display is not offered. Attribution: Below · Above · Under the image.

**Arrangement** · two halves **vertically centred against each other** — the only centred pairing in A8, because a 790 px photograph beside a 260 px quotation would otherwise hang the words off a corner. Image radius the pack token, `object-fit: cover`, **centred on its own centre with no focal-point control**; a site that needs a different focal point crops the file, and the editor says so. **No scrim: nothing is laid over this photograph.** Eyebrow to quote 24, quote to attribution 24, attribution to note 32. **At Image-led the quote steps down one** — a width decision, disclosed like a length one.

**The crop is named, not computed.** A theme that decides where to cut a photograph of a person will eventually cut through a chin. **Match the text** is the honest third value and the only one that can put a wide face in a narrow box; the editor's help line names the risk.

**Responsive** · two halves above 1081. **At 1080 and below they stack, image above the quotation at both Image side values, and the crop is forced to 3:2** — a 4:5 portrait at 754 px is a screen of face — with Division and Image side disclosed as having no effect. A photograph under a quotation reads as an illustration of it; above it reads as the person about to speak. At 834: padding 80, quote Feature 24. At ≤ 767: image 350 × 233, quote Feature 22.

**Empty** · **no image → hands off to 1 Single and the avatar returns**, named in the panel; there is no placeholder and no initials block at any width. No `imageAlt` → `alt=""`.

**a11y** · one `<figure>` holding image, blockquote and figcaption — **the photograph is inside the figure**; no `<ul>`, **no `<h2>` and no accessible name**; **the one image in A8 with real alt text**, requested by the editor. The quotation is read before its source at all three attribution values. Not a link, no hover, no motion.

**Flagged** · suppressing the avatar; dropping title and sub; the vertical centring; the three divisions and three crops; **refusing a focal-point control**; the Image-led step; the forced 3:2 and image-above stacking; Attribution Under the image; the hand-off with the avatar returning.

---

## 9 · Contrast Band

The section inverted onto the `contrast` token, the quotations drawn as panels on the band. The band, its **44 · 64 · 88 padding scale** and its derived mixes are A4·9's.

**Fields** · 2 Three Up's exactly, **one or three of `quotes[]`**. **Switching between this design and 2 Three Up changes nothing but the colours** — the tokenisation claim at its hardest.

**Controls** · **Band padding: Compact 44 · Comfortable 64 · Spacious 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390). Band width: Full bleed · Inset. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Quotes shown: One · Three. Panels: Panels · Hairline columns, unavailable at One.

**Derived mixes, all from the token pair** · muted = carried at **72% in light and 70% in dark (A4·9's pair)**, panel = carried at 6%, hairline = carried at 18%. Light band `#232019` / `#FBF9F5` → `#BEBCB7`, `#302D26`, `#4A4741`. **Dark band `#EDE7DA` / `#171511`** → `#57544D`, `#E0DACE`, `#C6C1B6`. Using `surface` or `border` here would put a light card on a dark band. **The striped image placeholder takes the light stripe pair on a light band in either mode.** No shadow at any value. **At Quotes shown One the panel is dropped entirely** — a single 6%-lighter rectangle on a band is a box around nothing. Inset takes the pack radius; Full bleed has no corners to round.

**The accent is unavailable on a band.** The pack's dark accent is **2.3:1** against the light band and a 2 px underline needs 3:1, so **the underline and the focus ring both take the carried colour**, in both modes — a link that is accent-underlined in light and carried-underlined in dark is two different links in one theme. The sidebar shows the failing ratio at the disabled value. The light-mode accent would pass at 4.8:1 and is still not used. **This section has no accent in it at all.**

**Responsive** · 2 Three Up's collapse exactly. The band's padding takes its own step at each width and **always keeps a horizontal margin** (72 / 40 / 20), because type running to the edge of a coloured field reads as a mistake. **Inset draws full bleed at ≤ 767.**

**Empty** · **one authored quote → Quotes shown One, panel dropped, Feature 27; this design keeps its own frame** and does not hand off, because the band is what the site picked.

**a11y** · 2 Three Up's structure unchanged; **the band is a background, not an element**. Text on the band 15.8:1 light / 14.7:1 dark, muted 8.7:1 / 6.0:1. **Forced colours drop the band** and keep every hairline.

**Flagged** · the 6% panel and 18% hairline percentages (the muted pair is A4·9's); **the accent substitution and its consistency across modes**; dropping the panel at one quote; the radius rule; the band keeping a horizontal margin; Inset becoming full bleed on a phone; the light stripe placeholder on a light band.

---

## 10 · Big Quote

One quotation at **Display 40**, flush left on a 1,000 px measure, the attribution at its foot. The only design that reaches the top of the ladder outside a card.

**Fields** · `eyebrow`, `note`, link pair, first item of `quotes[]`. **`title` and `sub` kept and never drawn** — a Display 40 quotation is the section's largest voice and a title above it would be a second one.

**Controls** · Padding: 64 · 96 · 132. **Measure: Narrow 780 · Wide 1000** — the width-not-height control. Quote size: Feature 27 · Display 40. Alignment: Flush left · Centred. Attribution: Below · Above. Ground: Background · Surface.

**Arrangement** · one column on the measure; no card, border, shadow or title. Display 40 / 1.2 / −0.02em, roman and regular. **Every separation is 32 px** — eyebrow to quote, quote to attribution, attribution to foot — one measurement repeated, because at this size a 20 px gap reads as a collision. Avatar 44, **dropped at Attribution Above**. **The foot is one row**, note and link 24 px apart. **Ground Surface is the whole section, not a card.** The measure is capped at 1,000 of the 1,296 available: at 1,296 a 40 px line is 65 characters and past what a reader can track.

**The 90-character advice** · the editor's counter turns muted past 90 with “Two lines reads best at this size” — **advice, not a limit**. The rule is the ladder: past 180 characters the quotation drops to Feature 27 and past 260 to Card 20, disclosed as “Display · stepped down to Card, N characters”. At Card 20 this design is 1 Single with a wider measure, which is honest rather than embarrassing.

**Responsive** · no collapse. At 834 **both Measure values draw 690** and the control says so; quote Display 34, gaps 28. At ≤ 767 quote Display 28, avatar 36, gaps 24, the foot stacks.

**a11y** · **no `<h2>` and no heading semantics on the 40 px quotation**, so no accessible name — the most important line in this spec. One focus stop. **No motion at any value** — no reveal, no fade, no letter-by-letter anything. The quote is full-strength `text` despite qualifying as large text.

**Flagged** · the 1,000 measure and the 780 alternative; **the 90-character advice and its wording**; the repeated 32 px separation; the single-row foot; dropping title and sub; dropping the avatar at Attribution Above; Ground Surface being the section; both measures collapsing to 690.

---

## 11 · Faces

The attributions become the control: a row of avatars and names, one quotation shown at a time. **A5·12's tablist structure and behaviour** — `role="tablist"`, roving focus, arrow keys, a 2 px accent underline from A1·1's nav item — cross-fading at 160 ms. **Three properties of the tab itself are changed and flagged: resting 15/500 and active 15/600 where A5·12 is 400 / 500, and a hover surface plane where A5·12 has none.**

**Fields** · `eyebrow`, `title`, `note`, link pair, **three, four or six of `quotes[]`**. **`sub` kept and not drawn** — the tab row sits where a sub would. **The tab shows `org` if authored, otherwise `role`, never both**; the figcaption under the quotation shows the full comma-joined line.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Tabs: Avatar and name · Name only**, Name only forced at Quotes shown Six. Tab row: Above the quote · Below. Quotes shown: Three · Four · Six.

**The behaviour** · 44 px targets at every width with a 36 px avatar inside (32 at 834); name 15/500 resting in `text-muted` and 15/600 active in `text`; **avatar 70% → 100%**; hover surface behind the tab — **the weights and the plane are this design's, not A5·12's**; **2 px accent underline over the row's hairline**. **Active is never colour alone** — underline, weight and avatar change together. Quote Feature 27 on a 900 px measure, 48 px below the row. **The panel is as tall as the longest quotation in the set**, so switching never moves the page. First tab active on load at every value and never remembered. **Instant under reduced motion; nothing on a timer; nothing while editing.**

**The cost, stated** · **five of six quotations are hidden on load.** They are in the DOM with the `hidden` attribute — correct for a tablist — but not on the page, so a scanning reader does not see them and a browser's find does not match them. **The panel says so and names 12 Rows for a site that wants everything visible.**

**Responsive** · tabs above 767. At 834 three avatar-and-name tabs fit, **four wrap to a centred second row** with the hairline under the last row, six force Name only. **A horizontally scrolling tab row is refused at every width** — 7 Slider is the design that scrolls, and a scroll that hides the choice this section exists to offer is worse than a wrap. **At ≤ 767 the behaviour is handed off: no tabs, every quotation drawn as 12 Rows' stack**, and the sidebar says “Tabs above 767, a stack below”.

**Empty** · **no avatar → the initials fallback, the only design in A8 that draws it.** Fewer authored than shown → that many tabs; **two or fewer → hands off to 12 Rows at every width**, since a tablist of two is a toggle.

**a11y** · `role="tablist"` / `role="tab"` with `aria-selected` and `aria-controls`, one tab stop with roving `tabindex`, arrow keys, `role="tabpanel"` labelled by its tab, inactive panels `hidden`. The tab's accessible name is the person's name; avatars and initials `aria-hidden`. Active 15.8:1 / 15.6:1, resting 5.6:1 / 6.8:1, underline 3.3:1 / 6.3:1, initials 5.4:1 / 5.9:1.

**Flagged** · the avatar as a tab; **the 500 / 600 tab weights and the hover plane against A5·12's 400 / 500 and no plane**; the 70% resting opacity; the trimmed role line and the repeated full attribution; the 900 px measure; **pairing Tabs with Quotes shown**; the fixed panel height; wrapping rather than scrolling; **handing the behaviour off to 12 Rows on a phone and at two quotes**; stating the hidden-quotation cost in the panel.

---

## 12 · Rows

Quotations as rows between hairlines: the words at the left on 780, the attribution in a 300 px column at the right. **No title, no eyebrow, no card, no shadow, no avatar** — the plainest thing the category can put on a page, and its floor.

**Fields** · `note`, link pair, **two to six of `quotes[]`**. **`eyebrow`, `title`, `sub`, `avatar`, `image` and `imageAlt` are kept and never drawn** — six of the fourteen fields, the most any design in A8 keeps, every one waiting for the design a site switches to next.

**Controls** · Padding: 64 · 96 · 132. Quotes shown: Three · Four · Six. Attribution: Right column · Under the quote. **Rules: Between · Above and below · None.** Quote size: Small 17 · Card 20 · **Feature 27 — the only multi-quote design that offers it.** Row padding: Compact 24 · Comfortable 32 · Spacious 44.

**Arrangement** · 780 · 56 · 300, **160 px of the content width left unused** — the attribution column is a caption column, not a second text column — both halves top-aligned so the name is level with the quotation's first line. Rules are `border-top` on the items with the row padding above and below each; at Rules Above and below the outer two are borders on the `<ul>`. **At Rules None the rows take the Spacious spacing whatever the control says**, because 32 px of nothing between two quotations is not enough to end one. Foot 32 px under the last row.

**Responsive** · the two-column row holds above 1081. **At 1080 and below the attribution goes under the quotation at both values**, disclosed as “Under the quote at this width”, and the quotation takes the full content width. At 834 row padding 28, quote 19; at ≤ 767 row padding 24, quote at the phone step. **Nothing else changes at any width; there is nothing else to change.**

**Empty** · **one quote → hands off to 1 Single**, the only hand-off out. **This design has no equal-height mechanism at all**, so a stepped-down long quotation affects no other row.

**Three hand-offs arrive here** · 6 Split Head with no title; 11 Faces at ≤ 767 and at two quotations. **The phone frames of 11 Faces and this design are the same drawing.**

**a11y** · `<ul>` of figures; **no `<h2>` and no accessible name** — naming it “Testimonials” would be the theme writing copy. Rules are borders, never `<hr>`. **Nothing focusable unless a link is authored; no hover state anywhere; no motion.** **In forced colours this design is unchanged.**

**Flagged** · the 780/56/300 division and the unused 160; top-aligning the halves; dropping the avatar entirely; the three Rules values and the forced spacing at None; offering Feature 27 here; taking the three hand-offs; handing off to 1 Single at one quotation.

---

## 13 · Highlight

One quotation at Display 40 in an 848 px card with two at Small 17 stacked in 416 px cards beside it. **Settles how far one voice may lead: two steps of the ladder and no more.**

**Fields** · `eyebrow`, `title`, `note`, link pair, **first three of `quotes[]` — item one is the lead**. `sub` and `image` kept, not drawn. The lead's attribution shows the full role line; **the pair's is trimmed to `org`, or `role` where there is no organisation** — 11 Faces' trim reused. **Which quotation leads is the repeater's order, never a flag**, so nothing about “featured” is stored.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. **Title size: Medium 34 · Large 40** — Display 48 would outrun the lead. Lead: Left · Right. **Lead size: Feature 27 · Display 40**, against Small 17 at both. Cards: Surface · Ground.

**Arrangement** · 848 · 32 · 416; the two small cards divide the right column's height evenly, so the pair reads as a pair rather than a leftover. **Lead padding 40 and small padding 28; lead internal gap 32 and small internal gap 16** — the only design in A8 that departs from the card's step-linked gap in both directions, because the type does. Lead avatar 44, small avatars 36. **The lead never takes a lighter plane than the pair**: a card that was lighter as well as larger would be two signals for one hierarchy.

**The ratio** · Display 40 against Small 17 is 2.35×; Feature 27 against Small 17 is 1.6×. **A third step was drawn and refused** — at Display against a hypothetical 13 px the small cards read as a caption to the big one, and a section that quietly demotes two of its three readers is worse than a section with one. **The small quotations are never muted in colour at any value**: `text` at 17 px, 16.6:1 / 15.1:1, the same as the lead. **The hierarchy is size only.**

**Responsive** · the pairing holds above 1081. **At 1080 and below the lead goes full width above and the two small cards go side by side under it**, with Lead disclosed as having no effect. At 834: lead Display 34, small 16, paddings 32 and 24. At ≤ 767 one column, lead first at both values, 16 px apart, **and the ratio narrows to 28 against 16 because that is the phone ladder** — stated in the sidebar rather than corrected.

**Empty** · **two quotes → one 848 card beside one 416 card at full column height**, not restretched; one → 1 Single. Over 180 / 260 characters the lead steps down, **which can bring it to the same step as the pair**, and the sidebar says so.

**a11y** · one `<ul>` of three items — the shared right column is a wrapper, not a nested list; **no heading semantics on the 40 px lead**; **nothing marks the lead as more important to assistive technology** — the emphasis is visual only.

**Flagged** · the 848/416 division; **two ladder steps as the maximum and the refusal of a third**; never muting the small quotations; the two padding scales and two internal gaps; the trimmed role line; the even height split; the two-quote answer; the phone's narrowed ratio.

---

## 14 · Slim Line

One short quotation on a single line between rules, the attribution inline after it. **No head, no card, its own 32 · 44 · 56 padding scale** (A7·8's), and a **120-character ceiling** no other design imposes.

**Fields** · **four drawn** — `quote`, `name`, `role`, `org` from the first item. **Ten kept and never drawn**, including `avatar`, both image fields, the whole head, the note, the link and every quote after the first: the most any design in A8 keeps, and the reason switching away loses nothing. **The field stores up to 300 characters; this design draws up to 120.**

**Controls** · **Padding: Compact 32 · Comfortable 44 · Spacious 56** (28 · 40 · 48 at 834, 20 · 28 · 36 at 390). Rules: Above and below · Above only · None. Alignment: Centred · Flush left. Quote size: Small 17 · Card 20 — **Feature and Display would not sit on one line with a source after them**. Attribution: Inline · At the right. Ground: Background · Surface.

**Arrangement** · one line, baseline-aligned, 16 px between quotation and source; the attribution **one inline string** — name 14/600 in `text`, comma, role and organisation 14 in `text-muted`. **Rules run the full content width at every value**, not the length of the type, because a rule that stops where the quotation stops is an underline. No avatar, no accent, nothing focusable. **At Attribution at the right a short quotation and a long role line can end up 900 px apart**, and the sidebar names Inline for that case rather than centring the pair automatically.

**The ceiling** · **120 characters, hard, and a hand-off rather than a truncation.** At 1440 the content width holds about 118 characters at Card 20 with the attribution after it; past that the line wraps, and a two-line quotation between two rules is 1 Single with rules. Over 120 the section draws 1 Single and the counter reads “121 characters — drawing 1 Single. Under 120 for one line.” **The step-down never fires here**: 120 is under the first threshold.

**Responsive** · at 834 about 88 characters fits on one line and the counter's advice says so. **At ≤ 767 the attribution goes to its own line at both values**, 10 px under the quotation, disclosed as “On its own line below 767”. **A quotation that wraps at a narrower width is drawn wrapped and does not hand off** — the hand-off is measured from the authored string, not the window.

**The boundary** · **A6·10 Slim** is a banner: it asks for something and ends in a link, and a quotation with “Subscribe” after it is **A6·11 Reasons**. **A2's bars** sit above the header, are dismissible and can rotate. **A4·16 Pull Quote** is a quotation inside an article, from the article. This is a section in the flow of a page that says one reader's sentence and asks for nothing: **no button, no dismiss, no link, nothing sticky, nothing that changes.**

**a11y** · figure, blockquote, figcaption; no `<ul>`; **no `<h2>` and no accessible name**, with 12 Rows the only two. **The attribution is one figcaption reading as one sentence**, the comma typed, the muted half styling rather than a field. Rules are borders on the figure. **Nothing focusable, hoverable, dismissible or animated at any value** — the only design in A8 with no interactive element at all.

**Flagged** · the 120-character ceiling and its hand-off; the inline attribution as one string; the 16 px baseline gap; full-width rules; refusing Feature and Display; the phone's forced own-line attribution; the three stated boundaries.

---

## 15 · Overlap

**A4·18's shape**: a full-bleed image band with a quote card pulled up over its foot. The only design in A8 whose geometry depends on the section after it, and the only one that puts text over a photograph.

**Fields** · `eyebrow`, `title`, `note`, link pair, **`image` and `imageAlt`**, and the first item of `quotes[]` **including `avatar` — unlike 8 Portrait, the avatar is drawn here**, because the band is a scene rather than a portrait of the speaker. `sub` kept, not drawn.

**Controls** · Padding: 64 · 96 · 132, above the band. **Band height: Short 320 · Tall 420.** Head: Over the band · Above the band · None. Card width: Narrow 632 · Wide 848. Card position: Left · Centre. **Overlap: Compact 48 · Comfortable 72.**

**Arrangement** · full-bleed band; card pulled up by the overlap; quote Feature 27, card padding 40, avatar 44; **the md warm shadow — the only shadow in A8, and dropped in dark** where the plane step from `background` to `surface` plus the hairline does the work. The shadow is allowed because **the card is in front of something**. **The card grows downward with a long quotation and the band never stretches to match it.**

**The scrim rule** · **a scrim is drawn only under text, only as far as the text reaches, and only from the `contrast` token** — `#232019` at 55% fading to 0 over the top 200 px (160 at 834, 130 at 390), at head Over the band and nowhere else. **Nothing behind the card**, which is opaque: a scrim there would darken a photograph for no reader. **Not black, not a full-height overlay, not a uniform wash** — all three flatten a warm photograph into a grey one. Head text takes the band's carried colours, `#FBF9F5` and `#EDE7DA`, 9 Contrast Band's pair reused. **Contrast is measured against the darkest 20% of the scrimmed area** — 12.4:1 for the title, 10.1:1 for the eyebrow — and a photograph that cannot hold the title there is the site's crop to fix; **the theme does not deepen the scrim until anything passes.** The photograph's own darkness is never adjusted in dark mode: “image scrims adjust” means the scrim, not the picture.

**The overhang is reserved** · the section's own bottom padding is the overlap plus its normal step, so **the next section starts where it would have anyway** and no page needs to know this design is above it. The reservation grows with the card.

**Responsive** · the shape holds at every width. **At 1080 and below the card takes the full content width inside the margins** at both Card width values, Card width and Card position are disclosed as having no effect, **the band is 320 at both height values and the overlap is 48.** At 834: padding 80, quote Feature 24, card padding 32, scrim 160. At ≤ 767: band 240, overlap 32, card padding 24, quote Feature 22, avatar 36, scrim 130.

**Empty** · **no image → hands off to 1 Single**, named in the panel; there is no striped placeholder and no coloured band on a live page. No `imageAlt` → `alt=""`. No eyebrow or title → head None, no scrim, no accessible name.

**a11y** · **the band is an `<img>`, not a CSS background**, with the scrim an `aria-hidden` sibling `<div>` and never a filter on the image. The card is not a link and does not lift, scale or move. **No motion at any value — no parallax, no reveal, nothing scroll-linked**, in the most tempting place in the library to attach one. **Forced colours: the head moves above the band**, the one arrangement change forced colours causes in A8.

**Flagged** · the 55%-to-0 scrim and its 200 px reach; drawing it only under text; **the reservation rule**; allowing the md shadow here and dropping it in dark; the band heights and overlap values; the card growing while the band holds; drawing the avatar where 8 Portrait suppresses it; the hand-off with no image; the forced-colours head move.

---

## 16. What A8 settled, in one place

1. **Quote length** · 40–300, hard at both ends. **Step-down, never truncation**: one value down past 180, two past 260, measured from the string and disclosed at the control. Three stated exceptions — 3 Two Up caps at one step, 5 Wall has no step to take, 14 Slim Line never reaches a threshold and hands off at 120 instead.
2. **Attribution** · name required; role and organisation one comma-joined line; avatar 44 / 36 / 32 by context and **absent rather than substituted** — except in 11 Faces, whose fixed row of circles draws the initials fallback.
3. **Single, grid and slider** · all three exist. **The slider is A5·14's rail, not a carousel**, and it is allowed under reduced motion because the reader drives it. **Nothing in A8 advances on a timer, loops, cross-fades on its own or hints at a swipe.**
4. **Authored, all of it** · Ghost has no reviews API; comments and members are refused with reasons. 0 quotes → no render; 1 quote → seven designs draw it and eight hand off; many → a stated count per design with “N of M drawn” in the panel, twelve at the ceiling.

**And what the drawing changed** · six statements in `A8-0` were written before the designs and overruled by them: the shadow rule (15 Overlap's card carries the md shadow over an image), the `<h2>` count (four designs, not two), the one-quote list (1, 3, 8, 9, 10, 14, 15), the card's padding (it follows the card's width), the quote-to-attribution gap (it follows the quote's step), and 8 Portrait's divisions (a third was drawn). All six are amended in `A8-0` and logged in its consistency pass.
