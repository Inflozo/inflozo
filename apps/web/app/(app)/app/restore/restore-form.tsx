'use client'

import { useActionState } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { restoreAccount, type ActionResult } from '../(authed)/account/actions'

/**
 * S1a's ONE ACTION, at its own size: a primary 44 across the full width of the card, the way the
 * sign-in card's is. FR-A5's "one-click Restore account".
 *
 * NO `once` GUARD AND NO `seen`. There is no dialog to close a result on, and `restore_account()`
 * is idempotent by construction — a second call after a successful first finds `deleted_at` null,
 * matches no row and answers `false`… which is a sentence about a window that has already closed.
 * React's own `useActionState` pending state is what stops the double press: the button reads
 * "Restoring…" and the form is already in flight, and the successful path redirects away.
 *
 * BOTH FAILURES ARE THE SAME RED STRIP. `restore_failed` says the call did not go through and to
 * try again; `window_closed` says the fourteen days have ended — and it is the one the page
 * cannot pre-empt, because the deadline can pass between this render and the click.
 */
export function RestoreForm() {
  const [answered, restore, restoring] = useActionState<ActionResult | null, FormData>(
    restoreAccount,
    null,
  )
  const failure = answered && 'error' in answered ? answered.error : null

  return (
    <form action={restore} className="flex flex-col gap-2.5">
      {failure ? <Banner kind="error">{failure.message}</Banner> : null}
      <Button type="submit" variant="primary" size={44} className="w-full">
        {restoring ? 'Restoring…' : 'Restore account'}
      </Button>
    </form>
  )
}
