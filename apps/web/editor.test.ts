import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  CANVASES, canvasesOf, canvasFromSegment, canvasOfPageTwoKey, canvasOfPath, canvasOfTemplateKey, canvasPath, canvasStack, captionOf,
  CONDITIONAL, CUSTOM_TEMPLATE_CAPTION, emptiesCustomTemplate, EMPTY_TEMPLATE_ASK, fileOf, fileOfKey, isCards, isEditorPath, isMembership, isPaywall, isRouteCanvas, isRouteKey, isSiteFooter, isSurface, isUuid, labelOf, landWithin, LOCK, siteSlot,
  lockPath, NEW_TEMPLATE_QUERY, newTemplatePath, PAGE_TWO,
  pageTwoKeyOf, routeCanvasOf, ROUTED_EMPTY_ASK, ROUTES, ROUTES_GROUP, routesPath, SETTINGS, settingsPath, SITE, SYNC, syncPath, TEMPLATE_GONE, templateKeyOf, type Canvas, type CanvasKey,
} from './lib/editor.ts'
import { DESKTOP, DEVICES, deviceShown, fitFor, MOBILE, TABLET, viewportWords, type Device } from './lib/device.ts'
import { COMPACT, isCompact, isPhone, PHONE } from './lib/floor.ts'
import { PACK_KEY, PACK_RECORDS_KEY } from './lib/journal.ts'
import { ROUTES_WORDS } from './lib/routes.ts'
import { templateKeyOfFile } from '@inflozo/library'

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
  // Story 7.13 opened `cards` (Editor cards, the second template surface) — it is a canvas now, held below. Story 7.16b
  // opened `custom-x` — a Routes Manager segment, held in the next test
  for (const s of ['index', 'nonsense', 'constructor', '__proto__', 'toString', '', SETTINGS, SYNC, LOCK, ROUTES]) {
    assert.equal(canvasFromSegment(s), null, s)
  }
  assert.equal(canvasOfPath(`/projects/${ID}/nonsense`), null)
})

test('Story 7.16b — a Routes Manager segment in the database\'s shape is a canvas; one outside it is a 404, and a membership segment stays CANVASES\'', () => {
  for (const s of ['custom-x', 'custom-landing', 'custom-landing-test', 'custom-2026']) {
    const canvas = canvasFromSegment(s)
    assert.ok(canvas !== null && isRouteCanvas(canvas), s)
    assert.equal(canvasOfPath(`/projects/${ID}/${s}`), canvas, s)
    assert.equal(canvasPath(ID, canvas), `/projects/${ID}/${s}`, `${s} round-trips through its address`)
    // stored under its file, as a membership canvas is — and the map inverts, which `read.ts` and the sync route rely on
    assert.equal(fileOf(canvas), `${s}.hbs`)
    assert.equal(templateKeyOf(canvas), `custom:${s}.hbs`)
    assert.equal(canvasOfTemplateKey(templateKeyOf(canvas)), canvas)
    assert.equal(fileOfKey(templateKeyOf(canvas)), `${s}.hbs`)
    assert.equal(templateKeyOfFile(fileOf(canvas)), templateKeyOf(canvas), 'the library\'s key for the file is the same (DW-331)')
    // a fourth kind: no membership row, no surface, no page 2
    assert.ok(!isMembership(canvas) && !isSurface(canvas) && pageTwoKeyOf(canvas) === null, s)
  }
  // OUTSIDE `template_key_shape` (`custom-[a-z0-9]+(-[a-z0-9]+)*`): still a synchronous 404 — `CUSTOM_TARGET_RE` would pass
  // `custom--x`, which the database refuses as a key, so it is not the test
  for (const s of ['custom-Bad_x', 'custom--x', 'custom-', 'custom-x-', 'custom-x.hbs', 'custom', 'Custom-x', 'custom-ä']) {
    assert.equal(canvasFromSegment(s), null, s)
    assert.equal(routeCanvasOf(`${s}.hbs`), null, s)
  }
  // THE CONTROL: R-129's three membership segments are `CANVASES`' own, never a Routes Manager canvas
  for (const key of (Object.keys(CANVASES) as CanvasKey[]).filter(isMembership)) {
    assert.equal(canvasFromSegment(key), key)
    assert.ok(!isRouteCanvas(key))
    assert.equal(routeCanvasOf(CANVASES[key].file), null, `${key}'s file is no Routes Manager canvas`)
  }
})

test('Story 7.16b — fileOf, labelOf and captionOf answer both kinds: CANVASES\' own row, and a Routes Manager template\'s', () => {
  for (const key of Object.keys(CANVASES) as CanvasKey[]) {
    assert.equal(fileOf(key), CANVASES[key].file, key)
    assert.equal(labelOf(key, { [key]: 'not this' }), CANVASES[key].label, `${key}: a canvas's label is its own`)
    assert.equal(captionOf(key), CANVASES[key].caption, key)
  }
  const landing = canvasFromSegment('custom-landing') as Canvas
  // R-170: the switcher's row and the tab say the template's display name
  assert.equal(labelOf(landing, { 'custom-landing': 'Landing' }), 'Landing')
  assert.equal(labelOf(landing), 'custom-landing', 'no name handed: the segment, never a blank')
  assert.equal(captionOf(landing), CUSTOM_TEMPLATE_CAPTION)
  // `__proto__` handed as a name map key cannot answer for a canvas
  assert.equal(labelOf(landing, Object.create({ 'custom-landing': 'inherited' }) as Record<string, string>), 'custom-landing')
})

test('Story 7.16b — the menu\'s words and the New template entry\'s address (R-170, routine call 8)', () => {
  // R-251 (owner, 2026-10-17; R-170's one name): the heading names the routes page by its own title, not D5b's "the Routes
  // Manager" — the control is the page's title itself, read from its one list
  assert.equal(ROUTES_GROUP.heading, `From ${ROUTES_WORDS.title}`)
  assert.equal(ROUTES_GROUP.heading.toUpperCase(), 'FROM ROUTES & TEMPLATES', 'D5b :163\'s place, set in capitals')
  assert.equal(ROUTES_GROUP.newTemplate, 'New template', 'D5b :178')
  assert.equal(newTemplatePath(ID), `${routesPath(ID)}?new=${NEW_TEMPLATE_QUERY.new}`)
  assert.equal(new URL(newTemplatePath(ID), 'https://x').searchParams.get('new'), 'template')
  assert.equal(TEMPLATE_GONE.said('Gone'), '“Gone” is no longer one of your templates, so you\'re on Home.')
  assert.equal(TEMPLATE_GONE.dismiss, 'Dismiss')
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

test('Story 7.16a: `routes` is a non-canvas segment too — the Routes Manager, never a canvas', () => {
  assert.equal(routesPath(ID), `/projects/${ID}/${ROUTES}`)
  assert.ok(isEditorPath(routesPath(ID)), 'it is under the project')
  // (1) it resolves as no canvas — it compiles into no template and stores no `project_templates` row
  assert.equal(canvasOfPath(routesPath(ID)), null)
  assert.equal(canvasOfTemplateKey(ROUTES), null)
  assert.equal(canvasFromSegment(ROUTES), null)
  assert.ok(!Object.hasOwn(CANVASES, ROUTES), '`routes` must never join CANVASES')
  // (2) it collides with no canvas path, nor with the other non-canvas segments
  for (const key of Object.keys(CANVASES) as CanvasKey[]) assert.notEqual(canvasPath(ID, key), routesPath(ID), key)
  for (const other of [settingsPath(ID), syncPath(ID), lockPath(ID)]) assert.notEqual(routesPath(ID), other)
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

test('Story 5.17: `lock` is the scheme\'s THIRD non-canvas segment — the same three assertions again', () => {
  assert.equal(lockPath(ID), `/projects/${ID}/${LOCK}`)
  // (1) it resolves as no canvas — it compiles into no template and stores no `project_templates` row
  assert.equal(canvasOfPath(lockPath(ID)), null)
  assert.equal(canvasOfTemplateKey(LOCK), null)
  assert.ok(!Object.hasOwn(CANVASES, LOCK), '`lock` must never join CANVASES')
  // (2) it collides with no canvas path
  for (const key of Object.keys(CANVASES) as CanvasKey[]) assert.notEqual(canvasPath(ID, key), lockPath(ID), key)
  // (3) and it is neither of its two static siblings — three words, never one twice
  assert.notEqual(lockPath(ID), settingsPath(ID))
  assert.notEqual(lockPath(ID), syncPath(ID))
  assert.ok(isEditorPath(lockPath(ID)), 'it is under the project, so the Shell reads it as an editor path')
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

test('DW-187 · DW-189 (Story 5.24e): a site-wide move stays in its band, so every move leaves the site doc in the order the page draws it', () => {
  const i = (designId: string) => ({ designId })
  // made-up site docs, each already in canvas order (headers and bars, then footers) — every shape a band can take
  const docs = [
    [i('a1/1'), i('a2/4'), i('a3/1')],
    [i('a1/1'), i('a3/1'), i('a3/2')],
    [i('a1/1'), i('a2/4'), i('a3/1'), i('a3/2')],
    [i('a3/1'), i('a3/2')],
    [i('a1/1'), i('a2/4')],
    [i('a1/1')],
  ]
  const moved = <T,>(doc: readonly T[], from: number, to: number) => {
    const out = [...doc]
    const [one] = out.splice(from, 1)
    out.splice(to, 0, one!)
    return out
  }
  /** every from and every to, with `land` deciding where the row really lands; answers the moves that broke the order */
  const broken = (land: (footers: boolean[], from: number, to: number) => number) =>
    docs.flatMap((doc) => doc.flatMap((_, from) => doc.flatMap((__, to) => {
      const after = moved(doc, from, land(doc.map((x) => isSiteFooter(x.designId)), from, to))
      return JSON.stringify(after) === JSON.stringify(canvasStack(after, [])) ? [] : [`${doc.map((x) => x.designId)} ${from}→${to}`]
    })))
  assert.deepEqual(broken(landWithin), [], 'clamped, no move leaves the site doc out of the page\'s order')
  // the control: unclamped, a footer dragged above a header (and a header below a footer) is exactly DW-187
  assert.ok(broken((_, __, to) => to).length > 0, 'control: the unclamped moves break the order')
  // a page doc has no bands, and every move is left as asked
  assert.equal(landWithin([false, false, false], 0, 2), 2)
  assert.equal(landWithin([false, false, false], 2, 0), 0)
})

test('DW-187: a NEW site-wide section lands in its band — a header or bar before the first footer, a footer last — so the site doc keeps the page\'s order', () => {
  const i = (designId: string) => ({ designId })
  const docs = [[], ['a1/1'], ['a3/1'], ['a1/1', 'a3/1'], ['a1/1', 'a2/4', 'a3/1', 'a3/2'], ['a3/1', 'a3/2']]
  for (const doc of docs) {
    for (const placing of ['a2/4', 'a3/9']) {
      const after = doc.toSpliced(siteSlot(doc, placing), 0, placing)
      assert.deepEqual(after, canvasStack(after.map(i), []).map((x) => x.designId), `${placing} into [${doc}]`)
    }
  }
  // the control: placed at the end, a bar lands after a footer — out of the page's order
  const end = ['a1/1', 'a3/1', 'a2/4']
  assert.notDeepEqual(end, canvasStack(end.map(i), []).map((x) => x.designId))
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
  // the owner's own words for Story 7.16b's custom templates (R-245)
  assert.equal(CUSTOM_TEMPLATE_CAPTION, 'Custom template')
})

// ─── Story 7.3 — D5f, the ask before the last section leaves a designed custom template (FR-I1) ──────────────────────

test('Story 7.3 · D5f asks exactly where a delete would empty a designed custom template — over every canvas key', () => {
  /** a doc of `n` sections, every one hidden or none: hiding is not emptying (FR-D5), so a hidden last section counts */
  const doc = (n: number, hidden = false) => ({ instances: Array.from({ length: n }, () => ({ hidden })) })
  const keys = Object.keys(CANVASES) as CanvasKey[]
  // the control: some canvas is a custom template and some is not, so a rule answering one way for all would fail
  assert.ok(keys.some(isMembership) && !keys.every(isMembership))
  // Story 7.16b: a Routes Manager canvas is a custom template too
  for (const canvas of [...keys, canvasFromSegment('custom-landing') as Canvas]) {
    const key = templateKeyOf(canvas)
    const custom = isMembership(canvas) || isRouteCanvas(canvas)
    assert.equal(emptiesCustomTemplate(key, doc(1)), custom ? 'stops' : null, `${key}: its last section`)
    assert.equal(emptiesCustomTemplate(key, doc(1, true)), custom ? 'stops' : null, `${key}: its last section, hidden`)
    assert.equal(emptiesCustomTemplate(key, doc(2)), null, `${key}: a section stays`)
    assert.equal(emptiesCustomTemplate(key, doc(2, true)), null, `${key}: a hidden section stays`)
    assert.equal(emptiesCustomTemplate(key, doc(0)), null, `${key}: nothing to delete`)
    assert.equal(emptiesCustomTemplate(key, undefined), null, `${key}: untouched`)
  }
  // neither the site doc nor any page 2 is a custom template
  for (const key of [SITE.key, ...keys.flatMap((c) => pageTwoKeyOf(c) ?? [])]) assert.equal(emptiesCustomTemplate(key, doc(1)), null, key)
})

test('Story 7.16b · D5f\'s routed sentence: a template a route still shows KEEPS shipping, and is asked in its own words', () => {
  const doc = { instances: [{}] }
  const key = 'custom:custom-landing.hbs'
  assert.equal(emptiesCustomTemplate(key, doc, ['custom-landing.hbs']), 'keeps')
  // THE CONTROL: the same delete with no route naming it, and with a route naming ANOTHER template, stops shipping
  assert.equal(emptiesCustomTemplate(key, doc, []), 'stops')
  assert.equal(emptiesCustomTemplate(key, doc, ['custom-about.hbs']), 'stops')
  assert.equal(ROUTED_EMPTY_ASK.title('Landing'), 'Delete the last section from Landing?')
  const one = ROUTED_EMPTY_ASK.body(['/landing/'])
  assert.equal(one[1], '/landing/', 'the paths, alone, for the mono chip')
  assert.equal(one.join(''), 'This template keeps shipping, because /landing/ shows it. Visitors there will see only your header and footer until you add a section.')
  assert.equal(ROUTED_EMPTY_ASK.body(['/landing/', '/offer/']).join(''), 'This template keeps shipping, because /landing/, /offer/ show it. Visitors there will see only your header and footer until you add a section.')
  assert.deepEqual([ROUTED_EMPTY_ASK.cancel, ROUTED_EMPTY_ASK.confirm], [EMPTY_TEMPLATE_ASK.cancel, EMPTY_TEMPLATE_ASK.confirm])
})

test("Story 7.3 · D5f's words: R-170's Delete, the canvas's label and the file its key compiles to", () => {
  const key = templateKeyOf('custom-signup')
  assert.equal(EMPTY_TEMPLATE_ASK.title(CANVASES['custom-signup'].label), 'Delete the last section from Signup?')
  const body = EMPTY_TEMPLATE_ASK.body(fileOfKey(key))
  assert.equal(body[1], 'custom-signup.hbs', 'the file, alone, for the mono chip (R-129)')
  assert.equal(
    body.join(''),
    "This template stops shipping. Any Ghost page still pointing at custom-signup.hbs will still load — it will just wear your ordinary page design instead. Ghost won't warn anyone, which is why we are.",
  )
  assert.deepEqual([EMPTY_TEMPLATE_ASK.cancel, EMPTY_TEMPLATE_ASK.confirm], ['Keep it', 'Delete section'])
})

// ─── Story 5.16 — page 2's table: the key each paginated canvas's page 2 is stored under, and the file it compiles to ──

test('the page-2 table: Home under `index`, Tag and Author under keys of their own, each on its own file', () => {
  // a copy: `deepEqual` is an assertion function, and asserting the table itself would narrow its type for the rest
  assert.deepEqual({ ...PAGE_TWO }, {
    home: { key: 'index', file: 'index.hbs' },
    tag: { key: 'tag-paged', file: 'tag.hbs' },
    author: { key: 'author-paged', file: 'author.hbs' },
  })
  // an archive's page 2 compiles to the archive's own file; only Home's is a different file (Ghost's `/page/N/`)
  for (const key of ['tag', 'author'] as const) assert.equal(PAGE_TWO[key]?.file, CANVASES[key].file)
  for (const key of Object.keys(CANVASES) as CanvasKey[]) {
    const two = pageTwoKeyOf(key)
    assert.equal(two, PAGE_TWO[key]?.key ?? null, key)
    // the inverse, derived from the same table, so the two can never disagree
    if (two !== null) assert.equal(canvasOfPageTwoKey(two), key, two)
  }
  for (const other of ['home', 'site', 'post', 'tag', 'custom:custom-signup.hbs', 'nonsense', '']) assert.equal(canvasOfPageTwoKey(other), null, other)
})

test('R-127 stands: no page-2 key is a canvas, a segment or a switcher row — page 2 is reached from its canvas', () => {
  for (const { key } of Object.values(PAGE_TWO)) {
    assert.equal(canvasOfTemplateKey(key), null, key)
    assert.equal(canvasFromSegment(key), null, `/${key} is refused by the scheme`)
    assert.equal(canvasOfPath(`/projects/${ID}/${key}`), null, key)
    assert.ok(!canvasesOf(true).some((c) => templateKeyOf(c) === key), `${key} is no row of the switcher`)
  }
})

test('every key the editor writes is accepted word for word by the sync route AND by `template_key_shape`', () => {
  // Story 7.13: Editor cards writes no doc — its values ride `CARDS_KEY` into `project_treatments` — so its key is no row's
  // Story 7.16b — and a Routes Manager canvas's
  const written = [SITE.key, ...(Object.keys(CANVASES) as CanvasKey[]).filter((k) => !isCards(k)).map(templateKeyOf), ...Object.values(PAGE_TWO).map((p) => p.key), templateKeyOf(canvasFromSegment('custom-landing-test') as Canvas)]
  // the route's own pattern, read out of the file rather than restated (a route file may export only its handlers)
  const route = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', 'sync', 'route.ts'), 'utf8')
  const pattern = /const TEMPLATE_KEY = \/(.+)\/\n/.exec(route)?.[1]
  assert.ok(pattern, 'the sync route no longer declares TEMPLATE_KEY where this test reads it')
  const shape = new RegExp(pattern)
  // and the constraint, as the architecture's SCHEMA.sql holds it for both tables
  const schema = readFileSync(join(import.meta.dirname, '..', '..', '_bmad-output', 'planning-artifacts', 'architecture', 'architecture-Inflozo-2026-08-19', 'SCHEMA.sql'), 'utf8')
  const lists = [...schema.matchAll(/template_key in \(([^)]*)\)/g)].map((m) => m[1]!.split(',').map((k) => k.trim().replace(/^'|'$/g, '')))
  assert.equal(lists.length, 2, 'both tables carry the constraint')
  for (const key of written) {
    assert.ok(shape.test(key), `the sync route refuses ${key}`)
    const custom = /^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$/.test(key)
    for (const list of lists) assert.ok(custom || list.includes(key), `template_key_shape does not list ${key}`)
  }
  // and nothing wider: a near miss is refused by the route, as the constraint refuses it
  for (const junk of ['home-paged', 'tag-page', 'index2', 'page-2']) assert.ok(!shape.test(junk), junk)
})

test('Story 7.4 (DW-331): the library\'s templateKeyOfFile answers the app\'s own map — every canvas, every page-2 key and site', () => {
  // Story 7.13: Editor cards compiles into `cards.css` and stores no doc, so it has no template key to answer
  for (const key of (Object.keys(CANVASES) as CanvasKey[]).filter((k) => !isCards(k))) {
    assert.equal(templateKeyOfFile(fileOfKey(templateKeyOf(key))), templateKeyOf(key), key)
    const two = PAGE_TWO[key]
    if (two === undefined) continue
    // page 2: Home's is its own file, index.hbs (the copy too); an archive's is page 1's file, inside {{#is "paged"}}
    assert.equal(templateKeyOfFile(CANVASES[key].file, true), two.key, two.key)
    assert.equal(fileOfKey(two.key), two.file, two.key)
    if (two.file !== CANVASES[key].file) assert.equal(templateKeyOfFile(two.file), two.key, two.file)
  }
  assert.equal(templateKeyOfFile(fileOfKey(SITE.key)), SITE.key)
  // the control: a file with no page 2 is refused, never given a key no doc is stored under
  assert.throws(() => templateKeyOfFile('post.hbs', true), /post\.hbs has no page 2/)
})

// ─── Story 5.20 — the first TEMPLATE SURFACE ─────────────────────────────────────────────────────────────────────

test('Story 5.20: `paywall` is a canvas and a template surface — its key is its segment, and its file is the partial', () => {
  assert.equal(canvasFromSegment('paywall'), 'paywall', '`paywall` stopped being a reserved segment')
  assert.equal(canvasOfPath(`/projects/${ID}/paywall`), 'paywall')
  assert.equal(templateKeyOf('paywall'), 'paywall')
  assert.equal(canvasOfTemplateKey('paywall'), 'paywall')
  // the file Ghost reads where `{{content}}` stops a post (`content.js:28`), never a `paywall.hbs` it would ignore
  assert.equal(fileOfKey('paywall'), 'partials/content-cta.hbs')
  assert.equal(CANVASES.paywall.label, 'Paywall')
  assert.equal(CANVASES.paywall.caption, 'Where a gated post stops')
  // offered on every project, and (Story 7.13) with Editor cards the two surfaces, in that order: every other canvas is a page
  assert.ok(canvasesOf().includes('paywall'))
  assert.deepEqual((Object.keys(CANVASES) as CanvasKey[]).filter(isSurface), ['paywall', 'cards'])
  assert.deepEqual((Object.keys(CANVASES) as CanvasKey[]).filter(isPaywall), ['paywall'])
  assert.ok(!isMembership('paywall'))
  // fileOfKey still answers every other key exactly as before
  for (const key of Object.keys(CANVASES) as CanvasKey[]) assert.equal(fileOfKey(templateKeyOf(key)), CANVASES[key].file, key)
  assert.equal(fileOfKey(SITE.key), SITE.file)
  assert.equal(fileOfKey('index'), 'index.hbs')
})

// ─── Story 5.22 — the editor's floor: which device gets the editor, and which of its two shapes ─────────────────

test('R-201: a phone is a TOUCH screen whose SHORTER side is under 500 — held either way, and never a fine pointer', () => {
  // the edge, on the short side: 499 is a phone and 500 is not
  assert.equal(isPhone({ coarse: true, width: 499, height: 900 }), true)
  assert.equal(isPhone({ coarse: true, width: 500, height: 900 }), false)
  // portrait and landscape are the same device — turning it never changes the answer
  for (const [w, h] of [[390, 844], [844, 390], [360, 863], [484, 1000], [768, 1024], [834, 1194], [1366, 1024], [600, 960]]) {
    assert.equal(isPhone({ coarse: true, width: w, height: h }), isPhone({ coarse: true, width: h, height: w }), `${w} × ${h}`)
  }
  // Playwright's device list, the planning's evidence: phones' short sides reach 484, tablets' start at 600
  assert.equal(isPhone({ coarse: true, width: 390, height: 844 }), true, 'iPhone 13')
  assert.equal(isPhone({ coarse: true, width: 863, height: 360 }), true, 'a Pixel 7 held sideways is still a phone')
  assert.equal(isPhone({ coarse: true, width: 768, height: 1024 }), false, 'an iPad Mini held upright is a tablet')
  assert.equal(isPhone({ coarse: true, width: 640, height: 1024 }), false, 'a Galaxy Tab S9 held upright is a tablet')
  // R-76: a fine pointer is NEVER a phone — a desktop at 200% zoom is about 720 × 406 and keeps the editor (WCAG 1.4.4)
  assert.equal(isPhone({ coarse: false, width: 390, height: 844 }), false)
  assert.equal(isPhone({ coarse: false, width: 720, height: 406 }), false)
  // and the media text says the same thing, a coarse pointer in both branches
  assert.equal(PHONE.split(',').length, 2)
  for (const branch of PHONE.split(',')) assert.match(branch, /\(pointer: coarse\) and \((width|height) < 500px\)/)
})

test('R-202: D8\'s rearrangement below 1280 on a fine pointer, and at ANY width on a touch screen', () => {
  assert.equal(isCompact({ coarse: false, width: 1279 }), true)
  assert.equal(isCompact({ coarse: false, width: 1280 }), false)
  assert.equal(isCompact({ coarse: false, width: 1440 }), false)
  assert.equal(isCompact({ coarse: false, width: 720 }), true, 'a 1440 display at 200% zoom')
  for (const width of [768, 834, 1194, 1366, 2560]) assert.equal(isCompact({ coarse: true, width }), true, `coarse at ${width}`)
  // the media text is the same rule: a coarse pointer, or a width
  assert.deepEqual(COMPACT.split(',').map((b) => b.trim().replace(/\d+/, 'N')), ['(pointer: coarse)', '(width < Npx)'])
})

test('DW-235 (Story 5.24e): the sync route asks `docRefusal` of every key before it reads the lock and before the RPC writes', () => {
  // `read.ts` throws on a doc this refuses, which blacks out every canvas of the project — so the one door that writes a
  // doc must refuse it FIRST (the surface-count line before it, `editor.test.ts`'s TEMPLATE_KEY row above, is the precedent)
  const route = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', 'sync', 'route.ts'), 'utf8')
  const asked = route.indexOf('docRefusal(key, ')
  assert.ok(asked > 0, 'the sync route no longer asks docRefusal')
  assert.ok(asked < route.indexOf(".from('edit_locks')"), 'docRefusal is asked before the lock is read')
  assert.ok(asked < route.indexOf("rpc('sync_project_doc'"), 'docRefusal is asked before the write')
})

test('Story 6.3: the sync route refuses a preset this build does not know BEFORE the write, and hands a known one to the RPC', () => {
  // the RPC stores any text it is handed in `style_pack.preset`, and the next read would paint Paper over a junk id — so the
  // one door that writes the pack refuses it first, as a 422 the editor never retries (DW-235's precedent, above)
  const route = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', 'sync', 'route.ts'), 'utf8')
  const refused = route.indexOf("no(422, 'Not a Style Pack')")
  // Story 6.4 re-pins it: a pack the project made (`custom-<n>`) is a preset the body may name, and still nothing else
  assert.ok(refused > 0 && /presetOf\(preset\) === undefined && !isCustom\(preset\)\)\)\) return no\(422, 'Not a Style Pack'\)/.test(route), 'the route no longer asks presetOf')
  assert.ok(refused < route.indexOf("rpc('sync_project_doc'"), 'the preset is refused before the write')
  assert.match(route, /p_preset: \(preset as string \| undefined\) \?\? null/, 'the preset reaches the RPC, or null')
  // a body with only a preset is a write; one with neither docs nor a preset (nor, since 6.4, own packs) is the old 400
  // (Story 7.13: nor card designs)
  assert.match(route, /keys\.length === 0 && preset === undefined && packs === undefined && parsedCards === undefined\) return no\(400, 'Nothing to write'\)/)
  // review: a pack-only body is "already there" only one write past its base — never adopted over another session's docs
  // (Story 6.4: and its own packs must be the server's too)
  // (Story 7.13: and its card designs must be the server's too)
  // (Story 7.16b: over the keys it WROTE — a key it left for a deleted template proves nothing either way)
  assert.match(route, /const ours = written\.length > 0 \|\| answer\.revision === \(base as number\) \+ 1\n\s+if \(same && packThere && packsThere && cardsThere && ours\) return json\(200/)
})

test('Story 7.16b: the sync route never re-creates a deleted template\'s canvas — it leaves the key, writes the rest and names what it left', () => {
  const route = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', 'sync', 'route.ts'), 'utf8')
  const read = route.indexOf(".from('custom_templates').select('filename').eq('project_id', projectId).eq('kind', 'routes')")
  const rpc = route.indexOf("rpc('sync_project_doc'")
  assert.ok(read > 0 && read < rpc, 'the templates are read before the write')
  // read ONCE, and only when a Routes Manager key is in the body — a membership key is never asked about
  assert.match(route, /if \(routeKeys\.length > 0\) \{/)
  assert.match(route, /const routeKeys = keys\.filter\(isRouteKey\)/)
  // after the lock boundary, so a session taken over from hears 423 first (review, 2026-10-17)
  assert.ok(route.indexOf("return no(423, 'Another session holds this project')") < read, 'the lock is asked first')
  // a body of nothing but gone keys writes nothing, and still names them (review, 2026-10-17)
  assert.match(route, /if \(written\.length === 0 && preset === undefined && packs === undefined && parsedCards === undefined\) return json\(200, \{ applied: true, revision: base as number, left \}\)/)
  assert.ok(route.indexOf('if (written.length === 0 &&') < rpc, 'before the RPC')
  // the left keys leave the RPC's docs, and the answer names them on every path
  assert.ok(route.indexOf('for (const key of left) delete parsed[key]') > read, 'the gone keys are dropped before the write')
  assert.match(route, /p_docs: parsed,/)
  assert.equal((route.match(/revision: answer\.revision, left \}\)/g) ?? []).length, 2, 'both answers name the keys left')
  // THE CONTROL, as data: the keys this route judges are the editor's own Routes Manager keys, and no membership key is one
  assert.ok(isRouteKey('custom:custom-landing.hbs'))
  for (const key of ['custom:custom-signup.hbs', 'custom:custom-signin.hbs', 'custom:custom-member-home.hbs', 'home', 'site', 'paywall', 'index']) assert.ok(!isRouteKey(key), key)
})

test('Story 7.16b: an orphan doc is never a canvas — `editorData` skips a Routes Manager `custom:` doc whose template is gone, before it is parsed', () => {
  const read = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', '(editor)', 'read.ts'), 'utf8')
  // the current templates are the same read the switcher's rows come from, so a doc is a canvas exactly when its row is
  assert.match(read, /const current = new Set\(templates\.map\(\(t\) => templateKeyOf\(t\.canvas\)\)\)/)
  const skip = read.indexOf('if (isRouteKey(key) && !current.has(key)) continue')
  assert.ok(skip > 0 && skip < read.indexOf('const doc = parseDoc(row.doc, key)'), 'the orphan is skipped before it is parsed, judged or drawn')
  // and the canvases are the templates' — never a stored key's
  assert.match(read, /const canvases: Canvas\[\] = \[\.\.\.canvasesOf\(\), \.\.\.templates\.map\(\(t\) => t\.canvas\)\]/)
  // THE CONTROL, as data: the skip names Routes Manager keys alone — a membership doc's key is CANVASES' own, so it is kept
  assert.equal(canvasOfTemplateKey('custom:custom-gone.hbs'), 'custom-gone')
  assert.ok(isRouteCanvas(canvasOfTemplateKey('custom:custom-gone.hbs')!))
  assert.equal(canvasOfTemplateKey('custom:custom-signup.hbs'), 'custom-signup')
  assert.ok(!isRouteCanvas(canvasOfTemplateKey('custom:custom-signup.hbs')!))
})

test('Story 6.3: Remix\'s Both writes neither when a design is refused — the fold first, the pack only once it landed, one txn (FR-D9)', () => {
  // the I/O matrix's "a design refusal writes neither": the pack joins the fold's transaction AFTER the fold has landed, so
  // a refused or held fold returns before anything of the pack is journaled
  const editor = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', '(editor)', 'editor.tsx'), 'utf8')
  const body = editor.slice(editor.indexOf('const onRemix = (what: RemixWhat) => {'), editor.indexOf('const openPackList'))
  const fold = body.indexOf('apply({ doc: docKey, instanceId: picks[0]!.instanceId }, fold, undefined, txn)')
  const held = body.indexOf('if (refused === HELD) return')
  const refused = body.indexOf("if (typeof refused === 'string') return setSaid(refused)")
  const pack = body.indexOf('commitPack(to, txn)')
  assert.ok(fold > 0, 'the fold no longer joins the transaction through apply')
  assert.ok(held > fold && refused > fold, 'a held or refused fold is no longer answered after it')
  assert.ok(pack > held && pack > refused, 'the pack is committed before the fold is known to have landed')
})


/* ── STORY 6.4 — a project's own packs ride the same door, validated before the write (AD-36) ───────────────────────── */

test('Story 6.4: neither of the journal\'s pack keys is a template key — the sync route\'s TEMPLATE_KEY refuses both', () => {
  const route = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', 'sync', 'route.ts'), 'utf8')
  const pattern = /const TEMPLATE_KEY = \/(.+)\/\n/.exec(route)?.[1]
  assert.ok(pattern, 'the sync route no longer declares TEMPLATE_KEY where this test reads it')
  const shape = new RegExp(pattern)
  for (const key of [PACK_KEY, PACK_RECORDS_KEY]) assert.ok(!shape.test(key), `${key} would be sent as a doc`)
  // the control: the pattern is read and live — it takes a template key
  assert.ok(shape.test('home'))
})

test('Story 6.4: the sync route refuses own packs that do not all survive ownPacksOf BEFORE the write, and hands the validated map to the RPC', () => {
  const route = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', 'sync', 'route.ts'), 'utf8')
  // every entry through the one reading rule every reader asks (AD-36)
  assert.match(route, /const owned = packs === undefined \? undefined : ownPacksOf\(\{ packs \}\)/)
  const refused = route.indexOf("Object.keys(owned ?? {}).length !== Object.keys(packs).length)) return no(422, 'Not a Style Pack')")
  assert.ok(refused > 0, 'a map with an entry ownPacksOf drops is no longer refused')
  assert.ok(refused < route.indexOf(".from('edit_locks')") && refused < route.indexOf("rpc('sync_project_doc'"), 'the packs are refused only after a read or a write')
  // what is written is what was validated, or null — which writes no packs
  assert.match(route, /p_packs: owned \?\? null/)
  // "already there" compares the server's own packs too
  assert.match(route, /const packsThere = owned === undefined \|\| stable\(stored\?\.packs \?\? \{\}\) === stable\(owned\)/)
  // Story 7.13's review: and the server's own card designs, read where the body carries them — the record, never the row
  assert.match(route, /parsedCards === undefined \? \{ data: null \} : supabase\.from\('project_treatments'\)\.select\('card_designs'\)\.eq\('project_id', projectId\)\.maybeSingle\(\)/)
  assert.match(route, /const cardsThere = parsedCards === undefined \|\| stable\(\(treatments as \{ card_designs\?: unknown \} \| null\)\?\.card_designs \?\? \{\}\) === stable\(parsedCards\)/)
})
