import type { ReactNode } from 'react'
import { headers } from 'next/headers'

/**
 * THE NONCE IS READ HERE AND NOWHERE ABOVE HERE.
 *
 * MEASUREMENTS §18, executed on Vercel Pro: setting the CSP header in `proxy.ts` is free, but
 * READING the nonce makes the page dynamic. Every `/app/*` page is per-user anyway, so this
 * layout pays that cost for all of them; the ROOT layout must never read it, because marketing
 * shares that root and has to stay prerendered (`x-vercel-cache: PRERENDER`, §18b).
 *
 * The value is deliberately not rendered anywhere, which is why it is discarded here rather
 * than passed down: Next stamps its own scripts from the `content-security-policy` REQUEST
 * header `proxy.ts` sets, nothing of ours is inline, and a nonce written into the DOM is one an
 * injected fragment can read back. The READ is the mechanism; the value is not the point.
 *
 * §18 also names the failure mode this cannot catch: a nonce that does not reach the page fails
 * SILENTLY, because the policy still looks correct while `'strict-dynamic'` blocks every script.
 * A throw here would fire during `next build`'s prerender pass, where there is no request and no
 * header (executed — it failed the build), so the control lives in `## Verification` instead:
 * the header's nonce and the delivered HTML's must be one value, checked on the deployed site.
 */
/**
 * And the same thing said out loud, because Next 16 does not infer it from the read alone:
 * `next build` still ATTEMPTS a prerender of every `/app/*` route, runs this whole subtree with
 * no request behind it, and fails on the first thing that needs one — executed twice here, once
 * on the missing nonce and once on `SUPABASE_URL`, which CI's `check` job does not carry because
 * only `vercel build` pulls the environment. §18's route table is unchanged either way: app
 * routes are `ƒ`, marketing stays `○`, and marketing never reaches this file.
 */
export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce')
  void nonce
  return children
}
