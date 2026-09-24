/* ─────────────────────────────────────────── Story 5.13 — THE CONTENT-SOURCE PILL AND THE PREVIEW SUBJECT, AS DATA.
 *
 * FR-D15 says the canvas must state what it is made of; FR-D22 says the subject a single-resource canvas renders is a
 * STATED choice and not an accident. Everything both of them decide that is not a pixel lives here: the words B9's
 * pill prints, the rows D5e's menu lists, the filter its search runs, and the two sentences a fallback owes.
 *
 * PURE AND IMPORTLESS BUT FOR THE LIBRARY AND `lib/live-content.ts` (itself importless), because `node --test` strips
 * types and cannot load a `.tsx` (`lib/picker.ts` is the standing precedent and `kit-button.test.ts:6-7` the reason).
 * `preview-subject.test.ts` and `live-content.test.ts` assert the I/O matrices' rows over it.
 *
 * THE SOURCE IS AN ARGUMENT, WHICH IS THE WHOLE OF R-165 — and Story 5.18 moved it. The pill describes the canvas and
 * never the paperwork: "Sample content" wherever the canvas shows the bundled publication, the site's own name wherever
 * it shows the site's content. `subjectOptions` is handed the connected site's rows in the same shape (`siteSubjects`)
 * and rebuilds nothing; `SubjectSource` gained the site's `pages`, which the bundled publication has none of.
 *
 * WHICH CANVASES HAVE A SUBJECT IS DERIVED (standing rule 3): `nativeResourceOf` is the library's one query over
 * `placement.ts`'s `NATIVE` table, so the Picker's filter and the subject's existence can never disagree about a
 * template and no list of four is written down (standing rule 4).
 */

import { nativeResourceOf, orbitWeekly } from '@inflozo/library'
import { LISTS, LIVE_WORDS, onClock, type Look } from './live-content.ts'

export type SubjectKind = orbitWeekly.SubjectKind
export type Subject = orbitWeekly.Subject

/** B9's words, both halves of the first one — and since Story 5.18 the SOURCE group's, the causes after a failure and
 *  every sentence the site row says, which are `lib/live-content.ts`'s (`LIVE_WORDS`) so the pill, D5e, `#editor-said`
 *  and the deployed walk read one list (R-170). The site's own half is its name, which is the site's and not a word. */
export const SOURCE_WORDS = { lead: 'Previewing with:', ...LIVE_WORDS } as const

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

/** WHERE THE ROWS COME FROM — the seam Story 5.18 moves. It gained `pages`, which the bundled publication has none of
 *  beyond its style-guide fixture and the connected site does. */
export type SubjectSource = {
  posts: readonly PostLike[]
  pages: readonly PostLike[]
  tags: readonly TaxonomyLike[]
  authors: readonly TaxonomyLike[]
  /** the two style-guide fixtures. They are in NO feed by construction (`dataset.json`'s note), which is why they
   *  are handed over separately and lead their own list. */
  styleGuide: Readonly<Record<'post' | 'page', PostLike>>
}

const styleGuide = () => ({ post: orbitWeekly.subject('post') as unknown as PostLike, page: orbitWeekly.subject('page') as unknown as PostLike })

/** The bundled publication in that shape (R-165). */
export const bundledSource = (): SubjectSource => ({
  posts: orbitWeekly.posts() as unknown as PostLike[],
  pages: [],
  tags: orbitWeekly.tags(),
  authors: orbitWeekly.authors(),
  styleGuide: styleGuide(),
})

/** STORY 5.18 — THE CONNECTED SITE IN THAT SAME SHAPE, from the lists in hand (`LISTS`: the newest 100 posts, and pages,
 *  tags and writers to 100 each), dates on the site's own clock (DW-98). The style-guide entry still leads Post and
 *  Page: it is the one every design is designed against, whatever the source. A list not in hand is empty. */
export const siteSubjects = (look: Look, zone: string): SubjectSource => {
  const rows = (kind: SubjectKind) => (look(LISTS[kind])?.rows ?? []) as readonly Record<string, unknown>[]
  return {
    posts: rows('post').map((p) => onClock(p, zone)) as unknown as PostLike[],
    pages: rows('page').map((p) => onClock(p, zone)) as unknown as PostLike[],
    tags: rows('tag') as unknown as TaxonomyLike[],
    authors: rows('author') as unknown as TaxonomyLike[],
    styleGuide: styleGuide(),
  }
}

/** D5e's line under the search where the site holds more posts than the rows in hand (DW-248) — null where it does not. */
export const cappedPosts = (look: Look): string | null => {
  const posts = look(LISTS.post)
  return posts !== undefined && posts.total > posts.rows.length ? LIVE_WORDS.capped : null
}

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
 * exactly it, honestly; since Story 5.18 the connected site's own pages follow it. An archive lists the taxonomy
 * rows themselves, each with the count its own posts derive.
 */
export function subjectOptions(source: SubjectSource, kind: SubjectKind): SubjectRow[] {
  if (kind === 'post' || kind === 'page') {
    const fixture = source.styleGuide[kind]
    const head: SubjectRow = { slug: fixture.slug, title: STYLE_GUIDE[kind].title, meta: null, caption: STYLE_GUIDE[kind].caption, hasImage: typeof fixture.feature_image === 'string' && fixture.feature_image !== '' }
    return [head, ...(kind === 'page' ? source.pages : source.posts).map(postRow)]
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

/* D5e'S OWN WORDS, AND WHY THESE TWO ARE NOT `KIND_WORDS`. The frame draws the menu's chrome in the RESOURCE's word
   — `SUBJECT · WHICH POST THIS CANVAS RENDERS`, `Search posts` — and its rows in the customer's — `Style-guide
   article`. That is the export, so that is what is built (R-74): the chrome takes the kind's own word, verbatim on
   the canvas D5e was drawn for and extrapolated the same way on the three it was not, while every SENTENCE the
   customer reads keeps `KIND_WORDS`. */

/** D5e's group heading (`D5 …:212`), per kind. */
export const SUBJECT_HEADING = (kind: SubjectKind): string => `SUBJECT · WHICH ${kind.toUpperCase()} THIS CANVAS RENDERS`

/** D5e's search placeholder (`D5 …:215`). */
export const SEARCH_WORDS = (kind: SubjectKind): string => `Search ${kind}s`

/** D5e's helper line, at the foot of the menu. The post wording is the frame's, verbatim; an archive's says the same
 *  thing about the filter, which is what its subject changes. */
export const SUBJECT_HELP = (kind: SubjectKind): string =>
  kind === 'post' || kind === 'page'
    ? `This canvas renders one ${kind}. Which one changes what you see, because a ${kind} with a feature image and one without are different shapes.`
    : `This canvas renders one ${kind}'s archive. Which one changes what you see, because an archive shows that ${kind}'s own posts and no others.`

/** The one sentence the write is allowed to fail with. The choice still stands on the canvas for this session — the
 *  canvas has already repainted — so what the customer needs to know is that it will not survive a reload. */
export const SAVE_REFUSED = "We couldn't save that choice, so this page will go back to its usual one when you reload."
