/* STORY 7.9 — THEME SETTINGS' RULES THAT ARE THE APP'S, NOT GHOST'S (D6a). Ghost's own rules for a setting are the runtime's
 * `custom-settings.ts`; this file is what the page and its actions read beside them — the stored rows as the page trusts
 * them, which controls the Promote form offers, Site basics from the linked site, whether this session reads along, and
 * the page's words (R-170: one list). Pure, so `settings.test.ts` reaches every rule. */

import { categoryOf, type SectionRegistryEntry } from '@inflozo/library'
import { resolveControls, type ProjectDoc } from '@inflozo/section-runtime'
import {
  GHOST_SETTING_GROUPS, GHOST_SETTING_TYPES, GROUP_WORDS, SETTING_WORDS, settingOf, type SettingGroup, type SettingRow, type Visibility,
} from '@inflozo/section-runtime/custom-settings'
import { CANVASES, canvasOfPageTwoKey, canvasOfTemplateKey, fileOfKey, SITE } from './editor.ts'
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

/** `bound_to`'s control half — `{ kind: 'control', instanceId, controlKey }`, the schema comment's own shape; 7.10 adds
 *  `prop` and `token`. */
export const boundControl = (b: Readonly<Record<string, unknown>>): { instanceId: string; controlKey: string } | null =>
  b['kind'] === 'control' && typeof b['instanceId'] === 'string' && typeof b['controlKey'] === 'string'
    ? { instanceId: b['instanceId'], controlKey: b['controlKey'] }
    : null

/** A control the Promote form offers: where it is, its name as D6a's rows print it, and what it becomes in Ghost — and,
 *  since the owner's Question 5 (option 3, 2026-10-10), the parts the menu and "What your site's owner will see" say: the
 *  control's own name, its section, the page it is on, the Ghost group that page suggests, and its kind's picture. */
export type Promotable = {
  instanceId: string
  controlKey: string
  label: string
  control: string
  section: string
  page: string
  group: SettingGroup
  category: string
  setting: Pick<SettingRow, 'type' | 'options' | 'default_value'>
}

const idOf = (instanceId: string, controlKey: string) => `${instanceId}\u0000${controlKey}`

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

/**
 * Every control a Ghost setting can be made from (QUESTION 1, RULED OPTION 1): each toggle, segmented and named select
 * (`settingOf` decides) on every VISIBLE instance of every STORED doc — `skip` names the template keys whose doc is a
 * synthesized default, which no row binds to — once each (a page 2 shares its page 1's instances), at the instance's
 * value IN FORCE (`resolveControls`, the emitters' own reader: a control another one greys is at the value it renders, so
 * "now …" and the setting's start say what the canvas shows — Story 7.9's Review), named "Layer · Control" as D6a's rows are; a name met twice takes " (2)", so no two rows of a menu read alike.
 * The docs are walked in `pageOf`'s order, so the menu lists them page by page (Question 5).
 */
export function placedControls(
  docs: Readonly<Record<string, ProjectDoc>>,
  entries: Readonly<Record<string, SectionRegistryEntry>>,
  skip: ReadonlySet<string> = new Set(),
): Promotable[] {
  const seen = new Set<string>()
  const names = new Map<string, number>()
  const out: Promotable[] = []
  const walk = Object.entries(docs).sort(([a], [b]) => pageOf(a).rank - pageOf(b).rank)
  for (const [key, doc] of walk) {
    if (skip.has(key)) continue
    const { page, group } = pageOf(key)
    for (const i of doc.instances) {
      const entry = entries[i.designId]
      if (i.hidden || entry === undefined) continue
      const inForce = resolveControls(entry, i.controls)
      for (const def of entry.controlSchema) {
        const setting = settingOf(def, inForce[def.name] ?? def.default)
        if (setting === null || seen.has(idOf(i.instanceId, def.name))) continue
        seen.add(idOf(i.instanceId, def.name))
        const section = i.layerName.trim() || entry.name
        const name = `${section} · ${def.label}`
        const n = (names.get(name) ?? 0) + 1
        names.set(name, n)
        out.push({
          instanceId: i.instanceId, controlKey: def.name, label: n === 1 ? name : `${name} (${n})`,
          // a second instance of a name says so here too, so two rows of one page never read alike
          control: def.label, section: n === 1 ? section : `${section} (${n})`, page, group, category: categoryOf(i.designId), setting,
        })
      }
    }
  }
  return out
}

/** A promoted setting's start, as Ghost's panel shows it: a choice's label, a switch's On or Off. */
export const startOf = (s: Pick<SettingRow, 'type' | 'default_value'>): string =>
  s.type === 'boolean' ? conditionWord(s.default_value === 'true') : (s.default_value ?? '')
/** Every value the site's owner can pick: a choice's labels, a switch's two. */
export const choicesOf = (s: Pick<SettingRow, 'type' | 'options'>): string[] =>
  s.type === 'boolean' ? [conditionWord(true), conditionWord(false)] : (s.options ?? []).map((o) => o.label)

/** What the Promote form offers: the placed controls no row is bound to yet. */
export const promotable = (placed: readonly Promotable[], rows: readonly StoredSetting[]): Promotable[] => {
  const bound = new Set(rows.flatMap((r) => {
    const b = boundControl(r.bound_to)
    return b === null ? [] : [idOf(b.instanceId, b.controlKey)]
  }))
  return placed.filter((c) => !bound.has(idOf(c.instanceId, c.controlKey)))
}

/** Each row's "Layer · Control", by setting id — absent where the control it is bound to is not placed and visible now. */
export const boundLabels = (placed: readonly Promotable[], rows: readonly StoredSetting[]): Record<string, string> =>
  Object.fromEntries(rows.flatMap((r) => {
    const b = boundControl(r.bound_to)
    const c = b === null ? undefined : placed.find((p) => p.instanceId === b.instanceId && p.controlKey === b.controlKey)
    return c === undefined ? [] : [[r.id, c.label]]
  }))

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
  accentCaption: ['Feeds ', '--ghost-accent-color', ', which your Style Pack maps to its accent role.'] as const,
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
  noControls: 'No switch or choice on your canvases is left to promote.',
  named: (labels: readonly string[]) => `Named values only — Ghost's panel will show ${labels.join(', ')}.`,
  afterDeploy: 'Promoted controls appear under Design in Ghost Admin after your next deploy.',
  promoteButton: 'Promote',
  promoting: 'Promoting…',
  edit: 'Edit',
  save: 'Save',
  defaultValue: 'Default',
  deleteButton: 'Delete',
  deleting: 'Deleting…',
  cancel: 'Cancel',
  onlyWhen: (target: string, value: string | boolean) => `Only when ${target} is ${conditionWord(value)}`,
  frozenSince: (iso: string) => `Key frozen since ${DAY.format(new Date(iso))}`,
  deleteTitle: (label: string) => `Delete ${label}?`,
  deleteBody: (s: Pick<StoredSetting, 'key' | 'frozen_at'>) =>
    s.frozen_at === null
      ? 'Nothing is deployed yet, so nothing is lost.'
      : `If you later promote a control with the key ${s.key}, the value your site's owner set in Ghost comes back.`,
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
  gets: (c: Pick<Promotable, 'control' | 'section' | 'page' | 'setting'>, name: string, group: SettingGroup) =>
    `In Ghost's Design panel, under ${GROUP_WORDS[group]}, your site's owner will see “${name}”, ${c.setting.type === 'boolean' ? 'a switch' : 'a list'} set to ${startOf(c.setting)}. It changes ${c.control} on ${c.section}, ${c.page === EVERY_PAGE ? 'on every page' : / page 2$/.test(c.page) ? `on your ${c.page}` : `on your ${c.page} page`}.`,
} as const
