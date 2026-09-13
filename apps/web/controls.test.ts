import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateDesign } from '@inflozo/library'
import type { CategoryContent, DesignJson } from '@inflozo/library'
import { iconDrawing } from '@inflozo/library/icons'
import { CONTROLS_DIR, canvasDocument, imagePool, poolImage, referenceSwatches, sample } from './lib/controls-review.ts'

// Story 4.5's review surface, held by the files it reads — the fences `style-guide.test.ts` put around
// Story 4.4's page, for the controls review. A core package cannot open a file, so the half of the
// contract that lives on disk is tested here.

const ROUTE = join('app', '(app)', 'app', '(authed)', 'controls', 'frame', 'route.ts')

// The frame is a ROUTE HANDLER: `app-routes.test.ts`'s walk of page.tsx files never sees it and the
// `(authed)` layout never wraps it, so this line is its only guard, read back as text.
test('the frame route guards itself with currentUser before it builds any body', () => {
  const src = readFileSync(ROUTE, 'utf8')
  const guard = src.indexOf('await currentUser()')
  assert.ok(guard > 0, 'the frame route does not call currentUser()')
  for (const body of ['canvasDocument(', 'poolImage(']) {
    assert.ok(src.indexOf(body) > guard, `${body} runs before the guard — a stranger would get the body`)
  }
  assert.match(src, /303/, 'a signed-out request is sent to /sign-in with a 303, as style-guide/frame does')
})

test('the canvas document carries no script, so it needs no nonce', () => {
  const doc = canvasDocument()
  assert.doesNotMatch(doc, /<script\b/i)
  assert.match(doc, /<div id="canvas"><\/div>/, 'the mount point the review writes the section into')
  assert.match(doc, /<meta name="robots" content="noindex,nofollow">/)
  assert.match(doc, /data-mode="light"/)
})

test('a picture is served only when its id is in the pool', () => {
  const pool = imagePool()
  assert.ok(pool.some((a) => a.id === 'feature-03'), 'the sample picture feature-03 is not in the pool')
  assert.ok(poolImage('feature-03')?.toString('utf8').includes('<svg'))
  for (const id of ['../dataset', 'feature-03.svg', '', 'portrait-01']) assert.equal(poolImage(id), null, `${JSON.stringify(id)} was served`)
})

// Vercel ships a function with only the files the build traced; a path built from `process.cwd()` at
// runtime is invisible to it, so `next.config.ts` names them by hand and this holds the two lists together.
test('every directory the controls review reads off disk is traced for both routes in next.config.ts', () => {
  const config = readFileSync('next.config.ts', 'utf8')
  const globs = [...config.matchAll(/'(\.\.\/\.\.\/packages\/[^']+)'/g)].map((m) => m[1] as string)
  const covers = (rel: string) => globs.some((g) => (g.endsWith('/**') ? rel.startsWith(g.slice(0, -3)) : g === rel))
  for (const rel of [
    '../../packages/library/fixtures/controls/1/design.json',
    '../../packages/library/fixtures/controls/content.json',
    '../../packages/library/orbit-weekly/images/feature-03.svg',
    '../../packages/section-runtime/reference-tokens.css',
  ]) {
    assert.ok(covers(rel), `${rel} is read by lib/controls-review.ts and not traced — the deployed function would throw ENOENT`)
  }
  for (const route of ['/app/controls', '/app/controls/frame']) assert.match(config, new RegExp(`'${route}': CONTROLS_FILES`))
})

test('the assembled sample validates clean, through the same door the page uses', () => {
  const entry = sample() // throws, naming every failure, if it does not
  assert.equal(entry.id, 'controls/1')
  const design = JSON.parse(readFileSync(join(CONTROLS_DIR(), '1', 'design.json'), 'utf8')) as DesignJson
  const content = JSON.parse(readFileSync(join(CONTROLS_DIR(), 'content.json'), 'utf8')) as CategoryContent
  assert.deepEqual(validateDesign({ html: entry.html, design, content, icons: iconDrawing }), [])
})

test('the swatches are the reference tokens, and every colour role has one', () => {
  const swatches = referenceSwatches()
  assert.deepEqual(Object.keys(swatches).sort(), ['accent', 'base', 'contrast', 'surface'])
  for (const [role, value] of Object.entries(swatches)) assert.ok(value.length > 0, `${role} has no colour`)
})
