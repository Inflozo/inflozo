import type { NextConfig } from 'next'

const config: NextConfig = {
  // `next dev` otherwise writes AGENTS.md and CLAUDE.md into this folder on every start.
  agentRules: false,
  // AD-1: the core packages ship as TypeScript source and are compiled by the app.
  transpilePackages: [
    '@inflozo/section-runtime',
    '@inflozo/ghost-shim',
    '@inflozo/theme-compiler',
  ],
}

export default config
