// THE EDITOR'S URL SCHEME, AS DATA (Story 5.1, UX-DR22). Pure, so `node --test` reaches it, and client-safe, so the
// Shell reads it too: the route, the Shell, the switcher and the harness all take the scheme from here.
//
// `/projects/<uuid>` is Home; `/projects/<uuid>/<key>` is another canvas; `/projects/<uuid>/home` 308s to the first.
// The address names the project and the canvas and nothing else — selection, device, mode and folds are never in it.
// Reserved and unknown segments (`paywall`, `cards`, an unbuilt `custom-…`) answer 404 until their story opens them,
// and `index` answers 404 PERMANENTLY (R-127: page 2 has no canvas; it is derived from the Home doc by `indexStack`).
// The spec's Design Notes are the record of why.
//
// STORY 5.5 — THE SEGMENT AND THE STORED KEY STOP BEING THE SAME STRING. R-129's three membership canvases are custom
// templates, so their `project_templates.template_key` names their file (`custom:custom-signup.hbs`) while their URL
// segment stays the plain `custom-signup`. `templateKeyOf` is the one map between them, DERIVED from the file so the
// two cannot drift; `read.ts`'s `fileOf` is its inverse.
//
// THE ORDER OF `CANVASES` IS D5b'S ROW ORDER, and the switcher draws it straight through: Home · Post · Page · Tag ·
// Author · the Membership group · 404 · Private. R-128 defers the rule, the `FROM THE ROUTES MANAGER` heading and
// "+ New template" to Story 7.16.

/** Every canvas the editor can open, in D5b's row order: the template file it compiles into and its D5b label. */
export const CANVASES = {
  home: { file: 'home.hbs', label: 'Home' },
  post: { file: 'post.hbs', label: 'Post' },
  page: { file: 'page.hbs', label: 'Page' },
  // D5a's Layers heading reads "LAYERS · TAG" and D5b's row reads "Tag": the export is the authority (R-74)
  tag: { file: 'tag.hbs', label: 'Tag' },
  author: { file: 'author.hbs', label: 'Author' },
  // R-129 (owner, 2026-09-18): the filename is frozen public API and Ghost derives its own dropdown label from it
  // (`prd.md:636`), so it is chosen once. Signin, Sign up, Subscribe and Membership are different pages — Subscribe
  // and Membership are ordinary custom page templates from the Routes Manager (FR-I3, Story 7.16), not rows here.
  'custom-signup': { file: 'custom-signup.hbs', label: 'Signup' },
  'custom-signin': { file: 'custom-signin.hbs', label: 'Signin' },
  'custom-member-home': { file: 'custom-member-home.hbs', label: 'Member home' },
  error: { file: 'error.hbs', label: '404' },
  private: { file: 'private.hbs', label: 'Private' },
} as const

export type CanvasKey = keyof typeof CANVASES

/** The site-wide doc's key in `project_templates`, and the file its sections compile into. */
export const SITE = { key: 'site', file: 'default.hbs' } as const

/** A canvas offered only while its condition holds (FR-D6) — ABSENT, never greyed, when it does not, and its segment
 *  404s. `private` is the only one: the row appears "once a Private Site Gate is called for", which is the project's
 *  linked site reporting itself private. D5b's caption says "designed" instead, which cannot be reached — a canvas you
 *  cannot open is a canvas you cannot design — so the PRD's wording is the one built and the frame's is DW-192.
 *
 *  NO CONDITION CAN BE TRUE YET, AND THAT IS EXECUTED (2026-09-18, standing rule 1): `sites.site_settings` — the
 *  snapshot Epic 3 keeps — records `code_injection`, `portal_button`, `announcement`, `brand`, `public_url` and
 *  `plan_ask`, and no private flag, because no story has needed one. So a conditional canvas is offered to nobody and
 *  its segment is REFUSED BY THE SCHEME below, synchronously, which is also the only refusal that answers the app's
 *  own 404: a `notFound()` thrown after a database read lets Next flush first and serves its bare error document with
 *  no way home (measured on this build — `/private` did exactly that while `/index` did not). The story that gives a
 *  condition something to read opens its segment here and owns that problem with it (DW-192). */
export const CONDITIONAL: Partial<Record<CanvasKey, 'private-site'>> = { private: 'private-site' }

/** D5b's Membership group — derived from the filename, so R-129's three names are written once. */
export const isMembership = (key: CanvasKey): boolean => CANVASES[key].file.startsWith('custom-')

/** The canvases a project offers, in D5b's row order. Never a literal: a conditional canvas joins the list the day its
 *  condition holds, and the switcher, the Layers count and the site-wide confirm all read this one function. The
 *  argument has no caller that can pass `true` yet — see `CONDITIONAL` — and is the seam the story that can will use. */
export const canvasesOf = (privateSite = false): CanvasKey[] =>
  (Object.keys(CANVASES) as CanvasKey[]).filter((key) => CONDITIONAL[key] === undefined || privateSite)

/** The canvas a stored `template_key` belongs to — `templateKeyOf`'s inverse — or null for `site` and for a key no
 *  canvas owns. Derived from the same map, so the two can never disagree. */
export const canvasOfTemplateKey = (key: string): CanvasKey | null =>
  (Object.keys(CANVASES) as CanvasKey[]).find((canvas) => templateKeyOf(canvas) === key) ?? null

/** The `project_templates.template_key` a canvas stores under. A membership canvas is a custom template, so its key
 *  names its file; every other canvas's key IS its segment. */
export const templateKeyOf = (key: CanvasKey): string =>
  isMembership(key) ? `custom:${CANVASES[key].file}` : key

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Checked before any query, so Postgres never sees `abc` (22P02). */
export const isUuid = (id: string) => UUID.test(id)

export const canvasPath = (projectId: string, key: CanvasKey = 'home') =>
  key === 'home' ? `/projects/${projectId}` : `/projects/${projectId}/${key}`

/** The canvas a segment names, or null for a reserved, unknown or CONDITIONAL one — a canvas the switcher offers to
 *  nobody must not be reachable by typing its address either, and refusing it here is the only refusal that is
 *  synchronous (see `CONDITIONAL`). `'home'` is a key; the route 308s it. */
export const canvasFromSegment = (segment: string): CanvasKey | null =>
  Object.hasOwn(CANVASES, segment) && CONDITIONAL[segment as CanvasKey] === undefined ? (segment as CanvasKey) : null

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
