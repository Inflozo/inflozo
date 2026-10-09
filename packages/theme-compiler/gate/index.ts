// @inflozo/theme-compiler/gate — Ghost's own theme checker over a compiled theme, in a customer's words (Story 7.7,
// FR-J6, AD-24, AD-34). The door Story 7.18's deploy and CI use. It is NOT exported from the package's root, so nothing
// that only compiles loads either gscan.
//
// `gscanGate(files, major)` runs that major's pinned gscan (`GSCAN`) and maps its report through `verdict` — errors
// block, warnings deploy — and never throws: a checker that fails, a pin that moved and a path refused are each one
// `theme_check_failed`, with no stack and no exception text.

import { GSCAN, PinMoved, runGscan } from './gscan.ts'
import { failed, verdict } from './verdict.ts'
import type { Major, ThemeFiles, Verdict } from './verdict.ts'

export async function gscanGate(files: ThemeFiles, major: Major): Promise<Verdict> {
  try {
    return verdict(await runGscan(files, major), files, major)
  } catch (e) {
    return failed(major, GSCAN[major]?.version ?? '', e instanceof PinMoved ? e : undefined)
  }
}

export { GSCAN, gscanDirs, installedRules, installedVersion, PinMoved, runGscan } from './gscan.ts'
export { DOCS_ROOT, failed, plain, verdict } from './verdict.ts'
export type { Finding, GscanReport, Major, ReportResult, ThemeFiles, Verdict } from './verdict.ts'
