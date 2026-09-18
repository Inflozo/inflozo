'use client'

import { useLayoutEffect, useRef, type HTMLAttributes, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { ring } from '@/components/kit/greyed'
import { Copy, Grip, Trash } from '@/components/kit/icons'

/* S4b's QUICK-ACTION PILL (`S4 Editor.dc.html`:181, the `top:10px;right:10px` group) — Story 5.4.

   DRAWN AS S4b DRAWS IT: white on the editor's hairline, radius 24, the `md` shadow, 3px padding, 26px round targets
   that take the coral tint on hover, the two icons at 13px and the grip at 10×13.

   THREE CONTROLS AND NO MORE (R-118, absent not greyed): Duplicate, Delete and the drag grip. S4b also draws `◀ ▶`
   and the divider between them — those arrive with Story 5.11's design ring — and the hairline "+" is 5.10's. A
   site-wide section's Duplicate is absent here too, exactly as it is in its Layers menu (FR-D5).

   OUTSIDE THE FRAME, because it is PRESSED (AD-21, as amended through 5.1–5.3), and for a second, mechanical reason:
   a React portal into the canvas document receives no React events at all — React's delegation is attached in the
   editor document. So it is a fixed element in the editor's own body, placed from the hovered section's rect through
   the frame's rect and the fit. Being outside costs it the two things P0-1's toolbar already pays:

     - it TRAILS THE COMPOSITOR during a scroll (Story 5.2's finding), so it hides from the first canvas `scroll` and
       is placed again 150 ms after the last — never a frame in which it sits away from its section;
     - the pointer crossing from the iframe onto it reaches the canvas document as a `pointerout` with a null
       `relatedTarget`, which would clear the hover it is anchored to. `editor.tsx` guards that by geometry.

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
  /** something is hovered: the pill is mounted and placed */
  shown,
  /** the canvas is scrolling: the pill hides, laid out, and is placed again when the scroll settles */
  hidden,
  /** read every frame — layout moves under it (a fold, a section that grows) and the editor holds the geometry */
  boxOf,
  /** a site-wide section is one shared instance: its Duplicate is absent (FR-D5) */
  canDuplicate,
  name,
  pillRef,
  onDuplicate,
  onDelete,
  gripProps,
  onPointerLeave,
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
}) {
  const pill = useRef<HTMLDivElement | null>(null)

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
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
      className="fixed z-40 flex items-center gap-px rounded-[24px] border border-line bg-surface p-[3px] shadow-md"
    >
      {canDuplicate ? (
        <button type="button" aria-label={`Duplicate ${name}`} title="Duplicate section" onClick={onDuplicate} className={target}>
          <Copy size={13} />
        </button>
      ) : null}
      <button type="button" aria-label={`Delete ${name}`} title="Delete section" onClick={onDelete} className={target}>
        <Trash size={13} />
      </button>
      {/* aria-hidden and pointer-only, as the Layers grip is: the keyboard move is the Layers row's ⌥-arrows (UX-DR10) */}
      <span aria-hidden title="Drag to reorder" {...gripProps} className={`${target} cursor-grab touch-none text-ink-soft`}>
        <Grip />
      </span>
    </div>,
    document.body,
  )
}
