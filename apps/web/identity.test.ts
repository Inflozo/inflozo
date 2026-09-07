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

  // Next's file convention serves this one at /icon.svg, so it is the export's cut of it — plus
  // ONE `<style>` for dark tab strips (owner, 2026-09-07, Story 1.6 question 3): the geometry is
  // the export's byte for byte, and the two colours are the Dark section's, read from mark-dark.svg.
  const icon = readFileSync(join('app', 'icon.svg'), 'utf8')
  const styles = icon.match(/<style>.*?<\/style>/gs) ?? []
  assert.equal(styles.length, 1, 'app/icon.svg carries other than exactly one <style>')
  assert.equal(
    icon.replace(styles[0], ''),
    readFileSync(join(ASSETS, 'favicon-16.svg'), 'utf8'),
    'app/icon.svg without its dark-mode style has drifted from the export\'s favicon-16.svg',
  )
  const dark = readFileSync(join(ASSETS, 'mark-dark.svg'), 'utf8')
  const darkInk = /stroke="(#[0-9A-Fa-f]{6})"/.exec(dark)?.[1]
  const darkCore = /<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/.exec(dark)?.[1]
  assert.ok(darkInk && darkCore, 'mark-dark.svg has no stroke or filled core')
  assert.ok(styles[0].includes('prefers-color-scheme:dark'), 'the favicon style is not a dark-mode media query')
  assert.ok(styles[0].includes(`stroke:${darkInk}`), `the dark favicon's ink is not mark-dark's ${darkInk}`)
  assert.ok(styles[0].includes(`fill:${darkCore}`), `the dark favicon's core is not mark-dark's ${darkCore}`)
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

  // Rect by rect, not value by value: a value found *somewhere* in the file would let two rects
  // swap attributes or a fourth rect appear unnoticed (review, 2026-09-06).
  const drawn = [...tsx.matchAll(/<rect\s([^>]*?)\/>/gs)].map((m) => m[1])
  assert.equal(drawn.length, rects.length, `logo.tsx draws ${drawn.length} rects, the export ${rects.length}`)

  let compared = 0
  for (const [i, attrs] of rects.entries()) {
    for (const [, name, value] of attrs.matchAll(/([a-z-]+)="([^"]+)"/g)) {
      // JSX spells SVG's kebab-case attributes in camelCase; the VALUE is what must survive.
      const jsx = name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      compared++
      assert.ok(
        drawn[i].includes(`${jsx}="${value}"`),
        `logo.tsx rect ${i + 1} is missing ${jsx}="${value}" — the mark was redrawn, and the README's dash rhythm (period = pathLength / 8) no longer closes`,
      )
    }
  }
  assert.ok(compared > 0, 'no attribute was compared — the export\'s rects are not double-quoted any more')
})

test("the identity's two colours are the mark's own, in the tittle and in the ink token", () => {
  const svg = readFileSync(join(ASSETS, 'mark-light.svg'), 'utf8')
  const tsx = readFileSync(LOGO, 'utf8')
  // The core's fill is the accent; the outer boundary's stroke is the ink. Read, not restated.
  const accent = /<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/.exec(svg)?.[1]
  const ink = /<rect[^>]*stroke="(#[0-9A-Fa-f]{6})"/.exec(svg)?.[1]
  assert.ok(accent && ink, 'mark-light.svg has no filled core or stroked boundary')

  // The tittle is the core's colour beside it (logo.tsx's header) — `tokens.test.ts` exempts the
  // whole file from the colour gate, so this is the only thing that holds the hex to the mark.
  assert.ok(tsx.includes(`bg-[${accent}]`), `the tittle is not the mark's core colour ${accent}`)
  // The word is `text-ink`; if the chrome's ink ever moves, the word and the mark split.
  const token = /--color-ink:\s*(#[0-9A-Fa-f]{6})/.exec(readFileSync(join('app', 'globals.css'), 'utf8'))?.[1]
  assert.equal(token?.toUpperCase(), ink.toUpperCase(), `--color-ink is ${token}, the mark's ink is ${ink} — the word and the mark no longer match`)
})

test('the two rasters exist at the sizes the email and the home screen ask for', () => {
  // PNG: bytes 16–23 of the IHDR chunk are width and height, big-endian.
  const size = (path: string) => {
    const b = readFileSync(path)
    assert.equal(b.toString('latin1', 1, 4), 'PNG', `${path} is not a PNG`)
    return [b.readUInt32BE(16), b.readUInt32BE(20)]
  }
  // 44 CSS px at 2× in the email template; 180 is the apple-touch-icon size Next emits.
  assert.deepEqual(size(join('public', 'brand', 'mark-light@2x.png')), [88, 88])
  assert.deepEqual(size(join('app', 'apple-icon.png')), [180, 180])
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
