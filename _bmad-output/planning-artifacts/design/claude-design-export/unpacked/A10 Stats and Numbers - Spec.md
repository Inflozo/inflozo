# A10 Stats and Numbers — written specification

15 designs · Paper pack · drawn in this project as `A10-1 Row.dc.html` … `A10-15 Big Type.dc.html`, with the category's shared artefacts in `A10-0 Category Proof.dc.html`.

Read `A10-0` first. It carries the four settlements §8 asks A10 to make, the stat component, the value ladder, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs and the stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times, plus the amendments the drawn designs forced on the proof.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**A10's finding, stated first: no design in this category has a behaviour.** No disclosure, no tabs, no filter, no slider, no timer, no scroll trigger, no hover state on a number. Every frame is a resting state and every frame is the only frame. §7.7 asks for behaviour states per design; **A10 draws a states frame instead** — the link's hover and focus, and the design's missing-field cases — and every panel says the section has no behaviour. **Flagged**, and the category's headline finding.

**The count-up is refused in all fifteen, at every motion setting, for four reasons.** It animates the content itself, so reduced motion cannot honour it without changing what the section says. It is unreadable while it runs: the one moment a reader looks at the number is the moment it is not the number. It re-runs, because scroll-into-view fires again on the way back up. And it lies to assistive technology, which reads whatever figure is in the DOM when it arrives. **15 Big Type names this refusal in its own panel**, because it is the design that most invites the effect. **Flagged**.

**Four other things a stats section reaches for, refused with reasons.** A sparkline, dial, donut or pie beside a value — a chart is a different object with axes, legends and a series, and **9 Bars' single proportional bar is as far as a section goes**. An icon per stat — sixty stat icons across twelve packs is an icon set to maintain, and a glyph above "340 issues sent" tells a reader nothing the label did not. Colour as meaning — no green up, no red down, because the packs supply one accent and no semantic pair, and **14 Change carries direction in a glyph and a word instead**. A live figure from an API — Ghost holds no such number, and a section that fetches is a section that can be empty at load. **Flagged**.

**Nothing comes from Ghost.** Ghost has no statistic resource: member counts live behind the admin API and post counts change with every publish. Every field in A10 is authored in the section, in a repeater, the same as A8 and A9. One derived figure was considered and refused — a post count from a tag, which Ghost can give — because a number that changes when somebody publishes is a number nobody wrote and nobody checks. **Flagged**.

**The shared field list — sixteen fields.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `source` text opt ≤ 120 · `sourceUrl` url opt · `linkLabel` text opt ≤ 20 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 120 · `lede` rich text opt ≤ 280. In `stats[]`, one to six: `value` text **req** ≤ 12 · `prefix` text opt ≤ 3 · `suffix` text opt ≤ 6 · `label` text opt ≤ 60 · `note` text opt ≤ 60 · `prev` text opt ≤ 12 · `share` number 0–100 opt. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. **Five fields are read by one design each and kept by the other fourteen:** `image` and `imageAlt` by **10 Image Split**, `lede` by **11 Inline**, `note` by **12 Sourced**, `prev` by **14 Change**, `share` by **9 Bars**. **Six is the ceiling of `stats[]`**, reached by 3 Grid, 8 Ledger and 12 Sourced only. **Flagged**: every limit, the six-stat ceiling and the twelve-character value.

**The stat is the category's one new component: two lines of text and nothing else.** Value in the pack's heading font at display weight, −0.02em, line-height 1, tabular figures, `text`. Prefix and suffix at 0.5em of the value, same colour, same baseline, never superscript. Label 15/1.45 in `text-muted`, sentence case, ≤ 60 characters, wrapping, **never stepping at any width in any design**. Gap value-to-label 8 at Row, 10 at Large, 12 at Display. **The stat has no box of its own** — 2 Cards' cards and 3 Grid's cells are those designs' containers. No icon, no plane, no border, no accent, no hover, no motion. **Flagged**.

**The value ladder is A10's one new scale.** Row 40 · Large 52 · Display 68 at 1440; 34 · 44 · 56 at 834; 30 · 38 · 46 at 390. Line height 1 at every step. **Two designs exceed it and say so: 4 Single at Display 96 / Huge 128, and 15 Big Type at Big 96.** **Display 68 is not offered at four across in any design** — a 12-character value with two units is 500 px at 68 and the cell is 306. **Flagged**.

**The title ladder is A6's, cut off at its second rung: Small 28 · Medium 34 only** (26 · 30 at 834, 24 · 26 at 390). Large 40 and Display 48 are not offered anywhere in A10, because §2 allows one display moment and the numbers have taken it. **Eleven designs fix the title at Medium 34**; only 1 Row and 2 Cards offer Small 28. Head parts: eyebrow 13 px uppercase tracked `.08em` muted, 10 px above the title; title on a 780 measure; sub 17 px muted on 620, 12 px below the title; **head to stats 48**; source 32 px under the stats; link 20 px under the source. **Flagged**.

**Units, in two spacing cases and no third.** `%`, `×`, `°`, `+`, `−` and any currency symbol are set tight. Anything containing a letter takes a 0.16em space — `3.4 hrs`, `40 /mo` — **except a single capital used as a scale abbreviation**, `K`, `M`, `B`, which is tight because it is part of the figure. **The value and its units never wrap apart** at any width: one inline run with no break opportunity. **The value is a text field, not a number field** — no formatter, no locale, no separator guessing — so `41,800`, `99.98` and `Sold out` are all legal and are drawn as typed. **A stat with no unit is the bare value at full size and nothing is substituted.** **Flagged**.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the set a `<ul>` of `<li>`; **each stat a `<p>` holding the value and the label**, so a screen reader announces "41,800, readers on the Thursday letter" as one string. **The value is not a heading in any design at any size.** Three structures were refused: `<dl><dt><dd>`, because a label is not a term and a value is not its definition; `<table>`, which 3 Grid and 8 Ledger most tempt, because there is no header row and nothing compares down a column; and `<data value>`, which adds a machine-readable figure nothing reads. **Two designs have no `<h2>` and take no accessible name: 13 Slim, and any design at Head None.** **11 Inline is the one design with no list at all.** **Flagged**.

**Space.** Section padding Compact 64 · Comfortable 96 · Spacious 132, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. **Two designs carry their own vertical scale:** 7 Contrast Band's band at 44 · 64 · 88 (A4·9's) and 13 Slim's at 32 · 44 · 56 (A7·8's, and **the one scale in A10 that does not step with width**). Row gap between two rows of stats is 48 at 1440, 40 at 834, 32 at 390.

**Counts.** Two, three and four go in a row; **five and six go in a grid of three**. Two is 632 · 32 · 632; three is 416 · 24 · 416 · 24 · 416; four is 306 · 24 × 4. **The rule for five is 3 + 2, the second row keeping the 416 cell width and sitting at the left** — never centred, never widened, never five across. Six is 3 + 3 and is the ceiling. **Count names counts, not numbers**, and a row-based design with five or six authored stats draws its own count and names 3 Grid. **Dividers are offered at two and three and refused at four**, because three hairlines inside 306 px cells is a table without a header row. **Flagged**.

**Responsive floor.** **Three across holds at 834** — 234 · 26 · 234 · 26 · 234 = 754 — **and four across becomes two across**, 365 · 24 · 365, in two rows 40 px apart. **At ≤ 767 every design is one column, stats 28 px apart**, and a Rules divider becomes a horizontal hairline the width of the column. Six designs collapse a second axis: 6 Split Head's head goes above at 1080 · 8 Ledger puts the value under the label at 1080 · 9 Bars keeps its bar and drops to one column · 10 Image Split stacks image over stats at 1080 · 11 Inline stays prose at every width · 14 Change puts the previous figure under the current one at 767. **The authored order is the drawn order at every width in all fifteen**; 10 Image Split's Image side control is the one exception and is disclosed.

**The accent is spent in three places and nowhere else:** the optional link's underline, the source line's underline when a URL is authored, and the focus ring on either. **No value is ever accent-coloured.** 9 Bars' bar is `text` on a `border` track; 7 Contrast Band substitutes the band's carried colour for all three. **Eleven of the fifteen contain no accent pixel with no link authored, and 13 Slim can contain none under any setting.** **Focus** is A6's ring verbatim: 2 px accent, 2 px outside, the inner gap taking the ground, the carried colour on a band. Links are the only focusable things in the category.

**Empty.** No eyebrow, sub, source or link → absent, and the block closes up. **No stats → the section does not render**; the editor shows the empty repeater and its Add stat control. **A stat with no label is the value alone and nothing is invented** — no em dash, no repeated unit, no "Total". **A stat with no value is not saved**, so `value` is the one required field. **Fewer authored than shown draws what exists** — three at Four is three stats at the four-column width, left-aligned, the fourth cell absent rather than empty. **One stat where a design wants more → the design named in its panel**, which is 4 Single in eight cases.

**Print: every design prints as drawn** — nothing is hidden on screen, so nothing has to be revealed on paper. 7 Contrast Band drops its band, 9 Bars keeps its bars as outlined tracks with solid fills, 10 Image Split keeps its photograph and stacks the halves, 12 Sourced keeps its markers and notes, 13 Slim keeps its rules, 15 Big Type keeps 96 px values at two rows to an A4 page.

**Content.** Orbit Weekly throughout. The eleven stats: 41,800 readers, 62% opened, 340 issues, 74 countries, 9 writers, 2,140 archive pieces, £82,400 paid out, 3.4 hrs to read a year of letters, and the four regional splits — 18,400 Europe, 12,900 North America, 5,900 Asia and Oceania, 4,600 elsewhere — which sum to 41,800 and to 100%. Previous figures for 14 Change: 33,400, 58%, 288, 61, 6. Head: eyebrow **By the numbers**, source **"Figures from our own subscriber records, taken on 1 January 2026."**, link **"The annual letter"**. **Flagged: every number in A10 is invented**, including the ones that add up; they are internally consistent so that 9 Bars and 14 Change can draw honestly.

---

## 1 · Row

Two, three or four stats in one row of equal cells. The default — what a site gets when it types "stats" — and the row the whole category is measured against.

**Fields** · every section field except `image`, `imageAlt` and `lede`; two, three or four items reading `value`, `prefix`, `suffix`, `label`. `note`, `prev` and `share` kept, not drawn.

**Controls** · Padding: Compact 64 · Comfortable 96 · Spacious 132. Head: Centred · Flush left · None. Title size: Small 28 · Medium 34, unavailable at head None. Value size: Row 40 · Large 52 · Display 68, **Display unavailable at Count Four**. Count: Two · Three · Four. Dividers: Rules · None, **unavailable at Count Four**. **Order: Value first · Label above.** Seven — the only design in A10 at the ceiling.

**Arrangement** · 632 · 32 · 632 at two, 416 · 24 at three, 306 · 24 at four; dividers 1 px in the gutter's centre at the tallest cell's height; head on 780, sub and source on 620; head to stats 48, source 32 under the row, link 20 under the source; value to label 8 · 10 · 12 with the value's step. **At Order Label above the label block is equalised to the tallest label in the row** so the values still share a baseline — the only equalisation of a text block in A10.

**Responsive** · the shared floor exactly: three holds at 834 at 234, four becomes two at 365, one column at ≤ 767 with stats 28 apart.

**Empty** · head parts, source and link → absent. A stat with no label → the value alone, the hole at the foot of its cell. **Five or six authored → the panel names 3 Grid. One → 4 Single.**

**a11y** · `<ul>`/`<li>`/`<p>`; value not a heading; one tab stop at most; contrast value 15.8:1 / 15.1:1, label 5.6:1 / 6.0:1, underline 3.3:1 / 6.3:1.

**Flagged** · the three divisions and their gutters; the divider's position and height; Order's two values and the label-block equalisation; the step-linked value-to-label gap; refusing Dividers and Display at four.

---

## 2 · Cards

One stat per surface card. For a page whose ground is already busy and needs the numbers to sit on something.

**Fields** · 1 Row's exactly, two, three or four items. Switching to or from 1 Row changes the container and nothing else.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: Small 28 · Medium 34. Count: Two · Three · Four. **Cards: Surface · Ground.** Card padding: Compact 24 · Comfortable 32 · Spacious 40 (24 · 28 · 32 at 834, 20 · 24 · 28 at 390).

**Not offered** · Value size, fixed at Large 52 and at Row 40 at Count Four, because a 306 cell minus 48 of padding is a 242 px measure; Dividers, because a card has an edge and a rule beside it is a second one; Order, because a label on a card's top edge reads as the card's title.

**Arrangement** · 632 · 32 at two, 416 · 24 at three, 306 · 24 at four; pack radius, 1 px hairline, **no shadow at any value**; **cards equalised to the tallest in the row with the slack at the foot**; head and foot outside the cards, on the section's margins.

**Responsive** · the shared floor, the card's padding stepping with it.

**Empty** · a stat with no label → a card holding a value and 22 px of slack. One → 1 Row, not 4 Single: a single card at 1,296 is a panel.

**a11y** · the card is a `<li>`, not a link, and has no hover state; contrast as 1 Row, hairline 1.4:1 / 1.6:1.

**Flagged** · the card padding scale and its steps; equalising card height; no shadow; the refusals above.

---

## 3 · Grid

A hairline matrix in one block. The only design that holds five and six comfortably, and where five is drawn.

**Fields** · 1 Row's, four, five or six items.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Count: Four · Five · Six. **Columns: Two · Three, Two forced at Count Four.** **Frame: None · Boxed.** Value size: Row 40 · Large 52.

**Not offered** · Title size, fixed at Medium 34 — this design's head is a label on a block and Small 28 above six values disappears; Dividers, because the hairlines are the design; Card padding; Order.

**Arrangement** · three columns of 432 or two of 648 across 1,296; cell padding 32; hairlines on the shared edges as `border-left` and `border-top`, the odd pixel belonging to the cell below and right; at Frame None the outer padding is dropped so the type aligns with the head; at Boxed an outer hairline, the pack radius, a surface fill, the outer padding kept, no shadow. **Five is 3 + 2 at three columns and 2 + 2 + 1 at two.**

**Responsive** · three columns → two at 1080 → one at ≤ 767; the hairlines follow the grid at every width.

**Empty** · a cell with no label keeps its cell; **fewer authored than the count draws fewer cells and the grid closes up** — no empty cell is drawn. Under four → 1 Row.

**a11y** · the grid is a `<ul>`, not a `<table>`: no header row, and nothing compares down a column.

**Flagged** · the 432 / 648 cells and the 32 px cell padding; the shared-edge hairlines and the odd-pixel rule; Frame's two values; forcing two columns at four; five's two shapes.

---

## 4 · Single

One number as the whole section, at up to 128 px. **The design eight others hand off to when only one stat is authored.**

**Fields** · 1 Row's section fields, one item.

**Controls** · Padding: 64 · 96 · 132. Alignment: Centred · Flush left. **Value size: Display 96 · Huge 128** (72 / 96 at 834, 52 / 64 at 390) — **Display forced at Frame Panel**. Label: Under the value · Beside the value. Head: Shown · None. Frame: None · Panel.

**Not offered** · Count, because the design is one stat; Title size, fixed at Medium 34; Dividers; Order, since Label Beside is the position control here.

**Arrangement** · tracking −0.03em rather than −0.02em, one step tighter than the ladder; value to label 24 at Huge, 20 at Display, 16 on a phone; label on a 420 measure under and 300 beside, bottom-aligned to the value's baseline; the value at its natural width with the rest of the line left empty. Panel: surface, hairline, pack radius, 48 / 32 / 24 of padding, no shadow, sized to its content at Centred.

**Responsive** · the value steps twice; **at ≤ 767 Label Beside becomes Under**, because a 64 px value and a label beside it is 350 px of column.

**Empty** · no label → the value alone, which is the whole section. **This design receives and hands off to nothing.**

**Flagged** · both off-ladder sizes; the tighter tracking; the bottom-aligned label; the panel's padding; forcing Display inside the panel.

---

## 5 · Lead Stat

One value at Display beside the rest at Row. For a site with one number it wants read first and two or three that support it.

**Fields** · 1 Row's, three or four items; **the first item in the repeater is the lead**.

**Controls** · Padding: 64 · 96 · 132. Head: Flush left · None. **Lead position: Beside the rest · Above the rest. Lead side: Left · Right.** Count: Three · Four. Rules: Between the rest · None.

**Not offered** · Head Centred, because the arrangement is a left-to-right reading; Title size, fixed at Medium 34; **Value size — fixed at Display 68 for the lead and Row 40 for the rest**, since the pair is the design and a control over it would let a site set them equal.

**Arrangement** · at Beside, 632 · 32 · 632 with the stack hairline-separated, 24 px of padding either side of each rule, **top-aligned, the lead never vertically centred against the stack**. At Above, the lead on 1,296 and the rest at 1 Row's division 48 px below. Lead gap 12, supporting gap 8. **Rules never between the lead and the rest**; at None the stack sits 36 apart.

**Responsive** · Beside becomes Above at 1080; one column at ≤ 767 with the lead first and still at Display.

**Empty** · one stat → 4 Single. Two → 1 Row, because a lead needs something to lead.

**Flagged** · the fixed size pair; the 24 px rule padding; top alignment; the 36 px gap at Rules None; the first item being the lead.

---

## 6 · Split Head

Head in a 416 column at the left, a 2 × 2 of stats at the right. A8·6's split holding numbers.

**Fields** · 1 Row's, two or four items.

**Controls** · Padding: 64 · 96 · 132. **Head column: Left · Right.** Count: Two · Four. **Foot: Under the head · Under the stats.** Dividers: Rules · None. Value size: Row 40 · Large 52.

**Not offered** · Head alignment, because the head column is always left-aligned inside itself; Title size, fixed at Medium 34; Display 68, which does not fit a 384 cell; Order.

**Arrangement** · 416 · 56 · 824 = 1,296, and **384 · 56 · 384 inside the block at both counts — the block's width never changes**. Both columns top-aligned, the head never sticky and never vertically centred. Row gap 48. Dividers Rules is one vertical hairline 28 px into the right-hand cells, running through both rows; a horizontal rule is refused as 3 Grid's. Foot Under the stats takes a hairline above it and spans the block.

**Responsive** · **the head goes above the stats at 1080**; four becomes two across at 365 at 834; one column at ≤ 767.

**Empty** · no title → 1 Row, because the design is a head beside a block. Three authored at Four → three cells and the fourth absent.

**Flagged** · the 416 / 56 / 824 division; the block's fixed internal width; the divider's 28 px inset; Foot's two positions; refusing Display 68.

---

## 7 · Contrast Band

1 Row inverted onto the `contrast` token. **Switching between this design and 1 Row changes nothing but the colours** — the tokenisation claim at its hardest.

**Fields** · 1 Row's exactly, two, three or four items.

**Controls** · **Band padding: Compact 44 · Comfortable 64 · Spacious 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390) — it replaces the section's Padding control. **Band width: Full bleed · Inset.** Head: Centred · Flush left · None. Count: Two · Three · Four. Dividers: Rules · None, unavailable at Four. Value size: Row 40 · Large 52 · Display 68, Display unavailable at Four.

**Derived colours, from one token pair** · muted = the carried colour at 72% in light and 70% in dark; hairline = the carried colour at 18%. Light `#232019` / `#FBF9F5` → `#BEBCB7`, `#4A4741`. Dark `#EDE7DA` / `#171511` → `#57544D`, `#C6C1B6`. **The accent is unavailable at 2.3:1; links and the focus ring take the carried colour in both modes.** No shadow at any value.

**Responsive** · 1 Row's rule plus the band's own padding step; at Full bleed the band keeps the page margins for its content and loses them for its ground.

**Empty** · as 1 Row. One → 4 Single, which has no band, and the panel says so.

**Flagged** · the derived percentages and all four resolved values; the accent substitution; refusing a shadow.

---

## 8 · Ledger

Label at the left, value at the right, hairline rows. A9·15's geometry, and the design for six long labels.

**Fields** · 1 Row's, three, four or six items.

**Controls** · Padding: 64 · 96 · 132. Head: Flush left · None. Count: Three · Four · Six. **Rules: Between · Above and below · None.** Row padding: Compact 24 · Comfortable 32 · Spacious 44 (20 · 28 · 36 at 834, 16 · 24 · 32 at 390). Value size: Row 40 · Large 52.

**Not offered** · Head Centred; Title size, fixed at Medium 34; Display 68, which overruns the 300 column; Dividers, since the rules are the dividers; Order, because the order is the design.

**Arrangement** · **620 · 56 · 300 = 976 flush left, with 320 px of the content width left unused**; label and value on one baseline via `align-items: baseline`; **values right-aligned with tabular figures so the digits line up**; rules run the full 976; at Rules None the rows sit 44 apart. **No leader dots and no decimal alignment.**

**Responsive** · **the value goes under the label at 1080**; one column at ≤ 767 with the same order.

**Empty** · a row with no label → the value moves to the left edge, which is the one design where a missing label moves a value. One → 4 Single.

**Flagged** · the 976 measure and the unused 320; baseline alignment; right-aligned values; the row padding scale; refusing leader dots.

---

## 9 · Bars

A proportional bar per stat. The only design that draws anything other than type, and the only one with a precondition.

**Fields** · 1 Row's, three or four items, **and `share` — the only design that reads it**. `share` is 0–100; **every drawn stat must have one or the section draws 1 Row and names the stat that does not**. The theme does not check that the set sums to 100; a share above 100 is clamped to the track and the editor says so.

**Controls** · Padding: 64 · 96 · 132. Head: Flush left · None. Count: Three · Four. **Bar: Thin 4 · Medium 8 · Thick 16**, the same at every width. **Share figure: Shown · Hidden.** Row padding: Compact 24 · Comfortable 32 · Spacious 44.

**Not offered** · Value size, fixed at Row 40 — a 52 px value over a bar makes the bar read as its underline; Head Centred; Title size; **a colour per bar, a second series, an axis, gridlines, a legend, a tooltip, a sparkline, a dial, a donut and a pie**, all refused as charts.

**Arrangement** · the row takes the full 1,296 and **the bar takes the full row**; label left, share and value right-aligned on one baseline; bar 14 px below. **Track `border`, fill `text`, square ends** — the one place A10 does not apply the radius token — **no minimum fill width, a share of 0 drawing an empty track**.

**Responsive** · the track narrows with the column and nothing else changes; **the bar's height is identical at every width at all three values**.

**Empty** · a stat with no label keeps its bar and value; the value does not move. **A stat with no share → 1 Row, named. Two or fewer → 1 Row. One → 4 Single.**

**a11y** · the bar is two nested `<span>`s with `aria-hidden` — not `<progress>`, not `role="meter"`, not `role="img"`, not an SVG — because the share is already text beside it. **At Hidden the proportion is drawn and not written, which is a stated loss.** In forced colours the fill takes a 1 px border. Contrast: fill on track 12.1:1 / 12.6:1.

**Flagged** · the full-width bar and its 14 px gap; the track's colour and non-optionality; the fill in `text`; the square ends; the three heights held at every width; no minimum fill; not normalising the shares; the forced-colours border; the precondition and its hand-off.

---

## 10 · Image Split

A photograph on one half and everything else on the other. **The only design in A10 that reads an image**, and the only one where the head sits in the column with the stats.

**Fields** · every section field, **including `image` and `imageAlt`**; `lede` kept, not drawn. Two or four items. The image is a site upload, never a post's feature image.

**Controls** · Padding: 64 · 96 · 132. **Division: Even 632/632 · Stats-led 504/760. Image side: Left · Right. Crop: Portrait 4:5 · Square 1:1 · Landscape 3:2.** Count: Two · Four. Value size: Row 40 · Large 52.

**Not offered** · Title size, fixed at Medium 34; Head None, because a column of numbers beside a photograph with no title is a caption; Count Three, since a 2 × 2 with a hole is a missing cell; Display 68; a scrim, an overlay, a caption, a second image, and any crop the site did not name.

**Arrangement** · head, stats, source and link all in the text column; stats a 2 × 2 of 300 (364 at Stats-led) on a 32 px gutter with a 48 px row gap; **both columns top-aligned, the taller setting the height, neither stretched and neither centred**. Crop heights at 632: Portrait 790, Square 632, Landscape 421; **the text column is 567 px at four stats with a full head**, which is why Square is the match and Landscape is the one for two.

**Responsive** · two columns above 1080; **at 1080 and below the image goes above the text at both Image side values**, and Division and Image side stop having an effect — the panel says so and the controls stay enabled. At 834 image 754 wide, four stats two across at 365; at ≤ 767 image 350, stats one column 28 apart.

**Empty** · **no image → 1 Row**, named. No `imageAlt` → `alt=""`, decorative, and the editor asks. A stat with no label → the value alone. **One stat → 4 Single, and the photograph is dropped**, which is stated.

**a11y** · `<img>` in a `<figure>`, alt from `imageAlt`; **no `<figcaption>` in the section** — the captions on the frames are canvas annotations. Halves are a flex row, one `<h2>`. **Image side changes DOM order and no `order` property is used anywhere.**

**Flagged** · the head living in the text column; the 2 × 2 at 300 and 364; the 48 px row gap; top alignment with no stretch or centring; the three crop heights and the panel's crop advice; refusing Count Three and Display 68; the no-caption rule; the alt-text behaviour; both hand-offs.

---

## 11 · Inline

The values set inside a sentence, at 34 px in a 20 px paragraph. **The one design where a stat has a grammar, the one that reads `lede`, and the one that does not draw `label`.**

**Fields** · `eyebrow`, `title`, **`lede` rich text ≤ 280**, `source`, `sourceUrl`, `linkLabel`, `linkUrl`. `sub`, `image` and `imageAlt` kept, not drawn. Two or three items reading `value`, `prefix`, `suffix`; **`label` kept and not drawn, and the panel says how many.** **The lede carries one chip per stat**, inserted from the editor's toolbar, showing the stat's number and its current value; a figure cannot be typed into the sentence by hand. Allowed inside the lede: inline links, bold, italic. Refused: lists, headings, code, images, a second paragraph.

**Controls** · Padding: 64 · 96 · 132. Head: Flush left · Centred · None. **Measure: Wide 780 · Narrow 620.** **Lede size: Body 20 · Large 24. Value size: Inline 34 · Large 44** (30 · 38 at 834, 26 · 32 at 390). Count: Two · Three.

**Not offered** · Title size, fixed at Medium 34; Display 68, because at 68 the figure is the line and 15 Big Type draws that; Count Four; Dividers; drawing the labels.

**Arrangement** · one paragraph on the measure, **leading set to the value's size plus 12 px** — 46 at Inline, 56 at Large — the same at every width. Head 48 above, source 32 below, link 20 under the source. **Each value with its units is one unbreakable run**; the sentence breaks around it. The value takes no accent, no underline, no weight change and no baseline shift, and **is never a link**.

**Responsive** · **nothing collapses, because a paragraph reflows** — the only design in A10 with no arrangement to collapse. Wide 780 → 690 at 834 → the column at 390; Narrow 620 holds until the column is narrower. **The leading rule is unchanged at every width.**

**Empty** · **no lede → 1 Row**, named. **A stat with no chip in the lede is not drawn and is named**; nothing is appended to the paragraph. A deleted stat takes its chip with it. Four or more → 1 Row. One → 4 Single.

**a11y** · `<h2>` and one `<p>`; values plain `<span>`s; **no list anywhere**; not `<strong>`, not a heading, not `<data>`. **The undrawn label is not exposed to assistive technology either** — no visually hidden text. Reflows to 400% without overlap.

**Flagged** · the chip mechanism and its refusal of hand-typed figures; the leading rule; the two value sizes; refusing Count Four; leaving the labels undrawn and stating the count; refusing the `sub`; the lede in `text`; no list; a value never being a link.

---

## 12 · Sourced

Numbered footnotes, one per stat. For numbers that came from different places and have to say so. **The only design that draws `note`, and the only one that does not draw the section's own source line.**

**Fields** · `eyebrow`, `title`, `sub`, `linkLabel`, `linkUrl`. **`source` and `sourceUrl` kept and not drawn**, with `image`, `imageAlt` and `lede`. Three, four or six items reading `value`, `prefix`, `suffix`, `label` **and `note` ≤ 60**. **`note` takes no URL.**

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Count: Three · Four · Six. Value size: Row 40 · Large 52. **Notes: At the foot · Under each stat.** Dividers: None · Rules, **Rules unavailable at Count Four**.

**Not offered** · Title size, fixed at Medium 34; Display 68; Count Five, which 3 Grid draws; a marker style; a note as a link; a per-stat URL; a back-reference; drawing the section source line beside the notes.

**Arrangement** · 1 Row's cells — 416 at three, 306 at four, 416 in a 3 + 3 grid at six with a 48 px row gap. **Marker: a numeral in the body font at 13 px, superscript, muted, set after the suffix, at both value sizes.** Notes 32 px under the stats on a 620 measure, 6 px apart, 13 px muted, numeral then middot. **Numbering follows the notes that exist, in authored order** — four stats with two notes read 1 and 2. **At Notes Under each stat there are no markers at all** and the note is 12 px under the label.

**Responsive** · three holds at 834; four becomes two across at 365; six becomes three across at 234. **The notes stay one list at the foot at every width and are never split per row**; measure 620 → 560 → the column. **The numbering never changes with the reflow.** The panel advises Under each stat at ≤ 767 and at Six; **the control does not switch itself.**

**Empty** · a stat with no note takes no marker and reserves no number. **No note on any stat → 1 Row**, named. **One stat with a note is drawn here rather than handed to 4 Single**, because 4 Single does not read `note` — the one reversed hand-off in A10.

**a11y** · marker a `<sup aria-hidden="true">` inside the stat's `<p>`, **the note joined to the stat with `aria-describedby`**, dropped at Under each stat. Notes an `<ol>` with the numeral as text, not a CSS counter. **Nothing is a link, nothing jumps, and no DPUB footnote roles are used.** Marker and note 5.6:1 / 6.0:1 — the same step as the label.

**Flagged** · the numeral marker, its size, position and middot; the notes' measure, offset and gap; numbering only the stats that have notes; the two placements and dropping the markers; refusing a per-stat URL and the section source line; the `aria-describedby` relationship; refusing the DPUB roles; the reversed hand-off.

---

## 13 · Slim

A band 128 px tall with no head, no source line and no link, on its own padding scale. **The only design where the label sits beside the value.**

**Fields** · two or three items reading `value`, `prefix`, `suffix`, `label`, **and nothing else in the whole section**. **Eight section fields kept and not drawn:** `eyebrow`, `title`, `sub`, `source`, `sourceUrl`, `linkLabel`, `linkUrl`, `lede`; also `image`, `imageAlt`, and `note`, `prev`, `share` in the repeater. Switching to 1 Row draws all of them.

**Controls** · **Padding: Compact 32 · Comfortable 44 · Spacious 56, the same at every width.** Alignment: Spread · Left · Centred. **Label position: Beside · Under.** Rule: None · Above · Both. Count: Two · Three. Value size: Small 30 · Row 40.

**Not offered** · a head at any value; a source line; a link; Count Four, because four groups across 1,296 leaves 60 px between them at ordinary label lengths; **Large 52, which beside a 15 px label puts the label at 29% of the value's size**; Dividers; a surface panel; a ground of its own.

**Arrangement** · one row of groups on the 1,296 content width; **at Beside the value and label share a baseline with a 12 px gap**, at Under the group is 1 Row's stat with an 8 px gap. Left and Centred put 64 px between groups. The rule is a `border` hairline at full content width, never inset, never the accent. **Band height 110 at Small/Compact, 128 at Row/Comfortable, 152 at Row/Spacious with two rules.**

**Responsive** · three across holds at 834 and stacks at ≤ 767; value 40 → 34 → 30, Small 30 → 26 → 24, label 15 everywhere; **padding does not step at any width**. Stacked, one column 28 apart and **Beside survives the stack**, wrapping under the value's right edge. Alignment has no effect stacked and stays enabled. **The panel states the cost: three stacked groups is a 240 px band.**

**Empty** · a stat with no label → the value alone. Four or more → the first three, stated. **One → one group at the left, not handed to 4 Single**, because this design's contract is a short band.

**a11y** · **no `<h2>`, no `aria-label`, no landmark name** — A9·13's position, stated in the panel. `<ul>`/`<li>`/`<p>` at both label positions; the 12 px gap is a flex gap, not a space. **Nothing focusable, and no accent pixel anywhere under any setting.**

**Flagged** · the label beside the value and its 12 px gap; the three band heights; padding not stepping with width; offering Centred here and not in 1 Row; the three rule values; refusing Count Four and Large 52; drawing one stat rather than handing off; no landmark name.

---

## 14 · Change

Each value with the figure it replaced: a glyph, a word and the previous number. **The only design that reads `prev`.**

**Fields** · every section field except `image`, `imageAlt` and `lede`. Two, three or four items reading `value`, `prefix`, `suffix`, `label` **and `prev` ≤ 12**. **`prev` is text, like `value`**, and takes the same prefix and suffix as its stat when it parses as a number.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Count: Two · Three · Four. Value size: Row 40 · Large 52. **Change line: Under the value · Beside.** Dividers: None · Rules, unavailable at Count Four.

**Not offered** · Title size, fixed at Medium 34; Display 68; **a colour for direction, a computed difference, a percentage change, an arrow-only line, a bold direction word, a per-stat period, a sparkline and a second previous figure.**

**Arrangement** · value, change line, label, 8 px apart, in 1 Row's cells. **Change line 13 px `text-muted`, tabular, the previous figure in the body font**; glyph a 10 px triangle in the same colour, one space before the word. **Four fixed wordings: up from · down from · unchanged from · was.** **Direction is computed only when both figures parse** once separators, spaces, prefix and suffix are stripped; if either fails, the line reads "was …" with no glyph and no direction word. **The period is never named in the line** — the site types it into the `sub`. At Beside the line sits 10 px after the value on its baseline.

**Responsive** · three holds at 834; four becomes two across at 365; one column at ≤ 767. **At ≤ 767 the change line is Under whatever the control says** — the one forced control value in A10 — and the panel states it. The change line is 13 px and the label 15 px at every width.

**Empty** · **a stat with no `prev` draws no change line and nothing is substituted** — no "new", no dash; the label moves up and the values stay on one baseline. **No stat with a `prev` → 1 Row**, named. One → 4 Single, which draws the change line under the 128 px value.

**a11y** · the stat is one `<p>` holding all three lines; **the triangle is `aria-hidden` and the direction is carried by the word**; not `<del>`/`<ins>`. Under and Beside announce identically. **Change line, glyph and label all 5.6:1 / 6.0:1.** Forced colours lose nothing, because nothing is carried by hue.

**Flagged** · the cell's order and gaps; the previous figure in the body font; the triangle's size and colour; the four wordings; parsing both figures and refusing a direction when either fails; **refusing to compute a difference**; the period living in the `sub`; Beside's offset and wrap; forcing Under at ≤ 767.

---

## 15 · Big Type

One stat per full-width row, the value at 96 px on the left margin and the label in a 416 column at the right. The category's loudest design.

**Fields** · `eyebrow`, `title`, `source`, `sourceUrl`, `linkLabel`, `linkUrl`. **`sub` kept and not drawn** — a 17 px paragraph above a 96 px numeral is read after it — with `image`, `imageAlt` and `lede`. Two or three items reading `value`, `prefix`, `suffix`, `label`. **This is the design the 12-character ceiling on `value` was set for**: twelve characters plus a prefix is 633 px at Big 96, and with the label column and gutter that is 1,113 of 1,296.

**Controls** · Padding: 64 · 96 · 132. Head: Flush left · None. Count: Two · Three. **Value size: Display 68 · Big 96** (56 · 72 at 834, **46 at both at ≤ 767**). Label position: Right · Under. Row padding: Compact 24 · Comfortable 32 · Spacious 44.

**Not offered** · Title size, fixed at Medium 34; Head Centred, because the rows have two edges; Count One and Four — four Big rows is a 980 px section; a hover plane; a row link; an accent value; **a count-up at any motion setting**; the `sub`.

**Arrangement** · one stat per full-width row; value on the left margin, label in a 416 column on the right margin, 64 px minimum gutter; **the label optically aligned to the value's cap line — 10 px of offset at Big 96, 6 px at Display 68, 8 px at 72**. Hairline between rows, none above the first or below the last. **Interior row 161 at Big/Comfortable and 133 at Display/Comfortable**; the first row 128 and 100, the last 129 and 101 with its hairline; three rows 418 and 334, and the whole section 829 at Big and 745 at Display with a head, a source line and Comfortable padding. Label Under moves the label 12 px below the value on a 620 measure and leaves the right margin empty.

**Responsive** · two columns to 767, one below it. At 834 value 72 / 56, label column 234, row padding 28, offset 8. **At ≤ 767 the label goes under the value whatever the control says, and both value sizes draw at 46** — the largest size a 12-character value cannot overflow in a 350 px column, and **the one place in A10 where two control values draw the same thing**. The hairline is kept stacked.

**Empty** · a row with no label is the value alone, right margin empty, nothing substituted. Four or more → the first three, stated. **One → 4 Single.**

**a11y** · **the value is not a heading at 96 px**; stat a `<p>` in an `<li>`, value then label. Right and Under are the same DOM. At 200% the rows stack on available width; at 400% the value is 46 with the label beneath. Hairline 1.4:1 / 1.6:1, held to no text ratio.

**Flagged** · 96 px as an off-ladder size; the cap-line alignment and its three offsets; the fixed 416 column and 64 px gutter; capping Count at three; refusing Count One; both mobile sizes collapsing to 46; keeping the hairline stacked; refusing the `sub`.

---

## 16. What A10 settled, in one place

**§8.1 — counts of 2, 3 and 4, and the rule for five.** Two is 632 · 32 · 632, three is 416 · 24, four is 306 · 24. **Five is 3 + 2 in a grid of three, the second row keeping the 416 cell and sitting at the left**; six is 3 + 3 and is the ceiling of `stats[]`. Only **3 Grid** draws five; only 3 Grid, 8 Ledger and 12 Sourced draw six. A row-based design with five or six authored stats names 3 Grid rather than reflowing. **Dividers at two and three, refused at four.**

**§8.2 — units, prefixes and suffixes.** Separate fields, drawn at 0.5em of the value, in `text` and not muted, on the value's own baseline. Symbols tight, anything with a letter at 0.16em, single-capital scale abbreviations tight. **Value and units never wrap apart.** **A stat with no unit is the bare value and nothing is substituted** — nine of the eleven stats in the category's content have none, which makes it the ordinary case. **The value is a text field**, twelve characters, drawn as typed, so "Sold out" is legal.

**§8.3 — the source line.** **Per section by default: one line, 120 characters, 13 px muted on a 620 measure, 32 px under the stats and above the link**, taking `sourceUrl` and becoming a link at the section link's treatment when one is authored. **Per stat in one design only — 12 Sourced** — as numbered footnotes with numeral markers, and **12 Sourced does not draw the section line at all**, because two sourcing systems in one section leaves a reader deciding which governs. Every other design keeps `note` undrawn and its panel says how many notes it is not drawing.

**§8.4 — a stat with no label, and a label of 60 characters.** **The value comes first in the cell in fourteen of the fifteen designs**, so every value in a row shares one baseline whatever its label does: a missing label leaves a hole at the foot of a cell and a three-line label pushes nothing. **A stat with no label is the value alone and nothing is invented.** **60 characters is the ceiling and labels wrap** — never truncated, clamped, ellipsised or shrunk; at the narrowest cell in the category, 306 px, that is three lines at 15 px. The editor's counter turns muted past 34 characters with advice rather than a limit. **1 Row's Order Label above is the one design that puts the label first**, and it equalises the label block so the values keep their baseline.

### The six amendments the drawn designs forced on the proof

1. **Display 68 is not offered at four across, in any design.** The stress frame's `£1,284,900 p a` is 500 px at 68 against a 306 px cell. The value ladder's top rung is therefore a three-across-and-wider size.
2. **A10-0's "the only equalisation anywhere in A10" now reads "the only equalisation of a text block".** **2 Cards equalises card height** to the tallest in the row with the slack at the foot, because a card has a visible edge and three cards of different heights is a broken row. The stats inside the cards are not equalised.
3. **4 Single receives from eight designs, not nine.** 1 Row, 5 Lead Stat, 8 Ledger, 9 Bars, 10 Image Split, 11 Inline, 14 Change and 15 Big Type hand off to it at one stat. **12 Sourced and 13 Slim draw their own single stat** — 12 because 4 Single does not read `note`, 13 because its contract is a short band — and 2 Cards, 3 Grid and 6 Split Head hand off to 1 Row first.
4. **14 Change carries A10's only forced control value:** at ≤ 767 the change line is Under the value whatever Change line says.
5. **15 Big Type is the only design where two control values draw the same thing:** at ≤ 767 both Display 68 and Big 96 draw at 46.
6. **13 Slim's padding scale does not step with width** — 32 · 44 · 56 at 1440, 834 and 390 alike — the only width-independent spacing scale in the category.

### The category in one paragraph

A10 is fifteen arrangements of a component that is two lines of text with a strict relationship between them. **Eleven designs draw a row or grid of equal cells; four do something else** — 4 Single has no arrangement, 8 Ledger turns the stat on its side, 11 Inline dissolves it into prose, 15 Big Type gives one stat a whole row. **Six designs read a field no other design draws**, and each of them hands off to 1 Row when that field is missing. **Nothing in the category animates, opens, filters or reorders**, and the one graphic in it — 9 Bars' track and fill — is decoration for a number already written beside it.
