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
  CONSUMED_DIRECTIVES,
  DIRECTIVES,
  HELPERS,
  URL_ATTRS,
  assertBindableAttr as parseBindableAttr,
  guardField,
  parseBindSpec,
  safeCssColor,
  safeUrl,
  splitFirst,
} from '@inflozo/library'
import type { PropDef } from '@inflozo/library'
import { escapeUserText, isRich, serializeMarks } from './marks.ts'
import type { PropValue } from './marks.ts'

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
  readonly attributes: Iterable<{ name: string; value: string }>
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
}

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
  'data-module',
]

/** Derived, not written down. `data-t`/`data-t-attr` are 4.9's, `data-bind-srcset`/`data-helper`/
 *  `data-pagination` are 4.3's shim, `data-needs` is AD-37's compile-time placement question, and
 *  the rest are later stories'. They REFUSE rather than leak. */
export const REFUSED_DIRECTIVES: readonly string[] = CONSUMED_DIRECTIVES.filter(
  (d) => !RENDERED_DIRECTIVES.includes(d),
)

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
const isEmpty = (v: unknown): boolean =>
  v == null || v === '' || v === false || v === 0 || (Array.isArray(v) && v.length === 0)

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

/** THE directive reader. Every rendered directive is read through here: the value is validated by
 *  the library's own grammar for that directive — the one copy 4.1's validator uses — and refused
 *  by name before it can reach any syntax, then the attribute is consumed. This is AD-36 (2) made
 *  mechanical: `data-repeat`, `data-repeat-limit` and `data-partial` used to be interpolated into
 *  `{{#foreach}}` unvalidated (Story 4.2 review — `data-repeat='posts}}<script>'` shipped a live
 *  script), and the fix that closes the class is that nothing reads a directive any other way.
 *  `data-empty` is the one exception to the consume: it is shared by every directive on its element
 *  and is swept at the end of the walk, so the first reader cannot rob the second. */
function consume(el: RuntimeElement, name: string): string | null {
  const v = el.getAttribute(name)
  if (v === null) return null
  const d = DIRECTIVES[name]
  if (d === undefined) throw new Error(`"${name}" is not in the vocabulary`)
  const bad = d.parse(v) // null when legal
  if (bad !== null) throw new Error(`AD-36: ${name}=${JSON.stringify(v)} — ${bad}`)
  if (name !== 'data-empty') el.removeAttribute(name)
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

export function assertBindableAttr(attr: string): string {
  const bad = parseBindableAttr(attr)
  if (bad !== null) throw new Error(`AD-36: ${bad}`)
  return attr.toLowerCase()
}

/** AD-3's carve-out has no second colour to fall back to that the runtime can know, so it uses the
 *  pack's own accent token — FR-E1's `accent`, present in every pack and in `reference-tokens.css`. */
const COLOUR_FALLBACK_TOKEN = '--accent'

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
function wrapGuard(doc: RuntimeDocument, el: RuntimeElement, field: string, tokens: Tokens): void {
  el.before(doc.createComment(tokens.put(`{{#if ${field}}}`)))
  el.after(doc.createComment(tokens.put('{{/if}}')))
}

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

/** `users` is the WHOLE of the difference between the emitters at the binding sites: a `UserText`
 *  on the theme path, `null` on the canvas path. */
function emitBindings(
  doc: RuntimeDocument,
  scope: RuntimeElement,
  input: RenderInput,
  tokens: Tokens,
  users: UserText | null,
  ctx: unknown,
): void {
  // Handlebars resolves `@site`, `@custom` and every other `@data` variable from the ROOT, wherever
  // the expression sits; a row inside `{{#foreach}}` does not shadow it. The canvas does the same.
  const resolve = (spec: string): string | null =>
    bindValue(spec, spec.startsWith('@') ? (input.ghost ?? {}) : ctx)

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
        wrapGuard(doc, el, field, tokens)
      } else {
        // FR-H8's verbatim form: {{#if x}}{{x}}{{else}}<static>{{/if}}
        el.textContent = tokens.put(
          `{{#if ${field}}}${expr}{{else}}${escStatic(authored)}{{/if}}`,
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
    const mode = guardMode(el, guardEntry !== undefined && URL_ATTRS.has(guardEntry.attr))
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
              : `{{#if ${guardField(spec)}}}${expr}{{else}}${escAttr(el.getAttribute(attr) ?? '')}{{/if}}`,
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
        el.setAttribute(attr, URL_ATTRS.has(attr) ? safeUrl(v) : v)
      }
    }
    if (!removed && users !== null && mode === 'hide' && guardEntry !== undefined) {
      wrapGuard(doc, el, guardField(guardEntry.spec), tokens)
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
      // Story 4.3's shim will read the same `safeCssColor` when it renders a recorded value here.
      el.setAttribute(
        'style',
        tokens.put(`{{#if ${guardField(spec)}}}${prop}: ${bindExpr(spec)}{{/if}}`),
      )
    } else {
      // ─────────── THE DIFFERENCE (2) — canvas ───────────
      const v = resolve(spec)
      el.setAttribute('style', v === null ? '' : `${prop}: ${safeCssColor(v, COLOUR_FALLBACK_TOKEN)}`)
    }
  }
}

/** AD-1 bans `Intl`, `toLocale*` and `Date.toString`/`getHours` because each reads the machine
 *  rather than the argument. UTC getters are the safe form, so the formatter is written from them
 *  and is deliberately small — the tokens Ghost's `{{date}}` examples use (moment's `YYYY`, `YY`,
 *  `MMMM`, `MMM`, `MM`, `DD`, `D`). Any other token is left as typed, which the canvas then shows,
 *  so an unsupported format is visible rather than silently different. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatDate(raw: unknown, fmt?: string): string {
  const d = new Date(typeof raw === 'number' ? raw : String(raw))
  if (Number.isNaN(d.getTime())) return ''
  const p2 = (x: number) => String(x).padStart(2, '0')
  const map: Record<string, string> = {
    YYYY: String(d.getUTCFullYear()),
    YY: p2(d.getUTCFullYear() % 100),
    MMMM: MONTHS_LONG[d.getUTCMonth()] as string,
    MMM: MONTHS[d.getUTCMonth()] as string,
    MM: p2(d.getUTCMonth() + 1),
    DD: p2(d.getUTCDate()),
    D: String(d.getUTCDate()),
  }
  // longest key first, so MMMM is not eaten by MM and DD is not eaten by D
  return (fmt ?? 'YYYY-MM-DD').replace(/YYYY|YY|MMMM|MMM|MM|DD|D/g, (k) => map[k] as string)
}

/** The canvas counterpart of `bindExpr`: same spec, same grammar, a value instead of a mustache.
 *  ONE parse — `parseBindSpec` — so an invalid spec fails IDENTICALLY on both emitters and the
 *  grammar is never re-derived here. A design the compiler refuses must not silently render. */
export function bindValue(spec: string, ctx: unknown): string | null {
  const parsed = parseBindSpec(spec)
  if (typeof parsed === 'string') throw new Error(`AD-36: ${parsed}`)
  const raw = get(ctx, parsed.path)
  if (isEmpty(raw)) return null
  if (parsed.helper === 'date') return formatDate(raw, parsed.arg) // the format argument is HONOURED
  return String(raw) // img_url: the size is a Ghost-side concern (4.3's shim owns it)
}

function applyProps(
  scope: RuntimeElement,
  input: RenderInput,
  users: UserText | null,
): void {
  const content = input.content ?? {}
  const schema = input.schema ?? {}
  const tokenValues = input.tokens ?? {}

  for (const el of all(scope, '[data-prop]')) {
    const path = consume(el, 'data-prop') ?? ''
    const v = get(content, path) as PropValue
    const mode = guardMode(el, false)
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
      el.innerHTML = serializeMarks(v, schema[path], tokenValues)
    }
  }

  // ONE attribute, a semicolon-separated LIST (`data-prop-attr2` is retired — Story 4.1).
  for (const el of all(scope, '[data-prop-attr]')) {
    const entries = (consume(el, 'data-prop-attr') ?? '').split(';').filter((e) => e.trim() !== '')
    const mode = guardMode(el, false)
    let firstMissing = false
    for (const [i, entry] of entries.entries()) {
      const [rawAttr, rawPath] = splitFirst(entry.trim(), ':')
      const attr = assertBindableAttr(rawAttr) // AD-36 (3)
      const raw = get(content, rawPath ?? '')
      if (propEmpty(raw)) {
        if (i === 0) firstMissing = true
        continue
      }
      // An attribute holds TEXT: a rich value contributes its text and never its marks.
      const v = isRich(raw) ? raw.text : raw
      // AD-36 (1): a user-supplied URL is scheme-checked BEFORE it becomes a marker. Here rather
      // than in the escaper, because a scheme is only meaningful where the context is known.
      const safe = URL_ATTRS.has(attr) ? safeUrl(v) : String(v)
      el.setAttribute(attr, users !== null ? users.put(rawPath ?? '', safe) : safe)
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
  for (const el of all(scope, '[data-module]')) consume(el, 'data-module')
}

export type ThemeOutput = { template: string; partials: Record<string, string> }

/** The shared walk. `users !== null` is the theme; `users === null` is the canvas. */
function renderTree(
  doc: RuntimeDocument,
  src: string,
  input: RenderInput,
  tokens: Tokens,
  users: UserText | null,
): { root: RuntimeElement; partials: Record<string, string> } {
  const root = doc.createElement('div')
  root.innerHTML = src
  refuseUnrendered(root)

  const partials: Record<string, string> = {}
  const ghost = input.ghost ?? {}

  if (users !== null) {
    // ─────────── THE DIFFERENCE (1) — theme: the repeat becomes {{#foreach}} ───────────
    // R1 decision 7 part B: deepest-first. Outer-first lifts the parent out of the tree with the
    // inner `data-repeat` attribute still on it, and it ships verbatim.
    const repeats = [...root.querySelectorAll('[data-repeat]')].sort((a, b) => depth(b) - depth(a))
    for (const el of repeats) {
      if (!root.contains(el)) continue
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
      emitBindings(doc, holder, input, tokens, users, ghost)
      applyProps(holder, input, users)
      const body = holder.innerHTML
      const open = `{{#foreach ${source}${limit !== null ? ` limit="${limit}"` : ''}}}`
      let replacement: string
      if (partialName !== null) {
        if (partialName in partials) throw new Error(`data-partial "${partialName}" is declared twice`)
        partials[partialName] = body
        replacement = `${open}\n  {{> "${partialName}"}}\n{{/foreach}}`
      } else {
        replacement = `${open}\n${body}\n{{/foreach}}`
      }
      holder.replaceWith(doc.createComment(tokens.put(replacement)))
    }
  } else {
    // ─────────── THE DIFFERENCE (1) — canvas: the repeat expands against real rows ───────────
    expandRepeats(doc, root, input, tokens, ghost)
  }

  emitBindings(doc, root, input, tokens, users, ghost)
  applyProps(root, input, users)
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
): void {
  for (const el of all(scope, '[data-repeat]').filter((e) => !insideRepeat(e, scope))) {
    const source = consume(el, 'data-repeat') ?? ''
    const limit = consume(el, 'data-repeat-limit')
    consume(el, 'data-partial')
    const raw = get(source.startsWith('@') ? (input.ghost ?? {}) : ctx, source)
    const rows = Array.isArray(raw) ? raw.slice(0, limit === null ? undefined : Number(limit)) : []
    for (const row of rows) {
      // Inserted BEFORE it is walked, so a guard that removes the clone (a `hide` on the repeated
      // element itself) is final rather than undone by a later insert.
      const clone = el.cloneNode(true)
      el.before(clone)
      expandRepeats(doc, clone, input, tokens, row)
      emitBindings(doc, clone, input, tokens, null, row)
      applyProps(clone, input, null)
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
