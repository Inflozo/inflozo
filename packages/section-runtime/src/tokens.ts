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

/** Story 4.10 — THE VALUES ARE PAPER'S. Every frame, proof and kit in the design export is drawn in the Paper pack, so
 *  every row its token objects name takes their light and dark values — `_build/a22lib.js:4-9` (`L`, `D`; fonts and
 *  radius from `PACKS.paper`) and `a20-kit.js:8-30`: the palette, the contrast ground and its text, the hover
 *  surface, the two fonts, the radius (card, control and the button's), the shadow, and the accent where the button
 *  fill and the link colour carry it. Every row no Paper object names keeps the value Story 4.2 wrote. Only values
 *  changed (R-74); the contract did not, and Epic 6 still authors every pack against it.
 *
 *  Light is the base. Dark redeclares the same property SET — never a subset, or a design reading a
 *  missing one resolves to nothing in exactly one mode, which is the failure this contract exists
 *  to make impossible. `tokens.test.ts` asserts the two sets are equal. */
export const REFERENCE_TOKENS: Readonly<{
  light: Readonly<Record<string, string>>
  dark: Readonly<Record<string, string>>
}> = {
  light: {
    '--bg-page': '#FBF9F5',
    '--bg-surface': '#FFFFFF',
    '--text-body': '#232019',
    '--text-muted': '#6B6459',
    '--border-hairline': '#EBE5DB',
    '--border-fade': 'rgba(28, 26, 23, 0.08)',
    '--accent': '#D96C3F',
    // R-110 (owner, 2026-09-15): Paper draws white here, 3.4:1 on #D96C3F (axe, Story 4.10); the ink passes at 4.8:1.
    '--text-on-accent': '#232019',
    '--bg-contrast': '#232019',
    '--text-on-contrast': '#FBF9F5',
    '--accent-on-contrast': '#e8a87c',
    '--bg-elevated': '#ffffff',
    '--bg-hover': '#F4F0E8',
    '--negative': '#a3231b',
    '--plate': '#f6f2ea',
    '--figures-tabular': '"tnum" 1',
    '--drop-cap-ratio': '3',
    '--scrim': 'rgba(28, 26, 23, 0.45)',
    '--radius-pill': '999px',
    '--font-heading': 'Georgia, serif',
    '--font-body': "'Inter', sans-serif",
    '--radius-card': '8px',
    '--radius-control': '8px',
    '--space-section': '4.5rem',
    '--space-section-compact': '2.5rem',
    '--space-section-spacious': '7rem',
    '--space-gap': '1.5rem',
    '--site-width': '72rem',
    '--space-gutter': '1.5rem',
    '--button-fill': '#D96C3F',
    '--button-border': '1px solid transparent',
    '--button-radius': '8px',
    '--shadow-card': '0 4px 16px rgba(28, 27, 26, 0.08)',
    // R-112 (owner, 2026-09-15, Story 4.10's Q5): a link in Light is ink words with the accent underline — the
    // export's own hover treatment for a nav item — because the accent on the page ground is 3.24:1 (WCAG AA text is
    // 4.5:1). Dark keeps the accent as words: #E0805A on #171511 is 6.43:1.
    '--link-color': '#232019',
    '--link-decoration': 'underline #D96C3F',
    '--tag-accent': 'var(--border-hairline)',
  },
  dark: {
    '--bg-page': '#171511',
    '--bg-surface': '#211D17',
    '--text-body': '#F2EDE4',
    '--text-muted': '#A79E8F',
    '--border-hairline': '#332E27',
    '--border-fade': 'rgba(240, 235, 226, 0.10)',
    '--accent': '#E0805A',
    '--text-on-accent': '#171511',
    '--bg-contrast': '#EDE7DA',
    '--text-on-contrast': '#171511',
    '--accent-on-contrast': '#8a3b12',
    '--bg-elevated': '#252220',
    '--bg-hover': '#2A251E',
    '--negative': '#e4736a',
    '--plate': '#211e1b',
    '--figures-tabular': '"tnum" 1',
    '--drop-cap-ratio': '3',
    '--scrim': 'rgba(10, 9, 8, 0.6)',
    '--radius-pill': '999px',
    '--font-heading': 'Georgia, serif',
    '--font-body': "'Inter', sans-serif",
    '--radius-card': '8px',
    '--radius-control': '8px',
    '--space-section': '4.5rem',
    '--space-section-compact': '2.5rem',
    '--space-section-spacious': '7rem',
    '--space-gap': '1.5rem',
    '--site-width': '72rem',
    '--space-gutter': '1.5rem',
    '--button-fill': '#E0805A',
    '--button-border': '1px solid transparent',
    '--button-radius': '8px',
    '--shadow-card': 'none',
    '--link-color': '#E0805A',
    '--link-decoration': 'underline',
    '--tag-accent': 'var(--border-hairline)',
  },
}

const block = (selector: string, values: Readonly<Record<string, string>>) =>
  `${selector} {\n${Object.entries(values)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}`

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
 *  AND NEVER INVISIBLE: on a ground a section recolours — contrast, accent, image — the page-ground link colour would
 *  be the wrong ink (Paper's ink link on its ink contrast ground), so there the words keep the ground's own text
 *  colour, which the section already set, and the underline takes the contrast accent on contrast and the words' own
 *  colour elsewhere. `data-bg` is the one attribute both emitters stamp on every section root for its Background role
 *  (the BACKGROUND_ROLES vocabulary), and the only ground this rule can see: a design drawn on a ground of its own
 *  locks the role there or writes its own link rule (`docs/section-authoring.md`). No mode is named: the tokens
 *  carry it (AD-30). */
const LINK_RULES = [
  ':where(a:not([class])) { color: var(--link-color); text-decoration: var(--link-decoration); text-underline-offset: 0.15em; }',
  ':where([data-bg="contrast"], [data-bg="accent"], [data-bg="image"]) :where(a:not([class])) { color: inherit; text-decoration-color: currentcolor; }',
  ':where([data-bg="contrast"]) :where(a:not([class])) { text-decoration-color: var(--accent-on-contrast); }',
].join('\n')

/** The stylesheet, emitted from the contract, with FR-E1's link rule after it. FR-E4 owns mode RESOLUTION in Epic 6;
 *  the three token blocks here are the minimum that makes both modes reachable on the canvas — system preference,
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
    `/* FR-E1 · link style, applied: a plain link reads the two link tokens (R-112, R-173) */\n${LINK_RULES}`,
    '',
  ].join('\n\n')
}
