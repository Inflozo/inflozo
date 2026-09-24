'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { IconLookup, SectionRegistryEntry, orbitWeekly } from '@inflozo/library'
import type { Mode } from '@inflozo/section-runtime'
import { gridKeys } from '@/components/controls/icon-picker'
import { ModeToggle } from '@/components/editor/mode-toggle'
import { SectionPreview } from '@/components/editor/section-preview'
import { FreeBadge, ProBadge } from '@/components/kit/badge'
import { closeOnBackdrop } from '@/components/kit/dialog'
import { EmptyPanel } from '@/components/kit/empty-panel'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { Globe, Plus, X } from '@/components/kit/icons'
import { SearchInput } from '@/components/kit/input'
import { radioKeys, tabStop } from '@/components/kit/segmented'
import type { DesignRows, RenderContext } from '@/lib/canvas'
import { cards, emptyState, isSiteWide, metaLine, offeredHere, rail, SITE_WIDE_WORDS, spanFor } from '@/lib/picker'
import type { Visitor } from '@/lib/view-as'

/** Story 5.18 — the canvas's own content for a card, one source per card (`SectionPreview`'s `live`). */
type Live = (entry: SectionRegistryEntry, target: string) => { context: RenderContext; rows: DesignRows | undefined } | null

/* ─────────────────────────────────────────── Story 5.10 — THE SECTION PICKER (`S5 Section Picker.dc.html`, S5a/S5c).
 *
 * S5a, READ OFF THE FRAME. A `--color-scrim` over the editor and a panel at `inset:22px` — NOT a centred box — on
 * `--color-paper`, `--radius-lg`, `--shadow-modal`, `display:flex; overflow:hidden`. A 240px rail with a right rule
 * and 16px/12px padding, holding the Kit's search field (placeholder `Find a section…`, its `⌘K` chip) over the
 * `All sections` row, the `CATEGORIES` heading and the category rows; a header with the category title in
 * Bricolage 20/700, the meta line in mono 12, the dark control and the close ×; and a grid of cards, each a live
 * miniature with its `Add` and its tier badge.
 *
 * FOUR THINGS HERE ARE THE OWNER'S TEST OF 2026-09-20 AND NOT S5a (R-153, and the four he asked for after it): the
 * grid's shape (`COLUMNS` below), the `Add`'s seat (`Card`), the rail's first row and its renamed heading, and the
 * hover, which is a BORDER — no wash, no shadow, no lift. S5a`:81`'s `· shown in your pack: Paper` is gone with
 * them. Everything else in S5a and S5c stands.
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
 *   - the design ring, `◀ ▶`, a thumbnail strip and Shuffle — all Story 5.11's, which built them in the PANEL
 *     (B1a's Design block) and on the section's own pill. This places a section; it never changes one.
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
 *  the meta line is ONE template (S5a's count, with S5c's ` · dark mode` appended — R-154 dropped the pack from it), the tier badges are the KIT's
 *  and not S5's card-local sizes, and there is no S5b, no loading frame and no zero-result frame anywhere in the
 *  export — those are extrapolated from S5a and S5c (R-74). */

/* THE GRID IS FOUR COLUMNS OF TILES, AND THAT IS THE OWNER'S TEST OF 2026-09-20, NOT S5a.
 * S5a draws CSS multi-column, which gave each card the width of a 300px column and the height of its own content:
 * at 1440 that is five thin columns, a header drawn 20px tall, and — the fault he actually pressed — a hover wash
 * shorter than the `Add` pill inside it, so the button was CUT OFF. Four fixed columns over a row unit fix all
 * three at once, and a card's SHAPE now says what the section is: a band spans two columns, a feed spans two rows
 * (`spanFor`, measured from the design's own drawn aspect). The `Add` moved out of the wash and into the footer
 * strip, where it cannot be cropped by a short preview. */
const COLUMNS = 4
/** One row of the grid, in pixels — a tile is this tall, a two-row tile twice it plus the gap.
 *  ponytail: a guessed unit, not a rule. Raise it if the miniatures read too small on his screen. */
const ROW = 190

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
  src,
  subject,
  member,
  live,
  refusal,
  onAdd,
  onClose,
}: {
  dialog: React.RefObject<HTMLDialogElement | null>
  /** whether it is SHOWN. Since the owner's ruling of 2026-09-20 the component stays mounted after the first open —
   *  a closed `<dialog>` is `display:none`, which keeps every preview alive without drawing anything — so this is
   *  what the reset below keys on, not the component's lifetime. */
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
  src: string
  /** Story 5.13 — the canvas's resolved preview subject, worn by every preview card (`EXPERIENCE.md:877`) */
  subject?: orbitWeekly.Subject | null
  /** Story 5.14 — the visitor View as is previewing, which every card draws the section as (FR-D16) */
  member?: Visitor
  /** Story 5.18 — the canvas's own content where it is the connected site's, one source per card */
  live?: Live
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

  // a canvas change, or a fresh open, starts on All sections (`null`) with nothing searched for
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
  // the header says what the CHOSEN rail row says — and with nothing chosen that row is now "All sections", so the
  // two can never read differently (routine, decided rather than asked)
  const title = searching ? 'All sections' : (rows_.find((r) => r.category === category)?.title ?? 'All sections')
  const empty = emptyState(offered.length, shown.length, query)
  /* THE RAIL'S OWN ROWS, with "All sections" FIRST (the owner's test of 2026-09-20). It is a radio like any other
     and carries the empty value, so `radioKeys` and `tabStop` walk it beside the categories and nothing here learns
     a second way to say "no category". Its count is every design offered ON THIS CANVAS — derived, like the rest. */
  const railRows = [{ category: '', title: 'All sections', count: offered.length }, ...rows_]
  const choices = railRows.map((r) => ({ value: r.category, label: r.title }))

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
        <div id="picker-categories" className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto pr-[6px]">
          {/* the Kit's radio group, never a second arrow implementation: one Tab stop, the arrows move the choice.
              "All sections" is its first row and the heading sits UNDER it — S5a`:37`'s heading, renamed
              `CATEGORIES` because the row above it is now the one that says "all" (the owner's test of 2026-09-20). */}
          <div
            role="radiogroup"
            aria-label="Categories"
            onKeyDown={(event) => radioKeys(event, choices, (value) => setCategory(value || null))}
            className="flex flex-col gap-px"
          >
            {railRows.map((row, n) => {
              const on = row.category === (category ?? '')
              return (
                <Fragment key={row.category || 'all'}>
                  {/* S5a`:37`: mono 10.5, over the categories themselves */}
                  {n === 1 ? (
                    <p className="shrink-0 px-[10px] pb-[7px] pt-[10px] font-mono text-[10.5px] tracking-[0.02em] text-ink-soft-aa">CATEGORIES</p>
                  ) : null}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={n === tabStop(choices, category ?? '') ? 0 : -1}
                    onClick={() => setCategory(row.category || null)}
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
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* S5a`:79-86`: the header */}
        <div className="flex items-center gap-3 border-b border-line p-[16px_24px]">
          <h2 className="font-display text-[20px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
          <p className="font-mono text-[12px] text-ink-soft">{metaLine(shown.length, mode === 'dark')}</p>
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
        {/* the REGION is always in the tree and only its words arrive: a live region inserted already filled is
            often not announced (review, 2026-09-20) */}
        <p role="status" className={refusal ? 'border-b border-line bg-coral-tint p-[10px_24px] text-ui-dense text-coral-text' : 'sr-only'}>
          {refusal ? `This section cannot be added — ${refusal}.` : ''}
        </p>

        {empty ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="max-w-[420px]">
              <EmptyPanel title={empty.title} instruction={empty.instruction} />
            </div>
          </div>
        ) : (
          /* S5a`:88`'s grid, re-shaped by the owner's test: `COLUMNS` tiles of `ROW`, packed DENSE so a two-column
             band does not leave a hole behind it. A `group` with a label and the arrow walk on it, exactly as the
             icon picker's grid is. */
          <div
            ref={grid}
            data-picker-grid=""
            role="group"
            aria-label="Designs"
            /* a real grid runs ACROSS its rows in DOM order, so "right" is one cell and "down" is a whole row —
               `COLUMNS` is the one place that number lives, and the layout below reads the same constant */
            onKeyDown={(event) => gridKeys(event, { right: 1, down: 'nearest' })}
            style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`, gridAutoRows: `${ROW}px` }}
            className={`grid flex-1 gap-4 overflow-y-auto p-[20px_24px] [grid-auto-flow:row_dense] ${slimScrollbar}`}
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
                subject={subject}
                member={member}
                live={live}
                onAdd={onAdd}
              />
            ))}
          </div>
        )}
      </div>
    </dialog>
  )
}

/** S5a`:89-101` — one card, as the owner's test of 2026-09-20 re-shaped it. THE ADD BUTTON IS IN THE FOOTER STRIP,
 *  centred between the name and the tier badge, and it is an ICON, not a word: S5a's hover wash held the pill over
 *  the preview, and on a short section that rectangle is shorter than the pill, which is how he found it CUT OFF. A
 *  strip of its own cannot be cropped by the picture above it. The hover is a border and nothing else (R-154), so there is
 *  still exactly one interactive element per card and no interactive content over the `inert` preview frame. */
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
  subject,
  member,
  live,
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
  /** Story 5.13 — what the canvas behind the picker is rendering, so a card previews THAT page */
  subject?: orbitWeekly.Subject | null
  /** Story 5.14 — and as whom */
  member?: Visitor
  /** Story 5.18 — and with the canvas's content */
  live?: Live
  onAdd: (placement: Placement) => void
}) {
  // measured once, when the preview has been drawn; until then the card is one tile like any other
  const [span, setSpan] = useState<'wide' | 'tall' | null>(null)

  return (
    <div
      /* THE HOVER IS A BORDER AND NOTHING ELSE (the owner's test of 2026-09-20). S5a`:89-100` washes the preview,
         lifts the card 2px and swaps its shadow; he asked for none of the three — a wash over a miniature hides the
         very thing the miniature is for, and a card that moves under the pointer is a card you chase. */
      className={`group relative flex h-full flex-col overflow-hidden rounded-[12px] border border-line bg-surface shadow-sm transition-colors hover:border-coral focus-within:border-coral ${
        span === 'wide' ? 'col-span-2' : span === 'tall' ? 'row-span-2' : ''
      }`}
    >
      <SectionPreview
        entry={entry}
        target={target}
        rows={rows}
        pool={pool}
        icons={icons}
        mode={mode}
        src={src}
        subject={subject}
        member={member}
        live={live}
        onAspect={(aspect) => setSpan(spanFor(aspect))}
      />
      {/* S5a`:99`: the footer — the design's name at 13/600 and its tier badge, with the Add between them. Three
          tracks, the middle one auto, so the button is centred on the CARD however long the name is. */}
      <div className="grid h-[41px] shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 p-[10px_14px]">
        <span className="flex min-w-0 items-center gap-[5px]">
          <span className="truncate text-ui-dense font-semibold text-ink">{entry.name}</span>
          {/* R-152: the mark, before the press. `title` on the wrapper, because an SVG's own title is not a tooltip */}
          {siteWide ? (
            <span title={SITE_WIDE_WORDS} className="flex shrink-0 text-ink-soft">
              <Globe size={13} aria-hidden />
            </span>
          ) : null}
        </span>
        <button
          type="button"
          data-cell=""
          data-design={entry.id}
          // the first card is the grid's one Tab stop; the arrows rove from there (the icon picker's own pattern)
          tabIndex={first ? 0 : -1}
          // R-152's words are part of the name, because a glyph and a hover are invisible to a screen reader
          aria-label={`Add ${entry.name}, ${entry.categoryTitle}, ${entry.tier === 'pro' ? 'Pro' : 'Free'}${siteWide ? `, ${SITE_WIDE_WORDS}` : ''}`}
          title="Add"
          onClick={() => onAdd({ entry, siteWide })}
          /* shown on hover, on focus, and ALWAYS where there is no pointer to hover with — a tablet is inside this
             surface's range (`EXPERIENCE.md:60`) and an add button it can never reveal is an add button it has not got */
          className={`inline-flex size-[26px] items-center justify-center rounded-[8px] bg-coral-text text-surface opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 ${ring}`}
        >
          <Plus size={14} aria-hidden />
        </button>
        {/* the owner's ruling of 2026-09-20: the CATEGORY before the tier pill, in the rail heading's own mono 10.5 —
            it is a label beside a name, not a second name, and a search crosses the rail so the card must say where
            it came from. No new size and no new token. */}
        <span className="flex min-w-0 items-center justify-end gap-[6px]">
          <span className="truncate font-mono text-[10.5px] tracking-[0.02em] text-ink-soft-aa">{entry.categoryTitle}</span>
          {entry.tier === 'pro' ? <ProBadge /> : <FreeBadge />}
        </span>
      </div>
    </div>
  )
}
