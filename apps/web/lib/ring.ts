/* ─────────────────────────────────────────── Story 5.11 — THE DESIGN RING, AS DATA (FR-D19, FR-D13, B1a, S6).
 *
 * FOUR DOORS, ONE MODEL. The panel's ◀ ▶ and its thumbnail strip, the section pill's ◀ ▶, `[` / `]` and Shuffle all
 * read this module for where they are, what to say and where a step lands; `editor.tsx` turns the answer into one
 * `switchDesign` through `apply` → `commit`, so every door is one edit, one journal entry and one `⌘Z` (AD-15,
 * AD-16). WHICH designs are in the ring is not here — that is the library's `ringFor`, beside `offeredOn`, so the
 * partition rule and the placement rule cannot drift (standing rule 3).
 *
 * PURE AND IMPORTLESS, because `node --test` strips types and cannot load a `.tsx` (`lib/picker.ts` and
 * `lib/device.ts` are the standing precedent, `kit-button.test.ts:6-7` the reason). `ring.test.ts` asserts the
 * I/O matrix's rows over it.
 *
 * NO RANDOMNESS OF ITS OWN (AD-1): `shuffleTo` is handed a `random`, so the pure part is testable and the caller
 * owns the entropy — exactly as `doc-edit.ts` is handed its `instanceId`.
 *
 * COUNTS ARE DERIVED, NEVER WRITTEN DOWN (standing rule 4). Every "of {m}" below counts the ring it was handed,
 * and the strip's capacity is its own grid's shape multiplied out rather than a number in prose.
 */

/** B1a`:373` — the strip is a **4-column** grid of 44px tiles, three rows deep: "twelve of the eighteen … because a
 *  scrollbar at 44px tall is a worse target than a tile". The capacity is derived from the two, never restated. */
export const STRIP_COLUMNS = 4
export const STRIP_ROWS = 3
export const STRIP_TILES = STRIP_COLUMNS * STRIP_ROWS

/** B1a`:365`'s counter, exactly as the frame prints it: `7 of 18`. The word **Design** is the LABEL beside it and
 *  is drawn once (the owner's test of the deployed page, 2026-09-20: the block read "Design · Design 1 of 3", which
 *  is the frame's label and this counter both saying it). `at` is a zero-based index. */
export const position = (at: number, length: number): string => `${at + 1} of ${length}`

/** S6`:67`'s pill counter — the same number in the section's own quick actions, in the mono `4 / 18` the frame
 *  draws there. Two shapes, ONE arithmetic, so the panel and the pill can never disagree about where you are. */
export const pillPosition = (at: number, length: number): string => `${at + 1} / ${length}`

/** UX-DR12's polite sentence, spoken through `#editor-said` from the one place the key and every button reach:
 *  *"Design 8 of 18 — Image Backdrop"*. It KEEPS the word, because a sentence read aloud on its own has no label
 *  beside it to supply one — which is the difference between it and the counter above. */
export const announce = (at: number, length: number, name: string): string =>
  `Design ${position(at, length)} — ${name}`

/** UX-DR5 and B1's note: the ring WRAPS. A dead key at the end of a list reads as broken, and the counter is the
 *  thing that says where you are — so `]` on the last design lands on the first and says so. */
export const step = (at: number, length: number, by: number): number =>
  length < 1 ? 0 : (((at + by) % length) + length) % length

/** FR-D13's Shuffle: a DIFFERENT design of the same ring, chosen for you. Null where there is nowhere to go, which
 *  is the case the arrows and the button are both absent in (UX-DR3). Uniform over the others — the index is drawn
 *  from the ring MINUS the one you are on, so "different" is a property of the arithmetic rather than a retry loop
 *  that could spin. */
export function shuffleTo(length: number, at: number, random: () => number): number | null {
  // `at` outside the ring (a design not found in it) would skew the draw — index 0 never drawn — so it is nowhere to go
  if (length < 2 || at < 0 || at >= length) return null
  const n = Math.min(length - 2, Math.max(0, Math.floor(random() * (length - 1))))
  return n >= at ? n + 1 : n
}

/** B1a's strip, as data: the tiles to draw, the index the first of them is, and how many the `+N` tile stands for.
 *
 *  THE ACTIVE TILE IS ALWAYS IN THE STRIP. B1a draws the first twelve of eighteen with a `+6`, which is right until
 *  the customer cycles past the twelfth — so the window slides just far enough to keep the design they are looking
 *  at on screen, and the `+N` still says how many the strip is not showing. A ring that fits needs neither. */
export function strip<T>(ring: readonly T[], at: number): { tiles: readonly T[]; from: number; more: number } {
  if (ring.length <= STRIP_TILES) return { tiles: ring, from: 0, more: 0 }
  const last = ring.length - STRIP_TILES
  const from = Math.min(Math.max(0, at - STRIP_TILES + 1), last)
  return { tiles: ring.slice(from, from + STRIP_TILES), from, more: ring.length - STRIP_TILES }
}

/** R-12's shape for a control at its floor: where the ring holds one design the arrows and Shuffle are ABSENT
 *  (UX-DR3, R-118) and this one sentence says why, so a counter reading "1 of 1" is not a puzzle. */
export const ONE_DESIGN = 'This category has one design so far. More are coming.'

/* B1a`:395`'s `Cycle designs` FOOTER and S6`:140`'s `Try a design` CARD were built and then REMOVED at the owner's
 * test of the deployed page (2026-09-20, findings 3 and 4), which amends R-159: Shuffle keeps ONE seat, the section
 * pill's, and the block is the label, the counter, the strip and the design's name. The keys are still advertised —
 * in the `?` card, which is R-147's one place for them — and `[` / `]` now work on `/controls` too (finding 1).
 */

/** The accessible name and hover title of each ring control. The chip the frame draws is part of the words, so a
 *  screen reader hears the key it could have pressed instead — which since the footer went is the only place in
 *  the block that names them at all. */
export const PREVIOUS_WORDS = 'Previous design — ['
export const NEXT_WORDS = 'Next design — ]'
/** R-159: in the section's pill this control is ICON-ONLY, so its words live here as the name and the title
 *  (`DESIGN.md:534-536`'s carve-out, the one R-132's mode button and R-136's moon badge already use). */
export const SHUFFLE_WORDS = 'Shuffle — another design, the same words'

/** FR-D13's exact sentence for a list a design draws fewer of than the section holds: *"3 items · 2 shown in this
 *  design"*. The panel prints it INSTEAD of P0-3's range line, and only where the two numbers differ — a design
 *  that shows everything has nothing to explain. */
export const shownInThisDesign = (count: number, shown: number): string =>
  `${count} ${count === 1 ? 'item' : 'items'} · ${shown} shown in this design`
