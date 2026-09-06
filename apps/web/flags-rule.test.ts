import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bothOn, rowEnabled, settingEnabled } from './lib/flags-rule.ts'

// The four corners of the two-switch rule, plus the one that matters most: a read that did not
// answer at all. `bothOn` is where "fail closed" is actually decided — `flags.ts` catches the
// throw and hands `undefined` in, and a `??  true` or a truthy check anywhere in here would
// turn an unreachable GoTrue into a passkey button that cannot work.

test('off and off is off', () => assert.equal(bothOn(false, false), false))
test('ours on, Supabase off is off — the platform would refuse the ceremony', () =>
  assert.equal(bothOn(true, false), false))
test('ours off, Supabase on is off — the row is the kill switch', () =>
  assert.equal(bothOn(false, true), false))
test('both on is on', () => assert.equal(bothOn(true, true), true))

// The shapes the live project answered on 2026-09-06 — `GET /rest/v1/feature_flags?select=enabled
// &key=eq.passkeys` through `maybeSingle()`, and `GET /auth/v1/settings` — and their `true` twins.
test('the row maps by its field name, and a missing row is off', () => {
  assert.equal(rowEnabled({ enabled: false }), false)
  assert.equal(rowEnabled({ enabled: true }), true)
  assert.equal(rowEnabled(null), undefined)
  assert.equal(bothOn(rowEnabled({ enabled: true }), settingEnabled({ passkeys_enabled: true })), true)
})
test('the setting is GoTrue\'s "passkeys_enabled", not the Management API\'s "passkey_enabled"', () => {
  assert.equal(settingEnabled({ passkeys_enabled: false }), false)
  assert.equal(settingEnabled({ passkeys_enabled: true }), true)
  assert.equal(settingEnabled({ passkey_enabled: true }), undefined)
  assert.equal(settingEnabled({}), undefined)
})

test('a read that failed is off, in every shape it can fail in', () => {
  for (const missing of [undefined, null, 'true', 1, {}, NaN]) {
    assert.equal(bothOn(missing, true), false, `${String(missing)} as our row must be off`)
    assert.equal(bothOn(true, missing), false, `${String(missing)} as the setting must be off`)
  }
})
