import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { DragGrip } from './grip'
import { Globe } from './icons'
import { Visibility } from './visibility'
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

   THE EYE IS REVEALED, not always drawn: B7 draws it on the selected row and on the hidden one, and D8e draws it on
   the hovered one — so it appears on hover (the row's OWN pointer hover and the canvas's hover mirrored onto it
   alike), on selection, while the row holds focus anywhere inside it, and whenever
   the section is hidden, which is the one state that must read from across the panel. A hidden row's words go
   `text-ink-soft` with the eye crossed out (B7's "About, short").

   `SiteWideGroup`'s icon is the Kit's `Globe` and not a `DragGrip`: a grip on that card promises a drag it does not
   have — B7's own note is that the three site-wide sections cannot be reordered against page sections, and the card
   boundary is what says so. FR-D5 calls the mark "a globe badge"; B7 draws an arrow-on-a-stem the Kit has no glyph
   for, and `Globe` is the PRD's word and already in the app's vocabulary. */

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
  /** Story 5.4 — the row itself, for the roving tabindex's focus call */
  rowRef?: Ref<HTMLDivElement>
  /** Story 5.4 — pressing the name selects the section (R-123: a press on a row never deselects) */
  onSelect?: () => void
  /** Story 5.4 — the eye, and `Space` on the focused row */
  onToggleShown?: () => void
  /** Story 5.4 — the grip's pointer handlers and its `data-*`; `aria-hidden` and pointer-only either way */
  gripProps?: HTMLAttributes<HTMLSpanElement>
  /** Story 5.4 — the `…` overflow and its menu, drawn before the eye. Absent on a row with no menu. */
  overflow?: ReactNode
}

export function LayersRow({
  name,
  selected = false,
  hovered = false,
  shown = true,
  thumb,
  className = '',
  interactive = true,
  rowRef,
  onSelect,
  onToggleShown,
  gripProps,
  overflow,
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
      ref={rowRef}
      // `group`: the eye reads the row's hover and its focus-within off it. The ring is the row's, over whichever
      // state it is already in (D8e), which is why it is not on the name button.
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
        onClick={onSelect}
        className={`min-w-0 flex-1 truncate text-left text-ui-dense ${selected ? 'font-semibold' : 'font-medium'} ${
          shown ? 'text-ink' : 'text-ink-soft'
        } ${ring}`}
      >
        {name}
      </button>
      {overflow}
      {/* `hovered` is the CANVAS's hover mirrored onto the row (Story 5.2), and the pointer is over the iframe — no
          CSS `:hover` reaches here — so it must reveal the eye itself, or D8e's HOVER · THE WASH would draw the wash
          without the eye it is drawn with. */}
      <span
        className={`flex shrink-0 ${
          shown && !selected && !hovered ? 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100' : ''
        }`}
      >
        <Visibility shown={shown} name={name} onToggle={onToggleShown} tabIndex={-1} />
      </span>
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

/** The site-wide group: a separate white card with its own globe badge and a template count, so it reads
    as pinned rather than merely first (FR-D5, B7). */
export function SiteWideGroup({ children, pages }: { children: ReactNode; pages: number }) {
  return (
    <div className="flex flex-col gap-1 rounded border border-line bg-surface p-2 shadow-sm">
      <div className="flex items-center gap-2 px-1">
        <Globe size={11} className="shrink-0 text-ink-soft" />
        <span className="flex-1 text-helper-caption font-semibold tracking-[0.04em] text-ink-soft uppercase">
          Site-wide
        </span>
        <span className="font-mono text-helper-caption text-ink-soft">
          {pages === 1 ? 'on 1 template' : `on all ${pages} templates`}
        </span>
      </div>
      {children}
    </div>
  )
}
