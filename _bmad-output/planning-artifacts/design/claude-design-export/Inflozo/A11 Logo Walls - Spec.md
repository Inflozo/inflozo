# A11 Logo Walls — written specification

15 designs · Paper pack · drawn in this project as `A11-1 Row.dc.html` … `A11-15 Big Type.dc.html`, with the category's shared artefacts in `A11-0 Category Proof.dc.html`.

Read `A11-0` first. It carries the four settlements §8 asks A11 to make, the logo component, the box ladder, the twelve placeholders, the rules all fifteen share, the shared field list, the roster, the tokenisation proof across three packs and the stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times, plus the amendments the drawn designs forced on the proof.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

**Sixth pass — the design patch pass (this document's current state), 30 August 2026.** The ten library-wide rules were applied to the category, and one of them reached every design in it. **No design ever turns into another design:** A11 was written as a map of hand-offs — eleven designs handed their content to 1 Row, 3 Grid handed up to 13 Dense, 11 Named handed to 3 Grid and lost every caption on the way, 8 Marquee handed to 3 Grid under reduced motion, and 9 Rail decided which design it was by measuring the window — and **every one of those is deleted**. A placed design draws the marks that exist at its own geometry, hides what does not apply, and the panel advises. Two consequences are visible rather than editorial: **11 Named draws its captions at every count**, the hand-off that dropped an item field being gone, and **9 Rail stays a rail**, drawing no arrows and no fade where the track already fits. **Item counts are a number picker:** five rows become one — 1 Row 3–6, 2 Caption Row 3–5, 10 Slim 3–6, 15 Big Type 3–4 and 12 Tiers' Lead count 1–3 — each with its maximum and the reason at the control, while **Count per row stays a named-value row in the eight designs where it divides a row into columns rather than counting marks** — **ruled by the owner on 30 August 2026**, the split confirmed as drawn. **Gap names are Tight · Normal · Loose:** 8 Marquee's and 9 Rail's Gap and 13 Dense's Row gap are renamed with no value changed. And **CSS cannot see content**, which cost two drawn rules: **6 Split Head's 1080 reorder is withdrawn** — one document order at every width, the head's foot staying in the head — and **2 Caption Row's label now goes where its document order puts it**, above the wall at Label side Left and under it at Label side Right. **Nothing was renumbered.** Every change is listed with the name of the rule that required it in **Patch notes** at the end, and **the three points this pass raised were ruled by the owner on 30 August 2026**: the free designs are 1 Row and 10 Slim, the count split stands as drawn, and **a logo's shape is recorded by the editor at upload and stored on the item** beside the file and its alt. **Where an earlier pass in this document disagrees with the Patch notes, the Patch notes are the later ruling.**

**[Free] designs:** 1 Row · 10 Slim

*(Shortlisted in this pass — 1 Row, 10 Slim, 3 Grid, 4 Boxed — and **ruled by the owner on 30 August 2026**: the category default and the typeless band, one row across the page and one band under a hero, neither needing a caption or a photograph. It is the only line the merge reads.)*

**Controls-reconciliation patch, 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface, reusing the shared editor primitives designed in **P0 · Editor primitives** — the P0·1 inline text toolbar and its link popover, the P0·2 icon slot and Icon Picker, the P0·3 item-list controls, the Link Picker and the editor state switcher. **Five things changed across all fifteen designs.** **Hover: Resolve to colour · None** ships as a section control: the resolve applies to **every mark, linked or not**, while the hover surface stays the link's — before this pass a greyscale wall with no URLs authored could never resolve at all. **The universal trio — Background role, Vertical spacing, Top divider — sits outside every design's control list**, and every per-design **Padding** row has retired into Vertical spacing; **7 Contrast Band's 44 · 64 · 88 and 10 Slim's width-independent 32 · 44 · 56 survive as that control's resolutions rather than as second rows**, while 4 Boxed's Panel padding, 5 Cards' Card height and 13 Dense's Row gap keep their own, because they measure something other than the section. **Every visible string edits inline on canvas** with the P0·1 toolbar — the head fields, `note`, 2 Caption Row's label, 11 Named's captions and 12 Tiers' two tier labels — and `linkUrl` opens the Ghost-aware **Link Picker**, the section link taking an optional P0·2 icon before or after its label. **Five published strings become theme catalog strings**: 8 Marquee's “Pause the logo wall” and “Play the logo wall”, 9 Rail's “Logo wall, scrollable”, “Scroll left” and “Scroll right”. And **`logos[]` is named as the P0·3 item list** on all fifteen frames, with **Image focus: Centre · Top · Bottom in the Image Picker's popover, disabled with its reason shown** — nothing in A11 is cropped. Per design: **8 Marquee gains Gap: Tight 40 · Comfortable 64 · Wide 96**, 9 Rail carries an **ARCHITECT: registry addition** note, and **7 Contrast Band's Background role is locked** with the reason on the frame. §18 records every conflict with an earlier ruling, one line each.

**Specification-only pass, this session.** Every design now carries four added fields — descriptor, structural descriptor, archetype, behaviour module — at the head of its section, plus an **Items** field naming what the sidebar does with `logos[]`. Nothing drawn changed, no frame moved and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand as written. **No module rename was needed** — this document named no modules at all, having written behaviour as motion and as the reader’s own scrolling rather than as JavaScript. Every module name below is the fixed 31-module registry’s (FR-G7) and every no-JS sentence is quoted from it rather than composed here.

**A11 uses two modules and thirteen designs declare none.** `marquee` on **8 Marquee** and `carousel` on **9 Rail** — the two designs the shared floor already named as the category’s one behaviour and its one interaction. Everywhere else the resting state is the only state and the resting state is markup and stylesheet: the logo box, the ladder, the aspect classes, the treatment filter, the dark plate, the `<picture>` query, the hover surface and the focus ring are all CSS. **No A11 design loses an authored logo without JavaScript**, and thirteen of the fifteen are pixel-identical with it switched off.

**`core` is assumed, not declared per design.** A11 has almost no JS-conditional CSS to begin with — only the two track designs have a no-JS branch at all — and `core`’s job is that branch: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than fifteen times. *Flagged: not listing it per design is mine.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. **Both are edit-safe** — 8 Marquee’s track is parked at its start while editing and 9 Rail’s scroll position is never persisted or restored — which is why every frame in A11 is a resting state.

**Three findings for the architect.**

1. **`carousel` is the closest module to 9 Rail and it is not a description of it.** The registry’s no-JS branch names a `scroll-snap` strip; **A11·9 refuses scroll snapping** for a stated reason — a snap point has to be a logo’s edge, and a 216 px wordmark and a 26 px mark cannot share one. The degradation still holds and is still fully usable, but it is a scrollable strip *without* the snap. Either the registry needs a non-snapping scroller or the refusal is out of scope for a generated theme; that is the architect’s call, not this document’s.
2. **9 Rail’s measurement decides furniture, not design.** Since the design patch pass the rendered width of the track no longer chooses between two designs: where the track fits its container, the arrows and the fade are not drawn and the section is still a rail. `carousel` has no branch for that measurement either, which is what the registry addition is for — but the cost is now two states of one design rather than a hand-off. **With JavaScript off the section stays a rail**: a natural-width row with the page margin as padding at both ends, natively scrollable, arrows and fade absent. The honest reading is that the no-JS drawing of 9 Rail is 9 Rail minus its arrows.
3. **8 Marquee’s two off-switches now draw the same thing.** Reduced motion is a `prefers-reduced-motion` media query and JavaScript off is the registry’s static scrollable row, and since the design patch pass both are **the same track standing still**: a full-bleed row, natively scrollable, the fade or hard edge as authored, and no pause button, because nothing is moving. **2.2.2 and 2.3.3 are both met by a track that does not move**, and there is no precedence left to state. *Flagged: replacing the hand-off with a stationary track is mine.*

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**A11's finding, stated first: this is the first category whose principal content is not type.** A logo wall draws artwork the site uploaded — files made by other people, in aspect ratios nobody agreed on, at whatever colour their owners chose. Re-skin the section into another pack and the ground, the head, the hairlines and the radius all change, and **every logo on the frame stays exactly as it was**. That inverts the usual tokenisation problem: the wall's job is not to be re-coloured, it is to make foreign artwork sit level on a ground it was not made for, in twelve packs and two modes. **Flagged**, and the category's headline finding.

**Every logo on every frame in A11 is a placeholder, and no real mark appears anywhere in this project.** Each is drawn as a wordmark, or a geometric mark and a wordmark, in the pack's muted token, at the aspect ratio it stands in for. **The twelve names are invented publications** — Meridian Press, longform, The Ledger, Cartograph, Foundry Review, Northbound, Signal & Co, Kestrel, Atlas Type, Rowan & Wells, Pinhole, Bellwether — with twelve more for 13 Dense: Quire, Marginalia, Waypoint, The Gantry, Lantern, Oxbow, Third Estate, Halyard, Cornice, Tally, Weathervane and Ferry & Sons. **The placeholders use different typefaces from each other on purpose**: a brand's face belongs to the brand, so it must not move when the pack does. Where a frame has to show what colour artwork does to a wall, the placeholder is drawn in an invented brand colour taken deliberately from outside the token set, and the frame says so. **Flagged**, all of it.

**Behaviour: the category has one behaviour and one interaction, and thirteen designs have neither.** **8 Marquee** transports the wall and never stops for a pointer; **9 Rail** moves only when the reader moves it. Everywhere else the resting state is the only state, and a link's hover is the only thing that responds to anything. A10 had no behaviour at all; A11 has exactly two designs' worth, and both are named on every frame that is not one of them. **Flagged**.

**The shared field list — fourteen fields.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 20 · `linkUrl` url opt · `lede` rich text opt ≤ 280 · `leadLabel` text opt ≤ 20 · `restLabel` text opt ≤ 20. In `logos[]`, three to twenty-four: `logo` image **req** · `logoDark` image opt · `alt` text **req** ≤ 60 · `url` url opt · `caption` text opt ≤ 40 · **`shape` enum, written by the editor and never by the user** — Wide · Regular · Square, computed from the file's intrinsic ratio when it is uploaded and re-computed when it is replaced, ruled 30 August 2026. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. **Four fields are read by one design each and kept by the other fourteen:** `lede` by **14 Inline**, `caption` by **11 Named**, `leadLabel` and `restLabel` by **12 Tiers**. **Twenty-four is the ceiling of `logos[]` and 13 Dense is where it is reached.** **Nothing comes from Ghost**: a logo is a site upload, never a post's feature image, never a tag's image, never an author avatar. **Flagged**: every limit, the twenty-four ceiling and the sixty-character alt.

**The logo is the category's one new component: one image in a box.** A fixed-height box from the ladder, a max width of the cell minus 24, `object-fit: contain`, centred on both axes, with its aspect class setting the drawn height. **No border, no plate, no shadow, no radius on the artwork itself, no caption, no hover and no motion** — with three stated exceptions: the light-mode-`surface` plate in dark when no `logoDark` exists, the hover surface under a link, and 8 Marquee's transport. **The box has no visible edge in any design**; 3 Grid's hairlines, 4 Boxed's panel and 5 Cards' card are those designs' containers, drawn around the box and never on it. **Flagged**.

**The box ladder is A11's one new scale: Small 28 · Medium 36 · Large 48** at 1440; 26 · 32 · 40 at 834; 24 · 28 · 32 at 390. **Two off-ladder sizes: Tiny 22 in 13 Dense, and Huge 64 in 15 Big Type and 12 Tiers' lead tier.** Row gap 40 · 32 · 28. **Flagged**, the whole ladder.

**Aspect classes, computed from the file's intrinsic ratio, with no control over them — and **the ratio is recorded by the editor at upload and stored on the item**, ruled 30 August 2026, because neither a stylesheet nor a template can measure an uploaded file: Wide ≥ 3:1 takes 100% of the box · Regular 3:1 to 1.4:1 takes 88% · Square under 1.4:1 takes 72%.** Normalising by box height alone is the defect, not the fix: a square mark and a 5:1 wordmark drawn at one height are not the same optical weight, because the square carries five times the ink. **Logos in a row share a horizontal centre line, not a baseline** — a wordmark's baseline and a mark's centre cannot both be honoured. **Nothing is cropped, stretched, upscaled past its intrinsic size or altered in ratio.** SVG preferred; PNG at 2× the box height, and the editor warns below it. **Flagged**: the three classes, all three percentages, the centre line and the 2× floor.

**Treatment: Full colour · Muted · Greyscale, with Greyscale the default.** Greyscale is `grayscale(1)` at full opacity. Muted is `grayscale(1)` at 64% in light and 74% in dark — **except on 7 Contrast Band, where it is 70% in both modes**, because the band's lightness does not follow the mode's. Full colour is the file untouched. **Refused: `invert()`, blend modes, duotone, an accent tint, and a per-logo override.** **§7.4 cannot be applied to this control**: a value that would fail contrast is meant to be disabled with its ratio shown, and **the theme cannot measure an uploaded file** — so Muted is never disabled, and the editor carries the advice instead, 3:1 against the ground, non-text. **The one enabled value in the library that the theme cannot prove.** **Flagged**.

**A dark ground is where a logo wall breaks, and the answer is a second file, not a filter.** With no `logoDark` the theme does not invert and does not lighten: it draws the logo on a plate carrying the pack's **light-mode** `surface` — `#FFFFFF` in Paper — at the pack radius, 12 px of padding, no hairline and no shadow. **The dark-mode `surface` token cannot be used**: Paper's is `#211D17`, and dark artwork on it is the problem the plate exists to solve. **This is the one place in the library where a dark section draws a light-mode token.** **The plate takes the treatment's opacity with the rest of the wall.** Five designs vary it and each says so: **7 Contrast Band** draws it in *light* mode; **5 Cards** makes the card itself the plate; **13 Dense** drops its padding to 8 at Tiny 22; **12 Tiers** and **15 Big Type** let it exceed its box at Large 48 and Huge 64, the row growing to fit; **14 Inline** lets it set the paragraph's leading. **Flagged**, all of it.

**Links are per logo and optional.** A logo with a `url` is an `<a>` wrapping the `<img>`; without one it is a bare `<img>`. **The wall is never one link**, and a wall where some logos link and some do not is the ordinary case — the panel says how many are links. **One hover rule at all three treatments: the cell takes the pack's hover surface at the pack radius and the treatment resolves to full colour, 160 ms.** **Reconciled: the resolve is a section control — Hover: Resolve to colour · None — applying to every mark, linked or not, while the surface stays the link's alone.** At Treatment Full colour the control is unavailable, there being nothing to resolve; there is still no per-logo override. Focus is A6's ring on the cell box. **Refused: an external-link glyph, a tooltip, a “visit” label, a lift, a scale and a shadow.** **The resting state gives no sign of which logos are links** — a stated cost in all fifteen, and the reason 5 Cards exists. Two designs vary the target: **5 Cards** makes the whole card the `<a>`, **11 Named** wraps the logo and its caption; **14 Inline** refuses to draw `url` at all. **Flagged**.

**`alt` is required and is the brand's name.** `alt=""` is refused on every logo in every design — a wall nobody can read is a wall of decoration, and the names are the content. **Not “Meridian Press logo”**, because the word logo is what the image already is. **The one exception in the category is 8 Marquee's duplicate track**, whose copies are `aria-hidden` with empty alts. **Flagged**.

**“Caption” is two different fields.** The section's `note` sits under the wall at 13 px muted on a 620 measure and carries the permission line or the “and forty others”. The per-logo `caption` is 40 characters and is **drawn by 11 Named only**; the other fourteen keep it and say how many they are not drawing. **Flagged**.

**Space.** **Reconciled: this is the universal Vertical spacing control**, outside every design's list — Compact 64 · Comfortable 96 · Spacious 132, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. **Two designs carry their own vertical scale:** 7 Contrast Band's band at 44 · 64 · 88 (A4·9's) and 10 Slim's at 32 · 44 · 56 (A7·8's, and **the one scale in A11 that does not step with width**).

**Head.** Eyebrow 13 px uppercase tracked `.08em` muted, 10 px above the title; title on a 780 measure; sub 17 px muted on 620, 12 px below the title; **head to wall 48**; note 32 px under the wall on 620; link 20 px under the note. **Title ladder: Small 28 · Medium 34 in twelve designs, Large 40 in 6 Split Head and 15 Big Type, Display 48 in 15 Big Type only** — unlike A10, the display moment is available here, because the logos are artwork and do not compete for it. **15 Big Type's 1,040 measure and 64 px head gap are the only exceptions.**

**Counts and cells.** Per row: Three 416 · Four 306 · Five 240 · Six 196 on a 24 px gutter — A10's divisions, extended by two. Three designs have their own: **6 Split Head** at 400 / 258 / 188 inside its 824 block, **13 Dense** at 196 / 141 / 108, **7 Contrast Band** at 274 / 214 when Inset. **Four designs have no cell grid at all:** 8 Marquee, 9 Rail, 10 Slim and 12 Tiers' lead tier, all of which draw logos at natural width on a fixed gap. **6 Split Head's 25 px gutter at Count Three is the one gutter in A11 that is not 24**, and 13 Dense's 12 px gutter at ≤ 767 is the one that tightens.

**Rows wrap in authored order, 40 px apart, and the short last row keeps the cell width.** Stretching it is refused — a wider cell is a bigger logo box, and one logo drawn larger than its neighbours is the defect the whole category exists to avoid. **Centring is the default in 1 Row, 3 Grid, 7 Contrast Band and 15 Big Type; four designs depart and each says so:** 4 Boxed centres at 1440 and left-aligns below it, 5 Cards left-aligns at every width because cards have visible edges, 6 Split Head left-aligns inside its block, 13 Dense defaults to Left because a nearly full last row continues the grid. **A last row of one is drawn, warned about, and not prevented**: the editor's counter names the counts that divide. **Flagged**.

**Responsive floor.** **Six across steps to four at 1080, everything steps to three at 834, and everything steps to two at ≤ 767 — never to one.** At 834 three cells of 234 on 26; at ≤ 767 two cells of 163 on 24. **Two stated exceptions: 12 Tiers' lead tier goes to one across at ≤ 767**, and **13 Dense keeps four across at 78 on a 12 px gutter**. Six designs collapse a second axis: 2 Caption Row's label leaves its column at 1080, above the wall at Label side Left and under it at Right · 6 Split Head's head becomes a full-width block above the wall at 1080 with its foot still in it · 8 Marquee drops to one row at 1080 · 9 Rail drops its arrows at 767 · 10 Slim stops being a band at 767 · 14 Inline collapses nothing, because a paragraph reflows.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the wall a `<ul>` of `<li>`; each logo an `<img>` with its `alt`, wrapped in an `<a>` when a URL is authored. **`<picture>` with a `prefers-color-scheme` source is used, and only when `logoDark` exists** — inverted in 7 Contrast Band and only there. Refused: `<figure>`, a table, a carousel role, an `aria-label` on the list repeating the title, and a CSS background image for any logo. **Four cases take no accessible name: 10 Slim always, 2 Caption Row with no title authored, 6 Split Head with no title authored, and any design at Head None.** **14 Inline is the one design with no list at all.** **9 Rail generates the one accessible name in A11** — “Logo wall, scrollable” — because there a name is what makes the arrow keys reachable.

**The accent is spent in two places and nowhere else:** the optional section link's underline and the focus ring on a link or a logo. **No logo is ever accent-tinted, in any design, at any treatment.** 7 Contrast Band substitutes the band's carried colour for both, at 2.3:1. With no section link and no logo URLs authored, **fourteen of the fifteen contain no accent pixel at all — 9 Rail is the exception**, because its two arrows carry the accent as their hover and focus colour whatever else is authored.

**Empty.** No eyebrow, sub, note or link → absent, and the block closes up. **No logos → the section does not render**; the editor shows the empty repeater and its Add logo control. **A logo with no `alt` cannot be saved** — the one field in A11 required beyond the file itself. Fewer logos than the per-row count → one short row. **Eleven designs name 1 Row in their panels as advice**, which makes it the most-advised design in the library — and since the design patch pass nothing is handed to it.

**Print.** Greyscale and Muted print as drawn — paper is where a greyscale wall was always going. **8 Marquee and 9 Rail both print as their own track wrapped onto the page**, because a printed page has no viewport to scroll — the print stylesheet wraps the track, and neither design becomes another one. 7 Contrast Band drops its band and therefore **prints the light files**, the one place printing changes which file is used. The dark plate never prints, since print is the light mode.

**The item list — where it lives, and the rules that hold in all fifteen.** **Reconciled: it is the P0·3 item list, named in those words on all fifteen frames**, and every image field carries **Image focus: Centre · Top · Bottom** in the Image Picker's popover — **disabled here with its reason shown, because nothing in A11 is cropped**: the file is drawn whole inside its box at `object-fit: contain`, so there is no discarded edge for a focus to choose. The repeater sits in the sidebar below the design’s own controls: one row per logo showing a 24 px thumbnail of the file, its `alt` as the row’s label, a drag handle, a remove action, and **Add logo** at the end. **The thumbnail is the row’s identity, because `alt` is the only text most items have** — in 11 Named the `caption` is drawn under it in muted. Selecting a logo on the canvas selects its row and opens that item’s fields; ⌥↑ / ⌥↓ moves the focused row.

**Add never produces an empty shell, and A11 is the first category that cannot seed the required field.** `logo` is an upload and the theme has no artwork to invent, so a new item arrives holding **the editor’s placeholder tile** — a neutral 3:1 wordmark reading *Add a logo* in `text-muted`, drawn at the design’s own box height — with `alt` seeded as **“Publication name”** and the file picker open. **The tile is editor-only and never published**: an item still carrying it is not drawn on the front end and the panel counts it out, “11 of 12 placed”, which is 14 Inline’s chip wording used for the whole category. It lands **last**. *Flagged: the tile, the seeded alt and the “placed” counter are mine — no drawn panel shows them.*

**Remove is never disabled, and a design below its designed count draws the marks that exist.** The list is the user’s, and what to draw at three logos is the theme’s problem — so the design keeps its own geometry, hides what does not apply, and the panel advises the design that suits the count. Removing the last item empties the list, at which point the section does not render. *Flagged: mine — A3 disables remove at a design’s minimum; A11 has no minimum to disable at.*

**Reorder is meaningful in fourteen designs and decides more than order in five.** Authored order is drawn order and **nothing is re-sorted — not by width, not by aspect class, not to fill the last row** — so the repeater decides which mark is first, which lands on a short last row, and, where a Count control draws fewer than are authored, which marks are drawn at all: **1 Row, 2 Caption Row, 10 Slim, 8 Marquee, 13 Dense and 15 Big Type all draw the first N and hold the rest.** **12 Tiers makes it structural** — the first one, two or three items *are* the lead tier, and there is no per-logo tier field. **14 Inline is the exception**: the lede’s chips decide where each mark sits, so the repeater’s order is not the drawn order and dragging a row moves nothing on the canvas.

**Counts.** The field’s range is **three to twenty-four**, with **two the floor in 14 Inline alone** and twenty-four the ceiling reached in 13 Dense. Add logo is disabled at twenty-four with “Twenty-four marks is the most a wall holds.” Every design states its designed range, and outside it there are only two answers in the category: **draw what exists · draw the first N and hold the rest** — with the panel advising the design that suits the count, and switching to none of them. **Nothing is ever padded, stretched, repeated, re-sorted or hidden to make a count come out even** — a wider cell is a bigger logo box, which is the defect the whole category exists to avoid. *Flagged: the twenty-four message is mine.*

**Zero logos** is the category’s one real failure and the shared floor already answers it: **the section does not render** — no head on its own, no band, no panel, no rule, no empty cell, no placeholder mark. The editor shows the empty repeater and its Add logo control.

**Inside an item the user edits content only:** `logo`, `logoDark`, `alt`, `url`, and `caption` where a design reads it. **`shape` is stored on the item and shown nowhere**: it is the editor's record of the file's intrinsic ratio, written at upload, and there is no control over it in any design — which is the same refusal as before, now with a mechanism behind it. **Nothing about an item’s size, layout, spacing, alignment, treatment or emphasis is exposed anywhere in A11** — Logo size, Treatment, Count, Card height, the box ladder and the aspect classes are section values every item reads. So **“draw this one bigger”, “leave this one in colour” and “put this one at the front of the lead tier” are not expressible by construction**; the third is answered by reordering, and the first two are what the category exists to refuse, because a wall whose marks carry different weights is not a wall. **A11 ships the pair that proves the rule**: 1 Row and 7 Contrast Band are the same wall on two grounds, and **12 Tiers is what a per-item size control would have been** — offered as a design, with its rest tier fixed at Small 28 so a site cannot flatten the hierarchy it chose the design for. **Three per-item controls are refused in writing:** a tier field (12 Tiers), a treatment override (the shared floor), and a box size (13 Dense).

**The optional fields inside an item, and what empty looks like.** `logo` and `alt` are required — **an item with no file is not published and an item with no `alt` cannot be saved**, the one field in A11 required beyond the file itself. **`logoDark` empty is the category’s most visible emptiness** and the plate is the answer, varying in five designs. **`url` empty is invisible**: a bare `<img>`, and the resting state gives no sign either way — the cost all fifteen disclose, and the reason 5 Cards exists. **`caption` empty is visible in 11 Named alone**, where the reserved space is kept and nothing is put in it; in the other fourteen it is stored and never drawn.

**Editing, strings and data — the three things this pass added to the floor.** **Every visible text in A11 edits inline on canvas** with the P0·1 toolbar — bold · italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow · noreferrer · sponsored** — and `linkUrl` opens the Ghost-aware **Link Picker**, the section link taking an optional P0·2 icon before or after its label, off by default. `alt` is edited in the item row rather than on canvas, being the one required string the category never draws. **Nothing in A11 is Ghost-owned, so no field here answers “Edit in Ghost”**, and the Data group reads **Source: Static (authored)** with P0·5's “From posts” value **absent rather than disabled** — there is no feed to filter. **Five published strings are theme catalog strings rather than fields**, all five in the two track designs: a visitor-facing string a site cannot leave blank cannot be a field, and 2.2.2 depends on two of them and 2.1.1 on the other three.

**Content.** Orbit Weekly throughout. Head: eyebrow **Featured in**, title **“The letter, elsewhere”**, sub **“Editors at these publications have quoted, reprinted or recommended the Thursday letter.”**, note **“Marks are shown with each publication's permission.”**, link **“Read the press page”**. **Flagged: every name, ratio and string is invented.**

---

## 1 · Row

Three to six logos in one row of equal cells, each contained in a fixed-height box, all on one centre line. The default — what a site gets when it types “logos” — and **the design eleven others name as advice**.

**Descriptor.** The category’s floor — one row of equal cells with nothing added to it: no container, no caption, no second size and no behaviour, and the arrangement eleven other panels name as advice rather than inventing one of their own.

**Structural descriptor.** `grid-of-N · none · page · few · inline · row of equal cells`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Nothing here is script: the box, the ladder, the aspect classes, the treatment, the plate, the hover surface and the focus ring are stylesheet, and the wall is server-rendered. **JS off:** identical in every particular — there is no JS-conditional CSS to fall out of, which is what `core` being assumed rather than declared means in this category.

**Items** · `logos[]` at the design’s own range; **every other design’s item rules are stated against this one.**

- **Add.** *Add logo* at the foot of the repeater; lands last; placeholder tile and seeded alt as the shared floor says. **Past the Count value the new item is held rather than drawn**, and the panel reads “5 of 7 drawn — 3 Grid draws all seven.”
- **Remove.** Never disabled. **This design has no floor**: two logos draw as two centred cells, one as one, and removing the last empties the list. It turns into nothing, which is what being the terminus means.
- **Reorder.** Meaningful, and consequential above the count — authored order decides which marks are drawn and which are held.
- **Counts.** **Three to six drawn, one per cell, and Count is a per-row count rather than a total.** Fewer authored than the number → that many cells centred; more → the first N drawn, the rest held, 3 Grid advised.
- **Zero.** The section does not render; the repeater shows Add logo and a line saying so.
- **Inside an item.** `logo`, `logoDark`, `alt`, `url`; `caption` stored and never drawn. **Logo size and Treatment are section values, so a mark cannot be singled out** — the rule’s clearest case in A11, because there is nothing else in this design for a control to attach to.

**Fields** · every section field except `lede`, `leadLabel` and `restLabel`; three to six items reading `logo`, `logoDark`, `alt`, `url`. `caption` kept, not drawn.

**Controls** · Head: Centred · Flush left · None. Title size: Small 28 · Medium 34, unavailable at head None. Logo size: Small 28 · Medium 36 · Large 48, **Large unavailable at Count Six**. Count: **a number picker, 3–6**, six the maximum with its reason at the control. Treatment: Full colour · Muted · Greyscale. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Arrangement** · cells 416 · 306 · 240 · 196 on a 24 px gutter across 1,296; every cell the box's height; logos centred on both axes at 100 / 88 / 72% of the box by class; head on 780, sub and note on 620; head to wall 48, note 32 under, link 20 under the note. Head Centred centres the head, the note and the link — **not the wall**, which is already the content width.

**Responsive** · the shared floor exactly: three across at 834, two at ≤ 767, never one; a short row keeps its cell width and centres.

**Empty** · head parts, note and link → absent. Fewer logos than the number → that many cells centred. **More than the number → the first N drawn, the rest held, 3 Grid advised.** **This design turns into nothing, and eleven others name it as advice.**

**a11y** · one tab stop per linked logo plus the section link; none at all with no URLs; focus on the cell box so a 26 px Square mark and a 36 px wordmark take the same ring; contrast title 15.8:1 / 15.1:1, sub and note 5.6:1 / 6.0:1.

**Flagged** · the five- and six-across divisions; the 48 / 32 / 20 foot gaps; disabling Large 48 at Count Six; holding back logos past the number rather than wrapping; head Centred leaving the wall alone; requiring alt and refusing the word “logo” in it.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover: Resolve to colour · None** added, **six of its own**. Quick Controls: **Count · Logo size · Head · Treatment.** Hover: the resolve applies to every mark and the surface stays the link's, and **the design eleven others hand off to is where the new rule is drawn** — an unlinked mark resolving with no plane under it, beside a linked one, beside Hover None. Items: `logos[]` is the P0·3 list, Add still arriving with the placeholder tile and the seeded alt; **Image focus ships disabled in the Image Picker's popover**, nothing here being cropped. Editing: eyebrow, title, sub, `note` and the link label inline; `linkUrl` through the Link Picker. **Frames changed:** the control panel, plus a states strip drawing the three hovers.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: this design receives nothing now — **eleven panels name it as advice** — and it turns into nothing itself. Fewer marks than the number draw that many cells, centred; more are held in the list with 3 Grid advised. *Item counts are a number picker*: **Count is a number, 3–6**, six the maximum, the reason at the control, and Large 48 still unavailable at six. *The Remove button never greys out*: there is no minimum to disable at. **No form, no member button, and nothing lost with JavaScript off.**

---

## 2 · Caption Row

A short label in a 196 px column at the left and the logos filling the 1,056 that is left, all on one line. The most common logo wall on the web, and the only design where type and artwork share a horizontal band.

**Descriptor.** The only design where type and artwork share one horizontal band — a 13 px label in a 196 px column with the wall filling the 1,056 beside it — and the only one whose section field is required in practice for the design to exist.

**Structural descriptor.** `bar · none · page · few · right · label column beside wall`

**Archetype.** bar

**Behaviour module.** **none.** Both Label side values, the rule, and the label’s move out of its column at 1080 are CSS with no `order` property and no reorder of the document. **JS off:** identical at every width.

**Items** · `logos[]`, three to five, inside the 1,056.

- **Add.** Lands last, at the right end of the band. **Past the number it is held**, panel reading “5 of 6 drawn”, with 1 Row advised for the whole set.
- **Remove.** Never disabled; two logos draw as two cells in the 1,056 and one as one. **Under three it draws the cells it has and the panel advises 1 Row** — the same advice it gives when no label is authored, from the other side.
- **Reorder.** Meaningful; **the label is a section field and never moves with the list.**
- **Counts.** **Three to five**, cells 336 / 246 / 192. **Count Six is refused by the design rather than by the list** — six cells inside 1,056 is 156 px each — so a sixth logo is held rather than drawn narrower.
- **Zero.** The section does not render. **The eyebrow alone is not a section**, which is the other side of a label column that closes up when no label is authored.
- **Inside an item.** As 1 Row. **A per-logo caption in this design would be 11 Named**, and the label is not an item’s property at either value of Label side.

**Fields** · 1 Row's exactly, three to five items. **`eyebrow` is required in practice** — it is the caption, and with none authored the column and the rule are absent and the wall takes the whole content width.

**Controls** · **Label side: Left · Right.** **Rule: None · Between.** Logo size: Small 28 · Medium 36. Count: **a number picker, 3–5**. Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · a Head control, since the title and sub are drawn when authored; Title size, fixed at Medium 34; Large 48, which beside a 13 px label makes the caption a footnote; Count Six, where six cells inside 1,056 is 156 px each.

**Arrangement** · label 196 · gutter 44 · wall 1,056, cells **336 / 246 / 192** on a 24 px gutter — all whole pixels, which is why the label column is 196 and not 200. **The label is centred on the box's centre line**, not on its own line box and not on a baseline, and is aligned to the outer edge of its column at both sides — never centred in it. The rule is 1 px `border` in the gutter's centre at the box's height, the odd pixel out of the label's side. **The eyebrow moves rather than duplicating: it is never drawn above the title and inline at once.**

**Responsive** · **at 1080 and below the label leaves its column and sits where its document order puts it — above the wall at Label side Left and under the wall at Label side Right** — left-aligned, 20 px clear. **CSS cannot reorder the DOM at a breakpoint**, which is why the two sides no longer draw the same thing here; Rule stops having an effect while staying enabled. A long eyebrow wraps inside its column and the wall does not move.

**Empty** · **no eyebrow → no label column and no rule, and the wall takes the whole content width.** No title → no accessible name.

**a11y** · **the label is a `<p>`, never a heading** — promoting a 13 px caption would put “Featured in” into every document outline; Label side changes DOM order with no `order` property.

**Flagged** · the 196 / 44 / 1,056 division and all three cell widths; the centre-line alignment; the label wrapping rather than truncating; refusing Large 48 and Count Six; the rule's height and odd pixel; the label following its document order at 1080 rather than going above at both sides; refusing to promote the caption to a heading.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover** added, **six of its own**. Quick Controls: **Label side · Count · Logo size · Rule.** Editing: **the eyebrow is the label, and it edits inline in its own column at both Label side values** — and above the wall at 1080, where the column is gone. It is still a `<p>` and still never a heading. Hover: the label does not respond to a mark's hover at either value. **Frames changed:** the control panel, plus a states strip drawing the selected label in its column and above the wall.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: with no label authored the 196 column and the rule are absent and the wall takes the whole 1,296 — **it stays 2 Caption Row**, and 1 Row is advice. *CSS cannot see content*: the label now goes **where its document order puts it** at 1080 — above the wall at Label side Left, under it at Label side Right — because no stylesheet can reorder a document at a breakpoint. *Item counts are a number picker*: **Count is a number, 3–5**. **No form, no member button, and nothing lost with JavaScript off.**

---

## 3 · Grid

Six to eighteen logos in rows of equal cells, with or without a hairline matrix. **The design §8.1 was settled for**, and the only one in A11 that draws more rows than it has counts. **Seven controls — §7.6's ceiling, and the only design in A11 at it.**

**Descriptor.** The only design that draws more rows than it has counts and the only one offering a hairline matrix — the category’s answer to six to eighteen marks, and the design carrying A11’s one forced control value.

**Structural descriptor.** `grid-of-N · none · page · many · inline · optional hairline matrix`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The matrix is `border-left` and `border-top` on the cells, the wrap is the grid’s, and the forced Left last row at Cells Hairlines is a stylesheet rule. **JS off:** identical.

**Items** · `logos[]`, six to eighteen, wrapping in authored order.

- **Add.** Lands last; **the row it lands in is whatever the wrap says** and nothing is re-sorted to accommodate it. At Cells Hairlines the new cell brings its own two hairlines and no outer rule.
- **Remove.** Never disabled; **removing to five draws five cells**, hairlines and all, and the panel advises 1 Row before the edit as well as after.
- **Reorder.** Meaningful; the wrap follows the repeater and the last row is whatever the count leaves. The editor’s counter names the counts that divide.
- **Counts.** **Six to eighteen** is the designed range. Under six it draws the cells it has; over eighteen it draws every mark at its own count per row and its own box. **The panel advises 1 Row below and 13 Dense above, and switches to neither** — the hand-off that used to go up in count is deleted with the rest.
- **Zero.** The section does not render, matrix and all.
- **Inside an item.** As 1 Row. **Cells, Last row and Count are section values**: a cell cannot be given its own hairline, its own padding or its own place in the wrap. At Cells Hairlines Last row is forced to Left — **the one place in A11 a design overrules a control, and it overrules the section’s value, never an item’s.**

**Fields** · 1 Row's, six to eighteen items.

**Controls** · Head: Centred · Flush left · None · Count per row: Four · Five · Six · Logo size: Small 28 · Medium 36 · Large 48, **Large unavailable at Count Six** · **Cells: None · Hairlines** · **Last row: Centred · Left, forced to Left at Cells Hairlines** · Treatment. **Hover: Resolve to colour · None.** **Seven of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Arrangement** · at Cells None, cells 306 / 240 / 196 on a 24 px gutter with rows 40 apart. At Cells Hairlines the gutters close and the columns are **324 / 259 / 216, the odd pixel in the last column at Count Five**; cell padding 24; hairlines on the shared edges as `border-left` and `border-top`, **the odd pixel to the cell below and right — A10·3's rule verbatim**; no outer rule, since a frame around the wall is 4 Boxed. **The wrap is authored order and nothing is re-sorted** — not by width, not by class, not to fill the last row.

**Responsive** · six → four at 1080 → three at 834 → two at ≤ 767; hairline columns 251 at 834 and 175 at 390; the matrix follows the grid at every width.

**Empty** · **under six → the cells that exist; over eighteen → all of them at this design’s own count.** 1 Row and 13 Dense are advised and neither is substituted. A last row of one is drawn and the counter names the counts that divide.

**a11y** · a `<ul>` on a CSS grid, **never a `<table>` and never marked up as rows** — one flat list of twelve items; hairlines decorative `border`; focus on the box at Cells None and on the matrix cell at Hairlines.

**Flagged** · the 40 px row gap; centring the short last row and **forcing it Left at Cells Hairlines — A11's one forced control value**; the 24 px cell padding; the odd pixel at Count Five; refusing to re-sort; the six-and-eighteen designed range; the hover surface filling the matrix cell; taking the seventh control.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover** added, **seven of its own** — the count is unchanged, and **the “§7.6's ceiling, and the only design in A11 at it” framing is lifted**: the budget is the PRD's ~15 visible controls plus the universal trio and the Data group, and 8 Marquee is now a seven as well. Quick Controls: **Count per row · Cells · Logo size · Last row.** Hover: at Cells Hairlines the surface fills the matrix cell and the resolve is still the artwork's. **Frames changed:** the control panel and the design's own eyebrow.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: under six it draws the cells it has, hairlines and all, and over eighteen it draws every mark at its own count and box — **1 Row and 13 Dense are advice**, including the hand-off that used to go up in count. *Item counts are a number picker*: **Count per row stays a named-value row**, because it divides a row into columns; the count of marks is the list's own, capped at twenty-four *(flagged: the reading is mine)*. **No form, no member button, and nothing lost with JavaScript off.**

---

## 4 · Boxed

The whole wall inside one `surface` panel with a hairline and the pack's radius. For a page whose ground is already carrying something, where contained artwork floating on that ground reads as debris. **The design where the radius token finally has somewhere to land.**

**Descriptor.** The only design that puts the whole wall inside one `surface` panel with a hairline and the pack radius — the section’s own container rather than the item’s — and the only one whose inner padding is a control.

**Structural descriptor.** `grid-of-N · box · surface · many · inline · one panel around wall`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The panel is a presentational `<div>` with a fill, a 1 px border and a radius; the head, note and link sit outside it in the DOM. **JS off:** identical.

**Items** · `logos[]`, four to twelve, inside the panel.

- **Add.** Lands last, inside the panel; **the panel grows by a row rather than the wall spilling out of it**, and its width is the content width at every count.
- **Remove.** Never disabled. **Removing to three draws the panel around three marks**, and the panel advises 1 Row, because a container around three marks is a container with room to spare — stated of the design and true of the list.
- **Reorder.** Meaningful; authored order, with a short last row centred at 1440 and left-aligned at 834 and below.
- **Counts.** **Four to twelve**, four to six per row. Under four the panel is drawn around what exists; over twelve it grows by a row. 1 Row and 3 Grid are advised. The range is about the wall’s density rather than the panel’s size.
- **Zero.** **The section does not render, panel and all** — an empty panel is the one thing this design must not draw.
- **Inside an item.** As 1 Row. **Panel padding writes onto the section, not onto a cell**: there is no per-logo inset and a cell cannot opt out of the panel.

**Fields** · 1 Row's, four to twelve items.

**Controls** · Head: Centred · Flush left · None · **Panel padding: Compact 32 · Comfortable 48 · Spacious 64** (28 · 40 · 52 at 834, 20 · 28 · 36 at 390) · Count per row: Four · Five · Six · Logo size: Small 28 · Medium 36 · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Title size, fixed at Medium 34; Large 48, since the panel is already 96 px of inset at Comfortable; **a Ground value for the panel**, because a panel filled with the section's own ground is 3 Grid at Cells None; a shadow at any value; a head inside the panel, which makes it a card; a link on the panel; hairlines inside it.

**Arrangement** · panel 1,296 wide, `surface` fill, 1 px `border`, pack radius, **no shadow**; inner wall 1,232 / 1,200 / 1,168 by panel padding; cells 290 / 282 / 274 at four, 226 / 220 / 214 at five, 180 / 180 / 174 at six on a 24 px gutter, **the odd pixel to the last cell**; rows 40 apart; head, note and link outside the panel. **Compact 32 is set by the focus ring's clearance**, not by the spacing scale.

**Responsive** · the panel is always the content width and always keeps its hairline and radius, down to a 350 px panel with 20 px of inset. **A short last row is centred at 1440 and left-aligned at 834 and below.**

**Empty** · **under four → the panel around the marks that exist**, with 1 Row advised. Over twelve → the panel grows by a row, with 3 Grid advised. No logos → the section does not render, panel and all.

**a11y** · **the panel is a presentational `<div>`: no role, no label, no `tabindex`, not a `<figure>`, not a nested `<section>`**, so the announcement is identical to 1 Row's; the head outside it in the DOM; forced colours keep the border and lose the fill.

**Flagged** · the panel padding scale; Compact 32 set by the ring; the odd pixel to the last cell; refusing Ground, a shadow, Large 48, a head inside and a link on the panel; the panel lifting one step in dark; the short row's two behaviours.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**, **Panel padding keeping its row** because it measures the panel and not the section; **Hover** added, **six of its own**. Quick Controls: **Count per row · Panel padding · Logo size · Head.** Top divider draws above the section, never around the panel. Hover: the panel does not respond — the resolve is the mark's, and the fill and hairline are unchanged. **Frames changed:** the control panel.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: under four the panel is drawn around the marks that exist and over twelve it grows by a row, with 1 Row and 3 Grid advised. The panel is still never drawn empty, because at zero marks the section does not render at all. *Item counts are a number picker*: **Count per row stays a named-value row** — it divides a row into columns. **No form, no member button, and nothing lost with JavaScript off.**

---

## 5 · Cards

One logo per card, every card the same height. **The design that answers §8.4's harder half**: in the other fourteen a linked logo's target is the artwork's own box — about 4,800 px² for a wordmark — and here it is the card, 306 × 112 on a desktop and 135 × 88 on a phone. **It clarifies the target, not the link**: a linked card and an unlinked one still look identical at rest.

**Descriptor.** The only design that gives each logo a card of its own — the item’s geometry rather than the section’s — which is what makes a linked mark’s target the card instead of the artwork.

**Structural descriptor.** `grid-of-N · none · page · variable · inline · one card per logo`

**Archetype.** grid-of-N

**Behaviour module.** **none**, and this is the design most likely to be assumed to have one. The card, its fill, its hairline and the `<a>` on the card’s box are markup and CSS: no click handler on a div, no overlay, no script anywhere. **JS off:** identical, links included.

**Items** · `logos[]`, three to twelve, one card each.

- **Add.** Lands last as a new card. **A card is never drawn empty and the count never reserves one**, so the placeholder tile sits inside a real card in the editor and that card is not published until a file is placed.
- **Remove.** Never disabled; the row closes up and **no card is left holding a gap**. Under three it draws the cards that exist, with 1 Row advised.
- **Reorder.** Meaningful; cards wrap in authored order and a short last row is left-aligned at every width, because cards have edges and a centred pair misaligns visibly.
- **Counts.** **Three to twelve** — a range that spans few and many, which is why the count class is `variable`: the design is chosen for its target rather than for its density. Over twelve it draws more rows of cards, with 3 Grid advised.
- **Zero.** The section does not render; no empty card at any count.
- **Inside an item.** `logo`, `logoDark`, `alt`, `url` — and **`url` matters more here than anywhere else**: with one authored the whole card becomes the `<a>`, with none the card is not focusable and takes no `tabindex`. **Card height and Cards are section values**, so “make card three taller” — the brief’s own example, and this is the design that would seem to need it — is not expressible; a site that needs one mark louder than the rest is choosing 12 Tiers. In dark, an item with no `logoDark` **turns its card into the plate**, which is a section-level treatment applied per item by the file that is missing, not by a control.

**Fields** · 1 Row's, three to twelve items. **This is the design to choose when the logos are links**, and the editor says so when two or more URLs are authored elsewhere.

**Controls** · Head: Centred · Flush left · None · Count per row: Three · Four · Five · Six · **Card height: Compact 88 · Comfortable 112 · Spacious 136** (80 · 100 · 120 at 834, 72 · 88 · 104 at 390) · **Cards: Surface · Ground** · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Title size, fixed at Medium 34; **Logo size — the box is Medium 36 at Count Three and Four and Small 28 at Five and Six**, because a card is a fixed frame and the artwork's size in it is the design's; a shadow; a lift or scale on hover; a caption inside the card, which is 11 Named's.

**Arrangement** · 1 Row's cells with a card at each, **rows 24 apart rather than 40**, because 40 px between two hairlines reads as a gap in a table; card `surface` or ground fill, 1 px `border`, pack radius, no shadow at either value; the logo centred on both axes. **Both card values keep the hairline** — a card with no edge and no fill is 1 Row.

**Responsive** · six → four at 1080 → three at 834 → two at ≤ 767; **a short last row is left-aligned at every width**, this design's one departure from settlement 1, because cards have edges and a centred pair misaligns visibly.

**Empty** · **a card is never drawn empty and the count never reserves one.** Under three → the cards that exist; over twelve → more rows of them. 1 Row and 3 Grid are advised, never substituted.

**a11y** · **a linked card is `<li><a><img alt></a></li>` with the card's box as the `<a>`** — no click handler on a div, no overlay, no nested link, no title attribute; an unlinked card is not focusable and takes no `tabindex`; targets past 44 px in both axes at every value. **In dark, a logo with no dark file does not get a plate inside its card — the card becomes the plate**, taking the light-mode `surface` and dropping its hairline, keeping its width, height and radius.

**Flagged** · the 24 px row gap; the card height scale; dropping Logo size and tying the box to the count; refusing a shadow, a lift and a scale; **the card becoming the plate**; the short row left-aligned at every width; the identical resting states.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**, **Card height keeping its row**; **Hover** added, **six of its own**. Quick Controls: **Count per row · Card height · Cards · Treatment.** Hover: the card is the target, so a linked card takes the surface and its mark resolves with it, and **an unlinked card now resolves its mark while keeping its own fill** — the change is most visible in this design, and the resting states are still identical. **Frames changed:** the control panel.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: under three it draws the cards that exist and over twelve more rows of them, with 1 Row and 3 Grid advised; a card is still never drawn empty. *Item counts are a number picker*: **Count per row stays a named-value row**. **No form, no member button, and nothing lost with JavaScript off** — the card's `<a>` is markup, not a click handler.

---

## 6 · Split Head

Head, sub, note and link in a 416 column at one side; the wall in the 824 at the other. **A8·6's split and A10·6's division, carried forward verbatim.**

**Descriptor.** The only design that sets the head, sub, note and link in a column beside the wall rather than above it, and — until the design patch pass — the only one whose foot left that column at 1080; it no longer does, because no stylesheet can reorder a document at a breakpoint.

**Structural descriptor.** `split · none · page · many · right · head column beside wall`

**Archetype.** split

**Behaviour module.** **none.** The 1080 change is a media query on a flex row and **is no longer a reorder at all**: the document order is one order at every width. The head is never sticky. **JS off:** identical at every width.

**Items** · `logos[]`, four to twelve, inside the 824 block.

- **Add.** Lands last in the block. **The block’s width never changes with the count**, so a new item changes the wrap and nothing else.
- **Remove.** Never disabled; **removing to three draws the wrap it has** and the panel advises 1 Row. Removing every item empties the list.
- **Reorder.** Meaningful; the wrap is authored order and a short last row sits at the left of the block.
- **Counts.** **Four to twelve**, two to four per row. Below four it draws the wrap it has and 1 Row is advised; above twelve the first twelve are drawn and the rest held, 3 Grid advised. *Flagged: stated here from the shared floor’s pattern — the drawn panel gives the range only.*
- **Zero.** The section does not render. **With no title the head column draws empty and the section takes no accessible name** — the design still renders, and the 824 block does not move.
- **Inside an item.** As 1 Row. **Head column, Title size and Count are section values**; the head is not an item and never enters the repeater, at either side.

**Fields** · 1 Row's, four to twelve items. **`title` is required in practice** — with none authored the head column draws empty and the section takes no accessible name. **This is the design for a long `sub`**: the head column absorbs 178 characters without moving the wall.

**Controls** · **Head column: Left · Right** · **Title size: Medium 34 · Large 40** · Count per row: Two · Three · Four · Logo size: Small 28 · Medium 36 · Large 48, **Large unavailable at Count Four** · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Head alignment, because the column is always left-aligned inside itself; Head None; Display 48, which is 15 Big Type's; a sticky head; a rule between the columns.

**Arrangement** · **416 · 56 · 824 = 1,296**, with cells 400 at two and 188 at four on a 24 px gutter, and **258 on a 25 px gutter at three — the one gutter in A11 that is not 24**, a whole pixel rather than a fraction across three cells. **The block's width never changes with the count.** Both columns top-aligned, **the taller setting the height, the head never sticky, never vertically centred and never stretched**. The note and link at the foot of the head column, 24 px under the sub. A short last row at the left of the block.

**Responsive** · **the head column becomes a full-width block above the wall at 1080, with the note and the link still in its foot.** **There is one document order at every width** — title, sub, note, link, wall — because CSS cannot reorder the DOM at a breakpoint; the old rule, which moved the foot under the wall below 1080, is withdrawn. Head column then stops having an effect and stays enabled.

**Empty** · **no title → an empty head column and no accessible name.** No sub → the foot sits 24 px under the title. No note or link → the head column closes up and the wall sets the height.

**a11y** · a flex row, neither column a landmark; Head column changes DOM order with no `order` property; **with no title the section takes no accessible name**, which is the same outcome as Head None elsewhere in A11.

**Flagged** · **the 25 px gutter at Count Three**; the foot living in the head column and staying there at every width; the column left-aligned at both sides; offering Large 40 and refusing Display 48; refusing a sticky head, a rule and Head None; the short row at the left; the dark plate taking the treatment's opacity.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover** added, **six of its own**. Quick Controls: **Head column · Count per row · Logo size · Title size.** Editing: the head column's four fields edit in place at either side, and **the note and the link stay editable after they move under the wall at 1080**. Hover: the head column does not respond at either side. **Frames changed:** the control panel.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: with no title the head column draws whatever head fields exist — nothing at all when none is authored — the 824 block does not move, and the section takes no accessible name. *CSS cannot see content*: **the 1080 reorder is withdrawn.** There is one document order at every width — title, sub, note, link, wall — and at 1080 the head becomes a full-width block above the wall **with its foot still in it** *(flagged: the replacement is mine)*. **No form, no member button, and nothing lost with JavaScript off.**

---

## 7 · Contrast Band

1 Row inverted onto the `contrast` token. **It produced the category's sharpest finding, and it amends settlement 3: `logoDark` is not a dark-mode file, it is a dark-ground file.** This band reads it *in light mode*, where the ground is `#232019` — and in dark mode, where Paper's contrast is a pale `#EDE7DA`, it reads the light file instead. **The band always wants the opposite file from the mode it is in**, and a site that never turns dark mode on still needs the second upload here.

**Descriptor.** The only design on the `contrast` token, and the only one in the library that reads the dark-ground file in light mode and the light file in dark — the same wall as 1 Row, separated by its ground alone.

**Structural descriptor.** `grid-of-N · none · contrast · few · inline · inverted ground, dark file`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The band is a `background-color` on the section, the derived mixes are CSS, and **the inverted `<picture>` query is HTML** — so the inversion survives with JavaScript off for the same reason the registry’s `mode-toggle` degrades to Auto (FR-E4): `prefers-color-scheme` in a `<source media>` is the browser’s own. **JS off:** identical, in both modes.

**Items** · `logos[]`, three to twelve, on the band.

- **Add.** Lands last. **The editor’s wording differs in this design alone**: the second file is asked for as “this band needs the version for a dark background, which your site will use in light mode too”, and the placeholder tile is drawn on the band rather than on the page.
- **Remove.** Never disabled; the band closes up around what is left. Under three the band draws the marks that exist, with 1 Row advised — it is this design without its ground, which is exactly why it is advice and not a switch.
- **Reorder.** Meaningful; 1 Row’s wrap on the band.
- **Counts.** **Three to twelve**, three to six per row; Large 48 is not offered, because a band is a short section by construction.
- **Zero.** **The section does not render, band and all** — a band with no marks in it is 88 px of colour.
- **Inside an item.** `logo`, `logoDark`, `alt`, `url`, with **`logoDark` effectively required rather than optional here.** An item without it is drawn on the light plate **in light mode** and needs no plate in dark — the one asymmetry in the category, and the one place an optional field’s emptiness decides which mode is the hard one.

**Fields** · 1 Row's, three to twelve items. **`logoDark` is effectively required**, and the editor's wording differs in this design alone: “this band needs the version for a dark background, which your site will use in light mode too”.

**Controls** · **Band width: Full bleed · Inset** · Head: Centred · Flush left · None · Count: Three · Four · Five · Six · Logo size: Small 28 · Medium 36 · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, **Background role locked to Contrast with the reason shown**, and Vertical spacing resolving 44 · 64 · 88 here — with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Derived from one token pair** · muted = the carried colour at 72% (`#BEBCB7` light, `#57544D` dark); hairline = 18%, never drawn; **hover surface = 10%** (`#3A362F` / `#D4CFC3`), because the pack supplies a hover surface for a ground and a surface but not for a band; **Muted treatment = 70% in both modes**, since the band's lightness does not follow the mode's. **The accent is unavailable at 2.3:1 and links and rings take the carried colour.** No shadow at any value.

**Arrangement** · 1 Row's cells at Full bleed; **274 at four and 214 at five at Inset**, where the band's 64 px of horizontal padding comes out of the 1,296 leaving an inner 1,168. The horizontal inset steps 64 · 40 · 20 with the width. Logo size Large 48 is not offered — a band is a short section by construction.

**Responsive** · 1 Row's rule plus the band's own padding step. At Full bleed the band keeps the page margins for its content and loses them for its ground; at Inset it keeps the content width and the radius at every breakpoint.

**Empty** · as 1 Row. **A logo with no `logoDark` is drawn on the plate in light mode and needs none in dark**, so the band can never need a plate in dark — the one asymmetry in the category.

**a11y** · the band is a `background-color` on the section rather than a wrapper, so switching to 1 Row changes nothing announced; **the `<picture>` media query is inverted in this design only**, with the alt on the single `<img>` underneath so the announcement is identical in both modes. Title 15.5:1 / 14.8:1; muted 8.6:1 light and 6.1:1 dark. Forced colours drop the band; **print drops the band and draws the light files.**

**Flagged** · **reading `logoDark` in light mode and `logo` in dark**; the derived hover surface at 10%; Muted at 70% in both modes; the Inset cell widths; refusing Large 48; the inverted `<picture>` query; the editor's different wording; print changing which file is drawn.

**Reconciled · controls pass, 24 August 2026.** Controls: **Band padding retired into Vertical spacing, which resolves 44 · 64 · 88 here** — the argument survives, the second row does not, because the band is the section — and **Background role is locked to Contrast with the reason shown: this band decides which uploaded file is drawn, so its ground is not a colour choice.** **Hover** added, **six of its own**. Quick Controls: **Band width · Count · Logo size · Treatment.** Top divider draws above the band at Full bleed and above the panel at Inset. Hover: the resolve is to the file the band draws — the dark-ground file in light mode — and the surface is the derived 10% mix. **Frames changed:** the control panel.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*, and here the rule earns more than tidiness: under three the band draws the marks that exist and over twelve it wraps, because **the ground decides which uploaded file a visitor is shown** — a switch would change the picture, not the layout. 1 Row and 3 Grid are advice. *Item counts are a number picker*: **Count stays a named-value row**, the wall wrapping inside the band. **No form, no member button, and nothing lost with JavaScript off** — the inverted `<picture>` query is the browser's own.

---

## 8 · Marquee

Eight to twenty-four logos on a track that runs continuously in one or two rows. **The category's one behaviour and its only motion**, and **the one design in A11 with no cell grid at all** — a track has no columns, so logos sit at natural width on a fixed gap and only their heights are normalised.

**Descriptor.** The only design that moves without being touched — a full-bleed track in one or two rows, with a pause button that cannot be turned off, no cell grid and no pause on hover.

**Structural descriptor.** `bar · none · page · many · full-bleed · continuously moving track`

**Archetype.** bar

**Behaviour module.** `marquee`. Edit-safe — **the track is parked at its start while the section is being edited**, which is why its frames are drawn stationary. **JS off:** “The track renders as a static row, horizontally scrollable via `overflow-x: auto`; nothing moves.” What the module supplies is the duplicate track, the translation, the seam reset and the pause button; the fade mask, the 64 px gap, the row split and the reduced-motion hand-off are CSS. **The pause button is hidden with JavaScript off and 2.2.2 is still met, because nothing is moving** — the requirement exists only while something does. **Reduced motion and no-JS draw the same thing**: a track that does not move. Reduced motion is a media query and holds with or without script; the registry’s no-JS state is the same stationary, natively scrollable row — so a reader with both gets one drawing and there is no precedence to state. *Flagged: replacing the old hand-off with a stationary track is mine.*

**Items** · `logos[]`, eight to twenty-four, on the track.

- **Add.** Lands last — **the end of the authored list, not the end of what is on screen.** The duplicate copies are regenerated around it and the seam stays one ordinary gap. At Rows Two the split is recomputed in authored order, so **one added item can move the row break.**
- **Remove.** Never disabled. **Removing to seven keeps the track running**, and the panel advises 1 Row with the mechanical reason drawn at it: a shorter list needs three copies to fill 1440, so the same mark can be on screen twice at once.
- **Reorder.** Meaningful, and **it decides the row split at Rows Two** — the set is divided in authored order, not interleaved and not balanced by width.
- **Counts.** **Eight to twenty-four.** Under eight the track runs with what exists, 1 Row advised; over twenty-four the first 24 are drawn, stated. **At reduced motion the track stands still and the design stays itself**, with the list unchanged.
- **Zero.** The section does not render, track and pause button included.
- **Inside an item.** `logo`, `logoDark`, `alt`, `url` — **URLs are allowed, advised against, and the panel says why: the target moves.** **The duplicate copies are not items**: `aria-hidden` with empty alts, they cannot be selected, edited or removed, and they are the one correct `alt=""` in A11. Speed, Edge, Rows and the box size are section values; a mark cannot be given its own speed, its own gap or its own row.

**Fields** · 1 Row's, eight to twenty-four items. **Eight is the floor because a shorter list needs three copies to fill 1440 and the same mark appears twice on screen.** URLs are allowed and advised against, and the panel says why: the target moves.

**Controls** · Head: Centred · Flush left · None · **Rows: One · Two** · **Speed: Slow · Steady · Brisk** · **Gap: Tight 40 · Normal 64 · Loose 96** (32 · 56 · 80 at 834, 24 · 40 · 56 at 390) · **Edge: Fade · Hard** · Treatment. **Hover: Resolve to colour · None.** **Seven of its own**, and the pause button is still not one of them; with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Title size, fixed at Medium 34; **Logo size — Medium 36 at Rows One and Small 28 at Rows Two**; Count, because a track has no cells; a direction control; **pause on hover**; a control to remove the pause button; a gradient overlay instead of a mask.

**Arrangement** · full-bleed track, content starting on the page margin, **logos at natural width on a fixed gap of 64 · 56 · 40**; row gap 32 at Rows Two; fade 96 · 72 · 48. **The behaviour:** the list rendered twice — three times when narrower than the viewport — the copies `aria-hidden` with empty alts, translated by the list's own width and reset with no easing, so the seam is one ordinary gap. **20 · 32 · 48 px per second, linear, constant at every width**, so a narrower window loops sooner — stated, not corrected. **Focus pauses the track; hover does not.** At Rows Two the set is split in authored order, not interleaved and not balanced by width, and one button stops both rows.

**Responsive** · **Rows Two becomes Rows One at 1080 and below**, the control staying enabled. The pause button sits on the right page margin above 767 and under the track on the left margin below it, keeping its 38 px box.

**Empty** · under eight → the track with what exists, 1 Row advised. Over twenty-four → the first 24, stated. **At reduced motion → the same track, stationary**, natively scrollable, with no duplicate copy and no button.

**a11y** · **2.2.2 is met by a `<button aria-pressed>` that cannot be turned off**, named “Pause the logo wall” / “Play the logo wall”, 38 px in a 44 px target, **first after the heading in the DOM** so a keyboard reader meets the control before the moving content. **Hover is not that mechanism** — it does not exist for a keyboard or touch reader. 2.3.3 is met by a track that does not move, which is also what satisfies 2.2.2 there. **The duplicate copies' empty alts are the one correct `alt=""` in A11.** Print draws the wrapped wall.

**Flagged** · the 64 px gap; the track starting on the page margin; **the pause button, its position, and its exemption from the treatment**; the three named speeds and their pixel rates; the constant speed across widths; the 96 px mask; the copy count and the eight-logo floor; splitting in authored order; one button for two rows; **standing the track still under reduced motion**; focus pausing and hover not.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Gap: Tight 40 · Comfortable 64 · Wide 96 added — 9 Rail's ladder**, stepping 32 · 56 · 80 at 834 and 24 · 40 · 56 at 390, because the two track designs are siblings and eight wide wordmarks are the first thing that asks for it; **Hover** added. **Seven of its own, and the pause button is still not one of them.** Quick Controls: **Rows · Speed · Gap · Edge.** **Comfortable 64 resolves to the 64 · 56 · 40 the frames were already drawn at**, so no drawn frame changed value, and the seam is one ordinary gap at every value. Strings: **the two button names become theme catalog strings** — “Pause the logo wall” · “Play the logo wall” — the names themselves unchanged. **No pause on hover and no control to remove the button, both unchanged**, and a mark's hover resolve never stops the track. **Frames changed:** the control panel, plus a states strip drawing the three gaps and the button at both names.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: **reduced motion no longer draws 3 Grid.** The track stands still — a static full-bleed row, natively scrollable, the fade or hard edge as authored, and **no pause button, because nothing is moving** — which is the same drawing JavaScript-off gets, so the old precedence between the two off-switches is gone. **2.2.2 and 2.3.3 are both met by a track that does not move.** Under eight the track runs with what exists and the panel advises 1 Row, naming the doubled mark. *Gap names are Tight · Normal · Loose*: **Gap reads Tight 40 · Normal 64 · Loose 96**, values unchanged; **Speed keeps Slow · Steady · Brisk**, its title saying what it affects and the library having no standard three words for speed *(recorded rather than renamed)*. **No form and no member button.** *Flagged: the stationary track is mine.*

---

## 9 · Rail

One line of logos wider than the window, scrolled by the reader. **The distinction from 8 Marquee is the whole design: a marquee moves whether anyone is watching, and a rail moves only when a hand causes it.** The one design in A11 with a precondition, and **the one that always spends the accent**, on its arrows' hover and focus.

**Descriptor.** The only design the reader moves — a track wider than the window, scrolled by hand — and the only one whose furniture — its arrows and its fade — is decided by a measurement at render rather than by what was authored.

**Structural descriptor.** `carousel · none · page · variable · full-bleed · reader-scrolled track with arrows`

**Archetype.** carousel

**Behaviour module.** `carousel`, **named as the closest module in the registry rather than as a description of this design.** Edit-safe; the position is never persisted or restored. **JS off:** “The slide track is a native horizontally-scrollable `scroll-snap` strip — **fully usable**, only dots and arrow buttons are hidden.” Two mismatches, both stated at the head of this document and landing here: **this design refuses scroll snapping** — a snap point has to be a logo’s edge, and a 216 px wordmark and a 26 px mark cannot share one — so the no-JS drawing is that strip *without* the snap; and **the measurement now decides furniture rather than design**: where the track fits its container the arrows and the fade are not drawn, and the section is still a rail. With JavaScript off there are no arrows and no fade at any width, which is the same drawing arrived at from the other side. There is no reduced-motion hand-off, because the motion is the reader’s own and `smooth` becomes `auto`.

**Items** · `logos[]`, six to twenty-four, at natural width on the chosen gap.

- **Add.** Lands last, at the right end of the track — **outside the window, and the rail does not scroll to show it**; the repeater’s row is what confirms the addition. Adding is also the one edit that gives the section its furniture: past the width where the track overflows, the arrows and the fade appear.
- **Remove.** Never disabled. **Removing until the track fits drops the arrows and the fade at that width and keeps them at narrower ones** — the same list, one design, two states, decided by the window.
- **Reorder.** Meaningful; the track is authored order, and the first logo lines up with the title because the page margin is the track’s padding.
- **Counts.** **Six to twenty-four**, and the count class is `variable` because **the design has no designed count**: a track absorbs any number and what the width decides is furniture, not a total. Everything fits → the same rail with no arrows and no fade; 1 Row is advice.
- **Zero.** The section does not render — track, arrows and the “Logo wall, scrollable” name included.
- **Inside an item.** As 1 Row. **Gap, Arrows and Logo size are section values**: a logo cannot be given its own gap, pinned to an end, or made a snap point — and there are no per-item snap points because there are none at all.

**Fields** · 1 Row's, six to twenty-four items. **The arrows and the fade are decided at render, not counted**: where the track is not wider than its container, neither is drawn — so the same list scrolls at 834 and sits still at 1440, **and it is a rail at both.**

**Controls** · Head: Centred · Flush left · None · Logo size: Small 28 · Medium 36 · Large 48, **no condition on Large** · **Gap: Tight 40 · Normal 64 · Loose 96** (32 · 56 · 80 at 834, 24 · 40 · 56 at 390) · **Arrows: At the ends · Above the rail** · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, and the arrows are still not one of them; with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Title size; Count, because a rail has no cells; **scroll snapping**, since a snap point has to be a logo's edge and a 216 px wordmark and a 26 px mark cannot share one; a dot or page indicator; a drag cursor; auto-advance, which is 8 Marquee; removing the arrows above 767.

**Arrangement** · full-bleed track with **the page margin as padding at both ends**, so the first and last logo line up with the title and the last never stops against the window; logos at natural width on the chosen gap; a 96 · 72 · 48 px mask **at an overflowing end only**, so the fade is the affordance and the arrows the mechanism. Arrows 38 px `surface` icon buttons on the page margins over the fade, or a pair 16 px above the track at Above the rail. **One press is the viewport minus 96 px**, so the leading logo is still on screen after it. **Position is never persisted or restored.**

**Responsive** · **at ≤ 767 the arrows are dropped and the rail is scrolled by touch**, Arrows staying enabled with no effect; the track keeps `tabindex="0"` at every width.

**Empty** · **everything fits → the same rail with no arrows and no fade**, and the panel advises 1 Row.

**a11y** · **the track is a `role="group"` with `tabindex="0"` and a name from the title** — 2.1.1, whatever the buttons do — and with no title the name is the generated “Logo wall, scrollable”, the one generated string in A11. The arrows are `<button>`s named “Scroll left” / “Scroll right” with **`aria-disabled` rather than `disabled`**, drawn at 40%, so the pair never changes width and focus is never dropped. **No hand-off under reduced motion — the motion is the reader's own**; `smooth` becomes `auto`. A linked logo is an ordinary link and tabbing scrolls it into view, so unlike 8 Marquee there is nothing to chase. Glyph 15.8:1 / 15.1:1 resting, **accent at 3.3:1 / 6.3:1 on hover and focus**, disabled at 4.1:1 / 3.9:1.

**Flagged** · the viewport-minus-96 press; the page margin as tail padding; the fade at an overflowing end only; **refusing scroll snap**; the generated name; `aria-disabled` at 40%; dropping the arrows below 767; never persisting the position; Large 48 unconditional; **the measured furniture and its window-dependent arrows.**

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover** added, **six of its own, and the arrows are still not one of them**. Quick Controls: **Gap · Logo size · Arrows · Treatment.** Strings: **three theme catalog strings** — “Logo wall, scrollable” · “Scroll left” · “Scroll right”; the words are unchanged and “generated” was the wrong description, since they are theme-supplied rather than composed at runtime. **ARCHITECT: registry addition**, now on the frame as well as in this document: **no registry module scrolls without snapping and none measures**, which is what this design's refusal and its precondition need. The no-JS state is designed anyway — a natural-width row with the page margin as padding at both ends, natively scrollable, arrows and fade absent — and **no module name is coined**. **Frames changed:** the control panel, plus a states strip drawing the arrows, the group's name and the architect note.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: **the rail stays a rail.** Where the track already fits its container there is nothing to scroll, so **no arrows and no fade are drawn** — the measurement decides furniture, not which design renders — and the panel may advise “at this count, 1 Row reads better”. *Gap names are Tight · Normal · Loose*: **Gap reads Tight 40 · Normal 64 · Loose 96**, values unchanged. The **ARCHITECT: registry addition** stands: no registry module scrolls without snapping, and none measures; the no-JavaScript state is designed anyway — a natively scrollable row with the page margin as padding at both ends, arrows and fade absent — and **no module name is coined**. **No form and no member button.**

---

## 10 · Slim

A band 92 to 148 px tall with no head, no note and no link: three to six marks and nothing else. What sits directly under a hero or above a footer. **The one design in A11 with no type in it at all.**

**Descriptor.** The only design with no type in it at all — a 92 to 148 px band of three to six marks with no head, note, link or accessible name, keeping ten of the fourteen fields and drawing none of them.

**Structural descriptor.** `bar · none · page · few · inline · band with no type`

**Archetype.** bar

**Behaviour module.** **none.** The band, its rules, the spread and the two-across collapse at ≤ 767 are CSS. **JS off:** identical — and with no URLs authored there is nothing focusable, nothing stateful and nothing scripted in the whole section.

**Items** · `logos[]`, three to six, and **the item list is the entire section.**

- **Add.** Lands last, in the band. **Past six the item is held and the band never wraps** — the panel reads “6 of 8 drawn” and advises 1 Row for the whole set.
- **Remove.** Never disabled; **the band redistributes rather than reflowing** — at Spread the gaps change and the height does not. Under three the band draws the marks that exist, with 1 Row advised.
- **Reorder.** Meaningful, and **it is the only editorial decision this design offers**: with no captions, no labels and no head, order is the whole of what the section says.
- **Counts.** **Three to six, one row, never two.** Under three → the band with what exists, 1 Row advised; over six → the first six, stated.
- **Zero.** **The section does not render, and nothing survives it**: with ten fields kept and never drawn, the item list is literally the whole section — the only design in A11 where that is true.
- **Inside an item.** `logo`, `logoDark`, `alt`, `url`. **`alt` carries more weight here than anywhere else in the category**: with no title, note or link, the brand names are the section’s entire content for a screen reader, which is A11’s strongest case for requiring it.

**Fields** · three to six items reading `logo`, `logoDark`, `alt`, `url`, **and nothing else in the whole section**. **Ten of the fourteen fields are kept and not drawn**: `eyebrow`, `title`, `sub`, `note`, `linkLabel`, `linkUrl`, `lede`, `leadLabel`, `restLabel`, `caption`. The panel names the count and says how many 1 Row would draw.

**Controls** · Alignment: Spread · Left · Centred · Count: **a number picker, 3–6** · Logo size: Small 28 · Medium 36 · **Rule: None · Above · Both** · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, Vertical spacing resolving 32 · 44 · 56 the same at every width, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · a head at any value; a note; a link; a caption; Large 48, since a 48 px box in a 32 px padding is a 112 px band; a surface panel; a ground of its own; **a second row.**

**Arrangement** · **no cell grid** — logos at natural width, `space-between` at Spread and a fixed 64 px gap at Left and Centred. **Spread's gaps are unequal by construction and that is the design**: equal gaps with unequal artwork is what a cell grid is for, and 1 Row is the cell grid. The rule is a 1 px `border` at the content width **inside the page margins**, never inset further, never the accent. **Band height 92 at Small/Compact, 124 at Medium/Comfortable, 148 at Medium/Spacious with two rules.**

**Responsive** · the padding does not step; the box does. **At ≤ 767 the band becomes two across at 163 on a 24 px gutter and Alignment has no effect while staying enabled.** At 834 Spread still holds at five, the gaps redistributing rather than scaling. **The design's contract is lost on a phone and the panel says so: five marks stack to about 190 px.** The only design in A11 whose defining property is lost at a breakpoint rather than adjusted.

**Empty** · there is nothing optional to be empty. Under three → the band with what exists, 1 Row advised. **Over six → the first six, stated; the band never wraps.**

**a11y** · **no `<h2>`, no `aria-label` and no landmark name at any setting** — A9·13's and A10·13's position taken a third time; the rule a `border` and never an `<hr>`; **no tab stop, no state, no behaviour and no accent pixel with no URLs authored.** With no title, note or link, **the brand names are the section's entire content for a screen reader**, which is the strongest case in the category for alt being required.

**Flagged** · the three band heights; **the padding not stepping with width**; the unequal gaps at Spread; the rule keeping the page margins; Above as the default; refusing Large 48, a head and a second row; naming the count of undrawn fields; **the contract lost at ≤ 767 and stated rather than adjusted.**

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing, which resolves 32 · 44 · 56 the same at every width** — the band's three heights follow it — and the design's own **Rule** is a different rule and keeps its row, both being drawable at once. **Hover** added, **six of its own**. Quick Controls: **Alignment · Count · Logo size · Rule.** Editing: **there is no text in this design to edit inline** — ten fields are authored and none is drawn, so the P0·1 toolbar never appears here and the sidebar is the only editor. Hover: **with no URLs authored this is the only hover the section can have**, which is why the control matters more here than anywhere else in A11. **Frames changed:** the control panel.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: under three the band draws the marks that exist and over six the seventh is held, with 1 Row advised; at ≤ 767 the band's contract is still stated as lost rather than adjusted. *Item counts are a number picker*: **Count is a number, 3–6**, six the maximum because the band never wraps. *The Remove button never greys out.* **No form, no member button, no text, and nothing lost with JavaScript off.**

---

## 11 · Named

A caption under each logo. **The only design in A11 that draws `caption`**, and the answer to what a caption is for: not the mark's name, which the artwork already says, but **what that name did**. It carries **A11's one equalisation.**

**Descriptor.** The only design that draws a caption under each mark — equalised to the tallest caption in its row rather than in the wall — and so the only one whose item holds type as well as artwork.

**Structural descriptor.** `grid-of-N · none · page · many · top · caption under each logo`

**Archetype.** grid-of-N

**Behaviour module.** **none.** **The per-row equalisation is CSS grid rather than measurement** — every cell in a row shares the row’s track height, which is exactly what makes it per row and not per wall. **JS off:** identical, captions included.

**Items** · `logos[]`, three to twelve, each with an optional `caption` ≤ 40.

- **Add.** Lands last, and **the seeded item carries a seeded caption too** — “Quoted the letter, March 2026” — because an item arriving with an empty caption draws a reserved space with nothing in it. *Flagged: mine.*
- **Remove.** Never disabled; the equalised block of the row it leaves is recomputed and **the rows above it do not move**, which is the point of equalising per row.
- **Reorder.** Meaningful, and it changes more here than elsewhere: **which captions share a row decides how tall that row is.**
- **Counts.** **Three to twelve**, three to five per row; Count Six is refused because a 40-character caption is four lines in a 196 px cell. Over twelve it draws more rows of captioned cells at its own count. **No caption is dropped by a switch any more** — the hand-off that lost every caption is deleted, and 3 Grid is advice for a wall that does not want captions.
- **Zero.** The section does not render.
- **Inside an item.** `logo`, `logoDark`, `alt`, `url` and **`caption`, the only design that reads it.** A logo with no caption **keeps the reserved space and nothing is put in it** — no dash, no repeat of the name, no hidden text; **no caption on any logo → no caption block at all, and the wall draws.** Captions is a section value, so the alignment is set for every caption at once, and **a caption cannot be given its own line count**: 40 characters is two lines at 306 and four at 163, and the panel states the cost rather than clamping it. Where a `url` is authored the `<a>` wraps the logo and the caption, making the caption part of the link’s name.

**Fields** · 1 Row's section fields; three to twelve items reading `logo`, `logoDark`, `alt`, `url` **and `caption` ≤ 40**.

**Controls** · Head: Centred · Flush left · None · Count per row: Three · Four · Five · Logo size: Small 28 · Medium 36 · **Captions: Centred · Left** · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Title size, fixed at Medium 34; Count Six, where a 40-character caption is four lines in a 196 px cell; Large 48, since a 48 px mark over a 13 px caption is a headline over a footnote; a caption above the logo; a caption beside it; a second caption line; a `<figcaption>`.

**Arrangement** · 1 Row's cells at 416 · 306 · 240; caption 13 px `text-muted` **at every width**, 12 px under the logo box, on the cell's width, wrapping and never truncated; **rows 48 apart rather than 40**, because a row here ends in type. **The caption block is equalised to the tallest caption in its row — per row, not per wall** — so the logos share a centre line whatever their captions do; equalising the whole grid to its worst caption would cost every short caption twice over. **At Captions Left the logo ranges left with the caption — the one place in A11 a logo is not centred in its cell.**

**Responsive** · three across at 834 and two at ≤ 767; **the caption stays 13 px and the equalised block grows instead**; row gap 48 → 40 → 32, because the caption block does more of the separating as it grows. A 40-character caption is two lines at 306, three at 234 and four at 163, and **the panel states that cost rather than clamping.**

**Empty** · **a logo with no caption keeps the reserved space and nothing is put in it** — no dash, no repeat of the name, no hidden text. **No caption on any logo → no caption block at all**, and the design draws. Over twelve → more rows of captioned cells, with 3 Grid advised.

**a11y** · the cell an `<li>` with an `<img>` and a `<p>`, **never `<figure>`/`<figcaption>`** — a figure is a self-contained unit referenced from elsewhere and a logo in a wall is a list item; alt then caption as two strings with **no `aria-describedby`**; where a URL is authored **the `<a>` wraps the image and the paragraph**, making the cell the target and the caption part of the name; the reserved space empty in the DOM. Caption 5.6:1 / 6.0:1, **rising to 15.8:1 / 15.1:1 on a linked cell's hover**, where it resolves to `text` — the only hover in A11 that changes any type.

**Flagged** · the 12 px gap and the 48 px row gap; **the per-row equalisation**; the 40-character ceiling and the 28-character advice; the rule that a caption is not the name; the logo ranging left; the link wrapping both elements; refusing Count Six, Large 48 and `<figure>`.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover** added, **six of its own**. Quick Controls: **Count per row · Captions · Logo size · Treatment.** Editing: **captions edit inline in the cell**, one at a time, and a caption inside a linked cell is edited in place and is still part of the link's name. **The over-twelve hand-off stays loud, in the panel and here: 3 Grid draws no captions**, the captions are kept in the data and none is drawn, and the panel says so before the thirteenth logo as well as after — the one hand-off in A11 that drops an item field. Hover: a linked cell's caption still rises to `text`; an unlinked mark resolves and its caption does not move. **Frames changed:** the control panel, plus a states strip drawing a selected caption, the reserved empty space and the hand-off line.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*, and **one item field stops being lost**: over twelve this design draws more rows of captioned cells at its own count, so the hand-off that dropped every caption is deleted and 3 Grid is advice for a wall that does not want captions. With no caption on any mark the caption block is not drawn at all and the wall draws. *Item counts are a number picker*: **Count per row stays a named-value row**, Count Six still refused with its reason. **No form, no member button, and nothing lost with JavaScript off** — the per-row equalisation is CSS grid.

---

## 12 · Tiers

Two groups at two box sizes: the first one, two or three logos at Huge 64 or Large 48, the rest at Small 28. **The only design in A11 that draws two logo sizes in one section**, which means it is the only one that breaks the rule the other fourteen exist to keep — that every mark on a wall carries the same weight. It breaks it on purpose, where a site has a real hierarchy to state.

**Descriptor.** The only design that draws two box sizes in one section — the first one, two or three marks at Huge 64 or Large 48 and the rest at Small 28 — and the only one whose ranking comes from the item order rather than from a field.

**Structural descriptor.** `stack · none · page · many · inline · two box sizes ranked`

**Archetype.** stack

**Behaviour module.** **none.** Two lists, two labels, the 96 px lead gap and the one-across lead tier at ≤ 767 are markup and CSS. **JS off:** identical, including the ranking, since the tiers are two `<ul>`s and not a sorted view.

**Items** · `logos[]`, four to sixteen, **the first N of them being the lead tier.**

- **Add.** Lands last, **which means it lands in the rest tier**; the only way into the lead tier is to move a row to the top of the repeater, and the editor says so on the Lead count control rather than offering a tier field.
- **Remove.** Never disabled, and **removing from the lead tier promotes the next item into it** — Lead count is a section value and the first N are whatever the list’s first N are. Under four in total both tiers draw what exists, and with nothing left over there is no rest tier and no rest label; 1 Row is advised.
- **Reorder.** **Meaningful and structural: the repeater’s order is the ranking.** This is A11’s clearest case of the rule that a per-item control is a signal the design should be two designs — **this design is the per-item size control, offered as a design**, with the rest tier fixed at Small 28 so a site cannot flatten the hierarchy it chose it for.
- **Counts.** **Four to sixteen in total**, one to three in the lead. Over sixteen the rest tier grows by a row, with 13 Dense advised. At ≤ 767 the lead tier stacks one mark per row — the stated exception to the never-one-across floor.
- **Zero.** The section does not render, labels included.
- **Inside an item.** As 1 Row. **`leadLabel` and `restLabel` are section fields, not item fields** — a group’s label is not an item’s property — and **there is no per-logo tier field**, which the design states as a refusal. A missing label leaves its list unnamed and nothing is generated: **the ranking is carried by size alone, which is not available non-visually**, so the labels are the only non-visual signal and the editor says so — “Without labels, the tiers are visual only.”

**Fields** · 1 Row's section fields **plus `leadLabel` ≤ 20 and `restLabel` ≤ 20, which no other design draws**; four to sixteen items. **The first N items in the repeater are the lead tier** — A10·5's rule — and **there is no per-logo tier field**: a site reorders the repeater instead. Both labels are optional and either may be drawn alone.

**Controls** · Head: Centred · Flush left · None · **Lead count: a number picker, 1–3** · **Lead size: Large 48 · Huge 64** (40 · 48 at 834, 32 · 40 at 390) · **Rest count per row: Four · Five · Six** · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Title size, fixed at Medium 34; **a size for the rest tier, fixed at Small 28** — a control over both would let a site set them equal and lose the hierarchy it chose the design for; a third tier; a rule between the tiers, which makes two sections out of one; a per-logo tier field; a label that is a heading.

**Arrangement** · **the lead tier has no cell grid** — natural widths on a 96 px gap, **flush left at Two and Three and centred at One**, the only alignment in A11 that changes with a count — and **the rest tier has 1 Row's cells** at 306 · 240 · 196, rows 32 apart. Tier gap 64; label to group 16; labels the eyebrow component at 13 px uppercase tracked `.08em` muted. **A short rest row agrees with the lead tier's alignment.**

**Responsive** · lead 48 · 64 → 40 · 48 → 32 · 40; rest 28 → 26 → 24; tier gap 64 → 56 → 48. **At ≤ 767 the lead tier stacks one mark per row — the stated exception to A11's never-one-across floor.** **The ratio between the tiers narrows from 2.3× to 1.7×** and the panel states it rather than forcing it, which would push the rest tier under its 24 px floor.

**Empty** · under four in total → both tiers draw what exists, and an empty rest tier draws neither list nor label; over sixteen → the rest tier grows by a row. 1 Row and 13 Dense are advised, never substituted. **A missing label leaves its list unnamed and nothing generated.** At Head None **the lead label does not become the section's name.**

**a11y** · **two `<ul>`s, each `aria-labelledby` its own label `<p>`**; the labels `<p>`s and never `<h3>`s, since promoting them would put them in the page's outline as subheads; reading order the authored order. **The ranking is carried by size alone, which is not available non-visually — so the labels are the only non-visual signal**, and the editor says so: “Without labels, the tiers are visual only.” A stated loss, not a solved problem.

**Flagged** · the 64 px tier gap and 16 px label gap; the lead tier's natural widths and 96 px gap; **the lead centred at One and flush left at Two and Three**; fixing the rest tier at Small 28; capping Lead count at three and the total at sixteen; refusing a rule, a third tier and a per-logo tier field; **the lead tier going to one across at ≤ 767**; the ratio narrowing with width.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover** added, one value for both tiers, **six of its own**. Quick Controls: **Lead count · Lead size · Rest count per row · Treatment.** Editing: **both tier labels edit inline** above their groups; they are section fields, so editing one touches no item, and they stay `<p>`s named by `aria-labelledby` rather than `<h3>`s. **The warning ships verbatim at both label fields: “Without labels, the tiers are visual only.”** The ranking is carried by size alone, which is not available non-visually, so the labels are the only non-visual signal — a stated loss, not a solved problem. **Frames changed:** the control panel, plus a states strip drawing both labels selected and the warning as it ships.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: under four in total both tiers draw what exists — an empty rest tier draws neither list nor label — and over sixteen the rest tier grows by a row, with 1 Row and 13 Dense advised. *Item counts are a number picker*: **Lead count is a number, 1–3**, with its maximum and reason at the control, while **Rest count per row stays a named-value row**, because it divides a row into columns. The warning still ships verbatim at both label fields: “Without labels, the tiers are visual only.” **No form, no member button, and nothing lost with JavaScript off.**

---

## 13 · Dense

Twelve to twenty-four marks at Tiny 22, six to ten across. For a site whose honest answer is “a lot of them”. **The one design in A11 where the aspect classes stop governing.**

**Descriptor.** The only design at Tiny 22 and six to ten across, where the aspect classes stop governing and the wall reads as a texture rather than as marks — and the design where the category’s twenty-four ceiling is reached.

**Structural descriptor.** `grid-of-N · none · page · many · inline · tiny box, ten across`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Twenty-four cells, the 12 px gutter at ≤ 767, the 8 px hover padding and the plate’s reduced padding are all CSS. **JS off:** identical.

**Items** · `logos[]`, twelve to twenty-four — **the only design that reaches the field’s ceiling.**

- **Add.** Lands last. **Add logo is disabled at twenty-four here first**, and the message is the shared floor’s.
- **Remove.** Never disabled; **removing to eleven draws eleven marks at Tiny 22**, and the panel advises 3 Grid, which would draw the same marks at Medium 36.
- **Reorder.** Meaningful in principle and **weakest in effect**: at Count Ten a mark’s position in a texture of twenty-four identical cells is close to unreadable, and the panel does not pretend otherwise.
- **Counts.** **Twelve to twenty-four**, six to ten across. Under twelve it draws the marks it has at Tiny 22, with 3 Grid advised; over twenty-four is not authorable. **A short last row draws at the count’s cell width with the empty cells absent rather than reserved.**
- **Zero.** The section does not render.
- **Inside an item.** As 1 Row. **Count per row is the section’s value, and at Count Ten it overrules the item’s own artwork** — the 84 px max width beats the 22 px box, `object-fit: contain` decides, and a wide wordmark draws at about 14 px. That is the closest A11 comes to a section control changing what an item *is*, and **the answer is still not a per-logo size**: the panel names Count Eight, which keeps them at 22.

**Fields** · 1 Row's, twelve to twenty-four items. **Twenty-four is the ceiling of `logos[]` in the whole category and this design is where it is reached.** **The `note` earns its place here** — “and four more asked not to be listed” is a sentence only a dense wall needs.

**Controls** · Head: Centred · Flush left · None · **Count per row: Six · Eight · Ten** · **Row gap: Tight 24 · Normal 32** · **Last row: Left · Centred, Left the default — the reverse of 3 Grid** · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Title size, fixed at Medium 34; **Logo size — the box is Tiny 22, off the ladder, and this is the only design that uses it**; a gutter control; hairlines, which are 3 Grid's; cards; a caption.

**Arrangement** · cells **196 · 141 · 108** on a fixed 24 px gutter, all whole pixels; box Tiny 22; rows 24 or 32 apart. **At Count Ten the 84 px max width beats the 22 px box for every Wide mark, so the aspect classes stop governing and `object-fit: contain` decides** — marks draw at 12 to 18 px, and the panel states it: “At ten across, wide wordmarks draw at about 14 px. Eight across keeps them at 22.” The wall still reads level because every cell is identical and every mark is centred in one; **it reads as a texture rather than as twelve marks, and that is the design.** A linked cell takes 8 px of padding for its hover surface, so a 22 px mark still gets a 38 px target; **the plate's padding steps to 8 at this box size.**

**Responsive** · **all three counts become six across at 834 and four across at ≤ 767 — the only design in A11 that keeps more than two across on a phone, and the only one whose gutter tightens.** At 834 cells 116 on 24 with a 20 px box; at ≤ 767 cells 78 on a 12 px gutter with an 18 px box and rows 16 or 20 apart. **Three counts collapsing to one drawing at 834 is stated rather than hidden.**

**Empty** · **under twelve → the marks that exist at Tiny 22**, with 3 Grid advised. Over twenty-four → the first 24, stated. A short last row draws at the count's cell width with the empty cells absent rather than reserved.

**a11y** · one flat `<ul>` of up to twenty-four `<li>`, **no grouping and no skip link** — the list-level jump is already in the reader's software. **A linked cell's target is 157 × 38 at eight across and 94 × 34 on a phone, past 44 px in one axis and not the other — stated as a limitation**, with 5 Cards named for a wall of links; padding the cell to 44 would take the wall back to two across and undo the design. **Twenty-four marks means twenty-four alts and no structure between them**, a stated cost of choosing density. At Tiny 22 the editor's 3:1 advice matters more than anywhere else in A11.

**Flagged** · Tiny 22 and dropping Logo size; the 196 / 141 / 108 cells and the fixed gutter; **the aspect classes giving out at Count Ten and saying so**; Last row defaulting to Left; the 8 px hover padding; the plate's 8 px padding; four across and a 12 px gutter at ≤ 767; the twelve-and-twenty-four floor and ceiling.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**, **Row gap keeping its row**; **Hover** added, **six of its own**. Quick Controls: **Count per row · Row gap · Last row · Treatment.** **The aspect-classes disclosure ships at Count Ten as written, under the Count row: “At ten across, wide wordmarks draw at about 14 px. Eight across keeps them at 22.”** It names the value that costs something and the value that does not, and it disables neither. Hover: at Tiny 22 a resolve is 22 px of colour, and it is still the mark's own rather than a tint. **Frames changed:** the control panel, plus a states strip drawing the same wide mark at both counts beside the disclosure.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: under twelve it draws the marks it has at Tiny 22, with 3 Grid advised — the hand-off that made the marks bigger is deleted. *Gap names are Tight · Normal · Loose*: **Row gap reads Tight 24 · Normal 32**, values unchanged, and the row offers the first two names only because a third step here is a gap wider than the mark. *Item counts are a number picker*: **Count per row stays a named-value row**; twenty-four is the list's own ceiling and this is where it is reached. **No form, no member button, and nothing lost with JavaScript off.**

---

## 14 · Inline

Two to four marks set inside a sentence, on the line. **The one design in A11 where a logo has a grammar** — the object of a verb rather than an item in a list — and the one that reads `lede`. **The only design that does not draw `url`, and the only one with no arrangement to collapse.**

**Descriptor.** The only design where a mark is a word rather than an item — two to four logos set inside one sentence, placed by chips in the lede — and the only one that keeps `url` and refuses to draw it.

**Structural descriptor.** `article body · none · page · few · inline · marks inside a sentence`

**Archetype.** article body

**Behaviour module.** **none.** **The chip is an editor mechanism, not a runtime one**: what is published is an `<img>` inside a `<p>`, and the chip’s dashed outline and 6 px of padding are editor-only — the one place in A11 where the editing view is not the published view. **JS off:** identical; the sentence is server-rendered with its marks in it.

**Items** · `logos[]`, **two to four — the field’s floor, and this design alone.**

- **Add.** Lands last in the repeater and **nowhere at all on the canvas**: a mark is drawn only where a chip is inserted from the toolbar, so a new item arrives unplaced and the panel reads “2 of 3 placed”. **The one design in A11 where adding an item does not change what is drawn.**
- **Remove.** Never disabled, and **removing an item takes its chip with it** — the chip is one atomic character to the cursor and the sentence closes up around it. Below two the sentence draws with the mark it has, and 1 Row is advised.
- **Reorder.** **Not meaningful.** The lede’s chip positions are the drawn order, so dragging a row moves nothing on the canvas — the only design in A11 where the repeater’s order and the drawn order are different things, and the panel says so rather than disabling the handle.
- **Counts.** **Two to four**; **the chips are the count**, which is why no Count control is offered. Five or more → the fifth is held unplaced and 1 Row is advised, because a sentence with five marks in it is a list with punctuation.
- **Zero.** The section does not render. **No lede → the section does not render either**: without the sentence there is nothing for a mark to sit in, which makes this the one design in A11 a missing head field stops.
- **Inside an item.** `logo`, `logoDark`, `alt` — **`url` is stored and never drawn, the only field any design in A11 ignores outright**, because a 24 px underlined mark inside a 20 px sentence reads as a typographic accident and the target would be a 90 × 24 sliver mid-paragraph. `caption` is kept too. **An unplaced item is not published**, and a placed item with no `logoDark` **sets the paragraph’s leading in dark** — the one place an item’s missing optional file changes the section’s type rather than one cell’s look.

**Fields** · `eyebrow`, `title`, **`lede` rich text ≤ 280**, `note`, `linkLabel`, `linkUrl`. `sub`, `leadLabel`, `restLabel` and `caption` kept, not drawn. Two to four items reading `logo`, `logoDark`, `alt`; **`url` kept and not drawn — the only field any design in A11 ignores outright.** **The lede carries one chip per mark, inserted from the toolbar**; a mark cannot be typed, a chip is one atomic character to the cursor, and deleting a logo takes its chip with it. Allowed inside the lede: inline links, bold, italic. Refused: lists, headings, code, a second paragraph, a blockquote, **and any image that is not a chip.**

**Controls** · Head: Centred · Flush left · None · **Measure: Wide 780 · Narrow 620** · **Lede size: Body 20 · Large 24** · **Logo height: Inline 24 · Large 32** · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Title size, fixed at Medium 34; Count, since the chips are the count; **a link on a mark** — a 24 px underlined mark inside a 20 px sentence reads as a typographic accident and the target would be a 90 × 24 sliver mid-paragraph; a caption; an alignment for the marks, which the sentence decides.

**Arrangement** · one `<p>` on the measure with **leading set to the logo height plus 12 — 36 at Inline 24, 44 at Large 32, the same at every width**; each mark an unbreakable inline run the sentence breaks around; **each mark centred on the line's x-height, not set on the baseline**, because a wordmark on the baseline sits high against 20 px text and a square mark higher still; aspect classes still governing at 100 / 88 / 72%. The two sizes are a pair the panel recommends together; **Body 20 with Large 32 makes the mark taller than the line's ascender, a deliberate effect and not disabled.** **In dark a plated mark makes the leading the plated height plus 12**, a visibly taller line, and the panel warns about it.

**Responsive** · **nothing collapses, because a paragraph reflows.** Wide 780 → 690 at 834 → the column at 390; Narrow 620 holds until the column is narrower. **The lede size, the logo height and the leading do not step at any width** — the only design in A11 whose type and artwork are the same size on a phone as on a desktop, because a mark inside running text cannot step without the leading stepping with it. **The one design a 350 px column does not damage.**

**Empty** · **no lede → the section does not render.** **A logo with no chip is not drawn and nothing is appended**; the panel reports “2 of 3 placed”. Five or more logos → the fifth is held unplaced, with 1 Row advised.

**a11y** · one `<h2>` and one `<p>`, **no list anywhere — the only design in A11 without one**; each mark an `<img>` with its required alt inside the paragraph so the sentence reads straight through, **the strongest argument in the category for alt being the brand's plain name**; the marks not `<strong>`, `<em>`, `<cite>` or links. **The lede is `text` at 15.8:1 / 15.1:1, not muted**, because it is the section's reading matter. **The chip's dashed outline and 6 px of padding are editor-only and not published** — the one place in A11 where the editing view is not the published view.

**Flagged** · the leading rule and both values; **the x-height centring and its three offsets**; the chip mechanism's editor-only treatment; **refusing to draw `url`**; refusing a non-chip image in the lede; the four-mark ceiling, the unplaced fifth mark and the section not rendering with no sentence; **the plated-mark leading rule**; the lede taking `text`; nothing stepping with width.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover** added — **a resolve with no surface, this design having neither links nor cells**, and its only hover — **six of its own**. Quick Controls: **Measure · Lede size · Logo height · Treatment.** Editing: the lede takes the P0·1 toolbar **and the mark-insert button that sits in it**; a mark still cannot be typed, the chip is still one atomic character to the cursor, and deleting an item still takes its chip with it. **Frames changed:** the control panel.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: a fifth mark is held unplaced and the panel advises 1 Row, and **with no sentence the section does not render** — a mark here sits inside the lede and there is nothing else for it to sit in, which is the same outcome as no marks at all and makes this the one design in A11 a missing head field stops. *Item counts are a number picker*: **no Count row is offered, because the chips are the count.** **No form, no member button, and nothing lost with JavaScript off** — the chip is an editor mechanism and what is published is an `<img>` in a `<p>`.

---

## 15 · Big Type

A title at Display 48 on a 1,040 measure with three marks at Huge 64 beneath it, or four at Large 48. **The category's loudest design, and the only one where the type is louder than the artwork.**

**Descriptor.** The only design where the type is louder than the artwork — a Display 48 title on a 1,040 measure over three or four marks — and the category’s only Display size, only 1,040 measure and only 64 px head gap.

**Structural descriptor.** `stack · none · page · few · bottom · display title over wall`

**Archetype.** stack

**Behaviour module.** **none.** The title, the wall, the converging pairs at ≤ 767 and the row that grows to hold a plated mark are all CSS. **JS off:** identical.

**Items** · `logos[]`, three or four, under the title.

- **Add.** Lands last. **Past four the item is held**, panel reading “4 of 6 drawn” with 3 Grid advised — this design refuses a fifth cell rather than wrapping to a second row.
- **Remove.** Never disabled; **two logos → two cells at the number’s width**, and the panel advises 1 Row, because two marks under a 48 px line is a title with an afterthought.
- **Reorder.** Meaningful; three or four marks in authored order, and at this size the first cell is where the eye lands after the title.
- **Counts.** **Three or four** is the designed range. Two → two cells at the number’s width, 1 Row advised; five or more → the first four drawn, 3 Grid advised. **Huge 64 is disabled at Count Four** rather than discouraged, because a 282 px max width would decide the height of every Wide mark.
- **Zero.** The section does not render. **No title → the title is absent, the head closes up and the wall draws at its own geometry**, with 1 Row advised, because the title is the design.
- **Inside an item.** As 1 Row. **A plated mark is 62 px at Large 48 and 78 at Huge 64, taller than its box, and the row grows to it while every mark keeps the centre line** — a section-level consequence of one item’s missing file, and the one case in A11 where an empty optional field changes a row’s height rather than a cell’s look.

**Fields** · `eyebrow`, `title`, `note`, `linkLabel`, `linkUrl`; **`sub` kept and not drawn — the only design in A11 that draws the eyebrow and refuses the sub**, because a 17 px paragraph between a 48 px line and a 64 px mark is read by nobody. Three or four items. **This is the design the title's 104-character limit was worth checking**: three lines at Display 48 on 1,040, two at Large 40.

**Controls** · **Title size: Large 40 · Display 48 — the only Display 48 in A11** · Count: **a number picker, 3–4** · **Logo size: Large 48 · Huge 64, Huge unavailable at Count Four** · Alignment: Flush left · Centred · Treatment. **Hover: Resolve to colour · None.** **Six of its own**, with the universal trio — Background role, Vertical spacing, Top divider — and the Data group outside them.

**Not offered** · Head None, because the title is the design; the sub; Count Two or Five; a caption; a rule; a hover plane on an unlinked mark.

**Arrangement** · **title on a 1,040 measure — the only measure in A11 that is not 780 or 620** — at 48/1.1 or 40/1.12, because 48 px on 780 is four words to a line; eyebrow 12 px above it; **head to wall 64 rather than 48**, so a Display line does not read as a caption for the marks; cells 416 or 306 on a 24 px gutter. **Huge 64 in a 416 cell gives a 392 px max width so every mark is decided by the box; at Count Four's 306 the 282 px max width would decide the height of every Wide mark, which is why Huge is disabled there rather than discouraged.** Alignment Centred centres the head and the foot and leaves the wall alone. **A plated mark at Large 48 is 62 px and at Huge 64 is 78, taller than its box, and the row grows to that height while every mark keeps the centre line.**

**Responsive** · three across holds at 834 and becomes two at ≤ 767; title 48 → 34 → 28 and 40 → 30 → 28; box 64 → 40 → 32 and 48 → 34 → 32; head gap 64 → 48 → 40. **At ≤ 767 both title sizes draw at 28 and both logo sizes at 32 — two pairs of control values drawing the same thing**, A10·15's finding for a different reason, stated rather than disabled. **At 834 the 210 px max width decides the two widest wordmarks even at Count Three**, the first width where that happens here.

**Empty** · eyebrow, note and link → absent. **No title → no title, a closed-up head and the wall at its own geometry**, 1 Row advised. **Two logos → two cells at the number’s width; five or more → the first four drawn**, with 3 Grid advised.

**a11y** · **the title is an `<h2>` at 48 px and never an `<h1>` — size is not level**; otherwise 1 Row's structure exactly, so switching between the two changes nothing announced. **A linked mark's target is 416 × 64, the largest in A11 outside 5 Cards** — a by-product of the size rather than the point, and the panel still names 5 Cards for a wall of links. At 400% the title is 28 and the wall two across, wrapping rather than overflowing because the measure is a max-width. At Huge 64 the 3:1 advice matters least in the category.

**Flagged** · **the 1,040 measure and the 64 px head gap**; offering Display 48 here alone; disabling Huge 64 at Count Four; refusing the sub, Head None, Count Two and Count Five; the three-logo floor; **the plate exceeding its box and the row growing rather than the plate shrinking**; both pairs converging at ≤ 767.

**Reconciled · controls pass, 24 August 2026.** Controls: **Padding retired into Vertical spacing**; **Hover** added — **at Huge 64 the most visible resolve in the category** — **six of its own**. Quick Controls: **Title size · Count · Logo size · Alignment.** Editing: the sub is authored and never drawn here, so it is edited in the sidebar rather than on canvas. **Frames changed:** the control panel.

**Patched · design patch pass, 30 August 2026.** *No design ever turns into another design*: with no title the title is absent, the head closes up and the wall draws at its own geometry; two marks draw two cells at the number's width; five or more draw the first four with the rest held. **1 Row and 3 Grid are advice.** *Item counts are a number picker*: **Count is a number, 3–4**, four the maximum because a fifth cell means a second row and this design draws one; Huge 64 stays greyed at four with its reason. **No form, no member button, and nothing lost with JavaScript off.**

---

## 16. What A11 settled, in one place

**§8.1 — logo counts and row wrapping, including the awkward final row.** **Count is a per-row count, never a total**: Three 416 · Four 306 · Five 240 · Six 196 on a 24 px gutter, A10's divisions extended by two, with the total whatever the site authored between three and twenty-four. **Rows wrap in authored order, 40 px apart, and the short last row keeps the cell width** — stretching it is refused, because a wider cell is a bigger logo box. **Centring it is the default in four designs and four others depart with a stated reason.** **A last row of one is drawn, warned about, and not prevented**: the editor's counter reads “7 logos at six across leaves 1 on the last row — five across leaves 2, four across leaves 3”. Rebalancing was refused, because it makes the theme overrule a count the user set; stretching was refused; hiding was refused. **Four designs have no cell grid at all** and settle nothing here, because a track, a rail, a spread band and a lead tier have no rows to wrap.

**§8.2 — mixed aspect ratios, normalised without distortion.** Every logo sits in a box: a fixed height from the ladder, a max width of the cell minus 24, `object-fit: contain`, centred on both axes. **Nothing is cropped, stretched, upscaled or altered in ratio, ever.** **Normalising by box height alone is the defect**, so the theme computes three aspect classes from the file's intrinsic ratio and draws **Wide ≥ 3:1 at 100% of the box, Regular 3:1–1.4:1 at 88%, Square under 1.4:1 at 72%** — with no control over them. **Logos share a horizontal centre line, not a baseline.** SVG preferred, PNG at 2× the box. **13 Dense is where this gives out**: at Count Ten the 84 px max width beats the 22 px box for every Wide mark, the classes stop governing, and the design says so rather than pretending otherwise.

**§8.3 — greyscale, muted and full colour, checked in light and dark.** Three named values, **Greyscale the default** — the value that makes twelve packs and two modes one problem instead of twenty-four. Muted is greyscale at 64% light / 74% dark, and 70% in both on a band. **`invert()`, blend modes, duotone, an accent tint and per-logo overrides are all refused.** **A dark ground needs a second file, not a filter**: `logoDark`, and with none the logo takes a plate carrying the pack's **light-mode** `surface` at the pack radius with 12 px of padding — the one place in the library a dark section draws a light-mode token, deliberately visible because the editor is asking for a file. **7 Contrast Band amends the rule: the test is the ground, not the mode**, so that band reads the dark file in light mode and the light file in dark. **§7.4 cannot be applied to this control** — the theme cannot measure an uploaded file, so Muted is never disabled and the editor carries the 3:1 non-text advice.

**§8.4 — whether logos are links, and whether the wall carries a caption.** **A link is per logo and optional; the wall is never one link; mixed is the ordinary case.** One hover rule at all three treatments: the cell takes the pack's hover surface at the pack radius and the treatment resolves to full colour, 160 ms — **and after the controls pass the resolve is a section control, Hover: Resolve to colour · None, applying to every mark while the surface stays the link's**. **The resting state gives no sign of which logos are links** — a stated cost in all fifteen, and 5 Cards exists to make the *target* clear rather than the link. **`alt` is required, is the brand's name, and never contains the word “logo”.** **“Caption” is two fields**: the section's `note` under the wall, drawn by eleven designs, and the per-logo `caption`, **drawn by 11 Named alone** and kept undrawn by the other fourteen with the count stated.

### The seven amendments the drawn designs forced on the proof

1. **The plate is about the ground, not the mode.** A11-0 states it as a dark-mode fallback; **7 Contrast Band reads `logoDark` in light mode** and `logo` in dark, so the theme's test is whether the ground behind the logo is dark. A site that never turns dark mode on still needs the second file for that band.
2. **The plate is not always inside the box.** It is inside the box in nine designs; **5 Cards makes the card itself the plate**; **13 Dense drops its padding to 8 at Tiny 22**; **12 Tiers and 15 Big Type let it exceed the box at Large 48 and Huge 64, the row growing to fit** while every mark keeps the centre line; **14 Inline lets it set the paragraph's leading.**
3. **The never-one-across floor has one exception.** **12 Tiers' lead tier stacks one mark per row at ≤ 767**, because two 40 px marks on a 350 px column is 175 px each and the lead stops leading. **13 Dense goes the other way** and keeps four across at 78 on a 12 px gutter.
4. **The 24 px gutter has two exceptions.** **6 Split Head opens it to 25 at Count Three** to keep the cells equal inside its 824 block, and **13 Dense tightens it to 12 at ≤ 767.** Every other gutter in the category is 24.
5. **Four designs have no cell grid**, not one: 8 Marquee, 9 Rail, 10 Slim and 12 Tiers' lead tier. A11-0's arrangement rules apply to the other eleven.
6. **The short-last-row default is not universal.** 1 Row, 3 Grid, 7 Contrast Band and 15 Big Type centre it; **4 Boxed centres at 1440 and left-aligns below, 5 Cards left-aligns at every width, 6 Split Head left-aligns inside its block, and 13 Dense defaults to Left.** Each states why.
7. **A11 has one forced control value and it is 3 Grid's:** at Cells Hairlines the last row is Left whatever Last row says, because a centred cell in a hairline matrix puts a cell wall where no column edge is.

### The category in one paragraph

A11 is fifteen arrangements of a component that is one image in a box, where the image belongs to somebody else. **Eleven designs draw a row or grid of equal cells; four do something else** — 8 Marquee moves it, 9 Rail is moved, 10 Slim spreads it, 14 Inline dissolves it into a sentence. **Four fields are read by one design each**, and each of those designs draws without it rather than becoming another design: 2 Caption Row's label column closes up, 11 Named draws no caption block, 12 Tiers leaves a tier unnamed, and 14 Inline does not render at all. **Eleven designs name 1 Row in their panels as advice**, and 9 Rail's arrows are decided by the window rather than the content — but **no design in A11 turns into another design.** **The one thing no design can touch is the artwork**: twelve packs change the ground, the type, the hairlines and the radius, and the logos are identical in all of them — which is why Greyscale is the default, why the aspect classes exist, and why the honest answer to a dark ground is a second upload rather than a filter.

---

## 17 · Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fifteen checked against each other; **no two are the same.**

| # | Design | Tuple |
|---|---|---|
| 1 | Row | `grid-of-N · none · page · few · inline · row of equal cells` |
| 2 | Caption Row | `bar · none · page · few · right · label column beside wall` |
| 3 | Grid | `grid-of-N · none · page · many · inline · optional hairline matrix` |
| 4 | Boxed | `grid-of-N · box · surface · many · inline · one panel around wall` |
| 5 | Cards | `grid-of-N · none · page · variable · inline · one card per logo` |
| 6 | Split Head | `split · none · page · many · right · head column beside wall` |
| 7 | Contrast Band | `grid-of-N · none · contrast · few · inline · inverted ground, dark file` |
| 8 | Marquee | `bar · none · page · many · full-bleed · continuously moving track` |
| 9 | Rail | `carousel · none · page · variable · full-bleed · reader-scrolled track with arrows` |
| 10 | Slim | `bar · none · page · few · inline · band with no type` |
| 11 | Named | `grid-of-N · none · page · many · top · caption under each logo` |
| 12 | Tiers | `stack · none · page · many · inline · two box sizes ranked` |
| 13 | Dense | `grid-of-N · none · page · many · inline · tiny box, ten across` |
| 14 | Inline | `article body · none · page · few · inline · marks inside a sentence` |
| 15 | Big Type | `stack · none · page · few · bottom · display title over wall` |

**Distribution.** Archetype: grid-of-N ×7 (1, 3, 4, 5, 7, 11, 13) · bar ×3 (2, 8, 10) · stack ×2 (12, 15) · split, carousel, article body ×1 each (6, 9, 14). Containment: none ×14, box ×1 (4). Ground: page ×13, surface ×1 (4), contrast ×1 (7). Count: many ×7 (3, 4, 6, 8, 11, 12, 13) · few ×6 (1, 2, 7, 10, 14, 15) · variable ×2 (5, 9). Media: inline ×9 (1, 3, 4, 5, 7, 10, 12, 13, 14) · right ×2 (2, 6) · full-bleed ×2 (8, 9) · top ×1 (11) · bottom ×1 (15). **No design in A11 is `none` on the media slot, and none can be** — the repeating item is itself artwork, which is the category’s headline finding restated as a taxonomy.

**How the media slot is read in a category whose item is an image.** Stated once so it is reproducible: `inline` where the artwork is the section’s body sitting in the type’s own flow — nine designs, the ordinary case; `top` in **11 Named** alone, where type sits under the artwork inside the item; `bottom` in **15 Big Type**, where the wall is subordinate to a display title; `left` / `right` where the wall takes one side of a split — written at the control’s default, **2 Caption Row** at Label side Left and **6 Split Head** at Head column Left, and at the other value each reads `left` with the tuple still unique; `full-bleed` for the two tracks that cross the page margins. *Flagged: the reading is mine — the closed set was written for sections with a media slot beside type, not for sections that are media.*

**What the closed slots could not separate.** **3 Grid and 13 Dense share all five closed slots** — `grid-of-N · none · page · many · inline` — and are separated by the emphasis slot alone. That is not a slip: it is their true relationship, since 3 Grid hands off to 13 Dense above eighteen items and the whole difference between them is **box size and count per row**. **The closed sets have no slot for box size, and box size is A11’s principal variable** — the ladder from Tiny 22 to Huge 64 separates 13 Dense from 15 Big Type as decisively as ground separates 1 Row from 7 Contrast Band, and no slot carries it. **A finding for the architect**, in the same shape as the brief’s own: if two designs differ only by the scale of their repeating unit, the tuple cannot see it.

**Three slots a reader would reasonably fill in differently.**

- **5 Cards is `none · page`.** The cards are the *item’s* geometry; the section has no container and no ground of its own, and the Cards control (Surface · Ground) sets the card’s fill rather than the section’s ground. **A11’s is the sharpest case of the slot the brief warns about, because the design is called Cards** — and **4 Boxed is the category’s one real containment**, a panel around the whole wall. The pair is what makes the slot legible: one draws edges around items, the other around the section.
- **Count classes are read at the design’s designed range, not at the field’s**, and where a range spans the few/many boundary the class is taken at the lower drawn value — A9’s rule, reused. `variable` is spent twice and both times for a stated reason: **5 Cards** is chosen for its target across three to twelve rather than for a density, and **9 Rail** has no designed count at all, because its precondition is a width.
- **8 Marquee is `bar` and 9 Rail is `carousel`.** A2·8 Ticker set the precedent that a moving band is a bar, and the split carries the distinction the pair exists to make: **a marquee is a band that moves whether anyone is watching; a rail is a track a reader moves.** 14 Inline is the category’s only `article body`, which is the tuple agreeing with the design’s own claim that a mark there has a grammar rather than a cell.

**1 Row and 7 Contrast Band are the pair the brief describes** — the same wall, the same items, the same controls less two, separated by ground alone. In A11 that separation is load-bearing in a way it is not elsewhere: **the ground decides which uploaded file is drawn**, so the two designs do not merely look different, they read different files.

---

## 18 · Reconciliation notes

**Superseded in part on 30 August 2026.** This section records the controls-reconciliation pass. Where it and the **Patch notes** below disagree — every hand-off, 11 Named's over-twelve behaviour, 8 Marquee's reduced-motion state, 9 Rail's precondition, the five number pickers and the three gap rows — **the Patch notes are the later ruling**. Everything else here stands.

**Frames changed in this pass.** **All fifteen control-panel frames** — `A11-1 Row`, `A11-2 Caption Row`, `A11-3 Grid`, `A11-4 Boxed`, `A11-5 Cards`, `A11-6 Split Head`, `A11-7 Contrast Band`, `A11-8 Marquee`, `A11-9 Rail`, `A11-10 Slim`, `A11-11 Named`, `A11-12 Tiers`, `A11-13 Dense`, `A11-14 Inline`, `A11-15 Big Type`. Each lost its **Padding** row into **Vertical spacing**, gained **Hover**, and gained four groups drawn outside its own list: **UNIVERSAL** (Background role · Vertical spacing · Top divider), **LOGOS · the item list** (the P0·3 controls, the per-item fields, the disabled Image focus and the twenty-four cap in the owner's voice), **EDITING · the P0 primitives** and **BEHAVIOUR · from the fixed registry**, plus a **DATA** group. Every footer count was rewritten to “N controls + the universal trio + the Data group”, with that design's **Quick Controls** named beside it. **`A11-8 Marquee` gained a Gap row** and **`A11-3 Grid`'s and `A11-8 Marquee`'s eyebrows were corrected** to seven controls each. **Each design's on-canvas spec card was updated with its panel** — the Padding sentence folded into a “Universal, outside this list” line, Hover added, 8 Marquee's Gap added, 7 Contrast Band's lock and 10 Slim's width-independent ladder named, and the “§7.6's working norm / ceiling” count replaced by “N of its own, plus the universal trio and the Data group”. **Seven designs gained a states strip**: `A11-1 Row` (the three hovers), `A11-2 Caption Row` (the label selected in its column and above the wall), `A11-8 Marquee` (the three gaps and the button at both catalog names), `A11-9 Rail` (the arrows, the group name and the architect note), `A11-11 Named` (a selected caption, the reserved empty space, the hand-off line), `A11-12 Tiers` (both labels selected and the warning verbatim) and `A11-13 Dense` (the same wide mark at Count Ten and Count Eight, beside the disclosure). **`A11-0 Category Proof` carries a new RECONCILED · CONTROLS PASS block of eight items**, and its hover rule, its space rule and its single-design field count were amended in place.

**No primary section frame was redrawn, and the reason is worth stating.** Every control this pass adds ships **at the value the frames were already drawn at** — Hover Resolve to colour is what a linked cell already did, Gap Comfortable 64 resolves to the 64 · 56 · 40 already drawn, Top divider is None, Background role is each design's existing ground. The catalog strings are the same words the frames already carried. What is genuinely new is drawn where it can be read against the old: **an unlinked mark's hover, the two tighter gaps, the inline-edit affordance on the four text fields the category owns, and the three panel lines that ship verbatim** — all in the states strips.

**Conflicts with earlier rulings, one line each.**

1. **§0's “One hover rule … the cell takes the pack's hover surface and the treatment resolves to full colour”, and 1 Row's “the hover reveals the artwork rather than dressing the cell”** — **amended rather than overturned**: the resolve is a section control applying to every mark, the surface stays the link's, and the 160 ms and the three-treatment rule are untouched.
2. **§0's “Refused: … an accent tint, and a per-logo override” on Treatment** — **unchanged, and now load-bearing**: Hover is one value for the section, so “leave this one in colour on hover” is still not expressible.
3. **Every design's per-design “Padding” row** — **retired into Vertical spacing**, the same three values under the universal name. **7 Contrast Band's 44 · 64 · 88 and 10 Slim's width-independent 32 · 44 · 56 survive as those designs' resolutions**, not as second rows; **4 Boxed's Panel padding, 5 Cards' Card height and 13 Dense's Row gap keep their rows**, because they measure something other than the section.
4. **7 Contrast Band's “Band padding … replaces the section Padding control; the band is the section”** — **kept as the argument, dropped as a row**. The ladder is now what Vertical spacing resolves to in that design.
5. **7 Contrast Band's ground, described everywhere as the design's identity** — **now enforced: Background role is locked**, the one lock in A11, and the reason shown is the artwork rather than the aesthetics — that band decides which uploaded file is drawn. Its tuple's `contrast` slot and the lock coincide.
6. **3 Grid's “Seven controls — §7.6's ceiling, and the only design in A11 at it”** — **lifted**. The budget is the PRD's ~15 visible controls plus the universal trio and the Data group; **A11 now runs six of its own on thirteen designs and seven on 3 Grid and 8 Marquee**.
7. **8 Marquee's “Arrangement: logos at natural width on a fixed gap of 64 · 56 · 40” and the flagged 64 px gap** — **the gap becomes a control**, Tight 40 · Comfortable 64 · Wide 96, 9 Rail's ladder. The neighbouring refusals stand: **no direction control, no pause on hover, no control to remove the button, no gradient overlay instead of the mask**.
8. **8 Marquee's a11y ruling, “a `<button aria-pressed>` … named ‘Pause the logo wall’ / ‘Play the logo wall’”** — **the names become theme catalog strings**, unchanged as words. The button's position, its exemption from the treatment and its non-removability are unchanged.
9. **9 Rail's “the one generated string in A11”** — **three catalog strings, and “generated” was the wrong word**: “Logo wall, scrollable”, “Scroll left” and “Scroll right” are theme-supplied, not composed at runtime. `aria-disabled` at 40% and the never-persisted position are unchanged.
10. **The two findings for the architect at the head of this document — `carousel` describing a snapping strip, and no module measuring** — **now carried on 9 Rail's frame as “ARCHITECT: registry addition”**, per the pass's own rule. **No module name is coined**, the refusal of scroll snap stands, and the no-JS drawing is still 9 Rail minus its arrows.
11. **Ground rule 10, Image focus** — **ships in the Image Picker's popover on both image fields and is disabled with its reason shown**: nothing in A11 is cropped, so a focus would choose between edges that are never discarded. A visible disabled field rather than a hidden one, or a control that does nothing. *Flagged: the disabling is mine.*
12. **Ground rule 9, Member Visibility** — **lands nowhere in A11 and is recorded rather than added**. The category bears no action: its one link is a text link at the section-link treatment, not a CTA, and 10 Slim draws no link at all. If the architect wants the control universal rather than CTA-scoped, all fifteen gain it at once. *Flagged.*
13. **Ground rule 11, button icons** — **lands only on the optional section link**, which takes a P0·2 icon before or after its label, off by default. **A11 draws no labelled button**: 8 Marquee's pause and 9 Rail's arrows are icon-only registry controls with fixed glyphs and catalog names, and an icon offer there would be an offer to break 2.2.2's affordance.
14. **Ground rule 7, “remove every Preview-type control”** — **nothing to remove**: no A11 panel ever carried one, and the editor state switcher was always the answer for the two designs with states.
15. **Ground rule 4, “Ghost-owned content is never inline-editable”** — **satisfied by absence, and recorded**: nothing in A11 comes from Ghost, so every visible string is inline-editable and no field answers “Edit in Ghost”. `alt` is the one string edited in the item row rather than on canvas, and the reason is that it is never drawn.
16. **§0's “Nothing comes from Ghost: a logo is a site upload”** — **unchanged and now stated as an answer rather than an absence**: the Data group reads **Source: Static (authored)** with P0·5's “From posts” value **absent rather than disabled**, and `@site.logo` is refused on record as the site's own mark rather than a wall of anyone else's.
17. **§0's item-list floor — the placeholder tile, the seeded “Publication name” alt, the “placed” counter and the hand-off-instead-of-blocking rule** — **unchanged, and now named as P0·3** on every frame. All four stay flagged as mine.
18. **11 Named's “over twelve → 3 Grid, which draws no captions and says so”** — **unchanged and made louder**, in the panel and in a states strip; it remains the one hand-off in A11 that drops an item field.
19. **12 Tiers' editor line and 13 Dense's Count Ten line** — **both ship verbatim**, at both label fields and under the Count row respectively. Neither disables anything, which is what makes them disclosures rather than warnings.
20. **A11-0's field card, “Five fields are read by one design each”** — **a miscount, corrected to four** (`lede`, `caption`, `leadLabel`, `restLabel`), which is what §0 and the enumeration in both documents always said.
21. **§0's “the accent is spent in two places and nowhere else”** — **unchanged**: Hover spends no accent, Top divider is never the accent, and with no section link and no logo URLs authored fourteen of the fifteen still contain no accent pixel.
22. **“A11 uses two modules and thirteen designs declare none”, and “every frame in A11 is a resting state”** — **both survive**. No module was added, renamed or coined; the two modules are still edit-safe; and the states strips are drawn at the new values rather than replacing the resting frames.

---

## 19 · Patch notes — logo walls patch, 30 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are named, never numbered: the letter-and-number codes elsewhere in this project are filing labels.

**Frames changed — sixteen, and every one of them.** `A11-0 Category Proof` gains a **DESIGN PATCH PASS** section of six cards — the numbering line and the free-designs line, what the no-design-turns-into-another-design rule did to the category, the five number pickers and the eight rows that stay named values, the three renamed gap rows, the two withdrawn document reorders, what Ghost's templates cannot do and what that did and did not cost, and the rules that land nowhere here — and **its roster's last column is re-headed “WHAT THE PANEL ADVISES”** with all fifteen cells rewritten. **All fifteen design frames** gain a **DESIGN PATCH** block in the control panel: what the design draws instead of switching, the count control's reading, Remove never greying out, and the no-JavaScript line in the module's own words. **Five Count rows are redrawn as a number picker** with a range and a maximum chip — `A11-1 Row`, `A11-2 Caption Row`, `A11-10 Slim`, `A11-15 Big Type` and `A11-12 Tiers`' Lead count. **Three gap rows are relabelled** — `A11-8 Marquee`, `A11-9 Rail` and `A11-13 Dense`. **One drawn state is redrawn:** `A11-8 Marquee`'s reduced-motion crop, which drew a four-across grid and now draws its own track standing still, clipped at the fade. **No primary section frame was restyled**, no arrangement moved, and no type scale, colour pack or spacing step changed.

### What changed, and the rule that required it

1. **Every hand-off in the category is deleted** — *no design ever turns into another design*. The phrases removed: eleven designs handing to 1 Row (1 Row receiving from all of them), 3 Grid handing up to 13 Dense over eighteen, 13 Dense handing to 3 Grid under twelve, 11 Named handing to 3 Grid over twelve, 12 Tiers handing to 13 Dense over sixteen, 8 Marquee handing to 3 Grid under reduced motion, 2 Caption Row handing to 1 Row with no label, 6 Split Head and 15 Big Type handing to 1 Row with no title, 14 Inline handing to 1 Row with no sentence or a fifth mark, and 9 Rail deciding by measurement whether it was a rail or 1 Row.
2. **What the designs do instead is draw the marks that exist at their own geometry** — *no design ever turns into another design*. 1 Row draws fewer cells, centred; 2 Caption Row closes up its label column and takes the whole content width; 3 Grid draws the cells it has and, above eighteen, all of them; 4 Boxed draws its panel around what exists; 5 Cards draws the cards that exist; 6 Split Head draws an empty head column and an unchanged 824 block; 7 Contrast Band stays a band; 8 Marquee keeps its track running; 10 Slim keeps its band; 11 Named draws captioned cells at every count; 12 Tiers draws both tiers, or one where nothing is left over; 13 Dense stays a texture at Tiny 22; 15 Big Type drops the title and keeps the wall.
3. **9 Rail's precondition is now a piece of furniture** — *no design ever turns into another design*. The measurement stays and its subject changes: where the track already fits its container the arrows and the fade are not drawn, and the section is the same rail. The panel may advise “at this count, 1 Row reads better”. **This also settles the second of the two findings this document had carried for the architect:** the registry still has no module that scrolls without snapping, but no module has to decide which design renders.
4. **8 Marquee's reduced-motion state is a track that does not move** — *no design ever turns into another design*. A static full-bleed row, natively scrollable, the fade or hard edge as authored, and no pause button, because nothing is moving. It is the same drawing the registry's no-JavaScript state gives, so **the precedence between the two off-switches is withdrawn** rather than restated. *Flagged: the replacement is mine.*
5. **11 Named keeps its captions at every count** — *no design ever turns into another design*. This was the one hand-off in A11 that dropped an item field, and deleting it means a caption is never lost to a switch. 3 Grid is advice for a wall that does not want captions.
6. **14 Inline with no sentence does not render** — *no design ever turns into another design*. Its marks live inside the lede, so with no lede there is nothing to draw and nothing to fall back to; this is the one design in A11 a missing head field stops, and it is the same outcome as no marks at all.
7. **Five Count rows are a number picker** — *item counts are a number picker*. 1 Row 3–6, 2 Caption Row 3–5, 10 Slim 3–6, 15 Big Type 3–4, 12 Tiers' Lead count 1–3, each with the design's own maximum and the reason drawn at the control.
8. **Eight Count per row rows stay named-value rows, and the reading is stated** — *item counts are a number picker*. In 3 Grid, 4 Boxed, 5 Cards, 6 Split Head, 7 Contrast Band, 11 Named, 12 Tiers' rest tier and 13 Dense the row divides one row into columns rather than counting marks; **how many marks exist is the item list's own number, capped at twenty-four**. This follows the post grids and the tag collections, where Per row stayed a named-value row and only the item count became a picker. **Ruled by the owner on 30 August 2026: the split stands as drawn.**
9. **Three gap rows are renamed with no value changed** — *gap names are “Tight · Normal · Loose”*. 8 Marquee and 9 Rail: Tight 40 · **Normal** 64 · **Loose** 96, still stepping 32 · 56 · 80 at 834 and 24 · 40 · 56 at 390. 13 Dense: Tight 24 · **Normal** 32, the row offering the first two names only, because a third step at Tiny 22 is a gap wider than the mark.
10. **8 Marquee's Speed keeps Slow · Steady · Brisk** — *slider labels*, read and recorded rather than applied. The title says what it affects, which is what the rule asks; the three values are a speed vocabulary, and the library's standard words are for space and for gaps. Every scale row in A11 already read Compact · Comfortable · Spacious, and 4 Boxed's Panel padding, 5 Cards' Card height and 13 Dense's Row gap all name their subject. *Flagged.*
11. **Two responsive document reorders are withdrawn** — *CSS cannot see content*, in its second clause: a stylesheet cannot reorder the DOM at a breakpoint. **6 Split Head** now keeps one document order at every width — title, sub, note, link, wall — and at 1080 the head becomes a full-width block above the wall with its foot still in it. **2 Caption Row**'s label goes where its document order puts it: above the wall at Label side Left, under it at Label side Right. *Flagged: both replacements are mine.*
12. **Nothing in A11 asks a template to count, add or remember** — *Ghost's templates cannot count, add, or remember*. Every count in the category is an **editor** count, spoken in the sidebar where the whole list is in front of it: “5 of 7 drawn”, “11 of 12 placed”, “2 of 5 are links”, “4 of 5 have a dark file”, and the orphan counter that names the counts which divide. Nothing published is a sum, a comparison or a look back at the previous item.
13. **Nothing in A11 comes from Ghost, so the rule about fields that do not exist bears nothing here** — *some fields we drew do not exist*. A logo is a site upload; no member join date, newsletter list, cadence or site address is read anywhere in the category, and `@site.logo` was already refused on record.
14. **A11 is a placeable section rather than post-body content** — *inside a blog post's body we own the stylesheet and nothing else*. Every mark, list, paragraph and `<picture>` in the category is the theme's own markup; **14 Inline's `article body` archetype is a taxonomy slot, not Ghost's rendered content**, and the sentence it sets is an authored field.
15. **The rules that land nowhere in A11 are recorded rather than applied.** *Avatars with no photograph* — the category draws no person. *The Remove button never greys out* — already true in all fifteen, and now true without a hand-off standing behind it. *A design may offer fewer choices on a shared control, and must say why* — re-checked on all fifteen: 7 Contrast Band's locked Background role, Large 48 disabled at Count Six, Huge 64 at Count Four, and Hover unavailable at Full colour all keep their stated reasons; **A11 has no colour swatch row, so there is no “Base” row to rename and no “Inherit” choice to remove**. *Member buttons are conditional* and *the no-JavaScript notice* — **no design in A11 holds a form, a member button or a Portal link**: the one action in the category is a text link at the section-link treatment, and 10 Slim draws not even that.
16. **The no-JavaScript line is now written on every design.** Thirteen are identical with JavaScript off. **8 Marquee** quotes the registry: “The track renders as a static row, horizontally scrollable via `overflow-x: auto`; nothing moves.” — the pause button hidden, 2.2.2 met because nothing is moving. **9 Rail** quotes the registry too, with this design's stated refusal of the snap: “The slide track is a native horizontally-scrollable `scroll-snap` strip — fully usable, only dots and arrow buttons are hidden.”
17. **Nothing was renumbered** and no design was deleted. Fifteen designs, 1 to 15, no gaps.

### The three questions this pass raised, and the owner's rulings — 30 August 2026

**Nothing in this category is left open.**

1. **The free designs are 1 Row and 10 Slim** — *the two free designs are the owner's choice*. Shortlisted: 1 Row, 10 Slim, 3 Grid, 4 Boxed; **ruled 1 Row · 10 Slim**, one row across the page and one band under a hero — two different jobs, neither needing a photograph or a caption. The line at the head of this document is his answer, not a recommendation.
2. **The count split stands as drawn** — *item counts are a number picker*. **Ruled:** the five rows that decide how many marks are drawn are a number picker; the eight that divide a row into columns stay named words, as they do in the post grids and the tag collections. Nothing in the frames changes, and the reading is no longer flagged as mine.
3. **The editor records a logo's shape at upload and stores it on the item** — *CSS cannot see content*, and a Ghost template cannot measure an uploaded file either. **Ruled:** `shape` joins the item as an enum — Wide · Regular · Square — computed from the file's intrinsic ratio when the file is placed and re-computed when it is replaced, held beside `logo`, `logoDark`, `alt` and `url`. **It is never shown and never editable**: no design offers a control over it, the customer is never asked to judge a shape, and the template prints the class it is given. The two alternatives are refused on record: drawing every mark at one height loses settlement 2 and the wall stops reading level, and asking the site to pick a shape per logo gives twenty-four chances to break a wall. **ARCHITECT:** the upload path writes this value — the editor is the only place that has the image in hand.

### Confirmation

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** — fifteen designs, no gap created or closed, no number reused, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the required shape, and names **1 Row** and **10 Slim** — both of which exist in this category's roster. It is **the owner's own choice, ruled on 30 August 2026**, and the merge's only input.

— End of specification —
