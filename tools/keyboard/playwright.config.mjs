// Story 5.9 — the keyboard journey's runner configuration (NFR-6(d), R-146).
//
// Run it through `bash tools/keyboard/run-keyboard-gate.sh`, which boots `next dev` with INFLOZO_HARNESS=1 on a free
// port and passes the address in. Started anywhere else it refuses, because without that harness there is no editor
// to drive and a green run would mean nothing.
//
// NO IMAGE OF ITS OWN, unlike the render matrix: nothing here is photographed, so the fonts and the exact Chromium
// build are not load-bearing and the browser the repository already installs is the browser this drives. Retries are
// 0 for the same reason the RLS gate has none — a keyboard rule that passes on the second try is not a rule.

import { defineConfig } from '@playwright/test'

if (!process.env.KEYBOARD_BASE_URL) {
  throw new Error('the keyboard journey runs against the harness the gate boots — bash tools/keyboard/run-keyboard-gate.sh')
}

export default defineConfig({
  testDir: '.',
  testMatch: 'journey.spec.mjs',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: process.env.KEYBOARD_BASE_URL,
    browserName: 'chromium',
    headless: true,
    // NO POINTER AT ALL (NFR-6(d): "run with no pointer events"). The spec's own first test reads this file's
    // sibling and refuses if a mouse API appears in it; this is the other half — a touch screen would give the
    // editor a second input path and the hold-to-hover state that goes with it.
    hasTouch: false,
  },
})
