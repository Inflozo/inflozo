import type { ReactNode } from 'react'
import { anchorTo, arrowKeys } from '@/lib/menu'
import { Check, ChevronDown, ChevronRight, Trash } from './icons'
import { fieldTone, greyedProps, labelTone, reason, ring, slimScrollbar, valueTone, type Greyed } from './greyed'

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
  pop.style.maxHeight = ''
  pop.style.overflowY = ''
  anchorTo(pop, trigger, placement)
  /* KEEP IT ON SCREEN — at open AND EVERY TIME IT CHANGES SIZE. A picker grows after it opens: the link
     popover's search results arrive as the user types, and measured on the controls review (the owner's
     finding 7 on Story 4.5, 2026-09-13) "e" grew it from its trigger to a bottom edge at 1335 of a 900 window,
     or, opened upward, past the top. So it is moved, never flipped, once open: a popover that jumped to the
     trigger's other side with each keystroke would be worse than one that slides. Too tall for the window,
     it is capped and scrolls; off an edge, it slides back inside an 8 px gutter (finding 4's right edge
     included). */
  const keepInside = () => {
    if (!pop.matches(':popover-open')) return
    let box = pop.getBoundingClientRect()
    if (box.height > window.innerHeight - 16) {
      pop.style.maxHeight = 'calc(100dvh - 16px)'
      pop.style.overflowY = 'auto'
      box = pop.getBoundingClientRect()
    }
    if (box.top < 8 || box.bottom > window.innerHeight - 8) {
      pop.style.top = `${Math.max(8, Math.min(box.top, window.innerHeight - box.height - 8))}px`
      pop.style.bottom = 'auto'
    }
    if (box.left < 8 || box.right > window.innerWidth - 8) {
      pop.style.left = `${Math.max(8, Math.min(box.left, window.innerWidth - box.width - 8))}px`
      pop.style.right = 'auto'
    }
  }
  const resized = new ResizeObserver(keepInside)
  const onScroll = (event: Event) => {
    if (event.target instanceof Node && pop.contains(event.target)) return
    if (pop.matches(':popover-open')) pop.hidePopover()
  }
  const onToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== 'closed') return
    resized.disconnect()
    window.removeEventListener('scroll', onScroll, { capture: true })
    pop.removeEventListener('toggle', onToggle)
    const at = document.activeElement
    if (at === null || at === document.body || pop.contains(at)) trigger.focus({ preventScroll: true })
  }
  pop.addEventListener('toggle', onToggle)
  if (!trigger.hasAttribute('popovertarget')) pop.showPopover()
  requestAnimationFrame(() => {
    if (!pop.matches(':popover-open')) return // closed again before this frame: nothing to place, observe or focus
    // At open, and only at open, a side that cannot hold it flips to the other (review, 2026-09-05).
    const box = pop.getBoundingClientRect()
    if (placement.side === 'down' && box.bottom > window.innerHeight) anchorTo(pop, trigger, { ...placement, side: 'up' })
    else if (placement.side === 'up' && box.top < 0) anchorTo(pop, trigger, { ...placement, side: 'down' })
    keepInside()
    resized.observe(pop)
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
                // focus lands on the row in force, so a long list opens scrolled to it
                if (pop) openPopover(pop, event.currentTarget, { side: 'down', align: 'left' }, pop.querySelector<HTMLElement>('[aria-current="true"]'))
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
          className="border-0 bg-transparent p-0"
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
      // A long menu scrolls INSIDE its own box, about nine rows tall, so its border and radius stay whole — the
      // icon picker's category list ran the height of the window (the owner's finding 8 on Story 4.5).
      className={`flex max-h-[min(320px,60vh)] w-[210px] list-none flex-col gap-px overflow-y-auto rounded border border-line bg-surface p-[6px] shadow-lg ${slimScrollbar}`}
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
