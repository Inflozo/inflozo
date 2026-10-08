// Story 4.7 — FR-G7's behaviour-module registry as code reads it, and the two pure functions every later
// story calls: `bundle`, which makes the one `assets/js/main.js`, and `checkThemeJs`, which proves a
// theme's `assets/js/` holds nothing else (FR-G7(1), FR-J4).
//
// Story 7.5 (FR-J4) adds the theme's second script and its tags, each written ONCE here and called by the compile, CI and
// the stress fixture alike: `cardsJs` (Ghost's vendored card scripts, copied unchanged under one header), `MAIN_JS_TAG`
// and `CARDS_JS_TAG`, `checkThemeJs`'s comparison of `cards.js` (DW-135), `checkThemeScripts` over every template's
// `<script>`s (DW-134), and `moduleKeyRefusals`, the registry half of DW-146 (its literal half is `eslint.config.js`).
//
// Pure under AD-1: sources are HANDED IN. This file reads no file and imports nothing from `src/` but the catalog, so
// `vocabulary.ts` can import it without a cycle. The prose half of the one table — each module's no-JS
// line and its edit-safe sentence — is research §7; `registry.json` beside `core.js` is what code reads,
// and `python3 tools/derive-module-reach.py --check` fails when the two disagree.

import registry from '../modules/registry.json' with { type: 'json' }
import { i18nAttr, jsKeyRefusal } from './catalog.ts'

export type ModuleRow = {
  readonly name: string
  readonly editSafe: boolean
  readonly animates: boolean
  /** Story 5.15, R-175 — it changes the page on a timer or as the page scrolls, with nothing pressed, so a mount the
   *  editor holds still carries the PAUSED chip. REQUIRED, so a registry row without it is a compile error. */
  readonly movesByItself: boolean
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

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

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

/** `main.js`'s first line, before the names it carries. It ships in every theme, so it names no builder and carries no
 *  internal reference (FR-J1); `checkThemeJs` reads the names back from it. */
const HEADER = "// This file's scripts, one function each, started together at the end of this file: "

/** The names a `main.js` header lists — `core` first — or null when its first line is not `bundle`'s header. CI reads
 *  the list with this, so the header has one reader. */
export function bundledNames(text: string): string[] | null {
  const nl = text.indexOf('\n')
  const first = nl === -1 ? text : text.slice(0, nl)
  return first.startsWith(HEADER) ? first.slice(HEADER.length).split(' · ') : null
}

/** FR-J4's `main.js`: a header naming `core` and the modules, then ONE wrapping function — so nothing
 *  lands on `window` — holding each source, `core` first, then the start call. A classic script, loaded
 *  `defer`. Each file is ONE EXPORTED DECLARATION (Story 5.15: the editor imports `core` and runs it against
 *  the canvas window, DW-136), and its one `export` is removed as it is pasted: an `export` left in a classic
 *  script is a SyntaxError that silently turns every site to its no-JS state, which is why each file's top
 *  level is checked. Nothing else in a file is touched — its comments ship too, so CI holds every module file to the
 *  theme's own text scan (Story 7.5); nothing strips them here, since a lexical stripper would share
 *  `topLevelShape`'s ceiling and could cut code. `rows` is the registry unless a probe hands its own.
 *  Throws on an unknown name, a missing source, or a source whose top level is not exactly one exported
 *  declaration of the expected name. */
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
    // exactly the seven bytes `export ` — the shape check above admits only that spelling, so this, core.test.mjs's
    // byte check and run-verify-core.py's `coreVerbatim` all remove the same thing (review)
    const at = skipTrivia(src, 0)
    return src.slice(0, at) + src.slice(at).replace(/^export /, '')
  })
  const start = picked
    .map((r) => `[${JSON.stringify(r.name)}, ${moduleFunctionName(r.name)}, { editSafe: ${r.editSafe === true}, animates: ${r.animates === true} }]`)
    .join(', ')
  return `${HEADER}${files.join(' · ')}\n;(function () {\n'use strict'\n${bodies.join('\n')}\ncore(window, [${start}])\n})()\n`
}

// ─── Story 7.5: the two tags, and Ghost's card scripts ───────────────────────

/** The two script tags a theme carries, in `default.hbs`'s head after the stylesheet: Ghost's own attribute order
 *  (`ghost_head.js` writes `<script defer src=…>`), so neither holds the page up (NFR-2 (3)). Each address is one
 *  `{{asset}}` expression, as gscan asks of a theme file (`GS030-ASSET-REQ`). */
export const MAIN_JS_TAG = '<script defer src="{{asset "js/main.js"}}"></script>'
export const CARDS_JS_TAG = '<script defer src="{{asset "js/cards.js"}}"></script>'

/** Ghost's card names (`package.json`'s `card_assets.exclude`): the one grammar a card name reaching a header holds. */
const CARD_NAME_RE = /^[a-z0-9_]+$/

/** `tools/probe/record-cards.py`'s two-line head on each vendored chunk, by its exact shape: the Ghost version, the card
 *  (its file's name) and Ghost's copyright line. It would ship a repo path and a repo tool's name, so it is cut. */
const VENDORED_HEAD = /^\/\* Vendored verbatim from Ghost (\d+\.\d+\.\d+), core\/frontend\/src\/cards\/js\/([a-z0-9_]+)\.js, by `python3 tools\/probe\/record-cards\.py`\.\n {3}(Copyright \(c\) [^\n*]+?)\. MIT licence — the full text is vendor\/LICENSE-ghost\.txt\. \*\/\n/

/** Each named card's chunk, its head cut and read: one Ghost version and one copyright line for all of them. Throws,
 *  naming the card, on a name outside Ghost's card grammar, a card with no script, a head not as vendored, an empty or
 *  unterminated body, or a version or copyright that differs from the first card's. */
function vendored(names: readonly string[], scripts: Readonly<Record<string, string>>): { version: string; copyright: string; cards: [string, string][] } {
  const cards = [...new Set(names)].sort(byCode)
  if (cards.length === 0) throw new Error('cards.js carries at least one card — a theme with no scripted card ships no cards.js')
  let first: { version: string; copyright: string } | undefined
  const out: [string, string][] = []
  for (const name of cards) {
    if (!CARD_NAME_RE.test(name)) throw new Error(`${JSON.stringify(name)} is no Ghost card name (${CARD_NAME_RE.source})`)
    const text = own(scripts, name)
    if (text === undefined) throw new Error(`${name}: Ghost's card scripts hold no ${name}.js, so cards.js cannot carry it`)
    const head = VENDORED_HEAD.exec(text)
    if (head === null || head[2] !== name) throw new Error(`${name}.js does not open with record-cards.py's head naming ${name}.js, so it is not Ghost's chunk as vendored`)
    const body = text.slice(head[0].length)
    if (body.trim() === '' || !body.endsWith('\n')) throw new Error(`${name}.js: Ghost's chunk is empty or does not end its last line, so it cannot be copied whole`)
    const [, version = '', , copyright = ''] = head
    if (first === undefined) first = { version, copyright }
    else if (version !== first.version || copyright !== first.copyright) {
      throw new Error(`${name}.js is copied from Ghost ${version} (${copyright}), and ${cards[0]}.js from Ghost ${first.version} (${first.copyright}) — cards.js copies one Ghost`)
    }
    out.push([name, body])
  }
  return { ...(first as { version: string; copyright: string }), cards: out }
}

/** The Ghost version the named cards' scripts are copied from — what README.md says beside `cards.js`. */
export const cardsVersion = (names: readonly string[], scripts: Readonly<Record<string, string>>): string => vendored(names, scripts).version

/** FR-J4's `cards.js`: one header naming Ghost, the version, the cards and the licence file, then each card's chunk in
 *  code-unit order under a one-line label — Ghost's own bytes, never re-indented, minified or edited. Each chunk ends
 *  `})();\n`, so plain concatenation is safe. `scripts` is the vendored files by card name, read by the shell. */
export function cardsJs(names: readonly string[], scripts: Readonly<Record<string, string>>): string {
  const { version, copyright, cards } = vendored(names, scripts)
  return `/* Ghost's own scripts for these cards: ${cards.map(([n]) => n).join(' · ')} — copied unchanged from Ghost ${version}, core/frontend/src/cards/js/.
   ${copyright}. MIT licence: the full text is LICENSE-ghost.txt. */
${cards.map(([n, body]) => `/* ${n}.js */\n${body}`).join('')}`
}

const JS_DIR = 'assets/js/'

/** The cards `package.json` excludes, or a sentence when it cannot be read. `card_assets: true` excludes none. Those are
 *  the two forms `compileTheme` writes (FR-Q7); Ghost's other two, `false` and `{ include: [...] }`, reach no theme of
 *  ours, so each is a sentence naming the form rather than a reading of Ghost's grammar (review, 2026-10-08). */
function excludedCards(files: Readonly<Record<string, string>>): string[] | string {
  const pkg = own(files, 'package.json')
  if (pkg === undefined) return 'package.json is missing'
  let parsed: unknown
  try {
    parsed = JSON.parse(pkg)
  } catch {
    return 'package.json does not parse'
  }
  const assets = (parsed as { config?: { card_assets?: unknown } } | null)?.config?.card_assets
  if (assets === undefined || assets === true) return []
  const exclude = (assets as { exclude?: unknown } | null)?.exclude
  return Array.isArray(exclude) && exclude.every((c) => typeof c === 'string') ? exclude : 'package.json\'s card_assets is neither true nor { "exclude": [...] }, the two forms a compiled theme carries — a false or an include list is not read here'
}

/** FR-G7(1) and FR-J4 as one check over a theme's files (theme-relative path → text): `assets/js/` holds `main.js`,
 *  byte-identical to `bundle` of the names its header lists over the repo's sources, and — when `package.json` excludes a
 *  card Ghost ships a script for — `cards.js`, byte-identical to `cardsJs` of exactly those cards over `cardScripts`
 *  (DW-135), and nothing else; `main.js` is present, since every theme carries `core`. Called without `cardScripts` (a
 *  probe theme, the stress fixture), a `cards.js` is refused, since it is compared to nothing. Returns sentences; a
 *  header it cannot read, or a name with no repo source, is a sentence rather than a throw. */
export function checkThemeJs(files: Readonly<Record<string, string>>, sources: ModuleSources, cardScripts?: Readonly<Record<string, string>>): string[] {
  const out: string[] = []
  if (own(files, `${JS_DIR}main.js`) === undefined) {
    out.push('assets/js/main.js is missing — every generated theme carries core, so a theme with no main.js ships no runtime at all (FR-G7(4))')
  }
  /** The scripted cards package.json excludes, in code-unit order — or a sentence when they cannot be known. */
  const expected = (): string[] | string => {
    const ex = excludedCards(files)
    if (typeof ex === 'string' || cardScripts === undefined) return ex
    return [...new Set(ex)].filter((c) => own(cardScripts, c) !== undefined).sort(byCode)
  }
  for (const [path, text] of Object.entries(files)) {
    if (!path.startsWith(JS_DIR)) continue
    const file = path.slice(JS_DIR.length)
    if (file === 'cards.js') {
      if (cardScripts === undefined) {
        out.push(`${path} is compared to nothing: no copy of Ghost's card scripts was handed to this check, so it cannot be traced to Ghost (DW-135)`)
        continue
      }
      const cards = expected()
      if (typeof cards === 'string') out.push(`${path} cannot be traced: ${cards}, so which cards it carries is unknown (DW-135)`)
      else if (cards.length === 0) out.push(`${path} ships, and package.json excludes no card Ghost has a script for — Ghost serves those scripts itself, so this copy is not the theme's to carry (FR-Q7)`)
      else {
        let want: string
        try {
          want = cardsJs(cards, cardScripts)
        } catch (e) {
          out.push(`${path} — ${e instanceof Error ? e.message : String(e)}`)
          continue
        }
        if (want !== text) out.push(`${path} is not the bytes cardsJs() makes from Ghost's scripts for ${cards.join(' · ')}, the scripted cards package.json excludes — it was changed after copying, or carries another card (DW-135)`)
      }
      continue
    }
    if (file !== 'main.js') {
      out.push(`${path} is not repo-authored — assets/js/ holds main.js, bundled from packages/library/modules/, and Ghost's cards.js, and nothing else (FR-G7(1))`)
      continue
    }
    const listed = bundledNames(text) ?? []
    if (listed[0] !== 'core') {
      out.push(`${path} does not open with bundle()'s header naming core and its modules, so it cannot be traced to repo sources (FR-G7(1))`)
      continue
    }
    const missing = listed.filter((n) => own(sources, n) === undefined)
    if (missing.length > 0) {
      out.push(`${path} names ${missing.join(', ')}, with no source in packages/library/modules/ — main.js carries repo-authored code only (FR-G7(1))`)
      continue
    }
    let expectedMain: string
    try {
      expectedMain = bundle(listed.slice(1), sources)
    } catch (e) {
      out.push(`${path} — ${e instanceof Error ? e.message : String(e)}`)
      continue
    }
    if (expectedMain !== text) {
      out.push(`${path} is not the bytes bundle() makes from ${listed.join(' · ')} — it was changed after bundling, and only repo-authored code may ship (FR-G7(1))`)
    }
  }
  if (own(files, `${JS_DIR}cards.js`) === undefined && cardScripts !== undefined) {
    const cards = expected()
    if (typeof cards === 'string') out.push(`assets/js/cards.js: ${cards}, so whether a card's script is owed is unknown (FR-Q7)`)
    else if (cards.length > 0) {
      const effect = (n: string): string => (n === 'audio' || n === 'video' ? `${n}'s player would never play` : `${n}'s script would never run`)
      out.push(`assets/js/cards.js is missing — package.json excludes ${cards.join(', ')}, which switches off Ghost's own script for ${cards.length === 1 ? 'that card' : 'those cards'}, and nothing in this theme carries it: ${cards.map(effect).join(', ')} (FR-Q7)`)
    }
  }
  return out
}

/** A Handlebars comment, `{{!-- … --}}` or `{{! … }}` — Ghost never prints one, so no check reads inside it (a layer name
 *  lands in one). The one spelling: the compiler's size and page checks read templates through it too. */
export const HBS_COMMENT = /\{\{~?!--[^]*?--~?\}\}|\{\{~?![^]*?\}\}/g

/** DW-134 over every `.hbs`, its Handlebars comments removed first: each `<script …>…</script>` is `MAIN_JS_TAG` in
 *  `default.hbs`, exactly once; `CARDS_JS_TAG` in `default.hbs`, exactly once when `assets/js/cards.js` ships and never
 *  otherwise; or, in `default.hbs` alone, a bare `<script>` whose body equals a value of `inline` — a repo source handed in
 *  by name, byte for byte (empty today; DW-328 decides at Story 9.1 whether that door ever opens, and its candidate is a
 *  head script, so the door is the shell's only — review, 2026-10-08). A `<script` that never closes is a sentence.
 *  Returns sentences, each naming the file and the tag. */
export function checkThemeScripts(files: Readonly<Record<string, string>>, inline: Readonly<Record<string, string>> = {}): string[] {
  const out: string[] = []
  const named = new Set(Object.values(inline).map((src) => `<script>${src}</script>`))
  const shown = (tag: string): string => JSON.stringify(tag.length > 80 ? `${tag.slice(0, 80)}…` : tag)
  let main = 0
  let cards = 0
  for (const path of Object.keys(files).filter((p) => p.endsWith('.hbs')).sort(byCode)) {
    const text = (files[path] as string).replace(HBS_COMMENT, '')
    const open = /<script\b/gi
    for (let m = open.exec(text); m !== null; m = open.exec(text)) {
      const close = /<\/script\s*>/gi
      close.lastIndex = m.index
      const end = close.exec(text)
      if (end === null) {
        out.push(`${path}: ${shown(text.slice(m.index))} opens a script that never closes`)
        break
      }
      const tag = text.slice(m.index, end.index + end[0].length)
      open.lastIndex = end.index + end[0].length
      if (path === 'default.hbs' && tag === MAIN_JS_TAG) main++
      else if (path === 'default.hbs' && tag === CARDS_JS_TAG) cards++
      else if (path !== 'default.hbs' || !named.has(tag)) out.push(`${path}: ${shown(tag)} is no script a theme may carry — its templates carry main.js's and cards.js's tags in default.hbs, and nothing else (DW-134)`)
    }
  }
  if (main !== 1) out.push(`default.hbs carries ${MAIN_JS_TAG} ${main} times — exactly once, so core runs once on every page (FR-J4)`)
  const shipsCards = own(files, `${JS_DIR}cards.js`) !== undefined
  if (shipsCards && cards !== 1) out.push(`default.hbs carries ${CARDS_JS_TAG} ${cards} times, and assets/js/cards.js ships — exactly once, or Ghost's card scripts never run (FR-J4)`)
  if (!shipsCards && cards > 0) out.push(`default.hbs carries ${CARDS_JS_TAG}, and no assets/js/cards.js ships — the tag would ask for a file that is not there (FR-J4)`)
  return out
}

/** DW-146's registry half: every module file but `core` is a registry row, and every `t('…')` it calls names a string its
 *  row declares — `i18nAttr(k)` without `data-i18n-`, for some `k` in `strings` — since `ctx.t(key)` reads
 *  `data-i18n-<key>` off the mount, and a key no row declares is stamped on no mount. The lint (`eslint.config.js`)
 *  makes every `t()` key a literal, so this plain scan finds them all. Its ceiling, which review holds: the scan is over the
 *  raw text, so a `t('…')` inside a comment or a string is read as a call and held to the row too — write the key you mean
 *  there, or none (review, 2026-10-08). */
export function moduleKeyRefusals(sources: ModuleSources, rows: readonly ModuleRow[] = MODULES): string[] {
  const out: string[] = []
  for (const name of Object.keys(sources).sort(byCode)) {
    if (name === 'core') continue
    const row = rows.find((r) => r.name === name)
    if (row === undefined) {
      out.push(`${name}.js is no registry row — a module file is named for its row in registry.json (FR-G7)`)
      continue
    }
    const keys = new Set((row.strings ?? []).map((k) => i18nAttr(k).slice('data-i18n-'.length)))
    for (const m of (sources[name] as string).matchAll(/(?<![\w$])t\s*\(\s*(['"])(.*?)\1/g)) {
      const key = m[2] as string
      if (!keys.has(key)) out.push(`${name}.js calls t('${key}'), and its registry row declares no string that derives data-i18n-${key} — the mount carries no such attribute, so the words would be empty (DW-146, S5)`)
    }
  }
  return out
}

// ─── the top-level shape of one module file ──────────────────────────────────

/** null when `src`'s top level is exactly `export function <fn>(…) { … }`, comments and whitespace around it.
 *  ponytail: a lexical scan, not a parser — it skips comments, strings, template literals and regex
 *  literals and counts brackets. Its ceiling is the one every hand lexer has: a `/` straight after `}`
 *  or a postfix `++` is read as division, so a regex literal in exactly that spot can end the scan early
 *  and refuse a file that is fine. It never accepts a second top-level statement. Swap in a real JS
 *  parser if a module ever trips it. */
function topLevelShape(src: string, fn: string): string | null {
  const at = skipTrivia(src, 0)
  const head = new RegExp(`^export function\\s+${fn}\\s*\\(`).exec(src.slice(at))
  if (head === null) {
    return `its top level must be one exported function declaration named ${fn}, "export function ${fn}(…) { … }", and nothing else: no import, no second declaration, no statement`
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
