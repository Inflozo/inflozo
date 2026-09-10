import { KeysScreen, type KeysSearchParams } from '../../keys-screen'

/* ───────── S11e's MANAGE KEYS AS A POPUP OVER THE SITES LIST — the owner's test finding 1
   (2026-09-10): "Can we show the Manage Keys as a popup on the Sites screen rather than a separate
   screen for Manage API Keys."

   `(.)keys` INTERCEPTS `/sites/keys` ON A SOFT NAVIGATION AND ON NOTHING ELSE. S11a's ⋯ row keeps
   its `<a href="/sites/keys?site=…">` — that is an acceptance criterion and the whole JavaScript-off
   story — and `site-menu.tsx` turns the plain click into `router.push` of the same address. Every
   other way to that URL is a document load and Next serves `sites/keys/page.tsx` as a full page:
   a typed address, ⌘/ctrl/shift/alt/middle click, a refresh, a shared link, a browser with scripts
   off.

   THE PANEL IS `keys-screen.tsx`, THE SAME COMPONENT THE FULL PAGE RENDERS, so the popup and the
   page cannot disagree — and the credential read behind it (`private.site_credentials`, reachable
   only through the Admin chokepoint) is still taken once, and still only when somebody opens the
   panel. That is what makes this a popup WITHOUT a pooler round trip per card on the Sites list,
   which is the cost the Dev pass rejected the dialog for. */

export default async function InterceptedKeys({
  searchParams,
}: {
  searchParams: Promise<KeysSearchParams>
}) {
  return <KeysScreen searchParams={searchParams} popup />
}
