# Epic 4 Context: Section Runtime Platform

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change.

     HOW THIS FILE GROWS (the rule Epic 3 learned the hard way, DW-73): the bullet is the REQUIREMENT
     and it stays one or two sentences. Everything a story settles goes in an INDENTED SUB-BULLET
     under it, led in bold by the story or ruling that decided it. Append a sub-bullet; never lengthen
     the lead. -->

## Goal

Build the machine every design in the library is authored against — **before a single design is authored**. One annotated-HTML source feeding two emitters (canvas DOM and `.hbs` text) proven to agree node by node; the Ghost helper shim and its contract tests; the schema-driven controls engine; the binding matrix and empty-value guards; the Orbit Weekly dataset and its three fixtures; `core` and the behaviour-module registry; the Baseline floor and its enforcement tools; the string-catalog format; five pilot sections; and the render matrix with the accessibility scan riding on it. **`core`, the module registry, the Baseline tooling and the string-catalog format are platform work, not per-section work** — every stylesheet and every chrome string is authored against them, so they cannot arrive later. Exit: the five pilots render editor-perfect on canvas in light and dark, their compiled `.hbs` snapshots are committed and diffing per-commit, and the fixture set ships. **"Compiles byte-identical" is deliberately not an exit criterion here** — the compiler is Epic 7's, and that claim belongs to the E4/E7 joint gate.

## Stories

- Story 4.1: The registry format and the annotated-HTML authoring vocabulary
- Story 4.2: The section runtime — one source, two emitters, proven to agree
- Story 4.3: The Ghost helper shim, and its contract tests against recorded real-Ghost output
- Story 4.4: Orbit Weekly and the three fixtures
- Story 4.5: The controls engine and the control vocabulary
- Story 4.6: Context-aware binding and empty-value guards
- Story 4.7: `core` and the behaviour-module registry
- Story 4.8: The Baseline floor and the three tools that enforce it
- Story 4.9: The string catalog — keys, English defaults and the `{{t}}` contract
- Story 4.10: The five pilot sections, editor-perfect, with the snapshot harness
- Story 4.11: The render matrix and the accessibility scan that runs on it

## Requirements & Constraints

- **The registry entry is the contract every design is written against** — identity, tier, binding context, compile target, content and control schemas, quick controls, markup, stylesheet, optional module, data bindings, Ghost compatibility, dark capabilities, preview seed. `contentSchema` is the **category's union**; `controlSchema` and `quickControls[]` are **per design**. Identity is `{categoryId}/{n}`, stable forever, and both schemas are generated from one authored source, never hand-maintained twice.
  - **R-102 (owner, 2026-09-11) — a content prop never crosses a category boundary.** The category's
    union is the widest a prop ever reaches: two categories that both want a signup heading each carry
    their own, and a customer who wants the same words in both types them twice. There is no shared
    prop, no shared namespace and no cross-category carry, so editing a footer can never rewrite a
    section on another page. It closes `reconcile-designs.md`'s three FR-G3 asks on `email*` and
    `newsletter*`, which stood marked "no owner; needs one".
  - **Story 4.1 — a registry entry is ASSEMBLED, not authored in one file.** It comes from the design's
    directory path, its `design.json`, its category's `content.json` and the four files; AD-2's
    `design.json` field list and FR-G3's entry list are different sets, and nothing said so before.
- **`bindingContext` has no `page` value** — a page and a post are the same resource; what differs is the product, expressed through `compileTarget`. **`compileTarget` is a refusal, not a hint:** `any` is withdrawn wherever it was a lie, a design emitting pagination is restricted to paginated targets, a `{{#get}}`-performing design excludes the error and private templates, and the compiler refuses an illegal placement. `quickControls[]` is recovered **mechanically** as the first 3–5 entries of the design's own control list — from the design level, never the category's union.
  - **Story 4.3 + Q1 ruled (owner, 2026-09-12) — Ghost gives a theme no row of clickable page
    numbers.** `data-pagination="numbers"` is a plain "2 / 3" indicator and the reference design was
    changed to that form; whether anything richer is reachable is DW-97, open to Story 4.10.
- **Section source is annotated HTML, not Handlebars**, and its directive vocabulary is a documented, shipped deliverable. `css` is plain CSS consuming Style Pack custom properties only, authored outside the app's build pipeline and **explicitly excluded from any Tailwind processing** — utility classes are structurally incompatible with token-only styling. `contentSchema` declares which inline binding tokens each prop accepts; **anything else in braces stays literal text** — an allow-list by construction, never a general substitution pass.
- **The control vocabulary is closed and visual:** Segmented Control, Stepper, Toggle, Named Select, Swatch Row (pack roles, never a colour picker), Image Picker, Icon Picker (Tabler, inline SVG once per use, licence text shipped in the theme), Link Picker, Text Field/Area, Date Picker, Item List. **No units, no hex, no CSS concepts at section level**, and width is never a per-section control. Item List is offered only where the user **authored** the array; a Ghost-bound repeat gets a count instead, because an Add button there would be a lie. The ≈ 15 visible-control cap governs **a single design**, not the category's union; the three universal controls (Background role, Vertical spacing, Top divider) are declared once and exempt. A design may offer **fewer values** of a universal control and must say why — renaming, inventing and an `Inherit` value are all refused.
  - **R-103 (owner, 2026-09-13) — Background role keeps its five roles; there is no "None".** A design
    whose look is what is behind it locks the row with no value marked and its own sentence, as A1·4 is
    drawn, and its root carries no `data-bg`; A28's 10 Slim is built that way. "None" would look like Base
    for a section in the normal stack, but not for what sits over something else — A1·4 over the hero,
    pinned and floating bars and cards, A6·13 over the footer — and none of those takes its see-through
    look from the row: each is locked, keeps its own ground, or has its own control.
  - **R-104 (owner, 2026-09-13) — the icon picker offers every Tabler icon, outline and filled, grouped by
    Tabler's own categories**, with Outline · Filled · Both deciding which styles show. No curated subset;
    the nine-platform rule stays with the social-link rows that read Ghost's nine fields.
  - **Story 4.5 (2026-09-13) — the vocabulary is data and one engine reads it.** `packages/library/src/vocabulary.ts`
    declares the control types, the universal trio in full and the content prop types, and
    `packages/section-runtime/src/controls.ts` computes the sidebar, the edits and `resolveControls` — the
    only values either emitter stamps — so the validator, the panel and both emitters take one declaration (FR-F7).
  - **Story 4.5 — controls are closed-valued; content props are the other half.** The content editors (text,
    link record, asset id, Tabler icon name, `YYYY-MM-DD` date, item list) have value shapes of their own,
    and `docs/section-authoring.md` §2 is the authoring contract for both halves, the no-value lock and the
    category control union (`categoryControlUnion`, R-53) included.
- **Binding is prevention, not warning.** Only bindings valid in the current template's render context are ever presented; there is no path by which a user can construct an invalid one. The matrix is keyed on template, scope (top level vs inside a repeat) and connected Ghost version, so fields introduced after a target's version are not offered for that site. Moving or duplicating a section re-validates every binding before the move completes. Ghost compiles without strict mode — an out-of-context binding renders empty with no error at build, deploy or runtime, so the editor is the only place this defect can be caught.
  - **Story 4.6 (2026-09-14) — the matrix is data, and it was recorded, not transcribed.**
    `packages/library/contexts/matrix.json` is FR-H7's one copy, read through `bindable` and `offerBindings`
    (`packages/library/src/contexts.ts`) and proved by `contexts.test.ts` against what T1 and T3 printed and
    Ghost's own source (`python3 tools/probe/record-contexts.py`, MEASUREMENTS §41); a field no recording can
    show is named `unverified`. The recording corrected the appendix: `meta_title`/`meta_description` inside a
    resource are the page-meta helper, `page` is no field, `@site.admin_url` is 6.22.1, and several "ungated"
    `@site` keys are gated above the 5.0.0 floor.
  - **Story 4.6 — the check lives at the render door.** Whenever a render names its `target`, the runtime
    gives every Ghost path its scope (the template's block, then each enclosing repeat) and throws one error
    naming every refusal; `checkBindings` returns the same list for a move or duplicate, which no story offers
    yet (DW-122). A section never opens `{{#post}}` — the template does, once, on post, page and custom
    templates — so one design is one text on both. The version axis is the offer's, not the render's.
  - **Story 4.6's review (2026-09-14) — the order of authority is `matrix.json` and its recordings, then
    `research-ghost-binding-contexts.md`, then appendix B.1's prose**; where two disagree the higher one is
    right and the lower is a bug to report, never to work around.
- **Every bound prop compiles inside a guard, and the guard is derived from the bound field, never from a helper argument.** The spike emitted a guard on a date *format string*, so the block never rendered and the content was silently and permanently lost — a garbage guard is *present*, which is why "is there a guard?" passes while the page is empty. Guards use `{{#if}}` exclusively. Text falls back to the static value the prop held; media **hides the element, never the attribute**, and a media guard must enclose any `srcset`.
  - **Story 4.2 (2026-09-11) — FR-H8's guard is UNCONDITIONAL, and its default comes from the
    kind.** A text binding falls back to the authored static value, a binding into a URL attribute
    hides the element, `data-empty` overrides either, and the guard field is always `guardField(spec)`.
  - **Story 4.6 (2026-09-14) — FR-H8's last holes.** A media binding always hides: `data-empty="fallback"`
    into `href`/`src`/`poster` or on `data-bind-srcset` is refused by the validator (`media-fallback`) and the
    runtime with one sentence, so only a text binding chooses. A field the matrix types `number` guards as
    `{{#if f includeZero=true}}` and counts `0` as present on the canvas; a bare `reading_time` prints the
    shim's "1 min read". The element is guarded on its URL entry's field, never the first entry's by position.
- **The bundled dataset is sized to exercise, not to decorate:** 32 feed posts (so 12-per-page yields a first page, a **true middle page** with both links, and a partial last), 6 tags, 3 authors with portraits and bios, 2 tiers, nav and brand assets, all imagery internally produced. **Every Data-group Source must return a usable set** — 8 featured, ≥3 posts per tag, ≥6 per author, featured spread across both so a combined filter also returns something. Three fixtures (style-guide post; comments at 14 across 9 threads; style-guide page) are **checked in and diff per-commit** and excluded from every feed. The style-guide post is generated **from Ghost's own renderers, never hand-written**, so a target bump surfaces as a visible fixture diff rather than silent drift; the fixtures are Inflozo-authored and trusted by construction, which is why they can be rendered when real body HTML never is.
  - **Q2 ruled (owner, 2026-09-13) — the dataset is grown ABOVE every stated need, and the rules, not the
    figures, are asserted.** 52 feed posts · 15 featured · 16 authors · 6 tiers · 5 newsletters · twelve press
    logos · a `newsletter` tag; sixteen writers reach six posts each because a post carries more than one
    author, while `primary_author` keeps one byline. A pager needing more depth reads a deeper `pagination`
    context, and no post is invented.
  - **Story 4.4 (2026-09-13) — the style-guide body is RECORDED from a real Ghost, not rendered by calling
    `render*Node`.** `tools/probe/record-cards.py` creates one Lexical corpus on T1 and T3, reads `html` back
    through the Content API, returns the documents to draft, and splits the body per block; the article and
    the variation sheet are one corpus rendered twice (Q1). Executed facts it settled: no Lexical NFT renderer
    exists on either major (DW-101); the toggle renders closed only; the signup card renders `display: none`
    until Portal un-hides it; the majors differ in bytes but not in any class.
  - **Story 4.4 — `orbitWeekly.resolveSource(binding)` is what `getRows` gets on an unlinked project**, and a
    filter outside `field:value` joined by `+` REFUSES rather than guesses. Its default order and limit are
    asserted against the Content API's recorded defaults on both majors.
- **A generated theme ships no third-party JavaScript.** Compile CI asserts `assets/js/` contains only Inflozo-authored files, with Ghost's `cards.js` the single declared exception; any future proposal is filtered to MIT / BSD-2 / BSD-3 / Apache-2.0 / ISC re-verified at the pinned version, because users may resell the themes. `core` carries the registry, the `data-i18n-*` reader, one shared `IntersectionObserver` factory, an `AbortController` teardown path and the **reduced-motion gate every animating module passes through**. A design may declare several modules and the compiler emits the union. Every module declares its **no-JS degradation** and whether it is **`edit-safe`**; anything not edit-safe is suppressed on the canvas with its section in its resting state. A module may declare the width below which its script runs, and then its no-JS line must describe **both** sides of that width.
  - **Story 4.7 (2026-09-14) — `core` exists, and the registry is data checked against §7.**
    `packages/library/modules/core.js` is a classic script `bundle()` pastes into one wrapping function; it
    mounts each `data-module` element with an `AbortController`, `ctx.t`, a shared observer and the one
    reduced-motion gate, and sets `js-enabled` **on the mount, never on `<html>`**. `registry.json` is the
    machine half of research §7 (`derive-module-reach.py --check` holds them together, `cards.js` row
    included), and `checkThemeJs` is the `assets/js/` assertion. Proven in jsdom per commit and in Chromium on
    T1 and T3 (`tools/probe/run-verify-core.py`, MEASUREMENTS §42).
  - **Story 4.7's review (2026-09-14) — a design's markup carries no script, and the check says so at the
    door.** The validator refuses a `<script>`, an `on*` handler or a `javascript:` URL in authored markup
    (`authored-script`), so `checkThemeJs` over `assets/js/` and this refusal together are FR-G7(1) for a design; a
    template's inline script is still DW-134. `--check` also holds `animates` to §3.1's reduced-motion lines.
  - **Story 4.7 — edit-safe values are §7's, transcribed.** FR-D20 and Story 5.15 list reveal, tabs,
    accordions and sticky headers as running while editing; §7 marks all four **no**. The registry carries §7
    and DW-133 hands the difference to 5.15, where the canvas is first seen.
- **The browser floor is pinned by date, not by version list** (`widelyAvailableOnDate: 2026-08-18`, resolving to Chrome/Edge 121, Firefox 122, Safari and iOS Safari 17.2 — **computed, never restated**), so every widening is a reviewable diff and bumping the date requires a render-matrix re-run. Three tiers: Widely-on-the-pin is unrestricted; a short version-controlled allowlist of Newly features is usable **only where the fallback is the design's own unstyled state**, carrying no layout, contrast or interaction; everything else fails the build. Each allowlist entry carries its expiry and is **recomputed rather than assumed** when the pin moves. CSS Nesting is forbidden despite being Widely, for the flat hand-editable-output reason. Vendor prefixes are **a closed list of three**, and any other prefixed declaration is a CI failure. All enforcement tooling is build-time only and never enters a generated theme.
  - **Story 4.8's planning (2026-09-14) — the tools were executed, and they do not enforce the policy as written.**
    - `browserslist-config-baseline` reads the pin from the WORKING DIRECTORY's `package.json`. Without it, today
      resolves to Firefox 123 and Safari 17.4.
    - `stylelint-plugin-use-baseline` takes no date and passes anything an `@supports` tests. It sees neither
      prefixes nor nesting, and 1.4.6 lets `mask-mode` through.
    - `eslint-plugin-compat` sees bare globals only, so it never sees `core`'s `win.*`.
    - Recomputed at the pin, `mask-image` is already Widely (Tier 1), and `text-wrap: pretty` is not Baseline at
      all. The next sub-bullet rules on it.
  - **R-105 (owner, 2026-09-14) — `text-wrap: pretty` stays on the Tier-2 allowlist, as its one named exception.**
    It is not Baseline (no Firefox), and its absence is ordinary line breaking, the design's own unstyled state. It
    carries no Widely date and is re-read at every check. A second feature that is not Baseline needs its own
    ruling.
  - **Story 4.8 (2026-09-14) — the floor has one copy of each thing, and one check holds them together.**
    - The pin is the root `package.json`'s `browserslist-config-baseline` key; the `browserslist` key is in
      `packages/library/package.json` only, so `next build` sees none. The floor is printed, never stored.
    - The tiers are data in `packages/library/baseline.json`; the stylesheet rules are the root `stylelint.config.mjs`
      (plugin 1.4.6, `max-nesting-depth: 0`, the prefix closure, `inflozo/supports-tier-2`, `inflozo/prefix-pairs`),
      run by `pnpm lint` over `packages/**/*.css` with Ghost's vendored card CSS ignored.
    - `compat/compat` runs over `packages/library/modules/*.js`; it sees bare globals only, so a module's other APIs
      are read against `web-features` at the pin (`docs/section-authoring.md`).
    - `tools/check-baseline.mjs`, in `pnpm test`, computes the floor two ways, recomputes each Tier-2 date, diffs the
      plugin against the pin row by row (`mask-mode` refused, `cursor` values admitted, both named in
      `baseline.json`), runs the matrix's stylesheet rows, and measures `bundle()`'s main.js with `size-limit` as
      NFR-2's warning — each with a control (MEASUREMENTS §43). HTML is unchecked (DW-137, Story 7.8), and the
      render matrix does not yet refuse a pin it did not run against (DW-138, Story 4.11).
    - The review (2026-09-14) added: ESLint refuses to run outside the repo root (the pin is read from the working
      directory); the check refuses a malformed pin and a `BROWSERSLIST` override, links each `baseline.json` entry
      to its feature's compat keys, and executes the docs' Tier-1 and Tier-3 examples. A Tier-3 at-rule form or
      function passes the plugin today (DW-139, Story 7.8 — the owner's ruling on Q2 in spec 4.8, 2026-09-14).
- **Chrome strings live in one catalog with dotted `namespace.name` keys, never the English string itself**, each with an English default. `.hbs` output consumes them **exclusively via `{{t}}`** with `{placeholder}` hash params, enforced by compile validation. Strings written by bundled JS are **out of `{{t}}`'s reach** — Ghost never runs the theme's JS through Handlebars — so those resolve at compile and emit as `data-i18n-*` attributes on their module's mount element, which validation asserts instead. `credit.*` is a **locked namespace**: absent from the Translations surface, not overridable on any plan, and an override reaching the compiler for one **fails the build** rather than being dropped. Keys are append-only and never reworded in place; a superseded key ships a migration map carrying the user's override forward.
- **The render matrix covers every design × 3 reference Style Packs × light/dark × 3 viewports** — the count derived from the inventory and moving with it, never restated. A design fails above **1% differing pixels at a per-pixel tolerance of 0.1**. The runner is part of the baseline: one pinned Playwright/Chromium in one fixed container image, fonts installed in the image, animations and caret disabled. **Reduced motion is a matrix case with the query forced; 200% browser zoom is a viewport case.** A mass rebaseline requires the owner's approval on a sampled visual review (one design per category, both modes), lands as its own commit touching baselines only, and names the change that caused it. Cadence: full matrix nightly and before each release; per-commit runs cover only what a commit touched.
- **The accessibility scan rides the same renders — there is no second matrix.** axe-core, WCAG 2.1 AA, **zero violations**, scoped to include the fixture renders and the synthesized templates, not only placed designs. Every image carries an alt, and an image that is the **sole content of a link** must carry a *non-empty* one. **The scan stops at the edge of the post body** — Ghost emits its own markup there and no theme can fix a customer's content.

## Technical Decisions

- **The core is pure, and it is the same code on both sides.** Nothing in the runtime, shim or compiler packages may import Next.js, Supabase, Node builtins, `process.env`, `fetch`, `Date.now`, `Math.random`, or a DOM global it did not receive as an argument. **The ban also covers four things that read the machine rather than the arguments** — `localeCompare`, the locale-case methods, anything under `Intl.*`, and `.toString()`/`.getHours()` on a `Date` — each substitutes host locale or timezone for an input and voids compile determinism the first time anyone sorts a list of ids. They are banned because they are the natural reach when sorting or formatting, not because they are present today.
  - **Story 4.2 (2026-09-11) — the runtime and both proofs now live in `packages/section-runtime`.**
    `src/core.ts` is the one walk, `src/agreement.test.ts` and `src/ad36.test.ts` are the proofs, and
    moving them out of `tools/stress/` is what puts them in `pnpm check` and therefore in CI;
    `tools/stress/compile.js` is now a thin CommonJS adapter over the package for the gscan harness.
- **The library is data, never code.** A design is four files plus two schemas — annotated `index.html`, flat `style.css` using `var(--…)` only, optional `behaviour.js`, `design.json` — with one `content.json` per **category** carrying the union content model. Nothing imports a design; both renderers read it. Removing the directory removes markup, stylesheet and module together.
  - **Story 4.7 (2026-09-14) — there is no `behaviour.js`.** FR-G7 lets a design run registry code only, so a
    design declares `data-module="name"` or `"name:768"` (R-38's width), the entry's `js` is recovered from those
    names, and each module is written once in `packages/library/modules/` by its first category story.
- **A control is one attribute on the section root**, and the design's stylesheet selects on it. **One carve-out:** an inline `style` may set a **CSS custom property from bound Ghost data and nothing else** (a tag's own accent colour); the boundary is machine-checkable and a compile gate asserts it. A design switch **removes** every attribute the incoming design does not declare and adds its defaults. No generated class names, no CSS-in-JS, no per-section width.
  - **Story 4.5 (2026-09-13) — the runtime writes the root's controls.** Handed `controlSchema`, both emitters
    remove the authored control attributes and stamp `resolveControls`' values, so a greyed control's stored
    value, a value outside its set and an unknown name reach neither output, and R-103's no-value lock
    stamps no `data-bg`; without a schema the authored root stands.
- **A dark override is a second value for the same control**, token-resolved — never a `-dark` twin attribute and never a mode-scoped selector in a design's own stylesheet. The token block and the base stylesheet are **the only files in a generated theme that mention a mode**.
- **Brace-safe emission.** User text is text-plus-marks and becomes markup at exactly one place. Braces escape as HTML **numeric entities**, not backslashes (the backslash remedy was executed and is false — Handlebars' escape is not composable). The half that reads backwards and matters most: **both renderers call the same serializer, but only the canvas puts its output into a DOM** — the theme renderer splices the fragment into the emitted string *after* `outerHTML` has run, because an HTML parser decodes `&#123;` back to a live `{` on a DOM round trip. A mustache must never abut a closing brace. Compile CI asserts zero `{{{` and zero `}}}` in emitted output, with no exception.
  - **Story 4.2 (2026-09-11) — `packages/section-runtime/src/marks.ts` is the serializer, and the
    comment-parked marker unwrap runs INSIDE the substitution loop.** Unwrapping once at the top
    shipped a nested `{{#foreach}}` inside an HTML comment, so every row it rendered was
    invisible on the live site; the canvas also expands repeats outer-first, so a nested repeat reads
    its row while `@site.*` reads the root, as Handlebars does.
- **Every untrusted-value sink is closed by allow-list, in the shared core so both renderers inherit it** (AD-36), and each closure ships a runnable assertion that the vector is inert *and* the legitimate case still works: URL schemes allow-listed; helper arguments validated against each helper's own grammar rather than concatenated; bindable attribute names allow-listed with `style` and every `on*` absent; bound CSS values parsed to hex/`rgb()`/`hsl()` with a pack-token fallback. Escaping is a *character* control; a URL scheme, a CSS declaration and an attribute *name* are semantic properties no escaper can act on — `javascript:alert(1)` passes through every escaper intact.
  - **Story 4.2 (2026-09-11) — all four sink rules live in `packages/library` beside `safeUrl`,
    `safeCssColor(value, fallbackToken)` included.** AD-36 #4 had said `ghost-shim` owned the colour
    parser, but the canvas emitter needs it at the same moment, and Story 4.1's review had already
    found three of these rules drifted into two copies.
  - **Story 4.2's review (2026-09-11) — every directive value passes through one `consume()` that
    runs the library's own parser before the value reaches any syntax.** A malformed `data-empty`,
    `data-repeat-limit` or `data-prop-attr` refuses rather than being silently ignored, and a repeat
    modifier with no repeat refuses too.
  - **Story 4.3 (2026-09-11) — a Ghost-sourced URL is held to a NARROWER allow-list than a user's.**
    `ghostUrl` calls `safeUrl` and then refuses `mailto:` and `tel:` as well, because a Ghost value is
    `http`/`https` only; `ghostColor(value)` is `safeCssColor(value, '--accent')`, which closed DW-95.
  - **Story 4.5 (2026-09-13) — the new sinks, each closed in the core.** A link record becomes attributes
    only in `marks.ts`'s `linkAttributes` (Portal action from the closed set as `href="#" data-portal`, search
    as `href="#" data-ghost-search`, rel from `LINK_RELS`, an invalid record an unset link); an icon is drawn
    from the handed lookup with every `<path>` rebuilt from validated attributes, an image is an asset id
    resolved only through `RenderInput.assets`, and a date that is not `YYYY-MM-DD` is unset.
- **The build decides the page and the render never re-decides it.** There is no render-time design substitution — a placed design *is* the design that renders. A module **hides its own chrome** instead (a rail whose content fits shows no arrows), the editor *advises*, and a page-dependent precondition is resolved at build from the placement list. Adjacency is answered by the compiler, never probed at render.
- **Handlebars is never parsed or executed in the browser.** The shim resolves Ghost's helper surface directly: `{{#get}}` maps to Content API queries with NQL filters and **may reference only template-level context, never the current render context** (a registry-level constraint binding every design authored later); `{{img_url}}` emits **Ghost-shaped sized URLs and `srcset`, not pass-through**; the two count helpers render a sample on an unlinked project and the real rounded string on a linked one, **always as a string**; `{{content_api_key}}` emits an **inert placeholder** and never a real key. All Content-API values render as **text nodes, never through `innerHTML`**, every URL-valued field is scheme-validated to `http`/`https`, and excerpts render text-only and sanitised — all three living in the shim so both renderers inherit them.
  - **Story 4.3 (2026-09-11) — a hand-picked `ids` binding emits N `{{#get}}` blocks in the
    picked order** (R-20), each around its own `{{#foreach}}`, and the canvas caps the repeat at
    the number picked. A `{{#get}}`'s `filter` and `order` both come from the declaration, and
    either is refused if it names render context.
  - **Story 4.3's review (2026-09-12) — `{{excerpt}}` is Ghost's HELPER, not the field, and it
    ESCAPES rather than strips.** It prefers `custom_excerpt`, never truncates one, defaults a computed
    excerpt to 50 words, and NFR-3's "text-only" is met by assigning that same string to a **text
    node** — a canvas that strips tags disagrees with the site.
  - **Story 4.3 (2026-09-12) — three canvas/site differences are intended, and now stated.** The
    canvas prints `{{url}}`, `img_url` and `srcset` in the API's **absolute** form because a
    relative href would resolve against Inflozo's origin, and `{{navigation}}` hrefs are
    absolute because Ghost's own partial prints them so.
- **Every external-platform fact enters only as a recorded fixture**, dated, with its capture command, under `fixtures/`. The shim's contract tests assert each helper against **recorded real-Ghost output** for a recorded input set, per-commit and offline, with **image URLs compared, not normalised away** — normalising them blinds the one test that underwrites the WYSIWYG promise.
  - **Story 4.3 (2026-09-11) — the two recorded facts that mattered: a Ghost-hosted sized URL comes
    back RELATIVE, and a `size=` that is not an `image_sizes` key silently returns the ORIGINAL
    image.** So the normative map (`xs 150 · s 400 · m 750 · l 1200 · xl 2000`) has one copy in
    `packages/library`, read by the shim, the probe theme and the gscan harness, and a non-key size is
    refused at bind time; `tools/stress/build.js` had three of the five keys wrong.
  - **Story 4.3 + Q2 ruled (owner, 2026-09-12) — the recorder's writes to T1 and T3 are ONE image per
    story, reusing the one already uploaded.** Ghost cannot delete an uploaded image through its API,
    so the Dev run's extra copies stay on the test boxes; the recorder restores the previous theme,
    creates no content, touches no setting, and redacts the Content API key to its shape.
- **One reference token set ships with the runtime** — the full custom-property contract at a single set of values — because a design's CSS consumes pack custom properties *exclusively*, so without it nothing renders on the canvas at all. Epic 6 replaces it with the authored packs and **does not change the contract**. *(Step-6 stress test finding F2: the canvas and Section Picker render "in the project's current Style Pack" three epics before any pack exists.)*
- **A pilot authored here is provisional.** It is marked as such in its `design.json`, its committed snapshot is expected to change exactly once, and the mass-rebaseline rule applies when its category gate re-authors it. **No epic outside the owning one edits a design file** — a defect found in a pilot later is raised against the owning category, never patched in place. The five pilots each exist to exercise one hard case: a site-wide singleton binding, the paginated feed extracting a card partial invoked with no params, member gating with Portal actions, a wrapper context valid only inside the post block, and rich text with all four marks over a guarded media binding with `srcset`.
- **Both Ghost majors are targets**, and version-dependent behaviour is expressed rather than assumed. The avatar substitute has **two forms for this reason**: a user-authored list bakes two initials at compile, a Ghost-sourced author shows one letter in pure CSS, because the name-splitting helper arrived in Ghost 6.5 and is a gscan error below it — and **a design must not mix the two forms in one component**.
  - **Story 4.6 (2026-09-14) — `data-initials` is the typed form.** It bakes the first letter of the first and
    last word of a declared `text` prop through the user-text path on both emitters; the validator refuses an
    undeclared or non-text prop and the runtime refuses it inside any `data-repeat`, so the two forms cannot
    meet. A Ghost person keeps the bound name for the stylesheet's one letter while the photo's guard hides.
- **The behaviours that need no module at all are implemented as such**: `<details>`, an in-page anchor with `scroll-behavior`, CSS `columns`, `:has()`, `position: sticky`, **server-side member gating for every member-visibility swap**, CSS transitions, `<audio controls>`, and Ghost's native pagination. Scroll-driven animations are not Baseline, so reveal and reading-progress use `IntersectionObserver`; `popover` is Newly only, so modals use native `<dialog>`.

## UX & Interaction Patterns

- **The design export is the design authority and is never edited (R-74).** Controls, panels, badges and states come from `Editor Sidebar Kit.dc.html`; the greyed-with-reason pattern from `P0-0 Greyed Control Pattern.dc.html`; the item list from `P0-3`; the extra sidebar surface from `B Missing Surfaces.dc.html` B2; the style-guide fixture from `C Post Body.dc.html` C4. Each pilot has its own frame plus its category's `-0 Category Proof`, which carries the tokenisation proof and roster the spec prose does not. A surface with no frame is extrapolated from the nearest one that has — never invent a second interface vocabulary.
- **The sidebar is 3–5 Quick Controls, then Content / Arrangement / Style / Data.** *Arrangement*, not "Layout" — the design itself is chosen in the design picker above the groups. The Data group appears only on dynamic designs.
  - **Story 4.5 (2026-09-13) — the panel is shown on an internal review page, `/controls`**, beside the
    controls sample (`packages/library/fixtures/controls/`), the way `/kit` and `/style-guide` were shown
    before the editor; Epic 5 mounts its components rather than drawing them again.
- **Greyed versus absent is a designed distinction and a user must be able to tell them apart.** Could-never → **absent**, and the panel says why. Could-but-not-now → **greyed**, always with the reason as one sentence in the helper-caption slot, **never a tooltip and never hidden**. The dependency is declared in the schema so the sidebar, the validator and the compiler read one source. **Remove never greys** — at the floor it stays visible and active, and clicking it produces the floor and the reason as one sentence under the list.
- **Reorder is drag with a keyboard equivalent.** Per-control and whole-section reset exist. Every change paints optimistically **within one frame** and the re-render completes inside the **100 ms** budget. Mode-scoped controls carry a moon badge when a dark override exists, captioned "Dark override" — colour never carries the only signal.
  - **Story 4.5's owner test (2026-09-13) — a dragged row shows a dashed slot the size of the row where it
    will land**, the rows between slide aside, nothing reorders until the drop, and every editable list does
    it (item list, Layers, a hand-picked post list). Opening the Icon Picker from a canvas icon slot is
    Story 5.3's (DW-115), not this epic's.
- **The Link Picker is Ghost-aware:** internal resources, Portal actions (Upgrade compiles to `account/plans`, never `upgrade`, which Portal does not parse), external URL, email, and Ghost search via a single `data-ghost-search` attribute. `newTab` and `rel` are part of the **stored mark record**, not editor-only state. A link to a page Ghost does not publish is a Text Field plus a Link Picker that **renders nothing until a destination is set**, so it can never ship broken.

## Cross-Story Dependencies

- **4.1 gates the epic.** The registry format and the authoring vocabulary are the contract 4.2 renders, 4.5 and 4.6 read schemas from, and 4.10 authors against. 4.8's Baseline tooling must land before any stylesheet is written; 4.9's catalog before the first chrome string. 4.4's fixtures are consumed by 4.10's pilots and pinned by 4.11's matrix. 4.11 needs 4.10's pilots to have something to render, and **every category gate from Epic 9 onward requires it green** — it is built here because the matrix renders locally and needs no Ghost.
  - **Stories 4.2–4.3 (2026-09) — the directive set is partitioned by owner, and an unowned
    directive REFUSES by name rather than leaking into output.** The runtime emits its own plus the
    shim's three (`data-bind-srcset`, `data-helper`, `data-pagination`); `data-t`/`data-t-attr` wait
    for 4.9, and `data-items`, `data-if`/`data-else`, `data-members`, `data-when`/`data-index`,
    `data-target` and `data-needs` for later stories — which is why `{{#has}}` is recorded but
    not shimmed.
  - **Story 4.5 (2026-09-13) — `data-items` left the refused list.** An authored array renders as one copy
    per item on both emitters, zero items render nothing, and a list inside another list or a repeat
    refuses by name.
  - **Story 4.7 (2026-09-14) — `data-module` is no longer consumed.** It is marked `emitted`, so both
    emitters parse it and KEEP it on its element for `core` to mount on; the leak assertion no longer lists it.
- **Owner tests: 4.4, 4.5 and 4.10 only.** The rest are formats, harnesses and build tooling with no screen. 4.3's recordings and 4.6's matrix are verified against the two real Ghost servers, T1 (6.58.0) and T3 (5.130.6) — credentials in `tools/probe/.env`.
- **Downstream, three epics lean on this platform.** Epic 5's play-loop gate and Epic 6's twelve-pack check both assert against the **provisional** pilots. Epic 7 owns the compiler, and **neither Epic 4 nor Epic 7 exits until the joint gate (Story 7.35) is green** — that is where the pilots compile from the same source they render from, the theme passes gscan 0/0, and it deploys and rolls back on real Ghost targets. Epics 9–11 own the pilot files finally. Epic 7 also owns the Translations surface and locale emission; only the catalog's *format* is settled here.
- **This is the first epic to import across the package boundary**, so two loose ends from Epic 1 close here: `packages/library` still declares no entry point, and `apps/web` declares no dependency on the core packages, so the transpile config is inert. The first story that imports decides the entry shape — likely a data-file `exports` map rather than a module, since the library is data only — and adds the `workspace:*` dependencies.
  - **Story 4.1 (2026-09-11) closed the library half, and the shape is a MODULE after all.** `packages/library` exports `./src/index.ts` — the closed directive set, the allow-lists and the validator, which AD-34 places there — and `section-runtime`'s test imports across the boundary (DW-1 done). The `apps/web` half stays open (DW-2).
  - **Story 4.3 (2026-09-12) — `section-runtime` imports `ghost-shim` directly rather than receiving
    it.** The core packages may depend on `library` and on each other; the DOM is injected because
    AD-1 forbids reaching a global, but a pure package has nothing to inject around.
- **Process rulings bind every story**: commit and push to `main` after every phase (`Story 4.<n> - <Phase> - <one line>`); run the documentation gate before every commit and never push it red; review and test phases hit real infrastructure, not mocks alone; owner questions go under `## Questions for the owner` in plain English with an example, numbered options and a **(RECOMMENDED)** mark; a story that changes the database pushes its migration first, on its own.
  - **Story 4.2 (2026-09-11) — the documentation gate cannot catalogue a file under `packages/`.**
    `tools/doc-audit.py`'s `BASES` does not walk it, so a new proof or tool there is named in the
    prose of an existing `tools/` row instead of indexed on its own; widening `BASES` is its own
    change and was not made.
