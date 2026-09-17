import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDoc, type DocInstance } from './doc-schema.ts'
import type { ControlState } from './controls.ts'

const instance = (): DocInstance => ({
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

test('a valid doc parses', () => {
  assert.deepEqual(parseDoc(doc(), 'home'), doc())
})

test('an unknown field fails, naming the instance', () => {
  assert.throws(() => parseDoc(doc({ hidden: true }), 'home'), /the home doc does not parse — instances\.0: .*hidden/)
  assert.throws(() => parseDoc({ ...doc(), extra: 1 }, 'site'), /the site doc .*\(root\): .*extra/)
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
