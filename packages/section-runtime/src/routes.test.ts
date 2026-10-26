import { test } from 'node:test'
import assert from 'node:assert/strict'
import nql6 from '@tryghost/nql'
import nql5 from 'nql5'
import { load } from 'js-yaml'
import {
  contextOf, CONTEXT_RE, dayAfter, DEFAULT_TAXONOMIES, emittedProblem, EMPTY_ROUTES, isCalendarDate, filterNql, filterProblem, ghostLabel, holderOf, holdsFor, homeList,
  indexFilter, indexNode, listsOf, NO_PRIMARY, nodeOf, parseRoutesConfig, pathsUsing, PATH_RE, readNql, RESERVED_SEGMENTS, ROUTE_WORDS, routedOf, routeList, routesYaml, templateName,
  unlistedPosts, validateRoutes, withoutTemplate, writeNql, yamlLines, type Cond, type Filter, type Node, type RoutesConfig,
} from './routes.ts'
import { MEMBERSHIP_FILES } from '@inflozo/library'
import { RELATIVE, ROUTES_FIXTURES } from './routes-fixtures.ts'

// STORY 7.16a — the Routes Manager's one module, held: every I/O row of the spec, every emitted filter through BOTH majors'
// own NQL (Ghost 6.58.0's @tryghost/nql 0.13.4 over nql-lang 0.7.0; 5.130.6's 0.12.7 over 0.6.3 — `pnpm-workspace.yaml`'s
// override pins the lang Ghost 5's yarn.lock resolves), bare and as Ghost wraps it, `readNql` agreeing with Ghost's parser on
// every fixture, every file through js-yaml 4.3.0 (Ghost 6.58.0's own), and each refusal behind a passing control.

const KNOWN = { templates: ['custom-tutorials.hbs', 'custom-craft-list.hbs', 'custom-field-notes-list.hbs', 'custom-notes.hbs', 'custom-quiet.hbs', 'custom-picks.hbs', 'custom-reading-list.hbs', 'custom-landing.hbs', 'custom-fresh.hbs'] }
const tag = (...values: string[]): Cond => ({ field: 'tag', op: 'any', values })
const config = (over: Partial<RoutesConfig>): RoutesConfig => ({ ...EMPTY_ROUTES, taxonomies: { ...DEFAULT_TAXONOMIES }, ...over })
const tutorials = config({ collections: [{ path: '/tutorials/', filter: { match: 'any', conditions: [tag('tutorials')] }, template: 'custom-tutorials.hbs', limit: 10 }] })

/* ───────────────────────────── the I/O matrix ───────────────────────────── */

test('Default: {} and Ghost\'s default routing emit nothing, and nothing is wrong', () => {
  for (const raw of [{}, { collections: [], routes: [] }, EMPTY_ROUTES]) {
    const parsed = parseRoutesConfig(raw)
    assert.ok(parsed.ok)
    assert.equal(routesYaml(parsed.config), null)
    assert.deepEqual(validateRoutes(raw, KNOWN), [])
  }
  // control: a taxonomy moved off its default is not the default, so a file is written
  assert.notEqual(routesYaml(config({ taxonomies: { tag: 'topic', author: 'author' } })), null)
})

test('One collection: its own block with permalink, template, filter and limit — then `/` last, carrying the inverse', () => {
  assert.equal(routesYaml(tutorials), [
    'collections:',
    '  /tutorials/:',
    '    permalink: /tutorials/{slug}/',
    '    template: custom-tutorials',
    '    filter: "tag:\'tutorials\'"',
    '    limit: 10',
    '  /:',
    '    permalink: /{slug}/',
    '    template: index',
    '    filter: "tag:-\'tutorials\'"',
    '',
    'routes:',
    '',
    'taxonomies:',
    '  tag: /tag/{slug}/',
    '  author: /author/{slug}/',
    '',
  ].join('\n'))
})

test('Collection order: yours first in your order, `/` last with sibling groups only — never ((', () => {
  const two = ROUTES_FIXTURES[1]!.config
  const file = load(routesYaml(two) as string) as { collections: Record<string, unknown> }
  assert.deepEqual(Object.keys(file.collections), ['/craft/', '/field-notes/', '/'])
  const inverse = indexFilter(two.collections) as string
  assert.equal(inverse, "(tag:-'craft',featured:false)+(tag:-'field-notes',feature_image:null)")
  assert.doesNotMatch(inverse, /\(\(/)
  // reordering is the array: the inverse follows
  assert.equal(indexFilter([...two.collections].reverse()), "(tag:-'field-notes',feature_image:null)+(tag:-'craft',featured:false)")
})

test('Single condition / Any: no parentheses anywhere, and never one group wrapped whole', () => {
  const one = { match: 'all' as const, conditions: [tag('news')] }
  assert.equal(filterNql(one), "tag:'news'")
  assert.equal(filterNql({ ...one, match: 'any' }), "tag:'news'")
  // a single All collection's inverse is an Any of two, with no parentheses, since it stands alone
  assert.equal(indexFilter([{ path: '/x/', filter: { match: 'all', conditions: [tag('a'), { field: 'featured', is: true }] }, template: 'custom-x.hbs' }]), "tag:-'a',featured:false")
})

test('Multi-value: any of / none of two, and one value bare', () => {
  assert.equal(filterNql({ match: 'any', conditions: [tag('a', 'b')] }), "tag:['a','b']")
  assert.equal(filterNql({ match: 'any', conditions: [{ field: 'tag', op: 'none', values: ['a', 'b'] }] }), "tag:-['a','b']")
  assert.equal(filterNql({ match: 'any', conditions: [tag('a')] }), "tag:'a'")
  // "all of" two tags is two conditions joined by + — never tag:[a+b], which the two majors read as different queries
  // ($and on 0.13.4, $all on 0.12.7 — executed at Dev) and which throws with one-letter values on both
  assert.equal(filterNql({ match: 'all', conditions: [tag('a'), tag('b')] }), "tag:'a'+tag:'b'")
})

test('Channel: under routes:, controller then template then filter, and no limit unless set', () => {
  const c = config({ routes: [{ path: '/reading-list/', channel: { match: 'any', conditions: [{ field: 'published_at', op: '>', at: { ago: 30, unit: 'd' } }] }, template: 'custom-reading-list.hbs' }] })
  const file = load(routesYaml(c) as string) as { routes: Record<string, Record<string, unknown>> }
  assert.deepEqual(file.routes['/reading-list/'], { controller: 'channel', template: 'custom-reading-list', filter: 'published_at:>now-30d' })
  const limited = config({ routes: [{ ...(c.routes[0] as object), limit: 4 } as RoutesConfig['routes'][number]] })
  assert.equal((load(routesYaml(limited) as string) as { routes: Record<string, { limit: number }> }).routes['/reading-list/']?.limit, 4)
})

test('Static route: `/landing/: custom-landing`, statics before channels', () => {
  const c = config({ routes: [
    { path: '/feed-of-x/', channel: { match: 'any', conditions: [tag('x')] }, template: 'custom-x.hbs' },
    { path: '/landing/', template: 'custom-landing.hbs' },
  ] })
  const text = routesYaml(c) as string
  assert.match(text, /^ {2}\/landing\/: custom-landing$/m)
  assert.ok(text.indexOf('/landing/') < text.indexOf('/feed-of-x/'), 'statics first, then channels')
})

test('Taxonomy: a tag prefix and the default author', () => {
  const file = load(routesYaml(config({ taxonomies: { tag: 'topic', author: 'author' } })) as string) as { taxonomies: unknown }
  assert.deepEqual(file.taxonomies, { tag: '/topic/{slug}/', author: '/author/{slug}/' })
})

test('Path collision: two of {collection, channel, route, taxonomy prefix} on one segment are refused, naming both', () => {
  const col = { path: '/craft/', filter: { match: 'any' as const, conditions: [tag('craft')] }, template: 'custom-craft-list.hbs' }
  const cases: [RoutesConfig, string][] = [
    [config({ collections: [col, { ...col }] }), ROUTE_WORDS.taken('/craft/', 'a collection')],
    [config({ collections: [col], routes: [{ path: '/craft/', template: 'custom-landing.hbs' }] }), ROUTE_WORDS.taken('/craft/', 'a collection')],
    [config({ routes: [{ path: '/craft/', template: 'custom-landing.hbs' }, { path: '/craft/', channel: { match: 'any', conditions: [] }, template: 'custom-landing.hbs' }] }), ROUTE_WORDS.taken('/craft/', 'a custom route')],
    [config({ collections: [col], taxonomies: { tag: 'craft', author: 'author' } }), ROUTE_WORDS.taken('/craft/', 'a collection')],
    [config({ taxonomies: { tag: 'people', author: 'people' } }), ROUTE_WORDS.taken('/people/', 'your tag addresses')],
  ]
  for (const [c, sentence] of cases) assert.ok(validateRoutes(c, KNOWN).some((p) => p.message === sentence), sentence)
  // control: the same things on their own segments
  assert.deepEqual(validateRoutes(config({ collections: [col], routes: [{ path: '/landing/', template: 'custom-landing.hbs' }], taxonomies: { tag: 'topic', author: 'people' } }), KNOWN), [])
})

test('holderOf: the sheet names what is ALREADY on a path, whichever kind claims first (review, 2026-10-17)', () => {
  const col = { path: '/craft/', filter: { match: 'any' as const, conditions: [tag('craft')] }, template: 'custom-craft-list.hbs' }
  const has = config({ collections: [col], routes: [{ path: '/landing/', template: 'custom-landing.hbs' }, { path: '/picks/', channel: { match: 'any', conditions: [] }, template: 'custom-picks.hbs' }], taxonomies: { tag: 'topic', author: 'author' } })
  // a NEW collection on a route's path: the validator alone says "already a collection" (collections claim first) — the
  // reason the sheet asks holderOf — and holderOf names the route that is there
  const added = { ...has, collections: [...has.collections, { ...col, path: '/landing/' }] }
  assert.ok(validateRoutes(added, KNOWN).some((p) => p.message === ROUTE_WORDS.taken('/landing/', 'a collection')))
  assert.equal(holderOf(has, '/landing/'), 'a custom route')
  assert.equal(holderOf(has, '/picks/'), 'a channel')
  assert.equal(holderOf(has, '/craft/'), 'a collection')
  assert.equal(holderOf(has, '/topic/'), 'your tag addresses')
  // an edit is not its own holder; the controls: a free path, and the edited item's own path under `except`
  assert.equal(holderOf(has, '/fresh/'), null)
  assert.equal(holderOf(has, '/landing/', 'routes.0.path'), null)
  assert.equal(holderOf(has, '/craft/', 'collections.0.path'), null)
  assert.equal(holderOf(has, '/landing/', 'collections.0.path'), 'a custom route')
})

test('Reserved segment: each address Ghost keeps is refused with its reason; a taxonomy keeps its own default', () => {
  for (const segment of ['page', 'index', 'home', 'tag', 'author', 'rss', 'ghost', 'paged', 'post', 'private', 'search', 'p', 'members', 'assets', 'content']) {
    assert.ok(RESERVED_SEGMENTS[segment], segment)
    const c = config({ routes: [{ path: `/${segment}/`, template: 'custom-landing.hbs' }] })
    assert.deepEqual(validateRoutes(c, KNOWN).map((p) => p.message), [ROUTE_WORDS.reserved(`/${segment}/`, RESERVED_SEGMENTS[segment] as string)], segment)
  }
  assert.ok(validateRoutes(config({ taxonomies: { tag: 'author', author: 'writer' } }), KNOWN).some((p) => p.at === 'taxonomies.tag'))
  // controls: the near neighbours are free, and each taxonomy may stand at its own default
  // `constructor` is a key of every object's prototype, never one of Ghost's addresses (review, 2026-10-17)
  for (const free of ['pages', 'indexes', 'homes', 'tags', 'authors', 'constructor']) assert.deepEqual(validateRoutes(config({ routes: [{ path: `/${free}/`, template: 'custom-landing.hbs' }] }), KNOWN), [], free)
  assert.deepEqual(validateRoutes(config({ taxonomies: { tag: 'tag', author: 'author' } }), KNOWN), [])
})

test('(7.18a, DW-369) a collection or a channel at /paged/, /index/, /tag/ or /author/ is refused with its reason, as a route is', () => {
  const kinds = {
    collection: (path: string) => config({ collections: [{ path, filter: { match: 'any', conditions: [tag('x')] }, template: 'custom-tutorials.hbs' }] }),
    channel: (path: string) => config({ routes: [{ path, channel: { match: 'any', conditions: [tag('x')] }, template: 'custom-reading-list.hbs' }] }),
  }
  for (const [kind, at] of Object.entries(kinds)) {
    for (const segment of ['paged', 'index', 'tag', 'author']) {
      const problems = validateRoutes(at(`/${segment}/`), KNOWN)
      assert.deepEqual(problems.map((p) => p.message), [ROUTE_WORDS.reserved(`/${segment}/`, RESERVED_SEGMENTS[segment] as string)], `${kind} at /${segment}/`)
      assert.equal(problems[0]?.at, kind === 'collection' ? 'collections.0.path' : 'routes.0.path')
    }
    // the control: the same kind on a free path
    assert.deepEqual(validateRoutes(at('/notes/'), KNOWN), [], `${kind} at /notes/`)
  }
})

test('Unknown template: S9b names its line; a membership file is never a route\'s', () => {
  const c = config({ routes: [{ path: '/landing/', template: 'custom-gone.hbs' }] })
  const [problem] = validateRoutes(c, KNOWN)
  assert.equal(problem?.message, ROUTE_WORDS.unknownTemplate('custom-gone.hbs'))
  assert.equal(yamlLines(c)[(problem?.line as number) - 1]?.text, '  /landing/: custom-gone')
  const membership = config({ routes: [{ path: '/join/', template: MEMBERSHIP_FILES[0] as string }] })
  assert.equal(validateRoutes(membership, { templates: [...KNOWN.templates, MEMBERSHIP_FILES[0] as string] }).length, 1)
  // control: a known template
  assert.deepEqual(validateRoutes(config({ routes: [{ path: '/landing/', template: 'custom-landing.hbs' }] }), KNOWN), [])
})

test('Naming: §7.4\'s slug, the file and Ghost\'s label — and each refusal with its reason', () => {
  assert.deepEqual(templateName('Field Notes List'), { file: 'custom-field-notes-list.hbs', label: 'Field Notes List' })
  assert.deepEqual(templateName('  Café  au_lait!! '), { file: 'custom-cafe-au-lait.hbs', label: 'Cafe Au Lait' })
  assert.equal(ghostLabel('custom-long-read.hbs'), 'Long Read')
  assert.equal(ghostLabel('custom-2026-notes.hbs'), '2026 Notes')
  const refused: [string, string, Parameters<typeof templateName>[1]?][] = [
    ['', ROUTE_WORDS.nameEmpty],
    ['   ', ROUTE_WORDS.nameEmpty],
    ['!!!', ROUTE_WORDS.nameNothing],
    ['Home', ROUTE_WORDS.nameReserved('Home')],
    ['robots', ROUTE_WORDS.nameReserved('robots')],
    ['x'.repeat(61), ROUTE_WORDS.nameLong],
    ['Signup', ROUTE_WORDS.nameTaken('Signup')],
    ['Member Home', ROUTE_WORDS.nameTaken('Member Home')],
    ['Landing', ROUTE_WORDS.nameTaken('Landing'), { project: ['custom-landing.hbs'] }],
    ['landing', ROUTE_WORDS.nameTaken('Landing'), { project: ['custom-landing.hbs'] }],
    ['Old Page', ROUTE_WORDS.nameDeployed('custom-old-page.hbs'), { deployed: ['custom-old-page.hbs'] }],
    // within the 60-character name, NFKD can still grow the stem past Ghost's 100 (`ﬃ` is three letters)
    ['ﬃ'.repeat(40), ROUTE_WORDS.nameStemLong],
  ]
  for (const [name, sentence, taken] of refused) assert.deepEqual(templateName(name, taken), { error: sentence }, name)
  // controls: the same names made legal
  assert.ok('file' in templateName('Homepage'))
  assert.ok('file' in templateName('Landing', { project: ['custom-other.hbs'] }))
  assert.ok('file' in templateName('x'.repeat(60)))
  assert.ok('file' in templateName('ﬃ'.repeat(31)), 'a 93-letter stem is custom-{93}, Ghost\'s 100 exactly')
})

test('Relative date in a collection: refused (R-246) — the same term in a channel, and an exact date, are not', () => {
  const rolling: Cond = { field: 'published_at', op: '>', at: { ago: 30, unit: 'd' } }
  const c = config({ collections: [{ path: '/latest/', filter: { match: 'any', conditions: [rolling] }, template: 'custom-tutorials.hbs' }] })
  assert.deepEqual(validateRoutes(c, KNOWN).map((p) => p.message), [ROUTE_WORDS.relative])
  assert.equal(filterProblem({ match: 'any', conditions: [rolling] }, 'collection'), ROUTE_WORDS.relative)
  // controls
  assert.equal(filterProblem({ match: 'any', conditions: [rolling] }, 'channel'), null)
  const exact = config({ collections: [{ path: '/latest/', filter: { match: 'any', conditions: [{ field: 'published_at', op: '>', at: { date: '2026-01-01' } }] }, template: 'custom-tutorials.hbs' }] })
  assert.deepEqual(validateRoutes(exact, KNOWN), [])
})

test('An exact date means the whole day: "after" and "on or before" are written by the next day, the other two as chosen', () => {
  const at = (op: '>' | '>=' | '<' | '<=', date: string): Filter => ({ match: 'all', conditions: [{ field: 'published_at', op, at: { date } }] })
  assert.equal(filterNql(at('>', '2026-01-01')), "published_at:>='2026-01-02'")
  assert.equal(filterNql(at('>=', '2026-01-01')), "published_at:>='2026-01-01'")
  assert.equal(filterNql(at('<', '2026-01-01')), "published_at:<'2026-01-01'")
  assert.equal(filterNql(at('<=', '2026-01-01')), "published_at:<'2026-01-02'")
  // the inverse flips the tree, so it stays the whole day: not after Jan 1 is before Jan 2
  assert.equal(indexFilter([{ path: '/x/', filter: at('>', '2026-01-01'), template: 'custom-x.hbs' }]), "published_at:<'2026-01-02'")
  assert.equal(indexFilter([{ path: '/x/', filter: at('<=', '2026-01-01'), template: 'custom-x.hbs' }]), "published_at:>='2026-01-02'")
  // the stored model is untouched — the words stay the customer's
  const f = at('>', '2026-01-01')
  filterNql(f)
  assert.deepEqual(f.conditions[0], { field: 'published_at', op: '>', at: { date: '2026-01-01' } })
  // and the round trip holds on what is written
  assert.equal(emittedProblem(filterNql(f), nodeOf(f) as Node), null)
})

test('dayAfter: month and year ends and 29 February, by arithmetic', () => {
  for (const [d, next] of [['2025-12-31', '2026-01-01'], ['2026-01-31', '2026-02-01'], ['2024-02-28', '2024-02-29'], ['2024-02-29', '2024-03-01'], ['2026-02-28', '2026-03-01'],
    ['2100-02-28', '2100-03-01'], ['2000-02-28', '2000-02-29'], ['2026-04-30', '2026-05-01'], ['2026-06-15', '2026-06-16'], ['9997-12-31', '9998-01-01']] as const) {
    assert.equal(dayAfter(d), next, d)
    assert.ok(isCalendarDate(next), next)
  }
  // the controls: not a date, and a date the grammar refuses
  assert.throws(() => dayAfter('2026-02-30'))
  assert.throws(() => dayAfter('2026-1-1'))
  assert.equal(isCalendarDate('9999-12-31'), false, 'a year past 9998 is not stored, so the next day of every stored date has four digits')
  assert.equal(dayAfter('9998-12-31'), '9999-01-01')
})

test('A collection needs a condition; a channel may have none', () => {
  const empty = { match: 'all' as const, conditions: [] }
  assert.deepEqual(validateRoutes(config({ collections: [{ path: '/all/', filter: empty, template: 'custom-tutorials.hbs' }] }), KNOWN).map((p) => p.message), [ROUTE_WORDS.noCondition])
  assert.equal(filterProblem(empty, 'collection'), ROUTE_WORDS.noCondition)
  // control
  assert.deepEqual(validateRoutes(config({ routes: [{ path: '/all/', channel: empty, template: 'custom-tutorials.hbs' }] }), KNOWN), [])
  assert.doesNotMatch(routesYaml(config({ routes: [{ path: '/all/', channel: empty, template: 'custom-tutorials.hbs' }] })) as string, /filter/)
})

test('Hostile values (AD-36): refused by the grammar, so nothing reaches the YAML — and a sound config emits', () => {
  const col = (over: object) => ({ collections: [{ path: '/x/', filter: { match: 'any', conditions: [tag('x')] }, template: 'custom-x.hbs', ...over }] })
  const hostile: unknown[] = [
    col({ path: '/x:y/' }), col({ path: '/x/\n/y/' }), col({ path: '/a/b/' }), col({ path: 'x' }),
    col({ filter: { match: 'any', conditions: [tag("x'+tag:y")] } }), col({ filter: { match: 'any', conditions: [tag('x"y')] } }),
    col({ filter: { match: 'any', conditions: [tag('x\\y')] } }), col({ template: '../x' }), col({ template: 'custom-x.hbs/../../y' }),
    col({ template: 'index.hbs' }), col({ limit: 'abc' }), col({ limit: 0 }), col({ limit: 101 }), col({ limit: 2.5 }),
    col({ data: { x: 'tag.y' } }), col({ order: 'title asc' }), col({ rss: false }),
    { collections: [], routes: [{ path: '/x/', template: 'custom-x.hbs', content_type: 'text/html' }] },
    { taxonomies: { tag: 'x/y', author: 'author' } }, { taxonomies: { tag: 'tag', author: 'author', site: 'x' } },
    col({ filter: { match: 'any', conditions: [{ field: 'published_at', op: '>', at: { date: '2026-02-30' } }] } }),
    col({ filter: { match: 'any', conditions: [{ field: 'published_at', op: '>', at: { date: "2026-01-01'+tag:'x" } }] } }),
    col({ filter: { match: 'any', conditions: [{ field: 'published_at', op: '!', at: { ago: 3, unit: 'd' } }] } }),
    col({ filter: { match: 'any', conditions: [{ field: 'visibility', op: 'any', values: ['tiers'] }] } }),
    col({ filter: { match: 'any', conditions: [{ field: 'slug', op: 'any', values: ['x'] }] } }),
    null, 'collections:', 42, [],
  ]
  for (const raw of hostile) {
    const parsed = parseRoutesConfig(raw)
    assert.equal(parsed.ok, false, JSON.stringify(raw))
    const problems = validateRoutes(raw, KNOWN)
    assert.equal(problems.length, 1, JSON.stringify(raw))
    assert.equal(problems[0]?.line, 1)
  }
  // the control: the same shape, sound, parses and emits
  const sound = parseRoutesConfig({ ...col({}), routes: [], taxonomies: { ...DEFAULT_TAXONOMIES } })
  assert.ok(sound.ok)
  assert.match(routesYaml(sound.config) as string, /filter: "tag:'x'"/)
})

test('The emitter asserts its scalar: a filter that could carry " or \\ is never written (AD-36)', () => {
  // past the grammar on purpose — the emitter's own assertion is the second floor
  const forged = { ...EMPTY_ROUTES, collections: [{ path: '/x/', filter: { match: 'any', conditions: [tag('a"b')] }, template: 'custom-x.hbs' }] } as RoutesConfig
  assert.throws(() => routesYaml(forged), /double-quoted YAML scalar/)
})

test('The parenthesis plant: every way of nesting or wrapping is refused on the emitted string; the true string passes', () => {
  const two: Node = { join: ',', of: [tag('a'), tag('b')] }
  const planted: [string, Node][] = [
    ["((tag:'a',tag:'b'))", two], // a group that is the sole content of another
    ["(tag:'a',tag:'b')", two], // one group wrapped whole — Ghost wraps it again: ((…))+type:post
    ["(tag:'a')+featured:true", { join: '+', of: [tag('a'), { field: 'featured', is: true }] }], // a one-child group
    ["tag:'a'+(tag:'b'+featured:true)", { join: '+', of: [tag('a'), tag('b'), { field: 'featured', is: true }] }], // same join nested
    ["tag:'a'+tag:'b',featured:true", { join: '+', of: [tag('a'), tag('b')] }], // + and , mixed at one level
    ['tag:[a+b]', tag('a', 'b')], // the bracketed all-of form, read differently by each major
    ["tag:'a',tag:'b'", { join: '+', of: [tag('a'), tag('b')] }], // reads, but as a different filter
    ["tag:'a\"'", tag('a"')],
  ]
  for (const [emitted, node] of planted) assert.notEqual(emittedProblem(emitted, node), null, emitted)
  // controls: what the builder writes reads back as exactly what it meant
  assert.equal(emittedProblem("tag:'a',tag:'b'", two), null)
  assert.equal(emittedProblem("(tag:-'a',featured:false)+tag:-'b'", { join: '+', of: [{ join: ',', of: [{ field: 'tag', op: 'none', values: ['a'] }, { field: 'featured', is: false }] }, { field: 'tag', op: 'none', values: ['b'] }] }), null)
})

test('Determinism: the same config writes the same bytes, and the module touches no clock', () => {
  for (const { config: c } of ROUTES_FIXTURES) assert.equal(routesYaml(structuredClone(c)), routesYaml(c))
})

test('Deleting: a template\'s routes are listed and removed together; routedOf lists what a route names', () => {
  const c = ROUTES_FIXTURES[4]!.config
  assert.deepEqual(pathsUsing(c, 'custom-reading-list.hbs'), ['/reading-list/', '/featured/'])
  const left = withoutTemplate(c, 'custom-reading-list.hbs')
  assert.deepEqual(left.routes.map((r) => r.path), ['/landing/'])
  assert.deepEqual(routedOf(c), ['custom-landing.hbs', 'custom-picks.hbs', 'custom-reading-list.hbs'])
  assert.deepEqual(validateRoutes(left, KNOWN), [])
})

/* ───────────────────────────── Ghost's own NQL, both majors ───────────────────────────── */

// Ghost's in-memory ownership match (`core/server/services/url/router-filter.js` on 6.58.0): the key expansions it compiles
// every routes.yaml filter with, read in source and restated here because a test may not import Ghost
const EXPANSIONS = [
  { key: 'author', replacement: 'authors.slug' },
  { key: 'tags', replacement: 'tags.slug' },
  { key: 'tag', replacement: 'tags.slug' },
  { key: 'authors', replacement: 'authors.slug' },
  { key: 'primary_tag', replacement: 'primary_tag.slug' },
  { key: 'primary_author', replacement: 'primary_author.slug' },
]
const MAJORS = [['6.58.0', nql6], ['5.130.6', nql5]] as const
const RELATIVE_SHAPE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
/** A relative term's resolved date, replaced by `RELATIVE` — checked by shape, since it is the clock's. */
const shaped = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(shaped)
    : v !== null && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shaped(x)]))
      : typeof v === 'string' && RELATIVE_SHAPE.test(v) ? RELATIVE : v

/** A relative term resolved to the date it stands for — by Ghost 6's own nql-lang, the one clock read this file makes (AD-1
 *  bans a clock in the package, tests included; the term's MEANING, its operator and its join, stays `holds`' own). */
const resolved = (term: string): string => (nql6(`published_at:>${term}`).parse() as { published_at: { $gt: string } }).published_at.$gt
const ago = (days: number) => resolved(`now-${days}d`)
/** Posts in the shape Ghost's URL service matches against, every combination the fixtures' fields can tell apart. */
const POSTS = (() => {
  const out: Record<string, unknown>[] = []
  const tagSets = [[], ['a'], ['b'], ['a', 'b'], ['tutorials'], ['craft'], ['field-notes'], ['craft', 'field-notes'], ['picks', 'x']]
  const authors = [['ann'], ['bot'], ['bot', 'ann'], []]
  const dates = [ago(2), ago(20), ago(45), ago(500), '2025-12-31 23:00:00', '2026-01-01 00:00:00', '2026-03-05 10:00:00']
  let n = 0
  for (const tags of tagSets) for (const as of authors) {
    const d = dates[n % dates.length] as string
    n += 1
    out.push({
      type: 'post',
      tags: tags.map((slug) => ({ slug })),
      authors: as.map((slug) => ({ slug })),
      primary_tag: tags.length ? { slug: tags[0] } : null,
      primary_author: as.length ? { slug: as[0] } : null,
      featured: n % 2 === 0,
      feature_image: n % 3 === 0 ? null : 'https://example.com/x.png',
      visibility: (['public', 'members', 'paid'] as const)[n % 3],
      published_at: d,
    })
  }
  return out
})()

/** `readNql`'s tree, evaluated on one of `POSTS` — the meaning the builder intends, written independently of Ghost. */
function holds(n: Node, post: Record<string, unknown>): boolean {
  if ('join' in n) return n.join === '+' ? n.of.every((c) => holds(c, post)) : n.of.some((c) => holds(c, post))
  // Story 7.18a — NO_PRIMARY's `posts_tags.sort_order:0` names a key no record Ghost matches in memory carries
  if ('absent' in n) return false
  if ('is' in n) return n.field === 'featured' ? post.featured === n.is : (post.feature_image !== null) === n.is
  if ('at' in n) {
    const at = n.at
    const bound = 'date' in at ? at.date : resolved(`now-${at.ago}${at.unit}`)
    const v = post.published_at as string
    return n.op === '>' ? v > bound : n.op === '>=' ? v >= bound : n.op === '<' ? v < bound : v <= bound
  }
  const has: string[] = n.field === 'visibility' ? [post.visibility as string]
    : n.field === 'tag' ? (post.tags as { slug: string }[]).map((t) => t.slug)
      : n.field === 'author' ? (post.authors as { slug: string }[]).map((t) => t.slug)
        : [(post[n.field] as { slug: string } | null)?.slug].filter((s): s is string => s !== undefined)
  const hit = (n.values as string[]).some((v) => has.includes(v))
  return n.op === 'any' ? hit : !hit
}

test('every emitted filter is the fixture\'s own, and reads back through readNql as the tree it was written from', () => {
  for (const { name, config: c, filters } of ROUTES_FIXTURES) {
    const emitted = [
      ...c.collections.map((col) => ({ where: `collections.${col.path}`, nql: filterNql(col.filter), node: nodeOf(col.filter) })),
      ...(c.collections.length ? [{ where: 'collections./', nql: indexFilter(c.collections) as string, node: indexNode(c.collections) }] : []),
      ...c.routes.flatMap((r) => ('channel' in r && r.channel.conditions.length ? [{ where: `routes.${r.path}`, nql: filterNql(r.channel), node: nodeOf(r.channel) }] : [])),
    ].filter((e) => e.nql !== '')
    assert.deepEqual(emitted.map((e) => [e.where, e.nql]), filters.map((f) => [f.where, f.nql]), name)
    for (const e of emitted) {
      assert.deepEqual(readNql(e.nql), e.node, `${name} · ${e.where}`)
      assert.equal(writeNql(e.node as Node), e.nql)
    }
    assert.deepEqual(validateRoutes(c, KNOWN), [], name)
  }
})

for (const [version, nql] of MAJORS) {
  test(`Ghost ${version}'s NQL parses every emitted filter, bare and as (\${f})+type:post, to the intended filter — never a yg key`, (t) => {
    // a relative date (now-1y) resolves at parse time, so two parses a second apart differ: freeze the clock (CI's deploy build flaked on it)
    t.mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 9, 26) })
    for (const { name, filters } of ROUTES_FIXTURES) {
      for (const f of filters) {
        const bare = nql(f.nql).parse()
        assert.deepEqual(shaped(bare), f.mongo, `${name} · ${f.where} · ${f.nql}`)
        const wrapped = nql(`(${f.nql})+type:post`).parse()
        assert.doesNotMatch(JSON.stringify(wrapped), /"yg"/, f.nql)
        assert.deepEqual(wrapped, { $and: [bare, { type: 'post' }] }, `${f.nql} wrapped is the filter AND type:post`)
      }
    }
    // the control: the bracket bug is real on this major, so the assertion above can fail
    assert.match(JSON.stringify(nql("((tag:'news'))+type:post").parse()), /"yg"/)
  })

  test(`readNql agrees with Ghost ${version}'s parser on every fixture — the same posts match, as Ghost's URL service matches them`, () => {
    let compared = 0
    for (const { filters } of ROUTES_FIXTURES) {
      for (const f of filters) {
        const ghost = nql(f.nql, { expansions: EXPANSIONS })
        const wrapped = nql(`(${f.nql})+type:post`, { expansions: EXPANSIONS })
        const ours = readNql(f.nql)
        for (const post of POSTS) {
          assert.equal(ghost.queryJSON(post), holds(ours, post), `${f.nql} on ${JSON.stringify(post)}`)
          assert.equal(wrapped.queryJSON(post), holds(ours, post), `(${f.nql})+type:post`)
          assert.equal(wrapped.queryJSON({ ...post, type: 'page' }), false)
          compared += 1
        }
      }
    }
    assert.ok(compared > 0)
    // the control: a planted wrong reading disagrees with Ghost somewhere
    const planted = { ...readNql("tag:'craft'+featured:true"), join: ',' as const }
    assert.ok(POSTS.some((post) => nql("tag:'craft'+featured:true", { expansions: EXPANSIONS }).queryJSON(post) !== holds(planted as Node, post)))
  })
}

for (const [version, nql] of MAJORS) {
  test(`Ghost ${version}'s own matcher keeps the whole day: posts at 00:00, 10:00 and 23:59 UTC on D and D+1 land as the customer's words say`, () => {
    const D = '2026-01-01'
    const at = ['2025-12-31 23:59:00', `${D} 00:00:00`, `${D} 10:00:00`, `${D} 23:59:00`, '2026-01-02 00:00:00', '2026-01-02 10:00:00', '2026-01-02 23:59:00']
    const meant = (op: '>' | '>=' | '<' | '<=', day: string) => (op === '>' ? day > D : op === '>=' ? day >= D : op === '<' ? day < D : day <= D)
    for (const op of ['>', '>=', '<', '<='] as const) {
      const filter: Filter = { match: 'all', conditions: [{ field: 'published_at', op, at: { date: D } }] }
      const nqlText = filterNql(filter)
      const ghost = nql(nqlText, { expansions: EXPANSIONS })
      const wrapped = nql(`(${nqlText})+type:post`, { expansions: EXPANSIONS })
      for (const published_at of at) {
        const post = { type: 'post', published_at }
        assert.equal(ghost.queryJSON(post), meant(op, published_at.slice(0, 10)), `${op} ${D} (${nqlText}) on ${published_at}`)
        assert.equal(wrapped.queryJSON(post), meant(op, published_at.slice(0, 10)), `(${nqlText})+type:post on ${published_at}`)
        assert.equal(holds(readNql(nqlText), post), meant(op, published_at.slice(0, 10)), `readNql(${nqlText}) on ${published_at}`)
      }
    }
    // the control: the date as written, unshifted, takes Jan 1's own posts for "after" — the off-by-one this fixes
    const raw = nql(`published_at:>'${D}'`, { expansions: EXPANSIONS })
    assert.equal(raw.queryJSON({ type: 'post', published_at: `${D} 10:00:00` }), true)
  })
}

test('every emitted file loads in js-yaml 4.3.0 (Ghost 6.58.0\'s own) to the intended object', () => {
  for (const { name, config: c } of ROUTES_FIXTURES) {
    const text = routesYaml(c) as string
    const file = load(text) as { collections: Record<string, Record<string, unknown>>; routes: Record<string, unknown> | null; taxonomies: Record<string, string> }
    const intended = {
      collections: Object.fromEntries([
        ...c.collections.map((col) => [col.path, { permalink: `${col.path}{slug}/`, template: col.template.slice(0, -4), filter: filterNql(col.filter), ...(col.limit === undefined ? {} : { limit: col.limit }) }]),
        ['/', { permalink: '/{slug}/', template: 'index', ...(indexFilter(c.collections) === null ? {} : { filter: indexFilter(c.collections) }) }],
      ]),
      routes: c.routes.length === 0 ? null : Object.fromEntries(c.routes.map((r) => [r.path, 'channel' in r
        ? { controller: 'channel', template: r.template.slice(0, -4), ...(filterNql(r.channel) === '' ? {} : { filter: filterNql(r.channel) }), ...(r.limit === undefined ? {} : { limit: r.limit }) }
        : r.template.slice(0, -4)])),
      taxonomies: { tag: `/${c.taxonomies.tag}/{slug}/`, author: `/${c.taxonomies.author}/{slug}/` },
    }
    assert.deepEqual(file, intended, name)
    assert.deepEqual(Object.keys(file), ['collections', 'routes', 'taxonomies'])
    assert.equal(Object.keys(file.collections).at(-1), '/', `${name}: the index collection is last`)
  }
})

/* ───────────────────────────── Story 7.16c — what a template lists ───────────────────────────── */

/** "now" as nql-lang resolves it — the shell's input to `holdsFor`, read by Ghost 6's own parser (the one clock read here) */
const NOW = resolved('now-0d')

/** every node Story 7.16c evaluates: each fixture's emitted filters, and each listing's "not owned earlier" node */
const LISTED_NODES = ROUTES_FIXTURES.flatMap(({ name, config: c, filters }) => [
  ...filters.map((f) => ({ where: `${name} · ${f.where}`, node: readNql(f.nql) })),
  ...[...listsOf(c).values()].flat().flatMap((l) => (l.earlier === null ? [] : [{ where: `${name} · ${l.path} (not owned earlier)`, node: l.earlier }])),
])

test('(7.16c) the "not owned earlier" node is written through group: it writes and reads back through readNql as itself, on both majors', () => {
  const earlier = LISTED_NODES.filter((n) => n.where.endsWith('(not owned earlier)'))
  assert.ok(earlier.length > 0, 'a fixture with two collections gives a second collection something to drop')
  for (const { where, node } of earlier) {
    assert.equal(emittedProblem(writeNql(node), node), null, where)
    for (const [, nql] of MAJORS) assert.doesNotMatch(JSON.stringify(nql(`(${writeNql(node)})+type:post`).parse()), /"yg"/, where)
  }
  // the first collection drops nothing, a channel drops nothing, and the last collection's is indexNode of those before it
  const two = listsOf(ROUTES_FIXTURES[1]!.config)
  assert.equal(two.get('custom-craft-list.hbs')?.[0]?.earlier, null)
  assert.deepEqual(two.get('custom-field-notes-list.hbs')?.[0]?.earlier, indexNode([ROUTES_FIXTURES[1]!.config.collections[0]!]))
})

test('(7.16c) holdsFor agrees with holds and with Ghost 6.58.0\'s NQL on every fixture filter and every "not owned earlier" node', () => {
  let compared = 0
  for (const { where, node } of LISTED_NODES) {
    const ghost = nql6(writeNql(node), { expansions: EXPANSIONS })
    for (const post of POSTS) {
      const ours = holdsFor(node, post, NOW)
      assert.equal(ours, holds(node, post), `${where} on ${JSON.stringify(post)} — the independent oracle`)
      assert.equal(ours, ghost.queryJSON(post), `${where} on ${JSON.stringify(post)} — Ghost's own matcher`)
      compared += 1
    }
  }
  assert.ok(compared > 0)
  // the Content API's own shape reads the same: an ISO instant with its zone, and a whole-day bound
  const post = { published_at: '2026-01-01T23:30:00.000+00:00', tags: [{ slug: 'a' }], authors: [], primary_tag: { slug: 'a' }, primary_author: null, featured: false, feature_image: null, visibility: 'public' }
  assert.equal(holdsFor(nodeOf({ match: 'all', conditions: [{ field: 'published_at', op: '<=', at: { date: '2026-01-01' } }] }) as Node, post, NOW), true)
  assert.equal(holdsFor(nodeOf({ match: 'all', conditions: [{ field: 'published_at', op: '>', at: { date: '2026-01-01' } }] }) as Node, post, NOW), false)
  // a calendar month back clamps the day as luxon does: 31 March less a month is 28 February (2026 is no leap year)
  const mar31 = '2026-03-31 12:00:00'
  const lastMonth = (published_at: string) => holdsFor({ field: 'published_at', op: '>=', at: { ago: 1, unit: 'M' } }, { published_at }, mar31)
  assert.deepEqual([lastMonth('2026-02-28 12:00:00'), lastMonth('2026-02-28 11:59:59')], [true, false])
  // THE CONTROL: a planted wrong evaluation — the join flipped — disagrees with Ghost somewhere
  const planted = { join: ',' as const, of: [{ field: 'tag' as const, op: 'any' as const, values: ['craft'] }, { field: 'featured' as const, is: true }] }
  assert.ok(POSTS.some((p) => holdsFor(planted, p, NOW) !== nql6("tag:'craft'+featured:true", { expansions: EXPANSIONS }).queryJSON(p)))
})

test('(7.16c) listsOf: each listed file\'s lists, collections in precedence order then channels; a static route lists nothing', () => {
  const c = config({
    collections: [
      { path: '/a/', filter: { match: 'any', conditions: [tag('x')] }, template: 'custom-shared.hbs' },
      { path: '/b/', filter: { match: 'any', conditions: [tag('y')] }, template: 'custom-b.hbs', limit: 3 },
    ],
    routes: [
      { path: '/picks/', channel: { match: 'any', conditions: [{ field: 'featured', is: true }] }, template: 'custom-shared.hbs' },
      { path: '/landing/', template: 'custom-landing.hbs' },
      { path: '/all/', channel: { match: 'all', conditions: [] }, template: 'custom-all.hbs' },
    ],
  })
  const lists = listsOf(c)
  assert.deepEqual([...lists.keys()].sort(), ['custom-all.hbs', 'custom-b.hbs', 'custom-shared.hbs'], 'the static route\'s file is not listed')
  assert.deepEqual(lists.get('custom-shared.hbs')?.map((l) => [l.kind, l.path, l.context]), [['collection', '/a/', 'a'], ['channel', '/picks/', 'picks']], 'a shared template: its collection first (routine call 4)')
  assert.deepEqual(lists.get('custom-b.hbs')?.[0], { kind: 'collection', path: '/b/', context: 'b', limit: 3, node: tag('y'), earlier: { field: 'tag', op: 'none', values: ['x'] } })
  assert.deepEqual(lists.get('custom-all.hbs')?.[0], { kind: 'channel', path: '/all/', context: 'all', node: null, earlier: null }, 'a channel with no condition lists every post')
  // an unreadable stored routing lists nothing (7.16b's routine call 12) — and Ghost's default lists nothing either
  assert.equal(listsOf(null).size, 0)
  assert.equal(listsOf(EMPTY_ROUTES).size, 0)
})

test('(7.16c) contextOf rebuilds Ghost\'s context from a checked path, and refuses any path PATH_RE refuses (AD-36)', () => {
  assert.equal(contextOf('/staff-picks/'), 'staff-picks')
  assert.equal(contextOf('/tutorials/'), 'tutorials')
  assert.match(contextOf('/a-1/'), CONTEXT_RE)
  for (const bad of ['/', 'tutorials', '/a/b/', '/A/', '/x"}}{{evil/', '/x y/', '/x\n/', '/-x/', '//']) {
    assert.equal(PATH_RE.test(bad), false, bad)
    assert.throws(() => contextOf(bad), /names no context/, JSON.stringify(bad))
  }
})

test('(7.16c) routeList and homeList: the window, the drop, the limit and the filter the site is asked with', () => {
  const posts = [
    { slug: 'both', tags: [{ slug: 'x' }, { slug: 'y' }] },
    { slug: 'only-y', tags: [{ slug: 'y' }] },
    { slug: 'neither', tags: [{ slug: 'z' }] },
  ]
  const c = config({ collections: [
    { path: '/a/', filter: { match: 'any', conditions: [tag('x')] }, template: 'custom-a.hbs' },
    { path: '/b/', filter: { match: 'any', conditions: [tag('y')] }, template: 'custom-b.hbs', limit: 3 },
  ] })
  const b = routeList(listsOf(c).get('custom-b.hbs')![0]!, NOW)
  assert.deepEqual([b.base, b.filter, b.limit], ['/b/', "tag:'y'", 3])
  assert.deepEqual(posts.filter(b.window).map((p) => p.slug), ['both', 'only-y'], 'the window is the route\'s own filter')
  assert.deepEqual(posts.filter(b.window).filter(b.keep).map((p) => p.slug), ['only-y'], 'the post /a/ owns is dropped (F4)')
  const a = routeList(listsOf(c).get('custom-a.hbs')![0]!, NOW)
  assert.deepEqual(posts.filter(a.window).filter(a.keep).map((p) => p.slug), ['both'], 'the first collection keeps every match')
  const home = homeList(c, NOW)!
  assert.deepEqual([home.base, home.filter, home.limit], ['/', indexFilter(c.collections), undefined])
  assert.deepEqual(posts.filter(home.window).map((p) => p.slug), ['neither'], 'Home lists the posts no collection owns (FR-H3)')
  // the controls: no collection, no Home list — every post; a channel keeps what an earlier collection owns
  assert.equal(homeList(EMPTY_ROUTES, NOW), undefined)
  assert.equal(homeList(null, NOW), undefined)
  const ch = routeList(listsOf(config({ ...c, routes: [{ path: '/c/', channel: { match: 'any', conditions: [tag('x')] }, template: 'custom-c.hbs' }] })).get('custom-c.hbs')![0]!, NOW)
  assert.deepEqual(posts.filter(ch.window).filter(ch.keep).map((p) => p.slug), ['both'])
})

test('(7.16c, §84) the LISTING reading is Ghost\'s SQL: a negated primary holds only on a post that HAS that primary — every other leaf, and every post with both primaries, as ownership reads it', () => {
  // with both primaries, the two readings agree — with `holds` and with Ghost 6.58.0's own matcher — on every fixture node
  const both = POSTS.filter((p) => p.primary_tag !== null && p.primary_author !== null)
  let compared = 0
  for (const { where, node } of LISTED_NODES) {
    const ghost = nql6(writeNql(node), { expansions: EXPANSIONS })
    for (const post of both) {
      assert.equal(holdsFor(node, post, NOW, true), holds(node, post), `${where} — listing vs holds`)
      assert.equal(holdsFor(node, post, NOW, true), ghost.queryJSON(post), `${where} — listing vs Ghost's matcher`)
      compared += 1
    }
  }
  assert.ok(compared > 0 && both.length < POSTS.length, 'the fixture holds posts with and without each primary')
  // §84 on T1: the post with NO tags, and one whose first tag is internal (Ghost computes its primary_tag null), are in
  // neither `primary_tag:x` nor `primary_tag:-x` when LISTED (`post.js:291-310`), while `tag:-x` keeps them
  const base = { featured: false, feature_image: null, visibility: 'public', published_at: '2026-01-01 00:00:00', authors: [{ slug: 'ann' }], primary_author: { slug: 'ann' } }
  const untagged = { ...base, tags: [], primary_tag: null }
  const internalFirst = { ...base, tags: [{ slug: 'a' }], primary_tag: null }
  const noAuthor = { ...base, tags: [{ slug: 'a' }], primary_tag: { slug: 'a' }, authors: [], primary_author: null }
  const notPrimary = (field: 'primary_tag' | 'primary_author'): Node => ({ field, op: 'none', values: ['x'] })
  const isPrimary = (field: 'primary_tag' | 'primary_author'): Node => ({ field, op: 'any', values: ['x'] })
  for (const [post, field] of [[untagged, 'primary_tag'], [internalFirst, 'primary_tag'], [noAuthor, 'primary_author']] as const) {
    assert.equal(holdsFor(notPrimary(field), post, NOW, true), false, `${field}:-x is not LISTED on a post with no ${field}`)
    assert.equal(holdsFor(isPrimary(field), post, NOW, true), false, `…nor is ${field}:x`)
    // THE CONTROL: OWNERSHIP holds the same negated leaf there — as Ghost's in-memory matcher does
    assert.equal(holdsFor(notPrimary(field), post, NOW), true)
    assert.equal(nql6(`${field}:-'x'`, { expansions: EXPANSIONS }).queryJSON(post), true)
  }
  // the plain leaves read the same both ways: `tag:-x` keeps the untagged post, `author:-x` the authorless one
  assert.equal(holdsFor({ field: 'tag', op: 'none', values: ['x'] }, untagged, NOW, true), true)
  assert.equal(holdsFor({ field: 'author', op: 'none', values: ['x'] }, noAuthor, NOW, true), true)
  // and the canvas's lists: since Story 7.18a (R-260) Home LISTS the untagged post once a collection filters by primary tag,
  // as the index OWNS it — 7.16a's inverse, `primary_tag:-'craft'`, listed it on no page (DW-364, the control); a later
  // collection that LISTS it (`tag:-craft`) keeps it, since no earlier collection OWNS it
  const c = config({ collections: [
    { path: '/craft/', filter: { match: 'all', conditions: [{ field: 'primary_tag', op: 'any', values: ['craft'] }] }, template: 'custom-craft-list.hbs' },
    { path: '/rest/', filter: { match: 'all', conditions: [{ field: 'tag', op: 'none', values: ['craft'] }] }, template: 'custom-quiet.hbs' },
  ] })
  const home = homeList(config({ collections: [c.collections[0]!] }), NOW)!
  assert.equal(home.filter, `primary_tag:-'craft',${NO_PRIMARY.primary_tag}`)
  for (const post of [untagged, internalFirst]) assert.equal(home.window(post), true, 'Home lists a post with no primary tag (R-260)')
  assert.equal(home.window({ ...base, tags: [{ slug: 'notes' }], primary_tag: { slug: 'notes' } }), true, 'a tagged post Home owns is listed')
  assert.equal(home.window({ ...base, tags: [{ slug: 'craft' }], primary_tag: { slug: 'craft' } }), false, '…and a craft post, which /craft/ owns, is not')
  assert.equal(holdsFor(readNql(home.filter!), untagged, NOW), true, 'the index OWNS it (its own address answers)')
  // THE CONTROL: 7.16a's inverse, as it was emitted, lists the untagged post on no page of Home
  assert.equal(holdsFor(readNql("primary_tag:-'craft'"), untagged, NOW, true), false)
  const rest = routeList(listsOf(c).get('custom-quiet.hbs')![0]!, NOW)
  assert.deepEqual([rest.window(untagged), rest.keep(untagged)], [true, true])
})

/* ───────────────────────────── Story 7.18a — R-260: Home lists what it owns ───────────────────────────── */

test('(7.18a, R-260) on every fixture the index\'s SQL now LISTS exactly what its in-memory filter OWNS — 7.16a\'s inverse did not', () => {
  // posts with and without each primary: no tags, an internal first tag (Ghost computes its primary_tag null), no author
  const extra = POSTS.flatMap((p) => [{ ...p, tags: [{ slug: 'hash-x' }, ...(p.tags as object[])], primary_tag: null }, { ...p, authors: [], primary_author: null }])
  const posts = [...POSTS, ...extra]
  let compared = 0
  for (const { name, config: c } of ROUTES_FIXTURES) {
    const index = indexNode(c.collections)
    if (index === null) continue
    for (const post of posts) {
      assert.equal(holdsFor(index, post, NOW, true), holdsFor(index, post, NOW), `${name} on ${JSON.stringify(post)}`)
      compared += 1
    }
  }
  assert.ok(compared > 0)
  // THE CONTROL: 7.16a's inverse (the same tree with every NO_PRIMARY dropped) lists less than it owns on a primary fixture
  const strip = (n: Node): Node => {
    if (!('join' in n)) return n
    const of = n.of.filter((x) => !('absent' in x)).map(strip)
    return of.length === 1 ? (of[0] as Node) : { join: n.join, of }
  }
  const primary = ROUTES_FIXTURES.find((f) => f.name === 'R-260 — one Primary tag collection')!.config
  const old = strip(indexNode(primary.collections)!)
  assert.equal(writeNql(old), "primary_tag:-'craft'")
  assert.ok(posts.some((p) => holdsFor(old, p, NOW, true) !== holdsFor(old, p, NOW)))
})

test('(7.18a, R-260) NO_PRIMARY is one leaf: it reads back as itself inside a group, and alone or doubly wrapped it is refused', () => {
  const leaf: Node = { field: 'primary_tag', absent: true }
  const pair: Node = { join: ',', of: [{ field: 'primary_tag', op: 'none', values: ['craft'] }, leaf] }
  assert.deepEqual(readNql(writeNql(pair)), pair)
  assert.equal(emittedProblem(writeNql(pair), pair), null)
  for (const [, nql] of MAJORS) assert.doesNotMatch(JSON.stringify(nql(`(${writeNql(pair)})+type:post`).parse()), /"yg"/)
  // refused: the pair alone (a filter wrapped whole — Ghost would make it ((…))), doubled parentheses, and the pair unwrapped
  for (const planted of [NO_PRIMARY.primary_tag, `primary_tag:-'craft',(${NO_PRIMARY.primary_tag})`, NO_PRIMARY.primary_tag.slice(1, -1)]) {
    assert.throws(() => readNql(planted), /at character/, planted)
  }
  // and it is never negated, nor stored: the grammar refuses it as a condition
  assert.equal(parseRoutesConfig({ collections: [{ path: '/x/', filter: { match: 'any', conditions: [leaf] }, template: 'custom-x.hbs' }] }).ok, false)
})

/** Ghost's own `post.js:291-353` `filterExpansions` and `filterRelations` (6.58.0; 5.130.6 is the same), as
 *  `@tryghost/bookshelf-filter` hands them to `nql(…).querySQL(qb)` — restated, since a test may not import Ghost */
const SQL_EXPANSIONS = [
  { key: 'primary_tag', replacement: 'tags.slug', expansion: 'posts_tags.sort_order:0+tags.visibility:public' },
  { key: 'primary_author', replacement: 'authors.slug', expansion: 'posts_authors.sort_order:0+authors.visibility:public' },
  { key: 'authors', replacement: 'authors.slug' }, { key: 'author', replacement: 'authors.slug' },
  { key: 'tag', replacement: 'tags.slug' }, { key: 'tags', replacement: 'tags.slug' },
]
const SQL_RELATIONS = {
  tags: { tableName: 'tags', type: 'manyToMany', joinTable: 'posts_tags', joinFrom: 'post_id', joinTo: 'tag_id' },
  authors: { tableName: 'users', tableNameAs: 'authors', type: 'manyToMany', joinTable: 'posts_authors', joinFrom: 'post_id', joinTo: 'author_id' },
}
/** The WHERE mongo-knex builds, through a builder that records its calls as SQL text (no database, no knex). */
function sqlOf(nql: typeof nql6, filter: string): string {
  const lit = (v: unknown): string => (Array.isArray(v) ? `(${v.map(lit).join(', ')})` : typeof v === 'string' ? `'${v}'` : String(v))
  const make = (table?: string) => {
    const w: string[] = []
    const add = (bool: string, text: string) => w.push(w.length === 0 ? text : `${bool} ${text}`)
    let head = ''
    const q: Record<string, unknown> = { _single: { table } }
    const cond = (bool: string) => (a: unknown, op?: unknown, v?: unknown) => {
      if (typeof a === 'function') { const g = make(); a.call(g, g); add(bool, `(${(g.where as () => string)()})`) }
      else if (typeof v === 'function') { const s = make(); v.call(s, s); add(bool, `${a} ${op} (${(s.sql as () => string)()})`) }
      else add(bool, `${a} ${v === undefined ? '=' : op} ${lit(v === undefined ? op : v)}`)
      return q
    }
    Object.assign(q, {
      where: (a?: unknown, op?: unknown, v?: unknown) => (a === undefined ? w.join(' ') : cond('AND')(a, op, v)), andWhere: cond('AND'), orWhere: cond('OR'),
      whereNull: (c: string) => (add('AND', `${c} IS NULL`), q), whereNotNull: (c: string) => (add('AND', `${c} IS NOT NULL`), q),
      orWhereNull: (c: string) => (add('OR', `${c} IS NULL`), q), orWhereNotNull: (c: string) => (add('OR', `${c} IS NOT NULL`), q),
      select: (s: string) => ((head = `SELECT ${s}`), q), from: (f: string) => ((head += ` FROM ${f}`), q),
      innerJoin: (t: string, fn: (this: unknown) => void) => {
        const on: string[] = []
        fn.call({ on: (a: string, o: string, b: string) => on.push(`${a} ${o} ${b}`), andOn: (a: string, o: string, b: unknown) => on.push(`${a} ${o} ${lit(b)}`) })
        head += ` INNER JOIN ${t} ON ${on.join(' AND ')}`
        return q
      },
      sql: () => `${head} WHERE ${w.join(' ')}`,
      toSQL: () => ({ sql: `${head} WHERE ${w.join(' ')}` }),
    })
    return q
  }
  const qb = make('posts')
  // `querySQL` is the api bookshelf-filter calls (`nql.js:81`), absent from the package's own types
  ;(nql(`(${filter})+type:post`, { relations: SQL_RELATIONS, expansions: SQL_EXPANSIONS }) as unknown as { querySQL: (qb: unknown) => unknown }).querySQL(qb)
  return (qb.where as () => string)()
}

for (const [version, nql] of MAJORS) {
  test(`(7.18a, R-260) Ghost ${version}'s NQL writes NO_PRIMARY as "no public first tag" in SQL, and \`primary_tag:null\` as nothing at all`, () => {
    // nql5 resolves mongo-knex 0.9.5 here; Ghost 5.130.6's yarn.lock pins 0.9.1, whose convertor differs only in grouping
    // two RANGE operators on one column (read at Story 7.18a's Dev) — none of these filters has one
    const noTag = "posts.id not in (SELECT posts_tags.post_id FROM posts_tags INNER JOIN tags ON tags.id = posts_tags.tag_id AND posts_tags.sort_order = 0 WHERE tags.visibility in ('public'))"
    const hasPublicFirst = "posts.id in (SELECT posts_tags.post_id FROM posts_tags INNER JOIN tags ON tags.id = posts_tags.tag_id AND posts_tags.sort_order = 0 WHERE tags.visibility = 'public')"
    const index = indexFilter(ROUTES_FIXTURES.find((f) => f.name === 'R-260 — one Primary tag collection')!.config.collections)!
    const sql = sqlOf(nql, index)
    assert.ok(sql.includes(`OR (${noTag})`), sql)
    // THE CONTROLS: 7.16a's inverse demands a public first tag, and `primary_tag:null` (DW-364's first idea) asks for a
    // first tag whose slug is null — a column Ghost declares `nullable: false` — so neither can list an untagged post
    assert.ok(sqlOf(nql, "primary_tag:-'craft'").includes(`AND ${hasPublicFirst}`))
    assert.ok(!sqlOf(nql, "primary_tag:-'craft'").includes(noTag))
    assert.match(sqlOf(nql, 'primary_tag:null'), /^\(\(posts\.id in \(SELECT .* WHERE tags\.slug IS NULL AND tags\.visibility = 'public'\)\) AND posts\.type = 'post'\)$/)
    // the author's pair, the same way round
    assert.ok(sqlOf(nql, `primary_author:-'ann',${NO_PRIMARY.primary_author}`).includes("posts.id not in (SELECT posts_authors.post_id FROM posts_authors INNER JOIN users as authors ON authors.id = posts_authors.author_id AND posts_authors.sort_order = 0 WHERE authors.visibility in ('public'))"))
  })
}

test('(7.18a, R-260) unlistedPosts names a post its owner does not list — the old index named the untagged post, the new one none', () => {
  const post = (slug: string, tags: string[]) => ({
    title: slug.replace(/-/g, ' '), slug, tags: tags.map((s) => ({ slug: s })), primary_tag: tags[0] === undefined ? null : { slug: tags[0] },
    authors: [{ slug: 'ann' }], primary_author: { slug: 'ann' }, featured: false, feature_image: null, visibility: 'public', published_at: '2026-09-01T12:00:00.000Z',
  })
  const posts = [post('office-hours', []), post('a-craft-post', ['craft']), post('notes', ['notes'])]
  const craft = config({ collections: [{ path: '/craft/', filter: { match: 'all', conditions: [{ field: 'primary_tag', op: 'any', values: ['craft'] }] }, template: 'custom-craft-list.hbs' }] })
  assert.deepEqual(unlistedPosts(craft, posts, NOW), [], 'none: Home lists the untagged post (R-260)')
  // THE CONTROL: 7.16a's index filter names it — the index owns it in memory and its SQL lists it nowhere (DW-364)
  assert.deepEqual(unlistedPosts(craft, posts, NOW, readNql("primary_tag:-'craft'")), [{ title: 'office hours', slug: 'office-hours' }])
  // some: a COLLECTION that owns a post its own SQL cannot list — `primary_tag:-'craft'` in a collection still means
  // "has a public first tag, not craft" when listed, and the earlier collection's posts stay where they are
  const rest = config({ collections: [...craft.collections, { path: '/rest/', filter: { match: 'all', conditions: [{ field: 'primary_tag', op: 'none', values: ['craft'] }] }, template: 'custom-quiet.hbs' }] })
  assert.deepEqual(unlistedPosts(rest, posts, NOW).map((p) => p.slug), ['office-hours'])
  // only Home and the collections count (routine call 23): a channel listing every post does not hide the gap
  assert.deepEqual(unlistedPosts({ ...rest, routes: [{ path: '/all/', channel: { match: 'all', conditions: [] }, template: 'custom-fresh.hbs' }] }, posts, NOW).map((p) => p.slug), ['office-hours'])
  // no collection, or an unreadable routing: Home lists every post, and nothing is named
  assert.deepEqual(unlistedPosts(EMPTY_ROUTES, posts, NOW), [])
  assert.deepEqual(unlistedPosts(null, posts, NOW), [])
})
