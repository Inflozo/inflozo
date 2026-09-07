'use server'

import { redirect } from 'next/navigation'
import type { ServerCredentialRequestOptions, ServerCredentialResponse } from './webauthn.ts'
import { passkeysEnabled } from '@/lib/flags'
import { supabaseServer } from '@/lib/supabase/server'
import { BAD_EMAIL, parseEmail } from './email.ts'
import { SEND_INTERVAL, sentStateFor } from './resend-timer.ts'
import { signOutPathFor } from './signed-out.ts'

/**
 * Sending the link is a POST that runs entirely on the server: the publishable key, the
 * cookies and the failure text never leave it. There is no browser Supabase client in this
 * app at all, which is how the spine's "secrets never in `NEXT_PUBLIC_*`" is kept — by having
 * nothing to expose rather than by remembering not to expose it.
 *
 * Only async functions may be exported from a `'use server'` module, which is why the interval
 * and the two pure helpers live next door in `resend-timer.ts`.
 */

type Failure = 'bad_email' | 'send_failed'

/**
 * `throttled` is the difference between "we just sent one" and "one went out moments ago and we
 * will not send another yet" — GoTrue's per-address 429. The card MUST NOT read the second as
 * the first: the owner signed out and straight back in, was told a link was on its way, and no
 * mail existed to arrive (his fourth test, finding 1). One field, because the card is otherwise
 * the same card: same envelope, same address, same countdown.
 */
export type SendState =
  | { status: 'idle' }
  | { status: 'sent'; email: string; retryAfter: number; throttled?: boolean }
  | { status: 'error'; error: { code: Failure; message: string }; email: string }

const messages: Record<Failure, string> = {
  bad_email: BAD_EMAIL,
  // The frame carries no wording for a send failure, so it is one plain sentence in S1's voice.
  send_failed: "We couldn't send your link just now. Try again in a moment.",
}

export async function sendMagicLink(_prev: SendState, formData: FormData): Promise<SendState> {
  const raw = formData.get('email')
  const email = parseEmail(raw)
  if (!email) {
    return {
      status: 'error',
      error: { code: 'bad_email', message: messages.bad_email },
      email: typeof raw === 'string' ? raw : '',
    }
  }

  const supabase = await supabaseServer()
  const { error } = await supabase.auth.signInWithOtp({ email })

  if (!error) return { status: 'sent', email, retryAfter: SEND_INTERVAL }

  // Two different 429s, and only the per-address one is "too soon" rather than a failure. The
  // WHOLE mapping — not just the predicate — lives in `resend-timer.ts` so `node --test` holds
  // it: `throttled` deleted here used to leave every check green (review, 2026-09-06). Nothing
  // was sent on this one, which is exactly what `throttled` carries to the card.
  const tooSoon = sentStateFor(error, SEND_INTERVAL)
  if (tooSoon) return { status: 'sent', email, ...tooSoon }

  // Logged without the address: logs carry no user content (spine, Security floor).
  console.error('sign-in: send failed', { status: error.status, code: error.code })
  return { status: 'error', error: { code: 'send_failed', message: messages.send_failed }, email }
}

/**
 * The shell's Sign out. Clearing the cookies is a write, so it cannot be a page.
 *
 * `?signed-out=1` is how the sign-in card knows to say it happened — the owner's third test,
 * finding 2, ruled at question 6 option 1. It is a hint on the URL and nothing depends on it:
 * the session is already gone whether or not the card reads it.
 *
 * The round trip to GoTrue used to be the slow half of his complaint. It is not the code that
 * changed — on his ruling of the same day (finding 3) the Vercel project's function region was
 * set to `fra1`, the database's own AWS region, through the Vercel API on 2026-09-06. That is a
 * project setting, not a line in this repository; the spec's Verification holds the control
 * (`x-vercel-id`). Keep the await: signing out has to be true before the redirect says so.
 *
 * GoTrue unreachable is the one way this fails: `signOut()` then KEEPS the cookies and returns
 * the error, so the flag is withheld — the sign-in page would only bounce a still-signed-in
 * user back to the dashboard, and the card must not say it happened when it did not.
 *
 * IT USED TO SAY NOTHING AT ALL in that branch: the user watched `Signing out…`, landed back on
 * the dashboard still signed in, and was told nothing — the one branch of his own question 6
 * rule that did not "say it happened" (review, 2026-09-06). **The owner ruled question 8,
 * option 1:** the dashboard shows the Kit's error Banner, the same red strip it already shows
 * when the projects fail to load. Withholding the success flag and saying the attempt failed are
 * two different things, and now it does both.
 */
export async function signOut() {
  const supabase = await supabaseServer()
  // THIS DEVICE ONLY, AND IT HAS TO BE SAID. `auth-js` 2.115.0 DEFAULTS this call to
  // `{ scope: 'global' }` (`GoTrueClient.js:3405`) — `POST /logout?scope=global`, every session
  // the user has — so from Story 1.4 until Story 2.4 signing out on the laptop signed the phone
  // out too, and FR-A6's "ordinary sessions persist" was not true. Ending every session is a
  // separate, confirmed action (`account/actions.ts`'s `signOutEverywhere`), never this one.
  // `signed-out.test.ts` reads both scopes out of the source so neither can go implicit again.
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  if (error) console.error('sign-out: failed', { code: error.code })
  redirect(signOutPathFor(Boolean(error)))
}

/* ─────────────────────────────────────────────────────── S1a's passkey button — FR-A2

   THE HTTP HALF OF THE CEREMONY RUNS HERE, and only `navigator.credentials.get()` runs in the
   browser. `signInWithPasskey()` is the library's one-call helper and does both halves in one
   process — which is a browser Supabase client, the one thing this app does not have. The
   two-step methods split exactly where the app already splits: `startAuthentication` needs no
   session at all, and `verifyAuthentication` SAVES one through the client's storage and fires
   `SIGNED_IN` (`GoTrueClient.js:5605-5631`), which `@supabase/ssr` applies through our `setAll`
   (`createServerClient.js:52-70`) — so the cookie lands with `sessionCookie()`'s 30 days,
   `HttpOnly` and `Secure`, exactly as the magic link's does, with no second code path.

   BOTH REFUSE WHEN THE FLAG IS OFF. An action that still acts with the switch off is not a
   switch; the button is absent then, so nothing reaches these but a stale tab or a hand-made
   POST. */

type PasskeyFailure = 'passkeys_off' | 'passkey_failed'

export type PasskeyStart =
  | { ok: true; challengeId: string; options: ServerCredentialRequestOptions }
  | { error: { code: PasskeyFailure; message: string } }

export type PasskeyFinish = { error: { code: PasskeyFailure; message: string } }

/** S1's voice, one sentence each, said in the card's red error Banner at the top (the owner's test
 *  of 2.2, finding 1 — `passkey-button.tsx` hands them up through `onError`). */
const PASSKEY_MESSAGES: Record<PasskeyFailure, string> = {
  passkeys_off: 'Passkeys are switched off just now. Use a magic link instead.',
  passkey_failed: "We couldn't sign you in with a passkey. Use a magic link instead.",
}

const passkeyError = (code: PasskeyFailure) => ({ error: { code, message: PASSKEY_MESSAGES[code] } })

export async function startPasskeySignIn(): Promise<PasskeyStart> {
  if (!(await passkeysEnabled())) return passkeyError('passkeys_off')

  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.passkey.startAuthentication()
  if (error || !data) {
    console.error('passkey: challenge failed', { status: error?.status, code: error?.code })
    return passkeyError('passkey_failed')
  }
  return { ok: true, challengeId: data.challenge_id, options: data.options }
}

/**
 * The credential the browser produced, verified. On success this REDIRECTS rather than
 * returning: `redirect` throws, so nothing after it runs, and the client never has to decide
 * where a signed-in user goes. `/` is the public path — `proxy.ts` rewrites it onto `/app`.
 */
export async function finishPasskeySignIn(params: {
  challengeId: string
  credential: ServerCredentialResponse
}): Promise<PasskeyFinish> {
  if (!(await passkeysEnabled())) return passkeyError('passkeys_off')

  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.passkey.verifyAuthentication({
    challengeId: params.challengeId,
    credential: params.credential,
  })
  // `session` is typed nullable: a verify that answers without one has set no cookie, and a
  // redirect to `/` would only bounce back here with nothing said (review, 2026-09-06).
  if (error || !data?.session) {
    // An expired challenge and a tampered credential are the same sentence to the user and the
    // same log line here: a code and a status, never the credential (spine, Security floor).
    // `code` and not `status`: a verify can fail as GoTrue's `AuthError` OR as the library's
    // own `WebAuthnError`, and only the first carries an HTTP status.
    console.error('passkey: verify failed', { code: error?.code, session: Boolean(data?.session) })
    return passkeyError('passkey_failed')
  }
  redirect('/')
}
