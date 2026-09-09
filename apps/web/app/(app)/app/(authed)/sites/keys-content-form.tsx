'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { Button } from '@/components/kit/button'
import { TextInput } from '@/components/kit/input'
import { useSubmitting } from '@/components/kit/submit'
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

   AND THE CONTROL SAYS IT IS WORKING THROUGH BOTH HALVES (R-98). `useFormStatus` cannot see the
   browser check — no form action is in flight during it, and it can take ten seconds — so the
   button ORs three things: the check, the transition that carries the server action, and the
   form's own status for the scripts-off-shaped path where React dispatches it itself. */

export function ContentKeyForm({
  siteId,
  siteUrl,
  error,
}: {
  siteId: string
  /** The PUBLIC url — the address a browser can actually reach, which on Ghost(Pro) is not `sites.url`. */
  siteUrl: string
  /** The server's refusal for this field, read out of the URL by the panel. */
  error: string | null
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
    start(() => {
      void saveKeys(data)
    })
  }

  return (
    <form action={saveKeys} onSubmit={onSubmit} className="flex flex-col gap-[10px]">
      <input type="hidden" name="site_id" value={siteId} />
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
      />
      <div className="flex">
        <Save busy={checking || saving} />
      </div>
    </form>
  )
}

/** `useSubmitting()` is the Kit's busy half for a control that is not a Kit `Submit` — and this
    one is not, because it has a second thing to be busy about. It must be a CHILD of the form. */
function Save({ busy }: { busy: boolean }) {
  const { pending, guard } = useSubmitting()
  const working = pending || busy
  return (
    <Button
      type="submit"
      variant="secondary"
      size={32}
      aria-disabled={working || undefined}
      aria-busy={working || undefined}
      onClick={guard}
    >
      {working ? KEYS.content.busy : KEYS.content.save}
    </Button>
  )
}
