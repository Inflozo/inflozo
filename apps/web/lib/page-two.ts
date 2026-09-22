/* ─────────────────────────────────────────── Story 5.16 — PAGE 2 (FR-D21, D5d, R-176 to R-180), AS DATA.
 *
 * Where a page lists posts across more than one page, its page 2 can be seen and DESIGNED: page 2 — and every later
 * page, which shows its design (R-177) — is a design of its own, stored under its own key (`lib/editor.ts`'s
 * `PAGE_TWO`). It STARTS AS AN EXACT COPY OF PAGE 1 and follows page 1, stored nowhere, until the first change made on
 * page 2 stores that copy with the change (R-179, AD-22); from then on nothing done on page 2 changes page 1 (R-178).
 * The header and footer are the one exception: the whole site has one of each (FR-D5), so a change to one made on page
 * 2 changes it everywhere, once FR-D5's dialog has asked in the words below (R-180).
 *
 * Everything that decides it and is not a pixel lives here: the words (R-170, one name each), whether this canvas has
 * a page 2 at all (R-176), the page in force and why, the page-aware own key and file, and the stack a page paints —
 * so the canvas, Layers, the panel, the picker's insert position and every edit read ONE stack. PURE, and its imports
 * are the library, the runtime and the URL scheme: `node --test` strips types but cannot load a `.tsx`, and
 * `page-two.test.ts` asserts the I/O matrix's rows over it on the real library.
 *
 * VIEWING PAGE 2 IS A CANVAS STATE (`EXPERIENCE.md:230`'s modes): session state beside the device, View as and
 * Preview — never in the URL, never stored, and back to page 1 on a change of canvas. NO KEY: "states added after the
 * shortcut map carry no shortcut, deliberately" (`EXPERIENCE.md:392-393`, FR-D11), so `lib/keymap.ts` gains no row.
 */

import { orbitWeekly } from '@inflozo/library'
import { isDesigned, pageTwoStack, type DocInstance, type ProjectDoc, type SynthesisLibrary } from '@inflozo/section-runtime'
import { CANVASES, canvasOfPageTwoKey, canvasOfTemplateKey, canvasStack, PAGE_TWO, SITE, templateKeyOf, type CanvasKey } from './editor.ts'
import { EMPTY_DOC } from './round-trip.ts'

/** The page a canvas shows: its first, or its second — which stands for every later page (R-177). */
export type Page = 1 | 2

/** A section on the canvas, by the doc that stores it and the file it renders at. */
export type Placed = DocInstance & { target: string; doc: string }

type Docs = Readonly<Record<string, ProjectDoc>>
type Subject = orbitWeekly.Subject | null | undefined

/* ── THE WORDS (R-170: one name for one thing, wherever it is shown) ──────────────────────────────────────────── */

/** D5d's pill, and `EXPERIENCE.md:270`'s canonical pair — "Page 2" with "Back to page 1". */
export const PAGE_TWO_WORDS = 'Page 2'
export const BACK_TO_PAGE_ONE = 'Back to page 1'
/** D5d's row (`:429`), on the main feed's panel. */
export const PREVIEW_PAGE = 'Preview page'
/** …and the helper caption under it, the owner's R-181: page 2 stands for every later page (R-177). */
export const LATER_PAGES = "Pages 3, 4, 5 and on use page 2's design."
/** Page 2's marker in Layers while it follows page 1 — D5a's row, with its own sentence. */
export const COPY_MARKER = 'Copy of page 1 — edit anything to make page 2 its own'
/** What `#editor-said` says, politely, as the page changes. */
export const ENTERED_SAID = `${PAGE_TWO_WORDS}.`
export const LEFT_SAID = `${BACK_TO_PAGE_ONE}.`
/** …and when the canvas went back to page 1 without being asked to, why — never a paint of a page that does not exist. */
export const leftBecause = (reason: string) => `${BACK_TO_PAGE_ONE}: ${reason}`
/** R-180's ask: FR-D5's own site-wide dialog, adapted to a CHANGE made on page 2. It opens on Cancel. */
export const SITE_WIDE_ASK = {
  title: (name: string) => `Change ${name} everywhere?`,
  body:
    'This section is site-wide: it is one shared thing that appears on every page of your site, so changing it on ' +
    'page 2 changes it on page 1 and every other page too.',
  cancel: 'Cancel',
  confirm: 'Change it everywhere',
} as const

/* ── WHETHER THERE IS A PAGE 2 (R-176) ────────────────────────────────────────────────────────────────────────── */

/** A page's main feed: its first instance designated `isMainFeed`, shown or hidden — read here, never written (the
 *  designation and its lifecycle are Story 5.19's). */
export const mainFeedOf = (doc: ProjectDoc | null | undefined): DocInstance | undefined => doc?.instances.find((i) => i.isMainFeed)

const NO_PAGES = 'this page has no page 2.'
const NO_FEED = 'this page no longer has a main list of posts, so it has no page 2.'
const ONE_PAGE = (kind: string) => `this ${kind}'s posts all fit on one page, so it has no page 2.`

/**
 * WHY THIS CANVAS HAS NO PAGE 2 RIGHT NOW, or null where it has one. Ghost serves `/page/2/` only where the list runs
 * past one page and answers 404 beyond the last (`routing/controllers/channel.js:55-60`), so page 2 exists exactly
 * where the canvas paginates, its page 1 has a main feed to carry the row, and the list that feed renders — the whole
 * feed on Home, the subject's own posts on an archive — runs to a second page. Nothing is invented (FR-H3).
 */
export function noPageTwo(canvas: CanvasKey, docs: Docs, subject: Subject): string | null {
  if (PAGE_TWO[canvas] === undefined) return NO_PAGES
  if (mainFeedOf(docs[templateKeyOf(canvas)]) === undefined) return NO_FEED
  if (orbitWeekly.feedPages(CANVASES[canvas].file, subject) < 2) return ONE_PAGE(subject?.kind ?? 'page')
  return null
}

export const offersPageTwo = (canvas: CanvasKey, docs: Docs, subject: Subject): boolean => noPageTwo(canvas, docs, subject) === null

/** THE PAGE IN FORCE: the one asked for, unless page 2 was asked for where it has stopped existing — a subject whose
 *  archive fits one page, a page 1 that lost its main feed to an undo — and then page 1, with the reason to say. */
export function pageInForce(asked: Page, canvas: CanvasKey, docs: Docs, subject: Subject): { page: Page; reason: string | null } {
  if (asked === 1) return { page: 1, reason: null }
  const why = noPageTwo(canvas, docs, subject)
  return why === null ? { page: 2, reason: null } : { page: 1, reason: why }
}

/* ── WHAT PAGE 2 IS (R-178, R-179) ────────────────────────────────────────────────────────────────────────────── */

/** Does this canvas's page 2 FOLLOW page 1 — no design of its own stored, or one with no instances (AD-22)? */
export const follows = (docs: Docs, canvas: CanvasKey): boolean => {
  const two = PAGE_TWO[canvas]
  return two !== undefined && !isDesigned(docs[two.key] ?? EMPTY_DOC)
}

/** Page 2's doc AS IT IS SHOWN AND EDITED: its own design, or while it follows, the live copy of page 1 — the
 *  runtime's `pageTwoStack`, the one implementation Story 7.3's compiler calls too (AD-27(d)). */
export function pageTwoOf(docs: Docs, canvas: CanvasKey, library: SynthesisLibrary): ProjectDoc {
  const two = PAGE_TWO[canvas]
  if (two === undefined) return EMPTY_DOC
  return { schemaVersion: 1, instances: pageTwoStack(CANVASES[canvas].file, docs[templateKeyOf(canvas)], docs[two.key], library).instances }
}

/** The doc the editor EDITS under a stored key: a page-2 key's is `pageTwoOf`'s, every other key's is its own. Every
 *  edit reads it here, so the first change on a following page 2 is made to the copy and stores it. */
export const editedDoc = (docs: Docs, key: string, library: SynthesisLibrary): ProjectDoc | undefined => {
  const canvas = canvasOfPageTwoKey(key)
  return canvas === null ? docs[key] : pageTwoOf(docs, canvas, library)
}

/** THE PAGE-AWARE OWN KEY — the doc this canvas edits on the page in force. The preview SUBJECT stays the canvas's. */
export const ownKeyOf = (canvas: CanvasKey, page: Page): string =>
  (page === 2 ? PAGE_TWO[canvas]?.key : undefined) ?? templateKeyOf(canvas)

/** The file the page's own sections render at: `index.hbs` for Home's page 2, where Ghost renders `/page/2/`
 *  (`templates.js:67` puts `home.hbs` first only at exactly `/`), and an archive's own file on both of its pages. */
export const pageFileOf = (canvas: CanvasKey, page: Page): string =>
  (page === 2 ? PAGE_TWO[canvas]?.file : undefined) ?? CANVASES[canvas].file

/** THE STACK A PAGE PAINTS, and Layers lists, and every edit is aligned with: the site-wide rows around the page's own
 *  — on page 2, page 2's doc (its own, or the copy), stamped with page 2's key and file. Because page 2's rows are a
 *  whole doc, nothing downstream (the roots, the picks, ⌘K's insert position, the pill's drag) needs a page-2 branch. */
export function stackOf(docs: Docs, canvas: CanvasKey, page: Page, library: SynthesisLibrary): Placed[] {
  const key = ownKeyOf(canvas, page)
  const target = pageFileOf(canvas, page)
  const own = key === templateKeyOf(canvas) ? docs[key] : pageTwoOf(docs, canvas, library)
  return canvasStack(
    (docs[SITE.key]?.instances ?? []).map((i) => ({ ...i, target: SITE.file as string, doc: SITE.key as string })),
    (own?.instances ?? []).map((i) => ({ ...i, target, doc: key })),
  )
}

/** The pages that are a LIVE COPY of the doc just changed: the page 2 of that canvas, while it follows page 1. A change
 *  to page 1 changes them too, so R-167's record runs out for them as well (`afterChange`'s `followers`). */
export function followersOf(docs: Docs, touched: string): string[] {
  const canvas = canvasOfTemplateKey(touched)
  const two = canvas === null ? undefined : PAGE_TWO[canvas]
  return canvas !== null && two !== undefined && follows(docs, canvas) ? [two.key] : []
}

/** The main feed as it sits on the page on screen — the section whose panel carries D5d's row: page 1's first
 *  `isMainFeed` instance, and on page 2 its copy, where the row is the way back. */
export function mainFeedOn(docs: Docs, canvas: CanvasKey, page: Page, library: SynthesisLibrary): { doc: string; instanceId: string } | null {
  const doc = page === 2 ? pageTwoOf(docs, canvas, library) : docs[templateKeyOf(canvas)]
  const feed = mainFeedOf(doc)
  return feed === undefined ? null : { doc: ownKeyOf(canvas, page), instanceId: feed.instanceId }
}

/** THE SELECTION CARRIED ACROSS THE SWITCH: a site-wide section is on every page, and a section of the page goes to the
 *  same section on the other page where it exists — the copy keeps page 1's ids, so it always does while page 2
 *  follows — and to nothing where it does not. */
export function carry(
  pick: { doc: string; instanceId: string } | null,
  to: Page,
  canvas: CanvasKey,
  docs: Docs,
  library: SynthesisLibrary,
): { doc: string; instanceId: string } | null {
  if (pick === null || pick.doc === SITE.key) return pick
  const doc = to === 2 ? pageTwoOf(docs, canvas, library) : docs[templateKeyOf(canvas)]
  return doc?.instances.some((i) => i.instanceId === pick.instanceId) ? { doc: ownKeyOf(canvas, to), instanceId: pick.instanceId } : null
}
