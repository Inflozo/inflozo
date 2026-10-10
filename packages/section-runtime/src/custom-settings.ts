// STORY 7.9 — FR-Q2's RULES FOR A GHOST THEME SETTING, AS DATA IN ONE PLACE (AD-34's pattern). Theme settings' server
// actions validate with it before they write, its tests hold it on both pinned gscans (`packages/theme-compiler/gate/
// custom-settings.test.ts`), and Story 7.10's `config.custom` emitter reads it. The database's own constraints
// (`hex6_colour`, `no_image_default`, the key check, the cap trigger, `custom_settings_key_frozen`, the column grants)
// stay the floor beneath it.
//
// Each rule's source, read this story (standing rule 1): gscan 4.49.7 and 6.4.2, `lib/checks/010-package-json.js:159-231`
// (byte-identical over that range) — the `> 20` cap, the five types, `post`/`homepage` or no group, select options and
// default, boolean and colour defaults, no image default, and visibility as NQL whose first key is matched by
// `/[a-zA-Z_][a-zA-Z0-9_.]+:/` (`:225`, so a key needs two characters); Ghost 6.58.0's
// `custom-theme-settings-service.js:107-133`, which validates a stored value the same way.
//
// Stored shapes (the `custom_settings` columns, named as the table names them): a select's `options` are `{value,
// label}` pairs and its default is the default option's LABEL — Ghost's panel prints option strings verbatim (D6a:
// "Named values only"), so 7.10 emits the labels and maps the chosen one back to the control's value. A boolean's
// default is the text `'true'`/`'false'`. A visibility condition is `{ key, value }`: an option label for a select, a
// JSON boolean for a boolean — the value Ghost stores and compares.

// STORY 7.10 — WHAT A PROMOTION IS, here beside 7.9's rules and nowhere else (the spec's one-module rule): the type each
// control, text prop, picture and the accent becomes; the binding's three shapes (`Binding`); a binding's state over the
// project's stored docs (`bindingState`: live · parked · hidden · deleted · changed); the start the canvas decides
// (Question 1, ruled option 1, owner, 2026-10-10 — the compile derives `type`, `options` and `default` from the design
// and the doc IN FORCE, never from the stored `default_value`, which stays the record of what was promoted); the reader a
// switch or a choice ships (`matchChain`); and every sentence the compiler throws. The compiler, Theme settings and the
// editor all import it.

import { CONTROL_VALUE_RE, valueWords, type ControlDef, type ControlType, type PropDef, type PropType } from '@inflozo/library'
import { getPath, markupProps, resolveControls, type ControlEntry } from './controls.ts'
import type { DocInstance } from './doc-schema.ts'
import { plainText } from './marks.ts'
import type { Pack } from './tokens.ts'

/** What the accent's start reads of a pack — a `Pack` has it, and so does a project's own record. */
export type AccentOf = { readonly light: Pick<Pack['light'], 'accent'> }

/** Ghost's cap on a theme's settings (gscan `customSettingsKeys.length > 20`). */
export const SETTING_CAP = 20
/** FR-Q5's three dark built-ins every project emits — never a user's row, never counted in the meter. ONE list:
 *  `color_scheme` is FR-Q5's own name; the other two are Story 7.9's proposal for Story 7.11 to confirm or rename HERE. */
export const RESERVED_SETTING_KEYS = ['color_scheme', 'dark_accent_color', 'dark_logo'] as const
/** The user's share, derived — the cap trigger's `>= 17` (`complete_schema.sql`), which a test reads back. */
export const USER_SETTING_CAP = SETTING_CAP - RESERVED_SETTING_KEYS.length

/** Ghost's five types, in gscan's order. Story 7.9 created `boolean` and `select`; Story 7.10 `text`, `image` and `color`. */
export const GHOST_SETTING_TYPES = ['select', 'boolean', 'color', 'image', 'text'] as const
export type SettingType = (typeof GHOST_SETTING_TYPES)[number]
/** The groups as stored; `site_wide` is emitted as no `group` at all (gscan allows `undefined`, `post`, `homepage`). */
export const GHOST_SETTING_GROUPS = ['site_wide', 'homepage', 'post'] as const
export type SettingGroup = (typeof GHOST_SETTING_GROUPS)[number]
/** The three headings Ghost's Design panel groups settings under (D6a). */
export const GROUP_WORDS: Readonly<Record<SettingGroup, string>> = { site_wide: 'Site wide', homepage: 'Homepage', post: 'Post' }

/** FR-Q3: the Ghost type each control type becomes when promoted — null for one that is never promoted (Ghost has no
 *  number type; colour promotion is the accent alone in v1). Keyed by every control type, so a new one is a compile
 *  error here rather than a silent omission. */
export const PROMOTED_TYPE: Readonly<Record<ControlType, SettingType | null>> = {
  toggle: 'boolean', segmented: 'select', 'named-select': 'select', stepper: null, 'swatch-row': null,
}

/** FR-H2's ceiling, which the main feed's Count shares; the floor is the column's `>= 1`. Ghost 6.58.0 does NOT cap a
 *  collection route's page size (its `maxLimit` is the HTTP API's and `{{#get}}`'s — `max-limit-cap.js`, applied in
 *  `web/api/app.js:24` and `helpers/get.js:202`, never on `collection.js`'s `fetchData`), and neither does 5.130.6, which has
 *  no `max-limit-cap` at all and the same `collection.js` (read in source at Story 7.9's Review, 2026-10-10) — so 100 is
 *  Inflozo's choice. */
export const POSTS_PER_PAGE = { min: 1, max: 100 } as const

export type SettingOption = { value: string; label: string }
export type Visibility = { key: string; value: string | boolean }
/** A setting as the rules read it — the row's own columns, `bound_to` and the bookkeeping aside. */
export type SettingRow = {
  key: string
  label: string
  type: SettingType
  options: SettingOption[] | null
  default_value: string | null
  group_name: SettingGroup
  visibility_condition: Visibility | null
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const word = (n: number): string => NUMBER_WORDS[n] ?? String(n)

/** Every sentence a refusal or the card says (R-170: one list). */
export const SETTING_WORDS = {
  /** D6a's caption under the meter, its three numbers derived */
  limits: `Ghost allows ${word(SETTING_CAP)} per theme; ${word(RESERVED_SETTING_KEYS.length)} are the dark-mode built-ins every Inflozo project declares, so ${word(USER_SETTING_CAP)} are yours.`,
  meter: (used: number) => `${used} OF ${USER_SETTING_CAP}`,
  keyShort: 'A key needs at least two letters.',
  keyShape: 'A key is lowercase letters, numbers and underscores, and starts with a letter.',
  reserved: (key: string) => `${key} is one of the ${word(RESERVED_SETTING_KEYS.length)} dark-mode settings every Inflozo theme carries.`,
  taken: (key: string) => `${key} is already one of this project's settings.`,
  cap: `You have used all ${USER_SETTING_CAP} of your theme settings. Delete one to promote another.`,
  frozen: 'This key is frozen — it was deployed or exported.',
  label: 'A setting needs a label.',
  type: 'Ghost has five kinds of setting: select, boolean, color, image and text.',
  group: 'Ghost groups a setting under Site wide, Homepage or Post.',
  options: 'A choice needs at least two named values.',
  selectDefault: "The default must be one of the choice's named values.",
  booleanDefault: 'A yes-or-no setting starts on or off.',
  colour: 'A colour default is a six-digit hex value, like #1A2B3C.',
  imageDefault: 'A picture setting has no default — Ghost starts it empty.',
  self: 'A setting cannot depend on itself.',
  cycle: 'A setting cannot depend on one that depends on it — Ghost could hide them both for good.',
  condition: 'Only show when must name another setting of this project.',
  conditionValue: (label: string) => `Choose one of ${label}'s values.`,
  conditionQuote: 'A value with a quote or a backslash cannot be a condition.',
  noControl: 'Choose a control to promote.',
  postsPerPage: `Posts per page is a whole number from ${POSTS_PER_PAGE.min} to ${POSTS_PER_PAGE.max}.`,
  couldNot: "We couldn't save that just now.",
  /** Story 7.10 — the compile's refusals of a binding that no longer holds, each naming the setting as Ghost does */
  deleted: (name: string) => `${name} is promoted from a section that is no longer on your site. Delete the setting in Theme settings, or bring the section back.`,
  hidden: (name: string) => `${name} is promoted from a hidden section. Show the section, or delete the setting in Theme settings.`,
  changed: (name: string) => `${name} was promoted from a control that has changed. Delete it and promote it again.`,
  /** a rich text or the accent posted without D6c's confirm or the accent's caution */
  confirm: 'Confirm first — promoting this changes what your theme carries.',
} as const

/** A label's key: an accented letter keeps its letter, then lowercase, each run of anything else one `_`, no leading digit
 *  or `_`, no trailing `_`; `''` when nothing survives. `'Show the Button!'` → `show_the_button`, `'Café menu'` →
 *  `cafe_menu`, `'2nd line'` → `nd_line`. */
export const settingKey = (label: string): string =>
  label.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^[0-9_]+|_+$/g, '')

/** WHAT GHOST ADMIN CALLS A SETTING: its KEY, never a label. Ghost has no label field — its Design panel names every
 *  setting from the key, the first letter raised, each `_` a space, and API, CTA and RSS in capitals (read in source,
 *  2026-10-10: Ghost 6.58.0's `core/built/admin/assets/index-BOJzlYiz.js` `mU`, and 5.130.6's
 *  `admin-x-settings/index-BVxh86CD.mjs` `iR`, the same function, called on `e.key` for each of the five types). So a
 *  setting is named once, at Promote, and its label is this (Story 7.9's Question 6, ruled option 1, owner, 2026-10-10). */
export const ghostName = (key: string): string =>
  key.replace(/^[a-z]/, (c) => c.toUpperCase()).replace(/_/g, ' ').replace(/\b(API|CTA|RSS)\b/gi, (w) => w.toUpperCase())

/** `key` while it is free, else the first free `key_2`, `key_3`, … — `slug.ts`'s `claim` with `_`. */
export function claimKey(taken: ReadonlySet<string>, key: string): string {
  let name = key
  for (let n = 2; taken.has(name); n++) name = `${key}_${n}`
  return name
}

/** The key's own rules, or null: the column's shape, two characters at least (gscan `:225`), never reserved. */
export function keyRefusal(key: string): string | null {
  if (key.length < 2) return SETTING_WORDS.keyShort
  if (!/^[a-z][a-z0-9_]*$/.test(key)) return SETTING_WORDS.keyShape
  if ((RESERVED_SETTING_KEYS as readonly string[]).includes(key)) return SETTING_WORDS.reserved(key)
  return null
}

/** What a control becomes in Ghost, at its current value — or null where it is never promoted, offers fewer than
 *  two values (gscan: `options.length < 2` fails), or prints two values alike (Ghost's panel would offer the same word
 *  twice, and 7.10 could not map the chosen word back to one value). A toggle is a boolean; a segmented or named select a
 *  select whose labels are the panel's words for each value (`valueWords`, R-170). */
export function settingOf(def: ControlDef, value: string): Pick<SettingRow, 'type' | 'options' | 'default_value'> | null {
  const type = PROMOTED_TYPE[def.type]
  if (type === null || def.values.length < 2) return null
  if (type === 'boolean') return { type, options: null, default_value: value === 'on' ? 'true' : 'false' }
  const options = def.values.map((v) => ({ value: v, label: valueWords(def.valueLabels, v) }))
  if (new Set(options.map((o) => o.label)).size !== options.length) return null
  // Story 7.10 (AD-36): a label reaches a `{{#match}}` argument as a quoted string, so one carrying a quote, a backslash or
  // a brace is never offered — refused, never escaped (the validator does not limit `valueLabels`' characters)
  if (options.some((o) => labelRefused(o.label))) return null
  return { type, options, default_value: valueWords(def.valueLabels, def.values.includes(value) ? value : def.default) }
}

/** A value label that may not stand inside a `{{#match}}` argument: `"`, `'`, `\`, `{` or `}` (AD-36). */
const labelRefused = (label: string): boolean => /["'\\{}]/.test(label)

/** The values a condition on `target` may name: a select's option labels, a boolean's two — and none for any other
 *  type, which Ghost could not compare to one of its own values. */
export const conditionValues = (target: Pick<SettingRow, 'type' | 'options'>): readonly (string | boolean)[] =>
  target.type === 'select' ? (target.options ?? []).map((o) => o.label) : target.type === 'boolean' ? [true, false] : []

/** The condition's NQL — `key:'Value'` for a select, `key:true` for a boolean. A value carrying `'` or `\` never gets
 *  here: `checkSetting` refuses it rather than escape it. */
export const visibilityNql = ({ key, value }: Visibility): string => (typeof value === 'boolean' ? `${key}:${value}` : `${key}:'${value}'`)

/**
 * Every rule a stored setting must meet, against the project's OTHER settings — the first that fails, as its sentence,
 * or null. On creation `others` is every row already stored, so the cap is checked here too; on an edit it excludes
 * the row itself.
 */
export function checkSetting(row: SettingRow, others: readonly SettingRow[]): string | null {
  if (others.length >= USER_SETTING_CAP) return SETTING_WORDS.cap
  // the key before the label: since Question 6 the label is the key's own words, so a label that leaves no key ("🎉")
  // is refused as the key it failed to make, never as a label nobody left empty
  const key = keyRefusal(row.key)
  if (key !== null) return key
  if (row.label.trim() === '') return SETTING_WORDS.label
  if (others.some((o) => o.key === row.key)) return SETTING_WORDS.taken(row.key)
  if (!(GHOST_SETTING_TYPES as readonly string[]).includes(row.type)) return SETTING_WORDS.type
  if (!(GHOST_SETTING_GROUPS as readonly string[]).includes(row.group_name)) return SETTING_WORDS.group
  switch (row.type) {
    case 'select':
      if (!Array.isArray(row.options) || row.options.length < 2) return SETTING_WORDS.options
      if (!row.options.some((o) => o.label === row.default_value)) return SETTING_WORDS.selectDefault
      break
    case 'boolean':
      if (row.default_value !== 'true' && row.default_value !== 'false') return SETTING_WORDS.booleanDefault
      break
    case 'color':
      if (!/^#[0-9a-f]{6}$/i.test(row.default_value ?? '')) return SETTING_WORDS.colour
      break
    case 'image':
      if (row.default_value !== null) return SETTING_WORDS.imageDefault
      break
  }
  const v = row.visibility_condition
  if (v === null) return null
  if (v.key === row.key) return SETTING_WORDS.self
  const target = others.find((o) => o.key === v.key)
  if (target === undefined || keyRefusal(target.key) === SETTING_WORDS.keyShort) return SETTING_WORDS.condition
  if (!conditionValues(target).includes(v.value)) return SETTING_WORDS.conditionValue(ghostName(target.key))
  if (typeof v.value === 'string' && /['\\]/.test(v.value)) return SETTING_WORDS.conditionQuote
  // a chain of conditions that comes back to this setting could hide every setting on it in Ghost's panel for good; the
  // walk is bounded, so a loop among the OTHERS (which this check would have refused when it was made) cannot spin
  let at: SettingRow | undefined = target
  for (let hop = 0; hop <= others.length && at?.visibility_condition; hop++) {
    const next: string = at.visibility_condition.key
    if (next === row.key) return SETTING_WORDS.cycle
    at = others.find((o) => o.key === next)
  }
  return null
}

/** A posted page size as a number from 1 to 100, or the sentence that refuses it — `12.5`, `abc`, `0`, `101` and an
 *  absent value alike. */
export function postsPerPage(value: unknown): number | string {
  const n = typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN
  return n >= POSTS_PER_PAGE.min && n <= POSTS_PER_PAGE.max ? n : SETTING_WORDS.postsPerPage
}

/** ONE ROW AS GHOST READS IT in `package.json`'s `config.custom` — the entry Story 7.10's emitter writes under the row's
 *  key, and the shape both pinned gscans are held to here (`gate/custom-settings.test.ts`): a select's labels and its
 *  default label, a boolean's default as JSON, no `group` for Site wide, the condition as NQL. */
export function ghostEntry(row: SettingRow): Record<string, unknown> {
  return {
    type: row.type,
    ...(row.options === null ? {} : { options: row.options.map((o) => o.label) }),
    ...(row.default_value === null ? {} : { default: row.type === 'boolean' ? row.default_value === 'true' : row.default_value }),
    ...(row.group_name === 'site_wide' ? {} : { group: row.group_name }),
    ...(row.visibility_condition === null ? {} : { visibility: visibilityNql(row.visibility_condition) }),
  }
}

/* ─────────────────────────────── Story 7.10 — promoting a control, a text, a picture or the accent ─────────────────────────────── */

/** `bound_to`, as the module reads it — the schema's own `jsonb`, so no migration (R-99): a control on one instance (7.9),
 *  a content prop on one instance, or the Style Pack's accent. The ONE statement of the shape: the column comment's list
 *  predates `prop`. */
export type Binding =
  | { kind: 'control'; instanceId: string; controlKey: string }
  | { kind: 'prop'; instanceId: string; path: string }
  | { kind: 'token'; token: 'accent' }

const filled = (v: unknown): v is string => typeof v === 'string' && v !== ''

/** A stored `bound_to` as one of the three shapes, or null for anything else — a value nothing in the product wrote,
 *  which no reader trusts (AD-36). */
export function bindingOf(json: unknown): Binding | null {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) return null
  const b = json as Record<string, unknown>
  if (b['kind'] === 'control' && filled(b['instanceId']) && filled(b['controlKey'])) return { kind: 'control', instanceId: b['instanceId'], controlKey: b['controlKey'] }
  if (b['kind'] === 'prop' && filled(b['instanceId']) && filled(b['path'])) return { kind: 'prop', instanceId: b['instanceId'], path: b['path'] }
  if (b['kind'] === 'token' && b['token'] === 'accent') return { kind: 'token', token: 'accent' }
  return null
}

/** One spelling of a binding as a string — the `?promote=` value the editor links with and Theme settings opens on, and
 *  a map key. Compared, never parsed into markup. */
export const bindingId = (b: Binding): string =>
  b.kind === 'token' ? `token:${b.token}` : b.kind === 'control' ? `control:${b.instanceId}:${b.controlKey}` : `prop:${b.instanceId}:${b.path}`

/** FR-Q3: the Ghost type each content prop becomes when promoted — a text or a rich text is Ghost's plain `text` (D6c), a
 *  picture its `image`; a link, a date, an icon and a list never (Ghost has no such setting). Keyed by every prop type, as
 *  `PROMOTED_TYPE` is, so a new one is a compile error here. */
export const PROMOTED_PROP_TYPE: Readonly<Record<PropType, SettingType | null>> = {
  text: 'text', richtext: 'text', image: 'image', url: null, icon: null, date: null, array: null,
}

/** What a content prop becomes in Ghost at its value, or null where it is never promoted: a type Ghost has no setting for,
 *  or a prop carrying R-27's inline tokens (Ghost would print `{members}` as typed). A text starts at its words alone, its
 *  marks dropped (`plainText`) — none at all when it has no words, so Ghost starts it empty and the theme falls back to
 *  the prop's own empty behaviour; a picture has no start (Ghost forbids an image default). */
export function propSettingOf(def: PropDef, value: unknown): Pick<SettingRow, 'type' | 'options' | 'default_value'> | null {
  const type = PROMOTED_PROP_TYPE[def.type]
  if (type === null || (def.tokens?.length ?? 0) > 0) return null
  if (type === 'image') return { type, options: null, default_value: null }
  const words = plainText(value)
  return { type, options: null, default_value: words === '' ? null : words }
}

/** The accent promoted: Ghost's `color`, starting at the pack's light accent (always `#rrggbb` — `assertPack`). */
export const accentSettingOf = (pack: AccentOf): Pick<SettingRow, 'type' | 'options' | 'default_value'> =>
  ({ type: 'color', options: null, default_value: pack.light.accent })

/** What a holder's design is read for: its controls, its props, its markup (which props it prints) and its name. */
export type HolderEntry = Pick<ControlEntry, 'controlSchema' | 'contentSchema' | 'html' | 'universals'> & { name: string }
/** A stored doc as `bindingState` walks it. */
export type HolderDoc = { readonly instances: readonly DocInstance[] }
export type Holder = { instance: DocInstance; entry: HolderEntry }
export type Derived = Pick<SettingRow, 'type' | 'options' | 'default_value'>

/**
 * A binding's state over the project's STORED docs, page 2s included — the one answer Theme settings, the editor and the
 * compile ask for:
 *   - `live`: a visible instance of that id whose design declares the control (`controlSchema`) or prints the prop
 *     (`markupProps`), with what it becomes in Ghost (`setting`, the start the canvas holds) from the FIRST such holder in
 *     `docs`' order — the caller's: `pageOf`'s in the app, the compile's file order, page 1 before its page 2 in both, and
 *     an instance id repeats only between a page 1 and its page 2's copy, so the two orders agree. The accent is always
 *     live, at the pack's light accent;
 *   - `parked`: the instance is there and visible but its design does not declare it (a shuffle, FR-D19) — `holder` names
 *     the first visible one;
 *   - `hidden`: every holder is hidden; `deleted`: no stored doc holds it;
 *   - `changed`: what it now derives is not the stored `type`, or nothing at all (a label refused, a prop that took tokens).
 */
export type BindingState =
  | { state: 'live'; setting: Derived; holder?: Holder }
  | { state: 'parked'; holder: Holder }
  | { state: 'hidden' | 'deleted' | 'changed' }

export function bindingState(
  binding: Binding,
  docs: readonly HolderDoc[],
  library: (designId: string) => HolderEntry | undefined,
  type: SettingType,
  pack: AccentOf,
): BindingState {
  if (binding.kind === 'token') {
    const setting = accentSettingOf(pack)
    return setting.type === type ? { state: 'live', setting } : { state: 'changed' }
  }
  const holders = docs.flatMap((d) => d.instances.filter((i) => i.instanceId === binding.instanceId))
  if (holders.length === 0) return { state: 'deleted' }
  const shown = holders.filter((i) => !i.hidden)
  if (shown.length === 0) return { state: 'hidden' }
  // a visible section whose design the library no longer has is no hidden one: what it was promoted from has changed
  // (the review, 2026-10-10 — it used to fall through to `hidden`)
  const visible = shown.flatMap((instance) => {
    const entry = library(instance.designId)
    return entry === undefined ? [] : [{ instance, entry }]
  })
  if (visible.length === 0) return { state: 'changed' }
  const declares = ({ entry }: Holder): boolean =>
    binding.kind === 'control'
      ? entry.controlSchema.some((c) => c.name === binding.controlKey)
      : Object.hasOwn(entry.contentSchema, binding.path) && !binding.path.includes('[]') && markupProps(entry.html).includes(binding.path)
  const holder = visible.find(declares)
  if (holder === undefined) return { state: 'parked', holder: visible[0] as Holder }
  const setting = derive(binding, holder)
  return setting === null || setting.type !== type ? { state: 'changed' } : { state: 'live', setting, holder }
}

/** What a declaring holder's control or prop becomes in Ghost, at its value IN FORCE (`resolveControls`, the emitters'
 *  own reader: a control another greys is at the value it renders). */
function derive(binding: Exclude<Binding, { kind: 'token' }>, { instance, entry }: Holder): Derived | null {
  if (binding.kind === 'control') {
    const def = entry.controlSchema.find((c) => c.name === binding.controlKey) as ControlDef
    return settingOf(def, resolveControls(entry, instance.controls)[def.name] ?? def.default)
  }
  return propSettingOf(entry.contentSchema[binding.path] as PropDef, getPath(instance.content, binding.path))
}

/** Question 1's start, as the compile ships it and the page prints it — null where the binding is not live. */
export const startOf = (...args: Parameters<typeof bindingState>): Derived | null => {
  const s = bindingState(...args)
  return s.state === 'live' ? s.setting : null
}

/** A setting's reader path, `@custom.<key>` — reached only after the key's own rules (AD-36): a key the module refuses
 *  never enters an expression. */
export function customPath(key: string): string {
  const refused = keyRefusal(key)
  if (refused !== null) throw new Error(`AD-36: ${JSON.stringify(key)} is no setting key — ${refused}`)
  return `@custom.${key}`
}

/** THE READER A PROMOTED SWITCH OR CHOICE SHIPS, as its root attribute's value (AD-3: `data-{control}` stays one
 *  attribute, the stylesheet unchanged): a `{{#match}}` chain over every value Ghost may hold, each branch the control's
 *  own value, its `{{else}}` the canvas's start — reached only when Ghost renders the setting as `null`, which it does for
 *  a setting its condition hides (`HIDDEN_SETTING_VALUE`, read in source, both majors). Ghost's `match` is strict
 *  equality, so a switch compares the literals `true` and `false`; a choice compares its option LABELS, the strings Ghost
 *  stores. It is Casper's and Source's own shape (`{{#match …}}…{{else match …}}…{{else}}…{{/match}}` in an attribute).
 *  A choice's branches take the THREE-argument form, `@custom.k "=" "Label"`: Ghost's `match.js` reads `"="` as the same
 *  strict equality as two arguments (its `default:` arm — read in source, 6.58.0 and 5.130.6, which differ by a comment),
 *  and gscan's `GS090-NO-UNKNOWN-CUSTOM-THEME-SELECT-VALUE-IN-MATCH` checks only the three-argument form
 *  (`lint-no-unknown-custom-theme-select-value-in-match.js`, `params.length === 3`) — so both pinned gscans hold every
 *  label this chain writes to the select's own options, which the two-argument form would never let them do.
 *  A label `settingOf` would refuse, a value outside the control's grammar or a start that is no value is refused here
 *  too, by name, before anything is written (AD-36). `write` prints each value in place — the identity, or, for a control
 *  another control greys (`disabledBy`), what that control renders at it (`renderTree`'s `value` in `core.ts`). */
export function matchChain(key: string, setting: Pick<SettingRow, 'type' | 'options'>, start: string, write: (value: string) => string = (v) => v): string {
  const path = customPath(key)
  const branches: [string, string][] = setting.type === 'boolean'
    ? [['true', 'on'], ['false', 'off']]
    : setting.type === 'select'
      ? (setting.options ?? []).map((o): [string, string] => {
        if (labelRefused(o.label)) throw new Error(`AD-36: the value label ${JSON.stringify(o.label)} cannot stand in a {{#match}} argument — a label carries no quote, backslash or brace.`)
        return [`"=" "${o.label}"`, o.value]
      })
      : []
  if (branches.length < 2) throw new Error(`a ${setting.type} setting has no {{#match}} reader — only a switch or a choice is a root attribute.`)
  for (const v of [start, ...branches.map(([, value]) => value)]) {
    if (!CONTROL_VALUE_RE.test(v)) throw new Error(`AD-36: data value ${JSON.stringify(v)} is not a closed control value.`)
  }
  if (!branches.some(([, value]) => value === start)) throw new Error(`the start ${JSON.stringify(start)} is none of the setting's values.`)
  const [first, ...rest] = branches as [[string, string], ...[string, string][]]
  return `{{#match ${path} ${first[0]}}}${write(first[1])}${rest.map(([arg, value]) => `{{else match ${path} ${arg}}}${write(value)}`).join('')}{{else}}${write(start)}{{/match}}`
}
