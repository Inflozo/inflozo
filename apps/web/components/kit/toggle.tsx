import { greyedProps, labelTone, reason, ring, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:99 — toggle, 36×20, coral when on.
   Greyed (P0-0): the track goes grey, the knob goes paper, and the toggle shows the state
   IN FORCE — not the state the user last chose. */

export function Toggle({
  id,
  label,
  checked = false,
  greyed,
}: {
  id: string
  label: string
  checked?: boolean
  greyed?: Greyed
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between">
        <span id={`${id}-label`} className={`text-control-label font-medium ${labelTone(greyed)}`}>
          {label}
        </span>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          aria-labelledby={`${id}-label`}
          className={`relative h-5 w-9 rounded-thumb ${ring} ${
            greyed ? 'cursor-not-allowed bg-grey-border' : checked ? 'bg-coral' : 'bg-line-strong'
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
