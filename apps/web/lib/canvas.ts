// ONE PER-SECTION RENDER, for every page that draws sections into the canvas document (Story 5.1): `/pilots` and the
// editor call `renderSection` and nothing else, so the two emit the same markup for the same design and state. Client-safe —
// no `node:` import — because both call it in the browser, writing into a same-origin iframe that carries no script.
//
// Extracted from `pilots/review.tsx`'s `paint()` and `shown()` (Story 4.10) without a change in behaviour.

import { DEFAULT_LIMIT, orbitWeekly, postAccess, safeCssColor } from '@inflozo/library'
import type { DataBinding, IconLookup, SectionRegistryEntry, Visitor } from '@inflozo/library'
import { contentCta, renderCanvas, withData } from '@inflozo/section-runtime'
import { PAYWALL_WORDS } from './paywall.ts'
import type { ControlState, MemberState, RuntimeDocument } from '@inflozo/section-runtime'
import { reader, SETTINGS, siteRows, siteSource, sitePieces, zoneOf, type LiveQuery, type Look, type Row } from './live-content.ts'

/** A section's queries' rows, each in both orders at the Count's ceiling (`sampleRows`, `siteRows`). */
export type DesignRows = Readonly<Record<string, { newest: readonly unknown[]; oldest: readonly unknown[] }>>

/** One set of queries — a design's declared ones, or since Story 5.19 an instance's FOLDED ones and its secondary feed's. */
export type Queries = Readonly<Record<string, DataBinding>>

/** ponytail: one entry per distinct query a session asks of the bundled publication, which never changes — a handful
 *  per page. Bound it the day a session can ask thousands. */
const sampled = new Map<string, { newest: readonly unknown[]; oldest: readonly unknown[] }>()

/**
 * STORY 5.19 — THE SAMPLE'S ROWS FOR THESE QUERIES, in `DesignRows`' shape: each at the Count's ceiling in both date
 * orders, and a fixed query or a hand-picked list its own resolution (the picks in their dragged order, a pick the
 * sample does not hold skipped — as Ghost's per-id get renders nothing for it). Resolved in the browser with the
 * library's own `orbitWeekly.resolveSource`, because since the Data group a query is the INSTANCE's: a Source, a tag,
 * a writer or a list of picks the server cannot know per design. ONE function for the canvas, the Section Picker's
 * cards, the ring's tiles, the controls review and `pilotRows`, so a design's declared queries resolve exactly as they
 * did (`pilots.test.ts` holds the two to one answer).
 */
export function sampleRows(queries: Queries | undefined): DesignRows {
  return Object.fromEntries(
    Object.entries(queries ?? {}).map(([key, b]) => {
      // one entry per QUERY: the value holds the ceiling in both orders, so the Count and the Order decide nothing here
      // and a stepper pressed nine times is one entry, not nine (review, 2026-09-25)
      const id = JSON.stringify(b.fixed === true || b.ids !== undefined ? b : { ...b, limit: undefined, order: undefined })
      let both = sampled.get(id)
      if (both === undefined) {
        if (b.fixed === true || b.ids !== undefined) {
          const own = orbitWeekly.resolveSource(b)
          both = { newest: own, oldest: own }
        } else {
          both = {
            newest: orbitWeekly.resolveSource({ ...b, limit: 100, order: 'published_at desc' }),
            oldest: orbitWeekly.resolveSource({ ...b, limit: 100, order: 'published_at asc' }),
          }
        }
        sampled.set(id, both)
      }
      return [key, both]
    }),
  )
}

/** One query's rows as the canvas shows them: the stored Order picks the list and the Count slices it; a hand-picked
 *  list shows every pick it found (never Ghost's default fifteen — past 25 is allowed, P0·5); a query with neither
 *  shows Ghost's default. */
export function rowsFor(binding: DataBinding, both: { newest: readonly unknown[]; oldest: readonly unknown[] } | undefined): unknown[] {
  const list = binding.order === 'published_at asc' ? both?.oldest : both?.newest
  const fallback: unknown = DEFAULT_LIMIT[binding.source as keyof typeof DEFAULT_LIMIT]
  const cap = binding.ids !== undefined ? binding.ids.length : binding.limit ?? (typeof fallback === 'number' ? fallback : 100)
  return (list ?? []).slice(0, cap)
}

/** What a template hands a section — `orbitWeekly.templateContext`'s answer, or the same assembly over the site's rows. */
export type RenderContext = ReturnType<typeof orbitWeekly.assemble>

/** STORY 5.18 — ONE PAGE OF THE CONNECTED SITE, from the rows in hand. */
export type SitePage = {
  /** the subject this page renders, resolved by the library's own `resolveSubject` against the site */
  subject: orbitWeekly.Subject | null
  /** the stored subject's own source answered, and does not hold it (FR-D22's "no longer there") */
  fellBack: boolean
  /** the site as a `ContentSource` — what `feedPages` and `lib/page-two.ts` ask of the source in force */
  source: orbitWeekly.ContentSource
  /** how many pages the list this page renders runs to — page 1's own count */
  pages: number
  /** `@site`, whitelisted */
  site: Row
  /** the site's time zone, which the panel names under a date */
  zone: string
  /** the render context for a section at each target */
  contexts: Readonly<Record<string, RenderContext>>
  /** each set of queries' rows, in `DesignRows`' shape, by the key `sitePage` was handed it under */
  rows: Readonly<Record<string, DesignRows>>
}

/**
 * STORY 5.18 — THE SITE'S CONTENT FOR ONE PAGE, OR WHAT IT STILL NEEDS. ONE walk over the cache (`lib/live-content.ts`'s
 * reader) says both, so a paint never starts a read and a read never paints half a page: `need` lists every read not
 * in hand, and only a walk that misses nothing is `ready` — A RENDER IS ONE SOURCE THROUGHOUT. `nothing` is a Tag or
 * Author page on a site with no tags or writers of its own, which previews the sample's and says why.
 *
 * The subject is the LIBRARY's `resolveSubject` asked of the site (`siteSource`), and each target's context is the
 * library's `assemble` over the site's pieces — the very functions the bundled path runs — so the two cannot drift.
 */
export function sitePage(
  look: Look,
  o: {
    /** the canvas's own file, which decides the subject's kind */
    file: string
    /** the subject stored for this canvas, whichever source it was chosen from */
    stored: orbitWeekly.Subject | null | undefined
    /** the page shown, and the file its own sections render at (`index.hbs` on Home's page 2) */
    page: 1 | 2
    pageFile: string
    /** every target a section on this page renders at */
    targets: readonly string[]
    /** every set of queries the page asks, by a key of the caller's own — each section's FOLDED queries and its
     *  secondary feed's (Story 5.19), or a card's design's declared ones — for their rows */
    queries: Readonly<Record<string, Queries>>
    /** Story 5.19 — the project's `posts_per_page`: the size of every page of a list, on the site as on the sample */
    perPage: number
    /** Story 5.20 — the visitor each post's `access` is re-read for; omitted, every row is the row Ghost answered */
    visitor?: Visitor
  },
): { need: readonly LiveQuery[] } | { nothing: 'tag' | 'author' } | { ready: SitePage } {
  const r = reader(look)
  const kind = orbitWeekly.subjectKindOf(o.file)
  const w = { kind, styleGuide: { post: orbitWeekly.subject('post'), page: orbitWeekly.subject('page') }, perPage: o.perPage }
  const source = siteSource(w, r)
  const { subject, fellBack } = orbitWeekly.resolveSubject(o.file, o.stored, source)
  // the subject waits on a read (R-193's list, or the stored one's own `filter=slug:`): what depends on it waits too,
  // and everything that does not — `@site`, every `{{#get}}` — is asked for in the same round
  const unresolved = r.need.length > 0
  const site = r.got(SETTINGS)?.rows[0]
  const zone = zoneOf(site)
  const rows = Object.fromEntries(Object.entries(o.queries).map(([key, queries]) => [key, siteRows(queries, r, zone)]))
  if (unresolved) return { need: r.need }
  if ((kind === 'tag' || kind === 'author') && subject === null) return { nothing: kind }
  // page 1's own count is always read: whether a page 2 exists is decided by it alone (§51 — past the last page Ghost
  // answers `200 []`), and a subject whose archive fits one page takes page 2 away (R-176)
  const pages = source.pages(o.pageFile, subject)
  const contexts = Object.fromEntries(o.targets.map((t) => [t, orbitWeekly.assemble(t, sitePieces(w, subject, t, o.page, r), o.visitor)]))
  if (r.need.length > 0 || site === undefined) return { need: r.need }
  return { ready: { subject, fellBack, source, pages, site, zone, contexts, rows } }
}

/** The build this page was published from, in the canvas document's address (the owner's ruling of 2026-09-20,
 *  Question 5). It is what lets the document be cached `immutable`: a publish changes the address, so a new
 *  stylesheet is picked up at once and a stale one can never be served. `next.config.ts` inlines it. */
const V = process.env.INFLOZO_CANVAS_V || 'dev'

/** The canvas document's own address, beside the page: `/canvas` on the app host, `/app/canvas` on localhost. */
export const canvasSrc = (appPrefixed: boolean) => `${appPrefixed ? '/app' : ''}/canvas?v=${V}`

/** The keyboard harness's own copy of it (R-146), which differs from the app's in its guard and nothing else. */
export const harnessCanvasSrc = () => `/app/harness/canvas?v=${V}`

/** THE SAME DOCUMENT, NARROWED TO ONE DESIGN — a Section Picker preview's address (the owner's ruling of
 *  2026-09-20). A preview draws exactly one section, so it carries exactly one stylesheet; the editor's canvas,
 *  which may draw any of them, keeps `canvasSrc`. A picture inside it still resolves against the document's own
 *  address, and relative resolution drops a query, so `canvas?image=x` lands on the unnarrowed route as before. */
export const previewSrc = (src: string, designId: string) =>
  `${src}${src.includes('?') ? '&' : '?'}design=${encodeURIComponent(designId)}`


/** Orbit Weekly's pictures, pointed at the canvas route — relative, so the canvas document resolves it against its
 *  own address. The one place the reserved origin is mapped for a canvas. */
export const withImages = (html: string) =>
  html.replace(new RegExp(`${orbitWeekly.ORBIT_WEEKLY_ORIGIN.replace(/[.]/g, '\\.')}/images/([a-z0-9-]+)\\.svg`, 'g'), 'canvas?image=$1')

/** An asset id resolves only through this map (AD-27(b)), relative to the canvas document. */
export const canvasAssets = (pool: readonly { id: string }[]) => Object.fromEntries(pool.map((a) => [a.id, `canvas?image=${a.id}`]))

/** DW-209 (Story 5.11): a wheel that lands on a pill drawn OVER the canvas is forwarded to the canvas document, the
 *  one the pointer looks like it is over — the editor's page does not scroll, so the canvas simply stalled while the
 *  pointer rested on a pill. A wheel may report LINES or PAGES rather than pixels; the line step is the browser's own
 *  rough 16px. ONE implementation for the editor and `/controls` (review, 2026-09-20: it had been written twice). */
export function wheelToFrame(win: Window | null | undefined, deltaX: number, deltaY: number, deltaMode: number) {
  if (!win) return
  const k = deltaMode === 1 ? 16 : deltaMode === 2 ? win.innerHeight : 1
  win.scrollBy(deltaX * k, deltaY * k)
}

/** Each query's rows as the canvas shows them, through the ONE fold (`withData`) — `rowsFor` per query. */
export const shownRows = (entry: SectionRegistryEntry, state: ControlState, rows: DesignRows | undefined) =>
  Object.fromEntries(Object.entries(withData(entry.dataBindings, state.data)).map(([key, binding]) => [key, rowsFor(binding, rows?.[key])]))

/** One section's canvas markup, pictures mapped. Throws when the design cannot be drawn — the caller says so loudly. */
export function renderSection(
  doc: Document,
  entry: SectionRegistryEntry,
  state: ControlState,
  o: {
    target: string
    rows: DesignRows | undefined
    feed: orbitWeekly.FeedState
    member: Exclude<MemberState, 'everyone'>
    visibility: MemberState
    assets: Readonly<Record<string, string>>
    icons: IconLookup
    /** Story 5.3 — the editor asks for the editing stamps (`takeStamps` lifts them off as it mounts); `/pilots` does not */
    editing?: boolean
    /** Story 5.13 — WHICH post, page, tag or author this canvas renders (FR-D22), already resolved against the
     *  source by `orbitWeekly.resolveSubject`. Omitting it keeps the render exactly as it was, which is why
     *  `/pilots`, `tools/check-snapshots.mjs` and the render matrix are untouched — and is the story's control. */
    subject?: orbitWeekly.Subject | null
    /** Story 5.16 — THE PAGE'S OWN ADDRESS (`/`, `/page/2/`, `/tag/<slug>/`…), handed to the render as
     *  `site.currentUrl` so `{{navigation}}` marks what Ghost marks there (`utils.js:61`, an exact match only). The
     *  editor hands the SAME address to every section of a page — the header renders at `default.hbs`, which on its own
     *  would always answer `/`. Omitting it is exactly today's render: `/pilots`, the picker's cards and the ring's
     *  tiles pass none. */
    url?: string
    /** Story 5.16a — THE PAGE'S OWN NUMBER, for `{page_number}` (R-182). Handed in for the same reason `url`
     *  is: the header renders at `default.hbs`, which answers no pagination of its own, so the editor tells
     *  every section of a page the one number the visitor sees. Omitting it is exactly today's render —
     *  `/pilots`, the picker's cards and the ring's tiles pass none, and the token then resolves to NOTHING
     *  rather than to a page-1 number (R-186: never a number on page 1, on a post, a standalone page or the
     *  404). Only page 2 is ever given one. */
    page?: number
    /** Story 5.18 — THE CONNECTED SITE'S CONTENT for this section: the assembled context at its target and its design's
     *  `{{#get}}` rows (`sitePage`). Omitting it is exactly today's call — the bundled publication through
     *  `templateContext` and `o.rows` — which is why `/pilots`, `tools/check-snapshots.mjs`, the render matrix and the
     *  keyboard harness are untouched and are the story's control. */
    live?: { context: RenderContext; rows: DesignRows | undefined }
    /** Story 5.19 — the project's `posts_per_page`, which sizes the page's own list on the sample as on the site. Omitting
     *  it is the dataset's, today's render — `/pilots`, the snapshots, the matrix, the picker's cards and the tiles. */
    perPage?: number
    /** Story 5.19 — this section is a SECONDARY feed: its own query and the rows it returned, which the runtime renders
     *  in place of the page's native posts, with no pager (`RenderInput.feed`). Omitted: the main feed, or no feed. */
    secondary?: { query: DataBinding; rows: readonly unknown[] }
    /** Story 5.20 — the visitor whose `access` each post in the sample's context is re-read for (`postAccess`, Ghost's own
     *  rule), so `{{#if access}}`, the cut and the reading time answer for the visitor View as previews. Omitting it is
     *  exactly today's render — `/pilots`, the snapshots, the matrix, the picker's cards and the ring's tiles pass none. */
    visitor?: Visitor
  },
): string {
  const ctx = o.live?.context ?? orbitWeekly.templateContext(o.target, o.feed, o.subject, o.perPage, o.visitor)
  const site = o.url === undefined ? ctx.site : { ...ctx.site, currentUrl: o.url }
  return withImages(renderCanvas(doc as unknown as RuntimeDocument, entry.html, {
    target: o.target,
    content: state.content,
    schema: entry.contentSchema,
    controlSchema: entry.controlSchema,
    universals: entry.universals,
    controls: state.controls,
    data: state.data,
    dataBindings: entry.dataBindings,
    getRows: shownRows(entry, state, o.live === undefined ? o.rows : o.live.rows),
    ghost: ctx.ghost,
    site,
    member: o.member,
    visibility: o.visibility,
    assets: o.assets,
    icons: o.icons,
    editing: o.editing,
    ...(o.page === undefined ? {} : { tokens: { page_number: String(o.page) } }),
    ...(o.secondary === undefined ? {} : { feed: o.secondary }),
  }))
}

/** STORY 5.20 — THE MAJOR the Paywall canvas previews: the style-guide's own (`style-guide.ts`' `PREVIEW_MAJOR`, T1's,
 *  the one the card chunks were vendored from). Ghost's box differs between the majors by one line's indent (§54). */
export const SURFACE_MAJOR: orbitWeekly.Major = '6'

const escText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The article's audio and video cards point at the reserved origin, and no media is bundled (`style-guide.ts`'s
 *  `withImages` says so): on the canvas document, whose policy is `default-src 'self'`, each player's `preload` fetch is
 *  a refused request and a `securitypolicyviolation` (the deployed editor walk's step 5, at Story 5.20's Dev). So the
 *  players are drawn with no source — their chrome, and nothing to play, which is all they ever played. */
const MEDIA_SRC = new RegExp(`\\ssrc="${orbitWeekly.ORBIT_WEEKLY_ORIGIN.replace(/[.]/g, '\\.')}/media/[^"]*"`, 'g')
export const withoutMedia = (html: string): string => html.replace(MEDIA_SRC, '')

/**
 * STORY 5.20 — THE PAYWALL CANVAS'S PAGE (C3a as corrected, `C Post Body.dc.html:1423-1472`): the style-guide article
 * previewed as a Paid-members-only post — never a real body (FR-D16, FR-H4) — in the wrapper a theme gives `{{content}}`,
 * `.gh-content`, which the canvas document's surface stylesheet styles (`style-guide.ts`' `surfaceCss`).
 *
 * WHO MAY READ IT IS GHOST'S OWN RULE (`postAccess`, one port of `checkPostAccess`). A visitor who may not meets the
 * article's preview — up to the SIMULATED Public preview marker after `PREVIEW_CUT` — then C3a's cut marker, then `box`:
 * the paywall instance's own markup, or Ghost's own box where none is chosen. A visitor who may read it meets the whole
 * article, S4d's gated rule where the locked part begins (R-199), and NO box — Ghost renders the partial only where
 * access is false (`content.js:50-52`). The article is context either way, so it is dimmed in both.
 *
 * `box` IS WRITTEN WHOLE, and both of its sources are trusted: the runtime's own render, and `contentCta`'s constants
 * with the accent through the colour parser. Every other word here is `PAYWALL_WORDS`' constant.
 */
export function paywallPage(o: { visitor: Visitor; accent: unknown; box: string | null }): string {
  const blocks = orbitWeekly.blocks(SURFACE_MAJOR, 'article')
  const whole = postAccess({ visibility: 'paid' }, o.visitor)
  const at = orbitWeekly.PREVIEW_CUT + 1
  const run = (from: number, to?: number) => withoutMedia(blocks.slice(from, to).map((b) => b.html).join(''))
  const box = o.box ?? contentCta({ visibility: 'paid', member: o.visitor !== 'anonymous', accent: o.accent, major: SURFACE_MAJOR })
  const tail = whole
    ? `<div data-inflozo-gated><span>${escText(PAYWALL_WORDS.gated)}</span></div>${run(at)}`
    : `<div data-inflozo-cut><span data-inflozo-cut-label>${escText(PAYWALL_WORDS.cut)}</span><span data-inflozo-cut-note>${escText(PAYWALL_WORDS.below)}</span></div><div data-inflozo-box>${box}</div>`
  // the accent Ghost's `{{ghost_head}}` hands the card stylesheet, as the style guide sets it — through the colour parser
  const accent = safeCssColor(o.accent, '--accent').replace(/"/g, '&quot;')
  return withImages(`<main style="padding:40px 0 56px;--ghost-accent-color:${accent}"><article class="gh-content" data-inflozo-dim>${run(0, at)}${tail}</article></main>`)
}

/** Writes sections into the mount and puts every module mount in its JavaScript branch, with no script running:
 *  the `js-enabled` class `core` sets on a live page (Story 4.7). It is `/pilots`' and the Section Picker's cards'
 *  look of a page with JavaScript on. The editor's canvas is NOT drawn through this since Story 5.15: there `core`
 *  itself runs, holding every module that is not edit-safe at rest while designing (`lib/behaviours.ts`). */
export function mountSections(mount: Element, html: string) {
  mount.innerHTML = html
  for (const el of mount.querySelectorAll('[data-module]')) el.classList.add('js-enabled')
}
