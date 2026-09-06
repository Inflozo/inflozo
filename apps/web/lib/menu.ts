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
  // The trigger is a `popovertarget` TOGGLE: a second click closes the menu, and re-anchoring,
  // re-arming and focusing into a menu that is about to hide is not opening it (review, 2026-09-06).
  if (menu.matches(':popover-open')) return
  anchorTo(menu, trigger, placement)
  requestAnimationFrame(() => {
    // Now it is shown and has a height: a menu that would run off the bottom (a card's ⋯ in
    // the last row at 390) or off the top (`up` on a short viewport) flips to the other side
    // (review, 2026-09-05).
    const box = menu.getBoundingClientRect()
    if (placement.side === 'down' && box.bottom > window.innerHeight) {
      anchorTo(menu, trigger, { ...placement, side: 'up' })
    } else if (placement.side === 'up' && box.top < 0) {
      anchorTo(menu, trigger, { ...placement, side: 'down' })
    }
    menu.querySelector<HTMLElement>('a[href], button')?.focus()
  })
  // Fixed coordinates do not follow a scroll, so the menu closes rather than floats away. The
  // listener leaves WITH the menu: closed by Escape, an item or a click outside, it used to stay
  // armed — one more per open — until the next scroll (review, 2026-09-06).
  const onScroll = () => {
    if (menu.matches(':popover-open')) menu.hidePopover()
  }
  const onToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== 'closed') return
    window.removeEventListener('scroll', onScroll, { capture: true })
    menu.removeEventListener('toggle', onToggle)
  }
  window.addEventListener('scroll', onScroll, { once: true, capture: true, passive: true })
  menu.addEventListener('toggle', onToggle)
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
  // `step` is non-zero by here — a zero one either returned above or was End/Home, which did —
  // but the ternary is what narrows `-1 | 0 | 1` to the two the arithmetic accepts.
  const dir = step > 0 ? 1 : -1
  items[nextIndex(items.length, items.indexOf(document.activeElement as HTMLElement), dir)].focus()
}

/**
 * The arithmetic on its own, where `node --test` reaches it: everything above needs a DOM and
 * there is no runner for one here, so the wrap-around was the keyboard behaviour of every menu in
 * the app resting on a human clicking through it each story. Dropping the `+ count` silently
 * makes ArrowUp from the first item `items[-1]`, i.e. `undefined.focus()` — a throw into
 * `error.tsx` — with lint, `tsc`, `node --test` and `next build` all green (review, 2026-09-06).
 * The split `plan.ts`, `shell-user.ts`, `sentStateFor` and `signOutPathFor` each made.
 *
 * `at < 0` is "focus is nowhere in particular": Down then opens on the first item, Up on the last.
 */
export function nextIndex(count: number, at: number, step: 1 | -1) {
  if (at < 0) return step > 0 ? 0 : count - 1
  return (at + step + count) % count
}
