'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { closeOnBackdrop, panelSheet } from '@/components/kit/dialog'
import { stripApp } from '@/routing'

/* ────────────────────────────── THE `<dialog>` AN INTERCEPTED PANEL IS DRAWN IN — Manage keys'
   (`@modal/(.)keys`) and the brand offer's (`@modal/(.)brand`).

   THE OWNER'S TEST OF STORY 3.6, FINDING 1: "Can we show the Manage Keys as a popup on the Sites
   screen rather than a separate screen for Manage API Keys." Disconnect, one row below it in the
   same ⋯ menu, already opened over the card; Manage keys left the list. He asked for the same of
   S2c's brand offer on 2026-09-10, which is why this is `PanelModal` and not `KeysModal`: ONE
   dialog for both, so a change to how a panel opens cannot land on one and miss the other.

   IT IS THE SAME DIALOG VOCABULARY AS EVERY OTHER MODAL IN THE APP (R-74) — `panelSheet` out of
   `components/kit/dialog.ts`, `closeOnBackdrop` for the click the native element does not handle
   — at the second width `S11e Manage Keys Popup` draws.

   THE PANEL ITSELF IS A SERVER COMPONENT AND STAYS ONE. It arrives as `children` — the slot's
   `layout` wraps `loading.tsx` and `page.tsx` alike — so every read, every `<form
   action={serverAction}>` dispatch and every sentence are rendered on the server exactly as they
   are on the full page.

   WRAPPING IN THE LAYOUT AND NOT IN THE PAGE IS LOAD-BEARING: a Suspense fallback and its content
   are different positions in the tree, so a `<dialog>` rendered by both `loading.tsx` and
   `page.tsx` would unmount and remount between them — the popup would open, close and open again
   while the panel loaded. Here it opens once and the skeleton is swapped for the panel inside it.

   ───────── AND IT WATCHES THE PATH, WHICH IS THE WHOLE OF WHY THIS COMPONENT HAS STATE AT ALL.

   **Next keeps an unmatched parallel slot's state across a soft navigation.** Every way OUT of an
   intercepted popup is a soft navigation, so without this the panel simply stayed: the URL moved
   to `/sites` and the window sat there over it, and the control that had opened it then did
   nothing at all the next time it was pressed, because the dialog was already in the DOM and
   nothing re-ran `showModal()`. Measured on throwaway controls under `next dev` 16.3.1 on
   2026-09-10, each of these separately:

   | the way out                                   | without the watch      |
   |---|---|
   | `<Link href="/sites">` (Cancel, ✕)            | panel stayed, mounted  |
   | `router.push` + `router.refresh()`            | the same               |
   | a `[...catchAll]` filler in the slot          | the same               |
   | a SERVER ACTION's `redirect('/sites')`        | the same — and this is **Use your brand** and **Skip** |
   | `router.back()`                               | cleared                |

   So the rule is written once, here, as the thing that is actually true: **the dialog is open
   exactly when the path is the panel's.** Leaving closes it, returning re-opens it, and the
   controls inside can go back to being ordinary `<Link href="/sites">`s that work with no script.
   Executed after the change on the same control: open → an action that leaves → closed; press the
   opener again → open; Cancel → closed; again → open; Escape → closed; again → open.

   ESCAPE AND THE BACKDROP STILL HAVE TO MOVE THE URL, because the native element closes without
   navigating and would leave the address bar naming a panel that is not on screen. `router.back()`
   is that, and it is sound only because every action that answers ONTO a panel redirects with
   `RedirectType.replace` (`actions.ts`) — a server action's `redirect()` pushes by default, so
   after one refusal the first Back returned to the panel-before-the-refusal instead of the list.
   `leaving` is what keeps the watch's own `close()` from being read as one of those presses.

   ONE MORE THING THOSE CONTROLS SETTLED, and it is why the brand offer has two chromes rather than
   one: **a server action's `redirect()` is not intercepted at all.** A redirect out of an action on
   the list route landed on the FULL page, with no dialog and no list behind it, where the same
   address reached by `router.push` opened the popup. So `connectSite`'s landing on S2c stays the
   full-screen onboarding moment S2 draws, and the Sites card's offer LINK — a real soft navigation
   — is the popup. */

export function PanelModal({
  labelledBy,
  path,
  children,
}: {
  labelledBy: string
  /** The panel's own public path, e.g. `/sites/keys`. `usePathname()` reports `/app/…` on
      localhost and the public path on the app host, so it is stripped before it is compared —
      `routing.ts`'s own helper, which `shell.tsx` uses for the same reason. */
  path: string
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  /** Set while the watch below is closing the dialog, so `onClose` does not read it as a press. */
  const leaving = useRef(false)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (stripApp(pathname) === path) {
      if (!el.open) el.showModal()
    } else if (el.open) {
      leaving.current = true
      el.close()
    }
  }, [pathname, path])

  return (
    <dialog
      ref={dialog}
      onClick={closeOnBackdrop}
      onClose={() => {
        if (leaving.current) {
          leaving.current = false
          return
        }
        router.back()
      }}
      aria-labelledby={labelledBy}
      className={panelSheet}
    >
      {children}
    </dialog>
  )
}
