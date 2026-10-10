// FR-G7'S DEAD-CODE STRIP — Story 7.4. A design's sheet, cut to the rules its placed roots can reach.
//
// SOUND BY CONSTRUCTION: a selector is dropped only when its leading compound starts at the design's root and names, on
// that compound and outside any parentheses, a control attribute (`[data-n="v"]`, any flag, or `[data-n]`) that no
// placed root carries. The roots are `resolveControls`' output — exactly what `stampControls` writes, and nothing at
// runtime writes a `data-*` (`modules/core.js` toggles only `js-enabled`) — so a dropped selector can match no element
// of the shipped theme. Everything the strip cannot judge it keeps: an attribute inside `:not()`, `:is()`, `:where()` or
// `:has()`, any other operator, a name that is no control, a compound that starts elsewhere, every at-rule but `@media`.
// A sheet it cannot parse — a stray brace, a comment, a rule with no body — comes back unchanged. Pure (AD-1).
//
// Strings and unquoted `url()`s are read through the library's ONE scanner (`COMMENT_OR_STRING`, DW-337), so a brace or
// a comma inside one is never structure; attribute selectors through the validator's own reader (`attributeSelectors`).

import { attributeSelectors, COMMENT_OR_STRING } from '@inflozo/library'

/** One placed root's control attributes, by control name: `resolveControls(entry, instance.controls)`. */
export type RootAttributes = Readonly<Record<string, string>>
/** Story 7.10 — a root attribute that may hold ANY of its values on the live site: a promoted control, which Ghost's
 *  setting chooses (its `{{#match}}` reader). No control value can be it — `CONTROL_VALUE_RE` admits no `*` — so every
 *  rule naming that control is kept, as the stylesheet must keep them all (AD-3). */
export const ANY_VALUE = '*'


/** Thrown inside the walk when the sheet is not one the strip can judge; `stripCss` then returns it unchanged. */
class Unjudged extends Error {}

const SPACE = /\s/
/** A character that continues a CSS name (an escape included), so `.a17-1__grid` does not begin with `.a17-1`. */
const NAME_CHAR = /[\w\\-]|[^\x00-\x7f]/

/**
 * `css` with every rule no placed root can reach removed — a list keeps its live selectors, in their order, joined with
 * `, `, its body untouched; a rule with none goes, and an `@media` block left with no rule goes. `root` is the design's
 * root class (`rootClassOf`); `null`, and the sheet is returned as it is.
 */
export function stripCss(css: string, root: string | null, roots: readonly RootAttributes[]): string {
  if (root === null) return css
  let comment = false
  // the same length as `css`, so an offset in one is the offset in the other
  const masked = css.replace(COMMENT_OR_STRING, (m) => {
    if (m.startsWith('/*')) comment = true
    return '_'.repeat(m.length)
  })
  if (comment) return css
  const controls = new Set(roots.flatMap((r) => Object.keys(r)))

  /** The first index in [from, to) where `stop` holds outside () and [], escapes skipped; `to` when there is none. */
  const scan = (from: number, to: number, stop: (c: string) => boolean): number => {
    let depth = 0
    for (let i = from; i < to; i++) {
      const c = masked.charAt(i)
      if (c === '\\') { i++; continue }
      if (c === '(' || c === '[') depth++
      else if (c === ')' || c === ']') depth = Math.max(0, depth - 1)
      else if (depth === 0 && stop(c)) return i
    }
    return to
  }
  /** The `}` that closes the `{` at `open`. */
  const close = (open: number, to: number): number => {
    let depth = 0
    for (let i = open; i < to; i++) {
      const c = masked.charAt(i)
      if (c === '\\') { i++; continue }
      if (c === '{') depth++
      else if (c === '}' && --depth === 0) return i
    }
    throw new Unjudged()
  }

  /** Can a placed root match this selector, [from, to) trimmed? Only an attribute on its leading compound can say no. */
  const reachable = (from: number, to: number): boolean => {
    const end = scan(from, to, (c) => SPACE.test(c) || c === '>' || c === '+' || c === '~')
    const compound = css.slice(from, end)
    if (!compound.startsWith(`.${root}`) || NAME_CHAR.test(compound.charAt(root.length + 1))) return true
    const wants: { name: string; value?: string; fold: boolean }[] = []
    let depth = 0
    for (let i = from + root.length + 1; i < end; i++) {
      const c = masked.charAt(i)
      if (c === '\\') { i++; continue }
      if (c === '(') depth++
      else if (c === ')') depth = Math.max(0, depth - 1)
      else if (c === '[') {
        let shut = i + 1
        for (; shut < end && masked.charAt(shut) !== ']'; shut++) if (masked.charAt(shut) === '\\') shut++
        if (shut >= end) throw new Unjudged()
        // inside `:not()`, `:is()`, `:where()` or `:has()` an attribute proves nothing about the root
        if (depth === 0) {
          for (const a of attributeSelectors(css.slice(i, shut + 1))) {
            if (!controls.has(a.name)) continue
            if (a.op === undefined) wants.push({ name: a.name, fold: false })
            else if (a.op === '=' && a.value !== undefined) wants.push({ name: a.name, value: a.value, fold: a.flag === 'i' })
          }
        }
        i = shut
      }
    }
    if (wants.length === 0) return true
    const fold = (v: string, f: boolean) => (f ? v.toLowerCase() : v)
    return roots.some((r) => wants.every((w) => Object.hasOwn(r, w.name) && (w.value === undefined || r[w.name] === ANY_VALUE || fold(r[w.name] as string, w.fold) === fold(w.value, w.fold))))
  }

  /** A block's items, [from, to): each kept, cut or dropped with the whitespace before it. */
  const walk = (from: number, to: number): { text: string; kept: number; dropped: number } => {
    let text = ''
    let kept = 0
    let dropped = 0
    let lead: string | null = null   // the whitespace a dropped first item leaves to the next one kept
    const keep = (ws: string, body: string) => { text += (lead ?? ws) + body; lead = null; kept++ }
    const drop = (ws: string) => { if (kept === 0 && lead === null) lead = ws; dropped++ }
    let i = from
    while (i < to) {
      let j = i
      while (j < to && SPACE.test(masked.charAt(j))) j++
      const ws = css.slice(i, j)
      if (j >= to) { text += ws; break }
      const head = masked.charAt(j)
      if (head === '}' || head === ';' || head === '{') throw new Unjudged()
      const brace = scan(j, to, (c) => c === '{' || c === '}' || c === ';')
      if (head === '@') {
        if (brace >= to || masked.charAt(brace) === '}') throw new Unjudged()
        if (masked.charAt(brace) === ';') { keep(ws, css.slice(j, brace + 1)); i = brace + 1; continue }
        const shut = close(brace, to)
        if (!/^@media(?![\w-])/i.test(css.slice(j, brace))) { keep(ws, css.slice(j, shut + 1)); i = shut + 1; continue }
        const inner = walk(brace + 1, shut)
        if (inner.kept === 0 && inner.dropped > 0) drop(ws)
        else keep(ws, `${css.slice(j, brace + 1)}${inner.text}}`)
        i = shut + 1
        continue
      }
      if (brace >= to || masked.charAt(brace) !== '{') throw new Unjudged()
      const shut = close(brace, to)
      // the selector list, split on top-level commas, each trimmed
      const selectors: [number, number][] = []
      for (let s = j; s <= brace;) {
        const comma = scan(s, brace, (c) => c === ',')
        let a = s
        let b = comma
        while (a < b && SPACE.test(masked.charAt(a))) a++
        while (b > a && SPACE.test(masked.charAt(b - 1))) b--
        if (a === b) throw new Unjudged()   // an empty selector makes the whole list invalid: the browser drops the rule
        selectors.push([a, b])
        s = comma + 1
      }
      const live = selectors.filter(([a, b]) => reachable(a, b))
      if (live.length === 0) drop(ws)
      else if (live.length === selectors.length) keep(ws, css.slice(j, shut + 1))
      else keep(ws, `${live.map(([a, b]) => css.slice(a, b)).join(', ')}${/\s*$/.exec(css.slice(j, brace))?.[0] ?? ''}${css.slice(brace, shut + 1)}`)
      i = shut + 1
    }
    return { text, kept, dropped }
  }

  try {
    return walk(0, css.length).text
  } catch (e) {
    if (e instanceof Unjudged) return css
    throw e
  }
}
