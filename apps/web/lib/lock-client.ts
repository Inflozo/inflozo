import { lockPath } from './editor.ts'
import { TAB_SESSION_KEY, type LockAnswer } from './lock.ts'

/* THE LOCK'S I/O, IN ONE FILE (Story 5.17) — so the protocol cannot drift across call sites.
 *
 * IT IS ADDRESSED AT THE APP'S OWN ROUTE, NOT AT POSTGREST, and that is the one thing `MEASUREMENTS.md` §50 changed
 * about the plan: the browser holds no Supabase client and no key (`lib/supabase/server.ts` is the only place one is
 * made, and the session cookie is `httpOnly` precisely because there is none). The route runs under the caller's own
 * session, so the CAS, the guards and the grants the probe executed are unchanged — only the hop is.
 *
 * THREE TRANSPORT LAYERS WERE PLANNED AND TWO ARE BUILT (§AD2). `BroadcastChannel` is free and instant and covers
 * the case DW-203 is written about — two tabs of one browser; the heartbeat's own ~15 s round trip is the floor
 * underneath it, and it is what another device waits for. Supabase Realtime's middle layer is NOT built: a browser
 * cannot open that socket without a browser-side client and a script-readable session, and a private channel needs a
 * policy on `realtime.messages` — both architectural changes, put to the owner and ruled out of v1: **R-191** (owner,
 * 2026-09-24), "Leave it at about fifteen seconds." The matrix's "Realtime unreachable" row is therefore the SHIPPED
 * behaviour rather than a fallback.
 */

export type LockIntent = 'acquire' | 'beat' | 'nudge' | 'keep' | 'release' | 'takeover'

export type { LockAnswer }

export type LockCall = {
  intent: LockIntent
  session: string
  /** the generation the take-over compares against */
  generation?: number
  /** AD-16's count, carried by every beat and acquire: EDITS, never operations */
  unsynced?: number
}

/** THE LOCK ROUTE'S ADDRESS AS THE BROWSER MUST ASK FOR IT — `syncUrl()`'s rule, read from the same `isApp`, because
 *  on `app.inflozo.com` the proxy adds the `/app` prefix and on localhost the page itself carries it. */
export const lockUrl = (projectId: string, app: boolean) => `${app ? '/app' : ''}${lockPath(projectId)}`

/**
 * One call. `null` means the server was not reached at all — offline, a 5xx, a stall — and the caller's answer is
 * always the same: change no state and try again on the next beat. A lock that cannot be heard from is not a lock
 * that was lost.
 */
export async function askLock(url: string, call: LockCall, keepalive = false): Promise<LockAnswer | null> {
  try {
    const answer = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(call),
      // THE TAB MAY BE GOING: `keepalive` is the only thing the browser promises to finish, and the release rides it.
      keepalive,
      // a request that never answers must not wedge the heartbeat — the flush learned this on the deployed walk
      signal: AbortSignal.timeout(10_000),
    })
    if (!answer.ok) return null
    return (await answer.json()) as LockAnswer
  } catch {
    return null
  }
}

/* ───────────────────────────── layer 1: the same browser, free and instant ───────────────────────────── */

/** What one session tells the others. Nothing carries state: a signal only says "read the row now", so a message
 *  that arrives late or twice costs one request and can never move the protocol on its own. */
export type LockSignal = 'nudge' | 'answered' | 'released' | 'took-over'

/**
 * A `BroadcastChannel` per project. Returns the way to send, and the way to stop — or a pair of no-ops where the
 * browser has no `BroadcastChannel`, in which case everything still works on the heartbeat floor and NOTHING about
 * the transport is shown to the user.
 */
export function lockSignals(projectId: string, heard: (signal: LockSignal) => void) {
  if (typeof BroadcastChannel === 'undefined') return { send: () => {}, stop: () => {} }
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel(`inflozo-lock-${projectId}`)
  } catch {
    return { send: () => {}, stop: () => {} }
  }
  const open = channel
  open.onmessage = (event: MessageEvent<unknown>) => {
    const signal = event.data
    if (signal === 'nudge' || signal === 'answered' || signal === 'released' || signal === 'took-over') heard(signal)
  }
  return {
    send: (signal: LockSignal) => {
      try {
        open.postMessage(signal)
      } catch {
        // a closed channel is a transport that is gone, which the heartbeat floor already covers
      }
    },
    stop: () => {
      open.onmessage = null
      open.close()
    },
  }
}

/* ───────────────────────────── this tab's identity ─────────────────────────────
 *
 * PER TAB AND ACROSS A RELOAD, which is exactly `sessionStorage`'s own lifetime: a reload must keep the lock it
 * holds rather than orphan it for ~60 s, and a second TAB must never share it — that second tab IS the other
 * editing context this whole story is about. `localStorage` would be shared by every tab of the browser and is
 * therefore the one wrong answer.
 *
 * It can throw or come back empty in a private window or with site data blocked, so both ends are wrapped and a
 * failure simply means a fresh id per load: the protocol still works, a reload just re-acquires.
 */
const SESSION_KEY = TAB_SESSION_KEY

export function tabSession(): string {
  try {
    const held = sessionStorage.getItem(SESSION_KEY)
    if (held) return held
    const made = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, made)
    return made
  } catch {
    return crypto.randomUUID()
  }
}
