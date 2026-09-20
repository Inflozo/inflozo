'use client'

import { useEffect, useRef, useState } from 'react'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import { defaultContent, type Mode } from '@inflozo/section-runtime'
import { Skeleton } from '@/components/kit/loading'
import { canvasAssets, mountSections, previewSrc, renderSection, type DesignRows } from '@/lib/canvas'
import { DESKTOP } from '@/lib/device'

/* ────────────────────────────────── Story 5.10 — ONE CARD'S LIVE PREVIEW (S5a's card, FR-D12, NFR-1).
 *
 * THE PREVIEW IS THE CANVAS'S OWN RENDER, and that is the whole idea: `renderSection` into a `/canvas` iframe, the
 * same door `/pilots` and the editor already paint through, over the instance a placement would really create. So
 * the picture on the card and the section you get are the same code by construction, and the day Epic 6 replaces
 * the token set the picker follows with no change at all.
 *
 * AT THE CANVAS'S OWN DEVICE WIDTH, NEVER THE CARD'S. A design's stylesheet carries media queries that key on the
 * VIEWPORT, so a shadow root sized to a card would apply the desktop rules at card width and draw a broken
 * miniature. R-137 settled the identical point for the canvas — "the iframe's CSS pixel size IS the device's, so
 * media queries fire" — so the frame is Desktop-wide and a `transform` fits it into the card.
 *
 * `inert`, AND THAT IS WHAT KEEPS R-149 AT ONE RULE ON ONE ELEMENT. The canvas iframe needed `tabindex="-1"` and
 * cost an axe exception, because the canvas must stay pointer-editable and `inert` would have taken the pointer
 * with it. A preview takes no pointer — the card's Add button is the target, in the footer strip beneath it — so `inert` is available
 * here and is strictly better: nothing inside is focusable or in the accessibility tree, so `frame-focusable-content`
 * has nothing to say. Each frame still keeps a `title`, for `frame-title`.
 *
 * CREATED ONLY AS THE CARD NEARS THE VIEWPORT (NFR-1's "Section Picker preview lazy rendering", read literally), and
 * each frame asks `/canvas` for ONE design's stylesheet (`previewSrc`), kept by the browser under the build's address — its weight is DW-200's, not this
 * story's. A RENDER THAT THROWS KEEPS THE SKELETON and leaves the card addable: the failure is logged, never printed
 * to the customer (the I/O matrix's last row).
 */

/** How tall a preview may grow before it is cropped, in canvas pixels.
 *  ponytail: two Desktop viewports — a guessed ceiling, not a rule. Since the owner's test of 2026-09-20 a tile
 *  CROPS what does not fit, so this is a render-cost bound rather than a layout one: past it there is nothing left
 *  to see in a tile that tall. Every pilot draws well inside it (a Post Grid, the tallest, is about one and a
 *  quarter). Lower it if a real design ever makes the grid slow. */
const CEILING = DESKTOP.height * 2

export function SectionPreview({
  entry,
  target,
  rows,
  pool,
  icons,
  mode,
  src,
  onAspect,
}: {
  entry: SectionRegistryEntry
  /** the template file this canvas compiles into, so the design renders in the context it will really be placed in */
  target: string
  rows: DesignRows | undefined
  pool: readonly { id: string }[]
  icons: IconLookup | null
  mode: Mode
  /** the canvas document's own address, as the editor resolves it — never a second literal */
  src: string
  /** the section's drawn aspect (its height at Desktop width), once it has been drawn — the card's span reads it */
  onAspect: (aspect: number) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  /** the card has come near the viewport, so the frame is worth creating */
  const [near, setNear] = useState(false)
  /** the section's own height in CANVAS pixels, once it has been drawn; 0 until then */
  const [tall, setTall] = useState(0)
  /** the card's width in SCREEN pixels, watched so the fit follows a column reflow */
  const [wide, setWide] = useState(0)
  /** and its height, which the GRID gives it now that a tile is a row unit and not the content's own length */
  const [high, setHigh] = useState(0)

  useEffect(() => {
    const el = box.current
    if (near || !el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        setNear(true)
        io.disconnect()
      },
      // the grid scrolls, not the window: the observer watches inside it, a card's height ahead
      { root: el.closest('[data-picker-grid]'), rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [near])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const watch = new ResizeObserver(([row]) => {
      // A CLOSED PICKER IS `display:none` AND MEASURES 0 (the owner's ruling of 2026-09-20 keeps it mounted), and a
      // zero here would drop `fit` to 0 and put the skeleton back over a preview that is already drawn — so the
      // last real size stands until there is another one. Nothing is ever laid out at 0 on purpose.
      if (!row || row.contentRect.width === 0) return
      setWide(row.contentRect.width)
      setHigh(row.contentRect.height)
    })
    watch.observe(el)
    return () => watch.disconnect()
  }, [])

  /** The render, run on the frame's `load` and again whenever the mode flips. Never on the card's width: the frame
   *  is always Desktop-wide, and only the `transform` over it changes. */
  const paint = () => {
    const doc = frame.current?.contentDocument
    const mount = doc?.getElementById('canvas')
    if (!doc || !mount || !icons) return
    doc.documentElement.setAttribute('data-mode', mode)
    try {
      // THE INSTANCE A PLACEMENT WOULD REALLY CREATE — the design's own words, no stored controls, `previewSeed`'s
      // dataset behind every binding (`rows`). Nothing about the preview is a second idea of what a new section is.
      const state = { content: defaultContent(entry.contentSchema), controls: {}, data: {}, darkOverrides: {} }
      mountSections(mount, renderSection(doc, entry, state, {
        target,
        rows,
        feed: 'first',
        member: 'anonymous',
        visibility: 'everyone',
        assets: canvasAssets(pool),
        icons,
      }))
      // A CLOSED PICKER MEASURES 0 (it is kept mounted, `display:none`): a mode flip from the top bar repaints here
      // with nothing laid out, and a 0 read as CEILING re-shaped every drawn card as a two-row tile (review,
      // 2026-09-20). The words are repainted; the last real measurement stands, exactly as the ResizeObserver's does.
      if (mount.scrollHeight === 0 && frame.current?.getClientRects().length === 0) return
      const drawnHeight = Math.min(mount.scrollHeight || CEILING, CEILING)
      setTall(drawnHeight)
      // the owner's test of 2026-09-20: a card's SPAN is the section's own shape, and this is the only place it is
      // measured — a band is wide, a feed is long, and neither is knowable before the design has been drawn once
      onAspect(drawnHeight / DESKTOP.width)
    } catch (error) {
      // the card keeps its skeleton and stays addable; every other card is unaffected (the I/O matrix)
      console.warn(`the preview of ${entry.id} could not be drawn`, error)
    }
  }
  // the icons arrive asynchronously and the mode flips under a live picker: both repaint what is already there
  // — and so does a canvas change: the card is keyed by design and kept, so its target and rows can change under it
  useEffect(paint, [near, mode, icons, target, rows])

  const fit = wide > 0 ? wide / DESKTOP.width : 0
  const drawn = tall > 0 && fit > 0
  /** a section shorter than its tile is CENTRED in it, never hung from the top — the tile's height is the grid's
   *  now, so a 100px band in a 150px window would otherwise sit against the rule with all the air beneath it */
  const top = drawn ? Math.max(0, Math.round((high - tall * fit) / 2)) : 0

  return (
    <div
      ref={box}
      // S5a`:101`: the preview sits on the raised paper, above the card's own footer rule. It FILLS the card, whose
      // height is the grid row's (the owner's test of 2026-09-20) — a taller section is cropped, a shorter centred.
      className="relative min-h-0 flex-1 overflow-hidden border-b border-line bg-paper-raised"
    >
      {drawn ? null : (
        <div className="p-[18px]">
          <Skeleton />
        </div>
      )}
      {near ? (
        <iframe
          ref={frame}
          // ONE DESIGN'S STYLESHEET, NOT THE LIBRARY'S (the owner's ruling of 2026-09-20): every frame used to carry
          // every design's CSS, so the parse cost grew with the square of the library
          src={previewSrc(src, entry.id)}
          // unique per frame (axe `frame-title-unique`): two categories can hold a design of the same name
          title={`${entry.categoryTitle} — ${entry.name} preview`}
          // nothing inside is focusable or in the accessibility tree, so R-149's exception is not needed twice
          inert
          onLoad={paint}
          className="pointer-events-none absolute left-0 block origin-top-left border-0"
          style={{ top, width: DESKTOP.width, height: tall || CEILING, transform: `scale(${fit || 0.0001})`, visibility: drawn ? undefined : 'hidden' }}
        />
      ) : null}
    </div>
  )
}
