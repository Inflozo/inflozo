// THE THEME SERIALIZER — Story 7.1's formatting contract, written over the DOM (spec § The formatting contract).
//
// The shipped `.hbs` is meant to be edited by hand, so the theme emitter writes it to a stated contract instead of as
// `innerHTML`'s ragged text: two spaces per level, a start tag past the line budget one attribute per line, and a block
// helper on its own line with the markup it wraps one level in. It formats while every Handlebars expression is still
// an opaque C0 token and every block helper a comment marker, so no Handlebars is ever parsed or read back (FR-J1), and
// it writes every node through the DOM's own serializer: a start tag is the element's shallow `outerHTML`, a text run is
// what `innerHTML` writes for it, a raw-text element is its `outerHTML` whole.
//
// RENDER-NEUTRAL, which is the whole risk (`format.test.ts` holds it, with a negative control). Whitespace moves only
// where it already was: an element is laid out BLOCK — one child per line — only when the design's own whitespace fills
// every gap between its children; every other element is INLINE, written exactly as the serializer writes it, except
// that a whitespace run holding a line break becomes one line break and the indentation. Every design renders its text
// under `white-space: normal` or `nowrap`, where any such run is one space or nothing; the raw-text elements are written
// verbatim; and Ghost compiles every template and partial with `preventIndent: true` and drops a block helper, comment
// or partial alone on its line with that line (engine.js:16 on both majors; Handlebars 4.7.9's standalone rule).

import type { RuntimeDocument, RuntimeElement, Tokens, UserText } from './core.ts'

/** The line budget: a start tag whose line would pass it is written one attribute per line (JavaScript length). */
export const LINE_BUDGET = 120

/** A line break that must survive re-indentation byte for byte — inside a raw-text element or an attribute value. The
 *  formatter writes it as this C0 character and `Tokens.resolve` turns it back into a line break after every block has
 *  landed, so indenting a repeat's body never reaches into a `<pre>`. A design file can carry no C0 character
 *  (`validate.ts`'s `control-character`) and `escapeUserText` drops them, so nothing else can write one. */
export const KEEP_NL = String.fromCharCode(5)

/** Written verbatim: the contract's five, and the elements whose content the serializer writes raw or not at all
 *  (`<template>`'s content is not among its child nodes), where walking the children would not be the serializer. */
const VERBATIM = new Set(['pre', 'textarea', 'script', 'style', 'title', 'template', 'xmp', 'iframe', 'noembed', 'noframes', 'plaintext', 'noscript'])

/** HTML's whitespace — never `\s`, which also matches U+00A0, a character that renders. */
const ALL_WS = /^[ \t\n\f\r]*$/
const NL_RUN = /[ \t\n\f\r]*\n[ \t\n\f\r]*/g

const ind = (level: number): string => '  '.repeat(Math.max(0, level))

type Node = { readonly nodeType: number; readonly textContent: string | null }
type Ctx = { scratch: RuntimeElement; tokens: Tokens; users: UserText }

const isElement = (n: Node): n is Node & RuntimeElement => n.nodeType === 1
const isMarker = (n: Node, c: Ctx): boolean => n.nodeType === 8 && c.tokens.roleOf(n.textContent ?? '') !== null

/** A text node as the serializer writes it under an ordinary parent. */
function text(n: Node, c: Ctx): string {
  c.scratch.textContent = n.textContent ?? ''
  return c.scratch.innerHTML
}

/** The element's start and end tags, exactly as `outerHTML` writes them, and the start tag's attributes one by one —
 *  `null` attributes when the start tag cannot be re-spelled from its parts, in which case it is never broken. */
function tags(el: RuntimeElement): { start: string; end: string; name: string; attrs: string[] | null } {
  const shallow = el.cloneNode(false).outerHTML
  const end = /<\/[^<>"]*>$/.exec(shallow)?.[0] ?? ''
  const start = shallow.slice(0, shallow.length - end.length)
  const name = /^<[^\s>]+/.exec(start)?.[0] ?? ''
  const attrs = [...start.slice(name.length, -1).matchAll(/ ([^\s"'>/=]+(?:="[^"]*")?)/g)].map((m) => m[1] as string)
  return { start, end, name, attrs: `${name}${attrs.map((a) => ` ${a}`).join('')}>` === start ? attrs : null }
}

/** Rule 5: measured on the FINAL text — every expression token and user-text marker resolved — and broken one attribute
 *  per line, one level deeper than its line, with `>` closing the last attribute's line. A value is never split. */
function startTag(el: RuntimeElement, level: number, c: Ctx): string {
  const { start, name, attrs } = tags(el)
  const width = ind(level).length + c.users.substitute(c.tokens.resolve(start)).length
  return width > LINE_BUDGET && attrs !== null && attrs.length > 0
    ? `${name}${attrs.map((a) => `\n${ind(level + 1)}${keep(a)}`).join('')}>`
    : keep(start)
}

const keep = (s: string): string => s.split('\n').join(KEEP_NL)

/** Rule 3: block layout when the element has an element child, no child text but whitespace, and whitespace in every gap
 *  — after the start tag, between two children, before the end tag. A marker is not a child and never a gap. */
function isBlock(el: RuntimeElement, c: Ctx): boolean {
  const kids = [...el.childNodes].filter((n) => !isMarker(n, c))
  if (!kids.some(isElement)) return false
  let gap = false
  for (const n of kids) {
    if (n.nodeType === 3 && ALL_WS.test(n.textContent ?? '')) {
      if ((n.textContent ?? '') !== '') gap = true
      continue
    }
    if (!isElement(n) || !gap) return false
    gap = false
  }
  return gap
}

/** Inline content: the serializer's own text, with a whitespace run holding a line break written as one line break and
 *  the content's indentation (the closing tag's, when the run ends the element). Adjacent text nodes are one run — a
 *  repeat with nothing picked leaves two behind, and they must not become a blank line. */
function inline(el: RuntimeElement, level: number, c: Ctx): string {
  let out = ''
  let run = ''
  const flush = (last: boolean) => {
    out += run.replace(NL_RUN, (ws, at: number) => `\n${ind(last && at + ws.length === run.length ? level - 1 : level)}`)
    run = ''
  }
  for (const n of el.childNodes as Iterable<Node>) {
    if (n.nodeType === 3) {
      run += text(n, c)
      continue
    }
    flush(false)
    if (n.nodeType === 8) out += `<!--${n.textContent ?? ''}-->`
    else if (isElement(n)) {
      if (VERBATIM.has(n.tagName.toLowerCase())) out += keep(n.outerHTML)
      else {
        const t = tags(n)
        out += `${keep(t.start)}${t.end === '' ? '' : `${inline(n, level + 1, c)}${t.end}`}`
      }
    }
  }
  flush(true)
  return out
}

/** One element at `level` (its line's indentation is the caller's). */
function element(el: RuntimeElement, level: number, c: Ctx): string {
  if (VERBATIM.has(el.tagName.toLowerCase())) return keep(el.outerHTML)
  const open = startTag(el, level, c)
  const { end } = tags(el)
  if (end === '') return open
  if (!isBlock(el, c)) return `${open}${inline(el, level + 1, c)}${end}`
  return `${open}\n${block(el, level + 1, c).join('\n')}\n${ind(level)}${end}`
}

/** Block layout's lines: each child on its own line, a block helper's markup one level in, `{{else}}` and the close
 *  aligned with the open, a repeat's block where it stands. */
function block(parent: RuntimeElement, level: number, c: Ctx): string[] {
  const lines: string[] = []
  let at = level
  for (const n of parent.childNodes as Iterable<Node>) {
    if (n.nodeType === 3) {
      const t = n.textContent ?? ''
      // ponytail: only a section's top level reaches here with words (a design source with text beside its root); they
      // are written on a line of their own, as the serializer writes them
      if (!ALL_WS.test(t)) lines.push(`${ind(at)}${text(n, c).replace(/^[ \t\n\f\r]+|[ \t\n\f\r]+$/g, '').replace(NL_RUN, `\n${ind(at)}`)}`)
      continue
    }
    if (n.nodeType === 8) {
      const marker = `<!--${n.textContent ?? ''}-->`
      const role = c.tokens.roleOf(n.textContent ?? '')
      if (role === 'close' || role === 'else') at--
      if (at < level) throw new Error(`the theme serializer met a block helper's ${role ?? 'marker'} with no open beside it — every marker the walk parks is a sibling of the element it wraps`)
      lines.push(`${ind(at)}${marker}`)
      if (role === 'open' || role === 'else') at++
      continue
    }
    if (isElement(n)) lines.push(`${ind(at)}${element(n, at, c)}`)
  }
  if (at !== level) throw new Error('the theme serializer met a block helper that never closes among its siblings')
  return lines
}

/** A section's top level — always block layout — as the contract writes it, tokens still unresolved. `Tokens.resolve`
 *  then lands every expression, re-indenting a multi-line block by the line it lands on. */
export function formatTheme(doc: RuntimeDocument, root: RuntimeElement, tokens: Tokens, users: UserText): string {
  return block(root, 0, { scratch: doc.createElement('div'), tokens, users }).join('\n')
}

/** The same text with every line moved `by` levels in — a repeat's body, built already indented inside its block. */
export const indentBy = (text: string, by: number): string =>
  text.split('\n').map((line) => (line === '' ? line : `${ind(by)}${line}`)).join('\n')
