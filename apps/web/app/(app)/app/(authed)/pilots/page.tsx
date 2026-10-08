import type { Metadata, Viewport } from 'next'
import { PilotsPage } from './review-page'

/* ────────────────────────────────────────────────────────────────── the pilots review

   The library's designs — Story 4.10's pilots first — CHECKED BY LOOKING: each on the canvas beside its panel, switched in the canvas
   chrome between light and dark, desktop, tablet and phone, and the visitor it is viewed as — so each can be held
   up against its frame in the design export. Since Story 6.2, in any of the twelve Style Packs too (the Pack menu):
   the epic's exit, every pack on the pilots in both modes, for the owner's eye. It is `/controls`' workspace fed the library's own designs, which are
   read off `packages/library/designs/` (the directory is the list), assembled and validated here on every request,
   loudly.

   Sibling of `/controls` in every respect: internal, noindex, behind the session guard, and dynamic, because the
   guard needs the cookie store. Nothing on it is saved. */

export const metadata: Metadata = {
  title: 'Pilots review — Inflozo',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function PilotsReview() {
  return <PilotsPage />
}
