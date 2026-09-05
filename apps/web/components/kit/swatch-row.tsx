import { greyedProps, labelTone, reason, ring, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:85 — swatch row. Seven colour roles as 24px circles, each
   with its name; active takes a coral ring. NEVER a raw colour picker — that lives only
   in the Style Pack editor (DESIGN.md Don'ts). The circles carry the SITE's colours, which
   arrive as CSS colour strings from the project's Style Pack; they are content, not app
   chrome, which is why they are the one place a colour value is passed in rather than
   named by a token. */

export type Swatch = { role: string; color: string }

export function SwatchRow({
  id,
  label = 'Colours',
  swatches,
  active,
  greyed,
}: {
  id: string
  label?: string
  swatches: Swatch[]
  active?: string
  greyed?: Greyed
}) {
  return (
    <div className="flex flex-col gap-3">
      <span id={`${id}-label`} className={`text-control-label font-medium ${labelTone(greyed)}`}>
        {label}
      </span>
      <div
        id={id}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="flex flex-wrap gap-[9px]"
        {...greyedProps(id, greyed)}
      >
        {swatches.map(({ role, color }) => (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={role === active}
            tabIndex={greyed ? -1 : 0}
            className={`flex flex-col items-center gap-1 ${ring} rounded-sm ${greyed ? 'cursor-not-allowed' : ''}`}
          >
            <span
              aria-hidden
              style={{ background: color }}
              className={`size-6 rounded-full shadow-hairline-inset ${role === active && !greyed ? 'shadow-[0_0_0_2px_var(--color-coral),inset_0_0_0_1px_rgba(28,27,26,.12)]' : ''}`}
            />
            <span className={`text-[9px] whitespace-nowrap ${greyed ? 'text-ink-faint' : 'text-ink-soft'}`}>
              {role}
            </span>
          </button>
        ))}
      </div>
      {reason(id, greyed)}
    </div>
  )
}
