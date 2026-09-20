/* ─────────────────────────────────────────── Story 5.10 — THE SECTION PICKER, AS DATA (FR-D12, S5a).
 *
 * ONE PURE QUERY DECIDES WHAT MAY BE PLACED HERE, and the rail, the grid, the counts and every empty state are
 * readers of that one answer — so a design that cannot work is never drawn rather than drawn and refused (UX-DR3,
 * R-33, R-68). The query itself is the library's (`offeredOn`: `isPlaceable` ∧ `compileTarget` ∧ a non-empty
 * `bindingContext` intersection); this module is the picker's own shape over it.
 *
 * PURE AND IMPORTLESS BUT FOR THE LIBRARY, because `node --test` strips types and cannot load a `.tsx`
 * (`lib/device.ts` is the standing precedent, `kit-button.test.ts:6-7` the reason). Everything the picker decides
 * lives here and `picker.test.ts` asserts the I/O matrix's rows over it.
 *
 * COUNTS ARE DERIVED, NEVER WRITTEN DOWN (standing rule). A category's count is a runtime figure over what is
 * offered ON THIS CANVAS, and so is the `All sections` row's (R-154): what is offered HERE, counted at runtime —
 * never the library's total, which A7 item 1 deleted from S5a and S5c on purpose.
 */

import { byCategory, offeredOn, type SectionRegistryEntry } from '@inflozo/library'

/** One rail row: the category, the words S5a prints and how many of its designs this canvas can take. */
export type RailRow = { category: string; title: string; count: number }

/** Every design this canvas can take, in the library's own id order. The one filter; everything below reads it.
 *
 *  TWO FILES, NOT ONE, AND R-152 IS WHY: a site-wide design compiles into `default.hbs` and is offered on EVERY
 *  canvas, because one header shows on every template — so a picker opened on Home that asked only about `home.hbs`
 *  would offer no way to add a header at all. Where each one LANDS is `isSiteWide`'s question, not this one's. */
export const offeredHere = (
  entries: Readonly<Record<string, SectionRegistryEntry>>,
  file: string,
  siteFile: string,
): SectionRegistryEntry[] =>
  Object.values(entries)
    .filter((e) => offeredOn(e, file) || offeredOn(e, siteFile))
    .sort((a, b) => byCategory(a.category, b.category) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

/** S5a's rail, in NUMERIC category order — `a17` after `a4`, which a string sort gets wrong. A category with
 *  nothing offered here has no row, which is how a non-placeable treatment's category is absent rather than empty. */
export function rail(offered: readonly SectionRegistryEntry[]): RailRow[] {
  const by = new Map<string, RailRow>()
  for (const e of offered) {
    const row = by.get(e.category) ?? { category: e.category, title: e.categoryTitle, count: 0 }
    row.count += 1
    by.set(e.category, row)
  }
  return [...by.values()].sort((a, b) => byCategory(a.category, b.category))
}

/** The search, over a design's own name and its category's — the two words on the card and in the rail. Untrimmed
 *  input and any case, because a customer types neither carefully. An empty query matches everything. */
export const matches = (entry: SectionRegistryEntry, query: string): boolean => {
  const q = query.trim().toLowerCase()
  return q === '' || entry.name.toLowerCase().includes(q) || entry.categoryTitle.toLowerCase().includes(q)
}

/** The cards the grid draws: the offered designs narrowed by the search, and — only while nothing is searched for —
 *  by the chosen category. A SEARCH CROSSES THE RAIL (UX-DR6): the category list stays exactly where it is and the
 *  grid answers for the whole canvas, which is why typing `zzzz` empties the grid and never the rail. */
export const cards = (offered: readonly SectionRegistryEntry[], category: string | null, query: string): SectionRegistryEntry[] =>
  offered.filter((e) => (query.trim() === '' ? category === null || e.category === category : matches(e, query)))

/** S5a's header line, as the owner's test of 2026-09-20 cut it: the COUNT, and S5c's ` · dark mode` when the dark
 *  preview is on. S5a`:81` also printed `· shown in your pack: {pack}` and he removed it — every preview is in his
 *  own pack by construction, so the line was stating the surface's premise rather than telling him anything. The
 *  count is the cards drawn, derived here and nowhere written. */
export const metaLine = (count: number, dark: boolean): string =>
  `${count} ${count === 1 ? 'design' : 'designs'}${dark ? ' · dark mode' : ''}`

/** THE THREE EMPTY STATES, none of which the export draws (R-74, extrapolated from S5a and S5c; the rule, not the
 *  sentence, is `EXPERIENCE.md:346`). Each says what is true and what to do — never an apology, never a blank. */
export function emptyState(offeredCount: number, cardCount: number, query: string): { title: string; instruction: string } | null {
  if (cardCount > 0) return null
  // NOTHING CAN BE PLACED HERE AT ALL — a canvas whose bindings no design declares
  if (offeredCount === 0) {
    return {
      title: 'No sections fit this template yet',
      instruction: 'This page can only take sections built for it, and none of them are in the library yet. Try another template from the switcher at the top.',
    }
  }
  if (query.trim() !== '') {
    return { title: `Nothing matches “${query.trim()}”`, instruction: 'Try a shorter word, or pick a category on the left to browse everything that fits this page.' }
  }
  // a category row exists only where something is offered, so this is reachable only by a stale selection
  return { title: 'Nothing in this category here', instruction: 'Pick another category on the left — the list shows only what this page can take.' }
}

/** Is this design SITE-WIDE — one shared instance on every template, rather than this canvas's own? Derived from
 *  the design's own compile target, so R-152's globe and the doc a placement is written to answer one question.
 *  `siteFile` is `SITE.file`; nothing here learns the name `default.hbs` twice. */
export const isSiteWide = (entry: { compileTarget: readonly string[] }, siteFile: string): boolean =>
  entry.compileTarget.includes(siteFile)

/** R-152's words: the globe's hover `title` AND its accessible name, so the two can never differ. */
export const SITE_WIDE_WORDS = 'Site-wide — shows on every template'

/** WHERE A PLACEMENT LANDS IN THE CANVAS'S OWN DOC, as one number (the I/O matrix's four open rows).
 *
 *  `stack` is what Layers and the canvas show — the site-wide sections outside `a3/`, then this canvas's own, then
 *  the `a3/` footers (`canvasStack`) — and `invokedAt` counts how many of the canvas's OWN sections sit at or
 *  before the invoking one. So the "+" under a site-wide header inserts at the top of the page's own stack, the
 *  "+" under its last section appends, and `⌘K` with nothing selected (`from` null) lands at the end.
 *
 *  A SITE-WIDE DESIGN NEVER USES THIS: the stack order is DERIVED (`editor.test.ts:103`), so a header cannot land
 *  between two canvas sections however it was invoked — which is the whole reason R-152 puts the globe on the card
 *  before the press instead of a sentence after it. */
export function invokedAt(stack: readonly { doc: string }[], ownDoc: string, from: number | null): number {
  const own = stack.filter((i) => i.doc === ownDoc).length
  if (from === null || from < 0 || from >= stack.length) return own
  return stack.slice(0, from + 1).filter((i) => i.doc === ownDoc).length
}

/** A CARD'S SHAPE, FROM THE SECTION'S OWN DRAWN ASPECT — its height at Desktop width, measured once by the preview
 *  (the owner's test of 2026-09-20, which found a four-column grid of equal tiles unreadable for the sections that
 *  are not square). A BAND is far wider than it is tall — a header, an announcement bar — and spans two columns so
 *  it can be seen at all; a FEED is far taller and spans two rows. Everything between is one tile, and a card whose
 *  preview has not been drawn yet is one tile too, because nothing is known about it.
 *
 *  ponytail: two guessed thresholds, not a rule — WIDE_UNDER is a section shorter than 288px at Desktop width and
 *  TALL_OVER one taller than about a viewport. Move them if a real design lands in the wrong shape; the grid reads
 *  this function and nothing else reads the numbers. */
export const WIDE_UNDER = 0.2
export const TALL_OVER = 0.7
export const spanFor = (aspect: number): 'wide' | 'tall' | null =>
  aspect <= 0 ? null : aspect < WIDE_UNDER ? 'wide' : aspect > TALL_OVER ? 'tall' : null
