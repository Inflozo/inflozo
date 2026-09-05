import type { ReactNode } from 'react'
import { CheckCircleSolid } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:242 — the toast: a bottom-centre pill, icon + message +
   action, on surface with the lg shadow. */

export function Toast({ children, action }: { children: ReactNode; action?: string }) {
  return (
    <div
      role="status"
      className="inline-flex items-center gap-[10px] self-center rounded-pill border border-line bg-surface px-4 py-[9px] shadow-lg"
    >
      <CheckCircleSolid className="shrink-0 text-mint" />
      <span className="text-ui-dense font-medium text-ink">{children}</span>
      {action ? (
        <>
          <span aria-hidden className="h-[14px] w-px bg-line" />
          <button type="button" className={`text-ui-dense font-semibold text-coral-text ${ring}`}>
            {action}
          </button>
        </>
      ) : null}
    </div>
  )
}
