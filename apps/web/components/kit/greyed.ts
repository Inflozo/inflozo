import { createElement, type ReactNode } from 'react'

/**
 * A control that exists here but cannot act right now is GREYED, WITH THE REASON — one
 * sentence in the helper-caption slot, directly under the control, never a tooltip
 * (`P0-0 Greyed Control Pattern.dc.html`; UX-DR3, rulings R-33, R-68, R-69).
 *
 * The reason is part of the type, so a control cannot be greyed without one: the class of
 * bug is closed by the compiler rather than caught by a reviewer. A control that could
 * NEVER act here is absent instead, and the panel says why — that is the caller's
 * decision and this kit deliberately offers no "hidden" prop.
 */
export type Greyed = {
  reason: string
  /** R-69: the value in force is not this control's own, so mark no value. */
  value?: null
}

/**
 * P0-0: not focusable for editing, but read aloud with its reason —
 * "Overlay tint, Soft dark, unavailable — Not available while the media uses the accent colour."
 */
export function greyedProps(id: string, greyed?: Greyed) {
  return greyed
    ? {
        'aria-disabled': true,
        'aria-describedby': `${id}-reason`,
        'data-greyed': '',
        tabIndex: -1,
      }
    : {}
}

/** The sentence itself: 11.5px ink-soft, inside the control's own row group. */
export function reason(id: string, greyed?: Greyed): ReactNode {
  if (!greyed) return null
  return createElement(
    'p',
    { id: `${id}-reason`, className: 'text-[11.5px] leading-[1.5] text-ink-soft' },
    greyed.reason,
  )
}

/** The P0-0 treatment, in one place so no control invents its own grey. */
export const labelTone = (greyed?: Greyed) => (greyed ? 'text-ink-faint' : 'text-ink-soft')
export const fieldTone = (greyed?: Greyed) =>
  greyed ? 'bg-grey-field border-grey-border cursor-not-allowed' : 'bg-surface border-line'
export const valueTone = (greyed?: Greyed) => (greyed ? 'text-ink-faint' : 'text-ink')

/** One ring, everywhere (Calibration Set, 2026-09-04). Never the 40% coral wash. */
export const ring = 'outline-none focus-visible:shadow-focus'
