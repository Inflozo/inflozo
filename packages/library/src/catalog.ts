// Story 4.9 — FR-Q6's string catalog as code reads it: the keys, their English defaults, and the one door an
// override passes.
//
// One copy of each thing. `../strings/catalog.json` is the machine copy and appendix-h1 §3 is the normative
// table; `node tools/check-catalog.mjs` holds the two equal, in order, in both directions, and renders every
// default through intl-messageformat 5.4.3 — the version both Ghost majors bundle — against the shim's `t()`.
// A key's placeholder set is DERIVED from its default here and stored nowhere, and no count is written down.
//
// What `{{t}}` does was read in both releases and then recorded on T1 and T3 (MEASUREMENTS §44): a dotted key
// is looked up as ONE key, a missing key prints itself, an omitted param renders "An error occurred" and an
// empty one leaves a hole. So a placeholder is plain `{snake_case}` — `core`, the shim and Ghost's private
// i18next backend substitute names and nothing else — and a call supplies exactly its key's set (V4).
//
// Pure under AD-1: this file imports only its JSON, so `vocabulary.ts` and `modules.ts` can import it.

import catalogJson from '../strings/catalog.json' with { type: 'json' }

/** appendix-h1 §2's markers, lower-cased. */
export const CATALOG_MARKS = ['js', 'a11y', 'prop', 'locked', 'canvas'] as const
export type CatalogMark = (typeof CATALOG_MARKS)[number]

export type CatalogEntry = {
  readonly en: string
  readonly marks: readonly string[]
  /** why no design renders it any more — it still ships in every locale file (S1, S4) */
  readonly retired?: string
  /** the key that replaced it; exactly one `migrations` entry names the pair (S2) */
  readonly supersededBy?: string
}

/** S2's migration map entry. `carryOverride` copies a user's override from `from` to `to`. */
export type CatalogMigration = {
  readonly from: string
  readonly to: string
  readonly reason: string
  readonly carryOverride: boolean
}

export type Catalog = {
  readonly about?: string
  readonly keys: Readonly<Record<string, CatalogEntry>>
  readonly migrations: readonly CatalogMigration[]
}

export const CATALOG: Catalog = catalogJson as Catalog

/** S1: `namespace.name`, grouped by function as appendix-h1 groups them. */
export const CATALOG_KEY_RE = /^[a-z][a-z0-9]*\.[a-z0-9]+(_[a-z0-9]+)*$/

/** S3: a placeholder name — and a `data-t` param name, which must match it — is snake_case. */
export const PLACEHOLDER_NAME_RE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/

const PLACEHOLDER_RE = /\{([a-z][a-z0-9]*(?:_[a-z0-9]+)*)\}/g

const own = <T>(o: Readonly<Record<string, T>>, k: string): T | undefined =>
  Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined

/** The placeholder names a default carries, in order of first appearance. Derived, never stored. */
export function placeholdersOf(en: string): string[] {
  return [...new Set([...en.matchAll(PLACEHOLDER_RE)].map((m) => m[1] as string))]
}

/** A key's placeholder set, from its default. Throws for a key the catalog does not hold. */
export function placeholders(key: string, catalog: Catalog = CATALOG): string[] {
  const entry = own(catalog.keys, key)
  if (entry === undefined) throw new Error(`"${key}" is not a catalog key`)
  return placeholdersOf(entry.en)
}

/** S5's mechanical derivation: strip the leading namespace, every `.` and `_` becomes `-`, prefix
 *  `data-i18n-`. `pagination.load_more_loading` → `data-i18n-load-more-loading`. */
export function i18nAttr(key: string): string {
  const cut = key.indexOf('.')
  return `data-i18n-${key.slice(cut + 1).replace(/[._]/g, '-')}`
}

/** Every English default, keyed — what a render uses when it is handed no strings. */
export function englishStrings(catalog: Catalog = CATALOG): Record<string, string> {
  return Object.fromEntries(Object.entries(catalog.keys).map(([k, e]) => [k, e.en]))
}

const hasMark = (e: CatalogEntry, m: CatalogMark) => e.marks.includes(m)

/** A default carrying a `%` outside its placeholders is written for Ghost's `{{plural}}`, which replaces the first
 *  `%` with the count (appendix-h1 §3.10). Derived from the default, like the placeholder set — never a mark. */
export const isPluralString = (en: string): boolean => en.replace(PLACEHOLDER_RE, '').includes('%')

/** The catalog's format rules (S1, S3, S7, and the removal rule), as a list of sentences — empty when the
 *  catalog holds. `tools/check-catalog.mjs` runs it over the machine copy with a control per rule. */
export function catalogFailures(catalog: Catalog): string[] {
  const out: string[] = []
  const keys = Object.keys(catalog.keys)
  const seenNamespaces: string[] = []
  for (const key of keys) {
    const e = catalog.keys[key] as CatalogEntry
    const at = `${key} (catalog.json)`
    if (!CATALOG_KEY_RE.test(key)) out.push(`${at} — a key is namespace.name in lowercase snake_case (S1)`)
    const ns = key.slice(0, key.indexOf('.'))
    if (seenNamespaces.at(-1) !== ns) {
      if (seenNamespaces.includes(ns)) out.push(`${at} — namespace "${ns}" is split: a namespace's keys sit together, as appendix-h1 groups them (S9)`)
      seenNamespaces.push(ns)
    }
    if (typeof e.en !== 'string' || e.en.trim() === '') {
      out.push(`${at} — the English default is empty; a default is never empty`)
      continue
    }
    const rest = e.en.replace(PLACEHOLDER_RE, '')
    if (/[{}]/.test(rest)) {
      out.push(`${at} — ${JSON.stringify(e.en)} carries a brace that is not a plain {snake_case} placeholder; no plural, select or number argument (S3)`)
    }
    if (/''|'[{}]/.test(e.en)) {
      out.push(`${at} — ${JSON.stringify(e.en)} uses ICU apostrophe quoting, which intl-messageformat 5.4.3 renders differently from core and the shim (S3)`)
    }
    if (!Array.isArray(e.marks) || new Set(e.marks).size !== e.marks.length || e.marks.some((m) => !(CATALOG_MARKS as readonly string[]).includes(m))) {
      out.push(`${at} — marks ${JSON.stringify(e.marks)} must be a set drawn from ${CATALOG_MARKS.join(' · ')}`)
      continue
    }
    if (key.startsWith('credit.') !== hasMark(e, 'locked')) {
      out.push(`${at} — every credit.* key is locked and no other key is (S7)`)
    }
    if (hasMark(e, 'canvas') && hasMark(e, 'js')) out.push(`${at} — a canvas key is never js: it never reaches a theme`)
    if (e.retired !== undefined && e.supersededBy !== undefined) out.push(`${at} — a key is either retired or superseded, not both`)
    if (e.retired !== undefined && (typeof e.retired !== 'string' || e.retired.trim() === '')) out.push(`${at} — retired carries no reason`)
    if (e.supersededBy !== undefined) {
      const to = own(catalog.keys, e.supersededBy)
      if (to === undefined || to.retired !== undefined || to.supersededBy !== undefined) {
        out.push(`${at} — supersededBy "${e.supersededBy}" is not a live key`)
      }
      const named = catalog.migrations.filter((m) => m.from === key && m.to === e.supersededBy)
      if (named.length !== 1) out.push(`${at} — superseded by ${e.supersededBy}, and ${named.length} migrations entries name that pair; exactly one must (S2)`)
    }
  }
  for (const m of catalog.migrations) {
    const at = `migration ${m.from} → ${m.to} (catalog.json)`
    if (own(catalog.keys, m.from)?.supersededBy !== m.to) out.push(`${at} — ${m.from} is not marked supersededBy ${m.to}`)
    if (typeof m.reason !== 'string' || m.reason.trim() === '') out.push(`${at} — carries no reason`)
    if (typeof m.carryOverride !== 'boolean') out.push(`${at} — carryOverride is true or false`)
    if (m.carryOverride === true && m.to.startsWith('credit.')) out.push(`${at} — carryOverride would write an override onto a locked credit.* key (S7)`)
  }
  return out
}

/** A refusal with the validator's code, and the sentence both the validator and the runtime print. */
export type CatalogRefusal = { code: 'catalog-key' | 'catalog-params' | 'catalog-prop'; message: string }

/** V2 for `data-t`/`data-t-attr`: a key the markup may render through `{{t}}`, or why not. */
export function tKeyRefusal(key: string, catalog: Catalog = CATALOG): CatalogRefusal | null {
  const e = own(catalog.keys, key)
  const why = e === undefined
    ? 'is not in the catalog (appendix-h1 §3). A new chrome string needs its key there BEFORE the design that uses it is authored (S9)'
    : e.retired !== undefined
      ? `is retired — ${e.retired}. A retired key still ships in every locale file, but no design renders it`
      : e.supersededBy !== undefined
        ? `is superseded by "${e.supersededBy}" — render the key that replaced it`
        : hasMark(e, 'js')
          ? 'is a js key: JavaScript writes it, so it reaches a page only as data-i18n-* on its module\'s mount, never through {{t}} (S5)'
          : hasMark(e, 'canvas')
            ? 'is canvas-only: it renders in the editor and never reaches a theme (appendix-h1 §3.9)'
            : isPluralString(e.en)
              ? 'is written for {{plural}}: its % is the count that helper substitutes (appendix-h1 §3.10), so it reaches a page only as a (t …) sub-expression inside {{plural}} — through {{t}} alone the % would print'
              : null
  return why === null ? null : { code: 'catalog-key', message: `"${key}" ${why}.` }
}

/** V4: a `{{t}}` call supplies EXACTLY its key's placeholder set — an omitted param renders "An error
 *  occurred" on both majors and an extra one is a name the translator never sees. */
export function tParamsRefusal(key: string, params: readonly string[], catalog: Catalog = CATALOG): CatalogRefusal | null {
  const want = placeholders(key, catalog)
  const missing = want.filter((p) => !params.includes(p))
  const extra = params.filter((p) => !want.includes(p))
  if (missing.length === 0 && extra.length === 0) return null
  const parts = [
    missing.length > 0 ? `misses ${missing.join(', ')}` : '',
    extra.length > 0 ? `passes ${extra.join(', ')}, which the default does not carry` : '',
  ].filter((p) => p !== '')
  return {
    code: 'catalog-params',
    message: `"${key}" takes exactly ${want.length === 0 ? 'no param' : want.map((p) => `{${p}}`).join(', ')} and this call ${parts.join(' and ')} (V4) — an omitted param renders "An error occurred" on both Ghost majors.`,
  }
}

/** S6: a text prop whose initial value is a catalog string names a live, `prop`-marked key and carries no
 *  `default` of its own — the catalog IS its default. */
export function catalogPropRefusal(path: string, prop: { type?: unknown; catalog?: unknown; default?: unknown }, catalog: Catalog = CATALOG): CatalogRefusal | null {
  if (prop.catalog === undefined) return null
  const key = typeof prop.catalog === 'string' ? prop.catalog : ''
  const e = own(catalog.keys, key)
  const why = prop.type !== 'text'
    ? `is ${String(prop.type)}; only a text prop takes its initial value from the catalog`
    : e === undefined || e.retired !== undefined || e.supersededBy !== undefined
      ? `names ${JSON.stringify(prop.catalog)}, which is not a live catalog key`
      : !hasMark(e, 'prop')
        ? `names "${key}", which appendix-h1 does not mark prop — only a prop-marked string may become an editable text prop`
        : e.marks.includes('js') || placeholdersOf(e.en).length > 0
          ? `names "${key}", which a text prop cannot carry: a prop holds no placeholder and no js string`
          : prop.default !== undefined
            ? 'carries a default beside its catalog key — the catalog string is the default, so one of the two would be ignored'
            : null
  return why === null ? null : { code: 'catalog-prop', message: `prop "${path}" ${why} (S6).` }
}

/** S5: a key a module's mount may carry as data-i18n-*, or why not. */
export function jsKeyRefusal(key: string, catalog: Catalog = CATALOG): string | null {
  const e = own(catalog.keys, key)
  if (e === undefined) return `"${key}" is not in the catalog`
  if (e.retired !== undefined || e.supersededBy !== undefined) return `"${key}" is not live`
  if (!hasMark(e, 'js')) return `"${key}" is not a js key — a string a template prints goes through {{t}} (S5)`
  return null
}

/** THE one door an override passes, on its way to a render or a locale file. Returns every key's string —
 *  the English default, or the user's override — after the migration map has carried overrides forward
 *  (S2). Throws, never drops: a `credit.*` override is a tampered payload (S7), and an unknown key is one no
 *  surface offers. ICU validation of an override's TEXT (V9, V10) is Story 7.12's. */
export function resolveStrings(overrides: Readonly<Record<string, unknown>>, catalog: Catalog = CATALOG): Record<string, string> {
  const given: Record<string, string> = {}
  for (const [key, value] of Object.entries(overrides)) {
    if (own(catalog.keys, key) === undefined) {
      throw new Error(`"${key}" carries an override and is not a catalog key — nothing offers it, so the override is refused rather than dropped.`)
    }
    if (key.startsWith('credit.')) {
      throw new Error(`"${key}" carries an override, and credit.* is locked (S7): not overridable on any plan, so an override can only come from a tampered payload. The build fails rather than dropping it.`)
    }
    if (typeof value !== 'string') throw new Error(`"${key}"'s override is not a string`)
    // R-106 (owner, 2026-09-14): a blank is refused, never shipped — Ghost prints the key for an empty value
    if (value.trim() === '') throw new Error(`"${key}" carries a blank override (${JSON.stringify(value)}). Ghost prints the key itself for an empty value, so the build stops until the phrase is given text (R-106).`)
    given[key] = value
  }
  for (const m of catalog.migrations) {
    if (m.carryOverride && own(given, m.from) !== undefined && own(given, m.to) === undefined) given[m.to] = given[m.from] as string
  }
  return { ...englishStrings(catalog), ...given }
}
