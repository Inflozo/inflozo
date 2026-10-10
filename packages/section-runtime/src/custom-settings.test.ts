// Story 7.9 — FR-Q2's rules, held to the spec's I/O matrix (the module's rows). The same rules on both pinned gscans are
// `packages/theme-compiler/gate/custom-settings.test.ts`; the cap against the migration's trigger is `apps/web/settings.test.ts`
// (a core package's test opens no file, AD-1).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CONTROL_TYPES, PROP_TYPES, type ControlDef, type PropDef } from '@inflozo/library'
import {
  accentSettingOf, bindingId, bindingOf, bindingState, checkSetting, claimKey, customPath, ghostName, GHOST_SETTING_TYPES, matchChain, postsPerPage,
  PROMOTED_PROP_TYPE, PROMOTED_TYPE, propSettingOf, RESERVED_SETTING_KEYS, SETTING_CAP, SETTING_WORDS, settingKey, settingOf, startOf, USER_SETTING_CAP,
  visibilityNql, type Binding, type HolderEntry, type SettingRow,
} from './custom-settings.ts'
import type { DocInstance } from './doc-schema.ts'
import { REFERENCE_PACK } from './reference.ts'

const control = (over: Partial<ControlDef>): ControlDef =>
  ({ name: 'x', type: 'segmented', label: 'X', group: 'style', values: ['a', 'b'], default: 'a', ...over }) as ControlDef
const PRIMARY = control({ name: 'primary-action', type: 'toggle', label: 'Primary action', values: ['on', 'off'], default: 'on' })
const HEADLINE = control({ name: 'headline-size', label: 'Headline size', values: ['medium', 'large', 'display'], default: 'large' })
const row = (over: Partial<SettingRow>): SettingRow =>
  ({ key: 'show_the_button', label: 'Show the button', type: 'boolean', options: null, default_value: 'true', group_name: 'site_wide', visibility_condition: null, ...over })
const headline = row({ key: 'headline_size', label: 'Headline size', ...(settingOf(HEADLINE, 'large') as object) })

test('the meter and its caption are derived: 20 − 3 = 17, printed in D6a\'s own words', () => {
  assert.equal(SETTING_CAP, 20)
  assert.deepEqual([...RESERVED_SETTING_KEYS], ['color_scheme', 'dark_accent_color', 'dark_logo'])
  assert.equal(USER_SETTING_CAP, 17)
  assert.equal(SETTING_WORDS.limits, 'Ghost allows twenty per theme; three are the dark-mode built-ins every Inflozo project declares, so seventeen are yours.')
  assert.equal(SETTING_WORDS.meter(3), '3 OF 17')
})

test('Ghost names a setting by its key — its Design panel\'s own rule, so the label is the key\'s words (Question 6)', () => {
  assert.equal(ghostName('show_the_button'), 'Show the button')
  assert.equal(ghostName('show_tag_2'), 'Show tag 2')
  assert.equal(ghostName('rss_link'), 'RSS link', "API, CTA and RSS in capitals, as Ghost's admin raises them")
  assert.equal(ghostName('cta_api_text'), 'CTA API text')
  assert.equal(ghostName('apiary'), 'Apiary', 'a whole word only')
  // the round trip a promotion makes: the label typed becomes the key, and Ghost prints the key's words back
  assert.equal(ghostName(settingKey('Show the Button!')), 'Show the button')
})

test('label → key: lowercase snake_case, two characters at least, a collision takes _2, _3', () => {
  assert.equal(settingKey('Show the Button!'), 'show_the_button')
  assert.equal(settingKey('  Wide  '), 'wide')
  assert.equal(settingKey('2nd line'), 'nd_line')
  assert.equal(settingKey('W'), 'w')
  assert.equal(settingKey('🎉'), '')
  assert.equal(settingKey('Café menu'), 'cafe_menu', 'an accented letter keeps its letter')
  assert.equal(claimKey(new Set(), 'show_tag'), 'show_tag')
  assert.equal(claimKey(new Set(['show_tag']), 'show_tag'), 'show_tag_2')
  assert.equal(claimKey(new Set(['show_tag', 'show_tag_2']), 'show_tag'), 'show_tag_3')
  assert.equal(checkSetting(row({ key: 'w' }), []), 'A key needs at least two letters.')
  assert.equal(checkSetting(row({ key: '' }), []), 'A key needs at least two letters.', 'a label that leaves no key')
  // …as the action builds it since Question 6, the label being the key's own words: the key's sentence, not the label's
  const fromLabel = (label: string) => { const key = settingKey(label); return row({ key, label: ghostName(key) }) }
  for (const label of ['🎉', '2', '!!!']) assert.equal(checkSetting(fromLabel(label), []), SETTING_WORDS.keyShort, label)
  assert.equal(checkSetting(row({ key: 'Show' }), []), SETTING_WORDS.keyShape)
  assert.equal(checkSetting(row({ key: 'show_tag' }), [row({ key: 'show_tag' })]), SETTING_WORDS.taken('show_tag'))
})

test('a reserved key is refused with its sentence', () => {
  assert.equal(checkSetting(row({ key: settingKey('Color scheme') }), []), 'color_scheme is one of the three dark-mode settings every Inflozo theme carries.')
  for (const key of RESERVED_SETTING_KEYS) assert.notEqual(checkSetting(row({ key }), []), null, key)
})

test('the cap: the 17th lands, the 18th is refused with the sentence', () => {
  const stored = (n: number) => Array.from({ length: n }, (_, i) => row({ key: `setting_${i}` }))
  assert.equal(checkSetting(row({}), stored(USER_SETTING_CAP - 1)), null)
  assert.equal(checkSetting(row({}), stored(USER_SETTING_CAP)), 'You have used all 17 of your theme settings. Delete one to promote another.')
})

test('promote a toggle → boolean; a segmented or named select → select with {value, label} options and the label as default', () => {
  assert.deepEqual(settingOf(PRIMARY, 'on'), { type: 'boolean', options: null, default_value: 'true' })
  assert.deepEqual(settingOf(PRIMARY, 'off'), { type: 'boolean', options: null, default_value: 'false' })
  assert.deepEqual(settingOf(HEADLINE, 'large'), {
    type: 'select',
    options: [{ value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'display', label: 'Display' }],
    default_value: 'Large',
  })
  // a value outside the set is its default's — and a named label is the panel's word (R-170)
  assert.equal(settingOf(HEADLINE, 'huge')?.default_value, 'Large')
  assert.equal(settingOf(control({ values: ['center', 'start'], valueLabels: { center: 'Centred' }, default: 'center' }), 'start')?.default_value, 'Start')
  // never promoted: a stepper or a swatch row (Ghost has no number type; colour is the accent alone), or fewer than two values
  assert.equal(settingOf(control({ type: 'stepper', values: ['1', '2'] }), '1'), null)
  assert.equal(settingOf(control({ type: 'swatch-row', values: ['base', 'surface'] }), 'base'), null)
  assert.equal(settingOf(control({ values: ['only'] }), 'only'), null)
  // …or two values the panel prints alike: Ghost would offer one word twice, and no word maps back to one value
  assert.equal(settingOf(control({ values: ['a', 'b'], valueLabels: { a: 'Same', b: 'Same' } }), 'a'), null)
  // every control type has a decision, and every decision is one of Ghost's five or none
  for (const t of CONTROL_TYPES) assert.ok(PROMOTED_TYPE[t] === null || GHOST_SETTING_TYPES.includes(PROMOTED_TYPE[t]), t)
  assert.equal(checkSetting(row({ ...(settingOf(PRIMARY, 'on') as object) }), []), null)
  assert.equal(checkSetting(headline, []), null)
})

test('Ghost\'s type rules: select default in its options, boolean true/false, colour six-digit hex, image no default', () => {
  assert.equal(checkSetting(row({ type: 'select', options: [{ value: 'a', label: 'A' }], default_value: 'A' }), []), SETTING_WORDS.options)
  assert.equal(checkSetting({ ...headline, default_value: 'Huge' }, []), SETTING_WORDS.selectDefault)
  assert.equal(checkSetting({ ...headline, default_value: 'large' }, []), SETTING_WORDS.selectDefault, 'the default is the LABEL Ghost shows')
  assert.equal(checkSetting(row({ default_value: 'on' }), []), SETTING_WORDS.booleanDefault)
  assert.equal(checkSetting(row({ type: 'color', default_value: '#abc' }), []), SETTING_WORDS.colour)
  assert.equal(checkSetting(row({ type: 'color', default_value: 'red' }), []), SETTING_WORDS.colour)
  assert.equal(checkSetting(row({ type: 'color', default_value: '#1A2b3C' }), []), null)
  assert.equal(checkSetting(row({ type: 'image', default_value: 'https://x/y.png' }), []), SETTING_WORDS.imageDefault)
  assert.equal(checkSetting(row({ type: 'image', default_value: null }), []), null)
  assert.equal(checkSetting(row({ type: 'text', default_value: 'Hello' }), []), null)
  assert.equal(checkSetting(row({ type: 'number' as never }), []), SETTING_WORDS.type)
  assert.equal(checkSetting(row({ group_name: 'sidebar' as never }), []), SETTING_WORDS.group)
  assert.equal(checkSetting(row({ label: '  ' }), []), SETTING_WORDS.label)
})

test('visibility: another setting\'s label or boolean, never itself, and its NQL', () => {
  const on = (value: string | boolean, others = [headline]) => checkSetting(row({ visibility_condition: { key: 'headline_size', value } }), others)
  assert.equal(on('Display'), null)
  assert.equal(on('display'), SETTING_WORDS.conditionValue('Headline size'), 'the LABEL, which Ghost stores and compares')
  assert.equal(on('Display', []), SETTING_WORDS.condition)
  assert.equal(checkSetting(row({ visibility_condition: { key: 'show_the_button', value: true } }), []), SETTING_WORDS.self)
  const button = row({})
  assert.equal(checkSetting({ ...headline, visibility_condition: { key: 'show_the_button', value: true } }, [button]), null)
  assert.equal(checkSetting({ ...headline, visibility_condition: { key: 'show_the_button', value: 'true' } }, [button]), SETTING_WORDS.conditionValue('Show the button'))
  const quoted = { ...headline, options: [{ value: 'a', label: "Rock 'n' roll" }, { value: 'b', label: 'B' }], default_value: 'B' }
  assert.equal(checkSetting(row({ visibility_condition: { key: 'headline_size', value: "Rock 'n' roll" } }), [quoted]), SETTING_WORDS.conditionQuote)
  // a chain that comes back here — A shows when B, B when A — is refused, so Ghost can never hide both for good
  const leans = { ...headline, visibility_condition: { key: 'show_the_button', value: true } }
  assert.equal(on('Display', [leans]), SETTING_WORDS.cycle)
  const third = row({ key: 'show_tag', label: 'Show tag', visibility_condition: { key: 'headline_size', value: 'Display' } })
  assert.equal(checkSetting({ ...headline, visibility_condition: { key: 'show_tag', value: true } }, [button, third]), SETTING_WORDS.cycle, 'through a third')
  assert.equal(checkSetting(row({ visibility_condition: { key: 'show_tag', value: true } }), [headline, third]), null, 'a chain that ends is no loop (the control)')
  assert.equal(visibilityNql({ key: 'headline_size', value: 'Display' }), "headline_size:'Display'")
  assert.equal(visibilityNql({ key: 'show_the_button', value: true }), 'show_the_button:true')
})

test('posts per page: a whole number from 1 to 100, or the sentence', () => {
  assert.equal(postsPerPage('13'), 13)
  assert.equal(postsPerPage('1'), 1)
  assert.equal(postsPerPage('100'), 100)
  for (const bad of ['0', '101', '12.5', 'abc', '', ' ', null, undefined, 12]) assert.equal(postsPerPage(bad), 'Posts per page is a whole number from 1 to 100.', String(bad))
})

// ─── Story 7.10 — promoting a control, a text, a picture or the accent ─────────────────────────────────────────────

const prop = (over: Partial<PropDef>): PropDef => ({ type: 'text', label: 'Sub', ...over }) as PropDef

test('(7.10) each kind\'s Ghost type and start: a text\'s words, a rich text\'s words without its marks, a picture none, the accent the pack\'s light accent', () => {
  assert.deepEqual(propSettingOf(prop({}), 'Thursday letter'), { type: 'text', options: null, default_value: 'Thursday letter' })
  const linked = { text: 'One essay, every Thursday.', marks: [{ start: 16, end: 24, mark: 'a', href: 'https://example.com' }] }
  assert.deepEqual(propSettingOf(prop({ type: 'richtext', marks: ['a'] }), linked), { type: 'text', options: null, default_value: 'One essay, every Thursday.' })
  // no words: no start, so Ghost starts it empty and the theme falls back to the prop's own empty behaviour
  assert.deepEqual(propSettingOf(prop({}), ''), { type: 'text', options: null, default_value: null })
  assert.deepEqual(propSettingOf(prop({ type: 'image' }), 'asset-1'), { type: 'image', options: null, default_value: null })
  assert.deepEqual(accentSettingOf(REFERENCE_PACK), { type: 'color', options: null, default_value: REFERENCE_PACK.light.accent })
  assert.equal(checkSetting(row({ key: 'accent_colour', ...accentSettingOf(REFERENCE_PACK) }), []), null, 'the accent start is a colour Ghost takes')
  // never promoted: a link, a date, an icon, a list, or a prop carrying R-27's tokens (Ghost would print the braces)
  for (const type of ['url', 'date', 'icon', 'array'] as const) assert.equal(propSettingOf(prop({ type }), 'x'), null, type)
  assert.equal(propSettingOf(prop({ tokens: ['members'] }), 'Join {members} readers'), null)
  for (const t of PROP_TYPES) assert.ok(PROMOTED_PROP_TYPE[t] === null || GHOST_SETTING_TYPES.includes(PROMOTED_PROP_TYPE[t]), t)
})

test('(7.10) a choice whose value labels carry a quote, a backslash or a brace is never offered (AD-36)', () => {
  for (const bad of ['Rock "n" roll', "Rock 'n' roll", 'C:\\x', '{wide}', 'wide}']) {
    assert.equal(settingOf(control({ values: ['a', 'b'], valueLabels: { a: bad } }), 'a'), null, bad)
  }
  assert.notEqual(settingOf(control({ values: ['a', 'b'], valueLabels: { a: 'Rock & roll' } }), 'a'), null, 'the control: an ampersand is fine')
})

test('(7.10) bound_to\'s three shapes, and nothing else', () => {
  assert.deepEqual(bindingOf({ kind: 'control', instanceId: 'i1', controlKey: 'headline-size' }), { kind: 'control', instanceId: 'i1', controlKey: 'headline-size' })
  assert.deepEqual(bindingOf({ kind: 'prop', instanceId: 'i1', path: 'sub' }), { kind: 'prop', instanceId: 'i1', path: 'sub' })
  assert.deepEqual(bindingOf({ kind: 'token', token: 'accent' }), { kind: 'token', token: 'accent' })
  for (const junk of [null, [], 'control', {}, { kind: 'control', instanceId: 'i1' }, { kind: 'prop', instanceId: '', path: 'sub' }, { kind: 'token', token: 'text' }, { kind: 'other' }]) {
    assert.equal(bindingOf(junk), null, JSON.stringify(junk))
  }
  assert.equal(bindingId({ kind: 'prop', instanceId: 'i1', path: 'sub' }), 'prop:i1:sub')
  assert.equal(bindingId({ kind: 'token', token: 'accent' }), 'token:accent')
})

/* A small ring: design 1 declares headline-size and prints sub and picture; design 2 prints sub and declares neither. */
const D1: HolderEntry = {
  name: 'Latest Post', controlSchema: [HEADLINE, PRIMARY], universals: {},
  contentSchema: { sub: prop({ type: 'richtext', marks: ['a'] }), picture: prop({ type: 'image', label: 'Picture' }), link: prop({ type: 'url', label: 'Link' }) },
  html: '<section class="x"><p data-prop="sub">Sub</p><img data-prop-attr="src:picture" alt=""></section>',
}
const D2: HolderEntry = { ...D1, name: 'Centred Notice', controlSchema: [PRIMARY], html: '<section class="y"><p data-prop="sub">Sub</p></section>' }
const LIB: Record<string, HolderEntry> = { 'a4/1': D1, 'a4/2': D2 }
const inst = (over: Partial<DocInstance>): DocInstance => ({
  instanceId: 'i1', layerName: 'Latest Post', designId: 'a4/1', content: { sub: 'Hello there' }, controls: { 'headline-size': 'display' }, data: {}, darkOverrides: {},
  hidden: false, memberVisibility: 'everyone', isMainFeed: false, parkedControls: {}, ...over,
})
const docs = (...instances: DocInstance[]) => [{ instances }]
const state = (b: Binding, d: ReturnType<typeof docs>, type: SettingRow['type']) => bindingState(b, d, (id) => LIB[id], type, REFERENCE_PACK)
const HEAD: Binding = { kind: 'control', instanceId: 'i1', controlKey: 'headline-size' }
const SUB: Binding = { kind: 'prop', instanceId: 'i1', path: 'sub' }

test('(7.10) a binding\'s state: live at the start the canvas holds, parked, hidden, deleted, changed — over every stored doc', () => {
  const live = state(HEAD, docs(inst({})), 'select')
  assert.equal(live.state, 'live')
  assert.equal(live.state === 'live' && live.setting.default_value, 'Display', 'the value IN FORCE, never a stored default')
  assert.deepEqual(state(SUB, docs(inst({})), 'text'), { state: 'live', setting: { type: 'text', options: null, default_value: 'Hello there' }, holder: { instance: inst({}), entry: D1 } })
  assert.equal(state({ kind: 'prop', instanceId: 'i1', path: 'picture' }, docs(inst({})), 'image').state, 'live')
  // parked: the instance is there and visible, on a design that does not declare it (a shuffle)
  const parked = state(HEAD, docs(inst({ designId: 'a4/2' })), 'select')
  assert.equal(parked.state, 'parked')
  assert.equal(parked.state === 'parked' && parked.holder.entry.name, 'Centred Notice')
  assert.equal(state({ kind: 'prop', instanceId: 'i1', path: 'picture' }, docs(inst({ designId: 'a4/2' })), 'image').state, 'parked', 'a prop the design does not print')
  assert.equal(state(HEAD, docs(inst({ hidden: true })), 'select').state, 'hidden')
  // the review (2026-10-10): a VISIBLE section on a design the library no longer has is changed, never "hidden"
  assert.equal(state(HEAD, docs(inst({ designId: 'gone/1' })), 'select').state, 'changed')
  assert.equal(state(HEAD, docs(inst({ designId: 'gone/1', hidden: true })), 'select').state, 'hidden', 'the control: hidden, it is hidden')
  assert.equal(state(HEAD, docs(inst({ instanceId: 'other' })), 'select').state, 'deleted')
  assert.equal(state(HEAD, docs(), 'select').state, 'deleted')
  // changed: the stored type is not what it derives now, or it derives nothing (a label refused by a library update)
  assert.equal(state(HEAD, docs(inst({})), 'boolean').state, 'changed')
  assert.equal(state({ kind: 'prop', instanceId: 'i1', path: 'link' }, docs(inst({})), 'text').state, 'parked', 'a link the markup never prints')
  const quoted = { ...D1, controlSchema: [{ ...HEADLINE, valueLabels: { medium: 'Med "ium"' } }] }
  assert.equal(bindingState(HEAD, docs(inst({})), () => quoted, 'select', REFERENCE_PACK).state, 'changed')
  // a page 2 holds the same instance: one live holder is enough, and the FIRST in the docs' order decides the start
  const two = [{ instances: [inst({ hidden: true })] }, { instances: [inst({ controls: { 'headline-size': 'medium' } })] }]
  assert.equal(startOf(HEAD, two, (id) => LIB[id], 'select', REFERENCE_PACK)?.default_value, 'Medium')
  const both = [{ instances: [inst({})] }, { instances: [inst({ controls: { 'headline-size': 'medium' } })] }]
  assert.equal(startOf(HEAD, both, (id) => LIB[id], 'select', REFERENCE_PACK)?.default_value, 'Display', 'page 1 before its page 2')
  // the accent is always live, at the pack's light accent; a stored accent of another type has changed
  assert.deepEqual(state({ kind: 'token', token: 'accent' }, docs(), 'color'), { state: 'live', setting: accentSettingOf(REFERENCE_PACK) })
  assert.equal(state({ kind: 'token', token: 'accent' }, docs(), 'text').state, 'changed')
  assert.equal(startOf(HEAD, docs(inst({ hidden: true })), (id) => LIB[id], 'select', REFERENCE_PACK), null)
})

test('(7.10) the compile refuses in the module\'s own words, naming the setting as Ghost does', () => {
  assert.equal(SETTING_WORDS.deleted(ghostName('headline_size')), 'Headline size is promoted from a section that is no longer on your site. Delete the setting in Theme settings, or bring the section back.')
  assert.equal(SETTING_WORDS.hidden(ghostName('headline_size')), 'Headline size is promoted from a hidden section. Show the section, or delete the setting in Theme settings.')
  assert.equal(SETTING_WORDS.changed(ghostName('headline_size')), 'Headline size was promoted from a control that has changed. Delete it and promote it again.')
  assert.equal(SETTING_WORDS.confirm, 'Confirm first — promoting this changes what your theme carries.')
})

test('(7.10) the reader: a {{#match}} chain over every value, its {{else}} the start; a key or a label the module refuses never reaches it', () => {
  assert.equal(matchChain('show_the_button', { type: 'boolean', options: null }, 'on'),
    '{{#match @custom.show_the_button true}}on{{else match @custom.show_the_button false}}off{{else}}on{{/match}}')
  const choice = settingOf(HEADLINE, 'display') as SettingRow
  assert.equal(matchChain('headline_size', choice, 'display'),
    '{{#match @custom.headline_size "=" "Medium"}}medium{{else match @custom.headline_size "=" "Large"}}large{{else match @custom.headline_size "=" "Display"}}display{{else}}display{{/match}}')
  assert.equal(customPath('sub'), '@custom.sub')
  for (const key of ['s', 'Sub', 'sub}}{{evil', 'color_scheme', '']) assert.throws(() => customPath(key), /AD-36/, key)
  assert.throws(() => matchChain('headline_size', { type: 'select', options: [{ value: 'a', label: 'A" onclick="x' }, { value: 'b', label: 'B' }] }, 'a'), /AD-36/)
  assert.throws(() => matchChain('headline_size', choice, 'huge'), /none of the setting's values/)
  assert.throws(() => matchChain('headline_size', { type: 'select', options: [{ value: 'A}}', label: 'A' }, { value: 'b', label: 'B' }] }, 'b'), /AD-36/)
  assert.throws(() => matchChain('sub', { type: 'text', options: null }, 'x'), /no \{\{#match\}\} reader/)
})
