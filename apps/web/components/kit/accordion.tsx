import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:44 — accordion headers. A hairline above each header,
   12/600/0.04em uppercase in ink-soft, the chevron pointing up when the body is open. */

export function Accordion({
  id,
  title,
  open = false,
  children,
  onToggle,
}: {
  id: string
  title: string
  open?: boolean
  children?: ReactNode
  /** Story 4.5: the header opens and closes its body; the open state is the caller's. No hooks. */
  onToggle?: () => void
}) {
  const Chevron = open ? ChevronUp : ChevronDown
  return (
    <div className="flex flex-col">
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-controls={`${id}-body`}
        onClick={onToggle}
        className={`flex items-center justify-between border-t border-line px-[2px] py-[9px] text-left text-control-label font-semibold uppercase tracking-[0.04em] text-ink-soft ${ring}`}
      >
        {title}
        <Chevron size={13} />
      </button>
      <div id={`${id}-body`} role="region" aria-labelledby={id} hidden={!open}>
        {children}
      </div>
    </div>
  )
}
