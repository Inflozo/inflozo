'use client'

import { useActionState, useEffect, useState, type FormEvent } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { sendMagicLink, type SendState } from './actions'
import { BAD_EMAIL, parseEmail } from './email.ts'
import { mmss, secondsLeft } from './resend-timer.ts'

/* S1 Sign In.dc.html — S1a (the card) and S1b (the same card, after a send).
   ONE <form>, two bodies: the address has to survive into the sent state so "Resend" can post
   it again, and a second form would mean a second copy of it.

   The email field is S1's OWN drawing, built here from the same tokens rather than from the
   Kit's `TextInput`: the Kit's field is 36px tall at 12.5px for a 280px sidebar, and this one
   is 44px at 14px (16px at 390, so iOS does not zoom the page on focus). Same border, same
   coral caret, same one ring — a different size, not a different vocabulary. */

const linkStyle = `text-ui-dense font-medium text-ink-soft underline underline-offset-[3px] rounded-sm ${ring}`

// One field on the page, so a literal id rather than `useId()`: it is stable across renders and
// across deploys, which is what the owner's test and the axe run both address it by.
const FIELD = 'email'

export function SignInForm({ linkError, passkeys }: { linkError: boolean; passkeys: boolean }) {
  const [state, formAction, pending] = useActionState<SendState, FormData>(sendMagicLink, {
    status: 'idle',
  })
  // "Use a different email" is a return to S1a without discarding the send that happened —
  // the link stays valid and the countdown is irrelevant once the address changes (UX-DR13).
  const [different, setDifferent] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [left, setLeft] = useState(0)

  const sent = state.status === 'sent' && !different

  // The countdown's first value comes from the render that first sees a new action result, not
  // from the effect below: an effect runs AFTER paint, so the card would flash "Resend" as a live
  // link for one frame before the timer took over. This is React's own adjust-state-during-render
  // pattern — no extra render, and the effect keeps it ticking from there.
  const [seen, setSeen] = useState<SendState>(state)
  if (seen !== state) {
    setSeen(state)
    setLeft(state.status === 'sent' ? state.retryAfter : 0)
  }

  useEffect(() => {
    if (state.status !== 'sent') return
    // The action has just returned, so "now" is when the mail left. `state` is a new object per
    // send, so a resend restarts this effect and the countdown with it.
    const sentAt = Date.now()
    const tick = () => setLeft(secondsLeft(sentAt, state.retryAfter, Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state])

  // The same schema the action uses, so the sentence cannot differ — and no round trip for an
  // address that was never one. `preventDefault` stops React running the action.
  function guard(event: FormEvent<HTMLFormElement>) {
    const value = new FormData(event.currentTarget).get('email')
    if (!parseEmail(value)) {
      event.preventDefault()
      setClientError(BAD_EMAIL)
      return
    }
    setClientError(null)
    setDifferent(false)
  }

  const fieldError =
    clientError ??
    (state.status === 'error' && state.error.code === 'bad_email' ? state.error.message : null)

  return (
    <form
      action={formAction}
      onSubmit={guard}
      noValidate
      className={`relative z-10 flex w-full max-w-[400px] flex-col rounded-lg bg-surface shadow-lg ${
        sent ? 'items-center gap-5 p-[32px_24px] text-center tablet:p-[44px_36px]' : 'gap-[22px] p-[32px_24px] tablet:gap-6 tablet:p-[40px_36px]'
      }`}
    >
      {sent ? (
        <>
          <input type="hidden" name="email" value={state.email} />

          {/* S1b's envelope, the frame's own drawing (R-74). The two hexes it sets become the
              tokens they are: ink for the outline, coral for the spark. */}
          <svg width="88" height="66" viewBox="0 0 88 66" fill="none" aria-hidden className="text-ink">
            <rect x="8" y="14" width="72" height="46" rx="6" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M11 18l33 23 33-23"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M71 2l1.7 4.6L77.3 8.3l-4.6 1.7L71 14.6l-1.7-4.6-4.6-1.7 4.6-1.7z" className="fill-coral" />
          </svg>

          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[26px] font-bold tracking-[-0.01em] tablet:text-[28px]">
              Check your inbox ✨
            </h1>
            <p className="text-ui leading-[1.55] text-ink-soft">
              We sent a magic link to
              <br />
              <strong className="font-semibold text-ink">{state.email}</strong>
              <br />
              It&rsquo;s good for 15 minutes.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-2.5">
            {/* The countdown says when another may be asked for and nothing more: the link in
                the inbox is good for its own 15 minutes either way (UX-DR13). */}
            <p className="text-ui-dense text-ink-soft" aria-live="polite">
              Didn&rsquo;t get it?{' '}
              {left > 0 ? (
                <>
                  Resend in <span className="font-mono text-ui-dense text-ink">{mmss(left)}</span>
                </>
              ) : (
                <button type="submit" className={linkStyle}>
                  Resend
                </button>
              )}
            </p>
            <button type="button" onClick={() => setDifferent(true)} className={linkStyle}>
              Use a different email
            </button>
          </div>
        </>
      ) : (
        <>
          {linkError ? (
            <Banner kind="error">That link has expired or was already used. Ask for a new one.</Banner>
          ) : null}
          {state.status === 'error' && state.error.code === 'send_failed' ? (
            <Banner kind="error">{state.error.message}</Banner>
          ) : null}

          <div className="flex flex-col gap-2.5">
            <div className="font-display text-[20px] font-extrabold tracking-[-0.02em] tablet:text-[22px]">
              Inflozo
            </div>
            <h1 className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.01em] tablet:text-[28px]">
              Make something gorgeous.
            </h1>
            <p className="text-ui leading-[1.5] text-ink-soft">
              Sign in or create an account — no passwords, ever.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={FIELD} className="text-ui-dense font-medium text-ink-soft">
              Email
            </label>
            <input
              id={FIELD}
              name="email"
              type="email"
              autoComplete="email"
              // No `autoFocus`. The frame draws S1a at REST — a `line` border, not the coral
              // focus border — and the spec's own Tab order is field → button → Terms → Privacy,
              // which autofocus turns into button → Terms → Privacy. It also moves a screen
              // reader's cursor without being asked. Both settled by looking at the deployed page.
              placeholder="you@example.com"
              defaultValue={state.status === 'error' ? state.email : ''}
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={fieldError ? `${FIELD}-error` : undefined}
              className={`h-11 rounded-sm border border-line bg-surface px-[14px] text-body text-ink caret-coral placeholder:text-ink-soft-aa focus-visible:border-coral-text tablet:text-ui ${ring}`}
            />
            {fieldError ? (
              // P0-0's helper-caption slot, in danger-text: one sentence, under the control,
              // never a tooltip.
              <p id={`${FIELD}-error`} role="alert" className="text-helper-caption leading-[1.5] text-danger-text">
                {fieldError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" variant="primary" size={44} className="w-full">
              {pending ? 'Sending…' : 'Send magic link'}
            </Button>

            {/* S1a draws a passkey button and an "or" divider. Both are absent until
                `feature_flags.passkeys` is on — Story 2.1 flips the row and wires the
                ceremony; a control that could never act here is absent, not greyed (UX-DR3). */}
            {passkeys ? (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-control-label text-ink-soft">or</span>
                <div className="h-px flex-1 bg-line" />
              </div>
            ) : null}
          </div>
        </>
      )}
    </form>
  )
}
