/* ─────────────────────────────────────────── Story 5.19 — THE MAIN FEED AND P0·5's DATA GROUP, AS WORDS AND RULES.
 *
 * Every sentence the Layers chip, the `⋯` menu, the canvas chip, the panel's Data group and `#editor-said` say about
 * the main feed and a list of posts, and the small rules that decide which one is said — the per-value notes (a tag,
 * a writer or a pick the source in force does not hold), the 25-pick threshold and a fixed query's cap. The Data rows
 * themselves, and their greyed sentences, are the engine's (`@inflozo/section-runtime`'s `sidebar` and `DATA_WORDS`), so
 * a row the panel draws and a row the emitters fold cannot disagree; `data-group.test.ts` holds this file's words and
 * the engine's to the spec's table (R-170: one name per thing — "Source", "Count", "Order", "Main feed").
 *
 * PURE AND IMPORTLESS BUT FOR TYPES, as `lib/view-as.ts` is and for its reason: `node --test` strips types and cannot
 * load a `.tsx`, and the deployed walks read their expectations from here rather than restating them.
 */

/** D5c's chip — the words "Main feed", uppercased by CSS so a screen reader reads words (never "MAIN FEED" spelled). */
export const MAIN_FEED = 'Main feed'

/** D5c's Layers `⋯` item on a visible secondary feed of a paginated page. */
export const MAKE_MAIN_FEED = 'Make this the main feed'

/** `#editor-said`, polite: a reassignment, and the second half of a delete or hide that handed the flag on. */
export const NOW_MAIN = (name: string): string => `${name} is now the main feed.`

/** `#editor-said`, polite: a placement that designated. */
export const ADDED_AS_MAIN = (name: string): string => `${name} added as the main feed.`

/** A gesture's own sentence, then the transfer it caused — "Post grid removed. Three Up is now the main feed." A gesture
 *  that says nothing of its own (Hide) says the transfer alone. */
export const withTransfer = (own: string | null, to: string | null): string | null =>
  to === null ? own : own === null || own === '' ? NOW_MAIN(to) : `${own.replace(/[.]$/, '')}. ${NOW_MAIN(to)}`

/** A taxonomy row's size, as P0·5 draws it beside the name: "9 posts", and "1 post". */
export const postsCount = (n: number): string => `${n} ${n === 1 ? 'post' : 'posts'}`

/** Whose content a note names: the connected site by its one name (R-170), or the bundled sample. */
export type Held = { site: string } | 'sample'

/** A stored tag or writer the source in force does not hold — its select says so, and the list shows nothing. */
export const NOT_IN_SOURCE = (which: 'tag' | 'author', held: Held): string =>
  held === 'sample' ? 'Not in the sample content.' : which === 'tag' ? `Not a tag on ${held.site}.` : `Not an author on ${held.site}.`

/** A pick the source in force does not hold — its row stays, with this note, and the canvas draws nothing for it. */
export const PICK_LACKING = (held: Held): string =>
  held === 'sample' ? 'Not in the sample content.' : `Not on ${held.site} — unpublished or deleted.`

/** The picked list's words (P0·5). */
export const PICKED = (n: number): string => `${n} picked`
export const SEARCH_POSTS = 'Search posts to add'
export const NO_PICKS = 'No posts picked yet.'
/** review (2026-09-25) — a search (posts, tags or writers) that matches nothing says so rather than showing an empty list */
export const NO_MATCHES = 'Nothing matches.'
/** review (2026-09-25) — `aria-live`, the picked list: a pick added from the search and one removed with its × are said,
 *  as `movedTo` says a move, because the list changes under the control that changed it */
export const PICK_ADDED = (title: string): string => `${title} added.`
export const PICK_REMOVED = (title: string): string => `${title} removed.`
/** review (2026-09-25) — D5e's capped line for the tag and writer selects, read at the same limit as the posts: the
 *  fullest `n` are offered, and a stored value past them is not called missing */
export const CAPPED_LIST = (which: 'tag' | 'author', n: number): string => `Showing your ${n} fullest ${which === 'tag' ? 'tags' : 'writers'}.`

/** P0·5: past 25 picks the count turns warning-toned and this sentence appears. Nothing is blocked. */
export const SLOW_AFTER = 25
export const slow = (picks: number): boolean => picks > SLOW_AFTER
export const PAST_SLOW =
  'Past 25 picks this gets slow. Every pick adds a database query, on every page this section appears on — not once per section. Three hand-picked sections at 25 each is 75 database queries, about three-quarters of a second added to every visitor\'s page load.'
/** …and P0·5's two emphases inside it (`P0-5 Populate From Panel.dc.html:194`): `PAST_SLOW.split(PAST_SLOW_BOLD)` gives
 *  the bold phrases at the odd places, so the sentence stays one string. */
export const PAST_SLOW_BOLD = /(Every pick adds a database query, on every page this section appears on|75 database queries, about three-quarters of a second)/

/** A FIXED query's Hand-picked (R-108) at its cap: the search greys with this reason. */
export const HOLDS = (design: string, n: number): string =>
  `${design} shows ${n} ${n === 1 ? 'post' : 'posts'}, so it holds ${n} ${n === 1 ? 'pick' : 'picks'}.`

/** FR-H2's archive case, at the head of Layers while a Tag or Author page has no visible feed (D5a's marker's shape). */
export const FEEDLESS = (kind: 'Tag' | 'Author'): string =>
  `This ${kind} page has no list of posts. Ghost still serves its page 2 onwards, which would repeat page 1, so your theme asks search engines to skip them.`

/** One taxonomy row of the tag or writer select, from the rows in hand: its slug, name, post count and — a writer's —
 *  picture. The count is DERIVED from the row, never written down. */
export type Option = { slug: string; name: string; count: number; image: string | null }

const num = (v: unknown): number => (typeof v === 'number' ? v : 0)
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** The select's options, fullest first and a tie by name — R-193's own order, so the Source's first choice is the
 *  archive a live Tag page starts on. */
export function optionsOf(rows: readonly Readonly<Record<string, unknown>>[]): Option[] {
  return rows
    .map((r) => ({ slug: str(r['slug']), name: str(r['name']), count: num((r['count'] as { posts?: unknown } | undefined)?.posts), image: str(r['profile_image']) || null }))
    .filter((o) => o.slug !== '')
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
}

/** A writer with no photograph shows the first letter of the name Ghost supplied — ONE letter, always (P0·5, P0·8). */
export const initialOf = (name: string): string => [...name.trim()][0]?.toUpperCase() ?? ''

/** The posts the search offers: title contains the query, ignoring case, and none already picked. */
export function searchPosts<T extends { id: string; title: string }>(posts: readonly T[], query: string, picked: readonly { id: string }[]): T[] {
  const q = query.trim().toLowerCase()
  const taken = new Set(picked.map((p) => p.id))
  return posts.filter((p) => !taken.has(p.id) && (q === '' || p.title.toLowerCase().includes(q)))
}
