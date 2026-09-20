'use client'

import { useLayoutEffect, useRef, type HTMLAttributes, type Ref, type WheelEvent } from 'react'
import { createPortal } from 'react-dom'
import { ring } from '@/components/kit/greyed'
import { ChevronLeft, ChevronRight, Copy, Grip, Refresh, Trash } from '@/components/kit/icons'
import { NEXT_WORDS, PREVIOUS_WORDS, SHUFFLE_WORDS } from '@/lib/ring'

/* S4b's QUICK-ACTION PILL (`S4 Editor.dc.html`:181, the `top:10px;right:10px` group) — Story 5.4.

   DRAWN AS S4b DRAWS IT: white on the editor's hairline, radius 24, the `md` shadow, 3px padding, 26px round targets
   that take the coral tint on hover, the two icons at 13px and the grip at 10×13.

   STORY 5.11 ADDS THE RING, AND R-159 SETTLES WHERE (`S4 Editor.dc.html:181` + `S6 Variant Shuffle.dc.html:67`
   govern this pill; `B Missing Surfaces.dc.html` B1b governs the AFFORDANCE — the counter and arrows riding on the
   section — and its ink pill, its top-left position and its `⋯` are not built, R-126 standing). The head of the
   pill is now **◀ · the mono `4 / 18` counter · ▶ · Shuffle**, then S4b's 1px DIVIDER, then the three controls
   Story 5.4 built: the divider separates *which design* from *this section*, which is why Shuffle sits before it.
   Shuffle is ICON-ONLY (the Kit's `Refresh`), its words carried as the accessible name and the hover title through
   `DESIGN.md:534-536`'s carve-out — the one R-132's mode button and R-136's moon badge already use, and the reason
   is the same: every other control in this pill is a 26px round icon target and a word would be the only text in it.

   ALL FOUR ARE ABSENT WHERE THE RING HOLDS ONE DESIGN (UX-DR3, R-118), exactly as Duplicate is absent on a
   site-wide row — there is nowhere to go, so there is nothing to press rather than something dead to press. A
   site-wide section's Duplicate is absent here too, exactly as it is in its Layers menu (FR-D5).

   STORY 5.10 ADDS S4b'S SECOND PRESSED CHILD, on the same hover and the same frame loop: the "+ Add section" pill,
   centred on the hovered section's BOTTOM boundary (`bottom:-13px;left:50%`) over the coral hairline the canvas
   document paints there (`lib/canvas-chrome.css`). It is pressed, so it is out here with the quick actions and for
   the same two reasons, and it pays the same two costs. One `boxOf()` per frame places both.

   OUTSIDE THE FRAME, because it is PRESSED (AD-21, as amended through 5.1–5.3), and for a second, mechanical reason:
   a React portal into the canvas document receives no React events at all — React's delegation is attached in the
   editor document. So it is a fixed element in the editor's own body, placed from the hovered section's rect through
   the frame's rect and the fit. Being outside costs it the two things P0-1's toolbar already pays:

     - it TRAILS THE COMPOSITOR during a scroll (Story 5.2's finding), so it hides from the first canvas `scroll` and
       is placed again 150 ms after the last — never a frame in which it sits away from its section;
     - the pointer crossing from the iframe onto it reaches the canvas document as a `pointerout` with a null
       `relatedTarget`, which would clear the hover it is anchored to. `editor.tsx` guards that by geometry;
     - AND A WHEEL OVER IT DOES NOT REACH THE CANVAS (DW-209, EXECUTED 2026-09-20 in Chromium through this
       repository's own Playwright): a wheel dispatched over `[data-add-section]` scrolled the canvas document
       0px, and the identical wheel over the iframe 500px. The page itself does not scroll (`h-dvh
       overflow-hidden`), so the customer's page simply STALLS while the pointer rests on a pill — and the
       deployed walk's own sticky-scroll check wheels at x=700, which is where the "+ Add section" pill sits on a
       1440 editor. So both pills FORWARD their wheel to the canvas, which is the one place it was meant for.

   R-125 (owner, 2026-09-18): R-119's Pro tag KEEPS the section's top-right corner and the pill sits directly to its
   LEFT — its right edge a gap short of the badge's left while the badge shows, and S4b's own 10px inset from the
   section's right when it does not. The name tag keeps the top-left, so nothing else enters either corner. */

/** S4b's inset, in screen pixels: the pill is drawn at the editor's scale, not the canvas's fit. */
const INSET = 10
/** The gap between the pill and the Pro tag when both are drawn (R-125). */
const GAP = 6

type Box = { left: number; top: number; right: number; bottom: number }

const target = `inline-flex size-[26px] items-center justify-center rounded-full text-ink hover:bg-coral-tint ${ring}`

/** Where the pill goes, read fresh: the hovered section's rect on screen, the canvas card's own box to stay inside,
 *  and the Pro tag's left edge when it is drawn on THIS section (R-125). Null when there is nothing to anchor to. */
export type PillBox = { rect: Box; bounds: Box; badgeLeft: number | null }

export function SectionPill({
  /** Story 5.11 — S6's mono `{n} / {m}` for the HOVERED section, or null where its ring holds one design: the
   *  arrows, the counter and Shuffle are then all absent (UX-DR3) */
  ringCount,
  onPrevDesign,
  onNextDesign,
  onShuffle,
  /** Story 5.10 — S4b's "+ Add section": the picker, at the gap under the hovered section */
  onAdd,
  /** Story 5.10 — false where NOTHING can be placed on this canvas: the pill is absent, never a dead press (UX-DR3) */
  canAdd,
  /** something is hovered: the pill is mounted and placed */
  shown,
  /** the canvas is scrolling: the pill hides, laid out, and is placed again when the scroll settles */
  hidden,
  /** read every frame — layout moves under it (a fold, a section that grows) and the editor holds the geometry */
  boxOf,
  /** a site-wide section is one shared instance: its Duplicate is absent (FR-D5) */
  canDuplicate,
  /** Story 5.11 — the three controls that act on THIS SECTION, and the divider that separates them from the ring.
   *  False on the `/controls` review, which holds ONE sample and no doc: there is nothing to duplicate it into,
   *  nothing to delete it from and no order to drag it in, so they are ABSENT there rather than dead (UX-DR3).
   *  True everywhere the editor draws the pill. */
  sectionControls = true,
  name,
  pillRef,
  onDuplicate,
  onDelete,
  gripProps,
  onPointerLeave,
  onWheel,
}: {
  shown: boolean
  hidden: boolean
  boxOf: () => PillBox | null
  canDuplicate: boolean
  name: string
  pillRef: Ref<HTMLDivElement>
  onDuplicate: () => void
  onDelete: () => void
  gripProps: HTMLAttributes<HTMLSpanElement>
  onPointerLeave: (event: { clientX: number; clientY: number }) => void
  onAdd: () => void
  canAdd: boolean
  ringCount: string | null
  onPrevDesign: () => void
  onNextDesign: () => void
  onShuffle: () => void
  sectionControls?: boolean
  /** DW-209 — send this wheel to the canvas document, which is where the pointer looks like it is. `deltaMode` is
   *  carried because a wheel may report lines or pages rather than pixels. */
  onWheel?: (deltaX: number, deltaY: number, deltaMode: number) => void
}) {
  const pill = useRef<HTMLDivElement | null>(null)
  const add = useRef<HTMLButtonElement | null>(null)
  const forward = onWheel === undefined ? undefined : (e: WheelEvent<HTMLElement>) => onWheel(e.deltaX, e.deltaY, e.deltaMode)

  /* Placed on its own frame loop, as the in-canvas chrome is (`lib/canvas-layer.ts`): position follows LAYOUT, not
     just render — a fold re-fits the canvas, a section grows as its words are typed. The loop runs after every
     render, so it always reads this render's `boxOf`. Writes only on change, so a resting pill costs no style
     recalculation. */
  useLayoutEffect(() => {
    if (!shown) return
    const tick = () => {
      const el = pill.current
      const box = boxOf()
      if (!el || !box) return
      const { rect, bounds, badgeLeft } = box
      const [w, h] = [el.offsetWidth, el.offsetHeight]
      // R-125: a gap short of the Pro tag's left while it shows, S4b's own 10px inset from the section's right when not
      const right = badgeLeft === null ? rect.right - INSET : badgeLeft - GAP
      // kept inside the canvas card, the way the toolbar is kept inside the window: a section scrolled half out of
      // view would otherwise draw the pill over the top bar or a panel
      const style = {
        left: `${Math.min(Math.max(right - w, bounds.left + 4), bounds.right - w - 4)}px`,
        top: `${Math.min(Math.max(rect.top + INSET, bounds.top + 4), bounds.bottom - h - 4)}px`,
      }
      for (const [key, value] of Object.entries(style)) if (el.style.getPropertyValue(key) !== value) el.style.setProperty(key, value)
      // S4b's "+ Add section": centred on the section's BOTTOM boundary, half its own height below it, and kept
      // inside the canvas card exactly as the quick actions are
      const plus = add.current
      if (!plus) return
      const [pw, ph] = [plus.offsetWidth, plus.offsetHeight]
      const at = {
        left: `${Math.min(Math.max(rect.left + (rect.right - rect.left) / 2 - pw / 2, bounds.left + 4), bounds.right - pw - 4)}px`,
        top: `${Math.min(Math.max(rect.bottom - ph / 2, bounds.top + 4), bounds.bottom - ph - 4)}px`,
      }
      for (const [key, value] of Object.entries(at)) if (plus.style.getPropertyValue(key) !== value) plus.style.setProperty(key, value)
    }
    tick()
    let id = requestAnimationFrame(function loop() {
      tick()
      id = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(id)
  })

  if (!shown) return null
  return createPortal(
    <>
    <div
      ref={(el) => {
        pill.current = el
        if (typeof pillRef === 'function') pillRef(el)
        else if (pillRef) pillRef.current = el
      }}
      role="toolbar"
      aria-label={`Quick actions for ${name}`}
      data-section-pill=""
      onPointerLeave={onPointerLeave}
      onWheel={forward}
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
      className="fixed z-40 flex items-center gap-px rounded-[24px] border border-line bg-surface p-[3px] shadow-md"
    >
      {/* STORY 5.11 — B1b's claim, in S4b's pill: the counter and the arrows ride on the section, so a design is
          changed without ever looking right. S6`:67` draws the counter in mono at 10px in `--color-ink-soft` with
          `padding:0 4px`, between the two arrows. */}
      {ringCount === null ? null : (
        <>
          <button type="button" aria-label={PREVIOUS_WORDS} title={PREVIOUS_WORDS} onClick={onPrevDesign} className={target}>
            <ChevronLeft size={13} />
          </button>
          <span data-pill-count className="px-1 font-mono text-[10px] text-ink-soft">{ringCount}</span>
          <button type="button" aria-label={NEXT_WORDS} title={NEXT_WORDS} onClick={onNextDesign} className={target}>
            <ChevronRight size={13} />
          </button>
          {/* R-159's SECOND seat, icon-only, before the divider */}
          <button type="button" data-pill-shuffle aria-label={SHUFFLE_WORDS} title={SHUFFLE_WORDS} onClick={onShuffle} className={target}>
            <Refresh size={13} />
          </button>
          {/* S4b's 1px divider — which design, then this section. Nothing to separate from, no divider. */}
          {sectionControls ? <span aria-hidden className="mx-[3px] h-4 w-px bg-line" /> : null}
        </>
      )}
      {sectionControls && canDuplicate ? (
        <button type="button" aria-label={`Duplicate ${name}`} title="Duplicate section" onClick={onDuplicate} className={target}>
          <Copy size={13} />
        </button>
      ) : null}
      {sectionControls ? (
      <button type="button" aria-label={`Delete ${name}`} title="Delete section" onClick={onDelete} className={target}>
        <Trash size={13} />
      </button>
      ) : null}
      {/* aria-hidden and pointer-only, as the Layers grip is: the keyboard move is the Layers row's ⌥-arrows (UX-DR10) */}
      {sectionControls ? (
      <span aria-hidden title="Drag to reorder" {...gripProps} className={`${target} cursor-grab touch-none text-ink-soft`}>
        <Grip />
      </span>
      ) : null}
    </div>
    {/* S4b`:181`: white on a 1px coral border, `--color-coral-text` at 11/600, `4px 11px`, `--radius-pill`, the sm
        shadow, breathing in OPACITY with the hairline under it. The words are the frame's, exactly. */}
    {canAdd ? (
    <button
      ref={add}
      type="button"
      data-add-section=""
      aria-label={`Add section after ${name}`}
      title="Add a section"
      onPointerLeave={onPointerLeave}
      onWheel={forward}
      onClick={onAdd}
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
      className={`fixed z-40 whitespace-nowrap rounded-pill border border-coral bg-surface p-[4px_11px] text-helper-caption font-semibold text-coral-text shadow-sm motion-safe:animate-addline ${ring}`}
    >
      + Add section
    </button>
    ) : null}
    </>,
    document.body,
  )
}
