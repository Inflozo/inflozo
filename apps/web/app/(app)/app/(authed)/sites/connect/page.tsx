import type { Metadata } from 'next'
import { stepOf } from '@/lib/connect-rule'
import { ConnectWizard } from '../connect-wizard'

/* ───────── S2 Onboarding.dc.html S2b·1 and S2b·2, on their own route.

   THIS ROUTE EXISTS SO THE "Connect site" LINK HAS A DESTINATION. On S11a the opener is an
   `<a href="/sites/connect">` whose click JavaScript intercepts into S11b's sheet; without
   JavaScript the click is a navigation, and this is where it lands — the same two steps, one
   `?step=` apart, posting the same server action.

   "Back" from step 1 here is Sites, which is where the customer came from. On `/sites` itself,
   with nothing connected yet, the handshake IS the page and its Back is Projects. */

export const metadata: Metadata = {
  title: 'Connect a Ghost site · Inflozo',
  robots: { index: false, follow: false },
}

export default async function Connect({
  searchParams,
}: {
  searchParams: Promise<{ step?: string | string[] }>
}) {
  const { step } = await searchParams
  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
      <ConnectWizard step={stepOf(step)} backHref="/sites" />
    </div>
  )
}
