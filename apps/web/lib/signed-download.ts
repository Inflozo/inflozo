import { BACKUP_WORDS } from './deploy.ts'

/**
 * STORY 7.23b (DW-391) — ONE WAY TO FOLLOW A SIGNED DOWNLOAD. Four Downloads in the editor are a 60-second signed URL minted by a
 * route (AD-13): the Backup step's Theme Download and History's original-theme row (`snapshots/[id]/download`, Story 2.5's), D3a's
 * "Download the live theme first" (`projects/[id]/deploy/live`) and the Roll back confirm's (`projects/[id]/history/live`). A plain
 * link followed to such a route REPLACES THE EDITOR with the route's bare answer whenever it is not the zip — a 404 when the row or
 * object has gone, a 502 when signing fails, the sign-in page when the session ended.
 *
 * BY `Accept`, NOT `redirect: 'manual'`: a manual fetch sees an opaque redirect for the signed URL and the sign-in 303 alike, so it
 * cannot tell them apart. Asked with `Accept: application/json`, each route answers `200 { url }` — the same signed URL — or `401`
 * signed out (`signedAnswer`, `signInAnswer`); asked as a link, exactly as before, a 303, which `/restore`'s plain links, a form with
 * scripts off and a middle-click still follow.
 *
 * `followSigned(href)` fetches that answer and clicks a link to `url`: the signed URL is an ATTACHMENT (the route names its
 * `download`), so the page stays. It answers null, or ONE of three sentences (R-170, one list): gone (404), signed out (401, or a
 * fetch redirected to `/sign-in`), or couldn't prepare it (anything else — a 502, the network, an answer that is not one), each
 * logged by status. The caller says it under that button in a `role="status"` line, and "Preparing…" while it is out (R-98).
 *
 * Pure but for the default `io` (the browser's `fetch` and a link's click): `signed-download.test.ts` runs every answer over a fake.
 * No `next/server` import, so `node --test` reads it too — a route answers with the platform's own `Response`.
 */

export const SIGNED_WORDS = {
  /** R-98, the Backup step's own word (R-170) */
  preparing: BACKUP_WORDS.preparing,
  gone: "This file is no longer kept, so there's nothing to download.",
  signedOut: "You've been signed out. Sign in again, then download it.",
  failed: "We couldn't prepare that download. Try again.",
} as const

const NO_STORE = { 'Cache-Control': 'no-store' }

/** the follower's ask — the four Downloads' fetch — as opposed to a link the browser followed */
export const wantsUrl = (request: Request): boolean => /\bapplication\/json\b/.test(request.headers.get('accept') ?? '')

/** A ROUTE'S SIGNED URL: `200 { url }` to the follower, else the 303 a link follows; never cached */
export function signedAnswer(request: Request, url: string): Response {
  return wantsUrl(request) ? Response.json({ url }, { headers: NO_STORE }) : new Response(null, { status: 303, headers: { ...NO_STORE, Location: url } })
}

/** A ROUTE ASKED SIGNED OUT: `401` to the follower, else the 303 to sign in that a link follows (Story 2.5's) */
export function signInAnswer(request: Request): Response {
  return wantsUrl(request)
    ? new Response('Not signed in', { status: 401, headers: NO_STORE })
    : new Response(null, { status: 303, headers: { ...NO_STORE, Location: new URL('/sign-in', request.url).toString() } })
}

export type FollowIo = {
  fetch: (href: string, init: RequestInit) => Promise<Pick<Response, 'ok' | 'status' | 'redirected' | 'url' | 'json'>>
  /** the signed URL, followed as a link would be */
  open: (url: string) => void
  log: (message: string, fields: Record<string, number>) => void
}

const BROWSER: FollowIo = {
  fetch: (href, init) => fetch(href, init),
  open: (url) => {
    const a = document.createElement('a')
    a.href = url
    a.click()
  },
  log: (message, fields) => console.error(message, fields),
}

/** FOLLOW ONE SIGNED DOWNLOAD: null when the zip is on its way, else the sentence to say under the button */
export async function followSigned(href: string, io: FollowIo = BROWSER): Promise<string | null> {
  const answer = await io.fetch(href, { headers: { accept: 'application/json' }, cache: 'no-store' }).catch(() => null)
  const status = answer?.status ?? 0
  const failed = (words: string) => {
    io.log('download: the signed link was not followed', { status })
    return words
  }
  // a session that ended: the route's 401, or a proxy that sent the fetch on to the sign-in page
  if (answer !== null && (status === 401 || (answer.redirected && /\/sign-in$/.test(new URL(answer.url, 'http://localhost').pathname)))) return failed(SIGNED_WORDS.signedOut)
  if (status === 404) return failed(SIGNED_WORDS.gone)
  const url = answer?.ok === true ? ((await answer.json().catch(() => null)) as { url?: unknown } | null)?.url : undefined
  if (typeof url !== 'string' || url === '') return failed(SIGNED_WORDS.failed)
  io.open(url)
  return null
}

/** the four Downloads' click: a plain press is followed here; a press with a modifier (a new tab or window) is the browser's own */
export const followsHere = (event: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }): boolean =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
