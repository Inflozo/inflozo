import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveStrings, type SectionRegistryEntry } from '@inflozo/library'
import { parseDoc, type ProjectDoc } from '@inflozo/section-runtime'
import { listsOf, parseRoutesConfig, routedOf, routesYaml, validateRoutes, type RouteProblem, type RoutesConfig } from '@inflozo/section-runtime/routes'
import type { CompileInput, CompileSetting } from '@inflozo/theme-compiler'
import { themeNameOf, versionNumber, versionOf } from '../../lib/deploy.ts'
import { canvasOfPageTwoKey, fileOf, fileOfKey, isRouteKey, routeCanvasOf, templateKeyOf } from '../../lib/editor.ts'
import { docRefusal, pilot, pilotIds } from '../../lib/pilots.ts'
import { templatesOf } from '../../lib/routes.ts'
import { cardChunks, chunkUniverse, ORBIT_WEEKLY_DIR, PACKAGES } from '../../lib/style-guide.ts'
import { enginePackOf } from '../../lib/style-pack.ts'

/**
 * STORY 7.18a — THE SHELL THE COMPILE HAS NEVER HAD (AD-1, AD-14): every value `compileTheme` takes, read here, so the
 * compile itself stays pure. `tools/pilot-theme.mjs` was the only full assembly until now; this reads a REAL project the
 * same way, from the same places on disk.
 *
 * IT READS STORED ROWS, NEVER `editorData`'s. The editor's read adds synthesised docs and designates them (`read.ts`), which
 * would change what ships: an untouched canvas is handed in as no doc, and the compile synthesises it itself. Each stored
 * doc passes the editor's own door (`parseDoc`, then `docRefusal`, which the sync route asks before it writes) — a doc
 * either refuses is one nothing in the product could have written, and the throw is Inflozo's own fault.
 *   - A page-2 row routes through `canvasOfPageTwoKey` into `pageTwo` under its page-1 file; `index.hbs` is never a
 *     `templates` key (Home's page 2 is `pageTwo['home.hbs']`).
 *   - Only the CURRENT Routes Manager templates' `custom:` docs ship (7.16b's reading): an orphan route doc is skipped,
 *     as `read.ts` skips it.
 *   - `lists`, `routed` and `routes` come from the same stored routing — `listsOf`, `routedOf`, `routesYaml` — and the
 *     routing is judged first (`validateRoutes` against this project's templates): an unreadable or unfit routing is
 *     handed back for the run to block on, before any compile.
 *
 * EVERY READ IS OWNED: the handed client is the service role (it reads past RLS — `deploy-io.ts`), so each query carries
 * `user_id`, and a project or a site that is not the caller's — or a disconnected site — is no row, and the answer null.
 * The library, the font pool, the modules and Ghost's card files come through `PACKAGES()` (`lib/style-guide.ts`'s one
 * finder, DW-269), the form Turbopack traces into the deployed function.
 */

/** What the compile was handed, and what decides whether a stored artefact is stale (`inputsHash`): every row read. */
export type ProjectRead = {
  input: CompileInput
  /** the rows, as read — `inputsHash`'s input with the release */
  reads: Record<string, unknown>
  routing: { config: RoutesConfig | null; unreadable: boolean; problems: RouteProblem[] }
  site: { url: string; ghost_version: string | null; capability: string; site_settings: unknown }
  version: { n: number; prev: number | null }
  themeName: string
  /** the bound name already claimed in `project_site_bindings`, or null before the first accepted upload */
  bound: string | null
  projectName: string
  /** Story 7.18b — `projects.rtl_ack_at` (FR-Q6): a right-to-left language ships only once acknowledged */
  rtlAckAt: string | null
  /** the Routes Manager templates' display names by canvas, for the plain words */
  names: Record<string, string>
}

const MODULES = () => join(PACKAGES(), 'library', 'modules')
const FONTS = () => join(PACKAGES(), 'library', 'fonts')

/** `packages/library/modules/` by module name — `pilot-theme.mjs`'s `moduleSources`, refusing a stray `.js` the same way. */
function moduleSources(): Record<string, string> {
  const files = readdirSync(MODULES()).filter((f) => f.endsWith('.js')).sort()
  const stray = files.filter((f) => !/^[a-z][a-z0-9-]*\.js$/.test(f))
  if (stray.length > 0) throw new Error(`packages/library/modules/ holds ${stray.join(', ')}, which is no module file name`)
  return Object.fromEntries(files.map((f) => [f.slice(0, -'.js'.length), readFileSync(join(MODULES(), f), 'utf8')]))
}

/** Ghost's vendored card scripts and stylesheets by chunk name, and its licence — `pilot-theme.mjs`'s `ghostCards`. */
function ghostCards(): CompileInput['ghostCards'] {
  const scripts = Object.fromEntries(
    chunkUniverse('js').filter((c) => /^[a-z0-9_]+$/.test(c)).map((c) => [c, readFileSync(join(ORBIT_WEEKLY_DIR(), 'vendor', 'cards', 'js', `${c}.js`), 'utf8')]),
  )
  const styles = Object.fromEntries(Object.entries(cardChunks()).filter(([c]) => /^[a-z0-9_]+$/.test(c)))
  return { scripts, styles, licence: readFileSync(join(ORBIT_WEEKLY_DIR(), 'vendor', 'LICENSE-ghost.txt'), 'utf8') }
}

/** The library as the compile asks it: a design the directory holds, validated and assembled once per read; undefined for
 *  an id it does not hold (the compile then refuses the doc naming it as a stale design, `REFUSAL.staleDesign`). */
function libraryReader(): (id: string) => SectionRegistryEntry | undefined {
  const ids = new Set(pilotIds())
  const held = new Map<string, SectionRegistryEntry>()
  return (id) => {
    if (!ids.has(id)) return undefined
    const known = held.get(id)
    if (known !== undefined) return known
    const entry = pilot(id)
    held.set(id, entry)
    return entry
  }
}

/** A query's error, thrown: every read here is infrastructure, which the run retries once (AD-20). */
function must<T>(answer: { data: T; error: { code?: string } | null }, what: string): T {
  // `infra` marks it for `run.ts`'s retry rule — a doc the editor's door refuses is thrown plain, and is never retried
  if (answer.error) throw Object.assign(new Error(`deploy: ${what} could not be read (${answer.error.code ?? 'error'})`), { infra: true })
  return answer.data
}

/* EVERY LIST READ IS ORDERED (the review, 2026-10-19): Postgres returns rows in no promised order, and the staleness hash
   is over these reads as read — two reads of unchanged rows in another order would hash apart and make Ship it re-compile.
   The settings keep the editor's own order (`read.ts`: position, then created_at), which is the order the compile is handed. */
export async function compileInputOf(a: { projectId: string; siteId: string; userId: string }, db: SupabaseClient): Promise<ProjectRead | null> {
  const { projectId, siteId, userId } = a
  const [project, site, templates, settings, overrides, treatments, routing, customs, deploys, binding] = await Promise.all([
    db.from('projects').select('id, name, slug, dark_enabled, posts_per_page, style_pack, language, rtl_ack_at').eq('id', projectId).eq('user_id', userId).maybeSingle(),
    db.from('sites').select('id, url, ghost_version, capability, site_settings').eq('id', siteId).eq('user_id', userId).is('disconnected_at', null).maybeSingle(),
    db.from('project_templates').select('template_key, doc').eq('project_id', projectId).eq('user_id', userId).order('template_key'),
    db.from('custom_settings').select('key, type, group_name, visibility_condition, bound_to, position').eq('project_id', projectId).eq('user_id', userId).order('position').order('created_at'),
    db.from('translation_overrides').select('catalog_key, value').eq('project_id', projectId).eq('user_id', userId).order('catalog_key'),
    db.from('project_treatments').select('card_designs').eq('project_id', projectId).eq('user_id', userId).maybeSingle(),
    db.from('routes_config').select('config').eq('project_id', projectId).eq('user_id', userId).maybeSingle(),
    db.from('custom_templates').select('id, filename, display_name, kind, created_at').eq('project_id', projectId).eq('user_id', userId).eq('kind', 'routes').order('created_at'),
    db.from('deploys').select('version, activated, activated_at').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).in('status', ['uploaded', 'live']),
    db.from('project_site_bindings').select('theme_name').eq('project_id', projectId).eq('site_id', siteId).eq('user_id', userId).maybeSingle(),
  ])
  const p = must(project, 'the project') as { name: string; slug: string; dark_enabled: boolean; posts_per_page: number; style_pack: unknown; language: string; rtl_ack_at?: string | null } | null
  const s = must(site, 'the site') as { url: string; ghost_version: string | null; capability: string; site_settings: unknown } | null
  if (p === null || s === null) return null
  const rows = (must(templates, 'the templates') ?? []) as { template_key: string; doc: unknown }[]
  const settingRows = (must(settings, 'the custom settings') ?? []) as CompileSetting[]
  const overrideRows = (must(overrides, 'the translations') ?? []) as { catalog_key: string; value: string }[]
  const cardRow = must(treatments, 'the card designs') as { card_designs: unknown } | null
  const routingRow = must(routing, 'the routing') as { config: unknown } | null
  const routeTemplates = templatesOf(must(customs, 'the custom templates') as Parameters<typeof templatesOf>[0])
  const uploads = (must(deploys, 'the deploys') ?? []) as { version: string; activated: boolean; activated_at: string | null }[]
  const bound = (must(binding, 'the binding') as { theme_name: string } | null)?.theme_name ?? null

  // the routing, judged before the compile is asked anything: the same reader and validator the routes page saves through
  const rawRouting = routingRow?.config ?? {}
  const parsed = parseRoutesConfig(rawRouting)
  const files = routeTemplates.map((t) => t.file)
  const problems = validateRoutes(rawRouting, { templates: files })
  const config = parsed.ok ? parsed.config : null

  // the stored docs, through the editor's own door — page 2 into `pageTwo`, orphans skipped
  const current = new Set(routeTemplates.flatMap((t) => {
    const canvas = routeCanvasOf(t.file)
    return canvas === null ? [] : [templateKeyOf(canvas)]
  }))
  const docs: Record<string, ProjectDoc> = {}
  const pageTwo: Record<string, ProjectDoc> = {}
  for (const row of [...rows].sort((x, y) => (x.template_key < y.template_key ? -1 : 1))) {
    const key = row.template_key
    if (isRouteKey(key) && !current.has(key)) continue
    const doc = parseDoc(row.doc, key)
    const refused = docRefusal(key, doc)
    if (refused !== null) throw new Error(refused)
    const paged = canvasOfPageTwoKey(key)
    if (paged !== null) pageTwo[fileOf(paged)] = doc
    else docs[fileOfKey(key)] = doc
  }

  const { pack, pairing } = enginePackOf(p.style_pack)
  const activated = uploads
    .filter((u) => u.activated && typeof u.activated_at === 'string')
    .sort((x, y) => (String(x.activated_at) < String(y.activated_at) ? 1 : -1))[0]
  const prev = activated === undefined ? Number.NaN : versionNumber(activated.version)
  const n = uploads.length + 1
  const themeName = bound ?? themeNameOf(p.slug)
  const lists = config === null ? {} : Object.fromEntries([...listsOf(config)].map(([file, ls]) => [file, ls.map((l) => l.context)]))
  const input: CompileInput = {
    templates: docs,
    pageTwo,
    ...(config === null ? {} : { routed: routedOf(config), lists, routes: routesYaml(config) }),
    library: libraryReader(),
    pack,
    pairing,
    assets: {},
    strings: resolveStrings(Object.fromEntries(overrideRows.map((r) => [r.catalog_key, r.value]))),
    language: p.language,
    postsPerPage: p.posts_per_page,
    theme: { name: themeName, version: versionOf(n), description: p.name },
    ...(cardRow?.card_designs == null ? {} : { cardDesigns: cardRow.card_designs }),
    fonts: (path) => readFileSync(join(FONTS(), path)),
    darkEnabled: p.dark_enabled !== false,
    modules: moduleSources(),
    ghostCards: ghostCards(),
    settings: settingRows,
  }
  return {
    input,
    reads: {
      project: p,
      major: s.ghost_version,
      templates: rows,
      settings: settingRows,
      overrides: overrideRows,
      cards: cardRow?.card_designs ?? null,
      routing: rawRouting,
      customs: files,
      n,
      themeName,
    },
    routing: { config, unreadable: !parsed.ok, problems },
    site: s,
    version: { n, prev: Number.isFinite(prev) ? prev : null },
    themeName,
    bound,
    projectName: p.name,
    rtlAckAt: typeof p.rtl_ack_at === 'string' ? p.rtl_ack_at : null,
    names: Object.fromEntries(routeTemplates.flatMap((t) => {
      const canvas = routeCanvasOf(t.file)
      return canvas === null ? [] : [[canvas, t.name]]
    })),
  }
}
