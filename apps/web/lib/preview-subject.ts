/* ─────────────────────────────────────────── Story 5.13 — THE CONTENT-SOURCE PILL AND THE PREVIEW SUBJECT, AS DATA.
 *
 * FR-D15 says the canvas must state what it is made of; FR-D22 says the subject a single-resource canvas renders is a
 * STATED choice and not an accident. Everything both of them decide that is not a pixel lives here: the words B9's
 * pill prints, the rows D5e's menu lists, the filter its search runs, and the two sentences a fallback owes.
 *
 * PURE AND IMPORTLESS BUT FOR THE LIBRARY, because `node --test` strips types and cannot load a `.tsx`
 * (`lib/picker.ts` is the standing precedent and `kit-button.test.ts:6-7` the reason). `preview-subject.test.ts`
 * asserts the I/O matrix's rows over it.
 *
 * THE SOURCE IS AN ARGUMENT, WHICH IS THE WHOLE OF R-165. Today every canvas in the product previews with the
 * bundled publication, so the pill reads "Sample content" on every project — INCLUDING one whose `linked_site_id`
 * Story 3.4 already set, because the pill describes the canvas and never the paperwork. Story 5.18 hands
 * `subjectOptions` the connected site's rows in the same shape and rebuilds nothing.
 *
 * WHICH CANVASES HAVE A SUBJECT IS DERIVED (standing rule 3): `nativeResourceOf` is the library's one query over
 * `placement.ts`'s `NATIVE` table, so the Picker's filter and the subject's existence can never disagree about a
 * template and no list of four is written down (standing rule 4).
 */

import { nativeResourceOf, orbitWeekly } from '@inflozo/library'

export type SubjectKind = orbitWeekly.SubjectKind
export type Subject = orbitWeekly.Subject

/** B9's words, both halves of the first one. The SOURCE half is the same on every project today (R-118: B9's
 *  connected state and its SOURCE group arrive with Story 5.18, absent until then and never greyed). */
export const SOURCE_WORDS = { lead: 'Previewing with:', sample: 'Sample content' } as const

/** Does this canvas render ONE resource, and so have a subject to name and a menu to open? */
export const hasSubject = (file: string): boolean => nativeResourceOf(file) !== null

/** The word this kind goes by in a sentence the customer reads — never the template's name. */
const KIND_WORDS: Readonly<Record<SubjectKind, string>> = { post: 'article', page: 'page', tag: 'tag', author: 'author' }

/** One row of D5e's SUBJECT group. */
export type SubjectRow = {
  slug: string
  /** what the row prints as its name: a post's title, a taxonomy's `name` */
  title: string
  /** D5e's second line — a post's date, or an archive row's DERIVED post count. Null on the style-guide entry,
   *  which carries a caption there instead. */
  meta: string | null
  /** the style-guide entry's own caption. D5e draws that row with a glyph, a caption and no date. */
  caption: string | null
  /** D5e's marker, and its own note on it: "the marker never travels alone — `has image` is the words, and the
   *  glyph is decoration beside them". It is the whole reason this surface exists: FR-H8's media guard removes the
   *  ELEMENT, so a subject with a picture and one without are genuinely different pages. */
  hasImage: boolean
}

type PostLike = { slug: string; title: string; published_at: string; feature_image?: string | null }
type TaxonomyLike = { slug: string; name: string; count: { posts: number } }

/** WHERE THE ROWS COME FROM — the seam Story 5.18 moves and nothing else. */
export type SubjectSource = {
  posts: readonly PostLike[]
  tags: readonly TaxonomyLike[]
  authors: readonly TaxonomyLike[]
  /** the two style-guide fixtures. They are in NO feed by construction (`dataset.json`'s note), which is why they
   *  are handed over separately and lead their own list. */
  styleGuide: Readonly<Record<'post' | 'page', PostLike>>
}

/** The bundled publication in that shape (R-165). */
export const bundledSource = (): SubjectSource => ({
  posts: orbitWeekly.posts() as unknown as PostLike[],
  tags: orbitWeekly.tags(),
  authors: orbitWeekly.authors(),
  styleGuide: { post: orbitWeekly.subject('post') as unknown as PostLike, page: orbitWeekly.subject('page') as unknown as PostLike },
})

/** D5e's style-guide entry, the row it draws first and ticks. */
const STYLE_GUIDE: Readonly<Record<'post' | 'page', { title: string; caption: string }>> = {
  post: { title: 'Style-guide article', caption: 'The one every post design is designed against' },
  page: { title: 'Style-guide page', caption: 'The one every page design is designed against' },
}

/** `2026-08-28` → `28 Aug 2026`. Parsed from the ISO string itself rather than through `Date` or `Intl`: both read
 *  the host's zone or locale, and a date that moved by a day between two machines would be a bug nobody could see. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const dateWords = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m === null ? '' : `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`
}

/** An archive row's own size, DERIVED from the rows and never written down (standing rule 4). */
export const postsWords = (n: number): string => `${n} post${n === 1 ? '' : 's'}`

const postRow = (p: PostLike): SubjectRow => ({
  slug: p.slug,
  title: p.title,
  meta: dateWords(p.published_at),
  caption: null,
  hasImage: typeof p.feature_image === 'string' && p.feature_image !== '',
})

/**
 * THE ROWS D5e LISTS for this canvas, the style-guide entry first.
 *
 * A PAGE HAS NO FEED. The bundled publication holds one page — the style-guide fixture — so the Page canvas lists
 * exactly it, honestly, and fills the day Story 5.18 reads the customer's own pages. An archive lists the taxonomy
 * rows themselves, each with the count its own posts derive.
 */
export function subjectOptions(source: SubjectSource, kind: SubjectKind): SubjectRow[] {
  if (kind === 'post' || kind === 'page') {
    const fixture = source.styleGuide[kind]
    const head: SubjectRow = { slug: fixture.slug, title: STYLE_GUIDE[kind].title, meta: null, caption: STYLE_GUIDE[kind].caption, hasImage: typeof fixture.feature_image === 'string' }
    return kind === 'page' ? [head] : [head, ...source.posts.map(postRow)]
  }
  return (kind === 'tag' ? source.tags : source.authors).map((r) => ({
    slug: r.slug,
    title: r.name,
    meta: postsWords(r.count.posts),
    caption: null,
    hasImage: false,
  }))
}

/** D5e's search, over the rows already in hand: client-side, pure, and nothing is fetched (the I/O matrix). */
export function filterSubjects(rows: readonly SubjectRow[], query: string): SubjectRow[] {
  const q = query.trim().toLowerCase()
  return q === '' ? [...rows] : rows.filter((r) => r.title.toLowerCase().includes(q))
}

/** What the pill's SECOND half prints: the chosen row's own name. A subject with no row left — which only a stored
 *  value that has gone can be, and `resolveSubject` has already fallen back by then — prints its slug rather than
 *  nothing, because a pill whose job is to say what the canvas is made of must never go blank. */
export const subjectLabel = (subject: Subject, rows: readonly SubjectRow[]): string =>
  rows.find((r) => r.slug === subject.slug)?.title ?? subject.slug

/** FR-D22's "says so": what the menu carries, and what `#editor-said` announces, when a stored subject has gone.
 *  The choice is KEPT, not deleted — a resource that comes back brings it with it — and the sentence says that,
 *  because a silent fallback is the same failure as an empty canvas. */
export const GONE = (subject: Subject): string =>
  `The ${KIND_WORDS[subject.kind]} this page was set to show is no longer there, so it is showing the one it starts with. Your choice is kept in case it comes back.`

/** The polite announcement a choice makes (`#editor-said`, the editor's one live region — never a toast). */
export const SUBJECT_SAID = (subject: Subject, rows: readonly SubjectRow[]): string =>
  `Previewing the ${KIND_WORDS[subject.kind]} ${subjectLabel(subject, rows)}.`

/** D5e's group heading, per kind — the frame's own words with the kind in them. */
export const SUBJECT_HEADING = (kind: SubjectKind): string => `SUBJECT · WHICH ${KIND_WORDS[kind].toUpperCase()} THIS CANVAS RENDERS`

/** D5e's search placeholder. */
export const SEARCH_WORDS = (kind: SubjectKind): string => `Search ${KIND_WORDS[kind]}s`

/** D5e's helper line, at the foot of the menu. The post wording is the frame's, verbatim; an archive's says the same
 *  thing about the filter, which is what its subject changes. */
export const SUBJECT_HELP = (kind: SubjectKind): string =>
  kind === 'post' || kind === 'page'
    ? `This canvas renders one ${kind}. Which one changes what you see, because a ${kind} with a feature image and one without are different shapes.`
    : `This canvas renders one ${kind}'s archive. Which one changes what you see, because an archive shows that ${kind}'s own posts and no others.`

/** The one sentence the write is allowed to fail with. The choice still stands on the canvas for this session — the
 *  canvas has already repainted — so what the customer needs to know is that it will not survive a reload. */
export const SAVE_REFUSED = "We couldn't save that choice, so this page will go back to its usual one when you reload."
