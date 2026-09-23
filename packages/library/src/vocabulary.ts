// The authoring vocabulary, as data. AD-34: "the rules are data in `packages/library`".
//
// Four of the constants below are LIFTED UNCHANGED from `tools/stress/compile.js`, where they were
// executed and attacked for four rounds (AD-36, `packages/section-runtime/src/ad36.test.ts`): the binding-path
// grammar, the helper table, the bindable-attribute allow-list and its URL subset, and the safe
// scheme rule. They live here so 4.2's two emitters inherit ONE copy rather than growing a second.
//
// The whole point of the file is AD-36's idea stated once: a value crossing into a syntax is
// PARSED and rebuilt from validated parts, never interpolated. Every `parse` below returns a
// failure sentence or null, and nothing here concatenates a value into an expression.

import { parseModuleDeclaration } from './modules.ts'
import { CATALOG_KEY_RE, PLACEHOLDER_NAME_RE, tKeyRefusal, tParamsRefusal } from './catalog.ts'
import type { CatalogRefusal } from './catalog.ts'

/** Handlebars' real path vocabulary — an optional `@` prefix, `../` ascents, dotted identifiers.
 *  Widened once already: a grammar that rejects `@site.logo` is a broken parser, not a strict one.
 *  What it still refuses is every character the Round-4 breakout needed: braces, quotes,
 *  whitespace, backslash. */
export const PATH_RE = /^(\.\.\/)*@?[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/

/** A content prop path. Flat and dotted like a binding path, plus `[]` to name one item of an
 *  authored array: `items[].label`. A prop inside a repeat is written IN FULL — never relative —
 *  which is what lets a lexical validator resolve it with no tree. */
export const PROP_PATH_RE = /^[A-Za-z_][A-Za-z0-9_]*(\[\])?(\.[A-Za-z_][A-Za-z0-9_]*(\[\])?)*$/

/** FR-J2's NORMATIVE `image_sizes` map, in ONE place — read by the shim, by the probe theme that
 *  records real Ghost output, by the gscan harness and by `HELPERS.img_url` below. Ghost generates a
 *  rendition per declared key and `{{img_url size="m"}}` resolves against THIS map; with a size that
 *  is not a key Ghost silently returns the ORIGINAL image and nothing reports it (gscan does not
 *  validate `image_sizes` at all), so a 4000px photograph serves behind a 300px card on a live site.
 *  Three ceilings exist and FR-J2 keeps them apart deliberately: these five size Ghost-hosted CONTENT
 *  images; FR-J3's `400/800/1600 + original` covers theme-BUNDLED assets; FR-K2 caps UPLOADS at 2400. */
export const IMAGE_SIZES: Readonly<Record<string, number>> = {
  xs: 150, s: 400, m: 750, l: 1200, xl: 2000,
}

/** Each helper's argument is checked against that helper's OWN rule. Never concatenated. */
export const HELPERS: Readonly<Record<string, { param: string; ok: (a: string) => boolean }>> = {
  // Story 4.3 NARROWED this from `/^[a-z0-9_]+$/i`, which accepted `800` — not a key at all, and a
  // live defect rather than a looseness: the refusal has to name the keys, because the failure it
  // prevents is SILENT on the customer's site.
  img_url: { param: 'size', ok: (a) => Object.prototype.hasOwnProperty.call(IMAGE_SIZES, a) },
  date: { param: 'format', ok: (a) => /^[A-Za-z0-9 ,:/.\-]+$/.test(a) },
}

/** The attributes a design may bind. `style` and every `on*` are absent BY CONSTRUCTION — AD-36 (3).
 *  Three edits to the executed set, each with its reason: `data-portal` is ADDED, because §7.3 gap
 *  row 11's mixed form (`signup/{tier}`) has no other way in; `placeholder` is ADDED, because it is
 *  a visitor-facing string and exit construct 3 (`data-t-attr`) must be able to reach it; `srcset`
 *  is REMOVED, because one expression per attribute is not enough for a candidate list — that is
 *  why `data-bind-srcset` exists — and a user-authored srcset would let a later candidate carry a
 *  scheme `safeUrl` never sees (review 1). */
export const BINDABLE_ATTRS: ReadonlySet<string> = new Set([
  'href', 'src', 'alt', 'title', 'id', 'datetime', 'value', 'poster', 'placeholder',
  'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden', 'width', 'height',
  'data-portal',
])

/** The subset whose value the browser (or Portal) resolves as a URL. */
export const URL_ATTRS: ReadonlySet<string> = new Set(['href', 'src', 'poster'])

const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i

/** AD-36 (1). A scheme is a semantic property and no escaper can act on it. Rejects to an inert,
 *  VISIBLE `#` rather than repairing or silently dropping. `java\nscript:` is rejected, not fixed:
 *  control characters and whitespace are stripped BEFORE the decision, never from the value. */
export function safeUrl(value: unknown): string {
  const v = String(value == null ? '' : value).trim()
  const probe = v.replace(/[\u0000-\u0020]/g, '').toLowerCase()
  const scheme = probe.match(/^([a-z0-9+.\-]*):/)
  if (!scheme) return v // relative — no scheme to abuse
  return SAFE_SCHEME.test(probe) ? v : '#'
}

/** AD-36 (4). A Ghost tag's `accent_color` is stored VERBATIM: `red;}body{display:none`,
 *  `#fff;background:url(x)`, `#fff;width:100vw` and `#f00;/* c *\/color:red` were all accepted on both
 *  live majors. The value crossing into a CSS declaration is therefore not necessarily a colour, and a
 *  character filter that got lucky twice is not a validator. This PARSES: a hex form, or one of the four
 *  colour functions whose whole argument list is numbers and separators — no nested `(`, so no `url()`,
 *  no `var()`, and nothing carrying `;` or `}` can match either arm. Anything else falls back to the
 *  pack token, which is AD-36's stated remedy rather than a repair of the hostile value.
 *
 *  The half no build-time gate can reach is named in AD-36 itself: on the THEME side the emitted
 *  `style="--tag-accent: {{accent_color}}"` is correct Handlebars and the value arrives at render, on
 *  the customer's site, after every gate has run. This function closes the canvas completely; the
 *  canvas emitter reaches it through `packages/ghost-shim`'s `ghostColor`, which IS this function with the
 *  pack's accent token — one copy, one door (AD-36 amended, Story 4.2; DW-95 closed by Story 4.3). */
export function safeCssColor(value: unknown, fallbackToken: string): string {
  const fallback = CUSTOM_PROPERTY_RE.test(fallbackToken) ? `var(${fallbackToken})` : 'inherit'
  const v = String(value == null ? '' : value).trim()
  if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return v
  const fn = /^(?:rgba?|hsla?)\(([^()]*)\)$/i.exec(v)
  if (fn === null) return fallback
  // The two argument shapes CSS Color 4 admits, and no other: the legacy comma form `n, n, n[, a]`
  // and the modern space form `n n n[ / a]`. A separator-valid but CSS-invalid list — `rgb(1/2/3)`,
  // `rgb(1 2 3 4)`, a trailing comma — is a declaration the browser DROPS, which leaves the element
  // inheriting instead of falling back to the token; so it is refused here (Story 4.2 review). Each
  // part must be a bare number. One linear pass, so no nested quantifier to backtrack on.
  const args = (fn[1] ?? '').trim()
  const comma = args.split(/\s*,\s*/)
  const space = args.split(/\s*\/\s*/).flatMap((side, i) => (i === 0 ? side.split(/\s+/) : [side]))
  const parts = comma.length > 1 ? comma : space
  const legalShape = comma.length > 1 ? comma.length === 3 || comma.length === 4 : /^\S+\s+\S+\s+\S+(\s*\/\s*\S+)?$/.test(args)
  const isNumber = (p: string) => /^[-+]?(?:\d+\.?\d*|\.\d+)(?:%|deg|turn|rad|grad)?$/.test(p)
  return legalShape && parts.every(isNumber) ? v : fallback
}

/** The ten legal `bindingContext` values. There is deliberately no `page`: a page and a post are
 *  ONE resource, and what differs is the product, which `compileTarget` expresses (FR-G3). */
export const BINDING_CONTEXTS = [
  'none', 'post', 'posts', 'tag', 'tags', 'author', 'authors', 'tiers', 'error', 'private',
] as const
export type BindingContext = (typeof BINDING_CONTEXTS)[number]

export const COMPILE_TARGETS = [
  'default.hbs', 'home.hbs', 'index.hbs', 'post.hbs', 'page.hbs',
  'tag.hbs', 'author.hbs', 'error.hbs', 'private.hbs',
] as const
/** A Routes-Manager or membership template: `custom-{name}.hbs` (FR-D6, FR-I1). */
export const CUSTOM_TARGET_RE = /^custom-[a-z0-9][a-z0-9-]*\.hbs$/

export function isCompileTarget(t: string): boolean {
  return (COMPILE_TARGETS as readonly string[]).includes(t) || CUSTOM_TARGET_RE.test(t)
}

/** R-7, half one: `{{pagination}}` outside a paginated context is a FATAL render, not a warning. */
export const PAGINATED_TARGETS: ReadonlySet<string> = new Set([
  'home.hbs', 'index.hbs', 'tag.hbs', 'author.hbs',
])
/** R-7, half two: an error page that queries the database compounds the outage it is reporting. */
export const GET_FORBIDDEN_TARGETS: ReadonlySet<string> = new Set(['error.hbs', 'private.hbs'])

// ─── the control vocabulary (Story 4.5) ──────────────────────────────────────
// AD-34: the rules are data, one copy for the validator, the engine (`section-runtime/src/controls.ts`)
// and the panel. Controls are CLOSED-VALUED and write `data-{name}` on the root (AD-3); content props
// hold content and are a different half of the vocabulary (`PROP_TYPES` below).

/** Appendix C's five control types — the ones that write the root. Nothing else is a control. */
export const CONTROL_TYPES = ['segmented', 'stepper', 'toggle', 'named-select', 'swatch-row'] as const
export type ControlType = (typeof CONTROL_TYPES)[number]

/** Where a design's own control sits in the panel: the accordion its ROLE names (R-113, the owner's test of Story
 *  4.10). `content` — what the section shows: a part shown or hidden, how much of a text, which details; `layout` —
 *  where things sit: columns, alignment, sides, spans, widths; `style` — how it looks: sizes, ratios, rules, shadows,
 *  grounds; `settings` — Section Settings, only for what fits none of those, which is how the section behaves (a
 *  header that sticks while the page scrolls). A control that mixes Off with other values takes the role of what its
 *  other values change. Data is not a control group: a declared query's rows fill it. */
export const CONTROL_GROUPS = ['settings', 'content', 'layout', 'style'] as const
export type ControlGroup = (typeof CONTROL_GROUPS)[number]

/** The panel's accordions, in order (R-113): Section Settings, Content, Layout, Style, Data — and nothing pinned above
 *  them. An absent note names one. */
export const SIDEBAR_GROUPS = ['settings', 'content', 'layout', 'style', 'data'] as const
export type SidebarGroup = (typeof SIDEBAR_GROUPS)[number]

/** The words the panel prints for a value: its declared label, else the value itself with its first letter raised
 *  and hyphens as spaces. The panel and R-114's pill rule read the same words. */
export const valueWords = (valueLabels: Readonly<Record<string, string>> | undefined, value: string): string => {
  // own properties only: `constructor` is a legal kebab value, and a plain object inherits one
  const label = valueLabels !== undefined && Object.hasOwn(valueLabels, value) ? valueLabels[value] : undefined
  return typeof label === 'string' ? label : `${value.charAt(0).toUpperCase()}${value.slice(1).replace(/-/g, ' ')}`
}

/** R-114 (the owner's test of Story 4.10): PILLS ARE FOR SHORT CHOICES. A segmented control draws its values as pills
 *  of equal width in one row across the panel, so it offers two to four values (Appendix C), each at most
 *  `PILL_CHARS` characters — the owner's own measure, "larger in character size", which puts "Spans two columns" in a
 *  dropdown and keeps "Flush left · Centred" as pills — and each fitting its pill on one line with 2 px to spare on
 *  either side. A choice that does not is a named-select, a dropdown. THE FIT IS MEASURED, NOT COUNTED: a word never
 *  wraps, it widens its pill and squeezes the others, and eleven letters fit one of three pills as "Comfortable"
 *  (73 px of 77.7) and do not as "Wholesomely" (80 px). Each character's width is in whole pixels in the pill's own
 *  type — the Kit's segmented label, Inter at 11.5 px, the wider of its medium and semibold weights — measured on the
 *  deployed panel on 2026-09-15 with the web font loaded, and the sums matched the widths the browser drew for real
 *  words. A character not listed counts as the widest. THE TRACK IS THE NARROWEST ONE THE PANEL DRAWS: the segmented
 *  control's inner width in the 280-wide panel while the panel's own scrollbar shows — 280, less its 1 px border, the
 *  8 px bar, 32 px of padding and the track's 3 px either side, 233, measured with real scrollbars. Checked against
 *  every value set the design export declares: of the sets it draws as pills, only the long phrases become dropdowns. */
export const PILL_CHARS = 12
const PILL_GLYPHS: Readonly<Record<number, string>> = {
  3: ' !.:;Iijl’‘·', 4: "'(),/[\\]`rt", 5: '1_f{|}', 6: '"-?L^k“”–', 7: '235#*=>EFJabcdehnpqsuvxyzéèàüñç',
  8: '046789$&+<ABDHKPRSUVYZgo~ö', 9: 'CGNOQTX', 10: 'Mw', 11: '%m…', 12: '@W—',
}
const PILL_WIDEST = 12
const PILL_TRACK = 233
const PILL_ROOM = 4
const glyphWidth = (ch: string): number => {
  for (const [w, chars] of Object.entries(PILL_GLYPHS)) if (chars.includes(ch)) return Number(w)
  return PILL_WIDEST
}

/** A value's width in a pill, in pixels. */
export const pillWidth = (words: string): number => [...words].reduce((sum, ch) => sum + glyphWidth(ch), 0)

/** Why these values cannot be pills, or `null` when they can (R-114). */
export function pillRefusal(values: readonly string[]): string | null {
  if (values.length < 2 || values.length > 4) return `pills offer two to four values, and it offers ${values.length}`
  if (values.some((v) => v.trim() === '')) return 'a pill with no words has nothing to read or to name'
  const long = values.find((v) => [...v].length > PILL_CHARS)
  if (long !== undefined) return `"${long}" is longer than ${PILL_CHARS} characters`
  const pill = PILL_TRACK / values.length
  const wide = values.find((v) => pillWidth(v) + PILL_ROOM > pill)
  return wide === undefined ? null : `"${wide}" is wider than one of ${values.length} pills`
}

/** The seven content editors, by the `contentSchema` prop type each edits. */
export const PROP_TYPES = ['text', 'richtext', 'url', 'image', 'icon', 'date', 'array'] as const
export type PropType = (typeof PROP_TYPES)[number]

/** A control name: kebab-case, because it becomes the attribute name `data-{name}` (AD-3). */
export const CONTROL_NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/** Attribute names that belong to the page or to Ghost, never to a control: Portal's link and its members actions
 *  (`data-members-signout` signs the reader out on a click), the visitor's mode on `:root`, a Koenig card's, a
 *  translation's. A stylesheet may select on them; a control may not be named like one — the validator and the
 *  runtime's AD-36 door read this one copy. */
export const FOREIGN_ATTR_RE = /^(portal|mode)$|^(kg|i18n|members)-/

/** A named value (segmented, named select, toggle's on/off, a role). A stepper's values are integers. */
export const CONTROL_WORD_RE = CONTROL_NAME_RE // one grammar, one regex: a value word is spelt like a name

/** Every value a control may stamp on a root, whatever its type — a word or a small integer. The
 *  runtime re-checks each value against this before it becomes an attribute, so a schema that never
 *  met the validator still cannot put a brace or a quote into either emitter (AD-36). */
export const CONTROL_VALUE_RE = /^(?:[a-z][a-z0-9]*(-[a-z0-9]+)*|[0-9]+)$/

/** ONE GRAMMAR FOR BOTH CAPS, 1 to 100 — `data-repeat-limit`'s rows and `data-items-limit`'s authored items. It is
 *  exported because the number is read everywhere the cap is honoured and a second copy of the range is exactly the drift standing
 *  rule 3 forbids: the validator parses it here, `core.ts` turns it into a `slice` on both emitters, and
 *  `controls.ts` reads it back for the panel's "N shown in this design". (FR-H2 caps `limit="all"` at 100, and
 *  `all` trips gscan on 6.x.) */
export const LIMIT_RE = /^([1-9][0-9]?|100)$/

/** FR-F2 / R-23: no `Inherit`, and no other CSS-wide word, anywhere in a control declaration. */
export const CSS_WIDE_KEYWORDS = ['inherit', 'initial', 'unset', 'revert'] as const

/** FR-F3: the visible-control ceiling for ONE design's own controls. The universal trio and the Data
 *  group are not counted. */
export const CONTROL_CAP = 15

/** The Swatch Row's roles (`prd.md:948`) — five, and no sixth: R-103 refused "None". */
export const BACKGROUND_ROLES = ['base', 'surface', 'accent', 'contrast', 'image'] as const

/** A universal control, declared once and in full. */
export type UniversalDef = {
  readonly name: string
  readonly label: string
  readonly type: ControlType
  /** the accordion its role names (R-113); the panel draws it at that group's foot */
  readonly group: ControlGroup
  readonly values: readonly string[]
  readonly valueLabels: Readonly<Record<string, string>>
  readonly default: string
  /** FR-D7: this control accepts a second value in dark mode */
  readonly darkOverride?: boolean
}

/** The three universal controls (FR-F3, R-23), in the kits' order. Exempt from the cap, narrowed per design only
 *  with a reason, never renamed or added to. All three are how a section looks, so all three sit at the foot of Style
 *  (R-113, whose ruled example names Background, Vertical spacing and Top divider there). The defaults are the schema
 *  defaults `sections-inventory.md:800` names — Base, Comfortable, None. */
export const UNIVERSALS: readonly UniversalDef[] = [
  {
    name: 'bg',
    label: 'Background role',
    type: 'swatch-row',
    group: 'style',
    values: BACKGROUND_ROLES,
    valueLabels: { base: 'Base', surface: 'Surface', accent: 'Accent', contrast: 'Contrast', image: 'Image' },
    default: 'base',
    darkOverride: true,
  },
  {
    name: 'spacing',
    label: 'Vertical spacing',
    type: 'segmented',
    group: 'style',
    values: ['compact', 'comfortable', 'spacious'],
    valueLabels: { compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' },
    default: 'comfortable',
  },
  {
    name: 'divider',
    label: 'Top divider',
    type: 'segmented',
    group: 'style',
    values: ['none', 'line', 'fade'],
    valueLabels: { none: 'None', line: 'Line', fade: 'Fade' },
    default: 'none',
  },
]

/** The universal controls' names — derived, never restated. A design's own `controlSchema` never
 *  lists them; `design.json`'s `universals` narrows them. */
export const UNIVERSAL_CONTROLS: readonly string[] = UNIVERSALS.map((u) => u.name)

/** The Portal actions the Link Picker offers (`prd.md:928`), value → label, in chip order. Upgrade
 *  is `account/plans`: `upgrade` is not a value Portal parses. */
export const PORTAL_ACTIONS: Readonly<Record<string, string>> = {
  signup: 'Sign up',
  signin: 'Sign in',
  account: 'Account',
  'account/plans': 'Upgrade',
}

/** An authored date is the site's wall-clock day, `YYYY-MM-DD`, stored unconverted (`prd.md:952`).
 *  A real calendar day, checked by arithmetic — no `Date`, no clock, no locale (AD-1). */
export function isIsoDate(v: unknown): v is string {
  if (typeof v !== 'string') return false
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  if (m === null) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1]
  return days !== undefined && d >= 1 && d <= days
}

/** An asset id: what an `image` prop stores. The render resolves it through `RenderInput.assets`
 *  (AD-27(b)) — a URL stored in its place is not an id. */
export const ASSET_ID_RE = /^[a-z0-9][a-z0-9_-]*$/

/** R-27 / AD-4: the closed set of inline binding tokens a CONTENT prop may declare. Anything else
 *  a user types between braces stays literal text. Free-form substitution is refused — an
 *  allow-list by construction is the only shape that closes AD-36 rather than filtering it. */
export const INLINE_TOKENS = ['members', 'term', 'n'] as const

/** R-182 (Story 5.16a) — THE ONE TOKEN NO PROP DECLARES, because every `text` and `richtext` prop
 *  accepts it. It is deliberately NOT a fourth `INLINE_TOKENS` member: that list is the closed
 *  PER-FIELD universe `validate.ts` holds a design's `tokens` to, so a design declaring
 *  `{page_number}` is still refused — it has it already. R-27 is otherwise unchanged. */
export const PAGE_NUMBER = 'page_number'

/** R-185 (the owner, 2026-09-23) — EVERY PLACEHOLDER'S ONE LINE, and the only place one lives.
 *  The `{}` menu beside a field's label prints these verbatim, so a placeholder without a line is a
 *  row that explains nothing; `validate.ts` refuses a declared token absent from this map, which is
 *  what makes the promise hold for placeholders nobody has thought of yet rather than decaying into
 *  a note. Its key ORDER is the menu's row order. Written for a customer, not an author. */
export const PLACEHOLDERS: Readonly<Record<string, string>> = {
  members: 'How many members your site has.',
  term: 'What the visitor typed into search.',
  n: 'How many there are — the count this line is about.',
  [PAGE_NUMBER]: 'The number of the page a visitor is on — 2 on page 2, 3 on page 3.',
}

/** R-186 · R-187 — WHICH PLACEHOLDERS THIS FIELD OFFERS, HERE, and the one answer both field kinds,
 *  the tests and any later placeholder ask. Offering is not accepting: a field ACCEPTS
 *  `{page_number}` everywhere and it substitutes by one rule everywhere (R-182), and this says only
 *  where the editor OFFERS to put one in.
 *
 *    the prop's own declared tokens, always
 *    + `page_number` when the canvas shows PAGE 2 and the section is NOT site-wide
 *
 *  Page 2 is R-186: never offered on page 1, and R-176 already withholds page 2 where none exists,
 *  so "paginated content" needs no second test. Site-wide is R-187: a header or footer is one object
 *  on every page (R-180), so offering it there would invite a hole in the same sentence on the front
 *  page. A field with nothing to offer shows no `{}` button at all, and a prop that is not typed into
 *  offers nothing whatever the page. */
export function placeholdersOffered(
  def: { type?: string; tokens?: readonly string[] } | undefined,
  where: { page?: number; siteWide?: boolean } = {},
): string[] {
  if (def?.type !== 'text' && def?.type !== 'richtext') return []
  const own = new Set((def.tokens ?? []).filter((t) => (INLINE_TOKENS as readonly string[]).includes(t)))
  if (where.page === 2 && where.siteWide !== true) own.add(PAGE_NUMBER)
  return Object.keys(PLACEHOLDERS).filter((t) => own.has(t))
}

/** §7.3 gap row 9 — a helper with no bound path, which `data-bind` cannot express. */
export const BARE_HELPERS = [
  'content', 'comments', 'navigation', 'total_members', 'statusCode', 'message', 'content_api_key',
] as const

/** §7.3 gap row 14 / AD-37 — what a design may ask the COMPILER about the page it sits on.
 *  There is no runtime lookup: Ghost's render cannot see the page the editor saw. */
export const ADJACENCY_NEEDS = [
  'section-above', 'image-above', 'last-before-footer', 'share-emitted', 'duplicate-post',
] as const

/** AD-4: the four marks a `richtext` prop may allow, and there are no others. */
export const MARKS = ['strong', 'em', 'u', 'a'] as const

/** R-27 / D9: a link record carries `newTab?` and `rel?`, and the rel values are a closed set. Here
 *  rather than in the serializer because the Link Picker offers exactly this list — one copy. */
export const LINK_RELS = ['nofollow', 'noreferrer', 'sponsored'] as const

/** The four closed member states (§7.3 gap row 4). The paid-vs-free test is not a plain path. */
export const MEMBER_STATES = ['everyone', 'anonymous', 'free', 'paid'] as const

/** Portal reads `form[data-members-form]` itself and applies the loading/success/error classes
 *  (executed on both majors — reconcile-designs-decisions §C-1). Carried from the executed
 *  archetypes for the same reason `data-module` is: it declares real behaviour, not a wart. */
export const MEMBER_FORMS = ['subscribe', 'signin', 'signup'] as const

/** The resources a `{{#get}}` may query (FR-H2's Data group Source). */
export const GET_SOURCES = ['posts', 'tags', 'authors', 'tiers'] as const

// ─── parsers, each returning a failure sentence or null ──────────────────────

const fail = (s: string) => s
const ok = null

const inList = (what: string, list: readonly string[]) => (v: string) =>
  list.includes(v) ? ok : fail(`${what} must be one of ${list.join(' · ')} — got ${JSON.stringify(v)}`)

/** Splits at the FIRST occurrence only, so `date:D MMM YYYY` keeps its colons. */
export function splitFirst(s: string, ch: string): [string, string | undefined] {
  const i = s.indexOf(ch)
  return i === -1 ? [s, undefined] : [s.slice(0, i), s.slice(i + 1)]
}

/** AD-36 (2): parse the binding spec, never interpolate it. Returns the validated parts, or the
 *  sentence saying why not. */
export function parseBindSpec(spec: string): { path: string; helper?: string; arg?: string } | string {
  const [path, helper] = splitFirst(spec, '|')
  if (!PATH_RE.test(path)) {
    return fail(`"${path}" is not a valid binding path (AD-36 2 — dotted identifiers with an optional @ prefix and ../ ascents; braces, quotes, whitespace and backslash are refused)`)
  }
  if (helper === undefined) return { path }
  const [name, arg] = splitFirst(helper, ':')
  if (!Object.prototype.hasOwnProperty.call(HELPERS, name)) {
    return fail(`unknown helper "${name}" — the helper table is closed: ${Object.keys(HELPERS).join(', ')}`)
  }
  const h = HELPERS[name]!
  if (arg === undefined || !h.ok(arg)) {
    const keys = name === 'img_url' ? ` The ${h.param} must be one of FR-J2's image_sizes keys: ${Object.keys(IMAGE_SIZES).join(' · ')} — Ghost has no rendition for anything else and silently serves the original.` : ''
    return fail(`helper "${name}" got an invalid ${h.param} argument ${JSON.stringify(arg)} — the argument is validated against that helper's own rule, never interpolated (AD-36 2).${keys}`)
  }
  return { path, helper: name, arg }
}

/** FR-H8, and the Round-4 defect stated as code: the guard is derived from the BOUND FIELD, never
 *  from a helper argument. `published_at|date:YYYY` guards on `published_at`. The spike took the
 *  last token of the built expression, which is the FORMAT STRING — so `{{#if format=YYYY}}` never
 *  rendered and the content was silently and permanently lost. Callers know the field; they pass it. */
export function guardField(spec: string): string {
  return splitFirst(spec, '|')[0]
}

/** FR-H8's media rule, one sentence for the validator and the runtime alike. A binding into `href`,
 *  `src`, `poster` or `srcset` HIDES its element when the value is empty: the only fallback an attribute
 *  could carry is the design's authored placeholder — `/placeholder.jpg`, a relative URL that 404s on the
 *  customer's site. A picture that falls back to another picture is a second element (`data-if` /
 *  `data-else`), so `fallback` is a TEXT binding's choice. */
export const MEDIA_FALLBACK_REFUSAL =
  'data-empty="fallback" on a binding into href, src, poster or srcset is refused (FR-H8): an empty URL hides its element, because the only fallback an attribute can carry is the design\'s placeholder, a relative URL that 404s on the customer\'s site. Remove data-empty, or write data-empty="hide"; a picture that falls back to another picture is a second element.'

/** true when a `data-bind-attr` list binds any URL-valued attribute — the entry FR-H8 guards on */
export function bindsUrlAttr(list: string): boolean {
  return list.split(';').some((e) => URL_ATTRS.has(splitFirst(e.trim(), ':')[0].trim().toLowerCase()))
}

export function assertBindableAttr(attr: string): string | null {
  const a = attr.toLowerCase()
  if (!BINDABLE_ATTRS.has(a)) {
    return fail(`attribute "${attr}" is not bindable (AD-36 3 — \`style\` and every \`on*\` are absent from the allow-list). Bindable: ${[...BINDABLE_ATTRS].join(', ')}`)
  }
  return ok
}

/** R-27's mixed literal-and-bound form: `signup/{tier}`, `Read by {reading_time} minutes`. Each
 *  `{…}` run is a binding path; everything else is literal. A stray brace is refused rather than
 *  guessed at — an allow-list by construction, never a general substitution pass. */
export function parseTokenTemplate(value: string): string[] | string {
  const paths: string[] = []
  let rest = ''
  const re = /\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  let last = 0
  while ((m = re.exec(value)) !== null) {
    rest += value.slice(last, m.index)
    last = m.index + m[0].length
    const p = m[1] ?? ''
    if (!PATH_RE.test(p)) return fail(`"{${p}}" is not a valid binding path inside a token template (R-27)`)
    paths.push(p)
  }
  rest += value.slice(last)
  if (rest.includes('{') || rest.includes('}')) {
    return fail(`unbalanced brace in ${JSON.stringify(value)} — every \`{…}\` in a token template is a binding path (R-27); nothing else in braces is substituted`)
  }
  return paths
}

/** AD-3's single carve-out, made machine-checkable: an inline `style` may set ONE CSS custom
 *  property and nothing else. `style="color: red"` is refused. A STATIC value must be a pack token
 *  — `--ref-accent: var(--accent)` — because §7.3 forbids a hex outside the Style Pack and a
 *  literal in a design file is exactly that (review 1); the BOUND form is `data-bind-style`. */
export const INLINE_STYLE_RE = /^\s*--[a-zA-Z0-9-]+\s*:\s*var\(--[a-zA-Z0-9-]+\)\s*;?\s*$/

/** The one grammar for a custom-property NAME — `data-bind-style`'s target, `safeCssColor`'s fallback
 *  token and the runtime all read this copy (Story 4.2 review: it had been written three times). */
export const CUSTOM_PROPERTY_RE = /^--[a-zA-Z0-9-]+$/

const attrList = (parseOne: (attr: string, rest: string) => string | null) => (v: string) => {
  for (const entry of v.split(';')) {
    const e = entry.trim()
    if (e === '') continue
    const [attr, rest] = splitFirst(e, ':')
    if (rest === undefined) {
      return fail(`"${e}" is not \`attribute:value\` — the list form is semicolon-separated, e.g. "href:cta.url;title:cta.title"`)
    }
    const r = parseOne(attr.trim(), rest)
    if (r !== null) return r
  }
  return ok
}

const asSpec = (spec: string) => {
  const r = parseBindSpec(spec)
  return typeof r === 'string' ? r : ok
}

/** Story 4.9 — the four attributes that hold visitor-facing TEXT: `data-t-attr` writes only these, and V1's
 *  tree half reads only these. Every other bindable attribute holds a URL, an id, a number or a flag. */
export const TEXT_ATTRS: readonly string[] = ['alt', 'title', 'placeholder', 'aria-label']

/** One `{{t}}` call, parsed: the key, then each `name=spec` param in the order written. */
export type TCall = { key: string; params: { name: string; spec: string }[] }

/** `data-t`'s grammar: the key, then space-separated `name=spec` pairs. `spec` is `data-bind`'s grammar, and a
 *  helper's argument runs to the END of the value — `date=updated_at|date:D MMM YYYY` — so a param written after
 *  it becomes part of the argument and fails that helper's own rule. Returns the call or the sentence why not. */
export function parseTCall(value: string): TCall | string {
  const v = value.trim()
  const cut = v.search(/\s/)
  const key = cut === -1 ? v : v.slice(0, cut)
  if (!CATALOG_KEY_RE.test(key)) {
    return fail(`"${key}" is not a catalog key — dotted namespace.name in lowercase snake_case, never the English string (S1)`)
  }
  const params: TCall['params'] = []
  let rest = cut === -1 ? '' : v.slice(cut).trim()
  while (rest !== '') {
    const m = /^([^=\s]*)=(\S*)/.exec(rest)
    if (m === null) return fail(`"${rest}" is not a name=path param — a {{t}} param is written name=path, e.g. "post.by author=primary_author.name"`)
    const name = m[1] ?? ''
    if (!PLACEHOLDER_NAME_RE.test(name)) return fail(`param "${name}" is not a snake_case placeholder name (S3)`)
    if (params.some((p) => p.name === name)) return fail(`param "${name}" is written twice`)
    // a helper's argument runs to the end of the value: everything after `name=` is the spec
    const spec = (m[2] ?? '').includes('|') ? rest.slice(name.length + 1) : (m[2] ?? '')
    rest = (m[2] ?? '').includes('|') ? '' : rest.slice(m[0].length).trim()
    const bad = asSpec(spec)
    if (bad !== null) return fail(`param ${name}: ${bad}`)
    params.push({ name, spec })
  }
  return { key, params }
}

/** `data-t-attr`'s grammar: entries split on `;`, each `attr:` then `data-t`'s grammar, and `attr` one of the
 *  four text attributes. */
export function parseTAttr(value: string): (TCall & { attr: string })[] | string {
  const out: (TCall & { attr: string })[] = []
  for (const entry of value.split(';')) {
    const e = entry.trim()
    if (e === '') continue
    const [attr, rest] = splitFirst(e, ':')
    const a = attr.trim().toLowerCase()
    if (rest === undefined) return fail(`"${e}" is not \`attribute:key\` — "aria-label:pagination.label;placeholder:member.email_placeholder"`)
    if (!TEXT_ATTRS.includes(a)) return fail(`attribute "${attr.trim()}" does not hold visitor-facing text — data-t-attr writes ${TEXT_ATTRS.join(', ')}`)
    if (out.some((o) => o.attr === a)) return fail(`attribute "${a}" is written twice`)
    const call = parseTCall(rest)
    if (typeof call === 'string') return call
    out.push({ attr: a, ...call })
  }
  return out.length === 0 ? fail('data-t-attr names no attribute') : out
}

/** V2 and V4 over one parsed call, read from the catalog — the validator reports each with its code, and the
 *  runtime throws the same sentence. */
export function tCallRefusals(call: TCall): CatalogRefusal[] {
  const key = tKeyRefusal(call.key)
  if (key !== null) return [key]
  const params = tParamsRefusal(call.key, call.params.map((p) => p.name))
  return params === null ? [] : [params]
}

export type Directive = {
  /** one line, for the refusal message and for `docs/section-authoring.md` */
  readonly summary: string
  /** null when the value is legal, otherwise the sentence saying why not */
  readonly parse: (value: string) => string | null
  /** this directive gives the element a field a `data-empty` guard can be derived from */
  readonly guardable?: boolean
  /** the compiler does NOT consume this one: it survives into the emitted theme, because
   *  something on the live site reads it (Portal, sodo-search, `core`). Every other directive must be
   *  gone from every emitted file, which is what AD-34's leak assertion checks. */
  readonly emitted?: boolean
  /** Story 4.10 (DW-131): this directive's value names a Ghost path, so the runtime's scope walk (`ghostPaths` in
   *  `section-runtime/src/core.ts`) must read it. A test holds every rendered directive carrying the flag to the
   *  walk, so a later one cannot be silently skipped by FR-H7's check. */
  readonly ghostPath?: true
}

/** THE CLOSED SET. A `data-*` attribute that is not in here and is not a declared control on the
 *  root is refused by name. Rows 1–7 and 9–14 of PRD §7.3's gap table and its five exit constructs
 *  each have an entry; row 8 (group-by) is STRUCK — it is the `group-headings` behaviour module,
 *  not a directive, and the row is kept struck because "add a group-by directive" is a proposal
 *  that would otherwise be made again (R-1). */
export const DIRECTIVES: Readonly<Record<string, Directive>> = {
  // ── the proven eight (tools/stress/compile.js, executed) ───────────────────
  'data-prop': {
    summary: "user content into this element's text",
    guardable: true,
    parse: (v) => (PROP_PATH_RE.test(v) ? ok : fail(`"${v}" is not a content prop path`)),
  },
  'data-prop-attr': {
    summary: 'user content into one or more attributes — "href:cta.url;title:cta.title"',
    guardable: true,
    parse: attrList((attr, path) => assertBindableAttr(attr)
      ?? (PROP_PATH_RE.test(path) ? ok : fail(`"${path}" is not a content prop path`))),
  },
  'data-initials': {
    // R-2's typed form: two initials BAKED at compile from a text prop the user typed. A person from
    // Ghost shows ONE letter through the design's stylesheet over the bound name — two letters from
    // Ghost would need `{{split}}`, which is 6.5+ and a gscan error below it.
    summary: "the initials of a typed name into this element's text — the first letter of the first and of the last word: \"people[].name\"",
    guardable: true,
    parse: (v) => (PROP_PATH_RE.test(v) ? ok : fail(`"${v}" is not a content prop path`)),
  },
  'data-bind': {
    summary: "a Ghost value into this element's text — \"published_at|date:D MMM YYYY\"",
    guardable: true,
    ghostPath: true,
    parse: asSpec,
  },
  'data-bind-attr': {
    summary: 'a Ghost value into one or more attributes; a value may mix literal text with {path} tokens (R-27)',
    guardable: true,
    ghostPath: true,
    parse: attrList((attr, spec) => {
      const bad = assertBindableAttr(attr)
      if (bad !== null) return bad
      if (!spec.includes('{')) return asSpec(spec)
      const r = parseTokenTemplate(spec)
      return typeof r === 'string' ? r : ok
    }),
  },
  'data-empty': {
    summary: 'the guard — `hide` removes the element, `fallback` keeps the authored text',
    parse: inList('data-empty', ['hide', 'fallback']),
  },
  'data-repeat': {
    summary: 'repeat over a GHOST source — a context path ({{#foreach}}) or a dataBindings key ({{#get}})',
    ghostPath: true,
    parse: (v) => (PATH_RE.test(v) ? ok : fail(`"${v}" is not a repeat source — a Ghost context path, or a key declared in design.json's dataBindings`)),
  },
  'data-repeat-limit': {
    summary: 'how many rows — 1 to 100 (FR-H2 caps `limit="all"` at 100, and `all` trips gscan on 6.x)',
    parse: (v) => (LIMIT_RE.test(v) ? ok : fail(`"${v}" is not a limit between 1 and 100`)),
  },
  'data-partial': {
    summary: 'extract the repeated body into a parameterless partial of this name',
    parse: (v) => (/^[a-z][a-z0-9-]*$/.test(v) ? ok : fail(`"${v}" is not a partial name (lowercase, digits and hyphens)`)),
  },

  // ── §7.3's gap table ───────────────────────────────────────────────────────
  'data-items': {
    // row 1 — the largest single gap in the library, and named nowhere else
    summary: 'row 1 · repeat over an AUTHORED array prop, baked at compile as N blocks — per-item props are written in full: items[].label',
    parse: (v) => (PROP_PATH_RE.test(v) && !v.endsWith('[]')
      ? ok
      : fail(`"${v}" is not an array prop path — name the array itself ("items") and write its per-item props in full ("items[].label")`)),
  },
  'data-items-limit': {
    // Story 5.11 — FR-D13's per-design cap ("8 items shuffled into a 3-card layout shows 3"), and it must be
    // DECLARED because nothing can derive it: how many items a design's structure fits is decided by its own CSS
    // (`grid-template-columns`), which no parser reads back, and `PropDef.max` is the CATEGORY union's ceiling and
    // cannot narrow per design. Exactly `data-repeat-limit`'s grammar and exactly its shape — a modifier on the
    // element that carries the list — so an author who knows one knows the other. The items past it are NOT
    // removed: they stay in the instance and return with a design that fits them (FR-D19).
    summary: "how many of an AUTHORED list's items this design draws — 1 to 100; the rest stay in the doc (FR-D13)",
    parse: (v) => (LIMIT_RE.test(v) ? ok : fail(`"${v}" is not a limit between 1 and 100`)),
  },
  'data-if': {
    // row 3 — rendered since Story 4.10
    summary: 'row 3 · the first arm of a conditional, shown when the Ghost path holds something ({{#if}}); a data-else on its NEXT element sibling is the other arm',
    ghostPath: true,
    parse: (v) => (PATH_RE.test(v) ? ok : fail(`"${v}" is not a valid path`)),
  },
  'data-else': {
    summary: 'row 3 · the other arm, and it must be the NEXT element sibling of a data-if. Takes no value. (`data-empty` stays the ONE-armed guard.)',
    parse: (v) => (v === '' ? ok : fail(`data-else takes no value — got ${JSON.stringify(v)}`)),
  },
  'data-members': {
    // row 4
    summary: 'row 4 · show this subtree to one member state only; server-rendered, never client-gated — never inside another data-members, never on a data-repeat, data-items, data-if or data-else',
    parse: inList('data-members', MEMBER_STATES),
  },
  'data-when': {
    // row 5
    summary: 'row 5 · positional — render only on this iteration',
    parse: inList('data-when', ['first', 'last', 'even', 'odd']),
  },
  'data-index': {
    summary: 'row 5 · print the iteration number — `number` is 1-based, `index` is 0-based',
    parse: inList('data-index', ['number', 'index']),
  },
  'data-pagination': {
    // row 6
    summary: "row 6 · Ghost's native pagination. Restricts the design to paginated targets (R-7)",
    ghostPath: true,
    parse: inList('data-pagination', ['prev', 'next', 'numbers']),
  },
  // row 7 — nested repeats — needs NO directive: deepest-first ordering, already executed.
  // row 8 — group-by — STRUCK (R-1): it is the `group-headings` behaviour module, not a directive.
  'data-helper': {
    // row 9
    summary: 'row 9 · a bare helper with no bound path',
    ghostPath: true,
    parse: inList('data-helper', BARE_HELPERS),
  },
  'data-target': {
    // row 10
    summary: 'row 10 · emit this subtree only on the named compile target(s) — "page.hbs"',
    parse: (v) => {
      for (const t of v.split(';')) {
        const s = t.trim()
        if (s === '' || !isCompileTarget(s)) return fail(`"${s}" is not a compile target`)
      }
      return ok
    },
  },
  // row 11 — mixed literal-and-bound attribute — folded into data-bind-attr's {token} form above.
  'data-bind-style': {
    // row 12 — AD-3's carve-out made machine-checkable BY CONSTRUCTION: the directive can write
    // nothing but one custom property, so there is no inline declaration left to police.
    summary: 'row 12 · a bound Ghost value into ONE inline CSS custom property — "--tag-accent:accent_color"',
    ghostPath: true,
    parse: (v) => {
      const [prop, spec] = splitFirst(v, ':')
      if (!CUSTOM_PROPERTY_RE.test(prop)) {
        return fail(`"${prop}" is not a CSS custom property — AD-3's carve-out sets a custom property and nothing else`)
      }
      if (spec === undefined) return fail('data-bind-style is "--custom-property:path"')
      return asSpec(spec)
    },
  },
  'data-text': {
    // row 13
    summary: 'row 13 · static and bound text in one node — "Read in {reading_time} minutes"',
    ghostPath: true,
    parse: (v) => {
      const r = parseTokenTemplate(v)
      if (typeof r === 'string') return r
      return r.length === 0
        ? fail('data-text carries no {path} token — use plain text, or data-bind for a whole-node binding')
        : ok
    },
  },
  'data-needs': {
    // row 14 — AD-37: the compiler answers from the placement list. There is no runtime lookup.
    summary: 'row 14 · a compile-time question about the page this section sits on; the compiler bakes the answer in',
    parse: inList('data-needs', ADJACENCY_NEEDS),
  },

  // ── the five "E4 does not exit until they are in" constructs ───────────────
  // exit 1 is row 2 (a {{#get}} via data-repeat + dataBindings); exit 2 is row 4 (data-members).
  'data-t': {
    // exit 3 — Story 4.9: the catalog's key, then each placeholder as a guarded name=path param
    summary: 'exit 3 · a chrome string by catalog key, with each placeholder as a name=path param — "post.by author=primary_author.name" emits {{t "post.by" author=primary_author.name}}, guarded on each param. JS-written strings emit data-i18n-* instead',
    ghostPath: true,
    parse: (v) => {
      const r = parseTCall(v)
      return typeof r === 'string' ? r : ok
    },
  },
  'data-t-attr': {
    summary: 'exit 3 · a chrome string into alt, title, placeholder or aria-label — "aria-label:pagination.label;placeholder:member.email_placeholder"',
    ghostPath: true,
    parse: (v) => {
      const r = parseTAttr(v)
      return typeof r === 'string' ? r : ok
    },
  },
  'data-bind-srcset': {
    // exit 4 — the binding grammar produces one expression per attribute, and srcset needs a set.
    summary: 'exit 4 · a responsive image set — "feature_image|img_url"; the shim emits a Ghost-shaped srcset, one candidate per image_sizes key (sizes is the design\'s own attribute, never emitted)',
    guardable: true,
    ghostPath: true,
    parse: (v) => {
      const [path, helper] = splitFirst(v, '|')
      if (!PATH_RE.test(path)) return fail(`"${path}" is not a valid binding path`)
      if (helper !== 'img_url') return fail('data-bind-srcset takes exactly "path|img_url" — the sizes are the shim\'s, not the design\'s')
      return ok
    },
  },
  // exit 5 — control → data-{control} on the root — is NOT a directive. The root's control
  // attributes are generated from `controlSchema`, and the validator asserts the two match in both
  // directions (see validate.ts).

  // ── carried from the executed harness, for the same reason each other one is ──
  'data-module': {
    // Story 4.7 — it SURVIVES: `core` scans the live page for it and mounts the module on this element.
    summary: "the behaviour module mounted on this element, from FR-G7's registry, optionally with the width in CSS pixels below which it runs — \"accordion\" or \"accordion:768\". FR-G3's `js` is read from it; core mounts on it",
    emitted: true,
    parse: (v) => {
      const r = parseModuleDeclaration(v)
      return typeof r === 'string' ? fail(r) : ok
    },
  },
  'data-members-form': {
    summary: 'Portal reads this itself and applies the loading/success/error classes. With JavaScript off, nothing happens (R-5)',
    emitted: true,
    parse: inList('data-members-form', MEMBER_FORMS),
  },
  // Story 4.10 — Portal's own form attributes, read in @tryghost/portal 2.51.5 and 2.69.339 (umd/portal.min.js):
  // Portal submits `input[data-members-email]`'s value and writes its message into `[data-members-error]`, so a
  // form without the first submits nothing. Valueless and KEPT, as `data-members-form` is.
  'data-members-email': {
    summary: "Portal reads the email to submit from the input carrying this, inside a data-members-form. Takes no value",
    emitted: true,
    parse: (v) => (v === '' ? ok : fail(`data-members-email takes no value — got ${JSON.stringify(v)}`)),
  },
  'data-members-error': {
    summary: "Portal writes the form's error message into the element carrying this. Takes no value",
    emitted: true,
    parse: (v) => (v === '' ? ok : fail(`data-members-error takes no value — got ${JSON.stringify(v)}`)),
  },
  'data-ghost-search': {
    summary: "open Ghost's native search (R-24, FR-F6). Takes no value — sodo-search binds the attribute",
    emitted: true,
    parse: (v) => (v === '' ? ok : fail(`data-ghost-search takes no value — got ${JSON.stringify(v)}`)),
  },
}

/** AD-34's leak assertion, as data rather than as a list in prose: every directive the COMPILER
 *  consumes must be gone from every emitted file. Derived, never restated — the seven names that
 *  assertion used to carry were the spike's, and they were stale the moment §7.3's gap table was
 *  answered. The ones marked `emitted: true` survive because something on the live site reads them:
 *  Portal, sodo-search, and since Story 4.7 `core`. */
export const CONSUMED_DIRECTIVES: readonly string[] =
  Object.keys(DIRECTIVES).filter((k) => DIRECTIVES[k]?.emitted !== true)

/** The leak assertion itself, so the harness and its tests run ONE regex. A directive is an
 *  attribute NAME: it ends at whitespace, `=`, `/` or `>` — a valueless `data-else` followed by
 *  `class="x"` is a leak too (review 1 found the first version matched only `=` and `>`). */
export const CONSUMED_DIRECTIVE_RE = new RegExp(`\\s(?:${CONSUMED_DIRECTIVES.join('|')})(?=[\\s=/>])`)

/** `data-prop-attr2` was never normative — FR-G3 and §7.3 name eight directives and it is not among
 *  them. It existed only because an HTML attribute cannot repeat; the list form replaced it. Named
 *  here so its refusal says WHY rather than "unknown directive". */
export const RETIRED_DIRECTIVES: Readonly<Record<string, string>> = {
  'data-prop-attr2': 'retired — `data-prop-attr` takes a semicolon-separated list: "href:cta.url;title:cta.title"',
  'data-bind-attr2': 'retired — `data-bind-attr` takes a semicolon-separated list',
}
