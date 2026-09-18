import { test } from 'node:test'
import assert from 'node:assert/strict'
import { indexStack, isSynthesizable, synthesize, SYNTHESIS_DEFAULTS, type SynthesisLibrary } from './synthesize.ts'
import { parseDoc, type ProjectDoc } from './doc-schema.ts'

// Story 5.5 — FR-D6's synthesis, over the normative Synthesis Defaults (`sections-inventory.md:778-867`).
//
// NOTHING HERE IS LISTED. Every expectation is DERIVED — from the table for the stack rules, and from the library it is
// handed for the present and the dropped rows — so the day A25 to A31 are authored and A24's targets widen (DW-191) the
// assertions follow without an edit. AD-1 bans `node:fs` in a core package, so the library here is built in memory;
// `apps/web/canvas-switch.test.ts` runs the same derivation against the REAL `packages/library/designs/`.

/** Every design the table names, in table order, once. */
const NAMED = [...new Set(Object.values(SYNTHESIS_DEFAULTS).flatMap((rows) => rows.map((r) => r.designId)))]

/** A library that holds exactly `ids`, each compiling to exactly `targets` (default: every file it is asked for). */
const libraryOf = (ids: readonly string[], targets?: Readonly<Record<string, readonly string[]>>): SynthesisLibrary =>
  (designId) =>
    ids.includes(designId)
      ? { compileTarget: targets?.[designId] ?? Object.keys(SYNTHESIS_DEFAULTS), contentSchema: {} }
      : undefined

const FULL = libraryOf(NAMED)
const EMPTY = libraryOf([])

/** The rows of `file` the given library can place, derived — never a written list. */
const placeable = (file: string, library: SynthesisLibrary) =>
  (SYNTHESIS_DEFAULTS[file] ?? []).filter((r) => library(r.designId)?.compileTarget.includes(file) === true)

const COLLECTIONS = ['home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs']

test('the table is the seven synthesizable files, and nothing else is synthesizable', () => {
  // `sections-inventory.md:786` — the normative list. The only literal in this file, because it is the citation.
  assert.deepEqual(
    Object.keys(SYNTHESIS_DEFAULTS).sort(),
    ['author.hbs', 'error.hbs', 'home.hbs', 'index.hbs', 'page.hbs', 'post.hbs', 'tag.hbs'],
  )
  for (const file of Object.keys(SYNTHESIS_DEFAULTS)) assert.ok(isSynthesizable(file), file)
  // never synthesized (:785): the whole custom-template class — R-129's three membership canvases — plus private.hbs
  for (const file of ['custom-signup.hbs', 'custom-signin.hbs', 'custom-member-home.hbs', 'private.hbs', 'default.hbs']) {
    assert.ok(!isSynthesizable(file), file)
    assert.deepEqual(synthesize(file, FULL), { instances: [], dropped: [] }, file)
  }
})

test('home.hbs and index.hbs are the SAME stack — the root and its continuation never disagree (:804-806)', () => {
  assert.deepEqual(SYNTHESIS_DEFAULTS['home.hbs'], SYNTHESIS_DEFAULTS['index.hbs'])
  assert.deepEqual(
    synthesize('home.hbs', FULL).instances.map((i) => i.designId),
    synthesize('index.hbs', FULL).instances.map((i) => i.designId),
  )
})

test('exactly one main feed per collection template, and none anywhere else (:849-861)', () => {
  for (const [file, rows] of Object.entries(SYNTHESIS_DEFAULTS)) {
    const feeds = rows.filter((r) => r.isMainFeed === true)
    assert.equal(feeds.length, COLLECTIONS.includes(file) ? 1 : 0, file)
    // the designated one is the post-grid row, and it is the only row the table marks
    for (const f of feeds) assert.match(f.designId, /^a17\//, file)
  }
  for (const file of COLLECTIONS) {
    assert.equal(synthesize(file, FULL).instances.filter((i) => i.isMainFeed).length, 1, file)
  }
})

test('with a library that holds every named design, every row is placed in table order and nothing is dropped', () => {
  for (const [file, rows] of Object.entries(SYNTHESIS_DEFAULTS)) {
    const { instances, dropped } = synthesize(file, FULL)
    assert.deepEqual(dropped, [], file)
    assert.deepEqual(instances.map((i) => i.designId), rows.map((r) => r.designId), file)
    assert.deepEqual(instances.map((i) => i.layerName), rows.map((r) => r.layerName), file)
    // every control value the table names is written, and nothing else is
    for (const [n, row] of rows.entries()) assert.deepEqual(instances[n]?.controls, { ...row.controls }, `${file} row ${n}`)
    // ids are unique inside the doc, and derived — the same file synthesizes the same doc every time
    assert.equal(new Set(instances.map((i) => i.instanceId)).size, instances.length, file)
    assert.deepEqual(synthesize(file, FULL).instances, instances, `${file} is not deterministic`)
    // and the result IS a doc: AD-27's own schema parses it, strict at both levels
    const parsed: ProjectDoc = parseDoc({ schemaVersion: 1, instances }, file)
    assert.equal(parsed.instances.length, instances.length, file)
  }
})

test('a design the library does not hold is dropped with that reason, never thrown', () => {
  for (const missing of NAMED) {
    const library = libraryOf(NAMED.filter((id) => id !== missing))
    for (const [file, rows] of Object.entries(SYNTHESIS_DEFAULTS)) {
      const { instances, dropped } = synthesize(file, library)
      assert.deepEqual(instances.map((i) => i.designId), placeable(file, library).map((r) => r.designId), `${file} without ${missing}`)
      assert.deepEqual(dropped.map((d) => d.designId), rows.filter((r) => r.designId === missing).map((r) => r.designId), `${file} without ${missing}`)
      for (const d of dropped) assert.equal(d.reason, `the library holds no design ${missing}`)
    }
  }
})

test('a design the library holds for another file is dropped naming both targets (DW-191 is this shape)', () => {
  for (const narrowed of NAMED) {
    // it compiles to one file only — every OTHER file that asks for it must drop it
    const library = libraryOf(NAMED, { [narrowed]: ['post.hbs'] })
    for (const [file, rows] of Object.entries(SYNTHESIS_DEFAULTS)) {
      const { instances, dropped } = synthesize(file, library)
      assert.deepEqual(instances.map((i) => i.designId), placeable(file, library).map((r) => r.designId), `${file} · ${narrowed}`)
      const want = file === 'post.hbs' ? [] : rows.filter((r) => r.designId === narrowed).map((r) => r.designId)
      assert.deepEqual(dropped.map((d) => d.designId), want, `${file} · ${narrowed}`)
      for (const d of dropped) assert.equal(d.reason, `${narrowed} compiles to post.hbs, never ${file}`)
    }
  }
})

test('an empty library drops every row of every file and throws nothing — the canvas is still auto-generated', () => {
  for (const [file, rows] of Object.entries(SYNTHESIS_DEFAULTS)) {
    const { instances, dropped } = synthesize(file, EMPTY)
    assert.deepEqual(instances, [], file)
    assert.deepEqual(dropped.map((d) => d.designId), rows.map((r) => r.designId), file)
    // and it is still one of the seven: "auto-generated with nothing on it" is not "never auto-generated"
    assert.ok(isSynthesizable(file), file)
  }
})

// ─── R-127: what page 2 is made from ───

const doc = (...instances: unknown[]): ProjectDoc => parseDoc({ schemaVersion: 1, instances }, 'home')
const inst = (instanceId: string, designId: string, extra: object = {}): unknown => ({
  instanceId, layerName: instanceId, designId, content: {}, controls: {}, data: {}, darkOverrides: {}, ...extra,
})

test('R-127 · a designed Home WITH a main feed: index.hbs is that doc from the feed down, in order', () => {
  const home = doc(
    inst('banner', 'a4/13'),
    inst('welcome', 'a22/1'),
    inst('grid', 'a17/1', { isMainFeed: true }),
    inst('news', 'a22/1'),
    inst('cta', 'a4/13'),
  )
  const { instances, dropped } = indexStack(home, FULL)
  assert.deepEqual(instances.map((i) => i.instanceId), ['grid', 'news', 'cta'])
  assert.deepEqual(dropped, [], 'nothing is synthesized, so nothing can drop')
  // the kept rows are the SAME objects, values and all — page 2 is the Home page, not a copy of its recipe
  assert.deepEqual(instances, home.instances.slice(2))
})

test('R-127 · a designed Home with NO main feed falls back to the default stack — index.hbs is never empty (FR-I1)', () => {
  // the owner's "Pilot sections" project: three designed sections, no instance carries isMainFeed
  const home = doc(inst('hero', 'a4/13'), inst('grid', 'a17/1'), inst('news', 'a22/1'))
  assert.ok(!home.instances.some((i) => i.isMainFeed), 'the fixture must exercise the fallback')
  assert.deepEqual(indexStack(home, FULL), synthesize('index.hbs', FULL))
})

test('R-127 · an UNTOUCHED Home is unchanged: the same synthesized stack into both files (:804-806)', () => {
  for (const home of [null, undefined, doc()]) {
    assert.deepEqual(indexStack(home, FULL), synthesize('index.hbs', FULL), String(home))
    assert.deepEqual(indexStack(home, FULL).instances.map((i) => i.designId), synthesize('home.hbs', FULL).instances.map((i) => i.designId))
  }
})

test('R-127 · the fallback degrades with the library, and still never throws', () => {
  assert.deepEqual(indexStack(doc(), EMPTY).instances, [])
  assert.deepEqual(indexStack(doc(), EMPTY).dropped, synthesize('index.hbs', EMPTY).dropped)
  // a designed Home with a feed needs no library at all
  const home = doc(inst('grid', 'a17/1', { isMainFeed: true }))
  assert.deepEqual(indexStack(home, EMPTY).instances.map((i) => i.instanceId), ['grid'])
})
