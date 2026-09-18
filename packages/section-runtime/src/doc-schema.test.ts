import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDoc, type DocInstance } from './doc-schema.ts'
import type { ControlState } from './controls.ts'

/** A STORED instance, as every doc that exists holds one: without Story 5.4's two defaulted fields, which is exactly
 *  what those defaults are for. `DocInstance` is the parsed shape and carries them. */
const instance = (): Omit<DocInstance, 'hidden' | 'memberVisibility'> => ({
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

test('a valid doc parses, with Story 5.4\'s two defaults filled in', () => {
  const d = doc()
  assert.deepEqual(parseDoc(d, 'home'), { ...d, instances: [{ ...d.instances[0], hidden: false, memberVisibility: 'everyone' }] })
})

test('an unknown field fails, naming the instance', () => {
  // `hidden` was this test's unknown field until Story 5.4 added it; the schema is still strict, so any other is
  assert.throws(() => parseDoc(doc({ parkedControls: {} }), 'home'), /the home doc does not parse — instances\.0: .*parkedControls/)
  assert.throws(() => parseDoc({ ...doc(), extra: 1 }, 'site'), /the site doc .*\(root\): .*extra/)
})

test('Story 5.4\'s two fields are defaulted, so every doc written before them still parses', () => {
  // the seeded docs, and every doc that exists, carry neither — a required field would throw for the whole editor
  const [filled] = parseDoc(doc(), 'home').instances
  assert.equal(filled?.hidden, false)
  assert.equal(filled?.memberVisibility, 'everyone')
  // and a stored value round-trips
  assert.equal(parseDoc(doc({ hidden: true, memberVisibility: 'paid' }), 'home').instances[0]?.memberVisibility, 'paid')
  assert.equal(parseDoc(doc({ hidden: true }), 'home').instances[0]?.hidden, true)
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
  for (const designId of ['A1/1', 'a1', 'a1/1/2', '../a1/1', 'a1/x']) {
    assert.throws(() => parseDoc(doc({ designId }), 'home'), /instances\.0\.designId/, designId)
  }
})
