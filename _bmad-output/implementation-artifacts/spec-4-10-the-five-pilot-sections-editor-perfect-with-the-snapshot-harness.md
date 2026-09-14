---
title: 'Story 4.10 — The five pilot sections, editor-perfect, with the snapshot harness'
type: 'feature'
created: '2026-09-15'
status: 'draft'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Until now every setting, binding and translated phrase built in this epic has been tried only on made-up test
sections; this story builds the first five real sections from the design library — the Rail header, the Three Up
post grid, the Inline Row newsletter sign-up, the Centred post header and one Heroes design — each picked because
it is the hardest of its kind for the machinery underneath. You will see all five on one internal page beside their
settings panel, in light and dark, at desktop, tablet and phone widths, and as a signed-out visitor, a free member
or a paid member, so each can be held up against its drawing. Behind that page, the Ghost theme code each section
turns into is saved in the project so any change to it shows up before it ships, and two abilities the drawings
need are added: showing part of a section to one kind of visitor only, and showing one thing when the site has
something and another when it does not.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** the platform has been proven on fixtures only.
- **No design exists.** `packages/library/designs/` is not on disk. The five pilots PRD §8 fixes, which E4, E5 and
  E6 exit against (`prd.md:757-767`), are not authored.
- **Two constructs the pilots need refuse at render** (`core.ts:278-307`):
  - `data-members`, §7.3's exit construct 2. "E4 does not exit until" it is in (`prd.md:577`), and no story owns
    it.
  - `data-if`/`data-else`, gap row 3.
- **Portal's form attributes are not in the vocabulary.** The validator refuses `data-members-email` as an
  unknown directive (`validate.ts:199`), yet Portal submits nothing without it.
- **NFR-6(c1) is not met.** No design's compiled `.hbs` is committed, so nothing diffs per commit.
- **No review page can show a section dark, at a width, or as a member.**

**Approach:**
- **Author the five pilots** under `packages/library/designs/{category}/{n}/`, each `provisional` (AD-35):
  - each draws its frame's resting artboards, carries every control the vocabulary can express, and exercises
    the case it is in the set for;
  - whatever else a drawing needs is listed per pilot in Design Notes, with its owning story.
- **Render `data-members` and `data-if`/`data-else` on both emitters.** A render is handed the visitor's member
  state and the section's show-to value.
- **Keep Portal's `data-members-email` and `data-members-error`** as emitted attributes.
- **`tools/check-snapshots.mjs`, in `pnpm test`,** does four things for every design:
  - holds its theme output byte-equal to a committed snapshot;
  - runs `checkBindings` over every declared target;
  - renders the canvas at each target;
  - runs its own controls.
- **`/pilots`** is `/controls`' workspace fed the five pilots, with a switcher for light/dark, width, member
  state, feed page and show-to.
- **The reference token set takes the Paper values** the export's kits declare.
- **Recordings on T1 and T3 come first.**

## Boundaries & Constraints

**Always:**
- **Cite or execute** (standing rule 1).
  - Planning read the member shape, the loop's context and the form attributes in both exact Ghost releases and
    in Portal.
  - Planning also executed a no-param partial under Handlebars 4.7.9 (Design Notes).
  - The Dev's first task records the new rows on T1 and T3 (AD-23).
- **The export is the design authority (R-74).**
  - Every pilot names its frame and its category proof.
  - "Matches the frame" means structure, arrangement, type scale, spacing ladder and every drawn state this spec
    builds.
  - Colours are the reference token set's.
  - Where a spec table and a drawn panel disagree, the drawn panel wins (DW-111).
- **Provisional (AD-35).** Every `design.json` carries `"provisional": true`. A declared module keeps its
  `data-module` and gets no code, because a module is written by its first category story (Story 4.7).
- **One copy of each thing.**
  - The design list is the directory.
  - A snapshot is derived from its design.
  - No count is written anywhere: the check prints its totals.
- **Member gating is server-side and `{{#if}}` only.**
  - Never `{{#unless}}` and never `{{#has}}` (FR-D16).
  - A member's field is never printed (R-28).
  - `comped` previews as paid.
- **Every member ask is gated on the site's own flag (R-4):** a free ask sits inside `@site.allow_self_signup`.
- **`/pilots` is a typed-address internal page, like `/controls`:**
  - behind the session guard, `noindex`, and saves nothing;
  - exempt from `busy.test.ts`'s skeleton rule by name (R-98).

**Ask First:**
- Adding, rewording, retiring or re-marking any catalog key.
- Any dependency, and any module code.
- A control type, sidebar group, directive or registry field this spec does not name.
- Rendering `data-when`/`data-index`, `data-target`, `data-text` or `data-needs`.
- Any write to T1 or T3 beyond the probe theme and the one reused image (4.3's Q2) — creating a member included.
- A recording that disagrees with a Design Notes fact.
- Changing `/controls`, `/style-guide` or `/kit` beyond the token values.

**Never:**
- Edit the design export.
- **Anything from Epic 5:**
  - selection, persistence and design switching;
  - Layers' show-to control (5.4), the member-state toggle (5.14) and behaviour suppression (5.15);
  - the Data group's Source and the main-feed designation (5.19).
- **Anything from Epic 7:** compiling a theme, partial placement (`partials/header.hbs`), assets and `locales/`.
- **Anything from Story 4.11:** pixel baselines and the axe matrix.
- A "compiles byte-identical" criterion — that is the joint gate's (7.35).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A member arm | `<p data-members="anonymous">A</p><p data-members="paid">P</p>` | **Theme:** `{{#if @member}}{{else}}<p>A</p>{{/if}}` and `{{#if @member.paid}}<p>P</p>{{/if}}`. `free` emits `{{#if @member}}{{#if @member.paid}}{{else}}…{{/if}}{{/if}}`; `everyone` emits no wrapper. **Canvas:** an element is kept when its value is `everyone` or equals the handed `member` (default `anonymous`) | refused by name: a `data-members` inside another, or one sharing its element with `data-repeat` or `data-items` |
| Show-to | `visibility: "paid"`, `member: "anonymous"` | the root is gated as if it carried `data-members="paid"`, on both emitters; the canvas renders `""` | refused: a root that carries `data-members` itself while `visibility` is not `everyone` — one audience per section |
| Two arms | `<img data-if="@site.logo" data-bind-attr="src:@site.logo" alt=""><span data-else data-bind="@site.title">Orbit Weekly</span>` | **Theme:** `{{#if @site.logo}}<img …>{{else}}<span>…</span>{{/if}}`, with ONE `{{#if @site.logo}}` for the image (the condition and the media guard share a field, so they share a guard). **Canvas:** exactly one arm is kept | refused naming it: a `data-else` that is not the next element sibling of a `data-if` |
| One arm, a list, a number | `data-if="@site.allow_self_signup"`; `data-if="posts"` with a `data-else`; a field the matrix types `number` | `{{#if …}}…{{/if}}`; an empty list takes the else arm; a number adds `includeZero=true` | — |
| Condition refusals | `data-if="@member"`; `data-if="post"`; `data-if` naming a bare helper; a value failing `PATH_RE` | refused with `bindable`'s sentence or AD-36's | — |
| Portal's form | `<form data-members-form="subscribe"><input type="email" data-members-email>…<p data-members-error></p></form>` | both attributes are kept on both emitters, as `data-members-form` is | refused: a value on either |
| The wrapper axis *(control)* | A24 #1 rendered with `target: "index.hbs"` | FR-H7's refusal, naming `title`; at `post.hbs` it renders | — |
| Pagination *(control)* | A17 #1 rendered with `target: "post.hbs"` | R-7's refusal | — |
| The no-param partial | A17 #1's theme output | `{{#foreach posts}}` around `{{> "post-card"}}`, the card filed as `partials["post-card"]`; the canvas draws one card per row | — |
| Feed pages | A17 #1 on the canvas at page 1, a middle page, the last page, and an empty set | no Newer link on page 1; no Older link on the last; the empty set shows the else arm | — |
| Snapshot drift *(control)* | in the check's own memory: a pilot with one class changed; a snapshot missing; a snapshot with no design | each fails naming the file, and a changed one names its first differing line; `--update` rewrites, and the next run passes | CI never passes `--update` |
| Bindings per target *(control)* | every design × every `compileTarget`, through `checkBindings` | `[]`; the control — a `title` binding added to A1 #1 at `default.hbs` — returns a refusal | — |

</frozen-after-approval>

## Code Map

- **The frames** (never edited), in `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/`.
  - Each pilot's artboards are anchored in Design Notes' pilot table.
  - **Paper's token objects:** `_build/a22lib.js:4-9` (`L` light, `D` dark; fonts and radius in `PACKS.paper`
    `:13-14`) and `a20-kit.js:8-30`.
  - **The switcher's frames:** `S4 Editor.dc.html:370` (S4d, the member-state preview) and
    `P0-6 Editor State Switcher.dc.html:24-44` (a switcher in the canvas chrome, never a sidebar control).
- **`packages/library/src/vocabulary.ts`**
  - `MEMBER_STATES` `:273` and `MEMBER_FORMS` `:278`; the `Directive` type `:461-472`.
  - `data-if`/`data-else` `:541-549`, `data-members` `:550-554`, `data-members-form` `:660-664`.
  - `CONSUMED_DIRECTIVES` `:677-683`.
- **`packages/library/src/validate.ts`** — Ghost's own attributes skipped `:159-161`, `unknown-directive` `:199`,
  `validateDesignJson` `:377-580`, `validateDesign` `:668-691`.
- **`packages/library/src/contexts.ts`** — `bindable`'s condition rule is booleans only (`:173`); the `@member`
  refusal is `:185-187`.
- **`packages/library/src/registry.ts`**
  - `PropDef` `:67-91`, `CategoryContent` (at `designs/{category}/content.json`) `:93-99`, `DataBinding` `:104`.
  - `DesignJson` `:115`, with `provisional` `:143`.
  - `parseDesignDir` `:195`, `assembleEntry` `:216-255`.
- **`packages/section-runtime/src/core.ts`**
  - `RenderInput` `:116-189`.
  - `RENDERED_DIRECTIVES` `:278-300` and `REFUSED_DIRECTIVES` `:305-307`; `refuseUnrendered` `:470-484`.
  - `isEmpty` (Handlebars' `{{#if}}`) `:328`; `wrapGuard`/`ifOpen`/`guarded` `:437-452`.
  - `ghostPaths` `:539-569` (hand-written: DW-131), `bindingRefusals` `:591-601`, `checkBindings` `:606-620`.
  - `emitBindings` `:628-916`, `applyProps` `:969-1101`, `stampControls` `:1111-1129`.
  - `renderTree` `:1324-1441` — its refusals `:1341-1370`, the stamping `:1379-1382`, the theme's repeats
    `:1387-1432`.
  - `expandRepeats` `:1448-1497`, `renderTheme` `:1502-1514`, `renderCanvas` `:1517-1520`.
- **`packages/section-runtime/src/tokens.ts`** — `REFERENCE_TOKENS` `:69-149` and `referenceTokensCss` `:163-175`.
  `reference-tokens.css` is that function's bytes, held there by `tools/stress/test-vocabulary.mjs:179-184`.
- **Runtime tests** — `agreement.test.ts`: `agree()` `:95`, the partition `:703-728`, the leak check from `:730`.
  Also `ad36.test.ts` and `contexts.test.ts`.
- **`packages/ghost-shim/src/index.ts`** — `navigationItems` `:388`, `paginationContext` `:422`, `pageUrl` `:440`,
  `isMember` `:479-481`, `bareHelper` `:580`. `contract.test.ts:559-578` asserts the recorded `{{#if @member}}` arm.
- **`packages/library/src/orbit-weekly.ts`**
  - `site()` `:82`, `feedPagination` `:87`, `feedPage` `:96`, `subject` `:108`, `resolveSource` `:248`.
  - `dataset.json`'s `site` carries `logo`, five navigation items, `members_enabled` and `accent_color`.
  - 52 posts at 12 per page.
- **`tools/probe/record-shim.py`**
  - `record()` `:249`. Its probe theme is `tools/probe/theme-shim/`, with the member rows at `index.hbs:44-46`.
  - **`--help` uploads a theme.** Read the docstring instead.
- **Patterns to copy for the check**
  - `tools/check-catalog.mjs`: controls first, then totals, then an exit code.
  - `tools/stress/test-vocabulary.mjs:122-150`: jsdom borrowed from section-runtime, and a render per
    `compileTarget`.
  - `package.json`'s `test` chain ends with the catalog check; `tools/doc-audit.py:809` is the shape of a tool row.
- **The review page to copy: `/controls`**
  - `apps/web/app/(app)/app/(authed)/controls/{page.tsx,review.tsx,frame/route.ts}`: paint `review.tsx:114-132`,
    mount `:141-164`, the relative iframe `:172`.
  - `apps/web/lib/controls-review.ts`: validate and assemble `:25-38`, the canvas document `:115-125`.
  - `apps/web/lib/style-guide.ts:59-69` maps `orbit-weekly.example` image URLs.
  - `apps/web/next.config.ts:8-38` (tracing) and `busy.test.ts:132-146` (`NO_SKELETON`).
  - Tests: `controls.test.ts:18-66` and `app-routes.test.ts:44-54,136-147,207-218`.
  - The deployed harness is `tools/probe/run-verify-controls.cjs`.
- **`docs/section-authoring.md`**
  - `designs/{category}` `:52-54`, the rendered status `:629-638`, the gap table `:843-860`, rows 3–4 `:895-910`.
  - The exit table `:987-993`, the kept attributes `:1102-1116`, §4's refusals `:1122`.
- **Propagation targets**
  - `ARCHITECTURE-SPINE.md`: AD-35 `:372-376`; its tree `:490` says `categories/`, which neither code nor the guide
    uses.
  - `prd.md`: the pilot table `:757-767`.
  - `epics.md`: `:469-481`, and Story 4.10 `:1455-1479`.
  - `MEASUREMENTS.md`: §44 `:3185` is the last section.
  - `reconcile-designs-decisions.md`: R-4 `:307-326`.
  - `deferred-work.md`: DW-87 `:2471`, DW-94 `:2663`, DW-96 `:2707`, DW-97 `:2725`, DW-99 `:2774`, DW-104 `:2867`,
    DW-119 `:3148`, DW-121 `:3177`, DW-130 `:3304`, DW-131 `:3319`, DW-133 `:3353`. DW-148 `:3598` is the last entry.

## Tasks & Acceptance

**Execution:**
- [ ] **FIRST — record on T1 and T3.** Files: `tools/probe/theme-shim/` (`index.hbs`, a new `partials/probe-card.hbs`),
  `tools/probe/record-shim.py`, `packages/ghost-shim/fixtures/ghost{5,6}/`, `packages/ghost-shim/src/contract.test.ts`.
  - Add these rows:
    - `{{#foreach posts limit="2"}}{{> "probe-card"}}{{/foreach}}`, the card printing `{{title}}` and `{{@first}}`;
    - `{{#foreach @site.navigation}}{{label}}={{url}};{{/foreach}}`;
    - `{{#if @member.paid}}…{{else}}…{{/if}}`, signed out;
    - `{{#if @site.logo}}…{{else}}…{{/if}}`;
    - `{{#if @site.allow_self_signup}}…{{/if}}`.
  - The contract test asserts the shim's side of each row. The signed-in arms stay cited, not recorded (Ask First).
  - Why first: AD-23.
- [ ] `packages/library/src/vocabulary.ts`, `validate.ts`, `validate.test.ts`:
  - `data-members-email` and `data-members-error` become valueless `emitted` directives.
  - Every directive that carries a Ghost path gets a `ghostPath` flag (DW-131).
  - `data-else`'s summary names its pairing rule.
  - One firing test per new refusal.
- [ ] `packages/section-runtime/src/core.ts`, `index.ts`:
  - `RenderInput.member` (`anonymous` · `free` · `paid`, default `anonymous`) and `visibility` (the four
    `MEMBER_STATES`, default `everyone`).
  - `data-members` and `data-if`/`data-else` join `RENDERED_DIRECTIVES` and render as the matrix says.
  - A condition's path is legal where `bindable` allows it as a `condition` or as a `value`. So `@member`, an
    object and a helper stay refused, and `bindable` itself is unchanged.
  - `ghostPaths` reads every flagged directive.
- [ ] `agreement.test.ts`, `ad36.test.ts`, `contexts.test.ts`:
  - `agree()` rows for each member state, show-to, both arms, a list, a number, and the form attributes;
  - the leak fixture and the partition;
  - a vector for each new value grammar;
  - a test that every `ghostPath` directive is walked.
- [ ] `packages/section-runtime/src/tokens.ts`, `reference-tokens.css`:
  - every row the Paper objects name takes their light and dark values;
  - every other row keeps today's value;
  - `tokens.test.ts` and the drift check stay green.
- [ ] `packages/library/designs/{a1,a17,a22,a24,a4}/content.json` and `{n}/{index.html,style.css,design.json}`:
  - the five pilots, built as Design Notes' table says;
  - each validates with its control values (DW-119), and each stylesheet passes `pnpm lint`.
- [ ] `tools/check-snapshots.mjs`, `packages/library/snapshots/{category}/{n}/`, `package.json`, `tools/doc-audit.py`:
  - **For every design directory, at every `compileTarget`:**
    - validate and assemble;
    - `checkBindings` returns `[]` (DW-130);
    - `renderCanvas` does not throw;
    - `renderTheme`, with content and control defaults, equals the committed `template.hbs` and `partials/*.hbs`.
  - **The controls sample** renders through both emitters at each of its targets (DW-121).
  - **The matrix's *control* rows** run on every run.
  - **Output:** the check prints its totals, and `--update` rewrites the snapshots.
  - Append it last to `test`, with a doc-audit row.
- [ ] `apps/web/app/(app)/app/(authed)/pilots/{page.tsx,review.tsx,frame/route.ts}`, `apps/web/lib/pilots.ts`,
  `apps/web/pilots.test.ts`, `next.config.ts`, `busy.test.ts`, `tools/probe/run-verify-pilots.cjs`:
  - `/controls`' workspace, fed the five pilots.
  - **The switcher, in the canvas chrome:**
    - pilot;
    - Light · Dark, as `data-mode` on the canvas `<html>`;
    - Desktop 1440 · Tablet 834 · Phone 390 — the canvas at that width, scaled to fit;
    - View as Signed out · Free · Paid;
    - Page (First · Middle · Last · Empty) on A17 #1, and Show to on A22 #1.
  - Orbit Weekly feeds the canvas. Each module mount gets `js-enabled` and no script.
  - The tests copy `controls.test.ts`. The harness copies `run-verify-controls.cjs` and gets a doc-audit row.
- [ ] `docs/section-authoring.md`:
  - rows 3 and 4 as rendered: the emitted forms, and the pairing and nesting refusals;
  - the condition kinds; `member` and `visibility`; the two Portal attributes;
  - where designs and snapshots live, and what `provisional` means.
- [ ] **Propagate** (standing rule 3):
  - `epic-4-context.md`: sub-bullets.
  - The spine: the tree (`designs/{category}/content.json`, `snapshots/`), and an AD-35 note that E7's formatting
    re-baselines a snapshot once more (Story 7.1).
  - `prd.md` and `epics.md`: the pilot rows, per Q1's ruling.
  - `MEASUREMENTS.md`: §45.
  - `deferred-work.md`:
    - close DW-94 (`BASES` stays: a snapshot is generated output), DW-119, DW-121, DW-130 and DW-131;
    - settle DW-97 per Q2;
    - re-own DW-96, DW-99 and DW-104;
    - amend DW-87 and DW-133;
    - add one entry per pilot's "Left" cell.
  - Then grep for `categories/{a1`, `a4/2`, "heaviest control set" and `Split Editorial`.

**Acceptance Criteria:**
- Given each pilot on `/pilots`, when it is shown at each drawn width in light and dark, then **it matches its
  frame** — the artboards Design Notes' table names. It matches in structure, arrangement, type scale, spacing
  ladder and states, in the reference token set's colours (R-74).
- Given A1 #1 and A22 #1, when View as moves through Signed out, Free and Paid, then:
  - the member-aware parts change as their frames draw them;
  - a Show to that excludes the viewer removes A22 #1 entirely (FR-D16, R-4).
- Given `pnpm check` on Node 24, then:
  - `check-snapshots: PASS` prints its totals;
  - every matrix row holds;
  - each control fails when its subject is broken (NFR-6(c1), FR-H7, FR-H8).
- Given the recorder, when it runs on T1 and then on T3, then:
  - both fixtures carry every new row;
  - the contract test passes;
  - the previous theme is active again and the probe theme is gone (standing rules 1 and 2).
- Given `pnpm build`, the gscan harness and `python3 tools/doc-audit.py --check` (twice), then:
  - all are green;
  - `/controls` and `/style-guide` render unchanged apart from their colours.

## Spec Change Log

## Design Notes

**The five pilots.**
- Each directory holds `index.html`, `style.css` and `design.json` (`provisional: true`, `ghostCompat.minVersion`
  `5.0.0`).
- The category's `content.json` holds only the props the pilot draws; its category story widens it to the union
  (R-102).
- **Built here** is what the vocabulary expresses. **Left** names the owner, and becomes one ledger entry per pilot.
- A Background narrowing reuses the sentence the controls sample already carries ("This design is drawn for plain
  grounds, so accent and image are not offered."), except where a row says otherwise.

| Pilot · targets · frame | Case | Built here | Left, and its owner |
|---|---|---|---|
| **A1 #1 Rail** `designs/a1/1` · `default.hbs` · `A1-1 Rail.dc.html` desktop `:27-51`, shrink `:54-72`, dark `:103-125`, tablet `:127-150`, phone `:154-171`, panel `:193-227` · proof `A1-0 Category Proof.dc.html` · spec `A1 Headers - Spec.md` §0 `:13-192`, #1 `:193-231` | the site-wide singleton binding | **Brand:** `data-if="@site.logo"`, else the `@site.title` wordmark. **Nav:** a repeat over `@site.navigation`, folded in CSS (stepper 3–6), with a native `<details>` More (`nav.more`). **Actions,** inside `data-if="@site.members_enabled"`: Sign in for `anonymous`; Account for `free` and for `paid` (Portal `signin`, `account`); Subscribe for `anonymous`, inside `data-if="@site.allow_self_signup"` (`member.signup_cta`). **Phone:** the menu button (`a11y.open_menu`) at ≤767, with `nav-drawer` declared. **Controls,** in the drawn panel's order: On scroll · Nav position · Sign in · Subscribe · Nav items before More · Divider under. **Background:** base · surface, "An inverted header is a design of its own, Contrast Band, not a setting." (`:36`) | **A1's category story:** authored nav children and dropdown panels; Fit to width; the Search control and trigger (no artboard draws one); the dark-mode toggle (no key); `<h1>` on the home page only; an authored logo; the skip link (E7's layout owns `<main>`); the current-page underline (`@site.navigation` has no `current`); Shrink's motion |
| **A17 #1 Three Up** `designs/a17/1` · `home.hbs` · `index.hbs` · `tag.hbs` · `author.hbs` · `A17-1 Three Up.dc.html` desktop `:28-48`, per row `:57`, states `:93`, panel `:132-146`, tablet `:161`, phone `:203-222`, dark `:227` · proof `A17-0 Category Proof.dc.html` `:283`, `:367-446` · spec `A17 Post Grids - Spec.md` §0 `:35-366`, #1 `:374-405` | the paginated context, and `post-card` with no params | **The feed:** `data-repeat="posts" data-partial="post-card"`. **The card:** link; feature image `\|img_url:m` with `data-bind-srcset` and `sizes`; a tag plate behind the image for a post without one; tag, title, `excerpt`; meta — photo `\|img_url:xs` with the stylesheet's one letter, name, date, `reading_time`. **Around it:** the pager (`pagination.*`, per Q2); the empty-state arm (`data-if="posts"` with `data-else`, `archive.empty_heading` and `archive.empty_body`); head and foot props. **Controls:** Per row · Image ratio · Excerpt (Three lines greyed at Four) · Meta · First cell · Tag. **Background:** base · surface · contrast | **Story 5.19:** Source, Count and the main-feed designation. **A34's category story:** the Pagination style select. **A17's category story:** "View all: Matches the query". **DW-107:** Image focus |
| **A22 #1 Inline Row** `designs/a22/1` · `home.hbs` · `page.hbs` · `post.hbs` (spec `:85-87`) · `A22-1 Inline Row.dc.html` desktop `:28-32`, states `:34-52`, panel `:54-73`, widths `:75-83`, dark `:85-91` · proof `A22-0 Category Proof.dc.html` `:119-122` · spec `A22 Newsletter - Spec.md` §0 `:81-483`, #1 `:493-557` | `@member` gating, show-to, Portal | **Head:** props. **For `anonymous`,** inside `data-if="@site.allow_self_signup"`, the form: `data-members-form="subscribe"`, `data-members-email`, the button (`member.signup_cta`), the note, `data-members-error`, with `member-form` declared. **For `free` and for `paid`:** "Signed in" (R-4) and a Portal `account` link. **The whole section** sits inside `data-if="@site.members_enabled"` — the drawn "Hide the section". **Controls,** in the drawn Quick Controls' order: Alignment · Heading size · Field width · Blurb · Below the field · Social proof (`{members}`). **Background:** base · surface · contrast | **A22's category story:** Submitting, Done and Invalid, and their words; the name field and the newsletter choice; the paid count (DW-99); the other members-off option; Display greyed at Wide (one value, which `disabledBy` cannot grey); the no-JavaScript notice (R-5's key) |
| **A24 #1 Centred** `designs/a24/1` · `post.hbs` · `A24-1 Centred.dc.html` desktop `:30-46`, absences `:53-77`, states `:83-104`, panel `:116-145`, widths `:153-190`, dark `:211` · proof `A24-0 Category Proof.dc.html` `:94`, `:179-298` · spec `A24 Post Headers - Spec.md` Post block `:247-298`, fields `:351-389`, #1 `:390-436` | the wrapper context | **The header:** tag link; `<h1>` title; standfirst `excerpt`; a byline over `primary_author` (photo, name, date, `reading_time`); a figure with `feature_image`, srcset and `feature_image_caption` as text. **Controls:** Alignment · Title size · Standfirst lines · Image ratio · Rule, plus the post block's Tag line · Meta · Standfirst · Feature image · Avatar · Caption as Style rows. **Background:** base · surface · contrast | **A24's category story, with E7's page wrapper:** `page.hbs` and `@page.show_title_and_feature_image`; all tags, and several authors with "and"/"and others" (R-3's key); the updated-date Meta value; the caption's links; the "Post block" group name. **DW-107:** Image focus |
| **A4 #2 Flush Left** — *Q1's ruling decides; this row is its option 1* · `designs/a4/2` · `home.hbs` · `page.hbs` (proof `:57`) · `A4-2 Flush Left.dc.html` desktop `:27-51`, below the sub `:55-79`, widths `:83-100`, states `:102-115`, dark `:120-144`, tablet `:149-169`, phone `:173-211`, panel `:239-256` · proof `A4-0 Category Proof.dc.html` fields `:300-365` · spec `A4 Heroes - Spec.md` §0 `:27-88`, #2 `:130-181` | authored text and an authored list, beside member-aware actions | **Text:** eyebrow; headline; sub (links only, as the field list at `A4-0:327` allows); note. **The list:** `proof[]` (`data-items`, 0–3, `atMax`). **Actions:** primary and secondary, with Portal links, each ask gated per R-4. **Controls:** Text block width · Headline size · Below the sub · Primary action · Secondary action (greyed while Primary is off). **Background:** base · surface · contrast | **A4's category story:** a pair's Member count source; the category rule that every authored text takes four marks (`A4 Heroes - Spec.md:61`, against `A4-0:327`). **Story 5.4:** Member visibility |

**What Ghost does**, read in both exact releases — npm `ghost@5.130.6` and `ghost@6.58.0`.
- Portal is read at `2.51.5` and `2.69.339`, which `core/shared/config/defaults.json` pins as `~2.51` and `~2.69`.
- The Dev records the rows it can on T1 and T3.

| Fact | Where | What follows |
|---|---|---|
| `@member` is `null` signed out, and `paid` is `status !== 'free'` | `core/frontend/services/theme-engine/middleware/update-local-template-options.js:25-37` (5) and `:27-39` (6); R-4 cites the same | `anonymous` is the `{{else}}` of `{{#if @member}}`; `free` and `paid` split on `@member.paid`; `comped` is paid |
| `{{#foreach}}` calls `fn(items[field], {data, blockParams})` | `core/frontend/helpers/foreach.js:88-91`, the same in both | a `{{> "post-card"}}` with no params renders against the row |
| Executed under Handlebars 4.7.9 (2026-09-15): a no-param partial inside a loop printed each row's `title` and `@first`, and the root's `@site.title`; at the root it printed the root's `title` | a scratch script, with Ghost's `foreach` call shape | the case A17 #1 is in the set for holds |
| Portal submits `input[data-members-email]`'s value; it also reads `data-members-name`, `-label` and `-newsletter`, and writes `data-members-error` | `@tryghost/portal` 2.69.339 and 2.51.5, `umd/portal.min.js`; Ghost 5's own signup card, `core/server/services/koenig/node-renderers/signup-renderer.js:19-31` | the email input must carry the attribute, or the form submits nothing |
| `{{#match a ">" b}}` compares numbers, and `{{page_url n}}` takes a page number | `core/frontend/helpers/match.js:45-59` (5) and `:47-61` (6); `helpers/page_url.js:11-16` | Q2's option 2 needs no script; Handlebars has no arithmetic, so its trailing gap cannot always be exact |
| The matrix (executed 2026-09-15): `@site.navigation` repeats with `label` and `url`; `@site.logo` binds but is refused as a condition; `@site.members_enabled` and `allow_self_signup` are conditions; `title` is refused at the top of `index.hbs` | `bindable` | why a condition also accepts a value's use, and where the wrapper control comes from |

**Why `data-if` accepts a value and not only a boolean.**
- Handlebars' `{{#if}}` tests truthiness (`core.ts:328`).
- The guide's own row 3 example tests `custom_excerpt`, a text, and A1 #1's logo is an `image`.
- `bindable`'s boolean rule is Epic 5's *offer*, and it stays. The directive accepts a path that is legal as a
  condition or as a value.

**Why the reference token set becomes Paper.**
- Every frame, proof and kit is drawn in Paper. Today's values (`#8a3b12`, `4.5rem`) were written in Story 4.2 and
  appear nowhere in the export, which R-74 does not allow for a surface built from it.
- Only the values change. Epic 6 still authors every pack against the same contract (`tokens.ts:1-6`); Story 4.11's
  three reference packs are its own concern.

**Snapshots live beside the designs, not inside them:** `packages/library/snapshots/{category}/{n}/`.
- A design directory has one owning epic (AD-35), and E7's formatting (Story 7.1) will re-baseline the snapshots
  without touching a design.
- There is one snapshot per design: a section never opens `{{#post}}`, so its text does not vary by target. The
  check proves that by rendering every target against the one file.
- `BASES` stays as it is, because a snapshot is generated output and not a document (DW-94).

**Contradictions this plan settles without the owner, each by a rule already in force:**
- **A1 #1's logo.** Its spec makes `logo` an authored field (`A1 Headers - Spec.md:46`); the PRD's pilot row binds
  `@site.logo`. The PRD decides behaviour (R-74's scope), so the authored logo is left to A1's story.
- **A24 #1's targets.** `sections-inventory.md:572` lists `post.hbs` and `page.hbs`. The pilot declares `post.hbs`
  alone: a narrower `compileTarget` is a refusal and never a lie (FR-G3), and the page half needs `data-target`.
- **"Edit-safe".** The export uses it to mean "does not run while editing" (`A1 Headers - Spec.md:185`); the
  registry means the opposite. The registry's values stand, and DW-133 is amended.
- **Where `content.json` lives.** The spine's tree puts it in `categories/`, but the code and the guide use
  `designs/{category}/`. The spine is corrected.
- **DW-121's owner.** It names "Story 4.10 (the render matrix)", but the matrix is Story 4.11. The check closes
  DW-121's substance here.

## Verification

**Commands:**
- `pnpm install --frozen-lockfile && pnpm check` (Node 24) -- expected: exit 0. `check-snapshots: PASS` prints its
  totals; the agreement, AD-36, contract and validate suites are green.
- `node tools/check-snapshots.mjs` -- expected: PASS, with each control reported failing when its subject is broken.
- `python3 tools/probe/record-shim.py` (read its docstring first; `--help` uploads) -- expected: T1 and T3 recorded,
  the previous theme active, and the probe theme deleted.
- `cd tools/stress && npm install && node build.js && node gate.js theme` (Node 24) -- expected: 0 errors and
  0 warnings on gscan 4.49.7 and 6.4.2.
- `pnpm build`, then `python3 tools/doc-audit.py --check` twice -- expected: exit 0, PASS.

**Real infrastructure (R-82):**
- **T1 and T3:** the recorder's renders, then a read-only `GET themes/` on each.
- **The deployed `/pilots`:** `node tools/probe/run-verify-pilots.cjs`, with a throwaway account.
  - Every pilot × light and dark × 1440, 834 and 390 × each View as.
  - Screenshots are compared by eye against the frames.
  - axe finds zero violations inside each canvas.
  - The account is deleted afterwards.
- **GitHub Actions:** the Dev push's `check` log shows `check-snapshots: PASS`.
- **Vercel:** the production deployment is READY.
- **Supabase:** only the harness's throwaway user is touched. There is no migration, so R-99 has nothing to apply.
- Resend and Dodo are not touched.

## Owner's manual test

These steps are written for Q1's and Q2's recommended options, and are rewritten if another option is ruled.
- **Where:** the app is at `app.inflozo.com`. This page is internal: nothing links to it, search engines are told
  to ignore it, and nothing on it is saved.
- **Which deployment:** Deploy records it under "## Verification".
- **What to compare:** the pictures and words come from Orbit Weekly, the sample publication, so they differ from
  the drawings. The arrangement, the sizes and the states are what should match.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|-----------|------------|---------------------|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in as you normally do. | — | Your dashboard. |
| 2 | `https://app.inflozo.com/pilots` *(placeholder until Deploy)* | Pilots review | Type the address. | — | **Above the canvas:** Rail · Three Up · Inline Row · Centred · Flush Left, then Light/Dark, Desktop/Tablet/Phone and View as. **The canvas:** Rail, at Desktop and Light — the Orbit Weekly logo at the left, four menu items and "More" beside it, "Sign in" and an orange "Subscribe" at the right, and a thin line under the bar. **To the right:** the settings panel. |
| 3 | same | Rail | Press View as → Free, then Paid, then Signed out. | — | At Free and Paid, "Sign in" becomes "Account" and "Subscribe" disappears. At Signed out both return. |
| 4 | same | Rail, panel | Set Nav items before More to 3, then Divider under to Shadow. | — | "More" now holds one more menu item, and the line under the bar becomes a soft shadow. |
| 5 | same | Rail | Press Phone, then Dark. | — | The menu folds into a menu button while "Subscribe" stays in the bar; then the bar turns dark with light text. |
| 6 | same | Three Up | Press Three Up, Desktop, Light. | — | **Top:** a heading. **Cards:** six post cards in three columns, each with a picture, a tag, a title, a short excerpt, and the writer's photo, name, date and reading time. **Below:** "1 / 5" and "Older posts" — no "Newer posts" on the first page. |
| 7 | same | Three Up | Press Page → Middle, then Last, then Empty. | — | **Middle:** both links. **Last:** no "Older posts". **Empty:** "Nothing here yet" and a sentence, where the cards were. |
| 8 | same | Three Up, panel | Set Per row to Four, then open Excerpt. | — | Four columns, and "Three lines" is grey with a sentence saying why. |
| 9 | same | Inline Row | Press Inline Row, then View as → Free. | — | **First:** a centred heading, a sentence, an email box beside a "Subscribe" button, and a short note. **At Free:** the box and the button give way to "Signed in" and a link to the account. |
| 10 | same | Inline Row | Press View as → Signed out, then Show to → Paid members. | — | The whole section disappears: a signed-out visitor is not a paid member. |
| 11 | same | Centred | Press Centred. | — | The top of the article "The four hundred domains that refuse to move": a tag, the title large and centred, a sentence under it, the writer with photo, date and reading time, then a wide picture with its caption. |
| 12 | same | Flush Left | Press Flush Left. Set Below the sub to Proof row, then Primary action to Off. | — | **First:** a large headline on the left half, a sentence, two buttons and a short note, with the right half empty. **Proof row:** three figures with their labels under a thin line. **Primary off:** Secondary turns grey with "a secondary action needs a primary beside it". |
| 13 | same | every pilot | On each, press Tablet, Phone and Dark. | — | Each rearranges at that width as its drawing does, and in Dark nothing is unreadable. |
| 14 | `https://app.inflozo.com/controls`, then `https://app.inflozo.com/style-guide` | Controls review, Style guide | Open each. | — | The same pages as before, in the new colours: a warm off-white ground and an orange accent. |

**Not in this story, so do not expect them:**
- menus that open with a click, and the header's search and dark-mode buttons;
- a newsletter form's "Sending…" and "Check your inbox" states;
- choosing which posts a feed shows;
- the post header on pages, and several authors in one byline.

Each is in the ledger, with the story that brings it.

If a step shows something different, note its number and what you saw. Those are fixed inside this story (R-80).

## Questions for the owner

**Q1. Which Heroes design should be the fifth sample section?**

The plan picks five sample sections to prove the machinery before the library is built. The Heroes one, "A4 #2",
was picked to test three things:
- a picture from Ghost in several sizes;
- styled text: bold, italic, underline and links;
- the most settings of any design.

On 4 September the designs were renumbered. The design now at #2 is "Flush Left": a headline and buttons on the
left half, with the right half left empty.
- It has no picture.
- Its drawing shows no styled text, and the Heroes field list allows only links inside its text.
- It has five settings, like most designs. The design with the most settings is a post list, A18 #15 Load More,
  with fourteen.

Example: the plan's line reads "A4 #2 — rich text with all four marks, a guarded media binding with srcset, and the
heaviest control set in the library". Today's drawing of A4 #2 is "Issue 48 · The personal page never disappeared.
It went quiet.", a Subscribe and a Browse-the-archive button, and nothing on the right.

1. **Keep Flush Left and correct the reason (RECOMMENDED).**
   - It tests what it has: Heroes' list of up to three figures ("48 issues published"), buttons that know whether
     the visitor is a member, and a second button that greys out while the first is off.
   - The picture in several sizes is still tested, by the Post Grids and Post Headers samples.
   - The plan's line is corrected in the three places it appears.
2. **Switch to Latest Post (A4 #13).**
   - It has the same headline and buttons, beside a card showing your newest post with its picture from Ghost in
     several sizes.
   - It comes closest to the original reasons: a Ghost picture, and eight settings — the most of any Heroes design.
   - It would be the only sample that fetches a post by query.
   - It needs one more piece in this story: a section that always shows exactly one post must not offer a "Show 5"
     setting.
3. **Switch to Split (A4 #3).**
   - Text on the left, and your own uploaded picture on the right.
   - An uploaded picture only gets several sizes in Epic 7, so until then it tests nothing the other samples do not.

**Ruled:** _(awaiting the owner)_

**Q2. Should a list of posts ever show a row of clickable page numbers?**

At the foot of a list of posts, a Ghost theme can show "Newer posts · 5 / 11 · Older posts". One drawing — the
Numbers pagination style, A34 #1 — shows clickable numbers instead: "← 1 2 3 … 11 →".

Ghost gives a theme only four numbers: this page, the total, the page before and the page after. It cannot count or
add, so it cannot draw every number. This was left for you to decide (DW-97), and the Three Up sample is the first
section that has pagination.

Example: on page 5 of 11 today, the foot of the list reads "Newer posts · 5 / 11 · Older posts".

1. **No — keep "Newer posts · 5 / 11 · Older posts" (RECOMMENDED).**
   - It is exactly what Ghost prints, the same on both Ghost versions and on the canvas.
   - The Numbers style is redrawn to this form when its own category is built.
2. **A short row, with no script: "1 … 4 5 6 … 11".**
   - It shows the first page, the pages either side of this one, and the last.
   - Because Ghost cannot add, one case is wrong: two pages before the end, it shows a "…" with nothing hidden
     behind it ("1 … 8 9 10 … 11").
3. **The full row, drawn by a small script.**
   - Every number is clickable while JavaScript runs; the plain "5 / 11" shows when it does not.
   - It needs a new behaviour module, written with the Pagination Styles category.

**Ruled:** _(awaiting the owner)_
