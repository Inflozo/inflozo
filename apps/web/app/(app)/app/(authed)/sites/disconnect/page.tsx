import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { buttonClasses } from '@/components/kit/button'
import { sheetBox } from '@/components/kit/dialog'
import { hostOf, DISCONNECT } from '@/lib/connect-rule'
import { supabaseServer } from '@/lib/supabase/server'
import { DisconnectConfirm } from '../disconnect-confirm'

/* ───────── S11a's DISCONNECT CONFIRM, on its own route.

   THIS ROUTE EXISTS SO THE ⋯ MENU'S "Disconnect" ROW HAS A DESTINATION — the same reason
   `sites/connect/page.tsx` exists for "Connect site", and its comment is worth reading beside this
   one. On the card the row is an `<a href="/sites/disconnect?site=…">` whose click JavaScript
   intercepts into the `<dialog>`; without JavaScript the click is a navigation and it lands here,
   showing the SAME confirm — one component, `disconnect-confirm.tsx` — posting the same server
   action. That is what makes "the ⋯ menu and the confirm both work with JavaScript off" true rather
   than asserted; the harness's `disconnect-js-off` step reads this route's own served markup.

   THE SITE IS READ UNDER THE CALLER'S OWN SESSION, so RLS is what decides whether this page exists
   at all: a site id belonging to somebody else is `notFound()` and discloses nothing — the same
   answer `disconnectSite` gives the forged post. An ALREADY-DISCONNECTED one is not that answer;
   it redirects to `/sites`, which is what the action does with the same state. Nothing here writes.

   NO `loading.tsx`, and that is deliberate rather than forgotten (R-98): with JavaScript the link
   never navigates, so there is no soft navigation to draw a skeleton for — exactly as
   `sites/connect/` has none, for the same reason. */

export const metadata: Metadata = {
  title: 'Disconnect a site · Inflozo',
  robots: { index: false, follow: false },
}

export default async function Disconnect({
  searchParams,
}: {
  searchParams: Promise<{ site?: string | string[] }>
}) {
  const { site } = await searchParams
  const siteId = Array.isArray(site) ? site[0] : site
  if (!siteId) notFound()

  const supabase = await supabaseServer()
  const { data: row, error } = await supabase
    .from('sites')
    .select('id, url, title, disconnected_at')
    .eq('id', siteId)
    .maybeSingle<{ id: string; url: string; title: string | null; disconnected_at: string | null }>()
  // THE SAME THREE ANSWERS `sites/brand/page.tsx` GIVES, and for the same reasons — this route
  // gave all three as `notFound()` until the review of 2026-09-09.
  // A MALFORMED ID IS NOT A FAILED READ: `?site=` is typed by whoever holds the URL, and an id
  // that is not a uuid makes PostgREST answer `22P02` rather than an empty row.
  if (error?.code === '22P02') notFound()
  // A READ THAT FAILED IS NOT A STRANGER'S ROW — `disconnectSite`'s own rule, thirty lines away in
  // the action this page posts to, and `sites/page.tsx`'s "A FAILED READ IS NOT AN EMPTY ACCOUNT".
  // 404ing on it tells a customer his own site is gone, on the ONE path a scripts-off browser has,
  // and the error was thrown away entirely so nothing was logged either.
  if (error) {
    console.error('sites/disconnect: read failed', { code: error.code })
    throw new Error('sites/disconnect: site read failed')
  }
  if (!row) notFound()
  // ALREADY DISCONNECTED IS NOT NOT-FOUND, and this is the answer `disconnectSite` gives the same
  // state: "the second press has nothing to do and nothing to say about it." Press Disconnect here
  // with scripts off and then go Back and the browser re-requests this page — the customer would
  // have been told his own record had vanished (review, 2026-09-09).
  if (row.disconnected_at) redirect('/sites')

  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
      {/* `sheetBox` AND NOT A COPY OF IT: the dialog and this page draw the same confirm, so they
          draw the same box. Hand-copied here until the review of 2026-09-09, by which time the
          two had already diverged on `max-w`. `flex` is this page's own — the dialog's `sheet`
          says `open:flex`, which means nothing on a plain element. */}
      <div className={`flex flex-col gap-5 ${sheetBox}`}>
        <DisconnectConfirm
          id={row.id}
          name={row.title || hostOf(row.url)}
          cancel={
            <Link href="/sites" className={`${buttonClasses('secondary', 44)} w-full`}>
              {DISCONNECT.cancel}
            </Link>
          }
        />
      </div>
    </div>
  )
}
