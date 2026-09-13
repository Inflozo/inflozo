import type { ReactNode } from 'react'
import { greyedProps, labelTone, marked, reason, ring, type Greyed } from './greyed'
import { radioKeys, tabStop } from './segmented'

/* Editor Sidebar Kit.dc.html:85 — swatch row. Seven colour roles as 24px circles, each
   with its name; active takes a coral ring. NEVER a raw colour picker — that lives only
   in the Style Pack editor (DESIGN.md Don'ts). The circles carry the SITE's colours, which
   arrive as CSS colour strings from the project's Style Pack; they are content, not app
   chrome, which is why they are the one place a colour value is passed in rather than
   named by a token.

   Story 4.5: a live radio group with `onChange` — one Tab stop, arrows move the choice (the same
   `radioKeys` the segmented control uses). A role with no colour of its own — Background role's
   Image — carries a `glyph` in its circle instead. One role switched off inside a live row greys the
   P0-0 way: its name placeholder-grey, `aria-disabled`, not selectable, and the sentence under the
   row. No hooks: without `onChange` it is `/kit`'s static drawing. */

export type Swatch = {
  /** the value */
  role: string
  /** the words under the circle, when they are not the value itself */
  label?: string
  color?: string
  /** drawn in the circle instead of a colour */
  glyph?: ReactNode
  /** this one role is switched off inside a live row, and why */
  greyed?: string
}

export function SwatchRow({
  id,
  label = 'Colours',
  swatches,
  active,
  greyed,
  aside,
  onChange,
}: {
  id: string
  label?: string
  swatches: Swatch[]
  active?: string | null
  greyed?: Greyed
  aside?: ReactNode
  onChange?: (role: string) => void
}) {
  const on = marked(active ?? null, greyed)
  const list = swatches.map((s) => ({ value: s.role, label: s.label ?? s.role, greyed: s.greyed }))
  const off = greyed ? undefined : swatches.find((s) => s.greyed !== undefined)?.greyed
  const caption = greyed ?? (off === undefined ? undefined : { reason: off })
  const stop = tabStop(list, on)
  const live = onChange !== undefined && !greyed
  return (
    <div className="flex flex-col gap-3">
      <span className={`flex items-center gap-[6px] text-control-label font-medium ${labelTone(greyed)}`}>
        <span id={`${id}-label`}>{label}</span>
        {aside}
      </span>
      <div
        id={id}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className={`flex flex-wrap gap-[9px] ${ring}`}
        onKeyDown={live ? (event) => radioKeys(event, list, onChange) : undefined}
        {...greyedProps(id, greyed)}
      >
        {swatches.map(({ role, label: words, color, glyph, greyed: one }, i) => {
          const picked = role === on
          const disabled = Boolean(greyed) || one !== undefined
          return (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={picked}
            aria-disabled={one !== undefined || undefined}
            aria-describedby={one !== undefined ? `${id}-reason` : undefined}
            tabIndex={!greyed && i === stop ? 0 : -1}
            onClick={live && one === undefined ? () => onChange(role) : undefined}
            className={`flex flex-col items-center gap-1 ${ring} rounded-sm ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            <span
              aria-hidden
              style={color === undefined ? undefined : { background: color }}
              className={`flex size-6 items-center justify-center rounded-full shadow-hairline-inset ${glyph ? 'bg-surface text-ink-soft' : ''} ${one !== undefined ? 'opacity-40' : ''} ${picked ? 'shadow-[0_0_0_2px_var(--color-coral),var(--shadow-hairline-inset)]' : ''}`}
            >
              {glyph}
            </span>
            <span className={`text-[9px] whitespace-nowrap ${disabled ? 'text-ink-faint' : 'text-ink-soft'}`}>
              {words ?? role}
            </span>
          </button>
          )
        })}
      </div>
      {reason(id, caption)}
    </div>
  )
}
