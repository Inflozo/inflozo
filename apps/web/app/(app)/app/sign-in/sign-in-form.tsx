'use client'

import { useActionState, useEffect, useState, type FormEvent } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { sendMagicLink, type SendState } from './actions'
import { PasskeyButton } from './passkey-button'
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

export function SignInForm({
  linkError,
  signedOut,
  passkeys,
}: {
  linkError: boolean
  signedOut: boolean
  passkeys: boolean
}) {
  const [state, formAction, pending] = useActionState<SendState, FormData>(sendMagicLink, {
    status: 'idle',
  })
  // "Use a different email" is a return to S1a without discarding the send that happened —
  // the link stays valid and the countdown is irrelevant once the address changes (UX-DR13).
  const [different, setDifferent] = useState(false)
  // …and a send can already be on the wire when it is pressed: the resend line offers Resend at
  // 0:00 and both buttons stay live for the ~1.5 s GoTrue takes to answer (UX-DR13 — the countdown
  // blocks nothing). THAT answer is one the user has walked away from, so it must not clear
  // `different`: doing so snapped them back to S1b showing the abandoned address and threw away
  // whatever they had typed since — the owner's finding 2 arriving by the other door. `pending` is
  // already false in the render that carries the result, so the intent is recorded at the click
  // rather than read at the answer (review, 2026-09-05).
  const [walkedAway, setWalkedAway] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  // S1c: the whole card at 40% while the OS sheet is up, and nothing of the sheet drawn — it
  // is the operating system's window and not a surface of ours.
  const [passkeyPending, setPasskeyPending] = useState(false)
  const [left, setLeft] = useState(0)

  const sent = state.status === 'sent' && !different

  // The countdown's first value comes from the render that first sees a new action result, not
  // from the effect below: an effect runs AFTER paint, so the card would flash "Resend" as a live
  // link for one frame before the timer took over. This is React's own adjust-state-during-render
  // pattern — no extra render, and the effect keeps it ticking from there.
  const [seen, setSeen] = useState<SendState>(state)
  if (seen !== state) {
    setSeen(state)
    if (walkedAway) {
      // the answer to a send the user has already left; S1a stays exactly as they left it
      setWalkedAway(false)
    } else {
      setLeft(state.status === 'sent' ? state.retryAfter : 0)
      // A NEW RESULT IS THE ONLY THING THAT LEAVES "different" (finding 2). Clearing it on submit
      // instead put the previous send's card back — old address, old countdown — for the two
      // seconds GoTrue spends handing the mail to Resend, because `state` was still the old one.
      // Waiting for the result means S1a simply stays put with "Sending…" on the button, and S1b
      // arrives already showing the address that was actually sent to.
      setDifferent(false)
    }
  }

  useEffect(() => {
    // `different` as well as the status: on S1a there is no countdown on screen, and leaving the
    // interval running re-rendered the whole form once a second for the rest of the minute.
    if (state.status !== 'sent' || different) return
    // The action has just returned, so "now" is when the mail left. `state` is a new object per
    // send, so a resend restarts this effect and the countdown with it.
    const sentAt = Date.now()
    const tick = () => setLeft(secondsLeft(sentAt, state.retryAfter, Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state, different])

  // The same schema the action uses, so the sentence cannot differ — and no round trip for an
  // address that was never one. `preventDefault` stops React running the action.
  function guard(event: FormEvent<HTMLFormElement>) {
    // A second submit while the first is still in flight. The kit's `Button` cannot take
    // `disabled` by design (button.tsx:38 — the Kit draws no disabled full-size button) and
    // `useActionState` queues actions rather than dropping them, so the block belongs here.
    // GoTrue's per-address interval turned the duplicate into a harmless 429 and the sent card,
    // which is why nothing was visibly wrong — but it was a second round trip and a second send
    // attempt for one click (review, 2026-09-05).
    if (pending) {
      event.preventDefault()
      return
    }
    const value = new FormData(event.currentTarget).get('email')
    if (!parseEmail(value)) {
      event.preventDefault()
      setClientError(BAD_EMAIL)
      return
    }
    setClientError(null)
  }

  const fieldError =
    clientError ??
    (state.status === 'error' && state.error.code === 'bad_email' ? state.error.message : null)

  return (
    <form
      action={formAction}
      onSubmit={guard}
      noValidate
      // 440px, not the frame's 400: at 400 the content box is 328px and "Make something gorgeous."
      // measures 364px at 28px display, so the headline always took two lines. The owner amended
      // R-74 for this card on his test (finding 4); 440 is the smallest step that fits it on one
      // line with the frame's 36px padding untouched. At 390 the card is `width:100%` inside the
      // page's 24px padding — the frame's own shape — so mobile still wraps, as the frame draws it.
      aria-busy={passkeyPending || undefined}
      className={`relative z-10 flex w-full max-w-[440px] flex-col rounded-lg bg-surface shadow-lg ${
        sent ? 'items-center gap-5 p-[32px_24px] text-center tablet:p-[44px_36px]' : 'gap-[22px] p-[32px_24px] tablet:gap-6 tablet:p-[40px_36px]'
      } ${passkeyPending ? 'opacity-40' : ''}`}
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

          {/* S1b's words are true when a link really has just left. When GoTrue answers the
              per-address 429 NOTHING WAS SENT, and the owner met that by signing out and straight
              back in: the card said "Check your inbox" over a link he had just spent, so he
              waited for mail that could never arrive (his fourth test, finding 1). The 429 branch
              keeps the frame's shape — the same envelope, the same address in bold, the same
              countdown below — and changes only the two lines that would otherwise be false. The
              sparkle goes with them: nothing was sent, so there is nothing to celebrate. */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[26px] font-bold tracking-[-0.01em] tablet:text-[28px]">
              {state.throttled ? 'Just a moment' : 'Check your inbox ✨'}
            </h1>
            <p className="text-ui leading-[1.55] text-ink-soft">
              We sent a magic link to
              <br />
              <strong className="font-semibold text-ink">{state.email}</strong>
              <br />
              {state.throttled
                ? // "a moment ago" and not "less than a minute ago": the interval is
                  // `smtp_max_frequency` and the countdown beside this sentence is derived from
                  // it, so a written minute is a count that can go stale (standing rule 4).
                  'a moment ago, so we haven’t sent another. If it isn’t in your inbox — or you’ve already used it — ask again below.'
                : 'It’s good for 15 minutes.'}
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-2.5">
            {/* The countdown says when another may be asked for and nothing more: the link in
                the inbox is good for its own 15 minutes either way (UX-DR13).
                The number is a `timer`, which a screen reader does not re-read every second; the
                paragraph is polite, so the one change that matters — Resend becoming a link — is
                announced once. */}
            <p className="text-ui-dense text-ink-soft" aria-live="polite">
              Didn&rsquo;t get it?{' '}
              {/* `pending` first: a resend is only offered at 0:00, so the click has nothing to
                  count down and the line sat on "Resend" until the send returned (finding 3).
                  "Sending…" is the same word the button uses and it is true — the countdown
                  restarts from what GoTrue answers, which is the only honest number. */}
              {pending ? (
                'Sending…'
              ) : left > 0 ? (
                <>
                  Resend in{' '}
                  <span role="timer" aria-live="off" className="font-mono text-ui-dense text-ink">
                    {mmss(left)}
                  </span>
                </>
              ) : (
                <button type="submit" className={linkStyle}>
                  Resend
                </button>
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setDifferent(true)
                setWalkedAway(pending)
              }}
              className={linkStyle}
            >
              Use a different email
            </button>
          </div>
        </>
      ) : (
        <>
          {/* "There is no message … user has no idea whether they are actually signing out" — the
              owner's third test, finding 2, ruled at question 6 option 1: the row says it is
              working and this says it finished. Mint, `role="status"`, one sentence in S1's
              voice, in the Kit's own component. Only while the card is untouched: once a link
              has been asked for, the last thing that happened is the send, not the sign-out. */}
          {signedOut && state.status === 'idle' ? (
            <Banner kind="success">You&rsquo;ve been signed out.</Banner>
          ) : null}
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
              Sign in or create an account.
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
              // Leaving the field with a valid address takes the sentence away (finding 6). Only
              // the client's own error can be cleared here, and only it needs to be: the action
              // shares this schema, so a `bad_email` from the server means JS never ran — and
              // neither would this. Nothing is added on blur: an error while the address is still
              // half-typed is the reason the check waits for the submit in the first place.
              onBlur={(event) => {
                if (parseEmail(event.currentTarget.value)) setClientError(null)
              }}
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

            {/* S1a draws a passkey button and an "or" divider. Both are absent unless BOTH
                switches are on — our `feature_flags.passkeys` row and Supabase's own
                `passkeys_enabled` (`lib/flags.ts`, MEASUREMENTS §20) — because a control that
                could never act here is absent, not greyed (UX-DR3).
                Story 2.1 put the button inside this branch, where the divider had been waiting
                for it: an "or" rule over empty space was the one way flipping the flag could go
                wrong (review, 2026-09-05), and it can no longer happen — the pair is one
                condition. */}
            {passkeys ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-control-label text-ink-soft">or</span>
                  <div className="h-px flex-1 bg-line" />
                </div>
                <PasskeyButton onPending={setPasskeyPending} />
              </>
            ) : null}
          </div>
        </>
      )}
    </form>
  )
}
