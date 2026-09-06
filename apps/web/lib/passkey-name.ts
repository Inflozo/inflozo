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
export function nameFor(aaguid: unknown): string {
  // `unknown` because it crosses the action boundary from the browser: a hand-made POST must
  // not throw here after a registration GoTrue has already accepted (review, 2026-09-06).
  if (typeof aaguid !== 'string') return 'Passkey'
  // `Object.hasOwn` and NOT a bare index: the list is an object literal, so `'__proto__'` reached
  // `Object.prototype` and `'constructor'` reached the `Object` FUNCTION — both truthy, both
  // returned from a function typed `: string`, and both then sent to GoTrue as a `friendlyName`.
  // Executed, not reasoned (review, 2026-09-06). The declared `Record<string, string>` is exactly
  // what hides it from `tsc`.
  const key = aaguid.toLowerCase()
  return (Object.hasOwn(AAGUID_NAMES, key) && AAGUID_NAMES[key]) || 'Passkey'
}

/** One row of S12a's list, as the page and the card share it. */
export type PasskeyRow = { id: string; name: string; createdAt: string }

/**
 * `auth.passkey.list()`'s answer as rows. The library TYPES it as a bare array and that is a
 * claim about GoTrue's `GET /passkeys` that cannot be executed until Supabase's own switch is
 * on — this story's Deploy phase — so the envelope is accepted either way, an array or an object
 * carrying one, and a passkey without a `friendly_name` (a failed naming PATCH) still has a row
 * (standing rule 1). Under `node --test` in `passkey-name.test.ts`, so the day the real shape is
 * known there is a control to pin it with.
 */
export function passkeyRows(data: unknown): PasskeyRow[] {
  const list = Array.isArray(data)
    ? data
    : ((data as { passkeys?: unknown } | null)?.passkeys ?? [])
  if (!Array.isArray(list)) return []
  return list
    .filter((p): p is { id: string; friendly_name?: unknown; created_at?: unknown } =>
      typeof p?.id === 'string',
    )
    .map((p) => ({
      id: p.id,
      name: (typeof p.friendly_name === 'string' && p.friendly_name) || 'Passkey',
      createdAt: typeof p.created_at === 'string' ? p.created_at : '',
    }))
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
