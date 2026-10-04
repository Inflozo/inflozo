// Story 4.11 — NFR-6(a)'s render matrix: the CASE LIST, derived and never written down. Pure: no browser, no server,
// no clock, so the derivation has a test (`cases.test.mjs`, in `pnpm test`) and the matrix itself only photographs.
//
// Every axis is read from what exists, and this file restates none of them as a number (standing rule 4):
// - DESIGNS are the directory `packages/library/designs/{category}/{n}/`, through `pilotIds()` and `pilot()` in
//   `apps/web/lib/pilots.ts` — the same door, validation included, the editor's pilots page reads;
// - PACKS are the owner's three reference packs, `REFERENCE_PACKS` in `packages/library/packs/` (R-234, Story 6.2 — DW-169):
//   Paper, Mono (off Paper's step on buttons and gutters, DW-317) and Neon; each case's document carries its pack's block
//   and faces, as `/canvas?pack=` does;
// - SPECIMENS are one per pairing of the font pool (R-233, DW-313): a heading, a paragraph with a bold and an italic run,
//   tabular figures and latin-ext letters, in Paper's palette with that pairing's faces, light, at 1440 — this file owns it.
//   Story 6.4 (DW-324): every role is drawn at BOTH ENDS of the weights `pool.json` declares for it — the heading's range
//   or its static weights, the body's roman and its italic — with a bold italic run and a latin-ext line in the heading
//   face, and every line names its family (`data-family`) so the runner can check it was drawn in the pool's own face;
// - THE CONTRAST GROUND (Story 6.4, DW-324, DW-317): a design whose Background offers `contrast` and whose stylesheet draws
//   a `--button-fill` button is also photographed on that ground, under each reference pack whose Button style is
//   Outline, in both modes, at 1440 — derived from the design and the packs, never listed;
// - MODES and VIEWPORTS are NFR-6(a)'s own: light/dark × 1440, 834, 390, 1440 at 200% zoom, 1440 with motion reduced;
// - FIXTURE ROWS come from what the design IS, the way `/pilots` decides its own switcher (`paginates`, member arms,
//   and the Show-to arms from `carriesMemberVisibility`, the editor's own rule — DW-171).
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
// A design whose markup gates by member (`data-members=`) is photographed once per visitor. A design whose category
// carries R-124's Member visibility row (`carriesMemberVisibility`, read off R-113's register — the rule the editor and
// `/pilots` draw Show to by) is photographed once per Show-to audience as a visitor it HIDES from — an arm shown to its
// own audience draws exactly the visitor arm's pixels, so the one Show-to state with pixels of its own is the section
// gone (the owner's `/pilots` test step 10). Until Story 5.24c the Show-to arms followed `data-members` too, and
// photographed A1 #1's, which the editor never draws, and not A4 #13's, which it does (DW-171).

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const pilots = await import(join(REPO, 'apps/web/lib/pilots.ts'))
const { imagePool } = await import(join(REPO, 'apps/web/lib/controls-review.ts'))
const lib = await import(join(REPO, 'packages/library/src/index.ts'))
const rt = await import(join(REPO, 'packages/section-runtime/src/index.ts'))
// DW-323 (Story 6.3): a pairing's faces are the runtime's `./fonts` subpath, never its index
const { fontFaceCss } = await import(join(REPO, 'packages/section-runtime/src/fonts.ts'))
const { shownRows } = await import(join(REPO, 'apps/web/lib/canvas.ts'))
const { fontHref } = await import(join(REPO, 'apps/web/lib/style-pack.ts'))
const presets = await import(join(REPO, 'packages/library/src/packs.ts'))

export const { carriesMemberVisibility, pilot, pilotIds, pilotRows, pilotImage, pilotsCanvasDocument, poolFont } = pilots
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

/** The pack axis: the owner's three reference packs (R-234), read from the library — never a list written here. */
export const packs = () => [...presets.REFERENCE_PACKS]
export const presetPack = (id) => presets.presetOf(id)?.pack

/** THE SPECIMEN (R-233): what the matrix photographs once per pairing — the heading face at two sizes, the body face with
 *  a bold and an italic run (both true faces, never synthesised), tabular figures and latin-ext letters, all through the
 *  token block, so a pairing's faces are drawn exactly as the canvas and the theme load them.
 *
 *  STORY 6.4 — AT BOTH ENDS OF EVERY ROLE'S WEIGHTS (DW-324): the heading at the two ends its pool entry declares (a
 *  variable face's `range`, or a static face's own weights), the body's roman and its italic at theirs — so the heaviest
 *  heading a pairing ships (Broadsheet's 900, Fieldnote's 800) and its lightest are photographed — plus a bold italic run
 *  and a latin-ext line in the HEADING face, which only the body face drew before. Every line with words of its own names
 *  its family (`data-family`): the runner checks each was drawn in the pool's own file (`matrix.spec.mjs`). */
export const SPECIMEN_CSS = '.specimen{box-sizing:border-box;max-width:var(--site-width);margin:0 auto;padding:var(--space-section) var(--site-margin);' +
  'background:var(--bg-page);color:var(--text-body);font-family:var(--font-body);font-synthesis:none}' +
  '.specimen__id{margin:0 0 1.5rem;font-size:13px;color:var(--text-muted)}' +
  '.specimen__heading{margin:0;font-family:var(--font-heading);font-size:56px;line-height:1.1}' +
  '.specimen__sub,.specimen__heading-ext{margin:.75rem 0 0;font-family:var(--font-heading);font-size:28px;line-height:1.2}' +
  '.specimen__body,.specimen__figures,.specimen__ext{margin:1.25rem 0 0;max-width:42rem;font-size:19px;line-height:1.6}' +
  '.specimen__figures{font-feature-settings:var(--figures-tabular)}'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
/** The two ends of the weights a pool role declares, as `pool.json` says them: a variable face's range (its italic's, for
 *  the italic), or a static face's own weights — roman, or the italic ones (`400i`). One weight is both ends. */
export function weightEnds(role, italic = false) {
  const declared = role.type === 'V' ? (italic ? role.italic : role.range) : role.weights.filter((w) => w.endsWith('i') === italic).map((w) => Number.parseInt(w, 10))
  if (!declared || declared.length === 0) throw new Error(`${role.family}: the pool declares no ${italic ? 'italic' : 'roman'} weight`)
  return [Math.min(...declared), Math.max(...declared)]
}
export function specimenMarkup(pairingId) {
  const p = presets.pairingOf(pairingId)
  const [hLo, hHi] = weightEnds(p.heading)
  const [rLo, rHi] = weightEnds(p.body)
  const [iLo, iHi] = weightEnds(p.body, true)
  const h = `data-family="${esc(p.heading.family)}"`
  const b = `data-family="${esc(p.body.family)}"`
  return `<section class="specimen"><p class="specimen__id" ${b} style="font-weight:${rLo}">${esc(`${p.id} · ${p.name} — ${p.heading.family} / ${p.body.family}`)}</p>` +
    `<h1 class="specimen__heading" ${h} style="font-weight:${hLo}">The quiet web, written by hand</h1>` +
    `<h2 class="specimen__sub" ${h} style="font-weight:${hHi}">Essays from Lisbon, every Sunday</h2>` +
    `<p class="specimen__heading-ext" ${h} style="font-weight:${hHi}">Łódź · Őrség · Şişli · Čeština · Ğüneş</p>` +
    `<p class="specimen__body" ${b} style="font-weight:${rLo}">Orbit Weekly is a newsletter about the humane web, set in the body face with a ` +
    `<strong ${b} style="font-weight:${rHi}">bold run that carries the weight</strong>, an <em ${b} style="font-weight:${iLo}">italic run for the aside</em> ` +
    `and a <strong style="font-weight:${iHi}"><em ${b}>bold italic run for the emphasis</em></strong>, so every true face is drawn.</p>` +
    `<p class="specimen__figures" ${b} style="font-weight:${rLo}">Issue 118 · 1,234,567.89 · 0123456789 · 4,100 · 7,711 · £40 · €12.50</p>` +
    `<p class="specimen__ext" ${b} style="font-weight:${rLo}">Łódź · Ąžuolas · Őrség · Şişli · Čeština · Ğüneş · ąęłńśźż</p></section>`
}
/** The specimen's document: Paper's palette through the engine with the pairing's fonts, and that pairing's faces from
 *  `?font=` beside it, exactly as `/canvas` serves a pack's. */
export function specimenDocument(pairingId) {
  const paper = presets.presetOf('paper').pack
  const tokens = rt.packTokensCss({ ...paper, fonts: presets.pairingFonts(pairingId) })
  const faces = fontFaceCss(pairingId, fontHref('canvas'))
  return '<!doctype html><html lang="en" data-mode="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    `<title>Specimen ${esc(pairingId)}</title><style data-order="1-tokens">${tokens}</style><style data-order="1b-faces">${faces}</style>` +
    `<style data-order="2-document">html,body{margin:0;background:var(--bg-page)}${SPECIMEN_CSS}</style></head><body><div id="canvas"></div></body></html>`
}
/** One specimen per pairing of the pool (§D.c's order), each Paper, light, at 1440. */
export const SPECIMENS = () => presets.POOL.pairings.map((p) => p.id)

/** STORY 6.4 (DW-324, DW-317) — a design photographed on the CONTRAST GROUND: its Background offers `contrast`, and its
 *  stylesheet draws a `--button-fill` button, whose Outline border and label must hold on that ground — read off the
 *  design, never a list. */
export const onContrast = (entry) => (entry.universals?.bg?.values ?? []).includes('contrast') && /--button-fill/.test(entry.css)
/** …under each reference pack whose Button style is Outline (Mono today) — read off the packs, never named here. */
export const outlinePacks = () => packs().filter((p) => presetPack(p)?.buttons === 'outline')

/** A design's own fixture rows: every combination of the axes its markup and context declare, `[{ name: '' }]` when
 *  it declares none. Each row is a partial render input plus the name its baseline file carries. */
export function fixtureRows(entry) {
  const axes = []
  if (/\bdata-pagination=/.test(entry.html)) axes.push(FEEDS.map((feed) => ({ name: `feed-${feed}`, feed })))
  const visitors = lib.MEMBER_STATES.filter((s) => s !== 'everyone')
  const seen = /\bdata-members=/.test(entry.html) ? visitors.map((member) => ({ name: `visitor-${member}`, member })) : []
  const shown = carriesMemberVisibility(entry.id)
    ? visitors.map((visibility) => ({ name: `show-to-${visibility}`, visibility, member: visitors.find((v) => v !== visibility) }))
    : []
  // a design with Show-to arms and no visitor arms keeps its base row beside them, named '' as a row-less design's is
  if (seen.length + shown.length > 0) axes.push([...(seen.length > 0 ? seen : [{ name: '' }]), ...shown])
  const placed = entry.bindingContext.includes('post') ? entry.compileTarget.filter((t) => t in SUBJECTS) : []
  axes.push(placed.length > 0 ? placed.map((target) => ({ name: SUBJECTS[target], target })) : [{ name: '', target: entry.compileTarget[0] }])
  return axes.reduce((rows, axis) => rows.flatMap((r) => axis.map((a) => ({ ...r, ...a, name: [r.name, a.name].filter(Boolean).join('-') }))), [{ name: '' }])
}

/** `MATRIX_DESIGNS` narrows the run to the designs a push touched: ids (`a1/1`) or whole categories (`a1`). */
export const selected = (id, only) => only.length === 0 || only.some((o) => id === o || id.startsWith(`${o}/`))
export const only = () => (process.env.MATRIX_DESIGNS ?? '').split(/[\s,]+/).filter(Boolean)

/** Every case: design × pack × mode × viewport × the design's own rows — and one specimen per pairing (R-233), whose
 *  id is `specimens/<pairing>` so `MATRIX_DESIGNS=specimens` narrows to them as a category does — and, Story 6.4, each
 *  design that `onContrast` names on the contrast ground: its first row, `bg` set to `contrast`, under every Outline
 *  reference pack, light and dark, at 1440 (DW-324). */
export function cases(filter = only()) {
  const ids = pilotIds().filter((id) => selected(id, filter))
  const specimens = SPECIMENS().filter((p) => selected(`specimens/${p.toLowerCase()}`, filter))
  // a filter that names no design (a typo, a removed design) must not pass as a matrix of zero cases
  if (filter.length > 0 && ids.length + specimens.length === 0) throw new Error(`MATRIX_DESIGNS names no design under packages/library/designs/: ${filter.join(' ')}`)
  const designs = ids.flatMap((id) => {
    const entry = pilot(id)
    const [category, n] = id.split('/')
    return packs().flatMap((pack) => MODES.flatMap((mode) => VIEWPORTS.flatMap((viewport) => fixtureRows(entry).map((row) => {
      const slug = [pack, mode, viewport.name, row.name].filter(Boolean).join('-')
      return { id, category, n, pack, mode, viewport, row, title: `${id} · ${slug}`, snapshot: [category, n, `${slug}.png`] }
    }))))
  })
  const [desktop] = VIEWPORTS
  const contrast = ids.filter((id) => onContrast(pilot(id))).flatMap((id) => {
    const entry = pilot(id)
    const [category, n] = id.split('/')
    const [first] = fixtureRows(entry)
    const row = { ...first, name: [first.name, 'bg-contrast'].filter(Boolean).join('-'), controls: { bg: 'contrast' } }
    return outlinePacks().flatMap((pack) => MODES.map((mode) => {
      const slug = [pack, mode, desktop.name, row.name].join('-')
      return { id, category, n, pack, mode, viewport: desktop, row, title: `${id} · ${slug}`, snapshot: [category, n, `${slug}.png`] }
    }))
  })
  return [...designs, ...contrast, ...specimens.map((pairing) => {
    const n = pairing.toLowerCase()
    const slug = ['paper', 'light', desktop.name].join('-')
    return { id: `specimens/${n}`, category: 'specimens', n, pairing, pack: 'paper', mode: 'light', viewport: desktop, row: { name: '' }, title: `specimens/${n} · ${slug}`, snapshot: ['specimens', n, `${slug}.png`] }
  })]
}

/** The totals a run prints, from its own list. */
export const totals = (list) => ({
  cases: list.length,
  designs: new Set(list.filter((c) => !c.pairing).map((c) => c.id)).size,
  packs: new Set(list.map((c) => c.pack)).size,
  specimens: list.filter((c) => c.pairing).length,
  contrast: list.filter((c) => c.row.controls?.bg === 'contrast').length,
})

/**
 * THE RENDER INPUT, `renderSection()`'s in `apps/web/lib/canvas.ts` — the one per-section render `/pilots`' and the
 * editor's `paint()` both call since Story 5.1 — with nothing changed in the panel: content and controls at their
 * defaults, Orbit Weekly's rows through the same `shownRows()` the pages use (never a copy of it, so a change to the
 * limit or order rule reaches the matrix by construction; review, 2026-09-17), `templateContext` at the row's target
 * and feed, the row's visitor and Show-to, the picture pool's asset ids and the icon set. Pictures keep their real
 * origin: the matrix serves it (serve.mjs) where the page rewrites it to the canvas route, so nothing here rewrites a URL.
 */
export function renderInput(entry, row, icons) {
  const target = row.target ?? entry.compileTarget[0]
  const ctx = lib.orbitWeekly.templateContext(target, row.feed ?? 'first')
  const getRows = shownRows(entry, { data: {} }, pilotRows(entry))
  // the same pool the page hands `paint()` — one reader, so the matrix cannot photograph a pool the editor lacks
  const pool = imagePool().map((a) => a.id)
  return {
    target,
    content: rt.defaultContent(entry.contentSchema),
    schema: entry.contentSchema,
    controlSchema: entry.controlSchema,
    universals: entry.universals,
    // Story 6.4 — the contrast-ground case's `bg`; nothing else is set, as the panel sets nothing
    controls: row.controls ?? {},
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
