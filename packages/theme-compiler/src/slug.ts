// THE PARTIAL SLUG, AND ITS COLLISION RULE — Story 7.1, R2-10's "stated function" (spec § The partial slug).
//
// A layer name becomes a section partial's file name. The rule is §7.4's custom-template rule plus a length cap, so the
// product keeps ONE rule for a name that becomes a file: NFKD, combining marks dropped, `toLowerCase` (never a locale
// form, AD-1), spaces and underscores to `-`, everything outside `[a-z0-9-]` dropped, runs of `-` collapsed and trimmed,
// cut to 60 and trimmed again. DETERMINISTIC IS NOT UNIQUE — `Hero` and `HERO` slug alike — so names are handed out per
// directory in placement order, each its slug while free and otherwise the first free `-2`, `-3`, …

/** The longest slug, before a collision suffix. */
export const SLUG_MAX = 60

/** A name's slug — `''` when nothing in it survives (an emoji, a CJK name). */
export function partialSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\s_]/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-$/, '')
}

/** A section's slug: its layer name's, else its design's name's, else its category's, else `section`. */
export const sectionSlug = (layerName: string, entry: { name: string; categoryTitle: string }): string =>
  partialSlug(layerName) || partialSlug(entry.name) || partialSlug(entry.categoryTitle) || 'section'

/** The collision rule, over one directory's names: `slug` while it is free, else the first free `slug-2`, `slug-3`, … —
 *  and the name taken is recorded, so a later one never meets it. */
export function claim(taken: Set<string>, slug: string): string {
  let name = slug
  for (let n = 2; taken.has(name); n++) name = `${slug}-${n}`
  taken.add(name)
  return name
}
