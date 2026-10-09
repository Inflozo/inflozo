// Story 7.9 — FR-Q2's rules (`@inflozo/section-runtime`'s `custom-settings.ts`) executed on BOTH pinned gscans, never
// asserted (standing rule 1): a theme whose `package.json` carries `config.custom` built from the module's output — every
// key read by a `{{@custom.*}}` line, since a declared setting nothing reads is `GS100` — passes with no `GS010-PJ-CUST-*`
// finding, and each input the module refuses, emitted anyway, fails gscan's matching rule and that rule alone.
//
// The theme is `gate.test.ts`'s clean base, made in memory (a core package's test opens no file, AD-1).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkSetting, ghostEntry, settingOf, SETTING_CAP, USER_SETTING_CAP, type SettingRow } from '@inflozo/section-runtime'
import type { ControlDef } from '@inflozo/library'
import { GSCAN, installedRules, runGscan } from './index.ts'
import type { Major } from './index.ts'

const MAJORS = Object.keys(GSCAN).map(Number) as Major[]

const shell = `<!DOCTYPE html>
<html lang="{{@site.locale}}">
<head>
<title>{{meta_title}}</title>
<link rel="stylesheet" href="{{asset "css/screen.css"}}">
{{ghost_head}}
</head>
<body class="{{body_class}}">
{{{body}}}
{{ghost_foot}}
</body>
</html>
`
/** The clean base theme with `custom` and a reader per key. */
const theme = (custom: Record<string, unknown>): Record<string, string> => ({
  'package.json': `${JSON.stringify({ name: 'gate-base', version: '1.0.0', author: { email: 'hello@inflozo.com' }, keywords: ['ghost-theme'], config: { posts_per_page: 12, card_assets: true, custom } }, null, 2)}\n`,
  'default.hbs': shell,
  'index.hbs': `{{!< default}}\n${Object.keys(custom).map((k) => `<p>{{@custom.${k}}}</p>`).join('\n')}\n{{#foreach posts}}<a href="{{url}}">{{title}}</a>{{/foreach}}\n`,
  'post.hbs': '{{!< default}}\n{{#post}}<article>{{content}}</article>{{/post}}\n',
  'page.hbs': '{{!< default}}\n{{#post}}{{#if @page.show_title_and_feature_image}}<h1>{{title}}</h1>{{/if}}{{content}}{{/post}}\n',
  'assets/css/screen.css': '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\nbody { font-family: var(--gh-font-body, serif); }\nh1 { font-family: var(--gh-font-heading, serif); }\n',
})
const customOf = (rows: readonly SettingRow[]) => Object.fromEntries(rows.map((r) => [r.key, ghostEntry(r)]))
/** Every finding's code, on one major. */
const scan = async (custom: Record<string, unknown>, major: Major) => (await runGscan(theme(custom), major)).results.map((r) => r.code)

const control = (over: Partial<ControlDef>): ControlDef =>
  ({ name: 'x', type: 'segmented', label: 'X', group: 'style', values: ['a', 'b'], default: 'a', ...over }) as ControlDef
const row = (key: string, over: Partial<SettingRow>): SettingRow =>
  ({ key, label: key, type: 'boolean', options: null, default_value: 'true', group_name: 'site_wide', visibility_condition: null, ...over })

// the module's own output: a toggle, a segmented and a named select promoted, one per group, and both kinds of condition
const BUTTON = row('show_the_button', { ...settingOf(control({ type: 'toggle', values: ['on', 'off'], default: 'on' }), 'on'), visibility_condition: { key: 'headline_size', value: 'Display' } })
const HEADLINE = row('headline_size', { label: 'Headline size', group_name: 'homepage', ...settingOf(control({ values: ['medium', 'large', 'display'], default: 'large' }), 'large') })
const WIDTH = row('field_width', { group_name: 'post', ...settingOf(control({ type: 'named-select', values: ['narrow', 'wide', 'wide-open'], valueLabels: { 'wide-open': 'Wide Open' }, default: 'narrow' }), 'wide-open'), visibility_condition: { key: 'show_the_button', value: false } })
const CLEAN = [BUTTON, HEADLINE, WIDTH]

test('the module\'s own output passes both pinned gscans with no GS010-PJ-CUST-* finding — and with no finding at all', async () => {
  for (const r of CLEAN) assert.equal(checkSetting(r, CLEAN.filter((o) => o !== r)), null, `${r.key}: the module accepts it`)
  assert.deepEqual(customOf(CLEAN).field_width, { type: 'select', options: ['Narrow', 'Wide', 'Wide Open'], default: 'Wide Open', group: 'post', visibility: 'show_the_button:false' })
  for (const major of MAJORS) assert.deepEqual(await scan(customOf(CLEAN), major), [], `gscan ${GSCAN[major].version}`)
  // the control: the same theme with one reader removed is GS100 on both, so the scan above really read `custom`
  for (const major of MAJORS) {
    const files = theme(customOf(CLEAN))
    files['index.hbs'] = (files['index.hbs'] as string).replace('<p>{{@custom.field_width}}</p>', '')
    assert.deepEqual((await runGscan(files, major)).results.map((r) => r.code), ['GS100-NO-UNUSED-CUSTOM-THEME-SETTING'], `gscan ${GSCAN[major].version}`)
  }
})

test('the cap: twenty settings pass, a twenty-first is GS010-PJ-CUST-THEME-TOTAL-SETTINGS — and the module stops at the user\'s seventeen', async () => {
  const many = (n: number) => Array.from({ length: n }, (_, i) => row(`setting_${i + 1}`, {}))
  assert.notEqual(checkSetting(row('one_more', {}), many(USER_SETTING_CAP)), null)
  for (const major of MAJORS) {
    assert.deepEqual(await scan(customOf(many(SETTING_CAP)), major), [], `gscan ${GSCAN[major].version}: ${SETTING_CAP}`)
    assert.deepEqual(await scan(customOf(many(SETTING_CAP + 1)), major), ['GS010-PJ-CUST-THEME-TOTAL-SETTINGS'], `gscan ${GSCAN[major].version}: ${SETTING_CAP + 1}`)
  }
})

/** Each rule broken once: the row the module refuses (or, where the row is not the fault, the entry), and gscan's code. */
const BROKEN: readonly { rule: string; rows: SettingRow[]; custom?: Record<string, unknown> }[] = [
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-CASE', rows: [row('Show', {})] },
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-TYPE', rows: [row('wide', { type: 'number' as never })] },
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-SELECT-OPTIONS', rows: [{ ...HEADLINE, options: [{ value: 'large', label: 'Large' }] }] },
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-SELECT-DEFAULT', rows: [{ ...HEADLINE, default_value: 'large' }] },
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-COLOR-DEFAULT', rows: [row('accent', { type: 'color', default_value: '#abc' })] },
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-IMAGE-DEFAULT', rows: [row('logo', { type: 'image', default_value: 'https://example.com/a.png' })] },
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-VISIBILITY-VALUE', rows: [row('wide', { visibility_condition: { key: 'gone', value: true } })] },
  // where the ROW is sound and only an emitter could break it: a boolean default as text, and an unterminated condition
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-BOOLEAN-DEFAULT', rows: [], custom: { wide: { type: 'boolean', default: 'true' } } },
  { rule: 'GS010-PJ-CUST-THEME-SETTINGS-VISIBILITY-SYNTAX', rows: [], custom: { ...customOf([HEADLINE]), wide: { type: 'boolean', default: true, visibility: "headline_size:'Display" } } },
]

test('each rule the module holds, broken, fails gscan\'s matching code and no other — on both pins', async () => {
  for (const { rule, rows, custom } of BROKEN) {
    for (const r of rows) assert.notEqual(checkSetting(r, []), null, `${rule}: the module refuses ${r.key}`)
    for (const major of MAJORS) assert.deepEqual(await scan(custom ?? customOf(rows), major), [rule], `${rule} on gscan ${GSCAN[major].version}`)
  }
})

test('a group outside Ghost\'s two is only a gscan RECOMMENDATION (FR-Q2: Ghost Admin buckets it into Site wide) — the module refuses it anyway', async () => {
  const sidebar = row('wide', { group_name: 'sidebar' as never })
  assert.notEqual(checkSetting(sidebar, []), null)
  for (const major of MAJORS) {
    assert.equal(installedRules(major)['GS010-PJ-CUST-THEME-SETTINGS-GROUP']?.level, 'recommendation', `gscan ${GSCAN[major].version}`)
    assert.deepEqual(await scan(customOf([sidebar]), major), [], `gscan ${GSCAN[major].version}: no error, no warning`)
  }
})

test('a one-character key in a condition breaks gscan\'s own check (:225) — which is why the module wants two', async () => {
  assert.equal(checkSetting(row('w', {}), []), 'A key needs at least two letters.')
  for (const major of MAJORS) {
    const codes = await scan({ w: { type: 'boolean', default: true }, wide: { type: 'boolean', default: true, visibility: 'w:true' } }, major)
    // Story 7.7's cascade: the check throws, so every `package.json` rule fails, `GS010-PJ-PARSE` with them
    assert.ok(codes.includes('GS010-PJ-PARSE') && codes.includes('GS010-PJ-CUST-THEME-SETTINGS-TYPE'), `gscan ${GSCAN[major].version}: ${codes.join(', ')}`)
  }
})
