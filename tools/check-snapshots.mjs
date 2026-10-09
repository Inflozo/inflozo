// Story 4.10 — NFR-6(c1): every design's compiled `.hbs` is committed and diffed per commit, and every design is
// rendered at every template it says it can be placed on. Controls first (a result whose control did not pass is not
// a result), then the subject, then the totals — `tools/check-catalog.mjs`'s shape.
//
// One copy of each thing, and this file restates none of them:
// - the DESIGN LIST is the directory `packages/library/designs/{category}/{n}/`;
// - a SNAPSHOT is derived from its design: `packages/library/snapshots/{category}/{n}/template.hbs` and
//   `partials/{name}.hbs`, written by `--update` and by nothing else. They live beside the designs, not inside
//   them, because a design directory has one owning epic (AD-35) and Epic 7's formatting (Story 7.1) re-baselines
//   the snapshots without touching a design;
// - the TEMPLATE CONTEXT is Orbit Weekly's `templateContext`, the one the pilots review page renders against;
// - the TOTALS are printed here and stored nowhere.
//
// For every design, at every `compileTarget`:
//  1. validate and assemble (with the icon set, so an icon default is checked against it);
//  2. `checkBindings` is `[]` (DW-130) — the design's own targets carry every binding it makes;
//  3. `renderCanvas` does not throw, with Orbit Weekly's rows for each declared query;
//  4. `renderTheme`, with the category's content defaults and the controls at their defaults, equals the ONE
//     committed snapshot — a section never opens `{{#post}}`, so its text does not vary by target, and rendering
//     every target against one file is the proof.
// Then the controls sample renders through both emitters at each of its targets (DW-121), and the story's own rows.
//
//     node tools/check-snapshots.mjs            (Node 24: it imports the packages' TypeScript, the gscan gate's included)
//     node tools/check-snapshots.mjs --update   rewrites every snapshot from its design. CI never passes it.

import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESIGNS = join(REPO, 'packages/library/designs')
const SNAPSHOTS = join(REPO, 'packages/library/snapshots')
const UPDATE = process.argv.includes('--update')

const lib = await import(join(REPO, 'packages/library/src/index.ts'))
const { iconDrawing } = await import(join(REPO, 'packages/library/src/icons.ts'))
const rt = await import(join(REPO, 'packages/section-runtime/src/index.ts'))
// jsdom from the runtime package that declares it (tools/stress/node_modules is never installed in CI)
const { JSDOM } = createRequire(join(REPO, 'packages/section-runtime/package.json'))('jsdom')
const doc = () => new JSDOM('<body></body>').window.document
const rel = (p) => relative(REPO, p)

// ─── reading ──────────────────────────────────────────────────────────────────────────────────────────────

const isDir = (p) => existsSync(p) && statSync(p).isDirectory()

/** Every design directory on disk, `{category}/{n}`, in a stable order. */
function designDirs(root = DESIGNS) {
  if (!isDir(root)) return []
  return readdirSync(root).sort().flatMap((category) =>
    isDir(join(root, category))
      ? readdirSync(join(root, category)).filter((n) => /^\d+$/.test(n) && isDir(join(root, category, n))).sort((a, b) => Number(a) - Number(b)).map((n) => ({ category, n }))
      : [])
}

/** Every snapshot directory on disk — the other direction, so a snapshot whose design is gone is named. */
const snapshotDirs = () => designDirs(SNAPSHOTS)

function loadDesign({ category, n }, root = DESIGNS) {
  const dir = join(root, category, n)
  const read = (f) => readFileSync(join(dir, f), 'utf8')
  const design = JSON.parse(read('design.json'))
  const content = JSON.parse(readFileSync(join(root, category, 'content.json'), 'utf8'))
  return { category, n, dir, design, content, html: read('index.html'), css: read('style.css') }
}

/** Validate and assemble, loudly. */
function assemble(d) {
  const failures = lib.validateDesign({ html: d.html, design: d.design, content: d.content, icons: iconDrawing, css: d.css })
  if (failures.length > 0) throw new Error(`${rel(d.dir)} does not validate:\n${failures.map((f) => `${f.code}: ${f.message}`).join('\n')}`)
  const entry = lib.assembleEntry({ dir: d.dir, design: d.design, content: d.content, html: d.html, css: d.css })
  if (typeof entry === 'string') throw new Error(`${rel(d.dir)} does not assemble: ${entry}`)
  return entry
}

/** The render input for one target: content and controls at their defaults, Orbit Weekly for Ghost. */
function input(entry, target, over = {}) {
  const ctx = lib.orbitWeekly.templateContext(target, over.feed ?? 'first')
  const bindings = rt.withData(entry.dataBindings, {})
  const getRows = Object.fromEntries(Object.entries(bindings).map(([k, b]) => [k, lib.orbitWeekly.resolveSource(b)]))
  const { feed: _feed, ...rest } = over
  return {
    target, content: rt.defaultContent(entry.contentSchema), schema: entry.contentSchema,
    controlSchema: entry.controlSchema, universals: entry.universals, controls: {},
    dataBindings: entry.dataBindings, getRows, icons: iconDrawing, ghost: ctx.ghost, site: ctx.site, ...rest,
  }
}

/** The files one theme output is snapshotted as, path → bytes. */
const snapshotFiles = (out) => ({
  'template.hbs': `${out.template}\n`,
  ...Object.fromEntries(Object.entries(out.partials).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [`partials/${k}.hbs`, `${v}\n`])),
})

function readSnapshot(dir) {
  if (!isDir(dir)) return null
  const files = {}
  if (existsSync(join(dir, 'template.hbs'))) files['template.hbs'] = readFileSync(join(dir, 'template.hbs'), 'utf8')
  if (isDir(join(dir, 'partials'))) {
    for (const f of readdirSync(join(dir, 'partials')).sort()) files[`partials/${f}`] = readFileSync(join(dir, 'partials', f), 'utf8')
  }
  return files
}

/** Every difference between what a design renders and its committed snapshot, each naming the file and, for a
 *  changed file, its first differing line. `null` for `onDisk` is a snapshot directory that does not exist. */
function driftFailures(id, rendered, onDisk) {
  const base = `packages/library/snapshots/${id}`
  if (onDisk === null) return [`${base}/ — ${id} has no snapshot; run node tools/check-snapshots.mjs --update and commit it`]
  const out = []
  for (const [f, bytes] of Object.entries(rendered)) {
    if (!(f in onDisk)) { out.push(`${base}/${f} — missing; the design renders it`); continue }
    if (onDisk[f] === bytes) continue
    const a = onDisk[f].split('\n')
    const b = bytes.split('\n')
    const i = a.findIndex((line, k) => line !== b[k])
    const at = i === -1 ? a.length : i
    out.push(`${base}/${f} — changed at line ${at + 1}:\n    committed: ${JSON.stringify(a[at] ?? '')}\n    rendered:  ${JSON.stringify(b[at] ?? '')}`)
  }
  for (const f of Object.keys(onDisk)) if (!(f in rendered)) out.push(`${base}/${f} — committed, and the design no longer renders it`)
  return out
}

/** Snapshot directories whose design is gone. */
const orphanFailures = (designs, snapshots) =>
  snapshots.filter((s) => !designs.some((d) => d.category === s.category && d.n === s.n))
    .map((s) => `packages/library/snapshots/${s.category}/${s.n}/ — a snapshot with no design at packages/library/designs/${s.category}/${s.n}/`)

/** One design, every target: bindings, both emitters, and one theme text for all of them. */
function renderDesign(d) {
  const entry = assemble(d)
  const id = `${d.category}/${d.n}`
  let theme = null
  for (const target of entry.compileTarget) {
    // DW-168: at the oldest Ghost the design claims, so a field the matrix dates later is refused by its `since`
    const refused = rt.checkBindings(doc(), entry.html, { target, dataBindings: entry.dataBindings, version: entry.ghostCompat.minVersion })
    if (refused.length > 0) throw new Error(`${id} at ${target}: checkBindings refused\n  ${refused.join('\n  ')}`)
    rt.renderCanvas(doc(), entry.html, input(entry, target))
    const files = snapshotFiles(rt.renderTheme(doc(), entry.html, input(entry, target)))
    // one file for every target holds only while `data-target` (row 10) stays refused at render: the story that
    // renders it makes a section's text vary by target, and re-shapes this check to one snapshot per target
    if (theme === null) theme = files
    else if (JSON.stringify(files) !== JSON.stringify(theme)) {
      throw new Error(`${id}: the theme text at ${target} differs from ${entry.compileTarget[0]} — a section's text does not vary by target (it never opens {{#post}}), so one snapshot holds all of them`)
    }
  }
  return { id, entry, files: theme ?? {} }
}

// ─── the harness ──────────────────────────────────────────────────────────────────────────────────────────

let failed = 0
const check = (label, fn) => {
  try {
    const note = fn()
    console.log(`  ok  ${label}${note ? ` — ${note}` : ''}`)
  } catch (e) {
    failed++
    console.log(`  FAIL ${label}\n       ${String(e.message).split('\n').join('\n       ')}`)
  }
}
const mustThrow = (fn, pattern, what) => {
  try { fn() } catch (e) {
    if (pattern.test(e.message)) return e.message.split('\n')[0]
    throw new Error(`${what} threw, but not the expected refusal:\n${e.message}`)
  }
  throw new Error(`${what} was not refused`)
}
const mustFail = (failures, pattern, what) => {
  const hit = failures.find((f) => pattern.test(f))
  if (hit === undefined) throw new Error(`${what} was not caught — got ${JSON.stringify(failures)}`)
  return hit.split('\n')[0]
}

const DIRS = designDirs()
const byId = (id) => {
  const [category, n] = id.split('/')
  if (!DIRS.some((d) => d.category === category && d.n === n)) throw new Error(`the design ${id} this row is about is not in packages/library/designs/`)
  return loadDesign({ category, n })
}

console.log('\nStory 4.10 — every design, at every target, held to its committed snapshot\n')
if (DIRS.length === 0) {
  console.log('check-snapshots: FAIL — packages/library/designs/ holds no design, so this check would prove nothing')
  process.exit(1)
}

// ── controls: each check, handed its broken subject, fails naming it (in memory — nothing on disk is touched) ──
check('control — a design with one class changed fails, naming the file and its first differing line', () => {
  const d = loadDesign(DIRS[0])
  const { id, files } = renderDesign(d)
  // Story 6.5: a class BELOW the root — the root's class is what the stylesheet's mode-scoped rules are written on
  // (`mode-scoped-rule`), so changing it is refused by the validator before any snapshot is compared
  const m = [...d.html.matchAll(/class="([^"]+)"/g)][1] ?? null
  if (m === null) throw new Error(`${id} carries no class below its root to change`)
  const changed = renderDesign({ ...d, html: d.html.replace(m[0], `class="${m[1]}-changed"`) }).files
  return mustFail(driftFailures(id, changed, files), /template\.hbs — changed at line \d+:/, 'a changed class')
})
check('control — a missing snapshot fails, naming the directory', () => {
  const { id, files } = renderDesign(loadDesign(DIRS[0]))
  return mustFail(driftFailures(id, files, null), /has no snapshot/, 'a missing snapshot')
})
check('control — a snapshot with no design fails, naming both paths', () =>
  mustFail(orphanFailures(DIRS, [...DIRS, { category: 'a99', n: '1' }]), /a99\/1\/ — a snapshot with no design/, 'an orphan snapshot'))
check('control — bindings per target: a title binding added to A1 #1 is refused at default.hbs', () => {
  const d = byId('a1/1')
  const html = d.html.replace(/(<[a-z][^>]*>)/, '$1<span data-bind="title">·</span>')
  const refused = rt.checkBindings(doc(), html, { target: 'default.hbs', dataBindings: d.design.dataBindings })
  return mustFail(refused, /"title"/, 'a post field at the top of default.hbs')
})
check('control — DW-168: A22 #1 claiming Ghost 5.61.0 is refused, naming the field it reads and the release that added it', () => {
  const entry = assemble(byId('a22/1'))
  const target = entry.compileTarget[0]
  const refused = rt.checkBindings(doc(), entry.html, { target, dataBindings: entry.dataBindings, version: '5.61.0' })
  return mustFail(refused, /@site\.allow_self_signup arrived in Ghost 5\.62\.0/, `A22 #1 at ${target} claiming 5.61.0`)
})
check("control — the wrapper axis: A24 #1 at index.hbs is FR-H7's refusal naming title, and at post.hbs it renders", () => {
  const entry = assemble(byId('a24/1'))
  const note = mustThrow(() => rt.renderCanvas(doc(), entry.html, input(entry, 'index.hbs')), /FR-H7[^]*"title"/, 'A24 #1 at index.hbs')
  rt.renderCanvas(doc(), entry.html, input(entry, 'post.hbs'))
  return note
})
check("control — pagination: A17 #1 at post.hbs is R-7's refusal", () => {
  const entry = assemble(byId('a17/1'))
  return mustThrow(() => rt.renderTheme(doc(), entry.html, input(entry, 'post.hbs')), /R-7/, 'A17 #1 at post.hbs')
})

// ── the subject ───────────────────────────────────────────────────────────────────────────────────────────
const rendered = []
for (const dir of DIRS) {
  check(`${dir.category}/${dir.n} — validates, carries every binding at every target, renders on both emitters, one theme text`, () => {
    const r = renderDesign(loadDesign(dir))
    rendered.push(r)
    return r.entry.compileTarget.join(' · ')
  })
}
check('every snapshot equals its design, and every snapshot has a design', () => {
  if (UPDATE) {
    // a design that failed above is not in `rendered`; wiping the directory would silently lose its snapshot
    if (failed > 0) throw new Error(`${failed} check(s) failed above — fix them before --update rewrites the snapshots`)
    rmSync(SNAPSHOTS, { recursive: true, force: true })
    for (const r of rendered) {
      for (const [f, bytes] of Object.entries(r.files)) {
        const path = join(SNAPSHOTS, r.id, f)
        mkdirSync(dirname(path), { recursive: true })
        writeFileSync(path, bytes)
      }
    }
    return `--update rewrote ${rendered.length} snapshot director${rendered.length === 1 ? 'y' : 'ies'}`
  }
  const f = [
    ...rendered.flatMap((r) => driftFailures(r.id, r.files, readSnapshot(join(SNAPSHOTS, r.id)))),
    ...orphanFailures(DIRS, snapshotDirs()),
  ]
  if (f.length) throw new Error(`${f.join('\n')}\n(an intended change: node tools/check-snapshots.mjs --update, then commit the snapshots with it)`)
})

/** R-113's register: the group every setting the design export declares sits in, by category and panel title. */
const REGISTER = JSON.parse(readFileSync(join(REPO, 'packages/library/control-groups.json'), 'utf8'))
/** A title as a customer reads it: case, curly quotes and runs of spaces do not make it another title. */
const titleKey = (t) => t.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase()
/** The group the register files a design's setting under — its design's own when the title does something else
 *  there — or `undefined` when the title has no entry. */
function registered(category, n, label) {
  const table = REGISTER[category]
  const key = table === undefined ? undefined : Object.keys(table).find((t) => titleKey(t) === titleKey(label))
  if (key === undefined) return undefined
  const e = table[key]
  return typeof e === 'string' ? e : (e.designs?.[n] ?? e.group)
}
/** Every built design's setting against the register: filed, and where it is filed. A title with no entry is a
 *  failure, not a pass — otherwise renaming a setting and moving it in one edit leaves every check green. */
const registerFailures = (id, controlSchema) => {
  const [category, n] = id.split('/')
  if (REGISTER[category] === undefined) return [`${id}: packages/library/control-groups.json has no ${category} — every category's settings are filed there (R-113)`]
  return controlSchema.flatMap((c) => {
    const g = registered(category, n, c.label)
    if (g === undefined) return [`${id}: "${c.label}" is not filed in packages/library/control-groups.json — add it under ${category}, with the group its role names (docs/section-authoring.md § 2), in the story that gives a setting that title (R-113)`]
    if (g === 'data') return [`${id}: "${c.label}" is filed under Data — a query's setting: what Ghost returns is decided when the theme compiles, so it is declared on the design's dataBindings and drawn by the Data group, never a data-* control a stylesheet reads (R-113, AD-3)`]
    return g === c.group ? [] : [`${id}: "${c.label}" declares ${c.group}, and packages/library/control-groups.json files it under ${g} — the group its role names (R-113); change the design, or settle a genuinely different setting under a title of its own`]
  })
}

/** R-74 for a setting's words: a built design's setting is a row its own frame draws — the title, and in the same row
 *  one of its values' words, whole (a toggle: the drawn switch). A row's words are its own: no caption, no emphasis or
 *  code, no mono label, and the frame's spec block after the last row is not a row. Reading rows is what keeps
 *  relabelling a setting to another row's registered title — A4 #13's Card side to "Card style", Show tag to "Member
 *  visibility" — from moving it between groups unseen. Where the register files an R-13 rename for this design
 *  ({ renames: { n: drawn } }), the drawn title it replaces is the row read. ponytail: two rows that share a value's
 *  words, and any two switch rows, are not told apart — a relabel between them lands on a title the register files,
 *  so its group change shows in design.json's diff; add a value identity when the export draws one. Measured on
 *  2026-09-15 over every frame: every drawn pill and select row the register files is found. */
const EXPORT = join(REPO, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', middot: '·', mdash: '—', ndash: '–', hellip: '…', minus: '−', rarr: '→', times: '×' }
const decode = (t) => t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&([a-z]+);/g, (m, e) => ENTITIES[e] ?? m)
/** A panel row's title as the export draws one — a row, a sub-row of a labelled group, a list row, one carrying a badge
 *  after its words — and a toggle's switch, after a badge if the row has one. */
const ROW_TITLE = /<span style="(?:display:flex;align-items:center;gap:6px;)?(?:font-size:12px;font-weight:500;color:#(?:6E6A64|A8A29A|8A8378|B4ADA1|B9B2A6)(?:;margin-top:4px)?|font-size:10\.5px;color:#8A857C|font-size:12px;color:#1C1B1A;flex:1)">([^<]*)(?:<\/span>|(?=<span))/g
const SWITCH = /^(?:<span[^>]*>[^<]*<\/span>)?(?:<\/span>)*<span style="width:(?:26|3[246])px;height:(?:16|18|20)px/
/** A row's own words: text right after an opening tag that is not a caption, emphasis, code or a mono label, up to the
 *  frame's spec block. */
const ownWords = (body) => [...body.split('<sc-if')[0].matchAll(/(<[^<>]*>)([^<>]+)</g)]
  .filter(([, tag]) => !/^<\/|^<(?:strong|em|code)\b|line-height|JetBrains Mono/.test(tag))
  .map((m) => titleKey(decode(m[2]))).filter(Boolean)
const frameRows = (category, n) => {
  const frame = readdirSync(EXPORT).find((f) => f.startsWith(`${category.toUpperCase()}-${n} `) && f.endsWith('.dc.html'))
  if (frame === undefined) return null
  const html = readFileSync(join(EXPORT, frame), 'utf8')
  const heads = [...html.matchAll(ROW_TITLE)]
  return {
    frame,
    rows: heads.map((m, i) => {
      const body = html.slice(m.index + m[0].length, i + 1 < heads.length ? heads[i + 1].index : html.length)
      return { title: titleKey(decode(m[1])), body, words: ownWords(body) }
    }),
  }
}
const drawnTitle = (category, n, label) => {
  const table = REGISTER[category] ?? {}
  const e = table[Object.keys(table).find((t) => titleKey(t) === titleKey(label))]
  return typeof e === 'object' && e.renames?.[n] !== undefined ? e.renames[n] : label
}
const frameFailures = (id, controlSchema) => {
  const [category, n] = id.split('/')
  const drawn = frameRows(category, n)
  if (drawn === null) return [`${id}: no ${category.toUpperCase()}-${n} frame in the design export to read its titles from (R-74)`]
  return controlSchema.flatMap((c) => {
    const searched = drawnTitle(category, n, c.label)
    const title = titleKey(searched)
    const words = c.values.map((v) => titleKey(lib.valueWords(c.valueLabels, v)))
    const row = drawn.rows.some((r) => r.title === title && (c.type === 'toggle' ? SWITCH.test(r.body) : r.words.some((w) => words.includes(w))))
    const as = searched === c.label ? '' : ` (the register's rename reads it as "${searched}")`
    return row ? [] : [`${id}: "${c.label}"${as} is not a row ${drawn.frame} draws with one of its values — a setting prints its own row's words (R-74); where one panel would print a title twice (R-13), the register's note says which words give way, and a rename is filed per design`]
  })
}
/** Everything the register and the frame hold a built design's settings to — the one list the subject and its controls read. */
const settingFailures = (r) => [...registerFailures(r.id, r.entry.controlSchema), ...frameFailures(r.id, r.entry.controlSchema)]

/** R-13: one panel never prints one title twice — every row a design's panel draws, words and settings alike, and the
 *  accordions' own titles, so no row is called Layout inside Layout. */
const repeatedTitles = (m) => {
  const titles = m.groups.flatMap((g) => [g.label, ...g.rows.map((r) => r.label)]).map((t) => t.trim().toLowerCase())
  return [...new Set(titles.filter((t, i) => titles.indexOf(t) !== i))]
}

check('control — R-13: a panel printing one title twice is caught, naming the title — a row called like its accordion too', () => {
  const r = rendered.find((x) => x.entry.controlSchema.length > 0)
  if (r === undefined) throw new Error('no design declares a control, so this control proves nothing')
  const m = rt.sidebar(r.entry, {})
  const first = r.entry.controlSchema[0]
  const clash = { ...r.entry, controlSchema: [...r.entry.controlSchema, { ...first, name: `${first.name}-twice` }] }
  const twice = repeatedTitles(rt.sidebar(clash, {}))
  const named = { ...r.entry, controlSchema: r.entry.controlSchema.map((c, i) => (i === 0 ? { ...c, label: m.groups.find((g) => g.id === c.group).label } : c)) }
  const accordion = repeatedTitles(rt.sidebar(named, {}))
  if (repeatedTitles(m).length > 0 || twice.length !== 1 || accordion.length !== 1) throw new Error(`not caught — ${JSON.stringify({ twice, accordion })}`)
  return `"${twice[0]}", and a row titled "${accordion[0]}" inside ${accordion[0]}`
})
check('control — R-113: a second design moving a control to another group is refused, naming the control', () => {
  const r = rendered.find((x) => x.entry.controlSchema.length > 0)
  if (r === undefined) throw new Error('no design declares a control, so this control proves nothing')
  const c = r.entry.controlSchema[0]
  const moved = { ...c, group: c.group === 'style' ? 'layout' : 'style' }
  const byName = lib.categoryControlUnion([{ id: r.id, controlSchema: [c] }, { id: `${r.id.split('/')[0]}/99`, controlSchema: [moved] }])
  if (typeof byName !== 'string' || !byName.includes(`"${c.name}"`)) throw new Error(`not refused — ${JSON.stringify(byName)}`)
  return byName.split('.')[0]
})

check('control — R-53 across the library: a design in another category reusing a control name with another value set is refused, naming both', () => {
  const r = rendered.find((x) => x.entry.controlSchema.some((c) => c.type !== 'stepper'))
  if (r === undefined) throw new Error('no design declares a named control, so this control proves nothing')
  const c = r.entry.controlSchema.find((x) => x.type !== 'stepper')
  const refused = lib.categoryControlUnion([{ id: r.id, controlSchema: [c] }, { id: 'a99/1', controlSchema: [{ ...c, values: [...c.values, 'another'] }] }])
  if (typeof refused !== 'string' || !refused.includes(r.id) || !refused.includes('a99/1')) throw new Error(`not refused — ${JSON.stringify(refused)}`)
  return refused.split(' — ')[0]
})
check('control — R-113\'s register: a pilot\'s setting filed under another group is caught, so is one renamed out of the register or given a Data title, and a design whose setting of a title does something else takes its own group', () => {
  const r = rendered.find((x) => x.entry.controlSchema.some((c) => registered(x.id.split('/')[0], x.id.split('/')[1], c.label) !== undefined))
  if (r === undefined) throw new Error('no design declares a setting the register files, so this control proves nothing')
  const c = r.entry.controlSchema.find((x) => registered(r.id.split('/')[0], r.id.split('/')[1], x.label) !== undefined)
  const moved = registerFailures(r.id, [{ ...c, group: c.group === 'style' ? 'layout' : 'style' }])
  if (moved.length !== 1 || registerFailures(r.id, [c]).length !== 0) throw new Error(`not caught — ${JSON.stringify(moved)}`)
  // the reviewers' own demonstration: renamed and moved in one edit
  const renamed = registerFailures(r.id, [{ ...c, label: `${c.label} again`, group: c.group === 'style' ? 'layout' : 'style' }])
  if (renamed.length !== 1 || !renamed[0].includes('is not filed')) throw new Error(`a renamed setting passes — ${JSON.stringify(renamed)}`)
  // a Data title from anywhere in the register, a per-design one included, told it is a query's — never skipped
  const data = Object.entries(REGISTER).filter(([k]) => k !== 'about').flatMap(([category, table]) => Object.entries(table).flatMap(([title, e]) =>
    typeof e === 'string' ? (e === 'data' ? [{ category, n: '9999', title }] : []) : Object.entries(e.designs ?? {}).filter(([, g]) => g === 'data').map(([n]) => ({ category, n, title })).concat(e.group === 'data' ? [{ category, n: '9999', title }] : [])))[0]
  if (data === undefined) throw new Error('the register files no title under Data, so the Data refusal is unproved')
  if (!registerFailures(`${data.category}/${data.n}`, [{ ...c, label: data.title }])[0]?.includes('is filed under Data')) throw new Error(`${data.category} "${data.title}" as a control is not told it is Data`)
  const split = Object.entries(REGISTER).flatMap(([category, table]) => Object.entries(table).filter(([, e]) => typeof e === 'object' && e.designs !== undefined).map(([title, e]) => ({ category, title, e })))[0]
  if (split === undefined) throw new Error('the register carries no design of its own, so the per-design reading is unproved')
  const [n, own] = Object.entries(split.e.designs)[0]
  if (registered(split.category, n, split.title) !== own || registered(split.category, '9999', split.title) !== split.e.group) throw new Error(`${split.category} "${split.title}": design ${n} reads ${registered(split.category, n, split.title)}, another design ${registered(split.category, '9999', split.title)}`)
  return moved[0].split(' — ')[0]
})

check('control — a stylesheet reaches the validator: A24 #1 with one rule still on its old meta attribute does not assemble (AD-3)', () => {
  const css = byId('a24/1').css
  if (typeof css !== 'string' || !css.includes('[data-byline=')) throw new Error('A24 #1\'s style.css was not read from disk, so this control proves nothing')
  return mustThrow(() => assemble({ ...byId('a24/1'), css: `${css}\n.a24-1[data-meta="off"] .x { display: none; }\n` }), /stylesheet-control-undeclared/, 'A24 #1 with a stale [data-meta] rule')
})
check('AD-3\'s stylesheet scan reads hostile input in linear time, to its end: open brackets before long runs of spaces, escaped quotes ending in a backslash, thousands of selectors left open', () => {
  const d = byId('a24/1')
  // each hostile run ends with a stale rule, which must still be refused: the scan read to the end, it did not give up
  // (two newlines: a string left open on a trailing backslash carries across one, as CSS's does)
  const stale = '\n\n.a24-1[data-meta="off"] .x { display: none; }\n'
  const hostile = [`[data-align="center"${' '.repeat(64000)}`, `"${'\\"'.repeat(32000)}\\`, '[data-x='.repeat(8000), '[data-a="'.repeat(20000), '[data-a=x'.repeat(20000)]
  const runs = hostile.map((h) => {
    const began = performance.now()
    const f = lib.validateDesign({ html: d.html, design: d.design, content: d.content, icons: iconDrawing, css: h + stale })
    return { ms: performance.now() - began, read: f.some((x) => x.code === 'stylesheet-control-undeclared') }
  })
  if (runs.some((r) => r.ms > 1000 || !r.read)) throw new Error(`the scan: ${runs.map((r) => `${Math.round(r.ms)} ms${r.read ? '' : ', stale rule missed'}`).join(' · ')}`)
  return runs.map((r) => `${Math.round(r.ms)} ms`).join(' · ')
})
check('control — R-74: a built setting relabelled to a title its frame does not draw, or to another row\'s title, is caught through the subject\'s own list; a rename the register files per design is read', () => {
  const r = rendered.find((x) => x.id === 'a4/13')
  if (r === undefined) throw new Error('A4 #13, whose frame this control reads, is not built')
  const at = (label) => settingFailures({ id: r.id, entry: { ...r.entry, controlSchema: r.entry.controlSchema.map((c) => (c.name === 'card-side' ? { ...c, label } : c)) } })
  if (at('Card side').length !== 0) throw new Error('A4 #13 is not clean to begin with, so this control proves nothing')
  const absent = mustFail(at('Picture side'), /"Picture side" is not a row A4-13 /, 'Card side relabelled "Picture side"')
  // "Card style" is a row A4-13 draws, for another setting — filed under Content, so a relabel would regroup Card side
  mustFail(at('Card style'), /"Card style" is not a row A4-13 /, 'Card side relabelled "Card style", a row drawn for another setting')
  // and a row whose caption or neighbour happens to hold a value's letters: Show tag's "On" inside "Everyone"
  const showTag = settingFailures({ id: r.id, entry: { ...r.entry, controlSchema: r.entry.controlSchema.map((c) => (c.name === 'show-tag' ? { ...c, label: 'Member visibility', group: 'settings' } : c)) } })
  mustFail(showTag, /"Member visibility" is not a row A4-13 /, 'Show tag relabelled "Member visibility"')
  // A4 #9's button style is drawn "Primary action" beside its Primary action toggle; the register files it "Action style"
  const style = { name: 'action-style', type: 'segmented', label: 'Action style', group: 'style', values: ['surface-fill', 'outline'], default: 'surface-fill' }
  if (frameFailures('a4/9', [style]).length !== 0 || frameFailures('a4/9', [{ ...style, label: 'Button look' }]).length !== 1) throw new Error('the register\'s rename for A4 #9 is not read')
  if (titleKey(decode('Editor&rsquo;s  PICK')) !== "editor's pick") throw new Error('a drawn title is not read as the customer reads it')
  return absent
})

check('R-113 — every built design\'s settings print their frame\'s titles (R-74), are filed in the register and sit where it files them; one control name holds one type, value set and group across the library (R-53); no panel, the controls sample\'s too, prints one title twice, its accordions\' included (R-13)', () => {
  const filed = rendered.flatMap(settingFailures)
  if (filed.length > 0) throw new Error(filed.join('\n'))
  const library = lib.categoryControlUnion(rendered.map((r) => ({ id: r.id, controlSchema: r.entry.controlSchema })))
  if (typeof library === 'string') throw new Error(library)
  // ponytail: the panel's group order and placement are sidebar()'s own construction, held by controls.test.ts — re-reading
  // them here could never fail; what a design can get wrong is the register, a name and a title
  const sample = assemble(loadDesign({ category: 'controls', n: '1' }, join(REPO, 'packages/library/fixtures')))
  for (const r of [...rendered, { id: sample.id, entry: sample }]) {
    const repeated = repeatedTitles(rt.sidebar(r.entry, { content: rt.defaultContent(r.entry.contentSchema) }))
    if (repeated.length > 0) throw new Error(`${r.id}: the panel prints ${repeated.map((t) => `"${t}"`).join(', ')} twice — every title in one panel is distinct, its accordions' too (R-13)`)
  }
  const categories = new Set(rendered.map((r) => r.id.split('/')[0]))
  return `${categories.size} categor${categories.size === 1 ? 'y' : 'ies'} · ${rendered.reduce((t, r) => t + r.entry.controlSchema.length, 0)} settings, every one drawn in its frame, filed and held to the register`
})
check('DW-121 — the controls sample renders through both emitters at each of its targets', () => {
  const root = join(REPO, 'packages/library/fixtures')
  const entry = assemble(loadDesign({ category: 'controls', n: '1' }, root))
  for (const target of entry.compileTarget) {
    const over = { assets: { 'feature-03': '/pool/feature-03.svg' } }
    if (!rt.renderCanvas(doc(), entry.html, input(entry, target, over)).includes('cx__post')) throw new Error(`the canvas at ${target} drew no archive row`)
    if (!rt.renderTheme(doc(), entry.html, input(entry, target, over)).template.includes('{{#get "posts"')) throw new Error(`the theme at ${target} carries no {{#get}}`)
  }
  return entry.compileTarget.join(' · ')
})

check('review 5.24c — the paywall fixtures hold their minVersion to the fields they read, as every design does (DW-168)', () => {
  const root = join(REPO, 'packages/library/fixtures')
  const out = []
  for (const n of ['1', '2']) {
    const entry = assemble(loadDesign({ category: 'paywall', n }, root))
    const [target] = entry.compileTarget
    const refused = rt.checkBindings(doc(), entry.html, { target, dataBindings: entry.dataBindings, version: entry.ghostCompat.minVersion })
    if (refused.length > 0) throw new Error(`paywall/${n} at ${entry.ghostCompat.minVersion}: ${refused.join(' · ')}`)
    // the control: one release lower and `@site.allow_self_signup` is refused
    const older = rt.checkBindings(doc(), entry.html, { target, dataBindings: entry.dataBindings, version: '5.61.0' })
    if (!older.some((r) => /allow_self_signup arrived in Ghost 5\.62\.0/.test(r))) throw new Error(`paywall/${n}: the control at 5.61.0 was not refused — got ${JSON.stringify(older)}`)
    out.push(`paywall/${n} ${entry.ghostCompat.minVersion}`)
  }
  return out.join(' · ')
})

check('A17 #1 — the no-param partial: {{#foreach posts}} around {{> "post-card"}}, and the canvas draws one card per row', () => {
  const entry = assemble(byId('a17/1'))
  const out = rt.renderTheme(doc(), entry.html, input(entry, 'index.hbs'))
  if (!/\{\{#foreach posts\}\}\s*\{\{> "post-card"\}\}\s*\{\{\/foreach\}\}/.test(out.template)) throw new Error(`no {{#foreach posts}}{{> "post-card"}}{{/foreach}} in:\n${out.template}`)
  if (!('post-card' in out.partials)) throw new Error(`the card is not filed as partials["post-card"]: ${Object.keys(out.partials).join(', ')}`)
  const rows = lib.orbitWeekly.templateContext('index.hbs', 'first').ghost.posts
  const canvas = rt.renderCanvas(doc(), entry.html, input(entry, 'index.hbs'))
  const missing = rows.filter((p) => !canvas.includes(p.title.replace(/&/g, '&amp;')))
  if (missing.length) throw new Error(`the canvas drew no card for ${missing.map((p) => p.title).join(' · ')}`)
  return `${rows.length} rows, ${rows.length} cards`
})

check('A17 #1 — feed pages: no Newer on the first, no Older on the last, both in the middle, the else arm when empty', () => {
  const entry = assemble(byId('a17/1'))
  const strings = lib.resolveStrings({})
  const [newer, older, empty] = ['pagination.newer', 'pagination.older', 'archive.empty_heading'].map((k) => strings[k])
  const at = (feed) => rt.renderCanvas(doc(), entry.html, input(entry, 'index.hbs', { feed }))
  const want = { first: [false, true, false], middle: [true, true, false], last: [true, false, false], empty: [false, false, true] }
  for (const [feed, [n, o, e]] of Object.entries(want)) {
    const html = at(feed)
    const got = [html.includes(`>${newer}<`), html.includes(`>${older}<`), html.includes(`>${empty}<`)]
    if (JSON.stringify(got) !== JSON.stringify([n, o, e])) throw new Error(`${feed}: Newer ${got[0]}, Older ${got[1]}, empty arm ${got[2]} — wanted ${n}, ${o}, ${e}`)
  }
})

check("A4 #13 — R-108 and FR-H8: the card is the newest post with a sized picture inside its guard; a post with no picture shows its title in the card's place; nothing published closes the column", () => {
  const entry = assemble(byId('a4/13'))
  const binding = entry.dataBindings.latest
  if (binding?.fixed !== true || binding.limit !== 1) throw new Error(`dataBindings.latest is not fixed at one post: ${JSON.stringify(binding)}`)
  const newest = lib.orbitWeekly.resolveSource(binding)[0]
  const withPicture = rt.renderCanvas(doc(), entry.html, input(entry, 'home.hbs', { data: { latest: { count: 5 } } }))
  if (!withPicture.includes(newest.title) || !/srcset="[^"]+"/.test(withPicture)) throw new Error(`the card is not "${newest.title}" with a srcset:\n${withPicture}`)
  if (lib.orbitWeekly.resolveSource({ ...binding, limit: 2 }).slice(1).some((p) => withPicture.includes(p.title))) throw new Error('a stored count of 5 reached a fixed query')
  const bare = rt.renderCanvas(doc(), entry.html, input(entry, 'home.hbs', { getRows: { latest: [{ ...newest, feature_image: null }] } }))
  if (bare.includes('<img') || !bare.includes(newest.title)) throw new Error(`a post with no picture did not show its title in the picture's place:\n${bare}`)
  const none = rt.renderCanvas(doc(), entry.html, input(entry, 'home.hbs', { getRows: { latest: [] } }))
  if (none.includes(newest.title)) throw new Error('an empty query still drew a card')
  const theme = rt.renderTheme(doc(), entry.html, input(entry, 'home.hbs')).template
  // Story 5.19: every posts query includes its tags and writers — recorded as the difference between the card's tag
  // printing and printing nothing (MEASUREMENTS §53)
  if (!theme.includes('{{#get "posts" limit="1" order="published_at desc" include="tags,authors"}}')) throw new Error(`the theme does not query one post with its tag:\n${theme}`)
  // FR-H8: the srcset is inside `{{#if feature_image}}`, so the unguarded state is unreachable on the theme
  if (!/\{\{#if feature_image\}\}[^]*?srcset="\{\{/.test(theme)) throw new Error(`the srcset is not inside {{#if feature_image}}:\n${theme}`)
  // R-108, and Story 5.19: a fixed query's Data group is Source ALONE — which post, never how many or in what order
  const data = rt.sidebar(entry, {}).groups.find((g) => g.id === 'data')?.rows.map((r) => r.control) ?? []
  if (data.join() !== 'source') throw new Error(`the panel offers a number or an order of posts, or no Source: ${data.join(', ')}`)
})

check('A1 #1 and A22 #1 — the member arms on the canvas: Sign in and Subscribe signed out, Account signed in, the form signed out; and none of the asks when self-signup is off', () => {
  const strings = lib.resolveStrings({})
  const [signin, account, subscribe] = ['member.signin_cta', 'member.account', 'member.signup_cta'].map((k) => strings[k])
  const rail = assemble(byId('a1/1'))
  const row = assemble(byId('a22/1'))
  const at = (entry, target, over) => rt.renderCanvas(doc(), entry.html, input(entry, target, over))
  for (const member of ['anonymous', 'free', 'paid']) {
    const html = at(rail, 'default.hbs', { member })
    const want = member === 'anonymous' ? [true, false, true] : [false, true, false]
    const got = [html.includes(`>${signin}<`), html.includes(`>${account}<`), html.includes(`>${subscribe}<`)]
    if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`Rail at ${member}: Sign in ${got[0]}, Account ${got[1]}, Subscribe ${got[2]} — wanted ${want.join(', ')}`)
    const form = at(row, 'home.hbs', { member }).includes('data-members-form')
    if (form !== (member === 'anonymous')) throw new Error(`Inline Row at ${member}: the form is ${form ? 'drawn' : 'gone'}`)
  }
  // the control: with self-signup off, the asks go and Account stays (A1 Headers - Spec.md:79)
  const off = { ...lib.orbitWeekly.templateContext('default.hbs').ghost, '@site': { ...lib.orbitWeekly.site(), allow_self_signup: false } }
  const closed = at(rail, 'default.hbs', { ghost: off, member: 'anonymous' })
  if (closed.includes(`>${signin}<`) || closed.includes(`>${subscribe}<`)) throw new Error('self-signup off still asks')
  if (!at(rail, 'default.hbs', { ghost: off, member: 'paid' }).includes(`>${account}<`)) throw new Error('self-signup off hid Account from a member')
  if (at(row, 'home.hbs', { ghost: off, member: 'anonymous' }).includes('data-members-form')) throw new Error('self-signup off still draws the form')
})

// ── Story 7.1 — theme assembly's library-wide halves, each with its control first ─────────────────────────────────────

/** Every class a design writes is its root `{category}-{n}`, or begins with `{root}__` or `{root}--` — so two designs'
 *  rules never meet in the one `screen.css` the compiler concatenates them into (AD-3: no generated class names). */
function classFailures(id, html) {
  const root = id.replace('/', '-')
  const tags = lib.scanTags(html)
  const classes = (tag) => (tag.attrs.find(([k]) => k.toLowerCase() === 'class')?.[1] ?? '').split(/\s+/).filter(Boolean)
  const first = tags[0] === undefined ? undefined : classes(tags[0])[0]
  const out = first === root ? [] : [`${id}: the root's class is ${first === undefined ? 'missing' : `"${first}"`}, not "${root}" ({category}-{n})`]
  for (const tag of tags) {
    for (const c of classes(tag)) {
      if (c !== root && !c.startsWith(`${root}__`) && !c.startsWith(`${root}--`)) out.push(`${id}: <${tag.name}> writes the class "${c}", which is neither ${root} nor begins with ${root}__ or ${root}--`)
    }
  }
  return out
}
/** The stylesheet half of the same rule (review): every selector in a design's `style.css` names its root `.{category}-{n}`
 *  (the root itself, or a class under it) — a bare `p { }` or another design's class would restyle every other design
 *  once the stylesheets are concatenated. Preludes inside `@keyframes` and `@font-face` are not selectors. */
function selectorFailures(id, css) {
  const root = id.replace('/', '-')
  const own = new RegExp(`\\.${root}(?![\\w-])|\\.${root}(?:__|--)`)
  const out = []
  const stack = []
  let buf = ''
  for (const ch of lib.stripCssComments(css)) {
    if (ch === '{') {
      const prelude = buf.trim()
      buf = ''
      const inAtBlock = stack.some((p) => /^@(?:keyframes|font-face)/.test(p))
      stack.push(prelude)
      if (prelude.startsWith('@') || inAtBlock) continue
      for (const sel of prelude.split(',')) if (!own.test(sel)) out.push(`${id}: style.css's selector "${sel.trim()}" names no .${root} — a rule outside its root reaches every other design in screen.css`)
    } else if (ch === '}') { stack.pop(); buf = '' } else if (ch === ';') buf = ''
    else buf += ch
  }
  return out
}
/** No two designs declare one `data-partial` name: a repeat partial lands at the theme's `partials/` root, one file per name. */
function partialFailures(designs) {
  const owner = new Map()
  const out = []
  for (const { id, html } of designs) {
    for (const tag of lib.scanTags(html)) {
      const name = tag.attrs.find(([k]) => k.toLowerCase() === 'data-partial')?.[1]
      if (name === undefined) continue
      if (owner.has(name) && owner.get(name) !== id) out.push(`data-partial "${name}" is declared by ${owner.get(name)} and by ${id} — one partials/${name}.hbs cannot be both`)
      else owner.set(name, id)
    }
  }
  return out
}
const pilots = await import(join(REPO, 'tools/pilot-theme.mjs'))
const WORDS = pilots.CI_WORDS
const THEME = { theme: pilots.PILOT_THEME }

check('control — Story 7.1: a class outside its design\'s root, and a root that is not {category}-{n}, are caught, naming them', () => {
  const d = loadDesign(DIRS[0])
  const id = `${d.category}/${d.n}`
  if (classFailures(id, d.html).length > 0) throw new Error(`${id} is not clean to begin with: ${classFailures(id, d.html).join(' · ')}`)
  const foreign = mustFail(classFailures(id, d.html.replace(/class="([^"]+)"/, 'class="$1 hero"')), /writes the class "hero"/, 'a foreign class')
  mustFail(classFailures(`${d.category}/9${d.n}`, d.html), /not "\w+-9\d+"/, 'a root named for another design')
  return foreign
})
check('Story 7.1 — every class a design writes is its root {category}-{n}, or begins with {root}__ or {root}--', () => {
  const f = rendered.flatMap((r) => classFailures(r.id, r.entry.html))
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${rendered.length} designs`
})
check('control — Story 7.1 (review): a stylesheet rule outside its design\'s root — a bare element, another design\'s class — is caught, naming the selector', () => {
  const d = loadDesign(DIRS[0])
  const id = `${d.category}/${d.n}`
  if (selectorFailures(id, d.css).length > 0) throw new Error(`${id} is not clean to begin with: ${selectorFailures(id, d.css).join(' · ')}`)
  const bare = mustFail(selectorFailures(id, `${d.css}\np { margin: 0 }\n`), /selector "p" names no/, 'a bare element selector')
  mustFail(selectorFailures(id, `${d.css}\n@media (min-width: 40em) { .zz-9__x { color: red } }\n`), /selector "\.zz-9__x" names no/, 'another design\'s class, inside @media')
  if (selectorFailures(id, `${d.css}\n@keyframes spin { from { opacity: 0 } to { opacity: 1 } }\n`).length > 0) throw new Error('a keyframe step was taken for a selector')
  return bare
})
check('Story 7.1 (review) — every selector in a design\'s stylesheet names its root, so two designs\' rules never meet in screen.css', () => {
  const f = rendered.flatMap((r) => selectorFailures(r.id, r.entry.css))
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${rendered.length} designs`
})
/** A section's top level is always block layout, so two nodes that touch there would gain a line break — the one
 *  place the formatter adds whitespace. No library design may have one (review). */
function touchingRoots(id, html) {
  const root = doc().createElement('div')
  root.innerHTML = html
  const out = []
  let open = false
  for (const n of root.childNodes) {
    if (n.nodeType === 3 && /^[ \t\n\f\r]*$/.test(n.textContent)) { if (n.textContent !== '') open = false; continue }
    if (n.nodeType === 8) continue
    if (open) out.push(`${id}: <${n.nodeName.toLowerCase()}> touches its sibling at the design's top level — the theme would put a line break between them`)
    open = true
  }
  return out
}
check('control — Story 7.1 (review): two nodes touching at a design\'s top level are caught', () => {
  const d = loadDesign(DIRS[0])
  const id = `${d.category}/${d.n}`
  if (touchingRoots(id, d.html).length > 0) throw new Error(`${id} is not clean to begin with`)
  return mustFail(touchingRoots(id, `${d.html.trim()}<p>x</p>`), /touches its sibling/, 'a touching root')
})
check('Story 7.1 (review) — no design\'s top-level nodes touch, so the one line break block layout adds there is never added', () => {
  const f = rendered.flatMap((r) => touchingRoots(r.id, r.entry.html))
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${rendered.length} designs`
})
check('control — Story 7.1: two designs declaring one data-partial name are caught, naming both', () => {
  const r = rendered.find((x) => /data-partial=/.test(x.entry.html))
  if (r === undefined) throw new Error('no design declares a data-partial, so this control proves nothing')
  if (partialFailures(rendered.map((x) => x.entry)).length > 0) throw new Error('the library is not clean to begin with')
  return mustFail(partialFailures([...rendered.map((x) => x.entry), { id: `${r.entry.category}/99`, html: r.entry.html }]), new RegExp(`declared by ${r.id} and by ${r.entry.category}/99`), 'one data-partial name twice')
})
check('Story 7.1 — no two designs declare one data-partial name', () => {
  const f = partialFailures(rendered.map((r) => r.entry))
  if (f.length > 0) throw new Error(f.join('\n'))
})
check('control — Story 7.1: the compiled-theme check catches a second triple-stash, the builder\'s name, an instance id, an orphan partial and a file Handlebars cannot parse', () => {
  const { files, instanceIds } = pilots.compilePilots(WORDS, THEME)
  const f = pilots.themeFailures(files, instanceIds)
  if (f.length > 0) throw new Error(`the pilot theme is not clean to begin with: ${f.join(' · ')}`)
  const broken = (over) => pilots.themeFailures({ ...files, ...over }, instanceIds)
  mustFail(broken({ 'home.hbs': `${files['home.hbs']}{{{html}}}\n` }), /triple-stash/, 'a second {{{')
  mustFail(broken({ 'index.hbs': `${files['index.hbs']}<!-- built with Inflozo -->\n` }), /index\.hbs: the builder's name/, 'a generator mark')
  mustFail(broken({ 'post.hbs': `${files['post.hbs']}<i data-key="${instanceIds[0]}"></i>\n` }), /the instance id/, 'an instance id')
  // Story 7.8: the orphan rule is the quality gate's `leftovers` (AD-34's one spelling), which `themeFailures` calls
  mustFail(broken({ 'partials/orphan.hbs': '<p>x</p>\n' }), /^partials\/orphan\.hbs: a partial no template uses$/, 'an orphan partial')
  // Story 7.3: the paywall's {{{html}}} is admitted as its first line alone, and Ghost's {{content}} references it
  if (broken({ 'partials/content-cta.hbs': '{{{html}}}\n' }).length > 0) throw new Error(`the paywall's first line was refused: ${broken({ 'partials/content-cta.hbs': '{{{html}}}\n' }).join(' · ')}`)
  mustFail(broken({ 'partials/content-cta.hbs': '<p>x</p>\n{{{html}}}\n' }), /triple-stash/, '{{{html}}} below the paywall\'s first line')
  return mustFail(broken({ 'home.hbs': '{{#if x}}\n' }), /home\.hbs: Handlebars 4\.7\.9 does not parse it/, 'an unclosed block')
})
check('Story 7.1 — the five-pilot project compiles with Paper to a theme Handlebars 4.7.9 parses: one {{{body}}}, no fingerprint, every partial referenced, the same bytes twice', () => {
  const a = pilots.compilePilots(WORDS, THEME)
  const f = pilots.themeFailures(a.files, a.instanceIds)
  if (f.length > 0) throw new Error(f.join('\n'))
  const b = pilots.compilePilots(WORDS, THEME)
  // Story 7.4: by content — a font is bytes, and two reads of one file are two arrays
  // the paths first, so a file one compile lacks is named rather than thrown on (review, 2026-10-08)
  if (Object.keys(b.files).join() !== Object.keys(a.files).join()) throw new Error(`a second compile differs in its files: ${Object.keys(a.files).filter((k) => !(k in b.files)).concat(Object.keys(b.files).filter((k) => !(k in a.files))).join(', ')}`)
  const same = (x, y) => (typeof x === 'string' ? x === y : typeof y !== 'string' && Buffer.from(x).equals(Buffer.from(y)))
  const differ = Object.keys(a.files).filter((k) => !same(a.files[k], b.files[k]))
  if (differ.length > 0) throw new Error(`a second compile differs: ${differ.join(', ')}`)
  return `${Object.keys(a.files).length} files`
})

// ── Story 7.3: the standard templates, synthesized and split ────────────────────────────────────────────────────────
// The pilots hand in Home's and Tag's page 2 and an Author page whose feed is hidden (tools/pilot-theme.mjs), so the theme
// carries an archive split, an untouched page 1 synthesized, a feed-less archive's layout line and FR-H2's guard.
const pilotsTwo = pilots.compilePilots(WORDS, THEME)
/** `[]` when tag.hbs is page 2 inside {{#is "paged"}} at per-row two and page 1 in its {{else}} at three, and author.hbs —
 *  its one feed hidden — is its layout line alone. */
function splitFailures(files) {
  const out = []
  const m = /^\{\{!< default\}\}\n\n\{\{#is "paged"\}\}\n([^]*)\n\{\{else\}\}\n([^]*)\n\{\{\/is\}\}\n$/.exec(files['tag.hbs'] ?? '')
  if (m === null) out.push('tag.hbs: no {{#is "paged"}} split')
  else {
    const perRow = (branch) => [...branch.matchAll(/\{\{> "([^"]+)"\}\}/g)].map((x) => /data-per-row="(\w+)"/.exec(files[`partials/${x[1]}.hbs`] ?? '')?.[1])
    if (perRow(m[1]).join() !== 'two') out.push(`tag.hbs: page 2 draws per-row ${perRow(m[1]).join() || 'nothing'}, not two`)
    if (perRow(m[2]).join() !== 'three') out.push(`tag.hbs: page 1 draws per-row ${perRow(m[2]).join() || 'nothing'}, not three`)
  }
  if (files['author.hbs'] !== '{{!< default}}\n') out.push(`author.hbs: not its layout line alone — ${JSON.stringify(files['author.hbs'])}`)
  return out
}
/** The contexts default.hbs's noindex block names, or null when it has none. */
const noindexOf = (files) => /\{\{#is "paged"\}\}\n *\{\{#is "([^"]+)"\}\}\n *<meta name="robots" content="noindex">/.exec(files['default.hbs'] ?? '')?.[1] ?? null
/** `[]` when one <main id="site-main"> in the whole theme wraps {{{body}}} alone. */
function mainFailures(files) {
  const mains = Object.entries(pilots.textFiles(files)).flatMap(([p, b]) => (b.match(/<main\b/g) ?? []).map(() => p))
  if (mains.join() !== 'default.hbs') return [`<main> appears in ${mains.join(', ') || 'no file'}, where default.hbs alone carries one`]
  return /\n( *)<main id="site-main">\n\1 {2}\{\{\{body\}\}\}\n\1<\/main>\n/.test(files['default.hbs']) ? [] : ['default.hbs: <main id="site-main"> does not wrap {{{body}}} alone']
}
check('control — Story 7.3: a theme with no Tag page 2 has no split, and the check says so', () => {
  const { 'tag.hbs': _, ...rest } = pilotsTwo.pageTwo
  return mustFail(splitFailures(pilots.compilePilots(WORDS, { ...THEME, pageTwo: rest }).files), /^tag\.hbs: no \{\{#is "paged"\}\} split$/, 'a tag.hbs with no page 2')
})
check('Story 7.3 — the pilots compile tag.hbs with page 2 inside {{#is "paged"}} (per-row two) and page 1 in its {{else}} (three), and author.hbs, its feed hidden, as its layout line alone', () => {
  const f = splitFailures(pilotsTwo.files)
  if (f.length > 0) throw new Error(f.join('\n'))
})
check('control — Story 7.3: a Tag page 2 with no visible feed adds tag to the noindex block', () => {
  const hidden = { ...pilotsTwo.pageTwo['tag.hbs'], instances: pilotsTwo.pageTwo['tag.hbs'].instances.map((i) => ({ ...i, hidden: true })) }
  const got = noindexOf(pilots.compilePilots(WORDS, { ...THEME, pageTwo: { ...pilotsTwo.pageTwo, 'tag.hbs': hidden } }).files)
  if (got !== 'tag, author') throw new Error(`the noindex block names ${JSON.stringify(got)}, not "tag, author"`)
  return got
})
check('Story 7.3 — default.hbs\'s noindex block names author alone: the one page 2 with no visible feed; no canonical link of the theme\'s own', () => {
  const got = noindexOf(pilotsTwo.files)
  if (got !== 'author') throw new Error(`the noindex block names ${JSON.stringify(got)}, not "author"`)
  const canonical = Object.entries(pilots.textFiles(pilotsTwo.files)).filter(([, b]) => /rel="canonical"/.test(b)).map(([p]) => p)
  if (canonical.length > 0) throw new Error(`a canonical link in ${canonical.join(', ')}`)
})
check('control — Story 7.3: a <main> that wraps more than {{{body}}} is caught', () => {
  const files = pilotsTwo.files
  return mustFail(mainFailures({ ...files, 'default.hbs': files['default.hbs'].replace('<main id="site-main">\n', '<main id="site-main">\n      <p>x</p>\n') }), /does not wrap \{\{\{body\}\}\} alone/, 'a <main> around more')
})
check('Story 7.3 — <main id="site-main"> appears once in the theme, around {{{body}}} alone', () => {
  const f = mainFailures(pilotsTwo.files)
  if (f.length > 0) throw new Error(f.join('\n'))
})

// ── Story 7.2: package.json, judged by each Ghost major's own checker ──────────────────────────────────────────────────
// Story 7.7: every gscan row runs through `runGscan` (`@inflozo/theme-compiler/gate`), the ONE caller of gscan in product
// code and in CI, on BOTH pinned checkers — 4.49.7 at `v5` for Ghost 5, 6.4.2 at `v6` for Ghost 6 (AD-34), each row named
// per checker. `runGscan` drops gscan's recommendations, which Ghost's own upload answer never carries, so "at any level"
// below is errors and warnings. `check` is synchronous, so gscan runs here, before its rows.
const gate = await import(join(REPO, 'packages/theme-compiler/gate/index.ts'))
const MAJORS = Object.keys(gate.GSCAN).map(Number)
const pinOf = (major) => `gscan ${gate.GSCAN[major].version} at ${gate.GSCAN[major].checkVersion}`
/** Every result a major's pinned gscan raises on a theme, errors then warnings, as `{level} {code}`. */
const gscanResults = async (files, major) => (await gate.runGscan(files, major)).results.map((r) => `${r.level} ${r.code}`)
const packageRules = (results) => results.filter((r) => / GS(010|100)-/.test(r))
const pilotTheme = pilots.compilePilots(WORDS, THEME).files
const withPackage = (edit) => {
  const pkg = JSON.parse(pilotTheme['package.json'])
  edit(pkg)
  return { ...pilotTheme, 'package.json': `${JSON.stringify(pkg, null, 2)}\n` }
}
// a gscan that throws (a missing dependency, a temp-dir failure) must be a failing ROW, not a stack trace that stops every
// row after it — so the throw is kept, per major, and re-raised inside each row that reads it
const gscanOr = async (files) => Object.fromEntries(await Promise.all(MAJORS.map(async (m) => [m, await gscanResults(files, m).catch((e) => e)])))
const gscanPilots = await gscanOr(pilotTheme)
const gscanStringPage = await gscanOr(withPackage((pkg) => { pkg.config.posts_per_page = '12' }))
const raised = (r) => { if (r instanceof Error) throw r; return r }

for (const m of MAJORS) {
  check(`control — Story 7.2: ${pinOf(m)} raises GS010-PJ-CONF-PPP-INT on the pilots' package.json with posts_per_page "12"`, () => {
    return mustFail(raised(gscanStringPage[m]), /^error GS010-PJ-CONF-PPP-INT$/, 'a string page size')
  })
  check(`Story 7.2 — the pilots' package.json raises no GS010-* or GS100-* error or warning under ${pinOf(m)}`, () => {
    const hit = packageRules(raised(gscanPilots[m]))
    if (hit.length > 0) throw new Error(hit.join('\n'))
    return `${gscanPilots[m].length} result(s) outside package.json's rules — the verdict rows below name them`
  })
}
check('control — Story 7.2: the pilots\' package.json, its three named marks in place, passes the fingerprint scan', () => {
  if (!/inflozo/i.test(pilotTheme['package.json'])) throw new Error('package.json carries no named mark, so its exemption proves nothing')
  const f = pilots.themeFailures(pilotTheme, []).filter((x) => x.startsWith('package.json'))
  if (f.length > 0) throw new Error(f.join(' · '))
})
check('Story 7.2 — the builder\'s name in package.json outside its named marks is caught, and so is a package.json that does not parse', () => {
  mustFail(pilots.themeFailures(withPackage((pkg) => { pkg.config.inflozo_build = 1 }), []), /^package\.json: the builder's name$/, 'a key under config')
  mustFail(pilots.themeFailures({ ...pilotTheme, 'package.json': '{"name":' }, []), /^package\.json: it does not parse/, 'a broken package.json')
  return mustFail(pilots.themeFailures(withPackage((pkg) => { pkg.description = 'Made with Inflozo' }), []), /^package\.json: the builder's name$/, 'the builder\'s name in the description')
})

// ── Story 7.4: fonts, licences, Ghost's font variables, the hook and the strip, over the pilot theme ────────────────────
// The pilots compile with Paper's pairing and the pool's own files on a Light + Dark project, A4 #13's Background set to
// Contrast in Dark (tools/pilot-theme.mjs). Each row behind its control; `cssFailures` is the independent oracle Story
// 7.33 runs over the whole library.
const packs = await import(join(REPO, 'packages/library/src/packs.ts'))
const { createHash } = await import('node:crypto')
const pilots74 = pilots.compilePilots(WORDS, THEME)
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
/** `[]` when the theme's fonts are exactly the pairing's pool files, byte for byte, preloaded and faced through one
 *  {{asset}} address each, each family's licence at the root with its words unchanged, and no font host named anywhere. */
function fontFailures(files, pairing) {
  const out = []
  const faces = packs.pairingFaces(pairing)
  const want = new Map(faces.flatMap((f) => f.files).map((f) => [`assets/fonts/${f.file}`, f]))
  for (const path of Object.keys(files).filter((p) => p.startsWith('assets/fonts/'))) {
    const f = want.get(path)
    if (f === undefined) out.push(`${path}: no file of ${pairing}'s faces`)
    else if (typeof files[path] === 'string' || sha256(files[path]) !== f.sha256) out.push(`${path}: its sha256 is not pool.json's`)
  }
  for (const path of want.keys()) if (!(path in files)) out.push(`${path}: missing`)
  const shell = files['default.hbs'] ?? ''
  const preloads = [...shell.matchAll(/<link rel="preload" href="(\{\{asset "[^"]+"\}\})" as="font" type="font\/woff2" crossorigin>/g)].map((m) => m[1])
  const srcs = [...shell.matchAll(/src: url\((\{\{asset "fonts\/[^"]+"\}\})\) format\('woff2'\);/g)].map((m) => m[1])
  const p = packs.pairingOf(pairing)
  const romans = [...new Set([p.heading, p.body].map((r) => r.faces.map(packs.faceOf).find((f) => f.style === 'normal').files.find((f) => f.subset === 'latin').file))]
  if (preloads.join() !== romans.map((f) => `{{asset "fonts/${f}"}}`).join()) out.push(`default.hbs preloads ${preloads.join(', ') || 'nothing'}, not each roman face's latin file once`)
  for (const href of preloads) if (srcs.filter((s) => s === href).length !== 1) out.push(`default.hbs: the preload ${href} is not the src of one @font-face rule`)
  for (const [path, body] of Object.entries(pilots.textFiles(files))) if (/fonts\.(googleapis|gstatic)\.com/.test(body)) out.push(`${path} names a font host`)
  for (const family of new Set(faces.map((f) => f.family))) {
    const record = packs.POOL.families[family]
    const words = (t) => t.replace(/\s+/g, ' ').trim()
    const text = files[`LICENSE-${record.slug}.txt`]
    if (typeof text !== 'string') out.push(`LICENSE-${record.slug}.txt: missing`)
    else if (words(text) !== words(readFileSync(join(REPO, 'packages/library/fonts', record.licenceFile), 'utf8'))) out.push(`LICENSE-${record.slug}.txt: its words are not ${record.licenceFile}'s`)
  }
  return out
}
check('control — Story 7.4: a changed font byte, a preload no face fetches, a font host and a reworded licence are each caught', () => {
  const files = pilots74.files
  if (fontFailures(files, 'D1').length > 0) throw new Error(`the pilot theme is not clean to begin with: ${fontFailures(files, 'D1').join(' · ')}`)
  const font = Object.keys(files).find((p) => p.startsWith('assets/fonts/'))
  const flipped = Uint8Array.from(files[font]); flipped[0] ^= 1
  mustFail(fontFailures({ ...files, [font]: flipped }, 'D1'), /its sha256 is not pool\.json's/, 'a changed byte')
  mustFail(fontFailures({ ...files, 'default.hbs': files['default.hbs'].replace(/(<link rel="preload" href="\{\{asset "fonts\/)[^"]+/, '$1elsewhere.woff2') }, 'D1'), /preloads/, 'a preload no face fetches')
  mustFail(fontFailures({ ...files, 'default.hbs': files['default.hbs'].replace('<title>', '<link rel="stylesheet" href="https://fonts.googleapis.com/css2"><title>') }, 'D1'), /names a font host/, 'a font host')
  return mustFail(fontFailures({ ...files, 'LICENSE-inter.txt': files['LICENSE-inter.txt'].replace('Font', 'Typeface') }, 'D1'), /its words are not/, 'a reworded licence')
})
check('Story 7.4 — the pilot theme ships D1\'s pool files byte for byte (sha256 as pool.json records), preloads the two roman faces through their faces\' own {{asset}} address, carries each family\'s licence and names no font host', () => {
  const f = fontFailures(pilots74.files, 'D1')
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${Object.keys(pilots74.files).filter((p) => p.startsWith('assets/fonts/')).length} font files`
})
const gscanNoGhostFonts = await gscanOr({ ...pilots74.files, 'assets/css/screen.css': pilots74.files['assets/css/screen.css'].replace(/var\(--gh-font-(?:heading|body), ([^;]+)\);/g, '$1;') })
for (const m of MAJORS) {
  check(`control — Story 7.4: with AD-18's two var() forms taken out of screen.css, ${pinOf(m)} raises GS051`, () => mustFail(raised(gscanNoGhostFonts[m]), /GS051/, 'a theme without --gh-font-*'))
  check(`Story 7.4 — ${pinOf(m)} raises no GS051 on the pilot theme: screen.css declares --gh-font-heading and --gh-font-body`, () => {
    const hit = raised(gscanPilots[m]).filter((r) => /GS051/.test(r))
    if (hit.length > 0) throw new Error(hit.join('\n'))
  })
}
/** `[]` when exactly one hook ships — A4 #13's, `hookOf(sectionKey('home', its id))`, on its root — and the token block
 *  carries its rules. */
function hookFailures(compiled) {
  const a4 = compiled.templates['home.hbs'].instances.find((i) => i.designId === 'a4/13')
  const hook = rt.hookOf(rt.sectionKey('home', a4.instanceId))
  const out = []
  const stamped = Object.entries(pilots.textFiles(compiled.files)).filter(([p]) => p.endsWith('.hbs')).flatMap(([p, b]) => [...b.matchAll(/data-instance="([^"]*)"/g)].map((m) => [p, m[1]]))
  if (stamped.length !== 1 || stamped[0][1] !== hook) out.push(`the theme stamps ${JSON.stringify(stamped)}, not A4 #13's hook ${hook} alone`)
  else if (!/^<section[^>]*class="a4-13"/.test(compiled.files[stamped[0][0]].replace(/\s+/g, ' '))) out.push(`${stamped[0][0]} carries the hook, and it is no A4 #13 root`)
  if (!compiled.css.global.includes(`[data-instance="${hook}"]`)) out.push(`the token block carries no rule for ${hook}`)
  return out
}
check('control — Story 7.4: a second hook on another section, and a token block with no rule for A4 #13\'s, are caught', () => {
  if (hookFailures(pilots74).length > 0) throw new Error(`the pilot theme is not clean to begin with: ${hookFailures(pilots74).join(' · ')}`)
  const grid = Object.keys(pilots74.files).find((p) => /^partials\/sections\/[^/]+\/post-grid/.test(p))
  mustFail(hookFailures({ ...pilots74, files: { ...pilots74.files, [grid]: pilots74.files[grid].replace('<section', '<section data-instance="00000000"') } }), /not A4 #13's hook/, 'a second hook')
  return mustFail(hookFailures({ ...pilots74, css: { ...pilots74.css, global: pilots74.css.global.replace(/\[data-instance="[0-9a-f]{8}"\]/g, '') } }), /no rule for/, 'a block with no rule')
})
check('Story 7.4 — A4 #13, its Background set to Contrast in Dark, carries the one hook — hookOf(sectionKey(\'home\', its id)) — and the token block its rules; no other section carries one', () => {
  const f = hookFailures(pilots74)
  if (f.length > 0) throw new Error(f.join('\n'))
})
const cssOf = (over) => pilots.cssFailures({ ...pilots74, ...over })
const sheetsWith = (id, edit) => ({ css: { ...pilots74.css, sheets: { ...pilots74.css.sheets, [id]: edit(pilots74.css.sheets[id]) } } })
const css74 = pilots.cssFailures(pilots74)
check('control — Story 7.4 (FR-G7 soundness): an emitted chunk with one reachable rule removed is a failure', () => {
  const root = pilots74.css.sheets['a22/1'].split('\n').find((l) => /^\.a22-1 \{/.test(l))
  if (root === undefined) throw new Error('A22 #1\'s chunk carries no root rule to remove, so this control proves nothing')
  return mustFail(cssOf(sheetsWith('a22/1', (c) => c.replace(`${root}\n`, ''))).failures, /^FR-G7: a22\/1's sheet lost a rule a placed root reaches/, 'a lost rule')
})
check('Story 7.4 (FR-G7 soundness) — no rule a placed root reaches is missing from the pilot theme\'s stylesheet', () => {
  const f = css74.failures.filter((x) => x.startsWith('FR-G7'))
  if (f.length > 0) throw new Error(f.join('\n'))
})
check('control — Story 7.4 (FR-G7\'s gap): a chunk carrying one dead rule prints a non-zero gap, and the check still passes', () => {
  const got = cssOf(sheetsWith('a17/1', (c) => `${c}\n.a17-1[data-per-row="four"] .a17-1__x { gap: 0; }`))
  if (got.failures.length > 0) throw new Error(`the gap failed the check: ${got.failures.join(' · ')}`)
  return mustFail(got.warnings, /^WARNING FR-G7: a17\/1 ships 1 rule\(s\), [1-9]\d* B/, 'a dead rule')
})
check('Story 7.4 (FR-G7\'s gap) — the emitted bytes no placed root reaches, printed as a warning, never a failure', () => {
  for (const w of css74.warnings) console.log(`  ${w}`)
  return css74.warnings.length === 0 ? 'no gap' : `${css74.warnings.length} design(s) with a gap`
})
check('control — Story 7.4 (AD-37): a screen.css carrying the rules of a design no compiled section is, is caught', () => {
  const files = Object.fromEntries(Object.entries(pilots74.files).filter(([p, b]) => !(p.startsWith('partials/sections/') && typeof b === 'string' && /^<section\s[^>]*class="a24-1"/.test(b))))
  return mustFail(cssOf({ files }).failures, /^AD-37: screen\.css carries a24\/1's rules, and no compiled section is a24\/1$/, 'an unplaced design\'s chunk')
})
check('Story 7.4 (AD-37) — every chunk in screen.css is a placed design\'s, and every selector naming a design\'s root names its own', () => {
  const f = css74.failures.filter((x) => x.startsWith('AD-37'))
  if (f.length > 0) throw new Error(f.join('\n'))
})
check(`control — Story 7.4 (NFR-2): a template that reaches an incompressible chunk past ${pilots.CSS_BUDGET} B gzipped is caught`, () => {
  return mustFail(cssOf(sheetsWith('a4/13', (c) => `${c}\n${pilots.incompressible(2 * pilots.CSS_BUDGET)}`)).failures, /^NFR-2: home\.hbs's reachable CSS is \d+ B at gzip level 9, past the \d+ B budget$/, 'an over-budget template')
})
check(`Story 7.4 (NFR-2) — each template's reachable CSS is within ${pilots.CSS_BUDGET} B at gzip level 9; the whole screen.css reported beside it`, () => {
  const f = css74.failures.filter((x) => x.startsWith('NFR-2'))
  if (f.length > 0) throw new Error(f.join('\n'))
  return css74.report.join(' · ')
})

// The strip's soundness rests on nothing at runtime writing a `data-*` on a root (`strip.ts`'s header): a claim CI reads,
// not one a comment asserts (review, 2026-10-08). Story 7.5 bundles the modules; this row holds every one of them, read
// by the one reader the compile is handed them through (`pilots.moduleSources`).
const MODULE_WRITES_DATA = /\bdataset\b|setAttribute\(\s*['"`]data-/
const MODULE_SRC = pilots.moduleSources()
check('control — Story 7.4 (FR-G7): a module source that writes a data-* attribute is caught', () => {
  for (const line of ['el.dataset.perRow = "two"', 'el.setAttribute("data-bg", "contrast")', "el.setAttribute( 'data-x', 1)"]) if (!MODULE_WRITES_DATA.test(line)) throw new Error(`${line} was not caught`)
  return 'three shapes caught'
})
check('Story 7.4 (FR-G7) — no behaviour module writes a data-* attribute, so the strip\'s proof is the root as compiled', () => {
  const sources = Object.entries(MODULE_SRC)
  if (sources.length === 0) throw new Error('no module source read')
  for (const [name, body] of sources) if (MODULE_WRITES_DATA.test(body)) throw new Error(`${name}.js writes a data-* attribute`)
  return `${sources.length} module(s)`
})

// ── Story 7.5: the scripts — main.js, cards.js and the two tags over the pilot theme, and every module file ─────────────
// The pilots compile with every file of packages/library/modules/ and Ghost's vendored card scripts (tools/pilot-theme.mjs).
// Each row behind its control.
const { tidyLicence } = await import(join(REPO, 'packages/theme-compiler/src/index.ts'))
const GHOST = pilots.ghostCards()
const pilots75 = pilots.compilePilots(WORDS, THEME)
const jsFailures = (files) => [...lib.checkThemeJs(pilots.textFiles(files), MODULE_SRC, GHOST.scripts), ...lib.checkThemeScripts(pilots.textFiles(files))]
check('control — Story 7.5: a template carrying <script>alert(1)</script>, and a main.js with one byte appended, are each named', () => {
  const files = pilots75.files
  if (jsFailures(files).length > 0) throw new Error(`the pilot theme is not clean to begin with: ${jsFailures(files).join(' · ')}`)
  mustFail(jsFailures({ ...files, 'post.hbs': `${files['post.hbs']}<script>alert(1)</script>\n` }), /^post\.hbs: "<script>alert\(1\)<\/script>" is no script/, 'a stray script')
  return mustFail(jsFailures({ ...files, 'assets/js/main.js': `${files['assets/js/main.js']} ` }), /^assets\/js\/main\.js is not the bytes bundle\(\) makes/, 'a byte appended to main.js')
})
check('Story 7.5 — the pilot theme\'s JS is clean: checkThemeJs, with Ghost\'s card scripts, and checkThemeScripts say nothing', () => {
  const f = jsFailures(pilots75.files)
  if (f.length > 0) throw new Error(f.join('\n'))
  return Object.keys(pilots75.files).filter((p) => p.startsWith('assets/js/')).join(', ')
})
/** What the compiled templates mount, against main.js's header: `failures`, and a `WARNING FR-G7` line for each mounted
 *  module with no file yet — its mounts ship at rest, and the check passes. */
function mountFailures(files, modules) {
  const failures = []
  const mounted = new Set()
  for (const [path, body] of Object.entries(pilots.textFiles(files))) {
    if (!path.endsWith('.hbs')) continue
    for (const m of body.replace(lib.HBS_COMMENT, '').matchAll(/\bdata-module="([^"]*)"/g)) {
      const d = lib.parseModuleDeclaration(m[1])
      if (typeof d === 'string') failures.push(`${path}: ${d}`)
      else mounted.add(d.name)
    }
  }
  const order = lib.MODULES.map((r) => r.name).filter((n) => mounted.has(n))
  const written = order.filter((n) => Object.hasOwn(modules, n))
  const listed = lib.bundledNames(files['assets/js/main.js'] ?? '')
  if (listed === null || listed[0] !== 'core') failures.push('assets/js/main.js opens with no header naming core')
  else if (listed.slice(1).join() !== written.join()) failures.push(`main.js carries ${listed.slice(1).join(' · ') || 'no module'}, and the templates mount ${written.join(' · ') || 'no module'} with a file`)
  const warnings = order.filter((n) => !Object.hasOwn(modules, n)).map((n) => `WARNING FR-G7: ${n} is mounted and has no file yet — its mounts ship at rest`)
  return { failures, warnings, mounted: order }
}
check('control — Story 7.5: with a stub nav-drawer file, main.js lists it and no warning names it; a main.js missing it fails', () => {
  const modules = { ...MODULE_SRC, 'nav-drawer': 'export function navDrawer(el) {}\n' }
  const stubbed = pilots.compilePilots(WORDS, { ...THEME, modules })
  const got = mountFailures(stubbed.files, modules)
  if (got.failures.length > 0) throw new Error(got.failures.join(' · '))
  if (!lib.bundledNames(stubbed.files['assets/js/main.js']).includes('nav-drawer')) throw new Error('main.js does not list the stub nav-drawer')
  if (got.warnings.some((w) => w.includes('nav-drawer'))) throw new Error('a warning names nav-drawer, which has a file')
  // the positive half (review, 2026-10-08): on the pilots as read, each mounted module with no file IS warned, and the list
  // derived from the markup equals the compiler's own record, so a warning list gone silent fails here
  const real = mountFailures(pilots75.files, MODULE_SRC)
  const atRest = real.mounted.filter((n) => !Object.hasOwn(MODULE_SRC, n))
  if (atRest.length === 0) throw new Error('every mounted module has a file, so this control proves nothing — move it to a planted mount')
  if (real.warnings.map((w) => w.split(' ')[2]).join() !== atRest.join()) throw new Error(`the warnings name ${real.warnings.join(' · ') || 'nothing'}, and the markup mounts ${atRest.join(', ')} with no file`)
  if (atRest.join() !== pilots75.js.atRest.join() || lib.bundledNames(pilots75.files['assets/js/main.js']).slice(1).join() !== pilots75.js.bundled.join()) throw new Error(`the compiler's js record says bundled ${pilots75.js.bundled.join(', ') || 'none'} / at rest ${pilots75.js.atRest.join(', ') || 'none'}, and the markup says ${atRest.join(', ')}`)
  return mustFail(mountFailures({ ...stubbed.files, 'assets/js/main.js': lib.bundle([], modules) }, modules).failures, /^main\.js carries no module, and the templates mount nav-drawer/, 'a main.js missing a mounted written module')
})
check('Story 7.5 — main.js is what the markup mounts: core, then each mounted module with a file, in registry order; each mounted module with no file is a warning', () => {
  const got = mountFailures(pilots75.files, MODULE_SRC)
  if (got.failures.length > 0) throw new Error(got.failures.join('\n'))
  for (const w of got.warnings) console.log(`  ${w}`)
  return `main.js: ${lib.bundledNames(pilots75.files['assets/js/main.js']).join(' · ')}; mounted: ${got.mounted.join(', ') || 'none'}`
})
// every vendored scripted card designed: cards.js, Ghost's licence, the tag, README's line and the exclusions
const CARD_NAMES = Object.keys(GHOST.scripts)
const pilotsCards = pilots.compilePilots(WORDS, { ...THEME, designedCards: CARD_NAMES })
function cardsFailures(files) {
  const out = []
  if (files['assets/js/cards.js'] !== lib.cardsJs(CARD_NAMES, GHOST.scripts)) out.push('assets/js/cards.js is not cardsJs of every vendored chunk')
  if (files['LICENSE-ghost.txt'] !== tidyLicence(GHOST.licence)) out.push('LICENSE-ghost.txt is not Ghost\'s licence, tidied')
  if ((files['default.hbs'] ?? '').split('</head>')[0].split(lib.CARDS_JS_TAG).length !== 2) out.push('default.hbs\'s head does not carry CARDS_JS_TAG once')
  const line = (files['README.md'] ?? '').split('\n').find((l) => l.startsWith('- `assets/js/cards.js`')) ?? ''
  if (!line.includes(CARD_NAMES.join(' · ')) || !line.includes('`LICENSE-ghost.txt`')) out.push('README.md\'s cards line does not name every card and the licence file')
  let exclude = []
  try { exclude = JSON.parse(files['package.json']).config.card_assets.exclude ?? [] } catch { /* named below */ }
  const unexcluded = CARD_NAMES.filter((n) => !exclude.includes(n))
  if (unexcluded.length > 0) out.push(`package.json does not exclude ${unexcluded.join(', ')}`)
  return out
}
check('control — Story 7.5: cards.js with one byte changed is named by checkThemeJs; each other piece of the cards, taken away, is named', () => {
  const files = pilotsCards.files
  if (cardsFailures(files).length > 0 || jsFailures(files).length > 0) throw new Error(`the cards theme is not clean to begin with: ${[...cardsFailures(files), ...jsFailures(files)].join(' · ')}`)
  const js = files['assets/js/cards.js']
  const changed = `${js.slice(0, -2)}${js.at(-2) === ';' ? ' ' : ';'}\n`
  mustFail(lib.checkThemeJs(pilots.textFiles({ ...files, 'assets/js/cards.js': changed }), MODULE_SRC, GHOST.scripts), /^assets\/js\/cards\.js is not the bytes cardsJs\(\) makes/, 'a changed byte')
  const pkg = JSON.parse(files['package.json'])
  const without = [
    [{ 'LICENSE-ghost.txt': 'MIT\n' }, /LICENSE-ghost\.txt is not/],
    [{ 'default.hbs': files['default.hbs'].replace(lib.CARDS_JS_TAG, '') }, /CARDS_JS_TAG/],
    [{ 'README.md': files['README.md'].replace(/\n- `assets\/js\/cards\.js`[^\n]*/, '') }, /README\.md's cards line/],
    [{ 'package.json': `${JSON.stringify({ ...pkg, config: { ...pkg.config, card_assets: { exclude: ['toggle'] } } }, null, 2)}\n` }, /does not exclude audio, gallery, video/],
  ]
  for (const [over, pattern] of without) mustFail(cardsFailures({ ...files, ...over }), pattern, pattern.source)
  return `${without.length + 1} pieces`
})
check('Story 7.5 — every vendored scripted card designed: cards.js is cardsJs over the vendored files, Ghost\'s licence tidied at the root, the cards tag in the head, README\'s cards line, package.json\'s exclusions; checkThemeJs, checkThemeScripts and the theme\'s text scan over the real vendored bytes say nothing', () => {
  // review (2026-10-08): the text scan too — the one tree whose bytes are not repo-authored is the one it must read
  const f = [...cardsFailures(pilotsCards.files), ...jsFailures(pilotsCards.files), ...pilots.themeFailures(pilotsCards.files, pilotsCards.instanceIds)]
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${CARD_NAMES.join(' · ')}, ${Buffer.byteLength(pilotsCards.files['assets/js/cards.js'])} B`
})
check('control — Story 7.5: planted module sources carrying R-21, ponytail: and the builder\'s name are each named by the theme\'s text scan', () => {
  const core = MODULE_SRC.core
  mustFail(pilots.textFailures('core.js', `${core}// R-21: held still\n`), /^core\.js: an internal reference$/, 'R-21')
  mustFail(pilots.textFailures('core.js', `${core}// ponytail: one scan\n`), /^core\.js: an internal reference$/, 'ponytail:')
  return mustFail(pilots.textFailures('core.js', `// The Inflozo runtime\n${core}`), /^core\.js: the builder's name$/, 'the builder\'s name')
})
check('Story 7.5 — every module file passes the theme\'s text scan: its comments ship inside every theme\'s main.js', () => {
  const f = Object.entries(MODULE_SRC).flatMap(([name, body]) => pilots.textFailures(`packages/library/modules/${name}.js`, body))
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${Object.keys(MODULE_SRC).length} module file(s)`
})
check('control — Story 7.5 (DW-146): a planted countdown calling ctx.t(\'weeks\') is named; ctx.t(\'days\') is clean', () => {
  const countdown = (key) => `export function countdown(el, ctx) {\n  el.textContent = ctx.t('${key}')\n}\n`
  if (lib.moduleKeyRefusals({ ...MODULE_SRC, countdown: countdown('days') }).length > 0) throw new Error(`ctx.t('days') was refused: ${lib.moduleKeyRefusals({ ...MODULE_SRC, countdown: countdown('days') }).join(' · ')}`)
  return mustFail(lib.moduleKeyRefusals({ ...MODULE_SRC, countdown: countdown('weeks') }), /^countdown\.js calls t\('weeks'\)/, 'an undeclared key')
})
check('Story 7.5 (DW-146) — every t() key a module file calls derives from a string its registry row declares', () => {
  const f = lib.moduleKeyRefusals(MODULE_SRC)
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${Object.keys(MODULE_SRC).length} module file(s)`
})

// ── Story 7.6: Ghost-correct markup — the article, Ghost's helpers in place, pictures, Portal, AD-38, V1 and gscan's
// deprecations, over the pilot theme and every design. Each row behind its control. ─────────────────────────────────────
const { checkGhostMarkup, POST_ARTICLE } = await import(join(REPO, 'packages/theme-compiler/src/index.ts'))
const pilots76 = pilots.textFiles(pilots.compilePilots(WORDS, THEME).files)
const markupOf = (files) => checkGhostMarkup(pilots.textFiles(files))
check('control — Story 7.6: one copy of the pilot theme with five defects planted — ghost_head above the stylesheet, post_class on <body>, A17\'s sizes removed, data-portal="share", {{@member.email}} — names each', () => {
  if (markupOf(pilots76).length > 0) throw new Error(`the pilot theme is not clean to begin with: ${markupOf(pilots76).join(' · ')}`)
  const header = Object.keys(pilots76).find((p) => /^partials\/sections\/default\/header/.test(p))
  const news = Object.keys(pilots76).find((p) => /^partials\/sections\/shared\/newsletter/.test(p))
  const planted = {
    ...pilots76,
    'default.hbs': pilots76['default.hbs'].replace('    {{ghost_head}}\n', '').replace('    <link rel="stylesheet"', '    {{ghost_head}}\n    <link rel="stylesheet"')
      .replace('<body class="{{body_class}}">', '<body class="{{body_class}} {{post_class}}">'),
    'partials/post-card.hbs': pilots76['partials/post-card.hbs'].replace(/\n *sizes="[^"]*"/, ''),
    [header]: pilots76[header].replace('data-portal="signup"', 'data-portal="share"'),
    [news]: `${pilots76[news]}<p>{{@member.email}}</p>\n`,
  }
  const got = markupOf(planted)
  const named = [
    mustFail(got, /^default\.hbs: \{\{ghost_head\}\} is not the last line before <\/head>/, 'ghost_head above the stylesheet'),
    mustFail(got, /^default\.hbs: \{\{post_class\}\} outside <article/, 'post_class on <body>'),
    mustFail(got, /^partials\/post-card\.hbs: <img> carries a srcset and no sizes/, "A17's sizes removed"),
    mustFail(got, /data-portal="share" is no page Portal opens/, 'data-portal="share"'),
    mustFail(got, /\{\{@member\.email\}\} prints a member's own data/, '{{@member.email}}'),
  ]
  if (got.length !== named.length) throw new Error(`five defects planted, ${got.length} sentences: ${got.join(' · ')}`)
  return `${named.length} named`
})
check('Story 7.6 — checkGhostMarkup over the pilot theme returns nothing: Ghost\'s head, foot and body class in place, post_class only on the article, every srcset the theme\'s own with sizes, every data-portal a Portal page, no member\'s own data', () => {
  const f = markupOf(pilots76)
  if (f.length > 0) throw new Error(f.join('\n'))
  const sets = Object.values(pilots76).reduce((n, b) => n + (b.match(/\ssrcset="/g) ?? []).length, 0)
  if (sets === 0) throw new Error('the pilot theme carries no srcset, so the picture rule proves nothing')
  return `${sets} srcset(s), each asking for WebP on a tag with sizes`
})
/** `[]` when post.hbs's sections sit inside POST_ARTICLE inside {{#post}}, and no other template carries the article. */
function articleFailures(files) {
  const out = []
  const post = (files['post.hbs'] ?? '').split('\n')
  const open = post.indexOf('{{#post}}')
  if (open === -1 || post[open + 1] !== `  ${POST_ARTICLE}` || post.at(-3) !== '  </article>' || post.at(-2) !== '{{/post}}') out.push('post.hbs: its block is not {{#post}}, POST_ARTICLE, the sections, </article>, {{/post}}')
  const inside = post.slice(open + 2, -3).filter((l) => l !== '')
  if (inside.length === 0 || inside.some((l) => !l.startsWith('    '))) out.push('post.hbs: its sections do not sit one level inside the article')
  for (const [path, body] of Object.entries(files)) {
    if (!path.endsWith('.hbs') || path === 'post.hbs') continue
    if (/<article\b|post_class/.test(body.replace(lib.HBS_COMMENT, ''))) out.push(`${path}: carries <article or post_class, which only the post's own page does`)
  }
  return out
}
check('control — Story 7.6: post.hbs with the article removed is named by checkGhostMarkup\'s rule 3, and by the article row', () => {
  const bare = { ...pilots76, 'post.hbs': pilots76['post.hbs'].replace(`  ${POST_ARTICLE}\n`, '').replace('  </article>\n', '').replace(/^ {4}/gm, '  ') }
  mustFail(articleFailures(bare), /^post\.hbs: its block is not/, 'the article removed (the row)')
  return mustFail(markupOf(bare), /^post\.hbs: the first line inside \{\{#post\}\} is not <article/, 'the article removed (rule 3)')
})
check('Story 7.6 — the pilot theme\'s post.hbs holds A24 #1 and A22 #1 inside POST_ARTICLE inside {{#post}}, and no other template carries <article or post_class', () => {
  const f = articleFailures(pilots76)
  if (f.length > 0) throw new Error(f.join('\n'))
  return [...pilots76['post.hbs'].matchAll(/\{\{> "([^"]+)"\}\}/g)].map((m) => m[1]).join(' · ')
})
check('control — Story 7.6: the pilot compile throws V1\'s sentence when A24 #1\'s title binding ships its authored English as a fallback', () => {
  const find = pilots.library()
  const typed = (id) => {
    const e = find(id)
    return id === 'a24/1' ? { ...e, html: e.html.replace(/(class="a24-1__title" data-bind="title") data-empty="hide"/, '$1') } : e
  }
  typed.ids = find.ids
  if (typed('a24/1').html === find('a24/1').html) throw new Error('A24 #1\'s title binding is not where this control expects it')
  return mustThrow(() => pilots.compilePilots(WORDS, { ...THEME, find: typed }), /^the theme's markup: [^]*partials\/sections\/post\/[^:]+: <h1> "[^"]+" is a label typed into the template/, 'a typed fallback')
})
check('Story 7.6 — checkChromeText over the pilot tree before substitution says nothing: the pilot compile, which runs it and throws on a sentence, returns', () => {
  pilots.compilePilots(WORDS, THEME)
  return 'V1 holds at compile'
})
check('control — Story 7.6: A17 #1\'s partial with its sizes removed is named by checkGhostMarkup', () => {
  const a17 = rendered.find((r) => r.id === 'a17/1')
  if (a17 === undefined) throw new Error('A17 #1 did not render above')
  if (checkGhostMarkup(a17.files).length > 0) throw new Error(`A17 #1 is not clean to begin with: ${checkGhostMarkup(a17.files).join(' · ')}`)
  return mustFail(checkGhostMarkup({ ...a17.files, 'partials/post-card.hbs': a17.files['partials/post-card.hbs'].replace(/\n *sizes="[^"]*"/, '') }), /^partials\/post-card\.hbs: <img> carries a srcset and no sizes/, 'A17 #1 without sizes')
})
// Story 7.6's review: `checkChromeText` runs at compile, where a text binding left in FR-H8's fallback mode (`{{#if x}}{{x}}
// {{else}}Authored English{{/if}}`, no `data-empty="hide"`) throws for every project that places the design — and render-time
// V1 exempts bound text, so nothing above names it at its design. Every design's theme text carries no `{{else}}` followed
// by bare letters (no tag between) before its `{{/if}}` — a `{{else}}` branch that opens a tag is a design's own markup.
const FALLBACK_TEXT = /\{\{else\}\}[^<{]*[A-Za-z0-9][^<{]*\{\{\/if\}\}/
const fallbackFailures = (files) => Object.entries(files).filter(([p, b]) => p.endsWith('.hbs') && FALLBACK_TEXT.test(b.replace(lib.HBS_COMMENT, ''))).map(([p]) => `${p}: a text binding ships its authored English as a fallback — the compile refuses it (V1); bind it with data-empty="hide"`)
check('control — Story 7.6: A24 #1 rendered with its title binding\'s data-empty="hide" removed is named by the fallback row', () => {
  const d = loadDesign({ category: 'a24', n: '1' })
  const html = d.html.replace(/(data-bind="title") data-empty="hide"/, '$1')
  if (html === d.html) throw new Error('A24 #1\'s title binding is not where this control expects it')
  return mustFail(fallbackFailures(renderDesign({ ...d, html }).files), /^template\.hbs: a text binding ships its authored English/, 'A24 #1 in fallback mode')
})
check('Story 7.6 — no design\'s rendered theme text leaves a text binding in fallback mode, so checkChromeText holds for every design at compile', () => {
  const f = rendered.flatMap((r) => fallbackFailures(r.files).map((s) => `${r.id} — ${s}`))
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${rendered.length} designs`
})
check('Story 7.6 — checkGhostMarkup over every design\'s rendered theme text returns nothing, so an authoring defect is named at its design', () => {
  const f = rendered.flatMap((r) => checkGhostMarkup(r.files).map((s) => `${r.id} — ${s}`))
  if (f.length > 0) throw new Error(f.join('\n'))
  return `${rendered.length} designs`
})
// gscan's own GS001-DEPR-* rules decide what is deprecated (no list of Inflozo's), on each major's own checker
const gscanBlog = await gscanOr({ ...pilotTheme, 'post.hbs': `${pilotTheme['post.hbs']}{{@blog.title}}\n` })
for (const m of MAJORS) {
  check(`control — Story 7.6: the pilot theme with {{@blog.title}} appended to post.hbs raises GS001-DEPR-BLOG under ${pinOf(m)}`, () => mustFail(raised(gscanBlog[m]), / GS001-DEPR-BLOG$/, '{{@blog.title}}'))
  check(`Story 7.6 — ${pinOf(m)} raises no GS001-DEPR-* error or warning on the pilot theme`, () => {
    const hit = raised(gscanPilots[m]).filter((r) => / GS001-DEPR-/.test(r))
    if (hit.length > 0) throw new Error(hit.join('\n'))
  })
}

// ── Story 7.7: the gscan gate's verdicts, on both checkers (FR-J6, AD-24) ──────────────────────────────────────────────
// `gscanGate` maps each major's own checker through the one table: errors block, warnings deploy. Today's pilot theme has
// no `cards.css` (Story 7.13's) and no `page.hbs` reading Ghost's page switch (Story 10.79's), so it is blocked on the two
// Koenig widths and warned on the switch; behind §73's scaffold, which supplies exactly those two files, it is clean.
const gateOr = async (files) => Object.fromEntries(await Promise.all(MAJORS.map(async (m) => [m, await gate.gscanGate(files, m)])))
const shape = (v) => ({ blocked: v.blocked, errors: v.errors.map((f) => `${f.code} ${f.rule ?? ''}`.trim()), warnings: v.warnings.map((f) => `${f.code} ${f.rule ?? ''}`.trim()) })
const sameShape = (got, want) => { if (JSON.stringify(shape(got)) !== JSON.stringify(want)) throw new Error(`the verdict is ${JSON.stringify(shape(got))}, not ${JSON.stringify(want)}`) }
const clash = Object.keys(pilots.SCAFFOLD).filter((p) => p in pilotTheme)
const gatePilots = await gateOr(pilotTheme)
const gateScaffolded = await gateOr({ ...pilotTheme, ...pilots.SCAFFOLD })
for (const m of MAJORS) {
  check(`control — Story 7.7: the pilot theme plus §73's scaffold (Story 7.13's cards.css, Story 10.79's page.hbs) gives an empty, unblocked verdict under ${pinOf(m)}`, () => {
    if (clash.length > 0) throw new Error(`the scaffold would replace compiled files: ${clash.join(', ')}`)
    sameShape(gateScaffolded[m], { blocked: false, errors: [], warnings: [] })
  })
  check(`Story 7.7 — the pilot theme's verdict under ${pinOf(m)}: blocked on exactly GS050-CSS-KGWF and -KGWW (ref styles), warned on exactly page_switch_unused`, () => {
    sameShape(gatePilots[m], { blocked: true, errors: ['theme_check_rule GS050-CSS-KGWF', 'theme_check_rule GS050-CSS-KGWW'], warnings: ['page_switch_unused GS110-NO-MISSING-PAGE-BUILDER-USAGE'] })
    const refs = gatePilots[m].errors.flatMap((f) => f.refs)
    if (refs.join() !== 'styles,styles') throw new Error(`the two GS050 errors name ${refs.join(', ')}, not styles`)
    return gatePilots[m].warnings[0].detail
  })
}
// AD-36: a customer's words never trip gscan. The four error words go into A4 #13's eyebrow (through `escapeUserText`) and
// `currency_symbol` into every layer name (through the boundary comment's `commentPart`); the control writes them raw.
const TRIGGERS = ['GS001-DEPR-CURR-SYM', 'GS001-DEPR-SITE-LANG', 'GS001-DEPR-LABS-MEMBERS', 'GS060-JS-GUA']
const typedWords = { pageWord: 'Pageword currency_symbol @site.lang @labs.members ghost.url.api', layerWord: 'currency_symbol' }
// the inert forms are derived from the runtime's own escaper, never restated (Review, 2026-10-09)
const { gscanInert } = await import(join(REPO, 'packages/section-runtime/src/index.ts'))
const inertPage = gscanInert(typedWords.pageWord)
const inertLayer = gscanInert(typedWords.layerWord)
if (inertPage === typedWords.pageWord || inertLayer === typedWords.layerWord) throw new Error('gscanInert left the typed words as they are, so the rows below would prove nothing')
const typedTheme = pilots.compilePilots(typedWords, THEME).files
const typedRaw = { ...typedTheme, 'post.hbs': `${typedTheme['post.hbs']}<p>${typedWords.pageWord}</p>\n` }
const gscanTyped = await gscanOr(typedTheme)
const gscanTypedRaw = await gscanOr(typedRaw)
const triggered = (results) => TRIGGERS.filter((rule) => results.some((r) => r.endsWith(` ${rule}`)))
for (const m of MAJORS) {
  check(`control — Story 7.7: the same words written raw into post.hbs raise each of the four rules under ${pinOf(m)}`, () => {
    const got = triggered(raised(gscanTypedRaw[m]))
    if (got.join() !== TRIGGERS.join()) throw new Error(`raw, they raise ${got.join(', ') || 'nothing'}, not ${TRIGGERS.join(', ')}`)
  })
  check(`Story 7.7 — a customer's words in A4 #13's eyebrow and in every layer name raise none of the four rules under ${pinOf(m)} (AD-36)`, () => {
    const text = pilots.textFiles(typedTheme)
    const labels = Object.values(text).flatMap((b) => b.split('\n').filter((l) => l.trimStart().startsWith('{{!--')))
    // every label the customer named carries the layer word, inert (an untouched page's synthesized labels carry none)
    if (!labels.some((l) => l.includes(inertLayer)) || labels.some((l) => l.includes(typedWords.layerWord))) throw new Error(`the boundary comments do not carry the layer word, inert — ${labels.join(' | ')}`)
    if (!Object.values(text).some((b) => b.includes(inertPage))) throw new Error('A4 #13\'s eyebrow does not carry the typed words, inert')
    const got = triggered(raised(gscanTyped[m]))
    if (got.length > 0) throw new Error(`a customer's words raise ${got.join(', ')}`)
  })
}

// ── Story 7.8: the emitted-theme quality gate (FR-J17, AD-34) ─────────────────────────────────────────────────────────
// `qualityGate` over the pilot theme, Paper's pack and the library from disk: no error and no warning, its wall time
// printed (measured, never asserted). axe-core 4.12.1 — the render matrix's version — runs QUALITY_RULES' own axe ids in
// jsdom over each page `readPages` assembles (exactly what the gate read) and must agree: no violation on the pilots, and
// on the planted page both fire. `themeFailures` reads AD-34's leak assertions through the gate's `leftovers`.
const { REFERENCE_PACK } = await import(join(REPO, 'packages/section-runtime/src/reference.ts'))
const PILOT_LIBRARY = pilots.library()
const pilots78 = pilots.compilePilots(WORDS, { ...THEME, find: PILOT_LIBRARY })
const qualityOf = (files) => gate.qualityGate(files, { pack: REFERENCE_PACK, library: PILOT_LIBRARY })
const said78 = (v) => [...v.errors, ...v.warnings].map((f) => `${f.level} ${f.code} ${f.refs.join(',')}: ${f.message}${f.detail ? ` ${f.detail}` : ''}`)
const t78 = performance.now()
const quality78 = qualityOf(pilots78.files)
const qualityMs = performance.now() - t78
// the control's plant: an <h4> straight after A24 #1's invocation (its <h1>) in post.hbs
const a24 = /^( *)\{\{> "sections\/post\/[^"]+"\}\}$/m.exec(pilots78.files['post.hbs'] ?? '')
const planted78 = a24 === null ? null : { ...pilots78.files, 'post.hbs': pilots78.files['post.hbs'].replace(a24[0], `${a24[0]}\n${a24[1]}<h4>Planted</h4>`) }
check('control — Story 7.8: the pilot theme with an <h4> planted after A24 #1\'s <h1> in post.hbs gives exactly one heading_skip, refs[0] post.hbs', () => {
  if (planted78 === null) throw new Error('post.hbs carries no section invocation to plant after')
  const v = qualityOf(planted78)
  const got = [...v.errors, ...v.warnings].map((f) => `${f.code} ${f.refs[0]}`)
  if (got.join() !== 'heading_skip post.hbs' || v.blocked) throw new Error(`the planted verdict is ${JSON.stringify(said78(v))}`)
  return v.warnings[0].message
})
check('Story 7.8 — the pilot theme\'s quality verdict is empty: no error and no warning (Paper\'s pack, the library on disk)', () => {
  if (quality78.blocked || quality78.errors.length + quality78.warnings.length > 0) throw new Error(said78(quality78).join('\n'))
  return `qualityGate ran in ${qualityMs.toFixed(0)} ms (measured, not asserted)`
})
// axe-core in jsdom, over each assembled page (`tools/pilot-theme.mjs`'s `axeOn`, the recorder's too) — run here, before
// its rows, because `check` is synchronous
const AXE_IDS = pilots.axeIds(gate.QUALITY_RULES)
/** axe's violations over every page `readPages` assembles: `[page, rule]`, in page order. */
async function axeViolations(files) {
  const out = []
  for (const page of gate.readPages(files)) for (const id of await pilots.axeOn(page.text, AXE_IDS)) out.push(`${page.file} ${id}`)
  return out
}
const axePilots = await axeViolations(pilots78.files).catch((e) => e)
const axePlanted = planted78 === null ? new Error('no plant') : await axeViolations(planted78).catch((e) => e)
check(`control — Story 7.8: axe-core ${gate.AXE_CORE} over the planted pages reports heading-order on post.hbs, as the gate reports heading_skip`, () => {
  const got = raised(axePlanted)
  if (got.join() !== 'post.hbs heading-order') throw new Error(`axe reports ${JSON.stringify(got)} on the planted pages`)
  return got.join()
})
check(`Story 7.8 — axe-core agrees: the installed axe-core is ${gate.AXE_CORE}, and it reports no violation of QUALITY_RULES' axe ids over the pilot theme's pages`, () => {
  if (pilots.AXE_VERSION !== gate.AXE_CORE) throw new Error(`axe-core ${pilots.AXE_VERSION} is installed where QUALITY_RULES follows ${gate.AXE_CORE} — re-read every rule's axe source line, then move AXE_CORE`)
  const got = raised(axePilots)
  if (got.length > 0) throw new Error(`axe reports ${got.join(', ')}`)
  return `${AXE_IDS.length} rules over ${gate.readPages(pilots78.files).length} pages`
})
check('control — Story 7.8: themeFailures reads AD-34\'s leaks through leftovers — a planted expression token and an orphan partial are each its sentence', () => {
  const broken = { ...pilots78.files, 'post.hbs': `${pilots78.files['post.hbs']}<p>${rt.T0}0${rt.T1}</p>\n`, 'partials/orphan.hbs': '<p>x</p>\n' }
  const said = gate.leftovers(broken)
  if (said.join(' · ') !== 'partials/orphan.hbs: a partial no template uses · post.hbs: an expression token') throw new Error(`leftovers says ${JSON.stringify(said)}`)
  const f = pilots.themeFailures(broken, pilots78.instanceIds)
  const missing = said.filter((x) => !f.includes(x))
  if (missing.length > 0) throw new Error(`themeFailures does not carry ${missing.join(', ')}: ${JSON.stringify(f)}`)
  return said.join(' · ')
})
check('Story 7.8 — leftovers over the pilot theme says nothing: no consumed directive, no token or marker, every partial referenced', () => {
  const said = gate.leftovers(pilots78.files)
  if (said.length > 0) throw new Error(said.join('\n'))
})

// ── the totals, printed and stored nowhere ────────────────────────────────────────────────────────────────
const targets = rendered.reduce((t, r) => t + r.entry.compileTarget.length, 0)
const files = rendered.reduce((t, r) => t + Object.keys(r.files).length, 0)
const categories = new Set(rendered.map((r) => r.id.split('/')[0])).size
console.log(`\n  designs ${rendered.length} · categories ${categories} · renders ${targets * 2} (${targets} targets × both emitters) · snapshot files ${files}`)

if (failed) {
  console.log(`\ncheck-snapshots: FAIL — ${failed} check(s) failed\n`)
  process.exit(1)
}
console.log(`\ncheck-snapshots: PASS — ${rendered.length} designs at ${targets} targets match ${files} committed snapshot files${UPDATE ? ' (rewritten by --update)' : ''}\n`)
