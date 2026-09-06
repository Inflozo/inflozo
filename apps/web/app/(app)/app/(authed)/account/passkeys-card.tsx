'use client'

import { useEffect, useState } from 'react'
import { Laptop, Passkey } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { addedLabel, aaguidFromAuthData } from '@/lib/passkey-name'
import { browserSupportsWebAuthn, creationOptions, registrationResponse } from '../../sign-in/webauthn'
import { finishPasskeyRegistration, startPasskeyRegistration } from './actions'

/* S12 Billing.dc.html:83-104 — the Passkeys card's rows and its "Add a passkey".

   Rename and revoke are 2.2's and are ABSENT, not greyed (UX-DR3): the frame draws a pencil and
   a bin at the end of every row, and neither could act today.

   The button is drawn here from the tokens rather than from the Kit's `Button`, for the reason
   S1's email field is: the frame's height is 34px and the Kit's three are 44 / 36 / 32. Same
   border, same radius, same one ring — a size the Kit does not carry, not a second vocabulary
   (1.4's precedent, and the frame's own value read never rounded). */

/** One row. Named `PasskeyRow` because `Passkey` is the frame's glyph, imported above. */
export type PasskeyRow = { id: string; name: string; createdAt: string }

/** The matrix's own sentences. */
const ALREADY_HERE = 'This device already has a passkey for Inflozo.'
const NO_WEBAUTHN = "This browser can't use passkeys."

export function PasskeysCard({ passkeys }: { passkeys: PasskeyRow[] }) {
  const [caption, setCaption] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [supported, setSupported] = useState(true)
  useEffect(() => setSupported(browserSupportsWebAuthn()), [])

  async function add() {
    if (busy) return
    if (!supported) {
      setCaption(NO_WEBAUTHN)
      return
    }
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
      if ('error' in finished) setCaption(finished.error.message)
    } catch (error) {
      // `excludeCredentials` is the server's, so an authenticator that already holds one for
      // this account refuses with `InvalidStateError` — the OS says so too, and this names it.
      // A cancelled sheet says nothing at all; nothing happened.
      const name = (error as DOMException | undefined)?.name
      if (name === 'InvalidStateError') setCaption(ALREADY_HERE)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-[20px_24px] shadow-sm">
      <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">Passkeys</h2>

      {passkeys.length > 0 ? (
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
