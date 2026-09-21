import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CANVASES, canvasesOf, canvasFromSegment, canvasOfPath, canvasOfTemplateKey, canvasPath, canvasStack, CONDITIONAL,
  CUSTOM_TEMPLATE_CAPTION, isEditorPath, isMembership, isUuid, SETTINGS, settingsPath, SYNC, syncPath, templateKeyOf,
  type CanvasKey,
} from './lib/editor.ts'
import { DESKTOP, DEVICES, deviceShown, fitFor, MOBILE, TABLET, viewportWords, type Device } from './lib/device.ts'

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

test('every reserved or unknown segment is refused — `index` permanently (R-127), and so is `settings` (R-131)', () => {
  for (const s of ['index', 'paywall', 'cards', 'custom-x', 'nonsense', 'constructor', '__proto__', 'toString', '', SETTINGS, SYNC]) {
    assert.equal(canvasFromSegment(s), null, s)
  }
  assert.equal(canvasOfPath(`/projects/${ID}/nonsense`), null)
})

test('R-131: `settings` is the scheme\'s one NON-CANVAS segment — a real route, and never a canvas', () => {
  assert.equal(settingsPath(ID), `/projects/${ID}/${SETTINGS}`)
  assert.ok(isEditorPath(settingsPath(ID)), 'it is under the project, so the Shell reads it as an editor path')
  // it compiles into no template and stores no row, so nothing about it may resolve as a canvas
  assert.equal(canvasOfPath(settingsPath(ID)), null)
  assert.equal(canvasOfTemplateKey(SETTINGS), null)
  assert.ok(!Object.hasOwn(CANVASES, SETTINGS), '`settings` must never join CANVASES')
  // and it is not the address of any canvas, so the two can never collide
  for (const key of Object.keys(CANVASES) as CanvasKey[]) assert.notEqual(canvasPath(ID, key), settingsPath(ID), key)
})

test('Story 5.8: `sync` is the scheme\'s SECOND non-canvas segment — the same three assertions `settings` carries', () => {
  assert.equal(syncPath(ID), `/projects/${ID}/${SYNC}`)
  // (1) it resolves as no canvas — it compiles into no template and stores no `project_templates` row
  assert.equal(canvasOfPath(syncPath(ID)), null)
  assert.equal(canvasOfTemplateKey(SYNC), null)
  assert.ok(!Object.hasOwn(CANVASES, SYNC), '`sync` must never join CANVASES')
  // (2) it collides with no canvas path, so the two can never resolve to the same address
  for (const key of Object.keys(CANVASES) as CanvasKey[]) assert.notEqual(canvasPath(ID, key), syncPath(ID), key)
  // (3) and it is not `settings` either — two static siblings of `[template]`, never one word twice
  assert.notEqual(syncPath(ID), settingsPath(ID))
  assert.ok(isEditorPath(syncPath(ID)), 'it is under the project, so the Shell reads it as an editor path')
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

// ─── Story 5.7 — the canvas as a viewport. The fit is the only arithmetic in the story, so it is the only thing
// here: the table itself is read out of the export (`lib/device.ts` cites each height) and the chip's words are
// UX-DR17's, quoted rather than computed. The worked stage is the owner's own 1440 laptop —
// 1440 − 240 (Layers) − 280 (Controls) − 56 (`px-7`) = 864 wide, 900 − 48 (bar) − 64 (`py-8`: R-138's top, R-139's bottom) = 788 tall. The 32 is
// R-138's (owner, 2026-09-19): 8px more than S4a draws, so the page card can never rise under the viewport chip —
// measured on the deployed editor, where a height-bound card did. R-139's matching bottom keeps a height-bound card off the window's edge: Tablet 74% → 71%, Mobile 97% → 93%.

const STAGE = { width: 864, height: 788 }
const pct = (device: Device) => Math.round(fitFor(STAGE, device) * 100)

test('R-137: every device is a viewport in BOTH axes, and each is a named size read out of the export', () => {
  // no count is asserted — membership is the table's (standing rule 4); what is asserted is that each has a height
  for (const d of DEVICES) assert.ok(d.width > 0 && d.height > 0, `${d.name} ${d.width}×${d.height}`)
  assert.deepEqual([DESKTOP.width, DESKTOP.height], [1440, 900], 'B11a: VIEWPORT 1440 × 900')
  assert.deepEqual([TABLET.width, TABLET.height], [834, 1112], 'D8a · TABLET · 834 × 1112')
  assert.deepEqual([MOBILE.width, MOBILE.height], [390, 844], 'UX-DR17, verbatim')
  assert.equal(DEVICES[0], DESKTOP, 'Desktop leads the track and is the resting state')
})

test('the fit is min(1, w/W, h/H) — BOTH axes, over the matrix the spec worked', () => {
  // Desktop is width-bound on this stage, Tablet and Mobile are height-bound: the whole point of fitting both
  assert.equal(fitFor(STAGE, DESKTOP), 864 / 1440)
  assert.equal(fitFor(STAGE, TABLET), 788 / 1112)
  assert.equal(fitFor(STAGE, MOBILE), 788 / 844)
  assert.deepEqual([pct(DESKTOP), pct(TABLET), pct(MOBILE)], [60, 71, 93])
  // and the whole viewport is in shot in both axes, every time
  for (const d of DEVICES) {
    const fit = fitFor(STAGE, d)
    assert.ok(d.width * fit <= STAGE.width + 1e-9 && d.height * fit <= STAGE.height + 1e-9, `${d.name} ${d.width * fit}×${d.height * fit}`)
  }
})

test('NOTHING IS EVER MAGNIFIED: a stage larger than the device in both axes fits at exactly 1', () => {
  // the cap is the reason it is `min(1, …)`: without it a 390-wide viewport fills a 1440 stage at 3.7× and lies
  // about size in the opposite direction
  assert.equal(fitFor({ width: 2560, height: 1440 }, MOBILE), 1)
  assert.equal(fitFor({ width: 1441, height: 901 }, DESKTOP), 1)
  // larger in ONE axis only is still bound by the other
  assert.equal(fitFor({ width: 4000, height: 422 }, MOBILE), 0.5)
})

test('a stage with no size yet is 1, never Infinity or NaN — the state before the first ResizeObserver callback', () => {
  for (const stage of [{ width: 0, height: 0 }, { width: 864, height: 0 }, { width: 0, height: 788 }]) {
    assert.equal(fitFor(stage, DESKTOP), 1, JSON.stringify(stage))
  }
})

test('UX-DR17: the chip states the TRUE SIZE first and the shrinking second, as a sentence', () => {
  assert.equal(viewportWords(MOBILE, fitFor(STAGE, MOBILE)), 'viewport 390 × 844 · shown at 93%')
  assert.equal(viewportWords(DESKTOP, 1), 'viewport 1440 × 900 · shown at 100%')
  // a shrunk canvas never reads 100%, and a drawn one never reads 0% (review)
  assert.equal(viewportWords(DESKTOP, 0.996), 'viewport 1440 × 900 · shown at 99%')
  assert.equal(viewportWords(DESKTOP, 0.001), 'viewport 1440 × 900 · shown at 1%')
  // the live region says the device NOW SHOWING and its real size, never the press (`modeShown`'s shape)
  assert.equal(deviceShown(TABLET), 'Tablet — 834 × 1112')
})

test('R-171: every canvas carries its own one line for the Template list, and a custom template reads "Custom template"', () => {
  const captions = Object.values(CANVASES).map((c) => c.caption)
  for (const [key, c] of Object.entries(CANVASES)) {
    assert.ok(c.caption.length > 0 && !c.caption.includes('\n'), `${key} has no one-line caption`)
    // a ONE-liner: the menu truncates past its width, so a line this long would lose its end on the indented rows
    assert.ok(c.caption.length <= 30, `${key}'s caption "${c.caption}" is longer than one line of the 284px menu`)
    assert.notEqual(c.caption.toLowerCase(), c.label.toLowerCase(), `${key}'s caption only repeats its name`)
  }
  assert.equal(new Set(captions).size, captions.length, 'no two templates are described the same way')
  // the owner's own words for Story 7.16's custom templates
  assert.equal(CUSTOM_TEMPLATE_CAPTION, 'Custom template')
})
