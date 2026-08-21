# A11 Logo Walls — written specification

15 designs · Paper pack · drawn in this project as `A11-1 Row.dc.html` … `A11-15 Big Type.dc.html`, with the category's shared artefacts in `A11-0 Category Proof.dc.html`.

Read `A11-0` first. It carries the four settlements §8 asks A11 to make, the logo component, the box ladder, the twelve placeholders, the rules all fifteen share, the shared field list, the roster, the tokenisation proof across three packs and the stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times, plus the amendments the drawn designs forced on the proof.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**A11's finding, stated first: this is the first category whose principal content is not type.** A logo wall draws artwork the site uploaded — files made by other people, in aspect ratios nobody agreed on, at whatever colour their owners chose. Re-skin the section into another pack and the ground, the head, the hairlines and the radius all change, and **every logo on the frame stays exactly as it was**. That inverts the usual tokenisation problem: the wall's job is not to be re-coloured, it is to make foreign artwork sit level on a ground it was not made for, in twelve packs and two modes. **Flagged**, and the category's headline finding.

**Every logo on every frame in A11 is a placeholder, and no real mark appears anywhere in this project.** Each is drawn as a wordmark, or a geometric mark and a wordmark, in the pack's muted token, at the aspect ratio it stands in for. **The twelve names are invented publications** — Meridian Press, longform, The Ledger, Cartograph, Foundry Review, Northbound, Signal & Co, Kestrel, Atlas Type, Rowan & Wells, Pinhole, Bellwether — with twelve more for 13 Dense: Quire, Marginalia, Waypoint, The Gantry, Lantern, Oxbow, Third Estate, Halyard, Cornice, Tally, Weathervane and Ferry & Sons. **The placeholders use different typefaces from each other on purpose**: a brand's face belongs to the brand, so it must not move when the pack does. Where a frame has to show what colour artwork does to a wall, the placeholder is drawn in an invented brand colour taken deliberately from outside the token set, and the frame says so. **Flagged**, all of it.

**Behaviour: the category has one behaviour and one interaction, and thirteen designs have neither.** **8 Marquee** transports the wall and never stops for a pointer; **9 Rail** moves only when the reader moves it. Everywhere else the resting state is the only state, and a link's hover is the only thing that responds to anything. A10 had no behaviour at all; A11 has exactly two designs' worth, and both are named on every frame that is not one of them. **Flagged**.

**The shared field list — fourteen fields.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 20 · `linkUrl` url opt · `lede` rich text opt ≤ 280 · `leadLabel` text opt ≤ 20 · `restLabel` text opt ≤ 20. In `logos[]`, three to twenty-four: `logo` image **req** · `logoDark` image opt · `alt` text **req** ≤ 60 · `url` url opt · `caption` text opt ≤ 40. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. **Four fields are read by one design each and kept by the other fourteen:** `lede` by **14 Inline**, `caption` by **11 Named**, `leadLabel` and `restLabel` by **12 Tiers**. **Twenty-four is the ceiling of `logos[]` and 13 Dense is where it is reached.** **Nothing comes from Ghost**: a logo is a site upload, never a post's feature image, never a tag's image, never an author avatar. **Flagged**: every limit, the twenty-four ceiling and the sixty-character alt.

**The logo is the category's one new component: one image in a box.** A fixed-height box from the ladder, a max width of the cell minus 24, `object-fit: contain`, centred on both axes, with its aspect class setting the drawn height. **No border, no plate, no shadow, no radius on the artwork itself, no caption, no hover and no motion** — with three stated exceptions: the light-mode-`surface` plate in dark when no `logoDark` exists, the hover surface under a link, and 8 Marquee's transport. **The box has no visible edge in any design**; 3 Grid's hairlines, 4 Boxed's panel and 5 Cards' card are those designs' containers, drawn around the box and never on it. **Flagged**.

**The box ladder is A11's one new scale: Small 28 · Medium 36 · Large 48** at 1440; 26 · 32 · 40 at 834; 24 · 28 · 32 at 390. **Two off-ladder sizes: Tiny 22 in 13 Dense, and Huge 64 in 15 Big Type and 12 Tiers' lead tier.** Row gap 40 · 32 · 28. **Flagged**, the whole ladder.

**Aspect classes, computed by the theme from the file's intrinsic ratio, with no control over them: Wide ≥ 3:1 takes 100% of the box · Regular 3:1 to 1.4:1 takes 88% · Square under 1.4:1 takes 72%.** Normalising by box height alone is the defect, not the fix: a square mark and a 5:1 wordmark drawn at one height are not the same optical weight, because the square carries five times the ink. **Logos in a row share a horizontal centre line, not a baseline** — a wordmark's baseline and a mark's centre cannot both be honoured. **Nothing is cropped, stretched, upscaled past its intrinsic size or altered in ratio.** SVG preferred; PNG at 2× the box height, and the editor warns below it. **Flagged**: the three classes, all three percentages, the centre line and the 2× floor.

**Treatment: Full colour · Muted · Greyscale, with Greyscale the default.** Greyscale is `grayscale(1)` at full opacity. Muted is `grayscale(1)` at 64% in light and 74% in dark — **except on 7 Contrast Band, where it is 70% in both modes**, because the band's lightness does not follow the mode's. Full colour is the file untouched. **Refused: `invert()`, blend modes, duotone, an accent tint, and a per-logo override.** **§7.4 cannot be applied to this control**: a value that would fail contrast is meant to be disabled with its ratio shown, and **the theme cannot measure an uploaded file** — so Muted is never disabled, and the editor carries the advice instead, 3:1 against the ground, non-text. **The one enabled value in the library that the theme cannot prove.** **Flagged**.

**A dark ground is where a logo wall breaks, and the answer is a second file, not a filter.** With no `logoDark` the theme does not invert and does not lighten: it draws the logo on a plate carrying the pack's **light-mode** `surface` — `#FFFFFF` in Paper — at the pack radius, 12 px of padding, no hairline and no shadow. **The dark-mode `surface` token cannot be used**: Paper's is `#211D17`, and dark artwork on it is the problem the plate exists to solve. **This is the one place in the library where a dark section draws a light-mode token.** **The plate takes the treatment's opacity with the rest of the wall.** Five designs vary it and each says so: **7 Contrast Band** draws it in *light* mode; **5 Cards** makes the card itself the plate; **13 Dense** drops its padding to 8 at Tiny 22; **12 Tiers** and **15 Big Type** let it exceed its box at Large 48 and Huge 64, the row growing to fit; **14 Inline** lets it set the paragraph's leading. **Flagged**, all of it.

**Links are per logo and optional.** A logo with a `url` is an `<a>` wrapping the `<img>`; without one it is a bare `<img>`. **The wall is never one link**, and a wall where some logos link and some do not is the ordinary case — the panel says how many are links. **One hover rule at all three treatments: the cell takes the pack's hover surface at the pack radius and the treatment resolves to full colour, 160 ms.** Focus is A6's ring on the cell box. **Refused: an external-link glyph, a tooltip, a “visit” label, a lift, a scale and a shadow.** **The resting state gives no sign of which logos are links** — a stated cost in all fifteen, and the reason 5 Cards exists. Two designs vary the target: **5 Cards** makes the whole card the `<a>`, **11 Named** wraps the logo and its caption; **14 Inline** refuses to draw `url` at all. **Flagged**.

**`alt` is required and is the brand's name.** `alt=""` is refused on every logo in every design — a wall nobody can read is a wall of decoration, and the names are the content. **Not “Meridian Press logo”**, because the word logo is what the image already is. **The one exception in the category is 8 Marquee's duplicate track**, whose copies are `aria-hidden` with empty alts. **Flagged**.

**“Caption” is two different fields.** The section's `note` sits under the wall at 13 px muted on a 620 measure and carries the permission line or the “and forty others”. The per-logo `caption` is 40 characters and is **drawn by 11 Named only**; the other fourteen keep it and say how many they are not drawing. **Flagged**.

**Space.** Section padding Compact 64 · Comfortable 96 · Spacious 132, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. **Two designs carry their own vertical scale:** 7 Contrast Band's band at 44 · 64 · 88 (A4·9's) and 10 Slim's at 32 · 44 · 56 (A7·8's, and **the one scale in A11 that does not step with width**).

**Head.** Eyebrow 13 px uppercase tracked `.08em` muted, 10 px above the title; title on a 780 measure; sub 17 px muted on 620, 12 px below the title; **head to wall 48**; note 32 px under the wall on 620; link 20 px under the note. **Title ladder: Small 28 · Medium 34 in twelve designs, Large 40 in 6 Split Head and 15 Big Type, Display 48 in 15 Big Type only** — unlike A10, the display moment is available here, because the logos are artwork and do not compete for it. **15 Big Type's 1,040 measure and 64 px head gap are the only exceptions.**

**Counts and cells.** Per row: Three 416 · Four 306 · Five 240 · Six 196 on a 24 px gutter — A10's divisions, extended by two. Three designs have their own: **6 Split Head** at 400 / 258 / 188 inside its 824 block, **13 Dense** at 196 / 141 / 108, **7 Contrast Band** at 274 / 214 when Inset. **Four designs have no cell grid at all:** 8 Marquee, 9 Rail, 10 Slim and 12 Tiers' lead tier, all of which draw logos at natural width on a fixed gap. **6 Split Head's 25 px gutter at Count Three is the one gutter in A11 that is not 24**, and 13 Dense's 12 px gutter at ≤ 767 is the one that tightens.

**Rows wrap in authored order, 40 px apart, and the short last row keeps the cell width.** Stretching it is refused — a wider cell is a bigger logo box, and one logo drawn larger than its neighbours is the defect the whole category exists to avoid. **Centring is the default in 1 Row, 3 Grid, 7 Contrast Band and 15 Big Type; four designs depart and each says so:** 4 Boxed centres at 1440 and left-aligns below it, 5 Cards left-aligns at every width because cards have visible edges, 6 Split Head left-aligns inside its block, 13 Dense defaults to Left because a nearly full last row continues the grid. **A last row of one is drawn, warned about, and not prevented**: the editor's counter names the counts that divide. **Flagged**.

**Responsive floor.** **Six across steps to four at 1080, everything steps to three at 834, and everything steps to two at ≤ 767 — never to one.** At 834 three cells of 234 on 26; at ≤ 767 two cells of 163 on 24. **Two stated exceptions: 12 Tiers' lead tier goes to one across at ≤ 767**, and **13 Dense keeps four across at 78 on a 12 px gutter**. Six designs collapse a second axis: 2 Caption Row's label goes above at 1080 · 6 Split Head's head goes above at 1080 and its foot moves under the wall · 8 Marquee drops to one row at 1080 · 9 Rail drops its arrows at 767 · 10 Slim stops being a band at 767 · 14 Inline collapses nothing, because a paragraph reflows.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the wall a `<ul>` of `<li>`; each logo an `<img>` with its `alt`, wrapped in an `<a>` when a URL is authored. **`<picture>` with a `prefers-color-scheme` source is used, and only when `logoDark` exists** — inverted in 7 Contrast Band and only there. Refused: `<figure>`, a table, a carousel role, an `aria-label` on the list repeating the title, and a CSS background image for any logo. **Three designs take no accessible name: 10 Slim always, 2 Caption Row with no title authored, and any design at Head None.** **14 Inline is the one design with no list at all.** **9 Rail generates the one accessible name in A11** — “Logo wall, scrollable” — because there a name is what makes the arrow keys reachable.

**The accent is spent in two places and nowhere else:** the optional section link's underline and the focus ring on a link or a logo. **No logo is ever accent-tinted, in any design, at any treatment.** 7 Contrast Band substitutes the band's carried colour for both, at 2.3:1. With no section link and no logo URLs authored, **fourteen of the fifteen contain no accent pixel at all — 9 Rail is the exception**, because its two arrows carry the accent as their hover and focus colour whatever else is authored.

**Empty.** No eyebrow, sub, note or link → absent, and the block closes up. **No logos → the section does not render**; the editor shows the empty repeater and its Add logo control. **A logo with no `alt` cannot be saved** — the one field in A11 required beyond the file itself. Fewer logos than the per-row count → one short row. **Eleven designs hand off to 1 Row**, which makes it the most-received design in the library after A10·4 Single.

**Print.** Greyscale and Muted print as drawn — paper is where a greyscale wall was always going. **8 Marquee and 9 Rail both print as a static wrapped wall**, because a printed page has no viewport to scroll. 7 Contrast Band drops its band and therefore **prints the light files**, the one place printing changes which file is used. The dark plate never prints, since print is the light mode.

**Content.** Orbit Weekly throughout. Head: eyebrow **Featured in**, title **“The letter, elsewhere”**, sub **“Editors at these publications have quoted, reprinted or recommended the Thursday letter.”**, note **“Marks are shown with each publication's permission.”**, link **“Read the press page”**. **Flagged: every name, ratio and string is invented.**

---

## 1 · Row

Three to six logos in one row of equal cells, each contained in a fixed-height box, all on one centre line. The default — what a site gets when it types “logos” — and **the design eleven others hand off to**.

**Fields** · every section field except `lede`, `leadLabel` and `restLabel`; three to six items reading `logo`, `logoDark`, `alt`, `url`. `caption` kept, not drawn.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: Small 28 · Medium 34, unavailable at head None. Logo size: Small 28 · Medium 36 · Large 48, **Large unavailable at Count Six**. Count: Three · Four · Five · Six. Treatment: Full colour · Muted · Greyscale. Six.

**Arrangement** · cells 416 · 306 · 240 · 196 on a 24 px gutter across 1,296; every cell the box's height; logos centred on both axes at 100 / 88 / 72% of the box by class; head on 780, sub and note on 620; head to wall 48, note 32 under, link 20 under the note. Head Centred centres the head, the note and the link — **not the wall**, which is already the content width.

**Responsive** · the shared floor exactly: three across at 834, two at ≤ 767, never one; a short row keeps its cell width and centres.

**Empty** · head parts, note and link → absent. Fewer logos than the count → that many cells centred. **More than the count → the first N drawn, the rest held, 3 Grid named.** **This design hands off to nothing and receives from eleven.**

**a11y** · one tab stop per linked logo plus the section link; none at all with no URLs; focus on the cell box so a 26 px Square mark and a 36 px wordmark take the same ring; contrast title 15.8:1 / 15.1:1, sub and note 5.6:1 / 6.0:1.

**Flagged** · the five- and six-across divisions; the 48 / 32 / 20 foot gaps; disabling Large 48 at Count Six; holding back logos past the count rather than wrapping; head Centred leaving the wall alone; requiring alt and refusing the word “logo” in it.

---

## 2 · Caption Row

A short label in a 196 px column at the left and the logos filling the 1,056 that is left, all on one line. The most common logo wall on the web, and the only design where type and artwork share a horizontal band.

**Fields** · 1 Row's exactly, three to five items. **`eyebrow` is required in practice** — it is the caption, and with none authored the section draws as 1 Row.

**Controls** · Padding: 64 · 96 · 132. **Label side: Left · Right.** **Rule: None · Between.** Logo size: Small 28 · Medium 36. Count: Three · Four · Five. Treatment. Six.

**Not offered** · a Head control, since the title and sub are drawn when authored; Title size, fixed at Medium 34; Large 48, which beside a 13 px label makes the caption a footnote; Count Six, where six cells inside 1,056 is 156 px each.

**Arrangement** · label 196 · gutter 44 · wall 1,056, cells **336 / 246 / 192** on a 24 px gutter — all whole pixels, which is why the label column is 196 and not 200. **The label is centred on the box's centre line**, not on its own line box and not on a baseline, and is aligned to the outer edge of its column at both sides — never centred in it. The rule is 1 px `border` in the gutter's centre at the box's height, the odd pixel out of the label's side. **The eyebrow moves rather than duplicating: it is never drawn above the title and inline at once.**

**Responsive** · **at 1080 and below the label leaves its column and sits above the wall, left-aligned, 20 px clear, at both values of Label side** — and Label side and Rule stop having an effect while staying enabled. A long eyebrow wraps inside its column and the wall does not move.

**Empty** · **no eyebrow → 1 Row**, named. No title → no accessible name.

**a11y** · **the label is a `<p>`, never a heading** — promoting a 13 px caption would put “Featured in” into every document outline; Label side changes DOM order with no `order` property.

**Flagged** · the 196 / 44 / 1,056 division and all three cell widths; the centre-line alignment; the label wrapping rather than truncating; refusing Large 48 and Count Six; the rule's height and odd pixel; the label going above at 1080 at both sides; refusing to promote the caption to a heading.

---

## 3 · Grid

Six to eighteen logos in rows of equal cells, with or without a hairline matrix. **The design §8.1 was settled for**, and the only one in A11 that draws more rows than it has counts. **Seven controls — §7.6's ceiling, and the only design in A11 at it.**

**Fields** · 1 Row's, six to eighteen items.

**Controls** · Padding · Head: Centred · Flush left · None · Count per row: Four · Five · Six · Logo size: Small 28 · Medium 36 · Large 48, **Large unavailable at Count Six** · **Cells: None · Hairlines** · **Last row: Centred · Left, forced to Left at Cells Hairlines** · Treatment. Seven.

**Arrangement** · at Cells None, cells 306 / 240 / 196 on a 24 px gutter with rows 40 apart. At Cells Hairlines the gutters close and the columns are **324 / 259 / 216, the odd pixel in the last column at Count Five**; cell padding 24; hairlines on the shared edges as `border-left` and `border-top`, **the odd pixel to the cell below and right — A10·3's rule verbatim**; no outer rule, since a frame around the wall is 4 Boxed. **The wrap is authored order and nothing is re-sorted** — not by width, not by class, not to fill the last row.

**Responsive** · six → four at 1080 → three at 834 → two at ≤ 767; hairline columns 251 at 834 and 175 at 390; the matrix follows the grid at every width.

**Empty** · **under six → 1 Row; over eighteen → 13 Dense.** A last row of one is drawn and the counter names the counts that divide.

**a11y** · a `<ul>` on a CSS grid, **never a `<table>` and never marked up as rows** — one flat list of twelve items; hairlines decorative `border`; focus on the box at Cells None and on the matrix cell at Hairlines.

**Flagged** · the 40 px row gap; centring the short last row and **forcing it Left at Cells Hairlines — A11's one forced control value**; the 24 px cell padding; the odd pixel at Count Five; refusing to re-sort; the six-and-eighteen floor and ceiling; the hover surface filling the matrix cell; taking the seventh control.

---

## 4 · Boxed

The whole wall inside one `surface` panel with a hairline and the pack's radius. For a page whose ground is already carrying something, where contained artwork floating on that ground reads as debris. **The design where the radius token finally has somewhere to land.**

**Fields** · 1 Row's, four to twelve items.

**Controls** · Padding · Head: Centred · Flush left · None · **Panel padding: Compact 32 · Comfortable 48 · Spacious 64** (28 · 40 · 52 at 834, 20 · 28 · 36 at 390) · Count per row: Four · Five · Six · Logo size: Small 28 · Medium 36 · Treatment. Six.

**Not offered** · Title size, fixed at Medium 34; Large 48, since the panel is already 96 px of inset at Comfortable; **a Ground value for the panel**, because a panel filled with the section's own ground is 3 Grid at Cells None; a shadow at any value; a head inside the panel, which makes it a card; a link on the panel; hairlines inside it.

**Arrangement** · panel 1,296 wide, `surface` fill, 1 px `border`, pack radius, **no shadow**; inner wall 1,232 / 1,200 / 1,168 by panel padding; cells 290 / 282 / 274 at four, 226 / 220 / 214 at five, 180 / 180 / 174 at six on a 24 px gutter, **the odd pixel to the last cell**; rows 40 apart; head, note and link outside the panel. **Compact 32 is set by the focus ring's clearance**, not by the spacing scale.

**Responsive** · the panel is always the content width and always keeps its hairline and radius, down to a 350 px panel with 20 px of inset. **A short last row is centred at 1440 and left-aligned at 834 and below.**

**Empty** · **under four → 1 Row**, because a panel around three marks is a panel with a hole in it. Over twelve → 3 Grid. No logos → the section does not render, panel and all.

**a11y** · **the panel is a presentational `<div>`: no role, no label, no `tabindex`, not a `<figure>`, not a nested `<section>`**, so the announcement is identical to 1 Row's; the head outside it in the DOM; forced colours keep the border and lose the fill.

**Flagged** · the panel padding scale; Compact 32 set by the ring; the odd pixel to the last cell; refusing Ground, a shadow, Large 48, a head inside and a link on the panel; the panel lifting one step in dark; the short row's two behaviours.

---

## 5 · Cards

One logo per card, every card the same height. **The design that answers §8.4's harder half**: in the other fourteen a linked logo's target is the artwork's own box — about 4,800 px² for a wordmark — and here it is the card, 306 × 112 on a desktop and 135 × 88 on a phone. **It clarifies the target, not the link**: a linked card and an unlinked one still look identical at rest.

**Fields** · 1 Row's, three to twelve items. **This is the design to choose when the logos are links**, and the editor says so when two or more URLs are authored elsewhere.

**Controls** · Padding · Head: Centred · Flush left · None · Count per row: Three · Four · Five · Six · **Card height: Compact 88 · Comfortable 112 · Spacious 136** (80 · 100 · 120 at 834, 72 · 88 · 104 at 390) · **Cards: Surface · Ground** · Treatment. Six.

**Not offered** · Title size, fixed at Medium 34; **Logo size — the box is Medium 36 at Count Three and Four and Small 28 at Five and Six**, because a card is a fixed frame and the artwork's size in it is the design's; a shadow; a lift or scale on hover; a caption inside the card, which is 11 Named's.

**Arrangement** · 1 Row's cells with a card at each, **rows 24 apart rather than 40**, because 40 px between two hairlines reads as a gap in a table; card `surface` or ground fill, 1 px `border`, pack radius, no shadow at either value; the logo centred on both axes. **Both card values keep the hairline** — a card with no edge and no fill is 1 Row.

**Responsive** · six → four at 1080 → three at 834 → two at ≤ 767; **a short last row is left-aligned at every width**, this design's one departure from settlement 1, because cards have edges and a centred pair misaligns visibly.

**Empty** · **a card is never drawn empty and the count never reserves one.** Under three → 1 Row; over twelve → 3 Grid.

**a11y** · **a linked card is `<li><a><img alt></a></li>` with the card's box as the `<a>`** — no click handler on a div, no overlay, no nested link, no title attribute; an unlinked card is not focusable and takes no `tabindex`; targets past 44 px in both axes at every value. **In dark, a logo with no dark file does not get a plate inside its card — the card becomes the plate**, taking the light-mode `surface` and dropping its hairline, keeping its width, height and radius.

**Flagged** · the 24 px row gap; the card height scale; dropping Logo size and tying the box to the count; refusing a shadow, a lift and a scale; **the card becoming the plate**; the short row left-aligned at every width; the identical resting states.

---

## 6 · Split Head

Head, sub, note and link in a 416 column at one side; the wall in the 824 at the other. **A8·6's split and A10·6's division, carried forward verbatim.**

**Fields** · 1 Row's, four to twelve items. **`title` is required in practice** — with none authored the section draws as 1 Row. **This is the design for a long `sub`**: the head column absorbs 178 characters without moving the wall.

**Controls** · Padding · **Head column: Left · Right** · **Title size: Medium 34 · Large 40** · Count per row: Two · Three · Four · Logo size: Small 28 · Medium 36 · Large 48, **Large unavailable at Count Four** · Treatment. Six.

**Not offered** · Head alignment, because the column is always left-aligned inside itself; Head None; Display 48, which is 15 Big Type's; a sticky head; a rule between the columns.

**Arrangement** · **416 · 56 · 824 = 1,296**, with cells 400 at two and 188 at four on a 24 px gutter, and **258 on a 25 px gutter at three — the one gutter in A11 that is not 24**, a whole pixel rather than a fraction across three cells. **The block's width never changes with the count.** Both columns top-aligned, **the taller setting the height, the head never sticky, never vertically centred and never stretched**. The note and link at the foot of the head column, 24 px under the sub. A short last row at the left of the block.

**Responsive** · **the head column goes above the wall at 1080, and the note and the link move with it — out of the head's foot and under the wall.** That is a real DOM reorder, not a repositioning: above 1080 the sequence is title, sub, note, link, wall; below it, title, sub, wall, note, link. Head column then stops having an effect and stays enabled.

**Empty** · **no title → 1 Row.** No sub → the foot sits 24 px under the title. No note or link → the head column closes up and the wall sets the height.

**a11y** · a flex row, neither column a landmark; Head column changes DOM order with no `order` property; **this design never exists without an accessible name**, because no title means 1 Row.

**Flagged** · **the 25 px gutter at Count Three**; the foot living in the head column and moving at 1080; the column left-aligned at both sides; offering Large 40 and refusing Display 48; refusing a sticky head, a rule and Head None; the short row at the left; the dark plate taking the treatment's opacity.

---

## 7 · Contrast Band

1 Row inverted onto the `contrast` token. **It produced the category's sharpest finding, and it amends settlement 3: `logoDark` is not a dark-mode file, it is a dark-ground file.** This band reads it *in light mode*, where the ground is `#232019` — and in dark mode, where Paper's contrast is a pale `#EDE7DA`, it reads the light file instead. **The band always wants the opposite file from the mode it is in**, and a site that never turns dark mode on still needs the second upload here.

**Fields** · 1 Row's, three to twelve items. **`logoDark` is effectively required**, and the editor's wording differs in this design alone: “this band needs the version for a dark background, which your site will use in light mode too”.

**Controls** · **Band padding: Compact 44 · Comfortable 64 · Spacious 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390) — **it replaces the section Padding control; the band is the section** · **Band width: Full bleed · Inset** · Head: Centred · Flush left · None · Count: Three · Four · Five · Six · Logo size: Small 28 · Medium 36 · Treatment. Six.

**Derived from one token pair** · muted = the carried colour at 72% (`#BEBCB7` light, `#57544D` dark); hairline = 18%, never drawn; **hover surface = 10%** (`#3A362F` / `#D4CFC3`), because the pack supplies a hover surface for a ground and a surface but not for a band; **Muted treatment = 70% in both modes**, since the band's lightness does not follow the mode's. **The accent is unavailable at 2.3:1 and links and rings take the carried colour.** No shadow at any value.

**Arrangement** · 1 Row's cells at Full bleed; **274 at four and 214 at five at Inset**, where the band's 64 px of horizontal padding comes out of the 1,296 leaving an inner 1,168. The horizontal inset steps 64 · 40 · 20 with the width. Logo size Large 48 is not offered — a band is a short section by construction.

**Responsive** · 1 Row's rule plus the band's own padding step. At Full bleed the band keeps the page margins for its content and loses them for its ground; at Inset it keeps the content width and the radius at every breakpoint.

**Empty** · as 1 Row. **A logo with no `logoDark` is drawn on the plate in light mode and needs none in dark**, so the band can never need a plate in dark — the one asymmetry in the category.

**a11y** · the band is a `background-color` on the section rather than a wrapper, so switching to 1 Row changes nothing announced; **the `<picture>` media query is inverted in this design only**, with the alt on the single `<img>` underneath so the announcement is identical in both modes. Title 15.5:1 / 14.8:1; muted 8.6:1 light and 6.1:1 dark. Forced colours drop the band; **print drops the band and draws the light files.**

**Flagged** · **reading `logoDark` in light mode and `logo` in dark**; the derived hover surface at 10%; Muted at 70% in both modes; the Inset cell widths; refusing Large 48; the inverted `<picture>` query; the editor's different wording; print changing which file is drawn.

---

## 8 · Marquee

Eight to twenty-four logos on a track that runs continuously in one or two rows. **The category's one behaviour and its only motion**, and **the one design in A11 with no cell grid at all** — a track has no columns, so logos sit at natural width on a fixed gap and only their heights are normalised.

**Fields** · 1 Row's, eight to twenty-four items. **Eight is the floor because a shorter list needs three copies to fill 1440 and the same mark appears twice on screen.** URLs are allowed and advised against, and the panel says why: the target moves.

**Controls** · Padding · Head: Centred · Flush left · None · **Rows: One · Two** · **Speed: Slow · Steady · Brisk** · **Edge: Fade · Hard** · Treatment. **Six, and the pause button is not one of them.**

**Not offered** · Title size, fixed at Medium 34; **Logo size — Medium 36 at Rows One and Small 28 at Rows Two**; Count, because a track has no cells; a direction control; **pause on hover**; a control to remove the pause button; a gradient overlay instead of a mask.

**Arrangement** · full-bleed track, content starting on the page margin, **logos at natural width on a fixed gap of 64 · 56 · 40**; row gap 32 at Rows Two; fade 96 · 72 · 48. **The behaviour:** the list rendered twice — three times when narrower than the viewport — the copies `aria-hidden` with empty alts, translated by the list's own width and reset with no easing, so the seam is one ordinary gap. **20 · 32 · 48 px per second, linear, constant at every width**, so a narrower window loops sooner — stated, not corrected. **Focus pauses the track; hover does not.** At Rows Two the set is split in authored order, not interleaved and not balanced by width, and one button stops both rows.

**Responsive** · **Rows Two becomes Rows One at 1080 and below**, the control staying enabled. The pause button sits on the right page margin above 767 and under the track on the left margin below it, keeping its 38 px box.

**Empty** · under eight → 1 Row. Over twenty-four → the first 24, stated. **At reduced motion → 3 Grid at the count that fits the width**, with no track, fade or button.

**a11y** · **2.2.2 is met by a `<button aria-pressed>` that cannot be turned off**, named “Pause the logo wall” / “Play the logo wall”, 38 px in a 44 px target, **first after the heading in the DOM** so a keyboard reader meets the control before the moving content. **Hover is not that mechanism** — it does not exist for a keyboard or touch reader. 2.3.3 is met by rendering as 3 Grid. **The duplicate copies' empty alts are the one correct `alt=""` in A11.** Print draws the wrapped wall.

**Flagged** · the 64 px gap; the track starting on the page margin; **the pause button, its position, and its exemption from the treatment**; the three named speeds and their pixel rates; the constant speed across widths; the 96 px mask; the copy count and the eight-logo floor; splitting in authored order; one button for two rows; **handing off to 3 Grid under reduced motion**; focus pausing and hover not.

---

## 9 · Rail

One line of logos wider than the window, scrolled by the reader. **The distinction from 8 Marquee is the whole design: a marquee moves whether anyone is watching, and a rail moves only when a hand causes it.** The one design in A11 with a precondition, and **the one that always spends the accent**, on its arrows' hover and focus.

**Fields** · 1 Row's, six to twenty-four items. **The precondition is measured at render, not counted**: if the list is not wider than the viewport the section draws as 1 Row, so the same list can be a rail at 834 and 1 Row at 1440 — **the only hand-off in A11 that depends on the window rather than the content.**

**Controls** · Padding · Head: Centred · Flush left · None · Logo size: Small 28 · Medium 36 · Large 48, **no condition on Large** · **Gap: Tight 40 · Comfortable 64 · Wide 96** (32 · 56 · 80 at 834, 24 · 40 · 56 at 390) · **Arrows: At the ends · Above the rail** · Treatment. **Six, and the arrows are not one of them.**

**Not offered** · Title size; Count, because a rail has no cells; **scroll snapping**, since a snap point has to be a logo's edge and a 216 px wordmark and a 26 px mark cannot share one; a dot or page indicator; a drag cursor; auto-advance, which is 8 Marquee; removing the arrows above 767.

**Arrangement** · full-bleed track with **the page margin as padding at both ends**, so the first and last logo line up with the title and the last never stops against the window; logos at natural width on the chosen gap; a 96 · 72 · 48 px mask **at an overflowing end only**, so the fade is the affordance and the arrows the mechanism. Arrows 38 px `surface` icon buttons on the page margins over the fade, or a pair 16 px above the track at Above the rail. **One press is the viewport minus 96 px**, so the leading logo is still on screen after it. **Position is never persisted or restored.**

**Responsive** · **at ≤ 767 the arrows are dropped and the rail is scrolled by touch**, Arrows staying enabled with no effect; the track keeps `tabindex="0"` at every width.

**Empty** · **everything fits → 1 Row**, named.

**a11y** · **the track is a `role="group"` with `tabindex="0"` and a name from the title** — 2.1.1, whatever the buttons do — and with no title the name is the generated “Logo wall, scrollable”, the one generated string in A11. The arrows are `<button>`s named “Scroll left” / “Scroll right” with **`aria-disabled` rather than `disabled`**, drawn at 40%, so the pair never changes width and focus is never dropped. **No hand-off under reduced motion — the motion is the reader's own**; `smooth` becomes `auto`. A linked logo is an ordinary link and tabbing scrolls it into view, so unlike 8 Marquee there is nothing to chase. Glyph 15.8:1 / 15.1:1 resting, **accent at 3.3:1 / 6.3:1 on hover and focus**, disabled at 4.1:1 / 3.9:1.

**Flagged** · the viewport-minus-96 press; the page margin as tail padding; the fade at an overflowing end only; **refusing scroll snap**; the generated name; `aria-disabled` at 40%; dropping the arrows below 767; never persisting the position; Large 48 unconditional; **the measured precondition and its window-dependent hand-off.**

---

## 10 · Slim

A band 92 to 148 px tall with no head, no note and no link: three to six marks and nothing else. What sits directly under a hero or above a footer. **The one design in A11 with no type in it at all.**

**Fields** · three to six items reading `logo`, `logoDark`, `alt`, `url`, **and nothing else in the whole section**. **Ten of the fourteen fields are kept and not drawn**: `eyebrow`, `title`, `sub`, `note`, `linkLabel`, `linkUrl`, `lede`, `leadLabel`, `restLabel`, `caption`. The panel names the count and says how many 1 Row would draw.

**Controls** · **Padding: Compact 32 · Comfortable 44 · Spacious 56, the same at every width** · Alignment: Spread · Left · Centred · Count: Three · Four · Five · Six · Logo size: Small 28 · Medium 36 · **Rule: None · Above · Both** · Treatment. Six.

**Not offered** · a head at any value; a note; a link; a caption; Large 48, since a 48 px box in a 32 px padding is a 112 px band; a surface panel; a ground of its own; **a second row.**

**Arrangement** · **no cell grid** — logos at natural width, `space-between` at Spread and a fixed 64 px gap at Left and Centred. **Spread's gaps are unequal by construction and that is the design**: equal gaps with unequal artwork is what a cell grid is for, and 1 Row is the cell grid. The rule is a 1 px `border` at the content width **inside the page margins**, never inset further, never the accent. **Band height 92 at Small/Compact, 124 at Medium/Comfortable, 148 at Medium/Spacious with two rules.**

**Responsive** · the padding does not step; the box does. **At ≤ 767 the band becomes two across at 163 on a 24 px gutter and Alignment has no effect while staying enabled.** At 834 Spread still holds at five, the gaps redistributing rather than scaling. **The design's contract is lost on a phone and the panel says so: five marks stack to about 190 px.** The only design in A11 whose defining property is lost at a breakpoint rather than adjusted.

**Empty** · there is nothing optional to be empty. Under three → 1 Row. **Over six → the first six, stated; the band never wraps.**

**a11y** · **no `<h2>`, no `aria-label` and no landmark name at any setting** — A9·13's and A10·13's position taken a third time; the rule a `border` and never an `<hr>`; **no tab stop, no state, no behaviour and no accent pixel with no URLs authored.** With no title, note or link, **the brand names are the section's entire content for a screen reader**, which is the strongest case in the category for alt being required.

**Flagged** · the three band heights; **the padding not stepping with width**; the unequal gaps at Spread; the rule keeping the page margins; Above as the default; refusing Large 48, a head and a second row; naming the count of undrawn fields; **the contract lost at ≤ 767 and stated rather than adjusted.**

---

## 11 · Named

A caption under each logo. **The only design in A11 that draws `caption`**, and the answer to what a caption is for: not the mark's name, which the artwork already says, but **what that name did**. It carries **A11's one equalisation.**

**Fields** · 1 Row's section fields; three to twelve items reading `logo`, `logoDark`, `alt`, `url` **and `caption` ≤ 40**.

**Controls** · Padding · Head: Centred · Flush left · None · Count per row: Three · Four · Five · Logo size: Small 28 · Medium 36 · **Captions: Centred · Left** · Treatment. Six.

**Not offered** · Title size, fixed at Medium 34; Count Six, where a 40-character caption is four lines in a 196 px cell; Large 48, since a 48 px mark over a 13 px caption is a headline over a footnote; a caption above the logo; a caption beside it; a second caption line; a `<figcaption>`.

**Arrangement** · 1 Row's cells at 416 · 306 · 240; caption 13 px `text-muted` **at every width**, 12 px under the logo box, on the cell's width, wrapping and never truncated; **rows 48 apart rather than 40**, because a row here ends in type. **The caption block is equalised to the tallest caption in its row — per row, not per wall** — so the logos share a centre line whatever their captions do; equalising the whole grid to its worst caption would cost every short caption twice over. **At Captions Left the logo ranges left with the caption — the one place in A11 a logo is not centred in its cell.**

**Responsive** · three across at 834 and two at ≤ 767; **the caption stays 13 px and the equalised block grows instead**; row gap 48 → 40 → 32, because the caption block does more of the separating as it grows. A 40-character caption is two lines at 306, three at 234 and four at 163, and **the panel states that cost rather than clamping.**

**Empty** · **a logo with no caption keeps the reserved space and nothing is put in it** — no dash, no repeat of the name, no hidden text. **No caption on any logo → 1 Row.** Over twelve → 3 Grid, which draws no captions and says so.

**a11y** · the cell an `<li>` with an `<img>` and a `<p>`, **never `<figure>`/`<figcaption>`** — a figure is a self-contained unit referenced from elsewhere and a logo in a wall is a list item; alt then caption as two strings with **no `aria-describedby`**; where a URL is authored **the `<a>` wraps the image and the paragraph**, making the cell the target and the caption part of the name; the reserved space empty in the DOM. Caption 5.6:1 / 6.0:1, **rising to 15.8:1 / 15.1:1 on a linked cell's hover**, where it resolves to `text` — the only hover in A11 that changes any type.

**Flagged** · the 12 px gap and the 48 px row gap; **the per-row equalisation**; the 40-character ceiling and the 28-character advice; the rule that a caption is not the name; the logo ranging left; the link wrapping both elements; refusing Count Six, Large 48 and `<figure>`.

---

## 12 · Tiers

Two groups at two box sizes: the first one, two or three logos at Huge 64 or Large 48, the rest at Small 28. **The only design in A11 that draws two logo sizes in one section**, which means it is the only one that breaks the rule the other fourteen exist to keep — that every mark on a wall carries the same weight. It breaks it on purpose, where a site has a real hierarchy to state.

**Fields** · 1 Row's section fields **plus `leadLabel` ≤ 20 and `restLabel` ≤ 20, which no other design draws**; four to sixteen items. **The first N items in the repeater are the lead tier** — A10·5's rule — and **there is no per-logo tier field**: a site reorders the repeater instead. Both labels are optional and either may be drawn alone.

**Controls** · Padding · Head: Centred · Flush left · None · **Lead count: One · Two · Three** · **Lead size: Large 48 · Huge 64** (40 · 48 at 834, 32 · 40 at 390) · **Rest count per row: Four · Five · Six** · Treatment. Six.

**Not offered** · Title size, fixed at Medium 34; **a size for the rest tier, fixed at Small 28** — a control over both would let a site set them equal and lose the hierarchy it chose the design for; a third tier; a rule between the tiers, which makes two sections out of one; a per-logo tier field; a label that is a heading.

**Arrangement** · **the lead tier has no cell grid** — natural widths on a 96 px gap, **flush left at Two and Three and centred at One**, the only alignment in A11 that changes with a count — and **the rest tier has 1 Row's cells** at 306 · 240 · 196, rows 32 apart. Tier gap 64; label to group 16; labels the eyebrow component at 13 px uppercase tracked `.08em` muted. **A short rest row agrees with the lead tier's alignment.**

**Responsive** · lead 48 · 64 → 40 · 48 → 32 · 40; rest 28 → 26 → 24; tier gap 64 → 56 → 48. **At ≤ 767 the lead tier stacks one mark per row — the stated exception to A11's never-one-across floor.** **The ratio between the tiers narrows from 2.3× to 1.7×** and the panel states it rather than forcing it, which would push the rest tier under its 24 px floor.

**Empty** · under four in total → 1 Row; over sixteen → 13 Dense, which has no tiers and says so. **A missing label leaves its list unnamed and nothing generated.** At Head None **the lead label does not become the section's name.**

**a11y** · **two `<ul>`s, each `aria-labelledby` its own label `<p>`**; the labels `<p>`s and never `<h3>`s, since promoting them would put them in the page's outline as subheads; reading order the authored order. **The ranking is carried by size alone, which is not available non-visually — so the labels are the only non-visual signal**, and the editor says so: “Without labels, the tiers are visual only.” A stated loss, not a solved problem.

**Flagged** · the 64 px tier gap and 16 px label gap; the lead tier's natural widths and 96 px gap; **the lead centred at One and flush left at Two and Three**; fixing the rest tier at Small 28; capping Lead count at three and the total at sixteen; refusing a rule, a third tier and a per-logo tier field; **the lead tier going to one across at ≤ 767**; the ratio narrowing with width.

---

## 13 · Dense

Twelve to twenty-four marks at Tiny 22, six to ten across. For a site whose honest answer is “a lot of them”. **The one design in A11 where the aspect classes stop governing.**

**Fields** · 1 Row's, twelve to twenty-four items. **Twenty-four is the ceiling of `logos[]` in the whole category and this design is where it is reached.** **The `note` earns its place here** — “and four more asked not to be listed” is a sentence only a dense wall needs.

**Controls** · Padding · Head: Centred · Flush left · None · **Count per row: Six · Eight · Ten** · **Row gap: Tight 24 · Comfortable 32** · **Last row: Left · Centred, Left the default — the reverse of 3 Grid** · Treatment. Six.

**Not offered** · Title size, fixed at Medium 34; **Logo size — the box is Tiny 22, off the ladder, and this is the only design that uses it**; a gutter control; hairlines, which are 3 Grid's; cards; a caption.

**Arrangement** · cells **196 · 141 · 108** on a fixed 24 px gutter, all whole pixels; box Tiny 22; rows 24 or 32 apart. **At Count Ten the 84 px max width beats the 22 px box for every Wide mark, so the aspect classes stop governing and `object-fit: contain` decides** — marks draw at 12 to 18 px, and the panel states it: “At ten across, wide wordmarks draw at about 14 px. Eight across keeps them at 22.” The wall still reads level because every cell is identical and every mark is centred in one; **it reads as a texture rather than as twelve marks, and that is the design.** A linked cell takes 8 px of padding for its hover surface, so a 22 px mark still gets a 38 px target; **the plate's padding steps to 8 at this box size.**

**Responsive** · **all three counts become six across at 834 and four across at ≤ 767 — the only design in A11 that keeps more than two across on a phone, and the only one whose gutter tightens.** At 834 cells 116 on 24 with a 20 px box; at ≤ 767 cells 78 on a 12 px gutter with an 18 px box and rows 16 or 20 apart. **Three counts collapsing to one drawing at 834 is stated rather than hidden.**

**Empty** · **under twelve → 3 Grid**, which draws the same marks at Medium 36. Over twenty-four → the first 24, stated. A short last row draws at the count's cell width with the empty cells absent rather than reserved.

**a11y** · one flat `<ul>` of up to twenty-four `<li>`, **no grouping and no skip link** — the list-level jump is already in the reader's software. **A linked cell's target is 157 × 38 at eight across and 94 × 34 on a phone, past 44 px in one axis and not the other — stated as a limitation**, with 5 Cards named for a wall of links; padding the cell to 44 would take the wall back to two across and undo the design. **Twenty-four marks means twenty-four alts and no structure between them**, a stated cost of choosing density. At Tiny 22 the editor's 3:1 advice matters more than anywhere else in A11.

**Flagged** · Tiny 22 and dropping Logo size; the 196 / 141 / 108 cells and the fixed gutter; **the aspect classes giving out at Count Ten and saying so**; Last row defaulting to Left; the 8 px hover padding; the plate's 8 px padding; four across and a 12 px gutter at ≤ 767; the twelve-and-twenty-four floor and ceiling.

---

## 14 · Inline

Two to four marks set inside a sentence, on the line. **The one design in A11 where a logo has a grammar** — the object of a verb rather than an item in a list — and the one that reads `lede`. **The only design that does not draw `url`, and the only one with no arrangement to collapse.**

**Fields** · `eyebrow`, `title`, **`lede` rich text ≤ 280**, `note`, `linkLabel`, `linkUrl`. `sub`, `leadLabel`, `restLabel` and `caption` kept, not drawn. Two to four items reading `logo`, `logoDark`, `alt`; **`url` kept and not drawn — the only field any design in A11 ignores outright.** **The lede carries one chip per mark, inserted from the toolbar**; a mark cannot be typed, a chip is one atomic character to the cursor, and deleting a logo takes its chip with it. Allowed inside the lede: inline links, bold, italic. Refused: lists, headings, code, a second paragraph, a blockquote, **and any image that is not a chip.**

**Controls** · Padding · Head: Centred · Flush left · None · **Measure: Wide 780 · Narrow 620** · **Lede size: Body 20 · Large 24** · **Logo height: Inline 24 · Large 32** · Treatment. Six.

**Not offered** · Title size, fixed at Medium 34; Count, since the chips are the count; **a link on a mark** — a 24 px underlined mark inside a 20 px sentence reads as a typographic accident and the target would be a 90 × 24 sliver mid-paragraph; a caption; an alignment for the marks, which the sentence decides.

**Arrangement** · one `<p>` on the measure with **leading set to the logo height plus 12 — 36 at Inline 24, 44 at Large 32, the same at every width**; each mark an unbreakable inline run the sentence breaks around; **each mark centred on the line's x-height, not set on the baseline**, because a wordmark on the baseline sits high against 20 px text and a square mark higher still; aspect classes still governing at 100 / 88 / 72%. The two sizes are a pair the panel recommends together; **Body 20 with Large 32 makes the mark taller than the line's ascender, a deliberate effect and not disabled.** **In dark a plated mark makes the leading the plated height plus 12**, a visibly taller line, and the panel warns about it.

**Responsive** · **nothing collapses, because a paragraph reflows.** Wide 780 → 690 at 834 → the column at 390; Narrow 620 holds until the column is narrower. **The lede size, the logo height and the leading do not step at any width** — the only design in A11 whose type and artwork are the same size on a phone as on a desktop, because a mark inside running text cannot step without the leading stepping with it. **The one design a 350 px column does not damage.**

**Empty** · **no lede → 1 Row.** **A logo with no chip is not drawn and nothing is appended**; the panel reports “2 of 3 placed”. Five or more logos → 1 Row, because a sentence with five marks in it is a list with punctuation.

**a11y** · one `<h2>` and one `<p>`, **no list anywhere — the only design in A11 without one**; each mark an `<img>` with its required alt inside the paragraph so the sentence reads straight through, **the strongest argument in the category for alt being the brand's plain name**; the marks not `<strong>`, `<em>`, `<cite>` or links. **The lede is `text` at 15.8:1 / 15.1:1, not muted**, because it is the section's reading matter. **The chip's dashed outline and 6 px of padding are editor-only and not published** — the one place in A11 where the editing view is not the published view.

**Flagged** · the leading rule and both values; **the x-height centring and its three offsets**; the chip mechanism's editor-only treatment; **refusing to draw `url`**; refusing a non-chip image in the lede; the four-mark ceiling and both hand-offs; **the plated-mark leading rule**; the lede taking `text`; nothing stepping with width.

---

## 15 · Big Type

A title at Display 48 on a 1,040 measure with three marks at Huge 64 beneath it, or four at Large 48. **The category's loudest design, and the only one where the type is louder than the artwork.**

**Fields** · `eyebrow`, `title`, `note`, `linkLabel`, `linkUrl`; **`sub` kept and not drawn — the only design in A11 that draws the eyebrow and refuses the sub**, because a 17 px paragraph between a 48 px line and a 64 px mark is read by nobody. Three or four items. **This is the design the title's 104-character limit was worth checking**: three lines at Display 48 on 1,040, two at Large 40.

**Controls** · Padding · **Title size: Large 40 · Display 48 — the only Display 48 in A11** · Count: Three · Four · **Logo size: Large 48 · Huge 64, Huge unavailable at Count Four** · Alignment: Flush left · Centred · Treatment. Six.

**Not offered** · Head None, because the title is the design; the sub; Count Two or Five; a caption; a rule; a hover plane on an unlinked mark.

**Arrangement** · **title on a 1,040 measure — the only measure in A11 that is not 780 or 620** — at 48/1.1 or 40/1.12, because 48 px on 780 is four words to a line; eyebrow 12 px above it; **head to wall 64 rather than 48**, so a Display line does not read as a caption for the marks; cells 416 or 306 on a 24 px gutter. **Huge 64 in a 416 cell gives a 392 px max width so every mark is decided by the box; at Count Four's 306 the 282 px max width would decide the height of every Wide mark, which is why Huge is disabled there rather than discouraged.** Alignment Centred centres the head and the foot and leaves the wall alone. **A plated mark at Large 48 is 62 px and at Huge 64 is 78, taller than its box, and the row grows to that height while every mark keeps the centre line.**

**Responsive** · three across holds at 834 and becomes two at ≤ 767; title 48 → 34 → 28 and 40 → 30 → 28; box 64 → 40 → 32 and 48 → 34 → 32; head gap 64 → 48 → 40. **At ≤ 767 both title sizes draw at 28 and both logo sizes at 32 — two pairs of control values drawing the same thing**, A10·15's finding for a different reason, stated rather than disabled. **At 834 the 210 px max width decides the two widest wordmarks even at Count Three**, the first width where that happens here.

**Empty** · eyebrow, note and link → absent. **No title → 1 Row**, because the title is the design. **Two logos → 1 Row; five or more → 3 Grid.**

**a11y** · **the title is an `<h2>` at 48 px and never an `<h1>` — size is not level**; otherwise 1 Row's structure exactly, so switching between the two changes nothing announced. **A linked mark's target is 416 × 64, the largest in A11 outside 5 Cards** — a by-product of the size rather than the point, and the panel still names 5 Cards for a wall of links. At 400% the title is 28 and the wall two across, wrapping rather than overflowing because the measure is a max-width. At Huge 64 the 3:1 advice matters least in the category.

**Flagged** · **the 1,040 measure and the 64 px head gap**; offering Display 48 here alone; disabling Huge 64 at Count Four; refusing the sub, Head None, Count Two and Count Five; the three-logo floor; **the plate exceeding its box and the row growing rather than the plate shrinking**; both pairs converging at ≤ 767.

---

## 16. What A11 settled, in one place

**§8.1 — logo counts and row wrapping, including the awkward final row.** **Count is a per-row count, never a total**: Three 416 · Four 306 · Five 240 · Six 196 on a 24 px gutter, A10's divisions extended by two, with the total whatever the site authored between three and twenty-four. **Rows wrap in authored order, 40 px apart, and the short last row keeps the cell width** — stretching it is refused, because a wider cell is a bigger logo box. **Centring it is the default in four designs and four others depart with a stated reason.** **A last row of one is drawn, warned about, and not prevented**: the editor's counter reads “7 logos at six across leaves 1 on the last row — five across leaves 2, four across leaves 3”. Rebalancing was refused, because it makes the theme overrule a count the user set; stretching was refused; hiding was refused. **Four designs have no cell grid at all** and settle nothing here, because a track, a rail, a spread band and a lead tier have no rows to wrap.

**§8.2 — mixed aspect ratios, normalised without distortion.** Every logo sits in a box: a fixed height from the ladder, a max width of the cell minus 24, `object-fit: contain`, centred on both axes. **Nothing is cropped, stretched, upscaled or altered in ratio, ever.** **Normalising by box height alone is the defect**, so the theme computes three aspect classes from the file's intrinsic ratio and draws **Wide ≥ 3:1 at 100% of the box, Regular 3:1–1.4:1 at 88%, Square under 1.4:1 at 72%** — with no control over them. **Logos share a horizontal centre line, not a baseline.** SVG preferred, PNG at 2× the box. **13 Dense is where this gives out**: at Count Ten the 84 px max width beats the 22 px box for every Wide mark, the classes stop governing, and the design says so rather than pretending otherwise.

**§8.3 — greyscale, muted and full colour, checked in light and dark.** Three named values, **Greyscale the default** — the value that makes twelve packs and two modes one problem instead of twenty-four. Muted is greyscale at 64% light / 74% dark, and 70% in both on a band. **`invert()`, blend modes, duotone, an accent tint and per-logo overrides are all refused.** **A dark ground needs a second file, not a filter**: `logoDark`, and with none the logo takes a plate carrying the pack's **light-mode** `surface` at the pack radius with 12 px of padding — the one place in the library a dark section draws a light-mode token, deliberately visible because the editor is asking for a file. **7 Contrast Band amends the rule: the test is the ground, not the mode**, so that band reads the dark file in light mode and the light file in dark. **§7.4 cannot be applied to this control** — the theme cannot measure an uploaded file, so Muted is never disabled and the editor carries the 3:1 non-text advice.

**§8.4 — whether logos are links, and whether the wall carries a caption.** **A link is per logo and optional; the wall is never one link; mixed is the ordinary case.** One hover rule at all three treatments: the cell takes the pack's hover surface at the pack radius and the treatment resolves to full colour, 160 ms. **The resting state gives no sign of which logos are links** — a stated cost in all fifteen, and 5 Cards exists to make the *target* clear rather than the link. **`alt` is required, is the brand's name, and never contains the word “logo”.** **“Caption” is two fields**: the section's `note` under the wall, drawn by eleven designs, and the per-logo `caption`, **drawn by 11 Named alone** and kept undrawn by the other fourteen with the count stated.

### The seven amendments the drawn designs forced on the proof

1. **The plate is about the ground, not the mode.** A11-0 states it as a dark-mode fallback; **7 Contrast Band reads `logoDark` in light mode** and `logo` in dark, so the theme's test is whether the ground behind the logo is dark. A site that never turns dark mode on still needs the second file for that band.
2. **The plate is not always inside the box.** It is inside the box in nine designs; **5 Cards makes the card itself the plate**; **13 Dense drops its padding to 8 at Tiny 22**; **12 Tiers and 15 Big Type let it exceed the box at Large 48 and Huge 64, the row growing to fit** while every mark keeps the centre line; **14 Inline lets it set the paragraph's leading.**
3. **The never-one-across floor has one exception.** **12 Tiers' lead tier stacks one mark per row at ≤ 767**, because two 40 px marks on a 350 px column is 175 px each and the lead stops leading. **13 Dense goes the other way** and keeps four across at 78 on a 12 px gutter.
4. **The 24 px gutter has two exceptions.** **6 Split Head opens it to 25 at Count Three** to keep the cells equal inside its 824 block, and **13 Dense tightens it to 12 at ≤ 767.** Every other gutter in the category is 24.
5. **Four designs have no cell grid**, not one: 8 Marquee, 9 Rail, 10 Slim and 12 Tiers' lead tier. A11-0's arrangement rules apply to the other eleven.
6. **The short-last-row default is not universal.** 1 Row, 3 Grid, 7 Contrast Band and 15 Big Type centre it; **4 Boxed centres at 1440 and left-aligns below, 5 Cards left-aligns at every width, 6 Split Head left-aligns inside its block, and 13 Dense defaults to Left.** Each states why.
7. **A11 has one forced control value and it is 3 Grid's:** at Cells Hairlines the last row is Left whatever Last row says, because a centred cell in a hairline matrix puts a cell wall where no column edge is.

### The category in one paragraph

A11 is fifteen arrangements of a component that is one image in a box, where the image belongs to somebody else. **Eleven designs draw a row or grid of equal cells; four do something else** — 8 Marquee moves it, 9 Rail is moved, 10 Slim spreads it, 14 Inline dissolves it into a sentence. **Four fields are read by one design each**, and each of those designs hands off to 1 Row when the field is missing. **Eleven designs hand off to 1 Row** in one condition or another, and 9 Rail's hand-off is decided by the window rather than the content. **The one thing no design can touch is the artwork**: twelve packs change the ground, the type, the hairlines and the radius, and the logos are identical in all of them — which is why Greyscale is the default, why the aspect classes exist, and why the honest answer to a dark ground is a second upload rather than a filter.
