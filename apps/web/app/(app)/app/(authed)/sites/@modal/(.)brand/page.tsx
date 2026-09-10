import { BrandScreen, type BrandSearchParams } from '../../brand-screen'

/* ───────── S2c's BRAND OFFER AS A POPUP OVER THE SITES LIST — the owner's ask of 2026-09-10:
   "make the 'Nice site. Want to keep the vibe?' as a popup instead of as a page."

   `(.)brand` INTERCEPTS `/sites/brand` ON A SOFT NAVIGATION AND ON NOTHING ELSE. The Sites card's
   offer is a `next/link` (`site-notices.tsx`), so its click lands here and the panel is drawn in a
   `<dialog>` over the list. Everything else gets `sites/brand/page.tsx` as a full page: a typed
   address, a modified click, a refresh, a shared link, a scripts-off browser — and `connectSite`'s
   own redirect, because a server action's `redirect()` is not intercepted at all (executed;
   `panel-modal.tsx` records it beside the measurement it belongs to).

   THE PANEL IS `brand-screen.tsx`, THE SAME COMPONENT THE FULL PAGE RENDERS, so the popup and the
   page cannot disagree about what the customer was offered or which project would wear it. */

export default async function InterceptedBrand({
  searchParams,
}: {
  searchParams: Promise<BrandSearchParams>
}) {
  return <BrandScreen searchParams={searchParams} />
}
