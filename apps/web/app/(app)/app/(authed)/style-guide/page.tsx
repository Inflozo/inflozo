import type { Metadata, Viewport } from 'next'
import { orbitWeekly } from '@inflozo/library'
import { PREVIEW_MAJOR, cardScripts, simulatedCardsCss } from '@/lib/style-guide'

/* ────────────────────────────────────────────────────────────────── the review surface

   Story 4.4's three fixtures, CHECKED BY LOOKING: open it beside `C Post Body.dc.html` C4 and the
   article is C4's blocks in C4's order, at the theme's 720 measure rather than C4's 880 (that is the
   canvas's number — A25 Spec :105). Every byte of the body is Ghost's own, recorded on both majors by
   `tools/probe/record-cards.py`; this page shows T1's.

   Sibling of `kit/page.tsx` in every respect: internal, noindex, behind the session guard, no state
   and no client component. The fixture itself is a whole document in an iframe (`frame/route.ts`
   says why), so the post body inherits nothing from the app and Ghost's card CSS reaches nothing
   of the app's. It is dynamic, as `/kit` is, because the guard needs the cookie store. */

export const metadata: Metadata = {
  title: 'Style-guide fixture — Inflozo',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function StyleGuide() {
  const capture = orbitWeekly.recording(PREVIEW_MAJOR, 'capture') as { ghost_version: string; captured: string }
  const css = simulatedCardsCss()   // the header prints the chunk list; the frame route reads the CSS itself
  const js = cardScripts()

  // A `div`, not a `main`: the shell owns the page's one `<main>` (kit/page.tsx). The fixture's own
  // `<main><article class="gh-content">` lives inside the iframe's document, where the theme puts it.
  return (
    <div className="flex flex-col gap-5 bg-paper py-8 tablet:py-12">
      <header className="flex max-w-[820px] flex-col gap-[6px] px-4 tablet:px-12">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.02em] text-ink">Style-guide fixture</h1>
        <p className="font-mono text-control-label text-ink-soft">
          C4 · the canvas shows a fixture, not a real post · Ghost {capture.ghost_version} recording of{' '}
          {capture.captured} · theme stylesheet, then the simulated cards.min.css ({css.chunks.length} chunks),
          then the card scripts ({js.chunks.join(', ')})
        </p>
      </header>
      {/* Relative on purpose: `/style-guide` on the app host and `/app/style-guide` locally both
          resolve `style-guide/frame` to their own sibling route. */}
      <iframe
        src="style-guide/frame?view=article"
        title="The style-guide article, the comments fixture and the page fixture"
        className="block min-h-[80vh] w-full border-0 bg-surface"
      />
      <p className="px-4 font-mono text-control-label text-ink-soft tablet:px-12">
        <a className="text-ink underline" href="style-guide/variations">
          Open the variation sheet
        </a>{' '}
        — every version of every card, labelled, from the same recording.
      </p>
    </div>
  )
}
