'use client'

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { Mail } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { changeEmail, type ActionResult } from './actions'
import { EMAIL_CHANGED, FIELD_REFUSALS, newEmailFor, STALE_LINK } from './email-change-rule'

/* S12 Billing.dc.html:74-82 — the Email card, and the frame's own "Change email" at the end of
   the row. The row itself is the one this card was lifted from `page.tsx` with: the glyph, the
   address, "Magic links land here", every value the frame's.

   THE BUTTON IS DRAWN FROM THE TOKENS, not from the Kit's `Button`, for the reason "Add a
   passkey" beside it is: the frame's height here is 30px and the Kit's three are 44 / 36 / 32
   (`Editor Sidebar Kit.dc.html`). Same border, same fill, same `paper` hover, the same one ring —
   a size the Kit does not carry, never a second vocabulary (R-74). Read off `:80` and not
   rounded: 30px tall, `0 13px`, radius 10, 12px / 500.

   THE DIALOG HAS NO FRAME and is extrapolated from where the rename dialog's was — S12c through
   `components/kit/dialog.ts`, so the sheet, the display title and the focus-on-Cancel are the
   one vocabulary and cannot drift apart.

   THREE BANNERS AND THEY SAY DIFFERENT THINGS. The green one and the red one are URL HINTS and
   not state: the confirm route lands on `/account?email=changed` when the link worked and
   `?email=stale` when it was too old or already spent (R-94), this card says the one sentence
   and strips the key, so a reload cannot show it again about a link that is long dealt with.
   THE RED ONE IS HERE RATHER THAN ON THE SIGN-IN PAGE because that page redirects a signed-in
   visitor to the dashboard before it renders a word, and the browser the email is opened on is
   usually a signed-in one. The blue one IS
   state — Supabase's own `new_email`, still inside its link's lifetime — and it leaves on its
   own when the link expires unopened. */

/** The three the FIELD owns; anything else is the Banner above the form (`passkeys-card.tsx`). */
const FIELD_CODES = new Set(['bad_email', 'same_email', 'in_use'])

/* The two the client can refuse on its own are `FIELD_REFUSALS`, the ONE map `actions.ts`'s
   `MESSAGES` also spreads — a `'use server'` file exports only async functions, so the map lives
   in the plain module and the card and the action agree by construction (review, 2026-09-07). */

export function EmailCard({
  email,
  pending,
  justChanged,
  staleLink,
}: {
  email: string | undefined
  /** Supabase's own pending change, while its link is still good. Never a store of ours. */
  pending: { email: string } | null
  justChanged: boolean
  /** The confirm route could not redeem the link it was opened with (R-94). */
  staleLink: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [sent, sendAction, sending] = useActionState<ActionResult | null, FormData>(changeEmail, null)

  // The green sentence has been said; take the key off the URL so a reload is not a second
  // announcement. `replaceState` and not a router push: nothing navigates, and the App Router
  // reads the stripped URL for its next refresh.
  // Either sentence — the green one or the red one — is said once; both ride on the one key.
  useEffect(() => {
    if (!justChanged && !staleLink) return
    const url = new URL(window.location.href)
    url.searchParams.delete(EMAIL_CHANGED)
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }, [justChanged, staleLink])

  // `passkeys-card.tsx:96-131`, both halves and for both reasons. React queues form actions and
  // `sending` only turns true on the NEXT render, so a held Enter or a double click sends two
  // changes; and a result the dialog was CLOSED on is spent, or the next open would start with
  // the last attempt's sentence still on screen.
  const submitting = useRef(false)
  useEffect(() => {
    if (!sending) submitting.current = false
  }, [sending])
  const [seen, setSeen] = useState<ActionResult | null>(null)

  useEffect(() => {
    if (!sent) return
    if ('ok' in sent) dialog.current?.close()
    else if (!dialog.current?.open) setSeen(sent)
  }, [sent])

  // THE SAME FUNCTION THE ACTION USES, at the submit: a non-address and the account's own
  // address never leave the browser (the matrix's "nothing sent"), and "already in use" always
  // does — only GoTrue can answer that one, and it answers it before it sends anything.
  const [clientError, setClientError] = useState<string | null>(null)
  const guard = (event: FormEvent<HTMLFormElement>) => {
    const asked = newEmailFor(email, new FormData(event.currentTarget).get('email'))
    if ('code' in asked) {
      event.preventDefault()
      setClientError(FIELD_REFUSALS[asked.code])
      return
    }
    setClientError(null)
    once(event)
  }
  const once = (event: { preventDefault: () => void }) => {
    if (submitting.current) {
      event.preventDefault()
      return
    }
    submitting.current = true
  }

  const failure = sent !== seen && sent && 'error' in sent ? sent.error : null
  const fieldError = clientError ?? (failure && FIELD_CODES.has(failure.code) ? failure.message : null)
  const bannerError = failure && !FIELD_CODES.has(failure.code) ? failure.message : null

  return (
    <section className="flex flex-col gap-[14px] rounded-lg border border-line bg-surface p-[20px_24px] shadow-sm">
      <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">Email</h2>

      {justChanged ? (
        <Banner kind="success">
          Your email is now <span className="font-medium break-all">{email}</span>.
        </Banner>
      ) : null}

      {staleLink ? <Banner kind="error">{STALE_LINK}</Banner> : null}

      <div className="flex items-center gap-3 py-[2px]">
        <span className="shrink-0 text-ink-soft">
          <Mail size={16} />
        </span>
        <span className="flex min-w-0 flex-col gap-px">
          <span className="break-all text-ui-dense font-medium text-ink">{email}</span>
          <span className="text-helper-caption text-ink-soft">Magic links land here</span>
        </span>
        {/* The frame's own button (`:80`), at the row's end as it draws it. */}
        <button
          type="button"
          onClick={() => openOnCancel(dialog.current)}
          className={`ml-auto inline-flex h-[30px] shrink-0 items-center rounded-thumb border border-line bg-surface px-[13px] text-control-label font-medium text-ink transition-colors hover:bg-paper ${ring}`}
        >
          Change email
        </button>
      </div>

      {pending ? (
        <Banner kind="info">
          We sent a link to <span className="font-medium break-all">{pending.email}</span>. Open it
          to finish — this address stays until you do.
        </Banner>
      ) : null}

      <dialog
        ref={dialog}
        aria-labelledby="change-email-title"
        onClick={closeOnBackdrop}
        onClose={(event) => {
          setSeen(sent)
          setClientError(null)
          // The field is uncontrolled, so a refused or abandoned address stayed in it.
          event.currentTarget.querySelector('form')?.reset()
        }}
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id="change-email-title" className={title}>
            Change email
          </h2>
          <p className="text-ui-dense leading-[1.5] text-ink-soft">
            We&rsquo;ll send a link to the new address. Nothing changes until you open it.
          </p>
        </div>
        {bannerError ? <Banner kind="error">{bannerError}</Banner> : null}
        {/* `noValidate`, as `sign-in-form.tsx` has beside its own `type="email"`: without it the
            browser's constraint validation stops the submit event for `maya` and shows its own
            bubble — a tooltip, which P0-0 forbids — and `guard()` never runs. Executed on the
            deployed site by the harness's `bad-email` step (review, 2026-09-07). */}
        <form action={sendAction} onSubmit={guard} noValidate className="flex flex-col gap-[18px]">
          <TextInput
            id="change-email"
            name="email"
            label="New email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={fieldError}
          />
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
            <Button type="submit" variant="primary" size={36}>
              {sending ? 'Sending…' : 'Send link'}
            </Button>
          </div>
        </form>
      </dialog>
    </section>
  )
}
