import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Shell } from '@/components/shell/shell'
import { resolveEntitlement } from '@/lib/entitlement'
import { packFacesCss } from '@/lib/style-pack'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { canvasRouteOn } from '@/routing'
import { RESTORE_PATH } from './account/deletion-rule'

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
 *
 * SINCE STORY 2.5 IT IS ALSO THE DELETION WINDOW'S DOOR. FR-A5 offers Restore *on signing in*,
 * and an account that is still fully usable has not been deleted in any sense the user meant —
 * worse, work done inside the window would be purged in silence. So the profiles read this layout
 * already makes widens by one column and a pending account is sent to `/restore` from every page
 * under the shell, which is the only place that can be true for all of them at once.
 */
export default async function AuthedLayout({ children }: { children: ReactNode }) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const supabase = await supabaseServer()
  const [{ data: profile, error: profileError }, { plan }] = await Promise.all([
    // `profiles.display_name` is the chip's bold line. Nothing sets it until Epic 2, and until
    // then there is no bold line and the email sits on the small one (`lib/shell-user.ts`) —
    // the row itself exists from signup (the `auth.users` trigger), so this is a null column,
    // not a missing row.
    supabase.from('profiles').select('display_name, deleted_at').eq('user_id', user.id).maybeSingle(),
    resolveEntitlement(user.id),
  ])
  // Logged without the id: logs carry no user content (spine, Security floor). Silently, the
  // email would have stood in the name slot for ever with nothing saying why (review, 2026-09-05).
  if (profileError) console.error('profile: read failed', { code: profileError.code })

  // FR-A5's window is a LOCKED DOOR, not a banner. `/restore` lives outside this group — a layout
  // cannot read its own path, so a redirect from inside would loop — and guards itself with its
  // own `signedIn()`, which `app-routes.test.ts` asserts.
  //
  // FAIL-OPEN on a failed read: `profile` is null and the shell renders. The alternative is a 500
  // for every pending account whenever Postgres hiccups, for a state in which nothing can be lost
  // — the purge still runs on its date either way.
  //
  // ponytail: the layout is the door; actions are not re-guarded — a stale tab's write lands on a
  // row the purge removes anyway.
  if (profile?.deleted_at) redirect(RESTORE_PATH)

  // STORY 6.2 — EVERY PRESET'S HEADING FACE, declared once for the whole signed-in app under a family name of its own, so a
  // pack cell's "Ag" — the dashboard's New project window, the editor's Style Pack card and list — is drawn in the pack's
  // real face from this app's own canvas route, and the app's Inter and Bricolage are never redefined. Nothing is fetched
  // until a glyph uses a face. The route's address is the one the page sees: `/canvas` on the app host, `/app/canvas` on
  // localhost (`routing.ts`'s `canvasRouteOn`, which `routing.test.ts` holds — DW-325).
  const fonts = canvasRouteOn((await headers()).get('host'))
  return (
    <Shell user={{ id: user.id, email: user.email ?? '', displayName: profile?.display_name ?? null }} plan={plan}>
      <style data-pack-faces>{packFacesCss(fonts)}</style>
      {children}
    </Shell>
  )
}
