import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { canvasSrc, harnessCanvasSrc, previewSrc } from './lib/canvas.ts'
import { carriesMemberVisibility, DESIGNS_DIR, pilot, pilotIds, pilotImage, pilotRows, pilots, pilotsCanvasDocument } from './lib/pilots.ts'

// Story 4.10's review surface, held by the files it reads — the fences `controls.test.ts` put around Story 4.5's page,
// for the pilots review. Rendering needs a DOM, which apps/web does not carry; `tools/check-snapshots.mjs` renders
// every pilot on both emitters at every target, and the deployed harness draws this page.

const ROUTE = join('app', '(app)', 'app', '(authed)', 'canvas', 'route.ts')

// The frame is a ROUTE HANDLER: `app-routes.test.ts`'s walk of page.tsx files never sees it and the `(authed)` layout
// never wraps it, so this line is its only guard, read back as text.
test('the canvas route guards itself with currentUser before it builds any body', () => {
  const src = readFileSync(ROUTE, 'utf8')
  const guard = src.indexOf('await currentUser()')
  assert.ok(guard > 0, 'the canvas route does not call currentUser()')
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

// Story 5.1 — AD-21's mechanism, and what makes "zero chrome at rest" a result: the chrome is CSS keyed on attributes
// nothing carries at rest. A selector without the key would paint the site itself.
// Since R-120 (Story 5.2) the outlines are drawn outside the frame and the file held no rule until Story 5.3's editing haze
// (`[data-inflozo-editing]`), so the reader runs first on planted rules, keyed and unkeyed, and an empty file is a result
// rather than a reader that found nothing.
test('every editor chrome selector is keyed on a data-inflozo-* attribute, and the document carries it', () => {
  const css = readFileSync(join('lib', 'canvas-chrome.css'), 'utf8')
  /* Story 5.10 — THE READER UNDERSTANDS AT-RULES, because the hairline needs two. A `@keyframes` block holds no
     selector at all (its `0%` and `50%` stops would read as unkeyed ones), so it is dropped whole; every other
     at-rule — `@media (prefers-reduced-motion: reduce)` — is a WRAPPER, so only its opener goes and the rules inside
     it are read and held to the key exactly as a top-level rule is. */
  const selectors = (sheet: string) =>
    sheet
      .replace(/\/\*[^]*?\*\//g, '')
      .replace(/@(?:-\w+-)?keyframes[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, '')
      .replace(/@[\w-]+[^{}]*\{/g, '')
      .split('}').map((rule) => rule.split('{')[0]?.trim() ?? '').filter(Boolean).flatMap((s) => s.split(','))
  const unkeyed = (sheet: string) => selectors(sheet).filter((s) => !/\[data-inflozo-/.test(s))
  assert.deepEqual(unkeyed(`${css}\n[data-inflozo-hover] .x{outline:0}\ndiv,[data-inflozo-selected]{outline:0}`).map((s) => s.trim()), ['div'], 'control: the reader sees a planted unkeyed selector, and only it')
  assert.ok(selectors(`${css}\n[data-inflozo-hover]{outline:0}`).length > selectors(css).length, 'control: the reader sees a planted keyed rule')
  assert.deepEqual(unkeyed(`${css}\n@keyframes planted{0%,100%{opacity:.5}50%{opacity:1}}`).map((s) => s.trim()), [], 'control: a @keyframes block carries no selector for the key to hold')
  assert.deepEqual(unkeyed(`${css}\n@media (prefers-reduced-motion: reduce){p{animation:none}}`).map((s) => s.trim()), ['p'], 'control: a rule INSIDE an at-rule is still read, and still held to the key')
  for (const s of unkeyed(css)) assert.fail(`"${s.trim()}" is not keyed on a data-inflozo-* attribute`)
  const doc = pilotsCanvasDocument()
  assert.ok(doc.includes(`<style data-order="4-editor">${css}</style>`), 'the canvas document does not carry the chrome stylesheet')
  assert.doesNotMatch(doc, /<script\b/i)
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
      if (b?.fixed === true) {
        assert.equal(rows.newest.length, b.limit, `${e.id} ${key} is fixed at ${b.limit}`)
        assert.deepEqual(rows.oldest, rows.newest, `${e.id} ${key}: a fixed query has one order, whatever is stored`)
      }
    }
  }
})

// Vercel ships a function with only the files the build traced; a path joined at runtime (from the module's own
// address, since Story 4.11) is invisible to it, so `next.config.ts` names them by hand and this holds the two lists together.
test('the canvas document NARROWS to one design when asked, and to the library when not (the owner\'s ruling of 2026-09-20)', () => {
  const whole = pilotsCanvasDocument()
  const ids = pilotIds()
  assert.ok(ids.length > 1, 'this only means anything with more than one design in the library')
  for (const id of ids) {
    const one = pilotsCanvasDocument(id)
    // its own stylesheet, and NOT the others — the marker is the emitted `/* id */` comment
    assert.ok(one.includes(`/* ${id} */`), `${id}'s own stylesheet is missing from its narrowed document`)
    for (const other of ids) if (other !== id) assert.ok(!one.includes(`/* ${other} */`), `${id}'s document still carries ${other}`)
    // and everything that is NOT a design stylesheet is untouched: the tokens, the mount point, the chrome
    assert.ok(one.includes('--bg-page') && one.includes('<div id="canvas"></div>') && one.includes('data-order="4-editor"'))
    assert.ok(!/<script/i.test(one), 'a narrowed document must carry no script either')
    assert.ok(one.length < whole.length, `${id}'s document is no smaller than the whole library's`)
  }
  // an id that is not in the library throws rather than quietly serving everything — the route turns that into a 404
  assert.throws(() => pilotsCanvasDocument('a1/9999'))
})

test("every canvas address carries the build, and a preview keeps it (the owner's ruling of 2026-09-20)", () => {
  // THE VERSION IS WHAT MAKES THE DOCUMENT CACHEABLE AT ALL: the route serves `immutable` only when the address
  // carries one, so an address that quietly lost its `v=` would not go stale — it would go SLOW, silently, which is
  // the failure this test exists to make loud. (It is how the first measurement of this ruling came out flat: the
  // harness's own path had no version, so the guard correctly refused to let anything be kept.)
  for (const src of [canvasSrc(true), canvasSrc(false), harnessCanvasSrc()]) assert.match(src, /[?&]v=[^&]+/, src)
  const preview = previewSrc(canvasSrc(true), 'a4/13')
  assert.match(preview, /[?&]v=[^&]+/, 'a preview address dropped the build')
  assert.match(preview, /[?&]design=a4%2F13/, 'a preview address must still name its design')
  // and the route's own guard: no version, no caching, and nothing cached outside production
  const route = readFileSync(ROUTE, 'utf8')
  assert.match(route, /versioned \? keep\('private, max-age=\d+, immutable'\) : 'no-store'/)
  assert.match(route, /const live = process\.env\.NODE_ENV === 'production'/)
})

test('every file the canvas document and the pilots review read is traced for every route that reads them', () => {
  const config = readFileSync('next.config.ts', 'utf8')
  // the PILOTS_FILES list itself: a glob in another route's list traces nothing for these two
  const list = /const PILOTS_FILES = \[([^\]]*)\]/.exec(config)?.[1] ?? ''
  const globs = [...list.matchAll(/'((?:\.\.\/\.\.\/packages|\.\/lib)\/[^']+)'/g)].map((m) => m[1] as string)
  const covers = (rel: string) => globs.some((g) => (g.endsWith('/**') ? rel.startsWith(g.slice(0, -3)) : g === rel))
  for (const id of pilotIds()) {
    for (const f of ['design.json', 'index.html', 'style.css']) assert.ok(covers(`../../packages/library/designs/${id}/${f}`), `${id}/${f} is not traced`)
  }
  for (const rel of ['../../packages/library/orbit-weekly/images/feature-01.svg', '../../packages/section-runtime/reference-tokens.css']) {
    assert.ok(covers(rel), `${rel} is read by lib/pilots.ts and not traced — the deployed function would throw ENOENT`)
  }
  assert.ok(covers('./lib/canvas-chrome.css'), 'the chrome stylesheet the canvas document reads is not traced')
  for (const route of ['/app/pilots', '/app/canvas', '/app/projects/**']) assert.ok(config.includes(`'${route}': PILOTS_FILES`), `${route} is not traced`)
})

// Story 5.4 — R-124's row is drawn for the categories R-113's register files it under, and for nothing else
test('carriesMemberVisibility: read off the control register, false for a category it does not file or an id with none', () => {
  assert.equal(carriesMemberVisibility('a22/1'), true, 'a22 files Member visibility')
  assert.equal(carriesMemberVisibility('a4/13'), true, 'a4 files it too')
  assert.equal(carriesMemberVisibility('a17/1'), false, 'a17 does not')
  assert.equal(carriesMemberVisibility('a22'), true, 'the category alone decides, so a bare category answers as its designs do')
  for (const id of ['', 'zz/1', '/1']) assert.equal(carriesMemberVisibility(id), false, JSON.stringify(id))
})
