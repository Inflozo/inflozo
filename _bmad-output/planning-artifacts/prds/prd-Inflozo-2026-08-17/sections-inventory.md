---
title: Inflozo Section Inventory
status: normative companion to prd.md (same folder; no version pin — the PRD frontmatter carries the version)
updated: 2026-08-19
---

## Appendix A — Complete Section Inventory (normative)

<!-- totals -->
**Totals: 33 categories · 468 designs · 66 [Free] · 440 placeable · 28 non-placeable.** Every one of these is **derived from the export** by `tools/inventory-gen.py` and never typed (standing rule 3): the design count is the drawn frames less the deletions ruled at step 4b, `[Free]` is the 2 designs the owner chose for that category (R-17), and the non-placeable count is A32 (12) + A33 (6) + A34 (10). Regenerate with `python3 tools/inventory-gen.py --write`; `--check` fails if this file has drifted from the export.
<!-- /totals -->
**[Free] is positional and nothing else.** The first two designs of every category are Free; the two
historical extras are struck (R-17). **A29 #7's and A31 #10's re-tiers are withdrawn** — A31's private
gate is drawn by *every* A31 design, so #1 Centred and #2 Split Reason already give `private.hbs` a Free
pair, and A29's third had no basis in the export, where all fourteen bind either archive. Every spec
carries the marker on its own roster; the merge does not map it positionally onto a spec that has lost
or gained a design. Design descriptors define the *structural* identity FR-G5 protects.

**Placeable sections vs non-placeable treatments (normative carve-out):** the split itself is in the
generated totals above and is not restated here. A **placeable** design is one the user drags onto a
canvas (FR-D5/FR-D12). The **non-placeable treatments** are chosen elsewhere, apply once per project, and
are excluded from the Section Picker rail, drag/reorder, the Layers panel, Variant Shuffle (FR-D13) and
Site Remix (FR-D17). Every requirement that quantifies over "every design" — FR-G1 launch deliverables,
FR-G5 uniqueness, FR-G6 / NFR-6(a) render matrix, NFR-5 accessibility, the E14 gallery — **still covers
every non-placeable design**, using the host context named here:

| Category | Count | Chosen where | Host context for the render matrix and the gallery |
|---|---|---|---|
| **A32** Paywall / Content CTA | 12 | Standalone **Paywall Template** editor — one design active per project | A gated `post.hbs`, rendered at the members-only cutoff via `partials/content-cta.hbs`; member state Anonymous and Free (FR-D16); live or sample tiers (FR-H6) |
| **A33** Koenig Card Treatments | 6 | The **card design module** (FR-Q7), or Theme Settings where no Post Content section is placed (FR-Q9) — one treatment active per project | The **style-guide fixture** (FR-H3) rendered on `post.hbs` — a body exercising every Koenig card type, styled by the emitted `cards.css` |
| **A34** Pagination Styles | 10 | Pagination style control on the designated main feed (FR-H2), or Theme Settings where no feed is placed (FR-Q9) | A paginated `index.hbs` whose main feed (A17 #1) runs over the **32-post** fixture at the default `posts_per_page` 12 — three pages (12 + 12 + 8), so the matrix renders each design on page 1, on the **middle** page (previous *and* next present) and on the partial last page (FR-H3, FR-D21) |

**The design picker is not a control (normative).** Every category's `Controls:` line used to open with a "layout picker" that had no declared value set — while A32's opened with a "design picker" naming the same thing. They were one control under two names, and the ambiguity is exactly what the one-term ruling exists to end: **the mini-diagram thumbnail picker is FR-D19's design picker**, its value set is the category's own designs, and it is therefore declared nowhere below. It sits outside every `Controls:` list, on every placed section, like the universal controls — never a Quick Control, never counted against FR-F3's cap, and never promotable to a Ghost custom setting, since no Admin select can swap a design's markup. The word **layout** no longer names a unit anywhere in this library; it survives only inside a design's own name (A25 "Post Content Layouts") and in ordinary prose about arrangement.

**Universal controls (every section, not repeated below):** Background role (Swatch Row: Base/Surface/Accent/Contrast/Image), Vertical spacing (Compact/Comfortable/Spacious), Top divider (None/Line/Fade). These three are **outside** every declared `Controls:` list and are **exempt from FR-F3's ≈ 15-control cap**. They are declared **once, per section, not per design** — a design switch never adds or removes them. The cap governs **a single design's** own controls, so the effective per-section ceiling is ≈ 15 + 3. They are never Quick Controls. (Content width is governed by the Style Pack's site-width token — FR-E1/FR-F2 — not per section; the pack's **gutters** token has its own scale, **Tight/Normal/Loose**, matching A14's `gap` — never the per-section Vertical spacing labels.) Mode-scoped: Background role, per-mode image swap. Non-placeable treatments carry the universal controls only where they render as a block of their own (A32); A33 and A34 carry none.

**Sections do not know about each other at runtime; the compiler knows about all of them (AD-37, ruling
R-19).** One partial per placed section (`prd.md` §7.4) means no section can reach into its neighbour's
markup *while rendering* — that has not changed, and a design that needed it would still be unbuildable.
What changed is where the question is answered: **the build already knows every placed section and its
order**, so overlay-header preconditions, stacked-padding collapse, duplicate-post suppression,
one-share-block-per-route, footer adjacency and margin occupancy are all **compile-time facts**, decided
once and emitted. **A placed design never becomes a different design at render** (R-8): a module hides its
own chrome, the editor advises, and a design switch stays an edit-time act. Where a design's own text says
two sections "never know about each other", read it as *at runtime* — the sentence was written before
AD-37 and is amended, not deleted.

**How to read a category declaration (FR-G3).** The library is declared at **two levels**, and the distinction is load-bearing rather than editorial.

**The category level is the union.** `Content:` is the category's `contentSchema` — **the union of every field any of its designs needs**, not the intersection and not the fields of a typical design. `Controls:` is the category's **union control list**. `Data:` is the FR-H2 Data control group wherever the category is feed-bearing. The union exists because it is the **storage contract**: when a user moves through the design ring, values belonging to controls and fields the current design does not use are **parked** (FR-D19), and the union is the domain they are parked in. A design needing a field the union does not declare is a defect — that field has nowhere to live, and FR-D17's preservation gate fails on it.

**The design level is what the user sees.** Each design declares its **own** control list in sidebar order, drawn from the category's union, and the **first 3–5 entries of that design's list are its Quick Controls** (FR-F3). Two designs in one category legitimately expose different controls; a design with no media offers nothing about media. **`contentSchema` is per category; `controlSchema` and `quickControls[]` are per design** (FR-F7).

**Shared content-model conventions:** `cta = {label, link}` uses the Link Picker; all images use the Image Picker; optional props marked `?`.

**What each design carries (normative — the per-design specification).** Every design in this inventory resolves to a specification produced by its category's design-and-specification session (§4 of `prd.md`; method of record `design/claude-design-prompt-3-library.md`). A design is not ready to build until its specification exists, and each one carries:

| Field | Meaning |
|---|---|
| **Descriptor** | the one-line structural identity FR-G5 protects — what makes this design *this* design |
| **Structural descriptor** | the machine-checkable **tuple** on which FR-G5's uniqueness assertion actually runs — archetype · containment · ground · item-count class · media placement · emphasis mechanism (six slots since 2026-08-21; the closed sets live in `tools/tuple-check.py`, which is the authority). Free prose cannot be asserted over, and two designs can be described differently while being the same design. **It must stay unique within its category after the per-design control lists are written**, since controls no longer distinguish designs (FR-F7). The machine checks structure, containment and ground; the emphasis slot is open, and what it names is a human's judgement |
| **Archetype** | the responsive archetype it collapses under — grid-of-N, split, stack, bar, nav, edge rail, overlay, feed, form, carousel, table, media frame, sticky, article body — which supplies its default collapse ladder |
| **Responsive rule** | what happens at each breakpoint, **in words**; where the design cannot follow its archetype, its bespoke behaviour |
| **Content fields** | the subset of the category union it uses, with types, optionality and limits |
| **Controls** | its own list in sidebar order, each with its complete closed value set, Quick Controls first |
| **Data** | what it binds, and its behaviour at 0, 1 and many items |
| **Empty states** | what renders when optional content is absent |
| **Behaviour** | which of FR-G7's 31 modules it declares (if any), whether each is edit-safe (FR-D20), and its **no-JS degradation, written out** — the module's degradation statement is an acceptance criterion, so a design declaring a module and omitting the statement is not ready to build |
| **Accessibility** | heading level, focus order, anything requiring a label |

**The one-line descriptors below are the seed, not the specification.** They fix each design's structural identity and are normative for scope — the inventory's counts, tiers and carve-outs bind now. The full specification for a category is authored in that category's design session and lands here before its build story opens (§4). A category whose designs still carry only their descriptor has not yet been through that session.

**A design declares where it may be placed, and the compiler refuses an illegal placement (R-7).**
`compileTarget: any` is withdrawn wherever it was a lie. A design emitting `{{pagination}}` is restricted
to **paginated targets** — on `post.hbs`, `page.hbs`, `error.hbs` or `private.hbs` it is a **fatal render**
(`appendix-b1 §3`). A design performing a `{{#get}}` excludes **`error.hbs` and `private.hbs`**
(`appendix-b1 §3c`): an error page that queries the database compounds the outage it is reporting.
**Load-more designs are main-feed-only** — a `{{#get}}` feed never paginates, so there is no `/page/2/` to
fetch or to fall back to (FR-H2). `limit="all"` is **capped at 100** with the truncation stated: `all`
trips gscan on 6.x and silently returns 100 anyway. The refusal is at **compile time** (FR-J3), not a
runtime guard.

**Hand-picked order costs one `{{#get}}` per picked item. No hard cap; the panel warns past 25 (R-20, re-ruled 2026-08-27 — the budget is per page, not per section).**
`filter="id:[…]"` **discards the requested order** and returns `published_at desc` on both majors
(`MEASUREMENTS.md` §29d), so "picked order is drawn order" compiles to N single-id gets. The cap is
**twelve per section, stated in the panel**. It is **not** a platform limit: Ghost races each `{{#get}}`
against a 5000 ms timeout of its own and imposes no per-template budget — 150 gets on one template
resolved in full on both majors (§30). Twelve is a **latency budget** at roughly 10 ms per pick, and
raising it is an owner decision rather than a consequence of the measurement.

**`bindingContext` / `compileTarget` (FR-G3):** every category declares both, and Variant Shuffle (FR-D13), Site Remix (FR-D17) and the Section Picker (FR-D12) cycle and filter **only within matching values** — a placed instance never shuffles into a design that binds a resource its template does not have, or that compiles into a different file. Groups 1–2 (A1–A16) are `bindingContext: none` and `compileTarget: any` (A7's tiers, A12's optional authors and A15's optional posts are Data-group opt-ins, not context changes), except the site-wide singletons A1–A3, which compile into `default.hbs` (FR-D5). Groups 3–5 declare theirs per category below; where designs inside one category differ — **A29** (tag vs author), **A31** (error vs private vs custom page) — the values are declared **per design** and the Shuffle ring is partitioned accordingly. **A30** declares one value for all 13 of its designs (`custom-{name}.hbs`, page-backed) but still partitions its Shuffle ring by membership surface — signup / signin / member home. The context axes are FR-H7's: see `prd.md` Appendix B and `research-ghost-binding-contexts.md`.

**Member visibility (re-derived from the export — R-16):** a **show to (Everyone / Logged out /
Free members / Paid members)** control, evaluated against `@member` on the live site and previewed via
FR-D16. It adds no designs; it makes an existing ask member-aware, and it is how a member ask is placed on
a canvas now that A32 is non-placeable. **Eleven categories carry it: A4, A5, A6, A7, A8, A9, A16, A21,
A22, A26, A29** — and inside those it sits on the CTA-bearing designs only, not on all of them (A21 on
five, A26 on 12 Subscribe, A29 on its three CTA designs). **Twenty-two categories do not carry it, each
for a reason the category records rather than an omission**: a richer member-state model already subsumes
it (**A1**'s P0·4 per-action states, **A2**'s `audience` control, **A3·4**'s *Signed-in members*,
**A30**'s `signedInBehaviour`), or the category bears no call to action at all to gate (**A10–A15, A17–A20,
A24, A25, A27, A28, A31, A33, A34**). **A32 refuses it deliberately** — a paywall that hides itself from
the members it is asking is not a paywall. Every Portal fragment inside a member ask carries register
45(c)'s sentence: **with JavaScript off, nothing happens** (R-5).

### Group 1 · Structure & Chrome

**A1. Headers & Navigation (15)** — Used on `default.hbs` (site-wide).
Content: logo, siteTitle, navItems[], navItems[].children[], signInLabel, ctaLabel, ctaUrl, ctaLabelShort, moreLabel, searchTrigger, darkModeToggle, tagline, dateLine, dateMode, customDate, logoLight, featuredPost, featuredHeading, menuLabel, closeLabel, panelTags, railHeading, byTopicHeading, byAuthorsHeading, panelColumns[], children[].description, stripNote, stripItems[], secondaryNav[], socialLinks[]. Controls: On scroll, Nav position, Actions, Nav items before More, Divider under, Dark mode toggle, Wordmark size, Split, Hairline under, Masthead height, Nav row, Rules, Tagline, Date, Date shown, Reading progress, Scrim, Header colour on image, Drawer, Actions in bar, Pill width, Lift, The menu button, Takeover, Takeover ground, Featured post in menu, Show date, Show excerpt, Subscribe in bar, Panel width, Columns, Second line, Panel opens on, Strip source, In the strip, Strip ground, Band width, Primary action, Background role (universal), Rail width, Rail side, Row icons, Children open, Becomes a top bar, Box width, Box treatment, Centring, Nav spacing, RSS icon, Icon style, Logo, Nav placement, Hides after, Returned ground, Returned shape, Wordmark in returned panel, Subscribe in returned panel, Sign in in returned panel. Data: `@site.navigation`, secondary nav, `@member` state swap (Sign in ↔ Account).
<!-- roster:A1 -->
1. **Rail** [Free] — The undecorated single row — logo, nav, actions, hairline — and the only design that adds nothing to it; four other designs fall back to this arrangement rather than inventing one.
2. **Split Rail** — The only design with a centred wordmark and the nav split around it, so the header reads from an axis of symmetry rather than left to right.
3. **Stacked Masthead** — The only design whose lower tier is a full-width nav row that detaches from the masthead on scroll and carries the reading-progress rule.
4. **Overlay** — The only design with no ground of its own — it renders on the image of the section beneath it, and the only one whose existence depends on another section's content.
5. **Floating Pill** — The only design that is a detached object rather than a band — a capsule inset from three sides with the page ground visible around it, and the only header carrying a shadow at rest.
6. **Drawer-First** — The only design with no nav in the bar at any width — navigation exists solely as a display-size takeover, which is why it is the only design with no cap on items.
7. **Mega Bar** — The only design that expands into a full-width panel of bound or authored columns with descriptions and grandchild groups, instead of a 248 px dropdown.
8. **Utility + Nav** — The only design with a second, thinner tier above the bar on its own ground, carrying secondary nav, social and a note.
10. **Contrast Band** — The only design on the contrast token, where the accent's usual jobs are reassigned to other tokens rather than recoloured.
11. **Side Rail** — The only design that is a vertical column instead of a horizontal band, and the only one that takes width out of the page layout rather than sitting above it.
12. **Boxed** — The only design bounded by a box measured to the content column, so the nav's left edge and the body text's left edge are the same line.
13. **Centre Nav** [Free] — The only design where the nav is centred on the page rather than on the slack between logo and actions, held there by equal outer grid columns whatever the CTA label says.
14. **Icon Utilities** — The only design whose right side is an icon cluster beside the actions instead of labelled actions alone — and, since this pass, a design with no member furniture of its own: signed-in members see the member-aware action labels, not an avatar.
15. **Big Type** — The only design where the wordmark is the display moment and the nav is subordinate to it.
16. **Reveal** — The only design defined by scroll direction rather than scroll position: hidden going down the page, returned as a floating panel going up, in flow at the top.
<!-- /roster:A1 -->

**A2. Announcement Bars (15)** — Site-wide, above header. Part of the shell block (§4), and site-wide singletons like A1 and A3 — compiled into `default.hbs` once (FR-D5). `bindingContext: none` · `compileTarget: default.hbs`.
**Ghost has an announcement bar of its own, and Inflozo's replaces it (owner ruling, verified feasible).** Ghost injects its native bar through `{{ghost_head}}` above everything the theme renders, so a site with both enabled shows **two stacked**. The resolution is that Inflozo's bar **takes over**, and the mechanism is fixed by what Ghost actually permits:

- **The content is seeded, not live-bound.** Ghost's announcement text is **not readable at render time**: `announcement_content` is absent from Ghost's public settings allowlist, so it is on neither `@site` nor the Content API, and Ghost's own bar fetches it client-side from `/members/api/announcement/` because visibility is per-member and pages are cached. It **is** readable server-side with the Admin API key Inflozo already holds (the announcement settings are an ordinary non-core, non-secret group). So at connect, Inflozo **reads it once and offers to bring it across** — text into the message prop, `announcement_visibility` mapped onto the **show to** control, `announcement_background` onto the Background role. It then behaves like any other section: edited in Inflozo, server-rendered, working with JS off. This is FR-C4's auto-branding pattern — a **seed**, exactly like logo, accent and nav — not a live binding.
- **A live binding is rejected, and the reason is structural.** The only render-time source is an undocumented **members-API** endpoint fetched by JavaScript. Binding to it would make the bar's *content* JS-dependent — empty with JS off, and a visible flash before it arrives — on a section that is otherwise pure server-rendered HTML (FR-G7), and would rebuild member visibility client-side when A2's **show to** control already does it server-side with `{{#if @member}}`, which is strictly better. It would also rest on exactly the class of unofficial endpoint that has already cost this project once.
- **Ghost's bar is switched off by clearing it, and only the user's own site can do that.** No theme can suppress it — `{{ghost_head}}` is mandatory — but Ghost emits **nothing at all** when `announcement_content` or `announcement_visibility` is empty. So after seeding, Inflozo offers a **one-click "turn Ghost's bar off"**, which is safe *because the copy is already inside Inflozo by then*, and is an explicit consented action rather than something done quietly (P8). Declining leaves both bars, which is a legitimate choice and looks obviously deliberate rather than broken.
- **If the user never seeds**, nothing changes and no warning is invented — but the stack is **visible while designing**: Ghost's bar is **shimmed as a strip at the top of the canvas** (FR-H5), taking real vertical space above the header, so an A2 design placed below it is authored against what the visitor will actually see rather than against a page missing its top strip. No warning is needed once the thing being warned about is on screen.

Content: message, messageShort, linkLabel, linkUrl, dismissible, audience, dismissMemory, ctaLabel, ctaUrl, ctaLabelShort, label, headline, body, emailPlaceholder, submitLabel, successMessage, endsAt, expiredMessage, expiredCtaLabel, expiredCtaUrl, metaText, messages[], image, imageAlt, secondaryLabel, askAgainAfter, chipLabel. Controls: Background role (universal), Vertical spacing (universal), Alignment, Link style, Placement, Dismissible, Action, Width, Divider under, Label style, Headline size, Text alignment, Field width, Submit style, Sentence, Ends, Units, Clock style, When it ends, Meta, Messages, Speed, Separator, Interval, Transition, Indicators, Position, Air around it, Icon, Appears, Actions, Body text, Image, Content source, Scrim, Layout, Policy link in text, Rule weight, Chip, Chip label, Opens on, Open ground, Slots, Dividers, Labels.
<!-- roster:A2 -->
1. **Rule** [Free] — The category's floor — one line on a contrast band with nothing added to it, spending no accent — the category's least-furnished arrangement, which is what makes it the baseline.
2. **Split** [Free] — The only single-row bar whose action is a filled button at the right margin, and the only one that breaks its row on a content threshold rather than at a width.
3. **Badge** — The only design with a label before the sentence and no band of its own — a bar drawn with a single hairline on the page's own ground.
4. **Two-Line** — The only design with two type sizes stacked — a heading-font line over a body line — and the only one that re-arranges on a stated usable-width trigger rather than at a breakpoint.
5. **Capture** — The only design that takes input, so the only one with focus, error, submitting and success states — and the only one whose ask is dropped, its own band intact, when members are off in Ghost.
6. **Countdown** — The only design whose content changes without anyone editing it, and the only one whose height is set by a clock rather than by a Height control.
7. **Dateline** — The only design that reads content from Ghost, and the only one whose right end carries publication meta instead of an action or a close-adjacent control.
8. **Ticker** — The only design where the text moves continuously, and the only one carrying a pause control as a requirement rather than a choice.
9. **Rotator** — The only design that shows one message of several at a time with nothing moving horizontally, and the only one whose stop mechanism is its indicators rather than a pause button.
10. **Pill** — The only design that is a detached object with air around it rather than a band, and the only one where a control — Sticky — changes what the design is rather than where it sits.
11. **Toast** — The only design that arrives after the page has settled rather than being present at load, and the only one Escape dismisses from anywhere on the page.
12. **Takeover** — The only design that carries imagery, and the only one tall enough to be mistaken for a hero.
13. **Notice** — The only bottom-anchored bar in the top-stack's vocabulary — one sentence with an always-underlined policy link and a dismiss, recording nothing and gating nothing.
14. **Edge** — The only design that is four pixels of furniture until it is pressed, and the only one whose two states differ by more than a control setting.
15. **Triple** — The only design that shows more than one message at once without moving. Below 768 it draws its first slot alone and hides the other two — it stays itself at every width (Part A·A8).
<!-- /roster:A2 -->

**A3. Footers (16)** — Site-wide.
Content: wordmark, mark, social[], copyright, legalLinks[], showAttribution, tagline, description, latestPosts, tags, image, linkColumns[], newsletterPlaceholder, newsletterButtonLabel, newsletterNote, newsletterSuccess, newsletterSuccessShort, memberSubscribedLine, memberManageLabel, postsHeading, postsSource, postsCount, contactHeading, address, email, phone, hours, credits[], creditsGroups[], heading, creditsHeading, tagsHeading, tagsOrder, tagsCount, tagsList[], showTagCounts, imageSource, imageAlt, footerBelow. Controls: Social position, Social display, Icon style, Columns, Columns source, Fill column, Brand block, Ground pair, Bar contents, Band padding, Band ground, Field width, Band alignment, Signed-in members, Legal line, Measure, Links, Name scale, Ink, Offset, Density, Social, How many posts, Post style, Which posts, Details, Prose measure, Credits, Links source, Card padding, Inset, Card ground, Card at 390, How many tags, Order, Post counts, Links beside, Band height, Image source, Over the image, Text position, Link size, Separator, Bar height, Bar ground, Links in the bar, Releases, Back to top, Footer below.
<!-- roster:A3 -->
1. **Minimal Line** [Free] — The category's floor — a brand row over a legal row with nothing added to them, spending no accent — the category's least-furnished arrangement, which is what makes it the baseline.
2. **Columns** — The design that settles the column grid — brand block at the left margin, authored columns filling the measure — and the only one whose column count is free to run the whole 2–7 range, which is what the seven-column cap, the eight-link cap and the accordion threshold are written against.
3. **Two-Tier** — The only footer split across two grounds, with the lockup in the lower bar rather than in the tier — which is what lets the bar be the site's constant while the tier above it changes.
4. **Newsletter Band** — The only footer that takes input — one form row as a band across the top of the footer, with no heading and no body copy, which is exactly what separates it from A22 Newsletter.
5. **Contrast Band** — The same grid as A3·2 with the inverted ground as the design rather than as a setting — no Ground picker, one step more padding, and a four-column cap, which is what makes it a separate design instead of a control value.
6. **Centred Stack** — The only footer with no grid at all — one centred column on a fixed measure, with the authored columns flattened into a wrapping row of links and their headings kept but never drawn.
7. **Big Type** — The only footer whose subject is the site's own name at display scale, and the only one that drops the mark and the tagline by construction rather than by a control.
8. **Sitemap** — The only design above four columns, drawn at the category's smallest link size, and the only one with a Density control — which is the control the extra columns pay for.
9. **Latest Posts** — The only footer whose main content changes without anyone editing it, and the only one whose repeating unit carries an image.
10. **Contact Block** — The only footer carrying post, email, phone and reply hours as a labelled block, and the only one whose content may be legally required of the site.
11. **Colophon** — The only footer whose main content is prose, and the only one with a required rich-text field — without the paragraph there is no design.
12. **Card** — The only footer that does not touch the window — a panel inset on three sides with the page ground visible around it, and the only one carrying a shadow at rest.
13. **Tags** — The only footer whose main content comes from Ghost's own tags rather than from typing, and the design where the chip's geometry is set for the library.
14. **Image Band** — The only footer whose subject is a photograph — one full-bleed band closing the page with the site's name over it — and the design that settles the scrim for the library.
15. **Wrap** — The only footer that draws every link at reading size in one wrapping field, with no headings and no columns at any width — the design for a list with no hierarchy worth drawing.
16. **Mini Bar** [Free] — The only footer with a scroll behaviour — a slim bar pinned to the window while the reader is in the page, released at the page's end into whichever A3 design sits below it, one element in both states.
<!-- /roster:A3 -->

### Group 2 · Marketing Sections

**A4. Heroes (17)** — Home, custom pages.
Content: eyebrow, headline, sub, primaryAction, secondaryAction, note, proof[], valueSource, image, imageAlt, imageFocus, pictureFocus, imageCaption, issueLine, videoUrl, videoPoster, videoDuration, deadline, scrollCueLabel, quote, quoteName, quoteRole, quotePortrait, meta. Controls: Measure, Headline size, Actions, Note under the actions, Member visibility, Background role (universal), Vertical spacing (universal), Top divider (universal), Text block width, Below the sub, Picture side, Picture, Text position, Over the picture, Scrim, Band width, Caption under the band, Headline scale, Sub under the rule, Rule under the headline, Nameplate scale, Rules, Issue line, Issue line source, Standfirst source, Sub under the standfirst, Card padding, Inset, Card ground, Alignment, Card at 390, Band edges, Primary action, Play control, Show how long it runs, Over the poster, Field width, Above the form, Note under the form, When a member is signed in, Show member count, Email form fields, Picture height, Bleed, Which post, Card style, Card side, Show tag, Show date, Height, Scroll cue, Quote size, Attribution, Title size, Rule, Eyebrow, Overlap, Overlap on a phone.
<!-- roster:A4 -->
1. **Centred** [Free] — The category's floor — the whole set centred on a measure with no picture and nothing added to it, the arrangement 5 Image Under's own no-band state resembles, and the design the type and action ladders are established on.
2. **Flush Left** — The only design that leaves half its width deliberately empty, and the only one carrying authored proof pairs — the arrangement 3, 13 and 18 each approach in their own no-picture states, none of which switch design (the rule that no design ever turns into another design), when their picture is absent.
3. **Split** — The design that settles the two-column hero — text on seven columns, one contained 4:3 crop on five, both on the page's own ground — and the geometry 10, 11 and 13 borrow rather than restate.
4. **Full Bleed** — The only design where the set sits on the photograph itself, and the design that settles the scrim, the crop floor and the honest contrast limit for text over an unknown picture.
5. **Image Under** — The only design that puts its whole picture below the set as a captioned band, so no word in it ever sits on a photograph.
6. **Big Type** — The only design whose headline size is measured rather than picked from the category's ladder, and the only one that drops the eyebrow field entirely.
7. **Masthead** — The only design whose subject is the site's own name from Settings rather than an authored headline, held between rules with an issue line under it.
8. **Card** — The only design that is a detached panel with the page ground visible around it, the only one whose padding is measured inside a card, and the only one where a phone control decides whether the card survives at all.
9. **Contrast Band** — The only design with no Ground control — the inverted ground is the design rather than a setting on 1 Centred — and the only one that redraws the action pair for a contrast band.
10. **Video Poster** — The only design carrying a video, and the only one whose control opens a dialog rather than navigating, scrolling or submitting.
11. **Subscribe** — The only design that takes an email address, and the only one where a form row stands in the actions' slot at the actions' own height.
12. **Offset Image** — The only design whose picture leaves the window, and the only one that corrects settlement 1 by refusing a transparent header outright.
13. **Latest Post** — The only design carrying live content from Ghost, and the only one whose second half is a query result rather than an authored picture.
14. **Full Height** — The only design measured against the window rather than against its own content, and the only one carrying a scroll cue.
16. **Pull Quote** — The only design where the display position is spent on somebody else's sentence, and the only one where the publication's own headline is demoted to the eyebrow's treatment and is optional.
17. **Slim** [Free] — The only design that is a page title rather than an argument — one row of about 160 px — the only one offered on every route, and the only one whose title can come from Ghost.
18. **Overlap Card** — The only design that reaches into the section below it, and the only one where the headline sits on a measured surface over a photograph rather than on the photograph.
<!-- /roster:A4 -->

**A5. Features (16)** — Home, custom pages.
Content: eyebrow, title, sub, items[], itemTitle, itemBody, itemIcon, itemLinkLabel, itemLinkUrl, primaryAction, note, itemImage, itemImageAlt, itemMeta, tabLabel. Controls: Media, Head alignment, Below the set, Item link, Member visibility, Background role (universal), Vertical spacing (universal), Top divider (universal), Item arrangement, Body copy, Card treatment, Head width, Head behaviour, Below the head, Rules, Item meta at the right, First row's picture, Alternate sides, Picture treatment, Item plane, Content source (data), How many (data), Large tile, Large tile media, Small tile media, Band edges, Mark, Density, Rules between entries, On a phone, Tabs and head, Panel media, Picture side, Spotlight media, The rest, Card width, Rail edges, Rail controls, Numeral, Numeral colour, Rule under the numeral, Item meta, Panel padding, Inset, Dividers.
<!-- roster:A5 -->
1. **Three Up** [Free] — The category's floor — a centred head over three bare items on the page's own ground, adding nothing to the item, the grid, the head or the action, and the arrangement the fifteen designs after it are departures from.
2. **Two Up** — The only design that caps its body copy inside a column wider than the cap — a 520 px measure in a 632 px item — which is the whole of what separates it from 1 Three Up with a column removed.
3. **Four Up** — The only design that offers to remove its own body copy — the control that buys a fourth column, and the reason the ladder stops there rather than at a fifth.
4. **Cards** — The design that settles the plane — every item on its own surface at a fixed 28 px padding, stretched to the row's height with its text held at the top — the three things half the category borrows rather than re-deciding.
5. **Split Head** — The only design whose head is a column beside the items rather than a block above them, and the only one whose section action sits inside that head at every width.
6. **Rows** [Free] — The only design that gives each item a full-width row of its own with a hairline between, and the design that introduces itemMeta at the row's right end.
7. **Alternating Media** — The only design where the picture changes sides from row to row, and the only one capped at four items because every row spends a half-page on one.
8. **Media Top** — The only design that runs a picture across the top of every item in a grid, at a 16:9 crop it argues for explicitly against 7's 3:2.
9. **Bento** — The only design that draws one item at four times the size of the others, taking that emphasis from the item's position in the list rather than from any control.
10. **Contrast Band** — The only design whose ground is the design rather than a control — the whole set on the inverted band, with the icon lift, the hairline, the action and the focus ring all re-derived from the carried colour.
11. **Checklist** — The only design whose item is a title and nothing else, spending the accent once per entry on a mark that says the entry is included.
12. **Tabs** — The only design that shows one item at a time, and the only one whose resting state hides most of what is authored in it.
13. **Spotlight** — The only design that makes one item the subject and reduces every other to a single line, and the only one whose remaining items can be dropped from the DOM by a control.
14. **Scroller** — The only design that overflows sideways instead of wrapping, with a card sliced by the window as its affordance — and the only one whose arrangement is identical at every width.
15. **Index** — The only design whose most conspicuous element is not authored — a numeral generated from the item's position, sitting where every other design puts its media.
16. **Panel** — The only design whose items share one plane, separated by hairlines that stop short of the panel's edge rather than by gaps of page ground.
<!-- /roster:A5 -->

**A6. CTA Banners (15)** — Any template.
Content: eyebrow, title, sub, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl, note, fallbackLabel, fallbackUrl, image, membersLine, imageAlt, imageFocus, reasons[], secondTitle, secondSub, memberTitle, memberSub, upgradeLabel, signinLine, portrait, signerName, signerRole, portraitAlt. Controls: Title size, Actions, Secondary style, Below the actions, Member visibility, Background role (universal), Vertical spacing (universal), Top divider (universal), Measure, Division, Actions alignment, Card padding, Inset, Card treatment, Alignment, Band edges, Action style, Field width, Note under the form, When a member is signed in, Text position, Content source (data), Picture side, Picture treatment, Title scale, Rule under the title, Sub under the rule, Rule below, Reasons position, Mark, Column planes, Column title size, Overlap, Signup, Sign-in line, Portrait, Portrait position, Signer source (data).
<!-- roster:A6 -->
1. **Centred** [Free] — The category floor — the ask centred on the page's own ground with nothing added to it, and the arrangement the panel advises whenever another design's picture, list or signature is absent.
2. **Flush Left** — The only design that draws a hairline above itself, and the only one whose right half is empty by arrangement rather than by a missing field.
3. **Split** — The only design that puts words and actions in opposite halves of one row, with the actions a right-aligned column rather than a row.
4. **Card** — The only design contained by a plane of its own — one surface card inset from the page margin with page ground on all four edges, so the section's boundary is an edge rather than a change of ground.
5. **Contrast Band** — The only design where the inverted ground is the design rather than a control value — and the only one that spends no accent at all, its action carrying the band's own colour.
6. **Inline Form** — The only design that takes input, so the only one with focus, invalid, submitting and done states — and the only one whose ground pairing runs the other way in dark.
7. **Full Bleed Image** — The only design whose ground is a photograph filling the section, and the only one carrying a flat scrim with a per-width value.
8. **Image Split** — The only design where a photograph sits beside the words rather than under them, with no scrim and nothing measured against the picture — and the only one whose alt text is drawn as an alt.
9. **Big Type** — The only design above the category's title ladder, and the only one where the sub and the actions share a line under a full-width rule.
10. **Slim** [Free] — The only single-row design, on its own 20/28/36 padding scale and A1·1's button rather than A6's hero scale, and the only one that draws rules of its own by default.
11. **Reasons** — The only design with a repeating unit — up to three short marked lines that read stronger than the sub — and the only one that borrows A5·11's mark without its accent.
12. **Pair** — The only design with two asks, two accent fills and no section heading — the section named by its eyebrow rather than by a title.
13. **Overlap** — The only design with a precondition, and the only one that crosses another section's edge — a card whose bottom sits over the footer's top, with the footer's padding absorbing it.
14. **Members** — The only design that reads Ghost's member state, and so the only one with three states — including one where the section does not render at all.
15. **Signature** — The only design whose copy has an author — a portrait, a signed name and a role sitting above the actions, and the only place A6 puts anything before the actions in the DOM.
<!-- /roster:A6 -->

**A7. Pricing & Tiers (15)** — Home, custom pages, A30's membership pages (page-backed `custom-{name}.hbs`). **Binds live Ghost tiers** (`{{#get "tiers"}}`: names, monthly/yearly prices, currency, benefits).
**Authoring rule, normative for every design that binds tiers — A7's 15, A22 #8, and A32's paywall designs under FR-H6.** Two constraints, both executed against Ghost 5.130.6 and 6.58.0 (VERIFY-AT-BUILD 14b, 33):
1. **Emptiness is tested on a *filtered* get, never on `tiers.length`.** The visibility filter is applied to the serialized rows *after* the count is taken, so an unfiltered `{{#get "tiers"}}` on a site whose only paid tier is hidden reports `length` = 2 and yields **one** row — and `{{#if tiers.length}}` around a pricing section then renders a heading with no cards. Always carry `filter="visibility:public"`, under which count and rows agree.
2. **No emitted `{{#get}}` uses `limit="all"`, and none exceeds `limit="100"`.** `GS090-NO-LIMIT-ALL-IN-GET-HELPER` and `GS090-NO-LIMIT-OVER-100-IN-GET-HELPER` are v6-spec warnings — invisible on Ghost 5, standing warnings on Ghost 6 against FR-J6's 0/0 target.
Content: image, recommendedTier, badgeLabel, note, payLabel, eyebrow, title, sub, freeLabel, memberTitle, memberSub, reasons[]. Controls: Billing period, Title size, Head alignment, Benefits, Member visibility, Background role (universal), Vertical spacing (universal), Top divider (universal), Row marks, Rows, Row padding, Row planes, Benefit columns, Division, Divider, Band edges, Panel style, Card padding, Free tier, Small tiers, Prices, Rules, Action, Alignment, Price scale, Rule, Tab style, Panel width, Free tier action, Row height, Actions, Current tier, Member head, Assurances, Mark, Lead price, Second price. Data: live tiers or sample; the member count on #12 comes from `{{total_members}}` — **a string, always**, since Ghost rounds it down and appends `+`, so no design may format, compare or compute on it.
<!-- roster:A7 -->
1. **Cards** [Free] — The category's floor: three equal cards on the page ground with nothing added to them, and the arrangement nine other panels advise rather than inventing one of their own.
2. **Table** — The only real <table> in A7, the only design that draws a benefit matrix at all, the only one that scrolls — at every width below 1081, the phone included — and the only one that takes a fourth tier.
3. **Stack** — The only arrangement in A7 that does not care how many tiers there are, which is why its two-line row is the layout the columned designs borrow at 1080 instead of inventing one of their own.
4. **Split Head** — The only design that puts every authored field in one column and everything from Ghost in the other, and the only one where the cadence switch belongs to the head rather than to the prices it sits above.
5. **Contrast Band** — The only design whose ground is the design rather than a control, and the only place in A7 where the recommendation substitutes its tokens instead of spending them.
6. **Single Tier** — The only design built for exactly one paid tier, the only one that sets a planed tier beside a tier with no plane at all, and the only one that advises upwards.
7. **Highlight** — The only design where the recommended tier is a different size from the others, and the only one that requires a recommendation in order to exist.
8. **Slim Row** — The only design with no head, no benefits and no descriptions, and the only one with a single action for the whole section instead of one per tier.
9. **Big Price** — The only design above the price ladder — 88 or 112 px — and the only one that refuses three tiers outright.
10. **Tabs** — The only design that shows one tier at a time, and the only one where the recommendation chooses what a reader sees first.
11. **Free and Paid** — The only design that draws free and paid as two different kinds of object rather than two of the same kind, and the only one that reorders its tiers on a phone.
12. **Ledger** [Free] — The only design with no planes anywhere, the only right-aligned price, and the only one that can drop the actions entirely.
13. **Members** — The only design that reads the reader — signed in, paid, and which tier — and the only one whose accent is computed rather than authored.
14. **Assurances** — The only design carrying a strip of site-written claims about the transaction beneath the tiers, and the only one that deliberately ships an empty field.
15. **Both Prices** — The only design with no cadence control at all — both prices are content on every card — and the only one with no behaviour of any kind.
<!-- /roster:A7 -->

**A8. Testimonials (15)**
Content: quotes[], image, avatar, sub, eyebrow, note, imageAlt, quote, name, role, org, title, linkLabel, linkUrl. Controls: Head, Quote size, Alignment, Attribution, Avatars, Member visibility, Background role (universal), Vertical spacing (universal), Top divider (universal), Title size, Cards, Card padding, Columns, Quotes shown, Rows, Head column, Foot, Card width, Rail edges, Rail controls, Division, Image side, Crop, Band width, Panels, Measure, Tabs, Tab row, Rules, Row padding, Lead, Lead size, Band height, Card position, Overlap.
<!-- roster:A8 -->
1. **Single** [Free] — The only design that draws one quotation with no card and no plane around it — the category's floor, and the arrangement eight other panels advise at a count of one. Nothing switches to it: a design placed on a page is the design that renders.
2. **Three Up** [Free] — The category's card grid at its home scale — three equal 416 px cards on the page's own ground — and the design whose 24 px gutter the shared two-column step at 1080 keeps. The step is a measurement every columned design shares, not a change of design.
3. **Two Up** — The only card grid whose quotation reaches Feature 27 inside the card, which is what a 632 px measure buys — and the only design in A8 whose step-down stops one step short of the ladder's floor.
4. **Grid** — The only design with more than one row of cards, and so the only one that has to settle row stretch — rows equal within themselves and never across the grid, with both alternatives refused by name.
5. **Wall** — The only design that gives up equal heights entirely — up to twelve quotations at their natural heights in CSS columns, with an uneven bottom edge as a stated outcome rather than a defect.
6. **Split Head** — The only design whose head is a column beside the quotations rather than a block above them, and so the only one that has to decide where the section's own two sentences go when the head is not on top.
7. **Slider** — The only design whose set overflows sideways instead of wrapping, with a card sliced by the page's right margin as its affordance — and the only one whose arrangement is identical at every width.
8. **Portrait** — The only design that draws a photograph of the person speaking, and the only one that suppresses the avatar because of it — a 36 px circle of the same face beside a 632 px photograph of it is the same fact twice.
9. **Contrast Band** — The only design whose ground is the design rather than a control value — 2 Three Up's arrangement on the inverted band, with every mix, the accent's substitution and the panel's disappearance at one quotation all following from the token pair.
10. **Big Quote** — The only design that reaches Display 40 outside a card, and the only one that drops the section's title by construction in order to do it — the quotation is the section's largest voice and there is no second one.
11. **Faces** — The only design that turns the attributions into the control — a reader picks a face and the quotation follows — and so the only one whose resting state hides most of what is authored in it.
12. **Rows** — The plainest thing the category can put on a page — quotations as hairline rows with the attribution in a caption column, no head, no card, no avatar and no accent pixel available to it — and the design three other panels name as advice.
13. **Highlight** — The only design that draws one quotation larger than its neighbours, taking that emphasis from the repeater's order rather than from any control — and the only one that settles how far one voice may lead: two steps of the ladder and no more.
14. **Slim Line** — The only design that fits a quotation and its source on one line, on its own compact padding scale, with a 120-character advisory no other design gives — and a wrap rather than a truncation or a switch past it.
15. **Overlap** — The only design that puts a quotation over a photograph, and the only one whose geometry reaches into the section below it — the card's overhang reserved out of its own bottom padding so no page needs to know it is there.
<!-- /roster:A8 -->

**A9. FAQ (15)**
Content: image, imageAlt, groupLabel, items[], group, anchor, id, title, sub, note, eyebrow, groups[], filterPlaceholder, noMatch, question, answer, linkLabel, linkUrl. Controls: Head, Title size, Question size, Marker, Open on load, Open rows, Member visibility, Background role (universal), Vertical spacing (universal), Top divider (universal), Divider, Rows shown, Rules, Columns, Questions shown, Cards, Head column, Foot, Group label, Index column, Index behaviour, Copy links, Band width, Numerals, Numeral position, Division, Image side, Crop, Image focus, Groups shown, Field width, Ask panel, Alignment, Row padding.
<!-- roster:A9 -->
1. **Accordion** [Free] — The category's floor accordion — one column of hairline rows with nothing added to it, the only design with no count control and the only one offering Open on load, and the arrangement seven others advise rather than inventing one of their own.
2. **Two Column** — The only design that divides one list into two independent columns — split by count and never equalised by height — which is what makes settlement 4's two refusals visible on the page.
3. **Open List** [Free] — The only design that draws every answer with no button, no marker and no region — nothing here can be hidden by a state, which is why ten accordion panels name it.
4. **Cards** — The only design that gives each question a card of its own, so what a reader sees is the item's geometry rather than the section's — and the only one where a row of items shares a height.
5. **Split Head** — The only design that puts the head in a column of its own beside the rows, so the publication's voice and the reader's questions sit side by side — and the head does not move when a row opens.
6. **Grouped** — The only design that draws every group's rows at once under its own label, so the list is grouped and complete at the same time — no container hides anything.
7. **Index** — The only design with a jump index beside its rows — the library's one sticky element inside a section and A9's one copy-link affordance, holding twenty-four questions by showing a reader the shape of the whole list.
8. **Contrast Band** — The only design on the contrast token — 1 Accordion's rows with every colour derived from the band's own pair, and the only section in A9 that can contain no accent pixel by construction rather than by an authoring choice.
9. **Numbered** — The only design that numbers its questions — the numerals in the pack's heading font at display scale, so an item's position in the list becomes the first thing a reader sees.
10. **Image Split** — The only design that reads image — a photograph on one half and the rows on the other, with neither column stretching to meet the other's height.
11. **Tabs** — The only design that shows one group at a time — and the only one whose resting state withholds its questions as well as its answers.
12. **Filter** — The only design with an input — a field that narrows twenty-four questions to the few a reader typed for, and the only place in A9 where content leaves the DOM.
13. **Slim** — The only design with no head at any value — its own padding scale, a 300-character answer ceiling and no lists or code, three or four short questions as a band inside somebody else's page.
14. **Ask** — The only design that ends in a contact panel — A9's one filled accent button, spending the section's whole accent budget on the reader's own question rather than on an offer.
15. **Ledger** — The only design that puts the question in a column of its own beside its answer, and the only one where the answer's measure and the row's width are the same number.
<!-- /roster:A9 -->

**A10. Stats & Numbers (15)**
Content: image, imageAlt, lede, value, prefix, suffix, label, note, prev, share, eyebrow, title, source, sourceUrl, linkLabel, linkUrl, sub, noteUrl, stats[], noteMarker, markerVisible, noteVisible. Controls: Head, Title size, Value size, Count, Dividers, Order, Count up, Icons, Value source (per stat), Background role (universal), Vertical spacing (universal), Top divider (universal), Cards, Card padding, Columns, Frame, Alignment, Label, Lead position, Lead side, Rules, Head column, Foot, Band width, Row padding, Bar height, Share figure, Division, Image side, Crop, Image focus, Measure, Lede size, Marker (per note), Show marker (per note), Show note (per note), Label position, Rule, Change line.
<!-- roster:A10 -->
1. **Row** [Free] — The category's floor and the row every other design is measured against — an undecorated set of equal cells carrying seven controls, more than any other design in A10, and the only one that will put the label above the value.
2. **Cards** — The only design that gives each stat a surface of its own — and, because a card has a visible edge, the only design in A10 that equalises the height of anything.
3. **Grid** — The only design that draws five stats, and the only one whose separation is a shared-edge hairline matrix rather than a gutter.
4. **Single** — The only design with no arrangement at all — one stat as the whole section at up to 128 px — and the design eight others advise when a single stat is authored.
5. **Lead Stat** — The only design that draws two value sizes at once, and the only one whose emphasis comes from the repeater's order rather than from any control.
6. **Split Head** — The only design whose head is a column beside the stats rather than a block above them, and the only one whose stat block holds the same internal width at both of its counts.
7. **Contrast Band** — The only design whose ground is the design rather than a control value — 1 Row inverted onto contrast, with the accent unavailable and the band's carried colour standing in for all three of its jobs.
8. **Ledger** [Free] — The only design that turns the stat on its side — label left, value right, on one baseline — and the only one that leaves 320 px of the content width deliberately unused.
9. **Bars** — The only design that draws anything other than type, and the only one with a precondition: a drawn stat without a share draws no track.
10. **Image Split** — The only design that reads an image, and the only one whose head sits in the column with the stats rather than above them.
11. **Inline** — The only design where the stats have a grammar — values set inside an authored sentence — and the only one that draws no list, no cell and no label.
12. **Sourced** — The only design that sources each stat separately, as numbered footnotes, and the only one that does not draw the section's own source line.
13. **Slim** — The only design with no head, no source line and no link at any setting — a short band on the one padding scale in A10 that does not step with width — and the only one that puts the label beside the value.
14. **Change** — The only design that draws a second figure per stat — the number this one replaced, with a glyph and one of four fixed wordings — and the only one that computes anything from two authored strings.
15. **Big Type** — The only design that gives one stat a whole row at 96 px, and the only one where two control values draw the same thing at ≤ 767.
<!-- /roster:A10 -->

**A11. Logo Walls (15)**
Content: lede, leadLabel, restLabel, logo, logoDark, alt, url, caption, eyebrow, title, sub, note, linkLabel, linkUrl, logos[], shape. Controls: Head, Title size, Logo size, Count, Treatment, Hover, Background role (universal), Vertical spacing (universal), Top divider (universal), Label side, Rule, Count per row, Cells, Last row, Panel padding, Card height, Cards, Head column, Band width, Rows, Speed, Gap, Edge, Arrows, Alignment, Captions, Lead count, Lead size, Rest count per row, Row gap, Measure, Lede size, Logo height.
<!-- roster:A11 -->
1. **Row** [Free] — The category’s floor — one row of equal cells with nothing added to it: no container, no caption, no second size and no behaviour, and the arrangement eleven other panels name as advice rather than inventing one of their own.
2. **Caption Row** — The only design where type and artwork share one horizontal band — a 13 px label in a 196 px column with the wall filling the 1,056 beside it — and the only one whose section field is required in practice for the design to exist.
3. **Grid** — The only design that draws more rows than it has counts and the only one offering a hairline matrix — the category’s answer to six to eighteen marks, and the design carrying A11’s one forced control value.
4. **Boxed** — The only design that puts the whole wall inside one surface panel with a hairline and the pack radius — the section’s own container rather than the item’s — and the only one whose inner padding is a control.
5. **Cards** — The only design that gives each logo a card of its own — the item’s geometry rather than the section’s — which is what makes a linked mark’s target the card instead of the artwork.
6. **Split Head** — The only design that sets the head, sub, note and link in a column beside the wall rather than above it, and — until the design patch pass — the only one whose foot left that column at 1080; it no longer does, because no stylesheet can reorder a document at a breakpoint.
7. **Contrast Band** — The only design on the contrast token, and the only one in the library that reads the dark-ground file in light mode and the light file in dark — the same wall as 1 Row, separated by its ground alone.
8. **Marquee** — The only design that moves without being touched — a full-bleed track in one or two rows, with a pause button that cannot be turned off, no cell grid and no pause on hover.
9. **Rail** — The only design the reader moves — a track wider than the window, scrolled by hand — and the only one whose furniture — its arrows and its fade — is decided by a measurement at render rather than by what was authored.
10. **Slim** [Free] — The only design with no type in it at all — a 92 to 148 px band of three to six marks with no head, note, link or accessible name, keeping ten of the fourteen fields and drawing none of them.
11. **Named** — The only design that draws a caption under each mark — equalised to the tallest caption in its row rather than in the wall — and so the only one whose item holds type as well as artwork.
12. **Tiers** — The only design that draws two box sizes in one section — the first one, two or three marks at Huge 64 or Large 48 and the rest at Small 28 — and the only one whose ranking comes from the item order rather than from a field.
13. **Dense** — The only design at Tiny 22 and six to ten across, where the aspect classes stop governing and the wall reads as a texture rather than as marks — and the design where the category’s twenty-four ceiling is reached.
14. **Inline** — The only design where a mark is a word rather than an item — two to four logos set inside one sentence, placed by chips in the lede — and the only one that keeps url and refuses to draw it.
15. **Big Type** — The only design where the type is louder than the artwork — a Display 48 title on a 1,040 measure over three or four marks — and the category’s only Display size, only 1,040 measure and only 64 px head gap.
<!-- /roster:A11 -->

**A12. About & Team (15)**
Content: eyebrow, title, sub, note, name, role, photo, url, bio, group, body, image, imageAlt, people[], text, socials[], linkLabel, linkUrl, photoAlt. Controls: Head, Title size, Photo size, Count per row, Cells, Socials, Background role (universal), Vertical spacing (universal), Top divider (universal), Card padding, Cards, Bios, Bio measure, Meta, Rule, Story, Photograph, Team count per row, Team photo size, Head column, Foot, Count, Crop, Caption, Name size, Band width, Division, Image side, Names, Row gap, Columns, Role, Density, Faces side, Faces, Width, Sentence, Alignment, Card width, Arrows, Bio opens, Start, Group label. Data: optional bind team to Ghost authors.
<!-- roster:A12 -->
1. **Grid** [Free] — The category's floor — a circle above a name and a role in equal cells, with no container, no bio, no second size and no behaviour: the arrangement ten other designs advise rather than inventing one of their own.
2. **Cards** — The only design where a person gets a plane of their own — a fill, a hairline and the pack radius around each card, equalised to its row's height — and therefore the only one where a short card is stretched rather than left short.
3. **Rows** — The only design that gives a person a full-width row — photograph at the left, the category's longest bio on an 824 measure with the remaining 344 left deliberately empty — and the only one whose collapse depends on the photo size rather than on the width alone.
4. **Story and Team** — The only design with prose and a group photograph of its own above the people — the one that reads body, image and imageAlt together — and the only section in A12 that renders with an empty people[].
5. **Split Head** — The only design that sets the head, the story and the foot in a 416 column beside the people rather than above them, and the only one that offers Count Two — where the person card turns side by side instead of stacked.
6. **Portraits** — The only design that draws a person at editorial scale — two or three named crops filling their cells, with the category's one scrim under an overlaid caption — and the only one that ends at a single column on a phone.
7. **Contrast Band** — The only design on the contrast token — 1 Grid's exact wall at the band's own vertical scale, separated from it by ground alone — and the only one in A12 where the accent is disabled with its ratio shown.
8. **Founder** — The only design that draws one person, and the only one whose two halves are vertically centred against each other — a named crop beside a 900-character letter, with no list in the DOM at all.
9. **Faces** — The only design that draws a face and a name and nothing else — eight to twenty-four circles at four, six or eight across, with the role kept and refused — and the only one where turning the names off moves the link and the alt text onto the photograph.
10. **Directory** [Free] — The only design that draws no photograph at any setting — names and roles in hairline rows, filled down and then across in one, two or three columns — and the only one that goes to a single column at every width.
11. **Slim** — The only design with no heading at all — a 96 to 144 px band of overlapped 32 px faces, one sentence and a link — and the only one that keeps url without drawing it, because no name is drawn to carry it.
12. **Big Type** — The only design that offers Display 48 — one statement on a 1,040 measure with a single row of three or four people under it — and the only one that holds authored people out of the DOM entirely rather than drawing them somewhere.
13. **Rail** — The only design the reader moves — a full-bleed track of portrait cards wider than the window — and the only one in A12 whose existence is decided by a measurement at render rather than by what was authored.
14. **Reveal** — The only design where a bio opens per person — 1 Grid's cells with a 38 px disclosure in each card, any number open at once — and the only one whose opened panel can be drawn outside the card that opened it.
15. **Groups** — The only design that regroups the list — labelled blocks in the order their first member appears, built from an authored per-person field rather than by sorting — and the only one in A12 with a second heading level.
<!-- /roster:A12 -->

**A13. Process / How It Works (15)**
Content: eyebrow, title, sub, body, note, linkLabel, linkUrl, image, imageAlt, label, duration, icon. Controls: Head, Title size, Count per row, Numerals, Rule, Background role (universal), Vertical spacing (universal), Top divider (universal), Marker, Connector, Body, Track, Numeral column, Body measure, Label, Duration, Card padding, Icons, Cards, Head column, Foot, Band width, Division, Crop, First step's media, Card width, Arrows, Numeral size, Numeral position, Alignment, Panel padding, Steps, Divider, Tab column, Panel media, Tabs, Lead, Separator, Pills, Width, Columns, Density, List column, List.
<!-- roster:A13 -->
1. **Three Up** [Free] — The category's floor — a numeral above a title above a paragraph in equal cells, with no container, no picture, no label and no behaviour: the arrangement five other panels advise rather than inventing one of their own.
2. **Track** — The only design in which a single hairline joins the steps rather than dividing them — three to five markers in one line with the connector running through them — and the only one whose defining element rotates rather than collapsing when the steps stack.
3. **Rows** [Free] — The only design that gives a step a full-width row with its numeral alone in a fixed gutter — the category's longest body on an 824 measure with the remaining 376 carrying the label at its far end — and one of four that take eight steps without changing shape.
4. **Cards** — The only design where a step gets a plane of its own — a fill, a hairline and the pack radius around each card, equalised to its row's height — and the only one where an icon sits on the title's own line rather than above it.
5. **Split Head** — The only design that sets the head, the section's prose and the foot in a 416 column beside the steps rather than above them, and the only one besides 9 Big Numbers that offers Title Large 40.
6. **Contrast Band** — The only design on the contrast token — 1 Three Up's exact grid at the band's own vertical scale, separated from it by ground alone — and the only one in A13 where the accent is disabled with its ratio shown.
7. **Alternating Media** — The only design where the picture changes side at every step — full-width halves, vertically centred against each other, with alternation as a rule and the side of the first step as the only control over it — and the one where the numeral plate is drawn at its largest.
8. **Rail** — The only design the reader moves — a full-bleed snap track of equal step cards wider than the window — and the only one whose arrows and fades appear only when the track is wider than the window — a measurement the module makes in the browser, never a switch between designs.
9. **Big Numbers** — The only design that spends the section's display moment on the numerals — 72 or 104 px figures above two to four steps — and the only one with a numeral-position control, because at that size the figure is a composition element rather than a marker.
10. **Panel** — The only design whose containment is the section's own — one surface panel holding every step as a hairline row — and the only one where the numerals sit at the right of the row rather than before it.
11. **Walkthrough** — The only design that shows one step and hides the rest — a column of tabs beside a fixed-height panel carrying that step's label, title, body and picture — and the only one in A13 whose heading level changes when JavaScript is off.
12. **Media Top** — The only design with a picture above every step in a grid of equal cells, and the only one that offers Portrait 4:5 or puts the numeral inside a marker on the picture itself.
13. **Slim Bar** — The only design with no heading at all — a 96 to 144 px band of numbered pills separated by chevrons, with a sentence at the left and a link at the right — and the only one that draws no body at any setting.
14. **Index** — The only design that draws every field of every step in aligned columns down the whole section — numeral, label, title and body in four hard columns on hairline rows — and the design four other panels advise when a site reaches seven steps.
15. **Sticky Rail** — The only design with a sticky contents list beside the steps, and the only thing in A13 that marks a current step — derived from the reader's scroll rather than authored, which is why a per-step “current” flag is refused everywhere else.
<!-- /roster:A13 -->

**A14. Galleries (15)**
Content: eyebrow, heading, blurb, credit, moreLabel, moreUrl, images[], image, alt, caption, link. Controls: Filter, Order, Count, Captions from titles, Columns, Crop, Gap, Captions, Lightbox, Background role (universal), Vertical spacing (universal), Top divider (universal), Lead position, Head, Head column, Controls, Peek, Frame height, Arrows, Gutter, Lead height, Lead width, Followers, Caption wash, Image side, Frame width, Rules, Numbering, Thumb, Row height, Box label.
<!-- roster:A14 -->
1. **Grid** [Free] — Six photographs in three even columns on the page ground, one enforced crop across every cell, each caption under its own frame. The category default. Every A14 grid goes to one column at 390 and stays the design it is — nothing in this category becomes anything else.
2. **Masonry** — Three columns filled top to bottom with the list in order, every photograph at its uploaded ratio, captions under each frame. Nothing measures and nothing packs.
3. **Mosaic** — A fixed tile: the first image at 2 × 2 cells, two cells stacked beside it, three in a row beneath. The lead is the list's first frame and no control changes that.
4. **Panel** — The head, the set and the credit inside one surface plane with a hairline and the pack's md shadow; three columns within the plane's 40 px padding. Nothing inside is raised again.
5. **Split Head** — The head, blurb and credit in a 380 column beside a 868 column holding the set two-up, on a 48 px gutter. Fewer, larger frames read alongside their context.
6. **Contrast Band** — 1 Grid's three columns standing on a full-bleed inverted band that carries the section's padding. The ground is the whole of the difference.
7. **Carousel** — One frame at a time on a snapping track at 968 × 726, the previous and next peeking 140 px at the margins, dots and a counter beneath, arrows beside the head.
8. **Filmstrip** — One horizontally scrolling row on a full-width surface strip: every frame at one shared height and its own native width, starting at the page margin and running off the right edge.
9. **Full Bleed** — The set edge to edge with a 1 px hairline gutter and no side margins; the head and the credit alone keep the page's measure. Captions live in the lightbox.
10. **Lead and Grid** — The first image across the full width of the page at a set height, its caption on the page margin beneath it, and the rest of the set in a contained three-up row below.
11. **Overlay** — Three columns of frames with each caption inside its own frame, on a warm wash over the lower 60%. No text sits outside a photograph except the head and the credit.
12. **Captioned Rows** — One photograph per row at 848 with its caption in a 400 column beside it, sides alternating down the page, a hairline between rows. Two to four frames.
13. **Contact Sheet** — The whole set as square thumbnails in six columns on a full-width surface band, each numbered from its position, nothing captioned on the page.
14. **Index** [Free] — The set as a ruled list: a mono number, the caption at 17 px in text, and a 128 × 96 thumb at the right of each row, hairlines between.
15. **Boxed** — Three columns inside a 1 px box at the pack radius with no fill, a mono label breaking the top edge, on the page ground. 4 Panel without the lift.
<!-- /roster:A14 -->

**A15. Video & Embeds (15)**
Content: eyebrow, heading, blurb, credit, queueLabel, embedKind, embedLabel, playLabel, watchLabel, openLabel, transcriptLabel, videos[], url, title, description, poster, duration, start, transcriptUrl, tabLabel, chapters[]. Controls: Width, Aspect, Alignment, Meta, Plays, Background role (universal), Vertical spacing (universal), Top divider (universal), Media side, Columns, Action, Head, Band edges, Caption, Height, Text position, Scrim, Play control, Gap, Lead size, Peek, Controls, Queue side, Queue height, Numbering, Chapter list, Rules, Timecodes, Shape, Label, Notice, Open link, Thumb side, Thumb size, Description, Thumbnail, Edges, Tab labels, Tab alignment. Data: the episode designs (#5, #6) bind posts via the FR-H2 Data group (Source **By tag**) — `{{#get}}`-driven, fixed Count, never paginated.
<!-- roster:A15 -->
1. **Player** [Free] — One film at 960 centred under a centred head, the duration on the poster, one meta line under it. The category default and the frame every other design is built out of.
2. **Split** — The film in a 720 column with eyebrow, heading, description, a labelled play action and the meta line held in a 480 column beside it. Two columns above 1,080.
3. **Panel** — Head, film, meta line and credit inside one surface plane with a hairline and the md shadow; the film at 960 within 40 px of plane padding.
4. **Contrast Band** — 1 Player's arrangement on a full-bleed inverted band: head in the carried colour, film at 960, meta line at 72%.
5. **Full Bleed** — The film at the viewport's full width, square-cornered, head above and meta beneath inside the page's margins. The only design that crosses the content box.
6. **Cover** — The poster full bleed at 620 with eyebrow, heading and meta line on a warm wash at its foot and the play control at the centre. Opens the theatre.
7. **Grid** — Six films in three even columns, each poster above its title and meta line, one reserved ratio across every cell.
8. **Lead and Grid** — Item 1 at the full content box with its title and meta line beneath, then the rest of the set in a row of three. Two frame sizes in one arrangement.
9. **Carousel** — One film centred on a native scroll-snap track with both neighbours peeking, dots, arrows and a counter beneath.
10. **Playlist** — A player and a queue on one surface plane: 800 × 450 beside a 400 px list of rows, the current film marked, the running total in the queue's head.
11. **Chapters** — One film at 960 with a ruled contents list beneath it: mono timecode at the left, chapter label at the right, each row a link that starts the film at that point.
12. **Embed Card** [Free] — One embed in a hairline box whose top edge names the kind and the provider, with the click-to-load notice above the frame and the description beneath it.
13. **Thumb Rows** — One film a row: a 320 × 180 poster at the left, title, description and meta line at the right, a hairline between rows. The only design that draws the description.
14. **Slim Bar** — One 88 px line on a surface plane: a 96 × 54 thumbnail, the title, a meta line and a watch action at the right. Opens the theatre at every width.
15. **Tabs** — A tab per film on a hairline strip above one shared frame, the active label underlined in accent, the active film's description and meta line beneath.
<!-- /roster:A15 -->

**A16. Contact (15)** — (No form backend in Ghost: actions compile to email links, portal actions, or an external form/calendar embed URL control.)
Content: deliveryTarget, eyebrow, heading, blurb, headingSmall, nameLabel, messageLabel, placeholder, buttonLabel, consentText, sentHeading, sentText, invalidText, failedText, postal, email, phone, replyHours, socialsLabel, socials[], socialsSource, socialsDisplay, locations[], enquiries[], reasons[], columnLabels, label, directionsLabel, image, imageAlt, imageFocus. Controls: Fields, Details column, Message height, Blurb, Socials display, Contact rows, Row icons, Background role (universal), Vertical spacing (universal), Top divider (universal), Labels, Form width, Card width, Head, Depth, Contact row, Plane padding, Band width, Columns, Dividers, Cell icons, Map side, Map height, Beside the map, Directions link, Map thumbs, Hours, Strip padding, Rules, Phone, Label, Address size, Alignment, Above the address, Address shown, Type row, The line beneath, Box width, Row height, Reasons column, Reasons, Image height, Form position, Scrim, Image focus.
<!-- roster:A16 -->
1. **Split** — The head and the publication's own contact details in a 560 column at the left, the form in a 640 column at the right on a 96 px gutter. The category default; nothing is raised, boxed or photographed.
2. **Centred** [Free] — A centred head on a 720 measure with the form beneath on 560, and no contact details at any value. The smallest complete form in A16.
3. **Card** — The form on an inset surface card raised off the page ground, with the head above it on the page. A19·3's card at A16's scale.
4. **Panel** — A raised surface plane the full content width, carrying the four contact rows across its top and the form beneath a hairline. The details and the form as one object.
5. **Contrast Band** — A full-bleed inverted band carrying the head and three contact rows at the left and the form at the right, with every colour derived from the two contrast tokens.
6. **Details Grid** — Four labelled detail cells across the content box divided by hairlines, with the social row beneath a rule. No form at any value.
7. **Map Split** — A static map holding one half of a surface plane and the address, hours and form holding the other. The map is an image with a link, never an embed.
8. **Locations** — One card per location on a full-bleed surface ground — map thumb, name, address, hours, directions. The only design in A16 built for a list of places. No form.
9. **Slim Bar** [Free] — A full-bleed surface strip between hairlines carrying a label, one address and the social row on a single line. No heading, no blurb, no form.
10. **Big Type** — The address at display scale with one short line above it and the social row beneath. The category's single display moment, spent on the thing a reader copies. No form.
11. **Enquiry Types** — A row of enquiry types above one form on a full-bleed surface ground. The choice sets the destination and the line beneath the row; the fields never change.
12. **Boxed** — The form inside a hairline box with no fill and no shadow, with the contact row and socials beneath it on the page under a full-width rule.
13. **Directory** — One ruled row per address — what it is, what to use it for, where it goes — as a three-column table on the page ground. No form.
14. **Reasons** — Head and form in a standing 640 column with one to three authored lines numbered and ruled in a 480 column beside them. A6·11's reasons list, carried verbatim.
15. **Cover** — A full-bleed photograph under a warm scrim carrying a centred head and a two-field form in white. The category's one image moment.
<!-- /roster:A16 -->

### Group 3 · Ghost Content Sections

**A17. Post Grids (18)** — Home, tag/author archives, custom pages. `bindingContext: posts` · `compileTarget: any` (native paginated context on collection templates, `{{#get}}` elsewhere — FR-H2).
Content: filterValue, postRefs, emptyHeading, emptyBody. Controls: Per row, Image ratio, Excerpt, Meta, First cell, Background role (universal), Vertical spacing (universal), Top divider (universal), Alignment, ~~Feature~~, Lead side, Head side, Scrim, Title, Rule, Columns, Rows, Date, Tag, Cycle, Thumbnail, Thumbnail side, Tags, Strip, Batch, Button, Count, Panel edge, Inset, Head, Text. Data: group per FR-H2 (+ **Pagination style** — A34 — on the designated main feed only).
<!-- roster:A17 -->
1. **Three Up** [Free] — Three 416 cells, image above tag, title, excerpt and meta. The category's default and what a site gets when it types "posts".
2. **Two Up** — Two 636 cells — the largest ordinary image in the category — with three lines of excerpt.
3. **Four Up** — Four 306 cells with two lines of excerpt — the densest grid that still carries one.
4. **Cards** [Free] — One post per card on a surface plane with a hairline, equalised per row. The only design in A17 that gives a post a plane, and the only hover lift.
5. **Lead and Grid** — The span as the design: first cell across two columns with the excerpt, the rest beside and beneath it. The one design where the feature span is not a control.
6. **Split Head** — Head, sub, note and link in a 416 column, the grid in the 856 beside it.
7. **Contrast Band** — 1 Three Up inverted onto the contrast token at the band's own vertical scale.
8. **Overlay** — Title and tag set over the image behind a scrim, at Portrait 4:5. The one scrim in A17.
9. **Big Type** — Titles at Display scale, two to a row, hairline-ruled, tag folded into the date line, no images at any setting — the text grid and the category's image-less fallback.
10. **Ledger** — Title, tag and abbreviated date on one hairline-divided row, two columns, rows as tall as their contents — the archive as a table.
11. **Masonry** — Three independent columns filled top to bottom with consecutive posts, each cell's ratio taken from a cycle indexed by ((row − 1) + (column − 1)) mod 3 — a diagonal, so no two rows align. Not true masonry: nothing measures, nothing packs, no JavaScript.
12. **Bento** — Five posts in a fixed two-column composition of unequal cells — one tall spanning two rows, two wide stacked beside it, two square beneath — the tall cell promoted by size, type step and excerpt.
13. **Thumb Side** — A fixed-size square thumbnail at the left of each row with title and meta beside it, two columns, no hairlines — the image sized rather than proportioned, so the row is identical at every width.
14. **Dense** — Six 196 cells carrying an image, a title and an abbreviated date and nothing else — the narrowest cell in A17 and its only use of the Six division.
15. **Filtered** — A strip of tag links above the grid with the current one marked — the only design with links outside its cards.
16. **Load More** — A three-up grid that appends the next batch in place under one centred button with a live count beneath it — the only design in A17 that grows, and the only one with a button.
17. **Panel** — The entire section — head, grid, note and link — inside one surface panel with a hairline and the pack's radius, the posts themselves left bare.
18. **Edge to Edge** — Squared images filling the full viewport with no gutter and no page margin, text inset beneath each — the category's only full-bleed design and its only unrounded image.
<!-- /roster:A17 -->

**A18. Post Lists (15)** — Same binding as A17; list-form. `bindingContext: posts` · `compileTarget: any`.
Content: filterValue, postRefs, emptyHeading, emptyBody. Controls: Rule, Row density, Excerpt, Meta, Meta position, Tag, "View all" link, Background role (universal), Vertical spacing (universal), Top divider (universal), Thumbnail, Thumbnail shape, Columns, Title size, Trailing, Date style, Author, Group by, Heading position, "Everything else" label, Head side, Band, Card, Alignment, Lead layout, Lead image, Followers, Number style, Panel, Head, Marker, Date, Detail, Batch size, Button, Button label. Data: group per FR-H2 (+ **Pagination style** — A34 — on the designated main feed only).
<!-- roster:A18 -->
1. **Rows** [Free] — Full-width rows on a hairline, text held to an 820 px measure at the left and a 200 px meta column hung at the right; no image at any setting. The category's default.
2. **Thumb Rows** — 1 Rows with a fixed-size thumbnail at the leading edge, the text measure paying for it and the meta still hung.
3. **Slim** [Free] — One post per line — title left, one trailing fact right, 44 px a row at Compact. The category's density floor.
4. **Dated** — A fixed date column at the leading edge with each post hung beside it, the author's name moved under the excerpt and the right of the row left empty.
5. **Grouped** — Rows cut into derived groups by month, year or tag, each under an eyebrow-sized heading above or hung left, rules running inside a group and stopping at its end.
6. **Split Head** — The section head in a 416 px column beside an 856 px list, its title one step larger than anywhere else in A18, the note and link inside the head column.
7. **Contrast Band** — 1 Rows' arrangement on the pack's contrast ground, full width or inset, with muted and hairline derived from the band's own text at 60% and 10%.
8. **Row Cards** — One post per full-width card — surface or ground, hairline, pack radius, 16 px apart, no rules — with a thumbnail at the trailing edge and the meta under the excerpt.
9. **Big Type** — Three to five posts as display-size titles on an 1,100 px measure with one quiet meta line each, the section head stepped down to Small so the posts can be the display moment.
10. **Lead and List** — The query's first post drawn large with the section's only picture, at two thirds of the content width, above the remaining posts as ruled lines at full width.
11. **Numbered** — Ruled rows with a tabular numeral in a fixed leading column at the title's size in the muted colour; the library's only ordered list.
12. **Panel** — The whole list inside one surface panel at a 48 px inset, dividers stopping at the panel's padding, the panel's edge closing the list; the head optionally moved outside.
13. **Timeline** — A vertical hairline with a marker at every post, dates right-aligned into it and titles beside it; the rail is the separator and there is no rule.
14. **Index** — Titles at the category's smallest size flowed down two, three or four columns with one optional fact each; the densest design in the library.
15. **Load More** — A thumbnail list drawn one batch at a time with a centred button below it that appends the next batch in place; the only design in the category that appends content, and one of its two that declare a module.
<!-- /roster:A18 -->

**A19. Featured & Spotlight (15)** — Binds featured or hand-picked posts. `bindingContext: posts` · `compileTarget: any`.
Content: eyebrow, title, sub, note, linkLabel, railLabel, linkUrl, image, source, filterValue, pickedPosts, count, order, fallback, url, featured, visibility, padding, titleSize, excerpt, meta, tag, ratio, mediaSide, alignment, divider, height, textPosition, scrim, card, cardPosition, imageWidth, columnWidth, railDetail, numeralSize, rowDensity, quoteMark, attribution, authorPhoto, label, detail, rule, trailing, carouselControls, quoteSize, railHeading. Controls: Media side, Ratio, Title size, Excerpt, Meta, Tag, Background role (universal), Vertical spacing (universal), Top divider (universal), Height, Text position, Scrim, Card, Width, Alignment, Band edge, Rule, Card position, Image width, Lead ratio, Divider, Starts, Count, Rail width, Rail detail, Rail heading, Numeral size, Row density, Quote size, Quote mark, Attribution, Author photo, Density, Label, Detail, Trailing, Navigation. Data: group per FR-H2 with Source defaulting to **Featured** — `{{#get}}`-driven, fixed Count, never the main feed and never paginated.
<!-- roster:A19 -->
1. **Split** [Free] — One featured post as a two-column split: text on a 560 px measure at the left, its feature image on 636 at the right, the two centred against each other. The category's default and the design the rest of it advises.
2. **Full Bleed** — One featured post whose feature image fills the section edge to edge, with the eyebrow, title, excerpt, meta and call to action set on the picture over a bottom-up scrim of the pack's contrast colour.
3. **Card** — One featured post on a surface or outlined plane inset 48 px from the content width, its picture held inside the card's 40 px padding at the left and the text at the right, the two centred against each other.
4. **Poster** — One featured post in a narrow centred column: the feature image at the column's full width in a portrait crop, the eyebrow, title, excerpt, author photograph and call to action beneath it, centred.
5. **Contrast Band** — 1 Split's two-column arrangement on the pack's contrast ground, full bleed or inset to the content width, with every on-band value derived from the band's own two colours.
6. **Big Type** [Free] — One featured post as type alone: eyebrow, hairline, the title at 52–72 px on an 1,100 px measure, the excerpt at 20 on 720, meta and call to action. No image at any setting.
7. **Overlap** — One featured post: a 16:9 picture at the content width or full bleed, with a 560 px surface card overlapping its lower edge by 64 px, inset 48 from the picture's left, right or centred.
8. **Lead and Two** — A spotlight on 848 with its picture at the leading edge and its text beside it, and two text-only followers stacked in a 424 px column at the right, separated by a hairline. Hierarchy by size alone: 34 against 20.
9. **Alternating** — Two or three spotlights stacked as full-width bands, 672 picture and 560 text with a 64 px gutter, vertically centred against each other, the picture's side swapping on every band. No ranking: every band is the same size.
10. **Pair** — Two featured posts as equal 636 px halves with a 24 px gutter, picture on top of each, titles from 28, both cells carrying the call to action. No lead, no ranking, and the count fixed at two.
11. **Lead and Rail** — A spotlight on 848 with its picture above its text, and every other post the query returned as a ruled rail of 18 px titles in the 424 beside it. The rail carries no pictures and no excerpts; it grows and shrinks with the count while the lead stays the same size.
12. **Picks** — Three or five featured posts as a ruled numbered feed: a zero-padded ordinal in a 96 px left column at the muted token, the tag, title and one line of excerpt on 720, the meta right-aligned to the content edge. No pictures at any setting and no call to action on a row.
13. **Quote** — One featured post's excerpt set at 34 px in the heading font at regular weight on a full-width surface band, with a quote mark above it, and the post's title at 20 px beneath as the attribution with a 24 px author avatar and the date. The writing is the headline.
14. **Slim** — One featured post on a single 64 px line of surface running the section's full width: label and 20 px title at the left, date and an accent arrow at the right, the whole strip one link. The smallest spotlight in the library.
15. **Carousel** — Three or five featured posts as full-width spotlights on a snapping track, one visible at a time: picture 768 at the left, text 480 at the right, a widening dot row beneath and A1·14's outlined arrows beside the head. Paged on demand, never automatically.
<!-- /roster:A19 -->

**A20. Tag Collections (15)** — Binds tags (name, description, accent color, feature image, post count) and their posts. `bindingContext: tags` (+ `posts` on the designs that show them) · `compileTarget: any`.
Content: tagPicks[], eyebrowText, headingText, introText, linkLabel, linkUrl, leadLabel, colTopic, colCovers, colPosts, allChipLabel. Controls: Background role, Vertical spacing, Top divider, Heading, Tag size, Counts, Alignment, All topics link, Tag colour, Background role (universal), Vertical spacing (universal), Top divider (universal), Per row, Image ratio, Descriptions, Plane, Thumbnails, Density, Head width, List columns, Band edges, Columns, Group by, Type size, Label, Rules, Cell width, Controls, Lead side, Lead ratio, Lead label, Column head, Box inset, Tile height, Name size, Scrim, Separator, All chip, Bar. Data: tag source (All / Hand-picked / Visible only), Count, Order (Post count / Alphabetical / Newest); the per-tag post rows (#3, #14) use the FR-H2 Data group — `{{#get}}`-driven, never paginated.
<!-- roster:A20 -->
1. **Chips** [Free] — The whole public tag set as one wrapping row of hairline pills under a head, with the count inside each pill. The category default.
2. **Tiles** — A four-up grid of picture tiles, one per topic, name and count under the picture.
3. **Cards** — The tag set on one raised surface plane, each topic a hairline card with name, count and description.
4. **Rows** — A ruled feed of full-width rows: square thumbnail, name, description, right-aligned count.
5. **Split Head** — Head in a fixed left column, the tag set as ruled name-and-count lists in two columns beside it.
6. **Contrast Band** — The wrapping pill row and its head on an inverted full-bleed band.
7. **Index** — The whole public tag set alphabetically in balanced columns, grouped under letter heads.
8. **Big Type** — Tag names set at display size, one per ruled line, with a small count at the line's end.
9. **Rail** — The tag set as picture tiles on a horizontal scroll-snap track that bleeds off the right page edge.
10. **Lead and Rest** — The first topic drawn at picture size beside the remaining topics as ruled name-and-count lines.
11. **Ledger** — The tag set as an aligned three-column table — name, description, count — on a raised plane.
12. **Panel** — Head and the whole tag set inside one hairline box, topics as ruled lines in columns.
13. **Overlay** — A few topics as full-picture tiles with the name and count set over a warm scrim.
14. **Slim** [Free] — One ruled line carrying a label, the topic names separated by a middot, and the all-topics link.
15. **Filter Bar** — The tag set as a chip bar on a raised surface, the current archive filled in accent, with an All chip at its head.
<!-- /roster:A20 -->

**A21. Author Showcases (15)** — Binds authors (name, bio, portrait, cover, socials, post count). `bindingContext: authors` (+ `posts` on the designs that show them) · `compileTarget: any`.
Content: authorPicks[], eyebrow, heading, blurb, railLine, actionLabel, actionUrl, linkLabel, linkUrl, colWriter, colWhere, colPosts, backgroundImage, roleOverride, emptyText. Controls: Background role, Vertical spacing, Top divider, Columns, Portrait, Portrait size, Bio, Post count, Social links, Background role (universal), Vertical spacing (universal), Top divider (universal), Card, Link line, Heading, Right column, Divider, Split, Roster columns, Action, Member visibility, Band padding, Alignment, Heading size, Portraits across, Blurb, Portrait side, Portrait ratio, Action label, Plane, Portraits, Writer count, Bar padding, Faces shown, Names in the line, Link, Rules, Name size, Head, Row height, Header row, Group by letter, Rail contents, Card width, Strip controls, Edge, Lead portrait, Lead bio, Lead meta, List columns, List counts, Height, Scrim, Image focus, Head position, Strip padding. Data: author source (All / Hand-picked), Count, Order (Post count / Alphabetical); the per-author post rows (#5) use the FR-H2 Data group — `{{#get}}`-driven, never paginated.
<!-- roster:A21 -->
1. **Grid** — Portraits over names in an N-column grid on the page ground, each writer with a count, two bio lines and an archive link. The category default and the arrangement the other fourteen depart from.
2. **Cards** — One raised surface card per writer, portrait left of the name, bio clamped at three lines and the link on a common foot. The category's tokenisation proof.
3. **Rows** [Free] — A hairline-separated row per writer: portrait left, name and bio in the middle, count and archive link held at the right edge.
4. **Split Head** — Heading, blurb and one action in a standing 400 px left column; the roster as a two-column grid in the 808 beside it.
5. **Contrast Band** — A full-bleed inverted band carrying the head and one row of portraits with names and counts.
6. **Founder** — One writer on an inset card: portrait at picture scale bleeding to the card's right edge, name at 40, the full bio, a meta line, a social row and one accent action. The design for the single-author site.
7. **Panel** — The whole roster on one raised surface plane in two columns of hairline rows, with a writer-count line at the plane's right edge.
8. **Faces** — A one-line credits bar between hairlines: overlapping portraits, an assembled "Written by" sentence with up to three linked names, and a masthead link at the right.
9. **Big Type** — Names at display scale on ruled lines, each with a leading portrait and a trailing post count. No ground of its own.
10. **Directory** — A ruled table of writers: portrait and name, location, and a right-aligned tabular post count, under authored column labels.
11. **Rail** [Free] — A 240 px margin rail carrying the label, the writer count and one action; the writers as names and counts in two ruled columns beside it. No portraits.
12. **Carousel** — A horizontally scrolling strip of writer cards with a 4:5 portrait, bleeding past the right margin, with arrows at the head and dots beneath.
13. **Lead and Rest** — One writer at size with portrait, bio, meta and link, then a rule, then the rest as a three-column list of names and counts.
14. **Image Band** — A full-bleed authored photograph carrying a warm scrim, the head in white and a row of portraits with names and counts along the foot.
15. **Slim** — A full-bleed surface strip carrying one assembled sentence of credits and a masthead link. The smallest author showcase in the library — 73 px including both hairlines.
<!-- /roster:A21 -->

**A22. Newsletter / Subscribe (16)** — Portal-bound (`data-portal` signup); members-aware (hides/swaps for members via FR-D16 preview). `bindingContext: none` (+ `@member`; `tiers` on #8) · `compileTarget: any`.
Content: eyebrow, heading, blurb, placeholder, buttonLabel, note, proofLine, doneHeading, doneText, invalidText, subscribedText, manageLabel, label, issuesLabel, archiveLabel, reasons[], quote, quoteAttrib, quoteDetail, image, imageAlt. Controls: Alignment, Heading size, Field width, Below the field, Blurb, Social proof, Background role (universal), Vertical spacing (universal), Top divider (universal), Card padding, Card, Card width, Split, Form side, Field, Band padding, Band edges, Plane, Picture side, Picture treatment, Image focus, Height, Scrim, Content position, Heading scale, Rule under the heading, Eyebrow, Strip padding, Rules, Label, Row detail, Members badge, Pre-ticked, Dividers, Reasons side, Reason marks, Reason size, Issue layout, Thumbnails, Issue meta, Archive link, Box padding, Box width, Arrives, Corner, Once dismissed, Cards across, Card meta, Description, Quote size, Rule under the quote, Attribution. Data: #7 Issue Preview uses the FR-H2 Data group (Source **By tag**) — `{{#get}}`-driven, never paginated.
<!-- roster:A22 -->
1. **Inline Row** [Free] — A centred eyebrow, heading and blurb with one form row beneath, on the page ground. The category default; nothing is raised, boxed or photographed.
2. **Card** — The centred ask on an inset surface card, raised on the page ground. The category's tokenisation proof.
3. **Split** — Head in a standing left column, the form in the column beside it on a fixed 96 px gutter. The design for a publication with a paragraph to spend.
4. **Contrast Band** — A full-bleed inverted band carrying a centred head and one form row, with the button in the carried colour rather than the accent.
5. **Panel** — The ask on a raised surface plane the full width of the content box, left-aligned, with internal padding fixed.
6. **Image Split** — A photograph holding one half of a surface plane and the ask the other, the picture bleeding to three of the plane's edges. The only design in A22 with an authored image and a drawn alt.
7. **Cover** — A full-bleed photograph under a warm scrim carrying a centred head and form in white. The only design in A22 where the field sits on an image.
8. **Big Type** — The heading at display scale on a 1,080 measure with a hairline under it and the form row beneath. No ground of its own and no blurb at any value.
9. **Slim Bar** — A full-bleed surface strip between hairlines carrying a label and one form row on a single line. The smallest newsletter section in the library — 93 px including both rules.
10. **Choice** — The site's newsletters as checkbox rows above one field. The design for a publication that sends more than one letter.
11. **Reasons** — Head and form in a standing left column with one to three authored reasons on hairlines beside them. The only design in A22 with an authored list.
12. **Issue Preview** — The ask above a rule with the last three issues beneath it as thumbnail rows read from Ghost. The only design in the category that shows what arrives.
13. **Boxed** [Free] — The centred ask inside a hairline box with no fill and no shadow, on the page ground.
14. **Slide-in Card** — A 380 px card arriving in the page's bottom corner after a trigger, carrying a short ask and a stacked form. The only design in A22 outside the document flow.
15. **Two Up** — One card per newsletter, side by side, each with its own name, description and field. Two independent forms in one section.
16. **Quote** — One authored reader quote at 28 px above a rule, with a small heading and the form beneath it. The only design in A22 that argues in somebody else's words.
<!-- /roster:A22 -->

**A23 Search is deleted (R-24, owner ruling 2026-08-27).** Search is not a section. Every one of its fifteen designs is cut — all but two drew an Inflozo results surface, and Ghost's `sodo-search` renders inside an **iframe** with its own injected stylesheet, so theme CSS reaches nothing inside it and its index carries no post body (`MEASUREMENTS.md` §29c). Search is now an **affordance with four values — Off · Icon · Button · Bar** — offered as a control on **A1 Headers**, and the **Link Picker gains "Ghost search" as a destination**, so any button or link in any category can open it without a new design, a new control or a new module. **No design in any category may draw a search results surface**, and none may bind ⌘K, which `sodo-search` already takes. `{{ghost_head exclude="search"}}` is never emitted. This is why the library declares thirty-three categories and not thirty-four.

### Group 4 · Template-Specific Sections

**A24. Post Headers (16)** — `post.hbs` and `page.hbs`. Binds title, excerpt, feature image (+alt/caption), tag, authors, date, reading time. `bindingContext: post` (opened inside `{{#post}}` on **both** templates — a page is a post whose data object is called `post`; see A25's dual-target rule and FR-H7) · `compileTarget: post.hbs, page.hbs`.
**`@page.show_title_and_feature_image` (normative, `page.hbs` only).** On `page.hbs` this flag is genuinely toggleable from Ghost's own page-builder settings and **must** be honoured, or the user's toggle does nothing: every A24 design wraps its **title and feature-image markup** — and nothing else — in `{{#if @page.show_title_and_feature_image}}` when it compiles into `page.hbs`. On `post.hbs` the flag is always `true`, so gating there is a no-op and is not emitted. It is the sole `@page.*` property the theme may reference (FR-I1, FR-J6).
Content: shareLabel, copiedLabel, bylinePrefix, readingTimeSuffix, filedLabel, publishedLabel, readingTimeLabel. Controls: Alignment, Title size, Standfirst lines, Image ratio, Rule, Background role (universal), Vertical spacing (universal), Top divider (universal), Meta placement, Split, Image side, Vertical alignment, Gap to the words, Height, Text position, Scrim, Text measure, Gap to the picture, Card style, Picture width, Card padding, Band height, Edge, Picture height, Card width, Overlap, Meta position, Cells, Cell position, Labels, Rules, Rail side, Rail width, Rail rule, Picture ratio, Bar height, Bar contents, Bar edge, Links, Link style, Divider, Layout, Measure, Column split, Column gap.
<!-- roster:A24 -->
1. **Centred** [Free] — Tag, title, standfirst and byline centred on one axis at three narrowing measures — 820, 720, 720 — with the feature image beneath at the full content width. The category default, the design a switch falls back to, and the only one that changes nothing in the Post block.
2. **Flush Left** [Free] — Tag, title, byline and standfirst left-aligned on the article's own 720 measure between two hairlines, with the byline between the title and the standfirst. The only design whose header measure is the body measure, and one of seven that draw no picture.
3. **Split** — The header's text in a 756 column with its type held to 560, the feature image in a 476 column beside it on a 64 gutter, the two cross-centred, the caption under the picture. The only A24 design in which the title and the photograph are side by side, and the only one with a genuine tablet arrangement.
4. **Image Top** — The feature image at the content width first, then tag, title, standfirst and byline beneath it on 1 Centred's measures, with the caption moved to the foot of the header under a hairline. One of two designs offering Panorama 21:9, and the only one whose caption is not adjacent to its picture.
5. **Full Bleed** — The feature image full bleed at a named height, the tag, title and byline on it in the contrast colour's text under a bottom-up scrim, the standfirst withheld. The category's only design with text on a photograph, its only image ground, and its only design with a stated precondition.
6. **Edge to Edge** — Tag, title, standfirst and byline on the page margin, then the feature image breaking the measure and running to both viewport edges with no radius, with the caption returning to the margin beneath it. The only design in A24 whose picture leaves the grid while its type does not.
7. **Card** — The header inside one surface card at the content width: the picture filling a 476 column, cover-cropped to whatever height the words produce, and the tag, title, standfirst and byline in the other at 40 px of card padding. A19·3's card reused verbatim with one change — it is not a link — and the only A24 design on a surface ground.
8. **Contrast Band** — The tag, title, standfirst and byline left-aligned inside a full-bleed band of the pack's contrast colour, 400 px minimum, flush under the nav, every colour in it derived from the band's own text. The category's only inverted ground and its only zero padding value.
9. **Overlap** — A photograph at the content measure, 520 tall, with a 700-wide surface card inset 40 from its left edge and riding 80 px over its lower edge; the eyebrow, title, standfirst and byline are all inside the card, and the caption sits beneath it. The only design in A24 whose picture is the ground its text sits over, and the only one that needs no scrim to do it.
10. **Big Type** — The title at 88 px across the full 1,296 content measure with an eyebrow above it and a byline at 36/15 below, closed by a hairline. No standfirst and no picture at any setting — the category's one display moment, its own title ladder, and the only design that takes the content measure rather than the 820 title measure.
11. **Dateline** — The title on the 820 measure with the byline broken into four equal labelled cells on the full 1,296 below it, hairlines above, below and between. The category's only table, its only design where the meta is the composition, and the only one that narrows a Post block field. No standfirst, no picture at any setting.
12. **Rail** — A 240 px rail on the left holding the tag, the byline, the date and the reading time one to a line at 15 px, a vertical hairline, a 72 px gap, then the title on 820 and the standfirst on 720 in a 984 column with the photograph beneath them at the column's full width. The category's one edge rail, and the one design that reads a Post block field as a line count.
13. **Sticky** — The tag, title and byline left-aligned on the 820 measure, plus a full-bleed 56 px bar that a script reveals and pins at the top of the viewport once the resting title has scrolled out of view, carrying the title truncated to one line at 15/600, the reading time, and a 2 px accent progress meter. The category's only sticky design, its only truncation, and one of only two that declare a module.
14. **Share Row** — The tag, title, standfirst and byline left-aligned on the 820 and 720 measures, closed by a hairline at 820, with a labelled row of two to four sharing destinations beneath it at 15/600 in text. The only design in A24 with a control a reader can press, and the only one with two authored labels of its own.
15. **Slim** — The title at 28 px on the article's own 720 measure with the meta line — tag, date, reading time — baseline-aligned at its right, and a hairline under both. 44 px tall at its default. No standfirst, no picture, no avatar, and the only design in A24 with both its own title ladder and its own padding ladder.
16. **Two Column** — The eyebrow and title in a 612 left column, the standfirst and byline in a 612 right column with a hairline between them, the two columns bottom-aligned so the standfirst sits on the title's last line, and the photograph beneath both at the full 1,296 with its caption. The only design in A24 that touches no Post block field.
<!-- /roster:A24 -->

**A25. Post Content Layouts (12) — the Post Content section.** A **dedicated designable section carrying its own design picker**, placed on `post.hbs` **and** `page.hbs`. It wraps Ghost's `{{content}}` output, and it is where the reading experience — measure, table of contents, drop cap, share rail, type scale — is **designed rather than inherited**. `bindingContext: post` · `compileTarget: post.hbs, page.hbs`.
**Dual-target binding (normative — and not an exception to FR-G3's enum).** On `page.hbs` Ghost's root carries **both** `post` and `page` keys pointing at the **same object**, so `{{#post}}` and `{{#page}}` both reach it; both official themes use `{{#post}}`, and **Inflozo emits `{{#post}}` on both targets** so one design compiles identically to each (`appendix-b1-template-contexts.md` §3, §4.2). `bindingContext: post` is therefore correct on both, and FR-G3's enum gains no `page` value.

**A post and a page are not the same *product*, and that difference lives in `compileTarget`.** A post is an article: it carries comments, an author byline, related posts and a reading table of contents. A page is a standing page — About, Our Story, Contact — and carries none of them, which is why **A26 post footers, A27 related posts and A28 comments declare `post.hbs` only** and can never be placed on a page canvas. What A25 does carry on both is the reading experience itself, and its defaults differ by target: on `page.hbs` the synthesized design ships **TOC off and share rail off**, because a standing page is usually short and rarely shared as an article — both remain available for the long-form exception (a detailed "Our Story", a documentation page). On `post.hbs` they default as before. The remaining target-specific obligation belongs to **A24**, not A25: on `page.hbs` `@page.show_title_and_feature_image` is genuinely toggleable and **must** be honoured (FR-I1).
Content: indexLabel, indexNote, shareLabel. Controls: Background role, Vertical spacing, Top divider, Measure, Type scale, Drop cap, Paragraph rhythm, Table of contents, Share rail, Anchor links, Background role (universal), Vertical spacing (universal), Top divider (universal), Sheet inset, Media in the sheet, Band padding, Band edges, Breakout, Caption, Space around media, Heading column, Levels that hang, Index position, Index style, Index columns, Rail position, Share style, Margin column, What moves out, Rules, Frame, Inset, Numbering, Number position.
**Card styling is not A25's (normative).** Every `.kg-*` selector belongs to `cards.css`, emitted by the card design module (FR-Q7); an A25 design **never** emits a `.kg-*` rule into `screen.css`, and the compiler asserts it. Where a design's identity depends on card-adjacent styling — **#9 Photo Essay**'s full-bleed image cards, **#12 Split Aside**'s callout margin column — it declares the card-treatment values it needs and they are emitted into `cards.css` with everything else, so the two files never carry competing rules for the same selector and there is no order-dependent contest to lose. Removing A25 entirely does not strand the treatment: FR-Q9 keeps the selection in Theme Settings.
<!-- roster:A25 -->
1. **Measured** — The article on a centred 720 measure with the index in one margin and the share rail in the other, both drawn in margin the measure already had, neither able to move the text. The category default and the design a switch falls back to.
2. **Plain** [Free] — The article on a centred measure and nothing else — no index, no rail, no ground of its own, no box. The category's floor, drawn as a design.
3. **Sheet** — The article on a surface sheet at the full content width, the measure unchanged inside it, a symmetrical inset the section owns, images able to run to the sheet's edges with captions returning to the measure, and the share row inside the plane. The category's one raised design.
4. **Contrast Band** — The article inside a full-bleed band of the pack's contrast colour, every colour in it derived from the two contrast tokens, the measure centred in the band, the index in band margin and — after this pass — one share mark on a surface derived from the band itself. The category's one inverted reading surface.
5. **Full Bleed** [Free] — A narrow text column with the images, galleries and embeds in the body breaking out of the measure — by default to the width the author already chose on each card, captions returning to the measure or to the right margin, and a symmetrical space ladder of the section's own around each break. The category's picture essay.
6. **Hanging Heads** — The article on its measure with every H2 — and optionally every H3 — moved into a 240 column in the left margin, top-aligned with the first line of the text it heads. The one design that makes structure visible without drawing a second list of it.
7. **Sticky Index** — An index in one margin that holds at 96 px from the top of the viewport and marks the section the reader is in, with the share buttons travelling on it. The category's only element that leaves the document flow.
8. **Index Top** — A ruled index on the article's own measure, above the first line, carrying the section count and the reading time, its entries in one, two or three columns. The only index in A25 inside the article rather than beside it, and the only one that survives at 390 intact.
9. **Share Rail** — One share mark in one margin at the article's first line — a link to Ghost's native share modal — with no index at any setting and the opposite margin left empty. The category's only design whose furniture is not a list of headings.
10. **Marginalia** — The article on its measure with figure captions — and optionally pull quotes — placed in a 240 column in one margin, beside the block they belong to, every caption treated alike however long it runs. The category's one design that moves the author's own elements.
11. **Ruled** — The article inside a hairline box that hugs the measure rather than the content width, with a rule above every heading or between every block, and an inset that is the same value in both directions. The category's one design drawn entirely in border.
12. **Numbered** — Every H2 — and optionally every H3 — numbered from the article's own heading order, the numeral hanging in a 72 px column left of the measure or sitting above the heading inside it. The category's one design that generates content, and it does it with CSS counters and no module.
<!-- /roster:A25 -->

**A26. Post Footers (15)** — Below content on `post.hbs`. `bindingContext: post` · `compileTarget: post.hbs`.
Content: tagsLabel, archiveLabel, archiveUrl, authorLinkLabel, shareLabel, copiedLabel, rowLabels, ledgerLabels, columnLabels, prevKicker, nextKicker, deskLine, subscribeHeading, subscribeLine, subscribeButton, subscribedLine, upgradeHeading, upgradeLine, upgradeButton, tags[], authors[]. Controls: Blocks, Width, Avatar, Bio lines, Rules, Share links, Author socials, Updated line, Background role (universal), Vertical spacing (universal), Top divider (universal), Row padding, Labels, Card width, Card inset, Band edges, Band padding, Alignment, Split, Column rule, Tile media, Tile height, Edges, Kickers, Title lines, Within, Tag style, Tag size, Tags shown, Archive link, Links, Link style, Bar padding, Name size, Rule, Post count, Portrait side, Portrait ratio, Portrait size, Prompt, Field, Member Visibility, Rail side, Rail contents, Rail width, Rows, Label column, Columns. Data: the related and series rows (#5, #12) use the FR-H2 Data group — `{{#get}}` by primary tag, fixed Count, never paginated.
<!-- roster:A26 -->
1. **Author Bio** [Free] — The four blocks stacked on the article's measure in the fixed order, each opening with a hairline, the author block carrying the weight — 56 px avatar, name in the heading font, two clamped lines of bio, the socials row, a link to the author's archive. The category default and the design a switch falls back to.
2. **Rows** — Every block a full-width row across the content measure, opened by a 120 px uppercase label column and closed by a hairline. The design that names its blocks instead of relying on their shape.
3. **Card** — The whole footer on one A19·3 surface card at the content width, symmetrical inset, md shadow in light and a hairline in dark, the plane leaving below 767. The category's one raised design.
4. **Contrast Band** — The footer inside a full-bleed band of the pack's contrast colour, every colour derived from the two contrast tokens, the blocks on the measure centred in it. The category's one inverted closing surface.
5. **Split** — Two columns across the content width — tags and the author left, the share row and the two destinations stacked right — divided by a hairline in the gutter. The design that answers the footer's two questions side by side.
6. **Slim** [Free] — One 44 px line under the article carrying the tags as a dotted run left and the share links right, on a hairline, with a second line for the destinations. The footer with no author block in it.
7. **Next and Prev** — The two destinations as tiles running to the viewport edges, each carrying its feature image behind a warm scrim with its kicker, title and byline, mirrored left and right. The category's one picture.
8. **Tag Row** — The post's tags as the whole footer, at reading size, in 44 px full-height targets under a small label, with one link to the archive. The design for a site whose tags are navigation.
9. **Share Row** — The share destinations alone on a surface bar at the content width, label left and links right, one 44 px row. The canonical home of the share block, and the reason A25's share affordance resolves to Off.
10. **Big Type** — "More from Rosa Menendez" at display size across the content width, the bio, a 40 px avatar and the socials row beneath it, then share and the destinations. The category's one display moment.
11. **Portrait** — The author as a 280 px portrait at 4:5 beside four lines of bio, the name at 28, the socials row under the words, tags above and the share row beneath. The category's one photograph of a person.
12. **Subscribe** — A subscribe prompt on a surface bar under the article — a line, a sentence, one field, one button — with no picture, no benefits, no tiers and no counts — and one ask per member state. The one place A26 asks for an email address.
13. **Rail** — The tags as a stacked list and the share destinations as A25·9's tower in a 240 px margin column, the author block and the destinations on the measure beside them, the rail leaving the margin at 1,200. The footer for a post whose article already uses its margins.
14. **Ledger** — A colophon for the post: a right-aligned label column and one line of fact per row — filed under, written by, published, updated, photography, share, read next — a hairline between each. The design that carries the credits and the dates.
15. **Grid** — Three labelled columns across the content width — written by, filed under, read next — the avatar above the name in the first, the socials row under its bio, the share row spanning beneath. A3·2's site footer, at a post's scale.
<!-- /roster:A26 -->

**A27. Related Posts (12)** — `{{#get}}` by primary tag with fallback to latest. `bindingContext: post` (+ the `posts` the `{{#get}}` block yields) · `compileTarget: post.hbs`.
Content: relatedTag, relatedAuthor, postRefs, headingText, fallbackHeading, archiveLinkLabel, readingTimeSuffix. Controls: Heading, Ratio, Excerpt, Meta, Tag, Background role (universal), Vertical spacing (universal), Top divider (universal), Width, Rule, Thumbnail, Panel, Band, Lead, Lead excerpt, Lead tag, Rail, Rail contents, Scrim, Title size, Alignment, Card size, Arrows, Columns, Numbering, Media. Data: group per FR-H2 with Source fixed to **primary tag → latest fallback** (built-in) and Count default **3** — `{{#get}}`-driven, never paginated (the post context has no pagination).
<!-- roster:A27 -->
1. **Three Up** [Free] — Three related posts as three equal cards under a labelled hairline, on the content width.
2. **Rows** [Free] — Related posts as titled rows on the article's measure, separated by hairlines, with no pictures anywhere. The design for an archive that is not illustrated.
3. **Thumb Rows** — A17's card turned on its side: a 96 or 128 px picture at the left of each row, the title beside it, the meta at the right edge, on the content width. The one picture design whose shape survives a phone.
4. **Panel** — The three-card set lifted onto one surface panel at the pack radius, head inside, page ground visible on all four sides. A plane instead of a hairline.
5. **Contrast Band** — The three-card set on the inverted band, edge to edge, with the head and every foreground in the carried colour. The only A27 design that changes the colour of the page.
6. **Lead and List** — One related post as a 636 card with its picture and excerpt, the rest as titled rows in a 588 column beside it, 72 px apart. The lead is the first in the set, not a choice.
7. **Rail** — The head in a 240 px margin column and the posts as rows in the 1,008 px body beside it.
8. **Overlay** — The title and its date over the picture, on 4:5 tiles with a warm scrim from the foot.
9. **Big Type** — Three or four related titles at 44 or 56 px, one under another, hairlines between, a byline under each. No pictures, no excerpts — the design 8 Overlay hands off to.
10. **Carousel** — A snapping strip of cards that runs past the right edge, with two arrow buttons on the head's line. The only design in A27 that declares a behaviour module.
11. **Index** — Related posts as a numbered, ruled index: number, title, tag, date and optionally reading time, in fixed columns. The densest design in A27 — four posts in 240 px.
12. **Next Up** — One related post as a 560 px picture beside a 34 px title, an excerpt and a byline. The only design in A27 that forces a value in the Data group.
<!-- /roster:A27 -->

**A28. Comments (10)** — Wrappers for `{{comments}}` (Ghost native). `bindingContext: post` (+ `@site.comments_enabled`) · `compileTarget: post.hbs`.
Content: headingText, rulesText, rules[], closedNotice, countSingular, countPlural, countEmpty, promptHeading, promptBody, promptButton, signinLabel, upgradeHeading, upgradeButton, showLabel, hideLabel. Controls: Heading, Count, House rules, Width, Background role (universal), Vertical spacing (universal), Top divider (universal), Head column, Sticky head, Panel width, Inset, Plane edge, Band edges, Alignment, Box width, Head row, Rail side, Sticky rail, Default state, Bar width, Prompt style, Form, Signed-out readers, Free members, Label, Count size, Number position, At zero. Data: none — comments are not exposed by the Content API, so the canvas renders the **comments fixture** — **14 comments across 9 threads**, five of them carrying one reply, one with a long body and one in the signed-out state (FR-H3) — and the live thread is Ghost's. The count header has a real two-digit number to render because of it. What a theme may style **inside** Ghost's native thread output is a verify-at-build item (`prd.md` §7.6); until it is answered these ten designs are scoped to the chrome around the thread — panel, count header, header size, width, signed-out note.
<!-- roster:A28 -->
1. **Rule** [Free] — One hairline, a labelled count and a line of house rules above Ghost's block, on the article measure. The category default and the one the other nine depart from.
2. **Split Head** — The head, count and house rules in a fixed left column beside Ghost's block. The design for a publication that moderates and wants its rules read.
3. **Panel** — The whole section on a raised surface plane, inset from its own edge, at the measure plus that inset.
4. **Contrast Band** — The section as a band of the pack's contrast colour, the measure centred in it, the block re-moded to match the band rather than the page.
5. **Boxed** [Free] — A hairline box round the head, the rules and the block, with the head in its own divided row at the top of the box.
6. **Rail** — The label, count and house rules standing in the page margin on A25's rail division, with Ghost's block in the 1,008 column beside them.
7. **Disclosure** — A full-width bar carrying the label, the count and a Show or Hide, with Ghost's block inside a native disclosure beneath it.
8. **Prompt** — The publication's own membership prompt in place of the block for readers who cannot comment, with the count of the discussion they cannot see — a count Ghost's script draws, and a form Ghost's script posts , so with JavaScript off the reader gets the prompt, no number, and a designed notice where the field was.
9. **Big Count** — The comment count set at display size in a column beside the block, with the label and house rules under it.
10. **Slim** — One line of muted type above the block, on no ground of its own, at the category's tightest spacing.
<!-- /roster:A28 -->

**A29. Archive Headers (14)** — `tag.hbs` / `author.hbs` heads; bind tag or author objects + post counts. **The per-design partition is withdrawn (R-16).** In the export A29 is **one design over three archives**:
every design reads whichever object the route provides — `{{#tag}}`, `{{#author}}` or a collection route's
own key — and **the eyebrow is what changes** ("Tag", "Author", "Archive"). No design is tag-bound and none
is author-bound, so `bindingContext: tag | author | collection` is declared **once for the category** and
the Shuffle ring is no longer partitioned. `compileTarget: tag.hbs, author.hbs` **and `custom-{name}.hbs`**
— R-7 adds the collection template, on which *From Ghost* resolves only via a page key and otherwise offers
Custom text alone. **A29 takes no third [Free] re-tier** (R-17): its old #7 was justified by an
author-bound partition that no longer exists.
Content: eyebrow, titleOverride, description, featureImage, backLabel, backUrl, actionLabel, actionUrl, actionIcon, links[], allTopicsLabel, allTopicsUrl, emptyText. Controls: Name size, Eyebrow, Description, Post count, Back link, Bottom rule, Background role (universal), Vertical spacing (universal), Top divider (universal), Split, Band depth, Alignment, Action, Member visibility, Plane, Height, Scrim, Image side, Image shape, Rail side, Rail contents, Gutter rule, Bar height, Rules, Count animation, Box padding, Tag row, Counts on tags, Row overflow, All topics link, Card width, Portrait, Meta line, Socials, Index list, Columns, Counts, Bar contents, Bar rule.
<!-- roster:A29 -->
1. **Centred** [Free] — Eyebrow, name, description and count centred on a 720 measure. The category default and the arrangement the other thirteen depart from.
2. **Split Head** — Name in a left column, description, count and back link in a right column on a fixed 100 px gutter. The design for archives that have a description.
3. **Contrast Band** — The head as a full-bleed inverted band directly under the site header, with the category's only resting-state action.
4. **Panel** — The head on a raised surface plane inset in the content box, count and back link at the plane's right edge.
5. **Full Bleed** — The tag or author feature image full-bleed under the site header, name and count on a warm scrim, bottom-left on the content box.
6. **Image Split** — The head in one half of the content box and the feature image in the other, vertically centred against each other.
7. **Rail** — Label, count and back link in a 240 px margin rail; name and description in the 1,008 px body. A25's division, reused verbatim.
8. **Bar** [Free] — A one-line surface band carrying the label, name, count and way back. The lightest head in the category and the only one that draws no description.
9. **Big Type** — The archive name at display scale across the content box, count in the opposite corner, no ground of its own.
10. **Boxed** — A hairline box on the page ground with the head centred inside it. A boundary rather than a surface.
11. **Filter** — The archive name over a row of sibling-tag links, the current one accent-filled, the row closed by an all-topics link.
12. **Portrait** — The author archive as an inset card carrying the portrait, name, bio, meta line, an optional social row and one action. The only design in A29 that draws a face.
13. **Index** — The archive head in a 416 column beside the full tag index in ruled columns, the current tag marked.
14. **Sticky** — A full head with a slim full-bleed bar at its foot that pins to the top of the window as the grid scrolls.
<!-- /roster:A29 -->

**A30. Members Pages (13)** — full-page membership designs; tier-bound; portal-wired. Ghost 6 has **no members template family**: the `signup.hbs` / `signin.hbs` / `account.hbs` trio under a `members` directory does not exist and never renders — that path is a fossil of the archived Lyra theme's own `routes.yaml` (`research-ghost-membership-pages.md` §9/§12). Each design is an ordinary **Ghost Page** whose template the user picks from the **Template dropdown** in Ghost's page editor — no `routes.yaml`, no Ghost Admin routing step. `bindingContext: tiers` + `@member` · `compileTarget: custom-{name}.hbs` (theme root, never a subdirectory; the filename becomes the dropdown label, title-cased — `custom-membership.hbs` → "Membership" — and is a **frozen public API** of the emitted theme once shipped — named, collision-checked and rename-blocked by the scheme in `prd.md` §7.4, enforced at the naming step in FR-I3). The stored `custom_template` survives a page rename; a slug-derived `page-{slug}.hbs` silently stops applying and outranks the user's own choice, so it is never emitted (`research-ghost-membership-pages.md` §0/§1/§2). Shuffle and Site Remix must not move an instance across the signup / signin / member-home boundary. **Paid CTAs gate on `@site.paid_members_enabled`, never on tier presence** — Ghost seeds a $5/mo "Default Product" tier at install, so a site that cannot take payment still returns a priced tier and would otherwise ship a dead buy button (§6). **Signin seam:** the form itself is themeable (`data-members-form="signin"`), but the one-time-code step hands off to a Portal modal Inflozo cannot design (§10).
Content: image, imageFocus, eyebrow, heading, blurb, emailLabel, placeholder, ctaLabel, note, legal, signinPrompt, signinLinkLabel, signupPrompt, signupLinkLabel, signinHeading, signinBlurb, signinCta, sentHeading, sentText, sentAgainLabel, codeLabel, codeCta, expiredHeading, expiredText, invalidText, signedInText, signedInCtaLabel, paymentText, accessLabel, accessText, benefits[], benefitsLabel, imageAlt, accountHeading, accountBlurb, rowLabels, endsLabel, signOutLabel, portalNote, tierNote, freeRowHeading, freeRowText, freeCtaLabel, periodLabels, railLabels, stepLabels, stepThreeText. Controls: Column width, Fields, Included list, Legal line, Sign-in link, Eyebrow, Note line, List marker, CTA icon, Background role (universal), Vertical spacing (universal), Top divider (universal), Case column, Form side, Card width, Card depth, Plane width, Plane depth, Included row, Band padding, Band width, Alignment, Button, Cover height, Scrim, Account band, Picture side, Text column, Picture crop, Period toggle, Card treatment, Marked tier, Benefits per card, Free row, Order, Heading size, Form, Blurb, Box width, Internal rules, Rail side, Rail width, Rail sticks, Rail marks, Row density, Ordinals, Row detail, Form position, Step numbers, Step one, Step three.
<!-- roster:A30 -->
1. **Centred** [Free] — One centred column on the page ground carrying eyebrow, heading, blurb, the email field and an included list under a hairline; the same column, widened to 640, carries the account rows. The category default.
2. **Split Pitch** — The case for membership in a 700 column with a numbered included list, and the form alone in a 520 column beside it. The left column is authored and never reacts to data.
3. **Card** — The whole page inside one centred surface card at the pack radius + 4 with a warm shadow, holding head, field and a three-line included list; the card widens to 760 for the account rows.
4. **Panel** — One raised plane the width of the content box carrying a centred 460 form and a four-column included row under a hairline. The same components as 1 with the ground changed.
5. **Contrast Band** — The whole page on one full-bleed inverted band carrying its own padding, form centred on 480, included list under a 20 % hairline. The only design in A30 with no accent on it.
6. **Cover** — The form over a full-bleed photograph under a warm scrim, every colour derived from the carried white. On /account/ the photograph becomes a 200 px band above rows on the page ground.
7. **Image Split** — The form and a three-line list in a 560 column on the page ground, with a photograph filling everything right of the 40 px gap to the viewport edge. No text sits on the picture.
8. **Tiers** — Ghost's tiers as three cards with a monthly-yearly toggle above them and the free option as an email row beneath a hairline. The only design in A30 that draws tier data.
9. **Big Type** — One authored sentence at 96 px with an inline field row beneath it and the blurb under a hairline. On /account/ the same treatment applied to the authored account heading at 72 px — the member's own name is no longer printed (patch pass).
10. **Boxed** [Free] — The whole page inside one hairline box at the pack radius with internal rules dividing head, form and included list. No fill, no shadow — the quietest containment in the category.
11. **Rail** — A 240 px rail beside a content column: the membership's own sections with the current one marked on /account/, and the included list on /signup/. The only design in A30 that draws navigation.
12. **Ledger** — Six authored ruled rows across the content box — mono ordinal, name, one muted line — with a price sentence and the form on a hairline at the foot. The only A30 design built for five or more included lines.
13. **Steps** — Three numbered steps on one raised plane — choose a tier, enter an address, open the link — with all three visible at rest. On /account/ the same numbering carries the member's three facts.
<!-- /roster:A30 -->

**A31. Error & Utility (10)** — `error.hbs` + special pages. **`compileTarget` per design, re-derived from the export** — the roster is contiguous 1–14 with no retired
slot, and **every design draws the private gate**, which is why #1 Centred and #2 Split Reason already give
`private.hbs` its [Free] pair and **#10's re-tier is withdrawn** (R-17). `error.hbs`: #1–#7 and #10 ·
`private.hbs`: all ten · custom page templates (FR-I3): #8 Elsewhere and #9 Directory — each on a `custom-{name}.hbs` under the same frozen-filename scheme (`prd.md` §7.4).
**A31's ids are now contiguous 1–10 (R-16).** The old roster skipped #8 because "Empty Tag State" had been retired — it declared a `compileTarget` of "the empty state of a collection template", which is not a file, and no surface could place it. **The export fills the slot with a real design**, `#8 Elsewhere` (recent posts under the message), so the gap closes and every id below is the export's own. The old warning against renumbering stands as a rule for the future — a renumber breaks references nobody re-checks — but it no longer describes this roster. `bindingContext`: `error` (`statusCode`, `message`, `errorDetails` — `research-ghost-binding-contexts.md` §10) on the error targets, `private` (`{{#if error}}` / `error.message` only — §11) on `private.hbs`, `none` on the utility pages. **A `{{#get}}` is refused on both `error.hbs` and `private.hbs` (R-7)**, which is a real constraint on `#8 Elsewhere`: its recent-posts block compiles only where the design is placed on a custom page template, and on the error target it renders its authored recovery list alone. Shuffle and Site Remix never move an instance to a different compile target.
Content: code, eyebrow, heading, blurb, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl, links[], linksLabel, image, imageAlt, imageFocus, postsLabel, directoryLabel, gateDisplayWord, gateFieldLabel, gateCtaLabel, gatePlaceholder, gateHelp, posts[], directory[]. Controls: Alignment, Measure, Code, Recovery links, Height, Eyebrow, Background role (universal), Vertical spacing (universal), Top divider (universal), Split, Gap, Divider, Card width, Depth, Box width, Box padding, Panel height, Block position, Band height, Button, Scrim, Image height, Row, Thumbnails, Columns, Item size, Rules, Display size, The gate's display slot. Data: the popular-posts block (#4) uses the FR-H2 Data group — `{{#get}}`-driven, fixed Count, never paginated.
<!-- roster:A31 -->
1. **Centred** [Free] — One column optically centred in the viewport — code chip, heading, sentence, primary action beside a text link, and the authored recovery list under a hairline. No box, plane or band. The category default.
2. **Split Reason** — Code, heading and sentence in the left column of the content box; primary action and recovery list in the right. Top-aligned, on an 80 px gap, with an optional hairline between.
3. **Card** — The stack inside one surface card centred on the page ground — pack radius + 4, one hairline, the warm md shadow, 720 wide with 40 of padding.
4. **Boxed** [Free] — One hairline box at 720 in the content box — no fill, no shadow — with the authored recovery links as ruled rows inside it, label left and URL in mono right.
5. **Panel** — One raised surface plane across the content box: message and action left, the recovery links in a right column behind a hairline. The page ground shows above and below, not around.
6. **Contrast Band** — The page as one inverted full-bleed band at viewport height, the block centred on it, every value derived from the band's carried ink. No accent, no plane, no shadow.
7. **Cover** — A photograph filling the page under a flat 45 % warm scrim, the block centred on it in derived carried values. At a 500 the photograph and the scrim hide and the block draws on the page ground .
8. **Elsewhere** — The message at 620, a hairline, then five destinations as A18’s ruled rows at 820 — authored by the publication and hard-coded 30 Aug 2026, where they were Ghost’s recent posts. On a 500 and on the gate the list, its label and its hairline hide and the message stands alone .
9. **Directory** — The message at 560, then the site’s sections at page scale in two ruled columns at 19 px — authored by the publication and hard-coded 30 Aug 2026, where they were Ghost’s own navigation. A 404 answered with a map. On the 500 and on the gate the directory hides and the message stands .
10. **Display** — The status code at 156 px in the heading font in the left column of an inverted full-bleed band; message, action and recovery list in the right. The category's one display moment.
<!-- /roster:A31 -->

### Group 5 · Ghost Native Elements

**A32. Paywall / Content CTA (12)** — **Non-placeable treatment** (see the carve-out above): the 12 designs are selectable inside the standalone **Paywall Template** editor, one active per project, and the compiler emits the chosen design as `partials/content-cta.hbs` — the override point Ghost renders inline at the members-only divider the user placed in the Ghost editor (`research-ghost-binding-contexts.md` §16). Tier-bound; portal-wired. A flagship differentiator. `bindingContext: post` + `tiers` + `@member` · `compileTarget: partials/content-cta.hbs` (rendered from `post.hbs`).
Content: eyebrow, heading, blurb, ctaLabel, signinPrompt, signinLinkLabel, manageLinkLabel, legal, benefits[], benefitsLabel, image, imageAlt, imageFocus, barLine, barSub, meterLabel, periodLabels, tierNote. Controls: Fade, Blur the last block, Action, Included list, Included list items, Eyebrow, Sign-in link, Button icon, Background role (universal), Vertical spacing (universal), Top divider (universal), Card width, Card depth, Overlap, Plane width, Plane depth, Alignment, Included row, Band padding, Band edges, Box width, Box rule, Split, Action side, Tiers shown, Order, Period, Benefits per card, Mark a tier, Row density, Detail line, Ordinals, Action position, Rows shown, Rows, Display size, Sentence, Cover height, Scrim, Cover edges, Image focus, Bar height, Bar ground, Bar width, At the cut, Dismissible, Meter style, Meter label, Meter width.
<!-- roster:A32 -->
1. **Fade** [Free] — The last visible paragraph fades into the page ground and the gate continues in the article's own measure — eyebrow, heading, sentence, button, sign-in line — with no box, plane or rule of its own. The category default.
2. **Card** — The gate inside one centred surface card at the article's measure, at the pack's radius + 4 with the md warm shadow, standing in front of the article's fade. 1's stack in a containment.
3. **Panel** — One raised plane the width of the content box carrying the gate centred on a 560 measure and a three-column included row under a hairline. 1's components with the section's ground changed.
4. **Contrast Band** — The gate as a full-bleed inverted band carrying the copy centred on 560 and a three-line included list, with every colour on the band derived from the band's carried colour. The category's one accent-free design besides 10.
5. **Boxed** [Free] — One hairline box at the article's measure with no fill and no shadow, holding the gate at 28 px of padding. Containment without a plane.
6. **Split Pitch** — The reason for membership in a 700 column with numbered included rows and the action alone in a 520 column beside it, across the full content box — a gate wider than the article it interrupts.
7. **Tiers** — A short centred head, the monthly-yearly toggle, and the publication's paid tiers as A7·1 cards side by side at the cut. The only A32 design that repeats an item.
8. **Ledger** — What a membership includes as six ruled rows across the content box — mono ordinal, name, one line of detail — with the heading and the action above them. Argument by enumeration.
9. **Big Type** — The gate's heading at display size across a 1,040 measure with one 18 px line under it and the button beneath — no list, no containment, no ground of its own. The category's one display moment.
10. **Cover** — A full-bleed cover 520 tall carrying a warm flat scrim, with the gate centred on it and every colour derived from the carried light. The only A32 design with an image, and the only one where it is required.
11. **Sticky Bar** — A 76 px surface bar pinned to the foot of the viewport carrying one line and one button, with an in-flow twin of the same line and button at the cut. The quietest gate in the category.
12. **Meter** — A 4 px meter across the measure showing how much of the post the preview was, its label in words, and the gate beneath it. The only A32 design that states a quantity, and the only one with no eyebrow.
<!-- /roster:A32 -->

**A33. Koenig Card Treatments (6)** — **Non-placeable treatment.** Site-wide `cards.css` styling for all Ghost editor cards (callout, bookmark, button, toggle, gallery, header, product, audio, video, file, quote designs). One treatment active per project, **chosen in the card design module (FR-Q7)** — the six treatments are its starting points, and the module is where each card is then designed individually. `bindingContext: none` · `compileTarget: assets/css` (`cards.css` — FR-J3).
Content: none authored in Inflozo — every field this category touches belongs to a Ghost editor card (`src`, `caption`, `html`, `emoji`, `rating`…) and is written by the customer inside Ghost. A33 styles those cards and stores only its own treatment controls, so there is nothing here that a design switch could lose. Controls: Space around cards, Captions, Credit line, Rules, Tinted cards, Emoji, Panel, Panel padding, Image in the panel, Plane width, Plane, Media on the plane, Media steps up, What steps up, Caption alignment, Full resolves to, Bleed applies to, Caption on a bleed, Band width, Which cards invert, Action on the band.
<!-- roster:A33 -->
1. **Plain** [Free] — Every card on the page ground at the article's measure, with no plane and no frame; a single hairline above and below the five cards that must read as one object — bookmark, toggle, audio, file, product — and a tinted plane on the callout and the call to action. The category default.
2. **Card** — Every card on a surface panel at the article's measure — hairline, pack radius, warm sm shadow, 24 px padding — with the media inset inside the panel and the caption in the panel with it.
3. **Panel** — The card's ground runs past the article measure to the wide column — 1,040 at 1440 — with the card's content held at 720 inside it and the media staying in the measure by default.
4. **Wide** [Free] — An image, a GIF and a video render one rung wider than the width their author gave them — regular at the wide column's 1,040, wide and full at the content box's 1,296 — with the text at the measure and the caption aligned to the media. A gallery and an embed keep the width Ghost fixes for them and do not step up (the owner's ruling of 28 August 2026).
5. **Full Bleed** — A media card marked full takes the viewport's whole width and drops its corner radius; wide takes the content box; regular stays in the measure; the caption returns to the 720 column beneath. Copy cards are 1 Plain's, unchanged, and only image, GIF and video may bleed — Ghost fixes the width of a gallery and of an embed and a theme may not override it, so neither can reach the viewport edge.
6. **Contrast Band** — Seven copy-bearing cards on the pack's inverted contrast colour at the wide column, carrying the carried text; the photograph cards — image, gallery, embed, video, GIF — left on the page ground untouched, and the three cards that carry the post author's own inline colours — signup, call to action, header — left exactly as the author set them, with the band running behind them.
<!-- /roster:A33 -->

**A34. Pagination Styles (10)** — **Non-placeable treatment.** Designs behind the feed Pagination control (FR-H2). Numbered designs compile to `/page/2/` links via native pagination context; Load More and Infinite ship JS with numbered-link fallback. `bindingContext: pagination` (page, pages, total, next, prev — `prd.md` Appendix B) · `compileTarget: partials/pagination.hbs`, rendered inside the designated main feed's section.
Content: navLabel, newerLabel, olderLabel, moreLabel, endLabel. Controls: Chevrons, Alignment, Separator, Density, Link size, Sublabel, Rule, Layout, Height, Edge, Rules, Contents, Elevation, Size, Counter size, Numerals, Arrows, Arrow style, Button style, Progress, Page links, Trigger, Status, Stop after, Back to top, Band height, Current page, Card style, Content, Single card, Direction.
<!-- roster:A34 -->
1. **Numbers** — A centred cluster of page links on the page ground, windowed to seven slots with an ellipsis where it skips, the current page marked by weight and a 2 px accent underline, a directional link at each end and a position line beneath. The plainest form of the window, and the category's default.
2. **Prev and Next** [Free] — Two directional links at the ends of the content measure, each with the destination's page number beneath, the position line centred between them, a hairline above. No page links, and the only A34 design that reaches the content edges.
3. **Bar** — A full-bleed surface strip between two hairlines, 72 px tall, holding the position line, the windowed page links and the older-posts link in three zones on the feed's own page margin. The only A34 design that shows all three at once.
4. **Pill** — The windowed page links and two chevrons inside one contents-width surface pill with a hairline and a warm md shadow, centred on the page ground, position line beneath. The current page is a filled inner pill rather than an underline — the only A34 design that changes that marker.
5. **Counter** — The current page and the total as one 52 px group in the heading font, three tones deep, with a 38 px icon button either side and nothing beneath it. A34's only display moment and its only design whose subject is position rather than navigation.
6. **Load More** — A17·16's centred button under the feed, appending one Ghost page per press, with a count line and a 320 px hairline meter beneath and the route's numbered links present in the markup at all times. The only A34 design that grows the feed rather than replacing it.
7. **Endless** — An invisible sentinel that fetches the next page as the reader nears the end of the feed, a 44 px surface pill pinned to the bottom of the viewport carrying the count and a Back to top link, a focus-revealed button in the flow, and a hard stop after four pages, past which the pill retires and a button takes the flow. The only A34 design with nothing in the page's flow at rest.
8. **Contrast Band** — A full-bleed band of the pack's contrast colour, 120 px tall, carrying the windowed page links at 17 px and the position line beneath, both in colours derived from the band rather than the palette. The category's only inverted ground.
9. **Cards** [Free] — Two mirrored surface cards at A17's 636 px cell width, 112 px tall, each carrying a 13 px direction eyebrow over the destination's page number at 20 px in the heading font, with the arrows at the pair's outer edges. The category's largest targets and its only contained items.
10. **Slim** — A single 44 px row under a hairline: the position line at 13 px left, "Newer" and "Older" at 15/600 with their chevrons right, divided by a 14 px vertical hairline. The smallest pager in the library and the only A34 design whose arrangement is identical at every width.
<!-- /roster:A34 -->

---


## Synthesis Defaults (FR-D6 — normative)

When a template in FR-I1's standard set is **untouched** (the user never edited it), the compiler MUST emit it from the default stacks below, so a home-only design still produces a complete, coherent, gscan-clean theme. Every design referenced here is **[Free]** (design #1 or #2 of its category) — an untouched template MUST always compile all-Free, on any plan.

### 1. Scope & trigger

- **Untouched** = the template has no `project_templates` doc, or its doc has zero sections. **Emptying any template returns it to untouched** — FR-I1 states the rule for members templates, but it is general, and its consequence differs by class: the **standard** templates listed below re-synthesize from these defaults on the next compile, while **conditional** templates (the never-synthesized set below) stop emitting entirely, together with any route they auto-added.
- Synthesized at **compile time only**; nothing is written to the project doc. Opening an untouched template in the switcher renders this same default stack as the starting canvas, **marked auto-generated** in the top bar and the Layers panel (FR-D6) — every default stack below must therefore be *renderable*, not merely emittable, and none of the six ever ships unseen; the first edit materializes the stack into the doc, clears the marker and the template becomes designed. Canvases that are **never** synthesized (the whole custom-template class — A30's membership pages included — plus Private; see the list below) have no default stack, so they open **empty**.
- Synthesizable templates: **`home.hbs`** (the site root — Ghost resolves it ahead of `index.hbs`, and FR-I1 emits it), `index.hbs` (the paginated continuation, `/page/N/`), `post.hbs`, `page.hbs`, `tag.hbs`, `author.hbs`, `error.hbs` — **seven**.
- **NEVER synthesized:** every `custom-{name}.hbs` — the whole custom-template class, which is what A30's membership pages are (page-backed custom templates — there is no members template family to synthesize; Portal serves the untouched flows — FR-I1) — plus `private.hbs` and `routes.yaml` entries. These exist only when the user designs them.

### 2. Inheritance from the Home canvas

Synthesized templates render inside `default.hbs` like every template, so chrome and style are inherited by **reference**, never cloned:

| Element | Rule |
|---|---|
| Header, Announcement bar, Footer | **Referenced.** Site-wide singletons (FR-D5) compile into `default.hbs` once; synthesized templates get whatever the user's Home shows. No announcement bar is ever synthesized. If the project has no header/footer singleton at all (nothing designed anywhere), synthesize **A1 #1 Rail** and **A3 #1 Minimal Line** with auto content (`@site.logo`/title, `@site.navigation`; CTA off, search off, member links on). Hidden/deleted footer on Free → FR-J15 credit fallback in `default.hbs`. |
| Style Pack tokens | **Referenced.** Project token set (FR-E1/E4) — one token block, all templates. |
| Koenig treatment (A33) | **Referenced.** Project-level choice; defaults to **A33 #1 Plain** if never set. |
| Body sections | **Never cloned from Home.** Each synthesized template uses its fixed default stack below (fresh compile-time instances with schema-default control values). |

Unless a row below says otherwise, all universal controls sit at schema defaults: Background role **Base**, Vertical spacing **Comfortable**, Top divider **None**.

### 3. Default stacks

#### `home.hbs` and `index.hbs` (both, only when Home is untouched)

Ghost resolves **`home.hbs` for the site root** and **`index.hbs` for `/page/N/`**, so an untouched Home synthesizes the **same stack into both files** — the root and its paginated continuation must not disagree about what the feed is.

| # | Section | Key values |
|---|---|---|
| 1 | **A17 #1 Three Up** (Post Grids) | **Main feed** (see "Main-feed rule" below). Pagination style = **A34 #1 Numbers**. All meta toggles on. Identical in both files, so page 1 and page 2 are the same design (FR-D21). |

#### `post.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A24 #1 Centred** (Post Header) | Binds title, tag, meta, feature image (skips image row when unset). |
| 2 | **A25 #1 Measured** (Post Content section) | Wraps `{{content}}`. **The synthesized design is #1** — the design picker opens on it, and the values below are #1's own control defaults (FR-F7), not a category-level stack: Measure **Narrow**, TOC **Off**, TOC style Plain, drop cap **Off**, share rail **off**, type scale **Normal**. Card treatment defaults to **A33 #1 Plain** by reference, per §2 — the Post Content section does not carry it (FR-Q7). **No paywall section is synthesized** — A32 is a non-placeable treatment emitted from the project's Paywall Template, and an untouched project has none, so Ghost's own content CTA renders at the members-only cutoff until one is designed. |
| 3 | **A26 #1 Author Bio** (Post Footer) | Portrait, bio, more-by link from post authors. |
| 4 | **A27 #1 Three Up** (Related Posts) | `{{#get}}` by primary tag, fallback latest (built-in), Count **3**. Never paginated. |
| 5 | **A28 #2 Split Head** (Comments) | `{{comments}}`; #2 over #1 deliberately — bare native output renders nothing when comments are disabled, no orphaned panel chrome. |

#### `page.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A24 #1 Centred** (Post Header) | Meta row (date/author/reading time/tag) **hidden** — pages aren't dated content. Title and feature image are wrapped in `{{#if @page.show_title_and_feature_image}}` (A24's `page.hbs` rule), which is what makes the two synthesized headers **not** byte-identical, so §7.4's hoist keeps them as separate partials. |
| 2 | **A25 #1 Measured** (Post Content section) | Same design and the same control values as `post.hbs` row 2 — A25 is target-agnostic and binds `post` on both templates (see A25's dual-target rule), so the two synthesize identically and the compiler's byte-identity hoist may legitimately merge them into one shared partial (§7.4). |

No post footer, related, or comments on pages.

#### `tag.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A29 #1 Centred** (Archive Header) | Tag name, description, post count; tag accent color when set (built-in). |
| 2 | **A17 #1 Three Up** (Post Grids) | **Main feed** (see "Main-feed rule" below). Pagination style = **A34 #1 Numbers**. All meta toggles on. |

#### `author.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A29 #2 Split Head** (Archive Header) | **The requirement is withdrawn.** A29 is one design over three archives in the export — every one of the fourteen reads whichever object the route provides (`{{#tag}}`, `{{#author}}` or a collection route), so no design is tag-bound and #1 is legal here too. #2 stays the synthesized default because its right column carries a description and a count, which is what an author archive has to say; **#12 Portrait** is the design to reach for when the site wants the author's face. |
| 2 | **A17 #1 Three Up** (Post Grids) | **Main feed** (see "Main-feed rule" below). Pagination style = **A34 #1 Numbers**. All meta toggles on. |

#### `error.hbs`

| # | Section | Key values |
|---|---|---|
| 1 | **A31 #1 Centred** (Error & Utility) | Numeral and message bound to the error context (`{{statusCode}}`, `{{message}}`) — as in every A31 error design — so one `error.hbs` serves 404, 500 and any other status (FR-I1 emits no `error-404.hbs`/`error-4xx.hbs`). Home link → `@site.url`. |

No feed, no pagination.

### 4. Main-feed rule (normative)

On every synthesized collection template (**`home.hbs`, `index.hbs`**, `tag.hbs`, `author.hbs`), the A17 #1 instance is the **designated main feed** (FR-H2):

- Bound to the template's **native paginated collection context** (`{{#foreach posts}}` over the context's posts array) — **NEVER** a fixed-count `{{#get}}` feed. Ghost's index/tag/author contexts each provide a posts array with pagination, so `/page/2/` works on every archive out of the box.
- Sized by the global `posts_per_page` (FR-Q1, default 12) — no Count control.
- Pagination style = **A34 #1 Numbers** (`/page/2/` links via native pagination context) — the only style that needs no JS fallback path (FR-G4 makes Load More **and** infinite scroll fall back to numbered links; Numbered *is* that fallback), which is why defaults never use Load More/Infinite.
- Exactly one main feed per synthesized collection template; the zero-feed SEO-guard branch of FR-H2 can never apply to a synthesized template.
- The only `{{#get}}` feed in any default stack is A27 Related Posts on `post.hbs` (post context has no pagination).

### 5. Invariants

1. Defaults reference only [Free] designs — design #1 of each category, or #2 where the stacks state the reason (A28, A29-on-author). A default stack MUST NOT change without updating this document; it is the single source of truth for FR-D6.
2. A fully untouched project (nothing designed) compiles to a complete valid theme from the Inheritance and Default-stacks parts above alone: 0 gscan errors, all FR-I1 files present, credits per FR-J15.
3. Synthesized output goes through the same section registry, partials, and CSS/JS pruning as designed templates (P4, FR-J3/J4) — synthesis chooses stacks, it does not use a separate render path.
