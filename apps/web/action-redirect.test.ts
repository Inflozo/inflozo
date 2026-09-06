import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isRedirect } from './lib/action-redirect.ts'

// The shape Next actually throws, and every near miss. This predicate decides whether a ceremony
// says "that failed" or says nothing and lets a navigation land, so a false negative is a user
// being told their successful sign-in did not work.

test("Next's redirect digest is recognised", () => {
  assert.equal(isRedirect({ digest: 'NEXT_REDIRECT;push;/;307;' }), true)
  assert.equal(isRedirect({ digest: 'NEXT_REDIRECT' }), true)
})

test('anything else is a real failure', () => {
  assert.equal(isRedirect(new DOMException('no', 'NotAllowedError')), false)
  assert.equal(isRedirect({ digest: 'NEXT_NOT_FOUND' }), false)
  assert.equal(isRedirect({ digest: 42 }), false)
  assert.equal(isRedirect(null), false)
  assert.equal(isRedirect(undefined), false)
  assert.equal(isRedirect('NEXT_REDIRECT'), false)
  assert.equal(isRedirect({}), false)
})
