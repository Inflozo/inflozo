'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { BAD_EMAIL, parseEmail } from './email.ts'
import { retryAfterFrom, SEND_INTERVAL } from './resend-timer.ts'

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

export type SendState =
  | { status: 'idle' }
  | { status: 'sent'; email: string; retryAfter: number }
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

  // TWO different 429s, and only one of them means "your link is already on its way".
  // `over_email_send_rate_limit` is the per-address minimum interval: nothing was sent because
  // something was sent seconds ago, so S1b with the countdown reset is the truth (UX-DR13 — it
  // blocks nothing, and the earlier link is still good). The project-wide hourly cap also
  // answers 429; showing "Check your inbox" for that one would be a lie, so it falls through.
  if (error.status === 429 && error.code === 'over_email_send_rate_limit') {
    return { status: 'sent', email, retryAfter: retryAfterFrom(error.message, SEND_INTERVAL) }
  }

  // Logged without the address: logs carry no user content (spine, Security floor).
  console.error('sign-in: send failed', { status: error.status, code: error.code })
  return { status: 'error', error: { code: 'send_failed', message: messages.send_failed }, email }
}

/** The holding page's Sign out. Clearing the cookies is a write, so it cannot be a page. */
export async function signOut() {
  const supabase = await supabaseServer()
  await supabase.auth.signOut()
  redirect('/sign-in')
}
