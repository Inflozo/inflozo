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

const config: NextConfig = {
  // `next dev` otherwise writes AGENTS.md and CLAUDE.md into this folder on every start.
  agentRules: false,
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
  },
}

export default config
