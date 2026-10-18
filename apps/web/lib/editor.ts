// THE EDITOR'S URL SCHEME, AS DATA (Story 5.1, UX-DR22). Pure, so `node --test` reaches it, and client-safe, so the
// Shell reads it too: the route, the Shell, the switcher and the harness all take the scheme from here.
//
// `/projects/<uuid>` is Home; `/projects/<uuid>/<key>` is another canvas; `/projects/<uuid>/home` 308s to the first.
// The address names the project and the canvas and nothing else — selection, device, mode and folds are never in it.
// Reserved and unknown segments answer 404 until their story opens them (Story 5.20 opened `paywall`, the first TEMPLATE
// SURFACE, and Story 7.13 `cards`, the second — see `CANVASES`; Story 7.16b every `custom-…` in the database's shape, a
// Routes Manager template's canvas — see `RouteCanvas`),
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
// Author · the Membership group · 404 · Private, then the Template surfaces group. Story 7.16b adds R-128's pair after them
// — D5b's group heading, `FROM ROUTES & TEMPLATES` since R-251, over one row per Routes Manager template (`RouteCanvas`),
// and "New template".
//
// STORY 7.16b — THE FOURTH KIND OF CANVAS, AS DATA: a template the user made on Routes & Templates (`custom_templates` of
// kind `routes`), keyed by its file without `.hbs` (`custom-landing`), stored under `custom:<file>` as a membership canvas
// is, and drawn from `editorData`'s templates rather than from `CANVASES`. Every reader that used to index `CANVASES` goes
// through `fileOf`, `labelOf` and `captionOf`, which answer both kinds.

import { CUSTOM_TARGET_RE, isRouteTemplate, isSiteFooter } from '@inflozo/library'
import { CARD_WORDS } from './cards.ts'

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
  // and Membership are ordinary custom page templates from the Routes Manager (FR-I3, Story 7.16a), not rows here.
  'custom-signup': { file: 'custom-signup.hbs', label: 'Signup', caption: 'Where visitors join' },
  'custom-signin': { file: 'custom-signin.hbs', label: 'Signin', caption: 'Where members sign in' },
  'custom-member-home': { file: 'custom-member-home.hbs', label: 'Member home', caption: "A member's account page" },
  error: { file: 'error.hbs', label: '404', caption: 'When a page cannot be found' },
  private: { file: 'private.hbs', label: 'Private', caption: 'While your site is private' },
  // STORY 5.20 — THE FIRST TEMPLATE SURFACE (C3a, EXPERIENCE.md:207-222): a canvas that is NOT A PAGE. Ghost renders the
  // partial where `{{content}}` stops a post for a visitor who may not read it (`content.js:50-52`), so it has no site
  // doc, no header or footer, no Section Picker, no page 2 and no Remix; the switcher draws it in its own group, last.
  // Its stored key is its segment, `paywall` (`20260926120000_paywall_template_key.sql`). Its caption is NOT the spec's
  // first "Where a members-only post stops": measured in the harness it overran the indented row by 7px and lost its
  // end (R-171's one line), so it says the same in the indicator's own word, "gated" (R-170).
  paywall: { file: 'partials/content-cta.hbs', label: 'Paywall', caption: 'Where a gated post stops', surface: true },
  // STORY 7.13 — THE SECOND TEMPLATE SURFACE (FR-Q7, S14 as EXPERIENCE.md re-specifies it): Editor cards, where Ghost's
  // own Koenig cards are styled once for the whole site. Its values are no `project_templates` row but
  // `project_treatments.card_designs`, which rides the editor's save under `CARDS_KEY`; it compiles into `cards.css`.
  // Entered from the switcher's Template surfaces group, after Paywall — never S14d's left-nav group (Layers keeps it).
  cards: { file: 'assets/css/cards.css', label: CARD_WORDS.label, caption: CARD_WORDS.caption, surface: true },
} as const

/** The Template switcher's group of canvases that are not pages (EXPERIENCE.md:207-222) — a shared heading since Story
 *  7.13 brought its second row; it was `PAYWALL_WORDS.group` while Paywall stood alone. */
export const SURFACES_HEADING = 'Template surfaces'

/** The one line under a custom template's row (R-171, the owner's own words). Story 7.16b draws every Routes Manager
 *  template's row with this line and `kit/icons.tsx`'s `CanvasCustom`. */
export const CUSTOM_TEMPLATE_CAPTION = 'Custom template'

export type CanvasKey = keyof typeof CANVASES

/** STORY 7.16b — A ROUTES MANAGER TEMPLATE'S CANVAS: its file without `.hbs` (`custom-landing`), in the database's own
 *  shape. Branded, so a `CANVASES[…]` read of one is a type error: every such reader goes through `fileOf`/`labelOf`. */
export type RouteCanvas = `custom-${string}` & { readonly __route: true }
/** Every canvas the editor can open: one of `CANVASES`, or a Routes Manager template's. */
export type Canvas = CanvasKey | RouteCanvas

/** `template_key_shape`'s custom half, word for word (`20260904120000_complete_schema.sql:254`), without `custom:` and
 *  `.hbs` — the one shape a Routes Manager canvas's segment may take. Not `CUSTOM_TARGET_RE`, which is looser (`custom--x`
 *  passes it), because a canvas whose key the database refuses could never be saved. */
const ROUTE_SEGMENT = /^custom-[a-z0-9]+(-[a-z0-9]+)*$/

/** Is this a Routes Manager template's canvas — not one of `CANVASES`? */
export const isRouteCanvas = (canvas: Canvas): canvas is RouteCanvas => !Object.hasOwn(CANVASES, canvas)

/** The canvas a Routes Manager template's FILE is, or null for any other file — a membership file is `CANVASES`' own, and a
 *  name outside the database's shape is no canvas at all. */
export const routeCanvasOf = (file: string): RouteCanvas | null => {
  const segment = file.endsWith('.hbs') ? file.slice(0, -'.hbs'.length) : ''
  return ROUTE_SEGMENT.test(segment) && isRouteTemplate(file) ? (segment as RouteCanvas) : null
}

/** The template file a canvas compiles into — `CANVASES[key].file`, or a Routes Manager canvas's own. */
export const fileOf = (canvas: Canvas): string => (isRouteCanvas(canvas) ? `${canvas}.hbs` : CANVASES[canvas].file)

/** A canvas's name — its D5b label, or a Routes Manager template's display name (R-170: the tab title and the switcher row
 *  say the same), from `names` by canvas; the segment itself where no name was handed. */
export const labelOf = (canvas: Canvas, names: Readonly<Record<string, string>> = {}): string =>
  isRouteCanvas(canvas) ? (Object.hasOwn(names, canvas) ? (names[canvas] as string) : canvas) : CANVASES[canvas].label

/** The one line under a canvas's row in the switcher — R-171's, and `CUSTOM_TEMPLATE_CAPTION` for every Routes Manager one. */
export const captionOf = (canvas: Canvas): string => (isRouteCanvas(canvas) ? CUSTOM_TEMPLATE_CAPTION : CANVASES[canvas].caption)

/** STORY 7.16b — what the editor knows of one Routes Manager template: its canvas, its display name and the paths that show
 *  it (`pathsUsing` over the stored routing; none when no route names it or the routing does not parse, routine call 12). */
export type RouteTemplate = { canvas: RouteCanvas; name: string; paths: readonly string[] }

/** …their display names by canvas, as `labelOf` takes them — the editor's rows and tab, and the settings pages' page
 *  names (review, 2026-10-17: R-170, one name for a template wherever it is named). */
export const namesOf = (templates: readonly RouteTemplate[] = []): Readonly<Record<string, string>> =>
  Object.fromEntries(templates.map((t) => [t.canvas, t.name]))

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

/** D5b's Membership group — derived from the filename, so R-129's three names are written once. A Routes Manager canvas is
 *  a custom template too, and never one of these. */
export const isMembership = (key: Canvas): boolean => !isRouteCanvas(key) && CANVASES[key].file.startsWith('custom-')

/** STORY 5.20 — a TEMPLATE SURFACE (the switcher's "Template surfaces" group): a canvas that is not a page. Every reader
 *  that would give it a site doc, a count in "Site-wide · N templates", a Section Picker or a page 2 asks this. */
export const isSurface = (key: Canvas): boolean => !isRouteCanvas(key) && 'surface' in CANVASES[key]

/** STORY 7.13 — the PAYWALL alone, where a branch is the paywall's own and not every surface's: its partial and its one
 *  design, its ring, its cut, its strip, its members-off card and its way back to Post. Editor cards shares the ink bar,
 *  the chip and the absences (no Section Picker, no page 2, no Remix, no Preview) and none of these. */
export const isPaywall = (key: Canvas): boolean => key === 'paywall'

/** STORY 7.13 — EDITOR CARDS, the surface whose canvas is the card document (`style-guide.ts`'s `cardsDocument`). */
export const isCards = (key: Canvas): boolean => key === 'cards'

/** The canvases a project offers, in D5b's row order. Never a literal: a conditional canvas joins the list the day its
 *  condition holds, and the switcher, the Layers count and the site-wide confirm all read this one function. The
 *  argument has no caller that can pass `true` yet — see `CONDITIONAL` — and is the seam the story that can will use. */
export const canvasesOf = (privateSite = false): CanvasKey[] =>
  (Object.keys(CANVASES) as CanvasKey[]).filter((key) => CONDITIONAL[key] === undefined || privateSite)

/** The canvas a stored `template_key` belongs to — `templateKeyOf`'s inverse — or null for `site` and for a key no
 *  canvas owns. Derived from the same map, so the two can never disagree. Story 7.16b: a `custom:` key of a Routes Manager
 *  file is that file's canvas by SHAPE — whether the template still exists is `editorData`'s question, never this one's. */
export const canvasOfTemplateKey = (key: string): Canvas | null =>
  (Object.keys(CANVASES) as CanvasKey[]).find((canvas) => templateKeyOf(canvas) === key) ??
  (key.startsWith('custom:') ? routeCanvasOf(key.slice('custom:'.length)) : null)

/** STORY 7.16b — is this stored key a Routes Manager template's doc (`custom:` + a Routes Manager file)? By shape alone —
 *  the one test the editor's read, the sync route and the editor's handling of the sync's `left` answer all ask. */
export const isRouteKey = (key: string): boolean => {
  const canvas = canvasOfTemplateKey(key)
  return canvas !== null && isRouteCanvas(canvas)
}

/** The `project_templates.template_key` a canvas stores under. A membership canvas and a Routes Manager one are custom
 *  templates, so their key names their file; every other canvas's key IS its segment. */
export const templateKeyOf = (key: Canvas): string =>
  isRouteCanvas(key) || isMembership(key) ? `custom:${fileOf(key)}` : key

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

/** A canvas's page 2, or undefined for a canvas with none — a Routes Manager canvas never has one: a collection's or channel's
 *  template is designed on page 1 only, for now (R-252, Story 7.16c's Question 1), and its live page 2 serves page 1's design. */
export const pageTwoOfCanvas = (canvas: Canvas): { key: string; file: string } | undefined => (isRouteCanvas(canvas) ? undefined : PAGE_TWO[canvas])

/** The key a canvas's page 2 is stored under, or null for a canvas with no page 2. */
export const pageTwoKeyOf = (canvas: Canvas): string | null => pageTwoOfCanvas(canvas)?.key ?? null

/** `pageTwoKeyOf`'s inverse: the canvas a stored page-2 key belongs to, or null for every other key. */
export const canvasOfPageTwoKey = (key: string): CanvasKey | null =>
  (Object.keys(PAGE_TWO) as CanvasKey[]).find((canvas) => PAGE_TWO[canvas]?.key === key) ?? null

/** The template FILE a stored key compiles into — `templateKeyOf`'s inverse, and a page-2 key's own file (`index` →
 *  `index.hbs`, `tag-paged` → `tag.hbs`). `custom:custom-x.hbs` names its own. Moved here from `read.ts` by Story 5.19,
 *  whose main-feed rule asks it of every doc on the server read and in every edit (`designate` keys on the file).
 *  STORY 5.20 — A CANVAS'S KEY ANSWERS ITS OWN FILE FROM `CANVASES`, which is how `paywall` compiles to
 *  `partials/content-cta.hbs` rather than a `paywall.hbs` Ghost never reads; `cards` (7.13) names `assets/css/cards.css`,
 *  though no doc is ever stored under it. */
export const fileOfKey = (key: string): string => {
  const paged = canvasOfPageTwoKey(key)
  if (paged !== null) return PAGE_TWO[paged]?.file as string
  const canvas = canvasOfTemplateKey(key)
  if (canvas !== null) return fileOf(canvas)
  return key === SITE.key ? SITE.file : key.startsWith('custom:') ? key.slice('custom:'.length) : `${key}.hbs`
}

/** STORY 7.3 — D5f (FR-I1): WOULD THIS DELETE EMPTY A DESIGNED CUSTOM TEMPLATE? A `custom-{name}.hbs` doc holding exactly
 *  one instance — hidden ones counted, because hiding is not emptying (FR-D5) — stops shipping when it goes, and Ghost
 *  falls back to `page.hbs` without a word (`templates.js`), so the editor asks first.
 *
 *  STORY 7.16b (DW-344's first half) — AND WHICH ASK: `routed` is the files a route names (`routedOf`), and a routed template
 *  KEEPS shipping when emptied (Story 7.3's `routed`: its layout line alone), so it is asked in `ROUTED_EMPTY_ASK`'s words,
 *  never "stops shipping". Null when the delete empties no custom template. */
export const emptiesCustomTemplate = (
  key: string,
  doc: { readonly instances: readonly unknown[] } | undefined,
  routed: readonly string[] = [],
): 'stops' | 'keeps' | null => {
  const file = fileOfKey(key)
  if (!CUSTOM_TARGET_RE.test(file) || doc?.instances.length !== 1) return null
  return routed.includes(file) ? 'keeps' : 'stops'
}

/** …and its words, as one list (R-170), in `SITE_WIDE_ASK`'s shape. "Delete" for the frame's "Remove": the gesture, the
 *  Layers row and the site-wide confirm all say Delete. `label` is the canvas's D5b label and `file` is `fileOfKey`'s; the
 *  body comes split around the file, so the dialog can set it in its mono chip. */
export const EMPTY_TEMPLATE_ASK = {
  title: (label: string) => `Delete the last section from ${label}?`,
  body: (file: string) =>
    [
      'This template stops shipping. Any Ghost page still pointing at ',
      file,
      " will still load — it will just wear your ordinary page design instead. Ghost won't warn anyone, which is why we are.",
    ] as const,
  cancel: 'Keep it',
  confirm: 'Delete section',
} as const

/** STORY 7.16b — D5f'S ROUTED SENTENCE (DW-344's first half), in its dialog: the last section off a template a route still
 *  shows. The body comes split around the paths, which the dialog sets in D5f's mono chip as it does the file. */
export const ROUTED_EMPTY_ASK = {
  title: EMPTY_TEMPLATE_ASK.title,
  body: (paths: readonly string[]) =>
    [
      'This template keeps shipping, because ',
      paths.join(', '),
      ` ${paths.length > 1 ? 'show' : 'shows'} it. Visitors there will see only your header and footer until you add a section.`,
    ] as const,
  cancel: EMPTY_TEMPLATE_ASK.cancel,
  confirm: EMPTY_TEMPLATE_ASK.confirm,
} as const

/** STORY 7.16b — THE DELETED-TEMPLATE NOTICE (R-250): B5a's strip above the canvas, and the same sentence in `#editor-said`,
 *  when the template an editor had open is no longer one of the project's — at load, or at the next save of that canvas. */
export const TEMPLATE_GONE = {
  said: (name: string) => `“${name}” is no longer one of your templates, so you're on Home.`,
  dismiss: 'Dismiss',
} as const

/** STORY 7.16b — R-128's pair in the Template menu (D5b `:163`, `:178`): the group's heading, set in capitals as the menu's
 *  own heading is, and the row that names a new template on Routes & Templates. The heading names that page by its own title
 *  (`ROUTES_WORDS.title`), not D5b's "the Routes Manager" — **R-251** (owner, 2026-10-17), R-170's one name; `editor.test.ts`
 *  holds the two together. */
export const ROUTES_GROUP = {
  heading: 'From Routes & Templates',
  newTemplate: 'New template',
} as const

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Checked before any query, so Postgres never sees `abc` (22P02). */
export const isUuid = (id: string) => UUID.test(id)

export const canvasPath = (projectId: string, key: Canvas = 'home') =>
  key === 'home' ? `/projects/${projectId}` : `/projects/${projectId}/${key}`

/** THE SCHEME'S ONE NON-CANVAS SEGMENT (Story 5.6, R-131): Theme settings, `/projects/<id>/settings` — D6a's project-mode
 *  block and its "Clear dark overrides" row, and since Story 7.9 Posts per page, Site basics and the custom-settings
 *  builder beside them; every "posts per page" sentence in the product links here (FR-Q1).
 *
 *  Named HERE because the scheme is data in one place (Story 5.1) — the route, the editor's way in and the harness
 *  all read it from this module, so nothing learns the word twice. It is deliberately NOT in `CANVASES`: it compiles
 *  into no `.hbs`, stores no `project_templates` row and opens no Layers panel. And `canvasFromSegment` keeps its
 *  refusal list exactly as it was — `settings` is a STATIC sibling of `[template]`, which Next resolves first, so the
 *  refusal is never asked about it (`editor.test.ts` is the assertion that it is still refused if it ever is). */
export const SETTINGS = 'settings'
export const settingsPath = (projectId: string) => `/projects/${projectId}/${SETTINGS}`

/** STORY 7.12 — Theme settings' second page, FR-Q6's Translations (B18), a child of `settings` under D6a's rail. */
export const TRANSLATIONS = 'translations'
export const translationsPath = (projectId: string) => `${settingsPath(projectId)}/${TRANSLATIONS}`

/** STORY 7.16a — THE ROUTES MANAGER (FR-I2, FR-I3; `S9 Routes.dc.html`), `/projects/<id>/routes`, reached from the Template
 *  menu's "Manage routes" (S9a's caption). R-131's pattern a fourth time: named here once, NOT in `CANVASES` — it compiles
 *  into no `.hbs` (its `routes.yaml` is the routes page's, not a template's), stores no `project_templates` row and opens no
 *  Layers panel. A STATIC sibling of `[template]`, so Next resolves it first and `canvasFromSegment` is never asked about it;
 *  `editor.test.ts` carries the same three assertions it carries for `settings`, `sync` and `lock`. */
export const ROUTES = 'routes'
export const routesPath = (projectId: string) => `/projects/${projectId}/${ROUTES}`
/** STORY 7.16b — the Template menu's "New template": Routes & Templates with its New template sheet open (routine call 8). */
export const NEW_TEMPLATE_QUERY = { new: 'template' } as const
export const newTemplatePath = (projectId: string) => `${routesPath(projectId)}?new=${NEW_TEMPLATE_QUERY.new}`

/** THE SCHEME'S SECOND NON-CANVAS SEGMENT (Story 5.8, R-131 applied a second time): the sync route AD-15's flush
 *  posts to — the one path the 3-minute timer, ⌘S and `fetch(..., { keepalive: true })` at tab close all take.
 *
 *  A ROUTE HANDLER AND NOT A SERVER ACTION, for one reason: a tab that is going cannot call a Server Action, and
 *  `keepalive` is only defined for `fetch`. It is a STATIC sibling of `[template]` exactly as `settings` is, so Next
 *  resolves it first and `canvasFromSegment` is never asked about it — `editor.test.ts` carries the same three
 *  assertions for it that it carries for `settings`, so the day anything DOES ask, it is refused. */
export const SYNC = 'sync'
export const syncPath = (projectId: string) => `/projects/${projectId}/${SYNC}`

/** THE SCHEME'S THIRD NON-CANVAS SEGMENT (Story 5.17, R-131 applied a third time): the edit lock's one door — the
 *  only path that writes `edit_locks`, so there is exactly one place FR-D18's compare-and-set can be got wrong.
 *
 *  A ROUTE HANDLER FOR `sync`'s OWN TWO REASONS, and a third of its own. A tab that is going cannot call a Server
 *  Action and the release rides a `keepalive` fetch; and the browser holds NO Supabase client and no key at all
 *  (`lib/supabase/server.ts` is "THE ONLY PLACE A SUPABASE CLIENT IS MADE", the session cookie is `httpOnly`), so
 *  a route under the caller's own session is the only hop that can reach the row — the same `authenticated` role,
 *  the same RLS and the same column grants `MEASUREMENTS.md` §50 executed. A STATIC sibling of `[template]`, so
 *  Next resolves it first and `canvasFromSegment` is never asked about it; `editor.test.ts` carries the same three
 *  assertions for it that it carries for `settings` and `sync`, so the day anything DOES ask, it is refused. */
export const LOCK = 'lock'
export const lockPath = (projectId: string) => `/projects/${projectId}/${LOCK}`

/** STORY 7.18a — the deploy wizard's one door (`projects/[id]/deploy/route.ts`): POST a Pre-flight, a Ship it, a re-activate
 *  or a Cancel; GET `?job=` reads the job until it ends. A route handler for the lock route's reasons. */
export const DEPLOY = 'deploy'
export const deployPath = (projectId: string) => `/projects/${projectId}/${DEPLOY}`

/** The canvas a segment names, or null for a reserved, unknown or CONDITIONAL one — a canvas the switcher offers to
 *  nobody must not be reachable by typing its address either, and refusing it here is the only refusal that is
 *  synchronous (see `CONDITIONAL`). `'home'` is a key; the route 308s it.
 *
 *  STORY 7.16b — A SEGMENT IN THE DATABASE'S SHAPE IS A ROUTES MANAGER CANVAS, decided here and synchronously, with no read:
 *  one that names no template opens Home with the deleted-template notice (routine call 9), because a `notFound()` after a
 *  database read serves Next's bare error page. A segment outside the shape (`custom-Bad_x`, `custom--x`) stays a 404. */
export const canvasFromSegment = (segment: string): Canvas | null =>
  Object.hasOwn(CANVASES, segment)
    ? CONDITIONAL[segment as CanvasKey] === undefined ? (segment as CanvasKey) : null
    : routeCanvasOf(`${segment}.hbs`)

/** `/projects/<anything>` and below; never `/projects` itself. Takes a path with `/app` already stripped. */
export const isEditorPath = (pathname: string) => /^\/projects\/[^/]+/.test(pathname)

/** The canvas an editor path is showing (stripped path), or null when the segment is not a canvas. */
export const canvasOfPath = (pathname: string): Canvas | null => {
  const segment = pathname.split('/')[3]
  return segment === undefined || segment === '' ? 'home' : canvasFromSegment(segment)
}

/** DW-187 (Story 5.24e): the one spelling of "a site-wide section the page draws LAST" — A3's footers. Story 7.1 moved it
 *  into the library (`placement.ts`), so the compiler's `default.hbs` splits the site doc by the canvas's own rule. */
export { isSiteFooter }

/** Layers' order and the canvas's: the site-wide instances outside `a3/` (headers), the canvas's own, then the `a3/`
 *  footers — each group in doc order. */
export function canvasStack<T extends { designId: string }>(site: readonly T[], own: readonly T[]): T[] {
  const footer = (i: T) => isSiteFooter(i.designId)
  return [...site.filter((i) => !footer(i)), ...own, ...site.filter(footer)]
}

/**
 * DW-187 · DW-189 (Story 5.24e): A SITE-WIDE MOVE STAYS IN ITS BAND (5.24a's routine call 2). The page draws the site doc's
 * headers and bars first and its footers last whatever order the doc stores them in (`canvasStack`), so a footer dragged
 * above a header — or a header ⌥↑'d past nothing — left Layers' order (the doc's) saying one thing and the page another.
 * Clamped into the moving row's own band, a move keeps the site doc in canvas order, so Layers' order IS the page's.
 * `footers` is the doc's instances, in order, as `isSiteFooter` answers them; a page doc has none and is unchanged.
 * The bands are contiguous because every door keeps them so — this clamp on each move, `onPlace` putting a header before
 * the first footer — and no stored doc holds a footer yet (the first real one is Story 9.9's).
 */
export function landWithin(footers: readonly boolean[], from: number, to: number): number {
  const heads = footers.filter((footer) => !footer).length
  return footers[from] ? Math.min(Math.max(to, heads), footers.length - 1) : Math.max(Math.min(to, heads - 1), 0)
}

/** DW-187 · DW-189 (Story 5.24e): WHERE A NEW SITE-WIDE SECTION GOES when none of its category is there to replace — a
 *  header or a bar before the first footer, a footer last — so a placement, like a move, leaves the site doc in the order
 *  the page draws it (`canvasStack`). */
export function siteSlot(designIds: readonly string[], placing: string): number {
  const firstFooter = designIds.findIndex(isSiteFooter)
  return isSiteFooter(placing) || firstFooter === -1 ? designIds.length : firstFooter
}
