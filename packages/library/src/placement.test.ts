import { test } from 'node:test'
import assert from 'node:assert/strict'
import { byCategory, categoryOf, compilesTo, CONTEXTS_BY_TARGET, isPlaceable, NON_PLACEABLE, offeredOn, placementRefusal, POST_CONTENT, ringFor, samePartition } from './placement.ts'
import type { BindingContext } from './vocabulary.ts'
import type { Surface } from './registry.ts'
import feedDesign from '../designs/a17/1/design.json' with { type: 'json' }
import bandDesign from '../designs/a22/1/design.json' with { type: 'json' }

// Story 5.4 — the matrix's placement rows. Neither rule can be exercised on the deployed editor, because
// `packages/library/designs/` holds no A25, A32, A33 or A34 design: this is their whole proof.

test('every non-placeable treatment is refused, and an ordinary design is not', () => {
  for (const category of NON_PLACEABLE) {
    for (const n of [1, 2, 12]) assert.equal(isPlaceable(`${category}/${n}`), false, `${category}/${n}`)
  }
  for (const id of ['a1/1', 'a4/13', 'a17/1', 'a22/1', 'a24/1', 'a25/1', 'a31/6']) {
    assert.equal(isPlaceable(id), true, id)
  }
})

test('an id that is not {category}/{n} is not placeable and has no category', () => {
  for (const id of ['', 'a32', 'A32/1', 'a32/', '../a32/1', 'a1/1/2']) {
    assert.equal(categoryOf(id), '', id)
    assert.equal(isPlaceable(id), false, id)
  }
})

test('a first Post Content is allowed; a second is refused with the sentence', () => {
  assert.equal(placementRefusal(`${POST_CONTENT}/1`, []), null)
  assert.equal(placementRefusal('a25/1', ['a24/1', 'a26/2']), null, 'a post header and a post footer are not the article')
  assert.equal(placementRefusal('a25/7', ['a24/1', 'a25/1']), 'this layout already prints the article')
  // any design of the category counts, and the one being placed is not compared with itself by id
  assert.equal(placementRefusal('a25/1', ['a25/1']), 'this layout already prints the article')
})

test('an ordinary design is unaffected, however many are already there', () => {
  assert.equal(placementRefusal('a17/1', ['a17/1', 'a17/1', 'a25/1']), null)
  assert.equal(placementRefusal('a1/1', ['a25/1']), null)
})

test('a non-placeable treatment answers no sentence: it is absent, not refused (UX-DR3)', () => {
  for (const category of NON_PLACEABLE) assert.equal(placementRefusal(`${category}/1`, ['a25/1']), null, category)
})

// ─── Story 5.10 — the bindingContext half, the numeric order, and the one query the Section Picker reads ──────────

const entry = (id: string, bindingContext: BindingContext[], compileTarget: string[]) => ({ id, bindingContext, compileTarget })

test('CONTEXTS_BY_TARGET is appendix B1 §3 plus §5, and R-7 holds §5 off the two templates that must not query', () => {
  // §3's master matrix, row by row — the native half
  assert.deepEqual([...CONTEXTS_BY_TARGET('default.hbs')].sort(), ['authors', 'none', 'posts', 'tags', 'tiers'])
  assert.ok(CONTEXTS_BY_TARGET('home.hbs').includes('posts') && CONTEXTS_BY_TARGET('index.hbs').includes('posts'))
  // §3a's wrapper rule: the resource is `post` on BOTH, and what differs is the product, which compileTarget says
  assert.deepEqual([...CONTEXTS_BY_TARGET('post.hbs')].sort(), [...CONTEXTS_BY_TARGET('page.hbs')].sort())
  assert.ok(CONTEXTS_BY_TARGET('post.hbs').includes('post') && !CONTEXTS_BY_TARGET('home.hbs').includes('post'))
  assert.ok(CONTEXTS_BY_TARGET('tag.hbs').includes('tag') && CONTEXTS_BY_TARGET('author.hbs').includes('author'))
  // R-7: no §5 resource on either, and each keeps its own
  for (const file of ['error.hbs', 'private.hbs']) {
    for (const c of ['posts', 'tags', 'authors', 'tiers']) assert.ok(!CONTEXTS_BY_TARGET(file).includes(c as BindingContext), `${c} on ${file}`)
  }
  assert.deepEqual([...CONTEXTS_BY_TARGET('error.hbs')].sort(), ['error', 'none'])
  assert.deepEqual([...CONTEXTS_BY_TARGET('private.hbs')].sort(), ['none', 'private'])
  // a Routes-Manager template carries nothing natively and reaches §5 through a get (§3, the custom-route row)
  assert.deepEqual([...CONTEXTS_BY_TARGET('custom-signup.hbs')].sort(), ['authors', 'none', 'posts', 'tags', 'tiers'])
  // `none` is on every row: a design that binds no resource fits anywhere
  for (const file of ['default.hbs', 'home.hbs', 'post.hbs', 'error.hbs', 'private.hbs', 'custom-x.hbs']) {
    assert.ok(CONTEXTS_BY_TARGET(file).includes('none'), file)
  }
})

test('offeredOn is the three conditions together, and each of them alone is enough to withhold a design', () => {
  assert.equal(offeredOn(entry('a17/1', ['posts'], ['home.hbs']), 'home.hbs'), true)
  // wrong template
  assert.equal(offeredOn(entry('a17/1', ['posts'], ['home.hbs']), 'post.hbs'), false)
  // wrong resource: the target is listed, and the context is not there
  assert.equal(offeredOn(entry('a17/1', ['posts'], ['home.hbs', 'error.hbs']), 'error.hbs'), false)
  // non-placeable: a treatment is never offered, however well it fits
  assert.equal(offeredOn(entry('a33/1', ['none'], ['post.hbs']), 'post.hbs'), false)
  // a design that binds nothing is offered wherever it compiles
  assert.equal(offeredOn(entry('a1/1', ['none'], ['default.hbs']), 'default.hbs'), true)
})

test('byCategory is NUMERIC — a17 after a4, which a string sort gets wrong', () => {
  assert.deepEqual(['a17', 'a4', 'a1', 'a22', 'a24'].sort(byCategory), ['a1', 'a4', 'a17', 'a22', 'a24'])
  assert.deepEqual(['a3', 'a30', 'a2'].sort(byCategory), ['a2', 'a3', 'a30'])
  // anything that is not `a{n}` sorts after everything that is, by its own name
  assert.deepEqual(['zz', 'a9', 'aa'].sort(byCategory), ['a9', 'aa', 'zz'])
})

// ─── Story 5.11 — the RING (FR-D19, FR-D13). Neither arm can be exercised on the deployed editor either:
//     `packages/library/designs/` holds one design per category, so every ring in the shipped library has
//     length 1 and the partition rule would be asserted vacuously. This, and the three-design fixture the
//     app's own tests use, are its whole proof.

const ringDesign = (id: string, over: Partial<{ bindingContext: BindingContext[]; compileTarget: string[]; surface: Surface }> = {}) => ({
  id,
  bindingContext: ['none'] as BindingContext[],
  compileTarget: ['home.hbs'],
  ...over,
})

test('a ring is its category, every design of it, in {n} order — and it holds the design it started from', () => {
  const all = [ringDesign('a17/10'), ringDesign('a17/2'), ringDesign('a4/1'), ringDesign('a17/1')]
  assert.deepEqual(ringFor(all, all[1]!).map((e) => e.id), ['a17/1', 'a17/2', 'a17/10'], 'a string sort would put 10 before 2')
  assert.deepEqual(ringFor(all, all[2]!).map((e) => e.id), ['a4/1'], 'a category of one is a ring of one, never empty')
})

test('the partition is bindingContext AND compileTarget AND surface, as SETS and not as an intersection', () => {
  const base = ringDesign('a29/1', { bindingContext: ['tag'], compileTarget: ['tag.hbs'] })
  const same = ringDesign('a29/2', { bindingContext: ['tag'], compileTarget: ['tag.hbs'] })
  // A29's tag design and its author design are ONE category and TWO rings
  const author = ringDesign('a29/3', { bindingContext: ['author'], compileTarget: ['author.hbs'] })
  // A31's error page against its private page: the same binding set, a different file
  const narrower = ringDesign('a29/4', { bindingContext: ['tag'], compileTarget: ['tag.hbs', 'author.hbs'] })
  assert.equal(samePartition(base, same), true)
  assert.equal(samePartition(base, author), false)
  assert.equal(samePartition(base, narrower), false, 'a wider target set is a different ring: a swap must not take a section off a template it is already on')
  // order does not matter — they are sets
  assert.equal(samePartition(narrower, ringDesign('a29/5', { bindingContext: ['tag'], compileTarget: ['author.hbs', 'tag.hbs'] })), true)
  assert.deepEqual(ringFor([base, same, author, narrower], base).map((e) => e.id), ['a29/1', 'a29/2'])
})

test("A30's surface partitions a ring, and nothing declares one today", () => {
  const signup = ringDesign('a30/1', { surface: 'signup' })
  const signin = ringDesign('a30/2', { surface: 'signin' })
  const second = ringDesign('a30/3', { surface: 'signup' })
  const undeclared = ringDesign('a30/4')
  assert.deepEqual(ringFor([signup, signin, second, undeclared], signup).map((e) => e.id), ['a30/1', 'a30/3'])
  assert.equal(samePartition(signup, undeclared), false, 'a declared surface and none are two rings')
  assert.deepEqual(ringFor([signup, signin, second, undeclared], undeclared).map((e) => e.id), ['a30/4'])
})

test('a non-placeable treatment is never in a ring, and has none of its own (UX-DR3)', () => {
  const treatments = NON_PLACEABLE.map((c) => ringDesign(`${c}/1`))
  const ordinary = ringDesign('a17/1')
  assert.deepEqual(ringFor([...treatments, ordinary], ordinary).map((e) => e.id), ['a17/1'])
  for (const t of treatments) assert.deepEqual(ringFor([...treatments, ordinary], t), [], t.id)
})

test('a malformed id has no ring, and cannot drag one in with it', () => {
  const junk = ringDesign('../a17/1')
  assert.deepEqual(ringFor([junk, ringDesign('a17/1')], junk), [])
  assert.equal(samePartition(junk, junk), false)
})

// ─── Story 5.16 — a design that may sit on Home may sit on its page 2 (R-179, `templates.js:67`) ─────────────────
//
// Ghost hands `home.hbs` and `index.hbs` the same posts and pagination, so Home's page 2 — an exact copy of page 1 until
// it is changed — must be able to hold every design page 1 holds. The two real designs are read from their own
// descriptors, so the day either one's targets move this test follows rather than lying.

test('compilesTo: a design listing home.hbs may sit on index.hbs, and the widening reaches no other file', () => {
  // a17/1 lists both files — the control: nothing is widened for it
  assert.ok(feedDesign.compileTarget.includes('home.hbs') && feedDesign.compileTarget.includes('index.hbs'), 'the control: a17/1 lists both')
  assert.equal(compilesTo(feedDesign.compileTarget, 'index.hbs'), true)
  // a22/1 lists home.hbs and NOT index.hbs: it may sit on Home's page 2 all the same
  assert.ok(bandDesign.compileTarget.includes('home.hbs') && !bandDesign.compileTarget.includes('index.hbs'), 'the control: a22/1 lists home.hbs alone')
  assert.equal(compilesTo(bandDesign.compileTarget, 'index.hbs'), true)
  // ONE widening, in ONE direction: index.hbs does not open home.hbs, and home.hbs opens nothing else
  assert.equal(compilesTo(['index.hbs'], 'home.hbs'), false)
  for (const file of ['tag.hbs', 'author.hbs', 'post.hbs', 'default.hbs', 'error.hbs']) {
    assert.equal(compilesTo(['home.hbs'], file), false, file)
  }
  // and everything a design lists is still a file it sits on
  for (const file of bandDesign.compileTarget) assert.equal(compilesTo(bandDesign.compileTarget, file), true, file)
})

test('offeredOn asks the same rule: the Section Picker on Home\'s page 2 offers what Home offers', () => {
  const band = entry('a22/1', bandDesign.bindingContext as BindingContext[], bandDesign.compileTarget)
  assert.equal(offeredOn(band, 'home.hbs'), true)
  assert.equal(offeredOn(band, 'index.hbs'), true, 'a Home design is offered on page 2')
  assert.equal(offeredOn(entry('a4/13', ['none'], ['home.hbs']), 'index.hbs'), true)
  // and a design that sits on neither is still withheld there
  assert.equal(offeredOn(entry('a24/1', ['post'], ['post.hbs']), 'index.hbs'), false)
})
