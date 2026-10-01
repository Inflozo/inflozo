import type { NextConfig } from 'next'

/* THE FILES THE APP READS OFF DISK — designs, pictures, stylesheets — reach the deployed functions through Turbopack's
   trace of `lib/style-guide.ts`'s `PACKAGES`, the one finder every reader imports, and `tools/check-traces.mjs` reads each
   route's trace after CI's build and fails the push that loses one (DW-269, Story 5.24d). There are no
   `outputFileTracingIncludes` lists here: Next 16.3.1 applies them only to a webpack build's trace map, which a Turbopack
   build does not make, so the lists Stories 4.4 to 5.20 kept shipped nothing, and their text tests proved nothing. */

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
}

export default config
