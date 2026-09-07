'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { Laptop } from '@/components/kit/icons'
import { signOutEverywhere, type ActionResult } from './actions'

/* S12 Billing.dc.html — S12a. THE FRAME DRAWS NO SESSIONS SURFACE, so this card is extrapolated
   from the nearest drawn one beside it: the Email card (`:74-82`), whose shell, row and 30px
   button are the frame's own and are written here in the same class strings `email-card.tsx`
   uses (R-74 — the same vocabulary, never a second one). Label, glyph, title, caption and
   button text are FR-A6's; everything they are drawn with is the frame's.

   IT DOES NOT DEPEND ON THE PASSKEY SWITCHES. A way OUT of every device must never hang on a way
   in: `page.tsx` renders it unconditionally, where the Passkeys card is absent with the flag off.

   THE CONFIRM HAS NO FRAME EITHER and is `kit/dialog.ts`'s — S12c's sheet, display title and
   focus-on-Cancel, the one dialog vocabulary. UNTYPED: the typed confirm is account and project
   delete only (EXPERIENCE.md § Destructive confirms), and nothing is lost here but a re-sign-in.
   It is not the Danger zone's red for the same reason.

   THE ACTION REDIRECTS ON SUCCESS, so this card renders no success state at all: the browser is
   already on `/sign-in?signed-out=all`, which says the sentence. The only thing it can show is
   the one failure — and then nothing happened to the other devices, so nothing is claimed. */

export function SessionsCard() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [answered, signOutAction, signingOut] = useActionState<ActionResult | null, FormData>(
    signOutEverywhere,
    null,
  )

  // `email-card.tsx:75-85`, both halves and for both reasons. React queues form actions and
  // `signingOut` only turns true on the NEXT render, so a held Enter or a double click sends two
  // requests; and a result the dialog was CLOSED on is spent, or the next open would start with
  // the last attempt's sentence still on screen.
  const submitting = useRef(false)
  useEffect(() => {
    if (!signingOut) submitting.current = false
  }, [signingOut])
  const [seen, setSeen] = useState<ActionResult | null>(null)
  const once = (event: { preventDefault: () => void }) => {
    if (submitting.current) {
      event.preventDefault()
      return
    }
    submitting.current = true
  }

  // Only a failure can arrive here: success threw a redirect and this component is gone.
  const failure = answered !== seen && answered && 'error' in answered ? answered.error : null

  return (
    <section className="flex flex-col gap-[14px] rounded-lg border border-line bg-surface p-[20px_24px] shadow-sm">
      <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">
        Sessions
      </h2>

      <div className="flex items-center gap-3 py-[2px]">
        <span className="shrink-0 text-ink-soft">
          <Laptop size={16} />
        </span>
        <span className="flex min-w-0 flex-col gap-px">
          <span className="text-ui-dense font-medium text-ink">
            Every device you&rsquo;re signed in on
          </span>
          {/* FR-A6's thirty days, said where the user can see it — the cookie's own `Max-Age`
              (`lib/supabase/cookies.ts`), rolling from each visit. */}
          <span className="text-helper-caption text-ink-soft">
            Each stays signed in for 30 days from its last visit
          </span>
        </span>
        {/* The frame's own button (`:80`), at the row's end as it draws it. */}
        <button
          type="button"
          onClick={() => openOnCancel(dialog.current)}
          className={`ml-auto inline-flex h-[30px] shrink-0 items-center rounded-thumb border border-line bg-surface px-[13px] text-control-label font-medium text-ink transition-colors hover:bg-paper ${ring}`}
        >
          Sign out everywhere
        </button>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="sign-out-everywhere-title"
        onClick={closeOnBackdrop}
        onClose={() => setSeen(answered)}
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id="sign-out-everywhere-title" className={title}>
            Sign out everywhere?
          </h2>
          {/* INCLUDING THIS ONE, said in the sentence: the AC is every session, and a user who
              expected to keep the device in their hand must not learn it by being logged out. */}
          <p className="text-ui-dense leading-[1.5] text-ink-soft">
            Every device signed in to your account will be signed out, including this one. Sign in
            again wherever you need to.
          </p>
        </div>

        {failure ? <Banner kind="error">{failure.message}</Banner> : null}

        {/* A `<form>` with the action as its own dispatch, so it is progressively enhanced
            (`projects/actions.ts:130`'s reason: a client closure passed as `action` emits no
            action at all with JavaScript off). No field, so no `noValidate` is needed. */}
        <form action={signOutAction} onSubmit={once} className="flex justify-end gap-[10px]">
          <Button
            type="button"
            variant="secondary"
            size={36}
            data-cancel
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size={36}>
            {signingOut ? 'Signing out…' : 'Sign out everywhere'}
          </Button>
        </form>
      </dialog>
    </section>
  )
}
