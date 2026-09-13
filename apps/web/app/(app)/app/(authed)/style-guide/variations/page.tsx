import type { Metadata, Viewport } from 'next'
import { orbitWeekly } from '@inflozo/library'
import { PREVIEW_MAJOR } from '@/lib/style-guide'

/* The variation sheet (Story 4.4, Q1 ruled): every class-affecting variant FR-H3 enumerates, labelled,
   from the same recorder run as the readable article. Nobody reads it as an article — it is what
   FR-Q7's card panels preview against and what 4.11 compares. Same shape and same reasons as
   `../page.tsx`. */

export const metadata: Metadata = {
  title: 'Variation sheet — Inflozo',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function VariationSheet() {
  const capture = orbitWeekly.recording(PREVIEW_MAJOR, 'capture') as { ghost_version: string; captured: string }
  return (
    <div className="flex flex-col gap-5 bg-paper py-8 tablet:py-12">
      <header className="flex max-w-[820px] flex-col gap-[6px] px-4 tablet:px-12">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.02em] text-ink">Variation sheet</h1>
        <p className="font-mono text-control-label text-ink-soft">
          {orbitWeekly.variants().length} variants · Ghost {capture.ghost_version} recording of {capture.captured} ·{' '}
          <a className="text-ink underline" href="../style-guide">
            back to the article
          </a>
        </p>
      </header>
      <iframe
        src="frame?view=variations"
        title="Every card variant, labelled"
        className="block min-h-[80vh] w-full border-0 bg-surface"
      />
    </div>
  )
}
