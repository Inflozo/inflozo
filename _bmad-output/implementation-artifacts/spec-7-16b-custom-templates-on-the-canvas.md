---
title: 'Story 7.16b — Custom templates on the canvas'
type: 'feature'
created: '2026-10-17'
status: 'in-review'
baseline_commit: '9f121a9ba53c155baa9b310ddcfc3a8d6b689c04'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, the editor's Template menu lists every template you made on Routes & Templates under **From Routes &
Templates**, each with its name and the line "Custom template". **New template** in that menu takes you straight to
naming a new one, then opens it. You design it like any other page, using the sections that work at an address Ghost
serves on its own, such as a hero or a newsletter row. A post's own title or text is never offered there, because a
route has no post to give it. The theme Inflozo builds shows those sections at that address. Deleting a template that
has a design now asks first, and Undo brings back both the template and its design. Removing a template's last section
warns you in words that say whether a route still shows it. An editor that had the deleted template open moves to Home
with a short note saying why.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 7.16a writes `custom_templates`, but the editor never reads it (`template-switcher.tsx:47-54`). So a
template made on Routes & Templates cannot be opened, designed or deleted with its design. The routes page refuses
that delete outright (`routes/actions.ts:184`). Three more gaps:
- **The canvas key is a fixed list.** `CanvasKey = keyof typeof CANVASES` (`lib/editor.ts:64`), and an unknown
  `custom-…` segment answers 404 (`[template]/layout.tsx:23-29`).
- **No library design can sit on a template the user names.** `compilesTo` is a literal `includes`
  (`placement.ts:134-135`).
- **The theme would blank every section.** It wraps a custom template in `{{#post}}` (`compile.ts:1005-1013`), the
  form for a template picked in Ghost Admin. A route's root carries no `post` (F1), so at the route's address every
  section would print nothing.

D5f's "This template stops shipping" is also said of a template that a route keeps shipping (DW-344).

**Approach:**
- **One form.** A Routes Manager template is the **route form** everywhere: appendix B.1 §3's flat root, and DW-126's
  "derived from the route".
  - The library spells "every Routes Manager template" as R-7's own `custom-{name}.hbs` in a design's `compileTarget`.
  - The matrix gains that form's row, and both the canvas and the theme read it.
- **The editor learns a fourth kind of canvas,** keyed by the template's file:
  - read from `custom_templates` and `routes_config` on load;
  - drawn in D5b's `FROM THE ROUTES MANAGER` group, with **New template** deep-linking into the routes page's own sheet;
  - when the template is gone, the editor moves to Home with a notice, at load and at the canvas's next save.
- **The routes page** deletes a designed template with its design behind one warning, and Undo brings back all three
  writes.
- D5f gains its routed sentence.
- **Question 1 split the story (R-249, owner, 2026-10-17):** a collection's or channel's own post list on its template
  is Story 7.16c's (Design Notes, "Moved").

## Boundaries & Constraints

**Always:**
- **Frames (R-74).** The switcher is `D5 Canvas Markers and Template Switcher.dc.html` **D5b** (`:161-179`, the group
  and "New template") as **R-171** and **R-172** re-specify it:
  - each row is a glyph, then the name over one line, with the mark's word as hover title and `sr-only` text;
  - the row in force is `coral-tint`, never ticked.

  The routed warning is **D5f** (`:436-455`) with its own words. The deleted-template notice is **B5a**'s strip
  (`B Missing Surfaces.dc.html:1469-1487`, `lock-bar.tsx`), exactly, as Question 2 ruled (**R-250**, R-74's fourth
  stated exception). Tokens are the Kit's, never the frame's hex.
- **One form for every Routes Manager template (DW-126).** It is the route form, whether a route names the template or
  not:
  - **What it offers:** a design whose `compileTarget` lists `custom-{name}.hbs` and that binds `none` or a gettable
    resource (`CONTEXTS_BY_TARGET` already answers that, `placement.ts:108-111`).
  - **What the theme writes:** no `{{#post}}` and no article.
  - **What keeps the entry form:** the membership canvases (R-129, A30), unchanged. `MEMBERSHIP_FILES` moves to
    `@inflozo/library` (`vocabulary.ts`) as the one list, and `routes.ts:221` imports it.
- **The segment is the file without `.hbs`,** checked against the database's own shape:
  `template_key_shape`, `custom-[a-z0-9]+(-[a-z0-9]+)*`, not `CUSTOM_TARGET_RE`, which is looser.
  - A segment outside that shape is still a synchronous 404.
  - A segment inside it that names no template opens Home with the notice. A `notFound()` after a database read serves
    Next's bare error page (`[template]/layout.tsx:13-17`).
- **R-170.** Every new sentence lives in one list: `lib/editor.ts` beside `EMPTY_TEMPLATE_ASK` for the editor, and
  `ROUTES_WORDS` for the routes page. The deployed walk reads both lists. The tab title and the switcher row use the
  same name, which is the template's display name.
- **R-98.**
  - "New template" swaps its name to "Opening…", goes `aria-busy` + `aria-disabled`, and the routes page's skeleton
    shows first.
  - Create from that entry says "Creating…".
  - `busy.test.ts` holds both.
- **Writes keep every in-between state valid (7.16a's rule):**
  - **Delete runs config → canvas doc → template row.** The config is written without the template's routes, then the
    `custom:<file>` doc is deleted, then the row.
  - **Undo runs row → doc → config.** The doc is parsed by `docSchema` and `docRefusal` before it is re-inserted,
    because it comes back from the client (AD-36).
  - Each action follows the house shape (`routes/actions.ts:31-53`).
- **The sync never re-creates a deleted template's canvas.** A `custom:` key that is neither a membership file nor a
  current template is left unwritten. Every other key in the body is written as usual. The answer names the key it left.
- **R-82 and R-238.** Review and test run on production and T1 alone. T1 writes need the owner's go, asked in the Dev
  session, and run in the main session.

**Ask First:**
- **Questions 1 and 2 were both ruled option 1 (owner, 2026-10-17):** **R-249** and **R-250**. The spec is written to
  them, and each ruled value lives in one place: Design Notes' "Ruled values".
- Before the first write, ask the owner for the T1 go covering the recorder's whole run (§83).
- Any change to a frame string beyond Design Notes' routine calls, and any undrawn part beyond Question 2.

**Never:**
- **A collection's or channel's posts at a template's root.** That means no main feed on a Routes Manager template,
  no `PAGINATED_TARGETS` change, no route `limit:` on the canvas, no custom paged contexts in the `noindex` guard, and
  no change to Home's feed. All of that is Story 7.16c's (R-249).
- A `data:` key, or any change to `routes.ts`'s emission. Only `MEMBERSHIP_FILES`' home moves.
- A route or Routes Manager template for a membership canvas, or any change to the membership canvases' form.
- **A migration.** `template_key_shape` already takes `custom:custom-<slug>.hbs`
  (`20260926120000_paywall_template_key.sql:20-22`), and `authenticated` holds full CRUD on both tables
  (`complete_schema.sql:1016-1026`).
- Uploading anything to a customer's Ghost (that is 7.17 and 7.18), or calling `compileTheme` from the product (7.18).
- Editing `claude-design-export/`, a `record` document or a generated file, or writing a count down.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Switcher, no template | no `custom_templates` row of kind `routes` | after Template surfaces: a rule, **New template**, **Manage routes**; no heading | — |
| Switcher, templates | two templates | after Template surfaces: a rule, `FROM THE ROUTES MANAGER`, one row each (`CanvasCustom`, display name, "Custom template", mark Empty or designed — never Auto-generated) in `templatesOf` order, a rule, New template, Manage routes; the open one highlighted | — |
| New template | pressed in the switcher | "Opening…", the routes skeleton, then Routes & Templates with the New template sheet open and focus in Name | — |
| Create from that entry | "Landing" | the row is written, then the editor opens `/projects/<id>/custom-landing`, empty | a refusal is 7.16a's sentence, nothing written |
| Cancel from that entry | Cancel or Esc | the sheet closes and you stay on Routes & Templates | — |
| Open | `/custom-landing`, the template exists | its canvas, with the tab titled `<project> · Landing — Inflozo` | — |
| Stale address | `/custom-gone`, no such template, or a `custom:` doc whose row is gone | Home, URL replaced, the notice naming "Gone" (`ghostLabel`) | — |
| Bad shape | `/custom-Bad_x`, `/custom--x` | 404, synchronous | — |
| Offered | a Routes Manager canvas | a22/1 and a4/13 (and the site-wide designs, landing in the site doc); never a17/1 or a24/1 | — |
| Compiled | a template holding a22/1, routed or not | `custom-<x>.hbs` holds the section with no `{{#post}}` and no `<article>`; emptied, it is `{{!< default}}`; `custom-signup.hbs` keeps `{{#post}}` + `POST_ARTICLE` | — |
| D5f, unrouted | the last section on a template no route names | `EMPTY_TEMPLATE_ASK`, unchanged | — |
| D5f, routed | the last section, `/landing/` names it | `ROUTED_EMPTY_ASK`, naming `/landing/` | — |
| Delete, designed | ⋯ → Delete on a template with a `custom:<file>` doc | the confirm opens on Cancel and carries the design line, plus the paths if routed; config → doc → row; toast with Undo | a failed write says `couldNot`; the state left is valid |
| Undo | pressed before the next change | row, doc (byte-equal), config | the same |
| Open editor, template deleted | the editor is on Landing; Landing is deleted elsewhere; ⌘S | every other key is written; `custom:custom-landing.hbs` is not; the answer names it; the editor drops its pending work, replaces the URL with Home and shows the notice | — |
| Orphan doc | a `custom:` doc with no template row | never a canvas; `read.ts` ignores it; the sync never writes one | — |

</frozen-after-approval>

## Code Map

- `packages/library/src/vocabulary.ts`:
  - `:134` `CUSTOM_TARGET_RE` and `:136-138` `isCompileTarget` gain the `custom-{name}.hbs` target. Add
    `ROUTE_TEMPLATE_TARGET`, `MEMBERSHIP_FILES` (moved here) and `isRouteTemplate(file)`, which is a custom file that is
    not a membership file.
  - `:142-152` `templateKeyOfFile` is unchanged.
- `packages/library/src/placement.ts`:
  - `:134-135` `compilesTo`: a Routes Manager file matches a design listing the target.
  - `:108-111` `CONTEXTS_BY_TARGET` already returns `none` plus gettables for any custom file, so it stays as it is.
  - `:147` `offeredOn` follows from `compilesTo`.
- `packages/library/src/validate.ts:588-599` -- the legal-target sentence; `context-unreachable` and `pagination-target`
  need no change, since the target is not paginated.
- `packages/library/contexts/matrix.json`:
  - `:251-254` is the entry row (membership).
  - Add the route row: a flat top scope with no fields of its own.
  - `:178-189` offers `@page.show_title_and_feature_image` on custom files. It must not reach the route row: `@page`
    exists only when a route resolves a page (§3), and Inflozo writes no `data:`.
- `packages/library/src/contexts.ts` -- `:91-94` `targetContext`, `:197` `resolveUniversal` and `:323` `offerBindings`
  each map a custom file to the one key. Make that one function pick the route row for `isRouteTemplate`.
- `packages/library/designs/a4/13/design.json`, `a22/1/design.json` -- `compileTarget` gains the target (routine call 3).
- `packages/theme-compiler/src/compile.ts`:
  - `:1005-1013` `pageBody` reads `targetContext(file)?.block`, so the route row gives a flat body with no change here.
  - `:397` `POST_ARTICLE` and `:481-497` (`checkGhostMarkup` rule 3) still hold.
  - `:607-613` `stacksOf` and `:114-115`/`:843-845` `routed` are read and not changed.
- `packages/section-runtime/src/agreement.test.ts` -- add a Routes Manager template case (canvas versus theme).
- `packages/section-runtime/src/routes.ts` -- read only: `:221` `MEMBERSHIP_FILES` (now imported), `:600`
  `ghostLabel`, `:635` `routedOf`, `:639` `pathsUsing`, `:644` `withoutTemplate`.
- `packages/library/src/orbit-weekly.ts:399` `templateContext` -- for `custom-*` it already gives `@site`/`@config`
  alone. Assert this; don't change it.
- `apps/web/lib/editor.ts`:
  - Already there: `:27-54` `CANVASES`, `:62` `CUSTOM_TEMPLATE_CAPTION`, `:64` `CanvasKey`, `:84` `isMembership`,
    `:101` `canvasesOf`, `:106` `canvasOfTemplateKey`, `:111-112` `templateKeyOf`, `:141-147` `fileOfKey`, `:152-153`
    `emptiesCustomTemplate`, `:158-168` `EMPTY_TEMPLATE_ASK`, `:175` `canvasPath`, `:228-238` `canvasFromSegment` and
    `canvasOfPath`.
  - Add `RouteCanvas` and `Canvas = CanvasKey | RouteCanvas`, and one `fileOf`/`labelOf` that every `CANVASES[key]`
    reader goes through (eight in `editor.tsx`, plus the switcher, `read.ts` and the `CanvasKey` files named in
    `editor.test.ts`).
  - `emptiesCustomTemplate` takes the routed list.
  - Add `ROUTED_EMPTY_ASK` and `TEMPLATE_GONE`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/[template]/layout.tsx:23-29` -- accept the route shape
  synchronously. `page.tsx` -- title from the display name.
- `.../(editor)/read.ts`:
  - `:253` `editorData`;
  - `:263` the `project_templates` read (skip orphan `custom:` docs);
  - `:305-314` `docRefusal`;
  - `:331` `canvasesOf`.
  - Add `custom_templates` (`templatesOf`, `lib/routes.ts:199-207`) and `routes_config` (`parseRoutesConfig` →
    `routedOf`, `pathsUsing`) to its parallel reads.
- `.../(editor)/editor.tsx`:
  - `:837-838` the current key and canvas;
  - `:922-923` `pathOf`;
  - `:964` `designated`;
  - `:4910-4923` `onRemove` (D5f, label from `labelOf`);
  - `:5504` the switcher;
  - `:5611` `LockBar`, the B5a strip whose shape the notice copies (`components/editor/lock-bar.tsx:25-80`);
  - `:6189`/`:6200` the two live regions;
  - `:6275-6320` the D5f dialog.
- `apps/web/components/editor/template-switcher.tsx`:
  - `:47-54` the R-128 comment, rewritten;
  - `:67-80` `GLYPH`;
  - `:103-126` props, which gain the templates;
  - `:152-161` `go`;
  - `:163-195` `row`;
  - `:276-299` the tail.

  `bar-menu.tsx:59` `BarMenuRow`. `kit/icons.tsx:313-322` `CanvasCustom` (Tabler `template`); a Tabler `plus` if the
  Kit lacks one.
- `apps/web/lib/pilots.ts:74-98` `docRefusal` -- follows `compilesTo`.
- `.../projects/[id]/sync/route.ts`:
  - `:71` `TEMPLATE_KEY` is unchanged;
  - `:114-125` is the per-key loop, which reads the project's templates once when any key is a non-membership `custom:`
    key;
  - the answer gains the keys it left.
- `.../projects/[id]/routes/`:
  - `page.tsx` reads `?new=template`;
  - `routes-manager.tsx`: `:71` `Sheet`, `:120` `open`, `:163-184` `dropTemplate`, `:241` `onDelete`, `:277-283` the
    toast, `:1181-1204` `DeleteTemplate`;
  - `actions.ts`: `:57-73` `contextOf`, `:157-168` `createTemplate` (return the file), `:171-200` `deleteTemplate` (drop
    the `:184` refusal), `:211-243` `restoreTemplate` (take the doc).
- `apps/web/lib/routes.ts` -- `ROUTES_WORDS` (`:38-159`; retire `hasDesign` `:145`, add the design lines).
- `tools/probe/record-theme-assembly.py` -- gains the §83 leg.
- `tools/probe/run-verify-editor.cjs`:
  - the header (`:268-286`) gains step 110;
  - step 40's R-128 check (`:2354`) is re-expected;
  - step 109 is `:9512`.
- `tools/keyboard/journey.spec.mjs` -- End then ↑↑ to Paywall: `:4109-4121`, `:4510`, `:4593`, `:4713`, `:6711`,
  `:7017`. `apps/web/busy.test.ts:298-309`.

## Tasks & Acceptance

**Execution:**
- [x] `packages/library` (`vocabulary.ts`, `placement.ts`, `validate.ts`, `contexts.ts`, `contexts/matrix.json`, the
  two `design.json`) and their tests:
  - the target;
  - `MEMBERSHIP_FILES`;
  - `isRouteTemplate`;
  - `compilesTo`;
  - the matrix's route row, picked for every Routes Manager file and never for a membership one;
  - a4/13 and a22/1 offered on `custom-landing.hbs` and not on `custom-signup.hbs`;
  - a17/1 and a24/1 never offered.

  Every refusal sits behind a passing control. -- DW-126, the one rule both emitters read.
- [x] `packages/theme-compiler` tests and `section-runtime`'s `agreement.test.ts`:
  - a Routes Manager template compiles flat, with no `{{#post}}` and no article, routed or not;
  - an emptied routed one is `{{!< default}}`;
  - `custom-signup.hbs` is unchanged;
  - the canvas and the theme agree node by node.

  -- F1: the entry form would blank the route.
- [x] `packages/section-runtime/src/routes.ts` -- import `MEMBERSHIP_FILES`. Finish with a grep for any other copy of
  the three names. -- one list (standing rule 3).
- [x] `apps/web/lib/editor.ts` + `editor.test.ts`:
  - `RouteCanvas` and `Canvas`, with `fileOf` and `labelOf`;
  - `canvasFromSegment` takes the database shape;
  - `templateKeyOf` and `canvasOfTemplateKey` over both kinds;
  - `emptiesCustomTemplate(key, doc, routed)`, `ROUTED_EMPTY_ASK` and `TEMPLATE_GONE`.

  `editor.test.ts:34`'s `custom-x` refusal becomes "a Routes Manager segment, and a 404 outside the shape". -- the fourth kind of
  canvas, as data.
- [x] `(editor)/[template]/layout.tsx`, `page.tsx`, `read.ts` -- the shape guard; the title; the templates, the routed
  list and each template's paths read in the same `Promise.all`; orphan `custom:` docs skipped. -- load.
- [x] `sync/route.ts` -- leave a deleted template's key unwritten, write the rest, and name it in the answer. -- no
  resurrection.
- [x] `editor.tsx`, `template-switcher.tsx`, `kit/icons.tsx`:
  - the group and New template (Design Notes, "Words");
  - every `CANVASES[key]` read through `fileOf`/`labelOf`;
  - D5f's routed sentence;
  - the notice strip, B5a's (R-250), with the switch to Home (`router.replace`) at load and on the sync's answer, the
    gone key's pending work dropped and the sentence also said in `#editor-said`.

  -- FR-D6, FR-I3, D5b, D5f.
- [x] `routes/{page.tsx,routes-manager.tsx,actions.ts}`, `lib/routes.ts`, `apps/web/routes.test.ts`:
  - `?new=template` opens the sheet;
  - Create from it pushes the new canvas;
  - a designed template's delete is confirmed and Undo restores the row, the doc and the config;
  - `hasDesign` is retired.

  -- FR-I3's warning and Undo.
- [x] `tools/probe/record-theme-assembly.py` -- **§83** (main session, the owner's go): a project with a Routes Manager
  template holding a22/1, and `routes.yaml` adding the static route `/inflozo-probe-template/` to T1's own file.
  1. Read T1's `routes.yaml` and the active theme, and keep both.
  2. Upload the compiled theme and the file.
  3. `GET /inflozo-probe-template/` shows a22/1's marker.
  4. **Control:** the same template hand-wrapped in the entry form (`{{#post}}` + `POST_ARTICLE`) does not show it.
  5. Restore both, and read `routes.yaml` back byte for byte.

  -- standing rule 1 for F1.
- [x] `tools/probe/run-verify-editor.cjs` -- step 110 (Design Notes, "Walk"); step 40 re-expected. Then
  `tools/keyboard/journey.spec.mjs`: re-point every walk past the new tail. -- R-82.
- [x] Propagation (standing rules 3 and 7):
  - **DW-126** closes.
  - **DW-344**'s first half is done; its second half stays open under Story 7.16c (R-249).
  - **`prd.md`**: FR-I3 gets a dated note (the route form; the warning and Undo are built), and FR-J5 gets one (a
    Routes Manager template has no entry, so no article).
  - **`appendix-b1-template-contexts.md:100`** gets a note that the route row is built and that `posts` is 7.16c's.
  - **`docs/section-authoring.md:180`** gets the target's meaning.
  - **`epic-7-context.md`** gets sub-bullets.
  - **7.18's card** gets one reading: hand `compileTheme` only membership canvases' and current templates' docs.
  - Finish with a grep for `hasDesign`, "7.16b builds", "absent until Story 7.16b" and `CanvasKey`-only readers of
    `CANVASES[`.
- [x] `python3 tools/doc-audit.py --check` twice, then `pnpm check` and `pnpm keyboard`.

**Acceptance Criteria:**
- **Matches the frame (R-74).** Given the deployed switcher at 1440, compared with D5b as R-171 and R-172 re-specify it:
  - the group's heading, rows and "New template" match in components, layout, copy and tokens;
  - the routed warning is D5f's dialog;
  - the notice matches B5a's strip (R-250);
  - the Review records a side-by-side check.
- Given a Routes Manager template holding a22/1 and named by a static route on T1, when its address is read, then the
  section renders, and the entry-form control renders nothing there (§83).
- Given any Routes Manager template, when the canvas draws it and the theme compiles it, then the two agree node by
  node (§7.3's exit criterion).
- Given "New template" in the switcher, when it is pressed, then it reads "Opening…" and the routes page's own skeleton
  shows before the sheet (R-98).
- Given a designed template deleted and then undone, when the rows are read, then the template row, the `custom:` doc
  and the config equal what they were before the delete, byte for byte.

### Review Findings

Review, 2026-10-17: five layers — the Blind Hunter, the Edge Case Hunter, the Verification Gap reviewer, the Acceptance
Auditor, and the Real-infra verifier (read-only: production's schema, grants and policies, T1's restore, the Vercel
deployment) — and, in the main session, step 110 and the whole walk on production at the Dev head (Verification, "Review
results"). 1 decision-needed (Question 3), 17 patches (all applied), 1 deferred (DW-363) and one reading added to DW-362,
19 dismissed with a reason each (below).

- [x] [Review][Decision] The Template menu names the routes page twice — D5b's heading "FROM THE ROUTES MANAGER" over the
  templates, and the page itself is "Routes & Templates" (the menu's own "Manage routes" opens it). R-170 asks for one
  name; changing a frame string is Ask First. Question 3, **ruled option 1 (owner, 2026-10-17), R-251**: the heading
  reads "FROM ROUTES & TEMPLATES", tied to the page's title by `editor.test.ts` [apps/web/lib/editor.ts `ROUTES_GROUP.heading`]
- [x] [Review][Patch] A designed template's delete read its doc, then deleted it in a second call, so a save landing
  between the two was deleted and Undo restored the older doc. The delete now takes the doc itself (`.delete()…select('doc')`),
  one call fewer [apps/web/app/(app)/app/(authed)/projects/[id]/routes/actions.ts `deleteTemplate`]
- [x] [Review][Patch] A failed doc or row delete left the template's routes removed, with "couldn't save" and no Undo —
  and the comment promised a design was "never" lost. A later step that fails now puts back what the earlier ones took:
  the doc, then the routes, so a failed delete leaves the template as it was. The one state left is a put-back that itself
  fails, logged and named in a `ponytail:` [actions.ts `deleteTemplate`'s `failed`; routes.test.ts "every in-between
  state is valid"]
- [x] [Review][Patch] A template created under a name an earlier one had used could open wearing the old one's sections
  (a doc routine call 11's race re-stored) and its looked-at record (`project_template_prefs`, which the delete never
  clears). Creating a template now clears both for its own key before the row is written, and a failed clear writes no
  row [actions.ts `insertTemplate`; routes.test.ts "a new template clears what an earlier one of its name left"]
- [x] [Review][Patch] `?new=template` stayed in the address: after Cancel a reload opened the sheet again, and Back from
  the new canvas landed in the sheet again. The query is now spent when its sheet closes (`replaceState`, as
  `email-card.tsx` drops its key), and Create replaces that history entry with the canvas, so Back returns to where the menu
  was pressed [routes-manager.tsx `onClose`, `openCanvas`; routes.test.ts "?new=template…"]
- [x] [Review][Patch] The sync route read `custom_templates` before the lock boundary, so a failed read's 502 could hide a
  take-over's 423; and a body carrying nothing but a gone template's doc still called the RPC, moving the revision for no
  change. The read now follows the lock check, and such a body writes nothing and answers `left` [sync/route.ts;
  editor.test.ts "the sync route never re-creates…"]
- [x] [Review][Patch] The editor dropped the work of every key the sync's `left` named, but moved only Routes Manager
  canvases to `deleted`. `left` is now filtered once to Routes Manager keys, by one helper the read, the sync and the
  editor share (`isRouteKey`; the test's own copy of it retired) [lib/editor.ts `isRouteKey`; editor.tsx; read.ts]
- [x] [Review][Patch] *(R-170)* Theme settings' "Which control" rows and Translations' "Starting words you haven't
  retyped" named a Routes Manager template by its file (`custom-landing.hbs`) while the switcher, the tab and D5f say
  "Landing" — judgement call 6's `ponytail:`, visible from this story on. Both now take the names from `editorData`
  (`namesOf`), the file only where none was handed [lib/theme-settings.ts `pageOf`/`placedControls`, lib/translations.ts
  `untouchedRows`, the two settings pages and the promote action; settings.test.ts, translations.test.ts]
- [x] [Review][Patch] *(standing rules 3 and 7)* Routine call 2 made the literal brace mean every Routes Manager template,
  but FR-D13 and three lines of the inventory still gave A30's (and A7's membership placements') `compileTarget` as
  `custom-{name}.hbs` — Epic 10 would have built membership designs that land on Routes Manager templates and never on
  Signup. Each now carries a dated note: they name the three membership files [prd.md FR-D13; sections-inventory.md
  `bindingContext / compileTarget`, A7, A30]
- [x] [Review][Patch] The context matrix keyed its membership row `custom-{name}.hbs` — the very string a design's
  `compileTarget` now uses for the opposite, route form. It is `custom-{name}.hbs (entry)`, as appendix B.1 §3 and the
  membership research name it [packages/library/contexts/matrix.json; contexts.ts `ENTRY_ROW`]
- [x] [Review][Patch] `docs/section-authoring.md`'s new note sat under the sentence it contradicted ("`custom-{name}.hbs`
  for a membership or Routes-Manager template"). The passage is rewritten as two kinds of custom target, and says a post
  field on the route form is refused at render by both emitters (`bindingRefusals`, read in `core.ts`) [docs/section-authoring.md]
- [x] [Review][Patch] AD-14's reach record counted the paywall's designs on every custom template, so NFR-2's per-template
  CSS budget would charge a Routes Manager template for a paywall no `{{content}}` can print there (F1). The paywall now
  joins only templates whose matrix row opens `{{#post}}`. Control: the old rule fails the new assertion
  [packages/theme-compiler/src/compile.ts `reach`; compile.test.ts "(7.4) the record…"]
- [x] [Review][Patch] Handing the compiler the brace as a file was refused with a sentence listing the brace as a legal file.
  It now has its own sentence [compile.ts]
- [x] [Review][Patch] `LEGAL_TARGETS` was inserted between DW-186's comment and the constant it governs; the comment is
  back beside its code (standing rule 3) [packages/library/src/validate.ts]
- [x] [Review][Patch] The notice strip truncates its one line, so a long template name hid "so you're on Home." from
  sight; the sentence now carries itself as its hover title [components/editor/lock-bar.tsx `TemplateGoneBar`]
- [x] [Review][Patch] The owner's test step 4 said the Empty row shows "a hollow dot"; Empty is R-130's crossed-out
  circle (a hollow dot is Auto-generated). The step now says what the screen draws [this spec, Owner's manual test]
- [x] [Review][Patch] *(the Acceptance Auditor's "Name may read as taken while Creating…")* Walk 110c gains a check that
  Name never turns refused between Create and the canvas, behind its own control (the observer must first hear "Signup"
  refused). At the Dev head it PASSED: the flash does not happen on production, so no app change was made for it
  [tools/probe/run-verify-editor.cjs 110c]
- [x] [Review][Patch] *(the Review's own `pnpm keyboard` run)* One full run lost 7.13's divider journey: the cards frame
  was between two documents when `cardsCssOf` read it ("Execution context was destroyed"). It passed alone 3 of 3. The
  helper now answers null there, so its `expect.poll` reads again; the 7.13 journeys passed 11 of 11 after it
  [tools/keyboard/journey.spec.mjs `cardsCssOf`]
- [x] [Review][Defer] The editor's handling of the sync's `left` (the strip, the move Home, the switcher), D5f's routed
  sentence as the editor composes it, the delete's put-backs and "Creating…" during the push are proved only by the
  hand-run production walk (110c, 110f, 110h) and by source-text tests: the harness editor has no Routes Manager template,
  so no CI journey reaches them. DW-363, to Story 7.16c, whose canvases need one in the harness anyway [deferred-work.md]
- [x] [Review][Defer] The Template menu's New template on a project whose stored routing cannot be read lands on the routes
  page with no sheet — DW-362's dead end, reached one more way. A reading added to DW-362 (Story 7.18's) [deferred-work.md]

**Dismissed, one line each:**
- Undo's doc rides a server action (1 MB body limit): a canvas doc is a few KB per section; no design ceiling is near it.
- `routes/page.tsx`'s own `isDesigned`: it reads the raw stored row, and the runtime's takes a parsed doc.
- Two key regexes (`ROUTE_SEGMENT`, `CUSTOM_TARGET_RE`): `nameSlug` cannot make a stem outside the database's shape, and
  Undo re-runs `templateName`.
- `isCompileTarget` accepting the brace: grepped — only `rootScope` (which maps it to the route row) and the validator's
  target checks ask it; the compiler refuses it as a file.
- No validator rule for a post bind on the route target: FR-H7's `bindingRefusals` throws at render in both emitters, and
  `offeredOn` offers only a design sharing a context.
- `withoutDoc` and multi-key transactions: each journal entry has one `docKey`; a transaction's other entries stay.
- The editor's `canvas` object is new each render: every reader depends on `canvas.file` or `canvas.label`, strings.
- The notice for a never-existing in-shape segment, the effect's dependencies, and the straight apostrophe: routine call 9
  and the spec's Words.
- `generateMetadata` throwing on a failed templates read: `editorData` throws on the same cached read, by design.
- `ROUTED_EMPTY_ASK`'s aliases: the tests and the walk read them (R-170's one list); ", " is the spec's join.
- Two exports named `labelOf` in two modules: code names, not UI names.
- `record-theme-assembly.py`'s fixed indent and the immediate 404 read: T1's file is Ghost's default (130 bytes, read
  back byte for byte) and the read passed at Dev.
- "New template" live in a read-only editor: it navigates to Routes & Templates, outside the lock (7.16a's routine call
  15), as "Manage routes" does.
- The 15px plus (D5b 12px): judgement call 7, the menu's glyph size; recorded in the side-by-side.
- The design line only for a doc holding a section: FR-I3's "designed content" is AD-22's designed; an empty doc still
  goes and comes back.
- No server guard on a designed delete: the confirm reads the page's render, re-read after every write, and Undo restores
  row, doc and routes.
- Undo writes the parsed doc: every writer stores the parsed shape; 110g read it back byte-equal on production.
- 110f plants its route through the service key: judgement call 2; step 109 walks the sheet.
- An open editor keeps listing a template deleted elsewhere, or hides one restored by Undo, until its next save or a
  reload: routine call 10's `ponytail:` (no poll).

## Spec Change Log

- **2026-10-17, the Review, R-251 (Question 3, owner).** The Template menu's group heading reads "FROM ROUTES & TEMPLATES",
  the routes page's own title, where D5b draws "FROM THE ROUTES MANAGER". The frozen block's two mentions of
  `FROM THE ROUTES MANAGER` (Approach; I/O row "Switcher, templates") name that group by its drawn words and stand as
  written. Its words are R-251's, in Design Notes ("Words", routine call 5).

## Design Notes

### Rulings this spec is written to

- **R-74** sets the frames: D5b and D5f. **R-171** sets the row anatomy, the glyph and "Custom template". **R-172**
  highlights the row in force.
- **R-128:** the heading and New template ship together, and that pair is this story's (R-245).
- **R-129:** membership canvases keep their form and names. **R-245** made the split that created this story, and
  **R-249** moved its post-list half to Story 7.16c. **R-250** builds the deleted-template notice from B5a.
- **R-248:** a route's delete never deletes its template, so the designed-content warning belongs to the template's own
  delete.
- **R-7:** `compileTarget` refuses, and its A29 line spells the Routes Manager target `custom-{name}.hbs`.
- **R-170, R-98, R-82, R-238 and AD-36** are written into Boundaries.

### Ruled values (the one table a ruling changes)

Both ruled option 1 (owner, 2026-10-17).

| Question | Ruled, and built |
|---|---|
| 1 — split (R-249) | This story is the editor half without a post list. **Story 7.16c, "Collection and channel templates list their posts"**, comes straight after it in `sprint-status.yaml`. It takes the clauses in "Moved" below, word for word. |
| 2 — the notice (R-250) | The deleted-template notice is built from **B5a**'s strip (`lock-bar.tsx`). It is a 38px strip above the canvas: `paper-sunk`, with the `line` hairline, a 13px `CanvasCustom` glyph, the 12px sentence, and a 32px secondary **Dismiss** button. It stays until dismissed or until the next canvas switch. It is shown, not only announced. |

### Routine calls, one line each (said to the owner, not asked)

1. **One form, the route form, for every Routes Manager template.** Unrouted templates take it too, so adding or
   removing a route later never strands a section. No library design that reads a post's own fields targets
   `custom-{name}.hbs` (the PRD's category table).
2. **What `custom-{name}.hbs` means in a design's `compileTarget`.** It means every Routes Manager template: R-7's own
   spelling (`sections-inventory.md:672`). Membership files are named by the designs that fit them (A30).
3. **a4/13 and a22/1 gain the target.** Their categories are "any" (`sections-inventory.md:92`, the PRD's category
   table). a17/1 does not, because its pagination is fatal off a paginated target (R-7). a24/1 does not, because it
   binds `post`.
4. **The theme writes a Routes Manager template with no `{{#post}}` and no article** (F1). FR-J5's article stays on
   every template that has an entry.
5. **The switcher's tail is:** Template surfaces, rule, D5b's group heading (`FROM ROUTES & TEMPLATES` since **R-251**) and
   its rows, rule, New template,
   Manage routes. The heading shows only over rows ("an absent row asks no questions", R-128). D5b draws the group
   after Private; it predates the Template surfaces group, and this keeps every routing row together.
6. **Rows follow R-171's anatomy.** They show `CanvasCustom`, the display name and "Custom template", in `templatesOf`
   order. A row's mark is designed or **Empty**, never Auto-generated, because FR-D6 says a custom template is never
   synthesized. D5b's "Long read · Auto-generated" is the frame's slip, and behaviour is the PRD's (R-74's scope).
7. **The New template row is D5b's:** a plus glyph and "New template" at 600, with no caption line.
8. **New template opens Routes & Templates with its sheet open** (`?new=template`). Create from there opens the new
   canvas. Cancel leaves you on the page.
9. **A segment in the database's shape that names no template opens Home with the notice, not a 404.** Routine call
   10's switch covers it, and there is no database read before a `notFound()`.
10. **The editor learns a template is gone at load and at its next save of that canvas.** `ponytail:` there is no
    poll. Add one if an open editor sitting on a deleted template is ever seen.
11. **Delete runs config → doc → row; Undo runs row → doc → config.** `ponytail:` a save landing between the doc's
    delete and the row's can re-store the doc. `read.ts` and the sync ignore a `custom:` doc whose template is gone,
    and 7.18's card gets the matching reading.
12. **An unreadable stored routing counts as no route.** D5f then says "stops shipping". DW-362, 7.18's, owns the page
    side.
13. **No migration.** See Never.

### Moved (R-195), word for word — done at this Create's ruling (2026-10-17, R-249)

To **Story 7.16c, "Collection and channel templates list their posts"**, which goes straight after 7.16b in
`sprint-status.yaml`, with its card in `epics.md` and a line in Epic 7's preamble. Each clause is struck on 7.16b's
card with its destination:
- the clause "the canvas sizes a main feed by that route's own `limit:` wherever the template is reached through a
  collection that sets one, and a **channel or collection template created here is given its main feed at creation**
  through Story 5.19's designation rule (FR-H2, DW-252)";
- DW-344's second half: "and a main collection moved off `/` renders `/page/N/` in a context named after the route, not
  `index`, so FR-H2's `noindex` guard (`compileTheme`'s `PAGED_CONTEXTS`) names that context too, or this story records
  why it need not." 7.16a recorded the root half;
- the two readings that 7.16's Create handed to this card: every custom collection's and channel's own `paged` context,
  and the canvas's Home feed reading every post while the live `/` lists only unowned ones (FR-H3).

7.16c inherits R-7's "`custom-{name}.hbs` collection templates" with pagination.

Owners move with the clauses:
- DW-252 moves to 7.16c.
- DW-344 stays open under 7.16c.
- `epic-7-context.md`, the register (R-249, R-250; R-74's exceptions and R-245 noted), `deferred-work.md` and
  `compile.ts`'s `PAGED_CONTEXTS` comment follow.

### Words

All are new unless a frame string is quoted.
- **The switcher:**
  - the heading is "FROM ROUTES & TEMPLATES" — in D5b `:163`'s place, the routes page's own title for D5b's "the Routes
    Manager" (**R-251**, owner, 2026-10-17: R-170's one name);
  - each row's line is "Custom template" (`CUSTOM_TEMPLATE_CAPTION`);
  - the action row is "New template" (D5b `:178`), and "Opening…" while busy.
- **`ROUTED_EMPTY_ASK`** (D5f's dialog):
  - title "Delete the last section from {label}?";
  - body "This template keeps shipping, because {paths} shows it. Visitors there will see only your header and footer
    until you add a section.";
  - with two or more paths, they are joined with ", " and the verb is "show";
  - "Keep it" and "Delete section".
- **The routes page's delete window:**
  - designed, no route: "Its design goes with it. Undo brings it back.";
  - routed and designed: "Also removes {paths} and its design. Undo brings them back.";
  - routed alone is 7.16a's line, unchanged.
- **`TEMPLATE_GONE`:** "“{name}” is no longer one of your templates, so you're on Home." with "Dismiss".

### Walk (step 110, production)

1. On a project with no template, the Template menu shows no heading, then a rule, New template and Manage routes (the
   same as step 40, re-expected).
2. Press New template with the keyboard. Expect "Opening…", the skeleton, then the sheet with focus in Name.
3. Type a name and press Create. The editor opens `/custom-<slug>` with an empty canvas and the tab title.
4. In the switcher: the heading, then the row (glyph, name, "Custom template", Empty), highlighted.
5. Open the picker. a22/1 and a4/13 are offered; a17/1 and a24/1 are not, and the control is that they are offered on
   Home and Post. Place a22/1, press ⌘S, and confirm the doc is stored under `custom:<file>`. Reload: the mark reads
   designed.
6. On Routes & Templates, give the template a static route. Delete the last section: the dialog shows
   `ROUTED_EMPTY_ASK` naming the path. Press Keep it. Remove the route: the dialog shows `EMPTY_TEMPLATE_ASK` (the
   control).
7. On Routes & Templates, delete the designed template. The confirm carries the design line; press Cancel and nothing
   changes. Delete again and confirm: the rows are gone (a service read). Press Undo: the rows are back, and the doc is
   byte-equal.
8. Use two pages. Page A has the editor on the canvas; page B deletes the template. Page A presses ⌘S: the URL becomes
   Home, the notice shows, and the doc is not re-stored. Load the old address: Home and the notice again.
9. Clean up, then count users and projects before and after.

### Facts this spec rests on

Read in Ghost 6.58.0's and 5.130.6's source from the npm tarballs at this Create, 2026-10-17; T1 untouched.

- **F1 — a route's root carries no `post`.**
  - When a static route declares no `data:`, its controller renders `response = {}`
    (`core/frontend/services/routing/controllers/static.js:47-69` on 6.58.0, `:46-68` on 5.130.6).
  - `formatPageResponse` adds `posts`/`pagination` only from a list result, and `post` only from a `data:` page
    (`core/frontend/services/rendering/format-response.js:11-64`, both majors).
  - So `{{#post}}` prints nothing at a route's address, and the entry form (`compile.ts:1005-1013`) would blank every
    section. Inflozo writes no `data:` (7.16a). §83 executes this on T1.
- **F2 — a collection or channel puts `posts` and `pagination` at the root,** still with no `post` (the same
  function). That half is 7.16c's.
- **F3 — the canvas side is already flat.** `CONTEXTS_BY_TARGET` gives a custom file `none` plus the gettables
  (`placement.ts:108-111`), and `templateContext` gives it `@site`/`@config` alone (`orbit-weekly.ts:399`). Only
  `compilesTo` (`:134-135`) and the matrix row (`matrix.json:251-254`) are entry-shaped.

## Owner's manual test

Do this on the real site after Deploy, on a laptop at full width, signed in as yourself, on **Pilot sections**
(`b6d4db35-8e5e-45e1-a70f-4daa28916d51`). If it still has templates from an earlier test, delete them first on Routes &
Templates. Step 9 tests your ruling on Question 2 (R-250).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Open the Template menu (it says **Home**) and look at the bottom. | — | A line, then **New template** with a plus, then **Manage routes**. No "From Routes & Templates" heading yet. |
| 2 | same | Template menu | Press **New template**. | — | It reads "Opening…", a grey outline of the page shows, then Routes & Templates with the **New template** window already open. |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes?new=template` | New template | Type the name. Press **Create template**. | `Landing Test` | Under the name: `custom-landing-test.hbs` and "Ghost will show: Landing Test". After Create, the editor opens on an empty **Landing Test** canvas. The browser tab says Landing Test. |
| 4 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/custom-landing-test` | Template menu | Open the Template menu. | — | Near the bottom: **FROM ROUTES & TEMPLATES** (your Question 3 ruling), then a row with a template icon, **Landing Test**, the line "Custom template" and a small crossed-out circle at the right (hover: "Empty"). The row is highlighted, because it is open. It looks like D5b. |
| 5 | same | Canvas | Add a section. Look at what is offered. Add **Newsletter — Inline Row**. Press ⌘S. | — | Offered: Newsletter and Heroes (Latest Post), plus your header and footer. **Not** Post Grids or Post Headers. After saving, the menu's dot for Landing Test is filled. |
| 6 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Template menu → **Manage routes**. Press **+ Custom route**, choose "One of your templates" → Landing Test, and press **Create route**. Then press the back arrow, and open Landing Test from the Template menu. Delete the Newsletter section. | `/landing-test/` | A window: "Delete the last section from Landing Test?" — "This template keeps shipping, because /landing-test/ shows it. Visitors there will see only your header and footer until you add a section." Press **Keep it**: the section stays. |
| 7 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Delete the **/landing-test/** route (⋯ → Delete). Go back to Landing Test and try to delete the section again. | — | This time the window says "This template stops shipping…", the old warning, because no route shows it now. Press **Keep it**. |
| 8 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Templates | On **Landing Test** press ⋯ → **Delete**. Press **Cancel**. Do it again and confirm. Press **Undo**. Then go back to the editor and open Landing Test. | — | The window says "Its design goes with it. Undo brings it back.", with **Cancel** focused. Cancel changes nothing. Delete removes it. Undo brings it back, and in the editor the Newsletter section is still on Landing Test. |
| 9 | Window A: `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/custom-landing-test` · Window B: `…/routes` | Two windows side by side | In window A, keep the editor open on Landing Test. In window B, delete Landing Test and confirm (no Undo). Back in window A, change any setting on the section and press ⌘S. | — | Window A jumps to **Home**. A grey strip above the canvas says "“Landing Test” is no longer one of your templates, so you're on Home." with **Dismiss**. It looks like the strip the editor shows when the project is open somewhere else (your Question 2 ruling). |
| 10 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/custom-landing-test` | Editor | Type this old address into window A. | — | Home, with the same strip. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Template menu | Open the Template menu. | — | Back to step 1's picture: no heading, and no Landing Test. |

## Questions for the owner

All three were ruled option 1 (owner, 2026-10-17), and the spec is written to those rulings. Question 3 came from the
Review.

### Question 1 — Half of this story is only about templates that list posts. May I move that half to its own story?

**In plain English.** The card asks for two things.
- **The first:** open and design the templates you make on Routes & Templates. That covers the menu rows, New template,
  the warnings, Undo, and the move to Home.
- **The second:** a collection's or channel's template lists its posts the way Home does. That means a main list sized
  by that collection's own "posts per page", showing only the posts that address will show, with page 2 kept out of
  search engines when there is no list. It also means Home's own list leaving out the posts a collection takes.

The second half rebuilds the post-list machinery that Story 5.19 made for Home, Tag and Author, plus the sample and live
posts on the canvas. Together the two would be one of the largest stories yet.

**An example.** You make `/tutorials/` with a template "Tutorials List".
- After the first half, you open Tutorials List and design it with a hero and a newsletter row.
- After the second half, you can also put a post grid on it. The grid shows only tutorials, 10 per page if you set 10,
  and Home's grid stops showing them.

1. **(RECOMMENDED) Split it.** This story builds the first half. A new **Story 7.16c**, straight after, builds the
   second, with its criteria moved word for word. Both land before Story 7.18 deploys anything.
2. **One story.** Everything at once, bigger and riskier. I re-plan this spec first.
3. **Split differently.** Tell me where.

**Ruled: option 1 (owner, 2026-10-17).** *"Split it. This story builds the first half. A new Story 7.16c, straight after,
builds the second, with its criteria moved word for word. Both land before Story 7.18 deploys anything."* Recorded as
**R-249**. Story 7.16c, "Collection and channel templates list their posts", joins `epics.md` and `sprint-status.yaml`
straight after this story, carrying the moved clauses word for word (Design Notes, "Moved").

### Question 2 — The note shown when your open template is deleted was never drawn. May I build it from the strip above the canvas?

**In plain English.** Your rule R-74 says every screen comes from a drawing. Here is the case with no drawing: a
template you have open in one window is deleted in another, so the editor moves to Home and must say why. The nearest
drawing is the strip above the canvas that says the project is open somewhere else (B5a). Two other new sentences, the
routed warning and the delete window's design line, sit inside windows that are already drawn, so I am not asking about
those.

**An example.** A grey strip above the canvas reads: [template icon] "“Landing” is no longer one of your templates, so
you're on Home." [Dismiss]

1. **(RECOMMENDED) Build it from B5a's strip, exactly.** No new component, colour or size. You compare it at your test
   (step 9), and the Review records a side-by-side check.
2. **Draw it first.** I write the Claude Design prompt, and Dev waits for your export.
3. **No visible note, only a sentence for screen readers.** I don't recommend it: the plan asks for a notice.

**Ruled: option 1 (owner, 2026-10-17).** *"Build it from B5a's strip, exactly. No new component, colour or size. You
compare it at your test (step 9), and the Review records a side-by-side check."* Recorded as **R-250**, R-74's fourth
stated exception, for this story only.

### Question 3 — The Template menu calls the routes page by two names. May I use one?

**In plain English.** Open the Template menu on a project with a template of your own. Over your templates is a small
heading copied from the drawing: "FROM THE ROUTES MANAGER". Two rows below it, "Manage routes" opens a page whose title
is "Routes & Templates". So one page has two names in the same menu. Your rule R-170 asks for one name per thing, even
where a drawing says otherwise. Changing a word the drawing gives is yours to decide, so I am asking.

**An example.** The bottom of the menu reads:
FROM THE ROUTES MANAGER · Landing · + New template · Manage routes.
You press Manage routes and land on "Routes & Templates".

1. **(RECOMMENDED) One name: the heading reads "FROM ROUTES & TEMPLATES".** The page's own title wins, because it is what
   you see when you get there. One word list changes, and step 4 of your test would show the new heading.
2. **Keep the drawing's "FROM THE ROUTES MANAGER".** Nothing changes.
3. **Another wording.** Tell me which.

**Ruled: option 1 (owner, 2026-10-17).** *"One name: the heading reads "FROM ROUTES & TEMPLATES". The page's own title
wins, because it is what you see when you get there. One word list changes, and step 4 of your test would show the new
heading."* Recorded as **R-251**. `ROUTES_GROUP.heading` is "From Routes & Templates", set in capitals by the menu, and
`editor.test.ts` holds it to `ROUTES_WORDS.title`, so the two cannot drift apart. Step 4 of the owner's test reads the new
heading.

## Verification

**Commands (Dev):**
- `pnpm check` -- exit 0. This covers lint, typecheck, and the library's placement, matrix and validate tests (each
  refusal behind its control). It also covers `compile.test.ts` (flat Routes Manager template, membership unchanged),
  `agreement.test.ts` (the Routes Manager case), `editor.test.ts`, `picker.test.ts`, `apps/web/routes.test.ts` (the
  designed delete and its Undo) and `busy.test.ts` (New template, the sheet from `?new=template`).
- `pnpm keyboard` -- every journey passes, each re-pointed past the new tail.
- `pnpm build` -- exit 0. `node tools/check-traces.mjs` passes.
- `python3 tools/probe/record-theme-assembly.py` (main session, the owner's in-session go, T1 only) -- the §83 rows
  hold: the section renders at `/inflozo-probe-template/`, the entry-form control renders nothing there, and T1's
  theme and `routes.yaml` are restored with the file read back byte for byte. Ghost 5's half is DW-326's (R-238).
- `python3 tools/doc-audit.py --check` -- PASS, twice.
- `grep -rn --exclude=.env "hasDesign\|7.16b builds\|absent until Story 7.16b" apps packages tools docs` -- no live
  hit.

**Results (Dev, 2026-10-17, on the final tree; the main session re-ran every gate itself after the implementation
subagent returned, under Node 24 — on the shell's default Node 22 the web suite's timer tests fail, which is the
toolchain, not this story):**
- `pnpm check` -- exit 0. Every package's suite is green and prints its own count, including each 7.16b test named
  in the table below.
- `pnpm build` -- exit 0, with `/app/projects/[id]/[template]` and `/app/projects/[id]/routes` in the route table.
  `node tools/check-traces.mjs` -- "every route carries its files", including the routes page's new row: Undo's
  `docRefusal` reads the designs off disk.
- `pnpm keyboard` -- exit 0 on the final tree, every journey passed. The run before it had one failure:
  "choosing a Layers row scrolls the canvas …", which this story does not touch, settled at 111px where 24 was
  expected. It passed alone (`-g`), and then the whole gate passed.
- **T1** `ghost6.inflozo.com` (6.58.0) -- `python3 tools/probe/record-theme-assembly.py`, run in the main session on
  the owner's in-session go (2026-10-17, "Go", covering the recorder's whole run). Keys were read in-process by name
  through `record-shim.py`'s `load_env` and never printed. Result: **273 PASS, 0 FAIL**, exit 0, written as
  `MEASUREMENTS.md` §83. The §83 rows:
  - **Control:** `/inflozo-probe-template/` answered 404 before any write.
  - `GET settings/routes/yaml/` gave T1's own file (130 bytes), kept before any write. `POST settings/routes/yaml/`
    with one line added (`/inflozo-probe-template/: custom-probe-template`, 180 bytes) answered 200.
  - Under the route tree (`inflozo-probe-route-template`), the address answered 200. It drew A22 #1 with this run's
    ROUTE word at the route's root, with no `{{` or `}}` on the page (F1: the flat form draws).
  - **Control:** under the entry-form tree (`inflozo-probe-route-entry`, the same file inside `{{#post}}` and
    `POST_ARTICLE`), the address answered 200 with the site header drawn. It drew no A22 #1, no ROUTE word and no
    `<article>`: `{{#post}}` prints nothing at a route's root.
  - The restore: T1's own `routes.yaml` was uploaded back and read back byte for byte (130 bytes). The active theme
    read back `casper`. The address answered 404 again.
  - Every earlier leg (§70 to §81) re-ran and held: each probe theme was restored and deleted, the active theme read
    back `casper` after each leg, the logo was restored to none and the locale to `en`. The month's probe picture was
    reused, so no picture was uploaded. The Ghost 5 half is DW-326's (R-238).
- `python3 tools/doc-audit.py --check` -- PASS, twice.
- `git grep -n "hasDesign\|7\.16b builds\|absent until Story 7\.16b" -- apps packages tools docs` -- no hit.
  `git grep "CANVASES\["` in `apps/web` outside the tests finds only `lib/editor.ts`'s own readers (`fileOf`, `labelOf`,
  `captionOf`, `isMembership`, `isSurface`, each guarded by `isRouteCanvas`), `harness/stand-ins.ts` (the membership
  keys alone) and `lib/theme-settings.ts:105` (a `CanvasKey`, the subagent's `ponytail:` below). `MEMBERSHIP_FILES` and
  `SURFACES` are each defined once, in `vocabulary.ts`.
- **Added in the main session after the subagent returned:**
  - **The sheet's Create stays busy while the new canvas opens (R-98).** The subagent's version showed "Creating…" as
    the label but not `aria-busy`/`aria-disabled`, and a second press would re-submit. The Kit's `Submit` now takes an
    optional `pending`: work the action started that outlives it, such as the push. While it is true, the button stays
    busy and refuses a click or Enter's implicit one. `busy.test.ts` holds both.
  - **The orphan-doc row's own test** in `editor.test.ts`: `editorData` skips a gone template's `custom:` doc before
    it is parsed. The control is that a membership key is kept.
  - **The recorder's docstring** gained step 18 (§83) and its write list, and says it writes §83.
- **Not touched at Dev:** Supabase, Vercel, Resend, Dodo. The editor's and routes page's reads and writes reach
  production Supabase only once deployed, so they are step 110's and the Review's service reads. No migration, so no
  Schema phase (R-99).
- **The subagent's judgement calls, for the Review to check:**
  1. The probe file is `custom-probe-template.hbs`, because the theme's fingerprint scan refuses "inflozo" in partial
     paths. The route is still `/inflozo-probe-template/`.
  2. Walk 110f plants its route through the service key, since step 109 already walks the routes page's sheet.
  3. Step 6 is re-expected: `custom-x` and `custom-nonsense` are in the key shape and now answer 200 (Home with the
     notice). The 404 list is `custom--x` and `custom-Bad_x`.
  4. When the row delete fails, `deleteTemplate` puts the doc back, so a design is never lost with no Undo offered.
  5. The design line shows only for a doc holding a section. An empty doc is still deleted and restored with its
     template.
  6. Theme settings' "Which control" list names a Routes Manager page by its file (`ponytail:`).
  7. The "New template" plus is 15px, like the menu's other glyphs; D5b draws it at 12px.

**Matrix row → check** (`et` = `apps/web/editor.test.ts`, `art` = `apps/web/routes.test.ts`, `bt` = `busy.test.ts`,
`110x` = the walk at Review):

| Row | Check |
|---|---|
| Switcher, no template | et "the menu's words and the New template entry's address"; every keyboard journey re-pointed past the new tail (the harness has no template); 110a and step 40 |
| Switcher, templates | et "fileOf, labelOf and captionOf answer both kinds"; 110d (heading, row anatomy, Empty, highlighted) |
| New template | bt "New template says Opening…"; 110b (keyboard, the skeleton before the sheet, focus in Name) |
| Create from that entry | art "?new=template opens the New template sheet, and Create from it answers the file"; bt (Creating…, busy through the push); 110c |
| Cancel from that entry | 110b (Esc: the sheet closes, the page stays, nothing written) |
| Open | 110c (the tab title from the display name) |
| Stale address | et "a Routes Manager segment in the database's shape is a canvas"; et "an orphan doc is never a canvas"; 110h (the old address loaded) |
| Bad shape | et (`custom-Bad_x`, `custom--x` are no canvas, a synchronous 404); step 6 re-expected |
| Offered | `placement.test.ts` "offeredOn: a4/13 and a22/1 … a17/1 and a24/1 never are", "compilesTo: ROUTE_TEMPLATE_TARGET …"; `contexts.test.ts` route and entry rows, each the other's control; 110e (its control on Home and Post, 110a) |
| Compiled | `compile.test.ts` "(7.16b) a Routes Manager template compiles flat …" (routed, unrouted, emptied; `custom-signup.hbs` unchanged); `agreement.test.ts` "Story 7.16b — a Routes Manager template: the canvas and the theme agree node by node"; T1 §83 |
| D5f, unrouted | et "D5f's routed sentence" (its control: no route → `'stops'`); 110f's control |
| D5f, routed | et "D5f's routed sentence" (`'keeps'`, the paths, "show"/"shows"); 110f |
| Delete, designed | art "the delete window says what goes"; art "every in-between state is valid — config, doc, row"; 110g (opens on Cancel, Cancel writes nothing, Delete takes both) |
| Undo | art "every in-between state is valid — … its Undo row, doc, config"; art "the Undo's doc is judged as the sync route judges one"; 110g (row exact, doc byte-equal, routes_config as it was) |
| Open editor, template deleted | et "the sync route never re-creates a deleted template's canvas"; `journal.test.ts` "withoutDoc drops a gone template's work"; 110h (two pages, ⌘S, Home, the strip, the doc not re-stored) |
| Orphan doc | et "an orphan doc is never a canvas"; et (the sync's `left`); 110h |

**Review (R-82):** walk step 110 on production at the deployed head, each run recorded, with Supabase service reads for
the stored rows. Also re-run step 40 and step 109.

**Review results (2026-10-17), on the real infrastructure — part 1, at the Dev head `ee72796a`, run in the main session
(keys read inside each process by name, never printed):**
- CI on `ee72796a` (`GITHUB_TOKEN`, a scratch script): run 39039115314 with `check`, `rls` and `deploy` all success, and
  the render matrix (39039115312) success. Vercel (`VERCEL_*`): `dpl_7L4RpmFSDdejwYZd24VngCmChWc1` READY at `ee72796a`,
  the deployment app.inflozo.com serves.
- **The Real-infra verifier (read-only):**
  - **R-99, production's schema:** no migration in the diff. Through `SUPABASE_DB_POOLER_URL`, in a read-only
    transaction, `template_key_shape` on `project_templates` and `project_template_prefs` accepts
    `custom:custom-probe-template.hbs`, `custom:custom-landing-page.hbs` and `custom:custom-a1-b2.hbs`. **Control:** it
    refuses `custom:custom--x.hbs`, `custom:custom-Bad_x.hbs`, `custom:x.hbs`, `custom:custom-.hbs` and `custom-x.hbs`.
    The constraint's own text was evaluated, and no row was written. `ROUTE_SEGMENT` gave the same answer on every vector.
  - `authenticated` holds select, insert, update and delete on `project_templates`, `custom_templates`, `routes_config`
    and `project_template_prefs`, and select alone on `deployed_template_names`. **Control:** `anon` holds none. RLS is on,
    with owner policies on all five.
  - `sync_project_doc`'s body equals the newest migration's (md5 match).
  - **T1** (6.58): `/inflozo-probe-template/` answers 404, and `/` answers 200 (the control). The active theme is
    `casper`, with no `inflozo-probe-*` theme left. `settings/routes/yaml/` is T1's own 130-byte file with no probe line.
    **Control:** a key that does not exist answers 401. §83's restore holds.
- **Step 110 on production, a cut of steps 1–5 + 110 from a detached worktree at `ee72796a`** (`node_modules`
  hard-linked, never committed): **0 FAIL, 60 PASS, first run.** Every row passed:
  - 110a: the tail with no template, and the picker's control on Home and Post;
  - 110b: by keyboard, "Opening…" with `aria-busy`, the skeleton before the sheet, focus in Name, and Esc;
  - 110c: Create opens `custom-walk-landing` empty, titled "Pilot sections · Walk Landing — Inflozo";
  - 110d: the group, the row and its Empty mark;
  - 110e: a22/1 and a4/13 offered, a17/1 and a24/1 not, and the doc stored under `custom:custom-walk-landing.hbs`;
  - 110f: `ROUTED_EMPTY_ASK` naming `/walk-landing/`, with its control `EMPTY_TEMPLATE_ASK`;
  - 110g: the design line, Cancel writing nothing, Delete taking the row and the doc, and Undo with the row exact and the
    doc byte-equal;
  - 110h: two pages, the ⌘S moving Home with the strip (38px, `rgb(239, 236, 231)`) and `#editor-said`, nothing
    re-stored, the old address doing the same, and Dismiss handing focus to the switcher;
  - 110i: handed back with zero CSP violations.

  Users 14 → 14, projects 10 → 10.
- **The whole walk at `ee72796a`:** 1578 PASS and 0 FAIL until it died on a harness hold in step 106's save
  (`page.waitForResponse` timeout at 14:52:47Z, `posted104` inside `save106`). Two stall notes were each retried once.
  Step 40's 22 rows, re-expected for the new tail, all passed. Steps after 106 were not reached by that run, so it is not a
  result for them.
- **Steps 109 + 110, a second cut at `ee72796a`,** with the Review's new 110c check (the patched walk's 109–110 over the
  deployed modules): **0 FAIL, 107 PASS.** Step 109 (7.16a) held whole. The new check passed: Name never turned refused
  between Create and the canvas (`{"creating":true,"refused":null}`). Users and projects were unchanged.
- **The side-by-side frame check (R-74, R-250).** The walk's `switcher-routes-1440x900` and `template-gone-1440x900`
  (production) were set beside D5b and B5a, each rendered read-only in Chromium from the export.
  - **D5b** matches in components, layout, copy and tokens:
    - the rule (`line`, 5px 4px);
    - "FROM THE ROUTES MANAGER" at 10/600 in `ink-soft` capitals, 0.04em, padded 2/10/5 (its words "FROM ROUTES &
      TEMPLATES" since R-251, after this check);
    - unindented rows of the name over one line;
    - a second rule;
    - "New template" with a plus at 600 and no line.

    The differences are the stated ones: R-171's glyph and "Custom template" under the name for the frame's mono file;
    R-172's coral row in force; the mark R-130's (never the frame's "Auto-generated", routine call 6); the plus at 15px for
    12px (judgement call 7, the menu's glyph size); the group after Template surfaces (routine call 5); and 7.16a's "Manage
    routes" last.
  - **B5a** (R-250) matches: a 38px strip above the canvas, `paper-sunk` (`#EFECE7`, measured `rgb(239, 236, 231)`) on the
    `line` hairline, 12px side padding and 9px gaps, a 13px glyph where the padlock is, the 12px sentence in
    `ink-soft-aa`, and the Kit's 32px secondary button at the right. Its size and ink are `LockBar`'s own, so the two
    strips are one class (`STRIP`). The frame draws its button 26px; the ruled value is the Kit's 32px, as B5a's
    "Request editing" ships.
  - **D5f** is the existing dialog. 110f read its routed title, body and mono chip on production.
- `pnpm check` on the patched tree (Node 24): exit 0. Every package's suite is green and prints its own count. The new
  rows are `compile.test.ts`' reach assertion (**control:** under the old rule it fails, and it passes again restored),
  `routes.test.ts`' delete, Undo, creation and `?new` rows, `editor.test.ts`' sync rows, and `settings.test.ts` /
  `translations.test.ts`' template names.
- `pnpm build`: exit 0. `node tools/check-traces.mjs`: every route carries its files, the routes page among them.
- `pnpm keyboard`, whole, on the patched tree: 237 passed and 1 failed, the 7.13 divider journey. That journey died on
  "Execution context was destroyed" inside `cardsCssOf`. Run alone it passed 3 of 3. With the helper hardened (Review
  Findings), the 7.13 journeys passed 11 of 11. CI's `check` runs the whole gate on the push.

**Review results — part 2, at the Review head `cac8a7a9`** (the main session again):
- CI on `cac8a7a9`: run 39044642785, with `check` (which runs `pnpm keyboard` whole), `rls` and `deploy` all success, and
  the render matrix (39044642727) success. Vercel: `dpl_8kpWvSeJNbQNg1hVhB1nJtu7Qbez` READY at `cac8a7a9`.
- **Steps 109 + 110 on production, the same cut from the worktree moved to `cac8a7a9`.**
  - **Run 1:** 109c, 109d, 109h's `/craft-picks/` control and 109i FAILed, then a HARNESS ERROR (`locator.click` timeout,
    15:43:37Z). Every step 110 row before it passed. Vercel's request rows show why. The routes page's action POSTs stop
    for about 29 seconds after 15:41:06 and for 75 seconds after 15:41:55, each a press the walk made and waited on: the
    ⌥↑ reorder's save, then the `/craft-picks/` save and `/craft/`'s delete. None of those POSTs reached Vercel (DW-204's
    class). 109d's FAIL follows from 109c's lost save.
  - **Run 2, the same build straight after:** **0 FAIL, 107 PASS.** Step 109 (7.16a) held whole. Step 110 held whole on
    the patched code:
    - 110c: Create made the row through `insertTemplate`'s clear, and Name never read refused. The observer heard
      "Signup" refused first (its control).
    - 110g: the delete took its doc in the delete itself, and Undo brought back the row exactly, the doc byte-equal and
      the routing as it was.
    - 110h: page A's only edit was on the gone template, so its ⌘S met the sync route as patched (the lock first, then
      the template read and the no-write answer). It still moved the editor to Home with the strip and stored nothing.

    Users 14 → 14, projects 10 → 10, in both runs.
- The review leaves the story in review: Deploy and the owner's test follow (R-80).

**Review results — part 3, R-251 at `b8ed7bf1`** (Question 3 ruled; the main session):
- CI on `b8ed7bf1`: run 39049615410, with `check`, `rls` and `deploy` all success, and the render matrix (39049615356)
  success. Vercel: `dpl_A1DV7NGXUdksimJefBsbNBbn1SzJ` READY at `b8ed7bf1`. `pnpm check` exit 0 before the push.
- **Step 110 on production** (the same cut, from a worktree at `b8ed7bf1`):
  - **Run 1:** 110d read the heading as "FROM ROUTES & TEMPLATES" over the one row, and 110a read no heading over no
    rows. Both rows derive the words from `ROUTES_GROUP`. The Section Picker then never opened: ⌘K offered nothing on Home,
    Post or the template, so 110a's picker control and 110e FAILed, and a HARNESS ERROR (`locator.click` timeout,
    16:49:50Z) ended the run. Nothing the picker reads changed since `cac8a7a9`, where it opened in every run.
  - **Run 2, straight after:** **0 FAIL, 61 PASS**, the heading included.

  Users 14 → 14, projects 10 → 10, in both runs.
