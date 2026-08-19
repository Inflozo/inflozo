---
title: "Ghost Koenig Cards — Card Set, Card Assets, and the Override Strategy for Inflozo's Card Designer"
status: normative-companion
role: Research companion to the Inflozo PRD. Establishes, from Ghost/Koenig/gscan source, what every Koenig card emits, how Ghost's card CSS/JS is loaded and configured, and the recommended mechanism for a visual per-card design module.
created: 2026-08-18
---

# Ghost Koenig Cards — Card Set, Card Assets, and the Override Strategy

## 0. Sources and versions

Every claim below is read from source at these exact revisions, cloned and inspected locally on 2026-08-18.

| Repo | URL | Commit | Version |
|---|---|---|---|
| Ghost | https://github.com/TryGhost/Ghost | `fe7771d1ebd84df74ad99bb8eed2cfe842022769` (2026-08-18) | `ghost/core` 6.58.0-rc.0 |
| Koenig | https://github.com/TryGhost/Koenig | `4da831801b9ca065e4b30abe96c8b33227133e6c` (2026-07-13) | monorepo |
| Casper | https://github.com/TryGhost/Casper | `b66cfc7ce8b8b50a8585620133815e562c9d5690` (2026-08-17) | 5.12.1 |
| Source | https://github.com/TryGhost/Source | `ff0ead2028c228083e18c219b4fdc1e4656fb986` (2026-08-17) | 1.7.1 |
| gscan | https://github.com/TryGhost/gscan | `93c2c022e67d8b8e6d5f776050efaedd68d67b81` (2026-08-17) | 6.4.2 |

Docs consulted: <https://docs.ghost.org/themes/content/>, <https://docs.ghost.org/themes/custom-settings>.

**Headline correction up front:** the Ghost developer docs list 13 card-asset names. Ghost 6.58 actually ships **17** CSS chunks and **4** JS chunks. The docs are stale; the file listing in `ghost/core/core/frontend/src/cards/` is the authority (§2.3).

---

## 1. The complete Koenig card set in Ghost 6.x

### 1.1 Where the DOM comes from

Card HTML is produced by renderer functions in the Koenig monorepo, one directory per node:
`Koenig/packages/kg-default-nodes/src/nodes/<card>/<card>-renderer.ts`.

The registered node list is `Koenig/packages/kg-default-nodes/src/kg-default-nodes.ts` (`DEFAULT_NODES`, lines 95–127). Note that `kg-default-cards` (the old **mobiledoc** card set) still exists in the monorepo for legacy posts — it is the only place `before-after` survives, and it has no NFT card. Both `nft` and `before-after` are therefore **legacy**: Ghost still ships CSS for `nft` and gscan still lints for both, but neither is creatable in the current editor.

There is **no table card**. Tables reach the frontend only via the Markdown card or the HTML card, as bare `<table>`. Source theme handles this explicitly with `:is(.kg-card, table)` selectors.

### 1.2 Per-card reference table

`kg-card` is on nearly every card root. `Designable` means "there is a stable class you can target"; `Needs Ghost JS` means the card is functionally degraded without `cards.min.js`.

| Card (editor label) | Renderer | Root element + classes | Meaningful inner classes | Editor-exposed variants (class-affecting) | Ghost CSS chunk (rules/classes) | Needs Ghost JS |
|---|---|---|---|---|---|---|
| **Image** | `image/image-renderer.ts` | `figure.kg-card.kg-image-card[.kg-width-wide|.kg-width-full][.kg-card-hascaption]` | `img.kg-image`, `figcaption`, optional wrapping `a` | width `regular\|wide\|full`; caption; link href; alt/title | *(none — image has no CSS chunk; theme owns it entirely)* | no |
| **Gallery** | `gallery/gallery-renderer.ts` | `figure.kg-card.kg-gallery-card.kg-width-wide[.kg-card-hascaption]` | `.kg-gallery-container` > `.kg-gallery-row` (max 3/row) > `.kg-gallery-image` > `img`; `figcaption` | caption only — **width is hard-coded to `kg-width-wide`** | `gallery` (10 rules, 6 classes) | **yes** (row proportions) |
| **Bookmark** | `bookmark/bookmark-renderer.ts` | `figure.kg-card.kg-bookmark-card[.kg-card-hascaption]` | `a.kg-bookmark-container` > `.kg-bookmark-content` > `.kg-bookmark-title`, `.kg-bookmark-description`, `.kg-bookmark-metadata` > `img.kg-bookmark-icon`, `span.kg-bookmark-author`, `span.kg-bookmark-publisher`; sibling `.kg-bookmark-thumbnail` > `img`; `figcaption` | **caption only — no size/layout options** | `bookmark` (16 rules, 10 classes) | no |
| **Audio** | `audio/audio-renderer.ts` | `div.kg-card.kg-audio-card` | `img.kg-audio-thumbnail[.kg-audio-hide]`, `div.kg-audio-thumbnail.placeholder`, `.kg-audio-player-container` > `audio`, `.kg-audio-title`, `.kg-audio-player` > `button.kg-audio-play-icon`, `button.kg-audio-pause-icon.kg-audio-hide`, `span.kg-audio-current-time`, `.kg-audio-time` > `span.kg-audio-duration`, `input.kg-audio-seek-slider`, `button.kg-audio-playback-rate`, `button.kg-audio-unmute-icon`, `button.kg-audio-mute-icon.kg-audio-hide`, `input.kg-audio-volume-slider` | thumbnail present/absent (drives `.placeholder` / `.kg-audio-hide`), title, src | `audio` (48 rules, 16 classes) | **yes** (player is dead) |
| **Video** | `video/video-renderer.ts` | `figure.kg-card.kg-video-card[.kg-width-wide|.kg-width-full][.kg-card-hascaption]` | `.kg-video-container` > `video`, `.kg-video-overlay` > `button.kg-video-large-play-icon`, `.kg-video-player-container[.kg-video-hide]` > `.kg-video-player` > same control set as audio with `kg-video-*` names; `figcaption` | width `regular\|wide\|full`; loop (adds `kg-video-hide` to controls + `loop autoplay muted`); custom thumbnail; caption | `video` (50 rules, 18 classes) | **yes** (player is dead) |
| **File** | `file/file-renderer.ts` | `div.kg-card.kg-file-card` | `a.kg-file-card-container` > `.kg-file-card-contents` > `.kg-file-card-title`, `.kg-file-card-caption`, `.kg-file-card-metadata` > `.kg-file-card-filename`, `.kg-file-card-filesize`; `.kg-file-card-icon` > inline `svg` | title, caption, filename, filesize — **no size options in the current editor** (`.kg-file-card-medium` / `.kg-file-card-small` exist in Ghost's CSS but are never emitted by this renderer — dead classes) | `file` (22 rules, 11 classes) | no |
| **Toggle** | `toggle/toggle-renderer.ts` | `div.kg-card.kg-toggle-card[data-kg-toggle-state="close"]` | `.kg-toggle-heading` > `h4.kg-toggle-heading-text`, `button.kg-toggle-card-icon` > `svg`; `.kg-toggle-content` | none — heading + content only | `toggle` (14 rules, 5 classes) | **yes** (`data-kg-toggle-state` never flips) |
| **Callout** | `callout/callout-renderer.ts` | `div.kg-card.kg-callout-card.kg-callout-card-{color}` | `.kg-callout-emoji` (optional), `.kg-callout-text` | **9 colours**: `white grey blue green yellow red pink purple accent` (`CalloutCard.tsx` `CALLOUT_COLORS`); emoji on/off | `callout` (15 rules, 12 classes) | no |
| **Button** | `button/button-renderer.ts` | `div.kg-card.kg-button-card.kg-align-{left|center}` | `a.kg-btn.kg-btn-accent` | alignment `left\|center` | `button` (6 rules, 4 classes) | no |
| **Product** | `product/product-renderer.ts` | `div.kg-card.kg-product-card` | `.kg-product-card-container` > `img.kg-product-card-image`, `.kg-product-card-title-container` > `h4.kg-product-card-title`, `.kg-product-card-rating` > 5× `span.kg-product-card-rating-star[.kg-product-card-rating-active]`, `.kg-product-card-description`, `a.kg-product-card-button.kg-product-card-btn-accent` > `span` | rating on/off + 0–5 stars; button on/off; image on/off | `product` (20 rules, 11 classes) | no |
| **Header (v2, current)** | `header/renderers/v2/header-renderer.ts` | `div.kg-card.kg-header-card.kg-v2[.kg-width-wide|.kg-width-full][.kg-layout-split.kg-width-full][.kg-swapped][.kg-content-wide][.kg-style-accent]` + inline `background-color`, `data-background-color` | `picture > img.kg-header-card-image`, `.kg-header-card-content` > `.kg-header-card-text[.kg-align-center]` > `h2.kg-header-card-heading`, `p.kg-header-card-subheading`, `a.kg-header-card-button[.kg-style-accent]` | layout `regular\|wide\|full\|split`; swapped; alignment; background colour (**inline style**); text colour (**inline style**); button colour/text colour (**inline style**) | `header_v2` (47 rules, 16 classes) | no |
| **Header (v1, legacy)** | `header/renderers/v1/header-renderer.ts` | `div.kg-card.kg-header-card.kg-width-full.kg-size-{small\|medium\|large}.kg-style-{dark\|light\|accent\|image}` | `h2.kg-header-card-header`, `h3.kg-header-card-subheader`, `a.kg-header-card-button` | size, style — legacy content only | `header` (42 rules, 11 classes) | no |
| **Signup** | `signup/signup-renderer.ts` | `div.kg-card.kg-signup-card[.kg-width-wide|.kg-width-full][.kg-layout-split.kg-width-full][.kg-swapped][.kg-content-wide][.kg-style-accent][data-lexical-signup-form]` + inline `background-color` | `picture > img.kg-signup-card-image`, `.kg-signup-card-content` > `.kg-signup-card-text[.kg-align-center]` > `h2.kg-signup-card-heading`, `p.kg-signup-card-subheading`, `form.kg-signup-card-form` > `.kg-signup-card-fields` > `input.kg-signup-card-input`, `button.kg-signup-card-button[.kg-style-accent]` > `span.kg-signup-card-button-default`, `span.kg-signup-card-button-loading`; `.kg-signup-card-success`, `.kg-signup-card-error`, `p.kg-signup-card-disclaimer` | layout `regular\|wide\|full\|split`; swapped; alignment; background/text/button colours (**inline styles**); background size `cover\|contain` | `signup` (66 rules, 23 classes) | no (needs `members.js`, always loaded) |
| **Call to action** | `call-to-action/calltoaction-renderer.ts` | `div.kg-card.kg-cta-card.kg-cta-bg-{colour}.kg-cta-{minimal\|immersive}[.kg-cta-no-dividers][.kg-cta-has-img][.kg-cta-link-accent][.kg-cta-centered][data-layout]` | `.kg-cta-sponsor-label-wrapper` > `.kg-cta-sponsor-label`; `.kg-cta-content` > `.kg-cta-image-container` > `img`, `.kg-cta-content-inner` > `.kg-cta-text`, `a.kg-cta-button[.kg-style-accent]` | layout `minimal\|immersive`; background `white grey blue green yellow red pink purple none`; dividers on/off; sponsor label; image; link colour accent; centered | `cta` (54 rules, 24 classes) | no |
| **Transistor** (podcast) | `transistor/transistor-renderer.ts` | `figure.kg-card.kg-transistor-card` | `iframe[data-src]`, `noscript > iframe` | none | `transistor` (13 rules, 6 classes) | no (has own inline `data-src` script) |
| **Embed** (YouTube, Vimeo, X, CodePen, Spotify, SoundCloud, Other) | `embed/embed-renderer.ts` | `figure.kg-card.kg-embed-card[.kg-card-hascaption]` | provider `innerHTML` (opaque, usually an `iframe`), `figcaption`. Twitter path adds `.kg-twitter-card`, `.kg-twitter-link` | caption; provider type is not reflected in a class | *(none — theme owns it)* | no |
| **Code** | `codeblock/codeblock-renderer.ts` | **with caption:** `figure.kg-card.kg-code-card` > `pre > code.language-{lang}` + `figcaption`. **without caption:** bare `pre > code.language-{lang}` — **no `kg-` class at all** | `code.language-*` | language, caption | *(none)* | no |
| **Markdown** | `markdown/markdown-renderer.ts` | none — `type: 'inner'`, raw HTML injected with **no wrapper** | whatever the markdown produces | none | *(none)* | no |
| **HTML** | `html/html-renderer.ts` | none — emits `<!--kg-card-begin: html-->` … `<!--kg-card-end: html-->` comment fences around raw HTML | none | visibility (email/web segments) | *(none)* | no |
| **Divider** | `horizontalrule/horizontalrule-renderer.ts` | bare `<hr>` — **no `kg-` class** | — | none | *(none)* | no |
| **Blockquote (alt / "aside")** | `kg-lexical-html-renderer/src/transformers/element/aside.ts` | `blockquote.kg-blockquote-alt` | — | plain vs alt blockquote (toolbar toggle) | `blockquote` (5 rules, 1 class) | no |
| **Public preview (paywall)** | `paywall/paywall-renderer.ts` | `<!--members-only-->` comment only | — | none | *(none)* | no |
| **Email content / Email CTA** | `email/*`, `email-cta/*` | render **only** when `target === 'email'`; web output is an empty container | `div.align-center`, `div.btn.btn-accent`, `hr` | alignment, dividers, segment | *(none — email only)* | n/a |
| **Collection** (legacy) | *no node in OSS Koenig* | `.kg-collection-card` | `.kg-collection-card-title`, `a.kg-collection-card-post-wrapper`, `.kg-collection-card-post`, `.kg-collection-card-img`, `.kg-collection-card-content`, `.kg-collection-card-post-title/-excerpt/-meta`, `.kg-collection-card-grid/-list` | none creatable today | `collection` (49 rules, 11 classes) | no |
| **NFT** (legacy) | *removed from Koenig* | `.kg-nft-card` | `.kg-nft-card-container`, `.kg-nft-image`, `.kg-nft-header`, `.kg-nft-title`, `.kg-nft-opensea-logo`, `.kg-nft-creator`, `.kg-nft-metadata`, `.kg-nft-description` | none — legacy content only | `nft` (12 rules, 9 classes) | no |
| **Before/after** (legacy, mobiledoc only) | `kg-default-cards/src/cards/before-after.ts` | `.kg-before-after-card` | `.kg-before-after-card-image-before`, `.kg-before-after-card-image-after` | legacy | *(no CSS chunk in 6.58 — gscan still lints it)* | mobiledoc JS |

**Count: 26 distinct card types are enumerated above** — 20 creatable in the current editor (image, gallery, bookmark, audio, video, file, toggle, callout, button, product, header, signup, call-to-action, transistor, embed, code, markdown, html, divider, blockquote-alt), plus paywall/public-preview and the two email-only cards, plus 3 legacy (collection, nft, before-after). Counting the `header` v1/v2 split as separate design targets gives 27 design surfaces.

### 1.3 Cross-cutting classes (not owned by any card chunk)

`.kg-card` — on nearly every card root, the hook for card-level rhythm.
`.kg-card-hascaption` — image, gallery, bookmark, video, embed.
`.kg-width-wide` / `.kg-width-full` — image, gallery (always wide), video, header v2, signup.

These three widths are **never defined in any Ghost card CSS chunk**, verified:

```
$ grep -n "^\.kg-width-wide\s*[,{]\|^\.kg-width-full\s*[,{]" ghost/core/core/frontend/src/cards/css/*.css
(no matches)
```

They are the theme's job unconditionally — which is exactly why gscan checks them regardless of `card_assets` (§3.5).

### 1.4 What is genuinely designable

- **Fully designable by class:** bookmark, callout, toggle, button, product, file, audio, video, gallery, header (v1/v2), signup, cta, transistor, blockquote-alt, collection, nft, code-with-caption, image.
- **Designable only via container/child selectors:** embed (`.kg-embed-card iframe`, `.kg-embed-card > *`), markdown (no wrapper — must be reached through the theme's content wrapper, e.g. `.gh-content table`), code-without-caption (`.gh-content > pre`), divider (`.gh-content > hr`).
- **Not designable:** paywall (a comment), email/email-cta (never rendered on web).
- **Fights inline styles:** header v2, signup, and cta write `style="background-color:…; color:…"` from editor settings straight onto the element. A theme cannot beat an inline style without `!important`, and **should not try** — those are per-post author choices. Inflozo's controls for those three must be limited to what the inline styles do not set (typography, spacing, radius, borders, button shape).

---

## 2. How Ghost's card CSS actually loads

### 2.1 The service (rewritten in 6.x — manifest-based, not on-disk)

`ghost/core/core/frontend/services/assets-minification/card-assets.js`. Ghost no longer minifies to `content/public` on first request; a build step produces a manifest and the runtime concatenates chunks in memory:

```js
/**
 * Card assets are built ahead of time by scripts/build-card-assets.mjs, which
 * minifies every card's CSS/JS into a manifest. The only per-site variable is
 * which cards the active theme asked for, so serving is a matter of picking
 * chunks out of the manifest and concatenating them.
 */
```

The whole of the `card_assets` contract is one function (lines 83–105):

```js
getCardNames(type) {
    const available = Object.keys(this.manifest[type] || {});

    // CASE: The theme has asked for all card assets to be included by default
    if (this.config === true) {
        return available;
    }

    // CASE: the theme has declared an include directive, we should include exactly these assets
    // Include rules take precedence over exclude rules.
    if (_.has(this.config, 'include')) {
        return available.filter(name => this.config.include.includes(name));
    }

    // CASE: the theme has declared an exclude directive, we should include everything else
    if (_.has(this.config, 'exclude')) {
        return available.filter(name => !this.config.exclude.includes(name));
    }

    // CASE: theme has asked that no assets be included
    // CASE: we didn't understand config, don't do anything
    return [];
}
```

Then `getBundle(type)` joins the selected chunks and content-hashes them; `hasFile(type)` is `!!getBundle(type)`; an empty selection yields `null`.

### 2.2 Exact semantics

| `config.card_assets` | `cards.min.css` | `cards.min.js` |
|---|---|---|
| absent (theme default) | **all chunks** — `defaults.json` is `{"posts_per_page":5,"card_assets":true}` | all chunks |
| `true` | all 17 CSS chunks | all 4 JS chunks |
| `false` | **not emitted at all** (no `<link>`) | **not emitted at all** (no `<script>`) |
| `{include:[…]}` | only named chunks | only named chunks |
| `{exclude:[…]}` | everything except named | everything except named |
| anything else | nothing | nothing |

**`getCardNames` is called once per type with the *same* config**, so an `exclude` entry drops **both** the CSS and the JS for that card. Ghost's own unit test proves it (`ghost/core/test/unit/frontend/services/card-assets.test.js`, against a 3-card fixture manifest):

```js
it('CASE: card_assets is an object with an exclude property', function () {
    const cardAssets = service({exclude: ['bookmark']});
    assert.deepEqual(cardAssets.getCardNames('css'), ['audio', 'gallery']);
    assert.deepEqual(cardAssets.getCardNames('js'),  ['audio', 'gallery']);
});

it('CASE: card_assets has include and exclude, include should win', function () {
    const cardAssets = service({include: ['gallery'], exclude: ['bookmark']});
    assert.deepEqual(cardAssets.getCardNames('css'), ['gallery']);
    assert.deepEqual(cardAssets.getCardNames('js'),  ['gallery']);
});

it('ignores names that this Ghost version does not ship', function () {
    const cardAssets = service({include: ['gallery', 'nope']});
    assert.deepEqual(cardAssets.getCardNames('css'), ['gallery']);
});
```

Unknown names are silently ignored — a stale exclude list degrades quietly rather than erroring.

Only `posts_per_page`, `image_sizes`, `card_assets` are read from `package.json.config` at all (`theme-engine/config/index.js`: `const allowedKeys = ['posts_per_page', 'image_sizes', 'card_assets'];`).

### 2.3 Where the names are defined in source

Names are **filenames**, taken from `ghost/core/core/frontend/src/cards/{css,js}/` by `ghost/core/scripts/build-card-assets.mjs`:

```js
const srcDir = path.join(projectRoot, 'core/frontend/src/cards');
const files = fs.readdirSync(dir).filter(file => file.endsWith(suffix)).sort();
…
chunks[file.slice(0, -suffix.length)] = code;
```

Ghost 6.58 ships:

**CSS (17):** `audio`, `blockquote`, `bookmark`, `button`, `callout`, `collection`, `cta`, `file`, `gallery`, `header`, `header_v2`, `nft`, `product`, `signup`, `toggle`, `transistor`, `video`
**JS (4):** `audio`, `gallery`, `toggle`, `video`

Gotchas for an exclude list:
- **`header` and `header_v2` are separate names.** Excluding `header` leaves the v2 stylesheet (the one current posts use) intact. You must exclude both.
- `blockquote` means `.kg-blockquote-alt` only.
- There is **no `image` or `embed` chunk** — those are already 100% theme responsibility, always.
- The docs' list omits `collection`, `cta`, `header_v2`, `transistor`.

### 2.4 Where in the document it lands

`ghost/core/core/frontend/helpers/ghost_head.js`, lines 438–445:

```js
// @TODO do this in a more "frameworky" way

if (!excludeList.has('card_assets')) {
    if (cardAssets.hasFile('js')) {
        head.push(`<script defer src="${getAssetUrl('public/cards.min.js')}"></script>`);
    }
    if (cardAssets.hasFile('css')) {
        head.push(`<link rel="stylesheet" type="text/css" href="${getAssetUrl('public/cards.min.css')}">`);
    }
}
```

Order **inside** `{{ghost_head}}`, reading the `head` array pushes in sequence: meta/SEO → members/search/announcement → **`cards.min.js`, `cards.min.css`** → comment counts → analytics → `<style>:root{--ghost-accent-color:…}</style>` → **global code injection** → **post code injection** → tag code injection → custom-font `<style>`.

### 2.5 Verdict on the claim

> "Ghost's card stylesheet loads inside `ghost_head`, which sits after the theme stylesheet in a normal `default.hbs`, so Ghost wins equal-specificity ties."

**Confirmed, with two refinements.**

Both official themes put the stylesheet first and `{{ghost_head}}` last:

```hbs
{{!-- Casper default.hbs --}}
<link rel="stylesheet" type="text/css" href="{{asset "built/screen.css"}}" />
{{!-- …it should always be the last tag before the closing head tag --}}
{{ghost_head}}
```

```hbs
{{!-- Source default.hbs --}}
<link rel="stylesheet" type="text/css" href="{{asset "built/screen.css"}}">
…
{{ghost_head}}
```

gscan's `GS040-GH-REQ` reinforces the convention in its own text: *"The helper belongs just before the `</head>` tag in your `default.hbs` template."*

Refinements:
1. Ghost wins **equal-specificity** ties only. It does not win on specificity — Ghost's card CSS tops out at `(0,5,1)`, and most of it is `(0,1,x)`–`(0,3,x)`. A higher-specificity theme selector beats it regardless of order.
2. The tie-break also puts Ghost's card CSS **before** user Code Injection, which is what makes option (d) in §3 dangerous.

Specificity distribution across all 17 chunks (490 selectors):

| Specificity | Count |
|---|---|
| (0,5,1) | 1 |
| (0,5,0) | 1 |
| (0,4,1) | 6 |
| (0,4,0) | 23 |
| (0,3,2) | 8 |
| (0,3,1) | 50 |
| (0,3,0) | 56 |
| (0,2,2) | 10 |
| (0,2,1) | 81 |
| (0,2,0) | 75 |
| (0,1,x) and below | remainder |

Max is `.kg-file-card a.kg-file-card-container:hover .kg-file-card-icon:before` = `(0,5,1)`.

Ghost's card CSS uses `!important` **7 times total** — 3 in `audio.css`, 4 in `video.css`, all for range-slider vendor pseudo-elements. Everywhere else it plays fair.

---

## 3. The override strategy

### 3.1 (a) `card_assets: false` — theme ships everything

**Correctness:** perfect for what you have styled. No override fight, zero `!important`, one stylesheet, obvious cascade.

**What breaks — the JS question.** Only **4 cards have JS**: `audio`, `gallery`, `toggle`, `video`. Everything else — bookmark, callout, button, product, file, header, signup, cta, nft, collection, blockquote, transistor — is CSS-only and is completely unaffected by losing `cards.min.js`.

| Card | JS | Size | Without it |
|---|---|---|---|
| `audio` | `audio.js` | 146 lines | **Inert.** Play/pause, seek, volume, playback rate, time display all dead. The `<audio>` element has no `controls` attribute, so there is no native fallback. |
| `video` | `video.js` | 242 lines | **Inert.** Same — no `controls` attribute on the `<video>`; only `loop autoplay muted` videos still move. |
| `gallery` | `gallery.js` | 10 lines | **Layout degraded.** The script sets `container.style.flex = ratio + ' 1 0%'` per image from its `width`/`height` attributes. Without it, images in a row do not share width by aspect ratio. |
| `toggle` | `toggle.js` | 18 lines | **Conditionally broken.** The script flips `data-kg-toggle-state` between `close`/`open`. Ghost's CSS collapses `[data-kg-toggle-state="close"] .kg-toggle-content`. If the theme reproduces the collapsed state (any faithful design will), content is permanently hidden. If the theme ships no collapse rule, the card degrades to permanently open. |

So **audio, video, gallery and toggle are the cards that are inert or degraded without Ghost's assets.** All four scripts are trivially re-shippable (416 lines total, Ghost is MIT).

**The real cost of (a) is forward compatibility.** `false` is a standing "I own all card styling, forever". When Ghost ships a new card, every `card_assets: false` theme renders it naked until the theme is rebuilt. That is a support burden Inflozo would own on every Ghost release.

**gscan:** `false` restores **all 103** GS050 rules (§3.5) — but it also demands the theme carry classes for cards nobody designed (nft, collection, before-after…), so an Inflozo theme would fail dozens of GS050 checks unless it ships a full baseline. Restoring checking is only valuable if you can pass it.

### 3.2 (b) `card_assets: {exclude: […]}` — surgical

**Verified from source and test:** `exclude` drops **both** CSS and JS for the named card (§2.2). Same total control as (a) for exactly the cards you name, and cards you did not name keep Ghost's defaults — including cards that do not exist yet.

**Correctness:** identical to (a) within the excluded set. No `!important`, no specificity inflation, no order dependence.

**Hand-editability:** the best of the four. The output theme has ordinary flat selectors like `.kg-callout-card { … }` — exactly what a Ghost developer expects, and what Ghost's own reference CSS looks like. Nothing to decode at 3am.

**gscan:** checking is restored *precisely in proportion to what you designed*. Verified by running the real check against `gscan@6.4.2` v6 spec:

```
$ node -e "…require('./lib/checks/050-koenig-css-classes.js')…"
true                        -> checked GS050 rules: 2
false                       -> checked GS050 rules: 103
{"exclude":["callout","toggle"]} -> checked GS050 rules: 19    (2 + callout 12 + toggle 5)
{"include":["callout","toggle"]} -> checked GS050 rules: 86    (103 - 17)
```

That is the killer property: excluding a card **turns its gscan rules back on**, and you exclude it precisely because you have written its CSS — so you pass. Checking and coverage move together.

**Caveat:** excluding `audio`/`video`/`gallery`/`toggle` also removes their behaviour. The theme must ship equivalents.

### 3.3 (c) Keep Ghost's CSS and out-specify it

**Is `!important` the right call?** No — it is a symptom of picking selectors that merely *tie* Ghost's. Ghost's card CSS caps at `(0,5,1)`; a theme selector above that always wins on specificity, and specificity is deterministic where load order is a convention.

If you must fight, the workable pattern is a **scope class plus a doubled card class** — sized against the specific chunk, not guessed:

```css
/* callout.css tops out at (0,2,1) — `.kg-callout-card div.kg-callout-text`.
   This is (0,4,0). Wins on specificity, order-independent. */
.gh-content .kg-callout-card.kg-card .kg-callout-text { … }
```

Note how easy the trap is: the obvious `.kg-callout-text { … }` is `(0,1,0)` and **loses** to Ghost's element-qualified `.kg-callout-card div.kg-callout-text` at `(0,2,1)` — not on order, on specificity. A hand-writing developer discovers this by the property mysteriously not applying, reaches for `!important`, and moves on. That is the exact failure this module must not reproduce.

That works per-card because you can measure each chunk. What does **not** work is a single uniform pattern: the ceiling across all 17 chunks is `(0,5,1)` (`file.css`), with `signup.css`, `header_v2.css` and `cta.css` all sitting at `(0,4,x)`–`(0,5,0)`. To be *unconditionally* safe with one emitted shape, every rule needs ≥ `(0,6,0)`:

```css
:root .gh-content .kg-callout-card.kg-callout-card.kg-callout-card .kg-callout-text { … }
```

That is unreadable, unmaintainable by hand, and inflates every generated rule. `!important` is *cleaner than that*. Both are worse than not competing at all.

Note also that **cascade layers cannot help**: `@layer` styles always lose to unlayered ones, and Ghost's `cards.min.css` is unlayered. Wrapping Inflozo's CSS in a layer makes it lose harder.

**gscan:** (c) keeps `card_assets: true`, so **101 of 103** GS050 rules stay switched off. You get no checking for the very cards you are designing.

**Where (c) is still right:** the handful of properties Ghost sets that you cannot exclude because you need Ghost's JS and do not want to vendor it — see §6.

### 3.4 (d) Move the theme stylesheet after `{{ghost_head}}`

**Legal?** Technically yes — gscan only checks that `{{ghost_head}}` *exists* (`GS040-GH-REQ`, level `warning`, `helper: 'ghost_head'`); no rule checks its position. Nothing in Ghost's rendering path requires the theme stylesheet to precede it.

**Safe?** No. It breaks the one thing every Ghost user relies on for site tweaks:

Reading `ghost_head.js` in order, `globalCodeinjection` and `postCodeInjection` are pushed **after** the card assets:

```js
if (!_.isEmpty(globalCodeinjection)) { head.push(globalCodeinjection); }
if (!_.isEmpty(postCodeInjection))   { head.push(postCodeInjection); }
```

Moving the theme stylesheet after `{{ghost_head}}` puts it after **user Code Injection**, so every `<style>` a user has pasted into Settings → Code injection silently stops working at equal specificity. That is a far worse regression than the one it fixes, and it is invisible until a customer complains.

Two things that would *not* break, for the record: the accent-colour `<style>:root{--ghost-accent-color:…}</style>` and the custom-font block only define **custom properties on `:root`**, which resolve at use time, so order is irrelevant to them (verified in `@tryghost/custom-fonts@1.0.11`: `fontCSS = ':root{--gh-font-heading:…;--gh-font-body:…}'`).

There is also a FOUC/perf cost: both official themes `<link rel="preload" as="style">` the stylesheet at the very top precisely to get it discovered early; pushing the real `<link>` past a long `ghost_head` delays the render-blocking fetch.

**Verdict: reject.**

### 3.5 The gscan number, corrected

The PRD's figure is "~110 of 113 card rules lost". The measured figure at `gscan@6.4.2`, v6 spec:

- **266** total gscan rules
- **103** are `GS050-*` (Koenig CSS classes) — 39% of gscan's entire rule set
- **101** carry a `cardAsset` tag and are gated
- **2** are ungated: `GS050-CSS-KGWW` (`.kg-width-wide`) and `GS050-CSS-KGWF` (`.kg-width-full`), both `error` level

The gate, from `gscan/lib/checks/050-koenig-css-classes.js` lines 31–40:

```js
ruleSet = _.pickBy(ruleSet.rules, function (rule, ruleCode) {
    if (rule.cardAsset && (cardAssetsEnabled
        || (enabledCards && enabledCards.includes(rule.cardAsset))
        || (disabledCards && !disabledCards.includes(rule.cardAsset)))) {
        return; // skip rule
    }
    if (ruleCode.match(ruleRegex)) {
        return rule;
    }
});
```

Rules per card asset: `video` 17, `audio` 16, `callout` 12, `product` 11, `bookmark` 10, `file` 9, `nft` 9, `button` 5, `toggle` 5, `before-after` 3, `gallery` 3, `blockquote` 1.

Two mismatches worth knowing: gscan lints `before-after`, for which Ghost 6.58 ships **no** CSS chunk; and gscan has **no** rules for `collection`, `cta`, `header`, `header_v2`, `signup`, `transistor`. So even `card_assets: false` does not get you checking on the big modern cards.

### 3.6 Comparison

| | (a) `false` | (b) `{exclude:[…]}` | (c) out-specify | (d) reorder |
|---|---|---|---|---|
| Deterministic win | yes | yes | yes, if ≥(0,6,0) everywhere | no (convention only) |
| `!important` needed | never | never | yes in practice | no |
| Forward-compatible with new Ghost cards | **no** | **yes** | yes | yes |
| Hand-editable output | good | **best** | poor | good |
| gscan GS050 restored | 103 (but unpassable) | proportional (19 for 2 cards, 103 for all) | 2 | 2 |
| Must vendor Ghost JS | for all 4 JS cards | only for excluded JS cards | no | no |
| Breaks user Code Injection | no | no | no | **yes** |
| Payload | smallest | small | largest (ships both) | largest |

---

## 4. What Casper and Source actually do

Both set **`"card_assets": true`** — the maximal setting. Neither theme opts out of a single chunk.

```json
// Casper 5.12.1 package.json
"config": { "posts_per_page": 25, "image_sizes": {…}, "card_assets": true, "custom": {…} }

// Source 1.7.1 package.json
"config": { "posts_per_page": 12, "image_sizes": {…}, "card_assets": true, "custom": {…} }
```

Neither exposes a single card-related custom setting. Casper's 10 custom settings are navigation/fonts/colour-scheme/feed layout; Source's 17 are navigation/fonts/header style/feed style/metadata toggles.

| | Casper 5.12.1 | Source 1.7.1 |
|---|---|---|
| Total CSS rule blocks | 506 | 542 |
| Blocks whose selector mentions `.kg-` | **40** (7.9%) | **44** (8.1%) |
| Distinct `.kg-` tokens targeted | 26 | 38 |
| `!important` in the file (all causes) | 20 | 13 |
| `!important` inside `.kg-` blocks | **2** | **3** |

**So yes, both official themes use `!important` on card selectors** — sparingly, and the reasons are instructive.

Source, the genuinely necessary case:

```css
/* Source screen.css:2384 */
.kg-bookmark-card .kg-bookmark-container {          /* (0,2,0) */
    border-radius: 0.25em !important;
}

/* Source screen.css:2392 */
.kg-bookmark-card a.kg-bookmark-container,
.kg-bookmark-card a.kg-bookmark-container:hover {   /* (0,2,1) */
    background: var(--background-color) !important;
    color: var(--color-darker-gray) !important;
}
```

against Ghost's

```css
/* bookmark.css:12 */
.kg-bookmark-card a.kg-bookmark-container,
.kg-bookmark-card a.kg-bookmark-container:hover {   /* (0,2,1) */
    display: flex; background: #fff; text-decoration: none;
    border-radius: 6px; border: 1px solid rgb(124 139 154 / 25%);
    overflow: hidden; color: #222;
}
```

The first is `(0,2,0)` vs Ghost's `(0,2,1)` — it *loses* on specificity. The second is an **exact tie** at `(0,2,1)` — it loses on order because `cards.min.css` comes later. Both need `!important`. This is the canonical demonstration of the problem.

Casper, the unnecessary case:

```css
/* Casper screen.css:2403 */
html.dark-mode .kg-bookmark-card a.kg-bookmark-container,
html.dark-mode .kg-bookmark-card a.kg-bookmark-container:hover {  /* (0,3,2) */
    background: var(--color-darkmode) !important;
    color: #fff !important;
}
```

`(0,3,2)` already outranks Ghost's `(0,2,1)`. The `!important` there is redundant — cargo-culted after a fight that had already been won. Even Ghost's own theme team does not reason about this carefully, which is the strongest possible argument for a generator that never enters the fight.

**The good pattern, which Source does use** — doubling up classes on the same element:

```css
.kg-callout-card.kg-card { border-radius: 0.25em; }                    /* (0,2,0), no !important */
.kg-product-card.kg-card .kg-product-card-image { … }                  /* (0,3,0) */
.kg-product-card.kg-card a.kg-product-card-button { … }                /* (0,3,1) */
.kg-file-card.kg-card .kg-file-card-container { padding: 0.6em; }      /* (0,3,0) */
.kg-card.kg-button-card .kg-btn { … }                                  /* (0,3,0) */
```

Casper scopes instead, with its content wrapper:

```css
.gh-content .kg-callout-card .kg-callout-text { … }
.gh-content .kg-toggle-card .kg-toggle-content > p { … }
.kg-card.kg-header-card.kg-style-dark { … }
```

Both themes also own `.kg-width-wide` / `.kg-width-full` / `.kg-content-wide` outright, as they must:

```css
/* Casper screen.css:1331 */
.kg-width-wide, .kg-content-wide > div { … }
.kg-width-full { … }
```

**Benchmark summary:** ~40–44 `.kg-` rule blocks, `card_assets: true`, 2–3 `!important`s (at least one of which is unnecessary), and *no* attempt to restyle audio, video, signup, cta, transistor, nft or collection at all. The bar Inflozo has to clear is low — but the bar for *not being worse* is that the emitted CSS reads like the hand-written rules above.

---

## 5. Prior art

**Themes with card-level custom settings: none found, and there structurally cannot be many.** Ghost caps themes at **20 custom settings total**, in 5 types (`select`, `boolean`, `color`, `image`, `text`), grouped only into *Site wide / Homepage / Post*. Twenty knobs is roughly one per card with nothing left over — you cannot expose "callout radius + padding + border + emoji size" as theme settings. **Card design must be baked into emitted CSS at build time.** That single fact rules out the "expose it as theme settings" approach and validates a generator.

What actually exists in the wild:

1. **The optimisation pattern.** Benjamin Rancourt, *How to Optimize Card Assets in a Ghost Theme* (<https://www.benjaminrancourt.ca/how-to-optimize-card-assets-in-a-ghost-theme/>) — moved from `card_assets: true` to an exclude list covering audio, blockquote, bookmark, button, gallery, nft, product, toggle and video; `cards.min.css` went 5.0 kB → 1.6 kB and `cards.min.js` disappeared entirely. Reported nothing broken, because the theme reimplemented what it excluded. This is option (b) done by hand, and it works.
2. **Ghost's own framing.** The docs say: *"You can override the default styles and behaviour for individual cards by configuring your theme's package.json to exclude the assets for specific cards, or disable all cards by setting card_assets to false."* Ghost's sanctioned override mechanism **is** exclusion, not out-specifying. The reference CSS in `core/frontend/src/cards/css/` is explicitly published as a starting point.
3. **Theme-vendor practice.** Commercial themes (Bright Themes' Flair, Just Good Themes' Subtle, Luxe) advertise "full support for all editor cards" and ship an *Editor Cards* demo page — a style-guide fixture post containing every card. They style cards from a fixed design; none expose card design to the end user.
4. **Community friction.** Forum threads *"How to customize Cards"*, *"Making file card customizable"*, *"Modifying the default HTML of Koenig cards"*, *"Custom Partials for Ghost Cards"* all reach the same dead end: the HTML is fixed by the renderer, so CSS is the only lever, and the only clean lever on CSS is `card_assets`.

**Realistic conclusion:** nobody ships a visual per-card designer for Ghost. The mechanism is available and documented; what does not exist is a product that drives it. Inflozo would be first, and it should use the mechanism Ghost sanctions rather than invent a specificity scheme.

---

## 6. Recommendation for Inflozo

### 6.1 The decision

**Adopt (b): `card_assets: {exclude: […]}`, listing exactly the cards the user has designed.** Never emit `card_assets: true`. Never emit `!important` in card CSS.

Why, in order of weight:

1. **It removes the problem instead of winning it.** For an excluded card, Ghost ships *nothing* — no CSS to out-specify, no order to depend on, no `!important`. If Inflozo is going to let the user design a card completely, Ghost's CSS for that card is 100% dead weight anyway.
2. **It is forward-compatible, which `false` is not.** A card Ghost adds in 6.70 is not in the exclude list, so it keeps Ghost's defaults and renders correctly in an Inflozo theme built today. `card_assets: false` would render it naked. This is the single decisive argument for (b) over (a).
3. **It restores gscan proportionally, and passably.** Two designed cards → 19 rules checked; all designed → 103. And you pass them, because the exclusion is *caused* by having written the CSS. Contrast `false`, which switches on 103 rules including nft/before-after/collection that no user will ever design.
4. **The emitted theme is hand-editable.** Flat `.kg-callout-card { … }` rules, indistinguishable from Ghost's reference CSS or Source's hand-written blocks. A developer who opens the theme sees ordinary CSS.
5. **It is Ghost's own documented override mechanism.**

Degenerate case: if the user designs every card, emit the full explicit exclude list rather than `false` — same effect today, still forward-compatible tomorrow.

### 6.2 The JS obligation — the one real cost

Excluding `audio`, `gallery`, `toggle` or `video` also removes their behaviour. Inflozo must ship replacements in the theme's own JS bundle, vendored verbatim from Ghost (MIT):

| Card | File | Lines | Must ship? |
|---|---|---|---|
| `toggle` | `core/frontend/src/cards/js/toggle.js` | 18 | **Yes** — without it a designed toggle is permanently collapsed |
| `gallery` | `.../gallery.js` | 10 | **Yes** — row proportions |
| `audio` | `.../audio.js` | 146 | **Yes** — player is otherwise dead, no native controls fallback |
| `video` | `.../video.js` | 242 | **Yes** — same |

416 lines total, pinned to a Ghost version, refreshed when Inflozo bumps its Ghost target.

**The lazy escape hatch:** if vendoring audio/video players is unacceptable maintenance, do **not** exclude `audio` and `video` — instead restrict those two cards to option (c) overrides and offer a *reduced* control surface (colours, radius, spacing — not the control internals). That costs 33 gscan rules and reintroduces specificity work for exactly two cards. Recommended default is to vendor; make it a build-time switch, not a per-card user choice.

### 6.3 Selector pattern

For an **excluded** card (the normal path) — plain, flat, single-class, no scope prefix:

```css
/* inflozo: callout — excluded from card_assets, we own it outright */
.kg-callout-card { … }
.kg-callout-card-blue { … }
.kg-callout-emoji { … }
.kg-callout-text { … }
```

Mirror Ghost's own selector shapes so the file diffs cleanly against the reference CSS and so gscan's regexes (`\.kg-callout-card` etc.) match.

For a **non-excluded** card (audio/video under the escape hatch, or a repair rule) — one deterministic ladder, no `!important`:

```css
/* inflozo: audio is NOT excluded (we keep Ghost's player JS), so these must out-rank cards.min.css */
.gh-content .kg-audio-card.kg-card .kg-audio-title { … }     /* (0,4,0) vs audio.css max (0,3,1) */
```

Rules:
- Scope with the theme's content wrapper (`.gh-content` — whatever Inflozo's `post.hbs` uses).
- Double the card root class on the same element (`.kg-audio-card.kg-card`).
- Never exceed one level deeper than Ghost's own selector for the same target; check against the measured per-chunk maximum rather than guessing.
- Only for the ≤2 cards on this path. Never as the general strategy.

Always-owned regardless of `card_assets` (theme responsibility, gscan errors if missing):

```css
.kg-width-wide { … }
.kg-width-full { … }
.kg-content-wide > div { … }
.kg-card + .kg-card { … }        /* card rhythm */
.kg-card-hascaption figcaption { … }
```

### 6.4 Control surface per card

Design principle: **expose what the card's own CSS chunk actually controls; suppress what the editor sets inline; suppress dead classes.**

**Shared control group (every card):** outer margin/rhythm, max-width behaviour for `regular`/`wide`/`full`, border radius, border, background, shadow, and caption typography where a `figcaption` exists.

| Card | Worth exposing | Noise — do not expose |
|---|---|---|
| Image | width behaviour per `regular/wide/full`, radius, shadow, caption typography/alignment, linked-image hover | alt/title (content, not design) |
| Gallery | row gap (`--gap`), per-image radius, mobile gap breakpoint, caption | row count (renderer-fixed at 3), width (renderer-fixed to `wide`) |
| Bookmark | container background/border/radius/hover, title & description typography and clamp, metadata typography, icon size, thumbnail width & aspect, mobile stacking | anything implying a size variant — **bookmark has none** |
| Callout | per-colour background *and* text colour for all 9 colours, padding, radius, border, emoji size & gutter, text typography | inventing new colours (the class set is fixed to the editor's 9) |
| Toggle | closed/open background, border, radius, padding, heading typography, chevron colour/size/rotation, transition duration, content typography, consecutive-card gap | — |
| Button | height, padding, radius, font, letter-spacing, accent vs custom colour, hover/active, full-width option, alignment gutters | — |
| Product | container border/radius/padding, image aspect & radius, title & description typography, star size/colour/inactive colour, button (inherit from Button card by default) | — |
| File | container padding/border/radius/hover, title/caption/filename/filesize typography, icon size & colour, filesize separator | `.kg-file-card-medium`, `.kg-file-card-small` — **dead classes, never emitted** |
| Audio | card background/border/radius/padding, thumbnail size & radius, title typography, control button size & colour, slider track/thumb/progress colour, time typography | — (note: needs the JS decision from §6.2) |
| Video | container radius, overlay gradient, large play-button size/colour/backdrop, control bar identical to audio, caption | — |
| Header v1 / v2 | typography scale for heading/subheading, padding per layout, split-layout ratio, image object-fit, button shape | background/text/button **colours** — set inline per post by the author |
| Signup | field height/radius/border/focus ring, button (inherit from Button), heading/subheading/disclaimer typography, success & error styling, split-layout ratio | colours — inline per post |
| CTA | per-background-colour treatment (9), minimal vs immersive padding, divider style, sponsor-label typography, image size/radius, button, centered variant | button/link colours — partly inline |
| Embed | container width per provider, iframe aspect-ratio, radius, caption | provider-specific styling (opaque `innerHTML`) |
| Code | `pre` background/padding/radius/scroll, font & size, caption; note the **no-caption case has no `kg-` class** and must be reached as `.gh-content > pre` | syntax highlighting (Ghost ships none) |
| Blockquote-alt | border/background/padding, typography, `::before` mark | — |
| Divider | thickness, colour, width, spacing (target `.gh-content > hr`) | — |
| Transistor | card radius/border, iframe height | iframe internals |
| Markdown / HTML | nothing card-specific — these inherit the theme's prose styles. Offer a **prose** panel: tables, lists, `blockquote:not([class])` | pretending they are cards |
| NFT / Collection / Before-after | **hide from the module by default**, behind an "include legacy cards" toggle | — |
| Paywall / Email / Email-CTA | **exclude from the module entirely** — never rendered on web | — |

That is **~20 active card panels**, not 26.

### 6.5 Emission model

One file, `assets/css/cards.css`, imported by the theme's stylesheet, plus a mechanical `package.json` update:

```
user designs callout, toggle, bookmark
  → assets/css/cards.css gains flat .kg-callout-* / .kg-toggle-* / .kg-bookmark-* rules
  → package.json config.card_assets = {"exclude": ["callout", "toggle", "bookmark"]}
  → assets/js/cards.js gains Ghost's toggle.js verbatim (toggle is a JS card)
```

Rules:
- **The exclude list is derived, never authored.** It is exactly `designedCards ∩ ghostCardAssetNames`. A card the user designs that has no Ghost chunk (image, embed, code, divider) contributes CSS but no exclude entry.
- **Seed each panel from Ghost's own chunk**, so "untouched" renders byte-identical to stock Ghost and the diff a user creates is visible and small.
- **Pin the chunk names to a Ghost version** and re-verify on each Ghost minor. Unknown names are ignored silently by Ghost (`getCardNames` filters against `available`), so a stale list degrades quietly — but it degrades *toward* Ghost's CSS reappearing under your rules, which is a live regression. Guard it with a build-time check against a checked-in `cards.manifest` name list.
- **Remember `header` vs `header_v2`.** Designing "the header card" must exclude **both** names.
- **Never emit `!important` in `cards.css`.** Make it a lint rule on the generator's own output.

### 6.6 Canvas fidelity

The canvas never renders real post body HTML, so the fixture is the contract.

1. **Ship a style-guide fixture** — one static HTML document containing every card in every class-affecting variant, generated **from the renderers**, not hand-written. Snapshot the output of each `render*Node` function into a fixture file and check it in. Variants to cover: image ×3 widths ×caption; gallery 1/2/3/4/5 images ×caption; video ×3 widths ×loop; callout ×9 colours ×emoji; button ×2 alignments; product ×rating ×button ×image; header v2 ×4 layouts ×swapped; signup ×4 layouts; cta ×9 backgrounds ×2 layouts ×dividers ×sponsor ×image; file ×title/caption combinations; toggle open + closed; code ×caption; bookmark ×thumbnail ×caption. That is the whole design surface, enumerable.
2. **Render it inside the same wrapper the theme uses** (`<main><article class="gh-content">…`), because scoped selectors and `.kg-width-*` behaviour depend on it.
3. **Load the exact same two stylesheets in the same order the browser will:** the theme's stylesheet, then a *simulated* `cards.min.css` containing only the chunks that are **not** in the derived exclude list. Rebuild that simulated bundle whenever the exclude list changes. This is what makes the preview faithful — a canvas that only loads Inflozo's CSS will look right while the shipped site looks wrong, which is the exact failure mode this whole document exists to prevent.
4. **Also load the 4 behaviour scripts** so toggle actually toggles and gallery rows proportion correctly in the preview.
5. **Regenerate the fixture when the Ghost target bumps.** A renderer-derived fixture makes a changed card an obvious diff rather than a silent drift.
6. **Show the cascade honestly.** When a card is *not* excluded (the audio/video escape hatch), the panel should say so and show which of Ghost's declarations are still in play. Silent surprises here are how "it looked right in the builder" bugs are born.

### 6.7 One-line summary

Design every card, exclude every card you design, ship the four scripts that exclusion takes away, and never write `!important` — because the fight Ghost's `cards.min.css` picks is one you can decline entirely.

---

## Appendix A — Ghost 6.58 card asset chunk inventory

| Chunk | CSS lines | CSS rules | Classes | JS lines | gscan rules |
|---|---|---|---|---|---|
| audio | 332 | 48 | 16 | 146 | 16 |
| blockquote | 23 | 5 | 1 | — | 1 |
| bookmark | 116 | 16 | 10 | — | 10 |
| button | 39 | 6 | 4 | — | 5 |
| callout | 67 | 15 | 12 | — | 12 |
| collection | 215 | 49 | 11 | — | 0 |
| cta | 252 | 54 | 24 | — | 0 |
| file | 143 | 22 | 11 | — | 9 |
| gallery | 48 | 10 | 6 | 10 | 3 |
| header | 233 | 42 | 11 | — | 0 |
| header_v2 | 262 | 47 | 16 | — | 0 |
| nft | 94 | 12 | 9 | — | 9 |
| product | 133 | 20 | 11 | — | 11 |
| signup | 382 | 66 | 23 | — | 0 |
| toggle | 97 | 14 | 5 | 18 | 5 |
| transistor | 88 | 13 | 6 | — | 0 |
| video | 356 | 50 | 18 | 242 | 17 |
| *before-after* | **0 (no chunk)** | 0 | — | — | 3 |
| *(ungated)* | — | — | `.kg-width-wide`, `.kg-width-full` | — | 2 |
| **Total** | **2,880** | **489** | — | **416** | **103** |

`before-after` is the mismatch: gscan lints 3 rules for a card Ghost 6.58 ships no CSS chunk for. Under `card_assets: true`, `{include:[…]}` or `{exclude:[…]}` these 3 rules are gated off like any other `cardAsset` rule, so the recommended strategy (b) never surfaces them. Only `card_assets: false` switches them on — and then they fail, because no modern theme carries `.kg-before-after-card*`. One more small reason to prefer an explicit exclude list over `false`.

## Appendix B — Reproduction commands

```bash
git clone --depth 1 https://github.com/TryGhost/Ghost.git
git clone --depth 1 https://github.com/TryGhost/Koenig.git
git clone --depth 1 https://github.com/TryGhost/Casper.git
git clone --depth 1 https://github.com/TryGhost/Source.git
git clone --depth 1 https://github.com/TryGhost/gscan.git

# authoritative card_assets name list
ls Ghost/ghost/core/core/frontend/src/cards/css/ Ghost/ghost/core/core/frontend/src/cards/js/

# gscan gating, measured
cd gscan && node -e "
const check=require('./lib/checks/050-koenig-css-classes.js');
const run=cfg=>{const t={files:[{ext:'.json',file:'package.json',content:JSON.stringify({name:'t',config:{card_assets:cfg}})},{ext:'.css',file:'x.css',content:''}],results:{pass:[],fail:{}}};check(t,{checkVersion:'v6'});return Object.keys(t.results.fail).length;};
[true,false,{exclude:['callout','toggle']},{include:['callout','toggle']}].forEach(c=>console.log(JSON.stringify(c),'->',run(c)));"
```

## Appendix C — Citations

**Ghost source**
- `ghost/core/core/frontend/services/assets-minification/card-assets.js` — `getCardNames`, `getBundle`, `hasFile`, `invalidate`
- `ghost/core/scripts/build-card-assets.mjs` — manifest build, name derivation from filenames
- `ghost/core/core/frontend/helpers/ghost_head.js` L438–445 — card asset injection; L474–486 — code injection ordering
- `ghost/core/core/frontend/services/theme-engine/config/index.js`, `defaults.json` — allowed keys, `card_assets: true` default
- `ghost/core/core/frontend/web/routers/serve-public-file.js` — `createCardAssetMiddleware`
- `ghost/core/core/frontend/meta/asset-url.js` L154–162 — content-hash `?v=`
- `ghost/core/test/unit/frontend/services/card-assets.test.js` — include/exclude/false semantics
- `ghost/core/core/frontend/src/cards/{css,js}/*` — the 17 CSS and 4 JS chunks

**Koenig source**
- `packages/kg-default-nodes/src/kg-default-nodes.ts` — `DEFAULT_NODES`
- `packages/kg-default-nodes/src/nodes/*/*-renderer.ts` — per-card DOM
- `packages/kg-default-nodes/src/nodes/header/renderers/{v1,v2}/header-renderer.ts`
- `packages/kg-lexical-html-renderer/src/transformers/element/aside.ts` — `.kg-blockquote-alt`
- `packages/koenig-lexical/src/components/ui/cards/CalloutCard.tsx` — `CALLOUT_COLORS`
- `packages/koenig-lexical/src/nodes/*.tsx` — editor card-menu labels
- `packages/kg-default-cards/src/cards/index.ts` — legacy mobiledoc set incl. `before-after`

**gscan**
- `lib/checks/050-koenig-css-classes.js` — the `cardAsset` gate
- `lib/utils/package-json.js` — config resolution
- `lib/specs/v6.js` — 266 rules, 103 `GS050-*`

**Themes**
- `Casper/package.json`, `Casper/default.hbs`, `Casper/assets/css/screen.css`
- `Source/package.json`, `Source/default.hbs`, `Source/assets/css/screen.css`

**Docs & prior art**
- <https://docs.ghost.org/themes/content/> — card assets, override guidance, (stale) name list
- <https://docs.ghost.org/themes/custom-settings> — 20-setting cap, 5 types
- <https://www.benjaminrancourt.ca/how-to-optimize-card-assets-in-a-ghost-theme/> — exclude-list case study
- <https://forum.ghost.org/t/how-to-customize-cards/34864>, <https://forum.ghost.org/t/modifying-the-default-html-of-koenig-cards/5024>, <https://forum.ghost.org/t/making-file-card-customazible/34791>, <https://forum.ghost.org/t/default-card-assets-still-showing-with-theme-that-excludes-them-in-package-json/40051>
- <https://brightthemes.com/blog/ghost-editor-cards>, <https://subtle.justgoodthemes.com/editor-cards/>
