import { test } from 'node:test'
import assert from 'node:assert/strict'
import { duplicateSection, isDesigned, moveSection, removeSection, renameSection, setHidden, setMemberVisibility } from './doc-edit.ts'
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
