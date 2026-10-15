// Story 6.2 — A PAIRING'S FACES AS `@font-face` RULES: the one emitter the canvas, the app's pack cells and Epic 7's
// theme share (PRD Appendix D §D.a rule 6, §D.b), beside the token block that names the families.
//
// Every face is the pool's own file — `packages/library/fonts/pool.json`, built once by `tools/fonts/build-pool.py` —
// one rule per file: the face's family, style and weight (a clipped variable range or a static weight), `swap`, the
// file's script `unicode-range` (so `latin-ext` is fetched only by a page that has such a letter) and its address,
// which the caller decides: the canvas route's `?font=` today, the theme's `assets/fonts/` in Epic 7. Nothing here
// fetches or names a font host (D.a rule 6). AD-1: a pure function of the pool and its arguments.
//
// Story 7.12 (§D.b's whole faces) — ONE rule for canvas and theme: under a language's script (`scriptOf`) other than
// `latin`, a family whose google/fonts `subsets` lists that script (`coversScript` — its own declaration, never assumed)
// ships each face as ONE whole-face file with no `unicode-range`, in place of its latin pair; a family that does not
// cover it keeps its latin pair and the script falls to the reader's system font. `coverageOf` says which, with bytes.

import { pairingOf, pairingFaces, faceOf, POOL, type PoolFace, type PoolFile } from '@inflozo/library/packs'
import type { Script } from '@inflozo/library/languages'

export type FontFaceOptions = {
  /** a family-name prefix, for a document that has faces of its own (the app's `Inter`): `Inflozo pack ` */
  prefix?: string
  /** only one role's faces — the app's pack cells draw the heading's alone */
  role?: 'heading' | 'body'
  /** the project's script (`scriptOf(language)`); omitted or `latin`, the rules are today's, byte for byte */
  script?: Script
}

/** The `subset` a whole-face file is handed to `url` under — `{ subset: 'full', file, bytes, sha256 }`. */
const FULL = 'full'

/** Does `family` cover `script`? Its pool record's `subsets` — google/fonts' `METADATA.pb` — names it; `latin` always. */
export const coversScript = (family: string, script: Script): boolean => {
  if (script === 'latin') return true
  const f = Object.hasOwn(POOL.families, family) ? POOL.families[family] : undefined
  if (f === undefined) throw new Error(`"${family}" is not a family of the pool`)
  return f.subsets.includes(script)
}

/** The files one face ships under `script`: its whole face where its family covers a script beyond latin, else its
 *  latin pair (`latin` + `latin-ext`, the pool's order). */
function shipped(face: PoolFace, script: Script): PoolFile[] {
  if (script === 'latin' || !coversScript(face.family, script)) return face.files
  if (face.full === undefined) throw new Error(`${face.family} covers ${script} and the pool records no whole face of it — re-run tools/fonts/build-pool.py`)
  return [{ subset: FULL, ...face.full }]
}

/** Every `@font-face` rule pairing `pairingId` needs, each file's address from `url` — handed the pool's record of the
 *  file (its name, bytes and sha256), so an address can carry the file's own hash. */
export function fontFaceCss(pairingId: string, url: (file: PoolFile) => string, options: FontFaceOptions = {}): string {
  const pairing = pairingOf(pairingId)
  const roles = options.role === undefined ? [pairing.heading, pairing.body] : [pairing[options.role]]
  return faceRulesCss([...new Set(roles.flatMap((r) => r.faces))], url, options.prefix, options.script)
}

/** THE RULE WRITER: one `@font-face` rule per file of each pool face named — the face's family (after `prefix`), style and
 *  weight, `swap`, its subset's `unicode-range` (none for a whole face) and its address. `fontFaceCss` asks it for a
 *  pairing's faces; Story 6.4's pairing menu (`apps/web/lib/style-pack.ts`'s `pairingGlyphFacesCss`) for the roman faces
 *  of every pool family. */
export function faceRulesCss(ids: readonly string[], url: (file: PoolFile) => string, prefix = '', script: Script = 'latin'): string {
  return ids
    .map(faceOf)
    .flatMap((face) =>
      shipped(face, script).map((f) => {
        const range = f.subset === FULL ? null : POOL.subsets[f.subset]
        if (range === undefined) throw new Error(`${f.file}: the pool names no subset "${f.subset}"`)
        return [
          '@font-face {',
          `  font-family: '${prefix}${face.family}';`,
          `  font-style: ${face.style};`,
          `  font-weight: ${face.weight};`,
          '  font-display: swap;',
          `  src: url(${url(f)}) format('woff2');`,
          ...(range === null ? [] : [`  unicode-range: ${range};`]),
          '}',
        ].join('\n')
      }),
    )
    .join('\n')
}

/** One family of a pairing under a script: the roles it draws, the bytes it ships under that script (its whole faces
 *  when it covers it, else its latin pair) and the bytes it ships today (its latin pair). */
export type FamilyCoverage = { family: string; roles: ('heading' | 'body')[]; bytes: number; latinBytes: number }

/** The selector's caption, from `pool.json`'s bytes: the pairing's families (heading's first, each once) split into those
 *  that cover `script` and those whose letters in it fall to the system font. Under `latin` every family is covered. */
export function coverageOf(pairingId: string, script: Script): { covered: FamilyCoverage[]; uncovered: FamilyCoverage[] } {
  const pairing = pairingOf(pairingId)
  const families = new Map<string, { roles: ('heading' | 'body')[]; faces: Set<string> }>()
  for (const role of ['heading', 'body'] as const) {
    const r = pairing[role]
    const entry = families.get(r.family) ?? { roles: [], faces: new Set<string>() }
    entry.roles.push(role)
    for (const id of r.faces) entry.faces.add(id)
    families.set(r.family, entry)
  }
  const sum = (files: PoolFile[]) => files.reduce((t, f) => t + f.bytes, 0)
  const out = { covered: [] as FamilyCoverage[], uncovered: [] as FamilyCoverage[] }
  for (const [family, { roles, faces }] of families) {
    const list = [...faces].map(faceOf)
    out[coversScript(family, script) ? 'covered' : 'uncovered'].push({
      family,
      roles,
      bytes: sum(list.flatMap((f) => shipped(f, script))),
      latinBytes: sum(list.flatMap((f) => f.files)),
    })
  }
  return out
}

/** Every file the theme ships for `pairingId` under `script`, in `pairingFaces`' order (heading's faces, then body's, each
 *  once): a covering family's whole faces (`subset: 'full'`), every other family's latin pair. */
export const pairingFiles = (pairingId: string, script: Script = 'latin'): PoolFile[] =>
  pairingFaces(pairingId).flatMap((face) => shipped(face, script))

/** The files to preload: each role's first roman face — its whole face where its family covers `script`, else its `latin`
 *  file — distinct, the heading's first (§D.a rule 6: italics and `latin-ext` are fetched only by a page that needs them). */
export function preloadFiles(pairingId: string, script: Script = 'latin'): string[] {
  const pairing = pairingOf(pairingId)
  return [...new Set([pairing.heading, pairing.body].map((role) => {
    const roman = role.faces.map(faceOf).find((face) => face.style === 'normal')
    const file = roman && shipped(roman, script).find((f) => f.subset === FULL || f.subset === 'latin')
    if (file === undefined) throw new Error(`${pairingId}'s ${role.family} has no roman file to preload.`)
    return file.file
  }))]
}
