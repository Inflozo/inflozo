// The registry entry format (FR-G3), and the assembly that produces one.
//
// The sentence this file exists to make true, and which is absent from every planning document:
// **a registry entry is ASSEMBLED, never authored.** It comes from the design's directory path
// (identity), its `design.json`, its category's `content.json` and the four files. AD-2's
// `design.json` field list and FR-G3's entry list are therefore DIFFERENT SETS, and reading one
// as the other is the mistake this module removes.

import type { BindingContext } from './vocabulary.ts'

/** One control. The order of `controlSchema` is load-bearing: `quickControls[]` is its first 3–5. */
export type ControlDef = {
  /** kebab-case; writes `data-{name}` on the section root (AD-3) */
  name: string
  /** Appendix C's closed vocabulary — 4.5 owns the engine, this story only needs the shape */
  type: string
  /** the closed value set; there is no free text, no unit and no hex at section level */
  values: string[]
  default: string
  /** FR-F7 / R-33: another control disables this one, and the declaration carries the reason */
  disabledBy?: { control: string; whenValue: string; reason: string }
  /** FR-D7 / FR-F5: this control accepts a second value in dark mode */
  darkOverride?: boolean
}

/** One content prop, in the CATEGORY's union. R-102: the union is the widest a prop ever reaches. */
export type PropDef = {
  type: 'text' | 'richtext' | 'url' | 'image' | 'array'
  /** the authored default — what the section says before the customer types anything */
  default?: unknown
  /** AD-4's per-prop mark allow-list. `richtext` only. */
  marks?: string[]
  /** R-27: exactly which inline binding tokens this prop accepts. Anything else stays literal. */
  tokens?: string[]
}

/** One `content.json`, per CATEGORY. `props` is FLAT and keyed by dotted path — `cta.url`,
 *  `items[].label` — so a prop inside a repeat resolves with no tree walk. */
export type CategoryContent = {
  category: string
  props: Record<string, PropDef>
}

/** One `{{#get}}`, declared by key in `design.json` and referenced from the markup by that key.
 *  Declared here rather than written into an attribute, so AD-36's "validated, never interpolated"
 *  holds BY CONSTRUCTION: there is no place in the markup where a filter could be composed. */
export type DataBinding = {
  source: string
  filter?: string
  limit?: number
  order?: string
}

/** `design.json` — what an AUTHOR writes. Not the registry entry. */
export type DesignJson = {
  /** the design's own number within its category; identity is `{categoryId}/{n}` from the path */
  name: string
  tier: 'free' | 'pro'
  /** sets, not scalars: `sections-inventory.md` already declares them as sets in normative prose,
   *  and FR-D12/D13 filter by intersection, which a set answers and a scalar cannot */
  bindingContext: BindingContext[]
  compileTarget: string[]
  controlSchema: ControlDef[]
  ghostCompat: { minVersion: string; helpers: string[]; deprecatedAt?: string }
  darkCapabilities: string[]
  previewSeed: string
  /** FR-G5's machine-checkable structural descriptor tuple; no two designs in a category share one */
  descriptor: {
    archetype: string
    containment: string
    ground: string
    itemCount: string
    mediaPlacement: string
    /** the one free-prose slot — no machine reads it */
    emphasis: string
  }
  dataBindings?: Record<string, DataBinding>
  /** AD-35: a pilot authored before its owning category's gate. Its snapshot changes exactly once. */
  provisional?: boolean
  /** FR-G3 recovers this MECHANICALLY. Present in a `design.json` it is a validation failure. */
  quickControls?: never
}

/** FR-G3's entry, assembled. */
export type SectionRegistryEntry = {
  /** `{categoryId}/{n}`, stable forever (AD-2) */
  id: string
  category: string
  name: string
  tier: 'free' | 'pro'
  bindingContext: BindingContext[]
  compileTarget: string[]
  /** the CATEGORY's union (FR-G3) */
  contentSchema: Record<string, PropDef>
  /** per design (FR-F7) */
  controlSchema: ControlDef[]
  /** per design, recovered — never authored */
  quickControls: string[]
  html: string
  css: string
  js?: string
  dataBindings?: Record<string, DataBinding>
  ghostCompat: { minVersion: string; helpers: string[]; deprecatedAt?: string }
  darkCapabilities: string[]
  previewSeed: string
  provisional?: boolean
}

/** FR-G3: "the first 3–5 entries of a DESIGN's own control list, in order, ARE its Quick Controls".
 *  Read from the design level, never from the category union — the union is the storage domain
 *  FR-D19 parks against, not a sidebar. The three universal controls never appear here, and they
 *  never appear in a `controlSchema` either, so no filtering is needed. */
export function recoverQuickControls(controlSchema: readonly ControlDef[]): string[] {
  return controlSchema.slice(0, 5).map((c) => c.name)
}

/** `packages/library/designs/a4/2` → `{ category: 'a4', n: '2' }`. Identity comes from the path,
 *  which is why no design.json carries an id to disagree with it (AD-2, AD-34's `{categoryId}/{n}`). */
export function parseDesignDir(dir: string): { category: string; n: string } | null {
  const parts = dir.replace(/\/+$/, '').split('/')
  const n = parts.pop()
  const category = parts.pop()
  if (!category || !n || !/^[a-z][a-z0-9]*$/.test(category) || !/^[1-9][0-9]*$/.test(n)) return null
  return { category, n }
}

export type AssembleInput = {
  /** the design's directory, ending `{category}/{n}` */
  dir: string
  design: DesignJson
  content: CategoryContent
  html: string
  css: string
  js?: string
}

/** The whole of "a registry entry is assembled". Nothing here is authored twice: `contentSchema`
 *  is the category's `content.json`, `controlSchema` is the design's own list, and `quickControls`
 *  is recovered from that list — so the two documents cannot drift. */
export function assembleEntry(input: AssembleInput): SectionRegistryEntry | string {
  const ident = parseDesignDir(input.dir)
  if (ident === null) return `"${input.dir}" is not a design directory — identity is {categoryId}/{n}`
  if (ident.category !== input.content.category) {
    return `design ${ident.category}/${ident.n} was handed ${input.content.category}'s content.json — a content prop never crosses a category boundary (R-102)`
  }
  const d = input.design
  const entry: SectionRegistryEntry = {
    id: `${ident.category}/${ident.n}`,
    category: ident.category,
    name: d.name,
    tier: d.tier,
    bindingContext: d.bindingContext,
    compileTarget: d.compileTarget,
    contentSchema: input.content.props,
    controlSchema: d.controlSchema,
    quickControls: recoverQuickControls(d.controlSchema),
    html: input.html,
    css: input.css,
    ghostCompat: d.ghostCompat,
    darkCapabilities: d.darkCapabilities,
    previewSeed: d.previewSeed,
  }
  if (input.js !== undefined) entry.js = input.js
  if (d.dataBindings !== undefined) entry.dataBindings = d.dataBindings
  if (d.provisional !== undefined) entry.provisional = d.provisional
  return entry
}
