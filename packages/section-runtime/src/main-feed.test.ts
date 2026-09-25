import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PAGINATED_TARGETS } from '@inflozo/library'
import { duplicateSection, insertSection, removeSection, setHidden, switchDesign } from './doc-edit.ts'
import { parseDoc, type ProjectDoc } from './doc-schema.ts'
import { designate, feedBase, feedlessArchive, feedQuery, isFeed, mainFeedOf, makeMainFeed } from './main-feed.ts'
import type { SynthesisLibrary } from './synthesize.ts'

// Story 5.19 — FR-H2's main-feed designation, every lifecycle row of the spec's I/O matrix that is not a pixel, over
// docs parsed through AD-27's own schema. AD-1 bans `node:fs` in a core package, so the library is built in memory: two
// FEED designs (their contexts include the native `posts`) and two that are not. `apps/web/page-two.test.ts` runs the
// rule against the real library.

const FEEDS = ['a17/1', 'a17/2']
const library: SynthesisLibrary = (id) =>
  ['a17/1', 'a17/2', 'a4/13', 'a22/1'].includes(id)
    ? { compileTarget: [...PAGINATED_TARGETS], contentSchema: {}, bindingContext: FEEDS.includes(id) ? ['posts'] : ['none'] }
    : undefined

const at = (instanceId: string, designId: string, over: Record<string, unknown> = {}) => ({
  instanceId, layerName: instanceId, designId, content: {}, controls: {}, data: {}, darkOverrides: {}, ...over,
})
const doc = (...instances: unknown[]): ProjectDoc => parseDoc({ schemaVersion: 1, instances }, 'home')
const flags = (d: ProjectDoc) => d.instances.filter((i) => i.isMainFeed).map((i) => i.instanceId)
const ok = <T>(r: T | string): T => {
  assert.notEqual(typeof r, 'string', typeof r === 'string' ? r : '')
  return r as T
}
const HOME = 'home.hbs'

/** the gesture as the editor makes it: the operation, then the rule, with the doc before the edit as `previous` */
const gesture = (before: ProjectDoc, op: (d: ProjectDoc) => ProjectDoc | string, file = HOME) => designate(ok(op(before)), file, library, before)

test('a feed is a design whose contexts include the native posts — the field offeredOn reads', () => {
  assert.equal(isFeed(library('a17/1')), true)
  assert.equal(isFeed(library('a4/13')), false)
  assert.equal(isFeed(undefined), false, 'a design the library does not hold is no feed')
})

test('the invariant holds as it stands: the SAME object comes back, and a valid designation is never moved', () => {
  const home = doc(at('hero', 'a4/13'), at('grid', 'a17/1', { isMainFeed: true }), at('more', 'a17/2'))
  for (const file of PAGINATED_TARGETS) assert.equal(designate(home, file, library), home, file)
  // a main feed LOWER on the page than another feed is still valid: position decides nothing (AD-27)
  const low = doc(at('more', 'a17/2'), at('grid', 'a17/1', { isMainFeed: true }))
  assert.equal(designate(low, HOME, library), low)
  // a page with no feed at all, and one whose only feed is hidden with no flag, need nothing
  const none = doc(at('hero', 'a4/13'))
  assert.equal(designate(none, HOME, library), none)
  const hiddenOnly = doc(at('grid', 'a17/1', { hidden: true }))
  assert.equal(designate(hiddenOnly, HOME, library), hiddenOnly)
})

test('written before the rule: a feed with no flag — the first visible feed is the main feed (the owner\'s Pilot sections Home)', () => {
  const pilot = doc(at('hero', 'a4/13'), at('grid', 'a17/1'))
  const repaired = designate(pilot, HOME, library)
  assert.notEqual(repaired, pilot)
  assert.deepEqual(flags(repaired), ['grid'])
  assert.deepEqual(flags(pilot), [], 'the stored doc is not mutated — reading alone writes nothing (AD-22)')
  // a hidden feed above does not take it: the first VISIBLE one does
  assert.deepEqual(flags(designate(doc(at('a', 'a17/2', { hidden: true }), at('b', 'a17/1')), HOME, library)), ['b'])
})

test('written before the rule: two flags — the first visible flagged feed keeps it', () => {
  const twice = doc(at('grid', 'a17/1', { isMainFeed: true }), at('copy', 'a17/1', { isMainFeed: true }))
  assert.deepEqual(flags(designate(twice, HOME, library)), ['grid'])
  const firstHidden = doc(at('grid', 'a17/1', { isMainFeed: true, hidden: true }), at('copy', 'a17/1', { isMainFeed: true }))
  assert.deepEqual(flags(designate(firstHidden, HOME, library)), ['copy'])
  // a flag on something that is no feed goes; a feed takes it
  assert.deepEqual(flags(designate(doc(at('hero', 'a4/13', { isMainFeed: true }), at('grid', 'a17/1')), HOME, library)), ['grid'])
  assert.deepEqual(flags(designate(doc(at('hero', 'a4/13', { isMainFeed: true })), HOME, library)), [])
})

test('off a paginated file no instance carries the flag', () => {
  const stray = doc(at('grid', 'a17/1', { isMainFeed: true }))
  for (const file of ['post.hbs', 'page.hbs', 'default.hbs', 'error.hbs', 'custom-signup.hbs']) {
    assert.deepEqual(flags(designate(stray, file, library)), [], file)
  }
  const clean = doc(at('hero', 'a4/13'))
  assert.equal(designate(clean, 'post.hbs', library), clean)
})

test('place the first feed: it lands as the main feed; place another: it lands secondary', () => {
  const empty = doc(at('hero', 'a4/13'))
  const first = gesture(empty, (d) => insertSection(d, 1, parseDoc({ schemaVersion: 1, instances: [at('grid', 'a17/1')] }, 'home').instances[0]!))
  assert.deepEqual(flags(first), ['grid'])
  const second = gesture(first, (d) => insertSection(d, 2, parseDoc({ schemaVersion: 1, instances: [at('more', 'a17/2')] }, 'home').instances[0]!))
  assert.deepEqual(flags(second), ['grid'], 'a second feed lands secondary')
  // on page 2's own doc the same rule holds (R-177)
  assert.deepEqual(flags(designate(doc(at('grid', 'a17/1')), 'index.hbs', library)), ['grid'])
})

test('delete the main feed: the next visible feed BELOW takes it, else the nearest above, in the same edit', () => {
  const three = doc(at('above', 'a17/2'), at('main', 'a17/1', { isMainFeed: true }), at('hero', 'a4/13'), at('below', 'a17/2'))
  assert.deepEqual(flags(gesture(three, (d) => removeSection(d, 'main'))), ['below'])
  const noneBelow = doc(at('far', 'a17/2'), at('near', 'a17/1'), at('main', 'a17/1', { isMainFeed: true }), at('hero', 'a4/13'))
  assert.deepEqual(flags(gesture(noneBelow, (d) => removeSection(d, 'main'))), ['near'], 'the NEAREST above')
  // a hidden feed below is passed over for a visible one
  const hiddenBelow = doc(at('main', 'a17/1', { isMainFeed: true }), at('b1', 'a17/2', { hidden: true }), at('b2', 'a17/2'))
  assert.deepEqual(flags(gesture(hiddenBelow, (d) => removeSection(d, 'main'))), ['b2'])
  // delete the only feed: zero feeds, allowed — no flag anywhere
  assert.deepEqual(flags(gesture(doc(at('hero', 'a4/13'), at('main', 'a17/1', { isMainFeed: true })), (d) => removeSection(d, 'main'))), [])
})

test('hide the main feed: the flag moves with the hide; showing it again never takes it back', () => {
  const two = doc(at('main', 'a17/1', { isMainFeed: true }), at('other', 'a17/2'))
  const hidden = gesture(two, (d) => setHidden(d, 'main', true))
  assert.deepEqual(flags(hidden), ['other'])
  const shown = gesture(hidden, (d) => setHidden(d, 'main', false))
  assert.deepEqual(flags(shown), ['other'], 'a shown section never takes the flag back')
  // hide the only feed: it keeps the flag, hidden (5.16's "a hidden main feed is still the main feed")
  const only = doc(at('hero', 'a4/13'), at('main', 'a17/1', { isMainFeed: true }))
  const kept = gesture(only, (d) => setHidden(d, 'main', true))
  assert.deepEqual(flags(kept), ['main'])
  assert.equal(kept.instances[1]!.hidden, true)
  // and a hidden main feed with a visible one placed beside it hands it on — the flag is on a visible feed
  const placed = gesture(kept, (d) => insertSection(d, 2, parseDoc({ schemaVersion: 1, instances: [at('new', 'a17/2')] }, 'home').instances[0]!))
  assert.deepEqual(flags(placed), ['new'])
})

test('duplicate the main feed: the copy lands secondary', () => {
  const one = doc(at('main', 'a17/1', { isMainFeed: true }))
  const copied = gesture(one, (d) => duplicateSection(d, 'main', 'copy'))
  assert.deepEqual(flags(copied), ['main'])
  assert.equal(copied.instances.find((i) => i.instanceId === 'copy')?.isMainFeed, false)
})

test('reassign: ONE edit moves the flag, and the old main feed keeps its own stored Data values', () => {
  const two = doc(at('main', 'a17/1', { isMainFeed: true }), at('other', 'a17/2', { data: { posts: { source: 'tag', tag: 'craft' } } }))
  const moved = ok(makeMainFeed(two, HOME, 'other', library))
  assert.deepEqual(flags(moved), ['other'])
  assert.equal(designate(moved, HOME, library), moved, 'the result already satisfies the rule')
  assert.deepEqual(moved.instances[1]!.data, two.instances[1]!.data, 'nothing chosen is lost')
  // refused — and never offered — on a hidden row, a row that is no feed and a page that does not paginate
  assert.match(String(makeMainFeed(doc(at('m', 'a17/1', { isMainFeed: true }), at('h', 'a17/2', { hidden: true })), HOME, 'h', library)), /hidden/)
  assert.match(String(makeMainFeed(doc(at('m', 'a17/1', { isMainFeed: true }), at('hero', 'a4/13')), HOME, 'hero', library)), /Only a list of posts/)
  assert.equal(typeof makeMainFeed(doc(at('m', 'a17/1')), 'post.hbs', 'm', library), 'string')
  // on the main feed itself it changes nothing
  assert.equal(makeMainFeed(two, HOME, 'main', library), two)
})

test('a design switch inside the ring keeps the flag — a ring shares bindingContext', () => {
  const one = doc(at('main', 'a17/1', { isMainFeed: true }))
  const ring = [{ id: 'a17/1', controlSchema: [] }, { id: 'a17/2', controlSchema: [] }]
  const switched = gesture(one, (d) => switchDesign(d, 'main', 'a17/2', ring))
  assert.deepEqual(flags(switched), ['main'])
})

test('a Tag or Author page with no visible feed is a feed-less archive — and Home never is', () => {
  const hidden = doc(at('head', 'a4/13'), at('grid', 'a17/1', { hidden: true, isMainFeed: true }))
  assert.equal(feedlessArchive(hidden, 'tag.hbs', library), true)
  assert.equal(feedlessArchive(hidden, 'author.hbs', library), true)
  assert.equal(feedlessArchive(hidden, HOME, library), false, 'Home\'s page 2 is another file (FR-I1)')
  assert.equal(feedlessArchive(hidden, 'index.hbs', library), false)
  assert.equal(feedlessArchive(doc(at('grid', 'a17/1')), 'tag.hbs', library), false, 'gone the moment a feed shows')
  assert.equal(feedlessArchive(doc(at('head', 'a4/13')), 'tag.hbs', library), true, 'no feed at all')
})

test('a secondary feed\'s query: posts, the page size, newest first — folded with data.posts; none for the main feed', () => {
  const entry = library('a17/1')
  assert.deepEqual(feedQuery(entry, { isMainFeed: false, data: {} }, HOME, 12), { source: 'posts', limit: 12, order: 'published_at desc' })
  assert.deepEqual(feedQuery(entry, { isMainFeed: false, data: { posts: { count: 3, order: 'oldest' } } }, HOME, 12), { source: 'posts', limit: 3, order: 'published_at asc' })
  assert.deepEqual(feedQuery(entry, { isMainFeed: false, data: { posts: { source: 'tag', tag: 'craft' } } }, HOME, 12), { source: 'posts', limit: 12, order: 'published_at desc', filter: "tag:'craft'" })
  assert.equal(feedQuery(entry, { isMainFeed: true, data: {} }, HOME, 12), undefined, 'the main feed renders the native posts')
  assert.equal(feedQuery(library('a4/13'), { isMainFeed: false, data: {} }, HOME, 12), undefined, 'no feed, no query')
  assert.equal(feedQuery(entry, { isMainFeed: false, data: {} }, 'post.hbs', 12), undefined)
  // FR-H2: never limit="all" — the page size is held to 1–100
  assert.equal(feedBase(250).limit, 100)
  assert.equal(feedBase(0).limit, 1)
  assert.equal(mainFeedOf(doc(at('a', 'a17/2'), at('b', 'a17/1', { isMainFeed: true })))?.instanceId, 'b')
})
