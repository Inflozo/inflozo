// The pilots review surface's reads — the library's designs, Story 4.10's pilots first, each beside the panel Epic 5 will mount.
//
// Not a core package: this module reads files, which AD-1 forbids there (the split `lib/controls-review.ts` makes
// for Story 4.5). What it reads is the design library itself — `packages/library/designs/`, whose directory IS the
// design list — the Orbit Weekly pictures and the runtime's reference token stylesheet. Everything it hands on is
// plain data, so the page passes it to a client component and the frame route serves it whole.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assembleEntry, compilesTo, isPaywallDesign, isPlaceable, validateDesign } from '@inflozo/library'
import type { CategoryContent, DesignJson, SectionRegistryEntry } from '@inflozo/library'
import { POOL, presetOf } from '@inflozo/library/packs'
import { packTokensCss, type Pack, type ProjectDoc } from '@inflozo/section-runtime'
import { fontFaceCss } from '@inflozo/section-runtime/fonts'
import { canvasOfTemplateKey, fileOfKey, isSurface } from './editor.ts'
import { iconDrawing } from '@inflozo/library/icons'
import { sampleRows, type DesignRows } from './canvas.ts'
import { fontHash, fontHref } from './style-pack.ts'
import { PACKAGES } from './style-guide.ts'

/** `packages/` is found by `style-guide.ts`'s ONE finder (DW-269): the working directory first, the form Turbopack traces
 *  into the deployed functions, and this module's address as the fallback, so the render matrix (Story 4.11) reads the
 *  same canvas document from the repo root that the app reads from `apps/web`. */
export const DESIGNS_DIR = () => join(PACKAGES(), 'library', 'designs')
const IMAGES = () => join(PACKAGES(), 'library', 'orbit-weekly', 'images')
const TOKENS = () => join(PACKAGES(), 'section-runtime', 'reference-tokens.css')
/** Story 6.2 — the pool's woff2 files (`tools/fonts/build-pool.py`), served beside the canvas document by `?font=`. */
const FONTS = () => join(PACKAGES(), 'library', 'fonts', 'files')
/** R-113's control register — which settings-panel group each category's rows sit in (Story 5.4 reads one row of it). */
const REGISTER = () => join(PACKAGES(), 'library', 'control-groups.json')
/** The editor's in-canvas chrome (AD-21), read the way the tokens are: from this module's own address. */
const CHROME = () => join(dirname(fileURLToPath(import.meta.url)), 'canvas-chrome.css')

const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory()

/** The design list: every `{category}/{n}` directory on disk, in directory order — never a list written here. */
export function pilotIds(): string[] {
  if (!isDir(DESIGNS_DIR())) return []
  return readdirSync(DESIGNS_DIR()).sort().flatMap((category) =>
    isDir(join(DESIGNS_DIR(), category))
      ? readdirSync(join(DESIGNS_DIR(), category)).filter((n) => /^\d+$/.test(n) && isDir(join(DESIGNS_DIR(), category, n))).sort((a, b) => Number(a) - Number(b)).map((n) => `${category}/${n}`)
      : [])
}

/** One pilot, assembled through the real `assembleEntry` and validated with the icon set — LOUDLY: a pilot that does
 *  not validate is a broken story, not a page to render around. */
export function pilot(id: string): SectionRegistryEntry {
  if (!pilotIds().includes(id)) throw new Error(`"${id}" is not a design in packages/library/designs/`)
  const [category, n] = id.split('/') as [string, string]
  const dir = join(DESIGNS_DIR(), category, n)
  const read = (file: string) => readFileSync(join(dir, file), 'utf8')
  const design = JSON.parse(read('design.json')) as DesignJson
  const content = JSON.parse(readFileSync(join(DESIGNS_DIR(), category, 'content.json'), 'utf8')) as CategoryContent
  const html = read('index.html')
  const css = read('style.css')
  const failures = validateDesign({ html, design, content, icons: iconDrawing, css })
  if (failures.length > 0) throw new Error(`${id} does not validate — ${failures.map((f) => `${f.code}: ${f.message}`).join(' · ')}`)
  const entry = assembleEntry({ dir, design, content, html, css })
  if (typeof entry === 'string') throw new Error(`${id} does not assemble — ${entry}`)
  return entry
}

/**
 * DW-235 (Story 5.24e): WHAT A STORED DOC MAY HOLD — ONE RULE FOR THE DOOR THAT READS A DOC AND THE ONE THAT WRITES IT.
 * `read.ts` throws with it, because a doc nothing in the product could have written blacks out every canvas of its
 * project; `sync/route.ts`, the one door that writes a doc, answers 422 with it BEFORE the write. Until this the route
 * checked the schema, the key and a surface's count and stored the rest — so a doc `read.ts` refuses could be saved,
 * and the editor then refused to open (its own parity claim, `sync/route.ts`'s header, was not true).
 *
 * Null when every instance may stand where it is; else `read.ts`'s own sentence, the first refusal found. `held` is the
 * caller's entries by id, filled as designs are read, so `read.ts` reads each design once and hands the map on.
 */
export function docRefusal(key: string, doc: ProjectDoc, held: Record<string, SectionRegistryEntry> = {}): string | null {
  const file = fileOfKey(key)
  // STORY 5.20 — THE PAYWALL IS A TEMPLATE SURFACE: its doc holds AT MOST ONE instance, and that one is a paywall design
  // — the one place a treatment is stored in a doc (FR-H6's "one design active per project", R-197)
  const canvas = canvasOfTemplateKey(key)
  const surface = canvas !== null && isSurface(canvas)
  if (surface && doc.instances.length > 1) return `${key}: a paywall holds one design, and this doc holds ${doc.instances.length}`
  for (const [n, instance] of doc.instances.entries()) {
    const where = `${key} instance ${n} (${instance.instanceId}, ${instance.designId})`
    // Story 5.4, before the library is even asked: a treatment is chosen outside the canvas and never placed on one
    if (!surface && !isPlaceable(instance.designId)) return `${where}: that design is a treatment chosen outside the canvas, never placed on one`
    let entry = held[instance.designId]
    try {
      entry ??= pilot(instance.designId)
    } catch (e) {
      return `${where}: ${(e as Error).message}`
    }
    if (surface && !isPaywallDesign(entry)) return `${where}: only a paywall design stands where a post stops, and ${instance.designId} is not one`
    // `compilesTo`, the library's one rule (Story 5.16): a Home design may sit on `index.hbs`, Home's page 2, because
    // Ghost hands the two files the same posts — so R-179's exact copy of a Home never blacks out the editor
    if (!compilesTo(entry.compileTarget, file)) return `${where}: the design compiles to ${entry.compileTarget.join(', ')}, never ${file}`
    held[instance.designId] = entry
  }
  return null
}

/** ponytail: every design is read, validated and assembled on each request (the page, then the frame route again), and
 *  `pilot()` re-lists the directory to check its id — nothing at the pilots' size. Build the list once per module when
 *  the category stories' designs make a request slow. */
export const pilots = (): SectionRegistryEntry[] => pilotIds().map(pilot)

/** R-124's Member visibility row, per CATEGORY, read off R-113's control register (Story 5.4).
 *
 *  WHY THE REGISTER AND NOT THE PRD: the two disagree about which categories carry the row — `prd.md`'s Appendix C
 *  names four CTA-bearing ones, `control-groups.json` files it for ten — and DW-185 leaves the answer to the first
 *  E9/E10 category story the disagreement touches. The register is the list a drawn panel produced (DW-111, R-74), so
 *  the editor reads it and nothing this story builds depends on the answer: both pilots the owner tests it on, a4/13
 *  and a22/1, appear in both lists. */
let register: Readonly<Record<string, unknown>> | null = null
export function carriesMemberVisibility(designId: string): boolean {
  register ??= JSON.parse(readFileSync(REGISTER(), 'utf8')) as Record<string, unknown>
  const own = register[designId.split('/')[0] ?? '']
  return typeof own === 'object' && own !== null && Object.hasOwn(own, 'Member visibility')
}

/** Each declared query's rows in both orders at the Count's ceiling, so the client picks by the stored Order, slices to
 *  the limit and never runs a query; a fixed query and a hand-picked list are their own number and order, so both lists
 *  are their one resolution — A4 #13's card comes from here. Since Story 5.19 it IS `lib/canvas.ts`'s `sampleRows` over
 *  the design's declared queries: the editor resolves an instance's folded queries with the same function in the
 *  browser, so `/pilots`, the render matrix and the canvas cannot resolve the sample two ways. */
export function pilotRows(entry: SectionRegistryEntry): DesignRows {
  return sampleRows(entry.dataBindings)
}

/** One Orbit Weekly picture's bytes, or null for any name that is not a picture in the directory — so nothing but
 *  that directory is served, and a name is never joined into a path unchecked. */
export function pilotImage(name: string): Buffer | null {
  if (!/^[a-z0-9-]+$/.test(name)) return null
  return readdirSync(IMAGES()).includes(`${name}.svg`) ? readFileSync(join(IMAGES(), `${name}.svg`)) : null
}

/** STORY 6.2 — every file the font pool records (`packages/library/fonts/pool.json`): the ONE list `?font=` serves from. */
const POOL_FILES: ReadonlyMap<string, string> = new Map(Object.values(POOL.faces).flatMap((f) => f.files.map((x) => [x.file, x.sha256] as const)))

/** One pool file's bytes, or null for any name that is not a file the pool records: a name is never joined into a path
 *  unchecked, so nothing but the pool's own woff2 can be read through `?font=`. */
export function poolFont(name: string): Buffer | null {
  return POOL_FILES.has(name) ? readFileSync(join(FONTS(), name)) : null
}

/** Is `h` the hash `fontHref` puts in THIS file's address? Only then may the answer be kept `immutable`: an address with
 *  no hash, or a rebuilt file asked for under its old one, is served and never cached (review, 2026-10-03). */
export const poolFontIs = (name: string, h: string | null): boolean => POOL_FILES.has(name) && h === fontHash(POOL_FILES.get(name) ?? '')

/** STORY 6.2 — a preset's token block and its pairing's `@font-face` rules, the two styles every canvas document opens
 *  with. Paper's block is `reference-tokens.css` itself, byte for byte (the file `test-vocabulary.mjs` holds to the
 *  engine), so the canvas every customer sees today is unchanged but for its faces; any other preset is the engine's
 *  `packTokensCss`. The faces are the theme's own files, subsets and axis instances (§D.b), from this app's own route —
 *  never a font host. An unknown id throws: the routes answer 404 before they get here. */
export function packHead(pack: string, base: string): { tokens: string; faces: string } {
  const preset = presetOf(pack)
  if (preset === undefined) throw new Error(`"${pack}" is not a Style Pack preset (prd.md §D.d)`)
  return {
    tokens: pack === 'paper' ? readFileSync(TOKENS(), 'utf8') : packTokensCss(preset.pack as Pack),
    faces: fontFaceCss(preset.pairing, fontHref(base)),
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * THE CANVAS DOCUMENT: the reference tokens and their faces (Story 6.2: `pack` names the preset, Paper by default; Story
 * 6.3: the editor asks for it ONCE per mount in the project's pack and restyles it in place on a switch — its two styles are
 * `lib/style-pack.ts`'s `packChoices` strings, which are this `packHead`'s; `/pilots` and the render matrix ask for others), the pilots' stylesheets (each scoped by its own class prefix), the
 * editor's chrome stylesheet (every rule keyed on `data-inflozo-*`, so inert at rest) and an empty mount point — and
 * NO script, so it needs no nonce. The editor and the pilots review write sections into `#canvas` from the parent
 * document (same origin) and set `data-mode` on this `<html>` for Light and Dark; `/canvas` serves it to both. A whole document in an
 * iframe, for AD-21's reason: the section inherits nothing of the app, and the iframe's width IS the viewport the
 * design's media queries read.
 *
 * `extra` WIDENS IT, and exactly one caller passes any: the keyboard harness's canvas route (Story 5.11, R-158).
 * The shipped library holds one design per category, so `pnpm keyboard` would walk a `[` and a `]` with nowhere to
 * go; the harness therefore puts the three fixture designs of `packages/library/fixtures/controls/` on its own
 * canvas, and their stylesheets have to be in the document they are drawn into. They go BEFORE the chrome sheet,
 * which must stay last (`canvas-chrome.css` loads after every design's at equal specificity, by design). The app's
 * own `/canvas` passes none, so what a customer is served is untouched.
 *
 * `only` NARROWS IT TO ONE DESIGN, which is the Section Picker's whole payload problem (the owner's ruling of
 * 2026-09-20, option 3 of Question 4). A canvas that holds a document needs every stylesheet, because it may draw
 * any section; a PREVIEW draws exactly one, and carrying the rest is waste that grows with the square of the
 * library — N frames × N stylesheets. Measured on 2026-09-20, with five designs in the library: the whole document
 * is 50,577 bytes of which 42,511 are design stylesheets, so one design's is ~16 KB against 50 KB, and at forty
 * designs it is ~16 KB against ~347 KB. An unknown id throws through `pilot()`, which is the route's 404.
 */
export function pilotsCanvasDocument(only?: string, extra: readonly { id: string; css: string }[] = [], pack = 'paper'): string {
  // Story 6.2: the pack's block and its faces — Paper unless `/pilots` (or the matrix) asks for another preset
  const { tokens, faces } = packHead(pack, 'canvas')
  // a narrowed document still reads ONE design, never the library (the preview's whole payload argument)
  const carried = only === undefined ? [...pilots(), ...extra] : [extra.find((e) => e.id === only) ?? pilot(only)]
  const css = carried.map((e) => `/* ${e.id} */\n${e.css}`).join('\n')
  return `<!doctype html><html lang="en" data-mode="light"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">` +
    `<title>${esc('Pilot sections')}</title>` +
    `<style data-order="1-tokens">${tokens}</style>` +
    `<style data-order="1b-faces">${faces}</style>` +
    `<style data-order="2-document">html,body{margin:0;background:var(--bg-page)}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--text-muted) 40%,transparent);border-radius:8px}</style>` +
    // DW-275 (Story 5.24e): the Paywall canvas's post body (`style-guide.ts`'s `surfaceCss`) is NO LONGER INLINED here.
    // Story 5.20 carried it disabled in every canvas document — 69,185 of its 124,335 bytes (10,379 of 22,872 gzipped)
    // — for the one canvas that uses it. The canvas routes now answer `?sheet=surface` with it, and the editor's first
    // Paywall paint links it in before `3-pilots` (`paint()`), where its `data-order` keeps the cascade it always had.
    `<style data-order="3-pilots">${css}</style>` +
    `<style data-order="4-editor">${readFileSync(CHROME(), 'utf8')}</style></head>` +
    `<body><div id="canvas"></div></body></html>`
}
