import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { canvasCaching, canvasSrc, harnessCanvasSrc, previewSrc } from './lib/canvas.ts'
import { carriesMemberVisibility, DESIGNS_DIR, docRefusal, pilot, pilotIds, pilotImage, pilotRows, pilots, pilotsCanvasDocument, poolFont } from './lib/pilots.ts'
import { fontFaceCss, packTokensCss, parseDoc, type Pack } from '@inflozo/section-runtime'
import { POOL, PRESETS } from '@inflozo/library/packs'
import { fontHref } from './lib/style-pack.ts'
import { samples } from './lib/controls-review.ts'

// Story 4.10's review surface, held by the files it reads — the fences `controls.test.ts` put around Story 4.5's page,
// for the pilots review. Rendering needs a DOM, which apps/web does not carry; `tools/check-snapshots.mjs` renders
// every pilot on both emitters at every target, and the deployed harness draws this page.

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

  // Story 5.11: the harness hands the fixture ring in as `extra` — the whole document carries every one of its
  // stylesheets (the chrome sheet still last), and a narrowed document serves one of them alone (review, 2026-09-20)
  const extra = samples()
  assert.ok(extra.length > 1)
  const withRing = pilotsCanvasDocument(undefined, extra)
  for (const e of extra) assert.ok(withRing.includes(`/* ${e.id} */`), `${e.id}'s stylesheet is missing from the harness document`)
  assert.ok(withRing.lastIndexOf('data-inflozo-') > withRing.lastIndexOf(`/* ${extra[extra.length - 1]!.id} */`), 'the chrome sheet is still last')
  const one = pilotsCanvasDocument(extra[1]!.id, extra)
  assert.ok(one.includes(`/* ${extra[1]!.id} */`) && !one.includes(`/* ${extra[0]!.id} */`) && !one.includes(`/* ${ids[0]} */`), 'a narrowed fixture document carries that design alone')
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
})

// DW-208 — the rule both canvas routes call, held as a unit; `frame-guard.test.ts` asks the route itself, because a unit
// handed `live` explicitly cannot see the default the routes rely on
test('canvasCaching: immutable only for a build in production, never for no build, an empty one or dev, and nothing outside production', () => {
  const YEAR = 'private, max-age=31536000, immutable'
  // Story 6.2: a pool face is kept as long as the document — its address carries its own hash (`fontHref`)
  assert.deepEqual(canvasCaching('abc', true), { document: YEAR, image: 'private, max-age=600', font: YEAR })
  for (const v of [null, '', 'dev']) assert.equal(canvasCaching(v, true).document, 'no-store', JSON.stringify(v))
  for (const v of ['abc', null, '', 'dev']) assert.deepEqual(canvasCaching(v, false), { document: 'no-store', image: 'no-store', font: 'no-store' }, JSON.stringify(v))
})

// Story 5.4 — R-124's row is drawn for the categories R-113's register files it under, and for nothing else
test('carriesMemberVisibility: read off the control register, false for a category it does not file or an id with none', () => {
  assert.equal(carriesMemberVisibility('a22/1'), true, 'a22 files Member visibility')
  assert.equal(carriesMemberVisibility('a4/13'), true, 'a4 files it too')
  assert.equal(carriesMemberVisibility('a17/1'), false, 'a17 does not')
  assert.equal(carriesMemberVisibility('a22'), true, 'the category alone decides, so a bare category answers as its designs do')
  for (const id of ['', 'zz/1', '/1']) assert.equal(carriesMemberVisibility(id), false, JSON.stringify(id))
})

test('DW-235 (Story 5.24e): ONE rule for what a stored doc may hold — read.ts throws with it, and the sync route refuses with it before it writes', () => {
  const doc = (key: string, ...designIds: string[]) =>
    parseDoc({ schemaVersion: 1, instances: designIds.map((designId, n) => ({ instanceId: `i${n}`, layerName: designId, designId, content: {}, controls: {}, data: {}, darkOverrides: {} })) }, key)
  // the spec's pair: a post header on Home is refused in read.ts's own words, and on its own canvas it stands
  assert.match(docRefusal('home', doc('home', 'a24/1')) ?? '', /never home\.hbs/)
  assert.equal(docRefusal('post', doc('post', 'a24/1')), null)
  // a design the library does not hold, and a template surface with two designs — `read.ts`'s other refusals, one door
  assert.match(docRefusal('home', doc('home', 'a99/1')) ?? '', /is not a design in packages\/library\/designs\//)
  assert.match(docRefusal('paywall', doc('paywall', 'a24/1', 'a24/1')) ?? '', /a paywall holds one design/)
  assert.match(docRefusal('paywall', doc('paywall', 'a24/1')) ?? '', /only a paywall design stands where a post stops/)
  // `held` is the caller's map, filled as designs are read — read.ts hands its `entries` on through it
  const held = {}
  assert.equal(docRefusal('post', doc('post', 'a24/1'), held), null)
  assert.deepEqual(Object.keys(held), ['a24/1'])
})

test('DW-275 (Story 5.24e): the canvas document carries no post-body sheet — the canvas routes serve it at ?sheet=surface', async () => {
  const { surfaceCss } = await import('./lib/style-guide.ts')
  const document = pilotsCanvasDocument()
  assert.ok(surfaceCss().length > 0, 'the control: there is a sheet to leave out')
  assert.ok(!document.includes(surfaceCss()), 'the sheet is not inlined in the canvas document')
  assert.ok(!document.includes('2b-surface'), 'nor any element of its order')
  // and both canvas routes answer it — read out of the files, as `editor.test.ts` reads the sync route (a route file may
  // export only its handlers)
  for (const route of [join('app', '(app)', 'app', '(authed)', 'canvas', 'route.ts'), join('app', '(app)', 'app', 'harness', 'canvas', 'route.ts')]) {
    const source = readFileSync(route, 'utf8')
    assert.match(source, /searchParams\.get\('sheet'\) === 'surface'[^]*surfaceCss\(\)[^]*text\/css/, `${route} answers ?sheet=surface with the sheet, as CSS`)
  }
})

/* ───────── STORY 6.2 — the canvas loads the theme's own faces from this app (§D.b), in any preset `?pack=` names */

test('a font is served only when its name is a file the pool records — never a path, never an unknown name', () => {
  const [first] = Object.values(POOL.faces).flatMap((f) => f.files)
  const bytes = poolFont(first!.file)
  assert.equal(bytes?.subarray(0, 4).toString('latin1'), 'wOF2', 'a pool file is served as the woff2 it is')
  for (const name of ['../../x', `../files/${first!.file}`, 'pool.json', '', 'fraunces-roman-latin', 'FRAUNCES-ROMAN-LATIN.WOFF2', '__proto__']) {
    assert.equal(poolFont(name), null, `${JSON.stringify(name)} was served`)
  }
})

test('every canvas document carries its pack\'s block and its pairing\'s faces from ?font= — Paper\'s block byte for byte', () => {
  const tokens = readFileSync(join('..', '..', 'packages', 'section-runtime', 'reference-tokens.css'), 'utf8')
  const paper = pilotsCanvasDocument()
  assert.ok(paper.includes(`<style data-order="1-tokens">${tokens}</style>`), "Paper's block is not reference-tokens.css")
  assert.match(paper, /font-family: 'Fraunces';[^}]*src: url\(canvas\?font=fraunces-roman-latin\.woff2&h=[0-9a-f]{12}\)/)
  assert.match(paper, /font-family: 'Inter';[^}]*font-style: italic/)
  for (const p of PRESETS) {
    const doc = pilotsCanvasDocument(undefined, [], p.id)
    const faces = /<style data-order="1b-faces">([^]*?)<\/style>/.exec(doc)?.[1] ?? ''
    assert.equal(faces, fontFaceCss(p.pairing, fontHref('canvas')), `${p.id}: the document's faces are not its pairing's`)
    if (p.id !== 'paper') assert.ok(doc.includes(packTokensCss(p.pack as Pack)), `${p.id}: the document does not carry its token block`)
    assert.doesNotMatch(doc, /fonts\.(googleapis|gstatic)\.com/)
  }
  assert.throws(() => pilotsCanvasDocument(undefined, [], 'harbor'), /not a Style Pack preset/)
})
