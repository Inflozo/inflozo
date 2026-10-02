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
      // Story 5.22: on a touch screen the ⋯ is 44px (the editor's touch rule), and on the main feed's row D5c's chip then
      // left the name 32px to be pressed in — so there the gaps are 4px, and the name is at least a finger's 44.
      className={`group flex items-center gap-2 rounded-sm px-2 py-[7px] coarse:in-[[data-editor]]:gap-1 ${ring} ${
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

/* DW-281 (Story 5.24e): A PICTURE PER KIND OF SECTION, as S4 draws the five it shows (`S4 Editor.dc.html:54-58`) at
   30 × 21 and D8 the same five on its rail (`D8 Editor Below 1440.dc.html:66-70` at 34 × 24, `:196-200` at 26 × 19).
   Until this every row and tile drew Hero's. A1 Header, A4 Hero, A17 Post Grid, A22 Newsletter and A3 Footer have theirs;
   every other category, the fixtures and Ghost's own rows draw Hero's until a category's first story adds its own,
   extrapolated from these five (R-74; Epic 9's and Epic 10's preambles carry the rule). Colours are the token layer's:
   the frames' five fills are `line`, `line-strong`, `ink`, `coral` and `ink-soft` exactly; the Footer's dark ground is
   the nearest ink token, `ink-hover`; and the rail's selected edge, D8's tint, is the nearest coral tint,
   `coral-tint-strong` — never a new colour (`tokens.test.ts` refuses a literal in a `.tsx`, comments included). */
export type ThumbGlyph = 'header' | 'hero' | 'grid' | 'newsletter' | 'footer'
const GLYPHS: Readonly<Record<string, ThumbGlyph>> = { a1: 'header', a4: 'hero', a17: 'grid', a22: 'newsletter', a3: 'footer' }
/** the picture a category draws — Hero's for every category that has none of its own yet */
export const glyphOf = (category: string | null | undefined): ThumbGlyph => GLYPHS[category ?? ''] ?? 'hero'

/** Story 5.22 — `rail` is D8's icon rail: 26 × 19 on a mouse and, on touch, 34 × 24; `row` is S4's 30 × 21 Layers row.
 *  Each picture's inner sizes are the frame's own at each of the three. */
export const LayerThumb = ({ glyph = 'hero', at = 'row', selected = false }: { glyph?: ThumbGlyph; at?: 'row' | 'rail'; selected?: boolean }) => {
  const rail = at === 'rail'
  const box = rail ? 'h-[19px] w-[26px] p-[2px] coarse:h-6 coarse:w-[34px] coarse:p-[3px]' : 'h-[21px] w-[30px] p-[3px]'
  const edge = selected ? 'border-coral-tint-strong' : 'border-line'
  const shell = `flex shrink-0 ${box} gap-[2px] rounded-[4px] border ${edge} ${glyph === 'footer' ? 'bg-ink-hover' : 'bg-surface'}`
  return (
    <span aria-hidden data-glyph={glyph} className={`${shell} ${glyph === 'header' || glyph === 'newsletter' ? 'items-center' : ''}`}>
      {glyph === 'header' ? (
        <>
          <span className={`h-[3px] rounded-[1px] bg-line-strong ${rail ? 'w-[7px] coarse:w-[9px]' : 'w-[8px]'}`} />
          <span className={`ml-auto h-[3px] rounded-[1px] bg-coral ${rail ? 'w-[5px] coarse:w-[7px]' : 'w-[6px]'}`} />
        </>
      ) : glyph === 'grid' ? (
        <>
          <span className="flex-[1.4] rounded-[2px] bg-line" />
          <span className="flex flex-1 flex-col gap-[2px]">
            <span className="flex-1 rounded-[1px] bg-line" />
            <span className="flex-1 rounded-[1px] bg-line" />
          </span>
        </>
      ) : glyph === 'newsletter' ? (
        <>
          <span className="flex flex-1 flex-col gap-[2px]">
            <span className="h-[2px] rounded-[1px] bg-line-strong" />
            <span className="h-[2px] rounded-[1px] bg-line-strong" />
          </span>
          <span className={`rounded-[1px] bg-coral opacity-70 ${rail ? 'h-[6px] w-[8px] coarse:h-[7px] coarse:w-[10px]' : 'h-[6px] w-[9px]'}`} />
        </>
      ) : glyph === 'footer' ? (
        <>
          <span className="h-[3px] flex-1 rounded-[1px] bg-ink-soft" />
          <span className="h-[3px] flex-1 rounded-[1px] bg-ink-soft" />
          <span className="h-[3px] flex-1 rounded-[1px] bg-ink-soft" />
        </>
      ) : (
        <>
          <span className="flex flex-1 flex-col justify-center gap-[2px]">
            <span className="h-[3px] rounded-[1px] bg-ink" />
            <span className="h-[2px] w-[70%] rounded-[1px] bg-line-strong" />
          </span>
          <span className={`rounded-[2px] bg-coral opacity-70 ${rail ? 'w-[8px] coarse:w-[11px]' : 'w-[10px]'}`} />
        </>
      )}
    </span>
  )
}

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
