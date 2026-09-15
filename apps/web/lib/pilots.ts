// The pilots review surface's reads — Story 4.10's five pilot sections, each beside the panel Epic 5 will mount.
//
// Not a core package: this module reads files, which AD-1 forbids there (the split `lib/controls-review.ts` makes
// for Story 4.5). What it reads is the design library itself — `packages/library/designs/`, whose directory IS the
// design list — the Orbit Weekly pictures and the runtime's reference token stylesheet. Everything it hands on is
// plain data, so the page passes it to a client component and the frame route serves it whole.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { assembleEntry, orbitWeekly, validateDesign } from '@inflozo/library'
import type { CategoryContent, DesignJson, SectionRegistryEntry } from '@inflozo/library'
import { iconDrawing } from '@inflozo/library/icons'

/** Every reader runs with `apps/web` as the working directory (`controls-review.ts` relies on the same). */
const PACKAGES = () => join(process.cwd(), '..', '..', 'packages')
export const DESIGNS_DIR = () => join(PACKAGES(), 'library', 'designs')
const IMAGES = () => join(PACKAGES(), 'library', 'orbit-weekly', 'images')
const TOKENS = () => join(PACKAGES(), 'section-runtime', 'reference-tokens.css')

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
  const failures = validateDesign({ html, design, content, icons: iconDrawing })
  if (failures.length > 0) throw new Error(`${id} does not validate — ${failures.map((f) => `${f.code}: ${f.message}`).join(' · ')}`)
  const entry = assembleEntry({ dir, design, content, html, css })
  if (typeof entry === 'string') throw new Error(`${id} does not assemble — ${entry}`)
  return entry
}

export const pilots = (): SectionRegistryEntry[] => pilotIds().map(pilot)

/** Each declared query's rows at the Count's ceiling, newest first, so the client slices to the query's limit and
 *  never runs a query. A4 #13's card comes from here: `resolveSource` over its fixed one-post query. */
export function pilotRows(entry: SectionRegistryEntry): Record<string, unknown[]> {
  return Object.fromEntries(Object.entries(entry.dataBindings ?? {}).map(([key, binding]) => [key, orbitWeekly.resolveSource(binding.fixed === true || binding.ids !== undefined ? binding : { ...binding, limit: 100 })]))
}

/** One Orbit Weekly picture's bytes, or null for any name that is not a picture in the directory — so nothing but
 *  that directory is served, and a name is never joined into a path unchecked. */
export function pilotImage(name: string): Buffer | null {
  if (!/^[a-z0-9-]+$/.test(name)) return null
  return readdirSync(IMAGES()).includes(`${name}.svg`) ? readFileSync(join(IMAGES(), `${name}.svg`)) : null
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * THE CANVAS DOCUMENT: the reference tokens, every pilot's stylesheet (each scoped by its own class prefix) and an
 * empty mount point — and NO script, so it needs no nonce. The review page writes the section into `#canvas` from
 * the parent document (same origin) and sets `data-mode` on this `<html>` for Light and Dark. A whole document in an
 * iframe, for AD-21's reason: the section inherits nothing of the app, and the iframe's width IS the viewport the
 * design's media queries read.
 */
export function pilotsCanvasDocument(): string {
  const tokens = readFileSync(TOKENS(), 'utf8')
  const css = pilots().map((e) => `/* ${e.id} */\n${e.css}`).join('\n')
  return `<!doctype html><html lang="en" data-mode="light"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">` +
    `<title>${esc('Pilot sections')}</title>` +
    `<style data-order="1-tokens">${tokens}</style>` +
    `<style data-order="2-document">html,body{margin:0;background:var(--bg-page)}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--text-muted) 40%,transparent);border-radius:8px}</style>` +
    `<style data-order="3-pilots">${css}</style></head>` +
    `<body><div id="canvas"></div></body></html>`
}
