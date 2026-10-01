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
// whole set; `/controls` and its frame read the designs and the controls fixtures; the style-guide's three routes read
// Orbit Weekly's pictures and vendored cards and the reference tokens (Story 5.24d's review: their text test went with
// the inert lists, and nothing had replaced it).
//
// CI runs it straight after `check`'s `pnpm build` (`.github/workflows/ci.yml`); `deploy`'s `vercel build` only ever adds
// files, so a trace this passes is the least the deployment ships.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
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

const ROUTES = [
  ['/canvas', 'canvas/route.js.nft.json', canvas],
  ['/pilots', 'pilots/page.js.nft.json', canvas],
  ['the editor (Home)', 'projects/[id]/(editor)/page.js.nft.json', canvas],
  ['the editor (every other canvas)', 'projects/[id]/(editor)/[template]/page.js.nft.json', canvas],
  ['/controls', 'controls/page.js.nft.json', [...designs, ...controls]],
  ['/controls/frame', 'controls/frame/route.js.nft.json', [...designs, ...controls]],
  ['/style-guide', 'style-guide/page.js.nft.json', styleGuide],
  ['/style-guide/frame', 'style-guide/frame/route.js.nft.json', styleGuide],
  ['/style-guide/variations', 'style-guide/variations/page.js.nft.json', styleGuide],
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
console.log(failed === 0 ? 'RESULT: every route carries its files' : `RESULT: ${failed} route(s) would deploy without their files`)
process.exit(failed === 0 ? 0 : 1)
