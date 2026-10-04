import type { ReactNode } from 'react'
import { greyedProps, labelTone, reason, ring, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:99 — stepper, `− n +` with tabular numerals.
   Greyed (P0-0): it shows the number that WILL RENDER, not the one last chosen.

   Story 4.5: `onStep` makes it live. At `min` the − and at `max` the + go placeholder-grey and do
   nothing — P0-3's "at the cap the + goes placeholder-grey" — while staying focusable
   `aria-disabled`, never `disabled`. No hooks: without `onStep` it is `/kit`'s static drawing.

   Story 6.4 — THE BOX ALONE (`StepperBox`), for a row that draws its own label: S7a's Pill radius row puts the name above
   it, as its segmented rows do, and S7c's Image scrim row puts each mode's word before it. The box is the Kit's drawing
   unchanged — save that the value grows past its 32px when a step's words need it ("100 %"), and stays 32 below. */

export function Stepper({
  id,
  label,
  value,
  greyed,
  min,
  max,
  aside,
  onStep,
}: {
  id: string
  label: string
  value: number | string
  greyed?: Greyed
  min?: number
  max?: number
  aside?: ReactNode
  onStep?: (step: 1 | -1) => void
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-[6px] text-control-label font-medium ${labelTone(greyed)}`}>
          <span id={`${id}-label`}>{label}</span>
          {aside}
        </span>
        <StepperBox id={id} label={label} value={value} greyed={greyed} min={min} max={max} onStep={onStep} />
      </div>
      {reason(id, greyed)}
    </div>
  )
}

/** The Kit's `− n +` box, labelled by `${id}-label` — which the caller draws, where its row draws it. `at` says where the
 *  value stands for a value that is words rather than a number ("Full", "45 %"): the − is spent at `min`, the + at `max`. */
export function StepperBox({
  id,
  label,
  value,
  at = Number(value),
  greyed,
  min,
  max,
  onStep,
}: {
  id: string
  /** the steppers' own words: "Fewer {label}", "More {label}" */
  label: string
  value: number | string
  at?: number
  greyed?: Greyed
  min?: number
  max?: number
  onStep?: (step: 1 | -1) => void
}) {
  const step = (dir: 1 | -1, end: boolean) => {
    const stopped = Boolean(greyed) || end
    return {
      tabIndex: greyed ? -1 : 0,
      'aria-disabled': (!greyed && end) || undefined,
      onClick: onStep && !stopped ? () => onStep(dir) : undefined,
      className: `inline-flex h-7 w-[26px] items-center justify-center ${ring} ${
        stopped ? 'cursor-not-allowed text-line-strong' : 'text-ink-soft hover:bg-paper'
      }`,
    }
  }
  return (
    <div
      id={id}
      role="group"
      aria-labelledby={`${id}-label`}
      className={`flex items-center overflow-hidden rounded-sm border ${ring} ${greyed ? 'border-grey-border bg-grey-field' : 'border-line bg-surface'}`}
      {...greyedProps(id, greyed)}
    >
      <button type="button" aria-label={`Fewer ${label}`} {...step(-1, min !== undefined && at <= min)}>
        −
      </button>
      <span
        aria-live={onStep ? 'polite' : undefined}
        className={`min-w-8 text-center text-ui-dense font-semibold tabular-nums ${greyed ? 'text-ink-faint' : 'text-ink'}`}
      >
        {value}
      </span>
      <button type="button" aria-label={`More ${label}`} {...step(1, max !== undefined && at >= max)}>
        +
      </button>
    </div>
  )
}
