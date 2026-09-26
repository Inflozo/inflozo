import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pinned, place } from './lib/canvas-layer.ts'

// `place(…, 'above')` is Story 5.3's pill placement: centred 8px above its words, below them when their top is within
// 48px of the canvas viewport's top, and kept 8px inside the canvas. The harness measures the far-from-the-edge case
// on production; the flip and the clamps are arithmetic, so they are held here with plain objects (review, 2026-09-18).

type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number }
const rect = (left: number, top: number, width: number, height: number): Rect => ({ left, top, width, height, right: left + width, bottom: top + height })

function stage(words: Rect, size: [number, number] = [60, 24], clientWidth = 1000, how: Parameters<typeof place>[3] = 'above', fit = 1) {
  const host = { style: { transform: '' }, getBoundingClientRect: () => rect(0, 0, 0, 0) }
  const style: Record<string, string> = { visibility: 'hidden' }
  const el = {
    getRootNode: () => ({ host }),
    offsetWidth: size[0],
    offsetHeight: size[1],
    style: { get visibility() { return style.visibility }, set visibility(v: string) { style.visibility = v }, getPropertyValue: (k: string) => style[k] ?? '', setProperty: (k: string, v: string) => { style[k] = v } },
  }
  const root = { getBoundingClientRect: () => words, ownerDocument: { documentElement: { clientWidth } } }
  place(el as unknown as HTMLElement, root as unknown as HTMLElement, fit, how)
  return { left: Number.parseFloat(style.left ?? ''), top: Number.parseFloat(style.top ?? ''), visibility: style.visibility }
}

test('place above: centred on the words, its bottom 8px above them, and shown', () => {
  const at = stage(rect(300, 300, 100, 20))
  assert.deepEqual(at, { left: 300 + 50 - 30, top: 300 - 8 - 24, visibility: 'visible' })
})

test('place above: words within 48px of the canvas top put it 8px BELOW them instead', () => {
  assert.equal(stage(rect(300, 20, 100, 20)).top, 40 + 8)
  assert.equal(stage(rect(300, 47, 100, 20)).top, 67 + 8, 'the edge is inclusive of 47')
  assert.equal(stage(rect(300, 48, 100, 20)).top, 48 - 8 - 24, 'and exclusive of 48')
})

test('place above: kept 8px inside the canvas at either edge', () => {
  assert.equal(stage(rect(0, 300, 10, 20)).left, 8, 'words at the left edge')
  assert.equal(stage(rect(980, 300, 20, 20)).left, 1000 - 60 - 8, 'words at the right edge')
})

// Story 5.15 — B3a's PAUSED chip: 8px inside its mount's bottom-left corner, in the host's units (one unit is one
// screen pixel, so the fit multiplies the mount's canvas pixels and never the 8), and hidden on a mount with no box.
test('place bottom-left: 8px inside the anchor\'s bottom-left corner, on screen at any fit', () => {
  assert.deepEqual(stage(rect(300, 300, 100, 40), [60, 18], 1000, 'bottom-left'), { left: 300 + 8, top: 340 - 8 - 18, visibility: 'visible' })
  assert.deepEqual(stage(rect(300, 300, 100, 40), [60, 18], 1000, 'bottom-left', 0.6), { left: 300 * 0.6 + 8, top: 340 * 0.6 - 8 - 18, visibility: 'visible' })
})

test('place bottom-left: an anchor with no box keeps its element hidden', () => {
  assert.equal(stage(rect(300, 300, 0, 0), [60, 18], 1000, 'bottom-left').visibility, 'hidden')
  assert.equal(stage(rect(300, 300, 100, 0), [60, 18], 1000, 'bottom-left').visibility, 'hidden', 'collapsed in one axis is no box either')
})

// Story 5.21 — `pinned`: a fixed root always, a sticky root ONLY WHILE STUCK (its top at or above its computed `top`), and
// anything else never. With Ghost's strip above a sticky header, the header scrolls with the page for the strip's height
// before it sticks — which is when its chrome may move to the viewport's layer, and not before.
test('pinned: a fixed root always; a sticky root only while stuck; a static root never', () => {
  const root = (position: string, top: string, boxTop: number) =>
    ({
      ownerDocument: { defaultView: { getComputedStyle: () => ({ position, top }) } },
      getBoundingClientRect: () => rect(0, boxTop, 100, 60),
    }) as unknown as HTMLElement
  assert.equal(pinned(root('fixed', '0px', 300)), true, 'fixed is pinned wherever it is')
  // a sticky header at `top: 0` below a 48px strip: not stuck yet, then stuck once the strip has scrolled away
  assert.equal(pinned(root('sticky', '0px', 48)), false, 'below the strip, it scrolls with the page')
  assert.equal(pinned(root('sticky', '0px', 12)), false, 'still 12px from sticking')
  assert.equal(pinned(root('sticky', '0px', 0)), true, 'stuck at its top')
  assert.equal(pinned(root('sticky', '0px', 0.4)), true, 'a subpixel off its top is stuck')
  assert.equal(pinned(root('sticky', '20px', 20)), true, 'stuck at a top of its own')
  assert.equal(pinned(root('sticky', '20px', 21)), false)
  assert.equal(pinned(root('sticky', 'auto', 0)), false, 'a sticky root with no top never sticks at the top')
  for (const position of ['static', 'relative', 'absolute']) assert.equal(pinned(root(position, '0px', 0)), false, position)
})
