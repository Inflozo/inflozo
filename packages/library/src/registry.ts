// The registry entry format (FR-G3), and the assembly that produces one.
//
// The sentence this file exists to make true, and which is absent from every planning document:
// **a registry entry is ASSEMBLED, never authored.** It comes from the design's directory path
// (identity), its `design.json`, its category's `content.json` and its markup and stylesheet. AD-2's
// `design.json` field list and FR-G3's entry list are therefore DIFFERENT SETS, and reading one
// as the other is the mistake this module removes.

import type { BindingContext, ControlGroup, ControlType, PropType, SidebarGroup } from './vocabulary.ts'
import { MODULES, parseModuleDeclaration } from './modules.ts'
import { scanTags } from './validate.ts' // validate.ts imports only TYPES from here, so this edge is not a runtime cycle

/** One control. The order of `controlSchema` is load-bearing: `quickControls[]` is its first 3–5. */
export type ControlDef = {
  /** kebab-case; writes `data-{name}` on the section root (AD-3) */
  name: string
  /** Appendix C's closed vocabulary (`CONTROL_TYPES`) — what the panel draws and what grammar the values obey */
  type: ControlType
  /** the row title the panel prints — words, never a unit or a CSS concept (FR-F2) */
  label: string
  /** which accordion it sits in when it is not a Quick Control (FR-F3) */
  group: ControlGroup
  /** the closed value set; there is no free text, no unit and no hex at section level */
  values: string[]
  /** the words the panel prints for each value, when a value is not already its own word ("start" → "Left") */
  valueLabels?: Record<string, string>
  default: string
  /** FR-F7 / R-33: another control disables this one, and the declaration carries the reason and
   *  the value that renders while it is greyed — one of this control's own values */
  disabledBy?: { control: string; whenValue: string; reason: string; inForce: string }
  /** FR-D7 / FR-F5: this control accepts a second value in dark mode */
  darkOverride?: boolean
}

/** A design narrowing one universal control (R-23): the values it offers, the default when the
 *  universal's own is not among them, and the sentence the panel prints. An EMPTY `values` is R-103's
 *  no-value lock — a design whose look is what is behind it: the row is locked with nothing marked
 *  and the root carries no attribute for it. */
export type UniversalNarrowing = { values: string[]; default?: string; reason: string }

/** A control this design could NEVER use, and the one note the panel prints where it would have been
 *  (P0-0's never-offered case, `P0 Editor Primitives - Spec.md:67-68`). */
export type AbsentNote = { group: SidebarGroup; note: string }

/** One destination, shared by a `url` prop and an `a` mark (AD-4, FR-F6). Exactly one of `href`,
 *  `portal` and `search` is the destination; `ref` is the internal resource it was picked from, kept
 *  for Epic 7's compile-time re-validation. `newTab` and `rel` are part of the STORED record. A bare
 *  string in a `url` prop is `{ href }`. `marks.ts`'s `linkAttributes` is the one function that turns
 *  a record into attributes. */
export type Link = {
  href?: string
  portal?: string
  search?: boolean
  ref?: { kind: string; id: string }
  newTab?: boolean
  rel?: readonly string[]
}

/** One path node of a vendored icon drawing — Tabler's own `[tag, attributes]` shape. */
export type IconNode = readonly [string, Readonly<Record<string, string>>]

/** The icon set, handed to whoever draws one. `@inflozo/library/icons` exports the real lookup; the
 *  runtime is HANDED it and never imports the drawings (R-104's whole set is megabytes). A key ending
 *  `-filled` asks for the filled drawing. */
export type IconLookup = (name: string) => readonly IconNode[] | undefined

/** One content prop, in the CATEGORY's union. R-102: the union is the widest a prop ever reaches. */
export type PropDef = {
  /** which content editor edits it (`PROP_TYPES`) */
  type: PropType
  /** the field title the panel prints */
  label: string
  /** the authored default — what the section says before the customer types anything. On an
   *  `array` it is the starting items; on an item prop (`items[].label`) it is what a NEW item says. */
  default?: unknown
  /** AD-4's per-prop mark allow-list. `richtext` only. */
  marks?: string[]
  /** R-27: exactly which inline binding tokens this prop accepts. Anything else stays literal. */
  tokens?: string[]
  /** `array` only: the floor and the ceiling, each with the sentence the panel prints at it (R-12) */
  min?: number
  max?: number
  atMin?: string
  atMax?: string
  /** `array` only: what one item is called — "Add feature", "Move: …" */
  item?: string
  /** Story 4.9 (S6) — `text` only, and never beside `default`: a prop-marked catalog key whose string is this
   *  prop's initial value. While the value is empty the theme emits `{{t "key"}}` and the canvas the handed
   *  string; the moment the customer types, the value is user text. */
  catalog?: string
}

/** One `content.json`, per CATEGORY, at `designs/{category}/content.json` — beside the design
 *  directories it is the union for. `props` is FLAT and keyed by dotted path — `cta.url`,
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
  /** R-20's hand-picked order: N single-id gets, in this order, no cap (the panel warns past 25 —
   *  that is Story 5.19's Source panel, not this validator). Exclusive with `filter`, `limit` and `order`. */
  ids?: string[]
  /** R-108 (Story 4.10): the DESIGN fixes this query — a hero that always shows exactly one post. The panel offers
   *  no Show and no Order for it, and a stored Count or Order is never folded in (`withData`), exactly as for a
   *  hand-picked `ids` query. Only `true`, never beside `ids`, and only with both `limit` and `order` declared. */
  fixed?: true
}

/** `design.json` — what an AUTHOR writes. Not the registry entry. */
export type DesignJson = {
  /** the display name — "Three-up cards". Identity is `{categoryId}/{n}`, from the path, never here */
  name: string
  tier: 'free' | 'pro'
  /** sets, not scalars: `sections-inventory.md` already declares them as sets in normative prose,
   *  and FR-D12/D13 filter by intersection, which a set answers and a scalar cannot */
  bindingContext: BindingContext[]
  compileTarget: string[]
  controlSchema: ControlDef[]
  /** R-23: the universal controls this design narrows, by name. Omitted, a universal offers every value. */
  universals?: Record<string, UniversalNarrowing>
  /** P0-0: the controls this design could never use, each with its note */
  absent?: AbsentNote[]
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
  /** per design — the universal narrowings, `{}` when there are none */
  universals: Record<string, UniversalNarrowing>
  /** per design — the never-offered notes, `[]` when there are none */
  absent: AbsentNote[]
  /** per design, recovered — never authored */
  quickControls: string[]
  html: string
  css: string
  /** FR-G3's `js?`: the registry modules the markup declares with `data-module`, in registry order —
   *  recovered, never authored, and omitted when the markup declares none (Story 4.7). A design ships no
   *  script of its own; FR-G7 lets it run registry code only. */
  js?: string[]
  dataBindings?: Record<string, DataBinding>
  ghostCompat: { minVersion: string; helpers: string[]; deprecatedAt?: string }
  darkCapabilities: string[]
  previewSeed: string
  /** FR-G5's tuple — carried so the "no two designs in a category share one" assertion has
   *  something in the registry to read (review 1) */
  descriptor: DesignJson['descriptor']
  provisional?: boolean
}

/** FR-G3: "the first 3–5 entries of a DESIGN's own control list, in order, ARE its Quick Controls".
 *  Read from the design level, never from the category union — the union is the storage domain
 *  FR-D19 parks against, not a sidebar. The three universal controls never appear here, and they
 *  never appear in a `controlSchema` either, so no filtering is needed. A design that declares
 *  fewer than three controls has fewer Quick Controls — FR-F3 says designs legitimately expose
 *  different controls, and a floor would invent a rule (review 1, routine call). */
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
}

/** The whole of "a registry entry is assembled". Nothing here is authored twice: `contentSchema`
 *  is the category's `content.json`, `controlSchema` is the design's own list, `quickControls`
 *  is recovered from that list, and `js` from the markup's `data-module` names — so no two documents
 *  can drift. */
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
    universals: d.universals ?? {},
    absent: d.absent ?? [],
    quickControls: recoverQuickControls(d.controlSchema),
    html: input.html,
    css: input.css,
    ghostCompat: d.ghostCompat,
    darkCapabilities: d.darkCapabilities,
    previewSeed: d.previewSeed,
    descriptor: d.descriptor,
  }
  const declared = new Set<string>()
  for (const tag of scanTags(input.html)) {
    for (const [k, v] of tag.attrs) {
      if (k.toLowerCase() !== 'data-module') continue
      const d = parseModuleDeclaration(v)
      if (typeof d === 'string') return `design ${entry.id}: ${d}`
      declared.add(d.name)
    }
  }
  if (declared.size > 0) entry.js = MODULES.filter((m) => declared.has(m.name)).map((m) => m.name)
  if (d.dataBindings !== undefined) entry.dataBindings = d.dataBindings
  if (d.provisional !== undefined) entry.provisional = d.provisional
  return entry
}

/** FR-F7: one control schema per design and ONE union per category, generated from the designs'
 *  own lists — never authored. R-53: one control name means one set of values library-wide, so a name
 *  carrying two value sets is refused, naming both designs, rather than unioned into a third. The
 *  first declaration of each name wins its place in the union's order. Value sets compare as ordered
 *  lists: a stepper's order is its meaning. */
export function categoryControlUnion(
  designs: readonly { id: string; controlSchema: readonly ControlDef[] }[],
): ControlDef[] | string {
  const union = new Map<string, { def: ControlDef; id: string }>()
  for (const d of designs) {
    for (const c of d.controlSchema) {
      const seen = union.get(c.name)
      if (seen === undefined) {
        union.set(c.name, { def: c, id: d.id })
      } else if (seen.def.type !== c.type) {
        return `control "${c.name}" is a ${seen.def.type} in ${seen.id} and a ${c.type} in ${d.id}. One name means one control (R-53); where two designs genuinely differ, they differ by name.`
      } else if (seen.def.values.join('\u0000') !== c.values.join('\u0000')) {
        return `control "${c.name}" carries two value sets — ${seen.id} offers ${seen.def.values.join(' · ')} and ${d.id} offers ${c.values.join(' · ')}. One name means one set of values (R-53); where two designs genuinely differ, they differ by name.`
      }
    }
  }
  return [...union.values()].map((u) => u.def)
}
