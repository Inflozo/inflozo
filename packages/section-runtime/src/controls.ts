// The controls engine — FR-F's home in the capability map (`ARCHITECTURE-SPINE.md:622`).
//
// ONE declaration powers the sidebar, the validator and both emitters (FR-F7): a design's
// `controlSchema`, its `universals` narrowing and its `absent` notes, over the vocabulary in
// `@inflozo/library`. Everything a panel shows and everything an emitter stamps is computed HERE from
// that declaration and the instance's stored values, so a greyed control's own stored value, a value
// outside its offered set and an unknown control name cannot reach a canvas root, a theme root or a
// sidebar row — there is no second path for one to take.
//
// Pure (AD-1): plain values in, plain values out. A stored record is DATA from a database, not a
// type, so junk in it is ignored rather than thrown. No clock, no `Intl`, no locale method — the
// sentences a panel prints at a floor or a ceiling come from `content.json`, never from this file.

import { CONTROL_VALUE_RE, SIDEBAR_GROUPS, UNIVERSALS, orbitWeekly, scanTags, valueWords } from '@inflozo/library'
import type {
  AbsentNote, ControlDef, ControlGroup, ControlType, DataBinding, PropDef, PropType, SidebarGroup,
  UniversalNarrowing,
} from '@inflozo/library'

/** What the engine reads of an entry. A `SectionRegistryEntry` satisfies it. */
export type ControlEntry = {
  controlSchema: readonly ControlDef[]
  contentSchema: Readonly<Record<string, PropDef>>
  html: string
  universals?: Readonly<Record<string, UniversalNarrowing>>
  absent?: readonly AbsentNote[]
  dataBindings?: Readonly<Record<string, DataBinding>>
}

/** An instance's slice, as the project doc stores it (`project_templates.doc`): plain values. `data`
 *  holds the Ghost-sourced repeat's Count and Order per `dataBindings` key. */
export type ControlState = {
  content?: Readonly<Record<string, unknown>>
  controls?: Readonly<Record<string, unknown>>
  darkOverrides?: Readonly<Record<string, unknown>>
  data?: Readonly<Record<string, unknown>>
}

const own = (o: unknown, k: string): boolean =>
  typeof o === 'object' && o !== null && Object.prototype.hasOwnProperty.call(o, k)
const read = (o: unknown, k: string): unknown => (own(o, k) ? (o as Record<string, unknown>)[k] : undefined)

// ─── resolution ──────────────────────────────────────────────────────────────

type Declared = {
  name: string
  label: string
  type: ControlType
  group: ControlGroup
  values: readonly string[]
  valueLabels: Readonly<Record<string, string>>
  /** what THIS design offers — a universal's narrowing, or a control's own values */
  offered: readonly string[]
  /** the design's sentence for a narrowed universal */
  narrowed?: string
  default: string | null
  disabledBy?: ControlDef['disabledBy']
  darkOverride: boolean
  universal: boolean
}

type Resolved = { def: Declared; value: string | null; greyed?: string; stored: string | null }

function declared(entry: Pick<ControlEntry, 'controlSchema' | 'universals'>): Declared[] {
  const own_: Declared[] = (entry.controlSchema ?? []).map((c) => ({
    name: c.name, label: c.label, type: c.type, group: c.group, values: c.values, valueLabels: c.valueLabels ?? {},
    offered: c.values, default: c.default, disabledBy: c.disabledBy, darkOverride: c.darkOverride === true, universal: false,
  }))
  const universal: Declared[] = UNIVERSALS.map((u) => {
    const n = read(entry.universals, u.name) as UniversalNarrowing | undefined
    const offered = Array.isArray(n?.values) ? n.values.filter((v) => u.values.includes(v)) : u.values
    const dflt = n?.default !== undefined && offered.includes(n.default) ? n.default
      : offered.includes(u.default) ? u.default : (offered[0] ?? null)
    return {
      name: u.name, label: u.label, type: u.type, group: u.group, values: u.values, valueLabels: u.valueLabels,
      offered, narrowed: n === undefined ? undefined : n.reason, default: dflt, darkOverride: u.darkOverride === true, universal: true,
    }
  })
  return [...own_, ...universal]
}

function resolveAll(entry: Pick<ControlEntry, 'controlSchema' | 'universals'>, stored: unknown): Map<string, Resolved> {
  const defs = declared(entry)
  const out = new Map<string, Resolved>()
  const visiting = new Set<string>()
  const resolve = (d: Declared): Resolved => {
    const done = out.get(d.name)
    if (done !== undefined) return done
    const raw = read(stored, d.name)
    const valid = typeof raw === 'string' && d.offered.includes(raw) ? raw : null
    let r: Resolved = { def: d, value: valid ?? d.default, stored: valid }
    if (d.universal && d.offered.length <= 1) {
      // R-103's no-value lock (nothing offered) or a lock at one value: the whole row, with its sentence
      r = { ...r, value: d.offered[0] ?? null, greyed: d.narrowed }
    } else if (d.disabledBy !== undefined && !visiting.has(d.name)) {
      // ponytail: a cycle is the validator's refusal; here it only must not recurse forever
      visiting.add(d.name)
      const by = defs.find((x) => x.name === d.disabledBy?.control)
      if (by !== undefined && resolve(by).value === d.disabledBy.whenValue && d.values.includes(d.disabledBy.inForce)) {
        r = { ...r, value: d.disabledBy.inForce, greyed: d.disabledBy.reason }
      }
      visiting.delete(d.name)
    }
    out.set(d.name, r)
    return r
  }
  for (const d of defs) resolve(d)
  return out
}

/** Every declared control and universal → its value in force. A greyed control carries the value its
 *  dependency names, never its own stored one; a stored value outside the offered set is the default;
 *  an unknown stored name is nowhere; R-103's no-value lock has NO entry. This is the only thing
 *  either emitter stamps on a root (AD-3). */
export function resolveControls(
  entry: Pick<ControlEntry, 'controlSchema' | 'universals'>,
  stored: unknown = {},
): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [name, r] of resolveAll(entry, stored)) {
    if (r.value !== null && CONTROL_VALUE_RE.test(r.value)) values[name] = r.value
  }
  return values
}

// ─── the mode, and the slice it resolves from ────────────────────────────────

/** FR-D7's two modes. The canvas shows one at a time; `data-mode` on its `<html>` is the signal, and
 *  `tokens.ts:165-172` reserved it for exactly that (AD-30: never a `-dark` twin, never a mode selector in a
 *  design's stylesheet, never a second mode signal). */
export type Mode = 'light' | 'dark'

/** Does THIS design declare `name` mode-scoped? The DECLARATION decides and never the name: `bg` is the library's
 *  only `darkOverride: true` today (`vocabulary.ts:263`) and a design that declares its own must work the same day
 *  it lands, with no engine change. */
const scoped = (defs: readonly Declared[], name: string) => defs.some((d) => d.name === name && d.darkOverride)

/** THE ONE FUNCTION THAT KNOWS WHAT A MODE MEANS: the stored slice a mode resolves from.
 *
 *  In `light` it is the instance's `controls`, unchanged. In `dark` every mode-scoped name with an override stored
 *  takes that value and every other name keeps `controls`', so a dark override is A SECOND VALUE FOR THE SAME
 *  CONTROL (AD-30) rather than a second attribute. `resolveControls` and `stampControls` therefore need no mode at
 *  all — hand the same single door a different slice and the same walk produces the dark render, which is why no
 *  mode enters the theme emitter (`agreement.test.ts` is the control).
 *
 *  An override under a name this design does not declare mode-scoped is not read here, and one outside the offered
 *  set is resolved away by `resolveAll` as any stored value is (FR-F7). Neither is deleted: it is another design's
 *  to mean (FR-D19). */
export function storedFor(
  entry: Pick<ControlEntry, 'controlSchema' | 'universals'>,
  state: ControlState,
  mode: Mode = 'light',
): Record<string, unknown> {
  const slice: Record<string, unknown> = { ...(state.controls ?? {}) }
  if (mode === 'light') return slice
  for (const d of declared(entry)) {
    if (d.darkOverride && own(state.darkOverrides, d.name)) slice[d.name] = read(state.darkOverrides, d.name)
  }
  return slice
}

// ─── the sidebar model ───────────────────────────────────────────────────────

export type ControlOption = { value: string; label: string; greyed?: string }

export type ControlRow = {
  kind: 'control'
  name: string
  label: string
  type: ControlType
  options: ControlOption[]
  /** the value marked — the value in force; `null` marks none (R-69, R-103) */
  value: string | null
  /** the WHOLE control greyed, with its sentence (P0-0) */
  greyed?: string
  /** FR-F5: mode-scoped, and a dark override is stored */
  moon: boolean
  /** the stored value differs from the default, so a reset is offered */
  changed: boolean
  universal: boolean
}

export type PropRow = {
  kind: 'prop'
  path: string
  label: string
  type: PropType
  def: PropDef
  /** the stored value, or the authored default */
  value: unknown
  /** an authored array: its bounds, its item noun and the props one item carries, in markup order */
  list?: { item: string; min?: number; max?: number; count: number; atMax?: string; props: PropRow[] }
}

export type DataRow = {
  kind: 'data'
  key: string
  source: string
  control: 'count' | 'order'
  label: string
  value: string
  default: string
  options?: ControlOption[]
  min?: number
  max?: number
  changed: boolean
}

export type SidebarRow = ControlRow | PropRow | DataRow
export type SidebarGroupModel = { id: SidebarGroup; label: string; rows: SidebarRow[]; absent: string[] }
export type SidebarModel = { groups: SidebarGroupModel[] }

/** The accordions' titles (R-113). The ids are `SIDEBAR_GROUPS`, in the panel's order. Exported since Story 5.4: the
 *  panel draws Section Settings for R-124's Member visibility even where the design declares no row of its own, and
 *  one label written twice would be one label to change twice. */
export const GROUP_LABELS: Readonly<Record<SidebarGroup, string>> = {
  settings: 'Section Settings', content: 'Content', layout: 'Layout', style: 'Style', data: 'Data',
}

/** FR-F5's moon: a stored dark override AN EMITTER COULD USE — mode-scoped by declaration, and a value THIS design
 *  offers. `offered`, not `values`: an override the design narrows away is resolved away and never stamped, so a
 *  moon beside it would say a change is in force that nothing renders (the spec's I/O matrix, "An override the
 *  design will not take"). ONE definition, so the badge, the menu item, the confirm's count and the project count
 *  cannot disagree. */
const overridden = (d: Declared, state: ControlState): boolean =>
  d.darkOverride && d.offered.includes(read(state.darkOverrides, d.name) as string)

/** The mode-scoped controls of this design carrying an override in force, in the panel's order — what the moon marks
 *  and what a clear removes. Story 5.6: R-133's two entry points, its confirm's count and the project-level count
 *  all read this. */
export function darkOverridesInForce(entry: Pick<ControlEntry, 'controlSchema' | 'universals'>, state: ControlState): string[] {
  return declared(entry).flatMap((d) => (overridden(d, state) ? [d.name] : []))
}

function controlRow(r: Resolved, state: ControlState): ControlRow {
  const d = r.def
  const row: ControlRow = {
    kind: 'control',
    name: d.name,
    label: d.label,
    type: d.type,
    options: d.values.map((v) => {
      const o: ControlOption = { value: v, label: valueWords(d.valueLabels, v) }
      // one value switched off inside a live control greys the same way, with the design's sentence
      if (r.greyed === undefined && !d.offered.includes(v)) o.greyed = d.narrowed ?? ''
      return o
    }),
    value: r.value,
    // the moon lights for a stored override an emitter could use — a value this design OFFERS — never for junk
    moon: overridden(d, state),
    // a greyed row cannot be changed, so it carries no reset; its stored value returns with the row (P0-0)
    changed: r.greyed === undefined && r.stored !== null && r.stored !== d.default,
    universal: d.universal,
  }
  if (r.greyed !== undefined) row.greyed = r.greyed
  return row
}

/** Path → value on the nested content object, own properties only. `features[].title` is not a
 *  top-level read; item props are read from their item. */
export function getPath(o: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((a, k) => read(a, k), o)
}

function setPath(o: unknown, path: string, value: unknown): Record<string, unknown> {
  const [head, ...rest] = path.split('.')
  const base: Record<string, unknown> = typeof o === 'object' && o !== null && !Array.isArray(o) ? { ...(o as Record<string, unknown>) } : {}
  base[head as string] = rest.length === 0 ? value : setPath(read(o, head as string), rest.join('.'), value)
  return base
}

/** The props the markup names, in markup order — top-level paths, then each array's item props. */
function markupProps(html: string): string[] {
  const paths: string[] = []
  for (const tag of scanTags(html)) {
    for (const [k, v] of tag.attrs) {
      const name = k.toLowerCase()
      const found = name === 'data-prop' || name === 'data-items' ? [v]
        : name === 'data-prop-attr' ? v.split(';').map((e) => e.split(':').slice(1).join(':').trim()) : []
      for (const p of found) if (p !== '' && !paths.includes(p)) paths.push(p)
    }
  }
  return paths
}

/** The value an unset prop starts at: the stored value, else the authored default. */
const propValue = (entry: ControlEntry, content: unknown, path: string): unknown => {
  const stored = getPath(content, path)
  return stored === undefined ? entry.contentSchema[path]?.default : stored
}

const itemsOf = (entry: ControlEntry, state: ControlState, path: string): unknown[] => {
  const v = propValue(entry, state.content, path)
  return Array.isArray(v) ? v : []
}

function dataRows(entry: ControlEntry, state: ControlState): DataRow[] {
  const rows: DataRow[] = []
  for (const [key, b] of Object.entries(entry.dataBindings ?? {})) {
    // a hand-picked list IS its count and its order (R-20); its greyed rows are Story 5.19's Source panel. A query
    // the design fixes (R-108) offers neither either: a hero that always shows one post has no "Show 5"
    if (b.ids !== undefined || b.fixed === true) continue
    const stored = read(state.data, key)
    const declaredCount = countOf(b)
    if (declaredCount !== undefined) {
      const count = validCount(read(stored, 'count'))
      rows.push({
        kind: 'data', key, source: b.source, control: 'count', label: 'Show', min: 1, max: 100,
        value: String(count ?? declaredCount), default: String(declaredCount), changed: count !== undefined && count !== declaredCount,
      })
    }
    const declaredOrder = orderWord(b)
    if (declaredOrder !== undefined) {
      const order = read(stored, 'order')
      const valid = order === 'newest' || order === 'oldest' ? order : undefined
      rows.push({
        kind: 'data', key, source: b.source, control: 'order', label: 'Order',
        options: [{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }],
        value: valid ?? declaredOrder, default: declaredOrder, changed: valid !== undefined && valid !== declaredOrder,
      })
    }
  }
  return rows
}

/** A query's Count as the panel draws it: its declared limit, else its source's numeric default — `undefined` for a
 *  source Ghost returns whole (tiers), where the panel draws no Show row and so no stored Count reaches an emitter. */
function countOf(b: DataBinding): number | undefined {
  const fallback = read(orbitWeekly.DEFAULT_LIMIT, b.source)
  return b.limit ?? (typeof fallback === 'number' ? fallback : undefined)
}

const validCount = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 100 ? v : undefined

/** Newest · Oldest is a date order over posts (P0-3). ponytail: any other declared order, or any other
 *  source, offers no Order row — the full source vocabulary is Story 5.19's. */
function orderWord(b: DataBinding): 'newest' | 'oldest' | undefined {
  if (b.source !== 'posts') return undefined
  if (b.order === undefined || b.order === 'published_at desc') return 'newest'
  return b.order === 'published_at asc' ? 'oldest' : undefined
}

/** The panel, as data (R-113): Section Settings, Content, Layout, Style and Data, in that order, each holding what
 *  its role names and nothing pinned above them. A group's rows are its content props in markup order (Content
 *  only), then its own controls in declaration order, then the universal controls that sit in it, which the panel
 *  draws at the group's foot after its absent notes — the trio at the foot of Style. Data holds a declared query's
 *  rows. A group with nothing in it is not drawn. */
export function sidebar(entry: ControlEntry, state: ControlState = {}, mode: Mode = 'light'): SidebarModel {
  // Story 5.6: the value MARKED is the value in force in the mode being shown, which is the mode's own slice
  const resolved = resolveAll(entry, storedFor(entry, state, mode))
  // in DECLARATION order, never the resolver's: a control greyed by one declared after it resolves that one first
  const rows = declared(entry).map((d) => controlRow(resolved.get(d.name)!, state))
  const absent = (g: SidebarGroup) => (entry.absent ?? []).filter((a) => a.group === g).map((a) => a.note)

  const content: PropRow[] = []
  const paths = markupProps(entry.html)
  for (const path of paths) {
    const def = entry.contentSchema[path]
    if (def === undefined || path.includes('[]')) continue
    const row: PropRow = { kind: 'prop', path, label: def.label, type: def.type, def, value: propValue(entry, state.content, path) }
    if (def.type === 'array') {
      const count = itemsOf(entry, state, path).length
      row.list = {
        item: def.item ?? 'item',
        count,
        props: paths.filter((p) => p.startsWith(`${path}[].`)).flatMap((p) => {
          const d = entry.contentSchema[p]
          return d === undefined ? [] : [{ kind: 'prop' as const, path: p, label: d.label, type: d.type, def: d, value: d.default }]
        }),
      }
      if (def.min !== undefined) row.list.min = def.min
      if (def.max !== undefined) row.list.max = def.max
      if (def.max !== undefined && count >= def.max && def.atMax !== undefined) row.list.atMax = def.atMax
    }
    content.push(row)
  }

  const controlsIn = (g: SidebarGroup) => {
    const own = rows.filter((r) => resolved.get(r.name)?.def.group === g)
    return [...own.filter((r) => !r.universal), ...own.filter((r) => r.universal)]
  }
  const groups = SIDEBAR_GROUPS.map((id): SidebarGroupModel => ({
    id,
    label: GROUP_LABELS[id],
    // Data only when there is a query to control: a hand-picked or fixed list alone (R-20, R-108) draws no empty accordion
    rows: id === 'data' ? dataRows(entry, state) : [...(id === 'content' ? content : []), ...controlsIn(id)],
    absent: absent(id),
  })).filter((g) => g.rows.length > 0 || g.absent.length > 0)
  return { groups }
}

// ─── the edits ───────────────────────────────────────────────────────────────
// Each returns the NEXT state, or the sentence saying why nothing changed — the same sentence the
// panel prints, so a refusal is never a second wording.

/** Set one control. A greyed control, and a value this design does not offer, answer with the reason
 *  and change nothing — the validator refuses the value and the emitters never stamp it (FR-F7). */
export function setControl(entry: ControlEntry, state: ControlState, name: string, value: string, mode: Mode = 'light'): ControlState | string {
  const r = resolveAll(entry, storedFor(entry, state, mode)).get(name)
  if (r === undefined) return `This design has no control named "${name}".`
  if (r.greyed !== undefined) return r.greyed
  if (!r.def.values.includes(value)) return `${r.def.label} has no value "${value}".`
  if (!r.def.offered.includes(value)) return r.def.narrowed ?? ''
  // FR-D7: in dark, a MODE-SCOPED control's change is a second value for the same control and lands in
  // `darkOverrides`, leaving the light page exactly as it was. Every other control is one value for both modes.
  if (mode === 'dark' && r.def.darkOverride) {
    return { ...state, darkOverrides: { ...(state.darkOverrides ?? {}), [name]: value } }
  }
  return { ...state, controls: { ...(state.controls ?? {}), [name]: value } }
}

/** FR-F4: one control back to its default — its stored value is forgotten. In dark that is the DARK override for a
 *  mode-scoped control, so the row goes back to following the light one; in light it is the light value, and the
 *  dark override stays (FR-F4, the spec's I/O matrix). The same test names the map both ways. */
export function resetControl(entry: ControlEntry, state: ControlState, name: string, mode: Mode = 'light'): ControlState {
  if (mode === 'dark' && scoped(declared(entry), name)) {
    const darkOverrides = { ...(state.darkOverrides ?? {}) }
    delete darkOverrides[name]
    return { ...state, darkOverrides }
  }
  const controls = { ...(state.controls ?? {}) }
  delete controls[name]
  return { ...state, controls }
}

/** FR-F4: every setting this design draws back to its default. The words, the items and the stored dark overrides
 *  stay — S14's "Posts keep their content." rule. Reset removes exactly the changes `resetChanges` names (a greyed
 *  row's included) and junk under a declared name; everything else stored is another design's to mean and stays: a
 *  value this design does not offer or locks away, a value equal to this design's default, a name it does not declare,
 *  and a query field it draws no row for — FR-D19 carries each under the name both designs share, and it returns with
 *  the design that uses it. Parked values live apart, in the doc's `parkedControls` (AD-27), beyond reset's reach. */
export function resetSection(entry: ControlEntry, state: ControlState): ControlState {
  const isRecord = (o: unknown): o is Record<string, unknown> => typeof o === 'object' && o !== null && !Array.isArray(o)
  const record = (o: unknown): Record<string, unknown> => (isRecord(o) ? { ...o } : {})
  const controls = record(state.controls)
  for (const r of resolveAll(entry, state.controls).values()) {
    const raw = controls[r.def.name]
    if (r.stored !== null ? r.stored !== r.def.default : raw !== undefined && !r.def.values.includes(raw as string)) delete controls[r.def.name]
  }
  const data = record(state.data)
  for (const r of dataRows(entry, state)) {
    // a drawn query's record that is not a record at all is junk, and goes whole
    if (r.key in data && !isRecord(data[r.key])) { delete data[r.key]; continue }
    const stored = record(data[r.key])
    const v = stored[r.control]
    const valid = r.control === 'count' ? validCount(v) !== undefined : r.control === 'order' ? v === 'newest' || v === 'oldest' : false
    if (!r.changed && (v === undefined || valid)) continue
    delete stored[r.control]
    if (Object.keys(stored).length > 0) data[r.key] = stored
    else delete data[r.key]
  }
  return { ...state, controls, data }
}

/** R-115: what `resetSection` would undo that the customer chose, as the panel titles it, in the panel's order —
 *  every control whose stored value differs from its default, A GREYED ONE TOO (its row carries no reset, but its
 *  stored value returns with the row, and reset takes that away), and every changed data control. The confirm names
 *  these; with none, it asks nothing. */
export function resetChanges(entry: ControlEntry, state: ControlState = {}): string[] {
  const resolved = resolveAll(entry, state.controls)
  return sidebar(entry, state).groups.flatMap((g) => g.rows.flatMap((r) => {
    if (r.kind === 'data') return r.changed ? [r.label] : []
    if (r.kind !== 'control') return []
    const at = resolved.get(r.name)
    return at !== undefined && at.stored !== null && at.stored !== at.def.default ? [r.label] : []
  }))
}

/** Write one content prop. `index` addresses one item of an authored array: `features[].title` at 2. */
export function setContent(entry: ControlEntry, state: ControlState, path: string, value: unknown, index?: number): ControlState | string {
  if (entry.contentSchema[path] === undefined) return `This design has no content field "${path}".`
  const cut = path.indexOf('[].')
  if (cut === -1) return { ...state, content: setPath(state.content, path, value) }
  const base = path.slice(0, cut)
  const items = itemsOf(entry, state, base)
  if (index === undefined || !Number.isInteger(index) || index < 0 || index >= items.length) return `There is no item at position ${String(index)}.`
  const next = items.map((it, i) => (i === index ? setPath(it, path.slice(cut + 3), value) : it))
  return { ...state, content: setPath(state.content, base, next) }
}

/** The content a new section starts with: every top-level prop's authored default. */
export function defaultContent(contentSchema: Readonly<Record<string, PropDef>>): Record<string, unknown> {
  let content: Record<string, unknown> = {}
  for (const [path, def] of Object.entries(contentSchema)) {
    if (!path.includes('[]') && def.default !== undefined) content = setPath(content, path, def.default)
  }
  return content
}

function listOf(entry: ControlEntry, path: string): PropDef | string {
  const def = entry.contentSchema[path]
  return def?.type === 'array' ? def : `"${path}" is not a list this design authors.`
}

const withItems = (state: ControlState, path: string, items: unknown[]): ControlState =>
  ({ ...state, content: setPath(state.content, path, items) })

/** P0-3: a new item lands LAST, carrying the placeholder content its item props declare — never an
 *  empty shell. At the ceiling Add answers with the ceiling sentence. */
export function addItem(entry: ControlEntry, state: ControlState, path: string): ControlState | string {
  const def = listOf(entry, path)
  if (typeof def === 'string') return def
  const items = itemsOf(entry, state, path)
  if (def.max !== undefined && items.length >= def.max) return def.atMax ?? ''
  let item: Record<string, unknown> = {}
  for (const [p, d] of Object.entries(entry.contentSchema)) {
    if (p.startsWith(`${path}[].`) && d.default !== undefined) item = setPath(item, p.slice(path.length + 3), d.default)
  }
  return withItems(state, path, [...items, item])
}

/** P0-3's overflow Duplicate: a copy lands after its original; refused at the ceiling the way Add is. */
export function duplicateItem(entry: ControlEntry, state: ControlState, path: string, index: number): ControlState | string {
  const def = listOf(entry, path)
  if (typeof def === 'string') return def
  const items = itemsOf(entry, state, path)
  if (!inRange(index, items.length)) return `There is no ${def.item ?? 'item'} at position ${index + 1}.`
  if (def.max !== undefined && items.length >= def.max) return def.atMax ?? ''
  return withItems(state, path, [...items.slice(0, index + 1), items[index], ...items.slice(index + 1)])
}

/** R-12: Remove never greys. At the floor it answers with the floor sentence and removes nothing. */
export function removeItem(entry: ControlEntry, state: ControlState, path: string, index: number): ControlState | string {
  const def = listOf(entry, path)
  if (typeof def === 'string') return def
  const items = itemsOf(entry, state, path)
  if (!inRange(index, items.length)) return `There is no ${def.item ?? 'item'} at position ${index + 1}.`
  if (def.min !== undefined && items.length <= def.min) return def.atMin ?? ''
  return withItems(state, path, items.filter((_, i) => i !== index))
}

/** P0-3's own words for a completed move, announced politely. ONE WORDING for every reorderable list in the app
 *  (standing rule 3): Story 5.4's Layers panel reorders sections rather than items and announces through this. */
export const movedTo = (to: number, count: number) => `Moved to position ${to + 1} of ${count}`

/** Reorder, by drag or ⌥↑/⌥↓ — the array and the canvas order change together, and the move is
 *  announced politely in P0-3's words. */
export function moveItem(
  entry: ControlEntry, state: ControlState, path: string, from: number, to: number,
): { state: ControlState; announce: string } | string {
  const def = listOf(entry, path)
  if (typeof def === 'string') return def
  const items = itemsOf(entry, state, path)
  if (!inRange(from, items.length) || !inRange(to, items.length)) return `There is no ${def.item ?? 'item'} at that position.`
  const next = items.filter((_, i) => i !== from)
  next.splice(to, 0, items[from])
  return { state: withItems(state, path, next), announce: movedTo(to, items.length) }
}

const inRange = (i: number, n: number) => Number.isInteger(i) && i >= 0 && i < n

/** The Ghost-sourced repeat's Count (1–100, FR-H2) and Order (Newest · Oldest). A hand-picked list
 *  has neither; a value outside either set is refused. */
export function setData(entry: ControlEntry, state: ControlState, key: string, control: 'count' | 'order', value: number | string): ControlState | string {
  const row = dataRows(entry, state).find((r) => r.key === key && r.control === control)
  if (row === undefined) return `This design shows no ${control === 'count' ? 'count' : 'order'} for "${key}".`
  if (control === 'count' && validCount(value) === undefined) return 'Show a number from 1 to 100.'
  if (control === 'order' && value !== 'newest' && value !== 'oldest') return 'The order is Newest or Oldest.'
  const stored = read(state.data, key)
  const prev = typeof stored === 'object' && stored !== null ? stored : {}
  return { ...state, data: { ...(state.data ?? {}), [key]: { ...prev, [control]: value } } }
}

/** The stored Count and Order folded into the declared queries — what both emitters and the query the
 *  editor runs read. A stored 0, 101 or 3.5 is ignored and the declaration stands; so is an order
 *  word on a query that offers none, and anything stored for a hand-picked (R-20) or fixed (R-108) query. */
export function withData(
  bindings: Readonly<Record<string, DataBinding>> | undefined,
  data: unknown,
): Record<string, DataBinding> {
  const out: Record<string, DataBinding> = {}
  for (const [key, b] of Object.entries(bindings ?? {})) {
    const stored = read(data, key)
    const next: DataBinding = { ...b }
    // R-20 and R-108: a hand-picked or fixed query folds in no stored value — a Count or Order stored under the same
    // key by another design (Story 5.11's shuffle back) cannot reach it
    if (b.ids === undefined && b.fixed !== true) {
      const count = validCount(read(stored, 'count'))
      // only where the panel draws a Show row: a Count stored for a source Ghost returns whole has no row to reset it
      if (count !== undefined && countOf(b) !== undefined) next.limit = count
      const order = read(stored, 'order')
      if (orderWord(b) !== undefined && (order === 'newest' || order === 'oldest')) {
        next.order = order === 'newest' ? 'published_at desc' : 'published_at asc'
      }
    }
    out[key] = next
  }
  return out
}
