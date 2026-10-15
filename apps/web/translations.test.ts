import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { adminAt } from './lib/paywall.ts'
import { coverageWords, ownName, siteLocaleDiffers, TRANSLATION_WORDS, untouchedRows } from './lib/translations.ts'

// Story 7.12 — Translations' own rules (FR-Q6, FR-Q8, B18). Ghost's rules are the library's and are tested there
// (`languages.test.ts`, `override.test.ts`); these are the app's, and the actions' order is read from their source, as
// `settings.test.ts` reads Theme settings' (a 'use server' file runs only inside Next).

const DIR = 'app/(app)/app/(authed)/projects/[id]/settings'

test('a language is named in its own words, its first letter raised, and in Ghost\'s English where the runtime knows no name', () => {
  assert.equal(ownName('es'), 'Español')
  assert.equal(ownName('de'), 'Deutsch')
  assert.equal(ownName('ru'), 'Русский')
  assert.equal(ownName('ja'), '日本語')
  assert.equal(ownName('ar'), 'العربية')
  assert.equal(ownName('kz'), 'Kazakh', 'Ghost lists kz, which CLDR does not name')
  assert.equal(ownName('es').toUpperCase(), 'ESPAÑOL', 'the column head')
})

test('§D.b at the moment of choice: a covering family says its whole faces\' size, a family that does not says who draws what — and Latin says nothing', () => {
  const coverage = {
    covered: [{ family: 'Inter', roles: ['body'] as const, bytes: 412_000, latinBytes: 96_000 }],
    uncovered: [{ family: 'Fraunces', roles: ['heading'] as const, bytes: 0, latinBytes: 88_000 }],
  }
  assert.deepEqual(coverageWords(coverage, 'cyrillic', 'Русский'), [
    'Inter covers Cyrillic: your theme ships its whole faces — about 412 KB of fonts instead of 96 KB.',
    "Fraunces doesn't cover Cyrillic, so your site shows Русский headings in each reader's own system font.",
  ])
  const both = { covered: [], uncovered: [{ family: 'Inter', roles: ['heading', 'body'] as const, bytes: 0, latinBytes: 96_000 }] }
  assert.deepEqual(coverageWords(both, 'japanese', '日本語'), ["Inter doesn't cover Japanese, so your site shows 日本語 headings and text in each reader's own system font."])
  assert.deepEqual(coverageWords(coverage, 'latin', 'Deutsch'), [], 'a Latin language ships latin + latin-ext as today')
})

test('the site-language notice: only on a non-English project whose linked site holds a language and a different one', () => {
  assert.equal(siteLocaleDiffers('es', 'en'), true)
  assert.equal(siteLocaleDiffers('es', 'es'), false)
  assert.equal(siteLocaleDiffers('en', 'de'), false, 'never on an English project')
  assert.equal(siteLocaleDiffers('es', undefined), false, 'no stored locale, no notice')
  assert.equal(siteLocaleDiffers('pt-BR', 'pt-br'), true, 'Ghost reads the file named exactly, case included')
  assert.equal(TRANSLATION_WORDS.mismatch('en'), "Your Ghost site's language is en, so visitors see the English wording, not these.")
  assert.equal(TRANSLATION_WORDS.changeIn('es'), 'Change it to es in Ghost ↗')
})

test('Ghost\'s settings sections, read in both majors\' admin source, each at #/settings/<navid>', () => {
  for (const anchor of ['navigation', 'social-accounts', 'code-injection', 'publication-language'] as const) {
    assert.equal(adminAt('https://ghost6.inflozo.com/', anchor), `https://ghost6.inflozo.com/ghost/#/settings/${anchor}`)
  }
})

test('Question 1\'s rows: in page order, the header\'s on every page and opening Home, a canvas\'s opening that canvas', () => {
  const rows = untouchedRows('p1', [
    { key: 'post', instanceId: 'b', layer: 'Byline', words: ['Written by'] },
    { key: 'site', instanceId: 'a', layer: 'Header', words: ['Orbit Weekly'] },
    { key: 'home', instanceId: 'c', layer: 'Three Up', words: ['The archive', 'Browse the archive'] },
  ])
  assert.deepEqual(rows.map((r) => [r.layer, r.canvas, r.href]), [
    ['Header', 'every page', '/projects/p1'],
    ['Three Up', 'Home', '/projects/p1'],
    ['Byline', 'Post', '/projects/p1/post'],
  ])
  assert.equal(`${TRANSLATION_WORDS.untouchedOn('Three Up', 'Home')} ${TRANSLATION_WORDS.quoted(['The archive', 'Browse the archive'])}`, 'Three Up on Home: “The archive” · “Browse the archive”')
})

test('B18\'s RTL block keeps its title and first two sentences, without the clause FR-Q6 contradicts', () => {
  assert.equal(TRANSLATION_WORDS.rtlTitle, 'Right-to-left languages are not supported yet')
  assert.equal(TRANSLATION_WORDS.rtlBody, 'Our designs are built left-to-right. Arabic, Hebrew and Farsi strings will translate, but the layouts will not mirror.')
  assert.doesNotMatch(TRANSLATION_WORDS.rtlBody, /do not offer/)
})

test('every write judges before it writes, and a database refusal is one sentence, never a code', () => {
  const actions = readFileSync(`${DIR}/translations/actions.ts`, 'utf8')
  const fn = (name: string) => actions.slice(actions.indexOf(`export async function ${name}(`), actions.indexOf('\n}\n', actions.indexOf(`export async function ${name}(`)))
  const save = fn('saveOverride')
  assert.ok(save.indexOf('overrideRefusal(key, value)') < save.indexOf('.upsert('), 'the judge runs before the write')
  assert.match(save, /if \(refused !== null\) return \{ error: refused \}/, 'a refusal stores nothing and answers its sentence')
  assert.match(save, /onConflict: 'project_id,catalog_key'/)
  const language = fn('setLanguage')
  assert.ok(language.indexOf('languageRefusal(code)') < language.indexOf('.update('), "Ghost's code rule runs before the write")
  assert.match(language, /if \(rtl && formData\.get\('acknowledged'\) !== 'yes'\) return unsaved\(\)/, 'RTL needs Understood')
  assert.match(language, /formData\.get\('confirmed'\) !== 'yes'\) return unsaved\(\)/, 'a switch over overrides needs the confirm')
  assert.match(language, /\.update\(\{ language, rtl_ack_at: rtl \? new Date\(\)\.toISOString\(\) : null \}\)/, 'language and rtl_ack_at in ONE write; leaving RTL clears it')
  for (const name of ['saveOverride', 'resetOverride', 'setLanguage']) {
    assert.match(fn(name), /if \(error \|\| !data \|\| data\.length === 0\) \{[\s\S]*?return unsaved\(\)/, `${name}: a refused or zero-row write is "${'We couldn\'t save that just now.'}"`)
  }
  // the judge is server only: no client file of the page reaches it — the control, its one server reader, does
  assert.match(actions, /from '@inflozo\/library\/override'/)
  for (const file of [`${DIR}/translations/translations.tsx`, `${DIR}/rail.tsx`, 'lib/translations.ts']) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /from '(@inflozo\/library\/override|intl-messageformat)'/, `${file} reaches the server-only judge`)
  }
})

// the matrix rows the deployed walk (step 106) also drives, held here in source so a refactor cannot drop them unseen
const EDITOR = 'app/(app)/app/(authed)/projects/[id]/(editor)'

test('the canvas renders the overrides the judge passed, through the shim, and keeps a refused one off (FR-H5, AD-6)', () => {
  const read = readFileSync(`${EDITOR}/read.ts`, 'utf8')
  const judged = read.slice(read.indexOf('function judged('), read.indexOf('\n}\n', read.indexOf('function judged(')))
  assert.match(judged, /const sentence = overrideRefusal\(key, value\)\s+if \(sentence === null\) overrides\[key\] = value as string\s+else refused\[key\]/)
  assert.match(read, /overrides: overridesRow\.error \? \{\} : judged\(overridesRow\.data \?\? \[\]\)\.overrides,/, 'only what the judge passes reaches the editor')
  const editor = readFileSync(`${EDITOR}/editor.tsx`, 'utf8')
  assert.match(editor, /const strings = useMemo\(\(\) => resolveStrings\(overrides \?\? \{\}\), \[overrides\]\)/)
  assert.match(editor, /renderSection\(doc, entry, [\s\S]{0,400}visitor: now\.viewAs, strings,/, 'every section of the canvas is handed the strings')
  assert.match(readFileSync('lib/canvas.ts', 'utf8'), /\.\.\.\(o\.strings === undefined \? \{\} : \{ strings: o\.strings \}\)/)
})

test("a project first linked through Use your brand takes the site's Ghost language, refused codes as en", () => {
  const sites = readFileSync('app/(app)/app/(authed)/sites/actions.ts', 'utf8')
  const insert = sites.slice(sites.indexOf('linked_site_id: site.id,'), sites.indexOf('})', sites.indexOf('linked_site_id: site.id,')))
  assert.match(insert, /language: languageAtLink\(site\.site_settings\?\.locale\),/)
})

test("the switch confirm and the acknowledgement say the matrix's words", () => {
  assert.equal(`${TRANSLATION_WORDS.switchTitle('Deutsch')} ${TRANSLATION_WORDS.switchBody('Deutsch', 'Español')}`,
    'Switch to Deutsch? The labels you translated were written in Español. They stay, and ship in the Deutsch file until you change them.')
  assert.equal(TRANSLATION_WORDS.acknowledged('2026-10-15T09:00:00Z'), 'You acknowledged this on 15 Oct 2026.')
})

test('read-only (R-192): the page reads the lock holder and wraps every control in the Kit\'s ReadOnly', () => {
  const page = readFileSync(`${DIR}/translations/translations.tsx`, 'utf8')
  assert.match(page, /settingsReadOnly\(holder, tabSession\(\)\)/)
  const inside = page.slice(page.indexOf('<ReadOnly on={readOnly}>'), page.indexOf('</ReadOnly>'))
  const body = page.slice(page.indexOf('export function Translations('), page.indexOf('\nfunction OtherField('))
  // every form the page draws is the Translations body's own (inside ReadOnly) or a sub-component drawn there
  assert.equal(body.split('<form').length - 1, inside.split('<form').length - 1, "the body's every form sits inside ReadOnly")
  for (const part of ['<OtherField', '<Row', '<Menu']) assert.ok(inside.includes(part), `${part} is drawn inside ReadOnly`)
})

test('Use the default deletes the one row, scoped to the project and the key — the field returns to its default', () => {
  const actions = readFileSync(`${DIR}/translations/actions.ts`, 'utf8')
  const reset = actions.slice(actions.indexOf('export async function resetOverride('), actions.indexOf('\n}\n', actions.indexOf('export async function resetOverride(')))
  assert.match(reset, /\.from\('translation_overrides'\)\s+\.delete\(\)\s+\.eq\('project_id', id\)\s+\.eq\('catalog_key', key\)/)
  assert.equal(TRANSLATION_WORDS.fallsBack, 'Falls back to English')
  assert.equal(TRANSLATION_WORDS.usesDefault, 'Uses the default')
})
