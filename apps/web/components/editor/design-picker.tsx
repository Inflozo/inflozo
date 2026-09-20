'use client'

import type { CSSProperties, KeyboardEvent } from 'react'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import type { Mode } from '@inflozo/section-runtime'
import { SectionPreview } from '@/components/editor/section-preview'
import { gridKeys } from '@/components/controls/icon-picker'
import { ring } from '@/components/kit/greyed'
import { ChevronLeft, ChevronRight } from '@/components/kit/icons'
import type { DesignRows } from '@/lib/canvas'
import { NEXT_WORDS, ONE_DESIGN, PREVIOUS_WORDS, STRIP_COLUMNS, position, strip } from '@/lib/ring'

/* ────────────────────────────── Story 5.11 — B1a, THE DESIGN BLOCK AT THE HEAD OF THE PANEL (FR-D19, R-74).
 *
 * `B Missing Surfaces.dc.html:355` — B1a, drawn there at its 320 actual width and mounted here in the 280 panel:
 * the label **Design** (12/500, ink-soft) with **◀ `7 of 18` ▶** to its right at 26px targets on surface, the
 * counter MONO with a fixed `min-width` so the number does not shift the arrows as it counts; a 4-column strip of
 * 44px tiles, the active one coral-ringed, a Pro tile marked with a ✦, and a `+N` tile where the ring is longer
 * than the strip; and the active design's name with its descriptor beneath.
 *
 * TWO OF B1a'S PARTS WERE BUILT AND THEN REMOVED, at the owner's test of the deployed page (2026-09-20): the
 * `Cycle designs` footer with its `[` `]` chips (finding 4) and S6`:140`'s `Try a design` card (finding 3, which
 * amends R-159 — Shuffle keeps ONE seat, the section pill's). The keys are still advertised, in the `?` card,
 * which is R-147's one place for them. And the counter prints `7 of 18` and not `Design 7 of 18` (finding 2): the
 * word is the LABEL to its left, and the block was saying it twice.
 *
 * ABOVE EVERY GROUP AND INSIDE NONE (FR-F3): the design picker is not a setting, so it is a SIBLING of `Sidebar`
 * rather than a row in it — which is also why `Sidebar` is untouched by this story.
 *
 * THE TILES ARE `SectionPreview`, NOT A SECOND THUMBNAIL SYSTEM. B1a draws wireframe mini-diagrams, which were
 * stress-fill fiction for eighteen designs nobody had authored; the real answer already exists and is already
 * lazy — the design itself rendered into an `inert` `/canvas` frame carrying only its own stylesheet (R-155),
 * created on intersection. At 64×44 a tile shows shape and ground, which is what the frame's note asks of it
 * ("recognising design 14 when you are on 7"). Its cost is DW-200's, not this story's.
 *
 * THE PRESS IS AN OVERLAY, NOT A WRAPPER, and that is mechanical: a preview is an `<iframe>`, which is
 * INTERACTIVE CONTENT, and interactive content inside a `<button>` is both invalid HTML and axe's
 * `nested-interactive` — which step 8 of the deployed walk reads as a failure (R-149 allows one exception and it
 * is not this). So each tile is a positioned box holding the preview, with a transparent button over it carrying
 * the accessible name.
 *
 * ABSENT, NEVER GREYED (UX-DR3, R-118). Where the ring holds one design there is nowhere to go, so the arrows and
 * the strip are simply NOT DRAWN and one plain sentence says why (R-12's shape): the counter still reads "1 of 1",
 * because that is true and is the thing that changes the day Epic 9 fills the category — every count here is
 * derived, so nothing needs editing then.
 *
 * `← →` CROSS THE STRIP (`EXPERIENCE.md:503`), mirroring `[` and `]`, through the Kit's own `gridKeys` — never a
 * second arrow implementation.
 *
 * SHUFFLE IS NOT HERE. Its one seat is the section pill's icon-only control (`controls/section-pill.tsx`), by the
 * owner's finding 3 above.
 */

/** B1a`:377` — 64 × 44, the tile the strip is a grid of. */
const TILE_WIDTH = 64
const TILE_HEIGHT = 44

/** One tile's picture: the design's own render, under a transparent press. */
function Tile({
  entry, target, rows, pool, icons, mode, src, assets, className = '', style,
}: {
  entry: SectionRegistryEntry
  target: string
  rows: DesignRows | undefined
  pool: readonly { id: string }[]
  icons: IconLookup | null
  mode: Mode
  src: string
  assets?: Readonly<Record<string, string>>
  className?: string
  style?: CSSProperties
}) {
  return (
    <span aria-hidden style={style} className={`pointer-events-none flex overflow-hidden ${className}`}>
      <SectionPreview
        entry={entry}
        target={target}
        rows={rows}
        pool={pool}
        icons={icons}
        mode={mode}
        src={src}
        assets={assets}
        onAspect={() => {}}
      />
    </span>
  )
}

export function DesignPicker({
  ring: designs,
  at,
  target,
  rows,
  pool,
  icons,
  mode,
  src,
  assets,
  onDesign,
  onStep,
}: {
  /** the instance's own ring, from the library's `ringFor` — including the design it is now */
  ring: readonly SectionRegistryEntry[]
  /** where in the ring this section is */
  at: number
  target: string
  rows: Readonly<Record<string, DesignRows | undefined>>
  pool: readonly { id: string }[]
  icons: IconLookup | null
  mode: Mode
  src: string
  /** the canvas document's asset map, where it is not the editor's own (`/controls` serves its pictures itself) */
  assets?: Readonly<Record<string, string>>
  onDesign: (designId: string) => void
  onStep: (by: number) => void
}) {
  const active = designs[at]
  const many = designs.length > 1
  const { tiles, from, more } = strip(designs, at)
  if (!active) return null

  const arrow = (by: number, label: string) => (
    <button
      type="button"
      data-design-step={by}
      aria-label={label}
      title={label}
      onClick={() => onStep(by)}
      className={`inline-flex size-[26px] shrink-0 items-center justify-center rounded-[7px] border border-line bg-surface text-ink-soft transition-colors hover:text-ink ${ring}`}
    >
      {by < 0 ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
    </button>
  )

  const preview = { target, pool, icons, mode, src, assets }

  return (
    <section
      id="editor-design"
      aria-label="Design"
      className="flex flex-col gap-[14px] rounded-[12px] border border-line bg-paper p-4 shadow-sm"
    >
      {/* B1a`:363` — the label, and the counter between its two arrows. The counter is `min-width:74px` and
          centred, so "9 of 18" and "18 of 18" leave the arrows exactly where they were (the frame's own note). */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-control-label font-medium text-ink-soft">Design</span>
        <div className="flex items-center gap-[6px]">
          {many ? arrow(-1, PREVIOUS_WORDS) : null}
          <span id="editor-design-count" className="min-w-[74px] text-center font-mono text-[11.5px] font-medium text-ink-soft">
            {position(at, designs.length)}
          </span>
          {many ? arrow(1, NEXT_WORDS) : null}
        </div>
      </div>

      {many ? (
        <div
          /* a LISTBOX, not a radio group: `← →` move FOCUS across the tiles and Enter or a press is the swap, which is
             a listbox's contract (WAI-ARIA APG: selection need not follow focus) and not a radio group's, where an
             arrow itself selects — and here an arrow that swapped would write one edit per press (review, 2026-09-20) */
          role="listbox"
          aria-label="Designs in this category"
          data-design-strip
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => gridKeys(event, { right: 1, down: STRIP_COLUMNS })}
          className="grid gap-[7px]"
          style={{ gridTemplateColumns: `repeat(${STRIP_COLUMNS}, minmax(0, 1fr))` }}
        >
          {tiles.map((entry, n) => {
            const on = from + n === at
            return (
              <span
                key={entry.id}
                className={`relative block overflow-hidden rounded-[6px] border border-line bg-surface ${on ? 'shadow-[0_0_0_2px_var(--color-coral)]' : ''}`}
                style={{ height: TILE_HEIGHT }}
              >
                <Tile entry={entry} rows={rows[entry.id]} className="h-full w-full" {...preview} />
                <button
                  type="button"
                  role="option"
                  data-cell
                  data-design-tile={entry.id}
                  aria-selected={on}
                  /* the tier is in the WORDS, so the ✦ never carries the only signal (UX-DR2) */
                  aria-label={`${entry.name}${entry.tier === 'pro' ? ' — Pro' : ''}`}
                  title={entry.name}
                  /* the strip is ONE tab stop: the selected tile takes it and `← →` move between them */
                  tabIndex={on ? 0 : -1}
                  onClick={() => onDesign(entry.id)}
                  className={`absolute inset-0 block rounded-[6px] ${ring}`}
                />
                {/* B1a`:381` — a 7px ✦ in the tile's top-right corner marks a Pro design */}
                {entry.tier === 'pro' ? (
                  <span aria-hidden className="pointer-events-none absolute right-[3px] top-[2px] text-[7px] leading-none text-marigold-text">
                    ✦
                  </span>
                ) : null}
              </span>
            )
          })}
          {/* B1a`:386` — "twelve of the eighteen … because a scrollbar at 44px tall is a worse target than a tile".
              Not a control: `[` and `]` reach every design in the ring, and the strip slides to keep the active
              tile on screen, so nothing here is out of reach. */}
          {more > 0 ? (
            <span
              className="flex items-center justify-center rounded-[6px] bg-paper-sunk font-mono text-[10.5px] text-ink-soft"
              style={{ height: TILE_HEIGHT }}
            >
              +{more}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* B1a`:388` — the active design's name, and its descriptor beneath it in the frame's own smaller ink. With
          one design in the ring the descriptor's place is where the sentence goes that says so (R-12). */}
      <div className="flex flex-col gap-[2px]">
        <span id="editor-design-name" className="text-[12px] font-semibold">{active.name}</span>
        <span id="editor-design-note" className="text-[11.5px] leading-[1.45] text-ink-soft">
          {many ? active.descriptor.emphasis : ONE_DESIGN}
        </span>
      </div>

    </section>
  )
}
