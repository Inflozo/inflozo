# A13 Process / How It Works — written specification

15 designs · Paper pack · drawn in this project as `A13-1 Three Up.dc.html` … `A13-15 Sticky Rail.dc.html`, with the category's shared artefacts in `A13-0 Category Proof.dc.html`.

Read `A13-0` first. It carries the four settlements §8 asks A13 to make, the step card, the numeral ladder and the marker, the numeral plate, the rules all fifteen share, the shared field list — sixteen fields after the controls pass, the roster with its structural descriptors, the eight steps every frame draws, the tokenisation proof across three packs and the stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times, plus the amendments the drawn designs forced on the proof.

**Design patch pass — 30 August 2026 (this document's current state).** The ten library-wide rules were applied to all fifteen designs, and one of them reached almost every design in the category. **No design ever turns into another design:** A13's hand-off map — twenty-five sentences across thirteen designs, including the library's only two-way hand-off — is deleted, and in its place every design draws what it has, hides what cannot apply, and its panel advises. **Remove never greys out**, and the floor now explains itself at two steps instead of walking the section out of existence. **Ghost's templates cannot count**, so the numeral is stated as what it always was in the drawing: a stylesheet counter at `decimal-leading-zero`, with no arithmetic and no authored field anywhere near it. **CSS cannot see content**, which withdrew one promise — 13 Slim Bar's pill title now wraps rather than claiming a measured width. The section link gains the **member ask**. **Nothing was renumbered, no design was deleted, and no visual language, type scale, colour pack or spacing step changed.**

**[Free] designs:** 1 Three Up · 3 Rows

*(Shortlisted in this pass — 1 Three Up, 3 Rows, 2 Track, 14 Index, 5 Split Head: the five plainest designs, none of which needs the customer to own good photography — recommended as a grid and a stack, and **ruled by the owner on 30 August 2026**. Between them two to eight steps, with no picture, no icon and no prose required for either to look finished.)*

**Controls-reconciliation patch (the pass before this one), 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface, reusing the shared editor primitives designed in **P0 · Editor primitives** — the P0·1 inline text toolbar and its link popover, the P0·2 icon slot and Icon Picker, the P0·3 item-list controls, the P0·5 “Populate from…” data panel, the Ghost-aware Link Picker and the P0·6 editor state switcher. **Eleven things changed, and none of them moved a primary section frame.** Every per-design **Padding** row is retired into the universal **Vertical spacing**, and **the universal trio — Background role · Vertical spacing · Top divider — sits outside every design's control list**, leaving **five controls on fourteen designs and six on 3 Rows**. Two ladders survive as resolutions of that control rather than as second rows — **6 Contrast Band's 44 · 64 · 88** and **13 Slim Bar's 32 · 44 · 56** — while **4 Cards' Card padding and 10 Panel's Panel padding keep their own names**, being the inside of a plane. Two values are locked with the reason shown: **6 Contrast Band's Background role at Contrast**, and **Top divider at None on both bands**, each of which already draws its own edges. **The Ghost source became real:** a **Data** group on all fifteen — Source: Authored · From posts, P0·5 for reading paths — which **withdraws this category's “no Ghost source at all” finding** and re-opens the per-step-link refusal for bound mode only. **`duration` ≤ 12 joins `steps[]`**, drawn in 14 Index as the Columns row's third value and in 3 Rows' end slot; **`status` stays refused**. **`icon` is a P0·2 slot** with a size and colour-role popover, and the component inventory's contained 1:1 upload alternative is dropped. **Image focus (Centre · Top · Bottom) ships on every image field.** Inline editability is stated per field, per design. **A13's four visitor-facing strings are named as theme translation-catalog strings.** **Member Visibility lands nowhere and is recorded rather than added.** The document now ends with a **Reconciliation notes** section.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

**A13's headline finding: the order is the content.** A team read out of order is still the team; a process read out of order is wrong. Everything follows from that. The markup is an `<ol>` in all fifteen designs — the first ordered list in the library — the numeral is a rendering of position rather than a field anybody types, and **reorder is consequential in every single design** rather than in six of them. It is also the reason no design generates a “Step 3 of 6” string: the list already says it.

**A13 uses three modules and twelve designs declare none.** `tabs` on **11 Walkthrough**, `carousel` on **8 Rail**, `scroll-spy` on **15 Sticky Rail**. Everywhere else the resting state is the only state and the resting state is markup and stylesheet: the numeral ladder, the marker, the connector and its turn at 390, the numeral plate, the equal card heights, the panel, the column alignments, the alternation and the hairlines are all CSS, and the steps are server-rendered. **No A13 design loses an authored step without JavaScript**, and twelve of the fifteen are pixel-identical with it switched off.

**`reveal` is refused in all fifteen, and it is the refusal that matters.** A numbered process animating in one step at a time is the single most common thing a theme does with this section, and it means the steps are not on the page until the reader has scrolled to them. `count-up` is refused too — a numeral is a position, not a statistic, and animating it would be counting up to “3”. *Flagged: both refusals are mine.*

**`core` is assumed, not declared per design.** A13 has JS-conditional CSS in three designs only, and `core`'s job is that branch: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than fifteen times, as in A11 and A12. *Flagged: not listing it per design is mine.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. **All three are edit-safe:** 8 Rail's scroll position is never persisted or restored, 11 Walkthrough's selected tab resets to the first step on reload, and 15 Sticky Rail's current step is never persisted. That is why every frame in A13 is a resting state.

**Four findings for the architect.**

1. **`tabs`' no-JS branch changes A13·11's heading level, and only its no-JS branch.** With JavaScript on there is one `<h2>` and the step titles are `<p>`s, per A13-0's step-card rule. The registry's degradation — “All panels render stacked and visible, each preceded by its tab label as a heading” — emits a heading per panel, so the page gains six `<h3>`s that are not in the outline when the module runs. The degradation is an acceptance criterion (FR-G4) and this document's rule is that the drawn panel is the authority, so the collision is real. **Either `tabs` gains a branch that stacks without emitting headings, or A13 accepts a category-wide exception at design 11.** Nothing else about the branch is a problem: every word and every picture is present, in order. **The flag stays visible on `A13-11`'s frame after the controls pass, and the same ruling covers A15's Playlist and Tabs** — one decision, three designs.
2. **A12's finding 3 is settled here, in the registry's favour.** A11·9 and A12·13 both refused `scroll-snap`; A12 flagged the refusal as unforced. **A13·8's cards are equal, the steps are ordered, and a step is exactly the unit a reader wants to land on**, so the registry's snap strip is the right drawing and is drawn. The consequence is that A13·8's JavaScript-off drawing is its drawn drawing minus two arrows and two fades, and its phone drawing and its no-JS drawing are the same drawing.
3. **A12's finding 4 is closed by the design patch pass rather than carried.** It read: 8 Rail's precondition is a measurement and no module measures. **There is no precondition any more** — *no design ever turns into another design* — so nothing has to decide between two designs at render. What is left is the rule's own example: **the `carousel` module hides the two arrows and the two fades when the track already fits**, a browser measurement made by the module, and with JavaScript off there are no arrows to hide. 8 Rail is a rail at every count and every width, and 12 Media Top is a grid at every count.
4. **A13·14 Index was the design a site would ask to extend, and half of that finding is now answered.** *(The clause below about four designs naming 14 Index at seven steps is now read as advice: their panels advise it, and they never hand their frames to it.)* `duration` — text, ≤ 12, optional — **joins `steps[]` in the controls pass**, drawn as 14 Index's third Columns value and 3 Rows' end slot and kept invisible in the other thirteen, on the reasoning the old finding stated: A13's shared list is where such a field lands, and it is cheaper to add before more categories ossify the list than after. **`status` stays refused** — there is no honest way to render a state on a marketing page, and a process that tracks its own progress is an application. **What remains for the architect is the timing rule rather than the field:** adding to a shared list after a category is drawn changes every design's “kept and not drawn” line, and it did here — thirteen designs gained a held field in one edit.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**A13's item has no required media at all, and that is a first.** A11's item was a logo and A12's was a face; a step is a line of type that may or may not have picked up a picture along the way. So the missing-image answer here is not a second upload and not an initials block — it is **the numeral plate**, a mark the theme generates from something it already has. **Flagged**, and A13's headline component.

**The step card is A13's second new component: media, numeral, label, title, body, in that order, in the DOM, in all fifteen designs.** What varies is whether the media sits above the type or beside it, and which of the five a design draws at all. **A design never re-orders the parts**, so switching designs never changes what a reader hears about a step. A12's person card, restated for a step, and the reason is the same one. The title is the pack's **body** font at 20/600, rising to 24 in 7 Alternating Media, 9 Big Numbers, 11 Walkthrough and 15 Sticky Rail where the step is the whole composition, and dropping to 17 in 14 Index and 15 in 13 Slim Bar. **A step title is never a heading** — six `<h3>`s under one `<h2>` would put a pitch process into the page's outline — **and 11 Walkthrough is the one exception, forced by its module's no-JS branch.** Body 15/1.6 in `text-muted`, label 13 uppercase tracked `.08em` in `text-muted`. **There is no card fill, border, shadow or radius on a step**: 4 Cards is where a step gets a plane and it is the only design in A13 with one; 10 Panel puts a plane around the whole section instead. **Flagged**.

**The numeral: there is no `number` field, and nobody types a numeral anywhere in A13.** The theme renders the item's position, so **reordering re-numbers** and removing step 2 makes the old step 3 into step 2 with no edit. Refused: an authored number, a letter series, a Roman series, a “Step 03 of 06” counter, and a zero-padding control. **Two figures below ten is the drawn form** — 01 … 08 — except in a marker, where a 32 px box takes one figure. **The ladder is Small 20 · Medium 28 · Large 40** in the pack's heading font, tabular figures, tracked `-0.02em`, always `text-muted`; **Display 72 and 104 exist in 9 Big Numbers alone**, and **the marker's figure is the one numeral in the category set in `text` rather than `text-muted`**, because it sits on a fill of its own. **The numeral is `aria-hidden` in every design**, because the list is an `<ol>` and a reader already hears “list item 3 of 6”. **Numerals is a real control with a real None value in eleven designs**, and turning it off changes nothing a reader hears. **Where the numeral sits is the design, not a control** — ten designs put it above the title, three in a fixed gutter, two in a marker, one at display size — **and 9 Big Numbers is the one design with a numeral-position control**, which it earns because at 72 or 104 px the figure is a composition element rather than a marker. **Flagged**, all of it.

**How the numeral is drawn, stated now that the platform fact is on the table: a stylesheet counter, not template arithmetic.** Ghost's templates cannot count, add or remember, and nothing in A13 asks them to. **The `<ol>` carries a CSS counter and each `<li>` renders `counter(step, decimal-leading-zero)`**, which is where **01 … 08** comes from — no arithmetic, no padding helper, no authored field. **The numeral plate's figure at 0.4 × the box's shorter edge is `40cqmin` on a size container**, so the theme never measures a box either. **Nothing in A13 counts across its own loop:** there is no “Step 3 of 6”, no total, no “and 2 more”, and no heading that appears only when something changes. The one number stated anywhere is **Add step disabled at eight**, which is the editor's own count and never the visitor's page.

**The marker is a 32 px box at the pack radius**, `surface` fill, 1 px `border` hairline, one figure at 15/600 in `text`. **It is a box and never a circle**, so a 6 px pack and a 14 px pack each get a marker in their own shape rather than one of them getting a circle that ignores the radius token — the decision the tokenisation proof is drawn on. 2 Track, 12 Media Top and 13 Slim Bar use it; 2 Track also offers a **10 px dot in `border`** in its place. **Flagged**.

**The connector is one hairline in `border`, and it turns rather than disappearing.** At 1440 in 2 Track it runs horizontally through the markers, from the first marker's centre to the last's, passing behind each; at ≤ 767 **it becomes a vertical hairline down the markers' centre line**. It never simply drops, because a connector that vanishes on a phone makes six steps look like six unrelated cards. **Three designs draw one and twelve do not:** 2 Track horizontally, 15 Sticky Rail vertically down its list, and 13 Slim Bar as a chevron between pills — **the one non-hairline separator in A13**, and a separator rather than a connector. **A rule between rows or between columns is not a connector**: it divides, it runs the full measure, and 1 Three Up, 3 Rows, 6 Contrast Band, 9 Big Numbers, 10 Panel and 14 Index offer one. **Refused across the category:** an arrowhead, a chevron on a line, a dashed or dotted connector, a curve, a connector in `accent`, a thickness control, a progress fill, and any connector that animates in on scroll. **Flagged**, and §8.3's answer.

**`icon` and `image` are two fields and no design draws both.** A design belongs to one of three families and stays in it: **type alone** — eight designs; **icon** — 4 Cards, 10 Panel and 13 Slim Bar, a 44 px box on the hover surface at the pack radius holding a 20 px glyph in `text-muted`, and the glyph alone with no box in 13 Slim Bar's pill; **image** — 7 Alternating Media, 8 Rail, 11 Walkthrough and 12 Media Top, at one named crop for the whole section. **No control switches a design between families**, because that control would move every other element on the frame. **Flagged**.

**`icon` is a P0·2 icon slot and nothing else can fill it.** Clicking an empty slot opens the **Icon Picker**; clicking a filled one opens its popover — **Swap · Size (Small 20 · Medium 24) · Colour role (Muted · Text) · Remove**. **The 44 px box, its fill and its radius belong to the design and are not in the popover**: the slot decides the glyph, never the plane. **The component inventory's “contained 1:1 upload” alternative is dropped** — an uploaded square is outside the closed icon vocabulary and cannot be recoloured for dark, which is the reason rather than the taste; a file in the field is kept and refused, and the panel says so. **Accent stays refused on every sequence mark** — the numeral, the marker, the connector, the plate and the glyph — so colour role has two values and no third.

**Image focus (Centre · Top · Bottom) ships on every image field**, in the Image Picker's popover and never as a hidden field: step `image` in 7 Alternating Media, 8 Rail, 11 Walkthrough and 12 Media Top, and the section's own picture in 5 Split Head. A14's ruling, that where a photograph is cropped is content. **The refusals it meets keep their aim and their wording:** the crop is the section's, there is no per-step crop, and no *control* moves a crop. Where it does the most work — 7's 632 × 421 and 632 × 632 — the old answer, “the answer to a badly cropped picture is a different upload”, is withdrawn.

**The numeral plate.** Where an image design meets a step with no `image`, the box is filled with `surface`, given a 1 px `border` hairline and the pack radius, and carries **the step's numeral in the heading font at 0.4 × the box's shorter edge** in `text-muted`. Same box, same crop, same place in the card. **A row mixing photographs with numeral plates is the ordinary case and nothing marks the difference.** It is `aria-hidden`, like every other numeral. In an icon design **a missing icon draws the numeral in the icon's box instead**, at 20/600. Refused: a stock glyph chosen by the theme, a generated illustration, an empty reserved box, a hue derived from the title, and the site's logo in the hole. **Two readings exist on the doubled figure and each design states which it takes:** 4 Cards drops its top-right numeral when the box carries the plate, so no card draws the same figure twice; 10 Panel, 12 Media Top and 13 Slim Bar keep both, because in each of those the second figure is part of a column or a row of marks that would break with one missing. **Flagged**, both readings.

**The universal controls, outside every design's list.** **Background role** (Background · Surface · Contrast) · **Vertical spacing** (Compact · Comfortable · Spacious) · **Top divider** (None · Line · Fade). Every frame in A13 is drawn at Background role each design's own ground, Vertical spacing Comfortable and Top divider None, which is why no primary frame moved. **Every per-design Padding row is retired into Vertical spacing** — the same three values under the universal name — and **two band ladders survive as resolutions of it rather than as second rows**: 6 Contrast Band's 44 · 64 · 88 and 13 Slim Bar's 32 · 44 · 56, each of which *was* its design's whole vertical spacing. **Two genuinely different ladders keep their own names**, being the inside of a plane rather than the section's spacing: **4 Cards' Card padding** and **10 Panel's Panel padding**. **Two locks, each with the reason shown:** 6 Contrast Band's **Background role at Contrast**, its ground being the finding the design exists to state, and **Top divider at None on 6 Contrast Band and 13 Slim Bar**, because a band already draws both of its own edges and a universal divider would draw one of them twice, 1 px apart. **At Background role Contrast, any design carries 6 Contrast Band's derived values** — muted at 72%, hairline at 18%, **the numeral plate and the icon box at 10%**, and **the accent disabled at 2.3:1 light and 2.1:1 dark**. **Flagged: the 10% plate on a band is mine.**

**Editing, stated once here and per design below.** **Every visible authored text is inline-editable with the shared P0·1 toolbar** — bold · italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow · noreferrer · sponsored**. That is: `eyebrow`, `title`, `sub`, `body`, `note` and the section link's label; per step `title`, `body`, `label` and `duration`; 11 Walkthrough's tab titles, which are its step titles; 13 Slim Bar's lead-in sentence, which is that design's `title`. **Every URL field opens the Ghost-aware Link Picker**, and **the section link takes an optional P0·2 icon before or after its label**, off by default. **The numeral is never editable** — it is a rendering of position, so there is nothing to click and nothing to type — and neither are the marker, the connector, the plate or the chevron. **At Source From posts the step title and body are Ghost-owned**: the toolbar is replaced by the plain-text lock pill and clicking says “Edit in Ghost”.

**Data — reconciled, and this is the pass's largest change.** **Source: Authored · From posts**, on all fifteen panels. **Ghost still has no process object** and no ordered custom collection, so nothing binds a step *as* a step; what ships instead is **P0·5 configured for reading paths** — Filter **By tag** and nothing else, because Latest, Featured, By author and Hand-picked are not sequences; Order **fixed at Oldest first**, because a process read newest-first is a different process; Count a stepper at **each design's own ceiling, never above the category's eight**. **`title` ← post title, `body` ← custom excerpt, `image` ← feature image**, and **each bound step links to its post**. `label`, `duration` and `icon` have no Ghost source and stay empty, drawing each design's own empty state. **Add step, the drag handles and Remove are hidden in bound mode** — P0·3's read-only card, one row per post, a lock in place of the handle — so **order comes from Oldest first rather than from a drag**, the one thing a bound process cannot do. **This re-opens the per-step-URL refusal for bound mode only**, and with it 13 Slim Bar's “the pill is not a control” and 14 Index's refusal of a row link. **Authored steps still take no per-step link.** *Flagged: the owner's ruling, and every consequence of it is recorded in the Reconciliation notes.*

**Visitor-facing strings.** **A13 ships no fixed English string.** Its four — 8 Rail's group name “How it works, scrollable”, the rail's “Scroll left” and “Scroll right”, and 15 Sticky Rail's `<nav aria-label="Steps">` — are **theme translation-catalog strings**, not authored fields: each names a container or a control rather than saying anything about the site's process, so there is nothing for an author to write. Everything a reader *reads* is an authored field with a default.

**Member Visibility lands nowhere in A13 and is recorded rather than added.** The category bears no call to action: its one destination is a text link at the section-link treatment, 13 Slim Bar draws no link at all at Lead None, and a step is never a target. **The member ask does land, on that one link.** Where the section link's target is a member action, the panel now carries two lines: **it does not render** when the connected site cannot support it — self-signup switched off, or no payment provider connected — and **where it opens Ghost's own sign-up pop-up, with JavaScript off nothing happens.** The ask is scope-tagged apart from Member visibility, which hides the section server-side, and **no design in A13 contains a subscribe or sign-in field**, so the no-JavaScript notice has nothing to replace here. *Flagged: if the architect wants the control universal rather than CTA-scoped, all fifteen gain it at once.*

**Space.** **Reconciled: this is the universal Vertical spacing control.** Section padding Compact 64 · Comfortable 96 · Spacious 132, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. **Cell widths are A10's divisions, inherited a fourth time:** Two 636 · Three 416 · Four 306 · Five 240 on a 24 px gutter. **Row gap 48 between rows of steps** — eight more than A12's 40, because a step's body makes a taller cell — **24 in 4 Cards**, 40 between full-width rows in 3 Rows, 32 inside 10 Panel at Divider None, 56 in 15 Sticky Rail and 64 in 7 Alternating Media. **Two designs carry their own vertical scale, and after this pass they are resolutions of Vertical spacing rather than rows of their own:** 6 Contrast Band's band at 44 · 64 · 88 (A4·9's) and 13 Slim Bar's at 32 · 44 · 56, giving a band of 96 · 120 · 144 (A12·11's arithmetic).

**Head.** Eyebrow 13 px uppercase tracked `.08em` muted, 10 px above the title; title on a 780 measure; sub 17 px muted on 620, 12 px below; **head to steps 48**, and **64 in 9 Big Numbers** (A11·15's exception); note 32 under the block on 620; link 20 under the note. **Title ladder: Small 28 · Medium 34 in twelve designs, Large 40 in 5 Split Head and 9 Big Numbers.** **A13 offers no Display title anywhere**, because 9 Big Numbers spends the display moment on the numerals instead and one section has one display moment. **Flagged**.

**Responsive floor.** Four → three at 1080 → two at 834 → **one at ≤ 767 in every design in A13**. This is the category's clean break from A11 and A12: a step is a title and a paragraph, and two paragraphs across a 350 px phone is not readable, so **there is no two-across value anywhere.** Six designs depart and each says so: 2 Track holds its line at 834 and turns at ≤ 767 · 4 Cards goes to two at 834 rather than three · 5 Split Head breaks at 1080 rather than 834 · 11 Walkthrough turns its tab column into a scrolling row · 13 Slim Bar stacks its pills one per line · **15 Sticky Rail hides its sticky list and draws its steps at the full width, still itself.**

**Order.** The repeater's order is the drawn order and the rendered numbering, and **nothing re-sorts, ever.** No alphabetical control, no sort-by-duration — **even now that `duration` exists** — and no reverse: a process backwards is a different process, and the author can drag. **Reorder is meaningful and consequential in all fifteen designs**, which is A13's one genuinely universal item rule. **At Source From posts there is no drag and the order is the Data group's Oldest first**, which is the one place A13 states an order it did not get from the repeater.

**The accent is spent once or twice per section and never on the sequence.** The section link's underline, 11 Walkthrough's active tab bar, 8 Rail's arrow glyph, 15 Sticky Rail's current-step bar. **No numeral, marker, connector or plate is ever accent** — colouring a sequence turns six steps into six calls to action. With no section link authored, **twelve of the fifteen contain no accent pixel**, and 6 Contrast Band contains none at any setting because the accent fails on the band.

**Dark mode.** The ground deepens, the marker and the numeral plate lift to `surface`, the icon box lifts to a derived `#2A251E`, the hairline takes `#332E27`, images are untouched. **The numeral stays `text-muted` at both modes** and is re-checked at 5.6:1 light and 6.0:1 dark, even though it is decorative — a decorative element a sighted reader relies on still has to be readable. **10 Panel is the one design that gains from dark mode rather than merely surviving it**: a lifted panel on a deep ground reads more clearly than a white one on cream.

**Print.** Every design prints as drawn except three: **8 Rail prints as a wrapped grid at three across**, **11 Walkthrough prints every panel stacked** with its title above it, and **15 Sticky Rail prints its list once at the top and unsticks**. 6 Contrast Band drops its band's ground in print and in forced colours and **prints as itself** — the same grid, the same steps, the same controls, on the paper's white.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; **the steps an `<ol>` of `<li>` in all fifteen**, carrying `role="list"` because `list-style: none` removes list semantics in Safari — the one ARIA attribute most of these designs have. Title and body as `<p>`s, the label a `<span>` inside the title's block, the numeral a `<span aria-hidden>`, an image an `<img>` carrying `imageAlt` or `alt=""`. **A13 has four visitor-facing strings and every one is a theme translation-catalog string**, never a literal: 8 Rail's group name “How it works, scrollable” and its two arrow labels “Scroll left” and “Scroll right”, and 15 Sticky Rail's `<nav aria-label="Steps">`. **All four name a container or a control rather than saying anything about the site's process**, which is why they are catalogued rather than authored.

**The shared field list — sixteen fields after this pass.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `body` rich opt ≤ 900, ≤ 3 paragraphs · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 24 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 60. In `steps[]`, **two to eight**: `title` text **req** ≤ 80 · `body` text opt ≤ 240, and ≤ 400 in 3 Rows and 15 Sticky Rail alone · `label` text opt ≤ 16 · **`duration` text opt ≤ 12 — new in the controls pass, drawn in 14 Index and 3 Rows and kept invisible in the other thirteen** · `icon` icon opt, a P0·2 slot · `image` image opt, with Image focus · `imageAlt` text opt ≤ 60. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. **`body`, `image` and `imageAlt` on the section are read by two designs and one design respectively** — `body` by 5 Split Head and 15 Sticky Rail, `image` and `imageAlt` by 5 Split Head. **`title` inside a step is the only field that cannot be empty.** **There is no `number` and no `status`** — the theme renders position, and a state on a marketing page has no honest rendering — and **a per-step `url` is refused for authored steps and drawn in bound mode only**, where a step *is* a post and the link is that post. The old reason holds for anything a site types: a step that is also a link is a call to action, and a section with six of them has none. **Flagged**: every limit, the eight-step ceiling, and `label` and `imageAlt` existing at all, both of which are additions to the brief's `{title, body, icon?/image?}`.

**The item list — where it lives, and the rules that hold in all fifteen.** The repeater sits below the design's own controls: one row per step showing **the rendered numeral at 20 px in muted** as the row's leading mark — not a thumbnail, because eight designs have no picture — with `title` as the row's label, `label` in muted beside it where authored, a drag handle, a remove action, and **Add step** at the end. Selecting a step on the canvas selects its row; ⌥↑ / ⌥↓ moves the focused row **and re-numbers everything between the old and new position.** **At Source From posts it is P0·3's read-only card instead** — one row per post, a lock in place of the handle, no Add step, no Remove: **a Ghost-sourced list never shows an Add button.**

**A13 has one repeater and it is `steps[]`**, whose item is `{title, body, label, icon, image, imageAlt}`.

**Add produces a publishable step, and it needs no content decision at all.** `title` is the only required field and it is text rather than a file, so a new item arrives with `title` seeded **“New step”** and every other field empty. It draws immediately as a numeral and a title with no body — one of the two hard cases already on every frame — and **it takes the next numeral by existing**, the one add in the library that requires nothing of the author. It lands **last**. **Add step is disabled at eight** with “Eight steps is the most a section holds.” *Flagged: the seeded string and the eight-step message are mine.*

**Remove never greys out, and a floor explains itself rather than handing the section to another design.** **Every step after the removed one re-numbers**, which is A13's one destructive-looking edit that is not destructive: nothing was authored, so nothing is lost. **Remove is visible and clickable at every count in all fifteen designs and is never dimmed and never hidden.** **At two steps clicking it says “a process needs at least two steps” and the row stays**, so the one-step state is not reachable from the button. **Below a design's designed range nothing hands off:** the design draws the steps it has, hides what cannot apply at that count, and **the panel advises** — “at seven steps, 14 Index reads better” — advice a site can ignore. **At zero** — a list a site emptied, or a bound tag with no posts — the section does not render and the repeater shows Add step with a line saying so. *Flagged: the two-step message is mine.*

**Reorder is meaningful and consequential in all fifteen**, and A13 is the only category where that sentence has no exceptions. It changes the numbering, the reading order and the meaning. **It does more than that in six designs:** 4 Cards, where moving the longest title moves a row's height with it · 7 Alternating Media, where a move re-alternates every step after it · 9 Big Numbers, where the figures are the loudest thing on the page · 10 Panel at Steps Two columns, where it moves the column break · 11 Walkthrough, where the first item is the step the section opens on · 15 Sticky Rail, where it changes which step a given list row lands on.

**Counts.** The field's range is **two to eight**. **One is not a count in A13** — the section does not render — which is the one place the category refuses to draw authored content, and it is refused rather than hidden: the step stays in the list, stays editable, and appears the moment a second one is added. **Eight is the ceiling and four designs absorb it:** 3 Rows, 8 Rail, 14 Index and 15 Sticky Rail — a stack, a track, a ledger and a scrolled body, none of which has a row to break. Every design states its designed range, and outside it there is one answer: **the design draws what exists, hides what cannot apply, and the panel advises.** A placed design is the design that renders. **Nothing is padded, held back, re-numbered or hidden to make a count come out even** — a grid at five steps draws 3 + 2, left-aligned, at the cell's width, and **a centred orphan in a numbered list reads as a step out of sequence.** *Flagged: the two-to-eight range, the one-step refusal, and which four designs absorb eight.*

**Zero steps** is answered once and the same way everywhere: **the section does not render** — no head on its own, no band, no empty cell, no placeholder step. **There is no exception in A13**, unlike A12, where 4 Story and Team rendered with an empty list; here every design's content *is* the list.

**Inside an item the user edits content only:** `title`, `body`, `label`, `duration`, and `icon` or `image` where the design reads one. **Nothing about a step's size, crop, emphasis, ground or numeral is exposed anywhere in A13.** So “make step 1 bigger”, “highlight the step we are on” and “start this one open” are not expressible by construction. **Four per-item controls are refused in writing:** a per-step accent, a per-step crop (7 Alternating Media and 12 Media Top), a “current step” flag (every design), and a per-step media family. **The current-step flag is the one a site will ask for**, and the answer is that a marketing section describes a process rather than tracking a reader through it — **`scroll-spy` in 15 Sticky Rail is the only thing in A13 that marks a current step, and it is derived from the scroll position rather than authored.**

**The optional fields inside an item, and what empty looks like.** **`title` is required — a step with no title cannot be saved.** **`body` empty draws a numeral and a title alone** — nothing reserved, nothing generated, no “Coming soon” — and the cell simply stays shorter, except in 4 Cards where the card keeps its row's height and the space falls at its foot, and in 14 Index where the fourth column is left empty with no dash. **`label` empty closes the gap above the title**, or leaves that column or that end of the row empty where the label has a column of its own. **`duration` empty leaves its column or its end of the row empty** — no dash, no zero, nothing reserved — and where it is not drawn at all it is simply held. **`image` empty draws the numeral plate**; **`icon` empty draws the numeral in the icon's box**. **`imageAlt` empty gives `alt=""`**, never a generated string.

**Content.** Orbit Weekly throughout, eight steps in one order in every frame: Send the pitch · Two editors read it · Agree the shape… · Report and file · Edit and check · It goes out · Corrections · Get paid. **Three steps carry the category's awkward cases in every frame:** step 3's title is 80 characters and wraps to three lines in a 306 cell, step 4 has no picture of any kind and draws the numeral plate, and step 6 has no body and draws as a numeral and a title alone. **Steps 7 and 8 are drawn by 14 Index and 8 Rail only.** Head: eyebrow **How it works**, title **“How a pitch becomes a Thursday letter”**, sub, `body`, note **“Commissioning rates and the current calendar are on the contributors page.”**, link **“Read the pitch guide”**. **Flagged: every name, string, date, fee and interval is invented for this library**, and no frame in A13 contains a real photograph — images are striped placeholders with a mono caption naming the crop.

---

## 1 · Three Up

Three to six steps in equal cells, three or four across, each a numeral above a title above a paragraph. The design a site gets when it types “how it works”, and **the design five other panels name as advice**.

**Descriptor.** The category's floor — a numeral above a title above a paragraph in equal cells, with no container, no picture, no label and no behaviour: the arrangement five other panels advise rather than inventing one of their own.

**Structural descriptor.** `grid-of-N · none · page · many · none · numeral above title`

**Archetype.** grid-of-N.

**Behaviour module.** **none.** The cells, the numeral ladder, the gutter rule and the section link's underline are stylesheet, and the steps are server-rendered. **JS off:** identical in every particular — there is no JS-conditional CSS to fall out of, which is what `core` being assumed rather than declared means in this category.

**Items** · `steps[]`, two to six; **every other design's item rules are stated against this one.**

- **Add.** *Add step* at the foot of the repeater; lands last; seeded “New step” and nothing else. Count is a per-row count, so a new step extends the short last row or starts a new one, **and nothing is ever held back** — this design draws every authored step.
- **Remove.** Never disabled; everything after it re-numbers. Down to two → two cells at the count's width; **at two Remove stays visible and clickable and says a process needs at least two steps**, and the row stays.
- **Reorder.** Meaningful and consequential: it re-numbers, and the numerals are what hold two rows together as one sequence.
- **Counts.** **Two to six, all drawn**, at three or four per row. **Seven or eight are drawn too** — the rows wrap and the short last row sits at the left, never centred — **and the panel advises that at seven steps 14 Index reads better**, before the count is reached.
- **Zero.** The section does not render; the repeater shows Add step and a line saying so.
- **Inside an item.** `title` required, `body`; `label`, `icon`, `image`, `imageAlt` stored and never drawn. **Count, Numerals and Rule are section values, so a step cannot be singled out** — the rule's clearest case in A13, because there is nothing else in this design for a control to attach to.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; two to six steps reading `title` ≤ 80 and `body` ≤ 240. `label`, `icon`, `image`, `imageAlt`, section `body` and the section image pair kept, not drawn.

**Controls** · Head: Centred · Flush left · None. Title size: Small 28 · Medium 34, unavailable at head None. Count per row: Three 416 · Four 306. Numerals: Above the title · None. Rule: None · Between columns. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Count per row · Numerals · Rule.**

**Editing** · **this is the category's statement and the other fourteen state only what they add to it.** `eyebrow`, `title`, `sub`, `note` and the link label edit inline on canvas with the **P0·1** toolbar — bold · italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow · noreferrer · sponsored**. `linkUrl` opens the Ghost-aware **Link Picker**, and the section link takes an optional **P0·2** icon before or after its label, off by default. **Per step, `title` and `body` edit inline in the cell**, the body as prose with the toolbar's four marks and nothing else. **The numeral is never editable.** **At Source From posts the title and body are Ghost-owned** and clicking says “Edit in Ghost”. `label` and `duration` are held by this design and edit in the item row.

**Not offered** · Count Five — a 240 cell is five words a line; a cell alignment; a numeral position; an accent or `border`-coloured numeral, disclosed as a refusal at 1.3:1 rather than offered as a value.

**Arrangement** · cells 416 or 306 on a 24 px gutter across 1,296; rows 48 apart; numeral 28 to title 8, title to body 8; numeral Georgia tabular in `text-muted`; title 20/600; body 15/1.6 muted. **Every step sits at the top of its cell and is never stretched.** Rule Between columns is a hairline in the gutter at the full height of the row's tallest cell, never before the first column and never after the last.

**Responsive** · both counts become two across at 834 and one at ≤ 767 — grid-of-N's ladder with one departure, **which is that it ends at one rather than two**, the A13-wide floor. At 834: padding 80 / 40, cells 377 on 26, numeral 26, title 19, row gap 40. At ≤ 767: padding 64 / 20, one column, numeral 24, title 18, step gap 32, and **Rule Between turns horizontal into the step gap.**

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 6**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  **0 → does not render. 1 → does not render, and the panel says why. 2 to 6 → drawn as written. 7 or 8 → drawn, the rows wrapped**, bound or authored, with the panel's advice. The bound state and the read-only repeater are drawn on this design's frame, as the category's example.

**Empty** · head parts, note and link absent; at head None there is no `<h2>` and no accessible name. **No body → a numeral and a title alone in a shorter cell.** A step with no title cannot be saved. No steps → the section does not render.

**a11y** · `<ol role="list">` of `<li>`, title and body two `<p>`s, **never an `<h3>`**; **the numeral `aria-hidden`**; one tab stop, the section link. Numeral 5.6:1 / 6.0:1, rule 1.3:1 as a non-text divider.

**Flagged** · the two-to-six range; the 48 px row gap and 8 px numeral gap; two figures below ten; refusing Count Five and a cell alignment; the last row at the left; the rule turning horizontal at one across; disclosing the `border`-coloured numeral as a refusal rather than a value.

---

## 2 · Track

Three to five steps in one line, each behind a 32 px marker, with a single hairline running through the markers. **The design §8.3 was written for.**

**Descriptor.** The only design in which a single hairline joins the steps rather than dividing them — three to five markers in one line with the connector running through them — and the only one whose defining element rotates rather than collapsing when the steps stack.

**Structural descriptor.** `bar · none · page · few · none · connector through markers`

**Archetype.** bar.

**Behaviour module.** **none.** The marker, the hairline, the turn at ≤ 767 and the two disabled values are CSS and media queries. **JS off:** identical at every width, connector included.

**Items** · `steps[]`, three to five, one marker each.

- **Add.** Lands last and extends the track; **a sixth add wraps the markers to a second row** and the panel reads “6 steps — the track wraps; 1 Three Up reads better at this count” before the edit.
- **Remove.** Never disabled; the track re-spaces and everything after re-numbers. **At two, two markers with one connector between them**, and Remove then says a process needs at least two steps.
- **Reorder.** Meaningful. **A marker's figure moves with its text because they are one `<li>`** — the design's most important build note.
- **Counts.** **Three to five, and the design is designed for exactly those.** **Six or more are drawn: the markers wrap to a second row and the connector runs within each row rather than across the wrap** — the line it cannot cross is hidden rather than faked — **and the panel advises 1 Three Up** at that count.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body`; `label`, `icon`, `image`, `imageAlt` stored. Marker, Connector, Body and Track are section values: a step cannot have its own marker, be pinned to an end, or hide its own body.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; three to five steps reading `title` ≤ 80 and `body` ≤ 240. Everything else kept, not drawn.

**Controls** · Head: Centred · Flush left · None. Marker: Numeral · Dot. Connector: Through the markers · Under the row · None. Body: Shown · Hidden. Track: Content width · Full bleed. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Marker · Connector · Body.**

**Editing** · the category's, stated at 1 Three Up, plus: at Body Hidden the step body is still edited in its item row rather than being unreachable, and **the marker, the dot and the connector are not fields** — a marker's figure is never typed. **Top divider composes with the connector and is not it**: the divider is the boundary above the section, the connector runs through the markers inside it.

**Not offered** · a Title size; an arrowhead; a thickness; a progress fill; a current-step marker; a per-step anything.

**Arrangement** · marker 32 px at the pack radius, `surface` fill, 1 px `border`, one figure at 15/600 in `text`; **markers at the left of their columns, never centred over them**; marker row to text row 20; columns 416 / 306 / 240 at three, four and five on a 24 px gutter; title 20/600, body 15/1.6. **Marker Dot is a 10 px dot in `border`** and keeps the connector. **Connector Under the row draws no marker at all** and puts one hairline at the content width 24 px under the text row; **Connector None keeps the markers and the columns and draws no line at all**, which the panel says.

**Responsive** · **the track holds at 834 and turns at ≤ 767.** That is a departure from the bar archetype's ladder, which breaks a bar at 834; four steps fit 754 with 179 px columns, so the break is taken one width later. At 834: marker 28, gutter 20, title 18. **At ≤ 767 the markers stack down a 28 px column at the left and the connector runs vertically behind them**, text 16 px to the right, step gap 28. **Track Full bleed and Connector Under the row are both disabled there**, with the reason shown.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 5**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  0 and 1 → does not render. **2 → two markers and one connector.** 3 to 5 → the track. **6 or more → the track wrapped to a second row**, bound or authored, with the panel's advice.

**Empty** · no body → a marker and a title. At head None no `<h2>` and no accessible name.

**a11y** · **one `<ol>`, each `<li>` holding its own marker** — never two parallel rows of markup, which is the thing a two-row implementation gets wrong; marker and connector `aria-hidden`; **the connector a `border` on a decorative `<span>` and never an `<hr>`**, which between list items would announce a thematic break three times; one tab stop. Marker figure 15.8:1 / 15.1:1 on its own fill; **connector and dot 1.3:1 as non-text marks, disclosed rather than raised** — at Marker Dot in dark the track reads as one line with five stops, which is the intent.

**Flagged** · the three-to-five range; the box marker at the radius token rather than a circle; the marker at the column's left; the 20 px marker gap; the dot's ratio disclosed rather than raised; holding the track at 834; the two controls disabled at ≤ 767; refusing arrowheads, autoplay and a current-step marker.

---

## 3 · Rows

Full-width rows: the numeral alone in a fixed gutter at the left, the title and the longest body in the category at the right. **`body` ≤ 400 here and in 15 Sticky Rail only.**

**Descriptor.** The only design that gives a step a full-width row with its numeral alone in a fixed gutter — the category's longest body on an 824 measure with the remaining 376 carrying the label at its far end — and one of four that take eight steps without changing shape.

**Structural descriptor.** `stack · none · page · many · none · numeral in a fixed gutter`

**Archetype.** stack.

**Behaviour module.** **none.** The gutter, the rule, the forced label at 834 and the gutter closing at ≤ 767 are media queries; the rule is a `border-top`. **JS off:** identical at every width.

**Items** · `steps[]`, two to eight, one full-width row each.

- **Add.** Lands last at the foot of the stack; the section grows by one row plus its 40 px gap, and **the panel states the section's height rather than capping the count** below eight. Disabled at eight.
- **Remove.** Never disabled; the rows close up, the rule redraws in the new gaps, and everything after re-numbers. **At two Remove stays visible and clickable and says a process needs at least two steps.**
- **Reorder.** **The most consequential edit in this design**, because the numerals are a visible column and the figure column is what a reader scans.
- **Counts.** **Two to eight, all drawn. This design absorbs the category ceiling.** At eight the panel suggests Numeral column Wide 160 rather than forcing it.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body` ≤ 400 — **the only place in A13 that ceiling exists outside 15 Sticky Rail** — and `label` ≤ 16; `icon`, `image`, `imageAlt` stored. Numeral column, Body measure, Label and Rule are section values.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; two to eight steps reading `title` ≤ 80, `body` ≤ 400, `label` ≤ 16 and **`duration` ≤ 12 at Duration At the right** — one of two designs that draw it.

**Controls** · Head: Centred · Flush left · None. Numeral column: Narrow 96 · Wide 160. Body measure: Wide 824 · Narrow 620. Label: Above the title · At the right of the row · None. **Duration: At the right of the row · None** — new in this pass, **disabled while Label holds that end**, with the reason shown. Rule: None · Between. **Six — the category's high-water mark, and the only design that gained a row.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Numeral column · Body measure · Label.**

**Editing** · the category's, stated at 1 Three Up, plus: **`label` and `duration` edit inline in the row's end slot**, whichever holds it — **one slot, two fields, never both** — and `body` takes 400 characters and **stops accepting characters rather than clamping**, the editor saying why.

**Not offered** · a Title size; a numeral size; a picture; a per-row anything.

**Arrangement** · 96 or 160 gutter, 824 or 620 measure inside 1,296, **the remainder left empty rather than absorbed**; **numeral Large 40 baseline-aligned with the title's first line**, not centred on the row; title 20/600, body 15/1.6, label 13 uppercase tracked `.08em` muted; rows 40 apart with the rule centred in the gap at the full 1,296, never above the first row and never below the last. **The label at the right of the row is the row's only right-aligned element**, and six of them read as a schedule down the edge.

**Responsive** · the row holds at 834 with a 72 px gutter and a 610 measure, numeral 34, title 19. **Label At the right of the row is forced Above the title at 834 and below**, because 754 minus 72 and 610 leaves 72 px, which is narrower than “Thursday”. **At ≤ 767 the gutter closes to zero and the numeral goes above the label** — the step card's DOM order drawn straight down; numeral 28, title 18, row gap 48.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 8**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  0 and 1 → does not render. 2 to 8 → drawn. Over eight the repeater stops. **In bound mode the end slot is empty at both values**, `label` and `duration` having no Ghost source.

**Empty** · no body → a shorter row. No label → that end of the line is empty and nothing shifts. At head None no `<h2>` and no accessible name. **An over-length body is not truncated and there is no ellipsis and no “more” link** — the field stops accepting characters and the editor says why.

**a11y** · `<ol role="list">`; label, title and body as a `<span>` and two `<p>`s in that DOM order at both label values, **placed by layout and never by `order`**; **the label is not a `<time>` and not a definition list** — “Week 2” is a stage rather than a date; the numeral `aria-hidden` at 40 px; the rule a `border-top` and never an `<hr>`; one tab stop.

**Flagged** · the 96 and 160 gutters; Large 40 here; the baseline alignment; leaving 376 or 580 px empty; the 400-character ceiling and refusing to clamp it; the label at the row's right end; forcing it above at 834; the gutter closing at ≤ 767; suggesting Wide at seven steps rather than forcing it.

---

## 4 · Cards

One step per card on a plane with a hairline: a 44 px icon inline with the title, the numeral at the card's top right, the body under both. **The only design in A13 where a step gets an edge of its own.**

**Descriptor.** The only design where a step gets a plane of its own — a fill, a hairline and the pack radius around each card, equalised to its row's height — and the only one where an icon sits on the title's own line rather than above it.

**Structural descriptor.** `grid-of-N · none · page · few · inline · icon inline with title`

**Archetype.** grid-of-N.

**Behaviour module.** **none**, and this is the design most likely to be assumed to have one. **The equal heights are a CSS grid row track, not a measurement**, which is exactly what makes the equalisation per row and not per section; the card's fill, hairline and radius are stylesheet and there is no link on the card to handle. **JS off:** identical.

**Items** · `steps[]`, two to six, one card each.

- **Add.** Lands last and **is drawn at its row's height straight away**, so the empty space at its foot is visible in the editor rather than in a stress frame.
- **Remove.** Never disabled, and it has a second effect here: **a card leaving a row re-equalises that row, so removing one step can shorten its neighbours.**
- **Reorder.** Meaningful twice over — order, and **height**: cards equalise per row, so moving the longest title into another row moves that height with it.
- **Counts.** **Two to six** at Three or Four per row; Count Five is not offered and the measure is the reason. **Seven or eight are drawn** — the cards wrap into a third row, equalised per row as always — **and the panel advises 14 Index**, which draws eight steps with no planes and no icons.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body` ≤ 240, `icon`; `label`, `image`, `imageAlt` stored. **Card padding, Cards fill and Count are section values**: a card cannot be given its own padding, fill or height, and there is no per-card hover, lift or link.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; two to six steps reading `title`, `body` ≤ 240 and **`icon` — one of three designs that read it**.

**Controls** · Head: Centred · Flush left · None. **Card padding: Compact 24 · Comfortable 32 · Spacious 40 — kept under its own name**, being the inside of the plane rather than the section's spacing. Count per row: Three 416 · Four 306. Icons: Shown · None. Cards: Surface · Ground. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Count per row · Card padding · Icons.**

**Editing** · the category's, stated at 1 Three Up, plus: **`icon` is a P0·2 icon slot** — the Icon Picker on click, **size Small 20 · Medium 24** and **colour role Muted · Text** in its popover, and **an empty slot renders the numeral plate** rather than a placeholder on the published page. **The contained 1:1 upload alternative is dropped**; **accent stays refused** on a sequence mark. The 44 px box, its hover-surface fill and its radius are the design's and are not in the popover.

**Not offered** · a Title size; Count Five; a shadow; a hover lift or scale; a link on the card; an image.

**Arrangement** · cards at 416 or 306, 1 px `border`, pack radius, no shadow; **rows 24 apart**, because two hairlines 48 apart read as a gap in a table; **icon box 44 px at the pack radius on the hover surface, 14 px to the title**; numeral Small 20 at the card's top right, baseline-set to the title's first line; body 14 under the title row. **Equal heights per row, the space falling at a short card's foot** — the departure from A13-0's top-aligned rule, taken because a short card with a visible edge reads as a mistake. **At Icons None the box goes and the numeral moves from the top right to the head of the card**, the one place in A13 a control moves a numeral, and it is a consequence of removing the element it was paired with.

**Responsive** · **both counts become two across at 834 rather than three** — the stated departure, and the measure is the reason: three cards at 234 with 28 px of padding leaves 178. Card padding 20 · 28 · 32, icon 40, title 19, row gap 24. **At ≤ 767 one card across, and the equal-height rule stops applying** because each row holds one card — the only width where a short card is short in this design.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 6**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  0 and 1 → does not render. 2 → two cards at the count's width. 3 to 6 → drawn. **7 or 8 → drawn, wrapped into a third row**, with the panel's advice. **In bound mode every box carries the numeral plate and the top-right figure is dropped for that card**, exactly as at an authored empty icon.

**Empty** · **no icon → the numeral plate in the 44 px box at 20/600, and the top-right numeral is dropped for that card** so no card draws the same figure twice. **No body → the card keeps its row's height and the space falls at its foot.** At Icons None the numeral moves to the head of the card.

**a11y** · the card is the `<li>` itself — **no role, no label, no `tabindex`, never `<article>` and never `<figure>`**; **the icon `aria-hidden` whether it is a glyph or an upload, and there is no `iconAlt` field in A13**; reading order icon, title, numeral, body in the DOM and announced as title then body; contrast measured against the card's fill; one tab stop. **Cards Ground in dark leaves a 1.3:1 hairline as the card's only edge — disclosed at the value rather than raised**, because a card is a grouping and not a control.

**Flagged** · stretching a short card to its row's height; the 24 px row gap; the 44 px icon box and its hover-surface fill; the icon inline rather than above; the numeral at the top right and its move at Icons None; dropping the top-right figure when the box carries the plate; two across at 834; the 1.3:1 hairline at Cards Ground in dark.

---

## 5 · Split Head

Head, prose and foot in a 416 column, the steps in the 824 beside it. A8·6's split, and **one of two designs in A13 that read the section's own `body`.**

**Descriptor.** The only design that sets the head, the section's prose and the foot in a 416 column beside the steps rather than above them, and the only one besides 9 Big Numbers that offers Title Large 40.

**Structural descriptor.** `split · none · page · many · none · head column beside steps`

**Archetype.** split.

**Behaviour module.** **none.** Both column sides, the 1080 stack and the foot's forced move are media queries on a flex row with real DOM order and no `order` property. **A sticky head is refused** — that is `scroll-spy`, and A13 ships it as 15 Sticky Rail rather than as a control here, which is the clearest case in the category of a control refused because a design already exists. **JS off:** identical at every width.

**Items** · `steps[]`, two to six, inside the 824 block.

- **Add.** Lands last inside the block and lengthens only the right column. **At Count Two a new step adds a row of one**, 400 px of empty beside a single cell.
- **Remove.** Never disabled; **the head column is unaffected**, so a short list leaves the prose taller than the sequence it introduces. **At two Remove stays visible and says a process needs at least two steps.**
- **Reorder.** Meaningful; the first step sits level with the top of the title because both columns are top-aligned.
- **Counts.** **Two to six** at One or Two per row; five at Two is 2 + 2 + 1 and the panel names the counts that divide rather than disabling the value. **Seven or eight are drawn** — the right column simply lengthens — **and the panel advises 3 Rows**, which has the full width for them.
- **Zero.** The section does not render — the head column alone is not a section.
- **Inside an item.** `title`, `body` ≤ 240; `label`, `icon`, `image`, `imageAlt` stored. **`body` the section field is not a per-step body** — the distinction this design exists on.

**Fields** · every section field except `image` and `imageAlt`, **including `body` ≤ 900 and ≤ 3 paragraphs**; two to six steps reading `title` and `body`. **`title` is required in practice** — with no title there is no `<h2>` and no accessible name, and the head column draws its prose and its foot alone, which the panel says.

**Controls** · Head column: Left · Right. Title size: Medium 34 · Large 40. Count per row: One 756 · Two 400. Numerals: Shown · None. Foot: In the head column · Under the steps. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Head column · Count per row · Foot.**

**Editing** · the category's, stated at 1 Three Up, plus: **the section's `body` — ≤ 900 and ≤ 3 paragraphs — edits inline as prose** with the toolbar's four marks and nothing else, **paragraph breaks being content rather than a control**; and **the section `image` carries Image focus (Centre · Top · Bottom)** in the Image Picker popover, with `imageAlt` ≤ 60 beside it.

**Not offered** · head alignment; Head None; a sticky head; a rule between the columns; a Display title.

**Arrangement** · **416 · 56 · 824 = 1,296**, both columns top-aligned; head column rhythm 24 — eyebrow to title 10, then 24 three times; **prose 16/1.7 in `text` rather than muted**, because it is reading matter and not a caption; steps 32 apart, numeral Medium 28 in a 44 px gutter level with the title's first line, text on 756. **At Count Two the numeral moves beside the title**, because a 400 cell cannot spare a 44 px gutter and a 28 px figure. **Foot Under the steps draws a hairline above the note at the 824's width**, the one rule in this design and the only Foot value that has one.

**Responsive** · **the split breaks at 1080 rather than 834** — the departure, taken because the head's 40 px title cannot hold in a 416 column beside a 608 one, and a title that has to shrink is the signal to stack. Stacked, the order is head, prose, steps, note, link, **with the foot forced Under the steps at both values**. At 834: 754 measure, title 30, numeral 26; Count Two becomes One. **At ≤ 767 the numeral gutter closes and the numeral goes above the title.**

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 6**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty. **The section's own `body` is never bound** — it is prose about the process, not a post. 0 and 1 → does not render. 2 to 6 → drawn, and at two the head column is taller than the list, which is stated rather than corrected. **7 or 8 → drawn, the right column longer**, with the panel's advice.

**Empty** · no `body` → the column is a head and a foot. **No title → no `<h2>` and no accessible name; the column and the steps draw as they are.** No step body → a numeral and a title.

**a11y** · two `<div>`s, **neither a landmark** — a section inside a page is not a document; **exactly one heading, the `<h2>`**; the prose `<p>`s and never a `<blockquote>` or an `<aside>`; both column sides and both foot placements done in the source with no `order`; one tab stop.

**Flagged** · the 416 / 56 / 824 division and the 24 px head rhythm; the prose at `text` rather than muted; breaking at 1080; the numeral moving beside the title at Count Two; the foot's rule existing only at Under the steps; refusing a sticky head because 15 Sticky Rail exists.

---

## 6 · Contrast Band

1 Three Up inverted onto the `contrast` token, at the band's own vertical scale. **No extra upload of any kind is needed for the band — the finding this design exists to state.**

**Descriptor.** The only design on the `contrast` token — 1 Three Up's exact grid at the band's own vertical scale, separated from it by ground alone — and the only one in A13 where the accent is disabled with its ratio shown.

**Structural descriptor.** `grid-of-N · none · contrast · many · none · inverted ground`

**Archetype.** grid-of-N.

**Behaviour module.** **none.** The band is a `background-color` on the section and the derived muted and hairline are CSS mixes of one token pair. **JS off:** identical, and print and forced colours drop the band's ground with or without script either way.

**Items** · `steps[]`, two to six, on the band. **Identical to 1 Three Up's in every particular, which is the point of the pair.**

- **Add · Remove · Reorder · Counts · Zero.** As 1 Three Up, without exception: lands last, never disabled, authored order, two to six drawn, Remove explaining itself at two, **seven or eight drawn with the rows wrapped on the band and the panel advising 14 Index.**
- **The one difference the band makes to the list.** At Band Inset the cells are 372 or 274 rather than 416 or 306, so **the same list draws smaller inside the 1,168** — a section value, not an item one.
- **Inside an item.** 1 Three Up's fields exactly. **A step cannot opt out of the band and no step carries a plate**, because the item is type.

**Fields** · 1 Three Up's exactly.

**Controls** · Band width: Full bleed · Inset · Head: Centred · Flush left · None · Count per row: Three · Four · Numerals: Above the title · None · Rule: None · Between columns. **Five.** **The old Band padding row is retired into Vertical spacing** — 40 · 56 · 72 at 834, 32 · 44 · 56 at 390 — rather than sitting beside it: the band is the section, so the band's padding *is* the section's vertical spacing. Universal, outside the list: **Background role** · **Vertical spacing**, resolving the band's own ladder, 44 · 64 · 88 · **Top divider**, **Background role locked at Contrast and Top divider locked at None**, both with the reason shown. **Quick Controls: Band width · Count per row · Rule.**

**Editing** · the category's, stated at 1 Three Up, plus: **the toolbar draws on the band's own ground** and its selection tint is the carried colour at 25% rather than the accent, which fails here at 2.3:1.

**Derived values** · from one token pair: muted = the carried colour at 72% (`#BEBCB7` light, `#57544D` dark); hairline 18%, drawn only at Rule Between columns, because the pack's `border` token would be invisible on the band. **The accent is unavailable at 2.3:1 light and 2.1:1 dark**; links and rings take the carried colour. Cells 416 · 306 at Full bleed, **372 · 274 at Inset** inside the 1,168.

**Responsive** · 1 Three Up's rule plus the band's own padding step; **at Inset the band's side margin steps 64 → 40 → 20 with the page margin**, so the band never touches the viewport edge at Inset and always does at Full bleed.

**Data** · as 1 Three Up, including **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 6**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  At seven or eight the bound section draws its rows wrapped on the band, and the panel advises 14 Index.

**Empty** · as 1 Three Up. **Forced colours and print drop the band's ground and the section prints as itself** — 1 Three Up's grid was always the drawing underneath, and that does not make this another design.

**a11y** · the band a `background-color` on the section, so the DOM and the announcement are 1 Three Up's exactly. On the band: title and step title 14.9:1 / 14.2:1, body, sub, note and numeral 6.6:1 / 6.4:1. **§7.4 applied: the accent is disabled with its ratio shown.**

**Flagged** · the 72% muted and the 18% hairline; the Inset cell widths; Band padding replacing Padding; **the statement that a band in A13 needs no uploads at all**, which is the category's cheapest ground swap and the reason this pair costs less here than in A11 or A12.

---

## 7 · Alternating Media

Two to four steps as full-width halves, the picture changing side at every step. **The design where the numeral plate is drawn at its largest.**

**Descriptor.** The only design where the picture changes side at every step — full-width halves, vertically centred against each other, with alternation as a rule and the side of the first step as the only control over it — and the one where the numeral plate is drawn at its largest.

**Structural descriptor.** `stack · none · page · few · left · media side alternates`. **The media slot records the default's first step**, not the pattern; at First step's media Right it reads `right` and stays unique.

**Archetype.** stack.

**Behaviour module.** **none.** Alternation is `:nth-child(even)` with `flex-direction: row-reverse` — a visual reversal that leaves DOM order alone — and the plate is a template condition resolved on the server. **JS off:** identical at every width.

**Items** · `steps[]`, two to four, one full-width pair each.

- **Add.** Lands last **and inherits the alternation, so adding a step flips nothing that already exists.**
- **Remove.** Never disabled; it re-numbers **and re-alternates every step after it** — the one edit in A13 that moves elements the user did not touch, and it is disclosed in the repeater.
- **Reorder.** Meaningful, and it re-alternates the same way.
- **Counts.** **Two to four**, and the ceiling is low for a stated reason: four steps at Even and 3:2 are 1,940 px of section before the head; five are 2,425. **Five or more are drawn and the section simply gets taller** — 2,425 px at five, the number the panel now states — **and the panel advises 3 Rows**, which keeps the bodies and drops the pictures.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body` ≤ 240, `image`, `imageAlt`; `label` and `icon` stored. **Never the side, the crop or the division** — a per-step side is refused in writing, and a site that wants two pictures on the same side wants 12 Media Top.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; two to four steps reading `title`, `body`, `image` and `imageAlt` ≤ 60.

**Controls** · Head: Centred · Flush left · None. Division: Even 632/632 · Text-led 504/760 · Media-led 760/504, all on a 32 px gutter. Crop: Landscape 3:2 · Square 1:1. First step's media: Left · Right. Numerals: Shown · None. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Division · Crop · First step's media.**

**Editing** · the category's, stated at 1 Three Up, plus: **step `image` carries Image focus (Centre · Top · Bottom)** in the Image Picker popover — **the field does its most visible work here**, at 632 × 421 and 632 × 632 — with `imageAlt` ≤ 60 beside it. **A focal point is a field, not a control**: the crop stays a section value and there is still no per-step crop and no per-step side.

**Not offered** · a Title size; Portrait — a 632 × 790 portrait beside three lines of type is a column of nothing; a focal point; a caption; a per-step side; a per-step crop; a scrim; a frame.

**Arrangement** · the two halves **vertically centred against each other** — right here and wrong almost everywhere else, because with a 421 px picture beside three lines of type, top-aligning the text would leave 300 px of nothing under it; steps 64 apart; numeral Medium 28, **title 24/600**, body 15/1.6 on the half's measure; picture at the named crop, `object-fit: cover`, centred, pack radius.

**Responsive** · at 834 the halves hold **but Text-led and Media-led both resolve to Even**, because a 754 px row split 293 / 442 puts a picture below its own caption size; picture 365 at 3:2, title 19, step gap 48. **At ≤ 767 the picture goes above the text at every value, the alternation stops having any effect, and First step's media is disabled with that reason shown.**

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 4**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  0 and 1 → does not render. 2 to 4 → drawn. **5 or more → drawn, taller**, with the panel's advice. In bound mode a post with no feature image draws the numeral plate at the full crop.

**Empty** · **no `image` → the numeral plate at the full crop**, 632 × 421 or 632 × 632, figure at 0.4 × the shorter edge — 168 px at Even and Landscape, **the largest type anywhere in A13**, and 304 at Media-led and Square. No `imageAlt` → `alt=""`, never generated. No body → a numeral and a title beside the picture, still centred.

**a11y** · `<ol role="list">`; **the picture an `<img>` carrying `imageAlt` — one of four designs in A13 where a step's picture takes real alt text**, because it is often the only description of what happens; never a `<figure>`; `row-reverse` changes no DOM order; the plate and every numeral `aria-hidden`; one tab stop.

**Flagged** · the two-to-four range and the 1,940 px reason; vertical centring; the 64 px step gap; title 24 here; refusing Portrait and a per-step side; the plate at 0.4 × the shorter edge and its 168 and 304 px extremes; resolving two divisions to Even at 834; disabling the side control at ≤ 767.

---

## 8 · Rail

One line of step cards wider than the window, scrolled by the reader. A11·9's rail and A12·13's, carried over, **with one change: this rail snaps.**

**Descriptor.** The only design the reader moves — a full-bleed snap track of equal step cards wider than the window — and the only one whose arrows and fades appear only when the track is wider than the window — a measurement the module makes in the browser, never a switch between designs.

**Structural descriptor.** `carousel · none · page · variable · top · reader-scrolled step track`

**Archetype.** carousel.

**Behaviour module.** `carousel`. **Edit-safe** — it does not run while editing and the scroll position is never persisted or restored, which is why every frame is drawn at rest. **JS off:** “The slide track is a native horizontally-scrollable `scroll-snap` strip — **fully usable**, only dots and arrow buttons are hidden.” **A13·8 draws that branch as its own drawing:** the snap is on, there are no dots to hide, and JavaScript adds only the two arrows and the two fades. **A12's finding 3 is settled here in the registry's favour** — its cards are equal, the steps are ordered, and a step is exactly the unit a reader wants to land on. **There is no precondition any more** — *no design ever turns into another design* — so nothing decides between two designs at render: with JS off the section is a rail whose track happens not to overflow, arrows and fades absent because the module that draws them is not running. Reduced motion keeps the scroll and the snap and drops the smooth animation.

**Items** · `steps[]`, two to eight, one card each on the track.

- **Add.** Lands last at the right end of the track — **outside the window, and the rail does not scroll to show it**; the repeater's row confirms the addition. Adding is also the edit that brings the arrows back: **a fourth step at Standard makes the track wider than the window.**
- **Remove.** Never disabled. **Removing until the cards fit hides the arrows and the fades and leaves the track on the page margin with nothing to scroll** — still this design, at every width; **the panel advises 12 Media Top** for a section whose steps always fit.
- **Reorder.** Meaningful; the track is authored order, it re-numbers, and the snap points move with the cards.
- **Counts.** **Two to eight**, and the count class is `variable` because **the design has no designed count**: a track absorbs any number, and what the window decides is whether the arrows are drawn, not which design is. **This design absorbs the eight-step ceiling.** Everything fits → **the arrows, the fades and the group's scroll affordance are hidden and the section draws its own track, unscrolled**; the panel advises 12 Media Top.
- **Zero.** The section does not render, track, arrows and the generated “How it works, scrollable” included.
- **Inside an item.** `title`, `body` ≤ 240, `image`, `imageAlt`; `label` and `icon` stored. **Card width, Crop and Arrows are section values**: a card cannot have its own width or crop, and it cannot be pinned to an end.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; two to eight steps reading `title`, `body`, `image`, `imageAlt`.

**Controls** · Head: Centred · Flush left · None, **Centred unavailable at Arrows Above the rail** — the pair needs the head's right end. Card width: Narrow 306 · Standard 380. Crop: Landscape 3:2 · Square 1:1 · None. Numerals: Shown · None. Arrows: In the margins · Above the rail. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Card width · Crop · Arrows.**

**Editing** · the category's, stated at 1 Three Up, plus: **step `image` carries Image focus** in the Image Picker popover; **the two arrows are A1·14 icon buttons and their glyphs come from the Icon Picker** at 20 px, colour role Text; and **“How it works, scrollable”, “Scroll left” and “Scroll right” are theme translation-catalog strings**, not authored fields — nothing visitor-facing here is fixed English.

**Not offered** · a gap; autoplay; dots; a counter; a loop; a per-step crop; a card border; a “drag to explore” hint.

**Arrangement** · a full-bleed track starting and ending on the page margin, cards on a 24 px gutter, picture to numeral 14, numeral to title 6, title to body 6; **a 380 card at 3:2 is a 253 px picture, and three and a bit fill 1,296, which is why a fourth step makes this a rail.** Plate at 380 × 253, figure 101. Arrows A1·14's icon button at 38 px on the pack radius; **the arrow glyph is the one accent pixel in this design**, because an arrow is a control.

**Behaviour** · reader-driven scroll with `scroll-snap-type: x mandatory`, **one snap point per card at its left edge**; a click moves one card plus one gutter — **404 px at Standard, 330 at Narrow**; fades 96 / 72 / 48 in `background`, each drawn only where there is content past that end; position never restored; nothing auto-advances; the behaviour does not run while editing.

**Responsive** · cards and fade step with width; at 834 cards 320 / 264, gutter 20, fade 72, ends on the 40 px margin. **At ≤ 767 the arrows are dropped and the rail is scrolled by touch, and the snap is kept** — cards 280 / 240, gutter 16, fade 48 — **so the phone drawing and the no-JS drawing are the same drawing.**

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 8**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  0 and 1 → does not render. **Everything fits the content width → the arrows and the fades are hidden and the section still draws its own track.** 2 to 8 with an overflowing track → the rail with its arrows. Over eight the repeater stops. **The measurement is the module's, in bound mode as in authored** — it hides two controls; it never changes the design.

**Empty** · no picture → the plate at the card's crop. No body → a shorter card that stays shorter. **At Crop None no picture is drawn at all and authored ones are held**, the plate is not drawn either, and the panel names the count.

**a11y** · the track a `role="group"` with the generated label **“How it works, scrollable”** and `tabindex="0"`, the `<ol>` inside it; arrows `<button>`s named “Scroll left” and “Scroll right”, outside the group and in drawn order at both placements; **a disabled arrow keeps `aria-disabled`, stays focusable and stays 38 px, its glyph 2.1:1 and disclosed** — A11·9's rule carried.

**Print** · a wrapped grid at three across, every step and every picture.

**Flagged** · **accepting snap where A11·9 and A12·13 refused it**; hiding the arrows and fades rather than handing the section to 12 Media Top; the 306 and 380 card widths; the 14 px picture gap; one card plus one gutter per click; Crop None holding authored pictures; Head Centred unavailable at Arrows Above the rail; printing as a wrapped grid.

---

## 9 · Big Numbers

Two to four steps with the numerals at display size. **The only place in A13 the ladder goes past 40**, and the reason the category offers no Display title.

**Descriptor.** The only design that spends the section's display moment on the numerals — 72 or 104 px figures above two to four steps — and the only one with a numeral-position control, because at that size the figure is a composition element rather than a marker.

**Structural descriptor.** `stack · none · page · few · none · numerals at display size`

**Archetype.** stack.

**Behaviour module.** **none.** The size steps, the disabled values and the rule turning horizontal are CSS and media queries. **`count-up` is refused** — a numeral is a position, not a statistic, and animating it would be counting up to “3”. **JS off:** identical.

**Items** · `steps[]`, two to four.

- **Add.** Lands last; **a fourth add greys Display 104 with its reason visible** and the panel says so before the edit.
- **Remove.** Never disabled; re-numbers.
- **Reorder.** Meaningful, and **the most visible edit in A13**: at 104 px the figures are the loudest thing on the page.
- **Counts.** **Two to four.** Two draws two 636 cells with the body on a 480 measure; four draws 306 cells at Large 72 only. **Five or more are drawn at Large 72 in 306 cells and wrap to a second row**, and the panel advises 3 Rows.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body`; everything else stored. Numeral size, Numeral position, Alignment and Rule are section values.

**Fields** · `eyebrow`, `title` — **required in practice, and fixed at Large 40 when the head is shown** — `note`, the link pair; two to four steps reading `title` ≤ 80 and `body` ≤ 240. **`sub` is kept and not drawn**, the one section field this design holds.

**Controls** · Head: Shown · None. Numeral size: Large 72 · Display 104, **Display unavailable at four steps**. Numeral position: Above the title · Beside the title, **Beside at Large 72 only**. Alignment: Flush left · Centred, **Centred disables Rule**. Rule: None · Between. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Numeral size · Numeral position · Alignment.**

**Editing** · the category's, stated at 1 Three Up, plus: nothing. **The figure is not a field at any size** — `count-up` is refused with it, a numeral being a position rather than a statistic — and `sub` is held by this design, edited in the sidebar and not drawn.

**Not offered** · a Title size — the section title is fixed at Large 40, because a Display numeral over a Small title is not a composition anyone should build by accident; a sub; an accent numeral; an outline face; a picture; a label.

**Arrangement** · cells 636 / 416 / 306 on a 24 px gutter; **numeral line height 0.86 — the one sub-1 leading in A13**, because at 104 px Georgia's default leaves 26 px of air that reads as a broken gap; numeral to title 16 at Above and 24 Beside, where **the figure's baseline sits on the title's first line** and the body indents to the title's left edge; title 24/600; body 15/1.6; **head to steps 64**, A11·15's exception carried. **Alignment Centred centres the figure, the title and the body together and drops the rule**, because a centred cell with a hairline down each side reads as a table of three columns.

**Responsive** · two across at 834 and one at ≤ 767, **with the numeral stepping twice** — 104 → 80 → 56 and 72 → 60 → 44. **At ≤ 767 Numeral position is forced Beside the title at both values**, because a 56 px figure above a 350 px paragraph is 90 px of vertical spent on one silent element. Rule Between turns horizontal into the step gap. Title 40 → 22 → 20; step title 24 → 14.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 4**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  0 and 1 → does not render. 2 to 4 → drawn. **5 or more → drawn, wrapped at Large 72**, with the panel's advice.

**Empty** · no body → a figure and a title. **At Head None there is no `<h2>` and no accessible name** — the stated cost, and 5 Split Head is the design for a site that needs both a title and this scale.

**a11y** · `<ol role="list">`; **the 104 px numeral is `aria-hidden`**, the hardest case for A13-0's settlement 2 and the one that proves it; the step title a `<p>` and never an `<h3>` even at 24 px; one tab stop. Numeral 5.6:1 / 6.0:1 — **checked at every size, because size does not change a ratio.**

**Flagged** · the 72 and 104 sizes and their absence from the shared ladder; the 0.86 leading; title 24 here and the section title fixed at 40; the 64 px head gap; disabling Display at four steps and Beside at Display; Centred disabling Rule; forcing Beside at ≤ 767; holding `sub`.

---

## 10 · Panel

The whole sequence inside one `surface` panel with a hairline, the steps as hairline rows inside it. **The only design in A13 whose containment is the section's own.**

**Descriptor.** The only design whose containment is the section's own — one `surface` panel holding every step as a hairline row — and the only one where the numerals sit at the right of the row rather than before it.

**Structural descriptor.** `stack · box · surface · many · left · steps inside one panel`. **The only `box` containment and the only `surface` ground in A13.**

**Archetype.** stack.

**Behaviour module.** **none.** The panel, the hairlines, the column-major fill and the full-bleed collapse at ≤ 767 are CSS. **JS off:** identical at every width.

**Items** · `steps[]`, two to six, one hairline row each.

- **Add.** Lands last and the panel grows by one row plus its rule.
- **Remove.** Never disabled; the rows close up and everything after re-numbers.
- **Reorder.** Meaningful, **and at Steps Two columns it moves the column break for everything after it.**
- **Counts.** **Two to six** at Stacked, **four to six** at Two columns, which is disabled below four. Six divides; five at Two columns is 3 + 2 with the left column taller, stated rather than corrected. **Seven or eight are drawn and the panel grows by one hairline row each**, and the panel advises 14 Index, which is this design without the plane and with a tighter row.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body` ≤ 240, `icon`; `label`, `image`, `imageAlt` stored. **Never a row's padding, its divider or its place in the columns.**

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; two to six steps reading `title`, `body` and **`icon` — one of three designs that read it**.

**Controls** · Head: Centred · Flush left · None. **Panel padding: Compact 32 · Comfortable 48 · Spacious 64 — kept under its own name**, being the inside of the panel rather than the section's spacing. Steps: Stacked rows · Two columns. Icons: Shown · None. Divider: Hairlines · None. **Five.** **Background role is not locked here**, the panel being a plane inside the section rather than the section's ground: at Contrast the panel lifts to the carried colour at 10% and its hairline to 18%, and **a Ground panel stays refused**. Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Panel padding · Steps · Icons.**

**Editing** · the category's, stated at 1 Three Up, plus: **`icon` is a P0·2 icon slot** with the size (Small 20 · Medium 24) and colour role (Muted · Text) popover; **an empty slot renders the numeral plate in the 44 px box and the right-hand figure is kept**, unlike 4 Cards. **The contained 1:1 upload alternative is dropped**; accent stays refused.

**Not offered** · a Title size; a panel width; a Ground panel — a panel the colour of the page with only a hairline is a border around the section, which is a different and worse design; a shadow; a picture; a per-row anything.

**Arrangement** · panel at the content width, `surface` fill, 1 px `border`, pack radius, no shadow; rows 24 apart at Hairlines with the line in the centre of the gap, never above the first and never below the last, and 32 apart at None; **icon box 44 px at the row's left with a 20 px gap**; **numeral Large 40 at the row's far right**; title 20/600, body 15/1.6. **Two columns fills down and then across** — 1, 2, 3 in the left column and 4, 5, 6 in the right, never left-to-right, because reading a numbered list in Z order puts 01 beside 04 — with a vertical hairline in the middle gutter. **The numeral at the right and the icon at the left is the reverse of the reading order, and it is deliberate**: in a panel the figures are a column of markers down the right edge; putting them first would make the panel a ledger, and **14 Index is the ledger.**

**Responsive** · Two columns becomes Stacked at 834; panel padding 24 · 40 · 48, rows 20 apart, numeral 32, icon 36. **At ≤ 767 the panel loses its side borders and its radius and runs to the page margin, keeping a `border-top` and a `border-bottom`**, and **the row restacks so the icon and the numeral share one line above the title and body.** Both are stated departures.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 6**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  0 and 1 → does not render. 2 to 6 → drawn. **7 or 8 → drawn, the panel a row longer each time**, with the panel's advice. In bound mode every box carries the plate and every right-hand figure is kept.

**Empty** · **no icon → the numeral plate in the 44 px box, and the right-hand figure is kept** — unlike 4 Cards, because the right-hand column of figures is the design and dropping one would break the column. No body → a shorter row. **At Icons None the rows close up by 64 and the design keeps its plane, its right-hand column of figures and its own name.** The old sentence is now advice: at this setting 14 Index reads much the same without the plane.

**a11y** · **the panel is a presentational `<div>` — no role, no label, never `<article>`, never a region**; the `<ol role="list">` inside it; icon and numeral `aria-hidden`; **reading order is title, body — the numeral at the right is never announced and never read out of order**; contrast measured against the panel's fill; one tab stop.

**Flagged** · the panel's 48 px padding and 24 px rows; the numeral at the right and Large 40 there; the icon at the row's left rather than inline; keeping the right-hand figure at an empty icon; column-major fill; refusing a Ground panel and a panel width; the full-bleed panel and restacked row at ≤ 767.

---

## 11 · Walkthrough

The steps as a list of tabs down the left, one panel at a time on the right. **The only design in A13 that shows one step and hides the rest.**

**Descriptor.** The only design that shows one step and hides the rest — a column of tabs beside a fixed-height panel carrying that step's label, title, body and picture — and the only one in A13 whose heading level changes when JavaScript is off.

**Structural descriptor.** `split · none · page · many · right · one step at a time`

**Archetype.** split.

**Behaviour module.** `tabs`. **Edit-safe** — it does not run while editing, and the selected tab is never persisted, resetting to the first step on reload; there is no URL fragment, no `localStorage` and no deep link to a step. **JS off:** “All panels render stacked and visible, each preceded by its tab label as a heading.” **Nothing is lost** — six titles, six labels, six bodies and six pictures, in authored order, in one column — **and one thing changes that should not.** With JS on the step titles are `<p>`s under one `<h2>`, per A13-0's step-card rule; the registry's branch emits a heading per panel, so the page gains six `<h3>`s that are not in the outline when the module runs. **⚠ Finding 1 for the architect:** either `tabs` gains a branch that stacks without emitting headings, or A13 accepts a category-wide exception here. Reduced motion drops the 160 ms cross-fade.

**Items** · `steps[]`, three to six, one tab and one panel each.

- **Add.** Lands last, **is never auto-selected**, and may raise the panel's fixed height for every step.
- **Remove.** Never disabled; re-numbers, and **removing the selected step selects the one that takes its place.**
- **Reorder.** Meaningful, re-numbers, **and changes which step the section opens on.**
- **Counts.** **Three to six.** **Two are drawn as two tabs and two panels**, with 7 Alternating Media advised because two tabs read as a toggle. **Seven or eight are drawn too**, the tab column running taller than the panel it controls, with 3 Rows advised.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body` ≤ 240, `label`, `image`, `imageAlt`; `icon` stored. **Never which step starts selected**, which is positional and is the first item.

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; three to six steps reading `title`, `body`, `label` ≤ 16, `image` and `imageAlt`. **The only design where a step's `label` and its `image` are drawn together.**

**Controls** · Head: Centred · Flush left · None. Tab column: Narrow 306 · Wide 416. Panel media: Landscape 3:2 · Square 1:1 · None. Tabs: Numbered · Plain. Marker: Accent bar · Fill. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Tab column · Panel media · Marker.**

**Editing** · the category's, stated at 1 Three Up, plus: **the tab titles are the step titles and edit inline in the tab**, the panel updating as they are typed; `label` and `body` edit inline in the panel; **step `image` carries Image focus** in the Image Picker popover. **Selecting a tab in the editor is selection rather than a control** — **P0·6**, the editor state switcher, is what draws every panel at once.

**Not offered** · autoplay through the steps; a progress bar; previous and next buttons; a “step 3 of 6” counter; opening a step from the URL; a Title size.

**Arrangement** · **306 · 40 · 950 = 1,296**; inside the panel 430 · 32 · 488, the two halves vertically centred. A tab is a 14 px-padded row with a 2 px left border in `border` going `accent` when selected, **48 px tall, which clears the touch minimum without padding beyond the 8 px grid**; the selected title goes 600 and `text`, the rest 500 and `text-muted`. Panel title 24/600, label above at the eyebrow's size. **The panel's height is fixed by the tallest step**, so selecting a tab never moves the tab list or the foot — the one measurement this design makes. **The numeral is drawn in the tab and never in the panel**, because a figure in both is the same mark twice on one screen. **The accent is spent twice here** — the selected tab's bar and the section link — the only design in A13 that spends both on one frame, and **at Marker Fill it spends none at all.**

**Responsive** · the split holds at 834 with a 234 tab column and a 480 panel, the panel's halves stacking inside it. **At ≤ 767 the tab column becomes a horizontally scrolling row above the panel** — ends on the page margin, no arrows, no fade — the marker moves to a 2 px bottom border at Accent bar, the picture goes above the text, **and the panel's fixed height is dropped**, so selecting does move the foot on a phone. The stated departure.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 6**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty. **In bound mode the tab stays the tab and the panel's title carries the post link** — one tab stop inside the panel rather than a link on a control. 0 and 1 → does not render. **2 → two tabs and two panels**, with the panel's advice. 3 to 6 → drawn. **7 or 8 → drawn, the tab column taller than the panel**, with the panel's advice.

**Empty** · no picture → the numeral plate at 488 × 325, figure 130. **At Panel media None the panel is text on the full 950 with the body on a 620 measure and the rest left empty.** No label → the panel title moves up 12. No body → a label, a title and a picture.

**a11y** · `role="tablist"` on the `<ol>`, `role="tab"` with `aria-selected` and `aria-controls` on each, `role="tabpanel"` with `aria-labelledby` on the panel; **one tab stop for the whole list**, with ↑ ↓ moving selection, Home and End jumping to the first and last, and Tab leaving for the panel; **each tab named by its own text, so nothing is generated**; **selection is weight and colour and never colour alone**, so it survives forced colours; focus is A6's ring on the tab's box, inside the 2 px marker. **Three tab stops — the tablist, the panel and the section link — the most in A13.**

**Print** · every panel stacked and open, in authored order.

**Flagged** · the 306 / 40 / 950 division and the 430 / 488 panel; the fixed panel height; the numeral in the tab and never in the panel; Marker Fill leaving no accent pixel; the three-step floor and the two-step hand-off; dropping the fixed height at ≤ 767.

---

## 12 · Media Top

1 Three Up with a picture above every step. **The design 8 Rail's panel advises for a section whose steps always fit the content width.**

**Descriptor.** The only design with a picture above every step in a grid of equal cells, and the only one that offers Portrait 4:5 or puts the numeral inside a marker on the picture itself.

**Structural descriptor.** `grid-of-N · none · page · few · top · image above each step`

**Archetype.** grid-of-N.

**Behaviour module.** **none.** The crops are aspect boxes, the marker is absolute positioning inside one, and the plate is a template condition resolved on the server. **JS off:** identical.

**Items** · `steps[]`, two to four, one cell each.

- **Add.** Lands last. **A fifth add wraps a second row of cells** and the panel names 8 Rail as advice before the edit.
- **Remove.** Never disabled; re-numbers.
- **Reorder.** Meaningful; pictures move with their steps.
- **Counts.** **Two to four.** **Five or more are drawn: the cells wrap to a second row** — a grid is a grid at any count — **and the panel advises 8 Rail** for a section that would rather scroll than wrap. **The library's one two-way hand-off is deleted:** 8 Rail hides its arrows when its track fits and stays 8 Rail.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body`, `image`, `imageAlt`; `label` and `icon` stored. **Never the crop, which is a section value, and the answer to a badly cropped picture is a different upload.**

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; two to four steps reading `title`, `body` ≤ 240, `image`, `imageAlt` ≤ 60.

**Controls** · Head: Centred · Flush left · None. Count per row: Three 416 · Four 306. Crop: Landscape 3:2 · Square 1:1 · Portrait 4:5, **Portrait unavailable at Count Four**. Numerals: On the image · Above the title · None. Body: Shown · Hidden. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Count per row · Crop · Numerals.**

**Editing** · the category's, stated at 1 Three Up, plus: **step `image` carries Image focus (Centre · Top · Bottom)** in the Image Picker popover — **and this design's old answer, “the answer to a badly cropped picture is a different upload”, is withdrawn** — while the crop stays a section value with no per-step crop.

**Not offered** · a Title size; a focal point; a per-step crop; a caption; a scrim; a filter; a link on the picture.

**Arrangement** · cells 416 or 306 on a 24 px gutter; picture at the cell's width at the named crop, `object-fit: cover`, pack radius; picture to title 16, title to body 8; rows 48 apart; **marker 32 px — 2 Track's exactly — inset 12 px from the picture's bottom-left corner.** **It carries its own fill, so no scrim is needed and A13 has none anywhere**, which is the one thing this category manages that A12 did not. Cells top-aligned, never stretched — **the pictures are what make the row read as a row**, which is why the crop is a section value.

**Responsive** · two across at 834 and one at ≤ 767, and **the picture keeps its ratio at every width**. Cells 377 on 26 at 834, full width at 390. **The marker steps 32 → 24 → 28, growing again on the phone**, because a 24 px marker on a 350 px picture is a speck and there is room for the target. Title 20 → 14 → 15; step gap 48 → 40 → 32.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 4**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty.  0 and 1 → does not render. 2 to 4 → drawn. **5 or more → drawn on a second row**, with the panel's advice. In bound mode a post with no feature image draws the numeral plate at the cell's crop and the marker is not drawn on top of it.

**Empty** · **no picture → the numeral plate at the cell's crop**, figure 0.4 × the shorter edge — 111 px at 416 × 277 — **and the marker is not drawn on top of it**. At Numerals Above the title a plated step shows its figure twice, 100 px apart and at different sizes, **and both are kept**, unlike 4 Cards. No `imageAlt` → `alt=""`. No body → a shorter cell.

**a11y** · `<ol role="list">`; the picture an `<img>` carrying `imageAlt`, never a `<figure>`, **never a link**; marker, plate and numeral `aria-hidden`; **the marker's figure is measured against its own fill and not against the picture**, at 15.8:1 / 15.1:1; one tab stop.

**Flagged** · the two-to-four range; the 16 px picture gap and 48 px row gap; the marker inset at 12 and its growth at 390; refusing a scrim by giving the marker a fill; offering Portrait here alone and disabling it at Count Four; keeping both figures on a plated step.

---

## 13 · Slim Bar

A 96 to 144 px band: a lead-in sentence, then three to five pills with a chevron between them. **The shortest section in A13 and the only one with no heading of any kind.**

**Descriptor.** The only design with no heading at all — a 96 to 144 px band of numbered pills separated by chevrons, with a sentence at the left and a link at the right — and the only one that draws no body at any setting.

**Structural descriptor.** `bar · none · page · few · inline · chevrons between pills`

**Archetype.** bar.

**Behaviour module.** **none.** The pills wrap with the flex container, the band's borders are CSS, and the disabled Separator at ≤ 767 is a media query. **JS off:** identical — and with no link authored there is nothing focusable in the section at all.

**Items** · `steps[]`, three to five, one pill each.

- **Add.** Lands last and widens the row; past the width **the last pill wraps and the band grows 52 px**, chevron and all — the one place in A13 a band changes height on its own.
- **Remove.** Never disabled; the band narrows and the sentence and link stay pinned to their ends. **At two, two pills and one chevron are drawn**, and the panel advises 1 Three Up, two pills reading as a toggle.
- **Reorder.** Meaningful; re-numbers.
- **Counts.** **Three to five, and the ceiling is measured rather than chosen.** Four pills at Filled with a lead-in and a link fill about 1,240 of the 1,296; five fit only with short titles. **Six or more wrap to a second line of pills and the band grows 52 px with them**, and the panel advises 2 Track, which has room for bodies.
- **Zero.** The section does not render.
- **Inside an item.** `title` and `icon` only. **A step's body cannot be reached in this design at all**, which the panel states rather than works around.

**Fields** · **`title` ≤ 104, drawn as one sentence at 15 px in `text` rather than as a heading**, and the link pair; three to five steps reading `title` ≤ 80 and `icon`. **Kept and never drawn: `eyebrow`, `sub`, `note`, section `body`, the section image pair, and per-step `body`, `label`, `image` and `imageAlt`** — **the most held fields of any design in A13**, and the panel names the count.

**Controls** · Lead: Shown · None. Separator: Chevron · Hairline · None, **disabled at ≤ 767**. Pills: Filled · Bare. Icons: Shown · None. Width: Content · Full bleed. **Five.** **The band's own 32 · 44 · 56 is retired into Vertical spacing** and the band still measures 96 · 120 · 144; **Width remains the only edge control this design has.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving the band's own ladder, 32 · 44 · 56, giving a band of 96 · 120 · 144 · **Top divider**, **Top divider locked at None**, the band drawing both of its own edges. **Quick Controls: Separator · Pills · Icons.**

**Editing** · **the lead-in sentence — `title` ≤ 104, drawn at 15 px and never as a heading — and the link label edit inline with P0·1**; `linkUrl` opens the **Link Picker**; the section link takes an optional **P0·2** icon. **Per step the pill's title edits inline in the pill**, and **a title too long for the row wraps rather than being clamped or truncated** — the stylesheet cannot see how long a title is, so the pill grows and the panel advises about 24 characters. **`icon` is a P0·2 icon slot** with the size (Small 20 · Medium 24) and colour role (Muted · Text) popover, drawn as a glyph with no box; **an empty slot draws the numeral in the glyph's 16 px place**, so that pill shows its figure twice and both are kept. **`eyebrow`, `sub` and `note` are held by this design and are not editable here** — there is nowhere on the band to draw them. The numeral is never editable.

**Not offered** · a head; a Title size; a numeral control — the numerals are the pill's leading mark and are always drawn; a body; a horizontal scroll; **a Rule, because the band's top and bottom borders are always drawn** — a band with no edges on the page ground is not a band.

**Arrangement** · pill 8 × 14 on the hover surface at the pack radius, 40 px tall; **numeral, 20 px glyph and title on one line at a 10 px gap, and a title too long for the row wraps to a second line and grows its pill**; chevron a 15 px glyph in `border` with 12 px each side, **the one non-hairline separator in A13** and a separator rather than a connector, because there is no line for it to sit on; lead-in on a 220 measure; link pushed to the row's end. **With no lead-in and no link the pills centre in the band** — the one automatic alignment change in A13, and a consequence of two empty fields rather than a control. **The pills wrap rather than scrolling**: a horizontal scroll is refused here because 8 Rail is the design a reader moves, and a 120 px band that scrolls sideways hides steps behind an edge nobody sees.

**Responsive** · **at 834 the lead-in leaves the row and goes above the pills**, and the band grows to 132 at Comfortable. **At ≤ 767 it stops being a band**: the pills go one per line at full width and 44 px tall — the only place in A13 a step is a touch-sized object — the chevrons are dropped, and **Separator is disabled with that reason shown**, because a chevron between stacked pills points the wrong way and a vertical hairline between them is a connector this design does not have. The stated departure.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 5**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty. **⚑ In bound mode the pill becomes a link to its post**, which re-opens this design's “the pill is not a control and has no target” for bound mode only: up to five tab stops plus the section link, where an authored band has one or none. Recorded in the Reconciliation notes. 0 and 1 → does not render. **2 → two pills and one chevron**, with the panel's advice. 3 to 5 → drawn. **6 or more → the pills wrapped and the band 52 px taller**, with the panel's advice.

**Empty** · **no icon → the numeral in the glyph's 16 px place, so that pill shows its figure twice and both are kept** — the smallest numeral plate in A13, and kept because the glyph's slot has to hold something or the pills stop lining up. No title → the band is pills and a link. **No link → no interactive content and no tab stop.** A pill title too long for the row wraps to two lines and the pill grows; nothing is clamped, truncated or faded.

**a11y** · **no accessible name at any setting**, A12·11's position; the lead-in a `<p>`; the pills an `<ol role="list">`, **so the order is announced even though nothing says what the list is**; chevron, glyph and numerals `aria-hidden`; the pill is not a control and has no target; one tab stop, or none. **A screen reader hears a list of four items and nothing that says what the list is — the stated cost of a design with no heading**, and 2 Track is the neighbouring design that has one.

**Flagged** · the band of 96 · 120 · 144; the pill's padding and 10 px gaps; the chevron's size and `border` colour; the doubled figure at an empty icon; the always-on band borders; wrapping rather than scrolling; the pills centring with no lead-in and no link; the three-to-five range and both hand-offs.

---

## 14 · Index

Four to eight steps as hairline rows with the numeral, the label, the title and the body in aligned columns. **The design four other panels advise when a site adds a seventh step** — A13's equivalent of A12's 1 Grid.

**Descriptor.** The only design that draws every field of every step in aligned columns down the whole section — numeral, label, title and body in four hard columns on hairline rows — and the design four other panels advise when a site reaches seven steps.

**Structural descriptor.** `table · none · page · many · none · hairline rows, aligned columns`

**Archetype.** table. **The archetype names the shape, not the markup**: rows share a baseline grid so the four columns line up down the section, and a row is four aligned fields, which is the table archetype's geometry. **The a11y note stands unchanged** — it is an `<ol>`, not a `<table>`, there are no column headers, and nothing in the body column relates to anything but its own row.

**Behaviour module.** **none**, and three refusals keep it that way: **a sort, a filter and a search field are all refused**, and two of them are modules — `filter-strip` and `search-expand`. **JS off:** identical.

**Items** · `steps[]`, four to eight, one hairline row each.

- **Add.** Lands last and the section grows by one row. **Disabled at eight** with the category message: “Eight steps is the most a section holds.”
- **Remove.** Never disabled; the rows close up and everything after re-numbers. **Under four the columns still align and the design still draws** — three rows of aligned fields are short, not broken — **and the panel advises 1 Three Up.**
- **Reorder.** Meaningful and **scanned immediately, because the figures are a visible column eight deep.**
- **Counts.** **Four to eight, and the design is built for the top of that range.** Below four the columns still align and the design still draws; the panel advises 1 Three Up.
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body` ≤ 240, `label` ≤ 16; `icon`, `image`, `imageAlt` stored. **An uploaded picture is kept and refused here, and the panel names 12 Media Top.** **Never a row's density, its rule or its column widths.**

**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; four to eight steps reading `title`, `body`, `label` and **`duration` ≤ 12 at Columns + duration** — the design the field was added for.

**Controls** · Head: Centred · Flush left · None. **Columns: Number + title + body · Number + label + title + body · Number + title + body + duration** — the third value new in this pass, at **48 · 340 · 702 · 110** with the duration at the row's right end; **a row carries the label or the duration, never both.** Density: Compact · Comfortable. Rule: Hairlines · None. Body: Shown · Hidden. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: Columns · Density · Body.**

**Editing** · the category's, stated at 1 Three Up, plus: **`title`, `body`, `label` and `duration` edit inline in their columns** — **a column is a place, not a field**, so an empty one stays empty rather than showing a placeholder.

**Not offered** · a Title size; a column alignment — **a centred index is not an index**, and the design says so by not offering the value; a header row; a zebra stripe; a sort; a filter; a picture; **a status column, which is a field A13 does not have and stays refused**; **a row link for an authored index — drawn in bound mode only**, where a step is a post. **The duration column ships in this pass** and is the Columns row's third value.

**Arrangement** · **48 · 110 · 340 · 702 across 1,296 on a 24 px gutter**, or 48 · 416 · 784 without the label, **every column starting at the same x down the whole section**; **numeral Small 20, the smallest on A13's ladder**, because eight at 40 would be a column of figures rather than a row of steps; label 13 uppercase tracked; **title 17/600 rather than 20**; body 15/1.6; **columns baseline-aligned rather than top-aligned**, so a wrapped title and a one-line body start on the same line; rows 16 or 10 px of padding above and below — 66 and 52 px including the hairline — with **a hairline under every row except the last and never above the first.**

**Responsive** · **at 834 the body column drops under the title** and the numeral and label columns stay — 26 · 70 · the rest. **At ≤ 767 there are no columns**: numeral and label share the first line, title second, body third — the step card's DOM order drawn straight down, the same collapse 3 Rows makes. **The label drops to 12 px at 390**, the one type size in A13 below the shared floor, because at 350 px a 13 px tracked uppercase label beside a 15 px figure is two competing marks. Disclosed.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 8**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty. **⚑ In bound mode the row's title links to its post**, which re-opens this design's refusal of a row link for bound mode only — eight tab stops where an authored index has one. `duration` has no Ghost source, so the duration column is empty on every row and the panel advises the label-free value. 0 and 1 → does not render. **Under four → drawn, the columns still aligned**, with the panel's advice. 4 to 8 → drawn. **Add step is disabled at eight** — the category ceiling, and this is the design that reaches it.

**Empty** · no body → **the fourth column is simply empty**, no dash and nothing reserved. No label → its column is empty and nothing shifts; **the columns are the section's, not the row's.** At head None no `<h2>` and no accessible name.

**a11y** · **an `<ol role="list">` and not a `<table>`** — no column headers, no `<th>`, and nothing in one column relates to anything but its own row; label, title and body announced as one item in that order at every setting; the numeral `aria-hidden`; the hairline a `border-bottom` and never an `<hr>`; one tab stop. Title 15.8:1 / 15.1:1, label, body and numeral 5.6:1 / 6.0:1, hairline 1.3:1.

**Flagged** · the four column widths and **the duration column's 48 · 340 · 702 · 110**; **the duration at 13 px muted in tabular figures rather than in the label's uppercase**, a duration being a fact and a label a stage; Small 20 and the 17 px title here; baseline rather than top alignment; the 52 and 66 px rows; the hairline under every row but the last; the four-step floor; the 12 px label at 390; refusing a header row, a sort, a filter and a row link; **naming a duration and a status column as fields A13 does not have and a site will ask for.**

---

## 15 · Sticky Rail

A sticky list of the steps at the left, the steps themselves at full length at the right, and the list marking whichever step the reader is level with. **The only thing in A13 that marks a current step.**

**Descriptor.** The only design with a sticky contents list beside the steps, and the only thing in A13 that marks a current step — derived from the reader's scroll rather than authored, which is why a per-step “current” flag is refused everywhere else.

**Structural descriptor.** `sticky · none · page · many · none · sticky list beside long bodies`

**Archetype.** sticky.

**Behaviour module.** `scroll-spy`. **Edit-safe** — the tracking does not run while editing and the current step is never persisted; the section always opens with the first step marked. **JS off:** “The sticky list renders with the first item marked current; no active-item tracking.” **That is exactly this design's degradation and nothing is lost**: `position: sticky` is CSS and still works, the list items are real `<a href="#step-n">` anchors and still jump, every step and every word is on the page, and the reader loses only the moving indicator. **The cleanest module match in A13**, and unlike 11 Walkthrough it changes no markup and no heading level.

**Items** · `steps[]`, four to eight, one list row and one block each.

- **Add.** Lands last, appears in both columns at once, and lengthens the right column only.
- **Remove.** Never disabled; re-numbers both columns. **Under four the list and the steps both draw** — a three-row list is short rather than broken — **and the panel advises 3 Rows.**
- **Reorder.** Meaningful; re-numbers both, **and changes which step the reader lands on from a given list row.**
- **Counts.** **Four to eight.** Below four a sticky list of three is taller than the thing it indexes, which the panel says as advice rather than as a switch, and both columns still draw. **This design absorbs the eight-step ceiling.**
- **Zero.** The section does not render.
- **Inside an item.** `title`, `body` ≤ 400, `label`; `icon`, `image`, `imageAlt` stored. **Never whether a step appears in the list**, which would be a per-item design control.

**Fields** · every section field except `image` and `imageAlt`, **including `body` ≤ 900 — one of two designs that read it**; four to eight steps reading `title` ≤ 80, **`body` ≤ 400 — one of two designs with that ceiling** — and `label` ≤ 16.

**Controls** · Head: Centred · Flush left · None. List column: Left · Right. List: Numbered · Plain. Body measure: Wide 824 · Narrow 620. Marker: Accent bar · Weight only. **Five.** Universal, outside the list: **Background role** · **Vertical spacing**, resolving 64 · 96 · 132 · **Top divider**. **Quick Controls: List column · Body measure · Marker.**

**Editing** · the category's, stated at 1 Three Up, plus: **the section's `body` — ≤ 900 and ≤ 3 paragraphs — edits inline as prose**; per step `title`, `body` and `label` edit inline in the right column, and **the list row is not a second copy of the title** — it renders the same field and updates as it is typed. **“Steps”, the sticky list's name, is a theme translation-catalog string.**

**Not offered** · a progress bar; a percentage; a “4 of 6” counter; smooth scroll on the anchors; collapsing a step once it is read — that is `accordion`, and **A13 ships no disclosure design at all**; a picture; a Title size.

**Arrangement** · 306 · 40 · 950 = 1,296; **the list sticks 96 px from the top of the viewport and unsticks at the foot of the last step, never travelling past the section**; a list row is 10 px of padding with a 2 px left border in `border`, going `accent` for the current step, whose numeral and title also go `text` and 600; each step is a numeral and a label on one line, a 24/600 title and a body on the measure; **steps 56 apart, the largest step gap in A13**, because the gap is what tells the reader a step has ended when the next one has no rule above it. **The list is a set of anchors rather than buttons**, which is what makes the whole design work without script.

**Behaviour** · **a step becomes current when its title crosses the sticky list's top edge, and stays current until the next one does.** **Exactly one step is current at all times**, including at the top and the bottom of the section — no “none”, no two at once, no proportional highlight. **The marker moves instantly and nothing animates, so reduced motion changes nothing.**

**Responsive** · **at 834 the list becomes a sticky horizontal bar under the head** — hairlines above and below, scrolled by touch, the current step marked with a 2 px bottom border and **scrolled into view as it changes, the one place in A13 a behaviour moves something the reader did not touch.** **At ≤ 767 the sticky list is hidden and the steps draw at the full width**, with `scroll-spy` not declared at that width — **the only design in A13 that hides its defining element rather than turning it, and it stays itself with the list hidden** — because a sticky bar on a phone costs 56 px of a 640 px viewport to say something the scroll already says.

**Data** · **Source: Authored · From posts.** Authored is the default and every frame's state. At From posts it is **P0·5 configured for reading paths** — Filter **By tag**, Order **fixed at Oldest first**, Count **≤ 8**, this design's own ceiling — with `title` ← post title, `body` ← custom excerpt, `image` ← feature image, **each bound step linking to its post**, and Add, Remove and drag hidden: **P0·3's read-only card**. `label`, `duration` and `icon` have no Ghost source and stay empty. **In bound mode the list rows stay anchors to the steps and the step title carries the post link** — the anchors are navigation and are never replaced by outbound links. 0 and 1 → does not render. **Under four → drawn, both columns**, with the panel's advice. 4 to 8 → drawn. Over eight the repeater stops.

**Empty** · no `body` → the head is an eyebrow and a title. No step body → a numeral, a label and a title, and the list row is unchanged. No label → the numeral sits alone on the first line.

**a11y** · the list a `<nav aria-label="Steps">` — **A13's second generated string, and the only one outside 8 Rail** — holding an `<ol>` of anchors with `aria-current="true"` on the current one; the steps a second `<ol role="list">`; **the current step is weight and colour, never colour alone**, so at Marker Weight only it is `text` at 600 against `text-muted` at 500; focus is A6's ring on the anchor's box; **six tab stops plus the section link, the most in A13.**

**Print** · the list prints once at the top and unsticks; the steps print as drawn.

**Flagged** · the 96 px sticky offset; the 56 px step gap; the 10 px list row; making the list anchors rather than buttons; the tracking rule and “exactly one current at all times”; the four-step floor; the sticky bar at 834 and its scroll-into-view; dropping the list at ≤ 767; the second generated string.

---

## Amendments the drawn designs forced on the proof

1. **Settlement 2 is amended by 9 Big Numbers.** The numeral ladder is 20 · 28 · 40 everywhere — **except at Display 72 and 104**, which exist in that design alone and are not on the ladder at all, and **except in a marker, where the figure is `text` rather than `text-muted`** because it sits on a fill of its own.
2. **Settlement 4 splits into two readings on the doubled figure, and each design states which it takes.** 4 Cards drops its top-right numeral when the icon box carries the plate; **10 Panel, 12 Media Top and 13 Slim Bar keep both**, because in each of those the second figure belongs to a column or a row of marks that would break with one missing.
3. **The top-aligned rule gains one exception:** 4 Cards stretches a short card to its row's height, because a card has a visible edge and a short one reads as a mistake. A12·2 made the same departure for the same reason.
4. **A13 has four theme strings, not two, and none of them is “generated”.** 8 Rail's “How it works, scrollable”, its “Scroll left” and “Scroll right”, and 15 Sticky Rail's `<nav aria-label="Steps">`. **All four are theme translation-catalog strings** — the description “generated” was wrong, and the arrows were missing from the count. Each names a container or a control; nothing in the category is named *about* the site by the theme.
5. **The step title's ceiling of 20 is amended in six designs.** 24 in 7 Alternating Media, 9 Big Numbers, 11 Walkthrough and 15 Sticky Rail; 17 in 14 Index; 15 in 13 Slim Bar.
6. **The responsive floor is “one at ≤ 767” with no exceptions**, which is stronger than A11's or A12's floors, and six designs depart from the *ladder above* it rather than from the floor itself.
7. **`icon` is read by three designs, not two.** 4 Cards and 10 Panel draw it in a 44 px box; **13 Slim Bar draws the glyph alone with no box**, inside its pill.
8. **The category's one two-way hand-off is deleted by the design patch pass** — *no design ever turns into another design*. 8 Rail hides its arrows and its fades when the track already fits and stays 8 Rail; 12 Media Top wraps a second row of cells at five steps and stays 12 Media Top. **Each panel now advises the other rather than switching to it**, and with them the whole of A13's hand-off map goes: twenty-five sentences across thirteen designs.
9. **A13 ships no disclosure design.** A per-step `accordion` is the most obvious design the category does not have, and it is refused rather than forgotten: 11 Walkthrough and 15 Sticky Rail are the two designs that show one step's detail at a time, and A9 owns the accordion.
10. **“A13 is the first category with no Ghost source at all” is withdrawn by the controls pass.** The platform fact behind it stands — there is no process object, no ordered custom collection and nothing in the API that maps onto a step — but the conclusion did not follow: **a tag's posts read oldest-first are a sequence**, and that is what **Source: Authored · From posts** binds, on all fifteen panels, through P0·5's reading paths. What A13 has no Ghost source for is a *step*; what it now has one for is *a process a site has already published as posts*.

11. **The shared list gained a sixteenth field after the library was drawn, and it cost thirteen designs a held field.** `duration` ≤ 12 is drawn in 14 Index and 3 Rows and kept invisible everywhere else. It is recorded here as the amendment it is: **adding to a shared list after a category is drawn changes every design's “kept and not drawn” line**, which is the timing rule the architect should hold on to for A16 onward.

---

## The roster at a glance

| # | Design | Media | Reads beyond the floor | Panel advises |
|---|---|---|---|---|
| 1 | Three Up **[Free]** | none | — | 14 Index at 7+ |
| 2 | Track | none | — | 1 Three Up at 6+ and at 2 |
| 3 | Rows **[Free]** | none | `body` ≤ 400, `label` | — · absorbs eight |
| 4 | Cards | icon | `icon` | 14 Index at 7+ |
| 5 | Split Head | none | section `body` | 3 Rows at 7+ |
| 6 | Contrast Band | none | — | 14 Index at 7+ · drops its band's ground in print |
| 7 | Alternating Media | image | `image`, `imageAlt` | 3 Rows at 5+ |
| 8 | Rail | image | `image`, `imageAlt` | 12 Media Top · hides its arrows when the track fits |
| 9 | Big Numbers | none | — | 3 Rows at 5+ |
| 10 | Panel | icon | `icon` | 14 Index at 7+ |
| 11 | Walkthrough | image | `label`, `image`, `imageAlt` | 7 Alternating Media at 2 · 3 Rows at 7+ |
| 12 | Media Top | image | `image`, `imageAlt` | 8 Rail at 5+ |
| 13 | Slim Bar | icon | `icon` | 1 Three Up at 2 · 2 Track at 6+ |
| 14 | Index | none | `label` | 1 Three Up under 4 · advised by four |
| 15 | Sticky Rail | none | section `body`, `body` ≤ 400, `label` | 3 Rows under 4 · hides its list at ≤ 767 |

**Eight designs draw no media at all, three draw an icon, four draw a picture. Four panels advise 14 Index at seven steps and four more advise 3 Rows — advice, never a switch; four absorb the eight-step ceiling. Three have a behaviour and twelve have none.**

---

## Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fifteen checked against each other; **no two are the same.**

| # | Design | Tuple |
|---|---|---|
| 1 | Three Up | `grid-of-N · none · page · many · none · numeral above title` |
| 2 | Track | `bar · none · page · few · none · connector through markers` |
| 3 | Rows | `stack · none · page · many · none · numeral in a fixed gutter` |
| 4 | Cards | `grid-of-N · none · page · few · inline · icon inline with title` |
| 5 | Split Head | `split · none · page · many · none · head column beside steps` |
| 6 | Contrast Band | `grid-of-N · none · contrast · many · none · inverted ground` |
| 7 | Alternating Media | `stack · none · page · few · left · media side alternates` |
| 8 | Rail | `carousel · none · page · variable · top · reader-scrolled step track` |
| 9 | Big Numbers | `stack · none · page · few · none · numerals at display size` |
| 10 | Panel | `stack · box · surface · many · left · steps inside one panel` |
| 11 | Walkthrough | `split · none · page · many · right · one step at a time` |
| 12 | Media Top | `grid-of-N · none · page · few · top · image above each step` |
| 13 | Slim Bar | `bar · none · page · few · inline · chevrons between pills` |
| 14 | Index | `table · none · page · many · none · hairline rows, aligned columns` |
| 15 | Sticky Rail | `sticky · none · page · many · none · sticky list beside long bodies` |

**No two A13 designs share all five closed slots, and that is a first.** A11's tuple could not see the scale of a repeating unit and A12's could not see the unit's contents or its behaviour; **here the archetype slot alone separates nine of the fifteen**, because a sequence can be laid out as a grid, a bar, a stack, a split, a table, a track and a sticky column, and those are genuinely different shapes rather than the same wall at different densities. **The emphasis slot is doing no load-bearing work in A13** — remove it and the check still passes — which is the opposite of A11 and A12 and is worth recording as the category's taxonomic finding.

**Distribution.** Archetype: grid-of-N ×4 (1, 4, 6, 12) · stack ×4 (3, 7, 9, 10) · bar ×2 (2, 13) · split ×2 (5, 11) · carousel, table, sticky ×1 each (8, 14, 15). Containment: none ×14, **box ×1 (10 Panel)**. Ground: page ×13, contrast ×1 (6), surface ×1 (10). Count: many ×8 · few ×6 · variable ×1 (8). Media: none ×8 · top ×2 (8, 12) · inline ×2 (4, 13) · left ×2 (7, 10) · right ×1 (11).

**How the slots are read here, stated once so it is reproducible.**

- **Media placement is read from the step's own picture**, as in A12: `top` above the type, `inline` where a 44 px icon sits on the title's own line or a 20 px glyph sits in a pill, `left` at 7 Alternating Media's first step and at 10 Panel's row, `right` in 11 Walkthrough where the panel's picture sits opposite the tab list, and **`none` in eight designs** — the largest `none` count in the library so far, and the honest reading of a category whose item is a line of type. *Flagged: the reading is mine.*
- **Containment is the section's, never the item's.** **4 Cards is `none · page`** and it is the category's sharpest case, because the design is called Cards: the card is the step's geometry, the section has no container, and the Cards control sets the card's fill rather than the section's ground. **10 Panel is the counter-case and the only `box` in A13**, because there the plane is around every step at once.
- **Count classes are read at the count the design is drawn at** — A12's stated departure, carried. Six steps is `many`, three or four is `few`, and **8 Rail is `variable` because a track absorbs any number.** *Flagged: the departure is mine.*
- **10 Panel's tuple is the one that changes two slots at once**, containment and ground, which is why it reads as a different design from 1 Three Up rather than as a third colour of it. **1 Three Up and 6 Contrast Band are the pair the brief describes** — the same grid, the same steps, the same item rules, separated by ground alone — and A13's version of that pair is the cheapest in the library, because the item is type and the band needs no uploads.

---

## Behaviour modules at a glance

| Design | Module | Edit-safe | JavaScript off |
|---|---|---|---|
| 8 Rail | `carousel` | yes — parked, position never persisted | registry: native scroll-snap strip, arrows and dots hidden. **Here:** exactly that — the snap is drawn, so the section loses only two arrows and two fades; **it stays itself, with its arrows and fades absent** |
| 11 Walkthrough | `tabs` | yes — selection never persisted | registry: all panels stacked and visible, each preceded by its tab label as a heading. **Here:** every word and picture present, **and six `<h3>`s appear that the JS-on drawing does not have** — ⚠ finding 1 |
| 15 Sticky Rail | `scroll-spy` | yes — current step never persisted | registry: the sticky list renders with the first item marked current; no tracking. **Here:** exactly that — sticky is CSS, the anchors are real, nothing is lost |
| The other twelve | **none** | — | identical, pixel for pixel |

**`core` is assumed in all fifteen** and declared in none, per the note at the head of this document. **`reveal` and `count-up` are refused in all fifteen.** **No A13 design loses an authored step, title, body, label, icon or picture with JavaScript switched off**, and the three that change change only in arrangement — one of them, 11 Walkthrough, in a way the architect should settle.

---

## Component inventory

Every reusable component this category established or reused. Cumulative — reused ones are listed with the category they first came from.

**Established in A13**

| Component | What it is | First from |
|---|---|---|
| **Step card** | media, numeral, label, title, body — five parts, one DOM order, all fifteen designs. Title body-font 20/600, body 15/1.6 muted, label 13 uppercase tracked `.08em` muted | A13·0 |
| **Step numeral** | the item's position rendered by the theme, never authored. Pack heading font, tabular figures, tracked `-0.02em`, `text-muted`, `aria-hidden`. Ladder Small 20 · Medium 28 · Large 40, plus Display 72 / 104 in A13·9 alone | A13·0 |
| **Step marker** | a 32 px box at the pack radius, `surface` fill, 1 px `border` hairline, one figure at 15/600 in `text` — the one numeral in `text` rather than muted. A box and never a circle | A13·2 |
| **Marker dot** | a 10 px dot in `border` in the marker's place, no figure, 1.3:1 as a non-text mark | A13·2 |
| **Connector** | one hairline in `border` running through the markers from the first's centre to the last's; turns vertical at ≤ 767 rather than dropping | A13·2 |
| **Numeral plate** | the answer to a missing picture: `surface` fill, 1 px `border`, pack radius, the step's numeral in the heading font at 0.4 × the box's shorter edge in `text-muted`, `aria-hidden`. At 44 px in an icon box, at the full crop in an image design | A13·0 |
| **Icon box** | 44 px at the pack radius on the pack's hover surface, holding **a P0·2 icon-slot glyph at Small 20 or Medium 24, colour role Muted or Text**. Derived `#2A251E` in dark. **The contained 1:1 upload alternative is dropped** — outside the closed vocabulary, and unable to recolour for dark | A13·4 |
| **Chevron separator** | a 15 px `border`-coloured glyph with 12 px each side, between pills — the one non-hairline separator in the category | A13·13 |
| **Step pill** | 8 × 14 on the hover surface at the pack radius, 40 px tall, numeral + glyph + title on one line at a 10 px gap, title never wrapping | A13·13 |
| **Sticky step list** | a `<nav aria-label="Steps">` of anchors, 10 px rows with a 2 px left border going `accent` for the current step, sticking 96 px from the top and unsticking at the section's foot | A13·15 |

**Reused verbatim**

| Component | What it is | First from |
|---|---|---|
| Primary button | accent fill, 14 px/600, padding 9×17, radius token | A1·1 |
| Icon button | 38 px box, 8 px radius, bare / outlined / filled — A13·8's rail arrows | A1·14 |
| Section head | eyebrow 13 uppercase tracked, title on 780, sub 17 muted on 620, note on 620, link 20 under | A1 · A4 |
| Section link | 14/600 `text` with a 2 px accent underline at a 3 px offset, 160 ms | A12·0 |
| A6 focus ring | 2 px accent at a 3 px offset on the element's own box | A6 |
| Cell divisions | Two 636 · Three 416 · Four 306 · Five 240 on a 24 px gutter across 1,296 | A10 |
| Contrast band | `contrast` ground, muted = the carried colour at 72%, hairline at 18%, band padding 44 · 64 · 88 | A4·9 · A12·7 |
| Card | `surface` or ground fill, 1 px `border`, pack radius, no shadow, equal heights per row | A12·2 |
| Split head | 416 · 56 · 824, both columns top-aligned, stacks in source order | A8·6 · A12·5 |
| Rail | full-bleed track on the page margin, 96 / 72 / 48 fades, arrows in the margins or above, `role="group"` with a generated label | A11·9 · A12·13 |
| Slim band | padding 32 · 44 · 56 giving a band of 96 · 120 · 144, no heading, no accessible name | A12·11 |
| Striped image placeholder | `repeating-linear-gradient(45deg,#EDE4D8 0 10px,#E5DACB 10px 20px)` light, `(45deg,#3A342B 0 10px,#332E26 10px 20px)` dark, with a mono caption naming the crop | A4 |
| Editor repeater row | leading mark, item label, muted secondary, drag handle, remove, Add at the foot; ⌥↑ / ⌥↓ moves the focused row. **At a Ghost source it is P0·3's read-only card: no Add, no handle, no Remove** | A11·0 · A12·0 · P0·3 |
| Duration column | `duration` ≤ 12 at the row's right end, 13 px `text-muted` in tabular figures, not uppercase and not tracked — a fact rather than a stage. 110 px in 14 Index, 96 in 3 Rows' end slot | A13·14 |

---

## Shared field list

The union of every content field A13's fifteen designs need. **This is the contract that makes design-switching safe.**

**Section — nine fields**

| Field | Type | Optional | Limit | Read by |
|---|---|---|---|---|
| `eyebrow` | text | yes | ≤ 26 | thirteen designs |
| `title` | text | yes | ≤ 104 | fourteen; required in practice in 5, 9; drawn as a 15 px sentence in 13 |
| `sub` | text | yes | ≤ 178 | eleven designs |
| `body` | rich | yes | ≤ 900, ≤ 3 paragraphs | **5 Split Head and 15 Sticky Rail only** |
| `note` | text | yes | ≤ 120 | thirteen designs |
| `linkLabel` | text | yes | ≤ 24 | a pair with `linkUrl`; one without the other is not drawn |
| `linkUrl` | url | yes | — | fourteen designs |
| `image` | image | yes | — | **5 Split Head only** — the section's own picture |
| `imageAlt` | text | yes | ≤ 60 | 5 Split Head only; never generated |

**`steps[]` — two to eight items, six fields**

| Field | Type | Optional | Limit | Read by |
|---|---|---|---|---|
| `title` | text | **no** | ≤ 80 | all fifteen — **the only field that cannot be empty** |
| `body` | text | yes | ≤ 240, and ≤ 400 in 3 Rows and 15 Sticky Rail | fourteen |
| `label` | text | yes | ≤ 16 | six draw it, nine keep it |
| `duration` | text | yes | ≤ 12 | **14 Index and 3 Rows draw it, thirteen keep it** — added in the controls pass |
| `icon` | icon | yes | — | 4 Cards, 10 Panel, 13 Slim Bar · **a P0·2 slot: size Small 20 · Medium 24, colour role Muted · Text** |
| `image` | image | yes | — | 7, 8, 11, 12; empty draws the numeral plate · **Image focus Centre · Top · Bottom in the Image Picker popover** |
| `imageAlt` | text | yes | ≤ 60 | 7, 8, 11, 12; empty gives `alt=""` |

**Not in the list, and refused in writing:** `number` — the theme renders position · `status` — there is no honest rendering of a state on a marketing page, and a process that tracks its own progress is an application · **a per-step `url` for authored steps** — a step that is also a link is a call to action, and a section with six of them has none; **it is drawn in bound mode only**, where a step is a post · `iconAlt` — the title beside the icon says what the step is.

**⚑ Three item fields are additions to the brief's `{title, body, icon?/image?}` and all three are flagged.** `duration` is the third, added in the controls pass because 14 Index is the design a site asks to extend and a schedule is what it asks for. `label` exists because a process almost always carries a *when* — “Day 1”, “Week 2”, “Thursday” — and without it that string gets typed into the title, where it competes with the numeral. `imageAlt` exists because a step's picture is often the only description of what happens, and A12 established that an item's picture takes real alt text only where nothing else describes it.

---

## Reconciliation notes

**Frames changed in this pass.** **All sixteen frames**, and **no primary section frame among them.**

- **All fifteen control-panel frames** — `A13-1 Three Up`, `A13-2 Track`, `A13-3 Rows`, `A13-4 Cards`, `A13-5 Split Head`, `A13-6 Contrast Band`, `A13-7 Alternating Media`, `A13-8 Rail`, `A13-9 Big Numbers`, `A13-10 Panel`, `A13-11 Walkthrough`, `A13-12 Media Top`, `A13-13 Slim Bar`, `A13-14 Index`, `A13-15 Sticky Rail`: every Padding row removed, the **universal trio** drawn outside each list with its two locks, and four new blocks added below the list — **STEPS** (the P0·3 item list), **EDITING** (the P0 primitives, field by field), **BEHAVIOUR** (the registry line and its no-JS branch) and **DATA** (Source, Filter, Order, Count and the mapping). Footer counts restated with the Quick Controls named.
- **Two panels gained a value rather than a block:** `A13-3 Rows` a **Duration** row — At the right of the row · None, disabled while the label holds that end — and `A13-14 Index` a third **Columns** value, **Number + title + body + duration**.
- **All fifteen spec cards** carry a *Reconciled · 24 Aug 2026* strip at their head, and their Controls lines are restated; `A13-6`'s Band padding sentence and `A13-13`'s band ladder are rewritten as resolutions of Vertical spacing, and `A13-14`'s duration refusal is withdrawn in the same words the panel uses.
- **Four new states strips**, one per mechanism, so what is new is drawn where it can be read against what was already there: **`A13-1`** the bound state — three steps from a tag, oldest first — beside **P0·3's read-only repeater** · **`A13-3`** the end slot at Label and at Duration, side by side · **`A13-4`** the icon slot at Small 20 and Medium 24, at colour role Muted and Text, with the empty slot and both refusals, and the filled-slot popover beside it · **`A13-14`** the duration column with an empty row in it.
- **`A13-0 Category Proof`** carries the eleven-point reconciliation card and a note on what was not redrawn; its shared field table gains `steps[].duration`; its `icon` and `image` rows name the P0·2 slot and Image focus; and four of its floor statements are rewritten — the sort refusal, the field-list refusals, the three flagged additions, and **the Data paragraph, whose “no Ghost source at all” claim is withdrawn**.
- **No primary section frame was redrawn, and the reason is stated on `A13-0`:** every control this pass adds ships at the value the frames were already drawn at — Source Authored, Top divider None, Background role each design's existing ground, Vertical spacing Comfortable, Image focus Centre, icon Small 20 at Muted, Duration None, Columns + label.

**Control counts after the pass.** **Five on fourteen designs, six on 3 Rows** — the one design that gained a row — plus the universal trio and the Data group everywhere, against the PRD's ceiling of about fifteen. **Quick Controls are three per design** and no design's Quick set grew.

**Where this pass overruled something this document had already ruled.** One line each, and in every case the earlier reason is answered rather than ignored.

1. **Every per-design Padding row is retired into Vertical spacing**, the same three values under the universal name. **Two band ladders survive as resolutions of that control rather than as second rows** — 6 Contrast Band's 44 · 64 · 88 and 13 Slim Bar's 32 · 44 · 56 — which is a reading of ground rule 3, not a breach of it: in both designs the band *is* the section, and each ladder was already written as *replacing* Padding rather than sitting beside it. **A12·7 and A12·11 were reconciled the same way**, and consistency across the two bands matters more than a distinct name for the same job. **The ladders that keep their own names are the ones inside a plane:** 4 Cards' Card padding and 10 Panel's Panel padding.
2. **Background role is universal, which gives 1 Three Up a Contrast value that used to be 6 Contrast Band's whole reason to exist.** Both stay: the row ships everywhere with an advice line naming 6, and **6 Contrast Band's Background role is locked at Contrast with the reason shown**. The finding the pair was drawn to state is unchanged and is still the cheapest in the library — **a band in A13 needs no upload of any kind**, the item being type.
3. **Top divider is locked at None on both bands, and this is the item that asked how the universal composes with a band that owns both edges.** It does not compose: a band's ground draws its own top and bottom, so a universal divider above it would draw one edge twice, 1 px apart. **6 Contrast Band and 13 Slim Bar are locked with that reason shown; 13's Width row remains its only edge control.** Everywhere else the divider is the boundary above the section and is never the design's own rule — 1 Three Up's Rule Between columns, 2 Track's connector, 10 Panel's panel edge and 14 Index's row hairlines are all inside the section and untouched.
4. **“A13 is the first category with no Ghost source at all” is withdrawn.** The platform fact stands — no process object, no ordered custom collection — but the conclusion did not follow: **a tag's posts read oldest-first are a sequence.** **Source: Authored · From posts** ships on all fifteen panels through P0·5's reading paths, Filter By tag only, Order fixed at Oldest first, Count at each design's own ceiling. Amendment 10 is rewritten to match, and the Data line on all fifteen designs with it.
5. **The per-step-URL refusal is re-opened for bound mode only, and it takes two other refusals with it.** In bound mode a step *is* a post and links to it. That overrules, for that mode alone, **13 Slim Bar's “the pill is not a control and has no target”** — up to five tab stops where an authored band has one or none — and **14 Index's refusal of a row link** — eight tab stops where an authored index has one. Both are drawn on their panels as bound-mode-only, and **authored steps still take no per-step link**: the original reason, that a section with six calls to action has none, is untouched by a mode where the six links are the site's own posts.
6. **“Nothing re-sorts, ever” survives, narrowed by one sentence.** The Data group's **Order: Oldest first** is not a sort control — it is fixed, it is the only value, and it exists because a bound list has no drag handle. **No section-level sort, no reverse and no sort-by-duration**, now that `duration` exists, in any of the fifteen.
7. **`duration` is added to the shared list after the library was drawn.** 14 Index refused “a duration column and a status column, which are fields A13 does not have”; the field now exists, so **the first half of that refusal is withdrawn and the second half is kept**: `status` stays refused, there being no honest rendering of a state on a marketing page. **Finding 4 is rewritten** from “two fields a site will ask for” to the timing rule the addition proved: **it changed thirteen designs' “kept and not drawn” line in one edit.**
8. **The icon's “contained 1:1 upload” alternative is dropped from the component inventory.** It was outside the closed icon vocabulary and could not be recoloured for dark, so it failed the same test that refuses an accent glyph. **`icon` is a P0·2 slot** with size Small 20 · Medium 24 and colour role Muted · Text; a file in the field is kept and refused. **Accent stays refused on every sequence mark** — the numeral, the marker, the connector, the plate and the glyph — so colour role has two values and there is no third.
9. **Image focus is adopted as a field on every image field, and the refusals keep their aim.** The two families refused a focal-point *control*; **Image focus (Centre · Top · Bottom) ships in the Image Picker popover** on step `image` in 7, 8, 11 and 12 and on 5 Split Head's section picture, on A14's ruling that where a picture is cropped is content. **The crop is still the section's, there is still no per-step crop, and no *control* moves a crop.** Withdrawn: 12 Media Top's “the answer to a badly cropped picture is a different upload”.
10. **A12's finding 5 recurs unchanged: the Image focus vocabulary is short a horizontal axis.** 12 Media Top's Portrait 4:5 crops a landscape file left and right, and Centre · Top · Bottom has nothing to say about it. **ARCHITECT: a control-vocabulary question rather than a registry one.** The field is adopted as given and the case stays unanswered.
11. **Ground rule 9 lands nowhere and is recorded rather than added.** **Member Visibility is absent from all fifteen**: A13 bears no call to action — its one destination is a text link at the section-link treatment, and a step is never a target. *Flagged: if the architect wants the control universal rather than CTA-scoped, all fifteen gain it at once.*
12. **Ground rule 7 removes nothing.** **No A13 panel ever carried a “Preview” control.** The three behaviours are edit-safe and every frame is a resting state; **P0·6** is what draws 11 Walkthrough's panels open at once, and it is the editor's chrome rather than a sidebar row.
13. **Ground rule 6 needed no registry addition and none was invented.** `carousel`, `tabs` and `scroll-spy` remain A13's only modules, `core` is still assumed, and `reveal` and `count-up` are still refused in all fifteen. **The `tabs` ruling stays flagged on `A13-11`** — its no-JS branch emits a heading per panel, which this category forbids — **and the same ruling covers A15's Playlist and Tabs**. **8 Rail's precondition is still a measurement no module makes.**
14. **No fixed English visitor-facing string ships, and the count was wrong.** “A13 generates exactly two strings” described the two *names* — 8 Rail's “How it works, scrollable” and 15 Sticky Rail's “Steps” — and omitted the rail's **“Scroll left”** and **“Scroll right”**. **All four are theme translation-catalog strings**: each names a container or a control, so there is nothing for an author to write, and everything a reader *reads* is an authored field with a default.
15. **One visible element in A13 has no editing path, and that is the design rather than an omission.** **The numeral is never editable** — it is a rendering of position — and neither are the marker, the connector, the plate or the chevron. Ground rule 4 asks that every visible text be inline-editable; **the numeral is not text a site wrote**, and making it editable would re-introduce the `number` field the category refuses.


---

## Patch notes — process patch, 30 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are named, never numbered: the letter-and-number codes elsewhere in this project are filing labels and mean nothing outside it.

**Frames changed — sixteen, and every one of them.** `A13-0 Category Proof` gains a **DESIGN PATCH PASS** section: the numbering line, the free-designs line with its five-design shortlist and its recommendation, the deleted hand-off map with what each design draws instead, the floor where Remove now explains itself, the greyed-with-a-reason list, the member ask on the section link, the no-JavaScript position, the counter mechanism behind the numeral, and the seven rules with no subject in this category. **Its roster table's HANDS OFF column is now PANEL ADVISES**, cell by cell, and designs 1 and 3 carry a **[Free] rec.** badge. **All fifteen design frames** gain a **DESIGN PATCH** block naming, for that design, what it draws instead of switching, what its panel advises, where its maximum sits and which values are greyed with a reason, that Remove never greys out and what it says at two steps, whether it draws a member ask, what a visitor gets with JavaScript off, and how its numeral is rendered. **No section frame was restyled, no arrangement moved, and no type scale, colour pack or spacing step changed.**

### What changed, and the rule that required it

1. **The hand-off map is deleted — twenty-five sentences across thirteen designs** — *no design ever turns into another design*. Gone: 1, 4, 6 and 10 "seven or eight → 14 Index"; 5, 9 and 11 "→ 3 Rows"; 2 "six or more → 1 Three Up" and "below three → 1 Three Up's two cells"; 7 "five or more → 3 Rows"; 12 "five or more → 8 Rail"; 13 "below three → 1 Three Up" and "six or more → 2 Track"; 14 "under four → 1 Three Up"; 15 "under four → 3 Rows"; 11 "two → 7 Alternating Media"; 5 "with no title the section hands off to 1 Three Up"; 6 "print and forced colours draw 1 Three Up"; 8 "removing until the cards fit hands off to 12 Media Top"; 12 "8 Rail hands back here"; 15 "at ≤ 767 the design is 3 Rows"; 10 "at Icons None the design is 14 Index inside a panel"; 2 "Connector None makes this 1 Three Up with a marker"; and the shared floor's own map — "14 Index in four cases, 1 Three Up in four, 3 Rows in four, 2 Track in one" — with the two-answer sentence that carried it.
2. **What each design does instead is draw what it has and hide what cannot apply** — *no design ever turns into another design*. 1, 4 and 6 wrap their rows at seven and eight, the short last row at the left; **2 wraps its markers to a second row and the connector runs within each row rather than across the wrap** — the line it cannot cross is hidden, not faked; 5 lengthens its right column; 7 gets taller and the panel states the 2,425 px; **8 hides its two arrows and its two fades where the track already fits** — the rule's own example; 9 draws Large 72 in 306 cells on a second row; 10 grows its panel by a hairline row; 11 draws two tabs at two and a taller tab column at eight; 12 wraps a second row of cells; 13 wraps its pills and the band grows 52 px; 14 keeps its four columns aligned under four steps; **15 hides its sticky list at ≤ 767 and draws its steps at the full width, still itself**. At zero steps every design still does not render.
3. **The panel advises and never switches** — *no design ever turns into another design*. Every destination A13 used to hand a frame to is now a line at a control: "at seven steps, 14 Index reads better", "at five steps this section is 2,425 px tall; 3 Rows fits more in less", "two tabs read as a toggle; 7 Alternating Media shows both at once", "at six steps the track wraps; 1 Three Up reads better", "for a section whose steps always fit, 12 Media Top", "under four steps, 1 Three Up". Advice a site can ignore, and **14 Index's "receives from four" now means four panels advise it**.
4. **The floor stopped being a walk to nothing** — *the Remove button never greys out*. Nothing in A13 ever dimmed Remove and nothing does now. **At two steps Remove stays visible and clickable, and clicking it says "a process needs at least two steps" rather than removing the row**, so the one-step state is not reachable from the button; the sentence is on all fifteen panels. At zero — a list a site emptied, or a bound tag with no posts — the section does not render and the repeater keeps Add step with a line saying so.
5. **No count row became a number picker, because none needed to** — *item counts are a number picker*. The item count in A13 has always been the `steps[]` repeater — Add step, drag handles, Remove on every row, ⌥↑ and ⌥↓, **Add disabled at eight** with its number — plus P0·5's stepper at each design's own ceiling in bound mode. **Count per row counts planes across the page rather than items** and stays a row of named values, which is the reading the owner ruled on in the Testimonials category; A13 offers no "Three · Four · Six" anywhere as an item count.
6. **Nine locked values are now drawn greyed with the reason visible rather than silently forced** — *item counts are a number picker*, second half. Display 104 from four steps · Numeral position Beside at Display · Steps Two columns below four · Crop Portrait at Count Four · Head Centred at Arrows Above the rail · Duration while the label holds the row's end · Separator at ≤ 767 · Background role at Contrast on 6 Contrast Band · Top divider at None on both bands.
7. **The section link gains the member ask** — *member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript*. A13 draws no button, and its one destination is a text link; where that link's target is a member action it **does not render** on a connected site with self-signup switched off or no payment provider connected, and where it opens Ghost's own sign-up pop-up, **with JavaScript off nothing happens**. Scope-tagged apart from Member visibility, which hides the section server-side. **13 Slim Bar draws no link at Lead None** and carries neither line there.
8. **The numeral is named as a stylesheet counter** — *Ghost's templates cannot count, add, or remember*. The `<ol>` carries a CSS counter and each `<li>` renders `counter(step, decimal-leading-zero)`, which is where **01 … 08** comes from: no arithmetic, no padding helper, no authored field, and no `number` in the field list. **The plate's figure at 0.4 × the box's shorter edge is `40cqmin`** on a size container, so nothing measures a box. **Nothing counts across its own loop** — no "Step 3 of 6", no total, no "and 2 more" — and the one number in the product is Add step's ceiling, which the editor holds.
9. **One promise is withdrawn** — *CSS cannot see content*. 13 Slim Bar said its pill title never wraps and that "the field states the measured width rather than clamping". **A title too long for the row now wraps to a second line and grows its pill**; nothing is clamped, truncated or faded, and the panel advises about 24 characters. 3 Rows' 400-character body is unchanged and still honest: the string is counted **in the editor as it is typed**, never in the template and never in the stylesheet.
10. **8 Rail's old finding is closed rather than carried** — *no design ever turns into another design*, with *CSS cannot see content* behind it. There is no precondition to measure any more. **The `carousel` module hides the arrows and the fades when the track already fits** — a browser measurement made by the module — and with JavaScript off there are no arrows to hide. Amendment 8 is rewritten with it: the library's only two-way hand-off is gone.
11. **Nothing was renumbered and no design was deleted.** Fifteen designs, 1 to 15, no gap created or closed, no number reused.

### Rules and facts that were already satisfied, checked design by design

| Rule or fact | Where it lands in A13 |
|---|---|
| **Avatars with no photograph** | **No subject.** A13 draws no person and no initials block in any of the fifteen: `profile_image` is read nowhere, and the category's item is a line of type. **The numeral plate is not an avatar** — it is the item's position rendered into an empty picture box, `aria-hidden`, and it takes no letters from any name. |
| **Slider labels** | **No subject to fix.** Every scale row already names what it affects and reuses the standard words: **Vertical spacing**, **Card padding** and **Panel padding** read Compact · Comfortable · Spacious; **Density** reads Compact · Comfortable; **Numeral column**, **Body measure**, **Tab column** and **Card width** read Narrow · Wide or Narrow · Standard. No invented three-word vocabulary anywhere in the category. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A13 draws no gap control at all — every gutter, row gap and step gap is a fixed value in the arrangement, from the 24 px gutter to 15 Sticky Rail's 56. Nothing to rename. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all fifteen. **There is no "Inherit" value anywhere in A13** and none was removed, because none existed; the swatch row is **Base**; **no design renames a shared control or adds a choice to one**. Every narrowing already carried its reason and now shows it greyed: 6 Contrast Band's Background role locked at Contrast (its ground is the finding the design exists to state), Top divider locked None on 6 and 13 (a band draws both of its own edges), no Title size on nine designs, no Display title anywhere, Count Five refused on 1 and 4 with the measure as the reason. |
| **The no-JavaScript notice** | **No subject, and no promise to withdraw.** A13 holds no subscribe field and no sign-in field in any of the fifteen, so there is nothing for a notice to replace, and no sentence in this document ever said a reader could subscribe without JavaScript. **The per-design JavaScript-off line stands and is restated on every frame:** twelve identical pixel for pixel, **8 Rail** a fully usable native snap strip minus two arrows and two fades, **11 Walkthrough** every panel stacked and visible, **15 Sticky Rail** the first item marked with no tracking. **No A13 design loses an authored step, title, body, label, icon or picture with JavaScript off.** |
| **Some fields we drew do not exist** | **Already satisfied.** A13's bound mode reads a post title, a custom excerpt, a feature image and a tag, and nothing else. No member join date, no member newsletter list, no cadence, no site address and no posts-per-page setting is read anywhere: **Count is the section's own stepper**, capped at each design's ceiling. `label`, `duration` and `icon` have no Ghost source and are stated as empty rather than invented. |
| **Inside a blog post's body we own the stylesheet and nothing else** | **Applies nowhere.** These are placeable page sections whose markup, ARIA attributes and words this project owns end to end. Recorded, applied nowhere. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest designs, none of which needs the customer to own good photography — **1 Three Up · 3 Rows · 2 Track · 14 Index · 5 Split Head** — and recommended 1 Three Up and 3 Rows — **ruled by the owner on 30 August 2026**. The line the merge reads is at the head of this document. |

### Open questions

1. **11 Walkthrough's no-JavaScript branch still emits a heading per panel** — carried, unchanged by this pass, and still the architect's. Either `tabs` gains a branch that stacks without emitting headings, or A13 accepts a category-wide exception at design 11. The Testimonials category answered the same collision by letting the branch use headings in that branch alone; **A13 has not been ruled and the flag stays on `A13-11`'s frame.**
2. **Image focus is short a horizontal axis** — carried from the controls pass. 12 Media Top's Portrait 4:5 crops a landscape file left and right, and Centre · Top · Bottom has nothing to say about it. A control-vocabulary question rather than a registry one.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** — fifteen designs, no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the required shape, and names **1 Three Up** and **3 Rows** — both of which exist in this category's roster. It is **the owner's own choice, ruled on 30 August 2026**.

### The owner's rulings — 30 August 2026

1. **The free designs are 1 Three Up and 3 Rows** — *the two free designs are the owner's choice*. A grid and a stack: between them a free site can draw two steps or eight, short steps or long ones, with no picture, no icon and no extra prose needed for either to look finished. The pairs he refused: **1 with 14 Index** (the ledger looks unfinished below four steps, leaving a three-step site one usable free design) and **1 with 2 Track** (the track caps at five steps, so the free tier would have nothing for a long process).
2. **11 Walkthrough draws its two tabs and the panel advises** — *no design ever turns into another design*. At two steps the design draws two tabs and two panels and the line reads "two tabs read as a toggle; 7 Alternating Media shows both at once" — advice the site can ignore. The alternatives were refused: greying the design out in the picker would stop an editor choosing it before typing content, and stacking the two panels open until a third step exists would change the section's shape as content is typed, which is the behaviour this pass exists to delete. **This closes the two-step question for the category.**
