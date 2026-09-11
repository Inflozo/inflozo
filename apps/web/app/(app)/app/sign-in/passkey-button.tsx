'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { Button } from '@/components/kit/button'
import { Passkey } from '@/components/kit/icons'
import { isRedirect } from '@/lib/action-redirect'
import { finishPasskeySignIn, startPasskeySignIn } from './actions'
import { authenticationResponse, browserSupportsWebAuthn, requestOptions } from './webauthn'

/* S1 Sign In.dc.html — S1a's second button, and S1c while the OS sheet is up.

   THE BROWSER'S ONLY JOB IS `navigator.credentials.get()`. The challenge comes from a server
   action and the assertion goes back to one; there is no Supabase client here and no key of any
   kind.

   WHERE THE SENTENCES GO, and the two are not the same slot (the owner's test of 2.2, finding 1).
   Everything a sign-in ATTEMPT answers — the OS sheet's "nothing here", a server action's error,
   an outright failure — goes UP to the card's own banner slot through `onError`, where it is the
   Kit's red error banner with its icon, in the place "You've been signed out." appears and
   replacing whatever was there. It read as an 11px grey caption under the button and the owner
   missed it. What stays here in P0-0's helper-caption slot is the ONE sentence that is not an
   attempt's answer: "This browser can't use passkeys." It is shown before anything is pressed,
   it explains the absence of the button it replaces, and a red alert on arrival for a page whose
   magic link works perfectly would be a lie about the seriousness of it.

   ponytail: a button, because S1a draws one. Conditional UI — the passkey offered inside the
   email field's own autofill — is the upgrade if the owner ever wants the button gone; it needs
   `mediation: 'conditional'` and an `autocomplete="username webauthn"` on the field, and nothing
   else here changes. */

/** The matrix's three. A cancelled sheet says nothing at all. The first two are the banner's. */
const NO_PASSKEY_HERE =
  'No passkey on this device yet — sign in with a magic link, then add one under Account settings.'
/** Anything that is neither the OS sheet's answer nor a server redirect: one honest sentence. */
const PASSKEY_FAILED = "We couldn't sign you in with a passkey. Use a magic link instead."
/** Not an attempt's answer: the reason the offer above it is missing. Stays a caption. */
const NO_WEBAUTHN = "This browser can't use passkeys."

export function PasskeyButton({
  onPending,
  onError,
}: {
  onPending: (pending: boolean) => void
  onError: (message: string | null) => void
}) {
  const [busy, setBusy] = useState(false)

  // `browserSupportsWebAuthn()` reads `window`, so it cannot run in the render the server
  // produces: it starts `true` and the client's first paint corrects it. A browser that cannot do
  // passkeys therefore loses THE WHOLE OFFER — the divider and the button both — and keeps only
  // the sentence saying why, with the magic link above untouched. That is the owner's ruling on
  // question 3 (2026-09-06), and it is his own standing rule: a control that could never act here
  // is ABSENT, not greyed (UX-DR3). It also ends the mismatch the review found, where the button
  // looked ordinary to the eye while `aria-disabled` told a screen reader it was unavailable.
  const [supported, setSupported] = useState(true)
  useEffect(() => {
    if (!browserSupportsWebAuthn()) setSupported(false)
  }, [])

  async function signIn(event: MouseEvent<HTMLButtonElement>) {
    const pressed = event.currentTarget
    let navigating = false
    if (busy) return
    // First, so that every path below — the unsupported one included — leaves no stale banner
    // from the attempt before it.
    onError(null)
    // ASKED AT THE CLICK, not read off state: `supported` is `true` for the one paint before the
    // effect above runs, so a press inside that instant would otherwise reach `navigator
    // .credentials` on a browser that has none and report the generic failure sentence instead of
    // the true reason. The sentence is the caption's, not the banner's — the offer is withdrawn
    // in the same breath, and the caption is what takes its place.
    if (!browserSupportsWebAuthn()) {
      setSupported(false)
      return
    }
    setBusy(true)
    onPending(true)
    try {
      const started = await startPasskeySignIn()
      if ('error' in started) {
        onError(started.error.message)
        return
      }

      const credential = (await navigator.credentials.get({
        publicKey: requestOptions(started.options),
      })) as PublicKeyCredential | null
      // A `get()` that resolves with nothing is not an error and not a credential; there is
      // nothing to send and nothing to say.
      if (!credential) return

      const finished = await finishPasskeySignIn({
        challengeId: started.challengeId,
        credential: authenticationResponse(credential),
      })
      // Success REDIRECTS from the server (which REJECTS, below), so a value here is a failure.
      if (finished && 'error' in finished) onError(finished.error.message)
    } catch (error) {
      // The sign-in worked and the dashboard is on its way: say nothing and stay at 40% until
      // it lands — `finally` must not restore the card for a navigation that is already running.
      if (isRedirect(error)) {
        navigating = true
        return
      }
      const name = error instanceof DOMException ? error.name : null
      // `AbortError` is a ceremony the user or the page called off — nothing happened, so
      // nothing is said. `NotAllowedError` is everything else the OS sheet can answer, and
      // WebAuthn deliberately does not split it into "you cancelled" and "there is nothing here"
      // — telling the two apart would tell a caller whether an account has a passkey. One
      // sentence covers both, and it names the way in that always works. Anything that is not
      // the sheet's answer at all — a `SecurityError` from an origin the RP does not list, a
      // `TypeError` from a malformed challenge — is a failure, and is logged by its name only.
      if (name === 'AbortError') return
      if (name === 'NotAllowedError') {
        onError(NO_PASSKEY_HERE)
        return
      }
      console.error('passkey: sign-in threw', { name: name ?? typeof error })
      onError(PASSKEY_FAILED)
    } finally {
      if (!navigating) {
        setBusy(false)
        onPending(false)
        // THE CARD WAS `inert` WHILE THE SHEET WAS UP (DW-37), which blurs whatever had focus and
        // restores nothing: a screen-reader user who cancelled the OS sheet was left on <body>,
        // with the error line un-hiding somewhere they were not. Focus goes back to the button
        // that started the ceremony, so the next Tab and the next announcement start from it
        // (review, 2026-09-11).
        pressed.focus()
      }
    }
  }

  // The offer, or the one sentence that replaces it — never both, and never neither.
  return supported ? (
    <>
      {/* S1a's "or" rule belongs to the button, not to the form: the two are ONE offer, so
          when the offer is withdrawn the rule goes with it. Held together here, a divider
          over empty space — the one way the spec says this can go wrong — cannot happen. */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-control-label text-ink-soft">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <Button
        variant="secondary"
        size={44}
        // The frame draws this one label at 500 (`S1 Sign In.dc.html:49`) where the Kit's
        // secondary is 600. It goes through the Kit's own `weight`, NOT through `className`:
        // passed as a class it lost to the Kit's `font-semibold` every time and the button
        // shipped at 600 — measured on the deployed site (review, 2026-09-06).
        weight="font-medium"
        className="w-full"
        onClick={signIn}
        aria-busy={busy || undefined}
      >
        {/* The frame's own 18px key. The Kit's secondary 44 is the vocabulary the surface is
            built from. */}
        <Passkey size={18} />
        {busy ? 'Waiting for your device…' : 'Sign in with a passkey'}
      </Button>
    </>
  ) : (
    // The sentence stays when the offer goes: it is the whole reason the offer is missing.
    <p role="status" className="text-helper-caption leading-[1.5] text-ink-soft">
      {NO_WEBAUTHN}
    </p>
  )
}
