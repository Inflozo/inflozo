import type { KeyboardEvent } from 'react'

/**
 * The two things a `popover="auto"` menu still needs from us.
 *
 * Light dismiss, Escape and returning focus to the invoker are the PLATFORM's — that is why
 * every menu in the app is a popover and not a hand-rolled div with a document listener.
 * What the platform does not yet give everywhere is placement: a popover lives in the top
 * layer, so its containing block is the viewport and no ancestor can position it, and CSS
 * anchor positioning is not in every browser the app supports. So the trigger's rect is read
 * at the moment of the click and written as fixed coordinates.
 *
 * Only `right`/`bottom`/`left`/`top` edges that the TRIGGER defines are used, never a width or
 * a height: the popover is still `display:none` when the click handler runs, so it has no
 * measurable size yet, and anchoring to an edge needs none.
 */

type Placement = {
  /** `up` puts the menu's bottom above the trigger (the sidebar chip); `down` below it. */
  side: 'up' | 'down'
  /** Which of the menu's edges lines up with the trigger's same edge. */
  align: 'left' | 'right'
}

export function anchorTo(menu: HTMLElement, trigger: Element, { side, align }: Placement, gap = 6) {
  const t = trigger.getBoundingClientRect()
  const s = menu.style
  s.position = 'fixed'
  s.margin = '0'
  if (side === 'up') {
    s.bottom = `${Math.max(8, window.innerHeight - t.top + gap)}px`
    s.top = 'auto'
  } else {
    s.top = `${t.bottom + gap}px`
    s.bottom = 'auto'
  }
  if (align === 'left') {
    s.left = `${Math.max(8, t.left)}px`
    s.right = 'auto'
  } else {
    s.right = `${Math.max(8, window.innerWidth - t.right)}px`
    s.left = 'auto'
  }
}

/**
 * OPENING A MENU IS TWO THINGS: putting it where the trigger is, and stepping into it.
 *
 * `popovertarget` opens the popover but leaves focus on the trigger, so Arrow Down had nothing
 * to move (executed — it stayed on the ⋯). The first item is focused on the frame after the
 * click, which is when the popover has actually been shown; `:focus-visible` means a mouse user
 * never sees a ring for it, and Escape still returns focus to the invoker, which is the
 * platform's own behaviour and not ours to redo.
 */
export function openMenu(menu: HTMLElement, trigger: Element, placement: Placement) {
  anchorTo(menu, trigger, placement)
  requestAnimationFrame(() => menu.querySelector<HTMLElement>('a[href], button')?.focus())
}

/**
 * Up and down move between the menu's own controls, and Home/End reach its ends — the tab
 * order already reaches every one of them, so this adds the movement a menu is expected to
 * have without taking anything away from a keyboard user who only presses Tab.
 */
export function arrowKeys(event: KeyboardEvent<HTMLElement>) {
  const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  const end = event.key === 'End' ? 1 : event.key === 'Home' ? -1 : 0
  if (!step && !end) return

  const items = [...event.currentTarget.querySelectorAll<HTMLElement>('a[href], button')]
  if (items.length === 0) return
  event.preventDefault()

  if (end) {
    items[end > 0 ? items.length - 1 : 0].focus()
    return
  }
  const at = items.indexOf(document.activeElement as HTMLElement)
  // From nowhere in particular, Down opens on the first item and Up on the last.
  const next = at < 0 ? (step > 0 ? 0 : items.length - 1) : (at + step + items.length) % items.length
  items[next].focus()
}
