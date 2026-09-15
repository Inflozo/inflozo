import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DESIGNS_DIR, pilot, pilotIds, pilotImage, pilotRows, pilots, pilotsCanvasDocument } from './lib/pilots.ts'

// Story 4.10's review surface, held by the files it reads — the fences `controls.test.ts` put around Story 4.5's page,
// for the pilots review. Rendering needs a DOM, which apps/web does not carry; `tools/check-snapshots.mjs` renders
// every pilot on both emitters at every target, and the deployed harness draws this page.

const ROUTE = join('app', '(app)', 'app', '(authed)', 'pilots', 'frame', 'route.ts')

// The frame is a ROUTE HANDLER: `app-routes.test.ts`'s walk of page.tsx files never sees it and the `(authed)` layout
// never wraps it, so this line is its only guard, read back as text.
test('the pilots frame route guards itself with currentUser before it builds any body', () => {
  const src = readFileSync(ROUTE, 'utf8')
  const guard = src.indexOf('await currentUser()')
  assert.ok(guard > 0, 'the frame route does not call currentUser()')
  for (const body of ['pilotsCanvasDocument(', 'pilotImage(']) {
    assert.ok(src.indexOf(body) > guard, `${body} runs before the guard — a stranger would get the body`)
  }
  assert.match(src, /303/, 'a signed-out request is sent to /sign-in with a 303, as controls/frame does')
})

test('the pilots canvas document carries no script, every pilot stylesheet and the tokens', () => {
  const doc = pilotsCanvasDocument()
  assert.doesNotMatch(doc, /<script\b/i)
  assert.match(doc, /<div id="canvas"><\/div>/, 'the mount point the review writes the section into')
  assert.match(doc, /<meta name="robots" content="noindex,nofollow">/)
  assert.match(doc, /data-mode="light"/)
  for (const e of pilots()) assert.ok(doc.includes(`/* ${e.id} */`) && doc.includes(e.css), `${e.id}'s stylesheet is not in the canvas document`)
  assert.ok(doc.includes('--bg-page'), 'the reference tokens are not in the canvas document')
})

test('the design list is the directory, and every pilot on it validates and assembles through the page\'s door', () => {
  const ids = pilotIds()
  assert.ok(ids.length > 0, `no design found under ${DESIGNS_DIR()}`)
  assert.deepEqual(pilots().map((e) => e.id), ids)
  for (const e of pilots()) assert.equal(e.provisional, true, `${e.id} is not provisional (AD-35)`)
  assert.throws(() => pilot('a99/1'), /is not a design/)
})

test('a picture is served only when its name is an Orbit Weekly picture', () => {
  assert.ok(pilotImage('feature-01')?.toString('utf8').includes('<svg'))
  for (const name of ['../dataset', 'feature-01.svg', '', 'FEATURE-01', 'no-such-picture']) assert.equal(pilotImage(name), null, `${JSON.stringify(name)} was served`)
})

test('a query the design fixes is handed its fixed rows, newest first', () => {
  for (const e of pilots()) {
    for (const [key, rows] of Object.entries(pilotRows(e))) {
      const b = e.dataBindings?.[key]
      if (b?.fixed === true) assert.equal(rows.length, b.limit, `${e.id} ${key} is fixed at ${b.limit}`)
    }
  }
})

// Vercel ships a function with only the files the build traced; a path built from `process.cwd()` at runtime is
// invisible to it, so `next.config.ts` names them by hand and this holds the two lists together.
test('every directory the pilots review reads off disk is traced for both routes in next.config.ts', () => {
  const config = readFileSync('next.config.ts', 'utf8')
  const globs = [...config.matchAll(/'(\.\.\/\.\.\/packages\/[^']+)'/g)].map((m) => m[1] as string)
  const covers = (rel: string) => globs.some((g) => (g.endsWith('/**') ? rel.startsWith(g.slice(0, -3)) : g === rel))
  for (const id of pilotIds()) {
    for (const f of ['design.json', 'index.html', 'style.css']) assert.ok(covers(`../../packages/library/designs/${id}/${f}`), `${id}/${f} is not traced`)
  }
  for (const rel of ['../../packages/library/orbit-weekly/images/feature-01.svg', '../../packages/section-runtime/reference-tokens.css']) {
    assert.ok(covers(rel), `${rel} is read by lib/pilots.ts and not traced — the deployed function would throw ENOENT`)
  }
  for (const route of ['/app/pilots', '/app/pilots/frame']) assert.match(config, new RegExp(`'${route}': PILOTS_FILES`))
})
