// THE MAIN FEED, AND THE ONE RULE THAT KEEPS EXACTLY ONE (Story 5.19 — FR-H2, AD-27(d)).
//
// On a natively paginated page — `home.hbs`, its page 2 `index.hbs`, `tag.hbs` and `author.hbs`, both pages of each —
// ONE list of posts renders the page's own `posts` and pages through them: the MAIN FEED. Every other list of posts on
// that page is a SECONDARY feed with a fixed query of its own (`feedQuery`). Which one is main is STORED on the instance
// (`isMainFeed`, AD-27) and never recomputed from position; this module is the rule that keeps the stored designation
// true, and nothing else writes the flag but `synthesize`'s own table.
//
// ONE RULE, ONE PLACE, SEVERAL DOORS. The editor passes every doc through `designate` where the doc ENTERS its state —
// the server read, the local hydrate, and every edit's `apply` — so placing, deleting, hiding, duplicating and
// reassigning a feed are one rule rather than five handlers; Story 7.3's compiler passes every stored doc through it the
// same way, so a doc written before the rule compiles with the main feed the canvas shows.
//
// IT REPAIRS, IT NEVER REFUSES. A doc that already satisfies the invariant comes back as THE SAME OBJECT, so a valid
// designation is never moved. Only a doc the lifecycle could never have produced is repaired — a feed with no flag (a
// Home written before the rule), two flags (a main feed duplicated before this story), a flag on a hidden feed while a
// visible one exists. A schema refine would instead black out a whole editor over a doc this rule can fix.
//
// PURE (AD-1): the library is HANDED in, in `synthesize`'s own shape, which is why `SynthesisEntry` carries
// `bindingContext`.

import { PAGINATED_TARGETS } from '@inflozo/library'
import type { DataBinding } from '@inflozo/library'
import { FEED_KEY, withData } from './controls.ts'
import type { DocInstance, ProjectDoc } from './doc-schema.ts'
import type { SynthesisEntry, SynthesisLibrary } from './synthesize.ts'

/** A FEED is a design that repeats the page's native `posts` — the same field `offeredOn` reads. */
export const isFeed = (entry: Pick<SynthesisEntry, 'bindingContext'> | undefined): boolean =>
  entry?.bindingContext.includes('posts') === true

const visibleFeed = (library: SynthesisLibrary) => (i: DocInstance) => !i.hidden && isFeed(library(i.designId))

/** The doc with the flag on `instanceId` alone (none for null); every instance whose flag is already right is kept as
 *  the same object. */
function flagOnly(doc: ProjectDoc, instanceId: string | null): ProjectDoc {
  return {
    ...doc,
    instances: doc.instances.map((i) => ((i.instanceId === instanceId) === i.isMainFeed ? i : { ...i, isMainFeed: i.instanceId === instanceId })),
  }
}

/** Where the flag goes when the main feed was deleted or hidden: the next visible feed BELOW where it stood, else the
 *  nearest one above — "the next feed section", read in page order. `previous` is the doc before the gesture. */
function transferTarget(doc: ProjectDoc, previous: ProjectDoc | undefined, library: SynthesisLibrary): DocInstance | undefined {
  const was = previous?.instances.find((i) => i.isMainFeed)
  if (previous === undefined || was === undefined) return undefined
  const at = previous.instances.findIndex((i) => i.instanceId === was.instanceId)
  const above = new Set(previous.instances.slice(0, at).map((i) => i.instanceId))
  const candidates = doc.instances.filter((i) => i.instanceId !== was.instanceId && visibleFeed(library)(i))
  return candidates.find((i) => !above.has(i.instanceId)) ?? [...candidates].reverse().find((i) => above.has(i.instanceId))
}

/**
 * THE INVARIANT, on a doc whose file is natively paginated (`PAGINATED_TARGETS`): at most one instance carries the flag;
 * it is a FEED; and whenever the doc holds a visible feed, the flag is on a visible feed. On any other file no instance
 * carries it. Returns the doc satisfying it — THE SAME OBJECT when it already does.
 *
 * The lifecycle (FR-H2) falls out of it: the first feed placed on a page with none takes the flag; deleting or hiding the
 * main feed hands it to the next visible feed below, else the nearest above (`previous` says where it stood); a hidden
 * main feed with no visible feed keeps it (5.16's "a hidden main feed is still the main feed"); showing a section never
 * takes it back; and a duplicate's copy is never main (`duplicateSection` writes it false, and a second flag is repaired
 * to the first visible one).
 */
export function designate(doc: ProjectDoc, file: string, library: SynthesisLibrary, previous?: ProjectDoc): ProjectDoc {
  const flagged = doc.instances.filter((i) => i.isMainFeed)
  if (!PAGINATED_TARGETS.has(file)) return flagged.length === 0 ? doc : flagOnly(doc, null)
  const feed = (i: DocInstance) => isFeed(library(i.designId))
  const visible = doc.instances.filter(visibleFeed(library))
  const holder = flagged.length === 1 && feed(flagged[0] as DocInstance) ? flagged[0] : undefined
  if (holder !== undefined && (!holder.hidden || visible.length === 0)) return doc
  if (flagged.length === 0 && visible.length === 0) return doc
  const target = visible.length === 0
    // no visible feed: a hidden feed that already held the flag keeps it; a flag on anything else goes
    ? flagged.find(feed)
    // two flags: the first visible flagged feed keeps it — else the gesture's own transfer — else the first visible feed
    : (flagged.find(visibleFeed(library)) ?? transferTarget(doc, previous, library) ?? visible[0])
  return flagOnly(doc, target?.instanceId ?? null)
}

/** The page's main feed, hidden or not — the first flagged instance, which after `designate` is the only one. */
export const mainFeedOf = (doc: ProjectDoc | null | undefined): DocInstance | undefined => doc?.instances.find((i) => i.isMainFeed)

/** **Make this the main feed** (D5c's Layers `⋯`): ONE edit that moves the flag, so the old main feed becomes a secondary
 *  feed with its own stored Data values. Refused — and never offered — on a hidden section, a section that is no feed and
 *  a page that does not paginate. */
export function makeMainFeed(doc: ProjectDoc, file: string, instanceId: string, library: SynthesisLibrary): ProjectDoc | string {
  if (!PAGINATED_TARGETS.has(file)) return 'This page has no list of posts to page through, so it has no main feed.'
  const target = doc.instances.find((i) => i.instanceId === instanceId)
  if (target === undefined) return `there is no section ${instanceId} on this template`
  if (!isFeed(library(target.designId))) return 'Only a list of posts can be the main feed.'
  if (target.hidden) return 'A hidden section cannot be the main feed. Show it first.'
  return target.isMainFeed ? doc : flagOnly(doc, instanceId)
}

/** FR-H2's archive case: a Tag or Author page with no VISIBLE feed. Ghost has no second file to fall through to there, so
 *  its page 2 onwards would repeat page 1. ONE predicate for the editor's Layers note now, Story 7.18's Pre-flight
 *  warning and Story 7.3's SEO guard later (DW-253). Home never: its page 2 is another file (FR-I1). */
export const feedlessArchive = (doc: ProjectDoc, file: string, library: SynthesisLibrary): boolean =>
  (file === 'tag.hbs' || file === 'author.hbs') && !doc.instances.some(visibleFeed(library))

/** A secondary feed's query before its stored values: its page's posts, newest first, as many as a page of the main
 *  feed shows — so a demoted main feed keeps showing its page 1. The page size is clamped to FR-H2's 1–100: a secondary
 *  feed never emits `limit="all"`. */
export const feedBase = (postsPerPage: number): DataBinding => ({
  source: 'posts',
  limit: Math.min(100, Math.max(1, Math.trunc(postsPerPage) || 1)),
  order: 'published_at desc',
})

/** A SECONDARY feed's query — `feedBase` folded with the instance's `data.posts` through the one fold, `withData` — or
 *  `undefined` for the main feed, a section that is no feed, and a page that does not paginate. */
export function feedQuery(
  entry: Pick<SynthesisEntry, 'bindingContext'> | undefined,
  instance: Pick<DocInstance, 'isMainFeed' | 'data'>,
  file: string,
  postsPerPage: number,
): DataBinding | undefined {
  if (!isFeed(entry) || instance.isMainFeed || !PAGINATED_TARGETS.has(file)) return undefined
  return withData({ [FEED_KEY]: feedBase(postsPerPage) }, instance.data)[FEED_KEY]
}
