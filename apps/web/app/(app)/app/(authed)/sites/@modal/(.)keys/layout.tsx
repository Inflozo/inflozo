import type { ReactNode } from 'react'
import { KeysModal } from '../../keys-modal'

/**
 * THE DIALOG AROUND THE INTERCEPTED PANEL, AND IT IS A LAYOUT SO THE DIALOG OPENS ONCE.
 *
 * `loading.tsx` and `page.tsx` are different positions in the fibre tree — a Suspense fallback and
 * its content — so a `<dialog>` rendered by each would unmount and remount as the panel arrived:
 * the popup would open, close and open again in front of the customer. A layout wraps both, so the
 * window opens on the click and the skeleton inside it is swapped for the panel.
 *
 * `keys-modal.tsx` carries the `'use client'`; everything below this stays a server render.
 */
export default function InterceptedKeysLayout({ children }: { children: ReactNode }) {
  return <KeysModal>{children}</KeysModal>
}
