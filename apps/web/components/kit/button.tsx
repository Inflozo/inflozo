import type { ComponentProps, ReactNode } from 'react'
import { arrowKeys, openMenu } from '@/lib/menu'
import { ChevronDown } from './icons'
import { greyedProps, reason, ring, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:132 — buttons. Three heights, 44 / 36 / 32. Primary is an ink
   fill; CORAL IS RESERVED FOR **THE** ACTION OF A SURFACE and appears once; secondary is
   surface plus a hairline; ghost is text only; danger is a danger fill with an outline
   variant for the less final of two destructive choices.
   The Kit draws no disabled full-size button — only the 28px icon button, at 35% — so
   `Button` has no `disabled` (a compile error, like an unreasoned grey); a control another
   control switched off is greyed with its reason, and that lives on the controls. */

type Variant = 'coral' | 'primary' | 'secondary' | 'ghost' | 'coral-outline' | 'danger' | 'danger-outline' | 'marigold'
/* STORY 7.16a — a fourth height, a frame's: the sheets' footers in S9c/S9e (`S9 Routes.dc.html:226-227`, `:268-269`) and S7c
   draw 38 high at radius 10 and 13px, the primary 0 20 across. Said HERE, as the weight is, so no caller overrides a
   height through `className` and loses to the stylesheet's order. */
/* STORY 7.18a — and two more, S8's and D2's: the deploy wizard's footers draw 40 high (Run checks, Ship it, S8d′'s pair,
   `S8 Deploy.dc.html:68`, `:127`, `:237-238`) and its endings 42 (S8d's View site and Done, D2e/D2f's pair, `:206-207`,
   `D2 Deploy History Completed.dc.html:337-338`), both at radius 12, 14px and 22 across. */
type Size = 44 | 42 | 40 | 38 | 36 | 32
/* The Kit's own weight is 600. A FRAME MAY DRAW A DIFFERENT ONE, and it must be said HERE rather
   than passed through `className`: both are plain utilities in the same `@layer utilities`, so the
   class attribute's order is irrelevant and the stylesheet's decides — Tailwind emits font-weights
   alphabetically, `font-medium` BEFORE `font-semibold`, so a caller's `font-medium` always loses.
   Measured on the deployed site, not reasoned: S1a's button carried both classes and computed 600
   (review, 2026-09-06). Typed, so a weight the Kit does not draw is a compile error. */
type Weight = 'font-medium' | 'font-semibold'

export const variants: Record<Variant, string> = {
  coral: 'bg-coral-text text-surface hover:bg-coral-text-hover',
  primary: 'bg-ink text-surface hover:bg-ink-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-paper-sunk',
  'coral-outline': 'border border-coral bg-surface text-coral-text hover:bg-coral-tint',
  danger: 'bg-danger-text text-surface hover:bg-danger-text-hover',
  'danger-outline': 'border border-danger bg-surface text-danger-text hover:bg-danger-tint',
  /* STORY 7.3 — A NOTICE, NOT DANGER: the gold fill D4b's Go Pro and D5f's Delete section draw. The frames' resting gold fails
     AA under white, so the fill is `marigold-solid` and the hover `marigold-text` (the owner's ruling for D4b, 2026-09-06);
     spelled here once, and D4b's link takes it from here at its own 38px */
  marigold: 'bg-marigold-solid text-surface hover:bg-marigold-text',
}

const sizes: Record<Size, string> = {
  44: 'h-11 px-5 text-ui rounded',
  42: 'h-[42px] px-[22px] text-ui rounded',
  40: 'h-10 px-[22px] text-ui rounded',
  38: 'h-[38px] px-5 text-ui-dense rounded-thumb',
  36: 'h-9 px-4 text-ui-dense rounded',
  32: 'h-8 px-[13px] text-control-label rounded-thumb',
}

/** The same look on something that is not a `<button>` — a link that acts as a button. */
export const buttonClasses = (variant: Variant = 'secondary', size: Size = 36, weight: Weight = 'font-semibold') =>
  `inline-flex items-center justify-center gap-[7px] ${weight} transition-colors ${sizes[size]} ${variants[variant]} ${ring}`

export function Button({
  variant = 'secondary',
  size = 36,
  weight = 'font-semibold',
  children,
  className = '',
  ...rest
}: Omit<ComponentProps<'button'>, 'disabled'> & { variant?: Variant; size?: Size; weight?: Weight }) {
  return (
    <button
      type="button"
      className={`${buttonClasses(variant, size, weight)} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** The Ship it control: a primary action and a ▾ that opens its menu, named (A7 item 8).
 *
 *  STORY 7.18a — S4's split button (`S4 Editor.dc.html:157-160`): 32 high, 13px/600 on the coral fill, the ▾ 26 wide behind
 *  a 25% white hairline, and 14 across — the Kit's own drawing of this control (`Editor Sidebar Kit.dc.html:135`), where S4
 *  draws 16: at D8b's 720 the bar's centred group stays centred only with the Kit's (`journey.spec.mjs`'s D8b stop); on a touch screen D8a's 44 high, 18 across and 13.5px (`D8 Editor Below
 *  1440.dc.html:55-57`). D8a draws its ▾ 34 wide, and D8a's own rule — every target at least 44 — is the one kept:
 *  globals.css's floor makes it 44, and `floor.spec.mjs`'s sweep holds every target to it. `children` is the label (the caller swaps
 *  it through `BusyLabel`); `busy` is R-98's in-flight state — `aria-disabled` and `aria-busy`, never `disabled`; `menu` is
 *  the Kit's `Menu`, drawn in a `popover` the ▾ opens through `openMenu`. The halves round their own outer corners rather
 *  than the wrapper clipping them, so the one focus ring (a box-shadow) is never cut off. No handler is attached without a
 *  caller's, so the Kit gallery (a server render) still draws it. */
export function SplitButton({
  children,
  menuLabel,
  id,
  onPress,
  busy = false,
  menu,
}: {
  children: ReactNode
  menuLabel: string
  id?: string
  onPress?: () => void
  busy?: boolean
  menu?: ReactNode
}) {
  const menuId = id === undefined ? undefined : `${id}-menu`
  const half = `relative inline-flex items-center bg-coral-text text-surface transition-colors hover:bg-coral-text-hover focus-visible:z-10 ${ring}`
  return (
    <span className="inline-flex h-8 shrink-0 rounded shadow-sm coarse:h-11">
      <button
        type="button"
        id={id}
        aria-disabled={busy || undefined}
        aria-busy={busy || undefined}
        onClick={onPress === undefined ? undefined : () => (busy ? undefined : onPress())}
        className={`${half} rounded-l px-[14px] text-ui-dense font-semibold coarse:px-[18px] coarse:text-[13.5px]`}
      >
        {children}
      </button>
      <button
        type="button"
        aria-label={menuLabel}
        popoverTarget={menu === undefined ? undefined : menuId}
        onClick={
          menu === undefined || menuId === undefined
            ? undefined
            : (event) => {
                const el = document.getElementById(menuId)
                if (el) openMenu(el, event.currentTarget, { side: 'down', align: 'right' })
              }
        }
        className={`${half} w-[26px] justify-center rounded-r border-l border-surface/25`}
      >
        <ChevronDown size={11} strokeWidth={2} className="coarse:size-3" />
      </button>
      {menu === undefined ? null : (
        <div id={menuId} popover="auto" onKeyDown={arrowKeys} className="overflow-visible border-0 bg-transparent p-0">
          {menu}
        </div>
      )}
    </span>
  )
}

/** The dashed affordance that adds a section. Story 4.5: it acts (`onClick`), and it GREYS with its
 *  reason — P0-3's Add at the ceiling and on a Ghost-sourced list: the dashed border fades, the label
 *  goes placeholder-grey, the sentence sits under it, and it stays focusable `aria-disabled`, never
 *  `disabled`, so the sentence is read. `id` names the sentence for `aria-describedby`. No hooks. */
export function AddButton({
  children,
  id,
  greyed,
  onClick,
}: {
  children: ReactNode
  id?: string
  greyed?: Greyed
  onClick?: () => void
}) {
  const button = (
    <button
      type="button"
      id={id}
      onClick={onClick && !greyed ? onClick : undefined}
      className={`h-8 w-full rounded-sm border border-dashed text-ui-dense font-medium transition-colors ${ring} ${
        greyed ? 'cursor-not-allowed border-line text-ink-faint' : 'border-line-strong text-ink-soft hover:border-coral hover:text-coral-deep'
      }`}
      {...(id ? greyedProps(id, greyed) : {})}
    >
      {children}
    </button>
  )
  if (!greyed || !id) return button
  return (
    <div className="flex flex-col gap-[5px]">
      {button}
      {reason(id, greyed)}
    </div>
  )
}

/** Icon buttons, 28px — enabled, and disabled at 35%. */
export function IconButton({
  label,
  children,
  className = '',
  ...rest
}: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      /* `className` is APPENDED, never replaced (Story 5.8). It used to arrive inside `...rest`, where it would have
         silently taken the size, the radius, the hover and the focus ring with it — no caller had passed one, so
         nothing had met it. S4a's undo/redo pair is the first: the unavailable one is drawn at `opacity:.35`. */
      className={`inline-flex size-7 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk disabled:opacity-35 disabled:hover:bg-transparent ${ring} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
