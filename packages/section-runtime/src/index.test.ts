import { test } from 'node:test'
import assert from 'node:assert/strict'
import { name } from './index.ts'
// DW-1's proof: an import that CROSSES the package boundary. Until `packages/library` declared an
// `exports` map, the `workspace:*` arrow three packages already carried could not resolve, and
// every test in the repo asserted only its own package name.
import { BINDING_CONTEXTS, DIRECTIVES } from '@inflozo/library'

test('the package names itself', () => {
  assert.equal(name, '@inflozo/section-runtime')
})

test('the library resolves across the workspace boundary', () => {
  assert.ok(DIRECTIVES['data-bind'], 'the directive set is readable from another package')
  assert.ok(!(BINDING_CONTEXTS as readonly string[]).includes('page'))
})
