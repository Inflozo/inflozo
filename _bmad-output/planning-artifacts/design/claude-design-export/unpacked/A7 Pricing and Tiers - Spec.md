# A7 Pricing and Tiers — written specification

15 designs · Paper pack · drawn in this project as `A7-1 Cards.dc.html` … `A7-15 Both Prices.dc.html`, with the category's shared artefacts in `A7-0 Category Proof.dc.html`.

Read `A7-0` first. It carries the four settlements §8 asks A7 to make, the ladders, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

---

## 0. The shared floor

Everything in this section applies to all fifteen unless a design says otherwise.

**The frames draw the section alone on the page ground.** A6 drew its banners above a footer because that is where a banner sits; a pricing section has ordinary sections above and below it, so A5's convention is the right one here. Where a design's rule concerns its neighbour, the frame draws the neighbour and the caption says so.

**Almost nothing is authored, and that is the category.** Name, description, monthly price, yearly price, currency, benefits and id come from each Ghost tier and **none of them is editable in a section** — every sidebar carries one line to the tier's own settings instead, and it is the same line on all fifteen. The site authors: `eyebrow`, `title`, `sub`, `note`, `recommendedTier`, `badgeLabel`, `payLabel`, `freeLabel`, and the design's controls. **13 Members is the only design that reads a reader.**

**The tier count is data, not a control.** Three cards of 416 on a 24 px gutter, two of 632 on 32, one of 480 centred — the theme picks by counting. **The order is Ghost's own, price ascending, at every width and in every state**; the recommended tier is never moved to the front, and only 11 Free and Paid reorders, on a phone, stating it. **Four or more tiers**: 3 Stack, 12 Ledger and 4 Split Head take them as ordinary rows, 2 Table scrolls, and every columned design hands off by name.

**The price ladder is A7's one new scale: Medium 40 · Large 48 · Display 56** at 1440, 34 / 40 / 44 at 834, 32 / 36 / 40 at 390 — heading font, 700, line height 1. **The currency mark is full size and in `text`**, never raised and never muted. **The cadence is words in the body font**, 15 px muted, inline: “a month”, “a year”, never “/mo”. **The free tier's price is the word “Free”** at the same size with no mark and no cadence. 9 Big Price is the ladder's one exception at 88 · 112; 6 Single Tier fixes Display 56; 8 Slim Row and 12 Ledger sit at Medium 34; 2 Table's column heads at Medium 40.

**The head is A6's title ladder unchanged** — Medium 34 · Large 40 · Display 48 at 1440, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390 — on a 780 px measure, sub 17 px muted on 620, eyebrow 13 px uppercase tracked `.08em` muted. Head to tiers 48 px, head to switch 32, switch to tiers 40, tiers to note 24. **8 Slim Row and 12 Ledger draw no head at all.**

**The tier card is one component.** Tier name 20 px heading font at 700; description 15 px muted at 1.55; benefit rows 15 px in `text` with **A5·11's mark unchanged** — 16 px box, 14 px gap, 3 px optical lift, the mark in `text-muted` and `aria-hidden` — 10 px apart under a hairline. **Separations are fixed, not controlled:** 16 px name to price, 12 to the description, 20 to the action, 20 to the hairline, 20 again to the first benefit. **The action sits above the benefits**, so cards of unequal list length keep their buttons on one line. Card padding Comfortable 32 unless a design controls it, and **where a design controls a plane's padding the section's own is fixed at 96** (A5·16's rule).

**Section padding Compact 64 · Comfortable 96 · Spacious 132**, 80 at 834, 64 at 390; page margin 72 / 40 / 20. Two designs have their own scales: 5 Contrast Band's band at 44 · 64 · 88 (A4·9's) and 8 Slim Row's at 32 · 44 · 56.

**The recommendation is three signals and no new colour** — settlement 2. The plane steps one step (`background` → `surface` with the sm shadow; `surface` → the hover surface; in dark always to the hover surface, since a warm shadow is invisible there). The **`contrast` badge sits at the right end of the tier name's line**, 12 px/600 uppercase tracked `.08em` in 5×10, label authored at ≤ 18 with “Most popular” as the default. And **the accent is taken away from the other tiers rather than added to this one**: their actions become hairline outlines. With no recommendation every action is filled and the tiers are equal.

**The tier action fills its card at 44 px** — neither A6's 46 px hero nor A5's 42 px mid-page button — 15 px/600, the pack radius, 48 px full width on a phone. In the designs with no cards it is A1·1's own 14 px/600 at 9×17. **A7 introduces the outlined action**, a stated departure from A6's category-wide refusal: A6 refused an outline beside a fill on a page ground; here there is one action per card and the row needs a shape in every cell. 1 px `border`, label in `text`, filling to the hover surface on hover.

**The cadence switch** is a 36 px hairline pill on the hover surface with 3 px of padding, labels 13 px/600 at 7×14, the active one on `surface` with the sm shadow; the computed saving line 13 px muted, 12 px to its right, under it at 8 px on a phone. **The saving is computed from Ghost's prices in whole months, rounded down, and absent under a month** — a site cannot type a discount its Stripe prices do not support. **Where any tier has no yearly price the control is unavailable** and the sidebar names the tier.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`. **The tiers are a `<ul>` of `<li>`, each tier name an `<h3>`**, benefits a nested `<ul>`. Three stated exceptions: 2 Table is a real `<table>` whose column heads carry plain text rather than headings; 10 Tabs' tablist is the list; 8 Slim Row and 12 Ledger have no `<h2>` and take no `aria-labelledby` rather than being labelled by invented text. **The price is one string a screen reader reads as one** — “€7 a month” — with no `aria-label` and no visually-hidden alternative. **Nothing is marked as an offer, product or price in structured data.**

**Actions are `<a>` elements**, never buttons: they change the URL and Portal opens on the fragment. **The visible label is the whole accessible name**, and three links may share it — each sits inside a named list item. The only `<button>`s in A7 are the cadence switch's two and 10 Tabs' three.

**The Portal hand-off** — settlement 3. `#/portal/signup/{tier}/{monthly|yearly}` at the cadence on screen, `#/portal/signup/free`, `#/portal/account/plans` for a member changing plan. **The section draws none of Portal** — no fields, no card entry, no confirmation, no modal of our own — and **manages no focus into its dialog**. Two labels for the whole section: `payLabel` (≤ 20, default “Subscribe”) and `freeLabel` (≤ 20, default “Sign up free”). **The label never carries the price or the tier name.** **Nothing about a discount, offer, trial, strikethrough or “from” price appears anywhere in A7**: Ghost's Offers own them.

**Behaviours: two, and they are the category's only ones.** The cadence switch at Billing period Both, and 10 Tabs' tier switch. Both **cross-fade at 160 ms and nothing slides**; instant under reduced motion; neither runs while editing, so every frame in A7 is a resting state. Hover darkens a fill 6% and pressed 10%; an outlined action fills to the hover surface. **Nothing scales, lifts or gains a shadow.** Focus is A6's ring verbatim: 2 px accent, 2 px outside, the inner gap taking the ground it sits on; the carried colour on a band.

**Responsive floor.** Three tiers hold above 1081; **at 1080 and below they take 3 Stack's two-line rows** — name, price and description left, action right on 168, benefits under a hairline in two columns. Two tiers keep two columns to 768; one keeps its card. At ≤ 767 one column at 16 px in price order, card padding 24, price 36, **actions 48 px at full card width**, the switch full width with the saving line beneath it.

**Empty.** No description → the card closes up. No benefits on a tier → that card ends at its action; none anywhere → the hairline goes too. No eyebrow, sub or note → absent. No recommendation → no badge, no plane step, every action filled. **Members off in Ghost → the section does not render**, and that is the only such state in A7.

**Content.** Orbit Weekly's three tiers throughout: **Free** — the Thursday letter, two open issues a month, reply to any issue. **Reader · €7 a month, €70 a year** — everything in Free, the archive since 2019, reader threads on every issue, monthly source files. **Quarterly · €18 a month, €180 a year** — everything in Reader, four printed issues a year, named in the colophon, a seat at the monthly call. Recommended: Reader. Both yearly prices are ten months of the monthly one, so the computed line reads **“Two months free on yearly”** in every frame.

---

## 1. Cards

Three tier cards in one row under a centred head. The floor the other fourteen depart from, and the design every hand-off names.

**Fields.** The authored eight and the six read per tier, as §0. Everything else in the shared list kept and not drawn.

**Controls.** Padding · Ground (Background · Surface — **no Contrast**, since a band needs its own edges and refusals and 5 is the design for it) · Billing period (Monthly · Yearly · Both) · Title size · Head alignment (Centred · Left, where the switch and note go to the left margin with the head and the cards do not move) · Benefits (Show · Hide).

**The arrangement.** Three cards of 416 on a 24 px gutter across the 1,296 px content width, stretched to the tallest — **Reader's list is one line longer than Free's and the cards are honestly unequal rather than padded to match.** Card padding 32 fixed here; 3 Stack is the design that controls it.

**Responsive.** Three tiers hold above 1081; at 1080 and below they take 3 Stack's rows and the sidebar names the design they borrow. Padding 96 → 80, card 32 → 28, title 40 → 34, price 48 → 34, rows 16 apart. ≤ 767 as §0.

**Empty.** As §0. Four or more tiers → 3 Stack, named.

**a11y.** The floor, as §0, with two things this design settles for the rest: **the badge is text inside the heading's row and not `aria-hidden`** — “Most popular” is the site's claim and a reader who cannot see the plane step should still hear it — and it is **not part of the `<h3>`**, because a heading called “Reader Most popular” is a heading nobody wrote.

**Flagged.** The price ladder and its words-not-slashes cadence, the free tier's price being the word “Free”, the card's fixed separations and the action above the benefits, the three recommendation signals and the accent's removal from the others, **the outlined action as a departure from A6**, the badge's place on the name's line, the computed saving line, the cross-fade with nothing sliding, the 1080 hand-off to 3 Stack, and the phone's 36 px price.

---

## 2. Table

Benefits as rows, tiers as columns, prices and actions in the head. **The only real `<table>` in the library so far, the only design that scrolls, and the only one that accepts a fourth tier.**

**Fields.** As 1, with **the tier description dropped** — nine rows say what a sentence would — and kept for the designs that draw it.

**The rows are derived, and this is the category's one derivation.** Ghost stores benefits as a list of strings per tier with nothing shared between them, so a matrix has to be built: each string becomes a row when it first appears, the tier that introduced it is ticked, and **every more expensive tier is ticked too, on the stated assumption that paid tiers are cumulative**. A line that names another tier — “Everything in Free” — is read as that inheritance rather than drawn as a row. **Both rules are invented**, both are stated in the sidebar where a site can see the consequence, and **where a site's tiers are not cumulative the editor names 1 Cards**.

**Controls.** Padding · Ground · Billing period · Title size · **Row marks (Check and blank · Check and dash)** · **Rows (Hairlines · Tinted alternate**, where the hairlines go — a tint and a rule doing the same work is two edges per row).

**The arrangement.** A 384 px row-name column and three tier columns of 304; cell padding 14 fixed; prices Medium 40; the head carrying name, price and action. **The recommended column is one continuous plane** from the head's top to the last row, hairline on three sides, the pack radius at both ends. **Ticks are `text-muted`, never the accent and never red**, and there are no crosses at any value: twenty-seven accent ticks beside one accent button is the accent spent twenty-eight times.

**Responsive.** Above 1081 the table fits the content width. **At 1080 and below it scrolls sideways** — 260 for the pinned name column, 200 a tier — in a `tabindex="0"` container with an accessible name, a visible focus ring and a fade at the right edge; **sticky is a position, not a behaviour**. **At ≤ 767 the design hands off to 1 Cards' single column**, every included row drawn in its tier's card; at Check and dash the excluded rows are drawn muted so the comparison survives.

**Dark.** The alternate tint is `#1D1A15`, **a step down from the ground rather than up**, and the recommended column's hairline goes with it — on a near-black ground a border against a 1.15:1 plane is a line nobody sees. This design's one structural difference between modes.

**Empty.** No benefits anywhere → there is no table, and the editor names 1 Cards or 8 Slim Row. One tier → 6 Single Tier, named.

**a11y.** `<thead>`, `<tbody>`, `<th scope="col">` per tier, `<th scope="row">` per benefit, the table named by `aria-labelledby` from the section's h2 rather than a caption. **The tier name in a head is plain text, not an `<h3>`** — the only design in A7 where that holds. A cell is an `aria-hidden` glyph plus a visually-hidden “Included”; **at Check and blank an empty cell stays empty in the tree**, because inventing “Not included” for a cell the site left blank is putting words in its mouth. No `role="presentation"` anywhere.

**Flagged.** The cumulative-tier assumption and the inheritance-line rule, dropping the description, the continuous column plane, the tick's muted colour, the two row-mark values and the blank cell's silence, Rows Tinted dropping the hairlines, the dark tint stepping down, the 1080 scroll with a pinned column, the ≤ 767 hand-off to 1 Cards, and this being the one design that takes a fourth tier.

---

## 3. Stack

One full-width row per tier: name and price at the left, benefits in the middle, action at the right. **The only arrangement in A7 that does not care how many tiers there are**, which is why every columned design hands off to it at 1080.

**Fields.** As 1, unchanged.

**Controls.** **Row padding (Compact 24 · Comfortable 32 · Spacious 40**, the section's own fixed at 96) · Ground · Billing period · Title size · **Row planes (Cards · Hairline between · None)** · **Benefit columns (One · Two)**.

**The arrangement.** A fixed 300 px name-and-price column, the benefits between two 64 px gutters, a fixed 200 px action column, **all three top-aligned, never centred vertically**. The two fixed columns are what make four rows agree — a row whose price column shrank with its benefit count would put three prices at three different distances from the margin. Rows 16 px apart at Cards, 40 at None, one hairline between at Hairline between; **the row gap is fixed and does not follow Row padding.** At Hairline between the recommended row is a full-bleed plane on the section's width.

**Two columns of benefits are one list** — CSS columns, filled down then across — so reading order, DOM order and visual order are the same sequence. One is advised above 34 characters.

**At Row planes None the plane step has nowhere to land**, so the recommendation falls to two signals, the badge and the accent, and the sidebar says so at the control rather than hiding the value. That is the reason the badge exists.

**Responsive.** At 1080 and below the row is two lines — name, price and description left, action right on 168, benefits under a hairline across the row in two columns — row padding one named value down, title 34, price 34. **This is the arrangement 1 Cards, 4 Split Head, 13 Members, 14 Assurances and 15 Both Prices all borrow**, stated identically on each. At ≤ 767 the row is a card's stack in one column, Benefit columns ignored.

**Empty.** No benefits on a tier → the middle column is empty rather than filled: **a row with nothing in the middle is honest and a row with invented copy in it is not.** One tier → 6 Single Tier, named.

**a11y.** A7's shared structure. **The one design where DOM and visual order differ by one element** — the action is fourth in the DOM and last on screen — and tab order follows the DOM, so a keyboard reader reaches the action before the benefit list. The action's width is fixed at 200 rather than the row's: **A7's fill-the-card rule applies to a card, and a 1,232 px button is not a button.**

**Flagged.** The 300 / 200 fixed columns and the 64 px gutters, the top alignment, the 16 px row gap not following Row padding, the three plane values and the recommendation falling to two signals at None, the full-bleed recommended row, the two-column benefit list and the 34-character advice, the action's fixed width, the DOM-order exception, and this design being the category's collapse target.

---

## 4. Split Head

A5·5's division: the head held at the left margin, the tiers in a column of rows to the right. It exists to answer one question the others do not have — **where the cadence switch belongs when the head is not above the tiers.**

**Fields.** As 1. **Everything authored is in the left column and everything from Ghost is in the right one**, which is the design's whole argument.

**Controls.** Padding (row padding fixed at 28) · Ground · Billing period · Title size (**Display 48 unavailable at Head narrow**) · **Division (Head narrow 440/792 · Head wide 560/672)** · **Divider (Show · Hide)**. Both divisions and the divider are unavailable at 1080 and below.

**The switch belongs to the head.** It is a control over the prices, not one of them: 20 px under the sub, left-aligned with it, the saving line 10 px beneath rather than beside, because a 440 px column has no room for both on one line. **The note goes to the foot of the head column**, 28 px under the switch. The head is **top-aligned to the first row and never centred** — a head that drifted down as a site added a tier would be a head that moved for reasons a reader cannot see.

**The tiers are 3 Stack's rows at 792** — name column 220, action 160 — cited rather than re-decided. **At Head wide the rows lose their middle column** and the benefits move under a hairline inside each row, which is the tablet arrangement drawn at desktop width; the sidebar says so rather than pretending the value is free.

**The divider is a hairline in the gutter and never a border on either column**: 32 px from both, the height of the taller column, a `border` token and never an `<hr>`. Off by default.

**Responsive.** At 1080 and below the head goes above the tiers on a 600 px title measure with 3 Stack's rows beneath; the switch keeps its place in the head and puts its saving line back beside it; the note ends the section. At ≤ 767 the design is 1 Cards' single column with the switch under the head.

**Empty.** As 1. **No sub and no switch → the head is an eyebrow, a title and a note**, and the editor names 1 Cards, whose centred head does not leave 440 px half empty.

**a11y.** One `<section aria-labelledby>` holding both columns, never two sections. **The switch is the section's first tab stop** at every width and both divisions — the argument for keeping it in the head — and changing it moves no focus and announces nothing. The note is a paragraph, not `aria-describedby`.

**Flagged.** The switch belonging to the head and being first, the note at the head's foot, the two divisions and refusing an even split, the wide division's row losing its middle column, the divider in the gutter and off by default, the top-aligned head, Display 48's refusal at Head narrow, and the 1080 stack with both controls disabled.

---

## 5. Contrast Band

The whole section on the inverted ground, the tiers drawn as panels on it. Ground is not a control here: it is the design. It settles the two things settlement 2 could not settle in advance.

**Fields.** As 1. **`image` is kept and not drawn** — a photograph behind an already-inverted ground needs a scrim the packs do not define.

**Controls.** **Band padding (Compact 44 · Comfortable 64 · Spacious 88** — A4·9's tighter scale, because an inverted block reads as bigger than it is) · **Band edges (Full bleed · Page margin**, the latter taking the pack radius and 56 px of inner padding, 40 at 834; **always full bleed at ≤ 767)** · Billing period · Title size · **Panel style (Hairline · Solid)** · Head alignment.

**What the band changes.** **The accent is spent nothing** — an accent fill carrying the band's colour is 3.2:1 in Paper — so the recommended tier's action is a solid carried-colour fill at 12.8:1 hovering **3% darker rather than 6%**, and the others are hairline outlines in **the carried colour at 45%** with full-strength labels. Muted is the carried colour at 72%; the focus ring is the carried colour. **The badge inverts**: settlement 2's `contrast` fill on a `contrast` ground would be a badge the colour of the thing behind it, so here it is the carried colour carrying the band's own — **the one substitution the recommendation makes anywhere in A7**, and the reason the badge was defined as a token pair.

**Panels** are hairlines in the carried colour at 22% or solids at 7%, the recommended one at 7% or 14%: **the plane step still steps on a ground where a shadow cannot.** No panel has a shadow at any value. **Both mixes are derived rather than tokens**, which is the one place this design invents colour.

**Dark.** Paper's dark `contrast` is light, **so the band is light in dark mode** — the one design in A7 whose modes are not variations of each other, A6·5's rule carried. Muted is a re-tuned `#57524A` at 6.4:1; the recommended action a solid `#171511` fill at 14.9:1.

**Responsive.** At 1080 and below the panels take 3 Stack's rows on the band; band padding 56, inner 40, page ground above and below 40. At ≤ 767 always full bleed, band padding 44/20, panels 24, page ground 24.

**Empty.** As 1. **No recommendation → every panel takes the same style and every action is the carried-colour fill**, the one place in A7 where “no recommendation” makes a section louder rather than quieter.

**a11y.** The band is **not a landmark, region or theme boundary** — a background colour on a named section. Benefit text stays at full strength while marks and descriptions are muted: nine muted lines on an inverted panel is a paragraph nobody reads. The outlined border is 2.4:1 and carries nothing; the label carries it. **Forced colours drop the band and both mixes**, and the section becomes 1 Cards in system colours.

**Flagged.** The 22 / 7 / 14 per cent mixes and their derivation, the badge's inversion, the 45% outline border, carrying A4·9's padding and A6·5's 3% hover and 72% muted, the switch's three derived colours, refusing a shadow at every value, the 56 / 40 / 24 page ground, and the light band in dark mode.

---

## 6. Single Tier

One card at 480, centred, with the free tier beside it. **Settlement 4 built rather than ruled**, and the only design in A7 that hands off upwards.

**Fields.** As 1 minus two: **`recommendedTier` and `badgeLabel` are kept and not drawn** — with one paid tier there is nothing to recommend — and both are kept so a site adding a second tier keeps its answer.

**Controls.** Padding · **Card padding (24 · 32 · 40** — one card can afford the control three could not, and the section's padding stays a control too because there is only one plane to argue with) · Ground · Billing period (**unavailable where there is no paid tier**) · Title size · **Free tier (Beside it · Under it · Hide)**.

**The arrangement.** The paid card 480 px, centred, `surface` with the sm shadow, **price at Display 56** — the ladder's top step, available because there is one price rather than three — and its benefits in two columns, 3 Stack's rule at card scale. The free tier 320 px beside it on a 32 px gutter **with no plane at all**: name, price, description and a text link with a typed arrow, vertically centred against the card. At Under it, one muted sentence — “Or keep reading free — ” plus the authored label — 20 px beneath, **the one place in A7 where a fixed phrase wraps an authored label.** Hide only ever hides the free tier.

**One paid tier is two cards, not one**, because a site with one paid plan is choosing between free and paid. **No paid tier is one card**: the free tier alone, its benefits drawn since there is nothing else to read, the accent back on the only action, the switch gone with the prices it controlled. **The authored head does not change** in either state. This is also the state a site sees before it connects Stripe.

**Responsive.** The pair holds at 834 — 440 + 270 on 24, price 44 — **which is why this design needs no hand-off at that width while 1 Cards does.** At ≤ 767 the free tier is always under the card and Beside it behaves as Under it; Hide is still obeyed, because it is a decision about what the section says rather than where it fits.

**Empty.** No benefits → the card ends at its action and the free tier's own list is drawn instead. **No free tier** — a site can disable it — → the paid card alone, the control unavailable, the setting named. **Three tiers → 1 Cards**, named.

**a11y.** Still a `<ul>` with one or two items: **a list of one is a list**, and a reader switching from 1 Cards should hear the same structure. **The free tier is an ordinary list item**, never an aside or a footnote, and at Hide it is absent from the DOM rather than hidden in it. The arrow is `aria-hidden`, typed and still; the link's target 44 px.

**Flagged.** One paid tier being two cards, the 480 + 320 division and the planeless free column, Display 56 as this design's fixed step, the two-column benefits inside a card, the free tier's three positions and the fixed sentence, dropping the recommendation, the vertically centred free column, the phone's forced Under it, and the hand-off up to 1 Cards.

---

## 7. Highlight

The recommended tier at two thirds of the width with the others stacked beside it. **It asks how far a recommendation may go before the section stops being a price list**, and answers: as far as size, and no further.

**Fields.** As 1, with **`recommendedTier` required rather than optional** — it *is* the design. Without one the section draws as 1 Cards, the sidebar names the empty field, and the picker sits under the message; **the theme never picks a tier by position.**

**Controls.** Padding (card padding fixed at 40 and 24) · Ground · Billing period · Title size · **Division (Two thirds 848/424 · Half and half 636/636)** · **Small tiers (Benefits shown · Benefits hidden)**.

**The arrangement.** The large card is two columns of its own — 380 for name, price at Display 56, description and action; the benefits behind a vertical hairline at 40 px, vertically centred. The small cards stack 16 px apart and stretch to its height. **They are one step down the scale and lose nothing**: name 18, price 34, body 14, action 42 px, full benefit list. **Nothing is removed, only reduced** — a recommendation may take more room and may not take away information. **At Half and half the large card's benefits move under its action** and its hairline goes horizontal.

**What the control may not do:** hide a price, mute a name, remove an action, shrink a small action below 42 px, or draw a small tier's benefits as a count. **Benefits hidden is symmetric** — every small tier or none. A site that wants them quieter than that wants A6·1 Centred, which the editor names.

**Responsive.** At 1080 and below the large card goes full width with its internal columns intact and the small cards sit side by side beneath it at 361 each; **this design does not hand off to 3 Stack** — equal rows would delete it. Price 56 → 44 with the small tiers unchanged at 34, which narrows the gap and is the honest cost of the collapse. At ≤ 767 one column in price order, the large tier still larger by padding, price and plane.

**Empty.** No recommendation → 1 Cards, named. No benefits on the recommended tier → the large card loses its right column and becomes a single column at 848.

**a11y.** **Size is not level**: every tier name is an `<h3>` at 20 or 18 px. The large tier is not `aria-current`, not a figure and not a landmark; **the badge is the only thing that says it is recommended**, which is why the badge is text. **DOM order is Ghost's price order while the visual order puts the recommended tier first** — the largest DOM-to-visual difference in A7 — and tab order follows the DOM, so a keyboard reader meets the cheapest tier first at every width.

**Flagged.** Requiring a recommendation, the two divisions, the large card's internal columns and vertical hairline, Display 56 and 34, the one-step-down scale that removes nothing, Benefits hidden being symmetric, the 42 px floor, refusing the 3 Stack collapse, and the tablet's narrowed price gap.

---

## 8. Slim Row

The tier names and prices on one line, no benefits, and **one action for the whole section rather than one per tier.** A7 without its list.

**Fields.** `note` · `payLabel` · a section action label (≤ 20, default “See all plans”). **Kept and not drawn: `eyebrow`, `title`, `sub`, `recommendedTier`, `badgeLabel`, `freeLabel`** — the largest kept-and-unused set in A7, and the design's whole argument. **Benefits and descriptions are not read at all.**

**Controls.** **Padding (Compact 32 · Comfortable 44 · Spacious 56**, its own scale, measured inside the rules) · Ground (Background · Surface · **Contrast** — offered here and nowhere outside 5, because one line of prices is small enough to invert without a design of its own) · Billing period · **Prices (Beside the names · Under the names)** · **Rules (Above and below · Above only · None**, the last on a plane only) · **Action (Button · Text link)** · Alignment (Split · Centred). **Seven controls — the category's ceiling, and the only design that reaches it.**

**The arrangement.** Names 20 px, prices Medium 34 on a shared baseline, 10 px apart, tiers 48 px apart, the action at the right at A1·1's 14 px/600 and 9×17 — **the only design in A7 not at the card scale**, for A6·10's reason. The note under it at 13 px. **Under the names is the value for real tier names**: “Founding member” beside a price is a line that wraps in the middle of a number.

**The action goes to the site's pricing page**, not to Portal, **because a single action cannot choose a tier** and a section that guessed would be choosing for the reader. **With one paid tier it becomes that tier's Portal link** and takes `payLabel`. **No recommendation is drawn at any value**: a badge on one price with no per-tier action to move the accent to is a mark a reader cannot act on.

**Not A2, and not A6·10.** A2 owns the strip pinned at the top of the page; this is a section in the flow — it scrolls, carries no close control, remembers nothing, and a page may hold two. A6·10 Slim is the same shape carrying a sentence and an ask; this one carries prices and no sentence.

**Responsive.** The row holds above 767 with the gaps tightening — 48 → 32, name 18, price 30, padding 36. **The design's limit is the sum of its names and prices, not the window**: four tiers wrap to a second line, a supported state. At ≤ 767 three rows, name left and price right on a shared edge, the action full width at 48 px beneath, Alignment ignored, the rules kept.

**Empty.** No note → the action alone. One paid tier and no free tier → one name and one price, and the editor names A6·10.

**a11y.** A `<ul>` of `<li>` with h3 names laid out as a row. **The section has no `<h2>` and takes no `aria-labelledby`** — A7's one unlabelled section, shared with 12 Ledger — rather than being labelled by invented text. One tab stop; no tier is a link.

**Flagged.** One action for the section and its pricing-page target, the fallback to Portal at one paid tier, dropping the head and the benefits, refusing the recommendation, the 32/44/56 scale, the 48 px tier gap, price at Medium 34, offering the Contrast ground, Rules None being plane-only, the switch joining the price group, the seventh control, and the phone's shared right edge.

---

## 9. Big Price

The price set large enough to be the section: 88 or 112 px, flush left, a rule under it, the benefits beneath. **The only design in A7 above the price ladder, and the only one that refuses three tiers.**

**Fields.** As 1. **The free tier is drawn as one sentence with a link** — fixed copy, the tier's own description and `freeLabel` — because the design has room for one alternative.

**Controls.** Padding (Compact advised at Huge) · Ground · Billing period · **Price scale (Display 88 · Huge 112)** · **Rule (Show · Hide**, the gap 32 → 24) · **Benefits (Two columns · One column · Hide**, the rule going with them).

**The arrangement.** Tier name 20 px above the price, **the cadence still 17 px muted beside it** — a big number that swallowed its unit would be a number a reader has to guess at — the description and action at the right of the price's line, **baseline-aligned to its foot rather than centred against it**. The rule 32 px under, the benefits 28 px under that **filling across rather than down**, the free sentence 28 px below, the note last. Line height 1 at −0.035em and −0.04em.

**The price's width is the real constraint, not its height.** “€7” is 130 px at Display 88; “€1,200” is 720 at Huge — **past which the description and action drop to a row of their own**, measured rather than counted, so a currency written as a code behaves the same way. The editor advises Display above four figures and does not disable Huge.

**One or two paid tiers only.** Two stack, each with its own price block, separated by a rule, the recommended one keeping the accent and **the badge doing the plane's work, since there is no plane.** Three or more → 1 Cards, named: two 112 px numbers on a page is a poster, three is a chart.

**Responsive.** At 1080 and below the description and action take their own row 20 px under the price; price 88 → 64, 112 → 76. At ≤ 767 everything stacks, **price 44 at Display and 48 at Huge — the two values nearly converge and the sidebar says so** — and even at 44 the number is still the largest thing on screen.

**Empty.** No benefits or Benefits Hide → the rule goes with them. No description → the action alone at the right of the price's line. No free tier → the paid tier and its note.

**a11y.** **88 px is a size, not a level** — the tier name is the h3 and the price is a paragraph under it; **the number is never the heading**, because a heading called “€7” is a heading nobody can navigate by. Tracking is applied to the number and not to the cadence. DOM and visual order agree at every width.

**Flagged.** The 88 / 112 scale and its tracking, the cadence staying 17 px, the shared price line and its measured 720 px drop, the 32 / 28 gaps, benefits filling across, the free tier as a sentence, refusing three tiers, two paid tiers stacking, and the phone's near-converged values.

---

## 10. Tabs

Tier names as a tab row, one tier's card at a time. A5·12's tabs verbatim, plus **A7's second and last behaviour.**

**Fields.** As 1. **The recommendation does one extra thing here: it sets which tab opens** — never the first, never the most expensive. With none authored the free tier opens. **Flagged twice**, because a default selection is a stronger nudge than a badge.

**Controls.** Padding (panel padding fixed at 40) · Ground · Billing period · Title size · **Tab style (Underline · Pill)** · **Panel width (Measure 880 · Content width**, unavailable at 1080 and below).

**The arrangement.** The tab row centred under the head, 15 px/600 labels with 20 px of side padding on a full-width hairline, **the badge inside its own tab** — the tab row is where the tiers are compared, so that is where the mark belongs. **The tabs carry names and no prices**: a reader who can see three prices does not need to switch. The panel 32 px beneath is **7 Highlight's large card verbatim** at a stated 880 px measure, because a single card 1,296 px wide is a band. **Its height follows its content and is not reserved** — the tabs are above it and stay put.

**Two accents on screen at Underline** — the selected tab's 2 px accent underline and the recommended tier's button — **a stated exception to the once-per-section budget**, allowed because the underline is a state rather than an object: it says where you are, not what to do. **Tab style Pill spends none.**

**The behaviour.** Cross-fade at 160 ms, nothing slides, no carousel and no track; instant under reduced motion; **nothing is remembered** — no storage, no fragment, no return to a previous tab on reload. It does not run while editing.

**Responsive.** At 1080 and below the panel becomes 3 Stack's two-line row inside its card and Panel width is unavailable; **the tab row holds**, which makes this collapse gentler than the columned ones. At ≤ 767 three tabs share the column at equal thirds, 44 px tall, **the badge moves under the row and belongs to whichever tier is selected**. **The tabs never become a select, an accordion or a scroller.**

**Empty.** One tier → no tab row, and the design is 6 Single Tier. Four or five tiers → the row wraps to a second line, a supported state.

**a11y.** A real tab set: `role="tablist"` labelled “Membership tiers”, `<button role="tab">` with `aria-selected` and `aria-controls`, one `role="tabpanel"` labelled by its tab, arrow keys between tabs, Home and End, one tab stop for the row, **selection following focus** and no announcement. **The tiers are not a `<ul>` here** — the tablist is the list — A7's one structural exception besides 2 Table's. **Only the selected panel is in the DOM**, and the consequence is stated: **a reader who cannot switch tabs cannot read the other prices**, which is why the editor names 1 Cards where prices are close and the comparison is the point.

**Flagged.** Tabs carrying names and no prices, the recommendation setting the default tab, the badge riding in the tab and moving on a phone, two accents at Underline, the 880 px measure, the unreserved panel height, rendering only the open panel, and refusing any other phone control.

---

## 11. Free and Paid

Two tiers drawn as what they are: **an open door and an offer.** The free tier is a block of text on the page's own ground; the paid tier is the only card.

**Fields.** As 1, and **both tiers draw all six of their facts** — nothing is summarised or dropped on either side. **Exactly two tiers, one free and one paid.**

**Controls.** Padding (card padding fixed at 32, the free half 32 top and bottom and nothing at the sides) · Ground · Billing period · Title size · **Division (Even halves 632/632 · Weighted to the paid tier 440/824**, where the card's benefits go to two columns; unavailable at 1080 and below) · **Free tier action (Text link · Outlined button)**.

**The arrangement.** A 32 px gutter with a full-height hairline centred in it — the free half's only edge, a `border` token and never an `<hr>`. Both halves at the same type sizes. **The plane is the only difference between them**, and it does all the work the badge and the accent would otherwise share. **The free half puts its action last and the card puts its above the benefits**: a real inconsistency, deliberate, because a text link at the foot of an unplaned column reads as the end of a paragraph, which is what the free tier is. **The DOM order is identical in both halves.**

**No second accent fill at either value** — two filled buttons 32 px apart is a page asking a reader to choose rather than to act, A6's refusal carried whole. Outlined button borrows settlement 2's outline at the same 44 px shape.

**Responsive.** The halves hold at 834 at 365 each with **the divider dropped** — the card's own edge is 12 px from where the hairline would be, and two lines 12 px apart is one line drawn twice. **At ≤ 767 the paid tier comes first** — the one design in A7 that reorders its tiers, **and the DOM order changes with it**, so reading and tab order still match — with a horizontal hairline between them.

**Empty.** No benefits on the free tier → the halves are honestly unequal. **No recommendation → the paid tier keeps its card and its accent**; only the badge goes, because the plane here says “this is the offer” rather than “this is recommended”. **A second paid tier → 1 Cards; the free tier turned off → 6 Single Tier**, both named in the panel before they happen.

**a11y.** A `<ul>` of two, both names h3s, both lists nested. **The free half is not an aside, a note or a complementary landmark** — the two halves are the same kind of thing and one has a plane. **A planeless column is not a quieter column**: its text is at full strength and only its description and marks are muted.

**Flagged.** The plane as the only difference, both halves keeping every fact, the free half's action position, the full-height divider and its drop at 834, the two divisions, the two free-action values, the accent staying with no recommendation, the phone's reorder, and both hand-offs.

---

## 12. Ledger

No planes at all: hairline rows, the name at the left, the price at the right, the benefits as one muted line beneath. **It asks whether a tier needs a card**, and is the quietest thing A7 can put on a page.

**Fields.** `note` · `recommendedTier` · `badgeLabel` · `payLabel` · `freeLabel`. **Kept and not drawn: `eyebrow`, `title`, `sub`** — with 8 Slim Row, the only two designs in A7 with no head — **and the tier description**, whose work the benefit line does in the same place.

**Controls.** Padding · Ground · Billing period · **Row height (Compact 20 · Comfortable 28 · Spacious 40)** · **Benefits (One line · As a list · Hide)** · **Actions (At each row · One for the section · None** — offered here and nowhere else in A7).

**The arrangement.** A `border-top` on every row and a `border-bottom` on the last. The name 24 px — a step above every other design's 20, since here it carries the row alone — the badge beside it, the benefit line 15 px muted under it, **the price right-aligned on a fixed 170 px column** (the only right-aligned price in A7: a ledger's numbers line up or it is not a ledger) and the action left-aligned on a fixed 150 beyond it. **No planes, no shadows and no outlined actions at any value** — a row with no plane has no cell to fill, so the recommended tier takes the accent fill and the rest are text links with typed arrows.

**Actions None** exists because this design is already a reference table; the sidebar states the consequence — “Readers cannot subscribe from this section” — and names the other two values beside it.

**The recommendation has no plane to step**, so it is the badge and the accent alone: 3 Stack's rule at Row planes None, cited.

**Responsive.** At 1080 and below the action moves under the benefits at the left and the price takes the right margin on a 150 px column; name 22, price 30. **The prices still share an edge**, which is the rule that matters. At ≤ 767 the name and price share a line at 20 and 28 px, benefits under, action last, row heights 16 · 20 · 28; **the badge takes its own row** unless Benefits Hide, where it shortens and stays beside the name — the one place in A7 the badge leaves the name's line.

**Empty.** No benefits on a tier → a name and a price, the design at its most honest. No recommendation → no badge and every action a text link, so the section spends no accent at all.

**a11y.** A `<ul>` of rows, names h3s at 24 px, **no `<h2>` and no `aria-labelledby`** — A7's second unlabelled section, **and a page should not run both**. **The middot line is a real `<ul>`** of inline `<li>` with `aria-hidden` separators drawn in CSS, so a reader hears “list of 4 items” rather than a sentence with punctuation in it. **The muted benefit line at 5.4:1 is the design's weakest point and is stated**; Benefits As a list returns it to full strength and the editor names that value for a site whose benefits are the argument.

**Flagged.** The right-aligned price and its 170 px column, the 150 px action column, the 24 px name, dropping the head and the description, the middot line and its muted colour, the three row heights, Actions None and its consequence, refusing the outline, the tablet's moved action, and the phone's badge row.

---

## 13. Members

1 Cards reading Ghost's member state. A6·14 read two facts about a reader; **this design reads a third — which tier they are on — and that is the only new thing it does.**

**Fields.** As 1, plus **`memberTitle` (≤ 90) and `memberSub` (≤ 180)**, A6·14's fields, drawn at Member head Show for signed-in readers only.

**Data — and only this:** signed in or not, paid or not, **which tier**, and one date: the renewal date for a paid member, the join date for a free one. **Not the reader's name, email, avatar, card, billing history or amount paid.** A cancelled or expired subscription **reads as a visitor**. Four states: visitor, free member, member on a lower tier, member on the top tier.

**Controls.** Padding · Ground · Billing period · Title size · **Current tier (Marked · Marked, no accent · Not marked)** · **Member head (Show · Hide)**.

**What the member state changes, and nothing else.** The reader's card takes the plane step and **loses its action**, replaced by one muted date line between two hairlines — **a disabled “Current plan” button is not offered**, because a control a reader cannot use should not be drawn. **The badge becomes an outline**: “Your plan” is a fact about the reader and “Most popular” is a claim by the site, and **where they land on the same tier “Your plan” wins.** The other actions read “Upgrade” from the free tier and “Change plan” from a paid one — **no “downgrade” anywhere in the copy.** **The accent moves to the most expensive tier the reader is not on** and disappears entirely at the top tier: the one computed accent in A7, flagged twice, with a control that turns it off.

**Refused:** proration or saving arithmetic, any billing detail, invoice or cancel control, any personal detail. **All member actions go to `#/portal/account/plans`** — three buttons, one destination, because Portal chooses the tier there and a theme deep-linking past that choice is a theme guessing. Stated rather than hidden.

**Responsive.** 1 Cards' exactly, with the renewal line in the action's 168 px slot at 834 and **the date shortened to fit** — the one place in A7 where a rendered value is abbreviated by width. **The member's card is never moved to the top**, any more than the recommended one is.

**a11y.** “Your plan” is **plain text in the heading's row — not `aria-current`, not a role, not a state**; `aria-current` describes a position in a set of links, and a subscription is not that. **Membership is never exposed as a state, badge or role.** The renewal line is a paragraph, not focusable and not `aria-disabled`, so a keyboard reader meets nothing dead between two actions. **The state is server-rendered and the other states are not in the page**; nothing is announced, nothing is remembered.

**Flagged.** Reading which tier a reader is on, the two dates being the only member data drawn, the action's replacement by a date line, the outlined badge and its precedence, the computed accent and its disappearance at the top tier, “Upgrade” versus “Change plan”, treating cancelled as visitor, the three-controls-one-destination cost, and the tablet's shortened date.

---

## 14. Assurances

The tiers with three short lines under a hairline saying what happens at checkout. It reuses A6·11's `reasons[]` verbatim and settles **where a site may write a claim about payment, and what a theme may not write for it.**

**Fields.** As 1, plus **`reasons[]`** — one to three lines, ≤ 40 characters each, 20 advised at Stacked, **text only: no icon, no body, no link**. `note` is kept and not drawn: the strip replaces it, because “Cancel any time from your account page” and “Cancel in two clicks, any time” under the same hairline is the same sentence twice.

**The settlement.** **The field is empty by default and the theme writes nothing into it.** The editor offers three suggestions as chips — cancel, Stripe, card details — which a site can accept, edit or ignore. **A theme that shipped “Secure checkout” as a default would be publishing a security claim on behalf of a site that never read it.** **No badge, seal, lock, shield or card-brand logo at any value**; no guarantee, trial or refund copy the site did not write. **A fourth line is refused** and the editor names A5·11 Checklist.

**Controls.** Padding (card padding fixed at 32) · Ground · Billing period · Title size · **Assurances (Row of three · Stacked)** · **Mark (Rule · Check · Dot)**.

**The arrangement.** 1 Cards' three cards, then 40 px, then a full-width hairline, then 28 px to the strip: three equal columns on a 48 px gutter, each a 40 px rule above a 15 px line at 500 in `text` — one weight above the benefits inside the cards, because these are the things a reader hesitating over a price actually wants. **One line is drawn at the left, not centred**: a single sentence centred under three cards reads as a caption to the middle one.

**Mark Rule is the default here where A6·11's was Check**, and the reason is the tick's other job: a check mark 40 px below three cards full of check marks reads as a fourth benefit list, while a 40 px rule reads as a heading's underline — which is what these lines are. **The mark is `text-muted` at all three values and an accent mark is not offered.**

**Responsive.** At 1080 and below the tiers take 3 Stack's rows and **the strip goes to a 2 + 1 grid** on a 32 px gutter — three columns of 235 px at 15 px would give each line three words. At ≤ 767 **the strip is always stacked** and the control is ignored, 18 px apart, the type unchanged. The 32 px above the hairline holds at every width, which is what stops the strip reading as the last card's footer.

**Empty.** **No assurances → no strip and no hairline**, and the design is 1 Cards with the note restored; the editor says so at the field rather than drawing an empty rule.

**a11y.** A `<ul>` of one to three items, **after the tier list in the DOM and never inside it** — the assurances are about the transaction, not about a tier. **Not headings**: 15 px at 500 is emphasis and the section already has its one heading. The mark is `aria-hidden` and drawn from `currentColor` at all three values, so forced colours keep it; nothing is a checkbox. **No assurance is ever a link.**

**Flagged.** The whole settlement that a payment claim is the site's to write, the three suggested chips, Rule as this design's default mark, the 40 px rule, the strip replacing the note, 15 px at 500 against the benefits' 400, the 2 + 1 tablet grid, the phone's forced stack, refusing a fourth line, and refusing every badge, seal and card logo.

---

## 15. Both Prices

Both cadences on every card — yearly at the price size, monthly muted beneath — and **no switch at all.** §8 asked whether the monthly / yearly choice is a control or content; the other fourteen answer “a control”, and this one answers “content”.

**Fields.** As 1, unchanged. **Both of a tier's prices are drawn and nothing about the pair is authored**: the second price is Ghost's other one and the saving is the same whole-month calculation the switch's line makes elsewhere. **Nothing is struck through and no percentage is ever shown** — “Save 17%” is a number Stripe never charges and a rounding a site never chose.

**Controls.** Padding (card padding fixed at 32) · Ground · Title size · **Lead price (Yearly · Monthly)** · **Second price (Under it · Beside it · Two prices)** · **Saving line (Show · Hide)**. **There is no Billing period control.**

**The arrangement.** 1 Cards' three cards, with one 15 px muted line 6 px under the lead price carrying the second cadence and the saving together — “or €7 a month · two months free on yearly” — with a middot between them. At Beside it the second price sits on the lead's baseline 12 px to its right and the saving takes its own line. **At Two prices both are at price sizes — 48 and Medium 34 — with a hairline between**, and the editor advises against it at the control rather than hiding the value: two numbers of comparable size in one card is a card that asks a reader to do arithmetic before it asks them to subscribe.

**The free tier's line is “No card, no renewal”** — fixed copy in the second price's place, so the three cards keep one shape and the free card does not have a hole in it. Invented, and flagged.

**Per-card, not per-section.** A tier with no yearly price loses its second line and leads with monthly **on that card alone** — the opposite of the switch's rule, because a control must be true of everything it controls while a line of text need only be true of its own card. Where the saving is under a month the middot and the second half go, and **the theme never says “no discount”.**

**The action's URL carries the lead cadence and its label says neither.** At Lead price Yearly the button opens Portal on the yearly plan and a reader who wanted monthly changes it there. **That is a real cost of drawing both without offering a choice**, stated on the frame and in the panel rather than papered over with an `aria-label`.

**Responsive.** At 1080 and below the second line joins the price's baseline whatever Second price says, and **the saving shortens to “two months free”** — the one place in A7 where computed copy changes with width. At ≤ 767 it goes back under the price at every value and Second price is ignored; **this is the design's best width.**

**a11y.** The lead price is one readable string in its own paragraph and **the second line is a second paragraph**, its middot a real separator read as a pause. DOM order is A7's with one element inserted after the price. **No `<button>`, no `aria-pressed` and no cross-fade — the one design in A7 with no behaviour of any kind**, and the reason a site with a reduced-motion or no-JavaScript audience might choose it.

**Flagged.** The one-line pairing of second price and saving, the free tier's fixed line, the per-card fallback, the three second-price arrangements and the advice against Two prices, the Portal link following the lead cadence, refusing a strikethrough or a percentage, and the tablet's shortened saving.

---

## Category artefacts

In `A7-0 Category Proof.dc.html`:

- **The four settlements** §8 asks A7 to make — tier counts of one, two and three and the switch as a control (with 15 as the content answer); the recommendation as three signals and no new colour; the Portal hand-off and what the button says before it; a site with one paid tier and a site with none. **All four answers are invented**, and each is flagged there, on the frames that draw it, and in this document.
- **The ladders** — the new price ladder, A6's borrowed head ladder, the tier card, the switch and the two action scales.
- **The rules all fifteen share** — structure, labels, DOM order, the Portal boundary, motion, focus, data, empty, and the fact that A7 has exactly two behaviours.
- **The roster** — all fifteen, what each is for and what it settles or refuses, plus what is deliberately not in it.
- **The shared field list** — nine authored fields and six read from each Ghost tier, with types, caps and three stated refusals: nothing about price or benefits is authorable in a section, no offer or discount copy, no per-tier action label and no fourth column.
- **The tokenisation proof** — 1 Cards in Paper, Tangerine and Ink, light and dark, six frames, with only tokens changing. The two dark accents are **derived there rather than taken from a pack definition**, and flagged.
- **The stress frame** — seven caps at once on 1 Cards: a 26-character eyebrow, a 104-character title at Display 48, a 178-character sub, a 15-character tier name beside an 18-character badge, an 11-benefit tier next to a 2-benefit one, a €1,200 yearly price, a 20-character action label and one tier with no description. With the mobile frame and what the editor says about each.
- **The consistency pass** — what was checked, the eight things that were wrong or unstated, the pattern in them (**six of the eight are designs with no card, or designs that know something about the reader**), what A7 owes the categories after it, and the note that **no frame in A7 has been built**, so every ratio quoted is computed from hex values rather than measured.

## Hand-offs out of A7

| Boundary | Owner |
|---|---|
| A single ask with no price on it | A6 CTA Banners |
| A feature list with no prices | A5·11 Checklist |
| Checkout, offers, discounts and the account dialog | Ghost Portal |
| The account page a member manages their plan on | A30 Members Pages |
| What a reader may and may not see | A32 Paywall |
| Questions about pricing, answered | A9 FAQ |
| A named person's endorsement of a plan | A8 Testimonials |
| The newsletter section proper, with its own head and terms | A22 Newsletter |
