import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { docSchema, parseDoc } from '@inflozo/section-runtime'
import { ROUTE_WORDS } from '@inflozo/section-runtime/routes'
import { docRefusal } from './lib/pilots.ts'
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

// ─── Story 7.16b — a designed template's delete and its Undo (FR-I3), and the sheet the Template menu opens ─────────────

const ACTIONS = readFileSync(join('app', '(app)', 'app', '(authed)', 'projects', '[id]', 'routes', 'actions.ts'), 'utf8')
const body = (name: string) => ACTIONS.slice(ACTIONS.indexOf(`export async function ${name}(`), ACTIONS.indexOf('\n}\n', ACTIONS.indexOf(`export async function ${name}(`)))

test('Story 7.16b: the delete window says what goes — the design, the paths, or both — and Undo brings it back; 7.16a\'s refusal is retired', () => {
  assert.equal(ROUTES_WORDS.designGoes, 'Its design goes with it. Undo brings it back.')
  assert.equal(ROUTES_WORDS.alsoRemovesDesign(['/landing/']), 'Also removes /landing/ and its design. Undo brings them back.')
  // routed alone is 7.16a's line, unchanged
  assert.equal(ROUTES_WORDS.alsoRemoves(['/landing/']), 'Also removes /landing/. Undo brings both back.')
  // a designed template is deleted with its design now, never refused: the design's two lines are the list's only design words
  assert.deepEqual(Object.keys(ROUTES_WORDS).filter((k) => /design/i.test(k)).sort(), ['alsoRemovesDesign', 'designGoes'])
  // the page picks the line by the two facts, and opens the confirm for either
  const manager = readFileSync(join('app', '(app)', 'app', '(authed)', 'projects', '[id]', 'routes', 'routes-manager.tsx'), 'utf8')
  assert.match(manager, /\{designed \? \(paths\.length > 0 \? W\.alsoRemovesDesign\(paths\) : W\.designGoes\) : W\.alsoRemoves\(paths\)\}/)
  assert.match(manager, /pathsUsing\(config, t\.file\)\.length > 0 \|\| designed\.includes\(t\.file\) \? setConfirm\(t\)/)
})

test('Story 7.16b: every in-between state is valid — the delete runs config, doc, row; its Undo row, doc, config', () => {
  const del = body('deleteTemplate')
  const [config, doc, row] = [del.indexOf('writeConfig('), del.indexOf(".from('project_templates').delete()"), del.indexOf(".from('custom_templates').delete()")]
  assert.ok(config > 0 && doc > config && row > doc, `the delete's order: config ${config}, doc ${doc}, row ${row}`)
  assert.ok(!/ctx\.designed/.test(del), 'no refusal of a designed template')
  assert.match(del, /return \{ ok: true, \.\.\.\(held \? \{ doc \} : \{\}\) \}/, 'the doc it took is handed back for the Undo')
  // the doc handed back is the one the delete itself took — never a read made before it (review, 2026-10-17)
  assert.match(del, /\.from\('project_templates'\)\.delete\(\)\.eq\('project_id', id\)\.eq\('template_key', key\)\.select\('doc'\)/)
  assert.ok(!del.includes(".from('project_templates').select("), 'no read of the doc before its delete')
  // a failed row delete puts the doc back: the template stands as it was, never without its design and no Undo
  assert.ok(del.indexOf(".from('project_templates').upsert(", row) > row, 'the doc goes back when the row delete fails')
  // …and a failed doc or row delete puts the routes back, so a failed delete leaves the template as it was (review, 2026-10-17)
  assert.match(del, /if \(routed && \(await writeConfig\(sb, id, user\.id, config, known\)\) !== null\)/)
  assert.match(del, /if \(dropped\.error\) return failed\(/)
  assert.match(del, /return failed\('template delete failed', error\?\.code\)/)
  const undo = body('restoreTemplate')
  const [rowBack, docBack, configBack] = [undo.indexOf(".from('custom_templates')\n      .insert("), undo.indexOf(".from('project_templates').upsert("), undo.indexOf('writeConfig(')]
  assert.ok(rowBack > 0 && docBack > rowBack && configBack > docBack, `the Undo's order: row ${rowBack}, doc ${docBack}, config ${configBack}`)
  // the doc comes back from the CLIENT, so it is judged before anything is written (AD-36)
  const judged = undo.indexOf('docSchema.safeParse(sent)')
  assert.ok(judged > 0 && judged < rowBack && undo.indexOf('docRefusal(key, parsed.data)') < rowBack, 'judged by docSchema and docRefusal first')
})

test('Story 7.16b (review): a new template clears what an earlier one of its name left — its doc and its prefs — before its row is written', () => {
  const at = ACTIONS.indexOf('async function insertTemplate(')
  const fn = ACTIONS.slice(at, ACTIONS.indexOf('\n}\n', at))
  const [doc, prefs, row] = [fn.indexOf(".from('project_templates').delete()"), fn.indexOf(".from('project_template_prefs').delete()"), fn.indexOf(".from('custom_templates')")]
  assert.ok(doc > 0 && prefs > 0 && row > doc && row > prefs, `clear ${doc}/${prefs}, then the row ${row}`)
  // both by the new file's own key, and a clear that fails writes no row
  assert.match(fn, /const key = `custom:\$\{named\.file\}`/)
  assert.ok(fn.indexOf('if (unclear)') > prefs && fn.indexOf('if (unclear)') < row, 'a failed clear refuses before the row')
})

test('Story 7.16b: the Undo\'s doc is judged as the sync route judges one — a doc a Routes Manager canvas can hold passes, and nothing else', () => {
  const doc = (...designIds: string[]) => ({ schemaVersion: 1, instances: designIds.map((designId, n) => ({ instanceId: `i${n}`, layerName: designId, designId, content: {}, controls: {}, data: {}, darkOverrides: {} })) })
  const key = 'custom:custom-landing.hbs'
  for (const ok of [doc('a22/1'), doc('a4/13', 'a22/1'), doc()]) {
    const parsed = docSchema.safeParse(ok)
    assert.ok(parsed.success && docRefusal(key, parsed.data) === null, JSON.stringify(ok))
  }
  // THE CONTROL: a design that does not list the route target, a post-bound one, a stranger's key and a doc that is no doc
  assert.match(docRefusal(key, parseDoc(doc('a17/1'), key)) ?? '', /never custom-landing\.hbs/)
  assert.match(docRefusal(key, parseDoc(doc('a24/1'), key)) ?? '', /never custom-landing\.hbs/)
  assert.equal(docSchema.safeParse({ schemaVersion: 1, instances: [{ designId: 'a22/1' }] }).success, false)
  assert.equal(docSchema.safeParse({ ...doc('a22/1'), extra: true }).success, false, 'a strict schema: nothing rides along')
})

test('Story 7.16b: ?new=template opens the New template sheet, and Create from it answers the file it made', () => {
  const page = readFileSync(join('app', '(app)', 'app', '(authed)', 'projects', '[id]', 'routes', 'page.tsx'), 'utf8')
  assert.match(page, /const fromMenu = \(await searchParams\)\.new === NEW_TEMPLATE_QUERY\.new/)
  const manager = readFileSync(join('app', '(app)', 'app', '(authed)', 'projects', '[id]', 'routes', 'routes-manager.tsx'), 'utf8')
  assert.match(manager, /useState<Sheet \| null>\(props\.fromMenu === true \? \{ kind: 'template', entry: true \} : null\)/)
  assert.match(manager, /if \(open\.kind === 'template'\) document\.getElementById\('routes-new-template'\)\?\.focus\(\)/, 'focus lands in Name')
  assert.match(body('createTemplate'), /return \{ ok: true, file: made\.file \}/)
  // review, 2026-10-17: the query is spent when its sheet closes, and Create REPLACES this entry with the new canvas — so a
  // reload or Back never opens the sheet again
  assert.match(manager, /if \(props\.fromMenu === true && new URL\(window\.location\.href\)\.searchParams\.has\('new'\)\) window\.history\.replaceState\(null, '', window\.location\.pathname\)/)
  assert.match(manager, /const openCanvas = \(canvas: RouteCanvas\) => startOpening\(\(\) => router\.replace\(/)
})
