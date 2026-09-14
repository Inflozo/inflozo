---
title: 'Story 4.7 — `core` and the behaviour-module registry'
type: 'feature'
created: '2026-09-14'
status: 'in-review'
baseline_commit: '033e47c49edd50bf3bee9592842dbf697d3a55be'
owner_test: none
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing you can see changes yet: this story builds the one small script every theme Inflozo makes will
carry, the piece that switches on a section's moving parts, such as a drop-down menu, a slideshow or a
pop-up photo. That script stays still for a visitor who has asked their device to stop animations, wakes up
only at the screen widths a design asks for, and never opens a pop-up over the editor while you are
designing. The story also writes one list, which the product itself reads, of every moving part a section
may use and what it looks like with scripts turned off, and adds a check that no theme ever ships code
Inflozo did not write.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-G7 says every script a generated theme runs comes from one registry, and that its shared
`core` exists before the first category is built. None of it exists yet. `data-module` accepts any kebab
word and both emitters delete it (`vocabulary.ts:581-584`, `core.ts:977`), so a live page has nothing for a
script to mount on. AD-2 still gives each design a `behaviour.js` of its own code, which FR-G7 and §7.3's
"from FR-G7's registry" forbid. The stress theme ships a placeholder `main.js` of a hardcoded 31 functions
(`tools/stress/build.js:209-211`). The no-JS and edit-safe table exists only as research §7's prose, with no
`cards.js` row (DW-100). And FR-G7(3) defines edit-safe backwards, as "does not run inside the editor canvas"
(`prd.md:295`), against R-21.

**Approach:** Write `core` as a classic vanilla script in `packages/library/modules/`, with a machine-read
registry beside it that is checked against §7's prose. A design declares its modules with `data-module`,
optionally with the width below which each one runs, and the attribute now survives into the theme for
`core` to mount on. Add the two pure functions every later story calls: `bundle` (the one `main.js`) and
`checkThemeJs` (`assets/js/` holds only repo-authored code, with `cards.js` the exception). Prove `core` on
its shipped bytes: in jsdom under CI, and in real Chromium on T1 and T3.

## Boundaries & Constraints

**Always:**
- **Cite or execute** (standing rule 1). Two sets of facts were executed during planning:
  - web-features 3.35.0, the data research §A3 pins. `AbortController`, the listener `signal` option,
    `MediaQueryList`'s `change` event, `IntersectionObserver` and media-query range syntax are all Widely
    before the pin's cutoff. `AbortSignal.any()` is Newly (2024-03-19), which makes it Tier 3, so it is
    never used.
  - Ghost 6.58.0's vendored card scripts and the recordings. The audio and video cards carry no
    `controls`, the toggle card renders `data-kg-toggle-state="close"`, and only `gallery.js` sets each
    image's `flex` ratio.
- **One copy, counts derived.** §7 keeps the prose: each module's no-JS line and edit-safe sentence.
  `modules/registry.json` keeps what code reads: `name`, `editSafe`, `animates`, and the retired names with
  their reasons. `python3 tools/derive-module-reach.py --check` fails when the two disagree. No count of
  modules is written anywhere.
- **`core` sets `js-enabled` on each element whose module it mounts**, and removes it when that mount
  aborts. It never sets it on `<html>` or `<body>`. So JavaScript off, suppression while editing, a
  reduced-motion stop and a width outside the declaration all leave that element in its no-JS CSS branch.
- **Module file shape.** A module file's top level is exactly one function declaration, named for the
  module in camelCase (`nav-drawer` → `navDrawer`, called as `(el, ctx)`). `core` is
  `function core(win, modules, options)`. Nothing reaches a global it was not handed.
- **`src/modules.ts` is pure under AD-1**: sources are handed in. Files are read only by
  `modules/core.test.mjs`, the stress harness and the probe.
- **A control that did not pass voids the run** (standing rule 2). The probe runs the same page with
  JavaScript on and off, and writes nothing unless the page it reads is the probe theme's.

**Ask First:**
- Any write to T1 or T3 beyond uploading and activating one probe theme and restoring the previous theme in
  a `finally`.
- Any npm dependency beyond `jsdom@30.0.1` as a `packages/library` devDependency. That version is already
  locked for `section-runtime`.
- Changing any edit-safe value, or FR-D20's or Story 5.15's text about which modules run while editing.
  Transcribe §7 and ledger the difference (Design Notes).
- A module whose reduced-motion state is not its no-JS state, because the `animates` gate would be wrong
  for it.

**Never:**
- **Never edit the design export (R-74).** This story has no screen, so it has no frame and no owner test.
- **None of the later stories' work.**
  - No feature module's code: each one is written with the first category that declares it (FR-G7(2)).
  - No canvas suppression, PAUSED chip or Preview toggle (Story 5.15).
  - No compiler emission of `main.js` or `cards.js`, and no `size-limit` (Story 7.5). The stress fixture
    is not a compiled theme.
  - No `eslint-plugin-compat` (Story 4.8).
  - No catalog key, and no `data-i18n-*` emission or validation (Stories 4.9 and 7.5).
- **No stray code.** No third-party code, no global name (everything in `main.js` lives inside its one
  wrapping function), and no JavaScript file in a design directory.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| `core` mounts | `<section data-module="probe">`, `probe` handed in | `probe(el, ctx)` runs once with `ctx.signal`, `ctx.t`, `ctx.observe`, `ctx.reducedMotion`; the section gains `js-enabled` | N/A |
| JavaScript off | the same page, scripts disabled | no element carries `js-enabled`; every section is its authored markup | N/A |
| A module throws | two mounts; the first throws | the second still mounts; the first has no `js-enabled` and an aborted signal | the error is reported, never swallowed |
| Editing | `core(win, mods, { editing: true })`; one module `editSafe: false`, one `true` | only the edit-safe one mounts | N/A |
| Reduced motion | `(prefers-reduced-motion: reduce)` matches; a module with `animates: true` | not mounted; mounts when the preference clears; aborts and loses `js-enabled` when it returns | N/A |
| A width | `data-module="probe:768"` at 1024 px, then 600, then 1024 | unmounted; mounted while `(width < 768px)`; aborted and unmarked again | N/A |
| Teardown | `core(…).stop()` | every signal aborted, every `js-enabled` removed, no media listener left | N/A |
| Strings | `data-i18n-load-more-loading="Loading {count} more"`; `t('load-more-loading', { count: 12 })`; `t('absent')`; a `{other}` with no param | "Loading 12 more"; `''`; `{other}` left as written | N/A |
| One observer | two mounts observe with the same options, a third with another `rootMargin`; one mount aborts | two `IntersectionObserver`s in all; the aborted mount's targets unobserved | N/A |
| Declaring | `data-module="lightbox"` · `"accordion:768"` · `"core"` · `"search-overlay"` · `"back-to-top"` · `"accordion:0"` | the first two accepted; `core` refused (platform, never declared); `search-overlay` refused with R-24's reason; `back-to-top` refused as outside the registry, pointing at the no-module behaviours; a width that is not a positive integer refused | the validator's `bad-value`, and the runtime throws the same sentence |
| Survives | a design carrying `data-module="lightbox"`, through both emitters | the attribute sits on the same element in the canvas DOM and in the theme text; AD-34's leak assertion passes | N/A |
| Union and removal | design A declares `lightbox` and `carousel`, design B declares `carousel`; then A is removed | each entry's `js` is read from its markup; the union is `carousel · lightbox`, in registry order; then `carousel` | N/A |
| The bundle | `bundle([], { core })`; `bundle(['lightbox'], { core })`; a source with a second top-level declaration | a header naming `core`, then `core.js` verbatim inside one function, then the start call; refused, naming `lightbox.js`; refused, naming the file | throws |
| `assets/js/` | `main.js` from `bundle`; plus `cards.js`; plus `vendor.js`; `main.js` with one byte appended | `[]`; `[]`; refused, naming `vendor.js`; refused, naming `main.js` | returns sentences |
| An authored `js-enabled` | `<div class="card js-enabled">` in a design | refused: `core` sets it, and a design never does | the validator's `js-enabled-authored` |

</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-section-js-libraries.md` — the
  registry and its prose:
  - §2.1's table `:79-112`: live rows are `| n | **\`name\`**`; struck rows carry `~~`.
  - §2.2, the behaviours that need no module `:121-137`.
  - §3.1's a11y column `:147-180`: the reduced-motion lines behind `animates`.
  - §5, the licence filter `:425-450`.
  - §7 `:572-636`: the width rule `:576-581`, core's row `:606`.
- `prd.md` — the requirements to satisfy and correct:
  - FR-G7 `:289-299`: (1) zero third-party code, (2) N modules and the union, (3) the sense sentence to
    correct at `:295`, (4) `core`, (5) the no-module behaviours.
  - FR-D20 `:243`; FR-G4's motion gate `:285`; FR-G3's `js?` `:282`; FR-J4 `:390`, which says `defer`red;
    §7.3 `:520`, "its own optional behaviour module from FR-G7's registry".
- `ARCHITECTURE-SPINE.md` — AD-2 `:98-103` and the tree `:486`, `:493` (`behaviour.js?` against
  `modules/`); the FR-G capability row `:624`. `VERIFY-AT-BUILD.md` row 50 `:272`.
- `reconcile-designs-decisions.md` — R-21 `:627-641` (the sense; "the editor obeys it"); R-38 `:886-890`;
  R-60 to R-63 `:1036-1039`; R-24; R-52 (no sort module).
- `appendix-h1-string-catalog.md` — S5 `:37-42`: attribute name = key without its namespace, `.` and `_` →
  `-`, placeholders intact. V5 `:434`.
- `epics.md` — Stories 4.8 `:1393`, 4.9 `:1427`, 5.15 `:1938-1960`, 7.5 `:2497-2521`, 7.33 `:3340-3365`.
- `packages/library/src/vocabulary.ts` — `data-module` `:581-584`; the "three that survive" comment and
  `CONSUMED_DIRECTIVES` `:596-607`; `emitted: true` on `data-members-form` `:585-589`.
- `packages/library/src/validate.ts` — `scanTags` `:36-54`; a directive's parse failure becomes `bad-value`
  `:146-152`.
- `packages/library/src/registry.ts` — `js?: string` `:163`; `AssembleInput.js` `:193-200`; `assembleEntry`
  `:205-234`. Its callers: `validate.test.ts:598-622`, `section-runtime/src/controls.test.ts:42`,
  `apps/web/lib/controls-review.ts:35`.
- `packages/library/src/validate.test.ts:36` and `fixtures/reference-design/index.html:8` use
  `data-module="reveal"`. `tools/stress/test-vocabulary.mjs` derives its refusal-code list from
  `validate.ts`, so a new code needs a test that fires it.
- `packages/library/{package.json,tsconfig.json}` · `src/index.ts` — the test glob, `include`, and exports.
- `packages/section-runtime/src/core.ts` — `RENDERED_DIRECTIVES` `:255-276`; `consume` removes `:348-357`;
  `data-module` consumed `:977`; the root sweep keeps vocabulary names `:995`.
- `packages/section-runtime/src/agreement.test.ts` — the partition `:701-714`; the leak fixture's
  `data-module="cards"` `:730`, which is not a registry name; the survive check `:744-747`.
- `eslint.config.js:13-25` — `CORE`/`NOT_CORE` and why data directories are excluded. `modules/*.js`
  reaches `document` and `window`, which are banned in CORE.
- `tools/stress/build.js` — `<script defer src="{{asset "js/main.js"}}">` `:128`; the placeholder `main.js`
  `:209-211`; the AD-34 leak assertions `:250-270`. `tools/stress/sections.js:132` has `lightbox`.
- `tools/derive-module-reach.py` — `known_modules` and its `assert len(mods) > 20` `:33-37`; `main` `:80-98`.
  Root `package.json:12` is the test chain.
- `tools/probe/record-shim.py` — the `Ghost` client `:54-118`; the probe `package.json` and zip `:157-191`;
  restore in a `finally` `:337-339`. `record-contexts.py` and `record-cards.py` import that client.
  `run-verify-controls.cjs:11-12` gives the machine's Playwright path.
- `packages/library/orbit-weekly/vendor/cards/js/{audio,gallery,toggle,video}.js`, `vendor/cards/css/toggle.css:15`,
  `orbit-weekly/fixtures/ghost6/article.json` — the evidence for the `cards.js` line. `record-cards.py`
  vendors Ghost's `LICENSE` at the pinned version.
- `deferred-work.md` — DW-100 `:2793-2808` (owned here); DW-94 `:2663-2676`.
- `docs/section-authoring.md` — the entry row `:50`; `### behaviour.js` `:423-426`; the directive row
  `:474`; "Two the harness proved" `:863-881` with its "these three survive" sentence `:874`; the refusal
  table `:883`.

## Tasks & Acceptance

**Execution:**
- [x] `packages/library/modules/registry.json` -- write one row per live §2.1 module: `name`, `editSafe`
  (from §7's column) and `animates` (true for `rotator`, `marquee`, `count-up`, `reveal`, `typewriter` and
  `slide-in-card`, whose §3.1 lines stop the motion). Add `retired`, mapping `search-overlay`,
  `search-expand`, `command-palette`, `confetti` and `sort` to their rulings' reasons -- the machine half
  of FR-G7's one table.
- [x] `packages/library/src/modules.ts` · `src/modules.test.ts` · `src/index.ts` · `tsconfig.json` -- build
  the pure half, importing nothing from `src/`, so no import cycle forms:
  - `MODULES`, read from the JSON.
  - `parseModuleDeclaration(v)` → `{ name, below? }` or the refusal sentence.
  - `moduleUnion(entries)`, in registry order.
  - `bundle(names, sources, rows = MODULES)` → `main.js`: a header naming `core` and the modules, one
    wrapping function with `'use strict'`, each source verbatim with `core` first, then
    `core(window, [[name, fn, { editSafe, animates }], …])`. It throws on an unknown or missing source, or
    on a top level that is not one declaration of the expected name.
  - `checkThemeJs(files, sources)` → sentences: any `assets/js/` path other than `main.js` and `cards.js`,
    or a `main.js` that is not `bundle(its header's names, sources)`. An unreadable header, or a name with
    no repo source, is a sentence, not a throw.

  Test the library rows of the matrix -- the rule 7.5 and 7.33 will call, written once.
- [x] `packages/library/src/vocabulary.ts` · `src/validate.ts` · `src/registry.ts` · `src/validate.test.ts`
  -- the declaration and the entry:
  - `data-module` parses through `parseModuleDeclaration`, gains `emitted: true`, and its summary and the
    survivors comment lose their counts.
  - The validator refuses a `js-enabled` class in authored markup (`js-enabled-authored`).
  - `assembleEntry` derives `js: string[]` from the markup's `data-module` names (omitted when none) and
    `AssembleInput` loses `js`; update its three callers.

  Each new refusal fires alone in a test -- FR-G3's `js?`, filled from what the markup declares.
- [x] `packages/library/modules/core.js` -- the runtime:
  - scan `[data-module]` under the document;
  - per mount: an `AbortController`, `js-enabled` set before `mount` and removed on abort or throw, and
    the error reported asynchronously;
  - skip `editSafe: false` when `options.editing`;
  - one `(prefers-reduced-motion: reduce)` query gating every `animates` module;
  - one `(width < Npx)` query per declared width;
  - `change` listeners that mount and abort;
  - `t` from the mount's `data-i18n-*`;
  - `observe`, sharing one `IntersectionObserver` per root, `rootMargin` and `threshold`;
  - return `{ stop }`.

  Add a `ponytail:` comment for the one-time scan, naming a rescan as the upgrade the first module that
  appends markup (`load-more`) will ask for -- FR-G7(4).
- [x] `packages/library/modules/core.test.mjs` · `packages/library/package.json` · `eslint.config.js` --
  cover every `core` row of the matrix on the file's real bytes, and on `bundle`'s bytes with probe rows,
  in jsdom with a fake `matchMedia` and `IntersectionObserver`. Add the devDependency and the
  `modules/*.test.mjs` glob. Add `packages/library/modules/**` to `NOT_CORE`, with the reason: theme
  browser code, never run by the product -- a test beside every future module.
- [x] `packages/section-runtime/src/core.ts` · `src/agreement.test.ts` -- replace the `consume` with a
  parse-and-keep on both emitters (it throws the vocabulary's sentence), drop `data-module` from
  `RENDERED_DIRECTIVES`, put a registry name in the leak fixture, and test that both emitters keep it on
  the same element and refuse a bad value -- `core`'s mount point on the live page.
- [x] `tools/stress/build.js` -- write `bundle([], sources)` from `packages/library/modules/` in place of
  the placeholder, and report `checkThemeJs` over the theme beside the leak assertions --
  `node build.js && node gate.js theme` stays 0/0 on both majors, and the hardcoded 31 goes.
- [x] `tools/derive-module-reach.py` · root `package.json` · `tools/doc-audit.py` -- add `--check`, reading
  no export:
  - `registry.json`'s names equal §2.1's live rows;
  - each module's `editSafe` equals its §7 yes/no;
  - every other §7 row is struck, `core` or `cards.js`, and `cards.js` has one *(review: `core` added to the wording; the tool always accepted §7's `core` row)*;
  - a refusal replaces the `assert`.

  Chain it after `test-vocabulary.mjs` and update the tool's row -- the table stays one table.
- [x] `tools/probe/run-verify-core.py` · `tools/doc-audit.py` -- the probe, reusing `record-shim.py`'s client
  and packaging:
  - build a minimal probe theme whose `main.js` is `bundle` of the real `core` plus probe rows (plain,
    `animates`, `:768`, throwing), and assert `checkThemeJs` refuses it as the control;
  - gscan it; upload and activate it on T1 and T3;
  - drive the machine's Chromium through the I/O rows with JavaScript on and off, reduced motion, 1024 →
    600 → 1024 px, expecting no page error but the probe's own;
  - restore and re-read the active theme in a `finally`, never printing a key;
  - add its row -- R-82: `core` proven where it will run.
- [x] `docs/section-authoring.md` -- replace `### behaviour.js` with the modules part: declaring, width,
  union, `js`, `ctx`, `js-enabled` on the mount, editing, the motion gate, the file shape, `bundle` loaded
  `defer`, the `assets/js/` rule, `cards.js` and the licence filter (MIT, BSD-2/3-Clause, Apache-2.0, ISC,
  re-verified at the pinned version), §2.2's native mechanisms, and a width's no-JS line covering both
  sides. Fix `:50`, `:474` and `:863-881` without a count, and add the refusal rows -- the contract E9–E11
  write against.
- [x] `research-section-js-libraries.md` · `prd.md` · `ARCHITECTURE-SPINE.md` · `VERIFY-AT-BUILD.md` ·
  `MEASUREMENTS.md` · `deferred-work.md` · `epic-4-context.md` -- propagate (standing rule 3), then grep for
  `behaviour.js`, "consumed — 4.7", "three are the only" and "31 behaviour" (standing rule 7):
  - research §7: a `cards.js` row (Design Notes), `js-enabled` on the mount, and the registry pointer;
  - FR-G7(3): R-21's sense;
  - AD-2 and the tree: no `behaviour.js`, `js` derived;
  - row 50: the confirmation moves to each module's first category story on Story 5.15's canvas;
  - MEASUREMENTS: the web-features facts and the probe;
  - the ledger: DW-100 done; FR-D20 and 5.15's edit-safe list versus §7 (owner 5.15); an inline `<script>`
    in a template, which the `assets/js/` check cannot see (owner 7.5); `cards.js` bytes, unchecked
    (owner 7.5);
  - the epic context's sub-bullets.

**Acceptance Criteria:**
- Given `core.js`'s shipped bytes, when `core.test.mjs` and the probe run, then every `core` row holds in
  jsdom under CI and in real Chromium on T1 and T3: JavaScript on and off, reduced motion, both widths, and
  no page error but the probe's own (FR-G7(4), FR-G4, R-38).
- Given `registry.json` and research §7, when `--check` runs, then every live §2.1 row has a registry row,
  the names and edit-safe values agree, and `cards.js` has its no-JS line and edit-safe value (FR-G7(3),
  DW-100).
- Given a theme's `assets/js/`, when `checkThemeJs` runs, then only `bundle`'s bytes from repo sources, and
  `cards.js`, pass: the stress theme passes with its real `main.js`, and the probe theme is refused
  (FR-G7(1)).
- Given the gates, when `pnpm check`, `python3 tools/doc-audit.py --check` and
  `node build.js && node gate.js theme` run, then all are green, gscan scores 0/0 on both majors, and no
  count a tool derives is written down.

### Review Findings

*(Review 1, 2026-09-14 — five layers: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra verifier. Every patch applied and re-tested; 13 findings dismissed as noise or as later stories' work.)*

- [ ] [Review][Decision] The probe leaves `inflozo-probe-core` installed, inactive, on T1 and T3 — deleting it in the `finally` is a write the spec's Ask First does not cover. See `## Questions for the owner`.
- [x] [Review][Patch] Authored markup could carry a `<script>`, an `on*` handler or a `javascript:` URL — the one road around `checkThemeJs` — refused at the validator as `authored-script` [packages/library/src/validate.ts:126]
- [x] [Review][Patch] `checkThemeJs` passed a theme with no `main.js`; the sentence now lives in the function, and `build.js` drops its call-site patch [packages/library/src/modules.ts:104]
- [x] [Review][Patch] `ctx.observe` after the mount's signal aborted left the target observed forever [packages/library/modules/core.js:57]
- [x] [Review][Patch] one throwing observer callback starved the rest of the batch — each is now reported and the batch continues [packages/library/modules/core.js:72]
- [x] [Review][Patch] `core` reported a malformed live declaration (`accordion:0`) as "names no module this main.js carries" — it now says it is not a declaration [packages/library/modules/core.js:34]
- [x] [Review][Patch] `bundle` built a RegExp from a probe row's name unchecked — a row outside the registry grammar, or `core`, is refused first [packages/library/src/modules.ts:78]
- [x] [Review][Patch] `registry.json`'s `animates` column was held to nothing — `--check` now derives it from §3.1's reduced-motion lines, control run (`carousel` flipped → red) [tools/derive-module-reach.py]
- [x] [Review][Patch] FR-G7(2) still said "each design owns its own JS" [prd.md:293]
- [x] [Review][Patch] the spine's tree said "data only, no executable module" beside `modules/`, and AD-2's "two fields not authored" is three with `js` [ARCHITECTURE-SPINE.md:104,486]
- [x] [Review][Patch] "`design.json` is the fourth file" after the diff made it three [docs/section-authoring.md:56]; the lint claim overstated what `no-undef` proves; the refusal table gains `authored-script`
- [x] [Review][Patch] the probe's docstring and catalogue row said "writes nothing" while the probe theme stays installed — narrowed to what is true [tools/probe/run-verify-core.py:26, tools/doc-audit.py]
- [x] [Review][Patch] the `registry.ts` → `validate.ts` value import is a cycle only on paper (the reverse edge is type-only) — said so beside the import [packages/library/src/registry.ts:11]
- [x] [Review][Patch] two registry names that camelCase to one function would silently replace each other in `main.js` — asserted unique in the registry test [packages/library/src/modules.test.ts]
- [x] [Review][Patch] the canvas has no way to reach `core` with `{ editing: true }` or a report hook, and nothing ledgered it — DW-136, owner Story 5.15
- [x] [Review][Patch] the task wording "struck or is `cards.js`" did not match the tool's `core` allowance — wording fixed above

Dismissed (13): older-browser fallbacks for range syntax, `AbortController` and `MediaQueryList.addEventListener` (all Widely before the date pin, spec Always); `t(k, { x: null })` printing `null` (the module author's value); CRLF `main.js` (altered bytes are refused either way); a malformed `registry.json` row (typed on import); a probe page missing an element (the nonce check owns that); `checkThemeJs` path normalisation (theme-relative paths are the contract); per-module `data-i18n-*` key lists (Story 4.9); the hardcoded Playwright path (the Code Map's pattern); the stress fixture's `lightbox` declaration against a core-only `main.js` (not a compiled theme, and no `lightbox.js` exists yet); editing and `stop()` proven in jsdom only (Dev note; no theme can reach them); `build.js` printing rather than failing on `checkThemeJs` (parity with the leak assertions); duplicate rows in `modules` (`bundle` derives from a Set).

## Spec Change Log

## Design Notes

**`js-enabled` sits on the mount, not on `<html>`.** A page-wide class would put a module suppressed on the
canvas into its JavaScript branch anyway. `reveal`'s `.js-enabled` hide rule would then keep a section
invisible while its script never runs, and the same happens to an animating module stopped for reduced
motion or a script outside its width. Per mount, the class means "this module is running here", which is
what every §7 no-JS line assumes. One name per element keeps that meaning unambiguous. The stylesheet
selects on it and uses the same `@media (width < 768px)` as a `:768` declaration, so CSS and script flip at
the same pixel.

```js
// packages/library/modules/lightbox.js — a future module's shape
function lightbox(el, ctx) {
  const dialog = el.querySelector('dialog')
  el.querySelector('.gal__close').setAttribute('aria-label', ctx.t('close'))
  el.addEventListener('click', (e) => { if (e.target.closest('a.gal__img')) { e.preventDefault(); dialog.showModal() } }, { signal: ctx.signal })
}
```

**A classic script, not ES modules.** FR-J4 and Story 7.5 say `defer`red, and the stress theme already loads
`main.js` that way. A module file carrying `export`, concatenated into a classic script, is a SyntaxError
that silently turns every site to its no-JS state. One wrapping function also keeps `core` and the modules
off `window`.

**No `behaviour.js`.** FR-G7 lets a design run only registry code, and §7.3 says "its own optional behaviour
module from FR-G7's registry". FR-G3's `js?` is therefore the design's declared names, recovered from
markup the way `quickControls` is recovered from `controlSchema`. Removing a design removes those names from
the union, unless another placed design declares them too.

**The motion gate runs once, in `core`.** For every `animates` module, §3.1's reduced-motion line matches
its §7 no-JS line: message 1 static, the line whole, the value printed, content visible. So "do not start
it" is the gate. A module whose motion is incidental, such as a carousel's smooth scroll, reads
`ctx.reducedMotion`. Story 4.11's forced-query matrix case, and each module's own story, confirm this.

**Edit-safe values are transcribed, not decided.** FR-D20 and Story 5.15 list sticky/shrink headers,
reveal, tabs and accordions as running while editing, while §7, the architect's pass under R-21, marks
`header-scroll`, `reveal`, `tabs` and `accordion` **no**. R-21 says the editor obeys the table, so the
registry carries §7's values. The ledger hands the difference to 5.15, whose owner test is where the canvas
behaviour is seen. VERIFY-AT-BUILD row 50's "E4 confirms each against the real canvas" cannot run in E4,
because neither the canvas nor the modules exist yet.

**The `cards.js` row.** No-JS: the audio and video cards show no working player (Ghost emits neither with
`controls`), the toggle stays closed, and gallery rows lose their proportions (`gallery.js` sets each
ratio). Edit-safe: **yes**, because it acts only inside the post-body fixture, which nothing on the canvas
edits (FR-H3(1)). Story 5.15 confirms both.

## Questions for the owner

**Q1. Should the test probe tidy up after itself on the two test Ghost sites?**

The probe that proves `core` works uploads a tiny throwaway theme called `inflozo-probe-core` to each test site, switches to it for about a minute, then switches the site back to its previous theme. It does switch back every time — checked again in this review, both sites are on `casper` — but the throwaway theme is left sitting in each site's theme list, unused. Example: open Ghost admin on `ghost6.inflozo.com`, go to Design, and you will see `inflozo-probe-core` listed as an installed-but-inactive theme. Deleting it would be one extra call to Ghost at the end of the probe; the story's rules only allowed uploading, activating and restoring, so it is your call.

1. **Delete the throwaway theme at the end of every probe run, in the same cleanup step that switches the site back (RECOMMENDED)** — the sites end each run exactly as they started, which is how the other probes here already behave.
2. **Leave it installed** — harmless, one inactive theme per site, overwritten by the next run; the docs now say so.

**Ruled:** _(awaiting the owner)_

## Verification

**Commands:**
- `pnpm check` (Node 24) -- expected: exit 0. That covers lint with `modules/` outside AD-1's ban,
  typechecks, and every package test, including `modules/core.test.mjs`, `src/modules.test.ts` and the
  runtime's `data-module` tests; then `test-vocabulary.mjs` and `derive-module-reach.py --check`.
- `python3 tools/derive-module-reach.py --check`, with one `editSafe` flipped in a scratch copy --
  expected: non-zero, naming the module (the control). Restored, it passes.
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- expected: `main.js` is
  `bundle([], …)`, `checkThemeJs` is clean, the leak assertions are clean, and gscan 4.49.7 and 6.4.2 both
  score 0 errors / 0 warnings.
- `python3 tools/probe/run-verify-core.py` -- expected: T1 `ghost6.inflozo.com` (6.58.0) and T3
  `ghost5.inflozo.com` (5.130.6), with keys read by variable name only. Every row holds in Chromium, the
  JS-off control shows no `js-enabled`, the probe theme is refused by `checkThemeJs`, and the previous
  theme is active again on both servers.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.

**Manual checks:**
- After the probe, `GET /ghost/api/admin/themes/` on both servers shows the theme that was active before the
  run as active (R-82). Supabase, Vercel, Resend and Dodo are not touched: this story has no schema change,
  no screen, no email and no payment path.

**Results (Dev, 2026-09-14) — the real services this story hit (R-82):**
- **Ghost T1 `ghost6.inflozo.com` (6.58.0) and T3 `ghost5.inflozo.com` (5.130.6)** — `python3 tools/probe/run-verify-core.py`,
  keys read by `record-shim.py`'s `load_env()` as `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`,
  `GHOST5_URL`, `GHOST5_STAFF_ACCESS_TOKEN`, `GHOST5_CONTENT_API_KEY`, never printed. The control held first:
  `checkThemeJs` REFUSED the probe theme ("names probe, probe-motion, probe-throws, with no source") and passed
  `bundle([])` over `packages/library/modules/`; the probe theme scored gscan 4.49.7 and 6.4.2 0 errors / 0 warnings.
  Both servers accepted the upload and activation, served this run's nonce on `/`, and in Chromium 1228 (Playwright
  1.61.1) **22 of 22 rows held on each major**: JavaScript on at 1024 px, 1024 → 600 → 1024 px, reduced motion, the
  throwing mount's error the only page error, and with JavaScript off (the control) no element carrying `js-enabled`
  and no module run. The full record is MEASUREMENTS §42.
- **Manual check, re-read independently after the probe** — `GET /ghost/api/admin/themes/` on both servers
  (`GHOST6_*`, `GHOST5_*` by name): `casper` active on both, as before the run. The uploaded, inactive
  `inflozo-probe-core` theme stays installed on each; nothing else was written.
- **Supabase, Vercel, Resend, Dodo** — not touched: no schema change, no screen, no email, no payment path. CI
  deploys the push to Vercel as usual; nothing in this story changes what the app serves.

**Results — the commands:**
- `pnpm check` (Node 24.18.1) — exit 0: lint, typechecks, every package test including `modules/core.test.mjs`,
  `src/modules.test.ts` and `agreement.test.ts`'s `data-module` test; `test-vocabulary.mjs` 19 checks passed;
  `derive-module-reach --check: PASS`. `pnpm build` (the web app, which now imports `registry.json` through the
  library) — exit 0.
- `derive-module-reach.py --check` control — `tabs` flipped in `registry.json`: exit 1, "tabs: registry.json says
  editSafe true, research §7 says no"; restored byte-identical: exit 0, PASS.
- `node build.js && node gate.js theme` — "AD-34 leak assertions: clean", "FR-G7(1) assets/js/ (checkThemeJs): clean —
  assets/js/main.js"; Ghost 5.x via gscan 4.49.7 ERRORS 0 WARNINGS 0, Ghost 6.x via gscan 6.4.2 ERRORS 0 WARNINGS 0.
  (`npm install` exited 243 offline in this session; the installed `node_modules` was current.)
- Six `core.js` mutations (motion gate, class removal, edit-safe skip, unobserve, error report, listener teardown) and
  the `bundle` shape check each turned a test red, then were restored.
- Standing rule 7 grep for `behaviour.js`, "consumed — 4.7", "three are the only", "31 behaviour": the only hits left
  are `record` stress-test documents, memlogs, and the new sentences saying there is no `behaviour.js`.

**Dev notes for review:**
- `core` is not a `registry.json` row: the matrix refuses `data-module="core"`, so `--check` accepts §7's `core` row
  beside `cards.js` as the platform runtime, where Tasks say "every other §7 row is struck or is `cards.js`".
- Editing suppression and `stop()` are not reachable from a theme's `main.js`, so they are proven in jsdom only until
  Story 5.15's canvas calls `core` with `{ editing: true }`.
- FR-D20's and Story 5.15's edit-safe text is unchanged (Ask First); the difference from §7 is ledgered for 5.15.

**Results (Review 1, 2026-09-14) — the real services this review hit (R-82):**
- **Ghost T1 `ghost6.inflozo.com` (6.58.0) and T3 `ghost5.inflozo.com` (5.130.6)** — the Real-infra verifier re-ran
  `python3 tools/probe/run-verify-core.py` once (keys by `GHOST6_*` / `GHOST5_*` variable name, never printed): the control
  held first (`checkThemeJs` refused the probe theme, passed `bundle([])`), gscan 4.49.7 and 6.4.2 both 0/0, theme upload
  HTTP 200 on both, **22 of 22 rows held on each major**, previous theme `casper` restored on both. Re-read independently
  afterwards through `record-shim.py`'s client: `casper` active on both, versions 6.58.0 and 5.130.6. A second negative
  control in the scratchpad: `checkThemeJs` returns `[]` for `bundle([], { core })` over the real `core.js` and one sentence
  for the same text with one byte appended.
- **Supabase, Vercel, Resend, Dodo** — untouched; the diff carries no migration (R-99 has nothing to compare) and no `apps/web` runtime file.
- **After the patches:** `pnpm --filter @inflozo/library test` 123 pass; `derive-module-reach.py --check` PASS, with
  `carousel`'s `animates` flipped → FAIL naming it, restored; `pnpm lint`, `pnpm typecheck`; `pnpm check`; `node build.js
  && node gate.js theme` 0/0 on both majors with `checkThemeJs` clean; `doc-audit.py --check` twice. The probe was not re-run
  after the `core.js` patches: the two changed paths (a late `observe`, a throwing observer callback) are covered in jsdom on
  the shipped bytes, and the probe's rows are unchanged.
