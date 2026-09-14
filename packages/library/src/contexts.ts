// FR-H7 — where a Ghost binding is legal, read from the ONE copy of the Template Context Matrix.
//
// Ghost compiles themes without strict mode, so a binding used where its field does not exist prints
// an empty string with no error at build, deploy or runtime, and passes gscan (appendix B.1 §0). The
// matrix is `../contexts/matrix.json`, proved against recordings of both live majors and Ghost's own
// source by `contexts.test.ts`; this file only READS it. Two questions are asked of it:
//
//   bindable(path, place)  — is this path legal here? `null`, or the sentence saying why not
//   offerBindings(place)   — what may be offered here, by scope and by the site's version
//
// The runtime asks the first at the one door every render passes (`section-runtime/src/core.ts`),
// and Epic 5's binding surface asks the second. Pure: no locale, no clock, versions compare as numbers.

import matrix from '../contexts/matrix.json' with { type: 'json' }
import { CUSTOM_TARGET_RE, PATH_RE, isCompileTarget } from './vocabulary.ts'

export type FieldKind = 'text' | 'url' | 'image' | 'color' | 'date' | 'number' | 'boolean' | 'list' | 'object' | 'helper'

export type MatrixField = {
  readonly kind: FieldKind
  /** the scope a list's rows or an object open */
  readonly of?: string
  /** the first Ghost release carrying this key — `offerBindings` leaves it out below */
  readonly since?: string
  /** what the recording showed that the kind alone does not say */
  readonly note?: string
  /** why no recording can show this field */
  readonly unverified?: string
  /** `@page` only: the templates where it is bindable, and the ones where it is offered */
  readonly targets?: readonly string[]
  readonly offered?: readonly string[]
}

export type ContextMatrix = {
  readonly floor: string
  readonly kinds: readonly FieldKind[]
  readonly universal: Readonly<Record<string, MatrixField>>
  readonly neverOffer: Readonly<Record<string, string>>
  readonly targets: Readonly<Record<string, { readonly top: string; readonly block?: string }>>
  readonly get: Readonly<Record<string, string>>
  readonly scopes: Readonly<Record<string, Readonly<Record<string, MatrixField>>>>
}

export const CONTEXT_MATRIX = matrix as ContextMatrix

/** One enclosing repeat, outer first: a context path (`tags`, `../posts`, `@site.navigation`), or a
 *  `{{#get}}` over a source, whose rows are that source's scope. An authored `data-items` list opens
 *  no Ghost scope and is never an entry. */
export type ScopeEntry = string | { readonly get: string }

export type BindingPlace = {
  readonly target: string
  /** the enclosing repeats, outer first — `[]` is the top level of the section */
  readonly scope: readonly ScopeEntry[]
  /** the connected site's version, `x.y.z`. Absent or unparseable, it is the floor. */
  readonly version?: string
}

/** What a path is used AS. A value prints; a repeat iterates; a condition is tested (a boolean); a
 *  helper is `data-helper`'s bare name. */
export type BindingUse = 'value' | 'repeat' | 'condition' | 'helper'

const VALUE_KINDS: ReadonlySet<FieldKind> = new Set(['text', 'url', 'image', 'color', 'date', 'number'])

const own = <T>(o: Readonly<Record<string, T>>, k: string): T | undefined =>
  Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined

/** `x.y.z` as three numbers, or null. Never a string compare: `6.9.0` is below `6.36.0`. A suffix
 *  (`6.58.0-rc.0`, what a pre-release server reports) is read by its `x.y.z`; `6.58` or a word is null. */
function parseVersion(v: string | undefined): [number, number, number] | null {
  const m = /^(\d+)\.(\d+)\.(\d+)(?![\d.])/.exec(v ?? '')
  return m === null ? null : [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** true when `version` (the floor when absent or unparseable) is at or above `since` */
export function versionAtLeast(version: string | undefined, since: string): boolean {
  const have = parseVersion(version) ?? (parseVersion(CONTEXT_MATRIX.floor) as [number, number, number])
  const want = parseVersion(since)
  if (want === null) return false
  for (let i = 0; i < 3; i++) {
    if ((have[i] as number) !== (want[i] as number)) return (have[i] as number) > (want[i] as number)
  }
  return true
}

/** The matrix's row for a compile target — `custom-{name}.hbs` is one row for every name. */
export function targetContext(target: string): { top: string; block?: string } | undefined {
  const key = CUSTOM_TARGET_RE.test(target) ? 'custom-{name}.hbs' : target
  return own(CONTEXT_MATRIX.targets, key)
}

/** The scope a section's markup is evaluated in on this target: the template's top scope, or the
 *  scope of the block the TEMPLATE opens around every section (`{{#post}}` on post, page and a
 *  membership custom template — FR-H7, §7.4). The chain is outermost first; its last entry is the
 *  section's own top level, and `../` climbs it. */
export function rootScope(target: string): { chain: string[]; block?: string } | string {
  if (!isCompileTarget(target)) return `"${target}" is not a compile target`
  const t = targetContext(target)
  if (t === undefined) return `the context matrix has no row for ${target}`
  if (t.block === undefined) return { chain: [t.top] }
  const opened = own(scopeFields(t.top), t.block)
  return { chain: [t.top, opened?.of ?? ''], block: t.block }
}

function scopeFields(name: string): Readonly<Record<string, MatrixField>> {
  return own(CONTEXT_MATRIX.scopes, name) ?? {}
}

const describeScope = (scope: readonly ScopeEntry[]): string =>
  scope.length === 0
    ? 'at the top level'
    : `inside ${scope.map((e) => (typeof e === 'string' ? `data-repeat="${e}"` : `a {{#get "${e.get}"}}`)).join(' › ')}`

type Resolved = { field: MatrixField; name: string }

/** A path looked up from one scope, segment by segment: `primary_tag.name` reads `name` in the scope
 *  `primary_tag` opens. Handlebars never falls through to a parent scope without `../`. */
function lookup(scopeName: string, path: string): Resolved | string {
  let fields = scopeFields(scopeName)
  let at = scopeName
  const segments = path.split('.')
  let found: MatrixField | undefined
  for (const [i, seg] of segments.entries()) {
    found = own(fields, seg)
    if (found === undefined) {
      return i === 0
        ? `"${seg}" is not a field of the ${at} scope`
        : `"${seg}" is not a field of ${segments.slice(0, i).join('.')} (the ${at} scope)`
    }
    if (i < segments.length - 1) {
      if (found.kind !== 'object' || found.of === undefined) {
        return `"${segments.slice(0, i + 1).join('.')}" is a ${found.kind}, and a dotted path reads only into an object`
      }
      at = found.of
      fields = scopeFields(at)
    }
  }
  return { field: found as MatrixField, name: at }
}

/** The chain of scopes a place stands in, innermost last, or the sentence saying why it cannot be
 *  built — an enclosing repeat that is itself not legal makes every binding inside it unreachable. */
function chainAt(place: BindingPlace): string[] | string {
  const root = rootScope(place.target)
  if (typeof root === 'string') return root
  const chain = [...root.chain]
  for (const [i, entry] of place.scope.entries()) {
    if (typeof entry !== 'string') {
      const row = own(CONTEXT_MATRIX.get, entry.get)
      if (row === undefined) return `{{#get "${entry.get}"}} is not a queryable source (${Object.keys(CONTEXT_MATRIX.get).join(', ')})`
      // `{{#get}}` opens a frame of its own around `{{#foreach}}` (its result: the rows and their
      // pagination), so `../` from a row lands there, not in the section — as Handlebars resolves it
      chain.push(getFrame(entry.get), row)
      continue
    }
    const opened = resolve(entry, { target: place.target, scope: place.scope.slice(0, i) }, 'repeat')
    const bad = typeof opened === 'string' ? opened : kindRefusal(entry, opened.field, 'repeat')
    if (bad !== null) return `the enclosing data-repeat="${entry}" is not legal here — ${bad.replace(/\.$/, '')}`
    const of = (opened as Resolved).field.of
    if (of === undefined) return `the enclosing data-repeat="${entry}" iterates plain values, and nothing inside it is a field`
    chain.push(of)
  }
  return chain
}

/** the name of the frame a `{{#get}}` opens — no matrix scope has it, so nothing resolves there */
const getFrame = (source: string): string => `{{#get "${source}"}} result`

function kindRefusal(path: string, field: MatrixField, use: BindingUse): string | null {
  if (use === 'helper') return field.kind === 'helper' ? null : `"${path}" is a ${field.kind}, not a helper — data-helper names a bare helper`
  if (field.kind === 'helper') return `"${path}" is Ghost's helper, not a field — use data-helper where it is a bare helper`
  if (use === 'repeat') return field.kind === 'list' ? null : `"${path}" is a ${field.kind}, and data-repeat iterates a list`
  if (use === 'condition') return field.kind === 'boolean' ? null : `"${path}" is a ${field.kind}, and a condition tests a boolean`
  if (field.kind === 'list') return `"${path}" is a list — a list is a repeat source (data-repeat), never a value`
  if (field.kind === 'boolean') return `"${path}" is a boolean — a boolean is a condition, never a value`
  if (field.kind === 'object') return `"${path}" is an object — bind one of its fields ("${path}.…")`
  return null
}

/** The universal set: `@site`, `@config`, `@page` and the bare helpers that work in every template. */
function resolveUniversal(path: string, place: BindingPlace): Resolved | string {
  if (path === '@custom' || path.startsWith('@custom.')) {
    return `${path} is a theme setting — @custom is FR-Q3's, emitted by the theme settings in Epic 7, and never a section binding`
  }
  if (path === '@member' || path.startsWith('@member.')) {
    return `${path} is the visitor's member record — a member's details are never printed into the page (R-28); gate on membership with data-members`
  }
  const never = own(CONTEXT_MATRIX.neverOffer, path) ?? own(CONTEXT_MATRIX.neverOffer, path.split('.')[0] as string)
  if (never !== undefined) return `${path} is never offered — ${never}`
  const field = own(CONTEXT_MATRIX.universal, path)
  if (field === undefined) return `${path} is not in the universal set Ghost gives every template (appendix B.1 §2)`
  if (field.targets !== undefined) {
    const key = CUSTOM_TARGET_RE.test(place.target) ? 'custom-{name}.hbs' : place.target
    if (!field.targets.includes(key)) {
      return `${path} is set only on ${field.targets.join(', ')} — on ${place.target} it is undefined and prints nothing (appendix B.1 §3b)`
    }
  }
  if (field.since !== undefined && place.version !== undefined && !versionAtLeast(place.version, field.since)) {
    return `${path} arrived in Ghost ${field.since}, and this site runs ${place.version}`
  }
  return { field, name: 'universal' }
}

/** The field a path names at a place, or the sentence saying why it names none. */
export function resolve(path: string, place: BindingPlace, use: BindingUse = 'value'): Resolved | string {
  if (!PATH_RE.test(path)) return `"${path}" is not a binding path`
  const ups = (/^(\.\.\/)*/.exec(path)?.[0].length ?? 0) / 3
  const rest = path.slice(ups * 3)
  const where = `${describeScope(place.scope)} of ${place.target}`
  // `@` reads the root wherever it sits, exactly as Handlebars' data frame does — and Handlebars 4.7.9
  // rejects `../@site.title` outright as a parse error, which Ghost answers with a 500
  if (rest.startsWith('@')) {
    if (ups > 0) return `"${path}" — a @ path reads the root wherever it sits; write "${rest}" without ../ (Handlebars refuses the form).`
    const u = resolveUniversal(rest, place)
    return typeof u === 'string' ? `${u}.` : u
  }
  const chain = chainAt(place)
  if (typeof chain === 'string') return `"${path}" cannot be checked ${where}: ${chain.replace(/\.$/, '')}.`
  if (use === 'helper') {
    const universal = own(CONTEXT_MATRIX.universal, rest)
    if (universal?.kind === 'helper' && ups === 0) return { field: universal, name: 'universal' }
  }
  const index = chain.length - 1 - ups
  if (index < 0) return `"${path}" climbs above the top of ${place.target} — there is no scope ${ups} level${ups === 1 ? '' : 's'} up ${where}.`
  const found = lookup(chain[index] as string, rest)
  if (typeof found === 'string') {
    const home = homesOf(rest.split('.')[0] as string)
    return `"${path}" is not available ${where}: ${found}${home === '' ? '' : ` — "${rest.split('.')[0]}" lives ${home}`}.`
  }
  return found
}

/** Where a field name DOES live, for the refusal sentence: the wrapper rule's mistake is most often
 *  the right field in the wrong scope (`title` at the top of index.hbs lives inside a post). */
function homesOf(name: string): string {
  const scopes = Object.entries(CONTEXT_MATRIX.scopes).filter(([, f]) => own(f, name) !== undefined).map(([s]) => s)
  return scopes.length === 0 ? '' : `in the ${scopes.join(' · ')} scope${scopes.length === 1 ? '' : 's'}`
}

/** FR-H7: `null` when `path` is legal at this place used this way, otherwise the refusal sentence.
 *  A version, when given, refuses a key newer than the site; the runtime passes none, because a
 *  design already binding one is guarded, not refused (the version axis belongs to the offer). */
export function bindable(path: string, place: BindingPlace & { use?: BindingUse }): string | null {
  const use = place.use ?? 'value'
  const r = resolve(path, place, use)
  if (typeof r === 'string') return r
  const bad = kindRefusal(path, r.field, use)
  return bad === null ? null : `${bad} (${describeScope(place.scope)} of ${place.target}).`
}

/** The kind of the field a path names here, or null when it names none — the runtime's number guard. */
export function fieldKind(path: string, place: BindingPlace): FieldKind | null {
  const r = resolve(path, place)
  return typeof r === 'string' ? null : r.field.kind
}

export type Offer = {
  /** paths that print: text, url, image, colour, date, number */
  readonly values: readonly string[]
  /** lists a data-repeat may iterate */
  readonly repeats: readonly string[]
  /** booleans, for a condition */
  readonly conditions: readonly string[]
  /** set when the place itself cannot be built — an unknown target, an enclosing repeat that is not
   *  legal — and then the three lists are empty rather than a partial answer */
  readonly refused?: string
}

/** FR-H7: what may be OFFERED at a place. Fields of the current scope and, one object deep, their
 *  fields; the universal set with every key newer than `version` subtracted (absent = the floor); and
 *  `@page` only where it is meaningful. Never a `{{#get}}`-only resource, never a never-offer key. */
export function offerBindings(place: BindingPlace): Offer {
  const values: string[] = []
  const repeats: string[] = []
  const conditions: string[] = []
  const sort = (f: MatrixField, path: string) => {
    if (VALUE_KINDS.has(f.kind)) values.push(path)
    else if (f.kind === 'list') { if (f.of !== undefined) repeats.push(path) } // a list of plain values opens no scope
    else if (f.kind === 'boolean') conditions.push(path)
  }
  const chain = chainAt(place)
  if (typeof chain === 'string') return { values, repeats, conditions, refused: chain.replace(/\.$/, '') }
  const walk = (scope: string, prefix: string, seen: readonly string[]) => {
    for (const [name, f] of Object.entries(scopeFields(scope))) {
      const path = `${prefix}${name}`
      if (f.kind === 'object' && f.of !== undefined && !seen.includes(f.of)) walk(f.of, `${path}.`, [...seen, f.of])
      else sort(f, path)
    }
  }
  const here = chain[chain.length - 1] as string
  walk(here, '', [here])
  const key = CUSTOM_TARGET_RE.test(place.target) ? 'custom-{name}.hbs' : place.target
  for (const [path, f] of Object.entries(CONTEXT_MATRIX.universal)) {
    if (!path.startsWith('@')) continue
    if (f.since !== undefined && !versionAtLeast(place.version, f.since)) continue
    if (f.offered !== undefined && !f.offered.includes(key)) continue
    sort(f, path)
  }
  return { values, repeats, conditions }
}
