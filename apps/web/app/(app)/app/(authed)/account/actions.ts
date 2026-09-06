'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ServerCredentialCreationOptions, ServerCredentialResponse } from '../../sign-in/webauthn.ts'
import { passkeysEnabled } from '@/lib/flags'
import { nameFor } from '@/lib/passkey-name'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { NUDGE_DONE } from './nudge.ts'

/**
 * S12a'S PASSKEYS CARD, and the dashboard nudge that points at it — FR-A2's registration half.
 *
 * Registration happens ONLY from a signed-in session, which is the whole reason the magic link
 * comes first: `startRegistration` and `verifyRegistration` both read the session from the same
 * cookies every other action does, and `currentUser()` is the guard, as always.
 *
 * The browser's half is `navigator.credentials.create()` and two serialisers; everything here
 * is HTTP, and no key and no credential is ever logged.
 *
 * `revalidatePath` addresses the INTERNAL route tree — `/app/account` and `/app` — not the
 * public paths the browser sees (`routing.ts:25`, and the note in `signed-out.ts`).
 */

type Code = 'passkeys_off' | 'passkey_failed'

export type RegisterStart =
  | { ok: true; challengeId: string; options: ServerCredentialCreationOptions }
  | { error: { code: Code; message: string } }

export type ActionResult = { ok: true } | { error: { code: Code; message: string } }

/** S12's voice, one sentence each, in the card's helper-caption slot. */
const MESSAGES: Record<Code, string> = {
  passkeys_off: 'Passkeys are switched off just now.',
  passkey_failed: "We couldn't add that passkey just now. Try again in a moment.",
}

const fail = (code: Code) => ({ error: { code, message: MESSAGES[code] } })

/**
 * BOTH GUARDS, IN THE ORDER THAT MATTERS. The flag first, because an action that still acts
 * with the switch off is not a switch; then the session, because a session that ended between
 * the render and the click has one honest answer and it is the sign-in page, not a sentence
 * (`projects/actions.ts`'s `signedIn`). `redirect` throws, so it narrows.
 */
async function ready() {
  if (!(await passkeysEnabled())) return null
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  return user
}

export async function startPasskeyRegistration(): Promise<RegisterStart> {
  const user = await ready()
  if (!user) return fail('passkeys_off')

  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.passkey.startRegistration()
  if (error || !data) {
    console.error('passkey: registration challenge failed', { status: error?.status, code: error?.code })
    return fail('passkey_failed')
  }
  return { ok: true, challengeId: data.challenge_id, options: data.options }
}

/**
 * Verify, then name it, then mark the nudge done — in that order, because only the first of the
 * three can fail in a way the user must hear about.
 *
 * THE NAME IS SUPABASE'S OWN `friendly_name`, set by `PATCH /passkeys/{id}` in this same action
 * (DW-30). `passkey_labels` is not written: the schema comment that justified it said the
 * platform carried no user-editable label, and the installed 2.115.0 does
 * (`auth-js/dist/module/lib/types.d.ts:2404-2410,2438-2443`). One store beats two that can
 * disagree; 2.2 decides the table's fate.
 *
 * `aaguid` arrives from the browser because that is the only place it exists — it is inside the
 * attestation the authenticator just produced. It is turned into a name and DROPPED: nothing of
 * ours stores an AAGUID.
 */
export async function finishPasskeyRegistration(params: {
  challengeId: string
  credential: ServerCredentialResponse
  aaguid: string | null
}): Promise<ActionResult> {
  const user = await ready()
  if (!user) return fail('passkeys_off')

  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.passkey.verifyRegistration({
    challengeId: params.challengeId,
    credential: params.credential,
  })
  if (error || !data) {
    console.error('passkey: registration verify failed', { code: error?.code })
    return fail('passkey_failed')
  }

  // A name that could not be written is a row reading "Passkey" — worth a log line and not worth
  // failing a registration that has already succeeded.
  const { error: named } = await supabase.auth.passkey.update({
    passkeyId: data.id,
    friendlyName: nameFor(params.aaguid),
  })
  // `code` and not `status`: this error is `AuthError | WebAuthnError` and only the first
  // carries an HTTP status.
  if (named) console.error('passkey: naming failed', { code: named.code })

  // A first registration is the other way the nudge is answered — the offer has been taken, so
  // it is done, on every device.
  await markNudgeDone(user.user_metadata)
  revalidatePath('/app/account')
  revalidatePath('/app')
  return { ok: true }
}

/**
 * "Not now". The fact is per USER, not per device, so a cookie would be wrong, and a column for
 * one timestamp would be a migration; `auth.users.raw_user_meta_data` is the platform's own
 * per-user store, writable by the user's own session, and it arrives inside `getUser()` — so the
 * dashboard reads it for free and makes no extra call at all.
 *
 * ponytail: user_metadata; a `profiles` column the day this ever needs querying.
 */
export async function dismissPasskeyNudge(): Promise<ActionResult> {
  const user = await ready()
  if (!user) return fail('passkeys_off')
  const failed = await markNudgeDone(user.user_metadata)
  if (failed) return fail('passkey_failed')
  revalidatePath('/app')
  return { ok: true }
}

/**
 * The metadata is READ AND WRITTEN BACK WHOLE rather than patched. Whether GoTrue merges `data`
 * into the existing metadata or replaces it is a claim about an external platform, and this
 * spread is correct under either — which is cheaper than proving which (standing rule 1). The
 * metadata is the one `ready()` just verified, not a second `getUser()` whose failure would have
 * been spread as nothing and written back as a wipe (review, 2026-09-06).
 */
async function markNudgeDone(metadata: Record<string, unknown> | undefined): Promise<boolean> {
  const supabase = await supabaseServer()
  const { error } = await supabase.auth.updateUser({
    data: { ...metadata, [NUDGE_DONE]: new Date().toISOString() },
  })
  if (error) console.error('passkey: nudge dismiss failed', { status: error.status, code: error.code })
  return Boolean(error)
}
