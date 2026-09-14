---
title: 'Story 4.9 — The string catalog: keys, English defaults and the `{{t}}` contract'
type: 'feature'
created: '2026-09-14'
status: 'done'
baseline_commit: '6a9feefe8cac0036df9db6737789962916f2307a'
owner_test: none
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing you can see changes. This story turns the fixed phrases a theme prints — "Older posts", "Skip to
content", "Built with Inflozo" — into one list the product reads, where every phrase has a permanent name and its
English wording, so that a later screen can let a customer translate or reword them without breaking anything.
It also adds checks that refuse any section printing English words from outside that list, so every section
built from here on can be translated.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-Q6's catalog exists only as appendix-h1's tables, and no code reads it:
- `data-t` and `data-t-attr` are refused by both emitters;
- no module mount carries `data-i18n-*`;
- a design can print "Older posts" as bare text and still validate clean;
- every catalog key in the repository (`reference.*`, `ref.*`, `a1.*`, `a22.*`) is outside the catalog.

The whole contract rests on one premise: Ghost resolves a dotted key from `locales/en.json`. That premise has never
been executed on either major.

**Approach:**
- **One machine copy**, `packages/library/strings/catalog.json`. A check holds it equal to appendix-h1 §3 and renders
  every default through the `intl-messageformat` both majors bundle.
- **Both emitters render `data-t` and `data-t-attr`.** Placeholders pass as `{{t}}` hash params, and the element hides
  when a param is empty.
- **Three refusals, split between the lexical validator and the runtime's render door:**
  - an English literal (V1);
  - an unknown or unrenderable key (V2);
  - a wrong placeholder set (V4).
- **Two more ways a string reaches a page:**
  - a text prop can take its initial value from a `prop` key (S6);
  - a registry module declares the keys it writes, and both emitters stamp them on its mount (S5).
- **`resolveStrings` is the one door an override passes.** A `credit.*` override fails there, and migrations carry
  overrides forward.
- **The recorder captures `{{t}}` on T1 and T3 first.**

## Boundaries & Constraints

**Always:**
- **Cite or execute** (standing rule 1). Planning did two things:
  - read `{{t}}`'s source in both exact releases (npm `ghost@5.130.6` and `ghost@6.58.0`);
  - executed Ghost's own lookup and format code under the libraries both releases pin.

  The results are in Design Notes. The Dev's first task records the same cases on T1 and T3, and the shim is asserted
  against that recording.
- **One copy of each thing:**
  - `catalog.json` is the machine copy and appendix-h1 §3 is the normative table. The check holds them equal, in
    order, in both directions.
  - A key's placeholder set is derived from its default and never stored.
  - No count is written anywhere; the check prints the totals.
- **The format** (S1, S3, S7):
  - **Key:** `namespace.name`, matching `^[a-z][a-z0-9]*\.[a-z0-9]+(_[a-z0-9]+)*$`, grouped by function as
    appendix-h1 groups them.
  - **Default:** never empty. Placeholders are `{snake_case}` and nothing else: no plural, select or number
    argument, and no apostrophe quoting.
  - **Marks:** every `credit.*` key is `locked` and no other key is; a `canvas` key is never `js`.
  - **Removal:** a key is never deleted. It is either `retired` (with its reason) or `supersededBy` a key, and
    exactly one `migrations` entry names that pair.
- **How a string reaches a page:**
  - `.hbs` output reaches a catalog string only as `{{t "key" name=expr}}` — never `{{{t}}}`, never a literal.
  - A `js` key reaches a page only as `data-i18n-*` on its module's mount. In theme output that value passes AD-5's
    brace-safe user-text path.
- **`intl-messageformat` 5.4.3 exactly** (what both majors pin) is a root devDependency, used at build time only.

**Ask First:**
- Adding, rewording or retiring any key.
- Allowing ICU plural or select syntax.
- Any dependency beyond `intl-messageformat` 5.4.3.
- `strings` on any registry row except `countdown`.
- A recording that disagrees with a Design Notes fact.
- Any write to T1 or T3 beyond the probe theme and the one image already uploaded (4.3's Q2).

**Never:**
- **Never edit the design export (R-74).** This story has no screen, so it has no frame and no owner test.
- **None of Epic 7's half:**
  - `locales/` emission, and the Translations surface;
  - ICU validation of a user's override (V9, V10 — Story 7.12);
  - any assertion over a compiled theme (V1, V3, V5–V7 — Stories 7.5, 7.6, 7.12);
  - a diff between library drops (7.27).
- **No category's keys.** D10's sweep, R-3's `post.and_others` and R-5's no-JavaScript notice each land with their
  own category, under S9. The validator is what enforces that order.
- No fixture key (`reference.*`) in the catalog, and no module code.
- No `data-t` on a key that is `retired`, superseded, `js` or `canvas`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A string | `<button data-t="search.trigger_label">Search</button>` | theme: `{{t "search.trigger_label"}}`; canvas: "Search", or the text from the handed map | N/A |
| Placeholders | `<p data-t="post.by author=primary_author.name">By Ana</p>` inside a post | theme: `{{#if primary_author.name}}<p>{{t "post.by" author=primary_author.name}}</p>{{/if}}`; canvas: "By " and the name, with the element removed when the name is empty | N/A |
| A helper param | `data-t="post.updated_on date=updated_at\|date:D MMM YYYY"` | theme: `{{t "post.updated_on" date=(date updated_at format="D MMM YYYY")}}`, guarded on `updated_at`; canvas: the shim's date | a param after the helper's argument → `bad-value`, because the argument runs to the end of the value |
| An attribute | `data-t-attr="aria-label:pagination.label;placeholder:member.email_placeholder"` | `aria-label="{{t "pagination.label"}}"` and the same for the placeholder; canvas: the text | any attribute other than `alt`, `title`, `placeholder`, `aria-label` → `bad-value` |
| V4 | `data-t="pagination.page_of page=pagination.page"`; `data-t="nav.menu x=title"` | refused `catalog-params`, naming `pages` and `x` | validator and runtime both refuse |
| V2 | `a1.menu_open`; `search.overlay_empty` (retired); `countdown.days` (`js`); `comments.placeholder` (`canvas`) | refused `catalog-key`, each with its own reason | validator and runtime both refuse |
| V1 | bare text `Newer`; `aria-label="Main"`; `placeholder="you@example.com"`; `data-text="Read by {total_members} readers"` | the first three are refused at any render that names its `target`, in one error naming every literal (4.6's gate); the `data-text` words are refused `chrome-literal` by the validator | these pass: an element's text replaced by `data-prop`, `data-bind`, `data-t`, `data-helper`, `data-initials`, `data-text` or `data-pagination="numbers"`; an `alt`, `title`, `placeholder` or `aria-label` that a directive writes; `alt=""`; text with no letter or digit |
| S6 | content.json `"submitLabel": { "type": "text", "label": "Button text", "catalog": "member.signup_cta" }`, no value typed | theme: `{{t "member.signup_cta"}}`; canvas: "Subscribe". A typed value is user text | `catalog` on a non-text prop, on a key not marked `prop`, or beside `default` → `catalog-prop` |
| JS strings | `<div data-module="countdown">` | both emitters stamp one attribute per `countdown.*` key: canvas `data-i18n-days="{count} days"`, and the theme the same value with its braces as entities | refused: a declared key that is not a live `js` key, or two keys that derive the same attribute |
| AD-36 | the handed map sets `countdown.ended` to `{{#each}}x` | the `.hbs` carries `&#123;&#123;#each&#125;&#125;x`, and `countdown.days`' `{count}` still substitutes in `core` | N/A |
| Overrides | `resolveStrings({"credit.built_with": "x"})`; `{"nope.key": "x"}`; a migration `{from, to, reason, carryOverride}` | the first throws naming S7; the second throws naming the key; the third copies the override to `to` only when `carryOverride` is set and `to` has no override yet | never silently dropped |
| The copies *(control)* | a key removed from `catalog.json`, or a default changed in one copy only | the check fails, naming the key and the file | N/A |
| Agreement *(control)* | a default containing `''`, `{count, plural, one {#} other {#}}` or `'{'` | the check fails, naming the key and showing both renders, or the throw | N/A |
| The recording *(control)* | `{{t "Plain key"}}` against the probe theme's `locales/en.json` | renders the file's value on both majors; if it does not, no `{{t}}` row counts | a disagreement with Design Notes → HALT |

</frozen-after-approval>

## Code Map

- **`_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/appendix-h1-string-catalog.md`** — the normative
  source.
  - Where things are: S0–S9 `:17-54`, the markers `:58-66`, the §3 tables `:70-349`, §4's totals `:353-375`, §6's
    migration map `:398-418`, V1–V10 `:424-441`.
  - Stale today: S1's "readable-English keys" quote `:26`, §3.7's "nine of them retired" `:212` (eleven rows are),
    and §3.10's reason for `%` `:292`.
- **`packages/library/src/vocabulary.ts`**
  - `HELPERS` `:37-43`, `BINDABLE_ATTRS` `:52-56`, `guardField` `:319`.
  - `isCatalogKey` `:396` checks shape only.
  - `data-text` `:538-548`, `data-t`/`data-t-attr` `:557-566`, `CONSUMED_DIRECTIVES` `:609-610`.
  - JSON import pattern: `src/contexts.ts:14`. The `packages/library/tsconfig.json` include list needs `strings`.
- **`packages/library/src/validate.ts`**
  - The note that the scan is lexical and a tree question belongs to the runtime `:5-14`, `scanTags` `:36-52`,
    `validateMarkup` `:75-267`,
    `validateCategoryContent` `:540`, `validateDesign` `:619-642`.
  - `validate.test.ts`'s `EVERY_DIRECTIVE` `:52-53,69-74`.
  - `tools/stress/test-vocabulary.mjs` requires two things:
    - the archetypes, the reference fixture and the controls sample validate clean (`:59-65,83-91,98-107`);
    - every code has a firing test (`:128-137`).
- **The module registry and `core`**
  - `packages/library/src/registry.ts:68-87` `PropDef`.
  - `src/modules.ts`: `ModuleRow` `:12`; `parseModuleDeclaration` `:33-55` allows one module per element.
  - `modules/registry.json`.
  - `modules/core.js:94-101`: `translate` reads `data-i18n-${name}` and returns `''` when the attribute is absent.
- **`packages/section-runtime/src/core.ts`**
  - `RenderInput` `:101-166`, `Tokens` `:178-211`, `UserText` `:215-247`, `RENDERED_DIRECTIVES` `:255-274`,
    `bindExpr` `:361-367`, `refuseUnrendered` `:444-452`.
  - `checkBindings` `:561`, `emitBindings` `:583` (`data-bind` `:598-629`).
  - `applyProps` `:863-903`: an empty value keeps the authored text (`:892-897`).
  - `stampControls` `:987` strips undeclared root `data-*`, so stamping comes after it.
  - `renderTree` `:1092-1196`, `renderTheme` `:1257`, `renderCanvas` `:1272`.
  - `marks.ts:47-56`: `escapeUserText`.
- **Runtime tests**
  - `agreement.test.ts`: `agree()` `:92-98`, the partition `:702-725`, the leak fixture `:731-772`, and the
    `data-module` test to copy `:785-803`.
  - `ad36.test.ts:186-200`.
- **`packages/ghost-shim`**
  - `src/index.ts:313-328` `t()`, which nothing calls yet (DW-99), and `:62-64` `textValue`.
  - `src/contract.test.ts:692-702`; the fixtures `fixtures/ghost{5,6}/index.json:173`.
- **`tools/probe/record-shim.py`**
  - `record()` `:240`, the refusal `:256`, the restore `:337-338`; `theme-shim/index.hbs:31`.
  - **`--help` uploads a theme**, so read the docstring instead.
- **Fixtures**
  - `packages/library/fixtures/reference-design/index.html:15-68` and `fixtures/content.json`.
  - `fixtures/controls/1/index.html:12`, read by `apps/web/lib/controls-review.ts:31-33`.
  - `tools/stress/sections.js:26,35,43,150,179,206,223`.
  - `tools/stress/build.js:220-221`, which writes invented keys today.
- **`docs/section-authoring.md`** — Behaviour modules `:505`, `ctx.t` `:552`, rendered status `:630-642`, gap row 13
  `:858,957`, exit 3 `:984-1006`, §4 `:1060`, "not checked" `:1119`.
- **Propagation targets**
  - `ARCHITECTURE-SPINE.md` (in `architecture/architecture-Inflozo-2026-08-19/`): AD-2 `:104`, the parser row
    `:448`, `strings/catalog.json` `:493`.
  - `tools/doc-audit.py`: appendix-h1's row `:130`; `:788` is the shape of a tool row.
  - `VERIFY-AT-BUILD.md:157`.
  - `MEASUREMENTS.md`: §43 `:3092` is the last section.
  - `_bmad-output/implementation-artifacts/deferred-work.md`: DW-99 `:2774`; DW-140 is the last entry.
  - `epic-4-context.md:148`.
- **`supabase/migrations/20260904120000_complete_schema.sql:342-354`** — `translation_overrides` and its
  `credit_namespace_locked` check.

## Tasks & Acceptance

**Execution:**
- [x] **FIRST — record on T1 and T3.** Files: `tools/probe/theme-shim/` (`locales/en.json`, `index.hbs`, `post.hbs`),
  `tools/probe/record-shim.py`, `packages/ghost-shim/fixtures/ghost{5,6}/`, `packages/ghost-shim/src/contract.test.ts`.
  - Record these cases, which settle the Design Notes table on both majors:
    - the plain control;
    - a dotted hit, and a miss on a nested object;
    - a missing key;
    - params from a path, an undefined param, and an omitted param;
    - `minutes=reading_time` on `post.hbs` (probe family 11), and a `(date …)` param;
    - escaping in text and in an attribute;
    - `(t …)` inside `{{plural}}`.
  - The contract test asserts `t()` on every row the shim renders. The omitted param and `{{plural}}` are recorded as
    facts only Ghost produces.
  - Why first: AD-23 — the contract rests on a recording, not on a source read.
- [x] `package.json` and `pnpm-lock.yaml`:
  - add `intl-messageformat` 5.4.3;
  - `test` ends with `node tools/check-catalog.mjs`.
- [x] `packages/library/strings/catalog.json`, `src/catalog.ts`, `src/catalog.test.ts`, `src/index.ts`,
  `tsconfig.json`:
  - Transcribe appendix-h1 §3, in its order, as
    `{ about, keys: { key: { en, marks[], retired?, supersededBy? } }, migrations: [] }`.
  - `catalog.ts` exports the catalog, `placeholders(key)`, `i18nAttr(key)` (S5) and
    `resolveStrings(overrides, catalog?)`.
  - The tests cover:
    - every format rule;
    - S5's own example;
    - `resolveStrings`' refusals, and its carry-forward against a synthetic map.
- [x] `src/vocabulary.ts`:
  - **`data-t` grammar:** the key, then space-separated `name=spec` pairs. `spec` uses `data-bind`'s grammar, and a
    helper's argument runs to the end of the value.
  - **`data-t-attr`:** entries split on `;`. Each entry is `attr:` followed by `data-t`'s grammar, and `attr` is one
    of the four text attributes.
  - Key membership is read from the catalog.
- [x] `src/validate.ts`, `src/registry.ts`, `validate.test.ts`:
  - **`chrome-literal`** for the words in a `data-text` template. That is a lexical question; the tree half of V1 is
    the runtime's, as the note at `:5-14` requires.
  - **The other new codes:** `catalog-key`, `catalog-params`, `catalog-prop`.
  - **Types and fixtures:** add `PropDef.catalog`; move `EVERY_DIRECTIVE` onto real keys.
  - One firing test per code.
- [x] `modules/registry.json` and `src/modules.ts`:
  - A row may carry an optional `strings`. Each entry must be a live `js` key, and the derived attributes must be
    unique.
  - `countdown` declares every `countdown.*` key, because appendix-h1 §3.3a names the module.
- [x] `packages/section-runtime/src/core.ts` and `src/index.ts`:
  - Both directives join `RENDERED_DIRECTIVES`.
  - **Each param** is scope-checked and guarded on `guardField(spec)`, with `includeZero` for a number. A param that
    carries a helper is emitted as a sub-expression.
  - **Canvas:** renders `t()` over `RenderInput.strings`, which defaults to the catalog's English.
  - **Props and mounts:** `applyProps` takes the S6 branch, and `data-i18n-*` is stamped after `stampControls`.
  - **V1's tree half:** whenever a render names its `target`, beside 4.6's scope check, one error names every bare
    text node and every `alt`, `title`, `placeholder` or `aria-label` value that holds a letter or digit outside the
    matrix's exempt set.
- [x] `agreement.test.ts` and `ad36.test.ts`:
  - both directives in the leak fixture;
  - `agree()` for text, an attribute, params, S6 and the countdown mount;
  - the brace vector.
- [x] Fixtures — `packages/library/fixtures/reference-design/`, `fixtures/controls/1/`, `tools/stress/sections.js`,
  `tools/stress/build.js`:
  - **Reference design keys:** the `reference.*` keys become `search.trigger_label`, `card.featured`,
    `member.email_placeholder` (the label, `aria-label` and placeholder) and `member.upgrade`.
  - **Reference design markup:**
    - the pager takes `pagination.label`, `.newer` and `.older`;
    - `data-text` keeps its tokens only;
    - the `<noscript>` and "Next issue" become content props;
    - `submitLabel` takes `catalog`.
  - **Stress archetypes:** each literal takes the key in the Design Notes table, or a prop.
  - **`build.js`** writes `locales/en.json` from the catalog: every key except the `canvas` one (S4).
- [x] `tools/check-catalog.mjs` and `tools/doc-audit.py`:
  - The check:
    - holds appendix-h1 §3 equal to `catalog.json`;
    - runs Ghost's format under 5.4.3 against `t()` for every key;
    - prints the totals;
    - carries a control for each rule (the matrix rows marked *control*).
  - The doc gate blocks an uncatalogued tool, so it needs a row.
- [x] `docs/section-authoring.md` — rewrite exit 3 on real keys, covering:
  - the grammar and the guard;
  - the four attributes;
  - S6's `catalog` and the registry's `strings`;
  - S5 and the entities;
  - the new refusals in §4, with V1's tree half named beside binding legality in "not checked", as the runtime's.
- [x] **Propagate** (standing rule 3):
  - **appendix-h1:**
    - rules S1, S3, S5, S6 and S9;
    - §3.10's reason for `%`;
    - every §3 heading loses its key count and §4 becomes the check's printed totals, so no count is left to go
      stale (standing rule 4);
    - §6 is marked illustrative.
  - **The spine:** AD-2's catalog sentence.
  - **`tools/doc-audit.py`:** appendix-h1's row.
  - **`MEASUREMENTS.md`:** a new §44.
  - **`VERIFY-AT-BUILD.md` row 32:** owner becomes 7.12, and 5.130.6 is recorded.
  - **`deferred-work.md`:** DW-99 (its `t()` part closes), and DW-141 to DW-145.
  - **The epic context:** sub-bullets.

  Then grep (standing rule 7) for `reference.`, a `data-t` value starting `ref.`, `a1.menu_open`, `a22.email`,
  `a17.editors_pick`, `{category}.{name}`, "readable-English" and "nine of them retired".

**Acceptance Criteria:**
- Given `catalog.json` and appendix-h1, when `pnpm check` runs on Node 24, then `check-catalog: PASS` prints the
  derived totals and every I/O row holds, and each control fails when its subject is broken (FR-Q6, S1–S9).
- Given the recorder, when it runs on T1 and then on T3, then:
  - both fixtures carry every case;
  - the plain control rendered the file's value;
  - the previous theme is active again and the probe theme is gone;
  - the contract test passes on both (standing rules 1 and 2).
- Given the reference design, the controls sample and the stress archetypes, then:
  - validated, each is clean and carries no `reference.*` key;
  - rendered with a named `target`, the controls sample and the archetypes raise no chrome literal;
  - `/controls` renders;
  - the gscan harness scores 0/0 on both majors.
- Given the gates, when `pnpm check`, `pnpm build` and `python3 tools/doc-audit.py --check` (twice) run, then all
  are green, and nothing under `packages/library/modules/` changes except `registry.json`.

### Review Findings

Five layers ran on 2026-09-14 — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the
Real-infra verifier — and the real infrastructure held on every claim (see Verification). 2 decisions, 12 patches,
3 deferred, 26 dismissed as noise or already handled.

- [x] [Review][Decision] Q1 — what a blank translation override means: `resolveStrings` passed `""` through, so
  the canvas printed nothing, the locale file carried `""`, and Ghost printed the raw key on the live site (recorded:
  an empty value prints the key). **Ruled option 2 (owner, 2026-09-14, R-106): the door refuses a blank, naming the
  phrase** — `resolveStrings` throws on a blank or whitespace override, tested [packages/library/src/catalog.ts]
- [x] [Review][Decision] Q2 — a catalog-linked prop can never be blanked: "untouched" is an empty value, so a customer
  who clears the label gets the catalog string back. **Ruled option 1 (owner, 2026-09-14, R-107): kept; no change**
  [packages/section-runtime/src/core.ts `applyProps`]
- [x] [Review][Patch] `data-index` replaces the element's text but was not in `TEXT_DIRECTIVES`, so the reference design
  failed V1's tree half on its `1` sample — and nothing ran the check over it; the hand-list regex of old prefixes is
  deleted (V2 already runs over both fixtures) [packages/library/src/validate.ts:79 · tools/stress/test-vocabulary.mjs]
- [x] [Review][Patch] No test observed the canvas removing a `data-t-attr` element whose param is empty; the theme's
  guard was the only side asserted [packages/section-runtime/src/agreement.test.ts]
- [x] [Review][Patch] S6 through `data-prop-attr` had no test on either emitter, and a catalog-linked prop bound into
  `href`/`src`/`poster` would have put a `{{t}}` value — or an override — past `safeUrl`; both emitters now refuse
  it, and the branch is tested [packages/section-runtime/src/core.ts `applyProps` · agreement.test.ts]
- [x] [Review][Patch] The runtime's "one attribute holds one value" refusal (`data-t-attr` beside `data-bind-attr`)
  had no row in the refusal table [packages/section-runtime/src/agreement.test.ts]
- [x] [Review][Patch] The contract test asserted the `index` recording's `{{t}}` rows only; `index-page-2` carries the
  same rows with its own page number and is now asserted [packages/ghost-shim/src/contract.test.ts]
- [x] [Review][Patch] `stampControls` kept root `data-i18n-*`, a branch nothing can reach: `refuseCatalogMisuse` throws
  on any authored one first and `stampStrings` runs after [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] `archive.posts_one` / `posts_many` are written for `{{plural}}` and nothing stopped
  `data-t="archive.posts_many"`, which would print "% posts" on the live site; a default with a bare `%` is now a
  `catalog-key` refusal, derived from the default like the placeholder set, never a mark [packages/library/src/catalog.ts]
- [x] [Review][Patch] A migration with `carryOverride` into a `credit.*` key would have written an override onto the
  locked namespace through `resolveStrings`; `catalogFailures` refuses it [packages/library/src/catalog.ts]
- [x] [Review][Patch] The recorder's leak assertion ran over `values` only; the `raw` and `verbatim` blocks it files
  were unchecked. It now runs over everything written [tools/probe/record-shim.py]
- [x] [Review][Patch] Appendix-h1 S1 said "Ghost's documentation advises readable-English keys" with no citation — a
  claim about the platform (standing rule 1) and the spec's own grep target; replaced by Casper's `locales/en.json`,
  read in source [appendix-h1-string-catalog.md:26]
- [x] [Review][Patch] Docs: row 13 was titled "static and bound text in one node" while its own example has no static
  text; §4's rows name the plural key, `data-index` and the URL-attribute refusal [docs/section-authoring.md]
- [x] [Review][Patch] `prd.md` FR-Q6 still said Ghost "falls back to `en` for any key the active locale does not
  resolve", which §44(f) disproved; the Dev left the PRD unedited as a judgement call, but a false claim about Ghost in
  a live document is standing rule 1's, so the sentence is corrected with the citation [prd.md FR-Q6]
- [x] [Review][Defer] Nothing asserts S5's inverse — that every live `js` key is declared by the module that writes
  it once that module exists [packages/library/src/modules.ts] — deferred, DW-146
- [x] [Review][Defer] The recorder's cleanup skips the probe theme's DELETE when re-activating the previous theme
  raises [tools/probe/record-shim.py `finally`] — deferred, pre-existing since Story 4.7, DW-147
- [x] [Review][Defer] The copy check compares retired-or-not only: appendix-h1 §3 has no superseded column, so the
  first `supersededBy` cannot be held equal between the copies [tools/check-catalog.mjs] — deferred, DW-148

## Spec Change Log

## Design Notes

**What Ghost does with `{{t}}`.** Read in both releases' npm tarballs. The Dev records it on T1 and T3 and writes it
up as MEASUREMENTS §44.

| Fact | 5.130.6 | 6.58.0 |
|---|---|---|
| A theme uses fulltext mode and reads `locales/<site locale>.json`. It falls back to `en.json` only when that whole file is missing | `ThemeI18n.js:13-15,34-36`; `I18n.js:106-128` | `theme-i18n.js:13-15,34-36`; `i18n.js:99-121` |
| A dotted key is looked up as ONE key | `I18n.js:143-150`, `jp.stringify(['$', key])` | `i18n.js:139-142`, `get(strings, [key])` |
| A missing key, or an empty value, prints the key | `I18n.js:146,150` (`\|\| fallback`) | `i18n.js:132,142` |
| `new MessageFormat` sits outside the try; a format error renders "An error occurred" | `I18n.js:219-234` | `i18n.js:208-223,269-271` |
| Bundled `intl-messageformat` | 5.4.3 (`package.json:174`) | 5.4.3 (`package.json:141`) |
| `{{plural}}` replaces the FIRST `%` and returns an unescaped `SafeString` | `plural.js:30-36` | identical file |
| i18next is used only behind `themeTranslation`, a private labs flag | — | `t.js:33-55`; `labs.js:42-51` |

**Executed in a scratch install** (2026-09-14), with `intl-messageformat` 5.4.3 and the two lookups:
- every key in appendix-h1 §3 hits under both lookups, and every default constructs;
- with sample params, Ghost's render equals the shim's `t()` on every key;
- an omitted param renders "An error occurred";
- an `undefined`, `null` or `""` param leaves a hole ("Page 2 of ");
- `It's` and `'quoted'` survive, but `It''s` renders `It's`;
- `{count, plural, …}` formats, while `'{'`, `{` and `{a b}` throw;
- a number prints as `String(n)`.

Three rules follow from these results:
- **A param is guarded,** because the hole is exactly FR-H8's unguarded state.
- **V4 is exact,** because an omitted param shows on the page.
- **Placeholders are plain,** because `core.js`, the shim and the i18next backend substitute names and nothing else.
  This is `verify-mechanical-ghost-claims.md` §10's advice, which was never propagated.

**Why the element hides.** FR-H8 guards every binding. The only static fallback a `data-t` element has is its
authored English sample, and V1 refuses exactly that literal. So the one legal default is the one media bindings
already use: hide. `data-empty` on a `data-t` element is refused.

**S6's "untouched" is an empty value** — the same test FR-H8's text default already applies at `applyProps`
(`core.ts:892-897`). So Epic 5's editor keeps a catalog-linked prop empty until the customer types into it, and a
reset empties it again.

**The namespaces are appendix-h1's.**
- AD-2 (`ARCHITECTURE-SPINE.md:104`) says keys are namespaced per category "so ~34 independent category stories
  cannot collide".
- Appendix-h1 groups them by function instead: one "Read more" to translate, not one per category. `prd.md:23` makes
  appendix-h1 normative, and this story's criteria name it.
- A collision cannot happen, for three reasons:
  - categories run one at a time (R-85);
  - a key is added before its design (S9);
  - the check refuses a duplicate.

AD-2's sentence is therefore corrected.

**`catalog.json`, in outline:**
```json
{ "keys": {
    "pagination.label": { "en": "Pagination", "marks": ["a11y"] },
    "pagination.load_more_loading": { "en": "Loading…", "marks": ["js"] },
    "member.signup_cta": { "en": "Subscribe", "marks": ["prop"] },
    "search.key_hint_mac": { "en": "⌘K", "marks": ["js"], "retired": "R-24 — ⌘K is sodo-search's" },
    "credit.built_with": { "en": "Built with Inflozo", "marks": ["locked"] } },
  "migrations": [] }
```
How the check compares the two copies:
- An appendix-h1 marks cell that holds prose ("as above", `comments.count_one`'s note) contributes no marks.
- A status cell compares as `retired` or not. The reason sentence is `catalog.json`'s own.

**`data-i18n-*` in theme output is user text.**
- An override may contain a brace, and Handlebars parses attribute values. So the value goes through `UserText`,
  which writes a brace as `&#123;`.
- The browser decodes the entity, and `core` reads `{count}` intact.
- That is S5's "emitted intact", satisfied in the DOM where `core` reads it.

**The archetype literals:**

| Literal | Becomes |
|---|---|
| `aria-label="Main"` | `a11y.main_navigation` |
| `aria-label="Footer"` | `a11y.footer_navigation` |
| `aria-label="Search"` | `search.trigger_label` |
| `placeholder="you@example.com"` | `member.email_placeholder` |
| `aria-label="Share N"` | `post.share` |
| `aria-label="Social N"` | a content prop |

**The new deferred-work entries:**

| Entry | What it records | Owner |
|---|---|---|
| DW-141 | `(t …)` inside `{{plural}}` is not escaped, so an override can inject markup there | 7.12 |
| DW-142 | Override validation must refuse what 5.4.3 refuses and what plain placeholders forbid; the spine's "current" `@formatjs` parser accepts `'{'`. The "whole-page 500" is read in source, not observed: MEASUREMENTS §15j saw a 400 for a template error | 7.12 |
| DW-143 | Nothing checks that a key survives from one library drop to the next | 7.27 |
| DW-144 | `countdown.days` and `countdown.hours` read "1 days" and "1 hours" | the story that writes `countdown` |
| DW-145 | An untouched content default with no catalog key ships English on a non-English site (`reconcile-designs.md:5929`, never ruled) | 7.12 |

## Verification

**Commands:**
- `pnpm install --frozen-lockfile && pnpm check` (Node 24) -- expected: exit 0. `check-catalog: PASS` prints the
  totals; the contract, agreement and AD-36 tests are green.
- `python3 tools/probe/record-shim.py` (read its docstring first; `--help` uploads) -- expected: T1 and T3 recorded,
  the previous theme re-read as active, and the probe theme deleted.
- `cd tools/stress && npm install && node build.js && node gate.js theme` (Node 24) -- expected: 0 errors and
  0 warnings on gscan 4.49.7 and 6.4.2.
- The controls -- expected: each fails naming its subject. The check's controls run on every run; a key removed
  from `catalog.json` and a default edited in one copy are run by hand in a scratch copy, then restored.
- `pnpm build`, then `python3 tools/doc-audit.py --check` twice -- expected: exit 0, PASS.

**Real infrastructure (R-82):**
- **T1 and T3:** the recorder's renders.
- **Supabase production**, read only through `SUPABASE_DB_POOLER_URL`: `credit_namespace_locked` exists on
  `translation_overrides`. Control: an invented constraint name returns no row.
- **GitHub Actions:** the `check` log of the Dev push shows `check-catalog: PASS`.
- **Vercel:** the production deployment is READY.
- Resend and Dodo are not touched.

**Results (Dev, 2026-09-14):**
- `pnpm check` on Node 24.18.1 — exit 0. `check-catalog: PASS` printed its derived totals table; every control fails
  when its subject is broken, in the check's own output: a removed key, a default changed in one copy, order/mark/
  retirement drift, a duplicate key in the bytes, `''`, an ICU plural, `'{'`, and an unlocked `credit.*`. The
  contract, agreement, AD-36, catalog, validate, modules and `controls.test.ts` (the `/controls` render) suites are
  green, and so are `check-baseline` and `test-vocabulary.mjs`. The package test runs print their own counts.
  `pnpm install --frozen-lockfile` was not re-run locally: pnpm refused to purge `node_modules` with no TTY. The
  clean install is CI's.
- **Hand controls**, run in a scratch copy and then restored: a key removed from `catalog.json`, and a default edited
  in appendix-h1 only. Each failed, naming the key and both files.
- `pnpm build` — exit 0.
- `cd tools/stress && node build.js && node gate.js theme` — gscan 4.49.7: 0 errors / 0 warnings; gscan 6.4.2:
  0 errors / 0 warnings. `npm install` there hit a permission error on `node_modules/.package-lock.json`, so the run
  used the existing install.
- `git status` under `packages/library/modules/` shows only `registry.json` changed.

**Real infrastructure (R-82), what each returned:**
- **T1 `ghost6.inflozo.com` (6.58) and T3 `ghost5.inflozo.com` (5.130)** — `python3 tools/probe/record-shim.py` with
  `GHOST6_*` / `GHOST5_*`, staff token `GHOST{5,6}_STAFF_ACCESS_TOKEN`. The two majors returned identical values:
  - the control `{{t "Plain key"}}` → "Plain value, read from locales/en.json";
  - dotted hit → the value;
  - nested miss → `probe.nested_miss`;
  - missing key → `probe.no_such_key`;
  - params from a path → "Page 1 of 3", and an undefined param → "Page 1 of ";
  - an omitted param → "An error occurred";
  - `minutes=reading_time` on `post.hbs` → "0 min read" (the raw field, not the helper);
  - a `(date …)` param → "Updated 20 Aug 2026";
  - escaping: text and `title=""` are both entity-escaped, and an HTML param is escaped;
  - `(t …)` inside `{{plural}}` → "33 posts <i>many</i>", unescaped (DW-141).

  Every row agrees with Design Notes, so there is no HALT. MEASUREMENTS §44 carries the rows. Afterwards, a separate
  read-only `GET themes/` on both returned `casper` active and no `inflozo-probe-shim` installed. Older probe themes
  from earlier stories (`inflozo-probe-13`, `-all`, `-contexts`) remain, untouched.
- **Supabase production**, `SUPABASE_DB_POOLER_URL`, in a read-only transaction — `pg_constraint` returned one row:
  `credit_namespace_locked` on `translation_overrides`, `CHECK ((catalog_key !~~ 'credit.%'::text))`. The control, an
  invented name `no_such_constraint_4_9` in the same query, returned no row.
- **GitHub Actions** (`gh` with `GITHUB_TOKEN` as `GH_TOKEN`) — run 34864220303 on `c3dc77b3`: `check`, `rls` and
  `deploy` all `success`. The `check` log shows `check-baseline: PASS` and `check-catalog: PASS — 151 keys in 14
  namespaces agree with appendix-h1 and render under intl-messageformat 5.4.3` after the clean
  `--frozen-lockfile` install; `deploy`'s `vercel build --prod` printed the same line.
- **Vercel** (REST `v6/deployments` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`) — production deployment
  `dpl_HipkFwyXaChydeb89iuqobRMGYvu` for `c3dc77b3abdafd2cf8dea1949f6f7e42dd65852d`: `READY`.
- Resend and Dodo are not touched.

**Results (Review, 2026-09-14):**
- Five layers ran; the Real-infra verifier re-executed every Verification claim with a negative control each:
  - **T1 and T3** — read-only `GET /ghost/api/admin/themes/` with `GHOST6_STAFF_ACCESS_TOKEN` / `GHOST5_STAFF_ACCESS_TOKEN`
    (the Admin API key is refused by Ghost itself for this read: T1 403, T3 501): both `HTTP 200`, `casper` active,
    `inflozo-probe-shim` absent, the older probe themes untouched. Control: the same token id with a zeroed secret →
    `401 Invalid token: invalid signature` on both. All twelve fixtures carry `captured 2026-09-14`, the recorder's
    command, the Ghost version and every `{{t}}` row the spec lists, identical across majors; the contract test passes
    on both. The recorder was not re-run — the read-only evidence settles that the recording is real and the servers
    were restored.
  - **Supabase production**, `SUPABASE_DB_POOLER_URL`, `BEGIN READ ONLY … ROLLBACK` through `postgres:17-alpine`'s
    `psql` (the RLS gate's image; no local psql): `credit_namespace_locked` on `translation_overrides`,
    `CHECK ((catalog_key !~~ 'credit.%'::text))`, one row; the control name returned none. The diff adds no migration
    (R-99: nothing to apply).
  - **GitHub Actions** (`GITHUB_TOKEN`): run 34864220303's `check` log shows the `--frozen-lockfile` install then
    `check-catalog: PASS`. Control: `gh run view 1` → 404.
  - **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): production `READY` for `df25b66b`, `c3dc77b3` and
    `6a9feefe`. Control: a bogus bearer → 403.
  - **Local**: `node tools/check-catalog.mjs` PASS with the totals; the hand control (a key deleted from the working
    `catalog.json`) failed naming the key and both files, then restored byte-for-byte.
- After the patches, on Node 24.18.1: the library, section-runtime and ghost-shim suites are green (each prints its
  own count), `check-catalog: PASS`, `test-vocabulary.mjs` passes with the reference design now inside the tree-half
  check, and the gscan harness result is recorded in the Review commit's line.

**Results (Deploy, 2026-09-14):**
- **GitHub Actions** (`GITHUB_TOKEN`): run 34876197744 on `a4796ddc` (the R-106/R-107 ruling commit) — `check`, `rls`
  and `deploy` all `success`. The `check` log shows `check-catalog: PASS — 151 keys in 14 namespaces agree with
  appendix-h1 and render under intl-messageformat 5.4.3` after the clean install.
- **Vercel** (REST `v6/deployments`): production deployment `dpl_2RvVfr3peXUxvpND9Ss6aNVyUdHo` for `a4796ddc`:
  `READY`.
- **Deployment:** https://inflozo-7k2hrub52-umangkagathara.vercel.app (production, `a4796ddc`)
- No migration: the diff since Dev's Supabase check adds none (R-99 — nothing to apply).
- This story has no screen (`owner_test: none`); marked `done` in `sprint-status.yaml` on this push rather than
  waiting on an owner test.

**Judgement calls the spec left open, for the review:**
- `data-empty` on a `data-t` element, a second text directive beside `data-t`, and an authored `data-i18n-*` are
  refused under the existing `bad-value` code.
- `stampControls` kept `data-i18n-*` — removed at the review as unreachable (an authored one is refused earlier, and the stamp runs later); a control named `i18n-…` is still refused.
- S6's `catalog` also applies to `data-prop-attr` — into the four text attributes only, since the review.
- The controls sample's "Next issue" became the prop `nextIssueLabel`, so `/controls` shows one more row.
- FR-Q6 said Ghost falls back to `en` per key, but the source falls back only per file. The Dev left `prd.md` alone;
  the review corrected the sentence with the §44 citation (standing rule 1), beside MEASUREMENTS §44(f) and
  VERIFY-AT-BUILD row 32, which 7.12 owns.

## Questions for the owner

**Q1. When a customer clears a translated phrase and leaves it blank, what should the site show?**

Later, the Translations screen (Story 7.12) will list every fixed phrase — "Older posts", "Subscribe", "Search" — and
let a customer reword each one. This story builds the door every such rewording passes on its way into a theme.
Today that door lets a blank through: the editor would show nothing where the phrase goes, and the live site would
print the phrase's internal name, because that is what Ghost does with an empty entry (recorded on both test servers).

Example: a customer opens Translations, selects "Older posts", deletes the text and saves. On the canvas the "Older
posts" button has no label. On the live site the button reads `pagination.older`.

1. **A blank means "use the standard wording" (RECOMMENDED).** The door treats a blank as if nothing had been typed,
   so the button reads "Older posts" again on both the canvas and the live site; the Translations screen never stores
   a blank. Nothing is refused and nothing is lost.
2. **A blank is refused.** The build stops with a message naming the phrase, and the customer has to type something
   before the site can be published.
3. **A blank ships blank.** The canvas shows no label and the live site prints the internal name, as today.

**Ruled: option 2 (owner, 2026-09-14).** Recorded as **R-106** in `reconcile-designs-decisions.md` §A26; the
Translations surface (Story 7.12) inherits it.

**Q2. A button label that comes from the phrase list can never be made empty. Is that right?**

Some editable texts — the "Subscribe" on a sign-up button — start from the phrase list rather than from words the
designer typed. This story decided (Design Notes) that "untouched" means "empty": until the customer types, the button
shows the phrase, and clearing it shows the phrase again. The consequence is that such a label cannot be blank, so a
design that wants an icon-only button must use an ordinary text field for its label instead.

Example: a customer clears the "Subscribe" text on a sign-up button to leave only the arrow icon. The button reads
"Subscribe" again.

1. **Yes, keep it (RECOMMENDED).** Clearing means "back to the standard wording", and a design that wants an
   icon-only button is drawn with an ordinary text field. No button is ever left without a readable name.
2. **No — let a customer blank it.** The button then has no visible or spoken name unless the design carries a
   separate one for screen readers, which the accessibility scan (Story 4.11) would refuse.

**Ruled: option 1 (owner, 2026-09-14).** Recorded as **R-107** in `reconcile-designs-decisions.md` §A26.
