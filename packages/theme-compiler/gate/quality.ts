// THE EMITTED-THEME QUALITY GATE — Story 7.8 (FR-J17, AD-3, AD-34, NFR-5): what Ghost's own checker never looks at, over
// a compiled theme, in a customer's words (AD-24's envelope, beside `gscanGate`'s). gscan certifies that a theme is a
// Ghost theme; this certifies that it is a good one.
//
// CORE (AD-1): pure, synchronous, no builtin, no clock, no I/O — and it NEVER THROWS: anything it cannot read is one
// `quality_check_failed`, with no stack and no exception text.
//
// HOW IT READS A THEME (the spec's § How the gate reads a theme). Handlebars is never parsed, evaluated or printed (FR-J1):
// mustache delimiters are recognised exactly as `compile.ts`'s `startTags` parks them, and every page is assembled the
// way Ghost assembles it — the layout around `{{{body}}}`, each partial in place (quoted or bare, recursively), comments
// dropped (a section's boundary comment kept as its layer's name) — then parsed by parse5 8.0.1, the WHATWG parser jsdom
// itself uses. A mustache is found before anything else, so a quote inside one never ends an attribute:
//   - inside a start tag, a block keeps its FIRST branch (Casper's `<html … {{#match}} class="a"{{else}} class="b"{{/match}}>`
//     would otherwise be a false duplicate attribute); every other mustache reads as the value `x`;
//   - in content, `{{content}}` and `{{{html}}}` are THE EDGE and read as nothing (R-6) — the post body is never read;
//     `{{ghost_head}}`, `{{ghost_foot}}` and any triple-stash but `{{{body}}}` read as nothing (Ghost's markup, or raw
//     HTML); every other expression is the text `x`; blocks are markers — `{{#…}}`/`{{^…}}` open, `{{else …}}` splits,
//     `{{/…}}` closes.
// Heading order, names, image-only links and ids are judged on each ALTERNATIVE: a block with an `{{else}}` is two (an
// `{{else if}}` a third), a block without one is read as present (the designed state, every field filled), a repeat
// body once. Parse errors, `lang`, viewport and handlers are read once, every branch present.
//
// Ceilings (each `ponytail:` below names its own): a field Ghost leaves empty at render is not modelled — the render
// matrix's empty fixtures and Story 7.34 see rendered pages; a tag opened in one branch and closed in another reads as
// one flattened page (the compiler's blocks wrap whole elements); the full content model is a validator's job.

import { parse, parseFragment } from 'parse5'
import type { DefaultTreeAdapterTypes as P, ParserError } from 'parse5'
import { CONSUMED_DIRECTIVES, HBS_COMMENT, INLINE_STYLE_RE, PAYWALL_TARGET } from '@inflozo/library'
import { hardToRead, pairWords, T0, T1, U0, U1 } from '@inflozo/section-runtime'
import type { Pack, SynthesisLibrary } from '@inflozo/section-runtime'
import { requiredTemplates } from '../src/compile.ts'
import { OURS } from './verdict.ts'
import type { Finding, ThemeFiles } from './verdict.ts'

/** The quality verdict: AD-24's envelope per finding (`Finding`, as `gscanGate`'s), errors block, warnings deploy. */
export interface QualityVerdict { blocked: boolean; errors: Finding[]; warnings: Finding[] }

// ── THE ONE TABLE ────────────────────────────────────────────────────────────────────────────────────────────────────
// Every rule: its code, its level and the axe-core 4.12.1 rule it follows, each axe id cited at its line in
// `node_modules/.pnpm/axe-core@4.12.1/node_modules/axe-core/axe.js` (read in source at Story 7.8's Create). CI's axe
// agreement row runs exactly the `axe` ids below, and fails on an installed axe-core other than `AXE_CORE`, so a bump
// re-reads this table. Levels: Inflozo's own faults are errors and block; the three a customer's own choice can cause —
// `heading_skip`, `name_missing`, `image_link_unnamed` — are warnings (Question 2, ruled option 1, owner, 2026-10-09),
// and `contrast_low` is a warning (FR-E3, DW-315).
export const AXE_CORE = '4.12.1'
type Rule = { code: string; level: 'error' | 'warning'; axe?: string; follows: string }
export const QUALITY_RULES = {
  'html-parse': { code: 'markup_invalid', level: 'error', follows: 'WHATWG parsing (parse5 8.0.1): every parse error it reports, and an end tag no element takes' },
  'duplicate-id': { code: 'markup_invalid', level: 'error', follows: "HTML's own unique-id rule (axe-core 4.12.1 disables its duplicate-id)" },
  'nested-interactive': { code: 'markup_invalid', level: 'error', axe: 'nested-interactive', follows: 'axe.js:32813, and HTML: nothing interactive inside a link' },
  'one-main': { code: 'markup_invalid', level: 'error', follows: 'HTML: one visible <main>' },
  'html-has-lang': { code: 'language_missing', level: 'error', axe: 'html-has-lang', follows: 'axe.js:32423' },
  'meta-viewport': { code: 'viewport_missing', level: 'error', axe: 'meta-viewport', follows: 'axe.js:32797 (scale minimum 2, :25505), and presence' },
  'template-required': { code: 'template_missing', level: 'error', follows: 'requiredTemplates(library)' },
  'inline-handler': { code: 'inline_script', level: 'error', follows: 'FR-J17, D13' },
  'inline-style': { code: 'inline_style', level: 'error', follows: 'AD-3' },
  'build-leftover': { code: 'build_leftover', level: 'error', follows: 'AD-34' },
  'image-alt': { code: 'alt_missing', level: 'error', axe: 'image-alt', follows: 'axe.js:32474: an alt (empty counts), aria-label, aria-labelledby, title or a presentational role' },
  'heading-order': { code: 'heading_skip', level: 'warning', axe: 'heading-order', follows: 'axe.js:25175-25220, :33501: the first heading any level, then never more than one deeper' },
  'link-name': { code: 'name_missing', level: 'warning', axe: 'link-name', follows: 'axe.js:32701' },
  'button-name': { code: 'name_missing', level: 'warning', axe: 'button-name', follows: 'axe.js:32119' },
  'summary-name': { code: 'name_missing', level: 'warning', axe: 'summary-name', follows: 'axe.js:32988' },
  'label': { code: 'name_missing', level: 'warning', axe: 'label', follows: 'axe.js:32566, a placeholder included' },
  'select-name': { code: 'name_missing', level: 'warning', axe: 'select-name', follows: 'axe.js:32957' },
  'input-button-name': { code: 'name_missing', level: 'warning', axe: 'input-button-name', follows: 'axe.js:32502' },
  'image-link-alt': { code: 'image_link_unnamed', level: 'warning', follows: 'NFR-5: a picture-only link carries a never-empty alt' },
  'contrast-aa': { code: 'contrast_low', level: 'warning', follows: 'AA_PAIRS, FR-E3' },
} as const satisfies Record<string, Rule>
export type QualityRule = keyof typeof QUALITY_RULES

const FAILED: Finding = {
  code: 'quality_check_failed',
  message: 'We couldn\'t check your theme, so nothing was sent to your site.',
  action: 'Try again in a moment.',
  level: 'error', fatal: false, refs: [],
}

// ── reading: one file, masked ────────────────────────────────────────────────────────────────────────────────────────

/** A mustache — a triple-stash first, so `{{{body}}}` is one (compile.ts's `MUSTACHE` reads only the double form). */
const MUSTACHE = /\{\{~?\{[^]*?\}~?\}\}|\{\{[^]*?\}\}/g
/** A parked mustache's index, between two private-use characters no theme writes. */
const PARK = /\uE000(\d+)\uE001/g
/** An attribute value that held a mustache carries its raw text's index here, after its masked value. */
const RAW = /\uE002(\d+)\uE003/g
/** A partial invocation and `{{{body}}}`, spliced in at assembly. */
const SPLICE = /\uE005([^\uE006]*)\uE006|\uE007/g
/** The elements whose content the HTML tokenizer reads as text. `noscript` too: parse5, like a browser, parses with
 *  scripting on. */
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript', 'plaintext'])
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'param', 'keygen'])

type Kind = 'open' | 'else' | 'close' | 'partial' | 'body' | 'none' | 'expr'
/** What one mustache is (§ How the gate reads a theme, rule 4). */
function kindOf(m: string): { kind: Kind; name?: string } {
  if (/^\{\{~?\{/.test(m)) return { kind: /^\{\{~?\{\s*body\s*\}~?\}\}$/.test(m) ? 'body' : 'none' }
  const inner = m.slice(2, -2).replace(/^~|~$/g, '').trim()
  if (inner.startsWith('>')) {
    const p = /^>\s*(?:"([^"]+)"|'([^']+)'|([^\s"'()]+))/.exec(inner)
    return p === null ? { kind: 'none' } : { kind: 'partial', name: (p[1] ?? p[2] ?? p[3]) as string }
  }
  if (inner === '^') return { kind: 'else' }
  if (/^[#^]/.test(inner)) return { kind: 'open' }
  if (/^else\b/.test(inner)) return { kind: 'else' }
  if (inner.startsWith('/')) return { kind: 'close' }
  if (/^(?:content|ghost_head|ghost_foot)\b/.test(inner)) return { kind: 'none' }
  return { kind: 'expr' }
}

const newlines = (s: string): string => '\n'.repeat((s.match(/\n/g) ?? []).length)
/** A boundary comment, `{{!-- {Layer} · {Category} · {Design} --}}` (formatting contract rule 7): its layer's name. */
const BOUNDARY = /^\{\{~?!--\s*(.+) · [^·]+ · [^·]+?\s*--~?\}\}$/
const decodeNumeric = (s: string): string => s.replace(/&#(\d+);/g, (m, d: string) => (Number(d) <= 0x10ffff ? String.fromCodePoint(Number(d)) : m))

/** Shared across one read: the raw text behind each masked attribute value, each block's opening (or `{{else …}}`)
 *  mustache, each layer's name and each file. */
type Tables = { raws: string[]; blocks: string[]; layers: string[]; files: string[] }
type Masked = { text: string; layout: string | undefined }

/** One file's text as the HTML parser will read it (rules 1 and 4): comments dropped, boundary labels kept as
 *  `<!--L…-->`, block markers as `<!--B…-->`/`<!--E…-->`/`<!--C-->`, partials and `{{{body}}}` as splice tokens, every
 *  other mustache by its place. Every replacement keeps the newlines it replaced, so a parse error's line is the file's. */
function maskFile(source: string, t: Tables): Masked {
  let text = source.replace(/\r\n?/g, '\n')
  // Ghost's own test (express-hbs 2.5.0, `lib/hbs.js:13`, `declaredLayoutFile` :74): the first `{{!< name}}` ANYWHERE in
  // the template names its layout, and a layout may name its own — read in source at Story 7.8's Dev
  const layout = /\{\{!<\s+([A-Za-z0-9._\-/]+)\s*\}\}/.exec(text)?.[1]
  text = text.replace(HBS_COMMENT, (c) => {
    const label = BOUNDARY.exec(c)?.[1]
    return label === undefined ? newlines(c) : `<!--L${t.layers.push(decodeNumeric(label).trim()) - 1}-->${newlines(c)}`
  })
  const parked: string[] = []
  const p = text.replace(MUSTACHE, (m) => `\uE000${parked.push(m) - 1}\uE001`)
  const at = (i: number): { m: string; end: number } => {
    const end = p.indexOf('\uE001', i)
    return { m: parked[Number(p.slice(i + 1, end))] as string, end: end + 1 }
  }
  const unpark = (s: string): string => s.replace(PARK, (_, i: string) => parked[Number(i)] as string)
  const content = (m: string): string => {
    const k = kindOf(m)
    const nl = newlines(m)
    switch (k.kind) {
      case 'open': return `<!--B${t.blocks.push(m) - 1}-->${nl}`
      case 'else': return `<!--E${t.blocks.push(m) - 1}-->${nl}`
      case 'close': return `<!--C-->${nl}`
      case 'partial': return `\uE005${k.name as string}\uE006${nl}`
      case 'body': return `\uE007${nl}`
      case 'expr': return `x${nl}`
      default: return nl
    }
  }
  /** Inside raw text or an HTML comment: an expression is `x`, anything else nothing. */
  const flat = (m: string): string => (kindOf(m).kind === 'expr' || kindOf(m).kind === 'partial' ? 'x' : '') + newlines(m)

  let out = ''
  let i = 0
  let raw: string | null = null   // the raw-text element we are inside
  while (i < p.length) {
    const c = p[i] as string
    if (raw !== null) {
      if (c === '<' && p.slice(i + 2, i + 2 + raw.length).toLowerCase() === raw && p[i + 1] === '/') { raw = null; continue }
      if (c === '\uE000') { const { m, end } = at(i); out += flat(m); i = end; continue }
      out += c; i++; continue
    }
    if (c === '\uE000') { const { m, end } = at(i); out += content(m); i = end; continue }
    if (p.startsWith('<!--', i)) {
      const close = p.indexOf('-->', i + 4)
      const end = close === -1 ? p.length : close + 3
      out += p.slice(i, end).replace(PARK, (_, n: string) => flat(parked[Number(n)] as string))
      i = end; continue
    }
    if (c === '<' && /[A-Za-z]/.test(p[i + 1] ?? '')) {
      const tag = startTag(p, i, at, unpark, t)
      out += tag.html
      i = tag.end
      if (RAW_TEXT.has(tag.name) && !tag.selfClosing) raw = tag.name
      continue
    }
    if (c === '<' && (p[i + 1] === '/' || p[i + 1] === '!')) {
      // an end tag or a doctype: copied to its `>`, a mustache inside read as nothing
      const close = p.indexOf('>', i)
      const end = close === -1 ? p.length : close + 1
      out += p.slice(i, end).replace(PARK, (_, n: string) => newlines(parked[Number(n)] as string))
      i = end; continue
    }
    out += c; i++
  }
  return { text: out, layout }
}

/** One start tag from `<` at `i` (rule 4): a block keeps its first branch — in the tag and inside a value — and every
 *  other mustache reads as `x`. A value that held a mustache is followed by its raw text's index (`RAW`), so a rule that
 *  needs the value as written — an image's `alt`, a `style` — reads it. */
function startTag(p: string, i: number, at: (i: number) => { m: string; end: number }, unpark: (s: string) => string, t: Tables): { html: string; end: number; name: string; selfClosing: boolean } {
  const name = (/^<([A-Za-z][^\s/>\uE000]*)/.exec(p.slice(i, i + 200))?.[1] ?? '').toLowerCase()
  let j = i + 1 + name.length
  let html = p.slice(i, j)
  const frames: number[] = []                 // the in-tag blocks we are inside: each one's branch
  const keeping = (): boolean => frames.every((b) => b === 0)
  const step = (m: string, fs: number[]): 'kept' | 'skip' | 'expr' => {
    const k = kindOf(m).kind
    if (k === 'open') { fs.push(0); return 'skip' }
    if (k === 'else') { if (fs.length > 0) fs[fs.length - 1]++; return 'skip' }
    if (k === 'close') { fs.pop(); return 'skip' }
    return k === 'none' ? 'skip' : 'expr'
  }
  let last = ''                              // the last non-space character read outside a value
  while (j < p.length) {
    const c = p[j] as string
    if (c === '\uE000') {
      const { m, end } = at(j)
      const was = keeping()
      const s = step(m, frames)
      if (s === 'expr' && was) { html += 'x'; last = 'x' }
      html += newlines(m)
      j = end; continue
    }
    if (c === '>') return { html: `${html}>`, end: j + 1, name, selfClosing: last === '/' }
    if (last === '=' && !/\s/.test(c)) {
      // a value: quoted, or unquoted up to whitespace or `>`
      const quote = c === '"' || c === "'" ? c : null
      let k = quote === null ? j : j + 1
      let rawText = ''
      let masked = ''
      let held = false
      const vf: number[] = []
      while (k < p.length) {
        const d = p[k] as string
        if (quote !== null ? d === quote : /[\s>]/.test(d)) break
        if (d === '\uE000') {
          const { m, end } = at(k)
          held = true
          rawText += m
          const was = vf.every((b) => b === 0)
          if (step(m, vf) === 'expr' && was) masked += 'x'
          k = end; continue
        }
        rawText += d
        if (vf.every((b) => b === 0)) masked += d
        k++
      }
      const value = held ? `${masked}\uE002${t.raws.push(unpark(rawText)) - 1}\uE003${newlines(rawText)}` : rawText
      if (keeping()) html += quote === null ? value : `${quote}${value}${quote}`
      else html += newlines(rawText)
      j = quote === null ? k : k + 1
      last = quote ?? 'v'
      continue
    }
    if (keeping()) html += c
    else if (c === '\n') html += c
    if (!/\s/.test(c)) last = c
    j++
  }
  return { html, end: j, name, selfClosing: false }
}

// ── reading: one page, assembled ─────────────────────────────────────────────────────────────────────────────────────

type Segment = { at: number; file: string; line: number }
type Page = { file: string; text: string; fragment: boolean; segments: Segment[] }

const isText = (body: string | Uint8Array): body is string => typeof body === 'string'
/** A file the gate reads as text; a font's or a picture's bytes are skipped. */
const TEXTUAL = /\.(?:hbs|css|js|json|md|txt|yaml|yml|html)$/

/** Every page of `files`, assembled as Ghost assembles it (rules 2 and 3). */
function assemble(files: ThemeFiles, t: Tables): Page[] {
  for (const [path, body] of Object.entries(files)) if (TEXTUAL.test(path) && !isText(body)) throw new Error(`${path} is bytes`)
  const masked = new Map<string, Masked>()
  const maskOf = (path: string): Masked => {
    let m = masked.get(path)
    if (m === undefined) { m = maskFile(files[path] as string, t); masked.set(path, m) }
    return m
  }
  const hbs = Object.keys(files).filter((f) => f.endsWith('.hbs') && isText(files[f] as string | Uint8Array)).sort(byCode)
  const layouts = new Set(hbs.map((f) => maskOf(f).layout).filter((l): l is string => l !== undefined).map((l) => `${l}.hbs`))
  const roots = hbs.filter((f) => !f.startsWith('partials/') && f !== 'default.hbs' && !layouts.has(f))
  const pages = [...roots, ...(hbs.includes(PAYWALL_TARGET) ? [PAYWALL_TARGET] : [])]
  return pages.map((page) => {
    let out = ''
    const segments: Segment[] = []
    /** `file`, with `inner` — the layouts and the page it wraps, outermost first — at its `{{{body}}}`. */
    const emit = (file: string, inner: readonly string[], stack: readonly string[]): void => {
      const { text } = maskOf(file)
      let line = 1
      let from = 0
      segments.push({ at: out.length, file, line })
      for (const m of text.matchAll(SPLICE)) {
        const chunk = text.slice(from, m.index)
        out += chunk
        line += (chunk.match(/\n/g) ?? []).length
        from = (m.index as number) + m[0].length
        const target = m[1] === undefined ? inner[0] : `partials/${m[1]}.hbs`
        // ponytail: a missing partial reads as empty (gscan's GS005-TPL-ERR refuses it) and a cycle stops at its repeat
        if (target !== undefined && target in files && !stack.includes(target) && stack.length < 40) {
          out += `<!--P${t.files.push(target) - 1}-->`
          emit(target, m[1] === undefined ? inner.slice(1) : [], [...stack, target])
          out += '<!--Q-->'
        }
        segments.push({ at: out.length, file, line })
      }
      out += text.slice(from)
    }
    // the page, then each layout it names, in turn; a missing layout leaves the page read alone
    const chain = [page]
    for (let l = maskOf(page).layout; l !== undefined && `${l}.hbs` in files && !chain.includes(`${l}.hbs`) && chain.length < 10; l = maskOf(`${l}.hbs`).layout) chain.push(`${l}.hbs`)
    const outer = chain.reverse()
    emit(outer[0] as string, outer.slice(1), [outer[0] as string])
    return { file: page, text: out, fragment: page === PAYWALL_TARGET, segments }
  })
}

/** A position in a page as its source file and line. */
const sourceAt = (page: Page, offset: number): { file: string; line: number } => {
  let seg = page.segments[0] as Segment
  for (const s of page.segments) if (s.at <= offset) seg = s
  return { file: seg.file, line: seg.line + (page.text.slice(seg.at, offset).match(/\n/g) ?? []).length }
}

// ── reading: the parsed page, as events in document order ────────────────────────────────────────────────────────────

type El = P.Element
type Ev =
  | { t: 'open'; cond: string } | { t: 'else'; cond: string } | { t: 'close' }
  | { t: 'el'; el: El; file: string; layer: string | undefined; hidden: boolean; guards: ReadonlySet<string> }
  | { t: 'end'; el: El }
  | { t: 'text'; words: boolean; hidden: boolean }

const attr = (el: El, name: string): string | undefined => el.attrs.find((a) => a.name === name)?.value
/** A masked value as the page reads it: its raw-text index taken off. */
const shown = (v: string | undefined): string | undefined => v?.replace(RAW, '')
/** A value as the theme wrote it, mustaches and all. */
const written = (v: string | undefined, t: Tables): string | undefined => {
  if (v === undefined) return undefined
  const m = /\uE002(\d+)\uE003/.exec(v)
  return m === null ? v : t.raws[Number(m[1])]
}
const isHidden = (el: El): boolean => attr(el, 'aria-hidden') === 'true' || attr(el, 'hidden') !== undefined

/** The block helper's condition field, when it is a plain `{{#if field}}` / `{{#unless field}}` / `{{else if field}}`. */
const condition = (m: string): { helper: string; field: string } | undefined => {
  const r = /^\{\{~?(?:#|else\s+)(if|unless)\s+([@\w.]+)\s*~?\}\}$/.exec(m)
  return r === null ? undefined : { helper: r[1] as string, field: r[2] as string }
}

/** The page's events in document order: elements (with the file they are written in, their layer, whether a screen
 *  reader skips them and the fields their enclosing blocks guarantee), text, and block markers. */
function events(root: P.ParentNode, t: Tables, start: string): Ev[] {
  const out: Ev[] = []
  const files = [start]
  const layers: (string | undefined)[] = [undefined]
  let pending: string | undefined
  const blocks: { cond: string; branch: number; elseCond?: string }[] = []
  /** The fields the enclosing blocks guarantee: `{{#if f}}`'s first branch, `{{else if f}}`'s, `{{#unless f}}`'s else. */
  const guards = (): Set<string> => {
    const g = new Set<string>()
    for (const b of blocks) {
      const head = condition(b.cond)
      const elseIf = b.elseCond === undefined ? undefined : condition(b.elseCond)
      if (b.branch === 0 && head?.helper === 'if') g.add(head.field)
      else if (b.branch > 0 && elseIf?.helper === 'if') g.add(elseIf.field)
      else if (b.branch === 1 && elseIf === undefined && head?.helper === 'unless') g.add(head.field)
    }
    return g
  }
  const walk = (node: P.ParentNode, hidden: boolean): void => {
    for (const n of node.childNodes) {
      if (n.nodeName === '#comment') {
        const d = (n as P.CommentNode).data
        const m = /^([BELPQC])(\d*)$/.exec(d)
        if (m === null) continue
        const i = Number(m[2])
        if (m[1] === 'B') { blocks.push({ cond: t.blocks[i] as string, branch: 0 }); out.push({ t: 'open', cond: t.blocks[i] as string }) }
        else if (m[1] === 'E') { const b = blocks.at(-1); if (b !== undefined) { b.branch++; b.elseCond = t.blocks[i] as string } out.push({ t: 'else', cond: t.blocks[i] as string }) }
        else if (m[1] === 'C') { blocks.pop(); out.push({ t: 'close' }) }
        else if (m[1] === 'L') pending = t.layers[i]
        else if (m[1] === 'P') { files.push(t.files[i] as string); layers.push(pending ?? layers.at(-1)); pending = undefined }
        else if (m[1] === 'Q') { if (files.length > 1) { files.pop(); layers.pop() } }
        continue
      }
      if (n.nodeName === '#text') { out.push({ t: 'text', words: (n as P.TextNode).value.trim() !== '', hidden }); continue }
      if (!('tagName' in n)) continue
      const el = n as El
      const h = hidden || isHidden(el)
      out.push({ t: 'el', el, file: files.at(-1) as string, layer: layers.at(-1), hidden: h, guards: guards() })
      walk(el, h)
      // a template's content is its own fragment: walked for its markers, never judged (axe reads none of it)
      if (el.tagName === 'template') walk((el as P.Template).content, true)
      out.push({ t: 'end', el })
    }
  }
  walk(root, false)
  return out
}

// ── alternatives ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** A run of events as a tree: a block is its branches (one when it has no `{{else}}` — read as present). */
// ponytail: a block with no {{else}} is read PRESENT — the designed state, every field filled — so a field Ghost leaves
// empty at render is not modelled; the render matrix's empty fixtures and Story 7.34's canvas-vs-Ghost harness see rendered
// pages. And a tag opened in one branch and closed in another reads as one flattened page (the markers stay in document
// order around it); the compiler never writes one, because its blocks wrap whole elements.
type Item = Ev | { t: 'block'; branches: Item[][] }
function tree(evs: readonly Ev[]): Item[] {
  const root: Item[] = []
  const stack: { branches: Item[][] }[] = []
  const into = (): Item[] => (stack.length === 0 ? root : (stack.at(-1)?.branches.at(-1) as Item[]))
  for (const e of evs) {
    if (e.t === 'open') { const b = { t: 'block' as const, branches: [[]] as Item[][] }; into().push(b); stack.push(b) }
    else if (e.t === 'else') { if (stack.length > 0) stack.at(-1)?.branches.push([]) }
    else if (e.t === 'close') stack.pop()
    else into().push(e)
  }
  return root
}

/** Flow a set of states through items, each block's branches as alternatives — the heading order's and a name's one
 *  walk. `key` dedupes states, so a page of many blocks stays linear in its length. */
function flow<S>(items: readonly Item[], states: readonly S[], step: (s: S, e: Ev) => S, key: (s: S) => string, cap = Infinity): S[] {
  let now = [...states]
  for (const it of items) {
    if (it.t === 'block') {
      const next = new Map<string, S>()
      for (const b of it.branches) for (const s of flow(b, now, step, key, cap)) next.set(key(s), s)
      now = [...next.values()].slice(0, cap)
    } else now = [...new Map(now.map((s) => step(s, it)).map((s) => [key(s), s])).values()]
  }
  return now
}

/** The most times anything `count` names occurs on one alternative. */
function most(items: readonly Item[], count: (e: Ev) => string | undefined): Map<string, number> {
  const out = new Map<string, number>()
  for (const it of items) {
    const add = it.t === 'block'
      ? it.branches.map((b) => most(b, count)).reduce((a, b) => { for (const [k, v] of b) a.set(k, Math.max(a.get(k) ?? 0, v)); return a }, new Map<string, number>())
      : new Map(count(it) === undefined ? [] : [[count(it) as string, 1]])
    for (const [k, v] of add) out.set(k, (out.get(k) ?? 0) + v)
  }
  return out
}

// ── the rules ────────────────────────────────────────────────────────────────────────────────────────────────────────

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

type Raw = { rule: QualityRule; message: string; detail?: string; action?: string; refs: string[] }
const finding = (r: Raw): Finding => ({
  code: QUALITY_RULES[r.rule].code, message: r.message, ...(r.detail === undefined ? {} : { detail: r.detail }),
  ...(r.action === undefined ? {} : { action: r.action }), rule: r.rule, level: QUALITY_RULES[r.rule].level, fatal: false, refs: r.refs,
})

const INVALID = 'Part of your theme isn\'t valid HTML, so browsers would rebuild it differently from your design.'
const invalid = (rule: QualityRule, page: string, file: string, what: string): Raw => ({ rule, message: INVALID, detail: `${what}, in ${file}. ${OURS}`, refs: [page, file] })
/** Where a customer's own choice shows: a section's layer name, or the page itself when no section holds it. */
const inLayer = (layer: string | undefined): string => (layer === undefined ? 'on this page' : `in “${layer}”`)

/** A field Ghost always fills (§ Facts 4): a post's `title` ("(Untitled)", `models/post.js:764`), `@site.title`
 *  ("Ghost" by default), and a tag's or a staff user's `name`, which Ghost refuses blank (`schema.js:141`, :286, through
 *  `data/schema/validator.js:44-50`, called from `models/base/plugins/events.js:109` — read in Ghost 6.58.0's source at
 *  Story 7.8's Dev). */
// ponytail: a bare `name` is read as a tag's or an author's — the only contexts that carry one; no context is tracked, so
// a `{{name}}` in a post's own context (where Ghost prints nothing) would pass. No design writes one there.
const FILLED = new Set(['title', '@site.title', 'name', 'primary_author.name', 'primary_tag.name'])

/** Can an `alt` written as `raw` render empty, under the fields its enclosing blocks guarantee (§ How each rule decides)? */
function canBeEmpty(raw: string, guards: ReadonlySet<string>): boolean {
  const parts = raw.split(/(\{\{[^]*?\}\})/).filter((s) => s !== '')
  // a sequence is never empty when any of its parts is never empty
  const never = (ps: readonly string[], g: ReadonlySet<string>): boolean => {
    for (let i = 0; i < ps.length; i++) {
      const s = ps[i] as string
      if (!s.startsWith('{{')) { if (s.trim() !== '') return true; continue }
      const inner = s.slice(2, -2).replace(/^~|~$/g, '').trim()
      if (/^#(if|unless)\b/.test(inner)) {
        // the block's branches, to its matching close
        let depth = 0
        const branches: string[][] = [[]]
        const conds: (string | undefined)[] = [s]
        let j = i + 1
        for (; j < ps.length; j++) {
          const q = (ps[j] as string)
          const qi = q.startsWith('{{') ? q.slice(2, -2).replace(/^~|~$/g, '').trim() : ''
          if (/^#/.test(qi)) depth++
          if (/^\//.test(qi)) { if (depth === 0) break; depth-- }
          if (depth === 0 && (/^else\b/.test(qi) || qi === '^')) { branches.push([]); conds.push(q); continue }
          branches.at(-1)?.push(q)
        }
        i = j
        if (branches.length === 1) {
          const c = condition(s)
          if (c !== undefined && c.helper === 'if' && (g.has(c.field) || FILLED.has(c.field)) && never(branches[0] as string[], new Set([...g, c.field]))) return true
          continue
        }
        const ok = branches.every((b, n) => {
          const c = condition(conds[n] as string)
          const head = condition(s)
          const add = new Set(g)
          if (n === 0 && c?.helper === 'if') add.add(c.field)
          if (n > 0 && c?.helper === 'if') add.add(c.field)
          if (n === 1 && head?.helper === 'unless') add.add(head.field)
          return never(b, add)
        })
        if (ok) return true
        continue
      }
      if (/^[#^/]|^else\b/.test(inner)) continue
      // `{{t …}}` prints a label; a field Ghost fills or a guard guarantees prints words
      if (/^t\s/.test(inner)) return true
      const field = /^([@\w.]+)$/.exec(inner)?.[1]
      if (field !== undefined && (FILLED.has(field) || g.has(field))) return true
    }
    return false
  }
  return !never(parts, guards)
}

/** Words for a name: `x` (an expression) counts. */
const hasWords = (v: string | undefined): boolean => (shown(v) ?? '').trim() !== ''

/** What a screen reader can say for an element, by axe-core 4.12.1's sources for its rule. `byId` is the page's
 *  elements with words, for `aria-labelledby`. */
const named = (el: El, byId: ReadonlySet<string>): boolean =>
  hasWords(attr(el, 'aria-label')) || hasWords(attr(el, 'title')) ||
  (shown(attr(el, 'aria-labelledby')) ?? '').split(/\s+/).some((id) => id !== '' && byId.has(id))

/** The control a name rule judges, or undefined: [rule, its kind in words]. */
function control(el: El): [QualityRule, string] | undefined {
  const type = (attr(el, 'type') ?? '').toLowerCase()
  switch (el.tagName) {
    case 'a': return attr(el, 'href') === undefined ? undefined : ['link-name', 'link']
    case 'button': return ['button-name', 'button']
    case 'summary': return ['summary-name', 'button']
    case 'select': return ['select-name', 'field']
    case 'textarea': return ['label', 'field']
    case 'input':
      if (['button', 'submit', 'reset'].includes(type)) return ['input-button-name', 'button']
      return ['hidden', 'image'].includes(type) ? undefined : ['label', 'field']
    default: return undefined
  }
}

/** Every finding on one page. */
function judgePage(page: Page, t: Tables): Raw[] {
  const out: Raw[] = []
  const errors: ParserError[] = []
  const opts = { onParseError: (e: ParserError) => errors.push(e), sourceCodeLocationInfo: true }
  const root: P.ParentNode = page.fragment ? parseFragment(page.text, opts) : parse(page.text, opts)
  const start = page.segments[0]?.file ?? page.file
  const evs = events(root, t, start)
  const els = evs.filter((e): e is Extract<Ev, { t: 'el' }> => e.t === 'el')
  // the page's elements with words, for `aria-labelledby`; and the controls a <label> with words names (axe-core's
  // implicit-label and explicit-label)
  const byId = new Set(els.filter((e) => attr(e.el, 'id') !== undefined && textOf(e.el).trim() !== '').map((e) => shown(attr(e.el, 'id')) as string))
  const labelFor = new Set<string>()
  const inLabel = new Set<El>()
  for (const e of els) {
    if (e.el.tagName !== 'label' || textOf(e.el).trim() === '') continue
    const f = shown(attr(e.el, 'for'))
    if (f !== undefined && f !== '') labelFor.add(f)
    for (const d of below(e.el)) inLabel.add(d)
  }
  const labelled = (el: El): boolean => inLabel.has(el) || labelFor.has(shown(attr(el, 'id')) ?? '\u0000')

  // ── html-parse: every parse5 error, and every end tag no element took (a stray one) ──
  // ponytail: "valid HTML" is the parse, unique ids, nothing interactive in a link or button and one <main> (Readings 3);
  // the full content model (a <div> inside a <span>) is a validator's job, none is installed, and the browser renders it
  // the same. parse5 reports tokenizer errors alone, so an end tag the tree builder drops is found here from its own
  // source locations.
  for (const e of errors) {
    const at = sourceAt(page, e.startOffset)
    out.push(invalid('html-parse', page.file, at.file, `${e.code} at line ${at.line}`))
  }
  const taken = new Set<number>()
  const covered: [number, number][] = []
  const mark = (node: P.ParentNode): void => {
    for (const n of node.childNodes) {
      const loc = (n as { sourceCodeLocation?: P.Element['sourceCodeLocation'] }).sourceCodeLocation
      if (n.nodeName === '#comment' && loc) covered.push([loc.startOffset, loc.endOffset])
      if (!('tagName' in n)) continue
      const el = n as El
      if (el.sourceCodeLocation?.endTag) taken.add(el.sourceCodeLocation.endTag.startOffset)
      if (el.sourceCodeLocation?.startTag) covered.push([el.sourceCodeLocation.startTag.startOffset, el.sourceCodeLocation.startTag.endOffset])
      if (RAW_TEXT.has(el.tagName) && el.sourceCodeLocation) covered.push([el.sourceCodeLocation.startTag?.endOffset ?? 0, el.sourceCodeLocation.endTag?.startOffset ?? el.sourceCodeLocation.endOffset])
      mark(el)
      if (el.tagName === 'template') mark((el as P.Template).content)
    }
  }
  mark(root)
  for (const m of page.text.matchAll(/<\/([A-Za-z][^\s/>]*)[^>]*>/g)) {
    const o = m.index as number
    if (taken.has(o) || covered.some(([a, b]) => o >= a && o < b)) continue
    // `</html>`, `</head>` and `</body>` close elements the parser keeps open to the end of the page
    if (/^(html|head|body)$/i.test(m[1] as string)) continue
    const at = sourceAt(page, o)
    out.push(invalid('html-parse', page.file, at.file, `a stray </${(m[1] as string).toLowerCase()}> no element takes, at line ${at.line}`))
  }

  // ── once, every branch present: lang, viewport, handlers, inline styles, alt, nested controls ──
  if (!page.fragment) {
    const html = els.find((e) => e.el.tagName === 'html')
    const htmlFile = html === undefined ? start : html.file
    if (html === undefined || (!hasWords(attr(html.el, 'lang')) && !hasWords(attr(html.el, 'xml:lang')))) {
      out.push({ rule: 'html-has-lang', message: 'Your theme\'s pages don\'t say which language they\'re in, so screen readers may read them in the wrong voice.', detail: `${htmlFile}. ${OURS}`, refs: [page.file, htmlFile] })
    }
    const viewports = els.filter((e) => e.el.tagName === 'meta' && (attr(e.el, 'name') ?? '').toLowerCase() === 'viewport')
    const zoomStopped = (content: string): boolean => {
      // axe-core's own reading (axe.js:25505): `user-scalable=no`, a user-scalable between -1 and 1, or a
      // maximum-scale under 2 stops zoom
      const kv: Record<string, string> = {}
      for (const item of content.split(/[;,]/)) {
        const [k, v] = item.split('=').map((s) => s.trim().toLowerCase())
        if (k && v) kv[k] = k === 'maximum-scale' && v === 'yes' ? '1' : v
      }
      const us = kv['user-scalable']
      if (us === 'no') return true
      if (us !== undefined && !Number.isNaN(Number.parseFloat(us)) && Number.parseFloat(us) > -1 && Number.parseFloat(us) < 1) return true
      const max = kv['maximum-scale']
      return max !== undefined && Number.parseFloat(max) >= 0 && Number.parseFloat(max) < 2
    }
    if (viewports.length === 0) out.push({ rule: 'meta-viewport', message: 'Your theme\'s pages don\'t fit phone screens or let visitors zoom.', detail: `${htmlFile}: no viewport meta. ${OURS}`, refs: [page.file, htmlFile] })
    for (const v of viewports) {
      if (zoomStopped(shown(attr(v.el, 'content')) ?? '')) out.push({ rule: 'meta-viewport', message: 'Your theme\'s pages don\'t fit phone screens or let visitors zoom.', detail: `${v.file}: zoom stopped (${shown(attr(v.el, 'content'))}). ${OURS}`, refs: [page.file, v.file] })
    }
  }
  const INTERACTIVE = (el: El): boolean => (el.tagName === 'a' && attr(el, 'href') !== undefined) ||
    ['button', 'select', 'textarea', 'details', 'embed', 'iframe', 'label'].includes(el.tagName) ||
    (el.tagName === 'input' && (attr(el, 'type') ?? '').toLowerCase() !== 'hidden') ||
    (['audio', 'video'].includes(el.tagName) && attr(el, 'controls') !== undefined) || attr(el, 'tabindex') !== undefined
  const open: El[] = []
  for (const e of evs) {
    if (e.t === 'end') { if (open.at(-1) === e.el) open.pop(); continue }
    if (e.t !== 'el') continue
    const { el, file } = e
    for (const a of el.attrs) {
      if (/^on/i.test(a.name)) out.push({ rule: 'inline-handler', message: 'Part of your theme runs a script from an HTML attribute, which Inflozo themes never do.', detail: `${a.name} on <${el.tagName}>, in ${file}. ${OURS}`, refs: [page.file, file] })
    }
    const style = written(attr(el, 'style'), t)
    // AD-3: an inline style sets ONE custom property — a pack token as the design wrote it (`INLINE_STYLE_RE`), or one
    // value bound from Ghost, guarded (`style="{{#if f}}--p: {{f}}{{/if}}"`, the runtime's `data-bind-style`)
    if (style !== undefined && !INLINE_STYLE_RE.test(style) && !/^\s*(?:\{\{#if [^{}]+\}\})?\s*--[a-zA-Z0-9-]+\s*:\s*\{\{[^{}#/^>!][^{}]*\}\}\s*;?\s*(?:\{\{\/if\}\})?\s*$/.test(style)) {
      out.push({ rule: 'inline-style', message: 'Part of your theme styles an element inline, which Inflozo themes do only to pass one value from Ghost.', detail: `style="${style}" on <${el.tagName}>, in ${file}. ${OURS}`, refs: [page.file, file] })
    }
    if (el.tagName === 'img' && !e.hidden && attr(el, 'alt') === undefined && !named(el, byId) && !['presentation', 'none'].includes(attr(el, 'role') ?? '')) {
      out.push({ rule: 'image-alt', message: 'A picture in your theme has no description attribute at all.', detail: `<img> in ${file}. ${OURS}`, refs: [page.file, file] })
    }
    if (INTERACTIVE(el) && open.some((o) => o.tagName === 'button' || (o.tagName === 'a' && attr(o, 'href') !== undefined))) {
      out.push(invalid('nested-interactive', page.file, file, `<${el.tagName}> inside <${(open.find((o) => o.tagName === 'button' || o.tagName === 'a') as El).tagName}>`))
    }
    open.push(el)
  }

  // ── on each alternative: ids, <main>, heading order, names, picture-only links ──
  const items = tree(evs)
  const literalId = (e: Ev): string | undefined => {
    if (e.t !== 'el') return undefined
    const id = attr(e.el, 'id')
    return id === undefined || id.includes('\uE002') ? undefined : id
  }
  for (const [id, n] of most(items, literalId)) {
    if (n > 1) {
      const where = els.filter((e) => attr(e.el, 'id') === id).map((e) => e.file)
      out.push(invalid('duplicate-id', page.file, where[1] ?? start, `the id “${id}” on more than one element`))
    }
  }
  const mains = most(items, (e) => (e.t === 'el' && e.el.tagName === 'main' && attr(e.el, 'hidden') === undefined ? 'main' : undefined)).get('main') ?? 0
  if (mains > 1) out.push(invalid('one-main', page.file, els.filter((e) => e.el.tagName === 'main')[1]?.file ?? start, `${mains} <main> elements on one page`))

  // heading order (axe-core's heading-order): the state is the level before; 0 is "no heading yet"
  const levelOf = (e: Ev): number | undefined => {
    if (e.t !== 'el' || e.hidden) return undefined
    const role = attr(e.el, 'role')
    const h = /^h([1-6])$/.exec(e.el.tagName)
    if (role === 'heading') return Math.min(6, Math.max(1, Number.parseInt(shown(attr(e.el, 'aria-level')) ?? '2', 10) || 2))
    return h !== null && role === undefined ? Number(h[1]) : undefined
  }
  const skips = new Map<string, Raw>()
  flow<number>(items, [0], (prev, e) => {
    const level = levelOf(e)
    if (level === undefined || e.t !== 'el') return prev
    if (prev !== 0 && level - prev > 1) {
      const at = inLayer(e.layer)
      const move = e.layer === undefined ? '' : `, or move “${e.layer}” below a section whose heading is level ${level - 1}`
      const r: Raw = {
        rule: 'heading-order',
        message: `The headings skip a level ${at}: a level-${level} heading comes straight after a level-${prev} one.`,
        detail: 'Screen-reader users move through a page by its headings, one level at a time.',
        action: `If you emptied a title ${at}${e.layer === undefined ? '' : ' or the section above it'}, type it back${move}.`,
        refs: [page.file, e.file],
      }
      skips.set(`${r.message}|${e.file}`, r)
    }
    return level
  }, String)
  out.push(...skips.values())

  // names and picture-only links: each control's own content, flowed through its blocks
  evs.forEach((e, n) => {
    if (e.t !== 'el' || e.hidden) return
    const c = control(e.el)
    if (c === undefined) return
    const [rule, kind] = c
    const el = e.el
    if (named(el, byId)) return
    const presentational = ['presentation', 'none'].includes(attr(el, 'role') ?? '')
    if (rule === 'summary-name' && el.parentNode?.nodeName !== 'details') return
    if (rule === 'label' || rule === 'select-name') {
      if (!labelled(el) && !presentational && !(rule === 'label' && hasWords(attr(el, 'placeholder')))) out.push(nameless(e, page.file, rule, kind))
      return
    }
    if (rule === 'input-button-name') {
      // axe-core's non-empty-if-present: a submit or reset with no value attribute says its default label
      const value = attr(el, 'value')
      if (!hasWords(value) && !(value === undefined && (attr(el, 'type') ?? '').toLowerCase() !== 'button')) out.push(nameless(e, page.file, rule, kind))
      return
    }
    if (rule === 'button-name' && (labelled(el) || presentational)) return
    // the content's alternatives: its words, and the pictures it reads (one picture alone is a picture-only control)
    const close = evs.findIndex((x, k) => k > n && x.t === 'end' && x.el === el)
    const inner = evs.slice(n + 1, close === -1 ? evs.length : close)
    type S = { words: boolean; imgs: number; img?: Extract<Ev, { t: 'el' }>; alt: boolean }
    const ends = flow<S>(tree(inner), [{ words: false, imgs: 0, alt: false }], (s, x) => {
      if (x.t === 'text') return x.hidden || !x.words ? s : { ...s, words: true }
      if (x.t !== 'el' || x.hidden) return s
      if (x.el.tagName === 'img') return { ...s, imgs: s.imgs + 1, img: x, alt: s.alt || hasWords(attr(x.el, 'alt')) }
      if (x.el.tagName === 'svg' && hasWords(attr(x.el, 'aria-label'))) return { ...s, words: true }
      return s
    }, (s) => `${s.words}|${s.imgs}|${s.alt}|${s.img === undefined ? '' : inner.indexOf(s.img)}`)
    for (const s of ends) {
      if (s.words) continue
      const raw = s.img === undefined ? undefined : written(attr(s.img.el, 'alt'), t)
      if (rule === 'link-name' && s.imgs === 1 && s.img !== undefined) {
        // NFR-5: a picture-only link's alt must never render empty — a missing or can-be-empty one is the customer's
        // to fill (a missing alt is also `alt_missing`, Inflozo's own fault)
        if (raw === undefined || canBeEmpty(raw, s.img.guards)) {
          out.push({
            rule: 'image-link-alt',
            message: `A link ${inLayer(e.layer)} is only a picture, and the picture can be left with no description.`,
            detail: raw === undefined ? 'It has no description.' : raw.trim() === '' ? 'Its description is empty.' : `Its description is “${raw}”, which can be empty.`,
            action: 'Describe the picture in the section\'s settings.',
            refs: [page.file, s.img.file],
          })
        }
        continue
      }
      if (s.alt) continue
      out.push(nameless(e, page.file, rule, kind))
    }
  })
  return out
}

/** Every element below `el`. */
const below = (el: El): El[] => el.childNodes.filter((n): n is El => 'tagName' in n).flatMap((d) => [d, ...below(d)])

/** The text a screen reader would find in an element, masked (`x` for an expression). */
function textOf(el: El): string {
  let s = ''
  for (const n of el.childNodes) {
    if (n.nodeName === '#text') s += (n as P.TextNode).value
    else if ('tagName' in n && !isHidden(n as El)) s += (n as El).tagName === 'img' ? (shown(attr(n as El, 'alt')) ?? '') : textOf(n as El)
  }
  return s
}

const nameless = (e: Extract<Ev, { t: 'el' }>, page: string, rule: QualityRule, kind: string): Raw => ({
  rule,
  message: `A ${kind} ${inLayer(e.layer)} has no words a screen reader can say.`,
  action: 'Give it words in the section\'s settings.',
  refs: [page, e.file],
})

// ── AD-34's leak assertions: the one spelling ────────────────────────────────────────────────────────────────────────

/** Each leak in a theme's text files — `[file, what]` — in path order. `leftovers` says them as sentences, and the gate's
 *  `build_leftover` reads them: no consumed directive attribute on any start tag (a customer's typed `<` ships as `&lt;`,
 *  so words never form one), no expression token or user-text marker in any text file, and every partial referenced but
 *  the paywall, which Ghost's own `{{content}}` runs (Story 7.3). */
function leaks(files: ThemeFiles): [string, string][] {
  const out: [string, string][] = []
  const text = Object.entries(files).filter((e): e is [string, string] => isText(e[1])).sort(([a], [b]) => byCode(a, b))
  const consumed = new Set(CONSUMED_DIRECTIVES)
  const t: Tables = { raws: [], blocks: [], layers: [], files: [] }
  for (const [path, body] of text) {
    if (path.endsWith('.hbs')) {
      const names = [...maskFile(body, t).text.matchAll(/<[A-Za-z][^\s/>]*((?:[^>"']|"[^"]*"|'[^']*')*)>/g)]
        .flatMap((m) => [...(m[1] as string).matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g)].map((a) => (a[1] as string).toLowerCase()))
      const found = [...new Set(names.filter((n) => consumed.has(n)))].sort(byCode)
      for (const n of found) out.push([path, `a directive attribute (${n})`])
    }
    if (body.includes(T0) || body.includes(T1)) out.push([path, 'an expression token'])
    if (body.includes(U0) || body.includes(U1)) out.push([path, 'a user-text marker'])
  }
  const templates = text.filter(([p]) => p.endsWith('.hbs'))
  for (const [path] of templates.filter(([p]) => p.startsWith('partials/') && p !== PAYWALL_TARGET)) {
    const name = path.slice('partials/'.length, -'.hbs'.length)
    const quoted = new RegExp(`\\{\\{~?>\\s*(?:"${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"|'${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}'|${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(?=[\\s}~]))`)
    if (!templates.some(([p, b]) => p !== path && quoted.test(b.replace(HBS_COMMENT, '')))) out.push([path, 'a partial no template uses'])
  }
  return out.sort(([a, x], [b, y]) => byCode(a, b) || byCode(x, y))
}

/** AD-34's leak sentences (`[]` when the theme carries none): the ONE spelling, which `tools/pilot-theme.mjs`'s
 *  `themeFailures`, `tools/stress/build.js` and the gate all read. */
export const leftovers = (files: ThemeFiles): string[] => leaks(files).map(([path, what]) => `${path}: ${what}`)

// ── the gate ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/** Each page a theme serves, assembled and masked exactly as the gate reads it — what CI's axe agreement row runs axe on —
 *  with the heading-level sequences of its alternatives (`h1 h2 h3`), for the T1 recorder's comparison with Ghost's own
 *  render. Throws on a theme it cannot read (the gate maps that to `quality_check_failed`). */
export function readPages(files: ThemeFiles): { file: string; text: string; headings: string[] }[] {
  const t: Tables = { raws: [], blocks: [], layers: [], files: [] }
  return assemble(files, t).map((page) => {
    const root = page.fragment ? parseFragment(page.text) : parse(page.text)
    const evs = events(root, t, page.segments[0]?.file ?? page.file)
    // ponytail: alternatives' sequences are capped at 256, which no compiled page approaches; past it, the T1 row says so
    const seqs = flow<string>(tree(evs), [''], (s, e) => (e.t === 'el' && !e.hidden && /^h[1-6]$/.test(e.el.tagName) ? `${s} ${e.el.tagName}`.trim() : s), String, 256)
    return { file: page.file, text: page.text.replace(RAW, '').replace(/<!--[BELPQC]\d*-->/g, ''), headings: [...new Set(seqs)].sort(byCode) }
  })
}

const order = (a: Finding, b: Finding): number =>
  byCode(a.rule ?? '', b.rule ?? '') || byCode(a.refs[0] ?? '', b.refs[0] ?? '') || byCode(a.message, b.message) || byCode(a.detail ?? '', b.detail ?? '')

/** FR-J17's gate over a compiled theme: `pack` is the pack it was compiled with, `library` the library its required set
 *  derives from (`requiredTemplates`). Never throws. */
export function qualityGate(files: ThemeFiles, input: { pack: Pack; library: SynthesisLibrary }): QualityVerdict {
  try {
    const t: Tables = { raws: [], blocks: [], layers: [], files: [] }
    const raws: Raw[] = []
    for (const page of assemble(files, t)) raws.push(...judgePage(page, t))
    for (const file of requiredTemplates(input.library)) {
      if (!(file in files)) raws.push({ rule: 'template-required', message: `Your theme is missing ${file}, which every theme Inflozo builds carries.`, detail: OURS, refs: [file] })
    }
    for (const [file, what] of leaks(files)) raws.push({ rule: 'build-leftover', message: 'Pieces of Inflozo\'s own build were left in your theme\'s files.', detail: `${what}, in ${file}. ${OURS}`, refs: [file] })
    // contrast: always a warning — CI holds every preset, so at a deploy only a customer's own colour can fail (FR-E3)
    for (const p of hardToRead(input.pack)) {
      raws.push({ rule: 'contrast-aa', message: `Hard to read: ${pairWords(p)}. Small text needs 4.5:1 — it still ships.`, action: 'Change one of the two colours in the Style Pack.', refs: ['assets/css/screen.css'] })
    }
    // one finding per defect: a shared file's fault is said once, on the first page that shows it
    const seen = new Map<string, Finding>()
    for (const f of raws.map(finding).sort(order)) {
      const key = `${f.rule}|${f.message}|${f.detail ?? ''}|${f.refs[1] ?? f.refs[0] ?? ''}`
      if (!seen.has(key)) seen.set(key, f)
    }
    const all = [...seen.values()]
    const errors = all.filter((f) => f.level === 'error')
    return { blocked: errors.length > 0, errors, warnings: all.filter((f) => f.level === 'warning') }
  } catch {
    return { blocked: true, errors: [{ ...FAILED }], warnings: [] }
  }
}
