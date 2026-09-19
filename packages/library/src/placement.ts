// THE TWO PLACEMENT RULES, AS CODE (Story 5.4). Until now FR-D5 and R-37 stated them in prose and nothing enforced
// them: `SectionRegistryEntry` carries no placeable flag, and A25/A32/A33/A34 are named in `sections-inventory.md`
// § Placeable sections vs non-placeable treatments and nowhere else. Both rules are needed the moment a section can be
// duplicated (this story) and offered (Story 5.10's Section Picker, which calls the same two functions).
//
// Story 5.10 appends the `bindingContext` half below; `GET_FORBIDDEN_TARGETS` is R-7's own set, read from the
// vocabulary rather than repeated, so the two can never disagree.
//
// A CATEGORY, NOT A DESIGN, decides both: every design of A33 is a Koenig card treatment and every design of A25 is a
// Post Content layout, so the test is on the `{category}/{n}` id's first half.
//
// THE TWO ANSWERS ARE DIFFERENT SHAPES ON PURPOSE (UX-DR3, absent not greyed):
//   - a non-placeable treatment is ABSENT — `isPlaceable` is false, so the picker's rail never lists it and the editor
//     refuses a doc that names one (`editorData`). There is no sentence to show, because there is nothing to press.
//   - a second Post Content section is a REFUSAL of an action the user really did take, so `placementRefusal` answers
//     with the sentence to show where the action was pressed.

import { GET_FORBIDDEN_TARGETS } from './vocabulary.ts'
import type { BindingContext } from './vocabulary.ts'

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

// ─── Story 5.10 — the other half of "only what can work is offered" (FR-D12, FR-H7) ──────────────────────────────
//
// Until this story `compileTarget` was the whole filter, and `bindingContext` had NO RUNTIME READER anywhere. The
// two questions are different: `compileTarget` is "may this design be placed on this FILE", `bindingContext` is
// "does the resource this design binds EXIST there". On every design in the repo today they answer the same, which
// is exactly why a mistake in the table below would hide a design SILENTLY — the worst failure this surface has.
// So the table is paired with a VALIDATOR rule (`validate.ts`, `contextRefusal`): a design whose contexts fit none
// of its own targets is refused at assembly with a sentence. A wrong table then breaks a build for a real design
// instead of quietly shrinking a rail.

/** The `{{#get}}` resources of `appendix-b1-template-contexts.md` §5, as `bindingContext` values. §5's fifth
 *  resource, `newsletters`, is not a binding context, so it is not here. R-7 keeps the whole set off `error.hbs`
 *  and `private.hbs`: an error page that queries the database compounds the outage it is reporting. */
const GETTABLE: readonly BindingContext[] = ['posts', 'tags', 'authors', 'tiers']

/** What each template carries NATIVELY — `appendix-b1-template-contexts.md` §3's master matrix, one row per
 *  template, read through §3a's wrapper rule (a single-resource template renders `{post: {…}}`, a list template
 *  renders `posts` flat at the root). `none` is on every row: a design that binds no resource fits anywhere. */
const NATIVE: Readonly<Record<string, readonly BindingContext[]>> = {
  // §3: "Universal set only. Inherits the child render's root" — no resource of its own, ever
  'default.hbs': ['none'],
  'home.hbs': ['none', 'posts'],
  'index.hbs': ['none', 'posts'],
  // §3a: the post is the wrapper's `post` key, not the root
  'post.hbs': ['none', 'post'],
  // §3: identical to `post`, and the difference between them is the PRODUCT, which `compileTarget` expresses (§4.2)
  'page.hbs': ['none', 'post'],
  'tag.hbs': ['none', 'tag', 'posts'],
  'author.hbs': ['none', 'author', 'posts'],
  'error.hbs': ['none', 'error'],
  'private.hbs': ['none', 'private'],
}

/** Every binding context a design may reach on one template: its native set (§3) plus §5's `{{#get}}` resources,
 *  which R-7 withholds from `error.hbs` and `private.hbs`. A `custom-{name}.hbs` route renders through the list
 *  path with a flat root and only the data keys Inflozo itself declared (§3, the custom-route row), so it carries
 *  no resource natively and reaches the rest through a get. */
export const CONTEXTS_BY_TARGET = (file: string): readonly BindingContext[] => {
  const native = NATIVE[file] ?? ['none']
  return GET_FORBIDDEN_TARGETS.has(file) ? native : [...new Set([...native, ...GETTABLE])]
}

/** THE ONE QUERY THE PICKER READS — the rail, the grid, the counts and every empty state (FR-D12).
 *
 *  Three conditions, all of them absences rather than refusals (UX-DR3): the design must be placeable at all, it
 *  must compile to this file, and the resources it binds must exist there. A design that fails any of them is never
 *  drawn and never counted, because the question is *could this ever do anything here* and the answer is no. */
export const offeredOn = (
  entry: { id: string; compileTarget: readonly string[]; bindingContext: readonly BindingContext[] },
  file: string,
): boolean => {
  if (!isPlaceable(entry.id) || !entry.compileTarget.includes(file)) return false
  const here = CONTEXTS_BY_TARGET(file) as readonly string[]
  return entry.bindingContext.some((c) => here.includes(c))
}

/** Category order, NUMERICALLY — `a17` sorts after `a4`, which a string sort gets wrong. Anything that is not
 *  `a{n}` sorts after everything that is, by its own name, so a malformed id is last rather than first. */
export const byCategory = (a: string, b: string): number => {
  const n = (c: string) => (/^a\d+$/.test(c) ? Number(c.slice(1)) : Number.POSITIVE_INFINITY)
  return n(a) - n(b) || (a < b ? -1 : a > b ? 1 : 0)
}
