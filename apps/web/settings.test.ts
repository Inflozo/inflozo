import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import type { SectionRegistryEntry } from '@inflozo/library'
import { DATA_WORDS, USER_SETTING_CAP, type ProjectDoc } from '@inflozo/section-runtime'
import { THEME_SETTINGS_LINK } from './lib/data-group.ts'
import {
  boundLabels, liveHolder, placedControls, promotable, settingsReadOnly, siteBasics, storedSettings, THEME_WORDS, type StoredSetting,
} from './lib/theme-settings.ts'

/* STORY 7.9 — Theme settings' app rows of the I/O matrix. Ghost's own rules are the runtime's `custom-settings.test.ts` and,
   on both pinned gscans, the theme compiler's `gate/custom-settings.test.ts`; what is held here is the page's half — the
   controls the Promote form offers, Site basics, the read-only rule, the words — and, read from their source as
   `dark-mode.test.ts` reads them, the actions' shape: each refuses before it writes and maps the database's refusals. */

const SETTINGS = 'app/(app)/app/(authed)/projects/[id]/settings'
const actions = readFileSync(`${SETTINGS}/actions.ts`, 'utf8')
const page = readFileSync(`${SETTINGS}/theme-settings.tsx`, 'utf8')

test('the user cap is the trigger\'s: the module derives 17, the migration counts to it', () => {
  const schema = readFileSync('../../supabase/migrations/20260904120000_complete_schema.sql', 'utf8')
  const trigger = /where project_id = new\.project_id\) >= (\d+) then/.exec(schema)
  assert.ok(trigger, 'the cap trigger is where the spec says')
  assert.equal(Number(trigger[1]), USER_SETTING_CAP)
})

// ─── the controls the Promote form offers (Question 1) ─────────────────────────────────────────────────────────────

const LATEST = {
  name: 'Latest Post',
  controlSchema: [
    { name: 'headline-size', type: 'segmented', label: 'Headline size', group: 'style', values: ['medium', 'large', 'display'], default: 'large' },
    { name: 'primary-action', type: 'toggle', label: 'Primary action', group: 'content', values: ['on', 'off'], default: 'on' },
    { name: 'columns', type: 'stepper', label: 'Columns', group: 'layout', values: ['2', '3'], default: '2' },
    { name: 'tint', type: 'swatch-row', label: 'Tint', group: 'style', values: ['base', 'surface'], default: 'base' },
  ],
} as unknown as SectionRegistryEntry
const instance = (instanceId: string, over: Record<string, unknown> = {}) => ({
  instanceId, layerName: 'Latest Post', designId: 'a4/13', content: {}, controls: {}, data: {}, darkOverrides: {}, hidden: false,
  memberVisibility: 'everyone', isMainFeed: false, parkedControls: {}, ...over,
})
const doc = (...instances: ReturnType<typeof instance>[]) => ({ schemaVersion: 1, instances }) as unknown as ProjectDoc
const stored = (over: Partial<StoredSetting>): StoredSetting => ({
  id: '00000000-0000-4000-8000-000000000001', key: 'show_the_button', label: 'Show the button', type: 'boolean', options: null,
  default_value: 'true', group_name: 'site_wide', visibility_condition: null, bound_to: {}, position: 1, frozen_at: null, ...over,
})

test('Promote offers each toggle and choice on a visible instance of a stored doc, once, at its value — never a stepper or swatch row', () => {
  const docs = {
    home: doc(instance('i1', { controls: { 'headline-size': 'display' } }), instance('hid', { hidden: true })),
    index: doc(instance('i1')), // a page 2 shares its page 1's instances
    post: doc(instance('i2', { layerName: '' })),
    tag: doc(instance('synth')), // a synthesized default no row binds to
  }
  const placed = placedControls(docs, { 'a4/13': LATEST }, new Set(['tag']))
  assert.deepEqual(placed.map((c) => [c.instanceId, c.controlKey, c.label]), [
    ['i1', 'headline-size', 'Latest Post · Headline size'],
    ['i1', 'primary-action', 'Latest Post · Primary action'],
    ['i2', 'headline-size', 'Latest Post · Headline size (2)'],
    ['i2', 'primary-action', 'Latest Post · Primary action (2)'],
  ])
  // the instance's own value, as the label Ghost will print
  assert.equal(placed[0]?.setting.default_value, 'Display')
  assert.deepEqual(placed[1]?.setting, { type: 'boolean', options: null, default_value: 'true' })
  // a control already promoted on that instance is not offered again, and its row names it
  const row = stored({ bound_to: { kind: 'control', instanceId: 'i1', controlKey: 'primary-action' } })
  assert.deepEqual(promotable(placed, [row]).map((c) => c.label), ['Latest Post · Headline size', 'Latest Post · Headline size (2)', 'Latest Post · Primary action (2)'])
  assert.deepEqual(boundLabels(placed, [row]), { [row.id]: 'Latest Post · Primary action' })
  assert.deepEqual(boundLabels(placed, [stored({ bound_to: { kind: 'control', instanceId: 'gone', controlKey: 'x' } })]), {})
})

test('a stored row of another shape is dropped, never drawn or handed to a rule (AD-36)', () => {
  const good = stored({})
  assert.deepEqual(storedSettings([good, { ...good, options: 'junk' }, { ...good, group_name: 'sidebar' }, null]), [good])
  assert.deepEqual(storedSettings(null), [])
})

// ─── Site basics (Question 2) ──────────────────────────────────────────────────────────────────────────────────────

test('Site basics reads the linked site\'s title, logo and accent, and links Ghost Admin\'s settings', () => {
  assert.deepEqual(
    siteBasics({ url: 'https://ghost6.inflozo.com/', title: 'Ghost 6', site_settings: { brand: { logo: 'https://ghost6.inflozo.com/content/images/logo.png' } } }, '#FF5941'),
    { title: 'Ghost 6', logo: 'https://ghost6.inflozo.com/content/images/logo.png', accent: '#FF5941', admin: 'https://ghost6.inflozo.com/ghost/#/settings' },
  )
  // a value Ghost never gave is null ("Not set in Ghost"); a logo that is not https never becomes an <img src>
  assert.deepEqual(siteBasics({ url: 'https://x.example', title: ' ', site_settings: { brand: { logo: 'data:image/svg+xml,<svg/>' } } }, null),
    { title: null, logo: null, accent: null, admin: 'https://x.example/ghost/#/settings' })
  // a failed read, and an address that is not http(s), link nowhere
  assert.deepEqual(siteBasics(null, null), { title: null, logo: null, accent: null, admin: null })
  assert.equal(siteBasics({ url: 'javascript:alert(1)' }, null).admin, null)
  assert.equal(THEME_WORDS.noSite, 'Connect a Ghost site and its title, logo and accent appear here.')
})

// ─── R-192, the read-only page ─────────────────────────────────────────────────────────────────────────────────────

test('R-192: the page reads along while another session holds a live lock', () => {
  const row = (holderSessionId: string, ageMs: number) =>
    ({ holderSessionId, generation: 1, unsyncedEdits: 0, ageMs, nudgeRequestedBy: null, nudgeAgeMs: null, beat: null, request: null })
  assert.equal(liveHolder(null), null)
  assert.equal(liveHolder(row('a', 1000)), 'a')
  assert.equal(liveHolder(row('a', 61_000)), null, 'a stale row holds nothing')
  assert.equal(settingsReadOnly('a', 'b'), true, 'a second window')
  assert.equal(settingsReadOnly('a', null), true, 'a tab with no session of its own')
  assert.equal(settingsReadOnly('a', 'a'), false, 'the holder\'s own tab')
  assert.equal(settingsReadOnly(null, 'b'), false, 'nobody holds it')
  // the whole page is the Kit's ReadOnly, the server assuming a live lock is someone else's until the tab says otherwise
  assert.match(page, /useSyncExternalStore\(noSubscribe, \(\) => settingsReadOnly\(holder, tabSession\(\)\), \(\) => holder !== null\)/)
  assert.match(page, /<ReadOnly on=\{readOnly\}>[\s\S]*<PostsPerPage[\s\S]*<ModeBlock[\s\S]*<CustomSettings[\s\S]*<\/ReadOnly>/)
})

// ─── the words ─────────────────────────────────────────────────────────────────────────────────────────────────────

test('the Count\'s two sentences and its link to Theme settings, never Ghost Admin (DW-254, FR-Q1)', () => {
  assert.equal(DATA_WORDS.mainCount, "This feed is sized by your theme's Posts per page. Change it in Theme settings.")
  assert.equal(THEME_SETTINGS_LINK, 'Theme settings ↗')
  const group = readFileSync('components/controls/data-group.tsx', 'utf8')
  assert.match(group, /settingsHref !== undefined && row\.greyed === DATA_WORDS\.mainCount \? \(\s*<Link href=\{settingsHref\}/, 'the link is drawn with a project, and only under the main feed\'s Count')
  const editor = readFileSync('app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx', 'utf8')
  assert.match(editor, /settingsHref=\{canvasBase === undefined \? settingsPath\(project\.id\) : undefined\}/, 'the harness, which has no project, hands none')
})

test('the delete confirm warns of the stored value only once the key is frozen; the row says since when', () => {
  assert.equal(THEME_WORDS.deleteTitle('Show the button'), 'Delete Show the button?')
  assert.equal(THEME_WORDS.deleteBody({ key: 'show_the_button', frozen_at: null }), 'Nothing is deployed yet, so nothing is lost.')
  assert.equal(THEME_WORDS.deleteBody({ key: 'show_the_button', frozen_at: '2026-10-09T10:00:00Z' }),
    "If you later promote a control with the key show_the_button, the value your site's owner set in Ghost comes back.")
  assert.equal(THEME_WORDS.frozenSince('2026-10-09T23:30:00Z'), 'Key frozen since 9 Oct 2026')
  assert.equal(THEME_WORDS.onlyWhen('Headline size', 'Display'), 'Only when Headline size is Display')
  assert.equal(THEME_WORDS.onlyWhen('Show the button', true), 'Only when Show the button is On')
})

// ─── the actions, by shape ─────────────────────────────────────────────────────────────────────────────────────────

test('every writer is (previous, formData), refuses without a project id, and checks the rules BEFORE it writes', () => {
  for (const name of ['setPostsPerPage', 'promoteControl', 'updateSetting', 'deleteSetting']) {
    const body = new RegExp(`export async function ${name}\\(_previous: SettingsResult \\| null, formData: FormData\\): Promise<SettingsResult> \\{\\n  const id = idOf\\(formData\\)`)
    assert.match(actions, body, `${name} posts with scripts off and starts from the project id`)
  }
  const fn = (name: string) => actions.slice(actions.indexOf(`export async function ${name}(`), actions.indexOf('\n}\n', actions.indexOf(`export async function ${name}(`)))
  /** `first` is in `body`, and before `then` — an absent call is a failure, never a -1 that sorts first */
  const before = (body: string, first: string, then: string, why: string) => {
    const a = body.indexOf(first)
    const b = body.indexOf(then)
    assert.ok(a >= 0 && b >= 0 && a < b, `${why}: ${first} before ${then}`)
  }
  // posts per page: the module's 1–100 first, then the one column (AD-31)
  before(fn('setPostsPerPage'), "postsPerPage(formData.get('posts_per_page'))", '.update(', 'refused before the write')
  assert.match(fn('setPostsPerPage'), /\.update\(\{ posts_per_page: size \}\)/)
  // promote: the cap and every rule before the insert
  const promote = fn('promoteControl')
  before(promote, 'rows.length >= USER_SETTING_CAP', 'editorData(id)', 'a full project costs no docs read')
  before(promote, 'checkSetting(row, others)', '.insert(', 'refused before the insert')
  // an edit never writes the key — the update grant omits it, and so does this
  const update = fn('updateSetting')
  before(update, 'checkSetting(row, others)', '.update(', 'refused before the update')
  assert.doesNotMatch(update.slice(update.indexOf('.update(')), /\bkey:/)
  // a delete clears every condition naming the setting first, then deletes
  before(fn('deleteSetting'), 'visibility_condition: null', '.delete()', 'conditions cleared first')
  // the database's floor speaks the module's words, never a Postgres code
  assert.match(actions, /error\?\.code === '23514' && \/cap\/\.test\(error\.message \?\? ''\)\s*\? SETTING_WORDS\.cap/)
  assert.match(actions, /error\?\.code === '23505'\s*\? SETTING_WORDS\.taken\(key\)/)
  assert.match(actions, /error\?\.code === '42501'\s*\? SETTING_WORDS\.frozen/)
})
