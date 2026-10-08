import { notFound } from 'next/navigation'
import type { Metadata, Viewport } from 'next'
import { PilotsPage } from '@/app/(app)/app/(authed)/pilots/review-page'
import { harnessCanvasSrc } from '@/lib/canvas'
import { HARNESS } from '@/lib/harness'

/** Story 7.4 (DW-331) — `/pilots`, mounted for the keyboard gate alone, so `pnpm keyboard` draws a Background set in Dark
 *  on the pilots review with no database: the same `PilotsPage` the app serves, handed the harness's own canvas route
 *  (`harnessCanvasSrc`) instead of `/canvas`, whose session guard is never the thing a harness weakens. Outside
 *  `(authed)`, as `harness/brand` is; it answers 404 unless `INFLOZO_HARNESS=1` (`app-routes.test.ts`'s HARNESS_ONLY). */
export const metadata: Metadata = { title: 'Pilots harness — Inflozo', robots: { index: false, follow: false } }

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function PilotsHarness() {
  if (!HARNESS) notFound()
  return <PilotsPage canvasSrc={harnessCanvasSrc()} />
}
