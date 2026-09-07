import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  EMAIL_CHANGED,
  EMAIL_CHANGED_PATH,
  EMAIL_CHANGED_VALUE,
  isEmailChanged,
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
 * THE LIFETIME IS DERIVED, NOT RESTATED (standing rule 4). `LINK_LIFETIME_S` is a copy of the
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
