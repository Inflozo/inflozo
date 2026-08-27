# A7 Pricing and Tiers — written specification

15 designs · Paper pack · drawn in this project as `A7-1 Cards.dc.html` … `A7-15 Both Prices.dc.html`, with the category's shared artefacts in `A7-0 Category Proof.dc.html`.

Read `A7-0` first. It carries the four settlements §8 asks A7 to make, the ladders, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

**Specification-only pass, this session.** Every design now carries four added fields — descriptor, structural descriptor, archetype, behaviour module — at the head of its section. Nothing drawn changed and no earlier field was rewritten. **One correction is in scope and has been made:** the two module names this document coined, `M-cadence` and `M-tabs`, are not in the fixed 31-module registry (FR-G7) and map to nothing the build can compile. They are renamed to the registry modules they actually are — `price-toggle` and `tabs` — and each design's no-JS sentence is now the registry's own, quoted, rather than one composed here. **The frames and spec cards carried the coined names, and 10 Tabs' panel carried the no-JS claim that pass overturned; on module names and no-JS degradation the registry is the authority rather than the drawn panel. That drawing debt is paid in the fourth pass below.**

**Fourth pass — the controls-reconciliation patch (this document's current state), 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface, reusing the shared **P0 editor primitives by name** — the P0·1 inline toolbar and its link popover, the P0·2 icon slot and Icon Picker, the P0·3 item controls, the P0·4 member-aware action editor, the P0·5 Populate-from panel, the P0·6 state switcher — never redesigning them. Every design gains the universal trio outside its own list; **every Padding row and every Ground row retires into it**, keeping its own resolution and its own refusals; **Member Visibility lands on fourteen designs** (13 Members' four reader states subsume it); **Description (Show · Hide) lands on the nine card designs**; the Data floor is written properly, gate and query included; every URL opens the Ghost-aware Link Picker and every action takes an optional P0·2 icon; five fixed English strings become authored fields and three become catalog strings; and **10 Tabs' owed drawing pass is done** — the registry's names on its frames, the “only the selected panel is in the DOM” claim withdrawn. **No layout was redesigned, no module changed, and no control was added to a design that had no use for it.** Where this pass conflicts with an earlier ruling the conflict is recorded — one line each — in the closing **Reconciliation notes**, which open with every frame changed. **No “Preview” control existed anywhere in A7, so none had to be removed:** states while editing are the P0·6 switcher's job, and 13's reader states are its subjects here.

**A7 has two modules and no others, and both are the registry's.** **`price-toggle`** is the billing-period switch: two `<button>`s with `aria-pressed`, a 160 ms cross-fade, the computed saving line, present only at Billing period Both and unavailable where any tier has no yearly price. **`tabs`** is 10 Tabs' tier switch. Everything else that looks like behaviour here is CSS or markup: the 1080 and 767 hand-offs are media queries, 2 Table's sideways scroll is native overflow with a `position: sticky` name column, 9 Big Price's price-width drop is a wrap, and 13 Members' four reader states are server-rendered.

**Edit-safe** means the module does not run while the section is being edited and never writes to authored DOM — the category's motion rule stated as a property of the module. Both modules are edit-safe, with no exceptions, which is why every frame in A7 is a resting state.

**No-JS baseline.** Prices, benefits, badges, planes and actions are all server-rendered, and every action is an `<a>` to a Portal fragment, so **all fifteen designs render complete and subscribable with JavaScript off** — 10 Tabs included, its module degrading rather than failing. Each module's degradation is the registry's and is an acceptance criterion (FR-G4): `price-toggle` — “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” `tabs` — “All panels render stacked and visible, each preceded by its tab label as a heading.” **The consequence for A7 is worth naming, because it is not what this document assumed.** The switch's no-JS branch is 15 Both Prices' arrangement, reached by degradation rather than by choice: the fourteen designs carrying the switch must server-render both of a tier's prices, each labelled in words, and the module reveals one of them. Where a design has no room for two prices side by side the pair stacks — 2 Table's column head, 8 Slim Row's line, 9 Big Price's number, 12 Ledger's price column — both still drawn and both still labelled. The action's `<a>` carries the cadence the page was rendered with, monthly, which is now one of two visible prices rather than the only one, and each design states that cost rather than papering over it. At Billing period Monthly or Yearly there is no module and nothing to degrade.

**Repeating items.** The tiers come from `{{#get "tiers"}}` and the site does not author them: **no design in A7 offers an Add or Remove control**, the order is Ghost's own price-ascending at every width and in every state (11 Free and Paid's phone reorder excepted, stated there), and the per-design counts, the fewer-than-expected states — including exactly one and exactly zero — and the missing-field behaviour are in §0 and in each design's Empty rule, unchanged by this pass.

**Flagged.** The edit-safe definition, the structural-descriptor vocabulary, and the inference that `price-toggle`'s degradation obliges every switched design to server-render both prices — with the stacked accommodations that follow on 2, 8, 9 and 12 — are inventions of this pass. **The module names are no longer among them:** `price-toggle` and `tabs` are the registry's, and their no-JS sentences are quoted from it.

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

**The Data floor — this pass, and it replaces the one-line version above.** “Members off in Ghost → the section does not render” under-specified it. The tier query is `{{#get "tiers"}}` **filtered `type:paid+visibility:public`**, in Ghost's own price order, and **the free tier is its own `type:free` object** rather than a member of that set. **Every paid CTA and the cadence switch gate on `@site.paid_members_enabled`**, not on tier presence: **Ghost seeds an active $5 paid tier at install**, so a site that has never connected Stripe still returns a tier, and tier presence never implies purchasability. Where the gate is closed the paid actions and the switch do not render and the section falls to its free-tier state — 6 Single Tier's no-paid-tier arrangement, which is the same state a site sees before it connects Stripe. **The tiers are a Ghost-sourced list: no Add, no Remove, no reorder, on any design, at any width.** Members off entirely → no section. All of it is stated in every design's Data group.

**The universal trio — this pass.** Every placeable section carries **Background role** (Background · Surface · Contrast), **Vertical spacing** (Compact · Comfortable · Spacious) and **Top divider** (None · Line · Fade, default None) **outside its own control list**. The old per-design Padding rows were Vertical spacing under another name and retire everywhere, keeping their resolutions: 64 · 96 · 132 on eleven designs, **5 Contrast Band's band at 44 · 64 · 88** and **8 Slim Row's bar at 32 · 44 · 56**. The old Ground rows retire into Background role with their refusals intact — **Contrast stays unavailable on every design but 8**, which offered it and keeps it, because one line of prices inverts without needing a design of its own. **Background role locks where the ground is the design:** 5 Contrast Band at Contrast, with the reason shown. **Vertical spacing locks at 96 on 3 Stack**, which controls its rows' padding (A5·16's rule), with the reason shown. **Genuinely different ladders keep their own names and their own rows:** 3's Row padding, 6's Card padding, 12's Row height, 5's Band edges. **Top divider locks None on three designs** — 5, whose band carries its own edge, 12, whose first row carries a `border-top`, and 8 at Rules Above and below, where the divider and the design's own upper rule would be one line drawn twice.

**Member Visibility — this pass.** Everyone · Logged out · Free members · Paid members, on fourteen designs: it hides the whole section server-side, and **“hide pricing from paid members” is the commonest ask this category gets**. A single action's audience is P0·4's member-aware editor, and the two are scope-tagged apart as P0·4 draws them. **13 Members is exempt:** its four reader states are a richer model of the same thing and subsume it.

**The Description control — this pass.** **Description (Show · Hide)** lands on the nine designs that draw a tier description — 1, 5, 6, 7, 10, 11, 13, 14, 15. The description is authored in Ghost and feeds Portal, so before this pass hiding it in a section meant deleting it there. It is symmetric everywhere: every tier or none. **2 Table, 8 Slim Row, 9 Big Price and 12 Ledger do not get it** — 2 and 12 drop the description by design, 8 reads neither it nor the benefits, and 9 draws it on the price's own line.

**Editing — this pass.** Every visible authored text edits inline with the **P0·1 toolbar** — bold, italic, underline, link, the link popover carrying open-in-new-tab and rel nofollow / noreferrer / sponsored: `eyebrow`, `title`, `sub`, `note`, `badgeLabel`, `payLabel`, `freeLabel`, 13's `memberTitle` and `memberSub`, 14's `reasons[]` lines, and the four new fields this pass adds. **Ghost-owned content is never inline-editable** — tier names, prices, descriptions, benefits, and 13's renewal and join dates: clicking one shows the plain-text lock and “Edit in Ghost”, and every sidebar keeps the single “Edit tiers in Ghost” line it already had. **Every URL field opens the Ghost-aware Link Picker**, and a subscribe ask is the picker's **Portal · Sign up** action rather than a hard-coded fragment — 8's section action and 12's per-row text links included. **Every action accepts an optional icon** before or after its label from the P0·2 Icon Picker with its size / colour-role popover. **14's `reasons[]` is the category's one authored list** and takes the P0·3 item controls: Add arrives with content, Remove is never disabled, drag reorders, per-item content only. **The Ghost-sourced tier list never shows an Add button.**

**Visitor-facing strings — this pass.** No fixed English ships. **Catalog strings** (theme translation catalog, because the theme composes them from Ghost's own numbers): the cadence words “a month” and “a year”, the computed “Two months free on yearly” and its shortened “two months free”, and 2 Table's visually-hidden “Included” and “Not included”. **Authored fields with the drawn text as the default** (because they are claims a site makes): 6's `freeLine` “Or keep reading free — ”, 9's `freeLine` “Or read free — ”, 15's `freeSecondLine` “No card, no renewal”, and 13's `yourPlanLabel` “Your plan”, `upgradeLabel` “Upgrade” and `changeLabel` “Change plan”. The shared eight authored fields were already fields and are unchanged.

**Content.** Orbit Weekly's three tiers throughout: **Free** — the Thursday letter, two open issues a month, reply to any issue. **Reader · €7 a month, €70 a year** — everything in Free, the archive since 2019, reader threads on every issue, monthly source files. **Quarterly · €18 a month, €180 a year** — everything in Reader, four printed issues a year, named in the colophon, a seat at the monthly call. Recommended: Reader. Both yearly prices are ten months of the monthly one, so the computed line reads **“Two months free on yearly”** in every frame.

---

## 1. Cards

Three tier cards in one row under a centred head. The floor the other fourteen depart from, and the design every hand-off names.

**Descriptor.** The category's floor: three equal cards on the page ground with nothing added to them, and the arrangement nine other designs hand off to rather than inventing one of their own.

**Structural descriptor.** `grid-of-N · none · page · few · none · plane step plus badge`

**Archetype.** grid-of-N

**Behaviour module.** `price-toggle` at Billing period Both, none at Monthly or Yearly — this design has no other module. Edit-safe: suspended while the section is edited, writing nothing to authored DOM and remembering nothing between loads, so the editor always shows the resting state. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” The three cards, three actions, the badge and the plane step render complete around them, and each card carries two labelled prices where it would otherwise carry one. **The one cost, stated:** the action's `<a>` carries the cadence the page was rendered with — monthly — while two prices are visible, so the link agrees with one of them and the label names neither. A site whose readers run without JavaScript sets Billing period to Monthly or Yearly, where there is no module and one price, or uses 15 Both Prices, which draws the pair on purpose at every width.

**Fields.** The authored eight and the six read per tier, as §0. Everything else in the shared list kept and not drawn.

**Controls.** Padding · Ground (Background · Surface — **no Contrast**, since a band needs its own edges and refusals and 5 is the design for it) · Billing period (Monthly · Yearly · Both) · Title size · Head alignment (Centred · Left, where the switch and note go to the left margin with the head and the cards do not move) · Benefits (Show · Hide).

**Reconciled — this pass.** Padding retires into the universal **Vertical spacing** (64 · 96 · 132) and Ground into **Background role**, where Contrast stays disabled with the same reason. **Description (Show · Hide)** and **Member Visibility** join, and the list reads Billing period · Title size · Head alignment · Benefits · Description · Member Visibility — **six controls, plus the trio and the Data group.** Nothing drawn moved; the card's 32 stays fixed, and this design remains the panel the other fourteen depart from.

**The arrangement.** Three cards of 416 on a 24 px gutter across the 1,296 px content width, stretched to the tallest — **Reader's list is one line longer than Free's and the cards are honestly unequal rather than padded to match.** Card padding 32 fixed here; 3 Stack is the design that controls it.

**Responsive.** Three tiers hold above 1081; at 1080 and below they take 3 Stack's rows and the sidebar names the design they borrow. Padding 96 → 80, card 32 → 28, title 40 → 34, price 48 → 34, rows 16 apart. ≤ 767 as §0.

**Empty.** As §0. Four or more tiers → 3 Stack, named.

**a11y.** The floor, as §0, with two things this design settles for the rest: **the badge is text inside the heading's row and not `aria-hidden`** — “Most popular” is the site's claim and a reader who cannot see the plane step should still hear it — and it is **not part of the `<h3>`**, because a heading called “Reader Most popular” is a heading nobody wrote.

**Flagged.** The price ladder and its words-not-slashes cadence, the free tier's price being the word “Free”, the card's fixed separations and the action above the benefits, the three recommendation signals and the accent's removal from the others, **the outlined action as a departure from A6**, the badge's place on the name's line, the computed saving line, the cross-fade with nothing sliding, the 1080 hand-off to 3 Stack, and the phone's 36 px price.

---

## 2. Table

Benefits as rows, tiers as columns, prices and actions in the head. **The only real `<table>` in the library so far, the only design that scrolls, and the only one that accepts a fourth tier.**

**Descriptor.** The only real `<table>` in A7, the only design that derives a benefit matrix from per-tier strings, the only one that scrolls, and the only one that takes a fourth tier.

**Structural descriptor.** `table · none · page · few · none · continuous recommended column`

**Archetype.** table

**Behaviour module.** `price-toggle` at Both; none otherwise. **The 1080 sideways scroll is not a module** — native overflow on a named `tabindex="0"` container, the name column `position: sticky`, the right-edge fade a gradient. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” A 304 px column head has no room for two prices beside each other, so the pair stacks inside it, both drawn and both labelled, which is what the criterion asks. The whole matrix, the sideways scroll and the pinned column keep working, all three being CSS.

**Fields.** As 1, with **the tier description dropped** — nine rows say what a sentence would — and kept for the designs that draw it.

**The rows are derived, and this is the category's one derivation.** Ghost stores benefits as a list of strings per tier with nothing shared between them, so a matrix has to be built: each string becomes a row when it first appears, the tier that introduced it is ticked, and **every more expensive tier is ticked too, on the stated assumption that paid tiers are cumulative**. A line that names another tier — “Everything in Free” — is read as that inheritance rather than drawn as a row. **Both rules are invented**, both are stated in the sidebar where a site can see the consequence, and **where a site's tiers are not cumulative the editor names 1 Cards**.

**Controls.** Padding · Ground · Billing period · Title size · **Row marks (Check and blank · Check and dash)** · **Rows (Hairlines · Tinted alternate**, where the hairlines go — a tint and a rule doing the same work is two edges per row).

**Reconciled — this pass.** Padding and Ground retire into the trio; **Member Visibility** joins and the list reads Billing period · Title size · Row marks · Rows · Member Visibility — **five**. **No Description control**, since this design drops the description. The cell's visually-hidden **“Included” and “Not included” become catalog strings**, not fields — a hidden English word cannot ship fixed and cannot be a site's to type. And **the degenerate case gets its sidebar disclosure**: where a site's benefit strings never overlap, every row belongs to exactly one tier and the matrix is a list drawn as a grid, so the panel says so and **names 1 Cards as the hand-off** rather than letting a site discover it at nine rows and three columns of blanks.

**The arrangement.** A 384 px row-name column and three tier columns of 304; cell padding 14 fixed; prices Medium 40; the head carrying name, price and action. **The recommended column is one continuous plane** from the head's top to the last row, hairline on three sides, the pack radius at both ends. **Ticks are `text-muted`, never the accent and never red**, and there are no crosses at any value: twenty-seven accent ticks beside one accent button is the accent spent twenty-eight times.

**Responsive.** Above 1081 the table fits the content width. **At 1080 and below it scrolls sideways** — 260 for the pinned name column, 200 a tier — in a `tabindex="0"` container with an accessible name, a visible focus ring and a fade at the right edge; **sticky is a position, not a behaviour**. **At ≤ 767 the design hands off to 1 Cards' single column**, every included row drawn in its tier's card; at Check and dash the excluded rows are drawn muted so the comparison survives.

**Dark.** The alternate tint is `#1D1A15`, **a step down from the ground rather than up**, and the recommended column's hairline goes with it — on a near-black ground a border against a 1.15:1 plane is a line nobody sees. This design's one structural difference between modes.

**Empty.** No benefits anywhere → there is no table, and the editor names 1 Cards or 8 Slim Row. One tier → 6 Single Tier, named.

**a11y.** `<thead>`, `<tbody>`, `<th scope="col">` per tier, `<th scope="row">` per benefit, the table named by `aria-labelledby` from the section's h2 rather than a caption. **The tier name in a head is plain text, not an `<h3>`** — the only design in A7 where that holds. A cell is an `aria-hidden` glyph plus a visually-hidden “Included”; **at Check and blank an empty cell stays empty in the tree**, because inventing “Not included” for a cell the site left blank is putting words in its mouth. No `role="presentation"` anywhere.

**Flagged.** The cumulative-tier assumption and the inheritance-line rule, dropping the description, the continuous column plane, the tick's muted colour, the two row-mark values and the blank cell's silence, Rows Tinted dropping the hairlines, the dark tint stepping down, the 1080 scroll with a pinned column, the ≤ 767 hand-off to 1 Cards, and this being the one design that takes a fourth tier.

---

## 3. Stack

One full-width row per tier: name and price at the left, benefits in the middle, action at the right. **The only arrangement in A7 that does not care how many tiers there are**, which is why every columned design hands off to it at 1080.

**Descriptor.** The only arrangement in A7 that does not care how many tiers there are, which is why every columned design collapses into it at 1080 instead of inventing a second arrangement.

**Structural descriptor.** `stack · none · page · variable · none · full-width rows`

**Archetype.** stack

**Behaviour module.** `price-toggle` at Both; none otherwise. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” Every row renders complete at any tier count, the fixed 300 px name-and-price column taking the labelled pair on two lines. Nothing else in the arrangement depends on script at any width — the two-line 1080 row is a media query, and it is the row five other designs borrow.

**Fields.** As 1, unchanged.

**Controls.** **Row padding (Compact 24 · Comfortable 32 · Spacious 40**, the section's own fixed at 96) · Ground · Billing period · Title size · **Row planes (Cards · Hairline between · None)** · **Benefit columns (One · Two)**.

**Reconciled — this pass.** Ground retires into **Background role**; **Vertical spacing is drawn locked at Comfortable 96** with the reason shown, because this design controls its rows' padding (A5·16's rule), and **Row padding keeps its own name and row** as the genuinely different ladder. **Member Visibility** joins: Row padding · Billing period · Title size · Row planes · Benefit columns · Member Visibility — **six**. No Description control is needed here: the row's description sits in the name column and follows the row, not a switch.

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

**Descriptor.** The only design that puts every authored field in one column and everything from Ghost in the other, and the only one where the cadence switch belongs to the head rather than to the prices it sits above.

**Structural descriptor.** `split · none · page · variable · none · head in own column`

**Archetype.** split

**Behaviour module.** `price-toggle` at Both, and with script running it is the section's first tab stop at every width and both divisions. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” No control renders, so the head loses the first tab stop this design gave it and the 440 px column is an eyebrow, a title, a sub and a note; the computed saving line goes with the switch, the module owning it. Both columns, the divider and every row render, and the two labelled prices sit in each row's name-and-price column. The divisions, the divider and the 1080 stack are CSS.

**Fields.** As 1. **Everything authored is in the left column and everything from Ghost is in the right one**, which is the design's whole argument.

**Controls.** Padding (row padding fixed at 28) · Ground · Billing period · Title size (**Display 48 unavailable at Head narrow**) · **Division (Head narrow 440/792 · Head wide 560/672)** · **Divider (Show · Hide)**. Both divisions and the divider are unavailable at 1080 and below.

**Reconciled — this pass.** Padding retires into **Vertical spacing** (64 · 96 · 132, row padding still fixed at 28) and Ground into **Background role**; **Member Visibility** joins: Billing period · Title size · Division · Divider · Member Visibility — **five**. Division and Divider stay unavailable at 1080 and below, Display 48 stays refused at Head narrow, and the switch keeps the head's first tab stop.

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

**Descriptor.** The only design whose ground is the design rather than a control, and the only place in A7 where the recommendation substitutes its tokens instead of spending them.

**Structural descriptor.** `grid-of-N · none · contrast · few · none · inverted ground`

**Archetype.** grid-of-N

**Behaviour module.** `price-toggle` at Both, drawn in the three derived carried-colour values rather than the pack's. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” The band, both panel styles, the inverted badge, the carried-colour fill and the 45 % outlines render exactly as drawn — every one of them colour rather than script — and the switch's three derived colours are simply unused. Forced colours drop the band and both mixes with JavaScript on or off.

**Fields.** As 1. **`image` is kept and not drawn** — a photograph behind an already-inverted ground needs a scrim the packs do not define.

**Controls.** **Band padding (Compact 44 · Comfortable 64 · Spacious 88** — A4·9's tighter scale, because an inverted block reads as bigger than it is) · **Band edges (Full bleed · Page margin**, the latter taking the pack radius and 56 px of inner padding, 40 at 834; **always full bleed at ≤ 767)** · Billing period · Title size · **Panel style (Hairline · Solid)** · Head alignment.

**Reconciled — this pass.** **Background role is drawn locked at Contrast**, with the reason shown — the inverted ground is this design's identity and not a setting, which is what §0 already said and this pass now says in the control itself. **Band padding retires into Vertical spacing** at the band's own 44 · 64 · 88; the inner padding at Band edges Page margin stays fixed at 56 / 40. **Top divider locks None**: a band carries its own edge. **Description** and **Member Visibility** join: Band edges · Billing period · Title size · Panel style · Head alignment · Description · Member Visibility — **seven**, the longest list in A7 after the ceiling was lifted, and the reason is that this design's ground is spent rather than chosen.

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

**Descriptor.** The only design built for exactly one paid tier, the only one that sets a planed tier beside a tier with no plane at all, and the only one that hands off upwards.

**Structural descriptor.** `split · none · page · one · none · planeless free companion`

**Archetype.** split

**Behaviour module.** `price-toggle` at Both, and **none at all in the no-paid-tier state** — with no paid price there is nothing to switch and the control is unavailable, which is also the state a site sees before it connects Stripe. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” With one paid card at 480 this is the only design in A7 with room to draw the pair literally beside each other; the free tier keeps the word “Free” in all three of its positions, and both actions render unchanged.

**Fields.** As 1 minus two: **`recommendedTier` and `badgeLabel` are kept and not drawn** — with one paid tier there is nothing to recommend — and both are kept so a site adding a second tier keeps its answer.

**Controls.** Padding · **Card padding (24 · 32 · 40** — one card can afford the control three could not, and the section's padding stays a control too because there is only one plane to argue with) · Ground · Billing period (**unavailable where there is no paid tier**) · Title size · **Free tier (Beside it · Under it · Hide)**.

**Reconciled — this pass.** Padding retires into **Vertical spacing**, which **stays a control here** — with one plane on the ground there is one padding to argue with, which is the argument the old panel already made — and **Card padding keeps its own name and row**. Ground retires into **Background role**. **Description** and **Member Visibility** join: Card padding · Billing period · Title size · Free tier · Description · Member Visibility — **six**. **New field: `freeLine`** (opt, ≤ 60, default “Or keep reading free — ”), editable inline with the P0·1 toolbar, still wrapping the authored `freeLabel` at Free tier Under it. A7's one fixed phrase is now a site's own sentence, and clearing it leaves the label alone.

**The arrangement.** The paid card 480 px, centred, `surface` with the sm shadow, **price at Display 56** — the ladder's top step, available because there is one price rather than three — and its benefits in two columns, 3 Stack's rule at card scale. The free tier 320 px beside it on a 32 px gutter **with no plane at all**: name, price, description and a text link with a typed arrow, vertically centred against the card. At Under it, one muted sentence — “Or keep reading free — ” plus the authored label — 20 px beneath, **the one place in A7 where a fixed phrase wraps an authored label.** Hide only ever hides the free tier.

**One paid tier is two cards, not one**, because a site with one paid plan is choosing between free and paid. **No paid tier is one card**: the free tier alone, its benefits drawn since there is nothing else to read, the accent back on the only action, the switch gone with the prices it controlled. **The authored head does not change** in either state. This is also the state a site sees before it connects Stripe.

**Responsive.** The pair holds at 834 — 440 + 270 on 24, price 44 — **which is why this design needs no hand-off at that width while 1 Cards does.** At ≤ 767 the free tier is always under the card and Beside it behaves as Under it; Hide is still obeyed, because it is a decision about what the section says rather than where it fits.

**Empty.** No benefits → the card ends at its action and the free tier's own list is drawn instead. **No free tier** — a site can disable it — → the paid card alone, the control unavailable, the setting named. **Three tiers → 1 Cards**, named.

**a11y.** Still a `<ul>` with one or two items: **a list of one is a list**, and a reader switching from 1 Cards should hear the same structure. **The free tier is an ordinary list item**, never an aside or a footnote, and at Hide it is absent from the DOM rather than hidden in it. The arrow is `aria-hidden`, typed and still; the link's target 44 px.

**Flagged.** One paid tier being two cards, the 480 + 320 division and the planeless free column, Display 56 as this design's fixed step, the two-column benefits inside a card, the free tier's three positions and the fixed sentence, dropping the recommendation, the vertically centred free column, the phone's forced Under it, and the hand-off up to 1 Cards.

---

## 7. Highlight

The recommended tier at two thirds of the width with the others stacked beside it. **It asks how far a recommendation may go before the section stops being a price list**, and answers: as far as size, and no further.

**Descriptor.** The only design where the recommended tier is a different size from the others, and the only one that requires a recommendation in order to exist.

**Structural descriptor.** `split · none · page · few · none · two-thirds width card`

**Archetype.** split

**Behaviour module.** `price-toggle` at Both; none otherwise. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” The division, the large card's internal columns and vertical hairline, and the one-step-down small cards all render intact — the recommendation here is size and type, neither of which needs script — with the labelled pair in the large card's left column and in each small card.

**Fields.** As 1, with **`recommendedTier` required rather than optional** — it *is* the design. Without one the section draws as 1 Cards, the sidebar names the empty field, and the picker sits under the message; **the theme never picks a tier by position.**

**Controls.** Padding (card padding fixed at 40 and 24) · Ground · Billing period · Title size · **Division (Two thirds 848/424 · Half and half 636/636)** · **Small tiers (Benefits shown · Benefits hidden)**.

**Reconciled — this pass.** Padding retires into **Vertical spacing** (card padding still fixed at 40 and 24) and Ground into **Background role**; **Description** and **Member Visibility** join: Billing period · Title size · Division · Small tiers · Description · Member Visibility — **six**. **Description is symmetric like Small tiers** — every tier or none — and, like it, may not hide a price, a name or an action: the recommendation may take more room and may not take away information.

**The arrangement.** The large card is two columns of its own — 380 for name, price at Display 56, description and action; the benefits behind a vertical hairline at 40 px, vertically centred. The small cards stack 16 px apart and stretch to its height. **They are one step down the scale and lose nothing**: name 18, price 34, body 14, action 42 px, full benefit list. **Nothing is removed, only reduced** — a recommendation may take more room and may not take away information. **At Half and half the large card's benefits move under its action** and its hairline goes horizontal.

**What the control may not do:** hide a price, mute a name, remove an action, shrink a small action below 42 px, or draw a small tier's benefits as a count. **Benefits hidden is symmetric** — every small tier or none. A site that wants them quieter than that wants A6·1 Centred, which the editor names.

**Responsive.** At 1080 and below the large card goes full width with its internal columns intact and the small cards sit side by side beneath it at 361 each; **this design does not hand off to 3 Stack** — equal rows would delete it. Price 56 → 44 with the small tiers unchanged at 34, which narrows the gap and is the honest cost of the collapse. At ≤ 767 one column in price order, the large tier still larger by padding, price and plane.

**Empty.** No recommendation → 1 Cards, named. No benefits on the recommended tier → the large card loses its right column and becomes a single column at 848.

**a11y.** **Size is not level**: every tier name is an `<h3>` at 20 or 18 px. The large tier is not `aria-current`, not a figure and not a landmark; **the badge is the only thing that says it is recommended**, which is why the badge is text. **DOM order is Ghost's price order while the visual order puts the recommended tier first** — the largest DOM-to-visual difference in A7 — and tab order follows the DOM, so a keyboard reader meets the cheapest tier first at every width.

**Flagged.** Requiring a recommendation, the two divisions, the large card's internal columns and vertical hairline, Display 56 and 34, the one-step-down scale that removes nothing, Benefits hidden being symmetric, the 42 px floor, refusing the 3 Stack collapse, and the tablet's narrowed price gap.

---

## 8. Slim Row

The tier names and prices on one line, no benefits, and **one action for the whole section rather than one per tier.** A7 without its list.

**Descriptor.** The only design with no head, no benefits and no descriptions, and the only one with a single action for the whole section instead of one per tier.

**Structural descriptor.** `bar · none · page · few · none · prices on one line`

**Archetype.** bar

**Behaviour module.** `price-toggle` at Both; none otherwise — and unlike A2's strip, which this shape is mistaken for, there is no `dismiss`, no close control and nothing remembered, so no module here reads or writes storage. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” **This is the design the degradation costs most:** three names each carrying two labelled prices will not hold one line, so at Billing period Both without script the row takes Prices Under the names whatever the control says, and wraps to a second line as it already does at four tiers. The names, the rules, the section action and the note render complete.

**Fields.** `note` · `payLabel` · a section action label (≤ 20, default “See all plans”). **Kept and not drawn: `eyebrow`, `title`, `sub`, `recommendedTier`, `badgeLabel`, `freeLabel`** — the largest kept-and-unused set in A7, and the design's whole argument. **Benefits and descriptions are not read at all.**

**Controls.** **Padding (Compact 32 · Comfortable 44 · Spacious 56**, its own scale, measured inside the rules) · Ground (Background · Surface · **Contrast** — offered here and nowhere outside 5, because one line of prices is small enough to invert without a design of its own) · Billing period · **Prices (Beside the names · Under the names)** · **Rules (Above and below · Above only · None**, the last on a plane only) · **Action (Button · Text link)** · Alignment (Split · Centred). **Seven controls — the category's ceiling, and the only design that reaches it.**

**Reconciled — this pass.** The ceiling is lifted and this design stops being the exception. Padding retires into **Vertical spacing** at its own **32 · 44 · 56**, measured inside the rules; **Ground retires into Background role and keeps its Contrast value — the only Contrast offered outside 5** — with Rules None still plane-only. **Alignment is now drawn as a control** rather than named in the sidebar's data note. **Top divider is stated distinct from Rules**: the divider is the boundary with the section above, Rules are this design's own two lines, and the divider **locks None at Rules Above and below**, because two lines 0 px apart is one line drawn twice. **Member Visibility** joins: Billing period · Prices · Rules · Action · Alignment · Member Visibility — **six**. **The section action picks its target in the Link Picker** — the site's pricing page, or the picker's Portal · Sign up at one paid tier — and takes an optional icon. No Description control: this design reads neither descriptions nor benefits.

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

**Descriptor.** The only design above the price ladder — 88 or 112 px — and the only one that refuses three tiers outright.

**Structural descriptor.** `stack · none · page · few · none · price at 88–112 px`

**Archetype.** stack

**Behaviour module.** `price-toggle` at Both; none otherwise. **The measured 720 px drop is not a module either**: the description and action wrap to their own row when the price's width leaves them under their minimum, so the measuring is the layout's and not a script's, and a long currency code behaves the same way with JavaScript off. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” Two 112 px numbers cannot share a line, so the second price takes a 17 px muted line under the first with its cadence in words — both drawn, both labelled — and the rule, both benefit arrangements, the free sentence and the drop render as designed.

**Fields.** As 1. **The free tier is drawn as one sentence with a link** — fixed copy, the tier's own description and `freeLabel` — because the design has room for one alternative.

**Controls.** Padding (Compact advised at Huge) · Ground · Billing period · **Price scale (Display 88 · Huge 112)** · **Rule (Show · Hide**, the gap 32 → 24) · **Benefits (Two columns · One column · Hide**, the rule going with them).

**Reconciled — this pass.** Padding retires into **Vertical spacing** (Compact still advised at Huge) and Ground into **Background role**; **Member Visibility** joins: Billing period · Price scale · Rule · Benefits · Member Visibility — **five**. **New field: `freeLine`** (opt, ≤ 60, default “Or read free — ”), editable inline. The sentence's other half stays the tier's own description and `freeLabel` still closes it, so what was fixed copy wrapping two bound values is now an authored lead wrapping them. No Description control: the description sits on the price's own line.

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

**Descriptor.** The only design that shows one tier at a time, and the only one where the recommendation chooses what a reader sees first.

**Structural descriptor.** `nav · none · page · variable · none · selected panel only`

**Archetype.** nav

**Behaviour module.** `tabs` — roving tab index, arrow keys, Home and End, selection following focus, a 160 ms cross-fade, no storage, no fragment, nothing remembered on reload — plus `price-toggle` at Both. Both edit-safe: neither runs while the section is edited, and the editor shows the default tab, which is the recommended tier's. **JS off:** “All panels render stacked and visible, each preceded by its tab label as a heading.” And from `price-toggle`: “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” **This corrects what this document previously said about this design.** The registry's degradation is an acceptance criterion (FR-G4), so all three panels are server-rendered: a reader without script gets three tier cards stacked in one column, each under its tier name as a heading, which is 1 Cards in one column rather than a dead section. **The consequence for what is drawn, stated rather than buried:** the a11y field below still says only the selected panel is in the DOM, and that no longer holds — every panel is in the DOM and the unselected ones are hidden by CSS scoped to the module's own enabled class. **A7 therefore has no hard JavaScript dependency at all**, and 10 Tabs is not an exception to the category's no-JS baseline.

**Fields.** As 1. **The recommendation does one extra thing here: it sets which tab opens** — never the first, never the most expensive. With none authored the free tier opens. **Flagged twice**, because a default selection is a stronger nudge than a badge.

**Controls.** Padding (panel padding fixed at 40) · Ground · Billing period · Title size · **Tab style (Underline · Pill)** · **Panel width (Measure 880 · Content width**, unavailable at 1080 and below).

**Reconciled — this pass.** **The drawing pass this document owed is done.** The frames and the spec card now carry the registry's names — **`tabs`** for the tier switch, **`price-toggle`** at Billing period Both — and the a11y claim is corrected in the same words as §10 below: **all three panels are server-rendered and the unselected ones hidden by CSS scoped to the module's own enabled class.** Padding retires into **Vertical spacing** (panel padding still fixed at 40) and Ground into **Background role**; **Description** and **Member Visibility** join: Billing period · Title size · Tab style · Panel width · Description · Member Visibility — **six**.

**The arrangement.** The tab row centred under the head, 15 px/600 labels with 20 px of side padding on a full-width hairline, **the badge inside its own tab** — the tab row is where the tiers are compared, so that is where the mark belongs. **The tabs carry names and no prices**: a reader who can see three prices does not need to switch. The panel 32 px beneath is **7 Highlight's large card verbatim** at a stated 880 px measure, because a single card 1,296 px wide is a band. **Its height follows its content and is not reserved** — the tabs are above it and stay put.

**Two accents on screen at Underline** — the selected tab's 2 px accent underline and the recommended tier's button — **a stated exception to the once-per-section budget**, allowed because the underline is a state rather than an object: it says where you are, not what to do. **Tab style Pill spends none.**

**The behaviour.** Cross-fade at 160 ms, nothing slides, no carousel and no track; instant under reduced motion; **nothing is remembered** — no storage, no fragment, no return to a previous tab on reload. It does not run while editing.

**Responsive.** At 1080 and below the panel becomes 3 Stack's two-line row inside its card and Panel width is unavailable; **the tab row holds**, which makes this collapse gentler than the columned ones. At ≤ 767 three tabs share the column at equal thirds, 44 px tall, **the badge moves under the row and belongs to whichever tier is selected**. **The tabs never become a select, an accordion or a scroller.**

**Empty.** One tier → no tab row, and the design is 6 Single Tier. Four or five tiers → the row wraps to a second line, a supported state.

**a11y.** A real tab set: `role="tablist"` labelled “Membership tiers”, `<button role="tab">` with `aria-selected` and `aria-controls`, one `role="tabpanel"` labelled by its tab, arrow keys between tabs, Home and End, one tab stop for the row, **selection following focus** and no announcement. **The tiers are not a `<ul>` here** — the tablist is the list — A7's one structural exception besides 2 Table's. **All three panels are in the DOM, server-rendered**, and the unselected ones are hidden by CSS scoped to the module's own enabled class — **the “only the selected panel is in the DOM” claim this document made is withdrawn, on the frames as well as here.** The reader-facing consequence stands as stated: one tier is legible at a time, which is why the editor names 1 Cards where prices are close and the comparison is the point.

**Flagged.** Tabs carrying names and no prices, the recommendation setting the default tab, the badge riding in the tab and moving on a phone, two accents at Underline, the 880 px measure, the unreserved panel height, hiding the unselected panels with the module's enabled-class CSS, and refusing any other phone control.

---

## 11. Free and Paid

Two tiers drawn as what they are: **an open door and an offer.** The free tier is a block of text on the page's own ground; the paid tier is the only card.

**Descriptor.** The only design that draws free and paid as two different kinds of object rather than two of the same kind, and the only one that reorders its tiers on a phone.

**Structural descriptor.** `split · none · page · few · none · plane on one half`

**Archetype.** split

**Behaviour module.** `price-toggle` at Both; none otherwise. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” Only the paid half has a pair to draw, so the labelled two sit on the card while the free half keeps the word “Free”: the degraded state is asymmetric, which is what this design already is. Both halves render at full strength with the divider, both actions and every fact on both sides, and neither the two divisions nor the phone reorder depends on script.

**Fields.** As 1, and **both tiers draw all six of their facts** — nothing is summarised or dropped on either side. **Exactly two tiers, one free and one paid.**

**Controls.** Padding (card padding fixed at 32, the free half 32 top and bottom and nothing at the sides) · Ground · Billing period · Title size · **Division (Even halves 632/632 · Weighted to the paid tier 440/824**, where the card's benefits go to two columns; unavailable at 1080 and below) · **Free tier action (Text link · Outlined button)**.

**Reconciled — this pass.** Padding retires into **Vertical spacing** (card padding still fixed at 32, the free half 32 top and bottom) and Ground into **Background role**; **Description** and **Member Visibility** join: Billing period · Title size · Division · Free tier action · Description · Member Visibility — **six**. **Description writes one value onto both halves** — a control that hid the description on one side would be two designs, which is the same argument that keeps both halves at the same type sizes.

**The arrangement.** A 32 px gutter with a full-height hairline centred in it — the free half's only edge, a `border` token and never an `<hr>`. Both halves at the same type sizes. **The plane is the only difference between them**, and it does all the work the badge and the accent would otherwise share. **The free half puts its action last and the card puts its above the benefits**: a real inconsistency, deliberate, because a text link at the foot of an unplaned column reads as the end of a paragraph, which is what the free tier is. **The DOM order is identical in both halves.**

**No second accent fill at either value** — two filled buttons 32 px apart is a page asking a reader to choose rather than to act, A6's refusal carried whole. Outlined button borrows settlement 2's outline at the same 44 px shape.

**Responsive.** The halves hold at 834 at 365 each with **the divider dropped** — the card's own edge is 12 px from where the hairline would be, and two lines 12 px apart is one line drawn twice. **At ≤ 767 the paid tier comes first** — the one design in A7 that reorders its tiers, **and the DOM order changes with it**, so reading and tab order still match — with a horizontal hairline between them.

**Empty.** No benefits on the free tier → the halves are honestly unequal. **No recommendation → the paid tier keeps its card and its accent**; only the badge goes, because the plane here says “this is the offer” rather than “this is recommended”. **A second paid tier → 1 Cards; the free tier turned off → 6 Single Tier**, both named in the panel before they happen.

**a11y.** A `<ul>` of two, both names h3s, both lists nested. **The free half is not an aside, a note or a complementary landmark** — the two halves are the same kind of thing and one has a plane. **A planeless column is not a quieter column**: its text is at full strength and only its description and marks are muted.

**Flagged.** The plane as the only difference, both halves keeping every fact, the free half's action position, the full-height divider and its drop at 834, the two divisions, the two free-action values, the accent staying with no recommendation, the phone's reorder, and both hand-offs.

---

## 12. Ledger

No planes at all: hairline rows, the name at the left, the price at the right, the benefits as one muted line beneath. **It asks whether a tier needs a card**, and is the quietest thing A7 can put on a page.

**Descriptor.** The only design with no planes anywhere, the only right-aligned price, and the only one that can drop the actions entirely.

**Structural descriptor.** `table · none · page · variable · none · hairline rows, no planes`

**Archetype.** table

**Behaviour module.** `price-toggle` at Both; none otherwise, at any value of Actions — the switch belongs to the prices, so it is offered even at Actions None, where there is nothing to subscribe from. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” The fixed 170 px column takes the pair on two lines, still right-aligned on the one edge that makes this a ledger; the hairline rows, the middot benefit line and whichever Actions value is set render unchanged.

**Fields.** `note` · `recommendedTier` · `badgeLabel` · `payLabel` · `freeLabel`. **Kept and not drawn: `eyebrow`, `title`, `sub`** — with 8 Slim Row, the only two designs in A7 with no head — **and the tier description**, whose work the benefit line does in the same place.

**Controls.** Padding · Ground · Billing period · **Row height (Compact 20 · Comfortable 28 · Spacious 40)** · **Benefits (One line · As a list · Hide)** · **Actions (At each row · One for the section · None** — offered here and nowhere else in A7).

**Reconciled — this pass.** Padding retires into **Vertical spacing** and Ground into **Background role**; **Row height keeps its own name and row** as the genuinely different ladder, and **Top divider locks None** because the first row's own `border-top` is already the section's top line. **Member Visibility** joins: Billing period · Row height · Benefits · Actions · Member Visibility — **five**. **Each row's text-link action picks its target in the Link Picker**, and the section-level action at Actions One for the section does the same; both take an optional icon, which is the first ornament this design has ever been offered and is still off by default. No Description control: the benefit line does that work in the same place.

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

**Descriptor.** The only design that reads the reader — signed in, paid, and which tier — and the only one whose accent is computed rather than authored.

**Structural descriptor.** `grid-of-N · none · page · few · none · reader's own tier marked`

**Archetype.** grid-of-N

**Behaviour module.** `price-toggle` at Both. **The member state is not a module:** all four states are server-rendered with the page, nothing is fetched, no reader state is read client-side, nothing is announced and nothing is stored. Edit-safe, and the editor draws whichever state the page was rendered in, with the panel naming it. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” The design's one distinguishing behaviour survives whole — the reader's plane step, the missing action, the date line, the outlined “Your plan” badge and the computed accent are all in the HTML before the page arrives — and the reader's own card, having no action, carries the labelled pair above its date line.

**Fields.** As 1, plus **`memberTitle` (≤ 90) and `memberSub` (≤ 180)**, A6·14's fields, drawn at Member head Show for signed-in readers only.

**Data — and only this:** signed in or not, paid or not, **which tier**, and one date: the renewal date for a paid member, the join date for a free one. **Not the reader's name, email, avatar, card, billing history or amount paid.** A cancelled or expired subscription **reads as a visitor**. Four states: visitor, free member, member on a lower tier, member on the top tier.

**Controls.** Padding · Ground · Billing period · Title size · **Current tier (Marked · Marked, no accent · Not marked)** · **Member head (Show · Hide)**.

**Reconciled — this pass.** Padding retires into **Vertical spacing** (card padding still fixed at 32) and Ground into **Background role**. **Description** joins; **Member Visibility does not** — the four reader states are a richer model of the same thing and subsume it, stated at the place a site would look for the control. The list reads Billing period · Title size · Current tier · Member head · Description — **five**. **New fields:** `yourPlanLabel` (≤ 18, default “Your plan”), `upgradeLabel` (≤ 20, default “Upgrade”) and `changeLabel` (≤ 20, default “Change plan”), all three editable inline; the dates stay Ghost's and stay uneditable. **One Data sentence added: `status: comped` reads as Paid** — a comped member is on a tier without paying for it, the tier is the fact this design draws, and the reader sees the paid arrangement. Cancelled and expired still read as a visitor.

**What the member state changes, and nothing else.** The reader's card takes the plane step and **loses its action**, replaced by one muted date line between two hairlines — **a disabled “Current plan” button is not offered**, because a control a reader cannot use should not be drawn. **The badge becomes an outline**: “Your plan” is a fact about the reader and “Most popular” is a claim by the site, and **where they land on the same tier “Your plan” wins.** The other actions read “Upgrade” from the free tier and “Change plan” from a paid one — **no “downgrade” anywhere in the copy.** **The accent moves to the most expensive tier the reader is not on** and disappears entirely at the top tier: the one computed accent in A7, flagged twice, with a control that turns it off.

**Refused:** proration or saving arithmetic, any billing detail, invoice or cancel control, any personal detail. **All member actions go to `#/portal/account/plans`** — three buttons, one destination, because Portal chooses the tier there and a theme deep-linking past that choice is a theme guessing. Stated rather than hidden.

**Responsive.** 1 Cards' exactly, with the renewal line in the action's 168 px slot at 834 and **the date shortened to fit** — the one place in A7 where a rendered value is abbreviated by width. **The member's card is never moved to the top**, any more than the recommended one is.

**a11y.** “Your plan” is **plain text in the heading's row — not `aria-current`, not a role, not a state**; `aria-current` describes a position in a set of links, and a subscription is not that. **Membership is never exposed as a state, badge or role.** The renewal line is a paragraph, not focusable and not `aria-disabled`, so a keyboard reader meets nothing dead between two actions. **The state is server-rendered and the other states are not in the page**; nothing is announced, nothing is remembered.

**Flagged.** Reading which tier a reader is on, the two dates being the only member data drawn, the action's replacement by a date line, the outlined badge and its precedence, the computed accent and its disappearance at the top tier, “Upgrade” versus “Change plan”, treating cancelled as visitor, the three-controls-one-destination cost, and the tablet's shortened date.

---

## 14. Assurances

The tiers with three short lines under a hairline saying what happens at checkout. It reuses A6·11's `reasons[]` verbatim and settles **where a site may write a claim about payment, and what a theme may not write for it.**

**Descriptor.** The only design carrying a strip of site-written claims about the transaction beneath the tiers, and the only one that deliberately ships an empty field.

**Structural descriptor.** `grid-of-N · none · page · few · none · assurance strip beneath`

**Archetype.** grid-of-N

**Behaviour module.** `price-toggle` at Both; none otherwise. The strip itself is static markup at all three Mark values — no link, no disclosure, no tooltip, nothing to open. Edit-safe. **JS off:** “Both monthly and yearly prices render side by side, each labelled — no toggle control shown.” The three cards and the strip render complete, and the 2 + 1 tablet grid and the phone's forced stack are media queries.

**Fields.** As 1, plus **`reasons[]`** — one to three lines, ≤ 40 characters each, 20 advised at Stacked, **text only: no icon, no body, no link**. `note` is kept and not drawn: the strip replaces it, because “Cancel any time from your account page” and “Cancel in two clicks, any time” under the same hairline is the same sentence twice.

**The settlement.** **The field is empty by default and the theme writes nothing into it.** The editor offers three suggestions as chips — cancel, Stripe, card details — which a site can accept, edit or ignore. **A theme that shipped “Secure checkout” as a default would be publishing a security claim on behalf of a site that never read it.** **No badge, seal, lock, shield or card-brand logo at any value**; no guarantee, trial or refund copy the site did not write. **A fourth line is refused** and the editor names A5·11 Checklist.

**Controls.** Padding (card padding fixed at 32) · Ground · Billing period · Title size · **Assurances (Row of three · Stacked)** · **Mark (Rule · Check · Dot)**.

**Reconciled — this pass.** Padding retires into **Vertical spacing** (card padding still fixed at 32; the 40 px above the strip's hairline holds at every width) and Ground into **Background role**; **Description** and **Member Visibility** join: Billing period · Title size · Assurances · Mark · Description · Member Visibility — **six**. **The three suggestion chips insert as ordinary editable inline text** into `reasons[]`, never locked strings — a suggestion a site cannot then edit is a default wearing a chip's clothes — and the list carries the **P0·3 item controls**: Add arrives with content, Remove is never disabled, drag reorders, per-item content only. The field still ships empty and the theme still writes nothing into it.

**The arrangement.** 1 Cards' three cards, then 40 px, then a full-width hairline, then 28 px to the strip: three equal columns on a 48 px gutter, each a 40 px rule above a 15 px line at 500 in `text` — one weight above the benefits inside the cards, because these are the things a reader hesitating over a price actually wants. **One line is drawn at the left, not centred**: a single sentence centred under three cards reads as a caption to the middle one.

**Mark Rule is the default here where A6·11's was Check**, and the reason is the tick's other job: a check mark 40 px below three cards full of check marks reads as a fourth benefit list, while a 40 px rule reads as a heading's underline — which is what these lines are. **The mark is `text-muted` at all three values and an accent mark is not offered.**

**Responsive.** At 1080 and below the tiers take 3 Stack's rows and **the strip goes to a 2 + 1 grid** on a 32 px gutter — three columns of 235 px at 15 px would give each line three words. At ≤ 767 **the strip is always stacked** and the control is ignored, 18 px apart, the type unchanged. The 32 px above the hairline holds at every width, which is what stops the strip reading as the last card's footer.

**Empty.** **No assurances → no strip and no hairline**, and the design is 1 Cards with the note restored; the editor says so at the field rather than drawing an empty rule.

**a11y.** A `<ul>` of one to three items, **after the tier list in the DOM and never inside it** — the assurances are about the transaction, not about a tier. **Not headings**: 15 px at 500 is emphasis and the section already has its one heading. The mark is `aria-hidden` and drawn from `currentColor` at all three values, so forced colours keep it; nothing is a checkbox. **No assurance is ever a link.**

**Flagged.** The whole settlement that a payment claim is the site's to write, the three suggested chips, Rule as this design's default mark, the 40 px rule, the strip replacing the note, 15 px at 500 against the benefits' 400, the 2 + 1 tablet grid, the phone's forced stack, refusing a fourth line, and refusing every badge, seal and card logo.

---

## 15. Both Prices

Both cadences on every card — yearly at the price size, monthly muted beneath — and **no switch at all.** §8 asked whether the monthly / yearly choice is a control or content; the other fourteen answer “a control”, and this one answers “content”.

**Descriptor.** The only design with no cadence control at all — both prices are content on every card — and the only one with no behaviour of any kind.

**Structural descriptor.** `grid-of-N · none · page · few · none · both cadences drawn`

**Archetype.** grid-of-N

**Behaviour module.** **None.** No `price-toggle`, because there is no Billing period control to carry it; no `<button>`, no `aria-pressed`, no cross-fade, nothing suspended while editing. Trivially edit-safe. **JS off: identical to JS on** — the only design in A7 for which that is literally true, since with no module there is nothing to degrade. **The registry makes this design's argument for it:** `price-toggle`'s own no-JS branch is both prices side by side, each labelled, which is what 15 draws on purpose with script running and at every width. The fourteen switched designs fall back to this one's arrangement; this one has nowhere to fall.

**Fields.** As 1, unchanged. **Both of a tier's prices are drawn and nothing about the pair is authored**: the second price is Ghost's other one and the saving is the same whole-month calculation the switch's line makes elsewhere. **Nothing is struck through and no percentage is ever shown** — “Save 17%” is a number Stripe never charges and a rounding a site never chose.

**Controls.** Padding (card padding fixed at 32) · Ground · Title size · **Lead price (Yearly · Monthly)** · **Second price (Under it · Beside it · Two prices)** · **Saving line (Show · Hide)**. **There is no Billing period control.**

**Reconciled — this pass.** Padding retires into **Vertical spacing** (card padding still fixed at 32) and Ground into **Background role**; **Description** and **Member Visibility** join: Title size · Lead price · Second price · Saving line · Description · Member Visibility — **six**. **New field: `freeSecondLine`** (opt, ≤ 40, default “No card, no renewal”), editable inline — the free card's line in the second price's place, which was the one invented string on this design. The cadence words and the computed saving stay catalog strings, and **there is still no Billing period control** for the gate to disable: the paid gate closing here removes the paid cards themselves.

**The arrangement.** 1 Cards' three cards, with one 15 px muted line 6 px under the lead price carrying the second cadence and the saving together — “or €7 a month · two months free on yearly” — with a middot between them. At Beside it the second price sits on the lead's baseline 12 px to its right and the saving takes its own line. **At Two prices both are at price sizes — 48 and Medium 34 — with a hairline between**, and the editor advises against it at the control rather than hiding the value: two numbers of comparable size in one card is a card that asks a reader to do arithmetic before it asks them to subscribe.

**The free tier's line is “No card, no renewal”** — fixed copy in the second price's place, so the three cards keep one shape and the free card does not have a hole in it. Invented, and flagged.

**Per-card, not per-section.** A tier with no yearly price loses its second line and leads with monthly **on that card alone** — the opposite of the switch's rule, because a control must be true of everything it controls while a line of text need only be true of its own card. Where the saving is under a month the middot and the second half go, and **the theme never says “no discount”.**

**The action's URL carries the lead cadence and its label says neither.** At Lead price Yearly the button opens Portal on the yearly plan and a reader who wanted monthly changes it there. **That is a real cost of drawing both without offering a choice**, stated on the frame and in the panel rather than papered over with an `aria-label`.

**Responsive.** At 1080 and below the second line joins the price's baseline whatever Second price says, and **the saving shortens to “two months free”** — the one place in A7 where computed copy changes with width. At ≤ 767 it goes back under the price at every value and Second price is ignored; **this is the design's best width.**

**a11y.** The lead price is one readable string in its own paragraph and **the second line is a second paragraph**, its middot a real separator read as a pause. DOM order is A7's with one element inserted after the price. **No `<button>`, no `aria-pressed` and no cross-fade — the one design in A7 with no behaviour of any kind**, and the reason a site with a reduced-motion or no-JavaScript audience might choose it.

**Flagged.** The one-line pairing of second price and saving, the free tier's fixed line, the per-card fallback, the three second-price arrangements and the advice against Two prices, the Portal link following the lead cadence, refusing a strikethrough or a percentage, and the tablet's shortened saving.

---

## Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fifteen checked against each other; no two are the same. **One tuple changed in this pass:** 4 Split Head’s emphasis mechanism ran to five words where the slot allows four, so it now reads `head in own column`. Nothing else in the table moved.

| # | Design | Tuple |
|---|---|---|
| 1 | Cards | grid-of-N · none · page · few · none · plane step plus badge |
| 2 | Table | table · none · page · few · none · continuous recommended column |
| 3 | Stack | stack · none · page · variable · none · full-width rows |
| 4 | Split Head | split · none · page · variable · none · head in own column |
| 5 | Contrast Band | grid-of-N · none · contrast · few · none · inverted ground |
| 6 | Single Tier | split · none · page · one · none · planeless free companion |
| 7 | Highlight | split · none · page · few · none · two-thirds width card |
| 8 | Slim Row | bar · none · page · few · none · prices on one line |
| 9 | Big Price | stack · none · page · few · none · price at 88–112 px |
| 10 | Tabs | nav · none · page · variable · none · selected panel only |
| 11 | Free and Paid | split · none · page · few · none · plane on one half |
| 12 | Ledger | table · none · page · variable · none · hairline rows, no planes |
| 13 | Members | grid-of-N · none · page · few · none · reader's own tier marked |
| 14 | Assurances | grid-of-N · none · page · few · none · assurance strip beneath |
| 15 | Both Prices | grid-of-N · none · page · few · none · both cadences drawn |

**Containment is `none` fifteen times, and that is the honest answer.** A7's sections are bare sections on the page ground; the card is the tier's geometry, not the section's, so a row of three cards is `none · page` — 1 Cards, 5 Contrast Band's panels, 11 Free and Paid's single card and 13 / 14 / 15 all included. The one place a box could have been claimed is 5 at Band edges Page margin, and that is a control setting on a design whose default is full bleed, not a second design.

**Ground separates one design and only one.** 5 Contrast Band is `contrast` because its ground is the design; 8 Slim Row *offers* the Contrast ground as a control value and is still `page`, since **two designs that differ only by a control setting are one design.** Every other section takes the page's own ground.

**Media placement is `none` fifteen times.** A7 draws no imagery at all: `image` is kept and not drawn on 5, and 13 Members refuses the avatar it could have read. The slot earns nothing in this category and is recorded as empty rather than stretched.

**The close pairs, stated rather than buried.** Four designs share `grid-of-N · none · page · few · none` and separate on the sixth slot alone — 1 Cards, 13 Members, 14 Assurances, 15 Both Prices — and that is precisely what they are: 1 Cards plus one device, a reader's tier, an assurance strip, a second price. 7 Highlight and 11 Free and Paid are both `split · none · page · few · none`, separating on unequal size versus a single plane. 3 Stack and 9 Big Price share `stack` and separate on count; 2 Table and 12 Ledger share `table` and separate on count.

**Not used as a separator.** Padding, ground control values, title size, billing period and every other control never appear in a tuple. Neither does tier count, which is data: 6 Single Tier's `one` is the count the design is *built* for, not the count Ghost happens to return.

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

---

## Reconciliation notes

**Frames changed in this pass.** **All fifteen control-panel frames:** every Padding row retired into Vertical spacing and every Ground row into Background role; the universal trio drawn outside each list, with Background role locked on **5** and disabled at Contrast on **1, 2, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14, 15**, Vertical spacing locked on **3**, and Top divider locked None on **5**, **12** and on **8** at Rules Above and below; **Member Visibility drawn on all but 13**; **Description drawn on 1, 5, 6, 7, 10, 11, 13, 14, 15**; **Alignment drawn as a control on 8**; an **EDITING** group added to all fifteen (P0·1 inline toolbar, the Ghost lock, the Link Picker, P0·2 button icons, the new fields, 14's P0·3 item controls); a **DATA · from Ghost** group added to all fifteen (the tier query, the `type:paid+visibility:public` filter, the free tier's own object, the paid gate, the seeded $5 tier, the no-Add rule), with the per-design sentences on **2** (the degenerate matrix, naming 1 Cards), **6** (the pre-Stripe state), **8** (no benefits read), **12** (no head, no description), **13** (`status: comped` reads as Paid; Member Visibility subsumed) and **15** (both prices are Ghost's); every footer count rewritten to “N controls + the universal trio + the Data group”; and a **Reconciled** card added to all fifteen spec blocks. **Section frames changed on one design only: 10 Tabs** — the behaviour caption and the annotated a11y frame now carry the registry's `tabs` and `price-toggle` and the corrected server-rendering claim, and the spec card's Behaviour and a11y fields with them. **No other section frame was redrawn**, because nothing in this pass changes what a reader sees: the four new fields ship with the drawn text as their defaults, and no ornament was added or removed. **No “Preview” control existed anywhere in A7**, so none was removed.

**Conflicts with earlier rulings, one line each.**

1. **§0's “Members off in Ghost → the section does not render, and that is the only such state in A7”** — loses to the Data floor: the gate is `@site.paid_members_enabled` on every paid CTA and on the cadence switch, the query is `{{#get "tiers"}}` filtered `type:paid+visibility:public`, the free tier is its own `type:free` object, and **Ghost's seeded $5 tier means tier presence is never purchasability**; the members-off state survives as the outer one.
2. **The per-design Padding control** — retires everywhere into Vertical spacing; **5's 44 · 64 · 88 and 8's 32 · 44 · 56 survive as its resolutions**, 3's fixed 96 becomes the trio's lock with the reason shown, and 3's Row padding, 6's Card padding and 12's Row height keep their names as genuinely different ladders.
3. **The per-design Ground control, and 1's “no Contrast value”** — retire into Background role with the refusal intact rather than the row: Contrast disabled on fourteen designs with 1's reason quoted, **kept as a value on 8**, and **locked on 5**, whose ground is the design.
4. **8 Slim Row's “seven controls — the category's ceiling, and the only design that reaches it”** — loses: the ceiling is now the PRD's ~15 plus the trio and the Data group, 8 draws six of its own, and **5 Contrast Band carries the longest list at seven**. The sentence stands in 8's section as the ruling it was, and this line supersedes it.
5. **6 Single Tier's “the one place in A7 where a fixed phrase wraps an authored label”** — loses: `freeLine` is a field with “Or keep reading free — ” as its default, so **no fixed phrase wraps anything in A7 now**; the wrapping arrangement itself is unchanged.
6. **9 Big Price's “the free tier is drawn as one sentence with a link — fixed copy, the tier's own description and `freeLabel`”** — loses its first third: the lead is `freeLine`, defaulting to “Or read free — ”, and the other two thirds stay bound as drawn.
7. **15 Both Prices' “the free tier's line is ‘No card, no renewal’ — fixed copy … invented, and flagged”** — loses: `freeSecondLine` is a field with that default. *The default's wording stays flagged as mine.*
8. **13 Members' “Upgrade” / “Change plan” / “Your plan” as copy rules** — the rules survive as advice on three new fields' defaults, not as strings: **“no downgrade anywhere in the copy” is now advice a site can override**, which is the honest consequence of making the label a field.
9. **2 Table's visually-hidden “Included” and “Not included”** — become catalog strings; the a11y ruling that a blank cell stays blank in the tree is untouched, and **at Check and blank there is still no hidden word to translate**.
10. **10 Tabs' “only the selected panel is in the DOM”** — withdrawn, on the frames and in §10: all panels are server-rendered and the unselected ones hidden by the module's enabled-class CSS, which is the registry's degradation and an acceptance criterion. The third pass overturned it in prose; **this pass is where the drawing agrees**.
11. **§0's “almost nothing is authored, and that is the category”** — survives with four fields added (6's and 9's `freeLine`, 15's `freeSecondLine`, 13's three labels): **nothing about a price, a name, a description or a benefit became authorable**, which is the part that mattered.
12. **§0's “the tier count is data, not a control”** — unchanged and now drawn: the Data group states the Ghost-sourced list rule outright — **no Add, no Remove, no reorder** — where before it was only the absence of a button.
13. **13 Members' exemption from Member Visibility** — a ruling of this pass, not a conflict: the four reader states subsume it, and the panel says so where a site would look for the control. *Flagged: the exemption is mine.*
14. **The new Description control against §0's empty rule** — both hold and they are different things: Hide is a decision the site makes, a missing description is a state the data is in, and the card closes up either way.
15. **12 Ledger's refusal of ornament** — survives the button-icon rule: icons are offered on its text links and on the section action, **off by default**, and Actions None still states “Readers cannot subscribe from this section”.
16. **`A7-0 Category Proof` predates this pass** — the trio, Member Visibility, Description, the Data floor, the four new fields and the corrected module names are not in it; it was not redrawn, and **per the category's own consistency rule the drawn panels are the authority until it is**.
17. **The structural-descriptor table** — unmoved: 10 Tabs' `selected panel only` describes what a reader sees, not what is in the DOM, and no tuple in the table depends on a control this pass touched.
18. **The category's “4–7 controls” norm** — lifted as the ground rules ask: footers read “N controls + the universal trio + the Data group”, every design lands between five and seven of its own, and **Quick Controls stay the 3–5 highest-impact** — Billing period, Title size, the design's own arrangement control, and Description where it exists.
19. **No registry addition was needed.** Nothing in this pass asked for behaviour outside the fixed registry: the trio, Member Visibility and Description are all server-rendered, so **A7 still declares exactly two modules — `price-toggle` and `tabs`** — and **no module name was coined anywhere in it**.

