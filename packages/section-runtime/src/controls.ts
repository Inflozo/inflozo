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

import {
  CONTROL_VALUE_RE, DEFAULT_LIMIT, GHOST_ID_RE, GHOST_SLUG_RE, LIMIT_RE, POST_SOURCES, POST_SOURCE_WORDS, SIDEBAR_GROUPS,
  UNIVERSALS, scanTags, valueWords,
} from '@inflozo/library'
import type {
  AbsentNote, ControlDef, ControlGroup, ControlType, DataBinding, PostSource, PropDef, PropType, SidebarGroup,
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
  /** the design's display name — P0·5's cap sentence names it (a `SectionRegistryEntry` carries it) */
  name?: string
  /** STORY 5.19 — this section's part in its page's posts: the MAIN feed, whose Count is the page size in force and
   *  greyed (D5c), or a SECONDARY one, whose own query is `base` folded with `data.posts` (`main-feed.ts`'s
   *  `feedQuery`). Absent on a section that is no feed. The editor hands it; the design never declares it. */
  feed?: FeedRole
}

/** STORY 5.19 — a feed section's part on its page. `main` renders the native `posts`, sized by `postsPerPage`; a
 *  `secondary` feed renders its own query, whose Data rows are this engine's over `data[FEED_KEY]`. */
export type FeedRole = { kind: 'main'; postsPerPage: number } | { kind: 'secondary'; base: DataBinding }

/** Where a secondary feed's Data values are stored: `data.posts`. A source name, which no declared `dataBindings` key
 *  may be (`validateDataBinding`'s `bad-get-key`), so it can never collide with a design's own query. */
export const FEED_KEY = 'posts'

/** An instance's slice, as the project doc stores it (`project_templates.doc`): plain values. `data`
 *  holds each Ghost-sourced query's stored values per `dataBindings` key — Count and Order since Story 4.5; Source, the
 *  tag, the writer and the picks since Story 5.19. */
export type ControlState = {
  content?: Readonly<Record<string, unknown>>
  controls?: Readonly<Record<string, unknown>>
  darkOverrides?: Readonly<Record<string, unknown>>
  data?: Readonly<Record<string, unknown>>
  /** Story 5.11 — FR-D19's parked values, by the design they came from. Written only by `switchControls`, read
   *  only by it, and beyond every reset's reach (`resetSection`'s own comment says so). */
  parkedControls?: ParkedControls
}

/** One design's put-aside values: its `controls` and its `darkOverrides` together, because a dark override is a
 *  second value of the SAME control (AD-30) and "restored exactly" means both. */
export type ParkedControls = Readonly<Record<string, {
  controls: Readonly<Record<string, unknown>>
  darkOverrides: Readonly<Record<string, unknown>>
}>>

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
    // `overridden`, not "stored": an override this design will not take follows the LIGHT value, never the default
    if (overridden(d, state)) slice[d.name] = read(state.darkOverrides, d.name)
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
  /** an authored array: its bounds, its item noun and the props one item carries, in markup order. `shown` is
   *  FR-D13's per-design cap applied to `count` — how many of the stored items THIS design draws — so the panel
   *  prints "3 items · 2 shown in this design" from the engine's own number rather than a second count. */
  list?: { item: string; min?: number; max?: number; count: number; shown: number; atMax?: string; props: PropRow[] }
}

/** STORY 5.19 — the Data group's controls, P0·5's order: Source, then the tag or writer or the picked list the Source
 *  in force needs, then Count and Order. */
export type DataControl = 'source' | 'tag' | 'author' | 'picks' | 'count' | 'order'

/** A hand-picked post as stored: its id, and its title — which labels the panel row only and is never rendered, so a
 *  pick the source in force lacks still reads as itself. */
export type PickedPost = { id: string; title: string }

export type DataRow = {
  kind: 'data'
  key: string
  /** the query's RESOURCE — `posts`, `tags`… */
  source: string
  control: DataControl
  label: string
  /** the value in force: Count's number, Order's word, Source's value, the tag's or writer's slug. `''` marks none —
   *  Order at Hand-picked (R-69), a tag not yet chosen */
  value: string
  default: string
  options?: ControlOption[]
  min?: number
  max?: number
  changed: boolean
  /** the WHOLE row greyed, with its sentence (P0-0): Count and Order at Hand-picked, the main feed's Count */
  greyed?: string
  /** `picks` — the stored picks in their dragged order */
  picks?: readonly PickedPost[]
  /** `picks` on a FIXED query (R-108): it holds at most this many — the query's own limit */
  cap?: number
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

function controlRow(r: Resolved, state: ControlState, mode: Mode = 'light'): ControlRow {
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
    // in dark an override in force is itself the change, even one equal to the default — its reset is how it goes
    changed: r.greyed === undefined && ((mode === 'dark' && overridden(d, state)) || (r.stored !== null && r.stored !== d.default)),
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

/** FR-D13's PER-DESIGN CAP, as the panel reads it: how many of `path`'s items this design's markup draws, or
 *  `undefined` where it draws them all. The number is the design's own `data-items-limit` on the `data-items`
 *  element, applied at render inside `expandItems` — one declaration, two readers, and the list's own items are
 *  never touched: an item past the cap is waiting, not gone (FR-D19).
 *
 *  It lives HERE rather than in `core.ts` for one mechanical reason: `core.ts` imports this module, so a reader in
 *  core that this module called would be an import cycle. This side has the tag scan already. */
export function itemsShown(html: string, path: string): number | undefined {
  for (const tag of scanTags(html)) {
    const attr = (n: string) => tag.attrs.find(([k]) => k.toLowerCase() === n)?.[1]
    if (attr('data-items') !== path) continue
    const raw = attr('data-items-limit')
    return raw !== undefined && LIMIT_RE.test(raw) ? Number(raw) : undefined
  }
  return undefined
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

/** STORY 5.19 — P0·5's and D5c's sentences, the panel's words for this engine's greyed rows and its one refusal. The
 *  rest of the Data group's words are the app's (`apps/web/lib/data-group.ts`); `data-group.test.ts` holds both to the
 *  spec's table (R-170). */
export const DATA_WORDS = {
  /** Count greyed at Hand-picked (P0·5) */
  pickedCount: 'The list you picked is the count.',
  /** Order greyed at Hand-picked, marking no value (P0·5, R-69) */
  pickedOrder: 'The list you picked is the order — these posts render in the order you dragged them.',
  /** the main feed's Count, greyed at the page size in force (D5c's first sentence; its link is Story 7.9's, DW-254) */
  mainCount: "This feed is sized by your theme's Posts per page.",
  /** setData's refusal of a Count outside 1–100 (FR-H2) */
  countRefused: 'Count is a number from 1 to 100.',
} as const

/** A query that offers SOURCE: a posts query the design leaves open — no declared `filter` and no declared `ids`, which
 *  are the design's own (P0·5, FR-H2). A fixed one (R-108) offers Source alone. Tags, writers and tiers offer none. */
const sourced = (b: DataBinding): boolean => b.source === 'posts' && b.filter === undefined && b.ids === undefined

const isRecord = (o: unknown): o is Record<string, unknown> => typeof o === 'object' && o !== null && !Array.isArray(o)

/** The Source in force for a stored record — `latest` for anything outside the vocabulary. */
const sourceIn = (stored: unknown): PostSource => {
  const v = read(stored, 'source')
  return (POST_SOURCES as readonly unknown[]).includes(v) ? (v as PostSource) : 'latest'
}

/** A stored slug in the fold's grammar, or undefined — junk is ignored, never interpolated (AD-36). */
const slugIn = (stored: unknown, which: 'tag' | 'author'): string | undefined => {
  const v = read(stored, which)
  return typeof v === 'string' && GHOST_SLUG_RE.test(v) ? v : undefined
}

const isPick = (p: unknown): p is PickedPost =>
  isRecord(p) && typeof p['id'] === 'string' && GHOST_ID_RE.test(p['id']) && typeof p['title'] === 'string'

/** The stored picks in the fold's grammar, in their dragged order — a junk entry is dropped, never folded (AD-36). */
const picksIn = (stored: unknown): PickedPost[] => {
  const v = read(stored, 'picks')
  return Array.isArray(v) ? v.filter(isPick) : []
}

/** Every query this section's Data group draws: the design's declared ones, and a secondary feed's own under `FEED_KEY`. */
const queriesOf = (entry: Pick<ControlEntry, 'dataBindings' | 'feed'>): Record<string, DataBinding> => ({
  ...(entry.dataBindings ?? {}),
  ...(entry.feed?.kind === 'secondary' ? { [FEED_KEY]: entry.feed.base } : {}),
})

function dataRows(entry: ControlEntry, state: ControlState): DataRow[] {
  // D5c: the main feed's Data group is its Count alone, greyed at the page size in force — the native context owns its
  // Source and its Order (FR-H2), so neither is drawn
  if (entry.feed?.kind === 'main') {
    const size = String(entry.feed.postsPerPage)
    return [{ kind: 'data', key: FEED_KEY, source: 'posts', control: 'count', label: 'Count', value: size, default: size, min: 1, max: 100, changed: false, greyed: DATA_WORDS.mainCount }]
  }
  const rows: DataRow[] = []
  for (const [key, b] of Object.entries(queriesOf(entry))) {
    // a declared hand-picked list IS its count and its order (R-20), and the design's own: it draws nothing
    if (b.ids !== undefined) continue
    const stored = read(state.data, key)
    const row = (control: DataControl, rest: Omit<DataRow, 'kind' | 'key' | 'source' | 'control'>): DataRow =>
      ({ kind: 'data', key, source: b.source, control, ...rest })
    const source = sourced(b) ? sourceIn(stored) : 'latest'
    if (sourced(b)) {
      rows.push(row('source', {
        label: 'Source', value: source, default: 'latest', changed: source !== 'latest',
        options: POST_SOURCES.map((v) => ({ value: v, label: POST_SOURCE_WORDS[v] })),
      }))
      if (source === 'tag' || source === 'author') {
        const slug = slugIn(stored, source) ?? ''
        rows.push(row(source, { label: source === 'tag' ? 'Tag' : 'Author', value: slug, default: '', changed: slug !== '' }))
      }
      if (source === 'picked') {
        const picks = picksIn(stored)
        rows.push(row('picks', {
          label: 'Picked posts', value: String(picks.length), default: '0', changed: picks.length > 0, picks,
          ...(b.fixed === true && b.limit !== undefined ? { cap: b.limit } : {}),
        }))
      }
    }
    // R-108: a query the design fixes offers Source alone — a hero that always shows one post has no "Count 5"
    if (b.fixed === true) continue
    const picked = source === 'picked'
    const declaredCount = countOf(b)
    if (declaredCount !== undefined) {
      const count = validCount(read(stored, 'count'))
      rows.push(row('count', {
        label: 'Count', min: 1, max: 100,
        // P0·5: at Hand-picked the Count is the number of picks, greyed with its reason — its own stored value waits
        value: picked ? String(picksIn(stored).length) : String(count ?? declaredCount),
        default: String(declaredCount),
        changed: count !== undefined && count !== declaredCount,
        ...(picked ? { greyed: DATA_WORDS.pickedCount } : {}),
      }))
    }
    const declaredOrder = orderWord(b)
    if (declaredOrder !== undefined) {
      const order = read(stored, 'order')
      const valid = order === 'newest' || order === 'oldest' ? order : undefined
      rows.push(row('order', {
        label: 'Order',
        options: [{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }],
        // R-69: the order in force at Hand-picked is the dragged one, which is neither value, so none is marked
        value: picked ? '' : (valid ?? declaredOrder),
        default: declaredOrder,
        changed: valid !== undefined && valid !== declaredOrder,
        ...(picked ? { greyed: DATA_WORDS.pickedOrder } : {}),
      }))
    }
  }
  return rows
}

/** A query's Count as the panel draws it: its declared limit, else its resource's numeric default — `undefined` for a
 *  resource Ghost returns whole (tiers), where the panel draws no Count row and so no stored Count reaches an emitter.
 *  Story 5.19 (DW-112): the default is the vocabulary's, never the fixture module's. */
function countOf(b: DataBinding): number | undefined {
  const fallback = read(DEFAULT_LIMIT, b.source)
  return b.limit ?? (typeof fallback === 'number' ? fallback : undefined)
}

const validCount = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 100 ? v : undefined

/** Newest · Oldest is a date order over posts (P0·3, P0·5). Any other declared order, or any other resource, offers no
 *  Order row: Newest and Oldest are the only two words P0·5 draws. */
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
  const rows = declared(entry).map((d) => controlRow(resolved.get(d.name)!, state, mode))
  const absent = (g: SidebarGroup) => (entry.absent ?? []).filter((a) => a.group === g).map((a) => a.note)

  const content: PropRow[] = []
  const paths = markupProps(entry.html)
  for (const path of paths) {
    const def = entry.contentSchema[path]
    if (def === undefined || path.includes('[]')) continue
    const row: PropRow = { kind: 'prop', path, label: def.label, type: def.type, def, value: propValue(entry, state.content, path) }
    if (def.type === 'array') {
      const count = itemsOf(entry, state, path).length
      const cap = itemsShown(entry.html, path)
      row.list = {
        item: def.item ?? 'item',
        count,
        // FR-D13: what this design DRAWS. Equal to `count` wherever the design declares no cap, so the panel's
        // "N shown in this design" sentence is exactly the case where the two differ.
        shown: cap === undefined ? count : Math.min(count, cap),
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

// ─── Story 5.11 — the design ring's one rule: carry / park / default (FR-D19) ─

/** WHAT MOVING FROM ONE DESIGN TO ANOTHER MEANS, over one instance's stored slice — decided here and nowhere else,
 *  so the panel's arrows, the section's arrows, `[` / `]` and Shuffle are four doors onto one rule.
 *
 *  THREE ARMS, AND THE THREE WORDS ARE EXACT (FR-D19, FR-D13):
 *    - a control BOTH designs declare CARRIES its value, in light and in dark — nothing is written and nothing moves;
 *    - a control only the OUTGOING design declares is PARKED against that design's id, its dark override with it;
 *    - a control only the INCOMING design declares is left unstored, so `resolveControls` gives it ITS OWN DEFAULT.
 *  And the fourth thing, which is the promise the whole story exists for: a parked record for the design being
 *  ARRIVED AT is restored exactly and then CLEARED, so a round trip costs nothing and cannot accumulate a stale copy.
 *
 *  CONTENT IS NOT HERE, AND THAT IS WHAT KEEPS THIS SMALL. `contentSchema` is the CATEGORY's union (FR-G3) and a
 *  ring never leaves its category, so every prop, every list item and every `data` value stays in the instance byte
 *  for byte — invisible only where the incoming markup does not name it.
 *
 *  A NAME NEITHER DESIGN DECLARES IS LEFT ALONE, exactly as `resetSection` leaves it: it is a third design's to
 *  mean, and it returns with the design that uses it.
 *
 *  A RESTORED VALUE WINS OVER A CARRIED ONE, in the one case where both exist (a shared control the customer changed
 *  on an intermediate design). "Restored exactly as it was" is the promise the ring is sold on, and the record goes
 *  in the same breath, so it happens once and never again. */
export function switchControls(
  from: { id: string } & Pick<ControlEntry, 'controlSchema' | 'universals'>,
  to: { id: string } & Pick<ControlEntry, 'controlSchema' | 'universals'>,
  state: ControlState,
): { controls: Record<string, unknown>; darkOverrides: Record<string, unknown>; parkedControls: Record<string, { controls: Record<string, unknown>; darkOverrides: Record<string, unknown> }> } {
  const map = (o: unknown): Record<string, unknown> =>
    typeof o === 'object' && o !== null && !Array.isArray(o) ? { ...(o as Record<string, unknown>) } : {}
  const controls = map(state.controls)
  const darkOverrides = map(state.darkOverrides)
  const parkedControls: Record<string, { controls: Record<string, unknown>; darkOverrides: Record<string, unknown> }> = {}
  for (const [id, record] of Object.entries(state.parkedControls ?? {})) {
    parkedControls[id] = { controls: map(record?.controls), darkOverrides: map(record?.darkOverrides) }
  }
  if (from.id === to.id) return { controls, darkOverrides, parkedControls }

  const leaving = new Set(declared(from).map((d) => d.name))
  const arriving = new Set(declared(to).map((d) => d.name))
  const park = { controls: {} as Record<string, unknown>, darkOverrides: {} as Record<string, unknown> }
  for (const [live, aside] of [[controls, park.controls], [darkOverrides, park.darkOverrides]] as const) {
    for (const name of Object.keys(live)) {
      if (!leaving.has(name) || arriving.has(name)) continue
      aside[name] = live[name]
      delete live[name]
    }
  }
  if (Object.keys(park.controls).length > 0 || Object.keys(park.darkOverrides).length > 0) parkedControls[from.id] = park
  else delete parkedControls[from.id]

  // R-160 (owner, 2026-09-20, Story 5.11's Q3): where a parked record and a carried value both exist for one control
  // — a shared control changed on an intermediate design — the PARKED one wins: going back to a design always looks
  // exactly the way you left it. `Object.assign` after the carry is that rule.
  const back = parkedControls[to.id]
  if (back !== undefined) {
    Object.assign(controls, back.controls)
    Object.assign(darkOverrides, back.darkOverrides)
    delete parkedControls[to.id]
  }
  return { controls, darkOverrides, parkedControls }
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
  // with no override stored the value in force IS the light one, so the arrow the row shows resets that
  if (mode === 'dark' && scoped(declared(entry), name) && own(state.darkOverrides, name)) {
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
    if (!r.changed && (v === undefined || validStored(r.control, v))) continue
    delete stored[r.control]
    if (Object.keys(stored).length > 0) data[r.key] = stored
    else delete data[r.key]
  }
  return { ...state, controls, data }
}

/** Is a stored Data value one its row would take? Junk under a drawn row goes with a reset (Story 4.5's rule). */
function validStored(control: DataControl, v: unknown): boolean {
  switch (control) {
    case 'count': return validCount(v) !== undefined
    case 'order': return v === 'newest' || v === 'oldest'
    case 'source': return (POST_SOURCES as readonly unknown[]).includes(v)
    case 'tag':
    case 'author': return typeof v === 'string' && GHOST_SLUG_RE.test(v)
    case 'picks': return Array.isArray(v) && v.every(isPick)
  }
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

/** One Data value, from the panel: Count (1–100, FR-H2), Order (Newest · Oldest), and since Story 5.19 P0·5's Source,
 *  the tag, the writer and the picks. A row the section does not draw, a GREYED row (Count and Order at Hand-picked, the
 *  main feed's Count) and junk are refused in a sentence and change nothing. Each Source keeps its own value — the tag,
 *  the writer and the picks are stored apart and only the one in force is folded — so NOTHING CHOSEN IS LOST BY A
 *  SOURCE SWITCH (FR-D19's spirit). */
export function setData(entry: ControlEntry, state: ControlState, key: string, control: DataControl, value: unknown): ControlState | string {
  const row = dataRows(entry, state).find((r) => r.key === key && r.control === control)
  if (row === undefined) return `This section shows no ${control === 'picks' ? 'picked posts' : control} for "${key}".`
  if (row.greyed !== undefined) return row.greyed
  if (control === 'count' && validCount(value) === undefined) return DATA_WORDS.countRefused
  if (control === 'order' && value !== 'newest' && value !== 'oldest') return 'The order is Newest or Oldest.'
  if (control === 'source' && !(POST_SOURCES as readonly unknown[]).includes(value)) {
    return `The source is one of ${POST_SOURCES.map((v) => POST_SOURCE_WORDS[v]).join(' · ')}.`
  }
  if ((control === 'tag' || control === 'author') && !(typeof value === 'string' && GHOST_SLUG_RE.test(value))) {
    return `That is not a ${control === 'tag' ? 'tag' : 'writer'} Ghost could hold.`
  }
  if (control === 'picks') {
    if (!Array.isArray(value) || !value.every(isPick)) return 'A picked post is a post from the site, by its id.'
    // R-108: a query the design fixes holds at most as many picks as it shows
    if (row.cap !== undefined && value.length > row.cap) return `This section holds ${row.cap} ${row.cap === 1 ? 'pick' : 'picks'}.`
  }
  const stored = read(state.data, key)
  const prev = isRecord(stored) ? stored : {}
  return { ...state, data: { ...(state.data ?? {}), [key]: { ...prev, [control]: value } } }
}

/**
 * THE ONE FOLD: the stored Data values folded into the declared queries — what both emitters and the query the editor
 * runs read (`core.ts` calls it once per render; `main-feed.ts`'s `feedQuery` calls it for a secondary feed).
 *
 * Count and Order as since Story 4.5: a stored 0, 101 or 3.5 is ignored and the declaration stands; so is an order word
 * on a query that offers none, and a Count or Order on a FIXED query (R-108) or a declared hand-picked one (R-20).
 *
 * STORY 5.19 — SOURCE, on a query that offers it (a posts query with no declared filter or ids): `featured:true`; a
 * tag's or writer's slug, quoted, `tag:'…'` / `authors:'…'`; or the PICKS, as R-20's `ids` in their dragged order —
 * dropping the filter, the limit, the order and `fixed`, because the picked list IS the count and the order (a fixed
 * query keeps at most its own limit of them). AD-36: a value outside the grammar — a slug with a quote in it, an id
 * that is not 24 hexadecimal digits, a source that is not in the vocabulary — is IGNORED here, so the declaration (or
 * the default) stands, and never reaches a `{{#get}}` hash. Hand-picked with nothing picked is `ids: []`: zero items,
 * which both emitters render as nothing.
 */
export function withData(
  bindings: Readonly<Record<string, DataBinding>> | undefined,
  data: unknown,
): Record<string, DataBinding> {
  const out: Record<string, DataBinding> = {}
  for (const [key, b] of Object.entries(bindings ?? {})) {
    const stored = read(data, key)
    const next: DataBinding = { ...b }
    const source = sourced(b) ? sourceIn(stored) : 'latest'
    if (source === 'picked') {
      const ids = picksIn(stored).map((p) => p.id)
      out[key] = { source: b.source, ids: b.fixed === true && b.limit !== undefined ? ids.slice(0, b.limit) : ids }
      continue
    }
    // R-20 and R-108: a hand-picked or fixed query folds in no stored Count or Order — one stored under the same key by
    // another design (Story 5.11's shuffle back) cannot reach it
    if (b.ids === undefined && b.fixed !== true) {
      const count = validCount(read(stored, 'count'))
      // only where the panel draws a Count row: a Count stored for a resource Ghost returns whole has no row to reset it
      if (count !== undefined && countOf(b) !== undefined) next.limit = count
      const order = read(stored, 'order')
      if (orderWord(b) !== undefined && (order === 'newest' || order === 'oldest')) {
        next.order = order === 'newest' ? 'published_at desc' : 'published_at asc'
      }
    }
    if (source === 'featured') next.filter = 'featured:true'
    if (source === 'tag' || source === 'author') {
      const slug = slugIn(stored, source)
      // `authors:`, never `author:` — the singular is Ghost's deprecated spelling, which gscan refuses as an ERROR on both
      // majors (GS001-DEPR-AUTH-FILT, gscan 4.49.7 and 6.4.2 — executed by tools/stress, MEASUREMENTS §53), though it
      // still answers at render; the plural is its replacement and expands to the same `authors.slug`
      if (slug !== undefined) next.filter = source === 'tag' ? `tag:'${slug}'` : `authors:'${slug}'`
    }
    out[key] = next
  }
  return out
}
