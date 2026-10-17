import { test } from 'node:test'
import assert from 'node:assert/strict'
import nql6 from '@tryghost/nql'
import nql5 from 'nql5'
import { load } from 'js-yaml'
import {
  dayAfter, DEFAULT_TAXONOMIES, emittedProblem, EMPTY_ROUTES, isCalendarDate, filterNql, filterProblem, ghostLabel, holderOf, indexFilter, indexNode, MEMBERSHIP_FILES, nodeOf,
  parseRoutesConfig, pathsUsing, readNql, RESERVED_SEGMENTS, ROUTE_WORDS, routedOf, routesYaml, templateName, validateRoutes, withoutTemplate,
  writeNql, yamlLines, type Cond, type Filter, type Node, type RoutesConfig,
} from './routes.ts'
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
  test(`Ghost ${version}'s NQL parses every emitted filter, bare and as (\${f})+type:post, to the intended filter — never a yg key`, () => {
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
