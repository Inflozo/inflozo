# A10 Stats and Numbers — written specification

15 designs · Paper pack · drawn in this project as `A10-1 Row.dc.html` … `A10-15 Big Type.dc.html`, with the category's shared artefacts in `A10-0 Category Proof.dc.html`.

Read `A10-0` first. It carries the four settlements §8 asks A10 to make, the stat component, the value ladder, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs and the stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times, plus the amendments the drawn designs forced on the proof.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

**Fourth pass — the controls-reconciliation patch (this document's current state), 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface, reusing the shared editor primitives designed in **P0 · Editor primitives** — the P0·1 inline text toolbar and its link popover, the P0·2 icon slot and Icon Picker, the P0·3 item-list controls, the Link Picker, and the editor state switcher. **Five things changed across all fifteen designs.** The category's Ghost refusal rested on a false premise and is corrected: `{{total_members}}` and `{{total_paid_members}}` are **public theme helpers**, not admin-API calls, so every stat gains **Value source: Authored · Member count · Paid member count**. **`count-up` ships as an opt-in section toggle, Off by default**, because the registry's own degradation sentence answers all four of §0's objections. **Icons: None · Shown** ships on fourteen designs from the curated P0·2 picker — the maintenance premise the old refusal rested on predates it. **Value, prefix, suffix and label edit inline on canvas.** And the **`stats[]` ceiling is raised from six to eight**, which 3 Grid draws at 4 × 2. Per design: 12 Sourced gains an optional `noteUrl`, 14 Change's four wordings become theme catalog strings, and 11 Inline's chip insert moves into the P0·1 toolbar's own frame. The universal trio — Background role, Vertical spacing, Top divider — now sits outside every design's control list, and every per-design **Padding** row has retired into **Vertical spacing**. §19 records every conflict with an earlier ruling, one line each.

**Specification-only pass, the session before.** Every design now carries five added fields at the head of its section — descriptor, structural descriptor, archetype, behaviour module, and an **Items** field naming what the sidebar does with `stats[]`. Nothing drawn changed, no frame moved and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand exactly as written.

**No module rename was needed, and after the controls pass one module is declared.** This document named no modules at all, and the drawn frames named none either, so nothing here had to be corrected against the fixed 31-module registry (FR-G7). What changed is that **`count-up` is now declared on all fifteen designs, at Count up On**, from that same registry — no name was coined, and every panel quotes the module's own degradation sentence.

**A10 declares one module, on all fifteen, and it is off by default.** Every word and every pixel in the category is server-rendered — values, prefixes, suffixes, labels, notes, previous figures, direction words and 9 Bars' fill width are all in the HTML before a script could run — so **no A10 design loses anything with JavaScript off, at either value of Count up**. What `count-up` adds at On is an animation over a figure that is already there. What could be mistaken for behaviour is CSS or the template: the 1080 and 767 hand-offs are media queries, 8 Ledger's baseline is `align-items: baseline`, 9 Bars' fill is an inline width on a `<span>`, 14 Change's direction is parsed from the two authored strings before the page is served, and 11 Inline's chip is an editor mechanism rather than a runtime one. None of those is a module.

**`core` is assumed, not declared per design.** A10 has no JS-conditional CSS branch anywhere — there is no `.js-enabled` selector in the category — so `core`'s degradation (“Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.”) is satisfied trivially. Stated once here rather than fifteen times. *Flagged: not listing it per design is mine.*

**One of the two refused modules is now declared; the other is still refused.** `count-up`'s own degradation reads “The final value renders as static text — it is already in the HTML before JS ever runs.” — which is exactly what A10 draws, and which is why the refusal fell: the module can only add an animation to a figure that is already there, and reduced motion, JS off and a screen reader all get the figure. It ships as **Count up: Off (default) · On** on all fifteen. `reveal` is still refused, its degradation being “Content renders fully visible; the hide-then-reveal CSS is scoped to `.js-enabled`.” — A10's resting state, written as a fallback. **9 Bars keeps half of the old refusal:** `count-up` moves the figure and never the fill, because a proportion cannot be read while it moves. **No design in A10 asks for behaviour the registry does not have, and no module name is coined anywhere in this document.**

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. **`count-up` is edit-safe: it does not run while the section is being edited**, so every frame in A10 is still drawn as a resting state, and at Count up Off — the default — there is nothing to suspend at all.

**Item controls — the floor, stated once.** The repeater is labelled **Stats** and sits under the head fields in every design. **Add stat** sits at the foot of the list and **appends**; the authored order is the drawn order at every width, so a new stat lands last and is drawn last wherever the design's count reaches it — 11 Inline excepted, and it says so. **A new stat arrives with content, never an empty shell**: `value` reads `100`, `label` reads “What this number counts”, and `prefix`, `suffix`, `note`, `prev` and `share` are empty; the editor opens the value field with the placeholder selected. `value` is the one required field, so the item is valid the moment it exists and no design is ever asked to draw an invalid one. **9 Bars prefills one field more** — `share` 25 — because a drawn stat without a share sends the whole section to 1 Row, and adding a stat should not change the design. *Flagged.* **Remove** is on the row; removing down to a design's minimum is allowed and every design below says what it then draws, and removing the last row is allowed too — **the section then does not render**, and the editor keeps the empty repeater and its Add stat control rather than drawing a placeholder figure. **Reorder** is a drag handle on the row, and **order is meaningful in fourteen of the fifteen**: it is the drawn order left to right and top to bottom, and in the designs that draw fewer stats than may be authored it also decides which ones are drawn. **11 Inline is the exception** — its drawn order is the order the chips sit in the sentence, and reordering the repeater renumbers the chips without moving a figure. **Eight is the ceiling of `stats[]`**, raised from six in the controls pass, and the repeater says why in the owner's voice: “Eight numbers is as many as a reader holds in one look. A ninth is a table, and a table is a different section.” It stops accepting a ninth and names **3 Grid** as the one design that draws eight — 8 Ledger and 12 Sourced still stop at six, and every row-based design names 3 Grid from seven authored stats up. **Add stat is disabled at eight.**

**Inside an item the user edits content only** — never layout, spacing, alignment or emphasis. **The item panel always shows the four shared fields and the Value source row**, `value` (required, ≤ 12), `prefix` (≤ 3), `suffix` (≤ 6), `label` (≤ 60) and **Value source: Authored · Member count · Paid member count** — at Member count the value renders Ghost's helper string verbatim, prefix and suffix are disabled and the label stays authored — **and the three single-design fields only in the design that draws them**: `note` in 12 Sourced, `prev` in 14 Change, `share` in 9 Bars, held in the data and counted in the design panel everywhere else. **11 Inline is the case worth stating**: it keeps `label` in the item panel and never draws it, and its panel says how many labels it is holding. Empty optionals: **no label → the value alone at full size, with nothing substituted** — the hole sits at the foot of the cell in fourteen designs, and in 8 Ledger the value moves to the left edge; no prefix or suffix → the bare value, which is the ordinary case in nine of the eleven stats the category authors; no `note` → no marker and no reserved number; no `prev` → no change line, no dash and no “new”; no `share` → 9 Bars hands the section to 1 Row and names the stat. **No control in the sidebar addresses one item.** Every design control writes one value onto the section and the stylesheet reads it, so there is no taller card 3, no per-stat alignment and no featured flag: **5 Lead Stat's lead is the repeater's first row and nothing else**, which is why its size pair is fixed rather than offered.

**Flagged, for this pass.** The structural-descriptor vocabulary and the count-class convention, both carried from A8; the tuple naming the drawn frame rather than the range a Frame control offers; the placeholder strings a new stat arrives with, the drag handle, and 9 Bars' prefilled share; showing the three single-design fields only in the design that draws them; reading all fifteen behaviours as `none`; and the three item floors added below to designs whose Count control starts higher than two.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**A10's finding, stated first and amended by the controls pass: the category has one module and it is off by default.** No disclosure, no tabs, no filter, no slider, no timer, no hover state on a number — and, at Count up On, one scroll-triggered count over a figure that is already in the HTML. Every frame is a resting state and every frame is the only frame. §7.7 asks for behaviour states per design; **A10 draws a states frame instead** — the link's hover and focus, and the design's missing-field cases — and every panel says the section has no behaviour. **Flagged**, and the category's headline finding.

**The count-up was refused in all fifteen for four reasons, and the controls pass overturns three of them.** The four were: it animates the content, so reduced motion cannot honour it; it is unreadable while it runs; it re-runs, because scroll-into-view fires again on the way back up; and it lies to assistive technology, which reads whatever figure is in the DOM when it arrives. **All four assumed a figure that is not there until a script puts it there.** `count-up`'s figure is server-rendered — its own degradation sentence says so — so reduced motion resolves to the final value instantly, JS off never animates, a screen reader is given the figure, and the module does not re-run. It ships as **Count up: Off (default) · On** on all fifteen, off while editing. **The one reason that survives belongs to 9 Bars' fill**, where a proportion genuinely cannot be read while it moves: there the figure counts and the bar does not. **4 Single and 15 Big Type carried the refusal in their own panels, and both panels now carry its answer.** **Flagged**.

**Four other things a stats section reaches for, refused with reasons.** A sparkline, dial, donut or pie beside a value — a chart is a different object with axes, legends and a series, and **9 Bars' single proportional bar is as far as a section goes**. An icon per stat — **refused on a maintenance premise the curated P0·2 picker removed, and reinstated in the controls pass** as **Icons: None (default) · Shown** on fourteen designs, the slot above the value with the picker's size and colour-role popover; **11 Inline is the exception**, a glyph inside a sentence having no position, and “a glyph above 340 issues sent tells a reader nothing the label did not” survives as advice at the control rather than as a refusal. Colour as meaning — no green up, no red down, because the packs supply one accent and no semantic pair, and **14 Change carries direction in a glyph and a word instead**. A live figure from an API — Ghost holds no such number, and a section that fetches is a section that can be empty at load. **Flagged**.

**Two figures come from Ghost, and the premise that said none could was wrong.** `{{total_members}}` and `{{total_paid_members}}` are **public theme helpers**, not admin-API calls, and each renders a pre-rounded string — “1,200+”. Every stat therefore carries **Value source: Authored · Member count · Paid member count**: the helper's output replaces `value` **verbatim** — string in, string out, no maths and no formatter, which is this category's own rule — **prefix and suffix are disabled** when bound, and the label stays authored (“readers on the Thursday letter”). **Paid member count is offered only where the site has paid members enabled.** A bound value is not inline-editable: clicking it says “Edit in Ghost”. Everything else in A10 is authored in the section, in a repeater, the same as A8 and A9. One derived figure was considered and refused — a post count from a tag, which Ghost can give — because a number that changes when somebody publishes is a number nobody wrote and nobody checks. **Flagged**.

**The shared field list — eighteen fields after the controls pass: ten on the section, eight in the repeater.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `source` text opt ≤ 120 · `sourceUrl` url opt · `linkLabel` text opt ≤ 20 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 120 · `lede` rich text opt ≤ 280. In `stats[]`, **one to eight**: `value` text **req** ≤ 12 · `prefix` text opt ≤ 3 · `suffix` text opt ≤ 6 · `label` text opt ≤ 60 · `note` text opt ≤ 60 · **`noteUrl` url opt** · `prev` text opt ≤ 12 · `share` number 0–100 opt, plus the per-item **Value source** enum. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. **Five fields are read by one design each and kept by the other fourteen:** `image` and `imageAlt` by **10 Image Split**, `lede` by **11 Inline**, `note` and **`noteUrl`** by **12 Sourced**, `prev` by **14 Change**, `share` by **9 Bars**. **Eight is the ceiling of `stats[]`**, and **3 Grid is the only design that draws it**; 8 Ledger and 12 Sourced still stop at six. **Flagged**: every limit, the six-stat ceiling and the twelve-character value.

**The stat is the category's one new component: two lines of text and nothing else.** Value in the pack's heading font at display weight, −0.02em, line-height 1, tabular figures, `text`. Prefix and suffix at 0.5em of the value, same colour, same baseline, never superscript. Label 15/1.45 in `text-muted`, sentence case, ≤ 60 characters, wrapping, **never stepping at any width in any design**. Gap value-to-label 8 at Row, 10 at Large, 12 at Display. **The stat has no box of its own** — 2 Cards' cards and 3 Grid's cells are those designs' containers. No icon, no plane, no border, no accent, no hover, no motion. **Flagged**.

**The value ladder is A10's one new scale.** Row 40 · Large 52 · Display 68 at 1440; 34 · 44 · 56 at 834; 30 · 38 · 46 at 390. Line height 1 at every step. **Two designs exceed it and say so: 4 Single at Display 96 / Huge 128, and 15 Big Type at Big 96.** **Display 68 is not offered at four across in any design** — a 12-character value with two units is 500 px at 68 and the cell is 306. **Flagged**.

**The title ladder is A6's, cut off at its second rung: Small 28 · Medium 34 only** (26 · 30 at 834, 24 · 26 at 390). Large 40 and Display 48 are not offered anywhere in A10, because §2 allows one display moment and the numbers have taken it. **Eleven designs fix the title at Medium 34**; only 1 Row and 2 Cards offer Small 28. Head parts: eyebrow 13 px uppercase tracked `.08em` muted, 10 px above the title; title on a 780 measure; sub 17 px muted on 620, 12 px below the title; **head to stats 48**; source 32 px under the stats; link 20 px under the source. **Flagged**.

**Units, in two spacing cases and no third.** `%`, `×`, `°`, `+`, `−` and any currency symbol are set tight. Anything containing a letter takes a 0.16em space — `3.4 hrs`, `40 /mo` — **except a single capital used as a scale abbreviation**, `K`, `M`, `B`, which is tight because it is part of the figure. **The value and its units never wrap apart** at any width: one inline run with no break opportunity. **The value is a text field, not a number field** — no formatter, no locale, no separator guessing — so `41,800`, `99.98` and `Sold out` are all legal and are drawn as typed. **A stat with no unit is the bare value at full size and nothing is substituted.** **Flagged**.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the set a `<ul>` of `<li>`; **each stat a `<p>` holding the value and the label**, so a screen reader announces "41,800, readers on the Thursday letter" as one string. **The value is not a heading in any design at any size.** Three structures were refused: `<dl><dt><dd>`, because a label is not a term and a value is not its definition; `<table>`, which 3 Grid and 8 Ledger most tempt, because there is no header row and nothing compares down a column; and `<data value>`, which adds a machine-readable figure nothing reads. **Two designs have no `<h2>` and take no accessible name: 13 Slim, and any design at Head None.** **11 Inline is the one design with no list at all.** **Flagged**.

**The universal trio, outside every design's control list.** **Background role** (Background · Surface · Contrast), **Vertical spacing** (Compact · Comfortable · Spacious) and **Top divider** (None · Line · Fade) are carried by every placeable section and are drawn outside the design's own list on all fifteen panels. **Every per-design Padding row retired into Vertical spacing** — including **7 Contrast Band's Band padding 44 · 64 · 88** and **13 Slim's width-independent 32 · 44 · 56**, each as that design's resolution of the universal control rather than as a second row. **Contrast is disabled on fourteen designs with 7 named; on 7 Background role is locked to Contrast with the reason shown** — the band is the design. **Top divider is locked None** on 7 at Band width Full bleed, on 8 Ledger at Rules Above and below, and on 13 Slim at Rule Above and Rule Both, in each case because the design already draws the line. **The control budget is the PRD's ~15 visible controls plus the trio and the Data group**; A10 now runs from six of its own (11 Inline) to eight (1 Row), and **Quick Controls stay the 3–5 highest-impact**, named per design. **No design in A10 carries a Member Visibility row**: the category has no action to gate — its one link is a text link at the section-link treatment — and **no design carries a labelled button**, so the icon offer of rule 11 lands only on that link and on the stat slots. **No “Preview” control existed anywhere in A10**, so none was removed.

**Space.** Section padding Compact 64 · Comfortable 96 · Spacious 132, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. **Two designs carry their own vertical scale:** 7 Contrast Band's band at 44 · 64 · 88 (A4·9's) and 13 Slim's at 32 · 44 · 56 (A7·8's, and **the one scale in A10 that does not step with width**). Row gap between two rows of stats is 48 at 1440, 40 at 834, 32 at 390.

**Counts.** Two, three and four go in a row; **five and six go in a grid of three**. Two is 632 · 32 · 632; three is 416 · 24 · 416 · 24 · 416; four is 306 · 24 × 4. **The rule for five is 3 + 2, the second row keeping the 416 cell width and sitting at the left** — never centred, never widened, never five across. Six is 3 + 3, and **eight is 4 × 2 at the 306 px cell and the ceiling of the field**, raised from six in the controls pass and drawn by 3 Grid alone; **seven is drawn as an under-filled eight** and Count Seven is not offered anywhere. **Count names counts, not numbers**, and a row-based design with five to eight authored stats draws its own count and names 3 Grid. **Dividers are offered at two and three and refused at four**, because three hairlines inside 306 px cells is a table without a header row. **Flagged**.

**Responsive floor.** **Three across holds at 834** — 234 · 26 · 234 · 26 · 234 = 754 — **and four across becomes two across**, 365 · 24 · 365, in two rows 40 px apart. **At ≤ 767 every design is one column, stats 28 px apart**, and a Rules divider becomes a horizontal hairline the width of the column. Six designs collapse a second axis: 6 Split Head's head goes above at 1080 · 8 Ledger puts the value under the label at 1080 · 9 Bars keeps its bar and drops to one column · 10 Image Split stacks image over stats at 1080 · 11 Inline stays prose at every width · 14 Change puts the previous figure under the current one at 767. **The authored order is the drawn order at every width in all fifteen**; 10 Image Split's Image side control is the one exception and is disclosed.

**The accent is spent in four places and nowhere else:** the optional link's underline, the source line's underline when a URL is authored, **12 Sourced's linked footnote after the controls pass**, and the focus ring on any of them. **No value is ever accent-coloured.** 9 Bars' bar is `text` on a `border` track; 7 Contrast Band substitutes the band's carried colour for all three. **Eleven of the fifteen contain no accent pixel with no link authored, and 13 Slim can contain none under any setting.** **Focus** is A6's ring verbatim: 2 px accent, 2 px outside, the inner gap taking the ground, the carried colour on a band. Links are the only focusable things in the category.

**Empty.** No eyebrow, sub, source or link → absent, and the block closes up. **No stats → the section does not render**; the editor shows the empty repeater and its Add stat control. **A stat with no label is the value alone and nothing is invented** — no em dash, no repeated unit, no "Total". **A stat with no value is not saved**, so `value` is the one required field. **Fewer authored than shown draws what exists** — three at Four is three stats at the four-column width, left-aligned, the fourth cell absent rather than empty. **One stat where a design wants more → the design named in its panel**, which is 4 Single in eight cases.

**Print: every design prints as drawn** — nothing is hidden on screen, so nothing has to be revealed on paper. 7 Contrast Band drops its band, 9 Bars keeps its bars as outlined tracks with solid fills, 10 Image Split keeps its photograph and stacks the halves, 12 Sourced keeps its markers and notes, 13 Slim keeps its rules, 15 Big Type keeps 96 px values at two rows to an A4 page.

**Content.** Orbit Weekly throughout. The eleven stats: 41,800 readers, 62% opened, 340 issues, 74 countries, 9 writers, 2,140 archive pieces, £82,400 paid out, 3.4 hrs to read a year of letters, and the four regional splits — 18,400 Europe, 12,900 North America, 5,900 Asia and Oceania, 4,600 elsewhere — which sum to 41,800 and to 100%. Previous figures for 14 Change: 33,400, 58%, 288, 61, 6. Head: eyebrow **By the numbers**, source **"Figures from our own subscriber records, taken on 1 January 2026."**, link **"The annual letter"**. **Flagged: every number in A10 is invented**, including the ones that add up; they are internally consistent so that 9 Bars and 14 Change can draw honestly.

---

## 1 · Row

Two, three or four stats in one row of equal cells. The default — what a site gets when it types "stats" — and the row the whole category is measured against.

**Descriptor.** The category's floor and the row every other design is measured against — an undecorated set of equal cells carrying seven controls, more than any other design in A10, and the only one that will put the label above the value.

**Structural descriptor.** `grid-of-N · none · page · few · none · row of equal cells`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Count, Dividers, Order and the value ladder are values written onto the section and read by the stylesheet; the divider is a border in the gutter, the label-block equalisation is a grid row, and the three-to-two and one-column steps are media queries. **JS off:** unchanged — nothing in this design ever ran.

**Items.** Two, three or four drawn, from a list of up to six.

- **Add stat** appends at the foot of the repeater. **Count does not follow it**: a fourth stat authored at Count Three is counted and not drawn, and the panel reads “3 of 4 drawn”. At five and six the panel names 3 Grid; at eight Add is disabled, eight being the ceiling of `stats[]`.
- **Remove** is on the row. At two the row is 632 · 32 · 632 and is still this design; **at one the sidebar names 4 Single** before the frame changes; at zero the section does not render.
- **Reorder** is a drag handle, and order is meaningful: left to right at 1440, the same order two across at 834, top to bottom at ≤ 767. It also decides which stats a lower Count draws.
- **Minimum and maximum.** Designed for two, three and four — the whole of its Count control. One is another design and five to eight is another design; neither is refused at the repeater, and both are named in the panel rather than reflowed here.
- **At zero items** the section does not render and the editor keeps the empty repeater and its Add stat control.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held and not offered. **No label → the value alone**, the hole at the foot of its cell; at Order Label above an empty label still takes its share of the equalised block, so the values keep their shared baseline.

**Fields** · every section field except `image`, `imageAlt` and `lede`; two, three or four items reading `value`, `prefix`, `suffix`, `label`. `note`, `prev` and `share` kept, not drawn.

**Controls** · Head: Centred · Flush left · None. Title size: Small 28 · Medium 34, unavailable at head None. Value size: Row 40 · Large 52 · Display 68, **Display unavailable at Count Four**. Count: Two · Three · Four. Dividers: Rules · None, **unavailable at Count Four**. **Order: Value first · Label above.** Seven — the only design in A10 at the ceiling.

**Arrangement** · 632 · 32 · 632 at two, 416 · 24 at three, 306 · 24 at four; dividers 1 px in the gutter's centre at the tallest cell's height; head on 780, sub and source on 620; head to stats 48, source 32 under the row, link 20 under the source; value to label 8 · 10 · 12 with the value's step. **At Order Label above the label block is equalised to the tallest label in the row** so the values still share a baseline — the only equalisation of a text block in A10.

**Responsive** · the shared floor exactly: three holds at 834 at 234, four becomes two at 365, one column at ≤ 767 with stats 28 apart.

**Empty** · head parts, source and link → absent. A stat with no label → the value alone, the hole at the foot of its cell. **Five to eight authored → the panel names 3 Grid. One → 4 Single.**

**a11y** · `<ul>`/`<li>`/`<p>`; value not a heading; one tab stop at most; contrast value 15.8:1 / 15.1:1, label 5.6:1 / 6.0:1, underline 3.3:1 / 6.3:1.

**Flagged** · the three divisions and their gutters; the divider's position and height; Order's two values and the label-block equalisation; the step-linked value-to-label gap; refusing Dividers and Display at four.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into the universal Vertical spacing**; **Count up: Off · On** and **Icons: None · Shown** added, taking this design to **eight of its own** — the widest list in A10, and still well inside the PRD's ~15. Universal, outside the list: Background role, Contrast disabled with 7 named · Vertical spacing resolving 64 · 96 · 132 · Top divider. Quick Controls: **Count · Value size · Dividers · Order · Icons.** Items: every stat gains **Value source: Authored · Member count · Paid member count**, the eight-stat ceiling applies, and **seven or eight authored names 3 Grid**. Editing: value, prefix, suffix and label edit inline on canvas, **the value with no marks toolbar**, a bound value saying “Edit in Ghost”; Stats is the **P0·3** item list and both URLs open the **Link Picker**. Icons: the **P0·2** slot sits above the value at 20 px, **above the label at Order Label above**, and the row grows 32 with no cell moving. **Frames changed:** the control panel, plus a new states strip for Icons Shown and a bound value. The primary, dark, tablet and mobile frames stand: Icons None is the drawn value.

---

## 2 · Cards

One stat per surface card. For a page whose ground is already busy and needs the numbers to sit on something.

**Descriptor.** The only design that gives each stat a surface of its own — and, because a card has a visible edge, the only design in A10 that equalises the height of anything.

**Structural descriptor.** `grid-of-N · none · page · few · none · one stat per card`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The cards are a stretched grid row, Cards Surface · Ground is a fill token, Card padding is a value the stylesheet reads, and **a card has no hover state at any value** — there is nothing to bind and nothing to suspend while editing. **JS off:** unchanged.

**Items.** Two, three or four drawn, one card each, from a list of up to six.

- **Add stat** appends and brings a card with it. Count does not follow: a surplus stat is counted and not drawn, “3 of 4 drawn”, and five to eight names 3 Grid.
- **Remove.** At two, two 632 cards; **at one → 1 Row, not 4 Single** — a single card at 1,296 is a panel — named in the sidebar before the frame changes; at zero the section does not render and no empty card is drawn.
- **Reorder** sets the left-to-right order, which is also the stacking order on a phone.
- **Minimum and maximum.** Designed for two to four. **Cards are equalised to the tallest in the row with the slack at the foot**, so removing the stat with the longest label shortens every card in the row.
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held. **No label → a card holding a value and 22 px of slack**; the card is not resized to fit and no filler is added.

**Fields** · 1 Row's exactly, two, three or four items. Switching to or from 1 Row changes the container and nothing else.

**Controls** · Head: Centred · Flush left · None. Title size: Small 28 · Medium 34. Count: Two · Three · Four. **Cards: Surface · Ground.** Card padding: Compact 24 · Comfortable 32 · Spacious 40 (24 · 28 · 32 at 834, 20 · 24 · 28 at 390).

**Not offered** · Value size, fixed at Large 52 and at Row 40 at Count Four, because a 306 cell minus 48 of padding is a 242 px measure; Dividers, because a card has an edge and a rule beside it is a second one; Order, because a label on a card's top edge reads as the card's title.

**Arrangement** · 632 · 32 at two, 416 · 24 at three, 306 · 24 at four; pack radius, 1 px hairline, **no shadow at any value**; **cards equalised to the tallest in the row with the slack at the foot**; head and foot outside the cards, on the section's margins.

**Responsive** · the shared floor, the card's padding stepping with it.

**Empty** · a stat with no label → a card holding a value and 22 px of slack. One → 1 Row, not 4 Single: a single card at 1,296 is a panel.

**a11y** · the card is a `<li>`, not a link, and has no hover state; contrast as 1 Row, hairline 1.4:1 / 1.6:1.

**Flagged** · the card padding scale and its steps; equalising card height; no shadow; the refusals above.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**. **Cards Surface · Ground stays in this design's list** — it is the item's plane, not the section's ground — while Background role, Vertical spacing and Top divider sit outside it. Quick Controls: **Count · Cards · Card padding · Icons.** Items: **Value source** per stat, the eight ceiling, **seven or eight authored → 3 Grid, which has no cards**. Icons: the slot sits inside the card's padding and **every card grows 32, empty slots included, so the equalised row stays level** — the one place the icon offer touches an equalisation. **Frames changed:** the control panel, plus a states strip for the card slot and a bound value.

---

## 3 · Grid

A hairline matrix in one block. The only design that holds five and six comfortably, and where five is drawn.

**Descriptor.** The only design that draws five stats, and the only one whose separation is a shared-edge hairline matrix rather than a gutter.

**Structural descriptor.** `grid-of-N · none · page · variable · none · hairline matrix, shared edges`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The matrix is `border-left` and `border-top` on the cells, Frame Boxed is a fill, a hairline and the pack radius, and the three-to-two-to-one steps are media queries. **JS off:** unchanged. *The tuple names Frame None, the primary frame's value; Boxed is a control value, not a second design.*

**Items.** Four, five to eight drawn — the widest count range in A10 — from a list of up to six.

- **Add stat** appends **and the grid takes the cell**: up to the ceiling, every added stat is drawn rather than counted, which makes this the one design where Add always changes the frame. At six Add is disabled.
- **Remove.** **Fewer authored than the count draws fewer cells and the grid closes up** — no empty cell is ever drawn, and the hairlines re-form on the shorter set. Under four → 1 Row, named; at zero the section does not render.
- **Reorder** sets a reading order of left to right then down, at three columns and at two alike, and the panel says so. At Count Five it also decides which stat sits alone: 3 + 2 at three columns, 2 + 2 + 1 at two.
- **Minimum and maximum.** Designed for four, five and six. Three or fewer is 1 Row's arrangement and is named rather than drawn thinner; six is the category ceiling.
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held. **No label → the cell keeps its cell** and no hairline moves.

**Fields** · 1 Row's, four, five to eight items.

**Controls** · Head: Centred · Flush left · None. Count: Four · Five · Six. **Columns: Two · Three, Two forced at Count Four.** **Frame: None · Boxed.** Value size: Row 40 · Large 52.

**Not offered** · Title size, fixed at Medium 34 — this design's head is a label on a block and Small 28 above six values disappears; Dividers, because the hairlines are the design; Card padding; Order.

**Arrangement** · three columns of 432 or two of 648 across 1,296; cell padding 32; hairlines on the shared edges as `border-left` and `border-top`, the odd pixel belonging to the cell below and right; at Frame None the outer padding is dropped so the type aligns with the head; at Boxed an outer hairline, the pack radius, a surface fill, the outer padding kept, no shadow. **Five is 3 + 2 at three columns and 2 + 2 + 1 at two.**

**Responsive** · three columns → two at 1080 → one at ≤ 767; the hairlines follow the grid at every width.

**Empty** · a cell with no label keeps its cell; **fewer authored than the count draws fewer cells and the grid closes up** — no empty cell is drawn. Under four → 1 Row.

**a11y** · the grid is a `<ul>`, not a `<table>`: no header row, and nothing compares down a column.

**Flagged** · the 432 / 648 cells and the 32 px cell padding; the shared-edge hairlines and the odd-pixel rule; Frame's two values; forcing two columns at four; five's two shapes.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up**, **Icons** and **Count Eight** added, **seven of its own**. **Count: Four · Five · Six · Eight**, where **Eight is 4 × 2 at the 306 px cell** — the raised `stats[]` ceiling lands in this design and nowhere else. **Columns is unavailable at Eight** (two columns of eight is a 648 px ledger, and 8 Ledger is that design), the **value ladder caps at Large 52** there as it does at four across everywhere, and **seven authored draws seven cells and the grid closes up** — Count Seven stays refused, a 4 + 3 row with a hole being a missing cell. Responsive at Eight: four across to 1080, two to 767, one below. Quick Controls: **Count · Columns · Frame · Icons.** Icons: 20 px in the cell **at every count, eight included**; no hairline moves. **Frames changed:** the control panel, plus a states strip drawing **the eight-cell grid**, Icons Shown and a bound value.

---

## 4 · Single

One number as the whole section, at up to 128 px. **The design eight others hand off to when only one stat is authored.**

**Descriptor.** The only design with no arrangement at all — one stat as the whole section at up to 128 px — and the design eight others hand off to when a single stat is authored.

**Structural descriptor.** `stack · none · page · one · none · one value at Huge`

**Archetype.** stack

**Behaviour module.** **none.** Frame Panel is a fill, a hairline and 48 px of padding; Label Beside is a flex row on a shared baseline; the forced move to Under at ≤ 767 is a media query. **JS off:** unchanged. **This is the design a `count-up` would most obviously be attached to, and it is refused here as everywhere** — the registry's own sentence for the module, “The final value renders as static text — it is already in the HTML before JS ever runs.”, describes what A10 draws at every motion setting.

**Items.** One drawn, from a list of up to six.

- **Add stat** appends and **the frame does not change**: the second row is counted and not drawn, and the panel reads “1 of 3 drawn. 1 Row draws all three.” — A10's one deliberate over-authoring case.
- **Remove** the drawn row and **the second is promoted into the frame**; nothing re-sorts and no gap is left. Remove the last row and the section does not render.
- **Reorder** is how a site chooses which stat this design draws: the first row is the drawn one, so dragging a row to the top is the whole mechanism. There is no featured flag here or anywhere in A10.
- **Minimum and maximum.** Designed for exactly one, and the drawn count stays one at every authored count above it. **This design receives from eight others and hands off to nothing.**
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held — `note` notably, which is why 12 Sourced keeps its own single stat rather than handing it here. **No label → one numeral and nothing else**, which at this size is still a section.

**Fields** · 1 Row's section fields, one item.

**Controls** · Alignment: Centred · Flush left. **Value size: Display 96 · Huge 128** (72 / 96 at 834, 52 / 64 at 390) — **Display forced at Frame Panel**. Label: Under the value · Beside the value. Head: Shown · None. Frame: None · Panel.

**Not offered** · Count, because the design is one stat; Title size, fixed at Medium 34; Dividers; Order, since Label Beside is the position control here.

**Arrangement** · tracking −0.03em rather than −0.02em, one step tighter than the ladder; value to label 24 at Huge, 20 at Display, 16 on a phone; label on a 420 measure under and 300 beside, bottom-aligned to the value's baseline; the value at its natural width with the rest of the line left empty. Panel: surface, hairline, pack radius, 48 / 32 / 24 of padding, no shadow, sized to its content at Centred.

**Responsive** · the value steps twice; **at ≤ 767 Label Beside becomes Under**, because a 64 px value and a label beside it is 350 px of column.

**Empty** · no label → the value alone, which is the whole section. **This design receives and hands off to nothing.**

**Flagged** · both off-ladder sizes; the tighter tracking; the bottom-aligned label; the panel's padding; forcing Display inside the panel.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**. **This design's own count-up refusal falls with the module:** its panel argued that the effect is most tempting here, and the answer is the registry's sentence — the figure is server-rendered, so Display 96 and Huge 128 are what a reader lands on at every motion setting. Quick Controls: **Value size · Label · Frame · Icons.** Icons: **the slot is 32 px** — the only off-ladder icon size in A10, for the same reason the value is off-ladder — 24 px clear at Huge, and it stays above the value at Label Beside. Items: **Value source** per stat, and **this is the design the member-count binding was written for**: one figure, at 128 px, that a site never wants to retype. A bound value keeps Frame, Label and Alignment and loses the prefix, the suffix and the character ceiling. **Frames changed:** the control panel, plus a states strip for the 32 px slot and a bound figure.

---

## 5 · Lead Stat

One value at Display beside the rest at Row. For a site with one number it wants read first and two or three that support it.

**Descriptor.** The only design that draws two value sizes at once, and the only one whose emphasis comes from the repeater's order rather than from any control.

**Structural descriptor.** `split · none · page · few · none · one lead at Display`

**Archetype.** split

**Behaviour module.** **none.** Lead position, Lead side and Rules are values on the section; Beside becoming Above at 1080 is a media query and the separators are borders. **JS off:** unchanged.

**Items.** Three or four drawn: **the first row is the lead, the rest are the supporting set.**

- **Add stat** appends into the supporting set, never into the lead. A fourth at Count Three is counted and not drawn; five to eight names 3 Grid, and the panel says the lead's Display size goes with the switch.
- **Remove.** **Remove the first row and the second is promoted to the lead** — there is no other way to nominate one. At two → 1 Row, because a lead needs something to lead; at one → 4 Single; at zero the section does not render.
- **Reorder is the lead control.** Dragging a row to the top makes it the Display value; the rest keep their authored order down the stack. This is the per-item emphasis A10 refuses to make a control: a site that wants a particular stat larger moves it, and the sidebar never grows a “featured” switch.
- **Minimum and maximum.** Designed for three and four — one lead and two or three supporting. Below three the pair is not a pair.
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields, identical for the lead and for the rest — **nothing about being the lead is editable inside the item**, because the size pair is the design. `note`, `prev` and `share` held.

**Fields** · 1 Row's, three or four items; **the first item in the repeater is the lead**.

**Controls** · Head: Flush left · None. **Lead position: Beside the rest · Above the rest. Lead side: Left · Right.** Count: Three · Four. Rules: Between the rest · None.

**Not offered** · Head Centred, because the arrangement is a left-to-right reading; Title size, fixed at Medium 34; **Value size — fixed at Display 68 for the lead and Row 40 for the rest**, since the pair is the design and a control over it would let a site set them equal.

**Arrangement** · at Beside, 632 · 32 · 632 with the stack hairline-separated, 24 px of padding either side of each rule, **top-aligned, the lead never vertically centred against the stack**. At Above, the lead on 1,296 and the rest at 1 Row's division 48 px below. Lead gap 12, supporting gap 8. **Rules never between the lead and the rest**; at None the stack sits 36 apart.

**Responsive** · Beside becomes Above at 1080; one column at ≤ 767 with the lead first and still at Display.

**Empty** · one stat → 4 Single. Two → 1 Row, because a lead needs something to lead.

**Flagged** · the fixed size pair; the 24 px rule padding; top alignment; the 36 px gap at Rules None; the first item being the lead.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**. Quick Controls: **Lead position · Lead side · Count · Icons.** Icons: **24 px on the lead, 20 on the supporting set** — the one place the slot follows the value's size pair — and an empty slot reserves its height so the stack keeps its rhythm. Items: **Value source** per stat, **a bound member count as the lead being the ordinary case**; the eight ceiling applies and **seven or eight authored names 3 Grid, the lead's Display size going with the switch**. Count up is a section value: **every figure counts or none**. **Frames changed:** the control panel, plus a states strip for the two slot sizes and a bound lead.

---

## 6 · Split Head

Head in a 416 column at the left, a 2 × 2 of stats at the right. A8·6's split holding numbers.

**Descriptor.** The only design whose head is a column beside the stats rather than a block above them, and the only one whose stat block holds the same internal width at both of its counts.

**Structural descriptor.** `split · none · page · few · none · head beside the block`

**Archetype.** split

**Behaviour module.** **none.** Head column, Foot and Dividers are values on the section; the head moving above the stats at 1080 is a media query, and **the head is never sticky and never pinned**, so nothing tracks the scroll. **JS off:** unchanged.

**Items.** Two or four drawn, in a block whose width never changes.

- **Add stat** appends. At Count Two a third is counted and not drawn; at Count Four a fifth or sixth names 3 Grid.
- **Remove.** **Three authored at Count Four draws three cells and leaves the fourth absent rather than empty**, and the block stays 824 wide. At one → 1 Row, named. At zero the section does not render. **No title also sends the design to 1 Row**, since a head column with nothing in it is not this design.
- **Reorder** fills the 2 × 2 left to right then down, so the first two rows are the top pair.
- **Minimum and maximum.** Designed for two and four; three exists only as an under-filled four, and the panel says so rather than re-dividing the block.
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held. **No label → the value alone**, its cell's width unchanged.

**Fields** · 1 Row's, two or four items.

**Controls** · **Head column: Left · Right.** Count: Two · Four. **Foot: Under the head · Under the stats.** Dividers: Rules · None. Value size: Row 40 · Large 52.

**Not offered** · Head alignment, because the head column is always left-aligned inside itself; Title size, fixed at Medium 34; Display 68, which does not fit a 384 cell; Order.

**Arrangement** · 416 · 56 · 824 = 1,296, and **384 · 56 · 384 inside the block at both counts — the block's width never changes**. Both columns top-aligned, the head never sticky and never vertically centred. Row gap 48. Dividers Rules is one vertical hairline 28 px into the right-hand cells, running through both rows; a horizontal rule is refused as 3 Grid's. Foot Under the stats takes a hairline above it and spans the block.

**Responsive** · **the head goes above the stats at 1080**; four becomes two across at 365 at 834; one column at ≤ 767.

**Empty** · no title → 1 Row, because the design is a head beside a block. Three authored at Four → three cells and the fourth absent.

**Flagged** · the 416 / 56 / 824 division; the block's fixed internal width; the divider's 28 px inset; Foot's two positions; refusing Display 68.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own** — and **two of the seven still have no effect at ≤ 767**, which the panel discloses. Quick Controls: **Head column · Count · Dividers · Icons.** Icons: 20 px in each of the four cells, **the head column taking no icon** — a glyph beside a title is a decorated heading, and A1 owns those — so the block's 384 · 56 · 384 internal width is unchanged and only its height grows, 32 a row. Items: **Value source** per stat, the eight ceiling, **seven or eight authored → 3 Grid**; no title still sends the design to 1 Row. **Frames changed:** the control panel, plus a states strip for the icons in the 2 × 2 and a bound value.

---

## 7 · Contrast Band

1 Row inverted onto the `contrast` token. **Switching between this design and 1 Row changes nothing but the colours** — the tokenisation claim at its hardest.

**Descriptor.** The only design whose ground is the design rather than a control value — 1 Row inverted onto `contrast`, with the accent unavailable and the band's carried colour standing in for all three of its jobs.

**Structural descriptor.** `grid-of-N · none · contrast · few · none · ground inverted, accent substituted`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The band is a fill; the derived muted and hairline values are percentages of the carried colour resolved in the stylesheet; Band width Full bleed · Inset is a width. **JS off:** unchanged in both colour schemes — `mode-toggle` belongs to A1, and its own degradation says why nothing is needed here: “`prefers-color-scheme` still drives Auto mode entirely in CSS (**FR-E4**); only the manual override control is hidden.”

**Items.** Two, three or four drawn, exactly as 1 Row.

- **Add stat** appends; Count does not follow. Five to eight names 3 Grid, **which has no band**, and the panel says so before the frame changes.
- **Remove.** Two → 632 · 32 · 632 on the band; one → 4 Single, which has no band either, named; at zero the section does not render and **no empty band is drawn**.
- **Reorder** as 1 Row: left to right, then top to bottom stacked.
- **Minimum and maximum.** Two to four. The band's height follows the tallest cell, so removing the longest label shortens the band itself.
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held. **No item field carries a colour** — the carried colour is the section's, and no stat can be lit differently from its neighbours.

**Fields** · 1 Row's exactly, two, three or four items.

**Controls** · **Band width: Full bleed · Inset.** Head: Centred · Flush left · None. Count: Two · Three · Four. Dividers: Rules · None, unavailable at Four. Value size: Row 40 · Large 52 · Display 68, Display unavailable at Four.

**Derived colours, from one token pair** · muted = the carried colour at 72% in light and 70% in dark; hairline = the carried colour at 18%. Light `#232019` / `#FBF9F5` → `#BEBCB7`, `#4A4741`. Dark `#EDE7DA` / `#171511` → `#57544D`, `#C6C1B6`. **The accent is unavailable at 2.3:1; links and the focus ring take the carried colour in both modes.** No shadow at any value.

**Responsive** · 1 Row's rule plus the band's own padding step; at Full bleed the band keeps the page margins for its content and loses them for its ground.

**Empty** · as 1 Row. One → 4 Single, which has no band, and the panel says so.

**Flagged** · the derived percentages and all four resolved values; the accent substitution; refusing a shadow.

**Reconciled · controls pass, 24 August 2026.** Controls: **Band padding retired into Vertical spacing**, resolving **44 · 64 · 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390) as this design's ladder rather than a second row; **Count up** and **Icons** added, **seven of its own**. **Background role is locked to Contrast, with the reason drawn at the control** — the band is the design, and 1 Row is this arrangement on the page ground — and **Top divider is locked None at Band width Full bleed**, a divider above a full-bleed band being a line drawn on nothing. Quick Controls: **Band width · Count · Dividers · Value size.** Icons: the slot takes **the band's carried colour** and never the accent, which is unavailable here at 2.3:1, so the P0·2 popover's colour roles resolve to the carried colour and its 78 % mix. Items: **Value source** per stat; **no item field carries a colour**, and seven or eight authored names 3 Grid, which has no band. **Frames changed:** the control panel, plus a states strip drawing the icons and a bound value on the band.

---

## 8 · Ledger

Label at the left, value at the right, hairline rows. A9·15's geometry, and the design for six long labels.

**Descriptor.** The only design that turns the stat on its side — label left, value right, on one baseline — and the only one that leaves 320 px of the content width deliberately unused.

**Structural descriptor.** `table · none · page · variable · none · value right, one baseline`

**Archetype.** table. **The archetype names the shape, not the markup**: the set is a `<ul>` of `<li>` and `<table>` is refused, because there is no header row and nothing compares down a column. A12·10 Directory and A7·12 Ledger take the same reading.

**Behaviour module.** **none.** The rows are hairline borders, the shared baseline is `align-items: baseline`, the right-aligned figures are `text-align` with `font-variant-numeric: tabular-nums`, and the value moving under the label at 1080 is a media query. **No sort, no filter and no column control is offered** — `filter-strip` is the closest module, and this design does not ask for it. **JS off:** unchanged.

**Items.** Three, four or six drawn, one row each.

- **Add stat** appends and the ledger grows by a row. At Count Six the sixth is drawn — **this is the design for six long labels** — and at eight Add is disabled.
- **Remove.** Rows close up with no gap and the hairlines re-form. **Two authored draws two rows** and the panel says the design is meant for three or more; **one → 4 Single**; at zero the section does not render. *Flagged: the two-row floor is added in this pass — the earlier text named only the one-stat hand-off.*
- **Reorder** is top to bottom and is the only order the design has: **nothing sorts by value, alphabetically or by label length**, at any width.
- **Minimum and maximum.** Designed for three, four and six. The 976 measure and the 300 px value column are identical at every count, so a row added or removed changes the height and nothing else.
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held. **No label → the value moves to the left edge of the row** — the one place in A10 where a missing label moves a value.

**Fields** · 1 Row's, three, four or six items.

**Controls** · Head: Flush left · None. Count: Three · Four · Six. **Rules: Between · Above and below · None.** Row padding: Compact 24 · Comfortable 32 · Spacious 44 (20 · 28 · 36 at 834, 16 · 24 · 32 at 390). Value size: Row 40 · Large 52.

**Not offered** · Head Centred; Title size, fixed at Medium 34; Display 68, which overruns the 300 column; Dividers, since the rules are the dividers; Order, because the order is the design.

**Arrangement** · **620 · 56 · 300 = 976 flush left, with 320 px of the content width left unused**; label and value on one baseline via `align-items: baseline`; **values right-aligned with tabular figures so the digits line up**; rules run the full 976; at Rules None the rows sit 44 apart. **No leader dots and no decimal alignment.**

**Responsive** · **the value goes under the label at 1080**; one column at ≤ 767 with the same order.

**Empty** · a row with no label → the value moves to the left edge, which is the one design where a missing label moves a value. One → 4 Single.

**Flagged** · the 976 measure and the unused 320; baseline alignment; right-aligned values; the row padding scale; refusing leader dots.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**. **Top divider is locked None at Rules Above and below** — the design already draws that line — and is offered at Rules Between and Rules None. Quick Controls: **Count · Rules · Row padding · Icons.** Icons: **the slot leads the label at the row's left edge, not above the value** — the one design in A10 where it is not above the value, because the value sits at the right and a glyph over it would stand alone in the 300 px column — and **the row keeps its height**, a 20 px slot fitting inside the label's line box. Items: **Value source** per stat, the eight ceiling, **seven or eight authored → 3 Grid**; the two-row floor and the one-stat hand-off to 4 Single are unchanged. Editing: **the value edits in place at the right of its row** and stays right-aligned with tabular figures while it is typed. **Frames changed:** the control panel, plus a states strip for the left-edge slot and a bound figure in the value column.

---

## 9 · Bars

A proportional bar per stat. The only design that draws anything other than type, and the only one with a precondition.

**Descriptor.** The only design that draws anything other than type, and the only one with a precondition: every drawn stat needs a `share` or the whole section becomes 1 Row.

**Structural descriptor.** `stack · none · page · few · none · proportional bar per stat`

**Archetype.** stack

**Behaviour module.** **none**, and here it is worth saying twice: **the fill's width is an inline percentage on a `<span>`, server-rendered from `share`** — not a value a script animates. A bar that grows into place is the same refusal as the count-up, for the same four reasons. Bar height, Share figure and Row padding are values on the section. **JS off:** unchanged — the bars draw at their full authored proportion, because the proportion is in the HTML.

**Items.** Three or four drawn, one row and one bar each.

- **Add stat** appends **and arrives with `share` 25 already filled**, because a drawn stat without a share sends the section to 1 Row and adding a stat should not change the design. The one place in A10 where Add prefills more than value and label. *Flagged.*
- **Remove.** Rows close up. **Two or fewer → 1 Row**, named; one → 4 Single; at zero the section does not render.
- **Reorder** is top to bottom. **The shares are not re-sorted, not normalised and not summed**: a set that does not add to 100 is drawn as authored, and the editor says so rather than correcting it.
- **Minimum and maximum.** Designed for three and four. Five to eight names 3 Grid — **and the bars go with the switch**, because 3 Grid does not read `share`; the panel states that before the frame changes.
- **At zero items** the section does not render.
- **Inside the item**: value, prefix, suffix, label **and `share`, 0–100, required on every drawn stat**; `note` and `prev` held. **A share of 0 draws an empty track**, a share above 100 is clamped to the track and the editor says so, and **a stat with no share sends the section to 1 Row and the editor names that stat**. No label → the bar and the value stay exactly where they are.

**Fields** · 1 Row's, three or four items, **and `share` — the only design that reads it**. `share` is 0–100; **every drawn stat must have one or the section draws 1 Row and names the stat that does not**. The theme does not check that the set sums to 100; a share above 100 is clamped to the track and the editor says so.

**Controls** · Head: Flush left · None. Count: Three · Four. **Bar: Thin 4 · Medium 8 · Thick 16**, the same at every width. **Share figure: Shown · Hidden.** Row padding: Compact 24 · Comfortable 32 · Spacious 44.

**Not offered** · Value size, fixed at Row 40 — a 52 px value over a bar makes the bar read as its underline; Head Centred; Title size; **a colour per bar, a second series, an axis, gridlines, a legend, a tooltip, a sparkline, a dial, a donut and a pie**, all refused as charts.

**Arrangement** · the row takes the full 1,296 and **the bar takes the full row**; label left, share and value right-aligned on one baseline; bar 14 px below. **Track `border`, fill `text`, square ends** — the one place A10 does not apply the radius token — **no minimum fill width, a share of 0 drawing an empty track**.

**Responsive** · the track narrows with the column and nothing else changes; **the bar's height is identical at every width at all three values**.

**Empty** · a stat with no label keeps its bar and value; the value does not move. **A stat with no share → 1 Row, named. Two or fewer → 1 Row. One → 4 Single.**

**a11y** · the bar is two nested `<span>`s with `aria-hidden` — not `<progress>`, not `role="meter"`, not `role="img"`, not an SVG — because the share is already text beside it. **At Hidden the proportion is drawn and not written, which is a stated loss.** In forced colours the fill takes a 1 px border. Contrast: fill on track 12.1:1 / 12.6:1.

**Flagged** · the full-width bar and its 14 px gap; the track's colour and non-optionality; the fill in `text`; the square ends; the three heights held at every width; no minimum fill; not normalising the shares; the forced-colours border; the precondition and its hand-off.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**. **The module is half-applied here, and this is the only place in the library that happens:** at Count up On **the figure counts and the bar does not**, because a fill that grows from zero is a proportion nobody can read while it moves — §0's refusal survives for the graphic and falls for the number. Quick Controls: **Count · Bar · Share figure · Icons.** Icons: the slot leads the label on the row's first line; **the bar, the share figure and the value do not move**. Items: **Value source** per stat, and **a bound member count still carries its own `share`** — Ghost gives the figure, the site gives the proportion, the only stat in A10 that reads a helper and an authored number at once. `share` stays a number field and **is not editable on canvas**: dragging a bar to set a proportion is a chart editor. **The hand-off is restated at the new ceiling: five to eight authored names 3 Grid, and the bars go with the switch**, because 3 Grid does not read `share`. **Frames changed:** the control panel, plus a states strip for the slot and the never-animated bar.

---

## 10 · Image Split

A photograph on one half and everything else on the other. **The only design in A10 that reads an image**, and the only one where the head sits in the column with the stats.

**Descriptor.** The only design that reads an image, and the only one whose head sits in the column with the stats rather than above them.

**Structural descriptor.** `split · none · page · few · left · photograph beside the stats`

**Archetype.** split

**Behaviour module.** **none.** The halves are a flex row, Crop is an aspect ratio, and Image side changes DOM order rather than setting `order`. The photograph is a plain `<img>` with `loading="lazy"` — an attribute, not a module — and **`lightbox` and `video-facade` are both refused**, because the image is not a link to anything and there is no full-size version to open. **JS off:** unchanged.

**Items.** Two or four drawn, as a 2 × 2 beside the photograph.

- **Add stat** appends. At Count Two a third is counted and not drawn; **three authored at Count Four draws three cells with the fourth absent, and the panel advises Count Two** rather than switching it. *Flagged: the advice is added in this pass.*
- **Remove.** At one → **4 Single, and the photograph is dropped**, which the panel states before the frame changes; at zero the section does not render. **No image → 1 Row**, named, at any item count.
- **Reorder** fills the 2 × 2 left to right then down, and top to bottom stacked. **Image side moves the photograph and never the stats' order.**
- **Minimum and maximum.** Two and four. Count Three is refused as a control value because a 2 × 2 with a hole is a missing cell; three authored is drawn as an under-filled four and named.
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held. **The image and its alt text are section fields, not item fields** — there is no per-stat image anywhere in A10, and a stat cannot carry a picture.

**Fields** · every section field, **including `image` and `imageAlt`**; `lede` kept, not drawn. Two or four items. The image is a site upload, never a post's feature image.

**Controls** · **Division: Even 632/632 · Stats-led 504/760. Image side: Left · Right. Crop: Portrait 4:5 · Square 1:1 · Landscape 3:2.** Count: Two · Four. Value size: Row 40 · Large 52.

**Not offered** · Title size, fixed at Medium 34; Head None, because a column of numbers beside a photograph with no title is a caption; Count Three, since a 2 × 2 with a hole is a missing cell; Display 68; a scrim, an overlay, a caption, a second image, and any crop the site did not name.

**Arrangement** · head, stats, source and link all in the text column; stats a 2 × 2 of 300 (364 at Stats-led) on a 32 px gutter with a 48 px row gap; **both columns top-aligned, the taller setting the height, neither stretched and neither centred**. Crop heights at 632: Portrait 790, Square 632, Landscape 421; **the text column is 567 px at four stats with a full head**, which is why Square is the match and Landscape is the one for two.

**Responsive** · two columns above 1080; **at 1080 and below the image goes above the text at both Image side values**, and Division and Image side stop having an effect — the panel says so and the controls stay enabled. At 834 image 754 wide, four stats two across at 365; at ≤ 767 image 350, stats one column 28 apart.

**Empty** · **no image → 1 Row**, named. No `imageAlt` → `alt=""`, decorative, and the editor asks. A stat with no label → the value alone. **One stat → 4 Single, and the photograph is dropped**, which is stated.

**a11y** · `<img>` in a `<figure>`, alt from `imageAlt`; **no `<figcaption>` in the section** — the captions on the frames are canvas annotations. Halves are a flex row, one `<h2>`. **Image side changes DOM order and no `order` property is used anywhere.**

**Flagged** · the head living in the text column; the 2 × 2 at 300 and 364; the 48 px row gap; top alignment with no stretch or centring; the three crop heights and the panel's crop advice; refusing Count Three and Display 68; the no-caption rule; the alt-text behaviour; both hand-offs.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**. **Image focus: Centre · Top · Bottom ships in the Image Picker's popover, beside Crop** — a visible field, never a hidden one — and Centre is the default. Quick Controls: **Division · Image side · Crop · Count.** Icons: the stat cells only; **the photograph takes no icon and no badge**, the text column grows 32 at Count Two and 64 at Four, and **the crop heights do not change**. Items: **Value source** per stat; the image and its alt text stay **section fields, not item fields**, and seven or eight authored names 3 Grid, the photograph going with the switch. **Frames changed:** the control panel, plus a states strip for the cell icons, the Image focus popover and a bound value.

---

## 11 · Inline

The values set inside a sentence, at 34 px in a 20 px paragraph. **The one design where a stat has a grammar, the one that reads `lede`, and the one that does not draw `label`.**

**Descriptor.** The only design where the stats have a grammar — values set inside an authored sentence — and the only one that draws no list, no cell and no label.

**Structural descriptor.** `article body · none · page · few · none · values inside a sentence`

**Archetype.** article body

**Behaviour module.** **none.** **The chip is an editor mechanism, not a runtime one**: what is published is a `<span>` inside a `<p>`, and the chip's affordance exists only in the editor. Measure, Lede size and Value size are values on the section, and the leading rule is a line-height. **JS off:** unchanged — the sentence is one server-rendered paragraph. `typewriter` is the module a sentence of figures invites, and its own degradation is what this design already does at every setting: “The complete line renders as static text; the animated caret is absent.”

**Items.** Two or three drawn, **and the sentence decides where** — the one design in A10 whose drawn order is not the repeater's.

- **Add stat** appends to the repeater and **writes nothing into the lede**: the new stat is counted and not drawn until the author inserts its chip from the toolbar, because appending a figure to somebody's sentence would edit their prose. The panel reads “2 of 3 drawn — insert the chip to draw the third.” *Flagged.*
- **Remove** takes the stat's chip with it and the sentence closes up around it. At one → 4 Single, named; at zero the section does not render. **No lede → 1 Row**, named.
- **Reorder renumbers the chips and moves nothing in the sentence.** Order is meaningful in the lede rather than in the list, which is the exception to the shared floor's authored-order rule and is stated in the panel. *Flagged.*
- **Minimum and maximum.** Designed for two or three chips in one paragraph. **Four or more → 1 Row**, named; a stat whose chip is not in the sentence is counted and not drawn at any count.
- **At zero items** the section does not render, whatever the lede says.
- **Inside the item**: `value`, `prefix` and `suffix` are drawn; **`label` stays editable and is never drawn**, and the panel says how many labels are held, so a switch to 1 Row draws them all. `note`, `prev` and `share` held. **The undrawn label is not exposed to assistive technology either.**

**Fields** · `eyebrow`, `title`, **`lede` rich text ≤ 280**, `source`, `sourceUrl`, `linkLabel`, `linkUrl`. `sub`, `image` and `imageAlt` kept, not drawn. Two or three items reading `value`, `prefix`, `suffix`; **`label` kept and not drawn, and the panel says how many.** **The lede carries one chip per stat**, inserted from the editor's toolbar, showing the stat's number and its current value; a figure cannot be typed into the sentence by hand. Allowed inside the lede: inline links, bold, italic. Refused: lists, headings, code, images, a second paragraph.

**Controls** · Head: Flush left · Centred · None. **Measure: Wide 780 · Narrow 620.** **Lede size: Body 20 · Large 24. Value size: Inline 34 · Large 44** (30 · 38 at 834, 26 · 32 at 390). Count: Two · Three.

**Not offered** · Title size, fixed at Medium 34; Display 68, because at 68 the figure is the line and 15 Big Type draws that; Count Four; Dividers; drawing the labels.

**Arrangement** · one paragraph on the measure, **leading set to the value's size plus 12 px** — 46 at Inline, 56 at Large — the same at every width. Head 48 above, source 32 below, link 20 under the source. **Each value with its units is one unbreakable run**; the sentence breaks around it. The value takes no accent, no underline, no weight change and no baseline shift, and **is never a link**.

**Responsive** · **nothing collapses, because a paragraph reflows** — the only design in A10 with no arrangement to collapse. Wide 780 → 690 at 834 → the column at 390; Narrow 620 holds until the column is narrower. **The leading rule is unchanged at every width.**

**Empty** · **no lede → 1 Row**, named. **A stat with no chip in the lede is not drawn and is named**; nothing is appended to the paragraph. A deleted stat takes its chip with it. Four or more → 1 Row. One → 4 Single.

**a11y** · `<h2>` and one `<p>`; values plain `<span>`s; **no list anywhere**; not `<strong>`, not a heading, not `<data>`. **The undrawn label is not exposed to assistive technology either** — no visually hidden text. Reflows to 400% without overlap.

**Flagged** · the chip mechanism and its refusal of hand-typed figures; the leading rule; the two value sizes; refusing Count Four; leaving the labels undrawn and stating the count; refusing the `sub`; the lede in `text`; no list; a value never being a link.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** added, **six of its own** — the shortest list in A10, because **Icons is not offered here**: its values sit inside a sentence, and there is no position for a 20 px slot that is not a hole in somebody's prose. The panel names **1 Row** for a site that wants them, and the reason is drawn at the control rather than left to this document. Quick Controls: **Measure · Lede size · Value size · Count.** **The chip insert now reuses the P0·1 toolbar's own frame** — one more button, *Insert figure*, in the same popover at the same height, rather than the second popover style this design used to carry — and it still drops the next undrawn stat's chip at the caret. At **Count up On the sentence does not reflow**: the run reserves the final value's width, so the prose is set once and the figures count inside a line that is already laid out. Items: **Value source** per stat, **a bound figure keeping its chip** so the sentence can be read before it is published; the eight ceiling applies and four or more chips still names 1 Row. **Frames changed:** the control panel, plus a states strip drawing **the insert inside the P0·1 frame** and a bound figure in the sentence.

---

## 12 · Sourced

Numbered footnotes, one per stat. For numbers that came from different places and have to say so. **The only design that draws `note`, and the only one that does not draw the section's own source line.**

**Descriptor.** The only design that sources each stat separately, as numbered footnotes, and the only one that does not draw the section's own source line.

**Structural descriptor.** `grid-of-N · none · page · variable · none · numbered note per stat`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The markers are `<sup>` text, the notes are an `<ol>` with the numeral typed rather than counted in CSS, and `aria-describedby` is an attribute. **Nothing jumps, nothing expands and nothing links**: `toc`, `accordion` and `share` are all absent by construction, and no DPUB footnote role is used. **JS off:** unchanged.

**Items.** Three, four or six drawn, each able to carry one note.

- **Add stat** appends. **A new stat has no note, takes no marker and reserves no number** — the specified behaviour rather than an omission. At six Add is disabled.
- **Remove.** Cells close up **and the notes renumber**, since numbering follows the notes that exist in authored order. **Two authored draws two cells at the count's cell width**; **one stat with a note is drawn here rather than handed to 4 Single**, A10's one reversed hand-off, because 4 Single does not read `note`. **No note on any stat → 1 Row**, named; at zero the section does not render. *Flagged: the two-cell floor is added in this pass.*
- **Reorder** is left to right then down, **and it renumbers the notes**: the numerals are positional, not attached to a stat for life.
- **Minimum and maximum.** Designed for three, four and six. Six is where the panel advises Notes Under each stat; **the control never switches itself.**
- **At zero items** the section does not render.
- **Inside the item**: value, prefix, suffix, label **and `note`, ≤ 60, optional, plain text with an optional `noteUrl`**; `prev` and `share` held. **No note → no marker and no number**, and at Notes Under each stat the space under the label closes up.

**Fields** · `eyebrow`, `title`, `sub`, `linkLabel`, `linkUrl`. **`source` and `sourceUrl` kept and not drawn**, with `image`, `imageAlt` and `lede`. Three, four or six items reading `value`, `prefix`, `suffix`, `label` **and `note` ≤ 60**. **`note` ≤ 60 takes an optional `noteUrl`**, which makes the footnote’s text a link at the section-link treatment; with no URL the note is muted text after its numeral and nothing is focusable.

**Controls** · Head: Centred · Flush left · None. Count: Three · Four · Six. Value size: Row 40 · Large 52. **Notes: At the foot · Under each stat.** Dividers: None · Rules, **Rules unavailable at Count Four**.

**Not offered** · Title size, fixed at Medium 34; Display 68; Count Five, which 3 Grid draws; a marker style; a back-reference; a fragment to jump to; drawing the section source line beside the notes. **A note as a link is offered after the controls pass** — the optional `noteUrl`.

**Arrangement** · 1 Row's cells — 416 at three, 306 at four, 416 in a 3 + 3 grid at six with a 48 px row gap. **Marker: a numeral in the body font at 13 px, superscript, muted, set after the suffix, at both value sizes.** Notes 32 px under the stats on a 620 measure, 6 px apart, 13 px muted, numeral then middot. **Numbering follows the notes that exist, in authored order** — four stats with two notes read 1 and 2. **At Notes Under each stat there are no markers at all** and the note is 12 px under the label.

**Responsive** · three holds at 834; four becomes two across at 365; six becomes three across at 234. **The notes stay one list at the foot at every width and are never split per row**; measure 620 → 560 → the column. **The numbering never changes with the reflow.** The panel advises Under each stat at ≤ 767 and at Six; **the control does not switch itself.**

**Empty** · a stat with no note takes no marker and reserves no number. **No note on any stat → 1 Row**, named. **One stat with a note is drawn here rather than handed to 4 Single**, because 4 Single does not read `note` — the one reversed hand-off in A10.

**a11y** · marker a `<sup aria-hidden="true">` inside the stat's `<p>`, **the note joined to the stat with `aria-describedby`**, dropped at Under each stat. Notes an `<ol>` with the numeral as text, not a CSS counter. **A linked note is a link and a tab stop** — `noteUrl`, added in the controls pass — **and nothing jumps:** no DPUB footnote roles, no back-reference, no fragment. **One tab stop per linked note, plus the section link**, and a note with no URL is not focusable at all. Marker and note 5.6:1 / 6.0:1 — the same step as the label.

**Flagged** · the numeral marker, its size, position and middot; the notes' measure, offset and gap; numbering only the stats that have notes; the two placements and dropping the markers; refusing a marker style and the section source line beside the notes — the per-stat URL refusal reversed by `noteUrl` in the controls pass; the `aria-describedby` relationship; refusing the DPUB roles; the reversed hand-off.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**. **New field: `noteUrl`, url, optional, per item.** When it is authored **the footnote's text becomes a link at the section-link treatment** — “Figures from ONS, 2025” deserves an href — **the markers are unchanged**, and a note with no URL is unchanged too: plain 13 px muted text after its numeral. **This gives the design its first tab stops**: one per linked note, A6's focus ring, and the accent's underline in its fourth and last job in A10 here. The `aria-describedby` relationship survives — the link sits inside the description rather than instead of it — and still drops at Notes Under each stat. Quick Controls: **Count · Notes · Value size · Icons.** Icons: 20 px above the value, **the marker staying after the suffix**; the slot never carries the numeral. Items: **Value source** per stat, the eight ceiling, **seven or eight authored → 3 Grid, which draws no notes** and says how many it would drop. Editing: the note takes the **P0·1** link button and `noteUrl` opens the **Link Picker** with open-in-new-tab and rel nofollow · noreferrer · sponsored — the ordinary case for a citation. **Frames changed:** the control panel, plus a states strip drawing **a linked footnote beside an unlinked one**, Icons Shown and a bound value.

---

## 13 · Slim

A band 128 px tall with no head, no source line and no link, on its own padding scale. **The only design where the label sits beside the value.**

**Descriptor.** The only design with no head, no source line and no link at any setting — a short band on the one padding scale in A10 that does not step with width — and the only one that puts the label beside the value.

**Structural descriptor.** `bar · none · page · few · none · label beside the value`

**Archetype.** bar

**Behaviour module.** **none**, and **this design has the least in the category to declare**: nothing focusable, no accent pixel under any setting, no state but the resting one. Alignment, Label position and Rule are values on the section, and the stack at ≤ 767 is a media query. **JS off:** unchanged. `dismiss` and `header-scroll` are the modules a band this shape attracts in A2 and A1, and neither applies: this is a section, not furniture.

**Items.** Two or three drawn, as groups on one row.

- **Add stat** appends. **Four or more authored draws the first three and the panel states it** — “3 of 5 drawn” — because four groups across 1,296 leaves 60 px between them at ordinary label lengths.
- **Remove.** **One → one group at the left, not handed to 4 Single**, because this design's contract is a short band; at zero the section does not render.
- **Reorder** is left to right at Spread, Left and Centred alike, and top to bottom stacked.
- **Minimum and maximum.** Designed for two and three. **A long label costs the band its height rather than a group**: three stacked groups is a 240 px band, and the panel says so.
- **At zero items** the section does not render — and with no head, no source and no link, there is nothing else left to draw.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held, along with the eight section fields this design keeps and never draws. **No label → the value alone**, and at Label Beside the group is a value with nothing after it.

**Fields** · two or three items reading `value`, `prefix`, `suffix`, `label`, **and nothing else in the whole section**. **Eight section fields kept and not drawn:** `eyebrow`, `title`, `sub`, `source`, `sourceUrl`, `linkLabel`, `linkUrl`, `lede`; also `image`, `imageAlt`, and `note`, `prev`, `share` in the repeater. Switching to 1 Row draws all of them.

**Controls** · Alignment: Spread · Left · Centred. **Label position: Beside · Under.** Rule: None · Above · Both. Count: Two · Three. Value size: Small 30 · Row 40.

**Not offered** · a head at any value; a source line; a link; Count Four, because four groups across 1,296 leaves 60 px between them at ordinary label lengths; **Large 52, which beside a 15 px label puts the label at 29% of the value's size**; Dividers; a surface panel; a ground of its own.

**Arrangement** · one row of groups on the 1,296 content width; **at Beside the value and label share a baseline with a 12 px gap**, at Under the group is 1 Row's stat with an 8 px gap. Left and Centred put 64 px between groups. The rule is a `border` hairline at full content width, never inset, never the accent. **Band height 110 at Small/Compact, 128 at Row/Comfortable, 152 at Row/Spacious with two rules.**

**Responsive** · three across holds at 834 and stacks at ≤ 767; value 40 → 34 → 30, Small 30 → 26 → 24, label 15 everywhere; **padding does not step at any width**. Stacked, one column 28 apart and **Beside survives the stack**, wrapping under the value's right edge. Alignment has no effect stacked and stays enabled. **The panel states the cost: three stacked groups is a 240 px band.**

**Empty** · a stat with no label → the value alone. Four or more → the first three, stated. **One → one group at the left, not handed to 4 Single**, because this design's contract is a short band.

**a11y** · **no `<h2>`, no `aria-label`, no landmark name** — A9·13's position, stated in the panel. `<ul>`/`<li>`/`<p>` at both label positions; the 12 px gap is a flex gap, not a space. **Nothing focusable, and no accent pixel anywhere under any setting.**

**Flagged** · the label beside the value and its 12 px gap; the three band heights; padding not stepping with width; offering Centred here and not in 1 Row; the three rule values; refusing Count Four and Large 52; drawing one stat rather than handing off; no landmark name.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**, resolving **32 · 44 · 56 at every width** — the one ladder in A10 that does not step, kept as this design's resolution of the universal control; **Count up** and **Icons** added, **seven of its own**. **Top divider is locked None at Rule Above and Rule Both**, where the design already draws the line, and is offered at Rule None. Quick Controls: **Alignment · Label position · Rule · Count.** Icons: **before the value on its baseline at Label Beside, above it at Under**, and **the band's height is the cost**: 110 / 128 / 152 becomes 130 / 148 / 172 at Beside and 138 / 156 / 180 at Under, stated at the control because the band's height is this design's contract. Items: **Value source** per stat — **the likeliest content this design will ever hold**, a strip saying how many readers there are — and four or more authored still draws the first three, at eight as at five. Editing: with no head, no source line and no link, **the values and labels are the whole editable surface**. **Frames changed:** the control panel, plus a states strip for the baseline slot and the band's new height.

---

## 14 · Change

Each value with the figure it replaced: a glyph, a word and the previous number. **The only design that reads `prev`.**

**Descriptor.** The only design that draws a second figure per stat — the number this one replaced, with a glyph and one of four fixed wordings — and the only one that computes anything from two authored strings.

**Structural descriptor.** `grid-of-N · none · page · few · none · previous figure per stat`

**Archetype.** grid-of-N

**Behaviour module.** **none.** **The direction is computed before the page is served**, parsed once from the two authored strings, and the glyph is a static character; nothing recomputes, ticks or animates. `count-up` and `countdown` are both refused and neither has anything to move here, since both figures are authored. **JS off:** unchanged, direction word included, because the parse happened before the HTML was written.

**Items.** Two, three or four drawn, each able to carry a previous figure.

- **Add stat** appends **with no `prev`**, so a new stat draws a value and a label and no change line; nothing is substituted and nothing is invented.
- **Remove.** Cells close up. **No stat with a `prev` → 1 Row**, named; one → 4 Single, which draws the change line under its 128 px value; at zero the section does not render.
- **Reorder** is left to right, then top to bottom stacked, and the change line travels with its stat.
- **Minimum and maximum.** Two, three and four. **Five to eight names 3 Grid — and the change lines go with the switch**, because 3 Grid does not read `prev`; the panel states the cost before the frame changes. *Flagged: the cost is stated in this pass.*
- **At zero items** the section does not render.
- **Inside the item**: value, prefix, suffix, label **and `prev`, ≤ 12, optional, a text field like `value`**; `note` and `share` held. **No `prev` → no change line, no dash and no “new”**: the label moves up and the values keep their shared baseline. Where either figure fails to parse the line reads “was …” with no glyph and no direction word — a content outcome, not an error state.

**Fields** · every section field except `image`, `imageAlt` and `lede`. Two, three or four items reading `value`, `prefix`, `suffix`, `label` **and `prev` ≤ 12**. **`prev` is text, like `value`**, and takes the same prefix and suffix as its stat when it parses as a number.

**Controls** · Head: Centred · Flush left · None. Count: Two · Three · Four. Value size: Row 40 · Large 52. **Change line: Under the value · Beside.** Dividers: None · Rules, unavailable at Count Four.

**Not offered** · Title size, fixed at Medium 34; Display 68; **a colour for direction, a computed difference, a percentage change, an arrow-only line, a bold direction word, a per-stat period, a sparkline and a second previous figure.**

**Arrangement** · value, change line, label, 8 px apart, in 1 Row's cells. **Change line 13 px `text-muted`, tabular, the previous figure in the body font**; glyph a 10 px triangle in the same colour, one space before the word. **Four fixed wordings: up from · down from · unchanged from · was.** **Direction is computed only when both figures parse** once separators, spaces, prefix and suffix are stripped; if either fails, the line reads "was …" with no glyph and no direction word. **The period is never named in the line** — the site types it into the `sub`. At Beside the line sits 10 px after the value on its baseline.

**Responsive** · three holds at 834; four becomes two across at 365; one column at ≤ 767. **At ≤ 767 the change line is Under whatever the control says** — the one forced control value in A10 — and the panel states it. The change line is 13 px and the label 15 px at every width.

**Empty** · **a stat with no `prev` draws no change line and nothing is substituted** — no "new", no dash; the label moves up and the values stay on one baseline. **No stat with a `prev` → 1 Row**, named. One → 4 Single, which draws the change line under the 128 px value.

**a11y** · the stat is one `<p>` holding all three lines; **the triangle is `aria-hidden` and the direction is carried by the word**; not `<del>`/`<ins>`. Under and Beside announce identically. **Change line, glyph and label all 5.6:1 / 6.0:1.** Forced colours lose nothing, because nothing is carried by hue.

**Flagged** · the cell's order and gaps; the previous figure in the body font; the triangle's size and colour; the four wordings; parsing both figures and refusing a direction when either fails; **refusing to compute a difference**; the period living in the `sub`; Beside's offset and wrap; forcing Under at ≤ 767.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**. **The four wordings become theme catalog strings** — *up from · down from · unchanged from · was* — because an English literal inside every stat cannot ship on a non-English site; they are **not editable fields**, the parse that chooses between them is unchanged, and **the glyph stays outside the string**, `aria-hidden`, with the direction carried by the word. Quick Controls: **Count · Change line · Value size · Icons.** Icons: 20 px **above the stack**, value, change line and label keeping their order and their 8 px gaps. At **Count up On the current figure counts and the previous one does not** — two counting figures in one stat would be two claims at once. Items: **Value source** per stat, **a bound value still able to carry a `prev`** (Ghost gives this year's figure, the site types last year's), and the hand-off restated: **five to eight authored names 3 Grid, and the change lines go with the switch**. **Frames changed:** the control panel, plus a states strip drawing **the catalog strings** and Icons Shown.

---

## 15 · Big Type

One stat per full-width row, the value at 96 px on the left margin and the label in a 416 column at the right. The category's loudest design.

**Descriptor.** The only design that gives one stat a whole row at 96 px, and the only one where two control values draw the same thing at ≤ 767.

**Structural descriptor.** `stack · none · page · few · none · one stat per row`

**Archetype.** stack

**Behaviour module.** **none**, and **this design names the refusal in its own panel**: the count-up is refused here at every motion setting, and the registry's sentence for the module — “The final value renders as static text — it is already in the HTML before JS ever runs.” — is exactly what the 96 px value does. `reveal` goes with it, for the reason its own degradation gives: “Content renders fully visible; the hide-then-reveal CSS is scoped to `.js-enabled`.” Label position, Value size and Row padding are values on the section. **JS off:** unchanged.

**Items.** Two or three drawn, one full-width row each.

- **Add stat** appends and adds a row. **Four or more authored draws the first three and the panel states it**, because four Big rows is a 980 px section.
- **Remove.** Rows close up and the hairline pattern re-forms — none above the first, none below the last. **One → 4 Single**, named; at zero the section does not render.
- **Reorder** is top to bottom, and it is the only order the design has.
- **Minimum and maximum.** Designed for two and three. Count One is refused as a control value because 4 Single is that design, at a larger size and with a panel option this one does not have.
- **At zero items** the section does not render.
- **Inside the item**: the four shared fields; `note`, `prev` and `share` held. **No label → the value alone with the right margin empty**, the row keeping its height and its hairline.

**Fields** · `eyebrow`, `title`, `source`, `sourceUrl`, `linkLabel`, `linkUrl`. **`sub` kept and not drawn** — a 17 px paragraph above a 96 px numeral is read after it — with `image`, `imageAlt` and `lede`. Two or three items reading `value`, `prefix`, `suffix`, `label`. **This is the design the 12-character ceiling on `value` was set for**: twelve characters plus a prefix is 633 px at Big 96, and with the label column and gutter that is 1,113 of 1,296.

**Controls** · Head: Flush left · None. Count: Two · Three. **Value size: Display 68 · Big 96** (56 · 72 at 834, **46 at both at ≤ 767**). Label position: Right · Under. Row padding: Compact 24 · Comfortable 32 · Spacious 44.

**Not offered** · Title size, fixed at Medium 34; Head Centred, because the rows have two edges; Count One and Four — four Big rows is a 980 px section; a hover plane; a row link; an accent value; **a count-up at any motion setting**; the `sub`.

**Arrangement** · one stat per full-width row; value on the left margin, label in a 416 column on the right margin, 64 px minimum gutter; **the label optically aligned to the value's cap line — 10 px of offset at Big 96, 6 px at Display 68, 8 px at 72**. Hairline between rows, none above the first or below the last. **Interior row 161 at Big/Comfortable and 133 at Display/Comfortable**; the first row 128 and 100, the last 129 and 101 with its hairline; three rows 418 and 334, and the whole section 829 at Big and 745 at Display with a head, a source line and Comfortable padding. Label Under moves the label 12 px below the value on a 620 measure and leaves the right margin empty.

**Responsive** · two columns to 767, one below it. At 834 value 72 / 56, label column 234, row padding 28, offset 8. **At ≤ 767 the label goes under the value whatever the control says, and both value sizes draw at 46** — the largest size a 12-character value cannot overflow in a 350 px column, and **the one place in A10 where two control values draw the same thing**. The hairline is kept stacked.

**Empty** · a row with no label is the value alone, right margin empty, nothing substituted. Four or more → the first three, stated. **One → 4 Single.**

**a11y** · **the value is not a heading at 96 px**; stat a `<p>` in an `<li>`, value then label. Right and Under are the same DOM. At 200% the rows stack on available width; at 400% the value is 46 with the label beneath. Hairline 1.4:1 / 1.6:1, held to no text ratio.

**Flagged** · 96 px as an off-ladder size; the cap-line alignment and its three offsets; the fixed 416 column and 64 px gutter; capping Count at three; refusing Count One; both mobile sizes collapsing to 46; keeping the hairline stacked; refusing the `sub`.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Count up** and **Icons** added, **seven of its own**, and **the “no count-up at any motion setting” row is gone from Not offered** — this design named the refusal in its own panel and its panel now carries the answer: the figure is server-rendered, so **the row never resizes and nobody waits for the number**. Quick Controls: **Value size · Label position · Count · Row padding.** Icons: **28 px at Big 96, 24 at Display 68** — the slot follows the value, as 5 Lead Stat's does — the row growing by the slot and its 12 px gap while **the 416 label column and the 64 px gutter do not move**. Items: **Value source** per stat, and **a bound figure escapes the twelve-character ceiling**, this design's one arithmetic guard: Ghost's pre-rounded strings are short, and the panel names the risk rather than truncating the helper. Editing: **at 96 px the value is edited at 96 px**, in place. **Frames changed:** the control panel, plus a states strip for the 28 px slot and a bound figure at Big.

---

## 16. What A10 settled, in one place

**§8.1 — counts of 2, 3 and 4, and the rule for five.** Two is 632 · 32 · 632, three is 416 · 24, four is 306 · 24. **Five is 3 + 2 in a grid of three, the second row keeping the 416 cell and sitting at the left**; six is 3 + 3, and **eight is 4 × 2 at the 306 px cell and the ceiling of `stats[]`** after the controls pass. Only **3 Grid** draws five, and only 3 Grid draws eight; 3 Grid, 8 Ledger and 12 Sourced draw six. A row-based design with five to eight authored stats names 3 Grid rather than reflowing. **Dividers at two and three, refused at four.**

**§8.2 — units, prefixes and suffixes.** Separate fields, drawn at 0.5em of the value, in `text` and not muted, on the value's own baseline. Symbols tight, anything with a letter at 0.16em, single-capital scale abbreviations tight. **Value and units never wrap apart.** **A stat with no unit is the bare value and nothing is substituted** — nine of the eleven stats in the category's content have none, which makes it the ordinary case. **The value is a text field**, twelve characters, drawn as typed, so "Sold out" is legal.

**§8.3 — the source line.** **Per section by default: one line, 120 characters, 13 px muted on a 620 measure, 32 px under the stats and above the link**, taking `sourceUrl` and becoming a link at the section link's treatment when one is authored. **Per stat in one design only — 12 Sourced** — as numbered footnotes with numeral markers, and **12 Sourced does not draw the section line at all**, because two sourcing systems in one section leaves a reader deciding which governs. **Each note now takes an optional `noteUrl`**: the footnote's text becomes a link at the section-link treatment, the markers are unchanged, and that design gains its first tab stops. Every other design keeps `note` undrawn and its panel says how many notes it is not drawing.

**§8.4 — a stat with no label, and a label of 60 characters.** **The value comes first in the cell in fourteen of the fifteen designs**, so every value in a row shares one baseline whatever its label does: a missing label leaves a hole at the foot of a cell and a three-line label pushes nothing. **A stat with no label is the value alone and nothing is invented.** **60 characters is the ceiling and labels wrap** — never truncated, clamped, ellipsised or shrunk; at the narrowest cell in the category, 306 px, that is three lines at 15 px. The editor's counter turns muted past 34 characters with advice rather than a limit. **1 Row's Order Label above is the one design that puts the label first**, and it equalises the label block so the values keep their baseline.

### The six amendments the drawn designs forced on the proof

1. **Display 68 is not offered at four across, in any design.** The stress frame's `£1,284,900 p a` is 500 px at 68 against a 306 px cell. The value ladder's top rung is therefore a three-across-and-wider size.
2. **A10-0's "the only equalisation anywhere in A10" now reads "the only equalisation of a text block".** **2 Cards equalises card height** to the tallest in the row with the slack at the foot, because a card has a visible edge and three cards of different heights is a broken row. The stats inside the cards are not equalised.
3. **4 Single receives from eight designs, not nine.** 1 Row, 5 Lead Stat, 8 Ledger, 9 Bars, 10 Image Split, 11 Inline, 14 Change and 15 Big Type hand off to it at one stat. **12 Sourced and 13 Slim draw their own single stat** — 12 because 4 Single does not read `note`, 13 because its contract is a short band — and 2 Cards, 3 Grid and 6 Split Head hand off to 1 Row first.
4. **14 Change carries A10's only forced control value:** at ≤ 767 the change line is Under the value whatever Change line says.
5. **15 Big Type is the only design where two control values draw the same thing:** at ≤ 767 both Display 68 and Big 96 draw at 46.
6. **13 Slim's padding scale does not step with width** — 32 · 44 · 56 at 1440, 834 and 390 alike — the only width-independent spacing scale in the category.

### The category in one paragraph

A10 is fifteen arrangements of a component that is two lines of text with a strict relationship between them. **Eleven designs draw a row or grid of equal cells; four do something else** — 4 Single has no arrangement, 8 Ledger turns the stat on its side, 11 Inline dissolves it into prose, 15 Big Type gives one stat a whole row. **Six designs read a field no other design draws**, and each of them hands off to 1 Row when that field is missing. **Nothing in the category opens, filters or reorders, and nothing animates until a site turns Count up on** — one registry module, off by default, over figures that are already in the HTML. The one graphic in it — 9 Bars' track and fill — is decoration for a number already written beside it, and **the one thing the module is not allowed to touch**.

---

## 17. Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fifteen, in order:

| # | Design | Tuple |
|---|---|---|
| 1 | Row | `grid-of-N · none · page · few · none · row of equal cells` |
| 2 | Cards | `grid-of-N · none · page · few · none · one stat per card` |
| 3 | Grid | `grid-of-N · none · page · variable · none · hairline matrix, shared edges` |
| 4 | Single | `stack · none · page · one · none · one value at Huge` |
| 5 | Lead Stat | `split · none · page · few · none · one lead at Display` |
| 6 | Split Head | `split · none · page · few · none · head beside the block` |
| 7 | Contrast Band | `grid-of-N · none · contrast · few · none · ground inverted, accent substituted` |
| 8 | Ledger | `table · none · page · variable · none · value right, one baseline` |
| 9 | Bars | `stack · none · page · few · none · proportional bar per stat` |
| 10 | Image Split | `split · none · page · few · left · photograph beside the stats` |
| 11 | Inline | `article body · none · page · few · none · values inside a sentence` |
| 12 | Sourced | `grid-of-N · none · page · variable · none · numbered note per stat` |
| 13 | Slim | `bar · none · page · few · none · label beside the value` |
| 14 | Change | `grid-of-N · none · page · few · none · previous figure per stat` |
| 15 | Big Type | `stack · none · page · few · none · one stat per row` |

**No two tuples are identical.** **Nine of the fifteen are separated on the sixth slot alone**, in four clusters, and they are named below rather than papered over — that count is A10's shape rather than a fault in any design: the category is fifteen arrangements of one two-line component, on one ground, at one to eight items.

**Distribution.** Archetype: grid-of-N ×6 (1, 2, 3, 7, 12, 14) · split ×3 (5, 6, 10) · stack ×3 (4, 9, 15) · table, bar, article body ×1 each (8, 13, 11). Containment: `none` ×15. Ground: `page` ×14, `contrast` ×1. Item-count class: `few` ×11, `variable` ×3, `one` ×1. Media placement: `none` ×14, `left` ×1.

**Containment is `none` on all fifteen, and it is the slot most likely to be got wrong here.** Two designs draw a container and neither contains the section: **2 Cards' cards are the item's own geometry** — one stat per card, which is exactly what the closed set means by `none` — and **3 Grid's cells are the matrix**. The cases worth stating are **3 Grid's Frame Boxed and 4 Single's Frame Panel**, which do put a hairline box around the whole section: **both are control values, both are drawn as secondary frames, and the tuple names the primary** — Frame None in each — on the convention A8 set for Ground controls. A site that switches 3 Grid to Boxed has changed a value, not a design. *Flagged: the convention.* **A10 contains no design whose container is the design**; A11·4 Boxed is what that looks like when it is one.

**Ground.** Fourteen on `page`, one on `contrast` (7). **No design in A10 has a Ground control at all** — the ground is the page's or the band's — so nothing here needs the convention beyond the paragraph above. `surface` appears in the category only as a card fill (2), a boxed block (3) and a panel (4), all of them items or control values rather than the section's ground. **`image` is unused even in 10 Image Split**: the photograph is one half of a split, not what the section rests on. `transparent` is unused too — 13 Slim has no fill of its own, but it sits on the page's background rather than on another section's, and `page` is what that is.

**Item-count class.** `few` on eleven (1, 2, 5, 6, 7, 9, 10, 11, 13, 14, 15) · `variable` on three (3, 8, 12) · `one` on 4 Single. The convention is A8's: **a design whose Count control stays inside one class is written as that class, and one whose control crosses classes is `variable`** — 3 Grid (four, five to eight), 8 Ledger and 12 Sourced (three, four or six) all cross from `few` into `many`. **`many` and `none` are both unused**: eight is the ceiling of `stats[]` after the controls pass, and even 3 Grid's Four · Five · Six · Eight starts inside `few`, so no design's control lives entirely at five or more, and every design draws at least one repeating unit because the repeating unit is the category.

**Media placement.** `none` on fourteen. **A10 draws one image in the whole category** — 10 Image Split's, at `left`, with Image side Right offered on the same tuple. **9 Bars' bar is not media placement**: it is two nested `<span>`s decorating a figure already written beside it, and calling it `inline` would describe the item rather than the section and would say nothing about either.

**The four clusters separated on emphasis alone.**

1. **1 Row, 2 Cards and 14 Change** all read `grid-of-N · none · page · few · none` — a bare row of equal cells, the same row with a surface under each stat, and the same row with a second figure under each value. The document already says 2 Cards is 1 Row with a container and that switching between them changes the container and nothing else, and 14 Change is 1 Row plus a field. **What separates them is the item's geometry and the fields it reads, and the closed slots carry neither.**
2. **3 Grid and 12 Sourced** both read `grid-of-N · none · page · variable · none`. Both hold six; the difference is a shared-edge hairline against a superscript numeral, which is to say a field and a border.
3. **5 Lead Stat and 6 Split Head** both read `split · none · page · few · none`. **This is the pair the tuple describes best**: a split is what both are, and the sixth slot names what is on the far side of it — one stat in the first case, the head in the second.
4. **9 Bars and 15 Big Type** both read `stack · none · page · few · none` — rows down the page in both, one carrying a proportional bar and one carrying a 96 px numeral.

**And the pair the vocabulary separates most cleanly is the one that looks identical on the page: 1 Row and 7 Contrast Band differ on ground alone**, `page` against `contrast`. That is §8's claim about ground holding exactly: the document's own words for 7 are that switching between the two changes nothing but the colours, and the tuple agrees with it.

---

## 18. Findings for the architect

1. **A10 declares one module — `count-up`, on all fifteen, off by default.** Nothing in the category loses a word, a figure, a proportion or an arrangement with JavaScript off at either value of Count up, so **FR-G4 is still satisfied by construction rather than by degradation**; what the module adds is an animation over a figure the server already rendered. `core` is assumed once at the head of this document rather than fifteen times. *The pass before this one recorded “A10 declares no modules” as a library first; that finding is withdrawn.*
2. **One module is declared and one is still refused, and the registry's own sentences settled both.** `count-up` ships because “The final value renders as static text — it is already in the HTML before JS ever runs.” answers every objection §0 raised; `reveal` stays refused because “Content renders fully visible; the hide-then-reveal CSS is scoped to `.js-enabled`.” describes A10's resting state, which is the state a site already has. **No design in A10 asks for behaviour the registry does not have, and nothing in this document coins a module name.**
3. **The closed slots carry very little signal in this category.** Containment is `none` fifteen times, ground `page` fourteen, media `none` fourteen and the count class `few` eleven — so nine designs are separated on the free sixth slot alone. What actually separates A10's designs is **the value's size, the cell's width, and what sits beside or under the value**, and none of the five closed slots holds any of the three. If A10 needs to read as structurally distinct, the fix is a scale slot or a finer count class, not a longer emphasis phrase.
4. **`variable` is doing work its gloss does not describe.** 3 Grid, 8 Ledger and 12 Sourced are `variable` because their Count control crosses the four-to-five line, not because the author decides how many — in A10 the author never does; each design names its counts and hands off outside them. A “few to many” class would describe all three exactly.
5. **Two hand-offs cost a field, and both are hand-offs for surplus data rather than missing data.** 14 Change at five to eight authored stats names 3 Grid, which does not read `prev`, so the change lines go with the switch; 9 Bars at five to eight is the same shape with `share`. The category's hand-off map was written for missing data; if the pattern repeats in a later category it deserves a rule of its own.
6. **11 Inline's drawn order is its sentence, not its repeater.** The shared floor's “the authored order is the drawn order at every width” holds as a statement about width; the order the figures are read in is the order their chips sit in the lede, and reordering the repeater renumbers chips and moves nothing. It is stated in that design's Items field and in its panel rather than as an exception to the floor — but it is the only place in the library so far where the two orders are separate mechanisms.
8. **`Value source` is the library's first item-level Ghost binding, and it deserves a name.** Every earlier binding replaced a whole list (posts, tags, tiers) through the P0·5 “Populate from…” panel. This one is an enum **inside a repeater item** that swaps one text field's value for a helper's output, disables two sibling fields and makes a third un-editable. If the pattern recurs — a tier price, an author's post count — it wants a shared control rather than a per-category invention. *Flagged.*
9. **9 Bars is a module applied to half a design, which the registry has no vocabulary for.** `count-up` runs on the figure and is forbidden on the fill. It is the honest answer, but “module on, one element excluded” is a state no other design in the library declares; if modules are meant to be all-or-nothing per section, this is the exception to rule on.
10. **Icons ship on fourteen of fifteen, and the fifteenth cannot take them.** 11 Inline's refusal is structural rather than editorial — a glyph inside a sentence has no position — so a build that expects the toggle to be universal will find one design that answers None and offers nothing else.
11. **The raised ceiling has exactly one arrangement.** Eight authored stats are drawable in 3 Grid and nowhere else in the library. A site that wants eight in a ledger or eight with footnotes is asking for a new count on 8 Ledger or 12 Sourced — a spec change, not a control — and the repeater's cap sentence is what stands between the two.

7. **Four item behaviours were decided in the pass before this one and are flagged where they sit:** 8 Ledger draws two rows below its Count minimum; 12 Sourced draws two cells; 10 Image Split advises Count Two at three authored stats rather than switching it; and **9 Bars' new stat arrives with `share` 25**, so that adding a stat cannot hand the section to 1 Row mid-edit. Each of the first three was previously specified at one stat only.

---

## 19 · Reconciliation notes

**Frames changed in this pass.** **All fifteen control-panel frames** — `A10-1 Row`, `A10-2 Cards`, `A10-3 Grid`, `A10-4 Single`, `A10-5 Lead Stat`, `A10-6 Split Head`, `A10-7 Contrast Band`, `A10-8 Ledger`, `A10-9 Bars`, `A10-10 Image Split`, `A10-11 Inline`, `A10-12 Sourced`, `A10-13 Slim`, `A10-14 Change`, `A10-15 Big Type`. Each lost its **Padding** row into **Vertical spacing**, gained **Count up** and (on fourteen) **Icons**, and gained four groups drawn outside its own list: **UNIVERSAL** (Background role · Vertical spacing · Top divider), **STATS · the item list** (the P0·3 controls, the per-item fields and Value source, the eight-stat cap in the owner's voice), **EDITING · the P0 primitives** and **BEHAVIOUR · from the fixed registry**, plus a **DATA** group that no longer says “nothing from Ghost”. Every **footer count** was rewritten to “N controls + the universal trio + the Data group”. **A new states strip was added to each of the fifteen** — Icons Shown and a bound member count everywhere, plus **3 Grid's eight-cell grid**, **4 Single's 32 px slot**, **7's icons and bound value on the band**, **8 Ledger's left-edge slot**, **9 Bars' never-animated bar**, **10 Image Split's Image focus popover**, **11 Inline's insert button inside the P0·1 frame**, **12 Sourced's linked footnote beside an unlinked one**, **13 Slim's baseline slot and new band heights**, **14 Change's four catalog strings** and **15 Big Type's 28 px slot**. **A10-3's Count row gained an Eight value** and its Columns advice the disabling reason. **`A10-0 Category Proof` was amended in twelve places** and carries a new **RECONCILED · CONTROLS PASS** block: the Ghost premise, the count-up refusal, the icon refusal, the “no motion at all” finding, the counts rule, the Count control's values, the field list (`noteUrl` added, the count corrected to eighteen — the old “sixteen” never matched its own enumeration, `stats[]` one to eight) and the ceiling sentence. Stale claims were corrected on nine design frames — **1 Row's “seven controls”** in its eyebrow, intro and flagged list; **3 Grid's “six is the ceiling”**; **4 Single's, 7 Contrast Band's, 9 Bars' and 15 Big Type's count-up refusals** in their a11y and panel notes; **6 Split Head's “six controls”**; and **12 Sourced's and 14 Change's footer counts**.

**No primary section frame was redrawn, and the reason is worth stating.** Every control this pass adds ships **off by default** — Count up Off, Icons None, Value source Authored, `noteUrl` empty — so the desktop, dark, tablet and mobile frames already drawn are the drawn values. What is new is drawn where it can be read against them, in the states strips. **12 Sourced is the closest call**: an authored `noteUrl` changes visible content, and it is drawn in that design's strip beside an unlinked note rather than by editing the primary frame, where no URL is authored.

**Conflicts with earlier rulings, one line each.**

1. **§0's “the count-up is refused in all fifteen, at every motion setting, for four reasons”** — **overturned for the figure, kept for the fill.** All four reasons assumed a figure that is not in the DOM until a script puts it there; `count-up`'s is server-rendered. **9 Bars keeps the refusal for its bar**, where a proportion cannot be read while it moves.
2. **§0's “no design in this category has a behaviour” and “A10 uses no modules: all fifteen declare `none`”** — **superseded**: one module, declared on all fifteen, off by default and edit-safe. **The claim underneath survives untouched** — nothing in A10 needs JavaScript — and it is now stated that way rather than as an absence.
3. **§0's “an icon per stat — sixty stat icons across twelve packs is an icon set to maintain”** — **overturned**: the premise predates the curated P0·2 picker. The second half — “a glyph above 340 issues sent tells a reader nothing the label did not” — **survives as advice at the control**, and **11 Inline keeps a structural refusal**.
4. **§0's “Nothing comes from Ghost … member counts live behind the admin API”** — **false and corrected**. `{{total_members}}` and `{{total_paid_members}}` are public theme helpers; **Value source** ships per item. The rest of the refusal stands: no post counts, no admin-API figures, no third-party fetch.
5. **§0's “the value is a text field, not a number field — no formatter, no locale, no separator guessing”** — **unchanged, and now load-bearing**: it is precisely why a pre-rounded helper string can be dropped in verbatim.
6. **§0's twelve-character ceiling on `value`** — **unchanged for an authored value and inapplicable to a bound one**; Ghost's string is drawn as given, and **15 Big Type names the risk** rather than truncating a helper.
7. **“Six is the ceiling of `stats[]`”, in §0, §8.1, 3 Grid, 8 Ledger and 12 Sourced** — **raised to eight**, drawn by **3 Grid alone** at 4 × 2 in the 306 px cell. 8 Ledger and 12 Sourced still stop at six **by design rather than by ceiling**, and every row-based design names 3 Grid from seven authored stats up.
8. **Every design's per-design “Padding” row** — **retired into Vertical spacing**, the same three values under the universal name. **7 Contrast Band's 44 · 64 · 88 and 13 Slim's width-independent 32 · 44 · 56 survive as those designs' resolutions**, not as second rows; **2 Cards' Card padding, 8 Ledger's and 9 Bars' Row padding and 15 Big Type's Row padding keep their rows**, because they measure something other than the section.
9. **§17's “the tuple names the drawn frame rather than the range a Ground control offers”** — **unchanged, and easier to hold**: the range is universal now, and **7's locked Background role is the one case where the lock and the tuple coincide**.
10. **12 Sourced's “not offered: a note as a link; a per-stat URL”** — **overturned**: `noteUrl` ships. The neighbouring refusals stand — no back-reference, no marker style, no DPUB footnote roles, and the section source line still undrawn there.
11. **12 Sourced's a11y ruling “nothing is a link, nothing jumps, and no DPUB footnote roles are used”** — **half overturned**: a linked note is a link and a tab stop, and the `aria-describedby` relationship survives with the link inside the description. **Nothing jumps, and no DPUB role is used.**
12. **14 Change's “four fixed wordings: up from · down from · unchanged from · was”** — **become theme catalog strings**, not fields. The parse that chooses between them, the `aria-hidden` glyph and the refusal to compute a difference are unchanged, and **the glyph stays outside the translated string**.
13. **11 Inline's chip-insert affordance** — **moved into the P0·1 toolbar's frame** as one added button. The chip mechanism itself is unchanged: figures still cannot be typed into the sentence by hand, and reordering the repeater still renumbers chips without moving prose.
14. **11 Inline's exemption from Icons** — a **ruling of this pass**, drawn at the control with **1 Row** named. It is the only design in A10 that answers the icon question with a reason instead of a value. *Flagged.*
15. **10 Image Split's “not offered: … any crop the site did not name”, and its silence on focal point** — **Image focus: Centre · Top · Bottom ships in the Image Picker's popover** beside Crop, per ground rule 10; the crop refusals and the no-caption, no-scrim rules stand.
16. **The category's “§7.6 ceiling” framing — 1 Row described as “the only design in A10 at the ceiling” with seven controls** — **lifted**. The budget is the PRD's ~15 visible controls plus the universal trio and the Data group; **A10 now runs from six of its own (11 Inline) to eight (1 Row)**, and Quick Controls are named per design.
17. **Ground rule 9, Member Visibility** — **lands nowhere in A10 and is recorded rather than added**. The category bears no action: its one link is a text link at the section-link treatment, not a CTA, and **13 Slim draws no link at all**. If the architect wants the control universal rather than CTA-scoped, all fifteen designs would gain it at once. *Flagged.*
18. **Ground rule 11, button icons** — **lands only on the optional section link**, which takes an icon before or after its label, off by default. **A10 draws no labelled button anywhere**; the stat slots are the icon offer's real surface here.
19. **“Every frame in A10 is a resting state”** — **survives**. `count-up` is edit-safe and off by default, so no drawn frame changed value, and the states strips are drawn at the new values rather than replacing the old ones.
20. **§0's “the accent is spent in three places and nowhere else”** — **a fourth place**, and the sentence is amended rather than kept: a linked footnote in 12 Sourced takes the section-link underline. **No value is still ever accent-coloured**, 7 Contrast Band still substitutes the carried colour for all of them, and **13 Slim can still contain no accent pixel under any setting**.
21. **§18's finding 1, “A10 declares no modules — a first in the library”** — **withdrawn**, and the finding it becomes is narrower: A10 is the category whose every design works with JavaScript off **at both values of its one module**.
