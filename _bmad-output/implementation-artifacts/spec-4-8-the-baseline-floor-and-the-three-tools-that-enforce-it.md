---
title: 'Story 4.8 — The Baseline floor and the three tools that enforce it'
type: 'feature'
created: '2026-09-14'
status: 'in-review'
baseline_commit: 'bfd8ca19321a3a6b88d0160b33ac1c5295228e1d'
owner_test: none
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing you can see changes. This story fixes, by a date rather than by a list that moves on its own, the
oldest browsers every theme Inflozo makes must work in: Chrome and Edge 121, Firefox 122 and Safari 17.2,
all from early 2024. It then adds checks that run on every change and stop a design from using styling or
scripting those browsers lack. A short named list of newer touches, such as a frosted-glass bar or tidier
line breaks, stays allowed only where an older browser still shows a complete, readable section without
them.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-G8 pins the browser floor by date and names three tools to enforce it, but none of it exists yet.
There is no browserslist config, stylelint, `eslint-plugin-compat` or `size-limit` in the lockfile, so Story 4.10's
pilots and E9's categories would write CSS against nothing. Planning executed the tools, and the policy cannot be
wired as written:
- `browserslist-config-baseline` reads the pin from the **working directory's** `package.json`. Without it, today
  resolves to Firefox 123 and Safari 17.4.
- `stylelint-plugin-use-baseline` takes no date; its frozen data map is already wider than the pin (`mask-mode`).
- The plugin passes any feature an `@supports` tests, and it sees neither vendor prefixes nor nesting.
- Two Tier-2 entries misfit their tier: `mask-image` is Widely on the pin, and `text-wrap: pretty` is not Baseline.

**Approach:** Keep one copy of each thing:
- the pin in the root `package.json`;
- the tiers as data in `packages/library/baseline.json`, where `text-wrap: pretty` is the one entry that is not
  Baseline (R-105);
- the stylesheet rules in a root `stylelint.config.mjs`, which adds what the plugin cannot see.

`eslint-plugin-compat` runs over the modules, and `size-limit` over `bundle()`'s maximal `main.js`. One check,
`tools/check-baseline.mjs`, runs in `pnpm check` and does four things:
- recomputes the floor two ways;
- recomputes every Tier-2 date;
- diffs the plugin against the pin, row by row;
- carries a control for each tool.

## Boundaries & Constraints

**Always:**
- **Cite or execute** (standing rule 1). Planning executed the facts below in a scratch install; the Dev re-executes
  them in the workspace:
  - browserslist-config-baseline 0.5.0 with baseline-browser-mapping 2.11.23;
  - stylelint 17.15.0 with the plugin at 1.4.5 and at 1.4.6;
  - eslint 10.9.1 with eslint-plugin-compat 7.0.2;
  - size-limit 13.1.1 with @size-limit/file;
  - web-features 3.35.0 and 3.38.0.
- **One copy.**
  - The pin lives only in the root `package.json`, because that is where the config looks.
  - The Tier-2 entries and the plugin's named differences live only in `baseline.json`.
  - No floor version list is written anywhere: the check prints it.
  - The `browserslist` key lives in `packages/library/package.json` only. browserslist walks up from a file, so a
    root key would reach `next build`.
- **Every tool has a control that must pass before its result counts** (standing rule 2). The I/O rows marked
  *control* are that set.
- **Exact versions, no ranges**:
  - `stylelint` 17.15.0, `stylelint-plugin-use-baseline` 1.4.6, `browserslist-config-baseline` 0.5.0;
  - `eslint-plugin-compat` 7.0.2, `web-features` 3.35.0 (research §A3's dataset);
  - `size-limit` and `@size-limit/file` 13.0.3 (the spine's pins; re-execute the CLI form on them).

  A bump is a floor decision, and the check is what makes it reviewable.
- `pnpm check` runs everything. CI and the Vercel build (`vercel.json`'s `pnpm -w check`) therefore run it too.

**Ask First:**
- Moving the pin date, or changing an allowlist entry beyond R-105 (`text-wrap: pretty` kept) and what the
  recompute decides (`mask-image` leaves as Tier 1). R-105 admits no second entry that is not Baseline.
- Naming a plugin difference beyond `mask-mode` (refused) and the `cursor` values (admitted).
- Any dependency beyond the seven above. Any change to NFR-2's number or metric; that is Story 7.5's, per VERIFY
  row 27.

**Never:**
- **Never edit the design export (R-74).** This story has no screen, so it has no frame and no owner test.
- **None of the later stories' work:**
  - no HTML Baseline check (Story 7.8);
  - no render matrix, and no pin-bump trigger inside it (Story 4.11);
  - no compile-time or nightly size gate (Stories 7.5 and 7.33);
  - no module code.
- **No tool enters a generated theme.** Everything is a root devDependency, and nothing is written under `modules/`
  or `assets/`.
- **No linting of `apps/web` CSS.** FR-G8 governs theme CSS; Tailwind is the app's.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| The floor | the root pin `2026-08-18`; browserslist for `packages/library/modules/core.js`; §A3's method over web-features 3.35.0 | both give Chrome, Chrome Android and Edge 121, Firefox and Firefox Android 122, Safari and iOS 17.2. The check prints this and stores it nowhere | any browser that disagrees fails, and is named |
| The pin reaches the lint *(control)* | `new ImageCapture()` linted as `packages/library/modules/probe.js` | one `compat/compat` error naming Safari 17.2 | no such error fails: the pin did not reach eslint-plugin-compat |
| A Tier-2 entry | each `baseline.json` entry | Newly on the pin, and its `widely` equals `baseline_low_date` + 30 months. `text-wrap-pretty` alone carries no date and prints as "not Baseline on the pin, kept by R-105" | fails with "Widely on the pin: Tier 1, remove it", "not Baseline on the pin", "Baseline now: give it its date" (for `text-wrap-pretty`), or both dates |
| Tier 1 | `mask-image: linear-gradient(#000, transparent)`; `.a:has(> img)`; root `@media (…) { .a {…} }` | pass (`masks` is Widely from 2026-06-07) | N/A |
| Tier 2 | `text-wrap: balance`; `text-wrap: pretty`; `scrollbar-width: thin`; `@starting-style { .a { opacity: 0 } }` at root | pass | N/A |
| Tier 3 | `scrollbar-gutter: stable`; `text-wrap: nowrap`; `animation-timeline: view()`; `mask-mode: alpha` | each refused | stylelint names the property or value |
| The one exception *(control)* | a second entry carrying `notBaseline` added to `baseline.json` | refused: R-105 keeps `text-wrap: pretty` alone | the check names R-105 and the entry |
| `@supports` | `(backdrop-filter: blur(1px))`; `not (backdrop-filter: blur(1px))`; `(animation-timeline: view())`; `selector(:popover-open)` | the first two pass (A3-16's opaque fallback); the last two are refused | `inflozo/supports-tier-2` |
| Nesting | `.a { & .b {} }`; `.a { .b {} }`; `.a { @media (…) {} }` | each refused | `max-nesting-depth` |
| The three prefixes | the `-webkit-box` trio together; `-webkit-text-size-adjust: 100%`; `-webkit-user-select: none; user-select: none` | pass | N/A |
| Any other prefix | `-webkit-font-smoothing`; `-webkit-mask-image`; `::-webkit-scrollbar`; `@-webkit-keyframes`; `-webkit-linear-gradient()`; `display: -moz-box`; `-webkit-text-size-adjust: none`; a lone `display: -webkit-box`; a lone `-webkit-user-select` or `user-select` | each refused | the rule that owns that position |
| The plugin against the pin *(control)* | every identifier-shaped `css.properties` row of web-features 3.35.0, as a declaration, through the repo config | rows Widely on the pin pass; every other row is refused, except Tier-2 rows and `cursor` values | each disagreement fails, named in both directions |
| Ghost's card CSS | `packages/library/orbit-weekly/vendor/cards/css/*.css` | not linted: Ghost-authored, as `cards.js` is | N/A |
| The size | `bundle` of every registry module that has a source | `size-limit --limit "40 kB"` (brotli). Over the limit prints NFR-2's warning and passes | size-limit failing to run fails the check |
| The size *(control)* | the same file at `--limit "1 B"` | reports `passed: false` | anything else fails |

</frozen-after-approval>

## Code Map

- `package.json`
  - `:10` `lint`; `:12` the `test` chain; `:16-20` devDependencies.
  - It carries no `browserslist` key, and must keep none.
- `packages/library/package.json:12` — the test glob. The `browserslist` key goes here.
- `eslint.config.js`
  - `:149-156` — the `packages/library/modules/*.js` block (`no-undef`), where `compat` joins.
  - `:28` `NOT_CORE`.
- `packages/library/src/modules.ts` — `MODULES` `:15`, `bundle(names, sources)` `:76-98`, imported the way
  `tools/stress/test-vocabulary.mjs:17-31` imports `src/index.ts` (Node 24 type stripping, reads files, run by root
  `test`).
- `packages/library/modules/core.js` — reaches the platform only as `win.*`, which eslint-plugin-compat cannot see
  (executed).
- **What stylelint lints today** (all clean in planning):
  - `packages/library/fixtures/reference-design/style.css:1-2`, whose comment already says no nesting;
  - `fixtures/controls/1/style.css`;
  - `packages/section-runtime/reference-tokens.css`.
- **Excluded:** `orbit-weekly/vendor/cards/css/` — Ghost's own, with `-webkit-appearance` at `audio.css:210` and the
  trio at `bookmark.css:44,52-53`.
- `prd.md`
  - FR-G8 `:301-307`; FR-J17 `:416`, which cites "§7.3" for the floor, where FR-G8 is meant.
  - NFR-2 `:474-476`: 40 KB, and a warning rather than a failure. §7.1 `:507-508`; §7.6 item 17 `:718`.
- `research-section-js-libraries.md` — §6.2 `:467-489`; §6.5 `:529-539`, whose allowlist at `:537` has 5 entries;
  §6.6's prefix table `:545-557`; §6.7 `:559-568`, which pins plugin 1.4.5 and says gzip; §A3 `:696-722`.
- `ARCHITECTURE-SPINE.md` — AD-34's note that the two floors "do not track each other" `:370`; the stack rows
  `:450-454`, which say plugin 1.4.5 and "the 484 flat stylesheets".
- `VERIFY-AT-BUILD.md` rows 17 `:45`, 26 `:144`, 27 `:145` and 55 `:277`. `MEASUREMENTS.md` §9 `:223-225` and
  §31c `:2484`; §42 `:3042` is the last section.
- `reconcile-designs-decisions.md`: R-3 `:283-287` (A32's fade uses `mask-image`), R-15 `:510-518`, and R-105 in
  §A25, this story's ruling, whose ⬜ targets the Dev run ticks.
- **The design export, read only:**
  - `A3-16 Mini Bar.dc.html:110,191` — "where `backdrop-filter` is unavailable the ground goes fully opaque", the
    reason `@supports` survives.
  - `A8-2 Three Up.dc.html:35` — `text-wrap:pretty` on a section heading. Every design file uses it (kits 76 times).
  - `-webkit-font-smoothing` appears once per frame, in the frame's own `body` rule: chrome, never design CSS.
- `docs/section-authoring.md` — the controls list `:13-26`, `### style.css` `:419-424`, the module lint `:477-481`.
- `tools/doc-audit.py:237` — a `tools/*.mjs` row's shape. `deferred-work.md` DW-136 `:3400` is the last entry's
  shape. `epics.md:1481-1515` is Story 4.11, which has no pin-bump trigger.
- `pnpm-workspace.yaml:13-17` — pnpm 11's minimum-release-age gate. All seven pins are older than a day.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` · `packages/library/package.json` · `pnpm-lock.yaml`:
  - add the seven devDependencies at exact versions;
  - add `"browserslist-config-baseline": { "widelyAvailableOnDate": "2026-08-18" }` at the root;
  - add `"browserslist": ["extends browserslist-config-baseline"]` in the library;
  - `lint` becomes `eslint . && stylelint "packages/**/*.css"`, and `test` ends with `node tools/check-baseline.mjs`.

  The pin is in the one place every tool reads.
- [x] `packages/library/baseline.json`:
  - `tier2` entries of `{ feature, widely, css | html, why }` for backdrop-filter, text-wrap-balance, scrollbar-width,
    scrollbar-color, starting-style, details-name (html) and fetch-priority (html);
  - `text-wrap-pretty` (`text-wrap: pretty`) with no `widely` and a `notBaseline` reason citing R-105; `mask-image`
    gets no entry;
  - `plugin` differences: `refused: ["mask-mode"]`, and `admitted` for `cursor` values with a reason.

  FR-G8's version-controlled allowlist is data AD-34's gate can read later.
- [x] `stylelint.config.mjs`:
  - `plugin/use-baseline` at `available: "widely"`, whose `ignoreProperties` and `ignoreAtRules` are built from
    `tier2`, plus `user-select` for the prefix pair. Values are merged per property, because `text-wrap` carries
    two entries: a last-wins map refuses `balance` (executed);
  - `max-nesting-depth: 0`;
  - the prefix closure — `property-disallowed-list` (with `mask-mode`), `declaration-property-value-allowed-list` and
    `-disallowed-list`, and `function-`, `selector-pseudo-element-`, `selector-pseudo-class-`,
    `media-feature-name-` and `at-rule-disallowed-list` on `/^-/`;
  - two small plugin rules, `inflozo/supports-tier-2` (an `@supports` condition may test only a Tier-2 property) and
    `inflozo/prefix-pairs` (the trio all or none; `-webkit-user-select` and `user-select` only together, with one
    value, so the diff's lone `user-select` row stays refused);
  - `ignoreFiles` covering Ghost's vendored CSS.

  Everything the plugin cannot see, in one file.
- [x] `eslint.config.js` — `compat/compat: 'error'` in the modules block, with a comment giving its reach (bare
  globals only). This is the JS half of the floor.
- [x] `tools/check-baseline.mjs` — every row of the I/O matrix, controls first:
  - the floor both ways;
  - the Tier-2 recompute. `notBaseline` is accepted on `text-wrap-pretty` alone, and only while it still has no low
    date on the pin (R-105);
  - the plugin-versus-pin diff through the real config;
  - the stylelint fixture sheets, inline, via stylelint's Node API;
  - the `ImageCapture` lint via ESLint's `lintText`;
  - `bundle` to a temp file, then `size-limit --json` run from the repo root, where it finds `@size-limit/file`.

  It prints the floor and ends `check-baseline: PASS`. VERIFY row 17's recompute and row 26's diff become automatic.
- [x] `tools/doc-audit.py` — a catalogue row naming what the check covers, including `baseline.json` and
  `stylelint.config.mjs`, which the catalogue cannot index. The gate blocks an uncatalogued tool.
- [x] `docs/section-authoring.md` — expand `### style.css` with:
  - the pin and where it lives; the tiers; `baseline.json`, and R-105's one exception;
  - Tier 2's conditions: an unstyled fallback, no layout, contrast or interaction, and a scrim (review rules, not
    lint);
  - `@supports`; nesting; the three prefixes;
  - running `pnpm lint`;
  - that a pin bump needs a render-matrix re-run.

  In the module part, state compat's reach: a module's other APIs are read against web-features at the pin, as
  MEASUREMENTS §42 did for `core`. This is the contract E9–E11 write against.
- [x] `prd.md` · `research-section-js-libraries.md` · `ARCHITECTURE-SPINE.md` · `VERIFY-AT-BUILD.md` ·
  `MEASUREMENTS.md` · `deferred-work.md` · `epic-4-context.md` · `reconcile-designs-decisions.md` — propagate
  (standing rule 3):
  - FR-G8: `mask-image` is Tier 1 by recompute; `@supports`; R-105, which makes Tier 2 "Newly features, and
    `text-wrap: pretty` by name". FR-J17's "§7.3" becomes FR-G8.
  - Research: §6.5's list becomes a pointer to `baseline.json`, with R-105; §6.7 gets plugin 1.4.6, brotli and the
    diff.
  - Spine: the stack rows (1.4.6, no count) and AD-34's note.
  - VERIFY: rows 17, 26 and 55 move to the check.
  - MEASUREMENTS: §43, the planning facts plus the Dev's re-execution.
  - DW-137: no tool checks HTML Tier 2 or Tier 3 (owner Story 7.8).
  - DW-138: the render matrix does not refuse a pin it did not run against (owner Story 4.11).
  - The epic context: sub-bullets.
  - The register: tick R-105's ⬜ targets as each lands.

  Then grep for "`mask-image` is Tier-2", "1.4.5", "484 flat" and "gzip" beside size-limit (standing rule 7).

### Review Findings

Code review, 2026-09-14, five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier). Every patch below is applied and its control executed; the one decision is Q2 under Questions for the owner.

- [ ] [Review][Decision] A Tier-3 at-rule form or function passes `pnpm lint` — the plugin knows an at-rule by name
  only and the diff covers `css.properties` rows; executed: `@container style(--x: 1)`, `if()`, `sibling-index()`,
  `random()` all pass. Q2 below; DW-139. Docs now say what lint does not catch.
- [x] [Review][Patch] `inflozo/supports-tier-2` compared only the leading letters of a value (`balance2` read as
  `balance`), and its value-narrowing had no control [stylelint.config.mjs:48; tools/check-baseline.mjs refusedRows]
- [x] [Review][Patch] A `baseline.json` entry's `feature` was never linked to its `css`/`html`, and an entry naming
  nothing passed; now each must name exactly one of the two and it must be a compat key of the feature, with a
  control [tools/check-baseline.mjs tier2Findings]
- [x] [Review][Patch] The "Baseline now: give it its date" branch had no control [tools/check-baseline.mjs controls]
- [x] [Review][Patch] The §A3 floor used its own Widely test (`low > pin − 30 months`), which disagrees with
  `widelyOnPin` on day-clamped dates; one definition now [tools/check-baseline.mjs floorFromWebFeatures]
- [x] [Review][Patch] A pin that is not `YYYY-MM-DD` made every date compare silently wrong, and a `BROWSERSLIST` /
  `BROWSERSLIST_CONFIG` variable overrides every config file unseen; both refused up front [tools/check-baseline.mjs]
- [x] [Review][Patch] The ImageCapture control hard-coded `Safari 17.2` and `=== 1`; it now names the Safari
  browserslist resolved, and says so when the floor has passed 17.4 (a pin bump needs a newer probe API)
  [tools/check-baseline.mjs]
- [x] [Review][Patch] `browserslist-config-baseline` reads the pin from the working directory, so ESLint started
  anywhere but the root linted against today's floor and said nothing; it now throws [eslint.config.js]
- [x] [Review][Patch] `size-limit` failing with no stdout printed `undefined`; a non-Error throw printed `undefined`
  [tools/check-baseline.mjs sizeLimit, check]
- [x] [Review][Patch] The docs' Tier-1 (`container-type`, `color-mix()`, `subgrid`) and Tier-3 (`anchor-name`,
  `field-sizing`) examples were not executed; they are rows now, with `-apple-system` (the export's font stack, a
  keyword not a prefix) as a legal row [tools/check-baseline.mjs; docs/section-authoring.md]
- [x] [Review][Patch] Doc drift: "everything else is refused by `pnpm lint`" overstated; the trio row's `overflow:
  hidden` is review's, not lint's; `lintAllEsApis: true` executed (no change) and compat's real job named; the
  root-only ESLint rule [docs/section-authoring.md:441-560; eslint.config.js]
- [x] [Review][Patch] Propagation: `mask-image` still "Tier-2" in two live rows of the register (R-3, R-15); no
  `stylelint` row in the spine's stack table; DW-137 had no reading of where the two `html` entries are used; the
  spec's Results cited `epics.md:240` (the CSS budget) for NFR-2's "gzipped"; the doc gate was not recorded; the
  doc-audit row named Safari 17.2 [reconcile-designs-decisions.md:78,517; ARCHITECTURE-SPINE.md; deferred-work.md;
  tools/doc-audit.py; this spec]
- [x] [Review][Patch] Reproducibility notes from the real-infra run recorded under Verification [this spec]
- [x] [Review][Defer] NFR-2's "40 KB" names no base: `size-limit`'s `40 kB` is 40,960 bytes [tools/check-baseline.mjs
  sizeLimit] — deferred, pre-existing (Story 7.5 owns the number and metric; DW-140)

Dismissed with evidence: the lockfile's absence from the reviewed diff (the seven pins verified in the lockfile and by
a frozen install); the merge logic written in both the config and the check (deliberate — two computations, and the
`text-wrap: balance` row catches a last-wins bug independently); upper-case `-WEBKIT-BOX` (refused by the value list;
executed); generalising the prefix regex to `-apple-system` (the export uses it in every frame); a duplicated
declaration inside one rule refused by `inflozo/prefix-pairs` (a flat sheet with a contradictory duplicate is refused
rightly); a line-less stylelint warning in the diff (rows are regex-guaranteed identifiers); an empty stylelint glob
(the check asserts Ghost's sheets are found); §43(c)'s "through the plugin alone" beside the check's "through the
config" (two measurements, both labelled); `scrollbar-gutter` called Tier 3 while Baseline Newly (Tier 3 is "not
Widely and not on the list"); DW-138 not repeated in `epics.md` (it reached the epic context and the ledger's owner);
the research table's plugin release date after its "measured 2026-08-18" header (the header dates the sizes; release
dates are the registry's).

**Acceptance Criteria:**
- Given the root pin, when `pnpm check` runs, then the check prints the computed floor and every I/O row holds.
  Each control fails when its subject is broken: the pin removed, a `widely` date altered, `mask-mode` dropped from
  `refused`, a second `notBaseline` entry, a 1 B limit (FR-G8, R-105).
- Given the repository's stylesheets, when `pnpm lint` runs, then they are clean, Ghost's card CSS is not linted, and
  the two custom rules fire only on their matrix rows (FR-G8, §7.1).
- Given the gates, when `pnpm check`, `pnpm build` and `python3 tools/doc-audit.py --check` (twice) run, then all are
  green on Node 24, `next build` sees no browserslist key, and no tool enters `packages/library/modules/` or any theme
  output.

## Spec Change Log

## Design Notes

**The two floors, and why the check diffs them.**
- `browserslist-config-baseline` honours the date. The stylelint plugin encodes each feature as status plus year,
  frozen at its publish date, and takes `"widely"`, `"newly"` or a year: never a date (SPINE `:370`, VERIFY row 26).
- Executed against web-features 3.35.0 at the pin, over properties and values:
  - plugin 1.4.6 lets through 4 `mask-mode` rows and 33 `cursor` values, and refuses nothing Widely;
  - plugin 1.4.5, the spine's pin, also refuses 10 Widely `offset-path`/`offset-position` rows.
- So 1.4.6 is pinned.
- `mask-mode` is refused: Safari lacks it.
- `cursor` values are admitted. web-features marks them non-Baseline only because touch Safari draws no cursor;
  `css.properties.cursor` itself is Widely.
- At-rules, selectors, functions and units are not diffed, because their syntax is irregular; the fixtures cover
  the named cases.
- A scratch prototype of this config and both custom rules held in planning, re-run after R-105:
  - 2,356 rows: 0 wider and 0 narrower, with `text-wrap: pretty` admitted as a Tier-2 row;
  - the legal sheet, `text-wrap: pretty` included: no warnings;
  - all 19 refusal rows, `text-wrap: nowrap` included: refused by the rule the matrix names.

**`@supports`.** The plugin exempts whatever the condition tests, so `@supports (animation-timeline: view())` passes
it (executed). A3-16 draws a translucent bar whose ground goes opaque where `backdrop-filter` is missing, and that
needs a Tier-2 test. So a condition may name only Tier-2 properties. Tier 1 never needs a test, and Tier 3 may not
use one. No design in the export uses `@supports` today.

**The Tier-2 dates**, from web-features 3.35.0 (`baseline_low_date` + 30 months):

| Entry | Widely on |
|---|---|
| backdrop-filter | 2027-03-16 |
| text-wrap-balance | 2026-11-13 |
| scrollbar-width | 2027-06-11 |
| scrollbar-color | 2028-06-12 |
| starting-style | 2027-02-06 |
| details-name | 2027-03-03 |
| fetch-priority | 2027-04-29 |

The planning dates for the remaining features:
- `masks` became Widely on 2026-06-07, so `mask-image` is Tier 1 by FR-G8's own "recompute rather than assume".
- `text-wrap-pretty` has no low date: Chrome 117 and Safari 26 support it, Firefox does not. R-105 keeps it by name
  with no date. The day it gains a low date on the pin, the check asks for its `widely` date and for `notBaseline` to
  be removed, and it becomes an ordinary Newly entry.

```json
{ "tier2": [
    { "feature": "text-wrap-balance", "widely": "2026-11-13",
      "css": { "property": "text-wrap", "values": ["balance"] }, "why": "unbalanced lines are the unstyled state" },
    { "feature": "text-wrap-pretty", "css": { "property": "text-wrap", "values": ["pretty"] },
      "notBaseline": "no Firefox; ordinary line breaks are the unstyled state — kept by R-105 (owner, 2026-09-14)" } ],
  "plugin": { "refused": ["mask-mode"], "admitted": { "cursor": "touch browsers draw no cursor; nothing to degrade" } } }
```

**eslint-plugin-compat's reach.** It flagged `requestIdleCallback` and `window.ImageCapture` at Safari 17.2. It
missed `win.ImageCapture`, `Object.groupBy`, `Promise.withResolvers`, `AbortSignal.any` and every instance method,
because its metadata knows bare globals only. `ImageCapture` makes the pin-sensitive control: Safari 17.4 has it, so
an unpinned lint passes it.

**`size-limit`.** Its default metric is brotli (VERIFY row 27): `core.js` measures 2.25 kB brotli and 2.63 kB gzip.
It exits 1 over its limit, while NFR-2 wants a warning, so the check reads `--json`. "Maximal" is every registry
module that has a source, which today is `core` alone. Stories 7.5 and 7.33 point it at compiled themes.

## Questions for the owner

**Q1. May designs keep using `text-wrap: pretty` — the setting that stops a paragraph or heading ending on one
lonely word — even though Firefox does not support it yet?**

The browser rule you approved (FR-G8) keeps a short list of newer styling touches that a design may use as long as
a browser without them still shows a complete, readable section. That list names `text-wrap: pretty`. The same rule
also says every feature on the list must already have shipped in all the major browsers. Checked against the data
the rule is computed from, `text-wrap: pretty` has not: Chrome and Safari support it, Firefox does not. The two
halves of the rule cannot both be true, so one has to give. The design export uses it almost everywhere — headings,
captions and body text in nearly every design.

Example: the heading "What readers say about the Thursday letter" on A8-2 Three Up. In Chrome or Safari the last line
keeps "Thursday letter" together. In Firefox it wraps the ordinary way and may leave "letter" alone on the last
line. Nothing is hidden, cut off or harder to read.

1. **Keep it, as the one named exception on the list (RECOMMENDED).** Designs keep the line breaks they were drawn
   with, and Firefox visitors get ordinary line breaks. The automatic check marks it "not yet in every browser" each
   time it runs, so it is looked at again whenever the date moves.
2. **Remove it.** The build refuses it, every design drops it when built, and every browser gets ordinary line
   breaks — which no longer matches the export in Chrome and Safari.
3. **Keep it, and let the list admit any feature like it.** Any touch whose absence costs only polish may join,
   whether or not every browser has it. This is wider than today's rule, and future additions would not come back to
   you.

**Ruled: option 1 (owner, 2026-09-14).** Recorded as **R-105** in `reconcile-designs-decisions.md` §A25.
`text-wrap: pretty` stays on the Tier-2 list by name, carries no Widely date, and is re-read at every check. A second
feature that is not Baseline needs its own ruling: option 3 was declined.

**Q2. Should the stylesheet check also refuse newer styling that has no property name of its own — a newer form of
an existing rule, or a function used inside a value — now, or should that wait for the theme quality gate?**

Today the lint refuses newer styling by its property name, and the check proves that list against the browser floor.
Two kinds of newer styling have no property name: a newer form of an existing rule (a container query that tests a
style, `@container style(...)`) and a function used inside a value (`if()`, `sibling-index()`). Checked at the review:
all of them pass the lint today. No design in the export uses any of them. Until a check exists, the reviewer reads
for them by hand, the way a module's browser features are already read.

Example: a section stylesheet writes `color: if(style(--dark): white; else: black)`. Chrome understands it; Firefox
and Safari at the floor do not, and the text keeps whatever colour came before. The lint says nothing. A reviewer who
reads the sheet catches it; one who trusts the lint does not.

1. **Wait for the theme quality gate, Story 7.8 (RECOMMENDED).** That gate already walks every compiled theme for
   valid HTML, and the HTML half of the browser floor is going there too (DW-137), so these forms join the same walk.
   Until then the docs say what the lint does not catch, and review holds it. Recorded as DW-139.
2. **Extend the check in this story now.** Story 4.8 stays in development for one more pass: one probe per rule,
   selector and function row of the browser data, and a rule that refuses them by name. More coverage sooner; more
   code in a story that is otherwise finished.
3. **Refuse every `@container` condition and every function the data does not know, outright, now.** Safer than 1
   and cheaper than 2, but it also refuses forms that are fine today, and each would need an exception when it turns
   out to be safe.

**Ruled:** _(awaiting the owner)_

## Verification

**Commands:**
- `pnpm install --frozen-lockfile && pnpm check` (Node 24) -- expected: exit 0.
  - `lint` runs stylelint over `packages/**/*.css`.
  - `test` ends with `check-baseline: PASS`, having printed `chrome 121 · chrome_android 121 · edge 121 ·
    firefox 122 · firefox_android 122 · safari 17.2 · safari_ios 17.2`.
- The controls, each in a scratch copy and then restored -- expected: non-zero, naming the subject:
  - the root pin removed: floor mismatch, and `ImageCapture` is not refused;
  - one `widely` date changed: names the entry and both dates;
  - `mask-mode` removed from `refused`: names `mask-mode`;
  - `notBaseline` added to a second entry: names R-105 and the entry;
  - the size control at 1 B: `passed: false`.
- `pnpm build` -- expected: exit 0, with no `browserslist` key at the root or in `apps/web`.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.

**Real infrastructure (R-82):**
- **npm registry** — versions and publish dates read. Every pin predates pnpm 11's age gate.
- **GitHub Actions** — the Dev push's run: `check` executes `pnpm check`, so it covers stylelint and
  `tools/check-baseline.mjs`.
- **Vercel** — the production build runs `pnpm -w check` before `next build`, and it must reach READY.
- Supabase, Resend, Dodo and the Ghost servers are not touched: no schema, email, payment path or theme upload.

**Results — Dev run, 2026-09-14 (Node 24.18.1):**
- `pnpm install --frozen-lockfile` — exit 0, "Already up to date". `pnpm check` — exit 0, and
  `tools/check-baseline.mjs` ends `check-baseline: PASS`:
  - it printed the floor `chrome 121 · chrome_android 121 · edge 121 · firefox 122 · firefox_android 122 ·
    safari 17.2 · safari_ios 17.2`, and browserslist agreed with §A3 over web-features 3.35.0;
  - the plugin-versus-pin diff covered 2356 rows, with 0 wider and 0 narrower;
  - the Tier-2 dates recomputed to the Design Notes table, and `text-wrap-pretty` printed "not Baseline on the pin,
    kept by R-105";
  - every stylesheet row of the matrix was refused by the rule it names;
  - 3 repository sheets linted clean, and Ghost's 17 card sheets were ignored;
  - `main.js` (core) is 2308 B brotli under the 40 kB limit.
- Controls:
  - **inside the check, on every run:**
    - a second `notBaseline` → refused, naming R-105;
    - `widely` set to 2099-01-01 → named with both dates;
    - `--limit "1 B"` → `passed: false`.
  - **by hand, then restored byte-for-byte:**
    - the root pin removed → exit 1, `FAIL (5)`. `ImageCapture` was not refused (only `no-undef` fired), and
      browserslist fell to today's `firefox 123 · safari 17.4`;
    - `plugin.refused` emptied → exit 1, `FAIL (2)`, naming `css.properties.mask-mode` and its three values as
      wider, and `.a { mask-mode: alpha; }` as not refused.
- `pnpm build` — exit 0. The check's own row confirms no browserslist config reaches the root or `apps/web/app`.
- `python3 tools/doc-audit.py --check` — PASS, as the pre-commit hook on each Dev commit (`7d4cb243`, `663598ed`).
- Beyond the Design Notes' prototype, two things the repository forced:
  - `property-disallowed-list` exempts `--custom-properties`; otherwise `reference-tokens.css` fails with 108
    errors;
  - an `@supports` test on a Tier-2 property that lists values admits only those values, so
    `@supports (text-wrap: nowrap)` cannot let Tier 3 in.
- `baseline-browser-mapping` resolved to 2.11.20 in the lockfile, not planning's 2.11.23. The floor is identical
  (MEASUREMENTS §43).
- Two stale wordings are left deliberately:
  - NFR-2 still says "40 KB gzipped" (`prd.md:474,476`, `research-section-js-libraries.md:33,389`; `epics.md:240`
    is the CSS budget, not this one): its metric is Story 7.5's, per VERIFY row 27
    and this spec's Ask First;
  - MEASUREMENTS §9's "1.4.5" is a dated reading, superseded by §43.

**Real infrastructure hit (R-82):**
- **npm registry** (`registry.npmjs.org`, no key), the publish time of each pin: stylelint 17.15.0 2026-09-04 ·
  stylelint-plugin-use-baseline 1.4.6 2026-08-22 · browserslist-config-baseline 0.5.0 2025-08-04 ·
  eslint-plugin-compat 7.0.2 2026-04-29 · web-features 3.35.0 2026-08-17 · size-limit 13.0.3 and
  @size-limit/file 13.0.3 2026-07-30. All are older than pnpm 11's one-day gate, so the frozen install passed with
  no exclusion.
- **GitHub Actions** (`gh` with `GITHUB_TOKEN` as `GH_TOKEN`) — run 34847587154 on `7d4cb243`: `rls`, `check` and
  `deploy` all `success`. The `check` log shows `stylelint 17.15.0` installed under `--frozen-lockfile`, `eslint . &&
  stylelint "packages/**/*.css"`, `2356 rows: 0 wider, 0 narrower`, the floor line above and `check-baseline: PASS`;
  `deploy`'s `vercel build --prod` ran the same lint.
- **Vercel** (REST `v6/deployments` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`) — production deployment
  `dpl_7EkQBJyxoBSfkThe9Ln4VJwZyHdH` for `7d4cb24381e984776a0612bec008a1d433c82650`: `READY`.
- Supabase, Resend, Dodo, T1 and T3 were not touched: this story has no schema, email, payment or theme upload.

**Results — Review, 2026-09-14 (Node 24.18.1):**
- Five review layers ran. The real infrastructure was re-executed with a negative control each: **npm registry** — every
  pin's publish time as above; `stylelint@99.99.99` → 404. **GitHub Actions** (`GH_TOKEN` from `GITHUB_TOKEN`) — run
  34847587154 for `7d4cb243` and run 34849220061 for `663598ed`, `rls` · `check` · `deploy` all `success`; the `check`
  log carries `stylelint 17.15.0`, the floor line and `check-baseline: PASS`; `gh run view 1` → 404. **Vercel** (REST
  with `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`) — `dpl_7EkQBJyxoBSfkThe9Ln4VJwZyHdH` `READY` for `7d4cb243`,
  aliased to `inflozo.com` and `app.inflozo.com`; an invented id → 404. The diff adds no migration, so R-99 has nothing
  to compare. Supabase, Resend, Dodo, T1 and T3 untouched.
- Locally, before the patches: `pnpm install --frozen-lockfile` "Already up to date", `node tools/check-baseline.mjs`
  PASS with the Dev run's floor line, `pnpm lint` exit 0; the two by-hand controls replayed in a scratch copy of HEAD
  (pin removed → `FAIL (5)`; `plugin.refused` emptied → `FAIL (2)`), each naming its subject as the Dev run recorded.
- After the patches: `node tools/check-baseline.mjs` PASS with three more controls and five more stylesheet rows;
  `pnpm lint` exit 0; `pnpm check` exit 0. Controls of the patches, each by name: ESLint started from `/tmp` → "eslint
  must run from the repo root", exit 2; `BROWSERSLIST="last 1 version"` → the check stops before its first row, exit 1;
  the pin written `2026/08/18` in a scratch copy → "is not YYYY-MM-DD", exit 1.
- Reproducibility: `gh run list --commit` needs the full 40-character SHA (a short one returns an empty list, not an
  error); a scratch-copy install needs `--prefer-offline` — `--offline` fails on a tarball the store lacks.
