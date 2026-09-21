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

/** The build this page was published from, in the canvas document's address (the owner's ruling of 2026-09-20,
 *  Question 5). It is what lets the document be cached `immutable`: a publish changes the address, so a new
 *  stylesheet is picked up at once and a stale one can never be served. `next.config.ts` inlines it. */
const V = process.env.INFLOZO_CANVAS_V || 'dev'

/** The canvas document's own address, beside the page: `/canvas` on the app host, `/app/canvas` on localhost. */
export const canvasSrc = (appPrefixed: boolean) => `${appPrefixed ? '/app' : ''}/canvas?v=${V}`

/** The keyboard harness's own copy of it (R-146), which differs from the app's in its guard and nothing else. */
export const harnessCanvasSrc = () => `/app/harness/canvas?v=${V}`

/** THE SAME DOCUMENT, NARROWED TO ONE DESIGN — a Section Picker preview's address (the owner's ruling of
 *  2026-09-20). A preview draws exactly one section, so it carries exactly one stylesheet; the editor's canvas,
 *  which may draw any of them, keeps `canvasSrc`. A picture inside it still resolves against the document's own
 *  address, and relative resolution drops a query, so `canvas?image=x` lands on the unnarrowed route as before. */
export const previewSrc = (src: string, designId: string) =>
  `${src}${src.includes('?') ? '&' : '?'}design=${encodeURIComponent(designId)}`


/** Orbit Weekly's pictures, pointed at the canvas route — relative, so the canvas document resolves it against its
 *  own address. The one place the reserved origin is mapped for a canvas. */
export const withImages = (html: string) =>
  html.replace(new RegExp(`${orbitWeekly.ORBIT_WEEKLY_ORIGIN.replace(/[.]/g, '\\.')}/images/([a-z0-9-]+)\\.svg`, 'g'), 'canvas?image=$1')

/** An asset id resolves only through this map (AD-27(b)), relative to the canvas document. */
export const canvasAssets = (pool: readonly { id: string }[]) => Object.fromEntries(pool.map((a) => [a.id, `canvas?image=${a.id}`]))

/** DW-209 (Story 5.11): a wheel that lands on a pill drawn OVER the canvas is forwarded to the canvas document, the
 *  one the pointer looks like it is over — the editor's page does not scroll, so the canvas simply stalled while the
 *  pointer rested on a pill. A wheel may report LINES or PAGES rather than pixels; the line step is the browser's own
 *  rough 16px. ONE implementation for the editor and `/controls` (review, 2026-09-20: it had been written twice). */
export function wheelToFrame(win: Window | null | undefined, deltaX: number, deltaY: number, deltaMode: number) {
  if (!win) return
  const k = deltaMode === 1 ? 16 : deltaMode === 2 ? win.innerHeight : 1
  win.scrollBy(deltaX * k, deltaY * k)
}

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
    /** Story 5.13 — WHICH post, page, tag or author this canvas renders (FR-D22), already resolved against the
     *  source by `orbitWeekly.resolveSubject`. Omitting it keeps the render exactly as it was, which is why
     *  `/pilots`, `tools/check-snapshots.mjs` and the render matrix are untouched — and is the story's control. */
    subject?: orbitWeekly.Subject | null
  },
): string {
  const ctx = orbitWeekly.templateContext(o.target, o.feed, o.subject)
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
