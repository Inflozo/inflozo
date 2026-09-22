'use client'

import type { Ref } from 'react'
import { DeviceSwitch } from '@/components/editor/device-switch'
import { ring } from '@/components/kit/greyed'
import { PreviewEye, PreviewEyeOff } from '@/components/kit/icons'
import type { Device } from '@/lib/device'
import { BACK, PREVIEW } from '@/lib/preview'

/* ─────────────────────────────────────────── Story 5.15 — B3's two doors (FR-D20, `B Missing Surfaces.dc.html` B3).

   B3a's PILL goes in and B3b's BAR comes back, and `P` does both — the three reach `editor.tsx`'s one pair of
   handlers, so a key and its button cannot drift (R-141). Both are named by their own WORDS, never an `aria-label`: a
   hand-written name over visible text fails WCAG 2.5.3 the moment the two are punctuated differently (Story 5.13's
   pill). The key caps are `aria-hidden` and `aria-keyshortcuts` says the key instead. No `aria-pressed`: the pill's
   name is its destination, as the mode toggle's is (Story 5.6's review).

   EVERY VALUE IS THE FRAME'S, and every colour the frame draws here IS a token's value exactly — `surface` and `line`
   for the pill, `line-strong` for its hover, `paper-sunk` and `ink-soft-aa` for the cap, `ink-soft` for the eye and
   `ink` for the bar — so nothing is rounded but B3b's shadow, whose .24 is `shadow-modal`'s .25 to within a hundredth
   (`tokens.test.ts` forbids a colour literal here, comments included). Built, not drawn: "Ship update" beside the pill
   is Story 7.18's "Ship it", and it lands to the pill's right. */

/** B3a `:645-649` — white, a 1px `line` border, the pill radius, `4px 10px 4px 8px` and a 7px gap: the eye at 13,
 *  "Preview" at 12/600 and the mono `P` cap at 10px. It hovers to `line-strong`. */
export function PreviewButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      id="editor-preview"
      type="button"
      aria-keyshortcuts="P"
      onClick={onPress}
      className={`inline-flex items-center gap-[7px] rounded-pill border border-line bg-surface py-1 pl-2 pr-[10px] text-control-label text-ink transition-colors hover:border-line-strong ${ring}`}
    >
      <PreviewEye size={13} className="shrink-0 text-ink-soft" />
      <span className="font-semibold">{PREVIEW}</span>
      <span aria-hidden className="rounded-[4px] bg-paper-sunk px-[5px] py-px font-mono text-[10px] text-ink-soft-aa">
        P
      </span>
    </button>
  )
}

/** B3b `:700-710` — the one piece of chrome Preview keeps: ink, the pill radius, 5px padding and a 2px gap, holding
 *  Back to editing with its `esc` cap, a divider and the three devices, the current one lit.
 *
 *  18px FROM THE WINDOW'S BOTTOM-LEFT, not B3b's `left:112px`, which is a place inside a 700px drawing: the left edge
 *  keeps the bar beside a phone-sized page rather than over it, and B3b's caption names 390 as "the main reason to be
 *  in here". */
export function PreviewBar({ device, onDevice, onBack, back }: { device: Device; onDevice: (next: Device) => void; onBack: () => void; back: Ref<HTMLButtonElement> }) {
  return (
    <div
      id="editor-preview-bar"
      role="toolbar"
      aria-label={PREVIEW}
      className="fixed bottom-[18px] left-[18px] z-50 flex items-center gap-[2px] rounded-pill bg-ink p-[5px] shadow-modal"
    >
      {/* `:701-705` — 34px high, a 20px radius, `0 15px`, the 14px eye with its slash, 13/600 white words and the
          mono `esc` cap at 10.5px on white at .16 */}
      <button
        ref={back}
        type="button"
        aria-keyshortcuts="Escape"
        onClick={onBack}
        className={`flex h-[34px] items-center gap-2 rounded-[20px] px-[15px] text-[13px] font-semibold text-surface transition-colors hover:bg-surface/12 ${ring}`}
      >
        <PreviewEyeOff size={14} className="shrink-0" />
        {BACK}
        <span aria-hidden className="rounded-[4px] bg-surface/16 px-[6px] py-[2px] font-mono text-[10.5px] font-normal">
          esc
        </span>
      </button>
      {/* `:706` */}
      <span aria-hidden className="mx-1 h-5 w-px bg-surface/18" />
      <DeviceSwitch id="editor-preview-device" tone="ink" device={device} onDevice={onDevice} />
    </div>
  )
}
