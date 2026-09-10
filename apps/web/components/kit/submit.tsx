'use client'

import { useEffect, useRef, type ComponentProps, type MouseEvent, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from './button'

/* ───────── THE ONE PLACE A CONTROL SAYS IT IS WORKING.

   The owner's test of Story 3.4, finding 1: "When I click a button, there is no way the user know
   if something is happening in background. The button does not says anything." He pressed **Use
   your brand** and **Skip** on S2c and nothing about either changed.

   IT IS NOT A NEW PATTERN — it is the one already in this repository, lifted out of the single
   file that had it. `account-menu.tsx`'s Sign out row has said `Signing out…` since the owner's
   third test; `passkey-button.tsx` says `Waiting for your device…`; `connect-wizard.tsx` says
   `Connecting…`. What none of them did was live anywhere a SECOND caller could reach it, so the
   split ran exactly along one line: every form in a CLIENT component had a busy state from its
   own `useActionState`, and every form in a SERVER component had none, because a server component
   has no hook to read. Three files, seven controls, all of them invisible while they worked.

   `useFormStatus` IS THE FORM'S OWN STATUS and needs no state of its own to go wrong, which is
   why this has to be a CHILD of the `<form>` rather than the thing that renders it. It reads a
   server component's form perfectly well — the client boundary is this control, not the page, so
   `site-notices.tsx` and S2c keep being server renders with `<form action={serverAction}>` and
   keep working with JavaScript off. With scripts off there is no busy state and there is nothing
   to show one: the click is a document navigation and the browser's own progress is the signal.

   `aria-disabled` and not `disabled`: a disabled button loses focus to the body and stops being
   announced, and this one is the thing the user is waiting on. It also carries the VISIBLE half
   of the state for free — `globals.css:163` takes the pointer cursor off anything
   `[aria-disabled='true']` — so the state needs no opacity value the export never drew (R-74).
   `aria-busy` says why it is refusing rather than only that it is. */

/**
 * The busy half on its own, for a submit control whose markup is not the Kit's `Button` — the
 * account menu's row, a menu item.
 *
 * `guard` goes on `onClick`. THE REF HAS TO BE RELEASED: a server-action redirect inside the same
 * route group is a soft navigation, the component is never remounted, and a ref left `true` makes
 * the only control that can retry inert for good (review, 2026-09-06). React queues form actions,
 * so without the ref one impatient double tap sends two — the New project sheet made three rows
 * from three submits in one tick before it got one.
 *
 * AND ONLY A CLICK THAT REALLY SUBMITS MAY CLAIM THE SLOT. The release runs on `pending` falling,
 * so a click that never turns `pending` true never releases: the ref stays set and the control is
 * inert for good — the exact failure the release was added to prevent, reached from the other
 * side (review, 2026-09-09). Two clicks do that, and neither is exotic in a Kit primitive every
 * future form reaches: one the form refuses on its own constraints, and one a caller cancels.
 * Today's four call sites have no validated field and no cancelling `onClick`, which is why
 * nothing had met it; `Submit` calls the caller's `onClick` FIRST so `defaultPrevented` is
 * already true here when it cancels.
 */
export function useSubmitting() {
  const { pending } = useFormStatus()
  const inFlight = useRef(false)
  useEffect(() => {
    if (!pending) inFlight.current = false
  }, [pending])
  return {
    pending,
    guard: (event: MouseEvent<HTMLElement>) => {
      if (inFlight.current) {
        event.preventDefault()
        return
      }
      if (event.defaultPrevented) return
      // `noValidate` first: it suppresses the browser's block, so such a form submits with an
      // invalid field and the slot is genuinely claimed (`email-card.tsx` is that shape).
      const form = event.currentTarget.closest('form')
      if (form && !form.noValidate && !form.checkValidity()) return
      inFlight.current = true
    },
  }
}

/**
 * THE LABEL SWAP, AND IT MOVES NOTHING — the owner's ask of 2026-09-10: "When clicking the
 * buttons, their labels change and want to ensure that does not change the layout or add any
 * layout shifts."
 *
 * `{pending ? busy : children}` is one child at a time, so the button was as wide as whichever
 * label was showing — **Skip** (34px of text) becoming **Skipping…** widened it mid-press and
 * shoved its neighbour along, and a control inside a flex row could move the row it sits in.
 * Both labels are therefore always in the DOM, stacked in ONE grid cell: the button's intrinsic
 * width is the WIDER of the two, in every language and at every font, without a hardcoded
 * `min-w` that would be a measurement in a class name (standing rule 4's argument, applied to a
 * width).
 *
 * `invisible` IS `visibility: hidden` AND NOT `opacity`, which is what keeps the hidden half out
 * of the accessibility tree as well as off the screen — so a reader is told "Skipping…" only
 * while it is true, and no `aria-hidden` juggling is needed to make that so.
 *
 * It is HERE rather than in `Submit` alone because one submit control in the app is not a Kit
 * button — `keys-content-form.tsx`'s, whose busy state is its own component state because its
 * form's action is never dispatched by the form. Localising the fix would have left the one
 * control that already needed a hand-written busy state as the one that still jumped.
 */
export function BusyLabel({
  pending,
  busy,
  children,
}: {
  pending: boolean
  busy: string
  children: ReactNode
}) {
  const cell = 'col-start-1 row-start-1 inline-flex items-center justify-center gap-[7px]'
  return (
    <span className="grid">
      <span className={`${cell} ${pending ? 'invisible' : ''}`}>{children}</span>
      <span className={`${cell} ${pending ? '' : 'invisible'}`}>{busy}</span>
    </span>
  )
}

/**
 * A Kit button that submits its form and SAYS SO: `busy` replaces the label while the action is
 * in flight.
 *
 * `busy` is REQUIRED, so a submit control cannot be added without one — the same shape `Greyed`
 * uses to make a reason un-forgettable, and the reason `busy.test.ts` can audit the tree by
 * looking for this component rather than for a word.
 */
export function Submit({
  busy,
  children,
  onClick,
  ...rest
}: ComponentProps<typeof Button> & { busy: string }) {
  const { pending, guard } = useSubmitting()
  return (
    <Button
      {...rest}
      type="submit"
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      /* The caller's handler runs BEFORE the guard so a cancelled click cannot claim the
         in-flight slot — see `useSubmitting`. Nothing here reads what the guard sets. */
      onClick={(event) => {
        onClick?.(event)
        guard(event)
      }}
    >
      <BusyLabel pending={pending} busy={busy}>
        {children}
      </BusyLabel>
    </Button>
  )
}
