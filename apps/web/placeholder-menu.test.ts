import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PLACEHOLDERS, PAGE_NUMBER, placeholdersOffered } from '@inflozo/library'
import { replaceRange } from '@inflozo/section-runtime'

/* R-185's SURFACE, AND THE ONE BEHAVIOUR UNDER IT THAT NOTHING ELSE CATCHES (Story 5.16a).

   READ out of the files, not imported: `node --test` strips types but cannot load a `.tsx`, which is why
   every pure test here lives on a `lib/*.ts` and the ones that must see a component read its source
   (`busy.test.ts` is the pattern, and its reason applies exactly — a rule with no check is the state that
   produced the finding).

   Two things are asserted and both were comments before this story:

   1. `lib/inline.ts` RE-SERIALIZES WITH NO TOKEN VALUES while a field is being edited. That is the whole
      mechanism of "click into the words and the token shows again so you can edit it" (R-182's second
      sentence): `serializeMarks(value, def)` with no third argument means "as the customer typed it", and a
      third argument added here would make a field being edited show the NUMBER — uneditable, and with the
      caret unable to sit inside it. Nothing else in the suite fails if it is lost.
   2. THE MENU'S ACCESSIBILITY (R-98's neighbourhood): the `{}` button says which field it belongs to, the
      card is a `popover` so the platform gives light dismiss, Escape and focus return, arrow keys walk it,
      and Copy's confirmation is ANNOUNCED rather than only coloured.

   …and one deletion, because R-185 is one way for every placeholder and two ways is the thing it was ruled
   to stop: `TokenRow` is gone, and so is the sentence about other words in braces — from the whole product
   (the owner, 2026-09-23: "Do not mention 'anything else in braces prints exactly as you typed it'
   anywhere. It is understood."). */

const read = (path: string) => readFileSync(path, 'utf8')

test('R-182 — the two editing sinks serialize with NO token values, so the token shows as typed', () => {
  const src = read('lib/inline.ts')
  const calls = [...src.matchAll(/serializeMarks\(([^)]*)\)/g)].map((m) => m[1] as string)
  assert.ok(calls.length >= 2, `lib/inline.ts should still serialize the value it is editing: ${calls.length} call(s)`)
  for (const args of calls) {
    assert.equal(args.split(',').length, 2, `a field being EDITED must be serialized with no token values, got serializeMarks(${args})`)
  }
  // and the comment that says why is still beside it, because the next reader needs the reason, not the rule
  assert.match(src, /reads as typed/, 'the comment explaining the two-argument call is load-bearing and stays')
})

test('R-185 — the {} button names its field, and the menu is a popover the keyboard can work', () => {
  const src = read('components/controls/placeholder-menu.tsx')
  assert.match(src, /aria-label=\{`Placeholders for \$\{label\}`\}/, 'the trigger says WHICH field it belongs to')
  assert.match(src, /popover="auto"/, 'light dismiss, Escape and focus return are the platform\'s')
  assert.match(src, /popoverTarget=/, 'the trigger opens it as a popover target')
  assert.match(src, /onKeyDown=\{arrowKeys\}/, 'arrow keys walk the rows')
  assert.match(src, /openMenu\(/, 'placement, both-edge clamping and the flip are lib/menu.ts\'s')
  assert.match(src, /role="status"/, "Copy's confirmation is ANNOUNCED, not only coloured (R-98)")
  assert.ok(src.includes('offered.length === 0') && src.includes('return null'),
    'a field with nothing to offer carries NO button at all — absent, never greyed (UX-DR3)')
  // the card holds the rows and nothing else: no footer, no explanatory sentence (R-185 as amended)
  const card = src.slice(src.indexOf('<BarMenuCard'), src.indexOf('</BarMenuCard>'))
  assert.ok(!/<p|<span className="text-helper/.test(card), `the card holds its rows and nothing else: ${card}`)
})

test('R-185 — the menu is bar-menu.tsx\'s anatomy, never a second look (R-171, R-74)', () => {
  const src = read('components/controls/placeholder-menu.tsx')
  for (const part of ['BAR_POPOVER', 'BarMenuCard', 'PlaceholderRow', 'PLACEHOLDER_ACTION']) {
    assert.ok(src.includes(part), `the menu is built from bar-menu.tsx's ${part}`)
  }
  const bar = read('components/editor/bar-menu.tsx')
  // the row is a SIBLING of BarMenuRow with the same parts and measures: the same gutters, a name at
  // 13/500 over one line at 11px muted, a trailing slot — and `relative`, or an sr-only word gives the
  // card a second scrollbar (R-172's finding)
  const row = bar.slice(bar.indexOf('export function PlaceholderRow'))
  for (const measure of ['relative', 'gap-[10px]', 'pl-[10px]', 'pr-[10px]', 'text-ui-dense', 'text-helper-caption text-ink-soft']) {
    assert.ok(row.includes(measure), `PlaceholderRow must keep BarMenuRow's ${measure}`)
  }
})

test('R-185 — nothing goes under a field any more: TokenRow is gone, and so is the braces sentence', () => {
  for (const path of ['components/controls/rich-field.tsx', 'components/controls/sidebar.tsx']) {
    const src = read(path)
    assert.ok(!src.includes('TokenRow'), `${path} still carries the withdrawn chip row`)
    assert.ok(!/TOKENS THIS FIELD ACCEPTS/.test(src), `${path} still carries P0-1's withdrawn caption`)
    assert.ok(!/else in braces/i.test(src), `${path} still carries the sentence the owner withdrew from the product`)
    assert.ok(src.includes('PlaceholderMenu'), `${path} reaches placeholders the one way R-185 allows`)
  }
})

test('R-186 · R-187 — the panel asks ONE function where it is, and never decides the rule itself', () => {
  const src = read('components/controls/sidebar.tsx')
  assert.match(src, /placeholdersOffered\(prop\.def, \{ page: shownPage, siteWide \}\)/,
    'the offer is the library\'s one answer, asked once for both field kinds')
  assert.equal([...src.matchAll(/placeholdersOffered\(/g)].length, 1, 'a rule with two implementations is a rule with one bug')
  // the editor tells it where it is rather than the panel deriving the page a second way
  const editor = read('app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx')
  assert.match(editor, /shownPage=\{page\}/)
  assert.match(editor, /siteWide=\{chosen\.doc === SITE\.key\}/)
})

test('R-185 — every placeholder the menu can list carries its one line', () => {
  // the refusal in validate.ts is what keeps this true for placeholders nobody has thought of yet; this is
  // the same claim from the menu's side, over every placeholder that can actually reach a row
  for (const where of [{ page: 1 }, { page: 2 }, { page: 2, siteWide: true }]) {
    for (const token of placeholdersOffered({ type: 'richtext', tokens: ['members', 'term', 'n'] }, where)) {
      const line = PLACEHOLDERS[token]
      assert.ok(typeof line === 'string' && line.trim() !== '', `{${token}} reached a row with no description`)
    }
  }
})

test('R-27 — Insert is WHOLE OR NOTHING: all three arms refuse a token that will not fit, and say why', () => {
  /* The matrix row nothing else covers. `replaceRange` CUTS an insert to fit — that is its job for typing —
     so whole-or-nothing lives at the three call sites, each of which must refuse rather than commit. A cut
     `{page` would print literally on the customer's site, which is the failure R-27 named. */
  const token = `{${PAGE_NUMBER}}`
  // the premise the call sites rest on: too little room comes back REFUSED, not silently shortened
  const tight = replaceRange('The archive', 11, 11, token, { max: 16 })
  assert.ok(tight.refused > 0, 'a field with less room than the token must report a refusal')
  assert.notEqual(tight.value, 'The archive' + token, 'replaceRange cuts — which is exactly why the call site must refuse')
  const roomy = replaceRange('The archive', 11, 11, token, { max: 40 })
  assert.equal(roomy.refused, 0)
  assert.equal(roomy.value, 'The archive' + token, 'and the legitimate case still lands whole')

  // …and each arm returns on that refusal instead of committing, with the limit sentence to say so
  const rich = read('components/controls/rich-field.tsx')
  assert.match(rich, /if \(r\.refused > 0\) return setRefused\(true\)/, 'the richtext arm refuses whole and shows the limit sentence')
  assert.match(rich, /<LimitCaption[^>]*refused=\{refused\}/, 'and the sentence is the field\'s own caption, not a new one')
  const inline = read('lib/inline.ts')
  assert.match(inline, /if \(r\.refused > 0\) return refuse\(\)/, 'the live-editing arm refuses whole')
  const side = read('components/controls/sidebar.tsx')
  assert.match(side, /if \(max !== undefined && next\.length > max\) return setRefusedToken\(id\)/, 'the one-line text arm refuses whole')
})

test('R-188 — the owner\'s five findings on this menu, each where it lives', () => {
  /* His test of the deployed story, 2026-09-23. Five sentences, and each one is a thing that can quietly come
     back: an icon that grows a word again, a tick that never returns to Copy, a menu left covering the words it
     just changed, a `truncate` copied in from the sibling row, a row that stops answering the pointer. The
     deployed walk (step 93) proves the behaviour in a real browser; these hold the source to it. */
  const menu = read('components/controls/placeholder-menu.tsx')
  const bar = read('components/editor/bar-menu.tsx')

  // 1 — minimal Tabler glyphs, each naming itself on hover AND to a screen reader, with no words in the button
  assert.match(menu, /<PlaceholderCopy size=\{13\} \/>/)
  assert.match(menu, /<PlaceholderInsert size=\{13\} \/>/)
  assert.match(menu, /title=\{copied === code \? 'Copied' : 'Copy'\}/, "Copy says its name on hover")
  assert.match(menu, /title="Insert"/, 'Insert says its name on hover')
  assert.match(menu, /aria-label=\{copied === code \? `\$\{code\} copied` : `Copy \$\{code\}`\}/)
  assert.match(menu, /aria-label=\{`Insert \$\{code\} into \$\{label\}`\}/)
  assert.ok(!/>\s*(Copy|Copied|Insert)\s*</.test(menu), 'the buttons carry a glyph and no words (R-188 finding 1)')

  // 2 — the tick REPLACES copy, and copy comes back after two seconds
  assert.match(menu, /copied === code \? <PlaceholderCopied size=\{13\} \/> : <PlaceholderCopy size=\{13\} \/>/)
  assert.match(menu, /setTimeout\(\(\) => setCopied\(null\), 2000\)/, "two seconds is the owner's own number")

  // 3 — Insert closes the list
  assert.match(menu, /onInsert\(code\)\n\s*\/\/[^\n]*\n\s*menu\.current\?\.hidePopover\(\)/,
    'Insert closes the menu immediately after inserting (R-188 finding 3)')

  // 4 — the description is never cropped, while the code beside it still is
  const row = bar.slice(bar.indexOf('export function PlaceholderRow'), bar.indexOf('PLACEHOLDER_ACTION ='))
  const caption = row.slice(row.indexOf('data-caption'), row.indexOf('data-caption') + 120)
  assert.ok(!caption.includes('truncate'), `the description must wrap, never crop: ${caption}`)
  assert.ok(row.slice(row.indexOf('data-code'), row.indexOf('data-code') + 120).includes('truncate'),
    'the code is one short string and stays on its line')

  // 5 — every row answers the pointer, with BarMenuRow's own hover
  assert.ok(/<li className="[^"]*hover:bg-paper\b/.test(row), `a row must answer the pointer: ${row.slice(0, 400)}`)
  assert.ok(bar.slice(bar.indexOf('export function BarMenuRow')).includes('hover:bg-paper'),
    'and it is the same hover its sibling row uses, not a second look')
})

