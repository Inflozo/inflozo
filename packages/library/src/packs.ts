// Story 6.2 — THE TWELVE PRESETS AND THE FONT POOL, as data (the spine's home: "FR-E style packs | E6 |
// `packages/library/packs`", and the pool beside it in `packages/library/fonts`).
//
// AD-2: the library is data. Nothing here computes a token — `packTokens` in `@inflozo/section-runtime` is the one door
// every preset goes through, and the runtime imports this module, never the reverse (the library depends on nothing).
// What this module does is ASSEMBLE: a preset's authored values (`../packs/packs.json`, held equal to Appendix D §D.d by
// `tools/stress/test-vocabulary.mjs`) with its pairing's faces from `../fonts/pool.json` (built by
// `tools/fonts/build-pool.py` from §D.c — family, CSS fallback, cap height and `tnum` per face), so a preset's fonts
// are never typed twice.

import data from '../packs/packs.json' with { type: 'json' }
import poolJson from '../fonts/pool.json' with { type: 'json' }

/** One mode's authored colours and the scrim's strength — the runtime's `PackMode`, by shape. */
export type PresetMode = {
  background: string
  surface: string
  text: string
  muted: string
  border: string
  accent: string
  onAccent: string
  scrim: number
}
/** A preset's authored inputs — the runtime's `Pack`, by shape (its `check` refuses a step it does not know). */
export type PresetPack = {
  light: PresetMode
  dark: PresetMode
  pillRadius: string
  fonts: { heading: { family: string; capHeight: number }; body: { family: string; capHeight: number; tabular: boolean } }
  radius: string
  density: string
  width: string
  gutters: string
  buttons: string
  shadow: string
  links: string
}
export type Preset = { id: string; name: string; pairing: string; pack: PresetPack }

export type PoolFile = { subset: string; file: string; bytes: number; sha256: string }
export type PoolFace = {
  family: string
  style: 'normal' | 'italic'
  type: 'V' | 'S'
  /** the CSS `font-weight` descriptor: `500 800` for a clipped variable face, `700` for a static one */
  weight: string
  pinned?: Record<string, number>
  capHeight: number
  tnum: boolean
  files: PoolFile[]
}
export type PoolRole = { family: string; type: 'V' | 'S'; range?: number[]; italic?: number[]; weights?: string[]; faces: string[] }
export type Pairing = { id: string; name: string; heading: PoolRole; body: PoolRole }
export type Pool = {
  source: { repository: string; commit: string }
  subsets: Record<string, string>
  families: Record<string, { slug: string; fallback: string; licence: string; licenceFile: string; upstream: string }>
  faces: Record<string, PoolFace>
  pairings: Pairing[]
}

/** The pool as built — every file with its bytes and sha256, every face, every pairing (§D.c's order). */
export const POOL = poolJson as unknown as Pool

/** A pairing by id (`D1` … ), or a thrown error naming it — a preset or a specimen naming no pairing is a broken build. */
export function pairingOf(id: string): Pairing {
  const p = POOL.pairings.find((x) => x.id === id)
  if (p === undefined) throw new Error(`"${id}" is not a pairing of the pool (prd.md §D.c)`)
  return p
}

/** A pool face by id, or a thrown error naming it. */
export function faceOf(id: string): PoolFace {
  const f = Object.hasOwn(POOL.faces, id) ? POOL.faces[id] : undefined
  if (f === undefined) throw new Error(`"${id}" is not a face of the pool`)
  return f
}

/** Every face a pairing draws with, each once — the heading's and the body's (one family in both roles shares them). */
export const pairingFaces = (id: string): PoolFace[] => {
  const p = pairingOf(id)
  return [...new Set([...p.heading.faces, ...p.body.faces])].map(faceOf)
}

/** `'Fraunces', serif` — the family as a CSS list, its own name first and the generic §D.c's family falls back to. */
export const familyList = (family: string, prefix = ''): string => {
  const f = POOL.families[family]
  if (f === undefined) throw new Error(`"${family}" is not a family of the pool`)
  return `'${prefix}${family}', ${f.fallback}`
}

/** A pairing as a pack's `fonts`: each role's family list, its roman face's cap height, and whether the body's roman
 *  carries tabular figures (`tnum`). */
export function pairingFonts(id: string): PresetPack['fonts'] {
  const p = pairingOf(id)
  const roman = (role: PoolRole) => {
    const face = role.faces.map(faceOf).find((f) => f.style === 'normal')
    if (face === undefined) throw new Error(`${id}: the ${role.family} role has no roman face`)
    return face
  }
  const heading = roman(p.heading)
  const body = roman(p.body)
  return {
    heading: { family: familyList(p.heading.family), capHeight: heading.capHeight },
    body: { family: familyList(p.body.family), capHeight: body.capHeight, tabular: body.tnum },
  }
}

/** THE TWELVE, in §D.d's order — Paper first. */
export const PRESETS: readonly Preset[] = data.presets.map(({ id, name, pairing, ...authored }) => ({
  id,
  name,
  pairing,
  pack: { ...authored, fonts: pairingFonts(pairing) } as PresetPack,
}))

/** A preset by id, or undefined — a search, never an index, since an id may come from a user-writable column. */
export const presetOf = (id: string): Preset | undefined => PRESETS.find((p) => p.id === id)

/** R-234 (owner, 2026-10-03): the render matrix's pack axis — Paper, Mono and Neon. */
export const REFERENCE_PACKS: readonly string[] = data.reference
