# A12 About and Team — written specification

15 designs · Paper pack · drawn in this project as `A12-1 Grid.dc.html` … `A12-15 Groups.dc.html`, with the category's shared artefacts in `A12-0 Category Proof.dc.html`.

Read `A12-0` first. It carries the four settlements §8 asks A12 to make, the person card, the two photo families and their ladders, the rules all fifteen share, the fifteen-field shared list, the roster, the twelve people every frame draws, the tokenisation proof across three packs and the stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times, plus the amendments the drawn designs forced on the proof.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**A12's finding, stated first: this is the first category whose list has two sources.** A site can author `people[]` by hand, or point the section at Ghost's authors, and **the fifteen designs cannot tell which they were handed**. Most of A12's decisions come from that: a role that Ghost does not store, a bio with no length limit, an author page that may or may not be published, a photograph that may be a 400 px avatar. It is also the first category where the missing image is a face. A11 answered a missing logo with a second upload; a missing photograph cannot be answered that way, so **the initials block is a first-class state here rather than a fallback**, and a row mixing photographs with initials is the ordinary case. **Flagged**, and the category's headline finding.

**The person card is A12's one new component: photo, name, role, bio, in that order, in the DOM, in all fifteen designs.** What varies is whether the photograph sits above the text or beside it; 10 Directory draws no photograph at all. **A design never re-orders the parts**, so switching designs never changes what a screen reader hears about a person. The name is set in the pack's **body** font at 17/600, rising to 20 where the photograph is large enough to carry it — twelve names in a display face is twelve headlines, and the section already has one. Role 14 in `text-muted`, bio 15/1.6 in `text-muted`. **There is no card fill, border, shadow or radius on a person**: 2 Cards is where a person gets a plane, and it is the only design in A12 with one. **Flagged**.

**Two photo families, and a design offers one of them, never both.** **Circle** — A1·14's avatar at scale: Small 56 · Medium 72 · Large 96 at 1440; 48 · 64 · 80 at 834; 44 · 56 · 64 at 390. **Crop** — A8·8's named crops, the box being the cell's width and the height following the ratio: Portrait 4:5 · Square 1:1 · Landscape 3:2. **No design offers a control that switches between them**, because that control would move every other element on the frame. Two off-ladder sizes exist and each is flagged on its frame: **32 px in 11 Slim**, the smallest face in A12, and **44 px at Count Eight in 9 Faces**. The crop is named and never computed, `object-fit: cover`, centred, at the pack radius; **a circle is `border-radius: 50%` and does not take the pack radius**, which is the one place a pack's radius token has no effect in this category. **Refused in both families: a ring, a border, a shadow, a duotone, a greyscale filter, a hover zoom and a focal-point control** — with two stated exceptions: 6 Portraits' scrim under overlaid type, and 11 Slim's 2 px `background` ring, which exists only where overlapped circles touch. Upload advice, not a limit: 2 × the drawn box on its longest edge. **Flagged**, the whole ladder.

**The initials block is the photograph's equal, not its apology.** The pack's **hover surface** (`#F4F0E8` in Paper light, a derived `#2A251E` in dark), the family's own shape, and **initials in the pack's heading font at 0.34 × the box height in `text-muted`**, tracked `.02em`. Two letters: the first letter of the first word and the first letter of the last word; one-word names take one letter; particles are not skipped, so “van der Meer” gives VM. **Refused: a silhouette icon, a generated illustration, a hashed hue per person, an empty box, and the site's own logo in the hole.** **A row that mixes photographs and initials is the ordinary case and nothing marks the difference** — same box, same size, same position in the card. **Flagged**.

**`role` is 48 characters and wraps rather than truncating. `bio` is 240 in a card, 400 in a full-width row, and the section's `body` carries 900 for one person in 8 Founder.** **A person with neither is drawn as a name alone** — no “Team member”, no dash, no reserved line, no italic “Bio to come”. **The row's height comes from its tallest card and a short card sits at the top of its cell**, never stretched and never vertically centred against its neighbours — amended once, by 2 Cards, which stretches a card to its row's height because a card has a visible edge. **Ghost has no role field**: at Source Ghost the role line is empty unless the site authors one, and the theme does not press `location` or `website` into service as one. **Ghost's bio has no length limit, so an over-length Ghost bio is clamped by line rather than by character** — three lines in a card, four in a row, six in 8 Founder — with no ellipsis and no “more” link. **Flagged**, every limit and every clamp.

**Count is a per-row count, never a total** — Three 416 · Four 306 · Five 240 on a 24 px gutter across 1,296, A10's divisions inherited a third time; **Six 196 and Eight 141 are offered in 9 Faces alone**. The total is whatever the site authored, **one to twenty-four**, and 24 is reached in 9 Faces and 10 Directory only. **The short last row keeps the cell width and is left-aligned in every design in A12** — a category-wide departure from A11, where centring was the default in four designs, and the reason is that these cells are people: one person centred under a full row reads as a rank the site did not author. Stretching the last row is refused, because a wider cell is a bigger photograph. **Rebalancing rows, hiding the orphan and re-sorting the list are all refused**; the editor's counter names the counts that divide. **A team of one hands off to 8 Founder from every grid design; a team of two is drawn as two cells at the count's width.** **Flagged**, and A12's headline settlement.

**The name is the link. Never the card, never the photograph.** A card-sized target would make the whole person clickable, and a person is not a call to action. Authored: `url`, one per person, optional. From Ghost: the author's own page, **and only when the site's routes actually publish author pages** — where they are off, the name is plain text and nothing is generated. **A row where some names link and some do not is ordinary** and the panel says how many. Resting shows no underline and no glyph; hover is a 2 px accent underline at a 3 px offset, 160 ms; focus is A6's ring on the name's box. **Refused everywhere in A12: a row of social icons, an email or `mailto:`, a “read more” chevron, an external-link glyph, a generated label like “Read their posts”, and a second link per person.** Two designs vary the target and each says so: **9 Faces at Names None** moves the link to the photograph, and **11 Slim keeps `url` and never draws it.** **Flagged**.

**Order.** Authored: the repeater's order, and nothing re-sorts it — in a masthead the order is often the hierarchy. From Ghost: the API's default author order, which the site changes in Ghost rather than here. **No alphabetical control, no “sort by posts”, no drag-to-reorder of a Ghost list.** **15 Groups is the one design that regroups**, and it groups by an authored field rather than sorting.

**Space.** Section padding Compact 64 · Comfortable 96 · Spacious 132, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. **Two designs carry their own vertical scale:** 7 Contrast Band's band at 44 · 64 · 88 (A4·9's) and 11 Slim's at 32 · 44 · 56 (A7·8's, which does not step with width). **Row gaps:** 40 between rows of people in the grid designs, **24 in 2 Cards**, **32 between full-width rows in 3 Rows**, 48 in 6 Portraits, **56 between blocks in 15 Groups**.

**Head.** Eyebrow 13 px uppercase tracked `.08em` muted, 10 px above the title; title on a 780 measure; sub 17 px muted on 620, 12 px below; **head to people 48**; note 32 under the block on 620; link 20 under the note. **Title ladder: Small 28 · Medium 34 in twelve designs, Large 40 in 5 Split Head and 12 Big Type, Display 48 in 12 Big Type only**, whose 1,040 measure and 64 px head gap are A11·15's two exceptions carried over.

**Responsive floor.** Five → four at 1080 → three at 834 → **two at ≤ 767 where the card is a photograph, a name and a role; one at ≤ 767 where a bio is drawn.** The collapse follows the card's content rather than the design's identity, which is A12's one departure from A11's flat “never one across”. Three designs depart further and each says so: **9 Faces keeps three across on a phone**, **10 Directory goes to one column at every setting** because it has no photograph, and **6 Portraits always ends at one**. Six designs collapse a second axis: 4 Story and Team's story stacks at 1080 · 5 Split Head's head column goes above at 1080 · 15 Groups' label leaves its column at 1080 · 8 Founder's halves stack at 1080 · 13 Rail drops its arrows at 767 · 14 Reveal forces its bio under the row at 767. **Flagged**.

**Behaviour: two designs have one, thirteen have none.** **13 Rail** is scrolled by the reader — A11·9's rail, verbatim, including the measured precondition, the fades, the arrow placements and the `role="group"`. **14 Reveal** opens a bio on a `<button aria-expanded>`, 160 ms, **independently per card — one-at-a-time is refused**. **Nothing auto-advances anywhere in A12**, there is no carousel, no timer and no scroll trigger, and **behaviours do not run while editing**: every design's resting state is its primary frame. Reduced motion keeps every threshold and drops the animation.

**Dark mode.** The ground deepens, the initials block lifts to a derived `#2A251E`, hairlines take `#332E27`, and **the photographs are untouched** — no plate, no second upload, no filter. **A12 has no equivalent of A11's dark plate**, and it does not need one: a photograph carries its own ground.

**The accent is spent in two places in this whole category**: the section link's underline, and a name link's hover underline and focus ring. With no section link and no person URLs authored, **thirteen of the fifteen contain no accent pixel** — **13 Rail** and **14 Reveal** are the exceptions, because an arrow and a disclosure are controls.

**Print.** Every design prints as drawn except two: **13 Rail prints as a wrapped grid at three across**, because a page has no viewport to scroll, and **14 Reveal prints every bio open**. Print is the light mode; 7 Contrast Band drops its band and prints as 1 Grid.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the people a `<ul>` of `<li>`; name and role as `<p>`s, never headings; a photograph an `<img alt="">` with the initials block `aria-hidden`; a linked name an `<a>` around the name text. **Three designs depart: 8 Founder has no list at all, 11 Slim has no accessible name at any setting, and 15 Groups has an `<h3>` per group** — the one second heading level in A12. **9 Faces at Names None is the one place a person's photograph carries alt text.** **13 Rail generates the category's only string** — “Team, scrollable” — and 14 Reveal avoids generating a second by naming its buttons with `aria-labelledby` on the person's own name.

**The shared field list — fifteen fields.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `body` rich opt ≤ 900 · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 24 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 60. In `people[]`, one to twenty-four: `name` text **req** ≤ 48 · `role` text opt ≤ 48 · `bio` text opt ≤ 240 · `photo` image opt · `url` url opt · `group` text opt ≤ 24. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. **Four fields are read by one design each and kept by the other fourteen:** `image` and `imageAlt` by 4 Story and Team, `group` by 15 Groups; `body` is read by three — 4 Story and Team, 5 Split Head and 8 Founder. **`name` is the only field that cannot be empty**, and **there is no `photoAlt` field at all**. **Flagged**: every limit, the twenty-four ceiling, and `group` existing as a per-person field rather than as a repeater of groups.

**Content.** Orbit Weekly throughout, twelve people in one order in every frame: Okonjo · Reith · Raghunathan · Lindqvist · Ferreira · Alder · Câmara · Osgood · Vance · Watanabe · Boivin · Adeyemi. **Three carry the category's awkward cases in every frame:** Rosa Ferreira has no photograph and draws the initials block, Henry Osgood has neither a role nor a bio and draws as a name alone, and Priya Raghunathan's 42-character role wraps. **Four names link and eight do not.** Head: eyebrow **The masthead**, title **“Twelve people make the Thursday letter”**, sub, `body`, note **“Roles as of March. Freelance contributors are credited on their own posts.”**, link **“Write for Orbit Weekly”**. **Flagged: every name, role, bio, string, date and number is invented for this library, and no frame in A12 contains a drawn face** — photographs are striped placeholders with a mono caption naming the crop.

---

## 1 · Grid

Three to twelve people, photo above name and role, three to five across. The default — what a site gets when it types “team” — and **the design ten others hand off to**.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; three to twelve people reading `name`, `role`, `photo`, `url`. `bio`, `group`, `body`, `image`, `imageAlt` kept, not drawn.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: Small 28 · Medium 34, unavailable at head None. Photo size: Small 56 · Medium 72 · Large 96, **Large unavailable at Count Five**. Count per row: Three · Four · Five. Cells: Flush left · Centred. Six.

**Arrangement** · cells 416 · 306 · 240 on a 24 px gutter across 1,296; rows 40 apart; photo to name 14, name to role 4; name 17/600 rising to 20 at Large 96. **Every card sits at the top of its cell and is never stretched.**

**Responsive** · every count becomes three across at 834 and two at ≤ 767, **and this design never goes to one**, because it draws no bio. At 834 cells 234 on 26; at ≤ 767 cells 163 on 24, row gap 28.

**Empty** · no photograph → the initials block. No role → the name alone. One person → 8 Founder; two → two cells at the count's width; over twelve → 9 Faces. No people → the section does not render.

**a11y** · one `<ul>`, name and role as two `<p>`s, `alt=""`, one tab stop per linked name plus the section link.

**Flagged** · the three-to-twelve range; the 40 px row gap and 14 px photo gap; disabling Large 96 at Count Five; drawing every authored person rather than the first N; the last row keeping its width at the left.

---

## 2 · Cards

One person per card on a plane with a hairline. **The only design in A12 with a card**, and the design for a team with bios.

**Fields** · 1 Grid's, plus `bio` ≤ 240.

**Controls** · Padding · Head · Card padding: Compact 24 · Comfortable 32 · Spacious 40 · Count per row: Three · Four · Photo size: Small 56 · Medium 72 · Cards: Surface · Ground. Six.

**Not offered** · Title size, fixed at Medium 34; Count Five; Large 96; a shadow; a hover lift or scale; a link on the card.

**Arrangement** · 1 Grid's cells at 416 or 306 with a card at each; surface or ground fill, 1 px `border`, pack radius, no shadow; **rows 24 apart**, because two hairlines 40 apart read as a gap in a table; role to bio 14; **equal heights per row, the space falling at a short card's foot.**

**Responsive** · both counts become two across at 834 and one at ≤ 767 — two rather than three at 834 is this design's stated departure, and the measure is the reason.

**Empty** · no bio → a photograph, a name and a role at its row's height. No photograph → the initials block. Over twelve → 1 Grid, which drops the bios and says so.

**a11y** · the card a presentational `<div>` — no role, no label, no `tabindex`, never `<figure>` or `<article>`; contrast measured against the card's fill; forced colours keep the border and lose the fill.

**Flagged** · **stretching a short card to its row's height, the amendment to settlement 2**; the 24 px row gap; the padding scale; the three-line Ghost clamp; refusing Count Five, Large 96, a shadow, a lift and a card link; per-row rather than per-section equalisation.

---

## 3 · Rows

Full-width rows: photograph at the left, name, role and the longest bio in the category at the right. **`bio` ≤ 400 here, and nowhere else.**

**Fields** · 1 Grid's, plus `bio` ≤ 400.

**Controls** · Padding · Head · Photo size: Small 56 · Medium 72 · **Large 96, the default** · Bio measure: Wide 824 · Narrow 620 · Meta: Under the name · At the right of the row · Rule: None · Between. Six.

**Arrangement** · 96 · 32 · 824 inside 1,296, **the remaining 344 left empty**; the photograph pinned to the top of its row; name 20/600 at Large 96; rows 32 apart with the rule in the centre of the gap at the full content width.

**Responsive** · the row holds at 834 and breaks at ≤ 767, **where the photograph goes above the text at Medium and Large and stays beside it at Small**. Meta is forced under the name at 834.

**Empty** · no bio → a shorter row. No role → nothing, and at Meta at the right the end of the line is left empty. Over twelve → 1 Grid. The panel states the section's height rather than capping the count.

**a11y** · one `<ul>`, three `<p>`s each, the rule a `border-top` and never an `<hr>`; Meta at the right changes no DOM order.

**Flagged** · the 824 measure and the empty 344; pinning the photograph to the top; Large 96 as the default here alone; the 400-character ceiling and the four-line clamp; Meta's 1080 destination; the photo-size-dependent collapse at ≤ 767.

---

## 4 · Story and Team

The about paragraphs and a group photograph above the team. **The design the category is named for**, and the only one that reads `image` and `imageAlt`.

**Fields** · `eyebrow`, `title`, **`body` ≤ 900 and ≤ 3 paragraphs**, `image`, `imageAlt`, `note`, the link pair; up to twelve people reading `name`, `role`, `photo`, `url`. `sub`, `bio`, `group` kept, not drawn.

**Controls** · Padding · Head · Story: Above the photograph · Beside it · Photograph: Band 3:1 · Landscape 3:2 · None · Team count per row: Four · Five · Team photo size: Small 56 · Medium 72. Six.

**Not offered** · Title size; the sub; a side for the story; text over the photograph; Large 96; a bio.

**Arrangement** · head, story, photograph, team, **at one 48 px gap used three times**; story on 620 at 17/1.7 in `text`; photograph at the content width at its named ratio; team cells 306 or 240, the card side by side — photograph, 16, name and role. Beside the photograph: 632 · 32 · 632, top-aligned, 4:3.

**Responsive** · Story Beside stacks at 1080; the team goes three across at 834 and one across at ≤ 767; the photograph keeps its ratio at every width.

**Empty** · no photograph → the blocks close up. No story → 1 Grid. **No people → the story and photograph draw alone, the one design in A12 that renders with an empty `people[]`.** No `imageAlt` → `alt=""`, never a generated string.

**a11y** · **the group photograph is the one image in A12 with real alt text**, a bare `<img>` and not a `<figure>`; every person's photograph stays `alt=""`.

**Flagged** · the four-block order and the repeated 48; the 900-character and three-paragraph limits; Band 3:1 as the default and 4:3 beside the story; the story always at the left; rendering with no people at all.

---

## 5 · Split Head

Head and story in a 416 column, the people in the 824 beside it. A8·6's split, and **the design for a long sub**.

**Fields** · every section field except `image` and `imageAlt`, including `body` ≤ 900; three to twelve people. `title` required in practice.

**Controls** · Padding · Head column: Left · Right · Title size: Medium 34 · Large 40 · Count per row: Two · Three · Four · Photo size: Small 56 · Medium 72 · Foot: In the head column · Under the people. Six.

**Not offered** · head alignment; Head None; Display 48; Large 96; a sticky head; a rule between the columns.

**Arrangement** · **416 · 56 · 824 = 1,296**, both columns top-aligned; cells 400 at two, **258 on a 25 px gutter at three**, 188 at four; the column's own rhythm 24; story 16/1.7. At Count Two the card is side by side; at three and four it is stacked.

**Responsive** · at 1080 the head column goes above the people and the foot moves under them at both Foot values; the people then take 1 Grid's grid.

**Empty** · no title → 1 Grid. No story → the column is a head and a foot. One person → 8 Founder.

**a11y** · two `<div>`s, neither a landmark; both reorders done in the source with no `order` property; **this design never exists without an accessible name.**

**Flagged** · the 16 px story on a 416 column; the 24 px rhythm; the foot's 1080 destination; the side-by-side card at Count Two; Large 40 offered here; the hand-off with no title.

---

## 6 · Portraits

Two or three editorial portraits at a named crop, the name under the image or set over it. **The one design in A12 with a scrim.**

**Fields** · 1 Grid's, two or three people. Crop family.

**Controls** · Padding · Head · Count: Two · Three · Crop: Portrait 4:5 · Square 1:1 · Caption: Under the image · Overlaid · Name size: Medium 20 · Large 27. Six.

**Not offered** · Title size; Landscape 3:2; a focal point; a bio; a border, shadow or filter; a hover on the image.

**Arrangement** · cells 416 on 24 at three, **632 on a 32 px gutter at two**; the crop fills the cell's width; image to name 16, name to role 6; **the scrim `contrast` at 72 / 42 / 0% over the bottom 45%**, the caption in the carried colour.

**Responsive** · three across holds at 834 and both counts go to one at ≤ 767 — **the one design in A12 that always ends at one**; both name sizes draw 20 there.

**Empty** · no photograph → the initials block at the cell's full size, **its caption staying under the block even at Caption Overlaid**, with the unequal cell heights that follow. Four or more → 1 Grid; one → 8 Founder. Forced colours drop the scrim and return the caption.

**a11y** · name and role in the same DOM position at both Caption values; never `<figure>`/`<figcaption>`; overlaid contrast measured against the scrim.

**Flagged** · the three-person ceiling; the initials rule for a crop — 0.34 × the shorter edge, capped at 96; the scrim's three stops and 45% height; Name Large 27; the forced-colours fallback.

---

## 7 · Contrast Band

1 Grid inverted onto the `contrast` token, at the band's own vertical scale. **No extra upload of any kind is needed for the band — the finding this design exists to state.**

**Fields** · 1 Grid's exactly.

**Controls** · **Band padding: Compact 44 · Comfortable 64 · Spacious 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390), which replaces the section Padding control · Band width: Full bleed · Inset · Head · Count per row: Three · Four · Five · Photo size: Small 56 · Medium 72 · Cells: Flush left · Centred. Six.

**Derived values** · from one token pair: muted = the carried colour at 72% (`#BEBCB7` light, `#57544D` dark); initials fill = 10%; hairline 18%, never drawn. **The accent is unavailable at 2.3:1 light and 2.1:1 dark**; links and rings take the carried colour. Cells 306 · 240 at Full bleed, **274 · 214 at Inset** inside the 1,168.

**Responsive** · 1 Grid's rule plus the band's own padding step; at Inset the cells are 143 at ≤ 767 rather than 163.

**Empty** · as 1 Grid. **Forced colours and print both drop the band and the section becomes 1 Grid.**

**a11y** · the band a `background-color` on the section, so the DOM and the announcement are 1 Grid's exactly. **§7.4 applied: the accent is disabled with its ratio shown.**

**Flagged** · the 72% muted, the 10% initials fill and the 18% hairline that is never drawn; the Inset cell widths; the statement that four grounds need one set of uploads.

---

## 8 · Founder

One person: portrait, name, role and the 900-character letter. **The team of one, and the design every grid hands off to at one person.**

**Fields** · `eyebrow`, `title`, `body` ≤ 900 and ≤ 3 paragraphs, `note`, the link pair; **the first item of `people[]` only**, reading `name`, `role`, `bio`, `photo`, `url`. **The text is `body`, falling back to `bio`**; with both authored, `body` wins and the editor says so.

**Controls** · Padding · **Division: Even 632/632 · Text-led 504/760 · Image-led 760/504**, all on a 32 px gutter · Image side: Left · Right · Crop: Portrait 4:5 · Square 1:1 · **Landscape 3:2** · Name size: Medium 20 · Large 27 · Head: Shown · None. Six.

**Not offered** · Title size; the sub; a focal point; “match the text”; an overlap; a frame, shadow or caption; a second person.

**Arrangement** · the two halves vertically centred against each other — **the only centred pairing in A12**; the text half a stack 24 apart: name and role, letter, note, link; letter 17/1.7 on the half's own measure.

**Responsive** · at 1080 and below the halves stack with the image above the text at both Image side values, **and the crop is forced to 3:2**.

**Empty** · no photograph → the initials block at the crop's full size. **No `body` → the `bio`; neither → a portrait, a name and a role, which is a valid section rather than a hand-off.** At Head None there is no `<h2>` and no accessible name. Two or more people → 1 Grid.

**a11y** · **no list — the one design in A12 without one**; the 27 px name is not a heading; not a `<figure>`.

**Flagged** · the `body`-then-`bio` fallback and the six-line Ghost clamp; offering Landscape 3:2 where 6 Portraits refuses it; Head None as a real value and the nameless section it creates; receiving from every grid at one person and handing off at two.

---

## 9 · Faces

Eight to twenty-four people, four to eight across, a circle and a name and nothing else. §8.3's team of twelve, and **the only design in A12 that refuses the role.**

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; **eight to twenty-four** people reading `name`, `photo`, `url`. **`role` and `bio` are kept and never drawn**, and the panel names the count it is leaving out.

**Controls** · Padding · Head · Count per row: Four · **Six** · Eight · Photo size: Small 56 · Medium 72, **fixed at 44 and Medium unavailable at Count Eight** · Names: Under the face · None · Row gap: Tight 24 · Comfortable 32. Six.

**Arrangement** · cells 306 · 196 · 141 on a fixed 24 px gutter; **the name at 14/1.4 — the one design where the name is not 17**; photograph to name 12; **the name block equalised per row, not per wall.**

**Responsive** · all three counts become four across at 834 and **three across at ≤ 767 — the only design in A12 that keeps three on a phone.**

**Empty** · no photograph → the initials block, same size, same place. Under eight → 1 Grid, which draws the roles; over twenty-four → the repeater stops.

**a11y** · one flat `<ul>` of up to twenty-four `<li>`, no grouping, no skip link. **At Names None the photograph takes the person's name as its alt text, the initials block takes an `aria-label`, and the link moves to the image** at a 56 or 44 px target — **the one exception to settlement 1 in the category.**

**Flagged** · the eight-to-twenty-four range; the 14 px name; the 141 px cells and 44 px circle at Count Eight; **Names None turning alt text on**; refusing the role, a tooltip and a “+4 more”; three counts converging at 834; three across on a phone.

---

## 10 · Directory

Names and roles in hairline rows, in one, two or three columns. **The one design in A12 that draws no photograph at any setting** — `photo` is kept, twelve are authored, none are drawn, and the panel says so and names 1 Grid.

**Fields** · `eyebrow` ≤ 26, `title` ≤ 104, `note` ≤ 120, the link pair; **four to twenty-four** people reading `name`, `role`, `url`. `photo`, `bio`, `group`, `body`, `sub`, `image`, `imageAlt` kept, not drawn.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Columns: One 1,296 · **Two 636** · Three 416. Rule: **Hairlines** · None. Role: **Beside the name** · Under the name. Density: Compact · **Comfortable**. Six.

**Not offered** · a photograph at any size; a Title size; a sub; an alphabet index; a filter; a search field; an order control.

**Arrangement** · columns **filled down and then across** on a 24 px gutter; name 17/600 in `text`, role 14 in `text-muted` right-aligned to its column at Beside; **a row is 14 px of padding above and below a 17 px name, 53 px including its hairline** (10 at Compact, 12 at Role Under); **rows share a height across columns, so the hairlines line up**; a hairline under every row including the last and never above the first.

**Responsive** · **Three columns becomes Two at 834, and every value becomes One column at ≤ 767 with the role under the name.** At 834 columns 365 on 24, row padding 13, title 30. At ≤ 767 one column, row padding 12, title 26. **One across at ≤ 767 is this design's stated departure from A12's two-across floor**, allowed because there is no photograph in the row.

**Empty** · no role → the name alone and the rest of the row empty. No eyebrow, note or link → absent. Under four people → 1 Grid; over twenty-four → the repeater stops. At head None there is no `<h2>` and no accessible name.

**a11y** · one `<ul>` of up to twenty-four `<li>`; **not a `<table>` and not marked up as columns** — no column headers, and nothing in column two relates to the row beside it; the role a `<span>` inside the person's item, so a reader hears “name, role” as one item at both Role values; the grid flows down then across, so reading order is authored order; the hairline never a target. Name 15.8:1 / 15.1:1, role 5.6:1 / 6.0:1, hairline 1.3:1 as a non-text divider.

**Flagged** · drawing no photograph at any setting; the column-major fill; the 1,296 / 636 / 416 divisions; the 53 px row and the two densities; right-aligning the role; **the wrapping role dropping under its name and growing its neighbour's row**; the hairline under the last row and never above the first; the four-person floor; one column at ≤ 767; refusing an index, a filter and a search field.

---

## 11 · Slim

A 96 to 144 px band: a line of overlapped faces, one sentence, and the section link at the far end. **The shortest section in A12 and the only one with no heading of any kind.**

**Fields** · **`title` ≤ 104, drawn as one sentence at 15 px in `text` rather than as a heading**, and the link pair; three to twenty-four people reading `photo` and `name` — the name for the initials block only. **Kept and never drawn: `eyebrow`, `sub`, `note`, `body`, `image`, `imageAlt`, `role`, `bio`, `group` and `url`** — the only design in A12 that keeps `url` without drawing it, because no name is drawn to carry it.

**Controls** · Padding: 32 · **44** · 56, giving a band of 96 · 120 · 144. Faces side: **Left** · Right. Faces: **Overlapped** · Spaced, **Spaced unavailable above sixteen people** — 16 spaced faces are 632 px, 24 are 952, and the sentence and link need about 470. Rule: None · Above · **Above and below**. Width: **Content** · Full bleed. Sentence: **Beside the faces** · Under them. Six.

**Not offered** · a Head; a Title size; a photo size; a name; a role; a counter.

**Arrangement** · a **32 px circle**, off the category's ladder and the smallest face in A12, at a **10 px overlap with a 2 px `background` ring**, first face on top; twelve faces overlapped are 274 px and twenty-four are 538; at Spaced an 8 px gap, no ring, and twelve faces are 472; faces to sentence 20, the sentence centred on the circles, the link pushed to the column's end. At Full bleed the rule runs to the viewport and the content stays on 1,296.

**Responsive** · at 834 the band holds and only its sizes step — circle 28, overlap 9, gap 16. **At ≤ 767 it stops being a band and becomes a stack of faces, sentence and link**, and Faces side and Sentence stop having an effect; circle 24, overlap 8, and **faces past the width wrap at the same overlap, the band growing 32 px a line.**

**Empty** · no photograph → the initials block at 32 px. No title → the band is faces and a link, and the panel says the sentence is missing. **No link → no interactive content and no tab stop.** Under three people → 1 Grid; over twenty-four → the repeater stops.

**a11y** · **no accessible name at any setting**, A11·10 Slim's position; the sentence a `<p>`; the faces a `<ul>` of `<img alt="">` with `aria-hidden` on the initials block, **decorative because the sentence says what they are** — the opposite of 9 Faces at Names None, where the faces are the whole content; one tab stop, and none with no link authored.

**Flagged** · the 32 px off-ladder circle; the 10 px overlap and first-face-on-top order; **the 2 px `background` ring, the one ring on a photograph in A12**; drawing `title` as a 15 px sentence; keeping `url` undrawn; the sixteen-person limit on Spaced; **the band of 96 · 120 · 144, which amends the roster's “96 to 132 px”**; the wrap at ≤ 767; refusing a counter, a tooltip and a hover name.

---

## 12 · Big Type

One sentence at Display 48 on a 1,040 measure, with a single row of three or four people under it. **The only design in A12 that offers Display 48.**

**Fields** · `eyebrow` ≤ 26, **`title` ≤ 104 and required in practice**, the link pair; **the first three or four of `people[]`** reading `name`, `role`, `photo`, `url`. **Kept and not drawn: `sub` and `note`** — the only design in A12 that holds two authored section fields at once — plus `bio`, `group`, `body`, `image`, `imageAlt` and every person past the count.

**Controls** · Padding: 64 · **96** · 132. Title size: Large 40 · **Display 48**. Alignment: **Flush left** · Centred. Count: Three 416 · **Four 306**. Photo size: **Medium 72** · Large 96. Rule: **None** · Between. Six.

**Not offered** · Small 28 or Medium 34; a Head None; a sub; a note; a bio; a second row; a “see all”.

**Arrangement** · statement on a 1,040 measure inside the 1,296 column, 1.08 leading at Display and 1.12 at Large; **head to people 64**, A11·15's exception; cells 416 / 306 on a 24 px gutter, the same cells 1 Grid uses; name 17, or 20 at Large 96; link 32 under the row. **Rule Between is one hairline across the full 1,296, inside the 64 px gap.** Alignment Centred centres the statement, the row, each card's contents and the link together.

**Responsive** · the statement steps 48 → 40 → 32 and 40 → 34 → 32, **so the two sizes converge at ≤ 767**; Count Four becomes three across at 834 and two at ≤ 767, and the people past the width join the held list. At 834 measure 700, cells 234 on 26, head gap 56.

**Empty** · no title → the section does not render, since the statement is the design. No role → the name alone. No photograph → the initials block. One or two people → that many cells, left-aligned; one person → 8 Founder.

**a11y** · the statement is the `<h2>` and the section's accessible name; **the held people are not in the DOM at all** — not `display:none`, not `aria-hidden`, not behind a “more” control: the theme renders the first N and stops.

**Flagged** · the two-size ladder and refusing Small and Medium; the 1,040 measure and 64 px gap at this size; **one row only, with the rest held and named in the panel**; refusing the sub and the note; Centred centring the cards' contents; the full-width Between rule; the sizes converging at 32 on a phone; drawing the two hard cases on a labelled hypothetical row, because the authored order holds them back.

---

## 13 · Rail

One line of portrait cards wider than the window, scrolled by the reader. **A11·9's rail carried over verbatim**, with logos swapped for the person card at a named crop.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; **five to twenty-four** people reading `name`, `role`, `bio` ≤ 240, `photo`, `url`. `group`, `body`, `image`, `imageAlt` kept, not drawn.

**Controls** · Padding: 64 · **96** · 132. Head: Centred · **Flush left** · None. Card width: Narrow 240 · **Standard 306**. Crop: **Portrait 4:5** · Square 1:1. Bio: **Shown** · Hidden. Arrows: **In the margins** · Above the rail. Six.

**Not offered** · a Landscape crop; a gap; autoplay; dots; a per-person crop; a card border.

**Arrangement** · a full-bleed track starting and ending on the page margin, cards on a 24 px gutter, image to name 16; name 20/600, role 14, bio 15/1.6 clamped to three lines in a Standard card and four in a Narrow one; **a 306 card at 4:5 is 382 px tall**, and four cards fill the 1,296 exactly, which is why a fifth person makes this a rail. The initials block fills the crop at 0.34 × its height — **104 px letters at 306 × 382, the largest type in A12.**

**Behaviour** · reader-driven scroll; **a click moves one card plus one gutter — 330 px at Standard, 264 at Narrow**; fades 96 / 72 / 48 in `background`, each drawn only when there is content past that end; no snap; position never restored; nothing auto-advances; **the behaviour does not run while editing**; reduced motion keeps the scroll and drops the animation. **The precondition is measured, not counted**: if the cards are not wider than the content width, the section draws as 1 Grid with no arrows, no fades and no scroll container.

**Responsive** · cards and fade step with width; at 834 cards 264 / 216, fade 72, ends on the 40 px margin; **at ≤ 767 the arrows are dropped and the rail is scrolled by touch**, cards 240 / 200, gutter 20, fade 48.

**Empty** · no photograph → the initials block filling the crop. No role or bio → a shorter card that stays shorter. Under five people at Standard → 1 Grid; one person → 8 Founder; over twenty-four → the repeater stops.

**a11y** · the track a `role="group"` with the generated label **“Team, scrollable”** — the one generated string in A12 — and `tabindex="0"`; arrows `<button>`s named “Scroll left” and “Scroll right”, outside the group and in drawn order at both placements; a disabled arrow keeps `aria-disabled`, stays focusable and stays 38 px, its glyph 2.1:1 and disclosed; tabbing to a linked name scrolls it into view, the browser's own behaviour.

**Print** · **a wrapped grid at three across, every person and every bio.**

**Flagged** · the 240 and 306 card widths and their steps; the 16 px image-to-name gap; the arrows in the foot beside the note; one card plus one gutter per click; refusing snap, autoplay, dots and a Landscape crop; the five-person floor at Standard; printing as a wrapped grid.

---

## 14 · Reveal

1 Grid, where each person's bio opens on a button in their own card. **For the team that has twelve bios and no room for twelve bios.**

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; three to twenty-four people reading `name`, `role`, `bio` ≤ 240, `photo`, `url`. `group`, `body`, `image`, `imageAlt` kept, not drawn.

**Controls** · Padding: 64 · **96** · 132. Head: Centred · **Flush left** · None. Count per row: Three 416 · **Four 306** · Five 240. Photo size: **Medium 72** · Large 96, **Large unavailable at Count Five**. Bio opens: **In the card** · Under the row, **forced Under at Count Five and at ≤ 767**. Start: **All closed** · First open. Six.

**Not offered** · one-at-a-time; a modal; hover-to-open; a card target; a Title size.

**Arrangement** · 1 Grid's cells and 40 px row gap; **the button A1·14's icon button at 38 px on an 8 px radius, 14 px under the role**, bare when closed and on the hover surface with an accent glyph when open; the glyph a plus that becomes a minus and does not rotate; bio 12 px under the button at 15/1.6, four lines in a 306 cell and five in a 240. **A person with no bio has no button.**

**Behaviour** · independent disclosure per card, **any number open at once**; 160 ms ease-out on the height, the glyph swapping at the midpoint; **the row's height follows its tallest open card and closed cards stay at the top of their cells**; at Under the row the cards keep their heights and the bio opens in a full-width panel below that row, above a hairline, **two open bios stacking in authored order, each under its own name at 15/600**; state never persisted, resetting on reload at both Start values; **does not run while editing**; reduced motion drops the transition.

**Responsive** · every count becomes three across at 834 and two at ≤ 767, **and at ≤ 767 Bio opens is forced Under the row** — the design's second-axis collapse and its only forced value. The button stays 38 px at every width.

**Empty** · **no bio → no button, and the tab order skips that person.** No role → the name alone with its button under it. No photograph → the initials block. No bios at all → the section is 1 Grid and the panel says so. One person → 8 Founder.

**a11y** · `<button aria-expanded aria-controls>` **named by the person's name with `aria-labelledby`, so no label is generated**; the glyph `aria-hidden`; the bio in the DOM and toggled with `hidden`, so find-in-page does not land on invisible text; reading order photograph, name, role, button, bio at both values; focus never moved on open, and closing leaves focus on the button. Open glyph 3.9:1 light and 4.7:1 dark.

**Print** · **every bio open, at both Bio opens values.**

**Flagged** · the plus-and-minus glyph and refusing a chevron; the button's position and the 14 px gap; dropping the button where there is no bio; independent opening and refusing one-at-a-time; the Under-the-row panel repeating the name; forcing Under at Count Five and at ≤ 767; not persisting state; printing every bio open.

---

## 15 · Groups

People under labelled headings — Editorial, Art and photo, Operations. **The one design in A12 that regroups the list**, and it does it by reading an authored field rather than by sorting.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; **four to twenty-four** people reading `name`, `role`, `bio` ≤ 240, `photo`, `url` and **`group` ≤ 24 — the one design in A12 that reads it.** `body`, `image`, `imageAlt` kept, not drawn.

**Controls** · Padding: 64 · **96** · 132. Head: Centred · **Flush left** · None. Count per row: Three 416 · **Four 306**, and 336 · 246 at label Beside. Photo size: Small 56 · **Medium 72**, **Large 96 not offered**. Group label: **Above the row** · Beside the row. Bio: Shown · **Hidden**. Six.

**Not offered** · a group order control; an alphabetical sort; a per-group note; a collapsible group; a filter; a count in the label.

**Arrangement** · **groups in the order their first member appears, authored order kept inside each**; label 13 px uppercase tracked `.08em` in `text-muted` as an `<h3>`, hairline 12 under it, 24 to the first face; **blocks 56 apart, rows 40 apart inside a block**; counts are per group, so a group of five at Count Four is 4 + 1, left-aligned. At Beside: **196 · 44 · 1,056**, A11·2's division verbatim, with no hairline and the label aligned to the top of the first photograph. **Group values are matched exactly and case is the site's** — “Editorial” and “editorial” are two groups, which the editor warns about.

**Responsive** · label Beside becomes Above at 1,080; both counts become three across at 834; **at ≤ 767 the grid is two across with the bio hidden and one across with it shown**, the category's floor rule.

**Empty** · **a person with no `group` → the unlabelled final block, counted in the panel**. No groups at all, or one group for everybody → 1 Grid. A group of one → a label and one card. Over twenty-four people → the repeater stops.

**Data** · **Ghost has no group field, so at Source Ghost every author lands in the unlabelled block and the section draws as 1 Grid** — the editor says so in words. **The one design in A12 that cannot be driven from Ghost at all.**

**a11y** · one `<h3>` and one `<ul>` per group — **the one design in A12 with a second heading level**; the unlabelled block a list with no heading and **no invented `aria-label`**; at head None the labels stay `<h3>` and the outline skips a level, because a heading level that changes with a control is worse; DOM order identical at both label values; label 5.6:1 / 6.0:1 at 13 px.

**Flagged** · first-appearance group order; keeping authored order inside a group; the label at the eyebrow's size as a real `<h3>`; the 56 and 40 gaps; **the unlabelled final block and refusing “Other”**; refusing to promote labels at head None; not normalising case; refusing a count, a pill, a filter and a collapsible group; the four-person floor; handing off to 1 Grid at Source Ghost.

---

## Amendments the drawn designs forced on the proof

1. **Settlement 1 is amended by 9 Faces.** A person's photograph is `alt=""` because the name is drawn beside it — **except at Names None, where no name is drawn and the photograph takes the person's name as its alt text**, with an `aria-label` on the initials block and the link moving to the image. 11 Slim is the counter-case and is stated on both frames: there the faces are decorative, because the sentence says what they are.
2. **Settlement 2 is amended by 2 Cards.** A short card sits at the top of its cell everywhere in A12 — **except in a card design, where the card stretches to its row's height**, because a card has a visible edge and a short one would read as a mistake.
3. **The roster's “96 to 132 px band” is amended to 96 to 144** by 11 Slim's arithmetic: A7·8's 32 · 44 · 56 padding with a 32 px circle gives 96 · 120 · 144.
4. **`linkLabel` is raised from 20 characters to 24.** The category's own label, “Write for Orbit Weekly”, is 22 — the limit was stated before the string was drawn, and the string is the one every design uses. The stress frame draws a 20-character label as well, to show both inside the ceiling.
5. **The photo ladder gains two off-ladder sizes**, each named on its frame: **32 px in 11 Slim** and **44 px at Count Eight in 9 Faces**.
6. **The ring refusal gains one exception**: 11 Slim's 2 px `background` ring, drawn only where overlapped circles touch.
7. **The category has exactly one generated string** — 13 Rail's “Team, scrollable”. 14 Reveal was the second candidate and avoids it by naming its buttons with `aria-labelledby` on the person's own name.
8. **The responsive floor gains a third departure.** A11's “never one across” became “two, or one where a bio is drawn” in A12-0; **10 Directory goes to one column at every setting**, because a ledger with no photograph in two columns is a table nobody can scan.
9. **`sub` and `note` are each held back by one design** — both by 12 Big Type, which is the only design in A12 that holds two authored section fields at once. **`url` is held back by 11 Slim**, the only design that keeps a link field it cannot draw.
10. **The Ghost source has one design it cannot drive at all**: 15 Groups, because Ghost stores no group. 9 Faces is the design whose field list matches what the API returns.

## The roster at a glance

| # | Design | Photo | Reads beyond the floor | Hands off |
|---|---|---|---|---|
| 1 | Grid | Circle | — | 8 Founder at one, 9 Faces over twelve |
| 2 | Cards | Circle | `bio` | 8 Founder at one, 1 Grid over twelve |
| 3 | Rows | Circle | `bio` ≤ 400 | 8 Founder at one, 1 Grid over twelve |
| 4 | Story and Team | Circle | `body`, `image`, `imageAlt` | 1 Grid with no story |
| 5 | Split Head | Circle | `body` | 1 Grid with no title |
| 6 | Portraits | Crop | — | 1 Grid over three, 8 Founder at one |
| 7 | Contrast Band | Circle | — | 1 Grid in print and forced colours |
| 8 | Founder | Crop | `body`, `bio` | 1 Grid at two or more |
| 9 | Faces | Circle | — | 1 Grid under eight |
| 10 | Directory | none | — | 1 Grid under four |
| 11 | Slim | Circle 32 | — | 1 Grid under three |
| 12 | Big Type | Circle | — | 8 Founder at one; holds the list past the count |
| 13 | Rail | Crop | `bio` | 1 Grid when the cards fit, 8 Founder at one |
| 14 | Reveal | Circle | `bio` | 1 Grid with no bios, 8 Founder at one |
| 15 | Groups | Circle | `group`, `bio` | 1 Grid with no groups, and at Source Ghost |

**Eleven designs draw a circle, three draw a named crop, one draws no photograph at all. Ten hand off to 1 Grid; every grid design hands off to 8 Founder at a team of one. Two have a behaviour and thirteen have none.**
