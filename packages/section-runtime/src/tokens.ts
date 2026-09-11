// The reference token set — the full custom-property contract at ONE set of values.
//
// Why it ships with the runtime and not with Epic 6's packs: a design's CSS consumes pack custom
// properties EXCLUSIVELY (`var(--…)` only, AD-2), so without a token block nothing resolves and the
// canvas renders blank — three epics before any pack exists (step-6 stress finding F2). Epic 6
// replaces these VALUES with the twelve authored packs and **does not change the contract**.
//
// The contract is the data below; `reference-tokens.css` is the stylesheet emitted from it, and
// `tools/stress/test-vocabulary.mjs` reads the bytes of both and fails on any drift — the same split
// the reference markup already uses (a test in a core package cannot read a file: AD-1 bans
// `node:fs` there, and the test-file exemption gives back only `node:test` and `node:assert`).
//
// Every row below names the FR-E1 or Appendix D.0 line it exists for. D.0 is normative about which
// are AUTHORED by a pack and which are COMPUTED from what the pack declared; both are properties a
// design may read, so both are in the contract.

/** FR-E1's rows, as the property names each resolves to. A pack answers the row; the library reads
 *  the property. Nothing outside this map may appear in a design's `var(--…)` without a fallback. */
export const TOKEN_ROWS: Readonly<Record<string, readonly string[]>> = {
  // ── FR-E1: the palette a pack AUTHORS, hand-paired per mode ────────────────
  'palette · background': ['--bg-page'],
  'palette · surface': ['--bg-surface'],
  'palette · text': ['--text-body'],
  'palette · muted text': ['--text-muted'],
  'palette · border': ['--border-hairline', '--border-fade'],
  'palette · accent': ['--accent'],
  'palette · on-accent': ['--text-on-accent'],

  // ── Appendix D.0: COMPUTED from what the pack already declared ─────────────
  'D.0 · contrast ground': ['--bg-contrast'],
  'D.0 · on-contrast text': ['--text-on-contrast'],
  'D.0 · accent-on-contrast': ['--accent-on-contrast'],
  'D.0 · dark elevation': ['--bg-elevated'],
  'D.0 · dark hover-surface': ['--bg-hover'],
  'D.0 · negative': ['--negative'],
  'D.0 · plate': ['--plate'],
  'D.0 · tabular figures': ['--figures-tabular'],
  'D.0 · drop-cap ratio': ['--drop-cap-ratio'],

  // ── Appendix D.0: AUTHORED, the two genuine judgements per pack ────────────
  'D.0 · scrim strength': ['--scrim'],
  'D.0 · pill radius': ['--radius-pill'],

  // ── FR-E1: the rest of the pack's own rows ─────────────────────────────────
  'FR-E1 · heading font + body font': ['--font-heading', '--font-body'],
  'FR-E1 · radius scale': ['--radius-card', '--radius-control'],
  'FR-E1 · spacing density': [
    '--space-section',
    '--space-section-compact',
    '--space-section-spacious',
    '--space-gap',
  ],
  'FR-E1 · site width + gutters': ['--site-width', '--space-gutter'],
  'FR-E1 · button style': ['--button-fill', '--button-border', '--button-radius'],
  'FR-E1 · shadow level': ['--shadow-card'],
  'FR-E1 · link style': ['--link-color', '--link-decoration'],

  // ── AD-3's carve-out: the ONE value a stylesheet cannot know when it is authored. `data-bind-style`
  //    sets it per element from Ghost; the root default is what an unbound tag reads.
  'AD-3 · bound tag accent': ['--tag-accent'],
}

/** Every property in the contract, derived from the rows — never a second list (standing rule 4). */
export const TOKEN_NAMES: readonly string[] = Object.values(TOKEN_ROWS).flat()

/** Light is the base. Dark redeclares the same property SET — never a subset, or a design reading a
 *  missing one resolves to nothing in exactly one mode, which is the failure this contract exists
 *  to make impossible. `tokens.test.ts` asserts the two sets are equal. */
export const REFERENCE_TOKENS: Readonly<{
  light: Readonly<Record<string, string>>
  dark: Readonly<Record<string, string>>
}> = {
  light: {
    '--bg-page': '#fbfaf7',
    '--bg-surface': '#ffffff',
    '--text-body': '#1c1a17',
    '--text-muted': '#6b655c',
    '--border-hairline': '#e3ded4',
    '--border-fade': 'rgba(28, 26, 23, 0.08)',
    '--accent': '#8a3b12',
    '--text-on-accent': '#fffaf5',
    '--bg-contrast': '#1c1a17',
    '--text-on-contrast': '#f6f2ea',
    '--accent-on-contrast': '#e8a87c',
    '--bg-elevated': '#ffffff',
    '--bg-hover': '#f3efe7',
    '--negative': '#a3231b',
    '--plate': '#f6f2ea',
    '--figures-tabular': '"tnum" 1',
    '--drop-cap-ratio': '3',
    '--scrim': 'rgba(28, 26, 23, 0.45)',
    '--radius-pill': '999px',
    '--font-heading': "'Fraunces', Georgia, serif",
    '--font-body': "'Inter', system-ui, sans-serif",
    '--radius-card': '10px',
    '--radius-control': '6px',
    '--space-section': '4.5rem',
    '--space-section-compact': '2.5rem',
    '--space-section-spacious': '7rem',
    '--space-gap': '1.5rem',
    '--site-width': '72rem',
    '--space-gutter': '1.5rem',
    '--button-fill': '#8a3b12',
    '--button-border': '1px solid transparent',
    '--button-radius': '6px',
    '--shadow-card': '0 1px 2px rgba(28, 26, 23, 0.06), 0 8px 24px rgba(28, 26, 23, 0.06)',
    '--link-color': '#8a3b12',
    '--link-decoration': 'underline',
    '--tag-accent': 'var(--border-hairline)',
  },
  dark: {
    '--bg-page': '#14120f',
    '--bg-surface': '#1c1a17',
    '--text-body': '#f0ebe2',
    '--text-muted': '#a49c90',
    '--border-hairline': '#332f29',
    '--border-fade': 'rgba(240, 235, 226, 0.10)',
    '--accent': '#e8a87c',
    '--text-on-accent': '#231107',
    '--bg-contrast': '#f6f2ea',
    '--text-on-contrast': '#1c1a17',
    '--accent-on-contrast': '#8a3b12',
    '--bg-elevated': '#252220',
    '--bg-hover': '#2d2926',
    '--negative': '#e4736a',
    '--plate': '#211e1b',
    '--figures-tabular': '"tnum" 1',
    '--drop-cap-ratio': '3',
    '--scrim': 'rgba(10, 9, 8, 0.6)',
    '--radius-pill': '999px',
    '--font-heading': "'Fraunces', Georgia, serif",
    '--font-body': "'Inter', system-ui, sans-serif",
    '--radius-card': '10px',
    '--radius-control': '6px',
    '--space-section': '4.5rem',
    '--space-section-compact': '2.5rem',
    '--space-section-spacious': '7rem',
    '--space-gap': '1.5rem',
    '--site-width': '72rem',
    '--space-gutter': '1.5rem',
    '--button-fill': '#e8a87c',
    '--button-border': '1px solid transparent',
    '--button-radius': '6px',
    '--shadow-card': '0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.45)',
    '--link-color': '#e8a87c',
    '--link-decoration': 'underline',
    '--tag-accent': 'var(--border-hairline)',
  },
}

const block = (selector: string, values: Readonly<Record<string, string>>) =>
  `${selector} {\n${Object.entries(values)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}`

/** The stylesheet, emitted from the contract. FR-E4 owns mode RESOLUTION in Epic 6; the three
 *  blocks here are the minimum that makes both modes reachable on the canvas — system preference,
 *  and an explicit `data-mode`, which FR-E4 defines as the VISITOR's override written by the
 *  `mode-toggle` module; the canvas reuses that same attribute to preview a mode, deliberately, so
 *  no fourth mode signal exists. FR-E4's other input, the owner's server-rendered `scheme-*` body
 *  class, is Epic 6's to add to this block. AD-30: the token
 *  block is one of the only two files in a generated theme that may mention a mode. */
export function referenceTokensCss(): string {
  return [
    '/* GENERATED from packages/section-runtime/src/tokens.ts — edit the contract, not this file.\n' +
      '   tools/stress/test-vocabulary.mjs fails if the two drift. */',
    block(':root', REFERENCE_TOKENS.light),
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-mode="light"])', REFERENCE_TOKENS.dark)
      .split('\n')
      .map((l) => `  ${l}`)
      .join('\n')}\n}`,
    block(':root[data-mode="dark"]', REFERENCE_TOKENS.dark),
    '',
  ].join('\n\n')
}
