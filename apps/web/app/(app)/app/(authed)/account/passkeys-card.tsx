'use client'

import { useEffect, useState } from 'react'
import { Laptop, Passkey } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { addedLabel, aaguidFromAuthData, type PasskeyRow } from '@/lib/passkey-name'
import { browserSupportsWebAuthn, creationOptions, registrationResponse } from '../../sign-in/webauthn'
import { finishPasskeyRegistration, startPasskeyRegistration } from './actions'

/* S12 Billing.dc.html:83-104 — the Passkeys card's rows and its "Add a passkey".

   Rename and revoke are 2.2's and are ABSENT, not greyed (UX-DR3): the frame draws a pencil and
   a bin at the end of every row, and neither could act today.

   The button is drawn here from the tokens rather than from the Kit's `Button`, for the reason
   S1's email field is: the frame's height is 34px and the Kit's three are 44 / 36 / 32. Same
   border, same radius, same one ring — a size the Kit does not carry, not a second vocabulary
   (1.4's precedent, and the frame's own value read never rounded). */

export type { PasskeyRow }

/** The matrix's own sentences. */
const ALREADY_HERE = 'This device already has a passkey for Inflozo.'
const NO_WEBAUTHN = "This browser can't use passkeys."
const ADD_FAILED = "We couldn't add that passkey just now. Try again in a moment."
/** The list could not be read: the card must not claim there are none (review, 2026-09-06). */
const LIST_FAILED = "We couldn't load your passkeys just now. Refresh to try again."

/** A redirecting server action REJECTS the awaited call — see `passkey-button.tsx`. */
const isRedirect = (error: unknown) =>
  typeof (error as { digest?: unknown })?.digest === 'string' &&
  (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')

/** `passkeys` is `null` when the list could not be read — an empty card would be a lie. */
export function PasskeysCard({ passkeys }: { passkeys: PasskeyRow[] | null }) {
  const [caption, setCaption] = useState<string | null>(passkeys ? null : LIST_FAILED)
  const [busy, setBusy] = useState(false)
  const [supported, setSupported] = useState(true)
  // Up front, in the caption slot: a greyed control shows its reason (UX-DR3).
  useEffect(() => {
    if (browserSupportsWebAuthn()) return
    setSupported(false)
    setCaption(NO_WEBAUTHN)
  }, [])

  async function add() {
    if (busy || !supported) return
    setCaption(null)
    setBusy(true)
    try {
      const started = await startPasskeyRegistration()
      if ('error' in started) {
        setCaption(started.error.message)
        return
      }

      const credential = (await navigator.credentials.create({
        publicKey: creationOptions(started.options),
      })) as PublicKeyCredential | null
      if (!credential) return

      // The AAGUID is inside the attestation and the browser hands the same bytes back here, so
      // no CBOR parser is needed. A browser without the Level-2 method gives `null`, which
      // `nameFor` answers with `Passkey` on the server.
      const response = credential.response as AuthenticatorAttestationResponse
      const authData =
        typeof response.getAuthenticatorData === 'function'
          ? new Uint8Array(response.getAuthenticatorData())
          : null

      const finished = await finishPasskeyRegistration({
        challengeId: started.challengeId,
        credential: registrationResponse(credential),
        aaguid: aaguidFromAuthData(authData),
      })
      // On success the action revalidates and the new row arrives with the re-rendered tree;
      // there is nothing to say and nothing to set.
      if (finished && 'error' in finished) setCaption(finished.error.message)
    } catch (error) {
      // The session ended and the action sent us to sign in: the navigation is running.
      if (isRedirect(error)) return
      const name = error instanceof DOMException ? error.name : null
      // `excludeCredentials` is the server's, so an authenticator that already holds one for
      // this account refuses with `InvalidStateError` — the OS says so too, and this names it.
      // A cancelled sheet (`NotAllowedError`, `AbortError`) says nothing at all; nothing
      // happened. Anything else is a failure the user must hear about, logged by its name only.
      if (name === 'InvalidStateError') {
        setCaption(ALREADY_HERE)
        return
      }
      if (name === 'NotAllowedError' || name === 'AbortError') return
      console.error('passkey: add threw', { name: name ?? typeof error })
      setCaption(ADD_FAILED)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-[20px_24px] shadow-sm">
      <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">Passkeys</h2>

      {passkeys && passkeys.length > 0 ? (
        <ul className="flex flex-col gap-[2px]">
          {passkeys.map((passkey) => (
            <li
              key={passkey.id}
              className="flex items-center gap-3 border-b border-line-soft py-[9px]"
            >
              <span className="shrink-0 text-ink-soft">
                <Laptop size={16} />
              </span>
              <span className="flex min-w-0 flex-col gap-px">
                <span className="truncate text-ui-dense font-medium text-ink">{passkey.name}</span>
                <span className="font-mono text-helper-caption text-ink-soft">
                  {addedLabel(passkey.createdAt)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={add}
        aria-busy={busy || undefined}
        aria-disabled={!supported || undefined}
        aria-describedby={caption ? 'passkeys-caption' : undefined}
        className={`inline-flex h-[34px] items-center gap-2 self-start rounded border border-line bg-surface px-[15px] text-ui-dense font-medium text-ink transition-colors hover:bg-paper ${ring}`}
      >
        <Passkey size={14} />
        {busy ? 'Waiting for your device…' : 'Add a passkey'}
      </button>

      {caption ? (
        // P0-0's helper-caption slot: one sentence, under the control, never a tooltip.
        <p id="passkeys-caption" role="status" className="text-helper-caption leading-[1.5] text-ink-soft">
          {caption}
        </p>
      ) : null}
    </section>
  )
}
