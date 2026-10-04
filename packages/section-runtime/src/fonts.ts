// Story 6.2 — A PAIRING'S FACES AS `@font-face` RULES: the one emitter the canvas, the app's pack cells and Epic 7's
// theme share (PRD Appendix D §D.a rule 6, §D.b), beside the token block that names the families.
//
// Every face is the pool's own file — `packages/library/fonts/pool.json`, built once by `tools/fonts/build-pool.py` —
// one rule per file: the face's family, style and weight (a clipped variable range or a static weight), `swap`, the
// file's script `unicode-range` (so `latin-ext` is fetched only by a page that has such a letter) and its address,
// which the caller decides: the canvas route's `?font=` today, the theme's `assets/fonts/` in Epic 7. Nothing here
// fetches or names a font host (D.a rule 6). AD-1: a pure function of the pool and its arguments.

import { pairingOf, faceOf, POOL, type PoolFile } from '@inflozo/library/packs'

export type FontFaceOptions = {
  /** a family-name prefix, for a document that has faces of its own (the app's `Inter`): `Inflozo pack ` */
  prefix?: string
  /** only one role's faces — the app's pack cells draw the heading's alone */
  role?: 'heading' | 'body'
}

/** Every `@font-face` rule pairing `pairingId` needs, each file's address from `url` — handed the pool's record of the
 *  file (its name, bytes and sha256), so an address can carry the file's own hash. */
export function fontFaceCss(pairingId: string, url: (file: PoolFile) => string, options: FontFaceOptions = {}): string {
  const pairing = pairingOf(pairingId)
  const roles = options.role === undefined ? [pairing.heading, pairing.body] : [pairing[options.role]]
  return faceRulesCss([...new Set(roles.flatMap((r) => r.faces))], url, options.prefix)
}

/** THE RULE WRITER: one `@font-face` rule per file of each pool face named — the face's family (after `prefix`), style and
 *  weight, `swap`, its subset's `unicode-range` and its address. `fontFaceCss` asks it for a pairing's faces; Story 6.4's
 *  pairing menu (`apps/web/lib/style-pack.ts`'s `pairingGlyphFacesCss`) for the roman faces of every pool family. */
export function faceRulesCss(ids: readonly string[], url: (file: PoolFile) => string, prefix = ''): string {
  return ids
    .map(faceOf)
    .flatMap((face) =>
      face.files.map((f) => {
        const range = POOL.subsets[f.subset]
        if (range === undefined) throw new Error(`${f.file}: the pool names no subset "${f.subset}"`)
        return [
          '@font-face {',
          `  font-family: '${prefix}${face.family}';`,
          `  font-style: ${face.style};`,
          `  font-weight: ${face.weight};`,
          '  font-display: swap;',
          `  src: url(${url(f)}) format('woff2');`,
          `  unicode-range: ${range};`,
          '}',
        ].join('\n')
      }),
    )
    .join('\n')
}
