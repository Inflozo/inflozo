'use server'

import { revalidatePath } from 'next/cache'
import {
  parseRoutesConfig, routesYaml, ROUTE_WORDS, templateName, validateRoutes, withoutTemplate, type RoutesConfig,
} from '@inflozo/section-runtime/routes'
import { docSchema, type ProjectDoc } from '@inflozo/section-runtime'
import { isUuid, routesPath } from '@/lib/editor'
import { docRefusal } from '@/lib/pilots'
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
 * that names it; a template's delete writes the config WITHOUT its routes first, then deletes its canvas's doc (Story
 * 7.16b), then the row; its Undo inserts the row first, then the doc, then writes the previous config. So no stored config
 * ever names a template that is not there, and no doc outlives its template but for the moment between two writes (which
 * the editor's read and the sync route both treat as no canvas, routine call 11).
 *
 * OUTSIDE THE EDITOR'S LOCK, as Theme settings is (routine call 15): two tabs saving at once, the last write wins.
 * `ponytail:` — a compare-and-set on `routes_config.updated_at` if that is ever seen.
 */

/** `file` — a template just created (Story 7.16b: the Template menu's "New template" opens its canvas); `doc` — the canvas
 *  doc a template's delete took with it, handed back so its Undo can restore it exactly (AD-36: it is judged again then). */
export type RoutesResult = { ok: true; file?: string; doc?: unknown } | { error: string }

type Supabase = Awaited<ReturnType<typeof supabaseServer>>

const couldNot = (): RoutesResult => ({ error: ROUTES_WORDS.couldNot })

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
async function insertTemplate(sb: Supabase, id: string, userId: string, display: unknown, ctx: { templates: Template[]; deployed: string[] }): Promise<{ file: string } | { error: string }> {
  if (typeof display !== 'string') return { error: ROUTE_WORDS.nameEmpty }
  const named = templateName(display, { project: ctx.templates.map((t) => t.file), deployed: ctx.deployed })
  if ('error' in named) return named
  // Story 7.16b's review: a name not in use here has no canvas yet, so whatever an earlier template of that name left is
  // cleared first — a doc the delete's race re-stored (routine call 11), its preview subject and looked-at record — and the
  // new template opens empty, never wearing the old one's sections
  const key = `custom:${named.file}`
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

/**
 * THE WHOLE NEXT CONFIG — every sheet's primary button, every drop, every taxonomy save and every collection, channel or
 * route Undo. With `template_name`, the sheet also named a new template: its file must be the one the config names
 * (`template_file`), the config is judged with it counted BEFORE either write, and the row is written first.
 */
export async function saveRoutes(_previous: RoutesResult | null, formData: FormData): Promise<RoutesResult> {
  const id = idOf(formData)
  const next = jsonOf(formData, 'config')
  if (!id || next === undefined) return couldNot()
  const user = await signedIn()
  const sb = await supabaseServer()
  const ctx = await contextOf(sb, id)
  if (!ctx) return couldNot()
  const display = formData.get('template_name')
  const known = ctx.templates.map((t) => t.file)
  if (display !== null) {
    const named = typeof display === 'string' ? templateName(display, { project: known, deployed: ctx.deployed }) : { error: ROUTE_WORDS.nameEmpty }
    if ('error' in named) return named
    if (named.file !== formData.get('template_file')) return couldNot()
    const problems = validateRoutes(next, { templates: [...known, named.file] })
    if (problems.length > 0) return { error: (problems[0] as { message: string }).message }
    const made = await insertTemplate(sb, id, user.id, display, ctx)
    if ('error' in made) return made
    known.push(made.file)
  }
  const refused = await writeConfig(sb, id, user.id, next, known)
  if (refused !== null) {
    // a template row written before a refused config is a valid state (unrouted) — the page must list it, or a retry of
    // the same sheet is refused as a name it cannot see (review, 2026-10-17)
    if (display !== null) revalidate(id)
    return { error: refused }
  }
  revalidate(id)
  return { ok: true }
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
  const made = await insertTemplate(sb, id, user.id, formData.get('name'), ctx)
  if ('error' in made) return made
  revalidate(id)
  return { ok: true, file: made.file }
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
  revalidate(id)
  return { ok: true, ...(held ? { doc } : {}) }
}

/**
 * THE TEMPLATE DELETE'S UNDO: the row comes back exactly — its id, name, file and `created_at`, so the list's order is
 * the same — then, when the delete took the canvas's doc (`doc` sent, Story 7.16b), that doc, and then, when the delete
 * took routes with it (`config` sent), the previous config is written, judged with the row counted; a delete that took no
 * route wrote no config, so its Undo writes none either and the stored rows return exactly. The doc comes back FROM THE
 * CLIENT, so it is judged as the sync route judges one before it is written (AD-36): `docSchema`, then `docRefusal`. The row is judged by the naming step before it is written, as every other insert is: its name must
 * still make its file (review, 2026-10-17 — a request is not trusted to carry only what the page sent). A name this
 * project has since DEPLOYED cannot come back (the database's guard, `:1319-1347`); no deploy exists before Story 7.18,
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
  if (doc !== null) {
    const { error } = await sb.from('project_templates').upsert({ project_id: id, user_id: user.id, template_key: key, doc }, { onConflict: 'project_id,template_key' })
    if (error) {
      console.error('projects/routes: the template\'s doc restore failed', { code: error.code })
      revalidate(id)
      return couldNot()
    }
  }
  if (previous !== null) {
    const refused = await writeConfig(sb, id, user.id, previous, known)
    if (refused !== null) return { error: refused }
  }
  revalidate(id)
  return { ok: true }
}
