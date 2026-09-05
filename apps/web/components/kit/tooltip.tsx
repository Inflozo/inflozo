import type { ReactNode } from 'react'

/* Editor Sidebar Kit.dc.html:185 — tooltips. Ink fill, white 12px, 6px radius, with a
   variant carrying a mono keyboard chip. A tooltip NEVER carries a greyed control's
   reason — that is text at the control (P0-0). */

export function Tooltip({ children, keys }: { children: ReactNode; keys?: string }) {
  return (
    <span
      role="tooltip"
      className="inline-flex items-center gap-[7px] rounded-[6px] bg-ink px-[9px] py-[5px] text-control-label font-medium text-surface shadow-md"
    >
      {children}
      {keys ? (
        <kbd className="rounded-[4px] border border-surface/30 bg-surface/15 px-[5px] font-mono text-[10px] leading-[1.5]">
          {keys}
        </kbd>
      ) : null}
    </span>
  )
}
