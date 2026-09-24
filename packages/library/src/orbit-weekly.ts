// Orbit Weekly — the bundled sample publication and its three fixtures (FR-H3, Story 4.4).
//
// The data is `../orbit-weekly/`; this is the code half, the same `src/` + data split `ghost-shim`
// uses. Three things live here and nothing else:
//
//   1. THE LOADER. `dataset.json` references tags and authors by slug and stores no count; the rows
//      handed out here are hydrated into the Content API's own shape (`tags`, `authors`,
//      `primary_tag`, `primary_author`, `count.posts`) and every count is DERIVED from the feed.
//   2. THE FIXTURE ACCESSORS. The style-guide body is Ghost's own bytes, recorded per major by
//      `tools/probe/record-cards.py`; the comments fixture is drawn, because `{{comments}}` emits one
//      <script> and no DOM (MEASUREMENTS §15c), so there is no Ghost output to record.
//   3. `resolveSource(binding)` — the one mechanism that was missing. `expandRepeats` refuses a
//      declared `{{#get}}` key with no rows, and nothing evaluated a filter offline; this turns a
//      `DataBinding` into rows from the bundled data.
//
// Pure (AD-1): no `fetch`, no `fs`, no clock, no `Intl`, no locale-reading comparison. The JSON is
// imported, which is the only door a core package has to data.

import dataset from '../orbit-weekly/dataset.json' with { type: 'json' }
import corpus from '../orbit-weekly/corpus.json' with { type: 'json' }
import { CAPTURE_COMMAND, RECORDINGS } from '../orbit-weekly/fixtures/index.ts'
import type { DataBinding } from './registry.ts'
import { nativeResourceOf } from './placement.ts'
import { GET_SOURCES } from './vocabulary.ts'

/** The one value `previewSeed` has, and what it resolves to. */
export const ORBIT_WEEKLY_SEED = 'orbit-weekly'

/** The reserved origin every URL in the dataset and the corpus sits on (RFC 2606's `.example`, which
 *  no Ghost rewrites and no DNS answers). A consumer maps `${ORBIT_WEEKLY_ORIGIN}/images/…` to wherever
 *  it serves `orbit-weekly/images/`; the recorded bytes themselves are never edited. */
export const ORBIT_WEEKLY_ORIGIN = dataset.site.url

export const RECORDING_COMMAND = CAPTURE_COMMAND

export type Major = '5' | '6'
export const MAJORS: readonly Major[] = ['5', '6']

type Json = Readonly<Record<string, unknown>>
export type TagRow = Json & { id: string; slug: string; name: string; count: { posts: number } }
export type AuthorRow = Json & { id: string; slug: string; name: string; profile_image: string | null; count: { posts: number } }
export type PostRow = Json & {
  id: string
  slug: string
  title: string
  featured: boolean
  published_at: string
  visibility: string
  tags: TagRow[]
  authors: AuthorRow[]
  primary_tag: TagRow | null
  primary_author: AuthorRow | null
}

type RawPost = (typeof dataset.posts)[number]

function hydrate(raw: { tags: string[]; authors: string[] } & Json, feed: readonly RawPost[]): PostRow {
  const tags = raw.tags.map((s) => tagRow(s, feed))
  const authors = raw.authors.map((s) => authorRow(s, feed))
  return { ...raw, tags, authors, primary_tag: tags[0] ?? null, primary_author: authors[0] ?? null } as PostRow
}

function tagRow(slug: string, feed: readonly RawPost[]): TagRow {
  const t = dataset.tags.find((x) => x.slug === slug)
  if (t === undefined) throw new Error(`dataset.json: a post names tag "${slug}", which is not in tags[]`)
  return { ...t, count: { posts: feed.filter((p) => p.tags.includes(slug)).length } }
}

function authorRow(slug: string, feed: readonly RawPost[]): AuthorRow {
  const a = dataset.authors.find((x) => x.slug === slug)
  if (a === undefined) throw new Error(`dataset.json: a post names author "${slug}", which is not in authors[]`)
  return { ...a, count: { posts: feed.filter((p) => p.authors.includes(slug)).length } }
}

/** The feed, newest first as Ghost serves it. The three fixture subjects are NOT in it. */
export function posts(): PostRow[] {
  return sortRows(dataset.posts.map((p) => hydrate(p, dataset.posts)), DEFAULT_ORDER.posts)
}
export const tags = (): TagRow[] => dataset.tags.map((t) => tagRow(t.slug, dataset.posts))
export const authors = (): AuthorRow[] => dataset.authors.map((a) => authorRow(a.slug, dataset.posts))
export const tiers = (): Json[] => dataset.tiers
export const newsletters = (): Json[] => dataset.newsletters
export const site = () => dataset.site
export const brand = () => dataset.brand
export const postsPerPage = (): number => dataset.config.posts_per_page

/** The pagination context of page `n` over `total` rows, in the shape `paginationContext()` reads. `of` names the
 *  list in the refusal, because since Story 5.13 the rows can be an ARCHIVE's rather than the whole feed and a
 *  message about "the bundled feed" would be about the wrong list. */
function paginationOver(total: number, n: number, of: string): { page: number; pages: number; limit: number; total: number } {
  const limit = postsPerPage()
  const pages = Math.max(1, Math.ceil(total / limit))
  if (!Number.isInteger(n) || n < 1 || n > pages) throw new Error(`${of} has pages 1–${pages}; page ${n} does not exist`)
  return { page: n, pages, limit, total }
}

/** The pagination context of page `n` of the bundled feed, in the shape `paginationContext()` reads. */
export function feedPagination(n: number): { page: number; pages: number; limit: number; total: number } {
  return paginationOver(dataset.posts.length, n, 'the bundled feed')
}

/** The rows on page `n` of the feed. */
export function feedPage(n: number): PostRow[] {
  const { limit } = feedPagination(n)
  return posts().slice((n - 1) * limit, n * limit)
}

/** A pagination context DEEPER than the feed — for the pagination designs whose states need more pages
 *  than 52 posts make (a window with ellipses, a hundred-page re-centre). A pager reads only
 *  `pagination`, so the depth is carried here and no post is invented (reconcile-designs.md A34). */
export const deepPagination = (): { page: number; pages: number; limit: number; total: number } => dataset.pagination.deep

// ─── the preview subject (FR-D22, Story 5.13) ─────────────────────────────────
//
// A canvas that renders ONE resource has a subject whether or not anybody chose it, and until this story the choice
// was hard-coded and unsayable. Three things live here: the FIXTURE each file gets untouched, the RESOLUTION of a
// stored choice against rows that may have moved, and — below, on `templateContext` — the render itself.
//
// WHICH FILES HAVE ONE IS DERIVED, never listed: `placement.ts`'s `NATIVE` table already says which templates carry
// a singular resource, and `nativeResourceOf` is the one query over it, so a template added later is right by
// construction (standing rule 3, standing rule 4).

/** The four kinds `project_template_prefs.preview_subject` records. */
export type SubjectKind = 'post' | 'page' | 'tag' | 'author'

/** Story 5.18 — WHICH SOURCE a subject was chosen from: the bundled publication (`sample`) or the connected site
 *  (`site`). A subject stored before that story carries no mark and is the sample's. */
export type SourceName = 'sample' | 'site'

/** The stored column's own shape (`{kind, id, slug}`) minus the `id` nothing needs offline: a slug identifies a row
 *  in the bundled publication and in Ghost's Content API alike, and an id would only be a second name to keep true.
 *  Story 5.18: `source: 'site'` marks one chosen over the connected site (the column is `jsonb`, so no migration);
 *  an unmarked subject is the sample's, as every row written before that story is. */
export type Subject = { kind: SubjectKind; slug: string; source?: 'site' }

/**
 * STORY 5.18 — WHERE A SUBJECT, AND A LIST'S PAGES, ARE ANSWERED FROM. The bundled publication is `BUNDLED`, and it is
 * the DEFAULT of every function that takes one, so a call that names none is exactly the call it was before that
 * story (the control). The connected site's is built in `apps/web` from the rows the browser read (AD-10), because a
 * core package fetches nothing (AD-1).
 */
export type ContentSource = {
  /** the mark a subject chosen over this source carries */
  name: SourceName
  /** the subject a file starts on when nobody has chosen one, or null where the file renders no single resource */
  starting: (file: string) => Subject | null
  /** does a row this subject names exist in this source */
  has: (subject: Subject) => boolean
  /** how many pages the list `target` renders runs to — 1 where the target does not paginate */
  pages: (target: string, of?: Subject | null) => number
}

/** The preview subjects (FR-D22). `post` and `page` are HIDDEN ROWS — never in `posts`, so no feed, Source or count
 *  can reach them — while `tag` and `author` are SLUGS of rows that already exist, because an archive's posts come
 *  from the feed and a hidden taxonomy would render an empty archive (`dataset.json`'s note). The third fixture, the
 *  comments block, is drawn (`commentsFixture`) and has no subject row. Reachable only by name. */
export function subject(which: 'post' | 'page'): PostRow & Json
export function subject(which: 'tag'): TagRow
export function subject(which: 'author'): AuthorRow
export function subject(which: SubjectKind): (PostRow & Json) | TagRow | AuthorRow
export function subject(which: SubjectKind): (PostRow & Json) | TagRow | AuthorRow {
  if (which === 'tag') return tagRow(dataset.subjects.tag, dataset.posts)
  if (which === 'author') return authorRow(dataset.subjects.author, dataset.posts)
  return hydrate(dataset.subjects[which], dataset.posts)
}

/** The subject KIND a template's canvas carries, or null where it carries none — `nativeResourceOf` widened by the
 *  one distinction §3 draws that a RESOURCE cannot: `page.hbs` carries the same `post` object as `post.hbs` and is a
 *  different PRODUCT (§4.2), and their fixtures are two different rows. */
export const subjectKindOf = (file: string): SubjectKind | null => {
  const native = nativeResourceOf(file)
  return native === null ? null : native === 'post' && file === 'page.hbs' ? 'page' : native
}

/** The subject a canvas renders when nobody has chosen one: the style-guide post on `post.hbs`, the style-guide page
 *  on `page.hbs`, and the fixed Orbit Weekly tag and author on the archives. Null where the file has no subject. */
export function fixtureSubject(file: string): Subject | null {
  const kind = subjectKindOf(file)
  if (kind === null) return null
  return { kind, slug: kind === 'tag' || kind === 'author' ? dataset.subjects[kind] : subject(kind).slug }
}

/** Is there a row this subject names? The two hidden fixtures are reachable only through `subjects`, so they are
 *  tested there; every other subject must be in the source the canvas draws from. */
function subjectExists({ kind, slug }: Subject): boolean {
  if (kind === 'tag') return dataset.tags.some((t) => t.slug === slug)
  if (kind === 'author') return dataset.authors.some((a) => a.slug === slug)
  // a PAGE has no feed: a post's slug stored under `page` names no page (review, 2026-09-21)
  if (kind === 'page') return slug === dataset.subjects.page.slug
  return slug === dataset.subjects[kind].slug || dataset.posts.some((p) => p.slug === slug)
}

/** The post or page row a subject names: the hidden fixture when it is the fixture's own slug, otherwise the feed's
 *  row. A slug no row holds answers the FIXTURE rather than nothing — `resolveSubject` is the guard, and a render
 *  door that emptied the canvas behind it would break FR-D22's "never empties the canvas" by construction. */
const postOf = (kind: 'post' | 'page', slug: string): PostRow & Json => {
  if (slug === dataset.subjects[kind].slug) return subject(kind)
  const row = dataset.posts.find((p) => p.slug === slug)
  return row === undefined ? subject(kind) : (hydrate(row, dataset.posts) as PostRow & Json)
}

/** The taxonomy row a subject names, falling back to the fixture for the same reason `postOf` does. */
const subjectRow = (kind: 'tag' | 'author', slug: string): TagRow | AuthorRow => {
  const known = kind === 'tag' ? dataset.tags.some((t) => t.slug === slug) : dataset.authors.some((a) => a.slug === slug)
  const use = known ? slug : dataset.subjects[kind]
  return kind === 'tag' ? tagRow(use, dataset.posts) : authorRow(use, dataset.posts)
}

/** The bundled publication as a `ContentSource` — every function that takes one defaults to it. */
export const BUNDLED: ContentSource = {
  name: 'sample',
  starting: (file) => fixtureSubject(file),
  has: (subject) => subjectExists(subject),
  pages: (target, of) => {
    const list = listOf(target, of)
    return list === null ? 1 : paginationOver(list.rows.length, 1, list.of).pages
  },
}

/**
 * WHICH SUBJECT IS THIS CANVAS ACTUALLY RENDERING, AND DID THE STORED ONE SURVIVE (FR-D22).
 *
 * PURE, and separate from `templateContext` on purpose: that function returns a render context and has no way to
 * report *"the one you asked for is gone"*. Splitting the resolution out keeps its return shape unchanged for its
 * three existing callers, gives the pill one honest answer to print, and makes the fallback a unit test rather than
 * a browser observation.
 *
 * A stored subject of the wrong KIND for this file, or naming a slug no row holds, falls back to the fixture with
 * `fellBack: true`. It is never emptied and the stored value is never deleted by the fallback — a resource that
 * comes back brings the choice back with it.
 *
 * STORY 5.18 — `source` is where the rows are answered from, the bundled publication by default. A subject belongs to
 * the source it was chosen from: one stored with the OTHER source's mark renders this source's own starting subject
 * SILENTLY (`fellBack: false`) and is kept for when its source returns — "no longer there" is said only where the
 * subject's own source answered and does not hold it (FR-D22).
 */
export function resolveSubject(file: string, stored?: Subject | null, source: ContentSource = BUNDLED): { subject: Subject | null; fellBack: boolean } {
  const fixture = source.starting(file)
  if (fixture === null || stored === undefined || stored === null) return { subject: fixture, fellBack: false }
  if ((stored.source ?? 'sample') !== source.name) return { subject: fixture, fellBack: false }
  if (stored.kind !== fixture.kind || typeof stored.slug !== 'string' || !source.has(stored)) {
    return { subject: fixture, fellBack: true }
  }
  return { subject: stored, fellBack: false }
}

// ─── what a template hands a section (Story 4.10) ───────────────────────────────

/** The four feed states a paginated pilot is reviewed at: the first page, a true middle page, the last, and a feed
 *  with nothing in it — and, since Story 5.16, `second`: PAGE 2 of the list the target renders, which is what the
 *  editor's page-2 preview paints (FR-D21, D5d). It is its own state and not `middle`, which is page 3 of the bundled
 *  feed's five; `/pilots`, the snapshots and the render matrix keep the four they always reviewed. */
export type FeedState = 'first' | 'second' | 'middle' | 'last' | 'empty'

/** THE PAGE'S OWN ADDRESS, Ghost's rule (`meta/paginated-url.js:15-36`, identical on 5.130.6 and 6.58.0): page 1 is
 *  the list's own address and page n is `page/n/` beneath it — so `/page/2/` on the home feed and
 *  `/tag/field-notes/page/2/` on an archive. The shim's `pageUrl` is the same rule for a pager's links; this package
 *  cannot import the shim (the shim depends on it), so `orbit-weekly.test.ts` holds the two to one answer. */
const addressOf = (n: number, base: string): string => (n <= 1 ? base : `${base}page/${n}/`)

/** The list a paginated template renders, and the address it sits at: an ARCHIVE with its subject renders that tag's
 *  or writer's own posts under `/tag/<slug>/` or `/author/<slug>/` (§3: the taxonomy object at the root, `posts` and
 *  `pagination` flat beside it), and every other paginated render is the whole bundled feed under `/`. Null where the
 *  target does not paginate. ONE implementation for `templateContext` and `feedPages`, so the pages a render draws and
 *  the pages the editor offers can never disagree. */
function listOf(target: string, of?: Subject | null): {
  rows: PostRow[]
  base: string
  of: string
  taxonomy?: { kind: 'tag' | 'author'; row: TagRow | AuthorRow }
} | null {
  if (!['home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs'].includes(target)) return null
  if ((target === 'tag.hbs' || target === 'author.hbs') && of != null && of.kind === (target === 'tag.hbs' ? 'tag' : 'author')) {
    const kind = of.kind as 'tag' | 'author'
    // the ROW decides the slug, so an unknown one filters against the fixture it fell back to rather than against
    // itself — which would draw the fixture's name over an empty archive
    const row = subjectRow(kind, of.slug)
    return {
      rows: posts().filter((p) => (kind === 'tag' ? p.tags : p.authors).some((r) => r.slug === row.slug)),
      base: `/${kind}/${row.slug}/`,
      of: `the ${kind} "${row.slug}"`,
      taxonomy: { kind, row },
    }
  }
  return { rows: posts(), base: '/', of: 'the bundled feed' }
}

/** HOW MANY PAGES the list `target` renders has — the one question the editor asks before it offers page 2 (R-176:
 *  where Ghost serves no page 2 there is no page 2 to offer). 1 on a target that does not paginate. Derived from the
 *  same rows `templateContext` renders, never a count kept beside them. Story 5.18: asked of the source in force —
 *  the bundled publication by default, the connected site's own count when that is what the canvas renders. */
export function feedPages(target: string, of?: Subject | null, source: ContentSource = BUNDLED): number {
  return source.pages(target, of)
}

/** A list page's pagination, in the shape `paginationContext()` reads. */
export type Pagination = { page: number; pages: number; limit: number; total: number }

/** STORY 5.18 — THE PIECES A TEMPLATE HANDS A SECTION, from whichever source answered them: `@site` (the dataset's own
 *  `site`, or the connected site's settings through the editor's whitelist, whose keys are the same), `@config`'s page
 *  size, the post or page `post.hbs` and `page.hbs` open, and a list template's page. */
export type Pieces = {
  site: Json
  postsPerPage: number
  /** the post or page, spread FLAT — §3a's wrapper is the shim's, not this context's */
  entry?: Json
  /** a list page's own rows and pagination, the address it is based on, and an archive's taxonomy row */
  list?: { rows: readonly Json[]; pagination: Pagination; base: string; taxonomy?: { kind: 'tag' | 'author'; row: Json } }
}

/** DW-230 — the 404's own address: Ghost renders `error.hbs` at the path that missed, which no menu item names, so the
 *  canvas hands the header one that matches no link rather than `/` (which marked Home as the page you are on). */
export const MISSED_ADDRESS = '/404/'

/** An absolute URL's path — the relative address Ghost matches a menu item against (`utils.js:61`). */
const addressFrom = (url: unknown): string =>
  typeof url === 'string' ? url.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i, '').replace(/[?#].*$/, '') || '/' : '/'

/**
 * STORY 5.18 — THE ONE ASSEMBLY. `templateContext` hands it the bundled publication and the editor hands it the
 * connected site's rows, so the two can never drift: `@site` and `@config` everywhere; the post or page spread flat on
 * `post.hbs` and `page.hbs`; a list's taxonomy, `posts` and `pagination` flat beside it (§3); and THE PAGE'S OWN
 * ADDRESS — a list page's (`addressOf`, DW-218), a post's or page's own URL, and the 404's missed path (DW-230) —
 * which is what `{{navigation}}` marks the current item against.
 */
export function assemble(target: string, p: Pieces): {
  ghost: Record<string, unknown>
  site: { url: string; navigation: Json[]; pagination?: Json; paginationBase?: string; currentUrl: string }
} {
  const ghost: Record<string, unknown> = { '@site': p.site, '@config': { posts_per_page: p.postsPerPage } }
  const address = p.entry !== undefined ? addressFrom(p.entry['url']) : target === 'error.hbs' ? MISSED_ADDRESS : '/'
  const base = { url: p.site['url'] as string, navigation: p.site['navigation'] as Json[], currentUrl: address }
  if (p.entry !== undefined) return { ghost: { ...ghost, ...p.entry }, site: base }
  if (p.list === undefined) return { ghost, site: base }
  const { rows, pagination, base: at, taxonomy } = p.list
  return {
    ghost: { ...ghost, ...(taxonomy === undefined ? {} : { [taxonomy.kind]: taxonomy.row }), posts: rows, pagination },
    site: { ...base, pagination, paginationBase: at, currentUrl: addressOf(pagination.page, at) },
  }
}

/** Orbit Weekly as a template hands it to a section on `target`, in `RenderInput`'s shape: `ghost` is the render
 *  context (`@site` everywhere; the feed page and its `pagination` on a paginated template; the style-guide post or
 *  page inside the block post.hbs and page.hbs open), and `site` is what the shim needs to imitate the connected
 *  site. One copy for the snapshot check and the pilots review page, so the two render against the same publication.
 *  The member counts are FR-H5's sample, as on any unlinked project.
 *
 *  STORY 5.13 — `of` IS THE PREVIEW SUBJECT (FR-D22), and it is OPTIONAL on purpose. Passing nothing is exactly
 *  today's render, which is why `/pilots`, `tools/check-snapshots.mjs` (NFR-6(c1)) and the render matrix are
 *  untouched and is the story's control. Passing one names the post or page the entry templates render, or the tag
 *  or author whose ARCHIVE the list templates render — and an archive is the one place the argument changes more
 *  than a row: without it, `tag.hbs` and `author.hbs` are handed the WHOLE bundled feed, which is a page Ghost
 *  would never serve. The subject is expected to have come through `resolveSubject`; a slug no row holds still
 *  answers the fixture here rather than an empty canvas.
 *
 *  STORY 5.16 — `second` IS PAGE 2 of the list the target renders: the bundled feed's page 2 on `home.hbs` and
 *  `index.hbs`, and an archive's own page 2 on `tag.hbs` and `author.hbs` with a subject. It THROWS where that list has
 *  one page, because past the last page Ghost answers 404 (`routing/controllers/channel.js:55-60`, R-176): the caller
 *  asks `feedPages` first. AND THE PAGE KNOWS ITS ADDRESS (DW-218): `currentUrl` is Ghost's own on every page of a
 *  list — `/`, `/page/2/`, `/tag/<slug>/`, `/tag/<slug>/page/2/` — and an archive's pager is based on the archive,
 *  never on `/`. Since Story 5.18 (DW-230) Post and Page carry their subject's own address and the 404 one no link
 *  matches; every other target keeps `/`.
 *
 *  STORY 5.18 — the pieces are assembled by `assemble`, the one function the connected site's rows go through too. */
export function templateContext(target: string, feed: FeedState = 'first', of?: Subject | null): ReturnType<typeof assemble> {
  const pieces: Pieces = { site: dataset.site, postsPerPage: postsPerPage() }
  if (target === 'post.hbs' || target === 'page.hbs') {
    const kind = target === 'post.hbs' ? 'post' : 'page'
    // THE DEFAULT IS TODAY'S RENDER, BYTE FOR BYTE (the story's control): no subject passed is the hard-coded
    // fixture `/pilots`, `check-snapshots` and the render matrix have always drawn.
    const row = of === undefined || of === null || of.kind !== kind ? subject(kind) : postOf(kind, of.slug)
    return assemble(target, { ...pieces, entry: row })
  }
  // AN ARCHIVE RENDERS ITS OWN POSTS (§3: the taxonomy object at the root, `posts` and `pagination` flat beside it).
  // Until Story 5.13 `tag.hbs` and `author.hbs` were handed the WHOLE bundled feed — the same rows `home.hbs` gets —
  // so the canvas drew a page Ghost would never serve. FR-D22's subject IS the filter, which is why the fix arrives
  // with it and not as an extra. `listOf` is that filter, and `feedPages` reads the same one.
  const list = listOf(target, of)
  if (list === null) return assemble(target, pieces)
  const pages = paginationOver(list.rows.length, 1, list.of).pages
  const n = feed === 'middle' ? Math.ceil(pages / 2) : feed === 'last' ? pages : feed === 'second' ? 2 : 1
  const pagination = feed === 'empty'
    ? { page: 1, pages: 1, limit: postsPerPage(), total: 0 }
    : paginationOver(list.rows.length, n, list.of)
  const rows = feed === 'empty' ? [] : list.rows.slice((n - 1) * pagination.limit, n * pagination.limit)
  return assemble(target, { ...pieces, list: { rows, pagination, base: list.base, taxonomy: list.taxonomy } })
}

// ─── resolveSource ────────────────────────────────────────────────────────────

type Source = (typeof GET_SOURCES)[number]

/** Ghost's own default ORDER when a `{{#get}}` names none. Each one is asserted against the order the
 *  Content API returned with no `order` passed, on both majors (`capture.json`), never restated. */
export const DEFAULT_ORDER: Readonly<Record<Source, string>> = {
  posts: 'published_at desc',
  tags: 'name asc',
  authors: 'name asc',
  tiers: 'monthly_price asc',
}

/** Ghost's own default LIMIT, asserted the same way. Tiers are not paginated: every tier comes back. */
export const DEFAULT_LIMIT: Readonly<Record<Source, number | 'all'>> = { posts: 15, tags: 15, authors: 15, tiers: 'all' }

function rowsOf(source: string): Json[] {
  switch (source) {
    case 'posts':
      return posts()
    case 'tags':
      return tags()
    case 'authors':
      return authors()
    case 'tiers':
      return tiers()
    default:
      throw new Error(`"${source}" is not a {{#get}} source — the Sources are ${GET_SOURCES.join(' · ')}`)
  }
}

/** NQL field → the row values it matches. `tag:x` and `authors:x` match ANY of the post's tags or
 *  authors, which is what lets every writer's archive fill while a card keeps one byline. */
const FIELDS: Readonly<Record<Source, Readonly<Record<string, (r: Json) => readonly unknown[]>>>> = {
  posts: {
    id: (r) => [r['id']],
    slug: (r) => [r['slug']],
    featured: (r) => [r['featured']],
    visibility: (r) => [r['visibility']],
    tag: (r) => (r['tags'] as TagRow[]).map((t) => t.slug),
    tags: (r) => (r['tags'] as TagRow[]).map((t) => t.slug),
    primary_tag: (r) => [(r['primary_tag'] as TagRow | null)?.slug],
    author: (r) => (r['authors'] as AuthorRow[]).map((a) => a.slug),
    authors: (r) => (r['authors'] as AuthorRow[]).map((a) => a.slug),
    primary_author: (r) => [(r['primary_author'] as AuthorRow | null)?.slug],
  },
  tags: { id: (r) => [r['id']], slug: (r) => [r['slug']], visibility: (r) => [r['visibility']] },
  authors: { id: (r) => [r['id']], slug: (r) => [r['slug']] },
  tiers: { id: (r) => [r['id']], slug: (r) => [r['slug']], type: (r) => [r['type']], visibility: (r) => [r['visibility']], active: (r) => [r['active']] },
}

/** Splits at `sep` outside `[…]` and quotes. */
function splitTop(s: string, sep: string): string[] {
  const out: string[] = []
  let depth = 0
  let quote = ''
  let start = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (quote !== '') {
      if (c === quote) quote = ''
    } else if (c === "'" || c === '"') quote = c
    else if (c === '[') depth++
    else if (c === ']') depth--
    else if (c === sep && depth === 0) {
      out.push(s.slice(start, i))
      start = i + 1
    }
  }
  out.push(s.slice(start))
  return out
}

const unquote = (v: string): string => v.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1')
const literal = (v: string): unknown => (v === 'true' ? true : v === 'false' ? false : v === 'null' ? null : unquote(v))

/** One NQL filter as a predicate. The grammar evaluated is the part a Data-group Source composes:
 *  `field:value`, `field:-value`, `field:[a,b]`, `field:-[a,b]`, joined by `+`. Anything else — `,`
 *  (or), parentheses, `>`/`<`/`~` — REFUSES by name, because a filter the canvas guesses at renders a
 *  plausible wrong set, which is worse than a named refusal. */
function predicate(source: Source, filter: string): (r: Json) => boolean {
  if (/[()]/.test(filter) || splitTop(filter, ',').length > 1) {
    throw new Error(`resolveSource cannot evaluate "${filter}" offline — "," and parentheses are not in the grammar the Data group composes (field:value joined by +)`)
  }
  const clauses = splitTop(filter, '+').map((clause) => {
    const m = /^([a-z_]+):(-?)(.+)$/.exec(clause.trim())
    if (m === null || /^[<>~]/.test(m[3])) {
      throw new Error(`resolveSource cannot evaluate the clause "${clause}" of "${filter}" — only field:value, field:-value and field:[a,b] are evaluated offline`)
    }
    const [, field, not, rawValue] = m
    const read = FIELDS[source][field]
    if (read === undefined) {
      throw new Error(`"${field}" is not a field resolveSource evaluates on ${source} — known: ${Object.keys(FIELDS[source]).join(' · ')}`)
    }
    const wanted = rawValue.startsWith('[') && rawValue.endsWith(']')
      ? splitTop(rawValue.slice(1, -1), ',').map((v) => literal(v.trim()))
      : [literal(rawValue)]
    return (r: Json) => read(r).some((v) => wanted.includes(v)) !== (not === '-')
  })
  return (r) => clauses.every((c) => c(r))
}

/** Ordered comparison with no locale: `localeCompare` reads the host (AD-1). A null sorts first
 *  ascending, as the recorded tiers show the price-less Free tier leading. */
function compare(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a === null || a === undefined) return -1
  if (b === null || b === undefined) return 1
  return a < b ? -1 : a > b ? 1 : 0
}

/** Sorts by an NQL `order` — `field asc|desc`, comma-separated. Stable. */
export function sortRows<T extends Json>(rows: readonly T[], order: string): T[] {
  const keys = order.split(',').map((part) => {
    const m = /^\s*([a-z_]+)(?:\s+(asc|desc))?\s*$/i.exec(part)
    if (m === null) throw new Error(`order "${order}" is not "field asc|desc[, …]"`)
    return { field: m[1], dir: (m[2] ?? 'asc').toLowerCase() === 'desc' ? -1 : 1 }
  })
  return rows
    .map((row, i) => ({ row, i }))
    .sort((x, y) => {
      for (const k of keys) {
        const c = compare(x.row[k.field], y.row[k.field]) * k.dir
        if (c !== 0) return c
      }
      return x.i - y.i
    })
    .map((x) => x.row)
}

/** A `DataBinding` (`registry.ts`) → the rows it names, from the bundled data. A filter that matches
 *  nothing is `[]` — an empty Source is a legitimate answer and the design draws its own empty state.
 *  Hand-picked `ids` come back in the PICKED order (R-20), and an id that is not in the source is
 *  skipped, as Ghost's per-id `{{#get}}` would render nothing for it. The fixture subjects are in no
 *  source, by construction: they are not in the rows this reads. */
export function resolveSource(binding: DataBinding): Json[] {
  const source = binding.source as Source
  const rows = rowsOf(binding.source)
  if (binding.ids !== undefined) {
    return binding.ids.flatMap((id) => rows.filter((r) => r['id'] === id))
  }
  const matched = binding.filter === undefined ? rows : rows.filter(predicate(source, binding.filter))
  const ordered = sortRows(matched, binding.order ?? DEFAULT_ORDER[source])
  const limit = binding.limit ?? DEFAULT_LIMIT[source]
  return limit === 'all' ? ordered : ordered.slice(0, limit)
}

/** What `previewSeed` resolves to. One seed exists; any other value refuses by name. */
export function resolvePreviewSeed(seed: string): { resolveSource: typeof resolveSource; fixtures: typeof previewFixtures } {
  if (seed !== ORBIT_WEEKLY_SEED) {
    throw new Error(`previewSeed "${seed}" resolves to nothing — the only bundled dataset is "${ORBIT_WEEKLY_SEED}" (FR-H3)`)
  }
  return { resolveSource, fixtures: previewFixtures }
}

// ─── the recorded fixtures ────────────────────────────────────────────────────

export type Block = { id: string | null; html: string }
export type Variant = { id: string; card: string; label: string; root: string; expect: string[] }
export type Recording = 'article' | 'variations' | 'page' | 'capture'

/** One recording, or a failure naming the fixture and the capture command. It never returns undefined
 *  and never falls back to the other major (standing rule 2, `contract.test.ts`'s pattern). */
export function recording(major: Major, which: Recording): Json {
  const rec = RECORDINGS[`ghost${major}`]?.[which]
  if (rec === undefined) {
    throw new Error(
      `NO RECORDING — orbit-weekly/fixtures/ghost${major}/${which}.json is absent. Capture it: ${CAPTURE_COMMAND}. ` +
        `A fixture with no recording FAILS; it never falls back to the other major and never renders empty.`,
    )
  }
  return rec as Json
}

export const blocks = (major: Major, which: 'article' | 'variations' | 'page'): Block[] =>
  recording(major, which)['blocks'] as Block[]

/** Every variant in the corpus, in declared order — the variation sheet's labels and what each exists
 *  to carry. The node itself is the recorder's input and is not handed out. */
export const variants = (): Variant[] => corpus.variants.map(({ id, card, label, root, expect }) => ({ id, card, label, root, expect }))

/** The article's card references, in C4's order (text blocks are `null`). */
export const articleOrder = (): (string | null)[] => corpus.article.map((x) => (typeof x === 'string' ? x : null))

/** Fixture 1 — `{{content}}` on the canvas: C4's article, Ghost's bytes for that major. */
export const styleGuideBody = (major: Major): string => blocks(major, 'article').map((b) => b.html).join('')

/** Fixture 3's body — the same article created as a Ghost PAGE, as that major printed it. */
export const styleGuidePageBody = (major: Major): string => blocks(major, 'page').map((b) => b.html).join('')

// ─── fixture 2: the comments block, drawn ─────────────────────────────────────

export type CommentsState = 'member' | 'signedout'
type Comment = (typeof dataset.comments)[number]

/** Every comment in the fixture, replies included — the number the count header states. */
export const commentCount = (): number => dataset.comments.reduce((n, c) => n + 1 + c.replies.length, 0)
export const commentThreads = (): number => dataset.comments.length

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// `a28-kit.js:91-139`'s GHOST light palette and face, at its .72 opacity inside a dashed outline —
// Ghost's colours, not the pack's, because the theme styles nothing inside `{{comments}}`.
const G = { text: '#15171A', muted: '#626D79', border: '#E1E3E6', field: '#FFFFFF', chip: '#F1F3F4', accent: '#15171A' }
const FONT = "'Inter',-apple-system,sans-serif"

const avatar = (ini: string, size: number) =>
  `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${G.chip};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:${FONT};font-size:${Math.round(size * 0.36)}px;font-weight:600;color:${G.muted}">${esc(ini)}</span>`

function drawComment(c: Comment | Comment['replies'][number], depth: number): string {
  const replies = (c.replies as Comment[]).map((r) => drawComment(r, depth + 1)).join('')
  return `<div style="display:flex;gap:12px;align-items:flex-start;${depth > 0 ? 'padding-left:52px;' : ''}">${avatar(c.member.initials, depth > 0 ? 32 : 40)}` +
    `<div style="display:flex;flex-direction:column;gap:5px;min-width:0">` +
    `<div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-family:${FONT}"><span style="font-size:15px;font-weight:600;color:${G.text}">${esc(c.member.name)}</span><span style="font-size:13px;color:${G.muted}">${esc(c.when)}</span></div>` +
    `<div style="font-family:${FONT};font-size:15px;line-height:1.55;color:${G.text};overflow-wrap:anywhere">${esc(c.html)}</div>` +
    `<div style="display:flex;gap:16px;font-family:${FONT};font-size:13px;color:${G.muted};padding-top:2px"><span>♡ ${c.likes}</span><span>Reply</span></div>` +
    `</div></div>${replies}`
}

/** Fixture 2 — what `{{comments}}` stands for on the canvas. Drawn, never recorded: Ghost emits one
 *  `<script>` from jsDelivr and no DOM (MEASUREMENTS §15c), so nothing a theme writes reaches inside and
 *  there is no server output to snapshot. The count and thread shape are FR-H3's. */
export function commentsFixture(state: CommentsState = 'member'): string {
  const site = dataset.site.title
  const head = state === 'member'
    ? `<div style="display:flex;gap:12px;align-items:center">${avatar('RM', 40)}<div style="flex:1;min-width:0;height:44px;border:1px solid ${G.border};border-radius:6px;background:${G.field};display:flex;align-items:center;padding:0 14px;font-family:${FONT};font-size:15px;color:${G.muted}">Join the discussion</div></div>`
    : `<div style="border:1px solid ${G.border};border-radius:6px;padding:20px 22px;display:flex;flex-direction:column;gap:10px;align-items:flex-start">` +
      `<span style="font-family:${FONT};font-size:16px;font-weight:600;color:${G.text}">Become a member of ${esc(site)} to start commenting</span>` +
      `<span style="font-family:${FONT};font-size:14px;color:${G.muted}">Ghost draws this prompt, its wording and its buttons.</span>` +
      `<div style="display:flex;gap:10px;padding-top:4px;flex-wrap:wrap"><span style="font-family:${FONT};font-size:14px;font-weight:600;color:#FFFFFF;background:${G.accent};padding:9px 16px;border-radius:5px">Sign up</span><span style="font-family:${FONT};font-size:14px;font-weight:600;color:${G.text};border:1px solid ${G.border};padding:8px 15px;border-radius:5px">Sign in</span></div></div>`
  const label = `<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.02em;color:${G.muted}"><span>GHOST COMMENTS BLOCK · ${state === 'member' ? 'SIGNED IN' : 'SIGNED OUT'}</span><span>GHOST'S COLOURS AND TYPE · THE THEME STYLES NOTHING INSIDE THIS OUTLINE</span></div>`
  return `<div data-inflozo-fixture="comments" data-state="${state}" style="border:1px dashed ${G.border};border-radius:8px;padding:16px 18px 20px;display:flex;flex-direction:column;gap:18px;opacity:.72;box-sizing:border-box">` +
    label + head + dataset.comments.map((c) => drawComment(c, 0)).join('') + `</div>`
}

/** `RenderInput.fixtures` for an unlinked project: the two strings `bareHelper` resolves. */
export function previewFixtures(major: Major = '6'): { content: string; comments: string } {
  return { content: styleGuideBody(major), comments: commentsFixture('member') }
}

// ─── the simulated cards.min.css ──────────────────────────────────────────────

/** FR-Q7's exclude list, derived from the cards the user designed: a designed card excludes its own
 *  chunk, and designing "the header card" excludes BOTH `header` and `header_v2`, which Ghost treats
 *  as separate names (research-ghost-koenig-cards.md §2.3). A designed card with no chunk (image,
 *  embed, code) contributes nothing — there is nothing of Ghost's to exclude. */
export function cardAssetsExclude(chunks: readonly string[], designed: readonly string[]): string[] {
  const want = new Set(designed.flatMap((c) => (c === 'header' || c === 'header_v2' ? ['header', 'header_v2'] : [c])))
  return chunks.filter((c) => want.has(c))
}

/** The chunks the simulated `cards.min.css` carries: exactly the complement of the exclude list, in
 *  Ghost's own build order (filenames, sorted — `scripts/build-card-assets.mjs`). */
export function simulatedChunks(chunks: readonly string[], designed: readonly string[]): string[] {
  const out = new Set(cardAssetsExclude(chunks, designed))
  return [...chunks].sort((a, b) => compare(a, b)).filter((c) => !out.has(c))
}
