import { NextResponse, type NextRequest } from 'next/server'
import { isUuid } from '@/lib/editor'
import { nextGeneration, rowFrom, STALE_MS, type LockAnswer, type LockRow } from '@/lib/lock'
import { currentUser, supabaseServer } from '@/lib/supabase/server'

/**
 * FR-D18'S EDIT LOCK, AS ONE ROUTE (Story 5.17) — THE ONE DOOR EVERY `edit_locks` WRITE PASSES.
 *
 * There is exactly one, so there is exactly one place the compare-and-set can be got wrong. `sync/route.ts` is the
 * model and it is followed line for line: `force-dynamic`, `currentUser()` rather than `signedIn()`, `isUuid` on the
 * id, `no()`/`json()` with `Cache-Control: no-store`, and the Postgres CODE logged, never the message.
 *
 * A ROUTE HANDLER AND NOT A SERVER ACTION, for the flush's own reason and for one more of its own. A tab that is
 * going cannot call a Server Action and the release rides `fetch(..., { keepalive: true })`; and THE BROWSER HOLDS
 * NO SUPABASE CLIENT AND NO KEY — `lib/supabase/server.ts` is "THE ONLY PLACE A SUPABASE CLIENT IS MADE", there is
 * no `NEXT_PUBLIC_*` anywhere in `apps/web`, and `lib/supabase/cookies.ts` sets the session cookie `httpOnly`
 * BECAUSE the app has none. So "the client drives the protocol" means the browser drives it through here, and every
 * fact `MEASUREMENTS.md` §50 executed transfers unchanged: this is the same `authenticated` role, the same RLS and
 * the same column grants the probe ran under.
 *
 * NO MIGRATION, AND THAT IS EXECUTED (§50). `PATCH /edit_locks?project_id=eq.<id>&lock_generation=eq.<N>` with
 * `Prefer: return=representation` returns the row it changed and an EMPTY ARRAY at HTTP 200 — not an error — when
 * the filter misses. The empty array IS the protocol: it is how a session learns it was beaten without a second
 * round trip, and two sessions racing one CAS produced exactly one winner.
 *
 * `edit_locks` IS ABSENT FROM THE `service_role` GRANT LOOP (`…complete_schema.sql:1163-1177`): the secret key
 * cannot so much as `select` from this table and would silently return nothing. Every read and write here is the
 * USER'S OWN SESSION'S, which is also why RLS is the whole of the authorisation — `edit_locks_parent_owned` is
 * RESTRICTIVE on `owns_project(project_id)`, so another user's project id reaches zero rows and answers the same
 * "nothing" a missing project answers.
 *
 * SIX INTENTS AND NOTHING ELSE. `acquire` (insert, or the CAS over a stale row) · `beat` (the ~15 s heartbeat,
 * carrying AD-16's edit count) · `nudge` · `keep` · `release` · `takeover` (the CAS). A non-holder's `beat` changes
 * no rows and falls through to the re-read, which is how a reader polls without a seventh intent.
 *
 * DELIBERATELY NO TIMING RULE ON `takeover` — no "a nudge was on the row", no "~30 s passed". Every session that can
 * reach this row is the SAME account's (`projects.user_id` is one person and team seats are out of v1), so the ~30 s
 * is the requester's own courtesy to itself, kept in the client where the countdown is; the row's CAS and RLS are
 * the whole of what the server has to enforce (the spec's "Why a compare-and-swap and not an RPC").
 */

export const dynamic = 'force-dynamic'

const no = (status: number, body: string) =>
  new NextResponse(body, { status, headers: { 'Cache-Control': 'no-store' } })

const json = (status: number, body: unknown) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/** Every column the protocol reads. `lock_generation` is in the UPDATE grant and out of the INSERT grant, which is
 *  the whole reason the CAS is expressible at all. */
const COLUMNS = 'holder_session_id, lock_generation, unsynced_edits, heartbeat_at, nudge_requested_by, nudge_requested_at'

const INTENTS = ['acquire', 'beat', 'nudge', 'keep', 'release', 'takeover'] as const

type Rows = Record<string, unknown>[] | null

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // `currentUser()`, not `signedIn()`: a route handler answers with a response of its own rather than throwing a
  // page redirect, and a heartbeat from a tab whose session has expired must get a status the editor can read.
  const user = await currentUser()
  if (!user) return no(401, 'Not signed in')

  const projectId = (await params).id
  if (!isUuid(projectId)) return no(404, 'Not found')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return no(400, 'Not JSON')
  }
  if (typeof body !== 'object' || body === null) return no(400, 'Not an object')

  const { intent, session, generation, unsynced } = body as Record<string, unknown>
  if (typeof intent !== 'string' || !(INTENTS as readonly string[]).includes(intent)) return no(400, 'Not an intent')
  // the session id is the browser's own `crypto.randomUUID()`, and it is only ever COMPARED — never parsed and never
  // interpolated. Bounded anyway: it is stored in a `text` column.
  if (typeof session !== 'string' || session.length === 0 || session.length > 64) return no(400, 'Bad session')
  // `Number.isSafeInteger`, not `typeof === 'number'`: `NaN`, `Infinity` and `1e300` are all numbers, and a
  // generation the database cannot compare is a compare-and-set that silently never matches (the sync route's own
  // argument about `base`).
  const owed = Number.isSafeInteger(unsynced) && (unsynced as number) >= 0 ? (unsynced as number) : 0
  const held = Number.isSafeInteger(generation) && (generation as number) > 0 ? (generation as number) : null
  if (intent === 'takeover' && held === null) return no(400, 'Bad generation')

  const supabase = await supabaseServer()
  const table = () => supabase.from('edit_locks')
  const stamp = () => new Date().toISOString()

  // ONE FAILURE ANSWER, so a Postgres message never reaches the browser. `42501` from `guard_lock_takeover` is a BUG
  // — a holder change that did not advance the generation — and is surfaced HERE, in the log with its code, rather
  // than swallowed into an ordinary "someone moved first".
  const failed = (where: string, code: string | undefined) => {
    console.error(`projects/lock: ${where} failed`, { intent, code })
    return no(502, 'The lock could not be reached')
  }

  const read = async (): Promise<LockRow | null> => {
    const { data, error } = await table().select(COLUMNS).eq('project_id', projectId).maybeSingle()
    if (error || !data) return null
    return rowFrom(data, Date.now())
  }
  const first = (rows: Rows): LockRow | null => {
    const row = rows?.[0]
    return row ? rowFrom(row as Parameters<typeof rowFrom>[0], Date.now()) : null
  }
  const answer = async (row: LockRow | null, won: boolean) =>
    json(200, { row, held: row !== null && row.holderSessionId === session, won } satisfies LockAnswer)

  /** The heartbeat, filtered on `project_id` AND my own `holder_session_id` — so a session that no longer holds the
   *  lock changes zero rows, which IS the displacement signal. */
  const beat = async () => {
    const { data, error } = await table()
      .update({ heartbeat_at: stamp(), unsynced_edits: owed })
      .eq('project_id', projectId)
      .eq('holder_session_id', session)
      .select(COLUMNS)
    return { rows: data as Rows, code: error?.code }
  }

  if (intent === 'release') {
    // FILTERED ON MY OWN SESSION, always: a session that was displaced and has not noticed yet must never delete the
    // row the new holder is living in.
    const { error } = await table().delete().eq('project_id', projectId).eq('holder_session_id', session)
    if (error) return failed('release', error.code)
    return answer(await read(), true)
  }

  if (intent === 'nudge' || intent === 'keep') {
    // `nudge` is the READER writing on the holder's row, so it is filtered AWAY from itself; `keep` is the holder
    // answering, so it is filtered ONTO itself. Neither touches the holder or the generation, so neither guard fires.
    const patch =
      intent === 'nudge'
        ? { nudge_requested_by: session, nudge_requested_at: stamp() }
        : { nudge_requested_by: null, nudge_requested_at: null }
    const scoped = table().update(patch).eq('project_id', projectId)
    const { data, error } = await (intent === 'nudge'
      ? scoped.neq('holder_session_id', session)
      : scoped.eq('holder_session_id', session)
    ).select(COLUMNS)
    if (error) return failed(intent, error.code)
    const changed = first(data as Rows)
    return answer(changed ?? (await read()), changed !== null)
  }

  if (intent === 'takeover' && held !== null) {
    // THE COMPARE-AND-SWAP, and the generation advances IN THE SAME STATEMENT as the holder change — which is what
    // `guard_lock_takeover` enforces against the service role too, and what the displaced device detects from.
    // `unsynced_edits` is deliberately NOT reset: the schema's own comment makes it the displaced device's count,
    // and the incoming holder writes its own on its next beat.
    const { data, error } = await table()
      .update({
        holder_session_id: session,
        lock_generation: nextGeneration(held),
        heartbeat_at: stamp(),
        nudge_requested_by: null,
        nudge_requested_at: null,
      })
      .eq('project_id', projectId)
      .eq('lock_generation', held)
      .select(COLUMNS)
    if (error) return failed('takeover', error.code)
    // zero rows is not an error: the generation moved under us, so the caller re-reads and reports the new state
    // rather than retrying blindly.
    const won = first(data as Rows)
    return answer(won ?? (await read()), won !== null)
  }

  if (intent === 'beat') {
    const beaten = await beat()
    if (beaten.code) return failed('beat', beaten.code)
    // ZERO ROWS MEANS DISPLACED — or never the holder at all, which is how a READER polls through this same path.
    // Either way the truth is the row, so it is re-read and the caller's generation test decides which.
    const mine = first(beaten.rows)
    return answer(mine ?? (await read()), mine !== null)
  }

  /* `acquire` — the matrix's first, third and fourth rows, in one call.
   *
   * The INSERT names no `lock_generation`: it is outside the grant, so naming it is `42501` and omitting it defaults
   * it to 1. A second INSERT for the same project is `23505` — the matrix's fall-through to the CAS. */
  const there = await read()
  if (there === null) {
    const { data, error } = await table()
      .insert({ project_id: projectId, user_id: user.id, holder_session_id: session, heartbeat_at: stamp(), unsynced_edits: owed })
      .select(COLUMNS)
    if (!error) return answer(first(data as Rows) ?? (await read()), true)
    // 23505: another session inserted between the read and the insert. Fall through to the CAS path below.
    if (error.code !== '23505') return failed('acquire/insert', error.code)
  }

  const row = there ?? (await read())
  if (row === null) return answer(null, false)

  if (row.holderSessionId === session) {
    // THE SAME SESSION AGAIN — a reload that kept its `sessionStorage` id, or the poll after an acquire. The lock is
    // kept and the generation does NOT change: nothing was taken from anybody.
    const beaten = await beat()
    if (beaten.code) return failed('acquire/beat', beaten.code)
    const mine = first(beaten.rows)
    return answer(mine ?? (await read()), mine !== null)
  }

  /* A LOCK BELONGING TO ANOTHER SESSION. Stale → the CAS takes it silently, with no confirm: nothing is being ended.
   * Live → zero rows change and this opener is a READER, which is the same answer with no special case.
   *
   * BOTH TESTS ARE IN THE ONE STATEMENT — the generation AND the age. A read followed by a write would let a holder
   * that beat in between lose its lock to a staleness that was true a moment ago; here its beat moves `heartbeat_at`
   * out of the filter and it simply keeps the lock. */
  const { data, error } = await table()
    .update({
      holder_session_id: session,
      lock_generation: nextGeneration(row.generation),
      heartbeat_at: stamp(),
      unsynced_edits: owed,
      nudge_requested_by: null,
      nudge_requested_at: null,
    })
    .eq('project_id', projectId)
    .eq('lock_generation', row.generation)
    .lt('heartbeat_at', new Date(Date.now() - STALE_MS).toISOString())
    .select(COLUMNS)
  if (error) return failed('acquire/cas', error.code)
  const took = first(data as Rows)
  return answer(took ?? (await read()), took !== null)
}
