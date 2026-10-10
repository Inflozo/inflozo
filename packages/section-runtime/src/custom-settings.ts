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

import { valueWords, type ControlDef, type ControlType } from '@inflozo/library'

/** Ghost's cap on a theme's settings (gscan `customSettingsKeys.length > 20`). */
export const SETTING_CAP = 20
/** FR-Q5's three dark built-ins every project emits — never a user's row, never counted in the meter. ONE list:
 *  `color_scheme` is FR-Q5's own name; the other two are Story 7.9's proposal for Story 7.11 to confirm or rename HERE. */
export const RESERVED_SETTING_KEYS = ['color_scheme', 'dark_accent_color', 'dark_logo'] as const
/** The user's share, derived — the cap trigger's `>= 17` (`complete_schema.sql`), which a test reads back. */
export const USER_SETTING_CAP = SETTING_CAP - RESERVED_SETTING_KEYS.length

/** Ghost's five types, in gscan's order. This story creates `boolean` and `select`; 7.10 adds the other three. */
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
  return { type, options, default_value: valueWords(def.valueLabels, def.values.includes(value) ? value : def.default) }
}

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
