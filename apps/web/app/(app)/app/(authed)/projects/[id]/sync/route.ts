import { NextResponse, type NextRequest } from 'next/server'
import type { CardDesigns } from '@inflozo/library'
import { presetOf } from '@inflozo/library/packs'
import { docSchema } from '@inflozo/section-runtime'
import { parseStoredCards } from '@/lib/cards'
import { canvasOfTemplateKey, isRouteCanvas, isUuid } from '@/lib/editor'
import { stable } from '@/lib/journal'
import { heldElsewhere } from '@/lib/lock'
import { isCustom } from '@/lib/pack-edit'
import { docRefusal } from '@/lib/pilots'
import { ownPacksOf } from '@/lib/style-pack'
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
 * DW-235 (Story 5.24e): and the PLACEMENT rules `read.ts` throws on are asked too — `docRefusal` (`lib/pilots.ts`) is
 * the one rule both doors call, so this route now has the parity it always claimed. It reads the library off disk, so
 * this route's trace carries the designs (`tools/check-traces.mjs`): a lost trace would refuse every save.
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
 *
 * STORY 6.3 — THE STYLE PACK RIDES THE SAME DOOR. A pack change is an edit (FR-D9, AD-16), so the body may carry the
 * pending `preset` beside the docs — or alone — and the RPC writes `style_pack.preset` in the docs' compare-and-set: one
 * revision for both, and a refused call writes neither (`20261004120000_sync_style_pack_preset.sql`). Only a preset this
 * build knows is accepted, refused HERE as a 422 — inside the RPC a junk id would simply be stored, and the next read
 * would paint Paper over it (`presetIdOf`). `brand` is never written: the RPC sets the one key.
 *
 * STORY 6.4 — AND THE PROJECT'S OWN PACKS (FR-E3): the body may carry `packs`, the WHOLE `style_pack.packs` map, beside the
 * docs and the preset — or alone — and the RPC writes it in the same compare-and-set (`p_packs`,
 * `20261004200000_sync_style_pack_packs.sql`). EVERY RECORD IS VALIDATED HERE, BEFORE THE WRITE (AD-36): each entry must
 * survive `ownPacksOf` — the one reading rule every reader asks — or the body is a 422 "Not a Style Pack" and nothing is
 * written; what is written is what was validated. A `preset` may now name a pack the project made (`custom-<n>`), and
 * still nothing else.
 *
 * STORY 7.13 — AND THE PROJECT'S CARD DESIGNS (FR-Q7): the body may carry `cards`, the WHOLE `project_treatments.card_designs`
 * record, beside the rest — or alone — and the RPC upserts it in the same compare-and-set (`p_cards`,
 * `20261016120000_card_designs.sql`). It is parsed HERE by `card_designs`' one schema through `parseStoredCards`
 * (AD-36, AD-27(a)): every key a listed card, every name one of its controls, every value one it offers — a divider's
 * glyph one the icon set draws, the set imported only for a record that names one — or a 422 "Not a card design" and
 * nothing written, BEFORE the write; what is written is the parsed record.
 *
 * STORY 7.16b — THE SYNC NEVER RE-CREATES A DELETED TEMPLATE'S CANVAS. A Routes Manager `custom:` key whose template is no
 * longer one of the project's (`custom_templates`, read once, only when the body carries such a key) is LEFT UNWRITTEN —
 * an editor that had the template open would otherwise put its doc back the moment it saved. Every other key is written as
 * usual, and the answer names each key it left (`left`), which is how the editor learns the template is gone and moves to
 * Home with the notice. A membership key is never asked about: its canvas cannot be deleted.
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

  const { base, docs, session, preset, packs, cards } = body as { base?: unknown; docs?: unknown; session?: unknown; preset?: unknown; packs?: unknown; cards?: unknown }
  // `Number.isSafeInteger` and not `typeof === 'number'`: `NaN`, `Infinity` and `1e300` are all numbers, and a base
  // the database cannot compare is a compare-and-set that silently never matches.
  if (!Number.isSafeInteger(base) || (base as number) < 0) return no(400, 'Bad base revision')
  if (typeof docs !== 'object' || docs === null || Array.isArray(docs)) return no(400, 'Bad docs')

  // Story 6.3: a preset this build knows, or none — `presetOf` searches, so `__proto__` is no preset either. Story 6.4: or a
  // pack the project made, `custom-<n>` — and still nothing else
  if (preset !== undefined && (typeof preset !== 'string' || (presetOf(preset) === undefined && !isCustom(preset)))) return no(422, 'Not a Style Pack')
  // Story 6.4 — the own packs, whole: an object whose every entry survives the one reading rule (AD-36), else nothing is
  // written. What reaches the RPC is what was validated.
  const owned = packs === undefined ? undefined : ownPacksOf({ packs })
  if (packs !== undefined && (typeof packs !== 'object' || packs === null || Array.isArray(packs) || Object.keys(owned ?? {}).length !== Object.keys(packs).length)) return no(422, 'Not a Style Pack')
  // Story 7.13 — the card designs, whole: an object `parseStoredCards` reads (the divider's glyph judged by the icon set),
  // else nothing is written (AD-36)
  const parsedCards: CardDesigns | string | undefined = cards === undefined ? undefined
    : typeof cards !== 'object' || cards === null || Array.isArray(cards) ? 'not an object' : await parseStoredCards(cards)
  if (typeof parsedCards === 'string') return no(422, 'Not a card design')
  const keys = Object.keys(docs as Record<string, unknown>)
  // a body with a preset, own packs or card designs and no docs is a write: that alone was changed
  if (keys.length === 0 && preset === undefined && packs === undefined && parsedCards === undefined) return no(400, 'Nothing to write')

  const parsed: Record<string, unknown> = Object.create(null)
  // the designs read while checking this body, each once
  const held = {}
  for (const key of keys) {
    // `template_key_shape`, word for word (SCHEMA.sql): refused HERE as a 422, because inside the RPC it is a 23514,
    // which is a 502, which the editor retries for ever. `__proto__` is refused by the same line.
    if (!TEMPLATE_KEY.test(key)) return no(422, 'Not a template key')
    const doc = docSchema.safeParse((docs as Record<string, unknown>)[key])
    if (!doc.success) return no(422, `${key} is not a document this editor could have written`)
    // DW-235 — before the lock read and the RPC: what `read.ts` would throw on is refused here, in its own words (the
    // surface's one-design rule among them, which used to be this route's only placement check)
    const refused = docRefusal(key, doc.data, held)
    if (refused !== null) return no(422, refused)
    parsed[key] = doc.data
  }

  const supabase = await supabaseServer()

  // Story 7.16b — the Routes Manager keys, judged against the project's templates read ONCE (RLS: the caller's own rows)
  const routeKeys = keys.filter((key) => {
    const canvas = canvasOfTemplateKey(key)
    return canvas !== null && isRouteCanvas(canvas)
  })
  let left: string[] = []
  if (routeKeys.length > 0) {
    const { data: rows, error: rowsError } = await supabase.from('custom_templates').select('filename').eq('project_id', projectId).eq('kind', 'routes')
    // a read that fails writes nothing of these keys rather than risk re-creating a deleted canvas; the editor retries
    if (rowsError) {
      console.error('projects/sync: custom_templates read failed', { code: rowsError.code })
      return no(502, 'The save could not be completed')
    }
    const current = new Set((rows ?? []).map((r) => `custom:${r.filename as string}`))
    left = routeKeys.filter((key) => !current.has(key))
    for (const key of left) delete parsed[key]
  }
  const written = keys.filter((key) => !left.includes(key))

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
    // Story 6.3: null writes no pack — the function's own default, and every body that carries none
    p_preset: (preset as string | undefined) ?? null,
    // Story 6.4: the validated own packs, whole, or null — which writes no `packs` at all
    p_packs: owned ?? null,
    // Story 7.13: the parsed card designs, whole, or null — which writes no `card_designs` at all
    p_cards: parsedCards ?? null,
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
    // the editor adopts the revision. A real second writer's doc differs, and gets the 409 it always got. Story 6.3:
    // and the preset it carries is the server's `style_pack.preset` — a pack-only body asks that alone. Story 6.4: and the
    // own packs it carries are the server's `style_pack.packs`, as stored (`stable`)
    const [{ data: rows }, { data: project }, { data: treatments }] = await Promise.all([
      written.length === 0 ? { data: [] } : supabase.from('project_templates').select('template_key, doc').eq('project_id', projectId).in('template_key', written),
      preset === undefined && packs === undefined ? { data: null } : supabase.from('projects').select('style_pack').eq('id', projectId).maybeSingle(),
      // Story 7.13: and the card designs as stored, where this body carries them
      parsedCards === undefined ? { data: null } : supabase.from('project_treatments').select('card_designs').eq('project_id', projectId).maybeSingle(),
    ])
    const held = new Map((rows ?? []).map((r) => [r.template_key as string, docSchema.safeParse(r.doc)]))
    const same = written.every((key) => {
      const there = held.get(key)
      return there?.success === true && stable(there.data) === stable(parsed[key])
    })
    const stored = project?.style_pack as { preset?: unknown; packs?: unknown } | null | undefined
    const packThere = preset === undefined || stored?.preset === preset
    const packsThere = owned === undefined || stable(stored?.packs ?? {}) === stable(owned)
    const cardsThere = parsedCards === undefined || stable((treatments as { card_designs?: unknown } | null)?.card_designs ?? {}) === stable(parsedCards)
    // review, 2026-10-04 — A PACK-ONLY BODY PROVES FAR LESS THAN A DOC DOES: with no doc, `same` is true of nothing at all,
    // and one of twelve preset ids matching says nothing about who moved the revision. So it is "already there" only where
    // the server stands exactly ONE write past the base — this body's own, its answer lost. Further on, another session
    // wrote docs this editor has never read, and adopting that revision over them would let its next edit overwrite them.
    const ours = written.length > 0 || answer.revision === (base as number) + 1
    if (same && packThere && packsThere && cardsThere && ours) return json(200, { applied: true, revision: answer.revision, left })
  }
  return json(answer.applied ? 200 : 409, { applied: answer.applied, revision: answer.revision, left })
}
