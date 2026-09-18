import { test } from 'node:test'
import assert from 'node:assert/strict'
import { place } from './lib/canvas-layer.ts'

// `place(…, 'above')` is Story 5.3's pill placement: centred 8px above its words, below them when their top is within
// 48px of the canvas viewport's top, and kept 8px inside the canvas. The harness measures the far-from-the-edge case
// on production; the flip and the clamps are arithmetic, so they are held here with plain objects (review, 2026-09-18).

type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number }
const rect = (left: number, top: number, width: number, height: number): Rect => ({ left, top, width, height, right: left + width, bottom: top + height })

function stage(words: Rect, size: [number, number] = [60, 24], clientWidth = 1000) {
  const host = { style: { transform: '' }, getBoundingClientRect: () => rect(0, 0, 0, 0) }
  const style: Record<string, string> = { visibility: 'hidden' }
  const el = {
    getRootNode: () => ({ host }),
    offsetWidth: size[0],
    offsetHeight: size[1],
    style: { get visibility() { return style.visibility }, set visibility(v: string) { style.visibility = v }, getPropertyValue: (k: string) => style[k] ?? '', setProperty: (k: string, v: string) => { style[k] = v } },
  }
  const root = { getBoundingClientRect: () => words, ownerDocument: { documentElement: { clientWidth } } }
  place(el as unknown as HTMLElement, root as unknown as HTMLElement, 1, 'above')
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
