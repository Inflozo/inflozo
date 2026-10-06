---
title: 'Story 7.3 — Synthesis Defaults and the emptying rules'
type: 'feature'
created: '2026-10-06'
status: 'ready-for-dev'
owner_test: none
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, the theme Inflozo builds carries Ghost's standard page types even where you never opened them, each built from the same standard recipe the editor already shows you, and the second page of your blog, of a tag or of a writer uses the design you gave it. When you delete the last section from Signup, Signin or Member home, a yellow warning first tells you that the page will stop shipping and that Ghost will quietly show your ordinary page design instead. You ruled all four questions on 2026-10-06, and this story has nothing for you to test by hand: no design can be placed on those three pages until Story 10.100, so the warning's hand test moved there word for word.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:**
- `compileTheme` (Stories 7.1, 7.2) compiles only the docs it is handed. An untouched template has no doc (AD-22), so it compiles to nothing: a Home-only project ships no post, tag or author page, and the Synthesis Defaults are specification-only (FR-I1).
- Page 2's docs (R-178, R-179), the main-feed rule (Story 5.19), the paywall doc (Story 5.20) and Ghost's page title switch reach no theme. No story emits `<main>` (DW-150) or FR-H2's SEO guard (DW-234, DW-253).
- Emptying a designed custom template silently stops it shipping, and Ghost's fallback is silent too (FR-I1).

**Approach:**
- `compileTheme` resolves every template's stack through the editor's own functions (`designate`, `synthesize`, `pageTwoStack`; AD-27(d)), then emits each file by its class's rule. On top of that:
  - `page.hbs` guards its Post headers;
  - an archive's page 2 compiles inside `{{#is "paged"}}`;
  - `default.hbs` gains `<main id="site-main">` and the `noindex` guard;
  - a designed paywall compiles to `partials/content-cta.hbs`.
- The editor asks D5f's question before the last section leaves a designed custom template.
- Four values are the owner's (Questions 1 to 4). The spec builds the recommended options from Design Notes § Ruled values.

## Boundaries & Constraints

**Always:**

- **Pure and deterministic (AD-1, AD-14).** Every input is handed in. The same input gives the same bytes whatever its key order (`templates`, `pageTwo`, `routed`), and lists are sorted in code-unit order.
- **One implementation of each rule (AD-27(d)).** The compiler writes no table or rule of its own for these:
  - a stack is `synthesize`'s or `pageTwoStack`'s (`packages/section-runtime/src/synthesize.ts`);
  - a flag is `designate`'s (`main-feed.ts`), and every stored doc passes through it first, page-2 docs included, each with the file it renders at;
  - "is a feed" is `main-feed.ts`'s own test.
- **Absence is the signal (AD-22).** A file is untouched when it has no doc or a doc with no instance (`isDesigned`). Hiding is not emptying (FR-D5): a doc whose every section is hidden is designed, and it emits its layout line alone. It never re-synthesizes.
- **Every file is emitted by its class's rule** (Design Notes § What each file compiles from).
- **The page switch.** On `page.hbs`, each Post Header (A24) section's invocation sits inside `{{#if @page.show_title_and_feature_image}}`, and nothing else does (FR-I1). No other file is guarded. No emitted file may carry another `@page` property: the compile refuses one, naming the file, because `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` is fatal on gscan 4.49.7. It reads mustaches only, never comments, as `checkSizes` does.
- **The SEO guard** goes in `default.hbs`'s `<head>`:
  - its shape is `{{#is "paged"}}{{#is "<contexts>"}}<meta name="robots" content="noindex">{{/is}}{{/is}}`;
  - `<contexts>` lists, in the fixed order `index, tag, author`, each paginated context whose page-2 stack has no visible feed: Home's page 2 (DW-234), and a Tag or Author page 2, whether its own design or the copy of page 1 (DW-253);
  - with no such context, there is no block at all.
- **`<main id="site-main">`** wraps `{{{body}}}` alone, once, never the whole document (§7.4).
- **The paywall.**
  - `partials/content-cta.hbs` is emitted only when the paywall doc is designed.
  - Its first line is `{{{html}}}`, the post's free preview (Question 2).
  - Its sections follow, as `partials/sections/content-cta/{slug}.hbs`.
  - The theme carries no `{{> "content-cta"}}`.
  - The compile asserts that a theme carrying it invokes at least one partial from a file outside `partials/` (Design Notes § Facts).
- **One triple-stash rule, in every check that counts them** (`compile.test.ts`, `themeFailures`): one `{{{body}}}` in `default.hbs`. Under Question 2's recommended ruling, `{{{html}}}` as `partials/content-cta.hbs`'s first line is the only other.
- **The D5f warning.**
  - **When it fires:** on the delete gesture only (`onRemove`: the Delete key, Layers ⋯ Delete, the pill's bin), when the gesture would leave a designed custom template (`custom-{name}.hbs`) with no instance.
  - **How it opens:** on Keep it (UX-DR14).
  - **Its words** are one list (R-170). "Delete" replaces the frame's "Remove", because the gesture and the site-wide confirm both say Delete.
  - **Its fill** is `marigold-solid` for the frame's `#B87A00`, which fails AA (DESIGN.md).
- **Counts are derived.** No check or message writes down how many files, templates, contexts or sections exist.

**Ask First:**

- **The T1 run.** It uploads theme files to T1, so it needs the owner's in-session go, in the Dev or Review session. It runs in the main session, never through a subagent.
- **Anything gscan names on the probe theme beyond the scaffold.** The scaffold is `assets/css/cards.css`, plus the stand-in `page.hbs` while Question 1 leaves `page.hbs` out.
- **The rulings.** Dev waits for all four. A ruling other than the recommended option changes Design Notes § Ruled values and the rows that table names, and nothing else.
- **A T1 row that does not hold.** Ghost rendering otherwise than its source reads is a stop, never a widened rule.

**Never:**

- **Anything a later story owns:**
  - Routes Manager rows, `routes.yaml` and a routed template's own warning words: 7.16 and 7.17;
  - the fonts, the assets and the CSS strip: 7.4;
  - JS: 7.5;
  - `post_class` and the members classes: 7.6;
  - the gscan mapping: 7.7;
  - the quality gate: 7.8;
  - `@custom` and Theme Settings: 7.9 to 7.11;
  - `locales/`: 7.12;
  - `cards.css` and `card_assets`: 7.13;
  - pagination styles: 7.14 and 10.112;
  - Pre-flight warnings: 7.18;
  - the credit fallback: 7.28;
  - B19: 7.30.
- **Widening a pilot's `compileTarget` or adding a library design** (AD-35), unless Question 1 is ruled option 3.
- **Files the plan forbids:** `page-{slug}.hbs`, a `members/*.hbs` family, `error-404.hbs` or `error-4xx.hbs`, or a `routes.yaml`.
- **Markup that misfires:**
  - an explicit `{{> "content-cta"}}`, which would print the paywall a second time;
  - a canonical link of the theme's own;
  - `{{#contentFor}}` with `{{{block}}}`.
- **A synthesized header or footer in `default.hbs`**, unless Question 4 is ruled option 2. Question 4 places it.
- **An ask on undo, redo or a reload**, or on hiding a section.
- **A database change or a new dependency.** There is therefore no Schema phase.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Untouched project | no doc anywhere | `default.hbs`, `index.hbs`, `post.hbs`, `tag.hbs` and `author.hbs` are written. `page.hbs` and `error.hbs` are written too where synthesis gives them a section (otherwise Question 1). Each file holds exactly its `synthesize` / `pageTwoStack` stack. No `home.hbs`, `custom-*.hbs`, `private.hbs` or `partials/content-cta.hbs` | — |
| Home designed, page 2 follows | a `home.hbs` doc; no `pageTwo['home.hbs']` | `home.hbs` from the doc. `index.hbs` is its exact copy, so the sections hoist to `shared/` | — |
| Home's page 2 designed | `pageTwo['home.hbs']` with sections; Home designed or untouched | `index.hbs` from page 2. `home.hbs` from Home's doc or its default stack | — |
| Home with no main feed | a designed Home with no flagged feed; page 2 follows | `index.hbs` is the default stack (R-127) | — |
| Archive page 2 designed | `pageTwo['tag.hbs']` with sections; page 1 designed or untouched | `tag.hbs` is page 2's sections inside `{{#is "paged"}}`, then `{{else}}` and page 1's, then `{{/is}}` | — |
| Archive page 2 follows | no `pageTwo['author.hbs']` | `author.hbs` is page 1 alone, with no `{{#is}}` | — |
| A page 2 with no visible feed | Tag page 1 with no visible feed and page 2 following; or any page 2 of its own with none | `default.hbs`'s head carries the `noindex` block for exactly those contexts, and no canonical link | — |
| Two main-feed flags | a stored doc flagging two feeds | compiles with `designate`'s repair: one main feed, the first visible one | — |
| A Page with a Post header | a `page.hbs` doc: an A24 section, then another | the A24 invocation sits inside the `@page` guard; the other does not; the same A24 on `post.hbs` is never guarded | — |
| A membership page | a designed `custom-signup.hbs` | `custom-signup.hbs` at the theme root, its sections inside `{{#post}}`; no route file | — |
| Emptied or untouched conditional file | a `custom-*`, `private` or paywall doc with no instance, or none | not emitted | — |
| Routed custom template, emptied | `routed: ['custom-landing.hbs']` and an empty or absent doc | `custom-landing.hbs` is its layout line alone | — |
| Every section hidden | a designed doc, all hidden | its layout line alone; never re-synthesized | — |
| Designed paywall | the paywall doc holding one design | `partials/content-cta.hbs` opens `{{{html}}}`, then the section; no `{{> "content-cta"}}` anywhere | — |
| A file no theme gets | `page-about.hbs`, `members/signup.hbs`, `index.hbs` in `templates`, or a `pageTwo` key other than `home.hbs`, `tag.hbs` and `author.hbs` | — | throws, naming the legal files or where page 2 goes |
| A routed name that is no custom template | `routed: ['page.hbs']` | — | throws, naming `custom-{name}.hbs` |
| Another `@page` property | an emitted template carrying `@page.x` | — | throws, naming the file |
| Determinism | `templates`, `pageTwo` and `routed` in another order | byte-identical tree | — |
| Delete the last section of a designed membership canvas | Delete key, Layers ⋯ Delete or the pill's bin | D5f opens on Keep it. **Keep it** or Escape changes nothing. **Delete section** removes the section, says "{layer} removed", and leaves the template untouched (the switcher shows Empty) | — |
| Any other removal | not the last section; a standard canvas; Hide; ⌘Z or ⇧⌘Z | no warning | — |

</frozen-after-approval>

## Code Map

**The compiler — `packages/theme-compiler/src/compile.ts`**

- `CompileInput` :25-43 gains:
  - `pageTwo?` — page-2 docs keyed by their page-1 file: `home.hbs` (stored as `index`), `tag.hbs` (`tag-paged`) and `author.hbs` (`author-paged`). This mirrors `pageTwoStack(file, pageOne, pageTwo, library)`.
  - `routed?` — the `custom-*.hbs` files a route names. Story 7.16 hands it in, and Story 7.18 maps keys with `fileOfKey` and `canvasOfPageTwoKey` (`apps/web/lib/editor.ts:113-128`).
- The refusal loop :176-180:
  - the paywall's refusal at :178 goes;
  - `templates['index.hbs']` is refused, naming `pageTwo['home.hbs']`.
- The render loop :188-223 walks the resolved stacks rather than `input.templates`. `Placed` :49 gains the page it belongs to.
- The page templates :263-269:
  - the `@page` guard;
  - the `{{#is "paged"}}` split.
- `default.hbs` :272-294 gains:
  - `<main id="site-main">`;
  - the `noindex` block before `{{ghost_head}}`.
- `checkSizes` :143-154 is the shape for the `@page` check and the referenced-partial assertion over the final record.
- `LEGAL` :171 and the `PAYWALL_TARGET` imports :18.

**The runtime and the library**

- `packages/section-runtime/src/synthesize.ts`:
  - `SYNTHESIS_DEFAULTS` :71-93;
  - `synthesize` :113-143;
  - `pageTwoStack` :167-177. It synthesizes an untouched page 1, and Home's R-127 fallback is :175.
- `packages/section-runtime/src/main-feed.ts`:
  - `designate` :65-79;
  - `visibleFeed` :32, the test `feedlessArchive` :99-100 uses. Exported, it lets the guard ask the same question of any page 2;
  - `feedQuery` :113-121, which leaves a main feed native.
- `packages/section-runtime/src/doc-edit.ts:206` — `isDesigned`.
- `packages/library/src/placement.ts`:
  - `POST_CONTENT` :37 is the shape for `POST_HEADER = 'a24'`;
  - `compilesTo` :129-130: a Home design may sit on `index.hbs`;
  - `categoryOf` :40.
- `packages/library/src/vocabulary.ts`:
  - `PAYWALL_TARGET` :120;
  - `COMPILE_TARGETS` :129-132;
  - `CUSTOM_TARGET_RE` :134;
  - `PAGINATED_TARGETS` :141-143.
- `packages/library/src/contexts.ts:91-94` — `targetContext`. `page.hbs` and `custom-{name}.hbs` open `{{#post}}`, and the paywall has no block.

**Tests and tools**

- `packages/theme-compiler/src/compile.test.ts`:
  - `design()` :26-38 builds the inline library. It can hold every id the default table names, `a24/1` on `page.hbs` included, so every row is testable with no library change;
  - the whole-output scan :342-370 has the triple-stash line;
  - determinism :372.
- `tools/pilot-theme.mjs`:
  - `pilotProject` :66-85, where `'index.hbs'` becomes `pageTwo['home.hbs']`;
  - `compilePilots` :91-96;
  - `themeFailures` :111-136: the triple-stash count :128-130 and "every partial referenced" :131-134. `content-cta.hbs` is referenced by Ghost's own `{{content}}`.
- `tools/check-snapshots.mjs`:
  - the pilot rows :669-688;
  - gscan 6.4.2 at `v6` :690-728.
- `tools/probe/record-theme-assembly.py`:
  - `SECTION` :59;
  - `COMPILE` :74-90 and its `order`;
  - `scaffold` :124-145, where the stand-in `page.hbs` is labelled 7.3's today;
  - `record` :208-344, `section` :348-400, main :414-441.
- `tools/probe/record-shim.py` — `start_guard`, `restore_and_delete`, and `Ghost.api`, `.page` and `.content`.
- `tools/stress/gate.js` — both gscans.
- `tools/probe/theme-all/` — §15b's probe theme. Its `post.hbs` invokes `{{> "content-cta"}}` in a rendered position, which is why it printed twice there.

**The editor (D5f)**

- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - `askFirst` :4621-4625;
  - `onRemove` :4661-4667, the one door every removing gesture takes. Its `SITE.key` branch is the precedent;
  - the site-wide confirm :5880-5943. Its Delete at :5937 announces nothing today;
  - `#editor-said` :5862-5865 through `useSaid`;
  - mount beside `confirm` at the editor root, never under Layers (:4051-4059).
- `apps/web/lib/editor.ts`:
  - `CANVASES` :26-48 (the label);
  - `CUSTOM_TEMPLATE_CAPTION` :52;
  - `canvasOfTemplateKey` :88;
  - `fileOfKey` :122-128.
- `apps/web/lib/page-two.ts:54-61` — `SITE_WIDE_ASK`, the shape for the words.
- `apps/web/lib/data-group.ts:28-29` — `withTransfer`, the removal sentence.
- `apps/web/components/kit/dialog.ts`:
  - `sheet` :28;
  - `title` :52;
  - `openOnCancel` :62-66;
  - `closeOnBackdrop` :84-94.
- `apps/web/components/kit/button.tsx` — the variants :13 and :23-31.
- `apps/web/app/(app)/app/(authed)/new-project-sheet.tsx:113-128` — the `marigold-solid` fill, ruled for D4b.
- `apps/web/app/(app)/app/(authed)/account/danger-card.tsx:121-136` — a confirm with a 38px chip, then the title and body.
- `apps/web/components/kit/icons.tsx:477` — `AlertTriangle`.
- `apps/web/app/(app)/app/harness/stand-ins.ts:20-23` — re-id'd pilots behind `x-inflozo-harness-stand-ins`.
- `tools/keyboard/journey.spec.mjs` — the site-wide ask step :336-369; a stand-in placement step :6900-6912.

**Documents (Dev)** — the list is Design Notes § Propagated at Dev.

## Tasks & Acceptance

**Execution:**

- [ ] `packages/library/src/placement.ts`, `placement.test.ts`:
  - add `POST_HEADER = 'a24'` beside `POST_CONTENT`;
  - test it with `categoryOf`.

  -- FR-I1's "the A24 designs compiled into it carry the guard", spelled once.
- [ ] `packages/section-runtime/src/main-feed.ts`, `main-feed.test.ts`:
  - export the visible-feed test that `feedlessArchive` uses;
  - `feedlessArchive` keeps calling it.

  -- one predicate for the editor's note, 7.18's Pre-flight and this guard (DW-253).
- [ ] `packages/theme-compiler/src/compile.ts`:
  - `CompileInput` gains `pageTwo` and `routed`, and their refusals come first;
  - every stored doc passes through `designate`;
  - each file's stack and emission follow Design Notes § What each file compiles from;
  - the archive split, the `@page` guard, `default.hbs`'s `<main>` and `noindex` block, and `partials/content-cta.hbs`;
  - over the final record, the `@page` refusal and the referenced-partial assertion.

  -- FR-I1, FR-H2's guard, DW-150, DW-234, DW-253 and DW-261, in the one place every theme is built.
- [ ] `packages/theme-compiler/src/compile.test.ts`:
  - the I/O matrix, row by row, on the inline library;
  - the triple-stash test admits content-cta's first line and nothing else;
  - the bare compile's file list;
  - determinism with `pageTwo` and `routed`.

  -- what the compiler promises.
- [ ] `tools/pilot-theme.mjs`:
  - the project moves `index.hbs` to `pageTwo['home.hbs']`;
  - it gains a Tag page 2 (A17 #1 at `per-row: two`) and an Author doc whose A17 #1 is hidden (no visible feed);
  - `themeFailures` exempts `partials/content-cta.hbs` from "referenced by a file" and admits its `{{{html}}}` line.

  -- CI and the recorder hold one theme to one check.
- [ ] `tools/check-snapshots.mjs` — rows, each behind its control:
  - the pilots compile `tag.hbs` with the split and `author.hbs`;
  - `default.hbs`'s `noindex` block names `author` alone. Control: a tag page 2 with no visible feed adds `tag`;
  - `<main id="site-main">` appears once, around `{{{body}}}`.

  -- the shapes in CI on every commit.
- [ ] `tools/probe/record-theme-assembly.py`, `tools/doc-audit.py`:
  - Design Notes § The T1 run;
  - `SECTION` becomes `72`;
  - the scaffold's stand-in `page.hbs` stays, relabelled as Story 10.79's (Question 1, ruled);
  - the docstring and the catalogue row say so.

  -- R-82: a real Ghost reads what the compiler writes.
- [ ] `apps/web/lib/editor.ts`, `apps/web/editor.test.ts`:
  - `EMPTY_TEMPLATE_ASK`, D5f's words with the R-170 change;
  - `emptiesCustomTemplate(key, doc)`: `CUSTOM_TARGET_RE` on `fileOfKey(key)` and exactly one instance, hidden ones counted;
  - tested over every canvas key.

  -- R-170: one list.
- [ ] `apps/web/components/kit/button.tsx`:
  - a `marigold` variant, `bg-marigold-solid` hover `marigold-text`;
  - `new-project-sheet.tsx` uses it.

  -- one spelling of the gold fill.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - `onRemove` asks D5f where `emptiesCustomTemplate` holds;
  - the dialog sits at the editor root: `sheet`, the marigold chip with `AlertTriangle`, the title, and the body with the file in a mono chip, then Keep it (`data-cancel`) and Delete section;
  - one landing function for a removal (the direct path, D5f and the site-wide confirm), so each says "{layer} removed".

  -- FR-I1's warning, at the door every removing gesture takes.
- [ ] `apps/web/app/(app)/app/harness/stand-ins.ts`, `tools/keyboard/journey.spec.mjs`:
  - a members stand-in: a22/1 re-id'd `a30/1`, compiling to the three membership files, behind the stand-ins header;
  - a journey step: place it on Signup, press Delete, and see focus on Keep it; Escape changes nothing. Delete again, Tab, Enter: the section goes, "removed" is said, and the switcher shows Empty. A second section's Delete asks nothing, and nor does a Post's last section.

  -- the warning is unreachable on the live site until Story 10.100 (Question 3), so CI proves it here.
- [ ] Documents: apply Design Notes § Propagated at Dev, then grep the repo for each old wording.

  -- standing rules 3 and 7.

**Acceptance Criteria:**

- **Every standard template compiles.** Given any compile, when the tree is read:
  - `default.hbs`, `index.hbs`, `post.hbs`, `tag.hbs` and `author.hbs` are present;
  - `page.hbs` and `error.hbs` are present wherever designed or wherever synthesis gives them a section, and an untouched one with no section is not emitted (Question 1, ruled);
  - `home.hbs` is present exactly when Home or its page 2 is designed;
  - each untouched file's sections are its `synthesize` or `pageTwoStack` stack, in order, with `designate`'s flags.
- **Conditional files.** Given custom, private and paywall docs, when compiled, each file is present exactly when its doc is designed. A `routed` custom template is always present. None is ever named `page-{slug}.hbs` or under `members/`.
- **Page 2.** When compiled:
  - given a Home with page 2 designed, then `index.hbs` is page 2's;
  - given an archive with page 2 designed, then its file carries page 2 inside `{{#is "paged"}}` and page 1 in its `{{else}}`;
  - given page 2 following page 1, then no `{{#is}}` is written.
- **The page switch.** Given a `page.hbs` with A24 sections, when compiled, then each A24 invocation, and only those, sits inside `{{#if @page.show_title_and_feature_image}}`, and no emitted file carries any other `@page` property.
- **The SEO guard.** Given any compile, when `default.hbs`'s head is read, then it carries the `noindex` block exactly for the contexts whose page-2 stack has no visible feed, and no canonical link.
- **`<main>`.** Given any compile, when `default.hbs` is read, then it carries one `<main id="site-main">`, wrapping `{{{body}}}` alone.
- **The paywall.** When compiled:
  - given a designed paywall doc, then `partials/content-cta.hbs` opens with `{{{html}}}` (Question 2, ruled), and no file invokes `content-cta`;
  - given a theme carrying `partials/content-cta.hbs` and invoking no partial outside `partials/`, then the compile is refused.
- **Ghost renders it.** Given T1 and the owner's in-session go, when the recorder runs:
  - every row in Design Notes § The T1 run holds behind its control;
  - T1 is restored and read back;
  - MEASUREMENTS §72 records the run.
- **The warning.** Given a designed custom template with one section, when that section is deleted by any of the three gestures, D5f's warning opens on Keep it.
  - Keep it and Escape change nothing.
  - Delete section removes the section and says "{layer} removed".
  - No other removal, hide or undo asks.
- **It matches the frame.** Given `D5 Canvas Markers and Template Switcher.dc.html` D5f, when the warning opens, it matches the frame, with two documented changes: R-170's "Delete" for "Remove", and `marigold-solid` for `#B87A00`. It shows:
  - the marigold notice chip with its triangle;
  - the title "Delete the last section from {label}?";
  - the body naming `{file}` in a mono chip;
  - Keep it, then a marigold Delete section.
- **Owner's test.** Given Question 3's ruling (option 1), when Dev ends, then § Owner's manual test is in Story 10.100's card word for word, and this story is Done on its Deploy commit (R-80).
- **Propagation.** Given the rulings, when Dev ends:
  - FR-I1, FR-H2, AD-5, MEASUREMENTS §15b and the stories they touch say what landed;
  - Story 10.100's card carries the warning's hand test and Story 9.9's the synthesized header and footer, each word for word, and each epic's preamble lists what it received (R-195);
  - DW-150's, DW-153's and DW-253's halves here are recorded, and DW-234 and DW-261 are closed;
  - a grep finds none of the old wordings.

## Spec Change Log

- **2026-10-06, Create (the owner ruled).** All four questions were ruled option 1.
  - The Ruled values table now states the ruled values.
  - Question 3 moved the warning's hand test word for word to Story 10.100, so `owner_test` is `none` and § Owner's manual test is the text Dev pastes there.
  - The T1 run's 404 step, the propagation list and the Verification lines name the ruled values.
  - The frozen intent is unchanged: every ruling is its recommended option.

## Design Notes

### What each file compiles from

| File | Stack | Emitted |
|---|---|---|
| `default.hbs` | the site doc as stored | always |
| `home.hbs` | Home's doc if designed, else `synthesize('home.hbs')` | only when Home or its page 2 is designed. An untouched pair IS the generic post feed, which `index.hbs` already serves at `/` (FR-I1; `templates.js:67`) |
| `index.hbs` | `pageTwoStack('home.hbs', home, pageTwo['home.hbs'])` | always. Ghost requires it (`GS020-INDEX-REQ`, fatal) |
| `post.hbs` | the designed doc, else `synthesize` | always (`GS020-POST-REQ`, fatal) |
| `tag.hbs`, `author.hbs` | page 1: the designed doc or `synthesize`; page 2: `pageTwoStack(file, …)` | always. Page 2 inside `{{#is "paged"}}` only when page 2 is designed |
| `page.hbs`, `error.hbs` | the designed doc, else `synthesize` | when designed, or when synthesis gives a section; an untouched one with none is not emitted, and Ghost's own fallback serves (Question 1, ruled) |
| `custom-{name}.hbs` | the designed doc | when designed, or when `routed` names it (FR-I1's class that does not stop) |
| `private.hbs` | the designed doc | when designed |
| `partials/content-cta.hbs` | the paywall doc | when designed (Question 2) |

What the library leaves today (derived, never listed in code): `post.hbs` keeps A24 #1 alone; `tag.hbs` and `author.hbs` keep their feed; `page.hbs` and `error.hbs` keep nothing. Each fills itself as Epic 10 lands (the drop rule, Story 5.5).

### The shapes

`tag.hbs`, page 2 designed:

```hbs
{{!< default}}

{{#is "paged"}}
  {{!-- Post grid · Post Grids · Three Up --}}
  {{> "sections/tag/post-grid-2"}}
{{else}}
  {{!-- Post grid · Post Grids · Three Up --}}
  {{> "sections/tag/post-grid"}}
{{/is}}
```

`page.hbs`, with a Post header:

```hbs
{{!< default}}

{{#post}}
  {{#if @page.show_title_and_feature_image}}
    {{!-- Page header · Post Headers · Centred --}}
    {{> "sections/page/page-header"}}
  {{/if}}

  {{!-- Page content · Post Content Layouts · Plain --}}
  {{> "sections/page/page-content"}}
{{/post}}
```

`default.hbs`, an author archive with no visible feed:

```hbs
    <link rel="stylesheet" href="{{asset "css/screen.css"}}">
    {{#is "paged"}}
      {{#is "author"}}
        <meta name="robots" content="noindex">
      {{/is}}
    {{/is}}
    {{ghost_head}}
  </head>
  <body class="{{body_class}}">
    …headers…

    <main id="site-main">
      {{{body}}}
    </main>

    …footers…
```

`partials/content-cta.hbs`:

```hbs
{{{html}}}

{{!-- Paywall · Paywall / Content CTA · Centred --}}
{{> "sections/content-cta/paywall"}}
```

The words, in `EMPTY_TEMPLATE_ASK`:

| Part | Words |
|---|---|
| Title | `Delete the last section from {label}?` |
| Body | `This template stops shipping. Any Ghost page still pointing at {file} will still load — it will just wear your ordinary page design instead. Ghost won't warn anyone, which is why we are.` |
| Buttons | `Keep it` · `Delete section` |

`{label}` is `CANVASES[…].label` and `{file}` is `fileOfKey(key)`, so Signup's file is `custom-signup.hbs` (R-129).

### Ruled values: Questions 1 to 4

All four were ruled option 1 by the owner on 2026-10-06.

| Value | Ruled |
|---|---|
| Q1 · an untouched `page.hbs` / `error.hbs` the library leaves with no section | not emitted; Ghost's own fallback serves. The recorder's stand-in `page.hbs` stays, relabelled as Story 10.79's |
| Q2 · `{{{html}}}` as `partials/content-cta.hbs`'s first line | allowed, there alone. It is AD-5's second exception, checked on every compile |
| Q3 · the hand test of the warning | moves word for word to Story 10.100. This story is `owner_test: none`, Done on its Deploy commit |
| Q4 · sections-inventory §2's synthesized header and footer | built by Story 9.9, the editor and the theme together. Not in 7.3 |

### Settled here as readings, each told to the owner in one line

1. **`home.hbs` is written when Home or its page 2 is designed.** An untouched pair is the generic feed, so it is written once, as `index.hbs`. Byte-identical files change nothing at `/`, because `home-template` comes from the URL (`body_class.js:21`). A designed Home is written even when page 2 copies it: one file per canvas.
2. **The SEO guard is `noindex` alone, in `default.hbs`'s head.**
   - Ghost's `{{ghost_head}}` already writes a canonical on every page, and page 2's points at page 2 (`meta/canonical-url.js`). A second canonical link makes search engines ignore both.
   - A `<meta>` written from `tag.hbs` would need `{{{block}}}`, a triple-stash.
   - FR-H2's "plus a canonical link to page 1" is corrected.
3. **No explicit `{{> "content-cta"}}`.** See § Facts: any partial invoked from a template is what makes Ghost use the theme's copy. An explicit invocation in a rendered position prints the paywall twice, and with `{{{html}}}` the free text too, as §15b's probe did. The criterion's "compile assertion" becomes the referenced-partial assertion.
4. **`<main id="site-main">`.** Story 9.1's skip link targets `#site-main`.
5. **"Delete", not the frame's "Remove" (R-170).** The gesture, the Layers row and the site-wide confirm all say Delete. "Keep it" stays.
6. **No ask on undo, redo or a reload.** Undo is the net, and a reload is not a gesture.
7. **DW-261 is built here.** Story 7.6's word-for-word copy of the criterion gains "built by Story 7.3".
8. **A routed template's warning is Story 7.16's.** It keeps shipping when emptied, so D5f's "stops shipping" is not its sentence.

### Facts this spec rests on (standing rule 1)

Read in the npm tarballs ghost-6.58.0 and ghost-5.130.6, in express-hbs 2.5.0 (both pin it), and in gscan 6.4.2 and 4.49.7 (`tools/stress/node_modules`). Paths are under `core/`, and the two majors agree unless one is named.

- **`paged`** (`frontend/services/rendering/context.js`, 6.58.0 :31-34, 5.130.6 :34-37):
  - it is pushed when the page is above 1, on collections, archives and channels, and never on page 1 (`/page/1/` 301s);
  - `/tag/x/page/2/` is `['paged','tag']` and `/page/2/` is `['paged','index']`;
  - `is.js` reads `data.root.context` and treats a comma list as OR, so the nested block works in `default.hbs`.
- **`@page`** (`rendering/format-response.js:81-108`):
  - it is set on every single-entry render, seeded `true`, so a post is always true;
  - a page carries its own value, whichever file renders it;
  - it is undefined on lists and on errors.
- **Template chains** (`rendering/templates.js`):
  - a page: `page-{slug}` → its custom template → `page` → `post`;
  - a missing custom template falls to `page.hbs` with no error, which is D5f's sentence;
  - `page-{slug}` outranks the dropdown choice (:98);
  - `/`: `home` → `index`;
  - an archive: `tag-{slug}` → `tag` → `index`;
  - an error: `error-404` → `error-4xx` → `error`, then Ghost's own `server/views/error.hbs` (:164);
  - a routes.yaml route whose template is missing throws `IncorrectUsageError` (`static-routes-router.js:115-119`), whose status is **400** (`@tryghost/mw-error-handler`, `res.statusCode = err.statusCode`). FR-I1 says 500. This spec corrects it as "read in source"; Story 7.17 records it with the first route.
- **The paywall partial:**
  - `{{content}}` returns only `content-cta` when access is false (`helpers/content.js:27-28, :50-52`), and `html` is the free preview (`post-gating.js`);
  - Ghost registers the theme's `partials/` only when gscan's `partials` list is non-empty (`theme-engine/active.js`, 6.58.0 :47 and :75-77);
  - gscan sets that list to the partials invoked from non-partial templates (`checks/005-template-compile.js:120`, `checks/120-no-unknown-globals.js:122`, both gscans);
  - express-hbs then reads the theme's directory after Ghost's, and the theme's copy wins (`lib/hbs.js:150-194`, `:328-330`);
  - §15b's control theme invoked no partial, and its explicit `{{> "content-cta"}}` merely made the list non-empty. In an Inflozo theme every placed section is such an invocation.
- **SEO** (`helpers/ghost_head.js`, `meta/canonical-url.js`):
  - the canonical is the page's own URL (a tag's own canonical URL excepted);
  - robots appears only in preview (6.58.0 :384, 5.130.6 :268);
  - express-hbs's `block` returns a plain string (`lib/hbs.js:242-256`), so only `{{{block}}}` prints markup.
- **gscan** (levels as the planning run read and executed them on fourteen probe themes):
  - `GS020-INDEX-REQ` and `GS020-POST-REQ` are fatal;
  - `GS110-NO-MISSING-PAGE-BUILDER-USAGE` is an **error** on 4.49.7 and a warning on 6.4.2. FR-I1's "only a warning" is corrected; Ghost 5 activates despite it (MEASUREMENTS §13a);
  - `GS110-NO-UNKNOWN` is **fatal** on 4.49.7;
  - no rule names `error.hbs`, `page.hbs`, `home.hbs`, triple-stashes or custom-template naming;
  - `is`, `contentFor` and `block` are known helpers.

### The T1 run: `tools/probe/record-theme-assembly.py`, §72

It is Story 7.2's run (§71's rows re-run), extended:

1. **The extended pilots.**
   - The recorder picks the tag and the author with the most published posts. `posts_per_page` becomes `min(12, total − 1, each count − 1)`, and the run is void when either has fewer than two posts.
   - It reads `/tag/{t}/` and `/tag/{t}/page/2/`, and `/author/{a}/` and `/author/{a}/page/2/`.
   - Rows:
     - the tag's page 1 shows A17 #1 at `data-per-row="three"` and its page 2 at `"two"`;
     - the author's page 2 carries the `noindex` meta inside `<head>` and the author's page 1 does not;
     - the tag's page 2 carries none;
     - every page read has exactly one `<main id="site-main">`, with the page's section roots inside it and the header's outside;
     - Ghost's canonical on the author's page 2 is its own URL, which records why the theme writes none.
   - Controls:
     - the `noindex` meta is in the uploaded `default.hbs`;
     - every page 2 read answers 200;
     - every page carries this run's `screen.css` hash.
2. **The 404** (Question 1, ruled):
   - `/{nonce}-missing/` answers 404;
   - Ghost's own error page renders, with none of this theme's `screen.css`, because the compiled tree carries no `error.hbs`.
3. **The paywall mechanism.** Two hand-written probe themes (not compiled), each behind `start_guard` and `restore_and_delete`, read `/probe-gated-post/` signed out. They settle §15b's library rule.
   - **Positive:** `partials/content-cta.hbs` with a marker, plus one other partial invoked from `default.hbs`, and no `content-cta` invocation. The marker renders.
   - **Control:** the same theme with no partial invoked anywhere. Ghost's own `gh-post-upgrade-cta` renders, as in §15b.
   - Premise: the Content API says the post is not public.
4. **What it writes to T1:** three theme uploads, their activations and deletes. Nothing else: no content, setting or key. The month's probe picture is reused.
5. **The Ghost 5 half** joins DW-326 (R-238).

### Propagated at Dev

- **`prd.md`:**
  - FR-I1:
    - the GS110 levels;
    - the missing route template → 400, read in source;
    - the paywall's mechanism, with no explicit invocation;
    - `home.hbs`'s condition;
    - `<main id="site-main">`;
    - Question 1's ruling: an untouched standard file the library leaves with no section is not emitted (`index.hbs` and `post.hbs` excepted, which Ghost requires), and Ghost's own fallback serves until Epic 10's designs land.
  - FR-H2:
    - the guard is `noindex` alone, written in `default.hbs`'s head;
    - Home's page 2 of its own with no feed is guarded (R-178, R-179, DW-234). This retires "there is nothing to guard".
- **`ARCHITECTURE-SPINE.md` AD-5:** the second exception, `{{{html}}}` as `partials/content-cta.hbs`'s first line and nowhere else (Question 2, owner, 2026-10-06), checked on every compile.
- **`MEASUREMENTS.md` §15b:** a dated correction note pointing at §72.
- **`research-ghost-membership-pages.md:852`:** 500 → 400, read in source.
- **`sections-inventory.md`:**
  - §3: an untouched Home compiles once, as `index.hbs`;
  - §2: the synthesized header and footer are built by Story 9.9, in the editor and the theme together (Question 4, owner, 2026-10-06).
- **`epics.md`:**
  - Story 7.3's card: the explicit-reference line, "returns 500" and the canonical, as read here; its "Owner test: yes (the warning)" becomes "none — the warning's hand test moved to Story 10.100 (Question 3)";
  - Story 7.6: "built by Story 7.3";
  - Story 7.7: a designed Page with no Post header raises GS110, an error on 4.49.7 that Ghost 5 activates despite. 7.7 decides whether Inflozo's gate blocks it (a new DW);
  - Story 7.16: the routed class keeps shipping, and its warning words are 7.16's;
  - Story 9.1: the skip link lands on `#site-main`;
  - Story 10.79: the guard is the compiler's, so an A24 design carries none of its own (DW-153's `data-target` is not needed); retire the recorder's stand-in `page.hbs` once A24 sits on `page.hbs`;
  - Story 10.100: this spec's § Owner's manual test, pasted word for word as the warning's hand test (Question 3), and listed in Epic 10's preamble (R-195);
  - Story 9.9: `sections-inventory.md` §2's sentence ("If the project has no header/footer singleton at all (nothing designed anywhere), synthesize **A1 #1 Rail** and **A3 #1 Minimal Line** with auto content …"), pasted word for word with the rule that the editor shows what the theme ships (FR-D6), and listed in Epic 9's preamble (Question 4, R-195).
- **`epic-7-context.md`:** a sub-bullet for each of the above.
- **`deferred-work.md`:**
  - DW-150 (`<main>`) and DW-153 (the guard) record 7.3's halves;
  - DW-253 records the guard, and its two warnings stay with 7.18;
  - DW-234 and DW-261 are closed;
  - the new GS110 entry for 7.7;
  - a new entry for the synthesized header and footer, owned by Story 9.9 (Question 4).
- **Last:** grep for "returns 500", `{{> "content-cta"}}` as a rule, "canonical link to page 1", "only a **warning**", "nothing to guard" and the recorder's old scaffold label.

### The commits

There is no migration, so there is no Schema phase. `Story 7.3 - Dev - …` carries:
- the code, tests, tools and documents;
- §72, if the T1 run happens in the Dev session on the owner's go.

## Owner's manual test

**Moved word for word to Story 10.100 (Question 3, owner, 2026-10-06).** Nothing can be placed on Signup until then, so the warning cannot appear on the live site, and this story has no hand test: it is Done on its Deploy commit. Dev pastes the steps below into Story 10.100's card, where they are run on the real site after that story's Deploy, on a laptop at full width.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/` | Projects | Open your test project. | — | The editor, on Home. |
| 2 | `https://app.inflozo.com/projects/<id>` | Editor, Template switcher | Open the Template switcher and choose **Signup**. | — | The Signup page, marked Empty. |
| 3 | `https://app.inflozo.com/projects/<id>/custom-signup` | Editor, Section Picker | Press **⌘K**, choose a Members Pages design, and place it. | — | The design sits on the Signup page, and Layers lists it. |
| 4 | the same page | Editor | Click the section, then press **Delete**. | — | A yellow warning: "Delete the last section from Signup?". It says the template stops shipping and names `custom-signup.hbs`. **Keep it** is highlighted, beside a gold **Delete section**. |
| 5 | the same page | the warning | Press **Keep it**. | — | The warning closes, and the section is still there. |
| 6 | the same page | Editor | Press **Delete** again, then **Delete section**. | — | The section is gone, the switcher shows Signup as Empty, and the page says "… removed". |
| 7 | the same page | Editor | Press **⌘Z**. | — | The section is back, with no warning. |
| 8 | the same page | Editor | Place a second section, then delete one of the two. | — | No warning: one section is still there. |
| 9 | `https://app.inflozo.com/projects/<id>/post` | Editor, Post | Delete every section on Post, one by one. | — | No warning. Post goes back to its standard recipe, marked Auto-generated. |

## Questions for the owner

All four were ruled option 1 (owner, 2026-10-06). Dev builds Design Notes § Ruled values as it stands.

### Question 1 — Pages and the 404 page, until their designs exist

**In plain English.**
- Inflozo builds every page type you never touched from a standard recipe, the same one the editor shows you when you open it.
- Two recipes are still empty, because their designs arrive in Epic 10:
  - Page needs the post header for pages (Story 10.79) and the article section (10.83);
  - 404 needs an error design (10.104).
- Until then, an untouched Page or 404 has nothing in it.
- Separately, whatever you choose here: until Story 10.83, posts and pages show their header but not their article text, because the section that prints it is not built yet.

**Example.** A visitor opens your About page, or follows a broken link, on a site deployed from a project where you never opened Page or 404.

1. **Leave them out of the theme until their designs exist.** **(RECOMMENDED)**
   - Ghost fills in: your About page wears your Post design, and a broken link shows Ghost's own plain "Page not found".
   - Each comes back by itself when Epic 10 adds its designs.
   - Until Story 10.79, Ghost 5's checker flags the missing page-title switch. Ghost 5 accepts the theme anyway, nothing is tested on Ghost 5 before then (R-238), and our test site keeps its labelled stand-in page.
2. **Write them anyway, empty.** The visitor sees your header and footer with nothing between, which is exactly what the editor shows today.
3. **Option 1, plus teach the post header (A24 #1) to sit on Pages now**, moving that piece of Story 10.79 here.
   - An untouched Page shows the post header behind Ghost's title switch, on the canvas too.
   - Every theme passes both of Ghost's checkers.
   - New test pictures of that design on a Page need your approval.

**Ruled: option 1 (owner, 2026-10-06).**

### Question 2 — The paywall's free preview: allow one more "print it as-is" line

**In plain English.**
- On a members-only post, a visitor who is not a member sees the free part, then Ghost's "subscribe to keep reading" box. Your Paywall canvas (Story 5.20) designs that box.
- To use your design, the theme carries a file that replaces Ghost's box. Ghost hands that file the whole job, so it must print the free part itself.
- Ghost's own box does that with `{{{html}}}`, a line that prints the post's text as-is. Our safety rule allows exactly one such line today (`{{{body}}}`, the page itself), and it says any second one is your decision (AD-5).
- What the line prints is Ghost's own post text, which Ghost already prints on every post. Nothing typed into Inflozo ever goes through it.
- No paywall design exists until Story 10.107, so nothing changes on a live site before then, whichever you choose.

**Example.** "The night shift" has three free paragraphs above its paywall line. With your paywall design and no such line, a visitor sees only your box, with no paragraphs above it.

1. **Allow it, only as the first line of the paywall file, checked on every compile.** The free part prints exactly as Ghost's own box prints it. **(RECOMMENDED)**
2. **Not yet.** Build the paywall file with A32's own designs in Story 10.107, and ask again there. Until then, a designed paywall is not written into the theme and Ghost's own box shows.
3. **Never.** A designed paywall is never written into the theme, so the Paywall canvas's choice never reaches the live site. Not recommended.

**Ruled: option 1 (owner, 2026-10-06).**

### Question 3 — When you can test the warning by hand

**In plain English.**
- This story adds the yellow warning you see before deleting the last section from Signup, Signin or Member home.
- Today no design can be placed on those three pages; the first ones arrive with Story 10.100 (Members Pages). So on the live site there is never a section to delete there, and the warning cannot appear yet.
- It is still built now, and the automated keyboard walk checks it in this story with a test-only stand-in design.

**Example.** Open Signup in the editor and press "+ Add section". The only design offered is a header, and it goes into the site-wide header, not into Signup.

1. **Move your hand test of the warning, word for word, to Story 10.100**, the first story that lets you place a section on Signup. This story then has no hand test, and it is Done when it deploys green. **(RECOMMENDED)**
2. **Keep this story open after deploy until Story 10.100 lands**, and test it then.
3. **Make it reachable now.** Let an existing design (the Newsletter Inline Row) be placed on the three member pages, test the warning on the live site, and take that back off in Story 10.100.

**Ruled: option 1 (owner, 2026-10-06).**

### Question 4 — A standard header and footer for a project that has none

**In plain English.**
- The plan says a project that never placed a header or a footer gets a standard one in its theme automatically: the Rail header and the Minimal Line footer.
- No story builds this. If only the theme did it, your live site would show a header you never saw in the editor, and the plan forbids that ("nothing ships that you could not have looked at first").
- So it must be built in the editor and the theme together. The Minimal Line footer itself arrives with Story 9.9 (Footers).

**Example.** In a new project you design only Home (a hero and a post grid) and never place a header. Today its theme ships with no header, so visitors have no menu.

1. **Build it in Story 9.9**, the Footers category's first story, where Minimal Line is made: the editor and the theme together, header and footer at once. **(RECOMMENDED)**
2. **Build it now, in this story.** A project with no header shows the Rail header on every page, in the editor and on the live site, until you place your own. The footer joins when Story 9.9 adds Minimal Line.
3. **Drop it.** A theme ships exactly the header and footer you placed, and none if you placed none.

**Ruled: option 1 (owner, 2026-10-06).**

## Verification

**Commands:**

- `pnpm check` -- expected: green. That covers:
  - lint and typecheck;
  - every package's tests, `compile.test.ts`'s `(7.3)` rows among them;
  - `node tools/check-snapshots.mjs` with its new rows, each control failing on its broken subject first.
- `pnpm keyboard`, run whole -- expected: green, including the D5f step.
- The recorder's local half (`compiled()` → `scaffold()` → `gated()`; `cd tools/stress && npm install` once) -- expected: 0 errors and 0 warnings on gscan 4.49.7 (v5) and 6.4.2 (v6), with only `assets/css/cards.css` and the stand-in `page.hbs`, now labelled Story 10.79's, in the scaffold (Question 1, ruled).
- `python3 tools/probe/record-theme-assembly.py`, on the owner's in-session go, in the main session -- expected:
  - every §72 row holds behind its control on T1 `ghost6.inflozo.com` (6.58.0);
  - T1 is restored and read back.
- `python3 tools/doc-audit.py --check`, twice -- expected: PASS.

**Manual checks:**

- The compiled pilot theme reads like a hand-written one: `tag.hbs`'s `{{#is "paged"}}` split, `default.hbs`'s `<main>` and `noindex` block, and `author.hbs`'s hidden feed leaving its layout line alone.
- The harness's D5f dialog side by side with the frame: the chip, the words, the buttons and the gold.

**Real infrastructure (R-82):**

- T1, through the recorder.
- Both gscans locally, and gscan 6.4.2 in CI.
- Vercel: the deploy of the editor change (CI `check`, `rls` and `deploy` green, the deployment READY at the head).
- No migration and no Supabase, Resend or Dodo surface: the compiler has no product caller until Story 7.18. The warning is unreachable on production until Story 10.100, so the keyboard walk is its proof in CI, and its hand test runs in Story 10.100 (Question 3, ruled).
