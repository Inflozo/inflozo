'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { closeOnBackdrop, panelSheet } from '@/components/kit/dialog'

/* ────────────────────────────── THE `<dialog>` A PANEL IS DRAWN IN OVER THE SITES LIST — Manage
   keys' (`?manage=`) and the brand offer's (`?brand=`). ONE dialog for both, so a change to how a
   panel opens cannot land on one and miss the other.

   ───────── WHY IT IS A QUERY PARAMETER ON `/sites` AND NOT AN INTERCEPTED ROUTE.

   It was an intercepted route until the owner's test of 2026-09-10, and that is what his findings
   2, 3 and 5 were: *"There should be only one perfect popup and that only should be source of
   truth."* An intercepted popup lives at the PANEL'S OWN ADDRESS — the URL moves off `/sites` when
   it opens — and Next serves the full page into the list's own slot for any navigation to that
   address it does not intercept. Three of those were reachable in one sitting:

   | what the customer did                          | what happened                                |
   |---|---|
   | pressed **Test connection**                    | a server action's `redirect()` is NOT intercepted (executed 2026-09-10), so the FULL PAGE loaded behind the still-open window and took the list with it — "both these popup appear on a blank screen" |
   | saved a key, or was refused one                 | the same, by the same door |
   | pressed the ⋯ row twice while the panel loaded  | the second navigation started from the panel's own address, where `(.)` no longer matches |

   AND THE TOP BAR WENT WITH IT, which was his finding 1 on both popups: the shell draws the search
   field and **Connect site** from a table keyed on the EXACT path (`components/shell/shell.tsx`),
   and an intercepted popup is not at `/sites` any more.

   ON `/sites?manage=…` THE ROUTE NEVER CHANGES. There is nothing to intercept, nothing to fail to
   intercept, and no address for the shell to fail to recognise. An action's redirect is an
   ordinary same-route answer — exactly what `?recheck=`, `?disconnect=` and `?moved=` have always
   been on this list — so the panel is re-rendered inside the window that is already open, and the
   cards stay behind it. It is also S11a's Disconnect row's own shape, one step further: an
   `<a href>` to a real route whose click JavaScript turns into a dialog over the list.

   ───────── WHAT THIS COMPONENT STILL HAS TO DO, WHICH IS ONE THING.

   `<dialog>` opens only through `showModal()`, so the element that the list renders when the
   parameter is there has to be opened once, on mount. It is rendered ONLY while the parameter is
   there, so leaving unmounts it and there is no state to keep in step with the URL — which is the
   whole of what the intercepted version's path watch existed for.

   ESCAPE AND THE BACKDROP HAVE TO MOVE THE URL, because the native element closes without
   navigating and would leave the address bar naming a panel that is not on screen. They go where
   the ✕ and **Cancel** go — `/sites`, ONE way out for every gesture — and by `replace`, so the
   panel leaves no entry behind however many keys were saved in it. `back()` would have been the
   other choice and is not: a typed `/sites?manage=…` has nothing behind it to go back to.

   THE PANEL ITSELF IS A SERVER COMPONENT AND STAYS ONE. It arrives as `children`, inside the
   list's own `<Suspense>`, so every read, every `<form action={serverAction}>` dispatch and every
   sentence are rendered on the server exactly as they are on the full page.

   WRAPPING THE SUSPENSE BOUNDARY AND NOT SITTING INSIDE IT IS LOAD-BEARING: a fallback and its
   content are different positions in the tree, so a `<dialog>` rendered by both would unmount and
   remount between them — the window would open, close and open again while the panel loaded.
   Here it opens once and the skeleton inside it is swapped for the panel. */

export function PanelModal({
  labelledBy,
  children,
}: {
  labelledBy: string
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const router = useRouter()

  useEffect(() => {
    const el = dialog.current
    // WHERE FOCUS CAME FROM, so it can go back. A native `<dialog>` returns focus to its opener on
    // `close()`, but this one is UNMOUNTED when the parameter leaves the URL — every way out is a
    // navigation — so the platform's own return never runs and focus fell to `<body>`, a keyboard
    // user losing their place in the list on every Cancel (review, 2026-09-10). The opener is
    // whatever was focused when the window mounted: the ⋯ row, or the card's brand offer.
    // The ⋯ row lives inside a popover that is hidden once the window is there, and a hidden
    // element cannot take focus — so for a row inside a popover it is the popover's INVOKER, the
    // ⋯ button, that gets focus back, which is where Escape on the menu would have put it.
    const active = document.activeElement
    const popover = active?.closest('[popover]')
    const opener = popover?.id ? document.querySelector(`[popovertarget="${popover.id}"]`) ?? active : active
    if (el && !el.open) el.showModal()
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      onClick={closeOnBackdrop}
      onClose={() => router.replace('/sites')}
      aria-labelledby={labelledBy}
      className={panelSheet}
    >
      {children}
    </dialog>
  )
}
