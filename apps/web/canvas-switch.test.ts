import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  indexStack, isDesigned, isSynthesizable, removeSection, setHidden, synthesize, SYNTHESIS_DEFAULTS,
  type ProjectDoc, type SynthesisLibrary,
} from '@inflozo/section-runtime'
import { CANVASES, canvasesOf, isMembership, templateKeyOf, type CanvasKey } from './lib/editor.ts'
import { pilot, pilotIds } from './lib/pilots.ts'

/* Story 5.5 — the doc rules that are NOT gestures: AD-22's round trip, FR-D5's "hiding is not emptying", and the
   template count that stopped being "every canvas". The gestures themselves are `run-verify-editor.cjs`'s.
 *
 * THIS IS WHERE SYNTHESIS MEETS THE REAL LIBRARY. `packages/section-runtime/src/synthesize.test.ts` proves the
 * function over a library it builds, because AD-1 bans `node:fs` in a core package; here `lib/pilots.ts` reads
 * `packages/library/designs/` — the directory IS the design list — so the present and the dropped rows are derived
 * from what the library actually holds and these assertions follow Epics 9 and 10 without an edit. */

/** The library as the app hands it to synthesis: `read.ts`'s own lookup, answering `undefined` rather than throwing. */
const held: SynthesisLibrary = (designId) => {
  try {
    return pilot(designId)
  } catch {
    return undefined
  }
}

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

test('every canvas the project offers is either synthesizable or opens empty — and the never-synthesized set is R-129\'s three plus Private', () => {
  const never = canvasesOf(true).filter((key) => !isSynthesizable(CANVASES[key].file))
  assert.deepEqual(never.sort(), ['custom-member-home', 'custom-signin', 'custom-signup', 'private'])
  for (const key of never) {
    assert.ok(isMembership(key) || key === 'private', key)
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
    const want = rows.filter((r) => held(r.designId)?.compileTarget.includes(file) === true)
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

/** `editor.tsx`'s `commit`, as its one rule: EVERY write to a canvas makes it the user's — unless it left the doc with
 *  no instances at all and the canvas can be synthesized, which gives it back. Note what it is NOT: a test of the doc
 *  alone. An untouched canvas opens on its default stack, so its doc is full while it is still untouched — which is
 *  exactly why `editor.tsx` holds an explicit `auto` set instead of deriving the marker from the instances. */
const autoAfter = (key: CanvasKey, next: ProjectDoc) => isSynthesizable(CANVASES[key].file) && !isDesigned(next)

test('the first edit MATERIALISES: the doc is the user\'s and the markers go', () => {
  const { docs, auto } = opened()
  const key: CanvasKey = 'tag'
  const before = docs[templateKeyOf(key)] as ProjectDoc
  assert.ok(before.instances.length > 0, 'the tag canvas must have a stack for this to be about anything')
  assert.ok(auto.has(key), 'it starts untouched — the marker is the server\'s word, not the doc\'s shape')
  // any edit at all — a rename is the owner's own step 8
  const renamed = { ...before, instances: before.instances.map((i, n) => (n === 0 ? { ...i, layerName: 'My tag feed' } : i)) }
  assert.ok(isDesigned(renamed))
  assert.ok(!autoAfter(key, renamed), 'the canvas is now the user\'s')
})

test('EMPTYING returns it to untouched, and the default stack comes back with both markers (AD-22)', () => {
  const { docs } = opened()
  const key: CanvasKey = 'tag'
  let live = docs[templateKeyOf(key)] as ProjectDoc
  for (const id of live.instances.map((i) => i.instanceId)) {
    const next = removeSection(live, id)
    assert.notEqual(typeof next, 'string', String(next))
    live = next as ProjectDoc
  }
  assert.deepEqual(live.instances, [])
  assert.ok(autoAfter(key, live), 'the last section off makes it untouched again')
  // and what re-renders is the SAME stack it opened on — synthesis is pure, so it is the same doc byte for byte
  assert.deepEqual(synthesize(CANVASES[key].file, held).instances, (docs[templateKeyOf(key)] as ProjectDoc).instances)
})

test('HIDING every section is not emptying: still designed, nothing re-synthesizes (FR-D5)', () => {
  const { docs } = opened()
  const key: CanvasKey = 'tag'
  let live = docs[templateKeyOf(key)] as ProjectDoc
  for (const id of live.instances.map((i) => i.instanceId)) {
    const next = setHidden(live, id, true)
    assert.notEqual(typeof next, 'string', String(next))
    live = next as ProjectDoc
  }
  assert.ok(live.instances.every((i) => i.hidden), 'every row is hidden')
  assert.ok(isDesigned(live), 'a hidden instance is RETAINED, so the canvas is still designed')
  assert.ok(!autoAfter(key, live), 'no marker comes back')
})

// ─── the template count, and R-127 on the owner's own project ───

/** `editor.tsx`'s `templatesOpen`, as its own rule: the canvases that will actually ship. */
const templatesOpen = (canvases: readonly CanvasKey[], docs: Readonly<Record<string, ProjectDoc>>, auto: ReadonlySet<CanvasKey>) =>
  canvases.filter((key) => auto.has(key) || isDesigned(docs[templateKeyOf(key)] ?? EMPTY)).length

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
  // nothing in this change is allowed to be a written-down number: every count above came out of `canvasesOf`
  assert.equal(canvases.length, Object.keys(CANVASES).length - 1, 'Private is the one conditional canvas')
})

test('R-127 on the owner\'s own project: a designed Home with no main feed gives page 2 the default stack', () => {
  // "Pilot sections" as `seed-editor-project.mjs` writes it — three instances, none carrying `isMainFeed`
  const home = doc(synthesize('home.hbs', held).instances.map((i) => ({ ...i, isMainFeed: false })))
  assert.ok(home.instances.length > 0 && !home.instances.some((i) => i.isMainFeed))
  assert.deepEqual(indexStack(home, held), synthesize('index.hbs', held))
  // and with one designated, page 2 is that doc from the feed down
  const withFeed = doc(home.instances.map((i, n) => ({ ...i, isMainFeed: n === home.instances.length - 1 })))
  assert.deepEqual(indexStack(withFeed, held).instances, withFeed.instances.slice(-1))
})
