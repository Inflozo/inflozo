import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  isSignedOut,
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
