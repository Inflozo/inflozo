'use client'

import { ring } from '@/components/kit/greyed'
import { ChevronLeft, PageLines } from '@/components/kit/icons'
import { BACK_TO_PAGE_ONE, PAGE_TWO_WORDS } from '@/lib/page-two'

/* ─────────────────────────────────────────── Story 5.16 — D5d's pill (`D5 Canvas Markers and Template Switcher.dc.html`
   `:388-396`), at the top centre of the canvas ground while page 2 is shown (FR-D21, `EXPERIENCE.md:165`).

   THE CANVAS PILL'S RECIPE (`kit/canvas-pill.tsx`, DESIGN.md § `canvas-pill`): an ink ground at the thumb radius with 4px
   of padding, 30px targets and no coral — nothing on it is live. D5d draws its own gap (4px) and its own shadow, which
   is the modal's .25 exactly (`shadow-modal`). Two parts, and only the second is pressed:
     - "Page 2" as WORDS, on white at .08 — the page glyph at 13 and a 1.8 stroke in the frame's warm grey, the words at
       12.5/600 in white. It says where the canvas is; it is not a control, so it is not a button.
     - Back to page 1: a 30px button, the 12px chevron at a 2 stroke, 12.5px words in the same warm grey, hovering to
       white at .08. The frame's grey IS the surface at about .66 over ink — `tokens.test.ts` forbids a colour literal
       here, comments included, so it is written as that.
   Both are named by their own words (WCAG 2.5.3): no `aria-label` over visible text.

   WHERE IT SITS is `editor.tsx`'s: 4px from the ground's top — R-138's inset for the viewport chip, not D5d's 16px —
   with the ground's top padding grown under it on page 2, so it never covers the page card. */

export function PageTwoPill({ onBack }: { onBack: () => void }) {
  return (
    <div
      id="editor-page-two"
      data-page-two-pill
      className="absolute left-1/2 top-1 z-10 flex -translate-x-1/2 items-center gap-1 rounded-thumb bg-ink p-1 shadow-modal"
    >
      <span className="inline-flex h-[30px] items-center gap-2 rounded-[7px] bg-surface/8 px-3">
        <PageLines size={13} className="shrink-0 text-surface/66" />
        <span className="text-[12.5px] font-semibold text-surface">{PAGE_TWO_WORDS}</span>
      </span>
      <button
        type="button"
        onClick={onBack}
        className={`inline-flex h-[30px] items-center gap-[7px] rounded-[7px] px-3 text-[12.5px] text-surface/66 transition-colors hover:bg-surface/8 ${ring}`}
      >
        <ChevronLeft size={12} strokeWidth={2} className="shrink-0" />
        {BACK_TO_PAGE_ONE}
      </button>
    </div>
  )
}
