// PAPER, THE REFERENCE PACK — `@inflozo/section-runtime/reference`, and never the package's index (DW-323, Story 6.3).
//
// STORY 6.2 MADE ONE PAPER: the reference pack IS the Paper preset, Appendix D §D.d's first row, read from the library
// (`@inflozo/library/packs`, where its fonts are pairing D1's — Fraunces over Inter, R-231 — with each face's cap height
// off the pool's own file). It used to be hand-copied into `tokens.ts` from the export, Georgia and all; now there is one
// Paper and the library holds it. R-110's ink on the accent, the scrims and the drawn steps are §D.d's values. The
// dependency runs runtime → library and never back.
//
// IT LIVES ON ITS OWN SUBPATH BECAUSE THE INDEX IS EVERY CANVAS CLIENT'S. Reading Paper from the library pulls the
// library's presets and with them the font pool's whole record — every file's sha256 and every family's licence — and
// while this sat in `tokens.ts` the index carried it into the client script of every page that drew a canvas or a pack
// cell (43 KB, measured at 6.3's Create). The server derives each preset's canvas CSS once (`apps/web/lib/style-pack.ts`)
// and clients paint from those strings; `tools/check-traces.mjs` refuses a client chunk that carries the record again.

import { presetOf } from '@inflozo/library/packs'
import { packTokens, packTokensCss, type Pack } from './tokens.ts'

/** Paper, as the library authors it. */
export const REFERENCE_PACK: Pack = paperPreset()

function paperPreset(): Pack {
  const paper = presetOf('paper')
  if (paper === undefined) throw new Error('the library holds no Paper preset — prd.md §D.d and packages/library/packs/ disagree')
  return paper.pack as Pack
}

/** Story 4.10's Paper, now as the engine computes it: the reference VALUES every design reads through the canvas, the
 *  matrix and the style guide until a project wears a pack. Both maps are complete, so a swatch reads either mode. */
export const REFERENCE_TOKENS: Readonly<{
  light: Readonly<Record<string, string>>
  dark: Readonly<Record<string, string>>
}> = (({ light, dark }) => ({ light, dark }))(packTokens(REFERENCE_PACK))

/** The reference stylesheet the canvas, the render matrix and the style guide read: Paper through the engine. */
export function referenceTokensCss(): string {
  return (
    '/* GENERATED from packages/section-runtime/src/tokens.ts — edit the contract, not this file.\n' +
    '   tools/stress/test-vocabulary.mjs fails if the two drift. */\n\n' +
    packTokensCss(REFERENCE_PACK)
  )
}
