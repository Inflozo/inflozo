// Story 4.7 — FR-G7's behaviour-module registry as code reads it, and the two pure functions every later
// story calls: `bundle`, which makes the one `assets/js/main.js`, and `checkThemeJs`, which proves a
// theme's `assets/js/` holds nothing else (FR-G7(1), FR-J4).
//
// Pure under AD-1: sources are HANDED IN. This file reads no file and imports nothing from `src/`, so
// `vocabulary.ts` can import it without a cycle. The prose half of the one table — each module's no-JS
// line and its edit-safe sentence — is research §7; `registry.json` beside `core.js` is what code reads,
// and `python3 tools/derive-module-reach.py --check` fails when the two disagree.

import registry from '../modules/registry.json' with { type: 'json' }
import { i18nAttr, jsKeyRefusal } from './catalog.ts'

export type ModuleRow = {
  readonly name: string
  readonly editSafe: boolean
  readonly animates: boolean
  /** Story 4.9 — the catalog's js keys this module writes; both emitters stamp each on its mount (S5) */
  readonly strings?: readonly string[]
}

/** Every feature module, in research §2.1's order. `core` is not a row: it is the platform runtime. */
export const MODULES: readonly ModuleRow[] = registry.modules

/** S5's registry half: every key a row declares is a live js key, and no two keys on one row derive the same
 *  `data-i18n-*` attribute — two would be one attribute on the mount, and the second string silently lost. */
export function moduleStringsRefusals(rows: readonly ModuleRow[] = MODULES): string[] {
  const out: string[] = []
  for (const r of rows) {
    const attrs = new Map<string, string>()
    for (const key of r.strings ?? []) {
      const bad = jsKeyRefusal(key)
      if (bad !== null) out.push(`${r.name}: ${bad} — a module's strings are live js keys (S5)`)
      const attr = i18nAttr(key)
      const clash = attrs.get(attr)
      if (clash !== undefined) out.push(`${r.name}: "${clash}" and "${key}" both derive ${attr}, so one would overwrite the other on the mount`)
      attrs.set(attr, key)
    }
  }
  return out
}

/** A name that must not come back, with the ruling that retired it — so the refusal says why. */
export const RETIRED_MODULES: Readonly<Record<string, string>> = registry.retired

export type ModuleDeclaration = { name: string; below?: number }

/** The files `bundle` concatenates, keyed by module name (`core`, `lightbox`), never by path. */
export type ModuleSources = Readonly<Record<string, string>>

const own = <T>(o: Readonly<Record<string, T>>, k: string): T | undefined =>
  Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined

const NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/** `data-module`'s grammar: a registry name, optionally with the width in CSS pixels below which the
 *  script runs (R-38) — `accordion` or `accordion:768`. Returns the refusal sentence the validator reports
 *  as `bad-value` and both emitters throw. One name per element, so `js-enabled` on it means one thing. */
export function parseModuleDeclaration(v: string): ModuleDeclaration | string {
  const cut = v.indexOf(':')
  const name = cut === -1 ? v : v.slice(0, cut)
  const width = cut === -1 ? undefined : v.slice(cut + 1)
  if (!NAME_RE.test(name)) {
    return `"${v}" is not a module declaration — a registry name, optionally with the width below which it runs: "accordion" or "accordion:768"`
  }
  if (name === 'core') {
    return '"core" is the platform runtime: it runs on every page, and no design declares it (FR-G7(4))'
  }
  const retired = own(RETIRED_MODULES, name)
  if (retired !== undefined) return `"${name}" is not in FR-G7's registry and must not come back: ${retired}`
  if (!MODULES.some((m) => m.name === name)) {
    return `"${name}" is not in FR-G7's registry (research-section-js-libraries.md §2.1). A behaviour that needs no module is written without one (§2.2): <details>, an in-page anchor with scroll-behavior, CSS columns, :has(), position: sticky, server-side member gating, CSS transitions, <audio controls> and Ghost's own pagination`
  }
  if (width === undefined) return { name }
  if (!/^[1-9][0-9]*$/.test(width)) {
    return `"${v}" — the width below which a module runs is a whole number of CSS pixels above zero: "${name}:768"`
  }
  return { name, below: Number(width) }
}

/** FR-G7(2): the modules a set of placed designs needs — each entry's `js`, unioned, in registry order,
 *  so removing a design removes its names unless another placed design declares them too. */
export function moduleUnion(entries: readonly { readonly js?: readonly string[] }[]): string[] {
  const wanted = new Set(entries.flatMap((e) => e.js ?? []))
  for (const n of wanted) {
    if (!MODULES.some((m) => m.name === n)) throw new Error(`"${n}" is not in FR-G7's registry, so no theme can carry it`)
  }
  return MODULES.filter((m) => wanted.has(m.name)).map((m) => m.name)
}

/** `nav-drawer` → `navDrawer`: the one function a module file declares. */
export const moduleFunctionName = (name: string): string => name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())

const HEADER = '// Inflozo main.js, made by bundle() from packages/library/modules/ and never edited by hand: '

/** FR-J4's `main.js`: a header naming `core` and the modules, then ONE wrapping function — so nothing
 *  lands on `window` — holding each source verbatim, `core` first, then the start call. A classic script,
 *  loaded `defer`: a module file carrying `export`, concatenated here, would be a SyntaxError that
 *  silently turns every site to its no-JS state, which is why each file's top level is checked. `rows` is
 *  the registry unless a probe hands its own. Throws on an unknown name, a missing source, or a source
 *  whose top level is not exactly one declaration of the expected name. */
export function bundle(names: readonly string[], sources: ModuleSources, rows: readonly ModuleRow[] = MODULES): string {
  const wanted = new Set(names)
  for (const r of rows) {
    // a row's name reaches a RegExp and the emitted start call, so it is held to the registry grammar first
    if (!NAME_RE.test(r.name) || r.name === 'core') throw new Error(`"${r.name}" is not a module name bundle() can carry — a registry name like "nav-drawer", never "core"`)
  }
  for (const n of wanted) {
    if (!rows.some((r) => r.name === n)) throw new Error(`"${n}" is not a row of the registry bundle() was handed, so it has no edit-safe or motion value to start with`)
  }
  const picked = rows.filter((r) => wanted.has(r.name))
  const files = ['core', ...picked.map((r) => r.name)]
  const bodies = files.map((name) => {
    const src = own(sources, name)
    if (src === undefined) throw new Error(`${name}.js has no source — main.js carries only files authored in packages/library/modules/ (FR-G7(1))`)
    const why = topLevelShape(src, name === 'core' ? 'core' : moduleFunctionName(name))
    if (why !== null) throw new Error(`${name}.js — ${why}`)
    return src
  })
  const start = picked
    .map((r) => `[${JSON.stringify(r.name)}, ${moduleFunctionName(r.name)}, { editSafe: ${r.editSafe === true}, animates: ${r.animates === true} }]`)
    .join(', ')
  return `${HEADER}${files.join(' · ')}\n;(function () {\n'use strict'\n${bodies.join('\n')}\ncore(window, [${start}])\n})()\n`
}

/** FR-G7(1) as one check over a theme's files (theme-relative path → text): `assets/js/` holds `main.js`,
 *  byte-identical to `bundle` of the names its header lists over the repo's sources, and Ghost's
 *  `cards.js`, and nothing else — and `main.js` is present, since every theme carries `core`. Returns
 *  sentences; a header it cannot read, or a name with no repo source, is a sentence rather than a throw. `cards.js`'s own bytes are not checked here (DW-135). */
export function checkThemeJs(files: Readonly<Record<string, string>>, sources: ModuleSources): string[] {
  const out: string[] = []
  if (own(files, 'assets/js/main.js') === undefined) {
    out.push('assets/js/main.js is missing — every generated theme carries core, so a theme with no main.js ships no runtime at all (FR-G7(4))')
  }
  for (const [path, text] of Object.entries(files)) {
    if (!path.startsWith('assets/js/')) continue
    const file = path.slice('assets/js/'.length)
    if (file === 'cards.js') continue
    if (file !== 'main.js') {
      out.push(`${path} is not repo-authored — assets/js/ holds main.js, bundled from packages/library/modules/, and Ghost's cards.js, and nothing else (FR-G7(1))`)
      continue
    }
    const nl = text.indexOf('\n')
    const first = nl === -1 ? text : text.slice(0, nl)
    const listed = first.startsWith(HEADER) ? first.slice(HEADER.length).split(' · ') : []
    if (listed[0] !== 'core') {
      out.push(`${path} does not open with bundle()'s header naming core and its modules, so it cannot be traced to repo sources (FR-G7(1))`)
      continue
    }
    const missing = listed.filter((n) => own(sources, n) === undefined)
    if (missing.length > 0) {
      out.push(`${path} names ${missing.join(', ')}, with no source in packages/library/modules/ — main.js carries repo-authored code only (FR-G7(1))`)
      continue
    }
    let expected: string
    try {
      expected = bundle(listed.slice(1), sources)
    } catch (e) {
      out.push(`${path} — ${e instanceof Error ? e.message : String(e)}`)
      continue
    }
    if (expected !== text) {
      out.push(`${path} is not the bytes bundle() makes from ${listed.join(' · ')} — it was changed after bundling, and only repo-authored code may ship (FR-G7(1))`)
    }
  }
  return out
}

// ─── the top-level shape of one module file ──────────────────────────────────

/** null when `src`'s top level is exactly `function <fn>(…) { … }`, comments and whitespace around it.
 *  ponytail: a lexical scan, not a parser — it skips comments, strings, template literals and regex
 *  literals and counts brackets. Its ceiling is the one every hand lexer has: a `/` straight after `}`
 *  or a postfix `++` is read as division, so a regex literal in exactly that spot can end the scan early
 *  and refuse a file that is fine. It never accepts a second top-level statement. Swap in a real JS
 *  parser if a module ever trips it. */
function topLevelShape(src: string, fn: string): string | null {
  const at = skipTrivia(src, 0)
  const head = new RegExp(`^function\\s+${fn}\\s*\\(`).exec(src.slice(at))
  if (head === null) {
    return `its top level must be one function declaration named ${fn}, "function ${fn}(…) { … }", and nothing else: no export, no import, no statement`
  }
  const end = closeOfDeclaration(src, at + head[0].length - 1)
  if (end === -1) return `function ${fn} never closes`
  const rest = skipTrivia(src, end + 1)
  if (rest < src.length) {
    return `its top level carries more than function ${fn}: ${JSON.stringify(src.slice(rest, rest + 40))} — one declaration per file, and nothing beside it`
  }
  return null
}

function skipTrivia(src: string, from: number): number {
  let i = from
  for (;;) {
    while (i < src.length && /\s/.test(src[i] ?? '')) i++
    if (src.startsWith('//', i)) {
      const nl = src.indexOf('\n', i)
      i = nl === -1 ? src.length : nl + 1
    } else if (src.startsWith('/*', i)) {
      const close = src.indexOf('*/', i + 2)
      i = close === -1 ? src.length : close + 2
    } else {
      return i
    }
  }
}

const REGEX_AFTER_WORD = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'void', 'yield', 'await', 'delete', 'throw', 'new'])

/** The index of the `}` that brings the bracket depth back to zero, starting at the parameter list's `(`. */
function closeOfDeclaration(src: string, from: number): number {
  let depth = 0
  const templates: number[] = [] // the depth at which each open `${` resumes its template's text
  for (let i = from; i < src.length; i++) {
    const c = src[i]
    if (c === '/' && src[i + 1] === '/') {
      i = src.indexOf('\n', i)
      if (i === -1) return -1
    } else if (c === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2)
      if (i === -1) return -1
      i++
    } else if (c === '"' || c === "'") {
      i = endOfQuoted(src, i, c)
      if (i === -1) return -1
    } else if (c === '`') {
      const t = templateText(src, i + 1)
      if (t.at === -1) return -1
      if (t.open) {
        templates.push(depth)
        depth++
      }
      i = t.at
    } else if (c === '/' && regexAllowed(src, i)) {
      i = endOfRegex(src, i)
      if (i === -1) return -1
    } else if (c === '(' || c === '[' || c === '{') {
      depth++
    } else if (c === ')' || c === ']' || c === '}') {
      depth--
      if (c === '}' && templates.length > 0 && templates[templates.length - 1] === depth) {
        templates.pop()
        const t = templateText(src, i + 1)
        if (t.at === -1) return -1
        if (t.open) {
          templates.push(depth)
          depth++
        }
        i = t.at
      } else if (c === '}' && depth === 0) {
        return i
      } else if (depth < 0) {
        return -1
      }
    }
  }
  return -1
}

/** Template text from `from`: the index of its closing backtick, or of the `{` of a `${` that opens. */
function templateText(src: string, from: number): { at: number; open: boolean } {
  for (let i = from; i < src.length; i++) {
    if (src[i] === '\\') i++
    else if (src[i] === '`') return { at: i, open: false }
    else if (src[i] === '$' && src[i + 1] === '{') return { at: i + 1, open: true }
  }
  return { at: -1, open: false }
}

function endOfQuoted(src: string, from: number, quote: string): number {
  for (let i = from + 1; i < src.length; i++) {
    if (src[i] === '\\') i++
    else if (src[i] === quote) return i
    else if (src[i] === '\n') return -1
  }
  return -1
}

function regexAllowed(src: string, slash: number): boolean {
  let j = slash - 1
  while (j >= 0 && /\s/.test(src[j] ?? '')) j--
  const p = src[j] ?? ''
  if (p === ')' || p === ']' || p === '}') return false
  if (/[A-Za-z0-9_$]/.test(p)) {
    let k = j
    while (k >= 0 && /[A-Za-z0-9_$]/.test(src[k] ?? '')) k--
    return REGEX_AFTER_WORD.has(src.slice(k + 1, j + 1))
  }
  return true
}

function endOfRegex(src: string, from: number): number {
  let inClass = false
  for (let i = from + 1; i < src.length; i++) {
    const c = src[i]
    if (c === '\\') i++
    else if (c === '\n') return -1
    else if (c === '[') inClass = true
    else if (c === ']') inClass = false
    else if (c === '/' && !inClass) return i
  }
  return -1
}
