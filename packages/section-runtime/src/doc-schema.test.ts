import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDoc, type DocInstance } from './doc-schema.ts'
import type { ControlState } from './controls.ts'

/** A STORED instance, as every doc that exists holds one: without Story 5.4's two defaulted fields, Story 5.5's
 *  main-feed flag or Story 5.11's parked values, which is exactly what those defaults are for. `DocInstance` is the
 *  parsed shape and carries them. */
const instance = (): Omit<DocInstance, 'hidden' | 'memberVisibility' | 'isMainFeed' | 'parkedControls'> => ({
  instanceId: 'i1',
  layerName: 'Header — Rail',
  designId: 'a1/1',
  content: {},
  controls: {},
  data: {},
  darkOverrides: {},
})
const doc = (over: Record<string, unknown> = {}) => ({ schemaVersion: 1, instances: [{ ...instance(), ...over }] })

// compile-time: the stored instance IS a ControlState, so the canvas renders it without a mapping
const asState: ControlState = instance()
void asState

test('a valid doc parses, with every defaulted field filled in', () => {
  const d = doc()
  assert.deepEqual(parseDoc(d, 'home'), { ...d, instances: [{ ...d.instances[0], hidden: false, memberVisibility: 'everyone', isMainFeed: false, parkedControls: {} }] })
})

test('an unknown field fails, naming the instance', () => {
  // `hidden` was this test's unknown field until Story 5.4 added it and `parkedControls` until Story 5.11; the
  // schema is still strict, so any other is
  assert.throws(() => parseDoc(doc({ promotedBindings: {} }), 'home'), /the home doc does not parse — instances\.0: .*promotedBindings/)
  assert.throws(() => parseDoc({ ...doc(), extra: 1 }, 'site'), /the site doc .*\(root\): .*extra/)
})

test('every field a later story added is defaulted, so every doc written before it still parses', () => {
  // the seeded docs, and every doc that exists, carry none of them — a required field would throw for the whole editor
  const [filled] = parseDoc(doc(), 'home').instances
  assert.equal(filled?.hidden, false)
  assert.equal(filled?.memberVisibility, 'everyone')
  // Story 5.5: only `synthesize` writes it, and it designates one instance per collection template (FR-H2)
  assert.equal(filled?.isMainFeed, false)
  assert.equal(parseDoc(doc({ isMainFeed: true }), 'home').instances[0]?.isMainFeed, true)
  // and a stored value round-trips
  assert.equal(parseDoc(doc({ hidden: true, memberVisibility: 'paid' }), 'home').instances[0]?.memberVisibility, 'paid')
  assert.equal(parseDoc(doc({ hidden: true }), 'home').instances[0]?.hidden, true)
  // Story 5.11: FR-D19's parked values — defaulted, so every doc written before the ring existed still parses
  assert.deepEqual(filled?.parkedControls, {})
  const parked = { 'a1/1': { controls: { tint: 'strong' }, darkOverrides: { tint: 'soft' } } }
  assert.deepEqual(parseDoc(doc({ parkedControls: parked }), 'home').instances[0]?.parkedControls, parked)
  // and its shape is strict too: a record that is not { controls, darkOverrides } fails, naming its path
  assert.throws(() => parseDoc(doc({ parkedControls: { 'a1/1': { controls: {} } } }), 'home'), /instances\.0\.parkedControls/)
  assert.throws(() => parseDoc(doc({ parkedControls: { 'a1/1': { controls: {}, darkOverrides: {}, extra: 1 } } }), 'home'), /instances\.0\.parkedControls/)
})

test('a member state the runtime does not know fails, naming its path', () => {
  for (const memberVisibility of ['comped', 'Everyone', 'logged-out', '', 1]) {
    assert.throws(() => parseDoc(doc({ memberVisibility }), 'home'), /instances\.0\.memberVisibility/, String(memberVisibility))
  }
  assert.throws(() => parseDoc(doc({ hidden: 'yes' }), 'home'), /instances\.0\.hidden/)
})

test('a missing field fails, naming its path', () => {
  const { darkOverrides: _, ...rest } = instance()
  assert.throws(() => parseDoc({ schemaVersion: 1, instances: [rest] }, 'post'), /instances\.0\.darkOverrides/)
  assert.throws(() => parseDoc({ instances: [] }, 'post'), /schemaVersion/)
})

test('a duplicate instanceId fails, naming instances', () => {
  assert.throws(() => parseDoc({ schemaVersion: 1, instances: [instance(), instance()] }, 'home'), /instances: every instanceId is unique/)
})

test('a malformed designId fails, naming its path', () => {
  for (const designId of ['A1/1', 'a1', 'a1/1/2', '../a1/1', 'a1/x', '', '1/1', 'a 1/1']) {
    assert.throws(() => parseDoc(doc({ designId }), 'home'), /instances\.0\.designId/, designId)
  }
  // Story 5.11 — the CATEGORY half is `categoryOf`'s, not `a\\d+`: the ring's fixture category is `controls`, and a
  // shape check that disagreed with the library's would refuse a doc the library assembles (the keyboard harness)
  assert.equal(parseDoc(doc({ designId: 'controls/2' }), 'home').instances[0]?.designId, 'controls/2')
})
