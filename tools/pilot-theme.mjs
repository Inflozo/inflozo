// Story 7.1 — THE FIVE-PILOT PROJECT, compiled: the one project `tools/check-snapshots.mjs` holds in CI (with fixed words)
// and `tools/probe/record-theme-assembly.py` uploads to T1 (with words made from its nonce). One builder, so the theme CI
// judges is the theme Ghost renders.
//
//   the site doc   A1 #1 "Header"
//   home.hbs       A4 #13 with its Background set to Contrast in Dark (Story 7.4), A17 #1 as the main feed, A22 #1
//   Home's page 2  A17 #1 (`pageTwo['home.hbs']`, compiled to index.hbs — Story 7.3)
//   post.hbs       A24 #1, and A22 #1 with Home's content, so that it hoists to partials/sections/shared/
//   Tag's page 2   A17 #1 at `per-row: two`; Tag's page 1 is untouched, so it is its Synthesis Default (Story 7.3)
//   author.hbs     A17 #1, hidden — an archive with no visible feed, so its page 2 carries FR-H2's noindex (Story 7.3)
//
// Two words go in. The PAGE word is A4 #13's eyebrow — the page's proof that it is this run's theme. The LAYER word is in
// every layer name, which reaches only the boundary comments, so it must never reach a page. One section's layer name
// is hostile (it tries to end its comment early), and A22 #1's text carries AD-5's hostile shapes. Paper, the English
// strings, no assets. The theme's identity is handed in (Story 7.2): CI's is `PILOT_THEME`, the recorder's its probe name.
// Story 7.4: Paper's pairing and the font pool's own files (read here, the shell — the compile reads none), on a Light + Dark
// project, so the theme carries fonts, licences, AD-18's variables and one section's dark hook; and `cssFailures`, the
// check CI runs on the stripped stylesheet (Story 7.33 runs it over the whole library).
//
// Node 24 (it imports the packages' TypeScript). Reads the designs and the font pool from disk; the compile itself is pure.

import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESIGNS = join(REPO, 'packages/library/designs')
const lib = await import(join(REPO, 'packages/library/src/index.ts'))
const { iconDrawing } = await import(join(REPO, 'packages/library/src/icons.ts'))
const rt = await import(join(REPO, 'packages/section-runtime/src/index.ts'))
const { REFERENCE_PACK } = await import(join(REPO, 'packages/section-runtime/src/reference.ts'))
const { presetOf } = await import(join(REPO, 'packages/library/src/packs.ts'))
const { checkTripleStashes, compileTheme, CSS_BUDGET_BYTES, THEME_MARKS } = await import(join(REPO, 'packages/theme-compiler/src/index.ts'))
const { JSDOM } = createRequire(join(REPO, 'packages/theme-compiler/package.json'))('jsdom')

/** The hostile layer name: an early `--}}`, markup and a live expression after it. */
export const HOSTILE_LAYER = 'Newsletter --}}<p id="leak">LEAK</p>{{@site.title}}'
/** AD-5's shapes, as a customer could type them into A22 #1. */
export const HOSTILE_TEXT = {
  heading: 'Write {{title}} or {{#if @member}}yes{{/if}} here',
  blurb: 'A path C:\\{{x}}, a "quote", an \'apostrophe\' and <b>angle brackets</b>',
  note: 'Close it: }} and }}} and {{{ and {{!-- too',
}

/** One design from disk, validated and assembled — loudly. */
function entry(id) {
  const [category, n] = id.split('/')
  const dir = join(DESIGNS, category, n)
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error(`the pilot ${id} is not in packages/library/designs/`)
  const read = (f) => readFileSync(join(dir, f), 'utf8')
  const design = JSON.parse(read('design.json'))
  const content = JSON.parse(readFileSync(join(DESIGNS, category, 'content.json'), 'utf8'))
  const html = read('index.html')
  const css = read('style.css')
  const failures = lib.validateDesign({ html, design, content, icons: iconDrawing, css })
  if (failures.length > 0) throw new Error(`${id} does not validate: ${failures.map((f) => f.code).join(', ')}`)
  const e = lib.assembleEntry({ dir, design, content, html, css })
  if (typeof e === 'string') throw new Error(`${id} does not assemble: ${e}`)
  return e
}

/** Every design on disk, by id — the library the compile is handed. */
export function library() {
  const ids = readdirSync(DESIGNS).flatMap((c) => (statSync(join(DESIGNS, c)).isDirectory()
    ? readdirSync(join(DESIGNS, c)).filter((n) => /^\d+$/.test(n)).map((n) => `${c}/${n}`) : []))
  const entries = Object.fromEntries(ids.map((id) => [id, entry(id)]))
  const find = (id) => (Object.hasOwn(entries, id) ? entries[id] : undefined)
  // Story 7.4: every id too, so AD-37's check knows each library design's root
  find.ids = ids
  return find
}

/** Story 7.4 — Paper: `REFERENCE_PACK` is its pack, and the compile refuses a pack whose fonts are not its pairing's. */
const PAPER = presetOf('paper')
const FONTS = join(REPO, 'packages/library/fonts')
/** The shell's read of the font pool, by its path under `packages/library/fonts/` (AD-1: the compile reads no file). */
export const poolFonts = (path) => readFileSync(join(FONTS, path))

/** The project's template docs. */
export function pilotProject({ pageWord, layerWord }, find = library()) {
  let n = 0
  const at = (designId, layer, over = {}) => {
    const e = find(designId)
    if (e === undefined) throw new Error(`the pilot ${designId} is not in the library`)
    return rt.parseDoc({ schemaVersion: 1, instances: [{
      instanceId: `pilot-${String(++n).padStart(2, '0')}-x9q`, layerName: `${layer} ${layerWord}`, designId,
      content: { ...rt.defaultContent(e.contentSchema), ...(over.content ?? {}) }, controls: over.controls ?? {}, data: {}, darkOverrides: over.darkOverrides ?? {},
      ...(over.isMainFeed === undefined ? {} : { isMainFeed: over.isMainFeed }), ...(over.hidden === undefined ? {} : { hidden: over.hidden }),
    }] }, designId).instances[0]
  }
  const doc = (...instances) => ({ schemaVersion: 1, instances })
  const newsletter = (layer) => at('a22/1', layer, { content: HOSTILE_TEXT })
  return {
    templates: {
      'default.hbs': doc(at('a1/1', 'Header')),
      // Story 7.4: A4 #13's Background is Contrast in Dark, so its root carries the hook and the token block its rules — on
      // Home alone, never the hoisted A22 pair, so the hook names one section in one file
      'home.hbs': doc(at('a4/13', 'Latest post', { content: { eyebrow: pageWord }, darkOverrides: { bg: 'contrast' } }), at('a17/1', 'Post grid', { isMainFeed: true }), newsletter(HOSTILE_LAYER)),
      'post.hbs': doc(at('a24/1', 'Post header'), newsletter('Sign up')),
      'author.hbs': doc(at('a17/1', 'Writer feed', { isMainFeed: true, hidden: true })),
    },
    // page 2's own docs, keyed by their page-1 file (Story 7.3)
    pageTwo: {
      'home.hbs': doc(at('a17/1', 'Post grid', { isMainFeed: true })),
      'tag.hbs': doc(at('a17/1', 'Post grid', { isMainFeed: true, controls: { 'per-row': 'two' } })),
    },
  }
}

/** CI's fixed theme identity — `package.json`'s name, version and description. */
export const PILOT_THEME = { name: 'inflozo-pilots', version: '1.0.0', description: 'Pilot sections' }

/** The compiled theme — path → text, or a font's bytes — with AD-14's record (`css`), and the project it came from. */
export function compilePilots(words, { theme, postsPerPage = 12, find = library(), pageTwo: overTwo } = {}) {
  if (!theme) throw new Error('compilePilots needs a theme { name, version, description } — CI passes PILOT_THEME')
  const project = pilotProject(words, find)
  const templates = project.templates
  const pageTwo = overTwo ?? project.pageTwo
  const { files, css } = compileTheme(new JSDOM('<body></body>').window.document, {
    templates, pageTwo, library: find, pack: REFERENCE_PACK, assets: {}, postsPerPage, theme, pairing: PAPER.pairing, fonts: poolFonts, darkEnabled: true,
  })
  const docs = [...Object.values(templates), ...Object.values(pageTwo)]
  return { files, css, templates, pageTwo, instanceIds: docs.flatMap((d) => d.instances.map((i) => i.instanceId)) }
}

/** A compiled theme's text files alone — a font is bytes, and no text check reads it (Story 7.4). */
export const textFiles = (files) => Object.fromEntries(Object.entries(files).filter(([, b]) => typeof b === 'string'))

/** What each page the recorder reads is made of, by the runtime's own functions (AD-27(d)): a page 1 is its doc, or its
 *  Synthesis Default when untouched; a page 2 is `pageTwoStack`'s. Keyed by file, a page 2 as `{file}#2`. */
export function pageStacks(templates, pageTwo, find = library()) {
  const own = (file) => (templates[file]?.instances.length ? templates[file].instances : rt.synthesize(file, find).instances)
  const two = (file) => rt.pageTwoStack(file, templates[file], pageTwo[file], find).instances
  return {
    'default.hbs': templates['default.hbs']?.instances ?? [],
    'home.hbs': own('home.hbs'), 'index.hbs': two('home.hbs'), 'post.hbs': own('post.hbs'),
    'tag.hbs': own('tag.hbs'), 'tag.hbs#2': two('tag.hbs'), 'author.hbs': own('author.hbs'), 'author.hbs#2': two('author.hbs'),
  }
}

/** `package.json` without its three named marks — FR-J10's `name`, the ruled `author` and FR-J13's marker (Story 7.2) —
 *  the only builder marks a theme may carry. Every other byte of the file is scanned like any emitted file. */
export function unmarked(text) {
  const rest = JSON.parse(text)
  if (rest === null || typeof rest !== 'object' || Array.isArray(rest)) throw new Error('package.json is not an object')
  for (const mark of THEME_MARKS) delete rest[mark]
  return JSON.stringify(rest, null, 2)
}

/** The paywall partial (Story 7.3): Ghost's own `{{content}}` runs it, so no file references it; its `{{{html}}}` first line
 *  is `checkTripleStashes`'s to admit (Question 2, ruled option 1, owner, 2026-10-06). */
const PAYWALL = 'partials/content-cta.hbs'

/** What CI and the recorder hold every compiled theme to — `[]` when it holds. Handlebars 4.7.9 (the compiler's own test
 *  parser, never product code) must parse every template; one `{{{body}}}` and no other triple-stash but `{{{html}}}` as
 *  the paywall's first line (the compiler's own `checkTripleStashes`, called rather than spelled again); no fingerprint (the builder's name outside package.json's named marks, its editor prefix, an
 *  instance id, a C0 character, an internal reference); a package.json that parses; every partial referenced but the
 *  paywall, which Ghost's `{{content}}` runs. */
export function themeFailures(all, instanceIds) {
  const Handlebars = createRequire(join(REPO, 'packages/theme-compiler/package.json'))('handlebars')
  const out = []
  // Story 7.4: a font's bytes are no text to scan — only a woff2 under assets/fonts/ may be bytes
  for (const [path, b] of Object.entries(all)) if (typeof b !== 'string' && !/^assets\/fonts\/[a-z0-9-]+\.woff2$/.test(path)) out.push(`${path}: bytes where a text file belongs`)
  const files = textFiles(all)
  if (files['package.json'] === undefined) out.push('package.json: missing')
  for (const [path, raw] of Object.entries(files)) {
    if (/[\u0000-\u0009\u000b-\u001f]/.test(raw)) out.push(`${path}: a control character`)
    let body = raw
    if (path === 'package.json') {
      try { body = unmarked(raw) } catch (e) { out.push(`package.json: it does not parse — ${e.message}`); continue }
    }
    if (/inflozo/i.test(body)) out.push(`${path}: the builder's name`)
    for (const id of instanceIds) if (body.includes(id)) out.push(`${path}: the instance id ${id}`)
    if (/\b(?:DW|AD|FR|NFR|R)-\d+\b|\bStory \d|ponytail/.test(body)) out.push(`${path}: an internal reference`)
    if (/generated by|built with/i.test(body)) out.push(`${path}: a generator line`)
    if (!path.endsWith('.hbs')) continue
    try { Handlebars.parse(body) } catch (e) { out.push(`${path}: Handlebars 4.7.9 does not parse it — ${String(e.message).split('\n')[0]}`) }
  }
  // AD-5's ONE spelling (Story 7.3's review): the compiler's check refuses any triple-stash but the two allowed, opens and
  // closes counted apart; the positive half — default.hbs DOES carry {{{body}}} — is this file's
  try { checkTripleStashes(files) } catch (e) { out.push(e.message) }
  if (!/^ *\{\{\{body\}\}\}$/m.test(files['default.hbs'] ?? '')) out.push('default.hbs carries no {{{body}}}')
  for (const path of Object.keys(files).filter((p) => p.startsWith('partials/') && p.endsWith('.hbs') && p !== PAYWALL)) {
    const name = path.slice('partials/'.length, -'.hbs'.length)
    if (!Object.entries(files).some(([p, b]) => p !== path && b.includes(`{{> "${name}"}}`))) out.push(`${path} is referenced by no file`)
  }
  return out
}

// ── Story 7.4 — FR-G7's strip, measured: `cssFailures` (the spec's Design Notes § The record, and what CI measures) ─────
//
// AN INDEPENDENT ORACLE, never the strip's own code: each placed design's original and emitted sheets are read through
// jsdom's CSSOM into entries — (the `@media` condition, one selector, the declarations) — with selector lists split by this
// file's own splitter; an entry is REACHABLE unless its leading compound begins with the design's root class and no placed
// root matches it (`Element.matches`, its pseudo-classes taken out, since a root can be hovered or focused). The roots are
// the first elements of the compiled section partials, parsed by jsdom — what the theme ships, not what the compiler meant.

/** NFR-2's per-template budget: each template's reachable CSS, gzipped at level 9, at most 50 KB. */
export const CSS_BUDGET = CSS_BUDGET_BYTES   // the package's figure, never a second literal (review, 2026-10-08)

/** `text` split on its top-level commas — outside (), [] and strings. */
function splitList(text) {
  const out = []
  let depth = 0
  let quote = null
  let from = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '\\') { i++; continue }
    if (quote !== null) { if (c === quote) quote = null; continue }
    if (c === '"' || c === "'") quote = c
    else if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (c === ',' && depth === 0) { out.push(text.slice(from, i)); from = i + 1 }
  }
  return [...out, text.slice(from)].map((s) => s.replace(/\s+/g, ' ').trim()).filter((s) => s !== '')
}

/** A selector's leading compound — the text before its first top-level combinator. */
function leadingCompound(selector) {
  let depth = 0
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i]
    if (c === '\\') { i++; continue }
    if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (depth === 0 && /[\s>+~]/.test(c)) return selector.slice(0, i)
  }
  return selector
}

/** A compound with its pseudo-classes and pseudo-elements taken out, arguments and all — the state a root could be put in. */
function withoutPseudo(compound) {
  let out = ''
  for (let i = 0; i < compound.length; i++) {
    const c = compound[i]
    if (c === '[') {
      // an unclosed `[` keeps the rest whole — never `i = -1`, which would restart the loop for ever (review, 2026-10-08)
      const end = compound.indexOf(']', i)
      if (end === -1) return out + compound.slice(i)
      out += compound.slice(i, end + 1); i = end; continue
    }
    if (c !== ':') { out += c; continue }
    while (compound[i + 1] === ':') i++
    while (i + 1 < compound.length && /[\w-]/.test(compound[i + 1])) i++
    if (compound[i + 1] === '(') {
      let depth = 0
      for (i++; i < compound.length; i++) { if (compound[i] === '(') depth++; else if (compound[i] === ')' && --depth === 0) break }
    }
  }
  return out
}

/** Does a compound begin with `.root`, and not with a longer name that starts the same way? */
const beginsWith = (compound, root) => compound.startsWith(`.${root}`) && !/^[\w\\-]/.test(compound.slice(root.length + 1))

/** A sheet's entries through jsdom's CSSOM: `{ media, selector, body }`, one per selector; another at-rule is one entry. */
function entriesOf(css) {
  const sheet = new JSDOM(`<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`).window.document.styleSheets[0]
  const out = []
  const walk = (rules, media) => {
    for (const r of rules) {
      if (r.type === 1) for (const selector of splitList(r.selectorText)) out.push({ media, selector, body: r.style.cssText })
      else if (r.type === 4) walk(r.cssRules, media === '' ? r.media.mediaText : `${media} and ${r.media.mediaText}`)
      else out.push({ media, selector: `@rule ${r.type}`, body: r.cssText })
    }
  }
  walk(sheet.cssRules, '')
  return out
}
const shown = (e) => `${e.media === '' ? '' : `@media ${e.media} `}${e.selector} { ${e.body} }`

/** The first element of every compiled section partial — the roots the theme ships. */
const sectionRoots = (files) => Object.entries(files)
  .filter(([p, b]) => p.startsWith('partials/sections/') && typeof b === 'string')
  .map(([, b]) => new JSDOM(`<body>${b}</body>`).window.document.body.firstElementChild)
  .filter((el) => el !== null)

/**
 * What CI holds the pilot theme's stylesheet to, over `compilePilots`' `{ files, css }`:
 *   1. SOUNDNESS — a reachable entry of a design's original sheet missing from its emitted chunk is a failure;
 *   2. THE GAP — emitted entries no placed root reaches, with their bytes, as a `WARNING FR-G7` line: the check passes;
 *   3. AD-37 — every chunk is a placed design's, and every emitted selector beginning with a library design's root class
 *      begins with its own design's;
 *   4. THE BUDGET — each `reach` template's `css.global` plus its designs' chunks, gzipped at level 9, within `CSS_BUDGET`;
 *      the whole `screen.css` is reported beside it, not gated.
 * Returns `{ failures, warnings, report }`.
 */
export function cssFailures({ files, css }, find = library()) {
  const failures = []
  const warnings = []
  const report = []
  const roots = sectionRoots(files)
  const rootOf = (id) => lib.rootClassOf(find(id)?.html ?? '')
  const libraryRoots = (find.ids ?? []).map((id) => [id, rootOf(id)]).filter(([, r]) => r !== null)
  for (const [id, chunk] of Object.entries(css.sheets)) {
    const entry = find(id)
    if (entry === undefined) { failures.push(`AD-37: screen.css carries a chunk for ${id}, which the library does not hold`); continue }
    const root = rootOf(id)
    const placed = roots.filter((el) => el.classList[0] === root)
    if (placed.length === 0) failures.push(`AD-37: screen.css carries ${id}'s rules, and no compiled section is ${id}`)
    const reachable = (e) => {
      const lead = leadingCompound(e.selector)
      if (root === null || !beginsWith(lead, root)) return true
      try { return placed.some((el) => el.matches(withoutPseudo(lead))) } catch { return true }
    }
    const emitted = entriesOf(chunk)
    const has = new Set(emitted.map(shown))
    for (const e of entriesOf(entry.css)) if (reachable(e) && !has.has(shown(e))) failures.push(`FR-G7: ${id}'s sheet lost a rule a placed root reaches — ${shown(e)}`)
    const dead = emitted.filter((e) => !reachable(e))
    if (dead.length > 0) {
      const bytes = dead.reduce((n, e) => n + Buffer.byteLength(shown(e)), 0)
      warnings.push(`WARNING FR-G7: ${id} ships ${dead.length} rule(s), ${bytes} B, that no placed root reaches — ${dead.map(shown).join(' · ')}`)
    }
    for (const e of emitted) {
      const other = libraryRoots.find(([, r]) => beginsWith(leadingCompound(e.selector), r))
      if (other !== undefined && other[1] !== root) failures.push(`AD-37: ${id}'s chunk carries ${e.selector}, which belongs to ${other[0]}`)
    }
  }
  const gzipped = (text) => gzipSync(Buffer.from(text), { level: 9 }).length
  for (const [file, ids] of Object.entries(css.reach)) {
    const size = gzipped([css.global, ...ids.map((id) => css.sheets[id] ?? '')].join('\n\n'))
    report.push(`${file} ${size} B`)
    if (size > CSS_BUDGET) failures.push(`NFR-2: ${file}'s reachable CSS is ${size} B at gzip level 9, past the ${CSS_BUDGET} B budget`)
  }
  report.push(`screen.css whole ${gzipped(files['assets/css/screen.css'] ?? '')} B (reported, not gated)`)
  return { failures, warnings, report }
}

/** An incompressible chunk of `bytes` characters, the same every run — the budget's control. */
export const incompressible = (bytes) => {
  let out = ''
  for (let h = 'seed'; out.length < bytes;) { h = createHash('sha256').update(h).digest('base64'); out += h }
  return `/* control */\n.zz-1 { content: "${out.slice(0, bytes).replace(/["\\]/g, 'x')}"; }`
}
