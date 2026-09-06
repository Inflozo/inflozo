import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AAGUID_NAMES } from './lib/passkey-aaguids.ts'
import { addedLabel, aaguidFromAuthData, nameFor } from './lib/passkey-name.ts'

// The auto-name is the only thing in this story with no server to ask, so it is the only thing
// a unit test can settle: a wrong offset gives every passkey the fallback name and nothing
// anywhere reports an error.

/** A synthetic authenticator data buffer: WebAuthn §6.1's fixed prefix, then the AAGUID. */
function authData(aaguid: string, { at = true } = {}): Uint8Array {
  const bytes = new Uint8Array(53)
  bytes[32] = at ? 0b0100_0101 : 0b0000_0101 // AT set (or not), UP and UV always
  const hex = aaguid.replace(/-/g, '')
  for (let i = 0; i < 16; i += 1) bytes[37 + i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

const ICLOUD = 'fbfc3007-154e-4ecc-8c0b-6e020557d7bd'

test('the AAGUID is the 16 bytes at offset 37, read as a UUID', () => {
  assert.equal(aaguidFromAuthData(authData(ICLOUD)), ICLOUD)
  // one byte earlier or later is a different AAGUID and would silently name everything "Passkey"
  const shifted = authData(ICLOUD)
  shifted.copyWithin(38, 37)
  assert.notEqual(aaguidFromAuthData(shifted), ICLOUD)
})

test('no attested credential data means no AAGUID, not the bytes that happen to be there', () => {
  assert.equal(aaguidFromAuthData(authData(ICLOUD, { at: false })), null)
})

test('a missing or truncated buffer is null, never a throw', () => {
  assert.equal(aaguidFromAuthData(null), null)
  assert.equal(aaguidFromAuthData(undefined), null)
  assert.equal(aaguidFromAuthData(new Uint8Array(52)), null)
})

test('a known AAGUID gets its name; anything else gets Passkey', () => {
  assert.equal(nameFor(ICLOUD), AAGUID_NAMES[ICLOUD])
  assert.equal(nameFor(ICLOUD.toUpperCase()), AAGUID_NAMES[ICLOUD])
  // the all-zero AAGUID is what a virtual authenticator and a shy one both report
  assert.equal(nameFor('00000000-0000-0000-0000-000000000000'), 'Passkey')
  assert.equal(nameFor(null), 'Passkey')
  assert.equal(nameFor(''), 'Passkey')
})

test('every key in the list is a lowercase UUID, and none is repeated', () => {
  const keys = Object.keys(AAGUID_NAMES)
  assert.ok(keys.length > 0, 'the transcribed list is empty')
  for (const key of keys) {
    assert.match(key, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, key)
  }
  assert.equal(new Set(keys).size, keys.length, 'a duplicate key silently loses one name')
  // an object literal cannot hold the all-zero AAGUID and the fallback both
  assert.equal(AAGUID_NAMES['00000000-0000-0000-0000-000000000000'], undefined)
})

test('the row’s second line is the frame’s own wording, in UTC', () => {
  assert.equal(addedLabel('2026-08-02T00:00:00Z'), 'added Aug 2, 2026')
  // the last instant of a UTC day still reads as that day, whatever the runner's zone is
  assert.equal(addedLabel('2026-09-06T23:59:59Z'), 'added Sep 6, 2026')
  assert.equal(addedLabel('not a date'), 'added recently')
})
