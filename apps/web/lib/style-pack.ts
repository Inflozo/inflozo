import { z } from 'zod'

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
 */

/** Today's shape. E6 widens it; `placeholderFor` is written so widening cannot break a card. */
export const stylePackSchema = z.object({ preset: z.string() }).loose()

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
  return Object.hasOwn(PRESETS, preset) ? PRESETS[preset] : PRESETS[DEFAULT_PRESET]
}
