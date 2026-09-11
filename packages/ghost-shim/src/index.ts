// @inflozo/ghost-shim — Ghost's helper surface, resolved to VALUES, on the editing canvas.
//
// FR-H5: "Handlebars is never parsed or executed in the browser." Nothing here compiles a template,
// nothing calls `new Function`, and nothing fetches: the shim is handed the values a real Ghost
// would have had and returns the strings a real Ghost would have printed. The theme side of every
// one of these is a mustache, emitted by `packages/section-runtime`; this is the other side of the
// same fact, and `contract.test.ts` is what keeps the two honest.
//
// ─── AD-23, and why this file could not have been written first ───────────────
// The shape of a Ghost sized URL was recorded nowhere in this repository. Writing the URL builder
// from memory and recording afterwards produces a recording that agrees with the code because both
// came from the same guess — standing rule 2's failure exactly, a control that did not run. So
// `tools/probe/record-shim.py` ran first, against T1 (6.58.0) and T3 (5.130.6), and every rule
// below cites the recording it came from. `packages/ghost-shim/fixtures/` is the evidence and
// `contract.test.ts` reads it per-commit, offline.
//
// ─── AD-1 ─────────────────────────────────────────────────────────────────────
// No Next, no Supabase, no Node builtin, no `fetch`, no clock, no entropy, and no DOM global. In
// particular this file returns STRINGS and never touches a node: NFR-3 requires every Content-API
// value to reach the page as a TEXT NODE, and a function that cannot see a DOM cannot write one
// through `innerHTML` by accident. `eslint.config.js` is the gate; this paragraph is the reason.

import {
  GET_SOURCES,
  IMAGE_SIZES,
  safeCssColor,
  safeUrl,
} from '@inflozo/library'
import type { DataBinding } from '@inflozo/library'

export { IMAGE_SIZES }

// ─── NFR-3's three carve-outs, here so BOTH renderers inherit them ────────────
// ARCHITECTURE-SPINE, Conventions: "Every Ghost-sourced value is scheme-validated (http/https only)
// before reaching href, src or srcset, and excerpts render text-only and sanitized — NFR-3's three
// carve-outs, which live in ghost-shim so both renderers inherit them."

/** The Ghost allow-list is NARROWER than the user one, deliberately. `safeUrl` permits `mailto:`
 *  and `tel:` because a user's Link Picker legitimately produces an email or a phone link; a
 *  `mailto:` arriving in `@site.logo` is not a feature, it is a compromised or confused field.
 *  One function, two allow-lists — `safeUrl` is CALLED, never re-derived (AD-36, and the three
 *  drifted copies Story 4.1's review found). */
export function ghostUrl(value: unknown): string {
  const v = safeUrl(value) // the one copy of the scheme rule, including the control-character strip
  if (v === '#') return '#'
  const probe = v.replace(/[\u0000-\u0020]/g, '').toLowerCase()
  return /^(mailto:|tel:)/.test(probe) ? '#' : v
}

/** AD-36 (4) / DW-95. Ghost stores a tag's `accent_color` VERBATIM — `red;}body{display:none`,
 *  `#fff;background:url(x)` and `#f00;/* c *\/color:red` were all accepted on both live majors
 *  (MEASUREMENTS §21e, executed) — so the value crossing into a CSS declaration is not necessarily
 *  a colour. The parser is the library's; this names the fallback token the canvas uses. */
export const COLOUR_FALLBACK_TOKEN = '--accent'
export function ghostColor(value: unknown): string {
  return safeCssColor(value, COLOUR_FALLBACK_TOKEN)
}

/** NFR-3: a Content-API value is a TEXT NODE. This returns the string the caller assigns to
 *  `textContent`; there is deliberately no escaping here, because escaping is what a caller does
 *  when it builds markup and `textContent` is what it does when it does not. */
export function textValue(value: unknown): string {
  return value == null ? '' : String(value)
}

const ENTITIES: Readonly<Record<string, string>> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&nbsp;': ' ',
}

/** NFR-3: "excerpts render text-only and sanitised". Tags out, entities back to characters, and
 *  never through `innerHTML` — the result is a text node like every other Ghost value. */
export function stripTags(value: unknown): string {
  return textValue(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39|#x27|nbsp);/g, (e) => ENTITIES[e] ?? e)
}

// ─── {{img_url}} — the recorded shape, and the reason it is not a pass-through ─
//
// Recorded on both majors (fixtures/ghost{5,6}/index.json, group IMG):
//
//   a Ghost-hosted image, size="m"   ->  /content/images/size/w750/2026/09/probe.png
//   ...  with absolute="true"        ->  https://<site>/content/images/size/w750/2026/09/probe.png
//   ...  with format="webp"          ->  /content/images/size/w150/format/webp/2026/09/probe.png
//   ...  with NO size                ->  /content/images/2026/09/probe.png
//   ...  with size="800"             ->  /content/images/2026/09/probe.png   ← THE DEFECT
//   an external static.ghost.org URL ->  returned VERBATIM, at every size
//
// Two of those are the whole reason this helper exists. **A Ghost-hosted absolute URL comes back
// RELATIVE** — Ghost drops its own origin — so a canvas that passed the value through would show
// the original 2400px file where the site serves a 750px rendition, and a canvas that pasted
// Ghost's relative answer onto its own origin would 404. And **a size that is not an `image_sizes`
// key silently returns the original**, which is why `HELPERS.img_url` now refuses one by name.

const HOSTED_PREFIX = '/content/images/'
/** Ghost's own size and format segments, stripped before rebuilding so a value that has already
 *  been through the helper cannot be sized twice. */
const EXISTING = /^size\/w\d+\/(?:format\/[a-z0-9]+\/)?/

export type ImgUrlOptions = {
  /** the connected site's URL, so a same-origin absolute URL is recognised as Ghost-hosted and so
   *  `absolute` can be reproduced. Without it only a relative `/content/images/…` is recognised. */
  siteUrl?: string
  /** Ghost's `absolute="true"` */
  absolute?: boolean
  /** Ghost's `format="webp"`. MEASUREMENTS §36: `img_url` accepts `absolute` · `format` · `size`
   *  and NOTHING else — there is no focal point, which is why Image focus is a control. */
  format?: string
}

const stripSlash = (s: string): string => s.replace(/\/+$/, '')

/** The one place a rendition URL is built. Throws on a size that is not an `image_sizes` key: on a
 *  live site that case is SILENT, and a silent wrong answer is the failure this story exists to
 *  prevent. */
export function imgUrl(url: unknown, size?: string, opts: ImgUrlOptions = {}): string {
  const raw = textValue(url).trim()
  if (raw === '') return ''
  if (size !== undefined && !Object.prototype.hasOwnProperty.call(IMAGE_SIZES, size)) {
    throw new Error(
      `img_url size "${size}" is not an image_sizes key. FR-J2's map is ` +
        `${Object.entries(IMAGE_SIZES).map(([k, w]) => `${k} ${w}`).join(' · ')} — Ghost generates a ` +
        `rendition per declared key and returns the ORIGINAL image for anything else, reporting ` +
        `nothing (recorded: fixtures/ghost*/index.json IMG|hosted_notakey).`,
    )
  }
  if (opts.format !== undefined && size === undefined) {
    throw new Error('img_url format= was recorded only alongside size=; ask for a size too')
  }

  const site = opts.siteUrl === undefined ? '' : stripSlash(opts.siteUrl)
  const path = site !== '' && raw.startsWith(site + '/') ? raw.slice(site.length) : raw
  // Not Ghost's to serve — recorded verbatim at every size, and `absolute` does not touch it either.
  if (!path.startsWith(HOSTED_PREFIX)) return raw

  const rest = path.slice(HOSTED_PREFIX.length).replace(EXISTING, '')
  const sized = size === undefined
    ? `${HOSTED_PREFIX}${rest}`
    : `${HOSTED_PREFIX}size/w${IMAGE_SIZES[size] as number}/${opts.format === undefined ? '' : `format/${opts.format}/`}${rest}`
  return opts.absolute === true ? `${site}${sized}` : sized
}

export type SrcsetCandidate = { url: string; width: number; descriptor: string }

/** FR-J5: `{{img_url}}` returns a single URL string and emits NO `srcset` at all, so the theme
 *  composes one from FR-J2's keys — one candidate per key, from the ONE map. */
export function srcsetCandidates(url: unknown, opts: ImgUrlOptions = {}): SrcsetCandidate[] {
  return Object.entries(IMAGE_SIZES).map(([key, width]) => ({
    url: imgUrl(url, key, opts),
    width,
    descriptor: `${width}w`,
  }))
}

export function srcset(url: unknown, opts: ImgUrlOptions = {}): string {
  return srcsetCandidates(url, opts).map((c) => `${c.url} ${c.descriptor}`).join(', ')
}

// ─── {{date}} ─────────────────────────────────────────────────────────────────
//
// AD-1 bans `Intl`, `toLocale*` and `Date.toString`/`getHours`, because each reads the machine
// rather than the argument — so the formatter is written from UTC getters and is deliberately small.
// The DEFAULT format is `MMM D, YYYY`, READ FROM THE RECORDING: `{{date published_at}}` printed
// `Jul 18, 2025` on both majors. The pre-4.3 runtime defaulted to `YYYY-MM-DD`, which was a
// paraphrase and was wrong.
//
// **The condition on the agreement, stated because it is real:** Ghost formats in the SITE's
// timezone and this formats in UTC. Both recording sites are `Etc/UTC` (recorded, SITE|timezone),
// so the recorded strings and this function agree; `contract.test.ts` asserts that condition
// explicitly rather than assuming it, and fails naming it if a recording is ever made elsewhere.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const DEFAULT_DATE_FORMAT = 'MMM D, YYYY'

export function formatDate(raw: unknown, fmt?: string): string {
  const d = new Date(typeof raw === 'number' ? raw : String(raw))
  if (Number.isNaN(d.getTime())) return ''
  const p2 = (x: number) => String(x).padStart(2, '0')
  const map: Record<string, string> = {
    YYYY: String(d.getUTCFullYear()),
    YY: p2(d.getUTCFullYear() % 100),
    MMMM: MONTHS_LONG[d.getUTCMonth()] as string,
    MMM: MONTHS[d.getUTCMonth()] as string,
    MM: p2(d.getUTCMonth() + 1),
    DD: p2(d.getUTCDate()),
    D: String(d.getUTCDate()),
    HH: p2(d.getUTCHours()),
    mm: p2(d.getUTCMinutes()),
    ss: p2(d.getUTCSeconds()),
    Z: '+00:00', // UTC, and the recordings' sites are Etc/UTC — see the note above
  }
  // longest key first, so MMMM is not eaten by MM and DD is not eaten by D. Anything else is left
  // as typed, so an unsupported token is VISIBLE on the canvas rather than silently different.
  return (fmt ?? DEFAULT_DATE_FORMAT).replace(/YYYY|YY|MMMM|MMM|MM|DD|D|HH|mm|ss|Z/g, (k) => map[k] as string)
}

// ─── {{reading_time}} ─────────────────────────────────────────────────────────
// Recorded: the post's API `reading_time` was **0** and the helper printed **"1 min read"** — Ghost
// floors at one minute. A shim that trusted the field would print "0 min read" on every short post.

export function readingTime(
  minutes: unknown,
  opts: { minute?: string; minutes?: string } = {},
): string {
  const n = Math.max(1, Math.round(Number(minutes) || 0))
  const one = opts.minute ?? '1 min read'
  const many = opts.minutes ?? '% min read'
  return n === 1 ? one : many.split('%').join(String(n))
}

// ─── {{excerpt}} / {{custom_excerpt}} ─────────────────────────────────────────
// Recorded: `words="10"` takes the first ten whitespace-separated words; `characters="40"` takes the
// first forty characters, with no ellipsis. Always text-only and sanitised (NFR-3).

export function excerpt(
  value: unknown,
  opts: { words?: number; characters?: number } = {},
): string {
  const text = stripTags(value)
  if (opts.characters !== undefined) return text.slice(0, opts.characters)
  if (opts.words !== undefined) return text.split(/\s+/).filter((w) => w !== '').slice(0, opts.words).join(' ')
  return text
}

// ─── the four core helpers (Appendix B) ───────────────────────────────────────

/** FR-H5: `{{content_api_key}}` NEVER renders a real key on the canvas — not in a screenshot, not
 *  in a snapshot diff, not in a support session. The recording carries the key's SHAPE and not its
 *  value for the same reason (`CORE|content_api_key_shape`). */
export const CONTENT_API_KEY_PLACEHOLDER = 'content-api-key-resolved-at-deploy'
export function contentApiKey(): string {
  return CONTENT_API_KEY_PLACEHOLDER
}

/** Recorded: `https://<site>/ghost/api/content/` on both majors. */
export function contentApiUrl(siteUrl: unknown): string {
  const s = stripSlash(textValue(siteUrl))
  return s === '' ? '' : `${s}/ghost/api/content/`
}

// The thousands separator above 50 is Ghost's own `numberWithCommas()`, which is `toLocaleString()`.
// READ IN SOURCE at both target versions on 2026-09-11 — `core/frontend/utils/member-count.js` at
// tags `v5.130.6` (T3) and `v6.58.0` (T1) — because neither recording reaches four digits: both
// boxes sat at 57, which brackets to `50+` and so carries no comma, and MEASUREMENTS §15f executed
// only 45 and 57. Without that read, `1,200+` would have been this story's own rule-1 violation:
// an unexecuted claim about Ghost, in the story whose premise is cite-or-execute. `String(n)` with
// a regex rather than `toLocaleString()` because AD-1 bans every locale-sensitive read; the two
// agree for an integer under the `en` default, which is the only case that reaches here.
const withCommas = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/** `{{total_members}}` and `{{total_paid_members}}`, ALWAYS as a string (FR-H5).
 *
 *  The brackets are MEASUREMENTS §15f's, read from `core/frontend/utils/member-count.js` and
 *  executed at two counts on both majors: **≤ 50 is exact with no `+`**; 51–100 rounds down to 10;
 *  101–1,000 to 50; 1,001–10,000 to 100; 10,001–100,000 to 1,000. The PRD's own rule — "always
 *  rounded with a `+`" — is wrong below 51, which is the common case for every new site, so a
 *  design that hard-codes an "N+" shape is wrong for essentially every Inflozo customer.
 *
 *  **The two majors differ and the difference is expressed, not averaged:** at ≤ 50, Ghost 6
 *  returns a comma-formatted string and Ghost 5 a raw number; and Ghost 6's total counts GIFT
 *  subscriptions where Ghost 5's does not, so a site with gifts reports two different counts. The
 *  caller passes the count its own connected site reported, which is why that half needs no branch
 *  here.
 *
 *  Above 100,000 this REFUSES rather than guessing a shape (standing rule 1). MEASUREMENTS records
 *  only "`humanNumber` lowercased" and no execution, and the same source read as `withCommas` above
 *  shows the two majors do not even agree there — Ghost 5 humanises the bracket, Ghost 6 rounds to
 *  the nearest 10,000 first — so a single shape would be wrong on one of them. A site that big is
 *  not a case this project has ever had; capture it before relying on it. */
export function totalMembers(count: unknown, major: '5' | '6'): string {
  const n = Math.max(0, Math.floor(Number(count) || 0))
  if (n <= 50) return major === '6' ? withCommas(n) : String(n)
  const step = n <= 100 ? 10 : n <= 1000 ? 50 : n <= 10000 ? 100 : n <= 100000 ? 1000 : 0
  if (step === 0) {
    throw new Error(
      `{{total_members}} above 100,000 renders through Ghost's humanNumber and that shape is not ` +
        `recorded. Capture it before relying on it: python3 tools/probe/record-shim.py ` +
        `(MEASUREMENTS §15f — read from member-count.js, never executed at this magnitude).`,
    )
  }
  return `${withCommas(Math.floor(n / step) * step)}+`
}

// ─── {{asset}} ────────────────────────────────────────────────────────────────
// Recorded: `/assets/css/screen.css?v=<version>`. The version is the theme's on Ghost 5 and a
// per-file hash on Ghost 6 for a file that exists — a difference the CALLER supplies, because the
// shim has no filesystem (AD-1) and cannot hash anything.

export function assetUrl(path: unknown, version: unknown): string {
  const p = textValue(path).replace(/^\/+/, '')
  const v = textValue(version)
  return v === '' ? `/assets/${p}` : `/assets/${p}?v=${v}`
}

// ─── {{navigation}} ───────────────────────────────────────────────────────────
// Recorded markup, both majors:
//     <ul class="nav">
//         <li class="nav-essay"><a href="https://site/essay/">Essay</a></li>
//     </ul>
// and `nav-whats-is-that` for a label of "Whats is that?". The shim returns the ITEMS and the class
// each one carries; the caller builds the nodes, because NFR-3 says a Ghost value reaches the page
// as a text node and a function with no DOM cannot break that rule.

export type NavItem = { label: string; url: string; current: boolean; className: string }

/** Ghost's own slug shape for a nav class, from the recording: lowercase, every run of non-alphanumerics
 *  becomes one hyphen, no leading or trailing hyphen. */
export function navSlug(label: unknown): string {
  return textValue(label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function navigationItems(
  items: readonly { label?: unknown; url?: unknown; current?: unknown }[] = [],
  opts: { currentUrl?: string } = {},
): NavItem[] {
  return items.map((i) => {
    const url = ghostUrl(i.url)
    const current = i.current === true || (opts.currentUrl !== undefined && url === opts.currentUrl)
    const slug = navSlug(i.label)
    return {
      label: textValue(i.label),
      url,
      current,
      className: `nav-${slug}${current ? ' nav-current' : ''}`,
    }
  })
}

// ─── pagination ───────────────────────────────────────────────────────────────
// Recorded on `/page/2/` of a 33-post feed at 12 per page, both majors:
//   page 2 · pages 3 · limit 12 · total 33 · next 3 · prev 1
//   {{page_url pagination.prev}} -> "/"   {{page_url pagination.next}} -> "/page/3/"

export type PaginationContext = {
  page: number
  pages: number
  limit: number
  total: number
  next: number | null
  prev: number | null
}

export function paginationContext(raw: Readonly<Record<string, unknown>> = {}): PaginationContext {
  const num = (v: unknown): number => Math.max(0, Math.floor(Number(v) || 0))
  const page = Math.max(1, num(raw['page']) || 1)
  const pages = Math.max(1, num(raw['pages']) || 1)
  return {
    page,
    pages,
    limit: num(raw['limit']),
    total: num(raw['total']),
    next: page < pages ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
  }
}

/** `{{page_url n}}`. `base` is the archive the feed sits on — `/` on the home feed, `/tag/craft/`
 *  on a tag archive. The tag archive had one page when the recording was made, so only the `/` case
 *  is recorded; the `base` parameter exists so the other case is a caller's input rather than a
 *  second rule invented here. */
export function pageUrl(n: unknown, base = '/'): string {
  const page = Math.floor(Number(n) || 0)
  const b = base.endsWith('/') ? base : `${base}/`
  return page <= 1 ? b : `${b}page/${page}/`
}

// ─── the truthy helpers ───────────────────────────────────────────────────────

const MATCH_OPS: Readonly<Record<string, (a: unknown, b: unknown) => boolean>> = {
  // Ghost compares the RENDERED values, so `12` and `"12"` match — the canvas must too, or a tier
  // badge appears on one side and not the other.
  '=': (a, b) => String(a) === String(b),
  '==': (a, b) => String(a) === String(b),
  '!=': (a, b) => String(a) !== String(b),
  '>': (a, b) => Number(a) > Number(b),
  '<': (a, b) => Number(a) < Number(b),
  '>=': (a, b) => Number(a) >= Number(b),
  '<=': (a, b) => Number(a) <= Number(b),
}

/** `{{#match a "op" b}}`, and the two-argument form `{{#match a b}}` which is `=`. A tier badge
 *  tests `{{#match visibility "paid"}}`, never `!== 'public'` (FR-H6). */
export function match(a: unknown, opOrB: unknown, b?: unknown): boolean {
  if (b === undefined) return String(a) === String(opOrB)
  const op = MATCH_OPS[String(opOrB)]
  if (op === undefined) {
    throw new Error(`{{#match}} operator "${String(opOrB)}" is not one of ${Object.keys(MATCH_OPS).join(' ')}`)
  }
  return op(a, b)
}

/** `{{#is "index, home"}}` — a comma-separated list of contexts, true if the current one is in it. */
export function is(current: readonly string[] | string, names: string): boolean {
  const have = new Set(typeof current === 'string' ? [current] : current)
  return names.split(',').map((n) => n.trim()).filter((n) => n !== '').some((n) => have.has(n))
}

/** `{{#if @member}}` — FR-D16's canvas member-state toggle, and R-28: a member's own details are
 *  never server-rendered into markup, so this answers a QUESTION and never returns a field. */
export function isMember(member: unknown): boolean {
  return member != null && member !== false
}

// ─── {{#get}} → a Content API query ───────────────────────────────────────────
//
// The declaration lives in `design.json`'s `dataBindings` and the markup names it by key, so there
// is no place in a design where a filter could be composed (AD-36, "validated, never interpolated").
// Recorded: `filter="tag:craft+featured:true" limit="3" order="published_at desc"` returned exactly
// three slugs on both majors, and the NQL builds each major resolves differ (MEASUREMENTS §15g:
// nql 0.12.7 on Ghost 5, 0.13.4 on Ghost 6) while both answer these filters identically.

export type ContentQuery = {
  resource: string
  params: Record<string, string>
}

/** FR-H5, and a registry-level constraint binding every design authored later: a `{{#get}}` filter
 *  may reference only TEMPLATE-level context, never the current render context. Handlebars is
 *  synchronous and `{{#get}}` is not, so a filter naming the current row cannot be resolved — it
 *  would silently query for the literal text. */
const RENDER_CONTEXT = /\{|\}|@|\bthis\b|\.\.\//

export function getQuery(
  key: string,
  bindings: Readonly<Record<string, DataBinding>> = {},
): ContentQuery[] {
  const b = bindings[key]
  if (b === undefined) {
    throw new Error(
      `data-repeat="${key}" names no dataBindings key. A {{#get}} is DECLARED in design.json and ` +
        `referenced by key from the markup — declared: ${Object.keys(bindings).join(', ') || '(none)'}.`,
    )
  }
  if (!(GET_SOURCES as readonly string[]).includes(b.source)) {
    throw new Error(`dataBindings.${key}.source "${b.source}" is not queryable — ${GET_SOURCES.join(', ')}.`)
  }
  if (b.ids !== undefined) {
    // R-20's hand-picked order: N single-id gets, IN THIS ORDER. One query each, because the order
    // is the point and a filter would return them in the API's order instead.
    return b.ids.map((id) => ({ resource: b.source, params: { filter: `id:${id}`, limit: '1' } }))
  }
  if (b.filter !== undefined && RENDER_CONTEXT.test(b.filter)) {
    throw new Error(
      `dataBindings.${key}.filter references render context. A {{#get}} filter may name TEMPLATE-level ` +
        `context only (FR-H5): Handlebars is synchronous and {{#get}} is not, so a filter naming the ` +
        `current row would query for its literal text.`,
    )
  }
  const params: Record<string, string> = {}
  if (b.filter !== undefined) params['filter'] = b.filter
  if (b.limit !== undefined) params['limit'] = String(b.limit)
  if (b.order !== undefined) params['order'] = b.order
  return [{ resource: b.source, params }]
}

/** The theme half of the same declaration — `{{#get "posts" filter="…" limit="…"}}`. Built from the
 *  VALIDATED parts, never concatenated from markup (AD-36 2). */
export function getExpr(key: string, bindings: Readonly<Record<string, DataBinding>> = {}): string {
  const queries = getQuery(key, bindings)
  const first = queries[0] as ContentQuery
  const hash = Object.entries(first.params)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('')
  return `{{#get "${first.resource}"${hash}}}`
}

// ─── the bare helpers (`data-helper`, §7.3 gap row 9) ─────────────────────────

export type ShimContext = {
  /** the Ghost render context — `@site`, the post, the tag, whatever the template has */
  ghost?: Readonly<Record<string, unknown>>
  /** the connected site, or absent on an unlinked project */
  siteUrl?: string
  /** which major the connected site runs. `{{total_members}}` needs it; nothing else does. */
  major?: '5' | '6'
  /** Story 4.4's fixtures. `{{content}}` and `{{comments}}` resolve to what the shim is HANDED —
   *  with none it refuses rather than inventing a body (FR-H3). */
  fixtures?: Readonly<Record<string, string>>
  /** the member count the connected site reported, or absent on an unlinked project */
  members?: { total?: number; paid?: number }
}

/** Every `data-helper` value, resolved. A helper with no fixture and no value REFUSES by name —
 *  rendering an empty body or an invented one is the failure FR-H3 exists to prevent. */
export function bareHelper(name: string, ctx: ShimContext = {}): string {
  const ghost = ctx.ghost ?? {}
  switch (name) {
    case 'content':
    case 'comments': {
      const fixture = ctx.fixtures?.[name]
      if (fixture === undefined) {
        throw new Error(
          `{{${name}}} resolves to Story 4.4's ${name} fixture and none was supplied. The shim ` +
            `refuses rather than rendering an empty body or an invented one (FR-H3).`,
        )
      }
      return fixture
    }
    case 'navigation':
      // the caller builds the nodes from `navigationItems` — see NFR-3 above
      throw new Error('{{navigation}} resolves to a list of items: call navigationItems() and build nodes')
    case 'total_members':
      return totalMembers(ctx.members?.total ?? 0, ctx.major ?? '6')
    case 'content_api_key':
      return contentApiKey()
    case 'statusCode':
      return textValue(ghost['statusCode'])
    case 'message':
      return textValue(ghost['message'])
    default:
      throw new Error(`"${name}" is not a bare helper`)
  }
}
