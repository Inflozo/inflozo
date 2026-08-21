# A3 · Footers — written specification

Pack drawn: **Paper**. **All 16 designs complete.** Category artefacts — the four settlements, the category-wide rules, the tokenisation proof, the stress frame, the shared field list and the roster — are in **A3-0 Category Proof.dc.html**.

Frames: `A3-1 Minimal Line` · `A3-2 Columns` · `A3-3 Two-Tier` · `A3-4 Newsletter Band` · `A3-5 Contrast Band` · `A3-6 Centred Stack` · `A3-7 Big Type` · `A3-8 Sitemap` · `A3-9 Latest Posts` · `A3-10 Contact Block` · `A3-11 Colophon` · `A3-12 Card` · `A3-13 Tags` · `A3-14 Image Band` · `A3-15 Wrap` · `A3-16 Mini Bar` (all `.dc.html`).

**Frame set per design:** desktop 1440 light (primary, drawn under the end of a post) · a states frame showing hover, focus-visible and pressed · the design's own behaviour or data states · tablet 834 · mobile 390 twice — once as authored, once in a named second state · dark desktop 1440 · an annotated accessibility frame · the control panel · the spec card.

---

## 0 · Category-wide rules

These apply to all 16 designs and are not repeated per design.

**Placement.** One `<footer role="contentinfo">` per page, the last landmark, a sibling of `<main>`. **One A3 per site**, on every template. A3·16's pinned bar and its released footer are the same element — never two landmarks.

**The top edge.** A footer whose ground matches the page's draws one hairline above it. A footer whose ground differs draws none: the ground change is the edge. A3·12's card draws neither — the gap is the separator. The footer is the only category in the library allowed to assume what precedes it, because something always does.

**Padding.** Compact / Comfortable / Spacious on every design, but the values differ by design: a one-line footer's Comfortable is 28 px a side, a column footer's is 56 px top, an inverted band's is 64 px. Each design's numbers are in its own section below.

**The four settlements.**

1. **Link columns — auto-fit by the authored count.** Two keep the 1fr width they would have had at four and sit against the brand block on a half measure, leaving the right quarter empty; the editor does not warn about it. Three or four fill the measure. Five or more move the brand block above the grid and wrap four across — 4 + 3 at seven, last cell empty, never justified. **Seven columns is the cap**: Add column is disabled with “Seven is the most a footer can hold. Consider a second column heading instead.” **Eight links per column** is the second cap: “Eight links is the most a column can hold.” Columns are top-aligned, never stretched, and links are never moved between them. At 1080 columns go two-across (three-across in A3·8). At ≤ 767, **two to four columns stack open** as a two-across grid with links padded to 44 px; **five to seven collapse to accordions**, one per row, 48 px rows on hairlines, count at the right end, first group open.
2. **The newsletter form — one row only.** Visually-hidden label, email field, button, one 13 px reassurance line ≤ 90 characters. No heading, no body copy, no image: A22 Newsletter owns the persuasive version. Four states at one height — empty, invalid, submitting, done. Detail in §4.
3. **The social row renders only what exists.** Ghost stores Facebook and X natively; with neither set and no theme-level list, the row and its gap are removed. Never empty circles, never outlined icons pointing at a contact page, never a heading over nothing. Further platforms come from a footer-level list the theme owns — **flagged as invented**. Geometry: a 34 px bare box on the pack's radius, hover filling with the pack's hover surface; 30 px inside a legal line (A3·8, A3·15); a real 44 px box at ≤ 767. Names are platforms, not glyphs; the list is a `<ul>` labelled “Orbit Weekly elsewhere”, links carry `rel="me"`.
4. **The legal line.** One order everywhere: **copyright · Privacy · Terms · Published with Ghost**, 13 px muted, middots in the border token generated as CSS. The year is generated, never typed. Privacy and Terms are the category's two legal links; the field accepts four. **“Published with Ghost” is shown by default and removed by a control** — present on fourteen designs, in the shared Site-wide group on A3·9 and A3·13. The sidebar says nothing about whether a site should keep it.

**Type floors.** Links 15 px; 14 px only in A3·8 Sitemap. Column headings 13 px / 600 uppercase tracked 0.08em, in `text` at full strength — never muted, they are what holds a grid. Meta and legal 13 px muted. Prose 17 px (16 px at ≤ 767). **One exception in the category:** A3·10's 12 px field labels, each a `<dt>` naming a 15 px value.

**Link states.** Muted at rest; hover → `text` with a 35% underline, 160 ms, no movement; focus → the library ring, 2 px accent at 2 px offset, tight to the text box rather than the hit area. On a contrast ground hover and focus both switch to the pack's lightest surface, never accent: Paper's accent on its contrast measures 4.85:1 and a darker pack's fails.

**Accent budget.** Once per footer. Permitted: the logo mark, A3·4's newsletter button, A3·13's current-tag chip (via contrast), and the focus ring. A3·4 spends the footer's whole budget on its button.

**Depth.** Pack radius, hairlines, warm `sm 0 1px 2px rgba(28,27,26,.06)` and `md 0 4px 16px rgba(28,27,26,.08)`. In dark, shadows are dropped and the hairline separates (A3·12, A3·16). Under forced colours the hairline is what remains, which is why no design relies on a shadow alone.

**Motion.** 160 ms ease-out, one transition per state change. The category's whole budget: link and glyph hovers, the accordion's height at ≤ 767, A3·9's 1.02 image hover, A3·16's release. All suppressed under `prefers-reduced-motion`, thresholds unchanged. Nothing animates while the section is being edited.

**Data from Ghost.** Site title, logo, Facebook and X from settings; posts, tags and counts from content. Everything else is section content — including the contact fields, the credits, the extra social platforms and `footerBelow`, the four **invented** groups. **Flagged:** a site with several footers keeps those four in step by hand; Ghost gives us nowhere else to put them.

**Empty-data floor.** Every element that leaves takes its gap; nothing is substituted for what is missing. No site title → no footer, and the editor says the site needs a name. Where a design's own subject is absent, it falls back to a named sibling and the sidebar states which — the full list is in A3-0. Fields a design does not draw are kept, not cleared, and return on switching.

**The Site-wide group.** `showAttribution`, Back to top and Shows on sit below each design's own controls and do not count against the 6-control norm.

**Accessibility floor.** One `contentinfo` per page, last in focus order. Lockup is one link named “{site title}, home” with the mark `aria-hidden`. Link columns are per-group `<nav aria-labelledby>` pointing at their visible `<h2>`; a single ungrouped list is one `<nav aria-label="Footer">`. Legal is a `<ul>` labelled “Legal”; separators are CSS. No footer borrows the site title as a heading. Hit targets 44 px at ≤ 767.

---

## 1 · Minimal Line

One row above a hairline: lockup left, social row, legal line right. The baseline, the fallback for six other designs, and where the legal line, the attribution control and the social row's disappearance are set. Spends no accent beyond the mark.

**Content fields.** `wordmark` (req) · `mark` (opt) · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. Does not display `linkColumns`, `tagline`, `description`, the newsletter group, the contact group, `credits`, `latestPosts`, `tags`, `image` — all kept.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 20 · Comfortable 28 · Spacious 40 (each side) |
| Ground | Background · Surface · Contrast |
| Top edge | Hairline · Ground change · None |
| Arrangement | Spread · Centred |
| Social | Glyphs · Labels · Off |
| Ghost attribution | Show · Hide |

**Data.** Site title and logo from Ghost settings; Facebook and X from its social fields; further platforms from the theme-level list (**invented**). Copyright year generated. No logo → the initial square.

**Responsive.** 1440–768: one row, three groups; page padding 72 → 40, social gap 8 → 4. Row height 90 px at Comfortable, set by the 19 px wordmark, not the glyphs. ≤ 767: three centred rows in source order — lockup, social, legal; glyph boxes 34 → 44 px with a 6 px gap; the legal line wraps as a group at 8 px and items never split mid-item. 196 px tall, 134 px with no social.

**Empty state.** No social → row and gap removed. No legal links → copyright and attribution alone. Attribution off, no legal links, no copyright → the right-hand group is removed and the lockup stays left, not centred.

**Accessibility.** Category floor. No heading, visible or hidden: with three groups a hidden “Footer” heading would describe nothing. Muted legal text on background 5.4:1 light, 6.4:1 dark.

**Flagged as mine.** The 90 px Comfortable height, the three-row mobile order, attribution last and on by default, the theme-level social list, and the placeholder glyph letterforms.

---

## 2 · Columns

Brand block at the left margin, link columns filling the measure, legal line on its own row under a hairline. The design that settles the column rule for the category.

**Content fields.** `wordmark` · `mark` · `tagline` (≤ 80) · `linkColumns[]` (2–7 groups; heading req ≤ 24, links 1–8 of label ≤ 28 + url) · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 40 · Comfortable 56 · Spacious 80 (top; bottom is always 26 under the legal row) |
| Ground | Background · Surface · Contrast |
| Columns | Auto · Two · Three · Four (Auto follows the authored count, default) |
| Brand block | Lockup and tagline · Lockup only · Off |
| Social | In brand block · In legal row · Off |
| Ghost attribution | Show · Hide |

**Data.** Lists are authored, not pulled; a column may point anywhere, including tags and collections. A link whose target is deleted keeps rendering and the editor flags it rather than removing the user's text.

**Responsive.** 1440–1081: brand block 300 px fixed, columns 1fr, 40 px gutters, 11 px link rhythm. Two columns stay 1fr and leave the right quarter empty. Five to seven put the brand block above a four-across wrapping grid. 1080–768: two columns across, brand block spanning at 260 px, gutters 32, row gap 36. ≤ 767: two to four columns become a two-across grid, open, links padded to 44 px (list gap 11 → 2 px, the padding does the spacing); five to seven become accordions, first open, count at the right end.

**Empty state.** No columns → renders as A3·1 Minimal Line, stated in the sidebar. No tagline → lockup and social close up. No social → row and gap removed.

**Accessibility.** Each column is `<nav aria-labelledby>` on its visible `<h2>` — four columns is four small navs, which is correct: they are four groupings, and one unlabelled list of sixteen links is what we are avoiding. Accordion headings keep their `<h2>` and use `aria-expanded`; closed groups are `hidden`. Focus order is reading order. Links 5.4:1 light / 6.4:1 dark; headings 12.1:1 / 11.8:1.

**Flagged as mine.** The seven-column cap and its wording, the eight-link cap, the 1080 two-across threshold, the five-column accordion threshold, the empty right quarter at two columns, the accordion counts, and the fall-back to A3·1.

---

## 3 · Two-Tier

Links on one ground, a full-bleed legal bar on another. The lockup lives in the bar, not the tier — the whole difference from A3·2, and what lets the bar be the site's constant. The bar is A3·1 Minimal Line, verbatim.

**Content fields.** As A3·2 minus `tagline`, which has nowhere to sit in either tier and is kept.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 40 · Comfortable 56 · Spacious 80 (tier; the bar is fixed at 24 and does not follow) |
| Ground pair | Surface tier · background bar / Background tier · contrast bar / Contrast tier · background bar |
| Columns | Auto · Two · Three · Four |
| Bar contents | Lockup, social, legal · Lockup and legal · Legal only |
| Social | Glyphs · Labels · Off |
| Ghost attribution | Show · Hide |

No Top edge control: the pair always differ, so the ground change is the divider and the hairline is fixed on. A matched pair is not offered.

**Data.** As A3·2.

**Responsive.** The tier follows A3·2's column rule at every width, including the accordion threshold; the bar follows A3·1 — one row to 768, three centred rows at ≤ 767. Both keep their grounds at every width; at 390 the ground change is the only thing telling the reader the bar is not another column. Tier padding 56 → 44 at 834, bar 24 → 20.

**Empty state.** No columns → the tier is removed and what remains is A3·1 on the bar's ground; the sidebar says so. Bar contents: Legal only → the lockup leaves and the legal line spans left.

**Accessibility.** One `contentinfo` around both tiers — two grounds are a visual division, not a structural one. No CSS re-ordering at any width. Measured per pairing: links on surface 5.1:1, headings 12.6:1, legal on background 5.4:1; on a contrast bar legal at 78% carried gives 8.9:1 and the wordmark 13.9:1; on a contrast tier links at 72% give 7.6:1. Any pairing that drops a value below 4.5:1 in a given pack is disabled there with its ratio shown.

**Flagged as mine.** The three ground pairings and the refusal of a matched pair, the bar's fixed 24 px padding, the mark's inversion on contrast, and the 72% / 78% carried values.

---

## 4 · Newsletter Band

A band across the top of the footer holding one form row, with the links beneath. Settles the footer's inline form for the category.

**Content fields.** `newsletterPlaceholder` (opt, ≤ 28, default “you@example.com”) · `newsletterButtonLabel` (opt, ≤ 16, default “Subscribe”) · `newsletterNote` (opt, ≤ 90, one line) · `newsletterSuccess` (opt, ≤ 60) · `newsletterSuccessShort` (opt, ≤ 32, used ≤ 767) · plus `wordmark`, `mark`, `linkColumns[]`, `social[]`, `copyright`, `legalLinks[]`, `showAttribution`. **There is no heading or body field** — that is the settlement, not an omission. The error line is fixed copy, not a field: it has to match what was actually rejected.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 28 · Comfortable 40 · Spacious 56 (band) |
| Band ground | Surface · Background · ~~Contrast~~ (disabled — a field on a contrast band needs a surface step the packs do not define) |
| Field width | Narrow 320 · Medium 400 · Wide 480 |
| Band alignment | Centred · Left |
| Columns | Auto · Two · Three · Off |
| Ghost attribution | Show · Hide |

**States.** *Empty*: placeholder in muted. *Focus*: 1.5 px accent border on the field, library ring suppressed — it would collide with a button 10 px away; A2·5 Capture's documented departure, repeated so the two forms behave identically. *Invalid*: the error replaces the note at 13 px / 500 in `text`, field border 1.5 px `text`, **no red anywhere** — the seven roles contain no error colour; band height unchanged; checked on blur and submit, never per keystroke. *Submitting*: label “Subscribing…”, field disabled on the pack's hover surface, button label to 80%, width reserved for the longer label so the row does not twitch; no spinner. *Done*: field, button and note replaced in place by the confirmation and a way back, at identical height; session-lived — a reload shows the empty form, because Ghost's confirmation email is the record.

**Data.** Posts to Ghost's members subscribe endpoint; Ghost sends its own confirmation. An already-subscribed address gets Ghost's response in the same slot. **Members off in Ghost** → the field is replaced by the button alone, linking to the subscribe page; the sidebar states the substitution and links to the setting; placeholder and note are kept.

**Responsive.** 1440–1081: one row at the named field width, note under. 1080–768: field steps one value down (400 → 320), row holds, columns two-across with the brand block as a cell. ≤ 767: field and button take a row each at 48 px, field text 15 → 16 px so iOS does not zoom, note centred, success copy uses `newsletterSuccessShort`.

**Empty state.** No note → the band is the row alone and loses 22 px. Columns: Off, or none authored → the band sits directly above A3·1's bar.

**Accessibility.** A real visually-hidden `<label>Email address</label>`, plus `aria-label="Subscribe to {site title}"` on the form, since there is no visible heading. `type="email"`, `autocomplete="email"`, `inputmode="email"`, `required`; `aria-invalid` on error with focus held in the field. The note is both the `aria-describedby` target and the `aria-live="polite"` region, so the outcome is announced where the terms were. Button is `<button type="submit">` whose visible label is its whole name; disabled while submitting. Placeholder 5.1:1 light / 5.9:1 dark; button label on the darkened accent 4.6:1 light, 8.1:1 dark.

**Flagged as mine.** The 90-character note cap, the suppressed focus ring, the reserved button width, the session-lived done state, the shortened mobile success line, and the rule that this design takes the footer's whole accent budget.

---

## 5 · Contrast Band

The whole footer on one contrast ground — brand, columns and legal together, no second tier. Ground is not a control: it is the design.

**Content fields.** As A3·2, with `linkColumns[]` capped at 4. A logo image with a light background is the one content case this design cannot carry: the sidebar asks for a light-ground version and falls back to the initial square until one is supplied.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 44 · Comfortable 64 · Spacious 88 — one step larger than the light-ground designs at every value |
| Columns | Auto · Two · Three · Four |
| Brand block | Lockup and tagline · Lockup only |
| Legal line | In the band · Own strip |
| Social | Glyphs · Labels · Off |
| Ghost attribution | Show · Hide |

**No Ground control.** A Ground picker here would make this a duplicate of A3·2. Carried values are fixed: full strength for headings and wordmark, 72% for links, tagline and legal (70% in dark), 15% for hairlines, 60% on the derived bottom strip. The strip is the contrast token darkened one step; packs whose contrast is already near-black get a 6% lift instead.

**Data.** As A3·2.

**Responsive.** 1440–1081: brand block 340 px, columns 1fr. 1080–768: two-across with the brand block spanning; an odd third list takes the full remaining width and lays its links out as a wrapping row rather than a stub column — the one place in the category where a list changes direction at a width. ≤ 767: two-across as A3·2, legal left-aligned rather than centred, band full-bleed with no radius and no hairline. **Five to seven columns are not offered** — the editor caps this design at four and names A3·8 Sitemap.

**Empty state.** No columns → the band holds the brand block and legal line and keeps its padding. No social → row and gap removed.

**Accessibility.** Structure identical to A3·2. Hover and focus use the pack's lightest surface, never accent. No `color-scheme` switch inside the band — a band that flipped the UA's form colours would break any field a later design puts on it. Paper light: headings and wordmark 13.9:1, links at 72% 7.6:1. Paper dark: headings 13.2:1, links at 70% 7.1:1. Focus ring 13.9:1 / 13.2:1.

**Flagged as mine.** The one-step-larger padding, the four-column cap and its hand-off, the derived strip and its lift-instead-of-darken rule, the wrapping odd list at 834, and the light-logo requirement.

---

## 6 · Centred Stack

One centred column on a fixed measure: lockup, tagline, one wrapping row of links, social, legal. No columns and no grid.

**Content fields.** `wordmark` · `mark` · `tagline` · `linkColumns[]` read as rows, flattened in authored order, 12 links maximum across all groups · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. Group headings are kept but not drawn; at Links: two rows they become the visually-hidden list headings.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 44 · Comfortable 64 · Spacious 88 |
| Ground | Background · Surface · Contrast |
| Measure | Narrow 560 · Medium 640 · Wide 760 |
| Links | One row · Two rows · Off |
| Social | Glyphs · Labels · Off |
| Ghost attribution | Show · Hide |

The lockup is one step up from A3·1's — 30 px mark, 22 px wordmark — because at the top of a centred stack it is the only anchor. Link row gaps are 28 px, chosen so two adjacent focus rings never touch. No separators: separators in a centred row read as an equation. The hairline above the legal line is the measure's width, not full-bleed.

**Links: two rows.** Above eight links the row splits by content, not by wrapping: the first authored group becomes a primary row at 15 px / 500 in `text`, everything after it a secondary row at 14 px muted.

**Data.** As A3·2. A thirteenth link is refused and A3·2 named.

**Responsive.** Measure is the lesser of its named value and the container minus 80 (minus 40 at ≤ 767) — 600 px at 834, where the row gap tightens to 26. Stack order never changes at any width; this design has no collapse to specify. ≤ 767: links gain vertical padding for 44 px targets (row gap 4, column gap 20), glyphs 34 → 44 px, hairline the full measure. 344 px tall.

**Empty state.** Every element that leaves takes its gap. The floor is lockup, hairline, legal at 148 px — which is also a brand-new site before anything is authored, and why it has to be composed rather than merely legal.

**Accessibility.** One `<nav aria-label="Footer">` with a single list; at two rows, two lists with visually-hidden headings from the authored group names. The 22 px wordmark is not a heading. Desktop links get 8 px of vertical padding inside the 28 px gap for a 31 px mouse target; 44 px at ≤ 767.

**Flagged as mine.** The 12-link cap, the two-row split rule and its two type sizes, the measure-minus-80 formula, the 28 px gap, and the measure-wide hairline.

---

## 7 · Big Type

The site's name set large enough to be the last thing on the page, with links and legal kept small above it. The category's one display moment. The mark is dropped by construction — a 26 px square beside 128 px letters is a mistake at every size.

**Content fields.** `wordmark` (req — the whole design) · `linkColumns[]` (one row, or columns above at that setting) · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. `mark` and `tagline` are kept, never drawn.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 32 · Comfortable 48 · Spacious 72 (top; the bottom is the type's optical inset, 26 px at Huge) |
| Name scale | Large 96 · Huge 128 · Fill width (measured at build, clamped 72–200) |
| Ground | Background · Surface · Contrast |
| Links | Row above · Columns above · Off |
| Social | Glyphs · Labels · Off |
| Ghost attribution | Show · Hide |

Type: the pack's heading font, −0.045em at Huge, line-height 0.84, descender allowance pulled back so the baseline sits 26 px above the page's bottom edge. Dark tightens tracking to −0.043em — light type on a deep ground looks about 2% wider at this size, and this is the category's only optical correction. Above one line, leading opens to 0.9.

**Data.** The name is Ghost's site title. No site title → no design.

**Responsive.** Below 1080 the scale steps one named value down (Huge → Large) and Fill width recomputes against the new measure — the letters are never squeezed. ≤ 767 the scale is always Fill width whatever the control says, and the control's value is remembered and returns above the breakpoint; two words become two lines at about 62 px. Two lines is the cap: at the 72 px floor a longer name wraps on word boundaries, and beyond that the design hands off to A3·6 Centred Stack with the reason shown.

**Empty state.** Floor is one legal line and the name, 192 px at 390. The name is never dropped.

**Accessibility.** The name is an `aria-hidden` `<p>`, not a heading and not a link: the header's lockup has already announced the site title, and repeating it as an `h2` on every page adds an outline entry that says nothing new. **Flagged** — a real heading is defensible and I chose against it. The home link, when the theme adds one, is the link row's first item. Fill width recomputes under text zoom, so the name never overflows horizontally. Name 12.1:1 / 11.8:1.

**Flagged as mine.** The 72–200 clamp, the dropped mark and tagline, the un-linked name, the `aria-hidden` decision, the dark tracking correction, the descender inset, and the two-line cap with its hand-off.

---

## 8 · Sitemap

Five to seven columns, every route, at the category's smallest link size. The only design above four columns, the only Density control, and where A3·5 and A3·12 hand off.

**Content fields.** `wordmark` · `mark` · `linkColumns[]` (5–7 here; 2–4 makes the editor recommend A3·2, it does not refuse) · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. `tagline` and `description` are kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 36 · Comfortable 52 · Spacious 72 |
| Ground | Background · Surface · ~~Contrast~~ (disabled above four columns — 28 links at 14 px on an inverted band is a wall) |
| Columns | Auto · Five · Six · Seven |
| Density | Comfortable (9 px link rhythm, 32 px row gap) · Compact (6 px, 24 px) |
| Social | In legal row · Off |
| Ghost attribution | Show · Hide |

Density changes spacing only; type sizes hold, because 13 px is the floor for a tracked heading and 14 px for a link. The lockup takes its own row above the grid so every column is the same width; gutters 28 px; the social row sits in the legal line at 30 px so it does not read as an extra column. 6 px is the rhythm floor — below it two adjacent focus rings touch.

**Data.** Lists are authored; a group may be generated from Ghost's tags, in which case its links follow the tag list and the editor shows the count it will render. Eight links per column as A3·2.

**Responsive.** 1440–1081: five to seven columns across. 1080–768: **three-across in authored order** — this design's own rule, not A3·2's two-across, because six lists in two columns is three screens of the same information. Five give 3 + 2, seven give 3 + 3 + 1. ≤ 767: accordions, 48 px rows, count at the right, first group open, links back up to 15 px; Density does not apply, since the constraint is the finger.

**Empty state.** A group with no links is not drawn and its heading goes with it. Fewer than five groups → the grid renders at the authored count and the sidebar recommends A3·2.

**Accessibility.** Headings are `<h2>` at every width and hold the accordion `<button aria-expanded aria-controls>` at ≤ 767, so the outline does not change with a tap. Closed groups are `hidden`, not clipped. Counts are `aria-hidden` — the list announces its own length. The whole row is the button. Opening is a 160 ms height transition, suppressed under reduced-motion with the scroll position held. 14 px links 5.4:1 / 6.4:1.

**Flagged as mine.** The 14 px link floor, both Density values, the three-across tablet rule, the disabled contrast ground above four columns, the 30 px glyphs in the legal row, and the lockup on its own row.

---

## 9 · Latest Posts

The three most recent posts beside one link column. The only design whose content changes without anyone editing it, and the only one carrying imagery.

**Content fields.** `postsHeading` (opt, ≤ 20, default “Latest”) · `postsSource` · `postsCount` (2–4) · plus `wordmark`, `mark`, `tagline`, `linkColumns[]` (one group drawn, further groups kept), `social[]`, `copyright`, `legalLinks[]`, `showAttribution`.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 36 · Comfortable 52 · Spacious 72 |
| Ground | Background · Surface · Contrast |
| How many posts | Two · Three · Four |
| Post style | With image · Title and date · Title only |
| Which posts | Latest published · Latest in a tag · Featured only · A collection |
| Links | One column · Row under · Off |

Attribution moves into the shared Site-wide group here, since the six are spent.

Posts take the measure and links a fixed 260 px at the right — the reverse of A3·2, because here the content is the offer and the navigation is the aside. Titles 17 px in the heading font, two lines maximum with the full title in the DOM; meta is the category's 13 px “tag · date” row from A1·6. Images at the pack's radius, 3:2, with a 1.02 scale and 4% darkening on hover — the only image motion in the category.

**Data.** Title, feature image, primary tag and published date from Ghost. Drafts, scheduled posts and pages excluded. Members-only posts appear with no lock or badge: the footer is not the place to sell.

**Empty and partial data.** **No feature image on a post** → a hover-surface panel of the same height carrying the title at 15 px, clipped at three lines; the title then appears twice, which is deliberate — a hole in the row, a stock texture and three unequal heights are all worse. **Fewer than two published posts** → the block is removed, the design renders as A3·2 with the tagline in the posts' place, and the sidebar says “Fewer than two published posts — showing links only.” A tag or collection with fewer posts than the count renders what exists, down to two.

**Responsive.** 1440–1081: posts on the measure, one link column right. 1080–768: links leave the column and become a wrapping row under the posts with the lockup beside them; posts hold three across; titles 17 → 16 px. ≤ 767: posts become a divided list with a 72 × 54 thumbnail at the left, rows 78 px, the whole row the link; links two-across.

**Accessibility.** The block is a section labelled by a real `<h2>`, **not** a `<nav>` — it is content, and marking a feed as navigation makes the landmark list useless. Images `alt=""` with explicit dimensions and `loading="lazy"`. One link per post named by its title. Date in `<time datetime>`. The tag is plain text, never a nested link. Hover motion suppressed under reduced-motion; the underline stays. Titles 12.1:1 / 11.8:1; the focus ring wraps the whole card at 4.85:1, above the 3:1 non-text floor.

**Flagged as mine.** The two-post floor and its fall-back, the no-image panel and its duplicated title, the 3:2 crop, the 72 × 54 mobile thumbnail, the 1.02 hover scale, the absence of a members-only badge, and moving attribution to the shared group.

---

## 10 · Contact Block

A postal address, an email, a phone number and reply hours as a labelled block beside the link columns. The only design carrying the contact fields, and the only one whose content may be legally required.

**Content fields.** `contactHeading` (opt, ≤ 24, default “Get in touch”) · `address` (multi-line, opt, ≤ 120) · `email` (opt) · `phone` (opt) · `hours` (opt, ≤ 40) · plus `wordmark`, `mark`, `tagline`, `linkColumns[]` (2 drawn), `social[]`, `copyright`, `legalLinks[]`, `showAttribution`. **Field order is fixed** — post, email, phone, replies — and is not a control: a contact block whose order varies by site is one nobody can scan.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 36 · Comfortable 52 · Spacious 72 |
| Ground | Background · Surface · Contrast |
| Details | All four · Address and email · Email only |
| Columns | Auto · Two · Off |
| Social | Glyphs · Labels · Off |
| Ghost attribution | Show · Hide |

Labels 12 px muted, values 15 px in `text` — an address you cannot read is worse than no address. The block is a fixed 300 px beside the brand block's 300, so the two fixed columns sit together at the left and the link columns flex.

**Data.** None of the contact fields exist in Ghost's settings, so all four are section content. **Flagged:** a site with several footers keeps them in step by hand; a site-wide contact record is not something Ghost gives us. Email becomes a `mailto:` link and phone a `tel:` link automatically.

**Responsive.** 1440–1081: brand 300, contact 300, links flexing. 1080–768: two-across, and the contact block becomes a two-by-two field grid so it matches the brand block's height. ≤ 767: contact comes second, above the links — someone opening a footer on a phone is more often looking for a way to get in touch than for the archive — and the address renders as one comma-separated line, saving 44 px. Email and phone get 44 px targets.

**Empty state.** Each missing field takes its label. All four empty → block and heading removed and the design is A3·2, stated in the sidebar. The heading is kept even for a single field: with it, a labelled group; without it, a stray address in a footer.

**Accessibility.** `<address>` inside a section labelled by its visible `<h2>`, italics reset. Labels and values are a `<dl>`. Link text is the address itself, never “email us”. The phone number keeps its spaces visually and is unspaced in the `href`. The 12 px labels are the category's one type-floor exception, allowed because each `<dt>` names a 15 px value directly under it; 5.4:1 / 6.4:1, and set at 400 in dark rather than 500. **Flagged as a gap:** no jurisdiction's imprint rule is encoded — the field exists, what a country requires in it is the site owner's to know.

**Flagged as mine.** The 12 px labels, the fixed field order, the permanent 20% underline on the two links, the mobile address collapse, contact before links at ≤ 767, and the absence of an imprint rule.

---

## 11 · Colophon

A short paragraph about the publication, set as reading text, with the credits beneath or beside it as labelled pairs. The only footer whose main content is prose.

**Content fields.** `description` (rich text, **required here** — one or two paragraphs, up to two inline links each, no length cap) · `credits[]` (0–6 rows of label ≤ 16 + value ≤ 40; a value may be a link) · `creditsHeading` (opt, ≤ 20, default “Masthead”) · plus `wordmark`, `mark`, `linkColumns[]` (read as one row), `social[]`, `copyright`, `legalLinks[]`, `showAttribution`. `tagline` is kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 40 · Comfortable 56 · Spacious 80 |
| Ground | Background · Surface · Contrast |
| Prose measure | Narrow 480 · Medium 600 · Wide 720 |
| Credits | Beside · Under · Hidden |
| Links | Row · Off |
| Ghost attribution | Show · Hide |

Prose is 17 px in the heading font on a fixed measure — about 72 characters a line at Medium, which is why the measure is fixed rather than flexing. Credits are label-and-value rows on hairlines with the label column locked at 104 px. Inline links carry a 30% underline at rest, full on hover, in `text` colour — a muted word inside a paragraph reads as a typo. The link row is A3·6's, borrowed.

**Data.** The paragraph may be seeded from Ghost's site description, which is one short line, and the editor says so rather than pretending a meta description is a colophon. Credits are section content — **invented**, Ghost has no field.

**Responsive.** 1440–1081: prose on its measure, credits beside at 1fr. 1080–768: credits move under the prose as two columns of rows, label column 104 → 84 px; the prose keeps its measure. ≤ 767: prose 17 → 16 px with leading 1.65 → 1.7, credits one column. The link row sits between prose and credits at every width.

**Empty state.** No `description` → the design does not render and the sidebar offers A3·6. Credits hidden or none → the prose keeps its measure and the right third stays empty.

**Accessibility.** The paragraph has no heading — it introduces itself in its first four words. Credits are a `<dl>` under a real `<h2>`; the hairlines are row borders, not `<hr>`s. Reading text follows the body rules: `text-wrap: pretty`, no justification, no hyphenation, reflows at any zoom, no character cap. The ugly test here is a 600-word paragraph, and the answer is that it renders in full and the footer gets tall, which is the site's choice. Prose 12.1:1 light; in dark it is `#E8E2D7` at 10.9:1, stepped back deliberately from 11.8:1 to reduce glare, with leading opened to 1.7.

**Flagged as mine.** The required paragraph, the two-link-per-paragraph cap, six credit rows, the 104 px label column, the dark prose colour and leading, no length cap, and the unlinked ISSN row.

---

## 12 · Card

The footer as a panel inset from the page's edges, with the page ground visible around it. The only footer that does not touch the window.

**Content fields.** Identical to A3·2, with `linkColumns[]` capped at 4 — five or more is refused and A3·8 named.

**Controls.**

| Control | Values |
|---|---|
| Padding (the card's own) | Compact 32 · Comfortable 48 · Spacious 64 |
| Inset | Snug 16 · Comfortable 40 · Wide 72 — left, right and bottom; always 0 at the top |
| Card ground | Surface · Contrast |
| Columns | Auto · Two · Three |
| Card at 390 | Keep the card · Full bleed |
| Ghost attribution | Show · Hide |

Depth: pack radius, one hairline, md shadow in light; in dark the shadow is dropped and the raised surface plus hairline carry it. At Wide the card's left edge meets the page's 72 px text margin; at Snug it reads as a raised band. Radius stays the pack's token at every inset — the card never becomes a pill. No hover and no lift on the card itself.

**Data.** As A3·2.

**Responsive.** 1440–1081: inset and padding at their named values. 1080–768: the inset steps one value down and the card's padding goes 48 → 32, so the ratio of frame to content holds; columns two-across. ≤ 767: inset 12, padding 20 — 32 px from the phone's edge to the first word, within a pixel of every other design — or full bleed if that is the control's value, in which case radius, shadow and inset go and a hairline appears above.

**Empty state.** No columns → the card holds the brand block and legal line and keeps its shape. It does not shrink to fit: a narrow card in a wide page reads as a broken component.

**Accessibility.** The card **is** the `contentinfo`; the inset is padding on its wrapper, not a second landmark. No `role`, no `tabindex`, never focusable or clickable as a whole — a footer that is one big clickable panel is a trap, and a card shape invites the mistake. Under forced colours the shadow disappears and the hairline remains, which is why the hairline is always drawn. Links on the card 5.1:1 / 6.1:1; the card's edge against the page ground is 1.4:1 and decorative — nothing is communicated by the edge alone.

**Flagged as mine.** The three inset values and the zero top, the paired padding step at 1080, the 12 px mobile inset, the existence of the Card at 390 control, the dropped shadow in dark, and the four-column cap.

---

## 13 · Tags

The site's subjects as chips, from Ghost's own tags. The only design whose main content the user does not type, and where the chip is established for the library.

**Content fields.** `tagsHeading` (opt, ≤ 28, default “Browse by subject”) · `tagsOrder` · `tagsCount` (8 · 12 · 16) · `tagsList[]` (only when Order is “A list you choose”) · `showTagCounts` · plus `wordmark`, `mark`, `linkColumns[]` (one group drawn), `social[]`, `copyright`, `legalLinks[]`, `showAttribution`.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 36 · Comfortable 52 · Spacious 72 |
| Ground | Background · Surface · Contrast |
| How many tags | Eight · Twelve · Sixteen |
| Order | Most posts first · A to Z · Ghost's own order · A list you choose |
| Post counts | On · Off |
| Links beside | One column · Off |

Attribution sits in the shared Site-wide group here.

**The chip, for the library.** Surface fill, one hairline, pack radius, 15 px label in `text`, optional 12 px muted count, padding 7 × 13 for a 35 px box (10 × 14 → 41 px at ≤ 767), gap 8 px — set by the focus ring's offset. Hover fills with the pack's hover surface, 160 ms, no lift. Focus takes the library ring. **Current** takes the contrast ground with `aria-current="page"`. Every chip is the same size regardless of count: a weighted tag cloud is a data visualisation, and a footer is not the place for one.

**Data.** Tags, counts and URLs from Ghost. Internal `#hash` tags excluded. Tags with zero published posts excluded. Renaming a tag in Ghost changes the chip; nothing is authored twice. The overflow is the list's last item, a plain link “All 34 tags” pointing at the tag index, and it is not rendered if the site has no index page.

**Responsive.** 1440–1081: chips on the measure, one link column at 260 px right. 1080–768: the column leaves, chips take the full measure, lockup, links and social become one row beneath. ≤ 767: chips grow to a 41 px box and **the count drops to eight regardless of the control**, with the overflow link taking the rest; the control's value returns above the breakpoint.

**Empty state.** Fewer than three tags with posts → the block is removed and the design renders as A3·2, stated in the sidebar. At three it renders three chips and does not pad the row. Counts off is the setting for a young site, where “64” beside “2” says something the site would rather not lead with.

**Accessibility.** A `<nav>` labelled by its visible `<h2>` holding a `<ul>` — these are links to archives, so unlike A3·9 this genuinely is navigation. One link per chip named by the tag; the count reads as “Essays, 64 posts”. The current chip keeps `aria-current="page"` and stays a link, is never removed from the row and never re-sorted to the front. Chip label 12.6:1 / 11.4:1; count 5.1:1 / 5.9:1; the border is decorative because the fill always differs from the ground.

**Flagged as mine.** The three-tag floor, the eight-chip mobile override, the refusal of size weighting, the overflow-as-link rule, the current-tag treatment, the count wording, and excluding zero-post tags.

---

## 14 · Image Band

One full-bleed photograph closing the page, with the site's name over it and the links in a plain row beneath. The only footer with imagery as its subject, and the design that settles the scrim.

**Content fields.** `image` (opt, 2400 px wide or more, centre-anchored cover) · `imageAlt` (opt, default empty) · `wordmark` · `mark` (used only when Overlay is Nothing) · `tagline` · `linkColumns[]` · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`.

**Controls.**

| Control | Values |
|---|---|
| Band height | Short 160 · Medium 220 · Tall 300 |
| Over the image | Name and tagline · Name only · Nothing |
| Text position | Bottom left · Centred |
| Links | Row · Columns · Off |
| Social | Glyphs · Off |
| Ghost attribution | Show · Hide |

Height is in pixels, not an aspect ratio, so the band is the same depth on a 1440 page and a 1920 one and the crop widens instead. Wordmark 34 px at 1440, 30 at 834, 26 at ≤ 767. Text sits on the page's own margin at Bottom left.

**The scrim.** One bottom-up gradient in the contrast token: transparent to 55%, stop at 30% (34% at Tall; 26% and 60% at ≤ 767, where the tagline takes two lines). In dark it is the background token, transparent to 45%, stop at 40% — the picture is already darker than the page, so the gradient weakens rather than strengthens. Removed entirely when nothing is over the image. Never a flat overlay, never black. Photographs are never brightened or dimmed by the theme; only the scrim moves.

**Data.** No image → the band becomes a flat contrast panel at the same height with no scrim and carried text as A3·5, so the composition holds; the editor shows the striped placeholder with “Drop a footer image here”. Placeholders belong in the editor, not on a published site.

**Responsive.** As the ladder above; at ≤ 767 the band floors at 180 px and the link row and social take their own rows. This is the only design whose scrim varies by width, and it varies because the text's height as a fraction of the band does.

**Empty state.** Overlay: Nothing → the scrim goes with the text (a gradient over an empty picture is a smudge) and the lockup moves below the band at its standard 26 px.

**Accessibility.** The photograph is decorative — `alt=""` — because the words over it say what it is for; the editor offers an alt field and says plainly that a footer photograph usually does not carry information. The scrim is an `aria-hidden` sibling, never a blend mode on the image, so under forced colours it disappears and leaves text on a solid ground. Wordmark and tagline are plain text, not links: a large silent target over an image invites a click that goes nowhere. Explicit dimensions and `loading="lazy"`; the band reserves its height before the image arrives. No motion at all, no parallax. **Flagged:** the scrim guarantees 4.5:1 against the darkest reasonable photograph, not the average one — a floor, not a guarantee, and the one place in A3 where contrast depends on content nobody has seen. Where a site's own image defeats it, the editor flags the band and offers Overlay: Nothing.

**Flagged as mine.** The three heights, the 6.5:1 crop and centre anchor, every scrim value, the 34/30/26 px wordmark ladder, the flat-panel fall-back, and the honest limit above.

---

## 15 · Wrap

Every link in one wrapping block at reading size, no headings and no columns. For a list with twenty links and no hierarchy worth drawing.

**Content fields.** `wordmark` · `mark` · `linkColumns[]` flattened to one list in authored order, 24 links maximum; group headings kept in the markup as visually-hidden list headings and never drawn · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. `tagline` and `description` are kept, not drawn: prose above a field of links makes the links look like a consequence of it.

**Controls.**

| Control | Values |
|---|---|
| Padding | Compact 40 · Comfortable 56 · Spacious 80 |
| Ground | Background · Surface · Contrast |
| Link size | Small 15 (gaps 24 / 10) · Medium 17 (32 / 14) · Large 20 (36 / 16) |
| Separator | None · Middot · Slash |
| Social | In legal row · Off |
| Ghost attribution | Show · Hide |

Separator None leaves the gap to do the work; Middot and Slash tighten the horizontal gap to 14 px so the mark belongs to the pair either side of it, in the border token, the same middot as the legal line. A separator never wraps onto the start of a line and the last item never carries one. Social sits in the legal row at 30 px.

**Data.** As A3·2. A twenty-fifth link is refused and A3·8 named.

**Responsive.** 1440–768: the block reflows on the measure; gap 32 → 28 at 834, type held. ≤ 767: type steps one value down (17 → 16), horizontal gap 22, and the vertical gap is replaced by 7 px of padding per link for 44 px targets; social moves out of the legal row onto its own row.

**Empty state.** Fewer than four links → the design renders as A3·1, stated in the sidebar. Six links with middots is the intended low end and stays composed — this design meets A3·1 there, one step of type size apart, deliberately: a site pruning from twenty-two links to six should not have to switch design.

**Accessibility.** One `<nav aria-label="Footer">` with a real `<ul>`; where the authored content has groups, each is a nested `<ul>` with a visually-hidden heading, so the grouping survives a switch to A3·2 and a screen reader still hears “About, 4 items”. Links are list items laid out with flex-wrap and gap — never space-separated inline text, never `display: contents`. Separators are `::after` content, so nothing reads “middot” twenty-one times and the marks cannot be copied into a pasted link list. A list of 22 unheaded links announces as “list, 22 items”, which is honest — this design is for the case where that is the truth; above 24 the editor recommends A3·8. 17 px muted 5.4:1 / 6.4:1.

**Flagged as mine.** The three size-and-gap pairs, the 24-link cap, the 14 px separator gap, the mobile type step, keeping hidden group headings, and the four-link floor.

---

## 16 · Mini Bar

A slim bar pinned to the bottom of the window while the reader is in the page, released at the page's end into the real footer beneath. The category's only scroll behaviour.

**Content fields.** `wordmark` · `mark` · `linkColumns[]` (the bar takes the first one, three or five links in authored order; the released footer uses the field as its own design specifies) · `copyright` · `legalLinks[]` · `showAttribution` · `social[]` (released footer only) · `footerBelow` (enum — which A3 design the bar releases into, default A3·1). No field is unique to this design: the bar is a projection of the footer's own content.

**Controls.**

| Control | Values |
|---|---|
| Bar height | Compact 44 · Comfortable 52 · Spacious 60 (56 plus the safe area at ≤ 767) |
| Ground | Background · Surface · Contrast — each at 92%, blurred where available, opaque where not |
| Links in the bar | One · Three · Five · None |
| Releases | At the page end · Never pins |
| Back to top | On · Off |
| Footer below | Any A3 design, default Minimal Line |

Back to top is this design's own control, not the shared Site-wide one.

**Behaviour.** Pinned by default: the pack's ground at 92% with a hairline above and the md shadow inverted upward — A1's sticky header values, mirrored. It carries a 22/16 px lockup, the links, the copyright and back to top. **Release:** when the footer below enters the viewport the bar unpins in place, losing translucency and shadow; the two are one element, so nothing crossfades and nothing is drawn twice. The page reserves the bar's measured height as bottom padding, recalculated on release, resize and zoom, so nothing is ever covered — including the last line of a post, a bottom-anchored A2·13 consent bar, and anything the browser scrolls into view. **Unpins entirely if the bar would exceed a quarter of the viewport height** (200% text zoom on a short window). With no JavaScript, or at Releases: Never pins, the bar is simply the last element in the page: opaque, in flow, no shadow, no back to top. In dark the shadow is dropped and the hairline separates.

**Responsive.** 1440–1081: lockup, links, copyright, back to top. 1080–768: the copyright leaves the bar — its destination is the released footer's legal line, which repeats it verbatim seconds later. ≤ 767: bar 56 px plus the home-indicator safe area (74 px reserved), links cut to one, back to top becomes a labelled 44 px glyph button, copyright still absent.

**Empty state.** No links → lockup, copyright and back to top. With Back to top off as well, the editor suggests A3·1 rather than a bar with nothing to do.

**Accessibility.** Pinned and released are one `contentinfo`, last in the document and in focus order at both states, never a live region — a scroll position is not an event worth announcing. Back to top is a `<button>` named “Back to top” that scrolls and then moves focus to the document's skip target, instant under reduced-motion; it is the one control in A3 that does something rather than going somewhere. Text on the 92% ground is measured against the page's own background behind it: 5.4:1 muted, 12.1:1 wordmark; where `backdrop-filter` is unsupported the ground is opaque, which can only improve it.

**Flagged as mine.** The three heights and the mobile 56 plus safe area, the 92% translucency and its opaque fall-back, taking the first N links rather than adding a field, dropping the copyright at 1080, the quarter-viewport unpin rule, the dropped shadow in dark, and the release recalculating the page's bottom padding.

---

## Boundaries with other categories

- **A22 Newsletter** owns any form with a heading, body copy or an image. A3·4 is one row and one reassurance line; if a site wants to argue for the newsletter, the argument goes in A22 and the footer keeps the field.
- **A16 Contact** owns forms, maps and hours tables. A3·10 carries the details as text only; the address is never wired to a map.
- **A17 Post Grids** and **A18 Post Lists** own post collections as sections. A3·9 is capped at four posts and one link column, and never gains an excerpt.
- **A20 Tag Collections** owns tag pages and tag cards. A3·13 is chips only, capped at sixteen.
- **A6 CTA Banners** owns persuasion above the footer. No A3 design carries a headline or a primary action other than A3·4's subscribe button.
- **A2 Announcement Bars** owns the top of the page and the two bottom-anchored designs (A2·11 Toast, A2·13 Consent). A3·16's pinned bar coexists with those: the reservation rule accounts for them, and the consent bar sits above the mini bar, never under it.
