// Story 7.9 — FR-Q2's rules (`@inflozo/section-runtime`'s `custom-settings.ts`) executed on BOTH pinned gscans, never
// asserted (standing rule 1): a theme whose `package.json` carries `config.custom` built from the module's output — every
// key read by a `{{@custom.*}}` line, since a declared setting nothing reads is `GS100` — passes with no `GS010-PJ-CUST-*`
// finding, and each input the module refuses, emitted anyway, fails gscan's matching rule and that rule alone.
//
// The theme is `gate.test.ts`'s clean base, made in memory (a core package's test opens no file, AD-1).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { checkSetting, ghostEntry, settingOf, SETTING_CAP, USER_SETTING_CAP, type SettingRow } from '@inflozo/section-runtime'
import type { DocInstance, ProjectDoc, SynthesisLibrary } from '@inflozo/section-runtime'
import { REFERENCE_PACK } from '@inflozo/section-runtime/reference'
import type { ControlDef, PropDef, SectionRegistryEntry } from '@inflozo/library'
import { POOL } from '@inflozo/library/packs'
import { compileTheme } from '../src/index.ts'
import type { CompileSetting } from '../src/index.ts'
import { GSCAN, installedRules, qualityGate, runGscan } from './index.ts'
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

// ─── Story 7.10 — a theme COMPILED by `compileTheme` with every kind promoted, on both pinned gscans and the quality gate ───
//
// The compile writes `config.custom` in the same change as every `{{@custom.*}}` that reads it, so this is the claim
// executed (standing rule 1): a switch, a choice with a condition, a plain text, a rich text, a picture and the accent
// promoted, and one setting parked by a shuffle, score 0/0 on 4.49.7 and 6.4.2 and an empty quality verdict. Each control
// breaks one thing the compile guarantees and fails its own code (standing rule 2). The library, the pool's bytes, the
// module and Ghost's card scripts are made here, in memory, as `compile.test.ts` makes them (AD-1).

const PROMO_DESIGNS: Record<string, SectionRegistryEntry> = Object.fromEntries([
  entryOf('a4/2', 'Heroes', 'Promo', {
    compileTarget: ['home.hbs', 'index.hbs'],
    contentSchema: {
      headline: { type: 'text', label: 'Headline' } as PropDef,
      sub: { type: 'richtext', label: 'Sub', marks: ['a'] } as PropDef,
      picture: { type: 'image', label: 'Picture' } as PropDef,
    },
    controlSchema: [
      { name: 'primary-action', type: 'toggle', label: 'Primary action', group: 'content', values: ['on', 'off'], default: 'on' },
      { name: 'headline-size', type: 'segmented', label: 'Headline size', group: 'style', values: ['medium', 'large', 'display'], default: 'large' },
    ] as ControlDef[],
    css: '.a4-2 { color: var(--text-body); }\n.a4-2[data-headline-size="display"] .a4-2__h { font-size: 3rem; }\n.a4-2[data-primary-action="off"] .a4-2__sub { display: none; }\n',
    html: '<section class="a4-2">\n  <h1 class="a4-2__h" data-prop="headline" data-empty="hide">Headline</h1>\n  <p class="a4-2__sub" data-prop="sub" data-empty="hide">Sub</p>\n  <img class="a4-2__picture" data-prop-attr="src:picture" data-empty="hide" alt="">\n</section>',
  }),
  entryOf('a4/3', 'Heroes', 'Plain', {
    compileTarget: ['home.hbs', 'index.hbs'],
    contentSchema: { headline: { type: 'text', label: 'Headline' } as PropDef },
    html: '<section class="a4-3">\n  <h2 class="a4-3__h" data-prop="headline" data-empty="hide">Headline</h2>\n</section>',
  }),
  entryOf('a17/1', 'Post Grids', 'Three Up', {
    compileTarget: ['home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs'],
    bindingContext: ['posts'],
    html: '<section class="a17-1">\n  <ul class="a17-1__grid">\n    <li class="a17-1__cell" data-repeat="posts"><a class="a17-1__card" data-bind-attr="href:url" data-bind="title" data-empty="hide">Title</a></li>\n  </ul>\n</section>',
  }),
  entryOf('a24/1', 'Post Headers', 'Centred', {
    compileTarget: ['post.hbs'],
    bindingContext: ['post'],
    html: '<section class="a24-1">\n  <h1 class="a24-1__title" data-bind="title" data-empty="hide">Title</h1>\n</section>',
  }),
].map((e) => [e.id, e]))

function entryOf(id: string, categoryTitle: string, name: string, over: Partial<SectionRegistryEntry> & Pick<SectionRegistryEntry, 'html' | 'compileTarget'>): SectionRegistryEntry {
  return {
    id, category: id.split('/')[0] as string, categoryTitle, name, tier: 'free', bindingContext: ['none'], contentSchema: {}, controlSchema: [], universals: {}, absent: [],
    css: `.${id.replace('/', '-')} { color: var(--text-body); }\n`, ghostCompat: { minVersion: '5.62.0', helpers: [] }, darkCapabilities: ['tokens'], previewSeed: 'orbit-weekly',
    descriptor: { archetype: 'x', containment: 'none', ground: 'page', itemCount: 'none', mediaPlacement: 'none', emphasis: 'x' }, ...over,
  }
}

const POOL_FILES = Object.values(POOL.faces).flatMap((face) => face.files)
const poolFonts = (path: string): Uint8Array => {
  const f = POOL_FILES.find((x) => `files/${x.file}` === path)
  if (f !== undefined) return new Uint8Array(f.bytes).fill(7)
  if (Object.values(POOL.families).some((family) => family.licenceFile === path)) return new TextEncoder().encode('Copyright the authors.\n')
  throw new Error(`the pool holds no ${path}`)
}
const instance = (designId: string, layerName: string, over: Partial<DocInstance> = {}): DocInstance => ({
  instanceId: `${layerName.toLowerCase().replace(/\W+/g, '-')}-x9q`, layerName, designId, content: {}, controls: {}, data: {}, darkOverrides: {},
  hidden: false, memberVisibility: 'everyone', isMainFeed: false, parkedControls: {}, ...over,
})
/** Story 7.3's stand-in `page.hbs` and D12's two widths — `tools/pilot-theme.mjs`'s `SCAFFOLD`, each labelled for the story
 *  that owns it (10.79, 7.13), so the compiled theme meets both gscans' page-builder and card rules. */
const SCAFFOLD_FILES = {
  'assets/css/cards.css': '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n',
  'page.hbs': '{{!< default}}\n\n{{#post}}\n  {{#if @page.show_title_and_feature_image}}\n    <h1>{{title}}</h1>\n  {{/if}}\n  {{content}}\n{{/post}}\n',
}
const PROMO_ID = 'latest-post-x9q'
const PARKED_ID = 'notice-x9q'
const ctl = (instanceId: string, controlKey: string) => ({ kind: 'control', instanceId, controlKey })
const prp = (path: string) => ({ kind: 'prop', instanceId: PROMO_ID, path })
const SETTINGS: CompileSetting[] = [
  { key: 'show_the_button', type: 'boolean', group_name: 'homepage', visibility_condition: null, bound_to: ctl(PROMO_ID, 'primary-action'), position: 1 },
  { key: 'headline_size', type: 'select', group_name: 'homepage', visibility_condition: { key: 'show_the_button', value: true }, bound_to: ctl(PROMO_ID, 'headline-size'), position: 2 },
  { key: 'headline', type: 'text', group_name: 'homepage', visibility_condition: null, bound_to: prp('headline'), position: 3 },
  { key: 'sub', type: 'text', group_name: 'site_wide', visibility_condition: null, bound_to: prp('sub'), position: 4 },
  { key: 'picture', type: 'image', group_name: 'homepage', visibility_condition: null, bound_to: prp('picture'), position: 5 },
  { key: 'accent_colour', type: 'color', group_name: 'site_wide', visibility_condition: null, bound_to: { kind: 'token', token: 'accent' }, position: 6 },
  // parked: bound to a section shuffled onto a design without the choice
  { key: 'notice_size', type: 'select', group_name: 'homepage', visibility_condition: null, bound_to: ctl(PARKED_ID, 'headline-size'), position: 7 },
]
function compiledWithSettings(settings: readonly CompileSetting[] = SETTINGS): Record<string, string | Uint8Array> {
  const doc = new JSDOM('<body></body>').window.document
  const home: ProjectDoc = { schemaVersion: 1, instances: [
    instance('a4/2', 'Latest post', { content: { headline: 'Big words', sub: { text: 'One essay, every Thursday.', marks: [{ start: 17, end: 25, mark: 'a', href: 'https://example.com' }] }, picture: 'asset-1' }, controls: { 'headline-size': 'display' } }),
    instance('a4/3', 'Notice', { content: { headline: 'A notice' } }),
    instance('a17/1', 'Post grid', { isMainFeed: true }),
  ] }
  const { files } = compileTheme(doc, {
    templates: { 'home.hbs': home }, library: (id) => PROMO_DESIGNS[id], pack: REFERENCE_PACK, assets: { 'asset-1': 'https://cdn.example/one.png' }, postsPerPage: 12,
    theme: { name: 'gate-settings', version: '1.0.0', description: 'Settings' }, pairing: 'D1', fonts: poolFonts, darkEnabled: true,
    modules: { core: 'export function core(win, modules) {\n  return { stop() {}, paused: [] }\n}\n' }, ghostCards: { scripts: {}, licence: 'MIT\n' }, settings,
  })
  return { ...files, ...SCAFFOLD_FILES }
}
const codesOf = async (files: Record<string, string | Uint8Array>, major: Major) => (await runGscan(files, major)).results.map((r) => r.code)
const library: SynthesisLibrary = (id) => PROMO_DESIGNS[id]

test('(7.10) a theme compiled with a switch, a choice with a condition, a text, a rich text, a picture and the accent promoted and one parked scores 0/0 on both pinned gscans and an empty quality verdict', async () => {
  const files = compiledWithSettings()
  const custom = (JSON.parse(files['package.json'] as string) as { config: { custom: Record<string, unknown> } }).config.custom
  assert.deepEqual(Object.keys(custom), ['show_the_button', 'headline_size', 'headline', 'sub', 'picture', 'accent_colour'], 'the parked one is neither declared…')
  for (const [path, body] of Object.entries(files)) if (typeof body === 'string') assert.doesNotMatch(body, /@custom\.notice_size/, `…nor read: ${path}`)
  for (const major of MAJORS) assert.deepEqual(await codesOf(files, major), [], `gscan ${GSCAN[major].version}`)
  const verdict = qualityGate(files, { pack: REFERENCE_PACK, library })
  assert.deepEqual([...verdict.errors, ...verdict.warnings].map((f) => `${f.code}: ${f.detail ?? f.message}`), [])
})

test('(7.10) the controls, each failing its own code on both pins: a reader removed is GS100, a match on a label no option holds is GS090, a condition naming the parked key is GS010', async () => {
  const files = compiledWithSettings()
  // Home's page 2 follows page 1, so the section is hoisted to shared/ — found by what it reads, not by where it sits
  const section = Object.keys(files).find((p) => p.startsWith('partials/sections/') && String(files[p]).includes('@custom.picture')) as string
  const body = files[section] as string
  const pkg = JSON.parse(files['package.json'] as string) as { config: { custom: Record<string, Record<string, unknown>> } }
  // one reader removed: the picture's src falls back to the section's own
  const unread = { ...files, [section]: body.replace(/src="\{\{#if @custom\.picture\}\}\{\{img_url @custom\.picture\}\}\{\{else\}\}([^{]*)\{\{\/if\}\}"/, 'src="$1"') }
  assert.notEqual(unread[section], body, 'the control edited something')
  // a match against a label the select does not offer
  const unknown = { ...files, [section]: body.replace('"Medium"}}medium', '"Huge"}}medium') }
  assert.notEqual(unknown[section], body)
  // a condition naming the parked key, declared nowhere
  pkg.config.custom['headline_size'] = { ...pkg.config.custom['headline_size'], visibility: 'notice_size:\'Large\'' }
  const dangling = { ...files, 'package.json': `${JSON.stringify(pkg, null, 2)}\n` }
  for (const major of MAJORS) {
    assert.deepEqual(await codesOf(unread, major), ['GS100-NO-UNUSED-CUSTOM-THEME-SETTING'], `unread, gscan ${GSCAN[major].version}`)
    assert.deepEqual(await codesOf(unknown, major), ['GS090-NO-UNKNOWN-CUSTOM-THEME-SELECT-VALUE-IN-MATCH'], `unknown, gscan ${GSCAN[major].version}`)
    assert.deepEqual(await codesOf(dangling, major), ['GS010-PJ-CUST-THEME-SETTINGS-VISIBILITY-VALUE'], `dangling, gscan ${GSCAN[major].version}`)
  }
})
