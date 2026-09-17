// THE EDITOR'S URL SCHEME, AS DATA (Story 5.1, UX-DR22). Pure, so `node --test` reaches it, and client-safe, so the
// Shell reads it too: the route, the Shell and the harness all take the scheme from here.
//
// `/projects/<uuid>` is Home; `/projects/<uuid>/<key>` is another canvas; `/projects/<uuid>/home` 308s to the first.
// The address names the project and the canvas and nothing else — selection, device, mode and folds are never in it.
// Reserved and unknown segments (`index`, `private`, `custom-…`, `paywall`, `cards`) answer 404 until their story
// opens them. The spec's Design Notes are the record of why.

/** The canvases this story opens: each one's template file and its D5b label. */
export const CANVASES = {
  home: { file: 'home.hbs', label: 'Home' },
  post: { file: 'post.hbs', label: 'Post' },
  page: { file: 'page.hbs', label: 'Page' },
  tag: { file: 'tag.hbs', label: 'Tag archive' },
  author: { file: 'author.hbs', label: 'Author archive' },
  error: { file: 'error.hbs', label: '404' },
} as const

export type CanvasKey = keyof typeof CANVASES

/** The site-wide doc's key in `project_templates`, and the file its sections compile into. */
export const SITE = { key: 'site', file: 'default.hbs' } as const

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Checked before any query, so Postgres never sees `abc` (22P02). */
export const isUuid = (id: string) => UUID.test(id)

export const canvasPath = (projectId: string, key: CanvasKey = 'home') =>
  key === 'home' ? `/projects/${projectId}` : `/projects/${projectId}/${key}`

/** The canvas a segment names, or null for a reserved or unknown one. `'home'` is a key; the route 308s it. */
export const canvasFromSegment = (segment: string): CanvasKey | null =>
  Object.hasOwn(CANVASES, segment) ? (segment as CanvasKey) : null

/** `/projects/<anything>` and below; never `/projects` itself. Takes a path with `/app` already stripped. */
export const isEditorPath = (pathname: string) => /^\/projects\/[^/]+/.test(pathname)

/** The canvas an editor path is showing (stripped path), or null when the segment is not a canvas. */
export const canvasOfPath = (pathname: string): CanvasKey | null => {
  const segment = pathname.split('/')[3]
  return segment === undefined || segment === '' ? 'home' : canvasFromSegment(segment)
}

/** Layers' order and the canvas's: the site-wide instances outside `a3/` (headers), the canvas's own, then the `a3/`
 *  footers — each group in doc order. */
export function canvasStack<T extends { designId: string }>(site: readonly T[], own: readonly T[]): T[] {
  const footer = (i: T) => i.designId.startsWith('a3/')
  return [...site.filter((i) => !footer(i)), ...own, ...site.filter(footer)]
}
