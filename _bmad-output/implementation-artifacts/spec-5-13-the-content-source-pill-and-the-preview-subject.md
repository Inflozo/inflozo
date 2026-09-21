---
title: 'Story 5.13 — The content-source pill and the preview subject'
type: 'feature'
created: '2026-09-20'
status: 'in-progress'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '680ad91b5defe28c2eeed9d20638b658b0e47e2d'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

A small **pill** now sits at the bottom of the canvas and tells you, in words, what the page you are
looking at is made of: **"Previewing with: Sample content"**, with a dashed outline and a grey dot,
because nothing on this canvas is your own writing yet. On the Post, Page, Tag and Author canvases it
also names **which** post, page, tag or author the page is rendering — until now that was a silent
choice you could not see or change — and pressing the pill opens a list where you can pick a different
one.

**Why that matters and is not decoration.** A post *with* a picture at the top and a post *without* one
are genuinely different pages: the design hides the picture slot entirely when there is none. So "which
post am I looking at" is part of the answer to "does my design work", and the editor has been keeping
it to itself.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-D15 and FR-D22 are both entirely unbuilt, and the second one is quietly wrong today.
Nothing anywhere in the app says what the canvas is rendering — `grep` finds no reader of
`project_template_prefs` at all, and its `preview_subject` column (`{kind, id, slug}`) has been in the
schema since the complete-schema migration with nothing ever writing or reading it. Worse,
`orbit-weekly.ts`'s `templateContext` hands `tag.hbs` and `author.hbs` **the whole bundled feed,
unfiltered** — the same rows `home.hbs` gets — so a Tag archive in the editor today shows every post on
the site rather than the tag's own, which is not a preview of anything Ghost would ever serve. The
single-resource canvases have a subject whether or not anyone chose it (`subject('post')` /
`subject('page')`, hard-coded), and FR-D22's whole point is that an unstated subject makes the canvas
non-reproducible and NFR-6(c1)'s diffs noisy.

**Approach:** **One optional argument on the one function that already decides what a template hands a
section.** `templateContext(target, feed)` in `packages/library/src/orbit-weekly.ts` gains a third,
optional `subject`, and `lib/canvas.ts`'s `renderSection` — the single door the editor, the Section
Picker's preview cards and `/pilots` all paint through — passes it along. Passing nothing keeps today's
behaviour exactly, which is what leaves `tools/check-snapshots.mjs` (NFR-6(c1)) and the render matrix
untouched and is this story's control. A second pure function, `resolveSubject(file, stored)`, answers
"which subject is this canvas actually rendering, and did the stored one survive"; its answer is what
the pill prints and what `templateContext` is handed. The surface is **B9**'s pill at the canvas foot
with **D5e**'s menu, built on the template switcher's own `popover="auto"` + `openMenu` vocabulary, and
the choice persists in the column that has been waiting for it. No migration, so **no Schema phase**.

## Boundaries & Constraints

**Always:**
- **The pill describes the canvas, never the paperwork.** Until Story 5.18 reads a connected site, every
  canvas in the product renders Orbit Weekly, so the pill reads **Sample content** — B9's dashed border
  and grey dot — on every project, *including* one whose `projects.linked_site_id` is set by Story 3.4's
  "Use your brand". Naming a linked site while rendering the bundled publication would be a lie told by
  the one control whose entire job is to stop that lie.
- **The subject is a stated choice** (FR-D22). Untouched, it is the fixture — the style-guide post on
  Post, the style-guide page on Page, and a fixed Orbit Weekly tag and author on the archives — and the
  pill **names** it rather than leaving it implied.
- **The canvases with a subject are DERIVED, never listed.** `placement.ts`'s `NATIVE` table already says
  which templates carry a singular resource natively (`post.hbs` → `post`, `page.hbs` → `post`, `tag.hbs`
  → `tag`, `author.hbs` → `author`); the SUBJECT group is offered exactly where that is true, so a
  template added later is right by construction and no list of four is written down (standing rule 4).
- **An archive renders its own posts.** A tag canvas gets the tag object at the root plus the posts
  carrying that tag, with a `pagination` sized on **those** rows; an author canvas the same
  (`appendix-b1-template-contexts.md` §3 — list templates are flat at the root with the taxonomy object
  alongside).
- **`{{content}}` is untouched.** Body HTML is never read and the style-guide fixture is the body for
  every subject (Story 4.4). Changing the subject changes the title, date, author, tags and feature
  image; it never changes the article.
- **A subject that is gone falls back and says so** (FR-D22) — it never empties the canvas, and the
  stored value is kept rather than deleted, so a resource that returns brings the choice back.
- **The pill never overlaps the page card, on any device, and the card never moves to make room**
  (**R-166**). It is built at **24px** inside R-139's existing 32px ground; `py-8` is untouched. R-138 and
  R-139 are the owner's own rulings about exactly this ground, made after he measured a chip sitting on a
  height-bound card.
- **The subject list is built now, over the bundled publication** (**R-165**). FR-D22's *"once a site is
  connected"* names where the rows come from, not whether the surface exists; Story 5.18 changes the source
  and rebuilds nothing.
- **The default is the fixture by construction.** The new argument is optional; `/pilots`,
  `tools/check-snapshots.mjs` and `tools/matrix/` pass nothing and render byte-identically. That
  equality is the control for the whole story.

**Never:**
- Never a second render path. `renderSection` stays the one door; no surface renders a subject its own way.
- Never a keyboard shortcut. FR-D11 states it: the preview subject is "set-and-forget context, not a
  per-edit action", and R-145's map gains no fourteenth row.
- Never an undo step. The subject is a per-canvas preference, not part of the doc, so it never enters the
  journal and `⌘Z` does not touch it.
- Never a hex literal in a `.tsx` under `apps/web` (`tokens.test.ts:125` — `no .ts or .tsx under apps/web carries a colour literal`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | Post canvas, no stored pref | Pill at the canvas foot reads **"Previewing with: Sample content · Style-guide article"**, dashed, grey dot; canvas renders the style-guide post exactly as today | N/A |
| Naming the subject | Tag canvas, no stored pref | Pill names the fixture tag; the canvas renders that tag's posts and a pagination sized on them — **not** the whole bundled feed | N/A |
| Choosing one | Post canvas, pick a post with no feature image | The canvas repaints at once and the feature-image element is **absent**, not empty (FR-H8's media guard); the pill's second half names the new post | N/A |
| The structural claim | Same post canvas, pick one *with* a feature image | The `<img>` and its `srcset` are back; the two renders differ by whole elements, not attributes | N/A |
| Persisted | Choose a subject, reload the editor | The same subject, from `project_template_prefs`; per canvas, so Post and Tag hold different ones | N/A |
| Subject gone | Stored slug is in no row the source holds | Canvas renders the **fixture**; the pill names the fixture; the menu says the chosen one is no longer there; the stored value is **kept** | announced through `#editor-said` on open |
| No subject here | Home, 404, Signup, Signin, Member home | The pill is present and states the source; there is **no** SUBJECT group and no chevron — nothing to open | N/A |
| Source group | Any canvas, today | **Absent** (R-118): no live content exists to switch to until Story 5.18 | N/A |
| Linked site | `projects.linked_site_id` set by Story 3.4 | Pill still reads **Sample content**, dashed — what is on the canvas, not what is on the record | N/A |
| Search | the bundled feed, type into D5e's field | Filters by title, client-side and pure — the rows are bundled, nothing is fetched | N/A |
| Save refused | Upsert fails (RLS, offline) | The chosen subject stays on the canvas for the session and the menu carries the refusal sentence, so the user knows it will not survive a reload | the action returns the sentence |
| Harness / pilots | `/pilots`, `check-snapshots`, the render matrix | Byte-identical to today — no subject passed, fixture resolved | N/A |
| Read-only session | 5.17's reader (not yet built) | Out of scope — the pill follows whatever gate 5.17 puts on every editing control | N/A |

</frozen-after-approval>

## Code Map

- `packages/library/src/orbit-weekly.ts:106-110` — `subject(which: 'post' | 'page')`, whose header already
  cites **FR-D22**. It widens to the four kinds; `tagRow`/`authorRow` (`:62-71`) already hydrate a
  taxonomy row with its derived `count.posts`.
- `packages/library/src/orbit-weekly.ts:124-141` — `templateContext(target, feed)`. **The one place a
  subject reaches a render**, and today the place `tag.hbs`/`author.hbs` get the unfiltered feed. Gains
  the optional third argument; `feedPagination` (`:87-95`) must grow a sibling that sizes on a given row
  count rather than always on `dataset.posts.length`.
- `packages/library/orbit-weekly/dataset.json` — `subjects` holds `post` and `page` as hidden rows ("never
  in `posts`, so no feed, Source or count can reach them"). A tag and an author **cannot** be hidden that
  way — an archive's posts come from the feed — so they join as **slugs referencing existing rows**, which
  is also what makes them a *stated* choice rather than an accident of sort order.
- `packages/library/src/placement.ts:71-83` — `NATIVE`. The derivation of "which canvases have a subject";
  read-only this story.
- `apps/web/lib/canvas.ts:65-103` — `renderSection`. Its `o` object gains `subject`. **Three callers:**
  `editor.tsx:765`, `components/editor/section-preview.tsx:121` (the picker's preview cards, which
  `EXPERIENCE.md:877` says wear the project's content source) and `pilots/review.tsx:124` (passes nothing).
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` — `editorData`. Gains the
  `project_template_prefs` read (its **first reader anywhere**) beside the existing `Promise.all`, and
  hands the editor the stored subjects by template key. `fileOf` (`:68-70`) is the key → file map the
  resolver needs.
- `supabase/migrations/20260904120000_complete_schema.sql:259-270` — the table. `preview_subject jsonb`,
  PK `(project_id, template_key)`, `user_id not null`; §10a's owner policy + §10a-ii's parent-owned
  restrictive; §11a grants `select, insert, update, delete` to `authenticated`. DW-193 already fixed
  `template_key_shape` on **both** tables at Story 5.8, so `custom:` keys are accepted. **No migration.**
- `apps/web/components/editor/template-switcher.tsx` — the menu this one is built like: a `popover="auto"`
  placed by `openMenu`, group headings, indents, the current row in `coral-tint` at 600 with a 13px check.
  D5e is the same vocabulary plus a search field.
- `apps/web/lib/menu.ts` — `anchorTo`/`openMenu` (clamps both edges, R-126), `arrowKeys`, the shared `item`
  row class.
- `apps/web/components/editor/device-switch.tsx:84-95` — `ViewportChip`. **The precedent for a thing that
  lives in the stage's ground**: `left-1 top-1`, sized for the ground rather than for a frame's detail
  card, and `pointer-events-none` so R-123's deselect test still reads `e.target === e.currentTarget`.
  The pill is pressable, so it is a control and not a fourth ground — but it must clear the card the same way.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx:1919-2047` — the stage `<section>`
  (`py-8`, R-139), the page card, `ViewportChip` last so the card stays `firstElementChild`, and
  `setSaid`'s `#editor-said` live region.
- `packages/section-runtime/src/core.ts:452-490, 780-790` — FR-H8's media guard. `data-bind-attr="src:…"`
  guards **the element**, which is why a subject with no `feature_image` produces structurally different
  markup; `packages/library/designs/a24/1/index.html` is the pilot that binds it (with a `srcset`).
- `tools/check-snapshots.mjs:79` and `:457` — call `templateContext` with two arguments. **Leave them
  alone**; their unchanged output is this story's control.
- `apps/web/app/globals.css:32,41,46,64` — `--color-paper-raised` (#FBF9F5, B9's not-connected ground),
  `--color-line` (#E7E2DB), `--color-line-strong` (#C9C2B8, B9's grey dot) and `--color-mint` (#1FA97A,
  B9's connected dot). B9's dashed `#D8D2C7` is in **no** token set and in no other frame; `line-strong`
  is the nearest and is already the dot's own colour.
- `tools/probe/run-verify-editor.cjs` — the deployed walk; its highest step today is **88**.

## Tasks & Acceptance

**Execution:**
- [x] `packages/library/orbit-weekly/dataset.json` — `subjects` gains `"tag": "field-notes"` and
      `"author": "rosa-menendez"`, as **slugs** of rows that already exist, with the `note` extended to say
      why these two differ in shape from `post`/`page`. Chosen for coverage, not alphabetically:
      `field-notes` carries more posts than any other tag and Rosa is tied for the most-published author,
      so both archives render a full first page. **Derive the counts, never restate them.**
- [x] `packages/library/src/orbit-weekly.ts` — `Subject = { kind: 'post'|'page'|'tag'|'author'; slug: string }`
      (the column's own shape, minus the `id` nothing needs offline); `fixtureSubject(file)` → the Subject
      a file gets untouched; `resolveSubject(file, stored)` → `{ subject, fellBack }`, PURE — a stored
      subject of the wrong kind for the file, or naming a slug in no row, resolves to the fixture with
      `fellBack: true`. `subject(which)` widens to the four kinds. `templateContext(target, feed, subject?)`
      renders it: post/page spread flat at the root; `tag`/`author` put the taxonomy object at the root
      **alongside** the filtered `posts` and a `pagination` sized on those rows (§3, §3a).
- [x] `packages/library/src/orbit-weekly.test.ts` — every matrix row over the pure half: the fixture per
      file; an archive's rows are exactly the rows carrying that tag/author and its `pagination.total`
      matches their count; a bad slug and a wrong-kind subject both fall back with `fellBack`; **and the
      control — `templateContext(t, f)` with no third argument returns what it returns today, for every
      target.**
- [x] `packages/library/src/placement.ts` — `NATIVE` is module-private and `CONTEXTS_BY_TARGET` folds
      `GETTABLE` into it, so neither answers "what singular resource does this file carry". Export one
      query — `nativeResourceOf(file)` → `'post' | 'tag' | 'author' | null` — over the SAME table, so the
      picker's filter and the subject's existence can never disagree about a template (standing rule 3).
- [x] `apps/web/lib/preview-subject.ts` — NEW, pure and importless (`ring.ts`/`device.ts`'s precedent, so
      `node --test` reaches it): `hasSubject(file)` = `nativeResourceOf(file) !== null`;
      `subjectLabel(subject)` (what the pill's second half prints); `SOURCE_WORDS` ("Previewing with:",
      "Sample content"); `subjectOptions(source, kind)` → the rows D5e lists, style-guide entry first,
      each with its title, date and whether it carries a feature image; `filterSubjects(rows, query)`;
      `GONE(subject)` — FR-D22's "says so" sentence; `SUBJECT_SAID(subject)` for `#editor-said`.
- [x] `apps/web/preview-subject.test.ts` — NEW. The pure module's rows, the sentences' singular/plural, and
      `hasSubject` true for exactly the canvases the `NATIVE` table gives a singular resource — asserted
      over `CANVASES` rather than against a written list.
- [x] `apps/web/components/editor/source-pill.tsx` — NEW. **B9's pill** (`B Missing Surfaces.dc.html:1391-1420`)
      at the canvas foot, in the stage's own ground, **at 24px (R-166)** so it clears the page card on every
      device without `py-8` moving; **D5e's menu**
      (`D5 …:189-263`) as a `popover="auto"` placed by `openMenu` with `side: 'up'`: the SUBJECT heading,
      the search field, the style-guide row with its caption and check, then the rows with title, date and
      the **"has image"** chip whose *words* carry the meaning and whose glyph is decoration beside them
      (D5e's own caption), and D5e's helper line verbatim. No SOURCE group (R-118). No chevron and no menu
      where `hasSubject` is false.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts` — NEW: `setPreviewSubject`, an
      upsert on `(project_id, template_key)` setting `user_id`, returning ok or one sentence. Called from
      the client handler inside a transition, **not** a form submit — the canvas has already repainted, so
      there is no wait for R-98's busy label to describe.
- [x] `read.ts` — the `project_template_prefs` select joins the existing `Promise.all`; `EditorData` gains
      `subjects: Record<string, Subject>` keyed by `template_key` as `docs` is.
- [x] `editor.tsx` — the canvas's resolved subject (via `resolveSubject`) is state; `renderSection`'s call
      at `:765` passes it; `<SourcePill>` renders after `ViewportChip` so the page card stays the ground's
      `firstElementChild`; choosing announces through `#editor-said`; a `fellBack` resolution announces on
      open.
- [x] `section-preview.tsx:121` — passes the canvas's subject, so a picker card previews the page the
      canvas is actually rendering (`EXPERIENCE.md:877`).
- [x] `tools/probe/run-verify-editor.cjs` — steps **89+** on the **deployed** editor: the pill's words and
      dashed state on Home and Post; **its box never intersects the page card's box at Desktop, Tablet and
      Mobile**, measured from rects as R-138 required; the menu opens, filters and picks; the canvas's
      feature-image element is present for one subject and **absent** for another; the choice survives a
      reload; a bogus stored subject renders the fixture and says so; the Tag canvas's rendered post count
      equals the tag's own; zero CSP violations across the whole session (step 5).

**Acceptance Criteria:**
- **Given** any canvas **When** the editor opens **Then** a pill at the canvas foot reads "Previewing
  with: Sample content" with B9's dashed border and grey dot, **and it matches the frame** (B9).
- **Given** a canvas whose file carries a singular resource **When** I look at the pill **Then** it also
  names the preview subject, and **When** I press it **Then** D5e's menu opens, **and it matches the frame** (D5e).
- **Given** no stored choice **Then** the subject is the fixture: the style-guide post on Post, the
  style-guide page on Page, and the fixed Orbit Weekly tag and author on the archives.
- **Given** a subject chosen **When** I reload **Then** the same subject is rendering, per canvas.
- **Given** two subjects, one with a feature image and one without **Then** the rendered markup differs by
  a whole element, not an attribute.
- **Given** a stored subject that no row holds **Then** the canvas renders the fixture and says so, and
  the canvas is never empty.
- **Given** Home or any canvas with no singular resource **Then** the pill states the source and offers
  nothing to open.
- **Given** any device **Then** the pill does not overlap the page card and the card is the same size it is
  today — `py-8` unchanged (R-138, R-139, **R-166**).
- **Given** `pnpm check` **Then** `tools/check-snapshots.mjs` is unchanged and green — the fixture default
  is byte-identical to today.

## Design Notes

**Why B9 governs the pill and D5e governs only the menu.** The two frames disagree about the pill itself:
B9 draws it light — white or `#FBF9F5`, a 24px radius, the state carried by a solid-vs-dashed border —
while D5e draws it as a 30px item inside an ink `#1C1B1A` bar at 10px/4px. **The epics entry rules it
already**: *"the pill matches B9 and the picker matches D5e"*. B9's own Notes say the same thing from the
other side — of the four surfaces in that row, *"two are ink pills that float over the canvas … the other
two are status … the source pill is a border style"*. D5e inherited the ink treatment from its prompt's
blanket *"THE PILL SPEC IS SHARED AND ALREADY SET"* line, which generalised a rule B9 had explicitly
scoped to the other two. So: **B9's pill, D5e's menu**, and no question is owed.

**Why the archives were wrong before anyone chose anything.** `templateContext` treats `tag.hbs` and
`author.hbs` as list templates and stops there — correct about the *shape* (§3a: flat at the root) and
silent about the *filter*. The consequence is that today's Tag canvas renders a feed Ghost would never
serve, and `a17/1` — the only design compiling to `tag.hbs`/`author.hbs` — renders it faithfully, so
nothing looks broken. Fixing it is not an extra: FR-D22's subject **is** the filter.

**Why `resolveSubject` is separate from `templateContext`.** `templateContext` is pure and returns a render
context; it has no way to report *"the one you asked for is gone"*. Splitting the resolution out keeps
that function's return shape unchanged for its three existing callers, gives the pill a single honest
answer to print, and makes the fallback a unit test rather than a browser observation.

**Why there is no Schema phase.** `project_template_prefs.preview_subject` has been in the schema since
the complete-schema migration, its grants and both policies are in place, and DW-193 fixed its
`template_key_shape` at Story 5.8. This story is its first reader and its first writer, and it adds no
column (R-99).

**Where the pill sits, and the measurement that decides it.** The stage's ground is `py-8` — 32px top and
bottom (R-139) — and `ViewportChip` tucks into the top at 4px. B9's pill measures **about 27px** at its
drawn `padding:5px 12px` over 12.5px type, and D5e states its target as **30px**; at the chip's own 4px
inset that leaves between one pixel and minus two against the card's bottom edge on a height-bound device
(Tablet, Mobile, a short-window Desktop). Either way it is R-138's measured failure with no margin left.
**R-166 (owner, 2026-09-20) settles it in favour of the page:** the pill is built at **24px**, `py-8` does
not move, and no card loses a pixel at any size. It stays a real target — 24px is WCAG 2.5.8's floor — and
it is the same trade `ViewportChip` already makes in the opposite corner. It remains the first thing the
deployed walk measures, because a rule about geometry is proved by measuring the geometry (R-164).

**What arrives with Story 5.18 and is absent until then.** B9's connected state, the SOURCE group, and a
subject list drawn from the user's own posts. R-118's rule again, unchanged: absent, never greyed, and no
caption explaining the absence. The pill's *not-connected* state is not a placeholder — it is the true
state of every project in the product today.

## Verification

**Commands:**
- `pnpm check` — expected: lint, typecheck and every package test green, with `orbit-weekly.test.ts`'s
  no-third-argument control and `preview-subject.test.ts` included, and `pnpm keyboard` unchanged (this
  story binds no key).
- `node --test apps/web/preview-subject.test.ts` — expected: every I/O matrix row over the pure module.
- `node tools/check-snapshots.mjs` — expected: **unchanged**, every committed snapshot still matching
  (NFR-6(c1)). This is the control for the whole story.
- `node tools/probe/run-verify-editor.cjs` — expected: 0 FAIL on the **deployed** editor
  (`app.inflozo.com`), steps 89+ included, zero CSP violations, `/harness/editor` still 404.
- `bash tools/matrix/run-matrix-gate.sh` — expected: green, unchanged; the matrix passes no subject.
- `python3 tools/doc-audit.py --check` — expected: exit 0.

**Real services this touches (R-82):** Supabase (`project_template_prefs`, through the owner's own session
on the production project) and the deployed app on `app.inflozo.com`. No Ghost server: the bundled
publication is the source until Story 5.18.

## Owner's manual test

Do this on the real site after Deploy confirms the URLs. Use the **Pilot sections** project — the one
seeded to your account at Story 5.1.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the **bottom** of the page you are designing, in the grey area just under it. | — | A small pill with a **dashed** outline and a **grey** dot, reading **"Previewing with: Sample content"**. It has nothing to open on this page, and it does not sit on top of your page. |
| 2 | the same | Editor, Home | Press `2` and then `3` to switch to the tablet and phone sizes. | — | The pill stays clear of the page at every size — it never covers the bottom of your design. This is the step that matters most on this list. |
| 3 | `…/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/post` | Editor, Post | Look at the same pill. | — | It now says **two** things: the source, and **which article** the page is showing — *Style-guide article*. |
| 4 | the same | Editor, Post | **Press the pill.** | — | A list opens upward. At the top, **"Style-guide article — The one every post design is designed against"**, ticked. Below it, real articles with their dates, and some carrying a small **"has image"** label — the words, not just a picture. |
| 5 | the same | the open list | Type `archive` in the search box. | `archive` | The list narrows to the two articles with that word in the title — *The archive as argument* and *A quiet week in the archive*. Nothing loads; it is instant. |
| 6 | the same | the open list | Clear the search and pick an article that **does** say "has image". | — | The page redraws with that article's title, date and author, and a **picture across the top**. The pill's second half now names that article. |
| 7 | the same | the open list | Press the pill again and pick an article with **no** "has image" label. | — | The picture at the top is **gone entirely** — not a grey box, not a gap. That is the whole point of this story: two articles, two genuinely different pages. |
| 8 | the same | Editor, Post | **Reload the page** in your browser. | — | The article you picked is still the one showing. Your choice was saved. |
| 9 | `…/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/tag` | Editor, Tag | Look at the pill, then at the list of posts on the page. | — | The pill names a tag. The posts on the page are **only** that tag's posts. Before today this page showed every post on the site, which no real tag page ever does. |
| 10 | the same | Editor, Tag | Press the pill and choose a different tag. | — | The posts change to that tag's posts. Go back to Post — its article is still the one you picked in step 7; each page remembers its own. |
| 11 | `…/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Press the pill. | — | **Nothing opens.** Home is not about one article, so there is nothing to choose — the pill just tells you what it is made of. |

**One thing to know before you test it.** The pill's *other* state — a solid outline and a green dot,
naming **your** Ghost site — cannot appear yet, because nothing in the editor reads your site's posts
until Story 5.18. Today every project previews with the bundled sample publication, so "Sample content"
is the honest answer rather than a missing feature.

## Questions for the owner

### Question 1 — should you be able to choose the article now, or only once your own site is connected?

The requirement we wrote months ago says the *list* of articles to choose from is a thing you get **once
your Ghost site is connected** — which is Story 5.18, five stories away. Read strictly, this story would
build only the pill that *names* the article, with nothing to press.

But the sample publication the editor previews with today already has **dozens of articles**, about three quarters of them with a
picture at the top and the rest without — so the list can be real right now, over the sample, and become your own
articles the day Story 5.18 lands. The screen is the same screen either way; only where the articles come
from changes.

**An example.** You open the Post canvas. Under option 1 you press the pill, see a list of sample
articles, pick one without a picture, and watch the picture vanish from your design — you have tested the
thing the story exists for. Under option 2 you see a pill that says *Style-guide article*, and that is
all; whether picking a different one works is something you take on trust until Story 5.18.

This is the same shape as the decision you took at Story 5.11 (**R-158**), where you chose to prove the
design ring on sample designs rather than assert it and wait.

1. **Build the list now, over the sample publication (RECOMMENDED).** You can press the pill, search,
   pick, and see a page genuinely change shape — steps 4 to 10 of the test above are live. When Story
   5.18 connects your site, the same list fills with your own posts and nothing is rebuilt. Costs about a
   day more than option 2.
2. **Build only the pill now.** It names the article and the source honestly, and nothing is pressable
   until Story 5.18. Smallest story; the archives fix still lands. You would not see an article change
   until Story 5.18, and step 7 — the picture vanishing — could not be checked by hand at all.
3. **Move the whole story to after Story 5.18.** Nothing is half-built and the story is done once, with
   your real posts in the list. The Tag and Author canvases keep showing every post on the site in the
   meantime, which is wrong on its own terms and is not what the delay is for.

**Ruled: option 1 (owner, 2026-09-20).** *"Build the list now, over the sample publication."* Recorded as
**R-165**. D5e's picker is built in full over the bundled publication — the style-guide entry first, then the
feed's own posts with their dates and the **"has image"** words — and the per-canvas choice persists in
`project_template_prefs.preview_subject`. FR-D22's *"once a site is connected"* is read as naming where the
rows come from, not as a gate on the surface: Story 5.18 swaps the source and rebuilds nothing. Steps 4 to 10
of the owner's test are therefore live rather than conditional, and the media-guard claim is checked by hand
rather than asserted.

### Question 2 — the pill sits under your page. There is not quite enough room. What should give?

The grey area under the page card is **32 pixels** tall — you set it yourself at Story 5.7 (**R-139**),
after you found the size chip sitting on top of the page. The pill as drawn is **27 to 30 pixels** tall
(the two drawings differ), and the small gap it needs either side leaves it a pixel clear at best and a
pixel over at worst, at the tablet and phone sizes where the page fills the height. So as drawn it does
not reliably fit.

**An example.** You press `2` for the tablet view. The page card grows until it nearly fills the height.
The pill, pinned to the bottom, now has its top edge touching — or a pixel or two over — the bottom edge
of your design. That is exactly the thing you asked us to fix twice before.

1. **Make the pill a little smaller, and leave your page exactly as it is (RECOMMENDED).** 24 pixels
   instead of 27–30 — still comfortably pressable and above the accessibility floor for a target, and the
   same move the size chip already makes in the opposite corner, which is smaller than any drawing of it
   too. Your page card does not shrink by a single pixel at any size.
2. **Give the bottom a little more room** — about 40 pixels instead of 32. The pill stays exactly as
   drawn, and your page card gets slightly smaller at the tablet and phone sizes — the same trade you
   accepted at R-139. This would be the third time this strip of ground changes.
3. **Let the pill float over the bottom of your page**, as a caption sits on a photo. Closest to "it
   floats over the canvas", and it permanently covers a strip of whatever you are designing — which is
   the thing you ruled against in R-138.
4. **Put the pill in the top bar** instead, beside the template name. No crowding at all, and it stops
   being attached to the page it describes, which is why both drawings put it at the bottom.

**Ruled: option 1 (owner, 2026-09-20).** *"Make the pill a little smaller, and leave your page exactly as it
is."* Recorded as **R-166**. The pill is built at **24px** rather than B9's drawn 27–30px, so it clears the
page card inside R-139's existing 32px ground on every device; `py-8` does not move and no card loses a pixel
at any size. 24px is also above WCAG 2.5.8's target floor, and it is the same move `ViewportChip` already
makes in the opposite corner — a thing that lives in that ground is sized for the ground, not for a frame's
detail card. B9 governs the pill in every other respect: the dashed border, the grey dot, the words, the
radius and the type. `reconcile-designs-decisions.md` is the record of the one difference (R-74).
