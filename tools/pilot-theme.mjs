// Story 7.1 — THE FIVE-PILOT PROJECT, compiled: the one project `tools/check-snapshots.mjs` holds in CI (with fixed words)
// and `tools/probe/record-theme-assembly.py` uploads to T1 (with words made from its nonce). One builder, so the theme CI
// judges is the theme Ghost renders.
//
//   the site doc   A1 #1 "Header"
//   home.hbs       A4 #13, A17 #1 as the main feed, A22 #1
//   Home's page 2  A17 #1 (`pageTwo['home.hbs']`, compiled to index.hbs — Story 7.3)
//   post.hbs       A24 #1, and A22 #1 with Home's content, so that it hoists to partials/sections/shared/
//   Tag's page 2   A17 #1 at `per-row: two`; Tag's page 1 is untouched, so it is its Synthesis Default (Story 7.3)
//   author.hbs     A17 #1, hidden — an archive with no visible feed, so its page 2 carries FR-H2's noindex (Story 7.3)
//
// Two words go in. The PAGE word is A4 #13's eyebrow — the page's proof that it is this run's theme. The LAYER word is in
// every layer name, which reaches only the boundary comments, so it must never reach a page. One section's layer name
// is hostile (it tries to end its comment early), and A22 #1's text carries AD-5's hostile shapes. Paper, the English
// strings, no assets. The theme's identity is handed in (Story 7.2): CI's is `PILOT_THEME`, the recorder's its probe name.
//
// Node 24 (it imports the packages' TypeScript). Reads the designs from disk; the compile itself is pure.

import { createRequire } from 'node:module'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESIGNS = join(REPO, 'packages/library/designs')
const lib = await import(join(REPO, 'packages/library/src/index.ts'))
const { iconDrawing } = await import(join(REPO, 'packages/library/src/icons.ts'))
const rt = await import(join(REPO, 'packages/section-runtime/src/index.ts'))
const { REFERENCE_PACK } = await import(join(REPO, 'packages/section-runtime/src/reference.ts'))
const { checkTripleStashes, compileTheme, THEME_MARKS } = await import(join(REPO, 'packages/theme-compiler/src/index.ts'))
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
  return (id) => (Object.hasOwn(entries, id) ? entries[id] : undefined)
}

/** The project's template docs. */
export function pilotProject({ pageWord, layerWord }, find = library()) {
  let n = 0
  const at = (designId, layer, over = {}) => {
    const e = find(designId)
    if (e === undefined) throw new Error(`the pilot ${designId} is not in the library`)
    return rt.parseDoc({ schemaVersion: 1, instances: [{
      instanceId: `pilot-${String(++n).padStart(2, '0')}-x9q`, layerName: `${layer} ${layerWord}`, designId,
      content: { ...rt.defaultContent(e.contentSchema), ...(over.content ?? {}) }, controls: over.controls ?? {}, data: {}, darkOverrides: {},
      ...(over.isMainFeed === undefined ? {} : { isMainFeed: over.isMainFeed }), ...(over.hidden === undefined ? {} : { hidden: over.hidden }),
    }] }, designId).instances[0]
  }
  const doc = (...instances) => ({ schemaVersion: 1, instances })
  const newsletter = (layer) => at('a22/1', layer, { content: HOSTILE_TEXT })
  return {
    templates: {
      'default.hbs': doc(at('a1/1', 'Header')),
      'home.hbs': doc(at('a4/13', 'Latest post', { content: { eyebrow: pageWord } }), at('a17/1', 'Post grid', { isMainFeed: true }), newsletter(HOSTILE_LAYER)),
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

/** The compiled theme, path → text, and the project it came from. */
export function compilePilots(words, { theme, postsPerPage = 12, find = library(), pageTwo: overTwo } = {}) {
  if (!theme) throw new Error('compilePilots needs a theme { name, version, description } — CI passes PILOT_THEME')
  const project = pilotProject(words, find)
  const templates = project.templates
  const pageTwo = overTwo ?? project.pageTwo
  const files = compileTheme(new JSDOM('<body></body>').window.document, { templates, pageTwo, library: find, pack: REFERENCE_PACK, assets: {}, postsPerPage, theme })
  const docs = [...Object.values(templates), ...Object.values(pageTwo)]
  return { files, templates, pageTwo, instanceIds: docs.flatMap((d) => d.instances.map((i) => i.instanceId)) }
}

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
export function themeFailures(files, instanceIds) {
  const Handlebars = createRequire(join(REPO, 'packages/theme-compiler/package.json'))('handlebars')
  const out = []
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
