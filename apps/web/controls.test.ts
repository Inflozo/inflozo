import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ringFor, validateDesign } from '@inflozo/library'
import type { CategoryContent, DesignJson } from '@inflozo/library'
import { iconDrawing } from '@inflozo/library/icons'
import { CONTROLS_DIR, canvasDocument, imagePool, linkResources, poolImage, referenceSwatches, sample, samples } from './lib/controls-review.ts'
import { sampleRows } from './lib/canvas.ts'

// Story 4.5's review surface, held by the files it reads — the fences `style-guide.test.ts` put around
// Story 4.4's page, for the controls review. A core package cannot open a file, so the half of the
// contract that lives on disk is tested here.

test('the canvas document carries no script, so it needs no nonce', () => {
  const doc = canvasDocument()
  assert.doesNotMatch(doc, /<script\b/i)
  // Story 5.11: EVERY sample's stylesheet, because the ring draws any of the three into this one document
  for (const e of samples()) assert.ok(doc.includes(`/* ${e.id} */`) && doc.includes(e.css), `${e.id}'s stylesheet is not in the canvas document`)
  assert.match(doc, /<div id="canvas"><\/div>/, 'the mount point the review writes the section into')
  assert.match(doc, /<meta name="robots" content="noindex,nofollow">/)
  assert.match(doc, /data-mode="light"/)
})

test('a picture is served only when its id is in the pool', () => {
  const pool = imagePool()
  assert.ok(pool.some((a) => a.id === 'feature-03'), 'the sample picture feature-03 is not in the pool')
  assert.ok(poolImage('feature-03')?.toString('utf8').includes('<svg'))
  for (const id of ['../dataset', 'feature-03.svg', '', 'portrait-01']) assert.equal(poolImage(id), null, `${JSON.stringify(id)} was served`)
})

test('the assembled sample validates clean, through the same door the page uses', () => {
  const entry = sample() // throws, naming every failure, if it does not
  assert.equal(entry.id, 'controls/1')
  const design = JSON.parse(readFileSync(join(CONTROLS_DIR(), '1', 'design.json'), 'utf8')) as DesignJson
  const content = JSON.parse(readFileSync(join(CONTROLS_DIR(), 'content.json'), 'utf8')) as CategoryContent
  assert.deepEqual(validateDesign({ html: entry.html, design, content, icons: iconDrawing }), [])
})

test('the swatches are the reference tokens, and every colour role has one', () => {
  const swatches = referenceSwatches()
  assert.deepEqual(Object.keys(swatches).sort(), ['accent', 'base', 'contrast', 'surface'])
  for (const [role, value] of Object.entries(swatches)) assert.ok(value.length > 0, `${role} has no colour`)
  // Story 6.2's review: `/pilots`' dots follow the chosen pack — another preset's are its own, an unknown one is refused
  assert.notDeepEqual(referenceSwatches('light', 'mono'), swatches)
  assert.throws(() => referenceSwatches('light', 'harbor'))
})

// review: the page's Data rows are the one thing the theme's {{#get}} order is not compared against
test('each query is read in both orders, oldest ascending and newest descending by published_at', () => {
  // Story 5.19 — the page resolves each state's rows with the editor's own `sampleRows`; `queryRows` was its copy
  const rows = sampleRows(sample().dataBindings)
  assert.ok(Object.keys(rows).length > 0, 'the sample declares a query')
  const days = (list: readonly unknown[]) => list.map((r) => String((r as { published_at: string }).published_at))
  for (const { newest, oldest } of Object.values(rows)) {
    assert.ok(newest.length > 1 && oldest.length === newest.length)
    assert.deepEqual(days(oldest), [...days(oldest)].sort())
    assert.deepEqual(days(newest), [...days(newest)].sort().reverse())
    assert.deepEqual(days(oldest), [...days(newest)].reverse())
  }
})

test("every link resource carries a URL the picker can read a path from, and a stored-day meta for a post", () => {
  const all = linkResources()
  assert.deepEqual(all.pages, [])
  for (const group of ['posts', 'tags', 'authors'] as const) {
    assert.ok(all[group].length > 0, group)
    for (const r of all[group]) {
      assert.doesNotThrow(() => new URL(r.url), `${group} ${r.id} has no absolute url: ${JSON.stringify(r.url)}`)
      assert.ok(r.title.length > 0 && r.meta.length > 0)
    }
  }
  for (const p of all.posts) assert.match(p.meta, /^\d{4}-\d{2}-\d{2}$/, 'a date is shown as its stored day (DW-106)')
})

/* STORY 5.11 (R-158) — THE ONLY RING IN THE REPOSITORY. `packages/library/designs/` holds one design per
   category, so without these three the whole carry / park / default claim would be asserted vacuously. */

test('the samples are ONE ring — one category, one partition — and each validates and assembles', () => {
  const all = samples()
  assert.ok(all.length >= 3, 'three, not two: with two, ◀ and ▶ are indistinguishable and no value can be shown surviving an INTERMEDIATE design')
  assert.equal(all[0]?.id, sample().id, 'the page opens on the first, which is every earlier story\'s sample')
  // derived from the directory, in {n} order
  assert.deepEqual(all.map((e) => e.id), all.map((_, n) => `controls/${n + 1}`))
  // the partition rule itself: every one of them is in every other one's ring
  for (const e of all) assert.deepEqual(ringFor(all, e).map((x) => x.id), all.map((x) => x.id), `${e.id}`)
})

test('the ring proves every arm of carry / park / default, and FR-D13\'s cap, by DECLARATION', () => {
  const [one, two, three] = samples()
  const names = (e: typeof one) => new Set(e!.controlSchema.map((c) => c.name))
  const [a, b, c] = [names(one), names(two), names(three)]
  // CARRY: a control every design declares
  for (const shared of ['columns', 'align', 'card']) {
    assert.ok(a.has(shared) && b.has(shared) && c.has(shared), `${shared} must be declared by every design to prove a carry`)
  }
  // PARK: `tint` is the library's only `darkOverride: true` control and ONLY design 1 declares it, so a value
  // parked against design 1 must survive design 3 to be restored
  assert.ok(a.has('tint') && !b.has('tint') && !c.has('tint'), 'tint must be design 1\'s alone')
  assert.equal(one!.controlSchema.find((x) => x.name === 'tint')?.darkOverride, true)
  // SHARED BY TWO (Story 5.23, R-205): `icons` and `image` are designs 1's and 2's and not design 3's — the path the rule
  // as built at 5.11 lost round the ring (they travelled on to design 2 and were put aside against IT), so the ring must
  // keep one for `play-loop.test.ts`, the runtime's round-the-ring test and the keyboard journey to walk
  for (const shared of ['icons', 'image']) {
    assert.ok(a.has(shared) && b.has(shared) && !c.has(shared), `${shared} must be shared by designs 1 and 2 and not 3`)
  }
  // DEFAULT: a control only the incoming design declares
  assert.ok(b.has('frame') && !a.has('frame'), 'design 2 must add one of its own')
  assert.ok(c.has('stack') && !a.has('stack') && !b.has('stack'), 'design 3 must add a different one')
  // and the per-design item cap, against the category's three authored features
  const authored = (JSON.parse(readFileSync(join(CONTROLS_DIR(), 'content.json'), 'utf8')) as CategoryContent).props['features']?.default
  assert.equal(Array.isArray(authored) && authored.length, 3, 'the category authors three features, so a cap of 2 really caps')
  assert.match(two!.html, /data-items="features" data-items-limit="2"/)
  assert.doesNotMatch(one!.html, /data-items-limit/)
})

test('the ring carries a Pro design, so the strip\'s ✦ and the Try card\'s badge have something to draw', () => {
  const tiers = new Set(samples().map((e) => e.tier))
  assert.ok(tiers.has('pro') && tiers.has('free'), 'both tiers, or half the panel is untested')
})

test('no shipped design is authored here: `packages/library/designs/` is untouched (AD-35, R-158)', () => {
  for (const e of samples()) {
    assert.equal(e.category, 'controls', `${e.id} is outside the fixture category`)
    assert.equal(e.provisional, true, `${e.id} must say it is provisional, as every fixture and pilot does`)
  }
})
