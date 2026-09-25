---
title: 'Story 5.19 — The Data group and the main-feed designation'
type: 'feature'
created: '2026-09-25'
status: 'in-review'
owner_test: pending
review_loop_iteration: 1
baseline_commit: 'ba3c821bd806f7a43f9a5deed582a1dbf71ee0fd'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

On a blog page — your home page, a tag page or a writer's page — exactly one list of posts is now the page's **main
feed**: the one that pages through all your posts, ending with its "1 / 3 · Older posts" links, marked with a
small **MAIN FEED** label in Layers, on the canvas and at the top of its settings. Every other list of posts on the page
shows a fixed set you choose in its **Data** settings — the latest posts, featured posts, one tag's or one writer's
posts, or posts you pick by hand and drag into order — with how many and newest or oldest first, and the Latest Post
hero gets the same choice of which post it shows. You can make any list the main feed from its ⋯ menu in Layers, and
when you delete or hide the main feed the next list takes over, so a blog page never loses its paging by accident.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `isMainFeed` is stored on the instance and synthesis sets it on every untouched Home, Tag and Author post
grid, but nothing else manages it: a placed feed is never designated (`onPlace` writes `false`), deleting or hiding the
main feed transfers nothing, Duplicate copies the flag (DW-194), nothing reassigns it and nothing marks it. Worse, the
flag decides nothing at render — every feed design on a paginated page renders the page's own native `posts`, so a
second Three Up on Home draws the same posts with a second working pager. The Data group offers only "Show" and Order
over a design's own declared query — no Source, no tag or writer, no hand-picked posts, nothing at all on a fixed query
such as Latest Post's — and the canvas sizes the main feed by the sample dataset's 12, never the project's
`posts_per_page`.

**Approach:** One pure designation rule in the runtime, beside `synthesize` (AD-27(d)), keeps exactly one main feed on
every natively paginated canvas doc, page 1 and page 2 alike, and every door a doc enters the editor through — the
server read, the local hydrate and every edit's `apply` — passes through it, so placing, deleting, hiding, duplicating
and reassigning a feed are one rule. The runtime gains a **secondary-feed mode**: a feed design that is not the main
feed renders its native `posts` repeat through a `{{#get}}` built from the instance's stored Data values — the whole
section inside the get, nothing at all at zero, no pager — on both emitters, proven to agree. The Data group is rebuilt
as P0·5 draws it (Source, a tag or writer select, the hand-picked list, Count, Order) over the instance's existing
`data`, folded by the one `withData` door, and it serves every posts query, Latest Post's fixed one included (Source
only, R-108). D5c's MAIN FEED chip goes on the Layers row, the canvas outline and the panel head, and **Make this the
main feed** joins the Layers ⋯ menu. The main feed is sized by `projects.posts_per_page`. **No migration and no Schema
phase** — `data` and `isMainFeed` already live in the `jsonb` doc and `posts_per_page` is an existing column.

## Boundaries & Constraints

**Always:**

- **One rule, one place (AD-27(d)).** The designation rule is a pure function in `packages/section-runtime`, beside
  `synthesize`, which Story 7.3's compiler will call too. The editor passes every doc through it where the doc ENTERS
  its state: `read.ts`'s `editorData`, the local hydrate, and `apply` for every edit. Nothing else writes `isMainFeed`
  except `synthesize`'s own table, which is unchanged.
- **The invariant.** On a doc whose file is natively paginated — `PAGINATED_TARGETS` (`home`, `index`, `tag`,
  `author`), which covers page 1 and the page-2 docs (`index`, `tag-paged`, `author-paged`) — at most one instance
  carries `isMainFeed`; it is a **feed**, meaning its design's `bindingContext` includes `posts` (the native list, the
  same field `offeredOn` reads); and whenever the doc holds a visible feed, the flag is on a visible feed. A
  designation that already satisfies this is never moved: the rule only repairs a doc that breaks it. On any other
  file no instance carries the flag.
- **The lifecycle (FR-H2).**
  - The first feed placed on a paginated canvas with no main feed becomes the main feed.
  - Deleting or hiding the main feed hands the flag to the next visible feed below it, else to the nearest one above.
  - A hidden main feed with no visible feed keeps the flag. This is 5.16's "a hidden main feed is still the main
    feed" (`page-two.test.ts:104-106`), unchanged.
  - Showing a section never takes the flag back.
  - Duplicate's copy is never the main feed.
  - Reassigning is one edit.
  - Each change is part of the gesture that caused it: one `apply`, one journal entry, one `⌘Z` (Story 5.8).
- **A Tag or Author page with no visible feed is allowed, and says so** (FR-H2's archive case; PRD §8 makes the warning
  E5's). `tag.hbs` and `author.hbs` have no second file to fall through to, so their page 2 onwards would repeat page 1.
  A note at the head of Layers says so while it is true, in D5a's marker shape, extrapolated (R-74). Pre-flight's
  warning is Story 7.18's and the compiled SEO guard Story 7.3's (DW-253). Home needs neither: its page 2 is another
  file (FR-I1).
- **A doc written before the rule** is repaired where it enters the editor, and stored repaired with the next edit of
  that canvas. That covers a feed with no flag (the owner's Pilot sections Home) and two flags (a main feed duplicated
  before this story). Reading alone writes nothing (AD-22).
- **The main feed renders exactly as today**: the native `{{#foreach posts}}`, its pager and its declared empty state,
  sized by `projects.posts_per_page`. A render handed no secondary-feed input is byte-identical, and that is the
  control: `tools/check-snapshots.mjs`, the render matrix, `agreement.test.ts`, `/pilots`, the Section Picker's cards
  and the Design ring's tiles.
- **A secondary feed is a `{{#get "posts"}}` with a fixed Count** (1–100, never `limit="all"`, FR-H2).
  - **Theme.** The whole section sits inside the get and inside `{{#if posts}}`, so at zero it renders nothing at all,
    heading and container together (FR-H4). Hand-picked is one existence get over `filter="id:[…]"` around the
    section, with R-20's N single-id gets in the dragged order inside it.
  - **Both emitters.** Its pager — the smallest element holding every `data-pagination` element — is not rendered.
  - **Canvas.** It renders against the page's context with `posts` replaced by its query's rows and no `pagination`,
    the mirror of the get's scope. At zero its section is left off the canvas and its Layers row stays (R-168's shape).
- **AD-36.** A stored Source value reaches a `{{#get}}` hash only through the fold's grammar. A value outside it is
  ignored by the fold (the declaration or the default stands), and a query carrying one that reaches the emitter any
  other way is refused by name — never interpolated.
  - A tag or writer slug matches `^[a-z0-9_-]+$` — the only characters Ghost's `slugify` leaves (`unidecode`, then the
    reserved-character sweep, in `@tryghost/string` `lib/slugify.js` at both majors' pins, 0.3.5 and 0.2.17) — and is
    emitted quoted: `tag:'…'` and `author:'…'`.
  - Those two keys expand to `tags.slug` and `authors.slug` on both majors (`core/server/models/post.js:295-313`, read
    in source).
  - An id matches Ghost's 24-hex shape.
- **The Data group.**
  - **The rows.** It matches P0·5: a Source select (Latest · Featured · By tag · By author · Hand-picked); a tag or
    writer select, live-searched, name + post count, the writer's avatar or one-letter initial; the hand-picked list;
    a Count stepper; Order as Newest · Oldest.
  - **At Hand-picked.** Count and Order grey with P0·5's two sentences, the Count showing the number of picks and the
    Order marking no value (R-69).
  - **The list.** Past 25 picks the count turns warning-toned and P0·5's cost sentence appears; nothing is blocked. ×
    unpicks and never greys (UX-DR4). A drag shows the dashed landing slot, `⌥↑`/`⌥↓` move a pick and announce it
    (DW-116, `lib/reorder.ts`, `movedTo`).
  - **Where it draws.** In R-113's Data accordion, with pills only for short choices (R-114).
- **Source serves every posts query.**
  - A secondary feed's query, stored under `data.posts`.
  - A design's declared `dataBindings` posts query, stored under its key. A fixed one (R-108) offers Source and no Count
    or Order, and its Hand-picked holds at most its fixed `limit`.
  - Not a declared `filter` or `ids`: those are the design's own and draw no Source row.
  - Not a tags, authors or tiers query: those offer no Source, as today.
- **A value belongs to the source it was chosen from** (5.18's rule for subjects). Picks and a chosen tag or writer
  resolve against the source in force. What that source lacks renders nothing on the canvas, as Ghost's per-id get
  renders nothing for a missing post, and its panel row says so.
- **Nothing chosen is lost by a Source switch**: the tag, the writer and the picks are stored separately and only the
  one in force is folded (FR-D19's spirit).
- **The main feed's Data group is D5c's**: Count greyed at the posts-per-page value in force, with "This feed is sized
  by your theme's Posts per page." — and no Source or Order, because the native context owns both.
- **AD-37.** The canvas at rest carries no chrome. The MAIN FEED chip is drawn only on a hovered or selected main
  feed's outline, and it never covers the name tag (R-125).
- **R-192.** Every Data row and **Make this the main feed** is an edit, disabled while reading along. The chip is not
  an edit and stays.
- **One name per thing (R-170):** "Source", "Count", "Order" (P0·5, FR-H2, D5c). The built "Show" becomes "Count".
- **R-98.** Nothing this story adds starts work a screen waits on: every Data change and a reassign is a local edit
  (Story 5.8 syncs it). So no busy state is owed and no route is added.

**Ask First:**

- **Question 1 is RULED — R-195** (owner, 2026-09-25): the Pagination row, the Load-more rule and a design's own
  Count cap are built with the designs that need them, moved word for word into Epics 9 and 10 (Epic 9's preamble
  lists every destination).
- **Question 2 is RULED — R-196** (owner, 2026-09-25): A34's first story (Story 10.112) runs straight after A17's owner
  gate (Story 10.58), before A18. It asked about Epic 10's order and changed nothing in this story. No question is
  left open.
- If the recorder finds that a `{{#get}}` on a paginated template does **not** shadow the native `posts` inside its
  block — the secondary feed's premise — stop and say so.
- If the recorder finds `primary_tag` / `primary_author` empty on a `{{#get "posts"}}` without `include`, emit
  `include="tags,authors"` on every posts query as the fix, record it and proceed. That moves Latest Post's snapshot,
  and that move is the fix. If they are present, change nothing and say so.
- Anything that turns out to need a migration: stop — R-99, a `Schema` push first and alone. None is expected.

**Never:**

- No Pagination row, no Load-more rule and no per-design Count cap in this story — R-195 moved them word for word to
  Story 10.112, Stories 10.58 and 10.62, and every category story whose designs cap a Ghost-sourced Count.
- No Posts per page field or link on Theme settings. That is Story 7.9's (DW-254), and R-118 applies: a door arrives
  with the thing it opens.
- No route `limit:` and no channel designation. They are Story 7.16's (DW-252), and no route exists yet.
- No pre-deploy warning and no SEO guard (DW-253).
- No `docSchema` refine that refuses a doc with two flags: the rule repairs it, where a refusal would black out an editor
  over data it can fix (DW-194).
- Never edit the pilots (AD-35) or the design export (R-74).
- Add no keyboard shortcut (FR-D11), no server-side content read (AD-10), no `limit="all"`, and no new dependency.
- No "Static · From posts" switch: P0·5's authored-versus-Ghost toggle has no design in the library that is both.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Untouched archive or Home | synthesized stack | the post grid is the main feed: MAIN FEED in Layers, on its outline when hovered or selected, beside the panel's name | N/A |
| Written before the rule: a feed, no flag | Pilot sections' Home, `a4/13 · a17/1` | the first visible feed is the main feed in the editor at once; stored with the next edit of that canvas; its page 2 is now offered (R-176) | N/A |
| Written before the rule: two flags | a main feed duplicated before this story | the first visible flagged feed keeps it; the other is a secondary feed | N/A |
| Place the first feed | paginated canvas, no visible feed | lands as the main feed; announced "{name} added as the main feed." | N/A |
| Place another feed | a main feed exists | lands secondary: Source Latest, Count = the posts per page in force, Order Newest; no pager; no chip | N/A |
| Place on page 2 | page 2 on screen | the same rule on page 2's own doc (R-177) | N/A |
| Delete the main feed | another visible feed exists | the next visible feed below it — else the nearest above — is the main feed in the SAME edit; one `⌘Z` restores both | N/A |
| Delete the only feed | no other feed | zero feeds, allowed: no chip, no page 2 (R-176); Home's page 2 falls back per R-127 | N/A |
| Hide the main feed | another visible feed | the flag moves with the hide; showing it again leaves it a secondary feed | N/A |
| Hide the only feed | no visible feed | it keeps the flag, hidden (5.16's rule) | N/A |
| A Tag or Author page with no visible feed | its only feed hidden (deleting the only section returns an untouched page to its defaults, AD-22) | allowed; a note at the head of Layers says its later pages repeat page 1; gone the moment a feed shows again; never on Home | N/A |
| Duplicate the main feed | ⋯ Duplicate or `⌘D` | the copy lands secondary | N/A |
| Reassign | ⋯ **Make this the main feed** on a visible secondary feed | the flag moves; the old main feed becomes secondary with its own stored Data values (Latest, posts per page, Newest where none); announced | absent on the main feed, a hidden row, a non-feed row and a non-paginated canvas |
| Design switch | the main feed's ring | keeps the flag (a ring shares `bindingContext`) | N/A |
| Latest · Featured · By tag · By author | a secondary feed or a declared posts query | that query's rows in Order, sliced to Count | a tag or writer the source in force lacks: zero rows, and the select says so |
| Hand-picked | picks, dragged into order | drawn in that order on both emitters, never re-sorted; Count greyed at the number of picks; Order greyed with no value marked | N/A |
| Past 25 picks | the 26th | allowed; "{n} picked" warning-toned and P0·5's sentence | nothing blocked or dropped |
| A pick the source lacks | a site pick under Sample content; an unpublished or deleted post | draws nothing for it; its row stays with its note | N/A |
| No picks | Hand-picked, empty list | zero items; the list says "No posts picked yet." | N/A |
| Fixed query, Hand-picked | Latest Post (`limit` 1) | at most one pick; at the cap the search greys with its reason | N/A |
| Secondary feed at zero | nothing matches | nothing on the canvas or in the theme, heading and container together; its Layers row stays; the panel says why (5.18's note on the site's content, the per-value note on either source) | N/A |
| Count | the stepper | the query's fixed `limit`, 1–100 | outside it: "Count is a number from 1 to 100." |
| Main feed selected | its panel | Data: Count greyed at the posts per page in force, "This feed is sized by your theme's Posts per page."; no Source, no Order | N/A |
| A crafted stored value | `data.posts.tag = "x'}}{{…"`, an id that is not 24-hex | the fold ignores it, so the default query is emitted; the same value handed to the emitter as a query is refused by name — never interpolated (AD-36) | the refusal names the rule |
| Page 2 following page 1 | page 1 reassigns | page 2's copy follows — it is page 1's instances | N/A |
| Page 2 with its own design | page 1 reassigns | page 2 keeps its own main feed (R-178) | N/A |
| Reading along | B5a's session | the Data rows and **Make this the main feed** are disabled (R-192); the chip still shows | N/A |
| Sample content ↔ the site | a secondary feed's Source values | resolve against the source in force; nothing chosen is lost | N/A |

</frozen-after-approval>

## Code Map

**Read in Ghost's source (npm tarballs, 5.130.6 and 6.58.0, 2026-09-25) — hypotheses until the first task RECORDS them
(standing rule 1, AD-23).**

- `core/frontend/helpers/get.js` sets no `include` of its own. It caps `limit` at `optimization:maxLimit` || 100 on
  Ghost 6 (`:200-202`, `shared/max-limit-cap.js:13-14`).
- The Content API posts input serializer applies `defaultRelations` (tags, authors…) only to the ADMIN API
  (`api/endpoints/utils/serializers/input/posts.js:156-171`).
- So a `{{#get "posts"}}` with no `include` is expected to carry no `tags` / `authors`, and therefore no
  `primary_tag.name` or `primary_author.name`. That matters twice:
  - Latest Post's `latest` query is emitted without `include` today (`packages/ghost-shim/src/index.ts:541-545`)
    while its card prints `primary_tag.name`.
  - A secondary Three Up prints both.
- Filters: `tag` and `author` expand to `tags.slug` and `authors.slug` on both majors (`models/post.js:295-313`).
  Ghost slugs are ASCII by `unidecode` (`@tryghost/string` `lib/slugify.js`, 0.3.5 on Ghost 6 and 0.2.17 on Ghost 5).
- The native feed is sized by the theme's `posts_per_page`, or by a route's own `limit`
  (`frontend/services/routing/controllers/collection.js:32-44`, `channel.js:33-45`).

**Production, read-only (2026-09-25, `SUPABASE_URL` + `SUPABASE_SECRET_KEY`).**

- Every project stores `posts_per_page` 12.
- `project_treatments` holds no row.
- **Ghost 5 Project** (`99d4d277-…`, linked to `ghost5.inflozo.com`, connected):
  - Home: "Newsletter — Inline Row" · "Post grid" (`a17/1`, flagged) · "Heroes — Latest Post" · "Newsletter — Inline
    Row".
  - Its stored page 2 (`index`): "Post grid" (flagged) · "Newsletter — Inline Row".
- **Pilot sections** (`b6d4db35-…`, no site): Home is "Heroes — Latest Post" · "Post Grids — Three Up", with **no
  flag** — the legacy case.
- Four other accounts' "Pilot sections" copies are in the same unflagged state.
- `ghost5.inflozo.com`:
  - 33 posts, 8 of them featured.
  - Craft holds 9 posts; oldest first they are "The weight of a headline", "Notes on naming things", "Systems that
    outlive teams"….
  - The newest post is "PROBEs Gated Post".

**The rule — `packages/section-runtime`.**

- `src/synthesize.ts`:
  - `:61` is `FEED`, the one production writer of `true`; `:132` writes the flag.
  - `:161-170` is `pageTwoStack`: its R-127 fallback reads `isMainFeed` on Home, and a following page 2 IS page 1's
    instances, flags included.
  - `SynthesisEntry` (`:36-39`) has no `bindingContext`. The new rule needs it, so the library shape handed in gains it.
- `src/doc-edit.ts`:
  - `duplicateSection` `:54-64` copies the flag (`{ ...original }`).
  - `insertSection` `:74-81`, `removeSection` `:116-120`, `setHidden` `:131-133`, `moveSection` and `switchDesign`
    `:110-111` never touch the flag.
  - The header says it is the ONE pure module every gesture goes through; the new rule sits beside it, not in the app.
- `src/doc-schema.ts:50-55` holds `isMainFeed` (default `false`); its comment names 5.19 as the lifecycle's owner.
  `:67-76` is the one refine (unique ids).
- `packages/library/src/vocabulary.ts:128-130` is `PAGINATED_TARGETS`. It is the list used, and no second one is
  written; `placement.ts:71-84` `NATIVE` agrees on the four `posts` rows.
- Transfers compose inside one `op`, as `onPlace` (remove + insert) and `onRemix` already do: one `commit`, one journal
  entry (`journal.ts:33-41`).

**The fold and the emitters.**

- `packages/section-runtime/src/controls.ts`:
  - `:30-40` `ControlState.data` holds `data[key] = { count?, order? }`.
  - `dataRows` `:328-355` skips `ids` and `fixed` queries whole (so Latest Post has no Data group) and labels Count
    "Show" at a hard-coded max 100.
  - `countOf` `:357-362` falls back to `orbitWeekly.DEFAULT_LIMIT`; `validCount` `:364-365`; `orderWord` `:367-373`
    (the `ponytail:` note names 5.19).
  - `setData` `:651-661`; the one fold is `withData` `:663-688`, called once per render at `core.ts:1544-1550` and by
    `shownRows`.
  - The Data branch of `resetSection` is `:539-550`, and `resetChanges` `:558-566` puts the row labels in the confirm.
  - `DataRow` `:208-220` has no `greyed`.
- `packages/section-runtime/src/core.ts`:
  - `RenderInput` `:123-212` gets a secondary-feed field.
  - The theme's repeat `:1627-1639` emits `{{#foreach posts}}` for a context path and `{{#get …}}{{#foreach …}}` for a
    declared key.
  - The canvas's `expandRepeats` `:1666-1715` reads a context path from the ghost context `:1695-1697`.
  - `data-pagination` is handled at `:930-950` on both emitters, and `refuseUnpaginated` at `:541-549`.
- `packages/ghost-shim/src/index.ts`:
  - `getQuery` `:507-546` refuses quotes, backslashes and render-context references, re-runs `validateDataBinding`, and
    turns `ids` into N `filter="id:X" limit="1"` blocks. `getExprs` is `:553-560`.
  - `validateDataBinding`'s `bad-get-key` refuses `posts` as a DECLARED key (`validate.ts:346-348`). The secondary
    feed's query is not a declaration, so it is validated by the same function **with that one key rule not asked**,
    never by a second grammar.
- `packages/library/src/orbit-weekly.ts`:
  - `DEFAULT_LIMIT` `:402-403` is Ghost's own default read from fixture code (DW-112): it moves beside `GET_SOURCES`
    (`vocabulary.ts:393-394`).
  - `resolveSource` `:519-534` already returns `ids` in picked order and evaluates `featured:`, `tag:` and `author:` with
    quotes (`predicate` `:465-489`).
  - `postsPerPage()` `:85`, `paginationOver` `:90-95`, `listOf` `:266-286`, `feedPages` `:292-294`, `assemble`
    `:326-340` (`@config.posts_per_page` at `:330`) and `templateContext` `:365-387` all read the dataset's 12.
- `packages/section-runtime/src/agreement.test.ts` (canvas and theme compared node by node) and `src/ad36.test.ts`
  (`:187` and `:542` are the query vectors) are where the new mode is proven.

**The editor — `apps/web`.**

- `app/(app)/app/(authed)/projects/[id]/(editor)/read.ts`:
  - `:62` `projectOf` selects no `posts_per_page`.
  - `:81-87` `EditorData`: `rows` is PER DESIGN (`:307` `pilotRows(e)`), over the DECLARED binding.
  - `:185-209` parses docs, and `:226-246` synthesizes untouched canvases.
- `(editor)/editor.tsx` — anchors, top to bottom:

  | Where | What |
  |---|---|
  | `:504-507` | `offered` / `feedHere` |
  | `:772-806` | `commit` |
  | `:1563-1566` | `requestDesigns` (5.18's reads over DECLARED bindings) |
  | `:1800-1829` | the paint's one `feed` value for every section |
  | `:2420-2437` | hydrate |
  | `:2588-2612` | 5.18's shortfall (`feedShortfall`, `getShortfall`, with `orbitWeekly.postsPerPage()` at `:2599`, `:2604`) |
  | `:2657-2665` | the chrome's `place()` list: tag `top-left` of the hovered root, Pro badge `top-right` |
  | `:2685-2693` | `rowsOf` (Layers rows) |
  | `:2697-2718` | `apply`, THE door every edit passes |
  | `:2894-2899` | `onRemove` / `onToggleHidden` |
  | `:2930-2982` | `onPlace` (`isMainFeed: false` hard-coded at `:2946`) |
  | `:3366-3379` | the name tag JSX |
  | `:3520` | the panel's `PanelLabel` |
  | `:3552-3600` | `<Sidebar … page=… sourceRows={shownRows(entry, chosen, rows[entry.id])}>` |

- `apps/web/lib/canvas.ts`:
  - `renderSection` `:135-194`.
  - `shownRows` `:122-132`, whose `DEFAULT_LIMIT` fallback is `:129`.
  - `sitePage` `:48-83`: `perPage: orbitWeekly.postsPerPage()` at `:66`, and rows per DESIGN at `:74`.
- `apps/web/lib/live-content.ts`:
  - `bindingReads` `:119-146`: `ids` are one `filter=id:[…]` read, and every other query is read at `LIST_LIMIT` in
    both orders with `INCLUDE` (`:117`).
  - `siteRows` `:450-468`; `Want.perPage` `:382-383` ("the dataset's … until Story 5.19"); `LISTS` `:75-83` (the newest
    100 posts, and tags and authors with `count.posts`); `slugShaped` `:84-89`; the `ID` shape `:92`.
- `apps/web/lib/page-two.ts`:
  - `mainFeedOf` `:65-67` returns the first flagged instance, hidden included. `noPageTwo` is `:79-85` and `mainFeedOn`
    `:152-158`.
  - `pageTwoOf` / `editedDoc` `:109-120`: a following page 2 is edited as its copy of page 1.
- `apps/web/components/controls/layers.tsx:288-316`:
  - The ⋯ menu reads Hide/Show · Rename · Duplicate (absent on site-wide rows) · Clear dark overrides (R-133) · Delete.
  - `LayerRow` is `:65-76`.
  - `kit/layers-row.tsx:50-102` gives grip · thumbnail · name button · `overflow` (the ⋯). No chip exists anywhere.
- `apps/web/components/controls/sidebar.tsx`:
  - `data()` `:372-388` draws one `GhostList` per query key and drops `setData`'s refusals.
  - The group loop is `:437-462`, D5d's row `:467-481`, and 5.18's note at the panel head `:422-435`.
- `apps/web/components/controls/item-list.tsx`:
  - `GhostList` `:290-373` is P0·3's Ghost-sourced card (Stepper "Show", Segmented Order, the canvas's rows greyed,
    "+ Add post" greyed with `FROM_GHOST`). P0·5 replaces it as the Data group's body.
  - `ItemList`'s drag `:39-285` is the pattern to follow, with its dashed `data-drop-slot` `:121-128` and handles
    `:143-179`. The component itself is not reusable: it is tied to `PropRow` and `moveItem`.
- `apps/web/lib/reorder.ts:14-53` (`captureLayout`, `shift`, `slotTop`, `landingAt`) is already shared by Layers.
- `apps/web/components/kit/`:
  - `stepper.tsx` — a greyed stepper shows the number in force.
  - `select.tsx` — `Select` `:80-144`, and `openPopover` `:23-78`, which focuses a search field.
  - `segmented.tsx` — per-option greying.
  - `greyed.ts` — `greyedProps` `:26-35` throws without a reason; `marked` `:38-40` is R-69's no-value mark;
    `ReadOnly` `:67-69`.
  - `badge.tsx` — `VersionChip`, the nearest recipe for the chip.
- Searchable rows to reuse:
  - `components/controls/link-picker.tsx:149-369` (`LinkPanel`), whose posts carry `id`.
  - `lib/preview-subject.ts:39-55` (`SubjectRow`, which has no `id`) and `siteSubjects` `:83-92`.
  - `lib/live-content.ts` `siteLinks` `:574-594`, which carries D5e's capped line.
- `app/(app)/app/(authed)/controls/review.tsx` duplicates `shownRows` (`:119-131`) and mounts the panel over fixture
  1's `latest` query (`packages/library/fixtures/controls/1`); `page.tsx:40` is `queryRows` per design.
- `app/(app)/app/harness/editor/page.tsx`:
  - The keyboard harness's Home is `[a17/1 (flagged), a22/1, a4/13, controls/1]`; `:51-65` derive the flag from
    `SYNTHESIS_DEFAULTS`.
  - Its `EditorData` literal gains the posts per page.

**The frames (R-74).**

- `D5 Canvas Markers and Template Switcher.dc.html`, **D5c** (`:267-356`):
  - **The Layers chip** `:290`: JetBrains Mono 8.5px 500, `#3A3835` on `#EFECE7`, pill radius, `2px 6px`, tracking
    .03em, after the name.
  - **The canvas chip** `:312`: the same type, on the page ground with a `1px #E7E2DB` border, `2px 7px`, drawn on the
    selected outline 14px from its left.
  - **The panel head** `:334-335`: the name with the chip beside it.
  - **The other feed's ⋯** `:299-302`: "Make this the main feed" · "Duplicate section" · "Remove section".
  - **Count** `:340-348`: greyed, with "This feed is sized by your theme's Posts per page. Change it in Theme settings."
    and a "Theme settings ↗" link.
  - **Pagination** `:350`: None · Older/Newer · Numbers, with "Only the main feed paginates, because only it reads the
    page number in the URL."
- `P0-5 Populate From Panel.dc.html` is the Data group's frame. The states are Static, By tag with its select open,
  By author, Hand-picked, and past 25. The words are P0 spec `:458-500`.
- `A17-1 Three Up.dc.html:146`: A17's Data panel, drawn before the P0·5 rulings, the source of "Source" as the row's
  word.
- `Editor Sidebar Kit.dc.html:100` is the Count stepper.
- `S4 Editor.dc.html:181` is the name tag.

**The harnesses.**

- `tools/probe/record-shim.py` records a real Ghost's answers into `packages/ghost-shim/fixtures/ghost{5,6}/`.
  - The template is `tools/probe/theme-shim/index.hbs`; the `PILOT` group's `get_latest` is `:55`.
  - Its docstring is its help — `--help` runs a real upload.
  - `packages/ghost-shim/src/contract.test.ts` asserts the recording per commit.
- `tools/probe/run-verify-editor.cjs`:
  - The highest step is 93.
  - Step 33 asserts the exact menu `Hide · Rename · Duplicate · Delete` on the seeded `a17/1`, which is the main feed
    after this story, so it is offered no new item.
  - Step 92 plants the flag at `:4766-4772`, and step 3 checks the canvas at rest.
- `tools/keyboard/journey.spec.mjs`:
  - `feedRow` `:1719-1725`.
  - `:2023` deletes the harness's only feed and expects no main feed.
  - `:1483` expects zero chrome at rest.
- `tools/probe/run-verify-live-content.cjs:160-165` sets the flag through the service key.
- `tools/probe/run-verify-controls.cjs:360, :374, :384` pin the word "Show".

## Tasks & Acceptance

**Execution:**

- [x] `tools/probe/theme-shim/index.hbs` + `tools/probe/record-shim.py` -- **FIRST, before any code.** Add a `FEED` group
  to the probe index. Its rows, each under the native feed of the same page:
  - a `{{#get "posts"}}` with and without `include="tags,authors"`, printing `title|primary_tag.name|primary_author.name`;
  - `{{#if posts}}` inside a get whose filter matches nothing, on a page whose native `posts` is full (the shadowing
    premise);
  - `filter="tag:'craft'"`, `filter="author:'priya-raman'"` and `filter="featured:true"`, each with
    `order="published_at asc"` and a `limit`;
  - three single-id gets in a chosen non-date order;
  - `{{pagination.next}}` inside a get, which is why a secondary feed drops its pager.

  Record both majors and extend `contract.test.ts` to assert every row. Write it up as `MEASUREMENTS.md` §53.
  -- The whole secondary-feed mode rests on these facts, and one of them may change Latest Post's emitted theme.
- [x] `packages/library/src/vocabulary.ts` + `orbit-weekly.ts` -- Move `DEFAULT_LIMIT` beside `GET_SOURCES`, with
  `orbitWeekly` re-exporting or its readers re-pointed (DW-112). Declare the Source vocabulary once — the five values
  and their words — plus the slug and id grammars the fold emits. Give `templateContext` / `assemble` / `listOf` /
  `feedPages` / `paginationOver` an optional page size that defaults to the dataset's, so every existing call answers
  unchanged. -- One vocabulary for the panel, the fold and the words; the page size is the project's.
- [x] `packages/section-runtime/src/main-feed.ts` (new, exported from the index) -- The rule, pure:
  - `isFeed(entry)` is `bindingContext` includes `posts`.
  - `designate(doc, file, isFeed, previous?)` returns the doc satisfying the invariant, the SAME object when nothing
    changes. A transfer's direction is read from `previous`.
  - `makeMainFeed(doc, file, instanceId, isFeed)` returns the next doc or a sentence (a hidden or non-feed instance, or
    a non-paginated file, refuses).
  - `feedQuery(entry, instance, file, postsPerPage)` gives the secondary feed's folded `DataBinding` — the base is posts,
    Count = posts per page, Order newest, folded with `data.posts` — or `undefined` for a main feed or a non-feed.
  - `feedlessArchive(doc, file, isFeed)` is true on `tag.hbs` or `author.hbs` with no visible feed — one predicate for
    the editor's note now, and Story 7.18's Pre-flight and Story 7.3's guard later.

  `SynthesisEntry` gains `bindingContext`. -- AD-27(d): the designation rule in one place, for the editor now and the
  compiler at 7.3.
- [x] `packages/section-runtime/src/doc-edit.ts` -- `duplicateSection`'s copy gets `isMainFeed: false`. The other
  operations stay flag-agnostic, and the rule runs after them. -- DW-194's duplicate half, where the copy is made.
- [x] `packages/section-runtime/src/controls.ts` -- The fold and the rows:
  - `withData` folds a stored Source into a posts query: `featured:true`; `tag:'…'` or `author:'…'` for a slug in the
    grammar; `ids` for picks in the grammar, dropping `filter`/`limit`/`order`; at most `limit` picks on a fixed query.
    Junk is ignored.
  - `dataRows` gains a Source row, a tag or writer row and a picks row. Count takes the label "Count" and reads 1–100.
    Count and Order come back greyed at Hand-picked with P0·5's sentences; `DataRow` gains `greyed`.
  - A fixed query draws Source alone.
  - `setData` accepts `source`, `tag`, `author` and `picks` and refuses junk in a sentence ("Count is a number from 1 to
    100.").
  - `resetSection` and `resetChanges` name every changed row.
  - The secondary feed's rows are the same functions over `data.posts` and `feedQuery`'s base.

  -- One fold, one set of rows, for both kinds of query and both emitters.
- [x] `packages/section-runtime/src/core.ts` + `packages/ghost-shim/src/index.ts` -- A `RenderInput` secondary-feed
  query:
  - **Theme.** The root sits inside the get and inside `{{#if posts}}`; hand-picked is the existence get with the N
    ordered single-id gets inside.
  - **Canvas.** `posts` becomes the rows handed for it and `pagination` goes; zero renders `''`.
  - **Both.** The pager is not rendered.

  The feed query is validated by `validateDataBinding` with the declaration-only key rule skipped. `include` follows the
  recording. -- The two emitters' one new difference, proven to agree.
- [x] `apps/web/lib/live-content.ts` + `apps/web/lib/canvas.ts` -- Rows come per INSTANCE, over its folded queries:
  - The sample's are resolved client-side with `orbitWeekly.resolveSource` at the Count's ceiling in both orders, or the
    picks in pick order.
  - The site's come through `bindingReads` / `siteRows` over the folded binding, one cache key per query, so two
    sections asking alike share one request.
  - `renderSection` takes the secondary-feed query.
  - `perPage` is the project's.
  - `shownRows` reads the folded bindings.

  -- 5.18's reads and the render door, fed the instance's own query instead of the design's declaration.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` -- `projectOf` selects `posts_per_page` and
  `EditorData` gains `postsPerPage`. Every paginated canvas doc and page-2 doc is handed out through `designate`.
  `rows` stops being per design for posts queries: the editor resolves them. Add `postsPerPage: 12` to the harness
  literal. -- The server truth the editor paints from.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- The editor side:
  - `designate` at the hydrate and inside `apply` for a paginated doc, with the doc before the edit as `previous`.
  - `onPlace` no longer hard-codes the flag.
  - `onMakeMainFeed` is one `apply`, announced politely.
  - The delete and hide announcements name a transfer.
  - `paint()` hands each feed instance its `feedQuery`, and each instance its own rows.
  - 5.18's shortfall and reads (`requestDesigns`) go over the folded queries.
  - The posts per page is threaded wherever `orbitWeekly.postsPerPage()` stood.
  - The MAIN FEED chip is drawn beside the panel's `PanelLabel`, and on the canvas in the chrome layer, placed where the
    name tag is and against its right edge while the tag shows.
  - The Layers rows carry `mainFeed` and `canLead`.

  -- One door for every lifecycle change, and the marker wherever the section is named.
- [x] `apps/web/components/controls/layers.tsx` + `apps/web/components/kit/layers-row.tsx` -- The chip on the main
  feed's row, before the ⋯. **Make this the main feed** goes in the ⋯ menu straight after Hide/Show (R-126 keeps
  Hide/Show first), only where `canLead`. The chip's words are "Main feed", uppercased by CSS, so assistive technology
  reads words. The feed-less archive note sits at the head of Layers beside `AutoGeneratedRow`, in its shape, while
  `feedlessArchive` holds. -- D5c's two Layers pieces, and FR-H2's archive case in the editor.
- [x] `apps/web/components/controls/data-group.tsx` (new) + `sidebar.tsx` + `item-list.tsx` -- P0·5's body replaces
  `GhostList` as the Data group:
  - The Source `Select`.
  - The tag and writer selects, searching over the source in force's rows with their counts, and D5e's capped line.
  - The picked list: "Search posts to add" over the source's posts; drag with the dashed slot through `lib/reorder.ts`;
    `⌥↑`/`⌥↓` with `movedTo`; ×; "{n} picked", warning-toned past 25, with P0·5's sentence; each row's note.
  - The Count `Stepper` and Order `Segmented`, greyed at Hand-picked.
  - The main feed's greyed Count with D5c's first sentence.
  - `setData` refusals shown at the row.
  - Everything inside `ReadOnly`.

  -- The frame's panel, drawn once for every posts query.
- [x] `apps/web/lib/data-group.ts` (new, pure and importless but for types) -- Every string in *Design Notes*; which
  rows a query draws; the per-value notes (not in the source in force, unpublished); the 25 threshold; a fixed query's
  cap sentence. -- `node --test` reaches it, as `lib/view-as.ts`.
- [x] `apps/web/app/(app)/app/(authed)/controls/review.tsx` + `page.tsx` -- Fixture 1's `latest` gets Source, with rows
  resolved per state through the same function the editor uses, never the duplicate `shown`. -- The deployed Controls
  review page shows the Data group on a query that is not fixed.
- [x] Tests:
  - `packages/section-runtime/src/main-feed.test.ts` (new) -- every matrix row of the lifecycle and the invariant,
    including the SAME-object answer.
  - `controls.test.ts` -- the fold per Source, junk ignored, the rows and their greying, the fixed cap, "Count".
  - `agreement.test.ts` -- a secondary feed with rows, at zero and hand-picked, node for node.
  - `ad36.test.ts` -- a crafted slug, id or source is inert and a legitimate one emits.
  - `doc-edit.test.ts` -- the duplicate is unflagged.
  - `orbit-weekly.test.ts` -- the control unedited; a page size of 6 pages the sample at 6.
  - `apps/web/data-group.test.ts` (new) -- every string equal to *Design Notes*.
  - `live-content.test.ts` -- folded reads, one per key.
  - `page-two.test.ts` -- its "no main feed" row (`:102-104`, named for the owner's Pilot sections) becomes a Home with
    no feed at all, since a feed with no flag is repaired before `page-two.ts` ever reads it.

  -- The matrix is the contract.
- [x] `tools/keyboard/journey.spec.mjs` -- On the harness:
  - `⌘K` places a second Three Up, which lands secondary: no chip, a Data group.
  - The ⋯ menu's **Make this the main feed** by keyboard moves the chip.
  - Delete moves it back.
  - `⌘D` on the main feed gives an unflagged copy.
  - Source and the picked list's `⌥↑`/`⌥↓` work, with the move announced.
  - The canvas carries zero chrome at rest.

  -- R-146: the wiring on every commit.
- [x] `tools/stress/sections.js` + `tools/stress/build.js` -- The 70-section theme gains the `feed` archetype rendered as a
  secondary feed once per Source — Latest, Featured, By tag, By author, Hand-picked — beside the feeds it already
  has. -- gscan reads the new emission (the whole section inside a get, the existence get around the picks) on both
  majors, where a theme is judged.
- [x] `tools/probe/run-verify-editor.cjs` (step 94) + `run-verify-live-content.cjs` + `run-verify-controls.cjs` -- The
  deployed walks (R-82):
  - Step 94 walks every lifecycle row, the marker at rest and on hover, the Data group on the sample and a crafted value.
  - The live walk walks By tag / By author / Featured / Hand-picked over T1 and T3, with one request per key, the
    source switch keeping picks, and, if the recorder required it, the tag printed on Latest Post.
  - The controls walk takes the word "Count" and the Source row.

  -- The canvas is proven on production, not a harness.
- [x] `docs/section-authoring.md` + `…/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` (AD-27) +
  `…/prds/prd-Inflozo-2026-08-17/prd.md` (FR-H2) + `_bmad-output/implementation-artifacts/deferred-work.md` -- The docs:
  - **section-authoring.md** — what a feed design is (a `data-repeat="posts"` over the native context, one element
    holding its pager, a `data-if="posts"` that reads either scope) and what the secondary mode does to it.
  - **AD-27** — name the rule's function, and say that Story 7.3's compiler passes every stored doc through it as the
    editor does, so a doc written before the rule compiles with the main feed the canvas shows.
  - **FR-H2** — "Count".
  - **The ledger** — close DW-194, DW-112 and DW-116's hand-picked half with their resolutions; amend DW-151 and
    DW-154's 5.19 halves; the Question-1 moves once ruled.

  -- Standing rule 3.

### Review Findings

Review of 2026-09-25 on `34874458` (five layers: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier). The real-infra layer ran before a patch was written: every Ghost fact the fold rests on re-executed
by Content API on T3 and T1 with a control, production's `projects.posts_per_page` read back (no migration in the diff —
R-99 holds), `app.inflozo.com` at `34874458`, and the three deployed walks 0 FAIL on their first run (*Results —
Review*). **Every patch below is applied; the story stays in review and Deploy, then the owner's test, follow.**

- [x] [Review][Patch] The main feed's early return dropped its declared queries' Data rows [`packages/section-runtime/src/controls.ts` `dataRows`]
- [x] [Review][Patch] Nothing kept picks unique — a repeated id emitted twice and collided React's keys [`controls.ts` `picksIn`, `setData`]
- [x] [Review][Patch] The existence get carried `include="tags,authors"` for nothing rendered [`packages/ghost-shim/src/index.ts` `feedExprs`]
- [x] [Review][Patch] A pick that is not a 24-hex id was inert but not refused by name at the emitter (AD-36) [`feedExprs`, `ad36.test.ts`]
- [x] [Review][Patch] A `posts` repeat nested in another repeat would render a hand-picked feed differently on the two emitters — refused by name [`packages/section-runtime/src/core.ts`]
- [x] [Review][Patch] `pagerOf`'s refusal of a flat pager had no test [`agreement.test.ts`]
- [x] [Review][Patch] Every pick read "Not on {site}" for one round trip after a Data change, from the previous paint's rows [`editor.tsx` `chosenRows`, `sidebar.tsx`, `data-group.tsx` `Picks`]
- [x] [Review][Patch] `editReads` was never cleared, so a read that failed once was never asked again for the session [`editor.tsx` `chooseSource`]
- [x] [Review][Patch] Removing a pick dropped focus to the body and said nothing; adding one said nothing [`data-group.tsx` `Picks`, `lib/data-group.ts`]
- [x] [Review][Patch] Neither search had an empty-result sentence [`data-group.tsx`, `lib/data-group.ts` `NO_MATCHES`]
- [x] [Review][Patch] The tag and writer selects drew no capped line and called a value past the 100 fullest missing [`data-group.tsx` `Taxonomy`, `editor.tsx` `dataLists`, `CAPPED_LIST`]
- [x] [Review][Patch] `mainFeedOf` existed twice, byte for byte [`apps/web/lib/page-two.ts`]
- [x] [Review][Patch] The sample cache grew one entry per Count step or Order flip [`apps/web/lib/canvas.ts` `sampleRows`]
- [x] [Review][Patch] The harness wrote `postsPerPage: 12` down [`apps/web/app/(app)/app/harness/editor/page.tsx`]
- [x] [Review][Patch] The stress theme's feed had no `data-if="posts"` and no pager, so gscan never judged the secondary mode's two effects; `sections.js` was named in the task and untouched [`tools/stress/sections.js` `pagedFeed`, `build.js`, `compile.js`]
- [x] [Review][Patch] The pilots walk's step 13 asserted Latest Post has no Data group — the opposite of an AC [`tools/probe/run-verify-pilots.cjs`]
- [x] [Review][Defer] The two repair doors and `paint()`'s edit-read branch are proven only by the deployed walks — deferred, DW-257
- [x] [Review][Defer] 5.18's `slugShaped` and 5.19's `GHOST_SLUG_RE` disagree on accented letters and doubled hyphens, neither executed on Ghost — deferred, DW-258
- [x] [Review][Defer] Past 100 picks the site read returns fewer rows than the theme renders — deferred, DW-259

**Acceptance Criteria:**

- **The frames.**
  - Given a paginated canvas with a main feed, when I look at Layers, hover the feed and select it, then the MAIN FEED
    chip is on its Layers row, on its outline beside the name tag, and beside its name at the head of the panel —
    **matching frame D5c** — and never on the canvas at rest.
  - Given any section with a posts query, when I open its Data group, then it **matches frame P0-5** — Source · tag or
    writer · picked list · Count · Order, and the Hand-picked and past-25 states.
- Given a secondary feed with Source, Count and Order set, when the section is rendered by both emitters, then the canvas
  shows exactly the posts the theme's `{{#get}}` would, in the same order, with no pager — and at zero neither draws the
  section at all (`agreement.test.ts`, node for node).
- Given any lifecycle gesture — place, delete, hide, duplicate, reassign — when I press Undo once, then the whole
  gesture, transfer included, is undone.
- Given the harness, the pilots, the Section Picker's cards, the ring's tiles, `check-snapshots` and the render matrix,
  when nothing hands a secondary-feed query, then every render is byte-identical to today's — the control.
- Given Latest Post, when I open its Data group, then it offers Source and neither Count nor Order, and Hand-picked
  holds one post.
- Given a project, when a main feed renders, then it is sized by that project's `posts_per_page` on the sample and on the
  site's content alike (a unit test proves a value other than 12).
- Given the site's content, when a secondary feed asks for rows, then each distinct query is read once per 60 s through
  5.18's cache, and a pick or tag the site lacks draws nothing and says so.
- Given a crafted stored Source value, when the section is compiled, then no part of it reaches the theme: the fold
  ignores it and the default query is emitted, and the same value handed to the emitter as a query is refused by name
  (AD-36).
- Given a session reading along, when I open the Data group or a feed's ⋯ menu, then every Data row and **Make this the
  main feed** is disabled (R-192), and the chip still shows.
- Given a Tag or Author page with no visible feed, when it is on screen, then a note at the head of Layers says its
  later pages would repeat page 1 and the theme asks search engines to skip them, and the note goes the moment a feed
  shows again; Home never carries it.
- Given this story's controls, when any of them is pressed, then none starts server work a screen waits on and no route
  is added, so `busy.test.ts` stays green (R-98).

## Spec Change Log

- **2026-09-25, Review (five layers on `34874458`, the real infrastructure): nothing in the frozen block changed; the
  review's own calls, each stated rather than asked.**
  - **The main feed keeps its declared queries' rows.** `dataRows` drew D5c's greyed Count and RETURNED, so a feed design
    that also declares a `dataBindings` posts query (none in the library today; Epic 9's and 10's will) lost that query's
    Source while it was the main feed, and `setData` refused every value for it. It now draws the Count and then the
    declared rows.
  - **A post is picked once.** Nothing kept picks unique: a doc carrying an id twice (a merge, a crafted value) emitted the
    post twice and collided React's keys. The fold folds a repeated id once and `setData` says *"A post can be picked
    once."*
  - **The existence get asks for no relations**, and **a pick that is not a 24-hex id is refused by name at the emitter**
    — the frozen AD-36 bullet said so and only the fold enforced it; the shared grammar accepted any word. An id outside
    it was inert already; now it is named.
  - **A `posts` repeat nested inside another repeat is refused as a hand-picked secondary feed** — the theme would have
    walked the existence get's one row while the canvas expanded every pick. The library holds no such design.
  - **The site's rows not yet in hand mark no pick lacking**: for one round trip after a Data change every pick read
    *"Not on {site} — unpublished or deleted."*, from the previous paint's rows. The panel now knows "not read yet" from
    "absent" (`shown` undefined).
  - **Choosing the site again clears an edit's asked reads** — 5.18's one "try again" (`retried`) now covers `editReads`
    too, where a key whose read failed once was never asked again for the whole session.
  - **A pick added or removed is said** (*"{title} added."* · *"{title} removed."*) and removing one keeps focus in the
    list, or on the search when the list empties; **a search with no match says** *"Nothing matches."*; **the tag and
    writer selects carry D5e's capped line** (*"Showing your {n} fullest tags."* / *"…writers."*) and call nothing missing
    past it — the task bullet asked for the capped line and the build drew it on the post search alone. The words join
    `lib/data-group.ts` and its test (R-170). Routine calls: the sentences follow D5e's shape; the owner's test judges them.
  - **One `mainFeedOf`** (`page-two.ts` re-exports the runtime's); **the sample cache is keyed per query**, not per Count
    or Order; **the harness derives its page size** from the sample rather than writing 12.
  - **The stress theme gains the paged feed shape** — a `data-if="posts"` list and one pager, as A17 #1 is built — once
    as the main feed (the control, pager kept) and once per Source as a secondary feed (pager left out), so gscan judges
    the `{{#if posts}}` a secondary feed wraps around the design's own and the pager it drops: 0 / 0 on both majors. The
    task named `sections.js`, which Dev had left untouched; it now carries `pagedFeed`.
  - **The pilots walk's step 13** asserted Latest Post has no Data group — the opposite of this story's acceptance
    criterion — and was outside the sweep; it now opens Data and reads Source alone (no Count, no Order).
  - **Not patched, each with a ledger row:** DW-257 (the two repair doors and the paint's edit-read branch are proven by
    the deployed walks alone), DW-258 (5.18's `slugShaped` and 5.19's `GHOST_SLUG_RE` disagree on accented letters and
    doubled hyphens, neither executed on Ghost), DW-259 (past 100 picks the site read returns fewer than the theme
    renders). **Dismissed**: "By tag with nothing chosen renders the latest posts" — the frozen AD-36 bullet says the
    declaration stands (a patch was tried and the tests refused it); the chip on a selected main feed while another
    section is hovered (read: it stays); `onPlace`'s literal `isMainFeed: false` (the schema's default, `apply`
    designates); a hydrate over a design the library lost (FR-D9's vanished-design guard already refuses it).

- **2026-09-25, Dev: the recording and gscan changed two things the frozen block names; no frozen text was edited.**
  - **A writer is emitted `authors:'…'`, not `author:'…'`** (Always, the AD-36 bullet). Both answer the same posts on
    both majors — MEASUREMENTS §53's `by_author` and `by_authors` rows, asserted in `contract.test.ts` — but gscan
    refuses the singular as an ERROR on both bundled versions (GS001-DEPR-AUTH-FILT, executed by `tools/stress`'s gate
    against a control copy), and every emitted theme must scan at 0 errors (AD-34). The grammar, the quoting and AD-36's
    refusal are unchanged; `authors` expands to the same `authors.slug`.
  - **Every posts query carries `include="tags,authors"`** — Ask First's case, as it directs: the recorder found
    `primary_tag` and `primary_author` empty in a `{{#get}}` without it on both majors (§53). Latest Post's snapshot
    moved by that one line (`packages/library/snapshots/a4/13/template.hbs`), and it is the fix.
- **2026-09-25, Dev: routine calls, each stated rather than asked.**
  - The rule's functions take the LIBRARY (`designate(doc, file, library, previous?)`, `makeMainFeed(…, library)`,
    `feedlessArchive(…, library)`) where the task wrote `isFeed`: `synthesize`'s own shape, and `isFeed(entry)` is asked
    inside. `EditorData.rows` is gone rather than narrowed: every query, not only a posts one, is now the instance's,
    resolved in the browser by `lib/canvas.ts`'s `sampleRows` (the one resolver `/pilots` and the matrix use too).
  - The chrome layer's host declares `--tw-border-style:solid` so the canvas chip's border draws; that also gives
    5.15's PAUSED chip and P0-1's pill the hairlines their frames draw. Their SHADOWS still draw none, for the same
    reason — DW-256, outside this story's surfaces.
  - P0·5's past-25 box is drawn as the frame draws it (`:193-195`): its hairline (`coral-tint-strong`), its two bold
    phrases, and the count toned but not bolded. The owner's test step 13 says "coral-red", not "amber": the frame's
    warning tone is the coral family, and marigold is Pro-and-celebration only (DESIGN.md).

## Design Notes

**Why a mode and not a second binding.** A feed design repeats the page's native `posts`, and the same markup has to
serve as the main feed and as a fixed feed.

- Ghost's own `{{#get "posts"}}` block shadows `posts` inside it (appendix B.1 §5's block scope; recorded first). So a
  secondary feed is the SAME markup inside a get, and on the canvas the same markup is rendered against a context whose
  `posts` are the query's rows.
- Nothing about the design changes and no key is invented. The design's own `data-if="posts"` reads whichever scope it
  is in.
- The whole section is inside the get because FR-H4's "nothing at all, heading and container together" can only be
  decided outside the heading.
- The pager goes because inside a get `pagination` is the query's, and `{{page_url pagination.next}}` would link to the
  route's page 2 — a wrong page, not a missing one.

**The rule repairs, it never refuses.** AD-27 says the designation is stored and never recomputed from position. A doc
that already satisfies the invariant is returned as the same object, so a valid designation is never moved. Only a doc
the lifecycle could never have produced is repaired:

- a feed with no flag, from before the rule;
- two flags, from a duplicate before this story;
- a flag on a hidden feed while a visible one exists.

A schema refine would instead black out the whole editor over a doc the rule can fix.

**The consequence the owner will see.** His Pilot sections Home gains a MAIN FEED chip on its Three Up, and a page 2,
the first time it opens — the lifecycle's first rule applied to a page written before it existed.

**Where the chip sits.** D5c draws it straddling the selected outline 14px in — the frame's section is selected, not
hovered. The app's name tag (S4 `:181`, R-125) holds that corner whenever the section is hovered. So the chip is placed
in the tag's corner, and against the tag's right edge while the tag shows. The rule is that it never covers the tag,
and those offsets are only how it is delivered (R-138's precedent). The owner's test judges it (R-80).

**What is not built, and where it went.**

- **Pagination style, the Load-more rule and per-design Count limits** — **R-195** (Question 1), word for word:
  - the Pagination style goes to Story 10.112, with the page-2 copy's control and DW-232/DW-233;
  - the Load-more rule goes to Stories 10.58 and 10.62;
  - the Count cap goes to every category story whose designs cap a Ghost-sourced Count. Some of them come BEFORE
    Epic 10 — A2's posts source (9.5) and A3 #9 Latest Posts (9.11) — so Epic 9's preamble carries the full list and
    Epic 10's points at it.

  None of them had a design to work with here: the library's only feed draws its own pager, and nothing caps a Count
  below 100.
- **P0·5's authored-or-Ghost switch and naming two queries in one design** — also Epic 9's: Story 9.5 (A2's shared
  list is the first design that is both) and Story 9.2 (A1 #7 Mega Bar's columns, DW-165).
- **D5c's "Change it in Theme settings." and its link** — Story 7.9 (DW-254). Theme settings has no Posts per page
  field until then (R-118).
- **The route's `limit:` and a channel's designation at creation** — Story 7.16 (DW-252). No route exists, so the value
  in force is always the project's.
- **The archive's Pre-flight warning, the per-template hand-picked warning and the SEO guard** — Stories 7.18 and 7.3,
  whose criteria now name them (DW-253). The archive's EDITOR warning is this story's — the Layers note above.
- **P0·5's "When nothing matches"** — R-36 left that field one value: the designed empty state, never a back-fill. A
  one-value field offers nothing to choose (UX-DR3's could-never), so no row is drawn, and FR-H2's sentence holds by
  construction — nothing ever back-fills. That closes DW-165's "When nothing matches" half.

**Routine calls, each stated here rather than asked.**

- **"Source", not P0·5's "Filter" or A17's "Tag or author"** — FR-H2 and R-113 say Source, and R-170 wants one name.
- **"Count", not "Show"** — P0·5, D5c and FR-H2.
- **The Layers menu keeps its built words** — Duplicate and Delete, not D5c's "Duplicate section / Remove section".
  **Make this the main feed** sits second, after Hide/Show (R-126).
- **The transfer target** — the next visible feed below, else the nearest above: "the next feed section" read in page
  order.
- **A new secondary feed's Count** — the posts per page in force, so a demoted main feed keeps showing its page 1.
- **The main feed's Data group is D5c's** — the greyed Count alone. FR-H2's native context owns Source and Order.
- **The Section Picker's cards and the ring's tiles** — preview the design as today, not the placement.
- **Picks store `{ id, title }`** — the title labels the panel row only and is never rendered, so a pick the source in
  force lacks still reads as itself.
- **The spec is kept whole** — its one goal is that feeds on a paginated page behave. A secondary feed's whole
  configuration IS the Data group, so splitting it would ship fixed feeds that can only show the latest posts.

**The words (R-170). These are the strings.** `{name}` is a layer name, `{site}` is the site's name as 5.18 gives it,
and `{n}` is a number.

| Where | What it says |
|---|---|
| Layers row · canvas outline · panel head | **MAIN FEED** — the words "Main feed", uppercased by CSS |
| Layers ⋯ | **Make this the main feed** |
| `#editor-said`, reassign | *"{name} is now the main feed."* |
| `#editor-said`, delete or hide with a transfer | the gesture's own sentence, then *"{name} is now the main feed."* |
| `#editor-said`, a placement that designates | *"{name} added as the main feed."* |
| Data · Source | **Source** — **Latest** · **Featured** · **By tag** · **By author** · **Hand-picked** |
| Data · tag / writer | **Tag** / **Author** — each option "{name}" with "{n} posts" (one post: "1 post") |
| a tag or writer the source lacks | *"Not a tag on {site}."* · *"Not an author on {site}."* · on sample: *"Not in the sample content."* |
| picked list | **Picked posts** · *"{n} picked"* · the search field *"Search posts to add"* · empty: *"No posts picked yet."* |
| a pick the source lacks | *"Not on {site} — unpublished or deleted."* · on sample: *"Not in the sample content."* |
| past 25 picks | *"Past 25 picks this gets slow. Every pick adds a database query, on every page this section appears on — not once per section. Three hand-picked sections at 25 each is 75 database queries, about three-quarters of a second added to every visitor's page load."* (P0·5) |
| Count, greyed at Hand-picked | *"The list you picked is the count."* |
| Order, greyed at Hand-picked | *"The list you picked is the order — these posts render in the order you dragged them."* |
| a fixed query at its cap | *"{design} shows {n} post, so it holds {n} pick."* (plural at 2+) |
| Count refused | *"Count is a number from 1 to 100."* |
| main feed · Count, greyed | *"This feed is sized by your theme's Posts per page."* |
| head of Layers, a Tag or Author page with no visible feed | *"This {Tag/Author} page has no list of posts. Ghost still serves its page 2 onwards, which would repeat page 1, so your theme asks search engines to skip them."* |

## Verification

**Commands** (Node 24, the repo's `engines.node`; keys only by variable name):

- `python3 tools/probe/record-shim.py` (read its docstring first — `--help` uploads)
  -- expected: every `FEED` row recorded on T1 and T3, with the previous theme restored and the probe theme deleted on
  both. The shadowing row prints `EMPTY` over a full native feed. The ids print in the chosen order. Written to
  `MEASUREMENTS.md` §53, and the `include` finding is stated either way.
- `pnpm check` -- expected: exit 0, including:
  - `main-feed.test.ts`, `agreement.test.ts` and `ad36.test.ts`;
  - `orbit-weekly.test.ts`'s control, unedited;
  - `contract.test.ts` over the new fixtures;
  - `busy.test.ts`;
  - `check-snapshots` unchanged, save Latest Post's `include` if the recording required it, named in the commit.
- `bash tools/matrix/run-matrix-gate.sh` -- expected: no baseline moves.
- `pnpm keyboard` -- expected: green, the new journey rows among the passes.
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- expected: 0 errors / 0 warnings on both
  majors, the five secondary feeds included (a root `pnpm install` first, Node 24).
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0 (no SQL change).
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID)=' tools/probe/.env | xargs) node tools/probe/run-verify-editor.cjs`
  -- expected: 0 FAIL on `app.inflozo.com` at HEAD, step 94 among the passes. It is known-flaky (DW-222, DW-220), so
  record every run.
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID|GHOST5_URL|GHOST5_CONTENT_API_KEY|GHOST6_URL|GHOST6_CONTENT_API_KEY)=' tools/probe/.env | xargs) NO_429=1 node tools/probe/run-verify-live-content.cjs`
  -- expected: 0 FAIL on both majors. `NO_429=1` spares T1 its hour-long hold (§52).
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID)=' tools/probe/.env | xargs) node tools/probe/run-verify-controls.cjs`
  -- expected: 0 FAIL.
- `python3 tools/doc-audit.py --check`, twice -- expected: PASS.

### Results — Dev, 2026-09-25, on the real infrastructure (R-82)

**The Ghost test servers — T3 `ghost5.inflozo.com` (5.130.6) and T1 `ghost6.inflozo.com` (6.58.0)**, keys by name
`GHOST5_URL` · `GHOST5_STAFF_ACCESS_TOKEN` · `GHOST5_CONTENT_API_KEY` and the same three `GHOST6_` names:

- **The recorder ran first, before any code** — `python3 tools/probe/record-shim.py`, twice (the second added
  `by_authors`). Every `FEED` row recorded on both majors, identical but for the newest post's own title (MEASUREMENTS
  §53's table): the native feed `12|1/3|2`; a get with no `include` printed every `primary_tag` and `primary_author`
  EMPTY, and with `include="tags,authors"` both (so every posts query now asks — Ask First's case); `shadow_zero`
  printed `EMPTY` over a full native feed and the get's own `{{else}}` never ran (the premise holds, and `{{#if posts}}`
  is what renders nothing at zero); `tag:'craft'`, `author:'priya-raman'`, `authors:'priya-raman'` and
  `featured:true` each answered the same three slugs on both majors; three single-id gets printed in the chosen
  non-date order (08-11 · 08-10 · 08-12), inside the existence get too, and an existence get over an id no post has
  printed `EMPTY`; inside a get `{{page_url pagination.next}}` is the route's `/page/2/`.
- **Read back afterwards** with `GET /ghost/api/admin/themes/`: `casper` active on both servers and
  `inflozo-probe-shim` gone from both. The recorder writes one probe theme per run and restores the previous one; it
  created no post and changed no setting.
- **gscan, by execution** (`tools/stress/gate.js`, a control copy of the stress theme differing only in the writer
  filter): `author:'…'` is ERROR GS001-DEPR-AUTH-FILT on gscan 4.49.7 and 6.4.2 alike, `authors:'…'` 0 / 0 — so the fold
  writes `authors:` (Spec Change Log). Read in both bundled gscans' source too: `level: 'error'` at
  `lib/specs/v5.js:527`.

**The deployed walks, first run, at `84a7b5cf`** (the first Dev commit: CI run 36127146566 — `check`, `rls` and
`deploy` success, the render matrix 36127146743 success; `dpl_GteHBaLfzxSJJsRBzVJWTpqaa78i` READY on `app.inflozo.com`,
read with `GITHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`). Each made its own throwaway account through Supabase's Auth
admin API (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`) and deleted it, users 13 before · 13 after. **They found a real
defect, fixed in the next Dev commit:**

- **The editor walk: 1 FAIL, 619 PASS**, all 44 of step 94's checks among the passes (the Pilot-sections-shaped seed
  repaired into a main feed and stored repaired by the next edit, D5c's chip, the lifecycle rows each one Undo, the
  archive note, Latest Post's Source alone, a crafted stored value inert, a pick the sample lacks). The FAIL was step 29's
  R-126 check that the post grid's name fits its row: the MAIN FEED chip now takes its place there, and "Post Grids —
  Three Up" ends in "…", as "Newsletter — Inline Row" already did. The walk now reads R-126's width on a row with no
  chip, and checks the main feed's row separately: the chip sits between the name and the ⋯ and overlaps neither.
- **The live walk (`MAJORS=5,6 NO_429=1`): 24 FAIL, 90 PASS**, and 22 of the FAILs were ONE DEFECT. An edit that needs
  a site read nothing had asked for — By tag, By author, Featured or picks chosen, a feed duplicated — was painted as
  5.18's paint paints a page whose reads are not all in hand: the WHOLE page from the sample, and nothing ever read the
  new query. So on the site, Latest Post By tag drew no card, the duplicated grid drew the sample's twelve, By tag
  started on the sample's fullest tag, and the picks came from the sample's list. **Fixed at the one funnel, `paint()`:**
  such a paint now hands the read to `request()` — the one door a read goes through — which paints the site when the
  rows land; the old paint stays on screen meanwhile with nothing on it pointable, and each such read is asked once
  (`editReads`), so one that does not answer leaves the page on the sample as a press's does and is never retried.
  With it, a hand-picked list's one `filter=id:[…]` read is keyed by its ids SORTED — Ghost answers in its own order
  and `siteRows` re-orders by the pick — so a pick dragged or ⌥-moved to a new place reads nothing.
  The other 2 FAILs were the walk's own: its request counter counted every GET to the Ghost origin, and T3 had gained
  pictures stored on Ghost itself since 5.18's walk — the writer Umang's photo and "Reading the margins"'s feature image
  (read on T3's Content API) — so an `<img>` the canvas drew counted as a read. It now counts Content API reads only.
  The walk read 121 requests in all, against the ceiling of 500.

**The deployed walks again, at `9f330277`**, after the fix (`dc593877`, CI run 36130175074 green and deployed) and the
sorted pick key (CI run 36130358617 — `check`, `rls` and `deploy` success, the render matrix 36130358563 success;
`dpl_2WaiDhJDU8fQsTks8zZxEfZk8NYh` READY on `app.inflozo.com`). Each on its first run, each account deleted, users 13
before · 13 after:

- **The live walk, `MAJORS=5,6 NO_429=1`: 0 FAIL, 116 PASS.** On T3 and T1 alike: Latest Post By tag "Craft" printed
  its newest post's own tag, "Craft" — the `include` fix, live; ⌘D on the main feed landed a secondary feed drawing the
  site's newest 12 with no pager; By tag started on the site's fullest tag, "Craft · 9 posts", and drew exactly Ghost's
  own answer for it; Oldest and Count 3, By author "Umang" and Featured did too; three picks from "Search posts to add"
  drew in the picked order, and ⌥↓ moved one, said so and redrew; a Source switch kept the tag and the picks and cost 0
  requests; on Sample content the hand-picked section left the canvas and each picked row said "Not in the sample
  content.", and back on the site every pick returned in its moved order; reading along (R-192), the chip stayed while
  every ⋯ and every Data control was disabled; and no key Ghost answered was asked for again inside 60 s. Per major, 7
  requests opened the editor and the major cost 53 over 27 keys; the whole walk 107 Content API requests, against the
  ceiling of 500.
- **The editor walk: 0 FAIL, 621 PASS** — step 94's 44 checks and step 29's two: R-126's width on the Hero row, and on the
  main feed's row the name 54px wide, the chip 8px after it and 8px before the ⋯.
- **The controls walk: 0 FAIL, 113 PASS** — step 15's Data group opens on Source, offering Latest · Featured · By tag ·
  By author · Hand-picked in that order; "Count" reads 5; and Reset names "Background role, Count and Order".

**Resend and Dodo:** not touched — this story sends no email and bills nothing. No migration, so no Schema phase.

**Locally, Node 24:**

- `pnpm check` exit 0: `packages/library` 185 (`orbit-weekly.test.ts`'s control unedited), `ghost-shim` 40
  (`contract.test.ts` over the new `FEED` rows), `section-runtime` 263 (`main-feed.test.ts`, `agreement.test.ts`,
  `ad36.test.ts`), `apps/web` 547 (`busy.test.ts`, `data-group.test.ts`, `page-two.test.ts`, `live-content.test.ts`),
  and `check-snapshots` PASS — 5 designs at 10 targets — with one line moved, Latest Post's `include`, the recording's fix.
- `pnpm keyboard`: 57 passed, the six "5.19 ·" journeys among them.
- `bash tools/matrix/run-matrix-gate.sh`: 180 cases · 5 designs · 0 violations, no baseline moved.
- The stress theme (`node build.js && node gate.js theme`; `npm install` skipped, its `node_modules` is root-owned):
  75 sections over 7 templates, the five secondary feeds among them — ERRORS 0 WARNINGS 0 on gscan 4.49.7 and 6.4.2.
- `bash supabase/tests/run-rls-gate.sh`: exit 0 (no SQL changed). `doc-audit --check`: PASS on its second run.
- **A probe, executed on the harness editor** (the repo's Playwright): in the canvas's chrome layer `border` now draws
  1px solid, and `shadow-md` / `shadow-lg` still compute `none` while the editor's own document draws them (the
  control) — recorded as DW-256.

**The Matrix Test Audit** — each row, and the tests that ran and passed for it (U: `main-feed.test.ts`,
`controls.test.ts`, `agreement.test.ts`, `ad36.test.ts`, `doc-edit.test.ts`, `page-two.test.ts`,
`live-content.test.ts`, `data-group.test.ts`, `orbit-weekly.test.ts`; K: the keyboard journeys):

- *Untouched archive or Home* — K (the harness Home's chip in Layers and at the panel head; AD-37's chip on a pointed
  or selected main feed only, never over the name tag); `check-snapshots` and `synthesize.test.ts` (the flag from the table).
- *A feed, no flag · Two flags* — U (`main-feed.test.ts`'s two repair rows; `page-two.test.ts`: the repaired Pilot
  sections shape offers a page 2).
- *Place the first feed* — U; K (lands as the main feed, "{name} added as the main feed.", one ⌘Z takes it away).
- *Place another feed* — K (lands secondary: Source Latest, Count 12, Order Newest, one pager, no chip).
- *Place on page 2* — U (the rule on `index.hbs`'s own doc).
- *Delete the main feed* — U (below, else the nearest above); K (the transfer in the same edit, both sentences, one ⌘Z).
- *Delete the only feed* — U; `page-two.test.ts` (no page 2 on a Home with no feed); K (the Story 5.16 journey that
  deletes the harness's only feed).
- *Hide the main feed · Hide the only feed* — U.
- *A Tag or Author page with no visible feed* — U (`feedlessArchive`, never Home); `data-group.test.ts` (the sentence).
- *Duplicate the main feed* — U (`doc-edit.test.ts`, `main-feed.test.ts`); K (⌘D's copy unflagged, one pager).
- *Reassign* — U (one edit; refused on a hidden row, a non-feed and a non-paginated file); K (the menu's words and
  order, absent on the main feed and a non-feed row, the chip moved and said, one ⌘Z).
- *Design switch* — U.
- *Latest · Featured · By tag · By author* — U (`controls.test.ts`'s fold per Source; `agreement.test.ts` node for node;
  `live-content.test.ts`: one read per distinct query, shared by two sections).
- *Hand-picked · No picks · Secondary feed at zero* — U (`agreement.test.ts`: the existence get around the ordered
  single-id gets, nothing at all at zero on both emitters); K (Hand-picked with nothing picked leaves the canvas, its
  row stays; three picks drawn in order; ⌥↓ moves one, said).
- *Past 25 picks* — U (`slow(26)`; thirty picks accepted and folded).
- *A pick the source lacks* — `data-group.test.ts` (the sentences); the deployed editor walk's step 94 (a planted pick
  the sample does not hold draws nothing, its row stays and says so).
- *Fixed query, Hand-picked* — U (Source alone, the cap of one); `check-snapshots` (Latest Post's Data group is Source).
- *Count · Main feed selected* — U (1–100 and its refusal; D5c's greyed Count); K (the main feed's Data group).
- *A crafted stored value* — U (`ad36.test.ts`: inert through the fold, refused by name as a query, the legitimate
  value emitted quoted).
- *Page 2 following page 1 · Page 2 with its own design* — `page-two.test.ts` (added at this verification: page 1
  reassigns, a following copy follows and a page 2 of its own keeps its own, on Home, Tag and Author).
- *Reading along · Sample content ↔ the site* — the deployed live walk (R-192's disabled rows and chip; the switch to
  Sample content and back, added at this verification), and the owner's test step 12.

### Results — Review, 2026-09-25, on the real infrastructure (R-82)

**Ground, read first.** `app.inflozo.com` served `34874458` — this checkout's HEAD before the patches —
(`dpl_5TSkNSyRwMM7E36z8v6AUqhmyUxW` READY, `meta.githubCommitSha` read with `VERCEL_TOKEN` · `VERCEL_TEAM_ID`). No file
under `supabase/migrations/` in the diff; `projects.posts_per_page` present on the hosted database (PostgREST
`select=posts_per_page&limit=1` → `[{"posts_per_page":12}]` with `SUPABASE_URL` · `SUPABASE_SECRET_KEY`; the control
`select=no_such_column_5_19` → 400 `42703`). Resend and Dodo: no code line in the diff names either.

**The Ghost facts, re-executed by Content API on T3 `ghost5.inflozo.com` and T1 `ghost6.inflozo.com`** (`GHOST5_URL` ·
`GHOST5_CONTENT_API_KEY`, the `GHOST6_` pair), identical on both majors: `filter=tag:craft` → 9 posts;
`filter=authors:priya-raman` and `filter=author:priya-raman` → the same 11 posts in the same order; `filter=featured:true`
→ 8; `limit=1` with no `include` → `primary_tag` and `primary_author` absent, with `include=tags,authors` → present;
`filter=id:[b,a,c]` asked in non-date order → answered in Ghost's date order (so the sorted read key stands). The
control: `filter=tag:no-such-tag-5-19-control` → 200, 0 posts.

**The deployed walks at `34874458`, before the patches, each on its first run**, throwaway accounts made through
Supabase's Auth admin API and deleted, users 13 before · 13 after: the controls walk **0 FAIL, 113 PASS**; the editor walk
**0 FAIL, 621 PASS**; the live walk (`MAJORS=5,6 NO_429=1`) **0 FAIL, 116 PASS**. The pilots walk refuses a dirty
`packages/` or `apps/`, so it runs after the push, against the deploy that carries its new step 13.

**Locally, Node 24, after the patches:** `pnpm check` exit 0 — `packages/library` 185, `ghost-shim` 40,
`section-runtime` 266 (the review's three rows: the main feed's declared rows and the repeated pick in
`controls.test.ts`, the flat-pager refusal with its control in `agreement.test.ts`, the non-hex pick in `ad36.test.ts`),
`apps/web` 548 (the words). The stress theme (`node build.js && node gate.js theme`): 76 sections over 7 templates,
`paged-main` with its pager and the five secondary copies without — **ERRORS 0 WARNINGS 0** on gscan 4.49.7 and 6.4.2.
`pnpm keyboard`: 57 passed, the six "5.19 ·" journeys among them, on the harness with its derived page size.

**The review's first push, `43916359`, went RED in CI** (run 36140412228, `check` — `tools/stress/test-vocabulary.mjs`:
"ORDER and A have drifted apart", because `pagedFeed` had been added to the archetype table `A`, which that test holds
equal to `ORDER`; the render matrix 36140412151 and `rls` were green, `deploy` skipped — nothing reached production, the
control DW-7 promises). The local run had passed only because its exit code was not read. `pagedFeed` now lives beside
`A`, `pnpm check` exit 0 with all 22 vocabulary checks, and the deployed walks below ran against the push after it.
**The second push, `302b3dfc`, went RED too** (run 36141100550, `pnpm keyboard`: the 5.19 Hand-picked journey's `menuTo`
pressed ↓ before the Source select's popover had opened and taken focus — "no menu row reads Hand-picked" — 56 of 57
passed; green locally on every run). `menuTo` now waits for `:popover-open` first; the six 5.19 journeys ran four times
each through the gate, 24 of 24. Again `deploy` was skipped and nothing reached production.
**The third push, `972d90ea`, went red on the SAME journey** with the wait in place, and the fourth, `7de502e8` —
which changed nothing but `menuTo`'s error message — went **green** (CI 36142173632, the matrix 36142173733,
`deploy` success). So the red is intermittent on the runner and not in the app: three runs, two red at the same line
with nothing between them touching the Source select, one green. `menuTo` now names what was focused and what the open
popovers held, so the next red can be read from the runner rather than reproduced; the six 5.19 journeys are 24 of 24
locally over four repeats. This is DW-222's shape (a walk step red on untouched code) and is recorded here, not fixed.

**After the patches, the deployed walks at `7de502e8`** (`dpl_5n41unPgGffQwPQDkSvD564kcRif` READY on `app.inflozo.com`,
`meta.githubCommitSha` = HEAD), each on its first run, in sequence, throwaway accounts made and deleted, users 13 before ·
13 after: the **pilots walk 0 FAIL, 152 PASS** — its new step 13 reads Latest Post's Data group as Source alone, no Count
and no Order (R-108); the **controls walk 0 FAIL, 113 PASS**; the **editor walk 0 FAIL, 621 PASS**, step 94's 44 checks
among them; the **live walk (`MAJORS=5,6 NO_429=1`) 0 FAIL, 116 PASS**, 107 Content API requests against the ceiling
of 500. The recorder was NOT re-run — its §53 facts were re-executed by Content API above, and a run uploads a theme.

## Owner's manual test

On the real site after Deploy, in a desktop browser about 1440 wide. Deploy confirms the URLs.

- Steps 1–13 use your **Ghost 5 Project**, which shows your ghost5.inflozo.com posts.
- Steps 14 and 15 use **Pilot sections**.
- Step 16 puts the Ghost 5 Project back as it was.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Look at Layers. Point at the post grid on the canvas, then click it. | — | The **Post grid** row in Layers carries a small grey **MAIN FEED** label. Pointing at the grid shows the label on its outline, beside the coral name tag. Nothing shows once the pointer leaves. Clicked, the settings panel's title reads **Post grid** with **MAIN FEED** beside it, and its **Data** group shows **Count 12**, greyed, under *"This feed is sized by your theme's Posts per page."* — no Source and no Order. The grid still ends with "1 / 3" and "Older posts →". |
| 2 | same | Editor, Home | With the post grid selected, press **⌘K**, open **Post Grids** and choose **Three Up**. | — | A second grid, **Post Grids — Three Up**, lands below the Post grid. It shows your 12 newest posts, starting with "PROBEs Gated Post", with **no** Newer/Older links, and its Layers row has no label. Its Data group reads **Source: Latest · Count 12 · Order: Newest**. |
| 3 | same | Editor, Home | With the new grid selected, set **Source** to **By tag**, then choose **Craft** in the **Tag** list. | — | The Tag list shows your tags with their counts: Craft · 9 posts, Field Notes · 8 posts…. The new grid shows Craft's 9 posts, newest first. The note at the top of the panel says *"This site has 9 posts for this section; it shows up to 12."* |
| 4 | same | Editor, Home | Set **Order** to **Oldest**, then **Count** to **3**. | — | The grid shows three posts: "The weight of a headline", "Notes on naming things", "Systems that outlive teams". |
| 5 | same | Editor, Home | Set **Source** to **Hand-picked**. In **Search posts to add**, type and choose three posts, then drag **The cost of clever** to the top. | `grid`, then `margins`, then `clever` | **Picked posts · 3 picked**. The grid shows the three in your order, "The cost of clever" first. **Count** reads 3, greyed, with *"The list you picked is the count."* **Order** is greyed with neither choice marked, and *"The list you picked is the order — these posts render in the order you dragged them."* |
| 6 | same | Editor, Home | Set **Source** back to **By tag**, then to **Hand-picked** again. | — | By tag brings back Craft, oldest first, 3. Hand-picked brings back your three picks in your order. Nothing you chose is lost. |
| 7 | same | Editor, Home | In Layers, open the **⋯** on **Post Grids — Three Up** and choose **Make this the main feed**. | — | The **MAIN FEED** label moves to it. It now shows your 12 newest posts, ending with "1 / 3" and "Older posts →". **Post grid** loses its label and its links and shows your 12 newest as a fixed list. |
| 8 | same | Editor, Home | Press **Undo** (the curved arrow at the top). | — | One press puts everything back as it was after step 6: the label on **Post grid**, and your three picks on the new grid. |
| 9 | same | Editor, Home | Open **⋯** on **Post grid** and choose **Delete**. Then press **Undo**. | — | After Delete, **Post Grids — Three Up** becomes the main feed: the label moves and the Newer/Older links appear. One Undo brings **Post grid** back as the main feed. |
| 10 | same | Editor, Home | Open **⋯** on **Post grid** and choose **Hide**. Then open its **⋯** again and choose **Show**. Then press **Undo** twice. | — | Hidden, the other grid takes the label. Shown again, **Post grid** stays an ordinary fixed list without the label. Two Undos put the label back on **Post grid**. |
| 11 | same | Editor, Home | Click **Heroes — Latest Post**. In its **Data** group set **Source** to **Hand-picked** and choose a post. | `margins` | Only **Source** is offered (no Count, no Order). The hero's card shows "Reading the margins" instead of your newest post. After one pick the search greys: *"Latest Post shows 1 post, so it holds 1 pick."* |
| 12 | same | Editor, Home | Press the pill at the foot of the canvas and choose **Sample content**. Then choose **Ghost5** again. | — | On sample content your hand-picked grid disappears from the page, and each of its picked rows says *"Not in the sample content."* Latest Post's card goes too, and its words stay. Back on Ghost5, both return exactly as you left them. |
| 13 | same | Editor, Home | (Optional) Keep hand-picking posts in the new grid until you have 26. | any | At 26 the count **"26 picked"** turns coral-red and the sentence *"Past 25 picks this gets slow…"* appears. You can keep going. Nothing is blocked. |
| 14 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home (Pilot sections) | Look at Layers, then click **Post Grids — Three Up**. | — | Its row now carries **MAIN FEED** — beside a name this long, the name shortens with "…" to make room. It had never been marked, and this story marks the first list on a page that has none. Its panel now offers **Preview page 1 · 2** below the settings. |
| 15 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/tag` | Editor, Tag (Pilot sections) | Open **⋯** on **Post grid** and choose **Hide**. Then open it again and choose **Show**. Then press **Undo** twice. | — | Hidden, a note appears at the head of Layers: *"This Tag page has no list of posts. Ghost still serves its page 2 onwards, which would repeat page 1, so your theme asks search engines to skip them."* Shown again, the note is gone. Two Undos leave the Tag page as it was. |
| 16 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Put things back: open **⋯** on **Post Grids — Three Up** and choose **Delete**. Set Latest Post's **Source** back to **Latest**. | — | Home is as it was before step 2, and Latest Post shows your newest post again. |

## Questions for the owner

### Question 1 — Three parts of this story only work once Epic 10's designs exist. Build them now, or with those designs?

**In plain English.** This story makes one list of posts the page's **main feed** and lets you choose what every other
list shows. The plan also asks it for three things that each need a design that does not exist yet:

1. **A "Pagination" setting on the main feed.** It chooses how visitors reach older posts: numbered pages,
   "Older / Newer" links, a "Load more" button or endless scrolling. The ten designs for it are A34 Pagination Styles,
   and they arrive in Epic 10.
2. **A rule that a "Load more" grid can only be the main feed.** Those grids are A17 #16 and A18 #15, also Epic 10.
3. **A design's own limit on how many posts it shows** — for example "Two Up shows at most 6".

Today your only list design, **Three Up**, draws its own "Newer posts · 1 / 3 · Older posts" links and has no limit
below 100. So each of the three would be a setting with nothing real to act on.

**An example.** You click your Post grid. With option 1 its settings show the greyed Count and nothing about pagination,
and the grid keeps its own Newer/Older links. With option 2 the same, but the **Controls** review page shows a
Pagination setting working over three stand-in test designs. With option 3 the grid's settings show a greyed
"Pagination" row saying it arrives later.

1. **Build them with those designs in Epic 10, and move these three requirements there word for word. (RECOMMENDED)**
   - The Pagination setting comes with the first pagination designs (Story 10.112). So does the choice of which
     **free** pagination design an untouched page uses, which the plans disagree about (DW-232, DW-233).
   - The Load-more rule comes with A17 #16 and A18 #15, and each design's own limits come with its category.
   - Nothing on screen offers a choice that cannot do anything — your rule **R-118**.
   - Each is built against the real designs it serves, so its shape is theirs, not a guess.
2. **Build them now, tried out on the Controls review page with stand-in test designs, and keep them out of the editor
   until Epic 10.**
   - This is how the design ring was proven (your R-158), so you see them working now.
   - It costs a bigger story.
   - The stand-ins would decide how a pager attaches and how a limit is declared, and the real designs might have to
     undo that.
3. **Show them now, greyed, with "Arrives with the pagination designs."**
   - Says the feature exists.
   - But it is three controls that do nothing.

**Ruled: option 1 (owner, 2026-09-25)** — *"Build them with those designs in Epic 10, and move these three requirements
there word for word. Ensure these are picked up in EPIC 10 and no requirement/feature is missed."* Recorded as
**R-195**. Where each landed, word for word:

- *"the main feed alone exposes Pagination style: Numbered / Load More / Infinite scroll"* → **Story 10.112**, with
  the Pagination control on page 2's copy of the main feed, the one project-level value it stores, Theme Settings'
  pagination half (Story 7.14), and the two choices still open on it (DW-232, DW-233).
- *"load-more designs are main-feed-only"* → **Stories 10.58** (A17 #16) **and 10.62** (A18 #15).
- *"a design may cap its own Count below the global and the panel states the reason"* → every category story whose
  designs cap a Ghost-sourced Count. The first ones come **before** Epic 10, which is why Epic 9's preamble carries
  the full list: A2's posts source (9.5) and A3 #9 Latest Posts (9.11), then A17's grids (10.54) and the post lists of
  Epic 10.

Also given owners so nothing is missed:
- the Data group's two first-needed pieces (Stories 9.5 and 9.2);
- FR-H2's Pre-flight warnings and SEO guard (Stories 7.18 and 7.3, DW-253);
- a route's own page size and a channel's main feed (Story 7.16, DW-252);
- the Theme settings link (Story 7.9, DW-254).

Checking the ruling found one gap it could not close alone — **Question 2**.

### Question 2 — Your post grids lose their page links when Epic 10 rebuilds them. When should the pagination designs arrive? (raised 2026-09-25, from your ruling on Question 1)

**In plain English.** Today your Three Up grid draws its own **"← Newer posts · 1 / 3 · Older posts →"** links —
that is how a visitor reaches your older posts. In the finished library a list of posts draws no page links of its
own: the drawings for every Post Grid and Post List leave them to the **Pagination style** attached beneath the main
feed — the setting your ruling on Question 1 moved to Story 10.112. Epic 10 builds its categories in order:

- **Story 10.54** rebuilds the Post Grids from their drawings, so the links go.
- **Story 10.112** brings them back as a Pagination style, some fifty stories later.

In between, Ghost still serves page 2, but nothing on the page leads to it. The pagination designs are built out of
pieces of the Post Grids — their spacing and the focus ring of #18 Edge to Edge (Story 10.58) — so they cannot come
first. This does not hold up Story 5.19.

**An example.** Your Ghost 5 Home, once Epic 10 is under way:

- After Story 10.54, the post grid ends at its twelfth card with nothing beneath it.
- Once the pagination designs are in, it ends with the style you choose, for example "← Newer · Page 1 of 3 · Older
  →".

1. **Build the pagination designs' first story (10.112) straight after the Post Grids' last story (10.58), before Post
   Lists. (RECOMMENDED)**
   - The links are missing only while the Post Grids' own five stories are built and tested.
   - Everything the first four pagination designs are built from exists by then.
   - The other two pagination stories (10.113, 10.114) and their owner gate stay at the end, where what they need is
     (Post Lists' Load More, Featured's bands).
   - It becomes Epic 10's third stated exception to "one category at a time", beside A25's and A33's.
2. **Keep the order.**
   - From Story 10.54 to Story 10.112 your main feeds have no page links.
   - That includes your own tests of every category from Post Grids to Card Treatments.
3. **Keep the order, and let the Post Grids keep today's "Newer · 1 / 3 · Older" links until Story 10.112 replaces
   them.**
   - No gap.
   - But those designs differ from their drawings for that whole stretch, which your rule R-74 does not allow.

**Ruled: option 1 (owner, 2026-09-25)** — *"Build the pagination designs' first story (10.112) straight after the Post
Grids' last story (10.58), before Post Lists."* Recorded as **R-196**. Where it landed:

- **`epics.md`.** Epic 10's preamble names it as the epic's third ordering rule, beside A25's and A33's. Stories 10.54,
  10.58, 10.59, 10.112 and 10.113 each say where they now sit.
- **`sprint-status.yaml`.** It lists Story 10.112 in its running place, straight after 10.58, and the Create prompt's
  "the previous story in that epic" reads that order.
- **`tools/story-board.py`.** Its gate follows the tracker's order instead of the story numbers, so the board offers
  10.112 after 10.58 and makes 10.59 wait for it.
- **PRD §8, `build-sequence.md` step 7 and the two build overrides in `_bmad/custom/`.** Each states the one
  exception.

The page links are then missing only while A17's own five stories are built and tested (DW-255, closed).
