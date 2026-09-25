import type { HTMLAttributes, ReactNode } from 'react'
import { DragGrip } from './grip'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:220 — layers rows: grip, mini-thumbnail, name, eye.
   Four states: rest, hover (the 40% wash — D8e draws it; the older Kit row drew an ink 4%
   wash, and DESIGN.md follows D8e), selected (coral-tint), and keyboard focus —
   THE SOLID RING DRAWN OVER WHICHEVER STATE THE ROW IS ALREADY IN, so focused-and-selected
   reads as both (D8 Editor Below 1440, D8e).

   STORY 5.4 MADE THE INTERACTIVE ROW THE EDITOR'S ROW, and corrected two things the Kit drew in Story 1.3:

   THE RING IS ON THE ROW, not on the name button alone — that is what D8e's REST · FOCUSED and SELECTED · FOCUSED
   frames draw, and the row is the editor's one tab stop per section (roving tabindex, `controls/layers.tsx`), because
   the keyboard path for the drag is the row's own ⌥↑/⌥↓ (UX-DR10). So the grip is `aria-hidden` and POINTER-ONLY: a
   button there would be a second tab stop promising a keyboard drag it does not perform.

   R-126 (owner, 2026-09-18) TOOK THE EYE OFF THE ROW AND SHRANK THE NAME. The row's only control is now the `⋯`,
   and Hide/Show is a row IN that menu — the panel is 240px wide and an eye, a grip, a thumbnail and a name were
   truncating the one thing a layer list exists to show. The name is `text-helper-caption`. A hidden row still reads
   as hidden: its words are `text-ink-soft`, and its menu says Show rather than Hide. `Space` on the focused row is
   untouched — it is a key, not a control, so UX-DR10's keyboard path costs no width.

   `SiteWideGroup` IS NO LONGER A CARD, by the same ruling: it draws the heading and the rows exactly as the page
   group does, with a hairline between the two groups and no glyph. B7 draws a pinned white card with a globe; the
   owner's is the later word (R-74 makes the export the authority, and this is his ruling against it, recorded). */

type RowProps = {
  name: string
  selected?: boolean
  /** Story 5.2: the wash a hovered section's row carries — the canvas's hover mirrored, for the display-only row */
  hovered?: boolean
  shown?: boolean
  thumb?: ReactNode
  /** The gallery pins a state the frame draws (hover) with it; nothing else needs it. */
  className?: string
  /** Story 5.1: `false` draws the thumb and the name as text and nothing else — no grip, no button, no eye, no hover of
   *  its own, and `shown` is IGNORED. Since Story 5.2 it DISPLAYS the canvas's state — `selected` in coral tint and
   *  `hovered` in the wash, as the interactive row draws them. Story 5.4 made the editor's rows interactive, so the
   *  display-only row is now the `/kit` gallery's and any later read-only list's. */
  interactive?: boolean
  /** Story 5.4 — pressing the name selects the section (R-123: a press on a row never deselects) */
  onSelect?: () => void
  /** Story 5.4 — the grip's pointer handlers and its `data-*`; `aria-hidden` and pointer-only either way */
  gripProps?: HTMLAttributes<HTMLSpanElement>
  /** Story 5.4 — the `…` overflow and its menu: since R-126 the row's ONLY control. Absent on a row with no menu. */
  overflow?: ReactNode
  /** Story 5.19 — D5c's chip, after the name and before the `…`: the MAIN FEED marker. Words, not a control. */
  chip?: ReactNode
}

export function LayersRow({
  name,
  selected = false,
  hovered = false,
  shown = true,
  thumb,
  className = '',
  interactive = true,
  onSelect,
  gripProps,
  overflow,
  chip,
  ...rest
}: RowProps & Omit<HTMLAttributes<HTMLDivElement>, keyof RowProps>) {
  if (!interactive) {
    return (
      <div className={`flex items-center gap-2 rounded-sm px-2 py-[7px] ${selected ? 'bg-coral-tint' : hovered ? 'bg-coral-wash' : ''} ${className}`}>
        {thumb ?? <LayerThumb />}
        <span className={`flex-1 text-ui-dense ${selected ? 'font-semibold' : 'font-medium'} text-ink`}>{name}</span>
      </div>
    )
  }
  return (
    <div
      // The ring is the row's, over whichever state it is already in (D8e), which is why it is not on the name button.
      className={`group flex items-center gap-2 rounded-sm px-2 py-[7px] ${ring} ${
        selected ? 'bg-coral-tint' : hovered ? 'bg-coral-wash' : 'hover:bg-coral-wash'
      } ${className}`}
      {...rest}
    >
      <span aria-hidden {...gripProps} className={`flex shrink-0 items-center ${gripProps ? 'cursor-grab touch-none' : ''}`}>
        <DragGrip />
      </span>
      {thumb ?? <LayerThumb />}
      <button
        type="button"
        tabIndex={-1}
        aria-current={selected ? 'true' : undefined}
        // a press on the name puts focus on the ROW, the one tab stop, so ⌥-arrows, Space and Enter work right after a
        // click and not only after a Tab (review, 2026-09-18) — the button itself is never a stop
        onClick={(event) => {
          event.currentTarget.parentElement?.focus()
          onSelect?.()
        }}
        className={`min-w-0 flex-1 truncate text-left text-helper-caption ${selected ? 'font-semibold' : 'font-medium'} ${
          shown ? 'text-ink' : 'text-ink-soft'
        } outline-none`}
      >
        {name}
      </button>
      {chip}
      {overflow}
    </div>
  )
}

export const LayerThumb = () => (
  <span aria-hidden className="flex h-[21px] w-[30px] gap-[2px] rounded-[4px] border border-line bg-surface p-[3px]">
    <span className="flex flex-1 flex-col justify-center gap-[2px]">
      <span className="h-[3px] rounded-[1px] bg-ink" />
      <span className="h-[2px] w-[70%] rounded-[1px] bg-line-strong" />
    </span>
    <span className="w-[10px] rounded-[2px] bg-coral opacity-70" />
  </span>
)

/** The site-wide group (R-126): the SAME shape as the page group — a heading, a right-aligned mono count and the
    rows — with a hairline under it dividing the two. `pages` is the derived template count (standing rule 4), and it
    is the whole of what the retired footed note used to repeat: `Site-wide` · `6 templates`, on one line. */
export function SiteWideGroup({ children, pages }: { children: ReactNode; pages: number }) {
  return (
    <div className="flex flex-col gap-[2px] border-b border-line pb-[10px]">
      <div className="flex items-center gap-[6px] px-[5px] pb-[5px]">
        <span className="flex-1 text-helper-caption font-semibold tracking-[0.04em] text-ink-soft uppercase">
          Site-wide
        </span>
        <span className="font-mono text-helper-caption text-ink-soft">
          {pages === 1 ? '1 template' : `${pages} templates`}
        </span>
      </div>
      {children}
    </div>
  )
}
