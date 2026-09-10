import type { ReactNode } from 'react'
import { PanelModal } from '../../panel-modal'
import { KEYS_TITLE_ID } from '../../keys-panel'

/**
 * THE DIALOG AROUND THE INTERCEPTED PANEL, AND IT IS A LAYOUT SO THE DIALOG OPENS ONCE.
 *
 * `loading.tsx` and `page.tsx` are different positions in the fibre tree — a Suspense fallback and
 * its content — so a `<dialog>` rendered by each would unmount and remount as the panel arrived:
 * the popup would open, close and open again in front of the customer. A layout wraps both, so the
 * window opens on the click and the skeleton inside it is swapped for the panel.
 *
 * `panel-modal.tsx` carries the `'use client'` and is shared with the brand offer's popup;
 * everything below this stays a server render.
 */
export default function InterceptedKeysLayout({ children }: { children: ReactNode }) {
  return (
    <PanelModal labelledBy={KEYS_TITLE_ID} path="/sites/keys">
      {children}
    </PanelModal>
  )
}
