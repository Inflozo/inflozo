import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compilesTo } from '@inflozo/library'
import {
  defaultContent, isDesigned, isSynthesizable, pageTwoStack, parseDoc, removeSection, setHidden, synthesize, SYNTHESIS_DEFAULTS,
  type ProjectDoc, type SynthesisLibrary,
} from '@inflozo/section-runtime'
import { CANVASES, CONDITIONAL, canvasesOf, isMembership, isSurface, templateKeyOf, type CanvasKey } from './lib/editor.ts'
import { committed, templatesOpen } from './lib/round-trip.ts'
import { pilot, pilotIds } from './lib/pilots.ts'

/* Story 5.5 — the doc rules that are NOT gestures: AD-22's round trip, FR-D5's "hiding is not emptying", and the
   template count that stopped being "every canvas". The gestures themselves are `run-verify-editor.cjs`'s.
 *
 * THIS IS WHERE SYNTHESIS MEETS THE REAL LIBRARY. `packages/section-runtime/src/synthesize.test.ts` proves the
 * function over a library it builds, because AD-1 bans `node:fs` in a core package; here `lib/pilots.ts` reads
 * `packages/library/designs/` — the directory IS the design list — so the present and the dropped rows are derived
 * from what the library actually holds and these assertions follow Epics 9 and 10 without an edit. */

/** The library as the app hands it to synthesis: `read.ts`'s own lookup, answering `undefined` rather than throwing. */
const held: SynthesisLibrary = (designId) => (pilotIds().includes(designId) ? pilot(designId) : undefined)

const EMPTY: ProjectDoc = { schemaVersion: 1, instances: [] }
const doc = (instances: ProjectDoc['instances']): ProjectDoc => ({ schemaVersion: 1, instances })

/** What `read.ts` hands the editor: the synthesized doc of every untouched synthesizable canvas the project offers. */
const opened = (privateSite = false) => {
  const docs: Record<string, ProjectDoc> = {}
  const auto = new Set<CanvasKey>()
  for (const key of canvasesOf(privateSite)) {
    if (!isSynthesizable(CANVASES[key].file)) continue
    docs[templateKeyOf(key)] = doc(synthesize(CANVASES[key].file, held).instances)
    auto.add(key)
  }
  return { docs, auto }
}

test('every canvas the project offers is either synthesizable or opens empty — and the never-synthesized set is R-129\'s three plus Private, and the paywall surface (5.20)', () => {
  const never = canvasesOf(true).filter((key) => !isSynthesizable(CANVASES[key].file))
  assert.deepEqual(never.sort(), ['custom-member-home', 'custom-signin', 'custom-signup', 'paywall', 'private'])
  for (const key of never) {
    assert.ok(isMembership(key) || key === 'private' || isSurface(key), key)
    assert.deepEqual(synthesize(CANVASES[key].file, held), { instances: [], dropped: [] }, key)
  }
  // and a canvas with no doc at all draws nothing and is not marked — the two halves of "opens empty"
  const { docs, auto } = opened(true)
  for (const key of never) {
    assert.equal(docs[templateKeyOf(key)], undefined, key)
    assert.ok(!auto.has(key), key)
  }
})

test('against the library as it stands, each untouched canvas opens on exactly the rows the library can place', () => {
  for (const key of canvasesOf(true)) {
    const file = CANVASES[key].file
    const rows = SYNTHESIS_DEFAULTS[file] ?? []
    // DERIVED, never listed: a row is present iff the library holds that design AND it compiles to this file
    const want = rows.filter((r) => { const e = held(r.designId); return e !== undefined && compilesTo(e.compileTarget, file) })
    const { instances, dropped } = synthesize(file, held)
    assert.deepEqual(instances.map((i) => i.designId), want.map((r) => r.designId), file)
    assert.deepEqual(dropped.map((d) => d.designId), rows.filter((r) => !want.includes(r)).map((r) => r.designId), file)
    // every drop names a reason, and every placed design really is one of the library's own
    for (const d of dropped) assert.match(d.reason, /the library holds no design |never /, `${file}: ${d.reason}`)
    for (const i of instances) assert.ok(pilotIds().includes(i.designId), `${file}: ${i.designId}`)
  }
})

test('an untouched canvas with every row dropped is STILL auto-generated — it is not the same as never auto-generated', () => {
  const { docs, auto } = opened()
  const emptied = canvasesOf(false).filter((key) => isSynthesizable(CANVASES[key].file) && docs[templateKeyOf(key)]?.instances.length === 0)
  // today `error` is one (A31 is unauthored); the day it is not, this test asserts nothing rather than going stale
  for (const key of emptied) {
    assert.ok(auto.has(key), `${key} lost its marker by having nothing to draw`)
    assert.ok(!isDesigned(docs[templateKeyOf(key)] ?? EMPTY), key)
  }
})

// ─── AD-22's round trip, over the docs the editor really holds ───

/** `editor.tsx`'s `commit` IS `lib/round-trip.ts`'s `committed` — imported, not copied (review, 2026-09-18: the copy
 *  that stood here let the real rule be inverted with `pnpm check` green). Note what the rule is NOT: a test of the doc
 *  alone. An untouched canvas opens on its default stack, so its doc is full while it is still untouched — which is
 *  exactly why the editor holds an explicit `auto` set instead of deriving the marker from the instances. */
const write = (docs: Record<string, ProjectDoc>, auto: ReadonlySet<CanvasKey>, key: CanvasKey, next: ProjectDoc) =>
  committed({ ...docs, [templateKeyOf(key)]: next }, templateKeyOf(key), docs, auto)

test('the first edit MATERIALISES: the doc is the user\'s and the markers go', () => {
  const { docs, auto } = opened()
  const key: CanvasKey = 'tag'
  const before = docs[templateKeyOf(key)] as ProjectDoc
  assert.ok(before.instances.length > 0, 'the tag canvas must have a stack for this to be about anything')
  assert.ok(auto.has(key), 'it starts untouched — the marker is the server\'s word, not the doc\'s shape')
  // any edit at all — a rename is the owner's own step 8
  const renamed = { ...before, instances: before.instances.map((i, n) => (n === 0 ? { ...i, layerName: 'My tag feed' } : i)) }
  assert.ok(isDesigned(renamed))
  const after = write(docs, auto, key, renamed)
  assert.ok(!after.auto.has(key) && !after.back, 'the canvas is now the user\'s')
  assert.equal(after.docs[templateKeyOf(key)], renamed)
  assert.ok(auto.has(key), 'and the set handed in is not mutated')
})

test('EMPTYING returns it to untouched, and the default stack comes back with its marker (AD-22)', () => {
  const { docs, auto } = opened()
  const key: CanvasKey = 'tag'
  let live = docs[templateKeyOf(key)] as ProjectDoc
  for (const id of live.instances.map((i) => i.instanceId)) {
    const next = removeSection(live, id)
    assert.notEqual(typeof next, 'string', String(next))
    live = next as ProjectDoc
  }
  assert.deepEqual(live.instances, [])
  const designed = new Set([...auto].filter((k) => k !== key))
  const after = write(docs, designed, key, live)
  assert.ok(after.back && after.auto.has(key), 'the last section off makes it untouched again')
  assert.equal(after.docs[templateKeyOf(key)], docs[templateKeyOf(key)], 'and the doc in force is the default stack, not the empty one')
  // and what re-renders is the SAME stack it opened on — synthesis is pure, so it is the same doc byte for byte
  assert.deepEqual(synthesize(CANVASES[key].file, held).instances, (docs[templateKeyOf(key)] as ProjectDoc).instances)
})

test('HIDING every section is not emptying: still designed, nothing re-synthesizes (FR-D5)', () => {
  const { docs, auto } = opened()
  const key: CanvasKey = 'tag'
  let live = docs[templateKeyOf(key)] as ProjectDoc
  for (const id of live.instances.map((i) => i.instanceId)) {
    const next = setHidden(live, id, true)
    assert.notEqual(typeof next, 'string', String(next))
    live = next as ProjectDoc
  }
  assert.ok(live.instances.every((i) => i.hidden), 'every row is hidden')
  assert.ok(isDesigned(live), 'a hidden instance is RETAINED, so the canvas is still designed')
  // HIDE-FIRST, on a canvas nothing else has touched: it materialises like any other write, and gives nothing back
  const after = write(docs, auto, key, live)
  assert.ok(!after.back && !after.auto.has(key), 'no marker comes back, and the one it had goes')
})

// ─── the template count, and R-127 on the owner's own project ───

test('the site-wide count is the templates that SHIP, not every canvas the switcher offers', () => {
  const { docs, auto } = opened()
  const canvases = canvasesOf(false)
  const count = templatesOpen(canvases, docs, auto)
  // a membership canvas emits nothing until designed (FR-D6), so it is not counted while it is empty
  assert.ok(count < canvases.length, 'an undesigned membership canvas must not be counted')
  assert.equal(count, canvases.filter((key) => isSynthesizable(CANVASES[key].file)).length)
  // design one, and it joins the count — the number follows the project rather than a literal
  const designed = { ...docs, [templateKeyOf('custom-signup')]: doc(synthesize('tag.hbs', held).instances) }
  assert.equal(templatesOpen(canvases, designed, auto), count + 1)
  // Story 5.20 — a designed PAYWALL is no template a header reaches: a surface never joins the count
  const paywalled = { ...docs, [templateKeyOf('paywall')]: doc(synthesize('tag.hbs', held).instances.slice(0, 1)) }
  assert.equal(templatesOpen(canvases, paywalled, auto), count)
  // nothing in this change is allowed to be a written-down number: every count above came out of `canvasesOf`
  assert.equal(canvases.length, Object.keys(CANVASES).length - Object.keys(CONDITIONAL).length, 'every canvas but the conditional ones')
})

test('R-179 on the real library: page 2 is an exact copy of page 1 on Home, Tag and Author — every design it holds may sit there', () => {
  // the owner's Ghost 5 Project Home, widened: EVERY Home design the library holds, the feed designated — a band ABOVE
  // the grid included. Through AD-27's one schema, so each instance is a doc the editor could have stored.
  const feed = synthesize('home.hbs', held).instances.find((i) => i.isMainFeed)?.designId
  const home = parseDoc({
    schemaVersion: 1,
    instances: pilotIds().map(pilot).filter((e) => e.compileTarget.includes('home.hbs')).map((e, n) => ({
      instanceId: `h${n}`, layerName: e.name, designId: e.id, content: defaultContent(e.contentSchema), controls: {}, data: {},
      darkOverrides: {}, isMainFeed: e.id === feed,
    })),
  }, 'home')
  assert.ok(home.instances.some((i) => i.isMainFeed) && home.instances.length > 1, 'the control: a Home with a feed and something beside it')
  const two = pageTwoStack('home.hbs', home, null, held)
  assert.deepEqual(two.instances.map((i) => i.instanceId), home.instances.map((i) => i.instanceId), 'every section, in order')
  // COPYING PAGE 1 NEVER REFUSES A SECTION: every design the copy holds may sit on index.hbs, which is what `read.ts`
  // asks of a stored `index` doc on the next load
  for (const i of two.instances) assert.ok(compilesTo(pilot(i.designId).compileTarget, 'index.hbs'), i.designId)
  // an archive's page 2 is its own page 1, on its own file
  for (const key of ['tag', 'author'] as const) {
    const one = doc(synthesize(CANVASES[key].file, held).instances)
    assert.deepEqual(pageTwoStack(CANVASES[key].file, one, null, held).instances, one.instances, key)
  }
})

test("R-127's fallback on the owner's own project: a designed Home with no main feed gives page 2 the default stack", () => {
  // "Pilot sections" as `seed-editor-project.mjs` writes it — three instances, none carrying `isMainFeed`
  const home = doc(synthesize('home.hbs', held).instances.map((i) => ({ ...i, isMainFeed: false })))
  assert.ok(home.instances.length > 0 && !home.instances.some((i) => i.isMainFeed))
  assert.deepEqual(pageTwoStack('home.hbs', home, null, held), synthesize('index.hbs', held))
  // and with one designated, page 2 is the whole of page 1 (R-179), no longer the feed down (R-127)
  const withFeed = doc(home.instances.map((i, n) => ({ ...i, isMainFeed: n === home.instances.length - 1 })))
  assert.deepEqual(pageTwoStack('home.hbs', withFeed, null, held).instances, withFeed.instances)
})
