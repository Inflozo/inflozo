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
//     node tools/check-snapshots.mjs            (Node 24: it imports the packages' TypeScript)
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
    const refused = rt.checkBindings(doc(), entry.html, { target, dataBindings: entry.dataBindings })
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
  const m = /class="([^"]+)"/.exec(d.html)
  if (m === null) throw new Error(`${id} carries no class to change`)
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

/** R-74 for a setting's words: the title a built design's setting prints is one its own frame draws. The register
 *  holds a title to a group; this holds a design to its drawn titles, so relabelling a setting to another registered
 *  title — "Card side" to "Picture side" — cannot move it between groups unseen. */
const EXPORT = join(REPO, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', middot: '·' }
const frameTitles = (category, n) => {
  const frame = readdirSync(EXPORT).find((f) => f.startsWith(`${category.toUpperCase()}-${n} `) && f.endsWith('.dc.html'))
  if (frame === undefined) return null
  const decode = (t) => t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&([a-z]+);/g, (m, e) => ENTITIES[e] ?? m)
  return { frame, titles: new Set([...readFileSync(join(EXPORT, frame), 'utf8').matchAll(/>([^<>]+)</g)].map((m) => titleKey(decode(m[1])))) }
}
const frameFailures = (id, controlSchema) => {
  const [category, n] = id.split('/')
  const drawn = frameTitles(category, n)
  if (drawn === null) return [`${id}: no ${category.toUpperCase()}-${n} frame in the design export to read its titles from (R-74)`]
  return controlSchema.filter((c) => !drawn.titles.has(titleKey(c.label))).map((c) => `${id}: "${c.label}" is not a title ${drawn.frame} draws — a setting prints its frame's words (R-74); where one panel would print a title twice (R-13), the register's note says which words give way`)
}

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
  const split = Object.entries(REGISTER).flatMap(([category, table]) => Object.entries(table).filter(([, e]) => typeof e === 'object' && !Array.isArray(e)).map(([title, e]) => ({ category, title, e })))[0]
  if (split === undefined) throw new Error('the register carries no design of its own, so the per-design reading is unproved')
  const [n, own] = Object.entries(split.e.designs)[0]
  if (registered(split.category, n, split.title) !== own || registered(split.category, '9999', split.title) !== split.e.group) throw new Error(`${split.category} "${split.title}": design ${n} reads ${registered(split.category, n, split.title)}, another design ${registered(split.category, '9999', split.title)}`)
  return moved[0].split(' — ')[0]
})

check('control — a stylesheet reaches the validator: A24 #1 with one rule still on its old meta attribute does not assemble (AD-3)', () =>
  mustThrow(() => assemble({ ...byId('a24/1'), css: `${byId('a24/1').css}\n.a24-1[data-meta="off"] .x { display: none; }\n` }), /stylesheet-control-undeclared/, 'A24 #1 with a stale [data-meta] rule'))
check('control — R-74: a built setting relabelled to a title its frame does not draw is caught, naming the frame', () => {
  const r = rendered.find((x) => x.id === 'a4/13') ?? rendered.find((x) => x.entry.controlSchema.length > 0)
  const c = r.entry.controlSchema[0]
  if (frameFailures(r.id, [c]).length !== 0) throw new Error(`"${c.label}" is not found in its own frame, so this control proves nothing`)
  return mustFail(frameFailures(r.id, [{ ...c, label: 'Picture side' }]), /"Picture side" is not a title A4-13 /, `${r.id} relabelled`)
})

check('R-113 — every built design\'s settings print their frame\'s titles (R-74), are filed in the register and sit where it files them; one control name holds one type, value set and group across the library (R-53); no panel, the controls sample\'s too, prints one title twice, its accordions\' included (R-13)', () => {
  const filed = rendered.flatMap((r) => [...registerFailures(r.id, r.entry.controlSchema), ...frameFailures(r.id, r.entry.controlSchema)])
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
  if (!theme.includes('{{#get "posts" limit="1" order="published_at desc"}}')) throw new Error(`the theme does not query one post:\n${theme}`)
  // FR-H8: the srcset is inside `{{#if feature_image}}`, so the unguarded state is unreachable on the theme
  if (!/\{\{#if feature_image\}\}[^]*?srcset="\{\{/.test(theme)) throw new Error(`the srcset is not inside {{#if feature_image}}:\n${theme}`)
  if (rt.sidebar(entry, {}).groups.some((g) => g.id === 'data')) throw new Error('the panel offers a number of posts')
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
