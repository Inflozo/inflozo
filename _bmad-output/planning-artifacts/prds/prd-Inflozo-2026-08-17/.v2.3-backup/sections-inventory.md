---
title: Inflozo Section Inventory
status: normative companion to prd.md (same folder; no version pin — the PRD frontmatter carries the version)
---

## Appendix A — Complete Section Inventory (normative)

**Totals: 34 categories · 487 variants (exact; per-category counts sum to 487).** The first two variants in every category are **[Free]**; all others are Pro. Variant descriptors define the *structural* identity that FR-G5 protects.

**Universal controls (every section, not repeated below):** Background role (Swatch Row: Base/Surface/Accent/Contrast/Image), Vertical spacing (Compact/Comfortable/Spacious), Top divider (None/Line/Fade). (Content width is governed by the Style Pack's site-width token — FR-E1/FR-F2 — not per section.) Mode-scoped: Background role, per-mode image swap. **Shared content-model conventions:** `cta = {label, link}` uses the Link Picker; all images use the Image Picker; optional props marked `?`.

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
Content: message (inline link support), cta?, dismiss toggle. Controls: layout picker, dismissible, rotation (for multi-message), visibility (All/Anonymous/Members).
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
Content: heading, subtext?, primary cta, secondary cta?, image?. Controls: layout picker, alignment, emphasis (Band/Card/Full-bleed).
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

**A7. Pricing & Tiers (15)** — Home, custom pages, members pages. **Binds live Ghost tiers** (`{{#get "tiers"}}`: names, monthly/yearly prices, currency, benefits).
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
Content: heading?, embed url(s), poster image?, caption?, copy?. Controls: layout picker, aspect (16:9/4:3/1:1/9:16), frame (None/Rounded/Browser/Device), autoplay-muted toggle (where allowed). Data: episode variants can bind posts by tag.
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

**A17. Post Grids (18)** — Home, tag/author archives, custom pages. Data group per FR-H2 (+ pagination when main feed).
Card content is post-bound: feature image, title, excerpt, date, author, reading time, primary tag.
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

**A18. Post Lists (15)** — Same binding as A17; list-form.
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

**A19. Featured & Spotlight (15)** — Binds featured or hand-picked posts.
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

**A20. Tag Collections (15)** — Binds tags (name, description, accent color, feature image, post count) and their posts.
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

**A21. Author Showcases (15)** — Binds authors (name, bio, portrait, cover, socials, post count).
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

**A22. Newsletter / Subscribe (16)** — Portal-bound (`data-portal` signup); members-aware (hides/swaps for members via FR-D16 preview).
Content: heading, subtext?, button label, proof line?, frequency badge?.
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

**A23. Search (15)** — Styled triggers for Ghost native search; "Custom Overlay" variants implement in-theme search UI via client-side Content API.
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

**A24. Post Headers (16)** — `post.hbs` (and `page.hbs` where applicable). Binds title, excerpt, feature image (+alt/caption), tag, authors, date, reading time.
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

**A25. Post Content Layouts (12)** — Wraps `{{content}}`; controls: measure (Narrow/Comfort/Wide) (reading-column layout choice — distinct from the removed universal width control), TOC (Off/Left/Right, auto-hidden < 3 headings), share rail toggle, drop cap toggle, type scale (Normal/Large).
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

**A26. Post Footers (15)** — Below content on `post.hbs`.
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

**A27. Related Posts (12)** — `{{#get}}` by primary tag with fallback to latest.
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

**A28. Comments (10)** — Wrappers for `{{comments}}` (Ghost native).
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

**A29. Archive Headers (14)** — `tag.hbs` / `author.hbs` heads; bind tag or author objects + post counts.
1. **Tag Banner** [Free] — tag name, description, count on tinted band (uses tag accent color when set).
2. **Author Split** [Free] — portrait left, name/bio/socials right.
3. **Tag Cover** — tag feature image backdrop with overlay.
4. **Minimal Tag Title** — display-type tag name + count only.
5. **Tag Description Split** — name left, long description right.
6. **Count Badge** — oversized post-count numeral treatment.
7. **Author Hero** — cover image, overlapping portrait, bio.
8. **Author Minimal** — byline-style compact header.
9. **Author Cover Card** — portrait card floating on cover.
10. **Gradient Band** — accent gradient archive band.
11. **Boxed Card** — archive identity in outlined card.
12. **Dark Band** — contrast header band.
13. **Filter Bar Attached** — header with sort/paging strip fused.
14. **Breadcrumbed** — home / archives trail above title.

**A30. Members Pages (15)** — `members/signup.hbs`, `signin.hbs`, `account.hbs` full-page designs; tier-bound; portal-wired.
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
11. **Account Panel** — profile, plan, newsletters, actions in cards.
12. **Account Minimal List** — rule-lined settings rows.
13. **Benefits Page** — marketing-grade membership explainer + tiers.
14. **Upgrade Spotlight** — free→paid upsell page with comparison.
15. **Magic-Link Sent** — confirmation state page with resend.

**A31. Error & Utility (10)** — `error.hbs` + special pages. (Compile targets: 404/500 → error.hbs variants; Private Site Gate → private.hbs; Coming Soon / Maintenance / utility pages → custom page templates.)
1. **404 Minimal Type** [Free] — huge 404, one-line, home link.
2. **404 Search Recovery** [Free] — apology + search + popular tags.
3. **404 Playful Scene** — illustrated lost-page moment.
4. **404 Popular Posts** — grid of top content as recovery.
5. **500 Calm** — reassuring server-error page.
6. **Coming Soon** — pre-launch page with subscribe.
7. **Maintenance** — brief downtime page.
8. **Empty Tag State** — "nothing here yet" archive state.
9. **Subscribe Success** — welcome-aboard confirmation page.
10. **Private Site Gate** — styled password-access page.

### Group 5 · Ghost Native Elements

**A32. Paywall / Content CTA (12)** — Rendered at the gated-content cutoff (`{{#unless access}}`); tier-bound; portal-wired. A flagship differentiator.
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

**A33. Koenig Card Treatments (6)** — Site-wide `cards.css` styling for all Ghost editor cards (callout, bookmark, button, toggle, gallery, header, product, audio, video, file, quote variants). One treatment active per project (Style group of Post Content Layout).
1. **Editorial** [Free] — hairlines, serif captions, restrained fills.
2. **Soft Cards** [Free] — rounded tinted surfaces, gentle shadows.
3. **Bold Frames** — 2px borders, chunky radii, high contrast.
4. **Minimal Flat** — near-invisible chrome, typography-led.
5. **Accent Pop** — accent-forward fills on callouts/buttons.
6. **Paper Notes** — card-stock look with subtle texture tint.

**A34. Pagination Styles (10)** — Designs behind the feed Pagination control (FR-H2). Numbered variants compile to `/page/2/` links via native pagination context; Load More and Infinite ship JS with numbered-link fallback.
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

- **Untouched** = the template has no `project_templates` doc (or its doc has zero sections after FR-I1's "removed everything" rule).
- Synthesized at **compile time only**; nothing is written to the project doc. Opening an untouched template in the switcher renders this same default stack as the starting canvas; the first edit materializes the stack into the doc and the template becomes designed.
- Synthesizable templates: `index.hbs` (Home untouched), `post.hbs`, `page.hbs`, `tag.hbs`, `author.hbs`, `error.hbs`.
- **NEVER synthesized:** `members/signup.hbs` / `signin.hbs` / `account.hbs` (Portal serves untouched flows — FR-I1), `private.hbs`, `custom-{name}.hbs`, `home.hbs` (not emitted at all; Home compiles to `index.hbs` per §7.4), `routes.yaml` entries. These exist only when the user designs them.

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
| 2 | **A25 #1 Narrow Classic** (Post Content Layout) | Wraps `{{content}}`. Measure Narrow, TOC Off, share rail off, drop cap off, type scale Normal. **A32 #1 Fade + Card** emitted at the gated cutoff inside `{{#unless access}}` (renders only on gated posts). |
| 3 | **A26 #1 Author Bio Card** (Post Footer) | Portrait, bio, more-by link from post authors. |
| 4 | **A27 #1 Trio Cards** (Related Posts) | `{{#get}}` by primary tag, fallback latest (built-in), Count **3**. Never paginated. |
| 5 | **A28 #2 Minimal Thread** (Comments) | `{{comments}}`; #2 over #1 deliberately — bare native output renders nothing when comments are disabled, no orphaned panel chrome. |

#### `page.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A24 #1 Classic Center** (Post Header) | Meta row (date/author/reading time/tag) **hidden** — pages aren't dated content. |
| 2 | **A25 #1 Narrow Classic** (Post Content Layout) | Same values as post.hbs row 2, without the paywall block. |

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
| 1 | **A31 #1 404 Minimal Type** (Error & Utility) | Numeral bound to the error context's status code — one `error.hbs` serves 404 and 500 (FR-I1 emits no `error-404.hbs`/`error-4xx.hbs`). Home link → `@site.url`. |

No feed, no pagination.

### 4. Main-feed rule (normative)

On every synthesized collection template (`index.hbs`, `tag.hbs`, `author.hbs`), the A17 #1 instance is the **designated main feed** (FR-H2):

- Bound to the template's **native paginated collection context** (`{{#foreach posts}}` over the context's posts array) — **NEVER** a fixed-count `{{#get}}` feed. Ghost's index/tag/author contexts each provide a posts array with pagination, so `/page/2/` works on every archive out of the box.
- Sized by the global `posts_per_page` (FR-Q1, default 12) — no Count control.
- Pagination style = **A34 #1 Numbered Classic** (`/page/2/` links via native pagination context) — the only style that is fully functional with JS disabled (FR-G4), which is why defaults never use Load More/Infinite.
- Exactly one main feed per synthesized collection template; the zero-feed SEO-guard branch of FR-H2 can never apply to a synthesized template.
- The only `{{#get}}` feed in any default stack is A27 Related Posts on `post.hbs` (post context has no pagination).

### 5. Invariants

1. Defaults reference only [Free] variants — variant #1 of each category, or #2 where the stacks state the reason (A28, A29-on-author). A default stack MUST NOT change without updating this document; it is the single source of truth for FR-D6.
2. A fully untouched project (nothing designed) compiles to a complete valid theme from the Inheritance and Default-stacks parts above alone: 0 gscan errors, all FR-I1 files present, credits per FR-J15.
3. Synthesized output goes through the same section registry, partials, and CSS/JS pruning as designed templates (P4, FR-J3/J4) — synthesis chooses stacks, it does not use a separate render path.
