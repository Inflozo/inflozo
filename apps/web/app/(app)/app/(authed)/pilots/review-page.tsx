// THE PILOTS REVIEW, as one server component with two mounts (Story 7.4): the app's `/pilots`, behind the session guard,
// and `/app/harness/pilots`, the keyboard gate's, which hands the harness's own canvas route — so the two can never be
// handed different props, and `pnpm keyboard` opens the page with no database (DW-331's browser proof).

import { orbitWeekly } from '@inflozo/library'
import { PRESETS } from '@inflozo/library/packs'
import { imagePool, linkResources, referenceSwatches } from '@/lib/controls-review'
import { carriesMemberVisibility, pilotRows, pilots } from '@/lib/pilots'
import { Review } from './review'

export function PilotsPage({ canvasSrc }: { canvasSrc?: string }) {
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
      canvasSrc={canvasSrc}
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
