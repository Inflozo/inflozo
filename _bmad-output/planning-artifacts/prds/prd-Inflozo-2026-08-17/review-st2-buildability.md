---
title: Review ST2 — Section Buildability
scope: "Can a dev team actually build all 485 section variants from what is written?"
targets: sections-inventory.md (primary), prd.md §7.3 / FR-D / FR-E / FR-F / FR-G / FR-H / FR-Q / Appendix A–D / §8 E9–E11, appendix-b1-template-contexts.md, appendix-h1-string-catalog.md, spike-compiler/sections/*.html
date: 2026-08-18
---

# ST2 — Section Buildability Review

## Verdict

**Not yet buildable as a whole. Buildable today for roughly 300 of 485 variants; ~185 sit behind six blocking gaps, and one of those gaps (the JS behavior contract) has no owner document at all.**

The good news first, because it is real and the owner should not re-litigate it: the **arithmetic is exact** (34 categories, 485 variants, 70 [Free], waves 156/199/130 — all verified by parse, zero discrepancies), the **non-placeable carve-out is consistently applied** in all nine places that quantify over "every variant", the **Ghost-bound categories (A17–A21, A24, A26, A27, A29) are genuinely well specified** by Appendix B + Appendix B.1, the **Synthesis Defaults are precise enough to implement from**, **Free-tier gating changes nothing about how a variant is authored** (FR-L3 is an exit gate; only A3's credit toggle is tier-aware), and **"a category is a story, not a variant"** is the right granularity.

The problem is not that one-line descriptors are too thin. In most categories they are exactly right. The problem is that **the category headers were written as a description of the category's centre of gravity, not as the union of what its variants need** — so a dev assigned A4 or A16 runs out of schema on the sixth variant, while a dev assigned A13 or A14 never does.

---

## Per-group coverage table

| Group | Categories | Variants | Content schema covers its variants | Controls closed-valued | Data/binding declared | JS behaviors named | Buildable without a question? |
|---|---|---|---|---|---|---|---|
| **1 · Structure & Chrome** | A1–A3 | 47 | ~38/47 (9 gaps) | layout picker open; rest closed | A1 yes; A2/A3 no Data line (correct) | 0 of 6 needed named | **No** — A1 needs 4 behaviors, A2 needs 4 |
| **2 · Marketing** | A4–A16 | 199 | ~152/199 (47 gaps) | layout picker open; 12 more open | **A4 contradicts its own binding declaration** | 2 of ~14 named | **No** — A4, A2-adjacent, A16, A10, A12 all need a spec round |
| **3 · Ghost Content** | A17–A23 | 109 | ~104/109 (5 gaps) | layout picker open; rest closed | **Best in the doc** — per-category Data lines, FR-H2, Appendix B.1 | 3 of ~7 named | **Mostly yes** — A17/A18/A19/A20/A21 are build-ready |
| **4 · Template-Specific** | A24–A31 | 102 | ~98/102 (4 content gaps + 6 structural) | closed | **Excellent** — per-variant `bindingContext`/`compileTarget` on A29/A31, research-backed A30 | 1 of ~6 named | **Mixed** — A24/A26/A27/A29/A30/A31 yes; A25 blocked on A33 collision |
| **5 · Ghost Native** | A32–A34 | 28 | A32 yes; **A33 has no spec beyond a parenthetical**; A34 yes | n/a (no per-instance controls) | declared | 2 of 3 named | **No** — A33 is 6 stylesheets with an 11-word spec; 2 A32 variants are not implementable |
| **Total** | 34 | **485** | **~422/485 (63 content gaps)** | **30/34 categories lead with an undefined control** | 15/34 declare Data | **10 named, ≥30 required** | — |

*"Gaps" = variants whose one-line descriptor requires at least one content prop the category's `Content:` line does not declare. Each is enumerated below so the count is checkable, not asserted.*

---

## The one-line-description question, answered directly

**Where one line is enough — do not add anything.** A13 Process (0 gaps), A14 Galleries (0 gaps), A17 Post Grids, A18 Post Lists, A21 Author Showcases, A24 Post Headers, A27 Related Posts, A34 Pagination. In these, the category header declares a schema that is genuinely the union of the variants, the descriptor names only *arrangement*, and arrangement is what a dev is being paid to decide. "Masonry — natural-height column flow" needs nothing more. A29's per-variant `bindingContext` declaration is the model the rest of the doc should have followed.

**Where one line is not enough** — and this is the whole finding — is where the descriptor quietly introduces a **noun that is not in the schema** ("a three-stat row", "a trusted-by logo row", "a supporting stat", "a live countdown", "up to 3 messages", "annotated callouts", "the member count") or a **verb that is not in any behavior list** ("crossfading", "counting", "expanding", "swapping"). A noun or a verb outside the declared model is exactly the case where two devs build materially different things. Everything below is one of those two cases.

---

## CRITICAL

### C1 · A4 Heroes: 12 of 18 variants need something the category does not declare, and 2 contradict its own binding rule
`Content: eyebrow?, headline, subhead?, primary cta, secondary cta?, media (image?/none), badge?` · no `Data:` line.

The inventory preamble states Groups 1–2 (A1–A16) are `bindingContext: none`, naming **A7, A12, A15** as the only Data-group opt-ins. A4 is not named. But:

- **#5 Feature Post Hero** — "binds the latest featured post as the hero story." That is `bindingContext: posts`. No Data group, no Source, no Count, no fallback when nothing is featured.
- **#6 Portrait Intro** — "(binds author)". That is `bindingContext: authors`. Same absence. FR-D12/D13/D17 filter Picker/Shuffle/Remix on `bindingContext`; with A4 declared `none`, both variants are placeable on templates that cannot serve them, and per Appendix B.1 §0 they render blank with no error anywhere in the chain.

And the schema gaps: **#7** inline portal signup (no portal control on A4), **#9** issue meta, **#11** three-stat row, **#12** three-image collage (schema has a single `media`), **#13** typed strings, **#14** search field, **#15** logo row, **#16** standalone signup card, **#17** embed URL + modal, **#18** tag/topic ticker source.

A4 is also the control-density pilot (E4/E5 gate on A4 #2). **A whole-category spec round before E10 opens.**

### C2 · No JS behavior-module contract exists anywhere, and FR-J4's module list is a 3× undercount
§7.3 says a variant is "annotated HTML … plus one plain CSS file, **an optional JS behavior module**, and its schemas." FR-G3's registry carries `js?`. **Nothing anywhere defines that module's interface** — no mount convention, no init/teardown, no idempotency rule, no statement of whether behaviors run inside the canvas iframe (does a marquee scroll while you are editing? does a countdown tick? does a modal open on click in the editor?). The only stated contract is FR-J4's "carries its FR-Q6 strings as `data-i18n-*` attributes on its mount element."

**0 of 34 categories reference a behavior contract, because none exists.**

FR-J4 names **10** modules: mobile nav, load-more, infinite scroll, marquee, accordion, lightbox, TOC scroll-spy, count-up, mode toggle, A23 search client. Parsing the inventory, **81 variants across 24 categories describe motion, timing, state or a data fetch**, requiring at minimum these **20 further modules**:

countdown timer (A2#6, A6#11) · message rotator/crossfade (A2#9, A8#9) · dismiss + persistence (A2, all 15) · tabs (A1#16, A5#9, A9#8, A13#9, A20#4) · carousel/snap with dots and arrows (A8#7, A14#3, A19#4, A20#9, A27#4, A27#9) · sticky/shrink + scroll-state header (A1 sticky control, A1#6) · desktop drawer with focus trap (A1#11) · search field expand/takeover (A1#12, A23#14) · keyboard-shortcut palette (A23#4) · modal video player (A4#17, A15#3, A15#8) · reading-progress bar (A24#15) · share + copy-link (A25#5, A26#2, A26#10) · billing period price swap (A7#4 + the billing toggle on A7/A30/A32 = 40 variants) · members form submit with success/error states (A30 #1–#10) · typewriter (A4#13) · particle/confetti (A2#15) · animate-on-scroll bars and rings (A10#10, A10#15) · randomize + refresh (A27#11) · slide-in sticky card (A27#12) · toggle-reveal (A28#3).

**Consequence beyond authoring:** NFR-2's `< 40 KB gzipped for a maximal design` was sized against 10 modules. A maximal design under the real list is ~30 modules. The budget is not merely tight — it was derived from an incomplete inventory, and it is a CI-asserted gate.

### C3 · "Layout picker" — the first Quick Control on 30 of 34 categories — has no defined value set, and the doc disagrees with itself about what it is
Appendix C: `Layout Picker | mini-diagram thumbnails | **per-section layouts** | the primary "arrange without CSS" control`. That is not a closed value set; §7.3 mandates that every control resolve to a declared finite set because closed values are what make the `data-{control}` attribute mechanism work.

Two readings, both supported by the text, producing completely different builds:

1. **It is the variant selector.** Supported by A32, whose equivalent control is literally `design picker (the 12 below)`. Under this reading the section stylesheet does *not* select on it, it duplicates FR-D13's Variant Shuffle with a second UI, and 30 categories need no per-variant layout enumeration at all.
2. **It is a sub-layout within a variant.** Under this reading **every one of 485 variants needs its own enumerated layout value list**, and none exists.

Reading 1 is almost certainly intended, but **A25 has 12 variants and no layout picker at all** — so under reading 1 there is no way to reach A25 #3 TOC Left except by shuffling, which is a real UX hole, and under reading 2 A25 is the only category with no arrangement control. One sentence fixes this; without it, the primary control of the product is undefined.

### C4 · The "shared per-category content model" that FR-D13/FR-D17 gate on does not exist as written
FR-D17's play-loop gate — the only mechanical gate on §1.2's central claim — is **zero prop loss across 20 shuffles and a full re-roll**, achieved "via the shared per-category content model (FR-D13)". That model is the category's `Content:` line. **~63 of 485 variants (13%) need a prop that line does not declare.** Either the `Content:` lines become the union (the right fix — it is one editing pass over 34 lines, not 485 specs), or the gate is unmeetable because shuffling A4 #1 → #11 has nowhere to keep the stats.

Full enumeration, by category, of variants needing an undeclared prop:

| Cat | n | Variants | Missing prop |
|---|---|---|---|
| A1 | 3 | #5, #10, #12 | social links in the utility bar; search placeholder (search is a toggle only) |
| A2 | 4 | #5, #6, #7, #9 | emoji; **countdown target date**; second CTA; **`messages[]`** (schema has singular `message` while Controls declares "rotation (for multi-message)" — a direct self-contradiction) |
| A3 | 2 | #8, #14 | CTA band heading/cta (A3 has no cta prop); colophon body |
| A4 | 12 | see C1 | see C1 |
| A5 | 4 | #3, #7, #11, #16 | per-item prominence; **callout coordinates** (and no legal control type exists — P2 forbids units/percent); without/with pairing; per-item stat |
| A6 | 4 | #10, #11, #14, #15 | two option cards (no `items[]`); deadline; quote + avatar; emoji |
| A7 | 3 | #3, #12, #13 | "popular" badge label; **member count (not bindable — see C5)**; `faq[]` |
| A8 | 3 | #10, #13, #15 | per-item company logo; per-item embed URL; per-item metric |
| A9 | 2 | #8, #10 | per-item category; per-item icon |
| A10 | 5 | #7, #8, #10, #12, #15 | sentence template with slots; per-item date; **numeric percent** (schema `value` is a display string like "3.2M"); per-item icon; numeric percent |
| A11 | 3 | #9, #11, #12 | proof metric; container label tab; cluster labels |
| A12 | 5 | #4, #10, #12, #13, #15 | dated timeline events; per-image captions (`images[]` is bare); stats; opening quote; join-us CTA (A12 has no cta prop) |
| A15 | 1 | #13 | device choice — the `frame` control offers "Device" with no phone/laptop selection |
| A16 | 5 | #6, #7, #9, #11, #14 | static map image; **`locations[]` has no declared shape at all**; `faq[]`; routed option cards; community option cards |
| A19 | 1 | #11 | pull-quote source (see C5) |
| A20 | 1 | #7 | curated set names + descriptions |
| A21 | 1 | #7 | Q&A pairs |
| A22 | 2 | #6, #12 | avatar cluster; quote |
| A23 | 2 | #4, #15 | key-hint label; illustration slot |
| A30 | 2 | #7, #12 | quote + avatar; explainer body |
| **Total** | **~63** | | |

### C5 · Six variants describe a capability no Ghost data surface supports
Appendix B is the normative data catalog. These six ask for something it does not contain, and no research file rescues them:

| Variant | Asks for | Reality |
|---|---|---|
| **A7 #12** Founding Member | "member count line" | Member counts are Admin API only, never in template context or the Content API. Not renderable. |
| **A29 #13** Filter Bar Attached | "sort/paging strip" on an archive | Ghost archives accept no sort or filter URL params. Paging is real; sorting is not. |
| **A32 #10** Blurred Preview | "blurred next-paragraphs behind card" | Ghost does not send gated paragraphs to the client. There is nothing behind the card to blur. The same defect sits in the **`preview treatment (None/Fade/Blur)` control** applied to all 12 A32 variants — Fade over the *visible* tail works; Blur of unsent content does not. |
| **A32 #12** Progress Tease | "you've read 30%" | The percentage of a gated post that was read is not computable — the denominator is never delivered. |
| **A27 #11** Discover Shuffle | "randomized picks" | `{{#get}}` has no random order and compile output is static. Achievable only as client-side shuffle over an over-fetch; unspecified, and FR-G4's JS-disabled rule is unaddressed. |
| **A19 #11** Quote Feature | "pull-quote from the post" | Ghost has no pull-quote field, and NFR-3 forbids the canvas reading post body HTML. Probably means `custom_excerpt` styled as a quote — but that is a guess, and it is exactly the guess two devs make differently. |

Each is one editorial decision (redefine or replace the variant), but each currently blocks a story exit on FR-G1's "every listed variant is a launch deliverable".

### C6 · The `data-*` authoring vocabulary has no expression for five things 250+ variants require
§7.3 enumerates eight directives — `data-prop`, `data-prop-attr`, `data-bind`, `data-bind-attr`, `data-empty`, `data-repeat`, `data-repeat-limit`, `data-partial` — and the two spike files (**21 lines total**) demonstrate all eight. That is a genuine, working pattern for *static props plus one Ghost repeater*, and it is enough to author A5, A9, A13, A14 against. It is not enough for the rest, because there is **no directive for**:

1. **`{{#get}}` blocks** — the spike's `data-repeat` compiles to `{{#foreach}}` only. A19, A20 #3/#14, A21 #5, A22 #7, A15 #5/#6, A26 #5/#12, A27, A31 #4 are all `{{#get}}`-driven by their own Data lines. **≈ 60 variants.**
2. **`{{#if @member}}` / member visibility** — FR-D5 puts the show-to control on every CTA-bearing section (A2, A6, A22, A26 = **61 variants**) plus A1 #13, A28 #9, A30, A32.
3. **`{{t}}` chrome strings** — FR-J5 forbids hard-coded visitor-facing literals, and the catalog has 146 keys, but no directive emits `{{t "key"}}` from annotated HTML. Affects **every variant with any label**.
4. **`srcset` / `sizes`** — NFR-2(1) asserts correct `srcset` on every image in CI; FR-H8 requires the guard to enclose it. The spike's `img_url` helper emits a single `src`. Affects every image-bearing variant.
5. **Control value → `data-{control}` attribute on the section root** — §7.3 mandates this as *the* control mechanism. Nothing in the spike or the directive list writes it.

E4 explicitly owns "the annotated-HTML authoring vocabulary and its documentation", so the process exists. But **E4's exit criterion is the five pilot sections**, none of which exercises `{{#get}}`, and E9 opens with 156 variants against a vocabulary that has never been proven on a `{{#get}}` feed. Naming these five as E4 acceptance criteria closes it.

---

## HIGH

### H1 · `prefers-reduced-motion` is never mentioned for generated themes, and 13 variants auto-move indefinitely
The only two reduced-motion mentions in the PRD are **NFR-5 (the app)** and **Appendix H (the deploy confetti)**. FR-G4's degradation rule covers JS-disabled only. Yet these move on their own, forever, with no user action: A2 #3 Ticker Marquee, A2 #4 Gradient Slide, A2 #9 Rotating Messages, A2 #15 Seasonal Confetti, A4 #13 Typewriter, A4 #18 Ticker Base, A8 #3 Marquee Scroll, A8 #9 Avatar Row, A8 #14 Inline Ribbon, A9 #15 Marquee Header, A11 #3 Marquee Loop, A11 #4 Dual Rows Offset, A19 #15 New Badge Marquee — plus A34 #9/#10 auto-load.

**WCAG 2.2.2 (Pause, Stop, Hide) is Level A** and requires a pause mechanism for anything auto-moving beyond 5 seconds. A8 #3's "pause on hover" is not one — hover is not keyboard-reachable. **axe-core cannot detect this**, so NFR-5's "zero violations, all 485 variants" gate will pass a library that is not AA-conformant, and FR-G4's AA promise will be false in the one place the product ships to the public. One global rule ("every auto-moving variant honours `prefers-reduced-motion: reduce` by stopping, and exposes a pause control") fixes all 13 and is a line, not a spec round.

### H2 · A33 Koenig Card Treatments: 6 full stylesheets specified by a parenthetical
The entire spec is: *"Site-wide `cards.css` styling for all Ghost editor cards (callout, bookmark, button, toggle, gallery, header, product, audio, video, file, quote variants)."* Content: none. Controls: none. No universal controls.

Not stated anywhere: the full Koenig class surface (`.kg-card` plus per-type classes, the four callout colour variants, header card v1 vs v2 with background images, gallery at 1–9 images, the `kg-width-wide` / `kg-width-full` breakout classes, code/embed/HR/bookmark-with-no-image), how each treatment reads in dark mode, and — most consequentially — **precedence against Ghost's own card CSS, which `card_assets: true` (FR-J2) causes Ghost to inject**. Two stylesheets styling the same elements with no specificity rule is a defect the render matrix will surface late and expensively.

Sized as **one story** in E11 alongside ten other categories.

### H3 · A2 Announcement Bars: the smallest category with the most self-contradiction
15 variants. **#6 Countdown** needs a target date: no prop, and no Date Picker in `Controls:` — even though Appendix C created the Date Picker type with the note *"countdowns, scheduled content"*. Expiry behaviour (hide? show a done state? keep counting negative?) is undefined. **#9 Rotating Messages** says "up to 3 messages crossfading" while `Content:` declares singular `message` and `Controls:` declares "rotation (for multi-message)" — the schema and its own control contradict each other in the same line. **Dismissal persistence** (the `dismissible` control on all 15) is undefined: cookie, localStorage, session, per-message-id? And FR-G4 requires it to work with JS disabled, which it cannot. **#3 Ticker Marquee** has no speed, direction, gap or repeat-count. **#15 Seasonal Confetti** is a particle system with no spec.

### H4 · Chrome-string catalog: a missing namespace for 40 variants, and one default-value conflict with the inventory
`appendix-h1-string-catalog.md` carries 146 keys across 12 namespaces and is good work. But:

- **No `pricing.` / billing-period namespace.** A7 (15) + A30 (13) + A32 (12) = **40 variants render prices** and every one needs "/month", "/year", "Monthly", "Yearly", "Most popular", "Free". FR-J5 forbids hard-coded visitor-facing literals. A dev authoring A7 is blocked on a key that does not exist.
- **No countdown unit labels** (Days/Hours/Minutes/Seconds) for A2 #6, A6 #11.
- **No "Trusted by"** for A11 #5 Center Statement.
- **Default-value conflict:** `sections-inventory.md` A27 says the heading default is **"Read next"**; the catalog's `post.related_heading` default is **"More like this"**. Two normative documents, two answers.

### H5 · FR-H5's `{{#get}}` context rule reads two opposite ways, and A27 depends on the answer
*"A `{{#get}}` filter may reference only template-level context, never the current render context."* On `post.hbs` the post **is** the template-level context. So is `filter="tag:{{primary_tag.slug}}"` legal? A27 (12 variants) and A26 #5/#12 assume yes — A27 declares it "built-in" and the Synthesis Defaults ship it on every post. A dev reading the rule literally refuses to author it. **One clarifying clause** ("the template's own resource is template-level context; the `{{#foreach}}` iteration variable is not") closes it.

### H6 · A16 Contact: 5 of 15 gaps, and one array with no declared shape at all
`locations[]?` appears in `Content:` with **no fields named** — A16 #7 Office Cards and #6 Map Side both depend on it. Plus #9 needs FAQ items, #11 needs routed option cards, #14 needs community option cards. A16's own note correctly nails the hard part (no form backend in Ghost); the schema then under-delivers on the easy part.

### H7 · A34's skeleton and load-more designs are coupled to whichever of 33 feed variants is the main feed
A34 #9 Infinite Fade ships "skeleton shimmer rows" and #7 Load More Ghost a spinner. The skeleton must match the shape of the feed above it — which is one of A17's **18** or A18's **15** variants, chosen independently. `partials/pagination.hbs` is a single emitted file with `bindingContext: pagination` and no knowledge of the feed's card structure. No mechanism connects them. Either the skeleton becomes shape-agnostic (a stated decision) or the coupling needs a mechanism.

### H8 · A25 #9 and #12 style Ghost editor output, colliding with A33's project-level `cards.css`
A25 #9 Photo Essay ("full-bleed image cards, captions styled large") and #12 Split Aside ("styled aside/callout margin column") can only be built by styling `.kg-image` / `.kg-callout-card` — the exact elements A33 owns, project-wide, one treatment at a time. Two systems, same selectors, no precedence rule. A25 is also the parent of A33's selector control, which makes the collision structural rather than accidental.

### H9 · Responsive behaviour: the breakpoints are fixed, the collapse rules are not
Credit where due — the breakpoints **are** specified: 390 / 834 / 1440 (FR-D8, NFR-6(a)'s three viewports, FR-G4's 390 → 1440+). That is more than most PRDs give.

What is missing is the **collapse rule**: a `columns (2/3/4)` control appears on A5, A14, A17, A20, A21, A27 and column-ish controls on 10 more. Nowhere does the doc say what 4 columns becomes at 834 and at 390. Nor what A1 #10 Command Bar's centred search field does on mobile, nor whether A5 #12's sticky-scroll and A19 #8's sticky feature degrade to static below 834. **Two devs will build 30+ variants differently.** This is the case where the owner is right that per-variant specs would be busywork: **one general rule** (e.g. "columns step down to 2 at 834 and 1 at 390 unless the variant declares otherwise; all sticky and split behaviours flatten to stacked below 834") covers all of it in three lines.

### H10 · A1 #16 Tab Deck requires cross-section coupling the partial model forbids
"Nav rendered as tabs **attached to the section below**." A1 compiles into `default.hbs` as `partials/header.hbs`; the section below it is a different partial on a different template, chosen per template. There is no mechanism by which the header can know or match it. Same class of problem as A34's skeleton (H7) and A3 #8 CTA Capped / A12 #15 Hiring Capped ("fused" bands). Either "attached/fused" means purely visual (zero margin + shared background role — a one-line clarification) or the variant is not buildable.

---

## MEDIUM

- **M1 · Quick Controls cut point is a range, not a number.** FR-F3: "3–5 Quick Controls"; FR-G3: "the first 3–5 entries … *are* its Quick Controls, so the array is recovered mechanically." A range cannot be recovered mechanically. Compounding it, **every category has only 4–8 controls total** (measured), so the Content/Layout/Style/Data accordions below the Quick block hold 0–3 items and the ≈15 cap is never approached. Either pin the number (4) or drop the accordion structure — both are simplifications.
- **M2 · `darkCapabilities` is named once in FR-G3 and defined nowhere.** 485 variants must each declare it.
- **M3 · `previewSeed` has no format.** FR-H3 says every section's seed "maps into" Orbit Weekly; a dev authoring 485 of them needs the shape.
- **M4 · A9's `default state: All closed` vs FR-G4's "accordions render open with JS disabled".** `<details>/<summary>` resolves it natively at zero cost — but that decision is unstated, and a dev who reaches for a JS accordion ships content unreachable without JS on 15 variants.
- **M5 · A2 #13 Members Only is structurally identical to any A2 variant with `show to = Free members`.** FR-G5's uniqueness proxy compares structural descriptor tuples within a category; #13's descriptor describes a *control value*, not a structure. Same pattern worth checking on A6 and A22.
- **M6 · A31 #8 Empty Tag State declares `compileTarget: "the empty state of a collection template"` — which is not a file, and there is no surface that places it.** A31 #3's "illustration slot" leaves unstated whether Inflozo ships an illustration set or the user uploads (Asset Library), which is a content-production decision, not a code one.
- **M7 · Item-count semantics are undeclared.** A5 "item count", A8 "count", A10 "count (2–4)", A11 "density", A20 "columns/density" — no minimums, maximums or defaults except A10's. FR-D13's "8 items shuffled into a 3-card layout shows 3" needs each variant's structural maximum, which is nowhere recorded. A17/A18's `empty-state line` has no default text and no catalog key.
- **M8 · A5 #7 Screenshot Spotlight's "annotated callouts" need positions,** and P2/FR-F2 forbid every control type that could express one (no pixels, percent or units at section level). Needs a designed alternative (fixed anchor slots) or removal.
- **M9 · A28's comment count has no shim.** Appendix B says "comment counts (via `{{comments}}` context)" — vague — and `{{comment_count}}` is absent from FR-H5's shim list. A28 #1, #3 ("Show comments (n)") and #10 ("Count Header Big") all render it, and the canvas shows a placeholder thread.
- **M10 · A15 #13 Device Mock:** the `frame` control offers `Device` with no phone-vs-laptop choice, while the descriptor says "phone/laptop frame".

## LOW

- **L1 ·** A32's `Controls:` line ends with an em-dash clause ("— plus the universal controls, since the paywall renders as a block of its own") that parses as a control entry. Cosmetic, but FR-G3 claims `quickControls[]` is recovered mechanically from this line.
- **L2 ·** A25 is the only category with 12 variants and no layout/design picker (see C3).
- **L3 ·** The spike's `applyProps` ignores `data-empty` entirely — `data-empty="fallback"` is written in `hero-centered.html` and has no code path in either renderer. The reference example demonstrates a directive the reference implementation does not implement.

---

## Answers to the specific test questions

**Arithmetic and coverage (Q4).** All clean, verified by parse:
- 34 categories; per-category claimed counts sum to **485**; listed variants sum to **485**; every category's numbering is contiguous 1..n with zero off-by-ones.
- **[Free] tags: exactly 70** — two per category (68) plus A29 #7 and A31 #10, matching FR-G2 verbatim.
- Group subtotals: 47 + 199 + 109 + 102 + 28 = **485**.
- **E9/E10/E11 wave counts verified:** E9 (A1–A3 + A17–A23) = 47 + 109 = **156** ✓; E10 (A4–A16) = **199** ✓; E11 (A24–A34) = 102 + 28 = **130** ✓.
- **28 non-placeable treatments are consistently carved out** in all nine quantifying locations: the inventory preamble table, FR-G1, FR-D5, FR-D12, FR-D13, FR-D17, FR-H6, NFR-5, E11 and E14. No leaks found.
- **Every category declares `Content:` and `Controls:`.** 15 declare `Data:`; the 19 that do not are correct per the stated rule ("wherever the category is feed-bearing") — **except A4**, which is feed-bearing at #5/#6 and declares nothing (C1).

**Control vocabulary closure (Q5).** Every named control type resolves to an Appendix C entry, so nothing is referenced-but-undefined at the *type* level. But at the *value* level, **the Layout Picker — the first control on 30 of 34 categories — is not closed** (C3), and 12 further control instances carry no value set inline: `columns` (A14, A21, A27), `column count` (A3), `team columns` (A12), `columns/density` (A20), `count` (A8), `item count` (A5), `density` (A11), `divider style` (A9), `social style` (A16), `alignment` (A6, A22), `text/nav/title alignment` (A1, A4, A24), `CTA arrangement` (A4), `highlight tier select` (A7), `free-tier visibility` (A7), `hours/info toggles` (A16, plural and unenumerated). Toggles are self-closing and fine. The scale vocabularies (Appendix C's second table) are genuinely closed and distinct — good work, keep it.

**Schema-authoring deliverable (Q6).** The directive vocabulary is **demonstrated, not specified** — two files, 21 lines, covering static props plus one Ghost repeater. It is a sufficient pattern for perhaps 120 of 485 variants. Five required expressions have no directive at all (C6). E4 owns the documentation; the fix is to make those five its acceptance criteria and to add a third worked example that exercises a `{{#get}}` feed, a `{{#if @member}}` gate, a `{{t}}` string, an `srcset` image and a control→`data-*` write.

**Epic definition of done (Q7).** The wave counts are right and "a category is a story" is the right call. The **exit gates are mechanical and good** (render matrix, axe-core, compile CI, structural-descriptor uniqueness). What the epics do *not* give a dev is a **per-section definition of done** — nothing states that a variant is done when it has: schema declared, all controls wired to `data-*`, both modes, three breakpoints, empty/zero-item state, JS-disabled state, reduced-motion state, behavior module registered, `ghostCompat` filled, `previewSeed` mapped, baseline captured. That is one checklist, written once, applied 485 times — and its absence is why the four gates will find problems late rather than the author finding them early.

**Dark mode (Q2).** Adequate by construction and worth *not* specifying further: FR-E4's token mechanism plus FR-E1's paired palettes means a variant that consumes tokens only is correct in both modes for free. The only per-variant question is `darkCapabilities` (M2) and the handful of variants that name a mode explicitly ("Dark Contrast", "contrast-role band regardless of mode", "Dark Cards … and inverse" — ~14 variants across A2/A3/A6/A7/A9/A10/A11/A12/A16/A20/A22/A23/A28/A29). Those need one rule: what "contrast role in both modes" resolves to per pack.

**Accessibility (Q2).** Contrast and focus-visible are covered generally by FR-G4 and the token guarantee. **Not covered:** reduced motion (H1), and per-variant roles/labels for the ~20 undeclared interactive behaviors (C2) — a tab set needs `role="tablist"`, a drawer needs a focus trap and `aria-expanded`, an accordion needs `aria-controls`, a carousel needs live-region etiquette. axe-core catches some of this on a static render and none of the keyboard behavior.

---

## The shortest path to buildable

Six edits, in this order, and the library is authorable:

1. **Rewrite the 34 `Content:` lines as unions** of what their variants actually need (C4's table is the worklist), and add A4's `Data:` line with per-variant `bindingContext` in the A29 style (C1).
2. **Write one behavior-module contract** — mount, init, teardown, canvas-vs-live, reduced-motion — and extend FR-J4's module list to the real ~30, then re-derive NFR-2's JS budget (C2, H1).
3. **One sentence defining the Layout Picker** (C3).
4. **Add the five missing directives to E4's acceptance criteria** plus one worked third example (C6).
5. **Three global rules** — responsive collapse (H9), auto-motion pause (H1), "fused/attached means visual only" (H10) — replacing what would otherwise be ~50 per-variant specs.
6. **Retire or redefine the six impossible variants** (C5) and settle the four open conflicts: `{{#get}}` context (H5), Koenig precedence (H2/H8), "Read next" vs "More like this" (H4), A34 skeleton coupling (H7).

None of these is a per-variant spec. That is the point: the inventory's one-line-per-variant discipline is correct and should survive. It is the **34 category headers** that are under-built, and 34 headers is an afternoon.
