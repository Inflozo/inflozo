'use server'

import { redirect } from 'next/navigation'
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
  const { error } = await supabase.auth.signOut()
  if (error) console.error('sign-out: failed', { code: error.code })
  redirect(signOutPathFor(Boolean(error)))
}
