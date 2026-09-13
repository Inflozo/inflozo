import type { ReactNode } from 'react'
import { anchorTo, arrowKeys } from '@/lib/menu'
import { Check, ChevronDown, ChevronRight, Trash } from './icons'
import { fieldTone, greyedProps, labelTone, reason, ring, valueTone, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:109 — select rows and menus. A closed select may carry a mini
   thumbnail; a font row renders a live "Aa" in the face itself; a dropdown marks the active
   row with a check. This is the shape P0-0 greys in its own pair frame.

   Story 4.5: with `onSelect` the closed select opens its Menu in a `popover="auto"` beside it, placed
   by `openPopover` below. No hooks: without `onSelect` it is `/kit`'s static drawing. */

type Placement = { side: 'up' | 'down'; align: 'left' | 'right' }

/**
 * OPEN A POPOVER AT ITS TRIGGER, TAKE FOCUS, AND GIVE IT BACK. `lib/menu.ts`'s `openMenu` with two
 * differences a picker needs: focus lands on `focus` when one is named (a search field, not the first
 * button), and a scroll INSIDE the popover does not close it — a picker's grid scrolls, and a
 * capturing listener on `window` hears that scroll too, so `openMenu` would close the icon picker the
 * moment its grid moved. Focus returns to the trigger when the popover closes with focus inside it
 * or nowhere — the platform does this for Escape and light dismiss; this covers an item that hid it.
 */
export function openPopover(pop: HTMLElement, trigger: HTMLElement, placement: Placement, focus?: HTMLElement | null) {
  if (pop.matches(':popover-open')) return
  anchorTo(pop, trigger, placement)
  const onScroll = (event: Event) => {
    if (event.target instanceof Node && pop.contains(event.target)) return
    if (pop.matches(':popover-open')) pop.hidePopover()
  }
  const onToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== 'closed') return
    window.removeEventListener('scroll', onScroll, { capture: true })
    pop.removeEventListener('toggle', onToggle)
    const at = document.activeElement
    if (at === null || at === document.body || pop.contains(at)) trigger.focus({ preventScroll: true })
  }
  pop.addEventListener('toggle', onToggle)
  if (!trigger.hasAttribute('popovertarget')) pop.showPopover()
  requestAnimationFrame(() => {
    const box = pop.getBoundingClientRect()
    if (placement.side === 'down' && box.bottom > window.innerHeight) anchorTo(pop, trigger, { ...placement, side: 'up' })
    else if (placement.side === 'up' && box.top < 0) anchorTo(pop, trigger, { ...placement, side: 'down' })
    // Neither side holds it — a tall picker opened from mid-screen: pin it inside the viewport rather than
    // letting its search and its Style row run off an edge, and let it scroll if the viewport is shorter
    // than it (measured on the controls review, 2026-09-13: the icon picker's top sat above the viewport).
    const flipped = pop.getBoundingClientRect()
    if (flipped.top < 8 || flipped.bottom > window.innerHeight - 8) {
      pop.style.top = `${Math.max(8, window.innerHeight - flipped.height - 8)}px`
      pop.style.bottom = 'auto'
      pop.style.maxHeight = 'calc(100dvh - 16px)'
      pop.style.overflowY = 'auto'
    }
    // …and the same across: a picker wider than its trigger, opened from the sidebar at the right edge,
    // ran past the viewport (the owner's finding 4 on Story 4.5 — the link popover's right edge at 1449 of
    // 1440). Slid left until it fits, never past the left gutter.
    const across = pop.getBoundingClientRect()
    if (across.right > window.innerWidth - 8 || across.left < 8) {
      pop.style.left = `${Math.max(8, Math.min(across.left, window.innerWidth - across.width - 8))}px`
      pop.style.right = 'auto'
    }
    ;(focus ?? pop.querySelector<HTMLElement>('input, a[href], button:not([tabindex="-1"])'))?.focus({ preventScroll: true })
    if (pop.matches(':popover-open')) window.addEventListener('scroll', onScroll, { capture: true, passive: true })
  })
}

export function Select({
  id,
  label,
  value,
  thumb,
  greyed,
  aside,
  options,
  onSelect,
}: {
  id: string
  label: string
  value: string
  thumb?: ReactNode
  greyed?: Greyed
  aside?: ReactNode
  /** the menu's rows, when the select is live */
  options?: { value: string; label: string; active?: boolean }[]
  onSelect?: (value: string) => void
}) {
  const live = onSelect !== undefined && options !== undefined && !greyed
  return (
    <div className="flex flex-col gap-[5px]">
      <span className={`flex items-center gap-[6px] text-control-label font-medium ${labelTone(greyed)}`}>
        <span id={`${id}-label`}>{label}</span>
        {aside}
      </span>
      <button
        type="button"
        id={id}
        aria-labelledby={`${id}-label ${id}`}
        popoverTarget={live ? `${id}-menu` : undefined}
        onClick={
          live
            ? (event) => {
                const pop = document.getElementById(`${id}-menu`)
                if (pop) openPopover(pop, event.currentTarget, { side: 'down', align: 'left' })
              }
            : undefined
        }
        className={`flex h-[38px] items-center gap-[9px] rounded-sm border px-[11px] ${fieldTone(greyed)} ${ring} ${greyed ? '' : 'hover:border-line-strong'}`}
        {...greyedProps(id, greyed)}
      >
        {thumb}
        <span className={`text-[12.5px] font-medium ${valueTone(greyed)}`}>{value}</span>
        <ChevronDown size={12} className={`ml-auto ${greyed ? 'text-line-strong' : 'text-ink-soft'}`} />
      </button>
      {live ? (
        <div
          id={`${id}-menu`}
          popover="auto"
          onKeyDown={arrowKeys}
          className="max-h-[60vh] overflow-y-auto border-0 bg-transparent p-0"
        >
          <Menu
            label={label}
            items={options.map((o) => ({ label: o.label, active: o.active, onSelect: () => onSelect(o.value) }))}
          />
        </div>
      ) : null}
      {reason(id, greyed)}
    </div>
  )
}

/** The two-rule mini page thumbnail a closed select carries. */
export const SelectThumb = () => (
  <span aria-hidden className="flex h-[18px] w-[26px] gap-[1.5px] rounded-[3px] border border-line p-[2px]">
    <span className="flex-1 rounded-[1px] bg-line" />
    <span className="flex-1 rounded-[1px] bg-coral-tint-strong" />
  </span>
)

/** A font row renders "Aa" in the face it is offering. */
export function FontRow({ id, label, family }: { id: string; label: string; family: string }) {
  return (
    <button
      type="button"
      id={id}
      className={`flex h-10 items-center gap-[9px] rounded-sm border border-line bg-surface px-[10px] hover:border-line-strong ${ring}`}
    >
      <span aria-hidden style={{ fontFamily: family }} className="w-5 text-ui">
        Aa
      </span>
      <span className="flex flex-1 flex-col text-left">
        <span className="text-[10px] text-ink-soft">{label}</span>
        <span className="text-control-label font-semibold text-ink">{family}</span>
      </span>
      <ChevronRight size={12} className="text-ink-soft" />
    </button>
  )
}

export type MenuItem = {
  label: string
  active?: boolean
  danger?: boolean
  /** a leading glyph (P0-3's Duplicate draws one); the danger row keeps its trash */
  icon?: ReactNode
  /** Story 4.5: the row acts — the popover it sits in closes first, so focus is back on its trigger */
  onSelect?: () => void
}

/** The dropdown itself: the active row is coral-tint with a check, danger sits last. */
export function Menu({ label, items }: { label: string; items: MenuItem[] }) {
  return (
    <ul
      aria-label={label}
      className="flex w-[210px] list-none flex-col gap-px rounded border border-line bg-surface p-[6px] shadow-lg"
    >
      {items.map((item, i) => (
        <li key={item.label} className="flex flex-col">
          {item.danger && i > 0 ? <hr className="mx-2 my-1 h-px border-0 bg-line" /> : null}
          <button
            type="button"
            aria-current={item.active ? 'true' : undefined}
            onClick={
              item.onSelect
                ? (event) => {
                    event.currentTarget.closest<HTMLElement>('[popover]')?.hidePopover()
                    item.onSelect?.()
                  }
                : undefined
            }
            className={`flex items-center gap-2 rounded-sm px-[10px] py-[7px] text-left text-ui-dense ${ring} ${
              item.active
                ? 'bg-coral-tint font-semibold text-ink'
                : item.danger
                  ? 'font-medium text-danger-text hover:bg-danger-tint'
                  : 'font-medium text-ink hover:bg-paper'
            }`}
          >
            {item.danger ? <Trash size={13} /> : item.icon}
            <span className="flex-1">{item.label}</span>
            {item.active ? <Check size={13} className="text-coral-deep" /> : null}
          </button>
        </li>
      ))}
    </ul>
  )
}
