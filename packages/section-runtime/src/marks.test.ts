// Story 5.3 — the value's edits. Typing is read from the page as WORDS and applied to the stored value, so marks and
// link records come from the value and never from markup the page cannot hold whole (`linkAttributes` writes no `ref`).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import type { PropDef } from '@inflozo/library'
import {
  activeMarks,
  allowedMarks,
  diffText,
  domPoint,
  readMarks,
  readText,
  replaceRange,
  setLink,
  textOffset,
  toggleMark,
  unlink,
} from './marks.ts'
import type { Mark, MarkNode, PropValue, RichText } from './marks.ts'
import { renderCanvas, renderTheme } from './index.ts'

const doc = () => new JSDOM('<body></body>').window.document
const el = (html: string) => {
  const d = doc().createElement('div')
  d.innerHTML = html
  return d
}
const rich = (v: PropValue) => v as RichText
const richtext = (marks: string[]): PropDef => ({ type: 'richtext', label: 'Body', marks })

test('allowedMarks: a richtext prop its own marks in P0-1\'s order; a text prop, no def and a plainText value none', () => {
  assert.deepEqual(allowedMarks(richtext(['a', 'u', 'strong'])), ['strong', 'u', 'a'])
  assert.deepEqual(allowedMarks(richtext(['a'])), ['a'])
  assert.deepEqual(allowedMarks(richtext([])), [])
  assert.deepEqual(allowedMarks({ type: 'text', label: 'Headline' }), [])
  assert.deepEqual(allowedMarks(undefined), [])
  assert.deepEqual(allowedMarks(richtext(['strong']), { text: 'x', plainText: true }), [])
})

test('the serializer writes \\n as <br> and drops an a mark naming no destination, keeping its words — on both emitters', () => {
  const schema = { body: richtext(['a', 'strong']) }
  const content = { body: { text: 'one\ntwo nowhere', marks: [{ start: 8, end: 15, mark: 'a', portal: 'upgrade' }, { start: 0, end: 3, mark: 'strong' }] } }
  const canvas = renderCanvas(doc(), '<p data-prop="body">x</p>', { content, schema })
  const theme = renderTheme(doc(), '<p data-prop="body">x</p>', { content, schema }).template
  for (const out of [canvas, theme]) {
    assert.ok(out.includes('<strong>one</strong><br>two nowhere'), out)
    assert.doesNotMatch(out, /<a/, `DW-120: an anchor with no destination was written: ${out}`)
  }
  // the legitimate case: a link that names one still is one
  const linked = renderCanvas(doc(), '<p data-prop="body">x</p>', { schema, content: { body: { text: 'go', marks: [{ start: 0, end: 2, mark: 'a', href: 'https://ok.example/' }] } } })
  assert.ok(linked.includes('<a href="https://ok.example/">go</a>'), linked)
})

test('readText: text, <br> as \\n, U+00A0 as a space, and one trailing <br> is the editing element\'s own', () => {
  assert.equal(readText(el('a<strong>b c</strong>')), 'ab c')
  assert.equal(readText(el('one<br>two')), 'one\ntwo')
  assert.equal(readText(el('one<br><br>')), 'one\n', 'a value ending in \\n carries one extra <br> while edited')
  assert.equal(readText(el('<br>')), '', 'the browser\'s placeholder in an emptied field')
  assert.equal(readText(el('')), '')
})

test('textOffset and domPoint count as readText counts, and are each other\'s inverse', () => {
  const root = el('ab<strong>cd</strong><br>ef<br><br>')
  const text = readText(root)
  assert.equal(text, 'abcd\nef\n')
  for (let n = 0; n <= text.length; n++) {
    const p = domPoint(root as unknown as MarkNode, n)
    assert.equal(textOffset(root as unknown as MarkNode, p.node, p.offset), n, `offset ${n}`)
  }
  const strong = root.querySelector('strong') as unknown as MarkNode
  assert.equal(textOffset(root as unknown as MarkNode, strong, 1), 4, 'an element point counts every child before it')
  assert.equal(domPoint(el('') as unknown as MarkNode, 0).offset, 0)
})

test('diffText places a repeated letter where it was typed, and reads deletions and replacements', () => {
  assert.deepEqual(diffText('aa', 'aaa', 2), { start: 1, end: 1, insert: 'a' }, 'typed after the first letter')
  assert.deepEqual(diffText('aa', 'aaa', 3), { start: 2, end: 2, insert: 'a' }, 'typed at the end')
  assert.deepEqual(diffText('abc', 'ac', 1), { start: 1, end: 2, insert: '' })
  assert.deepEqual(diffText('hello', 'hXo', 2), { start: 1, end: 4, insert: 'X' })
  assert.deepEqual(diffText('same', 'same', 2), { start: 2, end: 2, insert: '' })
})

test('replaceRange: a typed character after a bold word is bold, after a link is not, and before either is neither', () => {
  const v: RichText = { text: 'bold link', marks: [{ start: 0, end: 4, mark: 'strong' }, { start: 5, end: 9, mark: 'a', href: 'https://x.example/' }] }
  const afterBold = rich(replaceRange(v, 4, 4, '!', { typed: true }).value)
  assert.deepEqual(afterBold.marks?.find((m) => m.mark === 'strong'), { start: 0, end: 5, mark: 'strong' })
  const afterLink = rich(replaceRange(v, 9, 9, '!', { typed: true }).value)
  assert.deepEqual(afterLink.marks?.find((m) => m.mark === 'a'), { start: 5, end: 9, mark: 'a', href: 'https://x.example/' })
  const atStart = rich(replaceRange(v, 0, 0, '>', { typed: true }).value)
  assert.deepEqual(atStart.marks?.map((m) => [m.mark, m.start, m.end]), [['strong', 1, 5], ['a', 6, 10]])
  const inside = rich(replaceRange(v, 2, 2, 'x', { typed: true }).value)
  assert.deepEqual(inside.marks?.find((m) => m.mark === 'strong'), { start: 0, end: 5, mark: 'strong' }, 'typed inside a mark grows it')
  // a paste takes nothing from the character before it
  const pasted = rich(replaceRange(v, 4, 4, '!', { typed: false }).value)
  assert.deepEqual(pasted.marks?.find((m) => m.mark === 'strong'), { start: 0, end: 4, mark: 'strong' })
  // a deletion across a mark's edge keeps what survives
  const cut = rich(replaceRange(v, 2, 6, '', { typed: true }).value)
  assert.equal(cut.text, 'boink')
  assert.deepEqual(cut.marks?.map((m) => [m.mark, m.start, m.end]), [['strong', 0, 2], ['a', 2, 5]])
  // a plain string stays a plain string
  assert.equal(replaceRange('plain', 5, 5, '!', { typed: true }).value, 'plain!')
})

test('replaceRange: a typed edit anywhere leaves every link record whole — Portal, search, and a post link with ref, newTab and rel', () => {
  const portal: Mark = { start: 0, end: 7, mark: 'a', portal: 'signup' }
  const search: Mark = { start: 8, end: 14, mark: 'a', search: true }
  const post: Mark = { start: 15, end: 19, mark: 'a', href: 'https://orbit-weekly.example/p/', ref: { kind: 'post', id: '1' }, newTab: true, rel: ['sponsored'] }
  let v: PropValue = { text: 'Sign up search post tail', marks: [portal, search, post] }
  for (const [at, ch] of [[24, '!'], [0, 'x'], [8, ' '], [15, 'y']] as const) {
    v = replaceRange(v, at, at, ch, { typed: true }).value
  }
  const records = rich(v).marks?.map(({ start: _s, end: _e, ...r }) => r)
  assert.deepEqual(records, [portal, search, post].map(({ start: _s, end: _e, ...r }) => r))
  assert.equal(rich(v).text, 'xSign up  searcyh post tail!')
})

test('replaceRange: the limit cuts the insert and says how many characters it refused', () => {
  assert.deepEqual(replaceRange('abcd', 4, 4, 'efgh', { max: 6 }), { value: 'abcdef', refused: 2 })
  assert.deepEqual(replaceRange('abcdef', 6, 6, 'g', { max: 6, typed: true }), { value: 'abcdef', refused: 1 })
  assert.deepEqual(replaceRange('abcdef', 0, 3, 'xyz!', { max: 6 }), { value: 'xyzdef', refused: 1 }, 'a replaced range makes room')
  const paste = replaceRange('ab', 1, 1, { text: 'XYZ', marks: [{ start: 1, end: 3, mark: 'em' }] }, { max: 4 })
  assert.deepEqual(paste, { value: { text: 'aXYb', marks: [{ start: 2, end: 3, mark: 'em' }] }, refused: 1 }, 'a paste\'s marks are shifted and cut with it')
  assert.deepEqual(replaceRange('abc', 3, 3, 'd😀e', { max: 5 }), { value: 'abcd', refused: 3 }, 'a limit inside an emoji drops the whole emoji, never half')
  assert.deepEqual(replaceRange('abc', 3, 3, 'd😀e', { max: 6 }), { value: 'abcd😀', refused: 1 })
})

test('toggleMark adds, removes exactly the range, and makes a partly marked range wholly marked', () => {
  const on = toggleMark('spring and summer', 0, 6, 'strong')
  assert.deepEqual(on, { text: 'spring and summer', marks: [{ start: 0, end: 6, mark: 'strong' }] })
  assert.deepEqual(rich(toggleMark(on, 0, 6, 'strong')).marks, [])
  assert.deepEqual(rich(toggleMark(on, 2, 4, 'strong')).marks, [{ start: 0, end: 2, mark: 'strong' }, { start: 4, end: 6, mark: 'strong' }])
  assert.deepEqual(rich(toggleMark(on, 4, 10, 'strong')).marks, [{ start: 0, end: 10, mark: 'strong' }])
  assert.equal(toggleMark(on, 3, 3, 'em'), on, 'a collapsed caret changes nothing')
})

test('setLink covers the range and every link it touches; unlink removes each touched link whole; activeMarks reports both', () => {
  const v: RichText = { text: 'one two three', marks: [{ start: 4, end: 7, mark: 'a', href: 'https://old.example/' }, { start: 0, end: 13, mark: 'em' }] }
  const set = rich(setLink(v, 6, 10, { href: 'https://new.example/', ref: { kind: 'post', id: '9' }, newTab: true }))
  assert.deepEqual(set.marks?.filter((m) => m.mark === 'a'), [{ start: 4, end: 10, mark: 'a', href: 'https://new.example/', ref: { kind: 'post', id: '9' }, newTab: true }])
  const active = activeMarks(set, 5, 6)
  assert.deepEqual(active, { marks: ['em'], linked: true, link: { href: 'https://new.example/', ref: { kind: 'post', id: '9' }, newTab: true } })
  assert.deepEqual(activeMarks(set, 11, 13), { marks: ['em'], linked: false, link: null })
  const gone = rich(unlink(set, 9, 12))
  assert.equal(gone.text, 'one two three')
  assert.deepEqual(gone.marks, [{ start: 0, end: 13, mark: 'em' }])
  assert.deepEqual(rich(unlink(set, 11, 13)).marks, set.marks, 'a range touching no link removes nothing')
})

test('readMarks: the four marks where allowed, a safe href only, everything else as its text, and lines or spaces', () => {
  const body = new JSDOM('').window.document
  const parse = (html: string) => {
    const d = new body.defaultView!.DOMParser().parseFromString(html, 'text/html')
    return d.body as unknown as MarkNode
  }
  const html = '<b>Bold</b> <i>it</i> <u>un</u>\n<a href="https://x.example/">ok</a> <a href="javascript:alert(1)">bad</a><img src="/x"><script>evil()</script><span style="color:red">red</span>'
  const all = readMarks(parse(html), ['strong', 'em', 'u', 'a'], true)
  assert.equal(all.text, 'Bold it un ok badred')
  assert.deepEqual(all.marks, [
    { start: 0, end: 4, mark: 'strong' },
    { start: 5, end: 7, mark: 'em' },
    { start: 8, end: 10, mark: 'u' },
    { start: 11, end: 13, mark: 'a', href: 'https://x.example/' },
  ])
  assert.deepEqual(readMarks(parse(html), ['a'], true).marks, [{ start: 11, end: 13, mark: 'a', href: 'https://x.example/' }])
  assert.deepEqual(readMarks(parse(html), [], false), { text: 'Bold it un ok badred' })
  assert.deepEqual(readMarks(parse('<p>one</p><p>two<br>three</p>'), [], true), { text: 'one\ntwo\nthree' })
  assert.deepEqual(readMarks(parse('<p>one</p><p>two<br>three</p>'), [], false), { text: 'one two three' })
  assert.deepEqual(readMarks(parse('<a href="mailto:a@b.c">m</a><a href="tel:1">t</a>'), ['a'], false).marks?.map((m) => m.href), ['mailto:a@b.c', 'tel:1'])
  // what a page's clipboard carries that no reader saw is not text either (Spec Change Log, 2026-09-18)
  // (body content first: the parser puts a leading <noscript> in <head> and spills its words into the body itself)
  assert.deepEqual(readMarks(parse('<p>words</p><style>p{color:red}</style><title>T</title><template>x</template><noscript>n</noscript>'), [], true), { text: 'words' })
  // a page split across two anchors with the same href is one link
  assert.deepEqual(readMarks(parse('<a href="https://x/">a</a><a href="https://x/">b</a>'), ['a'], false).marks, [{ start: 0, end: 2, mark: 'a', href: 'https://x/' }])
})
