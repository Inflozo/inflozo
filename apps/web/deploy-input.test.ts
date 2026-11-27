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
import { preflightFacts } from './server/deploy/run.ts'
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

/** A query builder over fixed rows: every `.eq`/`.neq`/`.is`/`.in`/`.order` is recorded, and the filters a row must carry
 *  (`user_id`) are asserted — so a read that forgot its owner clause fails here. A table may be a function of the recorded
 *  filters (Story 7.24: one table read two ways), and a list read of a single row answers it as a list of one. */
type Table = unknown | ((seen: readonly string[], single: boolean) => unknown)
function fakeDb(tables: Record<string, Table>, filters: string[]): SupabaseClient {
  const builder = (table: string) => {
    const seen: string[] = []
    const q = {
      select: () => q,
      eq: (col: string, v: unknown) => (seen.push(`${col}=${String(v)}`), q),
      neq: (col: string, v: unknown) => (seen.push(`${col}!=${String(v)}`), q),
      is: (col: string) => (seen.push(`${col} is`), q),
      in: (col: string) => (seen.push(`${col} in`), q),
      order: (col: string) => (seen.push(`order ${col}`), q),
      maybeSingle: async () => done(true),
      then: (resolve: (v: unknown) => void) => resolve(done(false)),
    }
    const done = (single: boolean) => {
      filters.push(`${table}: ${seen.join(' ')}`)
      const t = tables[table]
      const data = (typeof t === 'function' ? t(seen, single) : t) ?? null
      return { data: !single && data !== null && !Array.isArray(data) ? [data] : data, error: null }
    }
    return q
  }
  return { from: builder } as unknown as SupabaseClient
}

test('a stored project compiles through the shell into a theme both pinned gscans and the quality gate pass — every read owned', async () => {
  const filters: string[] = []
  const home = doc(at('a4/13'), at('a17/1', { isMainFeed: true }))
  const db = fakeDb({
    projects: { id: P, name: 'Field Notes', slug: 'field-notes', dark_enabled: true, posts_per_page: 9, style_pack: { preset: 'paper' }, language: 'en', rtl_ack_at: null },
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
    // Story 7.22 (DW-372): v2–v4's rows were pruned away from this read's view — the number is the highest plus one, never a count
    deploys: [{ version: '1.0.0', activated: true, activated_at: '2026-10-01T00:00:00Z' }, { version: '5.0.0', activated: false, activated_at: null }],
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
  assert.equal(read.input.theme.version, '6.0.0', 'n = the highest upload + 1 (two rows would count 3)')
  assert.deepEqual(read.version, { n: 6, prev: 1 })
  assert.equal(read.input.postsPerPage, 9)
  assert.equal(read.routing.unreadable, false)
  assert.equal(read.input.routes, null, 'Ghost\'s default routing hands no routes file')

  const theme = compileTheme(new JSDOM('<body></body>').window.document, read.input)
  for (const file of ['package.json', 'home.hbs', 'index.hbs', 'default.hbs', 'assets/js/main.js', 'assets/css/cards.css', 'README.md']) assert.ok(Object.hasOwn(theme.files, file), file)
  assert.ok(Object.keys(theme.files).some((f) => f.startsWith('assets/fonts/')), 'the pool\'s files ship')
  assert.ok(Object.keys(theme.files).some((f) => /^LICENSE-.*\.txt$/.test(f) && f !== 'LICENSE-ghost.txt' && f !== 'LICENSE-tabler.txt'), 'a family\'s licence ships')
  assert.equal(JSON.parse(theme.files['package.json'] as string).version, '6.0.0')
  for (const major of [5, 6] as const) {
    const v = await gscanGate(theme.files, major)
    assert.equal(v.errors.length, 0, `gscan at v${major}: ${JSON.stringify(v.errors.map((e) => e.rule))}`)
  }
  const q = qualityGate(theme.files, { pack: read.input.pack, library: read.input.library })
  assert.equal(q.blocked, false, JSON.stringify(q.errors.map((e) => e.code)))

  // Story 7.18b — the facts Pre-flight's warning rows read, off the REAL compile
  const facts = preflightFacts(theme)
  assert.deepEqual(facts.templates, Object.keys(theme.files).filter((f) => f.endsWith('.hbs')), 'every .hbs, in the files\' order')
  for (const file of ['default.hbs', 'home.hbs', 'index.hbs', 'post.hbs']) assert.ok(facts.templates.includes(file), file)
  assert.deepEqual(Object.keys(facts.custom ?? {}), ['color_scheme', 'dark_accent_color', 'dark_logo'], 'config.custom as emitted: the three built-ins')
  assert.deepEqual(facts.custom, JSON.parse(theme.files['package.json'] as string).config.custom)
  assert.deepEqual(facts.noindex, theme.noindex)
  // A1 #1's Subscribe and A4 #13's default Sign up both ship behind the free flag; a file without it is never listed
  assert.ok(facts.freeAsks.length > 0)
  for (const file of facts.templates) assert.equal(facts.freeAsks.includes(file), (theme.files[file] as string).includes('@site.allow_self_signup'), file)
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

test('7.24: unbound, with the base held on the same Ghost by another account\'s project — package.json and the zip\'s name carry -2, and the name rides the staleness reads', async () => {
  const filters: string[] = []
  const OTHER_SITE = '00000000-0000-4000-8000-0000000000dd'
  const db = fakeDb({
    projects: { id: P, name: 'Name test', slug: 'name-test', dark_enabled: false, posts_per_page: 12, style_pack: null, language: 'en' },
    // Pre-flight's own site read and the held read's ownership read answer this account's row; the read by address both records
    sites: (seen: readonly string[]) => (seen.some((f) => f.startsWith('url=')) ? [{ id: S }, { id: OTHER_SITE }] : { id: S, url: 'https://ghost6.inflozo.com', ghost_version: '6.58.0', capability: 'full', site_settings: null }),
    // this project × site: no binding yet; every other project's on that Ghost: another account's `inflozo-name-test`
    project_site_bindings: (_seen: readonly string[], single: boolean) => (single ? null : [{ theme_name: 'inflozo-name-test' }]),
    project_templates: [], custom_settings: [], translation_overrides: [], custom_templates: [], deploys: [], routes_config: null,
  }, filters)
  const read = await compileInputOf({ projectId: P, siteId: S, userId: U }, db)
  assert.ok(read !== null)
  assert.equal(read.themeName, 'inflozo-name-test-2', 'the deploy row\'s theme_name — the zip is uploaded as `${theme_name}.zip` (VERIFY 30)')
  assert.equal(read.input.theme.name, 'inflozo-name-test-2')
  assert.equal(read.reads.themeName, 'inflozo-name-test-2', 'a name that moves makes the stored artefact stale')
  assert.equal(read.bound, null)
  // the held read: the caller's own site first, then every record at its address, then the other projects' bindings there
  assert.ok(filters.includes(`sites: id=${S} user_id=${U}`), filters.join('\n'))
  assert.ok(filters.includes('sites: url=https://ghost6.inflozo.com'))
  assert.ok(filters.includes(`project_site_bindings: site_id in project_id!=${P}`))
  const theme = compileTheme(new JSDOM('<body></body>').window.document, read.input)
  assert.equal(JSON.parse(theme.files['package.json'] as string).name, 'inflozo-name-test-2')
})

test('7.24: bound with no deploy row left and the base held elsewhere — the frozen name, and no held read at all', async () => {
  const filters: string[] = []
  const db = fakeDb({
    projects: { id: P, name: 'Renamed test', slug: 'name-test', dark_enabled: false, posts_per_page: 12, style_pack: null, language: 'en' },
    sites: (seen: readonly string[]) => (seen.some((f) => f.startsWith('url=')) ? [{ id: S }] : { id: S, url: 'https://ghost6.inflozo.com', ghost_version: '6.58.0', capability: 'full', site_settings: null }),
    project_site_bindings: (_seen: readonly string[], single: boolean) => (single ? { theme_name: 'inflozo-name-test' } : [{ theme_name: 'inflozo-name-test' }]),
    project_templates: [], custom_settings: [], translation_overrides: [], custom_templates: [], deploys: [], routes_config: null,
  }, filters)
  const read = await compileInputOf({ projectId: P, siteId: S, userId: U }, db)
  assert.equal(read?.themeName, 'inflozo-name-test', 'the binding is the authority, whatever is pruned or held')
  assert.equal(read?.input.theme.name, 'inflozo-name-test', 'no deploy row read, and the name still comes from the binding alone')
  assert.ok(!filters.some((f) => f.includes('url=') || f.includes('!=')), `no held read: ${filters.join(' | ')}`)
})

test('7.24: frozen on one site, a first ship to ANOTHER site resolves afresh there — the binding is per project × site', async () => {
  // the project froze `inflozo-name-test-2` on S (suffixed there); S2 is another Ghost where nothing is held
  const S2 = '00000000-0000-4000-8000-0000000000dd'
  const filters: string[] = []
  const db = fakeDb({
    projects: { id: P, name: 'Name test', slug: 'name-test', dark_enabled: false, posts_per_page: 12, style_pack: null, language: 'en' },
    sites: (seen: readonly string[]) => (seen.some((f) => f.startsWith('url=')) ? [{ id: S2 }] : { id: S2, url: 'https://other.example.com', ghost_version: '6.58.0', capability: 'full', site_settings: null }),
    // the row lives at S, as a table would answer: a read filtered to another site misses it, an unfiltered one finds it
    project_site_bindings: (seen: readonly string[], single: boolean) => (single ? (seen.some((f) => f.startsWith('site_id=') && f !== `site_id=${S}`) ? null : { theme_name: 'inflozo-name-test-2' }) : []),
    project_templates: [], custom_settings: [], translation_overrides: [], custom_templates: [], deploys: [], routes_config: null,
  }, filters)
  const read = await compileInputOf({ projectId: P, siteId: S2, userId: U }, db)
  assert.equal(read?.bound, null, 'no binding on S2')
  assert.equal(read?.themeName, 'inflozo-name-test', 'resolved afresh for S2\'s address, never carried over from S')
  assert.ok(filters.includes('sites: url=https://other.example.com'), 'the held read is S2\'s address')
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
