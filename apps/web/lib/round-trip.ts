import { isDesigned, type ProjectDoc } from '@inflozo/section-runtime'
import { canvasOfPageTwoKey, canvasOfTemplateKey, templateKeyOf, type CanvasKey } from './editor.ts'

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
 *  nothing changed, so the caller can skip a state write.
 *
 *  STORY 5.16 — PAGE 2'S ROUND TRIP (R-178, R-179, AD-22), the same two rules over a pristine doc that is not a table
 *  but PAGE 1 AS IT STANDS: a following page 2 is page 1's live copy, derived by `lib/page-two.ts` from the docs and
 *  stored nowhere, so what `docs` holds for it is its STORED value — nothing. THE FIRST CHANGE STORES IT: the copy
 *  with the change is written, and page 2 is its own from then on. ZERO INSTANCES RETURNS IT TO FOLLOWING, and `back`
 *  says so for the selection's sake, since the copy that returns can repeat the very ids just removed. AN UNDO BACK
 *  over its first change restores what `docs` held before it — nothing — so it follows again by the same rule, and a
 *  CHANGE TO PAGE 1 needs no rule at all: the copy is derived from page 1, never kept beside it. */
export function committed(
  written: Readonly<Record<string, ProjectDoc>>,
  touched: string,
  stacks: Readonly<Record<string, ProjectDoc>>,
  auto: ReadonlySet<CanvasKey>,
): { docs: Readonly<Record<string, ProjectDoc>>; auto: ReadonlySet<CanvasKey>; back: boolean } {
  if (canvasOfPageTwoKey(touched) !== null) {
    const follows = !isDesigned(written[touched] ?? EMPTY_DOC)
    return { docs: follows ? { ...written, [touched]: EMPTY_DOC } : written, auto, back: follows }
  }
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
