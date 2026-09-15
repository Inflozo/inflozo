// The section runtime's shared walk — ONE implementation, feeding both emitters.
//
// §7.3's central claim is that the canvas and the shipped theme agree BY CONSTRUCTION, and the
// justification is "the same code ran". That is only a claim while two functions exist; this file
// is the code, and `agreement.test.ts` is the proof. The emitters differ in exactly TWO places and
// both are marked `THE DIFFERENCE` below:
//
//   1. a repeat EXPANDS against real rows on the canvas and becomes `{{#foreach}}` in the theme
//   2. a binding RESOLVES to a value on the canvas and becomes a mustache in the theme
//
// Everything else — the element tree, the classes, the control attributes, the consumed directives,
// the URL scheme check, the attribute allow-list, the CSS colour parser, FR-H8's guard — is the same
// statements running once.
//
// AD-1, made structural: the DOM is a PARAMETER. Nothing here reaches a global, imports a Node
// builtin, reads a clock or asks for entropy; `eslint.config.js` is the gate, not this comment.

import {
  ASSET_ID_RE,
  CATALOG,
  CONSUMED_DIRECTIVES,
  CONTROL_NAME_RE,
  CONTROL_VALUE_RE,
  DIRECTIVES,
  GET_FORBIDDEN_TARGETS,
  HELPERS,
  IMAGE_SIZES,
  MEMBER_STATES,
  PAGINATED_TARGETS,
  MEDIA_FALLBACK_REFUSAL,
  MODULES,
  TEXT_ATTRS,
  TEXT_DIRECTIVES,
  URL_ATTRS,
  assertBindableAttr as parseBindableAttr,
  bindable,
  catalogPropRefusal,
  fieldKind,
  guardField,
  i18nAttr,
  isIsoDate,
  moduleStringsRefusals,
  parseBindSpec,
  parseModuleDeclaration,
  parseTAttr,
  parseTCall,
  parseTokenTemplate,
  resolveStrings,
  safeUrl,
  splitFirst,
  tCallRefusals,
} from '@inflozo/library'
import type { BindingUse, ControlDef, DataBinding, IconLookup, PropDef, ScopeEntry, TCall, UniversalNarrowing } from '@inflozo/library'
// Story 4.3. The spine's package table says the three core packages may depend on `library` AND on
// each other, so this import is inside the dependency rule. The DOM is injected because AD-1 forbids
// reaching a global; the shim is PURE, so there is nothing to inject around it and threading it
// through the walk would be more code for no property.
import {
  bareHelper,
  excerpt,
  formatDate,
  getExprs,
  ghostColor,
  ghostUrl,
  imgUrl,
  navigationItems,
  pageUrl,
  paginationContext,
  readingTime,
  srcset,
  t,
} from '@inflozo/ghost-shim'
import { escapeUserText, isRich, linkAttributes, serializeMarks } from './marks.ts'
import type { PropValue } from './marks.ts'
import { resolveControls, withData } from './controls.ts'

export { formatDate }

// ─── the injected DOM, typed by the members this file actually uses ──────────
// AD-1: "a DOM global it did not receive as an argument". Declaring the surface rather than
// importing `lib.dom` is what makes that structural — there is no ambient `document` in scope to
// reach for by accident, and the browser's `window.document` and a jsdom document both satisfy it.

export type RuntimeNode = object

export type RuntimeElement = {
  readonly tagName: string
  innerHTML: string
  readonly outerHTML: string
  textContent: string | null
  readonly parentElement: RuntimeElement | null
  readonly firstElementChild: RuntimeElement | null
  /** Story 4.10 — a data-else is paired with the data-if on its previous element sibling */
  readonly previousElementSibling: RuntimeElement | null
  readonly nextElementSibling: RuntimeElement | null
  readonly attributes: Iterable<{ name: string; value: string }>
  /** Story 4.9 — V1's tree half reads each element's own text nodes (`nodeType` 3) */
  readonly childNodes: Iterable<{ readonly nodeType: number; readonly textContent: string | null }>
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
  removeAttribute(name: string): void
  querySelectorAll(selector: string): Iterable<RuntimeElement>
  matches(selector: string): boolean
  contains(other: RuntimeElement): boolean
  cloneNode(deep: boolean): RuntimeElement
  remove(): void
  append(node: RuntimeNode): void
  before(node: RuntimeNode): void
  after(node: RuntimeNode): void
  replaceWith(node: RuntimeNode): void
}

export type RuntimeDocument = {
  createElement(tag: string): RuntimeElement
  createComment(data: string): RuntimeNode
}

// ─── what a render is given ──────────────────────────────────────────────────

export type RenderInput = {
  /** the user's content: nested objects addressed by the dotted prop paths `content.json`
   *  declares — `cta.url` reads `content.cta.url` */
  content?: Readonly<Record<string, unknown>>
  /** the Ghost render context a binding resolves against. Canvas only — the theme defers it. */
  ghost?: Readonly<Record<string, unknown>>
  /** the CATEGORY's `contentSchema`. AD-4's per-prop mark and token allow-lists live here, so a
   *  prop with no entry is plain text by construction rather than by filtering. */
  schema?: Readonly<Record<string, PropDef>>
  /** R-27's inline binding token values — `{members}`, `{term}`, `{n}` */
  tokens?: Readonly<Record<string, string>>
  /** R2-5: when a caller compiles MANY sections into one theme, it passes one shared `UserText` and
   *  substitutes last, over the whole emitted file tree. Omitted, the theme emitter makes its own
   *  and substitutes immediately, which is the single-section case. */
  users?: UserText
  /** Story 4.3 — what the SHIM needs to imitate the connected Ghost on the canvas. Every field is
   *  a value the caller fetched; nothing here is read from a machine (AD-1). */
  site?: {
    /** the connected site's URL. `img_url` needs it to recognise a same-origin image as
     *  Ghost-hosted, and Ghost answers with a RELATIVE sized URL, so the canvas re-absolutises. */
    url?: string
    /** which Ghost major the connected site runs — `{{total_members}}` brackets differ */
    major?: '5' | '6'
    /** the member counts the site reported, for the two count helpers */
    members?: { total?: number; paid?: number }
    /** `{{navigation}}`'s items, from the connection's settings snapshot */
    navigation?: readonly { label?: unknown; url?: unknown; current?: unknown }[]
    /** the pagination context this render sits on */
    pagination?: Readonly<Record<string, unknown>>
    /** the archive the feed sits on — `/` on the home feed, `/tag/craft/` on a tag archive */
    paginationBase?: string
    /** the page being previewed, so `{{navigation}}` can mark the current item */
    currentUrl?: string
  }
  /** Story 4.4's fixtures. `{{content}}` and `{{comments}}` resolve to what the shim is HANDED; with
   *  none, the shim refuses rather than inventing a body (FR-H3). */
  fixtures?: Readonly<Record<string, string>>
  /** `design.json`'s `dataBindings` — the `{{#get}}` declarations a `data-repeat` names by key. */
  dataBindings?: Readonly<Record<string, DataBinding>>
  /** the rows the CALLER fetched for each `dataBindings` key. The shim builds the query; the editor
   *  runs it, because AD-1 bans `fetch` in a core package. Every declared key MUST have an entry —
   *  `[]` while the query is in flight — because an absent entry is refused, not rendered empty. */
  getRows?: Readonly<Record<string, readonly unknown[]>>
  /** the compile target this render is for. `data-pagination` requires a paginated one (R-7) — a
   *  `{{pagination}}` outside a paginated context is a FATAL render, not a warning. Named, every Ghost
   *  binding is checked against the context matrix at its scope (FR-H7, Story 4.6) and a field the
   *  matrix types `number` guards with `includeZero=true`; a render naming no template cannot be checked. */
  target?: string

  // ── Story 4.5 — the controls engine's one door into both emitters ──────────
  /** the DESIGN's `controlSchema`. Given, the root's control attributes are `resolveControls`' and
   *  nothing else — the authored ones are removed first; omitted, the authored root stands. */
  controlSchema?: readonly ControlDef[]
  /** the design's universal narrowings (R-23); an empty `values` is R-103's no-value lock */
  universals?: Readonly<Record<string, UniversalNarrowing>>
  /** the instance's STORED control values — data, not a type: junk is resolved away, never thrown */
  controls?: Readonly<Record<string, unknown>>
  /** the instance's stored Count and Order per `dataBindings` key, folded in by `withData` */
  data?: Readonly<Record<string, unknown>>
  /** AD-27(b): asset id → URL. An `image` prop stores an id and resolves ONLY through here — the
   *  review page hands it the sample pool, Epic 7 the theme's asset paths. */
  assets?: Readonly<Record<string, string>>
  /** the library's icon lookup (`@inflozo/library/icons`), handed in so the core never imports the
   *  drawings. A design with an `icon` prop rendered without it refuses by name. */
  icons?: IconLookup

  // ── Story 4.9 — the string catalog ──────────────────────────────────────────
  /** the project's strings: every catalog key's English default or the customer's override, as
   *  `resolveStrings` returns them. The canvas renders `data-t` over it and both emitters stamp a module's js
   *  keys from it (S5); the theme's `data-t` is `{{t}}`, which Ghost resolves from the locale file. Omitted, the
   *  catalog's English. Whatever is handed passes `resolveStrings` again here, so a `credit.*` override or an
   *  unknown key throws at the render door too (S7). */
  strings?: Readonly<Record<string, string>>

  // ── Story 4.10 — member gating, on both emitters (§7.3 gap row 4, FR-D16, R-4) ──
  /** the visitor the CANVAS previews: `data-members` keeps an element whose value is `everyone` or this state, and
   *  drops the rest. `comped` previews as `paid` (Ghost's `paid` is `status !== 'free'`). Default `anonymous`. The
   *  theme ignores it: Ghost decides per request, server-side, from `{{#if @member}}` and `{{#if @member.paid}}`. */
  member?: Exclude<MemberState, 'everyone'>
  /** the section's show-to (Layers' Member visibility, Story 5.4's control): the root is gated as if it carried
   *  `data-members` with this value, on both emitters. Default `everyone`, which gates nothing. */
  visibility?: MemberState
}

export type MemberState = (typeof MEMBER_STATES)[number]

// R2-7: the compiler's own tokens are built from C0 control characters, which a section author's
// `index.html` cannot carry as text — so a design containing `<!--__HBS_0__-->` is inert instead of
// duplicating a `{{#foreach}}` block. `escapeUserText` DROPS these, so no paste can forge one.
export const T0 = String.fromCharCode(1)
export const T1 = String.fromCharCode(2)
export const U0 = String.fromCharCode(3)
export const U1 = String.fromCharCode(4)

/** Handlebars expressions, parked as tokens while the tree is still a DOM and substituted into the
 *  serialized string afterwards — AD-4/AD-5: no document ever parses the result. */
export class Tokens {
  map: [string, string][] = []

  put(expr: string): string {
    const t = `${T0}${this.map.length}${T1}`
    this.map.push([t, expr])
    return t
  }

  resolve(html: string): string {
    const wrapped = new RegExp(`<!--(${T0}\\d+${T1})-->`, 'g')
    let out = html
    // REVERSE insertion order, and it is load-bearing once repeats nest. Repeats are processed
    // deepest-first, so an inner repeat's tokens are inserted BEFORE the outer replacement that
    // carries them into the string. Forward order substitutes the inner tokens before they exist
    // and ships them raw (the spike's defect).
    //
    // The unwrap runs INSIDE the loop, and that is the second half of the same defect. A DOM can
    // only carry a token where a node is legal, so `wrapGuard` and a repeat replacement both park
    // theirs in a comment; every substitution can therefore re-introduce a comment-wrapped marker
    // belonging to a token not yet substituted. Unwrapping once at the top leaves those wrapped:
    // executed against the pre-4.2 compiler, a `data-empty` guard inside a NESTED repeat shipped as
    // `<!--{{#if url}}-->`, and the nested `{{#foreach}}` itself shipped wrapped in a comment — so
    // every row it rendered was inside an HTML comment and invisible on the live site. It never
    // fired only because no fixture had a guard inside a nested repeat; FR-H8's unconditional guard
    // (Story 4.2) puts one in every design that has one.
    for (let i = this.map.length - 1; i >= 0; i--) {
      out = out.replace(wrapped, '$1')
      const [t, expr] = this.map[i] as [string, string]
      out = out.split(t).join(expr)
    }
    return out.replace(wrapped, '$1')
  }
}

/** User content, parked as markers and serialized by `marks.ts` into the emitted STRING (AD-4).
 *  R2-5: `substitute` runs LAST, over every emitted file — template and every partial. */
export class UserText {
  map: PropValue[] = []
  paths: string[] = []
  schema: Readonly<Record<string, PropDef>>
  tokens: Readonly<Record<string, string>>

  constructor(
    schema: Readonly<Record<string, PropDef>> = {},
    tokens: Readonly<Record<string, string>> = {},
  ) {
    this.schema = schema
    this.tokens = tokens
  }

  put(path: string, value: PropValue): string {
    const m = `${U0}${this.map.length}${U1}`
    this.map.push(value)
    this.paths.push(path)
    return m
  }

  /** ONE regex pass, never a loop of per-marker replaces. A sequential loop re-scans its own
   *  output: a user who types the marker shape for slot 0 inside the text of slot 3 gets that shape
   *  written into the file AFTER slot 0 was processed, and it ships raw. Escaping cannot save this
   *  — the marker is not made of escapable characters. Single-pass never revisits what it wrote. */
  substitute(text: string): string {
    return text.replace(new RegExp(`${U0}(\\d+)${U1}`, 'g'), (whole, i: string) => {
      const n = Number(i)
      if (n >= this.map.length) return whole
      return serializeMarks(this.map[n], this.schema[this.paths[n] as string], this.tokens)
    })
  }
}

// ─── the closed set this story renders, and the one it refuses ───────────────

/** Every directive the runtime consumes TODAY. Everything else in the vocabulary refuses by name.
 *  The partition is asserted against `CONSUMED_DIRECTIVES` by a test, so a directive added to the
 *  vocabulary later cannot be silently forgotten by the runtime (standing rule 4: derived, never
 *  restated). */
export const RENDERED_DIRECTIVES: readonly string[] = [
  'data-prop',
  'data-prop-attr',
  'data-bind',
  'data-bind-attr',
  'data-bind-style',
  'data-empty',
  'data-repeat',
  'data-repeat-limit',
  'data-partial',
  // Story 4.3 — the three the shim owns. They come off the refused list in the same pass that
  // builds the shim, because a shim nothing calls proves nothing.
  'data-bind-srcset',
  'data-helper',
  'data-pagination',
  // Story 4.5 — an AUTHORED array, baked as N copies on both emitters (§7.3 gap row 1)
  'data-items',
  // Story 4.6 — R-2's typed avatar initials, through the user-text path
  'data-initials',
  // Story 4.9 — a chrome string by catalog key: `{{t}}` on the theme, the handed string on the canvas
  'data-t',
  'data-t-attr',
  // Story 4.10 — §7.3 gap row 3, the two arms, and row 4 (exit construct 2), member gating
  'data-if',
  'data-else',
  'data-members',
]

/** Derived, not written down. `data-needs` is AD-37's
 *  compile-time placement question, and the rest are later stories'. They REFUSE rather than
 *  leak. */
export const REFUSED_DIRECTIVES: readonly string[] = CONSUMED_DIRECTIVES.filter(
  (d) => !RENDERED_DIRECTIVES.includes(d),
)

/** The directives both emitters parse and KEEP, because something on the live site reads them — derived. */
const EMITTED_DIRECTIVES: readonly string[] = Object.keys(DIRECTIVES).filter((d) => DIRECTIVES[d]?.emitted === true)

// ─── small shared helpers ────────────────────────────────────────────────────

const all = (scope: RuntimeElement, selector: string): RuntimeElement[] => [
  ...scope.querySelectorAll(selector),
  ...(scope.matches(selector) ? [scope] : []),
]

/** Own properties only: Handlebars resolves `constructor` or `toString` to nothing, so the canvas
 *  must too, or a path typo renders `function String() { [native code] }` here and blank there. */
const get = (o: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((a, k) => {
    if (a == null || typeof a !== 'object') return undefined
    return Object.prototype.hasOwnProperty.call(a, k) ? (a as Record<string, unknown>)[k] : undefined
  }, o)

/** Handlebars' `{{#if}}` takes the `{{else}}` branch for `''`, `0`, `false`, `null`, `undefined`
 *  and `[]` — `helpers/if.js:16` with `utils.js` `isEmpty`, read in handlebars 4.7.9, the version
 *  Ghost's `express-hbs` pins. The canvas mirrors that exactly, so a cleared field falls back HERE
 *  the way it falls back on the live site, rather than showing an empty string. */
const isEmpty = (v: unknown, includeZero = false): boolean =>
  v == null || v === '' || v === false || (v === 0 && !includeZero) || (Array.isArray(v) && v.length === 0)

/** A content prop is "unset" when it holds nothing a reader would see. */
const propEmpty = (v: unknown): boolean => v == null || v === '' || (isRich(v) && v.text === '')

const depth = (el: RuntimeElement): number => {
  let d = 0
  for (let p: RuntimeElement | null = el; p !== null; p = p.parentElement) d++
  return d
}

/** True when `el` sits inside another `data-repeat` that is itself inside `scope`. */
const insideRepeat = (el: RuntimeElement, scope: RuntimeElement): boolean => {
  for (let p = el.parentElement; p !== null && p !== scope; p = p.parentElement) {
    if (p.getAttribute('data-repeat') !== null) return true
  }
  return false
}

/** Static text authored by the DESIGN, on its way back into the emitted string. Not user text —
 *  AD-5's brace rule is not applied, because a design's own `{{` would be a validator failure
 *  (4.1), not something to neutralise here. */
const escStatic = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escAttr = (s: string): string => escStatic(s).replace(/"/g, '&quot;')

/** A content prop's value. A per-item path — `features[].title` — reads item i of the array being
 *  expanded, which `items` carries; outside an expansion it reads nothing. */
function propGet(content: unknown, path: string, items?: Readonly<Record<string, unknown>>): unknown {
  const cut = path.indexOf('[].')
  if (cut === -1) return get(content, path)
  const base = path.slice(0, cut)
  return items !== undefined && Object.prototype.hasOwnProperty.call(items, base) ? get(items[base], path.slice(cut + 3)) : undefined
}

/** THE directive reader. Every rendered directive is read through here: the value is validated by
 *  the library's own grammar for that directive — the one copy 4.1's validator uses — and refused
 *  by name before it can reach any syntax, then the attribute is consumed. This is AD-36 (2) made
 *  mechanical: `data-repeat`, `data-repeat-limit` and `data-partial` used to be interpolated into
 *  `{{#foreach}}` unvalidated (Story 4.2 review — `data-repeat='posts}}<script>'` shipped a live
 *  script), and the fix that closes the class is that nothing reads a directive any other way.
 *  `data-empty` is one exception to the consume: it is shared by every directive on its element
 *  and is swept at the end of the walk, so the first reader cannot rob the second. A directive the
 *  vocabulary marks `emitted` is the other: it is parsed and KEPT, because the live site reads it. */
function consume(el: RuntimeElement, name: string): string | null {
  const v = el.getAttribute(name)
  if (v === null) return null
  const d = DIRECTIVES[name]
  if (d === undefined) throw new Error(`"${name}" is not in the vocabulary`)
  const bad = d.parse(v) // null when legal
  if (bad !== null) throw new Error(`AD-36: ${name}=${JSON.stringify(v)} — ${bad}`)
  if (name !== 'data-empty' && d.emitted !== true) el.removeAttribute(name)
  return v
}

/** AD-36 (2), as ONE copy of the grammar: the library parses the spec and this rebuilds the
 *  mustache from the validated parts. Nothing here concatenates an unvalidated string into syntax. */
export function bindExpr(spec: string): string {
  const parsed = parseBindSpec(spec)
  if (typeof parsed === 'string') throw new Error(`AD-36: ${parsed}`)
  if (parsed.helper === undefined) return `{{${parsed.path}}}`
  const h = HELPERS[parsed.helper] as { param: string }
  return `{{${parsed.helper} ${parsed.path} ${h.param}="${parsed.arg ?? ''}"}}`
}

/** FR-J5 / exit construct 4. `{{img_url}}` returns a single URL string and emits NO `srcset` at
 *  all, so the THEME composes one — one candidate per FR-J2 `image_sizes` key, from the one map,
 *  each expression built by `bindExpr` so the path and the size are validated rather than
 *  interpolated (AD-36 2). The `sizes` attribute is NOT emitted and is not bindable: it describes
 *  the design's own layout, which the design knows and the runtime does not. */
export function srcsetExpr(path: string): string {
  return Object.entries(IMAGE_SIZES)
    .map(([key, width]) => `${bindExpr(`${path}|img_url:${key}`)} ${width}w`)
    .join(', ')
}

export function assertBindableAttr(attr: string): string {
  const bad = parseBindableAttr(attr)
  if (bad !== null) throw new Error(`AD-36: ${bad}`)
  return attr.toLowerCase()
}


// ─── FR-H8, and the defect it was written from ───────────────────────────────

type Guard = 'hide' | 'fallback'

/** FR-H8: "every bound prop compiles inside a guard; **the unguarded state is unreachable**". Two
 *  behaviours, chosen per binding, DEFAULTING BY KIND — which is the half the stress harness never
 *  had, because it guarded only when a design wrote `data-empty`:
 *
 *    text  → `fallback`, the static value the prop held before it was bound
 *    media → `hide`, the element it occupies — and a binding into a URL-valued attribute IS the
 *            media case, which is what makes the default mechanical rather than a judgement
 *
 *  `data-empty` overrides either way, and a value outside `hide`/`fallback` is refused, not ignored. */
function guardMode(el: RuntimeElement, media: boolean): Guard {
  const declared = consume(el, 'data-empty')
  if (declared === 'hide' || declared === 'fallback') return declared
  return media ? 'hide' : 'fallback'
}

/** The guard field is `guardField(spec)` — the BOUND FIELD, never a helper argument. The spike
 *  parsed the field back out of the built expression with `.split(' ').pop()`, which for
 *  `published_at|date:YYYY` took the FORMAT STRING and emitted `{{#if format=YYYY}}`: a guard on an
 *  identifier that does not exist, so the block never rendered and the content was silently and
 *  permanently lost. A garbage guard is *present*, which is why "is there a guard?" passed. */
function wrapGuard(doc: RuntimeDocument, el: RuntimeElement, field: string, tokens: Tokens, zero = false): void {
  // ONE guard per field per element, whichever directive asked first — a `data-if` on `@site.logo` and the media
  // guard of `src:@site.logo` on the same <img> share `{{#if @site.logo}}` (Story 4.10)
  if (guarded.get(el)?.has(field) === true) return
  el.before(doc.createComment(tokens.put(ifOpen(field, zero))))
  el.after(doc.createComment(tokens.put('{{/if}}')))
  guarded.set(el, new Set([...(guarded.get(el) ?? []), field]))
}
/** FR-H8's one guard form — `{{#if}}` on the bound field, never `{{#has}}` or `{{#unless}}`. A field the
 *  matrix types `number` adds `includeZero=true`: Handlebars 4.7.9's `helpers/if.js` takes the else
 *  branch for `0` without it, while `{{f}}` prints `0`, so a count of zero — or Ghost's "1 min read"
 *  over an API `reading_time` of 0, recorded on both majors — would show the design's placeholder.
 *  gscan 6.4.2's one-argument rule counts positional params only, and both majors took it at upload. */
const ifOpen = (field: string, zero: boolean): string => `{{#if ${field}${zero ? ' includeZero=true' : ''}}}`

/** which fields each element is already guarded on, so two directives on one element — `data-bind`,
 *  `data-bind-attr`, `data-bind-srcset`, `data-pagination` or a `data-t` param, any pair — emit ONE guard
 *  when they guard on the same field, and one each when they do not */
const guarded = new WeakMap<RuntimeElement, Set<string>>()

/** an OWN property or nothing — `dataBindings['constructor']` must not be Object's function */
function own<T>(o: Readonly<Record<string, T>> | undefined, k: string): T | undefined {
  return o !== undefined && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined
}

const oneNumberOnePlace = (source: string): string =>
  `data-repeat="${source}" names the {{#get}} query "${source}", which declares its own limit in ` +
  `dataBindings, and the element also carries data-repeat-limit. One number, one place: the query's.`

// ─── the walk ────────────────────────────────────────────────────────────────

/** Refuse, by name, every directive in 4.1's closed set that this story does not emit. A directive
 *  left in the output would be styled by the design's own stylesheet and would leak past AD-34's
 *  gate as a silently-ignored attribute, so "not implemented" must be a throw and never a no-op.
 *  The same rule covers a repeat MODIFIER with no repeat to modify: `data-partial` and
 *  `data-repeat-limit` off a `data-repeat` have no consumer and would survive verbatim. */
function refuseUnrendered(root: RuntimeElement): void {
  for (const d of REFUSED_DIRECTIVES) {
    if (all(root, `[${d}]`).length === 0) continue
    throw new Error(
      `the section runtime does not emit "${d}" yet — ${DIRECTIVES[d]?.summary ?? ''}. ` +
        `It is in the authoring vocabulary and the story that owns it will render it; until then a ` +
        `design using it is refused rather than compiled with the directive ignored.`,
    )
  }
  for (const d of ['data-partial', 'data-repeat-limit']) {
    if (all(root, `[${d}]:not([data-repeat])`).length > 0) {
      throw new Error(`"${d}" modifies a data-repeat and this element has none — it would ship verbatim`)
    }
  }
}

/** R-7, half one, made a refusal rather than a warning: `{{pagination}}` outside a paginated
 *  context is a FATAL render. `compileTarget` is where the library states it (`validate.ts`'s
 *  `pagination-target`); this is the same rule at render, because a render with no target named is
 *  a render that cannot show it is legal. */
function refuseUnpaginated(root: RuntimeElement, target?: string): void {
  if (all(root, '[data-pagination]').length === 0) return
  if (target !== undefined && PAGINATED_TARGETS.has(target)) return
  throw new Error(
    `data-pagination restricts this design to a paginated target (R-7) and this render names ` +
      `${target === undefined ? 'none' : `"${target}"`}. Paginated: ${[...PAGINATED_TARGETS].join(', ')}. ` +
      `A {{pagination}} outside a paginated context is a FATAL render, not a warning.`,
  )
}

/** R-7, half two, at render: a `{{#get}}` on the error or private template compounds the outage it
 *  is reporting. `validate.ts`'s `get-target` states it for the design; this is the same rule for a
 *  render that NAMES one of those targets. A render naming no target is not refused here — unlike
 *  pagination, a query outside a paginated context is not illegal by itself. */
function refuseGetOnForbiddenTarget(root: RuntimeElement, input: RenderInput): void {
  if (input.target === undefined || !GET_FORBIDDEN_TARGETS.has(input.target)) return
  for (const el of all(root, '[data-repeat]')) {
    const key = el.getAttribute('data-repeat') ?? ''
    if (own(input.dataBindings, key) !== undefined) {
      throw new Error(
        `data-repeat="${key}" is a {{#get}} and this render names "${input.target}". An error page ` +
          `that queries the database compounds the outage it is reporting (R-7).`,
      )
    }
  }
}

// ─── FR-H7 — the scope walk (Story 4.6) ──────────────────────────────────────

/** What a `data-repeat` opens: a `dataBindings` key is a `{{#get}}` over its source's rows; anything
 *  else is a context path. An authored `data-items` list opens no Ghost scope. */
function repeatEntry(source: string, input: RenderInput): ScopeEntry {
  const q = own(input.dataBindings, source)
  return q === undefined ? source : { get: q.source }
}

/** The enclosing repeats of `el`, outer first — itself included when `self` (its own bindings sit
 *  inside its own rows; its repeat source does not). */
function scopeOf(el: RuntimeElement, root: RuntimeElement, input: RenderInput, self: boolean): ScopeEntry[] {
  const out: ScopeEntry[] = []
  for (let p: RuntimeElement | null = self ? el : el.parentElement; p !== null && p !== root; p = p.parentElement) {
    const r = p.getAttribute('data-repeat')
    if (r !== null) out.unshift(repeatEntry(r, input))
  }
  return out
}

/** Every Ghost path a directive on `el` carries, with what it is used as. A value that fails its own
 *  grammar is left to `consume`, which refuses it by the AD-36 sentence when the walk reaches it. */
function ghostPaths(el: RuntimeElement, input: RenderInput): { attr: string; path: string; use: BindingUse; self: boolean }[] {
  const out: { attr: string; path: string; use: BindingUse; self: boolean }[] = []
  const spec = (attr: string, v: string, self = true) => {
    const p = parseBindSpec(v)
    if (typeof p !== 'string') out.push({ attr, path: p.path, use: 'value', self })
  }
  const bind = el.getAttribute('data-bind')
  if (bind !== null) spec('data-bind', bind)
  for (const e of (el.getAttribute('data-bind-attr') ?? '').split(';').map((x) => x.trim()).filter((x) => x !== '')) {
    const v = splitFirst(e, ':')[1] ?? ''
    if (!v.includes('{')) spec('data-bind-attr', v)
    else {
      const paths = parseTokenTemplate(v)
      if (typeof paths !== 'string') for (const path of paths) out.push({ attr: 'data-bind-attr', path, use: 'value', self: true })
    }
  }
  const srcset = el.getAttribute('data-bind-srcset')
  if (srcset !== null) spec('data-bind-srcset', splitFirst(srcset, '|')[0])
  const style = el.getAttribute('data-bind-style')
  if (style !== null) spec('data-bind-style', splitFirst(style, ':')[1] ?? '')
  const repeat = el.getAttribute('data-repeat')
  if (repeat !== null && own(input.dataBindings, repeat) === undefined) out.push({ attr: 'data-repeat', path: repeat, use: 'repeat', self: false })
  const helper = el.getAttribute('data-helper')
  if (helper !== null) out.push({ attr: 'data-helper', path: helper, use: 'helper', self: true })
  // `data-pagination` reads `pagination.*`, which lives at the template's top: inside a repeat it is a blank
  const pg = el.getAttribute('data-pagination')
  if (pg !== null) out.push({ attr: 'data-pagination', path: `pagination.${pg === 'numbers' ? 'page' : pg}`, use: 'value', self: true })
  // Story 4.9 — every `{{t}}` param is a Ghost path like any binding, and scope-checked the same way
  for (const { directive, call } of tCalls(el)) for (const p of call.params) spec(directive, p.spec)
  // Story 4.10 — a condition's path, legal where the matrix allows it as a condition, a value or a repeat source
  const cond = el.getAttribute('data-if')
  if (cond !== null && PATH_RE_OK(cond)) out.push({ attr: 'data-if', path: cond, use: 'condition', self: true })
  // row 13's tokens are Ghost paths too; the directive itself is refused at render until its story lands
  const text = el.getAttribute('data-text')
  if (text !== null) {
    const paths = parseTokenTemplate(text)
    if (typeof paths !== 'string') for (const path of paths) out.push({ attr: 'data-text', path, use: 'value', self: true })
  }
  return out
}

/** DW-131, written here and held by a test: the directives `ghostPaths` reads. `contexts.test.ts` holds this to every rendered directive the
 *  vocabulary flags `ghostPath`, so a new one cannot be skipped by FR-H7's check without a test failing. */
export const WALKED_GHOST_PATH_DIRECTIVES: readonly string[] = [
  'data-bind', 'data-bind-attr', 'data-bind-srcset', 'data-bind-style', 'data-repeat', 'data-helper',
  'data-pagination', 'data-t', 'data-t-attr', 'data-if', 'data-text',
]

const PATH_RE_OK = (v: string): boolean => DIRECTIVES['data-if']?.parse(v) === null

/** Every `{{t}}` call `el` carries — its `data-t`, then each `data-t-attr` entry — skipping a value that fails
 *  its grammar (left to `consume`, which refuses it by the AD-36 sentence). */
function tCalls(el: RuntimeElement): { directive: 'data-t' | 'data-t-attr'; call: TCall }[] {
  const out: { directive: 'data-t' | 'data-t-attr'; call: TCall }[] = []
  const text = el.getAttribute('data-t')
  if (text !== null) {
    const c = parseTCall(text)
    if (typeof c !== 'string') out.push({ directive: 'data-t', call: c })
  }
  const attrs = el.getAttribute('data-t-attr')
  if (attrs !== null) {
    const list = parseTAttr(attrs)
    if (typeof list !== 'string') for (const call of list) out.push({ directive: 'data-t-attr', call })
  }
  return out
}

/** FR-H7 at the one door every render passes: every binding the context matrix does not allow at its
 *  scope on `input.target`, as `<tag attr="path"> — why` sentences. Empty only when every binding is
 *  available — the gate a move or duplicate onto another template must pass. */
function bindingRefusals(root: RuntimeElement, input: RenderInput & { target: string }): string[] {
  const out: string[] = []
  for (const el of root.querySelectorAll('*')) {
    for (const { attr, path, use, self } of ghostPaths(el, input)) {
      const place = { target: input.target, scope: scopeOf(el, root, input, self) }
      // Story 4.10: `{{#if}}` tests truthiness, so a condition may name a boolean, a printable value (a logo, an
      // excerpt, a count) or a list (an empty one takes the else arm). `@member`, an object and a helper stay refused.
      const why = use === 'condition' && (bindable(path, { ...place, use: 'value' }) === null || bindable(path, { ...place, use: 'repeat' }) === null)
        ? null
        : bindable(path, { ...place, use })
      const line = `<${el.tagName.toLowerCase()} ${attr}> "${path}" — ${why ?? ''}`
      if (why !== null && !out.includes(line)) out.push(line)
    }
  }
  return out
}

/** Re-validation (FR-H7, appendix B.1 §1): every binding in `src` the destination `input.target` does
 *  not allow, with its reason, and `[]` when all are available. What a move or duplicate onto another
 *  template calls before it completes; no story offers that action yet (see the ledger). */
export function checkBindings(doc: RuntimeDocument, src: string, input: RenderInput): string[] {
  const target = input.target
  if (target === undefined) {
    throw new Error('checkBindings needs the destination template (input.target) — a binding is legal or not only on a named template (FR-H7).')
  }
  const root = doc.createElement('div')
  root.innerHTML = src
  // R-7's two target refusals are part of "does the destination carry this design": a gate that
  // answered [] and then threw at render would be no gate
  const out: string[] = []
  for (const check of [() => refuseUnpaginated(root, target), () => refuseGetOnForbiddenTarget(root, { ...input, target })]) {
    try { check() } catch (e) { out.push((e as Error).message) }
  }
  return [...out, ...bindingRefusals(root, { ...input, target })]
}

/** true when the matrix types `field` a number here — a render naming no target cannot know */
const numberField = (field: string, input: RenderInput, where: readonly ScopeEntry[]): boolean =>
  input.target !== undefined && fieldKind(field, { target: input.target, scope: where }) === 'number'

/** `users` is the WHOLE of the difference between the emitters at the binding sites: a `UserText`
 *  on the theme path, `null` on the canvas path. */
function emitBindings(
  doc: RuntimeDocument,
  scope: RuntimeElement,
  input: RenderInput,
  tokens: Tokens,
  users: UserText | null,
  ctx: unknown,
  where: readonly ScopeEntry[],
): void {
  // Handlebars resolves `@site`, `@custom` and every other `@data` variable from the ROOT, wherever
  // the expression sits; a row inside `{{#foreach}}` does not shadow it. The canvas does the same.
  const resolve = (spec: string): string | null =>
    bindValue(spec, spec.startsWith('@') ? (input.ghost ?? {}) : ctx, input.site, numberField(guardField(spec), input, where))
  const zero = (field: string): boolean => numberField(field, input, where)

  // ── Story 4.10, §7.3 gap row 3: the two arms ────────────────────────────────
  // FIRST, so every guard a binding on either arm adds nests INSIDE the arm: `wrapGuard` inserts beside the element,
  // and a comment inserted later sits nearer to it. The else arm is the data-if's next element sibling, paired and
  // refused otherwise at the door (`refuseConditionsAndMembers`). The canvas keeps exactly one arm, by Handlebars'
  // own `{{#if}}` test; a field the matrix types `number` counts 0 as present on both sides.
  for (const el of all(scope, '[data-if]')) {
    const field = consume(el, 'data-if') ?? ''
    const next = el.nextElementSibling
    const other = next !== null && next.getAttribute('data-else') !== null ? next : null
    if (other !== null) consume(other, 'data-else')
    if (users !== null) {
      // ─────────── THE DIFFERENCE (2) — theme: {{#if f}}<if>{{else}}<else>{{/if}} ───────────
      el.before(doc.createComment(tokens.put(ifOpen(field, zero(field)))))
      el.after(doc.createComment(tokens.put(other === null ? '{{/if}}' : '{{else}}')))
      other?.after(doc.createComment(tokens.put('{{/if}}')))
      // a media guard on the same field is this one: `data-if="@site.logo"` beside `src:@site.logo` is ONE {{#if}}
      guarded.set(el, new Set([...(guarded.get(el) ?? []), field]))
    } else {
      // ─────────── THE DIFFERENCE (2) — canvas: one arm, by the same test ───────────
      const raw = get(field.startsWith('@') ? (input.ghost ?? {}) : ctx, field)
      if (isEmpty(raw, zero(field))) el.remove()
      else other?.remove()
    }
  }

  for (const el of all(scope, '[data-bind]')) {
    const spec = consume(el, 'data-bind') ?? ''
    const field = guardField(spec)
    const mode = guardMode(el, false)
    // The authored text, FLATTENED: `{{else}}` can only carry text, so a design's child markup
    // inside a bound element is text on both emitters, whether or not a value arrives.
    const authored = el.textContent ?? ''
    if (users !== null) {
      // ─────────── THE DIFFERENCE (2) — theme: the binding becomes a mustache ───────────
      const expr = bindExpr(spec)
      if (mode === 'hide') {
        el.textContent = tokens.put(expr)
        wrapGuard(doc, el, field, tokens, zero(field))
      } else {
        // FR-H8's verbatim form: {{#if x}}{{x}}{{else}}<static>{{/if}}
        el.textContent = tokens.put(
          `${ifOpen(field, zero(field))}${expr}{{else}}${escStatic(authored)}{{/if}}`,
        )
      }
    } else {
      // ─────────── THE DIFFERENCE (2) — canvas: the binding resolves to a value ───────────
      const v = resolve(spec)
      if (v === null) {
        // the guard removes the ELEMENT, which is what {{#if}} does on the other side; `fallback`
        // leaves the authored text exactly where it is, which is what {{else}} does
        if (mode === 'hide') el.remove()
        else el.textContent = authored
      } else {
        el.textContent = v
      }
    }
  }

  for (const el of all(scope, '[data-bind-attr]')) {
    const entries = (consume(el, 'data-bind-attr') ?? '')
      .split(';')
      .filter((e) => e.trim() !== '')
      .map((e) => {
        const [rawAttr, rawSpec] = splitFirst(e.trim(), ':')
        return { attr: assertBindableAttr(rawAttr), spec: rawSpec ?? '' } // AD-36 (3), on BOTH emitters
      })
    // FR-H8: the media case is ANY entry into a URL-valued attribute, not only the first — a design
    // writing `alt:title;src:feature_image` guards the element on `feature_image`, never `alt`.
    const guardEntry = entries.find((e) => URL_ATTRS.has(e.attr)) ?? entries[0]
    const media = guardEntry !== undefined && URL_ATTRS.has(guardEntry.attr)
    // FR-H8 (Story 4.6): a media binding HIDES its element. A fallback here used to guard the attribute
    // and ship the design's placeholder as a live relative URL — refused, with the validator's sentence.
    if (media && el.getAttribute('data-empty') === 'fallback') throw new Error(`<${el.tagName.toLowerCase()}> — ${MEDIA_FALLBACK_REFUSAL}`)
    const mode = guardMode(el, media)
    let removed = false
    for (const { attr, spec } of entries) {
      if (users !== null) {
        // ─────────── THE DIFFERENCE (2) — theme ───────────
        const expr = bindExpr(spec)
        // FR-H8: a media guard wraps the ELEMENT and never the attribute — an unguarded `srcset`
        // renders a malformed attribute the browser resolves as a relative URL, producing live 404s.
        el.setAttribute(
          attr,
          tokens.put(
            mode === 'hide'
              ? expr
              : `${ifOpen(guardField(spec), zero(guardField(spec)))}${expr}{{else}}${escAttr(el.getAttribute(attr) ?? '')}{{/if}}`,
          ),
        )
      } else {
        // ─────────── THE DIFFERENCE (2) — canvas ───────────
        const v = resolve(spec)
        if (v === null) {
          if (mode === 'hide' && guardEntry !== undefined && spec === guardEntry.spec) {
            el.remove()
            removed = true
            break
          }
          continue // a null entry sets nothing and leaves the authored attribute alone
        }
        // AD-36 (1) on the canvas too: a `javascript:` URL here runs on Inflozo's own origin.
        // Story 4.3: through `ghostUrl`, not `safeUrl`. This is a GHOST binding, and the spine's
        // Conventions row scopes Ghost-sourced values to `http`/`https` only — narrower than the
        // user allow-list, which also permits `mailto:` and `tel:` because a Link Picker
        // legitimately produces one. A `mailto:` arriving in `@site.logo` is not a feature.
        el.setAttribute(attr, URL_ATTRS.has(attr) ? ghostUrl(v) : v)
      }
    }
    if (!removed && users !== null && mode === 'hide' && guardEntry !== undefined) {
      wrapGuard(doc, el, guardField(guardEntry.spec), tokens, zero(guardField(guardEntry.spec)))
    }
  }

  // ── Story 4.3, exit construct 4: a responsive image SET ────────────────────
  // The binding grammar produces one expression per attribute and a candidate list needs several,
  // which is the whole reason this directive exists. FR-H8 applies and the guard encloses the
  // ELEMENT: an unguarded `srcset` renders a malformed attribute the browser resolves as a relative
  // URL, producing live 404s on the customer's site.
  for (const el of all(scope, '[data-bind-srcset]')) {
    const spec = consume(el, 'data-bind-srcset') ?? ''
    const path = splitFirst(spec, '|')[0] as string
    // A candidate list is the media case BY DEFINITION. `data-empty="fallback"` used to be swallowed
    // here; since Story 4.6 it is refused by the validator's sentence, on both emitters.
    if (consume(el, 'data-empty') === 'fallback') throw new Error(`<${el.tagName.toLowerCase()}> — ${MEDIA_FALLBACK_REFUSAL}`)
    if (users !== null) {
      // ─────────── THE DIFFERENCE (2) — theme ───────────
      el.setAttribute('srcset', tokens.put(srcsetExpr(path)))
      // ONE guard per element: `src:feature_image|img_url:l` on the same <img> — the authoring
      // guide's own example — has already wrapped it on the same field.
      if (guarded.get(el)?.has(guardField(spec)) !== true) wrapGuard(doc, el, guardField(spec), tokens)
    } else {
      // ─────────── THE DIFFERENCE (2) — canvas ───────────
      const v = resolve(path)
      // AD-36 (1): `srcset` is a URL sink like `src`, and it takes its own door — through `ghostUrl`.
      const safe = v === null ? '#' : ghostUrl(v)
      if (safe === '#') {
        el.remove()
        continue
      }
      el.setAttribute('srcset', srcset(safe, {
        siteUrl: input.site?.url,
        absolute: input.site?.url !== undefined,
      }))
    }
  }

  // ── Story 4.3, §7.3 gap row 9: a BARE helper, with no bound path ───────────
  // `data-bind` cannot express one, because there is no path to bind. On the theme each is its own
  // mustache; on the canvas the shim resolves it — and `{{content}}`/`{{comments}}` REFUSE when
  // Story 4.4's fixture is absent, rather than rendering an empty body or an invented one (FR-H3).
  for (const el of all(scope, '[data-helper]')) {
    const name = consume(el, 'data-helper') ?? ''
    if (users !== null) {
      // ─────────── THE DIFFERENCE (2) — theme ───────────
      // Double braces, never triple: compile CI asserts zero `{{{` in emitted output, and Ghost's
      // `{{content}}` is already a SafeString.
      el.textContent = tokens.put(`{{${name}}}`)
      continue
    }
    // ─────────── THE DIFFERENCE (2) — canvas ───────────
    if (name === 'navigation') {
      // The shim returns DATA and the nodes are built here, because NFR-3 puts every Ghost value in
      // a TEXT NODE and a shim with no DOM cannot break that rule by accident. The markup is Ghost's
      // own navigation partial, recorded on both majors.
      const ul = doc.createElement('ul')
      ul.setAttribute('class', 'nav')
      for (const item of navigationItems(input.site?.navigation ?? [], { currentUrl: input.site?.currentUrl, siteUrl: input.site?.url })) {
        const li = doc.createElement('li')
        li.setAttribute('class', item.className)
        const a = doc.createElement('a')
        a.setAttribute('href', ghostUrl(item.url))
        a.textContent = item.label
        li.append(a)
        ul.append(li)
      }
      el.textContent = ''
      el.append(ul)
      continue
    }
    if (name === 'content' || name === 'comments') {
      // The ONE place a canvas render writes markup rather than a text node, and it is sanctioned:
      // these are Inflozo-authored fixtures (FR-H3), trusted by construction, which is exactly why
      // they can be rendered when a customer's real body HTML never is.
      el.innerHTML = bareHelper(name, { fixtures: input.fixtures })
      continue
    }
    el.textContent = bareHelper(name, {
      ghost: input.ghost,
      siteUrl: input.site?.url,
      major: input.site?.major,
      members: input.site?.members,
      fixtures: input.fixtures,
    })
  }

  // ── Story 4.3, §7.3 gap row 6: Ghost's NATIVE pagination ──────────────────
  // `numbers` emits the page indicator and not a list of page links, and the reason is Ghost's:
  // the pagination context carries `page` and `pages` and Handlebars has no way to loop a range,
  // so a list of numbered links would have to be an Inflozo partial rendering something Ghost
  // cannot count. R-109 (owner, 2026-09-15) settled it: there is no row of clickable page numbers,
  // `numbers` stays the "5 / 11" indicator on both emitters, and A34's category story redraws
  // A34 #1 Numbers to it (DW-97 closed).
  for (const el of all(scope, '[data-pagination]')) {
    const which = consume(el, 'data-pagination') ?? ''
    if (which === 'numbers') {
      el.textContent = users !== null
        ? tokens.put('{{pagination.page}} / {{pagination.pages}}')
        : ((c) => `${c.page} / ${c.pages}`)(paginationContext(input.site?.pagination ?? {}))
      continue
    }
    const field = `pagination.${which}`
    if (users !== null) {
      // ─────────── THE DIFFERENCE (2) — theme ───────────
      el.setAttribute('href', tokens.put(`{{page_url ${field}}}`))
      wrapGuard(doc, el, field, tokens)
    } else {
      // ─────────── THE DIFFERENCE (2) — canvas ───────────
      const ctxPage = paginationContext(input.site?.pagination ?? {})
      const n = which === 'prev' ? ctxPage.prev : ctxPage.next
      if (n === null) el.remove() // the first page has no Newer link, exactly as {{#if}} does
      else el.setAttribute('href', pageUrl(n, input.site?.paginationBase ?? '/'))
    }
  }

  // ── Story 4.9, exit construct 3: a chrome string by catalog key ─────────────
  // The theme is `{{t "key" name=expr}}`, which Ghost looks up as ONE key in the locale file; the canvas is the
  // shim's `t()` over the handed strings. Every param is guarded on its bound field (FR-H8): an empty param
  // leaves a hole on both majors ("Page 2 of ") and the element's only fallback would be the authored English
  // V1 refuses, so the element HIDES — the way a media binding already does. Recorded: MEASUREMENTS §44.
  const tParam = (p: { spec: string }): { expr: string; value: unknown } => {
    const parsed = parseBindSpec(p.spec)
    if (typeof parsed === 'string') throw new Error(`AD-36: ${parsed}`)
    const h = parsed.helper === undefined ? undefined : (HELPERS[parsed.helper] as { param: string })
    // a helper param is a SUB-EXPRESSION, rebuilt from the validated parts like `bindExpr`
    const expr = h === undefined ? parsed.path : `(${parsed.helper ?? ''} ${parsed.path} ${h.param}="${parsed.arg ?? ''}")`
    if (users !== null) return { expr, value: undefined }
    const source = parsed.path.startsWith('@') ? (input.ghost ?? {}) : ctx
    const zero = numberField(parsed.path, input, where)
    // a plain param is the FIELD — `minutes=reading_time` printed "0 min read" on both majors, never the helper
    if (parsed.helper === undefined) {
      const raw = get(source, parsed.path)
      return { expr, value: isEmpty(raw, zero) ? null : raw }
    }
    return { expr, value: bindValue(p.spec, source, input.site, zero) }
  }
  const tCall = (el: RuntimeElement, call: TCall): string | null => {
    const params = call.params.map((p) => ({ name: p.name, field: guardField(p.spec), ...tParam(p) }))
    if (users !== null) {
      // ─────────── THE DIFFERENCE (2) — theme ───────────
      for (const p of params) {
        if (guarded.get(el)?.has(p.field) !== true) wrapGuard(doc, el, p.field, tokens, zero(p.field))
      }
      return tokens.put(`{{t "${call.key}"${params.map((p) => ` ${p.name}=${p.expr}`).join('')}}}`)
    }
    // ─────────── THE DIFFERENCE (2) — canvas ───────────
    if (params.some((p) => p.value === null)) return null
    return t(call.key, Object.fromEntries(params.map((p) => [p.name, p.value])), input.strings)
  }
  for (const el of all(scope, '[data-t]')) {
    const call = parseTCall(consume(el, 'data-t') ?? '') as TCall
    const text = tCall(el, call)
    if (text === null) el.remove()
    else el.textContent = text
  }
  for (const el of all(scope, '[data-t-attr]')) {
    const entries = parseTAttr(consume(el, 'data-t-attr') ?? '') as (TCall & { attr: string })[]
    for (const entry of entries) {
      const text = tCall(el, entry)
      if (text === null) {
        el.remove()
        break
      }
      el.setAttribute(entry.attr, text)
    }
  }

  // AD-3's single carve-out (row 12): an inline `style` may set ONE bound CSS custom property.
  for (const el of all(scope, '[data-bind-style]')) {
    const [prop, rawSpec] = splitFirst(consume(el, 'data-bind-style') ?? '', ':')
    const spec = rawSpec ?? ''
    if (users !== null) {
      // ─────────── THE DIFFERENCE (2) — theme ───────────
      // FR-H8 here too: an absent value leaves an EMPTY style attribute, so the element reads the
      // root default of the property — the same thing the canvas does below.
      // AD-36 (4), and the ceiling this runtime cannot close: the emitted mustache is correct
      // Handlebars and the VALUE arrives at render, on the customer's site, after every build-time
      // gate has run. AD-36's own text says so. The canvas below is the half that is reachable, and
      // since Story 4.3 it reads the same `safeCssColor` through `ghostColor`.
      el.setAttribute(
        'style',
        tokens.put(`${ifOpen(guardField(spec), zero(guardField(spec)))}${prop}: ${bindExpr(spec)}{{/if}}`),
      )
    } else {
      // ─────────── THE DIFFERENCE (2) — canvas ───────────
      const v = resolve(spec)
      // DW-95: through the SHIM, which calls the library's one copy. AD-36 bullet 4 promises
      // exactly this call, and until Story 4.3 it was a comment rather than a call.
      el.setAttribute('style', v === null ? '' : `${prop}: ${ghostColor(v)}`)
    }
  }
}

// `formatDate` used to live here. Story 4.3 moved it to `packages/ghost-shim`, where FR-H5 puts
// `{{date}}`, and the recording caught a real drift in the move: the DEFAULT format here was
// `YYYY-MM-DD`, which was a paraphrase — `{{date published_at}}` prints `Jul 18, 2025` on both live
// majors. It is re-exported above so nothing that imported it from here breaks.

/** The canvas counterpart of `bindExpr`: same spec, same grammar, a value instead of a mustache.
 *  ONE parse — `parseBindSpec` — so an invalid spec fails IDENTICALLY on both emitters and the
 *  grammar is never re-derived here. A design the compiler refuses must not silently render. */
export function bindValue(spec: string, ctx: unknown, site?: RenderInput['site'], includeZero = false): string | null {
  const parsed = parseBindSpec(spec)
  if (typeof parsed === 'string') throw new Error(`AD-36: ${parsed}`)
  // A BARE `reading_time` is Ghost's helper too: it prints the rounded "1 min read", recorded on both
  // majors over an API value of 0 — which the number guard lets through (Story 4.6).
  if (parsed.helper === undefined && parsed.path === 'reading_time') {
    const raw = get(ctx, 'reading_time')
    // a number is the post's API value; anything else is some other scope's field of that name
    if (typeof raw === 'number') return isEmpty(raw, includeZero) ? null : readingTime(raw)
  }
  // A BARE `excerpt` on the theme is Ghost's HELPER, not the field: it prefers `custom_excerpt`,
  // escapes, and truncates a computed excerpt to 50 words (read in source — see the shim). The
  // canvas resolves it over the current object BEFORE the emptiness test, because a post with only
  // a custom excerpt still prints. A DOTTED `post.excerpt` is a Handlebars path lookup — the plain
  // field — and so is `custom_excerpt`; both fall through. NFR-3's carve-out — text-only — is
  // `textContent`, which every binding uses.
  if (parsed.helper === undefined && parsed.path === 'excerpt') {
    const text = excerpt((ctx ?? {}) as { custom_excerpt?: unknown; excerpt?: unknown })
    return text === '' ? null : text
  }
  const raw = get(ctx, parsed.path)
  if (isEmpty(raw, includeZero)) return null
  if (parsed.helper === 'date') return formatDate(raw, parsed.arg) // the format argument is HONOURED
  if (parsed.helper === 'img_url') {
    // Story 4.3: this used to be `String(raw)`, so the canvas showed the ORIGINAL image where the
    // site serves a rendition — a card loading a 2400px photograph behind a 300px slot, which
    // nobody would notice. Ghost answers a same-origin request with a RELATIVE sized URL (recorded),
    // so the canvas asks for the absolute form: a relative URL on the canvas resolves against
    // Inflozo's own origin and 404s.
    return imgUrl(raw, parsed.arg, { siteUrl: site?.url, absolute: site?.url !== undefined })
  }
  return String(raw)
}

/** S6: the catalog key a prop takes its initial value from, or null — refused with the validator's sentence
 *  when the declaration is not legal, because the runtime is handed a schema it never saw validated. */
function catalogProp(path: string, def: PropDef | undefined): string | null {
  if (def?.catalog === undefined) return null
  const bad = catalogPropRefusal(path, def)
  if (bad !== null) throw new Error(bad.message)
  return def.catalog
}

function applyProps(
  scope: RuntimeElement,
  input: RenderInput,
  users: UserText | null,
  tokens: Tokens,
  items?: Readonly<Record<string, unknown>>,
): void {
  const content = input.content ?? {}
  const schema = input.schema ?? {}
  const tokenValues = input.tokens ?? {}

  for (const el of all(scope, '[data-prop]')) {
    const path = consume(el, 'data-prop') ?? ''
    const def = own(schema, path)
    let v = propGet(content, path, items) as PropValue
    const mode = guardMode(el, false)
    if (def?.type === 'icon' && input.icons !== undefined) {
      // an icon is DRAWN into the element, identically on both emitters; a name not in the set, or a
      // drawing that fails its grammar, is an empty slot
      const svg = iconSvg(v, input.icons)
      if (svg === null) {
        if (mode === 'hide') el.remove()
        else el.textContent = ''
      } else {
        el.innerHTML = svg
      }
      continue
    }
    // a date is the site's wall-clock day, printed unconverted; anything else is unset
    if (def?.type === 'date' && !isIsoDate(v)) v = undefined
    // Story 4.9 — S6: an untouched catalog-linked prop is the catalog string. "Untouched" is an EMPTY value,
    // the test FR-H8's text default already applies below, so the editor keeps it empty until the customer types.
    const linked = catalogProp(path, def)
    if (linked !== null && propEmpty(v)) {
      el.textContent = users !== null ? tokens.put(`{{t "${linked}"}}`) : (input.strings?.[linked] ?? '')
      continue
    }
    if (propEmpty(v)) {
      // FR-H8's text default, on a prop rather than a binding: the authored text stays. `hide` is
      // the explicit override, and DW-93's class — the marker must never survive either way.
      if (mode === 'hide') el.remove()
      continue
    }
    if (users !== null) {
      // AD-4: on the theme the value becomes a MARKER and is spliced into the string later — never
      // through a DOM, because an HTML parser decodes AD-5's numeric entities back to live braces.
      el.textContent = users.put(path, v)
    } else {
      // AD-4: on the canvas the serializer's output goes INTO a DOM, because the user must see
      // their own literal text and their own marks.
      el.innerHTML = serializeMarks(v, def, tokenValues)
    }
  }

  // Story 4.6 — R-2's typed avatar: two initials BAKED from a name the user typed, through the same
  // user-text door as `data-prop` (AD-5), so a name carrying `{{` ships inert. An empty name keeps the
  // authored text, or hides with `data-empty="hide"`. A person from Ghost gets one letter from the
  // design's stylesheet over the bound name instead, which is why this is refused inside a repeat.
  for (const el of all(scope, '[data-initials]')) {
    const path = consume(el, 'data-initials') ?? ''
    const mode = guardMode(el, false)
    const raw = propGet(content, path, items)
    const value = initials(isRich(raw) ? raw.text : typeof raw === 'string' ? raw : '')
    if (value === '') {
      if (mode === 'hide') el.remove()
      continue
    }
    if (users !== null) el.textContent = users.put(path, value)
    else el.innerHTML = serializeMarks(value, own(schema, path), tokenValues)
  }

  // ONE attribute, a semicolon-separated LIST (`data-prop-attr2` is retired — Story 4.1).
  for (const el of all(scope, '[data-prop-attr]')) {
    const entries = (consume(el, 'data-prop-attr') ?? '').split(';').filter((e) => e.trim() !== '')
    const mode = guardMode(el, false)
    let firstMissing = false
    for (const [i, entry] of entries.entries()) {
      const [rawAttr, rawPath] = splitFirst(entry.trim(), ':')
      const attr = assertBindableAttr(rawAttr) // AD-36 (3)
      const path = rawPath ?? ''
      const def = own(schema, path)
      let raw = propGet(content, path, items)
      const linked = catalogProp(path, def)
      if (linked !== null && !TEXT_ATTRS.includes(attr)) {
        // review 4.9: a `{{t}}` value is a translator's text and an override is a customer's — neither passes
        // `safeUrl`, so it may land only where `data-t-attr` may (AD-36 1)
        throw new Error(`data-prop-attr="${attr}:${path}" — "${path}" takes its text from the catalog (S6), and a catalog string is written only to ${TEXT_ATTRS.join(', ')}, never to a URL attribute.`)
      }
      if (attr === 'href') {
        // Story 4.5 — a destination is a LINK RECORD (a bare string is `{ href }`), and it becomes
        // attributes in exactly one place, `linkAttributes`, which the `a` mark calls too. A record
        // with no valid destination sets nothing, so FR-F8's unset link hides like any unset prop.
        const attrs = linkAttributes(isRich(raw) ? raw.text : raw)
        if (attrs['href'] === undefined) {
          if (i === 0) firstMissing = true
          continue
        }
        for (const [k, val] of Object.entries(attrs)) {
          // the href is user text and is parked on the theme like any other; the rest are closed values
          el.setAttribute(k, k === 'href' && users !== null ? users.put(path, val) : val)
        }
        continue
      }
      // AD-27(b): an image stores an asset ID, resolved only through `assets`; a URL in its place is unset
      if (def?.type === 'image') raw = typeof raw === 'string' && ASSET_ID_RE.test(raw) ? own(input.assets, raw) : undefined
      if (def?.type === 'date' && !isIsoDate(raw)) raw = undefined
      if (linked !== null && propEmpty(raw)) {
        el.setAttribute(attr, users !== null ? tokens.put(`{{t "${linked}"}}`) : (input.strings?.[linked] ?? ''))
        continue
      }
      if (propEmpty(raw)) {
        if (i === 0) firstMissing = true
        continue
      }
      // An attribute holds TEXT: a rich value contributes its text and never its marks.
      const v = isRich(raw) ? raw.text : raw
      // AD-36 (1): a user-supplied URL is scheme-checked BEFORE it becomes a marker. Here rather
      // than in the escaper, because a scheme is only meaningful where the context is known.
      const safe = URL_ATTRS.has(attr) ? safeUrl(v) : String(v)
      el.setAttribute(attr, users !== null ? users.put(path, safe) : safe)
    }
    // DW-93: the harness removed only its own attribute here and implemented no `hide`, so an
    // element whose only content is a user-picked image kept a dead `data-empty` and never hid.
    if (firstMissing && mode === 'hide') el.remove()
  }

  // `data-empty` is read, never consumed, by the loops above — it is shared by every directive on
  // its element — so it is swept here, and none can survive into output.
  for (const el of all(scope, '[data-empty]')) {
    consume(el, 'data-empty')
    el.removeAttribute('data-empty')
  }
}

// ─── Story 4.5 — controls, authored arrays, icons ────────────────────────────

/** AD-3 through ONE door: the root's control attributes are `resolveControls`' output and nothing
 *  else — on both emitters, and on a live canvas root when a control changes (the editor calls this
 *  on the section element inside the input handler rather than re-rendering). Every authored control attribute is removed first — so a design switch leaves no stale
 *  attribute and a no-value-locked universal has none (R-103) — and every stamped name and value is
 *  re-checked against the vocabulary's grammar, so a schema that never met the validator still cannot
 *  put a quote or a brace into either emitter (AD-36). */
export function stampControls(
  section: RuntimeElement,
  input: Pick<RenderInput, 'controlSchema' | 'universals' | 'controls'>,
): void {
  const schema = input.controlSchema
  if (schema === undefined) return
  for (const { name } of [...section.attributes]) {
    if (name.startsWith('data-') && DIRECTIVES[name] === undefined && name !== 'data-portal') section.removeAttribute(name)
  }
  for (const c of schema) {
    if (!CONTROL_NAME_RE.test(c.name) || DIRECTIVES[`data-${c.name}`] !== undefined || c.name === 'portal' || c.name.startsWith('i18n-')) {
      throw new Error(`AD-36: control ${JSON.stringify(c.name)} is not a control name — a kebab-case word that is not a directive (AD-3).`)
    }
  }
  for (const [name, value] of Object.entries(resolveControls({ controlSchema: schema, universals: input.universals }, input.controls))) {
    if (!CONTROL_NAME_RE.test(name) || !CONTROL_VALUE_RE.test(value)) throw new Error(`AD-36: data-${name}=${JSON.stringify(value)} is not a closed control value`)
    section.setAttribute(`data-${name}`, value)
  }
}

/** The first code point of the first and of the last whitespace-separated word: "Jane Doe" → JD,
 *  "Madonna" → M, "Mary Jane Watson" → MW. Case stays as typed; the stylesheet decides display.
 *  ponytail: a code point is not a grapheme, so a name opening with a combining sequence loses its mark;
 *  AD-1 bans `Intl.Segmenter`, and a segmenter handed in is the upgrade if a real name ever needs it. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => w !== '')
  if (words.length === 0) return ''
  const first = [...(words[0] as string)][0] ?? ''
  return words.length === 1 ? first : first + ([...(words[words.length - 1] as string)][0] ?? '')
}

/** §7.3 gap row 1: an AUTHORED array renders as one copy per item, on BOTH emitters — the theme
 *  bakes N static copies (a user-authored list is known at compile), so the two trees are identical
 *  and per-item user text is parked like any other, its mark allow-list looked up by the `[]` path.
 *  Zero items renders nothing. A list inside another list, or inside a Ghost repeat, refuses by name:
 *  a per-item path is written in full and resolves against exactly one enclosing array. */
function expandItems(doc: RuntimeDocument, root: RuntimeElement, input: RenderInput, tokens: Tokens, users: UserText | null): void {
  const lists = all(root, '[data-items]')
  for (const el of lists) {
    const path = el.getAttribute('data-items') ?? ''
    const nested = el.getAttribute('data-repeat') !== null || ((): boolean => {
      for (let p = el.parentElement; p !== null && p !== root; p = p.parentElement) {
        if (p.getAttribute('data-items') !== null || p.getAttribute('data-repeat') !== null) return true
      }
      return false
    })()
    if (nested) {
      throw new Error(`data-items="${path}" sits inside another data-items or a data-repeat. An authored list renders at one level, over its own array; a list of lists is not in the vocabulary.`)
    }
    // the reverse nesting: a Ghost repeat inside an item would bake one {{#get}} per item on the theme
    // (a list inside a list is caught above, by the inner one)
    if ([...el.querySelectorAll('[data-repeat]')].length > 0) {
      throw new Error(`data-items="${path}" contains a data-repeat. An authored list renders at one level; a Ghost query inside an item would run once per item.`)
    }
  }
  for (const el of lists) {
    const path = consume(el, 'data-items') ?? ''
    const raw = get(input.content ?? {}, path)
    for (const item of Array.isArray(raw) ? raw : []) {
      const clone = el.cloneNode(true)
      el.before(clone)
      // bindings first, as every other walk does: `data-empty` is shared and applyProps sweeps it
      emitBindings(doc, clone, input, tokens, users, input.ghost ?? {}, [])
      applyProps(clone, input, users, tokens, { [path]: item })
    }
    el.remove()
  }
}

/** R-26 / R-104: an icon is Tabler's drawing, inline where it is used, once per use. The lookup is
 *  data handed in, so nothing it returns is trusted: every `<path>` is REBUILT from attributes that
 *  pass their grammar, and a drawing with one that does not is not emitted at all (AD-36). The wrapper
 *  is Tabler's own — stroke for an outline, fill for a `-filled` key — and `aria-hidden`, because a
 *  section's icon is decoration beside its words (P0-2). */
const ICON_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const ICON_ATTR_RE: Readonly<Record<string, RegExp>> = {
  d: /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s+-]+$/,
  fill: /^(none|currentColor)$/,
  stroke: /^(none|currentColor)$/,
  opacity: /^(0|1|0?\.[0-9]+)$/,
}
const OUTLINE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
const FILLED_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'

export function iconSvg(name: unknown, icons: IconLookup): string | null {
  if (typeof name !== 'string' || !ICON_NAME_RE.test(name)) return null
  const filled = name.endsWith('-filled')
  const allowed = filled ? ['d', 'fill'] : ['d', 'fill', 'opacity', 'stroke']
  const nodes = icons(name)
  if (!Array.isArray(nodes) || nodes.length === 0) return null
  let paths = ''
  for (const node of nodes as readonly unknown[]) {
    if (!Array.isArray(node) || node[0] !== 'path' || typeof node[1] !== 'object' || node[1] === null) return null
    const attrs = node[1] as Record<string, unknown>
    const keys = Object.keys(attrs)
    if (!keys.includes('d') || keys.some((k) => !allowed.includes(k))) return null
    if (!keys.every((k) => typeof attrs[k] === 'string' && (ICON_ATTR_RE[k]?.test(attrs[k] as string) ?? false))) return null
    paths += `<path ${allowed.filter((k) => keys.includes(k)).map((k) => `${k}="${attrs[k] as string}"`).join(' ')}></path>`
  }
  return `${filled ? FILLED_SVG : OUTLINE_SVG}${paths}</svg>`
}

// ─── Story 4.9 — the string catalog at the render door ───────────────────────

/** What a render is handed, through `resolveStrings`: only the entries that differ from English count as
 *  overrides, so a full map `resolveStrings` already returned passes again unchanged, while a `credit.*`
 *  override or an unknown key throws here as it would at the compiler (S7). */
function handedStrings(handed: RenderInput['strings']): Record<string, string> {
  const overrides = Object.fromEntries(Object.entries(handed ?? {}).filter(([k, v]) => CATALOG.keys[k]?.en !== v))
  return resolveStrings(overrides)
}

/** V2 and V4 at render, over the SOURCE and before any expansion — so a `data-t` inside a repeat with no rows
 *  is refused on the canvas exactly as the theme refuses it — plus the two things a `data-t` element may not
 *  carry, and an authored `data-i18n-*`, which only the registry's `strings` may put on a mount (S5). */
function refuseCatalogMisuse(root: RuntimeElement): void {
  for (const el of root.querySelectorAll('*')) {
    const tag = `<${el.tagName.toLowerCase()}>`
    for (const { name } of el.attributes) {
      if (name.startsWith('data-i18n-')) throw new Error(`${tag} carries ${name} — both emitters stamp data-i18n-* on a module's mount from the registry's strings (S5); a design never writes one.`)
    }
    for (const d of ['data-t', 'data-t-attr']) {
      const v = el.getAttribute(d)
      if (v === null) continue
      const bad = DIRECTIVES[d]?.parse(v) ?? null
      if (bad !== null) throw new Error(`AD-36: ${d}=${JSON.stringify(v)} — ${bad}`)
    }
    for (const { call } of tCalls(el)) {
      const refused = tCallRefusals(call)
      if (refused.length > 0) throw new Error(`${tag} — ${refused.map((r) => r.message).join(' ')}`)
    }
    if (el.getAttribute('data-t') !== null) {
      if (el.getAttribute('data-empty') !== null) {
        throw new Error(`${tag} data-t data-empty — a data-t element hides when a param is empty; its only static fallback is the authored English sample, which V1 refuses.`)
      }
      const other = TEXT_DIRECTIVES.find((d) => d !== 'data-t' && el.getAttribute(d) !== null) ?? (el.getAttribute('data-pagination') === 'numbers' ? 'data-pagination="numbers"' : undefined)
      if (other !== undefined) throw new Error(`${tag} carries data-t and ${other} — one element carries one text, and the second would silently replace the first.`)
    }
    const tAttr = el.getAttribute('data-t-attr')
    if (tAttr !== null) {
      const written = writtenAttrs(el, ['data-bind-attr', 'data-prop-attr'])
      const clash = (parseTAttr(tAttr) as { attr: string }[]).find((e) => written.has(e.attr))
      if (clash !== undefined) throw new Error(`${tag} writes ${clash.attr} from data-t-attr and from a binding — one attribute holds one value.`)
    }
  }
}

/** the attribute names a list directive on `el` writes */
function writtenAttrs(el: RuntimeElement, directives: readonly string[]): Set<string> {
  return new Set(directives.flatMap((d) => (el.getAttribute(d) ?? '').split(';').map((e) => splitFirst(e.trim(), ':')[0].trim().toLowerCase()).filter((a) => a !== '')))
}

const WORD_RE = /[\p{L}\p{N}]/u

/** V1's tree half (Story 4.9): every text node, and every alt, title, placeholder or aria-label value, that holds a
 *  letter or digit and that nothing replaces — the literal English a translator could never reach. Exempt: text
 *  under an element whose text a directive replaces (`data-prop`, `data-bind`, `data-t`, `data-helper`,
 *  `data-initials`, `data-text`, or `data-pagination="numbers"`); a text attribute a directive writes; `alt=""`;
 *  and anything with no letter or digit. The lexical half — the words of a `data-text` template — is the
 *  validator's `chrome-literal`. Exported for the fixtures' checks; a render naming its target throws on it. */
export function chromeLiterals(root: RuntimeElement): string[] {
  const out: string[] = []
  const replaced = (el: RuntimeElement): boolean => {
    for (let p: RuntimeElement | null = el; p !== null; p = p.parentElement) {
      if (TEXT_DIRECTIVES.some((d) => p?.getAttribute(d) !== null) || p.getAttribute('data-pagination') === 'numbers') return true
      if (p === root) break
    }
    return false
  }
  for (const el of [root, ...root.querySelectorAll('*')]) {
    const tag = el.tagName.toLowerCase()
    const written = writtenAttrs(el, ['data-t-attr', 'data-bind-attr', 'data-prop-attr'])
    for (const a of TEXT_ATTRS) {
      const v = el.getAttribute(a)
      if (v !== null && WORD_RE.test(v) && !written.has(a)) out.push(`<${tag} ${a}="${v}">`)
    }
    if (replaced(el)) continue
    for (const node of el.childNodes) {
      const text = (node.textContent ?? '').trim()
      if (node.nodeType === 3 && WORD_RE.test(text)) out.push(`<${tag}> "${text}"`)
    }
  }
  return out
}

/** V1's tree half over a design source, for a caller holding markup rather than a tree (the fixtures' checks). */
export function checkChromeLiterals(doc: RuntimeDocument, src: string): string[] {
  const root = doc.createElement('div')
  root.innerHTML = src
  return chromeLiterals(root)
}

/** S5 on both emitters: every js key a mounted module's registry row declares becomes `data-i18n-*` on the
 *  mount, from the resolved strings. On the theme the value is USER TEXT — an override may carry a brace and
 *  Handlebars parses attribute values — so it goes through `UserText`, which writes `{` as `&#123;`; the browser
 *  decodes it, and `core` reads `{count}` intact (AD-5). */
function stampStrings(root: RuntimeElement, input: RenderInput, users: UserText | null): void {
  for (const el of all(root, '[data-module]')) {
    const decl = parseModuleDeclaration(el.getAttribute('data-module') ?? '')
    if (typeof decl === 'string') throw new Error(decl)
    const row = MODULES.filter((m) => m.name === decl.name)
    const bad = moduleStringsRefusals(row)
    if (bad.length > 0) throw new Error(`S5: ${bad.join(' · ')}`)
    for (const key of row[0]?.strings ?? []) {
      const value = input.strings?.[key] ?? ''
      el.setAttribute(i18nAttr(key), users !== null ? users.put('', value) : value)
    }
  }
}

// ─── Story 4.10 — the two arms and member gating, at the door ─────────────────

/** The pairing and nesting rules, over the SOURCE and before any expansion, so both emitters refuse the same tree:
 *  a `data-else` is the next element sibling of a `data-if` and never shares its element; neither arm of a pair sits
 *  on a `data-repeat` or `data-items` (the else arm would land outside the rows the if arm repeats in); a
 *  `data-members` sits inside no other, on no repeat, list or arm; and a root gated by `visibility` carries no
 *  `data-members` of its own — one audience per section. */
function refuseConditionsAndMembers(root: RuntimeElement, input: RenderInput): void {
  const tag = (el: RuntimeElement) => `<${el.tagName.toLowerCase()}>`
  for (const el of all(root, '[data-else]')) {
    const prev = el.previousElementSibling
    if (el.getAttribute('data-if') !== null) throw new Error(`${tag(el)} carries both data-if and data-else — the two arms are two sibling elements.`)
    if (prev === null || prev.getAttribute('data-if') === null) {
      throw new Error(`${tag(el)} data-else is not the next element sibling of a data-if — the else arm follows its if arm directly, with no element between them (§7.3 row 3).`)
    }
    for (const arm of [prev, el]) {
      for (const d of ['data-repeat', 'data-items']) {
        if (arm.getAttribute(d) !== null) throw new Error(`${tag(arm)} carries ${d} and is one arm of a data-if / data-else pair — the other arm would sit outside the copies this one makes. Put the repeat inside the arm.`)
      }
    }
  }
  for (const el of all(root, '[data-members]')) {
    for (const d of ['data-repeat', 'data-items', 'data-if', 'data-else']) {
      if (el.getAttribute(d) !== null) throw new Error(`${tag(el)} data-members="${el.getAttribute('data-members') ?? ''}" shares its element with ${d} — gate a wrapper around it, or put the gate inside.`)
    }
    for (let p = el.parentElement; p !== null && p !== root; p = p.parentElement) {
      if (p.getAttribute('data-members') !== null) {
        throw new Error(`${tag(el)} data-members="${el.getAttribute('data-members') ?? ''}" sits inside data-members="${p.getAttribute('data-members') ?? ''}" — member states do not nest: one element, one audience (§7.3 row 4).`)
      }
    }
  }
  const visibility = input.visibility ?? 'everyone'
  if (!(MEMBER_STATES as readonly string[]).includes(visibility)) {
    throw new Error(`visibility ${JSON.stringify(visibility)} is not a member state — ${MEMBER_STATES.join(' · ')}`)
  }
  const member = input.member ?? 'anonymous'
  if (!(['anonymous', 'free', 'paid'] as readonly string[]).includes(member)) {
    throw new Error(`member ${JSON.stringify(member)} is not a visitor the canvas previews — anonymous · free · paid (comped previews as paid)`)
  }
  const section = root.firstElementChild
  if (visibility !== 'everyone' && section?.getAttribute('data-members') !== null && section !== null) {
    throw new Error(`the section root carries data-members="${section.getAttribute('data-members') ?? ''}" and this render shows the section to "${visibility}" — one audience per section: the show-to or the root's own gate, never both.`)
  }
}

/** Ghost's own member test for each closed state, read in both releases (`update-local-template-options.js`):
 *  `@member` is null signed out and `paid` is `status !== 'free'`, so `comped` is paid. `{{#if}}` only (FR-D16) —
 *  never `{{#unless}}`, never `{{#has}}` — and no member field is ever printed (R-28). */
const MEMBER_GATE: Readonly<Record<Exclude<MemberState, 'everyone'>, readonly [string, string]>> = {
  anonymous: ['{{#if @member}}{{else}}', '{{/if}}'],
  free: ['{{#if @member}}{{#if @member.paid}}{{else}}', '{{/if}}{{/if}}'],
  paid: ['{{#if @member.paid}}', '{{/if}}'],
}

/** Row 4 on both emitters, BEFORE any expansion or binding, so the gate is the outermost thing around its element:
 *  the canvas drops what the handed visitor would not see; the theme wraps it in Ghost's own test. The show-to gates
 *  the root the same way. */
function gateMembers(doc: RuntimeDocument, root: RuntimeElement, input: RenderInput, tokens: Tokens, users: UserText | null): void {
  const member = input.member ?? 'anonymous'
  const gate = (el: RuntimeElement, state: MemberState) => {
    if (state === 'everyone') return
    if (users === null) {
      // ─────────── THE DIFFERENCE (2) — canvas: the visitor handed in sees it or does not ───────────
      if (state !== member) el.remove()
      return
    }
    // ─────────── THE DIFFERENCE (2) — theme: Ghost decides, per request ───────────
    const [open, close] = MEMBER_GATE[state]
    el.before(doc.createComment(tokens.put(open)))
    el.after(doc.createComment(tokens.put(close)))
  }
  for (const el of all(root, '[data-members]')) gate(el, consume(el, 'data-members') as MemberState)
  const section = root.firstElementChild
  if (section !== null) gate(section, input.visibility ?? 'everyone')
}

export type ThemeOutput = { template: string; partials: Record<string, string> }

/** The shared walk. `users !== null` is the theme; `users === null` is the canvas. */
function renderTree(
  doc: RuntimeDocument,
  src: string,
  given: RenderInput,
  tokens: Tokens,
  users: UserText | null,
): { root: RuntimeElement; partials: Record<string, string> } {
  // Story 4.5: the stored Count and Order are folded into the declared queries ONCE, here, so the
  // canvas rows and the theme's {{#get}} read the same numbers
  // Story 4.9: the handed strings pass `resolveStrings` once, here — the one door an override passes (S7)
  const input: RenderInput = {
    ...given,
    ...(given.data === undefined ? {} : { dataBindings: withData(given.dataBindings, given.data) }),
    strings: handedStrings(given.strings),
  }
  const root = doc.createElement('div')
  root.innerHTML = src
  refuseUnrendered(root)
  refuseCatalogMisuse(root)
  refuseConditionsAndMembers(root, input)
  // Story 4.7 — `data-module` SURVIVES on both emitters, on the element that carries it, because `core`
  // mounts on it on the live page; it is parsed here, once and before any expansion, and a bad value throws
  // the vocabulary's sentence (FR-G7). Story 4.10: so does every other `emitted` directive — Portal's
  // `data-members-form`, `-email` and `-error`, and `data-ghost-search` — each parsed and kept.
  for (const d of EMITTED_DIRECTIVES) for (const el of all(root, `[${d}]`)) consume(el, d)
  refuseUnpaginated(root, input.target)
  refuseGetOnForbiddenTarget(root, input)
  // R-2: two initials never come from Ghost — `{{split}}` is 6.5+ and a gscan error below it
  for (const el of all(root, '[data-initials]')) {
    for (const other of ['data-bind', 'data-prop']) {
      if (el.getAttribute(other) !== null) throw new Error(`data-initials="${el.getAttribute('data-initials') ?? ''}" shares <${el.tagName.toLowerCase()}> with ${other} — one element carries one text, and the second would silently replace the first.`)
    }
    if (el.getAttribute('data-repeat') !== null || insideRepeat(el, root)) {
      throw new Error(`data-initials="${el.getAttribute('data-initials') ?? ''}" sits inside a data-repeat. Two initials are baked only from a name the user typed (R-2); a person from Ghost shows one letter through the design's stylesheet over the bound name.`)
    }
  }
  // FR-H7 (Story 4.6), after R-7's refusals so their messages stand
  const target = input.target
  if (target !== undefined) {
    const refused = bindingRefusals(root, { ...input, target })
    if (refused.length > 0) {
      throw new Error(`FR-H7: ${target} does not carry every binding this design makes, and Ghost would print each refused one as a silent blank:\n  ${refused.join('\n  ')}`)
    }
    // Story 4.9 — V1's tree half, beside the scope check: literal English outside the catalog and every prop
    const literals = chromeLiterals(root)
    if (literals.length > 0) {
      throw new Error(`V1: this design prints English that is neither a catalog string nor a content prop, so no customer can translate it (FR-Q6). Give each a data-t / data-t-attr key from appendix-h1, or make it a content prop:\n  ${literals.join('\n  ')}`)
    }
  }
  if (input.icons === undefined) {
    for (const el of all(root, '[data-prop]')) {
      const path = el.getAttribute('data-prop') ?? ''
      if (own(input.schema, path)?.type === 'icon') {
        throw new Error(`"${path}" is an icon prop and this render was handed no icon lookup — pass @inflozo/library/icons' iconDrawing as RenderInput.icons. An icon is never silently left out (R-26).`)
      }
    }
  }
  // Story 4.10 — after every refusal (a gated-away section still refuses what it would refuse shown) and before the
  // controls, the lists and the repeats, so a member gate is the outermost wrapper of its element on the theme
  gateMembers(doc, root, input, tokens, users)
  if (root.firstElementChild !== null) stampControls(root.firstElementChild, input)
  // Story 4.9 — S5, AFTER the controls: stampControls strips every root data-* it does not own
  stampStrings(root, input, users)
  expandItems(doc, root, input, tokens, users)

  const partials: Record<string, string> = {}
  const ghost = input.ghost ?? {}

  if (users !== null) {
    // ─────────── THE DIFFERENCE (1) — theme: the repeat becomes {{#foreach}} ───────────
    // R1 decision 7 part B: deepest-first. Outer-first lifts the parent out of the tree with the
    // inner `data-repeat` attribute still on it, and it ships verbatim.
    const repeats = [...root.querySelectorAll('[data-repeat]')].sort((a, b) => depth(b) - depth(a))
    for (const el of repeats) {
      if (!root.contains(el)) continue
      const where = scopeOf(el, root, input, true)
      const source = consume(el, 'data-repeat') ?? ''
      const limit = consume(el, 'data-repeat-limit')
      const partialName = consume(el, 'data-partial')
      // The body is everything INSIDE the block, and a guard on the repeated element itself is part
      // of it: `wrapGuard` parks its comments as siblings, so the element is walked inside a holder
      // whose innerHTML is the body. Read from `el.outerHTML` instead, the `{{#if}}` landed OUTSIDE
      // `{{#foreach}}` and was evaluated against the wrong context (Story 4.2 review).
      const holder = doc.createElement('div')
      el.replaceWith(holder)
      holder.append(el)
      emitBindings(doc, holder, input, tokens, users, ghost, where)
      applyProps(holder, input, users, tokens)
      const body = holder.innerHTML
      // §7.3 gap row 2 / exit construct 1, and the half that was missing until Story 4.3: a
      // `data-repeat` naming a `dataBindings` KEY is a `{{#get}}`, not a `{{#foreach}}`. It used to
      // emit `{{#foreach <key>}}` over a name that is not a context path, so the block silently
      // rendered nothing. The query comes from the DECLARATION — there is no place in the markup
      // where a filter could be composed (AD-36).
      const query = own(input.dataBindings, source)
      if (query !== undefined && limit !== null) throw new Error(oneNumberOnePlace(source))
      // ONE block per query: a filter binding is one, a hand-picked `ids` binding is N in the picked
      // order (R-20) — each its own {{#get}} around its own {{#foreach}}, because the order is the
      // point and one get with an `id:a,id:b` filter would answer in the API's order.
      const opens = query === undefined
        ? [`{{#foreach ${source}${limit !== null ? ` limit="${limit}"` : ''}}}`]
        : getExprs(source, input.dataBindings).map((g) => `${g}\n{{#foreach ${query.source}}}`)
      const close = query === undefined ? '{{/foreach}}' : '{{/foreach}}\n{{/get}}'
      let inner: string
      if (partialName !== null) {
        if (partialName in partials) throw new Error(`data-partial "${partialName}" is declared twice`)
        partials[partialName] = body
        inner = `  {{> "${partialName}"}}`
      } else {
        inner = body
      }
      const replacement = opens.map((open) => `${open}\n${inner}\n${close}`).join('\n')
      holder.replaceWith(doc.createComment(tokens.put(replacement)))
    }
  } else {
    // ─────────── THE DIFFERENCE (1) — canvas: the repeat expands against real rows ───────────
    expandRepeats(doc, root, input, tokens, ghost)
  }

  emitBindings(doc, root, input, tokens, users, ghost, [])
  applyProps(root, input, users, tokens)
  return { root, partials }
}

/** The canvas half of THE DIFFERENCE (1), OUTER-first and recursive: each row is cloned into the
 *  tree, then the repeats INSIDE that clone expand against the row — which is what `{{#foreach}}`
 *  does on the other side, where `{{#foreach tags}}` inside `{{#foreach posts}}` reads each post's
 *  tags. Deepest-first, which the theme needs, resolved every nested source against the ROOT context
 *  and showed the site's top-level tags on every card (Story 4.2 review, executed). */
function expandRepeats(
  doc: RuntimeDocument,
  scope: RuntimeElement,
  input: RenderInput,
  tokens: Tokens,
  ctx: unknown,
  where: readonly ScopeEntry[] = [],
): void {
  for (const el of all(scope, '[data-repeat]').filter((e) => !insideRepeat(e, scope))) {
    const source = consume(el, 'data-repeat') ?? ''
    const limit = consume(el, 'data-repeat-limit')
    consume(el, 'data-partial')
    // A `dataBindings` key is not a context path: the shim builds the Content API query and the
    // EDITOR runs it (AD-1 bans `fetch` here), so the rows arrive as an input.
    const query = own(input.dataBindings, source)
    if (query !== undefined && limit !== null) throw new Error(oneNumberOnePlace(source))
    const supplied = own(input.getRows, source)
    if (query !== undefined && !Array.isArray(supplied)) {
      throw new Error(
        `data-repeat="${source}" is a {{#get}} and no rows were supplied for it in getRows (pass ` +
          `[] while the query is in flight). The editor runs the query the shim built; an empty ` +
          `block here would be indistinguishable from a query that returned nothing.`,
      )
    }
    if (query === undefined && supplied !== undefined) {
      // rows were fetched for a key the design does not declare: almost certainly a mistyped key,
      // which would otherwise become a silent {{#foreach}} over a name that is not a context path
      throw new Error(`data-repeat="${source}" has rows in getRows but no dataBindings entry — a {{#get}} key is declared in design.json (mistyped?).`)
    }
    const raw = query === undefined
      ? get(source.startsWith('@') ? (input.ghost ?? {}) : ctx, source)
      : supplied
    // a hand-picked order shows exactly as many rows as it picked, in step with the theme's N blocks
    const cap = query === undefined
      ? limit
      : query.ids !== undefined ? String(query.ids.length) : (query.limit === undefined ? null : String(query.limit))
    const rows = Array.isArray(raw) ? raw.slice(0, cap === null ? undefined : Number(cap)) : []
    const inner = [...where, repeatEntry(source, input)]
    for (const row of rows) {
      // Inserted BEFORE it is walked, so a guard that removes the clone (a `hide` on the repeated
      // element itself) is final rather than undone by a later insert.
      const clone = el.cloneNode(true)
      el.before(clone)
      expandRepeats(doc, clone, input, tokens, row, inner)
      emitBindings(doc, clone, input, tokens, null, row, inner)
      applyProps(clone, input, null, tokens)
    }
    el.remove()
  }
}

const tidy = (html: string): string => html.replace(/^\s*[\r\n]/gm, '').trim()

/** Emitter 1 — the `.hbs` text that ships to the customer's Ghost site. */
export function renderTheme(doc: RuntimeDocument, src: string, input: RenderInput = {}): ThemeOutput {
  const shared = input.users
  const users = shared ?? new UserText(input.schema ?? {}, input.tokens ?? {})
  const tokens = new Tokens()
  const { root, partials } = renderTree(doc, src, input, tokens, users)

  // AD-4 / AD-5: serialize FIRST, then resolve into the string. No document ever parses the result,
  // so numeric entities cannot be decoded back into live braces.
  const done = (s: string) => (shared === undefined ? users.substitute(s) : s)
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(partials)) out[k] = done(tokens.resolve(v))
  return { template: done(tidy(tokens.resolve(root.innerHTML))), partials: out }
}

/** Emitter 2 — the editing canvas. */
export function renderCanvas(doc: RuntimeDocument, src: string, input: RenderInput = {}): string {
  const { root } = renderTree(doc, src, input, new Tokens(), null)
  return tidy(root.innerHTML)
}

export { escapeUserText, serializeMarks }
