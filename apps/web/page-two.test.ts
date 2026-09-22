import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { orbitWeekly } from '@inflozo/library'
import { parseDoc, removeSection, renameSection, synthesize, type ProjectDoc, type SynthesisLibrary } from '@inflozo/section-runtime'
import { CANVASES, PAGE_TWO, SITE, templateKeyOf, type CanvasKey } from './lib/editor.ts'
import { KEYMAP } from './lib/keymap.ts'
import {
  BACK_TO_PAGE_ONE, carry, COPY_MARKER, editedDoc, follows, followersOf, leftBecause, mainFeedOf, mainFeedOn, noPageTwo,
  offersPageTwo, ownKeyOf, PAGE_TWO_WORDS, pageFileOf, pageInForce, pageTwoOf, PREVIEW_PAGE, SITE_WIDE_ASK, stackOf,
  type Page,
} from './lib/page-two.ts'
import { pilot, pilotIds } from './lib/pilots.ts'
import { committed, EMPTY_DOC } from './lib/round-trip.ts'
import { afterChange } from './lib/view-as.ts'

/* Story 5.16 — page 2's rules over the REAL library (`packages/library/designs/`, read by `lib/pilots.ts`) and the
   REAL bundled publication: the stack a page paints, where page 2 is offered (R-176), what page 2 is before and after
   its first change (R-178, R-179), the records it runs out (R-167), the selection it carries and the words it says
   (R-170). Every subject, count and design id below is DERIVED from the library and the dataset — the owner's own
   projects are named in the spec's I/O matrix, and these are their shapes, never their figures. */

const held: SynthesisLibrary = (id) => (pilotIds().includes(id) ? pilot(id) : undefined)
const doc = (instances: ProjectDoc['instances']): ProjectDoc => ({ schemaVersion: 1, instances })
const PAGED = Object.keys(PAGE_TWO) as CanvasKey[]

/** What `read.ts` hands an untouched project: every paginated canvas's Synthesis Default stack, and a site doc of the
 *  library's own site-wide designs (the header). No page-2 row: every page 2 follows. */
function opened(): Record<string, ProjectDoc> {
  const site = parseDoc({
    schemaVersion: 1,
    instances: pilotIds().map(pilot).filter((e) => e.compileTarget.includes(SITE.file)).map((e, n) => ({
      instanceId: `site-${n}`, layerName: e.name, designId: e.id, content: {}, controls: {}, data: {}, darkOverrides: {},
    })),
  }, SITE.key)
  const docs: Record<string, ProjectDoc> = { [SITE.key]: site }
  for (const key of PAGED) docs[templateKeyOf(key)] = doc(synthesize(CANVASES[key].file, held).instances)
  return docs
}

/** The owner's Ghost 5 Project Home in shape: a newsletter band ABOVE the designated grid. */
function withBand(docs: Record<string, ProjectDoc>): Record<string, ProjectDoc> {
  const band = pilotIds().map(pilot).find((e) => e.compileTarget.includes('home.hbs') && !e.bindingContext.includes('posts'))
  assert.ok(band, 'the control: the library holds a Home design that is not a feed')
  const home = docs[templateKeyOf('home')] as ProjectDoc
  const bandInstance = parseDoc({ schemaVersion: 1, instances: [{ instanceId: 'band', layerName: 'Band', designId: band.id, content: {}, controls: {}, data: {}, darkOverrides: {} }] }, 'home').instances[0]!
  return { ...docs, [templateKeyOf('home')]: doc([bandInstance, ...home.instances]) }
}

const subjectOf = (canvas: CanvasKey) => orbitWeekly.fixtureSubject(CANVASES[canvas].file)
const pagesOf = (kind: 'tag' | 'author', slug: string) => orbitWeekly.feedPages(`${kind}.hbs`, { kind, slug })

test('the stack, page 1 and page 2, following and designed, holds no instance absent from the docs', () => {
  const docs = withBand(opened())
  for (const canvas of PAGED) {
    const two = PAGE_TWO[canvas]!
    const one = docs[templateKeyOf(canvas)] as ProjectDoc
    const site = stackOf(docs, canvas, 1, held).filter((p) => p.doc === SITE.key)
    assert.ok(site.length > 0, 'the control: the header is on the page')
    for (const page of [1, 2] as Page[]) {
      const stack = stackOf(docs, canvas, page, held)
      // the site-wide rows are the same on both pages — one shared instance each (FR-D5)
      assert.deepEqual(stack.filter((p) => p.doc === SITE.key), site, `${canvas} page ${page}`)
      const own = stack.filter((p) => p.doc !== SITE.key)
      assert.ok(own.every((p) => p.doc === ownKeyOf(canvas, page) && p.target === pageFileOf(canvas, page)), `${canvas} page ${page}`)
      // FOLLOWING: page 2's rows are page 1's own instances, every one, in order — and nothing that is not in the docs
      assert.deepEqual(own.map((p) => p.instanceId), one.instances.map((i) => i.instanceId), `${canvas} page ${page}`)
      for (const p of own) assert.ok(one.instances.some((i) => i.instanceId === p.instanceId && i.designId === p.designId), p.instanceId)
    }
    assert.equal(pageFileOf(canvas, 2), two.file)
    // DESIGNED: once page 2 has its own doc, its rows are that doc's and page 1's are untouched — a rename, because an
    // archive's page 1 holds one section and removing it would empty page 2 back into following
    const own2 = renameSection(pageTwoOf(docs, canvas, held), one.instances[0]!.instanceId, 'Page 2 only') as ProjectDoc
    const designed = { ...docs, [two.key]: own2 }
    assert.deepEqual(stackOf(designed, canvas, 2, held).filter((p) => p.doc === two.key).map((p) => p.layerName), own2.instances.map((i) => i.layerName))
    assert.deepEqual(stackOf(designed, canvas, 1, held).filter((p) => p.doc !== SITE.key).map((p) => p.layerName), one.instances.map((i) => i.layerName))
    assert.ok(own2.instances.every((i) => stackOf(designed, canvas, 2, held).some((p) => p.instanceId === i.instanceId && p.layerName === i.layerName)))
  }
  // Home's page 2 renders at index.hbs, where Ghost renders /page/2/; an archive's on its own file
  assert.equal(pageFileOf('home', 2), 'index.hbs')
  assert.equal(pageFileOf('tag', 2), 'tag.hbs')
  assert.equal(pageFileOf('post', 2), 'post.hbs', 'a canvas with no page 2 has only its own file')
})

test('R-176: offered on an untouched Home, a Home that kept its grid and a tag with a second page — and nowhere else', () => {
  const docs = opened()
  assert.equal(offersPageTwo('home', docs, null), true, 'an untouched Home')
  assert.equal(offersPageTwo('home', withBand(docs), null), true, 'a Home that kept its auto-generated grid')
  // every tag, derived: offered exactly where its own posts run to a second page
  let some = false
  for (const t of orbitWeekly.tags()) {
    const subject = { kind: 'tag' as const, slug: t.slug }
    assert.equal(offersPageTwo('tag', docs, subject), pagesOf('tag', t.slug) >= 2, t.slug)
    some ||= pagesOf('tag', t.slug) >= 2
  }
  assert.ok(some, 'the control: at least one tag has a page 2')
  assert.equal(offersPageTwo('tag', docs, subjectOf('tag')), true, 'the fixture tag, which the Tag canvas opens on')
  // no writer has a second page, so no Author page offers one
  for (const a of orbitWeekly.authors()) assert.equal(offersPageTwo('author', docs, { kind: 'author', slug: a.slug }), false, a.slug)
  // a Home whose sections carry no main feed (the owner's Pilot sections) offers none
  const landing = { ...docs, home: doc((docs.home as ProjectDoc).instances.map((i) => ({ ...i, isMainFeed: false }))) }
  assert.equal(offersPageTwo('home', landing, null), false)
  // a hidden main feed is still the main feed: page 2 is its own design, so it is offered
  const hidden = { ...docs, home: doc((docs.home as ProjectDoc).instances.map((i) => ({ ...i, hidden: true }))) }
  assert.equal(offersPageTwo('home', hidden, null), true)
  // and a canvas that does not paginate never does
  for (const canvas of Object.keys(CANVASES) as CanvasKey[]) if (PAGE_TWO[canvas] === undefined) assert.equal(offersPageTwo(canvas, docs, subjectOf(canvas)), false, canvas)
})

test('the page in force: page 2 where it was asked for and exists, else page 1 with the reason said', () => {
  const docs = opened()
  assert.deepEqual(pageInForce(1, 'home', docs, null), { page: 1, reason: null })
  assert.deepEqual(pageInForce(2, 'home', docs, null), { page: 2, reason: null })
  const onePage = orbitWeekly.tags().find((t) => pagesOf('tag', t.slug) === 1)
  assert.ok(onePage, 'the control: a tag whose posts fit one page')
  const gone = pageInForce(2, 'tag', docs, { kind: 'tag', slug: onePage.slug })
  assert.equal(gone.page, 1)
  assert.equal(leftBecause(gone.reason as string), "Back to page 1: this tag's posts all fit on one page, so it has no page 2.")
  const lost = pageInForce(2, 'home', { ...docs, home: EMPTY_DOC }, null)
  assert.deepEqual(lost, { page: 1, reason: noPageTwo('home', { ...docs, home: EMPTY_DOC }, null) })
  assert.match(leftBecause(lost.reason as string), /^Back to page 1: this page no longer has a main list of posts/)
})

test("R-179 · R-178: page 2 follows page 1 until its first change, which stores the copy; then page 1 never reaches it", () => {
  const docs = withBand(opened())
  for (const canvas of PAGED) {
    const two = PAGE_TWO[canvas]!
    const p1 = templateKeyOf(canvas)
    assert.ok(follows(docs, canvas), `${canvas}: untouched, page 2 follows`)
    assert.equal(docs[two.key], undefined, 'and NOTHING is stored for it')
    // following: a change to page 1 shows on page 2 as well — derived, never kept beside it
    const renamed = renameSection(docs[p1] as ProjectDoc, (docs[p1] as ProjectDoc).instances[0]!.instanceId, 'Renamed') as ProjectDoc
    const after1 = committed({ ...docs, [p1]: renamed }, p1, {}, new Set()).docs
    assert.deepEqual(pageTwoOf(after1, canvas, held).instances, renamed.instances)
    assert.deepEqual(followersOf(after1, p1), [two.key], 'the change to page 1 reaches the following page 2')
    // THE FIRST CHANGE ON PAGE 2 STORES IT: the copy, with that change, under page 2's own key — page 1 byte-identical
    const edited = editedDoc(after1, two.key, held) as ProjectDoc
    const first = renameSection(edited, edited.instances[0]!.instanceId, 'Page 2 only') as ProjectDoc
    const forked = committed({ ...after1, [two.key]: first }, two.key, {}, new Set())
    assert.equal(forked.back, false)
    assert.equal(forked.docs[p1], after1[p1], 'page 1 is the very same doc')
    assert.deepEqual(forked.docs[two.key], first)
    assert.ok(!follows(forked.docs, canvas), 'page 2 is its own from then on')
    assert.deepEqual(followersOf(forked.docs, p1), [], 'and a change to page 1 no longer reaches it')
    // …so a later change to page 1 leaves page 2 exactly as it was
    const again = renameSection(forked.docs[p1] as ProjectDoc, renamed.instances[0]!.instanceId, 'Again') as ProjectDoc
    const later = committed({ ...forked.docs, [p1]: again }, p1, {}, new Set()).docs
    assert.deepEqual(pageTwoOf(later, canvas, held), first)
    // UNDO BACK: the journal's `before` is what page 2 stored before its first change — nothing — so it follows again
    const undone = committed({ ...forked.docs, [two.key]: after1[two.key] ?? EMPTY_DOC }, two.key, {}, new Set())
    assert.ok(follows(undone.docs, canvas))
    assert.deepEqual(pageTwoOf(undone.docs, canvas, held).instances, (undone.docs[p1] as ProjectDoc).instances)
    // EMPTYING page 2 follows again too (AD-22), stores nothing, and says so for the selection's sake
    let live = forked.docs[two.key] as ProjectDoc
    for (const i of live.instances) live = removeSection(live, i.instanceId) as ProjectDoc
    const emptied = committed({ ...forked.docs, [two.key]: live }, two.key, {}, new Set())
    assert.equal(emptied.back, true)
    assert.equal(emptied.docs[two.key], EMPTY_DOC, 'the value the flush sends is an empty doc: stored, it reads as following')
    assert.ok(follows(emptied.docs, canvas))
  }
})

test('the page-aware own key: page 2 edits page 2\'s doc, and the subject stays the canvas\'s', () => {
  for (const canvas of Object.keys(CANVASES) as CanvasKey[]) {
    assert.equal(ownKeyOf(canvas, 1), templateKeyOf(canvas))
    assert.equal(ownKeyOf(canvas, 2), PAGE_TWO[canvas]?.key ?? templateKeyOf(canvas))
  }
  // every other key edits its own doc, untouched by any of this
  const docs = opened()
  assert.equal(editedDoc(docs, templateKeyOf('home'), held), docs.home)
  assert.equal(editedDoc(docs, SITE.key, held), docs[SITE.key])
})

test('R-167: a change to page 2 runs out page 2\'s record; a change to page 1 runs out both while page 2 follows', () => {
  const docs = opened()
  const records = { home: ['anonymous', 'free', 'paid'] as const, index: ['anonymous', 'free', 'paid'] as const }
  // on page 2, a change to page 2: page 2 viewed as the visitor on screen, page 1 untouched (R-178)
  assert.deepEqual(afterChange(records, 'index', 'index', 'free'), { index: ['free'] })
  // an undo of a page-1 change pressed ON page 2, while page 2 follows: page 2 changed on screen, page 1 off it
  assert.deepEqual(afterChange(records, 'home', 'index', 'free', followersOf(docs, 'home')), { home: [], index: ['free'] })
  // on page 1, a change to page 1 while page 2 follows: both
  assert.deepEqual(afterChange(records, 'home', 'home', 'paid', followersOf(docs, 'home')), { home: ['paid'], index: [] })
  // once page 2 is its own, page 1's change is page 1's alone
  const own = { ...docs, index: pageTwoOf(docs, 'home', held) }
  assert.deepEqual(afterChange(records, 'home', 'home', 'paid', followersOf(own, 'home')), { home: ['paid'] })
  // and a header change reaches every record there is, page 2's included
  assert.deepEqual(afterChange(records, SITE.key, 'index', 'anonymous'), { home: [], index: ['anonymous'] })
})

test('the selection carries across the switch to the same section, where it exists; the row sits on the main feed', () => {
  const docs = withBand(opened())
  const feed = mainFeedOf(docs.home) as { instanceId: string }
  assert.ok(feed, 'the control: Home has a main feed')
  // the row: page 1's first `isMainFeed` instance, and on page 2 its copy
  assert.deepEqual(mainFeedOn(docs, 'home', 1, held), { doc: 'home', instanceId: feed.instanceId })
  assert.deepEqual(mainFeedOn(docs, 'home', 2, held), { doc: 'index', instanceId: feed.instanceId })
  // a section of the page carries to its copy, and back
  assert.deepEqual(carry({ doc: 'home', instanceId: 'band' }, 2, 'home', docs, held), { doc: 'index', instanceId: 'band' })
  assert.deepEqual(carry({ doc: 'index', instanceId: 'band' }, 1, 'home', docs, held), { doc: 'home', instanceId: 'band' })
  // a site-wide section is on every page
  const header = { doc: SITE.key, instanceId: (docs[SITE.key] as ProjectDoc).instances[0]!.instanceId }
  assert.deepEqual(carry(header, 2, 'home', docs, held), header)
  // once page 2 has lost the band, it carries to nothing
  const noBand = { ...docs, index: removeSection(pageTwoOf(docs, 'home', held), 'band') as ProjectDoc }
  assert.equal(carry({ doc: 'home', instanceId: 'band' }, 2, 'home', noBand, held), null)
  assert.equal(carry(null, 2, 'home', docs, held), null)
})

test('R-170: the words are EXPERIENCE.md\'s canonical strings, written once — and FR-D11 gains no key', () => {
  const experience = readFileSync(
    join(import.meta.dirname, '..', '..', '_bmad-output', 'planning-artifacts', 'ux-designs', 'ux-Inflozo-2026-09-03', 'EXPERIENCE.md'),
    'utf8',
  )
  const row = experience.split('\n').find((l) => l.includes('Page 2 Preview') && l.startsWith('| **"'))
  assert.ok(row, 'EXPERIENCE.md carries the canonical strings row for the Page 2 Preview')
  assert.ok(row.includes(`**"${PAGE_TWO_WORDS}"**`) && row.includes(`**"${BACK_TO_PAGE_ONE}"**`), row)
  // D5d's row label, and page 2's marker in D5a's shape
  assert.equal(PREVIEW_PAGE, 'Preview page')
  assert.match(COPY_MARKER, /^Copy of page 1 — edit anything to make page 2 its own$/)
  // R-180's ask, in FR-D5's vocabulary: its title names the section, and it opens on Cancel
  assert.equal(SITE_WIDE_ASK.title('Headers — Rail'), 'Change Headers — Rail everywhere?')
  assert.match(SITE_WIDE_ASK.body, /^This section is site-wide: it is one shared thing that appears on every page of your site/)
  assert.deepEqual([SITE_WIDE_ASK.cancel, SITE_WIDE_ASK.confirm], ['Cancel', 'Change it everywhere'])
  // "States added after the shortcut map carry no shortcut, deliberately" (EXPERIENCE.md:392-393)
  for (const binding of KEYMAP) assert.doesNotMatch(binding.action, /page 2|page two|paginat/i, binding.action)
})
