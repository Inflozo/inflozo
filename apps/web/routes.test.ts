import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ROUTE_WORDS } from '@inflozo/section-runtime/routes'
import { cardName, conditionWords, filterWords, freshCondition, ROUTES_WORDS, templatesOf, templateWriteRefusal } from './lib/routes.ts'

// STORY 7.16a — the Routes page's pure half (`lib/routes.ts`): R-170's one list, the frame's strings verbatim where the spec
// keeps them, the card's words, and the stored templates the page will use.

const FRAME = readFileSync('../../_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/S9 Routes.dc.html', 'utf8')
  .replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'")

test('the frame\'s strings are verbatim — every one ROUTES_WORDS keeps from S9', () => {
  const kept = [
    W('title'), W('collectionsHelp'), W('newCollection'), W('customRoute'), W('tagTemplate'), W('authorTemplate'), W('valid'),
    W('newCollectionTitle'), W('newCollectionLead'), W('first'), W('rollingDate'), W('createCollection'),
    W('newRouteTitle'), W('newRouteLead'), W('oneTemplate'), W('channel'), W('channelHelp'), W('createRoute'), W('emptyTitle'),
    W('emptyLead'), W('all'), W('any'), W('isAnyOf'), W('choose'),
  ]
  const text = FRAME.replace(/<[^>]+>/g, '')
  for (const s of kept) assert.ok(text.includes(s), s)
  // the routine calls: S9e's helper names a landing page, never a membership page (8), and S9b's Ship line waits for 7.18 (11)
  assert.ok(text.includes('A designed page — like your Members Signup.'))
  assert.equal(ROUTES_WORDS.oneTemplateHelp, 'A designed page — like a landing page.')
  assert.ok(!Object.values(ROUTES_WORDS).some((v) => typeof v === 'string' && /Ship button/.test(v)))
  // R-246's two sentences are the spec's, and the collection's is the runtime's one spelling
  assert.equal(ROUTES_WORDS.exactDate, ROUTE_WORDS.relative)
  assert.equal(ROUTES_WORDS.refused, ROUTE_WORDS)
})

function W(key: keyof typeof ROUTES_WORDS): string {
  const v = ROUTES_WORDS[key]
  assert.equal(typeof v, 'string', key)
  return v as string
}

test('the posts-per-page sentence links "theme setting" to Theme settings, never Ghost Admin', () => {
  assert.equal(`${ROUTES_WORDS.postsBefore}${ROUTES_WORDS.postsLink}${ROUTES_WORDS.postsAfter(12)}`, 'Posts per page is your theme setting — 12 right now. A collection can set its own limit here.')
  const page = readFileSync('app/(app)/app/(authed)/projects/[id]/routes/routes-manager.tsx', 'utf8')
  assert.match(page, /<Link href=\{settingsPath\(projectId\)\}[^>]*>\{W\.postsLink\}<\/Link>/)
})

test('a card\'s name is the title-cased path, and its line the filter in words', () => {
  assert.equal(cardName('/field-notes/'), 'Field Notes')
  assert.equal(conditionWords({ field: 'tag', op: 'any', values: ['field-notes'] }), 'Tag is any of field-notes')
  assert.equal(filterWords({ match: 'all', conditions: [{ field: 'tag', op: 'any', values: ['craft'] }, { field: 'featured', is: true }] }), 'Tag is any of craft and Featured is Yes')
  assert.equal(conditionWords({ field: 'published_at', op: '>', at: { ago: 30, unit: 'd' } }), 'Published date within the last 30 days')
  assert.equal(conditionWords({ field: 'published_at', op: '>=', at: { date: '2026-01-01' } }), 'Published date on or after 2026-01-01')
  assert.equal(conditionWords({ field: 'visibility', op: 'none', values: ['paid'] }), 'Visibility is not Paid')
})

test('a fresh Published date is a rolling window in a channel and an exact date in a collection (R-246)', () => {
  assert.deepEqual(freshCondition('published_at', 'channel', '2026-10-17'), { field: 'published_at', op: '>', at: { ago: 30, unit: 'd' } })
  assert.deepEqual(freshCondition('published_at', 'collection', '2026-10-17'), { field: 'published_at', op: '>', at: { date: '2026-10-17' } })
})

test('a stored template is used only when it is a Routes Manager row with a custom-{name}.hbs file (routine call 14)', () => {
  const rows = [
    { id: 'a', filename: 'custom-landing.hbs', display_name: 'Landing', kind: 'routes', created_at: '2026-10-17T00:00:00Z' },
    { id: 'b', filename: 'landing.hbs', display_name: 'Bad', kind: 'routes' },
    { id: 'c', filename: 'custom-signup.hbs', display_name: 'Signup', kind: 'membership' },
    { id: 'd', filename: '../x.hbs', display_name: 'Worse', kind: 'routes' },
  ]
  assert.deepEqual(templatesOf(rows), [{ id: 'a', file: 'custom-landing.hbs', name: 'Landing', label: 'Landing', created_at: '2026-10-17T00:00:00Z' }])
  assert.deepEqual(templatesOf(null), [])
})

test('Name collision: the database\'s 23505 backstop answers with the naming step\'s own sentence (FR-I3)', () => {
  // the trigger's OWN message, read from the migration that defines it (`guard_custom_template_name()`, raised with the
  // filename as its one argument) — so a reworded trigger fails here rather than falling through to "already a template"
  const schema = readFileSync('../../supabase/migrations/20260904120000_complete_schema.sql', 'utf8')
  const raised = [...schema.matchAll(/raise exception '(custom template % [^']+)', new\.filename/g)].map((m) => m[1] as string)
  assert.ok(raised.length > 0, 'the guard raises its message in the migration')
  const file = 'custom-landing.hbs'
  for (const format of new Set(raised)) {
    assert.equal(templateWriteRefusal({ code: '23505', message: format.replace('%', file) }, file), ROUTE_WORDS.nameDeployed(file), format)
  }
  // the control: the unique constraint's own refusal, and the primary key's (an Undo re-inserting a row by its id), are
  // "already a template here" — never the deployed sentence
  for (const message of ['duplicate key value violates unique constraint "custom_templates_project_id_filename_key"', 'duplicate key value violates unique constraint "custom_templates_pkey"']) {
    assert.equal(templateWriteRefusal({ code: '23505', message }, file), ROUTE_WORDS.nameTaken('Landing'), message)
  }
  // any other refusal is the one "could not", and no error is no sentence
  assert.equal(templateWriteRefusal({ code: '42501', message: 'new row violates row-level security policy' }, file), ROUTES_WORDS.couldNot)
  assert.equal(templateWriteRefusal(null, file), null)
  // and both of the actions' inserts ask it
  const actions = readFileSync('app/(app)/app/(authed)/projects/[id]/routes/actions.ts', 'utf8')
  assert.equal(actions.match(/templateWriteRefusal\(error, /g)?.length, 2)
  assert.doesNotMatch(actions, /'23505'/, 'no second mapping of the code beside the one function')
})
