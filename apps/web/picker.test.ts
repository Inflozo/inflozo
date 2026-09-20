import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { SectionRegistryEntry } from '@inflozo/library'
import { cards, emptyState, invokedAt, isSiteWide, matches, metaLine, offeredHere, rail, SITE_WIDE_WORDS, spanFor, TALL_OVER, WIDE_UNDER } from './lib/picker.ts'

/* Story 5.10 — the Section Picker's I/O matrix, over the one pure module the rail, the grid, the counts and every
   empty state read (`lib/picker.ts`). Nothing here touches the DOM: `node --test` strips types but cannot load a
   `.tsx`, which is why every decision the picker makes lives in a `lib/*.ts` (the standing precedent is
   `lib/device.ts`, and `kit-button.test.ts:6-7` is its reason).

   THE FIXTURE IS THE SHAPE, NOT THE LIBRARY. `offeredOn`'s own table is proved against the real appendix in
   `packages/library/src/placement.test.ts`; these designs exist so a rail can be asserted row by row without a
   count that goes stale as Epics 9 and 10 land (standing rule 4). */

const design = (id: string, name: string, over: Partial<SectionRegistryEntry> = {}): SectionRegistryEntry =>
  ({
    id,
    category: id.split('/')[0] as string,
    categoryTitle: { a1: 'Headers', a4: 'Heroes', a17: 'Post Grids', a22: 'Newsletter', a24: 'Post Headers', a33: 'Koenig Cards' }[id.split('/')[0] as string] ?? id,
    name,
    tier: 'free',
    bindingContext: ['none'],
    compileTarget: ['home.hbs'],
    contentSchema: {},
    controlSchema: [],
    universals: {},
    absent: [],
    html: '',
    css: '',
    ghostCompat: { minVersion: '5.0.0', helpers: [] },
    darkCapabilities: [],
    previewSeed: 'orbit-weekly',
    descriptor: { archetype: '', containment: '', ground: '', itemCount: '', mediaPlacement: '', emphasis: '' },
    ...over,
  }) as SectionRegistryEntry

const LIBRARY: Record<string, SectionRegistryEntry> = Object.fromEntries(
  [
    design('a17/1', 'Three Up', { bindingContext: ['posts'], compileTarget: ['home.hbs', 'tag.hbs'] }),
    design('a4/13', 'Latest Post', { tier: 'pro' }),
    design('a4/1', 'Centred'),
    design('a22/1', 'Inline Row', { compileTarget: ['home.hbs', 'post.hbs'] }),
    design('a24/1', 'Centred', { bindingContext: ['post'], compileTarget: ['post.hbs'] }),
    design('a1/1', 'Rail', { compileTarget: ['default.hbs'] }),
    // a non-placeable TREATMENT: chosen outside the canvas, so its category never reaches the rail at all
    design('a33/1', 'Card Treatment'),
  ].map((e) => [e.id, e]),
)

test('the rail is what is offered ON THIS CANVAS, in NUMERIC category order, each row counted at runtime', () => {
  const home = rail(offeredHere(LIBRARY, 'home.hbs', 'default.hbs'))
  // a1 · a4 · a17 · a22 — a17 after a4, which a string sort gets wrong; a33's treatment is absent entirely (FR-D5)
  assert.deepEqual(home.map((r) => r.category), ['a1', 'a4', 'a17', 'a22'])
  assert.deepEqual(home.map((r) => r.title), ['Headers', 'Heroes', 'Post Grids', 'Newsletter'])
  assert.deepEqual(home.map((r) => r.count), [1, 2, 1, 1])
  // a DIFFERENT canvas offers a different list, and the home-only categories are simply not there
  assert.deepEqual(rail(offeredHere(LIBRARY, 'post.hbs', 'default.hbs')).map((r) => r.title), ['Headers', 'Newsletter', 'Post Headers'])
})

test('R-152: a site-wide design is offered on EVERY canvas, because one header shows on every template', () => {
  for (const file of ['home.hbs', 'post.hbs', 'tag.hbs', 'error.hbs', 'default.hbs']) {
    assert.ok(offeredHere(LIBRARY, file, 'default.hbs').some((e) => e.id === 'a1/1'), file)
  }
  // the 404 canvas: R-7 withholds every {{#get}} resource and no design binds `error`, so it offers the header ALONE
  assert.deepEqual(offeredHere(LIBRARY, 'error.hbs', 'default.hbs').map((e) => e.id), ['a1/1'])
})

test('nothing is offered where nothing fits, and the rail is then empty rather than wrong', () => {
  // a library with no site-wide design and nothing that binds `error`
  const narrow = Object.fromEntries(Object.entries(LIBRARY).filter(([id]) => id !== 'a1/1'))
  assert.deepEqual(offeredHere(narrow, 'error.hbs', 'default.hbs'), [])
  assert.deepEqual(rail([]), [])
})

test('a non-placeable treatment is never offered, never counted and never a rail row', () => {
  for (const file of ['home.hbs', 'post.hbs', 'default.hbs', 'tag.hbs']) {
    assert.ok(!offeredHere(LIBRARY, file, 'default.hbs').some((e) => e.category === 'a33'), file)
    assert.ok(!rail(offeredHere(LIBRARY, file, 'default.hbs')).some((r) => r.category === 'a33'), file)
  }
})

test('the search reads a design name and a category name, in any case, untrimmed', () => {
  const hero = LIBRARY['a4/13'] as SectionRegistryEntry
  for (const q of ['', '  ', 'latest', 'LATEST', ' Latest ', 'heroes', 'Hero']) assert.ok(matches(hero, q), JSON.stringify(q))
  for (const q of ['zzzz', 'newsletter']) assert.ok(!matches(hero, q), q)
})

test('a search CROSSES the rail: the category list stays, and the grid answers for the whole canvas (UX-DR6)', () => {
  const offered = offeredHere(LIBRARY, 'home.hbs', 'default.hbs')
  // a category narrows the grid while nothing is searched for
  assert.deepEqual(cards(offered, 'a4', '').map((e) => e.id), ['a4/1', 'a4/13'])
  assert.deepEqual(cards(offered, null, '').map((e) => e.id), ['a1/1', 'a4/1', 'a4/13', 'a17/1', 'a22/1'])
  // …and a search ignores it, so typing while inside Heroes still finds the Newsletter design
  assert.deepEqual(cards(offered, 'a4', 'inline').map((e) => e.id), ['a22/1'])
  // the rail itself is derived from what is OFFERED and never from what is shown, so it cannot move under a search
  assert.deepEqual(rail(offered).length, rail(offeredHere(LIBRARY, 'home.hbs', 'default.hbs')).length)
})

test('the three empty states, none of which the export draws (R-74)', () => {
  // something is shown → no empty state at all
  assert.equal(emptyState(4, 4, ''), null)
  // a search with no matches names what was searched for (UX-DR6), and never a blank
  const none = emptyState(4, 0, ' zzzz ')
  assert.match(none?.title ?? '', /zzzz/)
  assert.ok((none?.instruction ?? '').length > 0)
  // a category with nothing in it — reachable only by a stale selection, because a row exists only where a design is
  assert.match(emptyState(4, 0, '')?.title ?? '', /category/i)
  // and a canvas nothing can be placed on says so instead of showing an empty grid
  assert.match(emptyState(0, 0, '')?.title ?? '', /template/i)
  assert.notEqual(emptyState(0, 0, '')?.title, emptyState(4, 0, '')?.title)
})

test('the meta line is ONE template — S5a\'s words, with S5c\'s one addition', () => {
  assert.equal(metaLine(18, 'Paper', false), '18 designs · shown in your pack: Paper')
  assert.equal(metaLine(18, 'Paper', true), '18 designs · shown in your pack: Paper · dark mode')
  assert.equal(metaLine(1, 'Paper', false), '1 design · shown in your pack: Paper')
  assert.equal(metaLine(0, 'Paper', false), '0 designs · shown in your pack: Paper')
})

test('R-152: a site-wide design is the one that compiles into the site file, and its words are one string', () => {
  assert.equal(isSiteWide(LIBRARY['a1/1'] as SectionRegistryEntry, 'default.hbs'), true)
  assert.equal(isSiteWide(LIBRARY['a4/13'] as SectionRegistryEntry, 'default.hbs'), false)
  assert.match(SITE_WIDE_WORDS, /every template/i)
})

/* THE INVOKED POSITION — the matrix's four open rows, as one number in the canvas's OWN doc. The stack is what
   Layers and the canvas show: the site-wide sections outside `a3/`, then this canvas's own, then the `a3/` footers
   (`canvasStack`, `editor.test.ts:103`). */
test('the invoked position counts the canvas\'s own sections at or before the gap', () => {
  const stack = [
    { doc: 'site' }, // a site-wide header
    { doc: 'home' },
    { doc: 'home' },
    { doc: 'home' },
    { doc: 'site' }, // an a3 footer
  ]
  // ⌘K with nothing selected, and a gap past the end: the end of this canvas's own stack
  assert.equal(invokedAt(stack, 'home', null), 3)
  assert.equal(invokedAt(stack, 'home', 99), 3)
  assert.equal(invokedAt(stack, 'home', -1), 3)
  // the "+" under the site-wide header puts it at the TOP of the page's own stack
  assert.equal(invokedAt(stack, 'home', 0), 0)
  // …and under each of the canvas's own, directly after it
  assert.equal(invokedAt(stack, 'home', 1), 1)
  assert.equal(invokedAt(stack, 'home', 2), 2)
  assert.equal(invokedAt(stack, 'home', 3), 3)
  // under the footer, which is last on screen: still the end of the page's own stack
  assert.equal(invokedAt(stack, 'home', 4), 3)
  // an empty canvas has one position, and it is 0
  assert.equal(invokedAt([{ doc: 'site' }], 'home', 0), 0)
  assert.equal(invokedAt([], 'home', null), 0)
})

// ── the owner's test of 2026-09-20: a card's SHAPE is the section's own, and four columns is the grid ────────────

test("spanFor: a band spans two columns, a feed two rows, and everything between is one tile", () => {
  // a header at 120px over Desktop's 1440, an announcement bar at 60 — both far wider than they are tall
  assert.equal(spanFor(120 / 1440), 'wide')
  assert.equal(spanFor(60 / 1440), 'wide')
  // a hero at 600px is neither: it is close enough to a tile's own shape to be one
  assert.equal(spanFor(600 / 1440), null)
  // a post grid of twelve cards is a page and a half of scroll — it earns the second row
  assert.equal(spanFor(2000 / 1440), 'tall')
  // and a preview that has not been drawn yet knows nothing, so it is a tile like any other
  assert.equal(spanFor(0), null)
  assert.equal(spanFor(-1), null)
})

test('spanFor: the two thresholds are the only numbers, and each is a boundary a design can sit on', () => {
  // exactly at a threshold is NOT the exception — strictly under is wide, strictly over is tall
  assert.equal(spanFor(WIDE_UNDER), null)
  assert.equal(spanFor(WIDE_UNDER - 0.001), 'wide')
  assert.equal(spanFor(TALL_OVER), null)
  assert.equal(spanFor(TALL_OVER + 0.001), 'tall')
  assert.ok(WIDE_UNDER < TALL_OVER, 'a design can never be both wide and tall')
})
