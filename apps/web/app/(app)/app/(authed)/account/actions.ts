'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ServerCredentialCreationOptions, ServerCredentialResponse } from '../../sign-in/webauthn.ts'
import { deletionEmail, type Snapshot } from '@/lib/deletion-email'
import { sendEmail } from '@/lib/email'
import { passkeysEnabled } from '@/lib/flags'
import { nameFor } from '@/lib/passkey-name'
import { signedIn, supabaseServer } from '@/lib/supabase/server'
import { APP } from '@/routing'
import { SEND_INTERVAL, sentStateFor } from '../../sign-in/resend-timer.ts'
import {
  DELETE_FAILED,
  matchesPhrase,
  RESTORE_FAILED,
  RESTORE_PATH,
  RESTORED_PATH,
  WINDOW_CLOSED,
  WRONG_PHRASE,
} from './deletion-rule.ts'
import { FIELD_REFUSALS, IN_USE, newEmailFor, SEND_FAILED } from './email-change-rule.ts'
import { NUDGE_DONE } from './nudge.ts'
import { SIGNED_OUT_EVERYWHERE_PATH } from '../../sign-in/signed-out.ts'
import { PASSKEY_NAME_HINT, passkeyIdSchema, passkeyNameSchema } from './passkey-name-rule.ts'

/**
 * S12a'S PASSKEYS CARD, and the dashboard nudge that points at it — FR-A2's registration half.
 *
 * Registration happens ONLY from a signed-in session, which is the whole reason the magic link
 * comes first: `startRegistration` and `verifyRegistration` both read the session from the same
 * cookies every other action does, and `signedIn()` is the guard, as always.
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
  | 'sign_out_failed'
  | 'wrong_phrase'
  | 'delete_failed'
  | 'restore_failed'
  | 'window_closed'
  | 'autosave_failed'

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
  // FR-A6's one failure, in the confirm's own Banner. It says the attempt failed and claims
  // nothing about the other devices, because nothing happened to them.
  sign_out_failed: "We couldn't sign you out everywhere just now. Try again in a moment.",
  // FR-A5's four, all from `deletion-rule.ts` so the dialog, the restore page and this map cannot
  // each keep their own copy of a sentence about the one irreversible thing in the product.
  wrong_phrase: WRONG_PHRASE,
  delete_failed: DELETE_FAILED,
  restore_failed: RESTORE_FAILED,
  window_closed: WINDOW_CLOSED,
  // FR-D10's toggle. The switch is put back where it was and this is said beside it — never a card that shows the
  // new position over a preference that did not move.
  autosave_failed: "We couldn't change that just now. Try again in a moment.",
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
 * BOTH GUARDS, IN THE ORDER THAT MATTERS, for the passkey actions alone. The flag first, because
 * an action that still acts with the switch off is not a switch; then the session — `signedIn()`,
 * which is `lib/supabase/server.ts`'s one export since Story 2.4 closed DW-38 (it stood copied
 * here and in `projects/actions.ts`).
 *
 * `changeEmail` AND `signOutEverywhere` GUARD ON THE SESSION ALONE: neither has a feature flag,
 * and `ready()`'s passkey switch must never gate either — with passkeys off, the Email card and
 * the Sessions card are still there and their buttons still have to work.
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

/**
 * FR-A6's OTHER HALF: end every session, including this device's — S12a's Sessions card.
 *
 * `{ scope: 'global' }` IS WRITTEN OUT AND IT IS NOT DECORATION. `auth-js` 2.115.0 defaults
 * `signOut()` to exactly this scope (`GoTrueClient.js:3405`, `POST /logout?scope=global` at
 * `GoTrueAdminApi.js:67-77`), which is how the avatar menu's ordinary Sign out came to end every
 * session everywhere for three stories. Both scopes are now explicit and `signed-out.test.ts`
 * reads them out of these two files, so neither can be dropped in a tidy-up.
 *
 * NOTHING OF OURS TRACKS SESSIONS. GoTrue owns them, the user's own cookie-backed client ends the
 * user's own — no `supabaseAdmin()`, no table, no list. The other devices are not told: the guard
 * cannot tell a revoked session from an absent one, so they simply arrive at `/sign-in`.
 *
 * A FAILURE IS SAID, NEVER CLAIMED. The redirect is OUTSIDE the try — `redirect()` throws by
 * design and a catch would swallow it — so a `/logout` that failed leaves the dialog open with
 * one red sentence and no navigation OF OURS, and the other devices, which were not signed out,
 * are not described as though they had been. What the LIBRARY did to THIS device on the way is
 * DW-41's: `_signOut` (`GoTrueClient.js:3427-3438`) removes the current session before it returns
 * any error but a 401/403/404, so the cookies may already be gone and the retry lands on
 * `/sign-in` through `signedIn()` with nothing said. Read in the client, not executed — the same
 * shape as the ordinary Sign out's, and the same fix when the owner wants one (review, 2026-09-07).
 */
export async function signOutEverywhere(
  _previous: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  await signedIn()

  try {
    const supabase = await supabaseServer()
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) {
      console.error('sign-out everywhere: failed', { status: error.status, code: error.code })
      return fail('sign_out_failed')
    }
  } catch (error) {
    // `renamePasskey`'s reason: a Server Function that throws takes `/account` to the error
    // boundary instead of leaving the dialog open with one sentence.
    console.error('sign-out everywhere: threw', { name: (error as { name?: string })?.name })
    return fail('sign_out_failed')
  }

  redirect(SIGNED_OUT_EVERYWHERE_PATH)
}

/* ────────────────────────────────────────────────────────────── FR-A5, Story 2.5
   The Danger zone's two verbs. Everything that decides anything lives in the database:
   `request_account_deletion()` and `restore_account()` are `security definer` functions, proved
   in `RLS-TEST.sql` before either was called from here, and they are the ONLY writers of
   `profiles.deleted_at` and `profiles.purge_after` — the column grant deliberately does not
   include them, and no `supabaseAdmin()` goes near a user row. */

/** What the dialog posts. The server re-checks the phrase and never trusts the greyed button. */
const confirmSchema = z.object({ confirm: z.string() })

/** FR-P1's eighth email points here, and the host is `routing.ts`'s, never a second literal. */
const RESTORE_URL = `https://${APP}${RESTORE_PATH}`

/**
 * FR-A5: OPEN THE WINDOW. Nothing is deleted on this call — the function stamps a deadline
 * fourteen days out, the browser lands on `/restore`, and Story 2.6's cron does the removing on
 * the date. Until then every page under the shell sends this account back to `/restore`
 * (`(authed)/layout.tsx`), which is what "signing in restores everything" means.
 *
 * THE PHRASE IS CHECKED HERE TOO. `danger-card.tsx` greys the button with the same function, and
 * that is a courtesy: this is the check (`project-menu.tsx:336`'s rule).
 *
 * THE EMAIL IS NON-FATAL AND IS SENT ONLY WHEN THIS CALL OPENED THE WINDOW. The function answers
 * `null` for a window already open, so a second tab cannot send a second message about the same
 * deadline; and a send that fails does NOT undo the deletion, because the deadline is on the page
 * the browser is about to land on and FR-A5's promise is the window, not the mail. The status is
 * logged either way, which is the whole of what the harness can see (DW-22).
 */
export async function requestDeletion(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await signedIn()

  const asked = confirmSchema.safeParse({ confirm: formData.get('confirm') })
  if (!asked.success || !matchesPhrase(asked.data.confirm)) return fail('wrong_phrase')

  const supabase = await supabaseServer()
  const { data: deadline, error } = await supabase.rpc('request_account_deletion')
  if (error) {
    console.error('deletion: request failed', { code: error.code })
    return fail('delete_failed')
  }
  // `null` = the window was ALREADY open. Nothing changed and nothing is sent; the page the user
  // lands on states the deadline they already have. The whole email step is fenced: the deletion
  // is committed by now, and nothing it does may reach the error boundary (review, 2026-09-07).
  if (deadline) {
    try {
      await confirmByEmail(user.email, deadline as string)
    } catch (thrown) {
      console.error('deletion: email step threw', { message: String(thrown).slice(0, 200) })
    }
  }

  redirect(RESTORE_PATH)
}

/**
 * The one email, composed and sent. Separate from the action above only so the action reads as the
 * two database calls it is; it is not reused and is not exported (a `'use server'` file's exports
 * are all Server Actions).
 *
 * THE SNAPSHOT READ GOES THROUGH THE USER'S OWN CLIENT, so `site_snapshots_owner_read` scopes it —
 * the email can never name another account's themes. A read that fails is an email with no theme
 * block and a log line, never a failed deletion.
 */
async function confirmByEmail(to: string | undefined, deadline: string) {
  if (!to) {
    // Said out loud, so the Deploy run's log can tell a skipped send from a lost one.
    console.error('deletion: email skipped, the session has no address')
    return
  }
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('site_snapshots')
    .select('id, theme_name, captured_at, sites(title, url)')
    // Newest first, the order `/restore` lists them in — the email and the page must agree.
    .order('captured_at', { ascending: false })
  if (error) console.error('deletion: snapshot read failed', { code: error.code })

  const sent = await sendEmail({
    to,
    ...deletionEmail({
      deadline,
      snapshots: (data ?? []) as unknown as Snapshot[],
      restoreUrl: RESTORE_URL,
    }),
  })
  if (sent.ok) console.log('deletion: email sent', { id: sent.id })
  else console.error('deletion: email failed', { status: sent.status, reason: sent.reason ?? null })
}

/**
 * FR-A5's OTHER HALF, and it is one click. `restore_account()` answers `true` only while the
 * deadline is still ahead: once it has passed, 2.6's purge owns the account and a `false` comes
 * back, which the restore page says in its red Banner rather than pretending the account is safe.
 *
 * The redirect is OUTSIDE any try, as `signOutEverywhere`'s is — `redirect()` throws by design.
 */
export async function restoreAccount(
  _previous: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  const user = await signedIn()

  const supabase = await supabaseServer()
  const { data: restored, error } = await supabase.rpc('restore_account')
  if (error) {
    console.error('deletion: restore failed', { code: error.code })
    return fail('restore_failed')
  }
  if (restored === false) {
    // `false` is "no pending row inside the window", and that has TWO readings: the deadline
    // passed, or the account was already restored — from another tab, or by a double press whose
    // first half won. Only the first is a closed window; the second is a restore that happened,
    // and telling that person "the 14 days have ended" would be a lie about a safe account
    // (review, 2026-09-07). One read tells them apart.
    const { data: profile } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('user_id', user.id)
      .maybeSingle()
    if (profile && !profile.deleted_at) redirect(RESTORED_PATH)
    return fail('window_closed')
  }

  redirect(RESTORED_PATH)
}


/**
 * FR-D10'S AUTOSAVE TOGGLE — `profiles.autosave_enabled`, and it is PER USER, NOT PER DEVICE (`schema:118`).
 *
 * THE COLUMN IS ALREADY OWNER-WRITABLE: §11 grants `authenticated` UPDATE on `display_name, autosave_enabled,
 * updated_at`, so this story adds no grant and no policy. The write goes through the caller's own session, so RLS
 * decides whose row it is and nothing here compares a user id.
 *
 * WHAT TURNING IT OFF ACTUALLY COSTS, so the confirm can say it plainly: the 3-MINUTE TIMER ALONE stops (AD-15). The
 * local journal is unchanged, tab close still flushes and ⌘S still flushes. Turning it back ON asks nothing — it is
 * the restoring half, exactly as SHOWING a hidden site-wide section asks nothing.
 *
 * `(previous, formData)` so a form drives it through `useActionState`, the shape every action in this file takes.
 */
export async function setAutosave(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const wanted = formData.get('autosave')
  if (wanted !== 'on' && wanted !== 'off') return fail('autosave_failed')
  const user = await signedIn()

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('profiles')
    .update({ autosave_enabled: wanted === 'on' })
    .eq('user_id', user.id)
    .select('user_id')
  if (error || !data || data.length === 0) {
    console.error('account: autosave write failed', { code: error?.code })
    return fail('autosave_failed')
  }
  // the INTERNAL route tree, as every other action in this file addresses it (`routing.ts:25`)
  revalidatePath('/app/account')
  return { ok: true }
}
