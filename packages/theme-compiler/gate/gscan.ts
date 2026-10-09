// THE GATE'S SHELL (Story 7.7, AD-34) — the one file in this package outside AD-1's ban (`eslint.config.js`'s NOT_CORE),
// because gscan reads a theme DIRECTORY on disk: it writes the compiled files to a fresh temporary directory, runs that
// Ghost major's own pinned checker over it and removes it. Everything it answers is data; `verdict.ts` maps it.
//
// Each Ghost major is judged by the gscan that major's newest release pins (R2-2, AD-34): never one gscan at two specs —
// gscan 6.4.2 at `v5` missed a real Ghost 5 error (MEASUREMENTS §13a). `GSCAN` is the ONE place a pin, a package alias or
// a `checkVersion` is written; `check` and `format` take the same `checkVersion`, since `format` throws otherwise.
//
// gscan DELETES the entries it ignores (`.git`, `node_modules`, `CLAUDE.md`, …) from a theme inside `os.tmpdir()`
// (`read-theme.js`, both pinned versions — executed), so it is never pointed at any directory but the one made here,
// which holds the theme's files alone. A path that would land outside it is refused.

/// <reference path="./gscan.d.ts" />
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import type { GscanReport, Major, ReportResult, ThemeFiles } from './verdict.ts'

type Gscan = typeof import('gscan')
type Spec = import('gscan').Spec

/** AD-34's two checkers, pinned. A pin moves only by `fixtures/gscan/README.md`'s bump procedure. */
export const GSCAN = {
  5: { pkg: 'gscan4', version: '4.49.7', checkVersion: 'v5', ghost: '5.130.6' },   // the gscan Ghost 5.130.6 pins
  6: { pkg: 'gscan6', version: '6.4.2', checkVersion: 'v6', ghost: '6.58.0' },     // the gscan Ghost 6.58.0 pins
} as const

const require = createRequire(import.meta.url)
const PREFIX = 'inflozo-gscan-'
const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/** The installed checker differs from its pin: the gate answers `theme_check_failed` naming both. */
export class PinMoved extends Error {
  readonly installed: string
  readonly pinned: string
  constructor(installed: string, pinned: string) {
    super(`gscan ${installed} is installed where ${pinned} is pinned`)
    this.installed = installed
    this.pinned = pinned
  }
}

/** The version of the checker installed under a major's alias, from its own `package.json`. */
export const installedVersion = (major: Major): string => (require(`${GSCAN[major].pkg}/package.json`) as { version: string }).version

/** A major's rule inventory, read from the pinned package's own spec for its `checkVersion` (`lib/specs/v5.js` on
 *  4.49.7, `v6.js` on 6.4.2 — each merges its predecessors): `{ code: { level, fatal, regex? } }` in code order, `regex`
 *  a regex rule's `String(regex)`. `tools/record-gscan.mjs` records it (AD-23); the gate's test holds it equal. */
export function installedRules(major: Major): Record<string, { level: string; fatal: boolean; regex?: string }> {
  const { pkg, checkVersion } = GSCAN[major]
  const { rules } = require(`${pkg}/lib/specs/${checkVersion}.js`) as Spec
  return Object.fromEntries(Object.keys(rules).sort(byCode).map((code) => {
    const r = rules[code] as Spec['rules'][string]
    return [code, { level: r.level, fatal: r.fatal === true, ...(r.regex === undefined ? {} : { regex: String(r.regex) }) }]
  }))
}

/** That major's pinned gscan over `files`, as data: errors then warnings, each in code order with its failures in ref
 *  order, recommendations dropped. Throws — `gscanGate` maps any throw to `theme_check_failed`. */
export async function runGscan(files: ThemeFiles, major: Major): Promise<GscanReport> {
  const { pkg, version, checkVersion } = GSCAN[major]
  const installed = installedVersion(major)
  if (installed !== version) throw new PinMoved(installed, version)
  const gscan = require(pkg) as Gscan
  const dir = await mkdtemp(join(tmpdir(), PREFIX))
  try {
    for (const [path, body] of Object.entries(files)) {
      const to = resolve(dir, path)
      if (!to.startsWith(dir + sep)) throw new Error(`${JSON.stringify(path)} would land outside the theme's directory`)
      await mkdir(dirname(to), { recursive: true })
      await writeFile(to, body)
    }
    const { results } = gscan.format(await gscan.check(dir, { checkVersion }), { checkVersion })
    const data = (level: 'error' | 'warning') => results[level].map((r): ReportResult => ({
      code: r.code, level, fatal: r.fatal === true, rule: r.rule, details: r.details,
      failures: (r.failures ?? []).map((f) => ({ ref: String(f.ref), ...(typeof f.message === 'string' ? { message: f.message } : {}) }))
        .sort((a, b) => byCode(a.ref, b.ref) || byCode(a.message ?? '', b.message ?? '')),
    })).sort((a, b) => byCode(a.code, b.code))
    return { gscan: installed, results: [...data('error'), ...data('warning')] }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

/** The gate's temporary directories still under `os.tmpdir()` — the test's proof that every run's `finally` ran. */
export const gscanDirs = async (): Promise<string[]> => (await readdir(tmpdir())).filter((n) => n.startsWith(PREFIX)).sort(byCode)
