'use client'

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { Laptop, Passkey, Pencil, Trash } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { TextInput } from '@/components/kit/input'
import { isRedirect } from '@/lib/action-redirect'
import { addedLabel, aaguidFromAuthData, type PasskeyRow } from '@/lib/passkey-name'
import { browserSupportsWebAuthn, creationOptions, registrationResponse } from '../../sign-in/webauthn'
import {
  finishPasskeyRegistration,
  renamePasskey,
  revokePasskey,
  startPasskeyRegistration,
  type ActionResult,
} from './actions'
import { PASSKEY_NAME_HINT, PASSKEY_NAME_MAX } from './passkey-name-rule'

/* S12 Billing.dc.html:83-104 — the Passkeys card: its rows, the pencil and the bin at the end of
   every row, and its "Add a passkey".

   THE TRAILING PAIR IS THE FRAME'S OWN (`:90-91`), read and never rounded: a 28×28 box at radius
   8 with a 13px glyph, the pencil in ink-soft over a `paper` hover, the bin in danger over a
   `danger-tint` hover. They are `<button>`s and the frame's `<div title="…">`s are not, because
   the frame draws a look and the product owes a keyboard and a name — the aria-label carries the
   passkey's own name, so a row of identical pencils is still N distinct controls to a screen
   reader.

   THE TWO DIALOGS ARE ONE PAIR FOR THE WHOLE CARD, not one pair per row: the card holds the row
   whose button was pressed and both dialogs read it. N rows would otherwise put 2N modals in the
   DOM to show one. `project-menu.tsx` is one card with one pair; this is the same shape at the
   card's altitude.

   NEITHER DIALOG HAS A FRAME. Both are extrapolated from where the project menu's were — S12c
   through `components/kit/dialog.ts`, which is now where the sheet, the title and the
   focus-on-Cancel live so the two cards cannot drift apart (R-74). The confirm is untyped: a
   typed confirm is reserved for account and project delete (EXPERIENCE.md), and a revoked passkey
   can be added again.

   The "Add a passkey" button is drawn here from the tokens rather than from the Kit's `Button`,
   for the reason S1's email field is: the frame's height is 34px and the Kit's three are 44 / 36
   / 32. Same border, same radius, same one ring — a size the Kit does not carry, not a second
   vocabulary (1.4's precedent, and the frame's own value read never rounded). */

export type { PasskeyRow }

/** The matrix's own sentences. */
const ALREADY_HERE = 'This device already has a passkey for Inflozo.'
const NO_WEBAUTHN = "This browser can't use passkeys."
const ADD_FAILED = "We couldn't add that passkey just now. Try again in a moment."
/** The list could not be read: the card must not claim there are none (review, 2026-09-06). */
const LIST_FAILED = "We couldn't load your passkeys just now. Refresh to try again."

/** The 28×28 icon box the frame draws at the end of every row (`S12 Billing.dc.html:90-91`). */
const rowButton = `inline-flex size-7 shrink-0 items-center justify-center rounded-sm transition-colors ${ring}`

/** `passkeys` is `null` when the list could not be read — an empty card would be a lie. */
export function PasskeysCard({ passkeys }: { passkeys: PasskeyRow[] | null }) {
  const [caption, setCaption] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // A browser that cannot do passkeys loses the "Add a passkey" control entirely and keeps only
  // the sentence — the owner's ruling on the sign-in button (question 3, 2026-09-06), applied to
  // its sibling because it is the same control on the same browser and leaving one of the two
  // greyed would be the same defect, half fixed (standing rule 3). Any passkeys already listed
  // above stay listed: they are real, and this browser simply cannot add another.
  const [supported, setSupported] = useState(true)
  useEffect(() => {
    if (browserSupportsWebAuthn()) return
    setSupported(false)
    setCaption(NO_WEBAUTHN)
  }, [])

  // DERIVED, not seeded into state: a later render whose list read failed must say so too. As
  // initial state it was set once and a failed re-read then drew an empty card claiming the user
  // has no passkeys — the exact lie the previous review patched, coming back on the second render
  // (review, 2026-09-06). Whatever the ceremony has to say wins while it is saying it.
  const shown = caption ?? (passkeys ? null : LIST_FAILED)

  // ── Rename and revoke. The row whose button was pressed, and the two dialogs that read it.
  const rename = useRef<HTMLDialogElement>(null)
  const revoke = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState<PasskeyRow | null>(null)

  const [renamed, renameAction, renaming] = useActionState<ActionResult | null, FormData>(
    renamePasskey,
    null,
  )
  const [revoked, revokeAction, revoking] = useActionState<ActionResult | null, FormData>(
    revokePasskey,
    null,
  )

  // THE SAME DOUBLE SUBMIT `project-menu.tsx:130-143` guards, and per component because the ref
  // closes over THIS card's two pending flags. React queues form actions and `pending` only turns
  // true on the NEXT render, so a held Enter or a double click sends a second Rename that races
  // the first, or a second Remove whose "We couldn't remove that…" arrives about a row already
  // gone. `onSubmit` and not a wrapper around the action, so the action stays a plain Server
  // Function reference and React's own dispatch handles it (`project-menu.tsx`'s shape).
  const submitting = useRef(false)
  useEffect(() => {
    if (!renaming && !revoking) submitting.current = false
  }, [renaming, revoking])
  const once = (event: { preventDefault: () => void }) => {
    if (submitting.current) {
      event.preventDefault()
      return
    }
    submitting.current = true
  }

  // A result the dialog was CLOSED on is spent: reopened, it starts clean rather than with the
  // last attempt's sentence still on screen. Identity is enough — every call returns a new object.
  const [renamedSeen, setRenamedSeen] = useState<ActionResult | null>(null)
  const [revokedSeen, setRevokedSeen] = useState<ActionResult | null>(null)

  // A dialog closes when its action succeeded, and stays open with its sentence when it did not.
  // Nothing here edits the list: both actions revalidate `/app/account` and the row renames or
  // leaves with the re-rendered tree. A failure that lands on a dialog ALREADY CLOSED — a backdrop
  // click while "Saving…" — is spent on arrival, or the next open, for another row, would have
  // shown it (second review, 2026-09-07).
  useEffect(() => {
    if (!renamed) return
    if ('ok' in renamed) rename.current?.close()
    else if (!rename.current?.open) setRenamedSeen(renamed)
  }, [renamed])
  useEffect(() => {
    if (!revoked) return
    if ('ok' in revoked) revoke.current?.close()
    else if (!revoke.current?.open) setRevokedSeen(revoked)
  }, [revoked])

  // The matrix says an empty name sends NOTHING, so emptiness is asked at the submit with the
  // action's own sentence — `sign-in-form.tsx`'s `guard()` shape. ONLY emptiness: the ceiling is
  // the server's on purpose, because the harness's control sets 121 characters past `maxLength`
  // and must reach the action to prove ITS refusal; a client check on length would have made that
  // control pass for the wrong reason (standing rule 2).
  const [clientNameError, setClientNameError] = useState<string | null>(null)
  const guardRename = (event: FormEvent<HTMLFormElement>) => {
    if (String(new FormData(event.currentTarget).get('name') ?? '').trim() === '') {
      event.preventDefault()
      setClientNameError(PASSKEY_NAME_HINT)
      return
    }
    setClientNameError(null)
    once(event)
  }

  const renameError = renamed !== renamedSeen && renamed && 'error' in renamed ? renamed.error : null
  // The field's own refusal goes in the field's helper-caption slot; anything else is a Banner
  // above the form (`project-menu.tsx`'s split, which a review had to add there).
  const nameError = clientNameError ?? (renameError?.code === 'bad_name' ? renameError.message : null)
  const renameFailed = renameError && renameError.code !== 'bad_name' ? renameError.message : null
  const revokeFailed = revoked !== revokedSeen && revoked && 'error' in revoked ? revoked.error.message : null

  async function add() {
    let navigating = false
    if (busy) return
    // Asked at the click: `supported` is `true` for the one paint before the effect runs, and a
    // press inside that instant would otherwise reach `navigator.credentials` and report the
    // generic failure instead of the true reason.
    if (!browserSupportsWebAuthn()) {
      setSupported(false)
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
      if (finished && 'error' in finished) setCaption(finished.error.message)
    } catch (error) {
      // The session ended and the action sent us to sign in: the navigation is running, so
      // `finally` must not put the button back to "Add a passkey" and invite a second press
      // mid-navigation — `passkey-button.tsx`'s own guard, which this file lacked (review,
      // 2026-09-06).
      if (isRedirect(error)) {
        navigating = true
        return
      }
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
      if (!navigating) setBusy(false)
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
              {/* The frame's trailing pair (`:90-91`). The state is set and the dialog opened in
                  the one handler: the click is a discrete event, so React flushes this render
                  before the browser paints the open dialog, and `openOnCancel` finds the same
                  Cancel button either way.

                  BOTH LABELS CARRY THE DATE (DW-36, Story 3.9). Two passkeys born with the same
                  fallback name gave a screen-reader user four buttons reading "Rename Passkey",
                  "Remove Passkey", "Rename Passkey", "Remove Passkey" — nothing in the accessible
                  name said WHICH, and the date is the one thing on the row that already tells them
                  apart on screen. It is the same `addedLabel` the row draws, so the two cannot
                  disagree. `run-verify-passkeys.py` locates rows by the exact label and changed in
                  the same commit; it is the one change that breaks that harness. */}
              <span className="ml-auto flex gap-[2px]">
                <button
                  type="button"
                  aria-label={`Rename ${passkey.name}, ${addedLabel(passkey.createdAt)}`}
                  onClick={() => {
                    setSelected(passkey)
                    openOnCancel(rename.current)
                  }}
                  className={`${rowButton} text-ink-soft hover:bg-paper`}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${passkey.name}, ${addedLabel(passkey.createdAt)}`}
                  onClick={() => {
                    setSelected(passkey)
                    openOnCancel(revoke.current)
                  }}
                  className={`${rowButton} text-danger hover:bg-danger-tint`}
                >
                  <Trash size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {supported ? (
        <button
          type="button"
          onClick={add}
          aria-busy={busy || undefined}
          aria-describedby={shown ? 'passkeys-caption' : undefined}
          className={`inline-flex h-[34px] items-center gap-2 self-start rounded border border-line bg-surface px-[15px] text-ui-dense font-medium text-ink transition-colors hover:bg-paper ${ring}`}
        >
          <Passkey size={14} />
          {busy ? 'Waiting for your device…' : 'Add a passkey'}
        </button>
      ) : null}

      {shown ? (
        // P0-0's helper-caption slot: one sentence, under the control, never a tooltip.
        <p id="passkeys-caption" role="status" className="text-helper-caption leading-[1.5] text-ink-soft">
          {shown}
        </p>
      ) : null}

      {/* ── Rename. One field, right-aligned Cancel + primary, as every other form in the app. */}
      <dialog
        ref={rename}
        aria-labelledby="rename-passkey-title"
        onClick={closeOnBackdrop}
        onClose={(event) => {
          setRenamedSeen(renamed)
          setClientNameError(null)
          // The field is uncontrolled, so a refused or abandoned edit stayed in it. `reset()`
          // restores `defaultValue` AND clears the dirty flag, which is what lets the next row's
          // name reach the field at all — one dialog serves every row (`project-menu.tsx`, whose
          // per-card dialog needed this for the same-row case alone).
          event.currentTarget.querySelector('form')?.reset()
        }}
        className={`${sheet} gap-[18px]`}
      >
        <h2 id="rename-passkey-title" className={title}>
          Rename passkey
        </h2>
        {renameFailed ? <Banner kind="error">{renameFailed}</Banner> : null}
        <form action={renameAction} onSubmit={guardRename} className="flex flex-col gap-[18px]">
          <input type="hidden" name="id" value={selected?.id ?? ''} />
          {/* `maxLength` is the schema's own number, so the 121st character cannot be typed or
              pasted and the matrix's "nothing sent" is true of it natively — the sentence still
              belongs to the server, which never trusts the field. */}
          <TextInput
            id="rename-passkey"
            name="name"
            label="Name"
            defaultValue={selected?.name ?? ''}
            maxLength={PASSKEY_NAME_MAX}
            error={nameError}
          />
          <div className="flex justify-end gap-[10px]">
            <Button type="button" variant="secondary" size={36} data-cancel onClick={() => rename.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size={36}>
              {renaming ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </dialog>

      {/* ── Revoke, S12c's shape as the owner centred it: the disc above, the title and sentence
          under it, two equal halves at 44. UNTYPED — a typed confirm is account and project
          delete only, and this one can be undone by adding the passkey again. */}
      <dialog
        ref={revoke}
        aria-labelledby="revoke-passkey-title"
        onClick={closeOnBackdrop}
        onClose={() => setRevokedSeen(revoked)}
        className={`${sheet} gap-5`}
      >
        <div className="flex flex-col items-center gap-[14px] text-center">
          <span
            aria-hidden
            className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger ring-8 ring-danger-tint/50"
          >
            <Trash size={22} strokeWidth={1.7} />
          </span>
          <div className="flex min-w-0 flex-col gap-[6px]">
            <h2 id="revoke-passkey-title" className={title}>
              Remove this passkey?
            </h2>
            <p className="text-ui-dense leading-[1.5] text-ink-soft wrap-anywhere">
              <span className="font-medium text-ink">{selected?.name}</span> will no longer sign you
              in on that device. You can add it again later.
            </p>
          </div>
        </div>

        {revokeFailed ? <Banner kind="error">{revokeFailed}</Banner> : null}

        <form action={revokeAction} onSubmit={once} className="grid grid-cols-2 gap-[10px]">
          <input type="hidden" name="id" value={selected?.id ?? ''} />
          {/* Cancel is first and holds the focus: this cuts a device off (EXPERIENCE.md
              § Destructive confirms), and at 390 both are a full-width tap target. */}
          <Button
            type="button"
            variant="secondary"
            size={44}
            data-cancel
            className="w-full"
            onClick={() => revoke.current?.close()}
          >
            Cancel
          </Button>
          <Button type="submit" variant="danger" size={44} className="w-full">
            {revoking ? 'Removing…' : 'Remove passkey'}
          </Button>
        </form>
      </dialog>
    </section>
  )
}
