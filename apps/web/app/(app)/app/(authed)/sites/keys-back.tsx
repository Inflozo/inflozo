'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

/* ────────────────────────────── THE POPUP'S WAY OUT, AND IT IS `router.back()` BECAUSE EXECUTION
   SAID SO.

   The keys panel appears in two places (the intercepted popup over the Sites list, and the full
   page) and the way out is the ONE thing that differs. On the page it is a `<Link href="/sites">`.
   In the popup it cannot be: **Next keeps an unmatched parallel slot's state across a soft
   navigation**, so a `<Link>` out of the popup moved the URL to `/sites` and left the panel
   mounted in the slot — and the ⋯ row then did nothing at all the second time it was pressed,
   because the dialog was already in the DOM and closed, so nothing re-ran `showModal()`. Measured
   on a throwaway control under `next dev` at the Fix of Story 3.6, 2026-09-10:

     Cancel as a `<Link>`     → url /ctl, panel STILL MOUNTED, dialog closed → second open dead
     `router.push` + `refresh` → the same; the refresh does not re-resolve the slot
     a `[...catchAll]` slot    → the same
     `router.back()`           → url /ctl, panel unmounted, and the second and third opens worked

   THE `href` STAYS REAL. A modified click (⌘, ctrl, shift, ALT, middle) is the browser's, exactly
   as the ⋯ rows are — and if a script ever fails to run, the anchor is still a working way back to
   the list rather than a dead control.

   AND IT IS ONLY SOUND BECAUSE THE THREE KEYS ACTIONS REDIRECT WITH `RedirectType.replace`
   (`actions.ts`). A server action's `redirect()` PUSHES by default, so after one refusal the first
   Back returned to the panel-before-the-refusal instead of the list — measured in the same
   control, with the replace variant landing on the list after two saves as the control. */

export function KeysBack({
  className,
  label,
  children,
}: {
  className: string
  /** The accessible name, where the control is a glyph. */
  label?: string
  children: ReactNode
}) {
  const router = useRouter()
  return (
    <a
      href="/sites"
      aria-label={label}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
        event.preventDefault()
        router.back()
      }}
    >
      {children}
    </a>
  )
}
