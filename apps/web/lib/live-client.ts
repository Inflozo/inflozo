/* ─────────────────────────────────────────── Story 5.18 — THE ONE PLACE A CONTENT API REQUEST IS MADE.
 *
 * One store per editor session, over one site's `{ origin, key }`: the `Map` cache (no SWR or react-query — FR-H4's
 * "cached 60 s, de-duplicated across canvas, picker and link search" is a `Map` and a second `Map` of promises), ONE
 * request per key however many consumers ask at once, the session's request count, and the stopped state and its cause.
 * Every decision — freshness, what a status means, when reading stops, the whitelist — is `lib/live-content.ts`'s, so
 * the policy cannot drift across callers.
 *
 * IT NEVER THROWS, AND IT LOGS NOTHING. The request's address carries the key, and `/settings/` carries
 * the site's code injection (§38b) — so no URL and no response body is ever logged, and an answer is whitelisted (`pick`)
 * BEFORE it is cached: nothing Ghost sends beyond the canvas's own fields is stored at all.
 *
 * GHOST COUNTS EVERY FAILED REQUEST AGAINST THE CUSTOMER'S NETWORK (MEASUREMENTS §51), so reads go ONE AT A TIME until
 * one has answered in this session and again after any failure — a refused key costs exactly one request, and a site
 * that has stopped answering costs three, never a burst — and a job that reaches the front of the queue after reading
 * has stopped sends nothing. A CORS preflight (`Accept-Version` asks for one) is the browser's and is not counted.
 * THE ONE BOUND THAT IS WIDER (review, 2026-09-24): once the site has answered, up to `WIDTH` reads are in flight at
 * once, and a key rotated or a site gone down MID-SESSION can fail every one of them before the first failure is
 * counted — so that case costs up to `WIDTH` requests, against Ghost's budget of 99. Nothing in flight is ever retried.
 */

import {
  addressOf, after, API_VERSION, ask, isFresh, keyOf, outcomeOf, pick, READ_TIMEOUT_MS, retried, START,
  type Answer, type LiveQuery, type Reading,
} from './live-content.ts'

export type LiveStore = {
  /** the answer in memory, fresh or stale — never a request */
  peek: (q: LiveQuery) => Answer | undefined
  /** the reads among these that are NOT in memory */
  missing: (qs: readonly LiveQuery[]) => LiveQuery[]
  /** Each read in hand: a fresh one costs nothing; a stale one is served at once and revalidated ONCE in the background,
   *  never awaited and never painted (the next paint shows it); a missing one is fetched. Two callers asking for one key
   *  share one request. Resolves when every missing read has settled, answered or not. */
  ensure: (qs: readonly LiveQuery[]) => Promise<void>
  /** the stop rule's state: how many reads, the run of failures, and why reading stopped */
  reading: () => Reading
  /** choosing the site in the SOURCE group — the one "try again", never after a refused key or the ceiling */
  retry: () => void
}

/** `feature_image_caption` is stored as HTML (§31a): reduced to its words through an INERT document — `DOMParser`'s
 *  scripts never run and its images never load (`lib/inline.ts`'s `readMarks` precedent). */
const wordsOf = (html: string): string => new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''

/** How many reads may be in flight once the site has answered and nothing has failed since. */
export const WIDTH = 6

export function liveStore(origin: string, key: string, now: () => number = Date.now, words: (html: string) => string = wordsOf): LiveStore {
  const cache = new Map<string, { at: number; answer: Answer }>()
  const flying = new Map<string, Promise<void>>()
  const queue: (() => Promise<void>)[] = []
  let active = 0
  let reading: Reading = START
  /** has a read answered in this session? Until one has, the key is unproven and reads go one at a time */
  let answered = false

  const width = () => (answered && reading.failures === 0 ? WIDTH : 1)
  const pump = () => {
    while (active < width() && queue.length > 0) {
      active++
      void (queue.shift() as () => Promise<void>)()
    }
  }

  const one = (q: LiveQuery): Promise<void> => {
    const k = keyOf(q)
    const already = flying.get(k)
    if (already !== undefined) return already
    let settle!: () => void
    const done = new Promise<void>((resolve) => (settle = resolve))
    flying.set(k, done)
    queue.push(async () => {
      try {
        // THE STOP RULE AT THE FRONT OF THE QUEUE, not at the back: reading that stopped while this waited sends nothing
        const turn = ask(reading)
        reading = turn.reading
        if (turn.go) {
          let status = 0
          let body: unknown = null
          try {
            const res = await fetch(addressOf(origin, q, key), {
              headers: { 'Accept-Version': API_VERSION },
              signal: AbortSignal.timeout(READ_TIMEOUT_MS),
              credentials: 'omit',
              // the editor's address names the project; the customer's Ghost has no need of it
              referrerPolicy: 'no-referrer',
            })
            status = res.status
            if (res.ok) body = await res.json()
          } catch {
            // a network error, a read with no answer in time, or a body that is not JSON: one failed read
            status = 0
          }
          const answer = outcomeOf(status) === 'ok' ? pick(q.resource, body, words) : null
          reading = after(reading, answer !== null ? 'ok' : outcomeOf(status) === 'ok' ? 'failed' : outcomeOf(status))
          if (answer !== null) {
            answered = true
            cache.set(k, { at: now(), answer })
          }
        }
      } finally {
        // review (2026-09-24): whatever happened above, this job settles and the queue moves — a promise `ensure`
        // is waiting on that never resolved would hold every later paint of the editor for the session
        active--
        flying.delete(k)
        settle()
        pump()
      }
    })
    pump()
    return done
  }

  return {
    peek: (q) => cache.get(keyOf(q))?.answer,
    missing: (qs) => qs.filter((q) => !cache.has(keyOf(q))),
    ensure: (qs) => {
      const waits: Promise<void>[] = []
      for (const q of qs) {
        const hit = cache.get(keyOf(q))
        if (hit === undefined) waits.push(one(q))
        else if (!isFresh(hit.at, now())) void one(q)
      }
      return Promise.all(waits).then(() => undefined)
    },
    reading: () => reading,
    retry: () => {
      reading = retried(reading)
    },
  }
}
