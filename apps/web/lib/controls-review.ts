// The controls review surface's reads — Story 4.5's sample section, beside the panel Epic 5 will mount.
//
// Not a core package: this module reads files, which AD-1 forbids there (the same split
// `lib/style-guide.ts` makes for Story 4.4). What it reads is the sample under
// `packages/library/fixtures/controls/`, the Orbit Weekly image pool and the runtime's reference token
// stylesheet; everything it hands on is plain data, so the page can pass it to a client component and
// the frame route can serve it whole.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assembleEntry, orbitWeekly, validateDesign } from '@inflozo/library'
import type { CategoryContent, DesignJson, SectionRegistryEntry } from '@inflozo/library'
import { iconDrawing } from '@inflozo/library/icons'
import { REFERENCE_TOKENS } from '@inflozo/section-runtime'
import type { Mode } from '@inflozo/section-runtime'

/** Resolved from this module's own address, as `pilots.ts` does (Story 4.11's review), so the render matrix can import
 *  `imagePool()` from the repo root and the two readers of `packages/` cannot disagree. Never `new URL('…',
 *  import.meta.url)`: Turbopack fails the build on that form; this one it computes at run time (`pilots.ts`). */
const PACKAGES = () => join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'packages')
export const CONTROLS_DIR = () => join(PACKAGES(), 'library', 'fixtures', 'controls')
const SAMPLE = () => join(CONTROLS_DIR(), '1')
const IMAGES = () => join(PACKAGES(), 'library', 'orbit-weekly', 'images')
const TOKENS = () => join(PACKAGES(), 'section-runtime', 'reference-tokens.css')

/** The sample, assembled through the real `assembleEntry` and validated with the icon set — LOUDLY: a
 *  sample that does not validate is a broken story, not a page to render around. */
export function sample(): SectionRegistryEntry {
  const read = (file: string) => readFileSync(join(SAMPLE(), file), 'utf8')
  const design = JSON.parse(read('design.json')) as DesignJson
  const content = JSON.parse(readFileSync(join(CONTROLS_DIR(), 'content.json'), 'utf8')) as CategoryContent
  const html = read('index.html')
  const css = read('style.css')
  const failures = validateDesign({ html, design, content, icons: iconDrawing, css })
  if (failures.length > 0) {
    throw new Error(`the controls sample does not validate — ${failures.map((f) => `${f.code}: ${f.message}`).join(' · ')}`)
  }
  const entry = assembleEntry({ dir: SAMPLE(), design, content, html, css })
  if (typeof entry === 'string') throw new Error(`the controls sample does not assemble — ${entry}`)
  return entry
}

/** The picture pool: Orbit Weekly's feature images, named by asset id — read off the directory, never listed. */
export function imagePool(): { id: string; bytes: number }[] {
  return readdirSync(IMAGES())
    .filter((f) => /^feature-[a-z0-9-]+\.svg$/.test(f))
    .sort()
    .map((f) => ({ id: f.slice(0, -'.svg'.length), bytes: statSync(join(IMAGES(), f)).size }))
}

/** One pool picture's bytes, or null for any id that is not in the pool — so nothing but the pool is served. */
export function poolImage(id: string): Buffer | null {
  return imagePool().some((a) => a.id === id) ? readFileSync(join(IMAGES(), `${id}.svg`)) : null
}

/** Background role's colour roles and the reference token each is painted with. Image has no colour: the
 *  panel draws the Kit's image glyph for it. */
const ROLE_TOKENS: Readonly<Record<string, string>> = {
  base: '--bg-page',
  surface: '--bg-surface',
  accent: '--accent',
  contrast: '--bg-contrast',
}

/** The swatch colours: the reference token values themselves, so `apps/web` carries no colour literal
 *  (`tokens.test.ts`). A missing property throws rather than drawing an empty circle.
 *
 *  Story 5.6 — PER MODE. Dark redeclares the same property set (`tokens.ts` asserts the two sets equal), so the
 *  panel's Background-role dots are the colours the canvas is ACTUALLY painting while dark is previewed; drawn from
 *  `light` they would have said the light ground was in force. */
export function referenceSwatches(mode: Mode = 'light'): Record<string, string> {
  return Object.fromEntries(
    Object.entries(ROLE_TOKENS).map(([role, property]) => {
      const value = REFERENCE_TOKENS[mode][property]
      if (!value) throw new Error(`the ${mode} reference tokens declare no ${property} — the ${role} swatch has no colour`)
      return [role, value]
    }),
  )
}

export type LinkResource = { id: string; title: string; url: string; meta: string }
export type LinkResources = Record<'pages' | 'posts' | 'tags' | 'authors', LinkResource[]>

/** What the link picker searches: Orbit Weekly's posts, tags and authors. The dataset publishes no pages,
 *  so that group is empty and the picker omits it (P0-1: a group with no match is never shown). */
export function linkResources(): LinkResources {
  // a date is shown as its stored day, unformatted — no story formats one yet (DW-106), and this is not the place to start
  const day = (iso: string) => iso.slice(0, 10)
  const posts = (n: number) => `${n} ${n === 1 ? 'post' : 'posts'}`
  const url = (row: Record<string, unknown>) => (typeof row['url'] === 'string' ? row['url'] : '')
  return {
    pages: [],
    posts: orbitWeekly.posts().map((p) => ({ id: p.id, title: p.title, url: url(p), meta: day(p.published_at) })),
    tags: orbitWeekly.tags().map((t) => ({ id: t.id, title: t.name, url: url(t), meta: posts(t.count.posts) })),
    authors: orbitWeekly.authors().map((a) => ({ id: a.id, title: a.name, url: url(a), meta: posts(a.count.posts) })),
  }
}

/** Each declared query's rows at the Count's ceiling, in both orders, so the client slices to the Count
 *  and never runs a query. ponytail: whole Content API rows (a few hundred KB for the sample); trim to the
 *  bound fields if a design with a heavier query makes the payload matter. */
export function queryRows(entry: SectionRegistryEntry): Record<string, { newest: unknown[]; oldest: unknown[] }> {
  return Object.fromEntries(
    Object.entries(entry.dataBindings ?? {}).map(([key, binding]) => [
      key,
      {
        newest: orbitWeekly.resolveSource({ ...binding, limit: 100, order: 'published_at desc' }),
        oldest: orbitWeekly.resolveSource({ ...binding, limit: 100, order: 'published_at asc' }),
      },
    ]),
  )
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * THE CANVAS DOCUMENT: the reference tokens, the sample's stylesheet and an empty mount point — and NO
 * script, so it needs no nonce. The review page writes the section into `#canvas` from the parent
 * document (same origin), which is how a control change reaches the canvas root inside its own input
 * handler. A whole document in an iframe, for AD-21's reason: the section inherits nothing of the app.
 */
export function canvasDocument(): string {
  const tokens = readFileSync(TOKENS(), 'utf8')
  const css = readFileSync(join(SAMPLE(), 'style.css'), 'utf8')
  return `<!doctype html><html lang="en" data-mode="light"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">` +
    `<title>${esc('Controls sample')}</title>` +
    `<style data-order="1-tokens">${tokens}</style>` +
    `<style data-order="2-document">::-webkit-scrollbar{width:8px}::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--text-muted) 40%,transparent);border-radius:8px}::-webkit-scrollbar-button{display:none}body{margin:0}</style>` +
    `<style data-order="3-sample">${css}</style></head>` +
    `<body><div id="canvas"></div></body></html>`
}
