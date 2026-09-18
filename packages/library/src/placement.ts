// THE TWO PLACEMENT RULES, AS CODE (Story 5.4). Until now FR-D5 and R-37 stated them in prose and nothing enforced
// them: `SectionRegistryEntry` carries no placeable flag, and A25/A32/A33/A34 are named in `sections-inventory.md`
// § Placeable sections vs non-placeable treatments and nowhere else. Both rules are needed the moment a section can be
// duplicated (this story) and offered (Story 5.10's Section Picker, which calls the same two functions).
//
// A CATEGORY, NOT A DESIGN, decides both: every design of A33 is a Koenig card treatment and every design of A25 is a
// Post Content layout, so the test is on the `{category}/{n}` id's first half.
//
// THE TWO ANSWERS ARE DIFFERENT SHAPES ON PURPOSE (UX-DR3, absent not greyed):
//   - a non-placeable treatment is ABSENT — `isPlaceable` is false, so the picker's rail never lists it and the editor
//     refuses a doc that names one (`editorData`). There is no sentence to show, because there is nothing to press.
//   - a second Post Content section is a REFUSAL of an action the user really did take, so `placementRefusal` answers
//     with the sentence to show where the action was pressed.

/** The non-placeable treatments (`sections-inventory.md` § Placeable vs non-placeable): A32 Paywall / Content CTA,
 *  chosen in the Paywall Template editor; A33 Koenig Card Treatments, chosen by the card design module; A34 Pagination
 *  Styles, chosen on the designated main feed. One per project, chosen elsewhere, never dragged onto a canvas. */
export const NON_PLACEABLE = ['a32', 'a33', 'a34'] as const

/** A25 Post Content Layouts — the section that wraps Ghost's `{{content}}`. At most ONE per layout (R-37, FR-I1): a
 *  template that printed the article twice would print the post's body twice. */
export const POST_CONTENT = 'a25'

/** `a25/3` → `a25`. Anything that is not a `{category}/{n}` id has no category, and is not placeable. */
export const categoryOf = (designId: string): string => (/^[a-z][a-z0-9]*\/\d+$/.test(designId) ? designId.split('/')[0]! : '')

/** Can this design be dragged onto a canvas at all? False for a treatment, which is chosen outside the canvas — so it
 *  never appears in the Picker rail, in Layers, in Shuffle or in Remix (FR-D5, FR-D12, FR-D13, FR-D17). */
export const isPlaceable = (designId: string): boolean => {
  const category = categoryOf(designId)
  return category !== '' && !(NON_PLACEABLE as readonly string[]).includes(category)
}

/** Why this design cannot be placed beside the designs already on the template, or `null` when it can. `present` is
 *  every design id the template already holds, in any order.
 *
 *  ONE RULE LIVES HERE TODAY — R-37's Post Content singleton. A non-placeable treatment answers `null`, because it is
 *  never offered in the first place: `isPlaceable` is the filter, and a sentence for a control that is absent would be
 *  a sentence nobody can reach. */
export function placementRefusal(designId: string, present: readonly string[]): string | null {
  if (categoryOf(designId) !== POST_CONTENT) return null
  return present.some((id) => categoryOf(id) === POST_CONTENT) ? 'this layout already prints the article' : null
}
