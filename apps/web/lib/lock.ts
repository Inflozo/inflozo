/* THE EDIT LOCK, AS PURE RULES (Story 5.17, FR-D18, AD-15, AD-16, `addendum.md` §AD2/§AD4).
 *
 * Every rule that can be got wrong lives here, in a `.ts` `node --test` can import — `lib/journal.ts`'s own
 * precedent and for its reason: a rule that lives in `editor.tsx` is a rule no test can reach.
 *
 * NOTHING HERE DOES I/O AND NOTHING HERE HOLDS STATE. `lib/lock-client.ts` is the one caller that talks to the
 * route, `lock/route.ts` is the one place an `edit_locks` row is written, and both read their decisions from here.
 *
 * THE WHOLE PROTOCOL IS AN OPTIMISTIC COMPARE-AND-SWAP ON `lock_generation`, and the schema was built for exactly
 * that: the column is in the `authenticated` UPDATE grant and OUT of the INSERT grant, `guard_lock_generation`
 * forbids a rewind and `guard_lock_takeover` forbids a holder change that does not advance it. Writing
 * `holder = me, generation = N + 1` FILTERED ON `generation = N` changes zero rows if anyone moved first, which is
 * how a session learns it was beaten without a second round trip. Executed against the real Supabase project
 * before a line of this was written (`MEASUREMENTS.md` §50, `tools/probe/record-edit-lock.py`).
 *
 * THERE IS NOBODY TO NAME (**R-189**, owner, 2026-09-23). `projects.user_id` is one account and team seats are out
 * of v1, so the other editing context is ALWAYS the same person — another tab, another browser, another device.
 * Every string below says WHERE, never WHO.
 *
 * AND THE WORD IS `unsynced`, NEVER `unsaved` (**R-190**, same day), because the persistence indicator two inches
 * above says "Saved on this device" and then "Synced": an edit written here and not sent has genuinely been saved.
 */

/* ───────────────────────────── §AD4's three constants ─────────────────────────────
 *
 * DEFAULTS WITH RATIONALE, owned by the Architect — not behaviour to change without the owner. The frame draws
 * "Expires in 60s" against the nudge's ~30 s and `EXPERIENCE.md:1063` rules that difference explicitly NOT a
 * finding, so §AD4's number is the one built and B5b prints it.
 *
 * LOAD-BEARING BY CONTRAST AND NOT TUNABLE: the generation test, the revision comparison, and `unsynced_edits` as
 * the sole surfaced count (`addendum.md:72`). */

/** How often the holder tells the server it is still there, carrying `unsyncedEdits(journal)`. It is also the
 *  FLOOR under every other transport: with Realtime unbuilt (DW-239) this is how long the other session waits. */
export const HEARTBEAT_MS = 15_000
/** How long a request waits before the take-over is offered. */
export const NUDGE_MS = 30_000
/** A `heartbeat_at` older than this is a session that has gone. There is NO expiry column — the staleness is this
 *  comparison and nothing else (`…complete_schema.sql:500-511`). */
export const STALE_MS = 60_000

/* ───────────────────────────── the row, as everything downstream reads it ───────────────────────────── */

/** `edit_locks`, in the app's own words. The two ages are measured on the SERVER and handed over as durations, so
 *  no surface has to trust two clocks to agree. */
export type LockRow = {
  holderSessionId: string
  generation: number
  /** AD-16's count, as the holder last reported it: EDITS, never operations. The ONLY count this story surfaces. */
  unsyncedEdits: number
  /** how long ago the holder last beat */
  ageMs: number
  /** the session that asked to edit, or null */
  nudgeRequestedBy: string | null
  /** how long ago it asked, or null */
  nudgeAgeMs: number | null
}

/** A PostgREST row into a `LockRow`. Here rather than in the route because `read.ts` maps the same columns, and two
 *  mappings of one row drift. */
export const rowFrom = (
  row: {
    holder_session_id: unknown
    lock_generation: unknown
    unsynced_edits: unknown
    heartbeat_at: unknown
    nudge_requested_by: unknown
    nudge_requested_at: unknown
  },
  now: number,
): LockRow => ({
  holderSessionId: String(row.holder_session_id),
  generation: Number(row.lock_generation),
  unsyncedEdits: Number(row.unsynced_edits ?? 0),
  ageMs: since(row.heartbeat_at, now) ?? 0,
  nudgeRequestedBy: typeof row.nudge_requested_by === 'string' ? row.nudge_requested_by : null,
  nudgeAgeMs: since(row.nudge_requested_at, now),
})

const since = (at: unknown, now: number): number | null => {
  if (typeof at !== 'string') return null
  const then = Date.parse(at)
  return Number.isFinite(then) ? Math.max(0, now - then) : null
}

/** WHAT EVERY INTENT ANSWERS, declared once: the row as it now stands (or null — the lock is free), whether THIS
 *  session holds it, and whether the write changed anything. `won` is the compare-and-swap's own answer, so a caller
 *  never has to infer "I was beaten" from a shape. The route and the client both read it from here, because two
 *  declarations of one wire shape drift (standing rule 7). */
export type LockAnswer = { row: LockRow | null; held: boolean; won: boolean }

/* ───────────────────────────── the four decisions ───────────────────────────── */

/** Is this lock free for the taking? No row at all is the first opener's case; a row nobody has beaten for ~60 s is
 *  a session that has gone, and the matrix acquires it SILENTLY — no confirm, because nothing is being ended. */
export const isStale = (row: LockRow | null, staleMs: number = STALE_MS): boolean => row === null || row.ageMs > staleMs

/** The generation a take-over or a stale acquisition writes. A holder change at anything else is `42501` from
 *  `guard_lock_takeover`, executed (§50). */
export const nextGeneration = (generation: number): number => generation + 1

/**
 * AD-15'S TAKE-OVER TEST, AND IT IS THE GENERATION ALONE.
 *
 * The displaced session clears its journal unconditionally, decided by THIS and independent of the revision
 * comparison — which is why a take-over whose new holder has written nothing still clears. `lock_generation` is
 * trigger-guarded monotonic against the service role too, so a session that held generation N and reads anything
 * above N was displaced, whoever wrote it.
 */
export const displacedBy = (heldGeneration: number, rowGeneration: number): boolean => rowGeneration > heldGeneration

/** Which of the four a session is in. `held` is the generation this session acquired at, or null if it has never
 *  held the lock (or gave it away deliberately, which is not being displaced). */
export type Party = 'holder' | 'reader' | 'requesting' | 'displaced'

export function partyOf(
  row: LockRow | null,
  session: string,
  held: number | null,
  requesting: boolean,
): Party {
  if (row !== null && row.holderSessionId === session) return 'holder'
  if (held !== null && row !== null && displacedBy(held, row.generation)) return 'displaced'
  return requesting ? 'requesting' : 'reader'
}

/** Is my request still outstanding? `null` from the row means it was answered — Keep editing cleared the columns —
 *  and another session's id there means mine was replaced. */
export const stillAsking = (row: LockRow | null, session: string): boolean => row?.nudgeRequestedBy === session

/**
 * F-079 (`reconcile-designs-decisions.md:1313-1314`): the holder's countdown is a NO-RESPONSE timer, and any
 * interaction with the popover — focus included — RESTARTS it. **It does not stop**: a holder who focuses the card
 * and then does nothing has not answered, so §AD4's ~30 s runs again from their last interaction and the
 * requester's take-over is then offered.
 *
 * A POINTER RESTING ON THE CARD FIRES NOTHING, and the owner's own manual test (step 6 — "leave it there, without
 * pressing anything, for a full minute") expects the countdown to keep starting again. So PRESENCE restarts it too,
 * which is what the tick passes as `pointerInside`.
 */
export const RESTART_EVENTS = ['pointerover', 'pointermove', 'pointerdown', 'focusin', 'keydown'] as const

export const restartsNudge = (type: string, pointerInside = false): boolean =>
  pointerInside || (RESTART_EVENTS as readonly string[]).includes(type)

/** B5b's countdown, in whole seconds and never below zero. */
export const secondsLeft = (startedAt: number, now: number, nudgeMs: number = NUDGE_MS): number =>
  Math.max(0, Math.ceil((startedAt + nudgeMs - now) / 1000))

/* ───────────────────────────── the strings, settled (R-189, R-190, R-170) ─────────────────────────────
 *
 * ONE NAME FOR ONE THING, DERIVED FROM ONE LIST. R-170: the owner wants one name for one concept across the
 * button, the menu, the caption and the announcement. So every surface of this story — B5a, B5b, B5c, the
 * assertive notices and the deployed harness that checks them — reads its words from here, and a surface that
 * invents its own wording is wrong even if it reads well.
 *
 * The plural is derived rather than written twice: the owner's manual test walks the one-edit case ("1 unsynced
 * edit"), and a string list with a hardcoded "s" reads wrong on exactly that walk.
 */

/** "1 unsynced edit" · "7 unsynced edits" — R-190's word, pluralised in one place. */
export const edits = (n: number): string => `${n} unsynced ${n === 1 ? 'edit' : 'edits'}`

/** "4 minutes" · "35 seconds" — B5c's duration, from the moment the request was sent. */
export function duration(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000))
  if (seconds < 90) return `${seconds} second${seconds === 1 ? '' : 's'}`
  const minutes = Math.round(seconds / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

export const LOCK_COPY = {
  /** B5a, the reader's bar. It says WHERE, never WHO (R-189). */
  reading: 'You are editing this site somewhere else — you are reading along here',
  request: 'Request editing',
  /** R-98: the pressed control says it is working, and the label swap moves nothing. */
  requesting: 'Asking…',
  /** B5b */
  askTitle: 'Your other session wants to edit',
  askBody: 'If you hand over, your unsynced edits are sent first. You keep reading along.',
  allSynced: 'All your edits are synced',
  willSend: (n: number) => `${edits(n)} will be sent first`,
  pending: (n: number) => `${n} pending`,
  handOver: 'Hand over',
  handingOver: 'Handing over…',
  keep: 'Keep editing',
  expires: (seconds: number) => `Expires in ${seconds}s`,
  /** the flush refused, so the lock is NOT released: unsynced work never crosses a lock boundary (AD-15) */
  handOverFailed: 'Your edits could not be sent, so you are still editing here.',
  /** the requester, unanswered */
  noResponse: (n: number) => `No response; that session has ${edits(n)}`,
  takeOver: 'Take over anyway',
  takingOver: 'Taking over…',
  wait: 'Wait',
  /** the holder answered Keep editing. Built from the two sentences the owner ruled — "your other session" and the
   *  button's own word — rather than invented beside them (R-170). */
  kept: 'Your other session kept editing.',
  /** B5c. The second sentence is ABSENT when nothing is owed, and so is the whole danger panel (UX-DR3). */
  takeoverTitle: 'Take over from your other session?',
  takeoverBody: (ms: number, owed: boolean) =>
    `That session has not responded for ${duration(ms)}.${owed ? ' It has edits that never reached the server.' : ''}`,
  willBeLost: (n: number) => `${edits(n)} will be lost`,
  lossIsFinal: 'They exist only in that session. We cannot retrieve them from here.',
  /** the displaced session, announced assertively. "**This** session", not "that": it is read BY the session it is
   *  about, so one pronoun makes the sentence true from where it is read (R-189's routine judgement). */
  displaced: (n: number) => `This session had ${edits(n)}; they were not included.`,
} as const
