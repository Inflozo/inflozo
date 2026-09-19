'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import type { Mode } from '@inflozo/section-runtime'
import { gridKeys } from '@/components/controls/icon-picker'
import { ModeToggle } from '@/components/editor/mode-toggle'
import { SectionPreview } from '@/components/editor/section-preview'
import { FreeBadge, ProBadge } from '@/components/kit/badge'
import { closeOnBackdrop } from '@/components/kit/dialog'
import { EmptyPanel } from '@/components/kit/empty-panel'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { Globe, X } from '@/components/kit/icons'
import { SearchInput } from '@/components/kit/input'
import { radioKeys, tabStop } from '@/components/kit/segmented'
import type { DesignRows } from '@/lib/canvas'
import { cards, emptyState, isSiteWide, metaLine, offeredHere, rail, SITE_WIDE_WORDS } from '@/lib/picker'

/* ─────────────────────────────────────────── Story 5.10 — THE SECTION PICKER (`S5 Section Picker.dc.html`, S5a/S5c).
 *
 * S5a, READ OFF THE FRAME. A `--color-scrim` over the editor and a panel at `inset:22px` — NOT a centred box — on
 * `--color-paper`, `--radius-lg`, `--shadow-modal`, `display:flex; overflow:hidden`. A 240px rail with a right rule
 * and 16px/12px padding, holding the Kit's search field (placeholder `Find a section…`, its `⌘K` chip) over the
 * `ALL CATEGORIES` heading and the category rows; a header with the category title in Bricolage 20/700, the meta
 * line in mono 12, the dark control and the close ×; and a CSS multi-column grid of cards, each a live miniature
 * with a hover wash, a coral `Add` and its tier badge.
 *
 * A NATIVE MODAL `<dialog>`, WHICH IS THREE OF `EXPERIENCE.md:502`'S FOUR REQUIREMENTS FOR NOTHING: `Esc`, the focus
 * trap and the return of focus to the invoking control are all the platform's. It settles a subtlety too —
 * `editor.tsx`'s `onShortcut` already yields every single-key binding to `dialog[open]`, so `L`, `.`, `1` `2` `3`
 * and `Del` go quiet while the picker is up with no new guard. `shortcuts-sheet.tsx` is the precedent.
 *
 * WHAT IS NOT BUILT, AND IS ABSENT RATHER THAN GREYED (UX-DR3):
 *   - the rail footer's `Free only` toggle (S5a`:73-76`) — R-150. The canvas is open and enforcement is at the
 *     exits (FR-L3): every offered design is shown, and the ✦ Pro tag is a `<span>`, never a button, with NO
 *     upgrade sheet on click, ever (UX-DR19 — that is B13's job, once, at deploy).
 *   - the header's sun/moon SEGMENTED (S5a`:82-85`) — R-151 replaces it with R-132's one button that swaps its
 *     glyph, at the segmented's drawn position, flipping the SAME mode the canvas holds. So the picker and the page
 *     behind it can never disagree.
 *   - the design ring, `◀ ▶`, a thumbnail strip and Shuffle — all Story 5.11's (R-118). This places a section; it
 *     never changes one.
 *
 * R-152, IN ONE GLYPH AND NO SENTENCE. A site-wide design carries the Kit's `Globe` beside its name, with a hover
 * `title` and THE SAME WORDS in the card's accessible name, so the mark arrives BEFORE the press rather than as an
 * explanation after it. There is no toast, no banner and no sentence anywhere.
 *
 * NOTHING HERE IS A SECOND IMPLEMENTATION. The grid's arrows are `icon-picker.tsx`'s `gridKeys`, the rail is the
 * Kit's `radioKeys`/`tabStop`, the search field is the Kit's `SearchInput`, the badges are the Kit's, the dark
 * button is `mode-toggle.tsx` verbatim, the filter is `lib/picker.ts` over the library's `offeredOn`, and the
 * preview is `renderSection` — the canvas's own.
 */

/** The three reconciliations the frame needed, each stated in the spec's Design Notes rather than asked:
 *  the meta line is ONE template (S5a's words, with S5c's ` · dark mode` appended), the tier badges are the KIT's
 *  and not S5's card-local sizes, and there is no S5b, no loading frame and no zero-result frame anywhere in the
 *  export — those are extrapolated from S5a and S5c (R-74). */

export type Placement = { entry: SectionRegistryEntry; siteWide: boolean }

export function SectionPicker({
  dialog,
  open,
  entries,
  file,
  siteFile,
  rows,
  pool,
  icons,
  mode,
  onMode,
  darkEnabled,
  pack,
  src,
  refusal,
  onAdd,
  onClose,
}: {
  dialog: React.RefObject<HTMLDialogElement | null>
  /** mounted only while it is open, so every preview frame goes when it closes */
  open: boolean
  entries: Readonly<Record<string, SectionRegistryEntry>>
  /** the template file this canvas compiles into — the whole of what the filter is asked about */
  file: string
  siteFile: string
  rows: Readonly<Record<string, DesignRows>>
  pool: readonly { id: string }[]
  icons: IconLookup | null
  mode: Mode
  onMode: (next: Mode) => void
  darkEnabled: boolean
  pack: string
  src: string
  /** the sentence the last Add answered with, shown in the picker's own refusal line (DW-190) */
  refusal: string | null
  onAdd: (placement: Placement) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const grid = useRef<HTMLDivElement>(null)

  const offered = useMemo(() => offeredHere(entries, file, siteFile), [entries, file, siteFile])
  const rows_ = useMemo(() => rail(offered), [offered])
  const shown = useMemo(() => cards(offered, category, query), [offered, category, query])

  // a canvas change, or a fresh open, starts on the first category with nothing searched for
  useEffect(() => {
    if (!open) return
    setQuery('')
    setCategory(null)
  }, [open, file])
  // a new search or category starts at the top of its own results
  useEffect(() => {
    grid.current?.scrollTo({ top: 0 })
  }, [query, category])

  const searching = query.trim() !== ''
  const title = searching ? 'All categories' : (rows_.find((r) => r.category === category)?.title ?? 'All categories')
  const empty = emptyState(offered.length, shown.length, query)
  const choices = rows_.map((r) => ({ value: r.category, label: r.title }))

  return (
    <dialog
      ref={dialog}
      onClick={closeOnBackdrop}
      onClose={onClose}
      aria-label="Add a section"
      /* S5a`:28-29`: the scrim over the whole editor, and a panel INSET 22px on every side — not a centred box, so
         the `sheet` vocabulary (a 460px card) is deliberately not reused here. `max-w/max-h: none` because the user
         agent caps a modal at `calc(100% - 6px - 2em)`, which would leave the panel short of its 22px inset. */
      className="m-0 h-[calc(100dvh-44px)] max-h-none w-[calc(100vw-44px)] max-w-none translate-x-[22px] translate-y-[22px] overflow-hidden rounded-lg bg-paper p-0 shadow-modal backdrop:bg-scrim open:flex motion-safe:open:animate-picker-rise"
    >
      {/* S5a`:30`: the rail — 240px, a right rule, 16px/12px padding, 14px between its parts */}
      <div className="flex w-[240px] shrink-0 flex-col gap-[14px] border-r border-line p-[16px_12px]">
        <SearchInput
          id="picker-search"
          label="Find a section"
          labelHidden
          placeholder="Find a section…"
          hint="⌘K"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {/* S5a`:37`: mono 10.5, and NO NUMBER BESIDE IT — A7 item 1 took the library total out of S5a and S5c on
            purpose (standing rule 4: a total whose source lives elsewhere goes stale) */}
        <div id="picker-categories" className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto pr-[6px]">
          <p className="shrink-0 px-[10px] pb-[7px] font-mono text-[10.5px] tracking-[0.02em] text-ink-soft-aa">ALL CATEGORIES</p>
          {/* the Kit's radio group, never a second arrow implementation: one Tab stop, the arrows move the choice */}
          <div
            role="radiogroup"
            aria-label="Categories"
            onKeyDown={(event) => radioKeys(event, choices, (value) => setCategory(value))}
            className="flex flex-col gap-px"
          >
            {rows_.map((row, n) => {
              const on = row.category === category
              return (
                <button
                  key={row.category}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={n === tabStop(choices, category) ? 0 : -1}
                  onClick={() => setCategory(on ? null : row.category)}
                  /* S5a`:38-71`: 7px/10px, `--radius-sm`, hover at ink 4%, and the chosen row at
                     `--color-coral-tint` on `--color-coral-text` at 600 — the Layers row's own treatment
                     (`Editor Sidebar Kit.dc.html:220-223`), which is why the rail needs no new token */
                  className={`flex shrink-0 items-center justify-between rounded-sm p-[7px_10px] text-left text-ui-dense ${ring} ${
                    on ? 'bg-coral-tint font-semibold text-coral-text' : 'font-medium text-ink-soft hover:bg-ink/[0.04]'
                  }`}
                >
                  {row.title}
                  {/* DERIVED, over what is offered ON THIS CANVAS — never a library total */}
                  <span className="font-mono text-[11px]">{row.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* S5a`:79-86`: the header */}
        <div className="flex items-center gap-3 border-b border-line p-[16px_24px]">
          <h2 className="font-display text-[20px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
          <p className="font-mono text-[12px] text-ink-soft">{metaLine(shown.length, pack, mode === 'dark')}</p>
          {/* R-151: R-132's ONE BUTTON at the segmented's drawn position, flipping the same mode the canvas holds —
              absent, never greyed, on a Light-only project, exactly as it is in the top bar (R-135) */}
          <div className="ml-auto flex items-center gap-2">
            {darkEnabled ? <ModeToggle id="picker-mode" mode={mode} onMode={onMode} /> : null}
            {/* S5a`:86` draws the × with no accessible name; it gets one (A7 item 9) */}
            <button
              type="button"
              aria-label="Close the section picker"
              title="Close"
              onClick={() => dialog.current?.close()}
              className={`inline-flex size-8 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-ink/[0.05] ${ring}`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* DW-190 CLOSES HERE: the refusal a section with no root had nowhere to show on. R-37's second Post Content
            is the one thing that reaches it, and it says so in the picker, where the press was. */}
        {refusal ? (
          <p role="status" className="border-b border-line bg-coral-tint p-[10px_24px] text-ui-dense text-coral-text">
            This section cannot be added — {refusal}.
          </p>
        ) : null}

        {empty ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="max-w-[420px]">
              <EmptyPanel title={empty.title} instruction={empty.instruction} />
            </div>
          </div>
        ) : (
          /* S5a`:88`: CSS multi-column, `column-gap:16px`, cards `break-inside:avoid; margin-bottom:16px`. A `group`
             with a label and the arrow walk on it, exactly as the icon picker's grid is. */
          <div
            ref={grid}
            data-picker-grid=""
            role="group"
            aria-label="Designs"
            onKeyDown={(event) => {
              // a multi-column list runs DOWN each column, so "down" is one cell and "right" is a whole column —
              // read from the layout rather than assumed, because the column count changes with the window
              const cells = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-cell]')]
              const first = cells[0]?.offsetLeft
              gridKeys(event, { right: Math.max(1, cells.filter((c) => c.offsetLeft === first).length), down: 1 })
            }}
            className={`flex-1 overflow-y-auto p-[20px_24px] [column-gap:16px] [column-width:300px] ${slimScrollbar}`}
          >
            {shown.map((entry, n) => (
              <Card
                key={entry.id}
                entry={entry}
                first={n === 0}
                siteWide={isSiteWide(entry, siteFile)}
                target={isSiteWide(entry, siteFile) ? siteFile : file}
                rows={rows[entry.id]}
                pool={pool}
                icons={icons}
                mode={mode}
                src={src}
                onAdd={onAdd}
              />
            ))}
          </div>
        )}
      </div>
    </dialog>
  )
}

/** S5a`:89-101` — one card. The WASH IS THE BUTTON: S5a draws it `top:0;left:0;right:0;bottom:41px` with the coral
 *  `Add` centred inside it, so making that rectangle the control gives the whole picture as a press target, keeps
 *  the name and the badge legible below it, and leaves exactly one interactive element per card (no nested
 *  interactive content over the `inert` preview frame). */
function Card({
  entry,
  first,
  siteWide,
  target,
  rows,
  pool,
  icons,
  mode,
  src,
  onAdd,
}: {
  entry: SectionRegistryEntry
  first: boolean
  siteWide: boolean
  target: string
  rows: DesignRows | undefined
  pool: readonly { id: string }[]
  icons: IconLookup | null
  mode: Mode
  src: string
  onAdd: (placement: Placement) => void
}) {
  return (
    <div className="group relative mb-4 overflow-hidden rounded-[12px] border border-line bg-surface shadow-sm transition-[box-shadow,transform] hover:-translate-y-[2px] hover:shadow-canvas-page [break-inside:avoid] focus-within:-translate-y-[2px] focus-within:shadow-canvas-page">
      <SectionPreview entry={entry} target={target} rows={rows} pool={pool} icons={icons} mode={mode} src={src} />
      <button
        type="button"
        data-cell=""
        data-design={entry.id}
        // the first card is the grid's one Tab stop; the arrows rove from there (the icon picker's own pattern)
        tabIndex={first ? 0 : -1}
        // R-152's words are part of the name, because a glyph and a hover are invisible to a screen reader
        aria-label={`Add ${entry.name}, ${entry.tier === 'pro' ? 'Pro' : 'Free'}${siteWide ? `, ${SITE_WIDE_WORDS}` : ''}`}
        onClick={() => onAdd({ entry, siteWide })}
        className={`absolute inset-x-0 bottom-[41px] top-0 flex items-center justify-center bg-ink/25 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 ${ring}`}
      >
        <span className="rounded-[12px] bg-coral-text p-[8px_22px] text-ui-dense font-semibold text-surface shadow-md">Add</span>
      </button>
      {/* S5a`:99`: the footer — the design's name at 13/600 and its tier badge, both outside the wash */}
      <div className="flex h-[41px] items-center justify-between gap-2 p-[10px_14px]">
        <span className="flex min-w-0 items-center gap-[5px]">
          <span className="truncate text-ui-dense font-semibold text-ink">{entry.name}</span>
          {/* R-152: the mark, before the press. `title` on the wrapper, because an SVG's own title is not a tooltip */}
          {siteWide ? (
            <span title={SITE_WIDE_WORDS} className="flex shrink-0 text-ink-soft">
              <Globe size={13} aria-hidden />
            </span>
          ) : null}
        </span>
        {entry.tier === 'pro' ? <ProBadge /> : <FreeBadge />}
      </div>
    </div>
  )
}
