// Story 4.8 — FR-G8's floor, checked by execution on every `pnpm check`: every row of the story's I/O matrix,
// controls first (standing rule: a result whose control did not pass is not a result).
//
// One copy of each thing, and this file restates none of them:
// - the PIN is the root `package.json`'s `browserslist-config-baseline.widelyAvailableOnDate`, the one place
//   `browserslist-config-baseline` reads it (from the WORKING DIRECTORY's package.json — executed), and Widely on it is
//   `stylelint.config.mjs`'s `widelyOnPin`, imported (Story 7.8: the config's `inflozo/tier3-by-name` needs it too);
// - the TIERS are `packages/library/baseline.json`;
// - the STYLESHEET RULES are the root `stylelint.config.mjs`, loaded as stylelint loads it;
// - the FLOOR is printed here and stored nowhere.
//
// What it does:
//  1. the floor two ways — browserslist for a module file, and research §A3's method over web-features — and
//     every browser that disagrees is named;
//  2. the pin reaches eslint-plugin-compat (`new ImageCapture()` refused at the floor's Safari — it ships in 17.4,
//     which an unpinned floor passes);
//  3. every Tier-2 date recomputed as `baseline_low_date` + 30 months, and R-105's one exception held alone;
//  4. the stylelint config diffed against the pin, key by key, with one probe form per family — `css.properties`,
//     and since Story 7.8 (DW-139) `css.types`, `css.at-rules` and `css.selectors` — each family's ceiling named, behind
//     DW-139's four witnesses refused by `inflozo/tier3-by-name`;
//  5. the matrix's stylesheet rows and the repository's own sheets through the real config;
//  6. `size-limit` at NFR-2's budget — 40,960 bytes, gzip level 9 (DW-140) — as a WARNING, never a failure, over two
//     things (Story 7.5): NFR-2's maximal design, `bundle()` of every module with a file plus `cardsJs` of every vendored
//     Ghost chunk, and the compiled pilot theme's `assets/js/`; with a 1 B control, each size held equal to the sum of
//     zlib's own level-9 gzip of its files, and NFR-2's sentence held to naming what is checked. Nothing in apps/ reads it;
//  7. Story 7.8 (DW-137) — the markup against the pin: every element and attribute of every design's `index.html` and of
//     the compiled pilot theme's templates, mustaches masked, mapped to its web-features key; below Widely is refused
//     unless a Tier-2 entry names that key, on its element (a planted `popover` and a `<link fetchpriority>` the controls);
//  8. Story 7.8 — the emitted CSS: the compiled pilot theme's `screen.css`, each template `<style>` and `cards.css` when it
//     has one, through the root config with no warning (a planted `@container style()` the control).
//
//     node tools/check-baseline.mjs          (Node 24: it imports packages/library/src/modules.ts)

import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { existsSync, globSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
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
const { MODULES, bundle, cardsJs } = await import(join(REPO, 'packages/library/src/modules.ts'))
const webFeatures = require('web-features/data.json')
const WEB_FEATURES = JSON.parse(readFileSync(join(dirname(require.resolve('web-features/data.json')), 'package.json'), 'utf8')).version
const BASELINE = JSON.parse(readFileSync(join(REPO, 'packages/library/baseline.json'), 'utf8'))
const { PIN, clean, addMonths, widelyOnPin, tier2Keys, isTier2Key, functionName, atRuleForm } = await import(join(REPO, 'stylelint.config.mjs'))
// Two preconditions every row below rests on (review of 4.8): a pin that is not a date makes every date compare
// silently wrong, and a BROWSERSLIST / BROWSERSLIST_CONFIG variable overrides every config file, so nothing below
// would be testing the pin.
if (PIN !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(PIN))) {
  console.log(`check-baseline: the root package.json pin ${JSON.stringify(PIN)} is not YYYY-MM-DD`)
  process.exit(1)
}
for (const v of ['BROWSERSLIST', 'BROWSERSLIST_CONFIG']) {
  if (process.env[v]) {
    console.log(`check-baseline: ${v} is set, and it overrides every browserslist config — unset it, nothing below would test the pin`)
    process.exit(1)
  }
}

let failed = 0
const check = async (label, fn) => {
  try {
    const note = await fn()
    console.log(`  ok  ${label}${note ? `\n       ${note}` : ''}`)
  } catch (e) {
    failed++
    console.log(`  FAIL ${label}\n       ${String(e instanceof Error ? e.message : e).split('\n').join('\n       ')}`)
  }
}
const fail = (msg) => {
  throw new Error(msg)
}
// Every row below that reads a date needs the pin; without it each says so in one line instead of a list.
const needPin = () => {
  if (PIN === undefined) fail('the root package.json carries no browserslist-config-baseline.widelyAvailableOnDate: there is no pin')
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
  const out = {}
  for (const f of Object.values(webFeatures.features)) {
    if (!widelyOnPin(f.status)) continue // the one definition of Widely: day-clamped months, as web-features counts them
    for (const [browser, v] of Object.entries(f.status.support ?? {})) {
      const c = clean(String(v))
      if (out[browser] === undefined || lower(out[browser], c)) out[browser] = c
    }
  }
  return out
}

// ── Tier 2 ─────────────────────────────────────────────────────────────────────────────────────────────────
/** Every refusal for `baseline.json`'s tier2, as sentences; notes for the rows that print. */
function tier2Findings(tier2, features = webFeatures.features) {
  const refusals = []
  const notes = []
  for (const e of tier2) {
    const f = features[e.feature]
    if (f === undefined || f.kind !== 'feature') {
      refusals.push(`${e.feature}: not a web-features ${WEB_FEATURES} feature id`)
      continue
    }
    // The two halves of an entry are one thing: what its `css` / `html` names must be a compat key of its feature,
    // or a typo'd property would be allowlisted in stylelint while the date check passes for the real feature.
    const shapes = ['css', 'html'].filter((k) => e[k] !== undefined)
    if (shapes.length !== 1) {
      refusals.push(`${e.feature}: an entry names exactly one of css or html (got ${shapes.join(', ') || 'neither'})`)
      continue
    }
    const named = tier2Keys(e)
    const unlinked = named.length === 0 ? ['(nothing named)'] : named.filter((k) => !(f.compat_features ?? []).includes(k))
    if (unlinked.length > 0) {
      refusals.push(`${e.feature}: ${unlinked.join(', ')} is not among its web-features compat keys — the entry's css/html names something else`)
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
/** A row: `sheet` through the repo config is refused by `rule`, and no other custom rule fires. */
const refusedCheck = (group, sheet, rule) =>
  check(`${group} refused by ${rule}: ${sheet}`, async () => {
    const rules = [...new Set((await lint(sheet)).map((w) => w.rule))]
    if (!rules.includes(rule)) fail(`not refused by ${rule} (got ${rules.join(', ') || 'no warning'})`)
    const stray = rules.filter((r) => r.startsWith('inflozo/') && r !== rule)
    if (stray.length > 0) fail(`a custom rule fired outside its own rows: ${stray.join(', ')}`)
  })

// Story 7.6 and 7.8: `inflozo/motion-gated` judges motion and `inflozo/supports-tier-2` what a condition may test, not the
// floor — `animation: infinite` is Widely, and so is `@supports selector()` — so their warnings are no answer about the pin.
const NOT_THE_PIN = new Set(['inflozo/motion-gated', 'inflozo/supports-tier-2'])
/** The config against the pin over one compat-key family: each key `probe` can write is one line of one sheet; refused
 *  while `allowed` (or Widely) is narrower, passed while neither is wider. A key it cannot write is judged by its nearest
 *  written ancestor that was refused (`:scroll-button` refuses `scroll-button.left`); a key below Widely that neither
 *  reaches is the family's ceiling, named in the note. Throws on a difference. */
async function pinDiff(prefix, probe, allowed) {
  needPin()
  const rows = new Map()
  for (const f of Object.values(webFeatures.features)) {
    if (f.kind !== 'feature') continue
    for (const [key, s] of Object.entries(f.status?.by_compat_key ?? {})) if (key.startsWith(prefix)) rows.set(key, { code: probe(key, f), ok: widelyOnPin(s) || allowed(key) })
  }
  const keys = [...rows.keys()].filter((k) => rows.get(k).code !== undefined)
  const refused = new Set((await lint(keys.map((k) => rows.get(k).code).join('\n'))).filter((w) => !NOT_THE_PIN.has(w.rule)).map((w) => keys[w.line - 1]))
  const wider = keys.filter((k) => !rows.get(k).ok && !refused.has(k))
  const narrower = keys.filter((k) => rows.get(k).ok && refused.has(k))
  if (wider.length + narrower.length > 0) {
    fail(`wider than the pin (passed, not Widely, not named): ${wider.join(', ') || 'none'}\nnarrower than the pin (refused, Widely or named): ${narrower.join(', ') || 'none'}`)
  }
  const reached = (k) => k.split('.').some((_, i, p) => i > 2 && refused.has(p.slice(0, i).join('.')))
  const unwritten = [...rows.keys()].filter((k) => rows.get(k).code === undefined)
  const ceiling = unwritten.filter((k) => !rows.get(k).ok && !reached(k))
  return `${keys.length} keys written: 0 wider, 0 narrower; ${unwritten.length} the form cannot write, of which ${ceiling.length} below Widely and under no refused key — the ceiling: ${ceiling.join(', ') || 'none'}`
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

console.log(`\nStory 4.8 — the Baseline floor (pin ${PIN ?? 'MISSING'}, web-features ${WEB_FEATURES})\n`)
console.log('controls')

await check("the pin reaches the lint: new ImageCapture() in packages/library/modules/probe.js is refused at the floor's Safari", async () => {
  const floor = floorFromBrowserslist() // what the lint itself resolves; no version is written here
  const [r] = await new ESLint({ cwd: REPO }).lintText('function probe() {\n  return new ImageCapture()\n}\n', {
    filePath: join(REPO, 'packages/library/modules/probe.js'),
  })
  const got = JSON.stringify(r.messages.map((m) => `${m.ruleId}: ${m.message}`))
  const hit = r.messages.filter((m) => m.ruleId === 'compat/compat' && m.message.includes(`Safari ${floor.safari}`))
  if (hit.length === 0 && !lower(floor.safari, '17.4')) {
    // ImageCapture ships in Safari 17.4: an unpinned browserslist resolves there today, and a pin bumped past it would too.
    fail(`browserslist resolved Safari ${floor.safari}, which has ImageCapture (got ${got}) — either no pin reached eslint-plugin-compat, or the pin moved past Safari 17.4 and this control needs a newer probe API`)
  }
  if (hit.length === 0) fail(`no compat/compat error naming Safari ${floor.safari} (got ${got}) — the pin did not reach eslint-plugin-compat`)
  return hit[0].message
})

// DW-4 (Story 5.24c) — AD-1's `.toString()` ban reaches the Date form only, and no comment in a core package switches a ban
// off. Here because this is the one ESLint harness, and a core package cannot read `process` to run one of its own.
const coreLint = async (code) => (await new ESLint({ cwd: REPO }).lintText(code, { filePath: join(REPO, 'packages/section-runtime/src/probe.ts') }))[0].messages
await check("DW-4: an argument-less .toString() in a core package is refused (a Date's is the reason)", async () => {
  const got = await coreLint('export const when = (d: Date): string => d.toString()\n')
  const hit = got.find((m) => m.ruleId === 'no-restricted-syntax' && m.message.includes('.toString()'))
  if (hit === undefined) fail(`not refused: ${JSON.stringify(got.map((m) => `${m.ruleId}: ${m.message}`))}`)
  return hit.message
})
await check('DW-4: a number\'s radix form, n.toString(16), is clean', async () => {
  const got = await coreLint('export const hex = (n: number): string => n.toString(16)\n')
  if (got.length > 0) fail(`refused: ${JSON.stringify(got.map((m) => `${m.ruleId}: ${m.message}`))}`)
})
await check('DW-4: a disable comment in a core package does not silence .localeCompare()', async () => {
  const got = await coreLint('/* eslint-disable no-restricted-syntax */\nexport const cmp = (a: string, b: string): number => a.localeCompare(b)\n')
  const hit = got.find((m) => m.ruleId === 'no-restricted-syntax' && m.message.includes('localeCompare'))
  if (hit === undefined) fail(`silenced: ${JSON.stringify(got.map((m) => `${m.ruleId}: ${m.message}`))}`)
  return hit.message
})

// Story 7.1 (review) — FR-J1's ban on Handlebars and Prettier in product code was proved by planted files at Dev and by
// nothing since; here, in the one ESLint harness, so an `ignores` reshuffle cannot weaken it silently.
const lintAt = async (code, file) => (await new ESLint({ cwd: REPO }).lintText(code, { filePath: join(REPO, file) }))[0].messages
const banned = (got) => got.find((m) => m.ruleId === 'no-restricted-imports' && m.message.includes('FR-J1'))
// Story 7.8 — the quality gate is CORE (AD-1): `gate/quality.ts` sits under the ban, and only the gscan shell is exempt
await check('Story 7.8: gate/quality.ts is core — a builtin import at its path is refused, and the same line at gate/gscan.ts (the one exempt shell) is not', async () => {
  const builtin = (got) => got.find((m) => m.ruleId === 'no-restricted-imports' && m.message.includes('node:fs'))
  const line = "import { readFileSync } from 'node:fs'\nexport const r = readFileSync\n"
  const hit = builtin(await lintAt(line, 'packages/theme-compiler/gate/quality.ts'))
  if (hit === undefined) fail('a node:fs import at gate/quality.ts was not refused')
  if (builtin(await lintAt(line, 'packages/theme-compiler/gate/gscan.ts')) !== undefined) fail('the control: gscan.ts is NOT_CORE, and the same line was refused there')
  return hit.message
})
await check('Story 7.1: a core package importing handlebars is refused, naming FR-J1', async () => {
  const hit = banned(await lintAt("import Handlebars from 'handlebars'\nexport const p = Handlebars.parse\n", 'packages/theme-compiler/src/probe.ts'))
  if (hit === undefined) fail('not refused')
  return hit.message
})
await check('Story 7.1: the app importing prettier/standalone is refused, naming FR-J1', async () => {
  const hit = banned(await lintAt("import { format } from 'prettier/standalone'\nexport const f = format\n", 'apps/web/lib/probe.ts'))
  if (hit === undefined) fail('not refused')
  return hit.message
})
await check('Story 7.1: a test under packages/ may import handlebars to parse what the compiler emitted, and still not prettier', async () => {
  if (banned(await lintAt("import Handlebars from 'handlebars'\nexport const p = Handlebars.parse\n", 'packages/theme-compiler/src/probe.test.ts')) !== undefined) fail('handlebars refused in a test')
  if (banned(await lintAt("import { format } from 'prettier/standalone'\nexport const f = format\n", 'packages/theme-compiler/src/probe.test.ts')) === undefined) fail('prettier admitted in a test')
})

// Story 7.5 — DW-146's literal half (eslint.config.js's modules block): a module writes no visitor-facing words of its own.
// Each line is planted in a module file's one function, with every name it uses a parameter, so `no-undef` stays quiet.
// Story 7.6: FR-G4's motion rule shares the block's `no-restricted-syntax`, so its messages are kept beside DW-146's.
const moduleLint = async (line) => (await lintAt(`export function probe(el, ctx, win, doc, body, n, value) {\n  const t = ctx.t\n  ${line}\n}\n`, 'packages/library/modules/probe.js'))
  .filter((m) => m.ruleId === 'no-restricted-syntax' && (m.message.startsWith('DW-146') || m.message.startsWith('FR-G4')))
// The planted lines are derived from the rule's own sink lists (review, 2026-10-08), one per entry and one per literal
// shape, so a sink added to the rule is planted here without anyone remembering to.
const { VISITOR_SINKS } = await import(join(REPO, 'eslint.config.js'))
const VISITOR_WORDS = [
  ...VISITOR_SINKS.props.flatMap((p) => [`el.${p} = 'Hello'`, `el['${p}'] = 'Привет'`, `el.${p} = n ? 'Open' : 'Close'`, `el.${p} = value || 'Untitled'`]),
  ...VISITOR_SINKS.attrs.flatMap((a) => [`el.setAttribute('${a}', 'Close')`, `el.setAttribute('${a}', \`Next \${n}\`)`]),
  ...VISITOR_SINKS.calls.flatMap((c) => [`el.${c}('Hi')`, `${c}('Hi')`]),
  ...VISITOR_SINKS.news.flatMap((c) => [`new win.${c}('Pick')`, `new ${c}('Pick')`]),
  'el.title = `Close ${n}`', "el.insertAdjacentText('beforeend', 'More')", "el.insertAdjacentHTML('afterend', '<p>x</p>')",
  'ctx.t(n)', 't(`days`)', "ctx['t'](n)",
]
const NOT_VISITOR_WORDS = [
  "el.textContent = ctx.t('more')", "el.setAttribute('aria-expanded', 'true')", "el.insertAdjacentText('beforeend', ctx.t('more'))",
  'el.textContent = `${n}`', "body.append('email', value)", "el.innerHTML = ''", "el.textContent = n ? ctx.t('open') : ctx.t('close')", "t('days')",
]
await check('Story 7.5 (DW-146): every sink is refused in a module file — a letter-bearing literal written to text or passed to a text-making call, and a t() key that is no string literal', async () => {
  const missed = []
  for (const line of VISITOR_WORDS) if ((await moduleLint(line)).length === 0) missed.push(line)
  if (missed.length > 0) fail(`not refused: ${missed.join(' · ')}`)
  return `${VISITOR_WORDS.length} lines refused`
})
await check('Story 7.5 (DW-146): the clean lines are clean — ctx.t(\'more\') into text, aria-expanded, a number in a template, FormData\'s append, clearing innerHTML', async () => {
  const hit = []
  for (const line of NOT_VISITOR_WORDS) if ((await moduleLint(line)).length > 0) hit.push(line)
  if (hit.length > 0) fail(`refused: ${hit.join(' · ')}`)
  return `${NOT_VISITOR_WORDS.length} lines clean`
})
// Story 7.6 — FR-G4's module half (eslint.config.js, the block after the modules block): no module but core reads the
// reduced-motion preference; a module reads ctx.reducedMotion. Each planted line is refused by its own rule's message.
const MOTION_READS = ["win.matchMedia('(prefers-reduced-motion: reduce)')", 'win.matchMedia(`(prefers-reduced-motion: ${value})`)']
await check('Story 7.6 (FR-G4): a module reading the reduced-motion preference itself is refused — a string and a template literal', async () => {
  const missed = []
  for (const line of MOTION_READS) if (!(await moduleLint(line)).some((m) => m.message.startsWith('FR-G4'))) missed.push(line)
  if (missed.length > 0) fail(`not refused: ${missed.join(' · ')}`)
  return `${MOTION_READS.length} lines refused`
})
await check('Story 7.6 (FR-G4): if (ctx.reducedMotion) return is clean, and so is core.js itself, which holds the one query', async () => {
  const got = await moduleLint('if (ctx.reducedMotion) return')
  if (got.length > 0) fail(`refused: ${JSON.stringify(got.map((m) => m.message))}`)
  const core = readFileSync(join(REPO, 'packages/library/modules/core.js'), 'utf8')
  if (!core.includes('prefers-reduced-motion')) fail('core.js names no reduced-motion query, so its clean lint proves nothing')
  const own = (await lintAt(core, 'packages/library/modules/core.js')).filter((m) => m.message.startsWith('FR-G4'))
  if (own.length > 0) fail(`core.js refused: ${own.map((m) => `${m.line}: ${m.message}`).join(' · ')}`)
  // the control: core's own text, at any other module's path, is refused
  if (!(await lintAt(core, 'packages/library/modules/probe.js')).some((m) => m.message.startsWith('FR-G4'))) fail("core's query at another module's path was not refused")
})
await check('Story 7.6 (FR-G4): a disable comment in a module file does not silence the motion rule', async () => {
  const got = (await lintAt("/* eslint-disable no-restricted-syntax */\nexport function probe(win) {\n  return win.matchMedia('(prefers-reduced-motion: reduce)') // eslint-disable-line\n}\n", 'packages/library/modules/probe.js'))
    .filter((m) => m.ruleId === 'no-restricted-syntax' && m.message.startsWith('FR-G4'))
  if (got.length === 0) fail('silenced')
  return got[0].message
})
await check('Story 7.5 (DW-146): a disable comment in a module file silences nothing', async () => {
  const got = (await lintAt("/* eslint-disable no-restricted-syntax */\nexport function probe(el) {\n  el.textContent = 'Hello' // eslint-disable-line\n}\n", 'packages/library/modules/probe.js'))
    .filter((m) => m.ruleId === 'no-restricted-syntax' && m.message.startsWith('DW-146'))
  if (got.length === 0) fail('silenced')
  return got[0].message
})

await check('the one exception: a second entry carrying notBaseline is refused, naming R-105', () => {
  const [first] = BASELINE.tier2.filter((e) => e.notBaseline === undefined)
  const { refusals } = tier2Findings([...BASELINE.tier2.filter((e) => e !== first), { ...first, notBaseline: 'probe' }])
  if (!refusals.some((r) => r.startsWith(`${first.feature}:`) && r.includes('R-105'))) fail(`not refused: ${JSON.stringify(refusals)}`)
})

await check('an entry whose css names something other than its feature is refused', () => {
  const [first] = BASELINE.tier2.filter((e) => e.css?.property)
  const { refusals } = tier2Findings([{ ...first, css: { property: 'nope' } }])
  if (!refusals.some((r) => r.startsWith(`${first.feature}:`) && r.includes('css.properties.nope'))) fail(`not refused: ${JSON.stringify(refusals)}`)
})

await check('text-wrap-pretty gaining a low date on the pin is refused: "Baseline now: give it its date"', () => {
  needPin()
  const e = BASELINE.tier2.find((x) => x.feature === 'text-wrap-pretty')
  const real = webFeatures.features['text-wrap-pretty']
  const { refusals } = tier2Findings([e], { 'text-wrap-pretty': { ...real, status: { ...real.status, baseline_low_date: '2024-01-01' } } })
  if (!refusals.some((r) => r.includes('Baseline now') && r.includes(addMonths('2024-01-01', 30)))) fail(`not refused: ${JSON.stringify(refusals)}`)
})

await check('a Tier-2 date altered is refused, naming the entry and both dates', () => {
  needPin()
  const [first] = BASELINE.tier2.filter((e) => e.widely !== undefined && e.notBaseline === undefined)
  const { refusals } = tier2Findings([{ ...first, widely: '2099-01-01' }])
  if (!refusals.some((r) => r.includes(first.feature) && r.includes('2099-01-01') && r.includes(first.widely))) fail(`not refused: ${JSON.stringify(refusals)}`)
})

// NFR-2's JS budget, in the one unit that cannot be misread (DW-140): `size-limit`'s own default is brotli, and its
// `kB` is 1,024 bytes, so "40 KB" named neither the base nor the metric. The config file is how `gzip: true` reaches it —
// its CLI takes no metric flag — and `@size-limit/file` gzips at level 9.
const NFR2_BYTES = 40960
const NFR2_WORDS = `${NFR2_BYTES.toLocaleString('en-US')} bytes, gzip level 9`
/** size-limit over one config entry — its files' sizes summed, as `@size-limit/file` does — at `limit`. */
const sizeLimit = (limit, config) => {
  let out
  try {
    out = execFileSync(join(REPO, 'node_modules/.bin/size-limit'), ['--json', '--limit', limit, '--config', config], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (e) {
    out = e.stdout || e.message // size-limit exits 1 over its limit; NFR-2 wants a warning, so the JSON decides
  }
  let parsed
  try {
    parsed = JSON.parse(out)
  } catch {
    fail(`size-limit did not run: ${String(out).slice(0, 400)}`)
  }
  if (!Array.isArray(parsed) || parsed.length !== 1 || typeof parsed[0].size !== 'number') fail(`size-limit printed no one-entry result: ${out}`)
  return parsed[0]
}
const tmp = mkdtempSync(join(tmpdir(), 'check-baseline-'))
try {
  // Story 7.5 — NFR-2's maximal design: every registry module with a file in one main.js, and every vendored Ghost chunk
  // in one cards.js — measured as the two files a theme carries. The second row is what a compiled theme ships: the pilot
  // theme as CI compiles it (tools/pilot-theme.mjs's words and theme), its assets/js/ files. Story 7.33 measures the library.
  const pilots = await import(join(REPO, 'tools/pilot-theme.mjs'))
  const present = MODULES.map((m) => m.name).filter((n) => existsSync(join(REPO, `packages/library/modules/${n}.js`)))
  const sources = pilots.moduleSources()
  const ghost = pilots.ghostCards()
  /** One size-limit config entry over `files` (name → text), written to its own directory; `{ config, files }`. */
  const measured = (dir, files) => {
    const at = join(tmp, dir)
    mkdirSync(at)
    for (const [name, text] of Object.entries(files)) writeFileSync(join(at, name), text)
    const config = join(at, 'size-limit.json')
    writeFileSync(config, JSON.stringify([{ path: Object.keys(files), gzip: true }]))
    return { config, files }
  }
  /** One size row: size-limit's sum held equal to zlib's level-9 gzip of each file, summed. Under the budget the size is
   *  the row's note; past it, `warning` is NFR-2's WARNING line — never a failure. */
  const sizeRow = ({ config, files }, what, limit = `${NFR2_BYTES} B`) => {
    const r = sizeLimit(limit, config)
    const zlib = Object.values(files).reduce((n, text) => n + gzipSync(Buffer.from(text), { level: 9 }).length, 0)
    if (r.size !== zlib) fail(`size-limit measured ${r.size} B and zlib's gzip at level 9, summed over ${Object.keys(files).join(' and ')}, is ${zlib} B — the gate is not measuring NFR-2's metric`)
    const said = `${what} is ${r.size} B gzipped`
    return { said, warning: r.passed === false ? `WARNING NFR-2: ${said}, over the ${limit === `${NFR2_BYTES} B` ? NFR2_WORDS : limit} budget — a warning, not a failure (no customer can act on it)` : null }
  }
  /** A row's note: its size, with its WARNING line printed above when it is over. */
  const shownSize = ({ said, warning }) => {
    if (warning !== null) console.log(`  ${warning}`)
    return said
  }
  const maximal = measured('maximal', { 'main.js': bundle(present, sources), 'cards.js': cardsJs(Object.keys(ghost.scripts), ghost.scripts) })
  const compiled = pilots.compilePilots(pilots.CI_WORDS, { theme: pilots.PILOT_THEME }).files
  const theme = measured('theme', Object.fromEntries(Object.entries(compiled).filter(([p]) => p.startsWith('assets/js/')).map(([p, b]) => [p.slice('assets/js/'.length), b])))

  await check('the size control: the maximal design at --limit "1 B" reports passed: false, and the row prints its WARNING line rather than fail', () => {
    const r = sizeLimit('1 B', maximal.config)
    if (r.passed !== false) fail(`size-limit reported ${JSON.stringify(r)} at 1 B`)
    const { warning } = sizeRow(maximal, 'the maximal design', '1 B')
    if (warning === null || !warning.startsWith('WARNING NFR-2: ') || !warning.endsWith('— a warning, not a failure (no customer can act on it)')) fail(`no WARNING NFR-2 line at 1 B: ${warning}`)
    return warning
  })

  // Story 7.8 (DW-139) — the four witnesses DW-139 recorded passing the config (executed again before the rule: no
  // warning), then a descriptor and an @import condition: each refused by the rule the three new diffs below rest on.
  for (const sheet of [
    '@container style(--x: 1) {}',
    '.a { color: if(style(--x: 1): red; else: blue); }',
    '.a { order: sibling-index(); }',
    '.a { width: calc(random(1px, 10px)); }',
    '@font-face { font-family: x; src: url(x.woff2); ascent-override: 90%; }',
    '@import url(x.css) supports(display: grid);',
  ]) {
    await refusedCheck('Tier 3 by name (DW-139)', sheet, 'inflozo/tier3-by-name')
  }

  const PROPERTY = /^css\.properties\.([a-z][a-z-]*)(?:\.([a-z][a-z-]*))?$/
  await check('the config against the pin: every identifier-shaped css.properties key, as prop: value (or inherit)', async () => {
    const isTier2 = tier2Rows(BASELINE.tier2)
    const admitted = (prop) => Object.hasOwn(BASELINE.plugin.admitted, prop)
    const said = await pinDiff(
      'css.properties.',
      (key) => {
        const [, prop, value] = PROPERTY.exec(key) ?? []
        return prop && `.p { ${prop}: ${value ?? 'inherit'}; }`
      },
      (key) => {
        const [, prop, value] = PROPERTY.exec(key) ?? []
        return prop !== undefined && (isTier2(prop, value) || (value !== undefined && admitted(prop)))
      },
    )
    return `${said}\n       refused by name: ${BASELINE.plugin.refused.join(', ')}; admitted: ${Object.keys(BASELINE.plugin.admitted).join(', ')} values`
  })
  // Story 7.8 (DW-139): one probe form per family, each written by the config's own reading of a key
  await check('the config against the pin: every css.types key whose feature writes it name(), as --t: name()', () =>
    pinDiff(
      'css.types.',
      (key, f) => {
        const name = functionName(key, f)
        return name && `.t { --t: ${name}(); }`
      },
      isTier2Key,
    ))
  await check('the config against the pin: every css.at-rules key, as @at-rule (name[: value]) {}', () =>
    pinDiff(
      'css.at-rules.',
      (key) => {
        const atRule = /^css\.at-rules\.([a-z][a-z-]*)$/.exec(key)?.[1]
        const form = atRuleForm(key)
        return atRule ? `@${atRule} {}` : form && `@${form.atRule} (${form.name}${form.value ? `: ${form.value}` : ''}) {}`
      },
      isTier2Key,
    ))
  await check('the config against the pin: every identifier-shaped css.selectors key, as :name {}', () =>
    pinDiff(
      'css.selectors.',
      (key) => {
        const name = /^css\.selectors\.([a-z][a-z-]*)$/.exec(key)?.[1]
        return name && `:${name} {}`
      },
      isTier2Key,
    ))

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
    'Tier 1': [
      '.a { mask-image: linear-gradient(#000, transparent); }',
      '.a:has(> img) { color: red; }',
      '@media (width > 40em) { .a { color: red; } }',
      // docs/section-authoring.md names these three as Tier 1 too; a name in the docs is executed here or it is a guess
      '.a { container-type: inline-size; }',
      '.a { color: color-mix(in srgb, red, blue); }',
      '.a { grid-template-columns: subgrid; }',
    ],
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
    // `-apple-system` is a font-family keyword, not a vendor prefix: the export's stack (`'Inter',-apple-system,sans-serif`)
    // uses it in every frame, and the prefix closure must keep passing it.
    'a font keyword, not a prefix': ["html { font-family: 'Inter', -apple-system, sans-serif; }"],
    // Story 7.6 (FR-G4, inflozo/motion-gated): a never-ending animation behind the no-preference query, alone or with a
    // width, and a finite one anywhere
    'motion, gated or finite': [
      '@media (prefers-reduced-motion: no-preference) { .a { animation: spin 1s linear infinite; } }',
      '@media (prefers-reduced-motion: no-preference) { .a { animation-iteration-count: infinite; } }',
      '@media (prefers-reduced-motion: no-preference) and (width >= 50rem) { .a { animation: spin 1s linear infinite; } }',
      '@media (prefers-reduced-motion: no-preference) and (width >= 50rem) { .a { animation-iteration-count: infinite; } }',
      '.a { animation: fade 300ms 1; }',
    ],
    // Story 7.8 (DW-139, inflozo/tier3-by-name): a name Widely under another key, a feature's Widely value beside its
    // Tier-3 ones, a word in a string or a url(), and a Widely descriptor
    'Widely, named like Tier 3': [
      '.a { clip-path: rect(0 0 1px 1px); }',
      '@media (display-mode: browser) { .a { color: red; } }',
      '@import url(supports.css);',
      "@font-face { font-family: x; src: url(x.woff2); font-display: swap; }",
      ".a { content: 'if('; }",
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
    ['Tier 3', '.a { anchor-name: --x; }', 'plugin/use-baseline'],
    ['Tier 3', '.a { field-sizing: content; }', 'plugin/use-baseline'],
    ['@supports', '@supports (animation-timeline: view()) { .a { color: red; } }', 'inflozo/supports-tier-2'],
    ['@supports', '@supports selector(:popover-open) { .a { color: red; } }', 'inflozo/supports-tier-2'],
    // a Tier-2 property that lists values admits only those values: Tier 3 cannot hide behind a Tier-2 property
    ['@supports', '@supports (text-wrap: nowrap) { .a { text-wrap: nowrap; } }', 'inflozo/supports-tier-2'],
    ['@supports', '@supports (text-wrap: balance2) { .a { color: red; } }', 'inflozo/supports-tier-2'],
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
    // Story 7.6 (FR-G4): an animation that repeats for ever, outside the no-preference query
    ['motion', '.a { animation: spin 1s linear infinite; }', 'inflozo/motion-gated'],
    ['motion', '.a { animation-iteration-count: infinite; }', 'inflozo/motion-gated'],
    // Story 7.6's review: a query that only looks like the gate — negated, or a list another query lets through
    ['motion', '@media not (prefers-reduced-motion: no-preference) { .a { animation: spin 1s linear infinite; } }', 'inflozo/motion-gated'],
    ['motion', '@media (prefers-reduced-motion: no-preference), (width >= 50rem) { .a { animation: spin 1s linear infinite; } }', 'inflozo/motion-gated'],
    ['motion', '@media (prefers-reduced-motion: no-preference) or (width >= 50rem) { .a { animation-iteration-count: infinite; } }', 'inflozo/motion-gated'],
  ]
  for (const [group, sheet, rule] of refusedRows) await refusedCheck(group, sheet, rule)

  await check("the repository's stylesheets are clean, and Ghost's card CSS is not linted", async () => {
    const { results } = await stylelint.lint({ files: 'packages/**/*.css', cwd: REPO })
    const vendor = results.filter((r) => r.source.includes('/orbit-weekly/vendor/'))
    const ours = results.filter((r) => !r.source.includes('/orbit-weekly/vendor/'))
    if (vendor.length === 0 || vendor.some((r) => !r.ignored)) fail("Ghost's vendored card CSS was linted (or not found): ignoreFiles no longer covers it")
    const dirty = ours.flatMap((r) => r.warnings.map((w) => `${r.source}:${w.line} ${w.rule}`))
    if (dirty.length > 0) fail(dirty.join('\n'))
    return `${ours.length} sheets linted, ${vendor.length} of Ghost's ignored`
  })

  // ── Story 7.8 (DW-137): the markup against the pin ──────────────────────────────────────────────────────────
  // A compiled theme draws its elements and attributes only from the designs and the compiler's own lines, so both are read
  // here, on every library release, rather than at deploy (spec 7.8, "Why the floors are checked in CI").
  console.log('\nmarkup (DW-137)')

  // parse5 is the gate's own parser, declared by packages/theme-compiler; it is ESM, so it is resolved there and imported
  const { parse } = await import(createRequire(join(REPO, 'packages/theme-compiler/package.json')).resolve('parse5'))
  const MARKUP_KEYS = new Map() // every html.* and svg.* element or attribute key → Widely on the pin
  for (const f of Object.values(webFeatures.features)) {
    if (f.kind !== 'feature') continue
    for (const [key, s] of Object.entries(f.status?.by_compat_key ?? {})) if (/^(html|svg)\.(elements|global_attributes)\./.test(key)) MARKUP_KEYS.set(key, widelyOnPin(s))
  }
  const NS = { 'http://www.w3.org/1999/xhtml': 'html', 'http://www.w3.org/2000/svg': 'svg' }
  /** Every element and attribute in `text` with its key, undefined where web-features maps none. A mustache reads `x`, so one
   *  inside a start tag (`href="{{asset "x"}}"`, `{{#if}}checked{{/if}}`) never breaks the attributes around it.
   *  ponytail: an attribute's VALUE is not judged (`rel="dns-prefetch"`, `html.elements.link.rel.dns-prefetch`) — the ceiling
   *  beside the keys web-features does not map; a value check is the next step if a design reaches for one. */
  const markup = (text) => {
    const out = []
    const walk = (node) => {
      const ns = NS[node.namespaceURI]
      if (ns !== undefined && node.tagName !== undefined) {
        const el = `${ns}.elements.${node.tagName}`
        out.push({ name: `<${node.tagName}>`, key: MARKUP_KEYS.has(el) ? el : undefined })
        for (const { name } of node.attrs) out.push({ name, key: [`${el}.${name}`, `${ns}.global_attributes.${name}`].find((k) => MARKUP_KEYS.has(k)) })
      }
      for (const child of node.childNodes ?? []) walk(child)
      if (node.content !== undefined) walk(node.content) // a <template>'s
    }
    walk(parse(text.replace(/\{\{!--[\s\S]*?--\}\}|\{\{\{?[\s\S]*?\}?\}\}/g, 'x')))
    return out
  }
  /** `sources` (where → text) against the pin: each key below Widely that no Tier-2 entry names is refused; a named key is
   *  that element's attribute, so on any other element it is another key and refused. */
  const judgeMarkup = (sources) => {
    const refused = []
    const tier2 = new Map() // key → where
    const unmapped = new Set()
    for (const [where, text] of Object.entries(sources)) {
      for (const { name, key } of markup(text)) {
        if (key === undefined) unmapped.add(name)
        else if (MARKUP_KEYS.get(key)) continue
        else if (isTier2Key(key)) tier2.set(key, [...new Set([...(tier2.get(key) ?? []), where])])
        else refused.push(`${where}: ${key}`)
      }
    }
    return { refused, tier2, unmapped }
  }
  const designs = Object.fromEntries(globSync('packages/library/designs/*/*/index.html', { cwd: REPO }).sort().map((p) => [p, readFileSync(join(REPO, p), 'utf8')]))
  const templates = Object.fromEntries(Object.entries(compiled).filter(([p, b]) => p.endsWith('.hbs') && typeof b === 'string'))

  await check('the markup control: a popover attribute planted in a design is refused as html.global_attributes.popover', () => {
    const [where] = Object.keys(designs)
    if (where === undefined) fail('no design index.html was found, so the markup row reads nothing')
    const { refused } = judgeMarkup({ [where]: designs[where].replace(/<([a-z][\w-]*)/i, '<$1 popover') })
    const hit = refused.find((r) => r === `${where}: html.global_attributes.popover`)
    if (hit === undefined) fail(`not refused: ${JSON.stringify(refused)}`)
    return hit
  })
  await check("the markup control: a Tier-2 attribute passes on its entry's element and is refused on another, planted in default.hbs", () => {
    // the first html entry whose attribute some other element carries below Widely, read off baseline.json and web-features
    const pair = BASELINE.tier2
      .filter((e) => e.html)
      .map(({ html: { element, attribute } }) => {
        const own = `html.elements.${element}.${attribute}`
        const other = [...MARKUP_KEYS].find(([k, widely]) => !widely && k !== own && /^html\.elements\.[^.]+\.[^.]+$/.test(k) && k.endsWith(`.${attribute}`))?.[0]
        return other && { own, other, attribute, element, wrong: other.split('.')[2] }
      })
      .find(Boolean)
    if (pair === undefined) fail('no Tier-2 html attribute is carried below Widely by another element: this control needs a new probe')
    const planted = `${templates['default.hbs']}<${pair.element} ${pair.attribute}="x"></${pair.element}><${pair.wrong} ${pair.attribute}="x"></${pair.wrong}>`
    const { refused, tier2 } = judgeMarkup({ 'default.hbs': planted })
    if (!tier2.has(pair.own)) fail(`${pair.own} was not read as Tier 2 on <${pair.element}> (refused: ${JSON.stringify(refused)})`)
    if (!refused.includes(`default.hbs: ${pair.other}`)) fail(`${pair.other} was not refused on <${pair.wrong}> (refused: ${JSON.stringify(refused)})`)
    return `${pair.own} passes as Tier 2; ${pair.other} is refused`
  })
  await check("every design's index.html and the compiled pilot theme's templates are Widely on the pin, bar a named Tier-2 key on its element", () => {
    const { refused, tier2, unmapped } = judgeMarkup({ ...designs, ...templates })
    if (refused.length > 0) fail(refused.join('\n'))
    const seen = [...tier2].map(([k, where]) => `${k} in ${where.join(', ')}`).join('; ') || 'none'
    const data = [...unmapped].filter((n) => n.startsWith('data-'))
    const named = [...unmapped].filter((n) => !n.startsWith('data-')).sort()
    return `${Object.keys(designs).length} designs, ${Object.keys(templates).length} templates; Tier 2 seen: ${seen}\n       not judged, no web-features key (the ceiling): ${unmapped.size} names — ${data.length} data-* and ${named.join(' ')}`
  })

  // ── Story 7.8: the emitted CSS ──────────────────────────────────────────────────────────────────────────────
  console.log('\nthe emitted CSS')

  /** The compiled theme's stylesheets as a browser reads them: screen.css, cards.css when the theme has one, and every
   *  template `<style>` body with `{{asset "…"}}` read as `/assets/…`. */
  const emitted = (files) => {
    const out = {}
    for (const p of ['assets/css/screen.css', 'assets/css/cards.css']) if (typeof files[p] === 'string') out[p] = files[p]
    for (const [p, text] of Object.entries(files)) {
      if (!p.endsWith('.hbs') || typeof text !== 'string') continue
      for (const [i, [, body]] of [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].entries()) out[`${p} <style> ${i + 1}`] = body.replace(/\{\{\s*asset\s+"([^"]+)"\s*\}\}/g, '/assets/$1')
    }
    return out
  }
  /** Every warning the root config gives `sheets`, as `where:line rule`. */
  const lintSheets = async (sheets) => (await Promise.all(Object.entries(sheets).map(async ([where, code]) => (await lint(code)).map((w) => `${where}:${w.line} ${w.rule}: ${w.text}`)))).flat()

  await check('the emitted-CSS control: @container style(--x: 1) {} planted in screen.css is refused by inflozo/tier3-by-name', async () => {
    if (typeof compiled['assets/css/screen.css'] !== 'string') fail('the compiled pilot theme carries no assets/css/screen.css, so the emitted-CSS row reads nothing')
    const got = await lint(`${compiled['assets/css/screen.css']}\n@container style(--x: 1) {}\n`)
    const hit = got.find((w) => w.rule === 'inflozo/tier3-by-name')
    if (hit === undefined) fail(`not refused: ${JSON.stringify(got.map((w) => w.rule))}`)
    return hit.text
  })
  await check("the compiled pilot theme's emitted CSS gives no warning through the root config", async () => {
    const sheets = emitted(compiled)
    const dirty = await lintSheets(sheets)
    if (dirty.length > 0) fail(dirty.join('\n'))
    return `${Object.keys(sheets).join(' · ')}: no warning`
  })

  console.log('\nsize')

  await check(`NFR-2 names what this checks: "${NFR2_WORDS}"`, () => {
    const prd = readFileSync(join(REPO, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md'), 'utf8')
    const a = prd.indexOf('**NFR-2 '), b = prd.indexOf('**NFR-3 ')
    if (a < 0 || b < a) return fail(`prd.md no longer carries "**NFR-2 " followed by "**NFR-3 " — the sentence check cannot find NFR-2`)
    const nfr2 = prd.slice(a, b)
    if (!nfr2.includes(`< 40 KB gzipped (${NFR2_WORDS})`)) fail(`prd.md NFR-2 does not say "< 40 KB gzipped (${NFR2_WORDS})", which is what size-limit is run at here`)
  })

  await check(`size-limit over NFR-2's maximal design — bundle() of every module with a file, and cardsJs() of every vendored Ghost chunk: ${NFR2_WORDS}`, () =>
    shownSize(sizeRow(maximal, `main.js (core${present.map((n) => ` · ${n}`).join('')}) with cards.js (${Object.keys(ghost.scripts).join(' · ')})`)))
  await check(`size-limit over the compiled pilot theme's assets/js/: ${NFR2_WORDS}`, () => {
    if (!('main.js' in theme.files)) fail('the compiled pilot theme carries no assets/js/main.js, so this row measures nothing')
    return shownSize(sizeRow(theme, `the pilot theme's ${Object.keys(theme.files).join(' and ')}`))
  })
  /** The tracked files under `dir` that name the size check; `git grep` exits 1 when it finds none. */
  const readers = (dir) => {
    try {
      return execFileSync('git', ['grep', '-l', '-E', 'size-limit|check-baseline|NFR2_BYTES', '--', dir], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n')
    } catch (e) {
      if (e.status === 1) return []
      throw e
    }
  }
  await check('no file in apps/ reads the size check: a warning for CI, never a sentence a customer meets (the control: the same search finds tools/check-baseline.mjs)', () => {
    if (!readers('tools/').includes('tools/check-baseline.mjs')) fail('the search finds no reader in tools/ either, so its silence in apps/ proves nothing')
    const hits = readers('apps/')
    if (hits.length > 0) fail(`read in ${hits.join(', ')}`)
  })
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (failed > 0) {
  console.log(`\ncheck-baseline: FAIL (${failed})`)
  process.exit(1)
}
console.log('\ncheck-baseline: PASS')
