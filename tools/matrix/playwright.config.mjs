// Story 4.11 — the render matrix's runner configuration. NFR-6(a)'s two numbers live HERE and nowhere else: a case
// fails above 1% differing pixels (`maxDiffPixelRatio`) at a per-pixel tolerance of 0.1 (`threshold`), with animations
// and the caret disabled on every shot.
//
// Run it through `bash tools/matrix/run-matrix-gate.sh`, which runs this inside the pinned image. Started anywhere
// else it refuses, unless the gate's `--host` asked for a look that never writes a baseline.

import { defineConfig } from '@playwright/test'

if (process.env.INFLOZO_MATRIX_IMAGE !== '1' && process.env.MATRIX_HOST !== '1') {
  throw new Error('the render matrix runs inside its pinned image — bash tools/matrix/run-matrix-gate.sh (or --host, for a look on this machine that never writes a baseline)')
}

export default defineConfig({
  testDir: '.',
  testMatch: 'matrix.spec.mjs',
  outputDir: './test-results',
  // a missing baseline FAILS and is never written; only the gate's --update passes --update-snapshots
  updateSnapshots: 'none',
  snapshotDir: '../../packages/library/baselines',
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  fullyParallel: true,
  retries: 0,
  timeout: 60_000,
  reporter: [['list'], ['./reporter.mjs']],
  expect: {
    toHaveScreenshot: { threshold: 0.1, maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' },
  },
  use: { browserName: 'chromium', headless: true },
})
