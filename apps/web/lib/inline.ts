// THE ONE INLINE EDITING CONTROLLER (Story 5.3) — for a text prop's element on the canvas and for the panel's Text Area.
//
// The stored value is the only source of marks and link records (AD-4). The page cannot hold a whole link record —
// `linkAttributes` writes a Portal link as `href="#" data-portal` and never writes `ref` — so nothing here reads marks back
// from the element after a keystroke:
//   - typing is read from the element as WORDS (`readText`), and the one edit between the words before and after,
//     anchored at the caret (`diffText`), is applied to the stored value (`replaceRange`, typed);
//   - a paste is read for its marks (`readMarks`) from an inert `DOMParser` document, and spliced the same way;
//   - a mark or a link changes only through the toolbar or its keys (`toggleMark`, `setLink`, `unlink`);
//   - the element is rewritten from the serializer whenever its nodes differ from the serializer's for the value —
//     compared after `normalize()`, with U+00A0 equal to a space, so a typed trailing space (which the browser writes as
//     U+00A0) is stored as a space and left alone rather than rewritten into an invisible one under the caret.
// `execCommand` and every editor library are refused (§7.3); `beforeinput` refuses every `format*` type.
//
// ponytail: undo inside a field is the browser's own until Story 5.8's journal, and a mark with a collapsed caret does
// nothing — a pending mark for the next typed characters is the upgrade.

import type { Link, PropDef } from '@inflozo/library'
import {
  activeMarks, allowedMarks, diffText, domPoint, isRich, readMarks, readText, replaceRange, serializeMarks, setLink, textOffset, toggleMark, unlink,
} from '@inflozo/section-runtime'
import type { MarkNode, PropValue, RichText } from '@inflozo/section-runtime'

/** A non-empty selection inside the field: its rect in the field's own window, its offsets and what it carries. */
export type InlineSelection = { rect: DOMRect; start: number; end: number; marks: string[]; linked: boolean; link: Link | null }

export type InlineOptions = {
  def: PropDef
  /** the field's label, for the limit's sentence */
  label: string
  /** the stored value as editing starts */
  value: PropValue
  onValue: (next: PropValue) => void
  /** a character, or the rest of a paste, was refused at `maxChars` */
  onRefused: (sentence: string) => void
  onSelection: (selection: InlineSelection | null) => void
  /** ⌘K, when the field permits links and something is selected */
  onLinkKey: () => void
  /** ⌥F10, when the field permits a mark */
  onToolbarKey: () => void
  onEnd: () => void
  /** the panel's field: it stays editable when a session ends, and Esc hands focus back to the panel */
  keep?: boolean
}

export type Inline = {
  readonly el: HTMLElement
  /** the marks this field permits, in P0-1's order — empty, and there is no toolbar */
  readonly allowed: readonly string[]
  readonly ended: boolean
  toggle: (mark: string) => void
  /** a link record over the last selection, or null to remove every link it touches */
  link: (record: Link | null) => void
  /** plain text at the caret (a token chip) */
  insert: (text: string) => void
  /** focus back in the text with the selection the toolbar acted on */
  refocus: () => void
  /** the toolbar and the link panel hold focus: a focusout is not the end of editing */
  alive: (on: boolean) => void
  /** the field's element holds focus in a focused document */
  focused: () => boolean
  /** the selection reported again — after a scroll, with its new rect */
  report: () => void
  end: () => void
}

export const limitSentence = (label: string, max: number) => `${label} holds ${max} characters.`

const textOf = (v: PropValue) => (isRich(v) ? v.text : v == null ? '' : String(v))

/** The markup an editing element holds: the serializer's, plus one `<br>` when the words end in a line break, so the
 *  empty last line shows and takes the caret (`readText` ignores it). No token values, so `{members}` reads as typed. */
const markup = (value: PropValue, def: PropDef) => serializeMarks(value, def) + (textOf(value).endsWith('\n') ? '<br>' : '')

function signature(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.nodeValue ?? '').replace(/ /g, ' ')
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const el = node as Element
  const attrs = [...el.attributes].map((a) => `${a.name}=${a.value}`).sort().join(' ')
  return `<${el.nodeName} ${attrs}>${[...el.childNodes].map(signature).join('')}</>`
}

/** true when the element's nodes are the markup's, after `normalize()`, with U+00A0 equal to a space */
function holds(el: HTMLElement, html: string): boolean {
  const mine = el.cloneNode(true) as HTMLElement
  const theirs = el.ownerDocument.createElement('div')
  theirs.innerHTML = html
  mine.normalize()
  theirs.normalize()
  return [...mine.childNodes].map(signature).join('') === [...theirs.childNodes].map(signature).join('')
}

export function startInline(el: HTMLElement, o: InlineOptions): Inline {
  const doc = el.ownerDocument
  const win = doc.defaultView as Window & typeof globalThis
  const allowed = allowedMarks(o.def, o.value)
  const multiline = o.def.type === 'richtext'
  const max = o.def.maxChars
  const node = el as unknown as MarkNode
  // An empty value keeps the words it shows — a catalog string or the design's authored text — as its starting text, and
  // stays empty until an edit makes those words the customer's.
  let base: PropValue = textOf(o.value) === '' ? readText(node) : o.value
  let words = textOf(base)
  let edited = false
  let composing = false
  let alive = false
  let ended = false
  /** the last non-empty selection, which the toolbar acts on after focus has left the text */
  let last: [number, number] | null = null

  if (textOf(o.value) !== '' && !holds(el, markup(o.value, o.def))) el.innerHTML = markup(o.value, o.def)
  if (!el.isContentEditable) el.contentEditable = 'true'
  // The field being typed in says so with one keyed state mark, which `canvas-chrome.css` styles inside the canvas:
  // the browser's own focus ring is a heavy dark box around the whole block (owner's test, 2026-09-18).
  el.setAttribute('data-inflozo-editing', '')

  const offsets = (): [number, number] | null => {
    const sel = doc.getSelection()
    if (!sel || sel.rangeCount === 0) return null
    const r = sel.getRangeAt(0)
    if (!el.contains(r.startContainer) || !el.contains(r.endContainer)) return null
    return [textOffset(node, r.startContainer as unknown as MarkNode, r.startOffset), textOffset(node, r.endContainer as unknown as MarkNode, r.endOffset)]
  }
  const select = (start: number, end: number) => {
    const sel = doc.getSelection()
    if (!sel) return
    const a = domPoint(node, start)
    const b = domPoint(node, end)
    sel.setBaseAndExtent(a.node as unknown as Node, a.offset, b.node as unknown as Node, b.offset)
  }

  const report = () => {
    if (ended) return
    const at = offsets()
    const sel = doc.getSelection()
    if (!at || at[0] === at[1] || !sel || sel.rangeCount === 0) {
      // focus in the toolbar or the link panel moves the document's selection; the one they act on is kept
      if (alive) return
      last = null
      o.onSelection(null)
      return
    }
    last = at
    o.onSelection({ rect: sel.getRangeAt(0).getBoundingClientRect(), start: at[0], end: at[1], ...activeMarks(base, at[0], at[1]) })
  }

  /** the value becomes `next`, the element follows it when their nodes differ, and the caret or selection is put back */
  const commit = (next: PropValue, start: number, end = start) => {
    base = next
    words = textOf(next)
    edited = true
    const html = markup(next, o.def)
    if (!holds(el, html)) {
      el.innerHTML = html
      select(start, end)
    }
    o.onValue(next)
    report()
  }
  const refuse = () => {
    if (max !== undefined) o.onRefused(limitSentence(o.label, max))
  }

  const onInput = () => {
    if (ended || composing) return
    const now = readText(node)
    if (now === words) {
      // the same words in other nodes (a browser's own wrapper): the serializer's nodes come back, the value does not change
      const html = markup(base, o.def)
      const at = offsets()
      if (!holds(el, html)) {
        el.innerHTML = html
        if (at) select(at[0], at[1])
      }
      return
    }
    const caret = offsets()?.[1] ?? now.length
    const d = diffText(words, now, caret)
    const r = replaceRange(base, d.start, d.end, d.insert, { typed: true, max })
    const at = d.start + d.insert.length - r.refused
    commit(r.value, at)
    if (r.refused > 0) refuse()
  }

  const onBeforeInput = (e: InputEvent) => {
    if (ended) return
    const type = e.inputType
    if (type.startsWith('format') || type === 'insertFromDrop' || type === 'deleteByDrag') {
      e.preventDefault()
      return
    }
    if (type === 'insertParagraph' || type === 'insertLineBreak') {
      e.preventDefault()
      // a Text Field is one line; a Text Area stores `\n` and shows `<br>`
      if (!multiline) return
      const [start, end] = offsets() ?? [words.length, words.length]
      const r = replaceRange(base, start, end, '\n', { typed: true, max })
      if (r.refused > 0) return refuse()
      commit(r.value, start + 1)
      return
    }
    if (max !== undefined && (type === 'insertText' || type === 'insertReplacementText') && e.data) {
      const [start, end] = offsets() ?? [words.length, words.length]
      // no room at all: refused here, before the browser writes it. An insert that partly fits (an autocomplete, an IME
      // candidate) goes through and `onInput`'s `replaceRange` cuts it at the limit, as a paste is cut
      if (words.length - (end - start) >= max) {
        e.preventDefault()
        refuse()
      }
    }
  }

  const onPaste = (e: ClipboardEvent) => {
    e.preventDefault()
    if (ended || !e.clipboardData) return
    const html = e.clipboardData.getData('text/html')
    const plain = e.clipboardData.getData('text/plain')
    // DOMParser's document is inert: its scripts never run and its images never load
    const piece: RichText = html !== ''
      ? readMarks(new win.DOMParser().parseFromString(html, 'text/html').body as unknown as MarkNode, allowed, multiline)
      : { text: multiline ? plain.replace(/\r\n?/g, '\n') : plain.replace(/\s*[\r\n]+\s*/g, ' ') }
    if (piece.text === '') return
    const [start, end] = offsets() ?? [words.length, words.length]
    const r = replaceRange(base, start, end, piece, { typed: false, max })
    commit(r.value, start + piece.text.length - r.refused)
    if (r.refused > 0) refuse()
  }

  const mac = /Mac|iPhone|iPad/.test(win.navigator.platform)
  const KEYS: Readonly<Record<string, string>> = { b: 'strong', i: 'em', u: 'u', k: 'a' }
  const onKeyDown = (e: KeyboardEvent) => {
    if (ended) return
    const key = e.key.toLowerCase()
    // Shift off: Ctrl+Shift+I, +B and +K are the browser's own (devtools, bookmarks, the address bar)
    if ((mac ? e.metaKey : e.ctrlKey) && !e.altKey && !e.shiftKey && KEYS[key] !== undefined) {
      const mark = KEYS[key] as string
      // a field that does not permit the mark leaves the key to the browser — ⌘K to the address bar, Ctrl+U to the
      // source — and the browser's own ⌘B/⌘I/⌘U would be a `format*` input, which `beforeinput` refuses (review,
      // 2026-09-18: the spec's "do nothing in it" is not "swallow it")
      if (!allowed.includes(mark)) return
      // permitted: the browser's own bold would be that `format*` input, and ⌘K would leave the page
      e.preventDefault()
      const at = offsets()
      if (!at || at[0] === at[1]) return
      if (mark === 'a') {
        last = at
        o.onLinkKey()
      } else commit(toggleMark(base, at[0], at[1], mark), at[0], at[1])
      return
    }
    if (e.altKey && e.key === 'F10') {
      e.preventDefault()
      if (allowed.length > 0 && last) o.onToolbarKey()
      return
    }
    if (e.key === 'Escape') {
      // handled: the canvas's and the window's Esc listeners see `defaultPrevented` and leave the selection alone
      e.preventDefault()
      end()
      if (o.keep) el.blur()
    }
  }

  const onFocusOut = () => {
    if (ended || alive) return
    // a window that lost focus (another tab, another app) keeps the edit; focus that moved elsewhere in the editor ends it
    if (win.top?.document.hasFocus() === false) return
    end()
  }
  const onCompositionStart = () => {
    composing = true
  }
  const onCompositionEnd = () => {
    composing = false
    onInput()
  }
  const refuseDrop = (e: Event) => e.preventDefault()

  el.addEventListener('beforeinput', onBeforeInput)
  el.addEventListener('input', onInput)
  el.addEventListener('paste', onPaste)
  el.addEventListener('drop', refuseDrop)
  el.addEventListener('keydown', onKeyDown)
  el.addEventListener('focusout', onFocusOut)
  el.addEventListener('compositionstart', onCompositionStart)
  el.addEventListener('compositionend', onCompositionEnd)
  doc.addEventListener('selectionchange', report)

  function end() {
    if (ended) return
    ended = true
    el.removeEventListener('beforeinput', onBeforeInput)
    el.removeEventListener('input', onInput)
    el.removeEventListener('paste', onPaste)
    el.removeEventListener('drop', refuseDrop)
    el.removeEventListener('keydown', onKeyDown)
    el.removeEventListener('focusout', onFocusOut)
    el.removeEventListener('compositionstart', onCompositionStart)
    el.removeEventListener('compositionend', onCompositionEnd)
    doc.removeEventListener('selectionchange', report)
    if (!o.keep) el.removeAttribute('contenteditable')
    el.removeAttribute('data-inflozo-editing')
    // the serializer's markup again, without the editing element's extra <br>; untouched, the shown words stay
    if (edited) el.innerHTML = serializeMarks(base, o.def)
    o.onSelection(null)
    o.onEnd()
  }

  const onLast = (act: (start: number, end: number) => PropValue) => {
    const at = last ?? offsets()
    if (ended || !at || at[0] === at[1]) return
    commit(act(at[0], at[1]), at[0], at[1])
  }

  return {
    el,
    allowed,
    get ended() {
      return ended
    },
    toggle: (mark) => onLast((s, e) => toggleMark(base, s, e, mark)),
    link: (record) => onLast((s, e) => (record === null ? unlink(base, s, e) : setLink(base, s, e, record))),
    insert: (text) => {
      if (ended) return
      const [start, end] = offsets() ?? last ?? [words.length, words.length]
      const r = replaceRange(base, start, end, text, { typed: false, max })
      // a token chip is whole or nothing: `{mem` would print literally on the page (R-27) — refused, and said
      if (r.refused > 0) return refuse()
      commit(r.value, start + text.length)
    },
    refocus: () => {
      if (ended) return
      el.focus({ preventScroll: true })
      if (last) select(last[0], last[1])
    },
    alive: (on) => {
      alive = on
    },
    focused: () => doc.activeElement === el && doc.hasFocus(),
    report,
    end,
  }
}
