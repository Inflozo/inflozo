// The validator. It refuses anything outside the contract in `vocabulary.ts` and `registry.ts`,
// and it returns a LIST of failures rather than throwing on the first — an author fixing a design
// wants every problem in one pass, not one per run.
//
// ponytail: the scan is LEXICAL — a regex over each tag's attribute run. Its job here is to refuse
// an unknown directive and a malformed value, which is a token-level question. The tree-aware
// questions it deliberately cannot answer — nesting depth, a `data-else` with no `data-if` sibling,
// repeat containment, a raw `{{…}}` written into authored markup where `data-helper` belongs —
// need a real parse, and Story 4.2 brings a real parser for the two emitters. When it lands, move
// these checks behind it and add the four above; the grammar below does not change. One more is
// 4.6's, not 4.2's: a `data-repeat` over a context path that does not exist (`post.tagz`) needs the
// binding matrix, and until then only the declared-query direction is checked (`binding-unreferenced`).

import {
  BINDING_CONTEXTS, COMPILE_TARGETS, DIRECTIVES, GET_FORBIDDEN_TARGETS, GET_SOURCES,
  INLINE_STYLE_RE, INLINE_TOKENS, MARKS, PAGINATED_TARGETS, RETIRED_DIRECTIVES, UNIVERSAL_CONTROLS,
  isCompileTarget, safeUrl, splitFirst,
} from './vocabulary.ts'
import type { CategoryContent, ControlDef, DataBinding, DesignJson } from './registry.ts'

export type Failure = { code: string; message: string }

const push = (out: Failure[], code: string, message: string) => { out.push({ code, message }) }

// ─── the lexical scan ────────────────────────────────────────────────────────

export type ScannedTag = { name: string; attrs: Array<[string, string]> }

const TAG_RE = /<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g
const ATTR_RE = /([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

/** Every element-opening tag in document order, comments removed. The FIRST is the section root. */
export function scanTags(html: string): ScannedTag[] {
  const body = html.replace(/<!--[\s\S]*?-->/g, '')
  const out: ScannedTag[] = []
  let t: RegExpExecArray | null
  TAG_RE.lastIndex = 0
  while ((t = TAG_RE.exec(body)) !== null) {
    const attrs: Array<[string, string]> = []
    const blob = t[2] ?? ''
    let a: RegExpExecArray | null
    ATTR_RE.lastIndex = 0
    while ((a = ATTR_RE.exec(blob)) !== null) {
      attrs.push([a[1] ?? '', a[2] ?? a[3] ?? a[4] ?? ''])
    }
    out.push({ name: (t[1] ?? '').toLowerCase(), attrs })
  }
  return out
}

export type MarkupOptions = {
  /** the control names this design declares, WITHOUT the `data-` prefix. When omitted, the root's
   *  unrecognised `data-*` attributes are assumed to be controls and neither direction is checked. */
  controls?: readonly string[]
  /** the category's union, when it is available. Without it the prop GRAMMAR is still checked;
   *  only resolution against the union is skipped. */
  content?: CategoryContent
  /** the design's compile targets, so `data-target` cannot name one the design cannot compile to */
  compileTarget?: readonly string[]
  /** the design's declared queries, so a `data-repeat` key and its declaration are checked against
   *  each other in the one direction a lexical scan can answer (see `binding-unreferenced`) */
  dataBindings?: Record<string, DataBinding>
}

/** The directives that give an element a field a `data-empty` guard can be derived from. */
const GUARDABLE = Object.keys(DIRECTIVES).filter((k) => DIRECTIVES[k]?.guardable === true)

export function validateMarkup(html: string, opts: MarkupOptions = {}): Failure[] {
  const out: Failure[] = []
  const tags = scanTags(html)
  if (tags.length === 0) {
    push(out, 'no-root', 'the markup has no element — a design source is a section root with its content inside it.')
    return out
  }
  const declared = opts.controls === undefined ? null : new Set(opts.controls)
  const seenControls = new Set<string>()
  const referencedKeys = new Set<string>()

  tags.forEach((tag, i) => {
    const isRoot = i === 0
    const names = tag.attrs.map(([k]) => k.toLowerCase())
    const attr = (n: string) => tag.attrs.find(([k]) => k.toLowerCase() === n)?.[1]

    // The scan reads every attribute; a browser reads the FIRST of a duplicated name and drops the
    // rest silently, so a second `data-bind` on one tag is content that never renders.
    const dup = names.find((n, j) => names.indexOf(n) !== j)
    if (dup !== undefined) {
      push(out, 'duplicate-attribute', `<${tag.name}> carries ${dup} twice — a browser keeps the first and drops the rest silently. One directive per name per element; the list forms take a semicolon-separated list.`)
    }
    if ((names.includes('data-repeat-limit') || names.includes('data-partial')) && !names.includes('data-repeat')) {
      push(out, 'orphan-repeat-modifier', `<${tag.name}> carries data-repeat-limit or data-partial with no data-repeat on the same element — both modify a repeat and would be silently ignored.`)
    }
    if (names.includes('data-if') && names.includes('data-else')) {
      push(out, 'if-and-else', `<${tag.name}> carries both data-if and data-else — the two arms are two SIBLING elements.`)
    }
    // FR-H8 again: a guard derived from a token template is `{{#if signup/{tier}}}` — present,
    // garbage, never true. The guard is the FIRST binding's field; a first entry that is a template
    // has no single field to derive from.
    const firstBindAttr = attr('data-bind-attr')
    if (names.includes('data-empty') && firstBindAttr !== undefined && !names.includes('data-bind')) {
      const firstSpec = splitFirst(firstBindAttr.split(';')[0]?.trim() ?? '', ':')[1] ?? ''
      if (firstSpec.includes('{')) {
        push(out, 'guard-on-template', `<${tag.name} data-empty> would guard on "${firstSpec}", a token template. The guard is derived from the FIRST binding's field; put a plain path first, or move the guard.`)
      }
    }
    const repeat = attr('data-repeat')
    if (repeat !== undefined && opts.dataBindings !== undefined
      && Object.prototype.hasOwnProperty.call(opts.dataBindings, repeat)) {
      referencedKeys.add(repeat)
      if (names.includes('data-repeat-limit')) {
        push(out, 'limit-authored-twice', `<${tag.name} data-repeat="${repeat}"> carries data-repeat-limit, and the query "${repeat}" already declares its own limit in dataBindings. One number, one place: the query's.`)
      }
    }

    for (const [rawName, value] of tag.attrs) {
      const name = rawName.toLowerCase()

      // AD-3's one carve-out, machine-checked.
      if (name === 'style') {
        if (!INLINE_STYLE_RE.test(value)) {
          push(out, 'inline-style', `<${tag.name} style="${value}"> — AD-3 permits an inline style that sets a SINGLE CSS custom property to a pack token (\`--x: var(--accent)\`) and nothing else — §7.3 allows no hex outside the Style Pack. Use the design's stylesheet, or data-bind-style for a bound value.`)
        }
        continue
      }
      if (!name.startsWith('data-')) continue
      // `data-portal` and `data-ghost-search` are Ghost's own attributes, not Inflozo directives;
      // the first is in the bindable allow-list and the second is a directive of its own.
      if (name === 'data-portal') continue

      const retired = RETIRED_DIRECTIVES[name]
      if (retired !== undefined) {
        push(out, 'retired-directive', `<${tag.name} ${name}> is ${retired}`)
        continue
      }

      const directive = DIRECTIVES[name]
      if (directive !== undefined) {
        const why = directive.parse(value)
        if (why !== null) push(out, 'bad-value', `<${tag.name} ${name}="${value}"> — ${why}`)
        continue
      }

      // Not a directive. On the root it is a control; anywhere else it is nothing at all.
      const control = name.slice('data-'.length)
      if (!isRoot) {
        push(out, 'unknown-directive', `<${tag.name} ${name}> is not in the directive set. A control is ONE attribute on the section root (AD-3), and the set is closed: ${Object.keys(DIRECTIVES).join(', ')}.`)
        continue
      }
      seenControls.add(control)
      if (declared !== null
        && !declared.has(control)
        && !(UNIVERSAL_CONTROLS as readonly string[]).includes(control)) {
        push(out, 'root-control-undeclared', `the root carries ${name} but no control named "${control}" is in controlSchema — the stylesheet must never select on an attribute the design does not own (AD-3).`)
      }
    }

    // FR-H8: a guard needs a field to be derived FROM. A `data-empty` with nothing to guard emits
    // `{{#if}}` on nothing, which is the shape of the round-4 defect: present, and empty.
    if (names.includes('data-empty') && !GUARDABLE.some((g) => names.includes(g))) {
      push(out, 'guard-without-source', `<${tag.name} data-empty> has no bound or authored value on the same element. The guard is derived from the BOUND FIELD (${GUARDABLE.join(' / ')}), never from a helper argument — a guard on a date FORMAT renders nothing and loses the content permanently.`)
    }

    // Resolution against the category's union, when we have it.
    if (opts.content !== undefined) {
      for (const [rawName, value] of tag.attrs) {
        const name = rawName.toLowerCase()
        const paths = name === 'data-prop' || name === 'data-items'
          ? [value]
          : name === 'data-prop-attr'
            ? value.split(';').map((e) => e.split(':').slice(1).join(':')).filter((s) => s !== '')
            : []
        for (const p of paths) {
          if (p === '') continue
          const prop = Object.prototype.hasOwnProperty.call(opts.content.props, p) ? opts.content.props[p] : undefined
          if (prop === undefined) {
            push(out, 'unknown-prop', `<${tag.name} ${name}="${value}"> names "${p}", which ${opts.content.category}'s content.json does not declare. A content prop never crosses a category boundary (R-102) — add it to this category's union.`)
            continue
          }
          // The directive's kind must agree with the prop's type, or the compiler bakes an array
          // as text or repeats over a string.
          const want = name === 'data-items' ? ['array'] : name === 'data-prop' ? ['text', 'richtext'] : null
          if (want !== null && !want.includes(prop.type)) {
            push(out, 'prop-type-mismatch', `<${tag.name} ${name}="${value}"> — "${p}" is a ${prop.type} prop, and ${name} takes ${want.join(' or ')}.`)
          }
        }
      }
    }

    if (opts.compileTarget !== undefined) {
      const target = tag.attrs.find(([k]) => k.toLowerCase() === 'data-target')
      if (target !== undefined) {
        for (const t of target[1].split(';').map((s) => s.trim()).filter((s) => s !== '')) {
          if (!opts.compileTarget.includes(t)) {
            push(out, 'target-not-declared', `data-target="${t}" — the design's compileTarget does not include ${t}, so that subtree can never be emitted.`)
          }
        }
      }
    }
  })

  // The one direction a lexical scan CAN answer about a query key: every declared query is
  // referenced. The other direction — a `data-repeat` over a context path that does not exist —
  // needs the binding matrix, which is 4.6's. A typo in a key (`latst`) fails here anyway, because
  // the key it was meant to be goes unreferenced.
  for (const k of Object.keys(opts.dataBindings ?? {})) {
    if (!referencedKeys.has(k)) {
      push(out, 'binding-unreferenced', `dataBindings declares "${k}" and no data-repeat in the markup names it — a query nothing repeats over is dead, or the repeat that meant to name it is misspelt.`)
    }
  }

  // The other direction (exit construct 5): every declared control must be ON the root, or the
  // control is invisible to the stylesheet and the sidebar writes an attribute nothing reads.
  if (declared !== null) {
    for (const c of declared) {
      if (!seenControls.has(c)) {
        push(out, 'root-control-missing', `controlSchema declares "${c}" but the root carries no data-${c} — a control is one attribute on the section root (AD-3), and the two must match in both directions.`)
      }
    }
    for (const u of UNIVERSAL_CONTROLS) {
      if (!seenControls.has(u)) {
        push(out, 'universal-control-missing', `the root carries no data-${u} — the three universal controls (${UNIVERSAL_CONTROLS.join(', ')}) sit on EVERY section (FR-F3) and are declared once, never per design.`)
      }
    }
  }

  return out
}

// ─── design.json ─────────────────────────────────────────────────────────────

const CONTROL_NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/** The grammar of ONE `dataBindings` entry, in one place: `validateDesignJson` runs it over a
 *  design, and `@inflozo/ghost-shim`'s `getQuery` runs it again at EMISSION, because the runtime is
 *  handed `dataBindings` as an input and never runs the design validator — a filter the validator
 *  never saw would otherwise reach a `{{#get}}` by concatenation (AD-36 2, Story 4.3 review). */
export function validateDataBinding(k: string, b: DataBinding): Failure[] {
  const out: Failure[] = []
  if (!/^[a-z][a-z0-9_]*$/.test(k) || (GET_SOURCES as readonly string[]).includes(k)) {
    push(out, 'bad-get-key', `dataBindings key "${k}" — a key is a lowercase identifier the markup names in data-repeat, and it may not be a source name (${GET_SOURCES.join(', ')}), which a data-repeat would read as a context path instead.`)
  }
  if (b.ids !== undefined) {
    // R-20: hand-picked order is N single-id gets, in this order, and there is no cap — the
    // panel warns past 25, which is 4.5's sidebar and not a refusal.
    if (!Array.isArray(b.ids) || b.ids.length === 0 || !b.ids.every((id) => typeof id === 'string' && /^[A-Za-z0-9_-]+$/.test(id))) {
      push(out, 'bad-get-ids', `dataBindings.${k}.ids must be a non-empty list of ids (letters, digits, _ and -) — a hand-picked order is one single-id get per entry (R-20).`)
    }
    if (b.filter !== undefined || b.limit !== undefined || b.order !== undefined) {
      push(out, 'bad-get-ids', `dataBindings.${k} declares ids AND a filter, limit or order. A hand-picked order IS the filter, the limit and the order (R-20) — declare one or the other.`)
    }
  }
  if (!(GET_SOURCES as readonly string[]).includes(b.source)) {
    push(out, 'bad-get-source', `dataBindings.${k}.source "${b.source}" is not queryable. Sources: ${GET_SOURCES.join(', ')}.`)
  }
  if (b.limit !== undefined && (!Number.isInteger(b.limit) || b.limit < 1 || b.limit > 100)) {
    push(out, 'bad-get-limit', `dataBindings.${k}.limit must be 1–100. limit="all" is capped at 100 (FR-H2) and trips gscan on 6.x.`)
  }
  if (b.filter !== undefined && !/^[A-Za-z0-9_.:,+\-[\]'"\s]+$/.test(b.filter)) {
    push(out, 'bad-get-filter', `dataBindings.${k}.filter carries a character NQL does not use. A filter is declared here and referenced by key from the markup, never written into an attribute — so it is validated once, never interpolated (AD-36).`)
  }
  if (b.order !== undefined && !/^[a-z_]+ (asc|desc)$/.test(b.order)) {
    push(out, 'bad-get-order', `dataBindings.${k}.order must be "<field> asc" or "<field> desc" — got ${JSON.stringify(b.order)}.`)
  }
  return out
}

export function validateDesignJson(design: DesignJson, markup?: string): Failure[] {
  const out: Failure[] = []
  const d = design as DesignJson & { quickControls?: unknown; id?: unknown }

  if (d.quickControls !== undefined) {
    push(out, 'quick-controls-authored', 'design.json carries quickControls[]. It is not authored: it is recovered mechanically as the first 3–5 entries of this design\'s own control list, in order (FR-G3), so the two can never drift. Remove it.')
  }
  if (d.id !== undefined) {
    push(out, 'id-authored', 'design.json carries an id. Identity is {categoryId}/{n}, taken from the directory path (AD-2) — an authored id is a second source that can disagree with it.')
  }
  if (d.tier !== 'free' && d.tier !== 'pro') {
    push(out, 'bad-tier', `tier must be "free" or "pro" — got ${JSON.stringify(d.tier)}`)
  }

  const contexts = Array.isArray(d.bindingContext) ? d.bindingContext : []
  if (!Array.isArray(d.bindingContext) || contexts.length === 0) {
    push(out, 'binding-context-missing', 'bindingContext is a SET, not a scalar — `sections-inventory.md` already declares them as sets ("bindingContext: tags (+ posts on the designs that show them)"), and FR-D12/D13 filter by intersection, which a set answers and a scalar cannot.')
  }
  if (new Set(contexts).size !== contexts.length) {
    push(out, 'duplicate-context', 'bindingContext lists a value twice — it is a set.')
  }
  for (const c of contexts as readonly string[]) {
    if (!(BINDING_CONTEXTS as readonly string[]).includes(c)) {
      const extra = c === 'page'
        ? ' There is deliberately no `page` value: a page and a post are the SAME resource, and what differs is the product, which compileTarget expresses (FR-G3).'
        : ''
      push(out, 'bad-binding-context', `bindingContext "${c}" is not one of the ten legal values: ${BINDING_CONTEXTS.join(' · ')}.${extra}`)
    }
  }

  const targets = Array.isArray(d.compileTarget) ? d.compileTarget : []
  if (targets.length === 0) {
    push(out, 'compile-target-missing', `compileTarget is a set and is required. \`any\` is withdrawn (R-7) — a design says where it may be placed, and the compiler refuses an illegal placement. Legal: ${COMPILE_TARGETS.join(' · ')} · custom-{name}.hbs.`)
  }
  if (new Set(targets).size !== targets.length) {
    push(out, 'duplicate-target', 'compileTarget lists a template twice — it is a set.')
  }
  for (const t of targets) {
    if (!isCompileTarget(t)) {
      push(out, 'bad-compile-target', `compileTarget "${t}" is not a template Inflozo emits. Legal: ${COMPILE_TARGETS.join(' · ')} · custom-{name}.hbs.`)
    }
  }

  // R-7 — compileTarget is a REFUSAL, not a hint. Both halves are decided at compile, never at run.
  if (markup !== undefined && /\bdata-pagination\b/.test(markup)) {
    const illegal = targets.filter((t) => !PAGINATED_TARGETS.has(t))
    if (illegal.length > 0) {
      push(out, 'pagination-target', `this design emits pagination and lists ${illegal.join(', ')} among its targets. {{pagination}} outside a paginated context is a FATAL render, not a warning (R-7). Paginated targets: ${[...PAGINATED_TARGETS].join(', ')}.`)
    }
  }
  const dataBindings = d.dataBindings ?? {}
  const keys = Object.keys(dataBindings)
  if (keys.length > 0) {
    const illegal = targets.filter((t) => GET_FORBIDDEN_TARGETS.has(t))
    if (illegal.length > 0) {
      push(out, 'get-target', `this design performs a {{#get}} and lists ${illegal.join(', ')} among its targets. An error page that queries the database compounds the outage it is reporting (R-7).`)
    }
  }
  for (const k of keys) out.push(...validateDataBinding(k, dataBindings[k]!))

  const schema: ControlDef[] = Array.isArray(d.controlSchema) ? d.controlSchema : []
  const seen = new Set<string>()
  for (const c of schema) {
    if (!CONTROL_NAME_RE.test(c.name)) {
      push(out, 'bad-control-name', `control "${c.name}" is not a kebab-case name — it writes data-${c.name} on the section root (AD-3).`)
    }
    if ((UNIVERSAL_CONTROLS as readonly string[]).includes(c.name)) {
      push(out, 'universal-control-redeclared', `control "${c.name}" is one of the three universal controls. They are declared once, never per design, and a design may narrow a universal's VALUES with a stated reason but may never rename, reinvent or redeclare one (R-23).`)
    }
    if (seen.has(c.name)) push(out, 'duplicate-control', `controlSchema declares "${c.name}" twice.`)
    seen.add(c.name)
    if (!Array.isArray(c.values) || c.values.length === 0) {
      push(out, 'control-open-valued', `control "${c.name}" declares no values. Every control is CLOSED-valued — no free text, no units, no hex outside the Style Pack — which is what makes the data-attribute selector viable at all (§7.3).`)
    } else if (!c.values.includes(c.default)) {
      push(out, 'control-default', `control "${c.name}" defaults to ${JSON.stringify(c.default)}, which is not among its values.`)
    }
    if (c.disabledBy !== undefined && (c.disabledBy.reason ?? '') === '') {
      push(out, 'dependency-without-reason', `control "${c.name}" is disabled by "${c.disabledBy.control}" with no reason. The reason is part of the schema (R-33) so the sidebar can print it in the helper-caption slot — greyed with the reason shown, never hidden.`)
    }
  }
  for (const c of schema) {
    if (c.disabledBy === undefined) continue
    if (c.disabledBy.control === c.name) {
      push(out, 'dependency-self', `control "${c.name}" is disabled by itself.`)
      continue
    }
    const other = schema.find((x) => x.name === c.disabledBy?.control)
    if (other === undefined) {
      push(out, 'dependency-unknown', `control "${c.name}" names "${c.disabledBy.control}" as the control that disables it, and this design declares no such control.`)
    } else if (Array.isArray(other.values) && !other.values.includes(c.disabledBy.whenValue)) {
      push(out, 'dependency-value', `control "${c.name}" is disabled when "${other.name}" is ${JSON.stringify(c.disabledBy.whenValue)}, which is not among ${other.name}'s values — the greyed-with-reason state could never fire.`)
    }
  }

  if (typeof d.previewSeed !== 'string' || d.previewSeed === '') {
    push(out, 'preview-seed-missing', 'previewSeed is required — the Section Picker renders every design from it.')
  }
  if (d.ghostCompat === undefined || typeof d.ghostCompat.minVersion !== 'string') {
    push(out, 'ghost-compat-missing', 'ghostCompat { minVersion, helpers[], deprecatedAt? } is required. It is authored WITH the design, never per Ghost release — which is what makes FR-C5\'s per-release verification a mechanical check rather than a standing editorial job.')
  } else {
    if (!/^\d+\.\d+\.\d+$/.test(d.ghostCompat.minVersion)) {
      push(out, 'bad-min-version', `ghostCompat.minVersion ${JSON.stringify(d.ghostCompat.minVersion)} is not a version (major.minor.patch) — FR-C5's watch compares it to a Ghost release.`)
    }
    if (!Array.isArray(d.ghostCompat.helpers) || !d.ghostCompat.helpers.every((h) => typeof h === 'string' && h !== '')) {
      push(out, 'ghost-compat-helpers', 'ghostCompat.helpers must be a list of helper names — the ones FR-C5 checks against each Ghost release.')
    }
  }
  // FR-G5: the tuple is the assertion's subject. Its five closed slots are checked by literal
  // match in `tools/tuple-check.py`; here every slot must at least be present and non-empty.
  const DESCRIPTOR_SLOTS = ['archetype', 'containment', 'ground', 'itemCount', 'mediaPlacement', 'emphasis'] as const
  const missingSlots = DESCRIPTOR_SLOTS.filter((k) => typeof d.descriptor?.[k] !== 'string' || d.descriptor[k] === '')
  if (missingSlots.length > 0) {
    push(out, 'descriptor-missing', `the structural descriptor tuple is required (FR-G5) and ${missingSlots.join(', ')} ${missingSlots.length === 1 ? 'is' : 'are'} missing — no two designs in a category may share one, and the assertion is over the tuple, never over the English line beside the design's name.`)
  }

  return out
}

// ─── content.json ────────────────────────────────────────────────────────────

export function validateCategoryContent(content: CategoryContent): Failure[] {
  const out: Failure[] = []
  if (!/^[a-z][a-z0-9]*$/.test(content.category ?? '')) {
    push(out, 'bad-category', `"${content.category}" is not a category id.`)
  }
  const props = content.props ?? {}
  for (const [path, prop] of Object.entries(props)) {
    for (const t of prop.tokens ?? []) {
      if (!(INLINE_TOKENS as readonly string[]).includes(t)) {
        push(out, 'bad-inline-token', `prop "${path}" declares the inline token {${t}}, which is not in the closed set (${INLINE_TOKENS.join(', ')}). A prop declares exactly which tokens it accepts and anything else in braces stays LITERAL TEXT — an allow-list by construction, never a general substitution pass (R-27).`)
      }
    }
    if (prop.tokens !== undefined && prop.type !== 'text' && prop.type !== 'richtext') {
      push(out, 'tokens-on-non-text', `prop "${path}" is ${prop.type} and declares inline tokens. Only text is substituted into (R-27).`)
    }
    if (prop.marks !== undefined && prop.type !== 'richtext') {
      push(out, 'marks-on-plain-prop', `prop "${path}" is ${prop.type} and declares marks. Only a richtext prop carries a mark allow-list (AD-4).`)
    }
    for (const m of prop.marks ?? []) {
      if (!(MARKS as readonly string[]).includes(m)) {
        push(out, 'bad-mark', `prop "${path}" allows the mark "${m}", which is not one of AD-4's four: ${MARKS.join(' · ')}.`)
      }
    }
    if (path.includes('[]')) {
      const parent = path.slice(0, path.indexOf('[]'))
      if (props[parent]?.type !== 'array') {
        push(out, 'orphan-item-prop', `prop "${path}" is an item of "${parent}", and "${parent}" is not declared as an array prop.`)
      }
    }
    if (prop.type === 'url' && typeof prop.default === 'string' && safeUrl(prop.default) !== prop.default) {
      push(out, 'unsafe-default-url', `prop "${path}" defaults to ${JSON.stringify(prop.default)}, which the scheme rule would reduce to # (AD-36 1). An authored default is not user input; write a real URL.`)
    }
  }
  return out
}

// ─── the whole design ────────────────────────────────────────────────────────

export function validateDesign(input: {
  html: string
  design: DesignJson
  content?: CategoryContent
}): Failure[] {
  const out = validateDesignJson(input.design, input.html)
  if (input.content !== undefined) out.push(...validateCategoryContent(input.content))
  const schema = Array.isArray(input.design.controlSchema) ? input.design.controlSchema : []
  const markupOpts: MarkupOptions = { controls: schema.map((c) => c.name) }
  if (input.content !== undefined) markupOpts.content = input.content
  if (Array.isArray(input.design.compileTarget)) markupOpts.compileTarget = input.design.compileTarget
  if (input.design.dataBindings !== undefined) markupOpts.dataBindings = input.design.dataBindings
  out.push(...validateMarkup(input.html, markupOpts))
  return out
}
