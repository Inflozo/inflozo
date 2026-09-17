// AD-4 — user text is text-plus-marks, and becomes markup at exactly ONE place. This file is that
// place, and AD-4 names it by path.
//
// The half of AD-4 that reads backwards, and is the half that matters: **both renderers call this
// serializer, but only the canvas puts its output into a DOM.** The theme renderer splices the
// returned fragment into the emitted STRING after `outerHTML` has run, because an HTML parser
// decodes `&#123;` back into a live `{` on a DOM round trip — executed in Round 2, where
// `&#123;&#123;<strong>title</strong>&#125;&#125;` set as `innerHTML` serialized back out as a live
// `{{`. Decoding is CORRECT on the canvas (the user must see their own literal text) and fatal in
// the theme. So: one serializer, one escaping rule, two correct outcomes.
//
// Everything here is an allow-list by construction (AD-36): the four marks are closed, the per-prop
// mark list narrows them further, the rel values are closed, the inline tokens are declared per prop
// and anything else in braces stays literal text (R-27).

import { INLINE_TOKENS, LINK_RELS, MARKS, PORTAL_ACTIONS, safeUrl } from '@inflozo/library'
import type { Link, PropDef } from '@inflozo/library'

/** One mark range over the prop's text. An `a` mark carries the same link record a `url` prop holds
 *  (`Link`, Story 4.5): `newTab`/`rel` are part of the STORED record, not editor state (R-27) — a link
 *  that opens in a new tab must compile that way from the same value. */
export type Mark = {
  start: number
  end: number
  mark: string
} & Link

/** FR-D4's storage shape: a plain string plus ordered ranges, never an HTML string.
 *  `plainText` is FR-Q3's lock — a prop bound to a Ghost Admin text setting. The lock is a
 *  TRUNCATION of the mark list, never a parse, so it is one flag on the value rather than a second
 *  code path. */
export type RichText = { text: string; marks?: readonly Mark[]; plainText?: boolean }

/** What a content prop may hold. A bare string is the ordinary case; the object form carries marks. */
export type PropValue = string | number | boolean | RichText | null | undefined

export const isRich = (v: unknown): v is RichText =>
  typeof v === 'object' && v !== null && typeof (v as RichText).text === 'string'

/** AD-5 rule 1: `&` first, then every brace the user typed becomes an HTML NUMERIC ENTITY.
 *  Handlebars never sees a mustache; the browser decodes the exact characters back.
 *
 *  C0 control characters are DROPPED rather than encoded. R1 decision 6 says the compiler's marker
 *  shape is one "escaped user text can never contain", and that is only true if the escaper actually
 *  removes it — a control character is not escapable HTML, so a paste carrying one would otherwise
 *  land in the emitted file looking like a marker. */
export function escapeUserText(s: string): string {
  return s
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}

const REL_SET: ReadonlySet<string> = new Set(LINK_RELS)
const TOKEN_SET: ReadonlySet<string> = new Set(INLINE_TOKENS)

/** THE one function that turns a link record into attributes (AD-4, FR-F6) — the `a` mark and a
 *  `url` prop's `data-prop-attr="href:…"` both come here, so the two sinks cannot drift. Every
 *  attribute is from a closed set (AD-36):
 *
 *    portal   one of the four PORTAL_ACTIONS  → `href="#" data-portal="…"`
 *    search   exactly `true`                  → `href="#" data-ghost-search`
 *    href     through `safeUrl`               → `href`, plus `target`/`rel` from the record
 *
 *  `href="#"` for Portal and search is right because both scripts `preventDefault()` on the click
 *  (portal@~2.51 and ~2.69, sodo-search@~1.8, read in source 2026-09-13 — MEASUREMENTS.md §29c). A
 *  record with no valid destination — an action outside the four, a `search` that is not `true`, an
 *  empty href — returns NOTHING, and the caller treats that as an unset link (FR-F8). `newTab` and
 *  `rel` act only on an href: they could never act on a Portal modal or the search popup (R-68).
 *  Values are returned RAW; each emitter escapes on its own side. A bare string is `{ href }`. */
export function linkAttributes(link: unknown): Record<string, string> {
  const record: Link = typeof link === 'string' ? { href: link } : typeof link === 'object' && link !== null ? (link as Link) : {}
  // a record round-tripped through JSON may carry `portal: null`: a key with nothing in it is no destination, not an unset link
  const own = (k: keyof Link) => record[k] !== undefined && record[k] !== null
  if (own('portal')) {
    return typeof record.portal === 'string' && Object.prototype.hasOwnProperty.call(PORTAL_ACTIONS, record.portal)
      ? { href: '#', 'data-portal': record.portal }
      : {}
  }
  if (own('search')) return record.search === true ? { href: '#', 'data-ghost-search': '' } : {}
  if (typeof record.href !== 'string' || record.href.trim() === '') return {}
  // AD-36 (1) reaches a user's own link too: on the canvas this href is a same-origin URL inside
  // the owner's authenticated session, so the scheme check is not a theme-only concern.
  const attrs: Record<string, string> = { href: safeUrl(record.href) }
  // a stored record is data from a database, not a type: a non-array `rel` is no rel, not a throw
  const rel = new Set((Array.isArray(record.rel) ? record.rel : []).filter((r) => REL_SET.has(r)))
  if (record.newTab === true) {
    attrs['target'] = '_blank'
    rel.add('noreferrer') // a `_blank` link hands the opener to the destination otherwise
  }
  if (rel.size > 0) attrs['rel'] = [...rel].sort().join(' ')
  return attrs
}

/** An `a` mark always has attributes here: one naming no destination was dropped before the sweep (DW-120). */
function openTag(m: Mark): string {
  if (m.mark !== 'a') return `<${m.mark}>`
  return `<a ${Object.entries(linkAttributes(m)).map(([k, v]) => (v === '' ? k : `${k}="${escapeUserText(v)}"`)).join(' ')}>`
}

/** AD-4's per-prop allow-list, in `MARKS`' fixed order (P0-1's): a `richtext` prop's own marks, nothing for any other
 *  type, and nothing for FR-Q3's `plainText` lock — which truncates the list rather than parsing anything. A field whose
 *  list is empty shows no toolbar and takes no mark key (Story 5.3, UX-DR19: absent, not greyed). */
export function allowedMarks(def: PropDef | undefined, value?: PropValue): string[] {
  if (isRich(value) && value.plainText === true) return []
  if (def?.type !== 'richtext') return []
  const declared = def.marks ?? []
  return MARKS.filter((m) => declared.includes(m))
}

/** R-27: a prop declares the inline tokens it accepts, and **anything else in braces stays literal
 *  text**. Free-form substitution is refused — an allow-list by construction is the only shape that
 *  closes AD-36 rather than filtering it. Substitution runs on the RAW run, before escaping, so a
 *  substituted value is escaped like any other user text and an unsubstituted `{n}` ships as
 *  `&#123;n&#125;` and decodes back to literal `{n}` on the canvas.
 *
 *  A token split across a mark boundary is not substituted, and that is deliberate: a token is an
 *  atom, and half of one is text the user typed. */
function substituteTokens(
  run: string,
  declared: readonly string[],
  values: Readonly<Record<string, string>>,
): string {
  if (declared.length === 0) return run
  return run.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (whole, key: string) => {
    if (!TOKEN_SET.has(key) || !declared.includes(key)) return whole
    const v = values[key]
    return v === undefined ? whole : v
  })
}

/** The single serialization point. Returns an ESCAPED HTML fragment — the canvas assigns it to
 *  `innerHTML` (and the parser decodes the braces back for the user to see); the theme splices it
 *  into the emitted string after `outerHTML`, where nothing decodes anything. */
export function serializeMarks(
  value: PropValue,
  def?: PropDef,
  tokenValues: Readonly<Record<string, string>> = {},
): string {
  const rich = isRich(value)
  const text = rich ? value.text : value == null ? '' : String(value)

  // The per-prop mark allow-list (AD-4): a prop that does not declare a mark does not get it, and a
  // prop that is not `richtext` gets none at all. FR-Q3's lock truncates the list to empty.
  const allow: ReadonlySet<string> = new Set(allowedMarks(def, value))

  const marks = (rich && Array.isArray(value.marks) ? value.marks : [])
    .filter(
      (m) =>
        typeof m === 'object' &&
        m !== null &&
        allow.has(m.mark) &&
        Number.isInteger(m.start) &&
        Number.isInteger(m.end) &&
        m.start >= 0 &&
        m.end > m.start &&
        m.end <= text.length &&
        // DW-120 (Story 5.3): a link naming no destination is no link — its words stay, with no anchor round them, as a
        // `url` prop's unset link hides its element rather than writing an empty one
        (m.mark !== 'a' || Object.keys(linkAttributes(m)).length > 0),
    )
    // outermost first at a shared start, so the open/close sweep below nests consistently
    .slice()
    .sort((a, b) => a.start - b.start || b.end - a.end || (a.mark < b.mark ? -1 : a.mark > b.mark ? 1 : 0))

  const declared = (def?.tokens ?? []).filter((t) => TOKEN_SET.has(t))
  // Story 5.3: a Text Area's line break is `\n` in the value and `<br>` in both emitters' markup — escaped first, so the
  // only tag a run can carry is this one
  const esc = (run: string) => escapeUserText(substituteTokens(run, declared, tokenValues)).replace(/\n/g, '<br>')

  if (marks.length === 0) return esc(text)

  // Boundary sweep: the only positions where the set of open marks can change are 0, the end, and
  // every mark edge. Between two boundaries the set is constant, so each segment is emitted once.
  const points = [...new Set([0, text.length, ...marks.flatMap((m) => [m.start, m.end])])].sort(
    (a, b) => a - b,
  )

  let out = ''
  let open: Mark[] = []
  for (let k = 0; k < points.length - 1; k++) {
    const a = points[k] as number
    const b = points[k + 1] as number
    const want = marks.filter((m) => m.start <= a && b <= m.end)
    // close from the top down to the longest common prefix, then open what is missing — overlapping
    // ranges therefore emit well-nested markup rather than crossed tags
    let keep = 0
    while (keep < open.length && keep < want.length && open[keep] === want[keep]) keep++
    for (let j = open.length - 1; j >= keep; j--) out += `</${(open[j] as Mark).mark}>`
    open = open.slice(0, keep)
    for (let j = keep; j < want.length; j++) {
      const m = want[j] as Mark
      out += openTag(m)
      open.push(m)
    }
    out += esc(text.slice(a, b))
  }
  for (let j = open.length - 1; j >= 0; j--) out += `</${(open[j] as Mark).mark}>`
  return out
}

/** A sidebar edit of text that carries marks (AD-4): the text becomes `next`, and the marks follow
 *  it rather than being dropped — a customer's bold must survive a typo fixed beside it. The edit is
 *  the one run between the longest common prefix and suffix; a mark after it shifts by the change in
 *  length, a mark it cuts keeps what survives on either side (and grows with text typed inside it),
 *  and a mark with nothing left is dropped. A plain string stays a plain string. */
export function editText(value: PropValue, next: string): PropValue {
  if (!isRich(value)) return next
  const old = value.text
  let p = 0
  while (p < old.length && p < next.length && old[p] === next[p]) p++
  let q = 0
  while (q < old.length - p && q < next.length - p && old[old.length - 1 - q] === next[next.length - 1 - q]) q++
  const oldEnd = old.length - q
  const delta = next.length - old.length
  const marks = (Array.isArray(value.marks) ? value.marks : []).flatMap((m) => {
    const start = m.start < p ? m.start : Math.max(m.start, oldEnd) + delta
    const end = m.end > oldEnd ? m.end + delta : Math.min(m.end, p)
    return end > start ? [{ ...m, start, end }] : []
  })
  return { ...value, text: next, marks }
}

// ─── Story 5.3 — the value's edits, beside the one serializer ───────────────────────────────────────────────────
//
// Typing never reads marks or links back from the page: the page cannot hold a whole link record (`linkAttributes`
// writes a Portal link as `href="#" data-portal`, never writes `ref`), so the element is read as WORDS, the one edit
// between the words before and after is applied to the stored value, and the element is rewritten from the serializer
// when the two differ. Only a paste, which brings no record, is read for its marks (`readMarks`). Everything below is
// pure over handed nodes (AD-1): the browser's elements and a jsdom tree both satisfy `MarkNode`.

/** The members of a DOM node the readers below walk. */
export type MarkNode = {
  readonly nodeType: number
  readonly nodeName: string
  readonly nodeValue: string | null
  readonly childNodes: ArrayLike<MarkNode>
  getAttribute?(name: string): string | null
}

const TEXT_NODE = 3
const ELEMENT_NODE = 1
const kids = (n: MarkNode): MarkNode[] => Array.from(n.childNodes)
/** a space the browser typed as U+00A0 is a space */
const words = (n: MarkNode): string => (n.nodeValue ?? '').replace(/ /g, ' ')

const textOf = (v: PropValue): string => (isRich(v) ? v.text : v == null ? '' : String(v))
const marksOf = (v: PropValue): readonly Mark[] => (isRich(v) && Array.isArray(v.marks) ? v.marks : [])
/** the value with new text and marks, in its own shape: a plain string stays one until it carries a mark */
const shaped = (value: PropValue, text: string, marks: Mark[]): PropValue =>
  isRich(value) ? { ...value, text, marks } : marks.length === 0 ? text : { text, marks }

/** Sorted, empty ranges dropped, and overlapping or touching ranges of one non-link mark merged. Links are records and
 *  are never merged here. */
function tidy(marks: readonly Mark[]): Mark[] {
  const out: Mark[] = []
  for (const m of [...marks].filter((m) => m.end > m.start).sort((a, b) => a.start - b.start || a.end - b.end)) {
    const into = m.mark === 'a' ? undefined : out.find((o) => o.mark === m.mark && o.start <= m.start && m.start <= o.end)
    if (into) into.end = Math.max(into.end, m.end)
    else out.push({ ...m })
  }
  return out
}

/** true when the ranges cover every position in [start, end) */
function covers(ranges: readonly Mark[], start: number, end: number): boolean {
  let at = start
  for (const r of [...ranges].sort((a, b) => a.start - b.start)) if (r.start <= at && r.end > at) at = r.end
  return at >= end
}

/** A link the range touches: overlapping it, or — for a collapsed range — strictly around it. */
const touches = (m: Mark, start: number, end: number): boolean =>
  m.mark === 'a' && (start === end ? m.start < start && start < m.end : m.start < end && m.end > start)

/** A link record without its range: the fields `Link` names, as stored. */
function recordOf(link: Link): Link {
  const out: Record<string, unknown> = {}
  for (const k of ['href', 'portal', 'search', 'ref', 'newTab', 'rel'] as const) if (link[k] !== undefined) out[k] = link[k]
  return out as Link
}

/** An element's words, as the value holds them: text, `<br>` as `\n`, U+00A0 as a space. A `<br>` with nothing but
 *  `<br>`s after it ends the words without adding one: an editing element ending in `\n` carries one extra `<br>` so its
 *  empty last line shows, and an element the browser emptied keeps a placeholder `<br>`. */
export function readText(root: MarkNode): string {
  let out = ''
  let trailingBr = false
  const walk = (n: MarkNode) => {
    for (const c of kids(n)) {
      if (c.nodeType === TEXT_NODE) {
        const w = words(c)
        out += w
        if (w !== '') trailingBr = false
      } else if (c.nodeType === ELEMENT_NODE) {
        if (c.nodeName === 'BR') {
          out += '\n'
          trailingBr = true
        } else walk(c)
      }
    }
  }
  walk(root)
  return trailingBr ? out.slice(0, -1) : out
}

/** A DOM point inside `root` as an offset into `readText(root)`; a point outside it reads as the end. */
export function textOffset(root: MarkNode, node: MarkNode, offset: number): number {
  let count = 0
  let found: number | null = null
  const visit = (n: MarkNode): boolean => {
    if (n.nodeType === TEXT_NODE) {
      if (n === node) {
        found = count + Math.min(offset, words(n).length)
        return true
      }
      count += words(n).length
      return false
    }
    if (n !== root && n.nodeName === 'BR') {
      count += 1
      return false
    }
    const list = kids(n)
    for (const [i, c] of list.entries()) {
      if (n === node && i === offset) {
        found = count
        return true
      }
      if (visit(c)) return true
    }
    if (n === node) {
      found = count
      return true
    }
    return false
  }
  visit(root)
  const max = readText(root).length
  return Math.min(found ?? max, max)
}

/** The DOM point for an offset into `readText(root)`: inside a text node where there is one, else before the `<br>` or
 *  at the end of `root`. */
export function domPoint(root: MarkNode, offset: number): { node: MarkNode; offset: number } {
  let count = 0
  let found: { node: MarkNode; offset: number } | null = null
  const visit = (n: MarkNode): boolean => {
    for (const [i, c] of kids(n).entries()) {
      if (c.nodeType === TEXT_NODE) {
        const length = words(c).length
        if (offset <= count + length) {
          found = { node: c, offset: offset - count }
          return true
        }
        count += length
      } else if (c.nodeName === 'BR') {
        if (offset <= count) {
          found = { node: n, offset: i }
          return true
        }
        count += 1
      } else if (c.nodeType === ELEMENT_NODE && visit(c)) return true
    }
    return false
  }
  visit(root)
  return found ?? { node: root, offset: kids(root).length }
}

/** The one edit that turns `before` into `after`, anchored at the caret (its offset in `after`): the text after the
 *  caret is the unchanged tail, so "aa" → "aaa" with the caret after the typed letter places it where it was typed, not
 *  at whichever end a longest-common-prefix would pick. */
export function diffText(before: string, after: string, caret: number): { start: number; end: number; insert: string } {
  let common = 0
  while (common < before.length && common < after.length && before[before.length - 1 - common] === after[after.length - 1 - common]) common++
  const tail = Math.max(0, Math.min(after.length - caret, common))
  let head = 0
  while (head < before.length - tail && head < after.length - tail && before[head] === after[head]) head++
  return { start: head, end: before.length - tail, insert: after.slice(head, after.length - tail) }
}

/** `value` with [start, end) replaced by `insert` — a string, or a paste's text and marks — and the marks around it
 *  shifted. A mark ending at `start` does not grow and one starting at `end` does not either, except by the `typed` rule:
 *  typed characters take the bold, italic and underline of the character before them, never its link. The insert is cut
 *  to `max` characters in all, and `refused` says how many were cut. */
export function replaceRange(
  value: PropValue,
  start: number,
  end: number,
  insert: string | RichText,
  o: { max?: number; typed?: boolean } = {},
): { value: PropValue; refused: number } {
  const text = textOf(value)
  const [a, b] = [Math.max(0, Math.min(start, text.length)), Math.max(0, Math.min(end, text.length))]
  const [from, to] = a <= b ? [a, b] : [b, a]
  const wanted = typeof insert === 'string' ? insert : insert.text
  const room = o.max === undefined ? wanted.length : Math.max(0, o.max - (text.length - (to - from)))
  const kept = wanted.slice(0, room)
  const n = kept.length
  const removed = to - from
  const startOf = (x: number) => (x < from ? x : Math.max(x, to) - removed + n)
  const endOf = (x: number) => (x <= from ? x : x >= to ? x - removed + n : from)
  const marks: Mark[] = marksOf(value).map((m) => {
    const moved = { ...m, start: startOf(m.start), end: endOf(m.end) }
    if (o.typed === true && n > 0 && m.mark !== 'a' && m.start < from && m.end >= from) moved.end = Math.max(moved.end, from + n)
    return moved
  })
  if (typeof insert !== 'string') {
    for (const m of marksOf(insert)) {
      const s = Math.min(m.start, n)
      const e = Math.min(m.end, n)
      if (e > s) marks.push({ ...m, start: from + s, end: from + e })
    }
  }
  return { value: shaped(value, text.slice(0, from) + kept + text.slice(to), tidy(marks)), refused: wanted.length - n }
}

/** A mark over [start, end): removed from the range when every character in it carries the mark, added over it
 *  otherwise — so a partly bold selection becomes wholly bold. A collapsed range changes nothing. */
export function toggleMark(value: PropValue, start: number, end: number, mark: string): PropValue {
  if (start >= end) return value
  const marks = marksOf(value)
  const next = covers(marks.filter((m) => m.mark === mark), start, end)
    ? marks.flatMap((m) => (m.mark !== mark || m.end <= start || m.start >= end ? [m] : [{ ...m, end: start }, { ...m, start: end }]))
    : [...marks, { start, end, mark }]
  return shaped(value, textOf(value), tidy(next))
}

/** One `a` mark carrying `link`, over the union of [start, end) and every link that range touches. */
export function setLink(value: PropValue, start: number, end: number, link: Link): PropValue {
  const marks = marksOf(value)
  const touched = marks.filter((m) => touches(m, start, end))
  if (start === end && touched.length === 0) return value
  const from = Math.min(start, ...touched.map((m) => m.start))
  const to = Math.max(end, ...touched.map((m) => m.end))
  return shaped(value, textOf(value), tidy([...marks.filter((m) => !touched.includes(m)), { ...recordOf(link), start: from, end: to, mark: 'a' }]))
}

/** Every link [start, end) touches, removed whole; the words stay. */
export function unlink(value: PropValue, start: number, end: number): PropValue {
  const marks = marksOf(value)
  return shaped(value, textOf(value), tidy(marks.filter((m) => !touches(m, start, end))))
}

/** What the toolbar shows pressed: the non-link marks every character in [start, end) carries, whether any link is
 *  touched, and the first touched link's record, which the link panel opens filled with. */
export function activeMarks(value: PropValue, start: number, end: number): { marks: string[]; linked: boolean; link: Link | null } {
  const marks = marksOf(value)
  const touched = marks.filter((m) => touches(m, start, end))
  return {
    marks: start >= end ? [] : MARKS.filter((k) => k !== 'a' && covers(marks.filter((m) => m.mark === k), start, end)),
    linked: touched.length > 0,
    link: touched[0] === undefined ? null : recordOf(touched[0]),
  }
}

const BLOCKS: ReadonlySet<string> = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'H1', 'H2', 'H3',
  'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'TR', 'UL',
])
/** what a page's clipboard carries that is not words a reader saw: its contents are not text either */
const UNSEEN: ReadonlySet<string> = new Set(['HEAD', 'LINK', 'META', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'TEMPLATE', 'TITLE'])
const TAG_MARKS: Readonly<Record<string, string>> = { B: 'strong', STRONG: 'strong', EM: 'em', I: 'em', U: 'u' }
const PASTE_SCHEMES = /^(https?|mailto|tel):/i

/** A PARSED PASTE as text plus marks — the only place marks are read from markup. Whitespace runs collapse to one
 *  space; `<br>` and a block's edges are `\n` when the field takes `lines`, else a space. `strong`/`b`, `em`/`i`, `u`
 *  and an `a` whose href is http, https, mailto or tel become marks, and only the `allowed` ones are kept; every other
 *  element is its text, and a script's or a style's contents are not text at all. The caller parses with `DOMParser`,
 *  whose document runs and loads nothing. */
export function readMarks(root: MarkNode, allowed: readonly string[], lines: boolean): RichText {
  const allow = new Set(allowed)
  let text = ''
  const marks: Mark[] = []
  let inLink = false
  const edge = () => {
    if (text === '' || /[\n ]$/.test(text)) {
      if (lines && text.endsWith(' ') && !text.endsWith('\n')) text += '\n'
      return
    }
    text += lines ? '\n' : ' '
  }
  const walk = (n: MarkNode) => {
    for (const c of kids(n)) {
      if (c.nodeType === TEXT_NODE) {
        const run = (c.nodeValue ?? '').replace(/\s+/g, ' ')
        text += text === '' || /[\n ]$/.test(text) ? run.replace(/^ /, '') : run
        continue
      }
      if (c.nodeType !== ELEMENT_NODE || UNSEEN.has(c.nodeName)) continue
      if (c.nodeName === 'BR') {
        if (lines) text += '\n'
        else if (text !== '' && !text.endsWith(' ')) text += ' '
        continue
      }
      const block = BLOCKS.has(c.nodeName)
      if (block) edge()
      const at = text.length
      const tag = TAG_MARKS[c.nodeName]
      const href = c.nodeName === 'A' ? (c.getAttribute?.('href') ?? '').trim() : ''
      const link = c.nodeName === 'A' && !inLink && allow.has('a') && PASTE_SCHEMES.test(href)
      if (link) inLink = true
      walk(c)
      if (link) {
        inLink = false
        marks.push({ start: at, end: text.length, mark: 'a', href })
      } else if (tag !== undefined && allow.has(tag)) marks.push({ start: at, end: text.length, mark: tag })
      if (block) edge()
    }
  }
  walk(root)
  const trimmed = text.replace(/[\n ]+$/, '')
  const clamped = marks.map((m) => ({ ...m, end: Math.min(m.end, trimmed.length) }))
  // adjacent pieces of one link (a page split across two anchors with the same href) are one link
  const links = clamped.filter((m) => m.mark === 'a' && m.end > m.start).sort((x, y) => x.start - y.start)
  const joined: Mark[] = []
  for (const l of links) {
    const last = joined[joined.length - 1]
    if (last !== undefined && last.href === l.href && last.end >= l.start) last.end = Math.max(last.end, l.end)
    else joined.push({ ...l })
  }
  const all = tidy([...clamped.filter((m) => m.mark !== 'a'), ...joined])
  return all.length === 0 ? { text: trimmed } : { text: trimmed, marks: all }
}
