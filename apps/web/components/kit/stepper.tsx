import type { ReactNode } from 'react'
import { greyedProps, labelTone, reason, ring, type Greyed } from './greyed'
import { Minus, Plus } from './icons'

/* Editor Sidebar Kit.dc.html:99 — stepper, `− n +` with tabular numerals.
   Greyed (P0-0): it shows the number that WILL RENDER, not the one last chosen.

   Story 4.5: `onStep` makes it live. At `min` the − and at `max` the + go placeholder-grey and do
   nothing — P0-3's "at the cap the + goes placeholder-grey" — while staying focusable
   `aria-disabled`, never `disabled`. No hooks: without `onStep` it is `/kit`'s static drawing.

   Story 6.4 — THE BOX ALONE (`StepperBox`), for a row that draws its own label: S7a's Pill radius row puts the name above
   it, as its segmented rows do, and S7c's Image scrim row puts each mode's word before it. The box is the Kit's drawing
   unchanged — save that the value grows past its 32px when a step's words need it ("100 %"), and stays 32 below.

   Story 7.9 — D6a's POSTS PER PAGE, the first stepper that SAVES: with `name` each step is a real submit of its form,
   posting `name` = the value it steps to, so it is a plain form's submit (R-98); `onStep`, when given as well, takes the
   press while scripts run. At an end the step submits nothing at all — `type="button"`, so a spent − can never post 0.
   `busy` is the form posting (`aria-busy`, never `disabled`); the caller says "Saving…" beside it. `large` is D6a's own
   drawing (`D6 Theme Settings Completed.dc.html:56-60`): 38 tall, 36-wide steps on hairlines, the value 56 wide at 14/600. */

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
  name,
  busy = false,
  large = false,
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
  /** Story 7.9 — each step submits its form, posting this field at the value it steps to */
  name?: string
  /** Story 7.9 — the form is posting */
  busy?: boolean
  /** Story 7.9 — D6a's Posts per page drawing */
  large?: boolean
}) {
  const step = (dir: 1 | -1, end: boolean) => {
    const stopped = Boolean(greyed) || end
    const submits = name !== undefined && !stopped
    return {
      // A BLIND SPOT, SAID WHERE IT IS (standing rule 3): `busy.test.ts` audits every submit by the LITERAL `type="submit"`,
      // and this one is computed, so that auditor cannot see it. What holds its busy state is the deployed walk's step 104
      // (`tools/probe/run-verify-editor.cjs`): Posts per page's + held mid-post, read for "Saving…" and `aria-busy`.
      type: submits ? ('submit' as const) : ('button' as const),
      name: submits ? name : undefined,
      value: submits ? String(at + dir) : undefined,
      tabIndex: greyed ? -1 : 0,
      'aria-disabled': (!greyed && end) || undefined,
      'aria-busy': busy || undefined,
      onClick: onStep && !stopped
        ? (event: { preventDefault: () => void }) => {
            event.preventDefault()
            onStep(dir)
          }
        : undefined,
      className: `inline-flex items-center justify-center ${large ? `h-[38px] w-9 border-line ${dir < 0 ? 'border-r' : 'border-l'}` : 'h-7 w-[26px]'} ${ring} ${
        stopped ? 'cursor-not-allowed text-line-strong' : `${large ? 'text-ink-mid' : 'text-ink-soft'} hover:bg-paper`
      }`,
    }
  }
  return (
    <div
      id={id}
      role="group"
      aria-labelledby={`${id}-label`}
      className={`flex items-center overflow-hidden rounded-sm border ${ring} ${large ? 'h-[38px] w-max' : ''} ${greyed ? 'border-grey-border bg-grey-field' : 'border-line bg-surface'}`}
      {...greyedProps(id, greyed)}
    >
      <button aria-label={`Fewer ${label}`} {...step(-1, min !== undefined && at <= min)}>
        {large ? <Minus size={12} strokeWidth={2.2} /> : '−'}
      </button>
      <span
        aria-live={onStep || name ? 'polite' : undefined}
        className={`text-center font-semibold tabular-nums ${large ? 'w-14 text-[14px]' : 'min-w-8 text-ui-dense'} ${greyed ? 'text-ink-faint' : 'text-ink'}`}
      >
        {value}
      </span>
      <button aria-label={`More ${label}`} {...step(1, max !== undefined && at >= max)}>
        {large ? <Plus size={12} strokeWidth={2.2} /> : '+'}
      </button>
    </div>
  )
}
