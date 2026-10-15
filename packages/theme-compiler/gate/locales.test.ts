// Story 7.12 — the locale files on BOTH pinned gscans, executed (standing rule 1): a `de` compile with overrides and a `ru`
// compile (Inter's whole faces beside Fraunces' latin pair) score 0/0 on gscan 4.49.7 and 6.4.2 with an empty quality
// verdict. GS070-VALID-TRANSLATIONS parses each `locales/*.json`; the control breaks one file and it fails that rule.
//
// The theme is compiled in memory (a core package's test opens no file, AD-1), with Story 7.3's stand-in `page.hbs` and
// D12's two widths as every gate test carries them (`tools/pilot-theme.mjs`'s `SCAFFOLD`).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { englishStrings, resolveStrings } from '@inflozo/library'
import type { SectionRegistryEntry } from '@inflozo/library'
import { POOL } from '@inflozo/library/packs'
import type { DocInstance, SynthesisLibrary } from '@inflozo/section-runtime'
import { REFERENCE_PACK } from '@inflozo/section-runtime/reference'
import { compileTheme } from '../src/index.ts'
import { GSCAN, qualityGate, runGscan } from './index.ts'
import type { Major } from './index.ts'

const MAJORS = Object.keys(GSCAN).map(Number) as Major[]

function entryOf(id: string, categoryTitle: string, name: string, over: Partial<SectionRegistryEntry> & Pick<SectionRegistryEntry, 'html' | 'compileTarget'>): SectionRegistryEntry {
  return {
    id, category: id.split('/')[0] as string, categoryTitle, name, tier: 'free', bindingContext: ['none'], contentSchema: {}, controlSchema: [], universals: {}, absent: [],
    css: `.${id.replace('/', '-')} { color: var(--text-body); }\n`, ghostCompat: { minVersion: '5.62.0', helpers: [] }, darkCapabilities: ['tokens'], previewSeed: 'orbit-weekly',
    descriptor: { archetype: 'x', containment: 'none', ground: 'page', itemCount: 'none', mediaPlacement: 'none', emphasis: 'x' }, ...over,
  }
}
// a feed that prints a chrome label through {{t}} and a post header — enough for every required template
const DESIGNS: Record<string, SectionRegistryEntry> = Object.fromEntries([
  entryOf('a17/1', 'Post Grids', 'Grid', {
    compileTarget: ['home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs'],
    bindingContext: ['posts'],
    html: '<section class="a17-1">\n  <ul class="a17-1__grid">\n    <li class="a17-1__cell" data-repeat="posts"><a class="a17-1__card" data-bind-attr="href:url" data-bind="title" data-empty="hide">Title</a></li>\n  </ul>\n  <p class="a17-1__more" data-t="pagination.older">Older posts</p>\n</section>',
  }),
  entryOf('a24/1', 'Post Headers', 'Centred', {
    compileTarget: ['post.hbs'],
    bindingContext: ['post'],
    html: '<section class="a24-1">\n  <h1 class="a24-1__title" data-bind="title" data-empty="hide">Title</h1>\n</section>',
  }),
].map((e) => [e.id, e]))
const library: SynthesisLibrary = (id) => DESIGNS[id]

const POOL_FILES = Object.values(POOL.faces).flatMap((face) => [...face.files, ...(face.full === undefined ? [] : [face.full])])
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
const SCAFFOLD_FILES = {
  'assets/css/cards.css': '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n',
  'page.hbs': '{{!< default}}\n\n{{#post}}\n  {{#if @page.show_title_and_feature_image}}\n    <h1>{{title}}</h1>\n  {{/if}}\n  {{content}}\n{{/post}}\n',
}
function compiled(language: string, strings?: Record<string, string>): Record<string, string | Uint8Array> {
  const doc = new JSDOM('<body></body>').window.document
  const { files } = compileTheme(doc, {
    templates: { 'home.hbs': { schemaVersion: 1, instances: [instance('a17/1', 'Post grid', { isMainFeed: true })] } },
    library: (id) => DESIGNS[id], pack: REFERENCE_PACK, assets: {}, postsPerPage: 12, theme: { name: 'gate-locales', version: '1.0.0', description: 'Locales' },
    pairing: 'D1', fonts: poolFonts, darkEnabled: true, modules: { core: 'export function core(win, modules) {\n  return { stop() {}, paused: [] }\n}\n' },
    ghostCards: { scripts: {}, licence: 'MIT\n' }, language, ...(strings === undefined ? {} : { strings }),
  })
  return { ...files, ...SCAFFOLD_FILES }
}
const codesOf = async (files: Record<string, string | Uint8Array>, major: Major) => (await runGscan(files, major)).results.map((r) => r.code)
const OVERRIDES = { 'pagination.older': 'Ältere Beiträge', 'post.reading_time': '{minutes} Min. Lesezeit', 'archive.posts_many': '% Beiträge' }

test('(7.12) a de compile with overrides and a ru compile each score 0/0 on both pinned gscans and an empty quality verdict', async () => {
  for (const [language, strings] of [['de', resolveStrings(OVERRIDES)], ['ru', undefined]] as const) {
    const files = compiled(language, strings)
    assert.deepEqual(Object.keys(files).filter((p) => p.startsWith('locales/')).sort(), ['locales/en.json', `locales/${language}.json`].sort(), language)
    if (language === 'ru') assert.ok(Object.keys(files).some((p) => p.endsWith('-full.woff2')), 'ru ships a whole face')
    for (const major of MAJORS) assert.deepEqual(await codesOf(files, major), [], `${language} on gscan ${GSCAN[major].version}`)
    const verdict = qualityGate(files, { pack: REFERENCE_PACK, library })
    assert.deepEqual([...verdict.errors, ...verdict.warnings].map((f) => `${f.code}: ${f.detail ?? f.message}`), [], language)
  }
  // and the overrides reached the language's file, the defaults en.json
  const de = compiled('de', resolveStrings(OVERRIDES))
  assert.equal((JSON.parse(de['locales/de.json'] as string) as Record<string, string>)['pagination.older'], 'Ältere Beiträge')
  assert.equal((JSON.parse(de['locales/en.json'] as string) as Record<string, string>)['pagination.older'], englishStrings()['pagination.older'])
})

test('(7.12) the control: a locale file that does not parse is GS070-VALID-TRANSLATIONS on both pins', async () => {
  const files = { ...compiled('de', resolveStrings(OVERRIDES)), 'locales/de.json': '{ "nav.more": "Mehr", }\n' }
  for (const major of MAJORS) assert.ok((await codesOf(files, major)).includes('GS070-VALID-TRANSLATIONS'), `gscan ${GSCAN[major].version}`)
})
