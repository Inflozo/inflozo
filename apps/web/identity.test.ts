import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/*
 * Story 1.6's grep, made permanent — the same move `tokens.test.ts` makes for the colour layer.
 * The identity lives in the Claude Design export (R-74) and the app TRANSCRIBES it, so the
 * transcription is checked rather than trusted: the mark's geometry, the files served whole, and
 * the rule that no surface types the word for itself again.
 *
 * Nothing here counts anything. Membership comes from the export's own directory.
 */

const ASSETS = join(
  process.cwd(), '..', '..',
  '_bmad-output', 'planning-artifacts', 'design', 'claude-design-export',
  'Logo', 'export', 'Inflozo Logo', 'assets',
)

const LOGO = join('components', 'kit', 'logo.tsx')
const WATERMARK = join('app', '(app)', 'app', 'sign-in', 'page.tsx')

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name === '.next') return []
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p) : e.name.endsWith('.tsx') ? [p] : []
  })

test('every mark the export ships is served byte-identical', () => {
  const svgs = readdirSync(ASSETS).filter((f) => f.endsWith('.svg'))
  assert.ok(svgs.length > 0, `no marks under ${ASSETS} — the export moved`)

  for (const name of svgs) {
    const source = readFileSync(join(ASSETS, name))
    assert.deepEqual(
      readFileSync(join('public', 'brand', name)),
      source,
      `public/brand/${name} is not the export's bytes — copy it, never redraw it`,
    )
  }

  // Next's file convention serves this one at /icon.svg, so it is the export's cut of it.
  assert.deepEqual(
    readFileSync(join('app', 'icon.svg')),
    readFileSync(join(ASSETS, 'favicon-16.svg')),
    'app/icon.svg has drifted from the export\'s favicon-16.svg',
  )
})

test("the inlined mark is the export's drawing, attribute for attribute", () => {
  const svg = readFileSync(join(ASSETS, 'mark-light.svg'), 'utf8')
  const tsx = readFileSync(LOGO, 'utf8')

  const box = /viewBox="([^"]+)"/.exec(svg)
  assert.ok(box, 'mark-light.svg has no viewBox')
  assert.ok(tsx.includes(`viewBox="${box[1]}"`), `logo.tsx does not draw the export's viewBox`)

  // The README: a rescale or re-radius invalidates the dash rhythm, so every drawing attribute
  // is compared — not just the ones that look load-bearing.
  const rects = [...svg.matchAll(/<rect\s([^>]*?)\/?>/g)].map((m) => m[1])
  assert.ok(rects.length > 0, 'mark-light.svg draws no rects')

  for (const attrs of rects) {
    for (const [, name, value] of attrs.matchAll(/([a-z-]+)="([^"]+)"/g)) {
      // JSX spells SVG's kebab-case attributes in camelCase; the VALUE is what must survive.
      const jsx = name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      assert.ok(
        tsx.includes(`${jsx}="${value}"`),
        `logo.tsx is missing ${jsx}="${value}" — the mark was redrawn, and the README's dash rhythm (period = pathLength / 8) no longer closes`,
      )
    }
  }
})

test('no surface types the wordmark for itself', () => {
  // The word is DRAWN in exactly two places: the lockup, and the Sign In watermark, which is CSS
  // `content` and deliberately not a text node. A third is a surface that has grown its own
  // logo — which is what Story 1.6 existed to end.
  const offenders = walk(process.cwd()).flatMap((file) => {
    const rel = file.slice(process.cwd().length + 1)
    if (rel === LOGO || rel === WATERMARK) return []
    const drawn = readFileSync(file, 'utf8').match(/>\s*Inflozo\s*</g)
    return drawn ? [rel] : []
  })

  assert.deepEqual(offenders, [], 'draw <Lockup> instead — the identity has one component')
})
