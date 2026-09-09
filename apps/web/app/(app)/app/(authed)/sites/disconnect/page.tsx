import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buttonClasses } from '@/components/kit/button'
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
   at all: a site id belonging to somebody else, or one already disconnected, is `notFound()` and
   discloses nothing — the same answer `disconnectSite` gives the forged post. Nothing here writes.

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
  const { data: row } = await supabase
    .from('sites')
    .select('id, url, title, disconnected_at')
    .eq('id', siteId)
    .maybeSingle<{ id: string; url: string; title: string | null; disconnected_at: string | null }>()
  if (!row || row.disconnected_at) notFound()

  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
      <div className="flex w-[460px] max-w-full flex-col gap-5 rounded-lg bg-surface p-[26px] shadow-modal">
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
