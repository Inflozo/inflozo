#!/usr/bin/env node
// DW-269 (Story 5.24d) — THE DEPLOYED FUNCTIONS CARRY THE FILES THE CANVAS READS, read off the build, never assumed.
//
//   pnpm build && node tools/check-traces.mjs
//
// The app reads designs, pictures and stylesheets off disk at run time, and Vercel ships a function with only the files
// its build TRACED. `outputFileTracingIncludes` never did anything under Turbopack (Next 16.3.1 applies it to a webpack
// trace map alone), so the files arrive because `apps/web/lib/style-guide.ts` finds `packages/` through
// `process.cwd()` — the one form Turbopack traces — and every reader imports that finder. On 2026-09-26 a change to
// that one line published an app where no editor would open. This reads each route's own `.nft.json` (the list Vercel
// copies, each entry relative to its own file) and exits 1 naming the route and the files it lacks.
//
// WHAT EACH ROUTE MUST CARRY is read from git, never listed (standing rule 4): every tracked file under the directories
// the canvas document and the editor read. The canvas route, `/pilots` and both editor pages draw the canvas and carry the
// whole set, `/canvas` with the font pool's files it serves (Story 6.2); `/controls` and its frame read the designs and
// the controls fixtures; the style-guide's three routes read
// Orbit Weekly's pictures and vendored cards and the reference tokens (Story 5.24d's review: their text test went with
// the inert lists, and nothing had replaced it).
//
// CI runs it straight after `check`'s `pnpm build` (`.github/workflows/ci.yml`); `deploy`'s `vercel build` only ever adds
// files, so a trace this passes is the least the deployment ships.
//
// DW-323 (Story 6.3) — AND NO CLIENT CHUNK CARRIES THE FONT POOL'S RECORD. Until 6.3 the runtime's own index imported the
// presets (for Paper) and the pool (for `fontFaceCss`), so `pool.json` — every file's sha256 and every family's licence —
// rode as a 43 KB literal in the client script of every page that drew a canvas or a pack cell. Clients are now handed each
// preset's CSS as server-derived data (`lib/style-pack.ts`'s `packChoices`), and this refuses a `.next/static` chunk that
// names `licenceFile` or any sha256 the pool records — read off `pool.json`, never listed — and a runtime index whose
// relative imports reach `@inflozo/library/packs`. Seen red on Story 6.2's build: two chunks, every sha256 in each.

import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const AUTHED = join(REPO, 'apps/web/.next/server/app/(app)/app/(authed)')

const tracked = (...paths) =>
  execFileSync('git', ['ls-files', '-z', '--', ...paths], { cwd: REPO, encoding: 'utf8' }).split('\0').filter(Boolean)

// a set git cannot find is a broken check, never a pass — asked path by path, so a moved file cannot shrink a set unseen
const set = (...paths) =>
  paths.flatMap((path) => {
    const files = tracked(path)
    if (files.length === 0) {
      console.error(`REFUSED: git lists no file for ${path} — moved, or this is not a checkout of the repository`)
      process.exit(2)
    }
    return files
  })

const designs = set('packages/library/designs')
const controls = set('packages/library/fixtures/controls')
// what `lib/style-guide.ts` reads for its own three routes
const styleGuide = set(
  'packages/library/orbit-weekly/images',
  'packages/library/orbit-weekly/vendor',
  'packages/section-runtime/reference-tokens.css',
)
const canvas = [
  ...designs,
  ...controls,
  ...styleGuide,
  ...set('packages/library/control-groups.json', 'packages/library/fixtures/paywall', 'apps/web/lib/canvas-chrome.css'),
]

// Story 6.2 — the font pool's files, which `/canvas` serves by `?font=` (every canvas document's faces come from there)
const fonts = set('packages/library/fonts/files')

const ROUTES = [
  ['/canvas', 'canvas/route.js.nft.json', [...canvas, ...fonts]],
  ['/pilots', 'pilots/page.js.nft.json', canvas],
  ['the editor (Home)', 'projects/[id]/(editor)/page.js.nft.json', canvas],
  ['the editor (every other canvas)', 'projects/[id]/(editor)/[template]/page.js.nft.json', canvas],
  // DW-235 (Story 5.24e): the sync route asks `docRefusal` before every write, which reads each design off disk — a trace
  // without them would refuse every save
  ['the sync route', 'projects/[id]/sync/route.js.nft.json', designs],
  // Story 7.16b: a template delete's Undo judges the doc it puts back with `docRefusal`, which reads each design off disk —
  // the routes page's actions run in its own function, so a trace without them would refuse every designed Undo
  ['the routes page', 'projects/[id]/routes/page.js.nft.json', designs],
  ['/controls', 'controls/page.js.nft.json', [...designs, ...controls]],
  ['/controls/frame', 'controls/frame/route.js.nft.json', [...designs, ...controls]],
  ['/style-guide', 'style-guide/page.js.nft.json', styleGuide],
  ['/style-guide/frame', 'style-guide/frame/route.js.nft.json', styleGuide],
  ['/style-guide/variations', 'style-guide/variations/page.js.nft.json', styleGuide],
  // Story 7.18a: the deploy route compiles a stored project (`server/deploy/project-input.ts`) — every design (`pilot`,
  // `docRefusal`), the font pool's files AND each family's licence (the compile ships both), the module files `main.js` is
  // bundled from, and Ghost's vendored card scripts, stylesheets and licence
  ['the deploy route', 'projects/[id]/deploy/route.js.nft.json', [
    ...designs, ...fonts, ...set('packages/library/fonts/licences', 'packages/library/orbit-weekly/vendor'),
    // the module files themselves, as `moduleSources` reads them (a registry name plus `.js`) — never their types or tests
    ...set('packages/library/modules').filter((f) => /\/[a-z][a-z0-9-]*\.js$/.test(f)),
  ]],
]

let failed = 0
for (const [route, file, needs] of ROUTES) {
  const trace = join(AUTHED, file)
  if (!existsSync(trace)) {
    console.error(`REFUSED: ${relative(REPO, trace)} does not exist — run \`pnpm build\` first`)
    process.exit(2)
  }
  const carried = new Set(JSON.parse(readFileSync(trace, 'utf8')).files.map((f) => relative(REPO, resolve(dirname(trace), f))))
  const missing = needs.filter((f) => !carried.has(f))
  if (missing.length === 0) {
    console.log(`PASS  ${route}: carries all ${needs.length} files it reads`)
    continue
  }
  failed++
  console.log(`FAIL  ${route}: ${missing.length} of the ${needs.length} files it reads are not in ${relative(REPO, trace)} — ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ', …' : ''}`)
}

// ── Story 7.18a: the deploy route carries its two server externals (`next.config.ts`' `serverExternalPackages`) ───────
// Both pinned gscans are loaded by Node at run time, never bundled, so the function ships them only if the trace does: each
// one's own tree (its package.json and the entry the deploy reaches — gscan's checker and its major's spec) and the link
// Turbopack makes for it under `.next/node_modules`. The packages are found where the app finds them,
// `apps/web/node_modules/<alias>`, and read by their real path — the form a trace records.
// AND JSDOM IS NOT ONE OF THEM (the owner's test, 2026-10-19): an external jsdom is `require()`d by Node, and jsdom 30
// `require()`s ES modules, which Vercel's functions refuse (`ERR_REQUIRE_ESM`) — every deploy POST answered 500. So jsdom is
// bundled (`transpilePackages`), and this fails if the route carries a jsdom link again.
{
  const trace = join(AUTHED, 'projects/[id]/deploy/route.js.nft.json')
  const carried = new Set(JSON.parse(readFileSync(trace, 'utf8')).files.map((f) => relative(REPO, resolve(dirname(trace), f))))
  const EXTERNALS = [
    ['gscan4', ['package.json', 'lib/checker.js', 'lib/specs/v5.js']],
    ['gscan6', ['package.json', 'lib/checker.js', 'lib/specs/v6.js']],
  ]
  const jsdomLinks = [...carried].filter((f) => /^apps\/web\/\.next\/node_modules\/jsdom-/.test(f))
  if (jsdomLinks.length === 0) console.log('PASS  the deploy route bundles jsdom: no external jsdom for Node to require() on Vercel')
  else {
    failed++
    console.log(`FAIL  the deploy route loads jsdom as an external (${jsdomLinks[0]}) — Vercel refuses its require() of ES modules; keep it in transpilePackages`)
  }
  for (const [alias, entries] of EXTERNALS) {
    const real = realpathSync(join(REPO, 'apps/web/node_modules', alias))
    const needs = entries.map((e) => relative(REPO, join(real, e)))
    const missing = needs.filter((f) => !carried.has(f))
    // the link's name is Turbopack's (`<package>-<hash>`); one per real package, named after the package itself
    const own = JSON.parse(readFileSync(join(real, 'package.json'), 'utf8')).name
    const linked = [...carried].some((f) => f.startsWith('apps/web/.next/node_modules/') && realpathSync(join(REPO, f)) === real && f.slice('apps/web/.next/node_modules/'.length).startsWith(`${own}-`))
    if (missing.length === 0 && linked) {
      console.log(`PASS  the deploy route carries ${alias} (${needs.length} entries and its link)`)
      continue
    }
    failed++
    console.log(`FAIL  the deploy route: ${alias} is not shipped — ${[...missing, ...(linked ? [] : ['its .next/node_modules link'])].join(', ')}`)
  }
  // EVERY FILE EACH CHECKER TOUCHES WHILE IT CHECKS (the owner's test of Story 7.18a, 2026-10-19): gscan loads its checks by
  // listing `lib/checks/` and requiring each by a computed path, so the trace carried the check files but none of what they
  // require (semver, validator, Ghost's NQL, lodash's modules) — every Pre-flight on Vercel answered "We couldn't check your
  // theme". So each pinned checker runs once here, in a child, over a theme in a fresh temporary directory, with every file it
  // reads, stats or resolves under `node_modules` recorded — and each one must be in the route's trace.
  // STORY 7.18b (DW-378): the theme is the PILOT theme (`tools/pilot-theme.mjs`, CI's own compile — partials, locales, settings,
  // fonts, cards, scripts), never a four-file stand-in, so every check a real theme makes gscan run is the trace's to carry.
  const TOUCH = `
const fs = require('fs'), Module = require('module'), os = require('os'), path = require('path')
const seen = new Set(), EX = fs.existsSync, RP = fs.realpathSync, ST = fs.statSync
const note = (f) => { try { if (typeof f === 'string' && f.includes('/node_modules/') && EX(f)) { const r = RP(f); if (ST(r).isFile()) seen.add(r) } } catch {} }
for (const fn of ['readFileSync', 'readdirSync', 'statSync', 'lstatSync', 'existsSync', 'openSync', 'realpathSync', 'accessSync']) {
  const orig = fs[fn]; fs[fn] = function (f, ...rest) { note(f); return orig.call(this, f, ...rest) }
}
for (const fn of ['readFile', 'stat', 'lstat', 'access', 'open']) {
  const orig = fs.promises[fn]; fs.promises[fn] = function (f, ...rest) { note(f); return orig.call(this, f, ...rest) }
}
const resolveFilename = Module._resolveFilename
Module._resolveFilename = function (...a) { const r = resolveFilename.apply(this, a); note(r); return r }
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inflozo-trace-gscan-'))
// a fresh copy each run: gscan deletes the files it ignores under the system's temporary directory
fs.cpSync(process.env.THEME_DIR, dir, { recursive: true })
const gscan = require(process.env.GSCAN_ALIAS)
gscan.check(dir, { checkVersion: process.env.GSCAN_SPEC }).then((t) => { gscan.format(t, { checkVersion: process.env.GSCAN_SPEC }); process.stdout.write(JSON.stringify([...seen])) }, (e) => { process.stderr.write(String(e && e.message)); process.exitCode = 1 }).finally(() => fs.rmSync(dir, { recursive: true, force: true }))
`
  const { compilePilots, CI_WORDS, PILOT_THEME } = await import('./pilot-theme.mjs')
  const pilotDir = mkdtempSync(join(tmpdir(), 'inflozo-trace-pilot-'))
  // the temporary theme goes whatever throws (the Review, 2026-10-19)
  try {
    const pilotFiles = compilePilots(CI_WORDS, { theme: PILOT_THEME }).files
    for (const [file, body] of Object.entries(pilotFiles)) {
      mkdirSync(dirname(join(pilotDir, file)), { recursive: true })
      writeFileSync(join(pilotDir, file), body)
    }
    // the control: a theme with no partial would leave the partial checks unexercised
    if (!Object.keys(pilotFiles).some((f) => f.startsWith('partials/'))) {
      failed++
      console.log('FAIL  the pilot theme compiled with no partial — the recorder would not exercise a real theme')
    }
    for (const [alias, spec] of [['gscan4', 'v5'], ['gscan6', 'v6']]) {
      let touched
      try {
        touched = JSON.parse(execFileSync(process.execPath, ['-e', TOUCH], { cwd: join(REPO, 'apps/web'), env: { ...process.env, GSCAN_ALIAS: alias, GSCAN_SPEC: spec, THEME_DIR: pilotDir }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
      } catch (e) {
        failed++
        console.log(`FAIL  ${alias} could not be run to record what it touches — ${String(e.stderr || e.message).split('\n')[0]}`)
        continue
      }
      // the control, derived (the review, 2026-10-19 — it was a written-down count): the recorder saw the checker load every
      // one of its own check files, so a recorder that saw nothing cannot pass
      const checks = join(dirname(realpathSync(createRequire(join(REPO, 'apps/web/package.json')).resolve(`${alias}/package.json`))), 'lib', 'checks')
      const unseen = readdirSync(checks).filter((f) => f.endsWith('.js')).filter((f) => !touched.includes(join(checks, f)))
      if (unseen.length > 0) {
        failed++
        console.log(`FAIL  ${alias}: the recorder did not see ${unseen.length} of its check files load (${unseen.slice(0, 3).join(', ')}) — it proves nothing`)
        continue
      }
      const absent = touched.map((f) => relative(REPO, f)).filter((f) => !carried.has(f))
      if (absent.length === 0) console.log(`PASS  the deploy route carries all ${touched.length} files ${alias} touches while it checks a theme`)
      else {
        failed++
        console.log(`FAIL  the deploy route lacks ${absent.length} of the ${touched.length} files ${alias} touches while it checks — ${absent.slice(0, 4).map((f) => f.replace(/^node_modules\/\.pnpm\//, '')).join(', ')}${absent.length > 4 ? ', …' : ''}`)
      }
    }
  } finally {
    rmSync(pilotDir, { recursive: true, force: true })
  }
}
console.log(failed === 0 ? 'RESULT: every route carries its files' : `RESULT: ${failed} route(s) would deploy without their files`)

// ── DW-323: the pool's record stays on the server ───────────────────────────────────────────────────────────────────
const pool = JSON.parse(readFileSync(join(REPO, 'packages/library/fonts/pool.json'), 'utf8'))
const shas = Object.values(pool.faces).flatMap((f) => f.files.map((x) => x.sha256))
// the control: a pool with no file records nothing this could find, and the check would pass on nothing
if (shas.length === 0) {
  console.error('REFUSED: pool.json records no file — the pool check would prove nothing')
  process.exit(2)
}
const STATIC = join(REPO, 'apps/web/.next/static')
// `existsSync` first (review, 2026-10-04): with no build `readdirSync` threw, and the refusal below was never reached
const chunks = (existsSync(STATIC) ? readdirSync(STATIC, { recursive: true }) : []).filter((f) => String(f).endsWith('.js')).map(String)
if (chunks.length === 0) {
  console.error(`REFUSED: ${relative(REPO, STATIC)} holds no script — run \`pnpm build\` first`)
  process.exit(2)
}
let carrying = 0
for (const chunk of chunks) {
  const text = readFileSync(join(STATIC, chunk), 'utf8')
  const named = shas.filter((sha) => text.includes(sha)).length
  if (named === 0 && !text.includes('licenceFile')) continue
  carrying++
  console.log(`FAIL  ${chunk}: carries the font pool's record — ${named} of its ${shas.length} sha256s${text.includes('licenceFile') ? ', and licenceFile' : ''}`)
}
// …and the runtime's index reaches no preset and no pool through its own relative imports
const RUNTIME = join(REPO, 'packages/section-runtime/src')
const reached = new Set()
const walk = (file) => {
  if (reached.has(file)) return
  reached.add(file)
  for (const [, spec] of readFileSync(join(RUNTIME, file), 'utf8').matchAll(/^(?:import|export)\b[^'"]*?from\s+'([^']+)'/gm)) {
    if (spec === '@inflozo/library/packs') {
      carrying++
      console.log(`FAIL  packages/section-runtime/src/${file} imports @inflozo/library/packs, so the runtime's index carries the pool`)
    }
    if (spec.startsWith('./')) walk(spec.slice(2))
  }
}
walk('index.ts')
console.log(carrying === 0 ? `PASS  no client chunk of ${chunks.length} carries the font pool's record, and the runtime's index reaches no preset` : `RESULT: ${carrying} place(s) carry the font pool's record to the browser (DW-323)`)
process.exit(failed === 0 && carrying === 0 ? 0 : 1)
