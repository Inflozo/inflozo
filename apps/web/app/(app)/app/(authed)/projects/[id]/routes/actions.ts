'use server'

import { revalidatePath } from 'next/cache'
import {
  parseRoutesConfig, routesYaml, ROUTE_WORDS, templateName, validateRoutes, withoutTemplate, type RoutesConfig,
} from '@inflozo/section-runtime/routes'
import { isUuid, routesPath } from '@/lib/editor'
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
 * that names it; a template's delete writes the config WITHOUT its routes first, then deletes the row; its Undo inserts the
 * row first, then writes the previous config. So no stored config ever names a template that is not there.
 *
 * OUTSIDE THE EDITOR'S LOCK, as Theme settings is (routine call 15): two tabs saving at once, the last write wins.
 * `ponytail:` — a compare-and-set on `routes_config.updated_at` if that is ever seen.
 */

export type RoutesResult = { ok: true } | { error: string }

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

/** What the writes are judged against, read under the caller's session: the project's Routes Manager templates, the
 *  names it has deployed, and the custom canvases that carry a design (`project_templates` under `custom:`). */
async function contextOf(sb: Supabase, id: string): Promise<{ templates: Template[]; deployed: string[]; designed: string[] } | null> {
  const [templates, deployed, designed] = await Promise.all([
    sb.from('custom_templates').select('id, filename, display_name, kind, created_at').eq('project_id', id).eq('kind', 'routes').order('created_at'),
    sb.from('deployed_template_names').select('filename').eq('project_id', id),
    sb.from('project_templates').select('template_key').eq('project_id', id).like('template_key', 'custom:%'),
  ])
  const failed = templates.error ?? deployed.error ?? designed.error
  if (failed) {
    console.error('projects/routes: a read failed', { code: failed.code })
    return null
  }
  return {
    templates: templatesOf(templates.data),
    deployed: (deployed.data ?? []).map((r) => r.filename as string),
    designed: (designed.data ?? []).map((r) => (r.template_key as string).slice('custom:'.length)),
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

/** "+ New template" on its own (R-247's Templates list): the row alone, no route. */
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
  return { ok: true }
}

/**
 * A TEMPLATE'S DELETE: refused while its canvas carries a design (a `project_templates` row for `custom:<file>`, which
 * nothing writes before Story 7.16b; 7.16b builds the warning), else the config WITHOUT every route naming it is written
 * first and the row is deleted second. A failed row delete leaves the template, unrouted — a valid state.
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
  if (ctx.designed.includes(template.file)) return { error: ROUTES_WORDS.hasDesign(template.name) }
  const config = await storedConfig(sb, id)
  if (!config) return couldNot()
  const next = withoutTemplate(config, template.file)
  if (next.collections.length !== config.collections.length || next.routes.length !== config.routes.length) {
    const refused = await writeConfig(sb, id, user.id, next, ctx.templates.map((t) => t.file).filter((f) => f !== template.file))
    if (refused !== null) return { error: refused }
  }
  const { data, error } = await sb.from('custom_templates').delete().eq('id', templateId).eq('project_id', id).select('id')
  if (error || !data || data.length === 0) {
    console.error('projects/routes: template delete failed', { code: error?.code })
    revalidate(id)
    return couldNot()
  }
  revalidate(id)
  return { ok: true }
}

/**
 * THE TEMPLATE DELETE'S UNDO: the row comes back exactly — its id, name, file and `created_at`, so the list's order is
 * the same — and then, when the delete took routes with it (`config` sent), the previous config is written, judged with
 * the row counted; a delete that took no route wrote no config, so its Undo writes none either and the stored rows
 * return exactly. The row is judged by the naming step before it is written, as every other insert is: its name must
 * still make its file (review, 2026-10-17 — a request is not trusted to carry only what the page sent). A name this
 * project has since DEPLOYED cannot come back (the database's guard, `:1319-1347`); no deploy exists before Story 7.18,
 * so that is a sentence, not a path.
 */
export async function restoreTemplate(_previous: RoutesResult | null, formData: FormData): Promise<RoutesResult> {
  const id = idOf(formData)
  const row = jsonOf(formData, 'template') as { id?: unknown; name?: unknown; file?: unknown; created_at?: unknown } | undefined
  const previous = formData.has('config') ? jsonOf(formData, 'config') : null
  if (!id || !row || previous === undefined) return couldNot()
  const [template] = templatesOf([{ id: row.id, filename: row.file, display_name: row.name, kind: 'routes' }])
  if (!template || !isUuid(template.id) || typeof row.created_at !== 'string') return couldNot()
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
  if (previous !== null) {
    const refused = await writeConfig(sb, id, user.id, previous, known)
    if (refused !== null) return { error: refused }
  }
  revalidate(id)
  return { ok: true }
}
