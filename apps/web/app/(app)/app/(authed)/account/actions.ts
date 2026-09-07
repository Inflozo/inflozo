'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ServerCredentialCreationOptions, ServerCredentialResponse } from '../../sign-in/webauthn.ts'
import { passkeysEnabled } from '@/lib/flags'
import { nameFor } from '@/lib/passkey-name'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { SEND_INTERVAL, sentStateFor } from '../../sign-in/resend-timer.ts'
import { FIELD_REFUSALS, IN_USE, newEmailFor, SEND_FAILED } from './email-change-rule.ts'
import { NUDGE_DONE } from './nudge.ts'
import { PASSKEY_NAME_HINT, passkeyIdSchema, passkeyNameSchema } from './passkey-name-rule.ts'

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
 * RENAME AND REVOKE are FR-A3's other half and live here too (Story 2.2). Both go to Supabase's
 * OWN passkey store through the user's own cookie-backed client — `PATCH /passkeys/{id}` and
 * `DELETE /passkeys/{id}` — never `supabaseAdmin()`: GoTrue scopes both to the bearer token, and
 * THAT is the ownership check. Nothing of ours re-checks it, because nothing of ours knows which
 * passkeys are whose — `passkey_labels` was dropped in the same story (DW-30).
 *
 * `revalidatePath` addresses the INTERNAL route tree — `/app/account` and `/app` — not the
 * public paths the browser sees (`routing.ts:25`, and the note in `signed-out.ts`).
 */

type Code =
  | 'passkeys_off'
  | 'passkey_failed'
  | 'bad_name'
  | 'rename_failed'
  | 'revoke_failed'
  | 'bad_email'
  | 'same_email'
  | 'in_use'
  | 'too_soon'
  | 'send_failed'

export type RegisterStart =
  | { ok: true; challengeId: string; options: ServerCredentialCreationOptions }
  | { error: { code: Code; message: string } }

export type ActionResult = { ok: true } | { error: { code: Code; message: string } }

/** S12's voice, one sentence each, in the card's helper-caption slot. */
const MESSAGES: Record<Code, string> = {
  passkeys_off: 'Passkeys are switched off just now.',
  passkey_failed: "We couldn't add that passkey just now. Try again in a moment.",
  // The field's own refusal, in the field's own slot — composed from the limit it quotes.
  bad_name: PASSKEY_NAME_HINT,
  rename_failed: "We couldn't rename that passkey just now. Try again in a moment.",
  revoke_failed: "We couldn't remove that passkey just now. Try again in a moment.",
  // FR-A4's five. The first three are the FIELD's own refusals and go in its helper-caption
  // slot; the last two are the card's Banner. `too_soon` is composed at the point of failure
  // from GoTrue's own remainder, so this entry is the fallback the composer replaces.
  ...FIELD_REFUSALS,
  in_use: IN_USE,
  too_soon: tooSoon(SEND_INTERVAL),
  send_failed: SEND_FAILED,
}

/** S1b's sentence at the account's altitude: the seconds are GoTrue's, never a guess of ours. */
function tooSoon(seconds: number) {
  return `We sent a link a moment ago. Try again in ${seconds} seconds.`
}

const fail = (code: Code, message?: string) => ({
  error: { code, message: message ?? MESSAGES[code] },
})

/** The passkey the row's button posted — `passkeyIdSchema` says why it is a UUID. */
const idOf = (formData: FormData) => {
  const parsed = passkeyIdSchema.safeParse(formData.get('id'))
  return parsed.success ? parsed.data : null
}

/**
 * GoTrue answers 404 for an id that is gone or not this user's (executed 2026-09-07:
 * `{"error_code":"validation_failed","msg":"Passkey not found"}` on both PATCH and DELETE). The
 * matrix's *stale id* row promises "the next render drops the row", and a render only happens if
 * something revalidates — so a 404 revalidates, and still says the sentence.
 */
const GONE = 404

/**
 * THE SESSION, ON ITS OWN. A session that ended between the render and the click has one honest
 * answer and it is the sign-in page, not a sentence (`projects/actions.ts`'s own `signedIn`,
 * copied here rather than imported because an exported async function in a `'use server'` file
 * is a Server Action, and a guard is not one). `redirect` throws, so it narrows.
 *
 * `changeEmail` GUARDS ON THIS ALONE: there is no feature flag for changing an email, and
 * `ready()`'s passkey switch must never gate it — with passkeys off, the Email card is still
 * there and its button still has to work.
 */
async function signedIn() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  return user
}

/**
 * BOTH GUARDS, IN THE ORDER THAT MATTERS, for the passkey actions alone. The flag first, because
 * an action that still acts with the switch off is not a switch; then the session, above.
 */
async function ready() {
  if (!(await passkeysEnabled())) return null
  return signedIn()
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
 * (DW-30). The schema comment that justified `passkey_labels` said the platform carried no
 * user-editable label, and the installed 2.115.0 does
 * (`auth-js/dist/module/lib/types.d.ts:2404-2410,2437-2442`). One store beats two that can
 * disagree, so Story 2.2 DROPPED that table — `renamePasskey` below writes to the same
 * `friendly_name` this line does.
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
 * FR-A3's RENAME. `useActionState`'s `(previous, FormData)` signature, so the dialog's `<form>`
 * is the action's own dispatch and is progressively enhanced (`projects/actions.ts:130` is the
 * pattern, and the reason: a client closure passed as `action` emits no action at all with
 * JavaScript off).
 *
 * THE GUARD RUNS BEFORE THE FIELD IS READ. With either switch off the module does not exist, and
 * an action that still answers "give it a name" would be describing a form nobody should have.
 *
 * WRAPPED, because `auth.passkey.*` can THROW rather than answer: the experimental opt-in is
 * asserted BEFORE the library's own try, and anything that is not an `AuthError` is re-thrown
 * (`auth-js/lib/helpers.js:450-454`, `GoTrueClient.js:5668-5730`). Unwrapped, a Server Function
 * that throws reaches the error boundary and takes `/account` down instead of leaving the dialog
 * open with one sentence — the same wrapping `listPasskeys()` carries, for the same reason.
 */
export async function renamePasskey(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await ready()
  if (!user) return fail('passkeys_off')

  const id = idOf(formData)
  const parsed = passkeyNameSchema.safeParse(formData.get('name'))
  if (!parsed.success) return fail('bad_name')
  if (!id) return fail('rename_failed')

  try {
    const supabase = await supabaseServer()
    const { error } = await supabase.auth.passkey.update({
      passkeyId: id,
      friendlyName: parsed.data,
    })
    // An id that is not this user's — or not there at all — is GoTrue's 404, and it is the same
    // sentence: the row is gone and the next render says so. No name and no id is logged.
    if (error) {
      console.error('passkey: rename failed', { status: error.status, code: error.code })
      if (error.status === GONE) revalidatePath('/app/account')
      return fail('rename_failed')
    }
  } catch (error) {
    console.error('passkey: rename threw', { name: (error as { name?: string })?.name })
    return fail('rename_failed')
  }

  revalidatePath('/app/account')
  return { ok: true }
}

/**
 * FR-A3's REVOKE. THE SESSION IS NOT TOUCHED: removing a credential removes a way IN, not the
 * way the user is already here, so nothing signs anybody out — sign-out-everywhere is 2.4.
 *
 * `delete` ANSWERS WITH NO BODY (`noResolveJson`, `GoTrueClient.js:5712-5722`), so `data` is
 * `null` on success and `!data` must never be read as a failure here. `error` alone decides.
 */
export async function revokePasskey(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await ready()
  if (!user) return fail('passkeys_off')

  const id = idOf(formData)
  if (!id) return fail('revoke_failed')

  try {
    const supabase = await supabaseServer()
    const { error } = await supabase.auth.passkey.delete({ passkeyId: id })
    if (error) {
      console.error('passkey: revoke failed', { status: error.status, code: error.code })
      if (error.status === GONE) revalidatePath('/app/account')
      return fail('revoke_failed')
    }
  } catch (error) {
    console.error('passkey: revoke threw', { name: (error as { name?: string })?.name })
    return fail('revoke_failed')
  }

  revalidatePath('/app/account')
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

/**
 * FR-A4's EMAIL CHANGE, through Supabase's OWN `auth.updateUser({ email })` — no code of ours
 * touches `auth.users` and nothing of ours stores a pending address: `new_email` and
 * `email_change_sent_at` are the platform's record and arrive inside `getUser()`.
 *
 * THE UPFRONT "ALREADY IN USE" IS GoTrue's, not a lookup of ours. It refuses a duplicate with
 * `422 email_exists` BEFORE it sends anything (`internal/api/user.go:135-139`, read in its source
 * 2026-09-07), which is exactly what FR-A4 asks for — so `SUPABASE_SECRET_KEY` gains no second
 * reader and no admin listing of every address happens on a keystroke.
 *
 * TWO EMAILS, AND THIS ACTION SENDS NEITHER ITSELF. The link goes to the NEW address, because
 * `mailer_secure_email_change_enabled` is written false — with it on, GoTrue mails BOTH addresses
 * and the new one's link alone never lands the change (`verify.go:548-585`). And when the change
 * is later CONFIRMED, GoTrue mails the OLD address a "your email address was changed" notice,
 * because `mailer_notifications_email_changed_enabled` is written true: the owner's ruling R-95
 * (2026-09-07), so a stolen session cannot move an account in silence. Both switches are written
 * and read back by `tools/probe/configure-supabase-auth.py`; nothing here decides either.
 *
 * WRAPPED, for `renamePasskey`'s reason: `auth-js` re-throws anything that is not an `AuthError`,
 * and a Server Function that throws takes `/account` to the error boundary instead of leaving the
 * dialog open with one sentence.
 *
 * NOTHING IS LOGGED BUT A STATUS AND A CODE — never an address, never a token, never a link.
 */
export async function changeEmail(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await signedIn()

  // The boundary FIRST, so a non-address and the account's own address never reach the platform
  // at all — the matrix's "nothing sent" is true of both. `email-change-rule.ts` holds it, and
  // the dialog runs the same function at submit, so the two cannot say different things.
  const asked = newEmailFor(user.email, formData.get('email'))
  if ('code' in asked) return fail(asked.code)

  try {
    const supabase = await supabaseServer()
    const { error } = await supabase.auth.updateUser({ email: asked.email })
    if (error) {
      // A second send inside `smtp_max_frequency`: NOTHING was sent, and the remainder in the
      // sentence is GoTrue's own rather than our copy of the setting (`sentStateFor`).
      const throttled = sentStateFor(error, SEND_INTERVAL)
      if (throttled) return fail('too_soon', tooSoon(throttled.retryAfter))
      // The address belongs to another account. GoTrue answered before it sent, so
      // `email_change_sent_at` did not move — which is the harness's control for "no email".
      if (error.code === 'email_exists') return fail('in_use')
      // GoTrue refused the ADDRESS itself (`email_address_invalid`: a shape zod passed and its
      // validator did not). Nothing was sent and trying again would not help, so it is the
      // field's sentence, not the Banner's (review, 2026-09-07).
      if (error.code === 'email_address_invalid') return fail('bad_email')
      console.error('email change: send failed', { status: error.status, code: error.code })
      return fail('send_failed')
    }
  } catch (error) {
    console.error('email change: threw', { name: (error as { name?: string })?.name })
    return fail('send_failed')
  }

  // The INTERNAL path, as always: the pending banner is read off `getUser()` on the next render
  // and nothing on the client edits the card.
  revalidatePath('/app/account')
  return { ok: true }
}
