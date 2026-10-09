// Story 7.9 — FR-Q2's rules, held to the spec's I/O matrix (the module's rows). The same rules on both pinned gscans are
// `packages/theme-compiler/gate/custom-settings.test.ts`; the cap against the migration's trigger is `apps/web/settings.test.ts`
// (a core package's test opens no file, AD-1).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CONTROL_TYPES, type ControlDef } from '@inflozo/library'
import {
  checkSetting, claimKey, GHOST_SETTING_TYPES, postsPerPage, PROMOTED_TYPE, RESERVED_SETTING_KEYS, SETTING_CAP, SETTING_WORDS,
  settingKey, settingOf, USER_SETTING_CAP, visibilityNql, type SettingRow,
} from './custom-settings.ts'

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

test('label → key: lowercase snake_case, two characters at least, a collision takes _2, _3', () => {
  assert.equal(settingKey('Show the Button!'), 'show_the_button')
  assert.equal(settingKey('  Wide  '), 'wide')
  assert.equal(settingKey('2nd line'), 'nd_line')
  assert.equal(settingKey('W'), 'w')
  assert.equal(settingKey('🎉'), '')
  assert.equal(claimKey(new Set(), 'show_tag'), 'show_tag')
  assert.equal(claimKey(new Set(['show_tag']), 'show_tag'), 'show_tag_2')
  assert.equal(claimKey(new Set(['show_tag', 'show_tag_2']), 'show_tag'), 'show_tag_3')
  assert.equal(checkSetting(row({ key: 'w' }), []), 'A key needs at least two letters.')
  assert.equal(checkSetting(row({ key: '' }), []), 'A key needs at least two letters.', 'a label that leaves no key')
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
  assert.equal(visibilityNql({ key: 'headline_size', value: 'Display' }), "headline_size:'Display'")
  assert.equal(visibilityNql({ key: 'show_the_button', value: true }), 'show_the_button:true')
})

test('posts per page: a whole number from 1 to 100, or the sentence', () => {
  assert.equal(postsPerPage('13'), 13)
  assert.equal(postsPerPage('1'), 1)
  assert.equal(postsPerPage('100'), 100)
  for (const bad of ['0', '101', '12.5', 'abc', '', ' ', null, undefined, 12]) assert.equal(postsPerPage(bad), 'Posts per page is a whole number from 1 to 100.', String(bad))
})
