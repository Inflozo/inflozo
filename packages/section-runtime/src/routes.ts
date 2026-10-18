// STORY 7.16a — THE ROUTES MANAGER'S RULES, AS DATA IN ONE PLACE (FR-I2, FR-I3; AD-34's pattern, `custom-settings.ts`'s
// shape). The Routes page and its server actions read it, and so will Story 7.16b (custom canvases), 7.17 (the upload) and
// 7.18a (Pre-flight and `compileTheme`'s `routed`, through `routedOf`). Pure and deterministic (AD-1, AD-14): no clock, no
// `Intl`, no locale reader — the naming rule's lowercase is `toLowerCase`, never `toLocaleLowerCase`.
//
// WHAT IS HERE: the config's grammar (`parseRoutesConfig`, zod — AD-6: what is stored is parsed on read), the filter
// builder (`filterNql`) and its OWN reader (`readNql`), the index collection's inverse (`indexFilter`), the emitter
// (`routesYaml`), the validator (`validateRoutes`, every problem on its YAML line), the naming rule (`templateName`, §7.4),
// the files a route names (`routedOf`) and the addresses Ghost keeps for itself (`RESERVED_SEGMENTS`). Since Story 7.16c, what
// each template LISTS (`listsOf`, the one place it is worked out), a route's context name (`contextOf`), the evaluator the
// canvas cuts a list with (`holdsFor`) and the lists the canvas draws (`routeList`, `homeList`). Since Story 7.18a, the
// index's `NoPrimary` leaf (R-260) and Pre-flight's check for posts no page lists (`unlistedPosts`).
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
//   - STORY 7.18a (R-260, DW-364) — A NEGATED PRIMARY LEAF MEANS TWO THINGS, so the index carries `NO_PRIMARY` beside it.
//     A LISTING is SQL: `post.js:291-310`'s `filterExpansions` writes every `primary_tag` leaf as `tags.slug` AND
//     `posts_tags.sort_order:0+tags.visibility:public` (both majors), so `primary_tag:-'x'` lists only a post that HAS a
//     public first tag, and `primary_tag:null` is `IN (… WHERE tags.slug IS NULL AND tags.visibility = 'public')`, which
//     nothing matches (`tags.slug` is `nullable: false`, `schema.js:287`; 5: `:286`) — so Ghost cannot say "no primary tag"
//     with the `primary_tag` key. It can with the expansion's own two terms, the visibility one negated:
//     `(tags.visibility:-'public'+posts_tags.sort_order:0)` is mongo-knex's `posts.id NOT IN (SELECT posts_tags.post_id …
//     INNER JOIN tags ON … AND posts_tags.sort_order = 0 WHERE tags.visibility IN ('public'))` — an `$and` group's join-table
//     term rides in the ON (`convertor.js` 0.11.2 `:345-434`, 0.9.1 `:183-241`), and an all-negated relation group becomes
//     `NOT IN` (0.11.2 `:465-554`, 0.9.1 `:269-348`) — executed through both pinned NQLs at Story 7.18a's Dev; proved on T1 by
//     MEASUREMENTS §86 leg 4. OWNERSHIP is in-memory NQL over a record with no `posts_tags` key (Ghost 6 `lazy-url-service.js`,
//     whose `filterScalarFields` skips dotted keys `:70-91`; Ghost 5 `Resources.js`), so the pair never holds there and the
//     index owns exactly what it owned. `primary_author` is the same with `authors`/`posts_authors`.
//
// AD-36 — `routes.yaml` IS A SINK. The emitter writes only values that passed this file's grammars: one-segment paths
// (`PATH_RE`), `CUSTOM_TARGET_RE` templates, `GHOST_SLUG_RE` slugs, whole limits within `POSTS_PER_PAGE`. NQL values are
// always single-quoted (an unquoted one-letter value fails to lex inside a group, and `tag:true` would read as a boolean —
// F4), except booleans, `null`, relative terms and `NO_PRIMARY`'s constant `0` (Ghost's own expansion spells it bare); every
// `filter:` is a double-quoted YAML scalar that can never hold `"` or `\`, and the emitter asserts it.
//
// NO THIRD-PARTY NQL PARSER IS A RUNTIME DEPENDENCY (FR-I2): `readNql` reads this builder's own grammar and nothing else.
// Ghost's `@tryghost/nql` (both majors' pins) is a devDependency, so `routes.test.ts` holds the two in agreement.

import { z } from 'zod'
import { CUSTOM_TARGET_RE, GHOST_SLUG_RE, MEMBERSHIP_FILES } from '@inflozo/library'
import type { orbitWeekly } from '@inflozo/library'
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
// R-129's three membership files are the library's one list since Story 7.16b (`MEMBERSHIP_FILES`, `vocabulary.ts`)

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

/** STORY 7.18a (R-260) — "THIS POST HAS NO PUBLIC PRIMARY TAG" (or author): a leaf only the index's inverse carries, OR'd
 *  beside each negated primary leaf (`listedToo`), never stored, never negated. Written as `NO_PRIMARY`'s pair (the header's
 *  facts): in SQL it lists exactly the posts Ghost's computed primary is null for (`post.js:1059-1064`), in memory it never
 *  holds. */
export type NoPrimary = { field: 'primary_tag' | 'primary_author'; absent: true }
/** A filter as a tree: a condition, or conditions joined by `+` (all) or `,` (any). Normalised: a group has two or more
 *  children and never a child of its own join. */
export type Node = Cond | NoPrimary | { join: '+' | ','; of: Node[] }

/** `NoPrimary` as NQL — Ghost's own expansion (`post.js:296`, `:300`) with its visibility term negated, ALWAYS in its
 *  parentheses: it is a `+` pair that only ever sits in a `,` group, and alone it would be a filter wrapped whole. */
export const NO_PRIMARY: Readonly<Record<NoPrimary['field'], string>> = {
  primary_tag: "(tags.visibility:-'public'+posts_tags.sort_order:0)",
  primary_author: "(authors.visibility:-'public'+posts_authors.sort_order:0)",
}
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
function flip(c: Cond | NoPrimary): Cond {
  if ('absent' in c) throw new Error('a NoPrimary leaf is never negated: only the finished inverse carries one')
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
  if (!isGroup(n)) return 'absent' in n ? NO_PRIMARY[n.field] : condNql(n)
  const s = n.of.map((child) => writeNql(child, true)).join(n.join)
  return nested ? `(${s})` : s
}

/** A collection's or channel's own filter, as NQL — `''` for none. */
export const filterNql = (f: Filter): string => {
  const n = nodeOf(f)
  return n === null ? '' : writeNql(n)
}

/** STORY 7.18a (R-260) — every negated `primary_tag`/`primary_author` leaf OR'd with its `NoPrimary`, so the index's SQL
 *  LISTS a post with no public primary as its in-memory filter OWNS it: (has a public primary, not x) or (has none) is
 *  exactly "not a public primary x". A positive primary leaf needs nothing — both readings require the primary there. */
const listedToo = (n: Node): Node =>
  isGroup(n) ? (group(n.join, n.of.map(listedToo)) as Node)
    : 'values' in n && n.op === 'none' && (n.field === 'primary_tag' || n.field === 'primary_author') ? { join: ',', of: [n, { field: n.field, absent: true }] }
      : n

/** The index collection's tree: every collection's filter negated, joined by `+` (Ghost's own advice, F1), each negated
 *  primary leaf carrying `NoPrimary` (R-260). */
export function indexNode(collections: readonly Collection[]): Node | null {
  const parts = collections.map((c) => nodeOf(c.filter)).filter((n): n is Node => n !== null).map((n) => listedToo(negate(n)))
  return group('+', parts)
}
/** The index collection's filter — null while no collection has one. A negated Any is flattened into the `+` chain; a
 *  negated All is an Any group, parenthesised only when it holds more than one condition and sits beside others. Since
 *  Story 7.18a a collection by Primary tag gives `primary_tag:-'craft',(tags.visibility:-'public'+posts_tags.sort_order:0)`. */
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
    // STORY 7.18a — `NO_PRIMARY`'s exact text is one leaf, read as a parenthesised term: alone it is a filter wrapped
    // whole, and `((…))` around it is a group whose sole content is another — both refused below, as for any group
    for (const field of ['primary_tag', 'primary_author'] as const) {
      if (s.startsWith(NO_PRIMARY[field], i)) {
        i += NO_PRIMARY[field].length
        return { node: { field, absent: true }, wrapped: true }
      }
    }
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

/** Every first segment the config claims, in precedence order — collections, then routes, then the two prefixes — with
 *  the words `ROUTE_WORDS.taken` says of its holder, and the one reserved segment a prefix may keep (its own default). */
function claimsOf(c: RoutesConfig): { segment: string; at: string; what: string; own?: string }[] {
  return [
    ...c.collections.map((col, n) => ({ segment: col.path.slice(1, -1), at: `collections.${n}.path`, what: 'a collection' })),
    ...c.routes.map((r, n) => ({ segment: r.path.slice(1, -1), at: `routes.${n}.path`, what: isChannel(r) ? 'a channel' : 'a custom route' })),
    { segment: c.taxonomies.tag, at: 'taxonomies.tag', what: 'your tag addresses', own: DEFAULT_TAXONOMIES.tag },
    { segment: c.taxonomies.author, at: 'taxonomies.author', what: 'your author addresses', own: DEFAULT_TAXONOMIES.author },
  ]
}

/** WHAT ALREADY HOLDS `path`'s segment in `c`, in `ROUTE_WORDS.taken`'s words — skipping the claim at `except` (the item
 *  a sheet is editing, `collections.N.path` or `routes.N.path`) — or null. The sheets ask it first, so a refusal names
 *  what is ALREADY there: the validator names whichever claims first, and a collection claims before any route, so a new
 *  collection on a route's path would be told it is "already a collection" (review, 2026-10-17). */
export function holderOf(c: RoutesConfig, path: string, except?: string): string | null {
  const segment = path.slice(1, -1)
  return claimsOf(c).find((k) => k.segment === segment && k.at !== except)?.what ?? null
}

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
    // own keys only: `/constructor/` is a legal path, and a plain lookup would find `Object.prototype`'s (review, 2026-10-17)
    const use = Object.hasOwn(RESERVED_SEGMENTS, segment) ? RESERVED_SEGMENTS[segment] : undefined
    if (use !== undefined && segment !== own) return say(at, ROUTE_WORDS.reserved(where, use))
    const held = owners.get(segment)
    if (held !== undefined) say(at, ROUTE_WORDS.taken(where, held))
    else owners.set(segment, what)
  }
  for (const k of claimsOf(c)) claim(k.segment, k.at, k.what, k.own)

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

/** The `custom-*.hbs` files any collection or route names, sorted — `compileTheme`'s `routed` (Story 7.18a hands it in). */
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

/* ───────────────────────────────────────────── what a template lists (Story 7.16c) ───────────────────────────────────────────── */
//
// READ IN GHOST 6.58.0's AND 5.130.6's SOURCE at Story 7.16c's Create (2026-10-18; the spec's F1–F6):
//   - F1 — a collection's context is its path without slashes (`collection-router.js:21`, `:55`), a channel's the same
//     (`static-routes-router.js:19`, `:79`); F2 — page 2 of `/x/` is `['paged','x']` (`rendering/context.js:32-33`, `:43`).
//   - F3 — a collection and a channel put `posts` and `pagination` at the root and no `post` (`format-response.js:15`,
//     `:20`, `:59-60`), so their template paginates as Home does; a static route serves no `/page/N/`.
//   - F4 — A COLLECTION FETCHES ITS OWN FILTER'S WINDOW, THEN KEEPS ONLY THE POSTS IT OWNS (`controllers/collection.js:75-88`,
//     `ownsResource`) and leaves `pagination` as the window's: a post an EARLIER collection matches is dropped, never
//     refilled. A channel keeps every match (`controllers/channel.js:53-62`).
//   - F5 — a route's `limit` replaces `posts_per_page` for that request (`collection.js:33-42`, `channel.js:34-43`).

/** STORY 7.16c — a context name's own shape: one path segment, as `PATH_RE` holds it. The compiler holds every context it
 *  writes into the guard's `{{#is}}` to it (AD-36). */
export const CONTEXT_RE = SEGMENT_RE

/** STORY 7.16c (F1, AD-36) — A COLLECTION'S OR CHANNEL'S CONTEXT NAME, rebuilt from its `PATH_RE`-checked path and never
 *  spliced from stored text: the path without its slashes, as Ghost names it. Throws on any path `PATH_RE` refuses —
 *  `/` included, which is the index collection's (`index`), and Inflozo writes that one itself. */
export function contextOf(path: string): string {
  if (!PATH_RE.test(path)) throw new Error(`${JSON.stringify(path)} is not a path the Routes Manager writes, so it names no context`)
  return path.slice(1, -1)
}

/** STORY 7.16c — ONE LIST A TEMPLATE SHOWS: a collection's or a channel's that names it, with what its live address lists.
 *  `node` is the route's own filter (null: a channel with no condition lists every post); `earlier` is the posts no EARLIER
 *  collection owns — each earlier collection's filter negated and joined by `+`, `indexNode`'s own shape — or null where
 *  nothing is dropped (the first collection, and every channel). */
export type Listing = {
  kind: 'collection' | 'channel'
  path: string
  context: string
  limit?: number
  node: Node | null
  earlier: Node | null
}
/** Each LISTED file and its lists — collections first, in precedence order, then channels. A `Map`, so it is `isPaginated`'s
 *  `listed` as it stands. */
export type Lists = ReadonlyMap<string, readonly Listing[]>

/** STORY 7.16c — THE ONE PLACE A FILE'S LISTS ARE WORKED OUT (the spec's "one predicate, one list"): the editor, `read.ts`,
 *  the compiler's shell and the harness all take them from here. A file a collection or a channel names is LISTED: it
 *  paginates, so a feed on it is its main feed. A static route lists nothing (F3), and an unreadable stored routing — null
 *  here — lists nothing (7.16b's routine call 12). */
export function listsOf(c: RoutesConfig | null): Lists {
  const out = new Map<string, Listing[]>()
  if (c === null) return out
  const add = (file: string, l: Listing) => out.set(file, [...(out.get(file) ?? []), l])
  const limited = (limit?: number) => (limit === undefined ? {} : { limit })
  c.collections.forEach((col, n) =>
    add(col.template, { kind: 'collection', path: col.path, context: contextOf(col.path), ...limited(col.limit), node: nodeOf(col.filter), earlier: indexNode(c.collections.slice(0, n)) }))
  for (const r of c.routes) {
    if (isChannel(r)) add(r.template, { kind: 'channel', path: r.path, context: contextOf(r.path), ...limited(r.limit), node: nodeOf(r.channel), earlier: null })
  }
  return out
}

/** A row as `holdsFor` reads it — the Content API's post shape, which the sample's rows and the site's whitelisted rows share. */
export type ListedPost = Readonly<Record<string, unknown>>

const SQL_OR_ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/
/** An instant as UTC milliseconds, or NaN: Ghost's own SQL form (`YYYY-MM-DD HH:mm:ss`, UTC — nql-lang's `SQL_FORMAT`), an
 *  ISO string with its zone, or a bare date (its first moment, UTC). To the second, as Ghost's datetime column stores it. */
function instantOf(v: unknown): number {
  const m = typeof v === 'string' ? SQL_OR_ISO.exec(v.trim()) : null
  if (m === null) return Number.NaN
  const zone = m[7] === undefined || m[7] === 'Z' ? 'Z' : m[7].includes(':') ? m[7] : `${m[7].slice(0, 3)}:${m[7].slice(3)}`
  return Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4] ?? '00'}:${m[5] ?? '00'}:${m[6] ?? '00'}${zone}`)
}

const DAY_MS = 86_400_000
/** `now` less a relative term, as nql-lang resolves it (`scope.js`' `relDateToAbsolute`, luxon's `minus` in UTC): days and
 *  weeks exactly, months and years on the calendar with the day clamped to the month's last. */
function agoFrom(now: number, n: number, unit: DateUnit): number {
  if (unit === 'd' || unit === 'w') return now - n * (unit === 'w' ? 7 : 1) * DAY_MS
  const at = new Date(now)
  const months = at.getUTCFullYear() * 12 + at.getUTCMonth() - n * (unit === 'y' ? 12 : 1)
  const y = Math.floor(months / 12)
  const mo = months - y * 12
  const last = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate()
  return Date.UTC(y, mo, Math.min(at.getUTCDate(), last), at.getUTCHours(), at.getUTCMinutes(), at.getUTCSeconds())
}

const slugsOf = (v: unknown): string[] => (Array.isArray(v) ? v.flatMap((x) => (typeof (x as { slug?: unknown })?.slug === 'string' ? [(x as { slug: string }).slug] : [])) : [])

/**
 * STORY 7.16c — A FILTER'S TREE, EVALUATED ON ONE POST: the canvas's half of the list a route shows, so the sample and the
 * site's rows are cut exactly as Ghost cuts them (F4). Pure (AD-1): a relative date's "now" is HANDED IN by the shell —
 * an ISO instant or Ghost's SQL form — and resolved as nql-lang resolves it. A date the post does not carry matches no
 * comparison, as NQL's `$gt` on a missing field does.
 *
 * TWO READINGS, because Ghost reads one filter two ways (read in 6.58.0's source after §84 measured it on T1, 2026-10-18):
 *   - OWNERSHIP (the default) — which router OWNS a post, so its URL and a collection's drop (`ownsResource`): in-memory
 *     `@tryghost/nql` over `core/server/services/url/router-filter.js`'s EXPANSIONS (`primary_tag` → `primary_tag.slug`),
 *     `lazy-url-service.js:285-303`. `primary_tag:-x` holds on a post with NO primary tag (`$ne` on null). `routes.test.ts`
 *     holds this reading to the independent `holds` and to `@tryghost/nql` 0.13.4 on every fixture and "not owned earlier" node.
 *   - LISTING (`listing: true`) — which posts a collection's, a channel's or the index's page FETCHES (the Content API and
 *     the controllers' `fetchData`): SQL through `core/server/models/post.js:291-310`'s `filterExpansions`, where
 *     `primary_tag` is `tags.slug` with `posts_tags.sort_order:0+tags.visibility:public` and `primary_author` is
 *     `authors.slug` with `posts_authors.sort_order:0+authors.visibility:public`. So a NEGATED `primary_tag` or
 *     `primary_author` leaf means "HAS that primary and it is not x": a post with no tags, or whose first tag is internal
 *     (its computed `primary_tag` null, `post.js:1059-1064`), is in neither `primary_tag:x` nor `primary_tag:-x` (executed
 *     on T1, MEASUREMENTS §84). Every other leaf reads the same both ways (`tag:-x` keeps an untagged post).
 *   - STORY 7.18a — `NoPrimary` (R-260): LISTED on a post with no primary (the SQL's `NOT IN` public first tag; the Content
 *     API sends that post's `primary_tag` as null, `live-content.ts`' `entryRow`), and never OWNED (no `posts_tags` key in
 *     memory). `ponytail:` a post whose first author is NOT public is in Ghost's SQL window for the author's pair, then
 *     dropped from Home as the author collection's (memory's `primary_author` ignores visibility, `relations/authors.js:146-151`);
 *     the Content API sends no author visibility, so this reading leaves it out of the window and Home's page may show one
 *     post more than Ghost's. Ghost's users are public unless changed by hand; upgrade by reading `authors.visibility`.
 * The canvas cuts a page's WINDOW with the listing reading and its drop with the ownership one (`routeList`, `homeList`).
 */
export function holdsFor(n: Node, post: ListedPost, now: string, listing = false): boolean {
  if (isGroup(n)) return n.join === '+' ? n.of.every((c) => holdsFor(c, post, now, listing)) : n.of.some((c) => holdsFor(c, post, now, listing))
  const one = (key: string) => {
    const slug = (post[key] as { slug?: unknown } | null | undefined)?.slug
    return typeof slug === 'string' ? [slug] : []
  }
  if ('absent' in n) return listing && one(n.field).length === 0
  if ('is' in n) {
    if (n.field === 'featured') return post['featured'] === n.is
    const image = post['feature_image']
    return (image !== null && image !== undefined) === n.is
  }
  if ('at' in n) {
    const v = instantOf(post['published_at'])
    const bound = 'date' in n.at ? instantOf(n.at.date) : agoFrom(instantOf(now), n.at.ago, n.at.unit)
    if (Number.isNaN(v) || Number.isNaN(bound)) return false
    return n.op === '>' ? v > bound : n.op === '>=' ? v >= bound : n.op === '<' ? v < bound : v <= bound
  }
  const has = n.field === 'visibility' ? [post['visibility']]
    : n.field === 'tag' ? slugsOf(post['tags'])
      : n.field === 'author' ? slugsOf(post['authors'])
        : one(n.field)
  const hit = (n.values as readonly string[]).some((v) => has.includes(v))
  if (n.op === 'any') return hit
  // listing (SQL): a negated primary holds only on a post that HAS that primary — `post.js:291-310`, above
  return listing && (n.field === 'primary_tag' || n.field === 'primary_author') && has.length === 0 ? false : !hit
}

/** STORY 7.16c — ONE LIST AS THE CANVAS DRAWS IT (the library's `RouteList`, handed in because the library cannot import the
 *  runtime): the address it sits at, the NQL the site is asked with, the window (the route's own filter, as Ghost's SQL
 *  LISTS it) and what is kept of it (not owned earlier, as Ghost's in-memory OWNERSHIP decides — F4), and the route's own
 *  page size (F5). */
export function routeList(l: Listing, now: string): orbitWeekly.RouteList {
  const { node, earlier } = l
  return {
    base: l.path,
    filter: node === null ? null : writeNql(node),
    window: node === null ? () => true : (post) => holdsFor(node, post, now, true),
    keep: earlier === null ? () => true : (post) => holdsFor(earlier, post, now),
    ...(l.limit === undefined ? {} : { limit: l.limit }),
  }
}

/** STORY 7.16c — HOME'S LIST (FR-H3): the index collection's — `indexFilter` as Ghost's SQL LISTS it — at `/` and the
 *  project's own page size; or undefined while no collection exists, when Home lists every post. Nothing is dropped:
 *  everything the index's SQL lists, it owns. Since Story 7.18a (R-260) that includes a post with no primary tag (no tags, or
 *  an internal first tag), which 7.16a's inverse left on no page of Home though the index owned it (DW-364). */
export function homeList(c: RoutesConfig | null, now: string): orbitWeekly.RouteList | undefined {
  const node = c === null ? null : indexNode(c.collections)
  return node === null ? undefined : { base: '/', filter: writeNql(node), window: (post) => holdsFor(node, post, now, true), keep: () => true }
}

/** One post R-260's check names: its title and its slug, as the Content API sent them. */
export type UnlistedPost = { title: string; slug: string }

/**
 * STORY 7.18a — R-260's CHECK: THE POSTS NO PAGE LISTS. For each post, the router that OWNS it — the collections in YAML
 * order, then the index last (`lazy-url-service.js:300-303`; Ghost 5 `UrlGenerator.js:158-191`), by the OWNERSHIP reading —
 * and whether that router's filter LISTS it (the LISTING reading, Ghost's SQL). Owned and not listed is named: its own
 * address answers, and no list of Home or a collection links to it. Only Home and the collections count (routine call 23):
 * a tag, author or channel page lists by subject. Empty for an unreadable routing (`null`) and for one with no collection,
 * where Home lists every post.
 *
 * `posts` are the site's published posts in the Content API's shape, as `apps/web/lib/live-content.ts`' `pick('posts', …)`
 * whitelists them (`Row`: `title`, `slug`, `tags`, `authors`, `primary_tag` — null where Ghost sent null — `primary_author`,
 * `featured`, `feature_image`, `visibility`, `published_at`): `ListedPost`, `holdsFor`'s own input. `now` is `holdsFor`'s.
 * `index` is the index's tree, `indexNode`'s by default — `routes.test.ts` hands in 7.16a's inverse as the control.
 */
export function unlistedPosts(c: RoutesConfig | null, posts: readonly ListedPost[], now: string, index: Node | null = c === null ? null : indexNode(c.collections)): UnlistedPost[] {
  if (c === null || c.collections.length === 0) return []
  const routers = [...c.collections.map((col) => nodeOf(col.filter)), index]
  const text = (v: unknown) => (typeof v === 'string' ? v : '')
  return posts.flatMap((post) => {
    // a router with no filter owns and lists every post that reaches it
    const owner = routers.find((n) => n === null || holdsFor(n, post, now))
    return owner === undefined || owner === null || holdsFor(owner, post, now, true) ? [] : [{ title: text(post['title']), slug: text(post['slug']) }]
  })
}
