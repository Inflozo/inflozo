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

/* EVERY MENU ROW IN THE APP, and it lives beside the placement rather than inside whichever menu
   happened to need it first. S3c's row and S11a's are the same row; it was exported from
   `project-menu.tsx` until the review of 2026-09-09, which made `sites/site-menu.tsx` import a
   `'use client'` feature module — and with it `projects/actions`, `TextInput` and `Banner` — for
   one string. THE COLOURS AND THE FOCUS RING STAY AT EACH CALL SITE — the danger row is the
   caller's choice, not the vocabulary's, and `ring` lives in `components/kit/greyed.ts`, which
   nothing under `lib/` imports (this file would be the first, and one string is not the reason to
   make `lib` depend on `components`). Both menus already import `ring` for their own rows. */
export const item =
  'flex w-full items-center gap-[9px] rounded-sm p-[8px_12px] text-left text-ui-dense font-medium transition-colors'

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
  // Fixed coordinates do not follow a scroll, so the menu closes rather than floats away. The
  // listener leaves WITH the menu: closed by Escape, an item or a click outside, it used to stay
  // armed — one more per open — until the next scroll (review, 2026-09-06).
  //
  // A SCROLL INSIDE THE MENU IS NOT THE PAGE MOVING (the owner's finding, 2026-09-21, on Story 5.13's
  // subject picker: its 53 rows scroll, and the menu shut on the first wheel). A capturing listener on
  // `window` hears the `scroll` of EVERY element, not just the document's — element scroll does not
  // bubble, but capture reaches it on the way down — so a menu with its own scrolling list closed itself
  // the moment that list moved. `kit/select.tsx`'s `openPopover` learned this at Story 4.5 for the icon
  // picker's grid and guarded it THERE; the same guard never reached here, which is standing rule 3 exactly.
  // It is one condition, and it is the whole difference: the menu closes when the ground under it moves and
  // not when its own rows do. `once` is gone with it — an ignored inner scroll would have spent the
  // listener and left a later page scroll unheard — and `onToggle` below owns the lifetime, as it does
  // for `openPopover`.
  const onScroll = (event: Event) => {
    if (event.target instanceof Node && menu.contains(event.target)) return
    if (menu.matches(':popover-open')) menu.hidePopover()
  }
  let closed = false
  const onToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== 'closed') return
    closed = true
    window.removeEventListener('scroll', onScroll, { capture: true })
    menu.removeEventListener('toggle', onToggle)
  }
  menu.addEventListener('toggle', onToggle)
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
    /* AND THE SAME CORRECTION SIDEWAYS (the owner's finding, 2026-09-18). `anchorTo` can only clamp the edge it
       anchors — it runs while the popover is still `display:none` and has no width — so a RIGHT-aligned menu whose
       trigger sits less than a menu-width from the left edge hangs off it. That is every ⋯ in the 240px Layers
       panel: a 210px menu right-aligned to a ⋯ near x=202 starts at −8. Corrected here, where the box finally has a
       width, for every menu in the app rather than for the one that found it (standing rule 3). */
    const placed = menu.getBoundingClientRect()
    if (placed.left < 8) {
      menu.style.left = '8px'
      menu.style.right = 'auto'
    } else if (placed.right > window.innerWidth - 8) {
      menu.style.right = '8px'
      menu.style.left = 'auto'
    }
    // THE MENU MUST NOT CLOSE ON THE SCROLL THAT OPENED IT. Story 3.6's review (2026-09-10) drove
    // the ⋯ of a card low on the list at 390 on production and the menu was gone before its row
    // could be pressed: the tap that reaches a ⋯ near the bottom edge is preceded by a scroll —
    // the finger's, or a driver's scroll-into-view — whose `scroll` EVENT is dispatched on the
    // next frame, AFTER the click handler had armed the listener below. So the listener is armed
    // from this frame, once that event has been delivered, and the focus is asked not to scroll,
    // so stepping into a row cannot be the scroll that closes the menu either.
    menu.querySelector<HTMLElement>('a[href], button')?.focus({ preventScroll: true })
    // `closed`: a menu shut and reopened inside this one frame must not arm the listener of the open that already
    // left — nothing would ever remove it now that `once` is gone (review, 2026-09-21)
    if (!closed && menu.matches(':popover-open')) {
      window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    }
  })
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
