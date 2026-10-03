import { familyList, pairingOf, PRESETS as LIBRARY_PRESETS, type PoolFile } from '@inflozo/library/packs'
import { fontFaceCss } from '@inflozo/section-runtime/fonts'
import { z } from './zod.ts'
import { isAccent } from './probe-rule.ts'

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
 * signed-in layout. Choosing a pack is Story 6.3's (DW-322): nothing here writes the column.
 *
 * STORY 3.4 PUT A `brand` KEY IN THIS COLUMN AND E6 STILL OWNS IT (DW-66). FR-C4's "Use your
 * brand" copies the customer's own Ghost accent, logo and menu out of `sites.site_settings.brand`
 * (`probe-rule.ts`'s `brandOf`) into `projects.style_pack.brand`. WHO READS WHAT (DW-71, Story
 * 5.24b): here, `placeholderFor` below reads the ACCENT — the dashboard card wears the site's
 * colour instead of the preset's; off the site's own record, S2c draws all three and the canvas's
 * surfaces read the accent (`storedSurfaces`). The logo and the menu wait here for E6's Style Pack
 * editor, which claims them or drops them. The four keys nothing read — icon, cover, title and
 * description — are no longer stored at all; a pack seeded before Story 5.24b still holds them,
 * and nothing reads them.
 */

/**
 * Today's shape. E6 widens it; `placeholderFor` is written so widening cannot break a card.
 *
 * `brand` is TYPED `unknown` ON PURPOSE and validated where it is read. A stricter shape here
 * would make a `brand` of the wrong type fail the WHOLE parse, and a pack that failed to parse
 * loses its preset — so a junk brand would repaint the card in Paper rather than merely be
 * ignored. `style_pack` is a column the user's own session may write (schema :1202, the `grant`).
 *
 * THE SAME ARGUMENT RUNS THE OTHER WAY AND `placeholderFor` NOW HONOURS IT: `preset` is required,
 * so a pack with no preset fails the parse, and reading `brand` out of that parse threw a perfectly
 * good accent away with it. It is read off the raw value instead (review 3, 2026-09-08).
 */
export const stylePackSchema = z.object({ preset: z.string(), brand: z.unknown().optional() }).loose()

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

/** The family-name prefix a pool face takes in the APP's document, where `Inter` and `Bricolage Grotesque` are already
 *  the app's own faces (`app/fonts/fonts.css`). */
export const PACK_FAMILY_PREFIX = 'Inflozo pack '

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

export const DEFAULT_PRESET = 'paper'

/** A pool file's address beside a document served at `base` — `canvas` from the canvas document, `../canvas` from a
 *  frame one level down, `/canvas` (or `/app/canvas`) from an app page — carrying the start of its own sha256, so a
 *  rebuilt file is a new address and the route may keep it `immutable` (`lib/canvas.ts`'s `canvasCaching`). Here and
 *  not in `lib/canvas.ts` because this module is a client one's too, and must not carry the runtime with it. */
export const fontHash = (sha256: string) => sha256.slice(0, 12)
export const fontHref = (base: string) => (f: PoolFile) => `${base}?font=${f.file}&h=${fontHash(f.sha256)}`

/** A blank project's `style_pack`: Paper, the default (choosing another is Story 6.3's). */
export const defaultStylePack = (): StylePack => ({ preset: DEFAULT_PRESET })

/** The preset id a stored `style_pack` names — `placeholderFor`'s rule: anything this build does not know is Paper. */
export function presetIdOf(stylePack: unknown): string {
  const parsed = stylePackSchema.safeParse(stylePack)
  const preset = parsed.success ? parsed.data.preset : DEFAULT_PRESET
  return Object.hasOwn(PRESETS, preset) ? preset : DEFAULT_PRESET
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
  // `presetIdOf` is that rule, shared with the editor's Style Pack card (Story 6.2).
  const base = PRESETS[presetIdOf(stylePack)] as Preset
  // FR-C4: the SITE's accent wins over the pack's, which is the whole visible result of "Use your
  // brand" — the dashboard card is painted in the customer's own colour before they have chosen
  // anything. RE-VALIDATED HERE and not trusted from the column: it is painted as an inline
  // `style`, and the same session that may write this jsonb could write a CSS injection into it.
  // The preset object is returned UNCHANGED when there is no accent to apply, so a card with no
  // brand is still the very same `Preset` the tests compare by identity.
  // READ OFF THE RAW COLUMN, NOT OFF `parsed.data`. `preset` is REQUIRED by the schema, so a pack
  // that lost it failed the WHOLE parse and TOOK THE BRAND WITH IT — the card reverted to Paper
  // with nothing failing, and `useBrand`'s merge (`{ ...pack, brand }` over whatever the column
  // held) is a path that can produce exactly that pack. `brand` is `z.unknown()` in the schema and
  // is re-validated by `isAccent` on the next line either way, so the parse was never what made it
  // safe — it was only what could throw it away. Three review layers and the Review 2 record's own
  // `placeholderFor({brand:{accent}})` line, which did not reproduce, all met this one
  // (review 3, 2026-09-08). The optional chain covers a column holding null, a string or an array.
  const brand = (stylePack as { brand?: unknown } | null | undefined)?.brand as
    | { accent?: unknown }
    | null
    | undefined
  const accent = brand?.accent
  return isAccent(accent) ? { ...base, accent } : base
}
