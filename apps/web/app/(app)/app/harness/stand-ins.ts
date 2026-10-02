import type { SectionRegistryEntry } from '@inflozo/library'
import { pilot } from '@/lib/pilots'

/**
 * STORY 5.24e — TWO DESIGNS THE SHIPPED LIBRARY DOES NOT HOLD YET, made for the keyboard harness alone and never in
 * `packages/library` (AD-35): each is a pilot of the same shape under another category's id, so the rule that keys on
 * the category has something to meet with no database and no new design.
 *
 * A FOOTER (DW-187, DW-189): A3's `a3/` prefix is what the page draws last (`canvasStack`), and no A3 design exists until
 * Story 9.9 — so the band clamp (`landWithin`) had nothing to hold. The Rail's markup, re-id'd: site-wide by its own
 * `default.hbs` target, so the harness places it in the site doc after the header.
 *
 * A POST CONTENT LAYOUT (DW-207): R-37's one refusal (`placementRefusal`, "this layout already prints the article") is
 * about A25, which holds nothing yet — so the Section Picker's refusal line could not be reached. The post header's
 * markup, re-id'd, compiling to `post.hbs`.
 *
 * Reached by `x-inflozo-harness-stand-ins: on` (the layout) and by id (the harness canvas route, for a preview card), so
 * the default fixture every other stop counts on is untouched.
 */
export const standIns = (): SectionRegistryEntry[] => [
  { ...pilot('a1/1'), id: 'a3/1', category: 'a3', name: 'Stand-in footer', categoryTitle: 'Footers' },
  { ...pilot('a24/1'), id: 'a25/1', category: 'a25', name: 'Stand-in post content', categoryTitle: 'Post Content Layouts' },
]
