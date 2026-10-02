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

/**
 * DW-240 · DW-244 (Story 5.24e): HOW LONG A HOLDER'S ROW STAYS ITS OWN AFTER ITS PAGE GOES. A tab going used to DELETE
 * its row (`release`), and a reload's DELETE raced its own way back in — another window's poll could acquire in the gap
 * and the reloading holder lost the lock to itself (DW-240). Now the going page sends `leave`, which BACKDATES
 * `heartbeat_at` so the row is stale this long after, instead of `STALE_MS` after: a reload's first beat lands well
 * inside it and simply keeps the row, and a closed tab is free for the next opener within a grace and one poll.
 *
 * THREE TIMES THE MEASURED RELOAD GAP (5.24e's Create), and UNDER `HEARTBEAT_MS` and `NUDGE_MS`, so the reader's poll
 * at the staleness edge (`edgePoll`) is what frees a closed tab — never later than at HEAD, when the row went at once.
 * A default with rationale, as the three above are.
 */
export const LEAVE_GRACE_MS = 10_000

/** The `heartbeat_at` a `leave` writes: stale `LEAVE_GRACE_MS` from `now`. The route's one stamp, here so the test
 *  reads the same arithmetic the database is handed. */
export const leaveStamp = (now: number): string => new Date(now - STALE_MS + LEAVE_GRACE_MS).toISOString()

/** AD-16's count as a beat writes it — or NOTHING (DW-240, Story 5.24e). A tab reports no count until this device's
 *  journal has been read: a reload's first beat goes before that read, and writing its 0 over the stored count told the
 *  other session "nothing owed" for up to a heartbeat (the lock walk's reload rows, against a build with `leave`). So an
 *  absent or malformed count leaves the stored one standing; a new row starts at 0. */
export const countPatch = (unsynced: unknown): { unsynced_edits?: number } =>
  Number.isSafeInteger(unsynced) && (unsynced as number) >= 0 ? { unsynced_edits: unsynced as number } : {}

/** A `leave`'s beat: the `heartbeat_at` this tab last heard, opaque and compared only — PostgREST's own shape of a
 *  `timestamptz` (date, `T`, time, optional fraction, then `Z` or an offset), 64 characters or fewer, that `Date.parse`
 *  reads; anything else is refused with a 400, never handed to Postgres to fail as a 502. The route filters on it, so a
 *  late leave carrying an OLD beat matches nothing once the reloaded page has beaten (executed in a `postgres:17`
 *  container at the Create: 0 rows, where HEAD's DELETE changed 1). */
const TIMESTAMPTZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}(:?\d{2})?)$/
export const leaveBeat = (beat: unknown): beat is string =>
  typeof beat === 'string' && beat.length <= 64 && TIMESTAMPTZ.test(beat) && Number.isFinite(Date.parse(beat))

/** A leave only ever moves a beat BACK: it writes `leaveStamp(now)` only where the beat it carries is later than that.
 *  A beat already at or before it is a row that is stale, or nearly, and writing the stamp would REVIVE it — moving
 *  `heartbeat_at` forward for a tab that is going (Story 5.24e's review). */
export const leaveBacks = (heard: string, now: number): boolean => Date.parse(heard) > Date.parse(leaveStamp(now))

/** DW-244: WHEN A SESSION THAT DOES NOT HOLD THE LOCK SHOULD ASK AGAIN, beyond the heartbeat. A live row that goes stale
 *  before the next beat would otherwise be found up to a whole heartbeat late — after a `leave`, a grace plus 15 s — so
 *  the reader polls once more at the edge itself, plus 250 ms. Null: no extra poll. */
export const edgePoll = (row: LockRow | null, holding: boolean, staleMs: number = STALE_MS): number | null =>
  holding || row === null || row.ageMs > staleMs || staleMs - row.ageMs >= HEARTBEAT_MS ? null : staleMs - row.ageMs + 250

/** Where a tab keeps its lock session id. `sessionStorage` is per TAB and survives a reload — which is exactly
 *  "the same session" — and the server can never read it. Here, so `lock-client.ts` and the editor's server layout
 *  share one spelling. */
export const TAB_SESSION_KEY = 'inflozo-lock-session'

/* DW-242 (Story 5.24e): THE PRE-PAINT SELF MARK IS GONE, AND IT HAD BEEN DEAD SINCE STORY 5.22. It was Story 5.17's
 * answer to a holder's own reload painting the reader's bar for a frame, when the server rendered the bar from the row.
 * Since 5.22 the server and the first client render draw only the skeleton: the shell mounts from a layout effect and
 * recognises this tab in one (`editor.tsx`), before the first paint — 0 of 156 frames greyed, against 161 of 161 for a
 * genuine reader (the Create). The keyboard journey's rAF sampler is the control, red with that effect as `useEffect`. */

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
  /** DW-240 (Story 5.24e): the raw `heartbeat_at` — OPAQUE, compared and never read as a time, so no surface trusts two
   *  clocks. A going page sends it back with `leave`, and the route filters on it, so only the beat this tab last heard
   *  can backdate the row. Null when the row carried none. */
  beat: string | null
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
  beat: typeof row.heartbeat_at === 'string' ? row.heartbeat_at : null,
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

/** The row a request was made against: its holder and generation. A request is answered by THAT holder, so a change of
 *  either ends it — whatever the request columns say. */
export type AskedOf = { holder: string; generation: number }

/**
 * DW-243 (Story 5.24e): WHAT BECAME OF MY REQUEST, read off the row — one of three, never inferred from my own id alone.
 *
 * `ended` — the row is gone, or its holder or generation moved: the lock changed hands (a hand-over to me, a take-over
 * by a third session, a release), so nobody is left to answer and the next poll decides. `kept` — the request columns
 * are empty under the same holder: the holder pressed Keep editing. `waiting` — anything else, A REPLACED REQUEST
 * INCLUDED: one person's third device asking at the same moment overwrote mine, and the holder's one answer still
 * reaches both (the spec's routine call 4; R-191 accepts a third device is not v1's shape). Before this, a replaced
 * request and a take-over by a third session both read as "Your other session kept editing." — which was neither.
 */
export const askedNow = (row: LockRow | null, askedOf: AskedOf | null): 'ended' | 'kept' | 'waiting' =>
  row === null || askedOf === null || row.holderSessionId !== askedOf.holder || row.generation !== askedOf.generation
    ? 'ended'
    : row.nudgeRequestedBy === null
      ? 'kept'
      : 'waiting'

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
  /** the lock route was not reached (offline, a 5xx): said POLITELY by the request and the take-over, so a failed
   *  press is reported rather than a label quietly reverting or a dialog closing over nothing (the matrix's rows). */
  unreachable: 'That could not be sent. Try again.',
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
