// THE EDITOR'S URL SCHEME, AS DATA (Story 5.1, UX-DR22). Pure, so `node --test` reaches it, and client-safe, so the
// Shell reads it too: the route, the Shell, the switcher and the harness all take the scheme from here.
//
// `/projects/<uuid>` is Home; `/projects/<uuid>/<key>` is another canvas; `/projects/<uuid>/home` 308s to the first.
// The address names the project and the canvas and nothing else — selection, device, mode and folds are never in it.
// Reserved and unknown segments (`paywall`, `cards`, an unbuilt `custom-…`) answer 404 until their story opens them,
// and `index` answers 404 PERMANENTLY (R-127: page 2 has no canvas of its own; since Story 5.16 it is a design of its
// own, reached from the page-2 switch on its canvas and stored under `PAGE_TWO`'s keys below). The spec's Design Notes
// are the record of why.
//
// STORY 5.5 — THE SEGMENT AND THE STORED KEY STOP BEING THE SAME STRING. R-129's three membership canvases are custom
// templates, so their `project_templates.template_key` names their file (`custom:custom-signup.hbs`) while their URL
// segment stays the plain `custom-signup`. `templateKeyOf` is the one map between them, DERIVED from the file so the
// two cannot drift; `read.ts`'s `fileOf` is its inverse.
//
// THE ORDER OF `CANVASES` IS D5b'S ROW ORDER, and the switcher draws it straight through: Home · Post · Page · Tag ·
// Author · the Membership group · 404 · Private. R-128 defers the rule, the `FROM THE ROUTES MANAGER` heading and
// "+ New template" to Story 7.16.

/** Every canvas the editor can open, in D5b's row order: the template file it compiles into, its D5b label, and the
 *  one line the Template switcher prints under that label (R-171, owner, 2026-09-21 — "Add relevant one liners below
 *  the template name"), written to fit one line of the 284px menu. */
export const CANVASES = {
  home: { file: 'home.hbs', label: 'Home', caption: "Your site's front page" },
  post: { file: 'post.hbs', label: 'Post', caption: 'A single article' },
  page: { file: 'page.hbs', label: 'Page', caption: 'A standalone page, like About' },
  // D5a's Layers heading reads "LAYERS · TAG" and D5b's row reads "Tag": the export is the authority (R-74)
  tag: { file: 'tag.hbs', label: 'Tag', caption: 'Posts filed under one tag' },
  author: { file: 'author.hbs', label: 'Author', caption: "A writer's profile and posts" },
  // R-129 (owner, 2026-09-18): the filename is frozen public API and Ghost derives its own dropdown label from it
  // (`prd.md:636`), so it is chosen once. Signin, Sign up, Subscribe and Membership are different pages — Subscribe
  // and Membership are ordinary custom page templates from the Routes Manager (FR-I3, Story 7.16), not rows here.
  'custom-signup': { file: 'custom-signup.hbs', label: 'Signup', caption: 'Where visitors join' },
  'custom-signin': { file: 'custom-signin.hbs', label: 'Signin', caption: 'Where members sign in' },
  'custom-member-home': { file: 'custom-member-home.hbs', label: 'Member home', caption: "A member's account page" },
  error: { file: 'error.hbs', label: '404', caption: 'When a page cannot be found' },
  private: { file: 'private.hbs', label: 'Private', caption: 'While your site is private' },
} as const

/** The one line under a custom template's row (R-171, the owner's own words). Custom templates reach the switcher with
 *  the Routes Manager, Story 7.16, which draws their rows with this line and `kit/icons.tsx`'s `CanvasCustom`. */
export const CUSTOM_TEMPLATE_CAPTION = 'Custom template'

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

/** STORY 5.16 — PAGE 2 OF EACH CANVAS THAT PAGINATES, as data (R-178, R-179): the `project_templates.template_key` its
 *  own design is stored under, and the file that design compiles to. It is a design of its own, shared by every later
 *  page (R-177), and until its first change it follows page 1 as a live copy stored nowhere.
 *
 *  Home's page 2 is `index` — the file Ghost serves at `/page/N/`, a key the schema has accepted since day one — and
 *  an archive, having no second FILE, stores its page 2 under a key of its own (`20260922120000_page_two_template_keys`
 *  adds `tag-paged` and `author-paged` to `template_key_shape` on both tables). NONE OF THESE IS A CANVAS: `index`
 *  stays refused by the scheme (R-127) and the Template switcher gains no row; page 2 is reached from its canvas. */
export const PAGE_TWO: Partial<Readonly<Record<CanvasKey, { key: string; file: string }>>> = {
  home: { key: 'index', file: 'index.hbs' },
  tag: { key: 'tag-paged', file: 'tag.hbs' },
  author: { key: 'author-paged', file: 'author.hbs' },
}

/** The key a canvas's page 2 is stored under, or null for a canvas with no page 2. */
export const pageTwoKeyOf = (canvas: CanvasKey): string | null => PAGE_TWO[canvas]?.key ?? null

/** `pageTwoKeyOf`'s inverse: the canvas a stored page-2 key belongs to, or null for every other key. */
export const canvasOfPageTwoKey = (key: string): CanvasKey | null =>
  (Object.keys(PAGE_TWO) as CanvasKey[]).find((canvas) => PAGE_TWO[canvas]?.key === key) ?? null

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Checked before any query, so Postgres never sees `abc` (22P02). */
export const isUuid = (id: string) => UUID.test(id)

export const canvasPath = (projectId: string, key: CanvasKey = 'home') =>
  key === 'home' ? `/projects/${projectId}` : `/projects/${projectId}/${key}`

/** THE SCHEME'S ONE NON-CANVAS SEGMENT (Story 5.6, R-131): Theme settings, `/projects/<id>/settings`, holding D6a's
 *  project-mode block and the project-level "Clear dark overrides" row and nothing else that screen draws.
 *
 *  Named HERE because the scheme is data in one place (Story 5.1) — the route, the editor's way in and the harness
 *  all read it from this module, so nothing learns the word twice. It is deliberately NOT in `CANVASES`: it compiles
 *  into no `.hbs`, stores no `project_templates` row and opens no Layers panel. And `canvasFromSegment` keeps its
 *  refusal list exactly as it was — `settings` is a STATIC sibling of `[template]`, which Next resolves first, so the
 *  refusal is never asked about it (`editor.test.ts` is the assertion that it is still refused if it ever is). */
export const SETTINGS = 'settings'
export const settingsPath = (projectId: string) => `/projects/${projectId}/${SETTINGS}`

/** THE SCHEME'S SECOND NON-CANVAS SEGMENT (Story 5.8, R-131 applied a second time): the sync route AD-15's flush
 *  posts to — the one path the 3-minute timer, ⌘S and `fetch(..., { keepalive: true })` at tab close all take.
 *
 *  A ROUTE HANDLER AND NOT A SERVER ACTION, for one reason: a tab that is going cannot call a Server Action, and
 *  `keepalive` is only defined for `fetch`. It is a STATIC sibling of `[template]` exactly as `settings` is, so Next
 *  resolves it first and `canvasFromSegment` is never asked about it — `editor.test.ts` carries the same three
 *  assertions for it that it carries for `settings`, so the day anything DOES ask, it is refused. */
export const SYNC = 'sync'
export const syncPath = (projectId: string) => `/projects/${projectId}/${SYNC}`

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
