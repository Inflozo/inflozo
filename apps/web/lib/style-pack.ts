import { familyList, pairingFonts, pairingOf, POOL, presetOf, PRESETS as LIBRARY_PRESETS, type PoolFile, type Preset as LibraryPreset } from '@inflozo/library/packs'
import { faceRulesCss, fontFaceCss } from '@inflozo/section-runtime/fonts'
import { REFERENCE_TOKENS, referenceTokensCss } from '@inflozo/section-runtime/reference'
import { packTokens, type Pack } from '@inflozo/section-runtime/tokens'
import { brandSeed, choiceOf, hexOf, isCustom, ownPacksIn, ROLE_TOKENS, samePack, withoutDefaults, type PackFonts, type PackRecord, type PairingChoice } from './pack-edit.ts'
import { DEFAULT_PRESET, PACK_FAMILY_PREFIX, type PackCellData, type PackChoice } from './pack-switch.ts'
import { z } from './zod.ts'
import { isAccent } from './probe-rule.ts'

export { DEFAULT_PRESET, PACK_FAMILY_PREFIX, ROLE_TOKENS }

/**
 * `projects.style_pack`, and the one schema for it (the spine's rule (a): one zod schema per
 * boundary). E6 OWNS THIS COLUMN — Story 6.1 built the token engine every pack goes through
 * (`packTokens` in `@inflozo/section-runtime`); Appendix D's twelve packs are Story 6.2's, the Style
 * Pack editor and the per-mode token overrides Story 6.4's, the brand seed Story 6.6's — and Story
 * 1.5 reads it three epics early, through this same schema, because the dashboard card's
 * placeholder is drawn from the pack (FR-B1).
 *
 * THE COLOURS IT HANDS ON ARE NOT APP TOKENS AND MUST NEVER BECOME ONE. A Style Pack belongs to the
 * USER'S SITE, not to Inflozo's chrome (`components/kit/pack-cell.tsx`), which is why they are
 * hex strings applied as inline `style` rather than Tailwind classes — Tailwind's palette is
 * cleared on purpose and the token layer is the app's vocabulary alone. `tokens.test.ts` names
 * this file as the one place a colour literal may live, and checks that it stays the one place.
 *
 * SINCE STORY 6.2 THE PRESETS ARE THE LIBRARY'S (DW-15, DW-11): `PRESETS` below is derived from
 * `@inflozo/library/packs` — Appendix D §D.d's twelve, in its order — so the dashboard card and
 * D4a's cell paint from the very values the canvas's token block is computed from, and this file
 * holds no colour of its own any more. A pack's glyph is drawn in its own heading face, the pool's
 * own file, declared under a family name of its own (`PACK_FAMILY_PREFIX`) so the app's Inter and
 * Bricolage Grotesque are never redefined; `packFacesCss` is that declaration, linked once in the
 * signed-in layout.
 *
 * SINCE STORY 6.3 CHOOSING IS BUILT, AND THIS IS THE SERVER'S ONE HOME OF THE PRESETS — IMPORTED BY NO
 * CLIENT MODULE (DW-323). The library's presets carry the font pool's whole record, so a client that
 * imported this file carried it too (43 KB in every page that drew a pack cell, measured at 6.3's
 * Create). Clients are handed what they paint as data instead: `packChoices` — every preset's names,
 * dots, swatches and canvas CSS, derived here once by the functions `/canvas` uses, so the editor's
 * card, list, swatches and canvas paint a pack as the canvas does — and `packCells`, D4a's twelve for
 * the New project window. The client's own vocabulary (`DEFAULT_PRESET`, `PACK_FAMILY_PREFIX`, the
 * words, the types) is `lib/pack-switch.ts`'s, re-exported here for the server. The editor's choice is
 * written by the save (`sync_project_doc`'s `p_preset`) and a new project's by `createProject`.
 *
 * SINCE STORY 6.4 A PROJECT HAS PACKS OF ITS OWN (FR-E3): `style_pack.packs[id]`, each a FULL authored record — a preset
 * as edited in this project, or a `custom-<n>` it made — written by the save (`sync_project_doc`'s `p_packs`) and READ
 * HERE THROUGH ONE RULE (`ownPacksOf`, AD-36): a record that fails `lib/pack-edit.ts`'s schema, names a pairing the pool
 * does not hold, or is refused by the engine's `check` is dropped. `packIdOf` is the pack in force — a preset, or a
 * custom id `ownPacksOf` holds, else Paper — and the card (`placeholderFor`), the editor's roster and its canvas all
 * wear an own pack. The browser computes an own pack's CSS itself, from `pairingChoices`' per-pairing data.
 *
 * STORY 6.6 SETTLED THE `brand` KEY STORY 3.4 PUT IN THIS COLUMN (DW-66, DW-327): IT IS NO LONGER
 * WRITTEN, AND NOTHING READS IT. "Use your brand" puts the site's accent INTO THE PACK IN FORCE
 * (`brandPacks` below, through `lib/pack-edit.ts`'s `brandSeed` — the one rule the Style Pack list's
 * "From your site" row runs too), written through `sync_project_doc`'s compare-and-set, so the card,
 * the editor, its canvas and its previews wear one colour and an edit in the editor reaches the
 * card. The logo stays Ghost's (R-240): the canvas and the live theme read `@site.logo`, and nothing
 * about it is copied. The menu waits for the header epic (DW-66). Off the site's own record, S2c
 * draws all three, the canvas's surfaces read the accent (`storedSurfaces`) and the editor offers it
 * as "From your site" (`siteAccentOf`). A row branded before 6.6 still holds a `brand` (and one
 * seeded before Story 5.24b its icon, cover, title and description): `stylePackSchema` still parses
 * it, and nothing reads it.
 */

/**
 * Today's shape. E6 widens it; `placeholderFor` is written so widening cannot break a card.
 *
 * `brand` is TYPED `unknown` ON PURPOSE: a stricter shape here would make a `brand` of the wrong
 * type fail the WHOLE parse, and a pack that failed to parse loses its preset — so a junk brand
 * would repaint the card in Paper rather than merely be ignored. Since Story 6.6 nothing reads it
 * (the header above); rows written before then still hold one. `style_pack` is a column the user's
 * own session may write (the `grant` on `projects`).
 */
export const stylePackSchema = z.object({ preset: z.string(), brand: z.unknown().optional(), packs: z.unknown().optional() }).loose()

export type StylePack = z.infer<typeof stylePackSchema>

export type Preset = {
  /** The preset's id, as `projects.style_pack.preset` stores it. */
  id: string
  /** The pack's own name, as the pack cell prints it. */
  name: string
  /** The pack's heading face — the cell renders "Ag" in it, so it is the site's font, not ours: the pool's own face,
   *  under `PACK_FAMILY_PREFIX` (`packFacesCss`). */
  glyphFamily: string
  /** The pairing's two families, as S4a's card prints them ("Fraunces · Inter"). */
  heading: string
  body: string
  /** FR-B1's placeholder surface: the pack's light BACKGROUND. */
  surface: string
  accent: string
  text: string
}

/** THE PRESETS, derived — §D.d's order, Paper first. ponytail: a `Record` keyed by id, so `PRESETS.paper` reads as it
 *  always has; its insertion order is the library's. */
export const PRESETS: Record<string, Preset> = Object.fromEntries(
  LIBRARY_PRESETS.map((p) => {
    const pairing = pairingOf(p.pairing)
    return [p.id, {
      id: p.id,
      name: p.name,
      glyphFamily: familyList(pairing.heading.family, PACK_FAMILY_PREFIX),
      heading: pairing.heading.family,
      body: pairing.body.family,
      surface: p.pack.light.background,
      accent: p.pack.light.accent,
      text: p.pack.light.text,
    }]
  }),
)

/** A pool file's address beside a document served at `base` — `canvas` from the canvas document, `../canvas` from a
 *  frame one level down, `/canvas` (or `/app/canvas`) from an app page — carrying the start of its own sha256, so a
 *  rebuilt file is a new address and the route may keep it `immutable` (`lib/canvas.ts`'s `canvasCaching`). */
export const fontHash = (sha256: string) => sha256.slice(0, 12)
export const fontHref = (base: string) => (f: PoolFile) => `${base}?font=${f.file}&h=${fontHash(f.sha256)}`

/** A blank project's `style_pack`: Paper, the default. `createProject` writes the one the New project window chose. */
export const defaultStylePack = (): StylePack => ({ preset: DEFAULT_PRESET })

/** The preset id a stored `style_pack` names — `placeholderFor`'s rule: anything this build does not know is Paper. A
 *  library preset only: the New project window's choice (`createProject`), where no own pack can exist yet. */
export function presetIdOf(stylePack: unknown): string {
  const parsed = stylePackSchema.safeParse(stylePack)
  const preset = parsed.success ? parsed.data.preset : DEFAULT_PRESET
  return Object.hasOwn(PRESETS, preset) ? preset : DEFAULT_PRESET
}

/** A pool pairing's fonts as the engine reads them, or undefined for an id the pool does not hold (a stored record's). */
const poolFontsOf = (pairing: string): PackFonts | undefined =>
  POOL.pairings.some((p) => p.id === pairing) ? (pairingFonts(pairing) as PackFonts) : undefined

/** STORY 6.4 — A PROJECT'S OWN PACKS, as stored, through the one reading rule (AD-36, `ownPacksIn`): the valid records
 *  under valid ids, junk dropped. Never throws — a column the user's own session may write must not black out an editor
 *  or a dashboard. */
export const ownPacksOf = (stylePack: unknown): Record<string, PackRecord> =>
  ownPacksIn((stylePack as { packs?: unknown } | null | undefined)?.packs, { isPreset: (id) => presetOf(id) !== undefined, fontsOf: poolFontsOf })

/** STORY 6.4 — THE PACK IN FORCE: the stored `preset` where it names a library preset, or a `custom-<n>` that `ownPacksOf`
 *  holds; anything else is Paper (`presetIdOf`'s rule, widened to the packs a project made). */
export function packIdOf(stylePack: unknown): string {
  const preset = (stylePack as { preset?: unknown } | null | undefined)?.preset
  if (typeof preset !== 'string') return DEFAULT_PRESET
  if (presetOf(preset) !== undefined) return preset
  return isCustom(preset) && Object.hasOwn(ownPacksOf(stylePack), preset) ? preset : DEFAULT_PRESET
}

/** A library preset as an authored record — `packs.json`'s shape without its id: what an own record is compared with
 *  (`withoutDefaults`) and what Reset to defaults puts back. */
export const presetRecord = (p: LibraryPreset): PackRecord => {
  const { fonts: _fonts, ...authored } = p.pack
  return { name: p.name, pairing: p.pairing, ...authored } as PackRecord
}

/** EVERY PRESET'S HEADING FACES, for the app's own document, under `PACK_FAMILY_PREFIX` — so a pack cell's "Ag" is drawn
 *  in the pack's real face wherever a cell is (the dashboard's D4a, the editor's S4a card and S7a roster). The browser
 *  fetches a face only when a glyph uses it, and only its latin file for latin letters. `base` is the canvas route's
 *  address as the page sees it: `/canvas` on the app host, `/app/canvas` on localhost. */
export const packFacesCss = (base: string): string =>
  [...new Set(LIBRARY_PRESETS.map((p) => p.pairing))]
    .map((pairing) => fontFaceCss(pairing, fontHref(base), { prefix: PACK_FAMILY_PREFIX, role: 'heading' }))
    .join('\n')

/**
 * The three colours the card's wireframe is painted with. A preset this build does not know —
 * a project made after E6 ships, opened by an older deploy, or a column hand-edited — falls
 * back to Paper, so a card is never rendered empty.
 */
export function placeholderFor(stylePack: unknown): Preset {
  // `Object.hasOwn`, not `??`: `PRESETS['__proto__']` and `PRESETS['constructor']` are TRUTHY on
  // an object literal, so `??` never reached the fallback and the card painted `undefined`
  // colours. `style_pack` is a column the user's own session may write (review, 2026-09-05).
  // `presetIdOf` is that rule, shared with the editor's Style Pack card (Story 6.2). STORY 6.4 —
  // `packIdOf`, its widening: the pack in force may be one the project made, and an edited
  // preset or a custom pack paints its OWN light background, text and accent, validated
  // (`ownPacksOf`) before a value reaches the card's inline `style`.
  // STORY 6.6 — THE PACK IN FORCE ALONE. A stored `brand` no longer paints over it: "Use your brand"
  // seeds the accent into the pack itself (`brandPacks`), so the card and the editor wear one colour,
  // and an edit made in the editor reaches the card. A preset is returned as the very `Preset` the
  // tests compare by identity.
  const id = packIdOf(stylePack)
  const own = ownPacksOf(stylePack)[id]
  return own === undefined ? (PRESETS[id] as Preset) : ownCard(id, own)
}

/** STORY 6.6 — THE SERVER'S HALF OF THE SEED (FR-E5, FR-C4, DW-327): `style_pack` as `sync_project_doc` takes it once the
 *  site's accent is in the pack in force (`packIdOf` — a preset, as this project's own record where it has one, or a
 *  `custom-<n>`), seeded by `brandSeed`, the one rule the Style Pack list's row runs too.
 *  - `packs`: the whole validated map (`ownPacksOf`: junk dropped) with the seeded record in, `withoutDefaults` applied —
 *    every other own pack kept, and `sync_project_doc` keeps every other key of the column.
 *  - `preset`: `paper` where the stored preset is not a string (3.4's floor), else null, which writes none.
 *  Null where nothing would change: an accent that is not a colour, or a pack that already wears this seed. */
export function brandPacks(stylePack: unknown, accent: unknown): { packs: Record<string, PackRecord>; preset: string | null } | null {
  const colour = isAccent(accent) ? hexOf(accent) : null
  if (colour === null) return null
  const preset = typeof (stylePack as { preset?: unknown } | null | undefined)?.preset === 'string' ? null : DEFAULT_PRESET
  const id = packIdOf(stylePack)
  const own = ownPacksOf(stylePack)
  const library = Object.fromEntries(LIBRARY_PRESETS.map((p) => [p.id, presetRecord(p)]))
  // `packIdOf` answers a custom id only where `ownPacksOf` holds it, and a preset id always has a library record
  const before = (own[id] ?? library[id]) as PackRecord
  const seeded = brandSeed(before, colour)
  if (preset === null && samePack(seeded, before)) return null
  return { packs: withoutDefaults({ ...own, [id]: seeded }, library), preset }
}

/** A project as the brand write reads it: the column, and the revision the compare-and-set is made against. */
export type BrandRow = { id: string; style_pack: unknown; revision: number }

/** STORY 6.6 — THE BRAND WRITE'S LOOP (DW-327), pure so its stale path is under test (review, 2026-10-05: it lived in
 *  `useBrand`'s closure, where no check could run it). `write` is `sync_project_doc`'s compare-and-set and answers
 *  whether it applied, or null for an error or a project that is not the caller's; `reread` answers the project as it is
 *  now, or null. A stale base re-reads and seeds again ON TOP OF WHAT IS THERE NOW, at most `tries` writes in all.
 *  `unchanged` is `brandPacks`' null: nothing was written. */
export async function brandWrite(
  project: BrandRow,
  accent: unknown,
  tries: number,
  write: (row: BrandRow, seed: NonNullable<ReturnType<typeof brandPacks>>) => Promise<boolean | null>,
  reread: (id: string) => Promise<BrandRow | null>,
): Promise<'written' | 'unchanged' | 'failed'> {
  let row = project
  for (let n = 1; ; n += 1) {
    const seed = brandPacks(row.style_pack, accent)
    if (seed === null) return n === 1 ? 'unchanged' : 'written'
    const applied = await write(row, seed)
    if (applied) return 'written'
    if (applied === null || n >= tries) return 'failed'
    const fresh = await reread(row.id)
    if (fresh === null) return 'failed'
    row = fresh
  }
}

/** An own pack as the dashboard card and D4a's chooser paint it: the record's light values, its pairing's glyph. */
function ownCard(id: string, record: PackRecord): Preset {
  const pairing = pairingOf(record.pairing)
  return {
    id,
    name: record.name,
    glyphFamily: familyList(pairing.heading.family, PACK_FAMILY_PREFIX),
    heading: pairing.heading.family,
    body: pairing.body.family,
    surface: record.light.background,
    accent: record.light.accent,
    text: record.light.text,
  }
}

// `ROLE_TOKENS` — the Background role's dots and the token each is painted with — is `lib/pack-edit.ts`'s since Story 6.4
// (the browser paints an own pack's swatches), re-exported above for the server and the keyboard journey (DW-198).

/** The swatch colours: the pack's token values themselves, so `apps/web` carries no colour literal outside this file
 *  (`tokens.test.ts`). A missing property throws rather than drawing an empty circle.
 *
 *  Story 5.6 — PER MODE. `REFERENCE_TOKENS.dark` is the whole property set, as `light` is (`tokens.test.ts` asserts
 *  the two equal), so the panel's Background-role dots are the colours the canvas is ACTUALLY painting while dark is
 *  previewed. Story 6.2 — any preset's: the dots follow the pack the canvas is painted in. Here since Story 6.3, beside
 *  the presets (`lib/controls-review.ts` re-exports it for its own callers). */
export function referenceSwatches(mode: 'light' | 'dark' = 'light', pack = DEFAULT_PRESET): Record<string, string> {
  const preset = presetOf(pack)
  if (preset === undefined) throw new Error(`"${pack}" is not a Style Pack preset`)
  const tokens = pack === DEFAULT_PRESET ? REFERENCE_TOKENS : packTokens(preset.pack as Pack)
  return Object.fromEntries(
    Object.entries(ROLE_TOKENS).map(([role, property]) => {
      const value = tokens[mode][property]
      if (!value) throw new Error(`the ${mode} ${pack} tokens declare no ${property} — the ${role} swatch has no colour`)
      return [role, value]
    }),
  )
}

/** STORY 6.3 — EVERY PRESET AS THE EDITOR PAINTS IT, in §D.d's order: its names and families, the cell's and the card's
 *  dots (the engine's light values), the Background role's swatches per mode, and its canvas `1-tokens` block (Paper's is
 *  `reference-tokens.css`, which `referenceTokensCss` emits byte for byte — `test-vocabulary.mjs` holds the two equal)
 *  and `1b-faces` rules from the canvas route's own `?font=` — the very strings `/canvas?pack=` serves (`pilots.ts`'s
 *  `packHead`; `pilots.test.ts` holds the two equal). One derivation, so a switch paints the canvas the document a
 *  reload would be served. ponytail: derived per editor read (twelve engine runs, milliseconds); cache it if the read
 *  ever shows it. */
export function packChoices(): PackChoice[] {
  // STORY 6.4 — through `choiceOf`, the very derivation the browser runs for an own pack, each preset carrying its record
  // (what Edit pack opens on and Reset to defaults puts back). Paper's block stays `reference-tokens.css`'s, byte for byte
  return LIBRARY_PRESETS.map((p) => {
    const choice = choiceOf(p.id, presetRecord(p), pairingChoice(p.pairing))
    return p.id === DEFAULT_PRESET ? { ...choice, tokens: referenceTokensCss() } : choice
  })
}

/** One pool pairing as the editor is handed it (`pairingChoices`). */
function pairingChoice(id: string): PairingChoice {
  const pairing = pairingOf(id)
  return {
    id,
    heading: pairing.heading.family,
    body: pairing.body.family,
    glyphFamily: familyList(pairing.heading.family, PACK_FAMILY_PREFIX),
    bodyGlyphFamily: familyList(pairing.body.family, PACK_FAMILY_PREFIX),
    fonts: pairingFonts(id) as PackFonts,
    faces: fontFaceCss(id, fontHref('canvas')),
    families: [familyList(pairing.heading.family), familyList(pairing.body.family)],
  }
}

/** STORY 6.4 — EVERY POOL PAIRING, in §D.c's order, as the font rows, the pairing menu and the browser's engine need it: its
 *  families, the app's glyph faces, `pairingFonts`, and the canvas document's `1b-faces` rules from the canvas route's own
 *  `?font=` — the strings `packChoices` hands for a preset. Nothing of the pool's record (no licence, no sha256). */
export const pairingChoices = (): PairingChoice[] => POOL.pairings.map((p) => pairingChoice(p.id))

/** STORY 6.4 — THE PAIRING MENU'S AND THE FONT ROWS' GLYPH FACES, for the app's own document: the prefixed ROMAN face of
 *  every pool family that `packFacesCss` (the signed-in layout's) does not already declare — every heading the twelve
 *  presets do not wear, and every body. A browser fetches a face only when a glyph uses it, and the menu is drawn only
 *  while open. `base` is the canvas route as the page sees it (`packFacesCss`'s). */
export function pairingGlyphFacesCss(base: string): string {
  const declared = new Set(LIBRARY_PRESETS.flatMap((p) => pairingOf(p.pairing).heading.faces))
  const roman = POOL.pairings
    .flatMap((p) => [...p.heading.faces, ...p.body.faces])
    .filter((id, i, all) => all.indexOf(id) === i && !declared.has(id) && POOL.faces[id]?.style === 'normal')
  return faceRulesCss(roman, fontHref(base), PACK_FAMILY_PREFIX)
}

/** STORY 6.3 — D4a's twelve, for the New project window: each preset's name, its glyph's face and the card's three dots
 *  (background, accent, text) — and nothing else of the pool. */
export const packCells = (): PackCellData[] =>
  Object.values(PRESETS).map((p) => ({ id: p.id, name: p.name, glyphFamily: p.glyphFamily, dots: [p.surface, p.accent, p.text] }))

/** STORY 6.4 — the linked site's stored brand accent as the colour picker offers it ("From your site"): `#rgb` expanded,
 *  uppercase — or null. Through `isAccent`, because `site_settings` is a stored value and the answer becomes a draft's
 *  colour (AD-36). */
export function siteAccentOf(siteSettings: unknown): string | null {
  const accent = (siteSettings as { brand?: { accent?: unknown } } | null | undefined)?.brand?.accent
  return isAccent(accent) ? hexOf(accent) : null
}
