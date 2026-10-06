---
title: 'Story 7.2 — `package.json` emission'
type: 'feature'
created: '2026-10-06'
status: 'done'
owner_test: none
review_loop_iteration: 0
baseline_commit: 'e816a183cc2b8454badb364baf490ff55055ef0c'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, every theme Inflozo compiles carries its settings file, `package.json`. Ghost reads that file to learn the theme's name and version, how many posts a page lists, which picture sizes to make, and whether to style the cards authors put in posts. The file also carries a small mark that will later stop Inflozo from ever mistaking one of its own themes for the theme you had before Inflozo. Nothing changes on any screen, so there is nothing for you to test by hand, but three choices in this file are yours: see "Questions for the owner".

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:**
- `compileTheme` (Story 7.1) emits the templates, the partials and `screen.css`, but no `package.json`. Ghost's checker refuses a theme without one (`GS010-PJ-REQ`, an error on both gscans).
- Story 7.1's recorder has been uploading a hand-written `package.json` in its place.
- FR-J13's marker, the field Story 7.20 gates restore on, has no emitter (DW-335).

**Approach:** `compileTheme` writes `package.json` into the tree it returns. The file holds:
- FR-J2's keys in one fixed order, built from what the compile is handed: the theme's name and version, the project's name, `postsPerPage` and the designed cards. Anything Ghost's checker would refuse is refused first, by name.
- The normative `image_sizes` map. Every `size=` the emitted templates pass is checked against it.
- FR-J13's marker.

Three values are the owner's (Questions 1–3). The spec builds the recommended options from one table, Design Notes § Ruled values.

## Boundaries & Constraints

**Always:**

- **Pure and deterministic (AD-1, AD-14).**
  - `package.json` is `JSON.stringify(object, null, 2)` plus one LF: two-space indentation, no tab and no trailing whitespace (rule 1 of the formatting contract).
  - The keys follow Design Notes' order. A conditional key is omitted, never moved (verify-mechanical-theme-and-math, Claim 10).
  - Lists are sorted in code-unit order (`localeCompare` is banned).
  - Shuffled input gives the same bytes.
- **Refuse what Ghost's checker refuses, before gscan runs.** Each refusal names `package.json`, the input and the rule:
  - **`theme.name`** must match `^([a-z0-9]+-)*[a-z0-9]+$`. Otherwise gscan raises `GS010-PJ-NAME-LC` and `-NAME-HY`, both errors.
  - **`theme.version`** must be `MAJOR.MINOR.PATCH` in plain digits (`GS010-PJ-VERSION-SEM`). That is a strict subset of what gscan's `semver.valid` accepts.
  - **`postsPerPage`** is emitted as the integer `Math.trunc(Number(v))`, never as a string. It is refused unless that integer is finite and ≥ 1 (`GS010-PJ-CONF-PPP-INT`, an error).
  - **A designed card name** must use only the characters `[a-z0-9_]`. Every card Ghost 5.130.6 and 6.58.0 ship is named within it, and Ghost 5 splices the names into a file glob (`css/!(a|b).css`), where `|`, `(`, `)` and `*` are syntax (AD-36, every new sink).
- **`image_sizes` is `IMAGE_SIZES`** (`packages/library/src/vocabulary.ts`), each key written as `{ "width": w }`. It is never FR-J3's rendition set and never FR-K2's upload cap.
- **Every `size=` in an emitted `.hbs` must be `size="<an IMAGE_SIZES key>"`.** Otherwise the compile is refused, naming the file and the keys. Handlebars comments (`{{!…}}`) are not read, because a layer name lands in one.
- **`engines` is `{ "ghost": ">=5.0.0" }` and never carries `ghost-api`** (FR-J1, NFR-7).
- **FR-J13's marker is the top-level `"inflozo": true`, written last.**
- **`package.json` carries three named marks, and only those are exempt from FR-J1's fingerprint scan:**
  - `name` (FR-J10's `inflozo-{slug}`, Story 7.24);
  - `author` (Question 3);
  - the marker.

  Every other byte of `package.json` is scanned like any emitted file.
- **The user's words reach `package.json` only through `JSON.stringify`**, never by concatenation (AD-36). The file is not a template, and Ghost never renders it.
- **Counts are derived.** No check or message writes down how many sizes, cards or keys exist.

**Ask First:**

- **The T1 run.** It uploads a theme to T1, and reading one rendition URL makes Ghost save a resized picture.
  - It needs the owner's in-session go in the Dev (or Review) session.
  - It runs in the main session, never through a subagent.
- **gscan naming anything** on the compiled pilots plus the scaffold that the scaffold list (Design Notes) does not cover.
- **The rulings.** Dev waits for all three. A ruling other than the recommended option changes the Ruled values table and the rows that table names, and nothing else.

**Never:**

- **Anything a later story owns:**
  - `config.custom`: its settings (7.9, 7.10) and the three dark built-ins (7.11), as Question 1 rules;
  - which cards are designed, and listing `header` with `header_v2` (7.13);
  - the name scheme, its freeze and the version's increment (7.24);
  - README and credits (7.28);
  - `locales/` (7.12);
  - zipping and uploading (7.18, 7.26);
  - reading the marker (7.20).
- **`card_assets: false`, or `engines.ghost-api`.**
- **A `license` key.** FR-J2 names none, and choosing one is a legal decision about the library's designs.
- **A new dependency** (`semver`, `validator`). The two patterns above are the rule.
- **A UI or a database change.** There is therefore no Schema phase and no owner test.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A project | theme `inflozo-field-notes` · `1.4.0` · `Field Notes`; `postsPerPage` 12; no designed card | `package.json` is Design Notes' text: the stated key order; `engines.ghost` and no `ghost-api`; the ruled `author`; `keywords: ["ghost-theme"]`; `posts_per_page: 12`; `image_sizes` from `IMAGE_SIZES`; `card_assets` as Ruled values gives it for no designed card; `custom` as Ruled values gives it; the marker last | — |
| Designed cards | `['toggle', 'header_v2', 'header', 'toggle']` | `"card_assets": { "exclude": ["header", "header_v2", "toggle"] }`: sorted, each name once | — |
| A card name Ghost 5 would read as glob syntax | `'x|*'`, `'Bookmark'`, `''` | — | throws, naming the name and the alphabet |
| Page size given as text or a fraction | `'12'` from a JavaScript caller, `12.9` | `12`, a JSON number | — |
| A page size that is no page size | `0`, `-3`, `NaN`, `'twelve'`, `Infinity` | — | throws, naming the value |
| A name Ghost's checker refuses | `Field Notes`, `inflozo--x`, `x-`, `Inflozo-x` | — | throws, naming the pattern |
| A version that is not plain semver | `1.0`, `v1.0.0`, `01.0.0`, `1.0.0-beta` | — | throws |
| Hostile words in the description | quotes, a backslash, a line break, U+0005, `{{title}}` | the file parses and gives back the exact string; no raw control character is in the file | — |
| A size that is no key | an emitted `.hbs` holding `{{img_url x size="huge"}}`, or an unquoted `size=m` | — | the size check names the file and the keys |
| A layer named `size="huge"` | the name reaches a boundary comment | compiles: comments are not read | — |
| Determinism | designed cards and object keys in another order | byte-identical `package.json` | — |

</frozen-after-approval>

## Code Map

**The compiler**

- `packages/theme-compiler/src/compile.ts`:
  - `CompileInput` :22-35 gains `theme` and `designedCards`.
  - `postsPerPage` :33-34 already sizes a secondary feed (`feedQuery`, :104) and now also fills `config.posts_per_page`.
  - The tree is built at :131-207 and returned at :209-210, in code-unit order after user text is substituted. `package.json` joins the tree before that line, and the size check runs over the returned record.
  - `noC0` :57-63 is the shape of a named refusal.
- `packages/theme-compiler/src/index.ts` — the exports. It gains the marker key for Story 7.20.
- `packages/theme-compiler/src/compile.test.ts`:
  - `input()` :98-100 — every call site gets a `theme`;
  - the bare compile at :167-168 — its file list gains `package.json`;
  - the whole-output scan :322-350 — its `/inflozo/i` check at :329 reads `package.json` with its named marks removed;
  - determinism :352-363;
  - the review rows :269-283, the shape for new refusal rows.
- `packages/library/src/vocabulary.ts:34` — `IMAGE_SIZES`, the one map (re-exported by `@inflozo/library`). `HELPERS.img_url` (:43) already refuses a size that is not a key at render, so the compile's check is a backstop over the final text.
- `packages/section-runtime/src/main-feed.ts:105-108` — `feedBase` clamps a secondary feed's page size to 1–100. `posts_per_page` is not clamped: FR-H2 caps only a secondary feed.
- `apps/web/lib/projects.ts:68-75` — `slugify` yields `[a-z0-9]+(-[a-z0-9]+)*` or `project`, so `inflozo-{slug}` always passes the name pattern. Read only; Story 7.24 builds the name.

**Tools**

- `tools/pilot-theme.mjs`:
  - `compilePilots` :88-92 takes a `theme` and passes it on;
  - `themeFailures` :97-117 scans `package.json` with its named marks removed, and refuses a `package.json` that does not parse.
- `tools/check-snapshots.mjs`:
  - `pilots` and `WORDS` :600-601; the pilot rows :666-686;
  - `check` and `mustFail` :154-174 are synchronous, so the gscan result is computed with top-level `await` before its row;
  - gscan 6.4.2 loads through `createRequire(join(REPO, 'packages/theme-compiler/package.json'))`, as jsdom does at :40.
- `tools/probe/record-theme-assembly.py`:
  - `THEME_NAME` :57, `SECTION` :58, `COMPILE` :74-90;
  - `scaffold` :106-130. Its `package.json` entry (:110-117) goes, since `scaffold` refuses a clash with a compiled file;
  - `record` :172-231, `section` :233-269;
  - from `tools/probe/record-shim.py:110-215`: `Ghost.api` and `Ghost.page`, `start_guard`, `restore_and_delete`. `Ghost.page` follows redirects, so the rendition rows need the final URL.
- `tools/stress/gate.js` — both gscans (4.49.7 and 6.4.2), local only. It is the recorder's gate.
- `tools/doc-audit.py`:
  - :420-432 — the recorder's catalogue row (its scaffold sentence and its section);
  - :1185-1190 — `pilot-theme.mjs`'s row (`themeFailures`' marks).

**Documents (Dev)** — the list is Design Notes § Propagated at Dev.

## Tasks & Acceptance

**Execution:**

- [x] `packages/theme-compiler/src/compile.ts`, `src/index.ts`:
  - `CompileInput` gains `theme: { name, version, description }` and `designedCards?`;
  - a `packageJson` builder makes the refusals above, then writes Design Notes' object (Ruled values supply `author`, `card_assets` and `custom`);
  - `compileTheme` adds `package.json` to the tree and, last, refuses any `size=` in an emitted `.hbs` outside a comment that is not an `IMAGE_SIZES` key;
  - `index.ts` exports the marker key as `THEME_MARKER`.

  -- FR-J2 and DW-335, in the one place every theme is built.
- [x] `packages/theme-compiler/src/compile.test.ts`:
  - the I/O matrix, row by row, with the A-project row's exact text;
  - the size check on a hand-made record, with its control (`size="m"` passes);
  - the bare compile lists `package.json`;
  - the whole-output scan reads `package.json` with its named marks removed. Its control: `inflozo` written into the description is caught;
  - determinism with designed cards.

  -- what the compiler promises about the file.
- [x] `tools/pilot-theme.mjs`:
  - `compilePilots` takes a `theme`. CI's fixed one is `inflozo-pilots` · `1.0.0` · `Pilot sections`;
  - `themeFailures` parses `package.json`, removes the named marks and scans the rest.

  -- CI and the recorder hold one theme to one check.
- [x] `tools/check-snapshots.mjs` -- two rows, each behind its control:
  - the pilots' `package.json` raises no `GS010-*` or `GS100-*` result, at any level, under gscan 6.4.2 at `v6`. Control: the same file with `posts_per_page: "12"` raises `GS010-PJ-CONF-PPP-INT`;
  - the builder's name in `package.json` outside its named marks is caught. Control: the clean file passes.

  -- this holds "gscan at the pinned version" on every commit. CI runs Ghost 6's checker (AD-34: one gscan per major, never 6.4.2 at `v5`); both majors run through the recorder's gate.
- [x] `tools/probe/record-theme-assembly.py`, `tools/doc-audit.py`:
  - the scaffold drops `package.json`;
  - the compile is handed a `theme` (`THEME_NAME` · `1.0.0` · a fixed description);
  - the rows in Design Notes § The T1 run join the run;
  - `SECTION` becomes `71`, so §70 stays Story 7.1's record;
  - the docstring and the catalogue row say so.

  -- R-82: a real Ghost reads what the compiler writes.
- [x] `prd.md`, `epics.md`, `epic-7-context.md`, `deferred-work.md` -- apply Design Notes § Propagated at Dev, then grep the repo for each old wording -- standing rules 3 and 7.

**Acceptance Criteria:**

- **The file.** Given any compile, when `package.json` is read, then it parses, its keys follow Design Notes' order with conditional keys omitted, and it carries FR-J2's fields as the matrix's first row states. Ghost's checkers raise no `GS010-*` result on it:
  - gscan 6.4.2, in CI;
  - gscan 4.49.7 and 6.4.2, through the recorder's gate, at 0 errors and 0 warnings with the scaffold.
- **Sizes.** Given any compile, when its emitted `.hbs` files are read, then every `size=` outside a comment is an `IMAGE_SIZES` key. A compile that would emit any other size is refused, naming the file.
- **Fingerprints.** Given any emitted file, when scanned for builder fingerprints, then:
  - the only `inflozo` it carries is in `package.json`'s `name`, its `author` and the marker;
  - a builder's name anywhere else, `package.json`'s other fields included, fails the scan.
- **Ghost reads it.** Given T1 and the owner's in-session go, when the recorder runs, then:
  - Ghost 6.58.0 accepts the compiled theme and its compiled `package.json`;
  - every row in Design Notes § The T1 run holds behind its control;
  - T1 is restored and read back;
  - MEASUREMENTS §71 records the run.
- **No frame.** Given a story with no surface (owner test none: a compiler file), when it deploys green, then it is Done on the Deploy commit. It names no frame and carries no "matches the frame" criterion, because R-74 binds surfaces (R-80).
- **Propagation.** Given the rulings, when Dev ends, then:
  - FR-J2, FR-J13 and the stories they touch say what landed;
  - DW-335 is closed, naming this story;
  - a grep finds none of the old wording.

### Review Findings

Five layers ran on 2026-10-06 (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra verifier). The Acceptance Auditor found no criterion violated; the Verification Gap reviewer found no gap; the Real-infra verifier held every read-only T1 claim (below). Patched in the Review commit:

- [x] [Review][Patch] The recorder uploaded the probe picture BEFORE `start_guard` and the local controls, so a run about to be refused had already written to T1; and a second run would upload another picture, since the probe is attached to no post [tools/probe/record-theme-assembly.py:233-256] — the picture step now follows the guard and the controls, and reuses this month's `/content/images/YYYY/MM/inflozo-probe-rendition.png` when it is there.
- [x] [Review][Patch] The A17 #1 cell count matched `a17-1__cell` only as the first class; a prepended class would read 0 cells [tools/probe/record-theme-assembly.py:316].
- [x] [Review][Patch] The ghost_head premise row passed vacuously when the site theme's `card_assets` is not `true`, yet printed as a held CONTROL — it now says so; `/page/2/` was read twice when `last` is 2 [tools/probe/record-theme-assembly.py:275,294].
- [x] [Review][Patch] The three named marks were written as two code lists (`unmarked` in `tools/pilot-theme.mjs` and in `compile.test.ts`) — a fourth mark could land in one and miss the other; both now read `THEME_MARKS`, exported beside `THEME_MARKER` [packages/theme-compiler/src/compile.ts].
- [x] [Review][Patch] `compilePilots(words)` with no options died with a destructuring TypeError; it now names the missing `theme`. `unmarked` accepted a `package.json` that parses to `null`, a string or an array [tools/pilot-theme.mjs].
- [x] [Review][Patch] `check-snapshots.mjs` awaited gscan at the top level, so a gscan that throws aborted every later row instead of failing its own [tools/check-snapshots.mjs:714-715].
- [x] [Review][Patch] `pageSize(true)` read as 1 and `[12]` as 12 through `Number`; only a number or a digit string is now a page size, and both are matrix-tested refusals [packages/theme-compiler/src/compile.ts].
- [x] [Review][Patch] The size refusal said "quoted" while only double quotes pass (the spec's spelling); the message now says so and `size='m'` is tested. The mustache regex's ceiling (a `}}` inside a quoted hash string) is named in a comment [packages/theme-compiler/src/compile.ts].
- [x] [Review][Patch] Propagation: FR-J2 and the §7.4 tree still stated `custom` as an unconditional key, and FR-J2's and Story 7.2's "every `size=` argument" did not say *inside a Handlebars expression*, the reading the Dev change log carries [prd.md FR-J2, §7.4; epics.md Story 7.2]. §71's "no content, no setting and no key written" now names the picture as the one write beside the theme; `doc-audit.py`'s row no longer writes "two rows more".
- [x] [Review][Patch] Design Notes § The fingerprint scan and the description — says why the user's `description` is scanned and why that trips no product gate.

Dismissed as noise or by rule: the dated counts in Dev results (a dated record of one run); `epic-7-context.md`'s line 69 (refresh, never recompile — the superseding sub-bullet is there); `encode-propagation-map.md`'s old wording (a `record` document); `theme.description` typed by TypeScript; a compile-level test of `checkSizes` (it is a one-line backstop behind `HELPERS.img_url`'s own refusal, tested at the function); recording the probe picture's residue beyond §71, the docstring and the recorder's own reuse.

**Real infrastructure at Review (R-82), read-only — a theme upload needs the owner's in-session go and none was given in this session, so §71's upload rows stand as Dev's record.** T1 `ghost6.inflozo.com`, keys by name `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`:
- `GET themes/`: installed `casper`, `racer`, `source`; active `casper`; no theme whose `package` carries `inflozo` — T1 is restored as §71 says.
- `/content/images/2026/10/inflozo-probe-rendition.png` → 200, `image/png`, 4098 bytes. `size/w750/` of it → **302 to the original** (casper declares no 750), and the positive control `size/w600/` (a casper width) → 200 at its own path.
- casper's `package`: no `inflozo` key, widths `[30, 100, 300, 600, 1000, 2000]`, `card_assets: true` — §71's premise rows hold today.
- Locally, Node 24: the theme-compiler tests all pass with every `(7.2)` row; `node tools/check-snapshots.mjs` PASS with the gscan 6.4.2 rows behind their controls; the recorder's offline half (`compiled` → `scaffold` → `gated`) gave scaffold `assets/css/cards.css` + `page.hbs` only and **0 errors / 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6)**.
- No migration in the diff (`git diff --stat e816a183..HEAD -- supabase/` empty), so R-99 does not apply.

## Spec Change Log

- **2026-10-06, Create (the owner ruled).** All three questions were ruled option 1. The Ruled values table lost its "if ruled otherwise" column, and the propagation list's Question 1 and Question 2 lines now state the ruled values. Nothing else changed.
- **2026-10-06, Dev.** Two readings, neither of which changes the frozen intent:
  - **The size check reads `size=` inside a Handlebars expression, outside comments.** That is FR-J2's "every `size=` *argument*". Read over raw text, it would refuse every pilot, because a design writes HTML such as `data-headline-size="large"`. It would also refuse a customer who types `size="huge"` into a heading, since user text is HTML and never an argument. The matrix rows hold either way, and `compile.test.ts` carries the typed-text case.
  - **T1 hosts no picture of its own.** Every post, page, setting and user points at Ghost's sample pictures on `static.ghost.org`, so the first T1 run was void before anything uploaded. The owner ruled Question 4 option 1: the recorder uploads one probe picture when T1 hosts none. The Design Notes' T1-run lines say so.

## Design Notes

### The file, as 7.2 emits it (as ruled)

```json
{
  "name": "inflozo-field-notes",
  "description": "Field Notes",
  "version": "1.4.0",
  "engines": {
    "ghost": ">=5.0.0"
  },
  "author": {
    "name": "Inflozo",
    "email": "hello@inflozo.com"
  },
  "keywords": [
    "ghost-theme"
  ],
  "config": {
    "posts_per_page": 12,
    "image_sizes": {
      "xs": {
        "width": 150
      },
      …every IMAGE_SIZES key, in the map's order
    },
    "card_assets": true
  },
  "inflozo": true
}
```

- **Order.**
  - Top level: Casper's and Source's order for the keys they share — `name`, `description`, `version`, `engines`, `author`, `keywords`, `config` (verify-mechanical-theme-and-math, Claim 10) — then the marker.
  - Inside `config`: `posts_per_page`, `image_sizes`, `card_assets`, and `custom` last whenever a story emits it.
- **`description`** is the project's name, as handed in. Ghost Admin shows a theme's `package.name` and `package.version` but never its description (read in Ghost 6.58.0's admin bundle). So FR-J10's "a rename changes the display name in Inflozo only" still holds.
- **Where the values come from.** Stories 7.18 and 7.26 hand them in:
  - `theme.name` is the frozen `inflozo-{slug}`, and `theme.version` the per-deploy increment, both Story 7.24's;
  - `description` is `projects.name`;
  - `postsPerPage` is `projects.posts_per_page`, which the database already holds to ≥ 1;
  - `designedCards` is the keys of `project_treatments.card_designs` (Story 7.13). `SCHEMA.sql` names that column as the source.

### Ruled values: Questions 1 to 3

All three were ruled option 1 by the owner on 2026-10-06.

| Value | Ruled |
|---|---|
| **Q1 · `config.custom`** | not emitted by 7.2; 7.10 and 7.11 add it, each with the template lines that read it |
| **Q2 · `card_assets` with no designed card** | `true` |
| **Q2 · `card_assets` with designed cards** | `{ "exclude": [the sorted names] }` |
| **Q3 · `author`** | `{ "name": "Inflozo", "email": "hello@inflozo.com" }` |

### The fingerprint scan and the description (Review, 2026-10-06)

`description` is `projects.name`, the user's words, and the scan does not exempt it: `themeFailures` runs only in CI and the recorder over the fixed pilots and the probe theme, never over a customer's compile, so a project named "Inflozo fan site" trips no product gate. The scan is a check that the *builder* writes its name nowhere but the three marks; the pilots' description is fixed, which is what makes the control meaningful.

### The marker (DW-335)

- **What it is:** `"inflozo": true`, at the top level, written last.
  - It survives a renamed package, which is FR-J13's whole point.
  - It sits outside `config`, which is Ghost's namespace.
  - It carries no id, hash or date: it is a mark, not a fingerprint.
- **Story 7.20 can read it without a download.**
  - Ghost's `GET /ghost/api/admin/themes/` returns each theme's whole parsed `package.json` as `package`. Read in `core/server/lib/package-json/package-json.js` (`filter`) and `parse.js`, which are identical in 5.130.6 and 6.58.0.
  - FR-J13 already reads themes with the staff token.
  - The T1 run executes this read.

### Facts this spec rests on (standing rule 1)

Sources: the npm tarballs ghost-6.58.0 and ghost-5.130.6, and gscan 6.4.2 and 4.49.7 from `tools/stress/node_modules`.

**`card_assets` (Question 2)**
- **Read in Ghost 6.58.0** (`core/frontend/services/assets-minification/card-assets.js`, `getCardNames`):
  - `true` gives every card the manifest ships;
  - `{ exclude }` gives every card but those named, so `[]` gives every card;
  - `false`, or anything unrecognised, gives none.
- **Read in Ghost 5.130.6** (`CardAssets.js`, `generateGlobs`):
  - `true` becomes the glob `css/*.css`;
  - `{ exclude: [a, b] }` becomes `css/!(a|b).css`, so `[]` becomes `css/!().css`.
- **Executed:** in the scratchpad, with Ghost 5's pinned `tiny-glob` 0.2.9 (`globrex` 0.1.2), over 5.130.6's own `core/frontend/src/cards/`:
  - `css/*.css` matches every card file, and `css/!(bookmark).css` every card file but the excluded one;
  - **`css/!().css` and `js/!().js` match nothing.**
- So on Ghost 5 an empty list writes no bundle. `hasFile` still answers yes from the glob's key, so `{{ghost_head}}` links a `cards.min.css` and `cards.min.js` this theme never built. Ghost then serves whatever an earlier theme left on the server, or nothing.

**`GS100` (Question 1)**
- `GS100-NO-UNUSED-CUSTOM-THEME-SETTING` is an **error** on both gscans (`lib/specs/v4.js:210`; v5 and v6 inherit it).
- It fires for a `config.custom` key that no template references, counting non-partial `.hbs` files and the partials they invoke.
- **Executed** on gscan 6.4.2 and on 4.49.7, over the pilot theme: one unreferenced `color_scheme` setting raises it.

**`GS010` (the package.json rules)**
- `lib/checks/010-package-json.js` is byte-identical in gscan 4.49.7 and 6.4.2, and every `GS010-*` level is the same in both.
- `card_assets` passes when it is `true` or a non-empty object, `{ exclude: [] }` included. The email check is the `validator` package's `isEmail`.
- **Executed** on both gscans:
  - `true`, `{ exclude: [] }` and `{ exclude: ["bookmark"] }` raise no `GS010-*` result;
  - each control raised its rule: `posts_per_page: "12"` → `GS010-PJ-CONF-PPP-INT`; an `engines.ghost-api` → `GS010-PJ-GHOST-API-PRESENT`; no `card_assets` → `GS010-PJ-GHOST-CARD-ASSETS-NOT-PRESENT`; the name `Pilot-Theme` → `GS010-PJ-NAME-LC`.

**`engines.ghost`**
- **Nothing reads it.** Not the server of Ghost 5.130.6 or 6.58.0, not 6.58.0's admin bundles, and not either gscan, which reads only `engines["ghost-api"]`.
- So FR-J2's "the floor Ghost checks at upload" is wrong. The key stays, because it states NFR-7's floor to people and tools. Dev corrects the sentence.

**`image_sizes` and the theme engine's config**
- Ghost serves `/content/images/size/w{N}/…` only when `w{N}` is a width in the active theme's `image_sizes`, in Ghost's content sizes or in its internal sizes. Any other width is redirected to the original (6.58.0, `core/frontend/web/middleware/handle-image-sizes.js` and `shared/config/overrides.json`).
- `w750` (the `m` size) belongs to the theme alone, which makes it the T1 run's row.
- The theme engine's config takes only `posts_per_page`, `image_sizes` and `card_assets` from `config` (`theme-engine/config/index.js`, `allowedKeys`, both majors).

### The T1 run: `tools/probe/record-theme-assembly.py`, extended

It is Story 7.1's run as it stands:
- compile with a nonce;
- add the scaffold;
- gate;
- upload behind `start_guard`;
- read `/`, `/page/2/` and a post;
- restore and delete.

Now `package.json` is compiled rather than scaffolded, and these rows join the run:

1. **Before the upload, under the site's own theme** (`casper` on T1):
   - `GET themes/` → that theme's `package`. This is the controls' premise: it carries no marker, has no `750` width in its `image_sizes`, and shows its `card_assets`.
   - `/content/images/size/w750/{picture}` → redirected to the original.
   - The `cards.min.css?v=` hash that `{{ghost_head}}` writes on `/`.
   - `{picture}` is the newest published post's feature image hosted on T1. With none, the run uploads its own probe picture, attached to no post (Question 4, ruled at Dev).
2. **After activation:**
   - `GET themes/` → the probe's `package` deep-equals the compiled `package.json`, marker included. Control: the site theme's `package` lacks the marker.
   - `/` lists exactly `posts_per_page` A17 #1 cells.
   - `/page/{last}/` answers 200 and `/page/{last+1}/` answers 404, where `last` is the Content API's published total divided by `posts_per_page`, rounded up.
   - `size/w750/{picture}` is served at that path. Control: `size/w751/{picture}` is redirected to the original.
   - The `cards.min.css?v=` hash equals step 1's whenever the site theme's `card_assets` is `true`: every card, as Ghost's own default gives it.
3. **Written to MEASUREMENTS §71**, a new section; §70 stays Story 7.1's record of 2026-10-06.
   - Its table holds Story 7.1's rows, re-run, and these.
   - The Ghost 5 half joins DW-326 (R-238), together with the empty-list glob above, which that pass must confirm on a real Ghost 5.

**What it writes to T1:** the theme upload, two activations and the delete (as Story 7.1's run did), and the `w750` rendition Ghost saves the first time it is asked for one. When T1 hosts no picture of its own, it also uploads one probe picture, which stays, because Ghost's API deletes no picture (Question 4).

### Propagated at Dev

- **`prd.md`:**
  - FR-J2: correct the engines sentence; write `card_assets` as Question 2 rules and `author` as Question 3 rules; name the three marks `package.json` carries;
  - FR-J13: name the marker, `"inflozo": true`.
- **`epics.md`:**
  - Story 7.2: its `card_assets` and `custom` lines, as ruled.
  - Question 1 was ruled option 1, so Story 7.2's `custom` line is pasted word for word into Stories 7.10 (user-defined settings, cap-enforced) and 7.11 (the three built-ins on every project), and named in Epic 7's preamble. That is R-195's practice.
  - Story 7.13 gains: while no card is designed, the theme declares `card_assets: true` (Question 2).
  - Story 7.20 gains the marker's key and the `GET /themes/` read.
- **`epic-7-context.md`:** a sub-bullet for each of the above.
- **`deferred-work.md`:**
  - DW-335 is closed by this story;
  - DW-326 gains this story's note: §71's Ghost 5 half, and the empty-list glob.
- **Last:** grep the repo for "never a blanket", "the floor Ghost checks", "a `package.json` marker" and the recorder's old scaffold sentence.

### The commits

There is no migration, so there is no Schema phase. `Story 7.2 - Dev - …` carries:
- the code, tests, tools and documents;
- §71, if the T1 run happened in the Dev session on the owner's go.

## Questions for the owner

All three were ruled option 1 (owner, 2026-10-06). Dev builds Design Notes § Ruled values as it stands. Question 4 was asked and ruled in the Dev session.

### Question 1 — The three dark-mode settings: write them now, or with the page lines that read them?

**In plain English.**
- Story 7.2 writes the theme's settings file. Its plan also asks it to list three dark-mode settings a site owner can change in Ghost Admin: colour scheme, dark accent colour and dark logo.
- Ghost's checker refuses any listed setting that no page of the theme reads. It counts as an error, and an error blocks a deploy.
- The lines that read these three settings are built in Story 7.11, whose plan already lists the same three settings.
- If 7.2 lists them now, every theme Inflozo compiles fails Ghost's check from now until 7.11 lands.
- The settings users create themselves (Stories 7.9 and 7.10) work the same way.

**Example.** A theme compiled right after this story would declare a "dark logo" setting that nothing in the theme looks at. Ghost's checker would answer: *"config.custom.dark_logo is declared but never referenced from a template"*. We ran that exact check during this planning, on both versions of Ghost's checker.

1. **Leave the settings list to the stories that also write the lines that read it**: 7.11 for the three dark-mode settings, 7.10 for the user's own. 7.2 writes everything else in the file. No theme is ever refused along the way. 7.2's sentence about these settings moves, word for word, into 7.10 and 7.11. **(RECOMMENDED)**
2. List the three now. Until 7.11 lands, every check of a compiled theme carries a stand-in page that reads them, labelled as 7.11's.
3. Build 7.11's reading lines inside this story too. This story then grows by most of 7.11, including a choice 7.11 still has open: which colour scheme a Light-only project starts on.

**Ruled: option 1 (owner, 2026-10-06).** In his words: "I agree with recommendations for all 3 questions."

### Question 2 — Ghost's own card styling, while no card is designed

**In plain English.**
- Ghost ships ready-made styling for the cards authors put in posts: bookmarks, galleries, toggles, audio and video players.
- A theme tells Ghost which of these to leave out, so that Inflozo's card designs never fight Ghost's.
- The plan says to always write a "leave these out" list, and never Ghost's "include them all" switch.
- But nobody can design a card until Story 7.13, so for now the list is always empty. The two Ghost versions read an empty list in opposite ways:
  - Ghost 6 includes every card;
  - Ghost 5 includes none. It links a card stylesheet it never builds, so a page gets whatever an earlier theme left on the server, or nothing at all.

**Example.** On a Ghost 5 site, a post with a gallery would show a stack of full-size pictures, and a toggle would never open. We read this in Ghost 5's code and ran the exact file-matching code Ghost 5 uses. No Ghost 5 server is needed to decide, because option 1 is correct on both versions either way.

1. **Write Ghost's own "include them all" switch while no card is designed, and the "leave these out" list from the first designed card on.** Both Ghost versions then show every card with Ghost's styling, which is what a project with no designed card should get. The plan's "never the include-all switch" was written for a project that has designed a card, and it still holds there. **(RECOMMENDED)**
2. Always write the list, with a made-up card name in it whenever it would be empty, so Ghost 5 has something to leave out. This works on both versions, but every theme then carries a card name that does not exist.
3. Keep the empty list. Ghost 5 sites lose card styling until a card is designed. Not recommended.

**Ruled: option 1 (owner, 2026-10-06).** In his words: "I agree with recommendations for all 3 questions."

### Question 3 — Whose name and email go in the theme's "author" line?

**In plain English.**
- Ghost's checker refuses a theme whose settings file has no author email. So every theme needs one, and the plan never says whose.
- Visitors never see it, and Ghost Admin does not show it. Anyone who opens a downloaded theme zip does see it.
- Ghost's own reason for the rule is that a theme's author can be reached about breaking changes and security fixes.

**Example.** Casper, Ghost's own theme, says `"author": {"name": "Ghost Foundation", "email": "hello@ghost.org"}`.

1. **Inflozo: `"name": "Inflozo"`, `"email": "hello@inflozo.com"`.** That is the address your Pricing page shows and your sign-in emails come from. **(RECOMMENDED)**
   - Inflozo writes and maintains the theme's code, so it is who Ghost's rule wants reachable.
   - No customer's personal details go into the file.
   - It names Inflozo in one more place, beside the theme's name `inflozo-…` and the small mark. That includes a Pro project with credits turned off.
2. The customer: their account name and email. It is their theme. But their email then sits in every theme zip Inflozo keeps and every zip they share, and the file changes whenever they change their email.
3. A placeholder address that reaches no one (`theme@example.com`). It passes the check, but promises a contact nobody answers. Not recommended.

**Ruled: option 1 (owner, 2026-10-06).** In his words: "I agree with recommendations for all 3 questions."

### Question 4 — The T1 check needs a picture the test site hosts itself (asked at Dev)

**In plain English.**
- One check asks Ghost to make a medium-size copy (750 px wide) of a picture. That proves Ghost reads this theme's picture sizes.
- The test site `ghost6.inflozo.com` has no picture of its own to do that with. Every post uses Ghost's sample pictures, which sit on Ghost's servers, not on the site.

**Example.** The newest post's picture is `static.ghost.org/v5.0.0/images/publication-cover.jpg`.

1. **The check uploads its own small, plain picture (a few KB), attached to no post, so no visitor sees it.** Ghost cannot delete a picture through its API, so each such run leaves that one file behind. **(RECOMMENDED)**
2. You give any published post a feature image in Ghost Admin, and every later run uses it.
3. Skip the picture rows and move them to the Review run.

**Ruled: option 1 (owner, 2026-10-06).** Asked in the Dev session and answered there.

## Verification

**Commands:**

- `pnpm check` -- expected: green. That covers:
  - lint and typecheck;
  - every package's tests, `compile.test.ts`'s new rows among them;
  - `node tools/check-snapshots.mjs` with its two new rows, each control failing on its broken subject first.
- The recorder's local half: `compiled()` → `scaffold()` → `gated()`. It needs `cd tools/stress && npm install` once. -- expected: 0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6), with `package.json` compiled and only `cards.css` and `page.hbs` in the scaffold.
- `python3 tools/probe/record-theme-assembly.py`, on the owner's in-session go, in the main session -- expected:
  - every row holds behind its control on T1 `ghost6.inflozo.com` (6.58.0);
  - T1 is restored and read back;
  - §71 is written.
- `python3 tools/doc-audit.py --check`, twice -- expected: PASS.

**Manual checks:**

- The compiled pilot `package.json` reads like Casper's: its keys in Casper's order, and nothing a hand-editor would not recognise except the marker.

**Real infrastructure (R-82):**

- T1, through the recorder.
- Both gscans, locally, and gscan 6.4.2 in CI.
- No Supabase, Vercel, Resend or Dodo surface is touched: the compiler has no product caller until Story 7.18.

**Dev results (2026-10-06, Node 24, on this tree).**

- `pnpm check`: exit 0. That covers lint, the typecheck of every package, and every package's tests with 0 failures, `compile.test.ts`'s ten `(7.2)` rows among them. `check-snapshots` then ran with its four new rows. The two checks each held behind a control that fired first:
  - gscan 6.4.2 at `v6` raised `error GS010-PJ-CONF-PPP-INT` on `posts_per_page: "12"`, then raised no `GS010-*` or `GS100-*` on the pilots' `package.json`;
  - with its three marks in place, the clean file passed the fingerprint scan. The builder's name under `config` and in the description was caught, and so was a `package.json` that does not parse.
- **The recorder's local half**, inside the T1 run below:
  - `package.json` was compiled, and the scaffold held only `assets/css/cards.css` and `page.hbs`;
  - the gate read **0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6)**.
- **T1 `ghost6.inflozo.com` (6.58.0)**, `python3 tools/probe/record-theme-assembly.py`, in the main session on the owner's in-session go. Keys were read in-process from `tools/probe/.env` by variable name: `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`.
  - **The first run was void before any write.** T1's newest feature image is `static.ghost.org`'s, which is Question 4's finding.
    - Read-only Content and Admin API reads (posts and pages of every status, settings, users) found no picture under `/content/images/` anywhere. The control: the Admin read returned 38 posts, 35 of them carrying `static.ghost.org` pictures.
  - **The second run, after Question 4's ruling, held every row: 42 of 42 `yes` in §71's table, and 0 `NO`.**
    - Before the upload, under `casper`:
      - `GET themes/` gave casper's `package`, with no `inflozo` key and widths `[30, 100, 300, 600, 1000, 2000]`;
      - `size/w750/` of the probe picture was redirected to the original;
      - `/` linked `cards.min.css?v=Jw0334E-A8vpuWdm`.
    - After activation:
      - `GET themes/` returned the probe's `package` deep-equal to the compiled `package.json`, with keys `name, description, version, engines, author, keywords, config, inflozo`;
      - `/` listed 12 A17 #1 cells (`posts_per_page` 12);
      - with 33 published posts, `/page/3/` answered 200 and `/page/4/` answered 404;
      - `size/w750/` was served at its own path, and the control `size/w751/` was redirected to the original;
      - the `cards.min.css` hash was unchanged (`Jw0334E-A8vpuWdm`; casper's `card_assets` is `true`).
    - Story 7.1's page rows were re-run on `/`, `/page/2/` and `/probe-gated-post/`, and all held.
  - **T1 was restored and read back**: `casper` is active, and the probe theme was deleted, leaving `casper`, `racer` and `source` installed.
  - **What stays on T1:** `/content/images/2026/10/inflozo-probe-rendition.png` (1000×10, about 4 KB, attached to no post) and its `w750` rendition.
  - MEASUREMENTS §71 was written, and §70 is untouched.
- `python3 tools/doc-audit.py --check`, twice: the first run regenerated `INDEX.md` and `INDEX.html` (STALE), and the second gave **PASS** with 0 warnings.
- **Manual check.** The compiled pilot `package.json` reads like Casper's:
  - its keys are in Casper's order, and every value is one a hand-editor recognises;
  - the only extra is the last line, `"inflozo": true`.
- **No Supabase, Vercel, Resend or Dodo call was made.** The compiler has no product caller until Story 7.18. CI's `check` job runs `check-snapshots`' gscan rows on the push.

**The I/O matrix, row by row, mapped to the check that ran and passed** (`pnpm check`, exit 0):

| Row | Check |
|---|---|
| A project | `(7.2) a project: package.json is the spec's text …` — the exact text, `image_sizes` derived from `IMAGE_SIZES` |
| Designed cards | `(7.2) designed cards: card_assets excludes them, sorted …, each name once` |
| A card name that is glob syntax | `(7.2) a card name Ghost 5 would read as glob syntax is refused …` (`'x|*'`, `'Bookmark'`, `''`) |
| Page size as text or a fraction | `(7.2) a page size given as text or a fraction is written as the integer …` (`'12'`, `12.9`) |
| A page size that is no page size | `(7.2) a page size that is no page size is refused, naming the value` (`0`, `-3`, `NaN`, `'twelve'`, `Infinity`) |
| A name the checker refuses | `(7.2) a name Ghost's checker refuses is refused, naming the pattern …` (all four) |
| A version that is not plain semver | the same test (all four), with a control that compiles `0.10.0` |
| Hostile words in the description | `(7.2) hostile words in the description …` |
| A size that is no key | `(7.2) the size check …` (`size="huge"` quoted, `size=m` unquoted; control: `size="m"`, comments, HTML attributes and CSS pass) |
| A layer named `size="huge"` | `(7.2) a layer named size="huge" compiles …` (control: the same words in a live mustache are refused) |
| Determinism | `determinism: the same input, its templates and every object's keys in another order …`, now with designed cards and a shuffled `theme` |

**Deploy (2026-10-06), head `f09c3d7a`.** `Deployment: dpl_9zQwkXcMuxugH6cVtpbR3FdVquUs` READY on the production Vercel
project (read with `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`; `meta.githubCommitSha` matches). CI run
37426028925: `check`, `rls` and `deploy` success (read with `GITHUB_TOKEN`); the render matrix run 37426029002 success.
No migration, so no schema apply and no RLS read beyond the CI gate. `https://app.inflozo.com/` answers 307 (the
signed-out redirect) and `https://inflozo.com/` 200. The compiler has no product caller until Story 7.18, so nothing a
visitor or the owner reaches changed; there is no owner test (`owner_test: none`). Done on the Deploy commit.
