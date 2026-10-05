/* ─────────────────────────────────────────── Story 6.4 — EDITING A STYLE PACK, AS DATA (FR-E3, FR-D9, AD-36).
 *
 * THE CLIENT'S ONE HOME FOR EDITING. A project's own pack is a FULL AUTHORED RECORD — the shape Appendix D §D.d's presets
 * have in `packages/library/packs/packs.json` — kept in `projects.style_pack.packs[id]`, where `id` is a library preset's
 * (that preset as edited in this project) or `custom-<n>` (a pack the project made). Fonts are a pairing from the pool,
 * stored as its id (`D1`…), never a family name (AD-36). A preset's record equal to the library's is never stored, so
 * Reset to defaults is "drop the key" (`withoutDefaults`).
 *
 * PURE, AND REACHABLE BY `node --test` (`pack-edit.test.ts`): its imports are the runtime's index — the engine, the AA
 * pairs and the colour maths, all pool-free (`tools/check-traces.mjs` holds the index to that) — `lib/pack-switch.ts`'s
 * vocabulary and `lib/zod.ts`. NOTHING OF THE POOL: the browser computes an own pack's canvas CSS, dots and swatches with
 * the engine (`choiceOf`) and the pairing data the server hands it (`PairingChoice`, from `lib/style-pack.ts`'s
 * `pairingChoices`), so no client carries the font pool's record (DW-323).
 *
 * EVERY READER VALIDATES (AD-36): `ownPacksIn` is the one rule — a record that fails the strict schema, names a pairing
 * the pool does not hold, or is refused by the engine's `check` is dropped, and an id that is neither a preset's nor a
 * `custom-<n>` is no pack. The server's `ownPacksOf`, the sync route's 422 and the editor's hydrate all ask it.
 *
 * ONE WORD LIST (R-170, R-237): `PACK_EDIT_WORDS` is the spec's Design Notes table. The panel, the dialog, the
 * announcements and every check read it, and it wins over a drawing's word wherever the two differ ("Base", not
 * S7c's "Background"; "On-accent", not its "Contrast"; Appendix C's row titles and steps, not S7a's).
 */

import { AA_PAIRS, contrast, isHex, isLength, packTokens, packTokensCss, SCALES, stepToContrast, type Pack, type PackMode, type PackRole } from '@inflozo/section-runtime'
import type { PackChoice } from './pack-switch.ts'
import { z } from './zod.ts'

/** A pack's fonts as the engine reads them: each role's family list and roman cap height, the body's tabular figures. */
export type PackFonts = Pack['fonts']

/** A pack, as its author answers it — the shape of a preset in `packs.json`, without its id. */
export type PackRecord = {
  name: string
  pairing: string
  pillRadius: string
  radius: keyof typeof SCALES.radius
  density: keyof typeof SCALES.density
  width: keyof typeof SCALES.width
  gutters: keyof typeof SCALES.gutters
  buttons: keyof typeof SCALES.buttons
  shadow: keyof typeof SCALES.shadow
  links: keyof typeof SCALES.links
  light: PackMode
  dark: PackMode
}
/** A project's own packs, by id — `style_pack.packs` as the editor holds it. */
export type PackRecords = Readonly<Record<string, PackRecord>>

/** The scale rows a pack takes a step on, in the record's own keys. */
export type ScaleRow = keyof typeof SCALES

const steps = <T extends object>(scale: T) => z.enum(Object.keys(scale) as [Extract<keyof T, string>, ...Extract<keyof T, string>[]])
const colour = z.string().refine(isHex)
const mode = z.strictObject({
  background: colour,
  surface: colour,
  text: colour,
  muted: colour,
  border: colour,
  accent: colour,
  onAccent: colour,
  scrim: z.number().min(0).max(1),
})

/** THE RECORD, STRICT: a name trimmed to 1–40 characters, a pool pairing's id, a step of `SCALES` on every row, the
 *  engine's length grammar for the pill radius, and seven `#RRGGBB` colours and a 0–1 scrim per mode — and no other key,
 *  so a body cannot smuggle `brand` or anything else into the column. */
export const packRecordSchema = z.strictObject({
  name: z.string().trim().min(1).max(40),
  pairing: z.string().regex(/^D[1-9][0-9]{0,2}$/),
  pillRadius: z.string().refine(isLength),
  radius: steps(SCALES.radius),
  density: steps(SCALES.density),
  width: steps(SCALES.width),
  gutters: steps(SCALES.gutters),
  buttons: steps(SCALES.buttons),
  shadow: steps(SCALES.shadow),
  links: steps(SCALES.links),
  light: mode,
  dark: mode,
})

/** A pack the project made: `custom-1`, `custom-2`… ponytail: four digits — a project with ten thousand packs is a bug. */
export const CUSTOM_ID = /^custom-[1-9][0-9]{0,3}$/
export const isCustom = (id: string) => CUSTOM_ID.test(id)

/** The next free `custom-<n>`: the smallest n no own pack holds. */
export function nextCustomId(packs: PackRecords): string {
  for (let n = 1; ; n += 1) if (!Object.hasOwn(packs, `custom-${n}`)) return `custom-${n}`
}

/** A pool pairing as the server hands it (`lib/style-pack.ts`'s `pairingChoices`): what the font rows, the pairing menu and
 *  the engine need, and nothing else of the pool. */
export type PairingChoice = {
  id: string
  /** the two families, as the rows and the menu print them ("Lora", "Lato") */
  heading: string
  body: string
  /** the app's "Ag" and "Aa" faces — the pool's own roman faces under `PACK_FAMILY_PREFIX` */
  glyphFamily: string
  bodyGlyphFamily: string
  /** what the engine reads (`pairingFonts`) */
  fonts: PackFonts
  /** the canvas document's `1b-faces` rules, from the canvas route's own `?font=` */
  faces: string
  /** the heading's and the body's family lists, which a restyle waits on (`document.fonts.load`) */
  families: readonly string[]
}

/** A record as the engine reads it: its authored values with its pairing's fonts. */
export const packOf = ({ name: _name, pairing: _pairing, ...authored }: PackRecord, fonts: PackFonts): Pack => ({ ...authored, fonts })

/** STORY 5.6's Background role and the token each of its dots is painted with — here since Story 6.4, because the
 *  browser now paints an own pack's swatches (`choiceOf`). `lib/style-pack.ts` and `lib/controls-review.ts` re-export it.
 *  Image has no colour: the panel draws the Kit's image glyph for it. */
export const ROLE_TOKENS: Readonly<Record<string, string>> = {
  base: '--bg-page',
  surface: '--bg-surface',
  accent: '--accent',
  contrast: '--bg-contrast',
}

const CELL_DOTS = ['--bg-page', '--accent', '--text-body', '--plate'] as const
const CARD_DOTS = ['--bg-page', '--bg-surface', '--accent', '--text-body', '--plate'] as const

/** A PACK AS THE EDITOR PAINTS IT, made by the very engine calls `packChoices` makes for a preset — its names, the cell's
 *  and the card's dots, the Background role's swatches per mode, its canvas `1-tokens` block and its pairing's
 *  `1b-faces` — with the record it was made from. One derivation for a preset, an edited preset and a pack the project
 *  made, so the card, the list, the swatches and the canvas cannot disagree. Throws where the engine refuses the record:
 *  every caller hands it one `ownPacksIn` kept, or the library's. */
export function choiceOf(id: string, record: PackRecord, pairing: PairingChoice): PackChoice {
  const pack = packOf(record, pairing.fonts)
  const tokens = packTokens(pack)
  const dots = (properties: readonly string[]) => properties.map((p) => tokens.light[p] ?? '')
  const swatches = (m: 'light' | 'dark') => Object.fromEntries(Object.entries(ROLE_TOKENS).map(([role, property]) => [role, tokens[m][property] ?? '']))
  return {
    id,
    name: record.name,
    heading: pairing.heading,
    body: pairing.body,
    glyphFamily: pairing.glyphFamily,
    cellDots: dots(CELL_DOTS),
    cardDots: dots(CARD_DOTS),
    swatches: { light: swatches('light'), dark: swatches('dark') },
    tokens: packTokensCss(pack),
    faces: pairing.faces,
    families: pairing.families,
    record,
  }
}

/** THE ONE READING RULE (AD-36) for a project's own packs, wherever they come from — the column (`lib/style-pack.ts`'s
 *  `ownPacksOf`), a request body (the sync route) or this device (the editor's hydrate): the valid records under valid
 *  ids, and nothing else. An id is a preset's (`isPreset`) or a `custom-<n>`; a record passes the strict schema, names a
 *  pairing `fontsOf` holds, and goes through the engine's `check`. Junk is dropped, never thrown. */
export function ownPacksIn(
  value: unknown,
  { isPreset, fontsOf }: { isPreset: (id: string) => boolean; fontsOf: (pairing: string) => PackFonts | undefined },
): Record<string, PackRecord> {
  const out: Record<string, PackRecord> = {}
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return out
  for (const [id, raw] of Object.entries(value)) {
    // `__proto__` and every other key that is not a pack id stop here, before anything is assigned
    if (!isPreset(id) && !isCustom(id)) continue
    const parsed = packRecordSchema.safeParse(raw)
    if (!parsed.success) continue
    const fonts = fontsOf(parsed.data.pairing)
    if (fonts === undefined) continue
    try {
      packTokens(packOf(parsed.data, fonts))
    } catch {
      continue
    }
    out[id] = parsed.data
  }
  return out
}

/** The keys sorted, so two maps holding the same records compare equal whatever order they were built in. */
const canonical = (v: unknown): string =>
  v === null || typeof v !== 'object'
    ? JSON.stringify(v) ?? 'null'
    : Array.isArray(v)
      ? `[${v.map(canonical).join(',')}]`
      : `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(',')}}`
export const samePack = (a: unknown, b: unknown) => canonical(a) === canonical(b)

/** A preset's record equal to the library's is not an own pack: it is the preset. Reset to defaults then Save drops it. */
export function withoutDefaults(packs: PackRecords, presets: Readonly<Record<string, PackRecord>>): Record<string, PackRecord> {
  return Object.fromEntries(Object.entries(packs).filter(([id, record]) => !(Object.hasOwn(presets, id) && samePack(record, presets[id]))))
}

/** One pair of `AA_PAIRS` that reads under 4.5:1, its ratio FLOORED to one decimal — so a failing pair never prints 4.5. */
export type HardPair = { mode: 'light' | 'dark'; fg: PackRole; bg: PackRole; ratio: number }

export const MODES = ['light', 'dark'] as const

/** THE LIVE CONTRAST CHECK (FR-E3, NFR-5, UX-DR8): 6.2's AA sheet over a draft, in both modes. A warning in words, never a
 *  block — Save pack stays live and saves. */
export const hardToRead = (record: Pick<PackRecord, 'light' | 'dark'>): HardPair[] =>
  MODES.flatMap((m) =>
    AA_PAIRS.flatMap(({ fg, bg }) => {
      const ratio = contrast(record[m][fg], record[m][bg])
      return ratio < 4.5 ? [{ mode: m, fg, bg, ratio: Math.floor(ratio * 10) / 10 }] : []
    }),
  )

/** STORY 6.6 — THE BRAND SEED (FR-E5, R-241): the one rule that puts a site's accent into a pack. S2c's action (through
 *  `lib/style-pack.ts`'s `brandPacks`) and the Style Pack list's "From your site" row both call it, so the two doors cannot
 *  seed differently. `accent` is `#RRGGBB` (callers hand `hexOf` of the brand's accent); anything else returns the record
 *  unchanged.
 *  - Light: the accent exactly.
 *  - Dark: the accent stepped lighter only until it reads 4.5:1 on the dark Base and then on the dark Surface — the shape
 *    of the engine's own double step (`tokens.ts`'s `negative`) — so a colour that already reads is kept as it is.
 *  - Each mode's on-accent: kept where it reads 4.5:1 on that mode's new accent; otherwise the better of that mode's Base
 *    and Text, stepped to 4.5:1 — the engine's on-contrast rule (`tokens.ts`'s `--text-on-contrast`). So a seed never
 *    raises the live warning on its own.
 *  Every other value of the record is returned as it was: never the logo (R-240: it stays Ghost's), never the menu. */
export function brandSeed(record: PackRecord, accent: string): PackRecord {
  if (!isHex(accent)) return record
  const light = accent.toUpperCase()
  const dark = stepToContrast(stepToContrast(light, record.dark.background, 4.5), record.dark.surface, 4.5)
  const onAccent = (m: PackMode, on: string) =>
    contrast(m.onAccent, on) >= 4.5 ? m.onAccent : stepToContrast(contrast(m.background, on) >= contrast(m.text, on) ? m.background : m.text, on, 4.5)
  return {
    ...record,
    light: { ...record.light, accent: light, onAccent: onAccent(record.light, light) },
    dark: { ...record.dark, accent: dark, onAccent: onAccent(record.dark, dark) },
  }
}

/** A typed colour, as the hex field takes it: six hex digits or three, with or without the hash, either case, spaces
 *  around trimmed — always answered as the hash and six uppercase digits (three digits expanded); anything else is null,
 *  and the swatch keeps its last valid colour (the spec's I/O matrix holds the cases, `pack-edit.test.ts`). */
export function hexOf(typed: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(typed.trim())
  if (!m) return null
  const digits = m[1] as string
  const six = digits.length === 3 ? [...digits].map((c) => c + c).join('') : digits
  return `#${six.toUpperCase()}`
}

/** `#RRGGBB` → hue 0–360, saturation and value 0–100 — unrounded, so a colour survives the round trip exactly. */
export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 }
}

/** hue 0–360, saturation and value 0–100 → `#RRGGBB`, uppercase. */
export function hsvToHex({ h, s, v }: { h: number; s: number; v: number }): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return (v / 100) * (1 - (s / 100) * Math.max(0, Math.min(k, 4 - k, 1)))
  }
  return `#${[f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

/** Pill radius's steps: 0 to 40 px, then Full — the 999 px eleven presets use. */
export const PILL_STEPS: readonly string[] = [...Array.from({ length: 41 }, (_, n) => `${n}px`), '999px']
/** The next pill radius step either way; a value outside the steps (only a hand-made record holds one) moves to its end. */
export function pillStep(value: string, by: 1 | -1): string {
  const at = PILL_STEPS.indexOf(value)
  if (at < 0) return by > 0 ? (PILL_STEPS[PILL_STEPS.length - 1] as string) : (PILL_STEPS[PILL_STEPS.length - 2] as string)
  return PILL_STEPS[Math.max(0, Math.min(PILL_STEPS.length - 1, at + by))] as string
}

/** Image scrim's steps: 0–100 % by 5, snapped. */
export function scrimStep(scrim: number, by: 1 | -1): number {
  const at = Math.round(scrim * 100)
  const next = by > 0 ? Math.floor(at / 5) * 5 + 5 : Math.ceil(at / 5) * 5 - 5
  return Math.max(0, Math.min(100, next)) / 100
}

/** The seven colours per mode, in the record's order: the page's own colour is Base (R-237). */
const ROLE_WORDS = { background: 'Base', surface: 'Surface', text: 'Text', muted: 'Muted', border: 'Border', accent: 'Accent', onAccent: 'On-accent' } satisfies Record<PackRole, string>
const MODE_WORDS = { light: 'Light', dark: 'Dark' } as const
const pairWords = (p: HardPair) => `${ROLE_WORDS[p.fg]} on ${ROLE_WORDS[p.bg]} in ${MODE_WORDS[p.mode]}, ${p.ratio.toFixed(1)}:1`

/** The rows a pack's steps are set on, in the panel's order, with Appendix C's titles and steps (R-170). */
type Row<K extends ScaleRow> = { key: K; title: string; steps: Readonly<Record<keyof (typeof SCALES)[K], string>> }
const row = <K extends ScaleRow>(r: Row<K>) => r

/** THE WORDS (R-170, R-237) — the spec's Design Notes table, read by the panel, the dialog, the announcements and every
 *  check. */
export const PACK_EDIT_WORDS = {
  /** Appendix C's Style Pack rows, titles and steps exactly, in the panel's order (`prd.md` Appendix C) */
  rows: [
    row({ key: 'width', title: 'Site width', steps: { narrow: 'Narrow', normal: 'Normal', wide: 'Wide' } }),
    row({ key: 'radius', title: 'Radius', steps: { sharp: 'Sharp', soft: 'Soft', round: 'Round' } }),
    row({ key: 'density', title: 'Spacing density', steps: { compact: 'Compact', comfortable: 'Comfortable', airy: 'Airy' } }),
    row({ key: 'gutters', title: 'Gutters', steps: { tight: 'Tight', normal: 'Normal', loose: 'Loose' } }),
    row({ key: 'buttons', title: 'Button style', steps: { solid: 'Solid', soft: 'Soft', outline: 'Outline', pill: 'Pill' } }),
    row({ key: 'shadow', title: 'Shadow', steps: { none: 'None', subtle: 'Subtle', lifted: 'Lifted' } }),
    row({ key: 'links', title: 'Link style', steps: { underline: 'Underline', accent: 'Accent' } }),
  ] as const,
  /** S7a's two font rows; one pairing, so either opens the one menu */
  headingFont: 'Heading font',
  bodyFont: 'Body font',
  pillRadius: 'Pill radius',
  /** a pill radius step: "12 px", or Full */
  pillValue: (value: string) => (value === '999px' ? 'Full' : /^\d+px$/.test(value) ? `${value.slice(0, -2)} px` : value),
  /** the pairing menu's name: either row opens it, so it names what is chosen — the pairing */
  pairings: 'Font pairings',
  /** the seven colours per mode, in the record's order: the page's own colour is Base (R-237) */
  roles: ROLE_WORDS,
  modes: MODE_WORDS,
  scrim: 'Image scrim',
  percent: (scrim: number) => `${Math.round(scrim * 100)} %`,
  /** each Edit pack door, and "+ New pack" */
  edit: (name: string) => `Edit pack — ${name}`,
  newPack: 'New pack',
  /** the dialogs: S7c's and S7d's titles and their own subtitles */
  editTitle: 'Edit pack',
  editSubtitle: 'Seven roles per mode. Tap any swatch to change it — dark is tuned separately, never just inverted.',
  newTitle: 'New pack',
  newSubtitle: 'Starts from your current look — recolor it, name it, and it joins your pack grid.',
  close: 'Close',
  name: 'Pack name',
  placeholder: 'Name it — e.g. Studio Warm',
  reset: 'Reset to defaults',
  cancel: 'Cancel',
  save: 'Save pack',
  nameNeeded: 'Name your pack to save it.',
  /** a swatch: its role, its mode and its hex — and ", hard to read" where it fails */
  swatch: (role: string, m: string, hex: string, hard: boolean) => `${role}, ${m}, ${hex}${hard ? ', hard to read' : ''}`,
  /** the colour picker */
  hexField: (role: string, m: string) => `${role}, ${m} — hex`,
  square: (role: string, m: string) => `${role}, ${m} — saturation and brightness`,
  squareValue: (s: number, v: number) => `saturation ${Math.round(s)} %, brightness ${Math.round(v)} %`,
  hue: (role: string, m: string) => `${role}, ${m} — hue`,
  hueValue: (h: number) => `hue ${Math.round(h)}°`,
  /** the picker's row and, since Story 6.6, the Style Pack list's row whose Use your brand seeds the pack in force */
  fromSite: 'From your site',
  /** Story 6.6 — said for a Use your brand that changes nothing (the pack already wears this seed) */
  wearsBrand: (name: string) => `${name} already wears your brand.`,
  paste: 'Paste',
  pasteFallback: 'Press ⌘V to paste into the hex field.',
  notColour: 'Not a colour — type #RRGGBB',
  /** the warning: every failing pair, in words, never a block */
  pair: pairWords,
  warning: (pairs: readonly HardPair[]) => `Hard to read: ${pairs.map(pairWords).join('; ')}. Small text needs 4.5:1 — you can still save.`,
  /** said once the warning clears — the spec asks the clearing to be heard, and its table words only the warning */
  readable: 'Nothing is hard to read now.',
  /** said, once landed */
  changed: (name: string) => `Changed ${name}.`,
  row: (title: string, step: string) => `${title} — ${step}`,
  pairing: (heading: string, body: string) => `Font pairing — ${heading} · ${body}`,
}
