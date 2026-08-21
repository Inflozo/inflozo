# A4 Heroes — written specification

18 designs · Paper pack · drawn in this project as `A4-1 Centred.dc.html` … `A4-18 Overlap Card.dc.html`, with the category's shared artefacts in `A4-0 Category Proof.dc.html`.

Read `A4-0` first. It carries the four settlements §8 asks A4 to make, the rules all eighteen share, the type and action ladders, the roster, the shared field list, the tokenisation proof across three packs, and the category stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated eighteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**.

---

## 0. The shared floor

Everything in this section applies to all eighteen unless a design says otherwise.

**Colour.** Role tokens only — `background`, `surface`, `text`, `text-muted`, `border`, `accent`, `contrast`. Accent appears once or twice per section: the primary action, an active state. Never as decoration.

**Type ladder.** Eyebrow 13 px uppercase tracked `.08em` in `text-muted`. Headline in the pack's heading font at Medium 48 / Large 60 / Display 76 on desktop, 40 / 44 / 48 at 834, 30 / 34 / 38 at 390. Sub 19 px desktop, 18 px at 834, 17 px at 390 — the 17 px floor is absolute. Meta 13–14 px muted. Action labels 15 px desktop, 16 px on a phone.

**Action ladder.** Primary is A1·1's button at hero scale — accent fill, 15 px/600, padding 13×22, 46 px tall, the pack radius. **Flagged as a departure** from A1·1's own 14 px/600 and 9×17, which the header in every frame keeps: the two sizes coexist deliberately, the smaller one in the header and the larger in the hero. The bordered secondary is new to A4 and carries forward from here: surface fill, one hairline, the same metrics less the border's pixel. A1's muted ghost action is not used in a hero. Two actions maximum — a third is refused with A6 CTA Banners named. On a phone both actions stay: side by side where the labels fit a 350 px measure, stacked full width at 48 px where they do not. **The actions never leave at any width.**

**The Actions control**, on every design that has one, is **Both · Primary · None** — those three words, as drawn. Where an entry below writes “Primary only” it means the panel's **Primary**.

**Padding.** Compact 64 · Comfortable 96 · Spacious 132 at 1440; 80 at 834; 64 at 390. Comfortable is the default. Four designs depart and say so: **8 Card** measures its padding inside the card (48 · 64 · 88), **9 Contrast Band** runs one step tighter (44 · 64 · 88), **17 Slim** uses a page title's scale (36 · 56 · 80), and **18 Overlap Card** has no padding control — its overlap is its spacing.

**Page margin.** 72 px at 1440, 40 px at 834, 20 px at 390.

**Breakpoints.** Desktop 1441+ and 1440–1081 · tablet 1080–768 · phone ≤ 767. A design that changes arrangement at a width states the width in words.

**Heading structure.** The authored headline is the page's `<h1>`. The eyebrow is a `<p>` above it, never a heading. The section itself is unlabelled — a hero is the top of the page, not a named region. 16 Pull Quote and 13 Latest Post state their own variations; 17 Slim states the heading contract with the section below it.

**Imagery.** Striped placeholder in the frames, with a mono caption naming the crop. `alt` empty by default wherever words sit over or beside the picture; authorable in every case. Hero pictures are `loading="eager"` with high fetch priority and explicit dimensions.

**Motion.** 160 ms ease-out, one transition per state change. No entrance animation, no parallax, no autoplay, no carousel. Thresholds are unchanged under reduced motion; where a design animates anything it says what reduced motion removes.

**Empty headline.** The section does not render and the editor names the field it needs. The one exception is 16 Pull Quote, where the quotation carries the page instead.

**Content.** Orbit Weekly throughout. Every number a site owner sees — issue numbers, post counts, durations, reader counts — is typed by them unless a design says it comes from Ghost.

---

## 1. Centred

The whole set centred on a 720 px measure with no picture. The category's floor: every other design is a departure from this one, and the type and action ladders above are established here.

**Fields.** `eyebrow` · `headline` (req) · `sub` · `primaryAction` · `secondaryAction` · `note`.

**Controls.** Padding · Measure (Narrow 620 · Medium 720 · Wide 860, less if the window is narrower) · Headline size · Ground (Background · Surface · Contrast) · Actions · Note under the actions (Show · Hide).

**Responsive.** Measure at its named width down to 1081; at 834 the measure is the column minus margins and the actions stay on one row; at ≤ 767 the set is left-aligned, not centred, and the actions go side by side or stack.

**Empty.** Any optional field absent takes its gap with it. The floor is a headline alone.

**a11y.** The shared floor, unmodified. Nothing here is interactive but the two actions.

**Flagged.** The three measures, the 720 px default, and the left-alignment rule on a phone.

---

## 2. Flush Left

1 Centred's set moved to the left margin on a half measure, the right half deliberately empty, with an optional proof row under the actions.

**Fields.** As 1, plus `proof[]` — 0–3 rows of value ≤ 8 characters and label ≤ 24, authored.

**Controls.** Padding (64 · 96 · 132) · Text block width (Half 620 · Two-thirds 780 — the right side stays empty either way) · Headline size · Below the sub (Note · Proof row · Nothing) · Ground (Background · Surface · Contrast) · Actions.

**Note and the proof row share one slot** rather than taking two controls, which is what keeps this design at six.

**Responsive.** The set holds its measure at the left margin at every width above 767; the empty right half simply narrows. At ≤ 767 the proof row goes from three columns to a single column of three rows.

**Empty.** No proof rows authored → the row is absent, not a set of zeros. A10 Stats and Numbers owns any richer treatment; three pairs is the cap here.

**Flagged.** The three-pair cap, the two named widths, the shared slot under the sub, and the decision that the proof row is authored rather than pulled from Ghost.

---

## 3. Split

Text on seven columns, one picture on five, both on the page's own ground. The design that settles the two-column hero, and the geometry 10, 11 and 13 all borrow.

**Fields.** As 1, plus `image` · `imageAlt`.

**Controls.** Padding · Picture side (Right · Left — on a phone the picture is always under the text) · Picture (Flush · Framed inset, a mount for photographs with pale edges) · Headline size (Display is offered but not advised beside a picture) · Ground · Actions.

**The crop is not a control.** It is fixed at 4:3, centred, from a picture 1200 px or wider.

**Responsive.** Seven and five on a 64 px gutter at 1440; six and six on a 40 px gutter at 834 with the headline at 40 and the actions stacked; one column at ≤ 767 with the picture between the sub and the actions.

**Empty.** No image → the section is 2 Flush Left, header unchanged. The picture is never replaced by a placeholder on a published site.

**Flagged.** The seven/five ratio, the fixed 4:3 crop, the framed-inset mount, and the picture's position between sub and actions on a phone.

---

## 4. Full Bleed

One 16:9 photograph edge to edge with the set over it, anchored to the lower third. A1·4 Overlay sits above it. Settles the scrim, the crop floor and the honest contrast limit for text on a picture.

**Fields.** `image` (2400 px or wider) · `imageAlt` · `eyebrow` · `headline` (req) · `sub` · `primaryAction` · `secondaryAction` · `pictureFocus`.

**Controls.** Padding (measured from the picture's bottom edge) · Text position (Bottom left · Centred — both sit in the lower third) · Over the picture (Everything · Headline and actions · Headline only) · Headline size · Picture focus (Top · Centre · Bottom — which part of a tall picture stays in the crop) · Actions.

**Over the picture** decides how much of the set sits on the photograph; what it drops moves below the picture onto the page's own ground, where the scrim is not needed and the contrast is a measured token pair. It is the control that lets a site with a busy photograph keep a legible sub.

**Scrims.** Fixed, not a control. Top: 30% to transparent over 100 px, for the overlay header. Bottom: 60% to transparent over 70% of the height, for the set. Dark mode: 24% and 48%. Never a heavy black gradient.

**Responsive.** Headline 60 / 44 / 34, margin 72 / 40 / 20, and the crop is the floor — the section is as tall as the picture at 16:9 or the set plus padding, whichever is greater.

**Empty.** No image → a flat `contrast` panel, scrims removed, carried text at A3·5's values, header back to A1·1 Rail.

**a11y.** Contrast is measured against the scrim, and the specification says plainly that a scrim cannot guarantee a ratio against an unknown photograph. Where a photograph cannot carry the sub, Over the picture moves it onto the page instead — a real fix rather than a darker scrim.

**Flagged.** All scrim values, the crop-as-floor rule, the three Over-the-picture values, and the honest contrast limit.

---

## 5. Image Under

The set centred above a wide band of picture, with a caption under it.

**Fields.** As 1, plus `image` · `imageAlt` · `imageCaption` (≤ 80).

**Controls.** Padding (measured above the set) · Band width (Full bleed · Page margin — always full bleed on a phone) · Headline size · Caption under the band (Show · Hide) · Ground · Actions.

**The crop is fixed** at 2.4:1, and 16:9 on a phone — not a control.

**Responsive.** The band narrows with the page at Page margin and holds the page's full width at Full bleed; the crop goes 2.4:1 to 16:9 at ≤ 767, where the band is always full bleed. The caption stays 13 px muted under it at every width.

**Empty.** No image → 1 Centred. No caption → the line is absent.

**Flagged.** The two band widths, the fixed 2.4:1 and 16:9 crops, and the 80-character caption cap.

---

## 6. Big Type

The headline set large enough to be the page, flush left across the whole measure. No eyebrow.

**Fields.** `headline` (req) · `sub` · `primaryAction` · `secondaryAction`. No eyebrow field is offered on this design.

**Controls.** Padding · Headline scale (Display 76 · Huge 96 · Fill width — measured, between 64 and 160; always Fill width on a phone) · Sub under the rule (Show · Hide) · Rule under the headline (Show · Hide) · Ground · Actions.

**Responsive.** Fill width is measured against the column, clamped between 64 and 160 px, and is forced on a phone. The headline's own scale is the design, so it is the one design whose type ladder is not the category's.

**Empty.** No sub authored, or Sub under the rule off → the rule is the last thing before the actions. The floor is a headline alone.

**Flagged.** The three scale values and the 64–160 clamp, dropping the eyebrow entirely, and putting the sub below the rule rather than above it.

---

## 7. Masthead

The publication's nameplate at the top of its own front page: the site's name set large and centred over a rule, with an issue line under it.

**Fields.** Site title (from Ghost) · `headline` (req) · `sub` · `issueLine` (≤ 40, **flagged as invented** — Ghost has no issue number) · `primaryAction`.

**Controls.** Padding · Nameplate scale (Medium 56 · Large 72 · Huge 96) · Rules (Above and below · Below only · None) · Issue line (Show · Hide) · Sub under the standfirst (Show · Hide) · Actions (None · Primary — a masthead usually carries none, and there is no second action on this design).

**The nameplate is the site's title from Settings** and is not editable on the section.

**Responsive.** The nameplate steps down with the width and the rule holds its 1 px at every width.

**Empty.** No issue line → the rule closes up. No site title → the design is not offered, and the editor says the site needs a name.

**Flagged.** `issueLine` entirely, the three Rules values, the nameplate's 56/72/96 ladder, and the absence of a second action.

---

## 8. Card

The hero as a surface panel inset from the page's edges, page ground visible around it. A3·12's card geometry, at hero scale.

**Fields.** As 1, plus `note`.

**Controls.** Card padding (Compact 48 · Comfortable 64 · Spacious 88 — one step above A3·12's 32 · 48 · 64, because a hero's card carries a headline; **flagged**) · Inset (Snug 16 · Comfortable 40 · Wide 72 at the sides and foot — A3·12's values reused unchanged; the gap under the header is always 24) · Card ground (Surface · Contrast) · Headline size · Actions · Card at 390 (Keep the card · Full bleed).

**Two separate controls, two different relationships to A3·12:** the padding inside the card is a step up because a hero's card carries a headline; the inset around it is byte-identical to the footer's, so a site running both reads one shape.

**Responsive.** The inset steps with the margin — 24 px under the header at every width. At ≤ 767 **Card at 390** decides: Keep the card holds the inset and the radius, Full bleed drops both and the card becomes the page. It is a user choice, not automatic.

**Empty.** As 1.

**Flagged.** The 48/64/88 padding, the phone control and its two values, and the fixed 24 px gap under the header.

---

## 9. Contrast Band

The whole hero on the inverted ground. Ground is not a control here: it is the design.

**Fields.** As 1, plus `note`.

**Controls.** Padding (44 · 64 · 88 — one step tighter than the light designs) · Band edges (Full bleed · Page margin — always full bleed on a phone) · Headline size · Primary action (Surface fill · Outline · Accent) · Below the sub (Note · Nothing) · Actions.

**There is no Ground control:** the ground is the design.

**Actions on the band.** The primary is a solid `text`-coloured fill carrying the band's colour; the secondary is a 28% hairline. The **Primary action** control offers Accent as a third value, and it is **disabled with its ratio shown** in any pack where it fails — 3.1:1 in Paper. §7·4: a value that would fail contrast is disabled with its ratio, never silently allowed.

**No form and no field** is drawn on this design, for the same reason A4·15's Contrast ground is disabled: a field on an inverted band needs a surface step the packs do not define.

**Flagged.** The 44/64/88 padding and its departure from the category's, the inverted action pair, and disabling Accent with its ratio rather than removing it.

---

## 10. Video Poster

A 16:9 poster with a labelled play control at its centre and the set in the lower third. Opens A15's player in a dialog.

**Fields.** `videoUrl` · `videoPoster` (falls back to `image`) · `videoDuration` (typed, ≤ 8, **flagged as invented**) · the set as 4.

**Controls.** Padding (measured from the poster's bottom edge) · Play control (Large centred · Inline — always inline on a phone, unless nothing else is over the poster) · Show how long it runs (Show · Hide) · Over the poster (Everything · Headline and play · Play only) · Headline size · Actions.

The scrims are 4 Full Bleed's, measured and fixed rather than a control. **Over the poster** works as it does in 4: what it drops moves below the poster onto the page's own ground.

**Behaviour.** Nothing autoplays and nothing is muted-looping. The poster is a still. The play control is a labelled `<button>` that opens a dialog with focus trapped and returned; A15 owns the player inside it.

**Empty.** No poster and no image → the flat contrast panel, as 4. No video URL → the design is not offered.

**Flagged.** `videoDuration` and the note that nothing reads it from the video, the two play-control positions, the dialog hand-off, and the no-autoplay rule.

---

## 11. Subscribe

The set with A3·4's one-row form standing where the actions would be. The hero's only form.

**Fields.** The set as 1, minus the actions, plus the five `email*` fields — placeholder, button label, note, success, short success — with A3·4's names and caps, and `deadline` (**flagged as invented**).

**Controls.** Padding · Field width (Narrow 320 · Medium 400 · Wide 480 — steps down one value on a tablet) · Headline size · Ground (Background · Surface · ~~Contrast~~, disabled: a field on a contrast band needs a surface step the packs do not define) · Above the form (Nothing · Deadline line) · Note under the form (Show · Hide).

The five `email*` fields are shared with the footer's form — change them once and both follow.

**Four states** at one height: empty, focus, error, success. The field is 46 px — **A4's hero button height, not A3·4's 44 px footer row**, because a form standing in the actions' slot has to be the height of the actions it replaced. Flagged as a departure, and the only measurement in this design that is one. The button sits inside the row, the note under it. Success replaces the row in place; the short success is for the narrow width. Every other value is A3·4's, including the suppressed focus ring, the reserved button width and the refusal of red.

**Empty.** No deadline → the countdown line is absent. Past its date the line is removed and the form stays.

**Flagged.** `deadline` and the countdown's wording, which is A2·6's verbatim, the 46 px row, and the three field widths.

---

## 12. Offset Image

Text on a 620 px measure at the left margin with the picture running off the right edge of the window.

**Fields.** As 3.

**Controls.** Padding · Picture side · Picture height (Short 420 · Medium 520 · Tall 620) · Bleed (Off the edge · To the margin — off the edge needs a picture 2000 px or wider) · Headline size · Actions.

**Responsive.** Above 1080 the picture bleeds past the margin. Below 1081 there is no margin to spare: the picture becomes 3 Split's contained crop and the design hands off to 3's arrangement, stated on the frame. **Header mode is Below, a correction to settlement 1** — a part-width picture cannot carry a transparent header, because the header would be half over a photograph and half over the page.

**Frame height.** The text block plus its padding is the taller side at Medium and above, so it sets the section's height and the 520 px picture centres against it.

**Flagged.** The bleed rule, the 1080 hand-off, and the correction to settlement 1.

---

## 13. Latest Post

3 Split's arrangement with the newest published post as the right half: one card carrying its picture, title, tag and date. The category's only live data.

**Fields.** Authored: the set as 3, where `image` is the fall-back picture. From Ghost: the newest published post's title, feature image, primary tag, date and members access. Drafts, scheduled posts and pages excluded. **No excerpt, author, reading time or second post** — all A19's.

**Controls.** Padding · Which post (Latest published · Latest in a tag · Featured only) · Card style (With image · Title and date) · Card side (Right · Left) · Headline size · Actions.

**The card.** Feature image at 3:2, to agree with A24's post crop. Title 24 px in the heading font, two lines maximum, full title in the DOM. A1·6's “tag · date” meta row at 13 px. The whole card is one link named by the title; hover underlines the title and darkens the picture 4% **with no scale** — A3·9's 1.02 would move the fold. At Title and date the card takes `surface`, one hairline, a 13 px “Latest” label and a 28 px title.

**Data states.** Post with no feature image → a hover-surface panel of the same height carrying the title at 15 px clipped to three lines; the title then appears twice, deliberately, as A3·9 decided. No published post, or an empty tag or featured set → the section's own `image` at 4:3 and the design renders as 3 Split; with neither, 2 Flush Left. Members-only post → a third meta item, “Members only”, in `text`, no glyph and no badge. **This last is a stated departure from A3·9**, which marks nothing in the footer: a hero is where a reader arrives, and sending them from the front door into a paywall unannounced is worse than telling them.

**Routes.** Home and custom routes only.

**a11y.** The authored headline is the page's h1 and the post's title an `<h2>` inside the card's single link. Not a `<nav>` and not a feed. Picture decorative, tag plain text, date a `<time datetime>`. Nothing in the design depends on the length of live content: two-line title cap, fixed 3:2 box, a meta row that never wraps.

**Responsive.** 3 Split's ladder. The card's own steps: title 24 → 22 px at 834; at ≤ 767 the card becomes a row with a 108 × 81 thumbnail at 3:2, an 18 px title and a short-formed date.

**Flagged.** The 3:2 crop and its agreement with A24, the 24 px title and two-line cap, dropping A3·9's hover scale, the four omissions, the mobile thumbnail, the “Latest” label, the route restriction, and the members-only marker.

---

## 14. Full Height

4 Full Bleed's arrangement measured against the window, with a labelled scroll cue at the foot. The only design that knows how tall the browser is.

**Fields.** As 4, plus `scrollCueLabel` (≤ 24, default “Read on”). Picture focus is 4's field and applies here; it is not a control on this design.

**Controls.** Height (Full window 100svh · Three-quarters 75svh) · Padding (56 · 88 · 120, from the foot, above the cue) · Text position · Scroll cue (Show · Hide) · Headline size · Actions.

**Height.** `min-height: 100svh`, never `height`, and never `overflow: hidden`. `svh` rather than `vh` so the section does not jump as a phone's toolbars retract. The header's 76 px sits inside the height rather than being added to it.

**The floor.** Where the set plus its padding needs more room than the window has, the section grows and the reader scrolls — the height is a target, not a cap. Below about 560 px of window height the sub leaves, the only element in A4 dropped by a height rather than a width.

**The cue.** A 13 px uppercase label at 82% over a 1 px × 20 px rule, centred, 24 px from the foot, 44 px hit area. Hover takes the label to full strength and the rule to 28 px. A real `<button>` — it moves the page rather than going somewhere — that scrolls and then moves focus to the next section's heading; instant under reduced motion. **Removed from the DOM** past 40 px of scroll and whenever the section is not the window's height, rather than hidden. No bob, no pulse, no fade.

**Empty.** No image → 4's flat contrast panel, but the window's height and the cue are both kept.

**Responsive.** 4's ladder for the set. At 834 portrait the section is taller than it is wide, the only place in A4 that happens, and the picture is cropped hard on its sides. At ≤ 767 the set sits 72 px from the foot, the cue 20 px with a 16 px rule, and the home-indicator safe area is added below the cue rather than taken from it.

**Flagged.** `svh` over `vh`, the two heights and the refusal of a half-window value, the 88/24 px pair, the cue's geometry and its four behaviours, the 560 px sub rule, and the safe-area decision.

---

## 15. Search

One field where the actions would be, for an archive whose front door is a query. **It never renders a result.**

**Fields.** `eyebrow` · `headline` (req) · `sub` · `searchPlaceholder` (≤ 32, default “Search the archive”) · `note` (≤ 90). The two action fields are kept and not drawn — a button beside the field would compete with the return key for the same job.

**Controls.** Padding · Field width (Narrow 400 · Medium 520 · Wide 640) · Headline size · Ground (Background · Surface · ~~Contrast~~, disabled in A3·4's words) · Sub (Show · Hide) · Note (Show · Hide).

**The field.** 52 px at every width — a search field is the page's primary action and 52 px is where it stops reading as a form row. `surface` with the border token, a 17 px CSS glyph, 16 px text; inner padding 16 px above 767 and 14 px below. All three widths are narrower than the headline's 720 px measure: a field as wide as the headline reads as a second headline.

**Four states.** Empty (placeholder and glyph muted) · focus (1.5 px accent border, the library ring suppressed as A3·4 and A4·11) · typed (a 44 px clear control labelled “Clear search”, 8 px inside the field's edge above 767 and 4 px below) · submitted (hover-surface ground for the length of the navigation). No button, no dropdown, no suggestions.

**Dark.** The field is `background` darkened one step — a recess rather than a lift, because a 640 px field lifted would be the brightest object on the page. A pack whose background is already near-black gets a 4% lift instead, the same escape A3·5 uses.

**Data.** Nothing from Ghost; the note's numbers are typed. Where the theme has no search, the design is not offered and the editor names the reason rather than rendering a field that goes nowhere.

**a11y.** `<form role="search">` — the category's only `search` landmark, and one of its two form landmarks alongside 11's — with `<input type="search">`, a visually-hidden label, `enterkeyhint="search"`, no `autofocus`, an `aria-hidden` glyph and a labelled 44 px clear button that returns focus to the field. **No results, no live region, no combobox pattern.** A23 Search owns everything after the return key.

**Flagged.** The 52 px height and its clear control, the 16/14 and 8/4 px ladder, the CSS glyph, the absent button, the three widths and the measure rule, the submitted state, the dark recess and its near-black escape, and refusing suggestions.

---

## 16. Pull Quote

Somebody else's sentence in the display position, with the publication's own headline demoted to a line above it.

**Fields.** `quote` (req, ≤ 240 **hard**, quotation marks typed by the author) · `quoteName` (req, ≤ 40) · `quoteRole` (opt, ≤ 60) · `quotePortrait` (opt, square, ≥ 88 px) · `headline` (**optional here** — the only design in A4 where it is) · `primaryAction` · `secondaryAction`. `eyebrow` and `sub` are kept and not drawn. Nothing from Ghost — there is no reviews API, and the editor says so.

**Controls.** Padding · Quote size (Medium 36 · Large 46 · Display 60) · Attribution (With portrait · Name and role · Name only) · Alignment (Centred · Left) · Ground (Background · Surface · Contrast) · Actions.

**The reversal.** The headline renders in the eyebrow's treatment — 13 px uppercase tracked, muted — and the quotation takes the display position in the heading font at **regular weight**, measure 900 px centred or 720 px left. The section has one display moment as every section does; here it is spent on the quotation.

**Attribution.** A1·6's avatar and meta row at 44 px, the library's largest instance and the one place it is a subject rather than a byline. **The name cannot be turned off** — an unattributed quotation in a hero is the site putting words in an anonymous reader's mouth; where a site has permission to quote but not to name, the honest field is a role typed into the name. No stars, ratings, company logos or verified ticks.

**The cap and the step-down.** 240 characters, hard — the only hard cap in A4 — because a paragraph in the display position is an excerpt, not a pull quote. Above 180 characters the quote renders **one size value below** the control's setting, disclosed under the size control rather than silently disagreeing with it.

**Empty.** No portrait → A1·6's initials fallback at 44 px; the circle is never dropped, so a missing picture cannot silently change the chosen value. No headline → the line leaves and the quotation becomes the h1. No quote → the section does not render.

**On the Contrast ground** the portrait is unavailable and Attribution falls back to Name and role: a photograph in a circle on an inverted band reads as a hole punched in it.

**a11y.** `<figure>` → `<blockquote><p>` + `<figcaption>`, so the attribution is programmatically the quote's source. The headline is the h1 despite being the smallest text — visual size is not heading level. Quotation marks are typed characters, not `::before`. Portrait decorative, initials `aria-hidden`, name and role never links. No rotation and no motion; a set of more than one quotation is A8 Testimonials', and A2·9 Rotator is where the library rotates anything at all.

**Responsive.** Quote 46 / 36 / 27 at Large, measure 900 / 700 / full. Actions stay on one row at 834. At ≤ 767 the set is left-aligned whatever Alignment says, and the avatar steps 44 → 40 px.

**Flagged.** The reversal, the regular weight, the two measures, the 44 px avatar and its mobile step, typed quotation marks, the required name and the missing fourth attribution value, the refusal of ratings furniture, the 240 cap, the 180-character step-down, the one-row actions at 834, and the portrait on Contrast.

---

## 17. Slim

A page title, not an argument: one row, about 160 px, for the top of an archive index, a tag page or an About.

**Fields.** `headline` (req, the page title) · `eyebrow` · `sub` (the description, ≤ 120 here) · `meta` (≤ 32) · `primaryAction`. `secondaryAction`, `image` and `imageAlt` are kept and not drawn.

**Controls.** Padding (**Compact 36 · Comfortable 56 · Spacious 80** — the only design in A4 whose Comfortable is not 96) · Arrangement (Title and meta · Title only · Title and description · Title and action) · Title size (Small 32 · Medium 40 · Large 52, no Display) · Rule (Below · Band · None) · Alignment (Left · Centred) · Eyebrow (Show · Hide).

**The right-hand slot** has exactly one occupant — the meta, or one primary action, or nothing. Title and description drops the meta; Title and action drops the count. One occupant means one collapse, which is what keeps the row one row at every width. The meta is 14 px at every width, bottom-aligned to the title's last line with 6 px of optical lift, and drops to its own right-aligned line above the rule once the title passes 75% of the row. The title wraps at 60% of the measure.

**The rule** is never above — the header already ends in one. Band replaces the hairline with the section's own hover-surface ground (`surface` in dark) rather than stacking with it.

**Data.** The only design in A4 whose title can come from Ghost. On a tag or author page the title, eyebrow and count fill from the archive and the authored fields are shown as overridable placeholders labelled “From your tag”. Count grammar: “1 post”, not “1 posts”; “No posts yet”, not “0 posts”. A tag with no description renders Title and meta even where Title and description is chosen, with the fall-back named. Offered on every route — the only design in the category that is.

**The boundary with A29 Archive Headers.** This design is a hero a user places on any page, including a tag or author page. A29 owns the archive header a theme renders on those templates by default, with the filtering, sorting and pagination context that belongs to them. A site uses one or the other, and the editor names the collision rather than drawing both.

**a11y.** The title is the h1, and **the heading contract with the section below is this design's main obligation**: it is nearly always followed by a list of posts, and its h1 makes every card title an h2, so the page's outline is one h1 and a flat run of h2s. The eyebrow names the template in words — “Tag”, “Writer” — rather than a glyph. The count is plain text in the `<header>`, not a live region and not `aria-describedby` on the title. Nothing interactive but the action; no motion.

**Responsive.** Title 40 / 34 / 28 at Medium, padding 56 / 48 / 36, band about 160 / 140 / 112 px. The row holds at 834. At ≤ 767 the right-hand slot stacks under the title, left-aligned, 8 px below; an action there goes full width at 48 px.

**Flagged.** The padding scale and its departure from 96, the 40 px title and the absent Display value, the 6 px optical lift, the 60% and 75% thresholds, the four arrangements and the slot's exclusivity, the refusal of a rule above, Band replacing rather than stacking, the count's grammar, and the placeholder behaviour.

---

## 18. Overlap Card

A wide picture with the text on a surface card pulled up over its bottom edge, the greater part of the card sitting on the page below. The category's only design that reaches into its neighbour.

**Fields.** `image` (required in practice — without it the design hands off) · `imageAlt` · `eyebrow` · `headline` (req) · `sub` · `primaryAction` · `secondaryAction`. Picture focus applies. Nothing from Ghost, except a post or page's feature image offered as the picture's default with its source named.

**Controls.** Picture height (Standard 440 · Tall 520) · Card side (Left · Right · Centred, where the card widens to 820 and the text stays left) · Overlap (Small 48 · Medium 96 · Large 144, how far the card is pulled up onto the picture) · Headline size (Medium · Large · ~~Display~~, disabled — 76 px on a 660 px card leaves under 8 characters a line) · Overlap on a phone (On · Off) · Actions. **No padding control** — the overlap is this design's spacing.

**The card.** 660 px, `surface`, the pack radius on all four corners, 48 px inset. **The md shadow in light and a hairline instead in dark** — A4's only md shadow, with A1·1's dropdown panel the library's other one, and the design's one structural difference between modes. A card with square top corners would be a panel attached to the picture rather than a card over it.

**The overlap** is never more than 40% of the card's height — past that the picture's bottom edge crosses into the card's own text rather than passing behind its top margin. Where a short card would break the rule the value steps down one named value with the reason disclosed. Most of the card sits below the picture, and the section's bottom padding is measured **from the card's foot** rather than the picture's, so the next section's top padding is untouched and nothing overlaps its content. A page that puts a contrast band immediately below gets the card overlapping a dark ground — legible, since the card is opaque, but the band's top padding then reads as smaller than it is, and the editor flags that pairing rather than preventing it.

**Header mode is Overlap** (A1·4 Overlay) with 4 Full Bleed's top scrim.

**Empty.** No image → hands off to **2 Flush Left**, card and all, header back to A1·1 Rail. The design's subject is the relationship between a picture and a card; without the picture there is no design, only a text block, and 2 already is that text block. No sub or no actions → the card shortens and the overlap may step down. Overlap off on a phone → surface, shadow and inset all leave and the text sits on the page at the page margin, which is 3 Split's mobile arrangement.

**a11y.** The headline is the h1 **on a measured surface rather than over a photograph** — this design's real advantage over 4 Full Bleed, since the contrast is a token pair rather than an estimate against an unknown image. The DOM is flat and in visual order; the overlap is negative margin, not absolute positioning, so the section's height includes the card and 200% text zoom grows it downward. The card is not a landmark, a region or a labelled group — it is a visual plane. No motion: no rise, no fade, no parallax.

**Responsive.** Card 660 / 560 / full-minus-16, inset 48 / 36 / 24, overlap 96 → 64 at 834 and 32 at ≤ 767, picture 520 / 400 / 260, headline 60 / 40 / 32. The actions stack at 834 even though the row would fit — a stacked pair inside a card reads as the card's own content. At ≤ 767 the card keeps a 16 px side margin, inside the page's 20, and Card side is ignored.

**Flagged.** The 660/820 px card and 48 px inset, the md shadow and its dark hairline substitution, all-four-corner radius, the three overlap values and the 40% rule, measuring the section's foot from the card, the disabled Display value, stacking at 834, the 16 px phone margin, the contrast-band warning, and the hand-off to 2.

---

## Category artefacts

In `A4-0 Category Proof.dc.html`:

- **The four settlements** §8 asks A4 to make — where A1·4 Overlay lands on each hero, the image / no-image / video-poster variants, how the set scales from 1440 to 390 without dropping the actions, and what a hero renders on a page with no feature image and on templates other than home.
- **The tokenisation proof** — 3 Split in three packs, light and dark, six frames, with only tokens changing.
- **The stress frame** — the category's worst realistic content: an eyebrow at 29 of 32 characters, a 119-character headline against about 90 advised, a sub at 219 of 220, both action labels at 18 of 20, a portrait photograph in a landscape crop, and Headline size left at Display where the content wanted Medium.
- **The roster** — all eighteen, what each is for, what it settles, and its header mode.
- **The shared field list** — the union of everything the eighteen need, with types, caps and which designs draw each field. This is the contract that makes design-switching safe: a design may draw fewer fields, but none may need one that is not on the list, and fields a design does not draw are kept rather than cleared.
- **The consistency pass** — §9, written after all eighteen were drawn: what was checked, the eight things that were wrong, and the pattern in them. Every control list in this document was rewritten from its drawn panel as part of it; where the two ever disagree again, **the drawn panel is the authority**.

## Hand-offs out of A4

| Boundary | Owner |
|---|---|
| Search results, the overlay, its keyboard model | A23 Search |
| The post as subject — excerpt, author, reading time, more than one post | A19 Featured and Spotlight |
| A set of more than one quotation | A8 Testimonials |
| Rotating anything | A2·9 Rotator |
| The archive header a theme renders on tag and author templates | A29 Archive Headers |
| A third action, or a row of them | A6 |
| Richer statistics than three authored pairs | A10 Stats and Numbers |
| The video player inside the dialog | A15 |
| The site-wide countdown and its wording | A2·6 |
| The post's own feature-image crop | A24 |
