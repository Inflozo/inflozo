import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { Shell } from '@/components/shell/shell'
import { resolveEntitlement } from '@/lib/entitlement'
import { currentUser, supabaseServer } from '@/lib/supabase/server'

/**
 * THE GUARD, AND THE SHELL. Everything under `/app` is inside this group except the two routes
 * that exist for people who are not signed in yet: `/sign-in` and `/auth/confirm`.
 *
 * `getUser()`, never `getSession()` — the second reads the cookie and believes it. The check is
 * here rather than in `proxy.ts` so a new route is behind it by where its file sits, which is
 * the one thing nobody forgets to do — and since Story 1.5 the same sentence is true of S3's
 * shell: Sites, Assets and Billing are inside it by where their files will sit.
 *
 * `/kit`, Story 1.3's component gallery, moved in here with it: it is internal, and its own
 * Design Notes expected this.
 */
export default async function AuthedLayout({ children }: { children: ReactNode }) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const supabase = await supabaseServer()
  const [{ data: profile }, { plan }] = await Promise.all([
    // `profiles.display_name` is the chip's name. Nothing sets it until Epic 2, and until then
    // the email stands in the name slot with no second line — the row itself exists from
    // signup (the `auth.users` trigger), so this is a null column, not a missing row.
    supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle(),
    resolveEntitlement(user.id),
  ])

  return (
    <Shell user={{ email: user.email ?? '', displayName: profile?.display_name ?? null }} plan={plan}>
      {children}
    </Shell>
  )
}
