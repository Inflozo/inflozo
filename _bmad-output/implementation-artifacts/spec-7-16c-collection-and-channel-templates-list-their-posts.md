---
title: 'Story 7.16c — Collection and channel templates list their posts'
type: 'feature'
created: '2026-10-18'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story, a template you make for a collection or a channel on Routes & Templates opens with a list of posts
already on it, marked **Main feed**, showing exactly the posts that address will list, as many to a page as you set for
that collection. Home's own list stops showing the posts a collection takes, because on your live site those posts move
to the collection's address. The theme Inflozo builds lists those posts at the collection's address, and tells search
engines to skip its page 2 onwards when the template has no list.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 7.16b opens a Routes Manager template on the canvas in the flat route form, but nothing on it can
list the posts a collection or channel serves there:
- **No main feed off the four paginated files.** `designate` strips the flag and `makeMainFeed` refuses on any file
  outside `PAGINATED_TARGETS` (`main-feed.ts:69`, `:90`; `vocabulary.ts:187-189`). The library's only feed, a17/1, cannot
  sit on a Routes Manager template (`a17/1/design.json:5`; `placement.ts:137-140`).
- **The canvas has no list for it.** `listOf` answers `null` for a custom file (`orbit-weekly.ts:284`), the live reads
  skip it (`live-content.ts:479`), and the editor is handed no route filter or `limit:` (`read.ts:332-333`).
- **Home's canvas feed lists every post**, while the live `/` lists only the posts no collection owns (F4).
- **The theme's `noindex` guard names only `index`, `tag` and `author`** (`compile.ts:223`, `:1047`), and a collection's
  or channel's page 2 has its own context (F1–F2).
- DW-363: the harness editor has no Routes Manager template, so no CI journey reaches 7.16b's gone-template move or its
  routed D5f.

**Approach:**
- **A Routes Manager template is LISTED** when a collection or channel names it (`listsOf(config)`, one pure function).
  A listed file paginates like Home: the main feed binds Ghost's native `posts` and `pagination` at the flat root (F3).
  Every other Routes Manager template keeps 7.16b's route form, and a feed there is a secondary `{{#get}}` feed.
- **The canvas lists what the live address lists:** the route's filter, the posts an earlier collection owns dropped,
  sized by the route's `limit:` else the global posts per page (F4, F5), over the sample and the connected site alike.
  Home reads the index's inverse filter.
- **A template created in a collection's or channel's sheet starts with the archive default's main feed** (FR-H2), through
  5.19's rule.
- **The theme names each feed-less listed template's contexts in the guard.** DW-344 closes.
- **The harness gains Routes Manager templates,** and `pnpm keyboard` gains DW-363's journeys and this story's.
- **Question 1 (open):** page 2 of a listed template. The spec is written to its recommended option 1 (Design Notes,
  "Ruled values").

## Boundaries & Constraints

**Always:**
- **Frames (R-74).** `D5 Canvas Markers and Template Switcher.dc.html` **D5c** (`:267-357`) and
  `P0-5 Populate From Panel.dc.html`, as Story 5.19 built them. Use the same components and tokens:
  - `MainFeedChip` on the canvas outline and in Layers;
  - the greyed Count with its reason line and link;
  - "Make this the main feed" in Layers' `⋯`;
  - Data group rows for a secondary feed.

  The new sentences sit in D5c's own reason line and link, and in 5.19's Layers note, so no new component is drawn.
- **One predicate, one list.**
  - `isPaginated(file, listed)` is `PAGINATED_TARGETS.has(file)`, or a Routes Manager file in `listed`. Every reader of
    `PAGINATED_TARGETS.has(file)` that can meet a custom file goes through it.
  - `listsOf(config)` is the only place a file's lists are worked out. The editor, `read.ts`, the compiler and the
    harness all take it from there.
  - An unreadable stored routing lists nothing (7.16b's routine call 12).
- **Ghost's own semantics, read in source (Design Notes, "Facts").** Collections are read in precedence order, and the
  index is emitted last (7.16a).
  - **A collection's page** is the window of its own filter at its `limit:`. The posts an earlier collection owns are then
    dropped from that window, and `pagination` is left as Ghost leaves it (F4).
  - **A channel's page** keeps every match.
  - **Home** reads `indexFilter`.
- **Pure core (AD-1).** `routes.ts` gains an evaluator over its own `Node`. A relative date's "now" is handed in by the
  shell, and `orbit-weekly.ts` takes the list as predicates, since the library cannot import the runtime.
- **AD-36.** A context name is rebuilt from a `PATH_RE`-checked path by `contextOf`, never spliced from stored text. A
  Content API `filter` is sent through `URLSearchParams`. `ad36.test.ts` gains the inert-and-legitimate pair for the
  guard's context sink.
- **R-170.** Every new sentence lives in one list:
  - `DATA_WORDS` for the engine's row;
  - `lib/data-group.ts` for the link and the Layers note;
  - `ROUTES_WORDS` for the channel sheet's hint.

  The link's words are the routes page's title, "Routes & Templates".
- **Writes keep every in-between state valid (7.16a's rule).** A collection's or channel's new template is written row,
  then doc, then config. A failed later step leaves a template with or without its feed and no route, both valid, and
  says `couldNot`.
- **R-82 and R-238.** Review and test run on production and T1 alone. T1 writes need the owner's go, asked in the Dev
  session for the recorder's whole run, and run in the main session.

**Ask First:**
- **Question 1 must be ruled before Dev starts.** Dev builds the ruled option; a ruling other than option 1 changes only
  Design Notes' "Ruled values" row and what it names.
- The T1 go, before the recorder's first write (§84).
- Any frame string beyond Design Notes' "Words", and any undrawn surface.

**Never:**
- **A page-2 design or a page-2 preview of a Routes Manager template** (Question 1, option 1):
  - no `PAGE_TWO` entry;
  - no key;
  - no migration;
  - no `{{#is "paged"}}` split in its file.
- **A route `data:` key, or any change to `routes.ts`'s emission.** The only routes-page changes are the new template's
  feed and the channel sheet's hint.
- **A feed or any list on a membership canvas,** or a change to the entry form.
- Uploading to a customer's Ghost or calling `compileTheme` from the product (7.17, 7.18).
- Editing `claude-design-export/`, a `record` document or a generated file, or writing a count down.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Collection's new template | Sheet: `/tutorials/`, Primary tag `tools`, Template → New template… "Tutorials List", own page size 3; Create collection | `custom_templates` row, then `custom:custom-tutorials-list.hbs` holding a17/1 "Post grid" (`synthesize`'s `FEED` row), then the config; opened, the main feed shows the first three `tools`-primary posts, MAIN FEED chip | a failed write says `couldNot`; the state left is valid |
| Channel's new template | Sheet: `/staff-picks/`, channel, Featured, New template "Staff Picks" | the same three writes; the canvas lists every featured post, tutorials included (no drop), sized by Posts per page | the same |
| Other new templates | "+ New template", or New template… for a static route | no doc: opens empty (7.16b) | — |
| Existing template chosen | a collection given a template that already exists | its doc untouched; the first feed placed takes the flag (5.19) | — |
| Two collections | `/a/` (tag x) before `/b/` (tag y); a post tagged x and y | it appears on A's canvas, not B's; B's page shows fewer than its limit, and B's `pagination` is the window's | — |
| Shared template | named by two collections, or by a collection and a channel | the canvas previews the first collection in precedence order, else the first channel; the reason line names that path | — |
| Home with collections | any collection | Home's main feed, its page count and page 2's offer read `indexFilter` | none: unchanged |
| Main feed, own limit | listed by a collection with `limit: 3` | Count greyed at 3; `routeCount('/tutorials/')`, then "Routes & Templates ↗" to the routes page; `@config.posts_per_page` is 3 on that canvas | — |
| Main feed, no limit | listed, no `limit:` | 5.19's line and "Theme settings ↗", unchanged | — |
| Unlisted feed | a17/1 on a template no collection or channel names | a secondary feed: Source, Count (starting at Posts per page), Order; no pager, no chip; the theme writes its `{{#get}}` | — |
| Route removed | the template's only collection is deleted | the flag goes (`designate`), the feed is secondary, Home regains the posts | — |
| Feed-less listed | listed, no visible feed | Layers head note `FEEDLESS_ROUTE(path)`; the guard names its contexts | — |
| Guard | Tag feed-less, `/staff-picks/`'s template feed-less, `/tutorials/`'s with a feed | `{{#is "paged"}}{{#is "tag, staff-picks"}}…{{/is}}{{/is}}`: index, tag, author first, then custom contexts in code order | a `lists` key that is no Routes Manager file, or a context outside `contextOf`'s shape, throws |
| Page 2 | a listed main feed whose posts run past one page | no Preview page row; the theme serves page 1's stack on every page | — |
| Nothing matches | a collection whose filter matches no post | the feed's declared empty state (FR-H4, R-36) | — |

</frozen-after-approval>

## Code Map

- `packages/library/src/vocabulary.ts`:
  - `:186-189` `PAGINATED_TARGETS` (R-7 half one) stays the four files;
  - add `isPaginated(file, listed)`;
  - `:175-184` `templateKeyOfFile` is unchanged (no custom page-2 key).
- `packages/library/contexts/matrix.json` (`:251-257` the entry and route rows, `:283` the `route` scope, `:284-293`
  `list`) gains `custom-{name}.hbs (list)`: top `list`, no block. `src/contexts.ts`:
  - `:92` `ENTRY_ROW`, `:94` `ROUTE_ROW`;
  - `:100-101` `matrixKey` takes `listed` and picks the list row for a listed Routes Manager file;
  - `:104-106` `targetContext` and `:112-119` `rootScope` follow, and so do `resolveUniversal` (`:208-211`) and
    `offerBindings` (`:334-338`).
- `packages/library/src/placement.ts`:
  - `:82-99` `NATIVE` and `:108-111` `CONTEXTS_BY_TARGET`: a listed file's native `posts`;
  - `:137-140` `compilesTo` is unchanged.
- `packages/library/src/validate.ts:624-630` `pagination-target` — `custom-{name}.hbs` counts as paginated (R-7: "A29:
  `compileTarget` gains `custom-{name}.hbs` collection templates").
- `packages/library/designs/a17/1/design.json:5` — append `custom-{name}.hbs` last. The matrix axis stays
  `compileTarget[0]` (`tools/matrix/cases.mjs:148`).
- `packages/library/src/orbit-weekly.ts`:
  - `:278-298` `listOf`;
  - `:399-423` `templateContext` (rows, `paginationOver` `:93-97`);
  - `:342` `assemble`'s `@config.posts_per_page`;
  - `:217-227` `bundledAt` and `:304-306` `feedPages` count the filtered set;
  - `:456-475` `FIELDS` and `:481-505` `predicate` (Data group sources, untouched).
- `packages/section-runtime/src/routes.ts`:
  - `:64-85` types, `:91` `PATH_RE`, `:271-279` `Node`/`group`, `:294` `nodeOf`, `:303` `negate`, `:323` `filterNql`,
    `:329-335` `indexNode`/`indexFilter`, `:634` `routedOf`, `:638` `pathsUsing`;
  - add `listsOf`, `contextOf` and an evaluator `holdsFor(node, post, now)`. Build the "not owned earlier" node through
    `group`, so it writes through `readNql`'s shape (`:414`).
- `packages/section-runtime/src/routes.test.ts:361-376` `holds` — keep it as the independent oracle. The runtime
  evaluator must agree with it and with `@tryghost/nql` 0.13.4 on every fixture.
- `packages/section-runtime/src/main-feed.ts`:
  - `:67-81` `designate`, `:89-96` `makeMainFeed`, `:116-124` `feedQuery` read `isPaginated`;
  - a feed off a paginated page is secondary;
  - `:102-103` `feedlessArchive` gains listed files.
- `packages/section-runtime/src/synthesize.ts:65` `FEED` — the row a new listed template starts with.
- `packages/section-runtime/src/core.ts`:
  - `:646-654` `refuseUnpaginated` (called at `:823` and `:1807`) reads the render's paginated fact;
  - a secondary feed's pager is dropped before it (`:1841-1842`);
  - `:1937` is the main feed's `{{#foreach posts}}`.
- `packages/section-runtime/src/controls.ts`:
  - `:41` `FeedRole` `main` gains `route?: string`;
  - `:370-382` `DATA_WORDS` gains `routeCount`;
  - `:419-428` `dataRows` picks it.
- `packages/section-runtime/src/ad36.test.ts` (shape `:769-790`), and `agreement.test.ts:1759-1786` (7.16b's case).
- `packages/theme-compiler/src/compile.ts`:
  - `:105-156` `CompileInput` gains `lists` (file → contexts), checked as `:845-847` checks `routed`;
  - `:217-223` the `PAGED_CONTEXTS` comment;
  - `:582-615` `stacksOf` (`designate` at `:586`);
  - `:909-963` the render loop (`feedQuery` `:919`, `renderTheme` `:928-945`);
  - `:1011-1018` `pageBody` reads the list row;
  - `:1047-1048` the guard;
  - `:1122-1125` `reach`.
- `tools/pilot-theme.mjs` and `tools/check-snapshots.mjs:135-145` — a17/1 at the brace target renders as a LISTED
  template, so its theme text equals `home.hbs`'s.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts`:
  - `:318`, `:332-333` the routes read;
  - `:164-165`, `:418` `designate`;
  - `:209-212`, `:488` `EditorData` gains `routes`.
- `.../(editor)/editor.tsx`:
  - `:802` and the `postsPerPage` threads (`:961`, `:968`, `:2757`, `:2889`, `:3309`, `:4396-4397`) take the canvas's
    page size in force;
  - `:848` `routed`;
  - `:979` `designate`;
  - `:4490` the Layers note;
  - `:4594-4606` the Layers rows;
  - `:705-711` the canvas chip.
- `apps/web/lib/live-content.ts`:
  - `:131-139` `feedRead` gains `filter`;
  - `:479` `LIST_FILES`, `:511-516` `siteSource.pages`, `:523-550` `sitePieces` take listed files and Home's filter.

  `lib/live-client.ts` makes the call. `lib/canvas.ts:117`, `:277-316`.
- `apps/web/lib/data-group.ts:50` `THEME_SETTINGS_LINK`, `:76-77` `FEEDLESS`. `components/controls/data-group.tsx:152-156`
  (the link chooses by row), `components/controls/sidebar.tsx:489-497` (`settingsHref` beside a routes href).
- `apps/web/lib/editor.ts` — `:186-187` `pageTwoOfCanvas` stays `undefined` for a route canvas (comment updated), `:301-305`
  `routesPath`. `apps/web/lib/page-two.ts:80-88` is unchanged.
- `.../projects/[id]/routes/actions.ts`:
  - `:142-172` `saveRoutes` writes the new template's doc when `next` lists it;
  - `:109-135` `insertTemplate`;
  - the doc write is shaped like `:285`'s.

  `apps/web/lib/routes.ts:95-97` `postsAfter` takes the sheet's kind.
- `apps/web/app/(app)/app/harness/editor/layout.tsx`:
  - `:157-163` the headers;
  - `:186-195` `designateAll`;
  - `:211-269` `data` (`canvases` `:230`).
- `tools/keyboard/journey.spec.mjs`:
  - sentinel `:32`, `open` `:40-49`;
  - `page.route` `:1239-1246`;
  - the D5f journey `:7181-7214`;
  - the switcher `:4108-4124`.
- `tools/probe/run-verify-editor.cjs` — header `:287-299`, step 110 `:10310`.
- `tools/probe/record-theme-assembly.py` — `SECTION` `:284`, leg 18 `:2280-2391`, `main` `:2785`, `:2823`.

## Tasks & Acceptance

**Execution:**
- [ ] `packages/section-runtime/src/routes.ts` + `routes.test.ts`:
  - `listsOf(config)`: a map from file to `{ kind, path, context, limit?, node, earlier }[]`, collections in precedence
    order, then channels;
  - `contextOf(path)`;
  - `holdsFor(node, post, now)`.

  Tests:
  - `holdsFor` agrees with `holds` and `@tryghost/nql` on every `ROUTES_FIXTURES` filter and every "not owned earlier"
    node;
  - the "not owned earlier" node writes and reads back through `readNql`;
  - `contextOf` refuses any path `PATH_RE` refuses.

  -- F1–F5, one list (AD-1).
- [ ] `packages/library` (`vocabulary.ts`, `contexts/matrix.json`, `contexts.ts`, `placement.ts`, `validate.ts`, a17/1's
  `design.json`, `orbit-weekly.ts`) and tests:
  - `isPaginated`;
  - the list row, picked only for a listed Routes Manager file;
  - a17/1 offered on every Routes Manager template and never on a membership file;
  - `pagination-target` holds the brace target legal;
  - `templateContext` for a listed file: the window, the drop, the limit and Ghost's own `pagination`;
  - Home filtered by the index node, and page counts over the filtered set.

  Each refusal sits behind its control. -- R-7, FR-H2, FR-H3.
- [ ] `main-feed.ts`, `core.ts`, `controls.ts` + tests:
  - designation on a listed file;
  - the flag stripped once it is unlisted;
  - `feedQuery` for a feed on an unlisted Routes Manager template;
  - `refuseUnpaginated` per render;
  - `routeCount`.

  `agreement.test.ts`: a listed template's main feed, and an unlisted template's secondary feed, canvas against theme node
  by node. `ad36.test.ts`: the context sink pair. -- one rule, both emitters.
- [ ] `packages/theme-compiler` (`compile.ts`, `compile.test.ts`), `tools/pilot-theme.mjs`, `tools/check-snapshots.mjs`:
  - `lists`;
  - the list row's body;
  - the guard's custom contexts, each beside its control (a listed template with a feed adds none; an unlisted feed-less
    one adds none);
  - `lists` refused on a bad key or context;
  - a17/1's brace target rendered listed.

  -- DW-344's second half.
- [ ] `read.ts`, `editor.tsx`, `lib/live-content.ts`, `lib/live-client.ts`, `lib/canvas.ts`:
  - `EditorData.routes`;
  - `listed` derived once;
  - the page size in force per canvas;
  - the sample list and the live `filter=` read, with the same drop;
  - Home's inverse filter;
  - `feedlessArchive` for listed files.

  `editor.test.ts` and `live-content`'s tests hold the reads. -- FR-H2's "the canvas reads whichever value applies".
- [ ] `data-group.ts`, `components/controls/{data-group,sidebar}.tsx`, `data-group.test.ts`: the reason line and link
  per Design Notes' "Words", the Layers note, and the R-170 list held. -- D5c.
- [ ] `routes/actions.ts`, `lib/routes.ts`, `apps/web/routes.test.ts`:
  - a new template that `next` lists starts with the `FEED` row, written row → doc → config;
  - a static route's or standalone new template stays empty;
  - the channel sheet's hint.

  -- FR-H2 "at creation".
- [ ] `harness/editor/layout.tsx` (header `x-inflozo-harness-routes: on`):
  - a collection `/harness-list/` (limit 3) naming `custom-harness-list.hbs`, which holds a17/1;
  - a static route `/harness-landing/` naming `custom-harness-landing.hbs`, which holds a22/1 alone.

  Then `tools/keyboard/journey.spec.mjs`, three journeys below the sentinel, each behind its control:
  1. **The flush's `left`.** `page.route('**/sync')` answers `left` naming the landing canvas. The editor moves to Home,
     `#editor-gone-bar` shows, and `#editor-said` says `TEMPLATE_GONE`. **Control:** the same flush with no `left` stays.
  2. **The routed D5f.** Deleting the landing's last section by keyboard opens D5f in `ROUTED_EMPTY_ASK` naming
     `/harness-landing/`. **Control:** the existing journey's `EMPTY_TEMPLATE_ASK`.
  3. **The listed template.**
     - The list canvas's chip shows, with three rows.
     - The Count is greyed with `routeCount`, and its link's `href` is the routes page.
     - Home's grid lacks the owned posts. **Control:** without the header, Home has them.

  -- DW-363, R-82's CI half.
- [ ] `tools/probe/record-theme-assembly.py` -- **§84**, leg 19, in the main session on the owner's go (Design Notes, "T1").
  -- standing rule 1 for F1–F5.
- [ ] `tools/probe/run-verify-editor.cjs` -- step 111 (Design Notes, "Walk"). -- R-82.
- [ ] Propagation (standing rules 3 and 7):
  - DW-252, DW-344 and DW-363 close.
  - `prd.md`: dated notes on FR-H2 (the route limit read, designation at creation, the guard's custom contexts), FR-H3
    (Home's honest list) and FR-D21 (Question 1's ruling).
  - `appendix-b1-template-contexts.md:100` and `:286`.
  - `docs/section-authoring.md`: a feed on a Routes Manager template, listed or not.
  - `sections-inventory.md`'s A17 target line.
  - `VERIFY-AT-BUILD.md`: item 67, the Content API taking the emitted NQL; item 68, a custom context in the guard.
  - `epic-7-context.md`.
  - 7.18's card: hand `lists` beside `routed`.
  - The `7.16c's` comments (`lib/editor.ts:186`, `compile.ts:222`, `validate.test.ts:563`, `contexts.test.ts:288`).
  - Finish with `git grep -n "PAGINATED_TARGETS.has("`: every remaining reader meets no custom file, or goes through
    `isPaginated`.
- [ ] `python3 tools/doc-audit.py --check` twice, then `pnpm check` and `pnpm keyboard`.

**Acceptance Criteria:**
- **Matches the frame (R-74).** Given the deployed editor at 1440 on a collection's template, compared with D5c as 5.19
  built it:
  - the chip on the canvas outline and in Layers, the greyed Count, its reason line and link, and "Make this the main
    feed" match in components, layout, copy and tokens;
  - an unlisted feed's Data group is P0-5's, as 5.19 built it;
  - the Review records a side-by-side check.
- Given a Routes Manager template holding a17/1 as the main feed of a collection with a `limit:` on T1, when the
  collection's address is read, then it lists exactly that many of the collection's posts and Home lists none of them; and
  given a feed-less template on a channel, its page 2 carries `noindex` and its page 1 does not (§84).
- Given any listed template, when the canvas draws it and the theme compiles it, then the two agree node by node.
- Given the sample and a connected site, when a listed template's canvas and Home's canvas are drawn, then each lists the
  posts its live address lists: the same filter, the same drop and the same page size.

## Spec Change Log

## Design Notes

### Rulings this spec is written to

- **R-74** sets the frames: D5c and P0-5, as 5.19 built them.
- **R-7:** a paginated design is refused off a paginated target, and A29 gives `custom-{name}.hbs` collection templates.
- **FR-H2** (5.19, R-36): exactly one main feed per paginated template; a channel's template gets one at creation; the
  canvas reads the size that applies.
- **R-176** and FR-D21: page 2 is offered "nowhere else". That is Question 1.
- **R-245** and **R-249** moved this story's criteria here word for word. **R-246:** relative dates appear in channels only.
  **R-248:** a route's delete keeps its template.
- **R-170, R-98, R-82, R-238 and AD-36** are written into Boundaries.

### Ruled values (the one table a ruling changes)

| Question | Planned (RECOMMENDED), awaiting the owner |
|---|---|
| 1 — page 2 of a listed template | Option 1, **page 1 only**. There is no Preview page row, no page-2 key and no migration. The live page 2 serves page 1's stack with the next posts, and a feed-less listed template is guarded. FR-D21 gets a dated note. If option 2 or 3 is ruled, Dev waits for the re-plan. |

### Routine calls, one line each (said to the owner, not asked)

1. **Listed means named by a collection or channel.** A static route, or no route, leaves 7.16b's form unchanged.
2. **The archive's default feed at creation.** "Given one the same way" (FR-H2) is the archive defaults' `FEED` row,
   a17/1 "Post grid". It is written only for a template created in a collection's or channel's own sheet. A template
   that already exists, or a new one for a static route, is left as it is.
3. **a17/1 goes on every Routes Manager template.** Off a list it is a secondary feed, so a route change never strands
   it (7.16b's rule).
4. **A shared template previews its first list,** in Ghost's order: collections, then channels. The reason line names
   that path. A template that a collection and a static route share shows its list at the collection's address and the
   feed's empty state at the route's.
5. **Ownership is Ghost's: drop, don't refill.** A later collection's page can show fewer than its limit, as live.
6. **The Layers note covers a feed-less listed template,** in the archive note's words with the path (Words).
7. **The channel sheet's hint said "A collection can set its own limit here."** On a channel it now says "A channel".
8. **No migration.** Every key is 7.16b's.

### Words

All are new unless quoted.
- `DATA_WORDS.routeCount(path)`: "This feed is sized by {path}'s own page size. Change it in Routes & Templates." It
  replaces D5c's sentence on a listed main feed with a `limit:`.
- The link: "Routes & Templates ↗" (`ROUTES_WORDS.title` + " ↗"), to `routesPath`.
- `FEEDLESS_ROUTE(path)`: "This template has no list of posts. Ghost still serves {path}page/2/ onwards, which would
  repeat page 1, so your theme asks search engines to skip them."
- The channel sheet: "… — {n} right now. A channel can set its own limit here."

### Walk (step 111, production)

1. On a fresh template made from a collection sheet (Primary tag, limit 3):
   - the canvas lists the collection's first three, with the chip;
   - a service read shows the doc's a17/1 flagged;
   - the Count reads `routeCount`, and its link opens the routes page.
2. Home lacks the owned posts. **Control:** its list before the collection.
3. A channel's new template keeps an owned post. Its Count reads 5.19's line.
4. Remove the collection: the flag goes and Home regains the posts.
5. A static route's new template stays empty. a17/1 there shows Source, Count and Order.
6. A feed-less listed template shows the note.
7. Clean up; users and projects are unchanged.

### T1 (§84, `record-theme-assembly.py` leg 19)

1. Read T1's `routes.yaml`, its active theme and its posts. Derive a primary tag with posts on both sides of it.
2. Compile a probe project:
   - `custom-probe-list.hbs` holding a17/1 (the main feed) on `/inflozo-probe-list/`, with that tag and `limit: 1`;
   - `custom-probe-bare.hbs` with a22/1 alone on the channel `/inflozo-probe-channel/` (`limit: 1`);
   - `tag.hbs` feed-less.
3. Upload it with `routesYaml`'s file. Then check:
   - the list page shows one post, and it carries the tag;
   - `/` lists none with the tag;
   - the list's page 2 has no `noindex` (**control**);
   - the channel's page 2 and a tag's page 2 have it, and page 1 of each does not (the comma form, executed for the
     first time).
4. Read-only on the Content API: the index filter and a channel's relative-date filter answer 200 with the expected
   posts. **Control:** a malformed filter answers 400.
5. Restore both, and read `routes.yaml` back byte for byte.

### Facts this spec rests on

Read in Ghost 6.58.0's and 5.130.6's source from the npm tarballs at this Create, 2026-10-18; T1 untouched. Paths are
under `package/core/frontend/`, and 5.x names the routers `CollectionRouter.js` and `StaticRoutesRouter.js`.

- **F1 — context names.**
  - A collection: `routerName = mainRoute === '/' ? 'index' : mainRoute.replace(/\//g, '')`, then
    `this.context = [this.routerName]` (`services/routing/collection-router.js:21`, `:55`; 5.x `:20`, `:53`).
  - A channel: the same rule, with `context: [this.routerName]` (`static-routes-router.js:19`, `:79`).
- **F2 — paged.** `/x/page/2/` gives `['paged','x']` (`rendering/context.js:32-33`, `:43`; 5.x `:35-36`, `:51`).
  `helpers/is.js:23-26` matches exact elements, OR'd over a comma list.
- **F3 — the root.** A collection or channel puts `posts` and `pagination` at the root and no `post`
  (`rendering/format-response.js:15`, `:20`, `:59-60`). `{{#foreach}}` over a missing `posts` renders `{{else}}`
  (`helpers/foreach.js:44-49`, `:118-119`). A static route serves no `/page/N/` (`static-routes-router.js:99`).
- **F4 — ownership.** A collection fetches its own filter's window, then keeps a post only if it owns it
  (`controllers/collection.js:75-88`, `ownsResource`; 5.x `:75-81`, `owns`), with `pagination` uncorrected. A channel
  keeps every match (`controllers/channel.js:53-62`).
- **F5 — limit.** A route's `limit` replaces `posts_per_page` for that request (`collection.js:33-42`,
  `channel.js:34-43`), and the next request resets it (`update-global-template-options.js:30`).
- **F6 — templates.** A collection's or channel's page 2 renders the same file (`rendering/templates.js:49-67`, `:184`).

## Owner's manual test

Do this on the real site after Deploy, on a laptop at full width, signed in as yourself, on **Pilot sections**
(`b6d4db35-8e5e-45e1-a70f-4daa28916d51`). It uses the sample posts. If routes or templates from an earlier test are
there, delete them first on Routes & Templates. Step 4 tests the recommended answer to Question 1.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at Home's post list. | — | It includes "The last analogue switchboard in Lisbon" and "Still broadcasting from a garden shed". |
| 2 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Press **+ New collection**. Type the path. Add the condition **Primary tag** and type the tag. For Template, choose **New template…** and type the name. Turn on **Its own page size** and set it. Press **Create collection**. | `/tutorials/` · `tools` · `Tutorials List` · `3` | The collection is listed. Under Templates, Tutorials List says "Used by /tutorials/". |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/custom-tutorials-list` | Editor, Tutorials List | Open it from the Template menu. | — | A post grid is already there, with a small **MAIN FEED** tag on its outline and on its Layers row. It shows three posts: "The last analogue switchboard in Lisbon", "Still broadcasting from a garden shed", "The domains nobody visits". The menu's dot for Tutorials List is filled. |
| 4 | same | Panel | Click the post grid. Look under **Data**. | — | **Count** is greyed at 3, with the line "This feed is sized by /tutorials/'s own page size. Change it in Routes & Templates." and the link **Routes & Templates ↗**. There is no **Preview page** row (Question 1, option 1). It looks like D5c. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Open Home. | — | Those two posts from step 1 are gone from Home's list. On your live site they move to /tutorials/. |
| 6 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | From Tutorials List's panel, press **Routes & Templates ↗**. Edit /tutorials/, set the page size, save, and open Tutorials List again. | `5` | Five posts now, and the Count reads 5. |
| 7 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Press **+ Custom route**. Type the path. Choose **A channel — a filtered stream of posts**. Add the condition **Featured**. Choose **New template…** and type the name. Look at the page-size line, then press **Create route**. | `/staff-picks/` · `Staff Picks` | The page-size line ends "A channel can set its own limit here." |
| 8 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/custom-staff-picks` | Editor, Staff Picks | Open it. Click the post grid. | — | A post grid with **MAIN FEED**. It starts "The night shift at the Port of Algeciras", "A short note on the Thursday letter". The sixth is "The domains nobody visits", a tutorial too, because a channel shares posts (you see it when Posts per page is 6 or more; it is 12 unless you changed it). The Count reads your theme's Posts per page with the old line and **Theme settings ↗**. |
| 9 | same | Editor, Staff Picks | Add a **Newsletter** section. Then delete the post grid. Then press ⌘Z. | — | After the delete, a note at the top of Layers: "This template has no list of posts. Ghost still serves /staff-picks/page/2/ onwards, which would repeat page 1, so your theme asks search engines to skip them." ⌘Z brings the grid back with **MAIN FEED**. |
| 10 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Press **+ New template** and type the name. Then open it and add a **Post grid**. | `Plain Page` | It opens empty. The added grid has no MAIN FEED tag, and its Data group shows Source, Count and Order. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Delete the /tutorials/ collection (⋯ → Delete). Open Tutorials List, then Home. | — | Tutorials List keeps its grid, now without MAIN FEED, showing the newest posts. Home shows the two posts from step 1 again. |
| 12 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/routes` | Routes & Templates | Delete the route and the three templates. | — | Back to how step 1 found it. |

## Questions for the owner

### Question 1 — A collection's list runs onto more pages. Should you be able to preview and design its page 2, as on Home?

**In plain English.** On Home, the main post list's panel has **Preview page 2**, and you can design page 2 on its own
(Story 5.16). A collection's or channel's list has a page 2 on the live site too: `/tutorials/page/2/`. Your rule from
Story 5.16 (R-176) lists where page 2 is offered: Home, and a Tag or Author page whose posts run past one page — "and
nowhere else". That was ruled before collections existed. To design page 2 here, the database needs a new kind of saved
page, plus page-2 work in the editor and in the theme.

**An example.** `/tutorials/` shows 3 per page and has 8 tutorials. You design page 1. On the live site,
`/tutorials/page/2/` shows the next three with the same design.

1. **(RECOMMENDED) Page 1 only, for now.** These templates get no Preview page 2. On the live site, page 2 onwards uses
   page 1's design with the next posts, as Ghost's own themes do. If the template has no list, its page 2 is kept out
   of search engines. Nothing in the database changes.
2. **Preview and design page 2, in this story.** A database change is pushed first, on its own (R-99). The story grows
   by the page-2 work in the editor and the theme.
3. **The same as 2, in a new Story 7.16d straight after this one.** This story ships as planned, and 7.16d adds page 2.

**Ruled:** _(awaiting the owner)_

## Verification

**Commands (Dev):**
- `pnpm check` -- exit 0: lint, typecheck and every package's suite.
  - Library: `placement`, `contexts`, `validate` and `orbit-weekly`.
  - Section-runtime: `routes`, `main-feed`, `controls`, `agreement` and `ad36`.
  - Compiler: `compile.test.ts`.
  - App: `editor.test.ts`, `data-group.test.ts`, `routes.test.ts`, `live-content`'s tests and `busy.test.ts`.
- `pnpm keyboard` -- every journey passes, including the three new ones.
- `pnpm build` -- exit 0. `node tools/check-traces.mjs` passes. `node tools/check-snapshots.mjs` passes, with a17/1 at
  its new target.
- `python3 tools/probe/record-theme-assembly.py` (main session, the owner's in-session go, T1 only):
  - the §84 rows hold, each behind its control;
  - T1's theme and `routes.yaml` are restored, read back byte for byte;
  - the Ghost 5 half is DW-326's (R-238).
- `python3 tools/doc-audit.py --check` -- PASS, twice.
- `git grep -n "PAGINATED_TARGETS.has("` -- no reader that can meet a Routes Manager file.
- Dev's results add a **Matrix row → check** table: every I/O row maps to a check that ran in that row's state.

**Review (R-82):**
- Step 111 on production at the deployed head, with Supabase service reads for the new template's doc.
- Steps 109 and 110 re-run.
- CI's `pnpm keyboard` on the push.
