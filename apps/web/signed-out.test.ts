import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  isSignedOut,
  isSignOutFailed,
  SIGN_OUT_FAILED,
  SIGN_OUT_FAILED_PATH,
  SIGN_OUT_FAILED_VALUE,
  SIGNED_OUT,
  SIGNED_OUT_PATH,
  SIGNED_OUT_VALUE,
} from './app/(app)/app/sign-in/signed-out.ts'

// The whole point: what `signOut` REDIRECTS TO is what the page READS as signed out. Both sides
// were literals, so `=true` on one of them lost the owner's sentence with every check green
// (review, 2026-09-06).
test('the path signOut redirects to is the one the page reads as signed out', () => {
  const url = new URL(SIGNED_OUT_PATH, 'https://app.inflozo.com')
  assert.equal(url.pathname, '/sign-in')
  assert.ok(isSignedOut(url.searchParams.get(SIGNED_OUT) ?? undefined))
})

test('nothing else reads as signed out', () => {
  assert.equal(isSignedOut(undefined), false)
  assert.equal(isSignedOut(''), false)
  assert.equal(isSignedOut('0'), false)
  assert.equal(isSignedOut('true'), false)
  // A repeated key arrives as an array, and an array is not the value.
  assert.equal(isSignedOut([SIGNED_OUT_VALUE, SIGNED_OUT_VALUE]), false)
})

// The other half of the same contract, and the same defect was available on it: the dashboard's
// red line is the owner's ruling at question 8, and a value changed on one side alone would take
// it away with every check green.
test('the path a FAILED sign-out redirects to is the one the dashboard reads', () => {
  const url = new URL(SIGN_OUT_FAILED_PATH, 'https://app.inflozo.com')
  // The DASHBOARD, not the sign-in page: a failed sign-out leaves the user signed in, and
  // `/sign-in` would only bounce them back.
  assert.equal(url.pathname, '/')
  assert.ok(isSignOutFailed(url.searchParams.get(SIGN_OUT_FAILED) ?? undefined))
})

test('nothing else reads as a failed sign-out', () => {
  assert.equal(isSignOutFailed(undefined), false)
  assert.equal(isSignOutFailed(''), false)
  assert.equal(isSignOutFailed('0'), false)
  assert.equal(isSignOutFailed([SIGN_OUT_FAILED_VALUE, SIGN_OUT_FAILED_VALUE]), false)
})

// The two hints are different keys, or one sign-out would read as the other.
test('the two sign-out hints never collide', () => {
  assert.notEqual(SIGNED_OUT, SIGN_OUT_FAILED)
  assert.equal(isSignedOut(new URL(SIGN_OUT_FAILED_PATH, 'https://x').searchParams.get(SIGNED_OUT) ?? undefined), false)
  assert.equal(isSignOutFailed(new URL(SIGNED_OUT_PATH, 'https://x').searchParams.get(SIGN_OUT_FAILED) ?? undefined), false)
})
