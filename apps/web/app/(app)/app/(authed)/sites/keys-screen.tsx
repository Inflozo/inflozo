import { notFound, redirect } from 'next/navigation'
import { hostOf } from '@/lib/connect-rule'
import { supabaseServer } from '@/lib/supabase/server'
import { credentialsOf } from '@/server/ghost-admin'
import { KeysPanel } from './keys-panel'

/* ───────── FR-C8's MANAGE KEYS: THE READS, ONCE, FOR BOTH PLACES THE PANEL APPEARS.

   THE OWNER'S TEST FINDING 1 (2026-09-10) IS WHY THIS FILE EXISTS. He asked for the panel as a
   popup over the Sites list rather than a screen you leave the list for, and the Dev pass had
   chosen the screen because the panel draws the Admin key's public id half — which lives in
   `private.site_credentials` and is reachable only through `server/ghost-admin` (AD-10, §21j), so
   a dialog RENDERED BY THE LIST would mean one pooler round trip per card on the busiest route in
   the app. That cost is still real; the conclusion was not. A popup does not have to be rendered
   by the list: the list renders THIS component inside a `<dialog>` only when its `?manage=`
   parameter is there, so the read is still taken once and still only when somebody opens the
   panel — with no `?manage=` there is nothing here to render at all. `sites/keys/page.tsx` renders
   the same component as a full page — a typed URL, a modified click, a refresh and a scripts-off
   browser all land there — and both are this file, so the window and the page can never disagree.
   (It was an INTERCEPTED ROUTE for one day, and `panel-modal.tsx` records what that cost.)

   THE SITE IS READ UNDER THE CALLER'S OWN SESSION, so RLS is what decides whether this screen
   exists at all — a site id belonging to somebody else is `notFound()` and discloses nothing,
   which is the same answer the three actions give a forged post. THE THREE-WAY SPLIT IS
   `sites/disconnect/page.tsx`'s, and it is copied rather than re-derived because re-deriving it is
   how it got lost: `22P02` is a malformed id and not a failed read (`?site=` is typed by whoever
   holds the URL); a READ THAT FAILED is not a stranger's row and must not tell a customer his own
   site is gone; and an ALREADY-DISCONNECTED record redirects to `/sites`, which is what the
   actions do with the same state.

   THE CREDENTIAL ROW COMES THROUGH THE CHOKEPOINT, and only its non-secret column does
   (`credentialsOf`): the Admin key's id half, which is what the Admin row masks with. No
   decryption happens on this path and none can — `decrypt()` is private to that module and is
   called by `call()` alone. A pooler that will not answer is caught below rather than taking the
   screen down: the value is a mask and nothing more. */

export type KeysSearchParams = {
  /** The FULL PAGE's own — `/sites/keys?site=…`. */
  site?: string | string[]
  /** THE POPUP'S — `/sites?manage=…`, a parameter on the Sites list and not a route of its own
      (`keysPopupPath`). The list page hands its own search params straight in, so the two chromes
      differ by which key holds the site id and by nothing else. */
  manage?: string | string[]
  keys?: string | string[]
  status?: string | string[]
  test?: string | string[]
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

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export async function KeysScreen({
  searchParams,
  popup = false,
}: {
  searchParams: Promise<KeysSearchParams>
  /** TRUE when this is the window over the Sites list. It picks the parameter the site id is read
      from and travels into every form so the actions answer onto this chrome (`keysBase`). */
  popup?: boolean
}) {
  const { site, manage, keys, status, test } = await searchParams
  const siteId = first(popup ? manage : site)
  /* A SITE THIS SCREEN CANNOT DRAW IS THE FULL PAGE'S 404 AND THE WINDOW'S "no window", and that
     difference matters now that the window is rendered by the Sites list: `notFound()` inside the
     list's own `<Suspense>` takes THE LIST to the not-found page, so a stale or forged `?manage=`
     would cost the customer the screen he was looking at. Going back to `/sites` says exactly what
     404 says — nothing at all about whether the row exists — and leaves him on his list. It is
     already what an ALREADY-DISCONNECTED record does below, in both chromes. */
  /* A `function` DECLARATION AND NOT A `const` ARROW, which is `keysRedirect`'s own lesson one
     file over: TypeScript only lets a never-returning CALL end a code path when the callee is
     declared that way, so the arrow form left every read below "possibly null". */
  function gone(): never {
    if (popup) redirect('/sites')
    notFound()
  }
  if (!siteId) gone()

  const supabase = await supabaseServer()
  const { data: row, error } = await supabase
    .from('sites')
    .select('id, url, title, content_key, credentials_present, site_settings, disconnected_at')
    .eq('id', siteId)
    .maybeSingle<Row>()
  if (error?.code === '22P02') gone()
  if (error) {
    console.error('sites/keys: read failed', { code: error.code })
    // IN THE WINDOW THE THROW WOULD COST THE LIST: the popup sits inside the Sites page's own
    // `<Suspense>` with no error boundary between it and `app/error.tsx`, so a transient read
    // failure would replace the whole list with "something went wrong" over a site that is fine.
    // The window closes instead and the ⋯ row is still there to press again — `brand-screen.tsx`'s
    // `readFailed` takes the same line (review, 2026-09-10). The full page keeps the error screen.
    if (popup) redirect('/sites')
    throw new Error('sites/keys: site read failed')
  }
  if (!row) gone()
  if (row.disconnected_at) redirect('/sites')

  // The user id is needed to scope the credential read, and the row above already proves the site
  // is this caller's — RLS answered nothing otherwise. `credentialsOf` carries its own `user_id`
  // clause as well, the same floor `store()` and `remove()` have: ownership beside the read.
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) gone()
  // A DECORATIVE READ MAY NOT TAKE THE SCREEN DOWN. `credentialsOf` goes through the pooler, and
  // `withStore` turns a pooler that will not answer into a thrown `credential_store_unavailable` —
  // which, uncaught, made the whole Manage keys page the error boundary over a value that draws
  // the Admin row's MASK and nothing else (review, 2026-09-09). Without it the row still says
  // **Added** from `credentials_present`; it just shows no first characters.
  const held = await credentialsOf({ siteId: row.id, userId: auth.user.id }).catch((thrown) => {
    console.error('sites/keys: credential read failed', {
      name: (thrown as { code?: string; name?: string })?.code ?? (thrown as { name?: string })?.name,
    })
    return { adminKeyId: null }
  })

  const present = row.credentials_present ?? {}

  return (
    <KeysPanel
      site={{
        id: row.id,
        name: row.title || hostOf(row.url),
        publicUrl: row.site_settings?.public_url || row.url,
        present: {
          admin: present.admin === true,
          content: present.content === true,
          staff: present.staff === true,
        },
        adminKeyId: held.adminKeyId,
        contentKey: row.content_key,
      }}
      refused={first(keys) ?? null}
      /* DIGITS OR NOTHING. `?status=` is typed by whoever holds the URL and its one use is inside
         a sentence the customer reads, so it is validated here rather than trusted — the same rule
         `?keys=` follows by being a lookup key and never a sentence. */
      status={/^\d{3}$/.test(first(status) ?? '') ? (first(status) as string) : null}
      tested={first(test) ?? null}
      popup={popup}
    />
  )
}
