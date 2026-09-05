import type { ReactNode } from 'react'
import { ring } from './greyed'

/* The ink pill that floats over the canvas — B Missing Surfaces B4a/B4b, and DESIGN.md
   § Components `canvas-pill`: 10px radius, 4px padding, the lg shadow, an ink ground and
   30px targets. NO CORAL EXCEPT WHERE SOMETHING IS LIVE (the caret in the link field).
   This and the paywall editor's surround are the only dark ground the app has: there is no
   app dark palette, and none is invented here (owner, 2026-09-05). */

export const CanvasPill = ({ label, children }: { label: string; children: ReactNode }) => (
  <div
    role="toolbar"
    aria-label={label}
    className="inline-flex items-center gap-px self-start rounded-thumb bg-ink p-1 shadow-lg"
  >
    {children}
  </div>
)

/** A 30px target inside the pill. */
export const CanvasPillButton = ({
  label,
  disabled = false,
  children,
}: {
  label: string
  disabled?: boolean
  children: ReactNode
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    className={`flex size-[30px] items-center justify-center rounded-[7px] text-surface transition-colors duration-fast ease-out hover:bg-surface/15 disabled:opacity-35 disabled:hover:bg-transparent ${ring}`}
  >
    {children}
  </button>
)
