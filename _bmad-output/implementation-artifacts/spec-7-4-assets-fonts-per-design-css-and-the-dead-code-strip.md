---
title: 'Story 7.4 — Assets, fonts, per-design CSS and the dead-code strip'
type: 'feature'
created: '2026-10-08'
status: 'ready-for-dev'
owner_test: none
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, the theme Inflozo builds for your site carries your pack's fonts inside it, so no visitor's browser ever asks Google for them, and it tells the browser to fetch the two main ones first; a font you pick in Ghost Admin still wins. The theme's stylesheet ships only the rules the sections you placed can actually use, plus the plain page background behind them and each section's own dark-mode background, so a visitor in dark mode sees the background you chose for that section. You ruled both questions on 2026-10-08, so there is nothing for you to test by hand here: your pictures, the theme-size check and its warning's hand test move to Story 7.29, fonts for a non-Latin language move to Story 7.12, and the automated checks and our test Ghost site prove the rest.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:**
- A compiled theme ships no fonts, so a live site falls back to the visitor's system fonts (FR-J3, Appendix D §D.a). Ghost's two font variables are missing, which raises `GS051` on both gscans, a standing warning the T1 recorder papers over with a scaffold labelled Story 7.4's (AD-18).
- `screen.css` carries every rule of each placed design, including the rules for control values no placed section uses (FR-G7's dead branches). It has no base: the theme's body keeps the browser's margin, and the page behind the sections stays white in dark mode.
- A section's dark override never reaches a visitor. The compile calls neither `darkOverrideCss` nor `darkHook` (AD-30, Story 6.5). DW-331's three loose ends are open:
  - the editor and the theme do not build the hook's key in one place;
  - a hook collision is a bare compile error;
  - no browser proof runs in CI.
- AD-14's reachability record does not exist, so NFR-2's CSS budget has no subject. No theme carries Tabler's licence or a font's (R-26, DW-108). `stripCssComments` cuts an unquoted `url(http://x/*/y)` (DW-337).

**Approach:**
- `compileTheme` is handed the pairing, the font pool's bytes and the project's mode, and returns its files with AD-14's record. Fonts are written as follows:
  - the pairing's pool files are copied into `assets/fonts/` as they are;
  - `default.hbs`'s head preloads the two roman faces and carries the `@font-face` rules, both through `{{asset}}`;
  - each licence ships at the theme root.
- `screen.css` is written in this order:
  - the token block: `packTokensCss` with AD-18's two variables, then `darkOverrideCss`;
  - the canvas's base;
  - each placed design's sheet, cut to the rules its placed roots can reach.
- DW-331 is closed in four places:
  - one key builder;
  - the theme stamps the hooks;
  - a collision is refused by name;
  - two keyboard-gate journeys give the browser proof.
- CI measures the cut and holds it sound. It also asserts AD-37 and the per-template CSS budget over the pilot theme.
- Two parts have nothing to act on yet, and the spec plans the recommended ruling for each:
  - the pictures and the theme-size check (Question 1);
  - whole fonts for a non-Latin language (Question 2).

## Boundaries & Constraints

**Always:**

- **Pure and deterministic (AD-1, AD-14).** Every input is handed in. The font pool's files arrive through `fonts`, which the shell reads, so the core reads no file.
  - The same input gives the same files and the same record, whatever its key order.
  - Binary files are compared by their bytes.
- **One implementation of each rule.** The compile writes no second copy of any of these:
  - faces: `fontFaceCss` (`packages/section-runtime/src/fonts.ts`);
  - the token block: `packTokensCss`;
  - a section's dark look: `darkOverrideCss` and `darkHook`, keyed by `sectionKey` and hashed by `hookOf`;
  - a root's values: `resolveControls`;
  - attribute selectors: the validator's `attributeSelectors`;
  - comments: `stripCssComments`;
  - a compiled place's key: `templateKeyOfFile`.
- **Fonts are the pool's, as built.**
  - Only the pairing's own files ship: `latin` and `latin-ext` for every project, the files the pool already holds (§D.b static subsetting).
  - Nothing is subset, re-encoded or renamed by the compile. Nothing in a theme names a font host (§D.a rule 6).
  - A file whose byte length is not the pool's record is refused.
- **One address per font.** A preload's `href` and its face's `src` are the same `{{asset "fonts/<file>"}}` expression (Design Notes § Facts 1–2). The inline `<style>` in `default.hbs` holds `@font-face` rules only and names no mode, so `screen.css` stays the one file that does (AD-30).
- **AD-18 in the theme only.** The token block declares `--font-heading: var(--gh-font-heading, <heading list>)` and `--font-body: var(--gh-font-body, <body list>)`. `packTokensCss(pack)` with no option is unchanged, so the canvas and `reference-tokens.css` are unchanged.
- **The strip removes only what it can prove dead** (Design Notes § The strip):
  - its proof is the root's own attributes, read through `resolveControls` and never from stored values;
  - it keeps every rule it cannot judge;
  - `darkOverrideCss` reads the library's unstripped sheet;
  - the canvas strips nothing.
- **The hook.**
  - The key is `sectionKey(templateKey, instanceId)`, where `templateKey` names the place in the theme the section fills, on the canvas and in the theme alike (Design Notes § Dark overrides). This is the "file it compiles the section into" that `darkHook`'s comment promises.
  - An archive's page 2 that follows page 1 has no markup of its own, so its sections take page 1's key.
  - A Light-only project (`dark_enabled = false`) gets no hook and no per-section rule, on either side.
  - Two sections whose keys hash alike are refused by name, with the remedy. The 32-bit hash stays.
- **Licences travel with what they cover.** A licence ships with every family whose files ship, and Tabler's whenever any icon is drawn. Only whitespace is normalised (line endings, trailing spaces, one final newline); the words are never changed.
- **Counts are derived.** No check or message writes down how many files, faces, designs, rules or bytes exist.

**Ask First:**

- **The rulings.** Dev waits for both questions.
  - Option 1 of each is planned.
  - Any other ruling adds work this spec does not plan, so the spec is amended at the ruling (`Story 7.4 - Create - the owner ruled …`) before Dev starts.
- **The T1 run.** It uploads theme files to T1, so it needs the owner's in-session go, in the Dev or the Review session. It runs in the main session, never through a subagent.
- **Anything gscan names on the pilot theme beyond the scaffold.** Once AD-18's two lines leave it, the scaffold is `assets/css/cards.css` with D12's two widths (Story 7.13's) and the stand-in `page.hbs` (Story 10.79's).
- **A T1 row that does not hold.** Ghost behaving otherwise than its source reads is a stop, never a widened rule.

**Never:**

- **Anything a later story owns:**
  - under Question 1's recommended ruling, Story 7.29's:
    - `assets/images/`, renditions, content-hashed picture names and a bundled picture's `srcset`;
    - the theme-size budget, the probe of its limits and its Pre-flight message;
    - the icons' share of the budget;
  - under Question 2's, Story 7.12's: whole faces for a non-Latin language;
  - JS and per-design modules: 7.5;
  - `post_class` and markup helpers: 7.6;
  - the gscan mapping: 7.7;
  - the quality gate: 7.8;
  - `config.custom` and `color_scheme`: 7.10 and 7.11;
  - `locales/`: 7.12;
  - `cards.css` and `card_assets`: 7.13;
  - Pre-flight and the deploy: 7.18;
  - README and credits: 7.28;
  - compile CI over the whole library: 7.33;
  - the canvas-against-Ghost comparison: 7.34.
- **Fonts done any other way:** a font host, content-driven subsetting, or a face outside the pairing's pool record.
- **Changing what is not this story's:** a design's stylesheet, the library's designs, `packTokensCss(pack)`'s default output, `HOOK_RE` or the hash width.
- **A database change or a new dependency.** There is therefore no Schema phase.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Paper's fonts | `pairing: 'D1'` with Paper's pack | `assets/fonts/` holds exactly the pool files of D1's faces (Fraunces' roman, Inter's roman and italic, each `latin` and `latin-ext`), each the bytes `fonts` returned. `default.hbs`'s head preloads Fraunces' and Inter's roman `latin` files and carries D1's `@font-face` rules. `LICENSE-fraunces.txt` and `LICENSE-inter.txt` sit at the theme root | — |
| One family in both roles | D12 (Newsreader) | Newsreader's two faces, one preload (the shared roman) and one licence | — |
| A static body family | D15 (Lora with Lato) | Lora's roman and Lato's four static faces ship. The preloads are Lora's roman and Lato's first roman face in the pool's order (400) | — |
| Fonts that disagree | `pack.fonts` is not `pairingFonts(pairing)` | — | throws, naming the pairing and the pack's two families |
| A short read | `fonts(path)` returns a length other than the pool's `bytes` | — | throws, naming the file |
| Ghost's font variables | any compile | `screen.css`'s `:root` declares both `var(--gh-font-…, …)` forms. `packTokensCss(pack)` called with no option gives the same bytes as before, so `reference-tokens.css` and the canvas are unchanged | — |
| The base | any compile | `screen.css` carries `BASE_CSS` after the token block. It is the constant the canvas document's `2-document` style opens with | — |
| A dark override, Light + Dark | an instance whose Background is overridden in dark, `darkEnabled: true` | its root carries `data-instance="<hook>"`, where `<hook>` is `hookOf(sectionKey(<key of its place>, instanceId))`. The token block ends with `darkOverrideCss`'s rules for that hook. An instance with no override carries no hook | — |
| Light-only | the same instance, `darkEnabled: false` | no `data-instance` anywhere and no per-section rule. The pack's dark map is unchanged | — |
| Keys by place | overrides on the site doc, on Home, on Home's page 2 (its own design or the copy, both in `index.hbs`), on a Tag page 2 with its own design, on a custom template and on the paywall | the keys are `site:…`, `home:…`, `index:…`, `tag-paged:…`, `custom:custom-x.hbs:…` and `paywall:…`, the keys the editor hashes today | — |
| An archive's page 2 that follows page 1 | an override on Tag's page 1, with no page-2 design | the one markup `tag.hbs` ships takes the `tag:…` key, and the editor's page-2 view now hashes the same key, not `tag-paged:…` | — |
| Two hooks collide | two placed sections whose keys hash alike | — | throws a refusal naming both layer names and files, with the remedy "delete one of them and add it again" |
| The strip | A17 #1 placed only at `per-row: three` | every selector that requires `[data-per-row="two"]` or `"four"` on the root is gone. A list keeps its other selectors, and an `@media` block left empty goes | — |
| Two placements, two values | A17 #1 at `three` on Home and at `two` on Tag's page 2 | the rules for both values stay | — |
| A forced value | A4 #13 stored with `primary-action: off`, which forces `secondary-action` off | the rule that needs both off is kept, because reachability reads `resolveControls` | — |
| What the strip cannot judge | an attribute inside `:not()`, `:is()`, `:where()` or `:has()`; any operator but `=` or presence; a compound that does not start at the root; an at-rule other than `@media` | kept whole | — |
| A dark value's root rule | A17 #1's `[data-bg="contrast"]` when no instance is at contrast in light | stripped from the sheet. `darkOverrideCss` still writes its declarations for an override | — |
| Hidden only | a design whose every instance is hidden | its sheet does not ship | — |
| The record | the project | `css.reach['home.hbs']` is the site doc's designs plus Home's, and `css.reach['post.hbs']` adds the paywall's. `screen.css` is `css.global`, then each `css.sheets` chunk in design order | — |
| A Tabler icon | a placed section draws an icon | `LICENSE-tabler.txt` at the root, byte for byte `TABLER_LICENSE`. With no icon drawn, there is no file | — |
| DW-337 | a sheet holding `url(http://x/*/y)` followed by a comment | `stripCssComments` keeps the URL whole and removes the comment | — |
| Determinism | every input in another key order | the same files, byte for byte, and the same record | — |

</frozen-after-approval>

## Code Map

**The compiler: `packages/theme-compiler/src/`**

- `compile.ts`:
  - `CompileInput` :34-60 gains `pairing`, `fonts` and `darkEnabled`.
  - `compileTheme` :302 returns `{ files, css }`.
  - The render loop :323-359: `renderTheme` :336-351 takes `instance`, the hook. The light controls :342 stay as they are.
  - `tidyCss` :240-241 and `designOrder` :244-245.
  - `default.hbs`'s head :439-455 gains the preloads and the faces' `<style>`.
  - `screen.css` :457-462.
  - The substitution pass :467 must skip bytes: `UserText.substitute` is a `replace`, `core.ts:358`.
  - The final checks :468-471 read `.hbs` files only.
  - `noC0` :313-315.
- `compile.test.ts`:
  - helpers: `design()` :29-38, `LIB` :45-107, `at()` :110-113, `input()` :118-120, `compile()` :121, `project()` :124-137;
  - the whole-output scan :366-396. Rule 1 at :378, the C0 checks at :372 and the loops at :231, :254 and :608 read every file as text;
  - determinism :398-410 and :711-720 use `assert.equal`, which compares by identity, so bytes need `deepEqual`.
- `index.ts` — the package's exports.
- New: `strip.ts`, with its test beside it.

**The runtime: `packages/section-runtime/src/`**

- `dark-override.ts`:
  - `HOOK_RE` :26, `fnv1a` :30, `changing` :40, `darkHook` :53, `PlacedSection` :58, `darkOverrideCss` :74;
  - its collision throw names keys only, and it reads `entry.css` through `modeScopedRules` :85;
  - `dark-override.test.ts:82` keys Home's page-2 copy as `home-2:…`; the real key is `index:…`.
- `tokens.ts`:
  - `packTokens`' fonts :316-317, `LINK_RULES` :374, `MODE_SELECTORS` :407, `packTokensCss` :422.
  - `tokens.test.ts` and `tools/stress/test-vocabulary.mjs` hold its bytes.
- `fonts.ts` — `fontFaceCss` :21 (its `url` callback decides each address) and `faceRulesCss` :30.
- `controls.ts`:
  - `resolveControls` :146: defaults are written, a `disabledBy` control takes its forced value, and a universal narrowed to nothing is absent;
  - `darkOverridesInForce` :283.
- `core.ts`:
  - `RenderInput.instance` :188-192;
  - `stampControls` :1369-1395 strips the root's `data-*`, stamps the controls, then the hook;
  - `iconSvg` :1471, which the theme emitter calls through `RenderInput.icons`;
  - `renderTheme` :1924.
- `index.ts` :54 — `darkHook`, `darkOverrideCss`, `HOOK_RE`. `fonts.ts` is its own subpath and never this index (`tools/check-traces.mjs`).

**The library: `packages/library/src/`**

- `packs.ts` — `POOL` :67, `pairingOf` :70, `faceOf` :77, `pairingFaces` :84 and `pairingFonts` :98.
- `pool.json` gives each file's `bytes` and `sha256`, and each family's `slug` and `licenceFile`.
- `../fonts/files/` and `../fonts/licences/`:
  - 5 licences are CRLF (anton, dm-sans, dm-serif-display, ibm-plex-mono, space-grotesk);
  - most carry trailing spaces;
  - newsreader and spectral lack a final newline.
- `validate.ts`:
  - `attributeSelectors` :980 is module-private today;
  - `validateStylesheet` :1066, with its operator table :1094-1104;
  - `modeScopedRules` :1173, the one-pass scan whose shape the strip follows;
  - `COMMENT_OR_STRING` :1283 and `stripCssComments` :1287 (DW-337);
  - `rootClassOf` :1115.
- `vocabulary.ts` — `PAYWALL_TARGET`, `COMPILE_TARGETS`, `CUSTOM_TARGET_RE` and `PAGINATED_TARGETS` (the shapes `templateKeyOfFile` reads), and the universals :276-305 (`bg` alone is mode-scoped, :285).
- `icons.ts:32` — `TABLER_LICENSE`, which `test-vocabulary.mjs` holds equal to `icons/LICENSE-tabler.txt`.

**The editor and the app: `apps/web/`**

- `app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - `queryKey` :918;
  - the two hash sites, the re-stamp :2364 and the paint :3149;
  - a second `keyOf` :4351;
  - `darkEnabled` :803, which gates the Layers moon :4367 but not the hash.
- `components/controls/layers.tsx:178` — a third `keyOf`, which feeds `data-layer-row` :228.
- `lib/page-two.ts` — `stackOf` :134-143 sets each row's `doc` (`ownKeyOf` :123-124), and the hook key is built from that `doc`.
- `lib/editor.ts` — `CANVASES` :25-48, `SITE` :57, `PAGE_TWO` :104-108, `fileOfKey` :122-129: the app's key↔file map, which a package cannot import.
- `lib/pilots.ts` — `pilotsCanvasDocument`'s `2-document` style :199.
- `app/(app)/app/(authed)/pilots/review.tsx`:
  - `canvasSrc` is hard-wired at :122;
  - `paint` :128-157 and `onChange` :172;
  - `page.tsx` — the props the harness page mirrors.
- The harness:
  - `lib/harness.ts` (`HARNESS`);
  - `app/(app)/app/harness/editor/layout.tsx`, the mount to copy;
  - `lib/canvas.ts:177` `harnessCanvasSrc`;
  - `busy.test.ts:173-191` and `app-routes.test.ts:57-61`, which list the harness-only routes.
- `dark-mode.test.ts:127-144` — source-text guards on the editor's and `/pilots`' hash and mode calls.

**Tools**

- `tools/pilot-theme.mjs`:
  - `pilotProject` :68-94 (instance ids `pilot-NN-x9q`);
  - `compilePilots` :100-108 calls the compile at :105;
  - `themeFailures` :140-166 runs a regex or `.includes` over every value with no type guard.
- `tools/check-snapshots.mjs`:
  - `check`, `mustThrow` and `mustFail` :155-175;
  - the pilot rows :601-797;
  - :687 compares values with `!==`, and :714 runs a regex over every file;
  - `gscanResults` :752-764 writes a directory, which is binary-safe.
  - The warning shape to copy is `tools/check-baseline.mjs:475`.
- `tools/keyboard/journey.spec.mjs`:
  - `HARNESS` :36, `open` :46-56, `rows` :89-93, `openEveryGroup` :128-141, `select` :155-159;
  - the pointer ban :163-172;
  - precedents: DW-198 :6854-6890 and DW-167 :2505-2547.
- `tools/keyboard/mode.spec.mjs:239-243` — a made-up key, ``harness:${entry.id}``.
- `tools/probe/record-theme-assembly.py`:
  - `SECTION` :100, `COMPILE` :117-138 (JSON over stdout), `compiled` :141-152;
  - `CARDS_CSS` :155-158, whose AD-18 lines are :157-158;
  - `scaffold` :161-174, `gated` :177-186, `record` :288-452, `section` :540-607 (its tree description :563-565).
- `tools/probe/record-contexts.py` — `gate()` :189-204 writes in text mode (:195), and `zip_bytes` :207-212.
- `tools/probe/run-verify-editor.cjs:2517-2592` and `run-verify-pilots.cjs:349-373` — the deployed walks the two journeys bring into CI.
- `tools/doc-audit.py` — the recorder's row :420-457 and its siblings :1187-1219.

## Tasks & Acceptance

**Execution:**

- [ ] `packages/library/src/validate.ts`, `validate.test.ts`:
  - `COMMENT_OR_STRING` gains an unquoted `url(…)` alternation before the comment branch, so `stripCssComments`, `untokened` and the strip read one scan;
  - export `attributeSelectors`;
  - rows: `url(http://x/*/y)` is kept, while a comment after it, and a quoted URL, are read as before.

  -- DW-337, in the one scanner.
- [ ] `packages/library/src/vocabulary.ts`, `apps/web/editor.test.ts`:
  - `templateKeyOfFile(file, pageTwo = false)` gives the key of the place a section fills in a compiled file (Design Notes § Dark overrides);
  - the app test holds it to `fileOfKey`, `templateKeyOf` and `PAGE_TWO` over every canvas, every page-2 key and `site`.

  -- one key↔file rule for a package, held to the app's map.
- [ ] `packages/section-runtime/src/dark-override.ts`, `dark-override.test.ts`, `index.ts`:
  - export `sectionKey(templateKey, instanceId)` and `hookOf(key)`, and `darkHook` hashes through `hookOf`;
  - fix the stale `home-2:` key at :82.

  -- DW-331's one builder.
- [ ] `packages/section-runtime/src/tokens.ts`, `tokens.test.ts`, `index.ts`:
  - `packTokensCss(pack, { ghostFonts })` writes AD-18's two `var()` forms;
  - with no option the bytes are unchanged;
  - export `BASE_CSS`.

  -- AD-18 and the base, each written once.
- [ ] `packages/theme-compiler/src/strip.ts`, `strip.test.ts`:
  - `stripCss(css, root, roots)` per Design Notes § The strip;
  - rows: the matrix's strip rows, the parser traps (selectors over several lines, a `,` inside `:is()` or inside a string, a stray `}`), and a sheet it cannot judge comes back unchanged.

  -- FR-G7's strip, sound by construction.
- [ ] `packages/theme-compiler/src/compile.ts`, `index.ts`:
  - the inputs and the `{ files, css }` return;
  - the fonts, the preloads and the faces' `<style>`;
  - the licences;
  - the token block, the base, the strip and the record;
  - hooks passed to `renderTheme`, with no hook on a Light-only project;
  - the named collision refusal;
  - Tabler's licence, through a lookup that records each icon it draws;
  - the substitution pass skips bytes.

  -- FR-J3's emission, in the one place every theme is built.
- [ ] `packages/theme-compiler/src/compile.test.ts`:
  - the I/O matrix, row by row;
  - the whole-output scans skip bytes, and the licences pass rule 1;
  - determinism compares bytes by content;
  - `screen.css` equals the record's concatenation.

  -- what the compiler promises.
- [ ] `apps/web/lib/page-two.ts`, `editor.tsx`, `components/controls/layers.tsx`, `page-two.test.ts` (or `editor.test.ts`):
  - `queryKey` and both `keyOf`s call `sectionKey`;
  - each stack row carries the key the theme hashes it under: its `doc`, except on a Tag or Author page 2 that follows page 1, where it is page 1's;
  - the two hash sites hash that key, only when `darkEnabled`;
  - a test checks every canvas × page × (designed or following) against the compile's key.

  -- DW-331: the canvas and the theme hash one key.
- [ ] `apps/web/lib/pilots.ts` — the `2-document` style opens with `BASE_CSS`; the scrollbar rules stay the canvas's own.

  -- one base, two readers.
- [ ] `/pilots` in the harness:
  - `apps/web/app/(app)/app/harness/pilots/page.tsx`: `notFound()` unless `HARNESS`, then `Review` with `page.tsx`'s props and `canvasSrc={harnessCanvasSrc()}`;
  - `review.tsx` takes an optional `canvasSrc`;
  - `busy.test.ts` and `app-routes.test.ts` list the page as harness-only.

  -- the gate can open `/pilots` with no database.
- [ ] `tools/keyboard/journey.spec.mjs`, `mode.spec.mjs`:
  - two journey steps per Design Notes § The journeys, keyboard only;
  - `mode.spec.mjs` builds its key with `sectionKey`;
  - `apps/web/dark-mode.test.ts:127-144` is deleted, because the journeys hold what it held, in a browser.

  -- DW-331's browser proof, in CI.
- [ ] `tools/pilot-theme.mjs`:
  - pass `pairing` (Paper's), `fonts` (read from `packages/library/fonts/`) and `darkEnabled: true`;
  - A4 #13 gains a dark Background override; it is not the hoisted A22 pair;
  - `themeFailures` skips bytes;
  - add `cssFailures` per Design Notes § The record, and what CI measures.

  -- one project for CI and the recorder.
- [ ] `tools/check-snapshots.mjs` — rows, each behind its control:
  - the fonts and licences;
  - `GS051` gone from gscan 6.4.2;
  - the hook on A4 #13 and none elsewhere;
  - `cssFailures`' four rows;
  - :687 compares by content and :714 skips bytes.

  -- the shapes in CI on every commit.
- [ ] `tools/probe/record-theme-assembly.py`, `record-contexts.py`, `tools/doc-audit.py`:
  - binary values cross the JSON hop as base64 and are written `'wb'`;
  - `CARDS_CSS` loses AD-18's two lines;
  - Design Notes § The T1 run;
  - `SECTION` becomes `73`;
  - the docstring, `section()`'s tree text and the catalogue rows say so.

  -- R-82: a real Ghost serves what the compiler writes.
- [ ] Documents: apply Design Notes § Propagated at Dev, then grep the repo for each old wording.

  -- standing rules 3 and 7.

**Acceptance Criteria:**

- **Fonts, self-hosted.** Given any compile, when the tree is read:
  - `assets/fonts/` holds only `.woff2` files of the pairing's faces, `latin` and `latin-ext`;
  - CI reads each file's sha256 equal to `pool.json`'s;
  - `default.hbs`'s head preloads each distinct roman face's `latin` file once, with `as="font" type="font/woff2" crossorigin`;
  - every preload `href` is the `src` of one of its `@font-face` rules, the same `{{asset}}` expression;
  - no emitted file names `fonts.googleapis.com` or `fonts.gstatic.com`.
- **Ghost's font variables.** Given the pilot theme with the scaffold's AD-18 lines removed, when both gscans run, then neither raises `GS051`, and the canvas's token block is byte-identical to before.
- **The strip is sound, and measured.** Given the pilot theme, when CI runs `cssFailures`:
  - no rule that a placed root reaches is missing from the emitted sheet; a miss is a failure;
  - emitted bytes no placed root reaches are printed as a warning, and the check passes;
  - no emitted rule sits under a design that is not placed (AD-37, register 49).
- **The CSS budget.** Given the pilot theme's record, when CI measures it, then each template's subset is at most 50 KB at gzip level 9, and the whole `screen.css` is reported beside it, not gated.
- **Dark overrides reach visitors.**
  - Given a Light + Dark project with an override in force, when compiled, then its root carries the hook and the token block carries its rules under `MODE_SELECTORS`' two conditions.
  - Given a Light-only project, when compiled, then neither appears.
- **One key (DW-331).**
  - Given any section on any canvas and page, when the editor stamps its hook, then it is the hook the compile writes for that section.
  - Given two colliding keys, when compiled, then the refusal names both sections and the remedy.
- **The browser proof (DW-331).** Given `pnpm keyboard`, when the two journeys run:
  - the editor's canvas root gains `data-instance`, equal to `hookOf` of its row's key, when a Background is set in Dark, and loses it on "Reset Background role";
  - `/pilots` in the harness draws a Background set in Dark as that ground in Dark, and as the light one in Light;
  - each step's control fails first.
- **Licences.**
  - Given a project whose placed sections draw an icon, when it compiles, then the theme carries `LICENSE-tabler.txt` equal to `TABLER_LICENSE`.
  - Given any project, when it compiles, then each shipped family's licence is at the root with its words unchanged.
- **Ghost serves it.** Given T1 and the owner's in-session go, when the recorder runs:
  - every row in Design Notes § The T1 run holds behind its control;
  - T1 is restored and read back;
  - MEASUREMENTS §73 records the run.
- **No screen.** Given Question 1's ruling (option 1, owner, 2026-10-08), when Dev ends, then this story is Done on its Deploy commit (R-80), and its frame (`S8 Deploy.dc.html` S8b) and its hand test are in Story 7.29's card word for word.
- **Propagation.** Given the rulings, when Dev ends:
  - the moved sentences sit word for word in Stories 7.29 and 7.12, and Epic 7's preamble lists them (R-195);
  - FR-J3, AD-14, AD-18, AD-30, VERIFY-AT-BUILD item 3 and DW-108, DW-331 and DW-337 say what landed;
  - a grep finds no old wording.

## Spec Change Log

- **2026-10-08, Create (the owner ruled).** Both questions were ruled option 1.
  - The Ruled values table now states the ruled values.
  - Question 1 moves four things word for word to Story 7.29: the pictures, the theme-size check, its frame (S8b) and its hand test. This story stays `owner_test: none` and is Done on its Deploy commit.
  - Question 2 moves the whole-face sentence word for word to Story 7.12.
  - The frozen intent is unchanged: each ruling is its recommended option.

## Design Notes

### What the theme carries

`default.hbs`'s head, for Paper (D1):

```hbs
    <title>{{meta_title}}</title>
    <link rel="preload" href="{{asset "fonts/fraunces-roman-latin.woff2"}}" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="{{asset "fonts/inter-roman-latin.woff2"}}" as="font" type="font/woff2" crossorigin>
    <style>
      @font-face {
        font-family: 'Fraunces';
        …
        font-display: swap;
        src: url({{asset "fonts/fraunces-roman-latin.woff2"}}) format('woff2');
        unicode-range: …;
      }
      …
    </style>
    <link rel="stylesheet" href="{{asset "css/screen.css"}}">
```

The `@font-face` rules are `fontFaceCss(pairing, (f) => `{{asset "fonts/${f.file}"}}`)`, indented. A pool file name is `[a-z0-9-]+\.woff2`; the compile asserts it, so nothing else reaches an expression (AD-36).

`screen.css`:

```css
/* Tokens */
:root {
  …
  --font-heading: var(--gh-font-heading, 'Fraunces', serif);
  --font-body: var(--gh-font-body, 'Inter', sans-serif);
  …
}
…the dark map, the bands, the link rule (packTokensCss)…
/* Story 6.5 · each section's dark override … */   ← darkOverrideCss, only when one is in force

/* Base */
html, body { margin: 0; background: var(--bg-page); }

/* Heroes · Latest Post */
…the design's sheet, stripped…
```

The licences sit at the theme root: `LICENSE-<family slug>.txt` from `licences/<slug>.txt`, and `LICENSE-tabler.txt`. Ghost serves a root `.txt` file (§ Facts 3), so the T1 run can read them.

### The strip

- **Input.** A design's sheet after `tidyCss` (its comments are already gone, because they write `[data-bg]` in prose). Then its root class (`rootClassOf`), and one attribute map per visible placed instance: `resolveControls(entry, instance.controls)`, keyed by control name, which is exactly what `stampControls` writes on the root.
- **Rules.** Each style rule's selector list is split on top-level commas, outside `()`, `[]` and strings.
- **When a selector is dead.** All three must hold:
  - its leading compound, the text before its first top-level combinator, begins with `.<root>` followed by a non-name character or the end;
  - that compound carries, outside any parentheses, an attribute selector naming one of the design's controls: `[data-n="v"]` (with any flag) or `[data-n]`;
  - no placed root satisfies all such attributes at once. Presence needs the attribute, and `=` needs the value (case-folded under `i`).
- **Everything else is kept**, including:
  - an attribute inside `:not()`, `:is()`, `:where()` or `:has()` (`:not` inverts the test);
  - the operators `~=`, `|=`, `^=`, `$=` and `*=`;
  - a name that is no control;
  - a compound that starts elsewhere, such as `.a17-1__grid`.
- **What leaves.**
  - A rule with no live selector goes.
  - A live rule keeps its live selectors, in their order, joined with `, `, and its body is untouched.
  - An `@media` block left with no rule goes.
  - Every other at-rule is kept whole.
- **Today's sheets meet only `=`, presence, and lists inside `@media`** (§ Facts 9). The validator would accept the other shapes, so the strip keeps them rather than trusting the convention.
- **Promoted controls.** Story 7.10's promoted control writes `data-{control}="{{@custom.key}}"`, a value decided at runtime, so 7.10 keeps every value of that control (its card gains the line).

### The record, and what CI measures

`compileTheme` returns `{ files, css }`. The record has three parts:

- `css.global` is the Tokens and Base sections, exactly as `screen.css` opens.
- `css.sheets[designId]` is that design's emitted chunk, header comment included.
- `css.reach[file]` is defined for every emitted root-level template except `default.hbs`. It is the sorted design ids of the visible placed sections of `default.hbs` and of the file (both pages), plus, for `post.hbs`, `page.hbs` and every `custom-*.hbs`, those of `partials/content-cta.hbs`. Ghost renders the paywall inside `{{content}}`.

`cssFailures(compiled, find)` in `tools/pilot-theme.mjs` is the check CI runs, and Story 7.33 runs it over the whole library. Its independent oracle works like this:

- Each placed design's original and emitted sheets are parsed through jsdom's CSSOM into entries of the form *(the `@media` condition, one selector, the declarations' `cssText`)*, with selector lists split by its own top-level splitter.
- An entry is **reachable** unless its leading compound begins with the design's root class and `Element.matches` finds no placed root. The roots are the first elements of that design's compiled partials, parsed by jsdom, so they are what the theme ships.

Its four rows, each with a control:

1. **Soundness.** A reachable original entry missing from the emitted chunk is a failure. Control: an emitted chunk with one reachable entry removed.
2. **The gap.** The emitted entries that are not reachable are printed as `WARNING FR-G7: …` with their bytes, and the check passes (`check-baseline.mjs:475`'s shape). Control: a chunk with one dead entry added prints a non-zero gap.
3. **AD-37.** Every emitted selector whose leading compound begins with a library design's root class begins with its own placed design's. Control: a `screen.css` carrying an unplaced design's chunk.
4. **The budget.** For each `reach` template, `gzip -9` of `css.global` plus its designs' chunks is at most 51,200 bytes. The whole file's gzip is printed beside it. Control: a record whose template reaches an incompressible chunk past the limit.

### Dark overrides in the theme

A section's key names the place it fills in the theme, which is what `darkHook`'s comment promises ("Epic 7 hashes the same key for the file it compiles the section into"). An instance id is unique only inside its doc: Home's page-2 copy shares Home's ids, so the key is qualified by the place. `templateKeyOfFile(file, pageTwo)` gives that key:

| The section fills | Key |
|---|---|
| `default.hbs` | `site` |
| `partials/content-cta.hbs` | `paywall` |
| `custom-{name}.hbs` | `custom:custom-{name}.hbs` |
| `index.hbs`, whether Home's page 2 has its own design or is the copy | `index` |
| a Tag or Author page 2 with its own design, inside `{{#is "paged"}}` | `tag-paged`, `author-paged` (`templateKeyOfFile('tag.hbs', true)`) |
| any other page-1 position (`home.hbs`, `post.hbs`, `tag.hbs` …) | the file's name without `.hbs` |

A synthesized section has no stored doc and no override, so it never has a hook.

- **Where the keys meet.**
  - The compile hashes `sectionKey(<key>, instanceId)` for every placed section with an override in force, and only when `darkEnabled`.
  - It hands `renderTheme` the hook, and hands `darkOverrideCss` every such section with the library's own entry, so its unstripped sheet.
  - Home's copy in `index.hbs` takes `index:…`, as the editor's page-2 view already hashes it. It is a different hook from Home's own, so that section no longer hoists beside Home's once an override is in force; `dark-override.test.ts:82` holds the two apart.
  - An archive's page 2 that follows page 1 has no markup of its own: `tag.hbs` serves page 1's on every page. The editor's page-2 view of it today hashes `tag-paged:…`, so `stackOf`'s fix gives those rows page 1's key.
- **The refusal.** The compile checks hooks before calling `darkOverrideCss`, so the customer reads names, never keys:

  `Two sections share a hidden name, so neither one's dark look can ship: "{layer}" in {file} and "{layer}" in {file}. Delete one of them and add it again — it gets a new name.`

  An empty layer name falls back to the design's name, as the boundary comment does. Story 7.18 shows compile refusals in Pre-flight.
- **Light-only.** No hook is computed and nothing is handed to `darkOverrideCss`. `packTokensCss` still writes the pack's dark map, as Story 6.5 built it. Which mode a Light-only site's visitors see is `color_scheme`'s compiled default, Story 7.11's, and its card gains the question.

### The journeys

Both are keyboard only (the pointer ban, `journey.spec.mjs:163-172`). The DW-198 and DW-167 steps are the precedents.

1. **`7.4 · DW-331 · the hook on the canvas`.**
   - Open the harness editor, select a section that offers a Background, and press `.` for Dark.
   - Control: the section's canvas root has no `data-instance`.
   - Focus the Background role's checked radio and press ArrowRight. The root now carries `data-instance`, and it equals `hookOf` of the row's `data-layer-row` key, computed in Node through the runtime.
   - Focus "Reset Background role" and press Enter. The root has no `data-instance`.
2. **`7.4 · DW-331 · /pilots draws a Background set in Dark`.**
   - Open `/app/harness/pilots`. At Inline Row (a22/1), choose Dark, then set the Background role to Contrast.
   - The root's `data-bg` is `contrast`, and its computed background is `--bg-contrast`'s.
   - In Light it is `base` and `--bg-page`'s; in Dark again it is `contrast` (`run-verify-pilots.cjs:349-373`'s stop).
   - Control: before the change, Dark draws the base ground.

### Ruled values: Questions 1 and 2

Both were ruled option 1 by the owner on 2026-10-08.

| Question | Ruled: what this spec builds |
|---|---|
| Q1 · pictures and the theme-size check | moved word for word to Story 7.29, with the size warning's hand test and its frame. No `assets/images/` and no budget here, and this story is `owner_test: none`, Done on its Deploy commit |
| Q2 · whole faces for a non-Latin language | moved word for word to Story 7.12. Every project ships `latin` and `latin-ext` |

### Settled here as readings, each told to the owner in one line

1. **The faces live in `default.hbs`'s head, not `screen.css`.** A preload helps only when its address is the address the font is fetched from, and Ghost adds `?v=` to every `{{asset}}` address, which a `url()` in a static stylesheet cannot carry (§ Facts 1–2). The PRD's own tree already lists "fonts" in `default.hbs`'s shell.
2. **"Preloaded" means the two roman faces' `latin` files** (§D.a rule 6). NFR-2's "every shipped font is … preloaded" is read through that rule, because preloading italics and `latin-ext` fetches files most pages never use.
3. **Font file names stay the pool's.** Ghost's `?v=` changes when the file does (per file on 6, per theme on 5), so a content hash in the name would add nothing.
4. **Each shipped family's licence travels with it**, because the OFL asks for its text in every copy. Only whitespace is tidied.
5. **A hook collision is refused by name**, not remedied in secret. A changed hook would make the canvas and the theme disagree, and a collision among a project's overridden sections is vanishingly rare at 32 bits.
6. **The CSS budget is a CI check, never a deploy failure.** A customer has no lever to pull against it (NFR-2: "in CI").
7. **The base is the canvas's own** `html, body { margin: 0; background: var(--bg-page); }`. "Shared primitives" (FR-J3) do not exist in the library, and none is invented.
8. **A Tag or Author page 2 that follows page 1 hashes page 1's key on the canvas.** The theme serves one markup for both pages. Home's copy keeps `index:…`, because it has a file of its own.

### Facts this spec rests on (standing rule 1)

These were read in the npm tarballs ghost-6.58.0 and ghost-5.130.6, and in gscan 6.4.2 and 4.49.7 (`tools/stress/node_modules`). Paths are under `core/`.

1. **Ghost caches theme files for a year.**
   - `caching.theme.maxAge` is 31536000 on both majors (`shared/config/defaults.json`).
   - `frontend/web/middleware/static-theme.js:95` serves the theme directory with it.
2. **`{{asset}}` appends `?v=`.**
   - On 5.130.6 it is one hash per theme, reset when a theme mounts (`frontend/meta/asset-url.js:46-60`, `services/theme-engine/active.js:110`).
   - On 6.58.0 it is per file (`asset-url.js:188`, `assetHash.getHashForFile`).
   - A `url()` inside `screen.css` resolves without it.
   - A bare `/assets/…` address in a template is no way round it: gscan's `GS030-ASSET-REQ` warns on any `src` or `href` naming `/assets/` that is not written through `{{asset}}` (`specs/v1.js:492-497`, which v5 and v6 extend).
3. **Which files Ghost serves.** `static-theme.js` serves every root-level theme file except `.hbs`, `.md`, `.json`, `.lock` and `.log`, and every file under `/assets/` except `.hbs`. A root `LICENSE-*.txt` is therefore served.
4. **GS051** (both gscans' `lib/specs/v5.js`, :751-755 on 6.4.2) is a warning that passes only when one `.css` or `.hbs` file holds both `--gh-font-heading` and `--gh-font-body`.
5. **Theme upload limits, for Story 7.29.**
   - 6.58.0's `theme.uploadLimits` defaults (`defaults.json:267`) are host-configurable:
     - 1 GiB compressed: multer's `fileSize` → `COMPRESSED_TOO_LARGE` (`server/web/api/middleware/upload.js:69-123`);
     - 512 MiB per entry and 4 GiB in total: gscan's `checkZip` limits → `@tryghost/zip`'s `ENTRY_TOO_LARGE` and `TOTAL_TOO_LARGE` (`server/services/themes/validate.js:62-65`). The same extract refuses a name of 254 bytes or more, and a symlink.
     - Each error carries `errorDetails.limitBytes`.
   - 5.130.6 has no `uploadLimits` key, and gscan 4.49.7 extracts with no limit.
   - Ghost-CLI's nginx takes 1g on the SSL vhost (MEASUREMENTS §15h).
6. **Ghost(Pro)'s "5 MB" is for media, not themes.** `ghost.org/help/media-file-size-limits` (read 2026-10-08) lists media limits per plan: Starter 5 MB, Publisher 100 MB, Business 250 MB, Custom 1 GB. It names no theme limit. FR-J3's "Ghost(Pro) Starter is separately documented at 5 MB" is therefore that media limit.
7. **The pool's files keep every name record** (`tools/fonts/build-pool.py:301`, `name_IDs = ['*']`). The licence's own pointer is inside each file, and the text file is what a person opening the zip reads.
8. **The root's attributes.**
   - `stampControls` (`core.ts:1369-1395`) writes every declared control and universal from `resolveControls`:
     - defaults are written;
     - a `disabledBy` control is written at its forced value;
     - a universal narrowed to nothing is absent.
   - Nothing at runtime writes a `data-*`: `modules/core.js` toggles only `js-enabled`.
9. **The library's sheets, read at planning (the five pilots and every fixture):**
   - flat (stylelint `max-nesting-depth: 0`), with `@media` the only at-rule;
   - every `[data-…]` sits on the root compound, either `=` or presence;
   - none sits inside `:not()`, `:is()`, `:where()` or `:has()`;
   - no `url(`.
10. **The dark value's root rule.** A placed root carries the light `data-bg`, so a dark value's root rule is dead in the sheet. Its declarations reach visitors through `darkOverrideCss`, which reads `entry.css` (`dark-override.ts:85`).

### The T1 run: `tools/probe/record-theme-assembly.py`, §73

It is Story 7.3's run (§72's rows re-run), on the extended pilots: A4 #13 carries a dark Background override, and the compile is handed Paper's pairing, the pool and `darkEnabled: true`.

1. **The local gate.** The scaffold is `assets/css/cards.css`, now D12's widths alone, plus the stand-in `page.hbs`. Both gscans give 0 errors and 0 warnings. That is the proof that `screen.css` answers `GS051`.
2. **The fonts.**
   - `/`'s head carries two preloads, each `as="font" type="font/woff2" crossorigin`, and each `href` is, verbatim, the `src` of an `@font-face` rule in the page's own `<style>`.
   - Each font address answers 200 with a `font/woff2` content type, and its sha256 is `pool.json`'s.
   - Control: `/assets/fonts/{nonce}.woff2` answers 404.
3. **The licences.**
   - `/LICENSE-fraunces.txt` and `/LICENSE-inter.txt` answer 200, each carrying its family's licence as compiled.
   - Control: `/LICENSE-{nonce}.txt` answers 404.
4. **The stylesheet.**
   - The served `screen.css` equals the compiled one byte for byte.
   - It carries both `var(--gh-font-…, …)` forms, the base rule, and the `[data-instance="<hook>"]` rules.
5. **The hook.**
   - A4 #13's root on `/` carries `data-instance="<hook>"`, where `<hook>` is the one computed locally through `hookOf(sectionKey('home', …))`.
   - Control: A17 #1's root on `/` carries none.
6. **What it writes to T1:** §72's three theme uploads, their activations and deletes. Nothing else: no content, setting or key. The month's probe picture is reused.
7. **The Ghost 5 half** joins DW-326 (R-238).

### Propagated at Dev

- **`prd.md`:**
  - FR-J3:
    - Ghost(Pro)'s 5 MB is the media limit (§ Facts 6);
    - Ghost 6.58.0's limits are read in source (§ Facts 5);
    - the faces sit in `default.hbs`'s head through `{{asset}}`;
    - each moved sentence names its new story.
  - §D.a rule 6: the same placement.
  - NFR-2 (2): "preloaded" is the two roman faces' `latin` files.
- **`ARCHITECTURE-SPINE.md`:**
  - AD-14: the reachability record is `compileTheme`'s `css`, and CI's budget reads it;
  - AD-18: the two forms are `packTokensCss(pack, { ghostFonts: true })`, in the theme only;
  - AD-30: the hook's key is `sectionKey`, and there is none on a Light-only project.
- **`epics.md`:**
  - Story 7.4's card: Questions 1 and 2 as ruled; Owner test none; the frame moved.
  - Story 7.29: the moved text word for word:
    - the pictures sentence;
    - the budget sentence;
    - DW-108's budget half ("the inline icons' bytes count in the theme-size budget");
    - the frame `S8 Deploy.dc.html` S8b;
    - "Owner test: yes (the over-budget message)";
    - "upload limits probed on T1" (R-238);
    - § Facts 5–6.
  - Story 7.12: §D.b's full-face sentence and its coverage line, word for word.
  - Epic 7's preamble lists both moves (R-195).
  - Story 7.10: the strip keeps every value of a promoted control.
  - Story 7.11: a Light-only project's token block keeps the dark map, and its Create asks the owner (R-83) for `color_scheme`'s compiled default.
  - Story 7.33: runs `cssFailures` over every design.
- **`VERIFY-AT-BUILD.md` item 3:** § Facts 5–6, with Ghost(Pro) still unmeasured.
- **`MEASUREMENTS.md`:** §73.
- **`epic-7-context.md`:** a sub-bullet for each of the above.
- **`deferred-work.md`:**
  - DW-331 and DW-337 are closed;
  - DW-108's licence half is closed, and its budget half is now owned by Story 7.29;
  - a new entry: no Epic 8 story's criteria make the rendition set AD-12 says the upload makes (`assets.renditions`). It is owned by Story 8.1, whose card gains the line.
- **Last:** grep for:
  - "separately documented at 5 MB";
  - the recorder's "Story 7.4's (AD-18)" scaffold label;
  - ``harness:${entry.id}``;
  - `home-2:`;
  - `dark-mode.test.ts`'s deleted guards' names.

### The commits

There is no migration, so there is no Schema phase. `Story 7.4 - Dev - …` carries:
- the code, tests, tools and documents;
- §73, if the T1 run happens in the Dev session on the owner's go.

## Owner's manual test

None. Question 1 was ruled option 1 (owner, 2026-10-08), so this story has no screen:
- the over-budget message, its frame (`S8 Deploy.dc.html` S8b) and its hand test move to Story 7.29, word for word;
- nothing deploys a theme before Story 7.18.

It is Done on its Deploy commit (R-80). The two keyboard-gate journeys are the browser proof of what the editor and `/pilots` draw.

## Questions for the owner

Both were ruled option 1 (owner, 2026-10-08). Dev builds Design Notes § Ruled values as it stands.

### Question 1 — Your pictures and the theme-size check, until pictures exist

**In plain English.**
- Besides fonts and code, this story was meant to do two more things:
  - copy the pictures your sections use into the theme, each in four sizes, so a phone downloads the small one;
  - check the theme's size before a deploy, and name the pictures that make it too big for your Ghost.
- Neither has anything to work on yet:
  - your own pictures, and their four sizes, arrive with the picture library in Epic 8, after this epic;
  - the deploy screen the size check speaks on (Pre-flight) arrives in Story 7.18;
  - without pictures, a theme today is only fonts and code.
- Story 7.29 already puts your pictures into the theme file at deploy, and it comes after Pre-flight exists.
- We also found a mistake in the plan. Its "Ghost(Pro) Starter: 5 MB" is Ghost(Pro)'s limit for a picture you upload, not for a theme. Ghost's own theme limits, read in its code, are 1 GB per upload, 512 MB per file and 4 GB unpacked on a self-hosted Ghost 6. A host can change them, and Ghost(Pro) does not publish its own.

**Example.** You put your own photograph in a hero. The theme should carry it in four sizes, and a theme packed with such photographs should be stopped before it is sent to a Ghost that will refuse it. Today you cannot put your own photograph in a section at all.

1. **Move both, word for word, to Story 7.29, with the size warning's hand test.** 7.29's planning decides how to prove them before Epic 8's pictures exist. This story then has no screen, and it is done when it deploys green. **(RECOMMENDED)**
2. **Build both now, against test pictures and a test limit.** The size warning still waits for Story 7.18's screen, so its hand test moves there.
3. **Move the pictures only, and build the size check now** over the fonts and code a theme carries today. Its hand test moves to Story 7.18.

**Ruled: option 1 (owner, 2026-10-08).**

### Question 2 — Fonts for a language not written in Latin letters

**In plain English.**
- Your pack's fonts will ship inside the theme the way every font in our library already comes: one file for basic Latin letters, and one for accented letters (Polish, Turkish, Czech…) that a browser downloads only on a page that needs it.
- The plan also says that a site written in, say, Russian or Greek ships the whole font instead, so those letters are drawn in your pairing too.
- Those whole-font files are not in our library yet. And a project's language cannot be changed until Story 7.12, the Translations screen, where you choose it. Every project today is English.
- Until then, a letter outside Latin is drawn in the visitor's own system font: readable, but not your pairing.

**Example.** A project set to Russian with the Paper pack: its Cyrillic headings would show in the visitor's system font instead of Fraunces.

1. **Move it, word for word, to Story 7.12**, where the language is chosen and its screen can say what the choice means for the fonts. **(RECOMMENDED)**
2. **Build it now.** Add every library font again as a whole file, which makes the library's font files several times bigger, and use them for a non-Latin language, even though no project can choose one yet.
3. **Drop it.** Letters outside Latin always use the visitor's system font.

**Ruled: option 1 (owner, 2026-10-08).**

## Verification

**Commands:**

- `pnpm check` — expected: green. That covers:
  - lint and typecheck;
  - every package's tests, including the new `strip.test.ts` rows and the `(7.4)` rows in `compile.test.ts`;
  - `node tools/check-snapshots.mjs`, whose new rows each fail on their control first, and whose `cssFailures` prints its gap as a warning.
- `pnpm keyboard`, run whole — expected: green, including both `7.4 · DW-331` journeys.
- The recorder's local half (`compiled()` → `scaffold()` → `gated()`; run `cd tools/stress && npm install` once first) — expected: 0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6), with the scaffold down to D12's widths and the stand-in `page.hbs`.
- `python3 tools/probe/record-theme-assembly.py`, on the owner's in-session go, in the main session — expected:
  - every §73 row holds behind its control on T1 `ghost6.inflozo.com` (6.58.0);
  - T1 is restored and read back.
- `python3 tools/doc-audit.py --check`, run twice — expected: PASS.

**Manual checks:**

- The compiled pilot theme reads as hand-written:
  - `default.hbs`'s head shows two preloads and one `<style>` of faces;
  - `screen.css` opens with the token block, carrying the two `--gh-font-…` forms and A4 #13's override, then the base;
  - each design's sheet is visibly shorter where its unused values were.

**Real infrastructure (R-82):**

- T1, through the recorder.
- Both gscans locally, and gscan 6.4.2 in CI.
- Vercel, for the editor's key change and the harness page: CI `check`, `rls` and `deploy` green, and the deployment READY at the head.
- There is no migration and no Supabase, Resend or Dodo surface. The compiler has no product caller until Story 7.18.
