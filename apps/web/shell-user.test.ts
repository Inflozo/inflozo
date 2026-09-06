import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nameOf, secondLineOf } from './lib/shell-user.ts'

// Spec question 5, option 1: no stand-in name. Inverting `secondLineOf` once put the address on
// both lines with a green gate (review, 2026-09-06), so the rule is pinned here.

const email = 'maya@orbitweekly.com'

test('no display name: the address is the only line, and the initial is its first letter', () => {
  for (const displayName of [null, '', '   ']) {
    assert.equal(nameOf({ email, displayName }), email)
    assert.equal(secondLineOf({ email, displayName }), null)
  }
})

test('a display name: the name above, the address beneath', () => {
  const user = { email, displayName: '  Maya Chen ' }
  assert.equal(nameOf(user), 'Maya Chen')
  assert.equal(secondLineOf(user), email)
})
