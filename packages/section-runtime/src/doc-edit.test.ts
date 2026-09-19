import { test } from 'node:test'
import assert from 'node:assert/strict'
import { UNIVERSALS } from '@inflozo/library'
import type { ControlEntry } from './controls.ts'
import {
  clearDarkOverrides, darkOverrideCount, duplicateSection, insertSection, isDesigned, moveSection, removeSection,
  renameSection, setHidden, setMemberVisibility,
} from './doc-edit.ts'
import { parseDoc, type DocInstance, type ProjectDoc } from './doc-schema.ts'

// Story 5.4 — every section operation and every refusal, over docs parsed through AD-27's own schema, so the defaults
// the schema fills in are the values these functions actually see.

const instance = (instanceId: string, designId = 'a17/1', layerName = instanceId): unknown => ({
  instanceId, layerName, designId, content: {}, controls: {}, data: {}, darkOverrides: {},
})
const doc = (...instances: unknown[]): ProjectDoc => parseDoc({ schemaVersion: 1, instances }, 'home')
const names = (d: ProjectDoc) => d.instances.map((i) => i.instanceId).join(' ')
const ok = <T,>(r: T | string): T => {
  assert.notEqual(typeof r, 'string', typeof r === 'string' ? r : '')
  return r as T
}

const home = () => doc(instance('hero', 'a4/13'), instance('grid', 'a17/1'), instance('news', 'a22/1'))

test('the schema fills both new fields in, so every operation sees a total value', () => {
  const [first] = home().instances as [DocInstance]
  assert.equal(first.hidden, false)
  assert.equal(first.memberVisibility, 'everyone')
})

test('moveSection: the order changes and the move is announced in moveItem\'s words', () => {
  const up = ok(moveSection(home(), 'news', 0))
  assert.equal(names(up.doc), 'news hero grid')
  assert.equal(up.announce, 'Moved to position 1 of 3')
  const down = ok(moveSection(home(), 'hero', 2))
  assert.equal(names(down.doc), 'grid news hero')
  assert.equal(down.announce, 'Moved to position 3 of 3')
  // a move to where it already is is still a move, and still says so
  assert.equal(names(ok(moveSection(home(), 'grid', 1)).doc), 'hero grid news')
})

test('moveSection: a position off either end, a fractional one and an unknown section are refused', () => {
  for (const to of [-1, 3, 1.5, Number.NaN]) assert.equal(typeof moveSection(home(), 'hero', to), 'string', `${to}`)
  assert.match(String(moveSection(home(), 'nope', 0)), /no section nope/)
  // nothing is mutated by a refusal
  const d = home()
  moveSection(d, 'hero', 9)
  assert.equal(names(d), 'hero grid news')
})

test('moveSection leaves the original doc alone', () => {
  const before = home()
  const after = ok(moveSection(before, 'news', 0)).doc
  assert.equal(names(before), 'hero grid news')
  assert.notEqual(before.instances, after.instances)
})

test('duplicateSection: a new instanceId, the same name and values, landing directly after its original', () => {
  const from = setHidden(home(), 'grid', true)
  const d = ok(duplicateSection(ok(from) as ProjectDoc, 'grid', 'grid-2'))
  assert.equal(names(d), 'hero grid grid-2 news')
  const [copy] = d.instances.filter((i) => i.instanceId === 'grid-2')
  assert.equal(copy?.layerName, 'grid')
  assert.equal(copy?.designId, 'a17/1')
  assert.equal(copy?.hidden, true, 'the copy carries the original\'s stored values, hidden included')
  // the doc still parses: a copy is an ordinary instance, and its id is unique
  assert.deepEqual(parseDoc(d, 'home'), d)
})

test('duplicateSection: an id already in use, a blank id and an unknown section are refused', () => {
  assert.match(String(duplicateSection(home(), 'grid', 'hero')), /already holds a section hero/)
  assert.match(String(duplicateSection(home(), 'grid', '  ')), /needs an id of its own/)
  assert.match(String(duplicateSection(home(), 'nope', 'x')), /no section nope/)
})

test('duplicateSection: a second Post Content is refused with R-37\'s sentence, and nothing is placed', () => {
  const post = doc(instance('header', 'a24/1'), instance('body', 'a25/1'))
  assert.equal(duplicateSection(post, 'body', 'body-2'), 'this layout already prints the article')
  assert.equal(names(post), 'header body')
  // and an ordinary section on the same template duplicates as usual
  assert.equal(names(ok(duplicateSection(post, 'header', 'header-2'))), 'header header-2 body')
})

test('removeSection: the row goes, and an unknown one is refused', () => {
  assert.equal(names(ok(removeSection(home(), 'grid'))), 'hero news')
  assert.match(String(removeSection(home(), 'nope')), /no section nope/)
})

test('isDesigned: hiding every section leaves the template designed; removing them all does not', () => {
  let d = home()
  for (const id of ['hero', 'grid', 'news']) d = ok(setHidden(d, id, true))
  assert.equal(d.instances.every((i) => i.hidden), true)
  assert.equal(isDesigned(d), true, 'all hidden is still designed (AD-22)')
  for (const id of ['hero', 'grid', 'news']) d = ok(removeSection(d, id))
  assert.equal(isDesigned(d), false)
  assert.equal(d.instances.length, 0)
})

test('renameSection: the name is trimmed, and an empty or blank one is refused', () => {
  assert.equal(ok(renameSection(home(), 'hero', '  Top of the page  ')).instances[0]?.layerName, 'Top of the page')
  for (const name of ['', '   ', '\n\t']) {
    assert.equal(renameSection(home(), 'hero', name), 'Give this section a name.', JSON.stringify(name))
  }
  assert.match(String(renameSection(home(), 'nope', 'x')), /no section nope/)
})

test('setHidden: retained, never removed, and off again', () => {
  const hidden = ok(setHidden(home(), 'grid', true))
  assert.equal(hidden.instances.length, 3, 'the instance is still in the doc')
  assert.equal(hidden.instances[1]?.hidden, true)
  assert.equal(ok(setHidden(hidden, 'grid', false)).instances[1]?.hidden, false)
  assert.equal(hidden.instances[0]?.hidden, false, 'only the named instance changed')
})

test('setMemberVisibility: each of the four states, and the stored doc still parses', () => {
  for (const state of ['everyone', 'anonymous', 'free', 'paid'] as const) {
    const d = ok(setMemberVisibility(home(), 'news', state))
    assert.equal(d.instances[2]?.memberVisibility, state)
    assert.deepEqual(parseDoc(d, 'home'), d)
  }
  assert.match(String(setMemberVisibility(home(), 'nope', 'paid')), /no section nope/)
})

// ─── Story 5.6 — R-133's per-section clear, and D6a's derived count ──────────────────────────────────────────────
//
// NOTHING BELOW NAMES A CONTROL OR WRITES A COUNT (standing rule 4): the mode-scoped control and the value used are
// read out of `UNIVERSALS` — the real library — so the day a second one is declared these rows follow it.

const SCOPED = UNIVERSALS.filter((u) => u.darkOverride === true)
const universal = () => {
  assert.ok(SCOPED.length > 0, 'no universal declares `darkOverride`, so there is no mode-scoped control to be about')
  return SCOPED[0] as (typeof UNIVERSALS)[number]
}
/** A design that offers every value its mode-scoped universal has — enough for the engine to call an override usable. */
const design = (): ControlEntry => ({ controlSchema: [], contentSchema: {}, html: '' })
/** An instance carrying one usable override under that universal's name. */
const withOverride = (instanceId: string): unknown => ({
  ...(instance(instanceId) as Record<string, unknown>),
  darkOverrides: { [universal().name]: universal().values[universal().values.length - 1] },
})

test('clearDarkOverrides: that instance\'s map is emptied and every other byte of the doc is identical', () => {
  const before = doc(withOverride('hero'), withOverride('grid'), instance('news'))
  const after = ok(clearDarkOverrides(before, 'hero'))
  assert.deepEqual(after.instances[0]?.darkOverrides, {})
  assert.deepEqual(after.instances[1], before.instances[1], 'the other overridden section is untouched')
  assert.deepEqual(after.instances[2], before.instances[2])
  assert.deepEqual({ ...after.instances[0], darkOverrides: before.instances[0]?.darkOverrides }, before.instances[0], 'nothing else on the instance changed')
  assert.notEqual(before.instances[0]?.darkOverrides[universal().name], undefined, 'the original doc is not mutated')
  assert.deepEqual(parseDoc(after, 'home'), after, 'and the result still parses through AD-27\'s one schema')
  assert.match(String(clearDarkOverrides(before, 'nope')), /no section nope/)
})

test('clearDarkOverrides on a section with nothing stored is a no-op that still answers a doc', () => {
  const before = doc(instance('hero'))
  assert.deepEqual(ok(clearDarkOverrides(before, 'hero')), before)
})

test('darkOverrideCount: one per SECTION carrying a usable override, across every doc, derived and never stored', () => {
  const site = doc(withOverride('header'))
  const home = doc(withOverride('hero'), instance('grid'), withOverride('news'))
  assert.equal(darkOverrideCount([site, home], design), 3)
  assert.equal(darkOverrideCount([doc(instance('a'), instance('b'))], design), 0)
  assert.equal(darkOverrideCount([], design), 0)
  // a section carrying two overrides is still ONE section (D6a counts sections, not settings)
  const two = doc({ ...(instance('hero') as Record<string, unknown>), darkOverrides: Object.fromEntries(SCOPED.map((u) => [u.name, u.values[0]])) })
  assert.equal(darkOverrideCount([two], design), SCOPED.length > 0 ? 1 : 0)
  // a design the library cannot hold has no declaration to read, so nothing of its overrides could be used
  assert.equal(darkOverrideCount([home], () => undefined), 0)
  // …and neither could an override under a name the design narrows away (`darkOverridesInForce` is the one definition)
  const narrowed: ControlEntry = { ...design(), universals: { [universal().name]: { values: [], reason: 'not offered here' } } }
  assert.equal(darkOverrideCount([home], () => narrowed), 0)
  // and the clear closes it: after clearing both, the count is 0
  let cleared = home
  for (const id of ['hero', 'news']) cleared = ok(clearDarkOverrides(cleared, id))
  assert.equal(darkOverrideCount([cleared], design), 0)
})

/* ─── Story 5.10 — `insertSection`, the Section Picker's one placement ──────────────────────────────────────────
   Shaped exactly as `duplicateSection` is (pure, caller-supplied id, the same `placementRefusal`), so the matrix's
   Place, Second Post Content and empty-canvas rows are asserted here rather than in a browser. */

const fresh = (id: string, designId = 'a4/1'): DocInstance => parseDoc({ schemaVersion: 1, instances: [instance(id, designId)] }, 'home').instances[0] as DocInstance

test('insertSection: the section lands at the position it was invoked at, and nothing else moves', () => {
  assert.equal(names(ok(insertSection(home(), 0, fresh('new')))), 'new hero grid news')
  assert.equal(names(ok(insertSection(home(), 1, fresh('new')))), 'hero new grid news')
  assert.equal(names(ok(insertSection(home(), 3, fresh('new')))), 'hero grid news new')
  // an empty canvas has one position, and it is 0 — the first section of a template with no row yet
  assert.equal(names(ok(insertSection(doc(), 0, fresh('new')))), 'new')
  // and every other byte of the instance is the caller's, untouched
  const placed = ok(insertSection(home(), 1, fresh('new'))).instances[1] as DocInstance
  assert.equal(placed.designId, 'a4/1')
  assert.equal(placed.hidden, false)
  assert.equal(placed.memberVisibility, 'everyone')
})

test('insertSection: a position off either end is CLAMPED, never refused — a gap is a place on screen', () => {
  assert.equal(names(ok(insertSection(home(), -4, fresh('new')))), 'new hero grid news')
  assert.equal(names(ok(insertSection(home(), 99, fresh('new')))), 'hero grid news new')
  assert.equal(names(ok(insertSection(home(), Number.NaN, fresh('new')))), 'hero grid news new')
})

test('insertSection: an id that is blank or already on the template is refused, and nothing is written', () => {
  const was = home()
  assert.match(insertSection(was, 0, fresh(' ')) as string, /needs an id of its own/)
  assert.match(insertSection(was, 0, fresh('grid')) as string, /already holds a section grid/)
  assert.equal(names(was), 'hero grid news', 'the doc handed in is never mutated')
})

test('insertSection: R-37\'s second Post Content is refused with the sentence the picker shows (DW-190)', () => {
  const article = doc(instance('body', 'a25/1'))
  assert.equal(insertSection(article, 1, fresh('second', 'a25/7')), 'this layout already prints the article')
  // the FIRST one is allowed, and an ordinary design beside it is unaffected
  assert.equal(names(ok(insertSection(doc(instance('head', 'a24/1')), 1, fresh('body', 'a25/1')))), 'head body')
  assert.equal(names(ok(insertSection(article, 1, fresh('news', 'a22/1')))), 'body news')
})
