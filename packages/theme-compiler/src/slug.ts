// THE PARTIAL SLUG, AND ITS COLLISION RULE — Story 7.1, R2-10's "stated function" (spec § The partial slug).
//
// A layer name becomes a section partial's file name. The rule is §7.4's custom-template rule plus a length cap, so the
// product keeps ONE rule for a name that becomes a file: NFKD, combining marks dropped, `toLowerCase` (never a locale
// form, AD-1), spaces and underscores to `-`, everything outside `[a-z0-9-]` dropped, runs of `-` collapsed and trimmed,
// cut to `SLUG_MAX` and trimmed again. DETERMINISTIC IS NOT UNIQUE — `Hero` and `HERO` slug alike — so names are handed out per
// directory in placement order, each its slug while free and otherwise the first free `-2`, `-3`, …

import { LAYER_NAME_MAX } from '@inflozo/section-runtime'

/** The longest slug, before a collision suffix — the longest layer name (DW-338, Story 7.21): one cap, so the file name and
 *  the label in its boundary comment agree. */
export const SLUG_MAX = LAYER_NAME_MAX

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

/** STORY 7.26 (DW-336) — WINDOWS' RESERVED DEVICE NAMES: a file named `con.hbs` (or `nul`, `aux`, `prn`, `com0`–`com9`, `lpt0`–`lpt9`,
 *  with any extension and in any case) cannot be extracted from a zip on Windows. `partialSlug` already lowercases and NFKD-folds
 *  (`com¹` → `com1`), so treating these as TAKEN in `claim` suffixes every section partial that would meet one (`con` → `con-2`) —
 *  in the compile, so a deploy and an export of one project never differ. `console`, `com10` and a bare `lpt` are no device. */
export const RESERVED: ReadonlySet<string> = new Set(['con', 'prn', 'aux', 'nul', ...[...'0123456789'].flatMap((d) => [`com${d}`, `lpt${d}`])])

/** The collision rule, over one directory's names: `slug` while it is free, else the first free `slug-2`, `slug-3`, … —
 *  and the name taken is recorded, so a later one never meets it. A Windows device name (`RESERVED`) is never free. */
export function claim(taken: Set<string>, slug: string): string {
  let name = slug
  for (let n = 2; taken.has(name) || RESERVED.has(name); n++) name = `${slug}-${n}`
  taken.add(name)
  return name
}
