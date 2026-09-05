import { greyedProps, labelTone, reason, ring, type Greyed } from './greyed'
import { MoonBadge } from './moon-badge'

/* Editor Sidebar Kit.dc.html:63 — segmented. A pill track on paper-sunk; the active
   segment is surface + sm. NAMED VALUES ONLY, never numbers (Appendix C).
   Greyed (P0-0): the track goes grey-field and the pill stays on the value IN FORCE —
   and when that value is not one of its own, `greyed.value: null` marks none (R-69). */

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
  // R-69: the value in force is another control's, so no segment is marked.
  const marked = greyed && greyed.value === null ? null : active
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
        className={`flex rounded-pill p-[3px] ${greyed ? 'bg-grey-field' : 'bg-paper-sunk'}`}
        {...greyedProps(id, greyed)}
      >
        {options.map((option) => {
          const on = option === marked
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={greyed ? -1 : 0}
              className={`flex-1 rounded-[20px] py-1 text-center text-[11.5px] ${ring} ${
                on
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
