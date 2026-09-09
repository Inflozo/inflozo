import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { buttonClasses } from '@/components/kit/button'
import { sheetBox } from '@/components/kit/dialog'
import { hostOf, KEYS } from '@/lib/connect-rule'
import { supabaseServer } from '@/lib/supabase/server'
import { credentialsOf } from '@/server/ghost-admin'
import { KeysPanel } from '../keys-panel'

/* ───────── FR-C8's MANAGE KEYS, on its own route — S11d's chrome around B20's three rows.

   THIS ROUTE IS THE SURFACE, not a fallback for it. S11a's ⋯ "Manage API keys" is an
   `<a href="/sites/keys?site=…">` that navigates, and `site-menu.tsx` records why it is not
   intercepted into a `<dialog>` the way Disconnect is: this screen draws the Admin key's public id
   half, which lives in `private.site_credentials` and is reachable only through
   `server/ghost-admin` (AD-10, §21j) — so a dialog rendered on the Sites list would mean a pooler
   read per card on the busiest route in the app, or a dialog whose Admin row disagreed with this
   page's. One surface instead.

   THE SITE IS READ UNDER THE CALLER'S OWN SESSION, so RLS is what decides whether this page exists
   at all — a site id belonging to somebody else is `notFound()` and discloses nothing, which is the
   same answer the three actions give a forged post. THE THREE-WAY SPLIT IS
   `sites/disconnect/page.tsx`'s, and it is copied rather than re-derived because re-deriving it is
   how it got lost: `22P02` is a malformed id and not a failed read (`?site=` is typed by whoever
   holds the URL); a READ THAT FAILED is not a stranger's row and must not tell a customer his own
   site is gone; and an ALREADY-DISCONNECTED record redirects to `/sites`, which is what the actions
   do with the same state.

   THE CREDENTIAL ROW COMES THROUGH THE CHOKEPOINT, and only its non-secret columns do
   (`credentialsOf`): the Admin key's id half and the two rotation stamps. No decryption happens on
   this path and none can — `decrypt()` is private to that module and is called by `call()` alone.

   NO `loading.tsx`, and that is deliberate rather than forgotten (R-98): nothing soft-navigates
   here. The ⋯ row is a PLAIN anchor and not a `<Link>`, so every way in — a click, a modified
   click, a typed URL, a scripts-off browser — is a document load with the browser's own progress
   on it. `sites/disconnect` and `sites/connect` carry the same reason, and `busy.test.ts` carries
   all three. */

export const metadata: Metadata = {
  title: 'API keys · Inflozo',
  robots: { index: false, follow: false },
}

type Row = {
  id: string
  url: string
  title: string | null
  content_key: string | null
  credentials_present: { admin?: boolean; content?: boolean; staff?: boolean } | null
  site_settings: { public_url?: string } | null
  disconnected_at: string | null
}

export default async function Keys({
  searchParams,
}: {
  searchParams: Promise<{ site?: string | string[]; keys?: string | string[]; test?: string | string[] }>
}) {
  const { site, keys, test } = await searchParams
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
  const siteId = first(site)
  if (!siteId) notFound()

  const supabase = await supabaseServer()
  const { data: row, error } = await supabase
    .from('sites')
    .select('id, url, title, content_key, credentials_present, site_settings, disconnected_at')
    .eq('id', siteId)
    .maybeSingle<Row>()
  if (error?.code === '22P02') notFound()
  if (error) {
    console.error('sites/keys: read failed', { code: error.code })
    throw new Error('sites/keys: site read failed')
  }
  if (!row) notFound()
  if (row.disconnected_at) redirect('/sites')

  // The user id is needed to scope the credential read, and the row above already proves the site
  // is this caller's — RLS answered nothing otherwise. `credentialsOf` carries its own `user_id`
  // clause as well, the same floor `store()` and `remove()` have: ownership beside the read.
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) notFound()
  const held = await credentialsOf({ siteId: row.id, userId: auth.user.id })

  const present = row.credentials_present ?? {}
  const publicUrl = row.site_settings?.public_url || row.url

  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
      {/* `sheetBox` AND NOT A COPY OF IT — the review of 2026-09-09 found `sites/disconnect` had
          hand-copied these tokens and already diverged on `max-w`. `flex` is this page's own. */}
      <div className={`flex flex-col gap-5 ${sheetBox}`}>
        <KeysPanel
          site={{
            id: row.id,
            name: row.title || hostOf(row.url),
            publicUrl,
            present: {
              admin: present.admin === true,
              content: present.content === true,
              staff: present.staff === true,
            },
            adminKeyId: held.adminKeyId,
            contentKey: row.content_key,
          }}
          refused={first(keys) ?? null}
          tested={first(test) ?? null}
          cancel={
            <Link href="/sites" className={buttonClasses('secondary', 36)}>
              {KEYS.cancel}
            </Link>
          }
        />
      </div>
    </div>
  )
}
