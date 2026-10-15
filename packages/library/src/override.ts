// Story 7.12 — THE ONE JUDGE OF A TRANSLATION OVERRIDE (FR-Q8, appendix-h1 V9/V10/S3, DW-141, DW-142, R-106).
//
// `overrideRefusal(key, value)` answers a sentence or nothing. It REFUSES and never repairs: nothing here escapes, strips
// or rewrites a customer's words. Two callers, one rule: the Translations page's save action, before the write, and
// `compileTheme`, over every value it writes to a locale file, as a backstop that fails the build (a row can reach the
// table by another route, AD-6).
//
// GHOST'S FORMAT IS EXECUTED, NOT IMITATED. Both majors' theme i18n (`i18n.js`, 6.58.0 `:208-221`) build `new
// MessageFormat(string, locale)` with intl-messageformat 5.4.3 (parser 2.1.3) for every `{{t}}` call, the constructor
// OUTSIDE the try — so a string it cannot parse errors the page that prints it. The last check renders the value through
// that exact version and through the shim's `t()` (the canvas) with a string sample per placeholder, and refuses any
// difference: what the canvas shows is what the site prints. Constructed with `'en'` always and handed strings only, so
// no host locale and no number formatting enters the answer.
//
// SERVER ONLY. This file is reached through `@inflozo/library/override` alone; `catalog.ts`, which the canvas imports,
// never imports it, so intl-messageformat never reaches a browser bundle (DW-142: never
// `@formatjs/icu-messageformat-parser`, which accepts `'{'` that 5.4.3 throws on — MEASUREMENTS §44(c)).

import imf from 'intl-messageformat'
// The shim's `t()` by path: `@inflozo/ghost-shim` depends on this package, so naming it here would make a workspace cycle.
import { t } from '../../ghost-shim/src/index.ts'
import { CATALOG, isPluralString, placeholdersOf, translatableKeys, type Catalog } from './catalog.ts'

// a CommonJS module whose `module.exports.default` is itself (its own index.js): Node's ESM hands the module and TypeScript's
// `nodenext` types it with `.default`, while the app's `bundler` resolution types the import as the class itself — so the
// class is `.default` where there is one, else the import (both are the same function at run time)
const IntlMessageFormat = (imf as typeof imf & { default?: typeof imf }).default ?? imf

/** The longest override, in characters. */
export const OVERRIDE_MAX = 500

const list = (names: readonly string[]): string => names.map((p) => `{${p}}`).join(' or ')

/** Every sentence an override can be answered with — ONE list, beside the rule (the page shows these words). */
export const OVERRIDE_WORDS = {
  unsaved: "We couldn't save that just now.",
  blank: 'Type the wording, or press Use the default.',
  control: "This has a character your site can't show.",
  long: `Keep it to ${OVERRIDE_MAX} characters.`,
  markup: (ch: string) => `“${ch}” can't be used in this label: your site prints it as page code.`,
  percent: 'Keep the %: your site puts the number there.',
  brace: (ch: string, value: string, own: readonly string[]) =>
    `The “${ch}” in “${value}” would break every page that shows it — braces mark a placeholder, ${own.length === 0 ? 'and this label has none' : `like ${list(own)}`}.`,
  missing: (name: string) => `Keep {${name}}: your site fills it in.`,
  foreign: (name: string, own: readonly string[]) => `{${name}} isn't one of this label's placeholders. It has ${own.length === 0 ? 'none' : list(own)}.`,
  apostrophes: 'Two apostrophes in a row show as one on your site. Type one.',
  // Question 3, ruled option 1 (owner, 2026-10-15): today's Ghost prints it as typed, a later intl-messageformat hides the placeholder
  quoted: (value: string, name: string) => `The “'” beside “{” in “${value}” prints on your site as typed today, and a Ghost update could make it hide {${name}}. Remove it.`,
  differs: 'Your site would print this differently from the canvas. Check its apostrophes and braces.',
} as const

// S3: a placeholder is plain `{snake_case}`
const PLACEHOLDER = /\{([a-z][a-z0-9]*(?:_[a-z0-9]+)*)\}/g
const QUOTED = /'\{([a-z][a-z0-9]*(?:_[a-z0-9]+)*)\}/

/** The override `value` for `key`, judged: null when it ships as typed, else the sentence refusing it. In order: a key the
 *  surface lists; not blank (R-106); no C0 character; at most `OVERRIDE_MAX` characters; for a `{{plural}}` string, which
 *  Ghost prints unescaped (DW-141), no `<` or `&` and its `%` kept; every brace a placeholder's (S3); the placeholder set
 *  the default's (V10); and Ghost's render equal to the canvas's (V9). */
export function overrideRefusal(key: string, value: unknown, catalog: Catalog = CATALOG): string | null {
  if (typeof key !== 'string' || !translatableKeys(catalog).includes(key) || typeof value !== 'string') return OVERRIDE_WORDS.unsaved
  const en = (catalog.keys[key] as { en: string }).en
  if (value.trim() === '') return OVERRIDE_WORDS.blank
  if ([...value].some((c) => c.charCodeAt(0) < 0x20)) return OVERRIDE_WORDS.control
  if ([...value].length > OVERRIDE_MAX) return OVERRIDE_WORDS.long
  if (isPluralString(en)) {
    for (const ch of ['<', '&']) if (value.includes(ch)) return OVERRIDE_WORDS.markup(ch)
    if (!isPluralString(value)) return OVERRIDE_WORDS.percent
  }
  const own = placeholdersOf(en)
  const stray = /[{}]/.exec(value.replace(PLACEHOLDER, (m) => ' '.repeat(m.length)))
  if (stray !== null) return OVERRIDE_WORDS.brace(stray[0], value, own)
  const used = placeholdersOf(value)
  const foreign = used.find((p) => !own.includes(p))
  if (foreign !== undefined) return OVERRIDE_WORDS.foreign(foreign, own)
  const missing = own.find((p) => !used.includes(p))
  if (missing !== undefined) return OVERRIDE_WORDS.missing(missing)
  if (value.includes("''")) return OVERRIDE_WORDS.apostrophes
  // ICU's quoting starts at an apostrophe before a brace. 5.4.3's parser 2.1.3 prints `'{minutes}' min` as `'5' min`, as the
  // shim does (executed here, and on T1 6.58.0 — MEASUREMENTS §80); intl-messageformat 10.7.16 prints `{minutes} min`
  // (executed 2026-10-15). So it is refused as S3's rule, against a Ghost that updates the library, never as a break today.
  const quoted = QUOTED.exec(value)
  if (quoted !== null) return OVERRIDE_WORDS.quoted(value, quoted[1] as string)
  const sample = Object.fromEntries(own.map((p) => [p, `[${p}]`]))
  let ghost: string
  try {
    ghost = String(new IntlMessageFormat(value, 'en').format(sample))
  } catch {
    return OVERRIDE_WORDS.differs
  }
  return ghost === t(value, sample) ? null : OVERRIDE_WORDS.differs
}
