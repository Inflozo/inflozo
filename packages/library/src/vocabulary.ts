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
 *  canvas emitter calls it, and Story 4.3's `packages/ghost-shim` WILL call the same copy when it
 *  renders a recorded Ghost value on the canvas (AD-36 amended, Story 4.2; DW entry owned by 4.3). */
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

/** The three universal controls (FR-F3). Declared once, exempt from the ≈15 cap, never Quick
 *  Controls, and present on every section root — so a design's own `controlSchema` never lists
 *  them and the root always carries them. */
export const UNIVERSAL_CONTROLS = ['bg', 'spacing', 'divider'] as const

/** R-27 / AD-4: the closed set of inline binding tokens a CONTENT prop may declare. Anything else
 *  a user types between braces stays literal text. Free-form substitution is refused — an
 *  allow-list by construction is the only shape that closes AD-36 rather than filtering it. */
export const INLINE_TOKENS = ['members', 'term', 'n'] as const

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

/** R-27 / D9: an `a` mark carries `newTab?` and `rel?`, and the rel values are a closed set. Here
 *  rather than in the serializer because 4.5's Link Picker offers exactly this list — one copy. */
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

const isCatalogKey = (v: string) => /^[a-z][a-z0-9]*(\.[a-z0-9_-]+)+$/.test(v)

export type Directive = {
  /** one line, for the refusal message and for `docs/section-authoring.md` */
  readonly summary: string
  /** null when the value is legal, otherwise the sentence saying why not */
  readonly parse: (value: string) => string | null
  /** this directive gives the element a field a `data-empty` guard can be derived from */
  readonly guardable?: boolean
  /** the compiler does NOT consume this one: it survives into the emitted theme, because
   *  something on the live site reads it (Portal, sodo-search). Every other directive must be
   *  gone from every emitted file, which is what AD-34's leak assertion checks. */
  readonly emitted?: boolean
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
  'data-bind': {
    summary: "a Ghost value into this element's text — \"published_at|date:D MMM YYYY\"",
    guardable: true,
    parse: asSpec,
  },
  'data-bind-attr': {
    summary: 'a Ghost value into one or more attributes; a value may mix literal text with {path} tokens (R-27)',
    guardable: true,
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
    parse: (v) => (PATH_RE.test(v) ? ok : fail(`"${v}" is not a repeat source — a Ghost context path, or a key declared in design.json's dataBindings`)),
  },
  'data-repeat-limit': {
    summary: 'how many rows — 1 to 100 (FR-H2 caps `limit="all"` at 100, and `all` trips gscan on 6.x)',
    parse: (v) => (/^([1-9][0-9]?|100)$/.test(v) ? ok : fail(`"${v}" is not a limit between 1 and 100`)),
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
  'data-if': {
    // row 3
    summary: 'row 3 · the first arm of a two-armed conditional; the sibling carries data-else',
    parse: (v) => (PATH_RE.test(v) ? ok : fail(`"${v}" is not a valid path`)),
  },
  'data-else': {
    summary: 'row 3 · the other arm. Takes no value. (`data-empty` stays the ONE-armed guard.)',
    parse: (v) => (v === '' ? ok : fail(`data-else takes no value — got ${JSON.stringify(v)}`)),
  },
  'data-members': {
    // row 4
    summary: 'row 4 · show this subtree to one member state only; server-rendered, never client-gated',
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
    parse: inList('data-pagination', ['prev', 'next', 'numbers']),
  },
  // row 7 — nested repeats — needs NO directive: deepest-first ordering, already executed.
  // row 8 — group-by — STRUCK (R-1): it is the `group-headings` behaviour module, not a directive.
  'data-helper': {
    // row 9
    summary: 'row 9 · a bare helper with no bound path',
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
    // exit 3 — 4.9 owns the catalog; this story owns only how markup reaches it.
    summary: 'exit 3 · a chrome string by catalog key — emits {{t "key"}}. JS-written strings emit data-i18n-* instead',
    parse: (v) => (isCatalogKey(v) ? ok : fail(`"${v}" is not a catalog key (dotted namespace.name, never the English string)`)),
  },
  'data-t-attr': {
    summary: 'exit 3 · a chrome string into an attribute — "aria-label:a1.menu_open"',
    parse: attrList((attr, key) => assertBindableAttr(attr)
      ?? (isCatalogKey(key) ? ok : fail(`"${key}" is not a catalog key`))),
  },
  'data-bind-srcset': {
    // exit 4 — the binding grammar produces one expression per attribute, and srcset needs a set.
    summary: 'exit 4 · a responsive image set — "feature_image|img_url"; the shim emits Ghost-shaped srcset and sizes',
    guardable: true,
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
    summary: "which behaviour module owns this subtree — FR-G3's `js?` field, in markup. 4.7 owns the registry of names",
    parse: (v) => (/^[a-z][a-z0-9-]*$/.test(v) ? ok : fail(`"${v}" is not a module name`)),
  },
  'data-members-form': {
    summary: 'Portal reads this itself and applies the loading/success/error classes. With JavaScript off, nothing happens (R-5)',
    emitted: true,
    parse: inList('data-members-form', MEMBER_FORMS),
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
 *  answered. The three that survive do so because something on the live site reads them. */
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
