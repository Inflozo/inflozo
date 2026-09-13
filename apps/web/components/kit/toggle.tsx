import type { ReactNode } from 'react'
import { greyedProps, labelTone, reason, ring, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:99 — toggle, 36×20, coral when on.
   Greyed (P0-0): the track goes grey, the knob goes paper, and the toggle shows the state
   IN FORCE — not the state the user last chose.

   Story 4.5: `onToggle` makes it live; a greyed toggle answers nothing. No hooks. */

export function Toggle({
  id,
  label,
  checked = false,
  greyed,
  aside,
  onToggle,
}: {
  id: string
  label: string
  checked?: boolean
  greyed?: Greyed
  aside?: ReactNode
  onToggle?: (next: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-[6px] text-control-label font-medium ${labelTone(greyed)}`}>
          <span id={`${id}-label`}>{label}</span>
          {aside}
        </span>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          aria-labelledby={`${id}-label`}
          onClick={onToggle && !greyed ? () => onToggle(!checked) : undefined}
          className={`relative h-5 w-9 rounded-thumb ${ring} ${
            greyed ? 'cursor-not-allowed bg-grey-track' : checked ? 'bg-coral' : 'bg-line-strong'
          }`}
          {...greyedProps(id, greyed)}
        >
          <span
            aria-hidden
            className={`absolute top-[2px] size-4 rounded-full shadow-sm ${greyed ? 'bg-paper' : 'bg-surface'} ${checked ? 'right-[2px]' : 'left-[2px]'}`}
          />
        </button>
      </div>
      {reason(id, greyed)}
    </div>
  )
}
