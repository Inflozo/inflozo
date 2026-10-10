/* STORY 7.9 — THEME SETTINGS' RULES THAT ARE THE APP'S, NOT GHOST'S (D6a). Ghost's own rules for a setting are the runtime's
 * `custom-settings.ts`; this file is what the page and its actions read beside them — the stored rows as the page trusts
 * them, which controls the Promote form offers, Site basics from the linked site, whether this session reads along, and
 * the page's words (R-170: one list). Pure, so `settings.test.ts` reaches every rule.
 *
 * STORY 7.10 — and what the EDITOR reads of a promotion too: the Promote form offers text, rich text and picture props and
 * the accent beside the controls, each with its `?promote=` id (`bindingId`, the module's one spelling); a row's state and
 * start come from the module's `bindingState` over the stored docs in `pageOf`'s order; and every sentence 7.10 adds —
 * the promote action, the "In Ghost" tag, the lock pill, D6c's confirm, the accent's caution and caption, the row states,
 * the delete-or-hide ask, the park note and the pack-switch ask — is `THEME_WORDS`, one list for the page and the editor. */

import { categoryOf, MARKS, type PropDef, type SectionRegistryEntry } from '@inflozo/library'
import { isRich, markupProps, resolveControls, type DocInstance, type Mark, type ProjectDoc, type PropValue } from '@inflozo/section-runtime'
import {
  accentSettingOf, bindingId, bindingOf, bindingState, ghostName, GHOST_SETTING_GROUPS, GHOST_SETTING_TYPES, GROUP_WORDS, propSettingOf, SETTING_WORDS,
  settingOf, type Binding, type Derived, type SettingGroup, type SettingRow, type Visibility,
} from '@inflozo/section-runtime/custom-settings'
import { CANVASES, canvasOfPageTwoKey, canvasOfTemplateKey, fileOfKey, settingsPath, SITE } from './editor.ts'
import { isStale, type LockRow } from './lock.ts'
import { adminAt } from './paywall.ts'
import { imageUrl } from './probe-rule.ts'
import { z } from './zod.ts'

/** The columns the page and the actions read, in one spelling. */
export const SETTING_COLUMNS = 'id, key, label, type, options, default_value, group_name, visibility_condition, bound_to, position, frozen_at'

/* A row as the page trusts it. Every column but `frozen_at` is the owner's to write (RLS), so a jsonb value of another shape
   is a row nothing in the product wrote: it is dropped rather than drawn or handed to a rule (AD-36). */
const storedSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  type: z.enum(GHOST_SETTING_TYPES),
  options: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  default_value: z.string().nullable(),
  group_name: z.enum(GHOST_SETTING_GROUPS),
  visibility_condition: z.object({ key: z.string(), value: z.union([z.string(), z.boolean()]) }).nullable(),
  bound_to: z.record(z.string(), z.unknown()),
  position: z.number(),
  frozen_at: z.string().nullable(),
})
export type StoredSetting = z.infer<typeof storedSchema>

export const storedSettings = (rows: readonly unknown[] | null | undefined): StoredSetting[] =>
  (rows ?? []).flatMap((r) => {
    const parsed = storedSchema.safeParse(r)
    return parsed.success ? [parsed.data] : []
  })

/** The rules' view of a stored row. */
export const ruleRow = (s: StoredSetting): SettingRow => ({
  key: s.key, label: s.label, type: s.type, options: s.options, default_value: s.default_value, group_name: s.group_name,
  visibility_condition: s.visibility_condition,
})

/** A control, a prop or the accent the Promote form offers: where it is, its name as D6a's rows print it, and what it
 *  becomes in Ghost — and, since the owner's Question 5 (option 3, 2026-10-10), the parts the menu and "What your site's
 *  owner will see" say: the control's own name, its section, the page it is on, the Ghost group that page suggests, and
 *  its kind's picture. STORY 7.10: its `kind` and `path` (a control's name, a prop's path, `accent`), the binding it
 *  would store and its `id` — the `?promote=` value the editor links with, `bindingId` of that binding — and what Promote
 *  asks first: D6c's confirm for a rich text (`value` is the line it shows with and without its formatting), the caution
 *  for the accent. */
export type Promotable = {
  kind: Binding['kind']
  id: string
  binding: Binding
  /** '' for the accent */
  instanceId: string
  /** a control's name, a prop's path, or `accent` — and, kept from 7.9, `controlKey`, the same value */
  path: string
  controlKey: string
  label: string
  control: string
  section: string
  page: string
  group: SettingGroup
  category: string
  setting: Derived
  confirm: 'formatting' | 'accent' | null
  value?: PropValue
}

/** The Promote form's heading for the accent's row, after every page's (D6a's colour row; the card that owns it). */
export const STYLE_PACK = 'Style Pack'

/** STORY 7.10 — THE EDITOR'S ↗ (Story 7.9's Question 5, option 3): Theme settings, opened on exactly this control, prop or
 *  the accent — `?promote=` carrying the binding's one spelling (`bindingId`), which the page compares with the ids its form
 *  offers and never parses into markup. */
export const promoteHref = (projectId: string, binding: Binding): string => `${settingsPath(projectId)}?promote=${encodeURIComponent(bindingId(binding))}`

/** The words for "every page" — a header or footer sits in the site doc, which every template draws. */
export const EVERY_PAGE = 'Every page'
const ORDER = Object.keys(CANVASES)

/** Where a stored doc's sections appear, in D5b's words, with the Ghost group that page suggests and its place in the
 *  menu: the site doc first (every page), then each canvas in D5b's order with its page 2 straight after it. Home is
 *  Ghost's Homepage and Post its Post; every other page suggests Site wide, the group Ghost shows everywhere. */
export function pageOf(key: string): { page: string; group: SettingGroup; rank: number } {
  if (key === SITE.key) return { page: EVERY_PAGE, group: 'site_wide', rank: -1 }
  const paged = canvasOfPageTwoKey(key)
  const canvas = paged ?? canvasOfTemplateKey(key)
  // ponytail: a custom template outside the switcher is named by its file until the Routes Manager (7.16) names them
  if (canvas === null) return { page: fileOfKey(key), group: 'site_wide', rank: ORDER.length }
  const { label } = CANVASES[canvas]
  return {
    page: paged === null ? label : `${label} page 2`,
    group: canvas === 'home' ? 'homepage' : canvas === 'post' ? 'post' : 'site_wide',
    rank: ORDER.indexOf(canvas) + (paged === null ? 0 : 0.5),
  }
}

/** The project's STORED docs in `pageOf`'s order — the site doc, then each canvas with its page 2 straight after it —
 *  synthesized ones left out (no row binds to one): the order `bindingState` takes its first holder in, the compile's too
 *  (every page 1 before its page 2). */
export const orderedDocs = (docs: Readonly<Record<string, ProjectDoc>>, skip: ReadonlySet<string> = new Set()): ProjectDoc[] =>
  Object.entries(docs).filter(([key]) => !skip.has(key)).sort(([a], [b]) => pageOf(a).rank - pageOf(b).rank).map(([, doc]) => doc)

/** The pack in force as the accent reads it: the project's own record of it, else the preset's (`packIdOf` has already
 *  made an unknown id Paper). */
export type PackInForce = { name: string; light: { accent: string } }
export const packInForce = (preset: string, packs: readonly { id: string; record: PackInForce }[], own: Readonly<Record<string, PackInForce>>): PackInForce =>
  own[preset] ?? packs.find((p) => p.id === preset)?.record ?? (packs[0] as { record: PackInForce }).record

/**
 * Everything a Ghost setting can be made from (QUESTION 1, RULED OPTION 1; Story 7.10): each toggle, segmented and named
 * select (`settingOf` decides) and each text, rich text and picture the design prints (`propSettingOf` decides — never a
 * link, a date, an icon, a list or a field inside one, nor a prop carrying R-27's tokens) on every VISIBLE instance of every
 * STORED doc — `skip` names the template keys whose doc is a synthesized default, which no row binds to — once each (a page 2
 * shares its page 1's instances), at the instance's value IN FORCE (`resolveControls`, the emitters' own reader: a control
 * another one greys is at the value it renders, so "now …" and the setting's start say what the canvas shows — Story 7.9's
 * Review), named "Layer · Control" as D6a's rows are; a name met twice takes " (2)", so no two rows of a menu read alike.
 * The docs are walked in `pageOf`'s order, so the menu lists them page by page (Question 5) — and, given the pack in force,
 * the accent last, under its own heading.
 */
export function placedControls(
  docs: Readonly<Record<string, ProjectDoc>>,
  entries: Readonly<Record<string, SectionRegistryEntry>>,
  skip: ReadonlySet<string> = new Set(),
  pack?: PackInForce,
): Promotable[] {
  const seen = new Set<string>()
  const names = new Map<string, number>()
  const out: Promotable[] = []
  const walk = Object.entries(docs).sort(([a], [b]) => pageOf(a).rank - pageOf(b).rank)
  const add = (i: DocInstance, entry: SectionRegistryEntry, page: string, group: SettingGroup, binding: Binding, control: string, setting: Derived, extra: Partial<Promotable> = {}) => {
    const id = bindingId(binding)
    if (seen.has(id)) return
    seen.add(id)
    const section = i.layerName.trim() || entry.name
    const name = `${section} · ${control}`
    const n = (names.get(name) ?? 0) + 1
    names.set(name, n)
    const path = binding.kind === 'control' ? binding.controlKey : binding.kind === 'prop' ? binding.path : binding.token
    out.push({
      kind: binding.kind, id, binding, instanceId: i.instanceId, path, controlKey: path, label: n === 1 ? name : `${name} (${n})`,
      // a second instance of a name says so here too, so two rows of one page never read alike
      control, section: n === 1 ? section : `${section} (${n})`, page, group, category: categoryOf(i.designId), setting, confirm: null, ...extra,
    })
  }
  for (const [key, doc] of walk) {
    if (skip.has(key)) continue
    const { page, group } = pageOf(key)
    for (const i of doc.instances) {
      const entry = entries[i.designId]
      if (i.hidden || entry === undefined) continue
      const inForce = resolveControls(entry, i.controls)
      for (const def of entry.controlSchema) {
        const setting = settingOf(def, inForce[def.name] ?? def.default)
        if (setting !== null) add(i, entry, page, group, { kind: 'control', instanceId: i.instanceId, controlKey: def.name }, def.label, setting)
      }
      for (const path of markupProps(entry.html)) {
        const def: PropDef | undefined = entry.contentSchema[path]
        if (def === undefined || path.includes('[]')) continue
        const value = valueAt(i.content, path)
        const setting = propSettingOf(def, value)
        if (setting === null) continue
        add(i, entry, page, group, { kind: 'prop', instanceId: i.instanceId, path }, def.label, setting,
          def.type === 'richtext' ? { confirm: 'formatting', value } : {})
      }
    }
  }
  if (pack !== undefined) {
    const binding: Binding = { kind: 'token', token: 'accent' }
    out.push({
      kind: 'token', id: bindingId(binding), binding, instanceId: '', path: 'accent', controlKey: 'accent', label: THEME_WORDS.accentRow,
      control: THEME_WORDS.accent, section: pack.name, page: STYLE_PACK, group: 'site_wide', category: '', setting: accentSettingOf(pack), confirm: 'accent',
    })
  }
  return out
}

/** A prop's stored value at a dotted path, own properties only (`getPath`'s rule). */
const valueAt = (content: unknown, path: string): PropValue =>
  path.split('.').reduce<unknown>((o, k) => (o !== null && typeof o === 'object' && Object.hasOwn(o, k) ? (o as Record<string, unknown>)[k] : undefined), content) as PropValue

/** A promoted setting's start, as Ghost's panel shows it: a choice's label, a switch's On or Off, a colour's hex, a text's
 *  words; a picture has none (''). */
export const startOf = (s: Pick<SettingRow, 'type' | 'default_value'>): string =>
  s.type === 'boolean' ? conditionWord(s.default_value === 'true') : (s.default_value ?? '')
/** Every value the site's owner can pick: a choice's labels, a switch's two — and none to list for any other kind. */
export const choicesOf = (s: Pick<SettingRow, 'type' | 'options'>): string[] =>
  s.type === 'boolean' ? [conditionWord(true), conditionWord(false)] : (s.options ?? []).map((o) => o.label)

/** The binding ids the project's rows already hold — whatever their state, so a parked or hidden one is not offered twice. */
const boundIds = (rows: readonly StoredSetting[]): Set<string> =>
  new Set(rows.flatMap((r) => {
    const b = bindingOf(r.bound_to)
    return b === null ? [] : [bindingId(b)]
  }))

/** What the Promote form offers: everything placed that no row is bound to yet. */
export const promotable = (placed: readonly Promotable[], rows: readonly StoredSetting[]): Promotable[] => {
  const bound = boundIds(rows)
  return placed.filter((c) => !bound.has(c.id))
}

/** Each row's "Layer · Control", by setting id — absent where what it is bound to is not placed and visible now. */
export const boundLabels = (placed: readonly Promotable[], rows: readonly StoredSetting[]): Record<string, string> =>
  Object.fromEntries(rows.flatMap((r) => {
    const b = bindingOf(r.bound_to)
    const c = b === null ? undefined : placed.find((p) => p.id === bindingId(b))
    return c === undefined ? [] : [[r.id, c.label]]
  }))

/** STORY 7.10 — one row's state, as the module judges it over the stored docs (`bindingState`), and what the row says:
 *  `start` for a switch, a choice and the accent (the start the canvas holds — Question 1), and `note` for a row the
 *  compile would refuse or leave out. */
export type RowState = { state: 'live' | 'parked' | 'hidden' | 'deleted' | 'changed'; start: string | null; note: string | null }
export function rowStates(
  rows: readonly StoredSetting[],
  docs: readonly ProjectDoc[],
  entries: Readonly<Record<string, SectionRegistryEntry>>,
  pack: PackInForce,
): Record<string, RowState> {
  return Object.fromEntries(rows.map((r) => {
    const name = ghostName(r.key)
    const binding = bindingOf(r.bound_to)
    const s = binding === null ? { state: 'changed' as const } : bindingState(binding, docs, (id) => entries[id], r.type, pack)
    const start = s.state === 'live' && (s.setting.type === 'boolean' || s.setting.type === 'select' || s.setting.type === 'color') ? startOf(s.setting) : null
    const note = s.state === 'parked'
      ? THEME_WORDS.parked(s.holder.instance.layerName.trim() || s.holder.entry.name, s.holder.entry.name)
      : s.state === 'live' ? null : THEME_WORDS[s.state](name)
    return [r.id, { state: s.state, start, note }]
  }))
}

/** STORY 7.10 — the editor's view of the project's bindings, by instance: each promoted control's name and prop's path
 *  with its key, and the accent's key — so the panel draws "In Ghost" where a row is bound, the canvas paints a bound
 *  rich text as P0-1's lock, and Delete or Hide names what it would leave dangling. */
export type Bindings = {
  byInstance: Readonly<Record<string, { controls: Readonly<Record<string, string>>; props: Readonly<Record<string, string>> }>>
  accent: string | null
  count: number
  /** the keys frozen by a deploy or an export — the park note's second sentence (Question 2) */
  frozen: readonly string[]
}
export function bindingsOf(rows: readonly Pick<StoredSetting, 'key' | 'bound_to' | 'frozen_at'>[]): Bindings {
  const byInstance: Record<string, { controls: Record<string, string>; props: Record<string, string> }> = {}
  let accent: string | null = null
  for (const r of rows) {
    const b = bindingOf(r.bound_to)
    if (b === null) continue
    if (b.kind === 'token') {
      accent = r.key
      continue
    }
    const at = (byInstance[b.instanceId] ??= { controls: {}, props: {} })
    if (b.kind === 'control') at.controls[b.controlKey] = r.key
    else at.props[b.path] = r.key
  }
  return { byInstance, accent, count: rows.length, frozen: rows.filter((r) => r.frozen_at !== null).map((r) => r.key) }
}

/** The park note a shuffle says (Question 2, ruled option 2): each setting this instance's binding loses on the design it
 *  moves to — a control the new design does not declare, a prop it does not print — in its own words, the second sentence
 *  once its key is frozen. `[]` when nothing is parked. */
export function parkedOn(
  bindings: Bindings,
  instanceId: string,
  from: Pick<SectionRegistryEntry, 'controlSchema' | 'html'>,
  to: Pick<SectionRegistryEntry, 'controlSchema' | 'html'>,
): string[] {
  const at = bindings.byInstance[instanceId]
  if (at === undefined) return []
  const declares = (e: Pick<SectionRegistryEntry, 'controlSchema'>, name: string) => e.controlSchema.some((c) => c.name === name)
  const [printedFrom, printedTo] = [markupProps(from.html), markupProps(to.html)]
  const keys = [
    ...Object.entries(at.controls).filter(([name]) => declares(from, name) && !declares(to, name)).map(([, key]) => key),
    ...Object.entries(at.props).filter(([path]) => printedFrom.includes(path) && !printedTo.includes(path)).map(([, key]) => key),
  ]
  return keys.map((key) => (bindings.frozen.includes(key) ? `${THEME_WORDS.parkNote(ghostName(key))} ${THEME_WORDS.parkNoteFrozen}` : THEME_WORDS.parkNote(ghostName(key))))
}

/** Is this prop one P0-1's lock applies to — a text or a rich text (a picture's asset id is never wrapped)? */
export const lockable = (def: PropDef | undefined): boolean => def?.type === 'text' || def?.type === 'richtext'

/** An instance's content as the canvas paints it: each bound text and rich text as P0-1's lock (`locked`), a copy — the
 *  stored content is never touched. `content` itself when nothing of it is bound, so an unbound section's render is
 *  unchanged. */
export function lockedContent(
  content: Readonly<Record<string, unknown>>,
  paths: readonly string[],
  schema: Readonly<Record<string, PropDef>>,
): Readonly<Record<string, unknown>> {
  let out = content
  for (const path of paths) {
    if (!lockable(schema[path])) continue
    const value = valueAt(out, path)
    if (!isRich(value) && typeof value !== 'string') continue
    const set = (o: unknown, [head, ...rest]: string[]): Record<string, unknown> => {
      const base = o !== null && typeof o === 'object' && !Array.isArray(o) ? { ...(o as Record<string, unknown>) } : {}
      base[head as string] = rest.length === 0 ? locked(value) : set(base[head as string], rest)
      return base
    }
    out = set(out, path.split('.'))
  }
  return out
}
/** The names Ghost gives the settings an instance carries, in the order they were promoted (the rows' order). */
export const namesOn = (bindings: Bindings, instanceId: string): string[] => {
  const at = bindings.byInstance[instanceId]
  return at === undefined ? [] : [...Object.values(at.controls), ...Object.values(at.props)].map(ghostName)
}

/** P0-1's lock as a render-time copy (never stored): a bound rich text's value with `plainText` set, so the canvas, the
 *  panel and the inline session draw and allow no mark while its formatting stays in the doc, out of force (D6c: "Demote
 *  it later and the formatting comes back"). A plain string — a rich text no one has marked yet — is locked too, as the
 *  same words in the rich shape, or its session would offer the marks Ghost cannot hold. An empty value stays as it is. */
export const locked = (value: PropValue): PropValue =>
  isRich(value) ? { ...value, plainText: true } : typeof value === 'string' ? { text: value, plainText: true } : value
/** The lock taken back off a value the inline session or the panel handed up, before it is stored — the binding is the
 *  lock's one source, so nothing writes `plainText` into a doc; and a value carrying no mark goes back to the plain
 *  string a value with none is stored as. */
export const unlocked = (value: unknown): unknown => {
  if (!isRich(value) || value.plainText === undefined) return value
  const { plainText: _, ...rest } = value
  return (rest.marks ?? []).length === 0 ? rest.text : rest
}

/** D6c's "WHAT SHIPS": the marks a rich text carries, named in P0-1's order — the sentence under the line without them,
 *  or null when it carries none. A link alone keeps D6c's own words. */
const MARK_WORDS: Readonly<Record<string, string>> = { strong: 'bold', em: 'italic', u: 'underline', a: 'link' }
export function droppedWords(value: PropValue): string | null {
  const marks = new Set((isRich(value) ? (value.marks ?? []) : []).map((m: Mark) => m.mark))
  const named = MARKS.filter((m) => marks.has(m)).map((m) => `the ${MARK_WORDS[m] ?? m}`)
  if (named.length === 0) return null
  if (named.length === 1 && marks.has('a')) return THEME_WORDS.linkDropped
  return THEME_WORDS.marksDropped(named)
}

/** A picture's file name as D6a prints the logo's — the address's last part, never a trailing `/` or its query. */
export const fileName = (url: string): string => {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).pop() ?? url
  } catch {
    return url
  }
}

/** QUESTION 2, RULED OPTION 1: D6a's three Ghost-owned values, read from the linked site — never written (AD-10's P8).
 *  `accent` arrives through `siteAccentOf`, the Style Pack's one reader of the same field. A value Ghost never gave is
 *  null, and so is the Admin link of a site whose address is not http(s). */
export type SiteBasics = { title: string | null; logo: string | null; accent: string | null; admin: string | null }
export function siteBasics(row: { url?: unknown; title?: unknown; site_settings?: unknown } | null | undefined, accent: string | null): SiteBasics {
  const url = typeof row?.url === 'string' && /^https?:\/\/[^\s]+$/i.test(row.url.trim()) ? row.url.trim() : null
  const title = typeof row?.title === 'string' && row.title.trim() !== '' ? row.title.trim() : null
  const logo = imageUrl((row?.site_settings as { brand?: { logo?: unknown } } | null | undefined)?.brand?.logo)
  return { title, logo, accent, admin: url === null ? null : adminAt(url, 'settings') }
}

/* ─── the actions' two translations, here so `settings.test.ts` runs them (a 'use server' file exports actions only) ─── */

/** The posted condition, in the type its target compares: none when no setting is named, a boolean target's `true`/`false`
 *  as JSON — anything else stays text, which `checkSetting` then refuses with its sentence. */
export function conditionOf(formData: FormData, others: readonly SettingRow[]): Visibility | null {
  const key = formData.get('when_key')
  if (typeof key !== 'string' || key === '') return null
  const raw = formData.get('when_value')
  const value = typeof raw === 'string' ? raw : ''
  const boolean = others.find((o) => o.key === key)?.type === 'boolean'
  return { key, value: boolean && value === 'true' ? true : boolean && value === 'false' ? false : value }
}

/** A database refusal as the module's sentence: the cap trigger's `23514` (named by its message — the column checks share
 *  the code, and the module stops every one of them first), the key's uniqueness `23505`, the frozen key's `42501`. The
 *  trigger's own message is read back from the migrations in `settings.test.ts`, so a reworded trigger turns it red. */
export const refusalOf = (error: { code?: string; message?: string } | null, key: string): string =>
  error?.code === '23514' && /cap/.test(error.message ?? '')
    ? SETTING_WORDS.cap
    : error?.code === '23505'
      ? SETTING_WORDS.taken(key)
      : error?.code === '42501'
        ? SETTING_WORDS.frozen
        : SETTING_WORDS.couldNot

/** R-192: the session holding the lock, while its row is live — null when nobody does. */
export const liveHolder = (lock: LockRow | null): string | null => (lock !== null && !isStale(lock) ? lock.holderSessionId : null)
/** This tab reads along when another session holds the lock. A tab with no session of its own (a page opened by its
 *  address) is not the holder. */
export const settingsReadOnly = (holder: string | null, session: string | null): boolean => holder !== null && holder !== session

const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** A condition value as the page prints it: a select's label as it is, a boolean as On or Off. */
export const conditionWord = (value: string | boolean): string => (value === true ? 'On' : value === false ? 'Off' : value)

/** D6a's sentences and the ones this story adds beside them, in one list (R-170). */
export const THEME_WORDS = {
  postsPerPage: 'Posts per page',
  postsCaption: 'How many posts your archives show before paginating. Your theme owns this — Ghost has no setting for it.',
  /** at the + end: Ghost 6.58.0 sets no ceiling on an archive's page size, so the 100 is Inflozo's — said where it stops */
  postsCeiling: "100 is the most — the same ceiling every feed's Count has.",
  saving: 'Saving…',
  siteBasics: 'Site basics',
  basicsLead: 'Ghost owns the title, the logo and the accent — we read them.',
  siteTitle: 'Site title',
  logo: 'Logo',
  accent: 'Accent colour',
  /** Question 3, ruled option 1 (owner, 2026-10-10): Site basics' accent is Ghost's own, and what it colours is said —
   *  "which your Style Pack maps to its accent role" was not true (no Style Pack reads it) */
  accentCaption: "Ghost's own comments and card buttons use this colour. Your Style Pack's accent is separate.",
  fromGhost: 'from Ghost',
  /** D6a's own line under the title (`:80`): the title is the one value it sends nowhere but Ghost */
  titleCaption: 'Change this in Ghost — it appears in email too',
  change: 'Change this in Ghost ↗',
  notSet: 'Not set in Ghost',
  noSite: 'Connect a Ghost site and its title, logo and accent appear here.',
  sites: 'Sites',
  custom: 'Custom settings',
  customLead: "Promote one of your controls and it becomes a Ghost theme setting — editable in Ghost's own Design panel, without opening Inflozo.",
  freeze: 'Keys freeze once you deploy or export — pick them like you mean it.',
  empty: 'Nothing promoted yet.',
  promote: 'Promote a control',
  which: 'Which control',
  labelInGhost: 'Label in Ghost',
  key: 'Key',
  group: 'Group in Ghost',
  groupCaption: "Site wide · Homepage · Post — the three headings Ghost's Design panel groups settings under.",
  when: 'Only show when',
  optional: 'optional',
  whenCaption: 'Ghost hides the setting when the condition is false, so an editor never sees a control that does nothing.',
  whenNone: 'Promote a second control to show this one conditionally.',
  noControls: 'Nothing on your canvases is left to promote.',
  named: (labels: readonly string[]) => `Named values only — Ghost's panel will show ${labels.join(', ')}.`,
  afterDeploy: 'Promoted controls appear under Design in Ghost Admin after your next deploy.',
  promoteButton: 'Promote',
  promoting: 'Promoting…',
  edit: 'Edit',
  save: 'Save',
  deleteButton: 'Delete',
  deleting: 'Deleting…',
  cancel: 'Cancel',
  onlyWhen: (target: string, value: string | boolean) => `Only when ${target} is ${conditionWord(value)}`,
  frozenSince: (iso: string) => `Key frozen since ${DAY.format(new Date(iso))}`,
  deleteTitle: (label: string) => `Delete ${label}?`,
  deleteBody: (s: Pick<StoredSetting, 'key' | 'frozen_at'>) =>
    s.frozen_at === null
      ? 'Nothing is deployed yet, so nothing is lost.'
      // Question 2, ruled option 2 (owner, 2026-10-10): Ghost forgets a stored value at the deploy that leaves its key out
      : `Promote a control with the key ${s.key} again before your next deploy and the value your site's owner set in Ghost comes back. After that deploy, Ghost forgets it.`,
  /** Story 7.9's Review: the delete clears every "Only show when" naming the setting, and the confirm says so first */
  deleteDependents: (names: readonly string[]) =>
    `The “Only show when” on ${new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(names)} is removed too.`,
  typeWord: (type: SettingRow['type']) => (type === 'color' ? 'colour' : type),
  /** Question 6, ruled option 1 (owner, 2026-10-10): Ghost names a setting by its key, so its label is set once */
  nameFixed: 'Ghost names a setting by its key, so its label is fixed once promoted. To rename one before you deploy, delete it and promote it again.',
  /** Question 5, ruled option 3 (owner, 2026-10-10): each control in Which control says its values and where it stands */
  now: (start: string) => `now ${start}`,
  /** …and, under the form, what the site's owner will see in Ghost — D6c's "What ships", extrapolated (R-74). "Your site's
   *  owner" is the one name the page already gives the person who edits the setting in Ghost (R-170) */
  willGet: "What your site's owner will see",
  /** …each kind in its own word (Story 7.10): a switch and a list at their start, a text box, an empty picture slot (and
   *  what shows until one is chosen), a colour; the accent changes the Style Pack's accent everywhere */
  gets: (c: Pick<Promotable, 'kind' | 'control' | 'section' | 'page' | 'setting'>, name: string, group: SettingGroup) => {
    const kind = { boolean: `a switch set to ${startOf(c.setting)}`, select: `a list set to ${startOf(c.setting)}`, text: 'a text box', image: 'an empty picture slot', color: `a colour set to ${startOf(c.setting)}` }[c.setting.type]
    const where = c.kind === 'token' ? "your Style Pack's accent, on every page"
      : `${c.control} on ${c.section}, ${c.page === EVERY_PAGE ? 'on every page' : / page 2$/.test(c.page) ? `on your ${c.page}` : `on your ${c.page} page`}`
    return `In Ghost's Design panel, under ${GROUP_WORDS[group]}, your site's owner will see “${name}”, ${kind}. It changes ${where}.${c.setting.type === 'image' ? ' Until they choose one, your section shows its own picture.' : ''}`
  },

  /* ── Story 7.10 (§ Words) ── */
  /** the Promote form's row for the accent, under `STYLE_PACK` */
  accentRow: 'Accent',
  /** the promote action beside a control, a prop or the Style Pack's accent — its name and its tooltip */
  promoteAction: (name: string) => `Let your site's owner change ${name} in Ghost`,
  /** the tag a promoted one carries in its place, and the title it reads */
  inGhost: 'In Ghost',
  inGhostTitle: (key: string) => `Your site's owner changes “${ghostName(key)}” in Ghost. Your canvas sets where it starts, on your first deploy.`,
  /** P0-1's plain-text-locked pill, where a bound text's toolbar would be */
  lockPill: (key: string) => `${ghostName(key)} — plain text, set in Ghost`,
  /** D6c (`:291-317`), for a rich text */
  confirmTitle: (label: string) => `Promote “${label}” to Ghost?`,
  confirmBody: "Ghost's own settings are plain text, so bold, italic, underline and links will be removed from this field while it stays promoted.",
  whatShips: 'WHAT SHIPS',
  linkDropped: 'The link is dropped; its words stay.',
  marksDropped: (named: readonly string[]) => {
    const list = new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(named)
    return `${list.charAt(0).toUpperCase()}${list.slice(1)} ${named.length === 1 ? 'is' : 'are'} dropped; the words stay.`
  },
  formattingBack: 'Demote it later and the formatting comes back.',
  promoteIt: 'Promote it',
  /** the accent's caution */
  accentTitle: 'Promote your accent to Ghost?',
  accentBody: "Once this lives in Ghost Admin, contrast is in your hands. Inflozo checks your Style Pack's colours, never one your site's owner picks in Ghost.",
  /** D6a's colour row caption (`:176`), under the promoted accent */
  accentRowCaption: 'This points at a Style Pack colour role. Switching packs changes what this setting is pointing at.',
  starts: (start: string) => `starts ${start}`,
  /** a row the compile leaves out or refuses, in the row's own words */
  parked: (section: string, design: string) => `Won't appear in Ghost while ${section} uses ${design}.`,
  hidden: (_name: string) => 'Its section is hidden. Show the section or delete this setting before your next deploy.',
  deleted: (_name: string) => 'Its section is gone. Delete this setting, or bring the section back, before your next deploy.',
  changed: (name: string) => SETTING_WORDS.changed(name),
  /** the editor's delete-or-hide ask — one dialog, joined to the site-wide or D5f ask when one fires */
  bindingAsk: (names: readonly string[], act: 'deleted' | 'hidden') =>
    `${new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(names)} ${names.length === 1 ? 'is' : 'are'} promoted to Ghost from this section. Once it is ${act}, your next deploy stops until you delete ${names.length === 1 ? 'it' : 'them'} in Theme settings or bring the section back.`,
  bindingAskTitle: (act: 'remove' | 'hide', name: string) => `${act === 'remove' ? 'Delete' : 'Hide'} ${name}?`,
  keepIt: 'Keep it',
  deleteSection: 'Delete section',
  hideSection: 'Hide section',
  /** the shuffle's park note (Question 2, ruled option 2): its second sentence once the key is frozen */
  parkNote: (name: string) => `${name} won't appear in Ghost while this design is in use.`,
  parkNoteFrozen: "Deploy before you switch back and Ghost forgets what your site's owner chose.",
  /** the pack-switch ask, while the accent is promoted (R-134's sheet over S7a) */
  packTitle: (pack: string) => `Switch to ${pack}?`,
  packBody: "Your accent is a Ghost setting. Switching packs restyles your canvas, but once you have deployed, your live site keeps the accent Ghost holds until your site's owner changes it there.",
  packKeep: (current: string) => `Keep ${current}`,
  packSwitch: 'Switch',
} as const
