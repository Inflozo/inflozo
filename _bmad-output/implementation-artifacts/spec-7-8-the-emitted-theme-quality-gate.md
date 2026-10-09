---
title: 'Story 7.8 — The emitted-theme quality gate'
type: 'feature'
created: '2026-10-09'
status: 'in-progress'
owner_test: none
review_loop_iteration: 0
baseline_commit: '6ec74c9fdeff99e769d4498a5ae73eeacbc20b5c'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, every theme Inflozo builds is checked for what Ghost's own theme checker never looks at — a language tag, a phone-screen tag, valid HTML, headings in order, words on every link and button, a description on every picture, colours that are easy to read, the files every theme needs, and no hidden scripts — and each problem comes back as one plain sentence that names the section and the fix: a fault of Inflozo's own stops the deploy, while one your own choice causes (a skipped heading, a link with no words, a picture-only link with no description, colours that are hard to read) is a warning, and Ship it still works. To prove it catches real problems, it is run on Ghost's own Casper and Source themes, which pass Ghost's checker, and on a deliberately bad theme that scores a perfect pass on Ghost's checker and fails this one on every count. Nothing changes on your screen yet, because the deploy screen that shows these sentences is Story 7.18's (you ruled so on 2026-10-09), so this story is done when it deploys green, proved by the automated checks and our test Ghost site.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:**
- gscan certifies that a theme is a Ghost theme, not that it is a good one. FR-J17's premise, from the PRD's review: a theme with no `lang`, no viewport, no `alt`, an inline `onclick`, `<h4>`→`<h1>`→`<h6>`, 1.5:1 body text and missing templates scores 0 errors and 0 warnings on both gscan specs.
- Nothing in the product checks a compiled theme for any of it:
  - the NFR-5 axe scan runs on each design's canvas, never on a compiled theme's pages, and never runs `heading-order`;
  - the Baseline lint reads the library's source stylesheets, never the CSS a compile emits, and reads no markup at all (DW-137);
  - the lint misses a Tier-3 at-rule form or function (DW-139);
  - the AD-34 leak assertions live only in tests and the stress harness.
- A customer can already break heading order on today's pilots: A17 #1's section title is `data-empty="hide"`, so emptying it under A4 #13's `<h1>` puts A17's `<h3>` card titles straight after the `<h1>`.

**Approach:**
- `@inflozo/theme-compiler/gate` gains `qualityGate(files, { pack, library })`. It is core: pure, synchronous, and it never throws.
  - It reads every page a compiled theme serves the way Ghost assembles it: the layout, the partials and the blocks' alternatives. It never parses Handlebars (§ How the gate reads a theme).
  - It returns AD-24's envelope beside `gscanGate`'s.
  - It covers: valid HTML, `lang` and viewport, heading order, a name on every link and control, NFR-5's `alt` rules, AA contrast on the pack's own pairs, every required template, no inline handlers, AD-3's inline-style boundary, and AD-34's leak assertions. It stops at the edge of `{{content}}` (R-6).
  - Inflozo's own faults are errors and block the deploy. A fault a customer's own choice causes takes the level Question 2 rules.
- The Baseline floor is held where a stylesheet or an element can change: on every library release in CI, over every design and the compiled pilot theme.
  - The HTML half is DW-137; the CSS half extends the lint and its diff at the pin (DW-139).
  - Nothing a customer chooses or types can add an element, an attribute or a stylesheet feature.
- Proof:
  - CI holds the pilot theme clean, and holds the gate in agreement with axe-core 4.12.1 over the same pages.
  - The premise theme fails the gate on each defect while both pinned gscans pass it.
  - Casper and Source are the negative control.
  - T1 renders the pilots and a planted probe, and axe on Ghost's real pages agrees with the gate.
  - The gate's time is measured on the stress fixture (AD-34).

## Boundaries & Constraints

**Always:**

- **One implementation of each rule.**
  - `qualityGate` is the only reader of a compiled theme's pages.
  - `QUALITY_RULES`, in `gate/quality.ts`, is the one table of rules, codes, levels and the axe-core rule each follows.
  - `leftovers(files)` is AD-34's one spelling of the leak assertions. `themeFailures` and `tools/stress/build.js` call it.
  - `AA_PAIRS` is the one contrast list, shared by the presets' sheet, the Style Pack editor and the gate. Their role and mode words become one list beside it (R-170).
  - The root `stylelint.config.mjs` is the one CSS floor, for `pnpm lint` and for emitted CSS.
- **AD-1 and FR-J1.**
  - `gate/quality.ts` is core: it imports no builtin, holds no clock, and does no I/O.
  - Handlebars is never parsed, evaluated or printed. The reader recognises mustache delimiters as `checkGhostMarkup`'s `startTags` does, and imports no `handlebars`.
  - `parse5` 8.0.1 is the HTML parser. It is the version jsdom 30.0.1 already installs, now declared.
- **The gate never throws.** Anything it cannot read is one `quality_check_failed` error, with no stack and no exception text. A verdict is plain JSON, and every field is plain text.
- **Deterministic.** The same files give the same verdict. Findings are ordered as `gscanGate`'s are: by rule, then first ref, then message.
- **The edge (R-6).** Nothing inside `{{content}}` or `{{{html}}}` is read, and no markup Ghost prints in place of a helper is read. `partials/content-cta.hbs` is read as its own fragment.
- **CI holds the library at zero findings of either level.** At a deploy, a warning can then only be a customer's own choice.
- **Counts are derived.** No rule count, design count or finding count is written down.
- **No screen** under Question 1's recommended answer: no frame and no hand test. The story is Done on its Deploy commit (R-80).

**Ask First:**

- **Questions 1 and 2, before Dev.** Dev builds § Ruled values as it stands at that moment.
- **The T1 run** needs the owner's in-session go, in the Dev or the Review session. It uploads, activates and deletes a probe theme. It runs in the main session, never through a subagent.
- **A finding on today's library.** The pilots are expected to be clean (§ Facts 5). If one appears, Dev fixes it here when it is the compiler's own line and no snapshot or render-matrix baseline moves. A design file (AD-35) or a moved baseline (R-116) is the owner's.
- **A finding a customer's own edit can cause beyond the three rules Question 2 names** — for example, a link mark typed inside a design's link. Its level is the owner's.
- **pnpm resolving `parse5` to anything but 8.0.1**, or adding a package: stop.

**Never:**

- **Anything a later story owns:**
  - Pre-flight's rows, storing the verdict and the deploy job's stage timing: Story 7.18;
  - the gate over every design: Story 7.33;
  - `cards.css`: Story 7.13;
  - `locales/`: Story 7.12;
  - the canvas-vs-Ghost harness: Story 7.34.
- **Approaches ruled out:**
  - running stylelint or web-features inside the deploy-time gate;
  - a full HTML content-model validator (none is installed — § Readings 3);
  - reading inside `{{content}}`;
  - a hand list of axe-core's rules that cites no line of its source;
  - importing `handlebars` outside a test.
- **Editing a design file (AD-35) or the design export (R-74).** There is no migration, so there is no Schema phase.

## I/O & Edge-Case Matrix

Levels marked *(Q2)* follow § Ruled values. The rows show Question 2's recommended answer: a warning.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A clean theme | the test's clean base theme: `default.hbs` with `lang` and viewport, the required templates, headings in order, every control named; Paper's pack | `blocked: false`, no error, no warning | — |
| Today's pilot theme | compiled as CI compiles it, Paper's pack | no error and no warning | — |
| No `lang` | `<html>` with no `lang`, or `lang=""` | one `language_missing` error | — |
| A `lang` Ghost fills | `<html lang="{{@site.locale}}">` | no finding | — |
| Viewport | the meta removed; `maximum-scale=1`; `user-scalable=no` | one `viewport_missing` error each | — |
| A heading skip | `<h1>`, then `<h4>` in the next section's partial | one `heading_skip` *(Q2)* naming the page, the layer and `h1→h4` | — |
| Order axe-core allows | a page opening on `<h2>`; a climb `h3→h1` | no finding (axe-core 4.12.1's `heading-order`) | — |
| Alternatives | `{{#is "paged"}}<h2>…{{else}}<h2>…{{/is}}`; `{{#if x}}<h2>{{else}}<h3>{{/if}}<h3>` | no finding: each branch is read on its own | — |
| The edge | `<h1>{{title}}</h1>{{content}}<h2>Related</h2>` | no finding: the post body is never read (R-6) | — |
| A nameless control | `<a href="x"><svg aria-hidden="true">…</svg></a>`; an empty `<button>` | one `name_missing` *(Q2)* each | — |
| Names that count | text or a placeholder for an expression; `{{t}}`; `aria-label`; `aria-labelledby` naming an id with words; `title`; a non-empty image `alt` inside; for a field, a label or a placeholder | no finding (axe-core 4.12.1's sources) | — |
| Image-only link, can be empty | `<a href="{{url}}"><img alt=""></a>`; `alt="{{feature_image_alt}}"` | one `image_link_unnamed` *(Q2)* | — |
| Image-only link, never empty | NFR-5's chain `{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}`; `{{@site.title}}`; `{{t …}}`; a non-empty literal | no finding | — |
| Image-only in one branch | `<a>{{#if @site.logo}}<img alt="">{{else}}{{@site.title}}{{/if}}</a>` | one `image_link_unnamed` *(Q2)*, for the logo branch | — |
| The figure case | `<figure><img alt="{{#if feature_image_alt}}…{{else}}{{title}}{{/if}}"><figcaption>…</figcaption></figure>` under the page's `<h1>{{title}}</h1>` | no finding (NFR-5: Casper ships it) | — |
| No `alt` attribute | `<img src="…">` anywhere | one `alt_missing` error | — |
| Inline handler | `onclick="…"`, or any `on*`, on any element | one `inline_script` error | — |
| Inline style | `style="color: red"`, against `style="{{#if f}}--p: {{f}}{{/if}}"` | the first: one `inline_style` error; the second: none (AD-3) | — |
| Missing template | the theme without `tag.hbs` | one `template_missing` error naming `tag.hbs` | — |
| Filled by the library | a library whose synthesis fills `page.hbs`, and no `page.hbs` | one `template_missing`; with today's library, none (7.3's Question 1) | — |
| Invalid markup | a link inside a link; one literal id twice on a page; two `<main>`; a stray end tag | one `markup_invalid` error each, naming the page, the file and parse5's code where it has one | — |
| A start tag's alternatives | `<html lang="x"{{#match a "b"}} class="c"{{else}} class="d"{{/match}}>` | no finding: inside a start tag, only the first branch is read | — |
| Build leftovers | a consumed directive attribute; an expression token or a user-text marker; a partial no template reaches | one `build_leftover` error each | — |
| The paywall | `partials/content-cta.hbs` holding a nameless link | read as its own fragment: one `name_missing` *(Q2)*; never an orphan | — |
| Contrast, every preset | each preset, both modes | no finding | — |
| Contrast, a customer's pack | Text on Base below 4.5:1 in Light | one `contrast_low` warning in the Style Pack editor's own words; never an error (FR-E3) | — |
| Ghost's own markup | `{{navigation}}`, `{{pagination}}`, `{{ghost_head}}`, `{{ghost_foot}}` | never read as the theme's markup | — |
| The premise | FR-J17's theme (§ The premise theme), its text 1.5:1 on its pack | gscan 4.49.7 (`v5`) and 6.4.2 (`v6`): 0 errors and 0 warnings. The gate: `language_missing`, `viewport_missing`, `heading_skip`, `alt_missing`, `image_link_unnamed`, `inline_script`, `template_missing` for `tag.hbs` and for `author.hbs`, and `contrast_low`; `blocked: true` | — |
| The negative control | Casper 5.12.1 and Source 1.7.1, Ghost 6.58.0's own | each fails at least one rule, and every finding is real against its source (§ The negative control) | — |
| The gate fails | a file it cannot read as text where text is expected | — | one `quality_check_failed` error, `blocked: true`, no stack; a font's bytes are skipped, never an error |
| Determinism | the same files twice, keys in another order | equal verdicts | — |

</frozen-after-approval>

## Code Map

**The gate: `packages/theme-compiler/`**

- `package.json` — `dependencies` gains `"parse5": "8.0.1"`. `exports["./gate"]` is unchanged; `test` already runs `gate/**/*.test.ts`.
- `gate/verdict.ts`:
  - `Finding` :18-30 and `Verdict` :31, which the quality verdict reuses;
  - `plain` :57;
  - `OURS` (the "ours to fix" sentence), to be exported and reused;
  - `order` :148.
- `gate/index.ts:13-24` — `gscanGate`'s never-throw shape, which `qualityGate` copies, and the export list.
- `gate/gate.test.ts:36-50` — `BASE`, the clean base theme built in memory: the pattern for `quality.test.ts`, and `runGscan` for the premise rows.
- `src/compile.ts`:
  - `ALWAYS` :152 and `WHEN_FILLED` :155, read by `stacksOf` :495-528 (:517, :518). These become the exported required set.
  - `default.hbs` :771-793: `lang` :773, viewport :776, `<main id="site-main">` :762.
  - `startTags` :326-340 parks mustaches before reading attributes: the reader's pattern.
  - `MUSTACHE` :247, `RAW_TEXT` :320 and `HBS_COMMENT` (library).
  - The final checks :848-860.
  - `POST_ARTICLE` :310, whose in-tag `{{#unless}}` the in-tag rule must read.

**The runtime and the library**

- `packages/section-runtime/src/tokens.ts:189-195` — `AA_PAIRS`.
- `packages/section-runtime/src/colour.ts:29` — `contrast`.
- `packages/section-runtime/src/synthesize.ts` — `synthesize` :114 and `SynthesisLibrary` :42.
- `packages/section-runtime/src/index.ts` — exports at :50, :57, :60 and :160-161.
- `packages/section-runtime/src/packs.test.ts` — the presets' AA sheet :55-65 (with the Tangerine control) and the computed colours :66-85.
- `apps/web/lib/pack-edit.ts` — `hardToRead` :200, `ROLE_WORDS` :278, `MODE_WORDS` :279, `pairWords` :280, the warning's words :344. The words move beside `AA_PAIRS`; this file imports them.
- `packages/library/src/vocabulary.ts` — `DIRECTIVES` :733, `CONSUMED_DIRECTIVE_RE` :975 and `MARKS` :455.
- `packages/library/src/validate.ts` — `authored-script` :214-226 and `inline-style` :234-239: the design-time halves of two gate rules.
- `packages/library/baseline.json` — `tier2[].html`: `details`/`name` and `img`/`fetchpriority`.

**Lint and CI**

- `eslint.config.js` — `CORE` :45, `NOT_CORE` :48 (unchanged: `quality.ts` is core) and `FORMATTERS` :84-86.
- `stylelint.config.mjs` — `inflozo/supports-tier-2` :42-65 is the shape of DW-139's new rule; the config's export :119-154.
- `tools/check-baseline.mjs`:
  - `widelyOnPin` :88-91 and `tier2Findings` :134-190;
  - `lint` :198-199;
  - the plugin against the pin :417, `css.properties` only (DW-139);
  - the repository's sheets :561-562;
  - the pilot theme it already compiles for `size-limit`.
- `tools/check-snapshots.mjs` — the harness :152-175 and the 7.7 rows :1162-1210, the place the 7.8 rows go.
- `tools/pilot-theme.mjs`:
  - `SCAFFOLD` :112;
  - `compilePilots` :153, with Paper's `REFERENCE_PACK`;
  - `textFailures` :198 and `themeFailures` :220, whose token and orphan-partial rules become `leftovers`.
- `tools/stress/build.js` — the AD-34 leak block :295-323 and the FR-J17 proxy :325-350 (`Handlebars.precompile` plus JSDOM), which the real gate replaces.
- `tools/probe/record-theme-assembly.py` — `SECTION` :170, `compiled()` :229, `scaffold()` :257, `gated()` :289, `record()` :495.
- `tools/doc-audit.py` — the catalogue: the recorder's row :422, check-baseline's :1183, check-snapshots' :1222, record-gscan's :1281. The new tool needs a row.

**Read-only sources**

- axe-core 4.12.1, `node_modules/.pnpm/axe-core@4.12.1/node_modules/axe-core/axe.js`:
  - `heading-order` :25175-25220, and the rule at :33501;
  - `link-name` :32701, `button-name` :32119, `summary-name` :32988;
  - `label` :32566, `select-name` :32957, `input-button-name` :32502;
  - `image-alt` :32474, `html-has-lang` :32423, `meta-viewport` :32797, `nested-interactive` :32813.
- Ghost 6.58.0, `package/core/server/` in its npm tarball:
  - `models/post.js:764`, which fills an empty title;
  - `data/schema/schema.js:141` and :286, where a user's and a tag's `name` are `nullable: false`;
  - `data/schema/default-settings/default-settings.json`, where `title` defaults to "Ghost" with no minimum length.
- The app, read only (Story 7.18 builds the caller): `apps/web/lib/editor.ts:27`, `CANVASES` — each template's customer-facing name.

**Documents**

- `prd.md`:
  - FR-J17 :419; NFR-5 :486; FR-E3 :256; FR-G4 :286; FR-G8 :304-310;
  - §7.4's tree :596-625 (:603-604, :615);
  - FR-I1 :347.
- `ARCHITECTURE-SPINE.md`:
  - AD-3 :110; AD-34 :388-394, with "700 ms" at :393;
  - the pipeline :555-562;
  - the capability map's `packages/library/a11y-rules` :666, which does not exist.
- `MEASUREMENTS.md` — §11 :274-294 (the proxy's 697 ms) and §14a :452 (1554 ms).
- `epics.md`:
  - Story 7.8's card :3287-3314;
  - 7.18's :3705-3764;
  - 7.33's :4205-4241;
  - Epic 7's preamble :2886-2944.
- `deferred-work.md` — DW-137 :4087, DW-139 :4130, DW-315 :8705.
- `prds/prd-Inflozo-2026-08-17/review-st2-theme-quality.md:144-161` — the premise theme's files.

## Tasks & Acceptance

**Execution:**

- [x] `packages/theme-compiler/package.json`, `pnpm-lock.yaml` — add `"parse5": "8.0.1"` to `dependencies`. `pnpm install --frozen-lockfile` must then install with no new download, because the version is jsdom's own.

  -- the parser, declared.
- [x] `packages/section-runtime/src/tokens.ts`, `index.ts`; `apps/web/lib/pack-edit.ts`:
  - `ROLE_WORDS`, `MODE_WORDS` and the pair's sentence (`pairWords`) move beside `AA_PAIRS` and are exported;
  - `pack-edit.ts` imports them;
  - no word changes, and `pack-edit`'s tests hold unchanged.

  -- R-170: Pre-flight's contrast warning says what the editor says.
- [x] `packages/theme-compiler/src/compile.ts` — export `REQUIRED_TEMPLATES` (`default.hbs`, `index.hbs` and `ALWAYS`'s files) and `requiredTemplates(library)`, which adds each `WHEN_FILLED` file whose `synthesize` stack is not empty. `stacksOf` reads the same constants, and no output changes.

  -- one statement of "every template the theme carries".
- [x] `packages/theme-compiler/gate/verdict.ts` — export `OURS`.

  -- one sentence for "ours".
- [x] `packages/theme-compiler/gate/quality.ts` (core) — `qualityGate(files, { pack, library })`, `QUALITY_RULES`, `readPages(files)` and `leftovers(files)`, per § How the gate reads a theme and § The rules.

  -- FR-J17, AD-3, AD-34.
- [x] `packages/theme-compiler/gate/index.ts` — export them with their types, beside `gscanGate`.

  -- the door Story 7.18 and CI use.
- [x] `packages/theme-compiler/gate/quality.test.ts` — on the clean base theme:
  - the I/O matrix, row by row;
  - every preset clean in both modes, and Tangerine's white on-accent caught (`packs.test.ts`' own control);
  - the premise theme: the gate's findings, and both pinned gscans at 0/0 through `runGscan`.

  -- what the gate promises.
- [x] `tools/pilot-theme.mjs`, `tools/stress/build.js`:
  - `themeFailures`' token and orphan-partial rules call `leftovers`;
  - the stress build's leak block calls `leftovers`;
  - its FR-J17 proxy becomes `qualityGate`, through its adapter, and prints the gate's time.

  -- one spelling; AD-34 measured on the real gate.
- [x] `tools/check-snapshots.mjs` — § What CI holds, rows 1-3, each behind its control.

  -- the gate on every commit.
- [x] `stylelint.config.mjs`, `tools/check-baseline.mjs`, `packages/library/baseline.json` — § What CI holds, rows 4-6:
  - DW-139's rule and its per-family diff;
  - DW-137's markup against the pin;
  - the compiled pilot theme's emitted CSS through the config.

  -- FR-G8 on what a compile emits.
- [x] `tools/quality-gate.mjs` (new), `tools/doc-audit.py` — `node tools/quality-gate.mjs <theme-dir>` prints `qualityGate`'s verdict for any Ghost theme directory, using Paper's pack and an empty library (§ The negative control). It gets its catalogue row.

  -- the negative control's door.
- [x] `tools/probe/record-theme-assembly.py`, `tools/doc-audit.py` — `SECTION` becomes `77`, with § The T1 run's rows; the catalogue row says so.

  -- R-82: Ghost's real pages agree with the gate.
- [x] Documents — apply § Propagated at Dev, then grep for each old wording.

  -- standing rules 3 and 7.

**Acceptance Criteria:**

- **The gate.** Given a compiled theme, when `qualityGate` runs, then:
  - it asserts every rule in § The rules, with the levels § Ruled values states;
  - it stops at the edge of `{{content}}`;
  - it never throws;
  - its verdict reads as AD-24's envelope.
- **CI.** Given `pnpm check`, when it runs, then every row of § What CI holds holds behind its control. The pilot theme's verdict is empty: no error and no warning.
- **The premise.** Given § The premise theme, when it runs through both pinned gscans and through the gate, then gscan scores it 0/0 on both and the gate reports each defect FR-J17 names.
- **The negative control.** Given Casper 5.12.1 and Source 1.7.1 from Ghost 6.58.0's npm tarball, when `tools/quality-gate.mjs` reads each, then:
  - each fails at least one rule;
  - every finding is shown real against the theme's own source, file and line;
  - MEASUREMENTS §77 records both.
- **Measured as a stage (AD-34).** Given the stress fixture and the pilot theme, when each runs the real gate, then its wall time is printed. The stress figure replaces §11's proxy and AD-34's "700 ms" in dated notes.
- **Ghost's own pages.** Given T1 and the owner's in-session go, when the recorder runs, then:
  - § The T1 run's rows hold behind their control;
  - T1 is restored and read back;
  - MEASUREMENTS §77 records the run.
- **AD-1.** Given `pnpm lint`, then `gate/quality.ts` is core and passes the ban, and no product file imports `handlebars`.
- **No screen.** Given Question 1's ruling (option 1, owner, 2026-10-09), when Deploy ends, then:
  - the story is Done on its Deploy commit (R-80);
  - the frame `S8 Deploy.dc.html` S8b, its "matches the frame" criterion and the "failure message" hand test are in Story 7.18's card word for word.
- **A customer's own choices.** Given Question 2's ruling (option 1, owner, 2026-10-09), when a page skips a heading level, holds a link or control with no name, or holds a picture-only link whose description can be empty, then:
  - the finding is a warning that names the section and the fix, and `blocked` stays false;
  - only the rules § The rules marks "error" block.
- **Propagation.** Given Dev's end, then:
  - § Propagated at Dev has landed;
  - DW-137, DW-139 and DW-315 are closed;
  - a grep finds no old wording.

## Spec Change Log

- **2026-10-09, Create (the owner ruled).** Both questions were ruled option 1.
  - Question 1: the frame `S8 Deploy.dc.html` S8b, its "matches the frame" criterion and the "failure message" hand test move word for word to Story 7.18 at Dev (R-195). This story stays `owner_test: none` and is Done on its Deploy commit.
  - Question 2: `heading_skip`, `name_missing` and `image_link_unnamed` are warnings that never block, each naming the section and the fix. Only Inflozo's own faults are errors. `contrast_low` stays a warning (FR-E3).
  - § Ruled values, § The rules' level column, the No screen criterion and the owner's test now state the ruled values, and a criterion for Question 2 is added.
  - The frozen intent is unchanged: each ruling is its recommended option, which the I/O matrix's *(Q2)* rows already show.

## Design Notes

### What the gate returns

```ts
interface QualityVerdict { blocked: boolean; errors: Finding[]; warnings: Finding[] }   // Finding: gate/verdict.ts
export function qualityGate(files: ThemeFiles, input: { pack: Pack; library: SynthesisLibrary }): QualityVerdict
```

- `blocked` is `errors.length > 0`.
- A `Finding` here works as follows:
  - `rule` is the `QUALITY_RULES` id;
  - `level` comes from § Ruled values;
  - `fatal` is always `false`, because Ghost never refuses an upload for these;
  - `refs` is `[page file, file the element is written in]`.
- A message never names a file to the customer. It names the layer, from the boundary comment above the section's invocation, which is the formatting contract's own label. Story 7.18 shows `refs[0]` by its canvas label (`CANVASES`, R-170).
- `readPages(files)` returns each page's assembled, masked text: CI's axe agreement row reads exactly what the gate read.
- `leftovers(files)` returns AD-34's leak sentences.

### How the gate reads a theme

1. **Comments.** `{{!-- … --}}` and `{{! … }}` are dropped. The boundary comment's label is kept for naming.
2. **Pages.** A root template is a `.hbs` outside `partials/`, other than `default.hbs`.
   - One whose first line is `{{!< default}}` is read inside `default.hbs`, at `{{{body}}}`.
   - Any other is read alone, as a document. Casper's `error.hbs` is one.
3. **Partials.**
   - `{{> "name" …}}` and `{{> name …}}` are replaced by `partials/name.hbs`, recursively. The compile writes the quoted form. Hash arguments are ignored.
   - A missing partial reads as empty, because gscan's `GS005-TPL-ERR` refuses it.
   - `partials/content-cta.hbs` is read as its own fragment. Its heading order is judged within it alone.
4. **A mustache is found before anything else**, as `startTags` parks one, so a quote inside it never ends an attribute.
   - **Inside a start tag:** a block keeps its first branch and drops its `{{else}}` branch. Every other mustache reads as the value `x`.
   - **In content:** `{{content}}` and `{{{html}}}` are the edge and read as nothing (R-6). `{{ghost_head}}`, `{{ghost_foot}}` and any triple-stash but `{{{body}}}` read as nothing, because they are Ghost's markup or the theme's raw HTML. Every other expression is the text `x`. Blocks are markers: `{{#…}}` and `{{^…}}` open, `{{else …}}` splits, `{{/…}}` closes.
5. **Alternatives.** Heading order, names, image-only links and ids are judged on each alternative, as an event stream in document order:
   - a block with an `{{else}}` is two alternatives, and an `{{else if}}` is a third;
   - a block without one is read as present — the designed state, every field filled;
   - a repeat body is read once.

   Parse errors, `lang`, viewport and handlers are read once, with every branch present.
6. **The parser.** `parse5.parse(page, { onParseError })`. Every WHATWG parse error counts.

**Ceilings, each in a `ponytail:` comment beside its line:**
- A field Ghost leaves empty at render is not modelled. The render matrix's empty fixtures and Story 7.34 see rendered pages.
- A tag opened in one branch and closed in another reads as one flattened page. The compiler never writes one, because its blocks wrap whole elements.
- The full content model (a `<div>` inside a `<span>`) is a validator's job.

### The rules

| `QUALITY_RULES` id | Follows | `code` | Level | `message` (shape) | `detail` | `action` |
|---|---|---|---|---|---|---|
| `html-parse`, `duplicate-id`, `nested-interactive`, `one-main` | WHATWG parsing; axe `nested-interactive` | `markup_invalid` | error | Part of your theme isn't valid HTML, so browsers would rebuild it differently from your design. | {what}, in {file}; parse5's code and line where it has one. `OURS` | — |
| `html-has-lang` | axe `html-has-lang` | `language_missing` | error | Your theme's pages don't say which language they're in, so screen readers may read them in the wrong voice. | {file}. `OURS` | — |
| `meta-viewport` | axe `meta-viewport`, and presence | `viewport_missing` | error | Your theme's pages don't fit phone screens or let visitors zoom. | {file}: {no viewport meta / zoom stopped}. `OURS` | — |
| `template-required` | `requiredTemplates(library)` | `template_missing` | error | Your theme is missing {file}, which every theme Inflozo builds carries. | `OURS` | — |
| `inline-handler` | FR-J17, D13 | `inline_script` | error | Part of your theme runs a script from an HTML attribute, which Inflozo themes never do. | `{attr}` on `<{tag}>`, in {file}. `OURS` | — |
| `inline-style` | AD-3 | `inline_style` | error | Part of your theme styles an element inline, which Inflozo themes do only to pass one value from Ghost. | the attribute, in {file}. `OURS` | — |
| `build-leftover` | AD-34 | `build_leftover` | error | Pieces of Inflozo's own build were left in your theme's files. | {a directive attribute / a build marker / a partial no template uses}, in {file}. `OURS` | — |
| `image-alt` | axe `image-alt` (`has-alt`, `aria-label`, `aria-labelledby`, `title`, presentational role) | `alt_missing` | error | A picture in your theme has no description attribute at all. | `<img>` in {file}. `OURS` | — |
| `heading-order` | axe `heading-order`: the first heading any level, then never more than one deeper | `heading_skip` | warning (Q2) | The headings skip a level in “{layer}”: a level-{m} heading comes straight after a level-{n} one. | Screen-reader users move through a page by its headings, one level at a time. | If you emptied a title in “{layer}” or the section above it, type it back, or move “{layer}” below a section whose heading is level {m−1}. |
| `link-name`, `button-name`, `summary-name`, `label`, `select-name`, `input-button-name` | axe, each rule's own name sources | `name_missing` | warning (Q2) | A {link/button/field} in “{layer}” has no words a screen reader can say. | — | Give it words in the section's settings. |
| `image-link-alt` | NFR-5 | `image_link_unnamed` | warning (Q2) | A link in “{layer}” is only a picture, and the picture can be left with no description. | Its description is {alt as written}, which can be empty. | Describe the picture in the section's settings. |
| `contrast-aa` | `AA_PAIRS`, FR-E3 | `contrast_low` | warning | Hard to read: {the editor's pair words}. Small text needs 4.5:1 — it still ships. | — | Change one of the two colours in the Style Pack. |
| — | — | `quality_check_failed` | error | We couldn't check your theme, so nothing was sent to your site. | — | Try again in a moment. |

How each rule decides:

- **Never empty, for an image-only link's `alt`:**
  - a non-empty literal, or a `{{t}}`;
  - a field Ghost always fills: a post's `title` (`models/post.js:764`), `@site.title` (§ Readings 4), and a tag's or an author's `name` once Dev confirms Ghost refuses an empty one (otherwise it is not in the set);
  - a field guarded by an enclosing `{{#if field}}`'s first branch;
  - an `{{#if a}}{{a}}{{else}}{{b}}{{/if}}` whose `b` is never empty, which is NFR-5's chain.
- **Image-only:** on some alternative, the link's content, outside `aria-hidden` subtrees and whitespace, is exactly one `<img>` and no text.
- **Contrast:** each `AA_PAIRS` pair, in both modes, from the pack handed in.
  - Every other text colour the engine writes is either stepped to 4.5:1 or is one of these pairs (`tokens.ts`, `packs.test.ts`).
  - A finding is always a warning: CI holds every preset, so at a deploy only a customer's own colour can fail (FR-E3, FR-G4, DW-315).
- **Names** are read from the masked text (`x` counts as words), with `aria-hidden` subtrees left out. A field's placeholder names it, as axe-core 4.12.1's `label` rule counts it (:32566).

### Ruled values: Questions 1 and 2

Both were ruled option 1 by the owner on 2026-10-09.

| Question | Ruled: what this spec builds |
|---|---|
| Q1 · Frame and hand test | No screen (`owner_test: none`), Done on its Deploy commit. "**Frame:** `S8 Deploy.dc.html` S8b" and "**Owner test:** yes (a failure message)" move word for word to Story 7.18, with Epic 7's R-195 list |
| Q2 · A customer's own choices | `heading_skip`, `name_missing` and `image_link_unnamed` are **warnings**: they never block, and each names the section and the fix. Every other rule is an error and says it is ours. `contrast_low` is a warning (FR-E3) |

### Why the floors are checked in CI, not at deploy

- The HTML floor (DW-137) and the CSS floor (FR-G8, DW-139) judge which elements, attributes and stylesheet features a theme uses. A compiled theme draws those only from:
  - the library's designs;
  - the compiler's own lines;
  - the four marks (`strong`, `em`, `u`, `a`);
  - token values that `packTokens`' `check` holds to `#rrggbb` colours, a length and family lists (`tokens.ts`).
- No customer word or choice adds one. So they are checked on every library release, over every design's source and the compiled pilot theme (Story 7.33 runs every design).
- A deploy-time stylelint would add the tool and its plugins to the deploy function and catch nothing new.

### What CI holds

Each row's control fails first.

1. **`check-snapshots` — the pilot theme's verdict is empty**: no error and no warning, with the gate's wall time printed (measured, not asserted).
   - Control: the pilot theme with an `<h4>` planted after A24's `<h1>` in `post.hbs` gives exactly one `heading_skip`, `refs[0]` `post.hbs`.
2. **`check-snapshots` — axe-core agrees.** axe-core 4.12.1, in jsdom over each page `readPages` assembles, runs `QUALITY_RULES`' axe ids and reports no violation. The installed axe-core must be 4.12.1, so a bump re-reads § The rules.
   - Control: the planted page above, where axe's `heading-order` and the gate's `heading_skip` both fire.
3. **`check-snapshots` — `themeFailures` through `leftovers`**, unchanged in what it finds.
   - Control: today's planted token and orphan partial.
4. **`check-baseline` — DW-139.**
   - `inflozo/tier3-by-name`, shaped like `inflozo/supports-tier-2`, refuses by name any function or at-rule prelude form below Widely on the pin, derived from web-features at the pin and never listed by hand.
   - The plugin-against-the-pin diff grows from `css.properties` to `css.at-rules`, `css.selectors` and `css.types`, with one probe form per family. Each family's keys that the form cannot express are named as its ceiling, and differences are kept only where `baseline.json` names them.
   - Controls: DW-139's four witnesses, `@container style(--x: 1) {}`, `if(style(--x: 1): red; else: blue)`, `sibling-index()` and `random()`, are each refused.
5. **`check-baseline` — DW-137, the markup against the pin.**
   - It reads every design's `index.html` and the compiled pilot theme's templates, with mustaches masked.
   - Each element and attribute is mapped to its key: `html.` or `svg.elements.<el>[.<attr>]`, or `.global_attributes.<attr>`.
   - A key that web-features places below Widely on the pin is refused unless `baseline.json`'s `tier2` names it, and a named key passes only on the element its entry names. A key web-features does not map is not judged, which is the ceiling: `class`, `id` and `type` are unmapped.
   - Today: one Tier-2 key, `html.elements.img.fetchpriority` (§ Facts 6).
   - Control: a planted `popover` attribute, `html.global_attributes.popover`, refused.
6. **`check-baseline` — the emitted CSS.**
   - It lints, through the root config: `assets/css/screen.css`, each `<style>` body in a template (with `{{asset "…"}}` read as `/assets/…`), and `assets/css/cards.css` when the theme carries one.
   - Expected: no warning (§ Facts 7).
   - Control: `@container style(--x: 1) {}` planted in `screen.css` is refused by row 4's rule.

`quality.test.ts` holds the I/O matrix, the presets and the premise in `pnpm check` too.

### The premise theme

- It is `review-st2-theme-quality.md:144-161`'s files verbatim:
  - `index.hbs` with `<h4>`, then an `onclick` card holding `<h1><a><img src></a></h1>`;
  - `default.hbs` with no `lang`, no charset and no viewport;
  - `page.hbs` with the page switch;
  - a minimal `post.hbs`;
  - the two `.kg-width-*` lines.
- Two additions:
  - an `<h6>` after the `<h1>`, because FR-J17 states `<h4>`→`<h1>`→`<h6>` and the review's file stops at `<h1>`;
  - a pack whose Light text and background are #eeeeee on #ffffff, which is FR-J17's low body contrast as a pack pair.
- The gate requires `tag.hbs` and `author.hbs`, which this theme lacks. Its missing `error.hbs` is not required: Story 7.3's Question 1 leaves it to Ghost's own page until the library fills it. That is two findings against the premise's "four".
- gscan is run on both pins through `runGscan`. The review ran 6.4.2 at `v5`, the pairing AD-34 calls wrong. A result other than 0/0 is recorded, and FR-J17's premise gets a dated correction.

### The negative control

- **What it means here.** In this project a control is a run that must fail, to prove a check bites (R-82). FR-J1 names Casper and Source as its quality bar, and both are 0/0 on gscan 6.4.2 at `v6`, their own Ghost's checker (§ Facts 3). So:
  - each must fail at least one FR-J17 rule;
  - every finding must be real, checked line by line against the theme's source. A false finding is a defect in the gate, fixed before Done.
- **What was read at this Create**, with a scratch reading of these rules. Dev re-executes it with the real gate.
  - Casper 5.12.1:
    - `error.hbs` is its own document, with `<html>` and no `lang`;
    - headings skip on `post.hbs` (`h1→h4`, the author name) and `error.hbs` (`h1→h3`);
    - the icon-only social links on `author.hbs` have no name;
    - every `<html>` carries an in-tag `{{#match}}…{{else match}}` class pair. Read without § How the gate reads a theme rule 4, that pair is a false `duplicate-attribute`.
  - Source 1.7.1:
    - headings skip on `post.hbs` (`h1→h4`);
    - the social links on `author.hbs`, and `post.hbs`'s avatar link, have no name;
    - the id `Lock-1--Streamline-Ultimate` repeats on each listing page;
    - `<main>` nests inside `<main>` on `index.hbs`, `tag.hbs` and `author.hbs`.

    Its email field is named by a placeholder, which axe-core counts.
- **Where it runs:** `node tools/quality-gate.mjs` over each theme in Ghost 6.58.0's npm tarball (`curl -sSL https://registry.npmjs.org/ghost/-/ghost-6.58.0.tgz`, read only). The recorder writes the findings into §77.
- **The stylesheet half:** the root config over each theme's `assets/built/screen.css`, recorded beside it. At this Create both gave warnings, among them `use-baseline`, the closed prefix list and `motion-gated`; the recorder prints its own counts, never written here.

### The T1 run: `tools/probe/record-theme-assembly.py`, §77

It is §76's run on this tree, with these rows added. The Ghost 5 half is DW-326's (R-238).

1. **The pilots as Ghost renders them.**
   - Fetch `/`, `/page/2/`, a post, `/tag/<slug>/` and `/author/<slug>/`.
   - Run axe-core 4.12.1, in jsdom, with `QUALITY_RULES`' axe ids over each rendered page. Expected: no violation, as the gate's empty verdict says.
   - Each page's `<html lang>` is T1's locale.
   - Each page's heading levels are one of the gate's alternatives for its template.
2. **The probe.** Upload a probe theme under its own name: the pilots, plus an `<h4>` after A24's `<h1>` and an `<a href="#"></a>` in `post.hbs`. Activate it and fetch a post.
   - axe reports exactly `heading-order` and `link-name`.
   - The gate reports exactly `heading_skip` and `name_missing` for `post.hbs`.
   - In a `finally`, Casper is activated again, the probe is deleted, and the active theme is read back.
3. **The negative control** (§ above), recorded beside the T1 rows.
4. **Earlier rows.** Stories 7.1–7.7's rows and §72's paywall probes hold again.

### Settled here as readings, each told to the owner in one line

1. **The gate follows axe-core 4.12.1**, the tool and version the render matrix runs, read in its source. A page's first heading may be any level, and after it no heading goes more than one level deeper. A placeholder names a field. A version bump fails CI until the rules are re-read.
2. **A page is read in its designed state, every field filled**, with each `{{else}}` read as its own page. A field Ghost leaves empty at render is the render matrix's to see, and Story 7.34's.
3. **"Valid HTML" means three things:**
   - the page parses exactly as written, with no WHATWG parse error;
   - no id appears twice;
   - nothing interactive sits inside a link or button, and there is one `<main>`.

   A full content-model validator is not installed. The rest of the content model renders the same, and is a stated ceiling.
4. **`@site.title` counts as filled.** Ghost sets it to "Ghost" at setup, and Casper and Source name their logo links with it. A site with no title has no name anywhere, its tab included.
5. **The HTML and CSS floors are checked on every library release in CI, not inside each deploy**, because nothing a customer chooses or types can add an element, an attribute or a stylesheet feature.
6. **The negative control:** Ghost's own themes must each fail at least one rule, with every finding real. Gscan passes both.
7. **The required templates** are what Story 7.3's ruling makes every theme carry: `default.hbs`, `index.hbs`, `post.hbs`, `tag.hbs` and `author.hbs`, and `page.hbs` and `error.hbs` once the library fills them.
8. **Colour warnings use the Style Pack editor's own words**, from one shared list.
9. **Three items go to the stories that own them:**
   - showing the verdict, storing it, and recording the gate's time per deploy: Story 7.18;
   - the gate over every design at zero findings: Story 7.33;
   - the axe agreement over every design's pages: Story 7.33.

### Facts this spec rests on (standing rule 1)

These were executed or read at this Create (2026-10-09). The scratch scripts were not committed. Dev re-executes each through the gate's tests and the T1 run.

1. **axe-core 4.12.1** (`axe.js`, lines in the Code Map):
   - `heading-order` passes the first heading and then `currLevel - prevLevel <= 1`;
   - `link-name` counts visible text, `aria-label`, `aria-labelledby` and `title`;
   - `label` also counts implicit and explicit labels, a placeholder and a presentational role;
   - `image-alt` passes any `alt`, including an empty one;
   - `heading-order` is tagged best-practice and is not in the matrix's WCAG tags;
   - `duplicate-id` is disabled in this version, so the gate's `duplicate-id` is HTML's own rule.
2. **parse5 8.0.1** (`node_modules/.pnpm/parse5@8.0.1`) is ESM, depends on `entities` alone, and reports through `onParseError`. Executed on Casper, it named `duplicate-attribute` at line 2 until in-tag alternatives were read.
3. **Ghost 6.58.0's npm tarball** bundles Casper 5.12.1 and Source 1.7.1. At `v5`, both fail gscan with `GS005-TPL-ERR` (`social_accounts`, a Ghost 6 helper). At `v6` (6.4.2), both score 0/0 (an executed run, and `review-st2-theme-quality.md:92-111`).
4. **Ghost 6.58.0 fills fields:**
   - an empty post title becomes "(Untitled)" (`models/post.js:764`);
   - a tag's and a user's `name` are `nullable: false` (`schema.js:286`, :141);
   - `title` defaults to "Ghost" with no minimum length (`default-settings.json`).
5. **The pilot theme**, compiled as CI compiles it and read by the scratch reader:
   - no parse error; `lang` and viewport present;
   - headings Home `h1 h2 h2 h3 h3 h2`, index `h2 h3 h3`, post `h1 h2`, tag `h2 h3 h3` on each page, author none;
   - no nameless control, every `<img>` with an `alt`, no image-only link, no repeated id, no handler, no inline style.
6. **The markup against the pin** (web-features 3.35.0, pin 2026-08-18), over every design's `index.html` and the pilot templates:
   - one key below Widely, `html.elements.img.fetchpriority` (Tier 2, named);
   - web-features maps no key for `class`, `id` or `input`'s `type`;
   - below Widely on the pin, it carries `html.global_attributes` keys, `popover` among them (the control), and `html.elements` keys, mostly attribute values; counts are the check's own, never written here.
7. **The emitted CSS:** the pilot theme's `screen.css` and its `@font-face` `<style>` give no warning through the root config.
8. **Contrast:** `AA_PAIRS` is the five pairs. `packs.test.ts` holds every preset at 4.5:1 and every computed text colour. `hardToRead` reads `AA_PAIRS` alone.

### Propagated at Dev

- **`prd.md`:**
  - FR-J17 gets a dated note:
    - what landed: `qualityGate`, its rules and its reading;
    - the floors held in CI over every design (Readings 5);
    - the levels as Question 2 rules;
    - the frame as Question 1 rules;
    - the premise re-run on both pins;
    - the negative control's result;
    - `valid HTML` as Readings 3 defines it.
  - §7.4's tree: one dated line saying `page.hbs` and `error.hbs` ship when filled and `home.hbs` when designed (FR-I1, Story 7.3's Question 1), and that the gate's required set is `requiredTemplates`.
  - NFR-5: a dated line saying its image-only-link and heading rules are held on every compiled theme by FR-J17's gate.
- **`ARCHITECTURE-SPINE.md`:**
  - AD-34:
    - the gate's file, which is core;
    - "700 ms" replaced by the real gate's measured time, with the proxy named as such;
    - "the rules are data … shared with the render matrix's axe-core pass" made precise: `QUALITY_RULES` names its axe-core rule, and CI's row 2 holds the two in agreement.
  - AD-3: the gate's `inline-style` rule asserts it.
  - The capability map's `packages/library/a11y-rules` becomes `packages/theme-compiler/gate/quality.ts`'s `QUALITY_RULES`.
- **`MEASUREMENTS.md`:** a dated note under §11 and §14a giving the real gate's time on the same fixture; §77, written by the recorder.
- **`docs/section-authoring.md` § 4:**
  - a link whose only content is a picture carries a never-empty `alt`, such as NFR-5's chain or a guard;
  - every interactive element has a name that axe-core counts;
  - a design's headings never skip a level internally;
  - the gate holds each on every compiled theme.
- **`epics.md`:**
  - Story 7.8's card, as landed: Frame, Owner test and Verification per the rulings.
  - Story 7.18's card:
    - Question 1's moved text, word for word;
    - Pre-flight runs `qualityGate` on the same compile as `gscanGate` and shows its rows beside gscan's (S8b as extended);
    - its verdict is stored with the deploy beside `deploys.gscan` (a new column is a `Schema` push first, R-99), and a blocking finding is stored as `deploy_jobs.error`;
    - its time goes in `deploy_jobs.stage_timings` (AD-34);
    - `refs[0]` is shown by its canvas label.
  - Story 7.33's card: `qualityGate` over every synthetic theme at zero findings of either level, plus row 2's axe agreement, because a warning there is a library defect.
  - Epic 7's preamble: "Moved from Story 7.8 by its Question 1" and "Given owners by Story 7.8's Create", each a numbered list (R-195).
- **`deferred-work.md`:**
  - DW-137 and DW-139 are closed, as built;
  - DW-315 is closed: contrast warns and never blocks (FR-E3), and CI holds the presets.
- **`epic-7-context.md`:** a sub-bullet for each item above.
- **Last:** grep for each of these:
  - "700 ms" in the spine;
  - `a11y-rules`;
  - "FR-J17 gate proxy";
  - "Handlebars.precompile" in `tools/stress`;
  - "is open" on DW-137, DW-139 and DW-315.

### The commits

There is no migration, so there is no Schema phase. `Story 7.8 - Dev - …` carries:
- the code, the tools and the documents;
- §77, if the T1 run happens in the Dev session on the owner's go.

## Owner's manual test

None. Question 1 was ruled option 1 (owner, 2026-10-09), so this story has no screen: no frame and no hand test, and it is Done on its Deploy commit (R-80). The automated checks prove the sentences, and T1 proves that Ghost's real pages agree with the gate. The frame S8b and the failure-message hand test are Story 7.18's, word for word.

## Questions for the owner

Both were ruled option 1 (owner, 2026-10-09). Dev builds § Ruled values as it stands.

### Question 1 — Where you first see these messages, and when you test them

**In plain English.**
- This story builds the quality check and its sentences, but nothing on screen shows them yet.
- They appear in the deploy screen's check step, Pre-flight, drawn as S8b: "Checking your theme (Ghost will love it)".
- Story 7.18 builds that screen and the server step that builds your theme from your project. It already takes the theme checker's rows on that screen: you ruled so for Story 7.7 on 2026-10-09.
- The plan gave this story a hand test of one failure message. A real failure can only be shown once Pre-flight exists.

**Example.** In Story 7.18 you delete the post grid's title on Home and press Ship it. Pre-flight shows "Checking your theme — 0 errors · 1 warning", with the heading sentence from Question 2.

1. **Move this story's frame and its hand test, word for word, to Story 7.18,** beside the theme checker's. This story then has no screen, and it is done when it deploys green. The automated checks and our test Ghost site prove its sentences. **(RECOMMENDED)**
2. **Build the check step now,** so you test one message by hand in this story. This pulls Story 7.18's server-side build of your theme into this one, and makes it several times bigger.

**Ruled: option 1 (owner, 2026-10-09).**

### Question 2 — When your own choices make a page harder to use, does Ship it stop or warn?

**In plain English.**
- The quality check reads every page of your theme the way a screen reader moves through it.
- Most of what it checks is ours: the language tag, the phone-screen tag, the files every theme needs, no hidden scripts. Those can only fail if Inflozo itself is wrong. They always stop a deploy, and the message says the fault is ours.
- Three checks can fail because of something you chose:
  - headings that skip a level;
  - a link or button with no words;
  - a link that is only a picture, with no description.
- Colours already have the rule you approved: a pair that is hard to read is a warning, never a block.
- The plan says every theme must pass before it can deploy. Taken literally, emptying one section's title would stop Ship it until you type it back.

**Example.** On Home you have a hero with a big title, then a post grid. You delete the post grid's title. Now the post titles in the grid (level 3) come straight after the hero's title (level 1).
- With option 1, Pre-flight shows a warning: "The headings skip a level in “Post grid” … If you emptied a title in “Post grid”, type it back." Ship it still works.
- With option 2, Ship it stays greyed until you type the title back or move the grid.
- With option 3, the heading case is a warning as in option 1. A picture-only link with no description would stop Ship it.

1. **Warn, never stop, when the cause is your own choice** — the same rule you set for colours. Each warning names the section and the fix, and only Inflozo's own faults stop a deploy. **(RECOMMENDED)**
2. **Stop on all of them,** as the plan reads today. Ship it stays greyed until the page passes.
3. **Warn on headings, stop on missing words or descriptions.** A skipped heading breaks a good-practice rule. A link a screen reader cannot name fails the accessibility standard the plan holds us to, WCAG 2.1 AA.

**Ruled: option 1 (owner, 2026-10-09).**

## Verification

**Commands:**

- `pnpm install --frozen-lockfile` (Node 24) — expected: installs with `parse5` 8.0.1 declared and no new package.
- `pnpm check` — expected: green. That covers:
  - lint, with `gate/quality.ts` core and no product `handlebars` import;
  - the typecheck;
  - `quality.test.ts` (the I/O matrix, the presets, the premise on both pinned gscans);
  - `check-baseline` rows 4-6;
  - `check-snapshots` rows 1-3, each behind its control.
- `cd tools/stress && npm install && node build.js && node gate.js theme` — expected: 0 errors and 0 warnings on gscan 4.49.7 (`v5`) and 6.4.2 (`v6`), unchanged. The real gate runs where the proxy ran, prints its time, and reports no finding.
- `node tools/quality-gate.mjs <dir>` over Casper 5.12.1 and Source 1.7.1 from Ghost 6.58.0's npm tarball — expected: each fails at least one rule, and every finding is real (§ The negative control).
- `python3 tools/probe/record-theme-assembly.py`, on the owner's in-session go, in the main session — expected:
  - every §77 row holds behind its control on T1 `ghost6.inflozo.com` (6.58.0);
  - T1 is restored and read back.
- `python3 tools/doc-audit.py --check`, twice — expected: PASS.

**Manual checks:**

- Each negative-control finding is read against its file and line in the theme's source, and none is false.
- No snapshot and no render-matrix baseline moved.
- Every sentence in § The rules reads as plain English, with no file name shown to a customer.

**Real infrastructure (R-82):**

- T1 `ghost6.inflozo.com`, through the recorder: the pilots and the probe rendered by Ghost, and axe-core on Ghost's real pages against the gate.
- The npm registry, read only: Ghost 6.58.0's tarball for Casper and Source.
- Vercel: CI's `check`, `rls` and `deploy` green, and the deployment READY at the head. The app changes only in where `pack-edit.ts` reads its words.
- There is no migration and no Supabase, Resend or Dodo surface. The gate has no product caller until Story 7.18.

**Dev results (2026-10-09, main session; the T1 run on the owner's in-session go, option 1, 2026-10-09):**

- **The install.** `pnpm install --frozen-lockfile --offline` (Node 24.18.1, pnpm 11.22.0): "Lockfile is up to date … Already up to date". `parse5` 8.0.1 is declared, it is the copy jsdom already installed, and nothing was downloaded.
- **`pnpm check` (Node 24.18.1)** — exit 0. That covers:
  - lint, including `check-baseline`'s new control: a builtin import at `gate/quality.ts` is refused, so the file is core, and the same line at `gate/gscan.ts` is not;
  - the typecheck;
  - every package's tests, among them `gate/quality.test.ts`, whose premise rows run both real pinned gscans.
  - `check-baseline` printed each row `ok` after its control:
    - DW-139's four witnesses, an `@font-face` descriptor and an `@import … supports()` each refused by `inflozo/tier3-by-name`;
    - the pin diff over `css.properties`, `css.types`, `css.at-rules` and `css.selectors`, at 0 wider and 0 narrower, each family's ceiling named;
    - DW-137: a planted `popover` was refused as `html.global_attributes.popover`, and `fetchpriority` passes on `img` but is refused on `link`; every design and the pilot templates are Widely, bar the named Tier-2 key;
    - the emitted CSS: a planted `@container style(--x: 1) {}` was refused, and the pilot theme's `screen.css` and `default.hbs`'s `<style>` gave no warning.
  - `check-snapshots` printed the 7.8 rows `ok` after their controls:
    - the planted `<h4>` gave exactly one `heading_skip` with `refs[0]` `post.hbs`;
    - the pilot verdict was empty, with `qualityGate` measured at 56 ms on this run;
    - axe-core 4.12.1 reported `heading-order` on the planted `post.hbs`, and nothing over the pilot pages;
    - `themeFailures` carried `leftovers`' sentences for a planted token and an orphan partial, and `leftovers` was clean on the pilots.
- **`tools/stress`** — `node build.js && node gate.js theme`: 0 errors and 0 warnings on gscan 4.49.7 (`v5`) and 6.4.2 (`v6`), unchanged. The stage line now reads "FR-J17 quality gate + leak assertions 119 ms (qualityGate and leftovers, the real gate)". Both report nothing. That 119 ms replaces the proxy's 697 ms in §11's and AD-34's dated notes.
  - `npm install` there failed on the root-owned `node_modules`, a known machine quirk; the installed copy ran.
- **The premise (AC "The premise").** On both pinned gscans, the review's files verbatim score 0 errors and **one warning, `GS051-CUSTOM-FONTS`**. With Ghost's two `--gh-font-*` variables declared, they score 0/0.
  - The spec's "a result other than 0/0 is recorded" is honoured: FR-J17, FR-J6 and §7.6 carry the dated correction.
  - The gate reports `language_missing`, `viewport_missing`, `alt_missing`, `inline_script`, `template_missing` for `tag.hbs` and for `author.hbs`, `heading_skip` (h1→h6), `image_link_unnamed` and `contrast_low` (Text on Base in Light, 1.1:1 for #eeeeee on #ffffff), and `blocked: true`.
- **The negative control (AC "The negative control").** Run with `node tools/quality-gate.mjs` over Ghost 6.58.0's npm tarball (`curl -sSL https://registry.npmjs.org/ghost/-/ghost-6.58.0.tgz`, read only), re-run in the main session. Every finding was read against the theme's source here, and none is false:
  - **Casper 5.12.1**, blocked:
    - `error.hbs:16` `<html>` with no `lang`;
    - headings skip at `error.hbs:47→54` (h1→h3) and `post.hbs:26→50` (h1→h4);
    - the icon-only social links on `author.hbs:54…78` have no name: `icons/*.hbs` are SVGs with no title;
    - `partials/icons/loader.hbs` and `rss.hbs` are used by no template. The only dynamic partial, `default.hbs:88`'s `{{#> (concat "icons/" type)}}`, reaches only `social_accounts`' platform types, read in Ghost's `core/frontend/helpers/social_accounts.js`, and neither file is one of them.
  - **Source 1.7.1**, blocked:
    - `<main>` nests inside `<main>` through `partials/components/post-list.hbs:18`;
    - the id `Lock-1--Streamline-Ultimate` (`partials/icons/lock.hbs:1`) repeats. The gate reaches it through `post-list.hbs`'s feed blocks, each read as present, and it is real on any listing with two paid posts, because `{{#foreach}}` repeats `post-card.hbs:35`'s lock;
    - a heading skips at `post.hbs:15→35` (h1→h4);
    - links with no name at `author.hbs:23` (`icons/x`) and `post.hbs:30` (`icons/avatar`);
    - `partials/icons/checkmark.hbs`, `fire.hbs` and `rss.hbs` are used by no template.
  - Both stylesheets give warnings through the root config (`use-baseline`, the closed prefix lists, `motion-gated`, nesting). The tool prints its own counts, and §77 records them.
- **T1 `ghost6.inflozo.com` (Ghost 6.58.0)** — `python3 tools/probe/record-theme-assembly.py`, with the keys read in-process by variable name (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY` in `tools/probe/.env`), never printed. Exit 0, every row PASS, and MEASUREMENTS §77 written:
  - (d) axe-core 4.12.1, over `/`, `/page/2/`, a post, `/tag/craft/` and `/author/umang/` as Ghost rendered the pilots, reported no violation of `QUALITY_RULES`' axe ids. Each page's `<html lang>` was the site's `en`, and each page's heading levels were one of `readPages`' alternatives for its template (Home `h1 h2 h3 h2`, index and tag `h2 h3`, post `h1 h2`, author none);
  - (e) the probe `inflozo-probe-quality`: locally, the gate reported exactly `heading_skip` and `name_missing` for `post.hbs`. On T1, axe on Ghost's rendered probe post reported exactly `heading-order` and `link-name`, and the read carried this run's nonce;
  - (f) the negative control, recorded beside the T1 rows: each theme fails at least one rule, and each finding is quoted at its source line;
  - Stories 7.1–7.7's rows held again: the pilots' local gate was 0/0 on both gscans, §72's paywall probe and its control held, and so did 7.7's three gscan-gate probes (200, 422 `ThemeValidationError`, 200 with the cascade);
  - the active theme was read back as `casper` after every upload, and every probe theme was deleted (installed after: `casper`, `racer`, `source`). This month's probe picture was reused, so no picture was uploaded;
  - the Ghost 5 half is DW-326's (R-238).
- **Matrix audit.** Every I/O row maps to a check that ran:
  - the pilot theme: `check-snapshots`' 7.8 rows;
  - the negative control: `tools/quality-gate.mjs` and §77 (f);
  - every other row: its own `test(…)` in `gate/quality.test.ts`, in matrix order;
  - "Filled by the library, with today's library, none": the pilot verdict, which is compiled with the library on disk.
- **Judgement calls, for Review:**
  - `inflozo/tier3-by-name` also refuses below-Widely descriptors inside at-rule blocks, such as `@font-face { ascent-override }`. That is a stricter reading of FR-G8, and the library is unchanged by it;
  - `hardToRead` itself moved beside `AA_PAIRS`, with its words, so the editor and the gate run one check. `pack-edit.ts` re-exports it;
  - the layout line is found anywhere in a template, as express-hbs 2.5.0 does (`lib/hbs.js`, read in source), not only on the first line;
  - parse5 reports tokenizer errors only, so a stray end tag (a link inside a link among them) is found from parse5's own source locations;
  - a defect is said once per file: Casper's many nameless social links are one warning;
  - `tools/stress/sections.js`'s post card was a picture-only link with `alt=""`, the real gate's first finding there; its `alt` now binds the post's title.
- **Vercel, Supabase, Resend, Dodo** — not touched at Dev. There is no migration and no Supabase, Resend or Dodo surface. Review reads CI's `check`, `rls` and `deploy` and the deployment's READY state at this head.
