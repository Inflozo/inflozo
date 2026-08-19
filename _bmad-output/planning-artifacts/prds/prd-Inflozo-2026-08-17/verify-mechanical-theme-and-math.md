---
title: Verification — mechanical corrections (generated-theme conventions & Appendix F arithmetic)
status: verification
created: 2026-08-18
---

# Verification — mechanical corrections

Independent verification of the "mechanical" findings in `validation-report.md` (§ Medium (54), § Low (25)) before any of them is written into `prd.md`. Nothing below is taken from the report on trust; every claim was re-derived from primary sources.

**Evidence base**

| Source | Pin |
|---|---|
| Casper | `TryGhost/Casper` @ `b66cfc7ce8b8b50a8585620133815e562c9d5690` (2026-08-17) |
| Source | `TryGhost/Source` @ `ff0ead2028c228083e18c219b4fdc1e4656fb986` (2026-08-17) |
| gscan | `6.4.2` (the version Casper and Source both pin in `devDependencies`) |
| Handlebars | `4.7.9` |
| Spike | `spike-compiler/` in this workspace |
| PRD | `prd.md` (214 KB, 2026-08-18 15:11) |

**Headline**

- Part 1 — **1 REFUTED · 4 PARTIALLY CORRECT · 7 CONFIRMED · 0 UNVERIFIABLE.**
- Part 2 — the arithmetic **largely reconciles**: 4 of the 8 tested claims FAIL, but **2 of the report's own "corrections" are themselves wrong**, and the model's *structure* is wrong in a way none of the findings reach.

---

# PART 1 — Theme output conventions

## 1.0 Verdict summary

| # | Claim | Verdict |
|---|---|---|
| 11 | Section comments name the variant while filenames name the layer | **REFUTED** |
| 1 | `{{post_class}}` required, absent, and what it carries | **PARTIALLY CORRECT** |
| 2 | `alt` handling wrong in two places | **PARTIALLY CORRECT** |
| 3 | No CSS preload | **PARTIALLY CORRECT** |
| 5 | No stated position on AMP | **PARTIALLY CORRECT** |
| 4 | `<main>` placement differs from Casper/Source | **CONFIRMED** |
| 6 | No stated position on `robots.txt` | **CONFIRMED** |
| 7 | Spike output ≠ §7.4's own specification | **CONFIRMED** (and incomplete — 8 further divergences) |
| 8 | `README.md` listed but never specified | **CONFIRMED** |
| 9 | Escaping helper misses a preceding backslash | **CONFIRMED** (report *understates* the consequence) |
| 10 | `package.json` key order arbitrary | **CONFIRMED** (convention only — nothing enforces it) |
| 12 | Missing `home.hbs` | **CONFIRMED** |

A standing note before the detail: **convention is not correctness.** Of the twelve, exactly **three** are enforced by something outside Inflozo's own prose — #2's second half (axe-core `link-name`, a WCAG 2.1 AA failure that NFR-5 sets to zero), #9 (a functional break of FR-J1's inert-emission guarantee, proven below), and #12's routing consequence (Ghost's own template resolution). Everything else is either an Inflozo self-consistency defect or a house-style preference. Each entry says which.

**Baseline fact, verified first:** the spike's emitted theme passes gscan `6.4.2` at **0 errors / 0 warnings against both the v5 and v6 specs**. FR-J6's empirical claim holds. None of the findings below is a gscan failure — which is exactly why they need to be argued on their merits rather than asserted.

```
=== GSCAN v5 === ERRORS: 0  WARNINGS: 0
=== GSCAN v6 === ERRORS: 0  WARNINGS: 0
```

---

## 1.1 REFUTED — read this first

### Claim 11 — "Section comments name the variant; filenames name the layer" — **REFUTED**

> Report: *"`build.js` emits `{{!-- Hero · Centered --}}` into `partials/sections/home/hero.hbs`, while §7.4's rule is 'layer names become filenames.' For a hand-editor these are the two labels they navigate by, and they are guaranteed to disagree. **Fix: emit both — `{{!-- {Layer name} · {Variant} --}}`.**"*

**The spike already emits the report's prescribed fix.** `spike-compiler/build.js:17-18`:

```js
fs.writeFileSync(path.join(out, 'partials/sections/home/hero.hbs'), `{{!-- Hero · Centered --}}\n${hero.template}\n`);
fs.writeFileSync(path.join(out, 'partials/sections/home/latest-posts.hbs'), `{{!-- Latest Posts · 3-up grid --}}\n${grid.template}\n`);
```

Both comments are `{Name} · {Variant}`, and in both cases the first segment is the **filename stem, title-cased**:

| File | Comment | First segment vs filename |
|---|---|---|
| `partials/sections/home/hero.hbs` | `{{!-- Hero · Centered --}}` | `Hero` → `hero` — **agrees** |
| `partials/sections/home/latest-posts.hbs` | `{{!-- Latest Posts · 3-up grid --}}` | `Latest Posts` → `latest-posts` — **agrees** |

The comment does not "name the variant" instead of the layer; it names the layer *and* the variant, which is the report's own recommendation. "Guaranteed to disagree" is not supported by the artifact cited as its evidence.

**What survives.** A narrower, real gap remains, and it should replace the finding rather than be dropped: **the PRD never specifies the comment's content at all.** FR-J1's entire specification is four words — *"section boundaries carry comments"* (`prd.md:233`). §7.4 specifies filenames normatively ("Layer names become filenames," with slugification, collision suffixes and hoisting rules) and says nothing about comments. `build.js` hardcodes both strings independently, so the spike proves the *format* is achievable and proves nothing about whether it is *derived* from the layer name. If the user renames a layer to "Welcome banner", nothing in the PRD says the comment follows.

**Rewrite the finding as:** *"FR-J1 requires section boundary comments and never specifies their content. §7.4 makes filenames normative and derived from layer names; the comment format is undefined, so nothing guarantees the two labels a hand-editor navigates by stay in sync across a rename. Fix: state the comment format normatively — `{{!-- {Layer name} · {Category} · {Variant} --}}` — and bind it to the same layer-name source §7.4 binds the filename to."* Severity: **Low** (house style with a rename-drift edge), not Medium.

---

## 1.2 PARTIALLY CORRECT

### Claim 1 — `{{post_class}}` — **PARTIALLY CORRECT**

> Report: *"`{{post_class}}` is required by FR-J5 and appears nowhere. It carries `featured`, `tag-*`, `post-access-*` and `page` onto the element…"*

**Absence — CONFIRMED.** `grep -rn post_class spike-compiler/theme-output/` returns **0** matches. `{{body_class}}` is present once (`theme-output/default.hbs:10`); `{{post_class}}` appears on no element in `post.hbs`, `page.hbs` or `partials/post-card.hbs`, all three of which are exactly where Casper and Source put it.

**"Required by FR-J5" — CONFIRMED, but requirement-internal only.** FR-J5 (`prd.md:235`) names it literally in its list: *"`{{ghost_head}}`/`{{ghost_foot}}`, `{{body_class}}`, `{{post_class}}`, no deprecated helpers…"*. It is **not** required by Ghost or gscan — the spike scores 0/0 without it. This is an Inflozo self-consistency violation, not a platform violation, and the finding should say so.

**Payload description — REFUTED in part.** Verified against `TryGhost/Ghost` `core/frontend/helpers/post_class.js`, the helper emits:

| Class | Condition |
|---|---|
| `post` | always |
| `tag-{slug}` | one per attached tag |
| `featured` | `featured === true` |
| `no-image` | **no** `feature_image` |
| `page` | the resource is a page |

`post-access-*` is **not emitted by `post_class`**. Casper adds it by hand, which is directly visible in the benchmark the report cites — [`casper/partials/post-card.hbs:4`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/partials/post-card.hbs#L4):

```hbs
{{#unless access}} post-access-{{visibility}}{{/unless}}
```

If the fix is written from the report's list, the compiler will be specified to get members-only card styling from `post_class` — which it will not get, silently, on every members site. The report also omits `no-image`, which is the class most likely to matter to a generated theme whose sections must degrade when a post has no feature image (FR-H8's guard territory).

**Corrected finding:** *"FR-J5 names `{{post_class}}` and the spike emits it nowhere — a requirement violation, though not a gscan or Ghost failure. It carries `post`, `tag-{slug}`, `featured`, `no-image` and `page`. It does **not** carry `post-access-*`: members-visibility classes are theme-authored (Casper `partials/post-card.hbs:4`), so if Inflozo wants members-only card styling it must emit `{{#unless access}} post-access-{{visibility}}{{/unless}}` itself."*

**Placement, for the fix:** [Casper `post.hbs:11`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/post.hbs#L11), [`page.hbs:11`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/page.hbs#L11), [`partials/post-card.hbs:4`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/partials/post-card.hbs#L4); [Source `post.hbs:8`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/post.hbs#L8), [`page.hbs:7`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/page.hbs#L7), [`partials/post-card.hbs:1`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/partials/post-card.hbs#L1). Both put it on the wrapping `<article>`, never on `<body>`.

---

### Claim 2 — `alt` handling — **PARTIALLY CORRECT** (first half refuted, second half confirmed and *stronger* than stated)

> Report: *"`post.hbs`/`page.hbs` use `alt="{{title}}"` with the `<h1>` directly above saying the same words (a screen reader hears it twice); `partials/post-card.hbs` uses `alt=""` on the sole content of `<a class="post-card__image-link">`, leaving that link with no accessible name. Casper and Source both use `feature_image_alt` with a title fallback…"*

#### Half A — `alt="{{title}}"` beneath an `<h1>` — **REFUTED**

This is precisely what Casper ships. [Casper `post.hbs`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/post.hbs):

- line 26: `<h1 class="article-title">{{title}}</h1>`
- line 75: `alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"`

When `feature_image_alt` is empty — the overwhelmingly common case, since it is an optional field most authors never fill — Casper renders **exactly** `alt="{{title}}"` under an `<h1>` carrying the same words. Same structure in [Casper `page.hbs:29`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/page.hbs#L29) and [Source `partials/feature-image.hbs:11`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/partials/feature-image.hbs#L11).

Calling this "wrong" indicts the benchmark. It is also not an axe-core violation: axe has no rule against an image whose alt duplicates nearby heading text (`image-redundant-alt` targets alt text duplicated in *adjacent text within the same link/figure caption*, and is a WCAG-optional "cautious" rule, not part of the `wcag21aa` tag set NFR-5 pins). NFR-5's threshold is unaffected.

**What survives:** the spike hardcodes `alt="{{title}}"` with **no `feature_image_alt` first branch at all**, and NFR-5's own words are *"an alt attribute on every image (user-supplied, falling back to the bound Ghost field)"* — the spike has the fallback and not the user-supplied field. And the report's closing clause is correct and is the load-bearing part: **the directive vocabulary cannot express the conditional.** `compile.js:21-28` (`bindExpr`) supports exactly three forms — `{{path}}`, `{{img_url path size="x"}}`, `{{date path format="x"}}`. There is no branch, no `{{#if}}`, no `{{else}}`. Emitting `{{#if feature_image_alt}}…{{else}}…{{/if}}` requires a vocabulary extension that does not exist and is not specified anywhere in FR-H or Appendix B.

**Rewrite Half A as:** *"NFR-5 requires alt to be 'user-supplied, falling back to the bound Ghost field.' Ghost's user-supplied field is `feature_image_alt` and the fallback is `{{title}}` — the Casper/Source convention — but `compile.js`'s `bindExpr` supports only three unconditional forms, so the two-branch expression NFR-5 describes is inexpressible in the directive vocabulary as specified. Fix: add a declared fallback directive (e.g. `data-bind="feature_image_alt|fallback:title"`) to Appendix B, or state that alt is emitted by a compiler special case rather than by a binding."* Severity: **Medium** (a stated NFR with no mechanism), and drop the "screen reader hears it twice" framing entirely.

#### Half B — `alt=""` on a link's sole content — **CONFIRMED, and understated**

`spike-compiler/theme-output/partials/post-card.hbs:3-5`:

```hbs
<a class="post-card__image-link" href="{{url}}">
  {{#if feature_image}}<img class="post-card__image" src="{{img_url feature_image size="m"}}" alt="">{{/if}}
</a>
<h3 class="post-card__title">{{title}}</h3>
```

The `<a>` contains only the image. With `alt=""` the image is removed from the accessibility tree, so the link has **no accessible name**. That is axe-core `link-name` — impact *serious*, tagged `wcag2a` / `wcag412` — squarely inside NFR-5's `wcag21aa` scope and its **zero violations** threshold. When `feature_image` is absent the `<a>` is empty and the violation is the same. This is one of only three findings in Part 1 enforced by something outside Inflozo's own prose.

**And the benchmark makes the diagnosis exact.** Casper uses the *same* image-only-link structure — [`casper/partials/post-card.hbs:7-35`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/partials/post-card.hbs#L7) opens `<a class="post-card-image-link">`, closes it at line 35, and the title lives in a *second* link at line 40. The pattern is fine. What makes Casper's version accessible is that its `<img>` carries a **non-empty** alt (line 18). Source takes the other valid route: [`source/partials/post-card.hbs`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/partials/post-card.hbs) uses **one** link (line 2) wrapping both the `<figure>` and the `<h3>` title (line 23), so the title text names the link.

So the spike took Casper's structure and Source's `alt` policy — a combination neither theme ships, and the only combination of the three that fails. The fix is a one-line choice, and the finding should name it:

> Either give the image a non-empty alt (Casper), or extend the link to wrap the title (Source). Never an image-only link with `alt=""`.

This should also be lifted out of "theme quality" and stated as a **compile-validation rule**, because NFR-6(a)'s axe pass will flag it on every card-bearing variant at once (A4, A17, A25 and the whole feed family), not once.

---

### Claim 3 — CSS preload — **PARTIALLY CORRECT** (fact confirmed, rationale backwards)

> Report: *"Casper does `<link rel="preload" as="style">` ahead of the stylesheet link; Appendix D.a requires preloading the two roman font faces and nothing requires preloading the stylesheet that references them. Cheap, and **it matters more than the fonts do**."*

**Fact — CONFIRMED, in both themes.**

[Casper `default.hbs:12-18`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/default.hbs#L12):
```hbs
{{!-- Preload critical resources to reduce render-blocking --}}
<link rel="preload" as="style" href="{{asset "built/screen.css"}}" />
<link rel="preload" as="script" href="{{asset "built/casper.js"}}" />
…
<link rel="stylesheet" type="text/css" href="{{asset "built/screen.css"}}" />
```

[Source `default.hbs:9-17`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/default.hbs#L9) is identical in shape and additionally preloads its script. The spike (`theme-output/default.hbs:7`) emits the bare stylesheet link with no preload.

**Rationale — REFUTED.** "It matters more than the fonts do" is backwards, and the PRD is on the right side of it:

- The stylesheet `<link>` sits **five lines below** the preload in the same `<head>`. The browser's preload scanner discovers both in the same parse tick and fetches at the same priority — `<link rel=stylesheet>` is already Highest priority. The measured benefit of preloading a same-document, same-head stylesheet is approximately zero; it is a well-known cargo-culted line in `<head>` boilerplate.
- **Fonts are the opposite case.** A `@font-face` `src` is discovered only after the CSSOM is built and the font is matched to rendered text — two round-trips deep. That is exactly the discovery-latency problem `rel=preload` was designed for, and it is why Appendix D.a and NFR-2(2) require font preloading.

Both themes agree with the PRD here, not with the report: Source's very next line after the two preloads is `{{> "typography/fonts"}}`, commented *"Fonts are preloaded and defined in the default template to avoid layout shift."*

**Rewrite as:** *"Casper and Source both preload the stylesheet ahead of the `<link rel=stylesheet>` (`default.hbs:13` / `default.hbs:10`); Inflozo emits neither. The measurable benefit is near-zero — the preload scanner finds a same-head stylesheet link on the same tick — so this is a **house-style parity item**, not a performance item. Adopt it for benchmark parity or state the omission as deliberate. Appendix D.a's font preloading is the one that carries the actual saving and is already required."* Severity: **Low**, and delete "it matters more than the fonts do."

---

### Claim 5 — AMP — **PARTIALLY CORRECT** (deprecation rule confirmed, version wrong)

> Report: *"**Ghost 5 removed it** and gscan carries `GS001-DEPR-AMP-TEMPLATE`; the right answer is 'no `amp.hbs`,' which the PRD's silence produces by default…"*

**"Ghost 5 removed it" — REFUTED. AMP was removed in Ghost 6.0.** gscan's own rule text is decisive, and it lives in the **v6 spec only** (`gscan/lib/specs/v6.js:51-57`):

```js
'GS001-DEPR-AMP-TEMPLATE': {
    level: 'warning',
    rule: 'AMP templates are no longer supported in Ghost 6.0',
    details: 'AMP support was removed in Ghost 6.0. Remove AMP templates and use responsive design instead.',
    regex: /<html\s+(?:amp|⚡)(?:\s|>)|<html\s+[^>]*\s(?:amp|⚡)(?:\s|>)/i
}
```

No AMP rule exists in the v1–v5 specs; the only other AMP token in gscan is `amp_components` / `amp_content` / `amp_ghost_head` in v1's **knownHelpers** list — i.e. AMP helpers were *supported* through the v5 lineage. AMP was deprecated during Ghost 5.x and removed at 6.0, which Ghost's own breaking-changes issue for 6.0 confirms.

This matters beyond pedantry: NFR-7 commits to **both** 5.x and 6.x. Writing "Ghost 5 removed AMP" into a PRD that ships a 5.x-compatible theme is a factual error inside the exact compatibility surface the document is asserting.

**Two further corrections to the finding:**

1. **The rule is a `warning`, not an error** — so an `amp.hbs` would not block deploy, it would break FR-J6's 0/0 target. That is the actual consequence and the report does not state it.
2. **The rule does not detect `amp.hbs` at all.** Its regex matches `<html amp>` / `<html ⚡>` in template *content*. A file literally named `amp.hbs` containing an ordinary `<html>` tag trips nothing. So "the PRD's silence produces the right answer by default" is true for a different reason than the report gives — Inflozo has no surface that could create an `amp.hbs`, not because gscan would catch one.

**Rewrite as:** *"No stated position on AMP (§7.4). AMP was **removed in Ghost 6.0** (deprecated through 5.x); gscan 6.4.2 carries `GS001-DEPR-AMP-TEMPLATE` as a **warning** on the v6 spec only, matching `<html amp>` in template content rather than the filename. The right answer — no `amp.hbs` — is what Inflozo produces by default, since no surface can create one. One clause in §7.4 turns silence into a decision."* Severity: **Low**, unchanged.

---

## 1.3 CONFIRMED

### Claim 4 — `<main>` placement — **CONFIRMED**

> Report: *"`default.hbs` wraps `{{{body}}}` in `<main id="main">` while Casper and Source put `<main>` inside each template… nothing prevents a library section or a synthesized template from emitting its own `<main>`, and nested `<main>` is an axe violation. Fix: one rule — sections never emit `<main>`."*

**Both facts CONFIRMED.**

| Theme | `default.hbs` | `<main>` location |
|---|---|---|
| Casper | `{{{body}}}` bare inside `<div class="site-content">` ([line 77](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/default.hbs#L77)) | per template: `index.hbs:43`, `post.hbs:10`, `page.hbs:10`, `tag.hbs:4`, `author.hbs:4`, `error.hbs:43` |
| Source | `{{{body}}}` bare ([line 56](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/default.hbs#L56)) | per template: `index.hbs:4`, `post.hbs:6`, `page.hbs:6`, `tag.hbs:4`, `author.hbs:4` |
| Inflozo spike | `<main id="main">{{{body}}}</main>` (`theme-output/default.hbs:12`) | shell only |

Nested `<main>` is a genuine axe-core failure (`landmark-no-duplicate-main` and `landmark-unique`, both in the `wcag21aa`-adjacent best-practice/`cat.semantics` set that a zero-violations gate will surface), and the risk is real for Inflozo specifically: 485 authored variants, any one of which could reach for `<main>`, plus synthesized templates the user never opens.

**A finding of my own that strengthens it: Source itself ships nested `<main>` on `/`.**

[`source/index.hbs`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/index.hbs):
```hbs
<main class="gh-main">
    {{> "components/post-list" feed="index" …}}
</main>
```
and [`source/partials/components/post-list.hbs:18`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/partials/components/post-list.hbs#L18) unconditionally opens a **second** `<main class="gh-main">` (closed at line 86). Ghost's own reference theme renders two nested `<main>` elements on its index route. (`home.hbs` escapes it by calling the same partial *without* an outer `<main>`.)

That is the exact failure mode the report predicts — a shared partial emitting its own landmark inside a template that already opened one — occurring in the benchmark, in a hand-maintained theme with six templates. Inflozo has 485 variants and a compiler. The rule is not optional.

**Verdict: CONFIRMED, and Inflozo's centralized choice is the better one** — it guarantees the skip-link target exists and makes the invariant enforceable in exactly one place. Add to the fix: state it as a **compile-validation assertion**, not prose — the compiler already walks the DOM (`compile.js:43-50`), so "no emitted section contains `<main>`" is a `querySelector` in the same pass, and NFR-6(a)'s axe run will catch any escapee. Cite Source's `index.hbs` as the reason.

---

### Claim 6 — `robots.txt` — **CONFIRMED**

> Report: *"Ghost serves defaults for `robots.txt` and the sitemap so 'nothing to do' is correct, but FR-H2 has the compiler emitting `noindex` directives, so the theme *does* participate in indexing and the boundary should be written down."*

**Both halves verified.**

- Ghost serves a **default `robots.txt`** on every site, referencing the Ghost-generated `sitemap.xml` and disallowing Ghost Admin and preview/draft URLs.
- A theme **can** override it: a `robots.txt` placed at the **theme root** replaces Ghost's default once that theme is active (Ghost's own help documentation describes this as the supported mechanism; it has been the behaviour since the resolution of `TryGhost/Ghost#8654`).

So the report's framing is slightly generous to the PRD — this is not merely "nothing to do," it is a **capability the compiler has and never uses**, which is a stronger reason to write the position down. §7.4's tree has no `robots.txt` entry and no note; a marketplace-facing quality document that says nothing reads as an oversight.

The tension the report names is real and verified: FR-H2 (`prd.md:206`) explicitly has the compiler emitting *"an SEO guard on such templates (`noindex` beyond page 1 plus a canonical link to page 1)"*. The theme is therefore already an indexing participant, and the boundary between "Inflozo emits page-level indexing directives" and "Ghost owns site-level crawl policy" is currently undrawn.

**Verdict: CONFIRMED.** Suggested clause for §7.4: *"No `robots.txt` and no `sitemap.xml` are emitted. Ghost serves both, and a theme-root `robots.txt` would silently replace the site owner's — including its sitemap reference. Inflozo's indexing participation is scoped to page-level directives (FR-H2's `noindex` / canonical guards) and stops there."* Severity: **Low**, unchanged.

---

### Claim 7 — spike output ≠ §7.4 — **CONFIRMED**, and the enumeration is incomplete

> Report: *"§7.4 specifies `screen.css` + `cards.css`; the spike emits `main.css` and no `cards.css`, and omits `tag.hbs`, `author.hbs`, `error.hbs`, `locales/`, `assets/fonts/`, `assets/images/`, `assets/js/`, `README.md`, `partials/header.hbs`, `footer.hbs` and `pagination.hbs`…"*

Every listed item verified against the full emitted tree (15 files total). Complete divergence table — **report's 12, plus 8 it did not catch:**

| # | §7.4 / FR requires | Spike emits | Src |
|---|---|---|---|
| 1 | `assets/css/screen.css` | `assets/css/main.css` | §7.4:388 |
| 2 | `assets/css/cards.css` (Koenig) | — (2 `.kg-*` rules inlined in `main.css:10-11`) | §7.4:389, FR-J3 |
| 3 | `tag.hbs` | — | §7.4:373 |
| 4 | `author.hbs` | — | §7.4:373 |
| 5 | `error.hbs` | — | §7.4:373 |
| 6 | `locales/{language}.json` | — | §7.4:385, FR-Q6 |
| 7 | `assets/fonts/…` | — | §7.4:386, FR-J3 |
| 8 | `assets/images/…` | — | §7.4:391, FR-J3 |
| 9 | `assets/js/main.js` | — | §7.4:390, FR-J4 |
| 10 | `README.md` | — | §7.4:392, FR-J15 |
| 11 | `partials/header.hbs` | — | §7.4:378 |
| 12 | `partials/footer.hbs` | — | §7.4:378 |
| 13 | `partials/pagination.hbs` | — | §7.4:378 |
| **14** | **`package.json.image_sizes`** ("standard `image_sizes` map") | **absent** | **FR-J2:234** |
| **15** | **`package.json.custom`** (FR-Q5 built-ins + FR-Q2 settings) | **absent** | **FR-J2:234, §7.4:370** |
| **16** | **`srcset` + WebP + lazy-loading on Ghost-hosted images** | **plain `src`, no `srcset`, no `format="webp"`, no `loading`** | **FR-J5:235, NFR-2(1)** |
| **17** | **`{{t}}` on every chrome string** | **`Skip to content` hardcoded** (`default.hbs:11`) | **FR-J5:235, FR-Q6** |
| **18** | **`{{post_class}}`** | **absent** | **FR-J5:235** |
| **19** | **`default.hbs` carries fonts + token-block link + header/footer partials** | **`<head>` has one stylesheet link; no fonts, no partials** | **§7.4:372** |
| **20** | **"Built with Inflozo" credit in footer region** | **absent** (no footer region exists) | **FR-J15:255** |
| **21** | **`engines.ghost` — unspecified either way** | **`engines: { ghost: ">=6.0.0" }` emitted** | **§7.4:370 names only `ghost-api`** |

On #21: harmless — gscan 6.4.2 inspects only `engines['ghost-api']` (`lib/checks/010-package-json.js:128-139`) and never `engines.ghost`; Casper and Source both ship `engines.ghost` (`">=5.0.0"`). But §7.4's package.json comment is written as an exhaustive key list and omits a key the spike emits, so a compiler built from §7.4 would drop it. Worth one word.

**Verdict: CONFIRMED**, with the enumeration extended from 13 items to 21. The report's characterisation — *"everything in §7.4's tree except four templates and two section partials"* — is accurate.

The report's sharper point stands and is the one to carry into the PRD: **§7.3's claim is what's wrong, not the spike.** The spike is honest ("Inflozo compiler spike — option D", `compile.js:1`) and proves exactly two things — that the two-renderer mechanism works and that gscan reads 0/0 on the output. It does not validate "the whole path empirically," and §7.3 should say what it validated instead. Recommend adding a `spike-compiler/README.md` scope paragraph rather than expanding the spike.

---

### Claim 8 — `README.md` unspecified — **CONFIRMED**

`README.md` appears in `prd.md` in exactly **two** places (verified by exhaustive grep):

- `prd.md:390` — `README.md             # install + routes.yaml step + credits`
- `prd.md:255` (FR-J15) — *"generated themes include a 'Built with Inflozo' credit in both README.md and the theme footer by default"*

That is the entire specification: a seven-word inline comment and a credit-placement rule. No FR owns the file, no acceptance criterion tests it, no epic in §8 produces it, and it is absent from the spike (divergence #10 above).

The report's argument for why this matters is correct on the facts: Casper's and Source's READMEs describe a theme a developer will *edit by hand and understand from its source*. Inflozo's README has to describe a **generated** layout whose section-partial filenames come from the user's own layer names — a mapping that exists nowhere else and that nothing in the theme explains. FR-J16 makes this concrete: drift detection reports changed files *"named by the user's own layer names wherever a file is a section partial"* — so the layer-name→filename mapping is already user-facing product surface, surfaced by a system the README is the only durable documentation for.

**Verdict: CONFIRMED.** The report's proposed contents (file map, layer-name→filename mapping, the `partials/sections/{template}/` convention, the frozen `custom-*.hbs` contract, the hand-edit/redeploy interaction, credits) are the right list. Add two: **the `{{t}}`/`locales/` override path** (FR-Q6 — a hand-editor changing a visitor-facing string must be told to edit the locale file, not the template) and **the FR-J16 drift consequence** (hand edits stop the next deploy; that is a designed behaviour and belongs in the file the hand-editor reads first). Severity: **Medium**, unchanged.

---

### Claim 9 — `escapeHbs` misses a preceding backslash — **CONFIRMED**, and the report *understates* it

> Report: *"`escapeHbs` does not escape a preceding backslash: `String(s).replace(/\{\{/g, '\\{{')` — a user typing a literal `\{{x}}` gets `\\{{x}}`, **which Ghost renders as `\{{x}}`**. Vanishingly rare; noted because FR-J1 states the inert-emission rule absolutely."*

The helper, `spike-compiler/compile.js:41`:
```js
const escapeHbs = (s) => String(s).replace(/\{\{/g, '\\{{');
```
Reached from `applyProps` (`compile.js:89, 95`) on every `data-prop` text node and every `data-prop-attr` attribute in the theme renderer.

**Runnable proof**, against real Handlebars 4.7.9 (`esc-test.js`, output verbatim):

```
{"userTyped":"{{x}}",     "emittedHbs":"\\{{x}}",     "ghostRenders":"{{x}}",     "inert":true}
{"userTyped":"\\{{x}}",   "emittedHbs":"\\\\{{x}}",   "ghostRenders":"\\VALUE",   "inert":false}
{"userTyped":"{{{x}}}",   "emittedHbs":"\\{{{x}}}",   "ghostRenders":"{{{x}}}",   "inert":true}
{"userTyped":"\\\\{{x}}", "emittedHbs":"\\\\\\{{x}}", "ghostRenders":"\\\\VALUE", "inert":false}
{"userTyped":"a {{x}} b", "emittedHbs":"a \\{{x}} b", "ghostRenders":"a {{x}} b", "inert":true}
```
*(JSON-escaped: `\\` is one literal backslash. `x` was bound to `VALUE`.)*

```js
// esc-test.js
const Handlebars = require('handlebars');
const escapeHbs = (s) => String(s).replace(/\{\{/g, '\\{{');
const ctx = { x: 'VALUE' };
for (const raw of ['{{x}}', '\\{{x}}', '{{{x}}}', '\\\\{{x}}', 'a {{x}} b']) {
  const emitted = escapeHbs(raw);
  const rendered = Handlebars.compile(emitted)(ctx);
  console.log(JSON.stringify({ userTyped: raw, emittedHbs: emitted, ghostRenders: rendered, inert: rendered === raw }));
}
```

**The defect is CONFIRMED. The report's description of the consequence is wrong, and wrong in the safe direction.**

Handlebars treats `\\{{x}}` as an *escaped escape*: it emits one literal backslash and then **evaluates** `{{x}}`. So:

- Report says: user types `\{{x}}` → renders `\{{x}}`. That would be a cosmetic backslash artefact.
- Reality: user types `\{{x}}` → renders `\` **+ the evaluated value of `x`**.

FR-J1's guarantee is *"any Handlebars syntax a user types into a text prop … is escaped so it renders as literal characters and **is never interpreted by Ghost**"* (`prd.md:233`). A single backslash typed ahead of a mustache **defeats that guarantee outright**: the expression is interpreted, with the post/page/site context available to it. The severity floor is a broken WYSIWYG promise (canvas shows `\{{title}}`, deployed site shows `\My Post Title`); the ceiling is worse, because `escapeHbs` is also the only barrier on **attribute values** (`compile.js:95`), where `data-prop-attr` writes user text into `href`/`src`.

Two further gaps the report does not reach, found in the same pass:

1. **Block helpers are not neutralized.** `\{{#each x}}` escapes the opener, but the emitted text still contains `{{/each}}` unescaped — which is a Handlebars **parse error**, not inert output. A user typing a block helper into a heading produces a theme that fails to compile in Ghost rather than a theme that renders the text. `escapeHbs` should be tested against `{{#`, `{{/`, `{{^` and `{{!`, not only `{{`.
2. **Frequency is not "vanishingly rare" in this product.** Inflozo's audience is Ghost site owners. `\{{` is *precisely* the string a Ghost-literate user types when they want to show a Handlebars example on their own site — a tutorial post, a docs page, a theme-development blog. This is the population most likely to type it and the one whose sites break.

**Fix (one line, and it is the root-cause fix — every caller routes through `applyProps`):**
```js
const escapeHbs = (s) => String(s).replace(/(\\*)(\{\{)/g, (_, bs, br) => bs + bs + '\\' + br);
```
Double any run of backslashes preceding a `{{`, then escape the brace. Leave one runnable assertion behind covering the five cases above plus `{{#each}}`/`{{/each}}`.

**Verdict: CONFIRMED.** Raise from **Low** to at least **Medium**: FR-J1 states the rule absolutely, and the helper does not deliver it. Correct the finding's stated consequence — "which Ghost renders as `\{{x}}`" must become "which Ghost renders as a backslash followed by the **evaluated** expression."

---

### Claim 10 — `package.json` key order — **CONFIRMED as convention; nothing enforces it**

> Report: *"`package.json` key order is whatever the object literal in `build.js` happened to be (`name, description, version, engines, license, keywords, author, config`). Casper and Source use a conventional order. Invisible to gscan, visible to anyone who opens the file."*

**Spike order** (`build.js:23-28`, faithfully reproduced in the emitted file): `name, description, version, engines, license, keywords, author, config`.

**Casper and Source order — identical to each other:** `name, description, demo, version, engines, license, [screenshots], scripts, packageManager, author, gpm, keywords, repository, bugs, contributors, devDependencies, browserslist, config`.

So both halves are true: the spike's order is an accident of an object literal, and the two reference themes agree with each other on a different order (notably `author` **before** `keywords`, which the spike inverts).

**Does anything care? Verified: no.**
- gscan 6.4.2 parses `package.json` with `JSON.parse` and reads keys by name (`lib/checks/010-package-json.js`); order is unreachable to it.
- JSON object key order is not semantic; npm, Ghost's theme loader and Ghost's `custom` settings reader are all order-independent.
- The **only** consumer that could care is a human diff, and specifically **NFR-6(c1)**, which commits compiled output and diffs it per-commit. A stable order is a prerequisite for a clean diff — but `JSON.stringify` over a literal is already deterministic, so the spike satisfies stability today. Order only becomes a defect if the compiler ever builds the object conditionally (which FR-J2 requires: `custom` is present only for Light+Dark projects or when FR-Q2 settings exist).

**Verdict: CONFIRMED, and explicitly a matter of convention, not correctness.** "Casper does X" is not "X is required" and this is the clearest case of it in the set. The real requirement hiding underneath is **determinism**, which NFR-6(c1) already needs: FR-J2 should state that `package.json` is emitted in a **fixed key order with conditional keys omitted rather than reordered**, and the order should match Casper/Source for the keys they share. Severity: **Low**, unchanged; reframe from "aesthetics" to "diff stability under FR-J2's conditional keys."

---

### Claim 12 — missing `home.hbs` — **CONFIRMED**

> Report: *"Ghost supports it and Source uses it — a designed homepage with its own composition while `index.hbs` stays the paginated index. §7.4's set has none, so a designed marketing homepage lives on `index.hbs` and inherits `/page/2/`, `/page/3/`. FR-H2 handles it well … a correct workaround for a problem `home.hbs` does not have."*

All four sub-claims verified:

1. **Ghost supports it** — `home.hbs` is a first-class known template in gscan's v1 spec (`lib/specs/v1.js:49-53`), pattern `/^home\.hbs$/`, `version: '>=0.5.0'`. Supported since Ghost 0.5.0.
2. **Source uses it** — [`source/home.hbs`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/home.hbs) exists and is a genuinely different composition from `index.hbs`: header component, featured posts, CTA, then the post-list partial. `index.hbs` is four lines and only the post-list. Casper has none.
3. **What it changes** — Ghost's index context is served on both `/` and `/page/:num/`; if `home.hbs` is present it renders **only the root URL**, and `/page/2/`, `/page/3/` … fall through to `index.hbs`. So `home.hbs` gives a designed homepage that **structurally cannot be paginated**.
4. **§7.4 has none** — confirmed; `prd.md:373` lists `index.hbs post.hbs page.hbs tag.hbs author.hbs error.hbs` and `home.hbs` appears nowhere in the PRD.

The consequence chain is exactly as described. FR-H2 (`prd.md:206`) permits *"A paginated template with **zero** feed sections … (e.g. a feed-less marketing homepage)"* and pays for it with three mechanisms — a pre-deploy warning, a compiler-emitted `noindex` beyond page 1, and a canonical link to page 1. All three exist to suppress duplicate `/page/N/` URLs that `home.hbs` would never generate.

**Verdict: CONFIRMED**, with one qualification the report already makes and which should be preserved: **the tradeoff is genuine and the current design is defensible.** Adding `home.hbs` costs a seventh template surface in FR-D6's switcher, a seventh entry in the Synthesis Defaults, and a user-facing distinction between "the homepage" and "the post index" that most users of a page-builder do not want to think about. It also does not remove FR-H2's machinery, which is still needed for feed-less *tag* and *author* archives and for custom collections.

The defect is therefore **documentation, not architecture**: the PRD never mentions the file, so a Ghost-literate reviewer reads FR-H2's guard as ignorance of a standard template rather than as a decision. Fix: one sentence in §7.4 — *"No `home.hbs` is emitted. Ghost would route `/` to it and `/page/N/` to `index.hbs`, splitting the homepage across two template surfaces; Inflozo keeps one Home canvas and handles the pagination consequence with FR-H2's zero-feed SEO guard instead."* Severity: **Low**, not Medium.

---

# PART 2 — Appendix F arithmetic

Every figure below was recomputed from the PRD's own stated inputs, without reference to the report's numbers, then compared.

**Reconciliation summary: the arithmetic mostly holds.** Of the eight claims tested, **4 FAIL and 4 PASS** — but **two of the report's four "corrections" are themselves wrong**, and both would make the PRD worse if applied. Separately, **6 new defects** were found that the report did not catch, one of which changes the headline break-even by ~35%.

## 2.1 Ledger

Legend — **PASS**: PRD figure reproduces from its stated inputs. **FAIL**: it does not. **† = report's correction is wrong.** **‡ = not caught by the report.**

### F.1 — Plan matrix

| # | PRD claim | Recomputed | Verdict | Correction |
|---|---|---|---|---|
| 1 | Library `485` variants | `sections-inventory.md:9` totals; per-category counts stated exact | **PASS** | — |
| 2 | `[Free]` variants = **70** | 34 categories × first-2 = 68, + A29 #7 + A31 #10 = **70**. Independently counted **70** `[Free]` variant lines in `sections-inventory.md` | **PASS** | — |

### F.3 — Cost basis

| # | PRD claim | Recomputed | Verdict | Correction |
|---|---|---|---|---|
| 3 | Baseline band **$110–130** | Min (Resend $0, T4 $15): 25+20+0+0+9+29+9+15 = **$107**. Max (Resend $20, T4 $18): **$130** | **FAIL** | **$107–130** — stated floor is $3 above the computed minimum |
| 4 ‡ | Baseline point estimate **≈ $120** | Midpoint of 107–130 = $118.50 → ≈$120 ✔, **but** the Resend row's own note says *"free tier covers launch send volume"*, so the launch-realistic figure is **$107**, not $120 | **FAIL ‡** | State **≈$107 at launch, ≈$120 at modelled volume**; $120 silently books a Resend cost the same row says won't be incurred |
| 5 ‡ | Report's stated maximum **"$127"** | 25+20+20+0+9+29+9+**18** = **$130**; the report reached $127 by holding T4 at $15 while flexing Resend to $20 — inconsistent with its own floor derivation | **FAIL ‡ †** | The report's max is wrong. Correct max **$130** |
| 6 | Total permanent fixed **≈$135 (band $125–145)** | $120 + $15 = $135 ✔. Band: $110–130 + $10–15 = **$120–145** | **FAIL** | **$117–145** on true line minima ($107+$10); the stated $125 floor is again above the computed minimum |
| 7 | Vercel *"priced per seat; a second project or environment on the same team adds nothing"* | Vercel Pro = $20/mo platform fee, **1 deploying seat**, **$20/mo usage credit**, 1 TB Fast Data Transfer + 10M Edge Requests included; beyond that, usage bills **against the shared credit, then on-demand**. The credit is **team-level** — Live and Test consume one pool | **FAIL** | True of *seats*, false of *usage*. §7.1 budgets compile as *"a long-running Node function, sized against a measured worst case … not against the platform default"* — the PRD's own compute posture contradicts F.3's line |
| 8 | Supabase Test increment ≈$10–15/mo | Asserted. A second Pro-org project is ~$10/mo (Micro compute); org-level **compute credit is already consumed by Live**. But the org's **100 GB storage / 250 GB egress allowances are shared**, so Test's storage displaces Live's | **FAIL** | Asserted, not computed. Structurally right (~$10–15), but the shared-quota consequence is unstated |
| 9 | NFR-6 CI volume — *"runs on CI runners already inside the Vercel/CI lane"* | **Vercel provides no general-purpose CI runners.** Vercel build minutes execute deployments; a Playwright matrix is GitHub Actions. Full estimate in §2.3 | **FAIL** | **≈$35–80/mo** — 26–59% of the entire stated permanent fixed cost, and the only line that scales with **library size** |
| 10 | *"Worst-case Pro infra ≈$0.15–0.60/user/mo → >95% infra margin"* | At F.7's scenario: total infra ≈$157/mo. Per **account** (1,200): **$0.13**. Per **Pro** (200): **$0.79**. Marginal-only per Pro: **$0.11** | **FAIL ‡** | The band matches **neither** reading. Per-Pro fully-loaded $0.79 → **93.7% margin**, not >95%. Per-account $0.13 and marginal $0.11 both sit **below** the stated $0.15 floor |

### F.4 — Net revenue per Pro customer

Schedule: 4% + 40¢; +1.5% international; +0.5% subscription. Domestic = 4.5% + $0.40. International = 6.0% + $0.40.

| # | PRD claim | Recomputed | Verdict | Correction |
|---|---|---|---|---|
| 11 | Monthly domestic **$13.93** | 15 − (0.045×15 + 0.40) = 15 − 1.075 = **$13.925** | **PASS** | — |
| 12 | Monthly international **$13.70** | 15 − (0.060×15 + 0.40) = 15 − 1.30 = **$13.70** | **PASS** | — |
| 13 | Monthly midpoint **$13.82** | (13.925 + 13.700)/2 = **$13.8125** → **$13.81** | **FAIL** | **$13.81**. *Nuance:* midpointing the **displayed** values gives (13.93+13.70)/2 = 13.815 → 13.82 half-up. The error is real but is a rounding-order artefact, ~1¢, and moves nothing |
| 14 | Yearly domestic **$142.85** | 150 − (6.75 + 0.40) = **$142.85** | **PASS** | — |
| 15 | Yearly international **$140.60** | 150 − (9.00 + 0.40) = **$140.60** | **PASS** | — |
| 16 | Yearly midpoint **$141.73** | (142.85 + 140.60)/2 = **$141.725** → $141.73 half-up | **PASS** | — |
| 17 | Yearly per month **$11.81** | 141.725 / 12 = **$11.8104** | **PASS** | — |
| 18 | Blended (60y/40m) **$12.61** | 0.6(11.8104) + 0.4(13.8125) = 7.0862 + 5.5250 = **$12.611** | **PASS** | The 1¢ from #13 **does not propagate** — blended is $12.61 either way |
| 19 | *"8.8% below the $13.82"* | (13.82 − 12.61)/13.82 = **8.75%** | **PASS** | — |
| 20 | Range **$11.81–$13.82, ±8% about midpoint** | midpoint 12.815; (13.82−12.815)/12.815 = **7.84%** | **PASS** | — |
| 21 | *"−6% / +10% against the 60/40 blend"* | (11.81−12.61)/12.61 = **−6.34%**; (13.82−12.61)/12.61 = **+9.60%** | **PASS** | — |
| 22 | *"20 points of mix ≈ 40¢"* | 0.20 × (13.8125 − 11.8104) = **$0.400** | **PASS** | — |
| 23 ‡ | The "Midpoint" column itself | A straight domestic/international midpoint assumes a **50/50 geographic split**, stated nowhere. 100% international → blended **$12.50** (−0.9%) | **FAIL ‡** | Undeclared assumption. The plan mix gets a full sensitivity paragraph; geography — an input of the same kind — gets none. One clause: *"the midpoint assumes a 50/50 domestic/international book; a fully international book nets $12.50 blended"* |

### F.5 — Break-even

| # | PRD claim | Recomputed | Verdict | Correction |
|---|---|---|---|---|
| 24 | Baseline: **$120 ÷ $12.61 = 9.5 → 9–10** | 120/12.61 = **9.516** | **PASS** (arithmetic) | — |
| 25 | Baseline band **8.7–10.3** | 110/12.61 = 8.723; 130/12.61 = 10.309 | **PASS** (arithmetic) | On the **corrected** $107 floor: **8.5–10.3** |
| 26 | Total: **$135 ÷ $12.61 = 10.7 → ≈11** | 135/12.61 = **10.706** | **PASS** | — |
| 27 | Total band **9.9–11.5** | 125/12.61 = 9.913; 145/12.61 = 11.499 | **PASS** (arithmetic) | On the corrected $117 floor: **9.3–11.5** |
| 28 | **G7 headline = 9–10** (baseline, Test excluded) | §4: Test is permanent *"from the first customer onward."* Break-even requires ≥1 customer. The 9–10 state cannot exist | **FAIL** (framing) | Report's fix is right: **"≈11 on total permanent fixed (9–10 on the baseline before Test)"** |
| 29 ‡ | **G7 headline, with CI costed** | ($135 + $50 CI) / $12.61 = **14.7** | **FAIL ‡** | **≈15 Pro subscribers.** Costing CI moves the headline **~35%**, four times the size of every other F.5 correction combined |

### F.6 — Churn and blended LTV

| # | PRD claim | Recomputed | Verdict | Correction |
|---|---|---|---|---|
| 30 † | Monthly tenure **19.75 months** | Month 1 paid; 75% enter a geometric phase at month 2 with p=0.04. A Geometric r.v. on support {1,2,…} has E[N] = 1/p = **25 months in the phase**, and those are months **beyond** month 1. Total = 1 + 0.75(25) = **19.75** | **PASS** | **The report's "19.0" is WRONG — see §2.2** |
| 31 | Monthly LTV **≈$273** | 19.75 × 13.82 = **$272.95** | **PASS** | — |
| 32 | Yearly renewal **0.96¹² = 61.3%** | e^(12·ln 0.96) = **0.61271** | **PASS** | — |
| 33 | Yearly **2.94 terms** | 1 + 0.75 × 1/(1−0.61271) = 1 + 0.75(2.5825) = **2.9369** | **PASS** | Uses the **identical** `1 + 0.75 × (1/p)` convention as row 30 |
| 34 | **≈35.2 months** | 2.9369 × 12 = **35.24** | **PASS** | — |
| 35 | Yearly LTV **≈$416** | 2.9369 × 141.725 = **$416.2** | **PASS** | — |
| 36 | Blended LTV **≈$359** | 0.4(272.95) + 0.6(416.2) = 109.18 + 249.72 = **$358.90** | **PASS** | — |
| 37 | *"yearly LTV 1.5× monthly"* | 416.2 / 272.95 = **1.525** | **PASS** | — |
| 38 | *"6% steady-state → roughly $280"* | Monthly: 1+0.75(1/0.06)=13.5 mo × 13.82 = $186.57. Yearly: 0.94¹²=0.4759; 1+0.75(1/0.5241)=2.4312 terms × 141.725 = $344.56. Blended: 0.4(186.57)+0.6(344.56) = **$281.36** | **PASS** | Third independent confirmation of the convention in row 30 |

### F.7 — Capacity headroom

| # | PRD claim | Recomputed | Verdict | Correction |
|---|---|---|---|---|
| 39 | *"200 of 1,200 = 16.7% paid share … >5× the 3% goal"* | 200/1200 = **16.67%**; 16.67/3 = **5.56×** | **PASS** | — |
| 40 | *"comfortably inside Supabase Pro's included storage"* | Quota exposure: 200×5 GB + 1,000×0.1 GB = 1,000 + 100 = **1,100 GB**. Included: **100 GB**. Ratio **11.0×** | **FAIL** | Retire the phrase. **11×**, not "~10×" |
| 41 † | Report's implied conclusion that the cost claim collapses | Overage = (1,100−100) × $0.021 = **$21.00/mo**. Total ≈ $135 + $21 = **$156** — *inside* the stated $140–190 band | **PASS** | **The dollar claim survives; only the words fail.** The report does not distinguish these and a reader would over-correct |
| 42 ‡ | Deploy artifacts + snapshots (excluded from user quota → Inflozo pays) | Artifacts: 200×25×10 + 1,000×1×3 = **53,000**; at 0.5–2 MB = 26–106 GB. Snapshots: 200×10 + 1,000 = **3,000**; at ~3 MB ≈ 9 GB. Overage **$0.7–2.4/mo** | **FAIL ‡** | Small in dollars, but **entirely unmodeled** and it is Inflozo-borne by design (FR-J7, FR-J13) |
| 43 ‡ | Egress at the scenario | 250 GB + 250 GB cached included, then $0.09 / $0.03 per GB. **Not computed anywhere in F.7** | **FAIL ‡** | Editor asset traffic for 1,200 accounts is unmodeled; unlike storage it has no stated quota exposure to bound it |
| 44 | *"1,000 Free implies ≈31 Pro"* — a **rate** used as a **ratio** | G9 = *"≥3% free→Pro **within 90 days of signup**"* — a cohort conversion rate. Steady-state Pro stock = (0.03 × monthly signups) / 0.04 churn = **0.75 × monthly signups**, while the Free stock accumulates every non-converting signup that never churns. The steady-state Pro **share** is materially lower and is **not defined at all** without a Free-churn assumption the PRD never states | **FAIL** | Report is right on direction and mechanism. $391/mo is optimistic. **Additionally ‡: the ratio is not merely optimistic, it is undefined** — with no Free churn the denominator grows without bound and the share → 0 |
| 45 | *"≈31 Pro ≈$391/mo"* | 31 × 12.61 = **$390.91** | **PASS** (arithmetic) | — |
| 46 | *"~2.9× the floor"* | 390.91/135 = **2.90** | **PASS** | — |
| 47 | *"200 Pro × $12.61 = ≈$2,522"* | **$2,522.00** | **PASS** | — |
| 48 ‡ | *"(not the ≈$2,700 a monthly-only model produced)"* | 200 × 13.82 = **$2,764** | **FAIL ‡** | **$2,764**. Trivial, but it understates the very contrast the parenthesis exists to draw |

**Totals: 30 PASS · 18 FAIL.** Of the 18 FAILs, **8 were not caught by the report** (‡) and **2 of the report's own corrections are wrong** (†).

---

## 2.2 The report is wrong twice — do not apply these

### † F.6's monthly tenure — the report's "19.0" is WRONG. **Keep 19.75.**

> Report: *"On the stated model `1/p = 25` is the expected total months from the start of the geometric phase, so *further* months is 24, giving `1 + 0.75 × 24 = 19.0` — a ~4% LTV overstatement."*

The PRD's model is: **month 1 is paid; 25% churn; the surviving 75% enter a 4%/mo geometric phase at month 2.** A geometric random variable on support {1, 2, 3, …} with churn probability p has E[N] = 1/p = **25**. Those 25 months are months 2 through 26 — they are months *in addition to* month 1. Therefore:

> total = 1 + 0.75 × 25 = **19.75** ✔

The report's 19.0 requires reading "the geometric phase" as beginning at **month 1**, which contradicts the PRD's own sentence (*"1 month paid, **then** … 25 **further** months"*) and would double-subtract month 1.

**Three independent checks confirm 19.75 and refute 19.0:**

1. **Internal consistency with the yearly cohort.** F.6's yearly row uses the *same* structure: `1 + 0.75 × 1/(1−0.613) = 1 + 0.75(2.5825) = 2.937` terms, and the PRD states **2.94**. It reproduces exactly. Applying the report's correction to the monthly row alone would make the two rows of one table use **different conventions**.
2. **The sensitivity figure reproduces only under 19.75's convention.** F.6 states *"A 6% steady-state cuts blended LTV to roughly $280."* Under `1 + 0.75 × (1/p)`: **$281.36** ✔. Under the report's `1 + 0.75 × (1/p − 1)`: 1+0.75(15.667)=12.75 mo → $176.21 monthly, and 1+0.75(0.9080)=1.681 terms → $238.24 yearly, blended **$213** ✘ — 24% away from the PRD's stated $280.
3. **The stated interpretation reproduces.** F.6 says the 4% assumption *"implies a 25-month average life for a monthly subscriber."* 1/0.04 = 25, phase-only. Consistent.

**Verdict: REFUTED. F.6's tenure model is internally consistent and arithmetically correct throughout.** Delete this finding. Applying it would break the only table in Appendix F that reconciles end to end, and would leave the yearly row silently disagreeing with the monthly one.

### † F.3's maximum — the report says $127; it is $130.

Under the report's own floor derivation (Resend at its minimum $0, T4 at $15), the maximum must flex the same two rows to their maxima: Resend $20 **and T4 $18** → **$130**. The report flexed Resend and held T4, producing $127. If $127 were right, the PRD's stated ceiling of $130 would *also* be a defect — which the report does not claim. Use **$107–130**.

### † F.7's "~10×" — right that the claim fails, wrong to imply the cost claim fails with it.

The storage ratio is **11×** (1,100 GB against 100 GB included) and *"comfortably inside Supabase Pro's included storage"* must be retired. But the overage is priced at **$0.021/GB**, so the cash consequence is **$21/mo**, and F.7's *"≈$140–190/mo of infrastructure"* still brackets the corrected $156. Correct the sentence; do not correct the band. A reader applying "wrong by 10×" to the dollar figure would restate infrastructure at $1,400–1,900/mo, which is wrong by roughly 10× in the other direction.

---

## 2.3 CI volume — costed

F.3 disposes of NFR-6 in one clause: *"the render matrix runs on CI runners already inside the Vercel/CI lane."* Two things are wrong with it.

**First, the substrate does not exist.** Vercel provides **build** minutes that execute deployments. It does not provide general-purpose CI runners, and a pinned-Chromium Playwright matrix with per-render axe scans is not a Vercel build. This is GitHub Actions.

**Second, §4 already contradicts F.3.** §4 closes its NFR-6 paragraph with *"**Budget the CI lane accordingly.**"* — an explicit instruction to Appendix F, which Appendix F then declines by asserting the cost away.

**Estimate.** Inputs from NFR-6(a): 485 variants × 3 Style Packs × 2 modes × 3 viewports = **8,730 renders/run** (verified: 485 × 18 = 8,730), each a navigate + settle + screenshot + axe-core scan + pixel diff. Rates from GitHub's billing documentation (fetched 2026-08-18): standard Linux 2-core **$0.006/min**; included **2,000** min (Free) / **3,000** (Team) / **50,000** (Enterprise); larger runners always billed.

| Lane | Volume | Est. billed min/run | $/run | Cadence | $/mo |
|---|---|---|---|---|---|
| **(a) Render matrix + axe** | 8,730 renders @ 0.8–2.5 s = 116–364 CPU-min | 110–250 | $0.66–1.50 | nightly (**cadence unstated — see below**) | **$20–45** |
| **(b) Compile CI** | 100% of variants → synthetic themes → gscan | 5–15 | $0.03–0.09 | nightly | **$1–3** |
| **(c1) `.hbs` snapshots** | 485 variants compiled + diffed | 4–8 | $0.02–0.05 | per-commit (~200/mo) | **$5–10** |
| **(c2) Shim contract tests** | recorded-output assertions, offline | 2–4 | $0.01–0.02 | per-commit | **$2–5** |
| **(c3) Perceptual diff vs real Ghost** | serialized per target (T1–T3), real deploys | 20–60 | $0.12–0.36 | nightly | **$4–11** |
| **(d) E2E** | 30 serialized deploys + full journey suite | 60–120 | $0.36–0.72 | weekly–per-release | **$2–4** |
| **Baseline storage** | 8,730 PNGs ≈ 1.3–2.6 GB in Git LFS; mass rebaseline rewrites the whole set | — | — | — | **$5–10** |
| | | | | **Total** | **≈$39–88/mo** |

**Call it $35–80/mo.** Three consequences, none of which Appendix F carries:

1. **It is 26–59% of the entire stated $135/mo permanent fixed cost** — the second-largest line in the model, and it is the one line currently valued at zero.
2. **The included allowance does not cover it.** Lane (a) alone is 3,300–7,500 billed min/mo at nightly cadence, against **3,000** included on GitHub Team. Every other lane is billed from minute one.
3. **It is the only cost that scales with library size, not customers.** Every line in F.3 is flat in the library; CI is linear in it — and §4 declares the 485-variant inventory **non-de-scopeable** (*"if library waves slip, launch slips"*). A library that grows post-GA on FR-J14's *"monthly drops"* cadence grows this line every month, forever, with no offsetting revenue mechanism.

**And the cadence is unstated.** The report's separate Medium finding — NFR-6(a) has no stated cadence while (b), (c1), (c2), (c3) all do — is confirmed and is *the* input this estimate is most sensitive to. Per-commit instead of nightly multiplies lane (a) by ~7×, to **$140–315/mo** — more than the entire rest of the model combined. F.3 cannot be corrected until NFR-6(a)'s cadence is fixed.

**Fix:** add a line to F.3's table — `CI (GitHub Actions + baseline storage) | ≈$35–80 | scales with library size, not customers; NFR-6(a) cadence-dependent` — recompute the total to **≈$170–215/mo**, and restate G7's break-even at **≈15 Pro subscribers**.

---

## 2.4 The structure is wrong, not just the arithmetic

Every ledger row above is a rounding, a band edge or a missing line item. This section is the finding that matters more than all of them, and no review has raised it.

### Appendix F is a hosting-cost model presented as a unit-economics model.

The plan changed during review. The library is now **fully designed before build** — 485 designs, **~1,500–2,000 design frames** — behind **34 sequential owner-approval gates**, with a permanent self-hosted test server, and **quality explicitly outranking schedule** (§4: *"the full FR scope and the 485-variant inventory are not de-scopeable; if library waves slip, launch slips"*).

**The dominant cost of this product is authorship. Appendix F contains no authorship line.**

Verified by exhaustive search of `prd.md`: zero occurrences of *authorship cost*, *design cost*, *labour*, *founder time*, *owner's time* or *opportunity cost* in any costing sense. F.3's table is eight infrastructure rows. F.6 states LTV *"gross of acquisition cost — no paid-acquisition line exists in this model"* — the one cost the appendix explicitly declares absent is the one that is genuinely near-zero here, while the one that dominates is not mentioned at all.

**Order of magnitude.** At even a nominal **$25 per design frame** — a low rate for original, gated, dark-mode-paired section design — 1,500–2,000 frames is **$37,500–50,000** of one-time authorship. That is **278–370 months** of the entire $135/mo permanent fixed cost. Every figure in F.3–F.5 is a rounding error against it.

**What this does to G7.** Break-even at 11 (or the corrected 15) Pro subscribers is the point at which **the servers** are paid for. It is not the point at which the product is paid for. Amortising authorship over 24 months at $12.61 net:

> ($50,000 / 24 + $185) / $12.61 = ($2,083 + $185) / $12.61 = **≈180 Pro subscribers**

**An order of magnitude above the stated figure.** G7 as written answers a question nobody asked and reads as the answer to the question everyone will.

### Four structural consequences

1. **The fixed cost runs for an unbounded pre-revenue period.** §4 mandates a single GA release, no de-scope, and 34 sequential approval gates, with quality outranking schedule — so the pre-launch duration is deliberately unbounded. F.3 models the $135/mo (corrected: $170–215/mo) as a *steady-state* cost against revenue that does not exist yet. At 12 months to GA that is **$2,000–2,600 of pre-revenue burn**, requiring ~13–17 subscriber-months to repay before the model's own break-even clock starts. Appendix F has no time axis.

2. **CI is a fixed cost mislabelled as a variable one.** F.3's *"Variable cost is negligible by design"* paragraph is where CI is dismissed. But CI scales with **library size**, which is fixed at 485 and growing monthly by commitment (FR-J14). It belongs in the fixed table, above the line, not in the variable paragraph that waves it away.

3. **The permanent Test environment is a schedule cost, not only a dollar cost.** F.3 prices Test at +$15/mo and stops. §4 also makes Test the *only* environment where post-launch testing runs — so Live has **no Ghost deploy target at all** after cutover, and every deploy-path regression must be caught on Test or in production by a customer. That is a risk line, and it is unpriced.

4. **The revenue side is built on four founder estimates and the cost side on one omission.** F.7 correctly labels churn, plan mix and paid share as *"founder estimates carrying no external source."* It applies no such label to the cost basis — which is the side that is actually incomplete.

### Recommended restructure

Appendix F should carry **three** sections where it now carries one:

| | Now | Should be |
|---|---|---|
| **F.3a Build cost (one-time)** | absent | 1,500–2,000 design frames, 485 variants, 34 gates — with a stated rate or an explicit "owner's own time, not cash-costed, and here is the frame count it represents" |
| **F.3b Run cost (recurring)** | the current F.3, minus CI | infrastructure, **plus a CI row at $35–80/mo**, total ≈$170–215/mo |
| **F.5 Break-even** | one number: servers | **two** numbers: *cash break-even* (run cost only, ≈15 Pro) and *payback* (run + amortised build, ≈180 Pro over 24 months) |

State plainly, once, in F.3's preamble: **"The dominant cost of this product is authorship, not infrastructure. This appendix prices the infrastructure. It does not price the library, and G7's break-even is a server-cost break-even, not a payback figure."** One paragraph converts the appendix from misleading to honest, and honest is what the rest of this document already is.

---

## Appendix — reproduction

```bash
SP=/tmp/claude-1000/-home-ghost-Dev-Inflozo/800a5718-073e-49bd-a03f-48dd7acea8ed/scratchpad
git clone --depth 1 https://github.com/TryGhost/Casper.git $SP/casper   # b66cfc7
git clone --depth 1 https://github.com/TryGhost/Source.git $SP/source   # ff0ead2
cd $SP && npm install gscan handlebars                                  # gscan 6.4.2, handlebars 4.7.9

cp -r <workspace>/spike-compiler/theme-output $SP/spike-theme
node $SP/gscan-spike.js   # => v5: 0/0   v6: 0/0
node $SP/esc-test.js      # => \{{x}} renders as "\VALUE" — inert:false
```

**Primary sources**

- [Casper `default.hbs`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/default.hbs) · [`post.hbs`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/post.hbs) · [`partials/post-card.hbs`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/partials/post-card.hbs) · [`package.json`](https://github.com/TryGhost/Casper/blob/b66cfc7ce8b8b50a8585620133815e562c9d5690/package.json)
- [Source `default.hbs`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/default.hbs) · [`home.hbs`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/home.hbs) · [`index.hbs`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/index.hbs) · [`partials/post-card.hbs`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/partials/post-card.hbs) · [`partials/components/post-list.hbs`](https://github.com/TryGhost/Source/blob/ff0ead2028c228083e18c219b4fdc1e4656fb986/partials/components/post-list.hbs)
- gscan 6.4.2: `lib/specs/v1.js:49-53` (Home template) · `lib/specs/v6.js:51-57` (AMP) · `lib/checks/010-package-json.js:128-139` (`engines`)
- Ghost: `core/frontend/helpers/post_class.js` · [Ghost 6.0 breaking changes](https://github.com/TryGhost/Ghost/issues/23924) · [Modifying robots.txt](https://ghost.org/help/modifying-robots-txt/) · [Index context](https://docs.ghost.org/themes/contexts/index-context)
- [Vercel Pro plan](https://vercel.com/docs/plans/pro) · [GitHub Actions billing](https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions)
