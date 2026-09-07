'use client'

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { AlertTriangle } from '@/components/kit/icons'
import { requestDeletion, type ActionResult } from './actions'
import { DELETE_PHRASE, deletionSentence, matchesPhrase } from './deletion-rule'

/* S12 Billing.dc.html — the Danger zone card (`:104-111`) and its confirm (S12c, `:150-171`).
   FR-A5, Story 2.5.

   THE CARD IS THE FRAME'S, read and not rounded: the `danger-line` hairline, radius 16, 20/24
   padding, a 10px gap (the Email card beside it is 14 and carries a shadow; this one has NEITHER
   in the frame), the label in `danger-text-hover`, and the row's own title and caption. IT SITS
   UNDER SESSIONS UNCONDITIONALLY — a way out of the product cannot depend on a feature flag, for
   the reason the Sessions card cannot.

   THE BUTTON IS DRAWN FROM THE TOKENS rather than from the Kit's `Button`, exactly as the Email
   card's 30px one is: the frame's height here is 34px and the Kit's three are 44 / 36 / 32, and
   the Kit's `danger-outline` border is `danger` where the frame's is `danger-line`. Same
   vocabulary, a size the Kit does not carry (R-74) — never a second vocabulary.

   THE CONFIRM IS S12c THROUGH `kit/dialog.ts`, in the shape `project-menu.tsx` already built from
   this same frame: the disc and triangle, the mono chip, the mono field with the `danger` border
   and caret, and the primary greyed to the frame's own `.45` until the phrase is typed. It is
   LEFT-aligned, as S12c draws it; the centred layout belongs to the project delete alone.

   THE SENTENCE CARRIES THE WINDOW because the PRD decides behaviour (R-74's scope): the frame's
   "This cannot be undone." is not true for fourteen days, and the person reading it is deciding
   on that sentence. `deletionSentence` composes it from this account's own counts.

   THE GREYED BUTTON IS A COURTESY, NOT THE CHECK. `requestDeletion` runs `matchesPhrase` again on
   arrival and never trusts what the client allowed to be pressed. */

export function DangerCard({ projects, assets }: { projects: number; assets: number }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [answered, deleteAction, deleting] = useActionState<ActionResult | null, FormData>(
    requestDeletion,
    null,
  )

  const [typed, setTyped] = useState('')
  const armed = matchesPhrase(typed)

  // `email-card.tsx:75-85`, both halves and for both reasons. React queues form actions and
  // `deleting` only turns true on the NEXT render, so a held Enter or a double click sends two
  // requests; and a result the dialog was CLOSED on is spent, or the next open would start with
  // the last attempt's sentence still on screen.
  const submitting = useRef(false)
  useEffect(() => {
    if (!deleting) submitting.current = false
  }, [deleting])
  const [seen, setSeen] = useState<ActionResult | null>(null)
  useEffect(() => {
    if (answered && !dialog.current?.open) setSeen(answered)
  }, [answered])
  const once = (event: { preventDefault: () => void }) => {
    if (submitting.current) {
      event.preventDefault()
      return
    }
    submitting.current = true
  }

  // Only a failure can arrive: success threw a redirect to `/restore` and this component is gone.
  const failure = answered !== seen && answered && 'error' in answered ? answered.error : null
  const fieldError = failure?.code === 'wrong_phrase' ? failure.message : null
  const bannerError = failure && failure.code !== 'wrong_phrase' ? failure.message : null

  const guard = (event: FormEvent<HTMLFormElement>) => {
    // A greyed button must not be pressed into action by Enter in the field.
    if (!armed) {
      event.preventDefault()
      return
    }
    once(event)
  }

  return (
    <section className="flex flex-col gap-[10px] rounded-lg border border-danger-line bg-surface p-[20px_24px]">
      <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-danger-text-hover">
        Danger zone
      </h2>

      <div className="flex items-center gap-3">
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-ui-dense font-medium text-ink">Delete account</span>
          {/* The frame's own caption, and the sentence that matters most in it is the last one. */}
          <span className="text-control-label leading-[1.5] text-ink-soft">
            Removes every project, version and asset. Your live Ghost sites stay up &mdash; we
            never touch them.
          </span>
        </span>
        {/* The frame's own button (`:109`): 34px, 0 15px, radius 12, 13px/600. */}
        <button
          type="button"
          onClick={() => openOnCancel(dialog.current)}
          className={`ml-auto inline-flex h-[34px] shrink-0 items-center rounded border border-danger-line bg-surface px-[15px] text-ui-dense font-semibold text-danger-text transition-colors hover:bg-danger-tint ${ring}`}
        >
          Delete account
        </button>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-body"
        onClick={closeOnBackdrop}
        // The typed phrase is spent with the dialog: Cancel after typing it must not leave a
        // confirm that reopens already armed, one click from the irreversible thing (review,
        // 2026-09-07). The harness's `rearm` step is what keeps this true.
        onClose={() => {
          setSeen(answered)
          setTyped('')
        }}
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger"
          >
            <AlertTriangle size={17} strokeWidth={1.8} />
          </span>
          <div className="flex min-w-0 flex-col gap-[4px]">
            <h2 id="delete-account-title" className={title}>
              Delete your account?
            </h2>
            <p id="delete-account-body" className="text-ui-dense leading-[1.5] text-ink-soft">
              {deletionSentence(projects, assets)}
            </p>
          </div>
        </div>

        {bannerError ? <Banner kind="error">{bannerError}</Banner> : null}

        <form action={deleteAction} onSubmit={guard} className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-[6px]">
            <label
              htmlFor="delete-account-confirm"
              className="text-control-label font-medium text-ink-soft"
            >
              Type{' '}
              <span className="rounded-[5px] border border-line bg-paper px-[6px] py-px font-mono text-control-label text-ink">
                {DELETE_PHRASE}
              </span>{' '}
              to confirm
            </label>
            <input
              id="delete-account-confirm"
              name="confirm"
              type="text"
              autoComplete="off"
              value={typed}
              onChange={(event) => setTyped(event.currentTarget.value)}
              aria-describedby={fieldError ? 'delete-account-error' : undefined}
              className={`h-10 rounded-sm border border-danger bg-surface px-3 font-mono text-ui-dense text-ink caret-danger ${ring}`}
            />
            {fieldError ? (
              <p
                id="delete-account-error"
                role="alert"
                className="text-helper-caption leading-[1.5] text-danger-text"
              >
                {fieldError}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-[10px]">
            <Button
              type="button"
              variant="secondary"
              size={36}
              data-cancel
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </Button>
            {/* The Kit greys with `aria-disabled`, never `disabled`: the button stays in the tab
                order so a screen reader still reaches it and its state (`greyed.ts`). `.45` is
                the frame's own (`:167`). */}
            <Button
              type="submit"
              variant="danger"
              size={36}
              aria-disabled={armed ? undefined : true}
              className={armed ? '' : 'opacity-45'}
            >
              {deleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </div>
        </form>
      </dialog>
    </section>
  )
}
