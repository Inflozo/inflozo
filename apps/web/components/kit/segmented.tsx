import { greyedProps, labelTone, marked, reason, ring, type Greyed } from './greyed'
import { MoonBadge } from './moon-badge'

/* Editor Sidebar Kit.dc.html:63 — segmented. A pill track on paper-sunk; the active
   segment is surface + sm. NAMED VALUES ONLY, never numbers (Appendix C).
   Greyed (P0-0): the track goes grey-field and the pill stays on the value IN FORCE —
   and when that value is not one of its own, `greyed.value: null` marks none (R-69).
   P0-0 :96 fills the greyed active pill one unit off paper-raised (…F6 for …F5), read as the
   same value rather than a token of its own. */

export function Segmented({
  id,
  label,
  options,
  active,
  greyed,
  moon = false,
}: {
  id: string
  label: string
  options: string[]
  active: string
  greyed?: Greyed
  moon?: boolean
}) {
  const on = marked(active, greyed)
  return (
    <div className="flex flex-col gap-[5px]">
      <span
        id={`${id}-label`}
        className={`flex items-center gap-[6px] text-control-label font-medium ${labelTone(greyed)}`}
      >
        {label}
        {moon ? <MoonBadge /> : null}
      </span>
      <div
        id={id}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className={`flex rounded-pill p-[3px] ${ring} ${greyed ? 'bg-grey-field' : 'bg-paper-sunk'}`}
        {...greyedProps(id, greyed)}
      >
        {options.map((option) => {
          const active_ = option === on
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active_}
              tabIndex={greyed ? -1 : 0}
              className={`flex-1 rounded-[20px] py-1 text-center text-[11.5px] ${ring} ${
                active_
                  ? `font-semibold shadow-sm ${greyed ? 'bg-paper-raised text-ink-faint' : 'bg-surface text-ink'}`
                  : `font-medium ${greyed ? 'text-line-strong cursor-not-allowed' : 'text-ink-soft'}`
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
      {reason(id, greyed)}
    </div>
  )
}
