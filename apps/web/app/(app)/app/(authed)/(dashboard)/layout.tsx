import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { showsFirstRun } from '@/lib/first-run'
import { currentUser } from '@/lib/supabase/server'
import { readFirstRun } from '@/server/first-run'
import { hasSearch, SEARCH_HEADER } from '@/routing'

/* ───────── STORY 3.8 — FIRST RUN'S DOOR, and it is a LAYOUT for one measured reason.

   An account with no project and no connected site is sent to `/start`, S2a's three doors, because
   the one control on the dashboard's empty screen makes a BLANK project — the least recommended of
   the three doors and the one that leaves the customer with no site, no brand and sample content
   (DW-19, closed by the owner's ruling of 2026-09-08). `start/layout.tsx` is the same door from the
   other side: an account WITH a project or a site is sent from `/start` back here.

   WHY IT IS NOT IN `page.tsx`, WHERE THE SPEC FIRST PUT IT. `loading.tsx` next door is a Suspense
   boundary, so Next flushes the shell the moment the page awaits anything — and a `redirect()`
   AFTER that flush cannot be an HTTP redirect. Measured on a production build (`next build` +
   `next start`, 2026-09-11): `/` answered **200** with the dashboard document, the customer watched
   the PROJECT-CARD skeleton for ~150ms and only then arrived at the welcome screen, and with scripts
   off the redirect never arrived at all. Two things that is: the owner's finding 2 on Story 3.4 —
   "I want the loading shimmer to match the cards they show" — reintroduced on the first screen a
   new customer ever sees, and a first run that needs JavaScript to begin. Deleting the skeleton
   would fix it and undo R-98, and `generateMetadata` was tried and streams the same way (executed).
   From HERE, above the boundary, the identical call is a **307 with `Location: /start`** before a
   byte of the dashboard is sent. The control: the same probe with `loading.tsx` moved away answered
   307 from the page too, which is what pins the cause on the boundary rather than on the call.

   THE QUERY STRING IS HANDED IN BY THE PROXY (`SEARCH_HEADER`), because Next gives `searchParams`
   to a page and not to a layout. Any query string renders the dashboard: `restoreAccount` lands on
   `/?restored=1` and a failed sign-out on `/?signed-out-failed=1`, and both sentences are ON the
   dashboard, so a redirect would swallow them.

   THE COUNTS, NOT THE ROWS — `server/first-run.ts` reads them, `head` only, and the page reads the
   projects it draws; React renders a layout and its children together, so the second query costs
   a query and not a wait. They could in principle disagree (a project created between them,
   milliseconds apart); the consequence is one render of the wrong one of two working screens.

   NO LOOP IS POSSIBLE: `/start` is not inside this route group, so this layout never runs for it,
   and its own guard asks the same reader the same question — the two can only disagree across a
   write that landed between two reads, and the next load agrees. */

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [head, user] = await Promise.all([headers(), currentUser()])
  // The parent layout's guard has already redirected anyone without one; this is the narrowing.
  if (!user) return children

  if (showsFirstRun(await readFirstRun(hasSearch(head.get(SEARCH_HEADER))))) redirect('/start')

  return children
}
