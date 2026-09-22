import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compilesTo } from '@inflozo/library'
import { isSynthesizable, pageTwoStack, synthesize, SYNTHESIS_DEFAULTS, type SynthesisLibrary } from './synthesize.ts'
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
  (SYNTHESIS_DEFAULTS[file] ?? []).filter((r) => { const e = library(r.designId); return e !== undefined && compilesTo(e.compileTarget, file) })

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

// ─── Story 5.16 — what page 2 is made of (R-178, R-179; R-127's fallback kept) ───

const doc = (...instances: unknown[]): ProjectDoc => parseDoc({ schemaVersion: 1, instances }, 'home')
const inst = (instanceId: string, designId: string, extra: object = {}): unknown => ({
  instanceId, layerName: instanceId, designId, content: {}, controls: {}, data: {}, darkOverrides: {}, ...extra,
})

/** Page 1 as the owner's Ghost 5 Project holds it: a newsletter band ABOVE a designated grid, with a CTA below. */
const pageOne = () => doc(inst('band', 'a22/1'), inst('grid', 'a17/1', { isMainFeed: true }), inst('cta', 'a4/13'))
const PAGINATED = ['home.hbs', 'tag.hbs', 'author.hbs']

test('R-179 · with no doc of its own, page 2 is an EXACT copy of page 1 — every section, in order, the same objects', () => {
  for (const file of PAGINATED) {
    const one = pageOne()
    for (const two of [null, undefined, doc()]) {
      const { instances, dropped } = pageTwoStack(file, one, two, FULL)
      // the same OBJECTS, ids and all: a selection carries to the same section, and nothing is re-derived from a recipe
      assert.equal(instances.length, one.instances.length, file)
      instances.forEach((i, n) => assert.equal(i, one.instances[n], `${file} row ${n}`))
      assert.deepEqual(dropped, [], 'nothing is synthesized, so nothing can drop')
    }
    // and it is a COPY of the list, not the list: page 2's array is never page 1's
    assert.notEqual(pageTwoStack(file, one, null, FULL).instances, one.instances)
  }
  // the band ABOVE the grid is included (R-179 replaced R-127's "from the main feed down")
  assert.deepEqual(pageTwoStack('home.hbs', pageOne(), null, FULL).instances.map((i) => i.instanceId), ['band', 'grid', 'cta'])
})

test('R-178 · once page 2 has a doc with instances it is page 2 — page 1 is not read at all', () => {
  const two = doc(inst('grid', 'a17/1', { isMainFeed: true, controls: { 'per-row': 'two' } }))
  for (const file of PAGINATED) {
    const { instances, dropped } = pageTwoStack(file, pageOne(), two, FULL)
    assert.deepEqual(instances, two.instances, file)
    assert.deepEqual(dropped, [])
    // whatever page 1 holds — even nothing, even no main feed — page 2's own design stands
    assert.deepEqual(pageTwoStack(file, doc(inst('hero', 'a4/13')), two, EMPTY).instances, two.instances, file)
  }
})

test('AD-22 · a page-2 doc with no instances FOLLOWS page 1, exactly as having no doc does', () => {
  for (const file of PAGINATED) assert.deepEqual(pageTwoStack(file, pageOne(), doc(), FULL), pageTwoStack(file, pageOne(), null, FULL), file)
})

test("R-127's fallback, kept: a Home with NO main feed gives page 2 the Synthesis Default stack — and only Home does", () => {
  // the owner's "Pilot sections" project: three designed sections, none carrying isMainFeed
  const landing = doc(inst('hero', 'a4/13'), inst('grid', 'a17/1'), inst('news', 'a22/1'))
  assert.ok(!landing.instances.some((i) => i.isMainFeed), 'the fixture must exercise the fallback')
  assert.deepEqual(pageTwoStack('home.hbs', landing, null, FULL), synthesize('index.hbs', FULL))
  // `/page/2/` of a landing page still lists posts: the fallback IS the feed
  assert.ok(pageTwoStack('home.hbs', landing, null, FULL).instances.some((i) => i.isMainFeed))
  // an archive has no second FILE, so it has no fallback to take: its page 2 is its page 1, main feed or not
  for (const file of ['tag.hbs', 'author.hbs']) assert.deepEqual(pageTwoStack(file, landing, null, FULL).instances, landing.instances, file)
})

test('an UNTOUCHED page 1 is its Synthesis Default stack, so that is what page 2 copies (:804-806 on Home)', () => {
  for (const one of [null, undefined, doc()]) {
    assert.deepEqual(pageTwoStack('home.hbs', one, null, FULL), synthesize('index.hbs', FULL), String(one))
    // the root and its continuation never disagree about what the feed is
    assert.deepEqual(pageTwoStack('home.hbs', one, null, FULL).instances.map((i) => i.designId), synthesize('home.hbs', FULL).instances.map((i) => i.designId))
    for (const file of ['tag.hbs', 'author.hbs']) assert.deepEqual(pageTwoStack(file, one, null, FULL), synthesize(file, FULL), `${file} ${String(one)}`)
  }
})

test('the fallback degrades with the library and never throws; a copy needs no library at all', () => {
  assert.deepEqual(pageTwoStack('home.hbs', doc(), null, EMPTY).instances, [])
  assert.deepEqual(pageTwoStack('home.hbs', doc(), null, EMPTY).dropped, synthesize('index.hbs', EMPTY).dropped)
  for (const file of PAGINATED) assert.deepEqual(pageTwoStack(file, pageOne(), null, EMPTY).instances.map((i) => i.instanceId), ['band', 'grid', 'cta'], file)
})

test('`compilesTo` is the drop rule too: a Home design that does not list index.hbs is still placed on it (Story 5.16)', () => {
  // the feed narrowed to home.hbs alone — Ghost hands the two files the same posts, so index.hbs keeps it
  const narrowed = libraryOf(NAMED, { 'a17/1': ['home.hbs'] })
  assert.deepEqual(synthesize('index.hbs', narrowed).instances.map((i) => i.designId), synthesize('home.hbs', narrowed).instances.map((i) => i.designId))
  assert.deepEqual(synthesize('index.hbs', narrowed).dropped, [])
  // and the widening goes one way only: a design on index.hbs alone is still dropped from home.hbs
  assert.deepEqual(synthesize('home.hbs', libraryOf(NAMED, { 'a17/1': ['index.hbs'] })).dropped.map((d) => d.designId), ['a17/1'])
})
