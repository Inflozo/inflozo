---
title: 'Story 7.7 — The gscan gate'
type: 'feature'
created: '2026-10-09'
status: 'in-progress'
owner_test: none
review_loop_iteration: 0
baseline_commit: 'b5a3da0a78da7adc296c809cc5bf7a2afecf75b1'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, every theme Inflozo builds can be checked by the same theme checker your own Ghost runs when a theme is uploaded — Ghost 5's checker for a Ghost 5 site and Ghost 6's for a Ghost 6 site — and each problem it finds comes back as one plain sentence that names the real cause: an error stops the deploy, a warning lets it go ahead. Two traps close on the way: a known fault in Ghost's checker, which turns one badly written theme setting into a page of false errors about a file that is fine, now becomes one true sentence, and words you type, such as "currency_symbol", can no longer trip the checker, while visitors still read exactly what you typed. Nothing changes on your screen yet, because the deploy screen that shows these sentences is Story 7.18's (you ruled so on 2026-10-09), so this story is done when it deploys green, proved by the automated checks and our test Ghost site; the page-switch warning never blocks a deploy, on either Ghost version.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:**
- Nothing tells a customer, before an upload, what Ghost's own theme checker (gscan) will say. Ghost runs it on every upload at its own major's spec. A fatal result refuses the theme with a `422`. Every other error is listed, and the theme installs anyway (read in source on both majors, § Facts 2).
- AD-34 (the owner's R2-2) judges each Ghost major by the gscan it bundles: 4.49.7 for Ghost 5, 6.4.2 for Ghost 6.
  - The workspace holds 6.4.2 alone, as a devDependency.
  - pnpm refuses 4.49.7 on the project's Node 24, because 4.49.7 declares Node 22 at most and the workspace is `engineStrict` (read in pnpm's source, § Facts 9).
  - FR-J6's version policy still names one gscan.
- gscan's output is not written for a customer: rule codes, HTML in its text, and messages that quote the theme's source. One known fault makes it report every `package.json` rule failed against a valid file. The cause is a theme setting whose `visibility` names no key of two or more characters (executed on both checkers, § Facts 6).
- A customer's typed words trip gscan with no mustache at all (executed, § Facts 7):
  - `currency_symbol`, `@site.lang`, `@labs.members` and `ghost.url.api` are errors on both checkers;
  - an address holding `/assets/` in a link is a warning.
  FR-J6's "errors block" would stop a deploy over a word.
- DW-341: `GS110-NO-MISSING-PAGE-BUILDER-USAGE` is an error on Ghost 5's checker and a warning on Ghost 6's. Every project raises it until Story 10.79 lets a Post header sit on `page.hbs`.

**Approach:**
- `@inflozo/theme-compiler/gate` exports `gscanGate(files, major)`. It runs that major's pinned gscan over the compiled files in a fresh temporary directory. It then maps the result through one table (AD-24) to a verdict, in which errors block and warnings deploy:
  - the reachable shortlist is said in Inflozo's own sentences: GS110's page switch, plus `GS100` and the `package.json` cascade, which the card names;
  - every other rule is shown in the stated verbatim format: rule code, gscan's message, the file, a docs link;
  - a checker that fails is one sentence.
  There is never a stack trace and never HTML.
- Both checkers become pinned dependencies.
  - Ghost 5's is installed from a copy of its npm package whose only change is the Node range it declares.
  - Each pin's rule inventory is recorded as an AD-23 fixture and held by a test, so a version change is never silent.
  - `GS100`'s trigger is re-proved on a fixture.
- The runtime's escaper and the compile's boundary comment write gscan's brace-free trigger words inert (AD-36). Visitors read the same text.
- CI runs the gate over the pilot theme on both checkers. The recorder proves on T1 that the gate's Ghost 6 answer is Ghost 6's own.

## Boundaries & Constraints

**Always:**

- **One implementation of each rule.**
  - `GSCAN` (`gate/gscan.ts`) is the one place a pin, a package alias or a `checkVersion` is written.
  - `runGscan` is the only caller of gscan in product code and in CI: `check-snapshots`' gscan rows move onto it.
  - `verdict` is the one mapping (AD-24).
  - `tools/stress/gate.js` stays the stress fixture's own, on its separate install (Story 7.35, DW-296).
- **Each Ghost major is judged by its own checker (AD-34).** That is gscan 4.49.7 at `v5` for Ghost 5, and 6.4.2 at `v6` for Ghost 6. `check` and `format` take the same `checkVersion`, since `format` throws otherwise (§ Facts 3). Never one gscan at two specs.
- **The gate never throws, and a verdict is plain text.**
  - gscan's HTML is stripped and its entities decoded.
  - No stack trace and no exception text reaches a field, beyond gscan's own failure messages in `detail`.
- **gscan sees one fresh directory and nothing else.**
  - The directory is `mkdtemp` under `os.tmpdir()`. It holds the theme's files alone, and it is removed in a `finally`.
  - gscan deletes the entries it ignores from a theme inside the temporary directory (§ Facts 3), so it is never pointed at any other directory.
  - A path that would land outside the directory is refused as `theme_check_failed`.
- **Deterministic and serialisable.** The same files and major give the same verdict, findings in a stable order. A verdict is plain JSON, for Story 7.18's `deploys.gscan` and `deploy_jobs.error`.
- **Errors block and warnings deploy, after mapping.** gscan's recommendations are not part of a verdict: Ghost's own upload answer carries errors and warnings alone (§ Facts 2).
- **A customer's words are inert to gscan (AD-36),** at `escapeUserText` (AD-5's one door) and in the boundary comment. A visitor reads exactly the typed text.
- **No screen** (Question 2, as planned): no frame and no hand test. The story is Done on its Deploy commit (R-80).
- **Counts are derived.** No rule count, level list or fatal list is written by hand: the inventories are recorded from the installed checkers.

**Ask First:**

- **Questions 1 and 2, before Dev.** Dev builds Design Notes § Ruled values as it stands at that moment.
- **The T1 run.** It uploads to T1, so it needs the owner's in-session go, in the Dev or the Review session. It runs in the main session, never through a subagent.
- **The install.** The registry `gscan@4.49.7` is tried first, as the control.
  - If pnpm installs it on Node 24 with `engineStrict` on, use it and skip the copy.
  - If the copy is refused too, or anything beyond `engines` would have to change in it, stop.
  - Stop too if a dependency of either checker asks for a build script that `allowBuilds` does not already settle.
- **A rule a valid project reaches beyond the shortlist**, found at Dev or on T1. Whether it blocks a deploy is the owner's.
- **A render-matrix baseline or a snapshot that moves.** None should: no library design, snapshot or fixture holds a trigger word (grepped at this Create). A moved baseline is the owner's (R-116).

**Never:**

- **Anything a later story owns:**
  - Pre-flight's screen, the server route that compiles and gates a real project, and the deploy job's writes: Story 7.18 (Question 2);
  - the upload's concurrent-name `500` (`EEXIST`): 7.18;
  - `GET /themes/`'s `501` and `403` as one code: 7.20;
  - the theme-size budget: 7.29;
  - FR-J17's quality gate: 7.8;
  - compile CI over the whole library: 7.33;
  - `config.custom`: 7.10 and 7.11;
  - `cards.css`'s two widths: 7.13;
  - a Post header on `page.hbs`: 10.79.
- **Approaches ruled out:**
  - a hand-written list of gscan's rules, levels or fatal flags;
  - one checker at two specs, or a table of differences standing in for Ghost 5's checker;
  - gscan's HTML, or an exception's text, passed through.
- **Editing a design file (AD-35).** There is no database change, so there is no Schema phase.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A clean theme | the pilot theme plus §73's two scaffold files, on Ghost 5 and on Ghost 6 | `blocked: false`, no error and no warning, `gscan` the major's pin | — |
| Today's pilot theme | the pilot theme as compiled, either major | errors: two `theme_check_rule` findings, `GS050-CSS-KGWW` and `GS050-CSS-KGWF` (ref `styles`), so `blocked: true`. Warnings: one `page_switch_unused` (§ Ruled values) | — |
| Ghost's own verdicts | MEASUREMENTS §13a's probe theme, rebuilt in the test from its description: the clean base theme whose `page.hbs` reads no switch, plus one `{{#get "posts" limit="all"}}` block | the raw reports equal §13a's real Ghosts. 4.49.7 raises one error, `GS110-NO-MISSING-PAGE-BUILDER-USAGE`. 6.4.2 raises two warnings, that one and `GS090-NO-LIMIT-ALL-IN-GET-HELPER` | — |
| A Page with no Post header | the gate test's clean base theme, less its page switch | one warning, `page_switch_unused`, `blocked: false`, on both. On Ghost 5 its detail says Ghost 5's own check counts it an error | — |
| A fatal error | the base theme with a template invoking a partial it lacks | one `theme_check_rule` error for `GS005-TPL-ERR`, `fatal: true`, gscan's message in `detail`, `blocked: true`, on both | — |
| The cascade | a setting whose `visibility` is `"true"` | one `package_check_failed` error naming the setting and its rule, no `GS010-PJ-*` finding, `blocked: true`, on both | — |
| The cascade, one-letter key | `visibility: "x:a"` with a declared key `x` | the same one finding, naming `x` | — |
| A valid visibility | `"accent_choice:a"` | no finding | — |
| `GS100` | the fixture's three settings, read inside a block helper's argument, inside `{{#if}}`, and inside a partial a template invokes | no finding on either checker | — |
| `GS100`'s controls | the partial's invocation removed, or the partial kept but never invoked | one `setting_unused` error naming that key, `blocked: true`, on both, read from each checker's own wording | — |
| A customer's words | `escapeUserText` of each trigger, in text and in an `href`; a layer name holding one, through the boundary comment | neither checker raises any of the five rules, and the decoded text equals the typed text | — |
| Their control | each trigger written raw into the same places | each checker raises its rule (`GS030-ASSET-REQ` on both for a relative `/assets/` address in an `href`) | — |
| Any other rule | a planted `.kg-card-markdown` in a stylesheet | one `theme_check_rule` warning, `GS001-DEPR-CSS-KGMD: …`, with its refs, messages and a docs link; `blocked: false` | — |
| gscan's markup | every finding above | no tag, no `&nbsp;` and no other entity in `message`, `detail` or `action` | — |
| gscan fails | a file that cannot be written; a path that leaves the directory | — | one `theme_check_failed` error, `blocked: true`, no stack. The directory is removed |
| A moved pin | the installed checker's version differs from `GSCAN` | — | one `theme_check_failed` naming both versions. The gate's test fails in CI |
| Determinism | the same files twice, keys in another order | equal verdicts | — |

</frozen-after-approval>

## Code Map

**The compiler: `packages/theme-compiler/`**

- `package.json`:
  - `exports` :6-8;
  - `scripts` :9-12, whose `test` runs `src/**/*.test.ts` alone;
  - `dependencies` :13-16;
  - `devDependencies` :17-23, with `gscan` 6.4.2 at :19.
- `tsconfig.json:6` — `include: ["src"]`, which gains `gate`.
- `src/index.ts:1-14` — the exports. The gate is NOT exported from here, so nothing that only compiles loads gscan.
- `src/compile.ts`:
  - `CompiledTheme` :127, whose `files` the gate takes (`string | Uint8Array`, the fonts being the only bytes);
  - `PAGE_SWITCH` :156-159, and the levels its comment states;
  - `commentPart` :162, the boundary comment's sanitiser, which gains `gscanInert`, and `boundary` :463-464;
  - the final checks :844-860, the pattern of a check over the final text;
  - `checkPageData` :270-274, which is why `GS110-NO-UNKNOWN` cannot fire.
- `src/jsdom.d.ts` — the pattern for `gate/gscan.d.ts`.

**The runtime: `packages/section-runtime/src/`**

- `marks.ts` — `escapeUserText` :52-64, the one door every customer word passes. Its callers are text runs (:274) and link attributes (:155). `gscanInert` goes at its end.
- `index.ts:27` — `escapeUserText` is exported, and `gscanInert` and `GSCAN_INERT` join it.
- `ad36.test.ts` — the AD-5 brace row :274-285 is the pattern for the new pair.
- `agreement.test.ts` — canvas against theme, node by node. It must hold unchanged, because the entities decode to the same text.
- Also through `escapeUserText`, and unchanged in what it shows: `apps/web/lib/ghost-surfaces.ts:188`.

**Lint and workspace**

- `eslint.config.js:45-46` — `CORE` and `NOT_CORE`. Lines :186-239 ban every Node builtin, `process` and dynamic `import()` in core. The runner joins `NOT_CORE`.
- `pnpm-workspace.yaml`:
  - `engineStrict: true` :2, Story 1.1's guard on the project's own Node;
  - `allowBuilds` :10-11, for `dtrace-provider`, which gscan's logger reaches.
- `.npmrc:1`, `.nvmrc` (24), and root `package.json` engines `24.x`.

**Tools**

- `tools/check-snapshots.mjs`:
  - the gscan helper block :752-781: `gscan6` :754, `gscanResults` :756-768, `gscanOr` and `raised` :778-781;
  - three sets of rows move onto `runGscan`, on both checkers: Story 7.2's (:783-791), 7.4's `GS051` rows (:855-861) and 7.6's `GS001-DEPR` rows (:1159-1167);
  - the harness, `check`, `mustThrow` and `mustFail`, :155-175.
- `tools/pilot-theme.mjs`:
  - `HOSTILE_LAYER` and `HOSTILE_TEXT` :43-50, and `CI_WORDS` :106;
  - `pilotProject` :108-134: the page word goes into A4 #13's eyebrow, and the layer word into every layer name;
  - `compilePilots` :140-155.
- `tools/stress/gate.js` — unchanged: the stress fixture's two-checker run, on its own install.
- `tools/probe/record-theme-assembly.py`:
  - the docstring :1-110, whose ":91 gscan reads no `.js`" is false (§ Facts 3);
  - `SECTION` :144, and `COMPILE` :162;
  - `compiled()` :196, `scaffold()` :222 and `gated()` :238. `gated()` calls `record-contexts.py`'s `gate` (:189, `GATE` :49 = `tools/stress/gate.js`);
  - `record()` :427, whose uploads go through `g._multipart('themes/upload/', …)` (:538, :767);
  - `section()` :810, whose MEASUREMENTS text repeats the `.js` claim at :844.
- `tools/doc-audit.py` — the catalogue: the stress gate's row :236-238, and the recorder's :476. `packages/` is not scanned, so the gate's files need no row; a new `tools/` file does.

**The app — read only, since Story 7.18 builds the caller**

- `apps/web/server/ghost-admin/admin-rule.ts`:
  - `AdminEnvelope` :15-20: `code`, `message`, `detail?` and `action?`, each a string, `action` being the sentence that fixes it (as at :84);
  - `ghostCode` :229, which maps Ghost's HTTP answers.
- `apps/web/components/kit/badge.tsx:60-79` — `ResultChip`, "a gscan-style result chip", which is 7.18's.
- `supabase/migrations/20260904120000_complete_schema.sql`:
  - `deploy_jobs` :411-424, with `error jsonb` :420 ("FR-J6's mapped explanation, never a raw stack trace");
  - `deploys` :427-459, with `gscan jsonb` :439.
  No migration is needed.

**Documents**

- `prd.md` — FR-I1 :347 (its DW-341 sentence) and FR-J6 :395.
- `ARCHITECTURE-SPINE.md` — AD-24 :280-284; AD-34 :388-392, with gscan's pairing at :392.
- `VERIFY-AT-BUILD.md:179` — item 31, the bundled versions.
- `MEASUREMENTS.md`:
  - §13 :340-405, whose §13a verdicts the probe-theme row reproduces;
  - §74 and §75, which carry the `.js` claim.
- `epics.md`:
  - Story 7.7's card :3216-3249;
  - 7.10's :3316, 7.18's :3663-3719, 7.20's :3750, 7.27's :3979-4017 and 7.33's :4154-4185;
  - Epic 7's preamble :2886-2928.
- `docs/section-authoring.md` — § 4, "The refusals", :1723, for the authoring note.
- `deferred-work.md` — DW-341 :9256-9274.

## Tasks & Acceptance

**Execution:**

- [x] `packages/theme-compiler/package.json`, `pnpm-lock.yaml`, `packages/theme-compiler/vendor/`:
  - The control comes first: add `"gscan4": "npm:gscan@4.49.7"` and record pnpm's answer on Node 24. Expected: `ERR_PNPM_UNSUPPORTED_ENGINE` (§ Facts 9).
  - Then commit `vendor/gscan-4.49.7.tgz`: the registry tarball, with `package.json`'s `engines.node` alone widened by ` || ^24.0.0`.
  - `vendor/README.md` records the upstream URL, its `dist.integrity`, the date and the command that makes the copy (§ The two checkers). The dependency becomes `"gscan4": "file:vendor/gscan-4.49.7.tgz"`.
  - `"gscan6": "npm:gscan@6.4.2"` joins it in `dependencies`, and the devDependency `gscan` goes.
  - If 4.49.7 requires a package it does not declare (it has only ever run from `tools/stress`'s flat npm install), declare it through `pnpm-workspace.yaml`'s `packageExtensions` and name it in the Dev results.
  - `exports` gains `"./gate": "./gate/index.ts"`, `test` gains `'gate/**/*.test.ts'`, and `tsconfig.json`'s `include` gains `gate`.

  -- AD-34's two checkers, installable on the project's own Node.
- [x] `eslint.config.js` — `NOT_CORE` gains `packages/theme-compiler/gate/gscan.ts`, with a comment beside it: the gate's shell, which writes a temporary directory and calls gscan (AD-34). `verdict.ts` stays core.

  -- AD-1 holds everywhere else.
- [x] `packages/theme-compiler/gate/gscan.ts`, `gate/gscan.d.ts` — `GSCAN`, `runGscan(files, major)` and `installedRules(major)`, per § The two checkers and § What the gate returns. The declarations cover the members used.

  -- the shell.
- [x] `packages/theme-compiler/gate/verdict.ts` — `verdict(report, files, major)`, per § The one mapping.

  -- AD-24's one table.
- [x] `packages/theme-compiler/gate/index.ts` — exports `gscanGate(files, major)`, which is `verdict(await runGscan(…))` and catches any throw into `theme_check_failed`. It also exports `GSCAN`, `runGscan`, `installedRules` and the types.

  -- the door 7.18 and CI use.
- [x] `packages/section-runtime/src/marks.ts`, `index.ts`; `packages/theme-compiler/src/compile.ts` — `GSCAN_INERT` and `gscanInert`, per § A customer's words. `escapeUserText` ends with it, and `commentPart` applies it.

  -- AD-36, at both doors.
- [x] `packages/section-runtime/src/ad36.test.ts` — the pair. Each trigger, through `escapeUserText`, no longer matches its own pattern, and decodes to the typed text. A layer label behaves the same through `commentPart`.

  -- AD-36's rule.
- [x] `tools/record-gscan.mjs`, `tools/doc-audit.py`, `packages/theme-compiler/fixtures/gscan/`:
  - the tool writes `rules-4.49.7.json` and `rules-6.4.2.json` from `installedRules`, per § The two checkers;
  - `README.md` gives each recording's date and command, names MEASUREMENTS §13a as the recording the probe-theme row reproduces, and holds the bump procedure;
  - the tool gets its catalogue row.

  -- AD-23: the recordings the tests read.
- [x] `packages/theme-compiler/gate/gate.test.ts` — on both checkers, against the real pinned gscans:
  - the I/O matrix, row by row;
  - the inventories equal the installed checkers, and a planted level change fails that row;
  - `GSCAN` equals the installed versions;
  - `GSCAN_INERT` holds as § A customer's words states.

  -- what the gate promises.
- [x] `tools/check-snapshots.mjs` — § What CI holds, each row behind its control.

  -- the gate on every commit.
- [x] `tools/probe/record-theme-assembly.py`, `tools/doc-audit.py` — § The T1 run:
  - `SECTION` becomes `76`;
  - the docstring's and :844's `.js` claim is corrected;
  - `gated()` goes through the product gate;
  - the catalogue row says so.

  -- R-82: Ghost's own checker answers as the gate says.
- [x] Documents — apply § Propagated at Dev, then grep for each old wording.

  -- standing rules 3 and 7.

**Acceptance Criteria:**

- **The two checkers.** Given `pnpm install --frozen-lockfile` on Node 24, when the gate loads:
  - `gscan4` is 4.49.7 and `gscan6` is 6.4.2, each equal to `GSCAN`;
  - the Dev results record the registry 4.49.7's refusal, which is the copy's control.
- **The inventories.** Given each pinned checker, when the gate's test runs, then its rules (code, level, fatal, and a regex rule's source) equal its recorded inventory. A planted change to one recorded level fails the test.
- **CI.** Given `check-snapshots`, when it runs, then every row of § What CI holds holds behind its control, on both checkers.
- **Ghost's own answer.** Given T1 and the owner's in-session go, when the recorder runs:
  - § The T1 run's rows hold behind their controls;
  - T1 is restored and read back;
  - MEASUREMENTS §76 records the run.
- **AD-1.** Given `pnpm lint`, then `gate/gscan.ts` is the one gate file outside AD-1's ban, and `verdict.ts` imports no builtin.
- **No screen.** Given Question 2's ruling (option 1, owner, 2026-10-09), when Deploy ends, then the story is Done on its Deploy commit (R-80), and its Pre-flight line and its hand test are in Story 7.18's card word for word.
- **Propagation.** Given Dev's end:
  - FR-J6, FR-I1, AD-24, AD-34, VERIFY-AT-BUILD 31, MEASUREMENTS §74 and §75 (dated corrections) and `docs/section-authoring.md` say what landed;
  - the cards and Epic 7's preamble carry § Propagated at Dev's lines;
  - DW-341 is closed;
  - a grep finds no old wording.

## Spec Change Log

- **2026-10-09, Create (the owner ruled).** Both questions were ruled option 1.
  - The Ruled values table now states the ruled values, and the mapping table's Ghost 5 sentence reads as ruled.
  - Question 1: `page_switch_unused` is a warning on Ghost 5 and Ghost 6 and never blocks. On Ghost 5 its detail says Ghost 5 counts it as an error. DW-341 closes on it at Dev.
  - Question 2: "the Pre-flight step matches S8b as extended" and the card's owner test move word for word to Story 7.18 at Dev (R-195). This story stays `owner_test: none` and is Done on its Deploy commit.
  - The frozen intent is unchanged: each ruling is its recommended option.

## Design Notes

### What the gate returns

```ts
type Major = 5 | 6
interface Finding {      // AD-24's envelope (`AdminEnvelope`'s four fields), then gscan's
  code: string           // Inflozo's own, snake_case
  message: string        // the sentence
  detail?: string
  action?: string        // the action that fixes it, as a sentence
  rule?: string          // gscan's code; absent on theme_check_failed
  level: 'error' | 'warning'
  fatal: boolean         // Ghost refuses the upload (422) on any fatal result
  refs: string[]         // gscan's refs: theme paths, or `styles`
}
interface Verdict { major: Major; gscan: string; blocked: boolean; errors: Finding[]; warnings: Finding[] }
```

- `blocked` is `errors.length > 0`.
- Errors come before warnings, each sorted by `rule`, then by first ref.
- A finding is assignable to `AdminEnvelope` as it stands, so 7.18 stores and shows it without a second shape.
- `runGscan(files, major)` returns gscan's results as data: `{ gscan, results: [{ code, level, fatal, rule, details, failures: [{ ref, message }] }] }`, with recommendations dropped. CI's raw rows read that.

### The one mapping (AD-24)

| gscan | `code` | level | `message` | `detail` | `action` |
|---|---|---|---|---|---|
| `GS110-NO-MISSING-PAGE-BUILDER-USAGE` | `page_switch_unused` | warning on both (§ Ruled values) | The switch that hides a page's title and feature image does nothing on this site. | No page template shows a Post header, which is what the switch hides. On Ghost 5 it adds (Question 1): Ghost 5's own theme check counts this as an error and installs the theme anyway. | To use the switch, add a Post header to your Page template. |
| `GS100-NO-UNUSED-CUSTOM-THEME-SETTING` | `setting_unused` | error | Theme settings declared but used nowhere on your site: {keys}. | Ghost refuses a theme setting no template reads. This is ours to fix, not yours, and nothing was sent to your site. | — |
| the cascade (below) | `package_check_failed` | error | Ghost's theme check can't read when theme setting “{key}” should show, so it reports every package.json rule as broken. | Its rule, “{visibility}”, must name a theme setting at least two characters long. Those package.json errors are not real. This is ours to fix, not yours, and nothing was sent to your site. | — |
| any other rule | `theme_check_rule` | gscan's | {gscan code}: {gscan's rule, plain} | {refs}: {each failure's message, plain} | Ghost's guide: {the first link in gscan's details, else Ghost's theme docs root} |
| gscan failed, a pin moved, a path refused | `theme_check_failed` | error | We couldn't check your theme, so nothing was sent to your site. | for a moved pin only: gscan {installed} is installed where {pinned} is pinned. | Try again in a moment. |

- **The cascade's signature** is an error `GS010-PJ-PARSE` while `package.json` parses.
  - Every `GS010-PJ-*` result is dropped, because gscan's catch marks them all failed (§ Facts 6).
  - One finding per cause takes their place: each setting whose `visibility` is not a string, or names no key under gscan's own test, `/[a-zA-Z_][a-zA-Z0-9_.]+:/` (`010-package-json.js:225`).
  - If no such setting is found, the message is "Ghost's theme check failed while reading package.json, which is valid, so it reports every package.json rule as broken.", and the detail opens with gscan's own message.
  - Every other family stays as gscan reported it.
- **`GS100`'s keys** are read from each checker's failure messages. 4.49.7 writes `Found unused variables: @custom.a, @custom.b`, and 6.4.2 writes one `config.custom.<k> is declared but never referenced from a template` per key.
- **Plain text.** Tags are removed, entities decoded and whitespace collapsed. gscan's message can quote the theme's source, a customer's words among it, so 7.18 renders every field as text.
- **The fallback's docs link** is the first `href` in gscan's `details`, which most rules carry. Otherwise it is Ghost's theme docs root, as 6.4.2's specs write it (`docsBaseUrl`, `lib/specs/v6.js:4`).

### Why the shortlist is these three

**The rule.** A gscan rule is on the shortlist when a project the product lets a customer make can trip it — through what they place, choose or type — with the compiler and the library as specified. Every other rule is guarded below. If one appears anyway, it is shown in the verbatim format, which is what that format is for.

| Family | On the shortlist? | What guards it |
|---|---|---|
| `GS110-NO-MISSING` (the page switch) | **yes** | nothing: a Page template with no Post header is a customer's choice, and it is every project's until Story 10.79 |
| `GS100` | **yes** — the card names it, and it can never fire | 7.10 and 7.11 declare each setting in the change that reads it (7.2's Question 1); the fixture re-proves the trigger |
| the cascade (`GS010-PJ-PARSE`) | **yes** — the card names it | 7.10's builder; the one-letter key goes to 7.10 (§ Propagated) |
| `GS010-PJ-*`: name, version, author, page size, cards, image sizes | no | 7.2's refusals before render, and `IMAGE_SIZES` |
| `GS010-PJ-CUST-THEME-*`, `GS090-NO-UNKNOWN-CUSTOM-THEME-*` | no | 7.9's meter, 7.10's builder, and 7.11's same-change rule |
| every rule written with a mustache: `GS001-DEPR-*`'s mustache forms, `GS005`, `GS080-NO-EMPTY-TRANSLATIONS`, `GS090-*`, `GS120`, `GS130`, `GS005-NO-INLINE-DYNAMIC-PARTIAL` | no | a customer's braces ship as entities (AD-5). The compiler's own lines, partials and helpers are a closed set. The library uses no helper Ghost 5 lacks (`split` is refused, `vocabulary.ts:749`), and its limits run 1 to 100 (`data-repeat-limit`). CI holds the library (7.6's row now; every design at 7.33). D13's lint and the escaper drop a NUL |
| the five brace-free text rules | no, once inert | § A customer's words |
| `GS001-DEPR-AMP-TEMPLATE` | no | a typed `<` ships as `&lt;` |
| `GS001-DEPR-CSS-*` | no | no customer word reaches a stylesheet; `cssPart` takes library names |
| `GS110-NO-UNKNOWN` | no | `checkPageData` |
| `GS020` (index, post) | no | 7.3 compiles every standard template |
| `GS030-ASSET-SYM` | no | a theme the compiler writes holds no symlink |
| `GS040` (head and foot) | no | `checkGhostMarkup` (7.6) |
| `GS050-CSS-KG*` | no | `cards.css` (7.13). Today's pilot theme shows the two widths through the fallback, and DW-334 gives them to 7.13 |
| `GS051` | no | `screen.css` declares AD-18's two variables (7.4) |
| `GS070` | no | FR-Q8's validation and the compile's own (7.12) |
| `GS080-FEACH-*`, `GS080-CARD-LAST4` | no | they run only under `engines["ghost-api"]: "v3"`, which 7.2 never writes |

### A customer's words never reach gscan (AD-36)

- gscan reads a theme's `.hbs`, `.css`, `.js` and `.json` text. It matches some rules by regular expression over the whole file, comments and attributes included (§ Facts 3, 7).
- A customer's words reach that text in two places:
  - `escapeUserText`, for every text run and link attribute (AD-5's door);
  - the boundary comment, whose layer name `commentPart` cleans.
  Slugs drop everything outside `[a-z0-9-]`, and no customer word reaches a stylesheet or a script.
- Five rules can match there with no brace at all (executed on both checkers, § Facts 7). One character of each match is written as its numeric entity:

| Rule | gscan's pattern | Written as | Level on 4.49.7 · 6.4.2 |
|---|---|---|---|
| `GS001-DEPR-CURR-SYM` | `/currency_symbol/g` | `currency&#95;symbol` | error · error |
| `GS001-DEPR-SITE-LANG` | `/@site\.lang/g` | `&#64;site.lang` | error · error |
| `GS001-DEPR-LABS-MEMBERS` | `/@labs\.members/g` | `&#64;labs.members` | error · error |
| `GS060-JS-GUA` | `/ghost\.url\.api/g` | `ghost&#46;url.api` | error · error |
| `GS030-ASSET-REQ` | an `src` or `href` value holding `/assets/` | `&#47;assets/` | warning · warning (4.49.7 also reads `https://…/assets/…`) |

- **The order.** `gscanInert` runs after `escapeUserText`'s own escaping, so the `&` it writes is never escaped again.
- **What a visitor sees.** A browser decodes each entity to the typed character, in text and in an attribute. So the page reads exactly the typed words, and so does the canvas, which parses the same serialiser's output. In a Handlebars comment, which nothing renders, the entity stays as written.
- **The pattern table is `GSCAN_INERT`, beside `escapeUserText`.** Each entry names its rule and carries a witness. The gate's test holds two things on the real pinned checkers:
  - each witness trips its rule raw, and not once it is inert;
  - for the four whole-word rules, the pattern equals the rule's recorded regex. `GS030-ASSET-REQ`'s recorded regex is the whole attribute form, which differs between the checkers, so its entry is held by its witness alone.
- **The ceiling, stated in a comment beside the table.** The list's completeness rests on this Create's analysis (§ Facts 7). A pin move re-records the inventories, and the README's bump procedure re-derives the list. A rule the list misses would show in the verbatim format, never as a stack trace.
- **Left out on purpose:**
  - `GS001-DEPR-AMP-TEMPLATE`: a typed `<` is already `&lt;`;
  - `GS080-CARD-LAST4`: it never runs at the `engines` 7.2 writes;
  - a NUL: `escapeUserText` already drops it.

### The two checkers, pinned (AD-34, R2-2)

```ts
export const GSCAN = {
  5: { pkg: 'gscan4', version: '4.49.7', checkVersion: 'v5', ghost: '5.130.6' },  // the gscan Ghost 5.130.6 pins
  6: { pkg: 'gscan6', version: '6.4.2', checkVersion: 'v6', ghost: '6.58.0' },    // the gscan Ghost 6.58.0 pins
} as const
```

- **`runGscan`**:
  - first compares the installed `package.json` version with the pin;
  - writes `files` into `mkdtemp(join(tmpdir(), 'inflozo-gscan-'))`, text as UTF-8 and bytes as they are, refusing a path that resolves outside that directory;
  - runs `check(dir, { checkVersion })`, then `format(theme, { checkVersion })`;
  - removes the directory in a `finally`.
- **The copy of 4.49.7.** `vendor/README.md` records:
  - the upstream URL, `https://registry.npmjs.org/gscan/-/gscan-4.49.7.tgz`, and its `dist.integrity`;
  - the date;
  - the command that makes the copy. It unpacks the tarball, adds ` || ^24.0.0` to `engines.node`, and repacks with sorted names, a fixed date and a numeric owner, so the bytes are reproducible.

  Nothing else in the copy differs from upstream. A review re-runs the command and compares.
- **The inventories.** `installedRules(major)`, beside `runGscan` in `gate/gscan.ts`, reads the pinned package's own spec for its `checkVersion`: `lib/specs/v5.js` for 4.49.7 and `v6.js` for 6.4.2, each of which merges its predecessors. It returns `{ <code>: { level, fatal, regex? } }`, where `regex` is a regex rule's `String(regex)`. It lives in the shell file because reading a package's own file is I/O.
  - `tools/record-gscan.mjs` writes it, through Node 24's type stripping, to `fixtures/gscan/rules-<version>.json` as `{ gscan, checkVersion, ghost, captured, command, rules }`.
  - The test compares `installedRules` with these files.

  A pin cannot move without its inventory being re-recorded in the same commit.
- **The bump procedure**, in `fixtures/gscan/README.md`, is what FR-J6's version policy becomes:
  1. move `GSCAN` and `package.json` together, re-making Ghost 5's copy by its command;
  2. re-record both inventories;
  3. re-derive `GSCAN_INERT` (§ A customer's words);
  4. re-run Story 7.33's lane over the whole library;
  5. ship it as a library release (Story 7.27).

  Steps 4 and 5 are those stories' to build, and each card gains the line (§ Propagated at Dev).
- **`GS100`'s fixture** is in `gate.test.ts`, built from the clean base theme. It declares three settings in `config.custom`, shaped as FR-Q5's built-ins:
  - `color_scheme`, a select, read in `<body>`'s class through `{{#match @custom.color_scheme "Dark"}}`;
  - `dark_accent_color`, a colour, read inside `{{#if @custom.dark_accent_color}}` in `default.hbs`;
  - `dark_logo`, an image with no default, read inside a partial that `default.hbs` invokes.

  Neither checker raises anything. There are two controls, each a `setting_unused` naming `dark_logo`: the invocation removed, and the partial kept but never invoked (an orphan partial does not count).
- **The clean base theme** is the smallest theme both pinned checkers pass at 0/0. That premise is its own test row.

### What CI holds

`check-snapshots`' rows. Each control fails first.

1. **The existing gscan rows run on both checkers through `runGscan`.** Each row is named per checker:
   - 7.2's "no `GS010-*` or `GS100-*`", with its `posts_per_page "12"` control;
   - 7.4's "no `GS051`", with its control;
   - 7.6's "no `GS001-DEPR-*`", with its `{{@blog.title}}` control.
2. **The pilot theme's verdicts**, on Ghost 5 and on Ghost 6:
   - the errors are exactly two `theme_check_rule` findings, `GS050-CSS-KGWW` and `GS050-CSS-KGWF`, so `blocked` is true;
   - the warnings are exactly one, `page_switch_unused`.

   Control: the pilot theme plus §73's two scaffold files gives an empty, unblocked verdict on both. The files are D12's widths in `assets/css/cards.css`, labelled Story 7.13's, and a `page.hbs` reading the switch, labelled Story 10.79's.
3. **A customer's words.** `compilePilots` takes `pageWord` holding the four error words and `layerWord` `currency_symbol`, so A4 #13's eyebrow and every boundary comment carry them. Neither checker raises `GS001-DEPR-CURR-SYM`, `-SITE-LANG`, `-LABS-MEMBERS` or `GS060-JS-GUA`.

   Control: the same words written raw into `post.hbs` raise each rule on both.

### Ruled values: Questions 1 and 2

Both were ruled option 1 by the owner on 2026-10-09.

| Question | Ruled: what this spec builds |
|---|---|
| Q1 · `GS110` on Ghost 5 | `page_switch_unused` is a **warning** on Ghost 5 and on Ghost 6, and never blocks. On Ghost 5 its detail adds "Ghost 5's own theme check counts this as an error and installs the theme anyway." DW-341 closes on it |
| Q2 · Pre-flight and the hand test | Story 7.7 has no screen (`owner_test: none`), and is Done on its Deploy commit. "**And** the Pre-flight step matches S8b as extended." and the card's owner test move word for word to Story 7.18, with Epic 7's R-195 list |

### Settled here as readings, each told to the owner in one line

1. **Each Ghost version is judged by its own checker.** This is your ruling R2-2 (2026-08-19) and AD-34. FR-J6's "one gscan" sentence predates it and is corrected at Dev.
2. **Ghost 5's checker is installed from a copy of its npm package whose one change is the Node versions it says it supports.** pnpm refuses the original on our Node 24 (read in pnpm's code). It already runs on Node 24: Story 7.6's review ran it there.
3. **The shortlist is derived, not chosen, and it is three rules.** Every other rule is held off by a check that already exists, and is shown in the plan's verbatim format if it ever appears.
4. **Your customers' words never trip the checker.** Five trigger words are written with one character as an HTML code, which every browser shows as the typed character (AD-36).
5. **An error blocks and a warning ships, after mapping.**
   - Ghost's "fatal" mark rides on each finding, so Story 7.18 knows when Ghost would refuse the upload.
   - gscan's "recommendations" are not shown, since Ghost's own upload answer has none.
6. **A gscan version change can never be silent:** exact pins, recorded rule lists and a test. Its "library release" is Story 7.27's, and its full re-run 7.33's; each card gains the line.
7. **Four items go to the stories that make those calls:**
   - Ghost's raw `500` when two uploads of one name collide: Story 7.18, the upload;
   - carrying both checkers inside the deploy function on Vercel: 7.18;
   - one code for `GET /themes/` without a staff token: 7.20;
   - setting keys of at least two characters: 7.10.
8. **Two corrections.** gscan does read a theme's JavaScript, which the recorder said it didn't. And Ghost leaves warnings out of its answer in production.

### Facts this spec rests on (standing rule 1)

Read in source, or executed locally, at this Create (2026-10-09). The sources:
- gscan 4.49.7 and 6.4.2, as installed in `tools/stress/node_modules/gscan4` and `gscan6`;
- Ghost 5.130.6 and 6.58.0, from their npm tarballs, whose shasums matched the registry;
- pnpm 11.22.0, from corepack's copy.

Paths under `g4/` and `g6/` are the two gscans' `lib/`. Paths under `G5/` and `G6/` are Ghost's `core/server/services/themes/`. Dev re-executes each fact through the gate's tests and the T1 run.

1. **Ghost pins the gscan it runs, exactly:** 5.130.6 pins 4.49.7, and 6.58.0 pins 6.4.2 (each tarball's `package.json`). This agrees with VERIFY-AT-BUILD 31.
2. **Ghost at upload:**
   - it runs gscan at `` `v${major}` `` (`G5|G6/validate.js:52`), then `format` with `onlyFatalErrors: false`;
   - in production it empties the warnings: "In production we don't want to show warnings" (`G6/validate.js:83-85`, `G5 :79-81`);
   - a fatal result throws `ThemeValidationError`, `Theme "{name}" is not compatible or contains errors.`, as a `422` whose `errorDetails.errors` is every error-level result (`G6 :128-158`, `G5 :124-154`);
   - anything else saves the theme and returns it with its `errors` and `warnings` on `themes[0]` (`to-json.js`, `storage.js`);
   - non-fatal errors never stop an upload or an activation.
3. **gscan's API** (`index.js`, `checker.js`, `format.js` and `read-theme.js`, in both versions):
   - `check(dir, { checkVersion })` needs a directory on disk.
   - `format(theme, { checkVersion })` fills `results.error`, `warning` and `recommendation` with `{ code, level, rule, details, fatal, failures: [{ ref, message? }] }`, and sets `hasFatalErrors`. It must take the `checkVersion` that `check` took, or it throws (`format.js:48-50`).
   - `rule` and `details` carry HTML (`<code>`, `<a>`, `<br>`, `&nbsp;`), and a failure message can quote theme source.
   - gscan reads the contents of `.hbs`, `.css`, `.js`, `.json` and `package.json` files (`g4/read-theme.js:91`, `g6/read-theme.js:94`). So `.js` is read, for `GS060-JS-GUA`.
   - Under `os.tmpdir()`, gscan deletes the entries it ignores (`g4/read-theme.js:27-28, 60-67`; `g6/read-theme.js:30-31, 63-70`). Executed: 4.49.7 deleted `.git` and `node_modules`, and 6.4.2 also deleted `CLAUDE.md` and `AGENTS.md`.
   - It makes no network call and starts no process.
4. **The two inventories differ:**
   - `GS110-NO-MISSING` is an error on 4.49.7 and a warning on 6.4.2;
   - `GS110-NO-UNKNOWN` is a fatal error on 4.49.7 and a warning on 6.4.2;
   - the three `GS050-CSS-KGVID*` rules exist on 4.49.7 alone;
   - `GS005-NO-INLINE-DYNAMIC-PARTIAL`, `GS090-NO-INVALID-CONDITIONAL-ARGUMENTS`, `GS130-NO-RECURSIVE-LAYOUT` and `GS090-NO-LIMIT-*` exist on 6.4.2 alone;
   - 6.4.2 knows seven more helpers (`g6/specs/v6.js:11`).

   Counts are the recordings', never written here.
5. **`GS100`** (`specs/v4.js:210`) is an error, not fatal.
   - It counts a setting as used when a two-part `@custom.<key>` path appears in a template that is not under `partials/`, or in a partial such a template reaches.
   - 6.4.2 also counts a path inside a `{{#get}}` filter, and 4.49.7 does not.
   - The wordings are the ones § The one mapping quotes.
6. **The cascade.** `010-package-json.js` is the same file in both versions.
   - Line 225 calls `.map` on `visibility.match(/[a-zA-Z_][a-zA-Z0-9_.]+:/)`, which is `null` for a rule that names no key of two or more characters. A non-string throws there too.
   - The catch at :372-381 then marks every validated `package.json` rule failed, with `GS010-PJ-PARSE` carrying `Cannot read properties of null (reading 'map')`.
   - Executed on both checkers:
     - `"true"`, `"a:true+b:false"`, the boolean `true`, and `"x:a"` with a declared key `x` each cascade;
     - `"accent_choice:a"` and `""` are clean;
     - `"other_key:x"` raises `…-VISIBILITY-VALUE` alone, and `"accent_choice:"` raises `…-VISIBILITY-SYNTAX` alone.
   - Nothing in the cascade is fatal, so Ghost installs such a theme and lists the errors.
7. **Brace-free rules.** Each rule's regular expression was analysed for whether every match needs a `{`. Each "no" was then confirmed with a witness string, run end to end through both checkers.
   - In template text: the five rules of § A customer's words, plus `GS001-DEPR-AMP-TEMPLATE` (6.4.2 alone, which needs a literal `<html amp`) and `GS080-CARD-LAST4` (only under `engines["ghost-api"]: "v3"`).
   - In stylesheets: `GS001-DEPR-CSS-AT`, `-PATS` and `-KGMD`.
   - A NUL byte makes `GS005-TPL-ERR` fatal.
   - Executed: `<p>Pay in currency_symbol today</p>` raises `GS001-DEPR-CURR-SYM` on both checkers, an error that is not fatal.
8. **The pilot theme today**, compiled as CI compiles it (Node 24.18.1):
   - 4.49.7 raises three errors: `GS050-CSS-KGWW` and `-KGWF` (ref `styles`), and `GS110-NO-MISSING` (ref `page.hbs`);
   - 6.4.2 raises the two `GS050` errors, and `GS110-NO-MISSING` as a warning;
   - neither is fatal, and §73's scaffold answers all three.
9. **pnpm refuses an engine mismatch before any hook.**
   - pnpm 11.22.0's `packageIsInstallable` throws an `UnsupportedEngineError` when `engineStrict` is on and the dependency is not optional.
   - It checks the registry manifest inside `resolveAndFetch`, before `readPackageHook` runs on it. `packageExtensions` extends dependency fields only.
   - gscan 4.49.7 declares `engines.node` `^14.18.0 || ^16.13.0 || ^18.12.1 || ^20.11.1 || ^22.13.1`.
   - It is the only package in its whole dependency tree that excludes Node 24 (both trees read from `tools/stress`'s lock file).
10. **Size** (measured 2026-10-09). Installed, the two trees together run to hundreds of packages. `check` and `format` load 567 files from 114 packages on 4.49.7, and 259 files from 22 packages on 6.4.2. Whether the deploy function carries both within Vercel's limit is Story 7.18's to prove.

### The T1 run: `tools/probe/record-theme-assembly.py`, §76

It is §75's run on this tree, with these rows added. `gated()` calls `gscanGate` on both checkers through Node 24, as `compiled()` calls `tools/pilot-theme.mjs`.

1. **A customer's words on a real Ghost.**
   - The run's page word gains the four error words after its nonce, and its layer word carries `currency_symbol`.
   - The uploaded templates carry the entity forms.
   - `/` renders A4 #13's eyebrow as exactly the typed words.
   - The local gate gives an empty verdict on both checkers.
   - Premise: every earlier row finds `/` by the page word, so the nonce stays its first part.
2. **Ghost 6's own checker agrees with the gate.** There are three probe uploads, each under its own name. None is activated. Each is deleted in a `finally` that encloses its upload, and the active theme is read back after each.
   1. *The compiled pilot theme, unscaffolded.* T1 answers `200`. The `errors` on its theme record carry the same codes and `fatal` flags as `runGscan(files, 6)`'s errors (`GS050-CSS-KGWW`, `-KGWF`).
      - Its `warnings` are empty in production (§ Facts 2), while the gate reports `GS110-NO-MISSING`. The row records both, and reads Ghost's empty list as that premise.
      - If T1 does return warnings, they must match too.
   2. *A fatal probe:* the pilot theme plus `custom-probe-fatal.hbs` invoking `{{> "no-such-partial"}}`.
      - T1 answers `422 ThemeValidationError`.
      - Its `errorDetails.errors` codes equal the gate's: `GS005-TPL-ERR`, fatal, with the two `GS050`s. The gate's verdict is blocked.
      - `GET themes/` lists no such theme.
   3. *The cascade probe:* the pilot theme with `config.custom.probe_setting`, a two-option select whose `visibility` is `"true"`, read once in `default.hbs`.
      - T1 answers `200`, with `GS010-PJ-PARSE` and the cascade: the same codes as `runGscan`'s.
      - `gscanGate` returns one `package_check_failed`, naming `probe_setting`.
      - Premise: the active theme's custom settings read the same before and after.
3. **Earlier rows.** Stories 7.1–7.6's rows and §72's paywall probes hold again.
4. **What it writes:**
   - §75's uploads, activations and deletes;
   - the three probe uploads and their deletes;
   - the one `w750` rendition.

   The Ghost 5 half is DW-326's (R-238).

### Propagated at Dev

- **`prd.md`:**
  - FR-J6: a dated note covering:
    - the two checkers and their pins (AD-34, R2-2), in place of "one pinned gscan version";
    - the shortlist as derived, and the verbatim format as built;
    - the cascade's real cause: a `visibility` naming no key of two or more characters, every `package.json` rule failed on both checkers (its "~19" was a different gscan's count);
    - a customer's words made inert;
    - Question 1 as ruled;
    - the bump procedure.
  - FR-I1: its DW-341 sentence, as Question 1 rules.
- **`ARCHITECTURE-SPINE.md`:**
  - AD-24: the table's home is `@inflozo/theme-compiler/gate`'s `verdict`;
  - AD-34: the gate's shell file and its core file, the copy of 4.49.7, and the inventories as AD-23 recordings.
- **`VERIFY-AT-BUILD.md`, item 31:** re-read on 2026-10-09 in the npm tarballs; the pins are held by the gate's test.
- **`MEASUREMENTS.md`:** a dated correction under §74 and §75, that gscan reads `.js`; §76, written by the recorder.
- **`docs/section-authoring.md` § 4:** a design's own markup never holds the five brace-free trigger words, or an `/assets/` address outside `{{asset}}`, because gscan refuses them without a mustache. The runtime makes a customer's words inert.
- **`epics.md`:**
  - Story 7.7's card, as landed: its Owner test and Frame as Question 2 rules, and its Verification as "gscan 4.49.7 at `v5` and 6.4.2 at `v6`; T1";
  - Story 7.18's card:
    - Question 2's moved text, word for word;
    - the upload's concurrent-name `500` (`EEXIST … mkdir '/var/…'`) mapped to AD-24's own sentence and never passed through;
    - the deploy function carrying both pinned checkers, proved on Vercel;
  - Story 7.20's: `GET /themes/` without the staff token (`501` on Ghost 5, `403` on Ghost 6) is read as one Inflozo code (VERIFY-AT-BUILD 9);
  - Story 7.10's: a setting key is at least two characters (§ Facts 6);
  - Story 7.27's: a gscan pin moves only as a library release;
  - Story 7.33's: a pin move re-runs this lane over the whole library before it lands;
  - Epic 7's preamble: "Moved from Story 7.7 by its Question 2" and "Given owners by Story 7.7's Create", each a numbered list (R-195).
- **`deferred-work.md`:** DW-341, closed with Question 1's ruling.
- **`epic-7-context.md`:** a sub-bullet for each of the above.
- **Last:** grep for each of these:
  - "Inflozo pins one gscan";
  - "gscan reads no";
  - "~19";
  - "gscan 6.4.2 against both";
  - DW-341's "is Story 7.7's".

### The commits

There is no migration, so there is no Schema phase. `Story 7.7 - Dev - …` carries:
- the code, the copy of 4.49.7, the fixtures, the tools and the documents;
- §76, if the T1 run happens in the Dev session on the owner's go.

## Owner's manual test

None. Question 2 was ruled option 1 (owner, 2026-10-09), so this story has no screen: no frame and no hand test, and it is Done on its Deploy commit (R-80). The automated checks prove the sentences, and T1 proves that Ghost's own checker answers as the gate says. The Pre-flight line and its hand test are Story 7.18's, word for word.

## Questions for the owner

Both were ruled option 1 (owner, 2026-10-09). Dev builds Design Notes § Ruled values as it stands.

### Question 1 — When Ghost 5's checker calls something an error but installs the theme anyway

**In plain English.**
- Ghost has a switch in each page's settings that hides that page's title and main picture.
- Ghost's theme checker looks for a theme that ignores the switch:
  - Ghost 6's checker calls it a **warning**;
  - Ghost 5's checker calls it an **error**, and still installs the theme.
- A theme ignores the switch when your Page template has no Post header section, because the Post header is what the switch hides.
- Until Story 10.79 adds Post headers that can sit on a Page, every project is in that state.
- The plan says every error stops a deploy. Taken literally, no Ghost 5 site could deploy until Story 10.79. Afterwards, a Ghost 5 site whose pages show no title never could.

**Example.** A Ghost 5 site whose Page template is a hero and a newsletter section presses Ship it.
- With option 1, Pre-flight shows one warning: "The switch that hides a page's title and feature image does nothing on this site". It adds that Ghost 5 counts this as an error but installs the theme anyway, and Ship it works.
- With option 2, Pre-flight stops on the same sentence, and Ship it stays greyed.
- On a Ghost 6 site, both options show the warning, and Ship it works.

1. **A warning on both Ghost versions, never blocking.** Ghost 5 customers are told plainly that Ghost 5 counts it as an error. **(RECOMMENDED)**
2. **Block it on Ghost 5 only,** as the plan's "errors block" reads. No Ghost 5 site can deploy until Story 10.79, and afterwards only once its Page template has a Post header.
3. **Block it on both Ghost versions.** Every site waits for Story 10.79, and a site whose pages show no title can never deploy.

**Ruled: option 1 (owner, 2026-10-09).**

### Question 2 — Where you first see these sentences, and when you test them

**In plain English.**
- This story builds the checker and its sentences, but nothing on screen shows them yet.
- They appear in the deploy screen's check step, Pre-flight, drawn as S8b: "Checking your theme (Ghost will love it) — 0 errors · 2 warnings". Story 7.18 builds that screen, together with the server step that builds your theme from your project.
- Story 7.18 already has to match S8b. The plan also gave this story a hand test of the check's rows.
- Under Question 1's recommended answer, nothing you can do by normal use produces a blocking error, because an existing check keeps each one out. So a hand test can show a warning, and the automated checks prove the blocking path either way.

**Example.** In Story 7.18 you press Ship it on a project whose Page template has no Post header. Pre-flight shows "0 errors · 1 warning" with the warning's sentence, and Ship it still works.

1. **Move this story's Pre-flight line and its hand test, word for word, to Story 7.18.** This story then has no screen, and it is done when it deploys green. The automated checks and our test Ghost site prove its sentences. **(RECOMMENDED)**
2. **Build the check step now** (S8b, opened from Ship it, with shipping itself greyed until Story 7.18), so you test the sentences by hand in this story. This makes the story several times bigger, because it pulls Story 7.18's server-side build of your theme into this one.

**Ruled: option 1 (owner, 2026-10-09).**

## Verification

**Commands:**

- `pnpm install --frozen-lockfile` (Node 24) — expected: it installs, with `gscan4` 4.49.7 from `vendor/` and `gscan6` 6.4.2.
- `pnpm check` — expected: green. That covers:
  - lint, with the runner the one gate file outside AD-1's ban;
  - the typecheck, `gate/` included;
  - every package's tests, among them `gate.test.ts`'s rows on both checkers (the I/O matrix, the inventories, the pins and `GSCAN_INERT`) and `ad36.test.ts`'s new pair;
  - `check-baseline`;
  - `check-snapshots`, with § What CI holds behind each control.
- `cd tools/stress && npm install && node build.js && node gate.js theme` — expected: 0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6), unchanged.
- The recorder's local half (`compiled()`, then `scaffold()`, then `gated()` through the product gate) — expected: an empty, unblocked verdict on both checkers.
- `python3 tools/probe/record-theme-assembly.py`, on the owner's in-session go, in the main session — expected:
  - every §76 row holds behind its control on T1 `ghost6.inflozo.com` (6.58.0);
  - T1 is restored and read back.
- `python3 tools/doc-audit.py --check`, twice — expected: PASS.

**Manual checks:**

- The pilot theme's two verdicts read as § What CI holds lists them.
- The copy of 4.49.7, unpacked, differs from the registry tarball in `package.json`'s `engines.node` alone: re-run `vendor/README.md`'s command and compare.
- No snapshot and no render-matrix baseline moved.

**Real infrastructure (R-82):**

- T1, through the recorder: Ghost 6's own checker against the gate.
- Both pinned checkers, locally and in CI.
- Vercel: CI's `check`, `rls` and `deploy` green, and the deployment READY at the head. The app's code is unchanged; the escaper's entities decode to the same text on the canvas.
- There is no migration, and no Supabase, Resend or Dodo surface. The gate has no product caller until Story 7.18.

**Dev results (2026-10-09, main session, on the owner's in-session go for the T1 writes):**

- **The install (AC "The two checkers").**
  - The control ran first: `"gscan4": "npm:gscan@4.49.7"` under `pnpm install` on Node 24.18.1 and pnpm 11.22.0 answered `ERR_PNPM_UNSUPPORTED_ENGINE` — "Your Node version is incompatible with "gscan@4.49.7". Expected version: ^14.18.0 || ^16.13.0 || ^18.12.1 || ^20.11.1 || ^22.13.1. Got: v24.18.1" (recorded in `packages/theme-compiler/vendor/README.md`).
  - So `gscan4` is `file:vendor/gscan-4.49.7.tgz`; `gscan6` is `npm:gscan@6.4.2`; the devDependency `gscan` is gone. `pnpm install --frozen-lockfile` installs both. No `packageExtensions` and no new `allowBuilds` entry were needed.
  - The copy, unpacked, differs from the registry 4.49.7 (as installed in `tools/stress/node_modules/gscan4`) in `package.json`'s `engines.node` line alone (`diff -r`, re-run in the main session). The README's command, run twice by the implementation pass, gave identical bytes; its sha256 is in the README.
  - `GSCAN` equals both installed versions (`gate.test.ts`).
- **The one line the permission classifier held.** The implementation subagent's edit ending `escapeUserText` with `gscanInert` was refused by the session's permission classifier. The owner approved it in this session (2026-10-09), and it was made in the main session. It adds escaping and removes none; `agreement.test.ts` held unchanged, and no snapshot or render-matrix baseline moved (`check-snapshots` PASS against the committed snapshot files).
- **`pnpm check` (Node 24.18.1)** — exit 0: lint (with `gate/gscan.ts` the one gate file in `NOT_CORE`), the typecheck with `gate/`, and every package's tests, among them `gate/gate.test.ts`'s rows on both real pinned checkers, `ad36.test.ts`'s pair, and `compile.test.ts`'s `(7.7)` layer-name row. `check-snapshots` printed every gscan row `ok` after its control, on gscan 4.49.7 at `v5` and 6.4.2 at `v6`:
  - 7.2's "no `GS010-*` or `GS100-*`" (control: `posts_per_page "12"` raised `GS010-PJ-CONF-PPP-INT`), 7.4's "no `GS051`" (control: AD-18's two `var()` forms taken out raised `GS051-CUSTOM-FONTS`) and 7.6's "no `GS001-DEPR-*`" (control: `{{@blog.title}}` raised `GS001-DEPR-BLOG`), now through `runGscan`;
  - the pilot theme's verdicts: blocked on exactly `GS050-CSS-KGWF` and `-KGWW` (ref `styles`), warned on exactly `page_switch_unused`, whose Ghost 5 detail carries Question 1's sentence; control: the pilot theme plus `SCAFFOLD` gave an empty, unblocked verdict on both;
  - a customer's words in A4 #13's eyebrow and every layer name raised none of the four rules; control: the same words raw in `post.hbs` raised each of them on both.
- **`tools/stress`** — `node build.js && node gate.js theme`: 0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6), unchanged.
- **The recorder's local half**, run from a scratch script before T1 (no T1 call): the scaffolded pilots and both paywall probes gave an empty, unblocked verdict on both checkers; the three probe trees gave the expected verdicts (pilot: `GS050` ×2 blocked, `page_switch_unused`; fatal: `GS005-TPL-ERR` fatal plus the two `GS050`s; cascade: one `package_check_failed` naming `probe_setting`); the uploaded templates carried each inert form and no raw word; control: the words raw in `post.hbs` raised `GS001-DEPR-CURR-SYM`, `-LABS-MEMBERS`, `-SITE-LANG` and `GS060-JS-GUA` on both.
- **T1 `ghost6.inflozo.com` (Ghost 6.58.0)** — `python3 tools/probe/record-theme-assembly.py`, keys read in-process by variable name (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY` in `tools/probe/.env`), never printed. Exit 0, every row PASS and none failed, MEASUREMENTS §76 written:
  - `/` rendered A4 #13's eyebrow as exactly `Page<nonce> currency_symbol @site.lang @labs.members ghost.url.api`, from templates carrying only the inert forms;
  - the unscaffolded pilot probe: `200`, its theme record's `errors` `[GS050-CSS-KGWF, GS050-CSS-KGWW]`, not fatal, equal to `runGscan(files, 6)`'s; its `warnings` `[]` in production while the gate reports `GS110-NO-MISSING` (the premise, recorded);
  - the fatal probe: `422 ThemeValidationError`, `errors[0].details.errors` equal to the gate's — `GS005-TPL-ERR` fatal with the two `GS050`s; the gate's verdict blocked; `GET themes/` listed no such theme (the `finally`'s delete answered `404`, as nothing was installed);
  - the cascade probe: `200` with `GS010-PJ-PARSE` and the cascade, the same codes and flags as `runGscan`'s; `gscanGate` returned one `package_check_failed` naming `probe_setting` and no `GS010-PJ-*` finding; the active theme's custom settings read the same before and after;
  - Stories 7.1–7.6's rows and §72's paywall probe and control held again;
  - the active theme was read back as `casper` after every upload, and every probe theme was deleted (installed after: `casper`, `racer`, `source`). The run reused this month's probe picture, so no picture was uploaded.
  - The Ghost 5 half is DW-326's (R-238).
- **Matrix audit** — every I/O row maps to a check that ran:
  - a clean theme and today's pilot theme: `check-snapshots`' 7.7 rows and their control, on both checkers (and `gate.test.ts`'s clean base theme at 0/0);
  - Ghost's own verdicts (§13a), a Page with no Post header, a fatal error, the cascade, the one-letter key, a valid visibility, `GS100` and its two controls, their control, a customer's words in text and in an `href`, any other rule (`GS001-DEPR-CSS-KGMD`), gscan's markup, gscan fails (an unwritable file and a path leaving the directory, the directory removed), a moved pin, determinism: `gate/gate.test.ts`'s rows of those names, on both real checkers;
  - the layer-name half of "a customer's words": `compile.test.ts`'s `(7.7)` row, since the runtime package cannot reach `commentPart` — the spec placed it in `ad36.test.ts`, whose pair holds the `escapeUserText` half.
- **One narrowing to know at Review.** `runGscan` drops gscan's recommendations, as the spec says, so 7.2's "no `GS010-*` or `GS100-*`" row no longer sees the recommendation-level `GS010-PJ-*` rules it saw at any level before; Ghost's own upload answer carries none, and `compile.test.ts` still holds the page-size refusals.
- **Vercel, Supabase, Resend, Dodo** — not touched at Dev. No migration, and no Supabase, Resend or Dodo surface. CI's `check`/`rls`/`deploy` (the first install of `gscan4` from `vendor/` on CI's runner) and the deployment's READY state are read at Review.
