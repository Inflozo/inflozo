import type { Metadata, Viewport } from 'next'
import { orbitWeekly } from '@inflozo/library'
import { PRESETS } from '@inflozo/library/packs'
import { imagePool, linkResources, referenceSwatches } from '@/lib/controls-review'
import { carriesMemberVisibility, pilotRows, pilots } from '@/lib/pilots'
import { Review } from './review'

/* ────────────────────────────────────────────────────────────────── the pilots review

   The library's designs — Story 4.10's pilots first — CHECKED BY LOOKING: each on the canvas beside its panel, switched in the canvas
   chrome between light and dark, desktop, tablet and phone, and the visitor it is viewed as — so each can be held
   up against its frame in the design export. Since Story 6.2, in any of the twelve Style Packs too (the Pack menu):
   the epic's exit, every pack on the pilots in both modes, for the owner's eye. It is `/controls`' workspace fed the library's own designs, which are
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
      // DW-171: Show to on exactly the designs the editor draws it for — R-124's row, read off R-113's register here,
      // because `lib/pilots.ts` reads the disk and `review.tsx` is a client component; the render matrix reads the same rule
      memberVisibility={Object.fromEntries(entries.map((e) => [e.id, carriesMemberVisibility(e.id)]))}
      // Story 5.6: per mode, because this page HAS a mode toggle — drawn from `light` alone the Background-role dots
      // said the light ground was in force while the canvas beside them was painted dark. Story 6.2: and per PACK, because
      // it has a Pack menu — the dots follow the preset the canvas is painted in
      packs={PRESETS.map((p) => ({ id: p.id, name: p.name }))}
      packSwatches={Object.fromEntries(PRESETS.map((p) => [p.id, { light: referenceSwatches('light', p.id), dark: referenceSwatches('dark', p.id) }]))}
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
