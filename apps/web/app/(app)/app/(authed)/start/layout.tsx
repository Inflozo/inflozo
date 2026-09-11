import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { showsFirstRun } from '@/lib/first-run'
import { currentUser } from '@/lib/supabase/server'
import { readFirstRun } from '@/server/first-run'

/* ───────── THE OTHER SIDE OF FIRST RUN'S DOOR (review, 2026-09-11).

   The welcome screen IS what Projects looks like while you have nothing — the owner's Question 1
   ruling — so the moment you have something, Projects is `/` and this route sends you there. Two
   things were executed on app.inflozo.com before this existed: a project made from the welcome
   screen's own Blank door closed the sheet and left the customer standing on the three doors (the
   action re-renders this route, and nothing here moved them), and a typed `/start` drew the doors
   over an account with work. Both are this one line now: the action's re-render runs this layout,
   which redirects to the dashboard with the new project on it.

   A LAYOUT, for the reason `(dashboard)/layout.tsx` is one: `loading.tsx` beside the page is a
   Suspense boundary, and a redirect from below it is a client navigation and not a 307.

   `hasQuery: false` — a query string on `/start` means nothing, and it must never turn an account
   with work into one without. A failed read answers "not First Run" and lands on the dashboard,
   the page that already works and says so in a red Banner. */

export default async function StartLayout({ children }: { children: ReactNode }) {
  const user = await currentUser()
  // The parent layout's guard has already redirected anyone without one; this is the narrowing.
  if (!user) return children

  if (!showsFirstRun(await readFirstRun(false))) redirect('/')

  return children
}
