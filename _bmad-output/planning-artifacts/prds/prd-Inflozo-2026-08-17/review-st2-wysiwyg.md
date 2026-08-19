---
title: WYSIWYG Fidelity Review — Inflozo PRD v3.0
reviewer: ST2 · WYSIWYG fidelity
date: 2026-08-18
target: prd.md v3.0 (+ normative companions, spike-compiler/)
verdict: NOT DEFENSIBLE AS WRITTEN — the markup half is closed by construction; the rendering half is not
---

# WYSIWYG Fidelity Review

**The claim under test (§1.2):** *"a canvas that renders exactly what Ghost will render — the canvas is the page, not a preview of it."* Stated scope carve-out: *"a user's own Ghost code injection legitimately changes the live page and is outside Inflozo's control."*

## Verdict

The PRD's central architectural move — one annotated-HTML source, two renderers (§7.3, FR-H5, P4) — is real, it is correct, and it genuinely eliminates a class of drift that every other visual builder carries. **But it closes the wrong half of the problem for the promise as worded.**

Identical markup is necessary and not sufficient. The document treats "canvas and shipped markup agree by construction" (§7.3) as if it discharged fidelity, and then builds its verification pyramid on that same axis: NFR-6(c1) diffs compiled `.hbs` *text*, NFR-6(a) renders 8,730 screenshots of *Inflozo's own renderer against itself*, NFR-6(c2) tests shim helpers *in isolation*. Exactly one gate — NFR-6(c3) — ever compares the canvas to a real Ghost page, and its scope is a single unspecified page, nightly.

Meanwhile the four things that actually make a Ghost page look different from Inflozo's canvas are all downstream of markup, and three of the four are not mentioned anywhere in the document:

1. Ghost injects its own CSS and JS into every page via `{{ghost_head}}`, **after** the theme's stylesheet — including `cards.min.css`, which the canvas has never heard of and which collides head-on with the A33 category.
2. Ghost renders `position: fixed` chrome the theme does not own (Portal's subscribe button, the native announcement bar) that lands precisely where several inventoried variants put their own edge rails.
3. The canvas is an iframe, and every `position: sticky`, `position: fixed` and `100vh` in the library resolves against the iframe's box rather than the visitor's viewport. The PRD never picks the iframe geometry, and both available choices break something.
4. The post body — the single most-viewed region of a blog — is stipulated as unrenderable (`{{content}}` → "dummy placeholder content", FR-H4/NFR-3) and no requirement says what the dummy is.

The promise is defensible as **"the canvas renders exactly the markup Ghost will render, styled by exactly the CSS Inflozo ships"** — a real and differentiating claim. It is not defensible as "the canvas is the page." The gap is not rhetorical: it is 4 CRITICAL and 9 HIGH divergence sources with no requirement covering them.

**Counts:** 4 CRITICAL · 9 HIGH · 10 MEDIUM · 5 LOW.

---

# Findings

## CRITICAL

### C1 — `card_assets: true` puts Ghost's stylesheet after Inflozo's, and A33 loses every tie

**FR-J2** mandates `card_assets: true`. **§7.4** and the spike's reference `default.hbs` place the theme stylesheet before the helper:

```handlebars
<link rel="stylesheet" href="{{asset "css/main.css"}}">
{{ghost_head}}
```

Ghost's documented behaviour (verified): with `card_assets: true` — the default — Ghost emits `cards.min.css` and `cards.min.js` **inside `{{ghost_head}}`**. Two consequences, both fatal to a category:

- On the live site, Ghost's card CSS loads *after* `assets/css/cards.css` and wins every equal-specificity declaration on `.kg-callout`, `.kg-bookmark-card`, `.kg-button`, `.kg-gallery-*`, `.kg-toggle-card`, `.kg-product-card` and the rest.
- On the canvas there is no Ghost card CSS at all, so the canvas shows Inflozo's treatment unopposed.

**A33 is 6 of the 485 shipped variants and its entire product surface is `cards.css`** (`sections-inventory.md` A33: *"Site-wide `cards.css` styling for all Ghost editor cards … `compileTarget: assets/css`"*). Every one of the six treatments — "Bold Frames: 2px borders", "Soft Cards: rounded tinted surfaces", "Minimal Flat: near-invisible chrome" — is a set of declarations Ghost's own sheet will beat or blend with unpredictably. `cards.min.js` also ships gallery and toggle-card behaviour the canvas does not run.

Ghost supports the fix and the PRD does not use it: `"card_assets": { "exclude": [...] }` per card. Nothing in FR-J2, FR-J3 or §7.4 mentions `exclude`, source order, or that Ghost injects a competing sheet at all.

**Would need to change:** FR-J2 (emit `card_assets: { exclude: [...] }` for every card A33 restyles, derived from the active treatment); §7.4 (fix stylesheet position relative to `{{ghost_head}}` and state why); FR-H5 (the canvas must load the same Ghost card baseline the live page will have, or A33 is not previewable — see C2).

### C2 — `{{content}}` is stipulated unrenderable and the placeholder is never defined; A25 and A33 are not WYSIWYG at all

FR-H4: *"The canvas reads list and metadata fields only and **never post or page body HTML** (NFR-3): `{{content}}` renders dummy placeholder prose in every content layout."* NFR-3 makes this a security invariant, and as a security decision it is correct and well-argued.

But **no requirement anywhere defines what the dummy prose contains.** Grepping the PRD, `sections-inventory.md` and the companions returns nothing: no fixture, no heading count, no card inventory, no length. That single omission un-WYSIWYGs two categories:

- **A33 (6 variants)** has `Content: none` and `no per-instance controls` — its only visible output is Ghost card markup inside `{{content}}`. If the placeholder is prose, choosing among the six treatments changes nothing on the canvas. `sections-inventory.md` gives A33 a render-matrix host context (*"a `post.hbs` fixture exercising every Koenig card type"*) — so a card-bearing fixture is required to exist for CI, and no requirement connects it to the editor canvas.
- **A25 Post Content Layout (16 variants)** exposes `measure`, `drop cap`, `type scale`, `share rail toggle`, and **`TOC (Off/Left/Right, auto-hidden < 3 headings)`**. Every one of these is a function of the body's shape. The TOC control is the sharpest case: whether the TOC renders at all is decided by the *real post's* heading count. A user designs with a TOC visible and ships a site where two-thirds of posts hide it.

`post.hbs` is the highest-traffic template on a publishing platform, and its main region is out of scope by design with nothing filling the hole.

**Would need to change:** FR-H4 (name a normative Koenig placeholder fixture — every card type, a stated heading profile, short/long variants — as a numbered deliverable alongside FR-H3's Orbit Weekly dataset); FR-H5 (the canvas must render that fixture, styled by the emitted `cards.css` plus whatever Ghost baseline survives C1); A25 must state that TOC auto-hide is previewed against the fixture's heading count and is therefore per-post-variable on the live site.

### C3 — The canvas iframe's geometry is unspecified, and both available choices break a documented part of the library

**FR-D14:** *"Canvas is site-width, fit-to-viewport with vertical scroll."*
**§7.3:** *"Editing chrome … sits **outside** the iframe, positioned over it from measured rects."*

These two sentences do not determine the iframe's box, and the box is what every viewport-relative CSS feature resolves against. There are exactly two implementations and the PRD picks neither:

| | Iframe scrolls internally (iframe = viewport-sized) | Iframe is full document height (parent scrolls) |
|---|---|---|
| `position: sticky` / `fixed` | Correct — resolves against a viewport-shaped box | **Broken** — sticky never releases, fixed pins to a 20,000px box |
| `100vh` | Correct | **Broken** — `vh` = full document height |
| `IntersectionObserver` / scroll-spy | Correct | **Broken** — everything is intersecting at once |
| Chrome positioned from measured rects | **Every rect changes on every scroll frame** — needs a scroll-sync loop the PRD never mentions, against NFR-1's 60fps / no-long-task-over-50ms gate | Correct — rects are stable |

The library depends on the first column heavily. From `sections-inventory.md`:

- **A1** header control: `sticky (None/Sticky/Sticky-shrink)`
- **A2** #4 *Pill Float* — "detached rounded pill bar floating over content"; #8 *Pill Floating*; #14 *Top Rounded* — "rounded lozenge fused to **top of viewport**"
- **A3** #16 *Back-to-Top Tower* — "right-edge vertical rail"
- **A5** #8 *Big Type Manifesto* — "headline at **viewport scale**, nothing else above the fold"
- **A9** #12 *Sticky Scroll*, **A19** #9 *Split Scroll*, **A21** #6 *Sticky Progress*, **A16** #11 *Split Manifesto*, **A18** #3 *Split Sticky*, **A13** #15 sticky tier header row, **A24** #7 *Month Grouped* sticky headers, **A26** #8 *Sticky Feature*, **A29** #11 *Split Tag Nav*, **A23** #8 *Sticky Band*
- **A25** #3/#4 sticky TOC rails, #5 *Share Rail* — "floating share/copy rail"
- **A27** #12 *Continue Sticky* — "slide-in next-article card **near page end**" (scroll-position-driven)

That is 20+ variants across 15 categories whose defining structural property is viewport-relative. This is not an edge case; "sticky" is a *control value* on the site-wide header, so it is on the default path.

There is a third problem the PRD also does not mention: **FR-D8's device preview** (Desktop / Tablet 834 / Mobile 390) is implemented by resizing the canvas. If the iframe is full-document-height, a "mobile" preview at 390px wide still has a 20,000px-tall viewport, so every `vh` value and every sticky region is wrong *in the mode the user checks responsiveness in*.

**Would need to change:** FR-D14 must state the iframe geometry explicitly and FR-D8 must state what it resizes. §7.3's focus-model paragraph must add a scroll/resize-sync contract for chrome rects, with its own NFR-1 budget. If the choice is "iframe scrolls internally," the 40-section stress fixture must include a sticky header, and NFR-1's trace must include scrolling — it currently covers only "drag, reorder, Variant Shuffle and control changes."

### C4 — Ghost injects `position: fixed` chrome the canvas never shows, and §1.2's carve-out covers only *user* code injection

§1.2's parenthetical scopes out *"a user's own Ghost code injection."* That is honest and correct as far as it goes. It says nothing about the surfaces **Ghost itself** injects through `{{ghost_head}}`, which FR-J5 mandates the theme emit. Verified contents of `{{ghost_head}}`: Portal script, Stripe, sodo-search script + stylesheet, comments-ui script + stylesheet, card assets (C1), member attribution tracking, the `--ghost-accent-color` variable, JSON-LD, and the user's code injection.

Four of these change layout, and the PRD acknowledges none of them as a fidelity concern:

1. **Portal's floating subscribe button.** Verified: default position bottom-right, `position: fixed`, **enabled by default**, controlled by a Ghost Admin setting Inflozo cannot read from the Content API. `research-ghost-empty-values.md` §6.4 records `@site.members_enabled` as **true** on a fresh install — so this button is present on essentially every target site. It sits exactly where **A3 #16 Back-to-Top Tower** ("right-edge vertical rail") and **A25 #5 Share Rail** ("floating share/copy rail alongside content") place their own edge furniture. A user designs a right-edge rail, ships it, and finds Ghost's own button on top of it.
2. **Ghost's native announcement bar** (Settings → Site → Announcement bar). Verified: theme-independent, injected at the top of every page by ghost_head JS, fetched asynchronously and therefore causing layout shift on the real page. Inflozo ships **A2, a 15-variant Announcement Bars category** of its own, and `sections-inventory.md` line 644 confirms *"No announcement bar is ever synthesized."* A site with Ghost's native bar enabled stacks two bars; the canvas shows one.
3. **comments-ui.** FR-H5: *"`{{comments}}` renders a styled placeholder."* The real thing is a variable-height iframe carrying Ghost's own styling and Ghost's i18n. **A28 is 10 Comments variants** whose entire job is to frame a block whose height and appearance the canvas cannot know.
4. **sodo-search.** §7.6 lists *"Sodo (Ghost's bundled search) styling limits"* as a risk with a mitigation ("styled trigger always"). That is the closest the document comes, and it is about styling reach, not about the canvas.

FR-Q6 proves the document *knows* these surfaces exist: *"strings inside Ghost's own surfaces — Portal, native comments, and the Sodo search overlay — belong to Ghost's i18n namespaces and cannot be reached by a theme catalog."* It reasons about their **strings** and never about their **pixels**.

**Would need to change:** §1.2's carve-out must name the Ghost-injected surfaces alongside user code injection, or FR-H5 must specify canvas shims for them. Portal's button in particular is cheap to shim faithfully — its presence is a Ghost Admin setting; if it cannot be read, FR-C4's connect flow should ask, and FR-H5 should render a stand-in so edge-rail variants are designed against reality.

---

## HIGH

### H1 — The spike's headline fidelity assertion proves almost nothing, and the spike itself contains an undetected canvas/theme divergence

`spike-compiler/README.md` claim #7: *"Canvas and compiled output produce an identical element/class skeleton."* The implementing assertion (`test.js`, §5):

```js
const strip = (s) => s.replace(/\s+/g, ' ').replace(/<!--.*?-->/g, '').trim();
const classes = (s) => (strip(s).match(/class="[^"]*"/g) || []).join('|');
assert.strictEqual(classes(canvasGrid), classes(themeRendered));
```

`classes()` extracts the `class="…"` attribute strings and joins them. It compares **no element names, no other attributes, no text content, no image URLs, no ordering beyond class-attribute sequence**. Since both renderers walk the same source DOM and neither ever touches a class attribute, this assertion is close to tautological.

The second half is worse: `themeRendered` is produced by hand-written stubs registered in the test —

```js
Handlebars.registerHelper('img_url', (u) => u || '');
Handlebars.registerHelper('date', (d) => String(d || ''));
```

— so the "compiled output" side of the comparison is not Ghost's output. It is a three-line fake.

**The spike contains a live divergence its own test does not catch.** `compile.js` `bindValue()` renders dates on the canvas as:

```js
if (name === 'date') return new Date(raw).toISOString().slice(0, 10);   // "2026-03-14"
```

while `bindExpr()` emits for the theme:

```js
if (name === 'date') return `{{date ${path} format="D MMM YYYY"}}`;      // "14 Mar 2026"
```

Different string, different character count, different rendered width — in the canonical example section, in the reference implementation the PRD calls *"the reference implementation of its mechanics"* (§ Normative companions). Assertion 16 passes anyway, because dates are text and `classes()` does not look at text.

**Equally serious: the spike never exercises the rich-text mark path at all.** `applyProps()` uses `el.textContent = v` for **both** renderers. FR-D4 and §7.3 specify that a text prop is `{start, end, mark, href?}` ranges that the compiler serializes into `<strong>/<em>/<u>/<a>` while the canvas holds them in a `contenteditable` DOM. That is the one place in the whole design where the two renderers construct *different DOM from the same value* — and it is the one path the spike does not touch. §7.3 asserts *"byte-comparable markup is a property of the design, not something a test has to earn expression by expression."* For marks, that is unearned.

**Would need to change:** the spike's assertion 16 must compare full normalized DOM (elements, attributes, text) not class attributes; the date shim must match `{{date}}`; and `test.js` must gain a marks case. §7.3's "byte-comparable by construction" sentence must be narrowed to exclude the helper-shim boundary, which is where the actual risk lives and which NFR-6(c2) — correctly — exists to police.

### H2 — FR-Q6's dotted keys collide with Ghost's `{{t}}` fallback; the live site renders raw keys

FR-Q6: *"**Keys are dotted `namespace.name`, never the English string itself**, so improving a default never renames a key and never orphans a user's override."* The reasoning is sound in isolation. It is wrong against Ghost.

Ghost's own docs (`/themes/helpers/utility/translate`), verified verbatim: *"It's possible to use any translation key on the left, but **readable English is advised in order to take advantage of the fallback option inside the `{{t}}` translation helper when no translation is available**."* The `{{t}}` fallback **is the key**. Ghost loads exactly one locale file, chosen by the site's publication language setting, and a missing file logs a warning and proceeds.

FR-Q6 ships *"exactly one locale file, named for the project's language."* So whenever the shipped file's name does not match the site's publication language and the `en` fallback also misses, every chrome string on the live site renders as `pagination.older_posts`, `card.read_more`, `member.signup_success`. The canvas, resolving through the shim, shows the correct string. This is a total WYSIWYG break plus a shipped-site defect.

Realistic trigger, and it needs no user error: a French project ships `locales/fr.json`; some months later the owner changes Ghost's publication language in Admin (one dropdown, no deploy); Ghost now wants a different file; keys render. Nothing in FR-C5's daily health check watches `@site.locale`. FR-Q6's only warning fires *"switching the project to a site whose locale differs"* — the wrong direction, and it is framed as a translation-staleness warning, not a rendering failure.

**Would need to change:** FR-Q6 must either (a) emit readable-English fallback keys as Ghost advises, keeping the dotted key as a compile-time indirection only, or (b) ship both `locales/{lang}.json` **and** `locales/en.json`, and add `@site.locale` drift to FR-C5's health check with a pre-deploy warning.

### H3 — No requirement chooses which post/page/tag/author the single-resource canvases preview, and FR-H8's media guard makes that choice structural

FR-D15 is the only content-selection surface: *"Content-source pill: 'Previewing with: {site} / Sample content', switchable when a site is linked."* Site or sample. That is the whole vocabulary.

`post.hbs` renders one post. The canvas must pick one. Nothing says which, and nothing lets the user cycle. This matters because **FR-H8 makes missing media a structural change, not a cosmetic one**: *"**media** bindings hide the element they occupy."* `research-ghost-empty-values.md` §6.4 records that on a fresh install `feature_image` is *"populated on the post, **empty on the About page**"*, and that author `profile_image`, author `bio`, tag `description` and tag `feature_image` are all **empty**.

So: the user designs `post.hbs` against whichever post the canvas happened to load — one with a feature image, a byline portrait, a primary tag — and every post lacking any of those ships a layout with elements removed that the user never saw. Same for `author.hbs` (bio and portrait empty on a fresh install, so the *default* live rendering is the one the canvas is least likely to show) and `tag.hbs`.

The PRD handles the *quantity* case well — FR-H4's *"this site has 2 posts; section shows up to 6"* indicator is exactly right — and does not handle the *shape* case at all.

**Would need to change:** FR-D15 must add resource selection on single-resource canvases (a picker, plus a "worst case" preset that selects the site's sparsest post/author/tag), or FR-H8 must add an editor affordance that renders both guard branches.

### H4 — `size="m"` has no meaning independent of `package.json`, and the shim contract test does not say whose

`research-ghost-empty-values.md` §5.4 is unambiguous: *"`size="m"` has **no fixed meaning.** It resolves against `config.image_sizes` in the theme's own `package.json`."* Casper's `l` is 1000; Source's `l` is 960. FR-J2 says only *"standard `image_sizes` map"* and never states the values.

NFR-6(c2) is written to catch exactly this — *"image URLs are compared, not normalized away, because the canvas shim emits Ghost-shaped sized URLs and `srcset`"* — but the test is *"asserted against **recorded real-Ghost output** for a recorded input set."* Real-Ghost output for `{{img_url x size="m"}}` depends on the `package.json` of whatever theme was installed when the recording was made. If the recording ran against Casper or Source, the test enshrines the wrong scale and passes forever. **The recording harness must deploy an Inflozo-emitted `package.json`, and NFR-6(c2) does not say so.**

Two more `img_url` behaviours the shim must reproduce and the PRD never names, both from §5.4:

- *"Dynamic image sizes are **not** compatible with externally hosted images (except inserted images from Unsplash) … non-internal images are returned unchanged."* A feature image on S3 or a custom storage adapter ships at full resolution with no error. The spike's shim (`raw.replace('/content/images/', …)`) is accidentally correct for the pass-through case and has no Unsplash branch.
- *"Requesting a size key that is not in `package.json` silently yields the unresized original."*

**Would need to change:** FR-J2 must enumerate the `image_sizes` map as normative values; NFR-6(c2) must state that recordings are made against an Inflozo-emitted `package.json` and must include the external-image and Unsplash cases in the recorded input set.

### H5 — NFR-6(c3) is the only test that measures the promise, and it has no specified scope

The four gates, by what they actually compare:

| Gate | Compares | Touches Ghost |
|---|---|---|
| (a) Render matrix, 8,730 renders | Inflozo's renderer vs its own committed baselines | No |
| (b) Compile CI | gscan verdict on synthetic themes | No |
| (c1) Compiled-output snapshots | `.hbs` text vs committed `.hbs` text | No |
| (c2) Shim contract tests | one helper's output vs a recording | No (offline) |
| **(c3) Nightly perceptual diff** | **canvas vs a real Ghost page** | **Yes** |
| (d) E2E | flows | Yes |

**(c3) is the whole WYSIWYG gate.** Its full specification is one sentence: *"the canvas rendered against the same page deployed to a real Ghost target (§4), at (a)'s threshold and on (a)'s pinned renderer."* Singular "page." No statement of how many variants, which templates, which Style Packs, which member states, how the pairing is composed, or how coverage rotates. §4 adds that (c3) is *"serialized per target, because theme activation is globally stateful"* — which caps throughput hard: a full sweep of 485 variants would require hundreds of serialized deploy-and-activate cycles.

So the pyramid is inverted: 8,730 renders per run gate the axis that is already closed by construction, and an unspecified handful of pages gate the axis that is not. Every finding in this review would be caught by a sufficiently broad (c3) and by nothing else.

**Would need to change:** NFR-6(c3) must specify a fixture set (a rotating cohort sized to the serialization budget, weighted toward the categories this review flags: sticky/fixed variants, A25/A33 post-body, A28 comments, A2 announcement bars, A3 edge rails), a coverage-rotation rule so every variant is diffed within a stated window, and — critically — that the real-Ghost side runs with `members_enabled` true and Portal's button in its default state, so C1 and C4 are detectable rather than configured away.

### H6 — The render matrix covers 3 of 12 Style Packs and therefore 3 of 30 font pairings

NFR-6(a): *"every section variant × **3 reference Style Packs** × light/dark × 3 viewports … (8,730 renders per run)."* Arithmetic checks: 485 × 3 × 2 × 3 = 8,730. ✓

Coverage does not. **Appendix D ships 12 packs, and "packs 1–12 use pairings 1–12 respectively."** Three reference packs exercise three font pairings. FR-E1 offers all **30** pairings to every user, and font metrics — x-height, cap height, average advance width — are the primary driver of line-wrapping and therefore of section height. **FR-G4's "responsive 390 → 1440+ with no horizontal overflow" is a guarantee over all 485 variants asserted from renders that never see 27 of the 30 typefaces the user can choose.** A long headline that fits in Inter at 390px does not necessarily fit in Bricolage Grotesque.

Two related gaps in the same gate:

- **One control-value combination per variant.** FR-F3 allows ~15 controls plus 3 universal ones; A1 alone has `layout picker × sticky(3) × nav alignment × CTA toggle × search toggle × member-links toggle`. The matrix renders defaults. Combinatorial coverage is impossible and nobody should attempt it — but the PRD should say which combinations are covered rather than implying "every variant renders" means "every variant renders as users will configure it."
- **Three viewports, not breakpoints.** 390 / 834 / desktop are FR-D8's device presets. Overflow bugs live *at* breakpoint boundaries, not at the three points inside them.

**Would need to change:** NFR-6(a) must state pack/pairing rotation across runs (or a separate typography-stress lane covering all 30 pairings against a representative variant subset), and must state explicitly that it renders defaults.

### H7 — The canvas and the theme render different font instances

**Appendix D.a rule 4:** *"Non-`wght` axes are pinned at their design defaults at instancing time (`opsz`, `wdth`, `SOFT`, `WONK`, `YTLC`), so a variable face never carries an axis the token system cannot drive."* Rules 1–2 additionally clip `wght` (heading to its declared range, body to 400–700).

The shipped theme therefore serves **partially instanced woff2 subsets**. The canvas serves fonts from *"the app's asset context"* (§7.3), and no requirement says the canvas must use the identical instanced files.

This is not theoretical. **Pack 1 "Paper" — the stated default — pairs Fraunces / Inter.** Fraunces carries `opsz`, `SOFT` and `WONK` axes, and browsers apply `font-optical-sizing: auto` **by default** on any face exposing an `opsz` axis. A full Fraunces on the canvas will optically size its glyphs across the heading scale; a face with `opsz` instanced out will not. Different glyph widths, different wrapping, different heading heights — in the default pack, on the first canvas every user sees.

Related, lower-order: `font-display: swap` (D.a rule 6) produces FOUT on a cold live visit that a warm canvas never shows. That one is genuinely acceptable and only needs saying.

**Would need to change:** FR-J3 / Appendix D.a must require that the canvas load the *same* instanced, clipped woff2 files the compiler will emit — generated once per pairing and served to both — rather than the app's own font assets. This is also the cheapest fix in this review.

### H8 — Three shipped control values have no behaviour module in FR-J4 and no canvas behaviour anywhere

FR-J4's module list: *"mobile nav, load-more, infinite scroll, marquee, accordion, lightbox, TOC scroll-spy, count-up, mode toggle, and the A23 Custom Overlay search client."*

Not in that list, but shipped as control values or variants:

- **A1's `sticky (None/Sticky/**Sticky-shrink**)`** — shrink-on-scroll is JS. It is a *control value on the site-wide header*, i.e. on the default path for most projects.
- **A3's `back-to-top toggle`** and **A3 #16 Back-to-Top Tower** — show/hide on scroll is JS.
- **A27 #12 Continue Sticky** — *"slide-in next-article card near page end"* is scroll-position-driven JS.

FR-G4 requires every variant to be *"functional with JS disabled"* and enumerates the fallbacks for marquees, accordions and load-more — but not for these three, because they have no module to fall back from.

The fidelity consequence compounds C3: even if the iframe geometry is fixed, these behaviours have no specified canvas rendering, so the user picks "Sticky-shrink" and sees a static header.

**Would need to change:** FR-J4 must add the missing modules (or FR-G4/the inventory must drop the control values), and FR-H5 must state that behaviour modules run in the canvas — the same bundle, not a shim.

### H9 — "One shared style and asset context for canvas and chrome" is the phrase that lets the app's CSS into the iframe

§7.3 defends same-origin on cost, correctly, and lists among the benefits: *"one shared style and asset context for canvas and chrome."*

A same-origin iframe does **not** inherit the parent's stylesheets — the PRD is right that the boundary is not what makes the canvas safe. But "one shared style context" is not a property a same-origin iframe has; it is a thing an implementer would have to *build*, by injecting the app's stylesheet into the iframe document. §7.1 excludes section CSS from Tailwind and explains why at length, which protects the section stylesheets. It does not protect the **iframe document** from receiving Tailwind's Preflight reset, the app's `:root` variables, or its base typography — which would give the canvas a normalization the live Ghost page will never have.

Related and also unspecified: **the canvas's CSS load order.** FR-J3 emits `screen.css` as *"token block + base/reset + shared primitives"* plus *"section CSS emitted only for placed sections."* The canvas presumably injects the same pieces. Nothing states that the canvas concatenates them in the same order the compiler does. Two sections whose stylesheets both set a property on a shared primitive resolve by source order, and source order is currently an implementation accident on one side and a compiler decision on the other.

**Would need to change:** §7.3 must replace "one shared style and asset context" with an explicit rule — *the canvas iframe document loads exactly the pieces of `screen.css`, in exactly the compiler's concatenation order, and no app stylesheet* — and FR-J3 must make that concatenation order normative so both sides can obey it.

---

## MEDIUM

### M1 — Synthesized templates ship without ever appearing on a canvas
FR-D6 synthesizes six templates from the Synthesis Defaults when untouched, and *"Opening one of the six untouched templates renders its default stack as the starting canvas."* Nothing requires the user to open them. A user who designs only Home ships a `post.hbs`, `tag.hbs`, `author.hbs` and `error.hbs` they have never seen. Not a *divergence* — the canvas would be faithful if looked at — but "the canvas is the page" implies every shipped page was on one. FR-J8's deploy flow has no "here is everything that will ship" review step. **Change:** add a pre-deploy template review to FR-J8, or state the limitation.

### M2 — `routes.yaml` `limit:` silently overrides `posts_per_page`, so the canvas count is wrong
`appendix-b1-template-contexts.md` §2: *"`@config.posts_per_page` … **Not necessarily the `package.json` value** — a `routes.yaml` route with an explicit `limit:` overwrites it at render time for that route."* FR-H2 sizes the designated main feed by *"the global `posts_per_page` (FR-Q1)."* A Routes-Manager collection carrying a `limit:` renders a different card count live than on canvas. appendix-b1 rates the blast radius "minor"; for a WYSIWYG promise it is a visible count mismatch. **Change:** FR-I2/FR-H2 must make the canvas read the route's effective limit.

### M3 — Pagination (A34) can only ever be previewed on page 1
Ten variants whose visible state is a function of `page`/`pages`/`next`/`prev`. Numbered pagination on page 1 has no "Newer posts"; page 3 has both; the `"Page {page} of {pages}"` string (FR-Q6) is unpreviewable at its real values. `sections-inventory.md` gives A34 a render-matrix host context (*"a paginated `index.hbs` … more than one page of posts"*) — so the fixture exists for CI and nothing connects it to the editor. **Change:** FR-H2's Pagination control needs a page-state preview toggle, or A34 joins the honestly-scoped-out list.

### M4 — `{{date}}` timezone and format fidelity is asserted nowhere
Appendix B lists `@site.timezone`; no requirement says the `{{date}}` shim uses it. Ghost renders in site timezone; a browser shim defaulting to local time shifts dates by a day near midnight, and date strings are layout-affecting in card grids. The spike's shim emits ISO where the theme emits `D MMM YYYY` (H1). NFR-6(c2) would catch it *if* the recorded input set includes a non-UTC site and a boundary timestamp. **Change:** FR-H5 must name `@site.timezone` as a shim input; NFR-6(c2)'s input set must include timezone boundary cases.

### M5 — Theme-bundled assets render from a different source in canvas and theme
FR-J3 emits *"a fixed rendition set — 400 / 800 / 1600 px wide plus the original."* The canvas loads the Supabase original. A 2400px upload renders at 2400 on canvas and at ≤1600 live. Usually invisible; visible on high-DPR displays and on any variant that crops. FR-J5 specifies `srcset` and `sizes` for *Ghost-hosted* images and says bundled assets *"ship pre-generated responsive sizes"* without specifying `sizes`. **Change:** FR-J5 must specify `sizes` for bundled assets and FR-H5 must have the canvas resolve them through the same rendition logic.

### M6 — `font-display: swap` FOUT is real and unstated
A cold live visit paints fallback metrics first; a warm canvas never does. Acceptable, but the promise's wording should acknowledge first-paint is not covered. (Pairs with H7.)

### M7 — Content shape stress cases have no preview path
FR-H4 covers *count* well (the "2 posts, section shows up to 6" indicator is exactly right). It does not cover shape: 90-character titles, missing excerpts, three-line author names, emoji in titles, CJK titles in a latin-subset theme (correct behaviour — per-character `unicode-range` fallback to the system stack — but a *different typeface* live than on canvas), or RTL content. **FR-Q6 defers RTL and blocks RTL project languages, but Ghost content can be RTL regardless of the theme's language** — a user with an English theme and Arabic posts is not gated by that acknowledgement. **Change:** FR-H4 needs a "stress content" preview mode; FR-Q6's RTL block must state that it governs chrome only.

### M8 — `sections-inventory.md` A32 lists `upgrade` as a portal action, which Appendix B declares broken
A32's content line: *"cta labels (portal actions signup / signup/{tier} / **upgrade**)."* Appendix B: *"**`upgrade` is not a Portal value** — no branch parses it and it falls through to Portal's default screen … Ghost's own Source theme ships the broken value and it must not be copied."* Direct contradiction between two normative documents, in the one category where the failure is a dead paid-conversion CTA. The canvas would show a working button. **Change:** correct A32's line to `account/plans`.

### M9 — A28's ten Comments variants frame a block of unknowable height
FR-H5: *"`{{comments}}` renders a styled placeholder."* The real comments-ui is a Ghost-styled iframe whose height varies with comment count and which the theme cannot restyle (FR-Q6 concedes the i18n half of this). Ten variants can only design the surround. Honest scoping would say so. **Change:** state the limit in FR-H5 next to the placeholder sentence, as FR-D16 does for gated bodies.

### M10 — Member-state × template × resource is a matrix the user reviews one cell at a time
FR-D16 gives three states (with `comped` → Paid, correctly reasoned). FR-D5 adds per-section member visibility (Everyone / Logged out / Free / Paid). The canvas shows one state × one template × one resource. Nothing surfaces "here are the four renderings of this section." Not a fidelity *break* — each cell is faithful — but it is how a user ships a state they never looked at. **Change:** a multi-state review affordance, or state the limit.

---

## LOW

- **L1** — §1.2's parenthetical should name Ghost-injected surfaces alongside user code injection. As written it implies code injection is the *only* out-of-Inflozo influence on the page, which C1/C4 disprove.
- **L2** — §7.3's *"byte-comparable markup is a property of the design, not something a test has to earn expression by expression"* overstates. It is true for the annotated-HTML skeleton and untrue at the shim boundary and the rich-text mark boundary — which is precisely why NFR-6(c2) exists. Narrow the sentence.
- **L3** — The spike's `theme-output/default.hbs` hard-codes `<a class="skip-link" href="#main">Skip to content</a>`. FR-Q6 makes skip-link a catalog string and mandates *"`.hbs` output consumes catalog strings **exclusively** via Ghost's `{{t}}` … and compile validation enforces it."* The file the PRD calls the reference implementation violates the rule its own compile validation would reject.
- **L4** — `appendix-b1-template-contexts.md` §8 says *"across the entire 487-variant library."* The normative count is 485.
- **L5** — There is no "FR-D16 golden fidelity reference." FR-D16 is member-state preview, and NFR-6(c) explicitly states *"There is no DOM-normalized golden diff."* Any downstream doc citing D16 as a fidelity gate is citing something that does not exist.

---

# Where the promise holds

These are genuinely closed, and several are closed better than the industry norm. They should not be weakened when the findings above are addressed.

**1. Markup skeleton, by construction (§7.3, P4, FR-H5, FR-G3).** One annotated-HTML source, two renderers, Handlebars never parsed or executed. The three binding compiler mechanics — opaque ASCII tokens through serialization, block helpers as comment-borne markers, and *unwrap markers before substituting tokens* — are real constraints discovered by running code, and the third in particular is the kind of ordering bug that costs a week when rediscovered. Rejecting a React re-implementation outright removes the single largest source of preview drift in every competing builder. This is the right architecture and the review does not dispute it.

**2. Empty-value layout, by construction (FR-H8 + `data-empty` + `research-ghost-empty-values.md` §7).** The research's layout-stability argument — text falls back because the user authored a substitute, media hides because there is nothing to put in the box, *"never render an empty box"* — is correct and correctly adopted. And it is enforced on **both** renderers by the same directive: the spike's `renderCanvas()` removes the element on `data-empty="hide"` and `emitBindings()` wraps it in `{{#if}}`. Same source, same guard, same layout. FR-H8's supporting rules are unusually well-researched: `{{#if}}` not `{{#has}}` (because `{{#has}}` reports false for numeric and boolean values), guards enclosing `srcset` (because an unguarded `srcset` resolves as a relative URL and 404s), guards wrapping the element never the attribute.

**3. Cross-template binding (FR-H7 + `appendix-b1-template-contexts.md` + FR-D12/D13/D17).** This is the strongest section of the document. `bindingContext` and `compileTarget` on the registry entry are enforced at *placement* (the Picker filters), at *shuffle* (the ring is partitioned, including A30's explicit non-mechanical surface partition), at *remix* (every re-roll obeys the same restriction, on every template), and at *move* (bindings re-validate and must be re-pointed before the move completes). Prevention rather than warning is the correct call, and the justification is exactly right: Ghost compiles without strict mode, so an out-of-context binding renders empty with no error at build, deploy or runtime and passes gscan. appendix-b1's §3a wrapper rule (`{{title}}` renders empty at the top level of `post.hbs`) and its `{{#post}}`-not-`{{#page}}` finding are the kind of detail that separates a real matrix from a plausible one. **My §5 question — "can an author see something on Home that renders empty on tag?" — answers cleanly: no.**

**4. Control → style (FR-E4, FR-F1/F2, Appendix C, §7.3).** Closed-valued controls → data-attribute selectors → one attribute write on either renderer. There is no per-instance CSS, no generated class names, no inline styles, and therefore no path by which a control value styles the canvas differently from the theme. A control promoted to a Ghost custom setting emits `data-media-side="{{@custom.media_side}}"` with zero stylesheet change — a genuinely elegant consequence of the closed-value discipline.

**5. NFR-3's text-node rule.** Because the canvas never reads body HTML, every Content-API value enters as a text node and there is no sanitizer on the canvas path — which means there is no sanitizer *normalizing markup differently from the compiler*. The security argument and the fidelity argument point the same way here. (It is also the source of C2, which is the honest cost of an otherwise correct decision.)

**6. Static font subsetting (Appendix D.b).** *"Content-driven subsetting is wrong here and must not be implemented"* — with the reasoning that a theme renders posts written after deploy, so a compile-time glyph subset produces tofu weeks later with no error anywhere in the pipeline. That is the exact trap, correctly identified and closed. The coverage check (*"a theme never ships a `@font-face` that cannot render its own chrome strings"*) and the honest CJK size disclosure are both right.

**7. Filename determinism (§7.4, FR-J16).** *"The same project doc compiles to the same filenames on every machine and every run"* and *"a compiled filename must never change when the user changed nothing."* Without this, NFR-6(c1)'s committed snapshots churn on names and FR-J16's zero-false-positive drift guarantee is unmeetable. Recognizing that the compiler is bound by the drift check is a non-obvious catch.

**8. Honest scope-outs, where they exist.** FR-D16 on gated bodies: *"the browser-safe Content API never returns members-only content, so real gated bodies are not previewable (the NFR-6(c) fidelity layers exclude gated-body equivalence)"* — states the limit, names the cause, and excludes it from the gate rather than pretending. §1.2 on user code injection. FR-Q6 on Portal/comments/sodo i18n namespaces. §7.6 items 13 and 14, which flag `@even`/`@odd` with its blast radius named (*"inverts zebra striping across the entire library … Verify this first"*) and admit the spike does not close it (*"it never ran a real Ghost"*). **This is the register the document should be in for C1–C4 and is not.**

---

# Summary table

| # | Divergence source | Status | Sev |
|---|---|---|---|
| C1 | `card_assets: true` → Ghost's `cards.min.css` loads after Inflozo's; A33 overridden live, absent on canvas | **UNADDRESSED** | CRITICAL |
| C2 | `{{content}}` placeholder undefined; A33 and A25's body-dependent controls not previewable | **UNADDRESSED** | CRITICAL |
| C3 | Canvas iframe geometry unspecified → sticky/fixed/`100vh`/scroll-driven (20+ variants) | **UNADDRESSED** | CRITICAL |
| C4 | Portal fixed button, native announcement bar, comments-ui, sodo-search | **UNADDRESSED** | CRITICAL |
| H1 | Spike assertion 16 compares class attributes vs stub helpers; date shim already diverges; marks untested | **UNADDRESSED** | HIGH |
| H2 | FR-Q6 dotted keys vs `{{t}}`'s key fallback → raw keys live | **UNADDRESSED** | HIGH |
| H3 | No resource selection on `post`/`page`/`tag`/`author` canvases; FR-H8 media-hide makes it structural | **UNADDRESSED** | HIGH |
| H4 | `image_sizes` values unstated; (c2) recording source unstated; external/Unsplash pass-through | **UNADDRESSED** | HIGH |
| H5 | NFR-6(c3) — the only canvas-vs-Ghost gate — has no specified scope | **UNADDRESSED** | HIGH |
| H6 | Matrix covers 3 of 12 packs → 3 of 30 font pairings; defaults only; 3 points not breakpoints | **UNADDRESSED** | HIGH |
| H7 | Canvas fonts ≠ theme's instanced/clipped faces (`opsz` on Fraunces, the default pack) | **UNADDRESSED** | HIGH |
| H8 | Sticky-shrink, back-to-top, Continue Sticky have no FR-J4 module and no canvas behaviour | **UNADDRESSED** | HIGH |
| H9 | "One shared style and asset context" invites app CSS into the iframe; canvas CSS order unstated | **UNADDRESSED** | HIGH |
| M1 | Synthesized templates ship unviewed | UNADDRESSED | MEDIUM |
| M2 | `routes.yaml` `limit:` overrides `posts_per_page` | Noted in appendix-b1, unreconciled in FR-H2 | MEDIUM |
| M3 | A34 previewable on page 1 only | UNADDRESSED | MEDIUM |
| M4 | `{{date}}` timezone/format not asserted | Partially — (c2) could cover it if specified | MEDIUM |
| M5 | Bundled-asset renditions differ canvas vs theme; `sizes` unspecified | UNADDRESSED | MEDIUM |
| M6 | `font-display: swap` FOUT | UNADDRESSED (benign, needs wording) | MEDIUM |
| M7 | Content *shape* stress (long titles, emoji, CJK, RTL content) | Count covered by FR-H4; shape not | MEDIUM |
| M8 | A32 lists `upgrade`; Appendix B says it is broken | Contradiction between normative docs | MEDIUM |
| M9 | A28 frames a Ghost iframe of unknowable height | UNADDRESSED | MEDIUM |
| M10 | Member-state × template × resource reviewed one cell at a time | UNADDRESSED | MEDIUM |
| — | Cross-template binding (FR-H7 + appendix-b1 + placement/shuffle/remix/move filters) | **CLOSED** | — |
| — | Empty-value guards applied by both renderers (`data-empty`) | **CLOSED** | — |
| — | Control → CSS via closed values + data-attribute selectors | **CLOSED** | — |
| — | Markup skeleton (two renderers, one source) | **CLOSED** | — |
| — | Content-driven font subsetting rejected | **CLOSED** | — |
| — | Gated post bodies | **SCOPED OUT, honestly** (FR-D16) | — |
| — | User Ghost code injection | **SCOPED OUT, honestly** (§1.2) | — |
| — | Portal / comments / sodo *strings* | **SCOPED OUT, honestly** (FR-Q6) | — |
| — | `@even`/`@odd` parity, membership mechanism | **FLAGGED, honestly** (§7.6 #13/#14) | — |
| L1–L5 | Wording precision, spike hygiene, stale count, non-existent D16 gate | see above | LOW |

## The one change that matters most

If only one thing changes: **NFR-6(c3) must become a real gate with a specified fixture set, run against a Ghost configured the way real sites are configured** — members enabled, Portal button default-on, card assets live, a post body full of Koenig cards, and a sticky header. Every CRITICAL and most HIGHs in this review are invisible to (a), (b), (c1) and (c2) and would be caught by that one test. The PRD spent its verification budget on the axis its architecture already closed.
