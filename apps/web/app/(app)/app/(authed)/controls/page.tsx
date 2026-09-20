import type { Metadata, Viewport } from 'next'
import { orbitWeekly } from '@inflozo/library'
import { imagePool, linkResources, queryRows, referenceSwatches, samples } from '@/lib/controls-review'
import { Review } from './review'

/* ────────────────────────────────────────────────────────────────── the review surface

   Story 4.5's controls, CHECKED BY LOOKING: a sample section on the left and its panel on the right, every
   change painted the moment it is made — open it beside `Editor Sidebar Kit.dc.html`, `S4 Editor.dc.html`
   S4c, `B Missing Surfaces.dc.html` B2, `P0-0` and `P0-3`. The panel is `components/controls/`, which
   Epic 5 mounts in the editor; the sample is `packages/library/fixtures/controls/`, assembled and
   validated here on every request, loudly.

   STORY 5.11 (R-158) MAKES IT A REAL RING. The shipped library holds ONE design per category, so the editor's own
   arrows have nowhere to go and the whole carry / park / default claim would be asserted vacuously — this page
   gets all THREE fixture designs instead, so the owner and `run-verify-controls.cjs` exercise the rule on
   production (R-82): press ▶, watch the section change shape, watch the typed words carry, press ◀ and watch a
   setting only the design you left had come back exactly.

   Sibling of `/kit` and `/style-guide` in every respect: internal, noindex, behind the session guard, and
   dynamic, because the guard needs the cookie store. Nothing on it is saved. */

export const metadata: Metadata = {
  title: 'Controls review — Inflozo',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function ControlsReview() {
  const designs = samples()

  // No `main` here: the shell owns the page's one `<main>` (kit/page.tsx). The heading sits over the canvas
  // pane; the panel docks to the right edge, and neither moves the window (review.tsx).
  return (
    <Review
      designs={designs}
      swatches={referenceSwatches()}
      // every design's queries, by design id — two of the three declare none, which is itself part of the proof
      rows={Object.fromEntries(designs.map((e) => [e.id, queryRows(e)]))}
      links={linkResources()}
      pool={imagePool()}
      timezone={orbitWeekly.site().timezone}
    >
      <header className="flex max-w-[820px] flex-col gap-[6px]">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.02em] text-ink">Controls review</h1>
        <p className="font-mono text-control-label text-ink-soft">
          the panel Epic 5 mounts, beside the section it edits, and Story 5.11&apos;s design ring over it ·
          nothing here is saved — a reload brings back the sample
        </p>
      </header>
    </Review>
  )
}
