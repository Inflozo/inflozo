---
title: Inflozo Research — Editing Canvas Iframe Geometry
status: normative-companion
role: evidence base and decision record for the editing canvas's iframe geometry, the placement of editing chrome, the scroll/resize sync technique, and device-preview implementation. Binding on the Architect for the canvas surface; where it states a mechanism, that mechanism is required unless prd.md says otherwise.
created: 2026-08-18
---

# Canvas Iframe Geometry — What Webflow, Elementor and the rest actually do

**The question.** The builder renders the user's page in an iframe. Editing chrome — selection outlines, drag handles, the insertion `+`, the floating text toolbar, the controls sidebar — is positioned over that iframe. Two geometries are possible:

- **(A) Viewport-sized iframe, scrolls internally.** The iframe is the size of the visible canvas area; the page scrolls *inside* it. `sticky`, `fixed`, `100vh`, `dvh`, media queries and `IntersectionObserver` all behave exactly as on the published site. Cost: every chrome rectangle changes on every scroll frame.
- **(B) Full-document-height iframe, outer container scrolls.** Chrome rects are stable and cheap. Cost: `sticky` never releases, `fixed` pins to a 20,000px box, `100vh` resolves against document height, and a 390px "mobile preview" still has a 20,000px-tall viewport.

### The consensus at a glance

| Product | Canvas geometry | Device preview | Where selection chrome lives | Evidence |
|---|---|---|---|---|
| **Elementor** | **(A)** viewport-sized, scrolls internally | **width + height**, real px, then a fit-scale on the wrapper | **Inside** the iframe — `editor-preview` stylesheet injected into the preview document | source (`elementor/elementor@main`) |
| **Gutenberg** | **(A)** viewport-sized, scrolls internally | **width + height** (`getCanvasHeight`, device aspect ratio) | **Inside** as `::after` pseudo-elements; only toolbar + inserter outside | source (`WordPress/gutenberg@trunk`) + public design rationale |
| **Webflow** | **(A)** — `fixed` stays pinned on canvas; canvas height = browser window | **width only** — a 119-vote open wishlist gap since 2017 | not established | behavioural + vendor wishlist |
| **Shopify** | real storefront page; editor pushes events *into* it | n/a (device toggles) | not established; state is pushed into the preview document | vendor docs |
| **Framer** | artboard, **no real viewport** — draws a fake "viewport line" | n/a | n/a (not an iframe canvas) | vendor docs |
| **Plasmic** | sandboxed artboard iframes | **width only**; height not settable | not established | vendor docs + forum |

**Consensus, stated plainly.** Geometry (A) is unanimous among the products that simulate a browser viewport at all — and the one product that refused (Framer) had to invent a fake viewport affordance and restrict what users may build. **Nobody ships (B).** Device preview splits: the products that resize **both axes** (Elementor, Gutenberg) are correct; the products that resize **width only** (Webflow, Plasmic) have identical, long-standing, unresolved user complaints about `vh` and percentage heights. And on chrome placement, the two products whose source can be read agree: **most chrome goes inside the iframe.**


**The answer, up front: every serious product ships (A).** Not one of them ships (B). And the reason (B) looks cheaper than it is, is that these products *do not position most of their chrome from measured rectangles at all* — they render the cheap chrome **inside** the iframe as ordinary CSS on the element itself, where it scrolls for free at zero JS cost, and reserve outside-the-iframe positioning for the handful of genuinely floating popovers. That split, not the geometry, is the real design insight. See §6.

---

## 1. Webflow — geometry (A), and the one place it falls short is instructive

Webflow is closed-source, so the evidence here is **behavioural and documentary** rather than source-level. It is still decisive, because the two behaviours below are impossible under geometry (B).

### 1.1 The canvas has a real viewport — `fixed` stays pinned while you scroll it

Webflow's Designer canvas renders `position: fixed` elements as genuinely fixed **at design time**: a fixed navbar "stays on top when scrolling in designer mode." The recurring forum complaints run in the *opposite* direction to what geometry (B) would produce — users report elements that work **in the Designer** and then fail once published (usually a `transform` or `filter` on an ancestor creating a containing block, or an interaction overriding position), never a fixed navbar that scrolls away on the canvas. **[fwd]** [Navbar fixed in designer mode, but not fixed in preview or published mode](https://discourse.webflow.com/t/navbar-fixed-in-designer-mode-but-not-fixed-in-preview-or-published-mode/44752); [My Nav Bar is fixed in Design mode but isn't actually working](https://discourse.webflow.com/t/my-nav-bar-is-fixed-in-design-mode-but-isnt-actually-working/220642).

Under geometry (B) a fixed navbar would pin to the top of a document-height box and scroll out of view immediately. That failure is simply not in Webflow's bug corpus. The canvas therefore has a real, viewport-sized scrollport, and the page scrolls inside it.

### 1.2 Confirmed by Webflow's own users: the canvas viewport is the browser window

The clearest single statement comes from Webflow's public wishlist, [WEBFLOW-I-103, "Ability to adjust height of the Designer Canvas for smaller breakpoints"](https://wishlist.webflow.com/ideas/WEBFLOW-I-103) **[fwd]**:

> "the **height** of the editor and preview is as tall as my browser window"

That sentence only makes sense for geometry (A). A document-height iframe has no "height of the editor" to speak of — the whole point of (B) is that the frame is as tall as the content. Webflow's canvas is a viewport whose height happens to equal the browser window's.

### 1.3 Where Webflow *does* fall short — and it is exactly the device-preview question

Webflow's breakpoint views change the canvas **width only**. The height stays glued to the browser window. From [WEBFLOW-I-19, "Canvas and Preview Mode for touch-based mobile breakpoints should be more accurate"](https://wishlist.webflow.com/ideas/WEBFLOW-I-19) — the idea WEBFLOW-I-103 was merged into **[fwd]**:

> "Smaller breakpoints should reflect accurate canvas size for various devices. **Currently, you can adjust the width, but you should be able to adjust the height as well.**"

and from the original request:

> "editing in mobile landscape is very inaccurate and misleading when working with properties like background-image, percentage heights and vh units."

and from a commenter:

> "There is no way to see the real result of VH. This shouldn't be in the wishlist for 4 years."

**119 votes, open since January 2017, still unresolved.** This is the most valuable single finding in this document, and it is a *negative* result: Webflow got the geometry right and the **device-preview height wrong**, and has been paying for it in user trust for nine years. §7.4 tells Inflozo to do what Elementor does here, not what Webflow does — and the evidence that Webflow's approach is wrong comes from Webflow's own users, not from an opinion.

### 1.4 Preview mode marks what the canvas suppresses — and it is not layout

Webflow keeps a separate **Preview** mode where "you can view how your elements and Interactions will appear on your published site" and "you can't select or modify elements." **[docs]** [Webflow canvas overview](https://help.webflow.com/hc/en-us/articles/33961319255059-Webflow-canvas-overview).

What Preview adds is **Interactions and animations running**, plus the absence of editing chrome. It is not a fallback for layout the canvas cannot render. Sticky, fixed and `vh` all render on the canvas; they are simply not *animated* there. That distinction matters for Inflozo: a preview mode is worth having for scroll-driven behaviours, but it must not become the excuse for a canvas that renders layout incorrectly.

### 1.5 Not established

**No conclusive public evidence was found** for (a) whether the Webflow canvas is technically an `<iframe>` versus another isolation mechanism, or (b) whether Webflow's selection outlines, element badges and the orange spacing (padding/margin) editor are drawn inside the canvas document or overlaid from outside. Note that the iframe repeatedly described in Webflow's developer docs — "Apps in the Designer are injected into an iframe," hosted "on a separate domain," talking to the host over `window.postMessage` and JSON-RPC — is the **Designer Extension app panel**, a different iframe from the canvas, and must not be mistaken for it. **[docs]** [Designer Extensions](https://developers.webflow.com/apps/docs/designer-extensions); [Powering Webflow Apps: How we built Designer APIs — Part 1](https://webflow.com/blog/designer-apis-part-1).

This gap does not weaken the recommendation: Elementor (§2) and Gutenberg (§3) both supply direct, source-level answers to the chrome-placement question, and they agree with each other.


## 2. Elementor — geometry (A), and nearly all chrome lives *inside* the iframe

Elementor is the clearest case in the industry, because the whole thing is readable in `elementor/elementor` on GitHub. Everything below is verbatim from source at `main`, fetched 2026-08-18.

### 2.1 The geometry: viewport-sized iframe, page scrolls inside it

`assets/dev/scss/editor/_wrapper.scss`:

```scss
#elementor-editor-wrapper {
    display: flex;
    width: 100%;
    height: 100vh;
}
```

The editor shell is **exactly one browser viewport tall and never scrolls** — `body { overflow: hidden; }` is set in the same file.

`assets/dev/scss/editor/_devices.scss`:

```scss
body { --e-preview-width: calc(100% - var(--e-editor-panel-width, 300px)); }

body.elementor-device-desktop #elementor-preview { overflow-y: hidden; }

#elementor-preview {
    height: 100%;
    width: var(--e-preview-width);
    display: flex;
    flex-direction: column;
    position: relative;
}

#elementor-preview-responsive-wrapper {
    .elementor-device-desktop & {
        min-width: map.get($breakpoints, lg);
        width: 100%;
        height: 100%;
        margin: 0;
    }
}

#elementor-preview-iframe {
    width: 100%;
    height: 100%;
}
```

Chain it: shell `100vh` → `#elementor-preview` `height: 100%` with `overflow-y: hidden` → responsive wrapper `height: 100%` → iframe `height: 100%`. **The iframe is exactly the size of the visible canvas region, and the user's page scrolls inside it.** Geometry (A), unambiguously, with no outer scroll anywhere in the chain. `position: sticky`, `position: fixed`, `100vh` and `IntersectionObserver` therefore behave in the Elementor editor exactly as they will on the published site, because the iframe's viewport *is* a viewport.

(Elementor even carries a workaround comment in `#elementor-preview` — *"Fix child position:sticky for RTL ( browser bug )"* — which only makes sense in a build where sticky is live on the canvas.)

### 2.2 Device preview: real pixel dimensions in **both** axes, then a visual scale to fit

`_devices.scss`, device mode:

```scss
body.e-is-device-mode:not(.elementor-device-desktop) #elementor-preview-responsive-wrapper {
    width: var(--e-editor-preview-width);
    height: var(--e-editor-preview-height);
    max-height: calc(100vh - 80px);
    box-sizing: content-box;
    position: relative;
    .ui-resizable-handle { display: flex !important; }
}
```

with the wrapper declared as

```scss
#elementor-preview-responsive-wrapper {
    transform-origin: top center;
    transform: scale( var( --e-preview-scale, 1 ) );
}
```

Three things follow, and all three are the right answer:

1. **Both width and height are set in real CSS pixels** on the wrapper, and the iframe is `100%`/`100%` of it. A mobile preview genuinely has a mobile-sized viewport — media queries fire, `vw` and `vh` resolve correctly. The responsive bar exposes **separate width and height inputs** (`assets/dev/js/editor/regions/responsive-bar/view.js`: `sizeInputWidth`, `sizeInputHeight`) plus jQuery-UI resize handles on all four edges, so the user can drag the device viewport in either axis.
2. **The scale transform is applied to the wrapper, outside the iframe** — never as a substitute for real sizing. `autoScale()` only kicks in when the true device size will not fit the available room:

```js
autoScale() {
    const handlesWidth = 40 * this.scalePercentage / 100,
        previewWidth = elementor.$previewWrapper.width() - handlesWidth,
        iframeWidth = parseInt( elementor.$preview.css( '--e-editor-preview-width' ) ),
        iframeScaleWidth = iframeWidth * this.scalePercentage / 100;

    if ( iframeScaleWidth > previewWidth ) {
        this.setScalePercentage( previewWidth / iframeWidth * 100 );
    } else {
        this.setScalePercentage();
    }
    this.scalePreview();
}
```

   The iframe's **layout** viewport stays at the true device size; only its **painted** size shrinks. This is the distinction most implementations get wrong.
3. Desktop mode pins `min-width` to the `lg` breakpoint so the canvas can never accidentally trigger a mobile media query.

### 2.3 Where the chrome lives — overwhelmingly *inside* the iframe

Elementor loads a dedicated editor stylesheet and editor scripts **into the previewed document**. `includes/preview.php` hooks `wp_enqueue_scripts` *in the iframe's own page load*:

```php
add_action( 'wp_enqueue_scripts', function() {
    $this->enqueue_styles();
    $this->enqueue_scripts();
} );
```

and enqueues a handle literally named `editor-preview` (`assets/css/editor-preview*.css`), alongside the extension points `elementor/preview/enqueue_styles` and `elementor/preview/enqueue_scripts`.

The source tree for that stylesheet is `assets/dev/scss/editor/preview/` and its contents name the chrome directly:

```
_add-new.scss  _column.scss  _container.scss  _inline-editor.scss
_presets.scss  _section.scss  _widget.scss  _theme.scss  _compatibility.scss
```

Two representative extracts. The widget's edit handle (`preview/_widget.scss`) is positioned **against the widget element itself**, not from a measured rect:

```scss
.elementor-editor-widget-settings {
    z-index: $second-layer;
    inset-block-start: -1px;
    inset-inline-end: -1px;
    ...
}
```

The "add new section" `+` affordance (`preview/_add-new.scss`) is an **in-flow element inside the preview document**:

```scss
.elementor-editor-active .elementor-add-section {
    // Avoid theme conflicts.
    all: initial;
    display: flex;
    ...
}
```

Note `all: initial` with the comment *"Avoid theme conflicts."* — the one real tax of putting chrome inside the iframe is that the user's own CSS can style it, and Elementor pays that tax with a reset rather than by moving the chrome out.

`_inline-editor.scss` confirms that **inline text editing also happens inside the iframe**, in the preview document's own editable region — the same split Inflozo already plans (PRD FR-D4).

**Summary of Elementor:** viewport-sized internally-scrolling iframe; device preview by real two-axis resize with a fit-scale on the wrapper; and editing chrome — element outlines, section/column/widget handles, the add-section `+`, drag affordances — **injected into the iframe document as ordinary CSS and DOM**, so it scrolls with the content at zero cost and needs no rect measurement at all. What stays outside is the panel, the top bar and the responsive bar, none of which are anchored to page elements.


---

## 3. WordPress Gutenberg — the best-documented primary source

Gutenberg is the most useful source on this exact tradeoff because the decision was made in public, with a written rationale, and the implementation is readable.

### 3.1 Why they moved the canvas into an iframe

The founding issue is [WordPress/gutenberg#20797, "Consider iframing the editor canvas/content"](https://github.com/WordPress/gutenberg/issues/20797). The stated benefits:

- "There would be no admin CSS bleed at all. This is something we've been struggling with since the beginning."
- Media-query simulation becomes unnecessary — simulating them is "arguably technically more difficult than using an iframe."
- "Relative units like `(r)em` and `vw`/`vh` just work."
- "For a full site, a theme stylesheet can be just dropped in the editor without any adjustment."

The same issue names the three costs, and they are precisely Inflozo's costs: loading the correct styles inside the iframe, **"adjusting positioning of popovers"**, and "ensuring seamless navigation between UI and canvas."

The [Make WordPress Core announcement](https://make.wordpress.org/core/2021/06/29/blocks-in-an-iframed-template-editor/) repeats the viewport-unit rationale: without an iframe, `vw` is "relative to the admin page, which is usually not the same dimensions as the editor content."

As of WordPress 7.1 the *post* editor is iframed unconditionally — ["the post editor canvas will always be an iframe, on every theme, no matter what `apiVersion` your blocks declare"](https://gutenbergtimes.com/the-post-editor-is-going-full-iframe-what-block-developers-need-to-know-before-wordpress-7-1/), because "`vw`, `vh`, and `@media` rules resolve against the canvas, not the admin page — so tablet/mobile previews and zoomed-out views actually behave like the front end." See also [Preparing the Post Editor for Full iframe Integration](https://make.wordpress.org/core/2025/11/12/preparing-the-post-editor-for-full-iframe-integration/).

**This is a product that already had geometry (B)-ish behaviour via a non-iframed canvas, measured the fidelity cost, and paid the engineering price to move to a real iframe. It is the single strongest data point available.**

### 3.2 The geometry is (A) — proven from source

`packages/block-editor/src/components/iframe/use-scale-canvas.js` reads and writes **the iframe document's own scroll position**:

```js
iframeDocument.documentElement.scrollTop = transitionToRef.current.scrollTop;
```

and computes the scroll extent as

```js
const maxScrollTop = scrollHeight - containerHeight;
```

where `containerHeight` is the height of the iframe *element* and `scrollHeight` is the iframe *document's* scroll height. A full-document-height iframe has no internal scroll and `maxScrollTop` would be zero. **The iframe is viewport-sized and the content scrolls inside it.**

Corroborating: the visual editor injects `min-height:100vh` into the iframe and relies on it resolving to the canvas, not the browser window (`packages/editor/src/components/visual-editor/index.js`):

```js
const iframeBodyMinHeightCSS =
    hasCanvasWidth && ! isResizablePostType ? 'min-height:100vh;' : '';
```

The iframe's boot document sets `html { height: auto !important; min-height: 100%; }` — `min-height: 100%` of the *iframe viewport*, which is exactly the (A) contract.

### 3.3 Where the chrome lives — the important part

Gutenberg splits its chrome in two, and the split is deliberate.

**Cheap chrome lives INSIDE the iframe, as CSS on the block itself.** Selection outlines, hover outlines, highlight rings and focus rings are `::after` pseudo-elements on the block element (`packages/block-editor/src/components/block-list/content.scss`):

```scss
.is-outline-mode .block-editor-block-list__block:not(.remove-outline) {
    &.is-hovered:not(.is-selected),
    &:not(.rich-text):not([contenteditable="true"]).is-selected {
        &::after { @include selected-block-focus(); }
    }
}
```

There is **no measurement, no rect, no scroll listener and no JS** behind a Gutenberg selection outline. It is a pseudo-element on the selected node. It tracks scroll, resize, reflow, animation and zoom perfectly, for free, because it *is* the element.

**Only genuinely floating chrome lives OUTSIDE**, and the component that does it is explicit about why (`packages/block-editor/src/components/block-popover/README.md`):

> "These two components allow rendering editor UI by the block (in a popover) but outside the canvas. **This is important to avoid messing with the style and layout of the block list.**" — used for "the contextual block toolbar and the in-between block inserter."

So: the block toolbar and the in-between `+` inserter are outside; everything else that *can* be CSS is inside.

### 3.4 How the outside chrome stays glued — the sync technique

Gutenberg does **not** hand-roll a scroll-sync loop. It delegates to Floating UI, configured in `packages/components/src/popover/index.tsx`:

```js
whileElementsMounted: ( referenceParam, floatingParam, updateParam ) =>
    autoUpdate( referenceParam, floatingParam, updateParam, {
        layoutShift: false,
        animationFrame: true,
    } ),
```

`animationFrame: true` is a **rAF polling loop** — re-measure every frame while the popover is mounted. [Floating UI's own docs](https://floating-ui.com/docs/autoUpdate) warn that this "should be used sparingly," and that `autoUpdate` "can cause severe performance degradation" if run for many elements at once. Gutenberg accepts that cost because **at most one or two popovers are mounted at any instant** — the toolbar for the selected block, and maybe one inserter. The loop is O(1) in page size, not O(n) in blocks. That is the whole trick.

The cross-iframe offset is *not* hand-computed. [PR #46845](https://github.com/WordPress/gutenberg/pull/46845) deleted Gutenberg's custom iframe-offset/scaling math once Floating UI shipped cross-document support: a virtual anchor carries a `contextElement`, and Floating UI walks its `ownerDocument` / `defaultView` / `frameElement` to add the iframe's own offset and scale automatically. Gutenberg's `BlockPopover` supplies exactly that:

```js
return {
    getBoundingClientRect() { /* union of first+last block bounds */ },
    contextElement: selectedElement,
};
```

One extra refinement is worth stealing verbatim — the comment in `block-popover/index.js` explaining why a rAF loop *alone* is not enough when the anchor is itself animating:

> "`useMovingAnimation` writes the block's `transform` on every spring tick. Reacting synchronously to each mutation would race with Floating UI's own autoUpdate frame loop and cause the toolbar to visibly jump. Coalescing to one recompute per animation frame avoids that. The observer can't simply be removed: with autoUpdate's animationFrame mode alone, the toolbar trails the block by ~1 frame because the spring's rAF and autoUpdate's rAF are independently scheduled."

The fix is a `MutationObserver` on the anchor's attributes, coalesced to one recompute per rAF. **Two independent rAF loops observing each other trail by a frame; the mitigation is a single coalesced recompute, not a second loop.**

### 3.5 Device preview is a real resize

Gutenberg resizes the iframe *element* — width in CSS pixels, and a computed height. From `visual-editor/index.js`:

```js
const canvasHeight = shouldConstrainCanvasHeight
    ? getCanvasHeight( canvasWidth, containerSize )
    : '100%';
```

`getCanvasHeight` is documented as returning "the canvas height, keeping the aspect ratio of the available space without exceeding it," lerping toward a device-like `CANVAS_TARGET_ASPECT_RATIO` as the canvas narrows. So a narrow preview gets a genuinely device-shaped viewport — **both dimensions real**, not a transform, not a simulation. Media queries fire because the iframe is actually that wide; `vh` resolves because the iframe is actually that tall.

Gutenberg also treats the canvas iframe as the authority on "what viewport are we in." [PR #76889](https://github.com/WordPress/gutenberg/pull/76889) fixed the hidden-block badge, which "was measuring viewport width against the outer browser window instead of the canvas iframe," by reading the iframe's window via `useBlockElement(...).ownerDocument.defaultView`. The PR notes this "aligns the badge's viewport detection with what `use-block-props` and `block-list/block.js` already do" — i.e. reading the iframe's `defaultView` instead of the global `window` is the established house rule.

### 3.6 Crossing the boundary — events, drag and drop

`packages/block-editor/src/components/iframe/index.js` re-dispatches selected event types from the iframe document into the parent, and **translates mouse coordinates by the iframe's bounding rect**:

```js
// Check if the event is a MouseEvent generated within the iframe.
// If so, adjust the coordinates to be relative to the position of
// the iframe. This ensures that components such as Draggable
// receive coordinates relative to the window, instead of relative
// to the iframe. Without this, the Draggable event handler would
// result in components "jumping" position as soon as the user
// drags over the iframe.
if ( event instanceof frame.contentDocument.defaultView.MouseEvent ) {
    const rect = frame.getBoundingClientRect();
    init.clientX += rect.left;
    init.clientY += rect.top;
}
```

The doc comment names the exact event set: *"Bubbles some event types (keydown, keypress, and dragover) to parent document to ensure that the keyboard shortcuts and drag and drop work."* Note what is **not** in the list — `scroll`, `mousemove`, `pointermove`. Only discrete, low-frequency events are bridged.

There is also a `usePopoverScroll` hook whose sole job is to forward `wheel` events that land on an outside-the-iframe popover into the iframe's scroll container, so the page scrolls "through" the floating toolbar instead of stopping dead under the cursor. It uses `{ passive: true }` and caches the scroll container in a `WeakMap`. This is a real UX bug you *will* hit and it is not obvious in advance.

Finally, the article on the 7.1 migration names the failure mode that bites everyone: outside-click detection. "Clicks inside the canvas happen in the **iframe's** document. They never bubble to the admin document." Any dismiss-on-outside-click must listen on *both* documents.

---

## 4. Contrast set — the alternatives, and what they cost

### 4.1 Shopify theme editor — the storefront *is* the canvas

The preview is the real storefront page, rendered by the real theme, with the editor driving it from outside. Themes detect it via a global: **"the global variable `Shopify.designMode` will return `true` if you're in the theme editor, and `undefined` if not."** The editor then emits events **into the previewed document** — `shopify:section:load`, `shopify:section:unload`, `shopify:section:select`, `shopify:block:select` — which "bubble, and are not cancellable," and section HTML is "dynamically added, removed, or re-rendered directly onto the existing DOM, without reloading the entire page." **[docs]** [Integrate sections and blocks with the theme editor](https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks).

The lesson for Inflozo is the **event direction**: the editor pushes selection state *into* the preview document and lets the theme's own code react there. That is the same architectural instinct as chrome-inside-the-iframe. Shopify's docs do not state where the editor's own overlays are drawn, so that specific point is **not established** here.

### 4.2 Framer — not a viewport simulation at all, and it shows

Framer's canvas is an artboard, not a browser viewport. Its answer to `position: fixed` is to draw an explicit, user-draggable **"viewport line"** on the canvas: *"You can select a layer and set the position type to Fixed, after which you'll see a viewport line appear."* And critically: *"You can resize the viewport line, but it won't affect your published layout. Instead, it allows you control how it will appear on canvas."* **[docs]** [Framer Academy: Fixed and sticky positioning](https://www.framer.com/academy/lessons/framer-fundamentals-fixed-and-sticky-positioning); [Relative, fixed, and viewport sizing](https://www.framer.com/academy/lessons/framer-fundamentals-fixed-and-relative-sizing).

Read that carefully: because the canvas has no real viewport, Framer has to **invent one as an editor affordance** and then tell users it is cosmetic. Framer also restricts fixed positioning structurally — *"If your element is not directly nested on your main page, you won't be able to set it to a fixed position"* **[docs]** [Why can't I set an element to position Fixed?](https://www.framer.com/help/articles/why-can-t-i-set-an-element-to-position-fixed/) — a product constraint that exists to keep the artboard model coherent.

This is the cost of not having a real viewport, made visible: **an extra concept in the UI, a caveat users must be taught, and a restriction on what they may build.** Inflozo's brief explicitly says "must be good UX." Adding a "this line is not real" affordance is the opposite.

### 4.3 Plasmic — width-sized artboards, and the predictable complaint

Plasmic renders artboards in sandboxed iframes and sizes them by **width**, per breakpoint: artboards "auto-resize to more reasonable screen sizes for the given breakpoints, with only a single breakpoint activated in any artboard." **[docs]** [Responsive design with screen variants](https://docs.plasmic.app/learn/responsive-design/).

Height is not user-settable. The community thread [How to specify custom screen size (height)?](https://forum.plasmic.app/t/how-to-specify-custom-screen-size-height/2522) reports the height field greyed out. **[fwd]**

That is the identical gap to Webflow's (§1.3), reached from a different architecture, and it is the second independent instance of the same lesson: **width-only device preview is the default mistake in this product category.**

### 4.4 Not established

**Wix Editor / Wix Studio** and **Builder.io** were not researched to a citable standard within this pass. Neither is load-bearing: the geometry question is settled by Elementor and Gutenberg at source level, corroborated by Webflow behaviourally, and the chrome-placement question is settled by Elementor and Gutenberg agreeing. Should a second opinion be wanted later, Builder.io is the most useful of the two, because its editor loads the customer's *real* deployed site in an iframe and injects an SDK — the closest analogue to Inflozo rendering a real compiled Ghost theme.


## 5. The four platform mechanics that decide this

These are the load-bearing facts. They are why the industry converged, and three of them are stronger arguments than the ones in the original brief.

### 5.1 `position: fixed` and `100vh` — no contest

A fixed element positions against its nearest containing block, defaulting to the **viewport of its own document**. Inside a 20,000px-tall iframe, that viewport *is* 20,000px tall. A sticky/shrinking header would sit at the top of the document and never be seen again; a floating pill announcement bar would render 19,000px below the fold. `100vh` and `100dvh` resolve against the same 20,000px. There is no workaround short of rewriting the user's CSS, which defeats the entire purpose of a WYSIWYG canvas.

### 5.2 `position: sticky` — geometry (B) makes it structurally impossible

Sticky is resolved against the nearest **scrollport**. With geometry (B), the iframe document has no scrollport of its own — the scroll happens in the parent. The sticky element therefore has nothing to stick to and renders as `relative`. This is not a bug that can be patched; sticky's constraint rectangle is defined by the scroll container it lives in, and in (B) that container is in another document.

### 5.3 `IntersectionObserver` — subtler than "everything intersects at once"

The [IntersectionObserver spec](https://w3c.github.io/IntersectionObserver/) defines the implicit root (when `root` is `null`) as "the top-level browsing context's `document` node," and the intersection algorithm walks *up through* the iframe boundary:

> "If container is the `document` of a nested browsing context, **update intersectionRect by clipping to the viewport of the `document`**, and update container to be the browsing context container of container."

Read carefully, this says: the target is clipped by **its own document's viewport first**, then by each ancestor frame's, up to the top-level viewport.

- Under **(A)**, the iframe document's viewport *is* the visible canvas, and the iframe element is fully on screen, so the outer clips are no-ops. Animate-on-scroll, lazy-load and scroll-progress fire at **exactly** the same moment they will on the published site.
- Under **(B)**, the first clip — against a 20,000px viewport — is a no-op, and correctness depends entirely on the outer clip chain. It does not literally all fire at once *if* the outer scroller happens to be the window. But: `rootMargin` percentages resolve against the **root's** bounds, not the target's; `entry.rootBounds` reports the wrong rectangle; and any script using an explicit `root` (`document.documentElement`, or a scroll container inside the page) breaks outright. The common AOS idiom `rootMargin: '0px 0px -20% 0px'` silently mis-triggers.

So the honest statement is not "(B) makes everything intersect at once" — it is "**(B) makes IntersectionObserver correct only by accident, and wrong in the idioms real animate-on-scroll code actually uses.**" That is worse, because it fails quietly.

### 5.4 CSS anchor positioning does not cross an iframe — rule it out now

It is tempting to hope `anchor-name` / `position-anchor` removes the need for a sync loop entirely. It does not. The [CSS Anchor Positioning spec](https://drafts.csswg.org/css-anchor-position-1/) requires an acceptable anchor element to be "laid out strictly before the positioned element" — i.e. to participate in the same box tree. The spec goes out of its way to accommodate **shadow trees** ("elements in different shadow trees can still anchor to each other") and says nothing equivalent for nested browsing contexts, because an iframe's contents are a separate document with a separate box tree. **Anchor positioning is a great reason to put chrome inside the iframe. It is not a way to position chrome outside one.**

---

## 6. Answering the question directly: is "chrome outside, positioned from measured rects" what these products do?

**Partly — and the part they do differently is the part that matters.**

The naive model in the brief is: *all* chrome lives outside, *all* of it is positioned from `getBoundingClientRect()`, and therefore geometry (A) requires a per-frame loop over every visible chrome element. Under that model, (A)'s cost really would be alarming, and (B) would look tempting.

That is not what they do. They **partition chrome by whether it can be expressed as CSS on the target element**:

| Chrome | Where it lives | Cost per scroll frame |
|---|---|---|
| Selection outline / ring | **Inside** — `::after` on the element | zero |
| Hover outline | **Inside** — `::after` on the element | zero |
| Drop indicator / insertion line | **Inside** — an injected element in flow | zero |
| Element label / badge | **Inside** — absolutely positioned relative to the element | zero |
| Spacing (padding/margin) handles | **Inside** — overlay in the element's coordinate space | zero |
| Floating text toolbar | **Outside** — popover, rAF-tracked | one rect/frame |
| In-between `+` inserter | **Outside** — popover, rAF-tracked | one rect/frame |
| Sidebar / panels | **Outside** — not anchored to anything | zero |

Everything in the "inside" rows scrolls for free because it is part of the scrolled content. The per-frame measurement cost is not O(number of chrome elements) — it is **O(number of mounted popovers), which is one or two**. This is why the 60fps budget is comfortably met in practice, and it is the thing to copy.

The two techniques that make the "outside" rows cheap:

1. **A single rAF-driven position loop, mounted only while the popover is open** (Floating UI `autoUpdate({ animationFrame: true })`), not a global scroll listener. Scroll listeners on an iframe's internal scroll are also awkward to reach from the parent; the rAF loop sidesteps the boundary entirely.
2. **Delegating the cross-document offset to the library** via a virtual anchor carrying `contextElement`, so the iframe's own offset and scale are handled by code that is already tested against browser quirks.

**The smarter thing they do, stated in one line: they move as much chrome as possible into the iframe so it needs no positioning at all, and they only pay per-frame for the one or two popovers that genuinely cannot live there.**

---

## 7. Recommendation for Inflozo

### 7.1 Geometry — (A), viewport-sized iframe, scrolls internally. Not negotiable.

The canvas iframe is sized to the visible canvas area and the page scrolls **inside** it. `iframeEl.style.height` tracks the available canvas region, never the document height.

Inflozo's own feature list decides this on its own, before any competitive evidence: the site-wide header has a **sticky / sticky-shrink** option, and the catalogue includes **floating pill announcement bars, transparent overlay headers, back-to-top rails, share rails, scroll-progress bars and animate-on-scroll effects** across 20+ variants in 15 categories. Every one of those is viewport-relative. Under geometry (B) they are not merely degraded — `sticky` renders as `relative` (§5.2) and `fixed` renders 19,000px below the fold (§5.1). A builder whose flagship header option is visibly broken on its own canvas has no WYSIWYG claim left, and PRD §7.3's entire single-source thesis is "canvas and shipped markup agree **by construction**." Geometry (B) breaks that agreement at the CSS layer, where no renderer parity can repair it.

### 7.2 Where the chrome lives — amend PRD §7.3

**PRD §7.3 currently states:** *"Editing chrome — outlines, handles, the insertion '+', the floating mark toolbar, the Controls sidebar — sits **outside** the iframe, positioned over it from measured rects."*

**This should be amended.** It is the naive model of §6, and it is what makes geometry (A) look expensive. The correct rule is a partition:

**Inside the iframe (CSS only, zero JS, zero measurement):**
- Selection outline, hover outline, focus ring — **`::after` pseudo-elements**, driven by a `data-inflozo-selected` / `data-inflozo-hover` attribute on the section root.
- Element label / badge — absolutely positioned against the section root.
- Insertion line / drop indicator — an element in flow between sections.
- Spacing and drag affordances that belong to a section's own coordinate space.

This fits Inflozo's existing architecture better than it fits Gutenberg's. PRD §7.3 already mandates that **every control writes to a `data-{control}` attribute on the section root and the stylesheet selects on it** — chrome-as-CSS is *the same mechanism*, applied to editor state instead of control state. One editor-only stylesheet, injected into the canvas document, never compiled into the theme.

Critically, **`::after` pseudo-elements add no DOM nodes**. They cannot perturb layout, cannot appear in `outerHTML`, and therefore cannot threaten §7.3's byte-comparable-markup guarantee the way injected overlay `<div>`s would. This is a strictly better fit than overlays even ignoring performance.

**Outside the iframe (positioned, rAF-tracked):**
- The **floating mark toolbar** (FR-D4's bold/italic/underline/link) — it must escape the section's overflow and stacking context, and it must be operable while the iframe holds a text selection.
- The **insertion `+` popover**, if it needs to escape overflow. If it does not, put it inside.
- Any dropdown or picker spawned from the toolbar (the Link Picker).

**Outside, but anchored to nothing:** the Controls sidebar, top bar, layers panel. These never needed positioning and are not part of this problem.

Net: **the per-frame measurement cost is one or two rectangles, not 20+.**

### 7.3 Sync technique and performance characteristics

**Use Floating UI (`@floating-ui/dom`), not a hand-rolled scroll-sync loop.** Configure exactly as Gutenberg does:

```js
autoUpdate(reference, floating, update, { layoutShift: false, animationFrame: true })
```

- **Mount the loop only while a popover is open.** This is the whole performance story. An idle canvas — the overwhelmingly common state, including all scrolling-to-look-around — runs **zero** positioning work. The 60fps / no-long-task-over-50ms budget is met by *not running a loop*, not by optimising one.
- **Pass a virtual anchor with `contextElement` set to the in-iframe element.** Floating UI then resolves the iframe's offset and scale itself via `ownerDocument` / `defaultView` / `frameElement` — the cross-document support that let Gutenberg delete its custom math in [PR #46845](https://github.com/WordPress/gutenberg/pull/46845). Do not hand-compute `frameElement.getBoundingClientRect()` offsets; that is the code everyone writes first and deletes later.
- **Same-origin is already decided** (PRD §7.3) and makes this trivial: synchronous rect reads, no `postMessage` protocol, one shared Floating UI instance serving both documents. This is the point at which the same-origin decision pays for itself.
- **`ResizeObserver` on the canvas container** to re-set the iframe element's height on window/panel resize. That is a discrete event, not a per-frame concern.
- **If the anchor itself animates** (a section reorder spring, a variant shuffle), add Gutenberg's mitigation: a `MutationObserver` on the anchor's attributes, coalesced to **one** recompute per rAF. Two independently scheduled rAF loops trail each other by a frame (§3.4). Do not add a second loop.
- **Do not** reach for `IntersectionObserver` or a `scroll` listener as the sync mechanism. The iframe's internal scroll is awkward to observe from the parent, and `IntersectionObserver` answers "is it visible," not "where is it" — the wrong question.
- **Do not** reach for CSS anchor positioning. It cannot cross the iframe boundary (§5.4).

**Budget check.** One `getBoundingClientRect()` per frame on a single anchor is sub-microsecond and forces at most one style/layout flush that the frame was going to do anyway. The realistic risk to the 50ms long-task budget is not the sync loop — it is **section re-render on control change**, which PRD §7.3 already solves with single-attribute writes. Measure that, not this.

### 7.4 Device preview (FR-D8: Desktop / Tablet 834 / Mobile 390)

**Resize the iframe element for real. Both dimensions. Never a CSS transform.**

Set `width: 390px` on the iframe *element* and let the iframe document's viewport genuinely become 390px. Media queries fire because the viewport is that width; `vw` resolves because it is that width. A `transform: scale()` or a zoomed-out wrapper does **none** of this — the viewport stays desktop-sized and every responsive behaviour lies.

**Set a real height too.** This is the step that is usually skipped and it is why mobile previews feel wrong. Follow Gutenberg's `getCanvasHeight` pattern (§3.5): give the narrowed canvas a device-plausible aspect ratio, clamped to the available container height. Without it, a 390px-wide canvas that is 1,200px tall makes `100vh` heroes and `100dvh` layouts render at a height no phone has, and the user checking responsiveness — the *only* reason the mode exists — is shown a fiction.

Where the container is too short to give Mobile a plausible height, letterbox it (centre it with padding) rather than stretching it. A 390 × 780 canvas floating in grey is honest; a 390 × 1400 canvas is not.

**House rule, borrowed from Gutenberg [PR #76889](https://github.com/WordPress/gutenberg/pull/76889):** any editor code that asks "what viewport are we in" must read the **iframe's** `defaultView`, via `element.ownerDocument.defaultView`, never the global `window`. Gutenberg shipped a user-visible bug precisely by getting this wrong once. Make it a lint rule.

### 7.5 Gotchas — the ones that will actually cost days

1. **Outside-click dismissal breaks silently.** Clicks inside the canvas occur in the iframe's document and never bubble to the parent. Every dismiss-on-outside-click handler must listen on **both** documents. This is the single most commonly reported iframe-editor regression.

2. **Scrolling stops dead under the floating toolbar.** A wheel event over an outside-the-iframe popover scrolls the parent (or nothing) instead of the canvas. Port Gutenberg's `usePopoverScroll`: a `{ passive: true }` `wheel` listener on the popover that forwards `deltaX/deltaY` to the iframe's scroll container, skipped when the event target has its own scrollable ancestor. Users will not report this as a bug; they will just find the editor unpleasant.

3. **Drag-and-drop across the boundary needs coordinate translation.** Re-dispatch `dragover` (and `keydown`/`keypress` for shortcuts) from the iframe document to the parent, adding `frame.getBoundingClientRect().left/top` to `clientX/clientY` — Gutenberg's `bubbleEvent` (§3.6), which explicitly exists to stop dragged components "jumping position as soon as the user drags over the iframe." Bridge **only** discrete events; never bridge `scroll`, `mousemove` or `pointermove`.

4. **Two documents, two selections.** PRD §7.3 already flags the focus model as an open UX deliverable and NFR-5 requires keyboard completeness across the boundary. Two concrete constraints for that pass: the mark toolbar must not steal focus from the iframe's `contenteditable` (use `mousedown` → `preventDefault`, act on `mouseup`, or keep the toolbar's buttons unfocusable), because taking focus collapses the very selection the toolbar acts on. And `document.activeElement` in the parent reads `<iframe>` while the real caret is in the iframe's own `activeElement` — every focus assertion must be written against the correct document.

5. **In-page anchor links navigate the frame away.** A click on `href="#pricing"` inside the canvas resolves against the iframe's URL and can navigate it off the canvas entirely. Intercept and set `location.hash` manually (Gutenberg does exactly this). Relevant to Inflozo: back-to-top rails and any nav variant with in-page anchors.

6. **Dropped files nuke the canvas.** A file dropped outside a dropzone makes the iframe navigate to it. `preventDefault` on the iframe document's `drop`.

7. **`pointer-events` on outside chrome.** Anything overlaying the canvas that is not itself interactive must be `pointer-events: none`, or it swallows clicks meant for the page. This risk mostly evaporates under §7.2 — chrome that lives inside the iframe as `::after` is already non-interactive by construction, which is a further argument for the partition.

### 7.6 What this changes in the PRD

- **§7.3, "Focus model across the canvas iframe boundary"** — amend the opening sentence. Replace the blanket "chrome … sits **outside** the iframe, positioned over it from measured rects" with the §7.2 partition. Outlines, badges and insertion indicators sit **inside**, as CSS; the floating mark toolbar and its pickers sit **outside**, rAF-tracked. The rest of the paragraph stands.
- **§7.3** — add the geometry statement: the canvas iframe is **viewport-sized and scrolls internally**, because the section catalogue's sticky, fixed and viewport-unit behaviours are only correct under that geometry.
- **FR-D8** — strengthen "display only" to require a **real iframe resize in both dimensions**, not a scaled simulation, and note the device-plausible height rule.
- **NFR-5** — no change needed; §7.5 item 4 supplies the concrete constraints for the UX pass it already anticipates.

---


## 8. Sources

**Method note.** Claims about Gutenberg are verified against source at `WordPress/gutenberg@trunk` (fetched 2026-08-18), not against secondary summaries; file paths and code quotations are verbatim. Claims about Webflow and Elementor are marked with their evidence class: **[docs]** vendor documentation, **[src]** product source, **[obs]** observed/reverse-engineered DOM, **[fwd]** vendor-staff or community forum statement. Where no evidence was found, the text says so rather than inferring.

### Specifications
- IntersectionObserver — implicit root and cross-document clipping: https://w3c.github.io/IntersectionObserver/
- CSS Anchor Positioning Level 1 — acceptable anchor elements, tree scope: https://drafts.csswg.org/css-anchor-position-1/
- MDN, `anchor-name`: https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name

### WordPress Gutenberg
- Issue #20797, "Consider iframing the editor canvas/content" (the founding rationale): https://github.com/WordPress/gutenberg/issues/20797
- Make WordPress Core, "Blocks in an iframed (template) editor" (2021-06-29): https://make.wordpress.org/core/2021/06/29/blocks-in-an-iframed-template-editor/
- Make WordPress Core, "Preparing the Post Editor for Full iframe Integration" (2025-11-12): https://make.wordpress.org/core/2025/11/12/preparing-the-post-editor-for-full-iframe-integration/
- Gutenberg Times, "The post editor is going full iframe" (WP 7.1): https://gutenbergtimes.com/the-post-editor-is-going-full-iframe-what-block-developers-need-to-know-before-wordpress-7-1/
- Block Migration for iframe Editor Compatibility (handbook): https://developer.wordpress.org/block-editor/reference-guides/block-api/block-api-versions/block-migration-for-iframe-editor-compatibility/
- PR #46845, Popover → floating-ui cross-document support, custom iframe-offset fix removed: https://github.com/WordPress/gutenberg/pull/46845
- PR #42950, iframe offset as custom middleware: https://github.com/WordPress/gutenberg/pull/42950
- PR #76889, viewport detection must read the canvas iframe, not the browser window: https://github.com/WordPress/gutenberg/pull/76889
- `BlockPopover` README — "outside the canvas … to avoid messing with the style and layout of the block list": https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/block-popover/README.md

**Source files read directly (`trunk`, 2026-08-18):**

| Path | What it proves |
|---|---|
| `packages/block-editor/src/components/iframe/index.js` | `bubbleEvent` coordinate translation; the bridged event set (`keydown`, `keypress`, `dragover`); iframe boot CSS `html{height:auto!important;min-height:100%}`; link-fragment interception; file-drop prevention; focus-capture elements |
| `packages/block-editor/src/components/iframe/use-scale-canvas.js` | `iframeDocument.documentElement.scrollTop`, `maxScrollTop = scrollHeight - containerHeight` — **the iframe scrolls internally** |
| `packages/block-editor/src/components/iframe/content.scss` | zoom-out scaling and scroll-position preservation |
| `packages/block-editor/src/components/block-list/content.scss` | selection/hover/highlight outlines are `::after` pseudo-elements **inside** the iframe |
| `packages/block-editor/src/components/block-popover/index.js` | virtual anchor with `contextElement`; MutationObserver coalesced to one rAF recompute, with the verbatim rationale |
| `packages/block-editor/src/components/block-popover/use-popover-scroll.js` | forwarding `wheel` through outside chrome into the iframe's scroll container |
| `packages/components/src/popover/index.tsx` | `autoUpdate(..., { layoutShift: false, animationFrame: true })` |
| `packages/editor/src/components/visual-editor/index.js` | `getCanvasHeight` device-aspect-ratio sizing; `min-height:100vh` injected into the canvas |

### Floating UI
- `autoUpdate` options and performance warnings (`animationFrame` "should be used sparingly"; `autoUpdate` "can cause severe performance degradation"): https://floating-ui.com/docs/autoUpdate

### Webflow (closed source — behavioural and documentary evidence)
- Wishlist WEBFLOW-I-103, "Ability to adjust height of the Designer Canvas for smaller breakpoints" ("the **height** of the editor and preview is as tall as my browser window"): https://wishlist.webflow.com/ideas/WEBFLOW-I-103
- Wishlist WEBFLOW-I-19, "Canvas and Preview Mode for touch-based mobile breakpoints should be more accurate" — 119 votes, open since Jan 2017, "you can adjust the width, but you should be able to adjust the height as well": https://wishlist.webflow.com/ideas/WEBFLOW-I-19
- Forum, "Navbar fixed in designer mode, but not fixed in preview or published mode": https://discourse.webflow.com/t/navbar-fixed-in-designer-mode-but-not-fixed-in-preview-or-published-mode/44752
- Forum, "My Nav Bar is fixed in Design mode but isn't actually working": https://discourse.webflow.com/t/my-nav-bar-is-fixed-in-design-mode-but-isnt-actually-working/220642
- Webflow canvas overview (Preview mode vs canvas): https://help.webflow.com/hc/en-us/articles/33961319255059-Webflow-canvas-overview
- CSS position properties: https://help.webflow.com/hc/en-us/articles/33961228002963-CSS-position-properties
- Designer Extensions — the **app panel** iframe, distinct from the canvas: https://developers.webflow.com/apps/docs/designer-extensions
- "Powering Webflow Apps: How we built Designer APIs — Part 1": https://webflow.com/blog/designer-apis-part-1

### Elementor
Source read directly at `elementor/elementor@main` (fetched 2026-08-18):

| Path | What it proves |
|---|---|
| `assets/dev/scss/editor/_wrapper.scss` | `#elementor-editor-wrapper { height: 100vh }`, `body { overflow: hidden }` — the shell never scrolls |
| `assets/dev/scss/editor/_devices.scss` | `#elementor-preview { height:100%; overflow-y:hidden }` → wrapper `height:100%` → `#elementor-preview-iframe { width:100%; height:100% }` — **geometry (A)**; device mode sets `--e-editor-preview-width` **and** `--e-editor-preview-height`; `transform: scale(--e-preview-scale)` on the wrapper, outside the iframe |
| `assets/dev/js/editor/regions/responsive-bar/view.js` | separate width/height inputs, scale +/−/reset, `autoScale()` fit logic |
| `includes/preview.php` | editor assets enqueued **into the preview document** on `wp_enqueue_scripts`; `editor-preview` stylesheet; `elementor/preview/enqueue_styles` / `_scripts` hooks |
| `assets/dev/scss/editor/preview/_widget.scss` | `.elementor-editor-widget-settings` positioned against the widget itself, inside the iframe |
| `assets/dev/scss/editor/preview/_add-new.scss` | `.elementor-add-section` is in-flow inside the preview document, with `all: initial` "Avoid theme conflicts." |
| `assets/dev/scss/editor/preview/_inline-editor.scss` | inline text editing happens inside the preview document |

Repo: https://github.com/elementor/elementor

### Framer
- Framer Academy, "Fixed and sticky positioning" (the "viewport line"): https://www.framer.com/academy/lessons/framer-fundamentals-fixed-and-sticky-positioning
- Framer Academy, "Relative, fixed, and viewport sizing": https://www.framer.com/academy/lessons/framer-fundamentals-fixed-and-relative-sizing
- Framer Help, "Why can't I set an element to position Fixed?": https://www.framer.com/help/articles/why-can-t-i-set-an-element-to-position-fixed/

### Contrast set
- Plasmic, responsive design / screen variants (artboards sized by width; breakpoints activate per artboard): https://docs.plasmic.app/learn/responsive-design/
- Plasmic community, "How to specify custom screen size (height)?" — artboard height is not user-settable: https://forum.plasmic.app/t/how-to-specify-custom-screen-size-height/2522
- Plasmic, new simplified canvas / Design Mode multi-artboard: https://plasmic.substack.com/p/introducing-new-simplified-canvas
- Shopify, the theme editor: https://shopify.dev/docs/storefronts/themes/tools/online-editor
- Shopify, integrate sections and blocks with the theme editor (`Shopify.designMode`, editor events): https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks
- Shopify, theme editor preview inspector best practices (`Shopify.inspectMode`): https://shopify.dev/docs/themes/best-practices/theme-editor-preview-inspector

### Inflozo internal
- `prd.md` §7.3 (single-source section runtime; focus model across the canvas iframe boundary; same-origin decision), FR-D4, FR-D8, NFR-3, NFR-5.

---

## Addendum — Webflow established at source level (closes the "not established" gap above)

The main body flagged two items as unverified: whether Webflow's canvas is technically an `<iframe>`, and where Webflow draws selection chrome. The first is now settled; the second remains open.

**The canvas is a separate browsing context with its own origin.** Webflow's custom-code preview doc states the site renders on `{shortName}.canvas.webflow.com` and ships sample code testing `window.location.hostname.includes('canvas.webflow.com')` — a check only meaningful from inside the rendered site, whose hostname is therefore not `webflow.com` (the Designer's origin). Webflow also injects a `.wf-design-mode` class onto the canvas document, which users target from their own CSS. Note that "iframe" in Webflow's developer docs usually refers to the *Designer Extension panel*, a different frame.

**Viewport-sized, scrolling internally — confirmed behaviourally.** "The canvas scrolls top to bottom by default." `position: fixed` genuinely pins during canvas scroll and `position: sticky` works live at design time; both are impossible under a full-document-height iframe with outer scrolling. Canvas frame height is the browser window height.

**`100vh` resolves against the canvas frame, never a device.** Documented by a long user complaint trail (WEBFLOW-I-2424, I-103, I-2933).

**Breakpoint width is a genuine viewport width** — media queries and `vw` resolve correctly because the frame really is that wide. When the requested width exceeds the physical display, Webflow applies a visual scale factor *on top* rather than narrowing the viewport. Webflow's breakpoints are 991 / 767 / **479** (not 390), plus optional 1280 / 1440 / 1920.

**Height is not simulated at all.** "Frame height resize isn't in this release." Requested since 2017 (WEBFLOW-I-19, 119 votes); the only workaround was a third-party tool that broke and was never fixed. This is the single clearest reason to follow Elementor rather than Webflow on device preview.

**Canvas scroll lag is a distinct, long-lived Webflow complaint** — users report smooth object editing but jittery scrolling specifically. Independent support for keeping chrome inside the iframe instead of syncing overlays per scroll frame.

**Where Webflow draws selection chrome: still not established.** No DevTools write-up or staff statement found. One asymmetry, offered as a hint and not evidence: X-ray mode recolors the *site's own* rendering, achievable only by injecting a stylesheet into the canvas document, while selection labels read as app chrome — suggesting the same inside/outside split recommended here. Unverified.

**Also not live on Webflow's canvas** (all JS-driven): Interactions/animations, `<script>` in embeds, and site/page-level custom code. HTML and CSS in embeds *do* render. This is a useful precedent for Inflozo's own canvas-vs-live behaviour question in D7.

---

## Addendum 2 — Elementor at source level, and a correction to the chrome recommendation

Evidence base: shipped plugin `elementor 4.2.2` cross-checked against `main`. Compiled bundles carry webpack source-path comments, so the paths below are real repo paths.

### Geometry: confirmed, unambiguously

`#elementor-editor-wrapper { height: 100vh }` → `#elementor-preview { height: 100% }` → `#elementor-preview-iframe { width:100%; height:100% }`, with editor `body { overflow: hidden }` so the parent has nothing to scroll. `grep` for any JS setting the iframe height from content returns **zero hits** — there is no iframe-resizer pattern. Programmatic scrolling targets `elementor.$previewContents.find('html, body')`, i.e. inside the preview document. Geometry ① confirmed.

### Sticky and motion effects ARE live on the canvas

No Elementor doc states it either way, but the code and issue tracker settle it. Frontend JS runs *inside* the preview iframe and branches on `isEditMode()` rather than being skipped (PR #28398 fixes sticky specifically *in the editor*). Issue #2208 — "Sticky Menu Hides Section Editor Buttons" — is a sticky header sticking on the canvas and covering Elementor's own handles, answered by staff with CSS scoped to a class on the **iframe body**.

### `100vh` carries a systematic, knowable offset

| Mode | `100vh` inside preview |
|---|---|
| Editor v1, desktop | = browser `100vh` |
| **Editor v2/v4, desktop** | **= browser `100vh` − 48px** (`--editor-v2-top-bar-height`) |
| Any device mode | = the simulated device height |

So in the current editor a `100vh` hero is systematically 48px shorter on canvas than live. **Directly relevant to Inflozo:** any chrome that reduces the canvas iframe's height introduces exactly this class of error, and it is invisible to a markup-level fidelity test.

### Device preview: two independent layers

1. **Real resize.** `--e-editor-preview-width` *and* `--e-editor-preview-height` are written as real box dimensions on the wrapper; the iframe is `100%/100%` of it, so the iframe element genuinely resizes → real relayout → real media-query evaluation. The responsive bar exposes **both** width and height inputs, validated against breakpoint bounds.
2. **Cosmetic zoom.** A separate `transform: scale(var(--e-preview-scale))` (50–200%, plus auto-shrink-to-fit) on the wrapper. It does **not** change the CSS pixel viewport, so it never affects which breakpoint fires.

This two-layer split is the model to copy.

### CORRECTION — chrome placement is not settled, and Elementor changed its mind

Addendum 1 and the main body recommended putting outlines and badges *inside* the iframe on the strength of Elementor + Gutenberg. Elementor's classic editor does exactly that, provably: `Preview::enqueue_styles()` enqueues `editor-preview.css` into the preview document; every chrome selector (`.elementor-element-overlay`, `.elementor-editor-element-settings`, `.elementor-add-section*`) appears **only** in that stylesheet and never in the parent's `editor.css`; overlay DOM is built with the iframe's own jQuery via `elementorFrontend.elements.window.jQuery(...)`; and there is **no scroll-sync code at all**, because overlays scroll natively with content.

**But Elementor v4 "Atomic" — the current React editor — moved chrome OUTSIDE.** `outline-overlay.tsx` renders into a `FloatingPortal` targeting `elementor-preview-responsive-wrapper` (the parent's div, a sibling of the iframe), anchored to nodes *inside* the iframe via `@floating-ui/react` `useFloating({ whileElementsMounted: autoUpdate })`, fed by `use-element-rect.ts`: `getBoundingClientRect()` throttled to 20ms, with `scroll` listened on the **iframe's** window plus `ResizeObserver` and `MutationObserver`. 14 `FloatingPortal` uses, all in the parent document.

So both approaches ship in the same plugin today. The tradeoff is real and symmetric:

- **Inside** — free during scroll, no measurement, but exposed to the site's own CSS. Elementor hit this precisely (#2208: a sticky header covering the editor's handles, patched with a `padding-top` hack).
- **Outside** — immune to site CSS, but pays per-frame rect work. **Shopify documents the failure mode explicitly**, telling theme authors to *disable fixed-position and sticky elements while the preview inspector is active*, because its outlines are drawn from `getBoundingClientRect()` coordinates.

Given Inflozo ships 20+ sticky/fixed variants across 15 categories — including a control on the site-wide header — *both* hazards are live. The resolution is not "inside vs outside" but **which chrome**: outlines and badges drawn as `::after` pseudo-elements on the element itself inherit that element's own stacking and transform, so a sticky header's outline sticks *with it* for free and no rect math can desynchronise. Only the floating mark toolbar — one popover, open rarely — justifies the outside/floating-ui path.

### Same-origin: strongly validated, with a forward-looking risk

Elementor uses **zero `postMessage`** between editor and preview (`grep -c postMessage` → 0 in `editor.js`, `frontend.js`, `app.js`). The windows swap object graphs directly: `window.elementorFrontend = frontendWindow.elementorFrontend; frontendWindow.elementor = this;`.

The forward risk worth recording: as of 4.1.0 Elementor ships `Document-Isolation-Policy: isolate-and-credentialless` on **both** documents, explicitly so they join the same agent cluster and "synchronous DOM access between them keeps working" once cross-origin isolation features (SharedArrayBuffer, WP's client-side media processing) are in play. Inflozo's same-origin coupling could face the same pressure; the mitigation is a known header, not a redesign.

### Cross-editor contrast

- **Shopify** — cross-origin iframe of the real storefront, rect-measured overlays, `Shopify.designMode` flag, and the documented sticky/fixed warning above.
- **Builder.io** — cross-origin iframe + a documented `postMessage` protocol; the SDK injects only addressing metadata (`builder-id`, `builder-path`) and draws no overlays itself.
- **Framer / Wix** — canvas architecture not publicly documented. Wix Studio's stage is a single *synthetic* viewport the author sizes, one breakpoint at a time; classic Wix cannot do viewport-height sections at all, and ships an opt-in "scroll to preview" toggle, implying scroll behaviour is otherwise not live on the stage.

The pattern: the three cross-origin editors need `postMessage` and lean on rect measurement; the one same-origin editor (Elementor) needed neither for a decade.
