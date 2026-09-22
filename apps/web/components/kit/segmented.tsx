import type { KeyboardEvent, ReactNode } from 'react'
import { nextIndex } from '@/lib/menu'
import { greyedProps, labelTone, marked, reason, ring, type Greyed } from './greyed'
import { HelperCaption } from './labels'
import { MoonBadge } from './moon-badge'

/* Editor Sidebar Kit.dc.html:63 — segmented. A pill track on paper-sunk; the active
   segment is surface + sm. A DESIGN'S CONTROLS take NAMED VALUES ONLY, never numbers (Appendix C) —
   the rule is about a count stored in a design's `controlSchema`; a page of the canvas is not one (Story 5.16).
   Greyed (P0-0): the track goes grey-field and the pill stays on the value IN FORCE —
   and when that value is not one of its own, `greyed.value: null` marks none (R-69).
   P0-0 :96 fills the greyed active pill one unit off paper-raised (…F6 for …F5), read as the
   same value rather than a token of its own.

   Story 4.5 gave it behaviour and changed nothing it draws. With `onChange` it is a live radio group:
   ONE Tab stop, the arrows move the choice (WAI-ARIA's radio group), and a single value switched off
   inside the live row — P0-0's "one grey, one meaning" — is placeholder-grey, `aria-disabled`,
   skipped by the arrows, and its sentence sits in the caption slot. No hooks: without `onChange` it
   is the static drawing `/kit` renders on the server, with no handler attached.

   Story 5.16 — THE INLINE LAYOUT is D5d's "Preview page" row (`D5 Canvas Markers and Template Switcher.dc.html:429`):
   the label on the left at 12/500, the track on the right, and fixed 34 × 26 items at 12px, the current one surface
   at a 20px radius and 12/600 with no shadow, as D5d draws it. The radio group and its keys are the Kit's own, above;
   only the drawing differs. Its `note` is the Kit's helper caption under the whole row (11px, `:31`), as D5d draws one
   under the Pagination row, and it is the radio group's description (R-181). */

/** A value, and the words the panel prints for it. A bare string is both. */
export type Option = string | { value: string; label: string; greyed?: string }

type Choice = { value: string; label: string; greyed?: string }
export const choices = (options: readonly Option[]): Choice[] =>
  options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))

/** The Tab stop: the value in force when it can be chosen, else the first value that can. */
export function tabStop(list: readonly Choice[], on: string | null) {
  const at = list.findIndex((c) => c.value === on && !c.greyed)
  return at >= 0 ? at : list.findIndex((c) => !c.greyed)
}

/** The arrows of a radio group: move to the next value that is not switched off, choose it and focus
 *  it. Shared by the segmented control and the swatch row, the two radio groups the Kit draws. */
export function radioKeys(event: KeyboardEvent<HTMLElement>, list: readonly Choice[], pick: (value: string) => void) {
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const radios = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')]
  let i = radios.indexOf(document.activeElement as HTMLElement)
  for (let n = 0; n < list.length; n++) {
    i = nextIndex(list.length, i, step)
    if (!list[i]?.greyed) break
  }
  const to = list[i]
  if (!to || to.greyed) return
  pick(to.value)
  radios[i]?.focus()
}

export function Segmented({
  id,
  label,
  options,
  active,
  greyed,
  moon = false,
  aside,
  layout = 'stacked',
  note,
  onChange,
}: {
  id: string
  label: string
  options: Option[]
  /** the value in force; `null` marks none */
  active: string | null
  greyed?: Greyed
  moon?: boolean
  /** beside the label: the moon's words, the reset icon */
  aside?: ReactNode
  /** `inline` is D5d's row: label left, track right, fixed 34 × 26 items (Story 5.16) */
  layout?: 'stacked' | 'inline'
  /** the inline layout's helper caption under the row, read as the group's description (Story 5.16, R-181) */
  note?: string
  onChange?: (value: string) => void
}) {
  const on = marked(active, greyed)
  const list = choices(options)
  // P0-0: a value switched off inside a live row says why in the row's own caption slot
  const off = greyed ? undefined : list.find((c) => c.greyed)?.greyed
  const caption = greyed ?? (off === undefined ? undefined : { reason: off })
  const stop = tabStop(list, on)
  const live = onChange !== undefined && !greyed
  // the inline layout is D5d's row alone: a page of the canvas is never greyed, has no moon and no aside, so this
  // branch draws none of them (review, 2026-09-22 — a caller that needs them uses the stacked layout)
  if (layout === 'inline') {
    return (
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between gap-2">
          <span id={`${id}-label`} className={`text-control-label font-medium ${labelTone(greyed)}`}>
            {label}
          </span>
          <div
            id={id}
            role="radiogroup"
            aria-labelledby={`${id}-label`}
            aria-describedby={note === undefined ? undefined : `${id}-note`}
            className={`flex shrink-0 rounded-pill bg-paper-sunk p-[3px] ${ring}`}
            onKeyDown={live ? (event) => radioKeys(event, list, onChange) : undefined}
          >
            {list.map((option, i) => {
              const active_ = option.value === on
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active_}
                  tabIndex={!greyed && i === stop ? 0 : -1}
                  onClick={live ? () => onChange(option.value) : undefined}
                  className={`flex h-[26px] w-[34px] items-center justify-center rounded-[20px] text-[12px] ${ring} ${
                    active_ ? 'bg-surface font-semibold text-ink' : 'text-ink-soft'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
        {note === undefined ? null : <HelperCaption id={`${id}-note`}>{note}</HelperCaption>}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-[5px]">
      <span className={`flex items-center gap-[6px] text-control-label font-medium ${labelTone(greyed)}`}>
        <span id={`${id}-label`}>{label}</span>
        {moon ? <MoonBadge /> : null}
        {aside}
      </span>
      <div
        id={id}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className={`flex rounded-pill p-[3px] ${ring} ${greyed ? 'bg-grey-field' : 'bg-paper-sunk'}`}
        onKeyDown={live ? (event) => radioKeys(event, list, onChange) : undefined}
        {...greyedProps(id, greyed)}
      >
        {list.map((option, i) => {
          const active_ = option.value === on
          const one = option.greyed !== undefined
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active_}
              aria-disabled={one || undefined}
              aria-describedby={one ? `${id}-reason` : undefined}
              tabIndex={!greyed && i === stop ? 0 : -1}
              onClick={live && !one ? () => onChange(option.value) : undefined}
              className={`flex-1 rounded-[20px] py-1 text-center text-[11.5px] ${ring} ${
                active_
                  ? `font-semibold shadow-sm ${greyed ? 'bg-paper-raised text-ink-faint' : 'bg-surface text-ink'}`
                  : `font-medium ${greyed ? 'text-line-strong cursor-not-allowed' : one ? 'text-ink-faint cursor-not-allowed' : 'text-ink-soft'}`
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {reason(id, caption)}
    </div>
  )
}
