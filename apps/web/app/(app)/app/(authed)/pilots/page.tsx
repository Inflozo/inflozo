import type { Metadata, Viewport } from 'next'
import { orbitWeekly } from '@inflozo/library'
import { imagePool, linkResources, referenceSwatches } from '@/lib/controls-review'
import { pilotRows, pilots } from '@/lib/pilots'
import { Review } from './review'

/* ────────────────────────────────────────────────────────────────── the pilots review

   The library's designs — Story 4.10's pilots first — CHECKED BY LOOKING: each on the canvas beside its panel, switched in the canvas
   chrome between light and dark, desktop, tablet and phone, and the visitor it is viewed as — so each can be held
   up against its frame in the design export. It is `/controls`' workspace fed the library's own designs, which are
   read off `packages/library/designs/` (the directory is the list), assembled and validated here on every request,
   loudly.

   Sibling of `/controls` in every respect: internal, noindex, behind the session guard, and dynamic, because the
   guard needs the cookie store. Nothing on it is saved. */

export const metadata: Metadata = {
  title: 'Pilots review — Inflozo',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function PilotsReview() {
  const entries = pilots()
  return (
    <Review
      entries={entries}
      rows={Object.fromEntries(entries.map((e) => [e.id, pilotRows(e)]))}
      // Story 5.6: per mode, because this page HAS a mode toggle — drawn from `light` alone the Background-role dots
      // said the light ground was in force while the canvas beside them was painted dark
      swatches={{ light: referenceSwatches('light'), dark: referenceSwatches('dark') }}
      links={linkResources()}
      pool={imagePool()}
      timezone={orbitWeekly.site().timezone}
    >
      <header className="flex max-w-[820px] flex-col gap-[6px]">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.02em] text-ink">Pilots review</h1>
        <p className="font-mono text-control-label text-ink-soft">
          every design in the library with Orbit Weekly&apos;s content · compare each with its drawing · nothing here is saved
        </p>
      </header>
    </Review>
  )
}
