import { greyedProps, reason, ring, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:117 — radio cards. The selected card takes a coral border and
   a tint wash, and EACH CARD CARRIES ONE LINE OF CONSEQUENCE, PLAINLY SAID. Hover firms up
   the hairline. Inline radios inside a list are a 13px circle with a coral dot. */

export type RadioOption = { value: string; title: string; consequence: string }

export function RadioCards({
  id,
  label,
  options,
  active,
  greyed,
}: {
  id: string
  label: string
  options: RadioOption[]
  active: string
  greyed?: Greyed
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <div id={id} role="radiogroup" aria-labelledby={`${id}-label`} className="flex flex-col gap-[10px]" {...greyedProps(id, greyed)}>
        {options.map(({ value, title, consequence }) => {
          const on = value === active
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={greyed ? -1 : 0}
              className={`flex gap-[11px] rounded-thumb border p-[12px_13px] text-left ${ring} ${
                on ? 'border-coral bg-coral-tint' : 'border-line hover:border-line-strong'
              }`}
            >
              <span
                aria-hidden
                className={`mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] ${on ? 'border-coral' : 'border-line-strong'}`}
              >
                {on ? <span className="size-2 rounded-full bg-coral" /> : null}
              </span>
              <span className="flex flex-col gap-[2px]">
                <span className="text-ui-dense font-semibold text-ink">{title}</span>
                <span className="text-control-label text-ink-soft">{consequence}</span>
              </span>
            </button>
          )
        })}
      </div>
      {reason(id, greyed)}
    </div>
  )
}

/** Inline radios in a list: a 13px circle, coral dot when picked. */
export function InlineRadio({ label, picked }: { label: string; picked: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-[7px] text-[12.5px] ${picked ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}`}
    >
      <span
        aria-hidden
        className={`inline-flex size-[13px] items-center justify-center rounded-full border-[1.5px] ${picked ? 'border-coral' : 'border-line-strong'}`}
      >
        {picked ? <span className="size-[6px] rounded-full bg-coral" /> : null}
      </span>
      {label}
    </span>
  )
}
