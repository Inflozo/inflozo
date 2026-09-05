import type { ComponentProps, ReactNode } from 'react'
import { ChevronDown } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:132 — buttons. Three heights, 44 / 36 / 32. Primary is an ink
   fill; CORAL IS RESERVED FOR **THE** ACTION OF A SURFACE and appears once; secondary is
   surface plus a hairline; ghost is text only; danger is a danger fill with an outline
   variant for the less final of two destructive choices.
   The Kit draws no disabled full-size button — only the 28px icon button, at 35% — so
   `Button` has no `disabled` (a compile error, like an unreasoned grey); a control another
   control switched off is greyed with its reason, and that lives on the controls. */

type Variant = 'coral' | 'primary' | 'secondary' | 'ghost' | 'coral-outline' | 'danger' | 'danger-outline'
type Size = 44 | 36 | 32

const variants: Record<Variant, string> = {
  coral: 'bg-coral-text text-surface hover:bg-coral-text-hover',
  primary: 'bg-ink text-surface hover:bg-ink-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-paper-sunk',
  'coral-outline': 'border border-coral bg-surface text-coral-text hover:bg-coral-tint',
  danger: 'bg-danger-text text-surface hover:bg-danger-text-hover',
  'danger-outline': 'border border-danger bg-surface text-danger-text hover:bg-danger-tint',
}

const sizes: Record<Size, string> = {
  44: 'h-11 px-5 text-ui rounded',
  36: 'h-9 px-4 text-ui-dense rounded',
  32: 'h-8 px-[13px] text-control-label rounded-thumb',
}

export function Button({
  variant = 'secondary',
  size = 36,
  children,
  className = '',
  ...rest
}: Omit<ComponentProps<'button'>, 'disabled'> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-[7px] font-semibold transition-colors ${sizes[size]} ${variants[variant]} ${ring} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** The Ship it control: a primary action and a ▾ that opens its menu, named (A7 item 8). */
export function SplitButton({ children, menuLabel }: { children: ReactNode; menuLabel: string }) {
  return (
    <span className="inline-flex h-8 overflow-hidden rounded shadow-sm">
      <button
        type="button"
        className={`inline-flex items-center bg-coral-text px-[14px] text-ui-dense font-semibold text-surface ${ring}`}
      >
        {children}
      </button>
      <button
        type="button"
        aria-label={menuLabel}
        className={`inline-flex w-[26px] items-center justify-center border-l border-surface/25 bg-coral-text text-surface ${ring}`}
      >
        <ChevronDown size={11} />
      </button>
    </span>
  )
}

/** The dashed affordance that adds a section. */
export const AddButton = ({ children }: { children: ReactNode }) => (
  <button
    type="button"
    className={`h-8 w-full rounded-sm border border-dashed border-line-strong text-ui-dense font-medium text-ink-soft transition-colors hover:border-coral hover:text-coral-deep ${ring}`}
  >
    {children}
  </button>
)

/** Icon buttons, 28px — enabled, and disabled at 35%. */
export function IconButton({
  label,
  children,
  ...rest
}: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex size-7 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk disabled:opacity-35 disabled:hover:bg-transparent ${ring}`}
      {...rest}
    >
      {children}
    </button>
  )
}
