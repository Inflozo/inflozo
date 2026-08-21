# A9 FAQ — written specification

15 designs · Paper pack · drawn in this project as `A9-1 Accordion.dc.html` … `A9-15 Ledger.dc.html`, with the category's shared artefacts in `A9-0 Category Proof.dc.html`.

Read `A9-0` first. It carries the four settlements §8 asks A9 to make, the question ladder, the row component and its marker, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass — including **the seven amendments the drawn designs forced on it**. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**Nothing comes from Ghost, and the category's real problem is elsewhere.** Ghost has no FAQ resource, so every field is authored in the section, in a repeater — the same as A8. Pulling rows from posts under an internal tag was considered and refused: a post has its own URL, and a page of tagged posts is a documentation index rather than a section. The only failure available is an empty repeater, and the answer is that the section does not render. **What is new is that ten of the fifteen designs withhold the thing the section is for.** A9 is the first category in the library where most designs' resting state hides their content, and every accordion's panel says so. **Flagged**: the refusal of tagged posts.

**The shared field list — thirteen fields.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 20 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 120. Groups, in `groups[]`, none to six: `groupLabel` text **req** ≤ 24. Items, in `items[]`, one to twenty-four: `question` text **req 12–120** · `answer` limited rich text **req 20–900** · `anchor` slug, seeded from the question on first save and editable · `group` reference opt, empty meaning ungrouped. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. `image` is read by **10 Image Split** alone and kept by the other fourteen. `groups[]` is read by **6 Grouped, 7 Index and 11 Tabs** and kept by the other twelve. **Twenty-four is the ceiling**, reached by 7 Index and 12 Filter only. **Flagged**: the ceiling, the stored anchor, the group cap of six and the 24-character label.

**Settlement 1 — accordion and always-open are designs, not two values of one control.** Ten accordions (1, 2, 5, 6, 7, 8, 10, 12, 13, 14) and five always-open (3, 4, 9, 11, 15). A control that turned eight closed rows into eight open ones would rebuild the section under the site. **More than one row may be open, and opening one never closes another** — there is no one-at-a-time value anywhere in A9, because a reader holding two answers side by side is the ordinary case. **Open on load has two values, All closed and First open, and is offered in 1 Accordion only**; everywhere else All closed is fixed and stated in the panel. **There is no All open** — that is 3 Open List. **An Expand all control is refused at every value.** The open state is never remembered between visits, nothing auto-opens on scroll, and nothing runs while editing. **Flagged**: all of it.

**Settlement 2 — deep-linking.** Every row has an anchor in every design, the always-open five included. **The `anchor` is stored, seeded from the question on first save**, so editing a question does not break a link somebody has already sent. Arriving at it **opens that row and leaves every other row exactly as the design would have drawn it** — the closed rows stay closed; the question scrolls to 96 px below the viewport top; **focus moves to the row's button**, or to the heading via `tabindex="-1"` in the always-open designs; the row is **open on arrival without the 160 ms animation**; and there is **no highlight, flash, pulse or accent tint**. A row inside a container opens its container: 11 Tabs selects the tab, 12 Filter loads unfiltered with an empty field, 6 Grouped and 7 Index draw every group at all times. **Opening a row does not write to the URL and does not push a history entry.** A visible copy-link affordance is drawn in **7 Index** only. **Flagged**: the stored anchor, the 96 px margin, the focus move, the refusal of a highlight, the history rule and the single copy-link design.

**Settlement 3 — the answer.** Limited rich text, **20 to 900 characters**. Allowed: paragraphs, one level of unordered or ordered list, inline links, inline code, bold and italic. **Refused: headings, images, embeds, tables, blockquotes, multi-line code blocks, buttons and nested lists** — an answer that needs a heading is a page with sections, one that needs a table is a comparison, one that needs a screenshot is documentation, and `C Post Body` owns full rich text. **The measure is 620 px at every width above 767, whatever the design's row is**: the question takes the row's full width and the answer is capped at 620 and sits at the row's left edge. **The answer is 16 px on 1.65 in `text`, never muted, and never steps with the question** — it is reading matter rather than meta, which is where A9 parts from A8's muted role lines. Paragraphs 12 px apart; lists at a 20 px indent with markers in `text-muted`, items 8 px apart, 12 above and 8 below the list. Links take the section link's treatment at body size — `text` with a 1 px `accent` underline at a 3 px offset, 2 px on hover. Inline code is mono at 0.92em on the hover surface, 1 × 5 px of padding, at the pack radius. **13 Slim is the one design that refuses lists and code**, and caps its answers at 300. **Flagged**: the allowed list, every refusal, the ceiling, the 620 measure and its left alignment, the answer taking `text`, and the code treatment.

**Settlement 4 — two columns.** **2 Two Column is the only two-column list of questions in A9.** Two independent lists split by count, the first half at the left and the second at the right, **the extra row going left on an odd count**, **equal in number of rows and never equalised by height**. Both alternatives are refused for what they do when a row opens: **CSS multi-column reflows items across the break**, so opening question 2 moves question 4 into the other column; **a row-major grid couples two rows into one height**, so opening question 1 leaves a hole beside question 2. At ≤ 767 the two lists stack and read as one sequence in authored order; the split is applied above 767 and not below it, so **nothing is reordered at any width and the DOM never changes**. **Flagged**: all of it.

**The question ladder is A9's one new scale.** Row 17 · Large 20 · Feature 24 at 1440; 17 · 19 · 22 at 834; 17 · 18 · 20 at 390. Line height 1.4, tracking 0, **weight 600 in every pack**. **The question takes the pack's body font, not its heading font** — in ten designs it is the label on a button, and eight questions in a display serif is eight headlines. **The heading font appears once per section, on the title**, and once more in 9 Numbered's numerals. **Flagged**: the ladder, the body font and the numerals exception.

**The head is A6's title ladder unchanged** — Medium 34 · Large 40 · Display 48 at 1440, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390 — on a 780 px measure; sub 17 px muted on 620 (560 at 834); eyebrow 13 px uppercase tracked `.08em` muted; **head to rows 48 px**. **Two designs draw no head at all and keep the fields: 13 Slim and 15 Ledger.** 9 Numbered caps the title at Medium 34; 5 Split Head and 10 Image Split cap it at Large 40.

**The row is one component.** A hairline `border-top` on every row and **none under the last**, so a list of eight has eight rules and not nine. Row padding **Compact 16 · Comfortable 20 · Spacious 28**, following the question's step rather than taking a control — **except in 13 Slim, which fixes it at 14, and 15 Ledger, which gives it its own control**. The whole row is the button, **44 px minimum target at every width**. The marker sits at the right in `text-muted`, going to `text` on hover and while open, and **is aligned to the question's first line, never centred against the row**. Question to answer follows the question's step: 12 at Row, 16 at Large, 20 at Feature. **Hover fills the row with the hover surface and extends 16 px past the measure on both sides**; the hairline does not move; **the open row takes no plane, no accent tint and no border change**. **Flagged**: the padding scale, the marker's colour behaviour and first-line alignment, the step-linked gap, the hover overhang, and the last row carrying no hairline.

**The marker has two values and no third.** **Chevron · Plus** — a 20 px box holding a 9 px chevron or a 14 px plus in 1.5 px strokes, always at the right. There is no None: a row with nothing at its right does not look openable, and the five always-open designs draw no marker because they have nothing to open. **The plus loses its vertical bar rather than rotating** — a plus that rotates into a cross says close, and nothing here closes. **The marker is never the accent**, in any pack or mode, and **it is not A1·14's icon button**: no box, no border, no fill, and the target is the row. **Flagged**: both values, the refusal of a third, the position and the stroke weight.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the set a `<ul>` of `<li>`. **Every question is a heading** — an `<h3>` in twelve designs, an `<h4>` under a group label's `<h3>` in **6 Grouped and 7 Index**; **11 Tabs reads the same field and keeps `<h3>`**, because its tab is the label and no heading is drawn inside the panel. A reader using a heading rotor gets the whole question list in one gesture, which is the largest single accessibility win a FAQ can offer. **In the ten accordions the heading holds a full-width `<button aria-expanded aria-controls>` and the answer is a `<div role="region">` labelled by that button; in the five always-open designs there is no button and no region**, because a region nobody can toggle is a landmark for nothing. **Two designs have no `<h2>` and take no accessible name: 13 Slim and 15 Ledger.**

**Three structures were considered and refused.** `<dl><dt><dd>`: a question is not a term, a three-paragraph answer is not its definition, and the questions stop being headings. `<details><summary>`: it cannot carry a heading cleanly and its marker and open state cannot be styled to one rule across twelve packs — **its one real advantage, a browser finding text inside a closed row, is a cost A9 takes instead and states**. `role="tablist"` for an accordion: an accordion is not a tab set, and A5·12 owns tabs. **Flagged**: all three.

**The accordion's cost, stated in ten panels.** Closed answers are in the DOM with the `hidden` attribute — not removed, not lazily fetched — so the page's source is complete. They are still not on the page: **a reader scanning does not see them and a browser's find does not match them.** Every accordion's panel says so and names **3 Open List**. **Flagged**, following A8·11's disclosure.

**No `FAQPage` schema in any of the fifteen.** The section cannot know what the page is: three FAQ sections on one page would emit three graphs, and a marketing page with a FAQ band is not a FAQ page. A site that wants the markup adds it once, at page level, in code injection — the only place it can be written truthfully. **Flagged**.

**Motion: one behaviour, in ten designs.** The answer's height animates 160 ms ease-out and the marker rotates in the same 160 ms, one transition per state change. **Under reduced motion both are instant and the row still opens** — the arrangement, the thresholds and the open state are unchanged. **11 Tabs' tablist and 12 Filter's field are the category's two other reader-driven behaviours**; the filter animates nothing at any motion setting. Nothing runs on a timer, nothing opens on scroll, nothing runs while editing, and **every frame in A9 is a resting state**.

**Focus** is A6's ring verbatim: 2 px accent, 2 px outside, the inner gap taking the ground, the carried colour on a band. **The ring hugs the whole row**, not the question's text and not the marker.

**The accent is spent in four places and nowhere else:** a link's underline — the optional section link and every link inside an answer — **11 Tabs' active tab underline**, **7 Index's current-group item** (A1·1's active nav item), and the focus ring. The marker is muted or `text`, an open row takes no tint, and a group label is not accented. **8 Contrast Band substitutes the band's carried colour for all of them**, because the pack's dark accent is 2.3:1 on the light band. **14 Ask carries the category's one filled accent button.** Two designs can contain no accent pixel at all: 3 Open List and 15 Ledger with no link authored.

**Seven stated refusals.** No Expand all or Collapse all — that is 3 Open List, chosen once by the site. No question count in the resting state, and no per-group count — **12 Filter's count while the field has text is the stated exception**. No “Was this helpful?”, votes or thumbs: Ghost stores no answer to that question. No icon per question — the marker is the only glyph in a row. No chat launcher, “ask AI” or search-the-site field. No accordion inside an accordion, and no answer that opens a second answer. No “popular”, “new” or “important” flag on a row — order is the site's statement of priority, and 9 Numbered is the design that makes it visible. **Flagged**: all seven.

**Print: every row prints open, in every design, and the marker is not printed.** A printed FAQ with eight closed rows is eight questions and no answers. 8 Contrast Band drops its band, 12 Filter drops its field, 7 Index drops its index, 11 Tabs prints every group, 14 Ask prints its label with the URL beside it. **Flagged**.

**Section padding Compact 64 · Comfortable 96 · Spacious 132**, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. Two designs carry their own scale: **8 Contrast Band's band at 44 · 64 · 88** (A4·9's) and **13 Slim's at 32 · 44 · 56** (A7·8's).

**Responsive floor.** A one-column list of rows needs no collapse, which is why eleven designs change nothing but their type and their padding. **What collapses is a second axis:** 2 Two Column's two lists stack at ≤ 767 · 4 Cards takes two columns at 1080 and one at 767 · 5 Split Head puts its head above the rows at 1080 · 7 Index moves its index above the rows at 1080 · 10 Image Split stacks image over rows at 1080 · 11 Tabs hands its behaviour to 6 Grouped at 767 · 15 Ledger puts its answer under its question at 1080. **The authored order is the drawn order at every width in all fifteen.**

**Empty.** No eyebrow, sub, note or link → absent. No groups → the designs that read them hand off. **No items → the section does not render**; the editor shows the empty repeater and its Add question control. An item cannot be saved without both a question and an answer, so there is no half-row to draw. One item where a design wants more → the design named in its panel.

**Content.** Orbit Weekly's membership questions throughout. Head: eyebrow **Questions**, title **“What members ask us most”**, sub **“If your question is not here, write to us and a person will answer it.”**, note **“If something here is out of date, tell us and we will fix it.”**, link **“Email the editors”**. The first four questions are settlement 3's four answer shapes in order: **“What do I get with a membership?”** (a paragraph and a three-item list) · **“When does the Thursday letter arrive?”** (one sentence) · **“Can I read the archive without a membership?”** (a paragraph with a link) · **“How do I cancel?”** (two sentences, no formatting). Eight more carry the longer designs: **“Do you offer student rates?”** · **“The letter isn't arriving. What should I check?”** (a list with inline code) · **“Can I gift a membership?”** · **“Is there an app?”** · **“Do you take corporate subscriptions?”** · **“What happens to my email address?”** · **“Can I write for Orbit Weekly?”** · **“Where does the printed quarterly ship?”** Four group labels: **Membership · The letter · The archive · Everything else**. **Flagged**: every fact inside these answers is invented — the Thursday 07:00 send, the student rate, the printed quarterly, the corporate threshold, the RSS path.

---

## 1 · Accordion

One column of hairline rows on a 780 px measure, centred in the 1,296 width. The design a site reaches for when it types “FAQ” into the picker, the one A9-0's row component was drawn for, and **the design seven others hand off to**.

**Fields** · every field except `image`, `imageAlt` and `groupLabel`; **every item of `items[]`, one to twenty-four**. `group` kept and ignored.

**Controls** · Padding: Compact 64 · Comfortable 96 · Spacious 132. Head: Centred · Flush left · None. Title size: Medium 34 · Large 40 · Display 48, unavailable at head None. Question size: Row 17 · Large 20 · Feature 24. Marker: Chevron · Plus. **Open on load: All closed · First open** — the only design that offers it.

**Arrangement** · list 780, answer 620 at the row's left edge; **row padding follows the question, 16 · 20 · 28**; **Rows shown is not a control — every authored question is drawn**, so the panel reads “24 of 24”. The list follows the head's alignment: centred on 780, or at the left margin.

**Responsive** · nothing collapses. List 780 → 690 at 834 → the full column at 390; **the answer's 620 measure is a cap and does not scale**. At 834: padding 80, title 34, question one step down, sub on 560. At ≤ 767: padding 64 / 20, row padding 14 with a 44 px target, list indent 20 unchanged.

**Empty** · head parts, note and link → absent; at head None there is no `<h2>` and no accessible name. **One question → one row.** This design has no floor and hands off to nothing.

**a11y** · `<h3>` + full-width `<button aria-expanded aria-controls>`; answer a `role="region"` labelled by the button; closed answers `hidden`. One tab stop per row, Enter and Space, **no arrow-key navigation** — an accordion is not a composite widget and stealing the arrow keys stops a reader scrolling. Marker `aria-hidden`, never the only signal. Contrast: question 15.8:1 / 15.1:1, marker 5.6:1 / 6.2:1 resting, underline 3.3:1 / 6.3:1.

**Flagged** · the 780 list and its 690 tablet step; the answer at the row's left edge rather than indented; **drawing every authored question with no count control**; row padding following the question; the 16 px hover overhang; the plus losing its bar; refusing arrow keys; the panel's find-in-page wording.

---

## 2 · Two Column

Two independent lists of 632 on a 32 px gutter, split by count. Settlement 4, built.

**Fields** · 1 Accordion's exactly, **six, eight or twelve items**. Switching to or from 1 Accordion changes the arrangement and nothing else.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Question size: Row 17 · Large 20** — Feature 24 not offered, Row forced at 834 and below. **Divider: Gutter · Rule**, the rule's inset 32 at 1440 and 20 at 834. Rows shown: Six · Eight · Twelve.

**Not offered, and stated in the panel** · Open on load, because First open would open the left column alone and read as a mistake in the right; Marker, because two columns of plus signs read as arithmetic.

**Arrangement** · 632 · 32 · 632 = 1,296 at Gutter. **At Rule, two halves of 648 and 647 with 32 px of inset either side of the hairline, measures 616 and 615** — 616 + 32 + 1 + 32 + 615 = 1,296, and the rule's own pixel comes out of the right half, which is the only asymmetry an odd content width allows. Both columns top-aligned and **never equal in height**. Row padding follows the question, 16 or 20. The answer takes the column inside its padding, capped at 620. The rule is a `border-left` and runs the height of the taller column.

**Responsive** · two columns above 767. At 834, 365 + 24 + 365 = 754 inside the margins, halves 377 and 376 at a 20 px inset, **the question forced to Row 17 and the control saying “Row at this width”**. **At ≤ 767 the two lists stack and read as one sequence in authored order**; the divider is not drawn.

**Empty** · fewer authored than shown → that many drawn, still split by count. **Four or fewer → hands off to 1 Accordion**, because two columns of two rows is a table of contents.

**a11y** · **two `<ul>`s, not one** — two independent columns, and pretending otherwise would misreport where a row's neighbours are; it costs a screen-reader user one extra “list of four” announcement, and the panel says so. The lists take no roles, labels or headings. Tab order 1 to 8, authored order at every width. The divider is decorative. Every row prints open in one column.

**Flagged** · the 632/32 division and the 648/647 Rule halves; the count split and the extra row going left; **both refusals and their reasons**; two lists rather than one and its stated cost; the default at Row 17; the forced Row and 20 px inset at 834; not offering Open on load or Marker; the hand-off at four.

---

## 3 · Open List

Every answer drawn: question above answer, rows between hairlines, one column on 780. **No button, no marker, no region, and — unless a link is authored — nothing focusable in the whole section.** The design ten accordion panels name.

**Fields** · 1 Accordion's, **four, six or eight items**. The `anchor` is drawn as an `id` on the `<h3>` even though nothing opens, so a link into this design lands where it would in every other one.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20 · Feature 24. **Rules: Between · Above and below · None.** Rows shown: Four · Six · Eight.

**Arrangement** · 1 Accordion's row with the button taken out: same 780 list, same 620 answer, same row padding and same step-linked gap. **At Rules None the rows sit 40 px apart whatever the padding control says** — the row padding is what a hairline needs on each side of it, and with no hairline 20 px does not end an answer. **The answer stays 16 px at every question size**, so the ratio narrows from 20:16 to 17:16 and the hierarchy is carried by weight.

**Responsive** · nothing collapses; the 620 cap and the 20 px list indent do not scale. At ≤ 767: padding 64 / 20, answer 16 / 1.6, row padding 16.

**Empty** · **one question → one row with no hairline under it**; no hand-off at any count. **Nothing here can be missing at a width or hidden by a state.**

**a11y** · `<h2>`, `<ul>`, `<h3>` and prose. **No button, no `aria-expanded`, no `role="region"`, no marker, no hover, no motion.** The `<h3>` carries `tabindex="-1"` so a deep link can move focus without adding a tab stop — **the only `tabindex` in A9's accordions' sibling designs**. **Print and screen are the same drawing.** In forced colours the design is unchanged apart from the system's colours.

**Flagged** · reusing 1 Accordion's row rather than drawing a second; **holding the answer at 16 px while the question steps**; the 40 px Rules None value; the `tabindex="-1"` heading; eight as the ceiling; drawing the anchor where nothing opens; the panel's advice to use 1 Accordion for long answers.

---

## 4 · Cards

One question and its answer per card, three of 416 on a 24 px gutter — A8·2's grid and card carrying a question. Always open, because **a card that has to be pressed to show its contents is a card with nothing in it**.

**Fields** · head fields, note, link pair, **three or six items**.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Columns: Two · Three.** Questions shown: Three · Six. Cards: Surface · Ground.

**Not offered** · Question size, fixed at Row 17 because 20 px in a 416 card runs most questions to three lines; Marker and Open on load; Hairline columns, refused as in A8·4 — a vertical rule that stops between two rows is a table's rule without a table's header.

**Arrangement** · 416 · 24 at three columns, 632 · 32 at two; **card padding follows the count, 28 and 32**; pack radius, 1 px hairline, **no shadow at any value**; question to answer 12; the answer takes the card inside its padding. **Rows are equal within a row and never across the grid**, the slack falling at the foot of the short cards; nothing is truncated, clamped or moved to another row. **The editor's counter turns muted past 450 characters and names 1 Accordion**; the field's ceiling is still 900.

**Responsive** · three columns above 1081; **two at 1080 and below at both Columns values**, disclosed as “Two at this width” — 365 cells on 24 at 834, card padding 24. **At ≤ 767 one column 16 px apart, and every card is its own height because there is no row.**

**Empty** · **fewer authored than shown draws what exists** — five at Six is five cards and the last cell is absent, not empty. **Two → two 416 cards centred, not widened; one → hands off to 1 Accordion.**

**a11y** · **one `<ul>` of six, never two lists of three**; `<h3>` per question with `tabindex="-1"`; no button, region, marker, hover or motion; cards are not links. The equal-height stretch is invisible to assistive technology. **In forced colours the card keeps its hairline and loses its fill, which makes Surface and Ground the same drawing** — stated, not corrected. Print: one column, hairlines kept.

**Flagged** · fixing the question at Row 17; the 12 px gap in a card; **the 450-character advice**; six as the ceiling; two cards centred and not widened; the hand-off at one; the forced-colours note.

---

## 5 · Split Head

The head in a 416 px column at the left margin, the accordion in an 824 px column at the right, on A8·6's 56 px gutter. **The head does not move when a row opens** — it is not centred against the list, which is why the top alignment was worth inheriting.

**Fields** · every field except `image`, `imageAlt` and `groupLabel`; **five or eight items**.

**Controls** · Padding: 64 · 96 · 132. **Title size: Medium 34 · Large 40** — Display 48 not offered in a 416 column. Rows shown: Five · Eight. Head column: Left · Right. **Foot: Under the head · Under the rows.** Marker: Chevron · Plus.

**Not offered** · Question size, fixed at Large 20 — Row 17 in an 824 row reads as small print beside a 40 px title; Head alignment, because the head column is always left-aligned inside itself; Open on load.

**Arrangement** · 416 · 56 · 824 = 1,296, both columns top-aligned, **the head never sticky and never vertically centred**. Row padding 20, question to answer 16, **the answer capped at 620 inside an 824 row** — the widest gap in A9 between a row's width and its answer's measure. Head to sub 12, sub to foot 20. **The foot is under the head by default** — the note and the link are the publication speaking and the rows are the reader asking. **Under the rows takes a rule above it**, the same hairline that separates two questions, **which makes the note look like one more row**. The note and the link always travel together. Head column Right is `row-reverse`, visual only.

**Responsive** · **the split is what leaves.** At 1080 and below the head goes above the rows, full width on a 620 measure; **Head column Right draws left**; **the foot at Under the head lands above the rows**, disclosed in the sidebar. At ≤ 767 this design and 1 Accordion are the same drawing, and the panel says so.

**Empty** · no eyebrow or sub → the head column closes up. **No title → hands off to 15 Ledger.** No note and no link → the foot is absent and the control unavailable. **Two or fewer questions → 1 Accordion.**

**a11y** · **the two columns are a flex row, not two landmarks** — no `<aside>`, no roles, no second heading. The head is read first at both Head column values; **the Foot control changes reading order as well as position**. Hairlines are borders, never `<hr>`.

**Flagged** · fixing the question at Large 20; the 620 cap inside an 824 row; **keeping the head's internal left alignment at Head column Right**; not offering Open on load; both hand-offs; stating that the phone frame is 1 Accordion's drawing.

---

## 6 · Grouped

Group labels with their own rows beneath, stacked down one column. The first of three designs that read `groups[]`.

**Fields** · `title`, `sub`, `note`, link pair, **two to four groups drawn (six the field's ceiling)** and every item with its `group`. **`eyebrow` is kept and never drawn** — the group labels take the eyebrow's type, and two ranks of 13 px uppercase in one section is one of them competing.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Question size: Row 17 · Large 20** — Feature not offered, because three labels and twelve questions is already three ranks. **Group label: Above the rows · Beside the rows.** Marker: Chevron · Plus.

**Arrangement** · list 780 at both label values; at Beside, **200 · 56 · 780 = 1,036 centred**, the label top-aligned with its first row's text rather than with the hairline. **Group label 13 px / 600 / uppercase / .08em in `text`, never muted, never stepping with width** — a muted label above full-strength questions reads as a caption for them. Label to first row 20 · 16 · 14; **group to group 48 · 40 · 32**, the same 48 the head takes above a list. Every group's rows carry a hairline each and none under the last, so the gap is the only thing dividing two groups.

**Responsive** · at Group label Above nothing collapses. **At Beside, 834 and below draws Above** and the control says “Above at this width”, because 200 + 56 + 690 does not fit inside 754.

**Empty** · **a group with no questions is not drawn, label included.** **Questions with no group are drawn as a last unlabelled set** after every labelled group — no label is invented for them, not “Other”, not “More”, not “General”. **A group of one is drawn as a group of one.** **No groups authored → 1 Accordion.**

**a11y** · **each group label an `<h3>` and each question an `<h4>`**, which amends A9-0 and is logged in its consistency pass. **One `<ul>` per group**, the ungrouped set a final list with no heading. Labels are not focusable and **a group cannot be collapsed as a whole** — that is an accordion inside an accordion. Every group is drawn at all times, so a deep link reveals no container. Print: rows open, labels and gaps kept.

**Flagged** · the label's type and full-strength colour; suppressing the section eyebrow; both group gaps and their steps; the 200/56/780 geometry and its 834 fallback; the unlabelled last set; not drawing an empty group; the hand-off; **the `<h4>` heading level**.

---

## 7 · Index

A jump list of group labels at the left margin, every group of rows at the right. Up to twenty-four questions in up to six groups, all drawn. **The only design in A9 with a copy-link affordance, and the library's first sticky element inside a section.**

**Fields** · head fields, note, link pair, **every group and every item, up to twenty-four**. `anchor` is drawn as the row's `id` and as the copy button's clipboard value. **The index is generated from `groups[]` and is not a separate field** — a second list of labels to keep in step with the first is a list that goes wrong.

**Controls** · Padding: 64 · 96 · 132. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20. Index column: Left · Right. **Index behaviour: Sticky · Static.** **Copy links: Shown · Hidden.**

**Not offered** · Head alignment — always flush left, because a centred head over a left-hand index is two alignments; Marker, fixed at Chevron; Open on load, fixed at All closed; Groups shown, because this design draws everything.

**Arrangement** · **240 · 56 · 780 = 1,076, the remaining 220 px of the content width left empty** — a FAQ's rows do not get wider because the page has an index beside them. **The head and the foot sit on the rows' column**, not across both. Group label and gaps as 6 Grouped. **The index item is A1·1's nav item cited verbatim**: 15 px, muted at 500 resting, `text` at 600 with a 2 px accent underline for the current group — **a fourth place A9 spends the accent, amending A9-0**. The current-group mark follows the scroll; it is not a timer and nothing animates.

**Sticky, with four conditions** · 24 px from the top of the viewport; **above 1080 only**; **only while the rows are taller than the viewport**; and it stops at the foot of the rows rather than travelling into the next section. A8·6 settled that a *head* never sticks; an index is not a head — its whole use is arriving somewhere else, and at twenty-four rows an index that leaves after the first group can be used once. **Static is a second value, not a fallback**, for a site whose header already sticks. **Position is not motion**: reduced motion changes none of it.

**The copy link** · a mono `#` at 14 px — a typed character rather than an icon, so it needs no glyph set and survives every pack. **`border`-coloured at rest (1.19:1, not information) and muted on the row a pointer is over or a keyboard has focused.** It is a `<button>` **beside** the question's button, never nested, 44 px tall, always in the DOM and always in the tab order, named “Copy link to this question”. **Pressed replaces the character with “Link copied” for two seconds**, announced once through a polite live region — no toast, no tooltip, no tick. **Hidden removes the button entirely** rather than hiding it from pointers; the anchors still work. **Not drawn at ≤ 767 at either value**: there is no hover to reveal it and a phone's share sheet already copies the URL.

**Responsive** · two columns above 1080. **At 1080 and below the index moves above the rows as a wrapping row of links over a hairline and stops sticking**; Index column and Index behaviour are disclosed as having no effect. At ≤ 767: group to group 32, no copy buttons.

**Empty** · a group with no questions is not drawn; **ungrouped questions are drawn last, unlabelled, and are not listed in the index** — there is no label to list. **No groups → 6 Grouped; fewer than six questions → 1 Accordion.**

**a11y** · the index a `<nav>` labelled “On this page” with **`aria-current="location"`** on the current group — not `page`, because the page has not changed. Group labels `<h3>` with `tabindex="-1"`, questions `<h4>`. **The copy button costs one extra tab stop per row**, which is why it has a control. **In forced colours the index also stops sticking**, because a floating column with a transparent background over moving text is unreadable when the system picks both colours. Print: index dropped, rows open.

**Flagged** · the 240/56/780 division and the 220 px left empty; **the sticky exception and its four conditions**; **the accent's fourth place**; the `#` and its two resting colours; “Link copied” for two seconds; dropping the button below 767; the head inside the rows' column; both hand-offs; the forced-colours rule.

---

## 8 · Contrast Band

1 Accordion inverted onto the `contrast` token. **Switching between this design and 1 Accordion changes nothing but the colours** — the tokenisation claim at its hardest.

**Fields** · 1 Accordion's exactly, **four or six items**.

**Controls** · **Band padding: Compact 44 · Comfortable 64 · Spacious 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390) — it replaces the section's Padding control. Band width: Full bleed · Inset. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20 · Feature 24. Rows shown: Four · Six.

**Derived colours, all from the token pair** · muted = carried at **72% in light and 70% in dark** (A8·9's pair), hairline = carried at 18%, **hover plane and inline-code chip = carried at 6%**. Light `#232019` / `#FBF9F5` → `#BEBCB7`, `#4A4741`, `#302D26`. Dark `#EDE7DA` / `#171511` → `#57544D`, `#C6C1B6`, `#E0DACE`. Using `surface` or `border` here would put a light hairline on a dark band. No shadow at any value. **A hovered row's code chip disappears into the plane** — two 6% fields on one row is a boundary nobody needs to see.

**The accent is unavailable** · the pack's dark accent is **2.3:1** against the light band and a 2 px indicator needs 3:1, so **the answer's links and the focus ring take the carried colour in both modes**. The light-mode accent would pass at 4.8:1 and is still not used: a link that is accent-underlined in light and carried-underlined in dark is two different links in one theme. The sidebar shows the failing ratio at the disabled value. **This section has no accent in it at all.**

**Responsive** · 1 Accordion's, plus the band's own padding step. **The band always keeps a horizontal margin** — 72 / 40 / 20. **Inset draws full bleed at ≤ 767**: an inset band inside a 20 px margin is a card, and A9 has no card design on a band.

**Empty** · **one question → one row on the band; this design keeps its own frame and hands off to nothing**, because the band is what the site picked.

**a11y** · 1 Accordion's structure unchanged; **the band is a background, not an element**. Text on band 15.8:1 light / 14.7:1 dark, muted 8.7:1 / 6.0:1, hairline 2.4:1, **focus ring 15.8:1 / 14.7:1 — the strongest ring in A9**. **Forced colours drop the band and keep every hairline; print drops the band and prints every row open in `text` on white.**

**Flagged** · the 6% hover plane and its 1.15:1 step; the code chip sharing that mix; six as the ceiling; dropping the band in print; the panel's “one band per page” line. **Cited rather than mine:** the band, the 44 · 64 · 88 scale, the three mixes, the accent substitution and the 2.3:1 refusal — all A8·9's and A4·9's.

---

## 9 · Numbered

Questions numbered in the pack's heading font at Display 40, the question at Feature 24 beside the numeral, the answer beneath. Always open. **Order is the only thing a FAQ can say about priority**, and this is the design that makes it visible.

**Fields** · head fields, note, link pair, **four or six items**. **There is no numeral field:** numbers come from the item's position in the repeater, so reordering renumbers and a site cannot type its own — a list whose sixth row says “09” is a list with a mistake in it.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Questions shown: Four · Six. **Numerals: Padded 01 · Plain 1.** **Numeral position: In a column · Above the question.** Rules: Between · None.

**Not offered** · **Title size — fixed at Medium 34**, because §2 allows one display moment per section and the numerals have taken it; Question size, fixed at Feature 24; Marker and Open on load.

**Arrangement** · **72 · 32 · 676 = 780** at In a column — 72 because “06” at Display 40 in a serif is 48 px wide and a two-digit numeral at twelve would be wider, and holding 72 at every count keeps the questions on one vertical. **The numeral sits on the question's cap height, not its baseline.** Numeral **Display 40 / 34 / 28 in `text-muted`** — large text at 5.6:1, and not the accent, because six accent numerals would be the loudest thing in the category. Row padding 28 / 24 / 20; question to answer 20; answer capped 620 inside 676. At Above the question: no column, text on 780, numeral to question 20 — deliberately the same as question to answer, because there the numeral belongs to the question. **At Rules None the rows sit 48 px apart, 40 on a phone.**

**Responsive** · the numeral column narrows 72 → 64 at 834 with the gutter at 28 and the text column at 598. **At ≤ 767 the numeral goes above the question at both position values**, disclosed as “Above at this width”, because a 64 px column leaves 258 px of question.

**Empty** · fewer authored than shown → that many rows, numbered from 01. **One question → one row numbered 01.** Past six the panel names 1 Accordion without refusing the content.

**a11y** · **an `<ol>` — the only ordered list in A9** — with the drawn numeral `aria-hidden` and **outside the `<h3>`**, so it is in neither the heading's name nor the announcement, and a screen reader hears “1 of 6” once. `tabindex="-1"` on each heading. No button, region, marker, hover or motion. **In forced colours the numeral takes the system's text colour and stops being quieter than the question**, which flattens the hierarchy to size alone — stated, not corrected. Print and screen are the same drawing.

**Flagged** · the 72/32 division and its 64/28 step; the cap-height alignment; the muted numeral; **capping the title at Medium 34**; Padded as the default and both values sharing one column width; **refusing a numeral field**; the 48 and 40 Rules None values; forcing Above below 767.

---

## 10 · Image Split

A photograph on one half, the accordion on the other, both top-aligned, on a 32 px gutter. **The only design in A9 that reads `image`.**

**Fields** · head fields, note, link pair, **`image` and `imageAlt`**, and **four or six items**. The photograph is an uploaded file on the section, not a post's feature image. No `imageAlt` → `alt=""`.

**Controls** · Padding: 64 · 96 · 132. Title size: Medium 34 · Large 40. **Division: Even 632/632 · Rows-led 760/504** — an image-led division is refused, because a 504 px accordion is a column of two-line questions and a section whose photograph is wider than its content is A4's hero. Image side: Left · Right. **Crop: Portrait 4:5 · Square 1:1 · Landscape 3:2**, named and not computed, `object-fit: cover` on the file's centre, **no focal-point control**. Rows shown: Four · Six.

**Not offered** · Question size, fixed at Large 20; Marker; Open on load; **any visible caption** — a caption under a photograph beside a FAQ is a third voice.

**Arrangement** · 32 px gutter; **both columns top-aligned and neither stretching** — the image is its crop's height (790 · 632 · 421 at 632 px wide), the rows are as tall as their content, and the shorter column simply ends. Open three more rows and the rows become the taller column while the photograph stops at its own foot. **No `align-items: stretch`, no cropping to match, no sticky image.** Head above the pair on 780, foot below on 620. Image at the pack radius, **no shadow and no scrim**. Row padding 20, question to answer 16, answer capped 620. **Square comes closest to matching six closed rows**, and the panel says so.

**Responsive** · two halves above 1080. **At 1080 and below they stack, image above the rows at both Image side values, and the crop is forced to 3:2** — a 4:5 portrait at 754 px is a screen of photograph before a reader reaches a question, and a photograph *under* a FAQ reads as an illustration of the last answer. Division and Image side are disclosed as having no effect. At 834: image 754 × 503. At ≤ 767: image 350 × 233.

**Empty** · **no image → hands off to 1 Accordion**; there is no placeholder and no coloured block at any width. Two or fewer questions → 1 Accordion.

**a11y** · the photograph an `<img>` with real alt text — **the only image in A9** — never a CSS background, not a link, no hover, no motion; A14 Galleries owns anything a reader can open a photograph into. The two halves are a flex row, not two landmarks. **Image side changes DOM order and the control says so**: at Left the photograph is read before the questions, at Right after them. In forced colours the image is kept and the halves stack.

**Flagged** · the 632/32 division and the 760/504 alternative; **refusing an image-led division**; **refusing to stretch either column**; the head above the pair; fixing the question at Large 20; the three crop heights and the Square advice; refusing a caption; the hand-off.

---

## 11 · Tabs

Group labels as a tab row, one group's questions shown at a time. **A5·12's tablist structure and behaviour with A8·11's tab styling** — 15/500 resting, 15/600 active, a hover surface plane, a 2 px accent underline — the second use of that departure rather than a new one.

**Fields** · head fields, note, link pair, **three or four groups** and every item belonging to a drawn group. **Ungrouped questions are not drawn at all and no “Other” tab is invented; the panel says how many are being left out.**

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20. Rules: Between · None. **Groups shown: Three · Four.**

**Not offered** · a tab row below the panel; six groups — two rows of tabs above three questions is a section whose navigation is taller than its content; **an All tab**, because a tablist whose first tab contains every other tab is not a choice; **a disclosure inside the panel** — A9-0's refusal, since a disclosure inside a disclosure is two doors to one sentence.

**Arrangement** · the tab row 4 px apart, following the head's alignment, on a hairline with the active tab's 2 px accent underline over it; the panel 48 px below. **The rows inside a panel are 3 Open List's rows exactly.** **The panel is its own height and the section's height changes when a reader switches** — against A8·11, which fixed its panel to the longest quotation: a group of five and a group of one are honestly different lengths, and forcing the shorter to the taller would put 400 px of white space under two questions. **160 ms cross-fade, instant under reduced motion, first tab active on load and never remembered.** At Rules None the rows sit 40 px apart.

**The cost, stated** · **seven of ten questions are not on the page on load, and neither are their answers.** They carry `hidden` — correct for a tablist — so **they are absent from the heading rotor as well as from find-in-page**, which is worse than an accordion's cost: an accordion hides answers but shows every question. **The panel states it and names 6 Grouped.**

**Responsive** · tabs above 767. At 834 four labels fit on one row; a fifth or a longer one **wraps to a centred second row with the hairline under the last row**; **a horizontally scrolling tab row is refused at every width**. **At ≤ 767 the behaviour is handed off: no tabs, every group drawn as 6 Grouped's stack with its label**, and the sidebar says “Tabs above 767, every group below”.

**Empty** · a group with no questions gets no tab. **One group → 6 Grouped**, since a tablist of one is a heading. **No groups → 1 Accordion.**

**a11y** · `role="tablist"` / `role="tab"` with `aria-selected` and `aria-controls`, roving `tabindex`, arrow keys, `role="tabpanel"` labelled by its tab, inactive panels `hidden`. The tab's accessible name is the group label and nothing else. **Questions are `<h3>`** — the tab is the label, so no `<h4>` here. No buttons or regions inside the panel. **Print: every group printed in full with its label** — a printed page with three tabs and one panel is a page missing three quarters of its content.

**Flagged** · **the panel taking its own height**; the `<h3>` level and its reason; four as the ceiling; **refusing an All tab**; not drawing ungrouped questions and stating the count; printing every group; both hand-offs. **Cited:** the tablist (A5·12), the tab's weights and plane (A8·11), wrap-not-scroll (A8·11).

---

## 12 · Filter

A4·15's field above the accordion, narrowing the list as a reader types. With 7 Index one of the two designs that hold twenty-four questions, and the opposite answer to the same content: **an index shows a reader the shape of the whole thing; a filter shows them one part of it and hides the rest.**

**Fields** · head fields, note, **link pair used twice — in the foot and in the no-match state** — and **twelve, eighteen or twenty-four items**. **The placeholder and the no-match wording are the theme's, not fields**: a filter that says something other than what it does is the failure this design is avoiding. The filter is client-side over the authored rows and queries nothing.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20. **Field width: Full · Narrow 420.** Rows shown: Twelve · Eighteen · Twenty-four.

**The field** · A4·15's — 48 px tall, `surface`, 1 px `border`, pack radius, 16 px text, a 19 px glyph inset 16, **32 px above the first row**, on the list's measure at Full. **No submit button and no `<form>`**; Enter is a no-op. A 44 px Clear button with a 15 px cross when there is text, labelled “Clear”; Escape clears and keeps focus in the field. **The placeholder says “Filter questions” rather than “Search”**, because it filters the rows on this page and does not search the site.

**The behaviour** · **matches question text only**, case- and accent-insensitive, whole substrings, **no stemming and no fuzzy matching**. Matching a closed answer would return rows whose visible words do not contain the term, which reads as a broken filter; **for text inside answers the panel names 3 Open List and a browser's own find**. The matched term is marked in the question **with the hover surface as a `<mark>` plane, no accent and no bold**. **The count “N of M questions” is drawn and announced only while the field has text** — 13 px muted, 12 px above the first row — which is the stated exception to A9-0's refusal of counts, and the only way either a sighted or a screen-reader reader knows the list got shorter. **Filtered-out rows are removed from the flow with no transition at any motion setting**: a list that animates on every keystroke is unreadable. An open row stays open while it matches. **Nothing is remembered, written to the URL or read from it**, and **a deep link loads the section unfiltered with an empty field**.

**No match** · the term is quoted back — “No question here mentions “refund”.” — with **the section's own authored link** beneath it, not a new one; **with no link authored the first line stands alone**. The rows are gone, not dimmed, and the field keeps its text so a reader can edit rather than retype.

**Responsive** · **nothing collapses.** The field takes the list's width at Full — 780 / 690 / the column — and 420 at Narrow, **full width at ≤ 767 at both values**. Field height 48 at every width, because 48 is a touch target rather than a proportion.

**Empty** · fewer authored than shown → that many rows. **Fewer than twelve → hands off to 1 Accordion**, since a filter over eight rows is a control with nothing to do.

**a11y** · `<input type="search">` with a **visually hidden real `<label>`** — a placeholder that disappears when a reader types is not a name. **The count is one `aria-live="polite"` element serving both sighted and screen-reader readers, debounced 500 ms.** **Filtered-out rows are removed from the DOM, the only place in A9 where content leaves the tree**; clearing restores every row in authored order. **Focus is never moved for a reader.** The `<mark>` survives forced colours as the system's own mark styling. Print: no field, every row open and unfiltered.

**Flagged** · **matching questions only**; **the count as the stated exception**; the `<mark>` plane; removing rather than hiding rows; “Filter questions” and the theme owning the copy; the no-match wording and its reuse of the section's link; refusing a submit button; the 420 Narrow value; twelve as the floor; not printing the field.

---

## 13 · Slim

Three or four rows in a tight band, no head, **its own 32 · 44 · 56 padding scale** (A7·8's) and a **300-character ceiling** no other design imposes. The design for the four questions that follow a pricing table.

**Fields** · **three drawn** — `question`, `answer`, `anchor` — from three or four items. **Ten kept and never drawn**: `eyebrow`, `title`, `sub`, `note`, `linkLabel`, `linkUrl`, `image`, `imageAlt`, `groupLabel`, `group`. **The most any design in A9 keeps, and the reason switching away loses nothing.**

**Controls** · **Padding: Compact 32 · Comfortable 44 · Spacious 56** (28 · 40 · 48 at 834, 20 · 28 · 36 at 390). Ground: Background · Surface. **Rules: Above and below · Above only · None** — **Above and below is the default**, the only design in A9 whose Rules default is not Between: with no head above them, the rows need a top edge to start against. Question size: Row 17 · Large 20. Rows shown: Three · Four. Marker: Chevron · Plus.

**Not offered** · Head, at any value; Title size; Open on load.

**Arrangement** · list 780 centred, answer capped 620, **row padding fixed at 14 at both question sizes — the only place A9 tightens the row** — question to answer 12, **Rules None 28 px apart**. At Ground Surface the rows sit in a `surface` panel with a 1 px hairline, the pack radius, **32 px of padding and 20 on a phone, no shadow**, and the Rules values apply inside it. **The difference between this design and 1 Accordion at head None is the padding, the answer ceiling and the refusal of lists**, and the panel states all three.

**The ceiling** · **300 characters, hard, and a hand-off rather than a truncation.** Past 300 the section draws 1 Accordion and the counter reads “312 characters — drawing 1 Accordion. Under 300 for a slim band.” The field still stores 900. **A list, an ordered list or inline code in an answer hands off too, at any length** — three bullet points inside a 44 px band is a section pretending to be a strip — and the editor says “Lists and code need a full section” rather than stripping the markup out of what somebody wrote. **Links and bold are kept.**

**Responsive** · nothing collapses and nothing is cropped; all three or four rows are drawn at every width. Row padding 14 above 767 and 13 below.

**Empty** · nothing to be absent. **One or two questions → drawn as one or two rows.** **Five or more authored → four drawn and the panel names 1 Accordion.**

**The boundary** · **A6·10 Slim** is a banner: it asks for something and ends in a link. **A2's bars** sit above the header, are dismissible and can rotate. **1 Accordion at head None** is these rows with the section's own padding, no ceiling and lists allowed. This is a band in the flow of a page that answers three or four short questions and asks for nothing: **no head, no note, no link, no button, nothing sticky, nothing dismissible.**

**a11y** · **no `<h2>` and no accessible name** — with 15 Ledger the only two in A9 — the questions still `<h3>`, a skipped level that is the honest structure for a band inside somebody else's section. Otherwise 1 Accordion exactly. The panel is a plain `<div>` with no role. **44 px targets at the tightest padding in the category:** 13 + 24 + 13 on a phone.

**Flagged** · the 14 px row padding; **the 300-character ceiling and the refusal of lists and code, with the hand-off rather than a strip**; Above and below as the default; the 28 px Rules None value; the panel's 32 / 20 padding; four as the ceiling; drawing no head, note or link at any value; the three boundaries.

---

## 14 · Ask

The accordion with a contact panel at its foot: the section's `note` as one sentence and its link as **the only filled accent button in A9**.

**Fields** · head fields, **`note` and the link pair as the panel**, and four or six items. **No new field:** the panel has no heading of its own, because inventing one would mean inventing a field.

**The button needs a reason** · A6 CTA Banners owns the ask, and a FAQ that ends in “Subscribe” is a banner with questions as its copy. This button asks for nothing except the reader's own question. **It is a `mailto:`, a contact page or a help address and never a subscribe, a trial or a purchase** — **the editor warns on a link to a checkout, signup or trial and names A6·11 Reasons**, and the warning does not block the save, because a theme cannot know every URL.

**Controls** · Padding: 64 · 96 · 132. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20 · Feature 24. Rows shown: Four · Six. **Ask panel: Card · Rule above · None.**

**Arrangement** · at **Card**, the shared card at the list's width — `surface`, 1 px hairline, pack radius, **32 px padding, 24 at 834, 20 at 390, no shadow** — holding the note at 17 px in `text` on a 480 measure and the button at the right, **40 px below the last row**. **The note is `text` here and muted everywhere else in A9**: in the other fourteen designs it is a footnote under a list, and in this one it is the panel's whole sentence. At **Rule above**: no plane, the row's own hairline, 24 px either side, so the panel reads as the last item in the list. At **None**: the category's ordinary muted foot and an underlined text link — **not an empty state**, but a value, so a site can take the button off after a campaign without switching designs. **The panel is not drawn unless both the note and the link pair are authored.**

**The button** · **A1·1's primary, cited whole** — accent fill, carried text, 14 px at 600, padding 9 × 17, the radius token; hover darkens the fill one step; focus takes A6's ring with the card as the inner gap. Its label is `linkLabel`, capped at 20 characters. **The button never changes size except at ≤ 767**, where the panel stacks and it goes full width at 15 px with 12 px of vertical padding — A1·1's drawer rule.

**Responsive** · the note and the button hold one row down to 767, the note's measure narrowing to 420 at 834. Nothing else collapses.

**Empty** · **no link pair → the panel is not drawn and the note falls back to the muted foot**; no note and no link → no foot at all and the control unavailable. **One question → one row and the panel.** No hand-off out.

**a11y** · 1 Accordion's structure plus a plain `<div>` holding a `<p>` and an `<a>` — **no role, no label, no heading**. **The button is an `<a href>` styled as a button**, never a `<button>`: it navigates, and a `mailto:` announced as a button would promise something that happens on the page. Tab order: the rows, then the button last, at every Ask panel value. **Carried text on the accent fill is 4.6:1 light and 4.9:1 dark — the only place in A9 where accent carries text.** Forced colours: the fill is dropped and the button takes system button colours with a 1 px border. **Print: the panel is kept, the fill is not printed, and the label prints with its URL beside it.**

**Flagged** · **allowing one filled button and the `mailto:`-or-contact rule that limits it**; the note taking `text` in the panel; refusing a panel heading; the three values and the 40 / 24 gaps; requiring both note and link; six as the ceiling; the print rule.

---

## 15 · Ledger

The question in a 300 px column at the left, the answer on 620 at the right, rows between hairlines — A8·12's geometry holding formatted prose. Always open, no head, no marker, no button. **The category's floor.**

**Fields** · `note`, link pair, and **four, six or eight items**. **`eyebrow`, `title`, `sub`, `image`, `imageAlt`, `groupLabel` and `group` are kept and never drawn** — seven fields, second only to 13 Slim's ten.

**Controls** · Padding: 64 · 96 · 132. Alignment: Centred · Flush left. Question size: Row 17 · Large 20. **Rules: Between · Above and below · None.** **Row padding: Compact 24 · Comfortable 32 · Spacious 44.** Rows shown: Four · Six · Eight.

**Not offered** · Head, at any value; Title size; Marker and Open on load.

**Arrangement** · **300 · 56 · 620 = 976**, centred or flush left, **320 px of the content width left unused** — the question column is a label column, not a second column of prose, and widening it would make a 90-character question look like the row's main text. Both halves top-aligned. **The answer's measure is the row's 620 exactly**, the one design where the two are the same number because the row was built around the cap. **Row padding is its own control, not the question's step**: with no marker and no plane, the space around a row is the only thing separating two answers. **At Rules None the rows sit 44 px apart at every value.** Rules run the full 976, never the length of a column. The foot sits 32 px under the last row on the block's left edge. Alignment moves the block and changes neither column's width.

**The long question** · 300 px at Row 17 is about 34 characters a line, so the field's 120-character ceiling is six lines and **a row can be taller than its own answer**. Nothing is truncated and the columns do not rebalance; the row grows and the answer stays at the top of it. **The editor's counter turns muted past 70 characters with “Shorter questions read better in a ledger”** — advice, not a limit.

**Responsive** · two columns above 1080; at 834 **240 · 40 · 474 = 754, the full width inside the margins** — the one width with no unused space — with the question forced to Row 17 and row padding 28. **At ≤ 767 the answer goes under the question at both Alignment values**, disclosed as “Under the question at this width”, **at which point this design and 3 Open List are the same drawing, and the panel says so.**

**Empty** · no note and no link → no foot. **One question → one row.** No hand-off out. **Two hand-offs arrive here:** 5 Split Head with no title, and any design a site leaves to put every answer beside its question.

**a11y** · a `<ul>` of `<li>`, each an `<h3>` and its prose in a flex row. **Not a `<table>`** — two columns of unrelated pairs are not tabular data, there is no header row, and a table would promise that the columns can be compared down their length — **and not a `<dl>`**, A9-0's refusal, in the layout that most tempts one. **No `<h2>` and no accessible name.** `tabindex="-1"` on each heading; reading order question then answer at every width, because the flex row never reverses. **No tab stop at all with no links authored.** Forced colours unchanged; **print and screen are the same drawing**.

**Flagged** · the 300/56/620 division and the 320 px left unused; **row padding as its own control**; the 44 px Rules None value; the 70-character advice; the 240/40/474 tablet division; stating that the phone frame is 3 Open List's drawing; taking 5 Split Head's hand-off.

---

## 16. What A9 settled, in one place

1. **Accordion or always open** · both, as designs rather than values. **Many rows open at once; opening one never closes another; no one-at-a-time value exists.** Open on load is offered in 1 Accordion alone; All open is 3 Open List; Expand all is refused.
2. **Deep-linking** · a **stored** `anchor` per item, seeded from the question. Arriving opens that row, **leaves every other row as drawn**, scrolls with 96 px above, moves focus, animates nothing and highlights nothing. Containers open with it; opening rows never touches the URL or the history. One design draws a copy-link affordance.
3. **Lists, links and code** · limited rich text, 20–900, on a **620 px measure** at 16 px in `text`. Headings, tables, images, embeds, blockquotes, code blocks and nested lists are refused with reasons. 13 Slim caps at 300 and refuses lists and code outright.
4. **Two columns** · two independent lists split by count, the extra row left, **equal in count and never in height**; CSS multi-column and a row-major grid both refused for what they do when a row opens; one column in authored order at ≤ 767 with no reordering at any width.

**And what the drawing changed** · seven statements in `A9-0` were written before the designs and overruled by them: the `<h3>` rule (two designs use `<h4>`, and 11 Tabs keeps `<h3>` for a stated reason), the accent's three places (four), sticky elements (one exists, with four conditions), the refusal of question counts (12 Filter's count while typing), the `<h2>` count (two designs have none), row padding following the question's step (13 Slim and 15 Ledger override it), and the marker's alignment (the question's first line, not the row's centre — the one change the stress frame forced on the whole category). All seven are amended in `A9-0` and logged in its consistency pass.

**Fifteen designs, six controls each, plus the Design picker.** None reached seven and none fell to five. **One image** (10 Image Split), **one input** (12 Filter), **one filled button** (14 Ask), **one `<ol>`** (9 Numbered), **one sticky element** (7 Index), **one band** (8 Contrast Band). **Nine designs hand off and three receive** — 1 Accordion from seven, 6 Grouped from two, 15 Ledger from one — and **ten panels name 3 Open List** for the cost every accordion carries.
