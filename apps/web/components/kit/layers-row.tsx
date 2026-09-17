import type { ReactNode } from 'react'
import { DragGrip } from './grip'
import { Visibility } from './visibility'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:220 — layers rows: grip, mini-thumbnail, name, eye.
   Four states: rest, hover (the 40% wash — D8e draws it; the older Kit row drew an ink 4%
   wash, and DESIGN.md follows D8e), selected (coral-tint), and keyboard focus —
   THE SOLID RING DRAWN OVER WHICHEVER STATE THE ROW IS ALREADY IN, so focused-and-selected
   reads as both (D8 Editor Below 1440, D8e). */

export function LayersRow({
  name,
  selected = false,
  hovered = false,
  shown = true,
  thumb,
  className = '',
  interactive = true,
}: {
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
   *  `hovered` in the wash, as the interactive row draws them — and still cannot be pressed until Story 5.4 gives it
   *  its keys: absent, not greyed (UX-DR3). */
  interactive?: boolean
}) {
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
      className={`flex items-center gap-2 rounded-sm px-2 py-[7px] ${selected ? 'bg-coral-tint' : 'hover:bg-coral-wash'} ${className}`}
    >
      <DragGrip label={`Reorder ${name}`} />
      {thumb ?? <LayerThumb />}
      <button
        type="button"
        aria-current={selected ? 'true' : undefined}
        className={`flex-1 text-left text-ui-dense ${selected ? 'font-semibold' : 'font-medium'} text-ink ${ring}`}
      >
        {name}
      </button>
      <Visibility shown={shown} name={name} />
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

/** The site-wide group: a separate white card with its own drag icon and a page count,
    so it reads as pinned rather than merely first (FR-D5). */
export function SiteWideGroup({ children, pages }: { children: ReactNode; pages: number }) {
  return (
    <div className="flex flex-col gap-1 rounded border border-line bg-surface p-2 shadow-sm">
      <div className="flex items-center gap-2 px-1">
        <DragGrip />
        <span className="flex-1 text-helper-caption font-semibold tracking-[0.04em] text-ink-soft uppercase">
          Site-wide
        </span>
        <span className="font-mono text-helper-caption text-ink-soft">
          {pages} {pages === 1 ? 'page' : 'pages'}
        </span>
      </div>
      {children}
    </div>
  )
}
