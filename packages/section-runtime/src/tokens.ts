// The token engine — the full custom-property contract, and the one function every pack goes through to fill it.
//
// Why it ships with the runtime and not with Epic 6's packs: a design's CSS consumes pack custom properties
// EXCLUSIVELY (`var(--…)` only, AD-2), so without a token block nothing resolves and the canvas renders blank — three
// epics before any pack existed (step-6 stress finding F2). Story 6.1 made the reference set what every pack is: its
// AUTHORED inputs run through the engine. The contract kept every property and gained the page margin
// (`--site-margin`, DW-155) and the button's label (`--button-text`); every value is now the engine's.
//
// R-32 (Appendix D §D.0, AD-30): every row is COMPUTED from what the pack declared or AUTHORED by the pack's author, and
// there is no third state. A pack answers the authored rows — its colours per mode, two fonts, the scrim's strength,
// the pill radius and one step on each scale — and `packTokens` computes every other value by the rules
// below, so twelve packs cannot answer the contrast ground, the hover surface or the drop cap twelve ways.
//
// The contract is the data below; `reference-tokens.css` is the stylesheet emitted from it, and
// `tools/stress/test-vocabulary.mjs` reads the bytes of both — and of §D.0 — and fails on any drift (a test in a core
// package cannot read a file: AD-1 bans `node:fs` there, and the test-file exemption gives back only `node:test` and
// `node:assert`).
//
// THIS FILE IMPORTS NO LIBRARY (DW-323, Story 6.3): Paper — `REFERENCE_PACK`, `REFERENCE_TOKENS` and the stylesheet
// `referenceTokensCss` emits — reads the library's presets and lives on its own subpath, `./reference.ts`, so the
// package's index carries no preset and no font pool into a client.

import { contrast, darker, isHex, mix, rgba, stepToContrast } from './colour.ts'

export type TokenSource = 'computed' | 'authored'
export type TokenRow = { readonly source: TokenSource; readonly properties: readonly string[] }

/** The rows, named as Appendix D §D.0 names them, each marked and each naming the properties it resolves to. A pack
 *  answers an authored row; the library reads the property. Nothing outside this map may appear in a design's
 *  `var(--…)` without a fallback, and `test-vocabulary.mjs` holds §D.0 to it in both directions. A step row's colours
 *  are computed from the palette, but the row is AUTHORED: the author is asked for the step. */
export const TOKEN_ROWS: Readonly<Record<string, TokenRow>> = {
  // the palette's roles, per mode, hand-paired (FR-E1)
  palette: {
    source: 'authored',
    properties: ['--bg-page', '--bg-surface', '--text-body', '--text-muted', '--border-hairline', '--accent', '--text-on-accent'],
  },
  'border fade': { source: 'computed', properties: ['--border-fade'] },
  'contrast ground': { source: 'computed', properties: ['--bg-contrast'] },
  'on-contrast text': { source: 'computed', properties: ['--text-on-contrast'] },
  'accent-on-contrast': { source: 'computed', properties: ['--accent-on-contrast'] },
  elevation: { source: 'computed', properties: ['--bg-elevated'] },
  'hover surface': { source: 'computed', properties: ['--bg-hover'] },
  negative: { source: 'computed', properties: ['--negative'] },
  plate: { source: 'computed', properties: ['--plate'] },
  'tabular figures': { source: 'computed', properties: ['--figures-tabular'] },
  'drop-cap ratio': { source: 'computed', properties: ['--drop-cap-ratio'] },
  // the two genuine judgements beyond the palette (R-32) — the scrim's COLOUR is computed, its strength is not
  'scrim strength': { source: 'authored', properties: ['--scrim'] },
  'pill radius': { source: 'authored', properties: ['--radius-pill'] },
  fonts: { source: 'authored', properties: ['--font-heading', '--font-body'] },
  // the steps (R-230's values, in SCALES)
  'radius scale': { source: 'authored', properties: ['--radius-card', '--radius-control'] },
  'spacing density': {
    source: 'authored',
    properties: ['--space-section', '--space-section-compact', '--space-section-spacious', '--space-gap'],
  },
  'site width': { source: 'authored', properties: ['--site-width'] },
  // DW-155: the page margin is its own row beside the column gutter — the same for every pack
  'page margin': { source: 'computed', properties: ['--site-margin'] },
  gutters: { source: 'authored', properties: ['--space-gutter'] },
  'button style': { source: 'authored', properties: ['--button-fill', '--button-border', '--button-radius', '--button-text'] },
  'shadow level': { source: 'authored', properties: ['--shadow-card'] },
  'link style': { source: 'authored', properties: ['--link-color', '--link-decoration'] },
  // AD-3's carve-out: the ONE value a stylesheet cannot know when it is authored. `data-bind-style` sets it per element
  // from Ghost; the root default is what an unbound tag reads.
  'tag accent': { source: 'computed', properties: ['--tag-accent'] },
}

/** Every property in the contract, derived from the rows — never a second list (standing rule 4). */
export const TOKEN_NAMES: readonly string[] = Object.values(TOKEN_ROWS).flatMap((r) => r.properties)

/** One mode's authored colours, `#rrggbb`, and the scrim's strength (0–1). */
export type PackMode = {
  background: string
  surface: string
  text: string
  muted: string
  border: string
  accent: string
  onAccent: string
  scrim: number
}
/** A face, with its cap height as a fraction of the em (the drop cap is computed from the two). */
export type Face = { family: string; capHeight: number }

const TRANSPARENT_BORDER = '1px solid transparent'
type ButtonLook = { fill: string; border: string; text: string }

/** Every step of every scale, and its values — R-230 (owner, 2026-10-03), Story 6.1's Question 2, and nowhere else:
 *  Appendix D names the steps and points here. Section padding is per width band (desktop · tablet · mobile); Compact
 *  and Airy multiply Comfortable's every value by 0.75 and 1.25, to the nearest 0.25rem. A button, shadow or link step
 *  is a rule over the mode's palette. */
const COMFORTABLE = {
  section: ['6rem', '5rem', '4rem'],
  compact: ['4rem', '3.5rem', '3rem'],
  spacious: ['8.25rem', '6.75rem', '5.25rem'],
  gap: ['1.5rem'],
} as const // A4-0 Category Proof's ladder: 96 · 80 · 64, 64 · 56 · 48 and 132 · 108 · 84 px
type Density = { readonly [K in keyof typeof COMFORTABLE]: readonly string[] }
const times = (f: number): Density => {
  const scale = (v: string) => `${String(Math.round((parseFloat(v) * f) / 0.25) * 0.25)}rem`
  return { section: COMFORTABLE.section.map(scale), compact: COMFORTABLE.compact.map(scale), spacious: COMFORTABLE.spacious.map(scale), gap: COMFORTABLE.gap.map(scale) }
}
/** A section sits on the page ground or on the surface (the Background role's two plain values), so a colour drawn
 *  straight on a section must read on both. */
const onGrounds = (colour: string, m: PackMode, target: number) => contrast(colour, m.background) >= target && contrast(colour, m.surface) >= target
const solid = (m: PackMode): ButtonLook => ({ fill: m.accent, border: TRANSPARENT_BORDER, text: m.onAccent })

/** NEVER REMOVE OR RENAME A STEP without migrating `projects.style_pack.packs` first (Story 6.4's review): a project's
 *  own pack stores these keys, a record naming a step that is gone is dropped at read, and the next pack save then
 *  writes the column without it. */
export const SCALES = {
  radius: { sharp: '2px', soft: '8px', round: '16px' },
  density: { compact: times(0.75), comfortable: COMFORTABLE as Density, airy: times(1.25) },
  width: { narrow: '72rem', normal: '81rem', wide: '90rem' },
  gutters: { tight: '1rem', normal: '1.5rem', loose: '2rem' },
  buttons: {
    solid,
    soft: (m: PackMode): ButtonLook => {
      const fill = mix(m.background, m.accent, 0.16)
      return { fill, border: TRANSPARENT_BORDER, text: stepToContrast(m.accent, fill, 4.5) }
    },
    outline: (m: PackMode): ButtonLook => ({
      fill: 'transparent',
      border: `1px solid ${onGrounds(m.accent, m, 3) ? m.accent : m.text}`,
      text: onGrounds(m.accent, m, 4.5) ? m.accent : m.text,
    }),
    // Solid, with `--button-radius` the pill radius (packTokens)
    pill: solid,
  },
  // geometry and the text colour's alpha; dark draws no shadow at any step, as Paper's dark drawing does
  shadow: { none: null, subtle: ['0 4px 16px', 0.08], lifted: ['0 12px 32px', 0.14] },
  links: {
    // R-112: the accent's words where they read on the page ground and the surface, else the text's words with an
    // accent underline
    accent: (m: PackMode) => (onGrounds(m.accent, m, 4.5) ? [m.accent, 'underline'] : [m.text, `underline ${m.accent}`]),
    underline: (m: PackMode) => [m.text, 'underline'],
  },
} as const

/** A pack: what its author is asked for, and nothing else. */
export type Pack = {
  light: PackMode
  dark: PackMode
  pillRadius: string
  fonts: { heading: Face; body: Face & { tabular: boolean } }
  radius: keyof typeof SCALES.radius
  density: keyof typeof SCALES.density
  width: keyof typeof SCALES.width
  gutters: keyof typeof SCALES.gutters
  buttons: keyof typeof SCALES.buttons
  shadow: keyof typeof SCALES.shadow
  links: keyof typeof SCALES.links
}

/** The red every pack's negative starts from, the page margin every pack shares, and the bands the responsive rows
 *  change at — the category frames' page geometry (`A1 Headers - Spec.md:19`, `A4 Heroes - Spec.md:67`, `A4-0
 *  Category Proof.dc.html:132`): desktop ≥ 1024, tablet 768–1023, mobile ≤ 767. R Responsive System's A.4 margin and
 *  padding numbers are superseded for both (§D.0). */
const ERROR_RED = '#D92D20'
const PAGE_MARGIN = ['4.5rem', '2.5rem', '1.25rem'] // 72 · 40 · 20 px
const BANDS = [
  { name: 'tablet', query: '(max-width: 1023px)' },
  { name: 'mobile', query: '(max-width: 767px)' },
] as const
/** The drop cap spans three body lines in the heading face (`A25 Post Content Layouts - Spec.md:149`); 1.7 is
 *  `THEME_CSS`'s body line height, which its `calc(var(--drop-cap-ratio) * 1.7em)` multiplies back. */
const DROP_CAP_LINES = 3
const BODY_LINE = 1.7

// one family: a quoted name (its quotes balanced — an open one would swallow the next declaration) or bare words
const FAMILY = String.raw`(?:"[\p{L}\p{N}_ .-]+"|'[\p{L}\p{N}_ .-]+'|[\p{L}\p{N}_-]+(?: [\p{L}\p{N}_-]+)*)`
const FAMILY_LIST_RE = new RegExp(`^${FAMILY}(?:, ?${FAMILY})*$`, 'u')

const ROLES = ['background', 'surface', 'text', 'muted', 'border', 'accent', 'onAccent'] as const
/** One of a mode's seven authored colours. */
export type PackRole = (typeof ROLES)[number]

/** A length a pack's pill radius may be — the one grammar, read by `check` below and by the Style Pack editor's record
 *  schema (Story 6.4, `apps/web/lib/pack-edit.ts`), so the client refuses exactly what the engine refuses. */
const LENGTH_RE = /^(0|\d+(\.\d+)?(px|rem|em|%))$/
export const isLength = (v: unknown): v is string => typeof v === 'string' && LENGTH_RE.test(v)

/** STORY 6.4 — 6.2'S AA SHEET AS ONE LIST: the five role pairs every pack is held to at 4.5:1 in each mode — text and
 *  muted on the background and on the surface, on-accent on the accent. The presets' sheet (`packs.test.ts`) and the
 *  Style Pack editor's live warning (`lib/pack-edit.ts`'s `hardToRead`) both read it, so the two can never check
 *  different pairs. */
export const AA_PAIRS: readonly { readonly fg: PackRole; readonly bg: PackRole }[] = [
  { fg: 'text', bg: 'background' },
  { fg: 'text', bg: 'surface' },
  { fg: 'muted', bg: 'background' },
  { fg: 'muted', bg: 'surface' },
  { fg: 'onAccent', bg: 'accent' },
]

/** Every authored input, refused by name before a value reaches the block. The two free strings are held to what a
 *  declaration can carry, because the block is written into a `<style>`: a family or a radius that could close the
 *  declaration, the rule or the element is refused (Story 6.4 makes packs editable per project). */
function check(pack: Pack): void {
  const isObject = (v: unknown) => typeof v === 'object' && v !== null
  // a stored pack is JSON (Story 6.4): a missing part is refused by name, never by a TypeError
  if (!isObject(pack)) throw new Error('the pack is not an object')
  for (const part of ['light', 'dark', 'fonts'] as const) if (!isObject(pack[part])) throw new Error(`${part}: missing`)
  for (const role of ['heading', 'body'] as const) if (!isObject(pack.fonts[role])) throw new Error(`${role} font: missing`)
  if (typeof pack.fonts.body.tabular !== 'boolean') throw new Error(`body font: tabular ${JSON.stringify(pack.fonts.body.tabular)} is not true or false`)
  for (const mode of ['light', 'dark'] as const) {
    for (const role of ROLES) {
      const v = pack[mode][role]
      if (!isHex(v)) throw new Error(`${mode} ${role}: ${JSON.stringify(v)} is not a #rrggbb colour`)
    }
    const s = pack[mode].scrim
    if (typeof s !== 'number' || !(s >= 0 && s <= 1)) throw new Error(`${mode} scrim: ${JSON.stringify(s)} is not a strength from 0 to 1`)
  }
  for (const row of Object.keys(SCALES) as (keyof typeof SCALES)[]) {
    const steps = Object.keys(SCALES[row])
    if (!steps.includes(pack[row])) throw new Error(`${row}: ${JSON.stringify(pack[row])} is not a step — ${steps.join(' · ')}`)
  }
  if (!isLength(pack.pillRadius)) throw new Error(`pillRadius: ${JSON.stringify(pack.pillRadius)} is not a length`)
  for (const role of ['heading', 'body'] as const) {
    const { family, capHeight } = pack.fonts[role]
    if (typeof family !== 'string' || !FAMILY_LIST_RE.test(family)) throw new Error(`${role} font: ${JSON.stringify(family)} is not a font-family list`)
    if (typeof capHeight !== 'number' || !(capHeight > 0 && capHeight < 1)) throw new Error(`${role} font: cap height ${JSON.stringify(capHeight)} is not a fraction of the em`)
  }
}

/** The error red, stepped to 4.5:1 on the background and then on the surface. Two grounds that straddle mid-grey step in
 *  opposite directions, and the second step can undo the first; there no colour reads on both, so the red gives way to
 *  whichever of black and white reads better on its worse ground. */
function negative(m: PackMode): string {
  const worst = (c: string) => Math.min(contrast(c, m.background), contrast(c, m.surface))
  const red = stepToContrast(stepToContrast(ERROR_RED, m.background, 4.5), m.surface, 4.5)
  if (worst(red) >= 4.5) return red
  return worst('#000000') >= worst('#FFFFFF') ? '#000000' : '#FFFFFF'
}

/** The properties a MODE decides — every colour and everything drawn in one: the palette, the contrast ground and its
 *  words, the hover, plate, elevation and negative, the border fade, scrim and shadow, the link and the button's
 *  colours. These, and only these, are redeclared in the dark blocks. */
function modeTokens(pack: Pack, mode: 'light' | 'dark'): Record<string, string> {
  const m = pack[mode]
  const ground = m.text
  // halfway from whichever ground the border sits nearer, toward the border — the specs make the plate the hover fill
  // (`A18 Post Lists - Spec.md:266`)
  const near = contrast(m.background, m.border) <= contrast(m.surface, m.border) ? m.background : m.surface
  const hover = mix(near, m.border, 0.5)
  const button = SCALES.buttons[pack.buttons](m)
  const shadow = SCALES.shadow[pack.shadow]
  const [linkColor, linkDecoration] = SCALES.links[pack.links](m)
  return {
    '--bg-page': m.background,
    '--bg-surface': m.surface,
    '--text-body': m.text,
    '--text-muted': m.muted,
    '--border-hairline': m.border,
    '--accent': m.accent,
    '--text-on-accent': m.onAccent,
    '--border-fade': rgba(m.text, mode === 'light' ? 0.08 : 0.1),
    '--bg-contrast': ground,
    // a weak authored text/background pair must not make the band's words unreadable: the better of the two, stepped
    '--text-on-contrast': stepToContrast(contrast(m.background, ground) >= contrast(m.text, ground) ? m.background : m.text, ground, 4.5),
    '--accent-on-contrast': stepToContrast(m.accent, ground, 4.5),
    // light lifts with its shadow; dark lifts by a step toward the border
    '--bg-elevated': mode === 'light' ? m.surface : mix(m.surface, m.border, 0.5),
    '--bg-hover': hover,
    '--negative': negative(m),
    '--plate': hover,
    '--scrim': rgba(darker(m.text, m.background), m.scrim),
    '--button-fill': button.fill,
    '--button-border': button.border,
    '--button-text': button.text,
    '--shadow-card': mode === 'dark' || shadow === null ? 'none' : `${shadow[0]} ${rgba(m.text, shadow[1])}`,
    '--link-color': linkColor,
    '--link-decoration': linkDecoration,
  }
}

/** The properties a WIDTH decides, per band — the page margin and the section paddings. */
function bandTokens(pack: Pack, band: number): Record<string, string> {
  const d = SCALES.density[pack.density]
  return {
    '--site-margin': PAGE_MARGIN[band] as string,
    '--space-section': d.section[band] as string,
    '--space-section-compact': d.compact[band] as string,
    '--space-section-spacious': d.spacious[band] as string,
  }
}

/** In the contract's order, and every property exactly once — a value the engine forgot is a thrown error, never a
 *  declaration silently missing from one mode. */
function ordered(values: Record<string, string>): Record<string, string> {
  const missing = TOKEN_NAMES.filter((n) => !Object.hasOwn(values, n))
  const extra = Object.keys(values).filter((n) => !TOKEN_NAMES.includes(n))
  if (missing.length + extra.length > 0) throw new Error(`the engine and TOKEN_ROWS disagree — missing ${missing.join(', ') || 'none'}, extra ${extra.join(', ') || 'none'}`)
  return Object.fromEntries(TOKEN_NAMES.map((n) => [n, values[n] as string]))
}

/** THE ENGINE. A pack's authored inputs in; every property of the contract out. `light` and `dark` are COMPLETE — a
 *  shared value in both — so a reader of either finds every property; `tablet` and `mobile` carry the width-band
 *  values of the responsive properties alone. */
export function packTokens(pack: Pack): {
  light: Record<string, string>
  dark: Record<string, string>
  tablet: Record<string, string>
  mobile: Record<string, string>
} {
  check(pack)
  const { heading, body } = pack.fonts
  const radius = SCALES.radius[pack.radius]
  const d = SCALES.density[pack.density]
  const shared: Record<string, string> = {
    '--figures-tabular': body.tabular ? '"tnum" 1' : 'normal',
    // the heading-face initial spans three body lines: (lines − 1) × line height + the body's cap, in heading caps
    '--drop-cap-ratio': String(Math.round((((DROP_CAP_LINES - 1) * BODY_LINE + body.capHeight) / heading.capHeight / BODY_LINE) * 1000) / 1000),
    '--radius-pill': pack.pillRadius,
    '--font-heading': heading.family,
    '--font-body': body.family,
    '--radius-card': radius,
    '--radius-control': radius,
    '--space-gap': d.gap[0] as string,
    '--site-width': SCALES.width[pack.width],
    '--space-gutter': SCALES.gutters[pack.gutters],
    '--button-radius': pack.buttons === 'pill' ? pack.pillRadius : radius,
    '--tag-accent': 'var(--border-hairline)',
    ...bandTokens(pack, 0),
  }
  return {
    light: ordered({ ...shared, ...modeTokens(pack, 'light') }),
    dark: ordered({ ...shared, ...modeTokens(pack, 'dark') }),
    tablet: bandTokens(pack, 1),
    mobile: bandTokens(pack, 2),
  }
}

const block = (selector: string, values: Readonly<Record<string, string>>) =>
  `${selector} {\n${Object.entries(values)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}`
const indent = (css: string) => css.split('\n').map((l) => `  ${l}`).join('\n')

/** FR-E1's LINK STYLE, APPLIED (R-173, the owner, 2026-09-21: "Fix it inside this story now"). R-112 gave the two link
 *  tokens their values and nothing read them, so a link a customer typed into a section's text with P0-1's toolbar
 *  drew the browser's default blue — on the canvas, and in any theme built from these sections.
 *
 *  A PLAIN LINK — an `<a>` with no class, which is every link the `a` mark writes (`marks.ts`'s `openTag`) and each
 *  link of the navigation partial `core.ts` builds (A1-1 styles those itself), and never one a design authors (every
 *  design anchor carries its class) — takes the pack's link colour and decoration. AT ZERO SPECIFICITY (`:where`), so
 *  a design that draws its own links keeps them with any selector at all (A4-13's `.a4-13__sub a`), and Epic 6's
 *  packs restyle every link by changing two tokens.
 *
 *  DOCUMENT-WIDE, A POST'S BODY INCLUDED (R-229, owner, 2026-10-03, Story 6.1's Question 1): one link look on the whole
 *  site, so a plain link `{{content}}` prints takes it too. Ghost's own card links all carry a class and keep Ghost's
 *  look. `tokens.test.ts` refuses a selector here that scopes the rule out of a post (a `:not(…)` of its own, or one
 *  naming `.gh-content`), so a later narrowing cannot land unnoticed.
 *
 *  AND NEVER INVISIBLE: on a ground a section recolours — contrast, accent, image — the page-ground link colour would
 *  be the wrong ink (Paper's ink link on its ink contrast ground), so there the words keep the ground's own text
 *  colour, which the section already set, and the underline takes the contrast accent on contrast and the words' own
 *  colour elsewhere. `data-bg` is the one attribute both emitters stamp on every section root for its Background role
 *  (the BACKGROUND_ROLES vocabulary), and the only ground this rule can see: a design drawn on a ground of its own
 *  locks the role there or writes its own link rule (`docs/section-authoring.md`). There the words ARE the ground's
 *  words, so the underline is the link's only sign (WCAG 1.4.1) and is forced, whatever `--link-decoration` a pack sets
 *  (DW-224). A plain link is also `class=""`, which `:not([class])` alone lets escape. No mode is named: the tokens
 *  carry it (AD-30). */
export const LINK_RULES = [
  ':where(a:not([class]), a[class=""]) { color: var(--link-color); text-decoration: var(--link-decoration); text-underline-offset: 0.15em; }',
  ':where([data-bg="contrast"], [data-bg="accent"], [data-bg="image"]) :where(a:not([class]), a[class=""]) { color: inherit; text-decoration-line: underline; text-decoration-color: currentcolor; }',
  ':where([data-bg="contrast"]) :where(a:not([class]), a[class=""]) { text-decoration-color: var(--accent-on-contrast); }',
].join('\n')

/** A pack's token block — the only way a pack is emitted, so every block ends with R-173's link rule. `:root` declares
 *  every property (desktop values, light colours); the dark blocks redeclare the per-mode properties and nothing else,
 *  because a dark block (0,2,0) redeclaring a width value would beat the width band's `:root` (0,1,0) in dark; then the
 *  two width bands, each with the responsive properties alone; then the link rule.
 *
 *  FR-E4 owns mode RESOLUTION in Epic 6: the two dark blocks here are the minimum that makes both modes reachable on
 *  the canvas — system preference, and an explicit `data-mode`, which FR-E4 defines as the VISITOR's override written
 *  by the `mode-toggle` module; the canvas reuses that same attribute to preview a mode, deliberately, so no fourth
 *  mode signal exists. FR-E4's other input, the owner's server-rendered `scheme-*` body class, is Story 6.5's to add.
 *  AD-30: the token block is one of the only two files in a generated theme that may mention a mode. */
export function packTokensCss(pack: Pack): string {
  const { light, tablet, mobile } = packTokens(pack)
  const dark = modeTokens(pack, 'dark')
  const perMode = Object.fromEntries(TOKEN_NAMES.filter((n) => Object.hasOwn(dark, n)).map((n) => [n, dark[n] as string]))
  const bands = { tablet, mobile }
  return [
    block(':root', light),
    `@media (prefers-color-scheme: dark) {\n${indent(block(':root:not([data-mode="light"])', perMode))}\n}`,
    block(':root[data-mode="dark"]', perMode),
    ...BANDS.map((b) => `@media ${b.query} {\n${indent(block(':root', bands[b.name]))}\n}`),
    `/* FR-E1 · link style, applied: a plain link reads the two link tokens (R-112, R-173), a post's body included (R-229) */\n${LINK_RULES}`,
    '',
  ].join('\n\n')
}
