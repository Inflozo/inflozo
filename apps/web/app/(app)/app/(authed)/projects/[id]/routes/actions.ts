'use server'

import { revalidatePath } from 'next/cache'
import {
  listsOf, parseRoutesConfig, pathsUsing, routesYaml, ROUTE_WORDS, templateName, validateRoutes, withoutTemplate, type RoutesConfig,
} from '@inflozo/section-runtime/routes'
import { docSchema, listedStart, type ProjectDoc } from '@inflozo/section-runtime'
import { isUuid, routesPath } from '@/lib/editor'
import type { Move } from '@/lib/journal'
import { docRefusal, pilot, pilotIds } from '@/lib/pilots'
import { ROUTES_WORDS, templatesOf, templateWriteRefusal, type Template } from '@/lib/routes'
import { signedIn, supabaseServer } from '@/lib/supabase/server'

/**
 * STORY 7.16a — THE ROUTES MANAGER'S FOUR WRITES (FR-I2, FR-I3), in the house shape (`settings/translations/actions.ts`):
 * the project id from the form and `isUuid`; the WHOLE next config re-validated here by the runtime's one validator
 * (`validateRoutes`) before anything is written, against the project's own templates read under the caller's session; RLS
 * through `supabaseServer()` (the uniform owner policy and the parent-ownership term, `…complete_schema.sql:814-855`, CRUD
 * granted at `:1016-1026` — another user's project reaches zero rows, the same answer as "no such project"); `.select()`
 * so a zero-row write is seen; then the routes page is revalidated, so the YAML pane is the saved state re-rendered.
 *
 * `routes_config` holds `config` and `yaml` — `yaml` is `routesYaml(config)` exactly, the bytes Story 7.17 uploads and
 * byte-compares, and null while the config is Ghost's default (routine call 17). No migration: both tables exist since
 * Story 1.2 (`:274-288`, `:356-363`).
 *
 * EVERY MULTI-WRITE IS ORDERED SO EACH INTERMEDIATE STATE IS VALID: a new template's row is written before the config
 * that names it — and, since Story 7.16c, a collection's or channel's new template's starting doc between the two (row →
 * doc → config: a template with or without its feed and no route are both valid); a template's delete writes the config WITHOUT its routes first, then deletes its canvas's doc (Story
 * 7.16b), then the row; its Undo inserts the row first, then the doc, then writes the previous config. So no stored config
 * ever names a template that is not there, and no doc outlives its template but for the moment between two writes (which
 * the editor's read and the sync route both treat as no canvas, routine call 11).
 *
 * OUTSIDE THE EDITOR'S LOCK, as Theme settings is (routine call 15): two tabs saving at once, the last write wins.
 * `ponytail:` — a compare-and-set on `routes_config.updated_at` if that is ever seen.
 *
 * `routes_config.yaml` IS NOT ONLY STORED (2026-10-18): Story 7.17's routes step (`server/routes-upload.ts`) reads it, judges
 * it equal to `routesYaml(config)` and uploads it; Story 7.18a's Ship it calls that step.
 *
 * STORY 7.17 — DW-370, R-258: EVERY ANSWER CARRIES WHAT IT MOVED. A write that moves `projects.revision` (`syncDocs`) records
 * the move — from, to, the docs it wrote and the keys it took away — and every result, a refusal included when an earlier
 * write of it moved the revision, hands the list back as `moved`. The page posts it on `MOVED_CHANNEL`, so an editor open
 * in this browser takes the docs in from its own base instead of meeting R-253's 409 (AD-15's rule).
 */

/** `file` — a template just created (Story 7.16b: the Template menu's "New template" opens its canvas); `doc` — the canvas
 *  doc a template's delete took with it, handed back so its Undo can restore it exactly (AD-36: it is judged again then). */
export type RoutesResult =
  | { ok: true; file?: string; doc?: unknown; moved?: Move[] }
  /** `made` — Story 7.17, DW-367: the new template a collection's or channel's sheet named was made but its starting grid
   *  was not, so the sheet keeps it chosen and sends `start_file` with its next Save */
  | { error: string; made?: string; moved?: Move[] }

type Supabase = Awaited<ReturnType<typeof supabaseServer>>

const couldNot = (): RoutesResult => ({ error: ROUTES_WORDS.couldNot })

/** A result with the moves its writes made, when they made any (DW-370) — an error result too. */
const withMoved = (result: RoutesResult, moved: readonly Move[]): RoutesResult => (moved.length === 0 ? result : { ...result, moved: [...moved] })

const idOf = (formData: FormData) => {
  const id = formData.get('project')
  return typeof id === 'string' && isUuid(id) ? id : null
}

const jsonOf = (formData: FormData, key: string): unknown => {
  const raw = formData.get(key)
  if (typeof raw !== 'string') return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/** The page as Next sees it (under the internal `/app` prefix the proxy strips). */
const revalidate = (id: string) => revalidatePath(`/app${routesPath(id)}`)

/** What the writes are judged against, read under the caller's session: the project's Routes Manager templates and the
 *  names it has deployed. */
async function contextOf(sb: Supabase, id: string): Promise<{ templates: Template[]; deployed: string[] } | null> {
  const [templates, deployed] = await Promise.all([
    sb.from('custom_templates').select('id, filename, display_name, kind, created_at').eq('project_id', id).eq('kind', 'routes').order('created_at'),
    sb.from('deployed_template_names').select('filename').eq('project_id', id),
  ])
  const failed = templates.error ?? deployed.error
  if (failed) {
    console.error('projects/routes: a read failed', { code: failed.code })
    return null
  }
  return {
    templates: templatesOf(templates.data),
    deployed: (deployed.data ?? []).map((r) => r.filename as string),
  }
}

/** The stored config, parsed — `{}` (no row) is Ghost's default; null when the row could not be read or does not parse. */
async function storedConfig(sb: Supabase, id: string): Promise<RoutesConfig | null> {
  const { data, error } = await sb.from('routes_config').select('config').eq('project_id', id).maybeSingle()
  if (error) {
    console.error('projects/routes: routes_config read failed', { code: error.code })
    return null
  }
  const parsed = parseRoutesConfig(data?.config ?? {})
  return parsed.ok ? parsed.config : null
}

/** The one config write: judged whole, then upserted with its YAML. Returns the sentence of the first problem, or null. */
async function writeConfig(sb: Supabase, id: string, userId: string, next: unknown, templates: readonly string[]): Promise<string | null> {
  const problems = validateRoutes(next, { templates })
  if (problems.length > 0) return (problems[0] as { message: string }).message
  const parsed = parseRoutesConfig(next)
  if (!parsed.ok) return parsed.message
  const { data, error } = await sb
    .from('routes_config')
    .upsert({ project_id: id, user_id: userId, config: parsed.config, yaml: routesYaml(parsed.config), updated_at: new Date().toISOString() }, { onConflict: 'project_id' })
    .select('project_id')
  if (error || !data || data.length === 0) {
    console.error('projects/routes: routes_config write failed', { code: error?.code })
    return ROUTES_WORDS.couldNot
  }
  return null
}

/** A new template row, named by §7.4's rule (`templateName`); the database's `23505` — `unique (project_id, filename)` or
 *  the deployed-name guard (`:1319-1347`) — answers with the naming step's own sentence. */
async function insertTemplate(sb: Supabase, id: string, userId: string, display: unknown, ctx: { templates: Template[]; deployed: string[] }, moved: Move[]): Promise<{ file: string } | { error: string }> {
  if (typeof display !== 'string') return { error: ROUTE_WORDS.nameEmpty }
  const named = templateName(display, { project: ctx.templates.map((t) => t.file), deployed: ctx.deployed })
  if ('error' in named) return named
  // Story 7.16b's review: a name not in use here has no canvas yet, so whatever an earlier template of that name left is
  // cleared first — a doc the delete's race re-stored (routine call 11), its preview subject and looked-at record — and the
  // new template opens empty, never wearing the old one's sections
  const key = `custom:${named.file}`
  // Story 7.16c: a leftover doc moves the revision too (`syncDocs`), or the device that re-stored it keeps showing it — and
  // it moves BEFORE the clear (the review): a move that fails leaves the doc in place, so the next try moves it again
  const { data: leftover, error: unread } = await sb.from('project_templates').select('template_key').eq('project_id', id).eq('template_key', key)
  if (unread || ((leftover ?? []).length > 0 && !(await syncDocs(sb, id, {}, moved, [key])))) {
    console.error('projects/routes: an earlier template\'s leftover doc could not be read or its revision moved', { code: unread?.code })
    return { error: ROUTES_WORDS.couldNot }
  }
  const cleared = await Promise.all([
    sb.from('project_templates').delete().eq('project_id', id).eq('template_key', key),
    sb.from('project_template_prefs').delete().eq('project_id', id).eq('template_key', key),
  ])
  const unclear = cleared.find((c) => c.error !== null)?.error
  if (unclear) {
    console.error('projects/routes: an earlier template\'s leftovers could not be cleared', { code: unclear.code })
    return { error: ROUTES_WORDS.couldNot }
  }
  const { data, error } = await sb
    .from('custom_templates')
    .insert({ project_id: id, user_id: userId, display_name: display.trim(), filename: named.file, kind: 'routes' })
    .select('id')
  if (error || !data || data.length === 0) {
    console.error('projects/routes: template insert failed', { code: error?.code })
    return { error: templateWriteRefusal(error, named.file) ?? ROUTES_WORDS.couldNot }
  }
  return { file: named.file }
}

/** STORY 7.16c (FR-H2 "at creation", routine call 2) — a NEW template a collection's or channel's own sheet names starts with
 *  the archive defaults' feed, a17/1 "Post grid" flagged as its main feed (`listedStart`, synthesis's own placing), written
 *  under its canvas's key before the config that lists it. False when the doc could not be written (logged); true when it
 *  was, or when the library places nothing there (an empty doc is no doc, AD-22). Judged by `docRefusal`, as every doc is.
 *
 *  Written through `syncDocs` (below), never a direct upsert: the owner's test (2026-10-18) found the grid missing. */
async function writeListedStart(sb: Supabase, id: string, file: string, moved: Move[]): Promise<boolean> {
  const held = (designId: string) => (pilotIds().includes(designId) ? pilot(designId) : undefined)
  const { instances } = listedStart(file, held)
  if (instances.length === 0) return true
  const key = `custom:${file}`
  const doc: ProjectDoc = { schemaVersion: 1, instances }
  const refused = docRefusal(key, doc)
  if (refused !== null) {
    console.error('projects/routes: the new template\'s starting doc was refused', { sentence: refused })
    return false
  }
  return (await syncDocs(sb, id, { [key]: doc }, moved)) !== null
}

/** STORY 7.16c (the owner's test, 2026-10-18) — EVERY DOC THIS PAGE CHANGES MOVES THE REVISION, through `sync_project_doc`.
 *  AD-15's hydrate keeps a device's OWN docs whenever its `base_revision` equals `projects.revision`, and a direct write to
 *  `project_templates` moves no revision. So the editor kept its copy: a new collection's template opened without its
 *  feed, and a deleted template's old doc could come back on a new one of the same name. The function writes the docs
 *  handed to it (none, to move the revision alone) and moves the revision in one compare-and-set (AD-31), so the next
 *  hydrate takes the cloud's. Its cost is AD-15's for any second writer: that device's journal, its undo history, is
 *  cleared then, and an editor open in another tab meets the 409 at its next save — accepted for now (R-253, AD-15; DW-370
 *  spares it later). A refusal means an editor flushed in between, so it is retried at the revision the refusal hands back:
 *  these keys are a canvas no editor can be holding (a new one, or one whose template was gone). `ponytail:` three tries,
 *  then null; the caller says `couldNot` and the step is tried again.
 *
 *  STORY 7.17 — DW-370: IT ANSWERS THE MOVE (`{ from, to, docs, gone }`, or null when nothing was written) and records it in
 *  `moved`, the action's list. `gone` is the keys this move takes away (a deleted template's canvas), written by the caller
 *  beside it; an editor in this browser told of the move takes the docs in and drops the gone keys from its own base. */
async function syncDocs(sb: Supabase, id: string, docs: Record<string, ProjectDoc>, moved: Move[], gone: string[] = []): Promise<Move | null> {
  const { data: project, error: readError } = await sb.from('projects').select('revision').eq('id', id).maybeSingle()
  if (readError || !project) {
    console.error('projects/routes: the project\'s revision could not be read', { code: readError?.code })
    return null
  }
  let base = project.revision as number
  for (let tries = 0; tries < 3; tries++) {
    const { data, error } = await sb.rpc('sync_project_doc', { p_project: id, p_docs: docs, p_base: base })
    if (error || data === null) {
      console.error('projects/routes: the doc write failed', { code: error?.code })
      return null
    }
    const answer = data as { applied: boolean; revision: number }
    if (answer.applied) {
      const move: Move = { from: base, to: answer.revision, docs, gone }
      moved.push(move)
      return move
    }
    base = answer.revision
  }
  console.error('projects/routes: the doc write was refused three times by a moving revision')
  return null
}

/**
 * THE WHOLE NEXT CONFIG — every sheet's primary button, every drop, every taxonomy save and every collection, channel or
 * route Undo. With `template_name`, the sheet also named a new template: its file must be the one the config names
 * (`template_file`), the config is judged with it counted BEFORE either write, and the row is written first. STORY 7.16c —
 * when the config LISTS it (a collection's or a channel's sheet), its starting doc is written next, then the config; a
 * static route's new template, like "+ New template", opens empty (7.16b).
 *
 * STORY 7.17 — DW-367 (routine call 6): A FAILED STARTING GRID SAYS WHAT WAS LEFT, AND THE NEXT SAVE ADDS IT. The row stands
 * (unrouted, without its feed — a valid state), and the answer is `listedStartFailed(name)` with `made`, the file: the sheet
 * keeps that template chosen and sends `start_file` with its next Save. The server re-checks before writing anything: the
 * grid goes only to THIS project's template that has no `project_templates` row and that no stored route names, and only
 * when the config being saved lists it — then the config. Anything else named as `start_file` is left as it is, so a
 * template chosen in the ordinary way never gains a doc it did not have (7.16c's routine call 2).
 */
export async function saveRoutes(_previous: RoutesResult | null, formData: FormData): Promise<RoutesResult> {
  const id = idOf(formData)
  const next = jsonOf(formData, 'config')
  if (!id || next === undefined) return couldNot()
  const user = await signedIn()
  const sb = await supabaseServer()
  const ctx = await contextOf(sb, id)
  if (!ctx) return couldNot()
  const moved: Move[] = []
  const display = formData.get('template_name')
  const known = ctx.templates.map((t) => t.file)
  const parsed = parseRoutesConfig(next)
  const lists = parsed.ok ? listsOf(parsed.config) : new Map()
  if (display !== null) {
    const named = typeof display === 'string' ? templateName(display, { project: known, deployed: ctx.deployed }) : { error: ROUTE_WORDS.nameEmpty }
    if ('error' in named) return named
    if (named.file !== formData.get('template_file')) return couldNot()
    const problems = validateRoutes(next, { templates: [...known, named.file] })
    if (problems.length > 0) return { error: (problems[0] as { message: string }).message }
    const made = await insertTemplate(sb, id, user.id, display, ctx, moved)
    if ('error' in made) return withMoved(made, moved)
    known.push(made.file)
    if (lists.has(made.file) && !(await writeListedStart(sb, id, made.file, moved))) {
      // the row stands, unrouted and without its feed — a valid state the page lists, so the sheet can be saved again
      revalidate(id)
      return withMoved({ error: ROUTES_WORDS.listedStartFailed((display as string).trim()), made: made.file }, moved)
    }
  } else {
    const start = formData.get('start_file')
    const template = typeof start === 'string' ? ctx.templates.find((t) => t.file === start) : undefined
    if (template !== undefined && lists.has(template.file)) {
      const [held, stored] = await Promise.all([
        sb.from('project_templates').select('template_key').eq('project_id', id).eq('template_key', `custom:${template.file}`),
        storedConfig(sb, id),
      ])
      if (held.error || stored === null) return withMoved(couldNot(), moved)
      // DW-367's re-check: no doc yet, and no stored route names it — a template made by the sheet whose grid failed
      if ((held.data ?? []).length === 0 && pathsUsing(stored, template.file).length === 0 && !(await writeListedStart(sb, id, template.file, moved))) {
        return withMoved({ error: ROUTES_WORDS.listedStartFailed(template.name), made: template.file }, moved)
      }
    }
  }
  const refused = await writeConfig(sb, id, user.id, next, known)
  if (refused !== null) {
    // a template row written before a refused config is a valid state (unrouted) — the page must list it, or a retry of
    // the same sheet is refused as a name it cannot see (review, 2026-10-17)
    if (display !== null) revalidate(id)
    return withMoved({ error: refused }, moved)
  }
  revalidate(id)
  return withMoved({ ok: true }, moved)
}

/** "+ New template" on its own (R-247's Templates list): the row alone, no route. Story 7.16b — it answers the file it
 *  made, which the Template menu's entry opens as a canvas. */
export async function createTemplate(_previous: RoutesResult | null, formData: FormData): Promise<RoutesResult> {
  const id = idOf(formData)
  if (!id) return couldNot()
  const user = await signedIn()
  const sb = await supabaseServer()
  const ctx = await contextOf(sb, id)
  if (!ctx) return couldNot()
  const moved: Move[] = []
  const made = await insertTemplate(sb, id, user.id, formData.get('name'), ctx, moved)
  if ('error' in made) return withMoved(made, moved)
  revalidate(id)
  return withMoved({ ok: true, file: made.file }, moved)
}

/**
 * A TEMPLATE'S DELETE (FR-I3; the designed half since Story 7.16b): the config WITHOUT every route naming it is written
 * first, then its canvas's doc (`custom:<file>`) is deleted, then the row — so every state between is valid: an unrouted
 * template with its design, then one without. The doc is the one the delete itself took (`.select('doc')`), so a save that
 * landed just before it is what Undo restores, and it is answered back for the toast's Undo. A later step that fails puts
 * back what the earlier ones took — the doc, then the routes — so a failed delete leaves the template as it was (review,
 * 2026-10-17). `ponytail:` a put-back that itself fails is logged and leaves the template unrouted or undesigned; one
 * transaction across these writes is a database function, which is a migration.
 */
export async function deleteTemplate(_previous: RoutesResult | null, formData: FormData): Promise<RoutesResult> {
  const id = idOf(formData)
  const templateId = formData.get('template')
  if (!id || typeof templateId !== 'string' || !isUuid(templateId)) return couldNot()
  const user = await signedIn()
  const sb = await supabaseServer()
  const ctx = await contextOf(sb, id)
  const template = ctx?.templates.find((t) => t.id === templateId)
  if (!ctx || !template) return couldNot()
  const key = `custom:${template.file}`
  const config = await storedConfig(sb, id)
  if (!config) return couldNot()
  const known = ctx.templates.map((t) => t.file)
  const next = withoutTemplate(config, template.file)
  const routed = next.collections.length !== config.collections.length || next.routes.length !== config.routes.length
  if (routed) {
    const refused = await writeConfig(sb, id, user.id, next, known.filter((f) => f !== template.file))
    if (refused !== null) return { error: refused }
  }
  /** a later step failed: the routes this delete took go back — the template is still there to name — and it says so */
  const failed = async (what: string, code: string | undefined): Promise<RoutesResult> => {
    console.error(`projects/routes: ${what}`, { code })
    if (routed && (await writeConfig(sb, id, user.id, config, known)) !== null) console.error('projects/routes: the template\'s routes could not be put back')
    revalidate(id)
    return couldNot()
  }
  const dropped = await sb.from('project_templates').delete().eq('project_id', id).eq('template_key', key).select('doc')
  if (dropped.error) return failed('the template\'s doc delete failed', dropped.error.code)
  const held = (dropped.data ?? []).length > 0
  const doc: unknown = dropped.data?.[0]?.doc
  const { data, error } = await sb.from('custom_templates').delete().eq('id', templateId).eq('project_id', id).select('id')
  if (error || !data || data.length === 0) {
    // the doc goes back first: a template that stays keeps its design
    if (held) {
      const back = await sb.from('project_templates').upsert({ project_id: id, user_id: user.id, template_key: key, doc }, { onConflict: 'project_id,template_key' })
      if (back.error) console.error('projects/routes: the template\'s doc could not be put back', { code: back.error.code })
    }
    return failed('template delete failed', error?.code)
  }
  // Story 7.16c: the revision moves, so a device that holds the deleted doc drops it at its next hydrate (`syncDocs`) and a
  // new template of the same name opens empty there too. The delete has landed either way, so a failure is only logged.
  // Story 7.17 (DW-370): the move names the key it took, so an editor in this browser drops it from its own base
  const moved: Move[] = []
  if (held && !(await syncDocs(sb, id, {}, moved, [key]))) console.error('projects/routes: the revision did not move after a template delete')
  revalidate(id)
  return withMoved({ ok: true, ...(held ? { doc } : {}) }, moved)
}

/**
 * THE TEMPLATE DELETE'S UNDO: the row comes back exactly — its id, name, file and `created_at`, so the list's order is
 * the same — then, when the delete took the canvas's doc (`doc` sent, Story 7.16b), that doc, and then, when the delete
 * took routes with it (`config` sent), the previous config is written, judged with the row counted; a delete that took no
 * route wrote no config, so its Undo writes none either and the stored rows return exactly. The doc comes back FROM THE
 * CLIENT, so it is judged as the sync route judges one before it is written (AD-36): `docSchema`, then `docRefusal`. The row is judged by the naming step before it is written, as every other insert is: its name must
 * still make its file (review, 2026-10-17 — a request is not trusted to carry only what the page sent). A name this
 * project has since DEPLOYED cannot come back (the database's guard, `:1319-1347`); no deploy exists before Story 7.18a,
 * so that is a sentence, not a path.
 */
export async function restoreTemplate(_previous: RoutesResult | null, formData: FormData): Promise<RoutesResult> {
  const id = idOf(formData)
  const row = jsonOf(formData, 'template') as { id?: unknown; name?: unknown; file?: unknown; created_at?: unknown } | undefined
  const previous = formData.has('config') ? jsonOf(formData, 'config') : null
  const sent = formData.has('doc') ? jsonOf(formData, 'doc') : null
  if (!id || !row || previous === undefined || sent === undefined) return couldNot()
  const [template] = templatesOf([{ id: row.id, filename: row.file, display_name: row.name, kind: 'routes' }])
  if (!template || !isUuid(template.id) || typeof row.created_at !== 'string') return couldNot()
  const key = `custom:${template.file}`
  let doc: ProjectDoc | null = null
  if (sent !== null) {
    const parsed = docSchema.safeParse(sent)
    if (!parsed.success || docRefusal(key, parsed.data) !== null) return couldNot()
    doc = parsed.data
  }
  const user = await signedIn()
  const sb = await supabaseServer()
  const ctx = await contextOf(sb, id)
  if (!ctx) return couldNot()
  const known = [...ctx.templates.map((t) => t.file), template.file]
  if (previous !== null && validateRoutes(previous, { templates: known }).length > 0) return couldNot()
  if (!ctx.templates.some((t) => t.id === template.id)) {
    const named = templateName(template.name, { project: ctx.templates.map((t) => t.file), deployed: ctx.deployed })
    if ('error' in named) return named
    if (named.file !== template.file || template.name !== template.name.trim()) return couldNot()
    const { data, error } = await sb
      .from('custom_templates')
      .insert({ id: template.id, project_id: id, user_id: user.id, display_name: template.name, filename: template.file, kind: 'routes', created_at: row.created_at })
      .select('id')
    if (error || !data || data.length === 0) {
      console.error('projects/routes: template restore failed', { code: error?.code })
      return { error: templateWriteRefusal(error, template.file) ?? ROUTES_WORDS.couldNot }
    }
  }
  // Story 7.16c: through `syncDocs`, so a device that dropped the doc when the delete moved the revision takes it back
  const moved: Move[] = []
  if (doc !== null && !(await syncDocs(sb, id, { [key]: doc }, moved))) {
    console.error('projects/routes: the template\'s doc restore failed')
    revalidate(id)
    return couldNot()
  }
  if (previous !== null) {
    const refused = await writeConfig(sb, id, user.id, previous, known)
    if (refused !== null) return withMoved({ error: refused }, moved)
  }
  revalidate(id)
  return withMoved({ ok: true }, moved)
}
