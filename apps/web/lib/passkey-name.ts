import { AAGUID_NAMES } from './passkey-aaguids.ts'

/**
 * FR-A2'S AUTO-NAME, and both halves are pure so `node --test` holds them.
 *
 * The name a passkey is born with is its AUTHENTICATOR's, and the authenticator states which it
 * is in the AAGUID it puts inside the attestation. Reading it needs no CBOR parser: the browser
 * hands the same bytes back separately from `AuthenticatorAttestationResponse.getAuthenticatorData()`,
 * and WebAuthn §6.1 fixes the layout —
 *
 *     rpIdHash 32 · flags 1 · signCount 4 · [ AT set: aaguid 16 · credentialIdLength 2 · … ]
 *
 * — so the AAGUID is the 16 bytes at offset 37, and only when the AT (attested credential data)
 * flag, bit 6 of the flags byte, is set. Everything else in the buffer is ignored and none of it
 * is stored: NOTHING OF OURS KEEPS AN AAGUID. It is read once, turned into a name, and the name
 * is written to Supabase's own `friendly_name` in the same action.
 */
const AAGUID_AT = 37
const AAGUID_LENGTH = 16
/** Bit 6 of the flags byte at offset 32 — "attested credential data included" (WebAuthn §6.1). */
const AT_FLAG = 0b0100_0000

export function aaguidFromAuthData(bytes: Uint8Array | null | undefined): string | null {
  // A browser without `getAuthenticatorData()` gives us nothing, and a truncated buffer is not
  // an error to raise at the user — both are simply "unnamed", which `nameFor` answers.
  if (!bytes || bytes.length < AAGUID_AT + AAGUID_LENGTH) return null
  if ((bytes[32] & AT_FLAG) === 0) return null

  const hex = [...bytes.slice(AAGUID_AT, AAGUID_AT + AAGUID_LENGTH)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  // 8-4-4-4-12, the one shape the transcribed list is keyed by.
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/**
 * The list's name, or `Passkey`. An authenticator that declines to identify itself reports the
 * all-zero AAGUID — which the list deliberately does not carry — and a new authenticator the
 * list has not caught up with reports one nothing matches; both are the same thing to a user,
 * and 2.2 is where a name can be changed.
 */
export function nameFor(aaguid: string | null | undefined): string {
  return (aaguid && AAGUID_NAMES[aaguid.toLowerCase()]) || 'Passkey'
}

/**
 * S12a's own second line: "added Aug 2, 2026", in mono. UTC and a fixed locale, as
 * `updatedLabel` is, so the server's render and the client's re-render after a registration
 * cannot disagree about the date.
 *
 * ponytail: server UTC; the viewer's zone if a late-evening registration ever reads a day early.
 */
export function addedLabel(createdAt: string | Date): string {
  const when = createdAt instanceof Date ? createdAt : new Date(createdAt)
  if (Number.isNaN(when.getTime())) return 'added recently'
  const formatted = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(when)
  return `added ${formatted}`
}
