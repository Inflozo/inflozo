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
import { escapeUserText, serializeMarks } from './marks.ts'
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
  /** the user's content, keyed by the flat dotted prop paths `content.json` declares */
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

const get = (o: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((a, k) => (a == null ? a : (a as Record<string, unknown>)[k]), o)

const depth = (el: RuntimeElement): number => {
  let d = 0
  for (let p: RuntimeElement | null = el; p !== null; p = p.parentElement) d++
  return d
}

/** Static text authored by the DESIGN, on its way back into the emitted string. Not user text —
 *  AD-5's brace rule is not applied, because a design's own `{{` would be a validator failure
 *  (4.1), not something to neutralise here. */
const escStatic = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escAttr = (s: string): string => escStatic(s).replace(/"/g, '&quot;')

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
 *  `data-empty` overrides either way. */
function guardMode(el: RuntimeElement, firstAttr?: string): Guard {
  const declared = el.getAttribute('data-empty')
  if (declared === 'hide' || declared === 'fallback') return declared
  return firstAttr !== undefined && URL_ATTRS.has(firstAttr) ? 'hide' : 'fallback'
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
 *  gate as a silently-ignored attribute, so "not implemented" must be a throw and never a no-op. */
function refuseUnrendered(root: RuntimeElement): void {
  for (const d of REFUSED_DIRECTIVES) {
    if (all(root, `[${d}]`).length === 0) continue
    throw new Error(
      `the section runtime does not emit "${d}" yet — ${DIRECTIVES[d]?.summary ?? ''}. ` +
        `It is in the authoring vocabulary and the story that owns it will render it; until then a ` +
        `design using it is refused rather than compiled with the directive ignored.`,
    )
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
  for (const el of all(scope, '[data-bind]')) {
    const spec = el.getAttribute('data-bind') ?? ''
    const field = guardField(spec)
    const mode = guardMode(el)
    const authored = el.textContent ?? ''
    el.removeAttribute('data-bind')
    el.removeAttribute('data-empty')
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
      const v = bindValue(spec, ctx)
      if (v === null) {
        // the guard removes the ELEMENT, which is what {{#if}} does on the other side; `fallback`
        // leaves the authored text exactly where it is, which is what {{else}} does
        if (mode === 'hide') el.remove()
      } else {
        el.textContent = v
      }
    }
  }

  for (const el of all(scope, '[data-bind-attr]')) {
    const entries = (el.getAttribute('data-bind-attr') ?? '').split(';').filter((e) => e.trim() !== '')
    const firstAttr =
      entries.length > 0 ? assertBindableAttr(splitFirst((entries[0] as string).trim(), ':')[0]) : undefined
    const mode = guardMode(el, firstAttr)
    el.removeAttribute('data-bind-attr')
    el.removeAttribute('data-empty')
    let firstField: string | undefined
    let removed = false
    for (const [i, entry] of entries.entries()) {
      const [rawAttr, rawSpec] = splitFirst(entry.trim(), ':')
      const attr = assertBindableAttr(rawAttr) // AD-36 (3), on BOTH emitters
      const spec = rawSpec ?? ''
      if (i === 0) firstField = guardField(spec)
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
        const v = bindValue(spec, ctx)
        if (v === null) {
          if (i === 0 && mode === 'hide') {
            el.remove()
            removed = true
            break
          }
          continue // a later null entry sets nothing and leaves the authored attribute alone
        }
        // AD-36 (1) on the canvas too: a `javascript:` URL here runs on Inflozo's own origin.
        el.setAttribute(attr, URL_ATTRS.has(attr) ? safeUrl(v) : v)
      }
    }
    if (!removed && users !== null && mode === 'hide' && firstField !== undefined) {
      wrapGuard(doc, el, firstField, tokens)
    }
  }

  // AD-3's single carve-out (row 12): an inline `style` may set ONE bound CSS custom property.
  for (const el of all(scope, '[data-bind-style]')) {
    const [prop, rawSpec] = splitFirst(el.getAttribute('data-bind-style') ?? '', ':')
    el.removeAttribute('data-bind-style')
    if (!/^--[a-zA-Z0-9-]+$/.test(prop) || rawSpec === undefined) {
      throw new Error(
        `AD-3: data-bind-style is "--custom-property:path" — a custom property and nothing else; got ` +
          `${JSON.stringify(el.getAttribute('data-bind-style'))}`,
      )
    }
    if (users !== null) {
      // ─────────── THE DIFFERENCE (2) — theme ───────────
      // AD-36 (4), and the ceiling this runtime cannot close: the emitted mustache is correct
      // Handlebars and the VALUE arrives at render, on the customer's site, after every build-time
      // gate has run. AD-36's own text says so. `packages/ghost-shim` calls `safeCssColor` on the
      // canvas side, which is the half that is reachable — same copy, one rule.
      el.setAttribute('style', `${prop}: ${tokens.put(bindExpr(rawSpec))}`)
    } else {
      // ─────────── THE DIFFERENCE (2) — canvas ───────────
      el.setAttribute('style', `${prop}: ${safeCssColor(bindValue(rawSpec, ctx), COLOUR_FALLBACK_TOKEN)}`)
    }
  }
}

/** AD-1 bans `Intl`, `toLocale*` and `Date.toString`/`getHours` because each reads the machine
 *  rather than the argument. UTC getters are the safe form, so the formatter is written from them
 *  and is deliberately small. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(raw: unknown, fmt?: string): string {
  const d = new Date(String(raw))
  if (Number.isNaN(d.getTime())) return ''
  const p2 = (x: number) => String(x).padStart(2, '0')
  const map: Record<string, string> = {
    YYYY: String(d.getUTCFullYear()),
    MMMM: MONTHS[d.getUTCMonth()] as string,
    MMM: MONTHS[d.getUTCMonth()] as string,
    MM: p2(d.getUTCMonth() + 1),
    DD: p2(d.getUTCDate()),
  }
  // longest key first, so MMMM is not eaten by MM
  return (fmt ?? 'YYYY-MM-DD').replace(/YYYY|MMMM|MMM|MM|DD/g, (k) => map[k] as string)
}

/** The canvas counterpart of `bindExpr`: same spec, same grammar, a value instead of a mustache.
 *  It re-parses through `bindExpr` first so an invalid spec fails IDENTICALLY on both emitters — a
 *  design the compiler refuses must not silently render on the canvas. */
export function bindValue(spec: string, ctx: unknown): string | null {
  bindExpr(spec) // validate: AD-36 (2), both sides
  const [path, helper] = splitFirst(spec, '|')
  const raw = get(ctx, path)
  if (raw == null) return null
  if (helper === undefined) return String(raw)
  const [name, arg] = splitFirst(helper, ':')
  if (name === 'date') return formatDate(raw, arg) // the format argument is HONOURED
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
    const path = el.getAttribute('data-prop') ?? ''
    const v = get(content, path) as PropValue
    el.removeAttribute('data-prop')
    if (v == null) {
      // FR-H8's text default, on a prop rather than a binding: the authored text stays. `hide` is
      // the explicit override, and DW-93's class — the marker must never survive either way.
      if (el.getAttribute('data-empty') === 'hide') el.remove()
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
    const entries = (el.getAttribute('data-prop-attr') ?? '').split(';').filter((e) => e.trim() !== '')
    const mode = guardMode(el)
    el.removeAttribute('data-prop-attr')
    let firstMissing = false
    for (const [i, entry] of entries.entries()) {
      const [rawAttr, rawPath] = splitFirst(entry.trim(), ':')
      const attr = assertBindableAttr(rawAttr) // AD-36 (3)
      const v = get(content, rawPath ?? '')
      if (v == null) {
        if (i === 0) firstMissing = true
        continue
      }
      // AD-36 (1): a user-supplied URL is scheme-checked BEFORE it becomes a marker. Here rather
      // than in the escaper, because a scheme is only meaningful where the context is known.
      const safe = URL_ATTRS.has(attr) ? safeUrl(v) : v
      el.setAttribute(attr, users !== null ? users.put(rawPath ?? '', safe as PropValue) : String(safe))
    }
    // DW-93: the harness removed only its own attribute here and implemented no `hide`, so an
    // element whose only content is a user-picked image kept a dead `data-empty` and never hid.
    if (firstMissing && mode === 'hide') el.remove()
  }

  // Whatever `data-empty` the prop loops read is consumed here, so none can survive into output.
  for (const el of all(scope, '[data-empty]')) el.removeAttribute('data-empty')
  for (const el of all(scope, '[data-module]')) el.removeAttribute('data-module')
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

  // R1 decision 7 part B: deepest-first. Outer-first lifts the parent out of the tree with the
  // inner `data-repeat` attribute still on it, and it ships verbatim.
  const repeats = [...root.querySelectorAll('[data-repeat]')].sort((a, b) => depth(b) - depth(a))
  for (const el of repeats) {
    if (!root.contains(el)) continue
    const source = el.getAttribute('data-repeat') ?? ''
    const limit = el.getAttribute('data-repeat-limit')
    const partialName = el.getAttribute('data-partial')
    el.removeAttribute('data-repeat')
    el.removeAttribute('data-repeat-limit')
    el.removeAttribute('data-partial')

    if (users !== null) {
      // ─────────── THE DIFFERENCE (1) — theme: the repeat becomes {{#foreach}} ───────────
      emitBindings(doc, el, input, tokens, users, ghost)
      applyProps(el, input, users)
      const body = el.outerHTML
      const open = `{{#foreach ${source}${limit !== null ? ` limit="${limit}"` : ''}}}`
      let replacement: string
      if (partialName !== null) {
        partials[partialName] = body
        replacement = `${open}\n  {{> "${partialName}"}}\n{{/foreach}}`
      } else {
        replacement = `${open}\n${body}\n{{/foreach}}`
      }
      el.replaceWith(doc.createComment(tokens.put(replacement)))
    } else {
      // ─────────── THE DIFFERENCE (1) — canvas: the repeat expands against real rows ───────────
      const n = limit === null ? undefined : Number(limit)
      const rows = ((get(ghost, source) ?? []) as unknown[]).slice(0, n)
      for (const row of rows) {
        const clone = el.cloneNode(true)
        emitBindings(doc, clone, input, tokens, null, row)
        applyProps(clone, input, null)
        el.before(clone)
      }
      el.remove()
    }
  }

  emitBindings(doc, root, input, tokens, users, ghost)
  applyProps(root, input, users)
  return { root, partials }
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
