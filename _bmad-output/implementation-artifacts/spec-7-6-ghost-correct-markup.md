---
title: 'Story 7.6 — Ghost-correct markup'
type: 'feature'
created: '2026-10-08'
status: 'done'
owner_test: none
review_loop_iteration: 0
baseline_commit: '9587b46976f1f1e3cbafac0c52a449e7e8dfafb3'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, the theme Inflozo builds follows the markup rules Ghost's own themes follow: each post's page sits inside the box Ghost themes put around a post, labelled with that post's tags, whether it is featured or has a picture, and — for a visitor who may not read it — that it is for members, so a site owner's own CSS can style those posts. Pictures are offered to browsers in Ghost's lighter WebP format at every size, every label a visitor reads goes through Ghost's translation helper instead of being typed into the page, no animation runs on and on for a visitor who has asked their device for less motion, and a check refuses any theme that breaks one of these rules. There is no screen to test by hand, so this story is done when it deploys green; until Story 7.12 adds the theme's language file, a test render shows each label's key (such as "nav.more") where its English will be.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:**
- A compiled post, page or membership page has no `<article>`. Its sections sit straight inside `{{#post}}`, so `{{post_class}}` is on no element. Neither are the members classes Ghost leaves to the theme, `post-access-{visibility}` (FR-J5).
- Nothing holds a compiled theme to Ghost's markup rules over its final text:
  - where `{{ghost_head}}`, `{{ghost_foot}}` and `{{body_class}}` sit;
  - that a `srcset` is the theme's own and says how wide it draws (`sizes`, NFR-2 (1));
  - that a `data-portal` names a page Portal opens;
  - that no member's own data is printed (AD-38);
  - that no visitor-facing label is typed into a template outside `{{t}}` (V1, appendix H1 §7);
  - that no helper Ghost deprecates is used.
- The theme's `srcset`s ask Ghost for each picture in its own format. Ghost converts to WebP on request (`format="webp"`, read in source on both majors), and its own Source theme asks for it.
- Nothing keeps a never-ending CSS animation behind the visitor's reduced-motion preference, and nothing stops a module from reading that preference itself. FR-G4 asks for both.

**Approach:**
- `compileTheme` wraps the sections of every template whose context-matrix row opens `{{#post}}` in one `<article>`. It carries `{{post_class}}` and the members classes.
- Two checks join the compile's final checks, and CI runs them too:
  - `checkGhostMarkup`: FR-J5 and AD-38, over the final text;
  - `checkChromeText`: V1, over the text before user words are substituted.
- `srcsetExpr` adds Ghost's `format="webp"` to every candidate, and the canvas asks for the same.
- A stylelint rule and a lint rule hold motion. CI holds gscan's deprecation rules over the pilot theme.
- The recorder proves it on T1 (§75).

## Boundaries & Constraints

**Always:**

- **Pure and deterministic (AD-1, AD-14).** Nothing new reads a file, a clock or a locale. The same input gives the same files, byte for byte.
- **One implementation of each rule.** Every caller calls the one spelling:
  - `POST_ARTICLE` is the article's opening line, for the compile, the check, the tests and the recorder;
  - `srcsetExpr` builds a `srcset`, and the check compares against it rather than re-deriving one;
  - the runtime's `checkChromeLiterals` reads V1, and the compile hands it the theme's own text;
  - `PORTAL_PAGE`, beside `PORTAL_ACTIONS` in the library's vocabulary, states which `data-portal` values Portal opens;
  - gscan's own `GS001-DEPR-*` rules decide what is deprecated.
- **The article.** It is written on every template whose matrix row opens `{{#post}}` (`targetContext(file).block === 'post'`: `post.hbs`, `page.hbs`, `custom-{name}.hbs`), and on no other.
  - `POST_ARTICLE` is the block's first line and `</article>` its last, with the sections one level in.
  - Its opening line is exactly `<article class="{{post_class}}{{#unless access}} post-access-{{visibility}}{{/unless}}">`: Ghost's helper, then the classes Ghost's Casper writes for a visitor without access.
  - It carries no class of Inflozo's (AD-3), and the canvas draws no article: no design selects on it.
  - A template with no visible section stays its layout line alone (Story 7.3's rule), with no block and no article.
- **WebP.** Every `srcset` candidate carries `format="webp"`, a constant, never a design's or a customer's value (AD-36).
  - `src` keeps the picture's own format.
  - The canvas asks for the same candidates of a linked site's Ghost-hosted picture. An external picture, or any picture on an unlinked project, passes through unchanged, as today.
- **The checks.** Each returns sentences, each naming its file, and the compile throws on any of them over its own output. CI also runs `checkGhostMarkup` over every design's rendered theme text, so an authoring defect is named at its design.
- **Motion.** An animation that repeats for ever (`infinite`), in any stylesheet the theme ships, sits inside `@media (prefers-reduced-motion: no-preference)`. No module file but `core.js` names the preference: `core` holds the one query, and a module reads `ctx.reducedMotion`.
- **No screen.** There is no frame (R-74 binds a surface, and this story draws none) and no hand test. The story is Done on its Deploy commit (R-80).
- **Counts are derived.**

**Ask First:**

- **Question 1, before Dev.** Dev builds § Ruled values as it stands at that moment.
- **The T1 run.** It uploads theme files to T1, so it needs the owner's in-session go, in the Dev or the Review session. It runs in the main session, never through a subagent.
- **A T1 row that does not hold, or anything gscan names beyond §73's scaffold.** Each is a stop, never a widened rule.
- **A render-matrix baseline that moves.** None should: the matrix's pictures are not Ghost-hosted, so their URLs do not change. A moved baseline is the owner's to approve (R-116).

**Never:**

- **Anything a later story owns:**
  - `locales/`, the language file and V3: Story 7.12;
  - the `srcset` of a bundled picture, composed from its rendition set: Story 7.29 (Design Notes § Settled here, item 5);
  - `cards.css`: 7.13;
  - the credit: 7.28;
  - gscan as the gate on every compile: 7.7;
  - FR-J17's quality gate: 7.8;
  - compile CI over the whole library: 7.33;
  - the canvas-against-Ghost comparison: 7.34.
- **Code changes ruled out:**
  - editing a design file (AD-35): a pilot's defect is raised against its owning story;
  - a `<picture>` element or a second image format, since WebP is Widely available at FR-G8's pin;
  - the compiler choosing `loading` by a section's position, since a section's text never varies by placement (hoisting and one snapshot per design rest on it);
  - a Ghost class on a design's own element (Question 1, option 1);
  - a hand-written list of deprecated helpers.
- **A database change or a new dependency.** There is therefore no Schema phase.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A post | `post.hbs` placing A24 #1 and A22 #1 | `{{#post}}`, then `POST_ARTICLE` two spaces in, then each section's label and invocation four spaces in, a blank line between them, then `</article>` and `{{/post}}` | — |
| A page with a Post header | `page.hbs` placing A24 #1 and A22 #1 | the article encloses the `@page` switch around A24 #1 and the other section | — |
| A membership page | `custom-signup.hbs` with one section | the same article, around its section | — |
| An emptied post | `post.hbs` whose every section is hidden | `{{!< default}}` alone: no block and no article | — |
| Every other template | `default.hbs`, `home.hbs`, `index.hbs`, the archives, `error.hbs`, `private.hbs`, the paywall partial | no `<article>` and no `{{post_class}}`. `default.hbs`'s lines are unchanged | — |
| A picture | A4 #13, A17 #1 and A24 #1 | each `srcset` is `srcsetExpr` of its path: one candidate per `image_sizes` key, `{{img_url <path> size="<key>" format="webp"}} <width>w`, in the map's order. The tag carries the design's `sizes`, and `src` is unchanged | — |
| A `srcset` without `sizes` | a design whose `data-bind-srcset` element has no `sizes` | — | the compile throws `checkGhostMarkup`'s sentence, naming the file. CI names the design |
| A Portal page | `data-portal="signup"`, `"account/plans"`, a bound `"signup/{{id}}/monthly"` | passes | — |
| Not a Portal page | `data-portal="sigup"`, `"share"`, `"gift"`, `"signin/"` or `""` | — | the compile throws, naming the file and the value |
| A member's own data | a template printing `{{@member.email}}`, or passing `@member.name` as a hash argument | — | the compile throws (AD-38). `{{#if @member}}` and `{{#if @member.paid}}` pass |
| Ghost's helpers out of place | `{{ghost_head}}` above the stylesheet link; a second `{{ghost_foot}}`; `{{post_class}}` on `<body>` or outside `POST_ARTICLE`; `{{body_class}}` in a section | — | each is named by `checkGhostMarkup` |
| A hard-coded label | a compiled template carrying `<a href="#site-main">Skip to content</a>`, or `alt="Logo"`, outside `{{t}}` | — | `checkChromeText` names the file and the text (V1) |
| A customer's words | A22 #1's hostile text, A4 #13's eyebrow, a layer name in a boundary comment | not a literal: a user-text marker, or a Handlebars comment | — |
| A linked site's picture on the canvas | a Ghost-hosted `feature_image` with the site's URL | each candidate is `…/content/images/size/w<N>/format/webp/…`, as Ghost answers `img_url` with `format` | — |
| An external or unlinked picture on the canvas | Orbit Weekly's `https://orbit-weekly.example/…`, or any picture on an unlinked project | passes through unchanged | — |
| A never-ending animation | `animation: spin 1s linear infinite` or `animation-iteration-count: infinite` outside the no-preference query | — | `pnpm lint` refuses it (`inflozo/motion-gated`) |
| Gated or finite motion | the same inside `@media (prefers-reduced-motion: no-preference)`; `animation: fade 300ms 1` anywhere | clean | — |
| A module's own gate | a module but `core.js` naming `prefers-reduced-motion` | — | `pnpm lint` refuses it. `core.js` is clean |
| A deprecated helper | the pilot theme with `{{@blog.title}}` planted | — | gscan 6.4.2 at v6 raises `GS001-DEPR-BLOG` (CI's control) |
| Determinism | the inputs in another order | the same files, byte for byte | — |

</frozen-after-approval>

## Code Map

**The compiler: `packages/theme-compiler/src/`**

- `compile.ts`:
  - the header comment :1-35;
  - `mustaches` :240-241, and `checkSizes` :245-253, the pattern of a backstop over the final text;
  - `section` :552-555 and `pageBody` :557-562, whose block branch is :561 — the article goes there;
  - the page-template loop :565-577;
  - `default.hbs` :593-615: `{{ghost_head}}` :608, `<body class="{{body_class}}">` :610, `{{ghost_foot}}` last in `bands` :586;
  - the final checks :668-678, with `tree` (before substitution) and `text` (after);
  - the return :679-680.
- `index.ts` — the exports; the new names join them.
- `compile.test.ts`:
  - `LIB` :55-117 (A4 #13's `srcset` `<img>` is :73), `at` :120-123, `docOf` :124, `input` :153-156, `build` :158, `compile` :161, `project` :164-177;
  - the verbatim templates that gain the article: `post.hbs` :208-219, `page.hbs` :678-691, `custom-signup.hbs` :702;
  - `post.hbs` and `tag.hbs` as the layout line alone, :716-717, unchanged;
  - the `srcset` regex :312, which gains `format="webp"`.

**The runtime: `packages/section-runtime/src/`**

- `core.ts`:
  - `srcsetExpr` :505-514;
  - the theme's `srcset` :960-964 and the canvas's :965-978, whose `srcset(…)` call gains `format: 'webp'`;
  - `U0`/`U1` :244-245, the user-text marker's delimiters;
  - `WORD_RE` :1539, `chromeLiterals` :1547-1570 and `checkChromeLiterals` :1572-1577, V1's tree half;
  - V1 at render :1755-1757.
- `index.ts` :11-31 — `checkChromeLiterals`, `U0` and `U1` are exported; `srcsetExpr` joins them.
- `agreement.test.ts` :509-531 — the theme's candidates (:517) and the canvas's (:523), which gain the format. :533-564 are the guard rows, unchanged.

**The shim: `packages/ghost-shim/src/`**

- `index.ts` — unchanged:
  - `imgUrl` :104-137 already takes `format` (:120-121, :134);
  - `srcsetCandidates` :141-147 and `srcset` :149-151 pass `opts` through.
- `contract.test.ts` — the recorded `hosted_webp` row :231-234, and the `srcset` row :302-315, which is checked without a format today.

**The library: `packages/library/src/`**

- `vocabulary.ts` — `IMAGE_SIZES` :34-36, `PORTAL_ACTIONS` :338-343 (where `PORTAL_PAGE` goes), `portalAsk` :361-367, `TEXT_ATTRS` :642.
- `modules.ts:304` — `HBS_COMMENT`.

**The snapshots** — `packages/library/snapshots/a4/13/template.hbs`, `a17/1/partials/post-card.hbs` and `a24/1/template.hbs` carry a `srcset`. They are rewritten by `node tools/check-snapshots.mjs --update`, and nothing else changes in them.

**Lint**

- `stylelint.config.mjs`:
  - `inflozo/supports-tier-2` :35-58 and `inflozo/prefix-pairs` :60-85 are the plugin pattern;
  - the config :87-122, with `plugins` :91 and the custom rules switched on :119-120.
- `eslint.config.js`:
  - the modules block :248-278, with `files` :273, `noInlineConfig` :275 and `no-restricted-syntax` (`visitorWords`) :277;
  - `VISITOR_SINKS` :104-110 and `visitorWords` :127-141.
  - That block has no `ignores`, and a later block for module files but `core.js` replaces the rule's options for those files.

**Tools**

- `tools/check-baseline.mjs`:
  - `lint(code)` :199, the legal sheets :450-480, `refusedRows` :482-507 and its loop :508-515, which fails a row whose rule did not fire, or another `inflozo/*` rule that did;
  - `lintAt` :243, and `moduleLint` :262-263, which plants a line in a probe module and keeps only `DW-146` messages;
  - the DW-146 rows :279-296.
- `tools/check-snapshots.mjs`:
  - `check` :155-163, `mustThrow` :164-170 and `mustFail` :171-175;
  - `renderDesign` :132-150, and `rendered` :231-238, every design's theme text by target;
  - `classFailures`' control and subject :605-617, the pattern for a per-design row;
  - `gscanResults` :756-768, `gscanOr` :778, `gscanPilots` :779 and `raised` :781, with Story 7.2's gscan rows :784-791 and 7.4's GS051 rows :855-861;
  - `pilots75` :943, Story 7.5's rows :938-1057, and the totals :1059.
- `tools/pilot-theme.mjs` — `compilePilots` :144-155 and `themeFailures` :211-227, unchanged.
- `tools/probe/record-theme-assembly.py`:
  - the docstring :1-110 and `SECTION` :124;
  - `COMPILE` :142-171, `compiled` :174-186, `scaffold` :200-213 and `gated` :216-225;
  - `rows()` :233-253;
  - `record()` :352-586:
    - `post_path` :359-363 has no filter, and §70–§74 resolved it to `/probe-gated-post/`;
    - the probe picture :393-418, with `sized` :418 taking a width only;
    - the reads :454-457, and `after` :459, with the w750/w751 rows :502-505;
    - Story 7.5's rows :566-578;
  - `paywall()` :616-662, where `GATED` is :590 and its `visibility` is read at :618-622;
  - `section()` :674-773 and `write_section` :776-783.
- `tools/doc-audit.py` — the catalogue rows for the recorder (:420), `check-baseline.mjs` (:1163) and `check-snapshots.mjs` (:1197).

**Documents**

- `prd.md`: FR-G4 (:286, its motion paragraph :288), FR-J5 (:394) and NFR-2 (:477).
- `appendix-h1-string-catalog.md` §7 V1 (:428).
- `docs/section-authoring.md`:
  - the `{{#post}}` passage :1215-1222, whose example shows a `gh-article` class the theme never writes;
  - the directive table's `data-bind-srcset` row :1070;
  - Exit 4 :1624-1638, whose example `<img>` has no `sizes`;
  - the motion gate :961-964;
  - Portal :1455-1457.
- `ARCHITECTURE-SPINE.md` AD-38.
- `epics.md`: Story 7.6's card :3157-3191, 7.29's (:4015) and 10.54's (:6258), and Epic 7's preamble (:2886).

## Tasks & Acceptance

**Execution:**

- [x] `packages/library/src/vocabulary.ts` — export `PORTAL_PAGE`, the pattern of every page both majors' Portal opens, per Design Notes § Facts 6.

  -- Portal's grammar, written once, beside `PORTAL_ACTIONS`.
- [x] `packages/section-runtime/src/core.ts`, `index.ts`, `agreement.test.ts`:
  - `srcsetExpr` writes `format="webp"` into each candidate's mustache, built from the validated `bindExpr` output and a constant;
  - the canvas's `srcset(…)` call passes `format: 'webp'`;
  - export `srcsetExpr`;
  - :517 and :523 expect the format on both emitters, and :528 and :530 hold as they are.

  -- FR-J5's WebP, on both emitters.
- [x] `packages/ghost-shim/src/contract.test.ts` — beside :313, `srcset(src, { siteUrl, format: 'webp' })`:
  - equals each key's `imgUrl(src, key, { siteUrl, format: 'webp' })`;
  - its first candidate equals the recorded `hosted_webp`.

  -- the canvas's WebP set is Ghost's recorded shape.
- [x] `packages/theme-compiler/src/compile.ts`, `index.ts`:
  - export `POST_ARTICLE`, and wrap `pageBody`'s `post` block in it;
  - `checkGhostMarkup(files)` and `checkChromeText(doc, files)` per Design Notes § The two checks;
  - run `checkChromeText` over `tree` and `checkGhostMarkup` over `text` in the final checks, throwing on any sentence;
  - the header comment says what landed;
  - export both checks and `POST_ARTICLE`.

  -- FR-J5, in the one place every theme is built.
- [x] `packages/theme-compiler/src/compile.test.ts`:
  - the I/O matrix's compile rows, row by row, each check's refusals called directly;
  - :208-219, :678-691, :702 and :312 updated;
  - the whole-output scan passes with the article in `post.hbs`.

  -- what the compiler promises.
- [x] `packages/library/snapshots/` — run `node tools/check-snapshots.mjs --update`, then confirm by `git diff` that only the three `srcset` lines changed.

  -- NFR-6(c1): the change is visible in review.
- [x] `stylelint.config.mjs` — the `inflozo/motion-gated` plugin, switched on. It reports a declaration of `animation` or `animation-iteration-count` whose value holds the keyword `infinite`, unless an ancestor `@media`'s condition holds `(prefers-reduced-motion: no-preference)`.

  -- FR-G4's CSS half, in the one stylesheet config.
- [x] `eslint.config.js` — a block after the modules block, for `packages/library/modules/*.js` but `core.js`:
  - its `no-restricted-syntax` is `visitorWords` plus a selector refusing a string or template literal that holds `prefers-reduced-motion`;
  - the message opens `FR-G4:` and names `ctx.reducedMotion` and the registry's `animates`;
  - the block carries `noInlineConfig`.

  -- "gated once", made mechanical.
- [x] `tools/check-baseline.mjs`:
  - the motion rows go in `refusedRows`, the legal sheets and the module harness, as Design Notes § Motion lists them;
  - the module harness keeps `FR-G4` messages beside `DW-146`'s.

  -- each rule fails its control first.
- [x] `tools/check-snapshots.mjs` — Design Notes § What CI holds, each row behind its control.

  -- the rules in CI on every commit.
- [x] `tools/probe/record-theme-assembly.py`, `tools/doc-audit.py`:
  - Design Notes § The T1 run;
  - `SECTION` becomes `75`;
  - the docstring, `section()`'s text and the catalogue row say so.

  -- R-82: a real Ghost renders what the compiler writes.
- [x] Documents: apply Design Notes § Propagated at Dev, then grep the repo for each old wording.

  -- standing rules 3 and 7.

**Acceptance Criteria:**

- **The pilot theme.** Given the five-pilot project, when CI compiles it:
  - `post.hbs` holds A24 #1 and A22 #1 inside `POST_ARTICLE` inside `{{#post}}`;
  - `checkGhostMarkup` returns nothing, and no template but `post.hbs` carries `<article` or `{{post_class}}`;
  - `checkChromeText` returns nothing over the tree before substitution;
  - every `srcset` carries `format="webp"` on each candidate and sits on a tag with `sizes`;
  - each holds behind its control.
- **Every design.** Given every design's rendered theme text, when `check-snapshots` runs, then `checkGhostMarkup` returns nothing, behind a control naming a planted design text.
- **Deprecated helpers.** Given gscan 6.4.2 at `v6`, when it checks the pilot theme, then it raises no `GS001-DEPR-*` result at any level, and the planted `{{@blog.title}}` raises `GS001-DEPR-BLOG` first. The recorder's local gate holds both gscans at 0/0.
- **Motion.** Given `pnpm lint` and `check-baseline`, when they run:
  - each refused motion line is refused by its own rule;
  - each legal line is clean;
  - `core.js` lints clean;
  - a disable comment silences nothing.
- **Ghost renders it.** Given T1 and the owner's in-session go, when the recorder runs:
  - every row in Design Notes § The T1 run holds behind its control;
  - T1 is restored and read back;
  - MEASUREMENTS §75 records the run.
- **No screen.** Given this story, when Dev ends, then it is Done on its Deploy commit (R-80).
- **Propagation.** Given Dev's end:
  - FR-J5, FR-G4, NFR-2 (1), V1, AD-38 and `docs/section-authoring.md` say what landed;
  - Story 7.29's card carries the moved clause, and Story 10.54's carries DW-348;
  - a grep finds no old wording.

## Spec Change Log

- **2026-10-08, Create (the owner ruled).** Question 1 was ruled option 1.
  - The Ruled values table now states the ruled value: Ghost's post labels go on each post's own page only, and a list card stays its design's own markup.
  - Nothing moves to another story, and the plan is unchanged.
  - The frozen intent is unchanged: the ruling is its recommended option.
- **2026-10-08, Dev (the owner ruled Question 2).** `checkChromeText` refuses FR-H8's text default on an emptied typed text (the runtime leaves the design's authored English in place), so a customer who empties A22 #1's heading would make the compile throw.
  - The owner ruled that an emptied typed text is hidden, on the canvas and in the theme, and that Story 7.18 builds it (DW-349, pasted into 7.18's card and Epic 7's R-195 list).
  - This story's check is unchanged and still refuses the case. No library design binds a text in fallback mode, and the pilots compile.
  - The frozen intent is unchanged.

- **2026-10-08, Review (five layers, the real-infra verifier included; every patch applied, no question open).**
  - Patched: `checkGhostMarkup`'s AD-38 rule now refuses `@member` anywhere after a `=` in a block helper, so a hash string holding one (`{{#get "posts" filter="author:{{@member.id}}"}}`, AD-36's vector) is named, with a test row; `inflozo/motion-gated` refuses a query that only looks like the gate (`not (…)`, or a comma or `or` list another query lets through), with three refused rows in `check-baseline`; `check-snapshots` gains an every-design row (behind a control) that names a text binding left in fallback mode, the authoring defect that passes render-time V1 and makes `compileTheme` throw for every project placing the design; `srcsetExpr`'s JSDoc is reattached; rule 4 says Story 7.29 widens it for a bundled picture's rendition set; the custom-property ceiling is named beside the motion rule.
  - Executed, standing rule 1: `{{post_class}}` never prints `page` — the helper's `page` branch reads `this.page`, absent since Ghost 3's `type`; two pages on T1 6.58.0 rendered `article post` and `article post no-image`. Facts 1, § What the theme carries, the compile's comment and FR-J5's note now say so.
  - Read and left: `PORTAL_PAGE` admits `signup/<word>/monthly` for any word, so `signup/free/monthly` passes though Facts 6 lists it under neither form — Portal reads `free` as a tier id; no design writes one, and a narrower regex is not worth its weight until one does. `spec-4-6…md:391` still shows the old `gh-article` example: a finished story's spec, left as its history. The recorder's article row reads the roots before and inside the article, not after it; the pilots place no footer.
  - The frozen intent is unchanged.

## Design Notes

### What the theme carries

`post.hbs` on the pilots, as the compile writes it:

```hbs
{{!< default}}

{{#post}}
  <article class="{{post_class}}{{#unless access}} post-access-{{visibility}}{{/unless}}">
    {{!-- Post header Layerword · Post Headers · Centred --}}
    {{> "sections/post/post-header-layerword"}}

    {{!-- Sign up Layerword · Newsletter · Inline Row --}}
    {{> "sections/shared/newsletter-p-idleakleakpsitetitle-layerword"}}
  </article>
{{/post}}
```

- **On Ghost**, inside `{{#post}}` `this` is the post, so `{{post_class}}` prints `post`, then `tag-<slug>` for each tag, then `featured` and `no-image` where each applies (never `page`: the helper's `page` branch reads `this.page`, which no post or page carries since Ghost 3's `type` — executed on T1 at Review, a page's article is `article post no-image`). A visitor without access also gets `post-access-members`, `-paid` or `-tiers` (§ Facts 1 and 2).
- **On `page.hbs`** the article encloses Story 7.3's `{{#if @page.show_title_and_feature_image}}` switch and the sections after it.
- **Nothing else moves.**
  - The sections' partials are unchanged, so hoisting is unchanged.
  - Every `<main>`, `noindex`, font, script and paywall line stays where Stories 7.3–7.5 put it.
  - AD-14's record is unchanged.

A picture's `srcset`, as `srcsetExpr` now writes it — one line in the theme:

```hbs
srcset="{{img_url feature_image size="xs" format="webp"}} 150w, {{img_url feature_image size="s" format="webp"}} 400w, …, {{img_url feature_image size="xl" format="webp"}} 2000w"
```

### The two checks

Each returns sentences, each naming its file, and reads `.hbs` files only, Handlebars comments removed first (`HBS_COMMENT`). The compile throws on any sentence.

**`checkGhostMarkup(files)`** reads the final text, where the customer's words are already substituted.

1. **Ghost's head and foot.**
   - `{{ghost_head}}` and `{{ghost_foot}}` each appear exactly once in the theme, in `default.hbs`.
   - `{{ghost_head}}` is the last non-blank line before `</head>`, so Ghost's own styles and the site's code injection come after the theme's stylesheet (AD-18).
   - `{{ghost_foot}}` is the last non-blank line before `</body>`.
   - These line rules apply when `default.hbs` is among the files; the counting rule applies to every file.
2. **`{{body_class}}`** appears exactly once in the theme, opening `<body>`'s `class`. A later story may add classes after it (Story 7.11's `scheme-*`).
3. **`{{post_class}}`** appears only inside `POST_ARTICLE`.
   - The first non-blank line after every `{{#post}}` is `POST_ARTICLE`.
   - The last non-blank line before every `{{/post}}` is `</article>`.
Rules 4 and 5 read attributes inside a start tag only. A customer's own words can never form one, because their `<` ships as `&lt;` (AD-4, AD-5), so a heading that mentions `data-portal` is not read as one.

4. **Pictures.**
   - Every `srcset` value equals `srcsetExpr` of the path its first candidate names.
   - The tag that carries it carries `sizes`. Without one the browser assumes the full viewport width and fetches the largest file.
5. **Portal.** Every `data-portal` value must match `PORTAL_PAGE`, with each mustache in it read as an id (`signup/{{id}}/monthly` reads as `signup/x/monthly`). This includes the `href="#" data-portal="…"` a customer's link writes (`linkAttributes`).
6. **A member's own data (AD-38).** A mustache that names `@member` must be a block helper's condition: `{{#…}}`, `{{^…}}` or `{{else …}}`.
   - A value, or a hash argument, naming `@member` is refused.
   - Ceiling, stated in a comment: a repeat over a `@member` list prints its rows without naming `@member` again. The runtime refuses any `@member` binding first (`contexts.ts`).

**`checkChromeText(doc, files)`** is V1, over the compile's `tree` before user text is substituted. The user-text markers are appendix H1 §7's "emission record" that tells a customer's words from a typed label.
- For each template it takes out, in this order:
  1. Handlebars comments;
  2. the bodies of `<style>` and `<script>`;
  3. every mustache, triple ones first;
  4. every marker, `U0<n>U1`.
- What is left goes to the runtime's `checkChromeLiterals`.
- Any letter or digit left in a text node, or in an `alt`, `title`, `placeholder` or `aria-label` (`TEXT_ATTRS`), is a hard-coded label. It is named with its file.
- On the pilots it finds nothing. Render-time V1 already holds every section, so this check holds the compiler's own lines and every later story's.

### What CI holds

`check-snapshots`' new rows. Each control fails first.

1. **The pilot theme's markup.** `checkGhostMarkup` over the pilot theme returns `[]`.
   - Control: one copy of the theme with each defect planted, each named — `{{ghost_head}}` moved above the stylesheet link, a `{{post_class}}` on `<body>`, A17's `sizes` removed, `data-portal="share"`, and `{{@member.email}}`.
2. **The article.** In the pilot theme, `post.hbs`'s sections sit inside `POST_ARTICLE`, and no other template carries `<article` or `{{post_class}}`.
   - Control: `post.hbs` with the article removed is named by `checkGhostMarkup`'s rule 3, because `{{#post}}` is no longer followed by it.
3. **Every design.** `checkGhostMarkup` over each design's rendered files (`rendered[].files`) returns `[]`.
   - Control: A17 #1's partial with its `sizes` removed is named.
4. **No deprecated helper.** gscan 6.4.2 at `v6` raises no `GS001-DEPR-*` result on the pilot theme.
   - Control: the pilot theme with `{{@blog.title}}` appended to `post.hbs`, awaited at top level like :855, raises `GS001-DEPR-BLOG`.

### Motion

- **CSS (`inflozo/motion-gated`).** "Continuous" is an animation that repeats for ever, the keyword `infinite`. FR-G4's "decorative and continuous" has no mechanical "decorative", so every never-ending animation is held.
  - A finite animation is left alone.
  - So is `transition`, which FR-D20 keeps live for hover.
  - Ceiling, stated beside the rule: an iteration count like `1000` evades it, and review holds that.
- **`check-baseline`'s rows:**
  - refused: `.a { animation: spin 1s linear infinite; }` and `.a { animation-iteration-count: infinite; }`;
  - legal: the same two inside `@media (prefers-reduced-motion: no-preference) { … }` and inside `@media (prefers-reduced-motion: no-preference) and (width >= 50rem) { … }`, and `.a { animation: fade 300ms 1; }`.
- **Modules.**
  - refused: `win.matchMedia('(prefers-reduced-motion: reduce)')` and its template-literal form, planted by `moduleLint`;
  - clean: `if (ctx.reducedMotion) return`;
  - a disable comment silences nothing;
  - `core.js` itself is clean under `pnpm lint`.

### Deprecated helpers

- gscan's `GS001-DEPR-*` family is Ghost's own list of what a theme may no longer use, one list per checker, and almost every rule in it is an error (§ Facts 8). Inflozo keeps no list of its own.
- On the pilot theme, CI holds Ghost 6's checker on every commit. The recorder's local gate holds both checkers before anything uploads.
- Story 7.7 makes gscan the gate inside every compile, and 7.33 runs it over the whole library.
- The helpers the emitters can write are a closed set (`HELPERS`, `BARE_HELPERS` and the compiler's own lines), and none is deprecated today.

### Ruled values: Question 1

Ruled option 1 by the owner on 2026-10-08.

| Question | Ruled: what this spec builds |
|---|---|
| Q1 · Ghost's post labels on list cards | `POST_ARTICLE` goes on the post-block templates alone. A card in a list stays its design's own markup, and no Ghost class goes on a design's element, so the runtime, the shim and every snapshot's markup are untouched by the labels |

### Settled here as readings, each told to the owner in one line

1. **Every label already goes through `{{t}}`. The file Ghost reads it from is Story 7.12's.** Its card says "the theme always ships `en.json`".
   - Until then Ghost prints each key, `nav.more` rather than "More" (§ Facts 7).
   - No visitor sees it: nothing deploys before Story 7.18, which comes after 7.12. T1's row records it.
2. **Every `srcset` asks Ghost for WebP, as Ghost's own Source theme does.**
   - `src` keeps the picture's own format.
   - A Ghost that cannot convert serves the original, and a Ghost 5 release older than the format option serves the same sizes in the picture's own format (§ Facts 5). An animated GIF stays animated.
3. **"Lazy below the fold" is each design's own attribute, set from its spec in the design export.**
   - A18's spec says `loading="lazy"`, and A4 #13 draws `eager` with `fetchpriority="high"`.
   - The compiler cannot see the fold without making one design's text depend on where it sits, which hoisting and the one snapshot per design forbid.
   - A17 #1's author photo, eager inside a lazy card, goes to its owning story as DW-348 (Story 10.54, AD-35).
4. **A picture drawn at one small fixed size takes one rendition and no `srcset`.** An author photo is one, as in A17 #1 and A24 #1. `srcset` with `sizes` is held wherever a design composes one.
5. **The `srcset` of a bundled picture is Story 7.29's.** Story 7.4's Question 1 (owner, 2026-10-08) moved the pictures and their 400 / 800 / 1600 + original renditions there. This card's "and from the rendition set for bundled assets" moves with them, word for word (R-195).
6. **A never-ending animation must sit behind the reduced-motion query, and no module reads the preference itself.** `core` holds the one query (FR-G4).
7. **Deprecated means what gscan's own rules say**, on both majors' checkers.
8. **A `data-portal` must name a page both majors' Portal opens.** Ghost 6's `share` and `gift` are refused: Ghost 5's Portal has neither, and D15 rules `share` out.
9. **The article carries Ghost's classes only.** The canvas does not draw it, and no design selects on it.
10. **AD-38 gains a check over the final text.** The runtime's refusal stays the first door.

### Facts this spec rests on (standing rule 1)

These were read in the npm tarballs ghost-6.58.0, ghost-5.130.6 and ghost-5.0.0, @tryghost/portal 2.69.339 and 2.51.5, and @tryghost/image-transform 1.4.17 and 1.4.6, all on 2026-10-08. Paths are under `core/`.

1. **`post_class`** (`frontend/helpers/post_class.js:8-39`) is identical in all three Ghost releases, diffed.
   - It starts with `post`, then adds `tag-<slug>` per tag, `featured`, `no-image` when there is no feature image, and `page` when `this.page` is set — which no post or page on Ghost 5 or 6 is (`type` replaced it in Ghost 3): executed read-only on T1 6.58.0 at Review, two pages' articles were `article post` and `article post no-image`, so `page` is never printed.
   - It reads `this.post` first, else `this`.
   - It emits no members class.
   - `access` is on every post Ghost serves: `true`, unless members are on and this visitor may not read it (`server/api/endpoints/utils/serializers/output/utils/post-gating.js`, `forPost`, :84-124 on 6.58.0 with its two assignments at :87 and :120, and at :88 and :117 on 5.130.6). So `{{#unless access}}` adds nothing on a site without members, and nothing for a reader with access.
2. **Ghost's own themes,** bundled in each tarball under `content/themes/`:
   - Casper 5.12.1 and 5.9.0 write `<article class="article {{post_class}} …">` on `post.hbs:11` and `page.hbs:11`. Only `partials/post-card.hbs:4` adds `{{#unless access}} post-access-{{visibility}}{{/unless}}`.
   - Source 1.7.1 and 1.5.0 write `<article class="gh-article {{post_class}}">` on `post.hbs:8` and `page.hbs:7`, and `{{post_class}}` on `post-card.hbs:1`. Their card `srcset`s use `format="webp"` (`post-card.hbs:6-11`).
   - Nothing in `core/` — the cards' CSS included — and nothing in Portal's script or stylesheet styles `post-access-*`, `featured`, `no-image` or `tag-*`: a grep finds `post-access` only in the admin bundle. A theme's own CSS is what reads them.
3. **`body_class`** (`helpers/body_class.js:14-75`) is identical on both majors, diffed. It writes:
   - `home-template`, `post-template`, `page-template page-<slug>`, `tag-template tag-<slug>`, `author-template author-<slug>` or `private-template`;
   - then the post's tags and `paged`;
   - and, on Ghost 6, the custom-font classes.
4. **`{{ghost_head}}` and `{{ghost_foot}}`.**
   - `ghost_head` writes `<meta name="generator" content="Ghost <major.minor>">` (6.58.0 `ghost_head.js:415-416`, 5.130.6 `:304-305`).
   - It writes Portal's script when members, tips or recommendations are on (`getMembersHelper`, 6.58.0 `:121-149`, 5.130.6 `:51-77`).
   - `ghost_foot` writes the code injection (`ghost_foot.js:15-29`), and on 6.58.0 the gift toast.
5. **WebP.**
   - `getImageWithSize` (`frontend/utils/images.js:68-100`, both majors) writes `/size/w<N>/format/<fmt>/` when `imageTransform.canTransformToFormat(fmt)`, else the sized URL alone.
   - `frontend/web/middleware/handle-image-sizes.js` serves it (6.58.0's lines; 5.130.6's file differs only in its storage import and a leading-slash fix) (:33-41). It redirects to the original for:
     - an undeclared width (:83-86);
     - a format it cannot make (:93-99);
     - no sharp (:113-116).
   - 5.0.0's `helpers/img_url.js:80-85` reads `size` alone, so an early Ghost 5 ignores the format.
   - `@tryghost/image-transform`'s `transform.js:40, 97-102` keeps an animation when the output is WebP.
   - Recorded: the shim's `IMG|hosted_webp` row (`contract.test.ts:231-234`).
   - WebP is Baseline Widely since 2023-03-16 (web-features 3.35.0), inside FR-G8's pin.
6. **Portal's pages** (`getPageFromLinkPath`, `umd/portal.min.js`). Ghost 6.58.0 pins Portal `~2.69`, and 5.130.6 `~2.51` (`shared/config/defaults.json`). Portal's click handler passes a `data-portal` value to it as written (`setupCustomTriggerButton`). Both versions open:
   - `signup`, `signup/free`, `signup/monthly`, `signup/yearly`, `signup/<id>`, `signup/<id>/monthly` and `signup/<id>/yearly`;
   - `offers/<id>`;
   - `signin`;
   - `account`, `account/plans`, `account/profile`, `account/newsletters`, `account/newsletters/help` and `account/newsletters/disabled`;
   - `support`, `support/success` and `support/error`;
   - `recommendations`.

   The `signup…` and `offers/<id>` forms may end in `/`; every other page matches exactly. `<id>` is word characters. 2.69 adds `gift`, `gift/redeem/<token>` and `share`. Any other value, the empty one included, opens Portal's default page instead of the one the design meant.
7. **`{{t}}` with no locale file prints the key** (MEASUREMENTS §44 (a) and `TR|missing_key`).
8. **gscan.**
   - 4.49.7 at `v5` and 6.4.2 at `v6` each carry the `GS001-DEPR-*` family, almost all errors.
   - `{{@blog.title}}` raises `GS001-DEPR-BLOG` (6.4.2's `lib/specs/v2.js:393`, merged into `v6` by `v6.js:70`).
   - Run locally today through `tools/stress/gate.js`, the compiled pilot theme without the recorder's scaffold raises no deprecation on either checker. It raises only the three the scaffold answers: `GS050-CSS-KGWW`, `-KGWF` and `GS110-NO-MISSING-PAGE-BUILDER-USAGE`.

### The T1 run: `tools/probe/record-theme-assembly.py`, §75

It is §74's run on this tree, with these rows added. Each reads pages the run already reads, unless marked new.

1. **The article.**
   - Two pages are read:
     - the gated post (`/probe-gated-post/`, which §70–§74 read as the newest post), signed out;
     - the newest public post (new: Content API `filter=visibility:public`).
   - Each page carries exactly one `<article>`, with the page's section roots inside it and the header outside.
   - Its class is Ghost's `post_class`, computed here from the Content API's record of that post: `post`, then `tag-<slug>` per tag in the API's order, then `featured` and `no-image` where they apply.
   - On the gated post it ends ` post-access-<visibility>`. On the public post nothing follows.
   - Premise: the Content API says the first is not public and the second is.
2. **Never on `<body>`.**
   - Each page's `<body>` class carries Ghost's template class: `home-template` on `/`, `post-template` on a post, `tag-template tag-<t>` and `author-template author-<a>` on the archives, and `paged` on each page 2.
   - It never carries the bare class `post`.
3. **Ghost's head.**
   - Each page's `<head>` carries Ghost's generator meta once, and Portal's `portal.min.js` script once.
   - Control: the uploaded `default.hbs` writes neither, so both are `{{ghost_head}}`'s.
4. **Portal.** Every `data-portal` value on `/` matches `PORTAL_PAGE`, and their count is recorded.
5. **WebP.**
   - The probe picture's `size/w750/format/webp/` answers 200 as `image/webp`, at its own path.
   - Control: `size/w751/format/webp/`, a width no theme declares, is redirected to the original.
   - Premise: the uploaded templates' `srcset`s carry `format="webp"`.
6. **Labels.**
   - A1 #1's More label on `/` prints `nav.more`. That is Ghost's answer for a key no shipped locale file holds.
   - Premise: no `locales/` is in the uploaded tree.
   - Story 7.12's run turns this row to "More".
7. **Earlier rows.** Stories 7.1–7.5's rows and §72's paywall probes hold again.
8. **The local gate** is 0/0 on both gscans with §73's scaffold, gscan's deprecation rules among them.
9. **What it writes.**
   - §74's uploads, their activations and deletes.
   - The one `w750` WebP rendition Ghost saves of the probe picture.
   - The Ghost 5 half is DW-326's (R-238).

### Propagated at Dev

- **`prd.md`:**
  - FR-J5: a dated note of what landed:
    - the article and its classes;
    - WebP;
    - `sizes` held;
    - `loading` as each design's;
    - a fixed-size picture's one rendition;
    - Portal's pages;
    - V1 at compile;
    - `locales/` as 7.12's;
    - the bundled-picture `srcset` as 7.29's;
    - Question 1 as ruled.
  - FR-G4: the CSS rule's mechanical form, and the module rule.
  - NFR-2 (1): held by `checkGhostMarkup` on every compiled theme.
- **`appendix-h1-string-catalog.md` §7, V1:** held at render (Story 4.9) and over every compiled template by `checkChromeText` (Story 7.6), the markers being the emission record's distinction.
- **`docs/section-authoring.md`:**
  - the `{{#post}}` passage shows the emitted article;
  - Exit 4 and the directive table gain `format="webp"`, the `sizes` rule (the example `<img>` gains one), `loading` per design and the fixed-size reading;
  - the motion gate gains the CSS rule and the module rule;
  - Portal gains `PORTAL_PAGE`.
- **`ARCHITECTURE-SPINE.md`** AD-38: held over the final text by `checkGhostMarkup` (Story 7.6).
- **`epics.md`:**
  - Story 7.6's card, as landed;
  - Story 7.29's card, with 7.6's bundled-asset clause word for word, under 7.4's Question 1;
  - Story 10.54's card, with DW-348;
  - Epic 7's preamble: the moved clause, in its R-195 list.
- **`deferred-work.md`:** DW-348 (new), A17 #1's author photo loading eagerly inside a lazy card. Owner: Story 10.54. Location: `packages/library/designs/a17/1/index.html` (`a17-1__photo`).
- **`MEASUREMENTS.md`:** §75.
- **`epic-7-context.md`:** a sub-bullet for each of the above.
- **Last:** grep for:
  - `gh-article`;
  - `size="xs"}} 150w` in documents and tests;
  - "Stories 7.1, 7.2, 7.3, 7.4 and 7.5's recorder";
  - "`sizes` is NOT emitted", which stays true and gains its rule.

### The commits

There is no migration, so there is no Schema phase. `Story 7.6 - Dev - …` carries:
- the code, tests, snapshots, tools and documents;
- §75, if the T1 run happens in the Dev session on the owner's go.

## Owner's manual test

None. This story has no screen, so it has no frame and no hand test, and it is Done on its Deploy commit (R-80). What Ghost renders is proved by T1 through the recorder, and what the theme carries by CI.

## Questions for the owner

Question 1 was ruled option 1 (owner, 2026-10-08). Dev builds Design Notes § Ruled values as it stands. Question 2, found at Dev, was ruled option 1 the same day: Story 7.18 builds it (DW-349).

### Question 1 — Ghost's post labels on the post cards in your lists

**In plain English.**
- Ghost's own themes put a few invisible labels on a post: its tags, "featured", "no picture" and, for a visitor who may not read it, "members only" or "paid only".
- Nothing shows by itself. The labels let anyone's own CSS restyle those posts later, for example to fade a members-only post.
- This story puts the labels on each post's own page, around the whole post, as the plan says.
- The plan's reason also mentions the post cards in your lists, such as the grid on your home page.
  - In Inflozo a card is the design's own drawing.
  - Where a card design calls for it, the design already says "Featured" or "Members only" itself, in words you can translate.
  - Ghost itself styles nothing by these labels (read in Ghost's code); only a theme's own CSS does.
- Putting the labels on every card too means changing the shared engine that draws both the editor and the theme. Ghost's labels would first be recorded on our test site.

**Example.** A site owner adds one line of CSS in Ghost's Code injection that gives featured posts a gold edge.
- With option 1, a featured post's own page gets the gold edge, and the grid's cards stay exactly as their design draws them.
- With option 2, the featured posts' cards in the grid get the gold edge too.

1. **The post's own page only.** The cards stay exactly as each design draws them. **(RECOMMENDED)**
2. **Every post card in every list too, built in this story.** The shared engine adds the same labels to every card, in the editor's preview and in the theme, recorded on our test site first. This makes the story noticeably bigger.

**Ruled: option 1 (owner, 2026-10-08).**

### Question 2 — a text the customer empties (asked at Dev)

**In plain English.**
- Found at Dev: when a customer deletes every word of a typed text, such as the newsletter section's heading, the editor puts the design's own sample sentence back ("One letter a week, on Friday morning").
- This story's new label check refuses English typed into the theme by us. So once publishing exists (Story 7.18), that customer's publish would fail with an error.
- Nothing breaks today: nobody can publish until Story 7.18.

**Example.** A customer clears the heading and presses Publish.
- With option 1, the heading disappears from the canvas and from the published site. Typing in the sidebar's Heading box brings it back.
- Words that come from the translation list, such as the "Subscribe" button, still come back as their translated word when emptied, because they are never our typed English.

1. **Hide the emptied line on the canvas and the site, built in Story 7.18 and tested by you there.** **(RECOMMENDED)**
2. **Hide it, built now in this story.** Story 7.6 then gains a screen change and your hand test.
3. **Show the design's sample sentence, as the editor does today.**

The owner first asked why the sample was recommended ("If user deletes than he intends to delete that line"), and then ruled option 1.

**Ruled: option 1 (owner, 2026-10-08).**

## Verification

**Commands:**

- `pnpm check` — expected: green. That covers:
  - lint, with `inflozo/motion-gated` and the module rule;
  - the typecheck;
  - every package's tests, among them the new `compile.test.ts` rows and the updated `agreement.test.ts` and `contract.test.ts` rows;
  - `node tools/check-baseline.mjs`, with the motion rows;
  - `node tools/check-snapshots.mjs`, with § What CI holds, each behind its control, and the three snapshots equal to their designs.
- `cd tools/stress && npm install && node build.js && node gate.js theme` — expected: 0 errors and 0 warnings on both gscans, and `checkThemeJs` and `checkThemeScripts` clean.
- The recorder's local half (`compiled()`, then `scaffold()`, then `gated()`) — expected: 0/0 on gscan 4.49.7 (v5) and 6.4.2 (v6).
- `python3 tools/probe/record-theme-assembly.py`, on the owner's in-session go, in the main session — expected: every §75 row holds behind its control on T1 `ghost6.inflozo.com` (6.58.0), and T1 is restored and read back.
- `python3 tools/doc-audit.py --check`, twice — expected: PASS.

**Manual checks:**

- The compiled pilot `post.hbs` reads as § What the theme carries shows.
- `default.hbs` is unchanged.
- The three snapshots' diff is their `srcset` lines alone.

**Real infrastructure (R-82):**

- T1, through the recorder.
- Both gscans locally, and gscan 6.4.2 in CI.
- Vercel: CI's `check`, `rls` and `deploy` green, and the deployment READY at the head.
  - The app's one change is the canvas's `srcset` for a linked site's Ghost-hosted pictures.
  - The owner's projects draw T1's `static.ghost.org` pictures, which pass through unchanged.
- There is no migration, and no Supabase, Resend or Dodo surface. The compiler has no product caller until Story 7.18.

**Dev results (2026-10-08, main session, on the owner's in-session go for the T1 writes):**

- **T1 `ghost6.inflozo.com` (Ghost 6.58.0)** — `python3 tools/probe/record-theme-assembly.py`, keys read by variable name (`GHOST6_*` in `tools/probe/.env`), never printed. Exit 0, every row PASS and none failed, MEASUREMENTS §75 written:
  - the gated post `/probe-gated-post/` (Content API: `visibility 'paid'`) carried one `<article>` with class `post no-image post-access-paid`, equal to the class computed from the Content API's record, with A24 #1 and A22 #1 inside and A1 #1 before it;
  - the newest public post `/on-typography-and-restraint/` (Content API: `public`) carried `post tag-craft tag-field-notes featured`, with nothing after it;
  - every page's `<body>` carried Ghost's template class (`home-template`, `paged`, `post-template`, `tag-template tag-craft`, `author-template author-umang`) and never the bare `post`;
  - every `<head>` carried one generator meta and one `portal.min.js` script, which the uploaded theme writes neither of;
  - `/` carried 3 `data-portal`s (`signin`, `signup`), each matching `PORTAL_PAGE`;
  - `size/w750/format/webp/` of the probe picture answered 200 as `image/webp` at its own path, and the control `size/w751/format/webp/` was redirected to the original;
  - A1 #1's More label printed `nav.more` (no `locales/` uploaded; Story 7.12 turns it to "More");
  - Stories 7.1–7.5's rows and §72's paywall probe and control held again; the local gate was 0/0 on gscan 4.49.7 (v5) and 6.4.2 (v6);
  - the active theme was read back as `casper` after each of the three uploads, and the probe themes were deleted (installed after: `casper`, `racer`, `source`).
  - The Ghost 5 half is DW-326's (R-238).
- **`pnpm check` (Node 24.18.1)** — exit 0: lint (with `inflozo/motion-gated` and the FR-G4 module rule), the typecheck, and every package's tests, among them the nine `(7.6)` rows in `compile.test.ts`. `check-baseline` printed the motion rows `ok`: both refused lines refused by `inflozo/motion-gated`, the gated and finite sheets clean, the two module reads refused, `if (ctx.reducedMotion) return` and `core.js` clean, and a disable comment silencing nothing. `check-snapshots` printed every Story 7.6 row `ok` after its control: five planted defects named, the article, V1 through the pilot compile, every design's `checkGhostMarkup` (`A17 #1`'s unsized partial named first), and gscan 6.4.2 with no `GS001-DEPR-*` (`{{@blog.title}}` raised `GS001-DEPR-BLOG` first).
- **`tools/stress`** — `node build.js && node gate.js theme`: 0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6); `checkThemeJs` and `checkThemeScripts` clean.
- **Manual checks** — the pilot `post.hbs` reads as § What the theme carries shows; `default.hbs` is byte-identical; the three snapshots' diff is one `srcset` line each.
- **Matrix audit** — every I/O row maps to a check that ran: the post, page and membership rows, the emptied post and every other template (`compile.test.ts`'s `(7.6)` rows and the updated verbatim templates); the picture and the unsized `srcset` (`(7.6) a picture`, `a srcset without sizes`, and `check-snapshots`' every-design control); Portal pass and refuse, including `sigup`, `share`, `gift`, `signin/` and `''`; the member rows; each helper out of place; the typed labels and the customer's words (`(7.6) V1 at compile`, and V1 through the pilot compile in CI); the canvas's linked, external and unlinked pictures (`agreement.test.ts` :517/:523 with the format, :528/:530 unchanged, and `contract.test.ts`'s WebP row against `hosted_webp`); the motion rows (`check-baseline`); the deprecated helper (`check-snapshots`' gscan row); and determinism (`compile.test.ts`'s determinism tests over the compiled `post.hbs`).
- **Vercel, Supabase, Resend, Dodo** — not touched at Dev. No migration, and no Supabase, Resend or Dodo surface. CI's `check`/`rls`/`deploy` and the deployment's READY state are read at Review.

**Review results (2026-10-08, Review session, T1 read-only, no owner go asked for and none needed):**

- **Layers:** Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the Real-infra verifier all ran. Patches are in the Spec Change Log; nothing is the owner's to decide.
- **T1 `ghost6.inflozo.com` (6.58.0), read-only** — `env $(grep '^GHOST6_' tools/probe/.env | xargs)` with `GHOST6_STAFF_ACCESS_TOKEN`: `GET /ghost/api/admin/themes/` answered 200 with `casper` active and `racer`, `source` installed — no probe theme remains. Control: an unknown key answered 401 `Unknown Admin API Key`. `GET /` and `/probe-gated-post/` signed out carried one generator meta and one `portal.min.js` each (casper writes neither), `data-portal="signin"` and `"signup"` on `/`, both `PORTAL_PAGE` pages. The probe picture's `size/w750/format/webp/` is 302 to the original now, as §75's pre-upload control recorded under casper, whose `image_sizes` has no 750: the 200 `image/webp` row is §75's, under the probe theme. MEASUREMENTS §75 read back: every row `yes`, consistent with the Dev results above. With `GHOST6_CONTENT_API_KEY`: two pages' articles under casper were `article post` and `article post no-image` — `{{post_class}}` prints no `page` class.
- **CI on the Dev head 738c0124** (`GITHUB_TOKEN`, the Actions API): `ci.yml` run 37817954821 — `check`, `rls`, `deploy` all success; `matrix.yml` run 37817954914 — `matrix` success. **Vercel** (`VERCEL_TOKEN`): `dpl_JA1VvJ7QQRJWgZ1SEp65H2SbfwbS` READY at 738c0124, the newest production deployment.
- **Local, Node 24.18.1** — `pnpm check` exit 0 before the patches; after them `compile.test.ts` 86 pass / 0 fail, `check-baseline` PASS with the five refused motion rows and the legal sheets, `check-snapshots` PASS with the fallback control named first; `pnpm check` re-run green after the patches (see the Review commit). `cd tools/stress && node build.js && node gate.js theme`: 0 errors / 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6).
- **R-99** — the diff adds no file under `supabase/migrations/`; no Schema phase was due.
- **The Ghost 5 half** is DW-326's (R-238). Deploy and the owner's Done follow (R-80): this story has no screen, so it is Done on its Deploy commit.

**Deploy (2026-10-09), head `aaaf5a11`.** `Deployment: dpl_BtieN2HicTFCBKo6bDs1NH23B5rX` READY on the production Vercel
project, target `production` (read with `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`; `meta.githubCommitSha`
matches), the Review's recorded head. CI run 37823249103: `check`, `rls` and `deploy` success (read with `GITHUB_TOKEN`);
the render matrix run 37823249050 success. The app code was last changed at the Dev head `738c0124`
(`dpl_JA1VvJ7QQRJWgZ1SEp65H2SbfwbS` READY there); the Review patches touched the compiler's checks, lint, tools and this
spec, and `aaaf5a11` re-ran every gate green. No migration, so no schema apply and no RLS read beyond the CI gate; no
Supabase, Resend or Dodo surface. Controls: `https://app.inflozo.com/harness/pilots` and `/harness/editor` answer 404
(the harness is off in production), `https://app.inflozo.com/` answers 307 to `/sign-in` (the signed-out redirect). The
compiler has no product caller until Story 7.18, so nothing a visitor or the owner reaches changed; there is no owner
test (`owner_test: none`). This story is Done on this commit (R-80).
