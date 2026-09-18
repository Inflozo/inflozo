// THE ONE DRAG, IN ONE PLACE (Story 5.4). The owner's finding 9 of 2026-09-13 governs every editable list in the
// app — "nothing reorders until the drop", a dashed landing slot the dragged row's height, and the rows between
// sliding aside — and `item-list.tsx` already held the geometry that does it. Layers needs the same gesture over
// different data, and a second copy of this arithmetic is how two lists drift apart (standing rule 3), so it moved
// here unchanged and both lists call it. Each list keeps its OWN pointer handlers, because what they commit differs:
// P0-3's list commits a `ControlState`, Layers commits a `ProjectDoc`.
//
// Pure, so `node --test` reaches it (`reorder.test.ts`): the caller reads the DOM and hands over numbers.
//
// NOTHING HERE IS MEASURED AGAINST A ROW THAT IS ALREADY SLIDING. `captureLayout` is called once, at `pointerdown`,
// and every answer below is read against those numbers — a slot computed from live rects would chase itself.

/** Every row's top and height as the drag began, relative to the list, and the gap between two rows. */
export type Layout = { tops: number[]; heights: number[]; gap: number }

/** The drag in flight: where it started, where it would land, and how far the pointer has moved. */
export type Drag = { from: number; to: number; dy: number }

/** The rows as they stood when the press landed. Takes anything with the two offsets — an `HTMLElement`, or a plain
 *  object in a test. The gap is read from the first two rows, which is exact for a list of one gap size. */
export function captureLayout(rows: readonly { offsetTop: number; offsetHeight: number }[]): Layout {
  const tops = rows.map((el) => el.offsetTop)
  const heights = rows.map((el) => el.offsetHeight)
  return { tops, heights, gap: tops.length > 1 ? tops[1]! - tops[0]! - heights[0]! : 0 }
}

/** How far row `i` slides to make room: one dragged-row height plus the gap, towards the space the row left. */
export function shift(drag: Drag | null, i: number, layout: Layout): number {
  if (drag === null || i === drag.from) return 0
  const by = (layout.heights[drag.from] ?? 0) + layout.gap
  if (drag.from < drag.to && i > drag.from && i <= drag.to) return -by
  if (drag.to < drag.from && i >= drag.to && i < drag.from) return by
  return 0
}

/** Where the dashed slot is drawn — the landing position's own top, corrected when the row is travelling DOWN,
 *  because the rows above it have each slid up by its height. */
export function slotTop(drag: Drag | null, layout: Layout): number {
  if (drag === null) return 0
  const { tops, heights } = layout
  return drag.to > drag.from
    ? (tops[drag.to] ?? 0) + (heights[drag.to] ?? 0) - (heights[drag.from] ?? 0)
    : (tops[drag.to] ?? 0)
}

/** The landing position: how many OTHER rows the dragged row's middle has passed the middle of, as they stood when
 *  the drag began. `pointerY` and `startY` are in whatever one space the caller reads both in — the window for a
 *  sidebar list, the screen for a section dragged by the canvas pill. */
export function landingAt(layout: Layout, from: number, pointerY: number, startY: number): number {
  const { tops, heights } = layout
  const middle = (tops[from] ?? 0) + (heights[from] ?? 0) / 2 + (pointerY - startY)
  return tops.filter((top, j) => j !== from && top + (heights[j] ?? 0) / 2 < middle).length
}
