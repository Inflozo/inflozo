import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nativeResourceOf, orbitWeekly } from '@inflozo/library'
import { CANVASES, type CanvasKey } from './lib/editor.ts'
import {
  GONE, SAVE_REFUSED, SEARCH_WORDS, SOURCE_WORDS, SUBJECT_HEADING, SUBJECT_HELP, SUBJECT_SAID,
  bundledSource, dateWords, filterSubjects, hasSubject, postsWords, subjectLabel, subjectOptions,
} from './lib/preview-subject.ts'

/* Story 5.13 — the content-source pill and the preview subject, over the one pure module the pill, D5e's menu and
   every sentence read (`lib/preview-subject.ts`). Nothing here touches the DOM: `node --test` strips types but
   cannot load a `.tsx`, which is why every decision this surface makes lives in a `lib/*.ts` (`lib/device.ts` is
   the standing precedent and `kit-button.test.ts:6-7` its reason).

   NOT ONE LIST OF CANVASES IS WRITTEN DOWN. Which ones carry a subject is asked of `CANVASES` and answered by the
   library's `nativeResourceOf` over `placement.ts`'s own table, so a canvas added later joins this walk by
   construction (standing rule 3, standing rule 4). */

const source = bundledSource()
const keys = Object.keys(CANVASES) as CanvasKey[]

test('a canvas has a subject exactly where its template carries a singular resource — derived, never listed', () => {
  for (const key of keys) {
    assert.equal(hasSubject(CANVASES[key].file), nativeResourceOf(CANVASES[key].file) !== null, key)
  }
  // and the two halves of the matrix are both non-empty, or the assertion above would hold vacuously
  assert.ok(keys.some((k) => hasSubject(CANVASES[k].file)), 'no canvas has a subject')
  assert.ok(keys.some((k) => !hasSubject(CANVASES[k].file)), 'every canvas has a subject')
  // Home, 404 and the three membership canvases are the "nothing to open" row of the matrix
  assert.equal(hasSubject(CANVASES.home.file), false)
  assert.equal(hasSubject(CANVASES.error.file), false)
  assert.equal(hasSubject(CANVASES['custom-signup'].file), false)
})

test('B9 words the pill and its source half is the same on every project today (R-118, R-165)', () => {
  assert.equal(SOURCE_WORDS.lead, 'Previewing with:')
  assert.equal(SOURCE_WORDS.sample, 'Sample content')
})

test('D5e lists the style-guide entry FIRST, then the source\'s own rows with their dates and the has-image marker', () => {
  const posts = subjectOptions(source, 'post')
  assert.equal(posts[0].title, 'Style-guide article')
  assert.equal(posts[0].caption, 'The one every post design is designed against')
  assert.equal(posts[0].meta, null, 'the style-guide entry carries a caption where a post carries its date')
  assert.equal(posts[0].slug, orbitWeekly.subject('post').slug)
  // every other row is the feed's, in the feed's own order, with a date and an honest marker
  assert.equal(posts.length, source.posts.length + 1)
  assert.deepEqual(posts.slice(1).map((r) => r.slug), source.posts.map((p) => p.slug))
  assert.ok(posts.slice(1).every((r) => /^\d{1,2} [A-Z][a-z]{2} \d{4}$/.test(r.meta ?? '')), 'every feed row prints its date')
  // BOTH marker states must really exist in the source, or the story's own claim could not be tested by hand
  assert.ok(posts.some((r) => r.hasImage) && posts.some((r) => !r.hasImage))
  for (const r of posts.slice(1)) {
    assert.equal(r.hasImage, typeof source.posts.find((p) => p.slug === r.slug)?.feature_image === 'string')
  }
})

test('a page lists the one page the bundled publication holds, and an archive lists its taxonomy rows with a DERIVED count', () => {
  const pages = subjectOptions(source, 'page')
  assert.deepEqual(pages.map((r) => r.slug), [orbitWeekly.subject('page').slug])
  for (const kind of ['tag', 'author'] as const) {
    const rows = subjectOptions(source, kind)
    const from = kind === 'tag' ? source.tags : source.authors
    assert.deepEqual(rows.map((r) => r.slug), from.map((r) => r.slug))
    assert.deepEqual(rows.map((r) => r.title), from.map((r) => r.name))
    for (const row of rows) {
      const n = from.find((r) => r.slug === row.slug)?.count.posts ?? -1
      assert.equal(row.meta, postsWords(n), row.slug)
    }
    // the fixture archive is one of the rows offered, so the checked row is always in the list
    assert.ok(rows.some((r) => r.slug === orbitWeekly.subject(kind).slug))
  }
})

test('the count says post or posts, and a date is parsed from the string rather than from a clock', () => {
  assert.equal(postsWords(0), '0 posts')
  assert.equal(postsWords(1), '1 post')
  assert.equal(postsWords(2), '2 posts')
  assert.equal(dateWords('2026-08-28T08:00:00.000Z'), '28 Aug 2026')
  assert.equal(dateWords('2026-01-07T23:30:00.000Z'), '7 Jan 2026', 'a late-evening UTC date must not slide a day')
  assert.equal(dateWords('2026-12-31T00:00:00.000Z'), '31 Dec 2026')
  assert.equal(dateWords('not a date'), '')
})

test('the search filters by title, client-side and pure — and an empty query is every row', () => {
  const rows = subjectOptions(source, 'post')
  assert.deepEqual(filterSubjects(rows, ''), rows)
  assert.deepEqual(filterSubjects(rows, '   '), rows)
  const one = rows[3]
  const hits = filterSubjects(rows, one.title.slice(0, 8).toUpperCase())
  assert.ok(hits.some((r) => r.slug === one.slug), 'the search ignores case')
  assert.ok(hits.length < rows.length, 'and it really narrows')
  assert.deepEqual(filterSubjects(rows, 'zzzzz-no-such-title'), [])
  // pure: the rows handed in are never touched
  assert.equal(rows.length, subjectOptions(source, 'post').length)
})

test('the pill names the subject, and never goes blank when the row has gone', () => {
  const rows = subjectOptions(source, 'post')
  assert.equal(subjectLabel({ kind: 'post', slug: rows[0].slug }, rows), 'Style-guide article')
  assert.equal(subjectLabel({ kind: 'post', slug: rows[2].slug }, rows), rows[2].title)
  assert.equal(subjectLabel({ kind: 'post', slug: 'vanished' }, rows), 'vanished')
})

test('the sentences read as plain English, name the kind, and say the choice is kept', () => {
  assert.match(GONE({ kind: 'post', slug: 'x' }), /^The article .*no longer there.*kept in case it comes back\.$/)
  assert.match(GONE({ kind: 'tag', slug: 'x' }), /^The tag /)
  assert.match(GONE({ kind: 'author', slug: 'x' }), /^The author /)
  const rows = subjectOptions(source, 'tag')
  assert.equal(SUBJECT_SAID({ kind: 'tag', slug: rows[0].slug }, rows), `Previewing the tag ${rows[0].title}.`)
  assert.equal(SUBJECT_HEADING('post'), 'SUBJECT · WHICH ARTICLE THIS CANVAS RENDERS')
  assert.equal(SEARCH_WORDS('post'), 'Search articles')
  // D5e's helper line, verbatim on the canvas it was drawn for
  assert.equal(
    SUBJECT_HELP('post'),
    'This canvas renders one post. Which one changes what you see, because a post with a feature image and one without are different shapes.',
  )
  assert.match(SUBJECT_HELP('tag'), /that tag's own posts and no others/)
  assert.match(SAVE_REFUSED, /when you reload/)
})
