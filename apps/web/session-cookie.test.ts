import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SESSION_MAX_AGE, sessionCookie } from './lib/supabase/cookies.ts'

// The library's own 400-day default is applied AFTER the caller's `cookieOptions` and wins
// (`@supabase/ssr` 0.12.6, dist/main/cookies.js:231) — executed, and it fails silently: the
// cookie simply comes back Max-Age=34560000. These are the three claims that replace it.

test('a session cookie lasts 30 days, whatever the library asked for', () => {
  assert.equal(SESSION_MAX_AGE, 30 * 24 * 60 * 60)
  assert.equal(sessionCookie({ maxAge: 34_560_000 }).maxAge, SESSION_MAX_AGE)
  assert.equal(sessionCookie({ maxAge: 1 }).maxAge, SESSION_MAX_AGE)
})

test('maxAge 0 is a DELETION and survives untouched — this is what Sign out is', () => {
  assert.equal(sessionCookie({ maxAge: 0 }).maxAge, 0)
  // absent is not zero: a cookie with no lifetime asked for is a session cookie, and stretching
  // it is right, while stretching a deletion would leave the user signed in after Sign out
  assert.equal(sessionCookie({}).maxAge, undefined)
})

test('the cookie is closed to script, and everything else the library set is kept', () => {
  const out = sessionCookie({ maxAge: 100, path: '/', sameSite: 'lax' })
  assert.equal(out.httpOnly, true) // there is no browser Supabase client to read it
  assert.equal(out.path, '/')
  assert.equal(out.sameSite, 'lax') // the magic link is a top-level navigation from an email
})
