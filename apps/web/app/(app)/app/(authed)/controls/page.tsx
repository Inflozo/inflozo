import type { Metadata, Viewport } from 'next'
import { orbitWeekly } from '@inflozo/library'
import { imagePool, linkResources, queryRows, referenceSwatches, sample } from '@/lib/controls-review'
import { Review } from './review'

/* ────────────────────────────────────────────────────────────────── the review surface

   Story 4.5's controls, CHECKED BY LOOKING: a sample section on the left and its panel on the right, every
   change painted the moment it is made — open it beside `Editor Sidebar Kit.dc.html`, `S4 Editor.dc.html`
   S4c, `B Missing Surfaces.dc.html` B2, `P0-0` and `P0-3`. The panel is `components/controls/`, which
   Epic 5 mounts in the editor; the sample is `packages/library/fixtures/controls/`, assembled and
   validated here on every request, loudly.

   Sibling of `/kit` and `/style-guide` in every respect: internal, noindex, behind the session guard, and
   dynamic, because the guard needs the cookie store. Nothing on it is saved. */

export const metadata: Metadata = {
  title: 'Controls review — Inflozo',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function ControlsReview() {
  const entry = sample()

  // No `main` here: the shell owns the page's one `<main>` (kit/page.tsx). The heading scrolls with the
  // canvas; the panel docks to the right edge (review.tsx).
  return (
    <Review
      entry={entry}
      swatches={referenceSwatches()}
      rows={queryRows(entry)}
      links={linkResources()}
      pool={imagePool()}
      timezone={orbitWeekly.site().timezone}
    >
      <header className="flex max-w-[820px] flex-col gap-[6px]">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.02em] text-ink">Controls review</h1>
        <p className="font-mono text-control-label text-ink-soft">
          {entry.name} · the panel Epic 5 mounts, beside the section it edits · nothing here is saved — a reload
          brings back the sample
        </p>
      </header>
    </Review>
  )
}
