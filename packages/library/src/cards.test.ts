// Story 7.13 — the card registry, `card_designs`' schema, `cardsCss` and `excludedChunks`, held to the spec's I/O matrix
// row by row. A core package's test opens no file (AD-1), so Ghost's chunks are made here in record-cards.py's head shape;
// the real vendored directory is read by `apps/web/style-guide.test.ts` (the subset and Ghost 5's prefix glob) and by
// `tools/check-snapshots.mjs` (both gscans over a compiled theme).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CARDS, cardChanges, cardOf, cardsCss, cardsCssVersion, cardValues, designedCards, excludedChunks, GHOST_BLOCK_HEAD, KOENIG_WIDTHS, OWN_RULES_HEAD,
  ownCardsCss, parseCardDesigns, withoutCard, withValue,
} from './cards.ts'
import type { CardDesigns } from './cards.ts'

const chunk = (name: string, body: string, version = '6.58.0') =>
  `/* Vendored verbatim from Ghost ${version}, core/frontend/src/cards/css/${name}.css, by \`python3 tools/probe/record-cards.py\`.\n   Copyright (c) 2013-2026 Ghost Foundation. MIT licence — the full text is vendor/LICENSE-ghost.txt. */\n${body}`
/** One stand-in chunk per name the registry lists, each carrying its own class and (audio, video) Ghost's `!important`. */
const NAMES = [...new Set(CARDS.flatMap((c) => c.chunks))]
const BODY = (n: string) => `.kg-${n}-card { display: block; }${n === 'audio' || n === 'video' ? `\n.kg-${n}-hide { display: none !important; }` : ''}`
const CHUNKS: Record<string, string> = Object.fromEntries(NAMES.map((n) => [n, chunk(n, BODY(n))]))
const icon = (name: string) => (name === 'asterisk' || name === 'leaf' ? `<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1"></path></svg>` : null)
const drawable = (name: string) => icon(name) !== null

test('the list is Ghost\'s own menu, less what leaves no element or never shows — each card once, each control and value named once', () => {
  assert.deepEqual(CARDS.map((c) => c.label), [
    'Image', 'Divider', 'Button', 'Bookmark', 'Gallery', 'Call to action', 'Email content', 'Callout', 'Signup', 'Header', 'Toggle', 'Video', 'Audio',
    'File', 'Product', 'GIF', 'HTML', 'Markdown', 'Embed',
  ])
  assert.equal(new Set(CARDS.map((c) => c.key)).size, CARDS.length)
  for (const c of CARDS) {
    assert.match(c.key, /^[a-z0-9_]+$/, c.key)
    assert.equal(new Set(c.controls.map((x) => x.name)).size, c.controls.length, c.key)
    for (const x of c.controls) {
      if (x.kind !== 'icon') {
        assert.equal(new Set(x.values.map((v) => v.value)).size, x.values.length, `${c.key}.${x.name}`)
        assert.ok(x.values.some((v) => v.value === x.start), `${c.key}.${x.name}'s start is one of its values`)
      }
      // R-170: no panel says CTA
      assert.doesNotMatch(`${x.label} ${x.values.map((v) => v.label).join(' ')}`, /\bCTA\b/)
    }
    // routine call 9: no panel passes six
    assert.ok(c.controls.length <= 6, `${c.key} has ${c.controls.length} controls`)
  }
  // R-6: no colour control on header, signup or call to action, and those three alone carry the mark
  assert.deepEqual(CARDS.filter((c) => !c.colour).map((c) => c.key), ['cta', 'signup', 'header'])
  for (const c of CARDS.filter((x) => !x.colour)) assert.ok(c.controls.every((x) => x.kind !== 'roles' && !/colou?r|background|fill|accent/i.test(x.label)), c.key)
  // never listed: public preview, email call to action, Transistor, NFT, the blockquote, Unsplash
  for (const gone of ['nft', 'blockquote', 'transistor', 'email-cta', 'unsplash', 'paywall']) assert.equal(cardOf(gone), undefined, gone)
  assert.ok(!NAMES.includes('nft') && !NAMES.includes('blockquote') && !NAMES.includes('transistor'), 'none of them is ever excluded')
})

test('each card\'s start values produce no rule — "untouched", "reset" and "Ghost\'s default" are one look', () => {
  for (const c of CARDS) assert.deepEqual(c.rules(cardValues({}, c), icon), [], c.key)
  // the control: a non-start value adds one
  const callout = cardOf('callout')
  assert.ok(callout !== undefined && callout.rules({ ...cardValues({}, callout), emoji: 'off' }).length > 0)
})

test('no card designed: card_assets stays true (an empty exclude), cards.css is D12\'s two widths alone', () => {
  for (const d of [{}, parseCardDesigns(null), parseCardDesigns(undefined)] as CardDesigns[]) {
    assert.deepEqual(excludedChunks(d, NAMES), [])
    assert.equal(cardsCss(d, CHUNKS), KOENIG_WIDTHS)
    assert.equal(cardsCssVersion(d, CHUNKS), null)
  }
  assert.equal(KOENIG_WIDTHS, '.kg-width-wide { max-width: var(--site-width); }\n.kg-width-full { max-width: 100%; }\n')
})

test('one static card: { callout: { emoji: hidden } } excludes callout; cards.css is the widths, Ghost\'s callout.css whole, its corners, gscan\'s names and the hidden emoji', () => {
  const d = { callout: { emoji: 'off' } }
  assert.deepEqual(excludedChunks(d, NAMES), ['callout'])
  const css = cardsCss(d, CHUNKS)
  assert.equal(css, [
    KOENIG_WIDTHS.trimEnd(),
    `${GHOST_BLOCK_HEAD}callout — copied unchanged from Ghost 6.58.0, core/frontend/src/cards/css/.`,
    '   Copyright (c) 2013-2026 Ghost Foundation. MIT licence: the full text is LICENSE-ghost.txt. */',
    '/* callout.css */',
    BODY('callout'),
    OWN_RULES_HEAD,
    '.kg-callout-card { border-radius: var(--radius-card); }',
    ...(cardOf('callout')?.always?.slice(1) ?? []),
    '.kg-callout-card div.kg-callout-emoji { display: none; }',
    '',
  ].join('\n'))
  // record-cards.py's head is cut whole: no repo path or tool name ships
  assert.doesNotMatch(css, /record-cards|tools\/|vendor\/|Vendored/)
  assert.equal(cardsCssVersion(d, CHUNKS), '6.58.0')
  // gscan 4.49.7's callout names ride a selector list, never a comment
  for (const n of ['.kg-callout-card-emoji', '.kg-callout-card-text', '.kg-callout-card-background-grey', '.kg-callout-card-background-accent']) {
    assert.ok(ownCardsCss(css).includes(`${n},`) || ownCardsCss(css).includes(`${n} {`), n)
  }
})

test('header designed: exclude lists header AND header_v2, and both chunks are copied', () => {
  const d = { header: { height: 'generous' } }
  assert.deepEqual(excludedChunks(d, NAMES), ['header', 'header_v2'])
  const css = cardsCss(d, CHUNKS)
  assert.match(css, /these cards: header · header_v2 — /)
  assert.ok(css.includes('/* header.css */\n') && css.includes('/* header_v2.css */\n'))
  // a chunk Ghost does not ship (a version without it) is neither excluded nor copied: derived from the directory
  assert.deepEqual(excludedChunks(d, NAMES.filter((n) => n !== 'header_v2')), ['header'])
})

test('a card with no chunk: a divider adds CSS and no exclude name, so card_assets stays true when it is the only one', () => {
  const d = { divider: { glyph: 'on' } }
  assert.deepEqual(excludedChunks(d, NAMES), [])
  const css = cardsCss(d, CHUNKS, icon)
  assert.ok(!css.includes(GHOST_BLOCK_HEAD), 'no Ghost block')
  assert.match(css, /^hr:not\(\[class\]\) \{ .*mask: url\("data:image\/svg\+xml,%3Csvg/m)
  assert.ok(!/url\("[^"]*["<>][^"]*"\)/.test(css.replace(/url\("data:[^"]*"\)/, '')), 'the drawing is encoded whole inside the url')
  // a glyph the set does not draw cannot be written
  assert.throws(() => cardsCss({ divider: { glyph: 'on', icon: 'no-such-icon' } }, CHUNKS, icon), /no icon Tabler draws/)
  // the icon chosen while the glyph is off adds nothing (greyed)
  assert.equal(cardsCss({ divider: { icon: 'leaf' } }, CHUNKS, icon), `${KOENIG_WIDTHS}`)
})

test('a scripted card: gallery and toggle copy their chunks; gallery\'s copy is what styles KGGC, KGGR and KGGI', () => {
  const d = { gallery: { gutter: 'loose' }, toggle: { chevron: 'left' } }
  assert.deepEqual(excludedChunks(d, NAMES), ['gallery', 'toggle'])
  assert.match(cardsCss(d, CHUNKS), /these cards: gallery · toggle — /)
})

test('a value back at its start leaves the record: the key, then the card, so the badge, the count and the exclusion go', () => {
  let d: CardDesigns = {}
  d = withValue(d, 'callout', 'colours', 'tokens')
  d = withValue(d, 'callout', 'background', 'tint')
  assert.deepEqual(d, { callout: { colours: 'tokens', background: 'tint' } })
  assert.deepEqual(designedCards(d).map((c) => c.key), ['callout'])
  d = withValue(d, 'callout', 'colours', 'ghost')
  assert.deepEqual(d, { callout: { background: 'tint' } })
  // the greyed background is KEPT (P0·0: the panel shows what returns) but renders nothing, so the card is Ghost's again:
  // no badge, no count, no exclusion, no rule (Review, 2026-10-16) — and Pack tokens brings Tint back
  assert.deepEqual(designedCards(d), [])
  assert.deepEqual(excludedChunks(d, NAMES), [])
  assert.equal(cardsCss(d, CHUNKS), KOENIG_WIDTHS)
  assert.deepEqual(cardChanges(d, 'callout'), { count: 0, nouns: [] })
  assert.deepEqual(designedCards(withValue(d, 'callout', 'colours', 'tokens')).map((c) => c.key), ['callout'], 'the control: Tint in force again')
  // the same for every greyed control: a bookmark's side while its thumbnail is hidden is no second change
  assert.deepEqual(cardChanges({ bookmark: { thumbnail: 'off', side: 'left' } }, 'bookmark'), { count: 1, nouns: ['thumbnail'] })
  d = withValue(d, 'callout', 'background', 'base')
  assert.deepEqual(d, {})
  assert.deepEqual(designedCards(d), [])
  assert.deepEqual(excludedChunks(d, NAMES), [])
  // an unknown card or control changes nothing
  assert.deepEqual(withValue({}, 'nft', 'x', 'y'), {})
  assert.deepEqual(withValue({}, 'callout', 'radius', 'y'), {})
})

test('reset: the card\'s key leaves the record whole; S14c names the count and the changed controls in panel order', () => {
  const d = { callout: { colours: 'tokens', 'emoji-size': 'large', emoji: 'off' }, bookmark: { side: 'left' } }
  assert.deepEqual(cardChanges(d, 'callout'), { count: 3, nouns: ['colours', 'emoji', 'emoji size'] })
  assert.deepEqual(cardChanges(d, 'image'), { count: 0, nouns: [] })
  assert.deepEqual(withoutCard(d, 'callout'), { bookmark: { side: 'left' } })
})

test('the callout at Pack tokens paints every callout in the chosen role\'s token, the text in the token that reads on it', () => {
  const css = (background: string) => ownCardsCss(cardsCss({ callout: { colours: 'tokens', background } }, CHUNKS))
  assert.match(css('base'), /\.kg-callout-card \{ background: var\(--bg-page\); color: var\(--text-body\); box-shadow: none; \}/)
  assert.match(css('surface'), /background: var\(--bg-surface\); color: var\(--text-body\)/)
  assert.match(css('tint'), /background: var\(--plate\); color: var\(--text-body\)/)
  assert.match(css('accent'), /background: var\(--accent\); color: var\(--text-on-accent\)/)
  // at Ghost's palette the background row is greyed, and its value adds nothing
  assert.doesNotMatch(ownCardsCss(cardsCss({ callout: { background: 'tint' } }, CHUNKS)), /--plate/)
})

test('no !important in a rule this theme writes: every card at every value, Ghost\'s own stay inside the copy', () => {
  // every card designed at every non-start value of every control, one control at a time
  for (const c of CARDS) {
    for (const x of c.controls) {
      for (const value of x.kind === 'icon' ? ['leaf'] : x.values.map((v) => v.value)) {
        const d = { [c.key]: { ...(c.key === 'divider' ? { glyph: 'on' } : {}), [x.name]: value } }
        const parsed = parseCardDesigns(d, drawable)
        assert.equal(typeof parsed, 'object', `${c.key}.${x.name}=${value}`)
        const css = cardsCss(parsed as CardDesigns, CHUNKS, icon)
        assert.doesNotMatch(ownCardsCss(css), /!\s*important/i, `${c.key}.${x.name}=${value}`)
      }
    }
  }
  const all = cardsCss({ audio: { accent: 'text' }, video: { bar: 'light' } }, CHUNKS)
  assert.match(all, /!important/, 'the control: Ghost\'s own copy keeps its !important')
  assert.doesNotMatch(ownCardsCss(all), /!important/)
  // the own half is the widths and the rules: nothing of Ghost's block survives the split
  assert.ok(!ownCardsCss(all).includes('/* audio.css */') && ownCardsCss(all).startsWith(KOENIG_WIDTHS) && ownCardsCss(all).includes(OWN_RULES_HEAD))
})

test('determinism (AD-14): the same designs in another key order, and two calls, give the same bytes', () => {
  const a = { toggle: { chevron: 'left' }, callout: { emoji: 'off', 'emoji-size': 'large' }, header: { height: 'generous' } }
  const b = { header: { height: 'generous' }, callout: { 'emoji-size': 'large', emoji: 'off' }, toggle: { chevron: 'left' } }
  assert.equal(cardsCss(a, CHUNKS), cardsCss(a, CHUNKS))
  assert.equal(cardsCss(a, CHUNKS), cardsCss(b, CHUNKS))
  assert.deepEqual(parseCardDesigns(b), parseCardDesigns(a))
  assert.deepEqual(Object.keys(parseCardDesigns(b) as object), ['callout', 'header', 'toggle'])
  assert.deepEqual(excludedChunks(a, NAMES), excludedChunks(b, [...NAMES].reverse()))
})

test('the parser refuses the record whole — each refusal behind a passing control', () => {
  const refused = (raw: unknown, pattern: RegExp) => {
    const got = parseCardDesigns(raw, drawable)
    assert.equal(typeof got, 'string', JSON.stringify(raw))
    assert.match(got as string, pattern)
    assert.match(got as string, /so none of them was read\.$/)
  }
  // the controls: a legal record, and one carrying a start value, read back as stored (the start dropped)
  assert.deepEqual(parseCardDesigns({ callout: { emoji: 'off' }, divider: { glyph: 'on', icon: 'leaf' } }, drawable), { divider: { glyph: 'on', icon: 'leaf' }, callout: { emoji: 'off' } })
  assert.deepEqual(parseCardDesigns({ callout: { emoji: 'on' }, bookmark: {} }, drawable), {})
  refused('callout', /not a record of cards/)
  refused([], /not a record of cards/)
  refused({ nft: { x: 'y' } }, /name "nft", which is no card/)
  refused(JSON.parse('{"__proto__": {}}'), /no card/)
  refused({ callout: 'off' }, /no controls for Callout/)
  refused({ callout: ['off'] }, /no controls for Callout/)
  refused({ callout: { radius: 'large' } }, /a control "radius" it does not have/)
  refused({ callout: { emoji: 'hidden' } }, /Callout's Emoji to a value it does not offer/)
  refused({ callout: { emoji: true } }, /Callout's Emoji to a value it does not offer/)
  // a colour control on a no-colour card is an unknown control (R-6)
  refused({ signup: { background: 'tint' } }, /Signup a control "background"/)
  refused({ cta: { background: 'tint' } }, /Call to action a control "background"/)
  // the icon slot: a name in Tabler's grammar the set draws
  refused({ divider: { icon: 'Leaf' } }, /Divider's Glyph/)
  refused({ divider: { icon: 'no-such-icon' } }, /Divider's Glyph/)
  // one bad card refuses the good ones beside it
  refused({ callout: { emoji: 'off' }, toggle: { chevron: 'up' } }, /Toggle's Chevron side/)
})
