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
 *  FLOOR under every other transport: Realtime is not used in v1 (R-191), so this is how long another device waits. */
export const HEARTBEAT_MS = 15_000
/** How long a request waits before the take-over is offered. */
export const NUDGE_MS = 30_000
/** A `heartbeat_at` older than this is a session that has gone. There is NO expiry column — the staleness is this
 *  comparison and nothing else (`…complete_schema.sql:500-511`). */
export const STALE_MS = 60_000

/** Where a tab keeps its lock session id. `sessionStorage` is per TAB and survives a reload — which is exactly
 *  "the same session" — and the server can never read it. Here, so `lock-client.ts` and the editor's server layout
 *  share one spelling. */
export const TAB_SESSION_KEY = 'inflozo-lock-session'

/** The mark a reloading holder wears for its first paint (see `selfMarkScript`). */
export const SELF_MARK = 'data-lock-self'

/**
 * A HOLDER'S OWN RELOAD MUST NOT PAINT THE READER'S BAR, NOT FOR ONE FRAME. The server renders the lock from the row,
 * and it cannot know which TAB is asking — so when the row still names this tab (the outgoing page's release has not
 * landed yet), its HTML is the reader's screen, painted until the page hydrates and recognises itself. Measured on
 * `app.inflozo.com` at 4ba9687c: the bar in one 100 ms sample after a reload. This is a script the page runs as its
 * HTML arrives, BEFORE that paint: if this tab is the row's holder it marks `<html>`, and `globals.css` keeps the bar
 * and the dim off under the mark until the editor's layout effect clears it. A different tab — a genuine reader —
 * never matches, so it still sees the bar from its very first paint.
 *
 * The holder id is only ever COMPARED; it is JSON-encoded with `<` escaped, so a stored value can never close the tag.
 */
export const selfMarkScript = (holder: string): string =>
  `try{if(sessionStorage.getItem(${JSON.stringify(TAB_SESSION_KEY)})===${JSON.stringify(holder).replace(/</g, '\\u003c')})` +
  `document.documentElement.setAttribute(${JSON.stringify(SELF_MARK)},'')}catch(e){}`

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
  /** WHICH REQUEST is waiting — its session AND the moment it was made — or null when none is. The same tab asking
   *  twice is TWO requests, and Keep editing answers ONE: keyed by the session alone, a holder that pressed Keep
   *  editing once never saw that tab ask again, and the requester was then offered a take-over for a request the
   *  holder had never been shown (found by the Matrix Test Audit, 2026-09-24). Opaque — compared for equality and
   *  never read as a time, so no surface has to trust a clock to use it. */
  request: string | null
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
  // every `nudge` stamps `nudge_requested_at` afresh (`lock/route.ts`), so the pair names one request exactly
  request: typeof row.nudge_requested_by === 'string' ? `${row.nudge_requested_by}@${String(row.nudge_requested_at)}` : null,
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

/** MAY THIS SESSION'S WORK REACH THE CLOUD? Not while ANOTHER session holds the lock.
 *
 *  A session that has been taken over from still believes it holds until its next beat, and in that window its
 *  autosave, its ⌘S or its tab-hide flush would write the very work the take-over was warned about — B5c said it
 *  "will be lost", and the addendum says orphaned work is never merged, replayed or recovered. Executed on the
 *  deployed walk (2026-09-24): the displaced session's 3-minute autosave landed after the take-over, the edit reached
 *  the cloud, and the session was then told "0 unsynced edits; they were not included" — false twice over.
 *
 *  A FREE lock refuses nothing: a reload's own release, a closing tab and a hand-over's flush all pass through a
 *  moment with no row. An EMPTY session is a tab that has not learned its id yet, never a stranger — refusing it
 *  would drop real work through the displaced flow. `lock/route.ts` never calls this; `sync/route.ts` does. */
export const heldElsewhere = (holder: string | null, session: string | null | undefined): boolean =>
  !!session && holder !== null && holder !== session

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
