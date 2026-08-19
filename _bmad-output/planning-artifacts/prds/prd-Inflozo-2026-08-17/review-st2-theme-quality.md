---
title: Exported Theme Code Quality Review
scope: PRD §7.3 §7.4 §6, FR-I / FR-J / FR-Q, Appendix D, Appendix H, §8 — judged against `spike-compiler/theme-output/` as the evidence, benchmarked against TryGhost/Casper and TryGhost/Source
date: 2026-08-18
verdict: CONDITIONAL FAIL — the mechanism is proven, the quality bar is not
---

# Exported Theme Code Quality — review

## Verdict

**The spike proves what it claims to prove, and the PRD claims far more than the spike proves.**

Everything the spike asserts reproduced exactly: 16/16 renderer assertions, 0 errors / 0 warnings on gscan 6.4.2 against both the v5 and v6 specs, checked-in `theme-output/` byte-identical to a fresh build, all 7 emitted `.hbs` precompiling cleanly under Handlebars. The C2 decision (omit `engines.ghost-api`) is still correct on the current gscan — 6.4.2 is `latest` on npm today, and re-adding the key reproduces exactly one warning on both specs. The token/serialization mechanic is real and the riskiest case (`src="{{img_url feature_image size="m"}}"`) genuinely survives. **Option D is validated as an architecture.**

What is *not* validated is the sentence FR-J1 hangs the whole product on: *"Output quality is a requirement, not a by-product — the generated theme must be hand-editable and production grade, at Casper/Source quality."*

That claim rests on exactly one enforceable gate — FR-J6's gscan 0/0 — and I measured what that gate is worth. I built a theme with **no `lang` attribute, no viewport meta, no `alt` text, an inline `onclick`, `<h4>`→`<h1>`→`<h6>` heading order, no pagination, no `error.hbs`/`tag.hbs`/`author.hbs`, no locales and 1.5:1 body contrast.** After adding two CSS lines and one `{{#if @page.show_title_and_feature_image}}`, it scores **0 errors / 0 warnings on both v5 and v6**. Raw output below.

For scale: the spike's 4-template stub passes **153** gscan rules on v5. Casper passes **152** and fails one with an *error*. Source passes 152 and fails one with an *error*. A stub with no navigation, no footer, no pagination, no error page and eleven lines of CSS out-scores both of Ghost's own reference themes on the only gate the PRD names.

The gate does not measure the property being claimed. Between gscan and the aspiration there is nothing — no HTML validation, no CSS lint, no unused-CSS check, no a11y automation on emitted output, no link/asset-integrity check, no formatting check that works.

Beyond that, I found five defects in the emitted artifact that would break a real site or fail a marketplace submission, three of which the gate provably cannot see.

**Counts:** CRITICAL 5 · HIGH 10 · MEDIUM 12 · LOW 5

---

## Reproduction — actual results

Environment: `gscan@6.4.2` (npm `latest` as of this run), `handlebars@4.7.9`, `jsdom@30.0.1`, `prettier@3.9.6`, Node on Linux.

### `node test.js`

```
1. Hero — design content only
  ✓ emits zero Handlebars (nothing comes from Ghost)
  ✓ content baked into text and attribute
  ✓ zero builder fingerprints in output
  ✓ canvas renders the same content

2. Post grid — Ghost data, loop, partial
  ✓ loop emitted as {{#foreach posts limit="3"}}
  ✓ repeating element extracted to {{> "post-card"}} with no params
  ✓ partial file produced
  ✓ THE RISKY ONE: quotes inside an attribute survived — not &quot;
  ✓ quotes inside a text-node helper survived
  ✓ FR-H8 media guard wraps the ELEMENT, not the attribute

3. Output is valid Handlebars
  ✓ template + partial compile and render without error
  ✓ renders real post titles through the partial
  ✓ post with null feature_image renders without a broken <img>

4. Escaping — user content is data, not code
  ✓ a headline containing {{...}} is emitted inert
  ✓ and renders as literal text, not an expression

5. Canvas vs theme agreement
  ✓ canvas and compiled output produce an identical class/element skeleton

16 checks passed
```

**16/16 — claim reproduced.**

### `node build.js`

```
=== GSCAN v6 ===
ERRORS: 0   WARNINGS: 0
  clean — 0 errors, 0 warnings
```

`diff -r theme theme-output` → exit 0. **The checked-in output is a faithful build artifact.**

### gscan run directly on `spike-compiler/theme-output/`

```
### theme-output @ v5
ERRORS: 0   WARNINGS: 0   RECOMMENDATIONS: 0   FEATURES: 0
passed rules: 153

### theme-output @ v6
ERRORS: 0   WARNINGS: 0   RECOMMENDATIONS: 0   FEATURES: 0
passed rules: 160
```

**0/0 on both specs — claim reproduced.**

### Baseline: Ghost's own themes on the same gscan

```
### casper @ v5
ERRORS: 1
   - Templates must contain valid Handlebars | default.hbs
passed rules: 152

### casper @ v6
ERRORS: 0   WARNINGS: 0
passed rules: 160

### source @ v5
ERRORS: 1
   - Templates must contain valid Handlebars | partials/components/footer.hbs
passed rules: 152

### source @ v6
ERRORS: 0   WARNINGS: 0
passed rules: 160
```

### C2 verification on current gscan

```
$ npm view gscan dist-tags
{ latest: '6.4.2' }

--- theme-output with engines.ghost-api re-added ---
### gapi @ v6
WARNINGS: 1
   - Remove "engines.ghost-api" from package.json | package.json
### gapi @ v5
WARNINGS: 1
   - Remove "engines.ghost-api" from package.json | package.json
```

**C2 confirmed on the current gscan, not merely on a pinned 6.4.2.** Omitting the key is correct on both specs.

### Handlebars parse validation of every emitted template

```
theme-output: 7 .hbs files, 0 parse failures
```

(`Handlebars.precompile` on every `.hbs` in the tree. Note the spike's own `test.js` only compiles the grid template and the `post-card` partial; `default.hbs`, `index.hbs`, `post.hbs` and `page.hbs` are hand-written string literals inside `build.js`, are never compiler output, and are never parse-checked by the spike. I checked them; they pass. The spike does not.)

### The adversarial gate test — what gscan 0/0 actually certifies

Theme built to be as bad as I could make it while keeping Ghost's two required templates:

```handlebars
{{!-- index.hbs --}}
{{!< default}}
<h4>Posts</h4>
{{#foreach posts}}
<div onclick="go()"><h1><a href="{{url}}"><img src="{{feature_image}}"></a></h1><div>{{excerpt}}</div></div>
{{/foreach}}
```

```handlebars
{{!-- default.hbs — no lang, no charset, no viewport --}}
<!DOCTYPE html>
<html>
<head><title>{{meta_title}}</title>{{ghost_head}}</head>
<body class="{{body_class}}"><div>{{{body}}}</div>{{ghost_foot}}</body>
</html>
```

CSS: `body{color:#eee;background:#fff}` (contrast ≈ 1.5:1), plus `.kg-width-wide` and `.kg-width-full`. No `error.hbs`, no `tag.hbs`, no `author.hbs`, no `locales/`, no pagination, no `post_class`, no `alt`.

```
### awful @ v6
ERRORS: 0   WARNINGS: 0   RECOMMENDATIONS: 0   FEATURES: 0
passed rules: 160

### awful @ v5
ERRORS: 0   WARNINGS: 0   RECOMMENDATIONS: 0   FEATURES: 0
passed rules: 153
```

Before I added the two `.kg-*` CSS lines and `page.hbs`'s `{{#if @page.show_title_and_feature_image}}`, it scored 2 errors / 2 warnings. Those four items are the entire distance between "deliberately terrible" and "passes Inflozo's only quality gate."

### Why `cards.css` has no gate at all

Reading `node_modules/gscan/lib/checks/050-koenig-css-classes.js`:

```js
const cardAssetsEnabled = packageJson.config.card_assets === true;
ruleSet = _.pickBy(ruleSet.rules, function (rule, ruleCode) {
    if (rule.cardAsset && (cardAssetsEnabled || ...)) {
        return; // skip rule
    }
    ...
});
```

FR-J2 mandates `card_assets: true`. That **disables every GS050 rule carrying a `cardAsset` tag** — roughly 110 of ~113. Empirically, stripping *all* `.kg-*` rules from the spike's CSS produces exactly two errors:

```
### kgtest @ v6
ERRORS: 2
   - The .kg-width-wide CSS class is required to appear styled in your theme | styles
   - The .kg-width-full CSS class is required to appear styled in your theme | styles
```

Two classes. That is the complete automated coverage of §7.4's `assets/css/cards.css` "Koenig treatment."

### FR-Q5's dark built-ins vs. GS100 — reproduced deploy blocker

`config.custom` set to FR-Q5's three built-ins (`color_scheme`, `dark_accent_color`, `dark_logo`), none read in any `.hbs`:

```
### q1 @ v6
ERRORS: 1
   - Use or remove the unused config.custom setting | package.json, package.json, package.json
```

This is an **error**, not a warning. FR-J6 blocks deploy on errors.

### `image_sizes` — the gate is blind

```
$ grep -rl "image_sizes" node_modules/gscan/lib/
(no matches)
```

gscan never reads `config.image_sizes`. The spike's `package.json` declares none, while `post.hbs`, `page.hbs` and `partials/post-card.hbs` all call `{{img_url … size="m"}}` / `size="l"`.

### `{{t}}` and locales

```
--- A: {{t}} used, NO locales/ dir --- 0 errors, 0 warnings
--- B: locales/en.json with an EMPTY string value --- 0 errors, 0 warnings
--- C: locales/en.json populated --- 0 errors, 0 warnings
```

FR-Q6's `{{t}}`-only rule and the single-locale-file architecture get no backstop from gscan. FR-Q6 does say "compile validation enforces it" — that validation is Inflozo's to build, and no test is named for it.

### The Prettier claim

FR-J1: *"everything is Prettier-formatted."*

```
$ npx prettier --parser glimmer theme-output/index.hbs
[error] SyntaxError: Handlebars partials are not supported (3:1)
[error] > 3 | {{> "sections/home/hero"}}

$ npx prettier --parser glimmer theme-output/partials/sections/home/latest-posts.hbs
[error] SyntaxError: Handlebars partials are not supported (8:3)
[error] > 8 |   {{> "post-card"}}
```

Prettier's Glimmer parser rejects `{{> "partial"}}` — the single construct §7.4's entire partial architecture is built on. And on the one template it *does* parse:

```
$ npx prettier --parser glimmer theme-output/default.hbs | head -1
<html lang="{{@site.locale}}">

doctype present in prettier output? 0
doctype in original?               1
```

It **silently deletes `<!DOCTYPE html>`** (quirks mode on every page) and rewrites `{{!-- Post card --}}` to `{{! Post card }}`.

### Two untested compiler paths, probed directly

```
--- data-empty="hide" on a HELPER-bound text node ---
<div>{{#if YYYY}}<time>{{date published_at format="D MMM YYYY"}}</time>{{/if}}</div>

--- data-empty="hide" on a plain text node (the path test.js covers) ---
<div>{{#if title}}<h3>{{title}}</h3>{{/if}}</div>

--- FR-D4 rich text with marks, through data-prop ---
<p>a &lt;strong&gt;bold&lt;/strong&gt; word</p>

--- an author's own HTML comment inside a section ---
<section><!-- layout note --><p>hi</p></section>   ← correctly preserved
```

---

## CRITICAL

### CR-1 · `wrapGuard` emits a garbage guard identifier — silent, permanent content loss

`compile.js:153-158`:

```js
function wrapGuard(el, expr, tokens) {
  const field = expr.replace(/^\{\{|\}\}$/g, '').split(' ').pop().replace(/"/g, '');
```

For `data-bind="published_at|date:D MMM YYYY"` with `data-empty="hide"`, `expr` is `{{date published_at format="D MMM YYYY"}}`. Stripping braces and taking the last space-delimited token yields `YYYY"` → `YYYY`. The compiler emits **`{{#if YYYY}}`**. Reproduced above.

`YYYY` is not in any Ghost context, so `{{#if}}` is always false and the element **never renders on the live site**, on every post, forever. No error at compile, at gscan, at upload or at render — the canvas renderer takes a different code path (`applyBindings`, which evaluates the value) and shows the element correctly, so §7.3's "canvas and shipped markup agree by construction" is *violated by this bug specifically*, and the divergence is invisible in the editor.

The attribute path is only accidentally correct: `wrapGuard(el, spec.split('|')[0], …)` passes the raw path, then `wrapGuard` runs its brace-stripping mangle over a string that has no braces. Two call sites, two different input conventions, one shared mangler.

`test.js` covers only the attribute path (assertion 10). `data-empty="hide"` on a date, a reading time, or any `img_url`-bound text — all ordinary in a post card — is broken.

Every mechanic §7.3 elevates to "binding on the implementation" is a *token/ordering* mechanic. This entire class of defect — the guard-field derivation — is unmentioned, untested and wrong in the reference implementation.

### CR-2 · No `config.image_sizes`, but every image uses `img_url size=` — all sizing is a silent no-op

`theme-output/package.json` `config` = `{posts_per_page, card_assets}`. Nothing else. Meanwhile:

- `post.hbs:7` — `src="{{img_url feature_image size="l"}}"`
- `page.hbs:8` — `src="{{img_url feature_image size="l"}}"`
- `partials/post-card.hbs:4` — `src="{{img_url feature_image size="m"}}"`

Ghost's docs are explicit that the ladder is theme-declared: *"Responsive images can be defined in the `package.json` file… Once image sizes are defined, pass a `size` parameter to the `{{img_url}}` helper."* With no `image_sizes` map there are no generated renditions and no `/size/w600/` path segment to resolve to. Every image on the site serves at original upload resolution — a 4000px hero behind a 300px card.

gscan never looks (`grep -rl image_sizes node_modules/gscan/lib/` → nothing). FR-J6's gate certifies this theme clean.

FR-J2 *does* require "standard `image_sizes` map" — but names no values, and the only artifact validating §7.4 omits it entirely. Casper declares six sizes (30/100/300/600/1000/2000); Source declares six different ones (160/320/600/960/1200/2000). Inflozo declares none, and NFR-2's assertion (1) — "every image carries a correct `srcset` and `sizes` matching the rendition set it was generated with" — has no rendition set to match against.

**Fix:** pin the `image_sizes` map as a normative table in FR-J2 with actual widths, and add a compile-time assertion that every `size=` argument appearing in emitted `.hbs` exists as a key in the emitted `config.image_sizes`. gscan will never do this for you.

### CR-3 · FR-Q5's "always compile three built-ins" collides with GS100 and blocks the deploy

Reproduced above: three declared-but-unread `config.custom` settings produce **`GS100-NO-UNUSED-CUSTOM-THEME-SETTING`** at *error* level. FR-J6 blocks deploy on errors.

FR-Q5: *"Light+Dark projects **always** compile three built-in custom settings — `color_scheme` …, Dark accent color …, and Dark logo (image; falls back to the light logo when unset)."*

Three concrete failure modes, all ordinary:

1. **Dark logo with no logo in the design.** A Light+Dark project whose header carries wordmark text rather than an image never emits `{{@custom.dark_logo}}`. Error. Deploy blocked. Nothing in the editor warned.
2. **`color_scheme` under FR-E4's "Auto follows the visitor's system preference in pure CSS."** If Auto is implemented in CSS via `prefers-color-scheme`, `{{@custom.color_scheme}}` need never appear in `.hbs` at all. Error. Casper avoids this only because it reads the setting in `default.hbs`'s `{{#match @custom.color_scheme "Dark"}}` — which is the pattern Inflozo must copy, and FR-Q5 does not say it does.
3. **Dark accent.** FR-Q5 says promoted colors compile as an inline token block in `default.hbs`, so this one is probably fine — but "probably" is doing the work of a requirement.

FR-Q3 already specifies the *converse* check ("compile validation rejects dangling bindings"). The forward direction — every emitted `config.custom` key is read at least once in emitted `.hbs` — is exactly what GS100 tests, and FR-Q5 mandates emitting keys the design may not read. FR-Q2's careful reservation of three slots protects the cap and does nothing about this.

**Fix:** FR-Q5 must state that each built-in is emitted **only when read**, or that `default.hbs` unconditionally reads all three (which means specifying *where* — the `<html>` class for `color_scheme`, the token block for the accent, and a logo fallback expression for `dark_logo` that survives a design with no logo).

### CR-4 · `engines.ghost: ">=6.0.0"` contradicts NFR-7's 5.x support, and no gate sees it

`theme-output/package.json` declares `"engines": {"ghost": ">=6.0.0"}`. NFR-7: *"generated themes support Ghost 5.x **and** 6.x."* §4 keeps 5.x connections supported. FR-C8 rejects only 4.x and older.

Ghost validates `engines.ghost` against the running version on upload. A theme declaring `>=6.0.0` does not install cleanly on the 5.x sites the PRD explicitly commits to supporting — and gscan checks `engines` for exactly one thing, the presence of `ghost-api`. I verified: `>=6.0.0` scores 0/0 against the **v5** spec, and removing `engines` entirely also scores 0/0.

FR-J1 and NFR-7 both discuss `engines` at length — and both discuss only the key that must be *absent*. Neither states the value of the key that must be *present*. The one artifact chose a value that breaks the compatibility promise, and the gate applauded.

**Fix:** FR-J2 must pin `"engines": {"ghost": ">=5.0.0"}` (Casper and Source both use exactly this) for as long as NFR-7 claims 5.x, and the T3 drop must change it.

### CR-5 · No `screenshots` — the theme is not submittable to the marketplace it claims to be graded by

Casper:

```json
"screenshots": { "desktop": "assets/screenshot-desktop.jpg", "mobile": "assets/screenshot-mobile.jpg" },
"gpm": { "type": "theme", "categories": ["Minimal", "Magazine"] },
"demo": "https://demo.ghost.io",
```

Ghost's theme docs list `screenshots` among `package.json`'s properties, and marketplace submission expects desktop and mobile screenshots declared there. FR-J2 enumerates `name`, `description`, `version`, `card_assets`, `image_sizes`, `posts_per_page`, `custom`. §7.4's tree has no `assets/screenshot-*`. `screenshots`, `gpm` and `demo` appear nowhere in the PRD.

This is a soft CRITICAL — nothing breaks on a live site — but the review brief's own bar is "would be rejected by the Ghost marketplace," and a submission with no screenshots is. It is also a *trivially* satisfiable one: FR-D and E13 already capture canvas thumbnails client-side. Two more captures at two viewports, written into `assets/`, and the claim becomes true.

**Fix:** FR-J2 adds `screenshots` (with a compile-time capture at a pinned desktop and mobile viewport), and states a position on `gpm`/`demo` — even if the position is "omitted, because Inflozo themes are per-user and not listed."

---

## HIGH

### H-1 · The gscan gate does not measure the property being claimed, and nothing else does

Proven at the top: 0 errors / 0 warnings on both specs for a theme with no `lang`, no viewport, no `alt`, inline `onclick`, inverted heading order, 1.5:1 contrast, no pagination, no error page, no locales. And the spike's 4-template stub out-scores Casper and Source on the v5 rule count.

FR-J6 is the only per-compile gate on emitted themes. NFR-6(b) is the same gate run nightly over more variants. NFR-6(c1) commits `.hbs` snapshots for human review — valuable, but a diff is not a gate. That is the complete enforcement stack behind "at Casper/Source quality."

Missing entirely, none of them exotic, all of them runnable offline in CI against a compiled theme with no Ghost host:

| Gate | Would have caught |
|---|---|
| HTML validation of rendered output (`html-validate`, `vnu`) | CR-1's dead guard, nested landmarks, unlabeled controls, duplicate `id`s |
| **axe-core on the compiled theme** (not just on variants) | H-3's entire uncovered surface |
| CSS lint (`stylelint`) | dead selectors, specificity wars, unparseable output |
| Unused-CSS check (`purgecss`) against rendered templates | H-7 |
| `size=` ↔ `image_sizes` cross-check | CR-2 |
| `config.custom` key ↔ `{{@custom.*}}` usage cross-check | CR-3 (gscan does this one; Inflozo should catch it *before* the gate does, to give a useful message) |
| Emitted-literal scan (no visitor-facing string outside `{{t}}`/`data-i18n-*`) | M-3 |
| `engines.ghost` ↔ supported-target assertion | CR-4 |

NFR-2 already establishes exactly the right pattern — "the compiler asserts, in CI and without a Ghost host, the properties Inflozo actually controls." The list of asserted properties is just far too short, and stops at performance.

### H-2 · `card_assets: true` disables ~110 of the 113 Koenig checks; `cards.css` has no verification at all

Source read above. Only `GS050-CSS-KGWW` and `GS050-CSS-KGWF` survive, because they carry no `cardAsset` tag. Empirically confirmed by stripping every `.kg-*` rule: exactly two errors.

§7.4 ships `assets/css/cards.css` as "Koenig treatment"; FR-J3 says "`cards.css` (Koenig treatment per Appendix A §33)". Casper's stylesheet carries **118** `.kg-` rules; Source's carries **103**. Inflozo's evidence artifact carries two, and they are there to satisfy the two surviving rules.

Worse, the interaction is unspecified in the other direction: with `card_assets: true`, **Ghost injects its own card CSS and JS at render time**. Nothing in the PRD says how `cards.css` coexists with Ghost's injected assets — load order, specificity, or which cards Inflozo styles versus defers. A theme that ships both may be shipping redundant weight, fighting Ghost's own rules, or both.

**Fix:** either (a) state that `card_assets` uses the `include`/`exclude` array form so the GS050 rules for excluded cards stay live and gscan actually checks the CSS Inflozo ships, or (b) accept `card_assets: true` and specify a golden-render check of a fixture post containing every Koenig card type in both modes, on the NFR-6(a) matrix. Right now there is neither, and a Koenig regression ships silently.

### H-3 · NFR-5's a11y scope excludes every part of the emitted theme the compiler synthesizes

NFR-5: *"Scope: **all 485 shipped variants and the Inflozo app itself.** Variant scanning runs on the NFR-6(a) render matrix, against the same renders."*

Variants. Not themes. The NFR-6(a) matrix renders *section variants*, not compiled templates. Everything that is not a variant is unscanned:

- `default.hbs` — `lang`, `<title>`, `<main>`, the skip link, document landmarks, the inline token block FR-Q5 emits
- `partials/header.hbs`, `footer.hbs`, `pagination.hbs` — nav landmarks, current-page indication, `aria-current`, the `{{navigation}}` output
- `error.hbs` — an entire page, and one visitors hit
- `custom-*.hbs` — designed membership pages
- Composition effects across sections: **heading order is a document-level property and cannot be tested one variant at a time.** Two individually-valid variants stacked produce `<h1>` then `<h4>`.
- The `{{t}}`-substituted chrome strings in their actual rendered position

The spike is the proof: the skip link, `lang`, `<main>` and `<title>` all live in `default.hbs` — the one file nothing in NFR-5's scope ever looks at. NFR-5 then makes a *theme*-level promise anyway ("Generated themes carry an alt attribute on **every** image … and a correct heading order per template") with no scan behind it.

The "agree by construction" argument covers section markup. It does not cover markup no section produces.

**Fix:** NFR-5's scope adds "every template of every compiled fixture theme in NFR-6(b)" — the themes already exist, the axe-core harness already exists, and this is the single highest-value gate addition in this review.

### H-4 · "Everything is Prettier-formatted" is unimplementable for `.hbs`, and the output isn't formatted

Reproduced above. `prettier --parser glimmer` throws `SyntaxError: Handlebars partials are not supported` on `{{> "post-card"}}` — which appears in every template and every section partial §7.4 defines. On `default.hbs`, the one file it parses, it **deletes the doctype** and rewrites `{{!-- … --}}` to `{{! … }}`.

There is no Prettier plugin that handles Ghost's dialect (`{{!< default}}` layout, `{{#foreach}}`, `{{#get … as |x|}}`, quoted-string partial names). Prettier can format the emitted CSS and JSON. It cannot format the `.hbs`, which is the output the requirement exists for.

Meanwhile the actual output is visibly unformatted:

```handlebars
{{!-- Post card --}}
<article class="post-card">
      <a class="post-card__image-link" href="{{url}}">
        {{#if feature_image}}<img class="post-card__image" src="{{img_url feature_image size="m"}}" alt="">{{/if}}
      </a>
      <h3 class="post-card__title">{{title}}</h3>
      <time class="post-card__date">{{date published_at format="D MMM YYYY"}}</time>
    </article>
```

Six-space body, four-space closing tag, orphaned indentation inherited from the element's depth in its source section. And:

```handlebars
  <div class="post-grid__items">
    {{#foreach posts limit="3"}}
  {{> "post-card"}}
{{/foreach}}
  </div>
```

The `{{#foreach}}` block is emitted with the string template's own indentation (`compile.js:120`), not the host element's. This is the *first thing* a user sees on opening the exported theme, and it is exactly the machine-output tell FR-J1 promises will be absent.

**Fix:** drop the Prettier reference and specify a small deterministic emitter instead — the compiler already owns the DOM tree, so re-indenting during serialization is a depth counter, not a formatter. Serialize with known indentation rather than post-processing text. Then assert idempotency (compile twice, byte-identical) as the formatting gate, which also underwrites FR-J16.

### H-5 · The `data-*` vocabulary cannot express the markup FR-J5, NFR-2 and NFR-5 require

§7.3 presents eight directives as the complete mandated mechanism: `data-prop`, `data-prop-attr`, `data-bind`, `data-bind-attr`, `data-empty`, `data-repeat`, `data-repeat-limit`, `data-partial`. `bindExpr`'s grammar is `path[|helper:arg]` → exactly one Handlebars expression, with two helpers (`img_url`, `date`) hardcoded and a `throw` on anything else.

That grammar cannot emit any of the following, all of which the PRD requires or the pilot sections need:

| Required construct | Required by | Vocabulary support |
|---|---|---|
| `srcset="{{img_url f size="s"}} 300w, …"` + `sizes` | FR-J5, NFR-2 assertion (1) | none — one expression per attribute |
| `alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"` | NFR-5 ("falling back to the bound Ghost field"); Casper and Source both do this | none — no conditional in an attribute |
| `{{post_class}}` | FR-J5 | none |
| `{{navigation}}` / `{{navigation type="secondary"}}` | pilot A1 | none |
| `{{pagination}}` | pilot A17, FR-H2 | none |
| `{{#unless @member}}` … `{{else}}` | pilot A22 | none |
| `{{#has visibility="members"}}` | A22 / paywall | none |
| `{{content}}` / `{{excerpt}}` | post.hbs, cards | none |
| `{{t "key" count=x}}` with hash params | FR-Q6, FR-J5 | none |
| `{{reading_time minute=(t "1 min read")}}` subexpression | Casper's card | none |
| `loading="lazy"` / `fetchpriority` below/above fold | FR-J5 | none |

Three of the five *normative* pilot sections (A1 navigation, A17 pagination, A22 member gating) need constructs the validated vocabulary does not have. The spike validates the vocabulary against the two simplest shapes in the library: a static hero and a three-field card.

This is not fatal to option D — the vocabulary can be extended, and the token mechanic will carry whatever it emits. It is fatal to the *claim* that §7.3's mechanism is validated. **E4 owns "the annotated-HTML authoring vocabulary and its documentation," and its exit criterion is the five pilot sections — which is exactly the right gate. The PRD should stop describing the vocabulary as proven and describe it as designed-with-a-proven-core, with the eight directives labeled as the spike's subset rather than the vocabulary.**

### H-6 · FR-D4's mark emission — the last risky path — is unimplemented and structurally impossible on the current one

§7.3: *"The compiler is the single sanitization point: it escapes the text, then emits the mark ranges as `<strong>` / `<em>` / `<u>` / `<a>`."*

Reproduced: `data-prop` with `a <strong>bold</strong> word` emits `a &lt;strong&gt;bold&lt;/strong&gt; word`. `applyProps` (`compile.js:89`) sets `el.textContent`. textContent cannot produce child elements — by definition.

Emitting marks requires either `innerHTML` on the section DOM or programmatic element construction. `innerHTML` re-opens the exact question the spike closes for props: user text becomes markup, and the escaping guarantee moves from "textContent, structurally safe" to "we escape correctly, please verify." §7.3 asserts *"the compiler never emits unescaped user HTML through `{{{ }}}`, because there is no user HTML to emit"* — true of the storage model, and irrelevant to the emission step, where the compiler must *construct* HTML from ranges and then serialize it alongside the Handlebars token stream.

The interaction with `escapeHbs` is where this gets sharp: today `escapeHbs` runs over the whole prop value. With marks, it must run over *text runs only* and not over the generated tags, and the `href` of an `<a>` mark is a user-supplied URL that needs the same scheme validation NFR-3 requires on the canvas path — a rule NFR-3 states for the canvas and never states for the compiler.

The PRD calls the token mechanic "the single riskiest case in the design." It was. This is the new one, and it has zero evidence.

**Fix:** extend the spike (or E4's compiled-output snapshot harness) with one test: a prop carrying all four marks, a nested mark, an `<a>` with a `javascript:` href, and a mark whose text contains `{{`. That is four assertions and it retires the whole question.

### H-7 · The data-attribute CSS mechanism guarantees dead CSS, and nothing measures it

§7.3 mandates: *"each control writes its value to a `data-{control}` attribute on the section root, and the section stylesheet selects on it (`.hero[data-media-side="right"] { … }`)."*

The consequence is arithmetic. A section stylesheet must carry a rule block for **every value of every control**, because any value may be chosen. The compiled theme emits **one** value per control per instance. Every other block is dead — permanently, on that site.

FR-J3's dead-CSS story stops at section granularity: *"Section CSS is emitted only for placed sections."* That eliminates unplaced *sections*. Within a placed section, on pilot A4 ("the heaviest control set in the library"), most of the emitted stylesheet is unreachable.

NFR-2's 50 KB gzipped per-template CSS budget is the only backstop, and it measures the symptom while attributing it to the wrong cause. There is no unused-CSS check named anywhere in the PRD, and "used-section styles" in §7.4's tree comment is doing a lot of quiet work.

Note the mechanism is still the right call — closed-valued controls, single attribute write, one-frame optimistic paint, and FR-Q3's free promotion to `{{@custom.*}}` all follow from it, and *promoted* controls genuinely need every branch present. The problem is that the PRD never distinguishes promoted controls (all branches required) from baked ones (one branch required) in the CSS emission story, and never measures the difference.

**Fix:** state the rule — for a baked control, emit only the selected branch; for an FR-Q3-promoted control, emit all branches because Ghost Admin can change the value post-deploy. Then add a `purgecss`-class assertion over rendered fixture templates to NFR-2's CI list. This is likely the single largest byte win available and it is currently unspecified in either direction.

### H-8 · No JS module contract, and no-JS degradation is unspecified

FR-J4 names ten behavior modules and constrains them on four axes: bundled only if used, vanilla, deferred, and `data-i18n-*` strings on the mount element. What a module *is* has no definition:

- **Mount convention.** Nothing says how a module finds its elements. `data-behavior="accordion"`? A class? The section root's `data-*`? Two authors will pick differently across 485 variants.
- **Init signature and idempotency.** No `init(root)` contract, no rule against double-binding when a module's markup appears twice on a page (two accordions, two carousels), no statement of what happens on Ghost's infinite-scroll DOM insertions.
- **Listener hygiene.** No delegation-vs-per-node rule, no teardown. A load-more module that binds per-card and appends 12 cards per click leaks linearly; nothing forbids it.
- **Ordering.** Ten modules in one deferred `main.js` with no stated init order or dependency rule.
- **No-JS degradation — the important one.** Load-more, infinite scroll, accordion, lightbox, TOC scroll-spy, mobile nav and the A23 search overlay all render markup that is inert without JS. Nothing says the accordion ships open, the mobile nav degrades to a visible list, load-more degrades to a real `/page/2/` link, or the search trigger hides itself. On a marketplace theme this is table stakes; Casper's own infinite-scroll sits behind `{{pagination}}`'s real links.

NFR-2 gates JS on size (<40 KB gz), non-blocking loading, and zero console errors. All three are satisfiable by a module that leaks listeners, double-binds, and renders a dead accordion for every no-JS visitor.

**Fix:** one paragraph in FR-J4 fixing the mount attribute, an idempotent `init(root)` signature, event delegation as the default, and a one-line degradation statement per module. The last is the one that shows up in a code review.

### H-9 · NFR-2's font assertion contradicts Appendix D.b

NFR-2, CI assertion (2): *"every shipped font is **subset**, preloaded, and `woff2`-only."*

Appendix D.b: *"**Non-latin project languages ship the full face** for the covering script — no Inflozo-side subsetting at all."*

A Cyrillic, Greek or CJK project ships a font that is by definition not subset. The CI assertion either fails that project's theme, or was silently written to mean latin-only and says so nowhere. D.b is the considered, correct position — content-driven subsetting genuinely is wrong here, and the reasoning is excellent. NFR-2's assertion just wasn't updated to match.

**Fix:** NFR-2 (2) becomes "every shipped font is `woff2`, preloaded, and subset **where D.b's static script-range subsetting applies**."

### H-10 · A single `error.hbs` for both 404 and 500

§7.4 and FR-I1 emit one `error.hbs`. Ghost supports `error-404.hbs`, `error-4xx.hbs` and `error-5xx.hbs`, and prioritizes the most specific match.

Casper ships two, and the comment in `error.hbs` explains exactly why:

> *Because 500 errors in particular usually happen when a server is struggling, this template is as simple as possible. No template dependencies, no JS, no API calls. This is to prevent rendering the error-page itself compounding the issue causing the error in the first place.*

Casper's `error.hbs` is a **standalone document** — no `{{!< default}}`, no partials, one stylesheet link. Its `error-404.hbs` *does* extend `default.hbs` and does a `{{#get "posts" limit="3"}}` for "read something else instead," because a 404 is a normal browsing event on a healthy server.

Inflozo's §7.4 does not say which shape its single `error.hbs` takes, and the two requirements are opposite. If it extends `default.hbs` (as the Synthesis Defaults presumably produce), every 500 on a struggling server renders the full shell — fonts, `main.js`, header and footer partials, and whatever `{{#get}}` the designed sections carry — which is the failure mode Casper's comment exists to prevent.

**Fix:** §7.4 emits `error-404.hbs` (designed, extends `default.hbs`) and `error.hbs` (synthesized, standalone, no partials, no JS, inline critical CSS or one stylesheet link). Both are cheap; the 500 template need never be user-designable.

---

## MEDIUM

### M-1 · The evidence artifact does not match §7.4's own structure

§7.4 specifies `assets/css/screen.css` (tokens + base + used-section styles) and `assets/css/cards.css` (Koenig). The spike emits `assets/css/main.css` and no `cards.css`. It also omits `tag.hbs`, `author.hbs`, `error.hbs`, `locales/`, `assets/fonts/`, `assets/images/`, `assets/js/`, `README.md`, `partials/header.hbs`, `partials/footer.hbs` and `partials/pagination.hbs` — everything in §7.4's tree except four templates and two section partials.

The spike is honest about being a spike ("Not covered: no live Ghost install"). §7.3 is not: it cites `spike-compiler/` as validating "the whole path empirically." It validates the DOM→`.hbs` serialization path. §7.4's structure has no evidence behind it at all, and its filenames disagree with the one artifact that exists.

### M-2 · The emitted CSS is not evidence of a CSS architecture

Eleven lines:

```css
:root {
  --accent: #1f6feb;                                    /* declared, never used */
  --gh-font-heading: var(--font-heading, ui-sans-serif, system-ui, sans-serif);
  --gh-font-body: var(--font-body, ui-serif, Georgia, serif);
}
body { font-family: var(--gh-font-body); }
h1, h2, h3 { font-family: var(--gh-font-heading); }
.hero { padding: 4rem 1rem; text-align: center; }       /* emitted class is "hero hero--centered"; the modifier is unstyled */
.post-card { display: block; }                          /* <article> is already block */
.kg-width-wide { max-width: 1000px; margin-inline: auto; }
.kg-width-full { max-width: 100%; }                     /* both present only to satisfy gscan */
```

No reset, no dark mode, no media query, no `prefers-reduced-motion`, no `@media print`, no cascade layers, no specificity strategy, no token architecture beyond three custom properties. For a 485-section library, this is zero evidence on every axis the brief asks about except one: the `--gh-font-*` names, which correctly satisfy `GS051-CUSTOM-FONTS` and are the one deliberate thing in the file.

Fair to the PRD: Casper carries **no** `prefers-reduced-motion` and **no** `@media print` either (I checked both themes; Casper has one `prefers-color-scheme` block, Source has none — it reads `@custom.color_scheme` instead). So "Casper/Source-grade" is a *low* bar on motion and print. But the PRD claims *marketplace*-grade and requires neither, and FR-D/FR-E give the editor a live dark mode, motion controls and a Style Pack token system — all of which imply CSS behavior the PRD never writes down.

**Fix:** Appendix D or FR-J3 should state the global stylesheet's structure normatively — layer order, reset, token block position, `prefers-reduced-motion` handling for every animated primitive, and a print position (even "no print styles, stated"). One paragraph.

### M-3 · The only chrome string the spike emits is a hard-coded literal, and it is unstyled

```handlebars
<a class="skip-link" href="#main">Skip to content</a>
```

Two violations of stated requirements in nine words:

1. **FR-Q6 names "skip-link" explicitly** in its list of catalog strings, and FR-J5 says "all chrome strings emit via `{{t}}` … no hard-coded visitor-facing literals." This one is hard-coded English.
2. **`.skip-link` has no CSS rule anywhere in the emitted theme.** It is therefore a permanently visible, unstyled link at the top-left of every page of the site. The correct implementation (off-screen until `:focus`) is four lines and is missing, so the accessibility affordance is a visual defect instead.

Both are exactly the class of thing the "no builder fingerprints, marketplace-grade" claim is about, in the smallest file in the theme.

### M-4 · `{{post_class}}` is required by FR-J5 and appears nowhere

FR-J5 mandates `{{post_class}}`. The emitted `post.hbs` has `<article class="post">`; `partials/post-card.hbs` has `<article class="post-card">`. Casper's post card leads with `<article class="post-card {{post_class}}…">`.

`post_class` is what carries `featured`, `tag-*`, `post-access-*` and `page` onto the element — it is how Ghost themes style featured posts and members-only cards without extra logic, and how *hand-editors* expect to hook in. Its absence is both a requirement violation and a hand-editability loss.

### M-5 · `alt` handling is wrong in both places it appears

- `post.hbs` / `page.hbs`: `alt="{{title}}"`. The `<h1>` directly above says the same words. A screen reader hears the title twice. Casper and Source both use `feature_image_alt` with a title fallback.
- `partials/post-card.hbs`: `alt=""` — carried straight through from the source section's placeholder. The image is the sole content of `<a class="post-card__image-link">`, so that link has no accessible name at all. (The card *also* has a titled link, so this is a duplicate-link/empty-name pattern rather than a total loss — still an axe finding, and still what a reviewer flags first.)

NFR-5 requires "an alt attribute on **every** image (user-supplied, falling back to the bound Ghost field)". The vocabulary has no way to express that fallback (H-5), so the requirement has no mechanism and the artifact has neither variant of it right.

### M-6 · No `home.hbs`, which is why FR-H2 needs an SEO workaround

Ghost supports `home.hbs`, and Source uses it — a designed homepage with its own composition, while `index.hbs` stays the paginated post index. §7.4's standard set has no `home.hbs`, so a designed marketing homepage lives on `index.hbs` and inherits Ghost's automatic `/page/2/`, `/page/3/` … routes.

FR-H2 handles this with real care — the zero-feed pre-deploy warning plus a compiler-emitted `noindex`-beyond-page-1 and canonical-to-page-1 guard. That is a correct workaround for a problem `home.hbs` does not have.

The tradeoff is genuine (a separate `home.hbs` means the user maintains two feed designs, and the Template switcher gains an entry), so this may be a deliberate choice — but the PRD never mentions `home.hbs` at all, which reads as an omission rather than a decision, and a hand-editor familiar with Source will look for the file.

### M-7 · Section comments name the variant; filenames name the layer

`build.js` emits `{{!-- Hero · Centered --}}` into `partials/sections/home/hero.hbs`. §7.4's rule is *"Layer names become filenames"* — the per-instance layer name, slugified. So the file is called what the user named the layer, and the comment inside it is called what the library named the variant.

For a user hand-editing an exported theme, these are the two labels they navigate by, and they are guaranteed to disagree. FR-J16 reinforces the point in the other direction — it reports drift "named by the user's own layer names wherever a file is a section partial, never by raw paths."

**Fix:** emit both — `{{!-- {Layer name} · {Variant} --}}` — which costs nothing and makes the file self-describing under both names.

### M-8 · §7.4's rename freedom and FR-J16's zero-false-positives requirement pull against each other

§7.4: *"Section partial names are derived from layer names and may change freely on any recompile, because nothing outside the theme references them."*

FR-J16: *"a compiled filename must never change when the user changed nothing — an unstable name would report drift the user did not cause and void the guarantee."*

These are reconcilable only if "freely" means "deterministically, and only when the layer name changed." But §7.4's byte-identical hoisting rule breaks that: identity is over *emitted `.hbs` text after substitution*, and the shared partial "takes the first instance's name in template-then-position order." So editing section A's copy so that it becomes byte-identical to section B causes B's file to disappear into a shared partial named after A — a rename of a file the user did not touch, reported as drift on the next deploy against a site where nothing was hand-edited.

FR-J16 is the requirement that must win. §7.4 should say the mapping is deterministic and stable under no-op recompiles, and that hoisting-induced renames are a known, reported change class — not "may change freely."

### M-9 · `README.md` is listed and never specified

§7.4's tree has `README.md # install + routes.yaml step + credits`. FR-J15 puts the credit there. That is the entire specification.

For an exported theme, the README **is** hand-editability — it is where a user learns which file is which. Casper's is a file-by-file map (`default.hbs` — the parent template; `index.hbs` — the list of posts; …) plus custom-template conventions and dev instructions, and it is the reason a Casper fork is approachable.

Inflozo's README has a strictly harder job than Casper's, because the file layout is *generated*: the user needs the layer-name→filename mapping, the `partials/sections/{template}/` convention, the frozen `custom-*.hbs` contract, the "re-deploy will overwrite hand edits, here is how drift detection reports that" warning, and which files are safe to edit. None of that is required anywhere. The spike emits no README at all.

**Fix:** FR-J1 or FR-J12 specifies README contents: file map, the layer-name mapping table for *this* project, the custom-template freeze, the hand-edit/redeploy interaction, and credits.

### M-10 · `card_assets: true` vs. `cards.css` — the interaction is unstated

Covered under H-2's second half. Listed separately because it is a content question (what belongs in `cards.css` when Ghost is also injecting card CSS) rather than a gate question, and it determines real bytes on every page.

### M-11 · No stated position on AMP

Ghost 5 removed AMP; gscan carries `GS001-DEPR-AMP-TEMPLATE` as a deprecation. The right answer is "no `amp.hbs`," and the PRD's silence produces that answer by default. But the brief asks for a stated decision, and a marketplace-facing quality doc that never mentions AMP reads as an oversight rather than a call. One clause in §7.4 closes it.

### M-12 · The spike does not parse-check the templates it hand-writes

`test.js` compiles exactly one thing through Handlebars: `gridTheme.template` with the `post-card` partial registered. `default.hbs`, `index.hbs`, `post.hbs` and `page.hbs` are string literals inside `build.js` — never compiler output, never precompiled, never asserted.

I ran `Handlebars.precompile` across all 7 emitted `.hbs`: **0 failures**. So nothing is broken today. But four of the seven files in the "0 errors / 0 warnings" theme are hand-written fixtures dressed as compiler output, and the README's "16/16 on the two renderers" reads as broader coverage than it is. gscan's `GS005-TPL-ERR` does catch parse failures — but note both Casper and Source *fail* that check on the v5 spec, so it is not the backstop it appears to be.

---

## LOW

- **L-1 · No CSS preload.** Casper does `<link rel="preload" as="style">` ahead of the stylesheet link. Appendix D.a requires preloading the two roman font faces; nothing requires preloading the stylesheet that references them. Cheap, and it matters more than the fonts do.
- **L-2 · `<main>` placement.** `default.hbs` wraps `{{{body}}}` in `<main id="main">`; Casper and Source put `<main>` inside each template. Inflozo's choice is defensible (guarantees the skip-link target exists), but nothing prevents a library section or a synthesized template from emitting its own `<main>`, and nested `<main>` is an axe violation. One rule: sections never emit `<main>`.
- **L-3 · No stated position on `robots.txt`.** Ghost serves defaults for `robots.txt` and the sitemap, so "nothing to do" is correct — but FR-H2 has the compiler emitting `noindex` directives, so the theme *does* participate in indexing, and the boundary should be written down.
- **L-4 · `escapeHbs` does not escape a preceding backslash.** `String(s).replace(/\{\{/g, '\\{{')` — a user typing a literal `\{{x}}` gets `\\{{x}}`, which Ghost renders as `\{{x}}`. Vanishingly rare; noting it because FR-J1 states the inert-emission rule absolutely.
- **L-5 · `package.json` key order.** The emitted order (`name, description, version, engines, license, keywords, author, config`) is whatever the object literal in `build.js` happened to be. Casper and Source use a conventional order. Invisible to gscan, visible to anyone who opens the file.

---

## What is genuinely good — stated so the fixes don't obscure it

- **The token/serialization mechanic works, and the riskiest case is real.** `src="{{img_url feature_image size="m"}}"` survives HTML serialization intact. This was the thing that could have sunk option D and it doesn't.
- **The comment-unwrap-before-token-substitution ordering constraint is correct and correctly elevated.** I verified an author's own `<!-- layout note -->` survives compilation untouched. Promoting this to a binding design constraint rather than a bug note is exactly right.
- **`{{{ }}}` audit is clean.** Triple-stash is emitted exactly once — `{{{body}}}` in `default.hbs` — which is mandatory Ghost idiom and safe. `{{content}}` is correctly double-stashed (Ghost returns a SafeString; Casper does the same). No user content passes through a triple-stash anywhere. This is the one structural safety property the spike demonstrates end to end, and it is worth more than most of the findings above.
- **Partials invoked with no parameters under `{{#foreach}}`** is the correct Ghost idiom and matches Casper exactly (`{{#foreach posts}}{{> "post-card"}}{{/foreach}}`). §7.4's "arrays are NEVER flattened into numbered hash params" rule is right, and its scalar-hash-param allowance matches Source's actual house style (`{{> "components/post-list" feed="home" showTitle=true}}`).
- **The C2 and GS110 decisions are correct and I re-verified both on current gscan.** Omitting `engines.ghost-api` and gating `page.hbs` on `@page.show_title_and_feature_image` are precisely the two things standing between a Ghost theme and a clean scan.
- **Self-hosted subset woff2 with `font-display: swap`, no Google Fonts, OFL/Apache-only pool** exceeds both benchmark themes, which ship no fonts at all. Appendix D.b's rejection of content-driven subsetting is the correct call for the right reason, argued better than most production theme docs argue it.
- **FR-J16's drift detection** — content manifest over SHA-256, never zip bytes, targeting the frozen theme name, failing open — is better engineering than anything in the benchmark themes, which have no equivalent concept.
- **FR-I1's `custom-{name}.hbs` analysis** (no `page-{slug}.hbs`, no members template family, filename as frozen public API) is correct, well-sourced, and catches a trap most Ghost theme developers fall into.
- **NFR-2's framing** — assert the properties Inflozo controls, in CI, without a Ghost host — is exactly the right shape for this problem. My complaint in H-1 is only that the list stops at performance when the same harness could carry a11y, HTML validity and unused CSS at near-zero marginal cost.

---

## Aspirational vs. enforced — the full ledger

Every claim below is a stated quality property with no requirement, test or gate behind it.

| # | Claim | Where | Enforcement that exists | Gap |
|---|---|---|---|---|
| A1 | "hand-editable and production grade, at Casper/Source quality" | FR-J1 | gscan 0/0 | Proven above to certify a theme with no `lang`, no `alt`, inline `onclick` and inverted headings |
| A2 | "everything is Prettier-formatted" | FR-J1 | none | Prettier cannot parse `{{> }}`; deletes the doctype on the file it can parse; output is visibly unformatted |
| A3 | "class names derive from section names" | FR-J1 | none | No collision rule across 485 variants, no reserved-prefix rule vs `.kg-*` and Ghost's injected card CSS |
| A4 | "section boundaries carry comments" | FR-J1 | none | Emitted comment names the variant, filename names the layer (M-7) |
| A5 | "`package.json` is complete" | FR-J1 | gscan's package checks | "Complete" undefined; artifact ships no `image_sizes` (CR-2), no `screenshots` (CR-5), wrong `engines.ghost` (CR-4) — all invisible to gscan |
| A6 | "no builder fingerprints appear anywhere" | FR-J1 | `test.js` regex on `data-(prop\|bind\|empty\|repeat\|partial)` | Only tests the 5 directive names on 2 sections; nothing scans a full compiled theme |
| A7 | "`cards.css` — Koenig treatment" | §7.4, FR-J3 | 2 of ~113 gscan rules (`card_assets:true` disables the rest) | H-2 |
| A8 | "screen.css = tokens + base + **used-section styles**" | §7.4 | none | Dead-CSS story stops at section granularity; data-attribute mechanism guarantees intra-section dead rules (H-7) |
| A9 | "`assets/js/main.js` — **used behaviors only**" | §7.4, FR-J4 | NFR-2 size/defer/console gates | No module contract, no no-JS degradation, no listener hygiene (H-8) |
| A10 | "Generated themes carry an alt attribute on **every** image … and a correct heading order per template" | NFR-5 | axe-core on 485 *variants* | Scope excludes every compiler-synthesized file; heading order is document-level and untestable per variant (H-3) |
| A11 | "every image carries a correct `srcset` and `sizes`" | NFR-2 (1) | asserted in CI | Vocabulary cannot emit a multi-entry srcset; artifact emits `src` only (H-5, CR-2) |
| A12 | "every shipped font is **subset**, preloaded, `woff2`-only" | NFR-2 (2) | asserted in CI | Contradicted by Appendix D.b for non-latin projects (H-9) |
| A13 | "CSS budget ≤ 50 KB gzipped per rendered template" | NFR-2 (4) | asserted in CI | Sound — but it is the *only* CSS gate, and it measures bytes, not quality or deadness |
| A14 | "no layout shift from unguarded elements" | NFR-2 (5) | "proving no unguarded `src`/`srcset` survives compilation" | The guard itself can be wrong and still be present — CR-1's `{{#if YYYY}}` passes this assertion |
| A15 | "compiled theme carries the chosen values as static attributes with **zero runtime cost**" | §7.3 | none | True of the attributes; says nothing about the stylesheet carrying every unchosen branch (H-7) |
| A16 | "The compiler is the single sanitization point: it … emits the mark ranges as `<strong>`…" | §7.3 | none | Unimplemented and impossible on the textContent path; no test exists (H-6) |
| A17 | "compile validation enforces [`{{t}}`-only]" | FR-Q6 | none named | gscan is blind to it (verified); the validation is Inflozo's to build and no test is specified |
| A18 | "`{{post_class}}`, no deprecated helpers, `{{img_url}}` with `srcset` + WebP + lazy loading" | FR-J5 | gscan catches deprecated helpers only | `post_class`, `srcset`, WebP and `loading` have no gate and none appear in the artifact (M-4, H-5) |
| A19 | "the mapping is **fully deterministic** — the same project doc compiles to the same filenames on every machine and every run" | §7.4 | NFR-6(c1) snapshot diff | The snapshot diff would surface churn, but nothing asserts determinism directly; no compile-twice-and-compare test is named, and FR-J16 depends on it absolutely |
| A20 | "0 errors, 0 warnings … **Target for all library output**" | FR-J6 | gscan, run per compile | Real and met — but see A1: what it certifies is far less than what it is presented as certifying |

---

## Recommendations, in priority order

1. **Fix CR-1 before E4 exits.** One-line derivation bug, silent permanent content loss, and it breaks §7.3's canvas/theme agreement guarantee in the one place a user cannot see it. Add the helper-bound-guard case to the spike's assertions.
2. **Pin `config.image_sizes` in FR-J2 with real widths, and cross-check `size=` usage at compile.** Without it every image on every generated site serves at original resolution and no gate notices.
3. **Resolve FR-Q5 against GS100.** State that built-ins are emitted only when read, or specify exactly where `default.hbs` reads all three. As written, an ordinary Light+Dark project cannot deploy.
4. **Extend NFR-5's a11y scope from "485 variants" to "every template of every compiled fixture theme."** The themes exist (NFR-6(b)), the harness exists (NFR-6(a)), and this is the largest quality gain available for the least new machinery.
5. **Add three CI assertions to NFR-2's list:** HTML validation of rendered templates, `stylelint` on emitted CSS, and an unused-CSS check. Plus the two cross-checks from (2) and (3). All offline, all cheap, all catching things gscan structurally cannot.
6. **Replace "Prettier-formatted" with a deterministic emitter plus a compile-twice-byte-identical assertion.** It is implementable, it is the formatting gate, and FR-J16 needs it anyway.
7. **Relabel §7.3's directive vocabulary as designed rather than validated,** and let E4's pilot-section exit prove the extensions (srcset, conditional attributes, member gating, navigation, pagination, `{{t}}` hash params). The spike validated the core, and saying so precisely costs nothing.
8. **Add the missing `package.json` keys** — `screenshots`, correct `engines.ghost` for the supported range — and decide `gpm`/`demo` explicitly.
9. **Split `error.hbs` into `error-404.hbs` (designed) and `error.hbs` (standalone, dependency-free).** Casper's comment explains why better than I can.
10. **Specify the README.** It is the one file that decides whether "hand-editable" is true in practice, and it currently has a seven-word specification.
