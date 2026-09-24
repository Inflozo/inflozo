---
title: 'Story 5.18 — Live content from the connected site'
type: 'feature'
created: '2026-09-24'
status: 'in-review'
owner_test: pending
review_loop_iteration: 1
baseline_commit: 'ebce8976242b11f4a7fbc7560baf6b9cac0cd0d3'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Open a project that is linked to your Ghost site and every page of the editor now shows **your own** posts, pages,
tags, writers, site name and menu — read straight from your site — instead of the made-up magazine Orbit Weekly, and
the pill at the foot of the canvas says so with a solid outline and a green dot: **"Previewing with: Ghost5"**. You
can switch that pill to **Sample content** and back at any time, pick one of your own posts, pages, tags or writers
for each page to show, link words to your own posts from the link box, and see your newest post inside the Section
Picker's previews. If your site cannot be reached or turns Inflozo away, the canvas quietly shows the sample content
instead and the pill says why; and when a section has fewer posts than it can hold, its panel tells you — *"This tag
has 5 posts; this section shows up to 12 per page."* — with a **Preview with sample content** button beside the words,
so a brand-new site's single post never stops you seeing the page full.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every canvas renders the bundled Orbit Weekly publication even on a project linked to a connected site
with a Content API key: the pill reads "Sample content" everywhere (R-165) and nothing in the editor reads
`projects.linked_site_id` or `sites.content_key` — `EditorData` carries no linked site at all. Four paths read the
bundled dataset directly: `templateContext` / `resolveSubject` / `feedPages` (`orbit-weekly.ts`), `linkResources()`,
each design's `{{#get}}` rows (`pilotRows` → `queryRows`, built on the server), and D5e's `bundledSource()`. So the
customer designs against someone else's content, and 5.13's "5.18 swaps the source and rebuilds nothing" holds only
for the pill's list.

**Approach:** The browser reads the linked site's Content API directly (AD-10) through **one read layer per editor
session**: a 60 s stale-while-revalidate cache keyed by resource and query, **one request per key** shared by the
canvas, the Section Picker's cards, the Design ring's tiles, D5e's subject list and the Link Picker, a per-session
request ceiling, and a failure policy that never retries a refusal. What it reads is handed to the render door in the
**same `{ghost, site}` shape** `templateContext` builds today, through one assembly shared with the bundled path, so a
render given no live content is today's render byte for byte — the story's control. **The body is never read:** posts
and pages are requested with `formats=mobiledoc`, which Ghost's Content API reduces to *no* body format while still
computing `reading_time` and `excerpt` on the server (read in source and executed on both majors, Code Map), and a
whitelist mapping copies only the fields the canvas reads. **No migration and no Schema phase** — `sites.content_key`
and `project_template_prefs.preview_subject` (`jsonb`) exist, and the source choice is session state.

## Boundaries & Constraints

**Always:**

- **AD-10.** The Content API is read from the browser only, direct to the site's Ghost, with the key the project's
  site row holds (`sites.content_key`, delivered on purpose — FR-C3, SPINE:439) and `Accept-Version: v5.0`
  (`content-check.ts:40`'s pin). No server route reads or proxies content (`admin-rule.ts:164`: *"the Content API is
  the browser's path, never the server's"*).
- **Never the body (FR-H4, NFR-3).** Posts and pages are asked for with `formats=mobiledoc`; the mapping copies no
  `html`, `plaintext`, `lexical` or `mobiledoc` field even if a future Ghost returns one; `{{content}}` stays the
  style-guide fixture on `post.hbs` and `page.hbs`.
- **NFR-3's carve-outs, applied to live values.** `codeinjection_*` — which `/settings/` returns (§38b) — is dropped
  at the mapping and is never stored, rendered or logged; every URL goes through the shim's existing `ghostUrl`;
  excerpts stay text; `feature_image_caption`, which Ghost stores as HTML (§31a), is reduced to its words through an
  inert `DOMParser` document (`lib/inline.ts`'s `readMarks` precedent) before it reaches a row. **The Content API key
  never reaches the render context, the canvas markup, a log line or a printed URL**, and `{{content_api_key}}` stays
  the shim's inert placeholder (FR-H5).
- **One request per key, and background reads never paint.** A key read in the last 60 s is served from memory with
  no request; an older one is served at once and revalidated once in the background; two consumers asking at once
  share one request. A background revalidation updates the cache and **never repaints by itself** — the next paint
  shows it — so a field being typed in or a drag in progress is never interrupted. A read the customer asked for
  (opening the editor, a canvas, a subject, page 2, a source, a picker) paints when it lands.
- **The failure policy protects the customer's own network.** Ghost counts every failed Content API request against
  the caller's IP and, after 99, refuses **every** key from that network for at least an hour (read in source, both
  majors — Code Map). So: a **401 or 403 is never retried** in the session; a **429** stops reading at once; **three
  failed reads in a row** (network, timeout, 5xx, any other status ≥ 400) stop reading; the **session ceiling** stops
  reading. Choosing the site in the SOURCE group is the one "try again" — the reads that page needs, once each. The
  ceiling counts `GET`s; a CORS preflight (`Accept-Version` asks for one) is the browser's and is not counted.
- **The pill describes the canvas** (R-165): its source words name what the **last paint** used, in B9's two looks
  only — solid hairline and mint dot for the site's content, dashed and grey for sample — and a cause is carried in
  **words** (colour never the only signal). **A render is one source throughout:** if a read it needs is neither in
  memory nor answered, that render is sample content from end to end — a canvas, a card or a tile is never half the
  site's and half the sample's.
- **A subject belongs to the source it was chosen from.** One chosen over the site is stored as
  `{ kind, slug, source: 'site' }` — `preview_subject` is `jsonb`, so no migration — and an unmarked one is the
  sample's, as every row written before this story is. A stored subject of the OTHER source renders that source's own
  starting subject **silently** and is kept for when its source returns; 5.13's `GONE` sentence is said only when the
  subject's own source answered and the subject is not in it (FR-D22: deleted, unpublished or newly gated).
- **Zero is an answer, not a failure** (R-36, PRD:330). An empty list renders empty — the main feed's own declared
  empty state, a `{{#get}}` binding's `[]` — and is **never back-filled** with sample rows.
- **Sample content is today's render.** `renderSection` without the live argument, `/pilots`,
  `tools/check-snapshots.mjs`, the render matrix and the keyboard harness (which links no site) are unchanged and are
  the control.
- **The source is a VIEW** (`EXPERIENCE.md:230`): session state beside View as and the device, never stored, never an
  edit (nothing reaches `commit()`, the journal or `⌘Z`), and **live in a session reading along** (R-192 keeps view
  controls live).
- **R-98.** Choosing a source or a subject that has to read says so — label swapped, `aria-busy` and `aria-disabled`,
  never `disabled` — until its paint lands.
- **The frames (R-74):** the pill matches **B9** and its menu **D5e**, as Story 5.13 built them and R-166 sized them
  (24px). No frame draws a fallback or a greyed SOURCE row, so both are **extrapolated from B9, B6's dot-and-word
  status and UX-DR3** — same components, same tokens, no second vocabulary.
- **One name per thing (R-170):** the site has one name everywhere — the pill, the SOURCE row and every sentence — and
  it is the title `/settings/` reports, which is also the `@site.title` the canvas prints; until that read has
  answered, and for a site that cannot be read, it is `sites.title` (the host when that is empty).

**Ask First:**

- **Question 1 is RULED — R-193** (owner, 2026-09-24): an untouched Tag and Author page on the site's own content
  start on the tag and the author with the most posts, a tie going to the name first in the alphabet.
- **Question 2 is RULED — R-194** (owner, 2026-09-24): a brand-new site's one post stays what the canvas shows, and
  the note that says a section's list is not full carries a **Preview with sample content** button while the site's
  content is showing. Nothing waits on the owner.
- If the recorder finds `formats=mobiledoc` returning a body on either major — the premise of "never the body" — stop
  and say so.
- If Ghost's 429 arrives **without** `access-control-allow-origin`, the browser cannot read its status and the 429 row
  collapses into "not answering" — record it and say so rather than inventing a way round.
- Anything that turns out to need a migration: stop — R-99, a `Schema` push first and alone. None is expected.

**Never:**

- No server-side content read or proxy, and no browser Supabase client (`lib/editor.ts:135-137`); the key arrives in
  `EditorData`, server-rendered.
- No SWR or react-query dependency — the cache is a `Map`.
- **No server-side title search.** A malformed search term is a 4xx that counts against the customer's own network
  (above), so link and subject search stay client-side over the rows in hand — the newest 100 posts, and pages, tags
  and authors to 100 each — as Stories 5.3 and 5.13 built them (DW-248).
- Not this story's: the Data group, the main feed's lifecycle and its real page size (**5.19** — the canvas keeps the
  dataset's `posts_per_page` of 12 for both sources); the gated-body indicator and `access` (**5.20**, DW-128); Portal's
  button and the announcement strip, drawn from the stored snapshot (**5.21**); the dashboard card's linked-site badge
  (**13.5**); real member counts (**DW-247**); Ghost(Pro) (**DW-249**, no site until the T4 trial).
- Never edit the pilots (AD-35) or the design export (R-74), never write `sites` or `projects` from the editor, and add
  no keyboard shortcut (FR-D11: the source and the subject are set-and-forget context).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Unlinked project | `linked_site_id` null | today's editor exactly: pill "Sample content", dashed, not pressable on Home; no SOURCE group; **zero** Content API requests | N/A |
| Linked and readable | site connected, key present, `https:` | the first paint waits (skeleton) for its reads, then shows the site's content; pill solid + mint "Previewing with: {site}"; SOURCE: {site} ✓ · Sample content | a failed read → the failure rows |
| Linked, disconnected | `disconnected_at` set (Story 3.5 nulls the key and keeps the link) | sample; the pill is pressable; SOURCE shows {site} **greyed with its reason** and Sample content ✓ | no read is attempted |
| Linked, no Content API key | `content_key` null | as above, its own reason | no read |
| Linked, plain `http:` | `isPlainHttp(url)` | as above, its own reason | no read — mixed content, and the CSP admits no `http:` |
| Choose Sample content | SOURCE row | repaint at once from the bundled data; pill dashed; announced politely | N/A |
| Choose the site | SOURCE row | row busy until the reads land, then the paint; announced politely | a failed read → the failure rows |
| Fresh key | read < 60 s ago | served from memory; **no request** | N/A |
| Stale key | read ≥ 60 s ago, asked again | served at once; **one** background revalidation; shown at the next paint | a failure is counted; what is on screen stays |
| Two consumers, one key | canvas + a picker card | **one** request, both answered | N/A |
| One failed read | network error, or no answer in 5 s | **silent**: the render that needed it is sample throughout; pill "Sample content · {site} not answering"; no announcement | the next trigger tries again |
| Repeated failure | 3 failed reads in a row (network, timeout, 5xx, other ≥ 400 except 401/403/429) | reading **stops**; the next paint is sample; the pill names the cause; the full sentence announced once, politely | no automatic retry; choosing the site tries once |
| Key refused | 401 or 403 | stops at once and names it | **exactly one request** — never retried |
| Too many requests | 429 | stops at once and names it | never retried automatically |
| Ceiling | the session's reads reach `REQUEST_CEILING` | stops; the next paint is sample; names it | a reload starts a new session |
| Zero items | a list answers `[]` | main feed: its own declared empty state (A17 #1's `data-else`); `{{#get}}`: `[]`; panel caption; **never back-filled** | not a failure |
| Fewer than asked | total < the section's limit | what exists, and the panel caption | N/A |
| The note's button (R-194) | a list not full while the site's content shows — a brand-new site's one post | the note carries **Preview with sample content**; one press is the pill's Sample content row: the whole editor repaints from the sample, focus lands on the pill, announced politely | absent while sample is showing or no site is linked; live in a session reading along (R-192) |
| Subject gone | a `source: 'site'` subject whose `filter=slug:` read answers `[]` | the starting subject, and 5.13's `GONE` sentence; the stored value is kept | never a read by slug, whose 404 Ghost would count against the network; a slug not in Ghost's shape is never sent |
| Subject from the other source | an unmarked (sample) subject while the site shows, or a site subject while sample shows — by choice or after a failure | that source's own starting subject, **silently**; the choice is kept and comes back with its source | N/A |
| Site has no tags (authors) | the list is empty | that page previews the sample's tag (author) with sample content and its menu says why | N/A |
| Page 2 | the live list's `meta.pagination.pages` ≥ 2 | offered and read; otherwise absent (R-176) | past the last page the API answers **200 `[]`** (executed), so the offer is decided by the count alone |
| A body arrives anyway | a future Ghost ignores `formats` | dropped by the whitelist; the recorder and the walk flag it | N/A |

</frozen-after-approval>

## Code Map

**Read in Ghost's source (npm tarballs, 5.130.6 and 6.58.0, 2026-09-24) and executed read-only on T1 and T3 at this
Create — every fact below is a hypothesis the first task RECORDS (standing rule 1, AD-23).**

- **CORS is open on every Content API route.** `core/server/web/api/endpoints/content/routes.js:14` —
  `router.use(cors({maxAge: config.get('caching:cors:maxAge')}))`, the `cors` package's default origin `*`, before
  any route; §38b recorded it on `/settings/`. Executed at Create with `Origin: https://app.inflozo.com`:
  `access-control-allow-origin: *` on `posts/` (with `include`, `fields`, `filter`), `pages/`, `tags/`, `authors/` and
  on the **401**, both majors.
- **Ghost limits failed requests, not keys.** `core/server/web/api/endpoints/content/middleware.js` —
  `authenticatePublic` starts with `shared.middleware.brute.contentApiKey`; `core/server/web/shared/middleware/brute.js:90-103`
  resets the count on any response `< 400`; `core/server/web/shared/middleware/api/spam-prevention.js:541-560` is an
  in-memory `express-brute` keyed by IP; `core/shared/config/defaults.json` `spam.content_api_key` =
  `freeRetries 99, minWait 3600000, lifetime 3600` — identical on both majors. So a valid key
  is **never** limited by Ghost itself, and 100 failed requests in a row from one network earn **429 "Too many
  attempts." for every key from that network for at least an hour** — the brute check runs before authentication. The
  PRD's *"because Ghost rate-limits Content API keys"* (FR-H4, `review-st-external-claims.md:211`'s unexecuted F11) is
  therefore half right; the recorder corrects the sentence.
- **No HTTP caching to lean on.** `core/server/web/api/endpoints/content/app.js` sets `Cache-Control: public` with
  `caching.contentAPI.maxAge` = 0; executed: `public, max-age=0` on both majors. The 60 s cache lives in the editor.
- **`formats=mobiledoc` is "no body".** Under `core/server/api/endpoints/utils/serializers/`:
  `input/posts.js:28-33` (`removeSourceFormats`) strips `mobiledoc`/`lexical` from the Content API's `formats`, leaving
  `[]`; `output/mappers/posts.js:64` computes `extraAttrs.forPost` — `reading_time` from `html` and `excerpt`
  (`output/utils/extra-attrs.js:24-75`) — **before** `:66-72` strip every format not in
  `formats || columns || ['html']`, and `[]` is truthy. Executed on 33 posts per
  major: no `html`, no `plaintext`, `reading_time` and `excerpt` present and identical to a plain read, **38,688 bytes
  against 49,343**; the same on `pages/` and on a read by slug. **`fields=` is not an alternative:** it drops
  `reading_time` (computed only when `html` is present — executed, and `extra-attrs.js:66-75`), and a17/1 and a24/1
  both print it (`data-t="post.reading_time minutes=reading_time"`).
- **Also executed:** `filter=tag:<slug>` + `page=2` past the last page answers **200 `[]`** with
  `meta.pagination.pages: 1`; `tags/?order=count.posts desc&include=count.posts` works on both; `limit=all` is 100 on
  Ghost 6 (§15d); `/settings/` carries `timezone`, `locale`, `navigation`, `members_enabled` — and
  `codeinjection_head/foot`.
- **The key is public by Ghost's design.** `core/frontend/helpers/ghost_head.js` prints the internal frontend
  integration's Content API key as `data-key` on the Sodo Search script (`getSearchHelper`, `frontend/services/proxy.js`
  `getFrontendKey`) — not recorded on a live page yet.
- **Ghost cannot tell Inflozo a site is private.** `core/shared/settings-cache/public.js` (48 keys on 5, 60 on 6)
  carries no `is_private` — so DW-192 cannot close here (amended at this Create).

**The owner's data, read-only on production (2026-09-24).** **Ghost 5 Project** (`99d4d277-…`) links no site; its Home
is a22/1 · a17/1 (`isMainFeed`) · a22/1, its page 2 (`index`) a17/1 · a22/1, its site doc a1/1, and its Post subject is
the style-guide fixture's own slug. **Ghost 6 Project** (`21d868cf-…`) links `ghost6.inflozo.com`, which is
**disconnected** with no key — the greyed row, for real. `ghost5.inflozo.com` (`9d473e0f-…`) is connected with a
key: 33 posts (the newest, "PROBE Gated Post", is paid and has no picture; every reading time is 0), 2 pages, tags
Craft 9 · Field Notes 8 · Tooling 7 · Systems 6 · Archive 5 · Interviews 5, writers Umang 12 · Priya Raman 11 ·
Tom Whitlock 10, title "Ghost5", time zone `Etc/UTC`.

**Server truth — `EditorData` gains the linked site.**

- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts:56-63` — `projectOf` selects
  `id, name, dark_enabled, revision`; add `linked_site_id`. `:77-136` `EditorData`; `:138-164` the parallel reads
  (the site's row joins them, through `supabaseServer()`, RLS-scoped); `:292` `links: linkResources()`; `:294`
  `timezone: orbitWeekly.site().timezone` *("until 5.18 reads the connected site's")*.
- `supabase/migrations/20260904120000_complete_schema.sql:145-172` — `sites`: `url` :148 (the normalised admin
  origin — on Ghost(Pro) the API is the `*.ghost.io` admin domain, `EXPERIENCE.md:113`), `title`, `content_key` :154
  (*"browser-safe by Ghost's design; delivered to the client"*), `credentials_present` :155, `disconnected_at` :169;
  `projects.linked_site_id` :229; `grant select … to authenticated` :1041-1042; owner RLS :814-828.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts:294-300` writes `content_key` at connect (`:296`); `:307`
  re-adopts a disconnected row in place (FR-C6); `:985-987` disconnect keeps `linked_site_id`, `:1090-1096` nulls the
  key; `:905-914` "Use your brand" is the only writer of `linked_site_id`.
- `…/(editor)/actions.ts:52` — `setPreviewSubject` writes `{ kind, slug }` and does not check the slug against any
  source (`:29-30`), so a live slug saves as it is; `read.ts:268-279` reads the stored subjects back, shape-checked.
- `apps/web/app/(app)/app/(authed)/sites/content-check.ts:28-47` — **the fetch to copy**: `Accept-Version: v5.0`,
  `AbortSignal.timeout`, never throws. `apps/web/lib/connect-rule.ts` — `isPlainHttp`, `normaliseSiteUrl` (:55).
- `apps/web/app/(app)/app/harness/editor/page.tsx:92-123` — the keyboard harness's typed `EditorData` literal; it
  gains `site: null`, which keeps it on the unlinked path.

**The bundled path — one assembly, shared (`@inflozo/library`, pure).**

- `packages/library/src/orbit-weekly.ts:276-307` — `templateContext(target, feed, of?)`: `@site` + `@config` (:281),
  the post/page row spread flat (:283-289), a list's taxonomy, `posts` and `pagination` (:294-306), the page's own
  address (`addressOf` :219, `paginationOver` :90-95). **Extract the assembly** so the live path hands it the same
  pieces and cannot drift. `:226-246` `listOf`; `:251-254` `feedPages`; `:198-205` `resolveSubject`, `:162-168`
  `subjectExists` and `:173-184` `postOf`/`subjectRow` read `dataset` directly; `:154-158` `fixtureSubject` (the
  archive fixtures are Orbit Weekly's slugs — R-193 decides a live archive's); `:444-454` `resolveSource`; `:323`
  `DEFAULT_LIMIT`.
- `packages/library/orbit-weekly/dataset.json` — `site`'s keys are exactly what the canvas reads of `@site`:
  `accent_color allow_self_signup comments_enabled cover_image description icon locale logo members_enabled navigation
  paid_members_enabled secondary_navigation timezone title url` — the live whitelist. Its fixture post's `url` path is
  in no navigation item, so DW-230's address changes no snapshot.
- `packages/library/src/orbit-weekly.test.ts:396-416, :632-642` — the control: a call with no subject answers
  exactly as before. `tools/check-snapshots.mjs:78-83` (its `input()`), `:464-474` (A17's empty arm), `:478-494`
  (A4 #13's empty `{{#get}}`).

**The render door and the editor.**

- `apps/web/lib/canvas.ts:65-119` — `renderSection`: `templateContext` at `:98`, `currentUrl` override `:99`,
  `getRows: shownRows(...)` `:100-118`. `:54-62` `shownRows` (the `DesignRows` contract: each binding's rows in both
  orders at the Count's ceiling, sliced by the stored Count and Order). `:36-37` `withImages` rewrites only the
  sample's origin — live picture URLs pass through (CSP `img-src … https:`, `csp.ts:83`).
- `…/(editor)/editor.tsx` — `:421-431` `source = useMemo(bundledSource)`, `previewing = resolveSubject(…)`,
  `offersPageTwo`, `subjectRows`; `:636-638` `latest` (it holds no content today); `:1360-1383` `chooseSubject`;
  `:1481-1562` `paint()` — the early returns `:1487`/`:1491` (the first-paint gate joins them), `:1516-1519` the page's
  address from `templateContext`, `:1532` `renderSection`; `:3056-3062` `<SourcePill>`; `:3066`
  `<InlineTools resources={links}>`; `:3141-3155` `<DesignPicker rows>`; `:3179-3180` `<Sidebar timezone links>`;
  `:3374-3399` `<SectionPicker rows>`.
- `apps/web/lib/preview-subject.ts` — `:28` `SOURCE_WORDS`; `:55-63` `SubjectSource` (**no `pages`** — the Page canvas
  lists only its fixture, `:101-103`); `:66-71` `bundledSource`; `:105-118` `subjectOptions`; `:121-124`
  `filterSubjects`; `:135-136` `GONE`; `:139-140` `SUBJECT_SAID`.
- `apps/web/components/editor/source-pill.tsx` — props `:42-59`; the words `:69-82`; the dashed skin `:87-88`; the
  non-pressable Home variant `:92-102`; the menu `:132-232` and its *"R-118: NO SOURCE GROUP"* comment `:157-158`.
  `--color-mint` exists (`apps/web/app/globals.css:64`).
- `apps/web/components/editor/section-preview.tsx:124-156` — the card's paint (`renderSection` `:133-142`) and its
  repaint deps `:161`; cards paint from the parent window, so the shared cache lives in the editor.
  `components/editor/design-picker.tsx:78-87, :190` — the ring's tiles, the same.
- `apps/web/lib/page-two.ts:74-81` — `noPageTwo`, whose `:80` asks `orbitWeekly.feedPages`; `:84-89` `pageInForce`.
- `apps/web/components/controls/link-picker.tsx:180-185` — `LinkPanel`'s title search over the rows in hand; `:233`
  stores `{ href: r.url, ref: { kind, id } }`; `:57-79` `describe()`. `apps/web/lib/controls-review.ts:97-113` —
  `LinkResource` and `linkResources()` (`pages: []`); `:118-128` `queryRows`; `apps/web/lib/pilots.ts:81-90`
  `pilotRows`.
- `apps/web/components/controls/sidebar.tsx:301` — *"Site time zone: {timezone}"*; `:385-408` R-124's visitor caption
  at the head of Section Settings — **the shortfall caption joins it there**; `sourceRows` feeds the read-only Ghost
  list.
- `packages/ghost-shim/src/index.ts:150-190` — `formatDate` formats in UTC, and `:158-161` states the condition
  (both recording sites are `Etc/UTC`) — DW-98. `:596-604` — `{{total_members}}` on a site with a `url` refuses
  without counts (DW-247; no design binds it).
- `packages/section-runtime/src/core.ts:665-667` — `data-if` over an empty list takes its `data-else` arm, which is
  how A17 #1's empty state and any secondary feed's "nothing at all" are authored; `:1666-1713` `expandRepeats`.
- `apps/web/csp.ts:35, :84` — `connect-src 'self' https:` already admits any https Ghost; nothing to change.

**The frames.**

- `B Missing Surfaces.dc.html:1391-1421` — **B9**: *Connected* — white, **1px solid `#E7E2DB`**, 6px **mint**
  `#1FA97A` dot, "Previewing with:" + the site's name at 600, caption *"Real posts, real authors, real tags. What you
  see is what a reader sees."*; *Not connected yet* — dashed, grey dot, "Sample content". Note `:1420`: *"solid
  hairline with a mint dot when the content is real, dashed with grey when it is sample"*; `:1456`: *"the source pill
  is a border style"*. **No fallback state is drawn anywhere in the export.** `:1351-1388` B6's dot-and-word states
  are the nearest status precedent.
- `D5 Canvas Markers and Template Switcher.dc.html:199-212` — **D5e's SOURCE group**: the site row (mint dot, name only,
  ticked, `#FFEDE8`), then "Sample content" (grey dot); no search in that group; a rule; then SUBJECT (`:214-258`).
- `S4 Editor.dc.html` — **S4a** draws no pill; the pill's place is 5.13's (R-166, the canvas foot).
- `P0 Editor Primitives - Spec.md:483-494` — at zero a secondary feed renders nothing and *"the editor shows the zero
  state as a note … not as an empty band on canvas"* (`:488-490`) — which is why the shortfall is a panel caption.
  `A4 Heroes - Spec.md:661` — 13 Latest Post is a **hero**: at zero its card column closes and its words stay.

**The harnesses.**

- `tools/probe/run-verify-editor.cjs` — step 89 (`:3957`, `:4070-4074`) asserts Pilot sections' pill says
  `SOURCE_WORDS.sample` and that searching fetches nothing; that project links no site, so it stays green and is a
  control. **Known-flaky** (DW-222, DW-220): record every run.
- `tools/probe/run-verify-lock.cjs:1-60` — the pattern for a deployed walk with its own throwaway account, deleted in a
  `finally`, and expectations read from the app's own modules (Node 24).

## Tasks & Acceptance

**Execution:**

- [x] `tools/probe/record-content-api.py` -- **FIRST, before any code.** Read-only on T1 and T3 (keys by variable name
  only: `GHOST5_*`, `GHOST6_*`): CORS on `posts/` `pages/` `tags/` `authors/` `settings/` for 200 and 401, and the
  preflight with `accept-version`; `Cache-Control`; `formats=mobiledoc` against a plain read on every post (no
  body, identical `reading_time` and `excerpt`, bytes); `fields=` dropping `reading_time`; past-the-last-page `200 []`;
  `order=count.posts desc`. **LAST, on T1 only:** 100 bad-key reads, then a valid-key read, recording the 429, its body,
  whether it carries `access-control-allow-origin`, and the time — T1's Content API then refuses this machine for
  about an hour, and the script says so. Record as `MEASUREMENTS.md` §51. -- the whole design rests on these facts and
  Ghost(Pro) aside, every one is executable today.
- [x] `packages/library/src/orbit-weekly.ts` -- export the ONE assembly `templateContext` uses (`@site`, `@config`, an
  entry spread flat, a list's taxonomy + `posts` + `pagination`, the page's own address) and have `templateContext`
  call it, byte-identical; give `resolveSubject` and `feedPages` the source as an argument that defaults to the
  bundled one; hand Post and Page the subject's own address and 404 one that matches no link (**DW-230**). Extend
  `orbit-weekly.test.ts` with DW-230's rows; its existing control must stay green unedited. -- one assembly for two
  sources is what keeps the canvas and the bundled path from drifting.
- [x] `apps/web/lib/live-content.ts` -- new, pure and importless but for types (`node --test` reaches it, as
  `lib/lock.ts`): the query for every read a paint needs (a list page, a taxonomy, a subject by `filter=slug:` — a
  browse, so a missing one is `200 []` and never a 404 — `/settings/`, each `{{#get}}` binding at the Count's ceiling
  in the order asked, hand-picked `ids` as ONE `filter=id:[…]` read re-ordered by the pick, R-20), its cache key,
  freshness (`FRESH_MS`), the outcome of a status, the stop rule
  (`FAILURES_TO_STOP`, `REQUEST_CEILING`), the whitelist mapping to the dataset's row shapes (taking the
  HTML-to-words function as an argument), the site's wall-clock date for a timestamp (`Intl`, **DW-98**), the
  shortfall caption, R-193's starting archive subject (the most `count.posts`, a tie to the name first in the
  alphabet), and every string in *Design Notes*. -- the matrix is the
  contract, and a pure module makes it a unit test rather than a browser observation.
- [x] `apps/web/lib/live-client.ts` -- new: the I/O — one store per editor session over `{ origin, key }`: `fetch` with
  `Accept-Version: v5.0` and `AbortSignal.timeout(READ_TIMEOUT_MS)`, the `Map` cache, one in-flight promise per key,
  the request count, the stopped state and its cause; never throws, never logs a URL (the key rides in it), never logs
  a response body (`/settings/` carries `codeinjection_*`). -- one file owns every request, so the policy cannot drift
  across callers.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` -- `projectOf` selects `linked_site_id`;
  `EditorData.site` is the linked site as server truth — `{ title, origin, key }`, or `{ title, unreadable:
  'disconnected' | 'no_key' | 'http' }`, or `null` — read through the user's own session; a failed read is logged by
  code and answered `null` (sample), the safe side the prefs read takes. The stored subjects keep their `source`
  mark. Add `site: null` to the harness literal. -- the editor must not guess whether it may read, and a key the server
  holds is delivered, never asked for.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts` -- `setPreviewSubject` stores `source: 'site'`
  with a subject chosen over the site and nothing extra for a sample one. -- a subject is only "gone" from the source it
  was chosen from.
- [x] `apps/web/lib/canvas.ts` -- `renderSection` takes an optional live content argument (the assembled context and
  the bindings' rows); absent, it is exactly today's call. -- the control stays a one-argument difference.
- [x] `apps/web/lib/preview-subject.ts` -- `SubjectSource` gains `pages`; a live source in the same shape; the D5e
  line for a list capped at 100; `SOURCE_WORDS` gains the site and the causes. -- 5.13's seam, widened by what it lacked.
- [x] `apps/web/lib/page-two.ts` -- `noPageTwo` / `pageInForce` read the page count of the list the canvas renders
  from the source in force. -- R-176 must answer from the site's own posts.
- [x] `apps/web/components/editor/source-pill.tsx` -- B9's connected look; D5e's SOURCE group above SUBJECT whenever a
  site is linked (on Home too, which becomes pressable then and only then); the greyed row with its reason for an
  unreadable site through the Kit's `greyedProps` (`kit/greyed.ts:13-28`, which refuses a greyed control with no
  reason); the cause segment; R-98's busy row; the capped-list line. The button's name stays its own words (no
  `aria-label`, WCAG 2.5.3, as 5.13 built it). -- the pill is the story's one surface.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- the source in session state beside
  `viewAs`, mirrored in `latest`; one live store per session; the first-paint gate beside the hydrate's; the reads
  each trigger asks for; `paint()` and the page address through the live content; the live rows, subject rows, link
  resources and time zone handed to the pill, the pickers and the panel, and the ONE source switch handed to both the
  pill and the panel's note (R-194); the source announced through `#editor-said` (polite). -- every surface paints
  through the one door, so the source changes in one place.
- [x] `apps/web/components/editor/section-preview.tsx` + `design-picker.tsx` -- paint with the canvas's live content and
  the live rows, repainting when those rows arrive. -- FR-H4 names the picker's previews as a consumer of the same reads.
- [x] `apps/web/components/controls/sidebar.tsx` -- the shortfall caption at the head of Section Settings beside R-124's,
  and — while the site's content is showing — its **Preview with sample content** button (R-194), which calls the
  handler the pill's Sample content row calls (one action, two doors, handed in by `editor.tsx`) and moves focus to
  the pill; drawn OUTSIDE the `ReadOnly` rows (`:436` wraps R-124's), because switching the source changes the view,
  not the site (R-192). The time zone shown is the source's. -- P0:488-490 puts the zero note in the panel, not on
  the canvas, and R-194 puts the full page one press from it.
- [x] `apps/web/components/controls/link-picker.tsx` -- the capped-list line under the search when the site holds more
  posts than the rows in hand; nothing else changes — its resources come from the source. -- the one honest limit of
  a client-side search (DW-248).
- [x] `apps/web/live-content.test.ts` -- new: every matrix row over `lib/live-content.ts` — the key, freshness, the
  outcomes and the stop rule (a 401 is one request; three failures stop; a 429 stops), the ceiling, the whitelist (no
  `html`, `plaintext`, `codeinjection_*` or key ever in a row), the caption reduced to words, a date across a DST
  boundary, every shortfall sentence, R-193's starting subject and its tie, the subject-source rule, and every
  string equal to the *Design Notes* table. -- the matrix is the contract.
- [x] `tools/probe/run-verify-live-content.cjs` -- new: the deployed walk on `app.inflozo.com`, its own throwaway account
  with site rows for T1 and T3 (keys from the environment, never printed) and projects linked to them. Walks every
  matrix row with a screen, on **both majors**; counts requests to the Ghost origins (one per key, none inside 60 s);
  asserts no Ghost response it saw carried `html`, and that neither the key nor `codeinjection` appears in the canvas
  markup; a real 401 (a site row with a wrong key — one request); the network cut with `page.route` (the one simulated
  condition, named as such); and **a real 429 from T1, last**, earned the way the recorder earns it. Reads its
  expectations from `lib/live-content.ts`. -- R-82: the canvas is proven against real Ghosts, not a stub.
- [x] `tools/doc-audit.py` -- catalogue rows for the two new probe files, then `--generate`. -- the gate refuses an
  uncatalogued file under `tools/`.
- [x] `…/prds/prd-Inflozo-2026-08-17/prd.md` (FR-H4) + `…/planning-artifacts/epics.md` (5.18's criterion) +
  `epic-5-context.md` (the live-content bullet) + `…/architecture-Inflozo-2026-08-19/VERIFY-AT-BUILD.md` -- replace
  *"because Ghost rate-limits Content API keys"* with what §51 recorded (failed requests per network, and an edge in
  front of Ghost), and add the Content API from a browser to the Ghost(Pro) trial's checklist (CORS on a 429, the
  edge's limits, admin vs public domain). -- standing rule 3: a finding reaches the documents that state the old claim.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- close **DW-230** and **DW-98** with their
  resolutions. **Already done at this Create:** DW-247, DW-248, DW-249 appended; DW-192 amended.

**Acceptance Criteria:**

- Given a project linked to a connected site with a Content API key, when I open any canvas, then it shows the site's
  own posts, pages, tags, authors and `@site` (name, logo, navigation, members settings) — read by the browser straight
  from the site — and the pill reads "Previewing with: {site}" **and matches frame B9**'s connected state at R-166's
  24px, with its menu **matching D5e**.
- Given that pill, when I choose Sample content or the site, then the canvas repaints from that source, the choice is
  announced politely, and nothing is stored, journalled or undoable — and a session reading along can still switch it.
- Given the Post, Page, Tag or Author canvas, when I open the pill, then D5e's SUBJECT rows are the site's own — the
  style-guide entry first on Post and Page — with dates, "has image" and post counts; choosing one renders it and is
  stored per canvas as 5.13 stores it; and the article body is still the style-guide fixture.
- Given the Link Picker, when I search, then it finds the site's own pages, posts, tags and authors, and a choice
  stores the site's own URL.
- Given the Section Picker or the Design ring is open, when its cards paint, then they paint with the canvas's
  content, and each key has been requested **once** across the canvas, the cards, D5e and the Link Picker.
- Given content read in the last 60 s, when a canvas, subject, page or picker asks for it again, then no request is
  made; and after 60 s it is shown at once and revalidated once in the background, without repainting by itself.
- Given the site stops answering, refuses the key, answers 429, fails three times running, or the ceiling is reached,
  when the canvas next paints, then it paints sample content and the pill says why — one failure silently, the others
  named and announced — and a refused key has cost exactly one request.
- Given any live read, when its answer is mapped, then no `html` or `plaintext` field reaches a row,
  `codeinjection_*` is never stored, rendered or logged, and neither the Content API key nor `codeinjection` appears
  in the canvas's markup.
- Given a section whose list has fewer items than it can show, or none, when it renders, then it shows what exists —
  the main feed's own empty state at zero, never back-filled — and its panel says so; and a list the user typed still
  renders nothing at zero.
- Given a site whose time zone is not UTC, when a post's date is on the canvas, then it is the date the site prints
  (DW-98); and given the Post, Page or 404 canvas, when its header renders, then it marks what Ghost marks there
  (DW-230).
- Given a subject chosen over one source, when the other source is showing, then that source's starting subject
  renders without the "no longer there" sentence, and the choice returns with its source.
- Given a section whose list is not full while the site's content shows, when I press **Preview with sample content**
  in its note, then the whole editor shows the sample publication, the pill reads "Sample content" and holds the
  focus, and choosing the site in the pill brings mine back; and while sample content shows, the note carries no such
  button (R-194).
- Given I choose the site in the SOURCE group, or a subject whose content must be read, when the read is in flight,
  then the row says it is loading and is `aria-busy` and `aria-disabled` — never `disabled` — until the paint lands
  (R-98).
- Given an unlinked project, when anything in this story's code runs, then the editor, `/pilots`, the snapshots, the
  render matrix and the keyboard gate are unchanged — the control.

## Spec Change Log

## Design Notes

**Why `formats=mobiledoc`, and what makes it safe to rely on.** It is not a documented contract: it is the Content
API's own input rule (strip the source formats) meeting its output rule (keep only the formats asked for, where an
emptied list is still a list). Read in source and executed on both majors, it gives every metadata field Ghost
computes — `reading_time` and `excerpt` included — with no body on the wire. `fields=` gives no body either but loses
`reading_time`, which two of the five shipped designs print. The floor under the quirk is the whitelist: a future
Ghost that ignores `formats` costs bytes, never a body on the canvas, and the recorder and the deployed walk both say
so the day it happens.

**The failure policy follows Ghost's own limiter.** Ghost never limits a key that works; it limits a network that
fails, after 99 failures, for an hour, and it checks before it authenticates — so a runaway retry would lock the
customer out of their own site's search from their own office. Hence "never retry a refusal", "three strikes" and a
ceiling. `REQUEST_CEILING` is **500** per editor session and `READ_TIMEOUT_MS` is **5,000** — Ghost's own per-`{{#get}}`
budget (`appendix-b1-template-contexts.md` §5). Both tune, like §AD4's lock timings; the comparisons do not. The
deployed walk records how many reads a full walk costs, which is the evidence the ceiling is generous.

**The one bound wider than "three" (review, 2026-09-24).** Until the site has answered once in a session, reads go one
at a time — which is how a refused key costs exactly one request and a site that never answers costs three. Once it has
answered, up to `WIDTH` (6) reads are in flight together, so a key rotated or a site gone down *mid-session* can fail
every one of them before the first failure is counted: that case costs up to `WIDTH` requests against Ghost's budget of
99, and nothing in flight is ever retried; while the run of failures stands, no new read joins them. `live-content.test.ts`
pins the bound. The alternative — one read at a time for the whole session — would make every first paint a chain of
round trips, and the walk's 53 requests for a whole walk shows the budget is not the pressure.

**Tiers.** FR-H4 splits a *network failure* (silent, a subtle indicator) from *429 or repeated failure* (named). The
subtle indicator is the pill's own truth — "Sample content" in B9's dashed look — plus a short cause in words; the
named tier adds the full sentence, announced once. A 401/403 and the ceiling are named at once: waiting for three
strikes would spend requests Ghost counts against the customer.

**What SWR means here.** Reads are triggered by what the customer does — opening the editor, a canvas, a subject,
page 2, a source, a picker — never by a paint; an edit's repaint reads nothing. Fresh keys cost nothing; a stale key
is shown and revalidated once; a revalidation never paints.

**Dates (DW-98).** Ghost prints a date in the site's time zone and the shim formats in UTC (`ghost-shim`:158-161).
The mapping hands the shim each live timestamp already moved to the site's wall clock — `Intl` in `apps/web`, which
AD-1 allows outside the core packages — so the shim and every design need no change and print what Ghost prints,
`datetime` attributes included (Ghost formats those in the site's zone too). The one token that cannot follow is
`Z`, which keeps printing `+00:00`; no design uses it, and the note sits beside the code. The sample's zone is
`Etc/UTC`, so the sample moves by nothing.

**The words. These are the strings** (R-170: one name, the site's Ghost title, `{site}` below).

| Where | What it says |
|---|---|
| Pill, the site's content | mint dot · **"Previewing with:"** · **{site}** — solid hairline — then ` · {subject}` as 5.13 |
| Pill, sample | grey dot · **"Previewing with:"** · **Sample content** — dashed — then ` · {subject}` |
| Pill, sample after a failure | as sample, then ` · ` one of: **{site} not answering** · **key refused** · **{site} asked us to wait** · **paused for this session** |
| SOURCE group | **SOURCE** · {site} (mint dot) · **Sample content** (grey dot) — the row in force highlighted (R-172) |
| Site row, one failure | *"{site} didn't answer, so this page is showing sample content. Choose {site} to try again."* |
| Site row, three failures | *"{site} hasn't answered three times in a row, so Inflozo has stopped asking for now and this page is showing sample content. Choose {site} to try again."* |
| Site row, key refused | *"{site} doesn't recognise the Content API key Inflozo has for it, so this page is showing sample content. Update the key in Sites, under Manage keys."* |
| Site row, 429 | *"{site} is turning requests away because it has had too many, so this page is showing sample content. This usually clears within an hour; choose {site} to try again."* |
| Site row, ceiling | *"Inflozo has asked {site} for content {n} times since you opened this project and has stopped, so it never floods your site. Reload the page to start again; until then this page is showing sample content."* |
| Site row, greyed — disconnected | *"Inflozo is no longer connected to {site}. Reconnect it from Sites to preview with its content."* |
| Site row, greyed — no key | *"Inflozo has no Content API key for {site}. Add one in Sites, under Manage keys."* |
| Site row, greyed — `http:` | *"{site}'s address starts with http://, and a browser won't read it from Inflozo's secure page."* |
| A page with nothing of the site's | *"{site} has no tags yet, so this page is previewing a sample tag."* (authors: *"…no authors yet, so this page is previewing a sample author."*) |
| D5e and the Link Picker, capped | *"Showing your newest 100 posts."* · the Link Picker adds *"Paste an older post's address to link it."* |
| `#editor-said` (polite) | *"Previewing with {site}."* · *"Previewing with sample content."* · the named sentences above, once each |
| Panel — a `{{#get}}` list short | *"This site has {n} {posts} for this section; it shows up to {m}."* |
| Panel — a `{{#get}}` list empty | *"This site has no {posts} for this section yet."* |
| Panel — the main feed short (one page, not full) | *"This {site/tag/author} has {n} posts; this section shows up to {m} per page."* |
| Panel — the main feed empty | *"This {site/tag/author} has no posts yet, so this section shows its empty state."* |
| Panel — the note's button (R-194) | **Preview with sample content** — under any of the four notes above, only while the site's content is showing |

`{posts}` is the binding's own resource (`posts`, `tags`, `authors`), singular at 1; `{m}` is the limit the section
asked for. The main-feed caption appears only when the whole list fits one page and does not fill it — a page 2
with fewer posts is ordinary pagination, not a shortfall.

**Routine calls, each stated here rather than asked.** The source is session state, defaulting to the site when it
is readable (FR-C4: connecting *"switches the canvas to live content"*). Reads go to `sites.url`, the admin origin the
key was verified against. `@site` is read live from `/settings/`, because NFR-3 (PRD:481) lists it among the canvas's
reads — the snapshot stays the source of the two Ghost-surface shims, which are 5.21's. The shortfall lives in the
panel because P0:488-490 says so for zero and no frame draws the rest; it is editor-only by construction. The fallback
look and the greyed row are R-74 extrapolations from B9, B6 and UX-DR3's *"could-but-not-now greyed with a caption"*.
The spec runs well past the template's token target and is kept whole: one goal, one read layer shared by five
consumers, which splitting would break.

**Calls made at Dev (2026-09-24), each routine and stated here rather than asked.** A `{{#get}}` is read at the Count's
ceiling in BOTH date orders, not only the order asked: that is `DesignRows`' own contract, so a Count or an Order
changed later is a slice of rows in hand and an edit's repaint still reads nothing. The tag and writer lists are read
`order=count.posts desc`, so D5e lists the fullest first and the same read answers R-193. After a failure the pill reads
*"Sample content · {cause} · {subject}"* — the cause beside the source it explains. The panel's note appears only while
the site's content shows: its sentences describe the site, and the unlinked editor stays today's. A refused key and the
ceiling GREY the site row with their sentence, because choosing it could do nothing (a refusal is never retried; a
reload starts over). A new page — another canvas, or page 2 — whose reads are in flight is taken off the canvas behind
the Kit's skeleton rather than left under a stack it no longer matches. A subject chosen over the site whose read did
not answer is never announced as chosen, since the sample's own subject is what shows (FR-H4's silent tier). **One
known limit, by the rule that an edit reads nothing:** a design placed before its own rows have been read — an Add
pressed faster than the picker's reads — paints that page as sample content until the next read the customer asks
for (a canvas, a subject, page 2, a source, a picker).

**What the owner's test will show that is not this story's.** Every card on his test site says *"0 min read"* —
those posts are one line long and Ghost prints the same on the live site (DW-156, A17's). The newest post, "PROBE
Gated Post", is for paid members; how a members-only post is marked on the canvas is Story 5.20's (DW-128).

## Verification

**Commands** (Node 24, the repo's `engines.node`; keys only by variable name):

- `env $(grep -E '^GHOST[56]_(URL|CONTENT_API_KEY)=' tools/probe/.env | xargs) python3 tools/probe/record-content-api.py`
  -- expected: every fact in the Code Map holds on both majors with its control, and the 429 is recorded LAST on T1
  with whether it carries `access-control-allow-origin`; written to `MEASUREMENTS.md` §51.
- `pnpm check` -- expected: exit 0; `apps/web` including the new `live-content.test.ts`; `orbit-weekly.test.ts`'s
  control unedited and green; `busy.test.ts` green; `tools/check-snapshots.mjs` (run by `pnpm test`) unchanged — no
  live argument reaches it.
- `bash tools/matrix/run-matrix-gate.sh` -- expected: no baseline moves (its `cases.mjs` takes `shownRows` and
  `pilotRows`, whose sample answers are unchanged).
- `pnpm keyboard` -- expected: green, the harness on the unlinked path.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0 (no SQL changes).
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID|GHOST5_URL|GHOST5_CONTENT_API_KEY|GHOST6_URL|GHOST6_CONTENT_API_KEY)=' tools/probe/.env | xargs) node tools/probe/run-verify-live-content.cjs`
  -- expected: 0 FAIL on `app.inflozo.com` at HEAD, on both majors, fixture account deleted (user count unchanged),
  the request count of a full walk recorded.
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID)=' tools/probe/.env | xargs) node tools/probe/run-verify-editor.cjs`
  -- expected: 0 FAIL, step 89 among the passes (Pilot sections, unlinked — the control); every run recorded.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.

**Manual checks:**

- The CSP needs no change: `connect-src 'self' https:` (`csp.ts:35`) and zero `securitypolicyviolation` events in the
  deployed walk's session.
- **Deploy** links **Ghost 5 Project** (`99d4d277-540f-4407-b9e1-033d4c93058f`) to `ghost5.inflozo.com`
  (`9d473e0f-…`) with one `update projects set linked_site_id = … where id = … and linked_site_id is null`, read back —
  the owner's data, one row, said in the Deploy commit; the partial unique index guarantees no other project holds the
  site. Nothing else about the project changes.

### Results — Dev, 2026-09-24, on the real infrastructure (R-82)

**The Ghost test servers — T3 `ghost5.inflozo.com` (5.130.6) and T1 `ghost6.inflozo.com` (6.58.0)**, keys by name
`GHOST5_URL` · `GHOST5_CONTENT_API_KEY` · `GHOST6_URL` · `GHOST6_CONTENT_API_KEY`:

- **The recorder ran first**, before any code: every step PASS on both majors with its control (MEASUREMENTS §51).
  CORS `*` on the 200 and the 401 of all five routes and a 204 preflight allowing `accept-version`;
  `Cache-Control: public, max-age=0`; `formats=mobiledoc` carried no body on any of the 33 posts and 2 pages of either
  major, with `reading_time` and `excerpt` identical to a plain read (T3's posts 99,402 bytes against 110,057, T1's
  99,954 against 110,609); `fields=` dropped `reading_time`; a missing slug and a page past the last answered `200 []`;
  `order=count.posts desc` held; `filter=id:[…]` answered in Ghost's order. On T1, 100 reads with a key Ghost never
  issued, then the real key: **429 "Too many attempts." at 12:49:40 UTC, carrying `access-control-allow-origin: *`** —
  so neither Ask First stop fired: no body arrives, and the 429 is readable, not "not answering". New: a post and a
  page carry a `codeinjection_head`/`_foot` of their own, which the allowlist drops without naming them.
- **The deployed walk**, `MAJORS=5,6 NO_429=1`, at `ee146bbf` on `app.inflozo.com`: **0 FAIL, 84 PASS** on its first run.
  Per major: 7 requests to open the editor, 26 over 15 keys for the whole major, no key Ghost answered asked for again
  inside 60 s, no answer carrying `html` or `plaintext`, every answer carrying `access-control-allow-origin`, neither
  the key nor `codeinjection` in the canvas markup. **A full walk cost 53 Content API requests** against a ceiling of
  500 per session. A real 401 cost exactly one request and greyed the row, and pressing it anyway sent nothing. Zero
  `securitypolicyviolation`s — the CSP needed no change.
- **The same walk, `MAJORS=6`** — T1's major again, then the real 429 last: **0 FAIL, 51 PASS**. After 100 × 401 from
  this machine the editor opened in a fresh session on sample content, *"Ghost6 (row) asked us to wait"*, the sentence
  announced, **one** request. Earned at 14:22:54 UTC.
- **That hold, timed** (MEASUREMENTS §52): T1 refused the real key at every five-minute read from 14:23:10 to 15:18:17
  and answered at 15:23:18 — **an hour**, as Ghost's own config says on both majors, so FR-H4's *"for at least an hour"*
  holds. It was deliberate and it touched nothing but this machine's network's Content API reads of T1.
- **The walk once more, `MAJORS=5 NO_429=1`, at `561c44f1`** (CI run 36013973388 green,
  `dpl_9Y912RyChB1rQaSroVwQDJtj9gCj` READY) — T3 alone, T1 being held: **0 FAIL, 50 PASS**, the view row among them:
  Undo was asleep before and after the Sample-and-back round trip, and a reload after choosing Sample content reopened
  on Ghost5 — nothing journalled, nothing stored.

**Supabase** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`): each walk made its own throwaway account through the Auth admin
API (200) and signed in by `generate_link`, wrote its site rows (201) and linked its projects (200) over PostgREST. The
editor's server read of `projects.linked_site_id` and the `sites` row, through the user's own session, is what painted
the site's content for the readable rows and greyed the disconnected, keyless and `http:` ones;
`project_template_prefs.preview_subject` read back `{"kind":"post","slug":"on-typography-and-restraint","source":"site"}`.
Accounts deleted (200), users 13 before · 13 after in both runs. `bash supabase/tests/run-rls-gate.sh`: exit 0 — no SQL
changed, so no Schema phase.

**Vercel and GitHub** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `GITHUB_TOKEN`): CI run 36011034562 for `ee146bbf` — `check`,
`rls` and `deploy` all success; `app.inflozo.com` served `dpl_9MQPc31aVVcmD479m5kKMhk4onQ4`, READY, built from `ee146bbf`
(the walks refuse to run otherwise). **Resend and Dodo:** not touched — this story sends no email and bills nothing.

**The editor walk** (`run-verify-editor.cjs`, Pilot sections, unlinked — the control), same deployment: **0 FAIL,
576 PASS** on its first run; every step-89 row passed (the pill "Sample content", dashed, no SOURCE group, searching
fetches nothing), and step 4's DW-230 row (the editor's Post header marks no item; /pilots', drawn at `/`, marks Home).

**Locally, Node 24:** `pnpm check` exit 0 — `apps/web` with `live-content.test.ts` and page-two's source row,
`packages/library` with its control unedited, `section-runtime`, and `check-snapshots` PASS unchanged; `pnpm keyboard`
51 passed; the render matrix 180 cases · 5 designs · 0 violations with no baseline moved; `doc-audit --check` PASS twice.

**The Matrix Test Audit** — each row and a test that ran and passed for it (W the deployed walk, U the unit tests:
`live-content.test.ts`, `page-two.test.ts`, `orbit-weekly.test.ts`):

- *Unlinked* — W's control (zero requests, no SOURCE group), the editor walk's step 89, `pnpm keyboard` (`site: null`).
- *Linked and readable* — W on both majors (the site's paint, B9 connected, D5e's SOURCE group); U `sitePage`.
- *Disconnected · no key · `http:`* — W (each greyed with its own reason, nothing read); U `siteFrom`.
- *Choose Sample content · Choose the site* — W (the repaint, the pill, the polite sentence; the SOURCE row's R-98 busy
  state WATCHED from before the press, "Loading Ghost5…", `aria-busy` and `aria-disabled`, never `disabled`; nothing
  journalled — Undo asleep — and nothing stored — a reload reopens on the site).
- *Fresh · Stale · Two consumers* — U (the store over a fetch the test answers: no request inside `FRESH_MS`, one
  revalidation however many ask, a failed revalidation counted with the stale answer kept, one request for two
  callers); W (no key asked twice inside 60 s across the canvas, the cards, D5e and the Link Picker).
- *One failed read* — W (simulated cut: sample throughout, "Ghost5 not answering", SILENT — nothing new said, no "no
  longer there"); U.
- *Repeated failure* — W (simulated cut on a new session: exactly `FAILURES_TO_STOP` requests, one at a time, named
  and said, the row not greyed, and it heals); U.
- *Key refused* — W (a real 401: one request, greyed, pressing it sends nothing); U.
- *Too many requests* — W (a real 429 from T1: one request, named); U.
- *Ceiling* — U (`ask` stops at `REQUEST_CEILING` and choosing the site cannot reopen it); W records a full walk's 53.
- *Zero items · Fewer than asked* — U (an empty list is `[]`, never back-filled; every note's sentence); W (Archive's
  five-post note); `check-snapshots` keeps A17's declared empty arm.
- *The note's button (R-194)* — W (the switch, focus on the pill, the note gone and back — and live in a second
  session reading along, B5a's bar up, whose SOURCE group is live too).
- *Subject gone · Subject from the other source* — U (`fellBack` only where the subject's own source answered `[]`; the
  other source's starting subject silently); W (after a failure, no "no longer there").
- *Site has no tags (authors)* — U (`sitePage` answers `nothing`, and its sentence). Not walked: neither test site has
  none.
- *Page 2* — W (each major's own page 2); U (R-176 from the site's own count, with the sample's as the control); the
  recorder's `past-last` rows.
- *A body arrives anyway* — U (a hostile row keeps no body, injection or key); W (no answer carried one).

### Results — Review, 2026-09-24, on the real infrastructure (R-82)

**After the patches**, the deployed walk once more, `MAJORS=5,6 NO_429=1`, at `461db215` on `app.inflozo.com`
(`dpl_99L6REmM3xjL6hk9RxaaaoFDQWdL` READY, CI 36029637952 and the matrix 36029637751 green — the push before it,
`19f15eba`, went red in `pnpm build` on DW-246's Google Fonts fetch, nothing in the diff touching fonts, and `pnpm build`
exit 0 locally as the control): **0 FAIL, 88 PASS**, the two rows this review added among them on both majors — the
Home canvas shows the site's newest post and its menu and NOT the sample's newest post, and a reload of the Post canvas
still previews the post chosen over the site with no "no longer there". Per major 7 requests to open the editor and 41
over 15 keys; the whole walk 83 against the ceiling of 500. The fixture account deleted, users 13 before · 13 after.
Locally on Node 24: `pnpm check` exit 0 with the seven tests this review added (`live-content.test.ts`: the hung read,
the WIDTH bound, `siteTotal`, `cappedPosts`, `zoneOf`, `siteFrom`'s null) and `doc-audit --check` PASS twice. The recorder
was NOT re-run — its last step earns T1's hour (§52) — so §51 stands as recorded at Dev.

### Results — Deploy, 2026-09-24

Deployment: `dpl_51QXCMwWh7W3Nryq45DcPfVqU4Cw` — READY, `app.inflozo.com`, built from `4d5fae08` (CI run 36030662997: `check`,
`rls` and `deploy` all success; the matrix 36030662631 success). Read with `GITHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`.
No migration in the story (R-99), so no schema step. **The one-row link, applied 2026-09-25 after the owner's ruling on
Question 3**, through `SUPABASE_DB_POOLER_URL`: `update projects set linked_site_id = '9d473e0f-b0b9-4443-8514-e8b020f83bf0'
where id = '99d4d277-540f-4407-b9e1-033d4c93058f' and linked_site_id is null` returned one row, and a read back shows
Ghost 5 Project linked to `9d473e0f-…` (`https://ghost5.inflozo.com`, connected, key held). Before it, the same read had shown
`linked_site_id` null. The owner's data, one row; nothing else about the project changed. The Owner's manual test URLs
name `app.inflozo.com`, steps 1–13 are ready.

### Review Findings

Review of 2026-09-24 on `f971992b` (five layers: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier). The real-infra layer ran before a patch was written: T3 `ghost5.inflozo.com` answered
`formats=mobiledoc` reads with no body and `access-control-allow-origin: *`, a wrong key **one** 401 (the negative
control), the preflight 204 allowing `accept-version`; T1 `ghost6.inflozo.com` answered its one valid-key read 200 — its
§52 hold has lapsed; production's `projects.linked_site_id`, `sites.content_key`, `sites.disconnected_at`,
`project_template_prefs.preview_subject jsonb` and the partial unique index on `linked_site_id` read back through
`SUPABASE_DB_POOLER_URL` (no migration in the diff — R-99 holds); `app.inflozo.com` served `dpl_475YFtreA5sNTdc5xXDh7h317DWQ`
READY at `f971992b`, CI 36020037618 and the matrix 36020037468 green. The Acceptance Auditor found every string equal
to the Design Notes table and B9's pill equal to the frame. **Every patch below is applied; the story stays in review and
Deploy, then the owner's test, follow.**

- [x] [Review][Patch] A read that hung — a site that accepts the connection and never answers — was asserted as a
      constant and never exercised; without the request's `signal`, `ensure` would hold every later paint of the session.
      A test now waits the real timeout once and fails if the signal goes. And a job that threw outside the fetch (a
      body of an unexpected shape) would never have settled: the job's tail runs in a `finally`. [`live-client.ts`,
      `live-content.test.ts`]
- [x] [Review][Patch] `request()`'s walk had no catch: a throw over an answer's shape left `pending` set and every later
      paint of the session was dropped in silence. It lands as the error boundary, as a paint that throws does.
      [`editor.tsx` `request`]
- [x] [Review][Patch] The pill, D5e's rows, page 2's offer, the Link Picker's rows and the panel's note read the LAST
      paint's page even while another canvas's reads were in flight — so a pick made under the skeleton stored the old
      canvas's kind. They read the page painted for the canvas in force (`painted.key`), else the sample's own
      resolution. [`editor.tsx` `livePage`]
- [x] [Review][Patch] A sample subject picked while the site was chosen but not showing, whose press then brought the
      site back, was announced as chosen while the canvas showed the site's own starting subject; only a choice the paint
      used is said, in either direction. [`editor.tsx` `chooseSubject`]
- [x] [Review][Patch] The pill's cause was read back from the store's `last`, which ANY later answer clears — a card's
      rows, a background revalidation — so an edit's repaint after one silent failure said "Sample content" with no
      reason. The cause the last paint gave stands until a read the customer asks for replaces it. [`editor.tsx` `paint`]
- [x] [Review][Patch] A hand-picked `{{#get}}` list was measured against a Count it never uses ("This site has 3 posts
      for this section; it shows up to 12"); a pick has no limit to fall short of (R-20), so it carries no note.
      [`editor.tsx` `shortfall`]
- [x] [Review][Patch] The "never a burst" claim in `live-client.ts`'s header did not hold mid-session: once the site has
      answered, up to `WIDTH` reads are in flight, and a key rotated then can fail all of them before the first is
      counted. The bound is now stated in the header and the Design Notes, and pinned by a test that holds reads in
      flight: one at a time before the first answer, `WIDTH` after it, none new while a failure stands. [`live-client.ts`,
      this spec, `live-content.test.ts`]
- [x] [Review][Patch] `siteTotal` (the panel's number), `cappedPosts` (D5e's line), `zoneOf` and `siteFrom`'s "no site"
      answer had no test; each has one. The `'Etc/UTC'` fallback was restated in `sitePage` and `sitePieces`; one
      `zoneOf`. The `Live` type was declared three times; `section-preview.tsx` exports it. [`live-content.ts`,
      `canvas.ts`, `section-preview.tsx`, `design-picker.tsx`, `section-picker.tsx`, `live-content.test.ts`]
- [x] [Review][Patch] Two rows the walk never covered are walked: the Home check now also asserts the SAMPLE's newest
      post is absent (the control that tells the site's rows from the site's header over sample rows), and a reload of
      the Post canvas still previews the post chosen over the site with no "no longer there" — `read.ts`'s `source` mark
      read back with the row, which nothing observed before. [`run-verify-live-content.cjs`]
- [x] [Review][Patch] `record-content-api.py`'s no-body step FAILED the run on a fixture with zero pages; an empty resource
      is a property of the site, so it is a RECORD row. Not re-run: its last step earns T1's hour-long 429 (§52). [`record-content-api.py`]
- [x] [Review][Defer] The first paint of a canvas costs two round trips (three on Tag/Author) where one would do —
      deferred, DW-250
- [x] [Review][Defer] The ring's tiles on the site's content and a positive "newest 100 posts" line are proven at the
      unit level only — deferred, DW-251
- [x] [Review][Dismiss] Raised and set aside, each by the spec's own words: background revalidation failures counting
      toward the stop rule ("a failure is counted"); a `sites` row that fails to read answering `null` ("the safe side");
      the "no tags yet" page ticking Sample content in SOURCE (the pill describes the last paint, R-165, and the menu
      says why); edits waiting behind a read the customer asked for ("every other paint waits for it"); the main-feed
      note keyed on the `posts` context rather than `isMainFeed` (5.19's lifecycle; the sentence is true of any section
      that renders the feed); `isPlainHttp` restated as the same regex (identical, and `siteFrom` takes no imports).

## Owner's manual test

On the real site after Deploy, in a desktop browser about 1440 wide. **Deploy has linked your Ghost 5 Project to your
Ghost 5 site** (ghost5.inflozo.com) for this — one line of your data; nothing else about the project changed. Steps
5 and 7 follow your ruling on Question 1 (**R-193**) and step 6 your ruling on Question 2 (**R-194**). Your Ghost 5
site is a full one, so its **Archive** tag — 5 posts, fewer than a page holds — stands in for a brand-new site's one post.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Look at the page and at the pill at the foot of the canvas. | — | The pill reads **"Previewing with: Ghost5"** with a **solid** thin outline and a **green** dot. The post grid shows **your** posts, newest first — "PROBE Gated Post" (no picture), "On typography and restraint", "The cost of clever"… The header shows **Ghost5** and your menu, **Ghost 5 Home · Ghost 5 About**. Every card says "0 min read": your test posts are one line long, and your live site says the same. |
| 2 | same | Editor, Home | Press the pill. Choose **Sample content**. Press the pill again and choose **Ghost5**. | — | A menu headed **SOURCE**: **Ghost5** (green dot) highlighted, **Sample content** (grey dot). After Sample content the canvas shows the Orbit Weekly magazine and the pill turns **dashed and grey**, "Sample content". After Ghost5, your posts are back — at once if you were quick, and otherwise after the row says it is loading. |
| 3 | `…/projects/99d4d277-540f-4407-b9e1-033d4c93058f/post` | Editor, Post | Press the pill. Type in the search box, then choose the post it finds. | `margin` | The pill reads "Previewing with: Ghost5 · Style-guide article". The menu shows SOURCE, then **SUBJECT**: "Style-guide article" first, then **your** posts with their dates and "has image" on the ones with a picture. The search leaves **"Reading the margins"**; after choosing it, the post header shows that title, **Priya Raman**, **Archive** and its picture. The article under it is still the style-guide article — that is by design. |
| 4 | `…/page` | Editor, Page | Press the pill. | — | SUBJECT lists "Style-guide page", then your two pages: **Member Home Preview** and **PROBE Boom**. |
| 5 | `…/tag` | Editor, Tag | Look at the page. Press the pill and choose **Archive**. Then click the post grid. | — | Untouched, the page shows **Craft** — your tag with the most posts — and its 9 posts. After Archive it shows 5. The panel on the right starts with **"This tag has 5 posts; this section shows up to 12 per page."** |
| 6 | same | Editor, Tag | With Archive still chosen and the post grid still clicked, press **Preview with sample content** under that note. Then press the pill and choose **Ghost5**. | — | The whole editor switches to the sample magazine — the canvas shows its Field Notes page — and the pill turns **dashed**, "Sample content", with the keyboard's focus ring on it. The note and its button are gone: the sample's tag fills the page. After Ghost5, Archive's 5 posts are back, and so are the note and its button. |
| 7 | `…/author` | Editor, Author | Look at the page, then press the pill and choose **Priya Raman**. | — | Untouched, it shows **Umang** and 12 posts; after the choice, Priya Raman's 11. |
| 8 | `…/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Click the post grid, and in its panel choose **Page 2** under Preview page. | — | Page 2 shows your posts from **"Ten years of one layout"** onwards. |
| 9 | same | Editor, Home, page 1 | Back on page 1, click the post grid; in its panel open the **link** of "Browse the archive", type, choose the result, then press **Undo** (the curved arrow at the top). | `grid` | Under **POSTS**: **"What the grid gets wrong"** — your post. Choosing it links the words to your site; Undo puts the old link back. |
| 10 | same | Section Picker | Press **⌘K**, open **Heroes**, look at **Latest Post**, then press **Esc**. | — | The Latest Post card shows **your** newest post, "PROBE Gated Post", in its card. |
| 11 | `…/author` | Editor, Author | **Turn your Wi-Fi off.** Press the pill and choose **Tom Whitlock**. Then turn Wi-Fi back on, press the pill and choose **Ghost5**. | — | With Wi-Fi off the canvas shows the sample magazine's writer page, and the pill turns **dashed**: "Sample content · Ghost5 not answering". The menu may also say the choice will not survive a reload — the save could not reach Inflozo either. With Wi-Fi back and Ghost5 chosen: Tom Whitlock's 10 posts. |
| 12 | `https://app.inflozo.com/projects/21d868cf-1262-4ad2-9a44-091fbf653a04` | Editor, Home (Ghost 6 Project) | Press the pill. | — | This project is linked to your **disconnected** Ghost6 site: the pill reads "Sample content" (dashed), and in SOURCE the **Ghost6** row is **greyed** with *"Inflozo is no longer connected to Ghost6. Reconnect it from Sites to preview with its content."* **Sample content** is the row in force. |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home (Pilot sections) | Look at the pill and try to press it. | — | Exactly as before this story: "Sample content", dashed, and nothing to open — this project links no site. |

## Questions for the owner

### Question 1 — Before you pick one, which of your tags and writers should the Tag and Author pages show?

**In plain English.** The Tag page and the Author page each show **one** tag's or **one** writer's posts, and you can
choose which from the pill. Until you choose, the written rule is *"a fixed Orbit Weekly tag and author"* — the sample
magazine's own **Field Notes** and **Rosa Menendez**. Once those pages show your own site, the sample's tag and writer
are not there: your site has its own. So something has to decide which of **yours** they open on. This is only the
starting choice — you can always change it, and your choice is kept.

**An example.** Your Ghost 5 site has six tags — Craft (9 posts), Field Notes (8), Tooling (7), Systems (6), Archive
(5) and Interviews (5) — and three writers: Umang (12 posts), Priya Raman (11) and Tom Whitlock (10).

1. **Your tag and your writer with the most posts. (RECOMMENDED)**
   - The Tag page opens on **Craft** and the Author page on **Umang**.
   - The fullest archive gives a grid full rows, and it is the one most likely to have a page 2 when you design
     pagination.
   - A tie goes to the name that comes first in the alphabet.
2. **Your first tag and writer in alphabetical order.**
   - The Tag page opens on **Archive** and the Author page on **Priya Raman**.
   - Easy to predict, but it can land on a tag with a single post.
3. **Keep the sample magazine's tag and writer on those two pages until you pick one of yours.**
   - Nothing of yours is guessed.
   - But those two pages show sample posts while every other page shows yours, and their pill has to say "Sample
     content".

**Ruled: option 1 (owner, 2026-09-24)** — *"The tag and writer with the most posts."* Recorded as **R-193**. He asked
in the same breath what happens on a brand-new site, where every tag and writer has one post — that is Question 2.

### Question 2 — A brand-new Ghost site has one post, one tag and one writer. What should the editor show you then? (raised 2026-09-24, from your ruling on Question 1)

**In plain English.** You are right: a new Ghost site comes with one post, **"Coming soon"**, one tag, **News**, and
one writer — **you** — plus an **"About this site"** page (read in Ghost's own code, on both versions). So with your
ruling the Tag page opens on News and the Author page on you, and every list of posts on your pages shows **one card
where the design has room for twelve**. That is the truth about the site, but it is a poor way to judge a grid. Two
things already planned help: a note in the panel of any section that is not full — *"This site has 1 post; this
section shows up to 12 per page."* — and the pill's switch to **Sample content**, which fills every page with the
sample magazine. The question is whether to do more.

**An example.** You connect a brand-new site and open the editor. Home shows your header, then a grid built for
twelve holding one "Coming soon" card, then your footer.

1. **Show your one post, and put a "Preview with sample content" button in that note. (RECOMMENDED)**
   - Whenever a section's list is not full, its note says so and carries the button; one press switches the whole
     editor to the sample magazine — the same thing the pill does — and the pill switches you back.
   - Your own site stays what you see first, which is what connecting a site promises, and the full page is one press
     away exactly where you notice the gap.
   - Nothing is guessed and no line has to be drawn.
2. **Start a thin site on sample content automatically.**
   - While your site has fewer posts than fill one page (fewer than 12 today), the editor opens on Sample content and
     the pill says why: *"Ghost5 has 1 post, so pages start with sample content. Choose Ghost5 to see yours."*
   - The first look at a new site is full and finished.
   - But it breaks "connecting your site shows your content", the line at 12 is arbitrary, and the day you publish your
     twelfth post the editor changes under you.
3. **Leave it as planned.**
   - Your one post, the note, and the switch in the pill.
   - Nothing new to build, but the note does not say how to see the page full.

**Not offered:** filling the empty places with sample posts. Your ruling R-36 is that a list is never padded with
posts nobody chose for it, and the canvas would then show a page your site will never show.

**Ruled: option 1 (owner, 2026-09-24)** — *"Show your one post, and put a 'Preview with sample content' button in
that note."* Recorded as **R-194**. The button is the pill's own Sample content row with a second door: it appears
only while the canvas shows the site's content, moves focus to the pill, and stays live in a session reading along;
the matrix, the strings, the tasks and step 6 of the owner's test carry it.

### Question 3 — Deploy needs to link your Ghost 5 Project to your Ghost 5 site. May it? (raised 2026-09-24, at Deploy)

**In plain English.** The test steps open your **Ghost 5 Project**, and for it to show your Ghost 5 posts that project
has to be linked to your Ghost 5 site. Today it is not linked. Linking is one line of your own data in the live
database, and Claude's safety check would not let it write that line without you saying so.

**An example.** Before: Ghost 5 Project's pill reads "Sample content". After the link: "Previewing with: Ghost5" and your posts.

1. **Yes — Claude may write that one line. (RECOMMENDED)**
   - It sets only that project's linked site to `ghost5.inflozo.com`, only if it is empty now, and reads it back.
   - Nothing else about the project changes; you can unlink it from Sites afterwards.
2. **No — I will link it myself**, in the app, from the project's settings if it offers that. Claude then only records that.
3. **No — leave it unlinked.** Steps 1–11 cannot be walked; only steps 12 and 13 can.

**Ruled: option 1 (owner, 2026-09-25)** — *"Yes — Claude may write that one line."* Applied and read back; see Results — Deploy.
