import type { ReactNode } from 'react'
import { greyedProps, labelTone, reason, ring, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:99 — toggle, 36×20, coral when on.
   Greyed (P0-0): the track goes grey, the knob goes paper, and the toggle shows the state
   IN FORCE — not the state the user last chose.

   Story 4.5: `onToggle` makes it live; a greyed toggle answers nothing. No hooks.

   Story 5.22 — ON A TOUCH SCREEN, INSIDE THE EDITOR, D8a's switch: 52 × 30 with a 24px knob 3px in, in a row at least
   44px tall (`D8 Editor Below 1440.dc.html:152`, `:156`). A switch is the one control the editor's 44px rule exempts,
   because the frame draws it wider than tall; so it is sized here, and only there (`in-[[data-editor]]`) — /kit and
   /controls keep 36 × 20, as a fine pointer does everywhere (D8b). The classes are written out whole: Tailwind finds a
   class by reading it, never by building it. */

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
      <div className="flex items-center justify-between coarse:in-[[data-editor]]:min-h-11">
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
          className={`relative h-5 w-9 rounded-thumb coarse:in-[[data-editor]]:h-[30px] coarse:in-[[data-editor]]:w-[52px] coarse:in-[[data-editor]]:rounded-pill ${ring} ${
            greyed ? 'cursor-not-allowed bg-grey-track' : checked ? 'bg-coral' : 'bg-line-strong'
          }`}
          {...greyedProps(id, greyed)}
        >
          <span
            aria-hidden
            className={`absolute top-[2px] size-4 rounded-full shadow-sm coarse:in-[[data-editor]]:top-[3px] coarse:in-[[data-editor]]:size-6 ${greyed ? 'bg-paper' : 'bg-surface'} ${
              checked ? 'right-[2px] coarse:in-[[data-editor]]:right-[3px]' : 'left-[2px] coarse:in-[[data-editor]]:left-[3px]'
            }`}
          />
        </button>
      </div>
      {reason(id, greyed)}
    </div>
  )
}
