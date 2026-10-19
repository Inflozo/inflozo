// Story 7.18b — Pre-flight's warning rows (`lib/preflight.ts`) over the spec's I/O matrix, row by row, each with its control,
// on the real pilot designs: what the compile kept (`PreflightFacts`) and the editor's own state in, the ordered rows out.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defaultContent, type ProjectDoc } from '@inflozo/section-runtime'
import { DEPLOY_WORDS, type PreflightFacts } from './lib/deploy.ts'
import { FEEDLESS } from './lib/data-group.ts'
import { membersNotice } from './lib/paywall.ts'
import { pilot } from './lib/pilots.ts'
import { picksOn, PREFLIGHT_WORDS as W, preflightWarnings, rowCanvas, shippedCanvases, type PreflightInput } from './lib/preflight.ts'
import { TRANSLATION_WORDS as T } from './lib/translations.ts'
import { ROWS } from './lib/view-as.ts'

let n = 0
const at = (designId: string, over: Record<string, unknown> = {}) => ({
  instanceId: `pf${String(++n).padStart(2, '0')}x9q1`, layerName: `Layer ${n}`, designId, content: defaultContent(pilot(designId).contentSchema),
  controls: {}, data: {}, darkOverrides: {}, isMainFeed: false, hidden: false, ...over,
}) as ProjectDoc['instances'][number]
const doc = (...instances: ProjectDoc['instances']): ProjectDoc => ({ schemaVersion: 1, instances })
const library = (id: string) => (id.includes('/') ? pilot(id) : undefined)

const TEMPLATES = ['author.hbs', 'default.hbs', 'home.hbs', 'index.hbs', 'post.hbs', 'tag.hbs', 'partials/sections/home/news.hbs']
const facts = (over: Partial<PreflightFacts> = {}): PreflightFacts => ({ templates: TEMPLATES, custom: { color_scheme: { type: 'select', default: 'Auto' }, dark_accent_color: { type: 'color', default: '#ff5500' }, dark_logo: { type: 'image' } }, noindex: [], freeAsks: [], ...over })
const ALL = ['anonymous', 'free', 'paid'] as const
const VIEWED = { home: ALL, index: ALL, post: ALL, tag: ALL, 'tag-paged': ALL, author: ALL, 'author-paged': ALL }
const input = (over: Partial<PreflightInput> = {}): PreflightInput => ({
  host: 'ghost6.inflozo.com', siteName: 'Ghost 6', siteUrl: 'https://ghost6.inflozo.com', siteVersion: '6.58.0', siteLocale: 'en', language: 'en', rtlAckAt: null,
  facts: facts(), previousCustom: null, members: { signup_access: 'all', paid_enabled: true },
  docs: { home: doc(at('a4/13')) }, library, viewed: VIEWED, names: {}, postsPerPage: 12, projectId: 'p1', ...over,
})
const kinds = (rows: ReturnType<typeof preflightWarnings>) => rows.map((r) => r.kind)

test('the control: a site, a project and a deploy with nothing to warn about give no row', () => {
  assert.deepEqual(preflightWarnings(input()), [])
})

test('RTL, acknowledged: B18\'s title, body and the date; an English project, none (the unacknowledged block is the server\'s)', () => {
  const rows = preflightWarnings(input({ language: 'ar', siteLocale: 'ar', rtlAckAt: '2026-10-19T08:00:00Z' }))
  const rtl = rows.find((r) => r.kind === 'rtl')
  assert.equal(rtl?.title, T.rtlTitle)
  assert.equal(rtl?.body, `${T.rtlBody} ${T.acknowledged('2026-10-19T08:00:00Z')}`)
  assert.ok(!kinds(preflightWarnings(input({ rtlAckAt: '2026-10-19T08:00:00Z' }))).includes('rtl'), 'an LTR language never repeats it')
})

test('the locale mismatch: a non-English project on a site set to another language, with its link into Ghost; no stored locale, none', () => {
  const row = preflightWarnings(input({ language: 'de', siteLocale: 'en' })).find((r) => r.kind === 'mismatch')
  assert.equal(row?.title, W.mismatch('en', 'Deutsch'))
  assert.deepEqual(row?.link, { words: T.changeIn('de'), href: 'https://ghost6.inflozo.com/ghost/#/settings/publication-language' })
  assert.ok(!kinds(preflightWarnings(input({ language: 'de', siteLocale: null }))).includes('mismatch'))
  assert.ok(!kinds(preflightWarnings(input({ language: 'de', siteLocale: 'de' }))).includes('mismatch'), 'the control')
})

test('the untouched words (7.12\'s Q1): a non-English project lists each section, its words in quotes, "Fix in editor" each; English, none', () => {
  const rows = preflightWarnings(input({ language: 'de', siteLocale: 'de', docs: { home: doc(at('a4/13', { layerName: 'Big hero' })) } }))
  const row = rows.find((r) => r.kind === 'untouched')
  assert.equal(row?.title, T.untouchedTitle)
  assert.equal(row?.body, T.untouchedLead)
  assert.ok(row?.items[0]?.text.startsWith(`${T.untouchedOn('Big hero', 'Home')} “`), row?.items[0]?.text)
  assert.match(row?.items[0]?.text ?? '', /“The personal page never disappeared/)
  assert.equal(row?.items[0]?.canvas, 'home')
  assert.ok(!kinds(preflightWarnings(input())).includes('untouched'), 'the control: an English project')
})

test('FR-H6: an invite-only site lists every Sites sentence beside each placed ask it stops — A4\'s default Sign up included — and a designed Paywall; no record, nothing (R-4)', () => {
  const invite = { signup_access: 'invite', paid_enabled: false } as const
  const hero = at('a4/13', { layerName: 'Big hero' })
  const docs = { home: doc(hero, at('a22/1', { layerName: 'Inline Row' }), at('a22/1', { instanceId: 'auto-home-3' })), paywall: doc(at('a22/1')) }
  // the Paywall ships as `partials/content-cta.hbs` — and only then is it listed (the control just below)
  const row = preflightWarnings(input({ members: invite, docs, facts: facts({ templates: [...TEMPLATES, 'partials/content-cta.hbs'] }) })).find((r) => r.kind === 'members')
  assert.equal(row?.title, W.members('ghost6.inflozo.com'))
  assert.equal(row?.body, membersNotice(invite, 'Ghost 6').join(' '))
  assert.deepEqual(row?.items.map((i) => i.text), [W.membersItem('Big hero', 'Home'), W.membersItem('Inline Row', 'Home'), 'Paywall'])
  assert.deepEqual(row?.link, { words: W.membersLink, href: 'https://ghost6.inflozo.com/ghost/#/settings/members' })
  assert.ok(!preflightWarnings(input({ members: invite, docs })).find((r) => r.kind === 'members')?.items.some((i) => i.text === 'Paywall'), 'a Paywall that does not ship is not listed')
  assert.ok(!kinds(preflightWarnings(input({ members: null, docs }))).includes('members'), 'no record: nothing')
  assert.ok(!kinds(preflightWarnings(input({ members: invite, docs: { home: doc(at('a17/1')) } }))).includes('members'), 'no ask placed: nothing')
})

test('DW-297 (Q2): a file carrying a free ask on Ghost 5 below 5.62 names its canvas and the update; 6.58 and 5.62 — the controls — and an unparsable version, none', () => {
  const free = facts({ freeAsks: ['partials/sections/home/news.hbs', 'home.hbs'] })
  const row = preflightWarnings(input({ facts: free, siteVersion: '5.40.0' })).find((r) => r.kind === 'freeAsks')
  assert.equal(row?.title, W.freeAsks('ghost6.inflozo.com'))
  assert.equal(row?.body, 'It runs Ghost 5.40, and only Ghost 5.62 or later tells a theme that free sign-ups are open. Update Ghost to show them.')
  assert.deepEqual(row?.items, [{ text: 'Home', canvas: 'home' }])
  for (const v of ['6.58.0', '5.62.0', 'banana', null]) assert.ok(!kinds(preflightWarnings(input({ facts: free, siteVersion: v }))).includes('freeAsks'), String(v))
  // the boundary (the Review): the last Ghost without the flag warns
  assert.ok(kinds(preflightWarnings(input({ facts: free, siteVersion: '5.61.9' }))).includes('freeAsks'), '5.61.9')
})

test('7.10\'s Q2: a key the last ACTIVATED deploy declared and this one lacks is named by Ghost\'s label; no earlier deploy, none', () => {
  const previousCustom = { ...facts().custom, note: { type: 'text', default: 'Hi' } }
  const row = preflightWarnings(input({ previousCustom })).find((r) => r.kind === 'dropped')
  assert.equal(row?.title, W.dropped(1, 'ghost6.inflozo.com'))
  assert.equal(row?.title, 'Ghost will forget 1 setting on ghost6.inflozo.com')
  assert.deepEqual(row?.items, [{ text: 'Note' }])
  assert.ok(!kinds(preflightWarnings(input({ previousCustom: null }))).includes('dropped'))
  assert.equal(W.dropped(2, 'ghost6.inflozo.com'), 'Ghost will forget 2 settings on ghost6.inflozo.com')
})

test('7.11\'s Q2: a built-in whose start moved gets one row naming both values and the Design panel; an unchanged one, none', () => {
  const previousCustom = { ...facts().custom, dark_accent_color: { type: 'color', default: '#112233' } }
  const rows = preflightWarnings(input({ previousCustom })).filter((r) => r.kind === 'builtIn')
  assert.equal(rows.length, 1)
  assert.equal(rows[0]?.title, "Dark accent color's starting value changed")
  assert.equal(rows[0]?.body, W.builtInBody('#ff5500', 'ghost6.inflozo.com', '#112233'))
  assert.deepEqual(rows[0]?.link, { words: W.designPanel, href: 'https://ghost6.inflozo.com/ghost/#/settings/design/edit' })
  // a deploy made before 7.11 declared none: Ghost seeds them, nothing changed
  assert.equal(preflightWarnings(input({ previousCustom: {} })).filter((r) => r.kind === 'builtIn').length, 0)
})

test('FR-H2: a feed-less Tag is a row with FEEDLESS\'s body and "Fix in editor"; Home\'s page 2 is the guard\'s, never this row', () => {
  const rows = preflightWarnings(input({ facts: facts({ noindex: ['index', 'tag'] }) })).filter((r) => r.kind === 'feedless')
  assert.deepEqual(rows, [{ kind: 'feedless', title: W.feedless('Tag'), body: FEEDLESS('Tag'), items: [], canvas: 'tag' }])
  assert.equal(rowCanvas(rows[0]!), 'tag')
})

test('FR-H2: past 25 hand-picked posts on one page — the site doc\'s counted with it — one row; 25 exactly, none (the control)', () => {
  const picks = (k: number) => ({ posts: { source: 'picked', picks: Array.from({ length: k }, (_, i) => ({ id: (i + 1).toString(16).padStart(24, 'a'), title: `Pick ${i}` })) } })
  const home = (k: number) => doc(at('a17/1', { isMainFeed: true }), at('a17/1', { data: picks(k) }))
  assert.equal(picksOn('home', { home: home(20) }, library, 12), 20)
  // the site doc's lists load on every page, so they count on each (routine call 7) — and never on a surface, which has none
  // (the library's one hand-pickable query a site doc could hold is A4 #13's fixed `latest`, which keeps one pick)
  const site = doc(at('a4/13', { data: { latest: picks(6).posts } }))
  assert.equal(picksOn('home', { home: home(20), site }, library, 12), 21)
  assert.equal(picksOn('paywall', { paywall: site, site }, library, 12), 1, 'a surface counts its own doc alone')
  const over = preflightWarnings(input({ docs: { home: home(26) } })).find((r) => r.kind === 'picks')
  assert.equal(over?.title, '1 page loads more than 25 hand-picked posts')
  assert.deepEqual(over?.items, [{ text: W.picksItem('Home', 26), canvas: 'home' }])
  assert.ok(!kinds(preflightWarnings(input({ docs: { home: home(25) } }))).includes('picks'))
  // a hidden section loads nothing
  assert.equal(picksOn('home', { home: doc(at('a17/1', { isMainFeed: true }), at('a17/1', { data: picks(30), hidden: true })) }, library, 12), 0)
  // the Review: a designed page 2 is a page of its own — its picks are counted apart from page 1's, and named so
  const two = preflightWarnings(input({ docs: { home: home(3), index: home(26) } })).find((r) => r.kind === 'picks')
  assert.deepEqual(two?.items, [{ text: W.picksItem('Home page 2', 26), canvas: 'home' }])
  assert.equal(picksOn('home', { home: home(3), index: home(26) }, library, 12, undefined, true), 26)
  assert.equal(picksOn('post', { post: home(26) }, library, 12, undefined, true), 0, 'a canvas with no page 2 has none to count')
})

test('FR-D16: every shipped page and its page 2 whose record lacks a visitor, never-opened ones lacking all three; Editor cards never', () => {
  const rows = preflightWarnings(input({ viewed: { ...VIEWED, home: ['anonymous'], post: [] as never[] } }))
  const row = rows.find((r) => r.kind === 'unviewed')
  assert.equal(row?.title, W.unviewed)
  assert.equal(row?.body, W.unviewedBody)
  assert.deepEqual(row?.items, [
    { text: W.unviewedItem('Home', [ROWS.free.title, ROWS.paid.title]), canvas: 'home' },
    { text: W.unviewedItem('Post', [ROWS.anonymous.title, ROWS.free.title, ROWS.paid.title]), canvas: 'post' },
  ])
  assert.ok(!shippedCanvases(['assets/css/cards.css', 'home.hbs']).includes('cards'))
  // a page never opened is unviewed as every visitor
  const never = preflightWarnings(input({ viewed: {} })).find((r) => r.kind === 'unviewed')
  assert.ok(never?.items.some((i) => i.text === W.unviewedItem('Home page 2', ALL.map((v) => ROWS[v].title))))
})

test('the order is routine call 13\'s: RTL, locale, untouched, members, free asks, dropped, built-ins, feed-less, picks, unviewed — every kind present', () => {
  const rows = preflightWarnings(input({
    language: 'ar', siteLocale: 'en', rtlAckAt: '2026-10-19T08:00:00Z', siteVersion: '5.40.0',
    members: { signup_access: 'invite', paid_enabled: true },
    facts: facts({ noindex: ['author'], freeAsks: ['home.hbs'] }),
    previousCustom: { ...facts().custom, gone: { type: 'text' }, color_scheme: { type: 'select', default: 'Light' } },
    docs: { home: doc(at('a4/13'), at('a17/1', { data: { posts: { source: 'picked', picks: Array.from({ length: 26 }, (_, i) => ({ id: (i + 1).toString(16).padStart(24, 'a'), title: `Pick ${i}` })) } } })) }, viewed: {},
  }))
  assert.deepEqual(kinds(rows), ['rtl', 'mismatch', 'untouched', 'members', 'freeAsks', 'dropped', 'builtIn', 'feedless', 'picks', 'unviewed'])
})

test('R-271: the cap and its words', () => {
  assert.equal(DEPLOY_WORDS.postsCapped, 'We checked your newest 2,000 posts.')
  assert.equal(DEPLOY_WORDS.postsReading, 'Checking that every post appears on a page…')
})
