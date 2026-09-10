'use client'

import { useState, useTransition, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/kit/button'
import { BusyLabel } from '@/components/kit/submit'
import { TextInput } from '@/components/kit/input'
import { isRedirect } from '@/lib/action-redirect'
import { CONNECT_MAX, connectMessage, KEYS } from '@/lib/connect-rule'
import { saveKeys } from './actions'
import { checkContentKey } from './content-check'

/* ────────────────────────────── THE ONE CLIENT ISLAND ON MANAGE KEYS, AND IT IS THIS SIZE ON
   PURPOSE. Everything else on the screen — the title pair, the read-only address, all three
   credential blocks' chrome, the Admin and token forms, Test connection — is server-rendered
   markup plus `<form action={serverAction}>` dispatches. What needs a browser is FR-C2's Content
   API key check, because that check IS the browser: the key is verified direct to the customer's
   Ghost over CORS, on the path the editor will use, and a server-side 200 would prove the wrong
   thing (no CORS, no mixed content, no browser). `connect-wizard.tsx` is the precedent and its
   comments are worth reading beside this file.

   `action={saveKeys}` STAYS ON THE FORM, and that is what makes this progressive rather than
   required: React emits `method="POST"`, an `action` attribute and its encoded `$ACTION_*` fields
   from that server-action reference, so a scripts-off browser posts natively and the key is stored
   unchecked — exactly as connect stores it with scripts off. `onSubmit` only ever runs where there
   is a script to run it.

   THE ACTION IS INVOKED DIRECTLY, NOT BY RE-SUBMITTING THE FORM. The wizard's own history is the
   argument: a `requestSubmit()` on a second pass fired inside the first submit event's own tick
   whenever the check returned without a real fetch, and React dispatched no action at all — a
   connect that silently did nothing, with the button still reading "Connect" (executed on the
   deployed site, Review 2, 2026-09-08). `startTransition` around the server action is React 19's
   own way to run one imperatively: one path, no re-entrancy, no timing.

   AND THE CONTROL SAYS IT IS WORKING THROUGH BOTH HALVES (R-98) — WITH `useFormStatus` PLAYING NO
   PART IN IT, which the review of 2026-09-09 had to correct twice over.

   `onSubmit` CALLS `preventDefault()` ON EVERY PATH THAT HAS A SCRIPT, so React never dispatches
   this form's action itself and `useFormStatus().pending` never turns true. That made the Kit's
   `useSubmitting()` actively harmful here rather than merely idle: its `guard` claims the
   in-flight slot on the first click, and its release — `if (!pending) inFlight.current = false`,
   keyed on `pending` — never re-runs, because `pending` never moved. The second click was
   `preventDefault`ed by the guard, so `onSubmit` never fired and the button did NOTHING, for
   good: the redirect back to this route is a soft navigation and the island is never remounted.
   That is verbatim the failure `components/kit/submit.tsx` records ("a ref left `true` makes the
   only control that can retry inert"), and `connect-wizard.tsx:315` — the precedent for this
   exact shape — uses a bare `<Button type="submit">` with no guard for the same reason. So does
   this. Re-entrancy is held by `checking || saving` at the top of `onSubmit` instead.

   AND THE ACTION'S PROMISE IS RETURNED, NOT DISCARDED. `start(() => { void saveKeys(data) })`
   returns `undefined`, and React 19.2.8 only holds a transition open — and only attaches its own
   rejection handling — when the scope callback RETURNS the thenable (`react.development.js`
   :1158-1167, read at the review). So `saving` fell in the same tick, the button dropped back to
   its resting label for the whole server round trip, and the `NEXT_REDIRECT` every one of these
   actions rejects with was an unhandled rejection. An async scope fixes both, and `isRedirect` is
   the predicate the repository already keeps for that rejection. */

export function ContentKeyForm({
  siteId,
  siteUrl,
  hint,
  error,
  chrome,
}: {
  siteId: string
  /** The standing line under the field, as the Admin row has — `KEYS.content.ask`. */
  hint: string
  /** The PUBLIC url — the address a browser can actually reach, which on Ghost(Pro) is not `sites.url`. */
  siteUrl: string
  /** The server's refusal for this field, read out of the URL by the panel. */
  error: string | null
  /** The panel's chrome marker (`KeysPanel`'s `popup`). `new FormData(form)` below picks it up
      with every other field, so the direct invocation and the scripts-off post carry it alike. */
  chrome: ReactNode
}) {
  const [typed, setTyped] = useState('')
  const [refused, setRefused] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [saving, start] = useTransition()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (checking || saving) return
    const data = new FormData(event.currentTarget)
    setRefused(null)
    setChecking(true)
    const verdict = await checkContentKey(siteUrl, String(data.get('content_key') ?? ''))
    setChecking(false)
    // Only Ghost saying "I do not know this key" is the customer's to fix here. Everything else —
    // a DNS failure, the ten seconds, a plain-http address the browser may not reach at all — lets
    // the submit through, so the SERVER's answer is what is read rather than a guess made here.
    if (verdict === 'unknown_key') {
      setRefused(connectMessage('content_key_unknown'))
      return
    }
    start(async () => {
      try {
        await saveKeys(data)
      } catch (thrown) {
        // The save worked and the redirect is already running: say nothing and stay busy until it
        // lands. Anything else is ours, and the field says so rather than the press dying quiet.
        if (isRedirect(thrown)) return
        setRefused(connectMessage('keys_failed'))
      }
    })
  }

  return (
    <form action={saveKeys} onSubmit={onSubmit} className="flex flex-col gap-[10px]">
      <input type="hidden" name="site_id" value={siteId} />
      {chrome}
      <TextInput
        id="keys-content"
        name="content_key"
        label={KEYS.content.paste}
        placeholder="8d41c0a97b…"
        maxLength={CONNECT_MAX}
        mono
        // CONTROLLED, because React 19 resets a form after every action — a refusal included — and
        // an uncontrolled field emptied itself on the very refusal the customer had to fix.
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        error={error ?? refused}
        hint={error ?? refused ? null : hint}
      />
      <div className="flex">
        <Save busy={checking || saving} />
      </div>
    </form>
  )
}

/** R-98's busy half, driven by THIS component's own state rather than by `useFormStatus` — see
    the header: the form's action is never dispatched by the form, so the Kit's `useSubmitting()`
    could only ever read false here, and its click guard could only ever jam.

    THE LABEL SWAP IS STILL THE KIT'S, though the pending flag is not: `BusyLabel` is what keeps
    **Save key** from resizing into **Saving…** mid-press (the owner's ask, 2026-09-10). This is
    the one submit control in the app that is not a `Submit`, so it is the one a fix made only in
    `Submit` would have missed. */
function Save({ busy }: { busy: boolean }) {
  return (
    <Button
      type="submit"
      variant="secondary"
      size={32}
      aria-disabled={busy || undefined}
      aria-busy={busy || undefined}
    >
      <BusyLabel pending={busy} busy={KEYS.content.busy}>
        {KEYS.content.save}
      </BusyLabel>
    </Button>
  )
}
