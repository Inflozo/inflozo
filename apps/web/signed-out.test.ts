import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  isSignedOut,
  isSignedOutEverywhere,
  isSignOutFailed,
  SIGN_OUT_FAILED,
  SIGN_OUT_FAILED_PATH,
  SIGN_OUT_FAILED_VALUE,
  SIGNED_OUT,
  SIGNED_OUT_EVERYWHERE_PATH,
  SIGNED_OUT_EVERYWHERE_VALUE,
  SIGNED_OUT_PATH,
  SIGNED_OUT_VALUE,
  signOutPathFor,
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

/**
 * WHICH PATH THE ACTION PICKS, which is the half every assertion above walked straight past: the
 * constants and the readers were pinned, so inverting `signOut`'s ternary swapped the owner's two
 * sentences with `tsc` and this whole file still green (review, 2026-09-06). Asserted through the
 * readers rather than against the constants, so a rename cannot make it vacuous.
 */
test('a failed sign-out lands on the dashboard, a successful one on the sign-in card', () => {
  const failed = new URL(signOutPathFor(true), 'https://app.inflozo.com')
  assert.equal(failed.pathname, '/')
  assert.ok(isSignOutFailed(failed.searchParams.get(SIGN_OUT_FAILED) ?? undefined))
  assert.equal(isSignedOut(failed.searchParams.get(SIGNED_OUT) ?? undefined), false)

  const ok = new URL(signOutPathFor(false), 'https://app.inflozo.com')
  assert.equal(ok.pathname, '/sign-in')
  assert.ok(isSignedOut(ok.searchParams.get(SIGNED_OUT) ?? undefined))
  assert.equal(isSignOutFailed(ok.searchParams.get(SIGN_OUT_FAILED) ?? undefined), false)
})

/* ─────────────────────────────────────────── Story 2.4: the same key's SECOND value.

   Sign out everywhere lands on the same card and says a different sentence, so the same defect
   is available on it a third time — a value changed on one side alone takes the sentence away
   with every check green. Walked as a real round trip, through the readers, for that reason. */

test('the path signOutEverywhere redirects to is the one the page reads as signed out everywhere', () => {
  const url = new URL(SIGNED_OUT_EVERYWHERE_PATH, 'https://app.inflozo.com')
  assert.equal(url.pathname, '/sign-in')
  assert.ok(isSignedOutEverywhere(url.searchParams.get(SIGNED_OUT) ?? undefined))
})

test('nothing else reads as signed out everywhere', () => {
  assert.equal(isSignedOutEverywhere(undefined), false)
  assert.equal(isSignedOutEverywhere(''), false)
  assert.equal(isSignedOutEverywhere('1'), false)
  assert.equal(isSignedOutEverywhere('true'), false)
  assert.equal(isSignedOutEverywhere([SIGNED_OUT_EVERYWHERE_VALUE, SIGNED_OUT_EVERYWHERE_VALUE]), false)
})

// THE TWO VALUES ON THE ONE KEY NEVER READ AS EACH OTHER. This is what a second key would have
// bought and what one key with two values has to prove instead: an ordinary sign-out must not
// say "on every device", and an everywhere sign-out must not say the ordinary sentence.
test('an ordinary sign-out and an everywhere sign-out never read as each other', () => {
  assert.notEqual(SIGNED_OUT_VALUE, SIGNED_OUT_EVERYWHERE_VALUE)
  const ordinary = new URL(SIGNED_OUT_PATH, 'https://x').searchParams.get(SIGNED_OUT) ?? undefined
  const everywhere = new URL(SIGNED_OUT_EVERYWHERE_PATH, 'https://x').searchParams.get(SIGNED_OUT) ?? undefined
  assert.ok(isSignedOut(ordinary))
  assert.equal(isSignedOutEverywhere(ordinary), false)
  assert.ok(isSignedOutEverywhere(everywhere))
  assert.equal(isSignedOut(everywhere), false)
  // And neither is the failed-sign-out hint, which is the other key.
  assert.equal(isSignOutFailed(new URL(SIGNED_OUT_EVERYWHERE_PATH, 'https://x').searchParams.get(SIGN_OUT_FAILED) ?? undefined), false)
})

/**
 * BOTH SCOPES, READ OUT OF THE ACTIONS THEMSELVES (`email-change-rule.test.ts`'s pattern).
 *
 * `auth-js` 2.115.0 defaults `signOut()` to `{ scope: 'global' }` (`GoTrueClient.js:3405`), which
 * is how the avatar menu's ordinary Sign out came to end every session everywhere — Story 2.4's
 * founding defect, and it was invisible: the option is optional, so dropping it again is green
 * under eslint, `tsc --noEmit`, `node --test` and `next build`, and it silently makes signing out
 * on the laptop throw the phone off too. Neither scope may be implicit, so neither is inferred
 * here — each is read out of the file that has to carry it.
 */
const scopeOf = (path: string, fn: string) => {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').replace(/\s+/g, ' ')
  const at = source.indexOf(`function ${fn}`)
  assert.ok(at >= 0, `${path}: ${fn} is gone`)
  return /auth\.signOut\(\s*\{[^}]*scope:\s*'(\w+)'/.exec(source.slice(at))?.[1] ?? null
}

test("the avatar menu's Sign out is explicitly this device only", () => {
  assert.equal(
    scopeOf('./app/(app)/app/sign-in/actions.ts', 'signOut'),
    'local',
    "signOut() must pass { scope: 'local' }: the library's default is 'global', so an option " +
      'dropped in a tidy-up signs every device out again — the defect Story 2.4 found.',
  )
})

test('Sign out everywhere is explicitly every device', () => {
  assert.equal(
    scopeOf('./app/(app)/app/(authed)/account/actions.ts', 'signOutEverywhere'),
    'global',
    "signOutEverywhere() must pass { scope: 'global' }: it is the whole action, and a scope " +
      'swapped with the ordinary one would leave every other device signed in.',
  )
})
