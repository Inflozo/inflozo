import { CUSTOM_TARGET_RE } from '@inflozo/library'
import { POSTS_PER_PAGE } from '@inflozo/section-runtime/custom-settings'
import { type Cond, DATE_OPS, type DateOp, type DateUnit, type Filter, ghostLabel, ROUTE_WORDS, type SlugField, type Visibility } from '@inflozo/section-runtime/routes'

/* STORY 7.16a — THE ROUTES MANAGER'S WORDS AND ITS PAGE'S PURE HALF (R-170: one list). Every sentence the page says is
   `ROUTES_WORDS`, and the deployed walk (`tools/probe/run-verify-editor.cjs`, step 109) reads it from here. S9a–S9e's
   strings are verbatim except the spec's routine calls: route templates are `custom-{name}` (2); S9e's helper says "like a
   landing page", because a membership page has no route (8); S9b's Ship-button line waits for Story 7.18 (11). The parts
   no frame draws are built beside the drawn ones (R-247), and their words are the "Extrapolated" list.

   The rules themselves — the grammar, the emitter, the validator, the naming step and every refusal's sentence — are the
   runtime's `@inflozo/section-runtime/routes` (`ROUTE_WORDS`, carried below as `refused`), so the page, its actions and
   Stories 7.16b, 7.17 and 7.18 judge by one module. */

/** S9c's field picker, in its order, with the NQL key it writes (the picker's mono hint) — and the word its ROW shows,
 *  where S9c draws a shorter one ("Published", `:192`, for the picker's "Published date"). */
export const FIELDS: readonly { field: Cond['field']; label: string; key: string; row?: string }[] = [
  { field: 'tag', label: 'Tag', key: 'tag:' },
  { field: 'author', label: 'Author', key: 'author:' },
  { field: 'primary_tag', label: 'Primary tag', key: 'primary_tag:' },
  { field: 'primary_author', label: 'Primary author', key: 'primary_author:' },
  { field: 'featured', label: 'Featured', key: 'featured:' },
  { field: 'visibility', label: 'Visibility', key: 'visibility:' },
  { field: 'published_at', label: 'Published date', key: 'published_at:', row: 'Published' },
  { field: 'feature_image', label: 'Has feature image', key: 'feature_image:' },
]

export const VISIBILITY_WORDS: Readonly<Record<Visibility, string>> = { public: 'Public', members: 'Members', paid: 'Paid' }
export const UNIT_WORDS: Readonly<Record<DateUnit, string>> = { d: 'days', w: 'weeks', M: 'months', y: 'years' }
/** R-246: an exact date's four operators, the only ones a collection offers. */
export const EXACT_WORDS: Readonly<Record<DateOp, string>> = { '>': 'after', '>=': 'on or after', '<': 'before', '<=': 'on or before' }
export const EXACT_OPS: readonly DateOp[] = DATE_OPS
/** S9c's rolling value words (`S9 Routes.dc.html:192`: "within · the last 30 days"), one spelling for the sheet's number
 *  box and the card's line alike (R-170) */
const THE_LAST = 'the last'
const unitAgo = (unit: DateUnit) => `${UNIT_WORDS[unit]} ago`

export const ROUTES_WORDS = {
  // S9a
  title: 'Routes & Templates',
  back: (project: string) => `Back to ${project}`,
  collections: 'Collections',
  collectionsHelp: 'Your homepage is a template built from sections — it lists posts only if you add a posts section. Collections are dedicated post listings, like Articles.',
  newCollection: '+ New collection',
  customRoutes: 'Custom routes',
  customRoute: '+ Custom route',
  taxonomies: 'Taxonomies',
  tags: 'Tags',
  tagTemplate: 'Tag template',
  authors: 'Authors',
  authorTemplate: 'Author template',
  valid: 'Valid — Ghost will accept this routing.',
  pass: 'pass',
  file: 'routes.yaml',
  fileNote: '· generated live, ships with every deploy',
  copy: 'Copy',
  copied: 'Copied',
  download: 'Download routes.yaml',
  perPage: (n: number) => `${n} / page`,
  // S9b
  line: (n: number, reason: string) => `Line ${n} — ${reason}`,
  errors: (n: number) => `${n} ${n === 1 ? 'error' : 'errors'}`,
  // S9c
  newCollectionTitle: 'New collection.',
  newCollectionLead: 'A section of your site with its own URL and layout.',
  path: 'Path',
  match: 'Show posts that match',
  all: 'All conditions',
  any: 'Any',
  choose: 'Choose…',
  isAnyOf: 'is any of',
  isNoneOf: 'is none of',
  is: 'is',
  isNot: 'is not',
  yes: 'Yes',
  no: 'No',
  add: 'add…',
  within: 'within',
  moreThan: 'more than',
  theLast: (n: number, unit: DateUnit) => `${THE_LAST} ${n} ${UNIT_WORDS[unit]}`,
  ago: (n: number, unit: DateUnit) => `${n} ${unitAgo(unit)}`,
  /** the sheet's rolling value: "the last" before the number box ("within"), and each unit with "ago" ("more than") */
  lastWord: THE_LAST,
  unitAgo,
  /** the rolling window's two fields, each named for a screen reader */
  howFar: 'how far back',
  unit: 'unit',
  first: 'A post lives in the first collection it matches — drag collections to reorder if posts land in the wrong place.',
  /** R-246's sentence for a collection (the spec's Ruled values) — `ROUTE_WORDS.relative`, the one spelling */
  exactDate: ROUTE_WORDS.relative,
  /** S9c's own sentence, verbatim, in a channel's block (R-246: relative first, in channels only) */
  rollingDate: 'Published date takes a rolling window first — now-30d — or switch it to an exact date, after Jan 1, 2026.',
  template: 'Template',
  /** S9c's sentence; "theme setting" links to Theme settings, never Ghost Admin (the epic's copy rule) */
  postsBefore: 'Posts per page is your ',
  postsLink: 'theme setting',
  postsAfter: (n: number) => ` — ${n} right now. A collection can set its own limit here.`,
  cancel: 'Cancel',
  createCollection: 'Create collection',
  // S9e
  newRouteTitle: 'New route.',
  newRouteLead: 'A URL on your site that shows exactly what you choose.',
  show: 'What should it show?',
  oneTemplate: 'One of your templates',
  /** routine call 8: S9e's "A designed page — like your Members Signup." — a membership page has no route (FR-I1) */
  oneTemplateHelp: 'A designed page — like a landing page.',
  channel: 'A channel — a filtered stream of posts',
  channelHelp: "Like a saved search with its own page and RSS feed. Posts keep their normal URLs. You'll add filter conditions next.",
  createRoute: 'Create route',
  // S9d
  emptyTitle: "Your site uses Ghost's default routing.",
  emptyLead: 'Nice and simple. Add a collection when you want sections like /tutorials/.',
  // the naming block (`EXPERIENCE.md:272`)
  permanent: 'This name is permanent. Ghost remembers it on every page you assign, and renaming it later would quietly unassign them all.',
  // extrapolated (R-247)
  templates: 'Templates',
  newTemplate: '+ New template',
  newTemplateOption: 'New template…',
  newTemplateTitle: 'New template.',
  newTemplateLead: 'A design you can give a route, or pick for a page in Ghost.',
  name: 'Name',
  ghostWillShow: (label: string) => `Ghost will show: ${label}`,
  usedBy: (paths: readonly string[]) => `Used by ${paths.join(', ')}`,
  createTemplate: 'Create template',
  ownPageSize: 'Its own page size',
  pageSize: 'Page size',
  edit: 'Edit',
  delete: 'Delete',
  more: (what: string) => `More for ${what}`,
  deleteTitle: (name: string) => `Delete ${name}?`,
  alsoRemoves: (paths: readonly string[]) => `Also removes ${paths.join(', ')}. Undo brings both back.`,
  /** Story 7.16b — a designed template's delete: its canvas's design goes with it, and Undo brings it back */
  designGoes: 'Its design goes with it. Undo brings it back.',
  alsoRemovesDesign: (paths: readonly string[]) => `Also removes ${paths.join(', ')} and its design. Undo brings them back.`,
  deleted: (name: string) => `Deleted ${name}`,
  undo: 'Undo',
  orAdd: 'or add a',
  aRoute: 'custom route',
  aTemplate: 'a template',
  save: 'Save',
  editCollectionTitle: 'Edit collection.',
  editRouteTitle: 'Edit route.',
  moveHow: 'Press Option or Alt with the up or down arrow to move this collection.',
  moved: (path: string, at: number, of: number) => `${path} moved to ${at} of ${of}.`,
  move: (path: string) => `Move: ${path}`,
  removeCondition: (field: string) => `Remove the ${field} condition`,
  removeValue: (value: string) => `Remove ${value}`,
  couldNot: "We couldn't save that just now. Try again in a moment.",
  // R-98's busy labels
  creating: 'Creating…',
  saving: 'Saving…',
  deleting: 'Deleting…',
  restoring: 'Restoring…',
  opening: 'Opening…',
  /** the Template menu's row (S9a's caption: "opens from Template dropdown → Manage routes") */
  manageRoutes: 'Manage routes',
  manageRoutesCaption: 'Collections, routes and templates',
  loading: 'Loading routes…',
  /** every refusal, the runtime's one list */
  refused: ROUTE_WORDS,
} as const

/** A collection card's name: the title-cased path (routine call 10) — `/field-notes/` → "Field Notes". */
export const cardName = (path: string): string =>
  path.slice(1, -1).split('-').map((w) => (w === '' ? w : w[0]!.toUpperCase() + w.slice(1))).join(' ')

const list = (values: readonly string[]) => values.join(', ')

/** One condition in words — the card's line and a screen reader's name for the row. */
export function conditionWords(c: Cond): string {
  const field = FIELDS.find((f) => f.field === c.field)?.label ?? c.field
  if ('values' in c) {
    if (c.field === 'visibility') return `${field} ${c.op === 'any' ? ROUTES_WORDS.is : ROUTES_WORDS.isNot} ${list(c.values.map((v) => VISIBILITY_WORDS[v as Visibility]))}`
    return `${field} ${c.op === 'any' ? ROUTES_WORDS.isAnyOf : ROUTES_WORDS.isNoneOf} ${list(c.values)}`
  }
  if ('is' in c) return `${field} ${ROUTES_WORDS.is} ${c.is ? ROUTES_WORDS.yes : ROUTES_WORDS.no}`
  if ('date' in c.at) return `${field} ${EXACT_WORDS[c.op]} ${c.at.date}`
  return c.op === '>' || c.op === '>='
    ? `${field} ${ROUTES_WORDS.within} ${ROUTES_WORDS.theLast(c.at.ago, c.at.unit)}`
    : `${field} ${ROUTES_WORDS.moreThan} ${ROUTES_WORDS.ago(c.at.ago, c.at.unit)}`
}

/** A filter in words: its conditions joined by "and" (All) or "or" (Any). */
export const filterWords = (f: Filter): string => f.conditions.map(conditionWords).join(f.match === 'all' ? ' and ' : ' or ')

/** Today's calendar date where the customer is, `YYYY-MM-DD` — a new exact-date condition's first value. Local, never
 *  `toISOString`'s UTC day, which is yesterday or tomorrow near midnight for anyone far from UTC (review, 2026-10-17). */
export function localToday(now: Date = new Date()): string {
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** A new condition of a field, as the picker starts it: an empty value list, Yes, or an exact date (a collection) / the
 *  last 30 days (a channel — S9c's own default). */
export function freshCondition(field: Cond['field'], where: 'collection' | 'channel', today: string): Cond {
  if (field === 'featured' || field === 'feature_image') return { field, is: true }
  if (field === 'published_at') return where === 'channel' ? { field, op: '>', at: { ago: 30, unit: 'd' } } : { field, op: '>', at: { date: today } }
  if (field === 'visibility') return { field, op: 'any', values: ['public'] }
  return { field: field as SlugField, op: 'any', values: [] }
}

/** A stored `custom_templates` row the page can use: kind `routes` and a filename in `CUSTOM_TARGET_RE`, else ignored
 *  (the table has no filename CHECK — routine call 14). */
export type Template = { id: string; file: string; name: string; label: string; created_at?: string }
export function templatesOf(rows: readonly { id?: unknown; filename?: unknown; display_name?: unknown; kind?: unknown; created_at?: unknown }[] | null): Template[] {
  return (rows ?? []).flatMap((r) =>
    r.kind === 'routes' && typeof r.id === 'string' && typeof r.filename === 'string' && CUSTOM_TARGET_RE.test(r.filename) && typeof r.display_name === 'string'
      ? [{ id: r.id, file: r.filename, name: r.display_name, label: ghostLabel(r.filename), ...(typeof r.created_at === 'string' ? { created_at: r.created_at } : {}) }]
      : [])
}

/** THE NAMING STEP'S DATABASE FLOOR, IN ITS OWN SENTENCE (FR-I3, §7.4): a `custom_templates` write refused with `23505` is
 *  either the deployed-name guard — `guard_custom_template_name()`'s "custom template % was already deployed by this
 *  project and can never be reused" (`…complete_schema.sql:1327`, `:1341`) — or `unique (project_id, filename)`; each
 *  answers with the naming step's own sentence, never a Postgres code. Any other failure is `couldNot`; none is null.
 *  The actions' two inserts (a new template, an Undo's restore) both ask it; `routes.test.ts` holds it against the trigger's
 *  own message, read from the migration, with the unique constraint's as its control. */
export function templateWriteRefusal(error: { code?: string; message?: string } | null, file: string): string | null {
  if (error === null) return null
  if (error.code !== '23505') return ROUTES_WORDS.couldNot
  return /was already deployed by this project/.test(error.message ?? '') ? ROUTE_WORDS.nameDeployed(file) : ROUTE_WORDS.nameTaken(ghostLabel(file))
}

/** The page size's stepper bounds — Theme settings' `POSTS_PER_PAGE`. */
export const PAGE_SIZE = POSTS_PER_PAGE
