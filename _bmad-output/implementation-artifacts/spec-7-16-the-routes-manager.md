---
title: 'Story 7.16 — The Routes Manager'
type: 'feature'
created: '2026-10-16'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story the editor's Template menu ends with **Manage routes**, which opens a new page, **Routes & Templates**,
where you give parts of your site their own address without writing any code: a **collection** like `/tutorials/` that
gathers the posts matching conditions you pick (a tag, a writer, featured, members-only, a publish date), with its own
number of posts per page; a **custom route** like `/landing/` that shows one template you name, or a **channel** like
`/reading-list/` that lists matching posts with its own RSS feed while every post keeps its usual address; your own
**templates**, named once with the exact file name and the label Ghost will show; and the addresses of your tag and
writer pages. On the right you watch the `routes.yaml` file Ghost will receive rewrite itself after every change, with
a green "Valid" line or a red line naming the exact line that is wrong; you can copy or download it. Anything you
delete comes back with **Undo**, a name or address that would clash is refused before it is saved with the reason, and a
project with no routing shows "Your site uses Ghost's default routing. Nice and simple."

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-I2 and FR-I3 have no surface. `routes_config` and `custom_templates` have existed since Story 1.2 and
have never been read or written (`template-switcher.tsx:46-49`). No code emits `routes.yaml` or a filter. So no project
can have a collection, a channel, a custom route or a custom template, Story 7.17 has nothing to upload, and
`compileTheme`'s `routed` input (Story 7.3) has no caller that can fill it. The plan also carries two claims about
Ghost that its source disproves (Design Notes' facts):
- the index collection is drawn and specified **first** (`EXPERIENCE.md:747`), which leaves every other collection
  empty;
- a relative publish-date filter is said to track the clock. In a collection it tracks the clock only for the listing.
  The posts each collection owns stay fixed from when Ghost started.

**Approach:**
- **One pure module** `packages/section-runtime/src/routes.ts` holds the config's schema, the filter builder, the
  `routes.yaml` emitter, the validator and the naming rule. It is read by the page, by its server actions, and later by
  Stories 7.16b, 7.17 and 7.18.
  - Emission: the builder emits NQL from a condition model and re-reads only its own grammar to prove the round trip.
    The custom collections go in your order, and the index collection goes **last**, carrying the inverse of every
    collection's filter.
  - Proof: Ghost's own parsers check every shape in tests, on both majors, and a T1 run uploads and restores one file.
- **The page** is `projects/[id]/routes`, built from `S9 Routes.dc.html` S9a–S9e as `EXPERIENCE.md` re-specifies it,
  beside Theme settings' shape.
  - Each sheet's primary button, each drop and each taxonomy save writes through a server action, so the YAML pane is
    always the saved state, re-rendered.
  - Deletes come back with Undo.
- This plan is written to Question 1's recommended split: the editor's half becomes Story 7.16b (Design Notes,
  "Moved").

## Boundaries & Constraints

**Always:**
- **The frame is `S9 Routes.dc.html` S9a, S9b, S9c, S9d and S9e** as `EXPERIENCE.md:177-179, :353, :747` re-specify it.
  - **The parts no frame draws** are built from the nearest drawn component, exactly, as Question 3 rules (its list is
    the only list).
  - Tokens are the Kit's, never the frame's inline hex. YAML is mono, with line numbers in `--ink-soft-aa`
    (`DESIGN.md:343`), and sheets use the `modal` elevation and a 16px radius (`DESIGN.md:202, :436`).
  - Every input has a `<label for>` (A7 item 9).
  - The one behavioural difference from S9a's drawing is that its YAML lists the index collection first, and the build
    lists it last (Design Notes' facts, standing rule 1).
- **R-170 and standing rule 4.** Every sentence the page says is one exported list, `ROUTES_WORDS` in
  `apps/web/lib/routes.ts`, and the deployed walk reads it.
  - The frame's strings are kept verbatim, except those listed in Design Notes' routine calls.
  - The posts-per-page sentence links "theme setting" to Theme settings, never to Ghost Admin (the epic's copy rule).
- **AD-36 — `routes.yaml` is a new sink.** The emitter writes only values that passed `parseRoutesConfig`'s grammars:
  - paths: one segment, `^/[a-z0-9]+(?:-[a-z0-9]+)*/$`;
  - templates: `CUSTOM_TARGET_RE`;
  - slugs: `GHOST_SLUG_RE`;
  - limits: integers from 1 to 100, `POSTS_PER_PAGE`'s bounds.

  NQL values are always single-quoted, except booleans, `null` and relative terms. Every `filter:` is a double-quoted
  YAML scalar that can never contain `"` or `\`, and the emitter asserts it. A hostile/legitimate pair joins
  `ad36.test.ts`.
- **The parenthesis rule (FR-I2), on the emitted string:**
  - no group is ever the sole content of another group;
  - **no filter is ever one group wrapped whole**, because Ghost wraps every filter as `(${filter})+type:post`;
  - a single-child group is flattened;
  - "all of" two tags is `tag:'a'+tag:'b'`, never `tag:[a+b]` (Ghost 6 only).

  The runtime round trip re-reads the emitted string with the builder's own reader and requires it to equal the
  normalised model. No third-party NQL parser is a runtime dependency (FR-I2). Ghost's own `@tryghost/nql` is a test-only
  devDependency.
- **AD-1 and AD-14:** `routes.ts` is pure and deterministic. It uses no clock, no `Intl` and no locale readers. The
  naming rule's slug is §7.4's (`prd.md:666`).
- **Writes:**
  - Every write goes through a server action in `routes/actions.ts`, in the house shape (`settings/translations/actions.ts:10-24`):
    the id from the form, `isUuid`, the whole next config re-validated server-side before any write, RLS through
    `supabaseServer()`, `.select()` to catch a zero-row write, then `revalidatePath`.
  - `routes_config` holds `config` and `yaml`. `yaml` is the emitter's output, and null while the config is Ghost's
    default.
  - Each multi-write is ordered so that every intermediate state is valid: a template's delete writes the config
    without its routes first, then deletes the row.
- **R-98:** every primary button is the Kit's `Submit` with a present-tense busy label. "Manage routes" says "Opening…".
  `routes/` has its own `loading.tsx` in the page's shape. `busy.test.ts` holds both.
- **R-82 and R-238:** review and test run on production (Supabase, Vercel) and on T1 alone. The T1 upload is asked of the
  owner in the Dev session and runs in the main session (memory's rule).

**Ask First:**
- **All four questions below**, before Dev. The spec is written to each one's recommended option, and each ruled value
  lives in one place: Design Notes' "Ruled values" table.
- The T1 upload-and-restore run (R-82, R-238): ask in the Dev session for the whole run, before the first write.
- Any undrawn part beyond Question 3's list, or any change to a frame string beyond the routine calls.

**Never:**
- Any editor-side change beyond the "Manage routes" row. Custom canvases, the switcher's `FROM THE ROUTES MANAGER`
  group, "+ New template" in the switcher, DW-126, DW-252, DW-344's editor half and D5f's routed sentence all belong to
  Story 7.16b (Question 1).
- A `data:` key, a multi-segment path, `order:`, `rss: false`, `content_type`, a `routes:` entry for `/`, a route to a
  membership template, `/search/`, or an all-tags or all-authors route (FR-I5 makes those last two 7.17's).
- Uploading anything to a customer's Ghost (Story 7.17), or a Ship-button state (Story 7.18, moved below).
- A migration. The tables exist; nothing here needs a new column, function or constraint.
- Editing `claude-design-export/`, a `record` document or a generated file, or writing a count down.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default | no row, or a config with no collection, no route and default taxonomies | `routesYaml` → null; the page is S9d when no template exists either, else S9a with the Templates list and an empty pane line | — |
| One collection | `/tutorials/`: tag any of [`tutorials`], template `custom-tutorials.hbs`, limit 10 | `collections:` holds `/tutorials/` (permalink `/tutorials/{slug}/`, `template: custom-tutorials`, `filter: "tag:'tutorials'"`, `limit: 10`), then `/:` (`permalink: /{slug}/`, `template: index`, `filter: "tag:-'tutorials'"`); taxonomies default | — |
| Collection order | A then B, each with All of two conditions | A first, B second, `/` last with `filter: "(¬a1,¬a2)+(¬b1,¬b2)"` (¬ = the flipped condition) — sibling groups only, never `((` | — |
| Single condition / Any | Any of one condition | no parentheses anywhere; never one group wrapped whole | — |
| Multi-value | tag any of [`a`,`b`] / none of | `tag:['a','b']` / `tag:-['a','b']`; one value is `tag:'a'` | — |
| Channel | `/reading-list/`, published within the last 30 days, template `custom-reading-list.hbs` | under `routes:` — `controller: channel`, `filter: "published_at:>now-30d"`, `template: custom-reading-list`; no `limit:` unless set | — |
| Static route | `/landing/` → `custom-landing.hbs` | `routes:` `/landing/: custom-landing` | — |
| Taxonomy | tag prefix `topic` | `taxonomies:` `tag: /topic/{slug}/`, `author: /author/{slug}/` | — |
| Path collision | two of {collection, channel, route, taxonomy prefix} on one segment | refused before any write; the sentence names both | nothing written |
| Reserved segment | `/page/`, `/index/`, `/home/`, `/tag/`, `/rss/`, `/ghost/`, a Ghost context name… | refused with the reason | — |
| Unknown template | a stored config naming a file not among the project's `routes` templates | S9b: the line and its reason; any save carrying it refused | stored → S9b |
| Name collision | a display name whose file is another template's, a membership file, or one in `deployed_template_names` | refused at the naming step with why | the `23505` backstop → the same sentence |
| Bad name | slugs to nothing, a reserved stem (`prd.md:666`), or longer than Ghost's column allows | refused at entry, with the reason | — |
| Relative date in a collection | (Question 2, option 1) not offered; a stored one is refused | S9b line | — |
| Hostile values (AD-36) | a path carrying `:` or a newline, a slug `x'+tag:y`, template `../x`, limit `"abc"`/0/101, a stored non-object | refused by the schema; nothing reaches the YAML | stored → S9b line 1 |
| Parenthesis plant | a model whose emission would nest `((` or wrap whole | the validator refuses it; the round trip mismatches | — |
| Delete collection, channel or route | ⋯ → Delete | gone at once, Undo toast; Undo writes the previous config back | a failed write says so, keeps the item |
| Delete a used template | ⋯ → Delete on a template that routes name | confirm lists every route it removes, opening on Cancel; config first, then the row; Undo restores both | row delete failed → the template stays, unrouted |
| Delete a template with a design | a `project_templates` row for `custom:<file>` (unreachable before 7.16b) | refused with one sentence; 7.16b builds the warning | — |

</frozen-after-approval>

## Code Map

- `packages/section-runtime/src/routes.ts` -- NEW, pure. It holds:
  - `parseRoutesConfig` (zod, AD-6);
  - `filterNql` and `readNql` (the builder and its own reader);
  - `indexFilter` (the inverse);
  - `routesYaml` (the emitter);
  - `validateRoutes` (`{ line, at, message }[]`);
  - `templateName` (display → slug, `custom-{slug}.hbs`, Ghost's label);
  - `routedOf` (the `custom-*.hbs` files any route names, for `compileTheme`'s `routed`);
  - `RESERVED_SEGMENTS`.

  Siblings to copy the shape from: `custom-settings.ts:99-104` (`POSTS_PER_PAGE`, and Ghost not capping a route's page
  size) and the 7.9 builder.
- `packages/section-runtime/package.json` -- export `./routes`. Test-only devDependencies:
  - `@tryghost/nql` at Ghost 6.58.0's pin (0.13.4) and at 5.130.6's (0.12.7, as an npm alias);
  - `js-yaml` at 4.3.0, Ghost 6.58.0's own routes parser.
- `packages/section-runtime/src/ad36.test.ts:738-766` -- the 7.12 pair is the pattern for an `AD-36 (7.16) · …` pair.
- `packages/library/src/vocabulary.ts:530` -- `GHOST_SLUG_RE`, the one slug grammar. `CUSTOM_TARGET_RE` is the custom
  file grammar (`compile.ts:843-845` throws on anything else in `routed`).
- `packages/theme-compiler/src/compile.ts`:
  - `:114-115` is `routed`, read and not changed. Story 7.18 is its first production caller, through `routedOf`.
  - `:216-223` is `PAGED_CONTEXTS`. Only its comment changes, recording why `index` stays right (DW-344's second half).
- `supabase/migrations/20260904120000_complete_schema.sql`:
  - `:274-288` `custom_templates`, which has no filename CHECK, so parse on read and ignore a row outside
    `CUSTOM_TARGET_RE`;
  - `:292-300` `deployed_template_names`, select-only;
  - `:356-363` `routes_config`;
  - `:1319-1347` the name guard (`23505`).

  RLS gives `authenticated` full CRUD on both writable tables (`:1016-1026`).
- `apps/web/app/(app)/app/(authed)/projects/[id]/settings/layout.tsx` and `actions.ts`
  (`setPostsPerPage` `:150`, `deleteSetting` `:284`) -- the page-and-actions shape to mirror. `theme-settings.tsx:136-160`
  is the `StepperBox` Posts per page control that the page size reuses.
- `apps/web/lib/editor.ts:187-192` -- `SETTINGS` and `TRANSLATIONS`. Add `ROUTES` and `routesPath` in the same R-131
  pattern, plus `editor.test.ts`'s refusal that `routes` is never a canvas.
- `apps/web/components/editor/template-switcher.tsx:192-198, :268-275` and `bar-menu.tsx:59` (`BarMenuRow`) -- add the
  "Manage routes" row at the menu's end after a rule. Leave the R-128 comment `:46-49` standing for 7.16b. Add a Tabler
  `route` glyph to `kit/icons.tsx`.
- Kit pieces:
  - `condition-row.tsx` (`ConditionRow`, the 7.9 builder's row);
  - `segmented.tsx` (All conditions | Any);
  - `radio-card.tsx` (S9e's choice);
  - `select.tsx`;
  - `input.tsx`;
  - `badge.tsx` (`TagChip`);
  - `stepper.tsx` (`StepperBox`);
  - `toggle.tsx`;
  - `grip.tsx` (`DragGrip`);
  - `dialog.ts` (sheets; add a 480px one beside `sheet` and `wideSheet` if S9c's width is not there);
  - `toast.tsx` (add `onAction` — the action button is inert today);
  - `submit.tsx`.
- `apps/web/lib/reorder.ts` and `components/controls/item-list.tsx:150-168, :235` -- THE ONE DRAG: pointer, ⌥↑/⌥↓, and
  the screen-reader hint.
- `apps/web/lib/live-content.ts:95-98` (`LISTS.tag`, `LISTS.author`) and `lib/live-client.ts` -- the site's tags and
  writers for value suggestions, when the project's linked site is readable.
- `apps/web/server/site-health.ts:71-105`, `server/ghost-admin/admin-rule.ts:123` -- 7.17's upload and drift reads,
  which consume `routes_config.yaml`. They are not touched.
- `tools/probe/run-verify-editor.cjs` (header `:262`, step 108 `:9358`) and `seed-editor-project.mjs` -- step 109.
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/VERIFY-AT-BUILD.md:249-251, :305-316`
  -- the two registers (DW-361).

## Tasks & Acceptance

**Execution:**
- [ ] `VERIFY-AT-BUILD.md` + every live citation -- DW-361, done first, before anything cites register 1's item 60.
  - The second register's 59 and 60 become **63 and 64**, the next free numbers.
  - These citations are repointed: `MEASUREMENTS.md` §56 and §57, `epic-3-context.md:74`, `epic-5-context.md:47` and
    `epic-7-context.md:405`.
  - `spec-5-24b-…:449,:1033`, `spec-7-15-…:103` and `deferred-work.md` DW-40 and DW-50 are closed, so they keep their
    words with a dated note.
  - DW-361 closes.

  -- standing rule 4: a number that names two things names neither.
- [ ] `packages/section-runtime/src/routes.ts` + `routes.test.ts` -- the module, exactly as Design Notes' shape. The tests:
  - every I/O row;
  - every emitted filter parsed by Ghost 6.58.0's and 5.130.6's `@tryghost/nql`, **bare and as `(${f})+type:post`**,
    deep-equal to the intended Mongo JSON (relative terms checked by shape);
  - `readNql` agreeing with Ghost's parser on every fixture;
  - every emitted file `js-yaml.load`ed to the intended object;
  - determinism;
  - the parenthesis plant refused;
  - each refusal behind a passing control.

  -- one source for the page, the actions and 7.16b, 7.17 and 7.18.
- [ ] `packages/section-runtime/src/ad36.test.ts` -- `AD-36 (7.16)`: a hostile path, slug, template and limit never
  reach `routes.yaml`, and a sound config emits. -- AD-36 on arrival.
- [ ] `tools/probe/record-routes.mjs` (+ its catalogue row in `tools/doc-audit.py`) -- MEASUREMENTS **§82**.
  - **The local half** downloads the 6.58.0 and 5.130.6 tarballs (read-only) to a fresh temp dir. It runs Ghost's own
    `route-settings-parser.js` (6) and `validate.js` (5) over every fixture `routes.test.ts` writes. Each must be
    accepted. Control: a planted `limit: abc` refused on 6.
  - **The `--t1` half** (main session, the owner's go) runs these steps, each as its own check:
    1. Read T1's routes.yaml.
    2. Upload one emitted file: a tag collection with `limit: 2`, a featured channel, and the index last.
    3. Read back: the tagged post's address is `/<collection>/<slug>/`; the collection lists that tag's posts two per
       page; `/` does not list them; and the channel's `/rss/` serves.
    4. **Control:** the same file with the index FIRST renders the collection with no posts.
    5. Restore the original and compare it byte for byte.

  Only an explicit `--t1` writes (memory: recorders ignore `--help`). -- standing rule 1 for every Ghost claim the page
  makes ("Ghost will accept this routing").
- [ ] `apps/web/lib/routes.ts` -- `ROUTES_WORDS` (every string in Design Notes' "Words"), `routesPath`. -- R-170.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/routes/{page.tsx,loading.tsx,actions.ts,routes-manager.tsx}` -- the
  page.
  - **The page:**
    - The server reads the following in one `Promise.all`:
      - `routes_config`;
      - `custom_templates` (kind `routes`, parsed);
      - `deployed_template_names`;
      - `project_templates` keys under `custom:`;
      - `posts_per_page`;
      - the linked site's name and content access.
    - **S9a:**
      - the bar: back to the editor, the title and the site chip;
      - Collections, as drawn, with a `DragGrip` and ⌥↑/⌥↓;
      - Custom routes;
      - **Templates** (Question 3);
      - Taxonomies, editable;
      - the YAML pane: banner, header, Copy and Download, numbered lines.
    - **S9b** is any `validateRoutes` error. **S9d** is the empty state.
  - **The sheets** — S9c, S9e and New template — share one naming block, one condition block and one page-size block.
  - **The actions:**
    - `saveRoutes`, which takes the whole next config;
    - `createTemplate`;
    - `deleteTemplate`, which writes the config without the template's routes, then deletes the row, and refuses when a
      design exists;
    - `restoreTemplate`, the Undo, which re-inserts the row and writes the previous config.

  -- FR-I2, FR-I3.
- [ ] `apps/web/lib/editor.ts`, `components/editor/template-switcher.tsx`, `components/kit/icons.tsx` -- the `ROUTES`
  segment and the "Manage routes" row. Re-point any keyboard journey that walks the switcher by row count (7.13's "End
  then ↑" precedent). -- the entry S9a's caption names.
- [ ] `apps/web/components/kit/toast.tsx`, `dialog.ts` -- `onAction`, and the 480px sheet if missing. -- Undo; S9c's
  width.
- [ ] `tools/probe/run-verify-editor.cjs` -- **step 109**, on production. It walks Design Notes' "Walk" list, keyboard
  only where the list says so, against `ROUTES_WORDS`, and cleans up to S9d. -- the page on real infrastructure (R-82).
- [ ] Propagation (standing rules 3 and 7):
  - `EXPERIENCE.md:747` and A9 item 8's note get a dated correction: the index collection goes last, with the inverse
    filter. Cite §82.
  - `prd.md` FR-I2 gets a dated correction, per Question 2's ruling: a relative date tracks the clock in a channel; in
    a collection Ghost fixes ownership at start.
  - FR-I3 per Question 4.
  - `VERIFY-AT-BUILD` gets new items **65** (collection order decides ownership and what each listing shows) and **66**
    (the singular `author:` filter, deprecated for themes by gscan, is still accepted in `routes.yaml`). Both are
    re-read at each major.
  - Story 7.18's card gets the Ship clause word for word.
  - `PAGED_CONTEXTS`' comment.
  - DW-344's entry records its second half.
  - `epic-7-context.md` gets sub-bullets.
  - Finish with a grep for "index collection first" and "always first".
- [ ] `python3 tools/doc-audit.py --check` twice, then `pnpm check`.

**Acceptance Criteria:**
- **Matches the frame (R-74).** Given the deployed page at 1440, when it is compared with `S9 Routes.dc.html`, then:
  - S9a, S9b, S9c, S9d and S9e match their frames in components, layout, copy and tokens, apart from the routine calls
    and the YAML's index position;
  - each part on Question 3's list matches the drawn component it is built from;
  - the Review records a side-by-side check.
- Given a collection, a channel, a route, a template and a taxonomy change saved in any order, when the page reloads,
  then the YAML pane, the cards and `routes_config.yaml` agree byte for byte with `routesYaml(config)`.
- Given every emitted filter, when Ghost 6.58.0's and 5.130.6's NQL parse it as `(${f})+type:post`, then the result is
  the intended filter AND `type:post`, never a `yg` key (the bracket bug).
- Given every fixture `routesYaml` writes, when Ghost's own route-settings parser reads it on both majors, then it is
  accepted (§82).
- Given T1, when one emitted file is uploaded, then ownership, the per-route `limit:` and the channel's feed hold as
  `routes.ts` says, the index-first control shows the empty collection, and T1's own file is restored byte for byte (§82).
- Given a name, path or value the validator refuses, when Create or Save is pressed, then nothing is written and the
  sheet says why in `ROUTES_WORDS`' sentence.
- Given any delete, when Undo is pressed before the next change, then the page and the stored rows return to exactly
  what they were.
- Given the Template menu, when "Manage routes" is pressed, then it reads "Opening…" and the routes page's own skeleton
  shows before the page (R-98).

## Spec Change Log

## Design Notes

### Rulings this spec is written to

- **R-74.** The frame is S9a–S9e. Undrawn parts follow Question 3.
- **R-128.** "+ New template" in the switcher and the `FROM THE ROUTES MANAGER` heading arrive together. With the split
  (Question 1) both go to 7.16b, and this story adds only "Manage routes".
- **R-129.** Subscribe and Membership pages are ordinary templates made here, with no route. Membership files are
  never route templates and their names are reserved.
- **R-170, R-171, R-98, R-82, R-238, AD-36, AD-14** are written into Boundaries.

### Ruled values (the one table a ruling changes)

| Question | Recommended (built) | If another option is ruled |
|---|---|---|
| 1 — split | 7.16 = this page; 7.16b = the editor half ("Moved" below) | option 2 re-opens this Create for one spec |
| 2 — relative dates | relative (`within the last` · `more than … ago`) offered **in channels only**, first, with S9c's sentence verbatim in the channel's block; a collection's Published date offers `after` · `on or after` · `before` · `on or before` an exact date, and its sentence reads "Published date takes an exact date — after Jan 1, 2026. A rolling window like the last 30 days is a channel's." | option 2: collections offer relative first too, with the warning sentence in the Question; option 3: as FR-I2 says, with no sentence |
| 3 — undrawn parts | built from the nearest drawn component, exactly (an R-236 exception) | option 1: the prompt below runs first and Dev waits for the export |
| 4 — deleting a route | a collection, channel or route's delete never deletes its template | option 2: a route's delete also deletes its template when no other route names it, in the same Undo |

### Routine calls, one line each (said to the owner, not asked)

1. **The index collection goes last, carrying the inverse of every collection's filter.** Ghost gives a post to the first
   collection that matches it, and each listing drops the posts it does not own. Ghost's own comment advises the
   inverse so that pagination counts stay right. Facts F1 and F2.
2. Route templates are `custom-{name}` (FR-I3), not the frame's sample `articles`, `post-grid` or `page-about`.
3. Slug values are always single-quoted. The reason: unquoted one-letter values fail to lex, and `tag:true` would be read
   as a boolean (F4). The frame's `tag:tutorials` shows the look, not the rule.
4. Paths are one segment. Two paths would otherwise share a context name (`/blog/news/` and `/blognews/` both give
   `blognews`, F5). `RESERVED_SEGMENTS` is read in Ghost 6.58.0's site router and `rendering/context.js` at Dev, with
   its source lines. It includes at least `page` (the root's pagination), `rss`, `index`, `home`, `paged`, `tag`,
   `author`, `post`, `private`, `search` and `ghost`.
5. A collection needs at least one condition, since an unfiltered one would empty the home feed. A channel may have none.
6. A page size is 1–100, `POSTS_PER_PAGE`'s bounds. Ghost checks none (F3). Left unset, nothing is emitted.
7. A route's template is one of the project's Routes Manager templates, or "New template…" inline. It is never a
   membership template (FR-I1) or a standard file. A collection or channel with no template would wear Home's page-2
   design (`index.hbs`, R-127).
8. S9e's "A designed page — like your Members Signup." becomes "A designed page — like a landing page.", because a
   membership page has no route (FR-I1).
9. There is no page Save. Each sheet's primary button, each drop and each taxonomy save writes immediately. That is how
   the frame's "generated live" holds with no Save drawn.
10. A collection card's name is the title-cased path. Its line is the filter in words. S9c draws neither field.
11. S9b's line "Deploys are blocked until routing is valid — the Ship button explains why." is not shown: no Ship button
    exists before 7.18. It moves there with its clause.
12. Visibility offers Public, Members and Paid (FR-I2). Ghost's `tiers` (specific tiers) is not offered.
13. FR-I2's `author:` is kept, though gscan calls the singular form deprecated in theme filters. It still resolves in
    Ghost's post model (F6), and new VERIFY item 66 watches it.
14. There is no migration. A stored filename outside `CUSTOM_TARGET_RE` is ignored and never emitted, as
    `GHOST_SLUG_RE` is used.
15. The page is outside the editor's lock, as Theme settings is. Two tabs saving at once: last write wins.
    `ponytail:` — add a compare-and-set on `updated_at` if that is ever seen.
16. The Undo toast stays until the next change or until you leave the page. It has no timer.
17. A config back at Ghost's default stores `yaml` null. What a site that already has a `routes.yaml` then receives is
    7.17's decision, and a reading is added to its card at Dev.

### Moved (R-195), word for word, at Dev after Question 1's ruling

- **To Story 7.16b, "Custom templates on the canvas"** — straight after 7.16 in `sprint-status.yaml` — these clauses of
  the 7.16 card, verbatim:
  - the whole "the canvas sizes a main feed by that route's own `limit:` … (FR-H2, DW-252)" clause;
  - "custom templates appear in the template switcher as designable canvases — … in the shared row of R-171 — and
    '+ New template' is a shortcut that deep-links into this flow";
  - "warns when the template has designed content, the canvas is deleted with it and recoverable via undo, and an editor
    viewing it switches to Home with a notice";
  - the DW-126 clause;
  - the routed-template warning clause;
  - DW-344's editor half.

  Also handed to 7.16b as readings:
  - every custom collection's and channel's own `paged` context (F5), for the `noindex` guard where its template is
    feed-less;
  - the canvas's Home feed reading every post while the live `/` lists only unowned ones (FR-H3).
- **To Story 7.18**: "blocking the deploy with the reason on the Ship button", read from `validateRoutes`.
- `epics.md` gains 7.16b's card. `sprint-status.yaml` gains its key. The epic's preamble and `epic-7-context.md` list
  each move.

### The shape

```ts
type Cond =
  | { field: 'tag' | 'author' | 'primary_tag' | 'primary_author'; op: 'any' | 'none'; values: string[] } // slugs
  | { field: 'visibility'; op: 'any' | 'none'; values: ('public' | 'members' | 'paid')[] }
  | { field: 'featured' | 'feature_image'; is: boolean }
  | { field: 'published_at'; op: '>' | '<' | '>=' | '<='; at: { ago: number; unit: 'd' | 'w' | 'M' | 'y' } | { date: string } }
type Filter = { match: 'all' | 'any'; conditions: Cond[] }
type RoutesConfig = {
  collections: { path: string; filter: Filter; template: string; limit?: number }[] // array order = precedence
  routes: ({ path: string; template: string } | { path: string; channel: Filter; template: string; limit?: number })[]
  taxonomies: { tag: string; author: string } // first segments, default 'tag' and 'author'
}
```

**The NQL grammar.** Conditions are joined with `+` (all) or `,` (any). Each condition is written as follows:
- tag, author, primary tag and primary author: `tag:'a'` or `tag:['a','b']`, with a `-` before the value for none;
- `featured:true` or `featured:false`;
- `feature_image:-null` (has one) or `feature_image:null` (has none);
- `published_at:>now-30d` (relative, unquoted, d/w/M/y) or `published_at:>'2026-01-01'`.

`indexFilter` takes every collection's ¬filter and joins them with `+`:
- the condition operators flip: any ↔ none, true ↔ false, `-null` ↔ `null`, `>` ↔ `<=`, `>=` ↔ `<`;
- a negated All becomes an Any group, parenthesised only when it holds more than one condition and sits beside others;
- a negated Any is flattened into the `+` chain.

**The YAML.** Keys come in the frame's order: `collections:` (yours, then `/`), `routes:` (static, then channels, in
your order), `taxonomies:` (`tag`, then `author`). There are two-space indents and one blank line between blocks.

**Naming (§7.4, `prd.md:666-671`).** The steps:
1. NFKD, then drop marks.
2. Lowercase.
3. Spaces and `_` become `-`.
4. Strip everything outside `[a-z0-9-]`.
5. Collapse repeated hyphens and trim them.

The result is refused when it is empty or a reserved stem. It is also refused when `custom-{slug}` would be over 100
characters (Ghost's `custom_template` column, F7).

Ghost's label: strip `custom-`, change `-` to a space, and capitalise each word (`custom-long-read` → "Long Read", F7).
The display name is at most 60 characters. There is no rename; the naming step's sentence is the "why".

### Words (`ROUTES_WORDS`; frame strings verbatim)

- **S9a:**
  - "Routes & Templates";
  - "COLLECTIONS", with its helper "Your homepage is a template built from sections — it lists posts only if you add a
    posts section. Collections are dedicated post listings, like Articles.";
  - "+ New collection";
  - "CUSTOM ROUTES" and "+ Custom route";
  - "TAXONOMIES": "Tags" · "Tag template" and "Authors" · "Author template";
  - "Valid — Ghost will accept this routing." with "pass";
  - "routes.yaml" · "generated live, ships with every deploy";
  - "Copy" and "Download routes.yaml".
- **S9b:** "Line {n} — {reason}" and "{n} error" or "{n} errors".
- **S9c:**
  - "New collection." and "A section of your site with its own URL and layout.";
  - "Path";
  - "Show posts that match", with "All conditions" | "Any";
  - the field picker's labels as S9c draws them;
  - "A post lives in the first collection it matches — drag collections to reorder if posts land in the wrong place.";
  - the date sentence per the Ruled values;
  - "Template";
  - "Posts per page is your theme setting — {n} right now. A collection can set its own limit here.";
  - "Cancel" and "Create collection".
- **S9e:**
  - "New route." and "A URL on your site that shows exactly what you choose.";
  - "What should it show?";
  - "One of your templates" and the routine-call helper;
  - "A channel — a filtered stream of posts" and "Like a saved search with its own page and RSS feed. Posts keep their
    normal URLs. You'll add filter conditions next.";
  - "Create route".
- **S9d:** "Your site uses Ghost's default routing." and "Nice and simple. Add a collection when you want sections like
  /tutorials/."
- **The naming block:** "This name is permanent. Ghost remembers it on every page you assign, and renaming it later
  would quietly unassign them all." (`EXPERIENCE.md:272`).
- **Extrapolated (Question 3), the prompt's words:** "TEMPLATES", "+ New template", "New template." and "A design you can
  give a route, or pick for a page in Ghost.", "Name", "Ghost will show: {label}", "Used by {paths}", "Create
  template", "Its own page size", "Edit", "Delete", "Delete {name}?" and "Also removes {paths}. Undo brings both back.",
  "Deleted {name}" and "Undo", and "or add a custom route · a template". Each refusal is one sentence naming the reason
  (already a template here · already published by this project · a name Ghost uses itself · an address Ghost uses ·
  already a collection, channel or route).
- **Busy labels:** "Creating…", "Saving…", "Deleting…", "Restoring…" and "Opening…".

### Walk (step 109, production)

1. Open "Manage routes" with the keyboard → the skeleton, then S9d.
2. A collection with a new template and a page size, pointer-free.
3. A second collection. Reorder it by ⌥↑ and by drag (pointer rows in `floor.spec.mjs` if harness-reachable). The YAML
   order and `/`'s inverse follow.
4. A channel with a relative date.
5. A static route.
6. A taxonomy prefix.
7. Each collision and reserved refusal, with nothing written. The control is the same value made legal, which saves.
8. Delete and Undo for a collection and for a used template.
9. Copy and Download.
10. A reload agrees with `routes_config.yaml`.
11. Clean up to S9d. Users and projects are counted before and after.

### Facts this spec rests on (read in Ghost's source at this Create, 2026-10-16, and executed with Ghost's own modules from the npm tarballs; T1 untouched)

- **F1 — order decides ownership, and ownership decides listings.**
  - Collections register in YAML order (`router-manager.js:126-130`), and the first match owns the post
    (`lazy-url-service.js:300-303`). Ghost 5 is the same (`UrlGenerator.js:158-191`).
  - A listing queries by its filter, then drops posts it does not own (`controllers/collection.js:75-88`). Its
    past-the-end 404 uses the pre-drop total (`:56`), and Ghost advises the inverse filter on `/` (`:65-74`).
  - Executed with `LazyUrlService`: with the index first, `/tutorials/` owns nothing. With `/tutorials/` first, the
    tagged post's address is `/tutorials/how-to/`.
  - This disproves `EXPERIENCE.md:747` ("always first", marked "not executed").
- **F2 — relative dates.**
  - Listings re-parse every request (`fetch-data.js:70-72`).
  - The ownership filter is compiled once at registration and cached (`lazy-url-service.js:131-139`, `nql.js:32-33,72`).
    Executed: a reused compiled filter kept its frozen "now".
  - Units are d, w, M, y, h, m and s. The term must be unquoted (`'now-1y'` is a literal string, silently), and an
    unknown unit is a literal, silently. Resolution is in UTC.
- **F3 — `limit:`.**
  - It is read for collections and channels (`collection-router.js:41,111`, `controllers/collection.js:31-49`,
    `channel.js:31-51`). A truthy `limit` overrides `@config.posts_per_page` for that request.
  - Ghost 6 accepts a number, `'all'` or a digit string, with no bounds; Ghost 5 checks nothing.
  - RSS ignores it (`controllers/rss.js:30-36`).
- **F4 — NQL.**
  - `((tag:news))` → `{"yg":{"tag":"news"}}`, which drops to `select * from posts` with no error.
  - The posts API wraps `(${filter})+type:post` (`serializers/input/posts.js:130`, 5: `:134`), so a wholly wrapped
    filter loses its condition.
  - `(tag:b)` and `tag:[a,b]` fail to lex, while `'b'` and `['a','b']` parse.
  - `tag:[a+b]` parses on 6 only.
  - Versions: 6.58.0 runs nql 0.13.4 and nql-lang 0.7.0. 5.130.6 runs nql 0.12.7 at the root and nql 0.12.6 in its
    filter plugin.
- **F5 — contexts.**
  - `routerName = mainRoute === '/' ? 'index' : mainRoute.replace(/\//g,'')` (`collection-router.js:21`,
    `static-routes-router.js:19`).
  - Executed: `/articles/page/2/` gives `["paged","articles"]`, and `/` gives `["home","index"]`.
  - Since Inflozo always emits the index collection at `/`, Home's context stays `index` and DW-344's second half needs
    no change. Custom collections' own contexts are 7.16b's.
- **F6 — validation (6: `route-settings-parser.js`, zod).**
  - It requires slashes, a collection permalink, and only `tag` and `author` as taxonomies.
  - It does **not** check duplicate permalinks, route/collection collisions, NQL, or template existence.
  - A static route's missing template is a 400 at render (`static-routes-router.js:115-118`). A collection's falls back
    to `index`.
  - The field expansions are `post.js:291-354`; `author:` resolves to `authors.slug`, and `visibility` is
    public, members, paid or tiers (`post.js:225`).
  - The default file is `default-routes.yaml:1-10`.
- **F7 — custom templates.**
  - gscan's label rule (`read-theme.js:168-212`).
  - Ghost Admin lists `custom-*` for posts and pages and stores the filename without `.hbs` in `posts.custom_template`
    (string, max 100, `schema.js:96`). Nothing rewrites it when the file goes.

## Owner's manual test

Do this on the real site after Deploy, on a laptop at full width, signed in as yourself, on **Pilot sections**
(`b6d4db35-8e5e-45e1-a70f-4daa28916d51`). It is not linked to a Ghost site, so tags are typed by their short name.
Steps 5, 6 and 11 test your rulings on Questions 2, 3 and 4. Step 14 puts everything back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Open the template menu at the top (it says **Home**). Press **Manage routes** at the bottom. | — | It reads "Opening…", a grey outline of the page shows, then **Routes & Templates** with a back arrow. |
| 2 | `…/routes` | Routes, empty | Look. | — | The signpost picture, "Your site uses Ghost's default routing." and "Nice and simple. Add a collection when you want sections like /tutorials/.", with **+ New collection**. |
| 3 | the same | New collection | Press **+ New collection**. Type the path, add a condition Tag · is any of, choose Template → New template…, type its name, turn on its own page size and set it. Press **Create collection**. | Path `/field-notes/` · tag `field-notes` · name `Field Notes List` · page size `6` | Under the name you see `custom-field-notes-list.hbs`, "Ghost will show: Field Notes List", and "This name is permanent…". After Create: the two-column page, a **/field-notes/** card ("Field Notes", `tag:'field-notes'`, Field Notes List, "6 / page"). On the right, the green "Valid — Ghost will accept this routing." and a file that lists `/field-notes/` with `limit: 6`, then `/` with `filter: "tag:-'field-notes'"`, then the tag and author addresses. |
| 4 | the same | New collection | Add a second collection with two conditions and All conditions. Then press ⌥↑ on its card, or drag it by its handle above the first. | Path `/craft/` · Tag any of `craft` · Featured is Yes · new template `Craft List` | The file now lists `/craft/` first, then `/field-notes/`, then `/`, whose filter now carries both: `(tag:-'craft',featured:false)+tag:-'field-notes'`. |
| 5 | the same | New collection | Start a third collection and open the Published date condition's operator list. Press **Cancel**. | — | **Only exact dates are offered** (after · on or after · before · on or before), with the sentence that a rolling window is a channel's (your Question 2 ruling). |
| 6 | the same | New route | Press **+ Custom route**. Type the path, choose "A channel — a filtered stream of posts", add Published date · within the last · 30 days, choose a new template. Press **Create route**. | `/reading-list/` · `30` days · template `Reading List` | Conditions appear once you choose the channel. The file gains `/reading-list/:` with `controller: channel`, `filter: "published_at:>now-30d"` and `template: custom-reading-list`. The new parts (the name box, the page-size row, the drag handle) look like their neighbours (Question 3). |
| 7 | the same | New route | **+ Custom route** again: "One of your templates", New template…. Press **Create route**. | `/landing/` · `Landing` | The file gains `/landing/: custom-landing`, and the Templates list shows Landing over `custom-landing.hbs`. |
| 8 | the same | New route / New template | Try these, one at a time: a new template named `Landing` again; one named `Home`; a route at `/page/`; a route at `/craft/`. | as listed | Each is refused before saving, with a sentence saying why (already a template; a name Ghost uses itself; an address Ghost uses for page 2; already a collection). Nothing changes on the right. |
| 9 | the same | Taxonomies | Change the Tags address. Press **Save**. | `topic` | The file shows `tag: /topic/{slug}/`. |
| 10 | the same | Collections | On **/craft/** press ⋯ → **Delete**. Then press **Undo** in the message at the bottom. | — | /craft/ disappears and comes back in the same place. The file changes and changes back. |
| 11 | the same | Custom routes | On **/landing/** press ⋯ → **Delete**. | — | The route goes, and **Landing stays** in the Templates list (your Question 4 ruling). |
| 12 | the same | Templates | On **Reading List** press ⋯ → **Delete**. Press **Cancel**. Do it again and confirm. Then press **Undo**. | — | A small window saying it also removes `/reading-list/`, with **Cancel** focused. Cancel changes nothing. Delete removes both. Undo brings both back. |
| 13 | the same | YAML pane | Press **Copy**, paste into any note. Press **Download routes.yaml**. Reload the page. | — | The pasted text and the downloaded file match the pane. After the reload everything is exactly as you left it. |
| 14 | the same | Everything | Delete every collection, route and template, and set the Tags address back. | `tag` | The page returns to step 2's picture. |

## Questions for the owner

All four are needed before Dev. The spec is written to each recommended option.

### Question 1 — This story is two stories. May I split it?

**In plain English.** The story card asks for two different things:
- a new page where you build your site's addresses and name your templates;
- teaching the editor to open and design those templates, size their post lists, and react when one is deleted.

The second half changes how the editor knows which screens exist. Today that is a fixed list, and the whole editor is
built around it. Together they would be the largest story yet, with the longest test you have run.

**An example.** After the first half you can build `/landing/` and name its template "Landing", and see it in the file
Ghost will receive. After the second half, "Landing" also appears in the editor's Template menu under "From the Routes
Manager", where you design it, with **+ New template** beside it.

1. **(RECOMMENDED) Split it.** This story becomes **7.16a** (as 5.23 became 5.23a). It builds the Routes page and adds
   **Manage routes** to the Template menu. A new Story 7.16b, straight after, builds the editor half:
   - the templates in the menu, with **+ New template** (your R-128 keeps those two together);
   - designing them;
   - their page sizes on the canvas;
   - the warning before deleting a designed template.

   Each story stays one job with one test.
2. **One story.** Everything at once. It is bigger and riskier, and I re-plan this spec first.
3. **Split differently.** Tell me where.

**Ruled:** _(awaiting the owner)_

### Question 2 — "The last 30 days" works on a channel, but not reliably on a collection. Where may it be used?

**In plain English.** The plan says a filter like "published in the last 30 days" keeps up with the calendar. I read and
ran Ghost's own code:
- **On a channel it does keep up.** A channel is a list at its own address, and posts keep their normal addresses.
- **On a collection it only half does.** A collection also decides each post's address, and Ghost works out those
  addresses once, when it starts, and keeps that moment as "now".

**An example.** You make a collection `/latest/` for the last 30 days. A post that turns 31 days old leaves the
`/latest/` list, as it should. But Ghost still thinks it belongs to `/latest/`, so it is left off your home page too, and
it shows nowhere until Ghost restarts.

1. **(RECOMMENDED) Rolling dates on channels only.** A collection's date condition takes an exact date ("published after
   1 January 2026"), and a short line says a rolling window is a channel's. I correct the plan's sentence.
2. **Allow it on collections with a warning.** Rolling dates are offered on both. On a collection the sheet says: "Ghost
   decides a post's address when it starts, so a post can drop out of every list until Ghost restarts."
3. **Allow it everywhere, no warning**, as the plan says now.

**Ruled:** _(awaiting the owner)_

### Question 3 — Parts of the Routes page were never drawn. May I build them from the drawings next to them?

**In plain English.** Your rule R-74 says every screen comes from a drawing. The Routes drawings leave out:
- the box where you name a template, which shows its file name, the label Ghost will show and the "This name is
  permanent" line;
- a **Templates** list on the page, with the same rows as Custom routes;
- the ⋯ menus (Edit, Delete), the Edit versions of the sheets, and the delete window that lists what else goes;
- the Undo message after a delete;
- the page-size control that S9c's sentence promises;
- the drag handles that S9c's sentence promises;
- editing the tag and writer addresses;
- the channel's conditions (S9e: "You'll add filter conditions next");
- two quiet links on the empty page ("or add a custom route · a template");
- the **Manage routes** row in the Template menu.

**An example.** The page-size control would be Theme settings' "Posts per page" box, unchanged, under S9c's sentence.
The name box would be S9c's Path box with two grey lines under it.

1. **(RECOMMENDED) Build them from the drawings next to them, exactly**, as you ruled for Stories 6.4 and 6.6. There is
   no new component, colour or size. You compare them at your test (steps 3 and 6), and the Review records a
   side-by-side check.
2. **Draw them first.** Paste the prompt at the end of this spec into a new chat in the Inflozo Claude Design project,
   export, and tell me where you saved it. Dev waits for it.
3. **Leave them out.** That is not possible here: the naming box and the page-size control are what the story is for.

**Ruled:** _(awaiting the owner)_

### Question 4 — When you delete a route, should its template go too?

**In plain English.** The plan says deleting a template "or its route" deletes the template's design. But on the drawn
page a route only *points at* one of your templates, and a template can also be used by a Ghost page you assigned it to
in Ghost.

**An example.** `/landing/` shows your "Landing" template, and your About page in Ghost uses Landing too. You delete the
`/landing/` route.

1. **(RECOMMENDED) The route goes, and Landing stays** in your Templates list, still designed, still usable by the
   About page or a new route. Deleting a template is its own action, with its own warning.
2. **Landing goes too** when no other route uses it, with one Undo for both.

**Ruled:** _(awaiting the owner)_

## Claude Design prompt — S9 Routes, the undrawn parts (only if Question 3 is ruled option 2)

In the Inflozo project, open `S9 Routes.dc.html` and add frames S9f to S9j. Use only the components, tokens and spacing
already in S9a–S9e, the Editor Sidebar Kit and D6a; add no new colour, size or component.
- **S9f.** S9a with a TEMPLATES section between Custom routes and Taxonomies. Each row is "Landing" over mono
  `custom-landing.hbs`, then "Ghost shows: Landing", "Used by /landing/", and ⋯. End with "+ New template". Collection
  cards gain a drag handle at their left.
- **S9g.** The "+ New template" sheet, in S9c's anatomy:
  - title "New template.", sub "A design you can give a route, or pick for a page in Ghost.";
  - a Name input ("Landing");
  - under it, mono `custom-landing.hbs` and "Ghost will show: Landing";
  - the line "This name is permanent. Ghost remembers it on every page you assign, and renaming it later would quietly
    unassign them all.";
  - Cancel and "Create template".
- **S9h.** S9c with its Template select open on "New template…", the naming block inline beneath it, and under S9c's
  posts-per-page sentence D6a's Posts per page stepper behind a toggle "Its own page size". Draw the Published date
  operators per the ruled Question 2.
- **S9i.** S9e with "A channel" chosen, S9c's condition block, Template and page size appearing beneath it.
- **S9j.** Three small states:
  - a ⋯ menu (Edit, Delete);
  - the delete confirm for a template used by routes ("Delete Reading List?" / "Also removes /reading-list/. Undo brings
    both back." / Cancel focused / Delete), in D5f's anatomy with the danger colour;
  - the bottom toast "Deleted /craft/ · Undo";
  - S9d with the quiet line "or add a custom route · a template" under its button;
  - the Template menu (D5b) ending with a rule and a "Manage routes" row in R-171's anatomy.

## Verification

**Commands (Dev):**
- `pnpm check` -- exit 0. This covers lint, typecheck, `routes.test.ts` (every I/O row, both majors' NQL bare and wrapped,
  `js-yaml`, each refusal behind its control), the `AD-36 (7.16)` pair, `editor.test.ts` (`routes` never a canvas),
  and `busy.test.ts` (`routes/loading.tsx`, every Submit's busy label).
- `node tools/probe/record-routes.mjs` -- PASS. Ghost 6.58.0's and 5.130.6's own route-settings code accepts every
  fixture. The control (`limit: abc`) is refused on 6.
- `node tools/probe/record-routes.mjs --t1` (main session, the owner's go) -- every row in the task holds. The
  index-first control shows the collection empty, and T1's own routes.yaml is restored and read back byte for byte. The
  results are written as §82.
- `pnpm keyboard` -- every journey passes, including any re-pointed past the new switcher row.
- `python3 tools/doc-audit.py --check` -- PASS, twice.
- `grep -rn --exclude=.env "index collection first\|always first" _bmad-output docs` -- only dated, corrected
  mentions.

**Review (R-82), on the deployed Dev head:**
- `node tools/probe/run-verify-editor.cjs` against production -- step 109 PASS row by row, each refusal behind its
  control. Users and projects are counted before and after.
- Supabase production through PostgREST as a throwaway user (`rls-session-from-a-script`):
  - a `routes_config` row written by `saveRoutes` reads back with `yaml` byte-equal to `routesYaml(config)`;
  - a `custom_templates` row has `kind = 'routes'` and `filename` matching `CUSTOM_TARGET_RE`;
  - a second user cannot read either row;
  - anon gets 401 or 42501.
- The side-by-side frame check (Question 3) is recorded with screenshots of S9a, S9c, S9d and S9e beside the frames.
