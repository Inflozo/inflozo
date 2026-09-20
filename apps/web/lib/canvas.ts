// ONE PER-SECTION RENDER, for every page that draws sections into the canvas document (Story 5.1): `/pilots` and the
// editor call these and nothing else, so the two emit the same markup for the same design and state. Client-safe —
// no `node:` import — because both call it in the browser, writing into a same-origin iframe that carries no script.
//
// Extracted from `pilots/review.tsx`'s `paint()` and `shown()` (Story 4.10) without a change in behaviour.

import { orbitWeekly } from '@inflozo/library'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import { renderCanvas, withData } from '@inflozo/section-runtime'
import type { ControlState, MemberState, RuntimeDocument } from '@inflozo/section-runtime'

/** One design's declared queries, each in both orders at the Count's ceiling (`pilotRows()`). */
export type DesignRows = Readonly<Record<string, { newest: readonly unknown[]; oldest: readonly unknown[] }>>

/** The canvas document's own address, beside the page: `/canvas` on the app host, `/app/canvas` on localhost. */
export const canvasSrc = (appPrefixed: boolean) => `${appPrefixed ? '/app' : ''}/canvas`

/** THE SAME DOCUMENT, NARROWED TO ONE DESIGN — a Section Picker preview's address (the owner's ruling of
 *  2026-09-20). A preview draws exactly one section, so it carries exactly one stylesheet; the editor's canvas,
 *  which may draw any of them, keeps `canvasSrc`. A picture inside it still resolves against the document's own
 *  address, and relative resolution drops a query, so `canvas?image=x` lands on the unnarrowed route as before. */
export const previewSrc = (src: string, designId: string) => `${src}?design=${encodeURIComponent(designId)}`

/** Orbit Weekly's pictures, pointed at the canvas route — relative, so the canvas document resolves it against its
 *  own address. The one place the reserved origin is mapped for a canvas. */
export const withImages = (html: string) =>
  html.replace(new RegExp(`${orbitWeekly.ORBIT_WEEKLY_ORIGIN.replace(/[.]/g, '\\.')}/images/([a-z0-9-]+)\\.svg`, 'g'), 'canvas?image=$1')

/** An asset id resolves only through this map (AD-27(b)), relative to the canvas document. */
export const canvasAssets = (pool: readonly { id: string }[]) => Object.fromEntries(pool.map((a) => [a.id, `canvas?image=${a.id}`]))

/** Each query's rows as the canvas shows them: the stored Order picks the list, the fixed or stored limit slices it,
 *  and a query with neither shows Ghost's default. */
export const shownRows = (entry: SectionRegistryEntry, state: ControlState, rows: DesignRows | undefined) =>
  Object.fromEntries(
    Object.entries(withData(entry.dataBindings, state.data)).map(([key, binding]) => {
      const both = rows?.[key]
      const list = binding.order === 'published_at asc' ? both?.oldest : both?.newest
      const fallback: unknown = orbitWeekly.DEFAULT_LIMIT[binding.source as keyof typeof orbitWeekly.DEFAULT_LIMIT]
      return [key, (list ?? []).slice(0, binding.limit ?? (typeof fallback === 'number' ? fallback : 100))]
    }),
  )

/** One section's canvas markup, pictures mapped. Throws when the design cannot be drawn — the caller says so loudly. */
export function renderSection(
  doc: Document,
  entry: SectionRegistryEntry,
  state: ControlState,
  o: {
    target: string
    rows: DesignRows | undefined
    feed: orbitWeekly.FeedState
    member: Exclude<MemberState, 'everyone'>
    visibility: MemberState
    assets: Readonly<Record<string, string>>
    icons: IconLookup
    /** Story 5.3 — the editor asks for the editing stamps (`takeStamps` lifts them off as it mounts); `/pilots` does not */
    editing?: boolean
  },
): string {
  const ctx = orbitWeekly.templateContext(o.target, o.feed)
  return withImages(renderCanvas(doc as unknown as RuntimeDocument, entry.html, {
    target: o.target,
    content: state.content,
    schema: entry.contentSchema,
    controlSchema: entry.controlSchema,
    universals: entry.universals,
    controls: state.controls,
    data: state.data,
    dataBindings: entry.dataBindings,
    getRows: shownRows(entry, state, o.rows),
    ghost: ctx.ghost,
    site: ctx.site,
    member: o.member,
    visibility: o.visibility,
    assets: o.assets,
    icons: o.icons,
    editing: o.editing,
  }))
}

/** Writes sections into the mount and leaves every module mount in the state `core` leaves it on a live page
 *  (Story 4.7): the `js-enabled` class, and no script. */
export function mountSections(mount: Element, html: string) {
  mount.innerHTML = html
  for (const el of mount.querySelectorAll('[data-module]')) el.classList.add('js-enabled')
}
