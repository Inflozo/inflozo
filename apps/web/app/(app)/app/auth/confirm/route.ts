import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { sessionCookie } from '@/lib/supabase/cookies'

/**
 * WHERE THE EMAIL'S BUTTON LANDS. It is a route handler and not a page because this is the one
 * place the session cookies are written, and only a route handler or a server action may write
 * them.
 *
 * Supabase's DEFAULT link goes through GoTrue's own `/verify` and hands the session back as a
 * URL fragment, which no server ever sees — a server component could never say who the user
 * is. The template therefore carries `{{ .TokenHash }}` and this handler calls `verifyOtp`
 * itself: the documented SSR shape.
 *
 * It stays OUTSIDE the `(authed)` group on purpose — the whole point of the visit is that the
 * user is not signed in yet.
 */

// GoTrue's own list; anything else in the URL is not a link we sent. `email` is the one the
// template carries (supabase/auth/magic-link.html) for a magic-link AND a signup token —
// executed: `/auth/v1/verify` returned 200 for both (Spec Change Log 2). Narrowing this list to
// the two "obvious" types would break every real link.
const TYPES: readonly EmailOtpType[] = ['magiclink', 'signup', 'email', 'invite', 'recovery', 'email_change']

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // 303, not 307: the browser must GET the destination, and never re-send this URL.
  const home = NextResponse.redirect(new URL('/', request.url), 303)
  // The token is never echoed — not into the URL, not into a log (matrix, Stale link).
  const stale = NextResponse.redirect(new URL('/sign-in?error=link', request.url), 303)

  if (!tokenHash || !type || !TYPES.includes(type)) return stale

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY are not set')

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(written) {
        for (const { name, value, options } of written) home.cookies.set(name, value, sessionCookie(options))
      },
    },
  })

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  // Expired, already used, or forged — all one answer to the user, and one that says what to
  // do next rather than what went wrong.
  return error ? stale : home
}
