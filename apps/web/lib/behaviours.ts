/* ─────────────────────────────────────────── Story 5.15 — the canvas's road to `core` (FR-D20, DW-136).
 *
 * ONE DECISION, AND IT IS `core`'s. Whether a mount runs is `core`'s editing rule over the registry's `editSafe`
 * (R-21, research §7) — R-174 kept every value, so `header-scroll`, `reveal`, `tabs` and `accordion` hold still too —
 * and nothing here keeps a second list. `core` hands back the mounts it held still; the editor's PAUSED chips read
 * exactly that list, narrowed by the registry's `movesByItself` (R-175).
 *
 * THE EDITOR RUNS `core` ITSELF, from its own bundle, against the canvas window. The canvas document carries no
 * script and no nonce, and the policy refuses `eval`, so nothing can run INSIDE it; `core` reaches every platform
 * object through the `win` it is handed (`core.js:3-4`), so calling it from here compiles nothing in the canvas.
 * That this raises no violation is a hypothesis the deployed walk's step 91 executes (standing rule 1).
 *
 * Pure apart from calling `core`, so `node --test` reaches it (`behaviours.test.ts`). */

import { MODULES, parseModuleDeclaration, type ModuleRow } from '@inflozo/library'
import { core, type ModuleFn } from '@inflozo/library/core'

/** ponytail: FR-G7(2) — no feature module has a file yet. Each is written by its first category story, and the pilots
 *  declare `nav-drawer` and `member-form` before theirs exist, so a mount with no file runs this no-op: Preview then
 *  draws its JavaScript branch exactly as `/pilots`, the picker's cards and the render matrix do, and `core` has no
 *  unknown name to report. It goes row by row, the day each file lands — `behaviours.test.ts` is red until the canvas
 *  imports it into `FILES`. */
const noFileYet: ModuleFn = () => {}

/** The module files this build carries, by registry name. Empty until the first category story writes one. */
const FILES: Partial<Record<string, ModuleFn>> = {}

/** Every registry row, in registry order, as `core` takes it: `[name, fn, row]`, `fn` the module's own function.
 *  EVERY row, because `core` reports a malformed or unknown declaration before its editing rule (`core.js:34-43`). */
export const CANVAS_MODULES: readonly (readonly [string, ModuleFn, ModuleRow])[] =
  MODULES.map((row) => [row.name, FILES[row.name] ?? noFileYet, row] as const)

/** A mount's own throw, named: `core` hands `report` whatever a module threw, which need not say whose it is. */
const named = (name: string, fn: ModuleFn): ModuleFn => (el, ctx) => {
  try {
    fn(el, ctx)
  } catch (error) {
    throw new Error(`the ${name} behaviour threw as it mounted, so its section stays at rest`, { cause: error })
  }
}

/** THE ONE CALL OF `core` IN THE APP. While designing (`editing`), every mount that is not edit-safe is held still, at
 *  rest in its no-JavaScript state, and handed back in `paused`; in Preview everything runs. Every error goes to
 *  `report` — the editor's, which logs and never says — and nothing is thrown from a timer. `modules` is the canvas's
 *  unless a probe hands its own, as `bundle`'s `rows` are (`behaviours.test.ts`'s throwing module). */
export const startBehaviours = (win: Window, editing: boolean, report: (error: unknown) => void, modules = CANVAS_MODULES) =>
  core(win, modules.map(([name, fn, row]) => [name, named(name, fn), row] as const), { editing, report })

/** R-175's filter over a mount's `data-module`: does the part it declares move BY ITSELF — on a timer or as the page
 *  scrolls, with nothing pressed? Read through the grammar, so `header-scroll:768` is `header-scroll`; a malformed
 *  or unknown declaration moves nothing. */
export function movesByItself(declaration: string): boolean {
  const parsed = parseModuleDeclaration(declaration)
  return typeof parsed !== 'string' && MODULES.some((m) => m.name === parsed.name && m.movesByItself)
}
