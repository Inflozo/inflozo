import { z } from 'zod'
import { isAccent } from './probe-rule.ts'

/**
 * `projects.style_pack`, and the one schema for it (the spine's rule (a): one zod schema per
 * boundary). E6 OWNS THIS COLUMN — the Style Pack editor, Appendix D's twelve packs and the
 * per-mode token overrides are Story 6.1's — and Story 1.5 reads it three epics early, through
 * this same schema, because the dashboard card's placeholder is drawn from the pack (FR-B1).
 *
 * THE COLOURS BELOW ARE NOT APP TOKENS AND MUST NEVER BECOME ONE. A Style Pack belongs to the
 * USER'S SITE, not to Inflozo's chrome (`components/kit/pack-cell.tsx`), which is why they are
 * hex strings applied as inline `style` rather than Tailwind classes — Tailwind's palette is
 * cleared on purpose and the token layer is the app's vocabulary alone. `tokens.test.ts` names
 * this file as the one place a colour literal may live, and checks that it stays the one place.
 *
 * Paper's three values are read off `D4 Dashboard Sheets and Blocks.dc.html` D4a, the Paper
 * pack cell's own dots. DW-11: E6 re-sources every pack from Appendix D, and this is where
 * that lands.
 *
 * STORY 3.4 PUT A `brand` KEY IN THIS COLUMN AND E6 STILL OWNS IT (DW-66). FR-C4's "Use your
 * brand" copies the customer's own Ghost accent, logo, icon, cover and menu out of
 * `sites.site_settings.brand` (`probe-rule.ts`'s `brandOf`) into `projects.style_pack.brand`, and
 * the only thing that READS it today is `placeholderFor` below — the dashboard card wears the
 * site's colour instead of the preset's. Every other field is stored for the epic that uses it.
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
  /** The pack's own name, as the pack cell prints it. */
  name: string
  /** The pack's heading face — the cell renders "Ag" in it, so it is the site's font, not ours. */
  glyphFamily: string
  surface: string
  accent: string
  text: string
}

export const PRESETS: Record<string, Preset> = {
  paper: {
    name: 'Paper',
    glyphFamily: 'Georgia, serif',
    surface: '#FBF9F5',
    accent: '#D96C3F',
    text: '#232019',
  },
}

export const DEFAULT_PRESET = 'paper'

/** A blank project's `style_pack`. The only pack that exists today. */
export const defaultStylePack = (): StylePack => ({ preset: DEFAULT_PRESET })

/**
 * The three colours the card's wireframe is painted with. A preset this build does not know —
 * a project made after E6 ships, opened by an older deploy, or a column hand-edited — falls
 * back to Paper, so a card is never rendered empty.
 */
export function placeholderFor(stylePack: unknown): Preset {
  const parsed = stylePackSchema.safeParse(stylePack)
  const preset = parsed.success ? parsed.data.preset : DEFAULT_PRESET
  // `Object.hasOwn`, not `??`: `PRESETS['__proto__']` and `PRESETS['constructor']` are TRUTHY on
  // an object literal, so `??` never reached the fallback and the card painted `undefined`
  // colours. `style_pack` is a column the user's own session may write (review, 2026-09-05).
  const base = Object.hasOwn(PRESETS, preset) ? PRESETS[preset] : PRESETS[DEFAULT_PRESET]
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
