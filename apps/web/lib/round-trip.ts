import { isDesigned, type ProjectDoc } from '@inflozo/section-runtime'
import { canvasOfTemplateKey, templateKeyOf, type CanvasKey } from './editor.ts'

// AD-22's ROUND TRIP AND THE TEMPLATE COUNT, AS PURE RULES (Story 5.5's review, 2026-09-18). They lived inside
// `editor.tsx`, where `node --test` cannot reach, and `canvas-switch.test.ts` asserted its own copies of them — so
// inverting either here left `pnpm check` green. The editor and the test now import the same two functions. Its own
// file rather than `lib/editor.ts`, which the harness and the Shell load and which imports nothing.

/** An untouched canvas, for the readers that would otherwise each write `?? { instances: [] }`. */
export const EMPTY_DOC: ProjectDoc = { schemaVersion: 1, instances: [] }

/** How many templates a site-wide section really reaches: every canvas offered that will actually SHIP — the
 *  auto-generated ones, plus each of the others that has a doc with sections in it. A membership canvas emits nothing
 *  until it is designed (FR-D6), so it is not counted while it is empty. */
export const templatesOpen = (canvases: readonly CanvasKey[], docs: Readonly<Record<string, ProjectDoc>>, auto: ReadonlySet<CanvasKey>) =>
  canvases.filter((key) => auto.has(key) || isDesigned(docs[templateKeyOf(key)] ?? EMPTY_DOC)).length

/** One write to the session's docs, decided. THE FIRST EDIT MATERIALISES: the canvas written to stops being
 *  auto-generated. THE LAST SECTION OFF GIVES IT BACK: a synthesizable canvas (one with a `stacks` entry) whose doc now
 *  holds no instances is untouched again and its default stack returns — `back` says so, because the instances on the
 *  canvas are then NEW ones even where their derived ids repeat. Hiding every section does neither half of that
 *  second rule (FR-D5): a hidden instance is retained, so `isDesigned` is still true. `auto` keeps its identity when
 *  nothing changed, so the caller can skip a state write. */
export function committed(
  written: Readonly<Record<string, ProjectDoc>>,
  touched: string,
  stacks: Readonly<Record<string, ProjectDoc>>,
  auto: ReadonlySet<CanvasKey>,
): { docs: Readonly<Record<string, ProjectDoc>>; auto: ReadonlySet<CanvasKey>; back: boolean } {
  const pristine = stacks[touched]
  const back = pristine !== undefined && !isDesigned(written[touched] ?? EMPTY_DOC)
  const docs = back ? { ...written, [touched]: pristine } : written
  const owning = canvasOfTemplateKey(touched)
  if (!owning || back === auto.has(owning)) return { docs, auto, back }
  const set = new Set(auto)
  if (back) set.add(owning)
  else set.delete(owning)
  return { docs, auto: set, back }
}
