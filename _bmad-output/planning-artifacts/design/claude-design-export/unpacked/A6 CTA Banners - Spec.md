# A6 CTA Banners — written specification

15 designs · Paper pack · drawn in this project as `A6-1 Centred.dc.html` … `A6-15 Signature.dc.html`, with the category's shared artefacts in `A6-0 Category Proof.dc.html`.

Read `A6-0` first. It carries the four settlements §8 asks A6 to make, the ladders, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**.

---

## 0. The shared floor

Everything in this section applies to all fifteen unless a design says otherwise.

**The frames draw the banner with the footer's top edge beneath it.** A5 drew its sections alone on the page ground because a feature set has an ordinary section above and below it. Most CTA banners are the last thing before the footer, §8 asks what that looks like, and a frame that left the footer out would answer the question by omission. Where a design's rule concerns its neighbour more deeply — 13 Overlap's join, 10 Slim's dropped rule — the whole footer is drawn and the caption says so.

**Colour.** Role tokens only — `background`, `surface`, `text`, `text-muted`, `border`, `accent`, `contrast`. **The accent is spent once per banner, on the button**, and the budget falls as the ground gets louder: once on `background`, `surface` and a card; once on a photograph, where the button is the only opaque object over it; **nothing on an inverted band**, where an accent fill carrying the band's colour is 3.2:1 in Paper. **12 Pair is the one exception and spends it twice**, at Actions Button, and says why. **There is no outlined action anywhere in A6.**

**The title ladder is A5's head ladder, unchanged** — Medium 34 · Large 40 · Display 48 at 1440, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390 — because a banner is a section head with an action under it. Title measure 780, sub 17 px muted on 620. Eyebrow 13 px uppercase tracked `.08em` in `text-muted`. Four designs refuse Display 48 (3, 8, 11 at Beside the text, 15) because their title has a column rather than a page. **9 Big Type is the ladder's one exception** at Display 76 · Huge 96, and it is a design rather than a control for that reason. 10 Slim's line is 21 px; 12 Pair's column titles are 28 / 34.

**The action is A4's hero-scale button** — accent fill, 15 px/600, padding 13×22, 46 px tall, the pack radius — one step above A5's mid-page button, on the argument that this section exists for its action. **Flagged as a departure**, as A5's own step down was. **10 Slim is the only design that steps back** to A1·1's 14 px/600 and 9×17.

**Actions is one control, two values: Both · Primary.** A4's words minus its third. **Actions None is not offered anywhere in A6** — a banner with no action is a section head, and A5 owns those. **The secondary is allowed to be two things:** A1·1's ghost action at the primary's size, or a text link with a typed arrow. Never a second fill, never an outline, never a twin. Two exceptions, both stated where drawn: 14 Members' sign-in sentence (a correction, not an alternative offer) and 12 Pair (two equal asks are two columns).

**Padding.** Section Compact 64 · Comfortable 96 · Spacious 132 at 1440, 80 at 834, 64 at 390 — A4 and A5's values. Band 44 · 64 · 88 (A4·9's, on 5). Card 48 · 64 · 88 (on 4, 13, and fixed at 48 for 12's cells). Bar 20 · 28 · 36 (on 10). **Where a design controls a plane's padding the section's own is fixed at 96** — A5·16's rule, carried by 4, 12 and 13. Page margin 72 / 40 / 20. Everything on the 8 px grid. The separations inside the stack are fixed, not controlled: 12 px between head elements, 20 px above the action row, 24 px inside it, 4 px to the note.

**Structure and landmarks.** `<section aria-labelledby>` named by its title, an `<h2>`. The eyebrow is a plain paragraph above it — not part of the heading, not a heading, not `aria-hidden`. **Actions are `<a>` elements, never buttons:** they navigate. The only `<button>` in the category is 6 Inline Form's submit. **The visible label is the whole accessible name** — no `aria-label` lengthening it — so “Start reading” has to stand alone, and the editor says so where a label reads “Click here”.

**DOM order** is eyebrow, title, sub, primary, secondary, note, on every design and at every width. **Three stated exceptions:** 10 Slim puts the note second, 11 Reasons puts its list after the actions even where it sits beside them, and 15 Signature puts the signature before the actions.

**The note** is a paragraph and **never `aria-describedby` the primary** — “No card needed” is a fact about the offer, not a description of a link. In 6's form the note's slot is both the `aria-describedby` target and the `aria-live` region, the one place it is both.

**Responsive floor.** At ≤ 767 **the primary is full width at 48 px** (44 on 10 Slim) and **the secondary takes its own 44 px row at full text strength** — a muted line under a full-width button reads as disabled. A band is always full bleed on a phone.

**Motion.** 160 ms ease-out, one transition per state change. Hover darkens a fill 6%, 3% on a band; pressed 10%. **Nothing scales, lifts, slides or gains a shadow anywhere in A6**, and no arrow ever moves. Reduced motion removes transitions and keeps every state.

**Focus.** A 2 px accent ring 2 px outside the button, its inner gap taking the colour of whatever the button sits on. **On a band or a picture the ring is the carried colour** rather than the accent — 12.8:1 against 3.2:1.

**Data.** **Nothing in A6 comes from Ghost except 14 Members**, which reads two facts: signed in or not, paid or not. A signup ask elsewhere is a link to `#/portal/signup`, and **only 6 Inline Form and 14 Members draw a field**. Members off in Ghost → A3·4's substitution. Every design is offered on every route.

**Empty.** No eyebrow, sub or note → each simply absent. **No primary label or URL → the section does not render** and the editor names the field: a CTA banner with no action is not a banner.

**Behaviours.** There are none. No countdown (A2·6's), no rotation (A2·9's), no dismissal, no sticky (A2·11's), no accordion (A9's), no comparison (A7's). **A6 is fifteen resting states**, which is why every frame in the category is one.

**Content.** Orbit Weekly throughout: the free letter, the paid subscription, the archive, the reader threads, the source files and the printed quarterly, with Maya Okonjo as the editor who signs 15.

---

## 1. Centred

The ask centred on the page's own ground: eyebrow, title, sub, one action, a note. The floor the other fourteen depart from.

**Fields.** `eyebrow` · `title` · `sub` · `primaryLabel` (req) · `primaryUrl` (req) · `secondaryLabel` · `secondaryUrl` · `note`. Everything else in the shared list kept and not drawn.

**Controls.** Padding · Ground (Background · Surface · **Contrast**) · Title size · Actions · Secondary style (Ghost text · Text link, unavailable at Actions Primary) · Below the actions (Note · Nothing).

**The arrangement.** Everything centred on a 780 px title measure and a 620 px sub, the action row 20 px under the sub with a 24 px gap, the note 4 px under the row.

**Ground Contrast** disables the accent fill with its 3.2:1 shown and substitutes a solid `text` fill carrying the band's colour. It stays disabled in packs whose accent would pass, because a control whose availability varied by pack would make one design twelve. 5 Contrast Band is the design for a band that wants edges, inner padding and a lift; this value is for a site that wants one banner inverted and nothing else.

**Responsive.** The arrangement holds at every width — a centred stack has nothing to collapse — which is why 1 is the one design whose tablet frame is a narrowing and is drawn anyway, for the numbers. 834: padding 80, title 34, sub measure 560, gap 20. ≤ 767: padding 64/20, title 28, sub 16, the shared phone action pair; the band always full bleed, with muted on it at `#B9B1A4`, a 72% mix of the carried colour, 7.4:1.

**Empty.** No title → the banner is the action and its note, and the editor names 10 Slim.

**a11y.** The floor, as §0.

**Flagged.** Reusing A5's head ladder as A6's title ladder, the action's step up to A4's hero scale, the once-per-banner accent budget and its fall to nothing on a band, the two allowed secondary forms and the refusal of a second fill, dropping Actions None, the 20/24/4 px separations, the full-width phone primary and its full-strength secondary, and the whole above-the-footer rule including the footer's dropped padding.

---

## 2. Flush Left

1's ladder stacked at the page's left margin on a stated measure, with the right half of the row left empty.

**Fields.** As 1. **The note is always drawn where authored** — no Below the actions control — because the empty right half means an absent note costs the arrangement nothing.

**Controls.** Padding · Ground (Background · Surface · ~~Contrast~~, **unavailable**: a band supplies its own edge and the rule above would draw a second one) · Title size · **Measure (Narrow 520 · Medium 620 · Wide 720)** · Actions · **Rule above (Show · Hide)**.

**The rule above is the design's answer and the reason the control exists.** A centred banner is separated from what came before it by symmetry; a left-aligned one starts at the same margin as the previous section's title, and 96 px of space cannot say which it is. A single `border` hairline across the content width does. It runs to the page margin, never the window's edge. **Where the section above already ends in a hairline the value is Hide**, and the editor says so rather than drawing two lines 1 px apart.

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

**Fields.** As 1, with **the note drawn in the actions column**. `secondaryLabel` is capped at 24 as everywhere and the editor advises 18 at Even halves.

**Controls.** Padding · Ground (Background · **Surface, the default** · Contrast) · Title size (34 · 40 · **Display 48 unavailable** — a 48 px line beside a 46 px button makes the button a caption) · **Division (Text-weighted 780/440 · Even halves 632/632**, gutter 76 fixed at both) · Actions · **Actions alignment (Centred on the text · Top of the row** — the title's cap height, a 3 px lift, A5·2's rule).

**The actions are a right-aligned column, not a row.** A row of two inside the right half either crowds the page margin or floats in the middle of it; a column puts the primary's right edge on the margin, the secondary 12 px beneath and the note 12 beneath that, so the block has one edge and reads bottom-up as offer, alternative, terms. `align-items: flex-end`, never `text-align: right`, so a 24-character label and a 12-character one line up on the same edge.

**Ground Surface is the default** because a one-row banner on the page's own ground has nothing to say it is a section — 2 solves the same problem with a hairline.

**Responsive.** The row holds to 1081. **At 1080 and below the design hands off to 2 Flush Left's arrangement** — actions under the text at the left margin, in a row, note under them — with Division and Actions alignment unavailable and the panel saying why; padding 80, title 30. At ≤ 767 one column, padding 64/20, **title 26**, the shared phone pair, note left-aligned.

**Empty.** No sub → the row is title and actions, the design at its shortest. No secondary → primary and note. No note → the column ends at the secondary.

**a11y.** A6's shared DOM order under a two-column flex row, so reading and tab order match at every width and division. The note is last and is not `aria-describedby`. The focus ring's inner gap takes the ground the button sits on. At 200% text the row becomes the tablet's stack — the same hand-off, nothing new specified.

**Flagged.** The right-aligned actions column and the note's place in it, the 12/12 px column gaps, the 76 px fixed gutter, the two divisions, refusing Display 48, Surface as the default ground, the 1080 hand-off and the two controls it disables, and the phone title at 26.

---

## 4. Card

The banner on one `surface` card, inset from the page margin, page ground visible on all four edges. A3·12's plane and A4·8's inset at banner scale.

**Fields.** As 1, unchanged.

**Controls.** **Card padding (Compact 48 · Comfortable 64 · Spacious 88** — one step tighter than the section scale it replaces, since a plane's edge does part of the work the space was doing; **the section's own padding is fixed at 96)** · **Inset (Snug 16 · Comfortable 40 · Wide 72** inside the page margin — A4·8's values unchanged, so a site running both reads one shape at two scales) · **Card treatment (Hairline · Tinted · Raised** — A5·4's, with its dark substitution: Raised is a hairline and no shadow in dark, which makes it Hairline there, and the editor says so rather than hiding the value) · Title size · Actions · Alignment (Centred · Left, where the measure is 620 inside the card and the card's right stays empty).

**No whole-card link at any value.** A card holding two actions cannot itself be one; A5·4's Whole item has no equivalent here.

**Above the footer this is the design that needs no help:** the card's own bottom edge is the boundary, so the section's 96 px sits between two visible edges rather than two grounds.

**Responsive.** At 1080 and below **inset 40 → 24 and card padding one named value down** (64 → 48, 88 → 64, Compact unchanged), section padding 80, title 34, the sub's measure the card. At ≤ 767 the card keeps a **16 px inset inside the page's 20** (A4·18's rule), **card padding fixed at 24** with both it and Inset ignored, the primary full width inside the card's padding. On a phone Tinted holds up best: a border and a shadow inside a 350 px column is three edges in 32 px.

**Empty.** As 1. No primary → no section and no card.

**a11y.** **The card is a `<div>`** — not a region, group, article or landmark. The focus ring's inner gap is the card's colour, and the ring is 2 px thick, which is what carries it at 2.8:1 against `surface`. Muted text on the Tinted card is measured against the hover surface, 5.1:1. **Forced colours make all three treatments Hairline** — the honest consequence of the plane being decorative.

**Flagged.** The card's three paddings and their one-step-tighter argument, fixing the section's padding at 96, reusing A4·8's inset and A5·4's treatments with their dark rule, the 620 px measure at Left, refusing a whole-card link, the tablet's two-way step, the phone's fixed 24 px padding, and the forced-colours collapse.

---

## 5. Contrast Band

The whole banner on the inverted ground. Ground is not a control here: it is the design.

**Fields.** As 1. **`image` is kept and not drawn:** a photograph on a band needs a scrim over an already-inverted ground, and 7 Full Bleed Image is the design that has one. **No inline form at any value** — A3·4's and A4·11's refusal carried a third time.

**Controls.** Padding (**Compact 44 · Comfortable 64 · Spacious 88** — one step tighter than the rest of A6, A4·9's scale carried, because an inverted block is read as bigger than it is) · **Band edges (Full bleed · Page margin**, the latter taking the pack radius and 56 px of inner padding, 40 at 834; **always full bleed at ≤ 767**) · Title size · **Action style (Carried colour fill · ~~Accent fill~~, disabled at 3.2:1** in every pack) · Actions · Alignment (Centred · Left).

**What the band changes.** The accent is spent nothing; the action is a solid `text` fill carrying the band's own colour at 12.8:1, hovering **3% darker rather than 6%** because a near-white fill darkening by 6% looks pressed; the secondary and all muted text are the carried colour at 72%; **the focus ring is the carried colour**, the one place in A6 it changes. An outlined button is not offered here or anywhere in A6.

**Dark.** Paper's dark `contrast` is `#EDE7DA` carrying `#171511`, so **the band is light in dark mode** — the one design in A6 whose modes are not variations of each other. Muted is a re-tuned `#57524A` at 6.4:1 rather than a 72% mix, and the action is a solid `#171511` fill at 14.9:1.

**Responsive.** 1080 and below: padding 56 at Comfortable, inner padding 56 → 40 at Page margin, title 34. ≤ 767: always full bleed, padding 44/20, title 28, **the primary full width at both alignments** and the secondary at full carried strength — the one place a 72% secondary could be mistaken for disabled text.

**Empty.** As 1.

**a11y.** The band is **not a landmark, region or theme boundary** — a background colour on a named section. The action is A6's button with two colours substituted, not a different component. Muted on the band is 7.4:1, higher than on the page's own ground. **Forced colours drop the band entirely** and nothing depends on the inversion.

**Flagged.** Carrying A4·9's tighter padding, the 3% hover, the 72% secondary and its phone exception, the full-width button at Left on a phone, the tablet's 40 px inner padding, refusing an outlined action across the category, refusing `image` and any form, and the one-band-per-page advice.

---

## 6. Inline Form

The banner with A3·4's one-row form standing where the actions would be. Settles §8's fourth question for the whole category.

**Fields.** `eyebrow` · `title` · `sub`, plus **the five shared `newsletter*` fields** — placeholder (≤ 28, default “you@example.com”) · button label (≤ 16, default “Subscribe”) · note (≤ 90, one line) · success (≤ 60) · short success (≤ 32, used ≤ 767) — **shared with A3·4's footer form and A4·11's hero: change them once and all three follow.** `primaryLabel`, `primaryUrl`, `secondaryLabel`, `secondaryUrl` and `note` are kept and not drawn. **The error line is fixed copy, not a field:** it has to match what was rejected.

**Controls.** Padding · Ground (Background · **Surface, the default** · ~~Contrast~~ **unavailable** — a field on a band needs a surface step the packs do not define) · **Field width (Narrow 320 · Medium 400 · Wide 480**, A3·4's) · Title size · Alignment · **Note under the form (Show · Hide** — it hides the authored note, not the live region).

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

**Fields.** As 1, plus `image` (req, **2400 px or wider**) · `imageAlt` (kept, unused here) · `imageFocus` (Centre · Top · Bottom, a field rather than a control, as A4·4).

**Controls.** Padding (**and the padding is what sets the picture's height**, there being no crop) · Band edges (Full bleed · Page margin — pack radius, **no inner padding**; always full bleed at ≤ 767) · **Text position (Centred · Bottom left)** · Title size · Actions · Note.

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

**Fields.** As 1, plus `image` (**1440 px or wider**) and `imageAlt` — **the one design in A6 where the alt is drawn as an alt**, and the editor asks what the picture adds instead of defaulting it empty. `imageFocus` is read.

**Controls.** Padding (on the text half, **and what the picture's height derives from**) · **Picture side (Right · Left** — grid placement, never a source reorder; A5·9's rule) · **Picture treatment (Flush to the edge · Framed inset**, A4·3's mount unchanged: 14 px of surface, one hairline, the picture at half the pack radius, costing 28 px of width; **on a surface ground the mount takes `background`** so it does not disappear) · Title size (34 · 40 · **Display 48 unavailable**) · Actions · Ground (Background · Surface, **no Contrast** — a photograph beside an inverted half is two grounds arguing).

**The division.** Text 720 — 2 Flush Left's Wide measure plus its padding — and the picture takes the rest; **the gutter is the text's own 76 px right padding rather than a gap**, since at Flush to the edge a gap would leave the section with two different right margins.

**The crop is derived from the text half's height**, not fixed: about 3:2 at Comfortable with a two-line title, wider at Compact, squarer at Spacious. A5·7 fixes its rows at 3:2 because it draws two to four of them and they must agree; this design draws one. **The floor is 320 px**, below which the picture is dropped.

**Responsive.** At 1080 and below the division is **480 / 354 — the text half takes 58%**, because the words have a floor and the picture does not — and **the two actions become a column**, primary above secondary at 10 px; title 30, sub 16. At ≤ 767 the halves stack, **the picture always first at a fixed 16:9** (A5·7's phone crop), full bleed even at Framed inset with the control ignored, and the section's top padding 32, since the picture is the top of the section.

**Empty.** **No picture, or a derived height under 320 px → the design is 2 Flush Left**, named, the text keeping its 720 px half. **No text tile** — A5·7's fill exists to protect a row rhythm and one banner has none; an empty 480 px box beside a paragraph is worse than the paragraph alone. This design does not draw 2's rule above: the picture was its edge and its absence does not create one.

**a11y.** Shared DOM order with **the picture last at both sides**. A real `<img>`, dimensions on the element, `loading="lazy"`. **The picture is not a link** at either treatment. **Nothing is measured against the picture**, which is this design's advantage over 7. At 200% text the halves stack in the phone's order.

**Flagged.** The 720 px text half and the padding-as-gutter, the derived crop and its 320 px floor, the tablet's 58% division and its column of actions, the phone's 32 px top padding, refusing Display 48 and the Contrast ground, the mount's `background` substitution, refusing a text tile and a clickable picture, and the hand-off to 2.

---

## 9. Big Type

The ask set large enough to be the section, flush left across the whole content width, a rule under it, the actions beneath. A4·6 at banner scale, and A6's only design above its own title ladder.

**Fields.** `title` (req, ≤ 90, **≤ 40 advised at Huge**) · `sub` · `primaryLabel` · `primaryUrl` · `secondaryLabel` · `secondaryUrl`. **No eyebrow is offered** — A4·6's refusal, carried: a 13 px tracked line above a 76 px one is a label on a poster. **`note` is kept and not drawn:** the line under the rule already holds two things.

**Controls.** Padding (**Compact advised at Huge** — the type is already the space) · **Title scale (Display 76 · Huge 96)** · **Rule under the title (Show · Hide**, the gap 40 → 28 at Hide, A5·6's logic) · **Sub under the rule (Show · Hide**, where **the actions keep the right end of the line**) · Ground · Actions.

**Fill width is not offered.** A4·6's third value measures the headline against its column and clamps it 64–160. A hero owns the top of a page; a banner sits between two sections, and a 160 px line in the middle of a page is louder than the page's own hero.

**The arrangement.** The title flush left across the full content width at line height 1.02 and tracking −0.035em (1.0 and −0.04em at Huge), the rule 40 px under it at full width, and **the sub and the actions sharing the line beneath** — sub left on 620, actions right, 64 px gutter. That shared line is this design's one addition to A4·6 and what keeps the section 380 px rather than 480.

**Responsive.** At 1080 and below **the sub and the actions stop sharing a line** — sub 28 px under the rule, actions 24 under the sub — and the title steps 76 → 52, 96 → 60. At ≤ 767 the title is **40 at Display and 44 at Huge**, the two values nearly converging and the sidebar saying so; rule 24 px under the title, sub 20 under the rule, the shared phone pair.

**Empty.** No sub, or Sub Hide → the actions alone at the right of the line. **The floor is a title and a primary**, 220 px of section. No title → the section does not render, the title being the design; the editor names 10 Slim.

**a11y.** **76 px is a size, not a level** — the same `<h2>` as every other design, so a page running this banner and a 40 px one has two h2s of equal standing. The rule is a `border-top`, never an `<hr>`. **The one design where DOM and visual order differ** — by one element, the actions sitting right of the sub — and both readings say terms then offer. At 200% text the arrangement is the tablet's; at 320 px the title wraps to four lines, which is why Fill width is refused.

**Flagged.** The shared sub-and-actions line and its 64 px gutter, refusing Fill width, the 40/28 rule gaps, the tighter line height and tracking, the tablet's split of the shared line, the phone's near-converged values, dropping the note field, and drawing a shorter authored title in the Huge frame with the reason stated.

---

## 10. Slim

One line of text and one action on a single row, at the tightest padding in the category. The design A6 names whenever a site has no title to write.

**Fields.** `title` (opt, ≤ 90, **60 advised**) · `primaryLabel` (req) · `primaryUrl` (req) · `note`. **`eyebrow`, `sub`, `secondaryLabel` and `secondaryUrl` are kept and not drawn** — the largest set of kept-and-unused fields in A6, and the design's whole argument: one line, one action.

**Controls.** Padding (**Compact 20 · Comfortable 28 · Spacious 36** — its own scale) · Ground (Background · Surface · Contrast, **the last two dropping the rules and disabling the Rules control**) · **Action style (Button · Text link)** · **Rules (Above and below · Above only · None)** · Alignment (Split · Centred, **Centred disabling the note**) · Note.

**The row.** The line is the title at **21 px in the heading font** (A5·6's row title), the note 13 px under it, the action at the right with at least 48 px between them. **The action is A1·1's button at A1·1's size** — 14 px/600, 9×17 — the only design in A6 not at hero scale, because a 46 px button inside 28 px of padding is a button with a strip around it. At Text link the arrow is 14 px with a 44 px target extending past the label, and **the arrow does not move on hover**.

**The rules are what make it a section** rather than a stray row, and Above and below is the default here where every other design draws no line of its own. **Directly above the footer the lower rule is dropped** whatever the value: two hairlines 96 px apart with nothing between them is a mistake a reader can see.

**Centred takes no note.** A 13 px line under the left half of a centred pair hangs off the composition, and centring it under both makes the row three lines tall, which is 1 Centred at Compact.

**Not A2 Announcement Bars.** A2 owns the strip at the top of the page: pinned above the header, dismissible, one per site, sometimes sticky. **This is a section in the flow** — it scrolls, it is not dismissible, it carries no close control, nothing is remembered in storage, and a page may hold two. The editor names A2·1 Rule and A2·2 Split for a site that wants the top strip.

**Responsive.** The row holds above 767 — padding 24, line 20, gap 32 at 834. **The design's limit is its line's length, not the window:** past about 60 characters the line wraps and the row grows to 78 px. At ≤ 767 it stacks — line, note, action — the button full width at **44 px rather than A6's 48**, the line 19 px, Alignment ignored; **at Text link the action keeps its natural width** with a 44 px target spanning the column.

**Empty.** No note → a line and an action, 76 px. **No title is a supported state here** — the bar is an action and its note, the section loses its accessible name, and the sidebar says so.

**a11y.** The line is the section's h2 at 21 px — size is not level in either direction. **The note is second in the DOM rather than last**, the one design where that holds, because here it reads as part of the line rather than as terms under a button. One tab stop; **the row is never a link**. Rules are `border-top` and `border-bottom`, not `<hr>`. No `role="alert"`, no live region, nothing remembered.

**Flagged.** The 20/28/36 scale, the drop to A1·1's button, the 21 px line, the 48 px minimum split, the rules as this design's default and their drop on a plane and above the footer, Centred disabling the note, the 60-character advice, the 44 px phone button, the note's place in the DOM, and the whole A2 boundary.

---

## 11. Reasons

The ask with up to three short lines saying what comes with it. Where A6 borrows A5·11's mark.

**Fields.** As 1, plus **`reasons[]`** — one to three, each ≤ 40 characters (20 advised at Under the actions), **text only: no icon, no body, no link**. This is the design that introduces the field; the rest of A6 keeps it and does not draw it. A fourth is refused and the editor names **A5·11 Checklist with a section action**.

**Controls.** Padding · Ground (Background · **Surface, the default** · Contrast) · **Reasons position (Beside the text · Under the actions)** · **Mark (Check · Dot · Rule)** · Title size (**Display 48 unavailable at Beside the text**) · Actions. **No alignment control:** Beside the text is left-aligned, Under the actions is centred, and the position decides it — a centred title next to a left-aligned list has two axes.

**The mark is `text-muted` at all three values and an accent mark is not offered.** A5·11 spends its accent once per entry because a checklist has no action under it; this design has an accent button 40 px away, and three accent ticks beside it is the accent spent four times. Geometry is A5·11's unchanged: 16 px box, 14 px gap, 3 px optical lift.

**The reasons** are A5·11's entry verbatim — 17 px body font at 500 — in a **424 px column on a 96 px gutter** at Beside the text; a row of three at 15 px, 24 px under a hairline, at Under the actions. **The reasons read stronger than the sub**, deliberately: `text` against `text-muted`, because they are the facts a reader came for.

**Responsive.** At 1080 and below **the position is Under the actions whatever the control says**, and the row of three becomes **a left-aligned column of three** under the hairline at 16 px — an arrangement that exists at 834 and nowhere else. Padding 80, title 34. At ≤ 767 one column, reasons 16 px with a 14 px mark, the hairline kept; this is the design's most common shape and its best one.

**Empty.** **One reason is a supported state** and keeps its mark and its hairline. **No reasons → the design is 1 Centred at Left**, the hairline gone with them, named by the editor.

**a11y.** A `<ul>` of `<li>`, **not headings** — 17 px at 500 is emphasis and the section already has its one heading. **The mark is `aria-hidden` at all values and nothing is a checkbox:** no role, no `aria-checked`, no input. **The list comes after the actions in the DOM at both positions**, including the one where it sits to their right: the reasons describe the offer the button makes. **No reason is ever a link.** Forced colours keep the marks, all three drawn from `currentColor` rather than glyphs.

**Flagged.** The three-reason cap and the 40-character field, moving the mark off the accent and refusing an accent value, the 424/96 division, the 17 px and 15 px sizes, the reasons reading stronger than the sub, dropping the alignment control, the tablet's column-of-three, and the hand-off to 1.

---

## 12. Pair

Two asks side by side, each with its own words and its own action. **The only design in A6 that spends the accent twice.**

**Fields.** `eyebrow` (above the pair, and **the section's accessible name**) · column one: `title` · `sub` · `primaryLabel` · `primaryUrl` · column two: **`secondTitle` (≤ 60) · `secondSub` (≤ 140)** · `secondaryLabel` · `secondaryUrl`. This design introduces the two `second*` fields and **reuses the secondary action's fields as the second column's action**, so a site switching from 1 keeps both labels and both URLs. `note` kept and not drawn: two columns of terms is a table.

**Controls.** Padding (the section's; **the cards' own padding is fixed at 48**, 32 at 834, 24 on a phone) · **Column planes (Cards · Hairline between · None** — A5·4's Hairline plane at Cards, **the gutter following the plane**: 32 at Cards, 80 at the other two) · Division (Even halves 632/632 · Weighted to the first 780/440, 3 Split's, unavailable at 1080 and below) · **Column title size (Medium 28 · Large 34** — one step below A6's ladder, since there are two of them) · **Actions (Button · Text link, one control for both columns)** · Alignment (Left · Centred).

**Two accent fills, and the section says why.** The two actions are the same offer at two prices; making one a ghost link would tell a reader which to pick, and that is a decision the site makes with its words. Where the two asks are not really alternatives the editor names Actions Text link, which spends no accent at all, or 1 Centred with a secondary. **A button beside a ghost link is not offered:** that is 1 Centred with a divider drawn down the middle of it.

**No section title.** A title over two titled columns is three headings in 400 px, and the columns are the asks. **The columns stretch to the taller of the two and their text stays at the top** — A5·4's row-stretch rule — so two asks of unequal length are honestly unequal.

**Responsive.** **Two columns hold at 834** — 355 px a card, padding 32, gutter 24, title 24, body 16, buttons at their natural width rather than full-card; Division unavailable. At ≤ 767 one column, **16 px between cards** (A5·4's phone gap), padding 24, both buttons full width inside their own cards — **the loudest thing A6 puts on a phone**, and the sidebar says so at the Actions control. **At planes None and Hairline between a horizontal hairline appears between the two asks**, the vertical divider becoming a horizontal one rather than disappearing.

**Empty.** No `secondTitle` or no second label → **the design is 1 Centred**, named. No sub in one column → that column ends at its action and the planes still stretch. No eyebrow → the section loses its accessible name and the editor says so.

**a11y.** **The one design in A6 with no section heading:** the section takes `aria-label` from the eyebrow's text, the only `aria-label` on a section in the category. The columns are a `<ul>` of two `<li>`, each with an h2 — a reader hears “list of 2 items” before the first ask. **Not a table, no group role, nothing comparable across them** — A7 Pricing and Tiers owns comparison, and the editor names it where a site starts writing matching lists in both columns. **Neither ask is recommended, default or featured:** no `aria-current`, no badge, no ribbon.

**Flagged.** The two `second*` fields and reusing the secondary action for column two, spending the accent twice and the argument for it, the plane-dependent gutter, the fixed 48 px card padding, the 28/34 column ladder, one Actions control for both columns, refusing a per-column action style and any recommended marker, the phone's horizontal hairline, and the `aria-label` exception.

---

## 13. Overlap

A card that crosses the footer's top edge, so the last ask on the page and the end of the page are one object. Settlement 3 built rather than ruled, and **the only design in A6 with a precondition.**

**Fields.** As 4 Card.

**The precondition,** stated on the frame, in the panel and here: the design must be **the last section on the page**, and **the footer's ground must differ from the card's**.

- Not last → the overlap is dropped and **the design is 4 Card at Raised**, with the editor naming the section below.
- Footer ground matching → **the card steps to the hover surface** and keeps its hairline (4 Card's Tinted treatment as a substitution rather than a choice).
- Footer is A3·5 Contrast Band or A3·14 Image Band → the design at its best; on A3·14 the card **keeps its md shadow in both modes**, a photograph not being a ground a hairline reads against.
- Two overlapping sections on one page (with A4·18's hero card) → allowed, and advised against once.

**Controls.** Card padding (48 · 64 · 88, 4 Card's; the section's own fixed at 96) · Inset (16 · 40 · 72, A4·8's) · **Overlap (Shallow 48 · Standard 88)**, absolute rather than proportional, **clamped to 40% of the card's height** — A4·18's ceiling, carried — with Standard behaving as Shallow on a short card and the sidebar saying so · Title size · Actions · Alignment. **No treatment control: the card is always Raised**, since it sits over an edge.

**The mechanics.** A negative bottom margin on the card and **matching top padding on the footer** — its own value plus the overlap — so the footer's first row always has 44 px of clear ground beneath the card. No transform, no absolute positioning, no fixed heights; the card grows with its content and the footer's padding follows. **The footer draws on the hover surface** for the join to be visible, which is this design asking something of a section it does not own.

**Responsive.** At 1080 and below 4 Card's steps apply and **the overlap steps with them: 88 → 64, 48 → 40**, the footer's top padding following. At ≤ 767 **the overlap is fixed at 32 and the control is ignored** — a 318 px card 460 tall would give 88 px of overlap a fifth of the visible page — and the card keeps its 16 px inset inside the page's 20. The 40% ceiling is a proportion and holds at every width.

**Empty.** As 4. No primary → no section and no card, and the footer's padding returns to its own value.

**a11y.** **The overlap is visual only** — `<section>` then `<footer>`, adjacent and complete, neither containing the other, nothing about the join in the accessibility tree. The card is a `<div>`. **The footer's first row never sits under the card**, checked against the grown card at 200% text. The card against the footer's ground is **1.1:1 light and 1.2:1 dark** — the honest number; the hairline and the shadow carry the join, and the hairline alone in forced colours. Reduced motion changes nothing: the overlap is a position.

**Flagged.** The two overlap values, carrying A4·18's 40% ceiling and clamping rather than refusing, the footer's absorbed top padding and the 44 px clear row, requiring the footer's ground to differ and the hover-surface substitution, the phone's fixed 32, fixing the card at Raised, and the whole precondition and its hand-off to 4.

---

## 14. Members

The signup ask with its sign-in line, and **the one design in A6 that reads Ghost's member state.**

**Fields.** As 1, plus **`memberTitle` (≤ 90) · `memberSub` (≤ 180) · `upgradeLabel` (≤ 24)**, and the five shared `newsletter*` fields at Signup Inline form. `secondaryLabel` and `secondaryUrl` are kept and not drawn: the sign-in line is fixed copy plus a Portal link, not an authored action.

**Data — and only this:** whether the reader is signed in, and whether their subscription is paid. **Not the reader's name, tier name or join date.** Three states:

- **Visitor** — the authored content. The state the editor previews.
- **Signed-in free member** — the `member*` copy, the upgrade action, **no form and no sign-in line**. A signed-in reader has already given their address; a field asking again is the clearest way a theme can say it does not know them.
- **Paid member** — **the section does not render.** Nothing to ask for, so nothing is drawn and the page is shorter.

**Members off in Ghost** → visitor state only, no sign-in line, the primary linking to the site's subscribe page (A3·4's substitution).

**Controls.** Padding · Ground (Background · **Surface, the default** · **Contrast unavailable at both signup values**, so the two look like one design) · **Signup (Portal button · Inline form** — 6 Inline Form's row and its four states, unchanged and unextended) · **Sign-in line (Under the action · In the action row · Hide**, unavailable in the member state) · Title size (one value for both states) · **When a member is signed in (Show a members line · Hide the section)**.

**The Portal hand-off.** `#/portal/signup`, `#/portal/signin`, `#/portal/account/plans` for the upgrade. **The banner draws nothing of Portal** — no modal, no fields, no states, no confirmation — and **does not manage, trap or return focus into its dialog**, since Portal owns it and a theme reaching in is how two focus traps end up fighting. It **never names a tier or draws a price comparison**: A7 owns those and Portal owns the transaction; a price in a label is the site's words in a field, not data.

**The sign-in line is a third form of secondary action** — “Already a member? Sign in”, one sentence with one link, the question muted and the link in `text` with a permanent underline — allowed because it is a correction for a misidentified reader rather than an alternative offer. At In the action row the question is dropped and the link becomes A1·1's ghost action. **The primary says “start reading” rather than “sign up”** because Portal's own modal says sign up on the button a reader meets next.

**Responsive.** 834: padding 80, title 34; at Inline form the row holds and the field steps one value down; **the sign-in line sits below the form's note** — form, terms, then the way out, an order that holds at every width. ≤ 767: primary full width at 48 px; field and button a row each; **the sign-in line keeps its sentence** on its own 44 px row, and In the action row behaves as Under the action.

**Empty.** No `memberTitle` at Show a members line → the section behaves as Hide the section for signed-in readers, and the editor says so.

**a11y.** Portal actions are **real links, not buttons** — they change the URL and Portal opens on the fragment, so a reader can middle-click them. The sign-in link's target is 44 px. **The state is rendered on the server and the other states' markup is not in the page** — no `hidden` copies, no live region, nothing swapped after load, and therefore no announcement to make. **Membership is never exposed as a state, badge or role.**

**Flagged.** The three-state model and the paid member's empty section, the three `member*` fields, the sign-in line as a third secondary form and its three positions, “start reading” rather than “sign up”, refusing the form in the member state, refusing the Contrast ground at both signup values, the server-render rule, and the boundary that leaves Portal's dialog alone.

---

## 15. Signature

The ask written in the first person and signed by the person making it. The only design in A6 whose copy has an author.

**Fields.** As 1, plus **`portrait` (≥ 200 px square) · `signerName` (req, ≤ 40) · `signerRole` (opt, ≤ 40)**. **`note` is kept and not drawn:** the signature is what sits under the words. **No `portraitAlt` exists** — the alt is always empty, the name being beside it in text (A1·6's rule at 96 px). **Nothing comes from Ghost, including the person:** the signer is authored, not the post's author or the site's owner, because a banner on a page has no author.

**Controls.** Padding · Ground (Background · Surface · **Contrast unavailable** — a portrait on an inverted band needs a scrim or a border the packs do not define, and a first-person note on a band is a poster) · **Portrait (Circle 64 · Circle 96 · None** — two sizes, both circles, no square and no rounded rectangle) · **Portrait position (Beside the text · Above the text**, the latter centred with the portrait fixed at 64 and **the eyebrow moving under it**, the one place in A6 the eyebrow is not first) · Title size (**Medium 34, the default here and nowhere else in A6** · Large 40 · **Display 48 unavailable** — a first-person sentence at 48 px is a slogan with a photograph next to it) · Actions.

**The signature is A1·6's avatar and meta row, moved and grown.** A1·6 sets a 24 px circle with “Name · date” at 13 px beside it; here the circle leaves the row to become the portrait and the name and role take its place as two lines — **15 px at 600 and 13 px muted behind a 40 px rule** that stands in for the pen stroke. It sits **above the actions** at both positions: a reader should know who is asking before they are asked. Neither name nor role is a link and there is no “more from this author” — **A21 Author Showcases owns the author as a subject**, and here the person is the reason for the ask rather than its object.

**At Portrait None the rule, the name and the role all stay** — the signature is the design and the photograph is its illustration, the opposite of 8 Image Split. A missing file is **A1·6's initials circle at the set size**, initials from the name. The portrait is **top-aligned to the title and never centred against the text**, so a 96 px circle does not drift down the page as a site edits its copy. Nothing about the portrait is a state: it is not a link and does not respond to a pointer.

**Responsive.** At 1080 and below **Circle 96 steps to 64 and the size control is unavailable** — 96 plus a 40 px gutter takes 136 px of 754 — gutter 40 → 28, title 30, padding 80. At ≤ 767 **the portrait is always above the text at 56 px, left-aligned**, both portrait controls ignored, title 26, the shared phone pair.

**Empty.** No `signerRole` → the name alone beside the rule. **No `signerName` → the design is 1 Centred at Left**, portrait and rule dropped with it: a signature without a name is a photograph.

**a11y.** The portrait is an `<img alt="">`, not authorable; the initials fall-back is `aria-hidden`. **The signature is two paragraphs, not a heading and not a `<cite>`**; the rule is a border, never an `<hr>`. **Nothing is marked up as an author** — no `rel="author"`, no microformat, no author link. **The DOM order puts the signature before the actions**, A6's only departure from its shared order. At 200% text the portrait goes above the words in the phone's arrangement.

**Flagged.** The three fields and the absent alt, growing A1·6's avatar to 96 and splitting its meta into two lines, the 40 px rule, Medium as the default and refusing Display, the two circle sizes and refusing any other shape, the eyebrow's move at Above the text, keeping the signature at Portrait None, the top-aligned portrait, the phone's 56 px left-aligned portrait, and the DOM order.

---

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
