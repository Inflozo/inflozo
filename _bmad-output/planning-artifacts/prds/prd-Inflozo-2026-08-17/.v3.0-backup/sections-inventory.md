---
title: Inflozo Section Inventory
status: normative companion to prd.md (same folder; no version pin — the PRD frontmatter carries the version)
updated: 2026-08-18
---

## Appendix A — Complete Section Inventory (normative)

**Totals: 34 categories · 485 variants (exact; per-category counts sum to 485) · 70 [Free].** The first two variants in every category are **[Free]** (68), plus **A29 #7 and A31 #10** — re-tiered so the author-archive binding context and the `private.hbs` compile target each have a Free option of their own (FR-G2). A30 takes **no** third re-tier: all 13 of its variants share one binding context and one compile target, so #1 and #2 already satisfy FR-G2 for that target. All others are Pro. Variant descriptors define the *structural* identity that FR-G5 protects.

**Placeable sections vs non-placeable treatments (normative carve-out):** 457 of the 485 are **placeable** — the user drags them onto a canvas (FR-D5/FR-D12). **28 are not placeable:** they are chosen elsewhere, apply once per project, and are excluded from the Section Picker rail, drag/reorder, the Layers panel, Variant Shuffle (FR-D13) and Site Remix (FR-D17). Every requirement that quantifies over "every variant" — FR-G1 launch deliverables, FR-G5 uniqueness, FR-G6 / NFR-6(a) render matrix, NFR-5 accessibility, the E14 gallery — still covers all 28, using the host context named here:

| Category | Count | Chosen where | Host context for the render matrix and the gallery |
|---|---|---|---|
| **A32** Paywall / Content CTA | 12 | Standalone **Paywall Template** editor — one design active per project | A gated `post.hbs`, rendered at the members-only cutoff via `partials/content-cta.hbs`; member state Anonymous and Free (FR-D16); live or sample tiers (FR-H6) |
| **A33** Koenig Card Treatments | 6 | Style group of Post Content Layout (A25) — one treatment active per project | A `post.hbs` fixture exercising every Koenig card type, styled by the emitted `cards.css` |
| **A34** Pagination Styles | 10 | Pagination style control on the designated main feed (FR-H2) | A paginated `index.hbs` whose main feed (A17 #1) has more than one page of posts |

**Universal controls (every section, not repeated below):** Background role (Swatch Row: Base/Surface/Accent/Contrast/Image), Vertical spacing (Compact/Comfortable/Spacious), Top divider (None/Line/Fade). These three are **outside** each category's declared `Controls:` line and are **exempt from FR-F3's ≈ 15-control cap** — the cap governs a category's own controls, so the effective per-section ceiling is ≈ 15 + 3. They are never Quick Controls. (Content width is governed by the Style Pack's site-width token — FR-E1/FR-F2 — not per section; the pack's **gutters** token has its own scale, **Tight/Normal/Loose**, matching A14's `gap` — never the per-section Vertical spacing labels.) Mode-scoped: Background role, per-mode image swap. Non-placeable treatments carry the universal controls only where they render as a block of their own (A32); A33 and A34 carry none.

**How to read a category declaration (FR-G3):** `Content:` is the category's `contentSchema`, `Controls:` its `controlSchema` in sidebar order, and `Data:` the FR-H2 Data control group wherever the category is feed-bearing. The **first 3–5 entries of the `Controls:` line are that category's Quick Controls** (FR-F3), in order; the rest fall into the Content / Layout / Style / Data accordions. **Shared content-model conventions:** `cta = {label, link}` uses the Link Picker; all images use the Image Picker; optional props marked `?`.

**`bindingContext` / `compileTarget` (FR-G3):** every category declares both, and Variant Shuffle (FR-D13), Site Remix (FR-D17) and the Section Picker (FR-D12) cycle and filter **only within matching values** — a placed instance never shuffles into a variant that binds a resource its template does not have, or that compiles into a different file. Groups 1–2 (A1–A16) are `bindingContext: none` and `compileTarget: any` (A7's tiers, A12's optional authors and A15's optional posts are Data-group opt-ins, not context changes), except the site-wide singletons A1–A3, which compile into `default.hbs` (FR-D5). Groups 3–5 declare theirs per category below; where variants inside one category differ — **A29** (tag vs author), **A31** (error vs private vs custom page) — the values are declared **per variant** and the Shuffle ring is partitioned accordingly. **A30** declares one value for all 13 of its variants (`custom-{name}.hbs`, page-backed) but still partitions its Shuffle ring by membership surface — signup / signin / member home. The context axes are FR-H7's: see `prd.md` Appendix B and `research-ghost-binding-contexts.md`.

**Member visibility (every CTA-bearing category — A2, A6, A22, A26):** a **show to (Everyone / Logged out / Free members / Paid members)** control, evaluated against `@member` on the live site and previewed via FR-D16. It adds no variants; it makes the whole existing CTA range member-aware, and it is how a member ask is placed on a canvas now that A32 is non-placeable.

### Group 1 · Structure & Chrome

**A1. Headers & Navigation (16)** — Used on `default.hbs` (site-wide).
Content: logo (auto `@site.logo`/title, overridable), nav (auto `@site.navigation` + manual items), cta?, search toggle, member links toggle. Controls: layout picker, sticky (None/Sticky/Sticky-shrink), nav alignment, CTA toggle, search toggle, member-links toggle. Data: `@site.navigation`, secondary nav, `@member` state swap (Sign in ↔ Account).
1. **Classic Left** [Free] — logo left, links right, optional CTA button end.
2. **Minimal Center** [Free] — centered logo above a centered link row.
3. **Split Nav** — links split left/right of a centered logo.
4. **Pill Float** — detached rounded pill bar floating over content.
5. **Double Decker** — slim utility bar (social/search) above main nav.
6. **Transparent Overlay** — sits over the first section, gains surface on scroll.
7. **CTA Forward** — oversized primary button, links de-emphasized.
8. **Underline Slide** — animated underline indicator on active/hover links.
9. **Boxed Container** — nav inside a bordered container edge-to-edge rule.
10. **Command Bar** — search-first field center, links compressed to sides.
11. **Sidebar Trigger** — hamburger on desktop opening a full-height drawer.
12. **Mega Search** — expanding full-width search takeover on focus.
13. **Members Aware** — avatar/account menu prominent when signed in.
14. **Borderline** — full-width bottom rule, generous whitespace, uppercase links.
15. **Mono Wordmark** — oversized text wordmark, links tucked far right.
16. **Tab Deck** — nav rendered as tabs attached to the section below.

**A2. Announcement Bars (15)** — Site-wide, above header.
Content: message (inline link support), cta?, dismiss toggle. Controls: layout picker, dismissible, rotation (for multi-message), show to (Everyone / Logged out / Free members / Paid members).
1. **Solid Accent** [Free] — accent band, message + arrow link.
2. **Slim Dismissable** [Free] — hairline bar with close affordance.
3. **Ticker Marquee** — continuously scrolling repeated message.
4. **Gradient Slide** — animated two-stop gradient background.
5. **Emoji Lead** — leading emoji slot with bold message.
6. **Countdown** — message + live countdown to a set date.
7. **Dual Action** — message left, two compact buttons right.
8. **Pill Floating** — detached rounded pill under the header.
9. **Rotating Messages** — up to 3 messages crossfading.
10. **Dark Contrast** — contrast-role band regardless of mode.
11. **Outline Ghost** — bordered transparent bar, understated.
12. **Link Arrow** — entire bar is one large link with animated arrow.
13. **Members Only** — renders only for signed-in members.
14. **Top Rounded** — rounded lozenge fused to top of viewport.
15. **Seasonal Confetti** — subtle animated particles behind message.

**A3. Footers (16)** — Site-wide.
Content: logo/wordmark, description?, link columns (manual + auto nav), social links, newsletter toggle, legal line, credit toggle (Pro-gated — FR-J15). Controls: layout picker, column count, social style (Icons/Labels), newsletter embed toggle, back-to-top toggle.
1. **Minimal Single Row** [Free] — wordmark left, links + social right, one line.
2. **Center Stack** [Free] — centered logo, links row, social, legal.
3. **Mega Grid** — 4–5 link columns + brand column with description.
4. **Newsletter Forward** — subscribe form dominates, links secondary.
5. **Big Wordmark** — oversized clipped site name as the footer's hero.
6. **Sitemap Columns** — dense multi-column directory with headings.
7. **Split Brand** — brand + blurb left half, link grid right half.
8. **CTA Capped** — full CTA band fused above a slim footer.
9. **Dark Contrast** — contrast-role footer in both modes.
10. **Rounded Card** — footer as an inset rounded card with margin.
11. **Border Grid** — visible hairline grid cells around each column.
12. **Social First** — large social tiles row, minimal links below.
13. **Gradient Fade** — background fades from page color to accent tint.
14. **Colophon** — "made with", fonts/credits, RSS, humane small print.
15. **Legal Slim** — single hairline row, ultra-minimal.
16. **Back-to-Top Tower** — right-edge vertical rail with top button + social.

### Group 2 · Marketing Sections

**A4. Heroes (18)** — Home, custom pages.
Content: eyebrow?, headline, subhead?, primary cta, secondary cta?, media (image?/none), badge?. Controls: layout picker, media side, text alignment, CTA arrangement, media frame (None/Rounded/Browser/Tilt).
1. **Center Stage** [Free] — centered stack: eyebrow, headline, subhead, dual CTAs.
2. **Split Editorial** [Free] — oversized headline left, feature image right, meta beneath.
3. **Image Backdrop** — full-bleed image, overlaid text with scrim control.
4. **Gradient Burst** — radial accent gradient behind centered copy.
5. **Feature Post Hero** — binds the latest featured post as the hero story.
6. **Portrait Intro** — author portrait beside personal-brand introduction (binds author).
7. **Newsletter Signup Hero** — headline + inline portal signup as the primary CTA.
8. **Big Type Manifesto** — headline at viewport scale, nothing else above the fold.
9. **Magazine Cover** — masthead-style: rules, kicker, cover image, issue meta.
10. **Offset Card** — copy card overlapping a bleeding background image.
11. **Stats Punch** — hero copy with a three-stat row fused beneath.
12. **Collage Grid** — copy beside a 3-image staggered collage.
13. **Typewriter Minimal** — monospace accent line with animated caret.
14. **Search Hero** — headline over a prominent site-search field.
15. **Logo Proof Hero** — hero with a trusted-by logo row fused below.
16. **Split Form** — copy left, standalone signup card right.
17. **Video Poster** — poster image with play affordance opening embed modal.
18. **Ticker Base** — hero with a scrolling tag/topic ticker along its base.

**A5. Features (16)** — Home, custom pages.
Content: heading?, intro?, items[] {icon?, image?, title, body, link?}. Controls: layout picker, columns (2/3/4), icon style (Line/Filled/Tile), item alignment, item count.
1. **Icon Grid** [Free] — 3-up grid of icon + title + body.
2. **Alternating Rows** [Free] — image/copy rows alternating sides.
3. **Bento Grid** — mixed-size tiles, one dominant feature cell.
4. **Checklist Split** — copy left, checkmarked benefits list right.
5. **Card Trio** — elevated cards with icon tiles and links.
6. **Big Icon Center** — one row of oversized icons, minimal text.
7. **Screenshot Spotlight** — large product image with annotated callouts.
8. **Accordion Features** — expandable feature list beside a static image.
9. **Tabs Showcase** — tabbed features swapping a shared media panel.
10. **Mini Cards Dense** — 6–8 compact cards, small icons, tight grid.
11. **Comparison Split** — "without / with" two-column contrast panel.
12. **Sticky Scroll** — sticky media panel while feature copy scrolls.
13. **Highlight Band** — single full-width feature banded in accent tint.
14. **Numbered Ledger** — oversized numerals with rule-separated rows.
15. **Illustration Rows** — spot-illustration slots beside short copy rows.
16. **Stat-Backed Cards** — each feature card carries a supporting stat.

**A6. CTA Banners (15)** — Any template.
Content: heading, subtext?, primary cta, secondary cta?, image?. Controls: layout picker, alignment, emphasis (Band/Card/Full-bleed), show to (Everyone / Logged out / Free members / Paid members).
1. **Accent Band** [Free] — full-width accent strip, heading + button.
2. **Boxed Border** [Free] — outlined card CTA on page background.
3. **Gradient Card** — rounded gradient card with dual CTAs.
4. **Split Action** — copy left, buttons right, single rule above.
5. **Big Type Center** — display-size ask with one oversized button.
6. **Image Side** — CTA card with flush image on one side.
7. **Floating Overlap** — card overlapping the sections above and below.
8. **Dark Invert** — contrast-role panel in both modes.
9. **Newsletter CTA** — portal signup embedded as the action.
10. **Dual Path** — two side-by-side option cards (e.g., read vs subscribe).
11. **Countdown CTA** — deadline timer beside the action.
12. **Slim Inline** — single-line CTA with arrow, near-invisible chrome.
13. **Full-Bleed Photo** — edge-to-edge image with scrimmed CTA copy.
14. **Testimonial-Backed** — quote + avatar fused above the ask.
15. **Emoji Punch** — playful oversized emoji beside short ask.

**A7. Pricing & Tiers (15)** — Home, custom pages, A30's membership pages (page-backed `custom-{name}.hbs`). **Binds live Ghost tiers** (`{{#get "tiers"}}`: names, monthly/yearly prices, currency, benefits).
Content: heading?, intro?, per-tier cta labels, footnote?. Controls: layout picker, billing toggle (Monthly/Yearly/Toggle), highlight tier select, benefit display (Checks/Plain), free-tier visibility. Data: live tiers or sample.
1. **Card Trio** [Free] — classic side-by-side tier cards.
2. **Minimal Table** [Free] — rule-lined table, prices right-aligned.
3. **Highlight Middle** — center card raised, accent-ringed, "popular" tag.
4. **Toggle Cards** — monthly/yearly segmented control swapping prices live.
5. **Single Plan Spotlight** — one paid tier, oversized, benefits split right.
6. **Feature Matrix** — tiers as columns over a feature-row grid.
7. **Free vs Paid Split** — two-panel contrast between free and premium.
8. **Benefits Checklist** — stacked wide rows, price right, checks left.
9. **Gradient Featured** — highlighted tier carries gradient fill.
10. **Border Cards** — flat outlined cards, no elevation, editorial.
11. **Dark Cards** — contrast-role cards on light page (and inverse).
12. **Founding Member** — scarcity-framed single card with member count line.
13. **FAQ-Attached** — pricing cards with a compact FAQ fused beneath.
14. **Stacked Ledger** — vertically stacked full-width tier rows.
15. **Comparison Wide** — full-width matrix with sticky tier header row.

**A8. Testimonials (15)**
Content: items[] {quote, name, role?, avatar?, rating?, link?}, heading?. Controls: layout picker, count, avatar toggle, rating toggle, motion (Static/Marquee/Carousel).
1. **Quote Grid** [Free] — 2×2/3-up quote cards.
2. **Single Spotlight** [Free] — one large centered quote with avatar.
3. **Marquee Scroll** — infinite horizontal drift, pause on hover.
4. **Masonry Wall** — variable-height quote wall.
5. **Big Pull Quote** — display-type quote with oversized quotation mark.
6. **Split Photo Quote** — portrait photo half, quote half.
7. **Card Carousel** — snap-scrolling cards with dots.
8. **Tweet Cards** — social-post styled cards with handles.
9. **Avatar Row** — compact strip: avatars + one rotating quote.
10. **Logos + Quotes** — company logo above each quote card.
11. **Star Cards** — rating-forward cards, quote secondary.
12. **Alternating Rail** — quotes alternating left/right down a center rule.
13. **Video Testimonial** — embed slot beside supporting pull quote.
14. **Inline Ribbon** — single-line quotes separated by dots, ticker-like.
15. **Case Teaser** — quote + metric + "read story" link card.

**A9. FAQ (15)**
Content: heading?, intro?, items[] {question, answer}, contact cta?. Controls: layout picker, columns (1/2), default state (First open/All closed/All open), divider style.
1. **Accordion Single** [Free] — classic single-column accordion.
2. **Two-Column Accordion** [Free] — accordion split across two columns.
3. **Split Sticky** — heading + contact sticky left, questions right.
4. **Open Grid** — all Q&As visible as cards, no interaction.
5. **Numbered List** — oversized numerals, rule-separated.
6. **Boxed Cards** — each Q&A an outlined expandable card.
7. **Minimal Rules** — hairline rows, plus/minus glyphs only.
8. **Category Tabs** — tabbed question groups.
9. **Chat Style** — Q as sent bubble, A as reply bubble.
10. **Icon Questions** — leading icon slot per question.
11. **Wide Accordion** — full-width rows with generous type scale.
12. **Dark Panel** — contrast-role panel container.
13. **Dense Compact** — small-type two-column reference style.
14. **Contact-Capped** — accordion with support CTA band fused below.
15. **Marquee Header FAQ** — scrolling "FAQ" display text above list.

**A10. Stats & Numbers (15)**
Content: heading?, items[] {value, label, sublabel?}, source note?. Controls: layout picker, count (2–4), count-up animation toggle, divider toggle.
1. **Big Number Row** [Free] — 3–4 display-size stats in a row.
2. **Card Stats** [Free] — stats in soft cards with labels.
3. **Split Narrative** — paragraph left, stat stack right.
4. **Gradient Numbers** — gradient-filled numerals.
5. **Bordered Grid** — hairline grid cells per stat.
6. **Count-Up Ticker** — animated counting on scroll into view.
7. **Inline Sentence** — stats embedded within a flowing sentence.
8. **Milestone Rail** — horizontal timeline of dated milestones.
9. **Bento Emphasis** — one hero stat tile + smaller tiles.
10. **Percent Bars** — labeled horizontal bars with values.
11. **Dark Band** — contrast strip with luminous numerals.
12. **Icon Stats** — icon above each value.
13. **Compact Strip** — single slim row, dot-separated.
14. **Photo-Backed** — stats overlaid on a scrimmed image.
15. **Circle Rings** — ring-progress glyphs beside values.

**A11. Logo Walls (15)**
Content: heading?, logos[] {image, link?}. Controls: layout picker, treatment (Grayscale/Original/Mono-invert), motion (Static/Marquee/Dual-marquee), density.
1. **Grayscale Row** [Free] — single centered row, muted logos.
2. **Grid Bordered** [Free] — logo cells in a hairline grid.
3. **Marquee Loop** — continuous single-direction drift.
4. **Dual Rows Offset** — two counter-scrolling rows.
5. **Center Statement** — "Trusted by" line flanked by logos.
6. **Pill Chips** — logos inside rounded chips.
7. **Card Tiles** — elevated tiles, hover lift.
8. **Fade Edges** — row with soft gradient masks at edges.
9. **With Metric** — logos plus one proof stat.
10. **Sparse Airy** — 3–4 large logos, maximal whitespace.
11. **Framed Box** — logos inside one outlined container with label tab.
12. **Category Grouped** — labeled logo clusters.
13. **Mono Invert** — solid-color logo treatment on accent band.
14. **Compact Inline** — small logos inline with body-size caption.
15. **Checker Grid** — alternating filled/empty cells pattern.

**A12. About & Team (15)**
Content: heading?, body, images[], team[] {name, role, image, link?}?, values[]?. Controls: layout picker, team columns, portrait shape (Square/Rounded/Circle), values toggle. Data: optional bind team to Ghost authors.
1. **Founder Letter** [Free] — signed letter layout with portrait.
2. **Team Grid** [Free] — uniform portrait cards with roles.
3. **Portrait Split** — large portrait half, story half.
4. **Timeline Story** — dated vertical company story.
5. **Values Cards** — icon + value cards trio.
6. **Photo Collage** — staggered image cluster beside copy.
7. **Mission Big Type** — display-scale mission statement.
8. **Team Masonry** — varied-size portraits wall.
9. **Author Bind Grid** — team auto-populated from Ghost authors.
10. **Culture Gallery** — candid photo strip with caption copy.
11. **Split Manifesto** — numbered beliefs beside sticky heading.
12. **Stats-Backed About** — story with fused stat row.
13. **Quote-Led About** — founder quote as the opener.
14. **Compact Bio List** — text-only rows: name, role, one-liner.
15. **Hiring Capped** — about section ending in a join-us band.

**A13. Process / How It Works (15)**
Content: heading?, steps[] {title, body, icon?/image?}, cta?. Controls: layout picker, step count (3–5), numbering style (Numerals/Dots/Icons), connector (Line/Arrow/None).
1. **Numbered Row** [Free] — 3-up numbered columns.
2. **Vertical Timeline** [Free] — stacked steps on a spine.
3. **Alternating Steps** — zigzag left/right along center line.
4. **Card Steps** — elevated step cards with badges.
5. **Arrow Flow** — chevron-connected horizontal flow.
6. **Sticky Progress** — sticky step list left, media right per step.
7. **Bento Steps** — steps as mixed-size tiles.
8. **Illustrated Steps** — image slot per step, copy beneath.
9. **Tabbed Stages** — steps as tabs with shared detail panel.
10. **Checklist Journey** — progressive checkmarked path.
11. **Circle Badges** — oversized circled numerals, minimal copy.
12. **Minimal Ledger** — hairline rows, numeral left, copy right.
13. **Split Detail** — step selector left, expanded detail right.
14. **Path Curve** — steps along a drawn curved path (SVG).
15. **Compact Tri-Step** — one-line 1-2-3 strip for tight pages.

**A14. Galleries (15)**
Content: heading?, images[] {image, caption?, link?}. Controls: layout picker, columns, gap (Tight/Normal/Loose), lightbox toggle, aspect (Natural/Square/Wide).
1. **Uniform Grid** [Free] — equal cells, optional lightbox.
2. **Masonry** [Free] — natural-height column flow.
3. **Filmstrip Scroll** — horizontal snap strip.
4. **Collage Feature** — one hero image + supporting cluster.
5. **Full-Bleed Rows** — alternating full-width images.
6. **Caption Cards** — image cards with visible captions.
7. **Polaroid Scatter** — rotated framed prints look.
8. **Hover Zoom Grid** — scale-on-hover tight grid.
9. **Split Scroll** — sticky copy beside scrolling image column.
10. **Two-Tone Frames** — accent mat frames around images.
11. **Square Social** — 1:1 grid, dense, social-wall feel.
12. **Wide Banner Strip** — single row of ultrawide crops.
13. **Bento Mixed Ratio** — mixed-aspect tiles composition.
14. **Rounded Tiles** — heavily rounded corner treatment grid.
15. **Numbered Exhibits** — gallery with exhibit numerals + captions.

**A15. Video & Embeds (15)**
Content: heading?, embed url(s), poster image?, caption?, copy?. Controls: layout picker, aspect (16:9/4:3/1:1/9:16), frame (None/Rounded/Browser/Device), autoplay-muted toggle (where allowed). Data: the episode variants (#5, #6) bind posts via the FR-H2 Data group (Source **By tag**) — `{{#get}}`-driven, fixed Count, never paginated.
1. **Cinema Center** [Free] — single centered player, generous margins.
2. **Split Video Copy** [Free] — player beside heading + copy + CTA.
3. **Poster Modal** — poster + play button opening modal player.
4. **Playlist Grid** — 2×2 grid of embeds with titles.
5. **Episode List** — post-bound rows styled as episodes (e.g., tag `#podcast`).
6. **Podcast Player Row** — audio embed rows with episode meta.
7. **Floating Frame** — player in browser-chrome mockup, tilted.
8. **Background Poster Band** — full-bleed poster with center play.
9. **Dual Videos** — two players side by side with labels.
10. **Caption Side** — player with vertical caption rail.
11. **Full-Bleed Embed** — edge-to-edge player, no chrome.
12. **Testimonial Video** — player beside pull-quote card.
13. **Device Mock** — player inside phone/laptop frame.
14. **Numbered Series** — vertically stacked players with part numerals.
15. **Sticky Mini Row** — compact horizontal scroll of small players.

**A16. Contact (15)** — (No form backend in Ghost: actions compile to email links, portal actions, or an external form/calendar embed URL control.)
Content: heading, body?, email, socials[], locations[]?, embed url?. Controls: layout picker, action type (Email button/Embed), social style, hours/info toggles.
1. **Center Card** [Free] — heading + email button + socials.
2. **Split Info** [Free] — copy left; contact details stack right.
3. **Big Email Type** — the email address as display-size link.
4. **Info Columns** — email / social / address columns.
5. **Embed Split** — copy beside external form or calendar embed.
6. **Map Side** — static map image beside contact details.
7. **Office Cards** — location cards with details.
8. **Dark Panel** — contrast contact card.
9. **FAQ + Contact** — mini-FAQ with contact rail.
10. **Social Grid** — large social tiles as the primary actions.
11. **Support Tiers** — "for X contact Y" routed options cards.
12. **Split Photo** — team/office photo half, contact half.
13. **Compact Banner** — slim one-row contact strip.
14. **Community Links** — Discord/forum/newsletter option cards.
15. **Signature Close** — letter-style sign-off with contact line.

### Group 3 · Ghost Content Sections

**A17. Post Grids (18)** — Home, tag/author archives, custom pages. `bindingContext: posts` · `compileTarget: any` (native paginated context on collection templates, `{{#get}}` elsewhere — FR-H2).
Content: post-bound per `prd.md` Appendix B — card fields: feature image, title, excerpt, date, author, reading time, primary tag; static: heading?, intro?, empty-state line. Controls: layout picker, columns (2/3/4), image aspect (Natural/Square/Wide/None), excerpt length (Short/Long/Off), card frame (None/Border/Elevated), meta position (Above title/Below title). Data: group per FR-H2 (+ **Pagination style** — A34 — on the designated main feed only).
1. **Classic Cards** [Free] — 3-col image-top cards with meta row.
2. **Minimal Title Grid** [Free] — text-only cards: tag, title, date.
3. **Magazine Mixed** — one lead story + 2×2 grid beside/below.
4. **Bento Editorial** — mixed-size tiles, first post dominant.
5. **Overlay Cards** — image-filled cards, scrimmed text overlay.
6. **Horizontal Cards** — thumb-left rows in a 2-col grid.
7. **Masonry Feed** — natural-height card flow.
8. **Numbered Ranked** — oversized ranking numerals per card.
9. **Wide Duo** — 2-col large cards with generous imagery.
10. **Dense Four** — compact 4-col grid, tight meta.
11. **Serif Editorial** — rules + serif titles, imagery restrained.
12. **Gradient Hover** — accent gradient reveal on hover.
13. **Frame Border** — outlined cards, flat, gallery-like.
14. **Photo Square** — 1:1 imagery, title beneath, minimal meta.
15. **Tag-Chip Cards** — prominent tag chips atop each card.
16. **Meta-Rich Rows** — grid of cards with full meta stack visible.
17. **Alternating Size** — A-B-B rhythm of large and small cards.
18. **Spotlight Rail** — first post as tall rail beside a stacked list.

**A18. Post Lists (15)** — Same binding as A17; list-form. `bindingContext: posts` · `compileTarget: any`.
Content: post-bound per A17's card model — title, excerpt, date, author, reading time, primary tag, feature image (as thumbnail); static: heading?, intro?, empty-state line. Controls: layout picker, thumbnail (Off/Small/Large), excerpt length (Short/Long/Off), row divider (None/Line/Space), group headers (Off/Month/Year), meta lead (Date/Reading time/Tag). Data: group per FR-H2 (+ **Pagination style** — A34 — on the designated main feed only).
1. **Editorial Rules** [Free] — full-width rows separated by hairlines.
2. **Thumb Left** [Free] — small image, title + excerpt right.
3. **Big Date** — oversized date column beside titles.
4. **Minimal Index** — title + date only, maximal restraint.
5. **Excerpt Rich** — generous excerpts with reading time.
6. **Numbered Archive** — index numerals down the margin.
7. **Month Grouped** — sticky month/year group headers.
8. **Two-Column Index** — dense split-column title list.
9. **Hover Reveal** — image appears beside title on hover.
10. **Card List** — full-width soft cards stacked.
11. **Serif Journal** — literary type, drop rules, dates in margin.
12. **Split Date Rail** — vertical date rail left of entries.
13. **Reading-Time Focus** — time-to-read as the leading meta.
14. **Compact Dense** — small type, many posts, archive-grade.
15. **Letterhead Rows** — tag eyebrow above each title row.

**A19. Featured & Spotlight (15)** — Binds featured or hand-picked posts. `bindingContext: posts` · `compileTarget: any`.
Content: post-bound — feature image, title, excerpt, primary tag, author, date, reading time; static: eyebrow?, heading?, badge label?, cta?. Controls: layout picker, image treatment (Fill/Contain/Scrim), excerpt toggle, meta toggles (date, author, reading time, tag chip), badge toggle, cta toggle. Data: group per FR-H2 with Source defaulting to **Featured** — `{{#get}}`-driven, fixed Count, never the main feed and never paginated.
1. **Full-Bleed Spotlight** [Free] — edge-to-edge image, overlaid title.
2. **Split Feature** [Free] — image half, title/excerpt/CTA half.
3. **Card Overlap** — text card overlapping the feature image.
4. **Cover Carousel** — snap carousel of featured covers.
5. **Dual Feature** — two equal spotlights side by side.
6. **Trio Spotlight** — one large + two stacked features.
7. **Big Serif Feature** — display serif title above wide image.
8. **Sticky Feature** — sticky spotlight beside scrolling list.
9. **Gradient Panel** — feature inside accent-gradient panel.
10. **Editor's Pick** — badge-led compact feature card.
11. **Quote Feature** — pull-quote from the post as the hook.
12. **Photo Left Ledger** — image left, oversized numeral, meta ledger.
13. **Magazine Splash** — kicker + deck + byline, cover-story layout.
14. **Boxed Feature** — outlined containment with inner padding rhythm.
15. **New Badge Marquee** — "Latest" ticker above the spotlight.

**A20. Tag Collections (15)** — Binds tags (name, description, accent color, feature image, post count) and their posts. `bindingContext: tags` (+ `posts` on the variants that show them) · `compileTarget: any`.
Content: tag-bound per `prd.md` Appendix B — name, description, accent color, feature image, `count.posts`, url; static: heading?, intro?, per-tag label overrides?. Controls: layout picker, columns/density, count badge toggle, description toggle, tag image toggle, tag-accent tint toggle (uses the tag's own accent color when set). Data: tag source (All / Hand-picked / Visible only), Count, Order (Post count / Alphabetical / Newest); the per-tag post rows (#3, #14) use the FR-H2 Data group — `{{#get}}`-driven, never paginated.
1. **Tag Pill Cloud** [Free] — wrapped pills with counts.
2. **Tag Cards Grid** [Free] — image cards per tag with counts.
3. **Featured Tag Rows** — per-tag heading + horizontal post row.
4. **Topic Tabs** — tabbed tags swapping a post grid.
5. **Big Tag Index** — display-type tag list with counts.
6. **Tag Bento** — mixed-size tag tiles using tag colors.
7. **Curated Collections** — hand-picked tag sets with descriptions.
8. **Tag Banner Cards** — wide banner card per tag with image.
9. **Horizontal Scroller** — snap-scrolling tag chips rail.
10. **Numbered Topics** — ranked topic list with counts.
11. **Split Tag Nav** — sticky tag list left, posts right.
12. **Dark Tag Tiles** — contrast tiles with luminous names.
13. **Accent Underline List** — tags as underlined display links.
14. **Tag + Latest** — each tag chip paired with its newest title.
15. **Mosaic Wall** — dense mosaic of tag images.

**A21. Author Showcases (15)** — Binds authors (name, bio, portrait, cover, socials, post count). `bindingContext: authors` (+ `posts` on the variants that show them) · `compileTarget: any`.
Content: author-bound per `prd.md` Appendix B — name, bio, profile image, cover image, website/twitter/facebook, `count.posts`, url; static: heading?, intro?, role labels?. Controls: layout picker, columns, portrait shape (Square/Rounded/Circle), bio toggle, socials toggle, post-count toggle. Data: author source (All / Hand-picked), Count, Order (Post count / Alphabetical); the per-author post rows (#5) use the FR-H2 Data group — `{{#get}}`-driven, never paginated.
1. **Author Cards** [Free] — portrait cards with role/bio line.
2. **Byline Rows** [Free] — list rows: portrait, name, bio, count.
3. **Single Spotlight** — one author, large portrait + bio + links.
4. **Masthead** — magazine-style contributor masthead columns.
5. **Author + Latest** — each author with their newest posts row.
6. **Circle Row** — circular portraits strip with hover names.
7. **Split Interview** — portrait beside Q&A-styled intro.
8. **Contributor Wall** — dense portrait mosaic.
9. **Author Bento** — featured author tile + smaller tiles.
10. **Featured Band** — accent band showcasing one author.
11. **Social Cards** — cards leading with social links.
12. **Editorial Board** — formal two-column name/role listing.
13. **Compact Chips** — inline avatar chips paragraph-embedded.
14. **Cover Cards** — author cover image cards, portrait inset.
15. **Alphabet Index** — grouped alphabetical contributor index.

**A22. Newsletter / Subscribe (16)** — Portal-bound (`data-portal` signup); members-aware (hides/swaps for members via FR-D16 preview). `bindingContext: none` (+ `@member`; `tiers` on #8) · `compileTarget: any`.
Content: heading, subtext?, button label, proof line?, frequency badge?. Controls: layout picker, alignment, portal action (signup / signup/{tier} / upgrade), show to (Everyone / Logged out / Free members / Paid members), proof-line toggle, frequency-badge toggle, signed-in swap (Hide section / Show account link). Data: #7 Issue Preview uses the FR-H2 Data group (Source **By tag**) — `{{#get}}`-driven, never paginated.
1. **Center Card** [Free] — rounded card: heading, subtext, button.
2. **Inline Slim Bar** [Free] — single-row band with button.
3. **Split Benefit** — copy + benefit checks left, action right.
4. **Gradient Card** — accent-gradient card, on-accent text.
5. **Big Type Ask** — display headline, oversized button.
6. **Social Proof** — subscriber/proof line with avatar cluster.
7. **Issue Preview** — recent newsletter posts beside signup.
8. **Free vs Paid Path** — dual cards routing to signup tiers.
9. **Boxed Border** — outlined flat panel, editorial tone.
10. **Dark Invert** — contrast panel with luminous button.
11. **Frequency Promise** — "Every Sunday" badge-led card.
12. **Testimonial-Backed** — reader quote above the ask.
13. **Floating Pill** — pill-shaped compact ask, mid-content friendly.
14. **Paper Fold** — letter/envelope visual metaphor card.
15. **Footer Band** — full-width band designed to sit above footers.
16. **Emoji Fun** — playful emoji + short ask, casual tone.

**A23. Search (15)** — Styled triggers for Ghost native search; "Custom Overlay" variants implement in-theme search UI via client-side Content API. `bindingContext: none` (Custom Overlay variants read `posts`/`tags` client-side) · `compileTarget: any`.
Content: trigger label?, placeholder, heading?, helper text?, popular tag chips? (#5); results, empty and no-result strings are chrome strings from the Translations catalog (FR-Q6) on the Custom Overlay variants only — native-trigger variants inherit Ghost's own overlay strings, which the catalog cannot reach. Controls: layout picker, field size (Compact/Large), placeholder text, popular-tags toggle, recent-posts toggle (#13), tag-filter toggle (Custom Overlay variants). Data: Custom Overlay variants query the Content API client-side (FR-H4) inside NFR-2's JS budget; native-trigger variants bind nothing.
1. **Modal Trigger Bar** [Free] — full-width faux input opening native search.
2. **Icon Trigger** [Free] — icon button for nav/hero placement.
3. **Hero Search** — display heading over large search field.
4. **Command Palette** — ⌘K-styled trigger with key hint.
5. **Search + Popular Tags** — field with suggested tag chips.
6. **Rounded Pill Big** — oversized pill field, centered.
7. **Minimal Underline** — borderless underlined field.
8. **Sticky Band** — slim sticky search strip.
9. **Custom Overlay Classic** — full overlay, live results list.
10. **Custom Overlay Split** — overlay with results + tag filters.
11. **Boxed Card** — search card with helper text.
12. **Dark Overlay** — contrast overlay treatment.
13. **Search + Recent** — field with latest posts beneath.
14. **Inline Expand** — icon expanding into field on focus.
15. **Zero-State Art** — overlay with playful empty/no-results states.

### Group 4 · Template-Specific Sections

**A24. Post Headers (16)** — `post.hbs` (and `page.hbs` where applicable). Binds title, excerpt, feature image (+alt/caption), tag, authors, date, reading time. `bindingContext: post` (opened inside `{{#post}}` — FR-H7) · `compileTarget: post.hbs, page.hbs`.
Content: post/page-bound per `prd.md` Appendix B — title, custom excerpt, feature image + alt + caption, primary tag, authors, published date, reading time; static: kicker/eyebrow?, breadcrumb labels? (#16). Controls: layout picker, feature image (Show/Hide), image treatment (Fill/Contain/Scrim), title alignment, meta row toggles (date, author, reading time, tag chip — the whole row is hidden on `page.hbs` per the Synthesis Defaults), excerpt/standfirst toggle, reading-progress toggle (#15).
1. **Classic Center** [Free] — tag, title, meta, image below.
2. **Split Meta** [Free] — title left, meta column right, image under.
3. **Full-Bleed Cover** — edge-to-edge image, title overlaid.
4. **Overlay Bottom** — image with title panel rising from base.
5. **Serif Editorial** — big serif title, hairline rules, restrained image.
6. **Minimal No-Image** — typographic header ignoring feature image.
7. **Gradient Wash** — accent gradient behind centered title.
8. **Boxed Title Card** — title card overlapping cover image.
9. **Wide Below** — compact title block, ultrawide image beneath.
10. **Tag Eyebrow** — colored tag chip leading a left-aligned stack.
11. **Author Forward** — portrait + author line above title.
12. **Journal Left** — left-aligned literary layout, date in margin.
13. **Magazine Deck** — kicker + title + standfirst deck.
14. **Offset Image** — image offset right, title wrapping space.
15. **Progress Attached** — header emitting a reading-progress bar.
16. **Breadcrumb Trail** — home/tag breadcrumb above title.

**A25. Post Content Layouts (12)** — Wraps `{{content}}`. `bindingContext: post` · `compileTarget: post.hbs, page.hbs`.
Content: the post/page body via `{{content}}` — no editable content props (the body is authored in Ghost, never in Inflozo); static: aside/callout label? (#12). Controls: measure (Narrow/Comfort/Wide) (reading-column layout choice — distinct from the removed universal width control), TOC (Off/Left/Right, auto-hidden < 3 headings), share rail toggle, drop cap toggle, type scale (Normal/Large), Koenig treatment (A33 — Style group; project-level, one treatment per project).
1. **Narrow Classic** [Free] — ~680px measure, canonical blog reading.
2. **Comfort Wide** [Free] — ~760px with larger media breakouts.
3. **TOC Left** — sticky table of contents rail left.
4. **TOC Right** — sticky TOC right with scroll-spy.
5. **Share Rail** — floating share/copy rail alongside content.
6. **Drop Cap Serif** — literary opener with drop cap.
7. **Docs Style** — wider measure, anchored headings, tight lists.
8. **Newsletter Tight** — email-like narrow rhythm.
9. **Photo Essay** — full-bleed image cards, captions styled large.
10. **Focus Reader** — enlarged type, dimmed chrome, max legibility.
11. **Pull-Quote Wide** — quotes break out beyond the measure.
12. **Split Aside** — content with styled aside/callout margin column.

**A26. Post Footers (15)** — Below content on `post.hbs`. `bindingContext: post` · `compileTarget: post.hbs`.
Content: post-bound — authors (portrait, bio, links, more-by), tags, previous/next post, related posts; static: heading?, cta?, disclosure text? (#13), sign-off line? (#14). Controls: layout picker, author bio toggle, tag chips toggle, share row toggle, prev/next toggle, newsletter/CTA block toggle, show to (Everyone / Logged out / Free members / Paid members). Data: the related and series rows (#5, #12) use the FR-H2 Data group — `{{#get}}` by primary tag, fixed Count, never paginated.
1. **Author Bio Card** [Free] — portrait, bio, links, more-by link.
2. **Tags + Share Row** [Free] — tag chips left, share buttons right.
3. **Bio + Next/Prev** — author card above prev/next pair.
4. **Newsletter Close** — subscribe card as the article close.
5. **Related Trio Fused** — compact related grid within footer.
6. **Big Next Article** — oversized next-post banner.
7. **Support CTA** — membership/upgrade ask close.
8. **Minimal End Rule** — end-mark glyph + hairline, nothing else.
9. **Comments Lead-In** — styled divider inviting to comments.
10. **Share Band** — full-width share strip with copy-link.
11. **Author Split Wide** — bio half, author's recent posts half.
12. **Series Nav** — same-tag series prev/next with positions.
13. **Sponsor Note** — styled disclosure/sponsor block.
14. **End Flourish** — decorative sign-off with signature line.
15. **Stacked Combo** — bio + tags + newsletter in one rhythm.

**A27. Related Posts (12)** — `{{#get}}` by primary tag with fallback to latest. `bindingContext: post` (+ the `posts` the `{{#get}}` block yields) · `compileTarget: post.hbs`.
Content: post-bound cards — feature image, title, excerpt, date, reading time, primary tag; static: heading? (default "Read next" — chrome string, FR-Q6). Controls: layout picker, columns, image toggle, excerpt toggle, meta toggles (date, reading time, tag chip), heading text. Data: group per FR-H2 with Source fixed to **primary tag → latest fallback** (built-in) and Count default **3** — `{{#get}}`-driven, never paginated (the post context has no pagination).
1. **Trio Cards** [Free] — 3-up related cards.
2. **Read Next Banner** [Free] — single full-width next suggestion.
3. **Prev/Next Pair** — two large directional cards.
4. **Same-Tag Rail** — horizontal snap rail of related.
5. **Grid Four** — compact 4-up grid.
6. **Minimal Titles** — text-only related list.
7. **Thumb List** — small-image stacked list.
8. **Editorial Pair** — two serif-styled features.
9. **Carousel Row** — arrowed card carousel.
10. **Sidebar Match** — column list styled to TOC layouts.
11. **Discover Shuffle** — randomized picks with refresh glyph.
12. **Continue Sticky** — slide-in next-article card near page end.

**A28. Comments (10)** — Wrappers for `{{comments}}` (Ghost native). `bindingContext: post` (+ `@site.comments_enabled`) · `compileTarget: post.hbs`.
Content: count heading label and the signed-out explainer (#9) — chrome strings from the Translations catalog (FR-Q6); the thread itself is Ghost's native `{{comments}}` output and carries no Inflozo content props. Controls: layout picker, count header toggle, header size (Normal/Display), width (Match content measure / Full width), signed-out note toggle. Data: none — comments are not exposed by the Content API, so the canvas renders a placeholder thread (FR-H3) and the live thread is Ghost's.
1. **Card Panel** [Free] — comments inside a soft panel with count header.
2. **Minimal Thread** [Free] — bare native comments, matched typography.
3. **Toggle Reveal** — "Show comments (n)" button expanding thread.
4. **Rule-Lined** — hairline-framed discussion block.
5. **Dark Panel** — contrast container treatment.
6. **Rounded Surface** — heavy-radius surface card.
7. **Narrow Matched** — width-locked to content measure.
8. **Wide Board** — full-width discussion area.
9. **Members Note** — signed-out explainer + signup nudge above.
10. **Count Header Big** — display-size count heading treatment.

**A29. Archive Headers (14)** — `tag.hbs` / `author.hbs` heads; bind tag or author objects + post counts. **`bindingContext` per variant** — `tag`: #1, #3, #4, #5 · `author`: #2, #7, #8, #9 · either: #6, #10, #11, #12, #13, #14; `compileTarget` follows (`tag.hbs` / `author.hbs`). Shuffle and Site Remix cycle only inside the placed instance's context, so an author archive never lands on a tag-bound design.
Content: tag-bound (name, description, accent color, feature image, `count.posts`) or author-bound (name, bio, profile image, cover image, socials, `count.posts`) per the variant's context; static: eyebrow?, breadcrumb labels? (#14). Controls: layout picker, cover/backdrop image toggle, description/bio toggle, post-count toggle, socials toggle (author context), tag-accent tint toggle (built-in on #1 — uses the tag's own accent color when set), filter/sort strip toggle (#13).
1. **Tag Banner** [Free] — tag name, description, count on tinted band (uses tag accent color when set).
2. **Author Split** [Free] — portrait left, name/bio/socials right.
3. **Tag Cover** — tag feature image backdrop with overlay.
4. **Minimal Tag Title** — display-type tag name + count only.
5. **Tag Description Split** — name left, long description right.
6. **Count Badge** — oversized post-count numeral treatment.
7. **Author Hero** [Free] — cover image, overlapping portrait, bio.
8. **Author Minimal** — byline-style compact header.
9. **Author Cover Card** — portrait card floating on cover.
10. **Gradient Band** — accent gradient archive band.
11. **Boxed Card** — archive identity in outlined card.
12. **Dark Band** — contrast header band.
13. **Filter Bar Attached** — header with sort/paging strip fused.
14. **Breadcrumbed** — home / archives trail above title.

**A30. Members Pages (13)** — full-page membership designs; tier-bound; portal-wired. Ghost 6 has **no members template family**: the `signup.hbs` / `signin.hbs` / `account.hbs` trio under a `members` directory does not exist and never renders — that path is a fossil of the archived Lyra theme's own `routes.yaml` (`research-ghost-membership-pages.md` §9/§12). Each design is an ordinary **Ghost Page** whose template the user picks from the **Template dropdown** in Ghost's page editor — no `routes.yaml`, no Ghost Admin routing step. `bindingContext: tiers` + `@member` · `compileTarget: custom-{name}.hbs` (theme root, never a subdirectory; the filename becomes the dropdown label, title-cased — `custom-membership.hbs` → "Membership" — and is a frozen public API of the emitted theme once shipped). The stored `custom_template` survives a page rename; a slug-derived `page-{slug}.hbs` silently stops applying and outranks the user's own choice, so it is never emitted (`research-ghost-membership-pages.md` §0/§1/§2). Shuffle and Site Remix must not move an instance across the signup / signin / member-home boundary. **Paid CTAs gate on `@site.paid_members_enabled`, never on tier presence** — Ghost seeds a $5/mo "Default Product" tier at install, so a site that cannot take payment still returns a priced tier and would otherwise ship a dead buy button (§6). **Signin seam:** the form itself is themeable (`data-members-form="signin"`), but the one-time-code step hands off to a Portal modal Inflozo cannot design (§10).
Content: tier-bound per FR-H6 (`{{#get "tiers"}}` — names, prices, currency, benefits; sample tiers when unlinked); static: heading, subtext?, benefit lines?, helper/legal line?, **sent-state copy** — the designed `.success` state of the on-page `data-members-form` (heading, body, resend link), carried by every signup and signin variant (#1–#10); this is where the former "Magic-Link Sent" design now lives, as a form state rather than a page, because Ghost routes no URL to it; cta labels (portal actions signup / signin / signup/{tier} / account / `account/plans` / `account/profile` / `account/newsletters` via the Link Picker, plus `data-members-signout` for sign out — **`upgrade` is not a Portal action**: it falls through to Portal's default screen despite Ghost's own Source theme shipping `data-portal="upgrade"`, so #13 and every upsell CTA emit `account/plans` (§4/§12)). Controls: layout picker, tier display (Cards/List/Off), billing toggle (Monthly/Yearly/Toggle), benefits display (Checks/Plain), brand panel toggle, helper links toggle, sent-state preview, newsletter-preferences toggle (#11 only).
1. **Signup Center Card** [Free] — brand, benefits, tier cards, free CTA.
2. **Signin Minimal** [Free] — logo + email portal action, calm page.
3. **Signup Split Benefit** — benefits/testimonial half, tiers half.
4. **Signup Tiers Inline** — horizontal tier row under hero ask.
5. **Signup Gradient** — accent-gradient backdrop, floating card.
6. **Signup Dark** — contrast-mode auth aesthetic.
7. **Signup Testimonial** — reader quote flanking the form card.
8. **Signup Compact Modal-Style** — small centered card, blurred site behind.
9. **Signin Card** — bordered card with helper links.
10. **Signin Split** — brand statement half, action half.
11. **Member Home** — greeting, plan badge and status from `@member`; every action (email, newsletters, plan, sign out) hands off to Portal — display-only, never an editable account panel, and no protected URL or logged-out redirect (§10).
12. **Benefits Page** — marketing-grade membership explainer + tiers.
13. **Upgrade Spotlight** — free→paid upsell page with comparison, upgrade CTA on `account/plans`.

**A31. Error & Utility (10)** — `error.hbs` + special pages. **`compileTarget` per variant** — `error.hbs`: #1–#5 · `private.hbs`: #10 · custom page templates (FR-I3): #6, #7, #9 · the empty state of a collection template: #8. `bindingContext`: `error` (`statusCode`, `message`, `errorDetails` — `research-ghost-binding-contexts.md` §10) for #1–#5, `private` (`{{#if error}}` / `error.message` only — `research-ghost-binding-contexts.md` §11) for #10, `none` for the utility pages. Shuffle and Site Remix never move an instance to a different compile target.
Content: on every `error.hbs` variant the numeral **and** the message are bound to the error context — `{{statusCode}}` and `{{message}}`, never a literal status — so one `error.hbs` serves 404, 500 and every other status (FR-I1 emits no `error-404.hbs`/`error-4xx.hbs`); static: supporting line?, home-link label?, illustration slot?. On #10 the password form plus its `{{#if error}}` feedback line. On #6/#7/#9 ordinary static page content (heading, body, cta?, portal signup?). Controls: layout picker, numeral display (Display/Compact/Hidden), supporting line (Off/Custom copy beneath the bound message), home-link toggle, search toggle, popular-posts toggle, illustration toggle. Data: the popular-posts block (#4) uses the FR-H2 Data group — `{{#get}}`-driven, fixed Count, never paginated.
1. **Minimal Type** [Free] — bound numeral at display scale, one-line message, home link.
2. **Search Recovery** [Free] — bound message above a search field and popular tags.
3. **Playful Scene** — illustrated scene wrapped around the bound numeral.
4. **Popular Posts** — bound message above a grid of top content.
5. **Calm Reassurance** — low-chroma type-only treatment, no recovery links.
6. **Coming Soon** — pre-launch page with subscribe.
7. **Maintenance** — brief downtime page.
8. **Empty Tag State** — "nothing here yet" archive state.
9. **Subscribe Success** — welcome-aboard confirmation page.
10. **Private Site Gate** [Free] — styled password-access page.

### Group 5 · Ghost Native Elements

**A32. Paywall / Content CTA (12)** — **Non-placeable treatment** (see the carve-out above): the 12 designs are selectable inside the standalone **Paywall Template** editor, one active per project, and the compiler emits the chosen design as `partials/content-cta.hbs` — the override point Ghost renders inline at the members-only divider the user placed in the Ghost editor (`research-ghost-binding-contexts.md` §16). Tier-bound; portal-wired. A flagship differentiator. `bindingContext: post` + `tiers` + `@member` · `compileTarget: partials/content-cta.hbs` (rendered from `post.hbs`).
Content: tier-bound per FR-H6 (names, prices, currency, benefits; sample tiers when unlinked); static: heading, subtext?, benefit lines?, cta labels (portal actions signup / signup/{tier} / upgrade). Controls: design picker (the 12 below), tier display (Cards/List/Off), billing toggle (Monthly/Yearly/Toggle), benefits display (Checks/Plain), preview treatment (None/Fade/Blur), progress meter toggle (#12) — plus the universal controls, since the paywall renders as a block of its own.
1. **Fade + Card** [Free] — content fades into an upgrade card.
2. **Hard Stop Card** [Free] — clean rule, centered unlock card.
3. **Split Benefits** — benefits checklist beside tier CTA.
4. **Tier Cards Inline** — full tier cards at the cutoff.
5. **Minimal Lock Line** — single elegant line + button.
6. **Dark Lock Panel** — contrast unlock moment.
7. **Testimonial Unlock** — member quote powering the ask.
8. **Dual Path** — free-signup vs paid-upgrade cards.
9. **Big Type Ask** — display-size "keep reading" statement.
10. **Blurred Preview** — blurred next-paragraphs behind card.
11. **Checklist Compact** — tight benefits + single CTA row.
12. **Progress Tease** — "you've read 30%" meter + unlock.

**A33. Koenig Card Treatments (6)** — **Non-placeable treatment.** Site-wide `cards.css` styling for all Ghost editor cards (callout, bookmark, button, toggle, gallery, header, product, audio, video, file, quote variants). One treatment active per project (Style group of Post Content Layout — A25). `bindingContext: none` · `compileTarget: assets/css` (`cards.css` — FR-J3).
Content: none — the cards are Ghost editor output; a treatment styles them and carries no content props. Controls: the treatment selector in A25's Style group (project-level, one active per project); no per-instance controls and no universal controls.
1. **Editorial** [Free] — hairlines, serif captions, restrained fills.
2. **Soft Cards** [Free] — rounded tinted surfaces, gentle shadows.
3. **Bold Frames** — 2px borders, chunky radii, high contrast.
4. **Minimal Flat** — near-invisible chrome, typography-led.
5. **Accent Pop** — accent-forward fills on callouts/buttons.
6. **Paper Notes** — card-stock look with subtle texture tint.

**A34. Pagination Styles (10)** — **Non-placeable treatment.** Designs behind the feed Pagination control (FR-H2). Numbered variants compile to `/page/2/` links via native pagination context; Load More and Infinite ship JS with numbered-link fallback. `bindingContext: pagination` (page, pages, total, next, prev — `prd.md` Appendix B) · `compileTarget: partials/pagination.hbs`, rendered inside the designated main feed's section.
Content: none — the labels ("Older posts", "Newer posts", "Page {page} of {pages}", the load-more label) are chrome strings from the Translations catalog (FR-Q6). Controls: the **Pagination style** selector exposed by the designated main feed's FR-H2 Data group; no per-instance controls and no universal controls.
1. **Numbered Classic** [Free] — page numbers + prev/next.
2. **Load More Solid** [Free] — centered primary button with count.
3. **Numbered Pills** — rounded page chips, accent current.
4. **Minimal Prev/Next** — two text links with post ranges.
5. **Big Arrows** — oversized directional buttons.
6. **Rule + Numbers** — hairline with inset numerals.
7. **Load More Ghost** — outline button, subtle spinner.
8. **Load More Ticker** — button with remaining-count badge.
9. **Infinite Fade** — auto-load with skeleton shimmer rows.
10. **Infinite Dot Pulse** — auto-load with minimal pulse loader.

---


## Synthesis Defaults (FR-D6 — normative)

When a template in FR-I1's standard set is **untouched** (the user never edited it), the compiler MUST emit it from the default stacks below, so a home-only design still produces a complete, coherent, gscan-clean theme. Every variant referenced here is **[Free]** (variant #1 or #2 of its category) — an untouched template MUST always compile all-Free, on any plan.

### 1. Scope & trigger

- **Untouched** = the template has no `project_templates` doc, or its doc has zero sections. **Emptying any template returns it to untouched** — FR-I1 states the rule for members templates, but it is general, and its consequence differs by class: the **standard** templates listed below re-synthesize from these defaults on the next compile, while **conditional** templates (the never-synthesized set below) stop emitting entirely, together with any route they auto-added.
- Synthesized at **compile time only**; nothing is written to the project doc. Opening an untouched template in the switcher renders this same default stack as the starting canvas; the first edit materializes the stack into the doc and the template becomes designed. Canvases that are **never** synthesized (the whole custom-template class — A30's membership pages included — plus Private; see the list below) have no default stack, so they open **empty**.
- Synthesizable templates: `index.hbs` (Home untouched), `post.hbs`, `page.hbs`, `tag.hbs`, `author.hbs`, `error.hbs`.
- **NEVER synthesized:** every `custom-{name}.hbs` — the whole custom-template class, which is what A30's membership pages are (page-backed custom templates — there is no members template family to synthesize; Portal serves the untouched flows — FR-I1) — plus `private.hbs`, `home.hbs` (not emitted at all; Home compiles to `index.hbs` per `prd.md` §7.4) and `routes.yaml` entries. These exist only when the user designs them.

### 2. Inheritance from the Home canvas

Synthesized templates render inside `default.hbs` like every template, so chrome and style are inherited by **reference**, never cloned:

| Element | Rule |
|---|---|
| Header, Announcement bar, Footer | **Referenced.** Site-wide singletons (FR-D5) compile into `default.hbs` once; synthesized templates get whatever the user's Home shows. No announcement bar is ever synthesized. If the project has no header/footer singleton at all (nothing designed anywhere), synthesize **A1 #1 Classic Left** and **A3 #1 Minimal Single Row** with auto content (`@site.logo`/title, `@site.navigation`; CTA off, search off, member links on). Hidden/deleted footer on Free → FR-J15 credit fallback in `default.hbs`. |
| Style Pack tokens | **Referenced.** Project token set (FR-E1/E4) — one token block, all templates. |
| Koenig treatment (A33) | **Referenced.** Project-level choice; defaults to **A33 #1 Editorial** if never set. |
| Body sections | **Never cloned from Home.** Each synthesized template uses its fixed default stack below (fresh compile-time instances with schema-default control values). |

Unless a row below says otherwise, all universal controls sit at schema defaults: Background role **Base**, Vertical spacing **Comfortable**, Top divider **None**.

### 3. Default stacks

#### `index.hbs` (only when Home is untouched)

| # | Section | Key values |
|---|---|---|
| 1 | **A17 #1 Classic Cards** (Post Grids) | **Main feed** (see "Main-feed rule" below). Pagination style = **A34 #1 Numbered Classic**. All meta toggles on. |

#### `post.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A24 #1 Classic Center** (Post Header) | Binds title, tag, meta, feature image (skips image row when unset). |
| 2 | **A25 #1 Narrow Classic** (Post Content Layout) | Wraps `{{content}}`. Measure Narrow, TOC Off, share rail off, drop cap off, type scale Normal. **No paywall section is synthesized** — A32 is a non-placeable treatment emitted from the project's Paywall Template, and an untouched project has none, so Ghost's own content CTA renders at the members-only cutoff until one is designed. |
| 3 | **A26 #1 Author Bio Card** (Post Footer) | Portrait, bio, more-by link from post authors. |
| 4 | **A27 #1 Trio Cards** (Related Posts) | `{{#get}}` by primary tag, fallback latest (built-in), Count **3**. Never paginated. |
| 5 | **A28 #2 Minimal Thread** (Comments) | `{{comments}}`; #2 over #1 deliberately — bare native output renders nothing when comments are disabled, no orphaned panel chrome. |

#### `page.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A24 #1 Classic Center** (Post Header) | Meta row (date/author/reading time/tag) **hidden** — pages aren't dated content. |
| 2 | **A25 #1 Narrow Classic** (Post Content Layout) | Same values as post.hbs row 2. |

No post footer, related, or comments on pages.

#### `tag.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A29 #1 Tag Banner** (Archive Header) | Tag name, description, post count; tag accent color when set (built-in). |
| 2 | **A17 #1 Classic Cards** (Post Grids) | **Main feed** (see "Main-feed rule" below). Pagination style = **A34 #1 Numbered Classic**. All meta toggles on. |

#### `author.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A29 #2 Author Split** (Archive Header) | #2 required: #1 binds the tag object; #2 is the author-bound variant (portrait, name, bio, socials). |
| 2 | **A17 #1 Classic Cards** (Post Grids) | **Main feed** (see "Main-feed rule" below). Pagination style = **A34 #1 Numbered Classic**. All meta toggles on. |

#### `error.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A31 #1 Minimal Type** (Error & Utility) | Numeral and message bound to the error context (`{{statusCode}}`, `{{message}}`) — as in every A31 error variant — so one `error.hbs` serves 404, 500 and any other status (FR-I1 emits no `error-404.hbs`/`error-4xx.hbs`). Home link → `@site.url`. |

No feed, no pagination.

### 4. Main-feed rule (normative)

On every synthesized collection template (`index.hbs`, `tag.hbs`, `author.hbs`), the A17 #1 instance is the **designated main feed** (FR-H2):

- Bound to the template's **native paginated collection context** (`{{#foreach posts}}` over the context's posts array) — **NEVER** a fixed-count `{{#get}}` feed. Ghost's index/tag/author contexts each provide a posts array with pagination, so `/page/2/` works on every archive out of the box.
- Sized by the global `posts_per_page` (FR-Q1, default 12) — no Count control.
- Pagination style = **A34 #1 Numbered Classic** (`/page/2/` links via native pagination context) — the only style that needs no JS fallback path (FR-G4 makes Load More **and** infinite scroll fall back to numbered links; Numbered *is* that fallback), which is why defaults never use Load More/Infinite.
- Exactly one main feed per synthesized collection template; the zero-feed SEO-guard branch of FR-H2 can never apply to a synthesized template.
- The only `{{#get}}` feed in any default stack is A27 Related Posts on `post.hbs` (post context has no pagination).

### 5. Invariants

1. Defaults reference only [Free] variants — variant #1 of each category, or #2 where the stacks state the reason (A28, A29-on-author). A default stack MUST NOT change without updating this document; it is the single source of truth for FR-D6.
2. A fully untouched project (nothing designed) compiles to a complete valid theme from the Inheritance and Default-stacks parts above alone: 0 gscan errors, all FR-I1 files present, credits per FR-J15.
3. Synthesized output goes through the same section registry, partials, and CSS/JS pruning as designed templates (P4, FR-J3/J4) — synthesis chooses stacks, it does not use a separate render path.
