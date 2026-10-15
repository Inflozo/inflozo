// Story 7.12 — Ghost's language list and Ghost's rule for a code, held to Ghost's own text. The fixture carries the
// admin bundle's text as read on 2026-10-15 (Ghost 6.58.0, `core/built/admin/assets/settings-KSWWQanQ.js`: the `fs`
// array, and the `ms` validator with its `ps` set), so a hand edit to `LANGUAGES` or to the port fails here.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import admin from '../fixtures/ghost-locale/admin-6.58.0.json' with { type: 'json' }
import { isRtl, LANGUAGE_REFUSAL, languageAtLink, languageRefusal, LANGUAGES, scriptOf } from './languages.ts'

const bundleList = (): { code: string; label: string }[] => {
  const text = admin.languages
  assert.ok(text.startsWith('fs=['), 'the fixture is the bundle\'s `fs=[…]` text')
  return [...text.matchAll(/\{code:`([^`]*)`,label:`([^`]*)`\}/g)].map((m) => ({ code: m[1] as string, label: m[2] as string }))
}
// Ghost's own validator, evaluated from its own text — the declarations made local, nothing else changed
const ghostRule = (): ((code: string) => string | null) => {
  return new Function(`${admin.validator.replace(/^(ps|ms)=/gm, 'const $1=')};return ms`)() as (code: string) => string | null
}

test("LANGUAGES is Ghost 6.58.0's Publication Language list, in its order, with its labels", () => {
  const ghost = bundleList()
  assert.ok(ghost.length > 0)
  assert.deepEqual(LANGUAGES, ghost)
  // the control: the comparison is not vacuous
  assert.notDeepEqual([...LANGUAGES].reverse(), ghost)
})

const CORPUS = [
  'en', 'pt-BR', 'de-DE', 'sr-Cyrl', 'zh-Hant', 'x-private', 'i-klingon', 'en-GB-oed', 'de-CH-1996', 'en-a-bbb-x-ccc', 'EN', 'zh-min-nan',
  '../x', 'english', 'zz zz', '', 'abcd', 'en-', 'a.b', 'en/us', 'en\\us', 'x', 'en-x', 'de-DE-x-' , 'en-united', 'a-b', '12',
  'en-123', 'en-Latn-US', 'sgn-BE-FR', 'qaa-Qaaa-QM-x-southern', 'en-abcdefghijklmnopq',
]

test("languageRefusal agrees with Ghost's own rule on every code Ghost refuses or accepts", () => {
  const ms = ghostRule()
  for (const code of CORPUS) {
    assert.equal(languageRefusal(code) === null, ms(code) === null, `${JSON.stringify(code)}: Ghost says ${ms(code)}`)
  }
  for (const { code } of LANGUAGES) assert.equal(languageRefusal(code), null, code)
})

test('a code is stored exactly: space around it, or anything that is not a string, is refused although Ghost trims', () => {
  const ms = ghostRule()
  assert.equal(ms(' en'), null, "Ghost's admin trims")
  assert.equal(languageRefusal(' en'), LANGUAGE_REFUSAL)
  assert.equal(languageRefusal('en '), LANGUAGE_REFUSAL)
  assert.equal(languageRefusal(null), LANGUAGE_REFUSAL)
  assert.equal(languageRefusal('en'), null, 'the control')
})

test('no accepted code can leave locales/: every one is letters, digits and hyphens', () => {
  for (const code of [...CORPUS, ...LANGUAGES.map((l) => l.code)]) {
    if (languageRefusal(code) === null) assert.match(code, /^[A-Za-z0-9-]+$/, code)
  }
  for (const code of ['../package', '..', 'a/b', 'a\\b', '.', 'en.json']) assert.equal(languageRefusal(code), LANGUAGE_REFUSAL, code)
})

test("the matrix's Other… rows: pt-BR saved as typed, ../x and english refused with the one sentence", () => {
  assert.equal(languageRefusal('pt-BR'), null)
  assert.equal(languageRefusal('../x'), 'Enter a language code like pt-BR or sr-Cyrl.')
  assert.equal(languageRefusal('english'), 'Enter a language code like pt-BR or sr-Cyrl.')
})

test('isRtl is true for exactly ar, fa, he and ur of Ghost\'s list', () => {
  assert.deepEqual(LANGUAGES.filter((l) => isRtl(l.code)).map((l) => l.code), ['ar', 'fa', 'he', 'ur'])
  assert.equal(isRtl('ar-EG'), true)
  assert.equal(isRtl('az-Arab'), true, 'an explicit script subtag decides')
  assert.equal(isRtl('en'), false)
  // review, 2026-10-15: Other… reaches right-to-left scripts beyond Arabic and Hebrew, and each asks for Understood too
  for (const code of ['dv', 'syr', 'nqo', 'ff-Adlm', 'prs', 'ks', 'yi']) assert.equal(isRtl(code), true, code)
  // a private-use subtag is not a script subtag: `en-x-arab` is English
  assert.equal(isRtl('en-x-arab'), false)
})

test('scriptOf: an explicit script subtag first, else the primary subtag, else Latin', () => {
  assert.equal(scriptOf('sr'), 'latin', '"Serbian" is Latin in Ghost\'s list')
  assert.equal(scriptOf('sr-Cyrl'), 'cyrillic')
  assert.equal(scriptOf('zh'), 'chinese-simplified')
  assert.equal(scriptOf('zh-Hant'), 'chinese-traditional')
  assert.equal(scriptOf('ru'), 'cyrillic')
  assert.equal(scriptOf('ja'), 'japanese')
  assert.equal(scriptOf('vi'), 'vietnamese', 'Vietnamese takes the whole face: its tone marks sit outside latin-ext')
  assert.equal(scriptOf('de'), 'latin')
  assert.equal(scriptOf('pt-BR'), 'latin')
  assert.equal(scriptOf('uz-Cyrl'), 'cyrillic')
  assert.equal(scriptOf('x-private'), 'latin')
  // review, 2026-10-15: Traditional by region when no script is named, and a script subtag only where Ghost's rule puts it
  for (const code of ['zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant-CN']) assert.equal(scriptOf(code), 'chinese-traditional', code)
  assert.equal(scriptOf('zh-CN'), 'chinese-simplified')
  assert.equal(scriptOf('zh-Hans-TW'), 'chinese-simplified', 'a named script wins over the region')
  assert.equal(scriptOf('de-x-cyrl'), 'latin')
})

test("languageAtLink: the site's locale exactly when accepted, else en", () => {
  assert.equal(languageAtLink('de'), 'de')
  assert.equal(languageAtLink('pt-BR'), 'pt-BR')
  assert.equal(languageAtLink('zz zz'), 'en')
  assert.equal(languageAtLink(undefined), 'en')
  assert.equal(languageAtLink(''), 'en')
})
