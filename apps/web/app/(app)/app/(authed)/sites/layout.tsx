import type { ReactNode } from 'react'

/**
 * THE SITES SEGMENT'S LAYOUT, AND IT EXISTS FOR ONE REASON: the `@modal` slot (the owner's test of
 * Story 3.6, finding 1 — "Can we show the Manage Keys as a popup on the Sites screen rather than a
 * separate screen").
 *
 * Next's interception is what makes that popup possible without moving the panel's credential read
 * onto the Sites list: a soft navigation to `/sites/keys?site=…` from anywhere under this layout is
 * caught by `@modal/(.)keys` and drawn in a `<dialog>` over the list, while every other way to that
 * URL — a typed address, a modified click, a refresh, a scripts-off browser — is a document load
 * that lands on `sites/keys/page.tsx` as a full page. Interception needs a parallel slot, a slot
 * needs a layout, and this is that layout and nothing else.
 *
 * IT ADDS NO CHROME. The shell's `<main>` is one flex column and `children` is what fills it, so
 * this returns a fragment: anything wrapped around `children` here would land on `/sites`,
 * `/sites/connect`, `/sites/brand`, `/sites/disconnect` and `/sites/keys` at once.
 *
 * `@modal/default.tsx` is what the slot renders on every route that is not an intercepted keys
 * panel — including `/sites/keys` itself, reached directly — and it renders nothing.
 */
export default function SitesLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
