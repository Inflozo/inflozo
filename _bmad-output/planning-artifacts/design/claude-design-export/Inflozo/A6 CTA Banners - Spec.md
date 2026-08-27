# A6 CTA Banners — written specification

15 designs · Paper pack · drawn in this project as `A6-1 Centred.dc.html` … `A6-15 Signature.dc.html`, with the category's shared artefacts in `A6-0 Category Proof.dc.html`.

Read `A6-0` first. It carries the four settlements §8 asks A6 to make, the ladders, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**.

**Specification-only pass, this session.** Every design now carries four added fields — descriptor, structural descriptor, archetype, behaviour module — at the head of its section, above its content fields. Nothing drawn changed, no frame moved, and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand as written.

**Second specification-only pass: the item controls.** The category's one repeater — **`reasons[]`, the 1–3 list 11 Reasons draws and the other fourteen keep** — now has its controls written: where Add sits, what a new reason arrives carrying, where it lands, what Remove does at the floor, whether order is worth anything, the counts the design is drawn for, what happens outside them, and what the section renders at zero. **Every design carries an Items field** at the head of its section for it, including the thirteen whose answer is “none”, because “this design draws no list” is a specification rather than a silence. **12 Pair is the one other design that draws more than one of anything, and it is not a list:** two asks in eight fixed fields, no Add and no Remove, stated as such. Nothing drawn changed in this pass either, and the four fields the first pass added stand exactly as written — the fifteen tuples were re-checked against each other and against the five closed sets, and none moved.

**Third pass — the controls-reconciliation patch (this document's current state), 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface, reusing the shared **P0 editor primitives by name** — the P0·1 inline toolbar and link popover, the P0·2 icon slots and Icon Picker, the P0·3 item controls, the P0·4 member-aware action editor, the P0·5 populate-from panel, the P0·6 state switcher — never redesigning them. Every design gains the universal trio outside its own list; every Padding row and every Ground row retires into it; **Member visibility lands on fourteen designs** (14 Members keeps its richer three-state model and is exempt); every URL opens the Ghost-aware Link Picker, and the hard-coded `#/portal/signup` literal becomes the picker's Portal · Sign up action; every action takes an optional button icon; Image focus rides in every Image Picker popover. Three owner rulings bring Ghost content in — **Content source on 7 and 8, Signer source on 15**. 6 Inline Form gains its signed-in behaviour and the per-section newsletter override; 11's Mark gains Custom icon; 12 gains Swap asks at the field-group head; 14's sign-in line becomes a field and its upgrade target opens the Link Picker. No layout was redesigned and no module changed; **the one visible-content addition is 6's signed-in members line, drawn on its own frame**. Where this pass conflicts with an earlier ruling the conflict is recorded — one line each — in the closing **Reconciliation notes**, which open with every frame changed.

**No module rename was needed.** This document had named no modules at all — it wrote behaviour as state, motion and hand-off rather than as JavaScript — so nothing here had to be corrected against the fixed 31-module registry (FR-G7). Every module name below is the registry's, and every no-JS sentence is quoted from it rather than composed here.

**A6 uses one module.** `member-form`, on **6 Inline Form** and on **14 Members** at Signup: Inline form — the two designs that draw a field, which is the settlement §0 already makes. **The other thirteen declare nothing**, and 14 declares nothing at its other signup value. §0's “there are none” is about behaviour *designs*: nothing in A6 counts down, rotates, dismisses, sticks, expands or compares, and every frame in the category is a resting state for that reason. A form that posts is not one of the behaviours A6 refused — it is the one script the category admits, and this pass is the place that reading is written down. Everything else is CSS over server-rendered markup, so **no A6 design loses content without JavaScript.**

**`core` is assumed, not declared per design.** Every no-JS branch in A6 — the static form row, the Portal links — is CSS keyed off `.js-enabled`, which is `core`'s job: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than fifteen times. *Flagged: not listing it per design is mine.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. `member-form` is edit-safe on both designs, which is why 6's four states and 14's three member states are drawn rather than triggered.

---

## 0. The shared floor

Everything in this section applies to all fifteen unless a design says otherwise.

**The frames draw the banner with the footer's top edge beneath it.** A5 drew its sections alone on the page ground because a feature set has an ordinary section above and below it. Most CTA banners are the last thing before the footer, §8 asks what that looks like, and a frame that left the footer out would answer the question by omission. Where a design's rule concerns its neighbour more deeply — 13 Overlap's join, 10 Slim's dropped rule — the whole footer is drawn and the caption says so.

**Colour.** Role tokens only — `background`, `surface`, `text`, `text-muted`, `border`, `accent`, `contrast`. **The accent is spent once per banner, on the button**, and the budget falls as the ground gets louder: once on `background`, `surface` and a card; once on a photograph, where the button is the only opaque object over it; **nothing on an inverted band**, where an accent fill carrying the band's colour is 3.2:1 in Paper. **12 Pair is the one exception and spends it twice**, at Actions Button, and says why. **There is no outlined action anywhere in A6.**

**The title ladder is A5's head ladder, unchanged** — Medium 34 · Large 40 · Display 48 at 1440, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390 — because a banner is a section head with an action under it. Title measure 780, sub 17 px muted on 620. Eyebrow 13 px uppercase tracked `.08em` in `text-muted`. Four designs refuse Display 48 (3, 8, 11 at Beside the text, 15) because their title has a column rather than a page. **9 Big Type is the ladder's one exception** at Display 76 · Huge 96, and it is a design rather than a control for that reason. 10 Slim's line is 21 px; 12 Pair's column titles are 28 / 34.

**The action is A4's hero-scale button** — accent fill, 15 px/600, padding 13×22, 46 px tall, the pack radius — one step above A5's mid-page button, on the argument that this section exists for its action. **Flagged as a departure**, as A5's own step down was. **10 Slim is the only design that steps back** to A1·1's 14 px/600 and 9×17.

**Actions is one control, two values: Both · Primary.** A4's words minus its third. **Actions None is not offered anywhere in A6** — a banner with no action is a section head, and A5 owns those. **The secondary is allowed to be two things:** A1·1's ghost action at the primary's size, or a text link with a typed arrow. Never a second fill, never an outline, never a twin. Two exceptions, both stated where drawn: 14 Members' sign-in sentence (a correction, not an alternative offer) and 12 Pair (two equal asks are two columns).

**Spacing.** Section spacing is the universal **Vertical spacing** control (below), resolving Compact 64 · Comfortable 96 · Spacious 132 at 1440, 80 at 834, 64 at 390 — A4 and A5's values. **5 Contrast Band resolves it one step tighter at 44 · 64 · 88** (A4·9's scale) and **10 Slim resolves the bar's own 20 · 28 · 36**. Card padding 48 · 64 · 88 keeps its name on 4 and 13 (fixed at 48 for 12's cells) — a genuinely different ladder, never a duplicate. **Where a design controls a plane's padding, Vertical spacing is locked at 96 with the reason shown** — A5·16's rule, carried by 4 and 13; 12's section spacing stays controllable, its cards' padding fixed. Page margin 72 / 40 / 20. Everything on the 8 px grid. The separations inside the stack are fixed, not controlled: 12 px between head elements, 20 px above the action row, 24 px inside it, 4 px to the note.

**The universal trio — this pass.** Every placeable section carries **Background role** (Background · Surface · Contrast), **Vertical spacing** (Compact · Comfortable · Spacious) and **Top divider** (None · Line · Fade, default None) **outside its own control list**. The old per-design Padding rows were Vertical spacing under another name and retire everywhere; the old Ground rows retire into Background role with their constraints kept — Contrast stays unavailable on 2 (a band supplies its own edge), 6 (A3·4's field-step refusal), 8 (two grounds arguing), 12 (two accent fills at 3.2:1 each), 14 (both signup values) and 15 (a portrait needs a scrim the packs do not define). Background role **locks where the ground is the design's identity**: 5 Contrast Band at Contrast, 7 Full Bleed Image on its photograph, and 4 Card and 13 Overlap at Background — page ground on all four edges being what those two draw — each with the reason shown. **Top divider defaults Line on two designs**: 2 Flush Left, whose Rule above retires into it, and 10 Slim, whose upper rule does the same; both keep their page-margin and never-two-lines rules as the divider's advice line, and 10's locks None on a plane.

**Member visibility — this pass.** Everyone · Logged out · Free members · Paid members, on fourteen designs — this is the CTA-bearing category where the PRD makes it normative. It hides the whole section server-side; a single action's audience is P0·4's member-aware editor, and the two are scope-tagged apart, as P0·4 draws. **14 Members is exempt: its three-state model subsumes the control.** On 6 it composes with the new signed-in control — visibility picks who sees the section at all, the signed-in control what a member who can see it gets. On 13 it composes with the precondition: a hidden section drops the overlap and the footer's padding returns to its own value.

**Editing — this pass.** Every visible authored text edits inline with the P0·1 toolbar — bold, italic, underline, link, the link popover carrying open-in-new-tab and rel nofollow / noreferrer / sponsored: eyebrow, title, sub, note, both action labels, 11's reasons lines, 12's second-column title and sub, 14's `memberTitle`, `memberSub` and sign-in line, 15's signer name and role, and the five `newsletter*` fields where drawn. Ghost-bound content — 7's and 8's bound titles, 15's bound signer name — is never inline-editable: clicking it shows the plain-text lock pill and "Edit in Ghost". **Every URL field opens the Ghost-aware Link Picker**, and every signup ask is the picker's **Portal · Sign up** action rather than a hard-coded `#/portal/signup` — a site retargets its asks without new fields. **Every button accepts an optional icon** before or after its label from the P0·2 Icon Picker, always Small and label-coloured.

**Image fields — this pass.** Every image field carries **Image focus** (Centre · Top · Bottom) in the Image Picker popover — never a hidden field: 7's `imageFocus` stops being a bare field, 8's is read by the derived crop at every width, and 15's portrait gains it against the square crop.

**Visitor-facing strings — this pass.** No fixed English ships. 14's "Already a member? Sign in" is an editable field with its default kept; 6's members line is an editable field with a default; 6's error line and its Members-off substitution label are **theme translation-catalog strings** — the error has to match what Ghost rejected, so it is the catalog's rather than a field. Everything else a reader sees was already an authored field. **No "Preview" control existed in A6 and none was added** — states while editing are the P0·6 switcher's job, and 6's four form states and 14's member states are its subjects in this category.

**Structure and landmarks.** `<section aria-labelledby>` named by its title, an `<h2>`. The eyebrow is a plain paragraph above it — not part of the heading, not a heading, not `aria-hidden`. **Actions are `<a>` elements, never buttons:** they navigate. The only `<button>` in the category is 6 Inline Form's submit. **The visible label is the whole accessible name** — no `aria-label` lengthening it — so “Start reading” has to stand alone, and the editor says so where a label reads “Click here”.

**DOM order** is eyebrow, title, sub, primary, secondary, note, on every design and at every width. **Three stated exceptions:** 10 Slim puts the note second, 11 Reasons puts its list after the actions even where it sits beside them, and 15 Signature puts the signature before the actions.

**The note** is a paragraph and **never `aria-describedby` the primary** — “No card needed” is a fact about the offer, not a description of a link. In 6's form the note's slot is both the `aria-describedby` target and the `aria-live` region, the one place it is both.

**Responsive floor.** At ≤ 767 **the primary is full width at 48 px** (44 on 10 Slim) and **the secondary takes its own 44 px row at full text strength** — a muted line under a full-width button reads as disabled. A band is always full bleed on a phone.

**Motion.** 160 ms ease-out, one transition per state change. Hover darkens a fill 6%, 3% on a band; pressed 10%. **Nothing scales, lifts, slides or gains a shadow anywhere in A6**, and no arrow ever moves. Reduced motion removes transitions and keeps every state.

**Focus.** A 2 px accent ring 2 px outside the button, its inner gap taking the colour of whatever the button sits on. **On a band or a picture the ring is the carried colour** rather than the accent — 12.8:1 against 3.2:1.

**Data.** 14 Members reads two facts — signed in or not, paid or not — and, **this pass, three owner rulings bring Ghost content in**: 7 and 8 carry **Content source (Authored · From a post)** through the P0·5 panel, and 15 carries **Signer source (Authored · Ghost staff user)**; everything bound is plain-text-locked. A signup ask elsewhere is the Link Picker's **Portal · Sign up** action — the hard-coded `#/portal/signup` literal is retired everywhere — and **only 6 Inline Form and 14 Members draw a field**. Members off in Ghost → A3·4's substitution. Every design is offered on every route.

**Empty.** No eyebrow, sub or note → each simply absent. **No primary label or URL → the section does not render** and the editor names the field: a CTA banner with no action is not a banner.

**The item list.** **A6 has one repeater and one design that draws it:** `reasons[]`, one to three lines, each ≤ 40 characters, **text only — no icon, no body, no link and no per-line mark**. **11 Reasons is the only design that draws it**, and the other fourteen keep the field untouched, so a site can switch to 11 and back without losing what it typed. Nothing else in the category is a list: 12 Pair's two asks are eight fixed fields, 6 Inline Form's and 14 Members' field is one input, 15 Signature's signer is one person, and 5, 7 and 8's `image` is one photograph. **A banner is one ask**, which is why item-count is `none` on thirteen of the fifteen tuples.

**Where the item controls sit.** On 11 Reasons alone: a **Reasons** repeater below the design's own controls, one row per line with a drag handle and a remove action, **Add reason** at the end of the list. Selecting a reason on the canvas selects its row and opens its text field, and nothing else. Keyboard: ⌥↑ / ⌥↓ moves the focused row. *Flagged: the placement is A3's, carried.*

**What Add produces — never a blank row.** A new reason arrives carrying a fact — “Every issue in the archive.” — and lands **last**. An empty row would publish as a mark with nothing beside it, which is a bullet pointing at nothing.

**Remove, and the floor.** Remove sits on the row and is undoable. **One reason is a supported state**, keeping its mark and its hairline, so Remove stays enabled down to one. Removing the last one is allowed and hands off rather than breaking: the section renders as 1 Centred at Left, the sidebar says so, and the repeater keeps Add reason with a line naming what the section draws until a reason exists. **The field is kept, never cleared.**

**Reorder, and what it is worth.** Drag, or ⌥↑ / ⌥↓. Authored order is drawn order at both of 11's positions and in the tablet's column, and **that is all it is**: no reason is privileged, none carries the accent, none is drawn at a different size, and none is dropped at any width. Order is meaningful to read and load-bearing for nothing — said plainly rather than implying a hierarchy of facts.

**Zero items** is each design's own empty state restated in item terms, and each says it again below. For the thirteen without a list there is nothing to say twice; for 11 it is 1 Centred at Left, and the hairline goes with the list.

**Two rules about item controls, and they are architectural rather than stylistic.** (1) **A design control writes one value onto the section and the stylesheet reads it, so it applies to every item at once.** 11's Mark is the section's — “make the second reason an accent tick” is not expressible by construction, and 12's Column planes, Column title size and Actions apply to both asks together. Where a design looks like it needs per-item styling that is a signal for two designs, and A6 says so rather than inventing the control: a list whose lines carry their own emphasis is A5·11 Checklist with a section action. (2) **Inside an item the user edits content only** — text, image, link — never layout, spacing, alignment or emphasis. The 424/96 division, the 17 px line, the 16 px mark box, the 14 px gap and the 3 px optical lift are the section's, written once and read by all three lines.

**Behaviours.** There are none. No countdown (A2·6's), no rotation (A2·9's), no dismissal, no sticky (A2·11's), no accordion (A9's), no comparison (A7's). **A6 is fifteen resting states**, which is why every frame in the category is one.

**Content.** Orbit Weekly throughout: the free letter, the paid subscription, the archive, the reader threads, the source files and the printed quarterly, with Maya Okonjo as the editor who signs 15.

---

## 1. Centred

The ask centred on the page's own ground: eyebrow, title, sub, one action, a note. The floor the other fourteen depart from.

**Descriptor.** The category floor — the ask centred on the page's own ground with nothing added to it, and the arrangement four other designs resolve to rather than inventing one.

**Structural descriptor.** `stack · none · page · none · none · centred axis, nothing added`

**Archetype.** stack

**Behaviour module.** **none.** The ground, the ladder, the button's 6% hover and the focus ring are CSS over server-rendered markup; the Contrast value is a token substitution. There is nothing to degrade — with JavaScript off the banner is the banner.

**Items.** **None** — one ask, and the shape the other fourteen depart from. `reasons[]` is kept and not drawn: 11 Reasons is where a banner grows a list, and this is the design it resolves back to when the list is emptied.

**Fields.** `eyebrow` · `title` · `sub` · `primaryLabel` (req) · `primaryUrl` (req) · `secondaryLabel` · `secondaryUrl` · `note`. Everything else in the shared list kept and not drawn.

**Controls.** Title size · Actions · Secondary style (Ghost text · Text link, unavailable at Actions Primary) · Below the actions (Note · Nothing) · Member visibility, plus the universal trio.

**Reconciled.** Padding retires into Vertical spacing and Ground into Background role, where Contrast keeps this design's substitution and its refusal. Eyebrow, title, sub, both labels and the note edit inline with P0·1; both URLs open the Link Picker — a signup ask is the Portal · Sign up action, never a literal; both actions take an optional button icon.

**The arrangement.** Everything centred on a 780 px title measure and a 620 px sub, the action row 20 px under the sub with a 24 px gap, the note 4 px under the row.

**Background role Contrast** disables the accent fill with its 3.2:1 shown and substitutes a solid `text` fill carrying the band's colour. It stays disabled in packs whose accent would pass, because a control whose availability varied by pack would make one design twelve. 5 Contrast Band is the design for a band that wants edges, inner padding and a lift; this value is for a site that wants one banner inverted and nothing else.

**Responsive.** The arrangement holds at every width — a centred stack has nothing to collapse — which is why 1 is the one design whose tablet frame is a narrowing and is drawn anyway, for the numbers. 834: padding 80, title 34, sub measure 560, gap 20. ≤ 767: padding 64/20, title 28, sub 16, the shared phone action pair; the band always full bleed, with muted on it at `#B9B1A4`, a 72% mix of the carried colour, 7.4:1.

**Empty.** No title → the banner is the action and its note, and the editor names 10 Slim.

**a11y.** The floor, as §0.

**Flagged.** Reusing A5's head ladder as A6's title ladder, the action's step up to A4's hero scale, the once-per-banner accent budget and its fall to nothing on a band, the two allowed secondary forms and the refusal of a second fill, dropping Actions None, the 20/24/4 px separations, the full-width phone primary and its full-strength secondary, and the whole above-the-footer rule including the footer's dropped padding.

---

## 2. Flush Left

1's ladder stacked at the page's left margin on a stated measure, with the right half of the row left empty.

**Descriptor.** The only design that draws a hairline above itself, and the only one whose right half is empty by arrangement rather than by a missing field.

**Structural descriptor.** `stack · none · page · none · none · hairline above the stack`

**Archetype.** stack

**Behaviour module.** **none.** The rule is a `border-top`, the three measures are `max-width` values, and the measure's step at 1080 is a media query. Nothing to degrade.

**Items.** **None.** The empty right half is the arrangement rather than a slot waiting for a list — anything repeated in it makes this 3 Split or 11 Reasons. `reasons[]` kept and not drawn.

**Fields.** As 1. **The note is always drawn where authored** — no Below the actions control — because the empty right half means an absent note costs the arrangement nothing.

**Controls.** Title size · **Measure (Narrow 520 · Medium 620 · Wide 720)** · Actions · Member visibility, plus the universal trio — Contrast unavailable in Background role (a band supplies its own edge and a divider above it would draw a second one), and **Rule above retired into Top divider, defaulted Line here**, the first of the two designs in A6 that default it on.

**Reconciled.** The rule's page-margin rule and the never-two-lines advice survive as the divider's advice line — a recorded conflict. Eyebrow, title, sub, labels and the note edit inline; both URLs open the Link Picker; the actions take optional icons.

**The rule above is the design's answer and the reason the control exists.** A centred banner is separated from what came before it by symmetry; a left-aligned one starts at the same margin as the previous section's title, and 96 px of space cannot say which it is. A single `border` hairline across the content width does. It runs to the page margin, never the window's edge. **Where the section above already ends in a hairline the value is None**, and the editor says so rather than drawing two lines 1 px apart.

**One measure governs title and sub together** rather than 1's 780/620, because two ragged right edges at different distances read as a mistake. At Wide the sub is capped at 620 anyway, and the sidebar says so.

**The right half stays empty** — 620 px of text on 1,296 leaves 676 px of nothing, and that is the arrangement rather than a gap waiting for content; anything in it makes this 3 Split.

**The secondary is always the ghost action.** A text link with an arrow is not offered: an arrow at the left margin points into 676 px of empty page.

**Responsive.** The arrangement holds at every width. At 1080 and below **the measure steps one value down** (620 → 520, 720 → 620, Narrow unchanged), padding 80, title 34. At ≤ 767 the measure is the column and the control is ignored; **the note stays left-aligned** where 1's is centred; the rule is kept.

**Empty.** As 1.

**a11y.** As 1, plus the rule being a `border-top` and **never an `<hr>`** — it separates nothing semantically. DOM order identical to all fifteen; left alignment is CSS alone. The ghost action is not identified by colour alone: underline on hover and focus, 24 px from a filled button, second in a two-item row. At 200% text the measure is the column.

**Flagged.** The rule above and its edge argument, the three measures and the one-measure decision, the sub's 620 cap at Wide, the measure's step at 1080, refusing the arrow secondary and the Contrast ground, the empty right half as an arrangement, fixing the note as always-drawn, and the phone's left-aligned note.

---

## 3. Split

The words on the left of one row and the actions on the right of it. The shortest banner in A6 that still carries a title and a sub, and the one a long page can afford twice.

**Descriptor.** The only design that puts words and actions in opposite halves of one row, with the actions a right-aligned column rather than a row.

**Structural descriptor.** `split · none · surface · none · none · right-aligned actions column`

**Archetype.** split

**Behaviour module.** **none.** The two-column row, the two divisions, the 3 px optical lift at Top of the row and the 1080 hand-off to 2 Flush Left's arrangement are flex and media queries. Nothing to degrade.

**Items.** **None.** The right half holds a primary, a secondary and a note — three fixed elements in a column, not a repeater, so nothing in it can be added to or reordered. `reasons[]` kept and not drawn.

**Fields.** As 1, with **the note drawn in the actions column**. `secondaryLabel` is capped at 24 as everywhere and the editor advises 18 at Even halves.

**Controls.** Title size (34 · 40 · **Display 48 unavailable** — a 48 px line beside a 46 px button makes the button a caption) · **Division (Text-weighted 780/440 · Even halves 632/632**, gutter 76 fixed at both) · Actions · **Actions alignment (Centred on the text · Top of the row** — the title's cap height, a 3 px lift, A5·2's rule) · Member visibility, plus the universal trio (Background role defaulting Surface).

**Reconciled.** Padding and Ground retire into the trio, Surface kept as the default. Every text edits inline; both URLs open the Link Picker; the actions take optional icons.

**The actions are a right-aligned column, not a row.** A row of two inside the right half either crowds the page margin or floats in the middle of it; a column puts the primary's right edge on the margin, the secondary 12 px beneath and the note 12 beneath that, so the block has one edge and reads bottom-up as offer, alternative, terms. `align-items: flex-end`, never `text-align: right`, so a 24-character label and a 12-character one line up on the same edge.

**Background role Surface is the default** because a one-row banner on the page's own ground has nothing to say it is a section — 2 solves the same problem with a hairline.

**Responsive.** The row holds to 1081. **At 1080 and below the design hands off to 2 Flush Left's arrangement** — actions under the text at the left margin, in a row, note under them — with Division and Actions alignment unavailable and the panel saying why; padding 80, title 30. At ≤ 767 one column, padding 64/20, **title 26**, the shared phone pair, note left-aligned.

**Empty.** No sub → the row is title and actions, the design at its shortest. No secondary → primary and note. No note → the column ends at the secondary.

**a11y.** A6's shared DOM order under a two-column flex row, so reading and tab order match at every width and division. The note is last and is not `aria-describedby`. The focus ring's inner gap takes the ground the button sits on. At 200% text the row becomes the tablet's stack — the same hand-off, nothing new specified.

**Flagged.** The right-aligned actions column and the note's place in it, the 12/12 px column gaps, the 76 px fixed gutter, the two divisions, refusing Display 48, Surface as the default ground, the 1080 hand-off and the two controls it disables, and the phone title at 26.

---

## 4. Card

The banner on one `surface` card, inset from the page margin, page ground visible on all four edges. A3·12's plane and A4·8's inset at banner scale.

**Descriptor.** The only design contained by a plane of its own — one `surface` card inset from the page margin with page ground on all four edges, so the section's boundary is an edge rather than a change of ground.

**Structural descriptor.** `stack · card · page · none · none · inset surface card`

**Archetype.** stack

**Behaviour module.** **none.** Card, inset, hairline, tint and the dark drop of the shadow are CSS; the forced-colours collapse of all three treatments to Hairline is a media feature. Nothing to degrade.

**Items.** **None.** One card, one ask: two cards side by side is 12 Pair and a grid of them is A5's. `reasons[]` kept and not drawn.

**Fields.** As 1, unchanged.

**Controls.** **Card padding (Compact 48 · Comfortable 64 · Spacious 88** — one step tighter than the section scale it replaces, since a plane's edge does part of the work the space was doing; **the section's own padding is fixed at 96)** · **Inset (Snug 16 · Comfortable 40 · Wide 72** inside the page margin — A4·8's values unchanged, so a site running both reads one shape at two scales) · **Card treatment (Hairline · Tinted · Raised** — A5·4's, with its dark substitution: Raised is a hairline and no shadow in dark, which makes it Hairline there, and the editor says so rather than hiding the value) · Title size · Actions · Alignment (Centred · Left, where the measure is 620 inside the card and the card's right stays empty) · Member visibility, plus the universal trio — **Background role locked at Background** (page ground on all four edges is the identity, and the surface card needs a ground one step away) and **Vertical spacing locked at 96**; Card padding and Inset keep their names as genuinely different ladders.

**Reconciled.** Every text edits inline; both URLs open the Link Picker; the actions take optional icons.

**No whole-card link at any value.** A card holding two actions cannot itself be one; A5·4's Whole item has no equivalent here.

**Above the footer this is the design that needs no help:** the card's own bottom edge is the boundary, so the section's 96 px sits between two visible edges rather than two grounds.

**Responsive.** At 1080 and below **inset 40 → 24 and card padding one named value down** (64 → 48, 88 → 64, Compact unchanged), section padding 80, title 34, the sub's measure the card. At ≤ 767 the card keeps a **16 px inset inside the page's 20** (A4·18's rule), **card padding fixed at 24** with both it and Inset ignored, the primary full width inside the card's padding. On a phone Tinted holds up best: a border and a shadow inside a 350 px column is three edges in 32 px.

**Empty.** As 1. No primary → no section and no card.

**a11y.** **The card is a `<div>`** — not a region, group, article or landmark. The focus ring's inner gap is the card's colour, and the ring is 2 px thick, which is what carries it at 2.8:1 against `surface`. Muted text on the Tinted card is measured against the hover surface, 5.1:1. **Forced colours make all three treatments Hairline** — the honest consequence of the plane being decorative.

**Flagged.** The card's three paddings and their one-step-tighter argument, fixing the section's padding at 96, reusing A4·8's inset and A5·4's treatments with their dark rule, the 620 px measure at Left, refusing a whole-card link, the tablet's two-way step, the phone's fixed 24 px padding, and the forced-colours collapse.

---

## 5. Contrast Band

The whole banner on the inverted ground. Ground is not a control here: it is the design.

**Descriptor.** The only design where the inverted ground is the design rather than a control value — and the only one that spends no accent at all, its action carrying the band's own colour.

**Structural descriptor.** `stack · none · contrast · none · none · inverted ground, carried fill`

**Archetype.** stack

**Behaviour module.** **none.** The inversion, the carried-colour fill, the 3% hover, the 72% muted line, the carried-colour focus ring and the light-in-dark-mode band are all token substitutions in CSS. Forced colours drop the band, which is also CSS. Nothing to degrade.

**Items.** **None.** One band, one ask. `image` is a single field and is not drawn here at all; `reasons[]` is kept and not drawn — a band carrying three marked lines is 11 Reasons at Ground Contrast, a value that design already offers.

**Fields.** As 1. **`image` is kept and not drawn:** a photograph on a band needs a scrim over an already-inverted ground, and 7 Full Bleed Image is the design that has one. **No inline form at any value** — A3·4's and A4·11's refusal carried a third time.

**Controls.** **Band edges (Full bleed · Page margin**, the latter taking the pack radius and 56 px of inner padding, 40 at 834; **always full bleed at ≤ 767**) · Title size · **Action style (Carried colour fill · ~~Accent fill~~, disabled at 3.2:1** in every pack) · Actions · Alignment (Centred · Left) · Member visibility, plus the universal trio — **Background role locked at Contrast** (the band is the design; the carried fill, hover, muted line and ring re-derive from it) and **Vertical spacing resolving one step tighter, 44 · 64 · 88**, A4·9's scale carried, because an inverted block is read as bigger than it is.

**Reconciled.** The old Padding scale survives as Vertical spacing's resolution; the old "no Ground control" line becomes the lock, reason shown. Every text edits inline; both URLs open the Link Picker; the actions take optional icons.

**What the band changes.** The accent is spent nothing; the action is a solid `text` fill carrying the band's own colour at 12.8:1, hovering **3% darker rather than 6%** because a near-white fill darkening by 6% looks pressed; the secondary and all muted text are the carried colour at 72%; **the focus ring is the carried colour**, the one place in A6 it changes. An outlined button is not offered here or anywhere in A6.

**Dark.** Paper's dark `contrast` is `#EDE7DA` carrying `#171511`, so **the band is light in dark mode** — the one design in A6 whose modes are not variations of each other. Muted is a re-tuned `#57524A` at 6.4:1 rather than a 72% mix, and the action is a solid `#171511` fill at 14.9:1.

**Responsive.** 1080 and below: padding 56 at Comfortable, inner padding 56 → 40 at Page margin, title 34. ≤ 767: always full bleed, padding 44/20, title 28, **the primary full width at both alignments** and the secondary at full carried strength — the one place a 72% secondary could be mistaken for disabled text.

**Empty.** As 1.

**a11y.** The band is **not a landmark, region or theme boundary** — a background colour on a named section. The action is A6's button with two colours substituted, not a different component. Muted on the band is 7.4:1, higher than on the page's own ground. **Forced colours drop the band entirely** and nothing depends on the inversion.

**Flagged.** Carrying A4·9's tighter padding, the 3% hover, the 72% secondary and its phone exception, the full-width button at Left on a phone, the tablet's 40 px inner padding, refusing an outlined action across the category, refusing `image` and any form, and the one-band-per-page advice.

---

## 6. Inline Form

The banner with A3·4's one-row form standing where the actions would be. Settles §8's fourth question for the whole category.

**Descriptor.** The only design that takes input, so the only one with focus, invalid, submitting and done states — and the only one whose ground pairing runs the other way in dark.

**Structural descriptor.** `form · none · surface · none · none · field replaces the actions`

**Archetype.** form

**Behaviour module.** `member-form`. Edit-safe: nothing posts or validates while the section is being edited, which is why the four states are drawn on a frame rather than reached. **JS off:** “The `<form>` posts natively to Ghost's members endpoint; Ghost's own server response replaces the designed sent state.” Field, button, visually-hidden label and note all render; validation falls to `required` and `type="email"`; the done state is Ghost's own page rather than the row replaced in place at 104 px. The Members-off substitution — the button alone, linking to the subscribe page — is server-side and unaffected.

**Items.** **None.** The email field is one input, not a repeater — one address in, one submit — and the four states are states rather than items: nothing is added to them and nothing is reordered. `reasons[]` kept and not drawn; the note under the form is the one line of terms the row admits.

**Fields.** `eyebrow` · `title` · `sub`, plus **the five shared `newsletter*` fields** — placeholder (≤ 28, default “you@example.com”) · button label (≤ 16, default “Subscribe”) · note (≤ 90, one line) · success (≤ 60) · short success (≤ 32, used ≤ 767) — **shared with A3·4's footer form and A4·11's hero: change them once and all three follow.** `primaryLabel`, `primaryUrl`, `secondaryLabel`, `secondaryUrl` and `note` are kept and not drawn. **The error line is a theme translation-catalog string, not a field** — it has to match what Ghost rejected — as is the Members-off substitution label; no fixed English ships. **`membersLine`** (≤ 90) is added this pass for the signed-in state.

**Controls.** **Field width (Narrow 320 · Medium 400 · Wide 480**, A3·4's) · Title size · Alignment · **Note under the form (Show · Hide** — it hides the authored note, not the live region) · **When a member is signed in (Show a members line · Hide the section)** · Member visibility, plus the universal trio (Background role defaulting Surface, ~~Contrast~~ **unavailable** — a field on a band needs a surface step the packs do not define, A3·4's refusal kept).

**When a member is signed in — this pass.** The form asks members for an address Ghost already has, so the default substitutes **a members line** — `membersLine`, an editable field, default "You're on the list — manage your subscription from your account.", one sentence with one underlined link whose target is the Portal · Account action, replaceable in the Link Picker. The other value hides the section for signed-in members. **Rendered on the server, as 14's states are** — the other state's markup is not in the page, nothing swaps after load, and no module is added; `member-form` stays the only declaration. 14 Members is the richer sibling and the editor names it at the control. It composes with Member visibility: visibility picks who sees the section at all; this control what a signed-in member who can see it gets.

**Reconciled.** The five shared `newsletter*` fields gain a **per-section override, defaulted Inherit from site** — a banner's ask can differ from the footer's; overridden fields say so, and 14's form keeps inheriting. The error line and the Members-off substitution label are **theme translation-catalog strings** — no fixed English ships. Eyebrow, title, sub and the newsletter fields edit inline; the members line's link opens the Link Picker; the submit button takes an optional icon.

**The row.** Field 46 px — **A4·11's height, not A3·4's 44**, because a form standing in the actions' slot is the height of the actions it replaced — field and button 10 px apart, note 2 px under. In light the field is `background` inside a `surface` banner; **in dark it lifts to `surface`** — the step runs the other way, the design's one structural difference between modes, and the reason Ground Background is drawn in the dark frame.

**Four states at one height**, A3·4's verbatim: *empty* (muted placeholder) · *focus* (1.5 px accent border, the library ring suppressed — it would collide with a button 10 px away) · *invalid* (the error replaces the note at 13 px/500 in `text`, the border to `text`, **no red anywhere**, checked on blur and submit, never per keystroke) · *submitting* (“Subscribing…”, field disabled on the hover surface, width reserved, no spinner) · *done* (the row replaced in place at the same height with a way back, **session-lived** — Ghost's confirmation email is the record).

**Data.** Posts to Ghost's members subscribe endpoint; Ghost sends its own confirmation, and an already-subscribed address gets Ghost's response in the same slot. **Members off in Ghost → the field is replaced by the button alone**, linking to the subscribe page; placeholder and note kept, the sidebar naming the setting.

**Responsive.** The row holds above 767; at 1080 and below **the field steps one named value down** (400 → 320, 480 → 400). At ≤ 767 field and button take a row each at 48 px, 8 px apart, **field text 15 → 16 px so iOS does not zoom**, the done state using the short success and **holding the 104 px the form occupied** so the footer does not move up the screen.

**Empty.** No note → the row alone, the section losing 22 px. **No title is allowed** — the form is the ask — but then the `<form>` takes A3·4's `aria-label` and the editor says so.

**a11y.** A real visually-hidden `<label>Email address</label>`, never a placeholder standing in for one; `type`, `autocomplete`, `inputmode`, `required`. **No `aria-label` on the form where a title exists** — the one accessibility difference from A3·4. `<button type="submit">` is **the only `<button>` in A6**. The note's slot is the `aria-describedby` target and an `aria-live="polite"` region, so the outcome is announced where the terms were. At focus the state is carried by the text going from muted to `text`, not by the 1.5 px border's own contrast.

**Flagged.** The settlement that only 6 and 14 draw a form, the 46 px row carried from A4·11, the dark field's inverted step and the Ground pairing note, the 104 px done-state height, Note Hide keeping the live region, and dropping the form's `aria-label` when a title is present. Everything else is A3·4's, cited rather than re-decided.

---

## 7. Full Bleed Image

The ask over a photograph that fills the section. The third of §8's grounds, and the one whose height is set by its own content rather than a crop.

**Descriptor.** The only design whose ground is a photograph filling the section, and the only one carrying a flat scrim with a per-width value.

**Structural descriptor.** `media frame · none · image · none · full-bleed · flat 56% scrim`

**Archetype.** media frame

**Behaviour module.** **none.** The picture is a CSS background, the wash is a layer over it, and all three scrim values are media-query CSS; the height comes from the content, so nothing is measured. The no-picture hand-off to 5 Contrast Band is a template condition, and forced colours dropping picture and scrim is a media feature. Nothing to degrade.

**Items.** **None.** `image` is one field and the category has no gallery — a second photograph in a banner is A24's. `reasons[]` kept and not drawn: three marked lines over an unknown picture is three more contrasts a scrim cannot guarantee.

**Fields.** As 1, plus `image` (req, **2400 px or wider**) · `imageAlt` (kept, unused here) · `imageFocus` (Centre · Top · Bottom, **in the Image Picker popover this pass** — never a hidden field, ground rule 10).

**Controls.** Band edges (Full bleed · Page margin — pack radius, **no inner padding**; always full bleed at ≤ 767) · **Text position (Centred · Bottom left)** · Title size · Actions · Note · Member visibility, plus the universal trio — **Background role locked** (the photograph is the ground, the design's identity) and **Vertical spacing setting the picture's height**, there being no crop — and **the Data group: Content source (Authored · From a post)**.

**Data — this pass, the owner's ruling.** Content source: Authored · From a post, the P0·5 panel at count one — Latest · Featured · By tag · Hand-picked. Bound: **image ← the post's feature image, title ← the post title, primary action ← the post's URL**; the bound title is plain-text-locked ("Edit in Ghost"); eyebrow, sub, note and the action's label stay authored, so "Read this week's issue" stands over its own cover without retyping. A bound post with no feature image, or no post matching → the section renders as authored and the Data panel says so; the no-picture hand-off to 5 Contrast Band is unchanged beneath it.

**Reconciled.** Image focus rides in the Image Picker popover, never a hidden field. Every authored text edits inline; the action's URLs open the Link Picker; the actions take optional icons.

**The scrim is fixed and not a control:** a flat **56% wash** of `contrast` over the whole picture. **A stated departure from A4·4's gradient** — a hero is 16:9 with its text in the lower third and clear photograph above it; a banner is as tall as its own content, about 340 px, and a gradient across that puts the eyebrow in unscrimmed picture while the note sits in 60% black. **48% in dark** (the page around it is already near-black) and **62% at ≤ 767** — the only per-width scrim value in the library, because a 390 px crop of a 2,400 px photograph is a detail rather than a scene, and a detail is busier per square inch.

**Text position is A4·4's control minus its third value.** “Over the picture” cannot exist here: the picture is the section's height, so there is no page ground underneath to move anything onto. The editor names 8 Image Split.

**The actions.** The accent is spent once and the button is the only opaque object over the picture — its label's contrast is measured against its own fill, which is the argument for a fill here and against a link. **The secondary is the full carried colour with a 50% underline**, not the 72% muted value. The focus ring is the carried colour, 5's exception extended.

**Responsive.** The arrangement holds at every width; 834 padding 80, title 34, sub 560, scrim unchanged. ≤ 767: full bleed, padding 64/20, title 28, scrim 62%, the shared phone pair **at both text positions**.

**Empty.** **No picture → the design is 5 Contrast Band** — the wash becomes the `contrast` token at full strength, the accent action is substituted for 5's carried-colour fill at its 3.2:1 refusal, and the editor names what the section has become. A4·4's empty state, carried.

**a11y.** The picture is a **CSS background, not an `<img>`** — it carries no information the words do not — so `imageAlt` is kept and unused with the editor saying so. **A scrim cannot guarantee a ratio against an unknown photograph:** A4·4's admission, repeated. The wash, the stated minimum width and an editor note asking for low detail through the middle third are the answer; the last part is the site's choice of picture. Forced colours drop picture and scrim, which is the no-picture state. Reduced motion changes nothing; the picture never moves.

**Flagged.** The flat wash and all three of its values, the phone's 62%, dropping A4·4's third text position, Page margin without inner padding, the full-strength secondary and its 50% underline, the carried-colour ring, and the argument that a filled action is what a photograph needs.

---

## 8. Image Split

A photograph on one half and the ask on the other, with no scrim between them. The design for a picture that carries information rather than atmosphere.

**Descriptor.** The only design where a photograph sits beside the words rather than under them, with no scrim and nothing measured against the picture — and the only one whose alt text is drawn as an alt.

**Structural descriptor.** `split · none · page · none · right · unscrimmed picture half`

**Archetype.** split

**Behaviour module.** **none.** A real `<img>` with dimensions on the element and `loading="lazy"`, grid placement for Picture side, and the derived crop expressed as a ratio against the text half's height. The 320 px floor and the no-picture hand-off to 2 Flush Left are template conditions. Nothing to degrade.

**Items.** **None.** One picture beside one ask; `imageAlt` and `imageFocus` describe that single picture. `reasons[]` kept and not drawn — a list would want the half the photograph already has.

**Fields.** As 1, plus `image` (**1440 px or wider**) and `imageAlt` — **the one design in A6 where the alt is drawn as an alt**, and the editor asks what the picture adds instead of defaulting it empty. `imageFocus` is read.

**Controls.** **Picture side (Right · Left** — grid placement, never a source reorder; A5·9's rule) · **Picture treatment (Flush to the edge · Framed inset**, A4·3's mount unchanged: 14 px of surface, one hairline, the picture at half the pack radius, costing 28 px of width; **on a surface ground the mount takes `background`** so it does not disappear) · Title size (34 · 40 · **Display 48 unavailable**) · Actions · Member visibility, plus the universal trio — Vertical spacing on the text half, **what the picture's height derives from**; Contrast unavailable in Background role (a photograph beside an inverted half is two grounds arguing) — and **the Data group: Content source (Authored · From a post)**, as 7.

**Data — this pass.** As 7 — image ← feature image, title ← post title, primary action ← the post's URL, the bound title plain-text-locked. And **authored on a post or page, the picture defaults to that page's feature image** — A4·18's pattern — replaceable in the Image Picker.

**Reconciled.** Image focus rides in the Image Picker popover and is read by the derived crop at every width. Every authored text edits inline; the alt stays askable at both sources; the URLs open the Link Picker; the actions take optional icons.

**The division.** Text 720 — 2 Flush Left's Wide measure plus its padding — and the picture takes the rest; **the gutter is the text's own 76 px right padding rather than a gap**, since at Flush to the edge a gap would leave the section with two different right margins.

**The crop is derived from the text half's height**, not fixed: about 3:2 at Comfortable with a two-line title, wider at Compact, squarer at Spacious. A5·7 fixes its rows at 3:2 because it draws two to four of them and they must agree; this design draws one. **The floor is 320 px**, below which the picture is dropped.

**Responsive.** At 1080 and below the division is **480 / 354 — the text half takes 58%**, because the words have a floor and the picture does not — and **the two actions become a column**, primary above secondary at 10 px; title 30, sub 16. At ≤ 767 the halves stack, **the picture always first at a fixed 16:9** (A5·7's phone crop), full bleed even at Framed inset with the control ignored, and the section's top padding 32, since the picture is the top of the section.

**Empty.** **No picture, or a derived height under 320 px → the design is 2 Flush Left**, named, the text keeping its 720 px half. **No text tile** — A5·7's fill exists to protect a row rhythm and one banner has none; an empty 480 px box beside a paragraph is worse than the paragraph alone. This design does not draw 2's rule above: the picture was its edge and its absence does not create one.

**a11y.** Shared DOM order with **the picture last at both sides**. A real `<img>`, dimensions on the element, `loading="lazy"`. **The picture is not a link** at either treatment. **Nothing is measured against the picture**, which is this design's advantage over 7. At 200% text the halves stack in the phone's order.

**Flagged.** The 720 px text half and the padding-as-gutter, the derived crop and its 320 px floor, the tablet's 58% division and its column of actions, the phone's 32 px top padding, refusing Display 48 and the Contrast ground, the mount's `background` substitution, refusing a text tile and a clickable picture, and the hand-off to 2.

---

## 9. Big Type

The ask set large enough to be the section, flush left across the whole content width, a rule under it, the actions beneath. A4·6 at banner scale, and A6's only design above its own title ladder.

**Descriptor.** The only design above the category's title ladder, and the only one where the sub and the actions share a line under a full-width rule.

**Structural descriptor.** `stack · none · page · none · none · title at display scale`

**Archetype.** stack

**Behaviour module.** **none.** Fill width — the one thing here that would have needed a measurement — is refused, so both title scales are fixed sizes, the rule is a `border-top`, and the tablet's split of the shared line is a media query. Nothing to degrade.

**Items.** **None.** The title is the section, and a list under a 96 px line is a second section. `reasons[]` is kept and not drawn, as `note` is.

**Fields.** `title` (req, ≤ 90, **≤ 40 advised at Huge**) · `sub` · `primaryLabel` · `primaryUrl` · `secondaryLabel` · `secondaryUrl`. **No eyebrow is offered** — A4·6's refusal, carried: a 13 px tracked line above a 76 px one is a label on a poster. **`note` is kept and not drawn:** the line under the rule already holds two things.

**Controls.** **Title scale (Display 76 · Huge 96)** · **Rule under the title (Show · Hide**, the gap 40 → 28 at Hide, A5·6's logic; it sits mid-section and is not a divider, so it keeps its name) · **Sub under the rule (Show · Hide**, where **the actions keep the right end of the line**) · Actions · Member visibility, plus the universal trio (Vertical spacing keeping the **Compact advised at Huge** line — the type is already the space).

**Reconciled.** Padding and Ground retire into the trio. Title, sub and labels edit inline; both URLs open the Link Picker; the actions take optional icons.

**Fill width is not offered.** A4·6's third value measures the headline against its column and clamps it 64–160. A hero owns the top of a page; a banner sits between two sections, and a 160 px line in the middle of a page is louder than the page's own hero.

**The arrangement.** The title flush left across the full content width at line height 1.02 and tracking −0.035em (1.0 and −0.04em at Huge), the rule 40 px under it at full width, and **the sub and the actions sharing the line beneath** — sub left on 620, actions right, 64 px gutter. That shared line is this design's one addition to A4·6 and what keeps the section 380 px rather than 480.

**Responsive.** At 1080 and below **the sub and the actions stop sharing a line** — sub 28 px under the rule, actions 24 under the sub — and the title steps 76 → 52, 96 → 60. At ≤ 767 the title is **40 at Display and 44 at Huge**, the two values nearly converging and the sidebar saying so; rule 24 px under the title, sub 20 under the rule, the shared phone pair.

**Empty.** No sub, or Sub Hide → the actions alone at the right of the line. **The floor is a title and a primary**, 220 px of section. No title → the section does not render, the title being the design; the editor names 10 Slim.

**a11y.** **76 px is a size, not a level** — the same `<h2>` as every other design, so a page running this banner and a 40 px one has two h2s of equal standing. The rule is a `border-top`, never an `<hr>`. **The one design where DOM and visual order differ** — by one element, the actions sitting right of the sub — and both readings say terms then offer. At 200% text the arrangement is the tablet's; at 320 px the title wraps to four lines, which is why Fill width is refused.

**Flagged.** The shared sub-and-actions line and its 64 px gutter, refusing Fill width, the 40/28 rule gaps, the tighter line height and tracking, the tablet's split of the shared line, the phone's near-converged values, dropping the note field, and drawing a shorter authored title in the Huge frame with the reason stated.

---

## 10. Slim

One line of text and one action on a single row, at the tightest padding in the category. The design A6 names whenever a site has no title to write.

**Descriptor.** The only single-row design, on its own 20/28/36 padding scale and A1·1's button rather than A6's hero scale, and the only one that draws rules of its own by default.

**Structural descriptor.** `bar · none · page · none · none · one row between hairlines`

**Archetype.** bar

**Behaviour module.** **none**, and the absence is the design's whole boundary with A2. Rules are `border-top` and `border-bottom`, the dropped lower rule above the footer is a template condition, and the phone stack is a media query. **No `dismiss`:** this is a section in the flow, so there is no close control, nothing is written to storage and nothing is remembered between visits. Nothing to degrade.

**Items.** **None**, and the absence is the design: one line, one action. `reasons[]` joins `eyebrow`, `sub` and the secondary pair in the largest set of kept-and-unused fields in A6 — two rows of anything makes this 1 Centred at Compact.

**Fields.** `title` (opt, ≤ 90, **60 advised**) · `primaryLabel` (req) · `primaryUrl` (req) · `note`. **`eyebrow`, `sub`, `secondaryLabel` and `secondaryUrl` are kept and not drawn** — the largest set of kept-and-unused fields in A6, and the design's whole argument: one line, one action.

**Controls.** **Action style (Button · Text link)** · **Rule below (Show · Hide** — the lower of the bar's two rules, dropped directly above the footer whatever the value) · Alignment (Split · Centred, **Centred disabling the note**) · Note · Member visibility, plus the universal trio — **Vertical spacing resolving the bar's own 20 · 28 · 36**, and **Top divider defaulted Line** (the bar's upper rule, retired into it — the rules are what make one row a section). At Background role Surface or Contrast both rules drop as before: Rule below disables and Top divider locks None, reasons shown.

**Reconciled.** The old Rules control split into the universal divider and Rule below — a recorded conflict. Title, note and the action label edit inline; the URL opens the Link Picker; the button takes an optional icon.

**The row.** The line is the title at **21 px in the heading font** (A5·6's row title), the note 13 px under it, the action at the right with at least 48 px between them. **The action is A1·1's button at A1·1's size** — 14 px/600, 9×17 — the only design in A6 not at hero scale, because a 46 px button inside 28 px of padding is a button with a strip around it. At Text link the arrow is 14 px with a 44 px target extending past the label, and **the arrow does not move on hover**.

**The rules are what make it a section** rather than a stray row, and both default on here — Top divider Line, Rule below Show — where every other design draws no line of its own. **Directly above the footer the lower rule is dropped** whatever the value: two hairlines 96 px apart with nothing between them is a mistake a reader can see.

**Centred takes no note.** A 13 px line under the left half of a centred pair hangs off the composition, and centring it under both makes the row three lines tall, which is 1 Centred at Compact.

**Not A2 Announcement Bars.** A2 owns the strip at the top of the page: pinned above the header, dismissible, one per site, sometimes sticky. **This is a section in the flow** — it scrolls, it is not dismissible, it carries no close control, nothing is remembered in storage, and a page may hold two. The editor names A2·1 Rule and A2·2 Split for a site that wants the top strip.

**Responsive.** The row holds above 767 — padding 24, line 20, gap 32 at 834. **The design's limit is its line's length, not the window:** past about 60 characters the line wraps and the row grows to 78 px. At ≤ 767 it stacks — line, note, action — the button full width at **44 px rather than A6's 48**, the line 19 px, Alignment ignored; **at Text link the action keeps its natural width** with a 44 px target spanning the column.

**Empty.** No note → a line and an action, 76 px. **No title is a supported state here** — the bar is an action and its note, the section loses its accessible name, and the sidebar says so.

**a11y.** The line is the section's h2 at 21 px — size is not level in either direction. **The note is second in the DOM rather than last**, the one design where that holds, because here it reads as part of the line rather than as terms under a button. One tab stop; **the row is never a link**. Rules are `border-top` and `border-bottom`, not `<hr>`. No `role="alert"`, no live region, nothing remembered.

**Flagged.** The 20/28/36 scale, the drop to A1·1's button, the 21 px line, the 48 px minimum split, the rules as this design's default and their drop on a plane and above the footer, Centred disabling the note, the 60-character advice, the 44 px phone button, the note's place in the DOM, and the whole A2 boundary.

---

## 11. Reasons

The ask with up to three short lines saying what comes with it. Where A6 borrows A5·11's mark.

**Descriptor.** The only design with a repeating unit — up to three short marked lines that read stronger than the sub — and the only one that borrows A5·11's mark without its accent.

**Structural descriptor.** `stack · none · surface · few · none · marked reason lines`

**Archetype.** stack

**Behaviour module.** **none.** The list is a server-rendered `<ul>`, the mark at all three values is drawn from `currentColor`, and the tablet's forced Under the actions with its column of three is a media query. Nothing to degrade.

**Items.** `reasons[]` — the category's one list, and the design it was drawn for.

- **Add.** **Add reason** at the foot of the Reasons repeater. The new line arrives carrying a fact — “Every issue in the archive.” — and lands **last**: the bottom of the 424 px column at Beside the text, the right end of the row at Under the actions. **Disabled at three**, with the reason shown and **A5·11 Checklist with a section action** named — a fourth reason is where a banner becomes a feature set.
- **Remove.** On the row, undoable. **Down to one is supported rather than degraded:** one reason keeps its mark and its hairline and sits where the first of three would. Removing the last one hands off — the section renders as **1 Centred at Left**, the hairline going with the list, the sidebar naming it, and the repeater keeping Add reason with a line saying what the section draws until a reason exists. The field is kept, so nothing a site typed is lost by emptying the list.
- **Reorder.** Drag, or ⌥↑ / ⌥↓. Authored order is drawn order at both positions — top to bottom in the column, left to right in the row, top to bottom again in the tablet's column of three — and **order is meaningful to read and load-bearing for nothing**: no reason is privileged, none carries the accent, none is drawn larger, none is dropped at any width. Stated plainly rather than left to imply a hierarchy of facts.
- **Counts.** 1–3, **designed for three at both positions** — three 17 px lines in the 424 px column beside a 780 px title, or a row of three at 15 px under the hairline. **At two** the column is simply shorter than the text beside it, and the row of two is **centred on the section's axis rather than justified to the content width**, so two reasons do not read as a third that failed to load. **At one**, as above. **Four is refused at the control rather than re-arranged:** a row of four at 15 px is A5·11's two columns without its space. *Flagged: the two-reason centring is mine.*
- **Zero.** The design's stated empty state, in item terms: **no reasons → 1 Centred at Left**, named by the editor. No empty column, no orphan hairline, no placeholder mark, and no “add your first reason” line in the rendered section — that sentence lives in the sidebar.
- **Inside an item.** The reason's text, ≤ 40 characters (20 advised at Under the actions), and **nothing else** — no icon, no body, no link, no mark of its own. **No field inside a reason is optional**, so there is no empty-field appearance to draw: a reason whose text is cleared is not drawn at all and the sidebar counts it, because a mark with nothing beside it is a bullet pointing at nothing.
- **Not expressible, and stated as a boundary.** Mark writes one value onto the section, so “make the second reason an accent tick” cannot be asked for. Per the item rule that is a signal for two designs — and **A6 declines to add the second one**: a list whose lines carry their own emphasis is A5·11 Checklist with a section action, the same hand-off the fourth reason takes.

**Fields.** As 1, plus **`reasons[]`** — one to three, each ≤ 40 characters (20 advised at Under the actions), **text only: no icon, no body, no link**. This is the design that introduces the field; the rest of A6 keeps it and does not draw it. A fourth is refused and the editor names **A5·11 Checklist with a section action**.

**Controls.** **Reasons position (Beside the text · Under the actions)** · **Mark (Check · Dot · Rule · Custom icon** — Custom opens the P0·2 Icon Picker; section-level, never per reason) · Title size (**Display 48 unavailable at Beside the text**) · Actions · Member visibility, plus the universal trio (Background role defaulting Surface). **No alignment control:** Beside the text is left-aligned, Under the actions is centred, and the position decides it — a centred title next to a left-aligned list has two axes.

**The mark is `text-muted` at all four values and an accent mark is not offered.** **Custom icon — this pass — draws the picked icon in the mark's own 16 px box and colour**: the slot's Size and Colour rows are hidden, as on button icons, so the one-value-per-section rule and the accent refusal hold at the fourth value; an empty slot falls back to Check. A5·11 spends its accent once per entry because a checklist has no action under it; this design has an accent button 40 px away, and three accent ticks beside it is the accent spent four times. Geometry is A5·11's unchanged: 16 px box, 14 px gap, 3 px optical lift.

**The reasons** are A5·11's entry verbatim — 17 px body font at 500 — in a **424 px column on a 96 px gutter** at Beside the text; a row of three at 15 px, 24 px under a hairline, at Under the actions. **The reasons read stronger than the sub**, deliberately: `text` against `text-muted`, because they are the facts a reader came for.

**Responsive.** At 1080 and below **the position is Under the actions whatever the control says**, and the row of three becomes **a left-aligned column of three** under the hairline at 16 px — an arrangement that exists at 834 and nowhere else. Padding 80, title 34. At ≤ 767 one column, reasons 16 px with a 14 px mark, the hairline kept; this is the design's most common shape and its best one.

**Empty.** **One reason is a supported state** and keeps its mark and its hairline. **No reasons → the design is 1 Centred at Left**, the hairline gone with them, named by the editor.

**a11y.** A `<ul>` of `<li>`, **not headings** — 17 px at 500 is emphasis and the section already has its one heading. **The mark is `aria-hidden` at all values and nothing is a checkbox:** no role, no `aria-checked`, no input. **The list comes after the actions in the DOM at both positions**, including the one where it sits to their right: the reasons describe the offer the button makes. **No reason is ever a link.** Forced colours keep the marks, all three drawn from `currentColor` rather than glyphs.

**Flagged.** The three-reason cap and the 40-character field, moving the mark off the accent and refusing an accent value, the 424/96 division, the 17 px and 15 px sizes, the reasons reading stronger than the sub, dropping the alignment control, the tablet's column-of-three, and the hand-off to 1.

---

## 12. Pair

Two asks side by side, each with its own words and its own action. **The only design in A6 that spends the accent twice.**

**Descriptor.** The only design with two asks, two accent fills and no section heading — the section named by its eyebrow rather than by a title.

**Structural descriptor.** `split · none · page · few · none · accent spent twice`

**Archetype.** split

**Behaviour module.** **none.** Two columns, the plane-dependent gutter, the stretch to the taller of the two, the two divisions and the phone's horizontal hairline are grid and CSS. Nothing to degrade.

**Items.** **Two asks, and they are not a list.** Column one is `title` · `sub` · `primaryLabel` · `primaryUrl`; column two is `secondTitle` · `secondSub` · `secondaryLabel` · `secondaryUrl` — eight fixed fields in two groups, so **there is no repeater, no Add, no Remove, no cap and no minimum**. `reasons[]` kept and not drawn.

- **Why not a repeater.** A repeater would make three asks expressible, and three 411 px columns each with a button is a set of things with an action under it — **A5 Features owns that**, and the editor names it. The fixed pair is also what lets Division: Weighted to the first mean anything; a weighted repeater has no first.
- **Order.** Meaningful: column one takes the wider half at Weighted to the first, and **the phone stacks column one above column two.** **A one-click Swap asks action sits at the field-group head this pass**, exchanging the eight fields between the two groups — an editor operation, not a design control, so nothing about it varies per site or ships. *The old refusal is recorded in the Reconciliation notes.*
- **Inside an ask.** Its title, its sub, its action label and its action URL — content only. **The subs are the optional fields:** a column with no sub ends at its action and the planes still stretch to the taller of the two, so an unequal pair is honestly unequal. A missing `secondTitle` or second label is not an empty appearance but a hand-off — the design is 1 Centred, named.
- **Not expressible.** Column planes, Column title size, Actions and Alignment each write one value onto the section and apply to both asks at once. **“Make the paid column bigger” is refused by construction**, which is the same rule as the refusal of a recommended, default or featured marker: a site that needs one ask to win writes it with its words, and a site that needs the two compared is in A7.

**Fields.** `eyebrow` (above the pair, and **the section's accessible name**) · column one: `title` · `sub` · `primaryLabel` · `primaryUrl` · column two: **`secondTitle` (≤ 60) · `secondSub` (≤ 140)** · `secondaryLabel` · `secondaryUrl`. This design introduces the two `second*` fields and **reuses the secondary action's fields as the second column's action**, so a site switching from 1 keeps both labels and both URLs. `note` kept and not drawn: two columns of terms is a table.

**Controls.** **Column planes (Cards · Hairline between · None** — A5·4's Hairline plane at Cards, **the gutter following the plane**: 32 at Cards, 80 at the other two) · Division (Even halves 632/632 · Weighted to the first 780/440, 3 Split's, unavailable at 1080 and below) · **Column title size (Medium 28 · Large 34** — one step below A6's ladder, since there are two of them) · **Actions (Button · Text link, one control for both columns)** · Alignment (Left · Centred) · Member visibility, plus the universal trio — Vertical spacing the section's (**the cards' own padding stays fixed at 48**, 32 at 834, 24 on a phone), Contrast unavailable in Background role (two accent fills on an inverted band are 3.2:1 each — the accent budget's own arithmetic).

**Reconciled.** **Swap asks lands at the field-group head** — one click exchanges the eight fields between the two groups, an editor operation, not a design control; the old refusal loses and is recorded. Both titles, both subs and both labels (`secondTitle` and `secondSub` included) edit inline; both URLs open the Link Picker; both actions take optional icons. The per-column styling refusals are untouched.

**Two accent fills, and the section says why.** The two actions are the same offer at two prices; making one a ghost link would tell a reader which to pick, and that is a decision the site makes with its words. Where the two asks are not really alternatives the editor names Actions Text link, which spends no accent at all, or 1 Centred with a secondary. **A button beside a ghost link is not offered:** that is 1 Centred with a divider drawn down the middle of it.

**No section title.** A title over two titled columns is three headings in 400 px, and the columns are the asks. **The columns stretch to the taller of the two and their text stays at the top** — A5·4's row-stretch rule — so two asks of unequal length are honestly unequal.

**Responsive.** **Two columns hold at 834** — 355 px a card, padding 32, gutter 24, title 24, body 16, buttons at their natural width rather than full-card; Division unavailable. At ≤ 767 one column, **16 px between cards** (A5·4's phone gap), padding 24, both buttons full width inside their own cards — **the loudest thing A6 puts on a phone**, and the sidebar says so at the Actions control. **At planes None and Hairline between a horizontal hairline appears between the two asks**, the vertical divider becoming a horizontal one rather than disappearing.

**Empty.** No `secondTitle` or no second label → **the design is 1 Centred**, named. No sub in one column → that column ends at its action and the planes still stretch. No eyebrow → the section loses its accessible name and the editor says so.

**a11y.** **The one design in A6 with no section heading:** the section takes `aria-label` from the eyebrow's text, the only `aria-label` on a section in the category. The columns are a `<ul>` of two `<li>`, each with an h2 — a reader hears “list of 2 items” before the first ask. **Not a table, no group role, nothing comparable across them** — A7 Pricing and Tiers owns comparison, and the editor names it where a site starts writing matching lists in both columns. **Neither ask is recommended, default or featured:** no `aria-current`, no badge, no ribbon.

**Flagged.** The two `second*` fields and reusing the secondary action for column two, spending the accent twice and the argument for it, the plane-dependent gutter, the fixed 48 px card padding, the 28/34 column ladder, one Actions control for both columns, refusing a per-column action style and any recommended marker, the phone's horizontal hairline, and the `aria-label` exception.

---

## 13. Overlap

A card that crosses the footer's top edge, so the last ask on the page and the end of the page are one object. Settlement 3 built rather than ruled, and **the only design in A6 with a precondition.**

**Descriptor.** The only design with a precondition, and the only one that crosses another section's edge — a card whose bottom sits over the footer's top, with the footer's padding absorbing it.

**Structural descriptor.** `stack · card · page · none · none · card crossing footer edge`

**Archetype.** stack

**Behaviour module.** **none.** A negative bottom margin on the card and matching top padding on the footer: no transform, no absolute positioning, no fixed heights and no measured card, as the mechanics say. The precondition — last section on the page, footer ground differing — is resolved in the template, not at runtime. Nothing to degrade; the join is identical with JavaScript off.

**Items.** **None**, as 4 Card. The card crosses an edge; nothing inside it repeats. `reasons[]` kept and not drawn.

**Fields.** As 4 Card.

**The precondition,** stated on the frame, in the panel and here: the design must be **the last section on the page**, and **the footer's ground must differ from the card's**.

- Not last → the overlap is dropped and **the design is 4 Card at Raised**, with the editor naming the section below.
- Footer ground matching → **the card steps to the hover surface** and keeps its hairline (4 Card's Tinted treatment as a substitution rather than a choice).
- Footer is A3·5 Contrast Band or A3·14 Image Band → the design at its best; on A3·14 the card **keeps its md shadow in both modes**, a photograph not being a ground a hairline reads against.
- Two overlapping sections on one page (with A4·18's hero card) → allowed, and advised against once.

**Controls.** Card padding (48 · 64 · 88, 4 Card's; the section's own fixed at 96) · Inset (16 · 40 · 72, A4·8's) · **Overlap (Shallow 48 · Standard 88)**, absolute rather than proportional, **clamped to 40% of the card's height** — A4·18's ceiling, carried — with Standard behaving as Shallow on a short card and the sidebar saying so · Title size · Actions · Alignment · Member visibility, plus the universal trio — **Background role locked at Background and Vertical spacing locked at 96**, as 4, reasons shown. **No treatment control: the card is always Raised**, since it sits over an edge.

**Reconciled.** Member visibility composes with the precondition: a section hidden for an audience drops the overlap and the footer's padding returns to its own value, server-side. Every text edits inline; both URLs open the Link Picker; the actions take optional icons.

**The mechanics.** A negative bottom margin on the card and **matching top padding on the footer** — its own value plus the overlap — so the footer's first row always has 44 px of clear ground beneath the card. No transform, no absolute positioning, no fixed heights; the card grows with its content and the footer's padding follows. **The footer draws on the hover surface** for the join to be visible, which is this design asking something of a section it does not own.

**Responsive.** At 1080 and below 4 Card's steps apply and **the overlap steps with them: 88 → 64, 48 → 40**, the footer's top padding following. At ≤ 767 **the overlap is fixed at 32 and the control is ignored** — a 318 px card 460 tall would give 88 px of overlap a fifth of the visible page — and the card keeps its 16 px inset inside the page's 20. The 40% ceiling is a proportion and holds at every width.

**Empty.** As 4. No primary → no section and no card, and the footer's padding returns to its own value.

**a11y.** **The overlap is visual only** — `<section>` then `<footer>`, adjacent and complete, neither containing the other, nothing about the join in the accessibility tree. The card is a `<div>`. **The footer's first row never sits under the card**, checked against the grown card at 200% text. The card against the footer's ground is **1.1:1 light and 1.2:1 dark** — the honest number; the hairline and the shadow carry the join, and the hairline alone in forced colours. Reduced motion changes nothing: the overlap is a position.

**Flagged.** The two overlap values, carrying A4·18's 40% ceiling and clamping rather than refusing, the footer's absorbed top padding and the 44 px clear row, requiring the footer's ground to differ and the hover-surface substitution, the phone's fixed 32, fixing the card at Raised, and the whole precondition and its hand-off to 4.

---

## 14. Members

The signup ask with its sign-in line, and **the one design in A6 that reads Ghost's member state.**

**Descriptor.** The only design that reads Ghost's member state, and so the only one with three states — including one where the section does not render at all.

**Structural descriptor.** `stack · none · surface · none · none · member state switches copy`

**Archetype.** stack

**Behaviour module.** `member-form`, **and only at Signup: Inline form** — 6 Inline Form's row unchanged and unextended. At Signup: Portal button the design declares nothing. Edit-safe. **JS off:** “The `<form>` posts natively to Ghost's members endpoint; Ghost's own server response replaces the designed sent state.” **The three member states need no module:** they are rendered on the server, the other states' markup is not in the page, nothing is swapped after load and there is no announcement to make. **Portal is not a module and cannot be one** — it is Ghost's own script, not the theme's — so with JavaScript off `#/portal/signup`, `#/portal/signin` and `#/portal/account/plans` resolve as fragments against the current page and no modal opens. Stated as a finding for the architect rather than given a fallback; the closest registry module is the `member-form` already declared at the other signup value.

**Items.** **None**, at both signup values. **The three member states are states, not items:** each is chosen on the server, nothing is added to them, nothing is reordered, and the paid member's unrendered section is an absent section rather than an empty list. The sign-in line is fixed copy plus a Portal link, not an authored item, and the form is one field. `reasons[]` kept and not drawn.

**Fields.** As 1, plus **`memberTitle` (≤ 90) · `memberSub` (≤ 180) · `upgradeLabel` (≤ 24) · `signinLine` (≤ 60, this pass — default "Already a member? Sign in", kept)**, and the five shared `newsletter*` fields at Signup Inline form, inheriting the site's copy (6's per-section override is 6's alone). `secondaryLabel` and `secondaryUrl` are kept and not drawn: the sign-in line is its own field plus a Portal link, not the secondary pair.

**Data — and only this:** whether the reader is signed in, and whether their subscription is paid. **Not the reader's name, tier name or join date.** Three states:

- **Visitor** — the authored content. The state the editor previews.
- **Signed-in free member** — the `member*` copy, the upgrade action, **no form and no sign-in line**. A signed-in reader has already given their address; a field asking again is the clearest way a theme can say it does not know them.
- **Paid member** — **the section does not render.** Nothing to ask for, so nothing is drawn and the page is shorter.

**Members off in Ghost** → visitor state only, no sign-in line, the primary linking to the site's subscribe page (A3·4's substitution).

**Controls.** **Signup (Portal button · Inline form** — 6 Inline Form's row and its four states, unchanged and unextended) · **Sign-in line (Under the action · In the action row · Hide**, unavailable in the member state) · Title size (one value for both states) · **When a member is signed in (Show a members line · Hide the section)**, plus the universal trio (Background role defaulting Surface, **Contrast unavailable at both signup values**, so the two look like one design). **No Member visibility — the three-state model subsumes it**, A6's one exemption, per the audit.

**Reconciled.** **The sign-in line is an editable field now** — `signinLine`, default kept, edited inline with P0·1; its link is the picker's Portal · Sign in action. **`upgradeLabel`'s target defaults to Portal · account/plans and opens the Link Picker for override** — a site may route upgrades to its own pricing page; A7 still owns tiers and prices, and no tier name enters a label by data. `memberTitle` and `memberSub` edit inline in the member state through the P0·6 switcher; every Portal target is the picker's action, no literal fragment shipping.

**The Portal hand-off.** The Link Picker's Portal actions — Sign up, Sign in, and account/plans for the upgrade, the last overridable in the picker. **The banner draws nothing of Portal** — no modal, no fields, no states, no confirmation — and **does not manage, trap or return focus into its dialog**, since Portal owns it and a theme reaching in is how two focus traps end up fighting. It **never names a tier or draws a price comparison**: A7 owns those and Portal owns the transaction; a price in a label is the site's words in a field, not data.

**The sign-in line is a third form of secondary action** — “Already a member? Sign in”, one sentence with one link (an editable field this pass, default kept), the question muted and the link in `text` with a permanent underline — allowed because it is a correction for a misidentified reader rather than an alternative offer. At In the action row the question is dropped and the link becomes A1·1's ghost action. **The primary says “start reading” rather than “sign up”** because Portal's own modal says sign up on the button a reader meets next.

**Responsive.** 834: padding 80, title 34; at Inline form the row holds and the field steps one value down; **the sign-in line sits below the form's note** — form, terms, then the way out, an order that holds at every width. ≤ 767: primary full width at 48 px; field and button a row each; **the sign-in line keeps its sentence** on its own 44 px row, and In the action row behaves as Under the action.

**Empty.** No `memberTitle` at Show a members line → the section behaves as Hide the section for signed-in readers, and the editor says so.

**a11y.** Portal actions are **real links, not buttons** — they change the URL and Portal opens on the fragment, so a reader can middle-click them. The sign-in link's target is 44 px. **The state is rendered on the server and the other states' markup is not in the page** — no `hidden` copies, no live region, nothing swapped after load, and therefore no announcement to make. **Membership is never exposed as a state, badge or role.**

**Flagged.** The three-state model and the paid member's empty section, the three `member*` fields, the sign-in line as a third secondary form and its three positions, “start reading” rather than “sign up”, refusing the form in the member state, refusing the Contrast ground at both signup values, the server-render rule, and the boundary that leaves Portal's dialog alone.

---

## 15. Signature

The ask written in the first person and signed by the person making it. The only design in A6 whose copy has an author.

**Descriptor.** The only design whose copy has an author — a portrait, a signed name and a role sitting above the actions, and the only place A6 puts anything before the actions in the DOM.

**Structural descriptor.** `stack · none · page · none · left · signed name and portrait`

**Archetype.** stack

**Behaviour module.** **none.** Portrait, rule, name and role are server-rendered; the initials fall-back is a template condition on a missing file rather than a script; the 1080 step of Circle 96 to 64 and the phone's 56 px portrait above the words are media queries. Nothing about the portrait is a state. Nothing to degrade.

**Items.** **None.** `portrait`, `signerName` and `signerRole` are three fields about one person, not a repeater: a second signature is two people asking, which is 12 Pair's shape rather than this one. `reasons[]` kept and not drawn.

**Fields.** As 1, plus **`portrait` (≥ 200 px square) · `signerName` (req, ≤ 40) · `signerRole` (opt, ≤ 40)**. **`note` is kept and not drawn:** the signature is what sits under the words. **No `portraitAlt` exists** — the alt is always empty, the name being beside it in text (A1·6's rule at 96 px). **The signer may come from Ghost this pass — Signer source (Authored · Ghost staff user), the owner's ruling:** bound, `signerName` ← the staff user's name (plain-text-locked, "Edit in Ghost") and `portrait` ← their profile image, the initials circle when they have none; `signerRole` stays authored — Ghost staff users carry no public role field. **Authored stays the default**: a banner on a page has no author, and binding is the one-person site's shortcut, not a claim of authorship.

**Controls.** **Portrait (Circle 64 · Circle 96 · None** — two sizes, both circles, no square and no rounded rectangle) · **Portrait position (Beside the text · Above the text**, the latter centred with the portrait fixed at 64 and **the eyebrow moving under it**, the one place in A6 the eyebrow is not first) · Title size (**Medium 34, the default here and nowhere else in A6** · Large 40 · **Display 48 unavailable** — a first-person sentence at 48 px is a slogan with a photograph next to it) · Actions · Member visibility, plus the universal trio (Contrast unavailable in Background role — a portrait on an inverted band needs a scrim or a border the packs do not define, and a first-person note on a band is a poster) — and **the Data group: Signer source (Authored · Ghost staff user)**.

**Reconciled.** Image focus rides in the portrait's Image Picker popover — Centre · Top · Bottom against the square crop. Signer name and role edit inline when authored; bound, the name shows the plain-text lock pill. Eyebrow, title, sub and labels edit inline; both URLs open the Link Picker; the actions take optional icons.

**The signature is A1·6's avatar and meta row, moved and grown.** A1·6 sets a 24 px circle with “Name · date” at 13 px beside it; here the circle leaves the row to become the portrait and the name and role take its place as two lines — **15 px at 600 and 13 px muted behind a 40 px rule** that stands in for the pen stroke. It sits **above the actions** at both positions: a reader should know who is asking before they are asked. Neither name nor role is a link and there is no “more from this author” — **A21 Author Showcases owns the author as a subject**, and here the person is the reason for the ask rather than its object.

**At Portrait None the rule, the name and the role all stay** — the signature is the design and the photograph is its illustration, the opposite of 8 Image Split. A missing file is **A1·6's initials circle at the set size**, initials from the name. The portrait is **top-aligned to the title and never centred against the text**, so a 96 px circle does not drift down the page as a site edits its copy. Nothing about the portrait is a state: it is not a link and does not respond to a pointer.

**Responsive.** At 1080 and below **Circle 96 steps to 64 and the size control is unavailable** — 96 plus a 40 px gutter takes 136 px of 754 — gutter 40 → 28, title 30, padding 80. At ≤ 767 **the portrait is always above the text at 56 px, left-aligned**, both portrait controls ignored, title 26, the shared phone pair.

**Empty.** No `signerRole` → the name alone beside the rule. **No `signerName` → the design is 1 Centred at Left**, portrait and rule dropped with it: a signature without a name is a photograph.

**a11y.** The portrait is an `<img alt="">`, not authorable; the initials fall-back is `aria-hidden`. **The signature is two paragraphs, not a heading and not a `<cite>`**; the rule is a border, never an `<hr>`. **Nothing is marked up as an author** — no `rel="author"`, no microformat, no author link. **The DOM order puts the signature before the actions**, A6's only departure from its shared order. At 200% text the portrait goes above the words in the phone's arrangement.

**Flagged.** The three fields and the absent alt, growing A1·6's avatar to 96 and splitting its meta into two lines, the 40 px rule, Medium as the default and refusing Display, the two circle sizes and refusing any other shape, the eyebrow's move at Above the text, keeping the signature at Portrait None, the top-aligned portrait, the phone's 56 px left-aligned portrait, and the DOM order.

---

## Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fifteen checked against each other; no two are the same, and every emphasis phrase is four words or fewer.

| # | Design | Tuple |
|---|---|---|
| 1 | Centred | stack · none · page · none · none · centred axis, nothing added |
| 2 | Flush Left | stack · none · page · none · none · hairline above the stack |
| 3 | Split | split · none · surface · none · none · right-aligned actions column |
| 4 | Card | stack · card · page · none · none · inset surface card |
| 5 | Contrast Band | stack · none · contrast · none · none · inverted ground, carried fill |
| 6 | Inline Form | form · none · surface · none · none · field replaces the actions |
| 7 | Full Bleed Image | media frame · none · image · none · full-bleed · flat 56% scrim |
| 8 | Image Split | split · none · page · none · right · unscrimmed picture half |
| 9 | Big Type | stack · none · page · none · none · title at display scale |
| 10 | Slim | bar · none · page · none · none · one row between hairlines |
| 11 | Reasons | stack · none · surface · few · none · marked reason lines |
| 12 | Pair | split · none · page · few · none · accent spent twice |
| 13 | Overlap | stack · card · page · none · none · card crossing footer edge |
| 14 | Members | stack · none · surface · none · none · member state switches copy |
| 15 | Signature | stack · none · page · none · left · signed name and portrait |

**Containment is `none` thirteen times.** Only **4 Card** and **13 Overlap** are contained: in both the whole section sits on one plane inset from the page margin with page ground visible around it. **12 Pair is `none`, and it is the slot most likely to be got wrong in this category** — its Column planes: Cards value draws two cards, but those are the two asks' own geometry, not the section's; the section is a bare band on the page's ground with two cards standing in it. **5 Contrast Band and 7 Full Bleed Image both offer Band edges: Page margin**, which reads as a box; that is a control value on a design whose drawn default is full bleed, not a second design. `box` and `pill` are unused: nothing in A6 is a hairline box — A1·12 owns that — and nothing is a capsule.

**Ground does the most separating in A6**, which is what §0's three-grounds settlement implies. `page` on 1, 2, 4, 8, 9, 10, 12, 13, 15; `surface` on 3, 6, 11, 14 — the stated default in each of those four control lists, never the control's full range; `contrast` on 5, where the inversion is the design rather than a setting; `image` on 7 alone. **1 Centred offers Contrast as a control value and is still `page`** — that value and 5 Contrast Band are not the same design, which is the argument 1's own control note makes. `transparent` and `accent` are unused: every A6 section has a ground of its own, and the accent is spent on the button, never on a plane.

**Item-count is `none` thirteen times** — the repeating unit in A6 is nothing, a banner being one ask. **11 Reasons is `few`**: one to three marked lines, a fourth refused and handed to A5·11 Checklist. **12 Pair is `few` at exactly two.** One reason is a supported state and does not make 11 `one`: the class is what the field admits, not what an author happens to type. `many` and `variable` are unused, and the three-reason cap and the fixed pair are why.

**Media placement is `none` twelve times.** Three designs carry a picture: **7** is `full-bleed`, the photograph being the section's height; **8** is `right`, its drawn default with Left as a control value and grid placement rather than a source reorder; **15** is `left`, the portrait beside the text at its drawn position. 5 Contrast Band keeps `image` as a field and does not draw it, which is why it is not in that list, and 6 and 14 draw a field rather than a picture.

**The close pairs, stated rather than left to trip someone.** **1 Centred, 2 Flush Left and 9 Big Type share `stack · none · page · none · none`** and separate on the sixth slot alone — nothing added, a hairline above the stack, a title above the ladder. That is the honest reading: all three are the same stack on the same ground, and the device *is* the design in each case. **4 Card and 13 Overlap share `stack · card · page · none · none`** and separate on the overlap, which is exactly what 13's precondition says it is — 4 Card with its bottom edge crossing the footer's, and 4 at Raised is where 13 falls back when the precondition fails. **3 Split and 8 Image Split** are both `split` and differ on two slots, ground and media. **11 Reasons and 14 Members** are both `stack · none · surface` and differ on item count and device.

**Not used as a separator.** Padding, Title size, Actions, Alignment, Secondary style, Measure, Division, Band edges, Card treatment, Inset, Text position, Picture side, Picture treatment, Rules, Signup and Sign-in line never appear in a tuple: they are controls, and two designs that differ only by a control setting are one design. Neither do the hand-offs — that 7, 8, 11, 12 and 15 resolve to 1 Centred or 2 Flush Left when a picture, a list or a name is absent is a fallback, not a structure.

---

## Behaviour modules — roster

One of the registry's 31, and nothing coined. `member-form` on the two designs that draw a field; thirteen designs declare nothing, which is what fifteen resting states should look like.

| # | Design | Modules | Note |
|---|---|---|---|
| 1 | Centred | none | the Contrast value is a token substitution, not a state |
| 2 | Flush Left | none | the rule is a `border-top` |
| 3 | Split | none | the 1080 hand-off is a media query |
| 4 | Card | none | treatments, dark shadow drop and forced-colours collapse are CSS |
| 5 | Contrast Band | none | the light-in-dark band is a token pair |
| 6 | Inline Form | `member-form` | the only script in the category |
| 7 | Full Bleed Image | none | background, wash and the 62% phone scrim are CSS |
| 8 | Image Split | none | `<img>` with dimensions and `loading="lazy"`; the 320 px floor is a template condition |
| 9 | Big Type | none | Fill width refused, so no measurement |
| 10 | Slim | none | **no `dismiss`** — the whole A2 boundary |
| 11 | Reasons | none | marks drawn from `currentColor` |
| 12 | Pair | none | the plane-dependent gutter is CSS |
| 13 | Overlap | none | negative margin plus the footer's absorbed padding |
| 14 | Members | `member-form` at Signup: Inline form | three states server-rendered; Portal is Ghost's script |
| 15 | Signature | none | the initials fall-back is a template condition |

**Findings, not gaps.**

- **Portal has no module and cannot have one.** 14 Members' `#/portal/…` links are real `<a href>` fragments handled by Ghost's own Portal script; with JavaScript off nothing opens. The registry covers the theme's JavaScript, and Portal is not the theme's. Named here for the architect; the closest module is `member-form`, which 14 already declares at its other signup value.
- **14's three member states need no module, and that is a property worth recording.** The state is chosen on the server and the other states' markup is never in the page — no `hidden` copies, no swap after load, nothing to announce.
- **6's invalid, submitting and done states sit inside `member-form`** rather than beside it: with JavaScript on the module owns them, and with it off the registry's sentence governs — Ghost's own response replaces the designed sent state. The 104 px reserved height is the design's and applies only to the scripted path.
- **10 Slim's absence of `dismiss` is a stated boundary, not an omission.** A2 owns the dismissible strip; a section in the flow carries no close control and writes nothing to storage.
- **13 Overlap asks something of the footer** — its top padding absorbs the overlap — which is a template contract between two sections rather than a module. Nothing runs; nothing degrades.

---

## Item lists — roster

One repeater in the category, drawn by one design; a second design draws two of something and it is not a list.

| # | Design | Items | Note |
|---|---|---|---|
| 1 | Centred | none | where 11 resolves when its list is emptied |
| 2 | Flush Left | none | the empty right half is the arrangement |
| 3 | Split | none | the actions column is three fixed elements |
| 4 | Card | none | one card, one ask |
| 5 | Contrast Band | none | reasons on a band is 11 at Ground Contrast |
| 6 | Inline Form | none | one input; the four states are states |
| 7 | Full Bleed Image | none | one photograph, and no gallery in A6 |
| 8 | Image Split | none | one picture beside one ask |
| 9 | Big Type | none | a list under 96 px is a second section |
| 10 | Slim | none | one line, one action — the whole argument |
| 11 | Reasons | **`reasons[]`, 1–3** | the design the list was drawn for |
| 12 | Pair | **two asks, eight fixed fields** | not a repeater; a third ask is A5's |
| 13 | Overlap | none | as 4 Card |
| 14 | Members | none | three server-rendered states, not items |
| 15 | Signature | none | three fields about one person |

**Findings, not gaps.**

- **Thirteen “none”s are the category's shape, not thirteen omissions.** A6's tuples say item-count `none` thirteen times; the item pass says the same thing in the sidebar's terms, and the two readings agree by construction rather than by checking.
- **The 40-character cap is what keeps `reasons[]` a list.** A reason with a body and a link is A5's item, and the field's shape — text only, no icon, no link — is what stops 11 Reasons drifting into A5·11 Checklist with a banner's padding.
- **11's hand-off runs in both directions and neither loses content.** Emptying the list renders 1 Centred; a fourth reason names A5·11. In both cases the authored field is kept, which is why neither is a warning.
- **12 Pair's refusal of a swap control is the only place A6 asks a site to move text by hand.** Named here so the architect can decide whether a two-group swap belongs in the editor's general behaviour rather than in this design.
- **No item control in A6 needs JavaScript at runtime.** Add, Remove and Reorder are editor operations; what ships is a server-rendered `<ul>` of one to three `<li>`, which is why 11 Reasons still declares no module.

## Category artefacts

In `A6-0 Category Proof.dc.html`:

- **The four settlements** §8 asks A6 to make — the three grounds and the accent budget in each; one action or two and what the second may be; how a banner reads immediately above the footer; inline form versus link-out and the Portal hand-off. **All four answers are invented**, and each is flagged there, on the frames that draw it, and in this document.
- **The ladders** — the title's, the action's, and the four padding scales with the designs that use each.
- **The rules all fifteen share** — structure, labels, DOM order and its three exceptions, the note, motion, focus, data, empty, and the fact that A6 has no behaviours at all.
- **The roster** — all fifteen, what each is for, what it settles, and where its accent goes.
- **The shared field list** — twenty fields of its own plus the five `newsletter*` fields it borrows from A3·4, with types, caps, which designs draw each, and three stated refusals: no third action, no countdown field, no price or tier.
- **The tokenisation proof** — 4 Card in Paper, Tangerine and Ink, light and dark, six frames, with only tokens changing. The two dark accents are **derived there rather than taken from a pack definition**, and flagged.
- **The stress frame** — six caps at once on 4 Card: a 27-character eyebrow, a 106-character title at Display 48, a 178-character sub, a 24-character primary beside a 24-character secondary, an 84-character note, and Spacious 88 inside Snug 16. With the mobile frame and what the editor says about each.
- **The consistency pass** — written after all fifteen were drawn: what was checked, the six things that were wrong, the pattern in them, and the note that **no frame in A6 has been built**, so every ratio quoted is computed from hex values rather than measured. Every control list in this document was rewritten from its drawn panel as part of it; where the two ever disagree again, **the drawn panel is the authority**.

## Hand-offs out of A6

| Boundary | Owner |
|---|---|
| A strip pinned at the top of the page, dismissible, one per site | A2 Announcement Bars |
| Anything that counts down, rotates or is dismissed | A2·6 · A2·9 · A2·11 |
| The site's subscribe form in the footer | A3·4 Newsletter Band |
| The page's first ask, at the top of it | A4 Heroes |
| A set of things with an action under it | A5 Features |
| Anything a reader compares — plans, tiers, feature matrices | A7 Pricing and Tiers |
| A named person as the subject | A21 Author Showcases |
| The newsletter section proper, with its own head and terms | A22 Newsletter |
| Access, membership and what a reader may see | A32 Paywall |

---

## Reconciliation notes

**Frames changed in this pass.** All fifteen control-panel frames — Padding rows retired into Vertical spacing and Ground rows (1, 2, 3, 6, 8, 9, 10, 11, 14, 15) into Background role; the universal trio drawn outside each list, locked with the reason shown on 4, 5, 7 and 13, Contrast disabled with its reason on 2, 6, 8, 12, 14 and 15; Member visibility drawn on all but 14; 2's Rule above and 10's Rules retired into Top divider, 10 gaining a Rule below control; 11's Mark redrawn with Custom icon; 12's Swap asks drawn at the field-group head; 14's sign-in-line and upgrade notes drawn; the Data group drawn on 7 and 8 (Content source) and 15 (Signer source); Image-focus notes drawn on 7, 8 and 15; 6's signed-in control and newsletter-override note drawn; every footer count updated; a Reconciled card added to every spec block. **One section frame changed: 6 Inline Form's inline-versus-link-out card gains the signed-in members-line state** — the pass's one visible-content addition. No other section frame was redrawn, and no "Preview" control existed in A6 to remove.

**Conflicts with earlier rulings, one line each.**

1. **§0's "Nothing in A6 comes from Ghost except 14 Members"** — loses three times to owner rulings: Content source on 7 and 8, Signer source on 15; everything bound is plain-text-locked, and the other designs stay authored-only.
2. **2's Rule above** — retires into the universal Top divider, defaulted Line here; the page-margin rule and the never-two-lines advice survive as the divider's advice line, not as a control of its own.
3. **10's Rules control** — splits: the upper rule is the universal Top divider (defaulted Line, the second and last design to default it on), the lower a Rule below control keeping the above-the-footer drop; the plane values still drop both, now stated as the divider's lock and the control's disable.
4. **12's refused swap control** — loses: Swap asks ships at the field-group head as an editor operation, not a design control; the per-column styling refusals it protected are untouched.
5. **14's "the sign-in line is fixed copy"** — loses: `signinLine` is an editable field with its default kept; the line remains a correction rather than an alternative offer, and In the action row still drops the question.
6. **14's fixed upgrade target** — `account/plans` stays the default and opens the Link Picker for override; A7 still owns tiers and prices, and no tier name enters a label by data.
7. **15's "Nothing comes from Ghost, including the person"** — loses to Signer source: bound, name and portrait come from a chosen staff user; the role stays authored (Ghost staff users carry no public role field), and Authored stays the default.
8. **7's `imageFocus` as "a field rather than a control"** — reconciled into the Image Picker popover per ground rule 10; the same popover carries it on 8 and on 15's portrait.
9. **6's "the error line is fixed copy"** — it ships as a theme translation-catalog string now, with the Members-off substitution label: a fixed English string cannot ship, and a field cannot match what Ghost rejected.
10. **6's five shared `newsletter*` fields** — "change them once and all three follow" survives as the default (Inherit from site) rather than the rule: the per-section override lands on 6 alone, and 14's form keeps inheriting. *Flagged: leaving 14 shared-only is mine.*
11. **5's and 10's padding scales** — survive as Vertical spacing's resolutions (44 · 64 · 88; 20 · 28 · 36); 4's and 13's fixed 96 becomes the trio's lock with the reason shown; Card padding, Inset, Overlap and Band edges keep their names as genuinely different ladders.
12. **11's three-value Mark** — the section-level rule holds and the value set grows: Custom icon opens the Icon Picker, the icon drawn in the mark's own box and colour, the slot's Size and Colour rows hidden as on button icons; an accent mark is still not offered, and "no per-line mark" stands.
13. **The `#/portal/signup` literal** — retired everywhere for the Link Picker's Portal actions, so a site can retarget its asks without new fields; the no-JS finding is unchanged — the picker still writes Portal fragments as real `<a href>` values.
14. **6's signed-in behaviour** — new, not a conflict, and needs no module: the members line is rendered on the server exactly as 14's states are, `member-form` stays the only declaration in A6, and nothing in this pass required **ARCHITECT: registry addition**.
15. **The six-control norm** — footers now read "N controls + the universal trio" (+ the Data group on 7, 8 and 15); all fifteen stay under the lifted ~15 ceiling plus the three universal controls and the Data group, and Quick Controls stay the 3–5 highest-impact per design.
16. **A6-0 Category Proof** — predates this pass (the trio, Member visibility, the Data groups, the retired literal, `membersLine` and `signinLine` in the shared field list); it was not redrawn, and per the consistency rule the drawn panels are the authority until it is.
17. **The Portal finding stands** — Portal is Ghost's script, not a module; with JavaScript off its fragments still resolve against the current page and no modal opens. Nothing in this pass touched it, and no module name was coined.
