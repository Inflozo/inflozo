import { test } from 'node:test'
import assert from 'node:assert/strict'
import { name } from './index.ts'

test('the package names itself', () => {
  assert.equal(name, '@inflozo/ghost-shim')
})
