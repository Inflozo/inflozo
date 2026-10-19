// Story 7.18a — the compile's shell (`server/deploy/project-input.ts`) over a fake database holding a real project's stored
// rows, then the REAL compile and both REAL gates: the shell assembles what `tools/pilot-theme.mjs` assembles (the
// library, the pool's files and licences, the modules, Ghost's cards) from the same disk, reads stored rows only (an
// untouched canvas is no doc; a page-2 row is `pageTwo`; an orphan route doc is skipped), and owns every read by `user_id`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { SupabaseClient } from '@supabase/supabase-js'
import { JSDOM } from 'jsdom'
import { compileTheme } from '@inflozo/theme-compiler'
import { GSCAN, gscanGate, preloadChecks, qualityGate } from '@inflozo/theme-compiler/gate'
import { createRequire } from 'node:module'
import { readdirSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defaultContent } from '@inflozo/section-runtime'
import { compileInputOf } from './server/deploy/project-input.ts'
import { pilot } from './lib/pilots.ts'

const P = '00000000-0000-4000-8000-0000000000aa'
const S = '00000000-0000-4000-8000-0000000000bb'
const U = '00000000-0000-4000-8000-0000000000cc'

let n = 0
const at = (designId: string, over: Record<string, unknown> = {}) => ({
  instanceId: `deploy-${String(++n).padStart(2, '0')}-x9q`, layerName: `Layer ${n}`, designId, content: defaultContent(pilot(designId).contentSchema),
  controls: {}, data: {}, darkOverrides: {}, ...over,
})
const doc = (...instances: unknown[]) => ({ schemaVersion: 1, instances })

/** A query builder over fixed rows: every `.eq`/`.is`/`.in`/`.order` is recorded, and the filters a row must carry
 *  (`user_id`) are asserted — so a read that forgot its owner clause fails here. */
function fakeDb(tables: Record<string, unknown>, filters: string[]): SupabaseClient {
  const builder = (table: string) => {
    const seen: string[] = []
    const q = {
      select: () => q,
      eq: (col: string, v: unknown) => (seen.push(`${col}=${String(v)}`), q),
      is: (col: string) => (seen.push(`${col} is`), q),
      in: (col: string) => (seen.push(`${col} in`), q),
      order: (col: string) => (seen.push(`order ${col}`), q),
      maybeSingle: async () => done(),
      then: (resolve: (v: unknown) => void) => resolve(done()),
    }
    const done = () => {
      filters.push(`${table}: ${seen.join(' ')}`)
      return { data: tables[table] ?? null, error: null }
    }
    return q
  }
  return { from: builder } as unknown as SupabaseClient
}

test('a stored project compiles through the shell into a theme both pinned gscans and the quality gate pass — every read owned', async () => {
  const filters: string[] = []
  const home = doc(at('a4/13'), at('a17/1', { isMainFeed: true }))
  const db = fakeDb({
    projects: { id: P, name: 'Field Notes', slug: 'field-notes', dark_enabled: true, posts_per_page: 9, style_pack: { preset: 'paper' }, language: 'en' },
    sites: { id: S, url: 'https://ghost6.inflozo.com', ghost_version: '6.58.0', capability: 'full', site_settings: { members: true } },
    project_templates: [
      { template_key: 'home', doc: home },
      { template_key: 'index', doc: doc(at('a17/1', { isMainFeed: true })) },
      { template_key: 'site', doc: doc(at('a1/1')) },
      // an orphan Routes Manager doc — its template row is gone, so it never ships
      { template_key: 'custom:custom-gone.hbs', doc: doc() },
    ],
    custom_settings: [],
    translation_overrides: [],
    project_treatments: null,
    routes_config: null,
    custom_templates: [],
    deploys: [{ version: '1.0.0', activated: true, activated_at: '2026-10-01T00:00:00Z' }, { version: '2.0.0', activated: false, activated_at: null }],
    project_site_bindings: { theme_name: 'inflozo-field-notes' },
  }, filters)
  const read = await compileInputOf({ projectId: P, siteId: S, userId: U }, db)
  assert.ok(read !== null)
  // every read carries the owner
  for (const f of filters) assert.match(f, new RegExp(`user_id=${U}`), f)
  // …and its own project or site (the review, 2026-10-19): a read that lost that clause would compile another project's rows
  for (const f of filters) assert.match(f, f.startsWith('projects:') ? new RegExp(` id=${P}`) : f.startsWith('sites:') ? new RegExp(` id=${S}`) : new RegExp(`project_id=${P}`), f)
  // every list the staleness hash reads is ORDERED, so unchanged rows read in another order never hash apart
  for (const [table, col] of [['project_templates', 'template_key'], ['custom_settings', 'position'], ['translation_overrides', 'catalog_key']]) {
    assert.ok(filters.some((f) => f.startsWith(`${table}:`) && f.includes(`order ${col}`)), `${table} ordered by ${col}`)
  }
  assert.ok(filters.some((f) => f.startsWith('sites:') && f.includes('disconnected_at is')), 'a disconnected site is no site')
  // stored rows only: Home and the site doc as files, Home's page 2 under its page-1 file, the orphan skipped
  assert.deepEqual(Object.keys(read.input.templates).sort(), ['default.hbs', 'home.hbs'])
  assert.deepEqual(Object.keys(read.input.pageTwo ?? {}), ['home.hbs'])
  assert.equal(read.input.theme.name, 'inflozo-field-notes', 'the binding\'s frozen name')
  assert.equal(read.input.theme.version, '3.0.0', 'n = two uploads + 1')
  assert.deepEqual(read.version, { n: 3, prev: 1 })
  assert.equal(read.input.postsPerPage, 9)
  assert.equal(read.routing.unreadable, false)
  assert.equal(read.input.routes, null, 'Ghost\'s default routing hands no routes file')

  const theme = compileTheme(new JSDOM('<body></body>').window.document, read.input)
  for (const file of ['package.json', 'home.hbs', 'index.hbs', 'default.hbs', 'assets/js/main.js', 'assets/css/cards.css', 'README.md']) assert.ok(Object.hasOwn(theme.files, file), file)
  assert.ok(Object.keys(theme.files).some((f) => f.startsWith('assets/fonts/')), 'the pool\'s files ship')
  assert.ok(Object.keys(theme.files).some((f) => /^LICENSE-.*\.txt$/.test(f) && f !== 'LICENSE-ghost.txt' && f !== 'LICENSE-tabler.txt'), 'a family\'s licence ships')
  assert.equal(JSON.parse(theme.files['package.json'] as string).version, '3.0.0')
  for (const major of [5, 6] as const) {
    const v = await gscanGate(theme.files, major)
    assert.equal(v.errors.length, 0, `gscan at v${major}: ${JSON.stringify(v.errors.map((e) => e.rule))}`)
  }
  const q = qualityGate(theme.files, { pack: read.input.pack, library: read.input.library })
  assert.equal(q.blocked, false, JSON.stringify(q.errors.map((e) => e.code)))
})

test('the routing is read and judged with the rows: an unreadable one is flagged, a stored doc nothing could write throws (ours), a project not the caller\'s is null', async () => {
  const base = {
    projects: { id: P, name: 'N', slug: 'n', dark_enabled: false, posts_per_page: 12, style_pack: null, language: 'en' },
    sites: { id: S, url: 'https://ghost6.inflozo.com', ghost_version: '6.58.0', capability: 'full', site_settings: null },
    project_templates: [], custom_settings: [], translation_overrides: [], custom_templates: [], deploys: [], routes_config: { config: { nonsense: true } },
  }
  const unread = await compileInputOf({ projectId: P, siteId: S, userId: U }, fakeDb(base, []))
  assert.equal(unread?.routing.unreadable, true)
  assert.equal(unread?.input.theme.name, 'inflozo-n', 'no binding yet: inflozo-{slug}')
  await assert.rejects(compileInputOf({ projectId: P, siteId: S, userId: U }, fakeDb({ ...base, project_templates: [{ template_key: 'home', doc: doc(at('a24/1')) }] }, [])), /compiles to/)
  assert.equal(await compileInputOf({ projectId: P, siteId: S, userId: U }, fakeDb({ ...base, projects: null }, [])), null)
  assert.equal(await compileInputOf({ projectId: P, siteId: S, userId: U }, fakeDb({ ...base, sites: null }, [])), null)
})

test('a project with routing hands the compile `routes`, `routed` and `lists` from the one stored routing, and README carries Story 7.17\'s routes step', async () => {
  const config = {
    collections: [{ path: '/notes/', filter: { match: 'any', conditions: [{ field: 'primary_tag', op: 'any', values: ['notes'] }] }, template: 'custom-notes.hbs' }],
    routes: [],
    taxonomies: { tag: 'tag', author: 'author' },
  }
  const db = fakeDb({
    projects: { id: P, name: 'N', slug: 'n', dark_enabled: true, posts_per_page: 12, style_pack: { preset: 'paper' }, language: 'en' },
    sites: { id: S, url: 'https://ghost6.inflozo.com', ghost_version: '6.58.0', capability: 'full', site_settings: null },
    project_templates: [{ template_key: 'custom:custom-notes.hbs', doc: doc(at('a17/1', { isMainFeed: true })) }],
    custom_settings: [], translation_overrides: [], deploys: [],
    custom_templates: [{ id: 't1', filename: 'custom-notes.hbs', display_name: 'Notes', kind: 'routes', created_at: '2026-10-18T00:00:00Z' }],
    routes_config: { config },
  }, [])
  const read = await compileInputOf({ projectId: P, siteId: S, userId: U }, db)
  assert.ok(read !== null)
  assert.deepEqual(read.routing.problems, [])
  assert.deepEqual(read.input.routed, ['custom-notes.hbs'])
  assert.deepEqual(read.input.lists, { 'custom-notes.hbs': ['notes'] })
  assert.match(read.input.routes ?? '', /^collections:\n  \/notes\/:/)
  // R-260: the index's filter in the file lists a post with no primary tag (`routes.ts`' NO_PRIMARY)
  assert.match(read.input.routes ?? '', /posts_tags\.sort_order:0/)
  assert.deepEqual(Object.keys(read.input.templates), ['custom-notes.hbs'])
  assert.deepEqual(read.names, { 'custom-notes': 'Notes' })
  const theme = compileTheme(new JSDOM('<body></body>').window.document, read.input)
  assert.match(theme.files['README.md'] as string, /## Routes/)
  for (const major of [5, 6] as const) assert.equal((await gscanGate(theme.files, major)).errors.length, 0, `v${major}`)
})

const GSCAN_SOURCE = readFileSync(new URL('../../packages/theme-compiler/gate/gscan.ts', import.meta.url), 'utf8')

test('the owner\'s test (2026-10-19): preloadChecks loads EVERY check file of each pinned checker by its literal name — the list and each pin\'s lib/checks/ never part, so the deploy route\'s trace follows every import a check makes', () => {
  const req = createRequire(import.meta.url)
  for (const major of [5, 6] as const) {
    const dir = join(dirname(realpathSync(req.resolve(`${GSCAN[major].pkg}/package.json`))), 'lib', 'checks')
    const files = readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => join(dir, f))
    // the control: a pin with no check files would pass on nothing
    assert.ok(files.length > 10, `${GSCAN[major].pkg} has ${files.length} check files`)
    const loaded = preloadChecks(major)
    assert.equal(loaded.length, files.length, `${GSCAN[major].pkg}: ${loaded.length} preloaded, ${files.length} in lib/checks/`)
    // the NAMES, read from the source the build traces (the review, 2026-10-19): the module cache cannot tell — every gscan
    // run above already required each check itself — but a list that names one file twice and drops another parts here
    const alias = major === 5 ? 'gscan4' : 'gscan6'
    const named = [...GSCAN_SOURCE.matchAll(new RegExp(`require\\('${alias}/lib/checks/([^']+)'\\)`, 'g'))].map((m) => m[1]).sort()
    assert.deepEqual(named, files.map((f) => f.slice(dir.length + 1)).sort(), `${alias}: preloadChecks' literal names are lib/checks/'s`)
  }
})
