import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/supabase/server'

/**
 * THE GUARD. Everything under `/app` is inside this group except the two routes that exist for
 * people who are not signed in yet: `/sign-in` and `/auth/confirm`.
 *
 * `getUser()`, never `getSession()` — the second reads the cookie and believes it. The check is
 * here rather than in `proxy.ts` so a new route is behind it by where its file sits, which is
 * the one thing nobody forgets to do.
 *
 * `/kit`, Story 1.3's component gallery, moved in here with it: it is internal, and its own
 * Design Notes expected this.
 */
export default async function AuthedLayout({ children }: { children: ReactNode }) {
  if (!(await currentUser())) redirect('/sign-in')
  return children
}
