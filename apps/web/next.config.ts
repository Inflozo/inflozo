import type { NextConfig } from 'next'

/** Story 4.4: the style-guide surface reads `packages/library/orbit-weekly/` (imagery and Ghost's vendored
 *  card chunks) and the runtime's reference token stylesheet off disk, two directories above the app.
 *  A path built from `process.cwd()` at runtime is not something the build can follow on its own, so
 *  the files are named for the two routes that read them — without this the deployed function carries
 *  none of them and the page throws ENOENT. */
const STYLE_GUIDE_FILES = [
  '../../packages/library/orbit-weekly/images/**',
  '../../packages/library/orbit-weekly/vendor/**',
  '../../packages/section-runtime/reference-tokens.css',
]

/** Story 4.5: the controls review reads its sample (`packages/library/fixtures/controls/`), the Orbit Weekly
 *  picture pool and the reference token stylesheet off disk — the same reason, for its two routes. */
const CONTROLS_FILES = [
  '../../packages/library/fixtures/controls/**',
  '../../packages/library/orbit-weekly/images/**',
  '../../packages/section-runtime/reference-tokens.css',
]

/** Story 4.10: the pilots review reads the design library itself (`packages/library/designs/`, the directory that
 *  IS the design list), the Orbit Weekly pictures and the reference token stylesheet off disk — the same reason.
 *  Story 5.1: the canvas document gained the editor's chrome stylesheet, and the editor reads the designs too, so
 *  the one canvas route and both editor routes take this list. `/app/projects/**`, not `[id]`: the keys are picomatch
 *  globs (`collect-build-traces.js`), where `[id]` is a character class and would match no route. */
const PILOTS_FILES = [
  '../../packages/library/designs/**',
  '../../packages/library/orbit-weekly/images/**',
  '../../packages/section-runtime/reference-tokens.css',
  // Story 5.4: R-113's control register, one row of which decides whether a section carries Member visibility
  '../../packages/library/control-groups.json',
  './lib/canvas-chrome.css',
]

const config: NextConfig = {
  // `next dev` otherwise writes AGENTS.md and CLAUDE.md into this folder on every start.
  agentRules: false,
  /* STORY 5.9 — THE KEYBOARD GATE GETS ITS OWN BUILD DIRECTORY (R-146). Next 16 refuses a SECOND `next dev` for the
     same directory ("Another next dev server is already running"), and the lock lives under the build directory — so
     without this, `pnpm check` would fail for anyone who happened to have the app running. The gate boots its own
     server with INFLOZO_HARNESS=1; nothing else sets it, so every other run is `.next` exactly as before. */
  distDir: process.env.INFLOZO_HARNESS === '1' ? '.next-harness' : '.next',
  /* STORY 5.10 — THE PUBLISHED VERSION, IN THE CANVAS DOCUMENT'S ADDRESS (the owner's ruling of 2026-09-20,
     Question 5). The document is identical for every user and changes only when we publish, so it is cached
     `immutable` — and the only safe way to do that is to put the build in its URL, which is what makes a publish
     picked up at once instead of after a timeout. `vercel build` runs inside the GitHub Action (`ci.yml`'s deploy
     job), so the runner's `GITHUB_SHA` is in its environment; `VERCEL_GIT_COMMIT_SHA` is read first for a build
     started from Vercel's own git integration. Neither is set locally, and `dev` is correct there: the routes serve
     `no-store` outside production, so an edited stylesheet is never held. `||`, NOT `??` (review, 2026-09-20): the
     CLI-built deployment carries `VERCEL_GIT_COMMIT_SHA` as an EMPTY string, which `??` kept — production served
     `?v=` and therefore `no-store` on every preview (deployed walk, step 83). */
  env: {
    INFLOZO_CANVAS_V: (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'dev').slice(0, 12),
  },
  // AD-1: the core packages ship as TypeScript source and are compiled by the app. `@inflozo/library`
  // joined with Story 4.4, the first page to import one — which is what made this list do anything (DW-2).
  transpilePackages: [
    '@inflozo/library',
    '@inflozo/section-runtime',
    '@inflozo/ghost-shim',
    '@inflozo/theme-compiler',
  ],
  outputFileTracingIncludes: {
    '/app/style-guide': STYLE_GUIDE_FILES,
    '/app/style-guide/frame': STYLE_GUIDE_FILES,
    '/app/controls': CONTROLS_FILES,
    '/app/controls/frame': CONTROLS_FILES,
    '/app/pilots': PILOTS_FILES,
    '/app/canvas': PILOTS_FILES,
    '/app/projects/**': PILOTS_FILES,
  },
}

export default config
