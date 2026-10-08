---
title: 'Story 7.5 — JS bundling: two files, two origins'
type: 'feature'
created: '2026-10-08'
status: 'in-review'
owner_test: none
review_loop_iteration: 1
baseline_commit: '23d5c0c58fc2cc9e0dc5b75673170392168128d1'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, the theme Inflozo builds for your site carries one small script file holding only the behaviours your placed sections use, loaded without holding the page up — and, once you style Ghost's audio, video, gallery or toggle cards yourself (Story 7.13), a second file that is Ghost's own script for those cards, copied unchanged with Ghost's licence beside it and named in the theme's README. Until a behaviour's script is written by its own category story, its section ships in its no-script state: today that means a visitor on a phone sees your header's menu links as a plain list under the logo (Story 9.1 writes the menu button), while the editor's Preview already draws the button. There is no screen here for you to test by hand, so this story is done when it deploys green; the automated checks and our test Ghost site prove the rest.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:**
- A compiled theme ships no JavaScript: no `assets/js/main.js` and no script tag, so not even `core` reaches a visitor (FR-J4, FR-G7(4)). A designed audio, video, gallery or toggle card loses Ghost's script together with its stylesheet, so its player would never play (FR-Q7).
- `bundle()`'s `main.js` cannot ship as it stands (FR-J1). Its first line names the builder, and `core.js`'s comments carry internal references (`DW-136`, `R-21`, `R-175`) and a `ponytail:` marker. CI's fingerprint scan refuses all of them.
- Three checks are owed to this story:
  - a `<script>` written into a template is invisible to the `assets/js/` check (DW-134);
  - `cards.js` is compared to nothing (DW-135);
  - nothing holds a module to "no visitor-facing literal" (DW-146).
- NFR-2's JS budget has never measured a compiled theme or `cards.js`.

**Approach:**
- `compileTheme` is handed the module files and Ghost's vendored card scripts. It writes:
  - `main.js`: `bundle()` of every written module its placed designs declare;
  - `cards.js` and `LICENSE-ghost.txt`, when a designed card has a script;
  - `README.md`'s Scripts section;
  - both `defer` tags in `default.hbs`'s head.
- A declared module with no file yet ships at rest, in its no-JS state.
- The header and `core.js`'s comments are made shippable, and a check holds every module file to the theme's own scan.
- `checkThemeJs` compares `cards.js` to the chunks that `package.json`'s exclusions call for. `checkThemeScripts` holds every template's `<script>`s.
- A lint rule and a registry check hold DW-146.
- `check-baseline` measures NFR-2's maximal design and the compiled theme.

## Boundaries & Constraints

**Always:**

- **Pure and deterministic (AD-1, AD-14).** The module files and Ghost's card scripts reach the compile as values the shell read. The same input gives the same files, byte for byte, whatever its key order.
- **One implementation of each rule.** Each is written once, and every caller calls it:
  - `moduleUnion` decides which modules;
  - `bundle` writes `main.js`'s bytes, and `cardsJs` writes `cards.js`'s;
  - `MAIN_JS_TAG` and `CARDS_JS_TAG` are the two tags;
  - `checkThemeJs` and `checkThemeScripts` are run by the compile on its own output, by CI and by the stress fixture;
  - `tidyLicence` tidies a licence;
  - `textFailures` is the theme's text scan, factored out of `themeFailures`.
- **`main.js` is repo-authored code and nothing else (FR-G7(1)).** It carries `core` plus each module with a file in `packages/library/modules/` that a placed, visible design declares, as a union in registry order.
  - A design that is deleted, or hidden everywhere, takes its names with it, unless another placed design declares them.
  - `main.js` ships on every theme, because `core` is the platform (FR-G7(4)).
- **A declared module with no file yet ships at rest.** It is left out of `main.js`, and its mount keeps `data-module`, so it stays in its no-JS state (Design Notes § Modules with no file yet).
  - It is never a stub, and never a throw.
  - CI prints each one as a warning.
- **`cards.js` is Ghost's own bytes.**
  - It holds each scripted chunk's body exactly as Ghost wrote it. `record-cards.py`'s two-line head is replaced by one header that names Ghost, the version, the cards and the licence file.
  - It is never re-indented, minified or edited.
  - It ships only for designed cards that have a chunk, with `LICENSE-ghost.txt` beside it.
- **No builder fingerprint (FR-J1).** `main.js`'s header, `core.js`'s comments, `cards.js`'s header and `README.md` name no builder, carry no internal reference and no generator line.
  - No user text reaches any new file. The only names are registry names and card names, each held to its grammar (AD-36).
- **No script blocks the page (NFR-2 (3)).**
  - Exactly two tags, each with `defer`, in `default.hbs`'s head after the stylesheet link.
  - No other `<script>` in any template, unless its bytes equal a named repo source handed to the check. That is DW-134's door; it is empty today, and DW-328 decides at Story 9.1 whether one ever opens.
- **The size check warns and never fails.** Nothing in the app reads it.
- **Counts are derived.**
- **No screen.** So there is no frame (R-74 binds a surface, and this story draws none) and no hand test. The story is Done on its Deploy commit (R-80).

**Ask First:**

- **The T1 run.** It uploads theme files to T1, so it needs the owner's in-session go, in the Dev or the Review session. It runs in the main session, never through a subagent.
- **A T1 row that does not hold, and anything gscan names beyond §73's scaffold.** Each is a stop, never a widened rule.
- **A change to a module's code.** Only `core.js`'s comments change here.

**Never:**

- **Anything a later story owns:**
  - `cards.css`, handing `designedCards` from the database, and the cards' first T1 run: Story 7.13;
  - the `mode-toggle` module and any inline head script: Story 9.1 (DW-328);
  - writing `nav-drawer` (Story 9.1) or `member-form` (Story 10.75);
  - the rest of `README.md`: install steps, the pack and pairing, and where to re-import go to Story 7.26 (a new entry), the routes step to 7.17, the credit to 7.28;
  - compile CI over the whole library: 7.33;
  - the canvas-against-Ghost comparison: 7.34;
  - `locales/`: 7.12;
  - Pre-flight: 7.18.
- **Code changes ruled out:** editing a design file (AD-35); minifying or re-indenting any script; a stub module; any third-party script.
- **Stripping comments from module sources at bundle time.** A lexical stripper has the scanner's own regex ceiling (`modules.ts:178-183`), so it could cut code.
- **A database change or a new dependency.** There is therefore no Schema phase.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| No module declared | the placed designs declare none | `assets/js/main.js` is `bundle([], modules)`: the header naming `core` alone, `core`, the start call. `default.hbs`'s head carries `MAIN_JS_TAG` once, after the stylesheet link. `README.md` is the Scripts section with `main.js`'s line alone. No `cards.js`, no `LICENSE-ghost.txt`, no cards tag | — |
| A written module | a placed design declares `lightbox`, and `modules` holds `lightbox` | `main.js` is `bundle(['lightbox'], modules)`, its header `… core · lightbox`. The mount keeps `data-module="lightbox"` | — |
| The union | designs declaring overlapping modules on the site doc, Home, Home's page 2, an archive's page 2 and the paywall | each module once, in registry order | — |
| It leaves with its design | the only declaring design deleted, or its every instance hidden | the module is not in `main.js` | — |
| Declared, no file yet | a placed design declares `nav-drawer`, and `modules` holds no `nav-drawer` (the pilots today) | `main.js` carries `core` without it. The mount keeps `data-module` and ships at rest | no throw |
| No `core` | `modules` holds no `core` | — | throws `bundle()`'s `core.js has no source` |
| A module's strings | a placed design declares `countdown` | its mount carries one `data-i18n-*` per key `countdown`'s row declares, as S5 stamps it (Story 4.9). `main.js` carries no `countdown`: it has no file | — |
| Designed cards with scripts | `designedCards: ['toggle', 'callout']` | `cards.js` is `cardsJs(['toggle'], …)`, since callout has no script. `LICENSE-ghost.txt` sits at the root. `CARDS_JS_TAG` follows `MAIN_JS_TAG`. README's cards line names `toggle`. `package.json` excludes both | — |
| Designed cards without scripts | `designedCards: ['callout']` | no `cards.js`, no cards tag, no `LICENSE-ghost.txt`, no cards line | — |
| A chunk not as vendored | a card script whose head is not `record-cards.py`'s, or two chunks from two Ghost versions | — | throws, naming the card |
| A control character | a module source, a card script or Ghost's licence carrying a C0 character (a tab included) | — | throws `noC0`'s sentence |
| Determinism | `modules`, the card scripts and `designedCards` in another order | the same files, byte for byte | — |
| The compile's own output | any compile | `checkThemeJs` and `checkThemeScripts` return no sentence over the final text | — |
| `cards.js` changed | one byte off `cardsJs(…)`, or carrying a card that `package.json` does not exclude | — | `checkThemeJs` names the file (DW-135) |
| A scripted card with no `cards.js` | `package.json` excludes `audio`, and there is no `cards.js` | — | `checkThemeJs`: audio's player would never play |
| A stray `<script>` | any `<script>` in an `.hbs` but the two tags in `default.hbs`. Or `MAIN_JS_TAG` missing, twice, or outside `default.hbs`. Or `CARDS_JS_TAG` without `cards.js`, or `cards.js` without it | — | `checkThemeScripts` names the file and the tag (DW-134) |
| A named inline script | an inline `<script>` whose body equals a source handed to `checkThemeScripts` by name | passes; one byte off is refused | — |
| A `<script>` in a Handlebars comment | a layer name `<script>` inside a boundary comment | ignored: Ghost never prints a comment | — |
| A visitor-facing literal | a module writing a letter-bearing string or template literal to a text sink, or calling `t()` with a key that is no literal | — | `pnpm lint` refuses it (DW-146) |
| An undeclared key | a module calling `ctx.t('weeks')` whose row declares no key that derives `data-i18n-weeks` | — | `moduleKeyRefusals` names the module and the key (DW-146) |
| A module's comments | a module file carrying an internal reference, the builder's name or a `ponytail:` marker | — | CI names the file |

</frozen-after-approval>

## Code Map

**The library: `packages/library/src/`**

- `modules.ts`:
  - `ModuleSources` :51 and `NAME_RE` :56;
  - `moduleUnion` :85, `moduleFunctionName` :94;
  - `HEADER` :96, which names the builder;
  - `bundle` :106-130;
  - `checkThemeJs` :137-174, which skips `cards.js` at :145;
  - the lexical scan :176-310, whose ceiling (:178-183) is why nothing here strips comments.
- `modules.test.ts` — the `core` fixture :12; `checkThemeJs` rows :106-125, where :110 passes a `cards.js` of `'/* Ghost */'`, which DW-135 must now refuse.
- `catalog.ts:72-75` — `i18nAttr`: `countdown.time_remaining` derives `data-i18n-time-remaining`, and `ctx.t(key)` reads `data-i18n-<key>`, so a module's `t()` argument is that suffix.
- `registry.ts` — `js?` :199-202 is recovered from `data-module` at :270.
- `index.ts:8` — `modules.ts` is exported whole.

**The modules: `packages/library/modules/`**

- `core.js` — the lines to rewrite:
  - :1-16, the header comment (`FR-G7(4)`, `src/modules.ts`, `docs/section-authoring.md`, `research §7`);
  - :19 (`DW-136(b)`), :30 (`R-175`), :32-33 (`ponytail:` and `FR-G7(4)`), :46 (`R-21`) and :138 (`FR-G4`).
  - The unknown-name report is in the mount scan, :34-45.
- `core.test.mjs:280-288` — the header regex at :285.
- `registry.json` — the rows and `strings`. `nav-drawer` and `member-form` are rows with no file.

**Ghost's card scripts: `packages/library/orbit-weekly/vendor/`**

- `cards/js/{audio,gallery,toggle,video}.js` and `LICENSE-ghost.txt`, written by `tools/probe/record-cards.py`.
- The head's shape is at `record-cards.py:479-480`; its `PINNED` (:59) is T1.

**The compiler: `packages/theme-compiler/src/`**

- `compile.ts`:
  - `CompileInput` :46-79 and `noC0` :150-153;
  - `packageJson`'s `card_assets` :208;
  - `tidyLicence` :349;
  - the render loop that fills `placed` :436-488;
  - `default.hbs`'s head :568-587, whose stylesheet link is :578;
  - `package.json` :610 and the licences :611-614;
  - the final checks :616-624.
- `compile.test.ts`:
  - `LIB` :50-112, `at` :115-118, `input` :134-136, `build` :138;
  - `poolFonts` :126-131 is the in-memory pattern the card scripts follow, since a package test reads no file;
  - the whole-output scan :386-422 holds every text file, so `main.js` and `README.md` included, to the fingerprint rules and rule 1;
  - :629 expects the stylesheet line straight before FR-H2's guard; the script tag now sits between them, so the row gains it.

**Lint: `eslint.config.js`**

- The modules block :203-224, at `files: ['packages/library/modules/*.js']`. `NOT_CORE` (:46) keeps AD-1's `no-restricted-syntax` off these files, so this block can carry its own.
- `noInlineConfig` is the pattern to copy (`CORE`'s block, DW-4).

**Tools**

- `tools/pilot-theme.mjs`:
  - `FONTS` and `poolFonts` :78-80;
  - `compilePilots` :117-127;
  - `themeFailures` :162-191, whose per-file text rules are :169-181.
- `tools/check-snapshots.mjs`:
  - `pilots`, `WORDS` and `THEME` :601-603;
  - the 7.1 fingerprint control and row :668-695;
  - `pilotTheme` :770;
  - the 7.4 module-source rows and `moduleSources` :921-934;
  - `check`, `mustThrow` and `mustFail` :154-175.
- `tools/check-baseline.mjs`:
  - the ESLint harness `lintAt` :242;
  - `NFR2_BYTES` and `sizeLimit` :286-303;
  - the maximal `main.js` :310-317;
  - the size rows :460-478.
- `tools/stress/build.js` — the tag at :160, already byte-equal to `MAIN_JS_TAG`; `bundle` :241-250; `checkThemeJs` :308-311 and :379-380.
- `tools/probe/record-theme-assembly.py` — `SECTION` :115, `COMPILE` :133-159, `record` :337, `section` :637. Its docstring and `tools/doc-audit.py`'s row (:420) both name the stories.
- `tools/probe/run-verify-core.py:82-92` calls `checkThemeJs` with a `main.js` alone. It must keep passing, so the cards argument is optional and the template check is a second function.

**Documents** — `prd.md` FR-J4 (:393), NFR-2 (:477), §7.4's tree and the README sentence (:600-626); `ARCHITECTURE-SPINE.md` :103 (the no-`behaviour.js` rule) and :479 (`size-limit`); `VERIFY-AT-BUILD.md` row 27 (:168); `docs/section-authoring.md` § Behaviour modules (:840-966); `apps/web/lib/behaviours.ts:17-31` (the canvas's no-op for a module with no file).

## Tasks & Acceptance

**Execution:**

- [x] `packages/library/modules/core.js`, `core.test.mjs` — the comments only:
  - each keeps what it tells a reader of the theme, and loses the ids, the repo paths and the `ponytail:` marker;
  - `core.test.mjs:285` matches the new header.

  -- FR-J1: these comments ship in every theme. Proof: acorn's tokenizer gives the same token stream for the old file and the new.
- [x] `packages/library/src/modules.ts`, `modules.test.ts`:
  - `HEADER` per Design Notes § What the theme carries;
  - export `MAIN_JS_TAG`, `CARDS_JS_TAG` and `cardsJs(names, scripts)`;
  - `checkThemeJs(files, sources, cardScripts?)` compares `cards.js` to `cardsJs` over the scripted cards that `package.json` excludes (DW-135);
  - `checkThemeScripts(files, inline = {})` (DW-134);
  - `moduleKeyRefusals(sources, rows = MODULES)` (DW-146);
  - the matrix's check rows.

  -- one spelling of each rule, beside `bundle`.
- [x] `eslint.config.js`, `tools/check-baseline.mjs`:
  - the modules block gains `no-restricted-syntax` per Design Notes § DW-146, and `linterOptions: { noInlineConfig: true }`;
  - the controls go in the one ESLint harness: each sink refused, the clean lines clean, a disable comment silencing nothing.

  -- DW-146's literal half, on the syntax tree.
- [x] `packages/theme-compiler/src/compile.ts`:
  - `CompileInput` gains `modules: ModuleSources` and `ghostCards: { scripts, licence }`, both read by the shell;
  - `main.js`, `cards.js`, `LICENSE-ghost.txt`, `README.md` and the two tags;
  - `noC0` over the new inputs;
  - `checkThemeJs` and `checkThemeScripts` in the final checks, throwing on any sentence.

  -- FR-J4, in the one place every theme is built.
- [x] `packages/theme-compiler/src/compile.test.ts` — the I/O matrix's compile rows, row by row:
  - the input helper gains a minimal `core` and in-memory chunks in `record-cards.py`'s head shape;
  - the whole-output scan reads `main.js` and `README.md`.

  -- what the compiler promises.
- [x] `tools/pilot-theme.mjs`:
  - read `packages/library/modules/*.js` (the `^[a-z][a-z0-9-]*\.js$` files) and the vendored card scripts and licence, and hand them to `compileTheme`;
  - `compilePilots` takes `designedCards`, and, for CI's controls, `modules` in place of the files read;
  - factor `textFailures(path, body, instanceIds)` out of `themeFailures`.

  -- one project for CI and the recorder.
- [x] `tools/check-snapshots.mjs` — Design Notes § What CI holds, each row behind its control. `moduleSources` comes from `pilot-theme.mjs`.

  -- the shapes in CI on every commit.
- [x] `tools/check-baseline.mjs` — the size rows per Design Notes § The size rows.

  -- NFR-2's JS budget over what a theme ships.
- [x] `tools/stress/build.js` — the tag through `MAIN_JS_TAG`, `checkThemeScripts` printed beside `checkThemeJs`, and its "(Story 7.5 does)" comment says what landed.

  -- the fixture held by the same checks.
- [x] `tools/probe/record-theme-assembly.py`, `tools/doc-audit.py`:
  - Design Notes § The T1 run;
  - `SECTION` becomes `74`;
  - the docstring, `section()`'s text and the catalogue row say so.

  -- R-82: a real Ghost serves what the compiler writes.
- [x] Documents: apply Design Notes § Propagated at Dev, then grep the repo for each old wording.

  -- standing rules 3 and 7.

### Review Findings

Review of 2026-10-08, five layers. No decision for the owner; nothing deferred. Every patch applied in the review:

- [x] [Review][Patch] CI was red on the Dev head (the R-236 keyboard journey, no app change in the diff), so nothing deployed — passed locally with `--grep`; the Review push re-runs it [.github/workflows/ci.yml]
- [x] [Review][Patch] The named-inline door was open in every template; DW-328's candidate is a head script, so it is `default.hbs`'s alone [packages/library/src/modules.ts · checkThemeScripts]
- [x] [Review][Patch] `main.js`'s header said "by its last line", and the start call is the penultimate line [packages/library/src/modules.ts · HEADER]
- [x] [Review][Patch] DW-146's lint missed a `?:` or `||` branch, `el['textContent']`, `ctx['t'](…)`, and the DOM-only `prepend`/`before`/`after`/`replaceWith`/`replaceChildren` and `nodeValue`; its control planted half the sinks — the lists are exported and the lines derived [eslint.config.js · tools/check-baseline.mjs]
- [x] [Review][Patch] `moduleKeyRefusals` missed `t ('k')` and did not state that it reads comments [packages/library/src/modules.ts]
- [x] [Review][Patch] `excludedCards`' sentence named Ghost's `false` and `include` forms as if unknown [packages/library/src/modules.ts]
- [x] [Review][Patch] The compile said nothing about which mounts ship at rest — `js: { bundled, atRest }` beside `css`, and CI's warning holds against it [packages/theme-compiler/src/compile.ts · tools/check-snapshots.mjs]
- [x] [Review][Patch] The `WARNING FR-G7` list had no positive assertion; the cards theme's real vendored bytes never met `themeFailures` [tools/check-snapshots.mjs]
- [x] [Review][Patch] "the compile's own output" could not fail — a design's `<script>` now reaches the throw [packages/theme-compiler/src/compile.test.ts]
- [x] [Review][Patch] Three licence writers shared `LICENSE-*.txt` with no guard [packages/theme-compiler/src/compile.ts]
- [x] [Review][Patch] `moduleSources()` skipped a misnamed `.js` silently where the old reader took every file [tools/pilot-theme.mjs]
- [x] [Review][Patch] "core loads on every page" was read on `/` alone — the recorder counts the tag in every 200 page's head (runs at the next T1 run, Story 7.13's) [tools/probe/record-theme-assembly.py]
- [x] [Review][Patch] Wording: "2,740 B" without its metric; `tidyLicence` missing from the added-names list [this spec]

**Acceptance Criteria:**

- **The pilot theme's scripts.** Given the five-pilot project, when CI compiles it:
  - `checkThemeJs` and `checkThemeScripts` return nothing;
  - `themeFailures` passes with `main.js` and `README.md` in the tree;
  - `main.js` lists exactly `core` and each written module the compiled templates mount;
  - each mounted module with no file is printed as `WARNING FR-G7: …` and the check passes. Today those are `nav-drawer` and `member-form`.
- **The cards.** Given the same project with every vendored scripted card designed, when CI compiles it:
  - `cards.js` equals `cardsJs` of those cards over the vendored files;
  - `LICENSE-ghost.txt` equals Ghost's licence, tidied;
  - `default.hbs` carries `CARDS_JS_TAG`;
  - README's cards line names each card and the licence file;
  - `package.json` excludes them;
  - each holds behind its control.
- **DW-146.**
  - Given `pnpm lint`, when a planted module writes a visitor-facing literal, calls `t()` with a key that is no literal, or carries a disable comment, then each is refused.
  - Given every module file, when `check-snapshots` runs, then each passes the theme's text scan and each `t()` key derives from its row's `strings`. Each check fails its control first.
- **NFR-2.** Given `check-baseline`, when it runs, size-limit (the `file` preset, `gzip: true`) measures two things:
  - NFR-2's maximal design, `bundle` of every written module plus `cardsJs` of every vendored chunk;
  - the compiled pilot theme's `assets/js/`.

  Each equals the sum of zlib's level-9 gzip of its files, each is a `WARNING NFR-2` line past 40,960 bytes and never a failure, and no file in `apps/` reads either.
- **Ghost serves it.** Given T1 and the owner's in-session go, when the recorder runs:
  - every row in Design Notes § The T1 run holds behind its control;
  - T1 is restored and read back;
  - MEASUREMENTS §74 records the run.
- **No screen.** Given this story, when Dev ends, then it is Done on its Deploy commit (R-80).
- **Propagation.** Given Dev's end:
  - FR-J4, NFR-2, §7.4's README line, the spine's two rows, VERIFY-AT-BUILD row 27 and `docs/section-authoring.md` say what landed;
  - DW-134, DW-135 and DW-146 are done, and the two new entries have owners;
  - a grep finds no old wording.

## Spec Change Log

## Design Notes

### What the theme carries

`default.hbs`'s head, after Story 7.4's lines:

```hbs
    <link rel="stylesheet" href="{{asset "css/screen.css"}}">
    <script defer src="{{asset "js/main.js"}}"></script>
    <script defer src="{{asset "js/cards.js"}}"></script>   ← only when cards.js ships
    …FR-H2's noindex guard…
    {{ghost_head}}
```

The tags are `MAIN_JS_TAG` and `CARDS_JS_TAG`, in Ghost's own attribute order (`ghost_head.js` writes `<script defer src=…>`).

`main.js` opens with `HEADER` plus the names. `checkThemeJs` still parses that line:

```js
// This file's scripts, one function each, started together at the end of this file: core · lightbox
```

`cards.js` is one header, then each card's chunk in code-unit order, each under a one-line label:

```js
/* Ghost's own scripts for these cards: audio · toggle — copied unchanged from Ghost 6.58.0, core/frontend/src/cards/js/.
   Copyright (c) 2013-2026 Ghost Foundation. MIT licence: the full text is LICENSE-ghost.txt. */
/* audio.js */
(function() { …Ghost's bytes… })();
/* toggle.js */
…
```

- **The chunks.** `cardsJs` cuts `record-cards.py`'s head off each chunk, by its exact shape. It reads the version and the copyright line from those heads, and refuses a chunk without one, or chunks whose versions differ. The head would otherwise ship a repo path and a repo tool's name.
- **The licence.** `LICENSE-ghost.txt` is the vendored `LICENSE-ghost.txt` through `tidyLicence`.

`README.md`, always emitted:

```md
## Scripts

- `assets/js/main.js` is this theme's own code: a small runtime and one function for each behaviour its sections use. It carries no third-party code.
- `assets/js/cards.js` is Ghost's own code for these cards: audio · toggle. It is copied unchanged from Ghost 6.58.0, under the MIT licence in `LICENSE-ghost.txt`. This theme styles those cards itself, which switches off Ghost's own copy of their scripts, so it carries this one.
```

The second bullet appears only when `cards.js` ships. Later stories add their own sections: 7.17 the routes step, 7.26 the rest of §7.4's list, 7.28 the credit.

### The two checks

Each returns sentences, each naming the file. The compile throws on any of them over its own final text.

- **`checkThemeJs(files, sources, cardScripts?)`** — FR-G7(1) over `assets/js/`.
  - **`main.js`:** as today.
  - **`cards.js`, when present:** `cardScripts` must be handed and `package.json` must parse. The expected cards are `config.card_assets.exclude` ∩ the keys of `cardScripts`, sorted. They must not be empty, and the bytes must equal `cardsJs(expected, cardScripts)`.
  - **`cards.js`, when absent:** if `cardScripts` is handed and the expected cards are not empty, that is a sentence naming the cards whose script nothing carries.
  - **Anything else under `assets/js/`:** as today.
  - Called without `cardScripts` — `run-verify-core.py` and the stress fixture — the only change is that a `cards.js` is refused rather than skipped.
- **`checkThemeScripts(files, inline = {})`** — DW-134 over every `.hbs`, its Handlebars comments removed first.
  - Every `<script …>…</script>` must be one of three things: `MAIN_JS_TAG` in `default.hbs`; `CARDS_JS_TAG` in `default.hbs`; or, in `default.hbs` alone *(review, 2026-10-08: DW-328's candidate is a head script, so the door is the shell's)*, a bare `<script>` whose body equals a value of `inline`.
  - `MAIN_JS_TAG` appears exactly once.
  - `CARDS_JS_TAG` appears exactly once when `assets/js/cards.js` is in `files`, and never otherwise.
  - A `<script` with no closing tag is a sentence.

### Modules with no file yet

A module is written by the first category story that declares it (FR-G7(2)). The provisional pilots (AD-35) declare two before theirs exist:
- `nav-drawer`, declared by A1 #1 and written by Story 9.1;
- `member-form`, declared by A22 #1 and written by Story 10.75.

- **The theme.** It leaves them out of `main.js`, so `core` mounts nothing there. Each mount stays in its no-JS state, which FR-G7(3) calls the real one. `core` reports the missing name in the browser console (`core.js:34-45`), a developer-facing line that ends when the file lands.
- **A stub is wrong.** A no-op `nav-drawer` would let `core` set `js-enabled`, and A1 #1's phone CSS would then hide the nav behind a menu button that does nothing (`a1/1/style.css:104-105`).
- **The canvas differs, and stays as it is.** The editor runs a no-op for such a module (`behaviours.ts:17-31`), so Preview, `/pilots` and the render matrix draw the JavaScript branch. A1 #1 at phone width therefore differs between the canvas and the theme. A new entry hands that to Story 7.34, which compares the two; Story 9.1's file ends it.

### What CI holds

`check-snapshots`' new rows. Each control fails first.

1. **The pilot theme's JS is clean.** `checkThemeJs`, with the vendored chunks, and `checkThemeScripts` return `[]`.
   - Control: a template carrying `<script>alert(1)</script>`, and a `main.js` with one byte appended, are each named.
2. **`main.js` is what the markup mounts.**
   - The names come from every `data-module` in the compiled `.hbs`, through `parseModuleDeclaration`. Those with a file must be exactly `main.js`'s header list after `core`, in registry order. Each without a file prints `WARNING FR-G7: <name> is mounted and has no file yet — its mounts ship at rest`, and the check passes.
   - Control: the pilots compiled with a stub `nav-drawer` file list it in `main.js` and print no warning for it, and a header missing a mounted written module fails.
3. **The cards compile.** The pilots with `designedCards` set to every vendored script name: `cards.js` equals `cardsJs` over the vendored files, and `LICENSE-ghost.txt`, the cards tag, README's cards line and `package.json`'s `exclude` are each present.
   - Control: `cards.js` with one byte changed is named by `checkThemeJs`.
4. **Module comments.** Every module file passes `textFailures`.
   - Control: planted sources carrying `R-21`, `ponytail:` and the builder's name are each named.
5. **Module keys.** `moduleKeyRefusals` over every module file returns `[]`.
   - Control: a planted `countdown` calling `ctx.t('weeks')` is named, and `ctx.t('days')` is clean.

### DW-146

- **The literal half: lint.** `no-restricted-syntax` in the modules block refuses three things.
  - **A letter-bearing literal written to text.** "Letter-bearing" means a string literal, or a template literal's static text, matching `/\p{L}/u`. It is refused when assigned to `textContent`, `innerText`, `innerHTML`, `outerHTML`, `title`, `alt`, `placeholder`, `label` or an `aria*` text property, or passed as the second argument of `setAttribute` when the first names `title`, `alt`, `placeholder`, `aria-label`, `aria-description`, `aria-roledescription`, `aria-valuetext` or `aria-placeholder`.
  - **The same literal passed to a text-making call:** the second argument of `insertAdjacentText` or `insertAdjacentHTML`; any argument of `createTextNode`, `write`, `writeln`, `alert`, `confirm`, `prompt`, `new Text` or `new Option` *(review, 2026-10-08: and the DOM-only `prepend`, `before`, `after`, `replaceWith`, `replaceChildren`; `nodeValue` joins the properties; a literal as either branch of a `?:` or a `||`, and `el['textContent']`, are caught; the sink lists are exported and `check-baseline` plants one line per entry)*.
    - `innerHTML`, `outerHTML` and `insertAdjacentHTML` refuse markup too: a module builds elements with `createElement`.
  - **A `t()` call (bare, `ctx.t` or `ctx['t']`) whose first argument is not a string literal.**
- **The clean lines.**
  - `el.textContent = ctx.t('more')`, `setAttribute('aria-expanded', 'true')`, `insertAdjacentText('beforeend', ctx.t('more'))` and `` `${n}` `` are clean.
  - The selectors were executed at planning on the repo's ESLint, and gave exactly the expected refusals (§ Facts 6).
- **The ceiling, which review holds.**
  - A literal parked in a variable first, or joined by `+`, evades the rule; so does a sink outside the lists (`value`, `data`).
  - `append`, `prepend`, `before`, `after`, `replaceWith` and `replaceChildren` are left out: `URLSearchParams` and `FormData` share those names, and a form module calling `append('email', …)` must stay clean.
- **The registry half: `moduleKeyRefusals`.** For each module file but `core`:
  - its name is a registry row;
  - every `t('…')` literal in it equals `i18nAttr(k)` without `data-i18n-`, for some `k` in that row's `strings`.

  The lint guarantees the keys are literals, so a plain scan finds them all. It reads the raw text, so a `t('…')` in a comment or a string is held to the row too *(review, 2026-10-08)*.

### The size rows

`check-baseline` keeps its runner, its 1 B control and NFR-2's sentence check. Its maximal row becomes NFR-2's own definition: `bundle` of every module with a file, plus `cardsJs` of every vendored chunk, measured as two files. A second row compiles the pilot theme (`compilePilots`, CI's words and theme) and measures its `assets/js/*`.

- `@size-limit/file` sums each file's gzip at level 9 (§ Facts 5), so each row asserts that sum against zlib's.
- Under budget, the size is the check's note.
- Over 40,960 bytes, it prints `WARNING NFR-2: … — a warning, not a failure (no customer can act on it)`.

### Settled here as readings, each told to the owner in one line

1. **A section whose script is not written yet ships in its no-script state** (FR-G7(3)). On a phone today, your header's menu links show as a plain list until Story 9.1 writes the menu button. The sign-up form looks the same either way, and Ghost still sends it.
2. **The scripts' first line and `core`'s comments name no builder and carry no internal note** (FR-J1). A check keeps every future script file that way, because each one ships inside customers' themes.
3. **`cards.js` is Ghost's four card scripts exactly as Ghost wrote them,** the same bytes in Ghost 5.130.6 and 6.58.0, with Ghost's MIT licence beside it, the way Tabler's travels with its icons (R-26) and each font's with its files (Story 7.4).
4. **Both script tags sit in the page's head with `defer`,** Ghost's own form, so neither holds the page up (NFR-2 (3)).
5. **The README starts with its Scripts section.** Install steps, the pack and pairing, and where to re-import go to Story 7.26 in a new entry. The routes step stays Story 7.17's and the credit Story 7.28's.
6. **DW-146's method** is a lint rule against visitor-facing literals plus a check of each `t()` call against the module's registry row. The phrase list gains no new column.
7. **The JS size check is a CI warning only** (NFR-2: no customer can act on it).
8. **A real Ghost first serves `cards.js` with the first designed card** (Story 7.13, whose criteria already say that excluding a card drops its script). Here that drop is read in Ghost's source on both majors, and T1 serves `main.js`.

### Facts this spec rests on (standing rule 1)

These were read in the npm tarballs ghost-6.58.0 and ghost-5.130.6, and in gscan 4.49.7 and 6.4.2 (`tools/stress/node_modules`).

1. **Excluding a card drops its script from Ghost's own bundle.**
   - 6.58.0: `core/frontend/services/assets-minification/card-assets.js:83-105` (`getCardNames('js')` filters `exclude`).
   - 5.130.6: `CardAssets.js:26-55`, through the glob `js/!(…).js`.
   - `{{ghost_head}}` writes `<script defer src="…/public/cards.min.js?v=…">` only while that bundle has a script: 6.58.0 `helpers/ghost_head.js:440-446`, 5.130.6 `:326-333`.
2. **The four scripted chunks.**
   - `core/frontend/src/cards/js/` holds audio, gallery, toggle and video on both majors, byte-identical between 5.130.6 and 6.58.0 (diffed).
   - The vendored files equal 6.58.0's after `record-cards.py`'s two-line head.
   - Each ends `})();\n`, so plain concatenation is safe. Ghost 6 adds `;\n` only because its minified chunks may drop the semicolon (`card-assets.js:121-124`).
3. **What Ghost serves.** It serves `assets/` through `{{asset}}` with `?v=`, and no root `.md` (both read in source for Story 7.4: its spec's § Facts 2 and 3), so `README.md` is for whoever opens the zip.
4. **gscan: excluding `gallery` restores three ERRORS.** `GS050-CSS-KGGC`, `-KGGR` and `-KGGI` are errors on both gscans. Audio's, toggle's and video's restored rules are warnings.
   - Read through `lib/specs/v5.js`'s `cardAsset`. `checks/050-koenig-css-classes.js` looks for each class in any `.css` or `.hbs`.
   - That is Story 7.13's `cards.css` to answer. It is named here because a designed gallery fails FR-J6 until then.
5. **`@size-limit/file` 13.0.3** with `gzip: true` sums each file's level-9 gzip (`index.js`, `gzipSize` and `sum`).
6. **The lint selectors were executed.** On the repo's ESLint, `[value=/\p{L}/u]` matches Cyrillic as well as Latin, and `[arguments.1.type='Literal']` reaches `setAttribute`'s value without matching its name. The planted lines gave seven refusals and five clean lines, as expected; the other sinks use the same two selector shapes.
7. **An unknown name in `core`.** `core` reports the name and mounts nothing there (`core.js:34-45`). `core.test.mjs` holds "an unknown name is reported, never paused". §42 (b) ran `bundle()`'s bytes in Chromium on both majors from a `defer` tag.

### The T1 run: `tools/probe/record-theme-assembly.py`, §74

It is §73's run on this tree. The compiled pilot theme now carries `main.js`, which is `core` alone today, and `README.md`.

1. **The local gate is unchanged.** It is 0/0 on both gscans with §73's scaffold; gscan reads no `.js`.
2. **The tag.** `/`'s head carries the theme's script tag once, as Ghost renders `MAIN_JS_TAG`: `<script defer src="/assets/js/main.js?v=…"></script>`.
3. **The file.** That address answers 200 with a JavaScript content type (recorded as served), and its body is the compiled `main.js`, byte for byte.
   - Control: `/assets/js/{nonce}.js` answers 404.
4. **Earlier rows.** Stories 7.1–7.4's rows hold again.
5. **What it writes.** §73's three uploads, their activations and deletes, and nothing else. The Ghost 5 half is DW-326's (R-238).

### Propagated at Dev

- **`prd.md`:**
  - FR-J4: the tags, the header, modules at rest, `cards.js` as built, `LICENSE-ghost.txt`, the README section and the four checks;
  - NFR-2: the maximal design now counts `cards.js`, measured per commit with the compiled theme beside it (this replaces "re-measured once the vendored set is built");
  - §7.4's README line.
- **`ARCHITECTURE-SPINE.md`:** :103 (`cardsJs`, `checkThemeScripts`) and :479 (what the gate measures).
- **`VERIFY-AT-BUILD.md`** row 27.
- **`research-section-js-libraries.md`:**
  - :127, the gallery row: "nor budgets for it" no longer holds once a gallery is designed, since `cards.js` then carries Ghost's script and NFR-2's maximal design counts it;
  - :659, the `cards.js` row: how it is built and checked.
- **`docs/section-authoring.md`** § Behaviour modules:
  - the header;
  - module comments ship, so the scan holds them;
  - DW-146's two halves;
  - modules at rest;
  - the `cards.js` and template checks.
- **`epics.md`:**
  - Story 7.5's card, with the DW ids as landed;
  - Story 7.13's card: gallery's three gscan errors (§ Facts 4), and `cards.js`'s first T1 run;
  - Story 7.26's card and Story 7.34's card, each with its new entry.
- **`deferred-work.md`:**
  - DW-134, DW-135 and DW-146 are done;
  - DW-339 gains a note: its scan also misses the letter-bearing ids (`FR-G7`, `FR-J4`), found while rewriting `core.js`;
  - two new entries:
    - README's install steps, the pack and pairing, and where to re-import (§7.4) have no story. Owner: Story 7.26.
    - A module with no file draws its JavaScript branch on the canvas and its no-JS branch in the theme. Owner: Story 7.34.
- **`MEASUREMENTS.md`:** §74.
- **`epic-7-context.md`:** a sub-bullet for each of the above.
- **Last:** grep for:
  - `Inflozo main.js` and `made by bundle()`;
  - "cards.js's own bytes are not checked";
  - "(Story 7.5 does)" and "Stories 7.5 and 7.33 point size-limit";
  - `ponytail: ONE scan`.

### The commits

There is no migration, so there is no Schema phase. `Story 7.5 - Dev - …` carries:
- the code, tests, tools and documents;
- §74, if the T1 run happens in the Dev session on the owner's go.

## Owner's manual test

None. This story has no screen, so it has no frame and no hand test, and it is Done on its Deploy commit (R-80). What a visitor's browser does with the scripts is held by CI, and by T1 serving them.

## Verification

**Commands:**

- `pnpm check` — expected: green. That covers:
  - lint, including DW-146's rule;
  - the typecheck;
  - every package's tests, among them the new `modules.test.ts`, `core.test.mjs` and `(7.5)` `compile.test.ts` rows;
  - `node tools/check-baseline.mjs`, with the lint controls and both size rows, each printed;
  - `node tools/check-snapshots.mjs`, with § What CI holds, each behind its control, and today's two `WARNING FR-G7` lines.
- `cd tools/stress && npm install && node build.js && node gate.js theme` — expected: `checkThemeJs` and `checkThemeScripts` clean, and 0 errors and 0 warnings on both gscans.
- The recorder's local half (`compiled()`, then `scaffold()`, then `gated()`) — expected: 0/0 on gscan 4.49.7 (v5) and 6.4.2 (v6).
- `python3 tools/probe/record-theme-assembly.py`, on the owner's in-session go, in the main session — expected: every §74 row holds behind its control on T1 `ghost6.inflozo.com` (6.58.0), and T1 is restored and read back.
- `python3 tools/doc-audit.py --check`, twice — expected: PASS.

**Manual checks:**

- The compiled pilot theme reads as hand-written:
  - `default.hbs`'s head shows the one `defer` tag after the stylesheet;
  - `main.js` opens with the neutral header, then `core`, whose comments read as plain explanation;
  - `README.md` is the Scripts section.
- `core.js`'s token stream is unchanged (acorn's tokenizer, old file against new).

**Real infrastructure (R-82):**

- T1, through the recorder.
- Both gscans locally, and gscan 6.4.2 in CI.
- Vercel: CI's `check`, `rls` and `deploy` green, and the deployment READY at the head. The app's only change is `core.js`'s comments, inside the editor's bundle.
- There is no migration, and no Supabase, Resend or Dodo surface. The compiler has no product caller until Story 7.18.

**Dev results (2026-10-08, Node 24.18.1, on this tree).**

- **`pnpm check`: exit 0.** That covers lint (DW-146's rule included), the typecheck and every package's tests with 0 failures:
  - `modules.test.ts`'s seven `(7.5)` rows, `compile.test.ts`'s thirteen `(7.5)` rows, and `core.test.mjs`'s header row.
  - `check-baseline` ran DW-146's three lint rows: every planted sink refused (Latin and Cyrillic), the clean lines clean, and a disable comment silencing nothing.
  - `check-baseline`'s size rows, measured by size-limit and checked against zlib's level-9 gzip, summed:
    - the maximal design (`main.js` of every module with a file, plus `cards.js` of all four vendored chunks) is 5,181 B;
    - the pilot theme's `main.js` is 2,740 B gzipped;
    - the 1 B control printed its `WARNING NFR-2` line and did not fail;
    - a row with a control confirms that no file in `apps/` reads the size check.
  - `check-snapshots` ran § What CI holds, rows 1–5, each behind a control that fired first. It printed today's two warnings: `WARNING FR-G7: nav-drawer is mounted and has no file yet — its mounts ship at rest`, and the same for `member-form`.
- **`python3 tools/doc-audit.py --check`**, twice: PASS (0 warnings).
- **The stress fixture** (`node build.js && node gate.js theme`):
  - `checkThemeJs` clean, with `main.js` the only file;
  - `checkThemeScripts` clean, with `main.js`'s defer tag the only script;
  - 0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6).
- **The recorder's local half** (`compiled()`, then `scaffold()`, then `gated()`, run through importlib): 0/0 on both gscans. The compiled tree carries `assets/js/main.js` (`core` alone) and `README.md`, and `default.hbs` carries `MAIN_JS_TAG` once. Both hand-written paywall probes (`paywall_theme`) also gate 0/0, checked before the upload.
- **T1 `ghost6.inflozo.com` (Ghost 6.58.0):**
  - Command: `python3 tools/probe/record-theme-assembly.py`, run in the main session on the owner's in-session go, asked and given in this Dev session.
  - Keys: read in-process from `tools/probe/.env` by variable name only — `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`.
  - **Every row held: 114 PASS, 0 FAIL, first run.** Story 7.5's rows:
    - `/`'s head carried the tag once, as Ghost renders `MAIN_JS_TAG`: `<script defer src="/assets/js/main.js?v=tfdVV6-o_MAJ2f5L"></script>`. Ghost's hash is mixed-case with `-` and `_`, and the matcher allows `[0-9A-Za-z_-]`.
    - That address answered HTTP 200 as `application/javascript; charset=UTF-8`, and its body was the compiled `main.js` byte for byte (7,302 bytes served, 7,302 compiled).
    - Control: `/assets/js/{nonce}.js` answered 404.
    - Premise checked before the upload: `main.js` and its tag were in the uploaded tree.
  - Stories 7.1–7.4's rows held again on this tree, the paywall mechanism among them.
  - **T1 was restored and read back after each of the three uploads**: `casper` active, with `casper`, `racer` and `source` installed. A public read afterwards found Casper's `casper.js` back in the head, and `/assets/js/main.js` answering 404.
  - What it wrote: the three uploads, their activations and deletes. This month's probe picture was reused. MEASUREMENTS §74 was written; §70–§73 are untouched. The Ghost 5 half is DW-326's (R-238).
- **Manual checks:**
  - The compiled pilot theme's `default.hbs` head shows the stylesheet link, then `<script defer src="{{asset "js/main.js"}}"></script>`, then FR-H2's guard and `{{ghost_head}}`.
  - `main.js` opens with `// This file's scripts, one function each, started together at the end of this file: core` (the review's wording: the start call is the penultimate line, the IIFE's close the last), then `core`, whose comments read as plain explanation.
  - `README.md` is the Scripts section alone. With all four vendored cards designed, it adds the cards line (`audio · gallery · toggle · video`, Ghost 6.58.0, `LICENSE-ghost.txt`), and `cards.js` opens with the header in § What the theme carries.
- **`core.js`'s tokens are unchanged.** acorn 8.18.0's tokenizer gives 1,138 tokens for the file at baseline and 1,138 for this one, identical. Control: one token changed reads as different. The line count is unchanged at 158, so every `core.js:N` reference still points where it did.
- **The grep for the old wordings** (§ Propagated at Dev, *Last*) finds them only in this spec.
- **No Supabase, Resend or Dodo call was made**, and no migration exists. Vercel: `core.js`'s comment-only change reaches the editor's bundle through CI on this push, and checking its READY is the Review's job.
- **Added beyond the spec's names, each a reader or a value the named functions needed:**
  - `cardsVersion`, the Ghost version README states;
  - `bundledNames`, the one reader of `main.js`'s header;
  - `HBS_COMMENT`, moved from `compile.ts` into the library, since `checkThemeScripts` needs it;
  - `CI_WORDS` in `pilot-theme.mjs`;
  - `tidyLicence`, exported from the compiler package for CI's comparison of Ghost's licence;
  - Epic 7's R-195 preamble list.
  - The lint's ceiling is a little wider than § DW-146 states: a literal joined by `+` evades it too. `docs/section-authoring.md` says so.
- **One wording left as the owner ruled it.** R-63 in `reconcile-designs-decisions.md` still says Inflozo "neither writes, bundles nor budgets for" Ghost's gallery script. Its decision stands: gallery's script is not a module and has no registry entry. The research row it cites (`research-section-js-libraries.md`'s gallery row) now carries the dated note that NFR-2 counts that script once a gallery is designed. The ruling's own text is the owner's and was not edited.

**Review (2026-10-08), five layers over the diff since `23d5c0c5` (Blind Hunter, Edge Case Hunter, Verification Gap,
Acceptance Auditor, Real-infra verifier), then triage.** No acceptance criterion violated; no owner decision needed; no
new question; nothing deferred. Real infrastructure (R-82), read-only on T1 — no upload, since the Dev run of 2026-10-08
stands and a second upload needs an in-session go. Keys by variable name (`GITHUB_TOKEN`, `VERCEL_TOKEN`,
`VERCEL_TEAM_ID`), none printed. On T1 `ghost6.inflozo.com`: public `GET /` → 200 with Casper's scripts in the head and
no `/assets/js/main.js`; `GET /assets/js/main.js` → 404; controls `GET /assets/js/{nonce}.js` → 404 and the live
`/assets/built/casper.js?v=…` → 200 — §74's restoration holds. **CI on the Dev head `48c450d3` was red:** run 37792007160
`check` failed at `pnpm keyboard` on the R-236 journey (`#pack-editor-title` not found), `rls` success, `deploy` skipped,
so no deployment carried the Dev head; the diff touches nothing under `apps/web` or `tools/keyboard`, and `pnpm keyboard
-g R-236` passed locally (1 passed, 5.6 s). CI on the Review head `4de80690`: run 37796621688 `check`, `rls`, `deploy` all
success; `Render matrix` 37796621598 success. Deployment `dpl_CapwNwpyFCfwHrbehZ4iseStf2cG` READY on production at
`4de80690`; control: `app.inflozo.com/app/harness/pilots` → 308 → `/harness/pilots` → 404 (the harness is off in
production). No migration in the diff (`git diff --stat 23d5c0c5 HEAD -- supabase/` empty), so no R-99 schema read; no
Supabase, Resend or Dodo surface. Locally (Node 24.18.1): `pnpm check` exit 0 before and after the patches (library 223,
theme-compiler 90 after the review's rows, 0 failures); `check-baseline` PASS with the DW-146 rows now planting 104
refused and 8 clean lines derived from the exported sink lists, the maximal design 5,178 B gzipped and the pilot theme's
`main.js` 2,740 B gzipped; `check-snapshots` PASS with every 7.5 row behind its control, the two `WARNING FR-G7` lines
held against the compiler's `js.atRest`; `tools/stress` `node build.js` (`checkThemeJs` and `checkThemeScripts` clean)
and `node gate.js theme` 0/0 on gscan 4.49.7 and 6.4.2; `python3 tools/doc-audit.py --check` twice, PASS.

**Patched here:** see § Review Findings. The recorder's new per-page tag row is code only until the next T1 run (Story
7.13's first designed card); it reads pages the recorder already fetches and is a verdict row, not a Void.

**Dismissed as noise or settled by the spec:** `checkThemeJs` also naming a missing `package.json` when `cards.js` is
absent (a missing `package.json` is a defect in any theme); tag position held by the compile's tests rather than
`checkThemeScripts` (§ The two checks defines the function so); `core` reporting a mount with no file in the console
(§ Modules with no file yet settles it; DW-347 carries the canvas difference); `noC0` over every module file and chunk
handed in, placed or not (the matrix's control-character row asks exactly that); the README naming Ghost 6.58.0 on a
theme a Ghost 5 site may install (the version named is the one the bytes were copied from, and § Facts 2 holds them
identical); Story 7.34's card still saying "T1 and T3" (R-238 governs every such line project-wide); the positive module
rows covering `core.js` alone today (each has a planted control).

**The I/O matrix, row by row, mapped to the check that ran and passed:**

| Row | Check |
|---|---|
| No module declared | `(7.5) no module declared …` (compile) |
| A written module | `(7.5) a written module …` (compile) |
| The union | `(7.5) the union …` (compile) |
| It leaves with its design | `(7.5) it leaves with its design …` (compile) |
| Declared, no file yet | `(7.5) declared, no file yet …` (compile); `check-snapshots` row 2, with its two `WARNING FR-G7` lines and its stub-file control |
| No `core` | `(7.5) no core …` (compile) |
| A module's strings | `(7.5) a module's strings …` (compile) |
| Designed cards with scripts | `(7.5) designed cards with scripts …` (compile); `check-snapshots` row 3 |
| Designed cards without scripts | `(7.5) designed cards without scripts …` (compile) |
| A chunk not as vendored | `(7.5) a chunk not as vendored …` (compile); `(7.5) cardsJs refuses …` (modules) |
| A control character | `(7.5) a control character …` (compile) |
| Determinism | `(7.5) determinism …` (compile) |
| The compile's own output | `(7.5) the compile's own output …` (compile); `check-snapshots` row 1 |
| `cards.js` changed | `(7.5) checkThemeJs compares cards.js …` (modules): one byte off, and a card not excluded; `check-snapshots` row 3's control |
| A scripted card with no `cards.js` | the same modules test: `audio's player would never play` |
| A stray `<script>` | `(7.5) checkThemeScripts …` (modules): stray inline, upper-case, `MAIN_JS_TAG` missing, twice and outside `default.hbs`, `CARDS_JS_TAG` without `cards.js`, `cards.js` without its tag, an unclosed script; `check-snapshots` row 1's control |
| A named inline script | the same test: a named source passes, and one byte off is refused |
| A `<script>` in a Handlebars comment | the same test: both comment forms are ignored |
| A visitor-facing literal | `check-baseline`'s three DW-146 lint rows |
| An undeclared key | `(7.5) moduleKeyRefusals …` (modules); `check-snapshots` row 5 and its `ctx.t('weeks')` control |
| A module's comments | `check-snapshots` row 4 and its control (`R-21`, `ponytail:`, the builder's name) |
