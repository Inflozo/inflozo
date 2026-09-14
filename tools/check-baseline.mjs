// Story 4.8 — FR-G8's floor, checked by execution on every `pnpm check`: every row of the story's I/O matrix,
// controls first (standing rule: a result whose control did not pass is not a result).
//
// One copy of each thing, and this file restates none of them:
// - the PIN is the root `package.json`'s `browserslist-config-baseline.widelyAvailableOnDate`, the one place
//   `browserslist-config-baseline` reads it (from the WORKING DIRECTORY's package.json — executed);
// - the TIERS are `packages/library/baseline.json`;
// - the STYLESHEET RULES are the root `stylelint.config.mjs`, loaded as stylelint loads it;
// - the FLOOR is printed here and stored nowhere.
//
// What it does:
//  1. the floor two ways — browserslist for a module file, and research §A3's method over web-features — and
//     every browser that disagrees is named;
//  2. the pin reaches eslint-plugin-compat (`new ImageCapture()` refused at Safari 17.2, which an unpinned floor
//     of Safari 17.4 passes);
//  3. every Tier-2 date recomputed as `baseline_low_date` + 30 months, and R-105's one exception held alone;
//  4. the stylelint plugin diffed against the pin, row by row, over every identifier-shaped `css.properties` row;
//  5. the matrix's stylesheet rows and the repository's own sheets through the real config;
//  6. `size-limit` over `bundle()`'s maximal main.js: NFR-2's 40 kB (brotli) as a WARNING, with a 1 B control.
//
//     node tools/check-baseline.mjs          (Node 24: it imports packages/library/src/modules.ts)

import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
// browserslist-config-baseline reads the pin from process.cwd()'s package.json, and `pnpm` runs from the root;
// the check runs there too, so it tests what `pnpm lint` sees wherever it is started from.
process.chdir(REPO)

const require = createRequire(import.meta.url)
const stylelint = (await import('stylelint')).default
const { ESLint } = await import('eslint')
const { MODULES, bundle } = await import(join(REPO, 'packages/library/src/modules.ts'))
const webFeatures = require('web-features/data.json')
const WEB_FEATURES = JSON.parse(readFileSync(join(dirname(require.resolve('web-features/data.json')), 'package.json'), 'utf8')).version
const BASELINE = JSON.parse(readFileSync(join(REPO, 'packages/library/baseline.json'), 'utf8'))
const PIN = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'))['browserslist-config-baseline']?.widelyAvailableOnDate

let failed = 0
const check = async (label, fn) => {
  try {
    const note = await fn()
    console.log(`  ok  ${label}${note ? `\n       ${note}` : ''}`)
  } catch (e) {
    failed++
    console.log(`  FAIL ${label}\n       ${String(e.message).split('\n').join('\n       ')}`)
  }
}
const fail = (msg) => {
  throw new Error(msg)
}
// Every row below that reads a date needs the pin; without it each says so in one line instead of a list.
const needPin = () => {
  if (PIN === undefined) fail('the root package.json carries no browserslist-config-baseline.widelyAvailableOnDate: there is no pin')
}

// ── dates ──────────────────────────────────────────────────────────────────────────────────────────────────
const clean = (d) => (d ?? '').replace('≤', '')
/** `YYYY-MM-DD` + n months, the day clamped to the month's length (web-features' Widely rule). */
function addMonths(date, n) {
  const [y, m, d] = date.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  const last = new Date(Date.UTC(Math.floor(total / 12), (total % 12) + 1, 0)).getUTCDate()
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`
}
const widelyOnPin = (status) => {
  const low = clean(status?.baseline_low_date)
  return low !== '' && addMonths(low, 30) <= PIN
}

// ── the floor ──────────────────────────────────────────────────────────────────────────────────────────────
const BROWSERSLIST_NAMES = { and_chr: 'chrome_android', and_ff: 'firefox_android', ios_saf: 'safari_ios' }
const ver = (v) => String(v).split('.').map(Number)
const lower = (a, b) => {
  const [x, y] = [ver(a), ver(b)]
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) < (y[i] ?? 0)
  return false
}

/** Way 1 — what the tools see: browserslist (the copy eslint-plugin-compat loads) for a module file, which
 *  reaches `packages/library/package.json`'s `extends browserslist-config-baseline`. `mobileToDesktop` lets
 *  Chrome and Firefox for Android resolve to their floor rather than caniuse's single latest row. */
function floorFromBrowserslist() {
  const compatRequire = createRequire(require.resolve('eslint-plugin-compat'))
  const browserslist = compatRequire('browserslist')
  const out = {}
  for (const entry of browserslist(undefined, { path: join(REPO, 'packages/library/modules/core.js'), mobileToDesktop: true })) {
    const [name, range] = entry.split(' ')
    const key = BROWSERSLIST_NAMES[name] ?? name
    const v = range.split('-')[0]
    if (out[key] === undefined || lower(v, out[key])) out[key] = v
  }
  return out
}

/** Way 2 — research §A3's method: for every feature Widely on the pin, the highest version each browser
 *  needed; the floor is that maximum. */
function floorFromWebFeatures() {
  const cut = addMonths(PIN, -30)
  const out = {}
  for (const f of Object.values(webFeatures.features)) {
    const low = clean(f.status?.baseline_low_date)
    if (!low || low > cut) continue
    for (const [browser, v] of Object.entries(f.status.support ?? {})) {
      const c = clean(String(v))
      if (out[browser] === undefined || lower(out[browser], c)) out[browser] = c
    }
  }
  return out
}

// ── Tier 2 ─────────────────────────────────────────────────────────────────────────────────────────────────
/** Every refusal for `baseline.json`'s tier2, as sentences; notes for the rows that print. */
function tier2Findings(tier2) {
  const refusals = []
  const notes = []
  for (const e of tier2) {
    const f = webFeatures.features[e.feature]
    if (f === undefined || f.kind !== 'feature') {
      refusals.push(`${e.feature}: not a web-features ${WEB_FEATURES} feature id`)
      continue
    }
    const low = clean(f.status?.baseline_low_date)
    const onPin = low !== '' && low <= PIN
    if (e.notBaseline !== undefined) {
      if (e.feature !== 'text-wrap-pretty') {
        refusals.push(`${e.feature}: carries notBaseline, and R-105 keeps text-wrap-pretty alone — a second feature that is not Baseline needs its own ruling`)
        continue
      }
      if (onPin) {
        refusals.push(`${e.feature}: Baseline now (low date ${low}): give it its date, ${addMonths(low, 30)}, and remove notBaseline`)
      } else if (e.widely !== undefined) {
        refusals.push(`${e.feature}: not Baseline on the pin, so it carries no widely date (${e.widely})`)
      } else {
        notes.push(`${e.feature}: not Baseline on the pin, kept by R-105`)
      }
      continue
    }
    if (!onPin) {
      refusals.push(`${e.feature}: not Baseline on the pin — Tier 2 is Newly features, and R-105's one exception is text-wrap-pretty`)
      continue
    }
    const widely = addMonths(low, 30)
    if (widely <= PIN) refusals.push(`${e.feature}: Widely on the pin (${widely}): Tier 1, remove it`)
    else if (e.widely !== widely) refusals.push(`${e.feature}: baseline.json says widely ${e.widely ?? '(none)'}, web-features ${WEB_FEATURES} says ${widely}`)
  }
  return { refusals, notes }
}

const tier2Rows = (tier2) => {
  const props = {}
  for (const { css } of tier2.filter((e) => e.css?.property)) {
    props[css.property] = props[css.property] === null || !css.values ? null : [...(props[css.property] ?? []), ...css.values]
  }
  return (prop, value) => prop in props && (props[prop] === null || value === undefined || props[prop].includes(value))
}

// ── stylelint ──────────────────────────────────────────────────────────────────────────────────────────────
const PROBE = join(REPO, 'packages/library/fixtures/baseline-probe.css') // never written: a filename for config lookup
const lint = async (code) => (await stylelint.lint({ code, codeFilename: PROBE })).results[0].warnings

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

console.log(`\nStory 4.8 — the Baseline floor (pin ${PIN ?? 'MISSING'}, web-features ${WEB_FEATURES})\n`)
console.log('controls')

await check('the pin reaches the lint: new ImageCapture() in packages/library/modules/probe.js is refused at Safari 17.2', async () => {
  const [r] = await new ESLint({ cwd: REPO }).lintText('function probe() {\n  return new ImageCapture()\n}\n', {
    filePath: join(REPO, 'packages/library/modules/probe.js'),
  })
  const hit = r.messages.filter((m) => m.ruleId === 'compat/compat' && /Safari 17\.2/.test(m.message))
  if (hit.length !== 1) fail(`no compat/compat error naming Safari 17.2 (got ${JSON.stringify(r.messages.map((m) => `${m.ruleId}: ${m.message}`))}) — the pin did not reach eslint-plugin-compat`)
  return hit[0].message
})

await check('the one exception: a second entry carrying notBaseline is refused, naming R-105', () => {
  const [first] = BASELINE.tier2.filter((e) => e.notBaseline === undefined)
  const { refusals } = tier2Findings([...BASELINE.tier2.filter((e) => e !== first), { ...first, notBaseline: 'probe' }])
  if (!refusals.some((r) => r.startsWith(`${first.feature}:`) && r.includes('R-105'))) fail(`not refused: ${JSON.stringify(refusals)}`)
})

await check('a Tier-2 date altered is refused, naming the entry and both dates', () => {
  needPin()
  const [first] = BASELINE.tier2.filter((e) => e.widely !== undefined && e.notBaseline === undefined)
  const { refusals } = tier2Findings([{ ...first, widely: '2099-01-01' }])
  if (!refusals.some((r) => r.includes(first.feature) && r.includes('2099-01-01') && r.includes(first.widely))) fail(`not refused: ${JSON.stringify(refusals)}`)
})

let sizeFile
const sizeLimit = (limit) => {
  let out
  try {
    out = execFileSync(join(REPO, 'node_modules/.bin/size-limit'), ['--json', '--limit', limit, sizeFile], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (e) {
    out = e.stdout // size-limit exits 1 over its limit; NFR-2 wants a warning, so the JSON decides
  }
  let parsed
  try {
    parsed = JSON.parse(out)
  } catch {
    fail(`size-limit did not run: ${String(out).slice(0, 400)}`)
  }
  if (!Array.isArray(parsed) || parsed.length !== 1 || typeof parsed[0].size !== 'number') fail(`size-limit printed no one-file result: ${out}`)
  return parsed[0]
}
const tmp = mkdtempSync(join(tmpdir(), 'check-baseline-'))
try {
  // "Maximal" is every registry module that has a source; today that is core alone. Stories 7.5 and 7.33 point
  // size-limit at compiled themes.
  const present = MODULES.map((m) => m.name).filter((n) => existsSync(join(REPO, `packages/library/modules/${n}.js`)))
  const sources = Object.fromEntries(['core', ...present].map((n) => [n, readFileSync(join(REPO, `packages/library/modules/${n}.js`), 'utf8')]))
  sizeFile = join(tmp, 'main.js')
  writeFileSync(sizeFile, bundle(present, sources))

  await check('the size control: the same main.js at --limit "1 B" reports passed: false', () => {
    const r = sizeLimit('1 B')
    if (r.passed !== false) fail(`size-limit reported ${JSON.stringify(r)} at 1 B`)
  })

  await check('the plugin against the pin: every identifier-shaped css.properties row, through the repo config', async () => {
    needPin()
    const isTier2 = tier2Rows(BASELINE.tier2)
    const admitted = (prop) => Object.hasOwn(BASELINE.plugin.admitted, prop)
    const rows = new Map()
    for (const f of Object.values(webFeatures.features)) {
      if (f.kind !== 'feature') continue
      for (const [key, s] of Object.entries(f.status?.by_compat_key ?? {})) {
        const m = /^css\.properties\.([a-z][a-z-]*)(?:\.([a-z][a-z-]*))?$/.exec(key)
        if (m) rows.set(key, { prop: m[1], value: m[2], widely: widelyOnPin(s) })
      }
    }
    const keys = [...rows.keys()]
    const code = keys.map((k, i) => `.p${i} { ${rows.get(k).prop}: ${rows.get(k).value ?? 'inherit'}; }`).join('\n')
    const refused = new Set((await lint(code)).map((w) => keys[w.line - 1]))
    const wider = []
    const narrower = []
    for (const k of keys) {
      const { prop, value, widely } = rows.get(k)
      const allowed = widely || isTier2(prop, value) || (value !== undefined && admitted(prop))
      if (!allowed && !refused.has(k)) wider.push(k)
      if (allowed && refused.has(k)) narrower.push(k)
    }
    if (wider.length + narrower.length > 0) {
      fail(`wider than the pin (passed, not Widely, not named): ${wider.join(', ') || 'none'}\nnarrower than the pin (refused, Widely, Tier 2 or admitted): ${narrower.join(', ') || 'none'}`)
    }
    return `${keys.length} rows: 0 wider, 0 narrower (refused by name: ${BASELINE.plugin.refused.join(', ')}; admitted: ${Object.keys(BASELINE.plugin.admitted).join(', ')} values)`
  })

  console.log('\nthe floor')

  await check('browserslist for packages/library/modules/core.js and §A3 over web-features agree', () => {
    const a = floorFromBrowserslist()
    const said = (f) => Object.keys(f).sort().map((n) => `${n} ${f[n]}`).join(' · ')
    if (PIN === undefined) fail(`the root package.json carries no browserslist-config-baseline.widelyAvailableOnDate, so browserslist resolves to today's floor: ${said(a)}`)
    const b = floorFromWebFeatures()
    const names = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()
    const off = names.filter((n) => a[n] !== b[n]).map((n) => `${n}: browserslist ${a[n] ?? '(none)'}, web-features ${b[n] ?? '(none)'}`)
    if (off.length > 0) fail(off.join('\n'))
    return said(a)
  })

  await check('no browserslist key at the root or in apps/web, so next build sees none', () => {
    const browserslist = createRequire(require.resolve('eslint-plugin-compat'))('browserslist')
    const leaks = ['.', 'apps/web/app'].filter((p) => browserslist.loadConfig({ path: join(REPO, p) }) !== undefined)
    if (leaks.length > 0) fail(`a browserslist config reaches ${leaks.join(', ')}: it belongs in packages/library/package.json only`)
  })

  console.log('\nTier 2')

  await check('every baseline.json entry is Newly on the pin with its recomputed date, bar R-105', () => {
    needPin()
    const { refusals, notes } = tier2Findings(BASELINE.tier2)
    if (refusals.length > 0) fail(refusals.join('\n'))
    return [...BASELINE.tier2.filter((e) => e.widely).map((e) => `${e.feature} widely ${e.widely}`), ...notes].join('\n       ')
  })

  console.log('\nstylesheets')

  const legal = {
    'Tier 1': ['.a { mask-image: linear-gradient(#000, transparent); }', '.a:has(> img) { color: red; }', '@media (width > 40em) { .a { color: red; } }'],
    'Tier 2': ['.a { text-wrap: balance; }', '.a { text-wrap: pretty; }', '.a { scrollbar-width: thin; }', '@starting-style { .a { opacity: 0; } }'],
    '@supports (A3-16)': [
      '@supports (backdrop-filter: blur(1px)) { .a { background: rgb(0 0 0 / 0.8); backdrop-filter: blur(8px); } }',
      '@supports not (backdrop-filter: blur(1px)) { .a { background: rgb(0 0 0); } }',
    ],
    'the three prefixes': [
      '.a { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }',
      'html { -webkit-text-size-adjust: 100%; }',
      '.a { -webkit-user-select: none; user-select: none; }',
    ],
  }
  for (const [group, sheets] of Object.entries(legal)) {
    await check(`${group} passes`, async () => {
      const bad = []
      for (const s of sheets) for (const w of await lint(s)) bad.push(`${s} — ${w.rule}: ${w.text}`)
      if (bad.length > 0) fail(bad.join('\n'))
    })
  }

  const refusedRows = [
    ['Tier 3', '.a { scrollbar-gutter: stable; }', 'plugin/use-baseline'],
    ['Tier 3', '.a { text-wrap: nowrap; }', 'plugin/use-baseline'],
    ['Tier 3', '.a { animation-timeline: view(); }', 'plugin/use-baseline'],
    ['Tier 3', '.a { mask-mode: alpha; }', 'property-disallowed-list'],
    ['@supports', '@supports (animation-timeline: view()) { .a { color: red; } }', 'inflozo/supports-tier-2'],
    ['@supports', '@supports selector(:popover-open) { .a { color: red; } }', 'inflozo/supports-tier-2'],
    ['nesting', '.a { & .b { color: red; } }', 'max-nesting-depth'],
    ['nesting', '.a { .b { color: red; } }', 'max-nesting-depth'],
    ['nesting', '.a { @media (width > 40em) { color: red; } }', 'max-nesting-depth'],
    ['a prefix', '.a { -webkit-font-smoothing: antialiased; }', 'property-disallowed-list'],
    ['a prefix', '.a { -webkit-mask-image: none; }', 'property-disallowed-list'],
    ['a prefix', '.a::-webkit-scrollbar { display: none; }', 'selector-pseudo-element-disallowed-list'],
    ['a prefix', '@-webkit-keyframes k { to { opacity: 1; } }', 'at-rule-disallowed-list'],
    ['a prefix', '.a { background: -webkit-linear-gradient(red, blue); }', 'function-disallowed-list'],
    ['a prefix', '.a { display: -moz-box; }', 'declaration-property-value-disallowed-list'],
    ['a prefix', 'html { -webkit-text-size-adjust: none; }', 'declaration-property-value-allowed-list'],
    ['a prefix', '.a { display: -webkit-box; }', 'inflozo/prefix-pairs'],
    ['a prefix', '.a { -webkit-user-select: none; }', 'inflozo/prefix-pairs'],
    ['a prefix', '.a { user-select: none; }', 'inflozo/prefix-pairs'],
  ]
  for (const [group, sheet, rule] of refusedRows) {
    await check(`${group} refused by ${rule}: ${sheet}`, async () => {
      const rules = [...new Set((await lint(sheet)).map((w) => w.rule))]
      if (!rules.includes(rule)) fail(`not refused by ${rule} (got ${rules.join(', ') || 'no warning'})`)
      const stray = rules.filter((r) => r.startsWith('inflozo/') && r !== rule)
      if (stray.length > 0) fail(`a custom rule fired outside its own rows: ${stray.join(', ')}`)
    })
  }

  await check("the repository's stylesheets are clean, and Ghost's card CSS is not linted", async () => {
    const { results } = await stylelint.lint({ files: 'packages/**/*.css', cwd: REPO })
    const vendor = results.filter((r) => r.source.includes('/orbit-weekly/vendor/'))
    const ours = results.filter((r) => !r.source.includes('/orbit-weekly/vendor/'))
    if (vendor.length === 0 || vendor.some((r) => !r.ignored)) fail("Ghost's vendored card CSS was linted (or not found): ignoreFiles no longer covers it")
    const dirty = ours.flatMap((r) => r.warnings.map((w) => `${r.source}:${w.line} ${w.rule}`))
    if (dirty.length > 0) fail(dirty.join('\n'))
    return `${ours.length} sheets linted, ${vendor.length} of Ghost's ignored`
  })

  console.log('\nsize')

  await check('size-limit over bundle() of every registry module with a source: NFR-2, 40 kB brotli', () => {
    const r = sizeLimit('40 kB')
    const said = `main.js (core${present.map((n) => ` · ${n}`).join('')}) is ${r.size} B brotli`
    if (r.passed === false) console.log(`  WARNING NFR-2: ${said}, over the 40 kB budget — a warning, not a failure (Story 7.5 owns the gate)`)
    return said
  })
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (failed > 0) {
  console.log(`\ncheck-baseline: FAIL (${failed})`)
  process.exit(1)
}
console.log('\ncheck-baseline: PASS')
