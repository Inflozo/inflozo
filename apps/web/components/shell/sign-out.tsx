'use client'

import { useRef, useState } from 'react'
import { LockTakeover } from '@/components/editor/lock-takeover'
import { openOnCancel } from '@/components/kit/dialog'
import { Submit } from '@/components/kit/submit'
import { isRedirect } from '@/lib/action-redirect'
import { syncPath } from '@/lib/editor'
import { SENT_CHANNEL, SIGN_OUT_COPY, sendBody, sentBy, sentMessage, signOutFlow, SYNC_TIMEOUT_MS, type OwedRecord } from '@/lib/journal'
import { erase, owedRecords } from '@/lib/local-store'
import { isApp } from '@/routing'
import { signOut } from '@/app/(app)/app/sign-in/actions'

/* ───────────────────────────────────────── R-214 (owner, 2026-09-28) — SIGNING OUT SENDS, THEN ERASES (Story 5.24e).

   EVERY SIGN-OUT DOOR IS ONE FLOW: the account menu's Sign out, the restore page's and Sign out everywhere each hand their
   own server action to `run`, and `signOutFlow` (`lib/journal.ts`, where `journal.test.ts` holds the order) sends what
   this browser still owes, erases this browser's copy and only then signs out. When something cannot be sent it ASKS
   FIRST, in B5c's shape extrapolated (R-74): "Sign out with unsent work?", the edits that would be lost, and focus on
   **Wait** (`openOnCancel`, R-115). Wait, Escape and the backdrop all keep everything and sign nothing out.

   THE CONFIRM SAYS IT IS WORKING (R-98): **Sign out anyway** reads "Signing out…" and is `aria-disabled` + `aria-busy`
   from the press until the sign-out lands — LockTakeover's own busy label, the one its Take over already wears. */

/** One owed record, sent exactly as the editor's flush sends it, at the same address by the same rule (`syncUrl`) — but
 *  WITHOUT a lock session (`journal.ts`'s routine call 3): the revision compare-and-set guards it, a 409 is "cannot
 *  send", and a record the server already holds answers 200. The body and the answer's meaning are `lib/journal.ts`'s
 *  (`sendBody`, `sentBy`), where `journal.test.ts` holds them. A 200 is TOLD to this browser's open editor of the
 *  project (`sentMessage`), which takes it as its own flush's — or its next edit would carry the base this send moved. */
const send = async (record: OwedRecord): Promise<boolean> => {
  let status: number | null = null
  let answer: Response | null = null
  try {
    answer = await fetch(`${isApp(location.pathname) ? '/app' : ''}${syncPath(record.projectId)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: sendBody(record),
      signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
    })
    status = answer.status
  } catch {
    // no answer at all: `sentBy(null)`
  }
  if (!sentBy(status) || answer === null) return false
  const done = (await answer.json().catch(() => null)) as { revision?: unknown } | null
  if (typeof done?.revision === 'number') {
    try {
      const open = new BroadcastChannel(SENT_CHANNEL(record.projectId))
      open.postMessage(sentMessage(record, { revision: done.revision }))
      open.close()
    } catch {
      // no BroadcastChannel: an open editor then meets the conflict dialog it would have met before, and nothing is lost
    }
  }
  return true
}

/** The flow, and the ask it may need, for one sign-out door. `id` prefixes the ask's element ids — the account menu is
 *  drawn twice. `userId` null (no signed-in user known here) skips straight to the sign-out. */
export function useSignOut(userId: string | null, id: string) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [edits, setEdits] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const answer = useRef<((go: boolean) => void) | null>(null)
  const settle = (go: boolean) => {
    const waiting = answer.current
    answer.current = null
    waiting?.(go)
  }
  const ask = (n: number) =>
    new Promise<boolean>((resolve) => {
      answer.current = resolve
      setEdits(n)
      setLeaving(false)
      requestAnimationFrame(() => openOnCancel(dialog.current))
    })
  /** Wait, or a sign-out that answered instead of leaving: the ask goes, and its confirm is pressable again */
  const reset = () => {
    setLeaving(false)
    if (dialog.current?.open) dialog.current.close()
  }
  /** The whole of R-214 behind one door. A redirect out of the sign-out IS its success, so it is never an error here, and
   *  "Signing out…" stays up until the page goes; a sign-out that answers instead (Sign out everywhere's one failure)
   *  leaves the ask closed and pressable again. */
  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    try {
      const went = userId === null
        ? (await action(), true)
        : await signOutFlow({ owed: () => owedRecords(userId), send, erase: () => erase(userId), signOut: action, ask })
      reset()
      return went
    } catch (error) {
      if (isRedirect(error)) return true
      reset()
      throw error
    }
  }
  const asking = (
    <LockTakeover
      dialog={dialog}
      id={id}
      heading={SIGN_OUT_COPY.heading}
      owed={edits}
      loss={SIGN_OUT_COPY.erases}
      confirm={SIGN_OUT_COPY.confirm}
      confirmBusy={SIGN_OUT_COPY.confirmBusy}
      taking={leaving}
      onConfirm={() => {
        setLeaving(true)
        settle(true)
      }}
      onClose={() => settle(false)}
    />
  )
  return { run, asking }
}

/** The restore page's Sign out — a server page, so its form is this client door: the Kit's `Submit`, the flow, the ask. */
export function SignOutForm({ userId }: { userId: string }) {
  const { run, asking } = useSignOut(userId, 'restore-sign-out')
  return (
    <>
      <form
        action={async () => {
          await run(signOut)
        }}
        className="flex justify-center"
      >
        <Submit busy="Signing out…" variant="secondary" size={36}>
          Sign out
        </Submit>
      </form>
      {asking}
    </>
  )
}
