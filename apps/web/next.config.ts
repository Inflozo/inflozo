import type { NextConfig } from 'next'

const config: NextConfig = {
  // AD-1: the core packages ship as TypeScript source and are compiled by the app.
  transpilePackages: [
    '@inflozo/section-runtime',
    '@inflozo/ghost-shim',
    '@inflozo/theme-compiler',
  ],
}

export default config
