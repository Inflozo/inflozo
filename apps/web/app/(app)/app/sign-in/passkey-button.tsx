'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/kit/button'
import { Passkey } from '@/components/kit/icons'
import { finishPasskeySignIn, startPasskeySignIn } from './actions'
import { authenticationResponse, browserSupportsWebAuthn, requestOptions } from './webauthn'

/* S1 Sign In.dc.html — S1a's second button, and S1c while the OS sheet is up.

   THE BROWSER'S ONLY JOB IS `navigator.credentials.get()`. The challenge comes from a server
   action and the assertion goes back to one; there is no Supabase client here and no key of any
   kind. The three sentences below are the matrix's, in P0-0's helper-caption slot under the
   button — never a toast, never a dialog.

   ponytail: a button, because S1a draws one. Conditional UI — the passkey offered inside the
   email field's own autofill — is the upgrade if the owner ever wants the button gone; it needs
   `mediation: 'conditional'` and an `autocomplete="username webauthn"` on the field, and nothing
   else here changes. */

type Caption = string | null

/** The matrix's three, verbatim. A cancelled sheet says nothing at all. */
const NO_PASSKEY_HERE =
  'No passkey on this device yet — sign in with a magic link, then add one under Account settings.'
const NO_WEBAUTHN = "This browser can't use passkeys."

export function PasskeyButton({ onPending }: { onPending: (pending: boolean) => void }) {
  const [caption, setCaption] = useState<Caption>(null)
  const [busy, setBusy] = useState(false)

  // `browserSupportsWebAuthn()` reads `window`, so it cannot run in the render that the server
  // produces: the button is drawn either way and the sentence arrives on the client's first
  // paint. Nothing is hidden — a browser without WebAuthn still has the magic link above.
  const [supported, setSupported] = useState(true)
  useEffect(() => setSupported(browserSupportsWebAuthn()), [])

  async function signIn() {
    if (busy) return
    if (!supported) {
      setCaption(NO_WEBAUTHN)
      return
    }
    setCaption(null)
    setBusy(true)
    onPending(true)
    try {
      const started = await startPasskeySignIn()
      if ('error' in started) {
        setCaption(started.error.message)
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
      // Success REDIRECTS from the server, so reaching here at all means it failed.
      setCaption(finished.error.message)
    } catch (error) {
      // `AbortError` is a ceremony the user or the page called off — nothing happened, so
      // nothing is said. Everything else that comes out of the OS sheet is `NotAllowedError`,
      // which WebAuthn deliberately does not split into "you cancelled" and "there is nothing
      // here" — telling the two apart would tell a caller whether an account has a passkey. One
      // sentence covers both, and it names the way in that always works.
      const name = (error as DOMException | undefined)?.name
      if (name !== 'AbortError') setCaption(NO_PASSKEY_HERE)
    } finally {
      setBusy(false)
      onPending(false)
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size={44}
        className="w-full"
        onClick={signIn}
        aria-describedby={caption ? 'passkey-caption' : undefined}
      >
        {/* The frame's own 18px key. The Kit's secondary 44 is the vocabulary the surface is
            built from; the frame draws this one label at weight 500 where the Kit's is 600,
            which is one step inside the same component and not a second button. */}
        <Passkey size={18} />
        {busy ? 'Waiting for your device…' : 'Sign in with a passkey'}
      </Button>
      {caption ? (
        <p id="passkey-caption" role="status" className="text-helper-caption leading-[1.5] text-ink-soft">
          {caption}
        </p>
      ) : null}
    </>
  )
}
