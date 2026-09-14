---
title: 'Story 4.6 — Context-aware binding and empty-value guards'
type: 'feature'
created: '2026-09-13'
status: 'done'
baseline_commit: '4d28a05c0035c7141865f63ab0f6ac1e19083d4c'
owner_test: none
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing a customer can see changes in this story. It teaches Inflozo, checked against what your two test
Ghost sites actually print, which Ghost information exists on which kind of page and on which Ghost version —
a post's title exists on a post page but not on the home page — so no section can be built to show something
that would print as a silent blank. It also fixes what shows when information is missing: words fall back to
the section's own wording, a missing picture takes its frame with it instead of leaving a broken image, a zero
still shows as zero, and a person with no photograph shows initials — two letters for a list you typed, one
letter for a writer from Ghost.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Ghost compiles themes without strict mode, so a binding used where its field does not exist
prints an empty string with no error at build, deploy or runtime, and passes gscan
(`appendix-b1-template-contexts.md` §0) — yet nothing in the platform knows where a field exists.
`bindingContext` is checked for membership only (`packages/library/src/validate.ts:321-335`) and no render
reads it; the validator is lexical and names this missing half itself (`validate.ts:10-12`, `:216-219`); and
the stress harness places `data-repeat="navigation"` (Ghost's key is `@site.navigation`) and a context-path
`data-repeat="tiers"` (tiers exist only through `{{#get}}`, appendix §5) on every template it compiles, both
printing nothing on a real Ghost, unchallenged (`tools/stress/sections.js:37`, `:115`). FR-H8's guard is always
present since Story 4.2, but three holes remain: `data-empty="fallback"` on a URL attribute guards the **attribute** and ships the design's placeholder as a live relative URL
(`packages/section-runtime/src/core.ts:541-548`); a number that is legitimately `0` takes the fallback — a
post whose API `reading_time` is `0` prints "1 min read" on both majors
(`packages/ghost-shim/fixtures/ghost{5,6}/post.json`); and the canvas prints a bare `reading_time` as the raw
number (`core.ts:738-741`). The one designed substitute, the avatar's initials (R-2), does not exist.

**Approach:** Put the Template Context Matrix in one data file in `packages/library`, asserted against
recordings a new probe takes from T1 and T3 and against Ghost's own source at every version gate, and read it
through two pure functions: is this path bindable here, and what may be offered here. The runtime computes each
binding's scope as it walks and refuses by name every binding the matrix does not allow whenever a render names
its template; the same walk returned as a list is the re-validation a move or duplicate calls. Close the guard's
three holes and add `data-initials` for the typed-list avatar.

## Boundaries & Constraints

**Always:**
- **Cite or execute** (standing rule 1, AD-23). The matrix is transcribed from `appendix-b1-template-contexts.md`,
  then every row is asserted against recordings, never against the prose: what each template and scope renders
  on T1 (6.58.0) and T3 (5.130.6), the whole Content API row of every resource the probe rendered, and Ghost's own
  `core/shared/settings-cache/public.js` and `default-settings.json` at each version gate and at the release
  before it. Where a recording and the appendix disagree, the recording wins and the appendix is corrected
  (its own rule, `:13`).
- **A control that did not pass voids the run** (standing rule 2). The probe carries controls — a root
  `{{title}}` on `post.hbs` prints empty while `{{#post}}{{title}}{{/post}}` beside it prints the title, and a
  misspelt field prints empty in every scope — and the recorder writes nothing if one fails.
- **One copy.** The matrix is `packages/library/contexts/matrix.json`; the recorder reads those bytes, and
  `bindable` and `offerBindings` in `packages/library/src/contexts.ts` are what the runtime, the tests and, in
  Epic 5, the editor call. No field list is restated anywhere else.
- **`{{#post}}` on both templates, opened by the template, never `{{#page}}`** (FR-H7, `prd.md` §7.4). A section
  compiled for `post.hbs`, `page.hbs` or a membership `custom-{name}.hbs` is evaluated inside the one post block
  its template opens around the body. FR-J5's `<article class="{{post_class}}">` needs that block, and a section
  opening a second one would nest inside the first and render nothing. The matrix names the block, and a
  section's own text carries none, so one design compiles byte-identically to both templates.
- **FR-H8, finished.** Every bound value compiles inside `{{#if <the bound field>}}` — never `{{#has}}`, never
  `{{#unless}}`. A field the matrix types `number` guards as `{{#if f includeZero=true}}` and is present at `0` on
  the canvas (Handlebars 4.7.9 `helpers/if.js`; gscan 6.4.2's one-argument rule counts positional params only —
  both read in source). A binding into `href`, `src`, `poster` or `srcset` hides its element, and
  `data-empty="fallback"` on one is **refused** by the validator and the runtime alike.
- **The avatar's two forms** (R-2; drawn in `P0-5 Populate From Panel.dc.html:214-273`, rule 4 of
  `P0 Editor Primitives - Spec.md:621-627`). Two initials are baked at compile only from a `text` prop the user
  typed, through `data-initials`. A person from Ghost shows one letter through the design's own stylesheet over
  the bound name, with the photograph's media guard removing the image. `data-initials` on anything but a typed
  text prop, or inside a Ghost repeat, is refused, so a list of Ghost people can never carry two letters and the
  two forms cannot meet in one list.
- **Purity** (AD-1): no `Intl`, no locale method, no clock; a version compares numerically as `x.y.z`.
- **Counts are derived** — no count of fields, templates, gates or refusals in code, docs or tests.

**Ask First:**
- Any write to T1 or T3 beyond uploading and activating one generated probe theme and restoring the previous
  theme in a `finally` — no content, no settings, no private mode, no custom-template assignment.
- Either major refusing, at upload, a probe theme that carries `{{#if f includeZero=true}}`: the number guard
  would be unshippable.
- Any npm dependency, or any change to `packages/library/fixtures/reference-design/` beyond one `data-initials`
  use (`tools/stress/test-vocabulary.mjs:93-97` requires every directive once).

**Never:**
- Never edit the design export (R-74). `A1 Headers - Spec.md:1088` says the site's social accounts "arrived in
  6.38.0", while Ghost's source has their settings and `@site` keys from 6.36.0; that reaches A1's category story
  through the ledger, not the export.
- No editor surface, no binding picker, and no move or duplicate action. Nothing in `epics.md` offers moving or
  duplicating a section onto another template except this story's own criterion; 4.6 ships the check that
  action will call, and the ledger records that no story owns the action.
- No `@custom.*` binding (theme settings are FR-Q3's, Epic 7) and no `@member` value binding (R-28: a member's
  details are never printed into the page) — both refuse by name.
- No `routes.yaml` route form of `custom-{name}.hbs` (FR-I2), no execution of `private.hbs` (it needs private
  mode), and no rendering of `data-if`, `data-else`, `data-text` or `data-target` — each stays refused by name.
- Never parse Handlebars; never normalise a recorded value on either side of a comparison.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A field in its scope | `data-bind="title"` inside `data-repeat="posts"`, target `index.hbs` | renders on both emitters as today | N/A |
| The wrapper rule | `data-bind="title"` at the section root, target `index.hbs` | refused: the sentence names `title`, `index.hbs`, the root scope, and where `title` lives | the render throws one error naming every refused binding |
| Post and page | root `title`, `url`, `feature_image` bindings, targets `post.hbs` and `page.hbs` | allowed on both; the two theme texts are byte-identical and carry neither `{{#post}}` nor `{{#page}}` | N/A |
| A misspelt path | `data-repeat="post.tagz"`, target `post.hbs` | refused by name | as above |
| A list or a boolean as a value | `data-bind="tags"` · `data-bind="featured"` | refused: a list is a repeat source, a boolean is a condition | as above |
| A query's rows | `data-repeat="latest"` (source `posts`) holding `title`, target `post.hbs` | allowed: the rows are post scope | N/A |
| The universal set | `@site.title` on `default.hbs`; `@site.titel`; `@custom.accent`; `@member.email` | the first allowed; the other three refused by name | as above |
| No target | any binding, `target` absent | not checked — a render naming no template cannot be checked, as R-7's query refusal already accepts | N/A |
| Re-validation | `checkBindings` on a design with a root `title`, for `index.hbs`, then for `page.hbs` | every refused binding with its reason; then `[]` | `checkBindings` with no target throws |
| Offer by version | `offerBindings({ target: 'default.hbs', version })` at `6.35.0`, at `6.36.0`, and with none | `@site.threads` absent · present · absent (no version is the floor, `5.0.0`) | an unparseable version is the floor |
| Offer by scope | `offerBindings({ target: 'post.hbs', scope: [] })` | post fields as values, `tags` and `authors` as repeat sources; no `posts`, no `pagination` | N/A |
| A zero | `data-bind="reading_time"`, value `0`, target `post.hbs` | canvas "1 min read"; theme `{{#if reading_time includeZero=true}}{{reading_time}}{{else}}…{{/if}}` | N/A |
| Media fallback | `data-bind-attr="src:feature_image\|img_url:m" data-empty="fallback"` · `data-bind-srcset` with `data-empty="fallback"` | refused as `media-fallback` on the validator and with the same sentence on the runtime; `srcset` no longer swallows it | refusal |
| Initials, typed | `data-initials="people[].name"` over "Jane Doe", "Madonna", "Mary Jane Watson", "" | "JD", "M", "MW" on both emitters through the user-text path; an empty name keeps the authored text, or hides with `data-empty="hide"` | N/A |
| Initials from Ghost | `data-initials="name"` where the category declares no `name` prop · `data-initials` inside `data-repeat="authors"` | the first refused by the validator as an undeclared prop; the second refused by the runtime by name — two initials cannot come from Ghost (`{{split}}` is 6.5+ and a gscan error below it) | refusal |
| A Ghost person with no photograph | `<img data-bind-attr="src:profile_image\|img_url:xs">` beside `<span data-bind="name">` in an author row, `profile_image` null | theme: the image inside `{{#if profile_image}}`, the name guarded; canvas: the image removed, the name kept for the stylesheet's first letter | N/A |

</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/appendix-b1-template-contexts.md` -- the matrix to
  transcribe: the decision procedure §1 `:48-55`, the universal set §2 `:59-72`, per template §3 `:76-99`, the
  wrapper rule §3a `:101-119`, `@page` §3b `:121-133`, block scopes §4 `:148-193`, `{{#get}}`-only §5 `:197-224`,
  version gates and never-offer keys §6 `:228-247`, the items never executed §8 `:267-278`.
- `packages/library/src/vocabulary.ts` -- `HELPERS` `:35-41`, `BINDABLE_ATTRS` `:50-54`, `URL_ATTRS` `:57`,
  `BINDING_CONTEXTS` `:105-110`, `COMPILE_TARGETS`/`CUSTOM_TARGET_RE`/`isCompileTarget` `:112-121`,
  `PAGINATED_TARGETS`/`GET_FORBIDDEN_TARGETS` `:124-128`, `BARE_HELPERS` `:251-253`, `parseBindSpec` `:295-311`,
  `guardField` `:317-319`; the directive table — `data-prop` `:403`, `data-bind` `:414`, `data-bind-attr`
  `:419`, `data-empty` `:430-432`, `data-repeat` `:434`, `data-items` `:448` — where `data-initials` joins.
- `packages/library/src/validate.ts` -- the lexical ceiling and the two notes naming this story `:1-12`,
  `:216-219`; `guard-on-template` `:101-110`; `guard-without-source` `:170-174`; the prop-kind check `:196-199`
  (`data-initials` takes `text`); `bindingContext` membership `:321-335`. `validate.test.ts` guard cases `:143`,
  `:169`, `:178`.
- `packages/section-runtime/src/core.ts` -- `RenderInput` `:95-145` (`ghost` is the context at the section root
  `:101`, `target` `:141`); `isEmpty` `:294-295`; `insideRepeat` `:307-312`; `guardMode` `:391-395`;
  `wrapGuard`/`guarded` `:402-410`; R-7's two render refusals `:448-473`, which keep running first so their
  messages stand; `emitBindings` `:477-707` — `data-bind` `:490-525`, `data-bind-attr` `:527-574` (the
  attribute-level fallback `:541-548`), `data-bind-srcset` `:576-603` (the fallback swallowed `:582-584`),
  `data-helper` `:609-617`, `data-bind-style` `:690-705`; `bindValue` `:717-742` (the bare-`excerpt` case
  `:720-729` is the pattern bare `reading_time` follows); `renderTree`'s tail `:1020-1027`; `expandRepeats`
  `:1035-1080` (a repeat is a query when `own(input.dataBindings, source)` is set); `renderTheme`/`renderCanvas`
  `:1087-1105`.
- `packages/ghost-shim/src/index.ts` -- `readingTime` `:194-208` (recorded: `0` prints "1 min read"); the
  refusal of render context in a query's filter or order `:497-526`, which is why no template path can hide
  inside a filter yet; `bareHelper` `:576`.
- `packages/section-runtime/src/agreement.test.ts` -- the guard is always present `:292`, the guard is the field
  `:313`, `srcset` `:398-451` (the swallowed fallback `:428` becomes a refusal), the URL entry wins `:771`, the
  canvas falsy set `:788`; `ad36.test.ts` date, `img_url` and field guards `:257-273`.
- `packages/library/fixtures/reference-design/index.html:21-24` · `packages/library/fixtures/content.json`
  (`logos[].name` is a typed `text` prop inside an authored list) -- where `data-initials` gets its one use.
- `tools/probe/record-shim.py` -- the pattern: the Ghost client `:54-118` (themes need the staff token), the probe
  theme zipped with a generated `package.json` `:157-191`, the `GROUP|key=[value]` parse `:195-216`, key redaction
  `:222-237`, upload `:257`, activate `:264`, the restore in `finally` `:337-339`, the full version `:427-431`.
  `tools/probe/record-cards.py:59-62` imports that client rather than copying it, and `:449-452` refuses without
  `assert`, which `python -O` strips.
- `packages/ghost-shim/fixtures/ghost{5,6}/*.json` -- what T1 and T3 carry today: an author with a null
  `profile_image`, a tag with a null `description`, a post with `reading_time: 0`. Their API rows were trimmed to a
  few keys, which is why this recorder keeps whole rows. `packages/ghost-shim/src/contract.test.ts:80-106` -- a
  missing recording fails naming its capture command.
- `packages/library/{package.json,tsconfig.json}` · `packages/library/src/index.ts` -- JSON is wired with
  `resolveJsonModule` and an `include` list (`orbit-weekly`, `icons`); a core test reads a recording by static
  import, never `node:fs` (AD-1).
- `tools/stress/build.js:135`, `:137` -- `post.hbs` and `page.hbs` write `{{#post}}` literally. The harness renders
  every archetype without a `target` (`tools/stress/compile.js:29-30`, `build.js:76-86`), so the new check does not
  reach its gscan proof, whose `navigation` and `tiers` repeats (`sections.js:37`, `:115`) print nothing on a real
  Ghost; `tools/stress/gate.js` gates any directory on both majors and sets no exit code.
- `docs/section-authoring.md` -- `bindingContext`/`compileTarget` `:148-169`; `data-empty` as an override
  `:437-447`; the directive tables `:458-487`; the guard derivation and its first-entry sentence `:532-539`, which
  the runtime contradicts by guarding on the URL entry (`core.ts:533`); the validator's unchecked list with this
  story's line `:811-825`; the bindable fields `:846-853`.
- `tools/doc-audit.py:256-275` -- the recorder rows a new `tools/probe` script copies.
- **Read-only evidence.** `prd.md` FR-H7 `:337`, FR-H8 `:338`, FR-J5 `:391`, §7.4 `:632`;
  `supabase/migrations/20260904120000_complete_schema.sql:151` (`sites.ghost_version`, "5.x/6.x accepted, 4.x
  rejected" — the floor); `reconcile-designs-decisions.md` R-2 `:270-279`, R-7 `:377-395`, R-28 `:775`;
  `research-ghost-empty-values.md` truthiness `:467-484`, `{{#has}}` `:522-562`, `srcset` `:642-664`, `href=""`
  `:668-672`; `MEASUREMENTS.md` §15a `:550-575`, §38a `:2822-2828`, §40 `:2948-2970`; `ARCHITECTURE-SPINE.md`
  AD-14 `:190-193`, AD-23 `:251-257`, the capability map `:625`. Ghost's source, read 2026-09-13 through jsDelivr's
  npm mirror: `ghost@6.35.0` to `6.36.0` adds `threads · bluesky · mastodon · tiktok · youtube · instagram ·
  linkedin` to both `core/shared/settings-cache/public.js` and
  `core/server/data/schema/default-settings/default-settings.json`, unchanged through `6.38.0`;
  `handlebars@4.7.9/dist/cjs/handlebars/helpers/if.js`; `gscan@6.4.2/lib/ast-linter/rules/lint-no-multi-param-conditionals.js`
  and `internal/scope.js:4-32` (a global is allow-listed by its first segment only, so a too-new `@site` key
  passes gscan and prints empty). The export: `P0 Editor Primitives - Spec.md:262-272`, `A1 Headers - Spec.md:116`,
  `:1037`, `:1088`, `A21 Author Showcases - Spec.md:253-254`.

## Tasks & Acceptance

**Execution:**

- [x] `packages/library/contexts/matrix.json` -- transcribe appendix B.1 into data: the floor `5.0.0` (FR-C2); the
  universal set — the `@site` keys of Ghost's `public.js` less §6's never-offer list, each gated key with its
  `since`, `@config.posts_per_page`, and `@page.show_title_and_feature_image` bindable on the post-block templates
  but offered only on `page.hbs` and `custom-{name}.hbs` (§3b); per compile target, what its root exposes and the
  block its template opens (`post` for `post.hbs`, `page.hbs` and `custom-{name}.hbs`, none elsewhere); every
  scope's fields typed `text · url · image · color · date · number · boolean · list · object · helper`, a list or
  object naming the scope it opens (`primary_tag`, `primary_author`, `tags`, `authors`, `pagination`,
  `@site.navigation`, `errorDetails`), and the row scope of each `{{#get}}` source (`posts · tags · authors · tiers
  · newsletters`); the scope each bare helper needs (`content` and `comments` post, `statusCode` and `message`
  error, the rest universal); `count.posts` left out, since no `dataBindings` field can ask for its `include`; a
  field no recording can show set carries `unverified` with the reason -- one copy of FR-H7's matrix, read by
  TypeScript and by the Python recorder.
- [x] `tools/probe/record-contexts.py` · `tools/doc-audit.py` -- the recorder, importing `record-shim.py`'s client:
  generate a probe theme in a temporary directory FROM `matrix.json` — per template and scope, the row's `id`, and
  every bindable field: a value field printed as `SCOPE|path=[{{path}}]` with its guard's truthiness
  (`{{#if path}}`, and `{{#if path includeZero=true}}` for a `number`), a list or object as its truthiness and its
  first row's `id`, a `helper` into its own raw block cut as `record-shim.py:195-216` and `:321-322` cut
  `{{content}}` — plus the page's title through both `{{#post}}` and `{{#page}}`, a root `{{title}}` on
  `index.hbs`, and the two controls; gate it through `tools/stress/gate.js` (0 errors on both majors, parsed from
  its text); upload and activate it with the staff token; fetch `/`, `/page/2/`, a post
  with a feature image and tags, a post without a feature image, the first public page, a tag archive, the archive
  of an author with no `profile_image` (each chosen live, as `record-shim.py:269-277` chooses), and a missing path;
  restore the previous theme in a `finally` and re-read the active theme to prove it; read the whole Content API
  row of every rendered resource (`include=tags,authors`), one tier and one newsletter, redacting the Content API
  key to its shape; read `public.js` and `default-settings.json` for each gate version in the matrix and the
  published release before it (the list from `registry.npmjs.org/ghost`), recording each URL and sha256; refuse to
  write, without `assert`, when a page other than the 404 is not 200, a control fails, or the previous theme did
  not come back; write `packages/library/contexts/fixtures/ghost5.json` and `ghost6.json` (captured date, command,
  full version from `/admin/config/`) and `ghost-source.json`; add the script's catalogue row -- AD-23 and R-82:
  the matrix is proved on the real servers or it is a paraphrase.
- [x] `packages/library/src/contexts.ts` · `packages/library/src/contexts.test.ts` · `packages/library/src/index.ts`
  · `packages/library/tsconfig.json` -- `bindable(path, { target, scope, version? })` returning `null` or the
  refusal sentence (a `../` path reads one scope up, an `@` path reads the root, as Handlebars does, and
  `@custom.*` and `@member` refuse with their own sentences, FR-Q3 and R-28); `offerBindings({ target, scope,
  version? })` returning what may be offered there, values apart from repeat sources, gated keys subtracted above
  `version`, an absent or unparseable `version` read as the floor; the root scope and opened block of a target, and
  the row scope a repeat over a path opens. The test imports the three recordings statically and asserts on both
  majors: every resource field not marked `unverified` has evidence — a value field printed non-empty where its
  row's API value is set (or where the API carries no such key), a boolean printed as its API value, a list or
  object truthy where the row carries one; the page's `{{#post}}` and `{{#page}}` titles are equal and non-empty,
  and the root `{{title}}` on `index.hbs` printed empty; each `text`, `url`, `image`, `color` or `date` field's
  `{{#if}}` agrees with whether it printed, and a `number`'s `includeZero=true` guard does (the recorded
  `reading_time`); every gated `@site` key is absent from `public.js` the release before its gate and present at
  it, every other offered `@site` key is present at both servers' versions, and no never-offer key is offered;
  every recorded JSON boolean, number and array in a matrix field is typed `boolean`, `number` and `list`; nothing
  `offerBindings` returns is refused by `bindable` at the same place; a missing recording fails naming
  `python3 tools/probe/record-contexts.py`. Export through the index; add `contexts` to `include` -- FR-H7's matrix,
  keyed on template, scope and version, with its proof beside it.
- [x] `packages/library/src/vocabulary.ts` · `packages/library/src/validate.ts` · `packages/library/src/validate.test.ts`
  -- `data-initials` joins the directive table (a content prop path, guardable, so `data-empty="hide"` may sit
  beside it); the validator holds `data-initials` to `data-prop`'s prop checks — declared by the category, and
  `text` (the `:196` check) — so a Ghost field name the category never declared is refused; it refuses
  `media-fallback` — `data-empty="fallback"` on an element whose `data-bind-attr` has an `href`, `src` or `poster`
  entry, or which carries `data-bind-srcset`; the two notes naming this story (`:10-12`, `:216-219`) say where the
  tree-aware check now lives; each new refusal fires alone in a test (`test-vocabulary.mjs:106-114` derives the
  list) -- FR-H8's media rule and R-2's typed form, refused wherever the lexical scan can see them.
- [x] `packages/section-runtime/src/core.ts` · `packages/section-runtime/src/index.ts` -- the scope walk: when a
  render names its `target`, after R-7's two refusals, give every binding its scope from the target's root and its
  enclosing `data-repeat`s (a `dataBindings` key opens its source's rows; a context path opens the list it names;
  an authored `data-items` list opens no Ghost scope) and pass every Ghost path a rendered directive carries —
  `data-bind`, each `data-bind-attr` entry and each `{path}` of a token template, `data-bind-srcset`,
  `data-bind-style`, a context-path `data-repeat`, `data-helper` — through `bindable`, throwing one error naming
  every refusal; export `checkBindings(doc, src, input)` returning the
  same list, and throwing without a target; wherever a guard is emitted for a render that names its target, a field
  the matrix types `number` guards with `includeZero=true` on the theme and counts `0` as present on the canvas;
  `data-empty="fallback"` on a URL-attribute entry or on `data-bind-srcset` throws the validator's sentence instead
  of guarding the attribute (`:541-548`) or being swallowed (`:582-584`); a bare `reading_time` that its guard lets
  through prints the shim's `readingTime`, beside the bare-`excerpt` case; `data-initials` renders on both emitters
  as the first code point of the first and of the last whitespace-separated word of the typed text, through the
  user-text path `data-prop` uses (AD-5), keeping the authored text for an empty name, and is refused by name inside
  a `data-repeat` whatever the target -- FR-H7 at the one door every render passes, FR-H8's last holes, and R-2.
- [x] `packages/section-runtime/src/contexts.test.ts` · `packages/section-runtime/src/agreement.test.ts` ·
  `packages/section-runtime/src/ad36.test.ts` -- the I/O matrix, every row, on both emitters wherever a row renders:
  allowed and refused bindings per target and scope, one error naming several refusals, `checkBindings` before and
  after a destination changes, post and page byte-identical with neither block in the section text, `offerBindings`
  by scope and by version, the zero, both media fallbacks refused (`:428` becomes a refusal), typed initials
  identical on both emitters including a name carrying `{{`, initials refused inside a Ghost repeat, and the Ghost
  author row with no photograph; plus a scan of every theme output these suites produce for `{{#has` and
  `{{#unless` -- §7.3's exit criterion covers what this story adds, in `pnpm check` and so in CI.
- [x] `packages/library/fixtures/reference-design/index.html` -- one `data-initials="logos[].name"` inside the logos
  list, beside the logo image -- the on-disk reference uses every directive once (`test-vocabulary.mjs:93-97`).
- [x] `tools/stress/build.js` -- `post.hbs` and `page.hbs` open the block `matrix.json` names for their target
  instead of writing `{{#post}}` literally -- the one copy Epic 7's compiler will read, with `node build.js` and
  `node gate.js theme` still 0 errors and 0 warnings on both majors.
- [x] `docs/section-authoring.md` -- a "Where a binding is legal" part: the scope a design's markup is evaluated in
  per target, the post block the template opens, what `offerBindings` and `checkBindings` answer and when a render
  refuses; the `data-initials` row and the two avatar forms with their markup; the `number` guard; the
  media-fallback refusal, correcting `:437-447`'s "writing `data-empty` chooses the other one" to text bindings; the
  URL-entry rule in place of `:532-539`'s first-entry sentence; this story's line at `:823-825` replaced; the new
  refusal rows -- the contract every design in Epics 9–11 is written against.
- [x] `appendix-b1-template-contexts.md` · `prd.md` · `ARCHITECTURE-SPINE.md` · `MEASUREMENTS.md` ·
  `deferred-work.md` · `epic-4-context.md` -- propagate (standing rule 3), then grep the repository for every old
  sentence and shape (standing rule 7): §8's executed items and §6's social gate carry what the recording and the
  source showed; FR-H8 (`prd.md:338`) says a media binding always hides and only a text binding chooses; the
  capability map's FR-H row (`:625`) names `packages/library/contexts` and the runtime's scope walk; a MEASUREMENTS
  section for the recording and the source reading; ledger entries for what was found here and is owned elsewhere —
  no story offers moving or duplicating a section onto another template, or its re-point and revert step
  (`checkBindings` is ready for it); A1's and P0·2's "the site's accounts arrived in 6.38.0" against Ghost's source
  at 6.36.0, for A1's category story; `count.posts` needs a `{{#get}}` `include` that `DataBinding` cannot express,
  for the first category story that shows a count; the stress harness's `navigation` and `tiers` repeats, which a
  target-naming render would refuse; the route form of `custom-{name}.hbs`, for FR-I2's story;
  `private.hbs` and every version below the servers' left unexecuted; DW-98's owner narrowed to Epic 5's canvas,
  since the matrix reads a version and never the connection's settings; and the epic context's sub-bullets -- a
  finding is not closed until it reaches the document that governs it.

### Review Findings

Five layers ran on 2026-09-14 (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier). The Real-infra verifier re-ran the recorder against T1 and T3 and found nothing (results under
Verification); every patch below is applied; the deferrals are DW-130 to DW-132.

- [x] [Review][Patch] `../@site.x` was declared legal and the theme would emit it — Handlebars 4.7.9 rejects the form and Ghost answers 500; refused with its own sentence [packages/library/src/contexts.ts]
- [x] [Review][Patch] A `{{#get}}` opens a frame of its own around `{{#foreach}}`, so `../title` from a query row lands in the get's result, not the section — the chain now carries that frame [packages/library/src/contexts.ts]
- [x] [Review][Patch] A list with no `of` (`@site.portal_plans`, a tier's `benefits`) opened a scope named `''` and was offered as a repeat nothing inside could bind — refused as plain values, and not offered [packages/library/src/contexts.ts]
- [x] [Review][Patch] `offerBindings` at a place that cannot be built (an unknown target, an illegal enclosing repeat) silently offered the universal set alone — it now returns `refused` and three empty lists [packages/library/src/contexts.ts]
- [x] [Review][Patch] `data-pagination` inside a `data-repeat` was never walked: the theme printed a blank while the canvas printed `/page/2/` — its `pagination.*` path is a Ghost path in the walk [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] `checkBindings` answered `[]` for a destination R-7 refuses at render (`data-pagination` on `error.hbs`, a `{{#get}}` on an error template) — the gate carries both refusals first [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] `data-initials` beside `data-bind` or `data-prop` on one element silently replaced the other's text — refused by name [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] A bare `reading_time` over a value that is not a number printed "1 min read" — the helper path takes a number only [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] The recorder did not void a run whose `page.hbs` root `{{title}}` printed (the test asserts it), wrapped to the newest release for a gate at npm's first entry, and ran a live upload on `--help` — all three closed [tools/probe/record-contexts.py]
- [x] [Review][Patch] Nothing pinned the token-template, `srcset`, `style` and `data-helper` walks (each dropped in turn, the suite stayed green) — one refusal per attribute under a named target, on both emitters and in `checkBindings` [packages/section-runtime/src/contexts.test.ts]
- [x] [Review][Patch] `includeZero=true` was pinned only on a top-level `data-bind` (five mutations stayed green) — asserted on an attribute fallback, an attribute hide, a style guard and inside a repeat, on both emitters [packages/section-runtime/src/contexts.test.ts]
- [x] [Review][Patch] `build.js` wrapped nothing, silently, when the matrix had no row for a target — it throws [tools/stress/build.js]
- [x] [Review][Patch] The docs' row-11 example `signup/{tier}` is refused by the walk inside a tiers repeat (`id` is the field), and `checkBindings` was documented without the `dataBindings` a query repeat needs — both corrected, with the `../` and `{{#get}}` frame rules [docs/section-authoring.md]
- [x] [Review][Patch] The universal rows the recorder captured (`navigation`, `total_members`, every `@site` value) were never asserted — every universal row is probed on both majors, helpers printed, and a key gated above 5.x printed empty on T3 as the control [packages/library/src/contexts.test.ts]
- [x] [Review][Patch] A literal "seven" in a test comment [packages/library/src/contexts.test.ts]
- [x] [Review][Patch] A refusal inside an illegal repeat ended in two full stops [packages/library/src/contexts.ts]
- [x] [Review][Patch] A pre-release version (`6.58.0-rc.0`, what a server can report) fell to the floor and hid every gated key — read by its `x.y.z` [packages/library/src/contexts.ts]
- [x] [Review][Patch] The appendix asserted gscan's first-segment allow-listing without the citation the spec carries, kept two contradictory precedence sentences, and the research still listed `meta_title`/`meta_description` as resource fields — cited, ordered (matrix › research › appendix), and noted as recorded [appendix-b1-template-contexts.md · research-ghost-binding-contexts.md]
- [x] [Review][Patch] `@page` offered on `custom-{name}.hbs` with no word on the post-backed case, and `statusCode`/`message` typed `helper` with no word on why — both rows carry a `note` [packages/library/contexts/matrix.json]
- [x] [Review][Defer] No gate runs `checkBindings` over a shipped design's own `compileTarget` list [packages/library/src/validate.ts] — deferred (the first real designs are Story 4.10's; DW-130)
- [x] [Review][Defer] `ghostPaths` enumerates the walked directives by hand [packages/section-runtime/src/core.ts] — deferred (the vocabulary carries no Ghost-path flag to derive from; DW-131)
- [x] [Review][Defer] The Dev push's CI failed its documentation gate and deployed nothing: every generator stamps HEAD's commit date, so the first commit of a new day is stale in CI [tools/doc-audit.py · tools/build-board.py · tools/category-prompts.py] — deferred, pre-existing (DW-132; the Review push deployed)

Dismissed as noise: the reference design "fails FR-H7 on its targets" (a lexical fixture carrying directives no render accepts, so it renders on no target at all); the epic context's Story 4.5 sub-bullet (landed by 4.5's Fix commits, not this story); the value-kind set in three files (a partition of kinds, not a field list); `bindable` refusing on `version` (its docblock already says the runtime passes none); the probe theme left uploaded and inactive (Story 4.3's Q2 pattern — the recorder restores, it does not delete); the bisection's reproducibility (the recorder re-reads each gate and the release before it, which is the proof); the deployed `/controls` harness naming no target (this story has no screen; R-82 was met on T1 and T3); `people[].name` outside `data-items` shipping the placeholder (`data-prop` behaves the same, by design).

**Acceptance Criteria:**

- Given the three recordings, when `contexts.test.ts` runs, then every matrix row is proved by a render or an API
  row on both majors, every control held, and a gap is a named `unverified` field rather than a silent pass
  (standing rules 1 and 2).
- Given a render that names its template, when a binding the matrix does not allow is present at its scope, then
  the render refuses naming every such binding, and `checkBindings` returns exactly that list — empty only when
  every binding is available, which is the gate a move or duplicate onto another template must pass (FR-H7).
- Given any template, scope and version, when `offerBindings` answers, then everything it offers is bindable there,
  a version below a gate leaves the gated keys out, and a missing version is the floor (FR-H7).
- Given one design compiled for `post.hbs` and for `page.hbs`, when the two theme texts are compared, then they are
  byte-identical, neither opens a post or page block, and the stress harness's two templates open `{{#post}}` from
  the matrix (FR-H7, §7.4).
- Given every theme output the suites produce, when it is scanned, then every guard is `{{#if}}` on the bound field
  with no `{{#has}}` and no `{{#unless}}`, every media guard encloses its element and any `srcset`, and a media
  `fallback` is refused on the validator and the runtime (FR-H8).
- Given a list the user typed and a row of Ghost authors, both without photographs, when each renders on both
  emitters, then the typed list shows two baked initials and the Ghost row carries the name for its stylesheet's
  one letter, identically on canvas and theme, and two initials drawn from Ghost are refused (R-2).
- Given the gates, when `python3 tools/doc-audit.py --check`, `pnpm check` and the stress gscan gate run, then all
  are green with 0 errors and 0 warnings on both majors, and no count a tool derives is written down.

## Spec Change Log

- **Review, 2026-09-14 (iteration 1).** Five layers ran; the Real-infra verifier re-ran the recorder on T1 and T3
  with no finding. What the other layers changed: a `{{#get}}` counts as a frame for `../` and `../@site.x` is
  refused (Handlebars rejects it); a list of plain values opens no scope and is not offered; `offerBindings`
  says `refused` instead of a partial answer; `data-pagination` joined the scope walk; `checkBindings` carries
  R-7's two target refusals; `data-initials` cannot share an element with another text directive; a pre-release
  version reads by its `x.y.z`; and the recorder gained the `page.hbs` root-title control, a first-release guard
  and a `--help` that touches no server. Three deferrals, DW-130 to DW-132 — the last is CI's doc gate failing
  the first commit of each day, found because the Dev push had not deployed. No question for the owner.

- **Dev, 2026-09-14 — what the recording changed, and three routine calls.** (1) The recording overruled the
  appendix three times and the matrix follows it: `meta_title`/`meta_description` inside a post, tag or author
  print Ghost's PAGE meta helper, so neither is a field; `page` prints empty inside the post block, so it is not
  one; `reading_time` prints nothing on a gated post while its number guard is true (asserted as recorded,
  DW-128). (2) Ghost's source overruled §6: `@site.admin_url` is 6.22.1, and keys the appendix called ungated
  are absent at the 5.0.0 floor, so they carry gates found by bisecting npm releases and re-read by the recorder
  (MEASUREMENTS §41e). (3) `bindable` takes a `use` (`value · repeat · condition · helper`) beside the spec's
  `{ target, scope, version? }`, because a list or boolean refuses only as a value; `offerBindings` returns
  `conditions` too, so `@page.show_title_and_feature_image` has somewhere to be offered on page.hbs only.
  (4) A core test may not `import()` dynamically (AD-1's lint), so the recorder writes a generated
  `fixtures/index.ts` from what is on disk, as record-shim.py does; `--index` regenerates it with no server
  touched, which is the missing-recording control. (5) The validator's `guard-on-template` now reads the URL
  entry, as the runtime guards, so the docs' URL-entry rule is true of both.

## Design Notes

**Where the check lives.** Scope is a fact about the tree — which repeat encloses an element — and Story 4.1's
validator is lexical by design (`validate.ts:5-12`). The runtime already walks the tree for both emitters, so it
consults the matrix there, at the one door every render passes, whenever the render names its template. A render
naming no template cannot be checked, which R-7's query refusal already accepts.

**`{{#post}}` belongs to the template, not the section.** FR-J5 puts `{{post_class}}` on the article that wraps the
post body, and that article needs post context, so `post.hbs` opens the block once. A section opening its own would
look up `post` inside the post, which has no such key, and print nothing:

```hbs
{{#post}}<article class="gh-article {{post_class}}">
  {{> "sections/post/a24-1"}}  {{! evaluated in post scope: title, url, feature_image }}
</article>{{/post}}
```

So a section's text never carries the block, and one design is one text on `post.hbs` and `page.hbs` — the hoist
§7.4 relies on.

**The version axis belongs to the offer.** A field added after a site's version is not offered there (FR-H7):
`offerBindings` leaves it out, so no binding surface Epic 5 builds can present it. A design that already binds one —
a footer's nine social rows — is not refused at render: on an older server the key is absent, the always-present
guard hides the row, and that is what `P0 Editor Primitives - Spec.md:271` draws. Whether a whole design is offered
to a site stays `ghostCompat.minVersion`'s (FR-C5), which is where a helper that would fail gscan belongs.

**The social gate, read in Ghost's source.** `ghost@6.35.0` to `6.36.0` adds the seven keys to `@site` and the seven
settings to the defaults, both unchanged through `6.38.0`, so the appendix's 6.36.0 is right for the keys. A1's and
P0·2's "the site's accounts arrived in 6.38.0" comes from release notes and matches the `{{#social_accounts}}`
helper; A1's story decides when its rows show, knowing both.

**Why a media fallback is refused rather than honoured.** The only fallback an attribute can carry is the design's
authored placeholder — `/placeholder.jpg`, a relative URL that 404s on the customer's site. A picture that falls back
to the customer's own image is a second element, not an attribute, which is `data-if` and `data-else` once that
directive renders. So FR-H8's "chosen per binding" is a text binding's choice.

**Zero is a value.** Handlebars takes `{{#if}}`'s else branch for `0` unless `includeZero=true`, while `{{f}}` prints
`0` — so a count of zero, or Ghost's "1 min read" for a short post, would show the design's placeholder instead. The
recorder executes the hash on both majors before anything relies on it.

**Initials.** The first code point of the first and of the last word: "Jane Doe" → JD, "Madonna" → M, "Mary Jane
Watson" → MW — first and last is the common convention, a routine call. Case stays as typed; the stylesheet decides
display. `ponytail:` a code point is not a grapheme, so a name opening with a combining sequence loses its mark;
AD-1 bans `Intl.Segmenter`, and a segmenter handed in is the upgrade if a real name ever needs it.

**The matrix's shape**, illustrative — the implementer owns the keys:

```json
{ "floor": "5.0.0",
  "universal": { "@site.title": { "kind": "text" }, "@site.threads": { "kind": "text", "since": "6.36.0" } },
  "targets": { "post.hbs": { "root": "post", "block": "post" }, "index.hbs": { "root": "list" } },
  "scopes": { "list": { "posts": { "kind": "list", "of": "post" }, "pagination": { "kind": "object", "of": "pagination" } },
              "post": { "title": { "kind": "text" }, "reading_time": { "kind": "number" }, "tags": { "kind": "list", "of": "tag" } } } }
```

```ts
bindable('title', { target: 'index.hbs', scope: [] })     // → "title is not available at the top level of index.hbs …"
offerBindings({ target: 'index.hbs', scope: ['posts'] })  // → the post scope inside {{#foreach posts}}
```

**Why the matrix is in `packages/library` when the capability map names `packages/ghost-shim` for FR-H.** The
validator's tests, both emitters and the editor all read it, and `ghost-shim` sits above the library — the reason
Story 4.2 moved AD-36's colour parser into the library. The map row is corrected.

## Verification

**Commands:**
- `python3 tools/probe/record-contexts.py` -- expected: T1 `ghost6.inflozo.com` and T3 `ghost5.inflozo.com`
  recorded (the script reads `tools/probe/.env` itself, as `record-shim.py` does — keys by variable name only), every
  control held, the previous theme active again on both, `packages/library/contexts/fixtures/` written with today's
  date; a second run changes nothing but `captured`.
- `cd packages/library && node --test 'src/**/*.test.ts'` -- expected: `contexts.test.ts` green on both recordings;
  with one recording moved aside it fails naming the capture command (the control), then restored.
- `pnpm check` (Node 24) -- expected: exit 0 — lint, typechecks, every package test including
  `section-runtime`'s `contexts.test.ts`, and `test-vocabulary.mjs`.
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- expected: Ghost 5 via gscan 4.49.7 0/0
  and Ghost 6 via gscan 6.4.2 0/0.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.
- `/usr/bin/grep -rn "chooses the other one\|first entry's field" docs packages tools --exclude=.env --exclude-dir=node_modules`
  -- expected: no stale sentence (standing rule 7).

**Manual checks:**
- After the recorder, `GET /ghost/api/admin/themes/` on both servers shows the theme that was active before the run
  as active (R-82).

**Results (Review, 2026-09-14) — re-executed by the Real-infra verifier (R-82):**
- **Ghost T1 `ghost6.inflozo.com` (6.58.0) and T3 `ghost5.inflozo.com` (5.130.6)** — `python3 tools/probe/record-contexts.py`
  again (keys by `load_env()` as `GHOST{5,6}_STAFF_ACCESS_TOKEN`, `GHOST{5,6}_CONTENT_API_KEY`, never printed):
  probe theme gated 0 errors on gscan 4.49.7 and 6.4.2, uploaded HTTP 200 on both, eight pages fetched (seven
  200, the missing path 404), `casper` restored on both; the three recordings came back **byte-identical** to
  the committed ones, `captured` included. `GET /ghost/api/admin/themes/` afterwards: `casper` active on T1 and
  T3, `inflozo-probe-contexts` uploaded and inactive.
- **Controls read back from the recordings** — on both majors the root `{{title}}` on `index.hbs` and `post.hbs`
  printed empty beside a non-empty `{{#post}}{{title}}{{/post}}`, and the misspelt field printed non-empty in no
  frame at all.
- **jsDelivr** — `ghost@6.35.0` `public.js` has no `threads`, `ghost@6.36.0` has it; both sha256 values match
  `fixtures/ghost-source.json`.
- **`pnpm check` (Node 24)** exit 0 before the patches; after them the library and runtime suites are green with
  the review tests added (each suite prints its own count), and `node build.js && node gate.js theme` is 0/0 on
  both majors with `{{#post}}` opened once in each template.
- **Supabase, Vercel, Resend, Dodo** — no migration in the diff (`git diff --stat 4d28a05c HEAD -- supabase/` is
  empty), so R-99 does not apply; none touched.
- **GitHub Actions** — the Dev push's run (34823025267) FAILED `check` on stale generated date stamps and skipped
  `deploy`, so the Dev tree never reached production, contrary to the Dev results below; the Review push's run
  (34825820806) passed `check`, `rls` and `deploy`. The cause is DW-132, a tooling defect older than this story.

**Results (Deploy, 2026-09-14):** No migration in the diff, so no schema step; this story changes only
`packages/library` and `packages/section-runtime`, which `apps/web` depends on (`workspace:*`), so it is app
code and ships on the push to `main`. `Deployment: dpl_CZdy9Xv3TkxMYscHb68WdjeXPmcx` (commit `d4a8273a`) —
confirmed `readyState: READY` via the Vercel API and `aliasAssigned: true` for `inflozo.com`,
`app.inflozo.com` and `www.inflozo.com`; CI run 34825820806 (`check`, `rls`, `deploy`) passed for the commit
this deployment was built from. `owner_test: none` — this story has no screen (no `apps/web` files in the
diff), so there is no Owner's manual test to fill in; recorded done in `sprint-status.yaml` instead.

**Results (Dev, 2026-09-14) — the real services this story hit (R-82):**
- **Ghost T1 `ghost6.inflozo.com` (6.58.0) and T3 `ghost5.inflozo.com` (5.130.6)** — `python3 tools/probe/record-contexts.py`,
  keys read by `load_env()` as `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`, `GHOST5_STAFF_ACCESS_TOKEN`,
  `GHOST5_CONTENT_API_KEY`, never printed. The generated probe theme passed gscan 4.49.7 and 6.4.2 with 0 errors
  (one `GS051-CUSTOM-FONTS` warning each, not a gate for a probe theme) and both majors accepted
  `{{#if f includeZero=true}}` at upload; every fetched page answered 200 and the missing path 404; every control
  held — root `{{title}}` empty on `index.hbs`, `post.hbs` and `page.hbs` beside a non-empty `{{#post}}{{title}}{{/post}}`,
  `{{#post}}` and `{{#page}}` equal on a page, a misspelt field empty in every scope; the Content API rows, one tier
  and one newsletter were read whole. The recorder ran more than once; the runs wrote identical files but for
  `captured`. What the recording overruled is MEASUREMENTS §41 and this spec's Change Log.
- **Ghost Admin API, after the runs** — `GET /ghost/api/admin/themes/` on both servers (staff token by variable name)
  returned `casper` active on T1 and T3; `inflozo-probe-contexts` stays uploaded and inactive on both.
- **npm registry and jsDelivr** — `registry.npmjs.org/ghost` for the release list, and `cdn.jsdelivr.net/npm/ghost@<v>/`
  for `public.js`, `default-settings.json` and the two template-options middleware files at the floor, both servers'
  versions, every gate and the release before each; URL and sha256 recorded in `fixtures/ghost-source.json`.
- **Supabase, Vercel, Resend, Dodo — not touched.** This story has no database change, no screen, no email and no
  payment path; its code reaches production only through the Dev push's CI deploy, which the Deploy phase verifies.
- **Missing-recording control** — `ghost5.json` moved aside and `fixtures/index.ts` regenerated with `--index`:
  `contexts.test.ts` failed with `NO RECORDING — … Capture it: python3 tools/probe/record-contexts.py`; restored, the
  index regenerated byte-identical and the suite passed.
- **`pnpm check` (Node 24)** — exit 0, including `section-runtime`'s `contexts.test.ts`, the `{{#has`/`{{#unless` scan
  in all three runtime suites, and `test-vocabulary.mjs`.
- **`node build.js && node gate.js theme`** — Ghost 5 via gscan 4.49.7 ERRORS 0 WARNINGS 0; Ghost 6 via gscan 6.4.2
  ERRORS 0 WARNINGS 0; `post.hbs` and `page.hbs` each open `{{#post}}` once, read from the matrix.
- **Stale-sentence grep** — no match.
- **Leak scan** — no `tools/probe/.env` key, token or password value appears under `packages/library/contexts/`; the
  recordings carry only the two servers' public site URLs, as `packages/ghost-shim/fixtures/` already do.
