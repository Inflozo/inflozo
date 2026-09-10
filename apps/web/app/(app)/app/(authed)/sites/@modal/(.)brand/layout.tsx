import type { ReactNode } from 'react'
import { BRAND_TITLE_ID } from '../../brand-panel'
import { PanelModal } from '../../panel-modal'

/**
 * THE DIALOG AROUND THE INTERCEPTED BRAND OFFER, and it is a layout so the dialog opens once —
 * `@modal/(.)keys/layout.tsx` carries the argument: a `<dialog>` rendered by both `loading.tsx`
 * and `page.tsx` would unmount and remount as the panel arrived, so the window would open, close
 * and open again in front of the customer.
 *
 * `panel-modal.tsx` carries the `'use client'` and is shared with Manage keys' popup; everything
 * below this stays a server render.
 */
export default function InterceptedBrandLayout({ children }: { children: ReactNode }) {
  return (
    <PanelModal labelledBy={BRAND_TITLE_ID} path="/sites/brand">
      {children}
    </PanelModal>
  )
}
