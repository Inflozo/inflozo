import { NextResponse, type NextRequest } from 'next/server'
import { docSchema } from '@inflozo/section-runtime'
import { isUuid } from '@/lib/editor'
import { stable } from '@/lib/journal'
import { heldElsewhere } from '@/lib/lock'
import { currentUser, supabaseServer } from '@/lib/supabase/server'

/**
 * AD-15'S FLUSH, AS ONE ROUTE (Story 5.8) — the path the 3-minute timer, ⌘S and the `keepalive` fetch at tab close
 * all take. There is exactly one, so there is exactly one place the compare-and-set can be got wrong.
 *
 * A ROUTE HANDLER AND NOT A SERVER ACTION, for one reason and it is the tab-close one: a tab that is going cannot
 * call a Server Action, and `fetch(..., { keepalive: true })` is the only thing the browser promises to finish.
 *
 * THE BODY IS PARSED THROUGH `docSchema` PER KEY BEFORE IT IS TRUSTED. AD-27's one schema is the only definition of
 * what a doc is, and the RPC below writes `jsonb` without opinions — so a doc that would make `read.ts` throw for the
 * whole editor must be refused HERE, at the only door that writes one, rather than be stored and met on the next load.
 *
 * EVERYTHING ELSE IS THE RPC'S. `public.sync_project_doc()` is `security definer` and does the compare-and-set, the
 * upserts and the revision in ONE transaction, because `authenticated` holds no UPDATE grant on `projects.revision`
 * (§11) and because two PostgREST writes are two transactions — which is exactly what DW-197 found missing from the
 * project-level Clear. It is called through the CALLER'S OWN SESSION, so `auth.uid()` inside it is this user: another
 * user's project id reaches zero rows and answers `null`, the same answer as "no such project", which is why this
 * route returns 404 for both and never distinguishes them.
 *
 * `applied` IS CARRIED SEPARATELY FROM `revision`, and the reason is a collision (see the migration's own comment): a
 * success answers `base + 1`, and the commonest conflict — one other tab having flushed exactly once — leaves the
 * current revision at `base + 1` too. A single number would be read as a success and the unsent work dropped.
 */

export const dynamic = 'force-dynamic'

const no = (status: number, body: string) =>
  new NextResponse(body, { status, headers: { 'Cache-Control': 'no-store' } })

const json = (status: number, body: unknown) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

// Story 5.16 — page 2's two keys, `tag-paged` and `author-paged`, joined the constraint in `20260922120000` (pushed and
// applied first, R-99) and join it here in the same words; Home's page 2 is `index`, which both have always accepted.
// Story 5.20 — `paywall`, the first template surface, joined both in `20260926120000_paywall_template_key.sql` (R-99).
const TEMPLATE_KEY = /^(site|home|index|post|page|tag|author|error|private|tag-paged|author-paged|paywall|custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs)$/

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // `currentUser()`, not `signedIn()`: a route handler answers with a response of its own rather than throwing a page
  // redirect, and a flush from a tab whose session has expired must get a status the editor can read.
  if (!(await currentUser())) return no(401, 'Not signed in')

  const projectId = (await params).id
  if (!isUuid(projectId)) return no(404, 'Not found')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return no(400, 'Not JSON')
  }
  if (typeof body !== 'object' || body === null) return no(400, 'Not an object')

  const { base, docs, session } = body as { base?: unknown; docs?: unknown; session?: unknown }
  // `Number.isSafeInteger` and not `typeof === 'number'`: `NaN`, `Infinity` and `1e300` are all numbers, and a base
  // the database cannot compare is a compare-and-set that silently never matches.
  if (!Number.isSafeInteger(base) || (base as number) < 0) return no(400, 'Bad base revision')
  if (typeof docs !== 'object' || docs === null || Array.isArray(docs)) return no(400, 'Bad docs')

  const keys = Object.keys(docs as Record<string, unknown>)
  if (keys.length === 0) return no(400, 'Nothing to write')

  const parsed: Record<string, unknown> = Object.create(null)
  for (const key of keys) {
    // `template_key_shape`, word for word (SCHEMA.sql): refused HERE as a 422, because inside the RPC it is a 23514,
    // which is a 502, which the editor retries for ever. `__proto__` is refused by the same line.
    if (!TEMPLATE_KEY.test(key)) return no(422, 'Not a template key')
    const doc = docSchema.safeParse((docs as Record<string, unknown>)[key])
    if (!doc.success) return no(422, `${key} is not a document this editor could have written`)
    parsed[key] = doc.data
  }

  const supabase = await supabaseServer()

  // STORY 5.17 — THE LOCK BOUNDARY, ENFORCED WHERE THE WORK IS WRITTEN (AD-15; `heldElsewhere` in `lib/lock.ts`).
  // A session that has been taken over from believes it holds until its next beat, and its autosave, ⌘S or tab-hide
  // flush would otherwise write the orphaned work the take-over warned "will be lost". 423 is its own answer, not the
  // 409 conflict: there is nothing to reconcile, and the editor reads it as "you were taken over from".
  //
  // A LOCK THAT CANNOT BE READ REFUSES NOTHING — the revision compare-and-set below still guards every write, and a
  // spurious refusal would drop real work through the displaced flow. ponytail: the read and the RPC are two
  // statements, so a take-over landing in the milliseconds between them still lets one write through (the revision
  // CAS then answers the new holder's next flush with a 409); closing that means checking the lock INSIDE
  // `sync_project_doc`, which is a migration.
  // ABSENT is a tab that has not learned its id (refuses nothing); PRESENT AND MALFORMED is refused outright, so a
  // body cannot skip the lock check by carrying an id the lock route would never have accepted (review, 2026-09-24)
  if (session !== undefined && (typeof session !== 'string' || session.length === 0 || session.length > 64)) return no(400, 'Bad session')
  if (typeof session === 'string') {
    const { data: lock } = await supabase.from('edit_locks').select('holder_session_id').eq('project_id', projectId).maybeSingle()
    if (heldElsewhere((lock?.holder_session_id as string | undefined) ?? null, session)) return no(423, 'Another session holds this project')
  }

  const { data, error } = await supabase.rpc('sync_project_doc', {
    p_project: projectId,
    p_docs: parsed,
    p_base: base as number,
  })
  if (error) {
    // the CODE, never the message: a Postgres message can quote the row it refused
    console.error('projects/sync: rpc failed', { code: error.code })
    return no(502, 'The save could not be completed')
  }
  // `null` is "not yours, or no such project" — the function's own one answer to both, kept as one answer here
  if (data === null) return no(404, 'Not found')

  const answer = data as { applied: boolean; revision: number }
  if (!answer.applied) {
    // REFUSED — BUT IS IT ALREADY THERE? (Story 5.8's review.) A tab-close flush lands after the reloaded page has read
    // the OLD revision, and a flush whose answer was lost is retried from the old base: both are the editor conflicting
    // with ITS OWN write, and both used to open "changed somewhere else" over work that was safely stored. If every
    // doc this request carries is exactly what the server holds, there is nothing to write and nothing to refuse —
    // the editor adopts the revision. A real second writer's doc differs, and gets the 409 it always got.
    const { data: rows } = await supabase.from('project_templates').select('template_key, doc').eq('project_id', projectId).in('template_key', keys)
    const held = new Map((rows ?? []).map((r) => [r.template_key as string, docSchema.safeParse(r.doc)]))
    const same = keys.every((key) => {
      const there = held.get(key)
      return there?.success === true && stable(there.data) === stable(parsed[key])
    })
    if (same) return json(200, { applied: true, revision: answer.revision })
  }
  return json(answer.applied ? 200 : 409, { applied: answer.applied, revision: answer.revision })
}
