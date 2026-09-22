import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { MODULES, moduleFunctionName } from '@inflozo/library'
import { CANVAS_MODULES, movesByItself, startBehaviours } from './lib/behaviours.ts'

/* STORY 5.15 — the canvas's road to `core` (DW-136), asserted where `node --test` reaches it. `core` itself is
   `packages/library/modules/core.test.mjs`'s, on the same code path; the wiring on the real editor is the keyboard
   journey's (`pnpm keyboard`) and the deployed walk's step 91. Nothing below is a count: every list is the
   registry's or the directory's (standing rule 4). */

test('CANVAS_MODULES holds every registry row, in registry order, as core takes it', () => {
  assert.deepEqual(CANVAS_MODULES.map(([name]) => name), MODULES.map((m) => m.name))
  for (const [name, fn, row] of CANVAS_MODULES) {
    assert.equal(typeof fn, 'function', `${name} has a function`)
    assert.equal(row, MODULES.find((m) => m.name === name), `${name} carries its own registry row`)
  }
})

test('R-175: movesByItself reads the declaration through the grammar and answers from the registry', () => {
  assert.equal(movesByItself('marquee'), true)
  assert.equal(movesByItself('header-scroll:768'), true, 'a width is part of the declaration, not of the name')
  // parts that wait for a press or a submit never carry the chip — the pilots' two, and a carousel's arrows
  for (const waits of ['nav-drawer', 'member-form', 'carousel']) assert.equal(movesByItself(waits), false, waits)
  for (const bad of ['Marquee', 'marquee:0', 'no-such-module', 'core', '']) assert.equal(movesByItself(bad), false, bad)
})

/* THE DAY A MODULE FILE LANDS, THIS IS RED UNTIL THE CANVAS RUNS IT. The list is the directory — every `.js` file
   `bundle()` can carry, which is every one but `core.js` (tools/stress/build.js reads the same) — and a row whose
   function is not the file's own is the no-op stand-in `lib/behaviours.ts` carries for FR-G7(2). */
test('every module file in packages/library/modules/ is imported into the canvas, never left to the stand-in', () => {
  const files = readdirSync('../../packages/library/modules').filter((f) => /^[a-z][a-z0-9-]*\.js$/.test(f) && f !== 'core.js')
  for (const file of files) {
    const name = file.slice(0, -'.js'.length)
    const fn = CANVAS_MODULES.find(([n]) => n === name)?.[1]
    assert.equal(fn?.name, moduleFunctionName(name), `${file} exists and the canvas does not run it — import it into lib/behaviours.ts's FILES`)
  }
})

/* The one call of `core`, against a window that is only what `core` reaches for (`core.js:3-4`): R-174's rule that
   every mount the table marks "no" holds still at rest, and Preview's that everything runs. */
function page(declared: readonly string[]) {
  const els = declared.map((d) => {
    const classes = new Set<string>()
    return { id: d, classes, getAttribute: () => d, classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) } }
  })
  const win = {
    AbortController,
    setTimeout,
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    document: { querySelectorAll: () => els },
  } as unknown as Window
  return { win, els }
}

test('while designing the pilots\' parts are held still at rest and handed back; in Preview every one runs', () => {
  const told: unknown[] = []
  const designing = page(['nav-drawer', 'member-form', 'marquee'])
  const held = startBehaviours(designing.win, true, (e) => told.push(e))
  assert.deepEqual(held.paused, designing.els, 'every mount that is not edit-safe, in document order')
  assert.ok(designing.els.every((el) => !el.classes.has('js-enabled')), 'at rest is the no-JavaScript branch')
  assert.equal(told.length, 0, 'every name the pilots declare is a row the canvas carries')
  held.stop()

  const previewing = page(['nav-drawer', 'member-form', 'Bad!'])
  const live = startBehaviours(previewing.win, false, (e) => told.push(e))
  assert.deepEqual(live.paused, [])
  assert.ok(previewing.els.slice(0, 2).every((el) => el.classes.has('js-enabled')), 'Preview draws the JavaScript branch')
  assert.equal(told.length, 1, 'a malformed declaration is reported to the editor, never thrown from a timer')
  live.stop()
  assert.ok(previewing.els.every((el) => !el.classes.has('js-enabled')), 'stop() puts every mount back at rest')
})

/* The matrix's "A module throws" row, through the same call: `core` hands on whatever a module threw, so the editor's
   `report` is given it NAMED — logged, never said — and the mount stays at rest. No module file exists yet, so the
   throwing module is the probe's own, handed in the way `bundle`'s probe rows are. */
test('a module that throws as it mounts reaches report named, its own error as the cause, and its mount stays at rest', () => {
  const told: unknown[] = []
  const thrown = new Error('the probe threw')
  const { win, els } = page(['probe', 'runs'])
  const probe = (name: string, fn: () => void) => [name, fn, { name, editSafe: true, animates: false, movesByItself: false }] as const
  const live = startBehaviours(win, false, (e) => told.push(e), [probe('probe', () => { throw thrown }), probe('runs', () => {})])
  assert.equal(told.length, 1, 'reported at once, never thrown from a timer')
  assert.ok(told[0] instanceof Error && /the probe behaviour threw as it mounted/.test(told[0].message), 'the module is named')
  assert.equal((told[0] as Error).cause, thrown, 'and its own error rides along untouched')
  assert.ok(!els[0]?.classes.has('js-enabled'), 'the mount that threw stays at rest')
  assert.ok(els[1]?.classes.has('js-enabled'), 'and the next one still mounts')
  live.stop()
})
