import { test } from 'node:test'
import assert from 'node:assert/strict'
import { POST_SOURCES, POST_SOURCE_WORDS } from '@inflozo/library'
import { DATA_WORDS } from '@inflozo/section-runtime'
import {
  ADDED_AS_MAIN, FEEDLESS, HOLDS, initialOf, MAIN_FEED, MAKE_MAIN_FEED, NO_PICKS, NOT_IN_SOURCE, NOW_MAIN, optionsOf,
  PAST_SLOW, PAST_SLOW_BOLD, PICK_LACKING, PICKED, postsCount, SEARCH_POSTS, searchPosts, slow, SLOW_AFTER, withTransfer,
} from './lib/data-group.ts'

/* Story 5.19 — THE WORDS (R-170). Every string the spec's "The words" table gives, held here to the one module that
   prints it — `lib/data-group.ts` for the app's, the engine's `DATA_WORDS` and the vocabulary's `POST_SOURCE_WORDS` for
   the rows the runtime draws — so a string cannot drift between the Layers chip, the menu, the panel, the canvas and
   `#editor-said`. The literals below ARE the table, transcribed; nothing else in this file is written down. */

test('the chip, the menu item and the three announcements', () => {
  // "MAIN FEED — the words 'Main feed', uppercased by CSS"
  assert.equal(MAIN_FEED, 'Main feed')
  assert.equal(MAKE_MAIN_FEED, 'Make this the main feed')
  assert.equal(NOW_MAIN('Post grid'), 'Post grid is now the main feed.')
  assert.equal(ADDED_AS_MAIN('Post Grids — Three Up'), 'Post Grids — Three Up added as the main feed.')
  // "the gesture's own sentence, then '{name} is now the main feed.'" — and a gesture with none says the transfer alone
  assert.equal(withTransfer('Post grid removed', 'Three Up'), 'Post grid removed. Three Up is now the main feed.')
  assert.equal(withTransfer(null, 'Three Up'), 'Three Up is now the main feed.')
  assert.equal(withTransfer('Post grid removed', null), 'Post grid removed', 'no transfer, nothing added')
})

test('Source, Count and Order — one name each (R-170), the engine\'s and the vocabulary\'s', () => {
  assert.deepEqual(POST_SOURCES.map((v) => POST_SOURCE_WORDS[v]), ['Latest', 'Featured', 'By tag', 'By author', 'Hand-picked'])
  assert.equal(DATA_WORDS.pickedCount, 'The list you picked is the count.')
  assert.equal(DATA_WORDS.pickedOrder, 'The list you picked is the order — these posts render in the order you dragged them.')
  assert.equal(DATA_WORDS.countRefused, 'Count is a number from 1 to 100.')
  assert.equal(DATA_WORDS.mainCount, "This feed is sized by your theme's Posts per page.")
})

test('the tag and writer selects: "{n} posts" ("1 post"), and what a value the source lacks says', () => {
  assert.equal(postsCount(9), '9 posts')
  assert.equal(postsCount(1), '1 post')
  assert.equal(NOT_IN_SOURCE('tag', { site: 'Ghost5' }), 'Not a tag on Ghost5.')
  assert.equal(NOT_IN_SOURCE('author', { site: 'Ghost5' }), 'Not an author on Ghost5.')
  assert.equal(NOT_IN_SOURCE('tag', 'sample'), 'Not in the sample content.')
  // fullest first, a tie by name — R-193's order, so By tag starts on the tag a live Tag page starts on
  const rows = [
    { slug: 'b', name: 'Beta', count: { posts: 5 } },
    { slug: 'a', name: 'Alpha', count: { posts: 5 } },
    { slug: 'c', name: 'Craft', count: { posts: 9 }, profile_image: 'https://x.example/c.png' },
    { slug: '', name: 'nothing' },
  ]
  assert.deepEqual(optionsOf(rows).map((o) => [o.slug, o.count, o.image]), [['c', 9, 'https://x.example/c.png'], ['a', 5, null], ['b', 5, null]])
  // a writer with no photograph shows ONE letter of the name Ghost supplied (P0·8 rule 4)
  assert.equal(initialOf('jane doe'), 'J')
})

test('the picked list: its words, the 25 threshold, a pick the source lacks, and a fixed query\'s cap', () => {
  assert.equal(PICKED(3), '3 picked')
  assert.equal(SEARCH_POSTS, 'Search posts to add')
  assert.equal(NO_PICKS, 'No posts picked yet.')
  assert.equal(PICK_LACKING({ site: 'Ghost5' }), 'Not on Ghost5 — unpublished or deleted.')
  assert.equal(PICK_LACKING('sample'), 'Not in the sample content.')
  assert.equal(
    PAST_SLOW,
    "Past 25 picks this gets slow. Every pick adds a database query, on every page this section appears on — not once per section. Three hand-picked sections at 25 each is 75 database queries, about three-quarters of a second added to every visitor's page load.",
  )
  // P0·5 sets two phrases of it in bold, and the split that draws them finds both
  assert.deepEqual(PAST_SLOW.split(PAST_SLOW_BOLD).filter((_, i) => i % 2 === 1), [
    'Every pick adds a database query, on every page this section appears on',
    '75 database queries, about three-quarters of a second',
  ])
  // warning-toned PAST 25: the 26th, never the 25th — and nothing is ever blocked
  assert.equal(SLOW_AFTER, 25)
  assert.deepEqual([slow(25), slow(26)], [false, true])
  assert.equal(HOLDS('Latest Post', 1), 'Latest Post shows 1 post, so it holds 1 pick.')
  assert.equal(HOLDS('Two Up', 2), 'Two Up shows 2 posts, so it holds 2 picks.')
  // the search offers the source's posts whose title matches, none already picked
  const posts = [{ id: '1', title: 'Reading the margins' }, { id: '2', title: 'The cost of clever' }, { id: '3', title: 'Margins, again' }]
  assert.deepEqual(searchPosts(posts, 'MARGINS', [{ id: '3' }]).map((p) => p.id), ['1'])
  assert.deepEqual(searchPosts(posts, '  ', []).map((p) => p.id), ['1', '2', '3'])
})

test('the feed-less archive note, for a Tag and an Author page', () => {
  assert.equal(
    FEEDLESS('Tag'),
    'This Tag page has no list of posts. Ghost still serves its page 2 onwards, which would repeat page 1, so your theme asks search engines to skip them.',
  )
  assert.equal(
    FEEDLESS('Author'),
    'This Author page has no list of posts. Ghost still serves its page 2 onwards, which would repeat page 1, so your theme asks search engines to skip them.',
  )
})
