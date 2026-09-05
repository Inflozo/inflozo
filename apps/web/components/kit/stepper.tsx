import { greyedProps, labelTone, reason, ring, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:99 — stepper, `− n +` with tabular numerals.
   Greyed (P0-0): it shows the number that WILL RENDER, not the one last chosen. */

export function Stepper({
  id,
  label,
  value,
  greyed,
}: {
  id: string
  label: string
  value: number
  greyed?: Greyed
}) {
  const step = `inline-flex h-7 w-[26px] items-center justify-center ${ring} ${
    greyed ? 'cursor-not-allowed text-line-strong' : 'text-ink-soft hover:bg-paper'
  }`
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between">
        <span id={`${id}-label`} className={`text-control-label font-medium ${labelTone(greyed)}`}>
          {label}
        </span>
        <div
          id={id}
          role="group"
          aria-labelledby={`${id}-label`}
          className={`flex items-center overflow-hidden rounded-sm border ${ring} ${greyed ? 'border-grey-border bg-grey-field' : 'border-line bg-surface'}`}
          {...greyedProps(id, greyed)}
        >
          <button type="button" aria-label={`Fewer ${label}`} tabIndex={greyed ? -1 : 0} className={step}>
            −
          </button>
          <span
            className={`w-8 text-center text-ui-dense font-semibold tabular-nums ${greyed ? 'text-ink-faint' : 'text-ink'}`}
          >
            {value}
          </span>
          <button type="button" aria-label={`More ${label}`} tabIndex={greyed ? -1 : 0} className={step}>
            +
          </button>
        </div>
      </div>
      {reason(id, greyed)}
    </div>
  )
}
