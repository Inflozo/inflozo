// Story 4.11 — NFR-6(a)'s render matrix: the CASE LIST, derived and never written down. Pure: no browser, no server,
// no clock, so the derivation has a test (`cases.test.mjs`, in `pnpm test`) and the matrix itself only photographs.
//
// Every axis is read from what exists, and this file restates none of them as a number (standing rule 4):
// - DESIGNS are the directory `packages/library/designs/{category}/{n}/`, through `pilotIds()` and `pilot()` in
//   `apps/web/lib/pilots.ts` — the same door, validation included, the editor's pilots page reads;
// - PACKS are the token sets that exist: every `*-tokens.css` beside the runtime. Epic 6 widens it (DW-169);
// - MODES and VIEWPORTS are NFR-6(a)'s own: light/dark × 1440, 834, 390, 1440 at 200% zoom, 1440 with motion reduced;
// - FIXTURE ROWS come from what the design IS, the way `/pilots` decides its own switcher (`paginates`, member arms).
//
// The FR-H3 fixture pins, each DERIVED rather than listed, so a pin arrives with its category:
//   A34  feed first · middle · partial last (+ empty, FR-H4)  ← the design paginates (`data-pagination=`)
//   A33  the style-guide post                                  ← `bindingContext` carries `post`, placed on post.hbs
//   A25  the style-guide post AND page                         ← the same, once per post.hbs / page.hbs it compiles to
//   A32  a gated post.hbs                                      ← not derivable yet: Orbit Weekly carries no gated subject;
//                                                                the row lands with the fixture, from the markup's `access`
//   an empty tag                                               ← the paginating design's `empty` row, at its own target
//   the six synthesized stacks                                 ← Epic 7's templates, not designs; they join this list as
//                                                                directories when the compiler synthesizes them (Story 7.35)
// A design whose markup gates by member (`data-members=`) is photographed once per visitor, and once per Show-to
// audience as a visitor it HIDES from — an arm shown to its own audience draws exactly the visitor arm's pixels, so
// the one Show-to state with pixels of its own is the section gone (the owner's `/pilots` test step 10).

import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const RUNTIME = join(REPO, 'packages/section-runtime')

const pilots = await import(join(REPO, 'apps/web/lib/pilots.ts'))
const { imagePool } = await import(join(REPO, 'apps/web/lib/controls-review.ts'))
const lib = await import(join(REPO, 'packages/library/src/index.ts'))
const rt = await import(join(REPO, 'packages/section-runtime/src/index.ts'))

export const { pilot, pilotIds, pilotRows, pilotImage, pilotsCanvasDocument } = pilots
export const ORIGIN = lib.orbitWeekly.ORBIT_WEEKLY_ORIGIN

export const MODES = ['light', 'dark']
/** 200% browser zoom is the 1440 window at half the CSS pixels and twice the device pixels; reduced motion is the
 *  query forced. Height follows the section, as the editor's iframe does, so it is not an axis. */
export const VIEWPORTS = [
  { name: '1440', width: 1440 },
  { name: '834', width: 834 },
  { name: '390', width: 390 },
  { name: '1440-zoom-200', width: 720, deviceScaleFactor: 2 },
  { name: '1440-reduced-motion', width: 1440, reducedMotion: 'reduce' },
]
const FEEDS = ['first', 'middle', 'last', 'empty']
/** The templates a `post`-context design is photographed on, and the Orbit Weekly subject each hands it. */
const SUBJECTS = { 'post.hbs': 'style-guide-post', 'page.hbs': 'style-guide-page' }

/** The token sets that exist, by name: `reference-tokens.css` is `reference`. */
export const packs = () => readdirSync(RUNTIME).filter((f) => f.endsWith('-tokens.css')).sort().map((f) => f.slice(0, -'-tokens.css'.length))
export const packCss = (pack) => join(RUNTIME, `${pack}-tokens.css`)

/** A design's own fixture rows: every combination of the axes its markup and context declare, `[{ name: '' }]` when
 *  it declares none. Each row is a partial render input plus the name its baseline file carries. */
export function fixtureRows(entry) {
  const axes = []
  if (/\bdata-pagination=/.test(entry.html)) axes.push(FEEDS.map((feed) => ({ name: `feed-${feed}`, feed })))
  if (/\bdata-members=/.test(entry.html)) {
    const visitors = lib.MEMBER_STATES.filter((s) => s !== 'everyone')
    axes.push([
      ...visitors.map((member) => ({ name: `visitor-${member}`, member })),
      ...visitors.map((visibility) => ({ name: `show-to-${visibility}`, visibility, member: visitors.find((v) => v !== visibility) })),
    ])
  }
  const placed = entry.bindingContext.includes('post') ? entry.compileTarget.filter((t) => t in SUBJECTS) : []
  axes.push(placed.length > 0 ? placed.map((target) => ({ name: SUBJECTS[target], target })) : [{ name: '', target: entry.compileTarget[0] }])
  return axes.reduce((rows, axis) => rows.flatMap((r) => axis.map((a) => ({ ...r, ...a, name: [r.name, a.name].filter(Boolean).join('-') }))), [{ name: '' }])
}

/** `MATRIX_DESIGNS` narrows the run to the designs a push touched: ids (`a1/1`) or whole categories (`a1`). */
export const selected = (id, only) => only.length === 0 || only.some((o) => id === o || id.startsWith(`${o}/`))
export const only = () => (process.env.MATRIX_DESIGNS ?? '').split(/[\s,]+/).filter(Boolean)

/** Every case: design × pack × mode × viewport × the design's own rows. */
export function cases(filter = only()) {
  const ids = pilotIds().filter((id) => selected(id, filter))
  // a filter that names no design (a typo, a removed design) must not pass as a matrix of zero cases
  if (filter.length > 0 && ids.length === 0) throw new Error(`MATRIX_DESIGNS names no design under packages/library/designs/: ${filter.join(' ')}`)
  return ids.flatMap((id) => {
    const entry = pilot(id)
    const [category, n] = id.split('/')
    return packs().flatMap((pack) => MODES.flatMap((mode) => VIEWPORTS.flatMap((viewport) => fixtureRows(entry).map((row) => {
      const slug = [pack, mode, viewport.name, row.name].filter(Boolean).join('-')
      return { id, category, n, pack, mode, viewport, row, title: `${id} · ${slug}`, snapshot: [category, n, `${slug}.png`] }
    }))))
  })
}

/** The totals a run prints, from its own list. */
export const totals = (list) => ({
  cases: list.length,
  designs: new Set(list.map((c) => c.id)).size,
  packs: new Set(list.map((c) => c.pack)).size,
})

/**
 * THE RENDER INPUT, mirroring `renderSection()` in `apps/web/lib/canvas.ts` — the one per-section render `/pilots`' and
 * the editor's `paint()` both call since Story 5.1 — with nothing changed
 * in the panel: content and controls at their defaults, Orbit Weekly's rows as the page's `shown()` picks them (the
 * stored Order's list, sliced to the limit or Ghost's default), `templateContext` at the row's target and feed, the
 * row's visitor and Show-to, the picture pool's asset ids and the icon set. Pictures keep their real origin: the
 * matrix serves it (serve.mjs) where the page rewrites it to its frame route, so nothing here rewrites a URL.
 */
export function renderInput(entry, row, icons) {
  const target = row.target ?? entry.compileTarget[0]
  const ctx = lib.orbitWeekly.templateContext(target, row.feed ?? 'first')
  const rows = pilotRows(entry)
  const getRows = Object.fromEntries(Object.entries(rt.withData(entry.dataBindings, {})).map(([key, binding]) => {
    const both = rows[key]
    const list = binding.order === 'published_at asc' ? both?.oldest : both?.newest
    const fallback = lib.orbitWeekly.DEFAULT_LIMIT[binding.source]
    return [key, (list ?? []).slice(0, binding.limit ?? (typeof fallback === 'number' ? fallback : 100))]
  }))
  // the same pool the page hands `paint()` — one reader, so the matrix cannot photograph a pool the editor lacks
  const pool = imagePool().map((a) => a.id)
  return {
    target,
    content: rt.defaultContent(entry.contentSchema),
    schema: entry.contentSchema,
    controlSchema: entry.controlSchema,
    universals: entry.universals,
    controls: {},
    data: {},
    dataBindings: entry.dataBindings,
    getRows,
    ghost: ctx.ghost,
    site: ctx.site,
    member: row.member ?? 'anonymous',
    visibility: row.visibility ?? 'everyone',
    assets: Object.fromEntries(pool.map((id) => [id, `${ORIGIN}/images/${id}.svg`])),
    icons,
  }
}

export const renderCanvas = rt.renderCanvas
