/* ─────────────────────────────────────────── Story 6.3 — THE PACK-SWITCHER MOMENT, AS DATA (FR-E2, FR-D9, FR-D17).
 *
 * THE CLIENT'S ONE HOME FOR THE SWITCH. Everything the browser needs to choose a pack and say so, and nothing of the
 * pool: the presets, their colours and their canvas CSS are the SERVER's (`lib/style-pack.ts`'s `packChoices`, handed
 * to the editor as data), because the library's presets carry the font pool's whole record and no client may import
 * them (DW-323, `tools/check-traces.mjs`). So this module is pure and its one import is `lib/ring.ts`, which is itself
 * importless — `node --test` reaches all of it (`pack-switch.test.ts`). Story 6.4's `PackRecord` is a TYPE import from
 * `lib/pack-edit.ts`, erased at build, so nothing more runs here.
 *
 * ONE WORD LIST (R-170). "Style Pack" is one name across the panel, the pill, the announcement, the ⋯ row and every
 * check; the sentences are `PACK_WORDS` here and Remix's in `lib/remix.ts`, and the surfaces read them, never a copy.
 */

import type { PackRecord } from './pack-edit.ts'
import { shuffleTo } from './ring.ts'

/** A blank project's pack, and the pack whose canvas address carries no `&pack=` — so every cached Paper document stays
 *  valid (`lib/canvas.ts`'s `packed`). `lib/style-pack.ts` re-exports it for the server. */
export const DEFAULT_PRESET = 'paper'

/** The family-name prefix a pool face takes in the APP's document, where `Inter` and `Bricolage Grotesque` are already
 *  the app's own faces (`app/fonts/fonts.css`) — so a pack cell's "Ag" is drawn in the pack's face without redefining
 *  ours, and the canvas chrome never copies one (`lib/canvas-layer.ts`'s `chromeFace`). Here since Story 6.3, so the
 *  chrome layer, a client module, reads it without `lib/style-pack.ts`. */
export const PACK_FAMILY_PREFIX = 'Inflozo pack '

/** How long a switch holds the old picture while the new pack's latin faces load (executed at 6.3's Create: Chromium
 *  aborts a view transition whose update runs past 4 s, so this bounds the wait well inside the browser's). Past it the
 *  crossfade goes on, and a late face swaps in on arrival (`font-display: swap`). */
export const FACES_WAIT_MS = 1000

/** S7a's cell as the New project window draws it (D4a): the glyph's face and three dots — background, accent, text. */
export type PackCellData = { id: string; name: string; glyphFamily: string; dots: readonly string[] }

/** One preset, as the editor is handed it (`packChoices`): everything a surface paints a pack with, derived once on the
 *  server by the functions `/canvas` uses — so the card, the list, the swatches and the canvas cannot disagree. */
export type PackChoice = {
  id: string
  name: string
  /** the pairing's two families, as S4a's card prints them ("Fraunces · Inter") */
  heading: string
  body: string
  /** the cell's "Ag" face — the pool's own heading face, under `PACK_FAMILY_PREFIX` */
  glyphFamily: string
  /** S7a's cell: background, accent, text, plate */
  cellDots: readonly string[]
  /** S4a's card: background, surface, accent, text, plate */
  cardDots: readonly string[]
  /** the Background role's dots per mode, as the canvas paints them (`referenceSwatches`) */
  swatches: Readonly<Record<'light' | 'dark', Readonly<Record<string, string>>>>
  /** the canvas document's `1-tokens` block (Paper's is `reference-tokens.css`) and `1b-faces` rules */
  tokens: string
  faces: string
  /** the heading's and the body's family lists, which the switch waits on (`document.fonts.load`) */
  families: readonly string[]
  /** STORY 6.4 — the authored record it was made from (`lib/pack-edit.ts`'s `choiceOf`): the library's for a preset as
   *  shipped, the project's own for an edited preset or a pack it made — what Edit pack opens on */
  record: PackRecord
}

/** THE WORDS (R-170), read by the panel, the pill, the announcement, the ⋯ row and every check. */
export const PACK_WORDS = {
  /** the one name — the panel head, the ⋯ row, Remix's choice */
  name: 'Style Pack',
  /** S7b's pill, from the press until the canvas has landed */
  trying: (name: string) => `Trying on ${name}…`,
  /** `#editor-said` once landed — after a switch, an undo or a redo (UX-DR12) */
  said: (name: string) => `Style Pack — ${name}`,
} as const

/** Site Remix's Style Pack re-roll: a DIFFERENT pack, uniformly from the others — since Story 6.4 over the whole roster,
 *  a project's own packs included — `shuffleTo`, the ring's own draw, so
 *  "different" is the arithmetic's and no retry loop can spin. Null where there is nowhere to go. AD-1: `random` is
 *  handed in. */
export function otherPreset(ids: readonly string[], current: string, random: () => number): string | null {
  const to = shuffleTo(ids.length, ids.indexOf(current), random)
  return to === null ? null : (ids[to] ?? null)
}
