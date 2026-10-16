// STORY 7.16a — THE ROUTES MANAGER'S RULES, AS DATA IN ONE PLACE (FR-I2, FR-I3; AD-34's pattern, `custom-settings.ts`'s
// shape). The Routes page and its server actions read it, and so will Story 7.16b (custom canvases), 7.17 (the upload) and
// 7.18 (Pre-flight and `compileTheme`'s `routed`, through `routedOf`). Pure and deterministic (AD-1, AD-14): no clock, no
// `Intl`, no locale reader — the naming rule's lowercase is `toLowerCase`, never `toLocaleLowerCase`.
//
// WHAT IS HERE: the config's grammar (`parseRoutesConfig`, zod — AD-6: what is stored is parsed on read), the filter
// builder (`filterNql`) and its OWN reader (`readNql`), the index collection's inverse (`indexFilter`), the emitter
// (`routesYaml`), the validator (`validateRoutes`, every problem on its YAML line), the naming rule (`templateName`, §7.4),
// the files a route names (`routedOf`) and the addresses Ghost keeps for itself (`RESERVED_SEGMENTS`).
//
// THE FACTS IT RESTS ON (read in Ghost 6.58.0's and 5.130.6's source at Story 7.16's Create, 2026-10-16; the spec's F1–F7):
//   - THE INDEX COLLECTION GOES LAST, carrying the inverse of every collection's filter. Collections register in YAML order
//     (`router-manager.js:126-130`) and the FIRST whose filter matches owns the post (`lazy-url-service.js:300-303`; Ghost 5
//     `UrlGenerator.js:158-191`); a listing drops the posts it does not own (`controllers/collection.js:75-88`), and Ghost's
//     own comment there tells authors to invert their filters so each listing loads only its own posts (`:65-74`). Ghost's
//     default `/` — no filter — placed first owns every post, so nothing reaches a later collection; the inverse filter is
//     what keeps `/` off every collection's posts whatever its place, and emitting it LAST is the second guard (a post two
//     collections match still goes to the first of YOURS). S9a's drawing lists `/` first, the one behaviour this build does
//     not copy (`EXPERIENCE.md:747`'s "always first" was marked "not executed"; MEASUREMENTS §82 executes it on T1).
//   - GHOST WRAPS EVERY FILTER as `(${filter})+type:post` (`serializers/input/posts.js:130`; 5: `:134`), and NQL reads
//     `((tag:'news'))` as `{"yg":{"tag":"news"}}`, which drops to an unfiltered query with no error (F4). So no group is
//     ever the sole content of another, no filter is one group wrapped whole, a one-child group is flattened, and the
//     reader below refuses each of those on the emitted string.
//   - A RELATIVE DATE tracks the clock in a channel's listing, but a collection's ownership filter is compiled once and
//     cached (`lazy-url-service.js:131-139`), so R-246 (owner, 2026-10-16) keeps rolling dates to channels.
//   - `limit:` is read for collections and channels and overrides `@config.posts_per_page` for that route
//     (`controllers/collection.js:31-49`, `channel.js:31-51`); Ghost bounds none of it (F3), so 1–100 is
//     `POSTS_PER_PAGE`'s, Inflozo's own.
//   - Ghost's parser checks no duplicate path, no collision, no NQL and no template (`route-settings-parser.js`, F6), so
//     every one of those is checked here, before anything is stored.
//
// AD-36 — `routes.yaml` IS A SINK. The emitter writes only values that passed this file's grammars: one-segment paths
// (`PATH_RE`), `CUSTOM_TARGET_RE` templates, `GHOST_SLUG_RE` slugs, whole limits within `POSTS_PER_PAGE`. NQL values are
// always single-quoted (an unquoted one-letter value fails to lex inside a group, and `tag:true` would read as a boolean —
// F4), except booleans, `null` and relative terms; every `filter:` is a double-quoted YAML scalar that can never hold `"`
// or `\`, and the emitter asserts it.
//
// NO THIRD-PARTY NQL PARSER IS A RUNTIME DEPENDENCY (FR-I2): `readNql` reads this builder's own grammar and nothing else.
// Ghost's `@tryghost/nql` (both majors' pins) is a devDependency, so `routes.test.ts` holds the two in agreement.

import { z } from 'zod'
import { CUSTOM_TARGET_RE, GHOST_SLUG_RE, SURFACES } from '@inflozo/library'
import { POSTS_PER_PAGE } from './custom-settings.ts'

// zod's eval probe is refused by the app's CSP; the Routes page imports this module directly (`/routes`), not through the
// runtime's index, so it sets `jitless` itself before its first schema (`doc-schema.ts`'s reason; `apps/web`'s
// `routes-jitless.test.ts` is the control)
z.config({ jitless: true })

/* ───────────────────────────────────────────── the model ───────────────────────────────────────────── */

/** The fields S9c's picker offers, in its order, each with the NQL key it writes. */
export const SLUG_FIELDS = ['tag', 'author', 'primary_tag', 'primary_author'] as const
export type SlugField = (typeof SLUG_FIELDS)[number]
/** FR-I2's visibilities — Ghost's `tiers` (specific tiers) is not offered (routine call 12). */
export const VISIBILITIES = ['public', 'members', 'paid'] as const
export type Visibility = (typeof VISIBILITIES)[number]
export const DATE_OPS = ['>', '>=', '<', '<='] as const
export type DateOp = (typeof DATE_OPS)[number]
/** NQL's relative units Inflozo offers (Ghost also reads h, m and s — F2). */
export const DATE_UNITS = ['d', 'w', 'M', 'y'] as const
export type DateUnit = (typeof DATE_UNITS)[number]

export type Cond =
  | { field: SlugField; op: 'any' | 'none'; values: string[] }
  | { field: 'visibility'; op: 'any' | 'none'; values: Visibility[] }
  | { field: 'featured' | 'feature_image'; is: boolean }
  | { field: 'published_at'; op: DateOp; at: { ago: number; unit: DateUnit } | { date: string } }
export type Filter = { match: 'all' | 'any'; conditions: Cond[] }
export type Collection = { path: string; filter: Filter; template: string; limit?: number }
export type StaticRoute = { path: string; template: string }
export type Channel = { path: string; channel: Filter; template: string; limit?: number }
export type Route = StaticRoute | Channel
/** The config `routes_config.config` stores. Array order is precedence: a post belongs to the first collection it matches. */
export type RoutesConfig = {
  collections: Collection[]
  routes: Route[]
  /** each taxonomy's first segment — `tag` and `author` by default (`default-routes.yaml:8-10`) */
  taxonomies: { tag: string; author: string }
}

export const isChannel = (route: Route): route is Channel => 'channel' in route

export const DEFAULT_TAXONOMIES = { tag: 'tag', author: 'author' } as const
export const EMPTY_ROUTES: RoutesConfig = { collections: [], routes: [], taxonomies: { ...DEFAULT_TAXONOMIES } }

/* ───────────────────────────────────────────── the grammars ───────────────────────────────────────────── */

/** ONE segment between slashes (routine call 4): two paths would otherwise share a context name — `/blog/news/` and
 *  `/blognews/` both give `blognews` (`collection-router.js:21`, `static-routes-router.js:19`, F5). */
export const PATH_RE = /^\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/
const SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
/** A relative term's reach — `now-1d` to `now-999y`; NQL itself reads any digits (F2). */
export const AGO = { min: 1, max: 999 } as const
/** Ghost's `posts.custom_template` is a string of at most 100 (`schema.js:96`, F7) and stores the name without `.hbs`. */
const TEMPLATE_STEM_MAX = 100
/** The display name's own cap, the layer name's (§7.4). */
export const NAME_MAX = 60

/** A calendar date, checked by arithmetic alone (AD-1: no `Date`). */
export function isCalendarDate(s: string): boolean {
  const m = DATE_RE.exec(s)
  if (m === null) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1]
  // 9998 at most, so the day after any stored date still has four digits (`dayAfter`)
  return days !== undefined && y >= 1970 && y <= 9998 && d >= 1 && d <= days
}

/** The calendar day after `date` (`YYYY-MM-DD`), by arithmetic alone (AD-1): month and year ends and 29 February. */
export function dayAfter(date: string): string {
  const m = DATE_RE.exec(date)
  if (m === null || !isCalendarDate(date)) throw new Error(`not a calendar date: ${JSON.stringify(date)}`)
  let [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3]) + 1]
  if (!isCalendarDate(`${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`)) {
    d = 1
    mo += 1
    if (mo === 13) {
      mo = 1
      y += 1
    }
  }
  return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const unique = <T,>(values: readonly T[]) => new Set(values).size === values.length
const slug = z.string().max(191).regex(GHOST_SLUG_RE)
const path = z.string().regex(PATH_RE)
const template = z.string().regex(CUSTOM_TARGET_RE).refine((f) => f.length - '.hbs'.length <= TEMPLATE_STEM_MAX)
const limit = z.number().int().min(POSTS_PER_PAGE.min).max(POSTS_PER_PAGE.max).optional()
const cond = z.union([
  z.strictObject({ field: z.enum(SLUG_FIELDS), op: z.enum(['any', 'none']), values: z.array(slug).min(1).refine(unique) }),
  z.strictObject({ field: z.literal('visibility'), op: z.enum(['any', 'none']), values: z.array(z.enum(VISIBILITIES)).min(1).refine(unique) }),
  z.strictObject({ field: z.enum(['featured', 'feature_image']), is: z.boolean() }),
  z.strictObject({
    field: z.literal('published_at'),
    op: z.enum(DATE_OPS),
    at: z.union([
      z.strictObject({ ago: z.number().int().min(AGO.min).max(AGO.max), unit: z.enum(DATE_UNITS) }),
      z.strictObject({ date: z.string().refine(isCalendarDate) }),
    ]),
  }),
])
const filter = z.strictObject({ match: z.enum(['all', 'any']), conditions: z.array(cond) })
const ConfigSchema = z.strictObject({
  collections: z.array(z.strictObject({ path, filter, template, limit })).default([]),
  routes: z.array(z.union([z.strictObject({ path, channel: filter, template, limit }), z.strictObject({ path, template })])).default([]),
  taxonomies: z.strictObject({ tag: z.string().regex(SEGMENT_RE), author: z.string().regex(SEGMENT_RE) }).default({ ...DEFAULT_TAXONOMIES }),
})

/* ───────────────────────────────────────────── the words ───────────────────────────────────────────── */

/** Every sentence a refusal says (R-170: one list; `apps/web/lib/routes.ts`' `ROUTES_WORDS` carries it). Each names its
 *  reason in the spec's words: already a template here · already published by this project · a name Ghost uses itself · an
 *  address Ghost uses · already a collection, channel or route. */
export const ROUTE_WORDS = {
  unreadable: 'This routing could not be read as Inflozo writes it, so nothing from it reaches routes.yaml.',
  path: 'A path is one word, or words joined by hyphens, between two slashes — like /tutorials/.',
  reserved: (where: string, use: string) => `${where} is an address Ghost uses ${use}.`,
  taken: (where: string, what: string) => `${where} is already ${what}.`,
  noCondition: 'A collection needs at least one condition — without one it would take every post off your home page.',
  /** R-246's sentence, verbatim (the spec's Ruled values) */
  relative: 'Published date takes an exact date — after Jan 1, 2026. A rolling window like the last 30 days is a channel\'s.',
  template: 'Choose one of your templates.',
  unknownTemplate: (file: string) => `${file} is not one of this project's templates.`,
  limit: `A page size is a whole number from ${POSTS_PER_PAGE.min} to ${POSTS_PER_PAGE.max}.`,
  value: 'Each condition needs a value.',
  slug: 'A tag or writer is named by its short name — lowercase letters, numbers and hyphens.',
  date: 'Choose a date.',
  ago: `Choose how far back, from ${AGO.min} to ${AGO.max}.`,
  syntax: 'This filter could not be read back exactly as it was written.',
  nameEmpty: 'Give the template a name.',
  nameLong: `A name is at most ${NAME_MAX} characters.`,
  nameNothing: 'That name has no letters or numbers to make a file name from.',
  nameStemLong: 'That name makes a file name longer than Ghost can store.',
  nameReserved: (name: string) => `“${name}” is a name Ghost uses itself.`,
  nameTaken: (name: string) => `This project already has a template called “${name}”.`,
  nameDeployed: (file: string) => `${file} was already published by this project, so Ghost may still have pages using it.`,
} as const

/* ───────────────────────────────────────────── addresses Ghost keeps ───────────────────────────────────────────── */

/**
 * THE FIRST SEGMENTS GHOST USES ITSELF, each with what for — read in Ghost 6.58.0 at Story 7.16a's Dev (2026-10-17), the
 * file and line beside each. A collection, channel or route may not take one, and a taxonomy prefix may take only its own
 * default (`tag` for tags, `author` for authors). Two kinds: addresses Ghost mounts before or around the routes a theme
 * declares, and the context names Ghost's templates test with `{{#is}}`, which a collection's path becomes
 * (`collection-router.js:21`: the path without its slashes).
 */
export const RESERVED_SEGMENTS: Readonly<Record<string, string>> = {
  ghost: 'for its admin', // server/web/parent/backend.js:18; shared/config/overrides.json:18 (`slugs.protected`)
  p: 'for post previews', // frontend/services/routing/preview-router.js:15
  email: 'for newsletters on the web', // frontend/services/routing/email-router.js:15
  unsubscribe: 'for newsletter unsubscribes', // frontend/services/routing/unsubscribe-router.js:14
  members: 'for member sign-in', // server/web/parent/frontend.js:20
  webmentions: 'for webmentions', // server/web/parent/frontend.js:21
  gift: 'for gift subscriptions', // server/web/parent/frontend.js:22
  r: 'for newsletter link tracking', // server/services/link-redirection/link-redirects-service.js:32
  content: 'for your pictures and files', // frontend/web/site.js:25-27 (`content/images`, `/media`, `/files`)
  assets: "for your theme's files", // frontend/web/middleware/static-theme.js:10
  public: 'for its own scripts and styles', // frontend/web/routers/serve-public-file.js:154
  private: 'for the private-site password page', // frontend/apps/private-blogging/index.js:17,38; rendering/context.js:14
  rss: 'for RSS feeds', // frontend/services/routing/rss-router.js:15; shared/config/overrides.json:18
  feed: 'for RSS feeds', // frontend/services/routing/rss-router.js:27
  amp: 'as a protected address', // shared/config/overrides.json:18
  page: 'for page 2 of a list', // frontend/services/routing/collection-router.js:76; rendering/context.js:53-54
  paged: 'for page 2 of a list', // frontend/services/rendering/context.js:33
  home: 'for your home page', // frontend/services/rendering/context.js:38
  index: 'for your home page', // frontend/services/routing/collection-router.js:21
  post: 'for every post', // frontend/services/routing/collection-router.js:131
  tag: 'for tag pages', // frontend/services/routing/taxonomy-router.js:84
  author: 'for author pages', // frontend/services/routing/taxonomy-router.js:84
  search: 'for search', // FR-I5: Inflozo never routes `/search/` (Ghost's search is Sodo's `#/search`)
}

/** §7.4's reserved stems (`prd.md:666`), and R-129's membership pages, whose names are never a route template's. */
const RESERVED_STEMS = ['index', 'home', 'post', 'page', 'tag', 'author', 'error', 'default', 'private', 'robots', 'amp']
/** R-129's three membership files (`custom-signup.hbs` …) — never a route's template (FR-I1), their names reserved. */
export const MEMBERSHIP_FILES: readonly string[] = SURFACES.map((s) => `custom-${s}.hbs`)

/* ───────────────────────────────────────────── parsing ───────────────────────────────────────────── */

export type Parsed = { ok: true; config: RoutesConfig } | { ok: false; at: string; message: string }

/** A grammar failure in the sheet's words, by the key it failed at. */
const issueWords = (at: readonly PropertyKey[]): string => {
  const keys = at.map(String)
  const has = (k: string) => keys.includes(k)
  if (has('values')) return keys[keys.length - 1] === 'values' ? ROUTE_WORDS.value : ROUTE_WORDS.slug
  if (has('date')) return ROUTE_WORDS.date
  if (has('ago')) return ROUTE_WORDS.ago
  if (has('limit')) return ROUTE_WORDS.limit
  if (has('template')) return ROUTE_WORDS.template
  if (has('path') || has('taxonomies')) return ROUTE_WORDS.path
  return ROUTE_WORDS.unreadable
}

/** The stored config, parsed (AD-6) — a value outside any grammar is refused here and never reaches the YAML (AD-36).
 *  `{}` (the column's default) is Ghost's default routing. */
export function parseRoutesConfig(raw: unknown): Parsed {
  const parsed = ConfigSchema.safeParse(raw)
  if (parsed.success) return { ok: true, config: parsed.data as RoutesConfig }
  const issue = parsed.error.issues[0]
  return { ok: false, at: (issue?.path ?? []).map(String).join('.'), message: issueWords(issue?.path ?? []) }
}

/** ONE FILTER'S OWN PROBLEM, in the sheet's words, before the whole config is judged: a collection with no condition, a
 *  condition with no value, a value outside the slug grammar, a date that is not one, and a rolling date anywhere but a
 *  channel (R-246). The sheet asks it as you build; `validateRoutes` asks the same questions of the stored whole. */
export function filterProblem(f: Filter, where: 'collection' | 'channel'): string | null {
  if (where === 'collection' && f.conditions.length === 0) return ROUTE_WORDS.noCondition
  for (const c of f.conditions) {
    if ('values' in c) {
      if (c.values.length === 0) return ROUTE_WORDS.value
      if (c.field !== 'visibility' && !c.values.every((v) => GHOST_SLUG_RE.test(v))) return ROUTE_WORDS.slug
    } else if (c.field === 'published_at') {
      if ('date' in c.at) {
        if (!isCalendarDate(c.at.date)) return ROUTE_WORDS.date
      } else if (where === 'collection') return ROUTE_WORDS.relative
      else if (!Number.isInteger(c.at.ago) || c.at.ago < AGO.min || c.at.ago > AGO.max) return ROUTE_WORDS.ago
    }
  }
  return null
}

/* ───────────────────────────────────────────── NQL ───────────────────────────────────────────── */

/** A filter as a tree: a condition, or conditions joined by `+` (all) or `,` (any). Normalised: a group has two or more
 *  children and never a child of its own join. */
export type Node = Cond | { join: '+' | ','; of: Node[] }
const isGroup = (n: Node): n is { join: '+' | ','; of: Node[] } => 'join' in n

/** A group, normalised: same-join children flattened into it, a single child returned alone. */
function group(join: '+' | ',', of: readonly Node[]): Node | null {
  const flat = of.flatMap((n) => (isGroup(n) && n.join === join ? n.of : [n]))
  if (flat.length === 0) return null
  return flat.length === 1 ? (flat[0] as Node) : { join, of: flat }
}

/** AN EXACT DATE MEANS THE WHOLE DAY. Ghost compares `published_at` with the date as written, which is that day's first
 *  moment, so "after Jan 1" as `>'2026-01-01'` would take Jan 1's own posts and "on or before Jan 1" as `<='2026-01-01'`
 *  would drop them. So the TREE says it by the next day — `>` D is `>=` D+1, `<=` D is `<` D+1 — and `>=` D and `<` D
 *  stand as written; the stored model and every word the page says stay as the customer chose ("after Jan 1, 2026").
 *  Flip stays right on the tree (`>=` D+1 ↔ `<` D+1), and the emitter, the inverse, the reader and the round trip all see
 *  the same condition. `ponytail:` the boundary is UTC midnight — Ghost stores and resolves dates in UTC (F2) — not the
 *  site's timezone; a site far from UTC sees the day turn early or late, upgrade by carrying the site's offset. */
function byTheDay(c: Cond): Cond {
  if (c.field !== 'published_at' || !('date' in c.at) || (c.op !== '>' && c.op !== '<=')) return c
  return { field: 'published_at', op: c.op === '>' ? '>=' : '<', at: { date: dayAfter(c.at.date) } }
}

/** A filter's normalised tree — null for a filter with no condition. */
export const nodeOf = (f: Filter): Node | null => group(f.match === 'all' ? '+' : ',', f.conditions.map(byTheDay))

const FLIP: Readonly<Record<DateOp, DateOp>> = { '>': '<=', '>=': '<', '<': '>=', '<=': '>' }
function flip(c: Cond): Cond {
  if ('values' in c) return { ...c, op: c.op === 'any' ? 'none' : 'any' } as Cond
  if ('is' in c) return { ...c, is: !c.is }
  return { ...c, op: FLIP[c.op] }
}
/** De Morgan: a negated All is an Any of negations, and the other way round. */
const negate = (n: Node): Node => (isGroup(n) ? (group(n.join === '+' ? ',' : '+', n.of.map(negate)) as Node) : flip(n))

const quoted = (v: string) => `'${v}'`
function condNql(c: Cond): string {
  if ('values' in c) {
    const v = c.values.length === 1 ? quoted(c.values[0] as string) : `[${c.values.map(quoted).join(',')}]`
    return `${c.field}:${c.op === 'none' ? '-' : ''}${v}`
  }
  if ('is' in c) return c.field === 'featured' ? `featured:${c.is}` : `feature_image:${c.is ? '-null' : 'null'}`
  return `published_at:${c.op}${'ago' in c.at ? `now-${c.at.ago}${c.at.unit}` : quoted(c.at.date)}`
}

/** The tree as NQL: a child group in parentheses, the whole never wrapped. */
export function writeNql(n: Node, nested = false): string {
  if (!isGroup(n)) return condNql(n)
  const s = n.of.map((child) => writeNql(child, true)).join(n.join)
  return nested ? `(${s})` : s
}

/** A collection's or channel's own filter, as NQL — `''` for none. */
export const filterNql = (f: Filter): string => {
  const n = nodeOf(f)
  return n === null ? '' : writeNql(n)
}

/** The index collection's tree: every collection's filter negated, joined by `+` (Ghost's own advice, F1). */
export function indexNode(collections: readonly Collection[]): Node | null {
  const parts = collections.map((c) => nodeOf(c.filter)).filter((n): n is Node => n !== null).map(negate)
  return group('+', parts)
}
/** The index collection's filter — null while no collection has one. A negated Any is flattened into the `+` chain; a
 *  negated All is an Any group, parenthesised only when it holds more than one condition and sits beside others. */
export const indexFilter = (collections: readonly Collection[]): string | null => {
  const n = indexNode(collections)
  return n === null ? null : writeNql(n)
}

const CONDITION_RES: readonly [RegExp, (m: RegExpExecArray) => Cond | null][] = [
  [/^(tag|author|primary_tag|primary_author|visibility):(-?)(?:'([^']*)'|\[('[^']*'(?:,'[^']*')*)\])$/, (m) => {
    const values = m[3] !== undefined ? [m[3]] : (m[4] as string).split(',').map((v) => v.slice(1, -1))
    const field = m[1] as SlugField | 'visibility'
    const ok = field === 'visibility'
      ? values.every((v) => (VISIBILITIES as readonly string[]).includes(v))
      : values.every((v) => GHOST_SLUG_RE.test(v))
    return ok ? ({ field, op: m[2] === '-' ? 'none' : 'any', values } as Cond) : null
  }],
  [/^featured:(true|false)$/, (m) => ({ field: 'featured', is: m[1] === 'true' })],
  [/^feature_image:(-?)null$/, (m) => ({ field: 'feature_image', is: m[1] === '-' })],
  [/^published_at:(>=|<=|>|<)(?:now-(\d+)([dwMy])|'(\d{4}-\d{2}-\d{2})')$/, (m) => ({
    field: 'published_at',
    op: m[1] as DateOp,
    at: m[4] !== undefined ? { date: m[4] } : { ago: Number(m[2]), unit: m[3] as DateUnit },
  })],
]

/**
 * THE BUILDER'S OWN READER — `writeNql`'s grammar and nothing more (FR-I2: no third-party NQL parser at runtime). It
 * throws, naming the fault, on anything the builder would never write, the parenthesis rule first: a group that is the
 * sole content of another (`((…))`), a filter wrapped whole, a one-child group, a group of its parent's own join, or `+`
 * and `,` mixed at one level. So a round trip that equals the tree is a proof the string is exactly what was meant.
 */
export function readNql(s: string): Node {
  let i = 0
  const fail = (why: string): never => {
    throw new Error(`${why} at character ${i} of ${JSON.stringify(s)}`)
  }
  type Term = { node: Node; wrapped: boolean }
  const cond = (): Node => {
    const from = i
    let quote = false
    let bracket = false
    while (i < s.length) {
      const ch = s[i]
      if (ch === "'") quote = !quote
      else if (!quote && ch === '[') bracket = true
      else if (!quote && ch === ']') bracket = false
      else if (!quote && !bracket && (ch === '+' || ch === ',' || ch === ')' || ch === '(')) break
      i += 1
    }
    const text = s.slice(from, i)
    for (const [re, build] of CONDITION_RES) {
      const m = re.exec(text)
      if (m !== null) {
        const c = build(m)
        if (c !== null) return c
      }
    }
    return fail(`not a condition this builder writes: ${JSON.stringify(text)}`)
  }
  const term = (): Term => {
    if (s[i] !== '(') return { node: cond(), wrapped: false }
    i += 1
    const inner = expr()
    if (s[i] !== ')') fail('an unclosed group')
    i += 1
    if (inner.wrapped) fail('a group that is the sole content of another group')
    if (!isGroup(inner.node)) fail('a group holding a single condition')
    return { node: inner.node, wrapped: true }
  }
  const expr = (): Term => {
    const terms: Term[] = [term()]
    let join: '+' | ',' | null = null
    while (i < s.length && s[i] !== ')') {
      const ch = s[i]
      if (ch !== '+' && ch !== ',') fail(`an unexpected ${JSON.stringify(ch)}`)
      if (join !== null && ch !== join) fail('+ and , mixed at one level')
      join = ch as '+' | ','
      i += 1
      terms.push(term())
    }
    if (terms.length === 1) return terms[0] as Term
    for (const t of terms) if (t.wrapped && isGroup(t.node) && t.node.join === join) fail('parentheses around a group of the same join')
    return { node: { join: join as '+' | ',', of: terms.map((t) => t.node) }, wrapped: false }
  }
  if (s === '') fail('an empty filter')
  const whole = expr()
  if (i !== s.length) fail('a stray )')
  if (whole.wrapped) fail('a filter wrapped whole in one group — Ghost wraps every filter again, and NQL reads ((…)) as a garbage key')
  return whole.node
}

/** A key-order-free comparison, for trees of plain values. */
const canon = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(canon).join(',')}]`
    : v !== null && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon((v as Record<string, unknown>)[k])}`).join(',')}}`
      : JSON.stringify(v)

/** THE ROUND TRIP, on the emitted string: null when `readNql` reads it back as exactly `node`, else why not. The
 *  validator runs it over every filter it writes; `routes.test.ts` plants a broken string as its control. */
export function emittedProblem(emitted: string, node: Node): string | null {
  if (/["\\]/.test(emitted)) return 'a filter carries " or \\, which a double-quoted YAML scalar cannot hold as written'
  try {
    return canon(readNql(emitted)) === canon(node) ? null : 'the filter reads back as a different filter'
  } catch (err) {
    return (err as Error).message
  }
}

/* ───────────────────────────────────────────── the YAML ───────────────────────────────────────────── */

const stem = (file: string) => file.slice(0, -'.hbs'.length)
/** A line of the file and what it says — `at` is the config path `validateRoutes` reports a problem against. */
export type YamlLine = { text: string; at: string }

/** The file as lines. Keys in the frame's order (`collections:` — yours, then `/` — then `routes:` — static, then channels,
 *  each in your order — then `taxonomies:`), two-space indents, one blank line between blocks. */
export function yamlLines(c: RoutesConfig): YamlLine[] {
  const out: YamlLine[] = []
  const put = (text: string, at: string) => out.push({ text, at })
  const scalar = (nql: string) => {
    if (/["\\]/.test(nql)) throw new Error(`a filter carrying " or \\ cannot be written as a double-quoted YAML scalar: ${nql}`)
    return `"${nql}"`
  }
  put('collections:', 'collections')
  c.collections.forEach((col, n) => {
    const at = `collections.${n}`
    put(`  ${col.path}:`, `${at}.path`)
    put(`    permalink: ${col.path}{slug}/`, `${at}.path`)
    put(`    template: ${stem(col.template)}`, `${at}.template`)
    const nql = filterNql(col.filter)
    if (nql !== '') put(`    filter: ${scalar(nql)}`, `${at}.filter`)
    if (col.limit !== undefined) put(`    limit: ${col.limit}`, `${at}.limit`)
  })
  put('  /:', 'index')
  put('    permalink: /{slug}/', 'index')
  put('    template: index', 'index')
  const inverse = indexFilter(c.collections)
  if (inverse !== null) put(`    filter: ${scalar(inverse)}`, 'index.filter')
  put('', '')
  put('routes:', 'routes')
  const order = [...c.routes.entries()].sort(([a, x], [b, y]) => Number(isChannel(x)) - Number(isChannel(y)) || a - b)
  for (const [n, route] of order) {
    const at = `routes.${n}`
    if (!isChannel(route)) {
      put(`  ${route.path}: ${stem(route.template)}`, `${at}.path`)
      continue
    }
    put(`  ${route.path}:`, `${at}.path`)
    put('    controller: channel', `${at}.path`)
    put(`    template: ${stem(route.template)}`, `${at}.template`)
    const nql = filterNql(route.channel)
    if (nql !== '') put(`    filter: ${scalar(nql)}`, `${at}.channel`)
    if (route.limit !== undefined) put(`    limit: ${route.limit}`, `${at}.limit`)
  }
  put('', '')
  put('taxonomies:', 'taxonomies')
  put(`  tag: /${c.taxonomies.tag}/{slug}/`, 'taxonomies.tag')
  put(`  author: /${c.taxonomies.author}/{slug}/`, 'taxonomies.author')
  return out
}

/** Ghost's default routing: no collection, no route, both taxonomies at their defaults. */
export const isDefaultRouting = (c: RoutesConfig): boolean =>
  c.collections.length === 0 && c.routes.length === 0 && c.taxonomies.tag === DEFAULT_TAXONOMIES.tag && c.taxonomies.author === DEFAULT_TAXONOMIES.author

/** THE EMITTER — `routes.yaml` exactly as `routes_config.yaml` stores it and Story 7.17 uploads it, or null while the
 *  config is Ghost's default (routine call 17). It takes a PARSED config and asserts every filter's scalar (AD-36). */
export function routesYaml(c: RoutesConfig): string | null {
  if (isDefaultRouting(c)) return null
  return `${yamlLines(c).map((l) => l.text).join('\n')}\n`
}

/* ───────────────────────────────────────────── the validator ───────────────────────────────────────────── */

export type RouteProblem = { line: number; at: string; message: string }

/** What the validator knows of the project: its Routes Manager templates (`custom_templates` of kind `routes`). */
export type RoutesContext = { templates: readonly string[] }

const hasRelative = (f: Filter) => f.conditions.some((c) => c.field === 'published_at' && 'ago' in c.at)

/**
 * EVERY PROBLEM, ON ITS LINE (S9b). A stored config that fails the grammar is one problem on line 1 — nothing of it is
 * emitted. A parsed one is checked for: a reserved segment, a segment two things claim (collection, channel, route, tag
 * or author prefix), a collection with no condition, a relative date in a collection (R-246), a template that is not
 * one of the project's, and every emitted filter's round trip. Empty is valid: Ghost will accept this routing.
 */
export function validateRoutes(raw: unknown, ctx: RoutesContext): RouteProblem[] {
  const parsed = parseRoutesConfig(raw)
  if (!parsed.ok) return [{ line: 1, at: parsed.at, message: parsed.message }]
  const c = parsed.config
  const lines = yamlLines(c)
  const problems: RouteProblem[] = []
  // a problem's line is its own key's, else its item's first (a static route is one line: path and template together)
  const lineOf = (at: string): number => {
    for (let key = at; key !== ''; key = key.includes('.') ? key.slice(0, key.lastIndexOf('.')) : '') {
      const n = lines.findIndex((l) => l.at === key || l.at.startsWith(`${key}.`))
      if (n !== -1) return n + 1
    }
    return 1
  }
  const say = (at: string, message: string): void => {
    problems.push({ line: lineOf(at), at, message })
  }
  // one segment, one owner — collections first (precedence order), then routes, then the two prefixes
  const owners = new Map<string, string>()
  const claim = (segment: string, at: string, what: string, own?: string): void => {
    const where = `/${segment}/`
    const use = RESERVED_SEGMENTS[segment]
    if (use !== undefined && segment !== own) return say(at, ROUTE_WORDS.reserved(where, use))
    const held = owners.get(segment)
    if (held !== undefined) say(at, ROUTE_WORDS.taken(where, held))
    else owners.set(segment, what)
  }
  const segmentOf = (p: string) => p.slice(1, -1)
  c.collections.forEach((col, n) => claim(segmentOf(col.path), `collections.${n}.path`, 'a collection'))
  c.routes.forEach((r, n) => claim(segmentOf(r.path), `routes.${n}.path`, isChannel(r) ? 'a channel' : 'a custom route'))
  claim(c.taxonomies.tag, 'taxonomies.tag', 'your tag addresses', DEFAULT_TAXONOMIES.tag)
  claim(c.taxonomies.author, 'taxonomies.author', 'your author addresses', DEFAULT_TAXONOMIES.author)

  const known = new Set(ctx.templates)
  const templateOk = (file: string, at: string) => {
    if (!known.has(file) || MEMBERSHIP_FILES.includes(file)) say(at, ROUTE_WORDS.unknownTemplate(file))
  }
  const roundTrip = (f: Filter | null, node: Node | null, at: string) => {
    if (node === null) return
    const wrong = emittedProblem(f === null ? writeNql(node) : filterNql(f), node)
    if (wrong !== null) say(at, ROUTE_WORDS.syntax)
  }
  c.collections.forEach((col, n) => {
    const at = `collections.${n}`
    if (col.filter.conditions.length === 0) say(`${at}.path`, ROUTE_WORDS.noCondition)
    if (hasRelative(col.filter)) say(`${at}.filter`, ROUTE_WORDS.relative)
    templateOk(col.template, `${at}.template`)
    roundTrip(col.filter, nodeOf(col.filter), `${at}.filter`)
  })
  roundTrip(null, indexNode(c.collections), 'index.filter')
  c.routes.forEach((r, n) => {
    const at = `routes.${n}`
    templateOk(r.template, `${at}.template`)
    if (isChannel(r)) roundTrip(r.channel, nodeOf(r.channel), `${at}.channel`)
  })
  return problems.sort((a, b) => a.line - b.line)
}

/* ───────────────────────────────────────────── naming (§7.4) ───────────────────────────────────────────── */

/** Ghost's own label for a custom template — gscan's `generateName` (`read-theme.js:171-180`): `custom-` dropped, each
 *  hyphen a space, each word's first letter raised (`custom-long-read` → "Long Read", F7). */
export const ghostLabel = (file: string): string =>
  stem(file).replace(/^(post-|page-|custom-)/, '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()).trim()

/** §7.4's slug (`prd.md:666`): NFKD with the marks dropped, lowercase, spaces and `_` to `-`, everything outside
 *  `[a-z0-9-]` stripped, repeated hyphens collapsed and trimmed. */
export const nameSlug = (display: string): string =>
  display.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')

export type Named = { file: string; label: string } | { error: string }

/**
 * THE NAMING STEP (FR-I3, §7.4): a display name in, `custom-{slug}.hbs` and the label Ghost will show out — or the one
 * sentence that says why not. Refused at entry: no name, one longer than `NAME_MAX`, one that slugs to nothing or to a
 * reserved stem, a stem longer than Ghost's column, a file this project already has (another template, or a membership
 * page's), and one this project has already published (`deployed_template_names`; the database's `23505` guard is the
 * floor beneath it). There is no rename: the naming step's sentence is the why.
 */
export function templateName(display: string, taken: { project?: readonly string[]; deployed?: readonly string[] } = {}): Named {
  const name = display.trim()
  if (name === '') return { error: ROUTE_WORDS.nameEmpty }
  if (name.length > NAME_MAX) return { error: ROUTE_WORDS.nameLong }
  const slug = nameSlug(name)
  if (slug === '') return { error: ROUTE_WORDS.nameNothing }
  const file = `custom-${slug}.hbs`
  if (RESERVED_STEMS.includes(slug)) return { error: ROUTE_WORDS.nameReserved(name) }
  if (`custom-${slug}`.length > TEMPLATE_STEM_MAX) return { error: ROUTE_WORDS.nameStemLong }
  if (MEMBERSHIP_FILES.includes(file) || (taken.project ?? []).includes(file)) return { error: ROUTE_WORDS.nameTaken(ghostLabel(file)) }
  if ((taken.deployed ?? []).includes(file)) return { error: ROUTE_WORDS.nameDeployed(file) }
  return { file, label: ghostLabel(file) }
}

/* ───────────────────────────────────────────── what routes name ───────────────────────────────────────────── */

/** The `custom-*.hbs` files any collection or route names, sorted — `compileTheme`'s `routed` (Story 7.18 hands it in). */
export const routedOf = (c: RoutesConfig): string[] =>
  [...new Set([...c.collections, ...c.routes].map((r) => r.template))].sort()

/** The paths whose template is `file`, in the file's order — the delete confirm's "Also removes {paths}". */
export const pathsUsing = (c: RoutesConfig, file: string): string[] =>
  [...c.collections, ...c.routes].filter((r) => r.template === file).map((r) => r.path)

/** The config without every collection and route naming `file` — a template's delete writes this FIRST, then deletes the
 *  row, so no stored config ever names a template that is gone. */
export const withoutTemplate = (c: RoutesConfig, file: string): RoutesConfig => ({
  ...c,
  collections: c.collections.filter((r) => r.template !== file),
  routes: c.routes.filter((r) => r.template !== file),
})
