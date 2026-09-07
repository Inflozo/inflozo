import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  PASSKEY_NAME_HINT,
  PASSKEY_NAME_MAX,
  passkeyIdSchema,
  passkeyNameSchema,
} from './app/(app)/app/(authed)/account/passkey-name-rule.ts'

// The rename boundary. The dialog's field and `renamePasskey` are the same rule read twice, and
// the server never trusts the field — so what is worth pinning is that the rule itself matches
// the platform's ceiling and says one sentence for both ways of failing.

test('passkeyNameSchema: trimmed, 1 to PASSKEY_NAME_MAX, one sentence for both failures', () => {
  assert.equal(passkeyNameSchema.parse('  My MacBook  '), 'My MacBook')
  assert.equal(passkeyNameSchema.safeParse('').success, false)
  // The matrix's "empty or spaces": trimming happens BEFORE the length check, so spaces are empty.
  assert.equal(passkeyNameSchema.safeParse('   ').success, false)
  assert.equal(passkeyNameSchema.parse('a'.repeat(PASSKEY_NAME_MAX)), 'a'.repeat(PASSKEY_NAME_MAX))
  assert.equal(passkeyNameSchema.safeParse('a'.repeat(PASSKEY_NAME_MAX + 1)).success, false)
  // …and trimming before the check is also why 120 characters wrapped in spaces still saves.
  assert.equal(
    passkeyNameSchema.parse(` ${'a'.repeat(PASSKEY_NAME_MAX)} `),
    'a'.repeat(PASSKEY_NAME_MAX),
  )

  for (const bad of ['', '   ', 'a'.repeat(PASSKEY_NAME_MAX + 1)]) {
    const result = passkeyNameSchema.safeParse(bad)
    assert.equal(result.success, false)
    assert.equal(result.error?.issues[0]?.message, PASSKEY_NAME_HINT)
  }
})

test('the hint quotes the limit, and the limit is GoTrue\'s own 120', () => {
  assert.equal(PASSKEY_NAME_MAX, 120)
  assert.ok(PASSKEY_NAME_HINT.includes(String(PASSKEY_NAME_MAX)))
})

test('passkeyIdSchema: a UUID passes, and a hand-made path fragment never reaches the wire', () => {
  assert.equal(passkeyIdSchema.safeParse('2f1c4b8e-9d3a-4c6b-8e2f-1a5d7c9b3e01').success, true)
  for (const bad of ['', 'not-a-uuid', 'x/../../user', '2f1c4b8e-9d3a-4c6b-8e2f-1a5d7c9b3e01/x']) {
    assert.equal(passkeyIdSchema.safeParse(bad).success, false, `must refuse ${JSON.stringify(bad)}`)
  }
})
