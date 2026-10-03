---
title: 'Story 6.1 — The token engine: computed or authored, and nothing in between'
type: 'feature'
created: '2026-10-03'
status: 'done'
owner_test: none
review_loop_iteration: 1
baseline_commit: '834a4159f133aa410cbcd5ed7b453818e9dd3614'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md']
---

## In plain English

After this story a Style Pack chooses only what is genuinely taste — its colours in light and in dark, its two fonts,
how strongly pictures are dimmed, how round a pill is, and one step on each of seven looks such as how round corners
are — and Inflozo works out everything else from those choices, like the colour of words on a dark band, so no pack can
get them wrong. Nothing new appears on your screens yet (choosing and editing packs come with Stories 6.2 to 6.4), but
the five sample sections change to match their drawings: the page is wider (1,296 px of content on a desktop), the
side margins and the space above and below each section shrink on tablets and phones as drawn, and a few colours on
dark bands are corrected — you approve those new photographs before they replace the old ones. Your two test Ghost
sites then prove the link look in a real theme, inside a post too, as you ruled, and every section design's
note about its dark-mode support is now checked against what the design really does.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The runtime carries one hand-written reference token set (Paper as drawn) in which nothing says which
values a pack chooses and which follow from those choices — so twelve packs would each answer the contrast ground, the
accent on it, the hover surface or the drop cap differently, and several of today's values are retired leftovers
(DW-155). Appendix D §D.0 marks only some rows, the page geometry is not the frames' (1,152 px content, 24 px margin),
`darkCapabilities` is declared by every design and read by nothing (DW-196), and R-173's link rule has never run on a
real Ghost or been ruled for a post's body (DW-224).

**Approach:** A pure token engine in `@inflozo/section-runtime`: a pack AUTHORS seven colours per mode, two fonts, a
scrim strength per mode, a pill radius and one step on each of seven scales; the engine COMPUTES every other property
of the contract by the rules in Design Notes and emits the token block — light on `:root`, the per-mode colours under
the two dark selectors, the responsive geometry under two width bands, R-173's link rule last. The reference set
becomes Paper's authored inputs run through the engine, Appendix D §D.0 names every row with its mark and a check holds
the two equal, the pilots take the frames' page geometry, `darkCapabilities` gets three checked words, and a probe theme
proves the link rule on T1 and T3.

## Boundaries & Constraints

**Always:**
- Every property of the contract belongs to exactly one row of `TOKEN_ROWS`, every row is `computed` or `authored`,
  and Appendix D §D.0 lists the same rows with the same marks — `tools/stress/test-vocabulary.mjs` fails on any
  difference, in either direction, and on a table it parses as empty. A new token enters both in the same commit.
- The engine reads only the pack's authored inputs (listed in Design Notes). A computed value never comes from a
  per-pack override; a pack that wants a different computed value changes an authored input.
- Every colour the engine computes for text holds ≥ 4.5:1 on the ground it is drawn on, by construction (the stepping
  rule), and the reference set reproduces R-110's on-accent (`#232019` / `#171511`) and R-112's link look (light: ink
  words, `underline #D96C3F`; dark: `#E0805A`, `underline`) exactly.
- Every block the engine emits ends with R-173's link rule (`LINK_RULES`) — there is no other way to emit a pack.
- The contract's JS maps stay complete: `REFERENCE_TOKENS.light` and `.dark` each carry every property (shared values
  in both), so `controls-review.ts`, `dark-mode.test.ts` and `test-vocabulary.mjs` read them as today. Only the CSS's
  dark blocks narrow to the per-mode properties.
- `packages/section-runtime` stays AD-1 pure: no `node:fs`, no app import. The colour maths is plain functions.
- Counts are derived, never written down (standing rule 4) — in code, tests, D.0 and every message.
- The scale step values are Question 2's ruled table and live in ONE place, the engine's `SCALES`; Appendix D names the
  steps and points at the ruling, never repeats the numbers.

**Ask First:**
- **The writes to T1 and T3** (Task 14): ask the owner in the Dev session itself, and run the recorder in the main
  session — never through a subagent (RESET-PROTOCOL.md:102-105; the classifier refused a subagent's approved writes at
  Story 5.24c). The writes are one probe theme uploaded, activated for the recording and deleted, with the previous
  theme restored and read back; and, only if Ghost's draft preview cannot be read, record-cards' own article published
  for the run and returned to draft in the same `finally`.
- **The mass rebaseline** (Task 16): the new photographs land only on the owner's approval of the sampled review
  (`docs/render-matrix.md` § The rebaseline rule), shown in the Dev session before the baselines commit.
- A pilot that overflows sideways at any viewport once the geometry moves is a defect this story fixes in that pilot's
  stylesheet; if the fix would change the design's look beyond its frame, stop and ask.
- A computed value of the reference set that cannot reach 4.5:1, or a rule whose result on Paper differs from Design
  Notes' expected values by more than rounding — stop and ask before choosing another rule.
- Question 2 ruled option 3 (drawn first): Dev does not start until the drawing is back and its values replace
  Design Notes' scale table.

**Never:**
- No new `*-tokens.css` beside `reference-tokens.css` — `tools/matrix/cases.mjs` reads every such file as a pack and
  doubles the matrix; widening the pack axis is Story 6.2's (DW-169).
- No pack switcher, no Style panel, no editor or canvas reading `projects.style_pack` (Stories 6.3, 6.4, 6.6); the
  canvas keeps reading `reference-tokens.css`.
- No font pool, no self-hosted faces, no change to the reference fonts (`Georgia, serif` / `'Inter', sans-serif`) —
  Story 6.2's. The engine takes the faces' metrics from the pack.
- No change to mode resolution: the two dark selectors stay as they are and no `scheme-*` class is added (Story 6.5).
- No `image-swap` word in `darkCapabilities`: nothing in the library draws a per-mode image yet, so nothing could
  falsify it; the word and its reader arrive with the first design that draws one.
- No edit to the design export (R-74); no change to `apps/web/lib/style-pack.ts`'s `PRESETS` (DW-15, Story 6.2).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Paper's link look (R-112) | reference pack, links `accent` | light `--link-color: #232019`, `--link-decoration: underline #D96C3F`; dark `#E0805A`, `underline` | — |
| Paper's on-accent (R-110) | authored `#232019` / `#171511` | emitted as authored; 4.77:1 and 6.43:1 on the accent | — |
| Accent already readable on the band | Paper light: `#D96C3F` on `#232019` is 4.77:1 | `--accent-on-contrast: #D96C3F` | — |
| Accent too pale on the band | Paper dark: `#E0805A` on `#F2EDE4` is 2.43:1 | stepped darker, hue kept: `#AC512B` (≥ 4.5:1) | — |
| Text on the band | any palette | whichever of background and text reads better on it (Paper: `#FBF9F5` / `#171511`) | — |
| Error colour | any palette | `#D92D20` stepped until ≥ 4.5:1 on background AND surface (Paper `#D92D20` / `#F04737`) | — |
| Body face without tabular figures | `body.tabular: false` | `--figures-tabular: normal` | — |
| Drop cap | Georgia (cap .6929) over Inter (cap .7275) | `--drop-cap-ratio: 3.504` | — |
| A step that does not exist | `width: 'huge'` | refused at the type, and at run time by a throw naming the row and its steps | throw |
| A colour that is not `#rrggbb` | `accent: 'orange'` | refused by a throw naming the role and mode | throw |
| Width bands | 1440 · 834 · 390 | `--site-margin` 72 · 40 · 20 px; `--space-section` 96 · 80 · 64 px | — |
| Dark blocks | any pack | carry exactly the per-mode properties; `:root` carries every property; each width block exactly the responsive ones | — |
| `darkCapabilities` short | `["tokens"]` on a design offering ≥ 2 Background values | `dark-capabilities`, naming `background` as missing | — |
| `darkCapabilities` long | `["tokens","background","override"]` with no own `darkOverride` control | `dark-capabilities`, naming `override` as unearned | — |
| Unknown word | `["tokens","image-swap"]` | `dark-capabilities`, naming the word and the three words there are | — |
| A mode in a stylesheet | `:root[data-mode="dark"] .x{}` or `@media (prefers-color-scheme: dark)` in `style.css` | `tokens` is not earned → `dark-capabilities` (AD-30's "fails the build") | — |
| A colour literal | `color: #fff` or `rgb(0 0 0 / .5)` in `style.css` | `tokens` is not earned → `dark-capabilities` | — |
| §D.0 drift | a row in code and not in §D.0, in §D.0 and not in code, or marked differently | `test-vocabulary.mjs` fails naming the row | — |
| Sideways overflow | a case wider than its viewport | the matrix fails that case | a positive control that is not detected voids the run |

</frozen-after-approval>

## Code Map

**The engine (`packages/section-runtime`, AD-1 pure):**
- `src/tokens.ts` — the contract and the reference values. `TOKEN_ROWS` (:19-62) maps a row name to its properties;
  its keys carry FR-E1 / D.0 prefixes that §D.0 does not use. `REFERENCE_TOKENS` (:76-160) is Paper written out by
  hand (Story 4.10's rule; rows no Paper object named kept Story 4.2's values — `--border-fade`, `--scrim`,
  `--accent-on-contrast`, `--plate`, `--negative`, dark `--bg-elevated`: DW-155). `block()` (:162) and
  `referenceTokensCss()` (:199-212) emit `:root`, the `prefers-color-scheme` block on `:root:not([data-mode="light"])`,
  `:root[data-mode="dark"]`, then `LINK_RULES` (:186-190, R-173 and DW-224's half). Every dark block redeclares the
  whole set today — which is exactly what would override a width-band value in dark, hence Design Notes' split.
- `src/tokens.test.ts` — the in-memory half of the contract: rows well-formed, light and dark the same set, values
  non-empty, every property in every block, R-173's zero specificity and ground rules. The header (:1-9) names
  `test-vocabulary.mjs` as the file-reading half.
- `src/index.ts:42` — exports `REFERENCE_TOKENS`; the engine's exports join it.
- `reference-tokens.css` — generated from `referenceTokensCss()`; no committed writer, the one-liner is in Verification.
  Readers: `apps/web/lib/pilots.ts:24,155` (the canvas document), `style-guide.ts:162`, `controls-review.ts:33`,
  `tools/matrix/cases.mjs:59`, `tools/check-traces.mjs:47-51` (must stay tracked), `package.json:8` export.
- The calibration data the rules were tested against (read-only): `…/claude-design-export/Inflozo/a29-kit.js:8-23`
  (Paper, Tangerine, Ink — every kit carries the same values) and `_build/a22lib.js` (Studio, Garden). The prototype run
  at Create: contrast ground = text matches 4 of 6 kit pack-modes exactly (Paper dark, Studio dark and Garden dim it by
  Δ6–10 — the designers disagree among themselves); on-contrast = background matches all six; hover is within Δ1–5.

**The rule document and its check:**
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` Appendix D §D.0 (:1031-1051) — `live`. Its
  table names nine rows; the code has rows it never lists (contrast ground, every FR-E1 row, AD-3's tag accent) and its
  "How" is wrong three times (an error red is not "derived from surface and border"; the light plate comes from the
  background; the drop cap depends mainly on the HEADING face). §D.a (:1053) follows — the table is cut between the two.
- `tools/stress/test-vocabulary.mjs` (:213-247) — the token checks that read bytes; runs inside `pnpm test`, so in CI
  and in `vercel build` (it imports `tokens.ts` by path and needs nothing from `tools/stress/node_modules`). Checks are
  `check(label, fn)` that throw (:35-43). Precedents for parsing a PRD table: `apps/web/plan.test.ts:95-111`,
  `tools/check-catalog.mjs:38-60`.

**The pilots, fixtures and post-body stand-in (DW-155):**
- `packages/library/designs/{a1/1,a4/13,a17/1,a22/1,a24/1}/style.css` — every root is full width with
  `padding-inline: var(--space-gutter)` (a1/1:5, a4/13:6, a17/1:5, a22/1:5, a24/1:6) and an inner box with
  `max-width: var(--site-width)` (a1/1:15, a4/13:14, a17/1:12, a22/1:13, a24/1:14). A17-1's column gap and pager read
  `--space-gap` (:23, :72). A17-1 and A22-1 read `--space-section*` (a17/1:5,8-9; a22/1:5,8-9); A4-13 writes the frame's
  ladder as literals (:6-8, :71, :85) and so does A24-1 (:6, :9-10, :83-85, :94-96). Button labels read
  `--text-on-accent` (a1/1:59, a4/13:34, a22/1:44). A1-1's bar height (:15-17) is A1's own reading and stays.
- The frames: `A1-1 Rail.dc.html` (side padding 72 · 40 · 20 at :32, :130, :157), `A4-13 Latest Post.dc.html`
  (716 + 64 + 516 = 1296 inside 96 × 72, :37-47), `A17-1 Three Up.dc.html` ("1,296 content width" :259, "the 24 px
  gutter" :153), `A22-1 Inline Row.dc.html` (1296 / 754 / 350 at :29, :77, :79), `A24-1 Centred.dc.html` (margin 72,
  :31; "margin 40 · measure 754", :157). The ladder: `A4-0 Category Proof.dc.html:132` ("Vertical padding Compact 64 ·
  Comfortable 96 · Spacious 132 at 1440; 56 / 80 / 108 at 834; 48 / 64 / 84 at ≤ 767. Page margin 72 · 40 · 20");
  the bands: `A1 Headers - Spec.md:19` ("Desktop ≥ 1024 · tablet 768–1023 · mobile ≤ 767"), `A4 Heroes - Spec.md:67`.
- `R Responsive System.dc.html`'s A.4 global ladder (side gutter 96/48/20, a 1248 measure, padding 64/96/128 at 1440)
  disagrees with every category frame above and flags its own numbers as speculative; no ruling chose between them,
  and this story's card (epics.md:2751) takes the category frames. Recorded in §D.0 and UX-DR2 (the prd.md and
  propagation tasks).
- `packages/library/fixtures/{controls/1,controls/2,controls/3,paywall/1,paywall/2}/style.css` — the same
  `padding-inline: var(--space-gutter)` (controls/1:4, /2:5, /3:4, paywall/1:4, paywall/2:3). `reference-design` reads
  neither token.
- `apps/web/lib/style-guide.ts` `THEME_CSS` (:105-130) — the post-body stand-in the style guide and the Paywall canvas
  load (`surfaceCss` :159); the render matrix does not. `--space-gutter` is its side margin three times (:111, :117,
  :119); `a{color:var(--link-color);text-decoration:var(--link-decoration)}` (:110) already gives every post-body link
  the pack's look on the canvas — which is what R-229 rules.
- `apps/web/lib/device.ts:26-30` — the editor previews only 1440, 834 and 390, so a band edge anywhere between them
  draws identically in the editor; real visitors between 768 and 1023 px see the tablet values.

**`darkCapabilities` (DW-196):**
- `packages/library/src/registry.ts:155` (`DesignJson`), `:203` (entry), `:255` (copied) — a bare `string[]`.
- `packages/library/src/vocabulary.ts:260` — `UniversalDef.darkOverride`; `:269-276` the `bg` universal is the only one
  carrying it. `ControlDef.darkOverride` at `registry.ts:32`; the only design-level one is `fixtures/controls/1/design.json:15`
  (`tint`). The editor keys on the declaration, never on `darkCapabilities` (`apps/web/lib/controls.ts:167,180,277,283`).
- `packages/library/src/validate.ts` — `Failure` / `push` (:30-32); `validateDesign` (:919-963) holds `input.css` and
  calls `validateStylesheet` (:961, :1053): the reader goes beside it. Callers all pass the stylesheet
  (`pilots.ts:52`, `controls-review.ts:43`, `tools/check-snapshots.mjs:70`, `test-vocabulary.mjs:85`).
- `packages/library/src/validate.test.ts` — refusals fire through `only(over, code)` (:654) beside a clean control
  (:493); stylesheet refusals through `said(css)` (:984), which keeps only `stylesheet-` codes, so its
  `:root[data-mode="dark"]` line (:988) stays valid there. The base `DESIGN` fixture declares `['tokens']` (:475).
  `apps/web/picker.test.ts:31` builds an entry with `[]` and never validates it — unaffected.
- Declared today: `["tokens"]` in all five pilots (a1/1:25, a4/13:30, a17/1:22, a22/1:20, a24/1:33) and six fixtures
  (controls/1:27, /2:20, /3:23, paywall/1:14, /2:16, reference-design:24). Every one offers ≥ 2 Background values; only
  controls/1 has its own `darkOverride`. Every stylesheet passes the `tokens` reader (scanned at Create).
- `docs/section-authoring.md:57, :66, :154` — names the field and shows `["tokens"]` without saying what it means.

**Sections span the site width (FR-F2, FR-G4):**
- `tools/matrix/matrix.spec.mjs` — per case: paint (:133-140), the height loop (:145-150), the photograph (:152-155),
  axe behind its positive control (:157-176). Nothing measures sideways overflow — an overflow present at baseline is
  baked into the PNG. The only overflow measure in the repo is the app's own (`tools/keyboard/floor.spec.mjs:97`).

**The T1/T3 proof (R-173, DW-224):**
- `tools/probe/record-shim.py` — `load_env` (:91-97, keys read in-process, never on argv), `Ghost` (:110-161),
  `PROBE_PREFIX` (:165), `start_guard` (:172-189), `restore_and_delete` (:191-230).
- `tools/probe/record-contexts.py` — `gate()` through `tools/stress/gate.js` at 0 errors on both majors (:189-204),
  `zip_bytes` (:207-212), `Void` (:68). `record-page-number.py` — the upload → activate → nonce → fetch → `finally`
  restore flow (:210-272), the theme's `package.json`/GS050/GS110 files (:88-116), `write_section` (:348-357), and the
  docstring-on-any-flag guard (:361-364).
- `tools/probe/run-verify-core.py` — the one recorder that drives Chromium on a probe theme: `DRIVER_JS` (:96) run by
  `node -e` (:230-235) inside `verify()` (:278-302). The computed-style read already exists at
  `run-verify-editor.cjs:1421-1427`.
- `tools/probe/record-cards.py` — its own article (`SLUGS` :75) carries a plain link (`packages/library/orbit-weekly/corpus.json:183`),
  printed by Ghost as a class-less `<a href>` on both majors (`packages/ghost-shim/fixtures/ghost6/article.json:52`, same
  in ghost5); it stays a draft between runs (`upsert_published` / `to_draft` :310-324). Card links all carry a class
  (`kg-btn`, bookmark, CTA, header, product), and Ghost's own `callout.css:52` forces the accent callout's links white.
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` — highest section §67
  (:4361); this story's is §68.
- `tools/doc-audit.py` (~:365) — a new `tools/probe/*` file needs its catalogue row, as `record-page-number.py`'s.

**Propagation targets:** `ARCHITECTURE-SPINE.md` AD-30 (:356 — lists the computed tokens by name, a list that goes
stale with this story); `epics.md` UX-DR2 (:286 — names R as "the collapse ladder"); `apps/web/lib/style-pack.ts:6-7`
(names Story 6.1 as the Style Pack editor's; it is 6.4's, with the brand's logo and menu 6.6's); `deferred-work.md`
DW-66 (:2006-2007, the same misattribution), DW-155, DW-196, DW-224.

## Tasks & Acceptance

**Execution:**
- [x] `packages/section-runtime/src/colour.ts` -- new: `#rrggbb` parsing (a throw for anything else), WCAG contrast
  ratio, sRGB mixing, and `stepToContrast(colour, ground, target)` — OKLCH lightness moved away from the ground in 0.005
  steps, hue kept, chroma scaled down 1 % at a time only where the gamut needs it -- one home for the maths the engine
  needs now and Story 6.4's live contrast check reuses
- [x] `packages/section-runtime/src/tokens.ts` -- the engine: `TOKEN_ROWS` re-keyed to §D.0's row names, each
  `{ source: 'computed' | 'authored', properties }`, with the new rows (page margin `--site-margin`; border fade on its
  own; site width and gutters split; `--button-text` in button style); the `Pack` type (Design Notes § The pack); `SCALES`
  (R-230's table, Design Notes); `packTokens(pack)` returning complete `light` / `dark` maps plus `tablet` / `mobile` maps
  of the responsive properties; `packTokensCss(pack)` emitting the block in Design Notes' shape, `LINK_RULES` last;
  `REFERENCE_PACK` (Paper as drawn) with `REFERENCE_TOKENS` and `referenceTokensCss()` derived from it, never written
  out -- one engine every pack goes through, so no pack can carry a value nobody chose
- [x] `packages/section-runtime/src/tokens.test.ts` -- R-229 (Question 1): `LINK_RULES` stays document-wide; assert
  that no `LINK_RULES` selector carries a `:not(…)` or names `.gh-content`, so the rule reaches a post's body -- DW-224
  built as ruled, and a later scoping cannot land unnoticed
- [x] `packages/section-runtime/src/index.ts` -- export `packTokens`, `packTokensCss`, `REFERENCE_PACK`, `SCALES`,
  `TOKEN_ROWS`' types and `colour.ts`'s `contrast` -- the API Stories 6.2–6.4 build on
- [x] `packages/section-runtime/reference-tokens.css` -- regenerate with Verification's one-liner -- the canvas, the
  matrix and the style guide read these bytes
- [x] `packages/section-runtime/src/tokens.test.ts` -- rewrite to the new shape and cover the I/O matrix: every engine
  row marked; the light and dark maps complete and equal in keys; `:root` declares every property, each dark block
  exactly the per-mode set, each width block exactly the responsive set; the Paper values of Design Notes' table; R-110
  and R-112 exact; every computed text colour ≥ 4.5:1 on its ground for Paper and for the kits' Tangerine and Ink
  palettes (test data copied from `a29-kit.js:13-22`, as calibration) — on-contrast, accent-on-contrast, negative, the
  Accent link and the Soft and Outline button labels (Solid's and Pill's label is the AUTHORED on-accent, whose AA is
  Story 6.2's to author and 6.4's to warn: the kits' white on Tangerine's light accent is 3.67:1);
  the throws on an unknown step and a non-hex colour; `LINK_RULES` at the end of every pack's block -- the one runnable
  check of the rules
- [x] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` -- Appendix D §D.0: one table row per engine
  row, named as the code names it, marked, with the rule in "How" (Design Notes' wording), the three wrong "How" cells
  corrected; one sentence that the scale steps' values are the engine's `SCALES` as ruled in R-230;
  the page-margin row citing the category frames and saying R Responsive System's A.4 numbers are superseded here --
  §D.0 is the normative half the check holds the code to
- [x] `tools/stress/test-vocabulary.mjs` -- (a) a check that cuts prd.md between `### D.0` and `### D.a`, parses the
  table's row names and marks, and compares them with `TOKEN_ROWS` in both directions, failing on zero rows parsed;
  (b) a check that every design under `packages/library/designs/` reads `var(--site-width)`; (c) adjust any existing
  token check the block's new shape breaks -- the AC's "no third state" and "span the site width", enforced in CI
- [x] `packages/library/designs/a1/1/style.css`, `a4/13/style.css`, `a17/1/style.css`, `a22/1/style.css`,
  `a24/1/style.css` -- roots' `padding-inline` → `var(--site-margin)`; A17-1's column gap and pager gap →
  `var(--space-gutter)`; A4-13's and A24-1's literal section padding → the `--space-section`, `-compact`, `-spacious`
  tokens, deleting their per-width padding overrides; button labels → `var(--button-text)` -- the pilots consume the
  geometry and the button row instead of approximating them
- [x] `packages/library/fixtures/{controls/1,controls/2,controls/3,paywall/1,paywall/2}/style.css` -- `padding-inline`
  → `var(--site-margin)` -- one meaning per token everywhere it is read
- [x] `apps/web/lib/style-guide.ts` -- `THEME_CSS`'s side margin (:111, :117, :119) → `--site-margin`; its `a{}` rule
  (:110) stays (R-229) -- the post-body stand-in follows the page geometry
- [x] `packages/library/src/validate.ts`, `registry.ts`, `validate.test.ts`, every `design.json` in `designs/` and
  `fixtures/`, `docs/section-authoring.md` -- `darkCapabilities` gets three words, each derived from the design itself
  (Design Notes § darkCapabilities); `validateDesign` refuses a declaration that differs from the derived set in either
  direction, or carries any other word, with one code, `dark-capabilities`, whose message names the missing, unearned
  or unknown words; when `css` is absent only `tokens`' presence is required; the pilots and five fixtures declare
  `["tokens", "background"]`, `controls/1` adds `"override"`; tests fire the code each way beside a clean control and
  feed the `said()` lines nothing new; the guide's paragraph and example say what each word means -- DW-196: a field
  nothing could falsify becomes one the build checks
- [x] `tools/matrix/matrix.spec.mjs` -- after the height loop, measure `scrollWidth − clientWidth` of the document for
  every drawn case and fail the case above zero, behind a positive control (a probe element wider than the viewport
  must be detected, then removed); `docs/render-matrix.md` § What fails (:46) gains the line -- "stays responsive
  within it", checked at every viewport of every design
- [x] `tools/probe/record-token-links.py` + `tools/doc-audit.py` catalogue row -- new recorder in
  `record-page-number.py`'s and `run-verify-core.py`'s shape (Design Notes § The proof): a probe theme carrying
  `reference-tokens.css`, gated at 0 errors on both majors, uploaded to T1 and T3 behind `start_guard`, read in Chromium
  in both modes, restored and deleted in a `finally`, written to MEASUREMENTS §68 behind its controls; docstring on any
  flag; run on the owner's in-session go (Ask First) -- the first theme that ships the token block, proving R-173 and
  R-229 on both majors
- [x] `ARCHITECTURE-SPINE.md` AD-30, `epics.md` UX-DR2, `apps/web/lib/style-pack.ts:6-7`, `apps/web/lib/controls-review.ts`
  (its "dark redeclares the same property set" comment, true of the JS maps and no longer of the CSS),
  `deferred-work.md` (DW-155, DW-196, DW-224 resolved with their proof; DW-66 amended), `epic-6-context.md` (a dated
  Dev sub-bullet) -- AD-30's named list becomes "the rows §D.0 marks computed"; UX-DR2 says R's A.4 margin and padding
  numbers are the token block's now; the comments name the right stories; the ledger closes on evidence (standing
  rule 3)
- [x] `packages/library/baselines/`, `tools/matrix/manifest.json` -- `bash tools/matrix/run-matrix-gate.sh --update` in
  the image; the owner's sampled review (one design per category, light and dark at 1440, before beside after, each
  with its cause in one sentence and its frame); on approval, after the Dev commit, a commit of the baselines and the
  manifest alone (the hook adds the generated boards) naming this story as the cause -- DW-155's "pilots re-baselined",
  NFR-6(a)'s mass rebaseline, the project's first

### Review Findings

*Code review, 2026-10-03 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier on T1, T3, GitHub Actions, Vercel and `app.inflozo.com`), then the deployed walks. Every patch is applied in the
Review commit, each new test seen red against the pre-review code. No question is the owner's. The deferred findings are
in the ledger with named owners (DW-317 to DW-321). The rest were dismissed as noise or as calls the spec already made.*

- [x] [Review][Patch] A stylesheet with a colour literal or a mode passed when the design left `tokens` out of
  `darkCapabilities` — the AC "a design stylesheet that names a mode or writes a colour literal is refused" was false
  (executed by three layers). The stray is now named whether or not the word is declared
  [`packages/library/src/validate.ts` `darkCapabilityFailures`]
- [x] [Review][Patch] The `tokens` reader refused `url(#fade)` as a colour literal, matched `data-mode-switch` as the
  mode, and missed `light-dark()` and `color-scheme` [`validate.ts` `untokened`; `docs/section-authoring.md`, which now
  also says a named colour is not caught]
- [x] [Review][Patch] The Accent link and the Outline label and border were checked on the page ground alone, though
  every pilot offers the surface ground — "≥ 4.5:1 on the ground it is drawn on" (Always). They take the accent only
  where it holds on both; Paper's values are unchanged [`packages/section-runtime/src/tokens.ts` `SCALES`; §D.0]
- [x] [Review][Patch] On-contrast text was never stepped, so a weak authored text gave unreadable band words (2.71:1
  executed); it is stepped to 4.5:1 [`tokens.ts` `modeTokens`; §D.0]
- [x] [Review][Patch] The negative's second step could undo its first on grounds that straddle mid-grey (2.48:1
  executed); it gives way to the better of black and white there [`tokens.ts` `negative`]
- [x] [Review][Patch] `packTokens` accepted an unbalanced quote in a font family (which swallows the next declaration),
  a non-boolean `tabular`, and threw a bare TypeError on a missing part; it refused `pillRadius: '0'` and a non-ASCII
  family name [`tokens.ts` `check`]
- [x] [Review][Patch] A misspelt token in a pilot, a fixture or `THEME_CSS` was caught by nothing; the declared-read
  sweep now covers every design, every fixture and the stand-in, behind a control. The §D.0 control gains a renamed
  property and a duplicated row; the `--site-width` sweep gains its control [`tools/stress/test-vocabulary.mjs`]
- [x] [Review][Patch] The recorder set `published` only after the publish answered, so a lost answer left the article
  public; and a re-run moved §68 past any later section [`tools/probe/record-token-links.py` — not re-run: it writes to
  T1 and T3; the section write is tested on copies]
- [x] [Review][Patch] `THEME_CSS`'s comment claimed its `a{}` rule is what a live site gets; it is broader, and R-229 is
  judged on T1/T3 [`apps/web/lib/style-guide.ts`]
- [x] [Review][Defer] A Soft or Outline button is drawn by no check, and an Outline label on a contrast ground is the
  ground's own colour in A4 #13 and A1 #1 [`tokens.ts` `SCALES.buttons`] — deferred to Story 6.2, DW-317
- [x] [Review][Defer] §68's dark rows set the system preference and `data-mode` together [`record-token-links.py`] —
  deferred to Story 6.5, DW-318
- [x] [Review][Defer] A signed-out `/pilots` answers 307 with the page's sample content in the body
  [`(authed)/layout.tsx`] — deferred, pre-existing, DW-319
- [x] [Review][Defer] A4 #13 (1024–1080) and A24 #1 (835–1023) change layout at one width and padding at another
  [`a4/13/style.css`, `a24/1/style.css`] — deferred to the category stories, DW-320
- [x] [Review][Defer] The negative is not held on the elevated ground, and the stand-in's caption inset is the page
  margin [`tokens.ts`, `style-guide.ts`] — deferred to their first readers, DW-321

**Acceptance Criteria:**
- Given the token contract and Appendix D §D.0, when `pnpm test` runs, then every row of `TOKEN_ROWS` appears in §D.0
  marked exactly as the code marks it and no §D.0 row is missing from the code — and adding a row to either alone
  turns the check red.
- Given a pack's authored inputs and nothing else, when `packTokens` runs, then every other property of the contract
  is computed by Design Notes' rules: on-contrast text, dark elevation, the scrim's colour, tabular figures, the drop-cap
  ratio and the rest are never asked for, and only scrim strength and pill radius are asked beyond the palette, the fonts
  and the seven steps.
- Given Paper as drawn, when the reference set is generated, then R-110's and R-112's values come out exactly, every
  computed text colour holds ≥ 4.5:1 on its ground, and `reference-tokens.css` equals `referenceTokensCss()` byte for byte.
- Given any pack, when its block is emitted, then it ends with R-173's link rule, the dark blocks carry only per-mode
  properties, and the two width bands carry only the responsive ones.
- Given the reference block on a probe theme on T1 (6.58.0) and T3 (5.130.6), when a page renders in light and in
  dark, then a plain link in a section reads the pack's link colour and decoration, a plain link on a contrast ground
  keeps the ground's words with an underline, a classed link keeps its own look, and a plain link inside a post's body
  takes the pack's link look too (R-229) — recorded in MEASUREMENTS §68 behind controls that would have failed otherwise.
- Given any design, when it validates, then its `darkCapabilities` equals the set derived from its stylesheet and
  controls — `tokens`, `background`, `override` — or `dark-capabilities` names the difference; and a design stylesheet
  that names a mode or writes a colour literal is refused.
- Given the five pilots, when drawn at 1440, 834 and 390, then their content column is 1,296, 754 and 350 px, their side
  margin 72, 40 and 20 px, and their section padding the A4-0 ladder — matching the frames `A1-1 Rail`, `A4-13 Latest
  Post`, `A17-1 Three Up`, `A22-1 Inline Row` and `A24-1 Centred` — and every design reads `var(--site-width)`.
- Given every case of the render matrix, when it is photographed, then nothing scrolls sideways, behind a positive
  control; and after the owner's sampled review the new baselines land in their own commit and the matrix is green.
- Given the story's changes, when the gates run, then `pnpm check`, `python3 tools/doc-audit.py --check` and
  `bash supabase/tests/run-rls-gate.sh` are green.

## Spec Change Log

## Design Notes

**The pack — what is authored.** Per mode: `background`, `surface`, `text`, `muted`, `border`, `accent`, `onAccent`
(`#rrggbb`), and `scrim` (a strength, 0–1). Once: `pillRadius`; `fonts.heading` and `fonts.body`, each
`{ family, capHeight }`, the body also `{ tabular }` (Story 6.2's pool will supply these per pairing; the reference
faces are Georgia, cap height .6929 from next@16.3.1's capsize metrics, and Inter, .7275 = 1490/2048 in
`apps/web/app/fonts/inter-latin.woff2`, whose subset keeps `tnum`); and one step each of `radius`, `density`, `width`,
`gutters`, `buttons`, `shadow`, `links`. `REFERENCE_PACK` is tokens.ts's current light and dark palette, scrim .45 / .6,
pill `999px`, those faces, and `soft`, `comfortable`, `normal`, `normal`, `solid`, `subtle`, `accent`.

**The rows, as `TOKEN_ROWS` and §D.0 both name them.** Authored: `palette` (the seven roles, both modes), `scrim
strength` (`--scrim`), `pill radius` (`--radius-pill`), `fonts` (`--font-heading`, `--font-body`), `radius scale`
(`--radius-card`, `--radius-control`), `spacing density` (`--space-section`, `-compact`, `-spacious`, `--space-gap`),
`site width` (`--site-width`), `gutters` (`--space-gutter`), `button style` (`--button-fill`, `--button-border`,
`--button-radius`, `--button-text`), `shadow level` (`--shadow-card`), `link style` (`--link-color`, `--link-decoration`).
Computed: `border fade`, `contrast ground`, `on-contrast text`, `accent-on-contrast`, `elevation`, `hover surface`,
`plate`, `negative`, `tabular figures`, `drop-cap ratio`, `page margin`, `tag accent` — one property each, below. A step
row's colours are computed from the palette, but the row is authored: the author is asked for the step.

**The computed rows** (prototype run at Create against the kits; Paper's expected results, with today's value where it
moves):

| Row → property | Rule | Paper light | Paper dark |
|---|---|---|---|
| contrast ground `--bg-contrast` | = text | `#232019` | `#F2EDE4` (was `#EDE7DA`) |
| on-contrast text `--text-on-contrast` | whichever of background and text has more contrast on the ground, stepped to 4.5:1 where even that falls short (Review) | `#FBF9F5` | `#171511` |
| accent-on-contrast `--accent-on-contrast` | the accent if ≥ 4.5:1 on the ground, else `stepToContrast(accent, ground, 4.5)` | `#D96C3F` (was `#e8a87c`) | `#AC512B` (was `#8a3b12`) |
| hover surface `--bg-hover`; plate `--plate` (the same rule — the specs make the plate the hover fill, `A18 Post Lists - Spec.md:266`) | halfway (sRGB) from whichever of background and surface is nearer the border, toward the border | `#F3EFE8` | `#2A261F` |
| elevation `--bg-elevated` | light: surface (its shadow lifts it); dark: halfway from surface toward border | `#FFFFFF` | `#2A261F` (was `#252220`) |
| negative `--negative` | `#D92D20`, stepped until ≥ 4.5:1 on background and on surface | `#D92D20` | `#F04737` |
| border fade `--border-fade` | text at 8 % (light), 10 % (dark) | `rgba(35, 32, 25, 0.08)` | `rgba(242, 237, 228, 0.1)` |
| tag accent `--tag-accent` | `var(--border-hairline)` (AD-3: Ghost's tag colour replaces it per element) | — | — |
| tabular figures `--figures-tabular` | `"tnum" 1` where the body face carries tnum, else `normal` | `"tnum" 1` | same |
| drop-cap ratio `--drop-cap-ratio` | ((3 − 1) × 1.7 + body cap) ÷ heading cap ÷ 1.7, three decimals: the heading-face initial spans three body lines (`A25 Post Content Layouts - Spec.md:149`; 1.7 is `THEME_CSS`'s body line height, which it multiplies back) | `3.504` (was `3`) | same |
| page margin `--site-margin` | fixed for every pack: `4.5rem` · `2.5rem` · `1.25rem` at ≥ 1024 · 768–1023 · ≤ 767 px | new | — |

The scrim's COLOUR is the darker of text and background (Paper `rgba(35, 32, 25, .45)` / `rgba(23, 21, 17, .6)`), its
strength authored; a shadow's colour is the text colour. The card's "scrim strength defaults … pill radius defaults"
(epics.md:2727-2728) reads with R-32 and §D.0: the value a new pack starts from; the pack always states both, so they
are authored rows. `--negative` and `--scrim` have no reader in the library yet; `--plate` and dark `--bg-elevated`
only the fixtures and `THEME_CSS`.

**The scale steps** (Question 2's table, ruled option 1 — R-230). Section padding is per band
(desktop · tablet · mobile); Compact and Airy multiply Comfortable's every value by 0.75 and 1.25, rounded to 0.25rem.

| Row | Step → values |
|---|---|
| radius → `--radius-card`, `--radius-control`, `--button-radius` | sharp `2px` · **soft `8px`** · round `16px` |
| density → `--space-section`, `-compact`, `-spacious`, `--space-gap` | **comfortable**: `6rem 5rem 4rem` · `4rem 3.5rem 3rem` · `8.25rem 6.75rem 5.25rem` · `1.5rem` (A4-0's ladder) |
| site width → `--site-width` | narrow `72rem` · **normal `81rem`** · wide `90rem` |
| gutters → `--space-gutter` (between columns) | tight `1rem` · **normal `1.5rem`** · loose `2rem` |
| buttons → `--button-fill`, `--button-border`, `--button-text`, `--button-radius` | **solid**: accent · `1px solid transparent` · on-accent · the radius step; soft: 16 % accent over background · `1px solid transparent` · the accent stepped to 4.5:1 on that fill; outline: `transparent` · `1px solid` the accent where it holds 3:1 on background and surface, else text · the accent where it holds 4.5:1 on both, else text (Review: a section sits on either); pill: solid with `--button-radius` = the pill radius |
| shadow → `--shadow-card` | none: `none`; **subtle**: light `0 4px 16px rgba(text, 0.08)`, dark `none`; lifted: light `0 12px 32px rgba(text, 0.14)`, dark `none` |
| links → `--link-color`, `--link-decoration` | **accent** (R-112): the accent and `underline` where it holds 4.5:1 on background and surface (Review), else text and `underline <accent>`; underline: text and `underline` |

**The block's shape.** `:root` declares every property (desktop values; light colours). The per-mode properties — the
palette, contrast ground, on-contrast, accent-on-contrast, hover, plate, elevation, negative, border fade, scrim,
shadow, link colour and decoration, button fill, border and text — are redeclared in the two dark blocks, and nothing
else is: a dark block that redeclared `--site-margin` would win over the width band in dark (both selectors are
(0,2,0) against the band's (0,1,0)). Then `@media (max-width: 1023px) { :root { … } }` and `(max-width: 767px)` with
only the responsive properties (`--site-margin`, the three section paddings), then `LINK_RULES`. Units stay `rem` as
today; breakpoints are `px` as the pilots write theirs.

**`darkCapabilities` — three words, each derived from the design.** `tokens`: its stylesheet writes no colour literal
(a hex, or `rgb`/`hsl`/`hwb`/`lab`/`lch`/`oklab`/`oklch`/`color()` — anywhere in a value, a `var()` fallback included;
`color-mix` over tokens and the keywords `transparent`, `currentcolor`, `inherit` are fine) and names no mode
(`prefers-color-scheme`, `data-mode`, `scheme-light`, `scheme-dark`) — so the pack's dark palette is its dark look, and
AD-30's "a design stylesheet that names … fails the build" gets its first reader. Required of every design (FR-G4's
"token-driven only"). `background`: it offers at least two Background-role values, so its ground can differ in dark
(FR-D7's Background role, the `bg` universal's `darkOverride`). `override`: one of its own controls declares
`darkOverride` (FR-F7). ponytail: named colours (`white`, `red`…) are not caught; add the list when a design writes one.

**The proof.** The probe theme's `default.hbs` carries `<style>{reference-tokens.css}</style>`, `{{ghost_head}}`, a
section `data-bg="contrast"` (background `var(--bg-contrast)`, colour `var(--text-on-contrast)`) holding a plain link
and a classed one, a plain link on the page ground, `{{{body}}}` and `{{ghost_foot}}`; `post.hbs` wraps `{{content}}`
in `<article class="gh-content">`. The post is record-cards' own draft article, read through Ghost's draft preview
`/p/{uuid}/` (a hypothesis: if it does not render with the active theme, publish for the run and return it to draft
in the same `finally`). Read in both modes (`data-mode` set on `<html>`): colour, `text-decoration-line` and
`-color` of each link. Controls, each voiding the run if it fails: the nonce theme is the one served; `--link-color`
resolves on `:root`; the classed link keeps its own colour; with the token `<style>` disabled the plain link's colour
changes. Expected: the section links as the I/O matrix says, and the body link in the pack's link colour and decoration
(R-229).

## Questions for the owner

The owner ruled Questions 1 and 2 at Create (R-229, R-230) and Questions 3 and 4 in the Dev session, all on
2026-10-03. No question is open.

### Question 1 — Should a link inside one of your posts look like a link in a section? (DW-224)

**In plain English.** A link someone types into a section's text is drawn in the pack's link style — in Paper, dark
words with an orange underline. The words of your posts come from Ghost, and their links can take the same style or
keep the browser's own. Ghost's buttons and cards inside a post keep Ghost's look either way, and so do the links on
Ghost's orange callout box, which Ghost always draws white.

**An example.** A Paper post says "My whole setup is fourteen lines of shell", and "fourteen lines of shell" is a link.

1. **The same look everywhere (RECOMMENDED).** That link is dark words with an orange underline, like a link in a
   section. The editor already shows posts this way, and nothing new has to be built.
2. **Sections only.** That link keeps the browser's blue, purple once visited, until a post-layout design gives post
   links a look of their own.

**Ruled: option 1 (owner, 2026-10-03).** *"The same look everywhere"* — recorded as R-229. The token block's link
rule stays document-wide, so a plain link a post's body prints takes the pack's look; `THEME_CSS` keeps its `a{}`
rule, and the T1/T3 proof expects the post's link in the pack's link colour and decoration.

### Question 2 — The drawings show only Paper's setting on each look. May I use these values for the others?

**In plain English.** Every pack picks one step on seven looks. The drawings show only the step Paper uses (in bold
below), so the other steps need values. These are mine, worked out from Paper's and the other drawn packs. Once Story
6.4 lands you can change any of them per project.

| Look | The steps, and what each gives |
|---|---|
| Site width | Narrow 1,152 px · **Normal 1,296 px** · Wide 1,440 px of content on a wide screen |
| Corners | Sharp 2 px · **Soft 8 px** · Round 16 px |
| Spacing | Compact, a quarter tighter · **Comfortable, as drawn** (96 px above and below a section on a desktop, 80 on a tablet, 64 on a phone) · Airy, a quarter roomier |
| Gutters | Tight 16 px · **Normal 24 px** · Loose 32 px between columns |
| Buttons | **Solid, the accent colour** · Soft, a pale accent fill with accent words · Outline, an accent outline with no fill · Pill, Solid with fully round ends |
| Shadow | None · **Subtle, Paper's soft card shadow** · Lifted, a deeper one — in dark mode all three draw no shadow, as Paper's dark drawing does |
| Links | **Accent, Paper's: orange words where they are easy to read, otherwise dark words with an orange underline** · Underline, words in the text colour with an underline in the same colour |

**An example.** A pack set to Round draws every card and button with 16 px corners, where Paper draws 8.

1. **Use these values (RECOMMENDED).**
2. **Use them with changes** — say which, for example "Round 20 px, Wide 1,400 px".
3. **Have them drawn first in Claude Design.** I write the prompt; this story waits until the drawing is back.

**Ruled: option 1 (owner, 2026-10-03).** *"Use these values"* — recorded as R-230. Design Notes' scale table is the
ruled one, and the engine's `SCALES` carries exactly those values.

### Question 3 — May Dev write to your two test Ghost sites? (Ask First, asked in the Dev session)

**In plain English.** To prove the link look in a real Ghost theme, Dev uploads a small test theme to ghost6.inflozo.com
and ghost5.inflozo.com, switches each site to it for about a minute while a browser reads the links in light and dark,
then switches back to the theme that was active, deletes the test theme and reads both back. If Ghost's private preview
of a draft cannot show the test theme, the existing test article is published for that minute and put back to draft.

**An example.** For that minute, a visitor to ghost6.inflozo.com sees a bare test page instead of the usual theme.

1. **Go, as described (RECOMMENDED).**
2. **Go, but never publish the article** — if the draft preview fails, stop and ask instead.
3. **Not now** — no writes; the story stops before its Dev commit.

**Ruled: option 1 (owner, 2026-10-03).** Run in the main session the same day. The draft preview showed the test theme on
both sites, so the article was never published (MEASUREMENTS §68).

### Question 4 — Do the new photographs of the five sample sections look right? (the sampled review)

**In plain English.** The new page geometry moves every photograph of a drawn section in the render matrix, and new
photographs replace the old ones only on your approval (`docs/render-matrix.md` § The rebaseline rule). Dev showed one
design per category, light and dark at desktop width, the old photograph beside the new one, each with its cause and
its frame, on a private review page.

**An example.** In A24 #1 Centred, the picture now runs the full 1,296 px with 72 px margins, as its drawing shows;
before, it stopped 144 px from each edge.

1. **Approve (RECOMMENDED)** — the new photographs land in their own commit, named after this story.
2. **Reject** — the cause is treated as a defect and fixed where it lives, and the old photographs stay.

**Ruled: option 1 (owner, 2026-10-03).** The baselines land in their own commit right after the Dev commit; DW-155 is
closed.

## Verification

**Commands:**
- `node -e "import('$PWD/packages/section-runtime/src/tokens.ts').then(m=>process.stdout.write(m.referenceTokensCss()))" > packages/section-runtime/reference-tokens.css`
  -- expected: `git diff` shows the values of Design Notes' table move, `--site-margin` and `--button-text` appear, the
  dark blocks shrink to the per-mode properties and two width blocks appear; the link rules unchanged (R-229).
- `node --test packages/section-runtime/src/tokens.test.ts packages/library/src/validate.test.ts` -- expected: pass;
  the Paper and AA cases red against HEAD's hand-written values, the `dark-capabilities` cases red against HEAD's
  validator.
- `node tools/stress/test-vocabulary.mjs` -- expected: pass; the §D.0 check red against HEAD's prd.md (it lists none of
  the FR-E1 rows) and red again with one row's mark flipped.
- `pnpm check` -- expected: green (lint, typecheck, every package test, the `pnpm test` tail).
- `python3 tools/doc-audit.py --check` (twice) and `bash supabase/tests/run-rls-gate.sh` -- expected: green; no
  migration in this story.
- `bash tools/matrix/run-matrix-gate.sh` before the rebaseline -- expected: red on the moved photographs only, the new
  overflow check green with its positive control reported; after the owner's review and `--update`, green.
- `python3 tools/probe/record-token-links.py` on the owner's in-session go (Ask First) -- expected: T1 (6.58.0) and
  T3 (5.130.6), light and dark, every control passing; the section links and the post-body link as Design Notes'
  § The proof expects; MEASUREMENTS §68 written; both sites back on their previous theme with no probe theme left,
  read back.

**Manual checks:**
- After the Dev push deploys: `/pilots` on app.inflozo.com at 1440 and 390 — the content column and margins match the
  five frames; a dark contrast band's link underline is visible. The walks (`run-verify-editor.cjs`, `-lock`,
  `-controls`) are re-run at Review, since the geometry moves where they measure.

### Results — Dev (2026-10-03)

Every key below is named by its variable in `tools/probe/.env`, never by its value. Every `pnpm` command ran under
Node 24.18.1 (`export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`; the shell's default is 22).

**The engine and its checks.**
- `reference-tokens.css` regenerated from `referenceTokensCss()`: Design Notes' values moved as its table says
  (`--accent-on-contrast` `#D96C3F` / `#AC512B`, dark `--bg-contrast` `#F2EDE4`, `--negative` `#D92D20` / `#F04737`,
  `--drop-cap-ratio` `3.504`, hover and plate `#F3EFE8` / `#2A261F`, the border fade and scrim from the text);
  `--site-margin` and `--button-text` appeared; each dark block shrank to the per-mode properties; two width blocks
  appeared; the link rules are unchanged but for their comment (R-229). `test-vocabulary.mjs` holds file and engine
  equal.
- `node --test packages/section-runtime/src/tokens.test.ts packages/library/src/validate.test.ts`: pass. The Paper case
  asserts values HEAD's hand-written set does not carry (`--accent-on-contrast` `#e8a87c` / `#8a3b12`, `--negative`
  `#a3231b` / `#e4736a`, the drop cap `3`), and the dark-capabilities case a code HEAD's validator never pushes.
- `node tools/stress/test-vocabulary.mjs`: pass. §D.0 and `TOKEN_ROWS` agree on rows, marks and properties, and the
  check's own control (one mark flipped, one row dropped, one invented) names each. With HEAD's prd.md swapped in it
  FAILS, naming every row HEAD's table lacks; prd.md was restored and compared byte for byte.
- Two additions in the main session after the implementation, each with its control:
  - the colour-literal reader now reads every declaration, so a literal beside a nested rule
    (`.x { color: #fff; & b { … } }`) is refused. The case is in `validate.test.ts`, and it FAILS with the first
    reader swapped back in (restored and compared afterwards);
  - the unknown-step case carries `@ts-expect-error`, so the typecheck itself fails the day `huge` becomes a step.

**The gates, on the final tree.**
- `pnpm check`: exit 0 — lint, typecheck, every package's tests, the vocabulary checks, the self-checks,
  check-baseline, check-catalog, check-snapshots (its hostile-input timing through the new reader) and `cases.test`.
- `pnpm keyboard`: every journey and floor stop passed; `next-env.d.ts` unchanged.
- `pnpm build && node tools/check-traces.mjs`: exit 0, "every route carries its files".
- `bash supabase/tests/run-rls-gate.sh`: exit 0. There is no migration in this story, so it has no Schema phase.
- `python3 tools/doc-audit.py --check`, twice: the first run regenerated the stale story board, the second passed.

**The render matrix** (`bash tools/matrix/run-matrix-gate.sh`, inside the pinned image):
- Before the rebaseline: red, and every failure is a `toHaveScreenshot` mismatch. 0 axe violations. No drawn case
  scrolls sideways, each measured behind its positive control.
- `--update`: every drawn case's photograph was retaken. `tools/matrix/manifest.json` is unchanged, so the runner is
  the same.
- The owner's sampled review, Question 4: one design per category, light and dark at 1440, before beside after, each
  with its cause and its frame, on a private review page. **Approved** in the Dev session. The baselines land in their
  own commit after the Dev commit, naming this story.
- After: green. No mismatch, 0 violations, nothing sideways.

**The pilots' geometry.** Read through the matrix's own render path (`cases.mjs`, `serve.mjs`) with `getComputedStyle`:
side margin, the width of the element held to `--site-width`, and the section padding.

| | 1440 | 834 | 390 |
|---|---|---|---|
| side margin, every pilot | 72 px | 40 px | 20 px |
| content column, every pilot | 1,296 px | 754 px | 350 px |
| section padding: A4 #13, A17 #1, A22 #1 (above and below), A24 #1 (above only, as its frame draws) | 96 px | 80 px | 64 px |
| A1 #1 Rail | a bar, no section padding (its frame) | | |
| sideways scroll, every pilot | 0 | 0 | 0 |

**Real services (R-82).**
- **T3 `ghost5.inflozo.com` (5.130.6) and T1 `ghost6.inflozo.com` (6.58.0).** `python3 tools/probe/record-token-links.py`
  ran in the main session on the owner's in-session go (Question 3).
  - Keys: `GHOST5_URL`, `GHOST5_STAFF_ACCESS_TOKEN`, `GHOST6_URL` and `GHOST6_STAFF_ACCESS_TOKEN`. The client also loads
    `GHOST5_CONTENT_API_KEY` and `GHOST6_CONTENT_API_KEY`, but no Content API call was made.
  - The probe theme passed gscan 4.49.7 (v5) and gscan 6.4.2 (v6), each with 0 errors and 0 warnings.
  - On each server:
    - `casper` was the active theme before the run, and `start_guard` passed.
    - `POST themes/upload/` returned HTTP 200 with the theme `inflozo-probe-token-links`. It was activated, and `/`
      served this run's nonce.
    - Ghost's draft preview `/p/{uuid}/` rendered record-cards' draft article through the probe theme, so the article
      was never published.
  - In Chromium, in light and in dark, every link row read as expected and every control held. The rows are in
    MEASUREMENTS §68.
  - In the `finally`, `casper` was re-activated and read back on both servers, and the probe theme was deleted. The
    installed themes afterwards: T3 `casper` and `source`; T1 `casper`, `racer` and `source`.
  - A separate read afterwards: both servers active on `casper`, no `inflozo-probe-*` theme, and the article `draft`.
- **Supabase, Vercel, Resend and Dodo were not reached by this phase.** No migration (the RLS gate runs in its own
  PostgreSQL 17 container), no email and no billing. Vercel publishes the Dev push through CI's `deploy` job.
  `/pilots` on app.inflozo.com and the walks (`run-verify-editor.cjs`, `-lock`, `-controls`) are Review's, on that
  deployment.

### Results — Review (2026-10-03)

Keys are named by their variable in `tools/probe/.env`, never by value. Node 24.18.1 throughout.

**The patched tree.**
- `pnpm check`: exit 0. `node tools/stress/test-vocabulary.mjs`: pass, the widened read sweep and its control included.
- `reference-tokens.css` still equals `referenceTokensCss()` byte for byte — no patch moved a Paper value, so no
  photograph moves and the matrix is not re-baselined.
- Control: the new `validate.test.ts` and `tokens.test.ts` cases FAIL with HEAD's `validate.ts` and `tokens.ts` swapped
  in (one and two tests red), and pass with the patches restored.

**Real services (R-82), on the Dev build `662689ee`.**
- **GitHub Actions** (`GITHUB_TOKEN`): CI's `check`, `rls` and `deploy` green; the Render matrix workflow green.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`): production READY, built from `662689ee`.
- **T3 `ghost5.inflozo.com` (5.130.6) and T1 `ghost6.inflozo.com` (6.58.0)**, read-only (`GHOST5_STAFF_ACCESS_TOKEN`,
  `GHOST6_STAFF_ACCESS_TOKEN`): both active on `casper`, no `inflozo-probe-*` theme, the article `draft` with its
  `updated_at` two days before the run — it was never published. Control: a zeroed secret answers 401 on both.
  MEASUREMENTS §68's rows equal the engine's values in rgb form, and each of its controls can fail.
- **`app.inflozo.com`, signed in** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`; throwaway accounts, deleted, user count
  unchanged):
  - `run-verify-pilots.cjs`: 0 FAIL, 152 PASS — every pilot, light and dark, desktop, tablet and phone, axe clean.
  - `run-verify-controls.cjs`: 0 FAIL, 115 PASS.
  - `run-verify-lock.cjs`: 0 FAIL, 86 PASS.
  - `run-verify-editor.cjs`, three runs, none with a FAIL:
    - on `662689ee`: 0 FAIL, 480 PASS, then a HARNESS ERROR — a 30 s Playwright timeout in step 90, waiting for the
      canvas to paint after a switch to the Post canvas (`painted('post')`). Not a result for the steps after it.
    - on the Review build `8c267e81` (CI `check`, `rls`, `deploy` and the Render matrix green; Vercel READY from it):
      0 FAIL, 683 PASS — step 90 passed — then a HARNESS ERROR at a different line, a 30 s timeout on step 100's
      sign-in `goto`.
    - on `8c267e81` again: **0 FAIL, 690 PASS**, exit 0, with three `stall` notes each retried once.
    - Two different lines, each passing in another run, and every run's accounts deleted with the user count
      unchanged (13 → 13): the stalls are the harness's known kind (DW-204, DW-222), not this story's.
  - The pilots, controls and lock walks ran on `662689ee`; the Review build changes no emitted CSS byte.
- **Supabase schema:** no migration in this story (`git diff --stat 834a4159 HEAD -- supabase/` is empty), so there is
  nothing for production to be behind on (R-99).

### Results — Deploy (2026-10-03)

**Executed at Deploy.** App code and tooling; no migration (`git diff --stat 834a4159 HEAD -- supabase/migrations` is empty),
so there is no schema step and `RLS-TEST.sql` ran in CI's `rls` job. `owner_test: none` — nothing new appears on the
owner's screens — so this Deploy is also Done.

- **CI, for HEAD `ffb3fafc1d1b4f56ccee14edcabba72d643774da`** (GitHub API, `GITHUB_TOKEN` by name): `ci.yml` run
  37125929757 — `check`, `rls` and `deploy` all `success`; `matrix.yml` run 37125929763 `success`.
- **Vercel, the production project** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT` by name): the deployment for that
  sha is `READY`, target `production`. `https://app.inflozo.com/sign-in` answers HTTP 200 and `https://inflozo.com/` 200.
- **Deployment: `dpl_2tr7UbiFV8yypNGZGjEbWEAUKb5k` (https://app.inflozo.com/).**
