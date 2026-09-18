import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CANVASES, canvasesOf, canvasFromSegment, canvasOfPath, canvasOfTemplateKey, canvasPath, canvasStack, CONDITIONAL,
  isEditorPath, isMembership, isUuid, templateKeyOf, type CanvasKey,
} from './lib/editor.ts'

// Story 5.1's URL scheme, held by the module the route, the Shell, the switcher and the harness read it from.
// Story 5.5 added R-129's three membership canvases, whose stored key is not their segment, and Private's condition.

const ID = '6f1c2a54-3b1e-4c8a-9d0f-2a7b8c9d0e1f'

test('every canvas key round-trips through its address', () => {
  for (const key of Object.keys(CANVASES) as CanvasKey[]) {
    const path = canvasPath(ID, key)
    assert.ok(isEditorPath(path), path)
    assert.equal(canvasOfPath(path), CONDITIONAL[key] === undefined ? key : null, path)
    if (key !== 'home' && CONDITIONAL[key] === undefined) assert.equal(canvasFromSegment(path.split('/').pop() as string), key)
  }
  assert.equal(canvasPath(ID), `/projects/${ID}`, 'Home has no segment')
  assert.equal(canvasFromSegment('home'), 'home', "'home' is a key; the route answers it with the 308")
})

test('every reserved or unknown segment is refused — `index` permanently (R-127)', () => {
  for (const s of ['index', 'paywall', 'cards', 'custom-x', 'nonsense', 'constructor', '__proto__', 'toString', '']) {
    assert.equal(canvasFromSegment(s), null, s)
  }
  assert.equal(canvasOfPath(`/projects/${ID}/nonsense`), null)
})

test('a conditional canvas is ABSENT until its condition holds, and the route 404s it meanwhile (FR-D6)', () => {
  const off = canvasesOf(false)
  const on = canvasesOf(true)
  const conditional = (Object.keys(CANVASES) as CanvasKey[]).filter((k) => CONDITIONAL[k] !== undefined)
  assert.ok(conditional.length > 0, 'the rule needs at least one conditional canvas to be about')
  for (const key of conditional) {
    assert.ok(!off.includes(key), `${key} is offered with its condition false`)
    assert.ok(on.includes(key), `${key} is absent with its condition true`)
  }
  // every unconditional canvas is offered either way, and the row ORDER is `CANVASES`' own — D5b's
  assert.deepEqual(on, Object.keys(CANVASES))
  assert.deepEqual(off, on.filter((k) => !conditional.includes(k as CanvasKey)))
  // AND THE SCHEME REFUSES ITS SEGMENT while the condition is false — synchronously, which is the only refusal that
  // answers the app's own 404 rather than Next's bare error document (executed 2026-09-18; `CONDITIONAL` carries why)
  for (const key of conditional) {
    assert.equal(canvasFromSegment(key), null, key)
    assert.equal(canvasOfPath(`/projects/${ID}/${key}`), null, key)
  }
})

test('R-129: a membership canvas stores under its FILE, every other canvas under its segment', () => {
  for (const key of Object.keys(CANVASES) as CanvasKey[]) {
    const stored = templateKeyOf(key)
    assert.equal(stored, isMembership(key) ? `custom:${CANVASES[key].file}` : key, key)
    // and the map is invertible, which is what `read.ts`'s `fileOf` depends on
    assert.equal(canvasOfTemplateKey(stored), key, stored)
  }
  assert.equal(canvasOfTemplateKey('site'), null, 'the site doc belongs to no canvas')
  assert.equal(canvasOfTemplateKey('index'), null, 'page 2 has no canvas (R-127)')
  // the three are exactly the custom-templated ones, and each stored key satisfies the pattern the CHECK is MEANT to
  // carry. NOT the one production stores: that has two backslashes and refuses all three (DW-193, executed at Story
  // 5.5's review) — Story 5.8's Schema phase fixes the constraint, and this assertion is then the same pattern.
  for (const key of (Object.keys(CANVASES) as CanvasKey[]).filter(isMembership)) {
    assert.match(templateKeyOf(key), /^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$/, key)
  }
})

test('the editor path is /projects/<anything> and below, never /projects', () => {
  for (const p of ['/projects/abc', `/projects/${ID}/post`, `/projects/${ID}/`]) assert.ok(isEditorPath(p), p)
  for (const p of ['/projects', '/projects/', '/', '/sites', '/projectsx/abc']) assert.ok(!isEditorPath(p), p)
})

test('a uuid is checked before any query', () => {
  assert.ok(isUuid(ID))
  for (const s of ['abc', `${ID}x`, ID.replace(/-/g, ''), "' or 1=1 --"]) assert.ok(!isUuid(s), s)
})

test('the stack: site-wide outside a3 first, then the canvas, then the a3 footers, each in doc order', () => {
  const i = (designId: string, n: string) => ({ designId, n })
  const site = [i('a3/1', 'footer'), i('a1/1', 'header'), i('a2/4', 'bar'), i('a3/2', 'footer2')]
  const own = [i('a4/13', 'hero'), i('a17/1', 'grid')]
  assert.deepEqual(canvasStack(site, own).map((x) => x.n), ['header', 'bar', 'hero', 'grid', 'footer', 'footer2'])
  assert.deepEqual(canvasStack([], []), [])
})
