---
title: 'Story 4.10 — The five pilot sections, editor-perfect, with the snapshot harness'
type: 'feature'
created: '2026-09-15'
status: 'in-review'
baseline_commit: '94cf2c5b0d5f0bbf7f2b0ec25ac31f8e59703f38'
owner_test: issues
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Until now every setting, binding and translated phrase built in this epic has been tried only on made-up test
sections; this story builds the first five real sections from the design library — the Rail header, the Three Up
post grid, the Inline Row newsletter sign-up, the Centred post header and the Latest Post hero — each picked because
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
  E6 exit against, are not authored. R-108 made A4 #13 the fifth.
- **Two constructs the pilots need refuse at render** (`core.ts:278-307`):
  - `data-members`, §7.3's exit construct 2. "E4 does not exit until" it is in (`prd.md:577`), and no story owns
    it.
  - `data-if`/`data-else`, gap row 3.
- **Portal's form attributes are not in the vocabulary.** The validator refuses `data-members-email` as an unknown
  directive (`validate.ts:199`), yet Portal submits nothing without it.
- **The Data group offers Show and Order for every declared query** (`controls.ts:247-274`). A hero that always shows
  exactly one post could therefore be set to show five.
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
- **Add a query its design fixes (`fixed`).** It offers no Show and no Order, and a stored value cannot change it
  (R-108).
- **`tools/check-snapshots.mjs`, in `pnpm test`,** does four things for every design:
  - holds its theme output byte-equal to a committed snapshot;
  - runs `checkBindings` over every declared target;
  - renders the canvas at each target;
  - runs its own controls.
- **`/pilots`** is `/controls`' workspace fed the five pilots, with a switcher for light/dark, width, member state,
  feed page and show-to.
- **The reference token set takes the Paper values** the export's kits declare.
- **Recordings on T1 and T3 come first.**

## Boundaries & Constraints

**Always:**
- **Cite or execute** (standing rule 1).
  - Planning read the member shape, the loop's context, self-signup and the form attributes in both exact Ghost
    releases and in Portal.
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
- **`ghostCompat.minVersion`** is at least every `since` the matrix gives a field the design reads.
- **One copy of each thing.**
  - The design list is the directory.
  - A snapshot is derived from its design.
  - No count is written anywhere: the check prints its totals.
- **Member gating is server-side and `{{#if}}` only.**
  - Never `{{#unless}}` and never `{{#has}}` (FR-D16).
  - A member's field is never printed (R-28).
  - `comped` previews as paid.
- **Member asks and the site's flags (R-4).**
  - An ask the markup itself makes — A22 #1's form, A1 #1's actions, whose spec hides both with self-signup off —
    sits inside `data-if="@site.allow_self_signup"`.
  - An authored link whose destination the customer picks is not gated here.
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
  - the Data group's Source ("Which post") and the main-feed designation (5.19);
  - gating a link by its Portal destination (5.20).
- **Anything from Epic 7:** compiling a theme, partial placement (`partials/header.hbs`), assets and `locales/`.
- **Anything from Story 4.11:** pixel baselines and the axe matrix.
- A row of clickable page numbers (R-109).
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
| A fixed query | `"latest": {"source": "posts", "limit": 1, "order": "published_at desc", "fixed": true}`, with stored `data.latest.count = 5` | the Data group has no Show and no Order row for it; `withData` ignores the stored count, so both emitters render one post | refused: `fixed` beside `ids`; `fixed` without both `limit` and `order`; `fixed` that is not `true` |
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
  `validateDataBinding` `:321-349` (R-20's `ids` rule `:326-335` is `fixed`'s pattern), `validateDesignJson` `:377-580`,
  `validateDesign` `:668-691`. `@inflozo/ghost-shim`'s `getQuery` re-runs `validateDataBinding` at emission.
- **`packages/library/src/contexts.ts`** — `bindable`'s condition rule is booleans only (`:173`); the `@member`
  refusal is `:185-187`.
- **`packages/library/src/registry.ts`**
  - `PropDef` `:67-91`, `CategoryContent` (at `designs/{category}/content.json`) `:93-99`, `DataBinding` `:104-112`.
  - `DesignJson` `:115`, with `provisional` `:143`.
  - `parseDesignDir` `:195`, `assembleEntry` `:216-255`.
- **`packages/section-runtime/src/controls.ts`** — `dataRows` `:247-274` skips an `ids` query at `:251`; `withData`
  `:455-474` ignores stored values for one at `:463`. `fixed` takes both paths.
- **`packages/section-runtime/src/core.ts`**
  - `RenderInput` `:116-189`.
  - `RENDERED_DIRECTIVES` `:278-300` and `REFUSED_DIRECTIVES` `:305-307`; `refuseUnrendered` `:470-484`.
  - `isEmpty` (Handlebars' `{{#if}}`) `:328`; `wrapGuard`/`ifOpen`/`guarded` `:437-452`.
  - `ghostPaths` `:539-569` (hand-written: DW-131), `bindingRefusals` `:591-601`, `checkBindings` `:606-620`.
  - `emitBindings` `:628-916`, with the `data-pagination` loop `:813-838`.
  - `applyProps` `:969-1101`, `stampControls` `:1111-1129`.
  - `renderTree` `:1324-1441` — its refusals `:1341-1370`, the stamping `:1379-1382`, the theme's repeats
    `:1387-1432`.
  - `expandRepeats` `:1448-1497`, `renderTheme` `:1502-1514`, `renderCanvas` `:1517-1520`.
- **`packages/section-runtime/src/tokens.ts`** — `REFERENCE_TOKENS` `:69-149` and `referenceTokensCss` `:163-175`.
  `reference-tokens.css` is that function's bytes, held there by `tools/stress/test-vocabulary.mjs:179-184`.
- **Runtime tests** — `agreement.test.ts`: `agree()` `:95`, the partition `:703-728`, the leak check from `:730`.
  Also `ad36.test.ts`, `contexts.test.ts` and `controls.test.ts`.
- **`packages/ghost-shim/src/index.ts`** — `navigationItems` `:388`, `paginationContext` `:422`, `pageUrl` `:440`,
  `isMember` `:479-481`, `bareHelper` `:580`. `contract.test.ts:559-578` asserts the recorded `{{#if @member}}` arm.
- **`packages/library/src/orbit-weekly.ts`**
  - `site()` `:82`, `feedPagination` `:87`, `feedPage` `:96`, `subject` `:108`, `resolveSource` `:248`.
  - `dataset.json`'s `site` carries `logo`, five navigation items, `members_enabled` and `accent_color`.
  - 52 posts at 12 per page. The newest is "The night shift at the Port of Algeciras" (Archive, 7 August 2026, with a
    picture), and three posts have no picture.
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
  - `designs/{category}` `:52-54`, the rendered status `:629-638`, the shim's three `:654-685`, the gap table
    `:843-860`, rows 3–4 `:895-910`.
  - The exit table `:987-993`, the kept attributes `:1102-1116`, §4's refusals `:1122`.
- **Propagation targets**
  - `reconcile-designs-decisions.md` §A27: R-108 and R-109, whose open Targets this story ticks.
  - `ARCHITECTURE-SPINE.md`: AD-35 `:372-376` (its `a4/2`); its tree `:490` says `categories/`, which neither code nor
    the guide uses.
  - `prd.md`: the pilot table `:757-767`.
  - `epics.md`: `:469-481`, and Story 4.10 `:1455-1479`.
  - `build-sequence.md:1268-1269`, which `STEP-6-PROMPT.txt` is generated from.
  - `MEASUREMENTS.md`: §44 `:3185` is the last section.
  - `deferred-work.md`: DW-87 `:2471`, DW-94 `:2663`, DW-96 `:2707`, DW-97 `:2725`, DW-99 `:2774`, DW-104 `:2867`,
    DW-119 `:3148`, DW-121 `:3177`, DW-130 `:3304`, DW-131 `:3319`, DW-133 `:3353`. DW-148 `:3598` is the last entry.

## Tasks & Acceptance

**Execution:**
- [x] **FIRST — record on T1 and T3.** Files: `tools/probe/theme-shim/` (`index.hbs`, a new `partials/probe-card.hbs`),
  `tools/probe/record-shim.py`, `packages/ghost-shim/fixtures/ghost{5,6}/`, `packages/ghost-shim/src/contract.test.ts`.
  - Add these rows:
    - `{{#foreach posts limit="2"}}{{> "probe-card"}}{{/foreach}}`, the card printing `{{title}}` and `{{@first}}`;
    - `{{#foreach @site.navigation}}{{label}}={{url}};{{/foreach}}`;
    - `{{#if @member.paid}}…{{else}}…{{/if}}`, signed out;
    - `{{#if @site.logo}}…{{else}}…{{/if}}`;
    - `{{#if @site.allow_self_signup}}…{{/if}}`;
    - `{{#get "posts" limit="1" order="published_at desc"}}{{#foreach posts}}{{title}}{{/foreach}}{{/get}}`.
  - The contract test asserts the shim's side of each row. The signed-in arms stay cited, not recorded (Ask First).
  - Why first: AD-23.
- [x] `packages/library/src/vocabulary.ts`, `registry.ts`, `validate.ts`, `validate.test.ts`:
  - `data-members-email` and `data-members-error` become valueless `emitted` directives.
  - Every directive that carries a Ghost path gets a `ghostPath` flag (DW-131).
  - `data-else`'s summary names its pairing rule.
  - `DataBinding.fixed?: true`, refused by `validateDataBinding` as the matrix row says.
  - One firing test per new refusal.
- [x] `packages/section-runtime/src/core.ts`, `controls.ts`, `index.ts`:
  - `RenderInput.member` (`anonymous` · `free` · `paid`, default `anonymous`) and `visibility` (the four
    `MEMBER_STATES`, default `everyone`).
  - `data-members` and `data-if`/`data-else` join `RENDERED_DIRECTIVES` and render as the matrix says.
  - A condition's path is legal where `bindable` allows it as a `condition` or as a `value`. So `@member`, an
    object and a helper stay refused, and `bindable` itself is unchanged.
  - `ghostPaths` reads every flagged directive.
  - A `fixed` query takes `ids`' two paths in `dataRows` and `withData`.
- [x] `agreement.test.ts`, `ad36.test.ts`, `contexts.test.ts`, `controls.test.ts`:
  - `agree()` rows for each member state, show-to, both arms, a list, a number, and the form attributes;
  - the leak fixture and the partition;
  - a vector for each new value grammar;
  - a test that every `ghostPath` directive is walked;
  - the fixed query's sidebar and fold.
- [x] `packages/section-runtime/src/tokens.ts`, `reference-tokens.css`:
  - every row the Paper objects name takes their light and dark values;
  - every other row keeps today's value;
  - `tokens.test.ts` and the drift check stay green.
- [x] `packages/library/designs/{a1,a17,a22,a24,a4}/content.json` and `{n}/{index.html,style.css,design.json}`:
  - the five pilots, built as Design Notes' table says;
  - each validates with its control values (DW-119), and each stylesheet passes `pnpm lint`.
- [x] `tools/check-snapshots.mjs`, `packages/library/snapshots/{category}/{n}/`, `package.json`, `tools/doc-audit.py`:
  - **For every design directory, at every `compileTarget`:**
    - validate and assemble;
    - `checkBindings` returns `[]` (DW-130);
    - `renderCanvas` does not throw, with `getRows` from Orbit Weekly for each declared query;
    - `renderTheme`, with content and control defaults, equals the committed `template.hbs` and `partials/*.hbs`.
  - **The controls sample** renders through both emitters at each of its targets (DW-121).
  - **The matrix's *control* rows** run on every run.
  - **Output:** the check prints its totals, and `--update` rewrites the snapshots.
  - Append it last to `test`, with a doc-audit row.
- [x] `apps/web/app/(app)/app/(authed)/pilots/{page.tsx,review.tsx,frame/route.ts}`, `apps/web/lib/pilots.ts`,
  `apps/web/pilots.test.ts`, `next.config.ts`, `busy.test.ts`, `tools/probe/run-verify-pilots.cjs`:
  - `/controls`' workspace, fed the five pilots.
  - **The switcher, in the canvas chrome:**
    - pilot;
    - Light · Dark, as `data-mode` on the canvas `<html>`;
    - Desktop 1440 · Tablet 834 · Phone 390 — the canvas at that width, scaled to fit;
    - View as Signed out · Free · Paid;
    - Page (First · Middle · Last · Empty) on A17 #1, and Show to on A22 #1 and A4 #13, whose frames draw it.
  - Orbit Weekly feeds the canvas; A4 #13's card comes from `resolveSource`. Each module mount gets `js-enabled` and
    no script.
  - The tests copy `controls.test.ts`. The harness copies `run-verify-controls.cjs` and gets a doc-audit row.
- [x] `docs/section-authoring.md`:
  - rows 3 and 4 as rendered: the emitted forms, and the pairing and nesting refusals;
  - the condition kinds; `member` and `visibility`; the two Portal attributes;
  - `fixed`; R-109 in the shim's three;
  - where designs and snapshots live, and what `provisional` means.
- [x] **Propagate** (standing rule 3):
  - **R-108** — replace the fifth pilot with Design Notes' wording in:
    - `prd.md` §8's row;
    - `epics.md` `:480`, and Story 4.10's criteria `:1469-1470`;
    - AD-35's `a4/2`;
    - `build-sequence.md:1268-1269`, then regenerate.
  - **R-109** — the `numbers` comment in `core.ts:813-817`.
  - **`reconcile-designs-decisions.md`:** tick R-108's and R-109's Targets.
  - **`epic-4-context.md`:** sub-bullets.
  - **The spine:** the tree (`designs/{category}/content.json`, `snapshots/`), and an AD-35 note that E7's formatting
    re-baselines a snapshot once more (Story 7.1).
  - **`MEASUREMENTS.md`:** §45.
  - **`deferred-work.md`:**
    - close DW-94 (`BASES` stays: a snapshot is generated output), DW-97 (R-109), DW-119, DW-121, DW-130 and DW-131;
    - re-own DW-96, DW-99 and DW-104;
    - amend DW-87 and DW-133;
    - add an entry for A34's category story (redraw A34 #1 Numbers to the indicator, R-109);
    - add one entry per pilot's "Left" cell.
  - Then grep live documents — never the export, never a `record` — for `categories/{a1`, `a4/2`, `A4 #2`,
    "heaviest control set" and `Split Editorial`.

**Acceptance Criteria:**
- Given each pilot on `/pilots`, when it is shown at each drawn width in light and dark, then **it matches its
  frame** — the artboards Design Notes' table names. It matches in structure, arrangement, type scale, spacing
  ladder and states, in the reference token set's colours (R-74).
- Given A1 #1 and A22 #1, when View as moves through Signed out, Free and Paid, then:
  - the member-aware parts change as their frames draw them;
  - a Show to that excludes the viewer removes A22 #1, or A4 #13, entirely (FR-D16, R-4).
- Given A4 #13 on `/pilots`, when it is opened and its panel read, then:
  - its card is Orbit Weekly's newest post, with a sized picture;
  - the settings panel offers no number of posts;
  - a post with no picture shows its title in the card's place (R-108).
- Given the repository, when `pnpm check` runs on Node 24, then:
  - `check-snapshots: PASS` prints its totals;
  - every matrix row holds;
  - each control fails when its subject is broken (NFR-6(c1), FR-H7, FR-H8).
- Given the recorder, when it runs on T1 and then on T3, then:
  - both fixtures carry every new row;
  - the contract test passes;
  - the previous theme is active again and the probe theme is gone (standing rules 1 and 2).
- Given the Dev's tree, when `pnpm build`, the gscan harness and `python3 tools/doc-audit.py --check` (twice) run, then:
  - all are green;
  - `/controls` and `/style-guide` render unchanged apart from their colours.

### Review Findings

*(Code review, 2026-09-15, five layers: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier. 47 raw findings; 26 dismissed as noise or already handled.)*

- [x] [Review][Decision] Light `--link-color` is the accent at 3.24:1 on the page ground — the same ratio R-110 rejected for button words. No pilot reads it yet. Asked as Q5; ruled option 1 as R-112 and applied.
- [x] [Review][Patch] Rail's Account link sat inside the self-signup gate, so a signed-in member of an invite-only site lost it; `A1 Headers - Spec.md:79` hides Sign in and Subscribe only [packages/library/designs/a1/1/index.html:19]
- [x] [Review][Patch] Every pilot's authoring comment shipped into `template.hbs` — internal story numbers and file names in a visitor's page source [packages/library/designs/*/*/index.html:1]
- [x] [Review][Patch] A24 #1 on the contrast ground: tag and author hover/focus kept the base ink, ink on ink [packages/library/designs/a24/1/style.css:77]
- [x] [Review][Patch] The canvas arms on `@site` were held by "does not throw" only — drop `allow_self_signup` from the dataset and every check stays green while Rail's asks and Inline Row's form vanish [tools/check-snapshots.mjs]
- [x] [Review][Patch] `--update` with a failed design wiped its committed snapshot and rewrote only the passing ones [tools/check-snapshots.mjs]
- [x] [Review][Patch] The AC names FR-H8 among the controls, and the A4 row asserted a srcset without its guard [tools/check-snapshots.mjs]
- [x] [Review][Patch] A non-numeric directory under a category was `Number()`-sorted to NaN and `pilot()` threw a raw ENOENT [apps/web/lib/pilots.ts:27, tools/check-snapshots.mjs]
- [x] [Review][Patch] `pilotRows` said "at the Count's ceiling" and resolved at the declared limit (15), unlike `controls-review.ts`'s 100 [apps/web/lib/pilots.ts:54]
- [x] [Review][Patch] A control change while the section was gated away stamped nothing and drew nothing until the next chrome switch [apps/web/app/(app)/app/(authed)/pilots/review.tsx:163]
- [x] [Review][Patch] The harness launched the browser before `try`, so a launch failure left the throwaway account; `OUT_DIR` unset wrote to `undefined/`; Latest Post's Show to was never read back [tools/probe/run-verify-pilots.cjs]
- [x] [Review][Patch] The `contexts.test.ts` loosening for `navigation.url` counted any helper-kind field as proved by printing anything; now only one whose matrix entry carries the recorded note [packages/library/src/contexts.test.ts:93]
- [x] [Review][Patch] `WALKED_GHOST_PATH_DIRECTIVES`' comment said "derived"; it is written and held by a test [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] Guide: the one-guard rule holds per element, not library-wide; `fixed` beside `filter`; the `<noscript>` row now says the pilot ships without one; the check's one-snapshot rule depends on `data-target` staying refused [docs/section-authoring.md, tools/check-snapshots.mjs]
- [x] [Review][Patch] MEASUREMENTS §45(e): the LOGO arm and the self-signup-off arm were never printed by Ghost, and the contract test cannot tell [MEASUREMENTS.md §45]
- [x] [Review][Patch] The Verification results predate R-110 (75/90 axe canvases); the review re-ran everything on HEAD's deployment — below. The Design Notes table carried A1's panel in the spec's order, not the frame's; owner test steps 13 and 14 amended
- [x] [Review][Defer] Rail's "Divider under: Shadow" draws nothing in Dark — Paper's dark object declares no shadow [packages/library/designs/a1/1/style.css] — deferred, DW-150
- [x] [Review][Defer] Token rows derived from the retired ink and accent that no Paper object names (`--border-fade`, `--scrim`, `--accent-on-contrast`) [packages/section-runtime/src/tokens.ts] — deferred, DW-155
- [x] [Review][Defer] An HTML comment in a design's markup ships to every visitor; the emitter keeps comments [packages/section-runtime/src/core.ts] — deferred, DW-159 (Story 7.1)
- [x] [Review][Defer] A4 #13's secondary action defaults to `https://orbit-weekly.example/tag/archive/` [packages/library/designs/a4/content.json] — deferred, DW-160 (Epic 5's Link Picker)
- [x] [Review][Defer] `data-members-email` / `-error` are not checked to sit inside a `data-members-form` [packages/library/src/validate.ts] — deferred, DW-161
- [x] [Review][Defer] The frame route's session guard is a source-text test, as `controls/frame` and `style-guide/frame` are [apps/web/pilots.test.ts:15] — deferred, pre-existing, DW-162

## Spec Change Log

- **2026-09-15, Dev — the recording disagreed with one Design Notes fact (Ask First, flagged for the review).** The
  matrix row "`@site.navigation` repeats with `label` and `url`" is what `bindable` said, but T1 and T3 printed `/` for
  every item from `{{#foreach @site.navigation}}{{url}}{{/foreach}}`: a bare `url` there is Ghost's url helper
  (`PILOT|nav_items`, MEASUREMENTS §45). Building A1 #1's nav as that repeat would ship every nav link to the site
  root, so the Dev run took the one rendered form that is already recorded — `data-helper="navigation"`, Ghost's own
  `<ul class="nav">`, folded to More in CSS — and typed `navigation.url` as `helper` in `matrix.json` with the
  recording as its note (the order of authority puts recordings above the matrix's prose). The pilot row's "a repeat
  over `@site.navigation`" is therefore `{{navigation}}` twice (inline and inside More); the case it is in the set for —
  a site-wide singleton binding on `default.hbs` — is unchanged. The owner's review of this is outstanding.
- **2026-09-15, Dev — "Three lines greyed at Four" (A17 #1) cannot be drawn by `disabledBy`**, which greys a whole
  control; a per-value dependency is a registry field this spec does not name (Ask First). The stylesheet clamps Three
  lines to two at Four; the panel shows no grey. Owner test step 8 is amended to what ships; DW-151 carries it with
  A22's identical "Display greyed at Wide".
- **2026-09-15, Dev — owner test step 6 said six cards**; Orbit Weekly pages at 12, so the first page shows twelve, and
  step 6 now says so. **Step 14** carries Rail's dark-ground logo caveat (DW-150), as it already carried Latest Post's.
- **2026-09-15, Dev — additions the Tasks implied and did not name**, each routine: `orbitWeekly.templateContext(target,
  feed)` is the one Orbit Weekly context the snapshot check and `/pilots` both render against; `dataset.json`'s `site`
  gains `allow_self_signup: true` (Ghost's key, which the pilots read); the runtime also refuses `data-members` on a
  `data-if`/`data-else` element and either arm of a pair on `data-repeat`/`data-items` (both would nest the `{{#if}}`
  wrongly); the reference design fixture carries the two Portal attributes (its every-directive check). The reference
  token rows Paper's objects name include the button fill and link colour (both today's accent) and the button radius
  (the kit's `r`); `--site-width` and the gutter are not named, keep their values, and are DW-155.
- **2026-09-15, Dev — R-110 (Q3, option 1):** light `--text-on-accent` is the ink `#232019` in `tokens.ts` and
  `reference-tokens.css`; DW-158 closed. Q4 was rewritten after the owner's reply that menus must keep dropdowns: it now
  asks which menu form the Headers story builds dropdowns on, with Ghost's theme-level `partials/navigation.hbs` read
  in source for both releases.
- **2026-09-15, Dev — R-111 (Q4, option 1):** A1 #1 keeps Ghost's `{{navigation}}` as built; Story 9.1 (the first
  Headers story) builds both dropdown sources on Inflozo's own `partials/navigation.hbs`, recorded on T1 and T3 first,
  and never on Ghost's default menu markup. Carried to `epics.md` Story 9.1 and DW-150.
- **2026-09-15, Review — the patches under Review Findings.** Two change what a pilot renders: Rail's Account link
  now sits outside the self-signup gate (the spec's own table put it inside; `A1 Headers - Spec.md:79` names Sign in
  and Subscribe only), and the five authoring comments are gone from the markup, so the snapshots were rewritten by
  `--update` and re-held. One new check row holds the member arms on the canvas by their text, with self-signup off
  as its control. The propagation grep's one live survivor, `ARCHITECTURE-SPINE.md`'s "`a4/2` is Heroes #2" (a
  design-identity example, still true), is left as it is. The AC "unchanged apart from their colours" reads: apart
  from Paper's values — the two fonts, the radii and the shadow changed with the palette, all named by Paper's objects.
  Q5 (the link colour) is open.
- **2026-09-15, Review — R-112 (Q5, option 1):** Light links are ink words with the accent underline, in `tokens.ts`
  and `reference-tokens.css`; Dark keeps the accent as words. `/style-guide`'s links and the controls sample's
  `.cx__link` read the two tokens and change with them; no pilot does.

## Design Notes

**The five pilots.**
- Each directory holds `index.html`, `style.css` and `design.json` (`provisional: true`).
- The category's `content.json` holds only the props the pilot draws; its category story widens it to the union
  (R-102).
- **Built here** is what the vocabulary expresses. **Left** names the owner, and becomes one ledger entry per pilot.
- A Background narrowing reuses the sentence the controls sample already carries ("This design is drawn for plain
  grounds, so accent and image are not offered."), except where a row says otherwise.

| Pilot · targets · frame | Case | Built here | Left, and its owner |
|---|---|---|---|
| **A1 #1 Rail** `designs/a1/1` · `default.hbs` · `A1-1 Rail.dc.html` desktop `:27-51`, shrink `:54-72`, dark `:103-125`, tablet `:127-150`, phone `:154-171`, panel `:193-227` · proof `A1-0 Category Proof.dc.html` · spec `A1 Headers - Spec.md` §0 `:13-192`, #1 `:193-231` | the site-wide singleton binding | **Brand:** `data-if="@site.logo"`, else the `@site.title` wordmark. **Nav:** a repeat over `@site.navigation`, folded in CSS (stepper 3–6), with a native `<details>` More (`nav.more`). **Actions,** inside `data-if="@site.allow_self_signup"` (the spec's Part A·A9, `:79`): Sign in for `anonymous`; Account for `free` and for `paid` (Portal `signin`, `account`); Subscribe for `anonymous` (`member.signup_cta`). **Phone:** the menu button (`a11y.open_menu`) at ≤767, with `nav-drawer` declared. **Controls,** in the drawn panel's order: On scroll · Nav position · Sign in · Subscribe · Divider under · Nav items before More. **Background:** base · surface, "An inverted header is a design of its own, Contrast Band, not a setting." (`:36`) | **A1's category story:** authored nav children and dropdown panels; Fit to width; the Search control and trigger (no artboard draws one); the dark-mode toggle (no key); `<h1>` on the home page only; an authored logo; the skip link (E7's layout owns `<main>`); the current-page underline (`@site.navigation` has no `current`); Shrink's motion |
| **A17 #1 Three Up** `designs/a17/1` · `home.hbs` · `index.hbs` · `tag.hbs` · `author.hbs` · `A17-1 Three Up.dc.html` desktop `:28-48`, per row `:57`, states `:93`, panel `:132-146`, tablet `:161`, phone `:203-222`, dark `:227` · proof `A17-0 Category Proof.dc.html` `:283`, `:367-446` · spec `A17 Post Grids - Spec.md` §0 `:35-366`, #1 `:374-405` | the paginated context, and `post-card` with no params | **The feed:** `data-repeat="posts" data-partial="post-card"`. **The card:** link; feature image `\|img_url:m` with `data-bind-srcset` and `sizes`; a tag plate behind the image for a post without one; tag, title, `excerpt`; meta — photo `\|img_url:xs` with the stylesheet's one letter, name, date, `reading_time`. **Around it:** the pager — Newer (`pagination.newer`), the `numbers` indicator and Older (`pagination.older`), per R-109; the empty-state arm (`data-if="posts"` with `data-else`, `archive.empty_heading` and `archive.empty_body`); head and foot props. **Controls:** Per row · Image ratio · Excerpt (Three lines greyed at Four) · Meta · First cell · Tag. **Background:** base · surface · contrast | **Story 5.19:** Source, Count and the main-feed designation. **A34's category story:** the Pagination style select. **A17's category story:** "View all: Matches the query". **DW-107:** Image focus |
| **A22 #1 Inline Row** `designs/a22/1` · `home.hbs` · `page.hbs` · `post.hbs` (spec `:85-87`) · `A22-1 Inline Row.dc.html` desktop `:28-32`, states `:34-52`, panel `:54-73`, widths `:75-83`, dark `:85-91` · proof `A22-0 Category Proof.dc.html` `:119-122` · spec `A22 Newsletter - Spec.md` §0 `:81-483`, #1 `:493-557` | `@member` gating, show-to, Portal | **Head:** props. **For `anonymous`,** inside `data-if="@site.allow_self_signup"`, the form: `data-members-form="subscribe"`, `data-members-email`, the button (`member.signup_cta`), the note, `data-members-error`, with `member-form` declared. **For `free` and for `paid`:** "Signed in" (R-4) and a Portal `account` link. **The whole section** sits inside `data-if="@site.members_enabled"` — the drawn "Hide the section". **Controls,** in the drawn Quick Controls' order: Alignment · Heading size · Field width · Blurb · Below the field · Social proof (`{members}`). **Background:** base · surface · contrast | **A22's category story:** Submitting, Done and Invalid, and their words; the name field and the newsletter choice; the paid count (DW-99); the other members-off option; Display greyed at Wide (one value, which `disabledBy` cannot grey); the no-JavaScript notice (R-5's key) |
| **A24 #1 Centred** `designs/a24/1` · `post.hbs` · `A24-1 Centred.dc.html` desktop `:30-46`, absences `:53-77`, states `:83-104`, panel `:116-145`, widths `:153-190`, dark `:211` · proof `A24-0 Category Proof.dc.html` `:94`, `:179-298` · spec `A24 Post Headers - Spec.md` Post block `:247-298`, fields `:351-389`, #1 `:390-436` | the wrapper context | **The header:** tag link; `<h1>` title; standfirst `excerpt`; a byline over `primary_author` (photo, name, date, `reading_time`); a figure with `feature_image`, srcset and `feature_image_caption` as text. **Controls:** Alignment · Title size · Standfirst lines · Image ratio · Rule, plus the post block's Tag line · Meta · Standfirst · Feature image · Avatar · Caption as Style rows. **Background:** base · surface · contrast | **A24's category story, with E7's page wrapper:** `page.hbs` and `@page.show_title_and_feature_image`; all tags, and several authors with "and"/"and others" (R-3's key); the updated-date Meta value; the caption's links; the "Post block" group name. **DW-107:** Image focus |
| **A4 #13 Latest Post** (R-108) `designs/a4/13` · `home.hbs` (proof `:57`) · `A4-13 Latest Post.dc.html` desktop `:30-56`, the card at rest/hover/focus `:61-79`, data states `:83-103`, dark `:110-134`, tablet `:139-165`, phone `:169-189`, a11y `:216-234`, panel `:240-258` · proof `A4-0 Category Proof.dc.html` `:55`, `:57`, roster `:274-275`, fields `:300-365` · spec `A4 Heroes - Spec.md` §0 `:27-88`, #3's geometry `:182-224`, #13 `:623-671` | a hero's authored text beside a `{{#get}}` card — a guarded media binding with `srcset`, a query fixed at one post, and the most settings of any hero | **Text:** eyebrow; the `<h1>` headline; sub (links only, as the field list at `A4-0:327` allows). **Actions:** primary and secondary, each a label with a Link Picker url. **The card:** `data-repeat="latest"` over `{source: posts, limit: 1, order: published_at desc, fixed: true}`; one link wraps the picture (`feature_image\|img_url:l`, `data-bind-srcset`, `sizes`, `alt=""`, explicit dimensions), the `<h2>` title (two lines) and the meta row (`primary_tag.name` as text · a `<time>` over `published_at\|date:D MMMM YYYY`); a hover-surface panel carries the title for a post with no picture; the column closes up when nothing is published. **Controls,** in the drawn panel's order: Card side · Show tag · Show date · Headline size · Primary action · Secondary action (greyed while Primary is off, "A secondary action needs a primary beside it."). **Background:** base · surface · contrast | **Story 5.19:** Which post. **Story 5.4:** Member visibility. **Story 5.20:** gating an action whose destination is a Portal ask. **A4's category story:** Card style's Title and date and its "Latest" label (no key); the members-only marker (a match on `visibility`, which no directive expresses); the fall-back picture when nothing is published; the short date on phones; which marks rule holds (`A4 Heroes - Spec.md:61` against `A4-0:327`) |

**R-108's wording, for the Dev to carry into `prd.md` §8 and `epics.md`:**
- **§8's row.** "**A4 #13 Latest Post** (Heroes) | Authored text beside live data: a hero's headline and actions beside
  a `{{#get}}` card whose feature image is a guarded media binding with `srcset` (FR-H8), a query that always shows
  exactly one post, and the most settings of any Heroes design".
- **Story 4.10's criterion.** "A4 #13 a hero's authored text beside a `{{#get}}` card whose feature image is a
  guarded media binding with `srcset`, with a query fixed at one post and the most settings of any hero".

**What Ghost does**, read in both exact releases — npm `ghost@5.130.6` and `ghost@6.58.0`.
- Portal is read at `2.51.5` and `2.69.339`, which `core/shared/config/defaults.json` pins as `~2.51` and `~2.69`.
- The Dev records the rows it can on T1 and T3.

| Fact | Where | What follows |
|---|---|---|
| `@member` is `null` signed out, and `paid` is `status !== 'free'` | `core/frontend/services/theme-engine/middleware/update-local-template-options.js:25-37` (5) and `:27-39` (6); R-4 cites the same | `anonymous` is the `{{else}}` of `{{#if @member}}`; `free` and `paid` split on `@member.paid`; `comped` is paid |
| `allow_self_signup` is `members_signup_access === 'all'`, and members are enabled when it is not `'none'` | `core/server/services/settings-helpers/SettingsHelpers.js:22-32` (5) and `settings-helpers.js:22-32` (6) | self-signup implies members, so one `data-if` gates an ask; an invite-only site shows no ask |
| `{{#foreach}}` calls `fn(items[field], {data, blockParams})` | `core/frontend/helpers/foreach.js:88-91`, the same in both | a `{{> "post-card"}}` with no params renders against the row |
| Executed under Handlebars 4.7.9 (2026-09-15): a no-param partial inside a loop printed each row's `title` and `@first`, and the root's `@site.title`; at the root it printed the root's `title` | a scratch script, with Ghost's `foreach` call shape | the case A17 #1 is in the set for holds |
| Portal submits `input[data-members-email]`'s value; it also reads `data-members-name`, `-label` and `-newsletter`, and writes `data-members-error` | `@tryghost/portal` 2.69.339 and 2.51.5, `umd/portal.min.js`; Ghost 5's own signup card, `core/server/services/koenig/node-renderers/signup-renderer.js:19-31` | the email input must carry the attribute, or the form submits nothing |
| `{{#match a ">" b}}` compares numbers, and `{{page_url n}}` takes a page number | `core/frontend/helpers/match.js:45-59` (5) and `:47-61` (6); `helpers/page_url.js:11-16` | a short row of numbers is buildable but inexact with no arithmetic; R-109 declined it and the indicator stays |
| The matrix (executed 2026-09-15): `@site.navigation` repeats with `label` and `url`; `@site.logo` binds but is refused as a condition; `@site.members_enabled` and `allow_self_signup` are conditions; `title` is refused at the top of `index.hbs` | `bindable` | why a condition also accepts a value's use, and where the wrapper control comes from |

**Why `data-if` accepts a value and not only a boolean.**
- Handlebars' `{{#if}}` tests truthiness (`core.ts:328`).
- The guide's own row 3 example tests `custom_excerpt`, a text, and A1 #1's logo is an `image`.
- `bindable`'s boolean rule is Epic 5's *offer*, and it stays. The directive accepts a path that is legal as a
  condition or as a value.

**Why `fixed` is a flag on the query and not a note in the panel.**
- A stored count could otherwise arrive from another design's same-named key when Story 5.11 shuffles back.
- So the fold must refuse it, exactly as it already refuses one for a hand-picked `ids` query.
- The panel then has nothing to draw, and the Data group stays absent until Story 5.19 adds Which post.

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
- **Gating an authored action.** A4's rule gates an action only "where the destination is a Portal action"
  (`A4 Heroes - Spec.md:59`). That depends on what the customer picks, so it is Story 5.20's (FR-H6). A1's spec hides
  its member actions whatever they point at (`:79`), so the pilot gates them in markup.
- **"Edit-safe".** The export uses it to mean "does not run while editing" (`A1 Headers - Spec.md:185`); the
  registry means the opposite. The registry's values stand, and DW-133 is amended.
- **Where `content.json` lives.** The spine's tree puts it in `categories/`, but the code and the guide use
  `designs/{category}/`. The spine is corrected.
- **DW-121's owner.** It names "Story 4.10 (the render matrix)", but the matrix is Story 4.11. The check closes
  DW-121's substance here.

## Verification

**Commands:**
- `pnpm install --frozen-lockfile && pnpm check` (Node 24) -- expected: exit 0. `check-snapshots: PASS` prints its
  totals; the agreement, AD-36, contract, controls and validate suites are green.
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

**Results (Dev, 2026-09-15):**
- `pnpm check` on Node 24.18.1 — exit 0. `check-snapshots: PASS — 5 designs at 10 targets match 6 committed snapshot
  files`, after its six controls each failed on its broken subject in the check's own output: one class changed (named
  `template.hbs` and its first differing line), a missing snapshot, an orphan snapshot, a `title` binding added to A1 #1
  at `default.hbs`, A24 #1 at `index.hbs` (FR-H7 naming `title`) and A17 #1 at `post.hbs` (R-7). The subject rows: each
  pilot validated, `checkBindings` `[]` at every target, both emitters rendered, one theme text per design; the
  controls sample on both emitters at its three targets; A17 #1's `{{#foreach posts}}{{> "post-card"}}` with 12 cards
  for 12 rows and its four feed pages; A4 #13's newest post with a srcset, its picture-less title panel, its empty
  column and a stored count of 5 ignored. `--update` rewrote the snapshots and the next run passed. The agreement,
  AD-36, contexts, controls, contract, validate and tokens suites are green; `test-vocabulary.mjs`, `check-baseline`
  and `check-catalog` pass.
- `pnpm build` — exit 0, `/app/pilots` and `/app/pilots/frame` built.
- `cd tools/stress && npm install && node build.js && node gate.js theme` — gscan 4.49.7 and 6.4.2: 0 errors / 0
  warnings each (the harness's `{{{body}}}` note is the layout's own, unchanged).
- Each pilot was also rendered by the Dev run at 1440, 834 and 390 in light and dark, per visitor and feed state, and
  compared by eye with its frame's artboards; the known differences are DW-150–DW-156.

**Real infrastructure (R-82), what each returned:**
- **T1 `ghost6.inflozo.com` (6.58) and T3 `ghost5.inflozo.com` (5.130)** — `python3 tools/probe/record-shim.py`: the
  `PILOT` rows of MEASUREMENTS §45 on both. The no-param partial printed each row's title with `@first` true then false,
  on page 1 and page 2; `{{#if @member.paid}}` signed out → `NOT_PAID`; `{{#if @site.logo}}` → `NO_LOGO` (no logo on
  either box); `{{#if @site.allow_self_signup}}` → `ASK`; the one-post `{{#get}}` → the feed's first title. **One row
  disagreed with Design Notes:** `{{url}}` in the navigation loop printed `/` for every item (Spec Change Log). The
  recorder restored `casper` and deleted the probe theme on both, read back; a separate read-only `GET themes/` on each
  afterwards returned `casper` active and no `inflozo-probe-shim`. The one reused image was reused (no upload).
- **GitHub Actions** — run 34922654013 for `bb248842`: `check`, `rls` and `deploy` all success; the `check` log prints
  `check-snapshots: PASS — 5 designs at 10 targets match 6 committed snapshot files`.
- **Vercel** — production `dpl_9VY1wiqTamqa3858spkh1HoCAPtJ` for `bb248842`: READY.
- **The deployed `/pilots`** — `node tools/probe/run-verify-pilots.cjs` with a throwaway account (users 9 → 9 after
  the delete): the switcher listed Rail · Three Up · Inline Row · Centred · Latest Post off the directory; noindex;
  the axe positive control reported `image-alt`; every pilot × Light and Dark × 1440/834/390 × each View as was
  screenshotted, and axe found zero violations in 75 of the 90 canvases. **The 15 failures are one finding:**
  `color-contrast`, white on Paper's `#D96C3F` at 3.4:1 on the main button of Rail (Signed out), Inline Row (Signed
  out) and Latest Post (every visitor), in Light only — Q3 and DW-158. Read back: Rail signed out shows Sign in and
  Subscribe, at Free and Paid Account and no Subscribe; Three Up's First/Middle/Last pages show Newer and Older as
  step 7 says and Empty shows "Nothing here yet"; Inline Row with Show to Paid, signed out, renders nothing; Latest
  Post's card is "The night shift at the Port of Algeciras" and its panel has no Data group and no Show row. The
  screenshots showed the iframe kept its tallest height when a shorter pilot was chosen (it measured the document,
  which never shrinks below the iframe); `review.tsx` now measures the section, in the follow-up Dev commit. The
  harness's first run misread "Show tag" as a Show row; the check now matches the row label exactly.
- Supabase: no migration and nothing read yet; the harness's throwaway user is the only write. Resend and Dodo are not
  touched.

**Results (Review, 2026-09-15, on HEAD `9ccccb84` before the review's patches):**
- **T1 and T3** — a read-only `GET /ghost/api/admin/themes/` with a JWT from `GHOST6_STAFF_ACCESS_TOKEN` and
  `GHOST5_STAFF_ACCESS_TOKEN`: 200 on both, `casper` active, no `inflozo-probe-shim`. Control: the same `kid` with a
  wrong secret → 401 on both. `pnpm --filter @inflozo/ghost-shim test`: 34 pass, the six PILOT rows included.
- **GitHub Actions** — run 34926262805 for `9ccccb84`: `check` and `rls` success, the `check` log prints
  `check-snapshots: PASS — 5 designs at 10 targets match 6 committed snapshot files`; `deploy` in progress at the
  read. Every main run since `94cf2c5b` is success.
- **Vercel** — production `dpl_C4hm3S9KAtydBs2xdocxtWyPWfe9` for `9ccccb84`: READY.
- **The deployed `/pilots`** — `node tools/probe/run-verify-pilots.cjs` with `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
  (DNS confirmed through 1.1.1.1): **107 PASS, 0 FAIL**; the axe positive control reported `image-alt`, and **axe found
  zero violations in 90 of 90 canvases** — R-110's ink on the orange removed the 15 `color-contrast` failures the Dev
  results above record. Every owner-test row the harness reads back held. Users 9 → 9 after the delete.
- **`pnpm check`** on Node 24.18.1 after the patches: exit 0, with the new member-arms row and the FR-H8 assertion.
- Supabase: no migration (`git diff 94cf2c5b HEAD -- supabase/` is empty), so R-99 has nothing to apply. Resend and
  Dodo are not touched.

**Results (Deploy, 2026-09-15):**
- **GitHub Actions** — run 34927999071 for `02b31605` (HEAD, R-112's patch): `check`, `rls` and `deploy` all
  success; the `check` log prints `check-snapshots: PASS — 5 designs at 10 targets match 6 committed snapshot
  files`.
- **Deployment:** `dpl_84Zh7oJSfJ2THvCCh5b4uMdg7sDS`, production, READY, for `02b31605`.
- No schema change on this story (confirmed above), so nothing further to apply by hand.

## Owner's manual test

These steps follow the rulings R-108 and R-109.
- **Where:** the app is at `app.inflozo.com`. This page is internal: nothing links to it, search engines are told
  to ignore it, and nothing on it is saved.
- **Which deployment:** Deploy records it under "## Verification".
- **What to compare:** the pictures and words come from Orbit Weekly, the sample publication, so they differ from
  the drawings. The arrangement, the sizes and the states are what should match.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|-----------|------------|---------------------|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in as you normally do. | — | Your dashboard. |
| 2 | `https://app.inflozo.com/pilots` | Pilots review | Type the address. | — | **Above the canvas:** Rail · Three Up · Inline Row · Centred · Latest Post, then Light/Dark, Desktop/Tablet/Phone and View as. **The canvas:** Rail, at Desktop and Light — the Orbit Weekly logo at the left, four menu items and "More" beside it, "Sign in" and an orange "Subscribe" at the right, and a thin line under the bar. **To the right:** the settings panel. |
| 3 | same | Rail | Press View as → Free, then Paid, then Signed out. | — | At Free and Paid, "Sign in" becomes "Account" and "Subscribe" disappears. At Signed out both return. |
| 4 | same | Rail, panel | Set Nav items before More to 3, then Divider under to Shadow. | — | "More" now holds one more menu item, and the line under the bar becomes a soft shadow. |
| 5 | same | Rail | Press Phone, then Dark. | — | The menu folds into a menu button while "Subscribe" stays in the bar; then the bar turns dark with light text. |
| 6 | same | Three Up | Press Three Up, Desktop, Light. | — | **Top:** a heading. **Cards:** twelve post cards (one page of Orbit Weekly's feed) in three columns, each with a picture, a tag, a title, a short excerpt, and the writer's photo, name, date and reading time. **Below:** "1 / 5" and "Older posts" — no "Newer posts" on the first page. |
| 7 | same | Three Up | Press Page → Middle, then Last, then Empty. | — | **Middle:** "Newer posts", "3 / 5" and "Older posts". **Last:** no "Older posts". **Empty:** "Nothing here yet" and a sentence, where the cards were. |
| 8 | same | Three Up, panel | Set Per row to Four, then look at the cards' excerpts. | — | Four columns, and an excerpt set to Three lines shows two lines at Four. ("Three lines" is not yet drawn grey in the panel — the settings engine can grey a whole setting but not one choice inside it; that arrives with the Post Grids category.) |
| 9 | same | Inline Row | Press Inline Row, then View as → Free. | — | **First:** a centred heading, a sentence, an email box beside a "Subscribe" button, and a short note. **At Free:** the box and the button give way to "Signed in" and a link to the account. |
| 10 | same | Inline Row | Press View as → Signed out, then Show to → Paid members. | — | The whole section disappears: a signed-out visitor is not a paid member. |
| 11 | same | Centred | Press Centred. | — | The top of the article "The four hundred domains that refuse to move": a tag, the title large and centred, a sentence under it, the writer with photo, date and reading time, then a wide picture with its caption. |
| 12 | same | Latest Post | Press Latest Post. | — | **Left:** "Issue 48" above a large headline, "The personal page never disappeared. It went quiet.", a sentence, and the "Subscribe" and "Browse the archive" buttons. **Right:** a card with a picture, the title "The night shift at the Port of Algeciras", and "Archive · 7 August 2026". Hovering the card underlines its title. |
| 13 | same | Latest Post, panel | Set Card side to Left, Show date to Off, then Primary action to Off. Then look for a setting for how many posts. | — | The card moves to the left and loses its date; "Subscribe" disappears and Secondary action turns grey with "A secondary action needs a primary beside it." There is no setting for how many posts — this hero always shows one. Then press View as → Signed out and Show to → Paid members: the whole section disappears. |
| 14 | same | every pilot | On each, press Tablet, Phone and Dark. | — | Each rearranges at that width as its drawing does, and in Dark nothing is unreadable. Latest Post's card keeps its picture in Dark: its drawing shows the dark version in a picture-less card style, which arrives with the Heroes category. Rail's logo is Orbit Weekly's one logo picture, drawn for a light ground, so in Dark it is dark on dark: a second logo for dark grounds is a field the Headers category adds. Rail's "Divider under: Shadow" shows no shadow in Dark (the drawings' dark set has none). The columns sit a little narrower than the drawings (1,152 pixels of content against 1,296): say whether that matters to you — it is DW-155's question. |
| 15 | `https://app.inflozo.com/controls`, then `https://app.inflozo.com/style-guide` | Controls review, Style guide | Open each. | — | The same pages as before, in the new colours: a warm off-white ground and an orange accent. |

**Not in this story, so do not expect them:**
- menus that open with a click, and the header's search and dark-mode buttons;
- a newsletter form's "Sending…" and "Check your inbox" states;
- choosing which posts a feed or the Latest Post card shows;
- a "Members only" marker on the Latest Post card;
- the post header on pages, and several authors in one byline.

Each is in the ledger, with the story that brings it.

If a step shows something different, note its number and what you saw. Those are fixed inside this story (R-80).

## Owner's test findings

Tested on `https://app.inflozo.com/pilots` on 2026-09-15, on the Deploy deployment
(`dpl_84Zh7oJSfJ2THvCCh5b4uMdg7sDS`, `02b31605`). Four findings, in the owner's words. **Nothing is fixed yet:
where they are fixed is Q6, and what happens to the pinned top block is Q7.** The owner's standing instruction
for these: "This needs to be done for all controls of all other various sections."

1. **"The controls in the sidebar are not properly grouped. I understand that was due to a ruling that we need to
   follow Claude Design. But the different controls are not grouped under correct accordions."** Every control is
   grouped by its role under: **Content** (any content changes) · **Style** (any visual/design changes) ·
   **Layout** (any layout changes — "Arrangement can be moved under Layout") · **Data** (controls to choose the
   source of data).
   - *Whose:* two layers. **Which accordion each pilot's control sits in** was chosen by this story, in the five
     `design.json` files — and they disagree with each other (A22's "Heading size" is Style, A24's "Title size" is
     Arrangement; "Blurb: Show · Hide" is Arrangement, "Tag: Show · Hide" is Style). **The accordions themselves**
     — their names, and the rule that a control may sit only in Arrangement or Style, never Content — are Story
     4.5's (done): `SIDEBAR_GROUPS` and `CONTROL_GROUPS` in `packages/library/src/vocabulary.ts:143-150`, and
     PRD FR-F3 (`prd.md:269`), which names the group "Arrangement, not Layout" because "layout" was retired as a
     second word for *design* (Appendix I). The design picker keeps the word Design, so "Layout" for the
     arrangement group does not collide with it; the Fix carries the rename to FR-F3 as the owner's ruling.
   - *Not in this story:* **choosing the source of data** ("Which posts", By tag, Featured…) is **Story 5.19**'s
     (backlog). Today's Data group holds only Show and Order, and that stays.
   - *"All other sections":* only the five pilots and the `/controls` sample exist. Every other design is built
     by its library category story (Epics 9–11, backlog), which follows whatever rule the vocabulary, the
     validator and `docs/section-authoring.md` hold when it runs — so writing the rule there now is how it reaches
     them.
2. **"The top that shows Columns, Card style, Per row, Image ratio, Excerpt, etc needs to be grouped under their
   proper group. If they are for each section and depends on the section, then add them under a new accordion
   group at top - Section Settings."**
   - *Whose:* Story 4.5's (done). The top block is the Quick Controls card — "the first 3–5 entries of a design's
     own control list", pinned above the accordions — required by PRD FR-F3 and FR-G3 (`prd.md:269`, `:282`), the
     registry's `quickControls[]` (`packages/library/src/registry.ts:193`), the Kit's `quick-controls-card.tsx`, and
     an acceptance line repeated across the library category stories in `epics.md`. A Quick Control is taken out of its group,
     which is why those controls appear in no accordion.
   - *Unclear, asked as Q7:* every design control is declared per design, so read literally every one "depends on
     the section" and all of them would move into Section Settings.
3. **"Any property where the values are larger (E.g. For First cell - the value 'Spans two columns' is larger in
   character size) we should show a dropdown. With these large values, the pill design looks bad. We should only
   show value with less characters in pill design."**
   - *Whose:* the look is the design export's — A17 #1's drawn panel itself draws "First cell: Off · Spans two
     columns" as pills (`A17-1 Three Up.dc.html:132-146`), and this story copied it. The owner's word overrides
     the drawing here (R-74 binds what a surface is built from; the owner rules it). The pill-or-dropdown choice
     is today made per control by whoever authors the design (`segmented` against `named-select`), so the Fix
     makes it one rule in one place, which every future design inherits.
4. **"At bottom Reset this design should have an icon too. On click it should prompt the user to confirm their
   action."**
   - *Whose:* Story 4.5's panel (done) — `apps/web/components/controls/sidebar.tsx:289-297`, which records "no
     confirm — D5 draws none". A small change. The editor's own panel is Story 5.1's (backlog), which mounts this
     same component and inherits it.

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

**Ruled: option 2 (owner, 2026-09-15).** Recorded as **R-108** in `reconcile-designs-decisions.md` §A27. The fifth
pilot is A4 #13 Latest Post; the pilot table, Tasks and the manual test above are written for it.

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

**Ruled: option 1 (owner, 2026-09-15).** Recorded as **R-109** in `reconcile-designs-decisions.md` §A27. DW-97 closes;
A34's category story redraws A34 #1 Numbers to the indicator.

**Q3. The orange Subscribe button's white words are too faint to pass the accessibility check. What should change?**

*(Raised by the Dev run, 2026-09-15.)* The drawings paint every main button in the Paper pack's orange (`#D96C3F`) with
white words. The accessibility scan this story runs on the live pilots page measures white on that orange at 3.4 to 1;
the rule for button-sized words is 4.5 to 1. So Rail, Inline Row and Latest Post each fail once, in Light only (Dark
uses dark words on a lighter orange and passes). The drawings are the design authority (R-74), so changing them is
yours to rule, not the build's.

Example: the "Subscribe" button in the Rail header is 14-pixel white text on orange. Everything else on the five
pilots passed, in both modes, at all three widths, for every visitor.

1. **Dark words on the orange, as Dark mode already does (RECOMMENDED).**
   - The button keeps its orange; its words turn the near-black ink (`#232019`), which measures 4.7 to 1 and passes.
   - One value changes in the sample colours (the words on the accent colour), nothing else.
2. **A deeper orange behind white words.**
   - White stays; the orange darkens to about `#B5532A` wherever it sits behind words.
   - Every orange on every page looks darker than the drawings.
3. **Keep the drawings as they are, and record the exception.**
   - The pages match the drawings exactly, and every published site built on Paper ships a button that fails WCAG AA.

**Ruled: option 1 (owner, 2026-09-15).** Recorded as **R-110** in `reconcile-designs-decisions.md` §A28. Light
`--text-on-accent` is `#232019` (4.77:1 on `#D96C3F`); DW-158 closes.

**Q4. Header menus with dropdowns: which way should the menu be drawn so dropdowns keep working?**

*(Raised by the Dev run, 2026-09-15; rewritten the same day after the owner's reply: "All menus have dropdown items. I
do not want that to be affected. Users should be able to add dropdown navigation too.")*

**What we found.**
- **Ghost's own menu settings have no dropdowns.** Each item is only a label and a link (`navigation.js:41-51`, both
  Ghost versions).
- **The header drawings give dropdowns two sources** (`A1 Headers - Spec.md:87-91`):
  - **Added in Inflozo** (the default): the user picks a Ghost menu item and adds its dropdown links in Inflozo.
  - **From Ghost's menu, by a naming trick**: an item named `+Topics` becomes a dropdown, and the `-Essays`, `-Notes`
    items after it become its links. A small script folds them.
- **Dropdowns must open without JavaScript.** The drawings make each one a plain HTML open/close box
  (`A1 Headers - Spec.md:170`, `:187`).

**What that means for the Rail menu as built today** (Ghost's ready-made menu, `{{navigation}}`):
- Links are correct on both Ghost versions, and the naming-trick dropdowns would still work.
- **Dropdowns added in Inflozo would not work without JavaScript.** Ghost writes its menu as one sealed block, so the
  theme cannot slip a dropdown under a chosen item.
- **Ghost lets a theme replace that block with its own small menu file** (`partials/navigation.hbs`). Ghost still hands
  that file every item's label, link, and whether it is the current page (`helpers/navigation.js:76-89`;
  `theme-engine/engine.js:14-22` reads the theme's own files after Ghost's). Inside it, each item can carry its
  dropdown in plain HTML. This is read in Ghost's source; it gets recorded on both test servers before anything is
  built on it.
- **This story's Rail draws no dropdowns either way.** The drawings' dropdowns were already left to the Headers
  category story. The choice is what that story builds on.

Example: a menu of Home · Topics · About, where Topics opens to Essays and Notes. With Inflozo's own menu file, the
dropdown under Topics is ordinary HTML, opens with no script, marks the page you are on, and works whether the user
added Essays and Notes in Inflozo or named them `-Essays` and `-Notes` in Ghost.

1. **Keep this story as built, and bind the Headers story to Inflozo's own menu file (RECOMMENDED).**
   - Nothing about dropdowns is lost, and this story does not grow.
   - The Headers story (DW-150) records the menu file on both test servers first, then builds both dropdown sources on
     it. It never builds dropdowns on Ghost's sealed block.
2. **Build Inflozo's own menu file now, in this story.**
   - Same end result, proven sooner on the Rail sample.
   - This story grows: a new recording on both servers, a new piece in the section builder, and a theme file the
     theme-compiling epic (Epic 7) would otherwise place.
3. **Build the menu item by item, without Ghost's menu at all.**
   - Dropdowns added in Inflozo work without a script.
   - Ghost's current-page mark is lost, and the section builder needs a new way of writing links (`this.url`).

**Ruled: option 1 (owner, 2026-09-15).** Recorded as **R-111** in `reconcile-designs-decisions.md` §A28. Rail keeps
`{{navigation}}`; Story 9.1 builds header dropdowns on Inflozo's own `partials/navigation.hbs`, recorded on T1 and T3 first
(DW-150).

**Q5. Links in light mode are drawn in the same orange the buttons were. Should link text keep it?**

*(Raised by the review, 2026-09-15.)* The sample colours give links the Paper orange (`#D96C3F`) in light mode. On
the page's off-white it measures 3.2 to 1; the rule for ordinary text is 4.5 to 1, the same rule Q3 was about. No
sample section paints a link with that colour yet, so nothing on the pilots page fails today; the first design that
does would.

Example: a "Read more" link in a paragraph. In orange it reads at 3.2 to 1; in the dark ink with an orange underline
it reads at 15 to 1, which is how the drawings already treat a menu item you hover over.

1. **Ink words with an orange underline (RECOMMENDED).**
   - The link is the text colour, underlined in orange; that is the drawings' own hover treatment for menu items.
   - Passes everywhere, and the orange still marks it as a link.
2. **A deeper orange for link text, in light mode only.**
   - About `#B5532A`, which measures 4.7 to 1. Links would be a darker orange than the buttons beside them.
3. **Keep the orange and accept the failure.**
   - Matches the drawings' colour; every design that colours a link with it fails the accessibility check.

**Ruled: option 1 (owner, 2026-09-15).** Recorded as **R-112** in `reconcile-designs-decisions.md` §A28. Light
`--link-color` is the ink `#232019` and `--link-decoration` is `underline #D96C3F`; Dark is unchanged (6.43:1).

**Q6. Your four sidebar findings mostly change the panel that Story 4.5 built, and 4.5 is done. Where should they
be fixed?**

*(Raised by the owner's test, 2026-09-15.)* Only one small part is this story's own work: which accordion each of
the five sample sections puts its controls in. The accordions' names, the pinned top block, the pills and the
Reset button belong to the settings panel, which Story 4.5 built and you passed. The panel is one component, and
the only sections that exist today are the five samples and the `/controls` sample, so nothing else has to be
redone.

Example: moving Three Up's "Per row" out of the top block and into Layout means changing the panel's rules once;
the five samples then move their controls to match, and every section built later follows the same rules.

1. **Fix all four inside Story 4.10 (RECOMMENDED).**
   - Findings are fixed inside the story that found them (R-80), and this is the cheapest moment: five sections
     today, every design in the library once the library stories run.
   - The work: the panel and its rules, the five samples, the `/controls` sample, the tests, and the wording in the
     plan documents (the PRD's sidebar rule, the architecture, the design notes, the authoring guide, and the
     "Quick Controls" line repeated in the library stories).
   - Con: Story 4.10 stays open for one more Fix, review, deploy and your test.
2. **Pass Story 4.10 as it is, and open a new Story 4.12, "the settings panel regrouped", for all four.**
   - Story 4.10's record stays about the sample sections; the panel change gets its own plan, review and test.
   - Con: a full extra story cycle (plan, build, review, deploy, test) for the same work, and Story 4.10 closes on
     a panel you have already asked to change.
3. **Leave the panel as it is until the editor is built (Epic 5).**
   - Nothing changes now.
   - Con: no Epic 5 story owns this — Story 5.1 mounts the panel as it is — so it would need adding there anyway,
     and you would keep seeing the panel you rejected until then.

**Ruled:** _(awaiting the owner)_

**Q7. When the pinned top block goes away, where does each design's own setting go — and what goes in "Section
Settings"?**

*(Raised by the owner's test, 2026-09-15, finding 2.)* Every setting a section has, apart from Background,
Vertical spacing and Top divider, belongs to that one design — Three Up has "Per row", Rail has "On scroll". So
"if they are for each section and depends on the section, add them under Section Settings" could mean almost
every setting goes there. Three readings, shown on Three Up's panel.

Example — Three Up today: a pinned card with Per row · Image ratio · Excerpt · Meta · First cell, then Content
(the heading and footer words), Style (Tag, Background, Vertical spacing, Top divider), Data (Show, Order).

1. **Every setting goes to its role; Section Settings holds only what fits no role (RECOMMENDED).**
   - Three Up: **Content** — words, Excerpt, Meta, Tag · **Layout** — Per row, First cell · **Style** — Image
     ratio, Background, Vertical spacing, Top divider · **Data** — Show, Order. Nothing in Section Settings.
   - Rail: **Section Settings** — On scroll (Static · Sticky · Shrink), which is how the header behaves, not its
     content, look or layout.
   - Pro: one rule for every design, and every setting is where its role says. Con: the few most important
     settings are no longer pinned on top, so most changes take one click to open an accordion.
2. **Section Settings is the old top block, as an accordion that starts open.**
   - Three Up: **Section Settings** — Per row, Image ratio, Excerpt, Meta, First cell; the rest grouped by role.
   - Pro: the quick settings stay one glance away. Con: the top stays a mix of layout, style and content — the
     thing finding 2 asks to fix.
3. **Section Settings holds every setting the design has of its own.**
   - Three Up: **Section Settings** — Per row, Image ratio, Excerpt, Meta, First cell, Tag; Content keeps the
     words, Style keeps Background, Vertical spacing and Top divider.
   - Pro: the simplest rule. Con: one long mixed list on the designs with the most settings, and Layout would
     almost always be empty.

**Ruled:** _(awaiting the owner)_

