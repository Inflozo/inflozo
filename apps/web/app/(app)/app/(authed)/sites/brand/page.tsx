import type { Metadata } from 'next'
import { panelBox } from '@/components/kit/dialog'
import { BrandScreen, type BrandSearchParams } from '../brand-screen'

/* ───────── FR-C4's BRAND OFFER as the FULL SCREEN S2 draws — and since the owner asked for a
   popup (2026-09-10) it is no longer the only chrome, only the one that always works.

   THIS IS WHERE `connectSite` STILL LANDS, and that is measured rather than chosen: a server
   action's `redirect()` is NOT intercepted — executed on a throwaway control on 2026-09-10 (`panel-modal.tsx` carries it), where
   the same address reached by `router.push` opened the popup and the action's redirect landed on
   the full page with no dialog and no list behind it. Which suits the moment: straight after a
   connect this is S2's own full-screen onboarding beat, not an aside over a list. Every other way
   here is the same — a typed URL, a modified click, a refresh, a shared link, a scripts-off
   browser — and the Sites card's offer link, which IS a soft navigation, gets the popup.

   `brand-screen.tsx` is the component both chromes render, so there is one panel and one pair of
   reads whichever door was used.

   IT KEEPS ITS `loading.tsx`, and that is not a leftover: `connectSite`'s redirect is a client
   navigation, so this route IS soft-navigated to and R-98's skeleton is what the customer sees
   while the two reads run. */

export const metadata: Metadata = {
  title: 'Use your site’s brand · Inflozo',
  robots: { index: false, follow: false },
}

export default async function BrandOffer({ searchParams }: { searchParams: Promise<BrandSearchParams> }) {
  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
      {/* `panelBox` AND NOT A COPY OF IT — the same box the popup draws, so the two chromes differ
          in how they arrive and in nothing else. `flex` is this page's own: `panelSheet` says
          `open:flex`, which means nothing on a plain element. */}
      <div className={`flex flex-col ${panelBox}`}>
        <BrandScreen searchParams={searchParams} />
      </div>
    </div>
  )
}
