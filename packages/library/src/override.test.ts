// Story 7.12 — the one judge of a translation override (FR-Q8, V9, V10, S3, DW-141, DW-142, R-106). Every refusal row of
// the spec's I/O matrix sits behind its legitimate twin, so a judge that refused everything (or nothing) fails here; and
// every catalog default passes, so the judge can never refuse what Inflozo itself ships.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import imf from 'intl-messageformat'
import imfPackage from 'intl-messageformat/package.json' with { type: 'json' }
import { CATALOG, translatableKeys } from './catalog.ts'
import { OVERRIDE_MAX, OVERRIDE_WORDS, overrideRefusal } from './override.ts'

const IntlMessageFormat = imf.default

test('the judge is the version both Ghost majors bundle — intl-messageformat 5.4.3', () => {
  assert.equal(imfPackage.version, '5.4.3')
  // and the module is the formatter, not a namespace: §44(c)'s two executed facts
  assert.equal(new IntlMessageFormat("It''s here", 'en').format(), "It's here")
  assert.throws(() => new IntlMessageFormat("'{'", 'en'))
})

test('every key the surface lists accepts its own English default', () => {
  const keys = translatableKeys()
  assert.ok(keys.length > 0)
  for (const key of keys) assert.equal(overrideRefusal(key, (CATALOG.keys[key] as { en: string }).en), null, key)
})

test('the surface lists every key but the locked and the retired, in catalog order', () => {
  const keys = translatableKeys()
  const all = Object.keys(CATALOG.keys)
  assert.deepEqual(keys, all.filter((k) => keys.includes(k)), 'catalog order')
  assert.ok(!keys.some((k) => k.startsWith('credit.')), 'no credit.* key')
  assert.ok(!keys.some((k) => CATALOG.keys[k]?.retired !== undefined), 'no retired key')
  // the control: what was left out is exactly the locked and the retired
  assert.deepEqual(all.filter((k) => !keys.includes(k)), all.filter((k) => CATALOG.keys[k]?.marks.includes('locked') || CATALOG.keys[k]?.retired !== undefined))
})

// [key, refused value, the sentence, the legitimate twin]
const ROWS: [string, string, string, string][] = [
  ['nav.more', 'Más {{', OVERRIDE_WORDS.brace('{', 'Más {{', []), 'Más'],
  ['post.reading_time', '{{minutes}} min', OVERRIDE_WORDS.brace('{', '{{minutes}} min', ['minutes']), '{minutes} min'],
  ['post.reading_time', '{minutes}} min', OVERRIDE_WORDS.brace('}', '{minutes}} min', ['minutes']), '{minutes} min'],
  ['post.reading_time', 'min de lectura', OVERRIDE_WORDS.missing('minutes'), '{minutes} min de lectura'],
  ['post.reading_time', '{mins} min', OVERRIDE_WORDS.foreign('mins', ['minutes']), '{minutes} min'],
  ['nav.more', '{n} more', OVERRIDE_WORDS.foreign('n', []), 'More'],
  ['nav.more', "It''s here", OVERRIDE_WORDS.apostrophes, "It's here"],
  ['post.reading_time', "'{minutes}' min", OVERRIDE_WORDS.quoted("'{minutes}' min", 'minutes'), "It's {minutes} min"],
  ['nav.more', 'Mehr\u0007', OVERRIDE_WORDS.control, 'Mehr'],
  ['nav.more', 'Mehr\nweiter', OVERRIDE_WORDS.control, 'Mehr weiter'],
  ['nav.more', 'x'.repeat(OVERRIDE_MAX + 1), OVERRIDE_WORDS.long, 'x'.repeat(OVERRIDE_MAX)],
  ['archive.posts_many', '% <b>posts</b>', OVERRIDE_WORDS.markup('<'), '% Beiträge'],
  ['archive.posts_many', '% posts & more', OVERRIDE_WORDS.markup('&'), '% posts and more'],
  ['archive.posts_many', 'posts', OVERRIDE_WORDS.percent, '% posts'],
  ['nav.more', '   ', OVERRIDE_WORDS.blank, 'Mehr'],
  ['nav.more', '', OVERRIDE_WORDS.blank, 'Mehr'],
]

for (const [key, value, sentence, twin] of ROWS) {
  test(`${key}: ${JSON.stringify(value).slice(0, 40)} is refused, and ${JSON.stringify(twin).slice(0, 40)} ships`, () => {
    assert.equal(overrideRefusal(key, value), sentence)
    assert.equal(overrideRefusal(key, twin), null)
  })
}

test("the matrix's sentences, word for word", () => {
  assert.equal(overrideRefusal('nav.more', 'Más {{'), 'The “{” in “Más {{” would break every page that shows it — braces mark a placeholder, and this label has none.')
  assert.equal(overrideRefusal('post.reading_time', '{{minutes}} min'), 'The “{” in “{{minutes}} min” would break every page that shows it — braces mark a placeholder, like {minutes}.')
  assert.equal(overrideRefusal('post.reading_time', 'min de lectura'), 'Keep {minutes}: your site fills it in.')
  assert.equal(overrideRefusal('post.reading_time', '{mins} min'), "{mins} isn't one of this label's placeholders. It has {minutes}.")
  assert.equal(overrideRefusal('post.reading_time', "'{minutes}' min"), "The “'” beside “{” in “'{minutes}' min” prints on your site as typed today, and a Ghost update could make it hide {minutes}. Remove it.")
  assert.equal(overrideRefusal('archive.posts_many', '% <b>posts</b>'), "“<” can't be used in this label: your site prints it as page code.")
})

test('a lone apostrophe away from a brace prints as typed on both — accepted', () => {
  assert.equal(overrideRefusal('post.reading_time', "It's {minutes} min"), null)
  assert.equal(overrideRefusal('post.by', "{author}'s"), null)
})

test('a key the surface does not list is refused with the save sentence: locked, retired, unknown, or not a string', () => {
  const retired = Object.keys(CATALOG.keys).find((k) => CATALOG.keys[k]?.retired !== undefined) as string
  for (const key of ['credit.built_with', retired, 'no.such']) assert.equal(overrideRefusal(key, 'x'), OVERRIDE_WORDS.unsaved, key)
  assert.equal(overrideRefusal('nav.more', 7), OVERRIDE_WORDS.unsaved)
  assert.equal(overrideRefusal('nav.more', 'x'), null, 'the control: a listed key with a value')
})

test('V9 compares Ghost with the canvas: a value only 5.4.3 renders differently is refused', () => {
  // `''` is the one apostrophe form left after the named rules, and 5.4.3 prints it as one; the shim prints two
  assert.notEqual(new IntlMessageFormat("a''b", 'en').format(), "a''b")
  assert.equal(overrideRefusal('nav.more', "a''b"), OVERRIDE_WORDS.apostrophes)
  // and a `#` outside a plural is plain text in both
  assert.equal(overrideRefusal('nav.more', '# more'), null)
})
