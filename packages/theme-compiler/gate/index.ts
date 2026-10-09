// @inflozo/theme-compiler/gate — Ghost's own theme checker over a compiled theme, in a customer's words (Story 7.7,
// FR-J6, AD-24, AD-34). The door Story 7.18's deploy and CI use. It is NOT exported from the package's root, so nothing
// that only compiles loads either gscan.
//
// `gscanGate(files, major)` runs that major's pinned gscan (`GSCAN`) and maps its report through `verdict` — errors
// block, warnings deploy — and never throws: a checker that fails, a pin that moved and a path refused are each one
// `theme_check_failed`, with no stack and no exception text.
//
// Story 7.8 adds `qualityGate(files, { pack, library })` — what gscan never looks at (FR-J17), in the same envelope.

import { GSCAN, PinMoved, runGscan } from './gscan.ts'
import { failed, verdict } from './verdict.ts'
import type { Major, ThemeFiles, Verdict } from './verdict.ts'

export async function gscanGate(files: ThemeFiles, major: Major): Promise<Verdict> {
  try {
    return verdict(await runGscan(files, major), files, major)
  } catch (e) {
    // Review (2026-10-09): `gscan` names the checker that ran — on a moved pin that is the installed one, never the pin
    return failed(major, e instanceof PinMoved ? e.installed : GSCAN[major]?.version ?? '', e instanceof PinMoved ? e : undefined)
  }
}

export { GSCAN, gscanDirs, installedRules, installedVersion, PinMoved, runGscan } from './gscan.ts'
export { DOCS_ROOT, failed, OURS, plain, verdict } from './verdict.ts'
// Story 7.8 — FR-J17's quality gate beside gscan's: core, synchronous, never throws (`quality.ts`)
export { AXE_CORE, leftovers, qualityGate, QUALITY_RULES, readPages } from './quality.ts'
export type { QualityRule, QualityVerdict } from './quality.ts'
export type { Finding, GscanReport, Major, ReportResult, ThemeFiles, Verdict } from './verdict.ts'
