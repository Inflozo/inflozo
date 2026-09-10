'use client'

import { useEffect, useRef, useTransition, type MouseEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

/* ────────────────────────────── THE ONE CONTROL THAT OPENS A PANEL OVER THE SITES LIST — S11a's
   ⋯ "Manage API keys" and the card's "Use this site's brand" offer, which used to be two
   different kinds of control with two different bugs in them.

   IT HAS TWO ADDRESSES ON PURPOSE, AND THAT IS THE WHOLE JAVASCRIPT-OFF STORY. `href` is the
   PANEL'S OWN ROUTE — `/sites/keys?site=…` or `/sites/brand?site=…` — so with no script the click
   is a document load and the full page serves the same panel, which is an acceptance criterion of
   Story 3.6 and not a nicety. `panel` is the same panel as a WINDOW over the list, which is a
   query parameter on `/sites` (`keysPopupPath`, `brandPopupPath`), and it is what a plain click
   navigates to. It is exactly the shape S11a's Disconnect row has always had — an `<a href>` to a
   real route whose click JavaScript turns into a dialog over the card — one step further, because
   this panel's content has to be read on the server when it is opened.

   A MODIFIED CLICK IS THE BROWSER'S AND IS LEFT ALONE — ⌘, ctrl, shift, ALT and middle are the
   customer asking for a new tab or a saved link, and they get `href`. Alt joined that list at the
   review of 2026-09-09, having been the one gesture the guard swallowed, and it is why this is a
   `router.push` rather than a `<Link>`: `<Link>`'s own modifier test does not include alt.

   AND IT SAYS IT IS WORKING (R-98), which is the owner's test of 2026-09-10, finding 2: "it takes
   some time and while it is still not open I can click the Menu link again. If I do so the popup
   open on a blank screen instead of the Sites screen." Opening the panel is a server round trip —
   the site row and then the credential row through the Admin chokepoint's pooler — so there IS a
   gap, and until this component the row simply sat there through it. `useTransition` is what a
   navigation has in place of `useFormStatus`: while it is pending the label swaps, the control is
   `aria-disabled` and `aria-busy`, and a second click does nothing at all. `onOpened` fires when
   the transition settles, which is what lets the ⋯ menu stay open — showing the busy row — until
   the window is actually there.

   NO `BusyLabel` HERE, and that is a decision rather than an omission: it stacks both labels in
   one centred grid cell so a BUTTON cannot change width mid-press (the owner's ask of 2026-09-10),
   and both of this control's callers are left-aligned rows whose width is set by something else —
   the ⋯ menu is 196px by the frame (`S11 Sites.dc.html:77`) and the card's offer is a block in a
   grid column. Centring their text to protect a width nothing can change would be the shift. */

export function PanelLink({
  href,
  panel,
  busy,
  className,
  onOpened,
  children,
}: {
  /** The panel's own ROUTE, and the destination without a script. */
  href: string
  /** The same panel as a window over the list — a query parameter on `/sites`. */
  panel: string
  /** What the control says while the window is on its way. */
  busy: string
  className?: string
  /** Called once the navigation has landed — the ⋯ menu closes itself with it. */
  onOpened?: () => void
  children: ReactNode
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  /** Set on the press, so `onOpened` fires for a navigation this control started and no other. */
  const opening = useRef(false)

  // The transition settling is the window being there; nothing else knows when that is.
  useEffect(() => {
    if (pending || !opening.current) return
    opening.current = false
    onOpened?.()
    // `onOpened` is a fresh closure on every render of the caller, so with it in the array this
    // effect runs on renders that are not `pending` falling. That is harmless, and the ref above is
    // why: a run that is not this control's own press never reaches the call. It stays in the
    // array for the exhaustive-deps rule, not because the effect wants it (review 7, 2026-09-10).
  }, [pending, onOpened])

  return (
    <a
      href={href}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        // Every other gesture is the browser's and gets `href`.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
        event.preventDefault()
        // THE SECOND PRESS IS THE FINDING. React's transition is the guard: while one is in
        // flight this does nothing, so there is no second navigation to land in the wrong place.
        if (pending) return
        opening.current = true
        start(() => router.push(panel))
      }}
      className={className}
    >
      {pending ? busy : children}
    </a>
  )
}
