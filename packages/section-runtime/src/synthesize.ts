// THE SYNTHESIS DEFAULTS, AND THE ONE FUNCTION THAT READS THEM (Story 5.5 — FR-D6, AD-27(d)).
//
// ONE IMPLEMENTATION, NEVER TWO. The editor calls `synthesize` so an untouched canvas opens already built, and Story
// 7.3's compiler will call this same one at compile time; `indexStack` is R-127's rule for `index.hbs` and Story 5.16's
// page-2 preview calls it too. AD-27(d) exists precisely so the stacks, the main-feed designation and the drop rule are
// not written twice. The spine's `:530` mermaid puts `synthesize` as the first node INSIDE the pure core: no clock, no
// I/O, no app state — the library is HANDED in, the same way the DOM is handed to `renderCanvas`.
//
// THE TABLE IS A CITATION, NOT A DECISION. `sections-inventory.md § Synthesis Defaults` (:778-867) is normative and is
// its own single source of truth (its Invariant 1): the per-template stacks are :802-847, the main-feed rule :849-861,
// and the "same stack into both files" for `home.hbs`/`index.hbs` is :804-806. CHANGING A STACK MEANS CHANGING THAT
// DOCUMENT FIRST. What is written below is only what that document states, in the fields the doc schema has; where its
// "key values" ARE the design's own control defaults (FR-F7) nothing is written here, because a restated default is a
// second place for it to drift.
//
// A ROW THE LIBRARY CANNOT PLACE IS DROPPED WITH ITS REASON, never silently and never thrown. Two reasons, and they are
// different: the library holds no such design, or it holds it with a `compileTarget` that excludes this file. This is
// deliberately NOT `editorData`'s loud refusal — that one guards a user's STORED doc, where a missing design is
// corruption; a synthesized row is our own table meeting a library that has not caught up (today: A25-A31 unauthored,
// and A24's pilot narrowed to `post.hbs` — DW-191), and throwing there would black out four canvases. The dropped set
// is DERIVED from the library, so it empties itself as Epics 9 and 10 land.
//
// NEVER SYNTHESIZED (`sections-inventory.md:785`): every `custom-{name}.hbs` — which is what A30's membership pages are
// (R-129: `custom-signup.hbs`, `custom-signin.hbs`, `custom-member-home.hbs`) — plus `private.hbs`. They have no entry
// in the table below, so `isSynthesizable` is false for them and they open EMPTY.

import { defaultContent } from './controls.ts'
import type { DocInstance, ProjectDoc } from './doc-schema.ts'
import type { PropDef } from '@inflozo/library'

/** What synthesis asks the library about one design — the same two questions `editorData` asks (`read.ts:84-90`),
 *  plus the category union a fresh instance's content comes from. `undefined` means the library holds no such design. */
export type SynthesisEntry = {
  compileTarget: readonly string[]
  contentSchema: Readonly<Record<string, PropDef>>
}
export type SynthesisLibrary = (designId: string) => SynthesisEntry | undefined

/** One row of a default stack. `controls` carries ONLY the values `sections-inventory.md` names that are not already
 *  the design's own schema default. */
export type DefaultRow = {
  designId: string
  /** the row's name in Layers — D5a draws the tag canvas's as "Archive header" and "Post grid" */
  layerName: string
  controls?: Readonly<Record<string, string>>
  /** FR-H2: this instance binds the template's native paginated collection (`sections-inventory.md:849-861`) */
  isMainFeed?: true
}

/** A default row the library could not place, and why. */
export type DroppedRow = { designId: string; reason: string }

export type Synthesis = { instances: DocInstance[]; dropped: DroppedRow[] }

/** `home.hbs` and `index.hbs` are ONE stack, written once: "an untouched Home synthesizes the same stack into both
 *  files — the root and its paginated continuation must not disagree about what the feed is" (:804-806). A17 #1's own
 *  control defaults already are the document's key values (all meta toggles on), and Pagination style is A34, a
 *  treatment chosen outside the canvas and never an instance here — so this row carries no control values. */
const FEED: readonly DefaultRow[] = [{ designId: 'a17/1', layerName: 'Post grid', isMainFeed: true }]

/** The seven synthesizable files (`sections-inventory.md:786`) and their stacks (:802-847). Six have a canvas; the
 *  seventh, `index.hbs`, has none and is `indexStack`'s (R-127). */
export const SYNTHESIS_DEFAULTS: Readonly<Record<string, readonly DefaultRow[]>> = {
  'home.hbs': FEED,
  'index.hbs': FEED,
  'post.hbs': [
    { designId: 'a24/1', layerName: 'Post header' },
    { designId: 'a25/1', layerName: 'Post content' },
    { designId: 'a26/1', layerName: 'Author bio' },
    { designId: 'a27/1', layerName: 'Related posts' },
    { designId: 'a28/2', layerName: 'Comments' },
  ],
  // :824 — the meta row is hidden, "pages aren't dated content"; A24's `byline` and `tag-line` are that row.
  // A25 is target-agnostic and binds `post` on both templates, so its values are `post.hbs`'s exactly (:830).
  'page.hbs': [
    { designId: 'a24/1', layerName: 'Page header', controls: { byline: 'off', 'tag-line': 'off' } },
    { designId: 'a25/1', layerName: 'Page content' },
  ],
  'tag.hbs': [{ designId: 'a29/1', layerName: 'Archive header' }, ...FEED],
  // :840 — #2 Split Head over #1: its right column carries a description and a count, which is what an author
  // archive has to say. A29 is one design over three archives, so #1 would be legal here too.
  'author.hbs': [{ designId: 'a29/2', layerName: 'Archive header' }, ...FEED],
  'error.hbs': [{ designId: 'a31/1', layerName: 'Error message' }],
}

/** Is this `.hbs` one of the seven the compiler builds from a default stack? A custom template and `private.hbs` are
 *  not, so they open empty and carry no marker (`sections-inventory.md:785`). */
export const isSynthesizable = (file: string): boolean => Object.hasOwn(SYNTHESIS_DEFAULTS, file)

/** `index.hbs`'s own file name, so R-127's fallback and the table cannot drift apart. */
const INDEX = 'index.hbs'

/**
 * One untouched template's starting stack. Pure, and total: a file with no default stack answers no instances, which
 * is the same answer as a stack every row of which was dropped — the caller distinguishes them with `isSynthesizable`,
 * because "auto-generated with nothing in it" (`error.hbs` today) and "never auto-generated" (Signup) are different
 * states and only the first is marked (FR-D6).
 *
 * The instance ids are DERIVED from the file and the row's position, not generated: this module reads no randomness
 * (AD-1), and the same untouched canvas must synthesize to the same doc on every open and on every compile.
 */
export function synthesize(file: string, library: SynthesisLibrary): Synthesis {
  const instances: DocInstance[] = []
  const dropped: DroppedRow[] = []
  for (const [n, row] of (SYNTHESIS_DEFAULTS[file] ?? []).entries()) {
    const entry = library(row.designId)
    if (entry === undefined) {
      dropped.push({ designId: row.designId, reason: `the library holds no design ${row.designId}` })
      continue
    }
    if (!entry.compileTarget.includes(file)) {
      dropped.push({ designId: row.designId, reason: `${row.designId} compiles to ${entry.compileTarget.join(', ')}, never ${file}` })
      continue
    }
    instances.push({
      instanceId: `auto-${file.replace(/\.hbs$/, '')}-${n + 1}`,
      layerName: row.layerName,
      designId: row.designId,
      content: defaultContent(entry.contentSchema),
      controls: { ...row.controls },
      data: {},
      darkOverrides: {},
      parkedControls: {},
      hidden: false,
      memberVisibility: 'everyone',
      isMainFeed: row.isMainFeed === true,
    })
  }
  return { instances, dropped }
}

/**
 * R-127 (the owner, 2026-09-18): WHAT PAGE 2 IS MADE FROM. `index.hbs` has no canvas — permanently — so it is derived
 * from the Home doc instead: everything above the designated main feed is dropped, the feed and everything below it are
 * kept in order. A welcome banner is meant once; a newsletter band and a closing CTA carry on.
 *
 * Two fallbacks, and both end at the same place — the Synthesis Default stack, because `index.hbs` is ALWAYS compiled
 * and must never ship empty (FR-I1): an UNTOUCHED Home, where :804-806 already says the same stack goes into both
 * files; and a DESIGNED Home with no designated main feed, which is the owner's own "Pilot sections" project today.
 */
export function indexStack(home: ProjectDoc | null | undefined, library: SynthesisLibrary): Synthesis {
  const instances = home?.instances ?? []
  const feed = instances.findIndex((i) => i.isMainFeed)
  return instances.length === 0 || feed === -1 ? synthesize(INDEX, library) : { instances: instances.slice(feed), dropped: [] }
}
