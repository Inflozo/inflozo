import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CANVASES, canvasFromSegment, canvasOfPath, canvasPath, canvasStack, isEditorPath, isUuid, type CanvasKey } from './lib/editor.ts'

// Story 5.1's URL scheme, held by the module the route, the Shell and the harness read it from.

const ID = '6f1c2a54-3b1e-4c8a-9d0f-2a7b8c9d0e1f'

test('every canvas key round-trips through its address', () => {
  for (const key of Object.keys(CANVASES) as CanvasKey[]) {
    const path = canvasPath(ID, key)
    assert.ok(isEditorPath(path), path)
    assert.equal(canvasOfPath(path), key, path)
    if (key !== 'home') assert.equal(canvasFromSegment(path.split('/').pop() as string), key)
  }
  assert.equal(canvasPath(ID), `/projects/${ID}`, 'Home has no segment')
  assert.equal(canvasFromSegment('home'), 'home', "'home' is a key; the route answers it with the 308")
})

test('every reserved or unknown segment is refused', () => {
  for (const s of ['index', 'private', 'paywall', 'cards', 'custom-x', 'nonsense', 'constructor', '__proto__', 'toString', '']) {
    assert.equal(canvasFromSegment(s), null, s)
  }
  assert.equal(canvasOfPath(`/projects/${ID}/nonsense`), null)
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
