import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { hasBrand } from '@/lib/probe-rule'
import { SEARCH_HEADER } from '@/routing'
import { brandSiteOf } from '../brand-screen'

/**
 * DW-67, STORY 5.24b — THE BRAND OFFER'S 404 IS DECIDED ABOVE ITS SKELETON, SO IT IS A REAL 404.
 *
 * `loading.tsx` beside this is a Suspense boundary (R-98), so a `notFound()` from the page streamed the not-found page
 * after the status line had already gone out as `200`. A layout sits above that boundary — `projects/[id]/layout.tsx` is
 * the precedent, executed — and is not given `searchParams`, so it reads the query string `proxy.ts` hands every request
 * as `SEARCH_HEADER` (`(dashboard)/layout.tsx` does the same).
 *
 * ONLY WHEN THERE IS A `site` TO JUDGE. A server action's `redirect()` onto this route is rendered by Next re-fetching it
 * with the POST's OWN headers forwarded (`next/dist/server/app-render/action-handler.js`, `createRedirectRenderResult`
 * and `getForwardedHeaders`), so on that path the header can carry the query string of the page the press came from —
 * `connectSite` lands here from `/sites/connect?step=keys`, whose search names no site. With no `site` this does nothing
 * and `BrandScreen` below keeps its own guard, which is also the only guard the popup (`/sites?brand=…`, rendered by the
 * list, never through here) has ever had. Every connect in `run-verify-ghost-admin.py` still landing on S2c is the
 * positive control for that reading.
 *
 * A FAILED READ IS LEFT TO THE SCREEN, which turns it into the error page rather than a claim that the site is gone
 * (`readFailed`); a malformed id is no row at all (`22P02`), as it is there.
 */
export default async function BrandLayout({ children }: { children: ReactNode }) {
  const siteId = new URLSearchParams((await headers()).get(SEARCH_HEADER) ?? '').get('site')
  // `?site=` with nothing after it is still a site named — and no row (review, 2026-09-29): left to the
  // screen, it would have been the 200-then-not-found this layout exists to prevent.
  if (siteId !== null) {
    if (!siteId.trim()) notFound()
    const { data, error } = await brandSiteOf(siteId)
    if (error?.code === '22P02' || (!error && !hasBrand(data?.site_settings?.brand))) notFound()
  }
  return children
}
