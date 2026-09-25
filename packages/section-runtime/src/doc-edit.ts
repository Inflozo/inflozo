// EVERY SECTION OPERATION, IN ONE PURE MODULE (Story 5.4) — what it MEANS to move, copy, remove, rename, hide or
// re-audience a section, decided once over `ProjectDoc` and nowhere else.
//
// Three readers, which is why it is not in `editor.tsx`: the editor calls these for each gesture; Story 5.8's journal
// records one of these calls as one transaction and one undo step; Epic 7's compiler reads `hidden` and `isDesigned`
// rather than re-deriving what they mean. A second implementation of "where a duplicate lands" is exactly the drift
// standing rule 3 forbids.
//
// PURE, AND WITH NO ID GENERATOR. `duplicateSection` is handed the new `instanceId` rather than making one: the core
// packages read no clock and no randomness (AD-1), and a caller that passes the id can test the result.
//
// EVERY OPERATION ANSWERS THE NEXT DOC OR A SENTENCE, the same shape `controls.ts`'s edits use — so a refusal is one
// wording, shown where the action was pressed, and never a silent no-op.

import { darkOverridesInForce, movedTo, switchControls } from './controls.ts'
import type { ControlEntry } from './controls.ts'
import type { DocInstance, ProjectDoc } from './doc-schema.ts'
import { placementRefusal } from '@inflozo/library'

type MemberVisibility = DocInstance['memberVisibility']

const at = (doc: ProjectDoc, instanceId: string) => doc.instances.findIndex((i) => i.instanceId === instanceId)

/** The sentence every operation answers when the instance it names is not on this template. Never shown in the app —
 *  the editor only ever asks about a row it drew — so it is written for whoever reads the failure. */
const missing = (instanceId: string) => `there is no section ${instanceId} on this template`

const withInstances = (doc: ProjectDoc, instances: DocInstance[]): ProjectDoc => ({ ...doc, instances })

/** Replaces one instance through `change`, leaving every other byte of the doc alone. */
function withOne(doc: ProjectDoc, instanceId: string, change: (i: DocInstance) => DocInstance): ProjectDoc | string {
  const n = at(doc, instanceId)
  if (n === -1) return missing(instanceId)
  return withInstances(doc, doc.instances.map((i, x) => (x === n ? change(i) : i)))
}

/** FR-D5's reorder, by drag or by `⌥↑`/`⌥↓`. `to` is the position in THIS doc's own instances — a site-wide section is
 *  never reordered against a page section, because the two live in different docs (the card boundary, B7). The move is
 *  announced politely in `moveItem`'s exact words, so the app has one wording for a completed move (UX-DR12). */
export function moveSection(doc: ProjectDoc, instanceId: string, to: number): { doc: ProjectDoc; announce: string } | string {
  const from = at(doc, instanceId)
  if (from === -1) return missing(instanceId)
  const count = doc.instances.length
  if (!Number.isInteger(to) || to < 0 || to >= count) return `there is no position ${to + 1} on this template`
  const next = doc.instances.filter((_, i) => i !== from)
  next.splice(to, 0, doc.instances[from]!)
  return { doc: withInstances(doc, next), announce: movedTo(to, count) }
}

/** A copy of one section, landing DIRECTLY AFTER its original with the same layer name and the same stored values —
 *  the precedent `duplicateItem` sets — save the main-feed flag, which the copy never carries (Story 5.19). Refused
 *  where R-37's Post Content singleton would be broken (FR-I1); a site-wide section is never duplicated at all (FR-D5),
 *  and its Duplicate is ABSENT rather than refused, so that rule lives in the panel that draws the row and not here. */
export function duplicateSection(doc: ProjectDoc, instanceId: string, newInstanceId: string): ProjectDoc | string {
  const n = at(doc, instanceId)
  if (n === -1) return missing(instanceId)
  if (newInstanceId.trim() === '') return 'a copy needs an id of its own'
  if (at(doc, newInstanceId) !== -1) return `this template already holds a section ${newInstanceId}`
  const original = doc.instances[n]!
  const refusal = placementRefusal(original.designId, doc.instances.map((i) => i.designId))
  if (refusal !== null) return refusal
  // Story 5.19 — the copy is NEVER the main feed (DW-194's duplicate half): a page has one, and the copy is made here
  const copy: DocInstance = { ...original, instanceId: newInstanceId, isMainFeed: false }
  return withInstances(doc, [...doc.instances.slice(0, n + 1), copy, ...doc.instances.slice(n + 1)])
}

/** STORY 5.10 — the Section Picker's placement, shaped exactly as `duplicateSection` is: pure, caller-supplied id,
 *  the same `placementRefusal` over the designs the template already holds, and the next doc or a sentence.
 *
 *  `at` is the position in THIS doc's own instances — 0 puts it first, `instances.length` last — which is what makes
 *  "the section lands where it was invoked" one number rather than a rule. A site-wide design is placed into the
 *  SITE doc, whose order the canvas stack derives (`canvasStack`), so where it lands on screen is not this
 *  function's business. Out of range is clamped rather than refused: a gap is a position on screen, and the doc it
 *  addresses can have grown since the pointer was there. */
export function insertSection(doc: ProjectDoc, position: number, instance: DocInstance): ProjectDoc | string {
  if (instance.instanceId.trim() === '') return 'a new section needs an id of its own'
  if (at(doc, instance.instanceId) !== -1) return `this template already holds a section ${instance.instanceId}`
  const refusal = placementRefusal(instance.designId, doc.instances.map((i) => i.designId))
  if (refusal !== null) return refusal
  const n = Math.max(0, Math.min(Number.isInteger(position) ? position : doc.instances.length, doc.instances.length))
  return withInstances(doc, [...doc.instances.slice(0, n), instance, ...doc.instances.slice(n)])
}

/** STORY 5.11 — THE ONE PLACE A DESIGN CHANGES (FR-D19). The panel's arrows and thumbnails, the section's own
 *  arrows, `[` / `]` and Shuffle are four doors; this is the operation behind all four, so 5.12's Site Remix and
 *  Epic 8's "swap to a Free design" call it rather than reimplementing carry / park / default.
 *
 *  `ring` is the instance's OWN ring — `ringFor(entries, current)` — carrying each member's declaration, so this
 *  function needs no library and no lookup: the outgoing design is the ring member the instance already names.
 *  A design outside it writes NOTHING and answers a sentence; a ring that does not hold the instance's own design
 *  is the same refusal, because there is then no declaration to decide what carries.
 *
 *  Shaped exactly as `insertSection` is: pure, the next doc or a sentence, and one instance changed. Content,
 *  items and `data` are untouched by construction — the ring never leaves the category and `contentSchema` is the
 *  category's union (FR-G3), so the swap writes only `designId` and the three control maps. */
export function switchDesign(
  doc: ProjectDoc,
  instanceId: string,
  to: string,
  ring: readonly ({ id: string } & Pick<ControlEntry, 'controlSchema' | 'universals'>)[],
): ProjectDoc | string {
  const n = at(doc, instanceId)
  if (n === -1) return missing(instanceId)
  const instance = doc.instances[n]!
  if (to === instance.designId) return 'this section already uses that design'
  const arriving = ring.find((e) => e.id === to)
  const leaving = ring.find((e) => e.id === instance.designId)
  if (arriving === undefined || leaving === undefined) {
    return `${to} is not one of the designs this section can be shown as`
  }
  return withInstances(doc, doc.instances.map((i, x) =>
    (x === n ? { ...i, designId: to, ...switchControls(leaving, arriving, i) } : i)))
}

/** Removes a section for good. Removing every one of them returns the template to untouched (AD-22, `isDesigned`),
 *  which is what HIDING deliberately does not do. */
export function removeSection(doc: ProjectDoc, instanceId: string): ProjectDoc | string {
  const n = at(doc, instanceId)
  if (n === -1) return missing(instanceId)
  return withInstances(doc, doc.instances.filter((_, i) => i !== n))
}

/** The per-instance rename Layers offers. A blank name is refused, because the row, the canvas name tag and the
 *  panel's heading are all this string and an empty one would leave three places unnamed. */
export function renameSection(doc: ProjectDoc, instanceId: string, name: string): ProjectDoc | string {
  if (name.trim() === '') return 'Give this section a name.'
  return withOne(doc, instanceId, (i) => ({ ...i, layerName: name.trim() }))
}

/** Hidden is RETAINED, never removed: the instance stays in the doc, the canvas renders `''` for it, and Epic 7
 *  leaves it out of the compile. */
export function setHidden(doc: ProjectDoc, instanceId: string, hidden: boolean): ProjectDoc | string {
  return withOne(doc, instanceId, (i) => ({ ...i, hidden }))
}

/** R-124's Member visibility, stored on the instance and handed to both emitters as `RenderInput.visibility`. */
export function setMemberVisibility(doc: ProjectDoc, instanceId: string, visibility: MemberVisibility): ProjectDoc | string {
  return withOne(doc, instanceId, (i) => ({ ...i, memberVisibility: visibility }))
}

/** R-133's clear, for ONE section: its dark version follows its light one again, and every other byte of the doc is
 *  identical. A DELIBERATE clear, and one of only two in the product — the other is the project-level row on Theme
 *  settings — because everything else keeps a stored override on purpose: a mode change keeps them (FR-D7) and so
 *  does `resetSection` (FR-F4, `controls.test.ts:413`). The whole map goes, not only the names in force: a value
 *  this design narrows away is still a dark override the customer asked for on this section. */
export function clearDarkOverrides(doc: ProjectDoc, instanceId: string): ProjectDoc | string {
  return withOne(doc, instanceId, (i) => ({ ...i, darkOverrides: {} }))
}

/** How many sections across these docs carry a dark override AN EMITTER COULD USE — D6a's count, DERIVED by walking
 *  the docs and never stored (standing rule 4). `entryOf` is the library, in `synthesize`'s own shape: a design it
 *  cannot hold has no declaration to read, so nothing of its overrides could be used and it is not counted. One
 *  definition of "carries an override" for the badge, both menus, both confirms and this count
 *  (`darkOverridesInForce`). */
export function darkOverrideCount(
  docs: Iterable<ProjectDoc>,
  entryOf: (designId: string) => ControlEntry | undefined,
): number {
  let carrying = 0
  for (const doc of docs) {
    for (const instance of doc.instances) {
      const entry = entryOf(instance.designId)
      if (entry !== undefined && darkOverridesInForce(entry, instance).length > 0) carrying++
    }
  }
  return carrying
}

/** AD-22: a template with a section on it is DESIGNED, however many of those sections are hidden. Only removing them
 *  all returns it to untouched. */
export const isDesigned = (doc: ProjectDoc): boolean => doc.instances.length > 0
