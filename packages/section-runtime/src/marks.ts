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

import { INLINE_TOKENS, LINK_RELS, MARKS, safeUrl } from '@inflozo/library'
import type { PropDef } from '@inflozo/library'

/** One mark range over the prop's text. `newTab`/`rel` are part of the STORED record, not editor
 *  state (R-27) — a link that opens in a new tab must compile that way from the same value. */
export type Mark = {
  start: number
  end: number
  mark: string
  href?: string
  newTab?: boolean
  rel?: readonly string[]
}

/** FR-D4's storage shape: a plain string plus ordered ranges, never an HTML string.
 *  `plainText` is FR-Q3's lock — a prop bound to a Ghost Admin text setting. The lock is a
 *  TRUNCATION of the mark list, never a parse, so it is one flag on the value rather than a second
 *  code path. */
export type RichText = { text: string; marks?: readonly Mark[]; plainText?: boolean }

/** What a content prop may hold. A bare string is the ordinary case; the object form carries marks. */
export type PropValue = string | number | boolean | RichText | null | undefined

const isRich = (v: unknown): v is RichText =>
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

const MARK_SET: ReadonlySet<string> = new Set(MARKS)
const REL_SET: ReadonlySet<string> = new Set(LINK_RELS)
const TOKEN_SET: ReadonlySet<string> = new Set(INLINE_TOKENS)

function openTag(m: Mark): string {
  if (m.mark !== 'a') return `<${m.mark}>`
  // AD-36 (1) reaches a user's own link too: on the canvas this href is a same-origin URL inside
  // the owner's authenticated session, so the scheme check is not a theme-only concern.
  const attrs = [`href="${escapeUserText(safeUrl(m.href))}"`]
  const rel = new Set((m.rel ?? []).filter((r) => REL_SET.has(r)))
  if (m.newTab === true) {
    attrs.push('target="_blank"')
    rel.add('noreferrer') // a `_blank` link hands the opener to the destination otherwise
  }
  if (rel.size > 0) attrs.push(`rel="${[...rel].sort().join(' ')}"`)
  return `<a ${attrs.join(' ')}>`
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
  const allowed =
    rich && value.plainText === true ? [] : def?.type === 'richtext' ? (def.marks ?? []) : []
  const allow: ReadonlySet<string> = new Set(allowed.filter((m) => MARK_SET.has(m)))

  const marks = (rich ? (value.marks ?? []) : [])
    .filter(
      (m) =>
        allow.has(m.mark) &&
        Number.isInteger(m.start) &&
        Number.isInteger(m.end) &&
        m.start >= 0 &&
        m.end > m.start &&
        m.end <= text.length,
    )
    // outermost first at a shared start, so the open/close sweep below nests consistently
    .slice()
    .sort((a, b) => a.start - b.start || b.end - a.end || (a.mark < b.mark ? -1 : a.mark > b.mark ? 1 : 0))

  const declared = (def?.tokens ?? []).filter((t) => TOKEN_SET.has(t))
  const esc = (run: string) => escapeUserText(substituteTokens(run, declared, tokenValues))

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
