import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import type { PropDef, SectionRegistryEntry } from '@inflozo/library'
import { DATA_WORDS, replaceRange, SETTING_WORDS, USER_SETTING_CAP, type ProjectDoc, type SettingRow } from '@inflozo/section-runtime'
import { THEME_SETTINGS_LINK } from './lib/data-group.ts'
import {
  bindingsOf, boundLabels, choicesOf, conditionOf, droppedWords, EVERY_PAGE, fileName, liveHolder, locked, lockedContent, namesOn, orderedDocs, packInForce, pageOf, parkedOn,
  placedControls, promotable, refusalOf, rowStates, settingsReadOnly, siteBasics, startOf, storedSettings, STYLE_PACK, THEME_WORDS, unlocked,
  type Promotable, type StoredSetting,
} from './lib/theme-settings.ts'

/* STORY 7.9 — Theme settings' app rows of the I/O matrix. Ghost's own rules are the runtime's `custom-settings.test.ts` and,
   on both pinned gscans, the theme compiler's `gate/custom-settings.test.ts`; what is held here is the page's half — the
   controls the Promote form offers, Site basics, the read-only rule, the words — and, read from their source as
   `dark-mode.test.ts` reads them, the actions' shape: each refuses before it writes and maps the database's refusals. */

const SETTINGS = 'app/(app)/app/(authed)/projects/[id]/settings'
const actions = readFileSync(`${SETTINGS}/actions.ts`, 'utf8')
const page = readFileSync(`${SETTINGS}/theme-settings.tsx`, 'utf8')

test('the user cap is the trigger\'s: the module derives 17, the migrations count to it, and its refusal reads as the cap', () => {
  // every migration in order, the LAST definition winning — a later file that redefines the trigger is the one in force
  const dir = '../../supabase/migrations'
  const bodies = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
    .flatMap((f) => [...readFileSync(`${dir}/${f}`, 'utf8').matchAll(/create or replace function public\.enforce_custom_setting_cap\(\)[\s\S]*?end \$\$/g)].map((m) => m[0]))
  const trigger = bodies.at(-1)
  assert.ok(trigger, 'the cap trigger is defined in a migration')
  assert.equal(Number(/where project_id = new\.project_id\) >= (\d+) then/.exec(trigger)?.[1]), USER_SETTING_CAP)
  // `refusalOf` names the cap by its message; the trigger's own words are what PostgREST hands back (executed at Review)
  const message = /raise exception '((?:[^']|'')*)'/.exec(trigger)?.[1]?.replace(/''/g, "'")
  assert.ok(message, 'the trigger raises a message')
  assert.equal(refusalOf({ code: '23514', message }, 'show_tag'), SETTING_WORDS.cap)
  // the control: a column check shares the code and is not the cap
  assert.equal(refusalOf({ code: '23514', message: 'new row for relation "custom_settings" violates check constraint "hex6_colour"' }, 'x'), SETTING_WORDS.couldNot)
  assert.equal(refusalOf({ code: '23505', message: 'duplicate key value' }, 'show_tag'), SETTING_WORDS.taken('show_tag'))
  assert.equal(refusalOf({ code: '42501', message: 'custom_settings.key is frozen' }, 'show_tag'), SETTING_WORDS.frozen)
  assert.equal(refusalOf(null, 'show_tag'), SETTING_WORDS.couldNot)
})

test('the posted condition, typed as its target compares: a switch\'s true/false as JSON, a choice\'s label as text', () => {
  const form = (key: string, value: string) => { const f = new FormData(); f.set('when_key', key); f.set('when_value', value); return f }
  const others = [
    { key: 'show_the_button', label: 'Show the button', type: 'boolean', options: null, default_value: 'true', group_name: 'site_wide', visibility_condition: null },
    { key: 'headline_size', label: 'Headline size', type: 'select', options: [{ value: 'large', label: 'Large' }, { value: 'display', label: 'Display' }], default_value: 'Large', group_name: 'site_wide', visibility_condition: null },
  ] satisfies SettingRow[]
  assert.deepEqual(conditionOf(form('show_the_button', 'true'), others), { key: 'show_the_button', value: true })
  assert.deepEqual(conditionOf(form('show_the_button', 'false'), others), { key: 'show_the_button', value: false })
  assert.deepEqual(conditionOf(form('headline_size', 'Display'), others), { key: 'headline_size', value: 'Display' })
  // a choice's "true" stays text (the control), and no setting named is no condition
  assert.deepEqual(conditionOf(form('headline_size', 'true'), others), { key: 'headline_size', value: 'true' })
  assert.equal(conditionOf(form('', 'true'), others), null)
  assert.equal(conditionOf(new FormData(), others), null)
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
  // Story 7.10: a design prints its props, and this one prints none, so only its controls are offered
  contentSchema: {},
  html: '<section class="a4-13"></section>',
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
    site: doc(instance('s1', { layerName: 'Header' })), // stored last, listed first: it is on every page
  }
  const placed = placedControls(docs, { 'a4/13': LATEST }, new Set(['tag']))
  assert.deepEqual(placed.map((c) => [c.instanceId, c.controlKey, c.label]), [
    ['s1', 'headline-size', 'Header · Headline size'],
    ['s1', 'primary-action', 'Header · Primary action'],
    ['i1', 'headline-size', 'Latest Post · Headline size'],
    ['i1', 'primary-action', 'Latest Post · Primary action'],
    ['i2', 'headline-size', 'Latest Post · Headline size (2)'],
    ['i2', 'primary-action', 'Latest Post · Primary action (2)'],
  ])
  // the instance's own value, as the label Ghost will print
  assert.equal(placed[2]?.setting.default_value, 'Display')
  assert.deepEqual(placed[3]?.setting, { type: 'boolean', options: null, default_value: 'true' })
  // Question 5: where each control is, in the menu's words — its own name, its section, its page and the group it suggests
  assert.deepEqual(placed.map((c) => [c.control, c.section, c.page, c.group, c.category]), [
    ['Headline size', 'Header', EVERY_PAGE, 'site_wide', 'a4'],
    ['Primary action', 'Header', EVERY_PAGE, 'site_wide', 'a4'],
    ['Headline size', 'Latest Post', 'Home', 'homepage', 'a4'],
    ['Primary action', 'Latest Post', 'Home', 'homepage', 'a4'],
    ['Headline size', 'Latest Post (2)', 'Post', 'post', 'a4'],
    ['Primary action', 'Latest Post (2)', 'Post', 'post', 'a4'],
  ])
  // a control already promoted on that instance is not offered again, and its row names it
  const row = stored({ bound_to: { kind: 'control', instanceId: 'i1', controlKey: 'primary-action' } })
  assert.deepEqual(promotable(placed, [row]).map((c) => c.label), [
    'Header · Headline size', 'Header · Primary action', 'Latest Post · Headline size', 'Latest Post · Headline size (2)', 'Latest Post · Primary action (2)',
  ])
  assert.deepEqual(boundLabels(placed, [row]), { [row.id]: 'Latest Post · Primary action' })
  assert.deepEqual(boundLabels(placed, [stored({ bound_to: { kind: 'control', instanceId: 'gone', controlKey: 'x' } })]), {})
})

test('a control another one greys is offered at the value it renders, the one the canvas shows (Story 7.9\'s Review)', () => {
  const ACTIONS = {
    name: 'Latest Post',
    controlSchema: [
      { name: 'primary-action', type: 'toggle', label: 'Primary action', group: 'content', values: ['on', 'off'], default: 'on' },
      { name: 'secondary-action', type: 'toggle', label: 'Secondary action', group: 'content', values: ['on', 'off'], default: 'on',
        disabledBy: { control: 'primary-action', whenValue: 'off', inForce: 'off', reason: 'A secondary action needs a primary beside it.' } },
    ],
    contentSchema: {},
    html: '<section class="a4-13"></section>',
  } as unknown as SectionRegistryEntry
  const secondary = (controls: Record<string, string>) =>
    placedControls({ home: doc(instance('i1', { controls })) }, { 'a4/13': ACTIONS }).find((c) => c.controlKey === 'secondary-action')?.setting.default_value
  assert.equal(secondary({ 'primary-action': 'off', 'secondary-action': 'on' }), 'false', 'greyed: the value it renders')
  assert.equal(secondary({ 'primary-action': 'on', 'secondary-action': 'on' }), 'true', 'the control: live, its own value')
})

test('each stored doc\'s page in D5b\'s words, the Ghost group it suggests, and its place in the menu (Question 5)', () => {
  assert.deepEqual(pageOf('site'), { page: 'Every page', group: 'site_wide', rank: -1 })
  assert.deepEqual(pageOf('home'), { page: 'Home', group: 'homepage', rank: 0 })
  assert.deepEqual(pageOf('index'), { page: 'Home page 2', group: 'homepage', rank: 0.5 })
  assert.equal(pageOf('post').group, 'post')
  assert.deepEqual([pageOf('tag-paged').page, pageOf('tag-paged').group], ['Tag page 2', 'site_wide'])
  assert.equal(pageOf('error').page, '404')
  assert.equal(pageOf('custom:custom-signup.hbs').page, 'Signup', 'a membership canvas is a custom template with a name of its own')
  assert.equal(pageOf('custom:custom-landing.hbs').page, 'custom-landing.hbs', 'a custom template outside the switcher, by its file')
  assert.ok(pageOf('home').rank < pageOf('index').rank && pageOf('index').rank < pageOf('post').rank && pageOf('post').rank < pageOf('custom:custom-landing.hbs').rank)
})

test('what a menu row and "What your site\'s owner will see" say (Question 5) — the name is the key\'s (Question 6)', () => {
  const choice: Promotable['setting'] = { type: 'select', options: [{ value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }], default_value: 'Large' }
  const toggle: Promotable['setting'] = { type: 'boolean', options: null, default_value: 'false' }
  assert.deepEqual(choicesOf(choice), ['Medium', 'Large'])
  assert.deepEqual(choicesOf(toggle), ['On', 'Off'])
  assert.equal(THEME_WORDS.now(startOf(choice)), 'now Large')
  assert.equal(THEME_WORDS.now(startOf(toggle)), 'now Off')
  assert.equal(THEME_WORDS.gets({ kind: 'control', control: 'Headline size', section: 'Latest Post', page: 'Home', setting: choice }, 'Headline size', 'homepage'),
    "In Ghost's Design panel, under Homepage, your site's owner will see “Headline size”, a list set to Large. It changes Headline size on Latest Post, on your Home page.")
  assert.equal(THEME_WORDS.gets({ kind: 'control', control: 'Primary action', section: 'Header', page: EVERY_PAGE, setting: toggle }, 'Show the button', 'site_wide'),
    "In Ghost's Design panel, under Site wide, your site's owner will see “Show the button”, a switch set to Off. It changes Primary action on Header, on every page.")
  // a section only on a page 2 is on "your Home page 2", never "your Home page 2 page"
  assert.match(THEME_WORDS.gets({ kind: 'control', control: 'Headline size', section: 'Latest Post', page: pageOf('index').page, setting: choice }, 'Headline size', 'homepage'), /on your Home page 2\.$/)
  // the page names a setting by its key wherever it names one, and its edit form posts no label (Question 6)
  assert.doesNotMatch(page, /\{setting\.label\}|target\?\.label|deleteTitle\(setting\.label\)|label: o\.label, active: o\.key/)
  assert.doesNotMatch(page.slice(page.indexOf('function EditForm('), page.indexOf('function Fixed(')), /name="label"/)
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
  // the logo's name as D6a prints it: the file, never a trailing slash or a query
  assert.equal(fileName('https://x.example/content/images/logo.png?v=3'), 'logo.png')
  assert.equal(fileName('https://x.example/content/images/logo/'), 'logo')
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

test('Question 4: the project-mode block sits flat in the column under its rule, as D6a draws it — no card, no shadow', () => {
  const block = page.slice(page.indexOf('function ModeBlock('), page.indexOf('function ModeSegment('))
  assert.match(block, /<div data-mode-block className="flex flex-col gap-\[9px\] border-t border-line-faint pt-\[14px\]">/)
  assert.doesNotMatch(block, /shadow-sm|max-w-\[520px\]|[\s"]p-\[18px\]/)
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
  // Story 7.10's Question 2, ruled option 2: Ghost forgets a stored value at the deploy that leaves its key out
  assert.equal(THEME_WORDS.deleteBody({ key: 'show_the_button', frozen_at: '2026-10-09T10:00:00Z' }),
    "Promote a control with the key show_the_button again before your next deploy and the value your site's owner set in Ghost comes back. After that deploy, Ghost forgets it.")
  assert.equal(THEME_WORDS.frozenSince('2026-10-09T23:30:00Z'), 'Key frozen since 9 Oct 2026')
  // the delete clears every condition naming the setting, and the confirm says so before it does
  assert.equal(THEME_WORDS.deleteDependents(['Show the button']), 'The “Only show when” on Show the button is removed too.')
  assert.equal(THEME_WORDS.deleteDependents(['Show the button', 'Show tag', 'Wide']), 'The “Only show when” on Show the button, Show tag and Wide is removed too.')
  assert.equal(THEME_WORDS.onlyWhen('Headline size', 'Display'), 'Only when Headline size is Display')
  assert.equal(THEME_WORDS.onlyWhen('Show the button', true), 'Only when Show the button is On')
})

// ─── the actions, by shape ─────────────────────────────────────────────────────────────────────────────────────────

test('every writer is (previous, formData), refuses without a project id, and checks the rules BEFORE it writes', () => {
  for (const name of ['setPostsPerPage', 'promoteControl', 'updateSetting', 'deleteSetting']) {
    const body = new RegExp(`export async function ${name}\\(_previous: SettingsResult \\| null, formData: FormData\\): Promise<SettingsResult> \\{\\n  const id = idOf\\(formData\\)`)
    assert.match(actions, body, `${name} is a plain form's action and starts from the project id`)
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
  // Question 6: the key is the label's, worked out here — nothing posted names one — and the label stored is Ghost's name for it
  assert.doesNotMatch(promote, /formData\.get\('key'\)/)
  assert.match(promote, /const key = claimKey\(new Set\(rows\.map\(\(r\) => r\.key\)\), settingKey\(String\(formData\.get\('label'\) \?\? ''\)\)\)/)
  assert.match(promote, /label: ghostName\(key\),/)
  // an edit never writes the key — the update grant omits it, and so does this — nor, since Question 6, the label
  const update = fn('updateSetting')
  before(update, 'checkSetting(row, others)', '.update(', 'refused before the update')
  assert.doesNotMatch(update.slice(update.indexOf('.update(')), /\bkey:|\blabel:/)
  assert.doesNotMatch(update, /posted\('label'\)/)
  // a delete and the conditions naming it are ONE call — the database's transaction (Question 7, option 2), never two writes
  assert.match(fn('deleteSetting'), /\.rpc\('delete_custom_setting', \{ p_project: id, p_setting: settingId \}\)/)
  assert.doesNotMatch(fn('deleteSetting'), /\.delete\(\)|\.update\(/)
  // the database's floor speaks the module's words, never a Postgres code — `refusalOf`, run above, on every write's error
  assert.equal(actions.match(/return \{ error: refusalOf\(error, row\.key\) \}/g)?.length, 2, 'promote and edit')
})

// ─── Story 7.10 — texts, pictures and the accent; a row's state; the editor's bindings; the words ───────────────────────

const HERO = {
  name: 'Latest Post',
  controlSchema: [{ name: 'headline-size', type: 'segmented', label: 'Headline size', group: 'style', values: ['medium', 'large', 'display'], default: 'large' }],
  contentSchema: {
    headline: { type: 'text', label: 'Headline' },
    sub: { type: 'richtext', label: 'Sub', marks: ['strong', 'a'] },
    picture: { type: 'image', label: 'Picture' },
    link: { type: 'url', label: 'Link' },
    members: { type: 'text', label: 'Members', tokens: ['members'] },
    'items[].title': { type: 'text', label: 'Item title' },
    unprinted: { type: 'text', label: 'Never printed' },
  },
  html: '<section class="x"><h1 data-prop="headline">h</h1><p data-prop="sub">s</p><img data-prop-attr="src:picture;href:link" alt=""><p data-prop="members">m</p><ul><li data-items="items"><span data-prop="items[].title">t</span></li></ul></section>',
} as unknown as SectionRegistryEntry
const SUB = { text: 'One essay, every Thursday.', marks: [{ start: 17, end: 25, mark: 'a', href: 'https://example.com' }] }
const PAPER_LIKE = { name: 'Paper', light: { accent: '#D96C3F' } }

test('(7.10) Promote offers the texts, rich texts and pictures a design prints and the accent last — never a link, a list\'s field, a tokens prop or an unprinted one', () => {
  const docs = { home: doc(instance('i1', { content: { headline: 'Big words', sub: SUB }, controls: { 'headline-size': 'display' } })) }
  const placed = placedControls(docs, { 'a4/13': HERO }, new Set(), PAPER_LIKE)
  assert.deepEqual(placed.map((c) => [c.kind, c.path, c.label, c.id]), [
    ['control', 'headline-size', 'Latest Post · Headline size', 'control:i1:headline-size'],
    ['prop', 'headline', 'Latest Post · Headline', 'prop:i1:headline'],
    ['prop', 'sub', 'Latest Post · Sub', 'prop:i1:sub'],
    ['prop', 'picture', 'Latest Post · Picture', 'prop:i1:picture'],
    ['token', 'accent', 'Accent', 'token:accent'],
  ])
  const by = (id: string) => placed.find((c) => c.id === id) as Promotable
  assert.deepEqual(by('prop:i1:headline').setting, { type: 'text', options: null, default_value: 'Big words' })
  assert.deepEqual(by('prop:i1:sub').setting, { type: 'text', options: null, default_value: 'One essay, every Thursday.' }, 'the words alone')
  assert.deepEqual(by('prop:i1:picture').setting, { type: 'image', options: null, default_value: null })
  // D6c for a rich text, the caution for the accent, nothing for a plain text (it has no formatting to lose)
  assert.deepEqual(placed.map((c) => c.confirm), [null, null, 'formatting', null, 'accent'])
  assert.deepEqual(by('prop:i1:sub').value, SUB, 'the line the confirm shows with and without its link')
  const accent = by('token:accent')
  assert.deepEqual([accent.page, accent.control, accent.group, accent.setting], [STYLE_PACK, 'Accent colour', 'site_wide', { type: 'color', options: null, default_value: '#D96C3F' }])
  // without the pack, no accent row (the editor's panel never needs one)
  assert.equal(placedControls(docs, { 'a4/13': HERO }).some((c) => c.kind === 'token'), false)
  // a promoted prop or the accent is not offered again, and its row is named
  const rows = [stored({ id: '00000000-0000-4000-8000-0000000000a1', key: 'sub', type: 'text', bound_to: { kind: 'prop', instanceId: 'i1', path: 'sub' } }),
    stored({ id: '00000000-0000-4000-8000-0000000000a2', key: 'accent_colour', type: 'color', bound_to: { kind: 'token', token: 'accent' } })]
  assert.deepEqual(promotable(placed, rows).map((c) => c.id), ['control:i1:headline-size', 'prop:i1:headline', 'prop:i1:picture'])
  assert.deepEqual(boundLabels(placed, rows), { [rows[0]!.id]: 'Latest Post · Sub', [rows[1]!.id]: 'Accent' })
  // the pack in force: the project's own record of it, else the preset's
  const packs = [{ id: 'paper', record: PAPER_LIKE }, { id: 'ocean', record: { name: 'Ocean', light: { accent: '#0055AA' } } }]
  assert.equal(packInForce('ocean', packs, {}).light.accent, '#0055AA')
  assert.equal(packInForce('ocean', packs, { ocean: { name: 'Ocean', light: { accent: '#112233' } } }).light.accent, '#112233')
})

test('(7.10) each row\'s state and start, from the module over the stored docs: live with its start, parked, hidden, deleted, changed', () => {
  const live = doc(instance('i1', { content: { sub: SUB }, controls: { 'headline-size': 'display' } }))
  const PLAIN = { ...HERO, name: 'Plain', controlSchema: [], html: '<section class="y"><p data-prop="sub">s</p></section>' } as unknown as SectionRegistryEntry
  const rows = [
    stored({ id: 'r1', key: 'headline_size', type: 'select', bound_to: { kind: 'control', instanceId: 'i1', controlKey: 'headline-size' } }),
    stored({ id: 'r2', key: 'sub', type: 'text', bound_to: { kind: 'prop', instanceId: 'i1', path: 'sub' } }),
    stored({ id: 'r3', key: 'accent_colour', type: 'color', bound_to: { kind: 'token', token: 'accent' } }),
    stored({ id: 'r4', key: 'gone_one', type: 'boolean', bound_to: { kind: 'control', instanceId: 'nowhere', controlKey: 'x' } }),
    stored({ id: 'r5', key: 'odd_one', type: 'boolean', bound_to: { kind: 'other' } }),
  ]
  const states = rowStates(rows, orderedDocs({ home: live }), { 'a4/13': HERO }, PAPER_LIKE)
  assert.deepEqual(states['r1'], { state: 'live', start: 'Display', note: null })
  assert.deepEqual(states['r2'], { state: 'live', start: null, note: null }, 'a text prints no start')
  assert.deepEqual(states['r3'], { state: 'live', start: '#D96C3F', note: null })
  assert.deepEqual(states['r4'], { state: 'deleted', start: null, note: 'Its section is gone. Delete this setting, or bring the section back, before your next deploy.' })
  assert.deepEqual(states['r5'], { state: 'changed', start: null, note: 'Odd one was promoted from a control that has changed. Delete it and promote it again.' })
  // shuffled to a design without the choice: parked, named by its section and design
  const parked = rowStates(rows.slice(0, 1), [doc(instance('i1', { designId: 'a4/2' }))], { 'a4/2': PLAIN }, PAPER_LIKE)
  assert.deepEqual(parked['r1'], { state: 'parked', start: null, note: "Won't appear in Ghost while Latest Post uses Plain." })
  const hidden = rowStates(rows.slice(0, 1), [doc(instance('i1', { hidden: true }))], { 'a4/13': HERO }, PAPER_LIKE)
  assert.deepEqual(hidden['r1'], { state: 'hidden', start: null, note: 'Its section is hidden. Show the section or delete this setting before your next deploy.' })
  // the docs in pageOf's order, synthesized ones left out
  assert.deepEqual(orderedDocs({ post: doc(instance('p')), site: doc(instance('s')), home: doc(instance('h')), tag: doc(instance('t')) }, new Set(['tag'])).map((d) => d.instances[0]?.instanceId), ['s', 'h', 'p'])
})

test('(7.10) the editor\'s bindings by instance, P0-1\'s lock as a render-time copy, and D6c\'s dropped marks', () => {
  const b = bindingsOf([
    { key: 'headline_size', bound_to: { kind: 'control', instanceId: 'i1', controlKey: 'headline-size' }, frozen_at: '2026-10-09T10:00:00Z' },
    { key: 'sub', bound_to: { kind: 'prop', instanceId: 'i1', path: 'sub' }, frozen_at: null },
    { key: 'accent_colour', bound_to: { kind: 'token', token: 'accent' }, frozen_at: null },
    { key: 'junk', bound_to: {}, frozen_at: null },
  ])
  assert.deepEqual(b.byInstance, { i1: { controls: { 'headline-size': 'headline_size' }, props: { sub: 'sub' } } })
  assert.equal(b.accent, 'accent_colour')
  assert.equal(b.count, 4, 'every stored row counts toward the cap, a junk one too')
  assert.deepEqual(namesOn(b, 'i1'), ['Headline size', 'Sub'])
  assert.deepEqual(namesOn(b, 'other'), [])
  // a shuffle onto a design that declares neither: each parked binding in Question 2's words, the frozen one with its second
  const hero = { controlSchema: [{ name: 'headline-size' }], html: '<p data-prop="sub">s</p>' } as unknown as SectionRegistryEntry
  const plain = { controlSchema: [], html: '<p>x</p>' } as unknown as SectionRegistryEntry
  assert.deepEqual(parkedOn(b, 'i1', hero, plain), [
    "Headline size won't appear in Ghost while this design is in use. Deploy before you switch back and Ghost forgets what your site's owner chose.",
    "Sub won't appear in Ghost while this design is in use.",
  ])
  assert.deepEqual(parkedOn(b, 'i1', hero, hero), [], 'the control: a design that carries both parks nothing')
  // the paint's copy locks the bound rich text alone, and leaves the stored content as it was
  const schema = { sub: { type: 'richtext', label: 'Sub' }, 'nested.line': { type: 'text', label: 'Line' }, picture: { type: 'image', label: 'Picture' }, missing: { type: 'text', label: 'M' } } as Record<string, PropDef>
  const content = { sub: SUB, other: SUB, nested: { line: SUB }, picture: 'feature-03' }
  const painted = lockedContent(content, ['sub', 'nested.line', 'missing', 'picture'], schema)
  assert.deepEqual(painted, { sub: locked(SUB), other: SUB, nested: { line: locked(SUB) }, picture: 'feature-03' }, 'a picture\'s asset id is never wrapped')
  assert.deepEqual(lockedContent({ sub: 'words' }, ['sub'], schema), { sub: { text: 'words', plainText: true } }, 'a plain string is locked as well')
  assert.deepEqual(content, { sub: SUB, other: SUB, nested: { line: SUB }, picture: 'feature-03' })
  assert.equal(lockedContent(content, [], schema), content)
  // the lock is a copy: the doc's marks are kept, out of force, and taken off before anything is stored
  assert.deepEqual(locked(SUB), { ...SUB, plainText: true })
  // a rich text no one has marked yet is a plain string, and it is locked too — else its session would offer the marks
  assert.deepEqual(locked('plain words'), { text: 'plain words', plainText: true })
  // the review (2026-10-10): a bound text with no value at all is locked as well, or its session would offer the marks
  assert.deepEqual(locked(null), { text: '', plainText: true })
  assert.deepEqual(locked(undefined), { text: '', plainText: true })
  assert.equal(unlocked(locked(null)), '', 'and stores the empty string a value with no mark is')
  assert.deepEqual(unlocked(locked(SUB)), SUB)
  assert.equal(unlocked(locked('plain words')), 'plain words', 'a value with no mark goes back to the string it was')
  assert.equal(unlocked('x'), 'x')
  assert.equal(droppedWords(SUB), 'The link is dropped; its words stay.')
  assert.equal(droppedWords({ text: 'a b c', marks: [{ start: 2, end: 3, mark: 'a', href: 'https://x' }, { start: 0, end: 1, mark: 'strong' }] }), 'The bold and the link are dropped; the words stay.')
  assert.equal(droppedWords({ text: 'a b', marks: [{ start: 0, end: 1, mark: 'em' }] }), 'The italic is dropped; the words stay.')
  assert.equal(droppedWords('no marks'), null)
})

test('(7.10, the review) typing under the lock keeps the doc\'s marks, shifted, and stores no plainText — the canvas and the panel both save through `unlocked`', () => {
  const SUB = { text: 'One essay, every Thursday.', marks: [{ start: 17, end: 25, mark: 'a' as const, href: 'https://example.com/' }] }
  // the session edits the LOCKED copy (`replaceRange`, `lib/inline.ts`'s one edit), and its value goes up through `unlocked`
  const typed = unlocked(replaceRange(locked(SUB), 0, 0, 'Now: ', { typed: true }).value)
  assert.deepEqual(typed, { text: 'Now: One essay, every Thursday.', marks: [{ start: 22, end: 30, mark: 'a', href: 'https://example.com/' }] }, 'the link moved with its words')
  const appended = unlocked(replaceRange(locked(SUB), SUB.text.length, SUB.text.length, ' again', { typed: true }).value)
  assert.deepEqual(appended, { ...SUB, text: `${SUB.text} again` })
  assert.equal(JSON.stringify([typed, appended]).includes('plainText'), false, 'nothing writes the lock into a doc')
  // a plain text promoted: the same round trip, back to the plain string it is stored as
  assert.equal(unlocked(replaceRange(locked('Words'), 5, 5, '!', { typed: true }).value), 'Words!')
  // …and the two places that edit a bound text hand their value up through `unlocked`, and down through `locked`
  const editor = readFileSync('app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx', 'utf8')
  assert.match(editor, /value: boundKey === undefined \? value : locked\(value\)/)
  assert.match(editor, /setContent\(entry, at, me\.path, boundKey === undefined \? next : \(unlocked\(next\) as PropValue\), me\.item\)/)
  const sidebar = readFileSync('components/controls/sidebar.tsx', 'utf8')
  assert.match(sidebar, /field\(row, lock \? locked\(row\.value as PropValue\) : row\.value, \(value\) => commit\(setContent\(entry, state, row\.path, lock \? unlocked\(value\) : value\), 'content'\)/)
})

test('(7.10) § Words: one list, each sentence the spec\'s', () => {
  assert.equal(THEME_WORDS.promoteAction('Headline size'), "Let your site's owner change Headline size in Ghost")
  assert.equal(THEME_WORDS.inGhost, 'In Ghost')
  assert.equal(THEME_WORDS.inGhostTitle('headline_size'), 'Your site\'s owner changes “Headline size” in Ghost. Your canvas sets where it starts, on your first deploy.')
  assert.equal(THEME_WORDS.lockPill('sub'), 'Sub — plain text, set in Ghost')
  assert.equal(THEME_WORDS.confirmTitle('Sub'), 'Promote “Sub” to Ghost?')
  assert.equal(THEME_WORDS.bindingAsk(['Headline size', 'Sub'], 'deleted'), 'Headline size and Sub are promoted to Ghost from this section. Once it is deleted, your next deploy stops until you delete them in Theme settings or bring the section back.')
  assert.equal(THEME_WORDS.bindingAsk(['Sub'], 'hidden'), 'Sub is promoted to Ghost from this section. Once it is hidden, your next deploy stops until you delete it in Theme settings or bring the section back.')
  assert.equal(THEME_WORDS.parkNote('Show the button'), "Show the button won't appear in Ghost while this design is in use.")
  assert.equal(THEME_WORDS.packTitle('Ocean'), 'Switch to Ocean?')
  assert.equal(THEME_WORDS.packKeep('Paper'), 'Keep Paper')
  assert.equal(THEME_WORDS.accentCaption, "Ghost's own comments and card buttons use this colour. Your Style Pack's accent is separate.")
  const text = { kind: 'prop' as const, control: 'Sub', section: 'Latest Post', page: 'Home', setting: { type: 'text' as const, options: null, default_value: 'x' } }
  assert.equal(THEME_WORDS.gets(text, 'Sub', 'homepage'), "In Ghost's Design panel, under Homepage, your site's owner will see “Sub”, a text box. It changes Sub on Latest Post, on your Home page.")
  const picture = { ...text, control: 'Picture', setting: { type: 'image' as const, options: null, default_value: null } }
  assert.match(THEME_WORDS.gets(picture, 'Picture', 'homepage'), /an empty picture slot\. It changes Picture on Latest Post, on your Home page\. Until they choose one, your section shows its own picture\.$/)
  const accent = { kind: 'token' as const, control: 'Accent colour', section: 'Paper', page: STYLE_PACK, setting: { type: 'color' as const, options: null, default_value: '#D96C3F' } }
  assert.equal(THEME_WORDS.gets(accent, 'Accent colour', 'site_wide'), "In Ghost's Design panel, under Site wide, your site's owner will see “Accent colour”, a colour set to #D96C3F. It changes your Style Pack's accent, on every page.")
})

test('(7.10) the actions: promote finds what it stores by the posted id and refuses a rich text or the accent posted without its confirm; an edit writes no default', () => {
  const fn = (name: string) => actions.slice(actions.indexOf(`export async function ${name}(`), actions.indexOf('\n}\n', actions.indexOf(`export async function ${name}(`)))
  const promote = fn('promoteControl')
  assert.match(promote, /\.find\(\(c\) => c\.id === formData\.get\('promote'\)\)/)
  assert.match(promote, /if \(chosen\.confirm !== null && formData\.get\('confirmed'\) !== 'yes'\) return \{ error: SETTING_WORDS\.confirm \}/)
  assert.match(promote, /bound_to: chosen\.binding,/)
  const a = promote.indexOf("formData.get('confirmed')")
  assert.ok(a >= 0 && a < promote.indexOf('.insert('), 'the confirm is checked before the insert')
  assert.doesNotMatch(fn('updateSetting'), /default_value|posted\('default'\)/, 'Question 1: the canvas decides the start')
  // the page opens on the editor's ↗ — `?promote=` handed down as it came, compared with the offered ids
  const settingsPage = readFileSync(`${SETTINGS}/page.tsx`, 'utf8')
  assert.match(settingsPage, /promote=\{typeof asked === 'string' \? asked : null\}/)
  assert.match(page, /useState<string \| null>\(promote\)/)
  assert.match(page, /controls\.find\(\(c\) => c\.id === chosen\) \?\? controls\[0\]/)
  // Edit has no Default list any more (Question 1)
  assert.doesNotMatch(page.slice(page.indexOf('function EditForm('), page.indexOf('function Fixed(')), /name="default"|defaultValue/)
  // the review (2026-10-10): the sheet's **Promote it** posts the acknowledgement the action asks for, and the sheet closes on
  // any answer, so a refusal drawn under the form is seen
  const ask = page.slice(page.indexOf('function PromoteAsk('), page.indexOf('function Formatted('))
  assert.match(ask, /<Submit busy=\{THEME_WORDS\.promoting\} variant="marigold" size=\{36\} name="confirmed" value="yes">/)
  const form = page.slice(page.indexOf('function PromoteForm('), page.indexOf('function PromoteAsk('))
  assert.ok(form.indexOf('ask.current?.close()') < form.indexOf("if (!('ok' in state)) return"), 'closed before the refusal returns')
  // and the editor reads the project's settings the way Theme settings does (RLS, `SETTING_COLUMNS`, in their order)
  const read = readFileSync('app/(app)/app/(authed)/projects/[id]/(editor)/read.ts', 'utf8')
  assert.match(read, /sb\.from\('custom_settings'\)\.select\(SETTING_COLUMNS\)\.eq\('project_id', projectId\)\.order\('position'\)\.order\('created_at'\)/)
})
