---
title: 'Story 7.1 — Theme assembly: the mechanism, and the formatting contract'
type: 'feature'
created: '2026-10-05'
status: 'in-review'
owner_test: none
review_loop_iteration: 1
baseline_commit: 'df866cd279f9dfe5d89454b31ca69684fee04310'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, Inflozo can turn a project into the files of a real Ghost theme: one file per page template, one
small file per section named after that section's name in Layers, and one stylesheet with your Style Pack's colours and
sizes at its top. Nothing changes on any screen yet — the button that sends a theme to your site arrives later in this
epic — so there is nothing for you to test by hand. Anyone who opens the files will find them tidy enough to edit by
hand: two-space indents, a one-line label above each section giving its Layers name, its category and its design, and
no hidden marks of the tool that built it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nothing can turn a project into a Ghost theme yet. `packages/theme-compiler` is a one-line stub, and the
section runtime emits one section at a time as raw `innerHTML` that is visibly ragged: `{{#foreach}}` flush left inside
indented markup, a repeat partial whose first line sits at column 0 while the rest keep the indentation of the place
they were cut from, and a guarded `<img>` on a single 459-character line. The committed snapshots that NFR-6(c1) diffs
on every commit are that ragged text. Nothing decides how sections become template files, partial names, a stylesheet
and the boundary labels FR-J1 asks for.

**Approach:** Add `compileTheme` to `packages/theme-compiler`. It is a pure function (AD-14) that:
- renders every visible section of every template it is handed through the existing theme emitter, with one shared
  `UserText`;
- files each section as its own partial, named by a stated slug rule, with byte-identical sections sharing one file;
- writes each template and `default.hbs` around those partials, with a boundary comment before each section;
- puts the pack's token block at the top of `assets/css/screen.css`;
- substitutes user text last, across every file.

The theme emitter itself serializes to a stated formatting contract:
- two spaces per nesting level;
- a start tag past 120 columns written one attribute per line;
- no whitespace added or removed anywhere it renders.

Every snapshot therefore re-baselines once, as AD-35 predicted.

## Boundaries & Constraints

**Always:**

- **Handlebars is never parsed, evaluated or printed by product code (FR-J1).** The theme serializer produces the
  formatting over the DOM, while every expression is still an opaque C0-delimited token and every block helper a
  comment marker. Emitted text is never read back to format it. Prettier and every other formatter are never used. A
  test may load `handlebars` 4.7.9 to parse what the compiler emitted; product code may not import it.
- **The pipeline's order is binding** (spine § The compile pipeline): render → mark → serialize to the contract → unwrap
  markers inside `Tokens.resolve`'s reverse loop → partition → substitute user text once, last, over every emitted
  file. Hoisting compares sections *after* substitution by substituting a copy (`UserText.substitute` is pure); the
  emitted tree itself is substituted exactly once.
- **The compile is pure and deterministic (AD-1, AD-14).**
  - No clock, entropy, I/O or locale reader in `packages/theme-compiler`; the AD-1 lint already covers the directory.
  - The output is a path → text record in code-unit path order.
  - The same input gives byte-identical output, whatever the object key order or the order templates are handed in.
- **Formatting never changes what renders.** It rewrites whitespace only inside a run that already separated two nodes,
  and adds it only where block layout's own rule already found whitespace (Design Notes).
  - It never puts whitespace between two nodes that touched, and never removes the last whitespace between two that
    did not.
  - It never re-wraps text.
  - Text, attribute values and the content of `pre`, `textarea`, `script`, `style` and `title` stay byte-for-byte what
    the DOM serializer writes.
- **The canvas is untouched.** `renderCanvas`'s output and the render matrix's baselines stay byte-identical, and the
  keyboard gate stays green; only the theme path formats.
- **AD-36 applies to every new sink.** Each is rebuilt from validated parts:
  - the layer name reaches a Handlebars comment with braces and C0 controls dropped and whitespace collapsed;
  - a partial's filename uses only the slug's `[a-z0-9-]` alphabet;
  - a design's `data-partial` never names one of Ghost's own partials.
- **A section compiles with the input the canvas draws it with:**
  - its content, controls, data and member visibility;
  - the strings and asset map handed in, and the library's icons;
  - for a secondary feed, the query `feedQuery` builds (Story 5.19) from the stored `isMainFeed`.

  A hidden instance is never compiled.
- **Exactly one triple-stash in the whole tree:** `{{{body}}}` in `default.hbs` (Round 3's D3). There are zero `{{{`
  and zero `}}}` anywhere else.
- **Class names pass through untouched.** Every class a design writes is its root class `{category}-{n}` or begins with
  `{category}-{n}__` or `{category}-{n}--`, so two designs' rules never meet in the one `screen.css`.
- **Counts are derived.** Every new check and message reads the designs, templates and files; none writes a total
  down.

**Ask First:**

- **Uploading the probe theme to T1.** It needs the owner's in-session go in the Dev (or Review) session. It runs in
  the main session, never through a subagent, and does not repeat DW-332's three cleanup gaps.
- **Any edit to a file under `packages/library/designs/`.** AD-35 gives these files to their owning category, and none
  is planned. If a pilot fails one of this story's new checks, stop and ask.
- **gscan reporting anything on the probe theme that the scaffold list (Design Notes) does not name.** Stop and ask
  before widening the scaffold.
- **A construct the formatter cannot keep render-neutral without a further exception.**

**Never:**

- **Anything a later story of this epic owns.** No UI, no deploy, no database change, and so no Schema phase:
  - `package.json` — 7.2;
  - synthesis, `designate`, page-2 docs, the paywall's `partials/content-cta.hbs`, `<main>`, the skip link's target
    and the `@page` guard — 7.3;
  - fonts, assets, `darkOverrideCss` and the `data-instance` hook, AD-18's font variables, base/reset, the dead-CSS
    strip, the budgets and the reachability record — 7.4;
  - JavaScript — 7.5;
  - `post_class` and the members classes — 7.6;
  - the gscan and quality gates — 7.7, 7.8;
  - Theme Settings and every `@custom` value — 7.9–7.11;
  - `locales/` — 7.12;
  - `cards.css` — 7.13;
  - `routes.yaml` — 7.16, 7.17;
  - README and credits — 7.28.
- **Near-identical sections sharing one partial through hash params.** §7.4 permits it as an optimisation; separate
  partials are always correct.
- **Any fingerprint in an emitted file:** a hash, timestamp, generator mark, instance id, template key, or internal
  reference such as a story, ruling, requirement or DW id, or a `ponytail:` note.
- **Reordering attributes**, changing quoting or entities, self-closing a void element, or wrapping text.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A designed Home | `home.hbs`: Latest post (A4 #13), Post grid (A17 #1, main feed), Newsletter (A22 #1) | `home.hbs` is the layout line, then each section's boundary comment and invocation, with one blank line between sections; three files in `partials/sections/home/`; `partials/post-card.hbs` once | — |
| A post | `post.hbs`: Post header (A24 #1), Newsletter | the sections sit inside `{{#post}}…{{/post}}` (the block `targetContext` names), one level in | — |
| The site doc | `default.hbs`: a header and an A3 footer | header invocations before `{{{body}}}`, A3 footers after it, each band in doc order | — |
| Slugs collide | layers `Hero`, `HERO`, `Héro` on one template | `hero`, `hero-2`, `hero-3`, in position order | — |
| A slug comes out empty | a layer named `🌿🌿` or `ニュース` on A17 #1 | the slug of the design's name, `three-up`, then the collision rule | — |
| Byte-identical sections | Newsletter with the same content and controls on Home and Post | one `partials/sections/shared/newsletter.hbs`, named after Home's instance; both templates invoke it; each comment keeps its own layer name | — |
| Hidden | an instance with `hidden: true` | absent from its template and from `partials/`; a template whose every instance is hidden is its layout line alone | — |
| Hostile layer name | `x --}}<p id="leak">LEAK</p>{{@site.title}}` | the comment drops braces and controls; Handlebars 4.7.9 parses the line as one comment and nothing else | — |
| Hostile user text | `{{title}}`, `C:\{{x}}`, `{{#if x}}y{{/if}}`, the marker shape, quotes | in every file, braces are `&#123;`/`&#125;` and no marker or token survives; Handlebars finds the same statements as for benign text | — |
| A long start tag | A22 #1's root (ten attributes), A4 #13's `<img>` | one attribute per line once indentation + tag passes 120; a shorter tag stays on one line; a long `srcset` value stays whole | — |
| Inline content | `<p>Join <strong>us</strong>!</p>`, two spans touching | written as the serializer writes it, on one line | — |
| Raw text | `<pre>`, `<textarea>` | content byte-identical | — |
| One design, many placements | A17 #1 on Home and on Tag | `partials/post-card.hbs` written once | two different bodies under one `data-partial` name throw, naming both designs (a library defect; `check-snapshots` refuses it first) |
| Unknown design | an instance whose `designId` the library lacks | — | throws `"{file} · {layer}: …"`, naming the design id |
| Wrong template | A24 #1 handed under `home.hbs` | — | throws, naming the file, the layer and the design's targets (`compilesTo`) |
| A file 7.1 does not compile | a doc under `partials/content-cta.hbs`, or under a name that is no template | — | throws, naming Story 7.3 for the first and the legal files for the second |
| A renderer refusal | a design the runtime refuses at its target (FR-H7, R-7) | — | rethrown with `"{file} · {layer}: "` before the runtime's own sentence |
| Determinism | the same input twice, keys and templates in another order | byte-identical output | — |

</frozen-after-approval>

## Code Map

**The section runtime**

- `packages/section-runtime/src/core.ts` — the shared walk and the theme emitter; every line below is touched or read:
  - `Tokens` :246-279. It resolves in reverse insertion order with the unwrap inside the loop; keep both behaviours.
    It gains each marker's role, and re-indents a multi-line block by the line it lands on.
  - `UserText` :283-324. One instance is shared across a compile through `RenderInput.users`; `substitute` is pure,
    and hoisting compares sections through it.
  - The marker sites, each passing its role:
    - `wrapGuard` :501-508 — open, close;
    - data-if / data-else :799-806 — open, else or close, close;
    - `gateMembers` :1616-1633 and `MEMBER_GATE` :1607-1611 — compound strings, still one role each;
    - the repeat replacement :1783-1798 — `opens`, `inner = '  {{> "name"}}'`, `close`; rebuilt already indented.
  - `dropComments` :1640-1649 (DW-159) — keep.
  - `tidy` :1869 — becomes the canvas's alone.
  - `renderTheme` :1872-1893 — serializes `root.innerHTML`, each partial, and the secondary-feed wrapper at :1890; all
    three move to the formatter.
  - `renderCanvas` :1896-1899 — untouched.
- `packages/section-runtime/src/main-feed.ts:107-121` — `feedQuery(entry, instance, file, postsPerPage)`. The compile
  calls it per instance, as the canvas does; `designate` stays Story 7.3's.
- `packages/section-runtime/src/doc-schema.ts` — `ProjectDoc` and `DocInstance`. A stored `layerName` may be `''`;
  `hidden`, `memberVisibility` and `isMainFeed` are defaulted.
- `packages/section-runtime/src/tokens.ts` — `Pack` :143 and `packTokensCss(pack)` :422, the token block. The
  `LINK_RULES` comment it carries is stripped in the theme.
- `@inflozo/section-runtime/reference` — `REFERENCE_PACK`, Paper, the pack the tests and the recorder hand in.
- Tests that read `renderTheme`'s text and may need whitespace-tolerant assertions:
  - `packages/section-runtime/src/agreement.test.ts`, `ad36.test.ts`, `contexts.test.ts`, `controls.test.ts`,
    `marks.test.ts`, `index.test.ts`;
  - `apps/web/paywall.test.ts`;
  - `tools/stress/test-vocabulary.mjs`.

  `agreement.test.ts`'s comparison (`skeleton`, `htmlSafe`) already ignores whitespace.

**The library**

- `packages/library/src/registry.ts:175-211` — `SectionRegistryEntry`: `id`, `category`, `categoryTitle`, `name`,
  `html`, `css`, the schemas, `dataBindings`, `bindingContext`, `compileTarget`. The library function returns these.
- `packages/library/src/icons.ts:42` — `iconDrawing`, handed to every render (static library data).
- `packages/library/src/placement.ts:129` — `compilesTo`, the one placement rule. `isSiteFooter` moves here from
  `apps/web/lib/editor.ts:186`; `canvasStack` at :190 keeps calling it.
- `packages/library/src/contexts.ts:90` — `targetContext(file).block`: the block a template opens around its sections
  (`post` on post, page and custom templates). Read it; never restate it.
- `packages/library/src/vocabulary.ts`:
  - :121-131 — `COMPILE_TARGETS`, `PAYWALL_TARGET`, `CUSTOM_TARGET_RE`, `isCompileTarget`;
  - :754-757 — the `data-partial` grammar.
- `packages/library/src/validate.ts`:
  - `validateDesign`'s markup checks — `editor-attribute` :249-253 is the shape to copy;
  - `rootClassOf` :1101;
  - `untokened` :1267-1268 — its comment-or-string scan becomes the shared `stripCssComments`.
- `packages/library/src/catalog.ts:215` — `resolveStrings`, which produces the `strings` a compile is handed.

**The compiler and the app**

- `packages/theme-compiler/` — a stub today:
  - `package.json` depends on `@inflozo/library` only; its devDependencies are gscan 6.4.2 and handlebars 4.7.9;
  - `src/index.ts` exports a name;
  - `tsconfig.json`.
- `apps/web/lib/editor.ts` — `SITE` :55 and `fileOfKey` :117, the app's key → file map. The compiler is handed files;
  Story 7.18 maps keys with this.

**Tools and checks**

- `tools/check-snapshots.mjs` — the per-design snapshot check:
  - `snapshotFiles` :79, `renderDesign` :127 and the `--update` row;
  - the A17 #1 partial row at :476, already whitespace-tolerant;
  - the controls-first harness at :152-174, which the three new rows follow.
- `packages/library/snapshots/{a1/1,a4/13,a17/1,a22/1,a24/1}/` — re-baselined, formatting only.
- `tools/stress/build.js` and `gate.js` — the two-gscan harness, local only (its `node_modules` is never installed in
  CI). It must stay 0/0 on the formatted output; its own assembly is DW-296's, Story 7.35.
- `tools/probe/record-mode-resolution.py` — the recorder pattern to copy:
  - inline Node 24 through `core.node24()`;
  - record-shim's `start_guard` (:172) and `restore_and_delete` (:191);
  - a nonce, controls, and the MEASUREMENTS write.

  DW-332 names three cleanup gaps in it; do not copy them.
- `eslint.config.js` — `bannedImports` :62-76, the test block :180-190, the app block :110-124 (the zod rule; keep it).

**Documents**

- `docs/section-authoring.md` — the `data-partial` row :1004 and the `style.css` rules :690-700.
- Updated at Dev:
  - `prd.md` — FR-J1 :388 and §7.4 :594-647;
  - `ARCHITECTURE-SPINE.md` — AD-5 rule 2 :126-131, AD-36's list of instances :413, the conventions row R2-10 :437,
    the note on D13's lint :580, and the capability map's FR-E row :649;
  - `MEASUREMENTS.md` — a new §70;
  - `tools/doc-audit.py` — a catalogue row for the recorder.

## Tasks & Acceptance

**Execution:**

**The library rules**

- [x] `packages/library/src/vocabulary.ts` -- the `data-partial` grammar also refuses Ghost's own partial names, as
  `GHOST_OWN_PARTIALS`: `content-cta`, `gift-toast`, `navigation`, `pagination`, `recommendations`, read in both
  majors' `core/frontend/helpers/tpl/` -- a repeat partial lands at the theme's `partials/` root. Ghost registers its own
  templates there first, and a theme partial of the same name replaces Ghost's template across the whole site.
- [x] `packages/library/src/validate.ts` -- two changes, one scan behind both:
  - Round 3's D13 lint: `control-character` refuses any C0 control character in a design's markup or stylesheet, other
    than line feed and carriage return (a tab too, Question 2's ruling), naming its line;
  - export `stripCssComments(css)` (strings kept), built on the one comment-or-string scan `untokened` already reads.

  The compiler's tokens are C0 characters, so a design file must never carry one; and stylesheet comments must be
  stripped by the same scan the validator trusts.
- [x] `packages/library/src/placement.ts`, `apps/web/lib/editor.ts` -- move `isSiteFooter` into the library; `editor.ts`
  imports it and keeps exporting it -- the canvas and the compiler split the site doc by one rule.

**The theme emitter**

- [x] `packages/section-runtime/src/format.ts` (new) -- the theme serializer, to Design Notes' contract:
  - block or inline layout, decided per element;
  - markers placed by their role;
  - start tags measured on their final text and broken past 120;
  - raw-text elements written verbatim.

  -- the formatting belongs to the serializer, while every expression is still a token.
- [x] `packages/section-runtime/src/core.ts` --
  - `Tokens.put` takes a role, and `resolve` re-indents a block's continuation lines by its landing line;
  - every marker site passes its role;
  - the repeat replacement is built already indented: `{{#get}}` › `{{#foreach}}` › the body or the invocation;
  - `renderTheme` serializes the root, every repeat body and the secondary-feed wrapper through `format.ts`, and stops
    calling `tidy`.

  -- this is what makes every snapshot the contract's text.
- [x] `packages/section-runtime/src/format.test.ts` (new) -- every rule of the contract, one by one, on jsdom trees.
  Then the render-neutral property: for each case, the formatted text and `innerHTML`, resolved by the same `Tokens`,
  are equal once block markers are removed and every whitespace run is collapsed. Its negative control is a formatter
  that puts a newline between two touching spans, which this check must fail -- a formatter that changes a page is
  this story's risk.
- [x] `packages/section-runtime/src/*.test.ts`, `apps/web/paywall.test.ts`, `tools/stress/test-vocabulary.mjs` --
  every assertion over `renderTheme`'s text whose subject is not formatting becomes whitespace-tolerant (`\s*`), keeping
  its subject; none is deleted or loosened past that -- the change is to formatting; what each assertion tests is not.

**The compiler**

- [x] `packages/theme-compiler/package.json`, `tsconfig.json`, `src/jsdom.d.ts` --
  - depend on `@inflozo/section-runtime`;
  - devDepend on `jsdom` 30.0.1, for the tests;
  - set `resolveJsonModule` for the icon set;
  - copy the runtime's `jsdom.d.ts` shape.

  -- the compiler drives the theme emitter.
- [x] `packages/theme-compiler/src/slug.ts` (new) + `slug.test.ts` -- `partialSlug`, and the per-directory collision
  rule, exactly as Design Notes state them, with the table of cases -- the "stated" function the AC asks for:
  deterministic, and unique within a directory.
- [x] `packages/theme-compiler/src/compile.ts` (new), `src/index.ts` -- `compileTheme(doc, input)` (Design Notes):
  - validate the files;
  - render each visible instance — shared `UserText`, `feedQuery`, `iconDrawing`;
  - partition;
  - assemble the templates and `default.hbs`;
  - write `screen.css`;
  - substitute last, and return the sorted record.

  Every refusal names its file and layer -- this is the mechanism.
- [x] `packages/theme-compiler/src/compile.test.ts` (new) -- the I/O matrix, on small inline designs. Then, over every
  file the compiler emits:
  - Handlebars 4.7.9 parses it;
  - there is exactly one `{{{`, the `{{{body}}}` in `default.hbs`;
  - there is no C0 character, no `{{!--` other than a boundary comment, and no CSS comment other than a section header;
  - there is no `inflozo` in any case, no `data-inflozo-` and no input instance id;
  - every partial is referenced, and no consumed directive survives;
  - shuffled inputs give the same bytes.

  -- this is what the compiler promises, held over every file.
- [x] `eslint.config.js` -- `handlebars` and `prettier`, with their subpaths, become banned imports in every non-test
  source under `apps/` and `packages/`. A test under `packages/` may still import `handlebars` -- this turns "never
  parsed, evaluated or printed in the product" into a rule.

**CI, the recorder and the documents**

- [x] `tools/check-snapshots.mjs` -- three new rows, each with its control first:
  - every class a design writes is its root or begins with `{root}__` or `{root}--`, and the root is `{category}-{n}`;
  - no two designs declare one `data-partial` name;
  - the five-pilot project the recorder builds (Design Notes), with fixed words in place of the nonce and compiled with
    Paper, parses under Handlebars 4.7.9, carries one `{{{body}}}` and no fingerprint, references every partial it
    emits, and comes out byte-identical on a second compile.

  -- the library-wide halves that CI holds.
- [x] `tools/probe/record-theme-assembly.py` (new), `tools/doc-audit.py` -- the T1 recorder described in Design Notes,
  and its catalogue row -- R-82: Ghost renders what the compiler emits.
- [x] `docs/section-authoring.md`, `prd.md`, `ARCHITECTURE-SPINE.md`, `epic-7-context.md` -- propagate the list in
  Design Notes, then grep the repo for the old wording -- standing rules 3 and 7.
- [x] `packages/library/snapshots/` -- run `node tools/check-snapshots.mjs --update` once the one-time render-neutral
  sweep under Verification has passed for every design. Commit it on its own, after the Dev commit, and push the two
  together -- AD-35 names this re-baseline.

### Review Findings

Code review of 2026-10-06: five layers (blind, edge-case, verification-gap, acceptance, real-infra). Every patch below
is applied in this commit; the defers are DW-336 to DW-340; Question 2 holds the one decision.

- [x] [Review][Decision] A tab is legal in a design file and illegal in the theme it becomes — Question 2, ruled option 1:
  `control-character` refuses U+0009 too [packages/library/src/validate.ts:1298].
- [x] [Review][Patch] A stylesheet header part re-formed `*/` after one pass (`**//`), which could end the `screen.css`
  header comment early [packages/theme-compiler/src/compile.ts:50] — dropped until none is left, with a test.
- [x] [Review][Patch] The compile's strings, asset URLs and pack CSS had no C0 guard, so a U+0005 in one would land as a
  line break through `KEEP_NL` (AD-36, every new sink) [packages/theme-compiler/src/compile.ts:77] — refused, naming the
  input, with a test and its control.
- [x] [Review][Patch] Rule 5 measured a start tag on its whole text, so a value holding a line break counted as one
  long line [packages/section-runtime/src/format.ts:66] — the widest line is measured, with a test.
- [x] [Review][Patch] A section's top level is block layout without `isBlock`'s test, so two touching root nodes gain
  a line break — the one place the formatter adds whitespace [packages/section-runtime/src/format.ts:140]. The contract
  says the top level is always block (rule 3), and the runtime's own fixtures rely on it, so the emitter is unchanged
  and the case is stated in `format.test.ts`; `check-snapshots` holds every library design's top level whitespace-
  separated, behind a control — so the added break never meets a real design.
- [x] [Review][Patch] The render-neutral claim rests on no design setting `white-space: pre*` outside `pre`/`textarea`
  and nothing held it [packages/library/src/validate.ts:1064] — `white-space-pre` refuses it, with a test.
- [x] [Review][Patch] "Two designs' rules never meet in `screen.css`" was held on the HTML side only; a bare `p { }` or
  another design's class in `style.css` passed every check [tools/check-snapshots.mjs:551] — the stylesheet half is a
  row with its control; every design's selector names its root (executed: all clean).
- [x] [Review][Patch] The FR-J1 import ban had no executed control past the planted files at Dev
  [eslint.config.js:145] — three `lintText` rows in `tools/check-baseline.mjs` (core refused, app refused, a test may
  load `handlebars` and not `prettier`); the core blocks now carry the FR-J1 message.
- [x] [Review][Patch] The fingerprint scan did not look for a "generated by" / "built with" line, which Design Notes
  list first [packages/theme-compiler/src/compile.test.ts:315, tools/pilot-theme.mjs:105] — added to both.
- [x] [Review][Patch] The recorder expected every site-doc root before the page's, so an A3 footer would fail a correct
  theme; its root match took only a lone class; §70's three hostile rows were indistinguishable; the page-word row's
  label claimed a place it did not read [tools/probe/record-theme-assembly.py:145-201] — roots split by `isSiteFooter`,
  the first class token matched, the detail printed in each row, the label corrected. Local half re-run: 14 files,
  gate 0/0 on both gscans, the GS110 control still refused.
- [x] [Review][Patch] The scaffold `package.json` wrote `card_assets: true`, the shape FR-J2 forbids
  [tools/probe/record-theme-assembly.py:110] — `{ "exclude": [] }`; gate 0/0 re-read.
- [x] [Review][Patch] An empty layer name was reported by design id in refusals and by design name everywhere else
  [packages/theme-compiler/src/compile.ts:83] — the name, once the entry resolves.
- [x] [Review][Patch] Propagation leftovers (standing rule 7): AD-5's exception paragraph still said "zero-`{{{`"
  [ARCHITECTURE-SPINE.md:132]; `epic-6-context.md:77` put the token block in `default.hbs` and `epic-4-context.md:239`
  asserted zero `{{{` with no exception (sub-bullets appended); `docs/section-authoring.md` said the header was the only
  stylesheet comment (`/* Tokens */` is another), scoped the class rule to authored classes, and gained the verbatim
  list, the top-level refusal, rule 5's scope and `white-space-pre`; the recorder's catalogue row lacked `page.hbs`.
- [x] [Review][Patch] Design Notes did not state what the code holds: the verbatim list, rule 5's scope, the per-line
  measure, the top-level refusal, and `cards.css`'s link as 7.13's — stated, in the Change Log.
- [x] [Review][Defer] A layer named `con`, `nul`, `aux`… slugs to a file Windows cannot extract
  [packages/theme-compiler/src/slug.ts:13] — deferred, DW-336 → 7.26.
- [x] [Review][Defer] `stripCssComments` cuts an unquoted `url(http://x/*/y)` at `/*` [packages/library/src/validate.ts:1270]
  — deferred, pre-existing scan, DW-337 → 7.4.
- [x] [Review][Defer] A layer name has no length cap, so a boundary comment line has none
  [packages/section-runtime/src/doc-schema.ts:26] — deferred, DW-338 → 7.21.
- [x] [Review][Defer] `themeFailures`' internal-reference pattern reads `R-1` or `Story 3` in any text
  [tools/pilot-theme.mjs:105] — deferred, DW-339 → 7.33.
- [x] [Review][Defer] The `attrs === null` branch of rule 5 has no test [packages/section-runtime/src/format.ts:53] —
  deferred, DW-340 → 7.33.

Dismissed as noise or already held: `postsPerPage` reaches `feedQuery` unvalidated (`feedBase` clamps it to 1–100);
marker imbalance inside inline content (markers are parked in pairs by the walk); CDATA/PI nodes (an HTML parser
yields none); an unparsed `ProjectDoc` (the type is `parseDoc`'s output); a repeat token landing inline (DW-333,
7.34); the removal of `tidy` on the theme path (the re-baseline sweep covers it); §70 overwriting another tool's §70
(section numbers are given out once); the `page.hbs` ruling's placement in `epic-7-context.md`; epics.md's 7.3 lacking
the `@page.show_title_and_feature_image` line (it has it, DW-153); §70's "post-card resolves" sentence resting on HTTP
200 plus root order (true, and `compile.test.ts` holds the partial's content).

**Acceptance Criteria:**

- **The mechanism, and no Handlebars or Prettier.** Given any set of template docs, a pack, assets and strings, when
  `compileTheme` runs, then sections are walked as annotated HTML, values substituted and block helpers injected as
  comment markers, then serialized; markers are unwrapped before tokens resolve, and user text is substituted last over
  every file. No product module imports a Handlebars parser, evaluator or printer, or Prettier.
- **User text stays inert.** Given user text in any of AD-5's shapes, when compiled, then every emitted file renders it
  as literal characters, and Handlebars 4.7.9 finds the same statements in each file as for benign text.
- **Determinism.** Given the same input twice, in any key order or template order, when compiled, then the output is
  byte-identical.
- **The formatting contract.** Given any emitted file, when read, then:
  - it uses two-space indentation;
  - a start tag past 120 columns is written one attribute per line;
  - a blank line separates section boundaries, and no blank line falls inside a section;
  - each section's invocation is preceded by `{{!-- {Layer name} · {Category} · {Design} --}}`, carrying the same
    layer name its file name is slugged from.
- **A formatting-only re-baseline.** Given the per-design snapshots, when re-baselined, then the diff is formatting
  only: the render-neutral sweep finds every design's old and new text equal with block markers removed and whitespace
  collapsed. The re-baseline is committed on its own, naming 7.1.
- **Partials and classes.** Given Ghost-sourced repeating markup, when compiled, then it is a partial invoked with no
  parameters, one file however many placements. Design content is inlined and baked, and class names are the design's
  own.
- **The stylesheet.** Given `assets/css/screen.css`, when read, then:
  - the pack's token block comes first;
  - each placed design's stylesheet follows once, in design order, under its `/* {Category} · {Design} */` header;
  - it carries no other comment.
- **No fingerprints.** Given every emitted file, when scanned, then it carries no builder fingerprint as Design Notes
  define one.
- **The slug rule is stated.** Given `slug.ts` and Design Notes, when read, then the slug function and its collision
  rule are stated there, and `Hero`, `HERO` and `Héro` on one template get three distinct files.
- **Ghost renders it.** Given T1 and the owner's in-session go, when the recorder runs, then Ghost 6.58.0 accepts and
  renders the compiled pilot theme behind its controls, MEASUREMENTS §70 records the run, and T1 is restored and read
  back.
- **No frame.** Given a story with no surface (owner test none: a compiler mechanism), when it deploys green, then it is
  Done on the Deploy commit. It names no frame and carries no "matches the frame" criterion: R-74 binds surfaces (R-80).

## Spec Change Log

- **2026-10-06, Review.** Design Notes gained what Dev had settled and the review found unstated: the verbatim list
  as the code holds it, rule 5 scoped to block layout and measured per line, the top level's one added break and the
  library row that keeps it from any design, and `cards.css`'s link as 7.13's. Three guards landed beside the code (Review Findings): `white-space-pre`,
  the stylesheet half of the class rule in `check-snapshots`, and the FR-J1 import ban as executed rows in
  `check-baseline`. The recorder's scaffold `package.json` now carries FR-J2's `card_assets` shape, and its rows split
  the site doc's roots as the compiler does. Question 2 was ruled option 1 the same day (Fix): a tab is refused in a design file too.
- **2026-10-06, Dev.** The recorder's scaffold (Design Notes § The T1 recorder, step 2) gained a stand-in `page.hbs`,
  Story 7.3's, on the owner's ruling of Question 1: without it both gscans flag `GS110-NO-MISSING-PAGE-BUILDER-USAGE`,
  because the pilots compile no `page.hbs`. Nothing the compiler emits changed.

## Design Notes

### The input and the output

```ts
type CompileInput = {
  /** every template handed in, by its file — `default.hbs` is the site doc (Story 7.18 maps keys with `fileOfKey`) */
  templates: Readonly<Record<string, ProjectDoc>>
  /** the library, handed in (AD-14) — the same entries the editor reads */
  library: (designId: string) => SectionRegistryEntry | undefined
  pack: Pack                                  // the pack in force, an own pack already resolved
  assets: Readonly<Record<string, string>>    // asset id → URL; Story 7.4 points these at bundled files
  strings?: Readonly<Record<string, string>>  // resolveStrings' output; the catalog's English when omitted
  postsPerPage: number                        // projects.posts_per_page — a secondary feed's query is sized by it
}
compileTheme(doc: RuntimeDocument, input: CompileInput): Readonly<Record<string, string>>
```

The other inputs AD-14 lists arrive with the stories that read them: routes with 7.16 and 7.17, the settings snapshot
with 7.9 and 7.10, the asset bytes with 7.4.

A template file must be `isCompileTarget(file)` without `PAYWALL_TARGET`, or the site doc's `default.hbs`. The paywall
is Story 7.3's. `default.hbs` and `screen.css` are always emitted, even with no site doc and no section.

### The formatting contract

This contract is normative, because NFR-6(c1)'s snapshots diff against it.

1. **Lines.** Line endings are LF. There are no tabs and no trailing whitespace, and every file ends with exactly one
   newline. No blank line appears inside a section or a partial, apart from a `pre` or `textarea`'s own content.
2. **Nesting.** Each level is two spaces:
   - in block layout, a child sits one level deeper than its parent's start tag;
   - between a block helper's open and its `{{else}}` or close, markup sits one level deeper than the helper;
   - `{{else}}` and the close align with the open.
3. **Block or inline — decided per element, from the design's own whitespace.**
   - **Block layout** (one child per line) applies when all three hold:
     - the element has at least one element child;
     - no child text contains anything but whitespace;
     - whitespace fills every gap — after the start tag, between each two children that are not markers, and before
       the end tag.
   - Markers are not children here: the compiler puts each against the element it wraps, so a marker never counts as a
     gap.
   - **Inline layout** applies to every other element. Its content is written on the current line exactly as the
     serializer writes it. The one change allowed is that a whitespace run containing a line break becomes a single
     line break plus the indentation.
   - A section's top level is always block layout — so two nodes that touch there (two root elements with no
     whitespace between) get a line break, the one place the formatter adds whitespace. No library design has one:
     `tools/check-snapshots.mjs` holds every design's top level whitespace-separated *(review, 2026-10-06)*.
   - `pre`, `textarea`, `script`, `style` and `title` are written verbatim — and so is every element whose content the
     serializer writes raw or not at all (`template`, `iframe`, `noscript`, `xmp`, `noembed`, `noframes`, `plaintext`),
     because walking their children would not be the serializer *(Dev; recorded here at review)*.
4. **Why this is render-neutral.**
   - **CSS.** Under `white-space: normal` or `nowrap`, a run of whitespace renders as one space or as nothing, whatever
     it holds. Every design uses one of the two; none sets `pre*` outside the verbatim elements. Rule 3 only rewrites
     such runs, and only places a line break where whitespace already was.
   - **Ghost adds nothing.** It compiles every template and partial with `preventIndent: true`, so an indented partial
     invocation never re-indents the partial's output. And a block helper, comment or partial alone on its line is
     removed together with that line, under Handlebars' standalone rule.
   - **Executed** in the scratchpad on handlebars 4.7.9: a `<pre>` inside an indented partial comes out byte-identical
     with `preventIndent`, and re-indented without it.
5. **Start tags.**
   - Attributes keep the serializer's order, quoting and escaping.
   - A start tag is measured on its final text, with every expression token and user-text marker resolved. When the
     line's indentation plus that tag exceeds **120** (JavaScript string length; the widest line, where a value holds a
     line break), the tag is written one attribute per line, each one level deeper than the line, with `>` ending the
     last attribute's line. This rule applies in **block layout**; a tag inside inline content is written as rule 3
     writes it, however long *(review: the scope was implied by rule 3 and the manual check, now stated)*.
   - An attribute value is never split. A value longer than the budget stays whole on its own line.
   - Text is never wrapped.
6. **Templates.** A page template is `{{!< default}}`, a blank line, then each section's boundary comment and
   invocation. They sit inside the block its target opens, one level in (`targetContext(file).block`). Consecutive
   sections are separated by exactly one blank line:

   ```hbs
   {{!< default}}

   {{#post}}
     {{!-- Post header · Post Headers · Centred --}}
     {{> "sections/post/post-header"}}

     {{!-- Newsletter · Newsletter · Inline Row --}}
     {{> "sections/shared/newsletter"}}
   {{/post}}
   ```

7. **The boundary comment** is `{{!-- {Layer name} · {Category} · {Design} --}}`:
   - its parts are the instance's `layerName` (the same string its file is slugged from), the entry's `categoryTitle`,
     and the entry's `name`;
   - each part has `{`, `}` and C0 control characters dropped, every whitespace run collapsed to one space, and is
     trimmed;
   - an empty layer name prints as the design's name.

   With no brace left, nothing inside can close the comment early. Handlebars' lexer ends `{{!--` at the first `--}}`
   or `--~}}`.

**Before and after, A22 #1's opening lines:**

```hbs
{{#if @site.members_enabled}}<section class="a22-1" data-align="center" … data-divider="none">   ← today, one line
{{#if @site.members_enabled}}
  <section
    class="a22-1"
    data-align="center"
    …
    data-divider="none">
    <div class="a22-1__inner">
```

### `default.hbs`, as 7.1 emits it

```hbs
<!DOCTYPE html>
<html lang="{{@site.locale}}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{meta_title}}</title>
    <link rel="stylesheet" href="{{asset "css/screen.css"}}">
    {{ghost_head}}
  </head>
  <body class="{{body_class}}">
    {{!-- Header · Headers · Rail --}}
    {{> "sections/default/header"}}

    {{{body}}}

    {{ghost_foot}}
  </body>
</html>
```

- **The site doc's sections.** Those that are not A3 footers come before `{{{body}}}`, and the footers come after it
  (`isSiteFooter`, the canvas's own `canvasStack` order). A blank line separates every two of them.
- **The stylesheet** comes before `{{ghost_head}}` (§7.4).
- **What later stories add to this file:**
  - `<main>` and the skip link's target — 7.3;
  - fonts and their preload — 7.4;
  - the `main.js` tag — 7.5;
  - the `cards.css` link — 7.13 (the recorder's scaffold `cards.css` is gscan's to see and is linked by nothing; §70
    proves it was uploaded, not served);
  - the colour-scheme class and the inline `@custom` block — 7.10, 7.11;
  - the credit line — 7.28.

### The tree 7.1 emits

| Path | Holds |
|---|---|
| `default.hbs` | the layout above, always |
| `{file}`, for each other template handed in | the layout line and that template's sections |
| `partials/sections/{stem}/{slug}.hbs` | one placed section's markup, from column 0. `{stem}` is the file without `.hbs`: `default` for the site doc, `custom-signup` for `custom-signup.hbs` |
| `partials/sections/shared/{slug}.hbs` | a section that is byte-identical on two or more templates, named after the first instance |
| `partials/{name}.hbs` | a Ghost-sourced repeat's body, under its design's `data-partial` name, written once |
| `assets/css/screen.css` | `/* Tokens */` and `packTokensCss(pack)`, then each placed design's stylesheet once, in design order (category number, then design number), each under `/* {Category} · {Design} */`. Every other comment is removed (`stripCssComments`), trailing whitespace is trimmed, there is at most one blank line in a row, and one blank line separates blocks |

A header's `{Category} · {Design}` has `*/` and C0 characters dropped and whitespace collapsed.

### The partial slug, and its collision rule

R2-10 asked for both to be stated. Here they are.

**`partialSlug(name)`:**
1. NFKD-normalize.
2. Drop combining marks (`\p{M}`).
3. Lowercase with `toLowerCase` — never a locale form, under AD-1.
4. Turn spaces and underscores into `-`.
5. Drop everything outside `[a-z0-9-]`.
6. Collapse runs of `-`, and trim `-` at both ends.
7. Cut to 60 characters, and trim a trailing `-` again.

It is §7.4's custom-template rule plus a length cap, so the product keeps one rule for a name that becomes a file. An
empty result falls back to the slug of the design's `name`, then of its `categoryTitle`, then to `section`.

**Collision.** Deterministic is not unique: `Hero` and `HERO` slug alike. Within one directory, names are given out in
placement order:
- in a template's own directory, position order;
- in `shared/`, the first instance's template file in code-unit order, then position.

Each name takes its slug when that is still free in the directory, and otherwise the first free of `slug-2`, `slug-3`,
and so on.

| Placed, in order | Files |
|---|---|
| `Hero`, `HERO`, `Héro` | `hero`, `hero-2`, `hero-3` |
| `Hero 2`, `Hero` | `hero-2`, `hero` |
| `Hero`, `Hero 2`, `Hero` | `hero`, `hero-2`, `hero-3` |
| `404` | `404` (integer-like names stay) |

A rename moves both the file and its comment in the same compile. FR-J16's drift check reads content, not paths, so a
rename is never drift (7.21).

### Partition

- **Identity.** A section's identity is its template text *after* user-text substitution. For the comparison it is
  computed by `UserText.substitute` on a copy, which is pure; the tree is still substituted once, last.
  - Two or more instances with one identity, across two or more templates, share `partials/sections/shared/{slug}.hbs`.
  - Two or more on one template share one file in that template's directory, named for the first.
  - Each invocation keeps its own boundary comment.
  - A section that renders nothing — a hand-picked feed with nothing picked (Story 5.19) — contributes no file, no
    invocation and no comment.
- **Repeat partials.** A repeat partial is filed once at `partials/{name}.hbs`. R-188's sweep keeps user text out of a
  repeat body, so every placement of a design yields the same bytes. Two different bodies under one name throw, naming
  both designs. That is a library defect, which `check-snapshots` refuses before it can reach a compile.
- **Ghost's own partial names — `GHOST_OWN_PARTIALS`.**
  - Ghost registers `core/frontend/helpers/tpl/` first, then the theme's `partials/`, and a theme file of the same name
    replaces Ghost's (engine.js's `partialsDir`, `overrides.json:6`).
  - So a design's `data-partial` may never be `content-cta`, `gift-toast`, `navigation`, `pagination` or
    `recommendations`. (`cancel_link` cannot pass the grammar.)
  - The paywall's `content-cta.hbs` (7.3) and a pagination style's override (7.14) are the compiler's own, chosen by a
    treatment.

### What "no builder fingerprints" means

A builder fingerprint is any byte that identifies the tool or the build, rather than drawing or styling the site:
- a generator tag, or a "generated by" or "built with" line;
- a timestamp, a hash, an instance id or a template key;
- an internal reference in a comment: a story, ruling, requirement or DW id, or a `ponytail:` note. The design
  stylesheets and the token block carry such comments today, which is why the compile strips CSS comments;
- a `data-inflozo-*` attribute, the word `inflozo` in any case, or a C0 control character.

Three marks are specified rather than incidental. Each arrives with its own story, as a named exception to the scan:
- the theme name `inflozo-{slug}` — FR-J10, Story 7.24;
- the `package.json` marker FR-J13 gates restore on — 7.2 emits it, 7.20 reads it (DW-335);
- FR-J15's credit — 7.28.

FR-J16's per-file fingerprint lives in the deploy's content manifest (`deploys.content_manifest`), never inside a file
(7.21).

### Seven contradictions in the sources, settled here

The epic context lists these seven. Each follows from rules the owner has already approved, so none is put to him:
standing rule 6 is about a decision he never made, and these are readings of decisions he did make.

1. **Where the token block lives.**
   - FR-J1 says "one organized stylesheet carries the tokens at its top"; §7.4's tree agrees; and AD-18 says
     "`screen.css` opens with" the font tokens. All three put it at the top of `screen.css`.
   - Only the capability map's "Lives in" row says `default.hbs`. 7.1 follows the three, and the row is amended.
   - AD-30 still has one file naming a mode. The inline block in `default.hbs` (7.10, 7.11) sets plain custom
     properties from `{{@custom.*}}` and names no mode; the token block reads them with fallbacks. Each card gets a line
     saying so.
2. **Class names "derive from section names".**
   - Designs' stylesheets are concatenated into one `screen.css`, so two designs' classes must never meet.
   - The pilots' id-rooted classes (`a17-1__cell`, accepted at Story 4.10's owner test) are the only reading that holds
     that and AD-3 together (no generated class names).
   - 7.1 holds it with a check, never a rewrite.
3. **"No builder fingerprints" against FR-J13's marker and FR-J16's fingerprint** — settled in the section above.
4. **The slug rule** — stated above, answering R2-10 and keeping §7.4's numeric suffix.
5. **Hoisting identity after substitution, against partitioning before it** — identity is taken from a substituted
   copy, and the tree is substituted once.
6. **Zero `{{{` (AD-5 rule 2) against one `{{{body}}}` (§7.3, Round 3's D3)** — D3 is the later decision, and the
   approved one. AD-5's text is corrected to match it.
7. **D13's lint is unbuilt** — 7.1 builds it, as `control-character`.

### Facts this spec rests on (standing rule 1)

**Read in Ghost's source**, from the npm tarballs, read-only:
- Ghost 6.58.0 and 5.130.6, `core/frontend/services/theme-engine/engine.js:16`: every template is compiled with
  `{preventIndent: true}`, and `partialsDir` is `[helperTemplates, theme partials]`. `helperTemplates` is
  `core/frontend/helpers/tpl/` (`overrides.json:6`).
- express-hbs 2.5.0, `lib/hbs.js:328-352`: a partial is compiled through `onCompile` too.
- `core/server/services/themes/validate.js` (`canActivate`): Ghost refuses a theme only on *fatal* gscan errors.

**Read in Handlebars' source** (4.7.9):
- `runtime.js:89-96`: a standalone partial's output is re-indented unless `preventIndent` is set; see also
  `compiler.js:203-206`.
- The lexer ends `{{!--` at the first `--}}`, and `CommentStatement` compiles to nothing (`compiler.js:234`).

**Executed:** `{{!-- x --}}{{@site.title}} --}}` parses as a comment followed by a live mustache, and renders the site's
title. With the braces dropped it is one comment.

**Already recorded in MEASUREMENTS:**
- §15 — nested partial directories resolve.
- §14c — gscan catches an unresolvable partial (GS005) but not an orphan one; `GS050-CSS-KGWF` is an error without
  `.kg-width-*`.
- §15j — GS005 is fatal at upload.

### The T1 recorder — `tools/probe/record-theme-assembly.py`

It takes no flags; any argument prints its docstring.

1. **Compile, in Node 24 inline.**
   - Assemble the five pilots into one project:
     - the site doc: A1 #1, "Header";
     - `home.hbs`: A4 #13, A17 #1 as the main feed, and A22 #1;
     - `index.hbs`: A17 #1;
     - `post.hbs`: A24 #1, and A22 #1 with Home's content, so that it hoists.
   - Make two words from this run's nonce:
     - a *page word*, written into A4 #13's eyebrow text — the page's proof that it is this run's theme;
     - a *layer word*, written into every layer name — it must never reach a page.
   - Give one section a hostile layer name, and put AD-5's hostile strings into A22 #1's text.
   - Compile with Paper.
2. **Add the scaffold** — new files only, each named for the story that owns it:
   - `package.json` (7.2): a probe name, `engines.ghost`, the `IMAGE_SIZES` map, and a `posts_per_page` that T1's
     published posts overflow, so that `/page/2/` exists;
   - `assets/css/cards.css`, holding `.kg-width-wide` and `.kg-width-full` (7.13, D12) and the two `--gh-font-*`
     declarations (7.4, AD-18);
   - `page.hbs` (7.3): a stand-in that reads `@page.show_title_and_feature_image`, for GS110 — added on the owner's
     ruling of Question 1.
3. **Gate** through `tools/stress/gate.js`: 0 errors and 0 warnings on both gscans, or nothing uploads.
4. **On T1, behind `start_guard`.** Upload and activate the theme, and read `/` until it shows the page word. Then
   read `/`, `/page/2/` and one published post. The restore-and-delete `finally` encloses the upload (DW-332).
5. **Rows, on each page:**
   - the page word, where Home draws A4 #13;
   - every placed section's root class, once each, in doc order;
   - no `{{`, `}}`, `{{!--`, C0 character or layer word in the HTML;
   - the hostile text shown as its literal characters;
   - `<html lang>` equal to the site's locale.
6. **Controls:**
   - the layer word *is* in the uploaded templates, so its absence from every page is the comments' doing;
   - the hostile layer name is in the uploaded `home.hbs` too;
   - the page served is this run's theme.
7. **Record** MEASUREMENTS §70. The Ghost 5 half joins DW-326's pass (R-238).

### Propagated at Dev

**`prd.md`:**
- FR-J1 gains the budget (120) and the boundary comment's sanitizing.
- §7.4's tree:
  - site sections go under `partials/sections/default/`;
  - `partials/`' root holds design repeat partials, plus the treatments' Ghost overrides (`content-cta`, `pagination`);
  - its "header.hbs footer.hbs post-card.hbs pagination.hbs" line is corrected.

**`ARCHITECTURE-SPINE.md`:**
- AD-5 rule 2 takes D3's one `{{{body}}}`.
- AD-36 gains this instance: a layer name reaching a Handlebars comment, and `data-partial` against Ghost's own names.
- The conventions row R2-10 points at the stated slug.
- The note on D13 says the lint is built.
- The capability map's FR-E row reads: the token block at the top of `screen.css`.

**`docs/section-authoring.md`:**
- the `data-partial` row: unique across the library, never one of Ghost's own names;
- the class-root rule;
- the C0 rule;
- one paragraph pointing at this contract.

**`epic-7-context.md`:** a sub-bullet each where Dev settles something.

**Last:** grep the repo for each old wording.

### The commits

Dev ends with two commits, pushed together, because either alone leaves `check-snapshots` red. There is no migration
and no Schema phase.

1. `Story 7.1 - Dev - …`, carrying the code, tests, documents and recorder, and §70 if the recorder ran in the Dev
   session on the owner's go.
2. The re-baseline alone, as `Story 7.1 - Dev - the formatting-only re-baseline <hash> caused: …` (AD-35).

## Questions for the owner

### Question 1 — The test theme needs a page template the five pilots do not have (the recorder's Ask First)

**In plain English.** Before the recorder sends the compiled test theme to T1, both of Ghost's theme checkers read it
on this machine. They refuse it — Ghost 5's checker calls it an error, Ghost 6's a warning — because no file in the
theme reads Ghost's own "Show title and feature image" switch for pages. The five pilots compile no Page template, and
building one is Story 7.3's job. The spec says: if the checker names anything the scaffold list does not cover, stop
and ask before adding to it. So nothing has been uploaded.

**Example.** In Ghost Admin, a page's settings have a switch that hides its title and feature image. Ghost's checker
insists a theme reads that switch (`GS110-NO-MISSING-PAGE-BUILDER-USAGE`), in `page.hbs`, or in `post.hbs` when there is
no `page.hbs`. Story 6.5's recorder met the same rule and carried a two-line `page.hbs` for it.

1. **Add a small `page.hbs` to the recorder's scaffold, labelled as Story 7.3's**, that reads the switch around the
   page's title and body — new file only, nothing compiled is changed. **(RECOMMENDED)** It is exactly what Story 6.5's
   probe did, and it keeps the rule "every scaffold file is named for the story that owns it".
2. Wait, and run the recorder only once Story 7.3 compiles a real `page.hbs`. Story 7.1's "Ghost renders it" criterion
   stays open until then.
3. Let the recorder accept this one checker finding and upload anyway. Not recommended: the spec's gate is 0 errors and
   0 warnings on both checkers.

**Ruled: option 1 (owner, 2026-10-06).** Asked in the Dev session; the recorder's scaffold gained the stand-in
`page.hbs`, labelled as Story 7.3's, and the run went ahead the same session (Verification).

### Question 2 — A tab character is allowed in a design file but forbidden in the theme it becomes (found at review)

**In plain English.** Two rules disagree about the tab key. The rule for the design files a category delivers says a
tab is fine (only stranger invisible characters are refused). The rule for the theme files Inflozo writes says they
carry no tabs at all, and the checks hold the theme to that. Nothing converts one into the other, so the first design
delivered with a tab in it would pass its own checks and then turn the theme check red with a confusing message about
"a control character". No design today has a tab; this is about the next one.

**Example.** A category's stylesheet is written with tabs for indentation. It validates. The moment it is placed in a
project, the compiled `screen.css` carries those tabs, and the theme check fails.

1. **Refuse a tab in a design file too** — a design is two-space indented like everything else here, and the refusal
   names the file and line as the existing rule does. **(RECOMMENDED)** One rule, one alphabet, and the kits never
   write a tab.
2. Keep tabs legal in design files and have the compiler turn each one into spaces when it writes the stylesheet. More
   code, and a tab inside a quoted string would be changed too.
3. Allow tabs in the theme and drop "no tabs" from the formatting contract. Not recommended: hand editors then meet
   mixed indentation.

**Ruled: option 1 (owner, 2026-10-06).** `control-character` refuses U+0009 too, naming it; the test's tab case flipped from
legitimate to refused; `docs/section-authoring.md`'s row says so. Every library design is tab-free (`check-snapshots` validates each).

## Verification

**Commands:**
- `pnpm check` -- expected: green. That covers lint (the new import bans hold), typecheck, and every package's tests
  (`format.test.ts`, `slug.test.ts` and `compile.test.ts` among them), plus `node tools/check-snapshots.mjs` with its
  three new rows, each control failing on its broken subject first.
- One-time, at Dev, before `--update`: for every design, compare the snapshot at HEAD with the new text, both with
  `{{#…}}`, `{{/…}}` and `{{else}}` removed and every whitespace run collapsed to one space -- expected: every design
  equal, with the count printed by the run and recorded under Results.
- `node tools/check-snapshots.mjs` (Node 24) -- expected: PASS against the re-baselined snapshots.
- `cd tools/stress && node build.js && node gate.js theme` (Node 24, after a root `pnpm install`) -- expected: 0 errors
  and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6). The scale harness still compiles from the formatted emitter.
- `python3 tools/probe/record-theme-assembly.py` (on the owner's in-session go, in the main session) -- expected:
  - the gate reads 0/0 on both gscans;
  - on T1 `ghost6.inflozo.com` (6.58.0), every page row holds behind its controls;
  - T1 is restored and read back;
  - §70 is written.
- `python3 tools/doc-audit.py --check` (twice after adding the recorder's row) -- expected: PASS.

**Manual checks:**
- From the recorder's compiled theme, read `home.hbs`, one section partial, `partials/post-card.hbs`, `default.hbs`
  and `screen.css`. They should be hand-editable at Casper's grade: no ragged indentation, no line past the budget
  except a single long attribute value or text, and no comment but the labels.

**Real infrastructure (R-82):**
- T1, through the recorder; gscan's two checkers run locally.
- The story touches no Supabase, Vercel, Resend or Dodo surface, and changes nothing a visitor or the owner reaches:
  the compiler has no product caller until Story 7.18.

**Dev results (2026-10-05, Node 24, on this tree).**
- `pnpm check`: exit 0 — lint (the new import ban included), typecheck of every package, and every package's tests:
  `format.test.ts`, `slug.test.ts` and `compile.test.ts` among them, then `check-snapshots` with its three new rows,
  each behind a control that fails on its broken subject first.
- **The one-time render-neutral sweep**, before `--update`: every snapshot file at HEAD against the new text, both with
  `{{#…}}`, `{{/…}}` and `{{else}}` removed and whitespace collapsed — the run printed "6 of 6 snapshot files equal"
  over the library's designs. `node tools/check-snapshots.mjs --update` then rewrote them, and `check-snapshots` passes
  on the re-baselined files. The diff is formatting only.
- **The import ban, by control**: planted files importing `handlebars` in `packages/theme-compiler/src/` and in
  `apps/web/lib/`, and `prettier/standalone` in `packages/library/src/`, were each refused by `eslint`; a test under
  `packages/` importing `handlebars` passed, and one importing `prettier` was refused. The planted files were removed.
- `cd tools/stress && node build.js && node gate.js theme`: 0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6),
  the scale harness compiling from the formatted emitter.
- `python3 tools/doc-audit.py --check`: PASS on the second run (the first regenerated the index and the story board).
- **The recorder's local half** (compile through `tools/pilot-theme.mjs`, `themeFailures`, the scaffold, the gate) ran
  with no server contact: the compile is clean, and the gate refused the theme with `GS110-NO-MISSING-PAGE-BUILDER-USAGE`
  (an error on 4.49.7, a warning on 6.4.2) — Question 1. With the ruled stand-in `page.hbs` it reads **0 errors and 0
  warnings on gscan 4.49.7 (v5) and 6.4.2 (v6)**.
- **The canvas is untouched, executed rather than argued** (a scratchpad script, not committed): HEAD's `core.ts` beside
  this tree's, `renderCanvas` over every design and every fixture in `packages/library/`, at every target, with the
  defaults and then each control's every value, Orbit Weekly's rows — **338 of 338 renders byte-identical**, none
  throwing. Control: each pair also differs from the same render of a perturbed design, so the comparison is not
  vacuous. The render matrix (canvas PNGs) and the keyboard gate therefore have nothing new to see; CI's `check` job runs
  `pnpm keyboard` on the push.
- **The render-neutral sweep, re-run in the orchestrating session** on the final tree: 6 of 6 snapshot files equal to
  `git show HEAD:` with block markers removed and whitespace collapsed; control: a line break forced between two
  touching tags is caught.
- `cd tools/stress && node build.js && node gate.js theme` re-run on the final tree: 0 errors / 0 warnings on both.

**The I/O matrix, row by row → the check that ran and passed** (`pnpm check`, exit 0, on the final tree):

| Row | Check |
|---|---|
| A designed Home | `compile.test.ts` · "a designed Home: the layout line, then each section's label and invocation …" |
| A post | `compile.test.ts` · "a post: the sections sit inside the block its target opens ({{#post}}), one level in" |
| The site doc | `compile.test.ts` · "the site doc: headers before {{{body}}}, A3 footers after it …" (the doc stores the footer first) |
| Slugs collide | `compile.test.ts` · "slugs collide: Hero, HERO and Héro …"; `slug.test.ts` · the collision table |
| A slug comes out empty | `compile.test.ts` · "a slug that comes out empty takes the design's name, then the collision rule …"; `slug.test.ts` · the fallback chain |
| Byte-identical sections | `compile.test.ts` · "byte-identical sections share one file in shared/, named after the first instance …" |
| Hidden | `compile.test.ts` · "hidden: absent from its template and from partials/ …" (`page.hbs` with every instance hidden) |
| Hostile layer name | `compile.test.ts` · "a hostile layer name …", with the braces-kept control parsing a live mustache; on T1, §70 |
| Hostile user text | `compile.test.ts` · "hostile user text ships inert in every file …" (six shapes, statements equal to benign text); on T1, §70 |
| A long start tag | `compile.test.ts` · "the formatting contract inside a compiled section …"; `format.test.ts` · rule 5's two cases |
| Inline content | `format.test.ts` · rule 3 "a paragraph with words …" and "two spans that touch stay touching …" |
| Raw text | `format.test.ts` · "pre, textarea, script, style and title are written verbatim", the repeat-body `<pre>` case; `compile.test.ts` · the A4 #13 `<pre>`/`<textarea>` |
| One design, many placements | `compile.test.ts` · "one design, many placements …" (and the two-bodies throw); `check-snapshots` · "no two designs declare one data-partial name", behind its control |
| Unknown design · Wrong template · A file 7.1 does not compile · A renderer refusal | `compile.test.ts` · "every refusal names its file and its layer" |
| Determinism | `compile.test.ts` · "determinism: the same input, its templates and every object's keys in another order …"; `check-snapshots` · the pilot compile twice |

**T1, through the recorder, in the main session on the owner's in-session go (2026-10-06).**
`python3 tools/probe/record-theme-assembly.py`, keys read by variable name inside the script (`GHOST6_URL`,
`GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`), none printed.
- **Run 1 — VOID, nothing written.** Ghost 6.58.0 accepted the upload (HTTP 200, `inflozo-probe-theme-assembly`) and
  served `/`, `/page/2/` and `/probe-gated-post/` with HTTP 200, but the control "every page is this run's theme" read no
  `screen.css?v=` hash on any page: the recorder's pattern allowed `[0-9a-z]` and Ghost writes a mixed-case hash
  (`?v=qi9i38F3SaPNiyO4` on T1's Casper, read from the public home page). The `finally` re-activated `casper` and deleted
  the probe theme, both read back. The pattern was widened to `[0-9A-Za-z_-]`, and the recorder now prints every row
  before a failed control voids the run.
- **Run 2 — every row held.** Upload HTTP 200 on Ghost 6.58.0; `/` served this run's page word before any page was read. On `/`,
  `/page/2/` and `/probe-gated-post/`: each placed section's root class once, in doc order (`a1-1 a4-13 a17-1 a22-1`,
  `a1-1 a17-1`, `a1-1 a24-1 a22-1`); no `{{`, `}}`, `{{!--`, C0 character or layer word in the HTML (so Ghost's own
  injected HTML carries none either); A22 #1's three hostile strings as their literal characters on Home and the post;
  `<html lang="en">`, the site's locale; the control asset hash `HyBunOE2AzBSMRSn`, the same on all three. Then
  `casper` re-activated and read back, the probe theme deleted and read back (installed: `casper`, `racer`, `source`).
  **MEASUREMENTS §70 written.** The Ghost 5 half is DW-326's (R-238).
- **Manual check**, on the compiled pilot theme: `home.hbs`, a section partial, `partials/post-card.hbs`, `default.hbs`
  and `screen.css` read hand-editable — no ragged indentation, no `.hbs` line past the budget but a single long
  attribute value (`srcset`) or inline text, no comment but the labels and the stylesheet's headers. `screen.css`'s long
  lines are the designs' own one-rule lines; the contract sets no CSS line budget.

**Review (2026-10-06), real infrastructure (R-82), read-only — no upload, since the Dev run of the same day stands and
a second upload needs an in-session go.** Keys by variable name (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`,
`GHOST6_CONTENT_API_KEY`), none printed. On T1 `ghost6.inflozo.com`: `GET /ghost/api/admin/themes/` → 200, `casper`
active, `racer` and `source` installed, `inflozo-probe-theme-assembly` absent — the Dev run's `finally` left what §70
says; `GET /ghost/api/admin/config/` → 200, version 6.58.0; Content API `settings/` → 200, locale `en`; `posts/` → 200,
33 published, newest `/probe-gated-post/`; public `/` → 200, `<html lang="en">`, Casper's `screen.css?v=qi9i38F3SaPNiyO4`
— mixed case, Run 1's void confirmed; no `a1-1`, no probe name, no layer word on the public page. Controls: a wrong
Content key → 401 "Unknown Content API Key"; a JWT signed with a wrong secret → 401; the real key → 200 on each.
Locally, the recorder's own `compiled()` → `scaffold()` → `gated()` on the patched tree: 11 + 3 files, the same root
order as §70, 0 errors / 0 warnings on gscan 4.49.7 and 6.4.2 with FR-J2's `card_assets` shape; the control (the same
tree without `page.hbs`) refused with GS110 on both. No migration in the diff, so no R-99 schema read. The two Dev
proofs run from the scratchpad (the 6-of-6 render-neutral sweep and the 338-of-338 canvas comparison) are **one-shot
by construction** — each compared this tree against HEAD's at that moment — and are not committed; `format.test.ts`'s
`neutral()` and the re-baselined snapshots are their committed form.

**Real services the Dev phase hit (R-82):** T1 `ghost6.inflozo.com` (Ghost 6.58.0) — Admin API theme upload, two
activations and the delete; the Content API's `settings/` (locale `en`) and `posts/` (the published count that sizes
`posts_per_page`, and the newest post); the public pages `/`, `/page/2/` and the post — results above. gscan 4.49.7 and
6.4.2 ran locally. No Supabase, Vercel, Resend or Dodo surface is touched: the compiler has no product caller until
Story 7.18, and nothing a visitor or the owner reaches changed.
