'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { closeOnBackdrop, panelSheet } from '@/components/kit/dialog'
import { KEYS_TITLE_ID } from './keys-panel'

/* ────────────────────────────── THE `<dialog>` THE INTERCEPTED KEYS PANEL IS DRAWN IN.

   THE OWNER'S TEST OF STORY 3.6, FINDING 1: "Can we show the Manage Keys as a popup on the Sites
   screen rather than a separate screen for Manage API Keys." Disconnect, one row below it in the
   same ⋯ menu, already opened over the card; Manage keys left the list.

   IT IS THE SAME DIALOG VOCABULARY AS EVERY OTHER MODAL IN THE APP (R-74) — `panelSheet` out of
   `components/kit/dialog.ts`, `closeOnBackdrop` for the click the native element does not handle
   — at the second width `S11e Manage Keys Popup` draws. Nothing here is a second vocabulary; the
   only thing this file adds is the OPENING, because a `<dialog>` is inert until `showModal()` and
   that is a browser call, which is the whole reason this is the one client component on the path.

   THE PANEL ITSELF IS A SERVER COMPONENT AND STAYS ONE. It arrives as `children` — the slot's
   `layout` wraps `loading.tsx` and `page.tsx` alike — so the credential read, the three `<form
   action={serverAction}>` dispatches and every sentence are rendered on the server exactly as they
   are on the full page.

   WRAPPING IN THE LAYOUT AND NOT IN THE PAGE IS LOAD-BEARING: a Suspense fallback and its content
   are different positions in the tree, so a `<dialog>` rendered by both `loading.tsx` and
   `page.tsx` would unmount and remount between them — the popup would open, close and open again
   while the panel loaded. Here it opens once and the skeleton is swapped for the panel inside it.

   ESCAPE AND THE BACKDROP GO WHERE ✕ AND CANCEL GO — `router.back()`, and `keys-back.tsx` carries
   the measurement that says why a soft navigation to `/sites` cannot be the way out of an
   intercepted popup. It is sound only because the three keys actions redirect with
   `RedirectType.replace`, so however many times a key is saved or refused there is exactly one
   history entry for this panel and one Back is always the list. */

export function KeysModal({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const router = useRouter()

  useEffect(() => {
    const el = dialog.current
    if (!el?.open) el?.showModal()
  }, [])

  // ponytail: `back()` with no entry to go back to would leave the panel mounted and closed. It is
  // unreachable — this component renders only on an INTERCEPTED navigation, which by construction
  // is a push from `/sites` — so there is no guard here rather than an untested one.

  return (
    <dialog
      ref={dialog}
      onClick={closeOnBackdrop}
      onClose={() => router.back()}
      aria-labelledby={KEYS_TITLE_ID}
      className={panelSheet}
    >
      {children}
    </dialog>
  )
}
