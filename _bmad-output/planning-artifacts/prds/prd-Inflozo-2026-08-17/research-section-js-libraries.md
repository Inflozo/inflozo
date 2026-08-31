---
title: Inflozo Section JS — Behaviour Modules, Library Policy & Browser Baseline
status: normative-companion
role: decides the behaviour-module list behind FR-J4, the vanilla-vs-library policy and licence filter for anything bundled into a generated theme, the NFR-2 JS budget arithmetic, and the concrete browser baseline that governs both section JS and the 485 flat section stylesheets (§7.1/§7.3)
created: 2026-08-18
---

# Section JS — Modules, Libraries, Budget, Baseline

**Normative force.** This file is the mechanism of record for **FR-J4** (the behaviour-module list), for the licence filter on anything bundled into a generated theme, and for the **browser baseline** that FR-G4, NFR-2 and NFR-5 are tested against. `prd.md` wins on any conflict of scope; where `prd.md` is silent on a detail here, this file binds.

**Every size in this document was measured, not quoted.** Method: `curl` the package's own published `dist` file from jsDelivr, then `gzip -9 -c <file> | wc -c`. Measured **2026-08-18**. Where a number came from bundlephobia or a registry it is labelled as such. Reproduce with the commands in §A2.

---

## 0. Executive summary

1. **A fixed registry of behaviour modules** — one shared `core` plus the feature modules — covers every interactive design in the library. **§2.1's table is the list and the count** (standing rule 3); do not restate a number here. Full list in §2.
2. **Every module ships as hand-written vanilla.** Exactly **two** were seriously contested — `carousel` and `search-overlay` — and both resolved to vanilla. **Net: zero third-party runtime libraries in a generated theme.** One conditional exception is held open (§3.6). **Amended 2026-08-27:** `search-overlay` no longer exists (ruling **R-24** — Ghost's native search only), so the one contested module that later won a vendoring exception under D3 has taken that exception with it; **FR-G7's zero-third-party rule is restored whole**. The module count is derived from §2.1, never restated (standing rule 3).
3. **Swiper is rejected.** Not on ideology — on arithmetic. Swiper's *core alone*, with zero feature modules, is **19.61 KB gzipped** (measured). NFR-2's entire JS budget for a *maximal design* — every module plus the search overlay — is **40 KB gzipped**. One carousel would consume **49 %** of it. A minimal-but-honest modular Swiper build (core + navigation + pagination + a11y + keyboard) measures **27.48 KB gzipped** and breaks NFR-2 outright when combined with the rest of the module set (§4).
4. **The inventory itself already specified the answer.** Every carousel design in Appendix A describes *snapping horizontal scroll* — "snap-scrolling cards with dots" (A8 #7), "snap carousel" (A19 #4), "horizontal snap strip" (A14 #3), "snap-scrolling tag chips rail" (A20 #9), "horizontal snap rail" (A27 #4), "compact horizontal scroll" (A15 #15). Not one asks for coverflow, cube, parallax or true infinite loop. **CSS `scroll-snap` + ~1.2 KB of shared vanilla control layer is not a compromise here; it is a more literal implementation of the designs than Swiper would be.**
5. **Recommended baseline: Baseline "Widely Available", pinned by date, with a short explicit allowlist for safely-degrading enhancements.** As of 2026-08-18 that resolves to **Chrome/Edge 121, Firefox 122, Safari & iOS Safari 17.2** (computed in §A3). This unlocks `<dialog>`, `inert`, `:has()`, `IntersectionObserver`, `ResizeObserver`, `scroll-snap`, `Element.animate()`, container queries, `color-mix()` and `subgrid`. It **excludes** the `popover` attribute, CSS scroll-driven animations, View Transitions and `@starting-style` from load-bearing use.
6. **A realistic heavy page lands at ~10.3 KB gzipped**, and a *maximal* design — every module in §2.1 on one page — at **~17.5 KB gzipped**. (Both were measured against the pre-2026-08-27 registry, which has since lost more modules than it gained, so both stand as ceilings.) Both comfortably inside NFR-2's 40 KB and the owner's 50 KB warning line (§4).
7. **Two budget facts the owner has not been told, and should be.** (a) Ghost's own `sodo-search` bundle, which Ghost core injects via `{{ghost_head}}` when site search is on, measures **86.50 KB gzipped** — *more than four times Inflozo's entire maximal-design module set*, and it is not Inflozo's to remove. (b) The owner's stated 50 KB / 100 KB envelope is **looser than the PRD's own NFR-2 gate of < 40 KB**. NFR-2 is the binding number; everything recommended here fits both.
8. **One licence landmine found.** `typed.js`, the obvious pick for the typewriter design (A4 #13), **relicensed from MIT to GPL-3.0 at v3.0.0** (2026-01-24, verified on the npm registry). Under §5's filter it is a hard reject at v3 — and a hard reject at v2.1.0 too, because pinning a package at its last permissive version to dodge a relicence is a security-update dead end. Vanilla instead (~0.4 KB).

---

## 1. What the constraints actually are

| Constraint | Source | Value |
|---|---|---|
| JS budget, maximal design | `prd.md` **NFR-2** | **< 40 KB gzipped** — every FR-J4 module. **The A23 search client is gone** (ruling R-24): search is Ghost's own `sodo-search`, which the theme neither ships nor pays for, so the measured figures are ceilings |
| JS budget, owner's stated envelope | owner brief | warn at 50 KB/page, loud flag at 100 KB/page |
| Render-blocking JS | **NFR-2 (3)** | none — every script `defer`red or `type="module"` |
| Accessibility gate | **NFR-5** | axe-core, WCAG 2.1 AA, **zero violations**, across every design in the library |
| No-JS behaviour | **FR-G4** | every variant functional with JS disabled; JS is progressive enhancement |
| Strings in JS | **FR-Q6** | no visitor-facing literal in any module; strings arrive as `data-i18n-*` on the mount element |
| CSS authoring | **§7.1 / prd.md §7.3** | plain flat CSS, one file per variant, **no preprocessor, no build step, no autoprefixer** |
| Licence | owner brief (§5 here) | MIT / BSD / Apache-2.0 / ISC only; users redistribute and sell the generated theme |

**Resolution of the 40 vs 50 KB discrepancy:** NFR-2's **40 KB** is the CI gate. The owner's 50 KB is a per-page warning line that will never fire if the 40 KB gate holds, and the 100 KB flag is unreachable under this design. Recommendation: **do not add a second number**; enforce NFR-2's 40 KB with `size-limit` (MIT, v13.0.3) over the compiled `assets/js/main.js` and let it be the only JS budget in the product.

---

## 2. The real module list

Originally derived by walking every variant descriptor in `sections-inventory.md` for motion, timing, state, interactivity or a data fetch; **re-derived from the design export on 2026-08-31** by `tools/derive-module-reach.py`. "Designs" counts variants that *require* the module; "control reach" counts variants where a category-level control can switch it on.

### 2.1 The modules

> **Amended 2026-08-27 by the Ghost Build Room** (`prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md`).
> **Deleted:** `search-overlay` and `search-expand` — ruling **R-24** replaces every Inflozo search
> surface with Ghost's own native search, so no engine is vendored and **FR-G7's zero-third-party-JS
> exception that D3 created is withdrawn**. A search affordance is now a plain element carrying
> `data-ghost-search`. **Added:** `nav-transform` (D2), `contact-form` (D28), `group-headings`
> (ruling R-1). The count in this section's heading, in §0's summary and in FR-G7 is **re-derived
> from this table at the inventory merge** (standing rule 3) — as is every row's "Designs requiring
> it" and "Trigger in the inventory" column, which still cite inventory identities the export
> supersedes (ruling **R-16**). §3 and §4 below are the *analysis* that produced these modules and
> are left as the record; where they discuss `search-overlay`, read ruling R-24 first.

> **"Designs requiring it" and "Declared by" were re-derived from the export on 2026-08-31**
> (`tools/derive-module-reach.py`), because they named designs the export superseded — this row's
> own text used to cite "A1 #11 *Sidebar Trigger*" when A1 #11 is Side Rail. A module is counted
> only where a design's **own declaration** names it: the per-design `**Behaviour module.**` line
> in the fifteen specs that use one, or the roster table's Module / Declares column in the rest.
> A name that merely appears in a category's prose is not a declaration — that distinction is what
> keeps every A1 design from claiming `accordion` and `mode-toggle` by association.
>
> **All 33 categories are now covered.** A17, A18 and A19 named modules only in flowing prose
> until 2026-08-31, when a corrective Claude Design pass gave all 48 of their designs the
> per-design declaration the other thirty already had. Nothing here is inferred from a mention.
>
> **`confetti` was declared by no design and is DELETED** (owner's ruling, 2026-08-31), alongside
> `search-overlay`, `search-expand` and `command-palette`. Every remaining module in this table is
> claimed by at least one design.

| # | Module | Designs requiring it | Control reach | Trigger in the inventory |
|---|---|---|---|---|
| 0 | **`core`** (shared runtime) | 43 | all | **Declared by:** A17-1, A18-1, A19-1, A19-2, A19-3, A19-4, A19-5, A19-6, A19-7, A19-8, A19-9, A19-10, A19-11, A19-12, A19-13, A19-14, A27-1, A31-1, A31-2, A31-3, A31-4, A31-5, A31-6, A31-7, A31-8, A31-9, A31-10, A32-1, A32-2, A32-3, A32-4, A32-5, A32-6, A32-8, A32-9, A32-10, A32-11, A33-1, A33-2, A33-3, A33-4, A33-5, A33-6. Module registry, `data-i18n-*` reader, one shared `IntersectionObserver` factory, `matchMedia('(prefers-reduced-motion: reduce)')` gate, `AbortController` teardown |
| 1 | **`nav-drawer`** (off-canvas + focus containment) | 16 | 16 | **Declared by:** A1-1, A1-2, A1-3, A1-4, A1-5, A1-6, A1-7, A1-8, A1-10, A1-11, A1-12, A1-13, A1-14, A1-15, A1-16, A31-9. Every A1 header needs a mobile nav at 390 px (FR-G4). |
| 2 | **`header-scroll`** (sticky / shrink / overlay→solid) | 17 | 16 | **Declared by:** A1-1, A1-2, A1-3, A1-4, A1-5, A1-6, A1-7, A1-8, A1-10, A1-11, A1-12, A1-13, A1-14, A1-15, A1-16, A4-14, A24-13. A1 control `sticky (None/Sticky/Sticky-shrink)`; A1's overlay design "gains surface on scroll" intrinsically; **and ruling R-3 gives it two more consumers** — A24's condensed bar (`position: fixed` at the threshold, hidden with no JS; as drawn it could never hold, because its containing block has already left the viewport), A1's direction-watch and A4's scroll cue. |
| ~~3~~ | ~~**`command-palette`** (⌘K / Ctrl-K binding)~~ **DELETED — ruling R-24** | — | — | **Its only consumer was A23 #4, and A23 is deleted; and the ruling's own lint rule — "sodo binds ⌘K, so no Inflozo design may bind ⌘K" — forbids the module's entire job.** The row is struck rather than removed, because "add a command palette" is a proposal that will otherwise be made again. A visitor still gets ⌘K: it is `sodo-search`'s, and it works on every Ghost without a theme doing anything |
| 4 | **`dismiss`** (with persistence) | 19 | 15 | **Declared by:** A2-1, A2-2, A2-3, A2-4, A2-5, A2-6, A2-7, A2-8, A2-9, A2-10, A2-11, A2-12, A2-13, A2-14, A2-15, A6-10, A7-8, A19-14, A32-11. A2 `dismissible` control across all 15 bars; A2 #2 *Slim Dismissable* intrinsic |
| 5 | **`rotator`** (crossfade between messages) | 2 | 15 | **Declared by:** A2-9, A4-16. A2 #9 *Rotating Messages* (up to 3 crossfading), A2 `rotation` control, A8 #9 *Avatar Row* ("one rotating quote") |
| 6 | **`countdown`** | 3 | — | **Declared by:** A2-6, A4-11, A10-14. A2 #6 *Countdown*, A6 #11 *Countdown CTA* |
| 7 | **`marquee`** (ticker) | 2 | 30 | **Declared by:** A2-8, A11-8. A2 #3, A4 #18, A8 #3, A8 #14, A9 #15, A11 #3, A11 #4, A19 #15 — plus A8 `motion: Marquee` (15) and A11 `motion: Marquee/Dual-marquee` (15) |
| ~~8~~ | ~~**`confetti`** (particles)~~ **DELETED 2026-08-31 — owner's ruling** | — | — | **No design in the library declares it.** Derived from the export by `tools/derive-module-reach.py`: its only appearances anywhere are in A2's and A4's "modules this category deliberately does not use" lists, which is the finding `reconcile-designs.md` §37.3 first raised and this pass confirmed. Struck rather than removed, so "add a confetti burst" is not proposed again. |
| 9 | **`accordion`** | 42 | 15 | **Declared by:** A1-1, A1-2, A1-3, A1-4, A1-5, A1-6, A1-7, A1-8, A1-10, A1-11, A1-12, A1-13, A1-14, A1-15, A1-16, A2-14, A3-2, A3-3, A3-7, A3-8, A3-14, A9-1, A9-2, A9-5, A9-6, A9-7, A9-8, A9-10, A9-12, A9-13, A9-14, A10-12, A12-14, A12-15, A18-12, A28-7, A33-1, A33-2, A33-3, A33-4, A33-5, A33-6. A9 #1,#2,#3,#6,#7,#11,#12,#13,#14 + A9 `default state` control; A5 #8 *Accordion Features*; A28 #3 *Toggle Reveal* |
| 10 | **`tabs`** | 7 | — | **Declared by:** A5-12, A7-10, A8-11, A9-11, A13-11, A15-10, A15-15. A5 #9 *Tabs Showcase*, A9 #8 *Category Tabs*, A13 #9 *Tabbed Stages*, A20 #4 *Topic Tabs* |
| 11 | **`carousel`** | 13 | 15 | **Declared by:** A1-3, A5-14, A8-7, A11-9, A12-13, A13-8, A14-7, A14-8, A15-9, A19-15, A20-9, A21-12, A27-10. A8 #7, A14 #3, A15 #15, A19 #4, A20 #9, A27 #4, A27 #9 — plus A8 `motion: Carousel` (15) |
| 12 | **`lightbox`** (modal media) | 27 | 15 | **Declared by:** A3-14, A4-4, A5-7, A5-8, A8-8, A9-10, A10-10, A14-1, A14-2, A14-3, A14-4, A14-5, A14-6, A14-7, A14-8, A14-9, A14-10, A14-11, A14-12, A14-13, A14-14, A14-15, A18-2, A18-10, A19-4, A25-5, A33-5. A14 `lightbox` toggle across 15 galleries; A4 #17 *Video Poster*, A15 #3 *Poster Modal*, A15 #8 *Background Poster Band* |
| 13 | **`video-facade`** (click-to-load embed) | 18 | 15 | **Declared by:** A4-10, A10-10, A15-1, A15-2, A15-3, A15-4, A15-5, A15-6, A15-7, A15-8, A15-9, A15-10, A15-11, A15-12, A15-13, A15-14, A15-15, A19-2. Every A15 embed variant; A4 #17. |
| 14 | **`price-toggle`** (billing period swap) | 17 | 40 | **Declared by:** A7-1, A7-2, A7-3, A7-4, A7-5, A7-6, A7-7, A7-8, A7-9, A7-10, A7-11, A7-12, A7-13, A7-14, A7-15, A30-8, A32-7. A7 `billing toggle` (15) + A7 #4 *Toggle Cards* intrinsic; A30 `billing toggle` (13); A32 `billing toggle` (12) |
| 15 | **`member-form`** (states of `data-members-form`) | 26 | 11 | **Declared by:** A2-5, A3-4, A4-11, A6-6, A6-14, A9-14, A26-3, A26-5, A26-12, A26-15, A28-8, A30-1, A30-2, A30-3, A30-4, A30-5, A30-6, A30-7, A30-8, A30-9, A30-10, A30-11, A30-12, A30-13, A32-1, A32-6. A30 #1–#10 each carry designed **sent-state** copy (heading, body, resend); A31 #10 *Private Site Gate* error line |
| 16 | **`count-up`** | 7 | 15 | **Declared by:** A4-2, A10-14, A12-15, A13-9, A19-12, A28-9, A29-9. A10 `count-up animation` toggle (15); A10 #6 *Count-Up Ticker*, #10 *Percent Bars*, #15 *Circle Rings* |
| 17 | **`reveal`** (animate-on-scroll) | 10 | — | **Declared by:** A1-16, A4-18, A8-15, A10-15, A12-14, A18-9, A19-1, A19-2, A19-7, A19-9. A13 #10 *Checklist Journey* (progressive path), A13 #14 *Path Curve* (SVG draw), A34 #9 *Infinite Fade* skeleton. |
| 18 | **`scroll-spy`** (active-item tracking) | 8 | — | **Declared by:** A5-5, A12-5, A13-5, A13-15, A14-5, A25-7, A27-7, A30-11. A5 #12 *Sticky Scroll*, A13 #6 *Sticky Progress*. |
| 19 | **`reading-progress`** | 3 | 16 | **Declared by:** A1-3, A24-13, A32-12. A24 `reading-progress` toggle (16) + A24 #15 *Progress Attached*; A32 #12 *Progress Tease* |
| 20 | **`toc`** (build + scroll-spy) | 7 | 12 | **Declared by:** A3-11, A10-12, A12-10, A25-1, A25-4, A25-7, A25-8. A25 `TOC (Off/Left/Right, auto-hidden < 3 headings)` across 12; A25 #3 *TOC Left*, #4 *TOC Right*. |
| 21 | **`share`** (+ copy-link) | 15 | 27 | **Declared by:** A10-9, A10-12, A24-14, A26-1, A26-2, A26-3, A26-4, A26-5, A26-6, A26-9, A26-10, A26-11, A26-13, A26-14, A26-15. A25 `share rail` toggle (12) + #5 *Share Rail*; A26 `share row` toggle (15) + #2 *Tags + Share Row*, #10 *Share Band* |
| 22 | **`load-more`** | 8 | — | **Declared by:** A3-9, A4-13, A12-12, A17-16, A18-15, A19-11, A31-8, A34-6. A34 #2 *Load More Solid*, #7 *Load More Ghost*, #8 *Load More Ticker* |
| 23 | **`infinite-scroll`** | 3 | — | **Declared by:** A3-9, A4-13, A34-7. A34 #9 *Infinite Fade*, #10 *Infinite Dot Pulse*. |
| 24 | **`shuffle`** (client-side randomize) | 3 | — | **Declared by:** A3-9, A4-13, A19-8. A27 #11 *Discover Shuffle* ("randomized picks with refresh glyph") |
| 25 | **`slide-in-card`** | 3 | — | **Declared by:** A2-11, A3-16, A22-14. A27 #12 *Continue Sticky* ("slide-in next-article card near page end") |
| 26 | **`filter-strip`** (filter / sort) | 11 | 14 | **Declared by:** A3-13, A4-17, A9-12, A10-8, A12-10, A12-15, A13-14, A17-15, A18-3, A20-15, A29-11. A29 #13 *Filter Bar Attached* + A29 `filter/sort strip` toggle across 14 |
| 27 | **`typewriter`** | 5 | — | **Declared by:** A8-10, A17-9, A18-9, A19-6, A19-13. A4 #13 *Typewriter Minimal* ("monospace accent line with animated caret") |
| 28 | **`mode-toggle`** (light/dark) | 17 | site-wide | **Declared by:** A1-1, A1-2, A1-3, A1-4, A1-5, A1-6, A1-7, A1-8, A1-10, A1-11, A1-12, A1-13, A1-14, A1-15, A1-16, A11-7, A19-5. Named in FR-J4; FR-E4's Auto mode is the `prefers-color-scheme` media query and needs no JS — only the *manual* toggle does |
| 29 | **`nav-transform`** (Ghost prefix navigation — **D2**) | 18 | 16 | Every A1 header in prefix mode (16), A3-2, A3-11, A31-9. Ghost navigation is flat and Handlebars cannot strip a `+` / `−` / `\|` label prefix server-side. **JavaScript-required by owner ruling; no no-JS accommodation is built** |
| 30 | **`contact-form`** (honest `mailto:` composition — **D28**) | 10 | 10 | **Declared by:** A16-1, A16-2, A16-3, A16-4, A16-5, A16-7, A16-11, A16-12, A16-14, A16-15. Every A16 contact design. |
| 31 | **`group-headings`** (heading on a key change — **ruling R-1**) | 3 | 3 | **Declared by:** A18-5, A20-7, A21-10. A18-5 *Grouped*, A20-7 *Index* (group by initial), A21-10 *Directory* (group by letter). |
### 2.2 Things that look like modules and are not — the deletions

The laziest win in this whole document is the list of behaviours that need **zero JS** once the baseline in §6 is fixed. Each of these is a module Inflozo does not have to write, test, ship, or fit in the budget.

| Looks interactive | Designs | Why no JS |
|---|---|---|
| **Toggle-reveal comments** | A28 #3 | `<details>/<summary>`. Baseline **Widely** since 2022-07. Keyboard and AT correct by construction, open with JS off |
| **Back-to-top** | A3 ×16 + A3 #16 | `<a href="#top">` + `scroll-behavior: smooth` (Widely since 2024-09), wrapped in `@media (prefers-reduced-motion: no-preference)` |
| **Masonry walls** | A8 #4, A12 #8, A14 #2, A17 #7, A21 #8 | CSS `columns`. (`grid-template-rows: masonry` is **not** Baseline — do not use it) |
| **Hover-reveal image** | A18 #9 | `:hover` + `:has()`. `:has()` reached Baseline **Widely** 2026-06-19 |
| **Sticky panels/rails** | A5 #12*, A7 #15, A9 #3, A12 #11, A14 #9, A18 #7, A19 #8, A20 #11 | `position: sticky`. Only the two that highlight an *active* item (starred) need `scroll-spy` |
| **Member visibility / signed-in swap** | A1, A2 #13, A6, A22, A26, A30 | Ghost renders `{{#if @member}}` **server-side**. Client-side member gating would be both slower and a flash-of-wrong-content bug |
| **Underline slide, gradient slide, hover lift, hover zoom, gradient hover, skeleton shimmer** | A1 #8, A2 #4, A11 #7, A14 #8, A17 #12, A34 #9 | CSS transitions/animations |
| **Audio player** | A15 #6 | `<audio controls>` |
| **Pagination (numbered)** | A34 #1, #3–#6 | Ghost's native pagination context emits real `/page/2/` links |
| **Koenig toggle/gallery cards** | A33 ×6 | Ghost core ships its own `card_assets` JS; A33 only supplies `cards.css` |

---

## 3. Per module: vanilla or library?

Legend — **V** = hand-written vanilla; **L** = library recommended; **L?** = library evaluated and rejected, with the reason.

### 3.1 The decision table

| Module | Verdict | Platform features that make vanilla correct now | Library evaluated | Measured gz | Why rejected / accepted | a11y verdict (NFR-5) |
|---|---|---|---|---|---|---|
| `core` | **V** | `AbortController` (Baseline Widely 2021-09), `matchMedia`, `IntersectionObserver` (Widely 2021-09) | — | — | ~0.8 KB. One IO instance shared by `reveal`, `count-up`, `scroll-spy`, `toc`, `infinite-scroll`, `carousel` dots — far cheaper than per-module observers | Owns the single `prefers-reduced-motion` gate, so no module can forget it |
| `nav-drawer` | **V** | **`<dialog>.showModal()`** (Widely 2024-09) gives focus trap, `Esc`, `aria-modal`, `::backdrop` and inert-rest-of-page **natively**; `inert` (Widely 2025-10) as belt-and-braces | `focus-trap` 8.2.2 + `tabbable` | 3.90 + 2.39 = **6.29 KB** | Rejected: it re-implements in 6.29 KB what `HTMLDialogElement` now does in the engine. Buying a focus trap in 2026 is buying a polyfill | **Decisive for vanilla.** Native `<dialog>` is the *most* axe-clean path — the browser owns focus containment, so the classic hand-rolled failures (`aria-hidden-focus`, escaped focus, missing `aria-modal`) cannot occur |
| `header-scroll` | **V** | `IntersectionObserver` on a zero-height sentinel at the top of `<body>` — no `scroll` listener, no rAF throttling, no layout thrash | — | — | ~0.4 KB | Sticky headers must not trap focus or obscure a focused element: `scroll-margin-top` on all headings/anchors handles WCAG 2.4.11 Focus Not Obscured, in CSS |
| ~~`search-expand`~~ **DELETED 2026-08-27** — claimed by no export design (`reconcile-designs.md` §37.5). | **V** | `:focus-within` does most of it in CSS; JS only adds `Esc`-to-collapse and `aria-expanded` | — | — | ~0.3 KB | Trivial: one `aria-expanded` on the trigger, `Esc` restores focus to it |
| ~~`search-overlay`~~ **DELETED 2026-08-27 (ruling R-24)** — kept as the record of why a vendored engine was contested; Ghost's native search is used instead and no module exists. | **V** | `fetch()` + `AbortController` per keystroke, `<template>` cloning, `<dialog>`, debounce via `setTimeout` | `@tryghost/content-api` 1.11.21<br>`fuse.js` 7.5.0 | **12.81 KB**<br>**8.55 KB** | **Both rejected.** The Content API is one `GET /ghost/api/content/posts/?key=…&filter=…` — a 12.81 KB SDK to build one URL is indefensible. Fuse adds fuzzy ranking the Content API's NQL `~` operator already approximates server-side. ~1.8 KB vanilla | **Build it as a search *dialog*, not an APG combobox.** A `<dialog>` containing `<form>` + `<input type="search">` + `<ul>` of results + one `aria-live="polite"` status region ("12 results") is dramatically easier to keep axe-clean than `role="combobox"` + `aria-activedescendant`. This is a **normative implementation constraint**, not a preference — the combobox pattern is the single most common source of AA failures in this list |
| ~~`command-palette`~~ **DELETED (R-24)** | — | ~~`keydown` + `event.metaKey/ctrlKey`; reused `search-overlay`'s dialog, which is also deleted~~ | — | — | — | The concern recorded here proved decisive in the other direction: it must not shadow a native shortcut, and **⌘K is already `sodo-search`'s** (a keyboard-only entry point fails 2.1.1 for touch/AT users who cannot produce ⌘K) |
| `dismiss` | **V** | `localStorage` + a content-hash key so a *new* message reappears after an old one was dismissed | — | — | ~0.3 KB | The close control is a real `<button>` with a `data-i18n` accessible name; focus moves to the next landmark on dismiss |
| `rotator` | **V** | CSS `@keyframes` crossfade driven by a class swap; `Element.animate()` (Widely 2023-03) where finer control is wanted | — | — | ~0.4 KB | **WCAG 2.2.2 (Pause, Stop, Hide)**: auto-rotating content over 5 s needs a pause control, and must not rotate at all under `prefers-reduced-motion` — then it renders message 1 statically |
| ~~`confetti`~~ **DELETED 2026-08-31** | **V** | ~~`Element.animate()` on ~30 absolutely-positioned spans, or a tiny canvas loop~~ | `canvas-confetti` 1.9.4 (ISC) | **6.89 KB** | Rejected on proportion at the time; the module itself is now deleted because **no design declares it** |
| `countdown` | **V** | `Intl.NumberFormat`, `<time datetime>`, `setInterval` at 1 Hz | — | — | ~0.6 KB | **Real trap:** a per-second `aria-live` region floods AT. Ticking digits get `aria-live="off"` / `aria-hidden`, with one static accessible summary ("Offer ends 3 September 2026") beside them |
| `marquee` | **V** | CSS `@keyframes translate` on a duplicated track; `animation-play-state: paused` on `:hover`/`:focus-within`; hard stop under `prefers-reduced-motion` | — | — | ~0.4 KB (JS only clones the track and measures for a seamless loop) | **WCAG 2.2.2 again** — a visible pause control is mandatory, not optional. The duplicated track must be `aria-hidden="true"` or the same content is announced twice |

| `accordion` | **V** | **`<details>/<summary>`** (Widely 2022-07). Zero JS for the base case | — | — | ~0.2 KB, and *only* for single-open groups and A9's `default state` control | **Strongest vanilla case in the document.** Native disclosure is keyboard- and AT-correct with no ARIA authored at all, and satisfies FR-G4 with JS off by definition. Do **not** hand-roll `role="button" aria-expanded` div accordions — that is the classic axe failure this replaces |
| `tabs` | **V** | Roving `tabindex`, `aria-selected`, `aria-controls`, arrow-key handling — ~45 lines against the W3C APG Tabs pattern | — | — | ~0.7 KB | **This one is earned, not free.** Tabs have real APG obligations (roving tabindex, Left/Right/Home/End, `aria-selected` on exactly one tab). Mitigation: **one shared module serving all four designs**, tested once against axe. A library would not be smaller — the correct implementation genuinely is this small |
| `carousel` | **V** | **CSS `scroll-snap`** (Widely 2022-07) + `scrollIntoView({behavior, inline})` + `IntersectionObserver` for dot state. See §3.4 in full | Swiper / Embla / Keen / Glide / Splide | see **§3.4** | **Swiper rejected on budget** (core alone 19.61 KB = 49 % of NFR-2). scroll-snap is also a *more literal* reading of the designs | scroll-snap **wins on a11y**, not just size: no slide is ever cloned or `aria-hidden`, so the `aria-hidden-focus` violation class — the most common axe failure in carousels — is structurally impossible |
| `lightbox` | **V** | `<dialog>` + `Element.animate()` + `loading="lazy"` (Widely 2026-06) | `PhotoSwipe` 5.4.4<br>`GLightbox` 3.3.1 | **16.36 KB**<br>**15.25 KB** | Both rejected: 15–16 KB is ~40 % of NFR-2 for a feature `<dialog>` now does. PhotoSwipe's last release was 2024-05. ~1.0 KB vanilla | Same argument as `nav-drawer` — native `<dialog>` supplies the focus management. Add: focus returns to the originating thumbnail on close, arrows are `<button>`s with `data-i18n` labels, image `alt` comes through from the gallery item |
| `video-facade` | **V** | `<iframe loading="lazy">` swapped in on click; poster as a plain `<img srcset>` | `lite-youtube-embed` 0.3.3 | **3.84 KB** | Rejected — but *narrowly*, and only because Inflozo needs Vimeo and generic-embed support too, so the module exists regardless. ~0.5 KB | The poster is a `<button>` with an accessible name, not a bare `<div>` with a play glyph |
| `price-toggle` | **V** | One `data-billing` attribute write on the section root — §7.3's control→CSS mechanism, already built. **Both prices are already in the DOM**, server-rendered by `{{#get "tiers"}}` | — | — | ~0.3 KB | Two radio inputs in a `<fieldset>` with a `<legend>`, **not** a `role="switch"` div. Prices update in place; the inactive price is removed from the a11y tree, not merely hidden |
| `member-form` | **V** | `<form>` + `fetch`; Ghost's `data-members-form` contract; class swap to `.success` / `.error` | — | — | ~0.6 KB | The state change must be announced: `aria-live="polite"` on the status region, and focus moves to the sent-state heading. Strings via `data-i18n-*` (FR-Q6) |
| `count-up` | **V** | Shared `IntersectionObserver` + `Intl.NumberFormat` + `requestAnimationFrame` | `countup.js` 2.8.2 | **2.01 KB** | Rejected: 2.01 KB buys easing curves and options Inflozo's closed-value controls cannot even express (FR-F1). ~0.5 KB | Final value must be present in the HTML before JS runs (FR-G4), so AT reads the real number, not a partial count. Animation skipped entirely under `prefers-reduced-motion` |
| `reveal` | **V** | Shared IO + a class toggle; CSS does the motion | `AOS` 2.3.4 | **4.70 KB** | Rejected twice over: 4.70 KB, and **last published 2018-10-03** — unmaintained by any reasonable standard. ~0.3 KB | Content must be visible with JS off — the CSS hides it only under `.js-enabled` set by `core`. No reveal at all under `prefers-reduced-motion` |
| `scroll-spy` | **V** | `IntersectionObserver` with `rootMargin` — the correct primitive; a `scroll` listener is not | — | — | ~0.5 KB, shared with `toc` | `aria-current="true"` on the active item |
| `reading-progress` | **V** | `IntersectionObserver` on paragraph sentinels, or one `scroll` handler with `Element.animate()`. **CSS scroll-driven animations (`animation-timeline: scroll()`) would be the ideal mechanism — and are not Baseline** (§6), so IO it is | — | — | ~0.3 KB | Decorative in the common case: `aria-hidden="true"`. A32 #12's "you've read 30 %" is *informational* and needs `role="progressbar"` with `aria-valuenow` |
| `toc` | **V** | `querySelectorAll('h2,h3')` over rendered `{{content}}`, `<template>` cloning, IO scroll-spy | `tocbot` 4.36.8 | **4.25 KB** | Rejected: 4.25 KB vs ~0.9 KB for the subset Inflozo needs (2 levels, auto-hide < 3 headings, scroll-spy). Tocbot is MIT and well maintained (2026-05-15) — it simply does more than the spec asks | `<nav aria-labelledby>` + `<ol>`; `aria-current="true"` on the active entry. Heading anchors must not duplicate ids Ghost already emits |
| `share` | **V** | `navigator.share()` where present, plain `<a href="https://…">` links otherwise; `navigator.clipboard.writeText()` for copy-link | — | — | ~0.6 KB | Copy-link must confirm via `aria-live="polite"`, not a colour change alone (WCAG 1.4.1). **Caveat:** the Async Clipboard API is Baseline **Newly**, not Widely (low 2024-06-11) — `writeText` is far more broadly available than the full API, but the module still needs a `document.execCommand`-free fallback of "here is the URL, selected, copy it" |
| `load-more` | **V** | `fetch` the next `/page/N/`, parse with `DOMParser`, move the nodes in. **No Content API key needed** — it re-fetches the theme's own paginated HTML, so cards stay byte-identical to server-rendered ones | — | — | ~0.9 KB | **Focus must move to the first newly-appended card** or keyboard users are dropped back to the top (WCAG 2.4.3). Announce "12 more posts loaded" via `aria-live`. FR-G4's numbered-link fallback is the no-JS state |
| `infinite-scroll` | **V** | IO sentinel + `load-more`'s machinery | — | — | ~0.3 KB delta | The hardest a11y problem in the set: auto-appending content makes the footer unreachable and shifts focus context. Mitigation: **cap auto-loads at 3, then show a real "Load more" button** — and FR-G4's numbered fallback stays in the DOM |
| `shuffle` | **V** | Fisher-Yates + `appendChild` in the shuffled order | `shufflejs` 7.0.0 | **5.75 KB** | Rejected: 5.75 KB for a layout engine, where the requirement is "pick 3 at random and re-render". ~0.2 KB | The refresh control is a `<button>`; the new set is announced via `aria-live="polite"` |
| `slide-in-card` | **V** | IO on a near-footer sentinel + a CSS transform class | — | — | ~0.3 KB | Must be dismissible and must not cover content or a focused element; skipped under `prefers-reduced-motion` (appears instantly instead) |
| `filter-strip` | **V** | **Real filtering is `<a href>` navigation** to Ghost's own tag/author/order routes, not client-side JS. The module only manages `aria-current` and an optional `<form>` submit | — | — | ~0.4 KB | Because filtering is links, it works with JS off (FR-G4) and each state has a real URL — which is also the correct a11y answer |
| `typewriter` | **V** | `setTimeout` over a string + a CSS `@keyframes` caret | `typed.js` 3.0.0 | **3.10 KB** *(v2.1.0 measured)* | **HARD REJECT ON LICENCE — v3.0.0 is GPL-3.0** (§5). Also reject pinning v2.1.0 (MIT, 2023-11-08): freezing a dependency to dodge a relicence forfeits every future security fix. ~0.4 KB vanilla | The **complete** text must be in the DOM and the animated span `aria-hidden="true"` — otherwise AT reads a stuttering partial string. No animation under `prefers-reduced-motion` |
| `mode-toggle` | **V** | `matchMedia('(prefers-color-scheme: dark)')` + a `data-mode` attribute on `<html>` + `localStorage`; a tiny inline head script to avoid the flash | — | — | ~0.4 KB | Three states (Auto/Light/Dark) as a radio group, not a two-state switch that silently discards the user's OS preference |

### 3.2 Where a library would genuinely have earned its weight — and why none does

The brief is right that a11y can justify a library. The honest finding is that **the platform absorbed exactly the features that used to justify one**, and it did so inside the recommended baseline:

| Historically library-justifying | What replaced it | Baseline status |
|---|---|---|
| Focus trapping in modals/drawers | `<dialog>.showModal()` — trap, `Esc`, `aria-modal`, `::backdrop`, inert background, all in the engine | **Widely** since 2024-09-14 |
| Making background content unreachable | `inert` | **Widely** since 2025-10-11 |
| Accessible disclosure widgets | `<details>/<summary>` | **Widely** since 2022-07-15 |
| Scroll observation without jank | `IntersectionObserver` | **Widely** since 2021-09-25 |
| Snapping horizontal galleries | CSS `scroll-snap` | **Widely** since 2022-07-15 |
| Listener teardown on dynamic sections | `AbortController` / `{signal}` | **Widely** since 2021-09-25 |

That leaves exactly **two** patterns where the code is genuinely non-trivial and no platform primitive exists: **Tabs** (APG roving tabindex) and **Carousel** (dot/arrow state sync). Both are ~45 lines. Neither has a permissively-licensed library that is *smaller* than the correct hand-written version — and each is written **once** and reused across 4 and 22 designs respectively, so the per-design cost of getting it right is negligible.

### 3.3 The one thing a library would still buy: shared external QA

Rejecting libraries means Inflozo owns the a11y correctness of `tabs` and `carousel` itself. That is a real transfer of risk, and NFR-5's gate is what absorbs it: **the full render matrix per run (NFR-6(a): every design × 3 packs × 2 modes × 3 viewports) × axe-core WCAG 2.1 AA at zero violations** (NFR-6(a)). Recommendation: add **one focused keyboard-interaction test per interactive module** — axe-core is a static-DOM checker and will not catch a broken roving tabindex or a focus that fails to return after `dialog.close()`. Roughly 12 Playwright specs, not 485.

### 3.4 Reference table — every library evaluated, with real numbers

All sizes **measured 2026-08-18** from each package's own published `dist` at `cdn.jsdelivr.net`, compressed with `gzip -9`. Licence and release date from the npm registry; issue counts and last-push from the GitHub API.

| Package | Version | Measured gzip | Licence | Last release | Open issues | Tree-shakeable | Verdict |
|---|---|---|---|---|---|---|---|
| `swiper` (full bundle) | 14.1.0 | **43.29 KB** + 3.5 KB CSS | MIT | 2026-08-06 | 253 | n/a (bundle) | **Reject** — exceeds NFR-2 alone |
| `swiper` (core only) | 14.1.0 | **19.61 KB** | MIT | 2026-08-06 | 253 | ESM, needs a bundler | **Reject** — 49 % of budget, zero features |
| `swiper` (core+nav+pag+a11y+kbd) | 14.1.0 | **27.48 KB** | MIT | 2026-08-06 | 253 | ESM, needs a bundler | **Reject** — breaks NFR-2 in combination |
| `swiper` (web component bundle) | 14.1.0 | **50.13 KB** | MIT | 2026-08-06 | 253 | no | **Reject** — exceeds the owner's 50 KB warning by itself |
| `embla-carousel` (UMD min) | 8.6.0 | **7.16 KB** | MIT | 2025-04-04 | 18 | yes, plugins separate | **Conditional fallback only** (§3.6) |
| `embla-carousel-autoplay` | 8.6.0 | 1.06 KB | MIT | — | — | yes | with the above |
| `keen-slider` | 6.8.6 | **5.99 KB** | MIT | 2023-07-05 | 149 | partial | Reject — 3 yrs stale, headless (no ARIA) |
| `@glidejs/glide` | 3.7.1 | **7.97 KB** | MIT | 2024-11-22 | **245** | modular-ish | Reject — issue backlog, weak a11y |
| `@splidejs/splide` | 4.1.4 | **12.93 KB** | MIT | **2022-11-09** | 143 | no | Reject — best a11y of the set, but ~4 yrs without a release |
| `photoswipe` | 5.4.4 | **16.36 KB** | MIT | 2024-05-24 | — | ESM | Reject — `<dialog>` replaces it |
| `glightbox` | 3.3.1 | **15.25 KB** | MIT | 2025-01-21 | — | no | Reject — same |
| `@tryghost/content-api` | 1.11.21 | **12.81 KB** | MIT | — | — | no | Reject — one `fetch()` replaces it |
| `fuse.js` | 7.5.0 | **8.55 KB** | Apache-2.0 | 2026-07-13 | — | ESM | Reject — NQL does it server-side |
| `canvas-confetti` | 1.9.4 | **6.89 KB** | ISC | 2025-10-25 | — | no | Reject — one decorative variant |
| `focus-trap` + `tabbable` | 8.2.2 / 6.5.0 | **6.29 KB** | MIT | 2026-06-22 | — | yes | Reject — `<dialog>` + `inert` replace it |
| `shufflejs` | 7.0.0 | **5.75 KB** | MIT | 2026-02-13 | — | no | Reject — Fisher-Yates is 5 lines |
| `aos` | 2.3.4 | **4.70 KB** | MIT | **2018-10-03** | — | no | Reject — unmaintained |
| `tocbot` | 4.36.8 | **4.25 KB** | MIT | 2026-05-15 | — | partial | Reject — well-made, just larger than the need |
| `lite-youtube-embed` | 0.3.3 | **3.84 KB** | Apache-2.0 | — | — | n/a | Reject — narrowly; module exists anyway |
| `typed.js` | 3.0.0 | 3.10 KB *(v2.1.0)* | **GPL-3.0** | 2026-01-24 | — | no | **HARD REJECT — LICENCE** |
| `countup.js` | 2.8.2 | **2.01 KB** | MIT | — | — | yes | Reject — over-featured for closed-value controls |
| `a11y-dialog` | 8.1.5 | **1.84 KB** | MIT | 2026-02-06 | — | yes | Reject — the cleanest library here, and still redundant beside `<dialog>` |
| **Build-time tooling** (never shipped to visitors) | | | | | | | |
| `browserslist-config-baseline` | 0.5.0 | — | Apache-2.0 | 2025-08-04 | — | — | **Adopt** (§6) |
| `stylelint-plugin-use-baseline` | 1.4.5 | — | MIT | 2026-07-25 | — | — | **Adopt** (§6) |
| `eslint-plugin-compat` | 7.0.2 | — | MIT | 2026-04-29 | — | — | **Adopt** (§6) |
| `size-limit` | 13.0.3 | — | MIT | 2026-07-30 | — | — | **Adopt** (§4) |

---

## 3.5 THE CAROUSEL QUESTION

The owner named Swiper specifically, so this deserves a straight answer rather than a shrug.

### Swiper, evaluated honestly

**Licence: MIT.** Clean — it passes §5's filter without qualification, and nothing below is a licence objection. **Maintenance: excellent** — v14.1.0 published 2026-08-06, repo pushed 2026-08-06, 41,881 stars, not archived. 253 open issues is normal for a project that size. **A11y: genuinely good for a carousel library** — Swiper ships a dedicated `a11y` module with live-region announcements, ARIA roles and keyboard handling, which is more than most competitors bother with.

**And it is still the wrong choice, for one reason: size against this specific budget.**

| Swiper build | Measured raw | Measured gzip | Share of NFR-2's 40 KB |
|---|---|---|---|
| `swiper.min.js` — **core only, no features at all** | 66,070 B | **19,613 B (19.61 KB)** | **49 %** |
| core + navigation + pagination + a11y + keyboard | 88,847 B | **27,480 B (27.48 KB)** | **69 %** |
| + autoplay + shared utils | 97,093 B | **27,948 B (27.95 KB)** | **70 %** |
| `swiper-bundle.min.js` — full | 151,578 B | **43,287 B (43.29 KB)** | **108 % — over budget alone** |
| `swiper-element-bundle.min.js` — web component | 183,202 B | **50,134 B (50.13 KB)** | **125 %** |
| CSS: `swiper.min.css` + navigation + pagination | 10,518 B | 2,703 B | — |

Three consequences follow, and each is independently disqualifying:

1. **The floor is the problem, not the ceiling.** Even a perfect tree-shake cannot go below `swiper.min.js`'s **19.61 KB**, because that is core. That is *more than the entire recommended 31-module vanilla runtime* (§4: ~17.5 KB) — Inflozo would double its shipped JS to gain one section behaviour.
2. **Tree-shaking requires machinery Inflozo does not have.** Swiper's modular build is ESM with shared chunks; extracting only the used modules needs a real JS bundler in the theme compiler. §7.3 mandates plain flat CSS with no build step and a compiler that *concatenates* pruned assets. Adopting Swiper modularly means adding esbuild/rollup to the compile path purely to make one dependency affordable.
3. **Swiper's differentiators are features the inventory never asks for.** Coverflow, cube, cards, creative effects, virtual slides, parallax, zoom, thumbs — none appear anywhere in the 485 descriptors.

### What the designs actually specify

| Design | Descriptor, verbatim |
|---|---|
| A8 #7 *Card Carousel* | "**snap**-scrolling cards with dots" |
| A14 #3 *Filmstrip Scroll* | "horizontal **snap** strip" |
| A15 #15 *Sticky Mini Row* | "compact horizontal **scroll** of small players" |
| A19 #4 *Cover Carousel* | "**snap** carousel of featured covers" |
| A20 #9 *Horizontal Scroller* | "**snap**-scrolling tag chips rail" |
| A27 #4 *Same-Tag Rail* | "horizontal **snap** rail of related" |
| A27 #9 *Carousel Row* | "**arrowed** card carousel" |

Six of the seven name snapping scroll outright. The seventh adds arrow buttons. **The inventory specified `scroll-snap` before this research started.**

### The comparison

| Approach | Measured gzip | Licence | A11y posture | Verdict |
|---|---|---|---|---|
| **CSS `scroll-snap` + vanilla control layer** | **~1.2 KB** (est., §4) | n/a | **Best.** Nothing is cloned or `aria-hidden`; slides are normal DOM in normal reading order; native scroll is already keyboard-operable; works fully with JS off as a scrollable strip | **RECOMMENDED** |
| Embla Carousel 8.6.0 | 7.16 KB (+1.06 autoplay) | MIT | **Headless — ships no ARIA at all.** You write the same a11y layer either way, so the 7.16 KB buys drag physics only | Conditional fallback (§3.6) |
| Keen Slider 6.8.6 | 5.99 KB | MIT | Headless; no release since 2023-07 | Reject |
| Glide.js 3.7.1 | 7.97 KB | MIT | Minimal ARIA; 245 open issues | Reject |
| Splide 4.1.4 | 12.93 KB | MIT | **Best a11y of the libraries** — built-in ARIA, live region, keyboard | Reject — no release since 2022-11 |
| **Swiper 14.1.0 (minimal modular)** | **27.48 KB** | MIT | Good, with one caveat below | **Reject — budget** |

**The a11y caveat that cuts against every library here, Swiper included:** any carousel that **clones slides for looping or hides off-screen slides** is the classic source of axe-core's `aria-hidden-focus` rule — focusable links inside an `aria-hidden="true"` subtree. Every design in the list is a *card* carousel whose slides contain links. Under NFR-5's zero-violation gate, that risk must be *proven* absent for whichever library is chosen, on every one of the 22 affected variants. **`scroll-snap` eliminates the entire failure class by construction, because no slide is ever hidden, cloned or removed from the a11y tree.** This is an a11y argument *for* vanilla, which inverts the usual expectation and is the single most important finding in this section.

### Recommendation

> **Ship a shared `carousel` module built on CSS `scroll-snap`, with a vanilla control layer of roughly 1.2 KB gzipped providing: prev/next `<button>`s using `scrollIntoView({behavior:'smooth', inline:'start'})`; dot indicators whose active state is driven by an `IntersectionObserver` over the slides (**not** the `scrollend` event — Baseline Newly only, since 2025-12-12); `aria-current` on the active dot; Left/Right arrow-key handling on the scroll container; and an optional autoplay timer that hard-stops under `prefers-reduced-motion` and exposes a visible pause control per WCAG 2.2.2. Do not adopt Swiper.**

### What the owner gives up by choosing scroll-snap

Stated plainly, so this is a decision and not a sales pitch:

1. **Desktop mouse-drag ("grab and fling the strip").** Native scroll gives momentum on touch and trackpads, but a *click-and-drag with the mouse* is not native. If that specific feel is a requirement, it is the one thing here worth ~3 KB of vanilla pointer-event handling — or 7.16 KB of Embla.
2. **True infinite loop.** Wrapping seamlessly from last slide to first requires scroll-position surgery that fights the browser. **No design in the inventory asks for it** — A8 #3 and A11 #3/#4 are *marquees*, which the `marquee` module handles with CSS on a duplicated track.
3. **Effects.** Coverflow, cube, flip, parallax, zoom. Not requested by any of the 485.
4. **Precise easing/duration control.** `scroll-behavior: smooth` uses the UA's curve; you cannot tune it. Acceptable — arguably desirable under FR-F1's closed-value discipline, which forbids raw numeric inputs anyway.
5. **Free-mode / multi-slides-per-view maths.** `scroll-snap` handles multi-per-view natively via flex-basis and `scroll-snap-align`; free-mode *is* the default scroll behaviour. Nothing is lost.

Items 2–5 cost nothing here. **Item 1 is the entire trade**, and it applies only on desktop with a mouse, on a control set that also has arrow buttons, dots and keyboard.

### 3.6 The one conditional exception

If, after building the vanilla module, mouse-drag on desktop is judged a must-have and the vanilla pointer-event implementation proves fragile in the render matrix, adopt **Embla Carousel 8.6.0** — **MIT**, **7.16 KB gzipped measured**, zero dependencies, 18 open issues, repo pushed 2026-08-11, tree-shakeable with plugins in separate packages. Even then, note that Embla is **headless**: it emits no ARIA, so Inflozo writes the same accessibility layer either way and the 7.16 KB buys pointer physics alone. It fits the budget (§4) and is a defensible fallback. **Swiper does not become acceptable at any point in this decision tree**, because its floor is 19.61 KB.

---

## 4. Budget arithmetic

### 4.1 Estimation method and its anchors

There are no measured numbers for code that does not exist yet, so the per-module figures below are **engineering estimates**, and they are anchored to *measured* real-world equivalents so they can be sanity-checked rather than taken on faith:

| Inflozo module (estimated) | Est. gzip | Measured comparable | Its gzip | Ratio and why |
|---|---|---|---|---|
| `lightbox` | 1.0 KB | `a11y-dialog` 8.1.5 | 1.84 KB | Inflozo builds *on top of* native `<dialog>`; a11y-dialog reimplements it for older engines |
| `count-up` | 0.5 KB | `countup.js` 2.8.2 | 2.01 KB | No easing library, no options object — closed-value controls (FR-F1) cannot express them |
| `typewriter` | 0.4 KB | `typed.js` 2.1.0 | 3.10 KB | One string, one caret, no loop/backspace/cursor-style API |
| `toc` | 0.9 KB | `tocbot` 4.36.8 | 4.25 KB | Two heading levels, one layout, one scroll-spy — not a configurable framework |
| `carousel` | 1.2 KB | `embla-carousel` 8.6.0 | 7.16 KB | No pointer physics engine; CSS does the scrolling |

Each estimate is roughly **20–40 % of the nearest real library**, which is what "the subset the spec actually asks for, with the platform doing the rest" should cost. Treat them as ±30 %; even at +30 % across the board every conclusion below holds.

### 4.2 Heavy page A — maximal marketing home (15 interactive sections)

| # | Section placed | Module(s) newly required | Est. gzip | Running total |
|---|---|---|---|---|
| — | (shared runtime) | `core` | 0.8 | **0.8** |
| 1 | A1 #11 *Sidebar Trigger* header, sticky-shrink, search on | `nav-drawer`, `header-scroll`, `search-expand` | 0.7 + 0.4 + 0.3 | **2.2** |
| 2 | A2 #9 *Rotating Messages*, dismissible | `rotator`, `dismiss` | 0.4 + 0.3 | **2.9** |
| 3 | A4 #13 *Typewriter Minimal* hero | `typewriter` | 0.4 | **3.3** |
| 4 | A11 #3 *Marquee Loop* logo wall | `marquee` | 0.4 | **3.7** |
| 5 | A5 #9 *Tabs Showcase* | `tabs` | 0.7 | **4.4** |
| 6 | A10 #6 *Count-Up Ticker* | `count-up`, `reveal` | 0.5 + 0.3 | **5.2** |
| 7 | A7 #4 *Toggle Cards* pricing | `price-toggle` | 0.3 | **5.5** |
| 8 | A8 #7 *Card Carousel* testimonials | `carousel` | 1.2 | **6.7** |
| 9 | A9 #1 *Accordion Single* FAQ | `accordion` | 0.2 | **6.9** |
| 10 | A14 #1 *Uniform Grid*, lightbox on | `lightbox` | 1.0 | **7.9** |
| 11 | A15 #3 *Poster Modal* | `video-facade` (lightbox reused) | 0.5 | **8.4** |
| 12 | A6 #11 *Countdown CTA* | `countdown` | 0.6 | **9.0** |
| 13 | A17 #1 post grid + A34 #2 *Load More Solid* | `load-more` | 0.9 | **9.9** |
| 14 | A22 #1 *Center Card* newsletter (Portal) | — (server-rendered) | 0 | **9.9** |
| 15 | A3 #16 *Back-to-Top Tower* footer | — (anchor + CSS) | 0 | **9.9** |
| — | manual light/dark toggle in header | `mode-toggle` | 0.4 | **10.3** |

> **Total: ≈ 10.3 KB gzipped.** Against NFR-2's 40 KB: **26 % used, 29.7 KB headroom.** Against the owner's 50 KB warning: **21 % used.**

### 4.3 Heavy page B — maximal post page

| Section | Module(s) | Est. gzip | Running |
|---|---|---|---|
| (shared runtime) | `core` | 0.8 | 0.8 |
| A1 header, drawer + sticky | `nav-drawer`, `header-scroll` | 1.1 | 1.9 |
| A24 #15 *Progress Attached* | `reading-progress` | 0.3 | 2.2 |
| A25 #4 *TOC Right* + share rail on | `toc`, `scroll-spy`, `share` | 0.9 + 0.5 + 0.6 | 4.2 |
| A32 #12 *Progress Tease* paywall | (reuses `reading-progress`) | 0 | 4.2 |
| A26 #10 *Share Band* | (reuses `share`) | 0 | 4.2 |
| A27 #12 *Continue Sticky* | `slide-in-card` | 0.3 | 4.5 |
| A28 #3 *Toggle Reveal* comments | — (`<details>`) | 0 | 4.5 |
| A3 footer | — | 0 | 4.5 |
| mode toggle | `mode-toggle` | 0.4 | **4.9** |

> **Total: ≈ 4.9 KB gzipped.** 12 % of NFR-2.

### 4.4 The NFR-2 case — a *maximal* design, every module on one page

| Module | Est. gzip | | Module | Est. gzip |
|---|---|---|---|---|
| `core` | 0.8 | | `price-toggle` | 0.3 |
| `nav-drawer` | 0.7 | | `member-form` | 0.6 |
| `header-scroll` | 0.4 | | `count-up` | 0.5 |
| ~~`confetti`~~ | ~~0.7~~ **0 — deleted** | | `shuffle` | 0.2 |
| `search-expand` | 0.3 | | `reveal` | 0.3 |
| **`search-overlay`** | **1.8** | | `scroll-spy` | 0.5 |
| `command-palette` | 0.6 | | `reading-progress` | 0.3 |
| `dismiss` | 0.3 | | `toc` | 0.9 |
| `rotator` | 0.4 | | `share` | 0.6 |
| `countdown` | 0.6 | | `load-more` | 0.9 |
| `marquee` | 0.4 | | `infinite-scroll` | 0.3 |
| `accordion` | 0.2 | | `slide-in-card` | 0.3 |
| `tabs` | 0.7 | | `filter-strip` | 0.4 |
| `carousel` | 1.2 | | `typewriter` | 0.4 |
| `lightbox` | 1.0 | | `mode-toggle` | 0.4 |
| `video-facade` | 0.5 | | | |

> **Maximal design total: ≈ 17.5 KB gzipped.** Against NFR-2's < 40 KB: **44 % used — passes with better than 2× headroom.** At the +30 % estimate ceiling it is ~22.8 KB — still passing.

### 4.5 The same maximal design with a library substituted for `carousel`

| Carousel implementation | Maximal-design total | vs NFR-2 (40 KB) | vs owner 50 KB | Verdict |
|---|---|---|---|---|
| **vanilla `scroll-snap`** (1.2 KB) | **17.5 KB** | **44 % — PASS** | 35 % | **Recommended** |
| Embla 8.6.0 (7.16 + 1.06 autoplay) | 24.5 KB | 61 % — PASS | 49 % | Acceptable fallback |
| Keen Slider 6.8.6 (5.99) | 22.3 KB | 56 % — PASS | 45 % | rejected on maintenance |
| Glide 3.7.1 (7.97) | 24.3 KB | 61 % — PASS | 49 % | rejected on quality |
| Splide 4.1.4 (12.93) | 29.2 KB | 73 % — PASS | 58 % | rejected on staleness |
| **Swiper minimal modular (27.48)** | **43.8 KB** | **110 % — FAILS NFR-2** | 88 % | **Reject** |
| Swiper full bundle (43.29) | 59.6 KB | **149 % — FAILS** | **119 % — over the owner's 50 KB too** | Reject |
| Swiper element bundle (50.13) | 66.4 KB | **166 % — FAILS** | **133 %** | Reject |

**Plainly stated, as the brief asked:** Swiper in any usable configuration consumes **49–108 % of NFR-2's entire JS budget on its own**, and in a maximal design it breaks that budget outright. That is what makes it unacceptable, not a preference for hand-written code. No other single library in this document consumes more than 32 % of the budget.

### 4.6 The elephant: JS Inflozo does not control

NFR-2's budget covers *Inflozo's* `assets/js/main.js`. The visitor downloads more than that:

| Source | Measured gzip | Whose |
|---|---|---|
| **Inflozo maximal design** | **~17.5 KB** | Inflozo's — governed by NFR-2 |
| Ghost `sodo-search` (injected by `{{ghost_head}}` when site search is enabled) | **86.50 KB** | Ghost core |
| Ghost Portal (`portal.min.js`) | tens of KB | Ghost core |
| Ghost `card_assets` (Koenig toggle/gallery card JS) | small | Ghost core |
| A YouTube iframe, if not facaded | ~500 KB+ | Third party — **this is why `video-facade` exists** |

Two actions follow, and they are worth more real-world milliseconds than every optimisation above combined:

1. **`video-facade` is not optional.** It is the single largest performance lever in the section library.
2. ~~**Investigate suppressing `sodo-search` on themes that ship A23's Custom Overlay variants.**~~ **CLOSED by ruling R-24 — and in the opposite direction.** There is no Inflozo overlay to ship, so nothing is suppressed and `{{ghost_head exclude="search"}}` is **never emitted**. The original reasoning stands as the record: shipping Inflozo's ~1.8 KB overlay *on top of* Ghost's 86.50 KB one was strictly worse than either alone. A `{{ghost_head exclude="search"}}` form is discussed in the community but is **not verified as supported Ghost API** — treat this as an open question for the FR-C5 per-release verification, not as a settled mechanism.

---

## 5. Licence constraint — the hard filter

**Rule (binding).** Generated themes are downloaded, owned, redistributed and potentially resold by Inflozo's users. Any code bundled into a generated theme MUST be licensed **MIT, BSD-2/3-Clause, Apache-2.0 or ISC**. **GPL, AGPL, LGPL, SSPL, BUSL, "free for non-commercial use", "licence key required for commercial use", and any Commons Clause rider are rejected outright**, with no case-by-case exception. Ambiguous or missing licence metadata is treated as a rejection until resolved in writing.

**LGPL is rejected too**, deliberately: LGPL's dynamic-linking relief is a poor fit for a JS bundle concatenated into a single `main.js`, and asking a Ghost user who sells a theme to reason about §4 relinking obligations is not a defensible product.

### Findings

| Package | Declared licence | Verdict |
|---|---|---|
| **`typed.js` ≥ 3.0.0** | **GPL-3.0** *(changed from MIT at 3.0.0, 2026-01-24)* | **REJECTED — hard filter.** Would have contaminated the A4 #13 typewriter design |
| `typed.js` 2.1.0 | MIT (2023-11-08) | **Rejected on policy** — pinning to dodge a relicence forfeits security fixes |
| `swiper` 14.1.0 | MIT | Passes licence; rejected on **budget** (§3.5) |
| `embla-carousel` 8.6.0 | MIT | **Passes** — conditional fallback (§3.6) |
| `keen-slider`, `@glidejs/glide`, `@splidejs/splide` | MIT | Pass licence; rejected on maintenance/size |
| `photoswipe`, `glightbox`, `a11y-dialog`, `focus-trap`, `tabbable`, `tocbot`, `countup.js`, `shufflejs`, `aos`, `@tryghost/content-api` | MIT | Pass licence; all rejected on size/maintenance/redundancy |
| `canvas-confetti` | ISC | Passes licence; rejected on proportion |
| `fuse.js` | Apache-2.0 | Passes licence; rejected on redundancy |
| `lite-youtube-embed` | Apache-2.0 | Passes licence; rejected narrowly |
| **Build-time only, never shipped:** `browserslist-config-baseline` (Apache-2.0), `web-features` (Apache-2.0), `stylelint-plugin-use-baseline` (MIT), `eslint-plugin-compat` (MIT), `size-limit` (MIT) | — | **All pass** — and note that build-time tooling is outside the redistribution question entirely, since it never enters a generated theme |

### Enforcement

Because §0's recommendation is **zero runtime dependencies**, the enforceable rule is stronger and simpler than a licence scanner: **the generated theme's `assets/js/` contains only files authored in the Inflozo repository.** Add a compile-CI assertion to that effect. It is one check, it cannot drift, and it makes the licence question unanswerable-by-construction. Should the §3.6 Embla exception ever be taken, replace it with an SPDX allowlist check plus a `THIRD-PARTY-LICENSES` file emitted into the theme zip.

**`typed.js` is the standing lesson:** a permissive licence today is not a permissive licence forever. Any future dependency proposal must re-verify the licence **at the pinned version**, not at the package's reputation.

---

## 6. Browser baseline — a concrete, testable policy

### 6.1 The options, evaluated

| Option | What it means | Verdict |
|---|---|---|
| **Baseline "Widely Available"** | Supported in Chrome, Edge, Firefox and Safari for **≥ 30 months**. Machine-readable via the `web-features` dataset; expressible as browserslist via `browserslist-config-baseline` | **RECOMMENDED** |
| Baseline "Newly Available" | Supported in all four engines *as of today*. Computing the browser floor for *everything* Newly-available today yields **Chrome 148 / Firefox 153 / Safari 26.5** (computed, §A3) | **Reject as a blanket policy** — it would exclude essentially every browser more than a few weeks old |
| `last 2 versions` | Sounds strict, behaves erratically: it means Safari 25–26 but also Chrome 149–150. Chrome ships every ~4 weeks, Safari roughly yearly, so the two ends of the same string describe wildly different age windows — and it silently *rises* under you, breaking sites for users who have not updated | **Reject — not actually testable as a support promise** |
| Explicit browserslist string | Fully deterministic and CI-enforceable, but a hand-maintained list that nobody remembers to revisit | **Reject as the primary** — adopt as the *generated output* of the Baseline policy, not as a hand-written input |

### 6.2 Recommendation

> **Policy: Baseline "Widely Available", pinned by date, reviewed quarterly.**
>
> ```jsonc
> // package.json (Inflozo repo — build-time only, never shipped in a theme)
> {
>   "browserslist": ["extends browserslist-config-baseline"],
>   "browserslist-config-baseline": { "widelyAvailableOnDate": "2026-08-18" }
> }
> ```
>
> **Pin the date.** An unpinned Baseline config silently *widens* what is permitted every month, so the CSS a section may legally use drifts without a commit. Pinning makes every baseline change a reviewable diff, and bumping the date becomes a deliberate quarterly act with a render-matrix re-run attached.

**As of the 2026-08-18 pin, that resolves to a browser floor of:**

| Engine | Minimum version |
|---|---|
| Chrome / Chrome Android | **121** |
| Edge | **121** |
| Firefox / Firefox Android | **122** |
| Safari (macOS) | **17.2** |
| Safari (iOS) | **17.2** |

*(Computed directly from `web-features@3.35.0` — see §A3 for the exact method.)* These are December 2023–January 2024 browsers. Every one is 2.5+ years old.

### 6.3 What it unlocks

| Feature | Baseline | Widely since | Unlocks |
|---|---|---|---|
| `<dialog>` + `showModal()` | **Widely** | 2024-09-14 | `nav-drawer`, `lightbox`, `search-overlay` — native focus trap; deletes `focus-trap` (6.29 KB) |
| `inert` | **Widely** | 2025-10-11 | Background inertness for drawers |
| `:has()` | **Widely** | 2026-06-19 | A18 #9 hover-reveal, parent-state styling — deletes JS class-toggling across the CSS library |
| `IntersectionObserver` | **Widely** | 2021-09-25 | `reveal`, `count-up`, `scroll-spy`, `toc`, `header-scroll`, `infinite-scroll`, `carousel` dots |
| `ResizeObserver` | **Widely** | 2023-01-28 | `marquee` track measurement, responsive carousel recalculation |
| CSS `scroll-snap` | **Widely** | 2022-07-15 | **The entire carousel decision** |
| `Element.animate()` | **Widely** | 2023-03-16 | `rotator`, `lightbox`, `confetti` without a CSS-class dance |
| `AbortController` / `{signal}` | **Widely** | 2021-09-25 | One-line listener teardown when a section is removed |
| `prefers-reduced-motion` | **Widely** | 2022-07-15 | NFR-5's motion obligations, in CSS |
| `<details>/<summary>` | **Widely** | 2022-07-15 | `accordion`, A28 #3 — with zero JS |
| `loading="lazy"` | **Widely** | 2026-06-19 | Native image lazy-loading everywhere |
| Container queries | **Widely** | 2025-08-14 | Section CSS that responds to *its own* width — the correct primitive for a drag-and-drop canvas where a section's container is unknown at authoring time |
| `subgrid` | **Widely** | 2026-03-15 | Card grids with aligned internal rows (A17, A5, A7) |
| `color-mix()` | **Widely** | 2025-11-09 | Style-Pack tints/scrims derived from tokens — no second token per shade |
| `:is()` / `:where()`, `focus-visible`, `aspect-ratio`, logical properties, `clamp()` | **Widely** | ≤ 2024-03 | Baseline section-CSS vocabulary |

### 6.4 What it forbids — and what breaks for whom

| Feature | Status | Consequence |
|---|---|---|
| **`popover` attribute** | Newly (2025-01-27) — Widely ≈ 2027-07 | Requires **iOS Safari 18.3** (Jan 2025), far above the 17.2 floor. **Use `<dialog>` instead** — it does more (focus trap, `aria-modal`) and is already Widely. Revisit mid-2027 |
| **CSS scroll-driven animations** (`animation-timeline`) | **Not Baseline** — no Firefox support | Would have been the ideal, zero-JS mechanism for `reading-progress` and `reveal`. **It is not available.** Those two modules use `IntersectionObserver`; do not author a design that assumes scroll-linked CSS |
| **View Transitions** | Newly (2025-10-14) | Not usable for load-more/pagination transitions. Firefox support only landed at 144 |
| `@starting-style`, `transition-behavior: allow-discrete` | Newly (2024-08-06) | Entry animations for `<dialog>`/popovers must use a class-toggle + `Element.animate()` instead |
| `content-visibility` | Newly (2025-09-15) — Safari 26 | No `content-visibility: auto` for long feeds |
| `backdrop-filter` | Newly (2024-09-16) — Safari 18 | A30 #8's "blurred site behind" and A32 #10's "blurred preview" need an **opaque/gradient scrim fallback**, not a blur-or-nothing design |
| `text-wrap: balance` | Newly (2024-05-13) | Enhancement-only (see the two-tier rule below) |
| `scrollend` event | Newly (2025-12-12) | **Carousel dot state must use `IntersectionObserver`, not `scrollend`** |
| `accent-color` | **Not Baseline** — Safari 26.2 | Do not tint native checkboxes/radios via `accent-color`; style them explicitly |
| `anchor-positioning`, `interpolate-size`, `margin-trim`, `field-sizing`, `::details-content` | Not Baseline / Newly | Forbidden in section CSS |
| `grid-template-rows: masonry` | Not Baseline | Masonry designs use CSS `columns` (§2.2) |

**Who breaks:** a visitor on **Safari 17.0/17.1** (Sept–Nov 2023) or an unpatched Chrome/Firefox from before January 2024. Against StatCounter's July 2026 global figures — Chrome 68.28 %, Safari 16.47 %, Edge 5.36 %, Firefox 3.30 % — the affected slice is a fraction of a percent, concentrated in Safari users on macOS versions that no longer receive Safari updates. Under a **Widely Available** policy those users still get valid, readable, navigable pages; they lose specific visual refinements, never content or navigation, because FR-G4 already requires every section to work with JS off.

### 6.5 The two-tier rule (this is the part that makes the policy usable)

A single hard line would ban `backdrop-filter` and `text-wrap: balance` — features whose failure mode is *literally nothing happening*. So:

> **Tier 1 — Widely Available: unrestricted.** Any feature at Baseline Widely on the pinned date may be used anywhere in the design stylesheets and the modules, load-bearing.
>
> **Tier 2 — enhancement allowlist:** a **short, explicit, version-controlled list** of Baseline **Newly** features that may be used **only where the fallback is the design's own unstyled state and the design remains complete without it.** Nothing on this list may carry layout, contrast, or interaction.
>
> Initial Tier 2 allowlist: `backdrop-filter` (behind an opaque/gradient scrim), `text-wrap: balance`, `text-wrap: pretty`, `scrollbar-width`/`scrollbar-color`, `@starting-style`.
>
> **Tier 3 — everything else: forbidden**, and CI fails the build.

### 6.6 The CSS consequence — because there is no build step

`prd.md` §7.1 mandates plain flat CSS with no preprocessor and **no autoprefixer**. That has one non-obvious cost the baseline decision does not remove, and it must be written down or every one of the design stylesheets will rediscover it:

**Three properties in common use are *not* Baseline at all and have no unprefixed form that works.** These are the only sanctioned hand-written prefixes in the entire library:

| Need | Required declarations | Why |
|---|---|---|
| **Excerpt truncation** (A17 `excerpt length`, A18, A19, A27 — 60+ variants) | `display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: N; overflow: hidden;` | `line-clamp` is **not Baseline**; the standard property is not interoperable. The `-webkit-` form is the only working mechanism |
| **iOS text inflation** (site-wide reset) | `-webkit-text-size-adjust: 100%` | `text-size-adjust` is **not Baseline**; without it iOS Safari inflates text in some layouts and breaks the type scale |
| **Non-selectable UI chrome** | `-webkit-user-select: none; user-select: none;` | `user-select` is **not Baseline** — Safari still requires the prefix |

> **Normative:** these three are the **complete and closed** list of vendor prefixes permitted in Inflozo section CSS. Any other `-webkit-`/`-moz-`/`-ms-` declaration is a CI failure. Putting the list here is what makes "no autoprefixer" safe instead of merely fashionable.

Two further notes for section authors:
- **CSS Nesting** reached Baseline **Widely** (Chrome 120 / Safari 17.2 / Firefox 117) and is therefore *technically* permitted — but §7.1 forbids it for a different reason (flat, hand-editable, Casper-grade output per FR-J1). That prohibition stands and is unaffected by this baseline.
- **`overscroll-behavior`** is not Baseline per `web-features` (Safari data gap). Drawers and the carousel should not depend on it for scroll containment; use `<dialog>`'s native scroll-locking instead.

### 6.7 CI enforcement — three checks, no build step required

| What | Tool | Licence | Enforces |
|---|---|---|---|
| The flat design stylesheets | **`stylelint-plugin-use-baseline`** 1.4.5, `available: "widely"` + explicit Tier-2 allowlist | MIT | §6.5. Stylelint runs directly on flat CSS files — **no build step, no bundler, no preprocessor**, which is exactly why it fits §7.1 |
| The 31 JS modules | **`eslint-plugin-compat`** 7.0.2 against the pinned browserslist | MIT | DOM/JS APIs below the floor |
| Compiled `assets/js/main.js` | **`size-limit`** 13.0.3, `limit: "40 KB"`, gzip | MIT | NFR-2's JS budget — the maximal-design fixture theme is the input |
| Third-party code | one grep asserting `assets/js/` contains only repo-authored files | — | §5's licence rule, by construction |

Add a fourth, human check: **bumping `widelyAvailableOnDate` requires a render-matrix re-run**, because widening the CSS vocabulary is exactly the kind of change NFR-6(a) exists to catch.

---

## 7. No-JS degradation statement per module (FR-G4), and the edit-safe column (FR-D20)

One line each. This is the acceptance criterion for the module's no-JS state.

**Amended 2026-08-27 by the Ghost Build Room** (`prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md`):

- **The `Edit-safe` column is new, and it is the table FR-D20 has always cited.** `edit-safe` occurred
  exactly once in `prd.md` — FR-D20 line 243, *"each behaviour module declares itself edit-safe or not
  (§7.3)"* — and §7.3 carried no such table, which is why the specs each asserted their own and
  disagreed (`carousel`: A14 said yes, A15 said no). **The sense, fixed once (ruling R-21): a module is
  `edit-safe` if it may run inside the editor canvas without interfering with editing.** Anything marked
  **no** is suppressed on the canvas and its section renders in its resting state. The values below are
  the architect's pass against that sense; **E4 confirms each against the real canvas** — the two the
  owner ruled directly are `lightbox` (**no** — the defining case) and `carousel` (**no**, settling the
  A14/A15 disagreement).
- **`search-overlay` and `search-expand` are deleted** (ruling R-24 — Ghost's native search only; no
  engine is vendored, and the zero-third-party exception D3 created in FR-G7 is **withdrawn**). A search
  affordance is now a plain element carrying `data-ghost-search`, which needs no module at all.
- **`nav-transform`** (D2), **`contact-form`** (D28) and **`group-headings`** (ruling R-1) are added.
- **`member-form`'s sentence was false** and is rewritten — proved by execution, `MEASUREMENTS.md` §29a.
- **Orphans, pending the merge:** `confetti`, `shuffle` and `typewriter` are claimed by no export design
  (`reconcile-designs.md` §37.3). Marked here; dropped or re-homed when the inventory is re-derived.

| Module | With JavaScript disabled | Edit-safe |
|---|---|---|
| `core` | Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch. | **yes** — sets a class and nothing else |
| `nav-drawer` | Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown. | **no** — the drawer overlays the canvas and the hamburger swallows clicks |
| `header-scroll` | Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent. | **no** — hides and reveals the header under the cursor as the canvas scrolls |
| ~~`command-palette`~~ **DELETED (R-24)** | — | — |
| `dismiss` | The bar renders and stays; the close button is hidden rather than rendered inert. | **no** — a dismissed bar leaves the canvas and cannot be edited back |
| `rotator` | The first message renders statically; the others are not emitted into the visible flow. | **no** — the message the editor is typing into rotates away |
| `countdown` | The static deadline renders as a `<time datetime>` element ("Ends 3 September 2026"); no ticking digits. | **yes** — ticking digits interfere with nothing |
| `marquee` | The track renders as a static row, horizontally scrollable via `overflow-x: auto`; nothing moves. | **no** — moves text under the cursor |
| `accordion` | Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute. | **no** — a collapsed panel hides content the editor must reach |
| `tabs` | All panels render stacked and visible, each preceded by its tab label as a heading. | **no** — hidden panels are unreachable on the canvas |
| `carousel` | The slide track is a native horizontally-scrollable `scroll-snap` strip — **fully usable**, only dots and arrow buttons are hidden. | **no** *(owner-ruled — settles A14 vs A15)* — off-screen slides cannot be clicked |
| `lightbox` | Each thumbnail is an `<a href>` to the full-size image; clicking opens it as a normal page. | **no** *(owner-ruled — the defining case)* — a modal opens when the editor clicks an image to edit its caption |
| `video-facade` | The poster is an `<a href>` to the video's canonical URL (YouTube/Vimeo watch page). | **no** — clicking to edit swaps in a third-party iframe |
| `price-toggle` | Both monthly and yearly prices render side by side, each labelled — no toggle control shown. | **yes** — both states are reachable by the same control the visitor uses |
| `member-form` | **JavaScript-required — the second waiver after `nav-transform` (D2).** Proved 2026-08-27 on both majors (`MEASUREMENTS.md` §29a): `/members/api/send-magic-link/` **never parses form-encoded bodies** (Ghost 5 answers "Email is required" even with a valid token), Ghost 6 additionally requires an `integrityToken` from a separate GET, and there is no redirect back — a native submit would land the visitor on raw JSON. Ghost's own `portal.min.js` attaches the submit listener and applies the documented `loading`/`success`/`error` classes, so every designed state works **with** JavaScript. Without it a designed `<noscript>` notice renders in place of the form; nothing else is built for it. | **no** — suppressed so an editor cannot submit a real signup from the canvas |
| `count-up` | The final value renders as static text — it is already in the HTML before JS ever runs. | **yes** — animates to the value already in the markup and settles |
| `reveal` | Content renders fully visible; the hide-then-reveal CSS is scoped to `.js-enabled`. | **no** — content starts hidden, so an editor may never see the section it placed |
| `scroll-spy` | The sticky list renders with the first item marked current; no active-item tracking. | **yes** — only sets `aria-current` |
| `reading-progress` | The bar is hidden entirely (it is decorative). A32 #12's meter renders at its server-known static value. | **yes** — a bar at the top edge, no interaction |
| `toc` | No TOC renders. Because it is built from `{{content}}` client-side there is no server-side equivalent — the article itself is unaffected, which is why FR-G4 is still satisfied. | **no** — injects an anchor per heading into content the editor also manipulates |
| `share` | Share links are real `<a href="https://…">` URLs and work normally; only the copy-link button is hidden. | **yes** — links only |
| `load-more` | Ghost's numbered `/page/2/` pagination links render instead (**FR-G4, explicitly**). | **no** — would fetch and append markup the editor never placed |
| `infinite-scroll` | Same — numbered pagination links render (**FR-G4, explicitly**). | **no** — same as `load-more` |
| `shuffle` | The server-rendered set displays; the refresh glyph is hidden. | **no** — item order changes between edits *(orphan)* |
| `slide-in-card` | The card renders statically in the document flow near the page end rather than sliding in. | **no** — appears over the canvas on a trigger |
| `filter-strip` | Filters are `<a href>` links to Ghost routes and **work perfectly** — this module needs JS least of all. | **no** — hides rows the editor needs to reach |
| `typewriter` | The complete line renders as static text; the animated caret is absent. | **no** — rewrites text under the cursor *(orphan)* |
| `mode-toggle` | `prefers-color-scheme` still drives Auto mode entirely in CSS (**FR-E4**); only the manual override control is hidden. | **yes** — switching mode is exactly what an editor wants to do |
| `nav-transform` | *(new — D2)* The flat raw-prefix list renders: a visitor sees Ghost's own navigation with the literal `+Sections` / `−Essays` labels. **JavaScript-required, no accommodation built** — the owner's ruling, stated once here and nowhere else. | **yes** — rewrites labels once at load, and the transformed labels are what the editor should see |
| `contact-form` | *(new — D28)* The honest `mailto:` link renders and works; the JS-composed draft (subject and body pre-filled) is what JavaScript adds. No tile provider, no third-party post endpoint. | **no** — suppressed so an editor cannot open a mail client from the canvas |
| `group-headings` | *(new — ruling R-1)* The flat ruled list renders, ungrouped (P0·8 rule 4). Handlebars cannot detect a key change between items — no month, year, tag or initial heading is emitted server-side, on any Ghost version. | **yes** — the headings it inserts are derived and are not editable, so nothing is hidden from the editor |
---

## Appendix A — Method and reproducibility

### A1. Data sources

| Source | Used for | URL |
|---|---|---|
| jsDelivr CDN | Every measured `dist` file | `https://cdn.jsdelivr.net/npm/<pkg>@<ver>/<file>` |
| jsDelivr data API | Package file listings and raw sizes | `https://data.jsdelivr.com/v1/packages/npm/<pkg>@<ver>?structure=flat` |
| npm registry | Licence field, latest version, publish dates | `https://registry.npmjs.org/<pkg>` |
| GitHub REST API | Open issues, last push, stars, archived flag | `https://api.github.com/repos/<owner>/<repo>` |
| `web-features` 3.35.0 (Apache-2.0) | Every Baseline status, date and browser-version claim | `https://cdn.jsdelivr.net/npm/web-features@3.35.0/data.json` |
| bundlephobia | Cross-check on npm-entry sizes | `https://bundlephobia.com/api/size?package=<pkg>` |
| StatCounter Global Stats | Browser share, July 2026 | `https://gs.statcounter.com/browser-market-share` |
| W3C WAI-ARIA APG | Tabs, Carousel, Dialog, Disclosure patterns | `https://www.w3.org/WAI/ARIA/apg/patterns/` |
| WCAG 2.1 Understanding 2.2.2 | Pause/Stop/Hide obligations | `https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html` |
| Deque axe rule reference | `aria-hidden-focus` | `https://dequeuniversity.com/rules/axe/4.10/aria-hidden-focus` |
| Baseline definition | 30-month Widely-available rule | `https://web.dev/baseline` · `https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md` |
| Browserslist + Baseline | `widelyAvailableOnDate` config | `https://web.dev/articles/use-baseline-with-browserslist` · `https://www.npmjs.com/package/browserslist-config-baseline` |
| Ghost `sodo-search` measurement | §4.6 | `https://cdn.jsdelivr.net/npm/@tryghost/sodo-search@1.4.0/umd/sodo-search.min.js` |
| Ghost sodo-search suppression (**unverified**) | §4.6 open question | `https://forum.ghost.org/t/disabling-sodo-search-min-js-script-on-ghost-blog/31934` · `https://github.com/TryGhost/Ghost/issues/15162` |

### A2. Reproducing every size in this document

```sh
# Measured 2026-08-18. Method used for every "measured gzip" figure.
m() { curl -s -o /tmp/x.f "$2" && \
      echo "$1 raw=$(wc -c < /tmp/x.f) gzip=$(gzip -9 -c /tmp/x.f | wc -c)"; }

m "swiper core"        https://cdn.jsdelivr.net/npm/swiper@14.1.0/shared/swiper-core.min.mjs
m "swiper navigation"  https://cdn.jsdelivr.net/npm/swiper@14.1.0/modules/navigation.min.mjs
m "swiper pagination"  https://cdn.jsdelivr.net/npm/swiper@14.1.0/modules/pagination.min.mjs
m "swiper a11y"        https://cdn.jsdelivr.net/npm/swiper@14.1.0/modules/a11y.min.mjs
m "swiper keyboard"    https://cdn.jsdelivr.net/npm/swiper@14.1.0/modules/keyboard.min.mjs
m "swiper bundle"      https://cdn.jsdelivr.net/npm/swiper@14.1.0/swiper-bundle.min.js
m "embla"              https://cdn.jsdelivr.net/npm/embla-carousel@8.6.0/embla-carousel.umd.js
m "keen-slider"        https://cdn.jsdelivr.net/npm/keen-slider@6.8.6/keen-slider.js
m "glide"              https://cdn.jsdelivr.net/npm/@glidejs/glide@3.7.1/dist/glide.min.js
m "splide"             https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js
m "photoswipe"         https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.min.js
m "glightbox"          https://cdn.jsdelivr.net/npm/glightbox@3.3.1/dist/js/glightbox.min.js
m "sodo-search"        https://cdn.jsdelivr.net/npm/@tryghost/sodo-search@1.4.0/umd/sodo-search.min.js
```

Recorded results (raw bytes → gzip bytes): swiper-core `66,647 → 19,613`; swiper navigation `4,337 → 1,732`; pagination `9,311 → 3,009`; a11y `6,534 → 2,166`; keyboard `2,018 → 969`; autoplay `4,088 → 1,529`; shared utils `4,158 → 1,655`; swiper-bundle `151,578 → 43,287`; swiper-element-bundle `183,202 → 50,134`; embla `17,946 → 7,160`; embla-autoplay `2,451 → 1,060`; keen-slider `14,632 → 5,989`; glide `27,790 → 7,971`; splide `29,803 → 12,933`; photoswipe `54,270 → 16,358`; glightbox `56,343 → 15,249`; content-api `33,230 → 12,809`; fuse `26,415 → 8,545`; canvas-confetti `24,906 → 6,890`; focus-trap `11,911 → 3,998`; tabbable `6,054 → 2,452`; shufflejs `16,952 → 5,754`; aos `14,690 → 4,700`; tocbot `12,237 → 4,249`; lite-youtube `10,352 → 3,842`; typed.js 2.1.0 `9,843 → 3,100`; countup.js `5,930 → 2,007`; a11y-dialog `4,787 → 1,844`; **sodo-search `267,501 → 86,503`**.

### A3. Computing the browser floor from `web-features`

The §6.2 floor (Chrome/Edge 121, Firefox 122, Safari 17.2) was computed, not looked up:

```py
import json, urllib.request
d = json.load(urllib.request.urlopen(
      "https://cdn.jsdelivr.net/npm/web-features@3.35.0/data.json"))
CUT = "2024-02-18"          # 2026-08-18 minus 30 months
floor = {}
def v(x): return tuple(int(p) for p in str(x).split("."))
for feat in d["features"].values():
    s  = feat.get("status", {})
    lo = (s.get("baseline_low_date") or "").replace("≤", "")
    if not lo or lo > CUT:          # not yet Widely on the pinned date
        continue
    for browser, ver in (s.get("support") or {}).items():
        ver = str(ver).replace("≤", "")
        if browser not in floor or v(ver) > v(floor[browser]):
            floor[browser] = ver
print(floor)
# -> chrome 121, chrome_android 121, edge 121,
#    firefox 122, firefox_android 122, safari 17.2, safari_ios 17.2
# (641 features contributed to this floor)
```

Changing `CUT` to today's date yields the "Newly available" floor quoted in §6.1: **Chrome 148, Firefox 153, Safari 26.5** — which is why Newly is unusable as a blanket policy.

### A4. Open questions handed to the Architect

1. ~~**Can `sodo-search` be suppressed from `{{ghost_head}}`?**~~ **Moot under ruling R-24** — sodo *is* the search, so suppressing it would remove the feature rather than save its weight. Recorded because the 86.50 KB was real and someone will ask again. Original question: for themes shipping A23 Custom Overlay variants, verify against Ghost source, not forum posts. → FR-C5.
2. **Does `load-more` fetch theme HTML or the Content API?** This document recommends **theme HTML** (`fetch('/page/2/')` + `DOMParser`) so appended cards are byte-identical to server-rendered ones and no API key ships in the theme. Confirm this against FR-H2's Data-group model.
3. **Desktop mouse-drag on carousels** — build the vanilla pointer handling, and only if it proves fragile in the render matrix take the §3.6 Embla exception.
4. **The per-module size estimates in §4 are estimates.** Wire `size-limit` into CI from the first module merged so the real numbers replace these before GA.
