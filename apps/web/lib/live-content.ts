/* ─────────────────────────────────────────── Story 5.18 — LIVE CONTENT FROM THE CONNECTED SITE, AS DATA.
 *
 * FR-H4 and AD-10: the browser reads the linked site's Content API DIRECTLY, with the key the project's site row holds
 * and `Accept-Version: v5.0` — no server route reads or proxies content (`admin-rule.ts:164`). Everything that decides
 * a read and is not the fetch itself lives here: which reads a page needs, each read's cache key, how fresh a key is,
 * what a status means, when reading STOPS, the whitelist every answer passes, the site's wall-clock date, the panel's
 * shortfall note, R-193's starting archive and every sentence the pill, the SOURCE group and `#editor-said` say.
 * `lib/live-client.ts` is the one caller that fetches, and it reads every decision from here.
 *
 * PURE AND IMPORTLESS BUT FOR TYPES, as `lib/lock.ts` is and for its reason: `node --test` reaches it
 * (`live-content.test.ts`, the I/O matrix as unit tests), and so does the deployed walk, which reads its expectations
 * from here rather than restating them (R-170, standing rule 4).
 *
 * EXECUTED BEFORE A LINE WAS WRITTEN (MEASUREMENTS §51, both majors): the Content API is CORS-open on every route and
 * on a 401 and a 429; `Cache-Control: public, max-age=0`, so the 60 s cache is ours; `formats=mobiledoc` is "no body"
 * while `reading_time` and `excerpt` are still computed; a missing slug and a page past the last are `200 []`, never a
 * 404; `order=count.posts desc` works; `filter=id:[…]` answers in Ghost's order, not the pick's; and GHOST LIMITS
 * FAILED REQUESTS PER NETWORK, NOT KEYS — 100 failures and even the real key is refused for an hour, the customer's own
 * site search included. That last fact is the whole failure policy below.
 */

import type { DataBinding, orbitWeekly } from '@inflozo/library'

type Subject = orbitWeekly.Subject
type Kind = orbitWeekly.SubjectKind
type ContentSource = orbitWeekly.ContentSource
type Pieces = orbitWeekly.Pieces
type Pagination = orbitWeekly.Pagination

/** A row as the canvas reads it — whitelisted, never Ghost's own object. */
export type Row = Readonly<Record<string, unknown>>

/* ── THE TUNING (they tune, like §AD4's lock timings; the comparisons below do not) ─────────────────────────────── */

/** `content-check.ts:40`'s pin: the shape of the Content API both majors serve. */
export const API_VERSION = 'v5.0'
/** A key read in the last minute is served from memory with no request. */
export const FRESH_MS = 60_000
/** Is an answer that landed at `at` still fresh at `now`? A stale one is still SHOWN — and revalidated once. */
export const isFresh = (at: number, now: number): boolean => now - at < FRESH_MS
/** Ghost's own per-`{{#get}}` budget (`appendix-b1-template-contexts.md` §5): no answer in 5 s is a failed read. */
export const READ_TIMEOUT_MS = 5_000
/** Failed reads in a row that stop reading. */
export const FAILURES_TO_STOP = 3
/** Reads one editor session may make. The deployed walk records what a full walk costs — the evidence it is generous. */
export const REQUEST_CEILING = 500
/** The rows in hand: Ghost 6 answers at most 100 a page (MEASUREMENTS §15d), and a `{{#get}}`'s Count ceiling is 100. */
export const LIST_LIMIT = 100

/* ── THE READS ──────────────────────────────────────────────────────────────────────────────────────────────── */

export type Resource = 'settings' | 'posts' | 'pages' | 'tags' | 'authors' | 'tiers'
export type LiveQuery = { resource: Resource; params: Readonly<Record<string, string>> }

/** NEVER THE BODY (FR-H4, NFR-3): a post or a page is asked for with `formats=mobiledoc`, which Ghost's Content API
 *  strips to NO format while still computing `reading_time` and `excerpt` (§51). The whitelist below is the floor
 *  under it: a future Ghost that ignored `formats` would cost bytes, never a body on the canvas. */
const read = (resource: Resource, params: Record<string, string> = {}): LiveQuery => ({
  resource,
  params: resource === 'posts' || resource === 'pages' ? { ...params, formats: 'mobiledoc' } : params,
})

/** One key per read, shared by every consumer — the canvas, the picker's cards, the ring's tiles, D5e and the Link
 *  Picker. It carries no key: the cache belongs to one session over one site. */
export const keyOf = (q: LiveQuery): string =>
  `${q.resource}/?${Object.keys(q.params).sort().map((k) => `${k}=${q.params[k]}`).join('&')}`

/** The request's address. It CARRIES THE KEY, so it is built at the fetch and never logged or printed (NFR-3). */
export const addressOf = (origin: string, q: LiveQuery, key: string): string =>
  `${origin}/ghost/api/content/${q.resource}/?${new URLSearchParams({ ...q.params, key })}`

/** `@site`: the site's settings. */
export const SETTINGS = read('settings')

/** THE LISTS IN HAND — D5e's subject rows, the Link Picker's search and R-193's starting archive: the newest 100 posts,
 *  and pages, tags and writers to 100 each, the fullest archives first. Search stays CLIENT-SIDE over these (DW-248):
 *  a term Ghost cannot parse is a 4xx, and every 4xx counts against the customer's own network. */
export const LISTS: Readonly<Record<Kind, LiveQuery>> = {
  post: read('posts', { limit: String(LIST_LIMIT) }),
  page: read('pages', { limit: String(LIST_LIMIT) }),
  tag: read('tags', { limit: String(LIST_LIMIT), include: 'count.posts', order: 'count.posts desc' }),
  author: read('authors', { limit: String(LIST_LIMIT), include: 'count.posts', order: 'count.posts desc' }),
}

/** A slug in Ghost's own shape — lowercase letters of any script, digits and single hyphens, as `slugify` leaves one.
 *  Anything else is NEVER SENT: a filter Ghost cannot parse is a 4xx that counts against the customer's network, so a
 *  stored slug that is not one of Ghost's is treated as gone. */
export const slugShaped = (slug: unknown): slug is string =>
  typeof slug === 'string' && slug.length <= 191 && /^[\p{Ll}\p{Lo}\p{Nd}_]+(?:-[\p{Ll}\p{Lo}\p{Nd}_]+)*$/u.test(slug)

/** Ghost's own id shape, the only one `filter=id:[…]` is ever sent with. */
const ID = /^[0-9a-f]{24}$/

/** A subject by `filter=slug:'…'` — a BROWSE, so a missing one is `200 []` and never a 404 (§51). Null for a slug not
 *  in Ghost's shape, which is never sent. */
export function subjectRead(s: Subject): LiveQuery | null {
  if (!slugShaped(s.slug)) return null
  const filter = `slug:'${s.slug}'`
  if (s.kind === 'post') return read('posts', { filter, include: 'tags,authors' })
  if (s.kind === 'page') return read('pages', { filter, include: 'tags,authors' })
  return read(s.kind === 'tag' ? 'tags' : 'authors', { filter, include: 'count.posts' })
}

/** A LIST PAGE, as Ghost serves it: page `n` of Home's feed, or of a tag's or a writer's archive, `perPage` rows newest
 *  first with their tags and writers. Past the last page Ghost answers `200 []` (§51), so the offer of a page 2 is
 *  decided by page 1's count alone. */
export function feedRead(of: { kind: 'tag' | 'author'; slug: string } | null, page: number, perPage: number): LiveQuery | null {
  if (of !== null && !slugShaped(of.slug)) return null
  return read('posts', {
    ...(of === null ? {} : { filter: `${of.kind === 'tag' ? 'tags' : 'authors'}:'${of.slug}'` }),
    include: 'tags,authors',
    limit: String(perPage),
    page: String(page),
  })
}

const INCLUDE: Partial<Record<Resource, string>> = { posts: 'tags,authors', tags: 'count.posts', authors: 'count.posts', tiers: 'monthly_price,yearly_price,benefits' }

/** A `{{#get}}` binding's reads, both halves of `DesignRows` — so `shownRows` is still the one slicer and an edit's
 *  repaint reads nothing. A hand-picked list is ONE `filter=id:[…]` read (R-20: re-ordered by the pick, since Ghost
 *  answers in its own order); a fixed query is its own number and order; anything else is read at the Count's ceiling,
 *  in both date orders where the panel offers Order, so a Count or an Order changed later is a slice of rows in hand.
 *  `null` halves read nothing and answer `[]` — a pick with no id in Ghost's shape, or a source Ghost has not got. */
export function bindingReads(b: DataBinding): { newest: LiveQuery | null; oldest: LiveQuery | null } {
  const resource = b.source as Resource
  if (!Object.hasOwn(INCLUDE, resource)) return { newest: null, oldest: null }
  const include = { include: INCLUDE[resource] as string }
  if (b.ids !== undefined) {
    const ids = b.ids.filter((id) => ID.test(id))
    const one = ids.length === 0 ? null : read(resource, { ...include, filter: `id:[${ids.join(',')}]`, limit: String(LIST_LIMIT) })
    return { newest: one, oldest: one }
  }
  const filter: Record<string, string> = b.filter === undefined ? {} : { filter: b.filter }
  const at = (limit: number | undefined, order: string | undefined) =>
    read(resource, { ...include, ...filter, ...(limit === undefined ? {} : { limit: String(limit) }), ...(order === undefined ? {} : { order }) })
  if (b.fixed === true) {
    const one = at(b.limit, b.order)
    return { newest: one, oldest: one }
  }
  const dated = resource === 'posts' && (b.order === undefined || b.order === 'published_at desc' || b.order === 'published_at asc')
  if (!dated) {
    const one = at(LIST_LIMIT, b.order)
    return { newest: one, oldest: one }
  }
  return { newest: at(LIST_LIMIT, 'published_at desc'), oldest: at(LIST_LIMIT, 'published_at asc') }
}

/* ── WHAT A STATUS MEANS, AND WHEN READING STOPS ────────────────────────────────────────────────────────────────
 *
 * Ghost counts every failed Content API request against the caller's network and, after 99, refuses EVERY key from it
 * for at least an hour — the brute check runs before authentication (§51). So a refusal is never retried, a 429 stops
 * reading at once, three failures in a row stop it, and a session has a ceiling. Choosing the site in the SOURCE group
 * is the one "try again" — never after a refused key or the ceiling, which a reload alone starts over. */

/** Why the canvas is showing sample content although the site was chosen. */
export type Cause = 'unanswered' | 'failing' | 'refused' | 'wait' | 'ceiling'

/** 0 is a network error or a read that did not answer in time. */
export type Outcome = 'ok' | 'refused' | 'wait' | 'failed'
export const outcomeOf = (status: number): Outcome =>
  status >= 200 && status < 300 ? 'ok' : status === 401 || status === 403 ? 'refused' : status === 429 ? 'wait' : 'failed'

/** The session's reading, as the stop rule sees it. `last` is the most recent failure's cause, cleared by an answer. */
export type Reading = { requests: number; failures: number; stopped: Cause | null; last: Cause | null }
export const START: Reading = { requests: 0, failures: 0, stopped: null, last: null }

/** May a read go out now? At the ceiling it may not — and asking is what stops reading. */
export function ask(r: Reading): { go: boolean; reading: Reading } {
  if (r.stopped !== null) return { go: false, reading: r }
  if (r.requests >= REQUEST_CEILING) return { go: false, reading: { ...r, stopped: 'ceiling', last: 'ceiling' } }
  return { go: true, reading: { ...r, requests: r.requests + 1 } }
}

/** A read's outcome. An answer clears the run of failures; a refusal or a 429 stops at once; the third failure in a
 *  row stops — one or two are "not answering", silently. */
export function after(r: Reading, o: Outcome): Reading {
  if (o === 'ok') return { ...r, failures: 0, last: null }
  if (o === 'refused') return { ...r, failures: r.failures + 1, stopped: 'refused', last: 'refused' }
  if (o === 'wait') return { ...r, failures: r.failures + 1, stopped: 'wait', last: 'wait' }
  const failures = r.failures + 1
  return failures >= FAILURES_TO_STOP ? { ...r, failures, stopped: 'failing', last: 'failing' } : { ...r, failures, last: 'unanswered' }
}

/** Can choosing the site try again? Never after a refused key (it would only be refused again, and Ghost counts it) or
 *  at the ceiling (a reload starts a new session). */
export const retriable = (cause: Cause | null): boolean => cause !== 'refused' && cause !== 'ceiling'

/** Choosing the site: the one "try again" — the reads that page needs, once each. */
export const retried = (r: Reading): Reading =>
  r.stopped !== null && retriable(r.stopped) ? { ...r, stopped: null, failures: 0, last: null } : r.stopped === null ? { ...r, last: null } : r

/** The named tier: every cause but one silent failure is said aloud, once (FR-H4's split). */
export const named = (cause: Cause | null): boolean => cause !== null && cause !== 'unanswered'

/* ── THE WHITELIST ──────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Every answer is mapped to the dataset's own row shapes (`orbit-weekly/dataset.json`, which `live-content.test.ts`
 * holds these lists to) BEFORE it is cached, so nothing else Ghost sends is stored, rendered or logged. §51 found that
 * a post and a page carry a code-injection head and foot of their OWN, beside the site's on `/settings/` (§38b) —
 * which is why the whitelist, not the request, is the guard. Those keys are named in ONE source file in this app,
 * `lib/probe-rule.ts` (`server-wiring.test.ts` holds it so): an allowlist drops them without ever naming them. */

/** `@site` — exactly what the canvas reads of it. */
export const SITE_FIELDS = [
  'accent_color', 'allow_self_signup', 'comments_enabled', 'cover_image', 'description', 'icon', 'locale', 'logo',
  'members_enabled', 'navigation', 'paid_members_enabled', 'secondary_navigation', 'timezone', 'title', 'url',
] as const
const ENTRY = [
  'id', 'slug', 'title', 'url', 'excerpt', 'custom_excerpt', 'feature_image', 'feature_image_alt', 'feature_image_caption',
  'published_at', 'updated_at', 'created_at', 'reading_time', 'visibility', 'access',
] as const
export const POST_FIELDS = [...ENTRY, 'featured', 'comment_count'] as const
export const PAGE_FIELDS = [...ENTRY, 'show_title_and_feature_image'] as const
export const TAG_FIELDS = ['id', 'name', 'slug', 'description', 'feature_image', 'accent_color', 'visibility', 'url'] as const
export const AUTHOR_FIELDS = ['id', 'name', 'slug', 'bio', 'location', 'website', 'profile_image', 'cover_image', 'url'] as const
export const TIER_FIELDS = [
  'id', 'name', 'slug', 'type', 'description', 'active', 'visibility', 'monthly_price', 'yearly_price', 'currency',
  'benefits', 'trial_days',
] as const
/** NEVER copied, whatever a future Ghost sends: the body, in every format Ghost has. The allowlist above already copies
 *  none of them; this is the floor under it should one ever be added to a list by mistake. */
export const NEVER: readonly string[] = ['html', 'plaintext', 'lexical', 'mobiledoc']

type Obj = Record<string, unknown>
const objectOf = (v: unknown): Obj => (v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {})

const copy = (raw: unknown, fields: readonly string[]): Obj => {
  const from = objectOf(raw)
  const out: Obj = {}
  for (const f of fields) if (Object.hasOwn(from, f) && !NEVER.includes(f)) out[f] = from[f]
  return out
}

/** A menu's items as `{{navigation}}` reads them — a label and an address, both strings, and nothing else. */
const menu = (items: unknown): { label: string; url: string }[] =>
  Array.isArray(items)
    ? items.flatMap((i) => (typeof objectOf(i)['label'] === 'string' && typeof objectOf(i)['url'] === 'string' ? [{ label: objectOf(i)['label'] as string, url: objectOf(i)['url'] as string }] : []))
    : []

const taxonomy = (fields: readonly string[]) => (raw: unknown): Row => {
  const posts = objectOf(objectOf(raw)['count'])['posts']
  return { ...copy(raw, fields), ...(typeof posts === 'number' ? { count: { posts } } : {}) }
}
const tagRow = taxonomy(TAG_FIELDS)
const authorRow = taxonomy(AUTHOR_FIELDS)

/** A post or a page. `feature_image_caption` is the one field Ghost stores as HTML (§31a): it is reduced to its words
 *  by `words` — an inert `DOMParser` document in the browser (`lib/inline.ts`'s `readMarks` precedent) — so markup
 *  never reaches a row, let alone the canvas. */
const entryRow = (fields: readonly string[], words: (html: string) => string) => (raw: unknown): Row => {
  const r = objectOf(raw)
  const caption = r['feature_image_caption']
  const tags = Array.isArray(r['tags']) ? r['tags'].map(tagRow) : []
  const authors = Array.isArray(r['authors']) ? r['authors'].map(authorRow) : []
  return {
    ...copy(r, fields),
    ...(Object.hasOwn(r, 'feature_image_caption') ? { feature_image_caption: typeof caption === 'string' && caption !== '' ? words(caption) : null } : {}),
    tags,
    authors,
    primary_tag: r['primary_tag'] ? tagRow(r['primary_tag']) : (tags[0] ?? null),
    primary_author: r['primary_author'] ? authorRow(r['primary_author']) : (authors[0] ?? null),
  }
}

/** What a read answers, whitelisted: its rows, and the list's size as Ghost counts it (`meta.pagination`). */
export type Answer = { rows: readonly Row[]; total: number; pages: number }

/** A Content API body → an `Answer`, or null for a body that is not the shape asked for (a failed read). */
export function pick(resource: Resource, body: unknown, words: (html: string) => string): Answer | null {
  const b = objectOf(body)
  if (resource === 'settings') {
    const s = b['settings']
    if (s === null || typeof s !== 'object' || Array.isArray(s)) return null
    const site = copy(s, SITE_FIELDS)
    return { rows: [{ ...site, navigation: menu(site['navigation']), secondary_navigation: menu(site['secondary_navigation']) }], total: 1, pages: 1 }
  }
  const list = b[resource]
  if (!Array.isArray(list)) return null
  const meta = objectOf(objectOf(b['meta'])['pagination'])
  const map =
    resource === 'posts' ? entryRow(POST_FIELDS, words)
    : resource === 'pages' ? entryRow(PAGE_FIELDS, words)
    : resource === 'tags' ? tagRow
    : resource === 'authors' ? authorRow
    : (raw: unknown): Row => copy(raw, TIER_FIELDS)
  return {
    rows: list.map(map),
    total: typeof meta['total'] === 'number' ? meta['total'] : list.length,
    pages: typeof meta['pages'] === 'number' ? Math.max(1, meta['pages']) : 1,
  }
}

/* ── DW-98: THE SITE'S OWN CLOCK ────────────────────────────────────────────────────────────────────────────────
 *
 * Ghost prints a date in the SITE's time zone and the shim formats in UTC (`ghost-shim`:158-161, AD-1 bans `Intl`
 * there). So every live timestamp is handed over already moved to the site's wall clock — `Intl`, which AD-1 allows in
 * `apps/web` — and the shim and every design print what Ghost prints, `datetime` attributes included (Ghost formats
 * those in the site's zone too). Per value, at its own instant, because one offset is wrong across a DST boundary
 * inside a single page of posts.
 * ponytail: the one token that cannot follow is `Z`, which keeps printing `+00:00`; no design uses it. */
const clocks = new Map<string, Intl.DateTimeFormat>()
export function wallClock(iso: unknown, zone: string): unknown {
  if (typeof iso !== 'string') return iso
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return iso
  let parts: Intl.DateTimeFormatPart[]
  try {
    // one formatter per zone: a page of posts carries three timestamps each, and a formatter is not cheap to make
    let clock = clocks.get(zone)
    if (clock === undefined) {
      clock = new Intl.DateTimeFormat('en-US', {
        timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
      clocks.set(zone, clock)
    }
    parts = clock.formatToParts(at)
  } catch {
    // a zone this browser does not know: the UTC instant, which is what the canvas printed before
    return iso
  }
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}.${String(at.getUTCMilliseconds()).padStart(3, '0')}Z`
}

const DATED = ['published_at', 'updated_at', 'created_at'] as const
/** A post or a page on the site's clock. */
export const onClock = (row: Row, zone: string): Row => {
  const out: Obj = { ...row }
  for (const f of DATED) if (Object.hasOwn(row, f)) out[f] = wallClock(row[f], zone)
  return out
}

/* ── R-193 ────────────────────────────────────────────────────────────────────────────────────────────────────── */

const countOf = (r: Row) => {
  const n = objectOf(r['count'])['posts']
  return typeof n === 'number' ? n : 0
}
const nameOf = (r: Row) => (typeof r['name'] === 'string' ? r['name'] : '')

/** R-193 (owner, 2026-09-24): an untouched archive on the site's own content starts on the tag or writer with the MOST
 *  posts, a tie going to the name first in the alphabet. Null where the site has none — and then that page previews
 *  the sample's, and says why. */
export function startingArchive(rows: readonly Row[]): Row | null {
  let best: Row | null = null
  for (const r of rows) {
    if (best === null || countOf(r) > countOf(best) || (countOf(r) === countOf(best) && nameOf(r).localeCompare(nameOf(best), 'en', { sensitivity: 'base' }) < 0)) best = r
  }
  return best
}

/* ── ONE PAGE'S CONTENT, FROM THE ROWS IN HAND ──────────────────────────────────────────────────────────────────
 *
 * A READER over the cache records every read it was asked for and did not have, so ONE walk says both what a render
 * needs and, once nothing is missing, what it is. A render is ONE SOURCE THROUGHOUT: the editor paints the site's
 * content only when a walk misses nothing, and otherwise the whole page is sample content. */

export type Look = (q: LiveQuery) => Answer | undefined
export type Reader = { got: (q: LiveQuery | null) => Answer | undefined; need: LiveQuery[] }

export function reader(look: Look): Reader {
  const need: LiveQuery[] = []
  const got = (q: LiveQuery | null) => {
    if (q === null) return undefined
    const a = look(q)
    if (a === undefined && !need.some((n) => keyOf(n) === keyOf(q))) need.push(q)
    return a
  }
  return { got, need }
}

/** What one canvas needs to know, as the editor knows it. */
export type Want = {
  /** the kind of subject the canvas carries (`orbitWeekly.subjectKindOf`), or null */
  kind: Kind | null
  /** the style-guide post and page — the entry Post and Page lead with on either source, and render with the site's
   *  own header and footer around them (the body is always the style-guide fixture, FR-H4) */
  styleGuide: Readonly<Record<'post' | 'page', Row>>
  /** `@config.posts_per_page`: the dataset's for both sources until Story 5.19 */
  perPage: number
}

const LIST_FILES = ['home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs']
const archiveOf = (target: string, of: Subject | null | undefined) =>
  (target === 'tag.hbs' || target === 'author.hbs') && of != null && of.kind === (target === 'tag.hbs' ? 'tag' : 'author') && slugShaped(of.slug)
    ? { kind: of.kind as 'tag' | 'author', slug: of.slug }
    : null

/** THE SITE AS A `ContentSource`, for the library's own `resolveSubject` and `feedPages` and `lib/page-two.ts`: the
 *  style-guide entry first on Post and Page, R-193's archive on Tag and Author, a subject that exists where its
 *  `filter=slug:` read answered a row, and a list's pages as page 1's count says. */
export function siteSource(w: Want, r: Reader): ContentSource {
  return {
    name: 'site',
    // the canvas's own kind: `Want.kind` is `subjectKindOf` of the very file `resolveSubject` asks about
    starting: () => {
      if (w.kind === 'post' || w.kind === 'page') return { kind: w.kind, slug: w.styleGuide[w.kind]['slug'] as string, source: 'site' }
      if (w.kind === 'tag' || w.kind === 'author') {
        const first = startingArchive(r.got(LISTS[w.kind])?.rows ?? [])
        return first === null ? null : { kind: w.kind, slug: first['slug'] as string, source: 'site' }
      }
      return null
    },
    has: (s) => {
      if ((s.kind === 'post' || s.kind === 'page') && s.slug === w.styleGuide[s.kind]['slug']) return true
      const q = subjectRead(s)
      if (q === null) return false
      const a = r.got(q)
      // not in hand yet: the walk has recorded the read, and a walk that needs one is never painted from
      return a === undefined || a.rows.length > 0
    },
    pages: (target, of) => {
      if (!LIST_FILES.includes(target)) return 1
      const archive = archiveOf(target, of)
      if ((target === 'tag.hbs' || target === 'author.hbs') && archive === null) return 1
      return r.got(feedRead(archive, 1, w.perPage))?.pages ?? 1
    },
  }
}

/** THE PIECES the library's `assemble` turns into a render context, for one target on one page: `@site` everywhere; the
 *  subject's own row on Post and Page; a list page's rows, pagination and taxonomy on Home, a tag and a writer. Dates
 *  on the site's clock (DW-98). */
export function sitePieces(w: Want, subject: Subject | null, target: string, page: 1 | 2, r: Reader): Pieces {
  const settings = r.got(SETTINGS)?.rows[0] ?? {}
  const zone = typeof settings['timezone'] === 'string' ? settings['timezone'] : 'Etc/UTC'
  const base: Pieces = { site: settings, postsPerPage: w.perPage }
  if ((target === 'post.hbs' || target === 'page.hbs') && subject !== null && (subject.kind === 'post' || subject.kind === 'page')) {
    const fixture = w.styleGuide[subject.kind]
    if (subject.slug === fixture['slug']) return { ...base, entry: fixture }
    const row = r.got(subjectRead(subject))?.rows[0]
    return { ...base, entry: row === undefined ? fixture : onClock(row, zone) }
  }
  if (!LIST_FILES.includes(target)) return base
  const archive = archiveOf(target, subject)
  if ((target === 'tag.hbs' || target === 'author.hbs') && archive === null) return base
  const at = r.got(feedRead(archive, page, w.perPage))
  const pagination: Pagination = { page, pages: at?.pages ?? 1, limit: w.perPage, total: at?.total ?? 0 }
  const rows = (at?.rows ?? []).map((p) => onClock(p, zone))
  if (archive === null) return { ...base, list: { rows, pagination, base: '/' } }
  // the archive's own row: its `filter=slug:` read where one was made, or the list's
  const own = r.got(LISTS[archive.kind])?.rows.find((t) => t['slug'] === archive.slug)
  const row = own ?? r.got(subjectRead({ kind: archive.kind, slug: archive.slug }))?.rows[0] ?? { slug: archive.slug }
  return { ...base, list: { rows, pagination, base: `/${archive.kind}/${archive.slug}/`, taxonomy: { kind: archive.kind, row } } }
}

/** A design's `{{#get}}` rows from the site, in `DesignRows`' shape — or undefined while any read is missing. A
 *  hand-picked list comes back in the PICKED order (R-20); an id Ghost does not hold is skipped, as its own per-id
 *  `{{#get}}` would render nothing. */
export function siteRows(
  bindings: Readonly<Record<string, DataBinding>> | undefined,
  r: Reader,
  zone: string,
): Record<string, { newest: readonly Row[]; oldest: readonly Row[] }> {
  const out: Record<string, { newest: readonly Row[]; oldest: readonly Row[] }> = {}
  for (const [key, b] of Object.entries(bindings ?? {})) {
    const reads = bindingReads(b)
    const half = (q: LiveQuery | null): readonly Row[] => {
      const rows = (q === null ? [] : (r.got(q)?.rows ?? [])).map((row) => (b.source === 'posts' ? onClock(row, zone) : row))
      return b.ids === undefined ? rows : b.ids.flatMap((id) => rows.filter((row) => row['id'] === id))
    }
    out[key] = { newest: half(reads.newest), oldest: half(reads.oldest) }
  }
  return out
}

/** How many rows a binding's query holds on the site — its `meta.pagination.total`, or what came back for a pick. */
export function siteTotal(b: DataBinding, r: Reader): number {
  const q = bindingReads(b).newest
  if (q === null) return 0
  const a = r.got(q)
  if (a === undefined) return 0
  return b.ids === undefined ? a.total : b.ids.filter((id) => a.rows.some((row) => row['id'] === id)).length
}

/* ── THE WORDS — `{site}` is the site's ONE name (R-170): the title `/settings/` reports, which is also the `@site.title`
 *    the canvas prints; before that has answered, and for a site that cannot be read, `sites.title` (or its host). ── */

/** A number the owner reads as a word, where the table writes it as one — derived, never restated (standing rule 4). */
const inWords = (n: number) => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] ?? String(n)
const plural = (n: number, noun: string) => `${n} ${n === 1 ? noun.replace(/s$/, '') : noun}`

export type Unreadable = 'disconnected' | 'no_key' | 'http'

/** THE LINKED SITE AS SERVER TRUTH (`read.ts`): readable — its admin origin, the one the key was verified against, and
 *  its Content API key, delivered on purpose (FR-C3: `sites.content_key` is browser-safe by Ghost's design) — or
 *  unreadable with its reason, where no read is ever attempted; null where no site is linked. `title` is the site's
 *  name until `/settings/` answers: `sites.title`, or its host where that is empty. */
export type EditorSite = { title: string; origin: string; key: string } | { title: string; unreadable: Unreadable } | null

/** A `sites` row → `EditorSite`. Disconnected first (Story 3.5 nulls the key and keeps the link, so that is the reason,
 *  not the missing key); then no key; then a plain `http:` address, which an https page cannot read (mixed content,
 *  and the CSP admits no `http:`). An address that does not normalise is no site at all. */
export function siteFrom(
  row: { url?: unknown; title?: unknown; content_key?: unknown; disconnected_at?: unknown },
  origin: (url: string) => string | null,
  host: (url: string) => string,
): EditorSite {
  const url = typeof row.url === 'string' ? row.url.trim() : ''
  const title = typeof row.title === 'string' && row.title.trim() !== '' ? row.title.trim() : host(url)
  if (row.disconnected_at !== null && row.disconnected_at !== undefined) return { title, unreadable: 'disconnected' }
  if (typeof row.content_key !== 'string' || row.content_key.trim() === '') return { title, unreadable: 'no_key' }
  if (/^http:\/\//i.test(url)) return { title, unreadable: 'http' }
  const at = origin(url)
  return at === null ? null : { title, origin: at, key: row.content_key.trim() }
}

export const LIVE_WORDS = {
  /** B9's pill, the source half — `SOURCE_WORDS.lead` is 5.13's "Previewing with:" */
  sample: 'Sample content',
  /** D5e's group heading */
  heading: 'SOURCE',
  /** the pill's cause, after "Sample content · " — one failure and three name the same thing to the eye */
  cause: (cause: Cause, site: string): string =>
    cause === 'refused' ? 'key refused' : cause === 'wait' ? `${site} asked us to wait` : cause === 'ceiling' ? 'paused for this session' : `${site} not answering`,
  /** the site row's sentence after a failure — and, for the named tier, what `#editor-said` says once */
  sentence: (cause: Cause, site: string): string => {
    switch (cause) {
      case 'unanswered':
        return `${site} didn't answer, so this page is showing sample content. Choose ${site} to try again.`
      case 'failing':
        return `${site} hasn't answered ${inWords(FAILURES_TO_STOP)} times in a row, so Inflozo has stopped asking for now and this page is showing sample content. Choose ${site} to try again.`
      case 'refused':
        return `${site} doesn't recognise the Content API key Inflozo has for it, so this page is showing sample content. Update the key in Sites, under Manage keys.`
      case 'wait':
        return `${site} is turning requests away because it has had too many, so this page is showing sample content. This usually clears within an hour; choose ${site} to try again.`
      case 'ceiling':
        return `Inflozo has asked ${site} for content ${REQUEST_CEILING} times since you opened this project and has stopped, so it never floods your site. Reload the page to start again; until then this page is showing sample content.`
    }
  },
  /** the site row, greyed with its reason (UX-DR3's could-but-not-now) */
  unreadable: (why: Unreadable, site: string): string =>
    why === 'disconnected' ? `Inflozo is no longer connected to ${site}. Reconnect it from Sites to preview with its content.`
    : why === 'no_key' ? `Inflozo has no Content API key for ${site}. Add one in Sites, under Manage keys.`
    : `${site}'s address starts with http://, and a browser won't read it from Inflozo's secure page.`,
  /** a Tag or Author page on a site with none of its own */
  nothing: (kind: 'tag' | 'author', site: string): string => `${site} has no ${kind}s yet, so this page is previewing a sample ${kind}.`,
  /** D5e and the Link Picker, where the site holds more posts than the rows in hand (DW-248) */
  capped: `Showing your newest ${LIST_LIMIT} posts.`,
  pasteOlder: "Paste an older post's address to link it.",
  /** `#editor-said`, polite */
  showing: (site: string): string => `Previewing with ${site}.`,
  showingSample: 'Previewing with sample content.',
  /** R-98: the row a read is in flight for says so, until its paint lands */
  loading: (what: string): string => `Loading ${what}…`,
  /** R-194: the panel note's button — the pill's own Sample content row, a second door */
  toSample: 'Preview with sample content',
} as const

/** THE PANEL'S NOTE (P0:488-490 puts the zero note in the panel, and no frame draws the rest), for a list the section
 *  cannot fill. `{m}` is the limit the section asked for. */
export const SHORTFALL = {
  /** a `{{#get}}` list short of its limit, or empty — `resource` is the binding's own, singular at 1 */
  get: (n: number, resource: string, m: number): string =>
    n === 0 ? `This site has no ${resource} for this section yet.` : `This site has ${plural(n, resource)} for this section; it shows up to ${m}.`,
  /** the main feed, where the whole list fits one page and does not fill it — a short page 2 is ordinary pagination */
  feed: (whose: 'site' | 'tag' | 'author', n: number, m: number): string =>
    n === 0 ? `This ${whose} has no posts yet, so this section shows its empty state.` : `This ${whose} has ${plural(n, 'posts')}; this section shows up to ${m} per page.`,
} as const

/** The main feed's note, or null where it has none: only a list that fits one page and does not fill it. */
export function feedShortfall(whose: 'site' | 'tag' | 'author', total: number, pages: number, perPage: number): string | null {
  return pages <= 1 && total < perPage ? SHORTFALL.feed(whose, total, perPage) : null
}

/** A `{{#get}}` binding's note, or null where it is full. `limit` is what the section asked for after its stored Count. */
export function getShortfall(source: string, total: number, limit: number): string | null {
  return total < limit ? SHORTFALL.get(total, source, limit) : null
}

/** The Link Picker's rows in hand, in `linkResources()`'s own shape — dates on the site's clock, as the stored day. */
export function siteLinks(r: Reader, zone: string): {
  pages: { id: string; title: string; url: string; meta: string }[]
  posts: { id: string; title: string; url: string; meta: string }[]
  tags: { id: string; title: string; url: string; meta: string }[]
  authors: { id: string; title: string; url: string; meta: string }[]
  capped?: string
} {
  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  const day = (row: Row) => str(wallClock(row['published_at'], zone)).slice(0, 10)
  const entries = (a: Answer | undefined) => (a?.rows ?? []).map((p) => ({ id: str(p['id']), title: str(p['title']), url: str(p['url']), meta: day(p) }))
  const taxa = (a: Answer | undefined) => (a?.rows ?? []).map((t) => ({ id: str(t['id']), title: str(t['name']), url: str(t['url']), meta: plural(countOf(t), 'posts') }))
  const posts = r.got(LISTS.post)
  return {
    pages: entries(r.got(LISTS.page)),
    posts: entries(posts),
    tags: taxa(r.got(LISTS.tag)),
    authors: taxa(r.got(LISTS.author)),
    ...(posts !== undefined && posts.total > posts.rows.length ? { capped: `${LIVE_WORDS.capped} ${LIVE_WORDS.pasteOlder}` } : {}),
  }
}
