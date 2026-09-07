import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  EMAIL_CHANGED,
  EMAIL_CHANGED_PATH,
  EMAIL_CHANGED_VALUE,
  EMAIL_STALE_PATH,
  EMAIL_STALE_VALUE,
  isEmailChanged,
  isEmailStale,
  LINK_LIFETIME_S,
  newEmailFor,
  pendingChange,
} from './app/(app)/app/(authed)/account/email-change-rule.ts'

const CURRENT = 'maya@orbitweekly.com'

test('an address that is not one is refused, and nothing is sent', () => {
  for (const raw of ['maya', '', '   ', 'maya@', null, undefined, 42]) {
    assert.deepEqual(newEmailFor(CURRENT, raw), { code: 'bad_email' }, `${JSON.stringify(raw)}`)
  }
})

// GoTrue would no-op on the address the account already has (`internal/api/user.go:135`), so the
// refusal is ours and the user hears a sentence instead of watching nothing happen.
test('the current address is refused in any case and with any spacing', () => {
  for (const raw of [CURRENT, CURRENT.toUpperCase(), `  ${CURRENT}  `, 'Maya@OrbitWeekly.com']) {
    assert.deepEqual(newEmailFor(CURRENT, raw), { code: 'same_email' }, raw)
  }
  // And against an account whose stored address is itself oddly cased.
  assert.deepEqual(newEmailFor('Maya@Orbitweekly.com', CURRENT), { code: 'same_email' })
})

test('a real new address passes, trimmed, and keeps the case that was typed', () => {
  assert.deepEqual(newEmailFor(CURRENT, '  maya+new@orbitweekly.com '), {
    email: 'maya+new@orbitweekly.com',
  })
  // Not lowercased by us: GoTrue normalises, and a second rule here could only disagree with it.
  assert.deepEqual(newEmailFor(CURRENT, 'Maya.New@Example.com'), { email: 'Maya.New@Example.com' })
})

// A user with no address at all (a shape `getUser()` allows) must still be able to set one.
test('an account with no address on it refuses only what is not an address', () => {
  assert.deepEqual(newEmailFor(undefined, CURRENT), { email: CURRENT })
  assert.deepEqual(newEmailFor(undefined, 'maya'), { code: 'bad_email' })
})

const SENT = '2026-09-07T10:00:00.000Z'
const sentAt = Date.parse(SENT)

test('a pending change is shown while its link is still good, and not after', () => {
  const user = { new_email: 'new@x.com', email_change_sent_at: SENT }
  assert.deepEqual(pendingChange(user, sentAt), { email: 'new@x.com' })
  assert.deepEqual(pendingChange(user, sentAt + LINK_LIFETIME_S * 1000 - 1), { email: 'new@x.com' })
  // On the second the link dies the banner goes: it promises "open it to finish", and a dead
  // link cannot deliver that.
  assert.equal(pendingChange(user, sentAt + LINK_LIFETIME_S * 1000), null)
  assert.equal(pendingChange(user, sentAt + LINK_LIFETIME_S * 1000 + 60_000), null)
})

test('nothing pending, and a shape we do not understand, both say nothing', () => {
  assert.equal(pendingChange({}, sentAt), null)
  assert.equal(pendingChange({ new_email: '', email_change_sent_at: SENT }, sentAt), null)
  assert.equal(pendingChange({ new_email: null, email_change_sent_at: SENT }, sentAt), null)
  // An address with no timestamp is not a pending change we can time-box, so it is not shown.
  assert.equal(pendingChange({ new_email: 'new@x.com' }, sentAt), null)
  assert.equal(pendingChange({ new_email: 'new@x.com', email_change_sent_at: 'nonsense' }, sentAt), null)
})

/**
 * THE ROUND TRIP, both halves: what the confirm route redirects to is what the account page reads
 * as "just changed". `signed-out.ts` shipped this exact defect — the key shared, the value a
 * literal on each side — and every check stayed green while the owner's sentence disappeared.
 */
test('the path the confirm route lands on is the one the account page reads', () => {
  const url = new URL(EMAIL_CHANGED_PATH, 'https://app.inflozo.com')
  // The PUBLIC path: `proxy.ts` rewrites `/` onto `/app`, so a browser destination carries no
  // `/app` prefix. `/app/account` here would 404 the user at the end of a successful change.
  assert.equal(url.pathname, '/account')
  assert.ok(isEmailChanged(url.searchParams.get(EMAIL_CHANGED) ?? undefined))
})

test('nothing else reads as a just-changed email', () => {
  assert.equal(isEmailChanged(undefined), false)
  assert.equal(isEmailChanged(''), false)
  assert.equal(isEmailChanged('1'), false)
  assert.equal(isEmailChanged('true'), false)
  assert.equal(isEmailChanged([EMAIL_CHANGED_VALUE, EMAIL_CHANGED_VALUE]), false)
})

/**
 * THE DEAD LINK'S ROUND TRIP (R-94, the owner on this story's review). One key carries both
 * sentences, so the two values must land on the same page and must NOT read as each other — a
 * stale link showing "Your email is now …" would be the worst sentence in the product.
 */
test('the path a dead link lands on is the one the account page reads as stale', () => {
  const url = new URL(EMAIL_STALE_PATH, 'https://app.inflozo.com')
  assert.equal(url.pathname, '/account')
  assert.ok(isEmailStale(url.searchParams.get(EMAIL_CHANGED) ?? undefined))
})

test('the two values on the one key never read as each other', () => {
  assert.notEqual(EMAIL_CHANGED_VALUE, EMAIL_STALE_VALUE)
  assert.equal(isEmailChanged(EMAIL_STALE_VALUE), false)
  assert.equal(isEmailStale(EMAIL_CHANGED_VALUE), false)
  assert.equal(isEmailStale(undefined), false)
  assert.equal(isEmailStale([EMAIL_STALE_VALUE, EMAIL_STALE_VALUE]), false)
  // And the card must strip the ONE key both ride on, or a reload repeats whichever it was.
  assert.equal(new URL(EMAIL_STALE_PATH, 'https://x').searchParams.has(EMAIL_CHANGED), true)
  assert.equal(new URL(EMAIL_CHANGED_PATH, 'https://x').searchParams.has(EMAIL_CHANGED), true)
})

/**
 * AND THE ROUTE MUST ACTUALLY BRANCH TO IT. `route.ts` is a route handler `node --test` cannot
 * import (it reaches for `next/server` and the request), so its source is read the way
 * `server-wiring.test.ts` reads the server client's: the stale landing is one `if` that a
 * tidying edit could delete, leaving a signed-in user on the dashboard with nothing said —
 * which is the exact defect R-94 exists to close.
 */
test('the confirm route lands a dead email-change link on the account page', () => {
  const route = readFileSync(new URL('./app/(app)/app/auth/confirm/route.ts', import.meta.url), 'utf8')
  assert.match(route, /EMAIL_STALE_PATH/, 'route.ts no longer knows where a dead email-change link lands')
  assert.match(
    route.replace(/\s+/g, ' '),
    /if \(type === 'email_change'\) \{ const \{ data \} = await supabase\.auth\.getUser\(\) if \(data\.user\) return/,
    'the dead-link branch must ask getUser() and land a signed-in browser on EMAIL_STALE_PATH',
  )
})

/**
 * THE LIFETIME IS DERIVED, NOT RESTATED (counts are derived, never restated). `LINK_LIFETIME_S` is a copy of the
 * live project's `mailer_otp_exp`, and the day someone changes that setting the banner would
 * silently outlive or underlive the link it describes. The source is read here.
 */
test('LINK_LIFETIME_S is the mailer_otp_exp configure-supabase-auth.py writes', () => {
  const tool = readFileSync(
    new URL('../../tools/probe/configure-supabase-auth.py', import.meta.url),
    'utf8',
  )
  const written = /'mailer_otp_exp':\s*(\d+)/.exec(tool)
  assert.ok(written, 'configure-supabase-auth.py no longer writes mailer_otp_exp')
  assert.equal(LINK_LIFETIME_S, Number(written[1]))
})

// And the emails say the same number in words: "good for 15 minutes" is written in each template
// by hand, and a changed `mailer_otp_exp` would leave every email lying about its own link
// (review, 2026-09-07). Both templates, because the sign-in one carries the same sentence.
test('every auth template names the minutes the link is actually good for', () => {
  const dir = new URL('../../supabase/auth/', import.meta.url)
  const templates = readdirSync(dir).filter((f) => f.endsWith('.html'))
  assert.ok(templates.length >= 2, `expected both templates under supabase/auth, got ${templates}`)
  for (const file of templates) {
    const minutes = [...readFileSync(new URL(file, dir), 'utf8').matchAll(/(\d+) minutes/g)].map((m) => Number(m[1]))
    assert.ok(minutes.length > 0, `${file} never says how long its link is good for`)
    for (const m of minutes) assert.equal(m, LINK_LIFETIME_S / 60, `${file} says ${m} minutes; the link is good for ${LINK_LIFETIME_S / 60}`)
  }
})

/**
 * `changeEmail` GUARDS ON THE SESSION ALONE. There is no feature flag for changing an email, and
 * the sibling actions' first line — `const user = await ready(); if (!user) return fail(…)` — is
 * the natural copy that would put FR-A4 behind the passkey kill switch with every check green:
 * `node --test` cannot import a `'use server'` file, and the harness runs with whatever the flag
 * row is at Deploy (review, 2026-09-07). So the action's source is read, `server-wiring.test.ts`'s
 * idiom, and the guard it calls is pinned.
 */
test('changeEmail is guarded by the session and never by the passkey switch', () => {
  const source = readFileSync(new URL('./app/(app)/app/(authed)/account/actions.ts', import.meta.url), 'utf8')
  const body = /export async function changeEmail\([\s\S]*?\n}\n/.exec(source)
  assert.ok(body, 'changeEmail was not found in actions.ts')
  assert.match(body[0], /await signedIn\(\)/, 'changeEmail must guard with signedIn()')
  assert.doesNotMatch(body[0], /ready\(\)|passkeysEnabled/, 'changeEmail must not be gated by the passkey switch')
})
