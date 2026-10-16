import type { ReactNode } from 'react'
import { CheckCircleSolid } from './icons'
import { ring } from './greyed'
import { BusyLabel } from './submit'

/* Editor Sidebar Kit.dc.html:242 — the toast: a bottom-centre pill, icon + message +
   action, on surface with the lg shadow.

   Story 7.16a — the action PRESSES (`onAction`): it was drawn and inert until the Routes Manager's Undo needed it. While
   the action's work is in flight it says so in place (`busy`, R-98) through the Kit's one `BusyLabel`, so the pill does not
   change width, and a second press is refused (`aria-disabled`, never `disabled` — it keeps focus). */

export function Toast({ children, action, onAction, pending = false, busy }: {
  children: ReactNode
  action?: string
  /** Story 7.16a — what the action does; without it the action is the Kit's static drawing */
  onAction?: () => void
  /** Story 7.16a — the action's work is in flight */
  pending?: boolean
  /** Story 7.16a — the action's present-tense busy label (R-98) */
  busy?: string
}) {
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
          <button
            type="button"
            aria-disabled={pending || undefined}
            aria-busy={pending || undefined}
            onClick={pending ? undefined : onAction}
            className={`text-ui-dense font-semibold text-coral-text ${ring}`}
          >
            {busy === undefined ? action : <BusyLabel pending={pending} busy={busy}>{action}</BusyLabel>}
          </button>
        </>
      ) : null}
    </div>
  )
}
