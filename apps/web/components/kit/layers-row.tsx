import type { ReactNode } from 'react'
import { DragGrip } from './grip'
import { Visibility } from './visibility'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:220 — layers rows: grip, mini-thumbnail, name, eye.
   Four states: rest, hover (the 40% wash), selected (coral-tint), and keyboard focus —
   THE SOLID RING DRAWN OVER WHICHEVER STATE THE ROW IS ALREADY IN, so focused-and-selected
   reads as both (D8 Editor Below 1440, D8e). */

export function LayersRow({
  name,
  selected = false,
  shown = true,
  thumb,
}: {
  name: string
  selected?: boolean
  shown?: boolean
  thumb?: ReactNode
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-sm px-2 py-[7px] ${selected ? 'bg-coral-tint' : 'hover:bg-coral-wash/10'}`}
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
    <div className="flex flex-col gap-1 rounded-[12px] border border-line bg-surface p-2 shadow-sm">
      <div className="flex items-center gap-2 px-1">
        <DragGrip />
        <span className="flex-1 text-helper-caption font-semibold tracking-[0.04em] text-ink-soft uppercase">
          Site-wide
        </span>
        <span className="font-mono text-helper-caption text-ink-soft">
          {pages} pages
        </span>
      </div>
      {children}
    </div>
  )
}
