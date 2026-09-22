// Story 4.4 — Orbit Weekly and the three fixtures: the composition proof, the Source resolver, and the
// recordings asserted against the corpus they were recorded from.
//
// Three rules this file keeps, each from the spec:
//   * THE SIZE RULES ARE ASSERTED AS RULES. The feed is sized by FR-H3's two normative rules — a middle
//     page and a partial page must exist, and the feed must never equal `posts_per_page` — so the
//     arithmetic is derived here and the figures the owner ruled are nowhere in this file.
//   * NOTHING SKIPS. A missing recording throws naming the fixture and the capture command.
//   * NOTHING IS NORMALISED. The two majors' bytes are kept apart; where their class sets differ, the
//     difference must be DECLARED below, so a target bump that changes a card fails by name.

import { test } from 'node:test'
import assert from 'node:assert/strict'
// ponytail: a test-only RELATIVE import. `ghost-shim` depends on this package, so declaring the reverse
// dependency would be a cycle; the two rows below that need the shim (the page links and the
// `{{content}}` refusal) are the seam this story fills, and asserting them against the real shim is
// the point. Move them if `library` ever grows a dev-dependency graph of its own.
import { bareHelper, navigationItems, pageUrl, paginationContext } from '../../ghost-shim/src/index.ts'
import {
  DEFAULT_LIMIT, DEFAULT_ORDER, MAJORS, ORBIT_WEEKLY_ORIGIN, ORBIT_WEEKLY_SEED, RECORDING_COMMAND,
  articleOrder, authors, blocks, brand, cardAssetsExclude, commentCount, commentThreads, commentsFixture,
  deepPagination, feedPage, feedPagination, feedPages, newsletters, postsPerPage, posts, previewFixtures, recording,
  fixtureSubject, resolvePreviewSeed, resolveSource, resolveSubject, simulatedChunks, site, sortRows, styleGuideBody,
  styleGuidePageBody, subject, subjectKindOf, tags, templateContext, tiers, variants,
} from './orbit-weekly.ts'
import type { Major, Subject } from './orbit-weekly.ts'
import { NATIVE_FILES, nativeResourceOf } from './placement.ts'
import type { DataBinding } from './registry.ts'
import referenceDesign from '../fixtures/reference-design/design.json' with { type: 'json' }

const classes = (html: string): Set<string> =>
  new Set([...html.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean)))
const first = (html: string): { tag: string; classes: Set<string> } => {
  const m = /<([a-zA-Z0-9-]+)((?:"[^"]*"|'[^']*'|[^'">])*)>/.exec(html)
  assert.ok(m, `no element in ${html.slice(0, 80)}`)
  const c = /\sclass="([^"]*)"/.exec(m[2])
  return { tag: m[1].toLowerCase(), classes: new Set(c ? c[1].split(/\s+/) : []) }
}

// ─── the composition ─────────────────────────────────────────────────────────

test('FR-H3 rule 1 — the feed renders a first page, a middle page carrying BOTH links, and a partial last', () => {
  const { pages, limit, total } = feedPagination(1)
  assert.equal(limit, postsPerPage())
  const contexts = Array.from({ length: pages }, (_, i) => paginationContext(feedPagination(i + 1)))
  assert.equal(contexts[0].prev, null, 'page 1 has no previous link')
  assert.ok(contexts.some((c) => c.prev !== null && c.next !== null), 'no middle page — nothing carries both a previous and a next link')
  assert.ok(total % limit !== 0, 'the last page is full — a partial page is where a row alignment breaks, and there is none')
  assert.ok(feedPage(pages).length > 0 && feedPage(pages).length < limit, 'the last page is not partial')
  assert.equal(contexts.at(-1)?.next, null)
  assert.equal(feedPage(1).length + (pages - 2) * limit + feedPage(pages).length, total, 'the pages do not add up to the feed')
})

test('FR-H3 rule 2 — the feed never equals posts_per_page', () => {
  assert.notEqual(posts().length, postsPerPage())
})

test('a deep pager carries its depth in `pagination` and invents no posts', () => {
  const feedPages = feedPagination(1).pages
  const deep = paginationContext(deepPagination())
  assert.ok(deep.pages > feedPages, 'the deep context is no deeper than the feed')
  assert.ok(deep.prev !== null && deep.next !== null, 'the deep context is not a middle page')
  assert.equal(posts().length, feedPagination(1).total, 'posts were added to reach the depth')
})

test('Q2 — every family that was short now fills: writers, paid tiers, newsletters, featured, logos', () => {
  // The floors are what each family's designs DRAW (spec, Boundaries), not the owner's figures, which
  // sit above them on purpose.
  assert.ok(authors().length >= 12, 'the Writers grid is built for twelve')
  assert.ok(tiers().filter((t) => t['type'] === 'paid').length >= 3, 'the Pricing designs draw up to three paid cards')
  assert.equal(tiers().filter((t) => t['type'] === 'free').length, 1, 'one tier is Free')
  assert.ok(newsletters().length >= 3 && newsletters().some((n) => n['visibility'] === 'paid'), 'at least three newsletters, one paid')
  assert.ok(posts().filter((p) => p.featured).length >= 10, 'the Picks design offers a count of ten')
  assert.ok(brand().press.length >= 12, 'the Logo Wall previews against twelve publications')
  assert.ok(resolveSource({ source: 'posts', filter: 'tag:newsletter' }).length > 0, "A22's default `newsletter` tag binds to nothing")
})

test('every writer has a full archive by co-authorship, and every card still carries ONE byline', () => {
  for (const a of authors()) {
    const rows = resolveSource({ source: 'posts', filter: `authors:${a.slug}`, limit: 100 })
    assert.ok(rows.length >= 6, `${a.name} has ${rows.length} posts — By author must return a usable set`)
  }
  for (const p of posts()) {
    assert.ok(p.primary_author !== null && typeof p.primary_author.name === 'string', `${p.slug} has no single byline`)
    assert.equal(p.primary_author, p.authors[0])
  }
  assert.ok(posts().some((p) => p.authors.length > 1), 'no co-authored post')
})

test('the frames\' gaps exist in the data: a writer with no portrait, posts with no feature image', () => {
  assert.ok(authors().some((a) => a.profile_image === null))
  assert.ok(posts().some((p) => p['feature_image'] === null))
  for (const url of [...posts().map((p) => p['feature_image']), ...authors().map((a) => a.profile_image)]) {
    if (url !== null) assert.ok(String(url).startsWith(`${ORBIT_WEEKLY_ORIGIN}/images/`), `${url} is not internally produced`)
  }
})

// ─── resolveSource — the I/O matrix ───────────────────────────────────────────

test('every Data-group Source returns rows — latest, featured, every tag, every author, hand-picked, featured AND tag', () => {
  assert.ok(resolveSource({ source: 'posts' }).length > 0, 'Latest')
  assert.ok(resolveSource({ source: 'posts', filter: 'featured:true' }).length > 1, 'Featured is a one-card row')
  for (const t of tags()) {
    assert.ok(resolveSource({ source: 'posts', filter: `tag:${t.slug}` }).length >= 3, `By tag "${t.slug}"`)
    assert.ok(resolveSource({ source: 'posts', filter: `featured:true+tag:${t.slug}` }).length > 0, `Featured AND tag "${t.slug}"`)
  }
  for (const s of ['tags', 'authors', 'tiers'] as const) assert.ok(resolveSource({ source: s }).length > 0, s)
})

test('hand-picked ids come back in the PICKED order, and a missing id is skipped', () => {
  const all = posts()
  const late = all[Math.floor(all.length / 2)]!   // derived, not a figure: past the first page whatever the feed size
  const ids = [all[7].id, all[2].id, 'not-an-id', late.id]
  assert.deepEqual(resolveSource({ source: 'posts', ids }).map((r) => r['id']), [all[7].id, all[2].id, late.id])
})

test('a Source that matches nothing is [] — never a throw', () => {
  assert.deepEqual(resolveSource({ source: 'posts', filter: 'tag:does-not-exist' }), [])
})

test('limit, order and negation are evaluated; a filter outside the grammar REFUSES by name', () => {
  assert.equal(resolveSource({ source: 'posts', limit: 3 }).length, 3)
  const oldest = resolveSource({ source: 'posts', order: 'published_at asc', limit: 1 })[0]
  assert.equal(oldest['id'], posts().at(-1)?.id)
  assert.ok(resolveSource({ source: 'posts', filter: 'featured:-true', limit: 100 }).every((r) => r['featured'] === false))
  assert.ok(resolveSource({ source: 'posts', filter: 'tag:[essays,tools]', limit: 100 }).length > 0)
  assert.throws(() => resolveSource({ source: 'posts', filter: 'tag:essays,tag:tools' }), /cannot evaluate/)
  assert.throws(() => resolveSource({ source: 'posts', filter: 'published_at:>2026-01-01' }), /cannot evaluate/)
  assert.throws(() => resolveSource({ source: 'posts', filter: 'colour:red' }), /"colour" is not a field/)
  assert.throws(() => resolveSource({ source: 'pages' }), /not a \{\{#get\}\} source/)
})

test('the resolver\'s default ORDER and LIMIT are Ghost\'s, as recorded on both majors', () => {
  for (const major of MAJORS) {
    const d = recording(major, 'capture')['content_api_defaults'] as Record<string, { limit: number; rows: Record<string, unknown>[] }>
    for (const source of ['posts', 'tags', 'authors', 'tiers'] as const) {
      const { limit, rows } = d[source]
      assert.ok(rows.length > 1, `Ghost ${major} recorded one ${source} row — an order cannot be read from it`)
      const shuffled = [...rows].reverse()
      assert.deepEqual(sortRows(shuffled, DEFAULT_ORDER[source]), rows, `Ghost ${major} ${source}: "${DEFAULT_ORDER[source]}" is not the order Ghost returned`)
      const want = DEFAULT_LIMIT[source]
      assert.equal(want === 'all' ? rows.length : want, limit, `Ghost ${major} ${source}: default limit`)
    }
  }
})

test('the fixtures are in no Source and in no count — reachable only as preview subjects', () => {
  const ids = new Set([subject('post').id, subject('page').id])
  const bindings = [
    { source: 'posts', limit: 100 }, { source: 'posts', filter: 'featured:true', limit: 100 },
    ...tags().flatMap((t) => [{ source: 'posts', filter: `tag:${t.slug}`, limit: 100 }, { source: 'posts', filter: `featured:true+tag:${t.slug}`, limit: 100 }]),
    ...authors().map((a) => ({ source: 'posts', filter: `authors:${a.slug}`, limit: 100 })),
    { source: 'posts', filter: 'visibility:members', limit: 100 },
  ]
  for (const b of bindings) {
    for (const r of resolveSource(b)) assert.ok(!ids.has(String(r['id'])), `${JSON.stringify(b)} returned a fixture subject`)
  }
  for (const t of tags()) assert.equal(t.count.posts, posts().filter((p) => p.tags.some((x) => x.slug === t.slug)).length, `tag ${t.slug}'s count`)
  for (const a of authors()) assert.equal(a.count.posts, posts().filter((p) => p.authors.some((x) => x.slug === a.slug)).length, `author ${a.slug}'s count`)
  // the subject's own writer and tag are real rows, and the subject does not count towards them
  assert.equal(subject('post').primary_author?.slug, authors().find((a) => a.slug === subject('post').primary_author?.slug)?.slug)
})

test('previewSeed "orbit-weekly" resolves; any other seed refuses by name', () => {
  assert.equal(resolvePreviewSeed(ORBIT_WEEKLY_SEED).resolveSource, resolveSource)
  assert.throws(() => resolvePreviewSeed('some-other-dataset'), /resolves to nothing/)
})

// The validator accepts more NQL than the resolver evaluates (`validate.ts` lets `,` through; the
// resolver refuses it by name), so a design can validate green and preview empty. Until the editor
// exists this is the one place that drift is caught: every shipped design's bindings must resolve.
test('the reference design validates AND previews: its seed resolves and every binding returns rows', () => {
  const { resolveSource: resolve } = resolvePreviewSeed(referenceDesign.previewSeed)
  for (const [key, binding] of Object.entries(referenceDesign.dataBindings)) {
    assert.ok(resolve(binding as DataBinding).length > 0, `reference design's binding "${key}" resolves to no rows`)
  }
})

// ─── the recordings ───────────────────────────────────────────────────────────

test('a missing recording FAILS naming the fixture and the capture command', () => {
  assert.throws(() => recording('4' as Major, 'article'), (e: Error) =>
    e.message.includes('fixtures/ghost4/article.json') && e.message.includes(RECORDING_COMMAND))
})

test('every block of the corpus is asserted against the recording, for each major', () => {
  const order = articleOrder()
  const vs = variants()
  const byId = new Map(vs.map((v) => [v.id, v]))
  for (const major of MAJORS) {
    const cap = recording(major, 'capture')
    assert.equal(cap['ghost_major'], major)
    assert.equal(cap['command'], RECORDING_COMMAND)
    assert.match(String(cap['captured']), /^\d{4}-\d{2}-\d{2}$/)
    assert.match(String((cap['renderer'] as { version: string }).version), /^\d+\.\d+\.\d+/)

    const article = blocks(major, 'article')
    assert.deepEqual(article.map((b) => b.id), order, `Ghost ${major}: the recorded article is not the corpus article`)
    const sheet = blocks(major, 'variations')
    assert.deepEqual(sheet.map((b) => b.id), vs.map((v) => v.id), `Ghost ${major}: the recorded sheet is not the corpus`)

    for (const b of [...article, ...sheet]) {
      assert.ok(b.html.trim() !== '', `Ghost ${major} ${b.id}: an empty snapshot`)
      const v = b.id === null ? undefined : byId.get(b.id)
      if (v === undefined) continue
      const top = first(b.html)
      assert.ok(top.classes.has(v.root) || top.tag === v.root, `Ghost ${major} ${v.id}: root "${v.root}" is not on <${top.tag}>`)
      const all = classes(b.html)
      for (const c of v.expect) assert.ok(all.has(c), `Ghost ${major} ${v.id}: carries no ${c}`)
    }
    // an article block is the SAME recording as the sheet's block for that variant
    const sheetById = new Map(sheet.map((b) => [b.id, b.html]))
    for (const b of article) if (b.id !== null) assert.equal(b.html.trim(), sheetById.get(b.id)?.trim(), `Ghost ${major} ${b.id}: the article and the sheet disagree`)
  }
})

test('the control: the four documented root classes came back on both majors', () => {
  for (const major of MAJORS) {
    const all = classes(blocks(major, 'variations').map((b) => b.html).join(''))
    for (const c of ['kg-image-card', 'kg-bookmark-card', 'kg-gallery-card', 'kg-toggle-card']) assert.ok(all.has(c), `Ghost ${major}: ${c}`)
  }
})

/** Where the two majors print DIFFERENT class sets for the same block. Declared, never normalised — a
 *  target bump that changes one fails below naming the block. Empty as recorded: the majors differ in
 *  bytes and not in any class. */
const MAJOR_CLASS_DIFFERENCES: Readonly<Record<string, { ghost5: string[]; ghost6: string[] }>> = {}

/** Where the two majors print different BYTES for the same block — asserted POSITIVELY, by name, so a
 *  bump that makes them agree (or disagree somewhere new) fails naming the block rather than passing
 *  by coincidence. As recorded: the video poster (a spacer URL on 5, a data GIF on 6) and its
 *  `aspect-ratio`, and the signup card's placeholder markup. Every other block is byte-identical. */
const MAJOR_BYTE_DIFFERENCES: readonly string[] = [
  'video-regular', 'video-wide', 'video-full', 'video-regular-loop', 'video-wide-caption',
  'signup-regular', 'signup-wide', 'signup-full', 'signup-split', 'signup-full-dark',
]

test('the majors are kept apart: every byte difference and every class-set difference is declared by name', () => {
  const five = new Map(blocks('5', 'variations').map((b) => [b.id, b.html]))
  const differing: string[] = []
  for (const b of blocks('6', 'variations')) {
    if (five.get(b.id) !== b.html) differing.push(String(b.id))
    const c5 = classes(five.get(b.id) ?? '')
    const c6 = classes(b.html)
    const d = { ghost5: [...c5].filter((c) => !c6.has(c)).sort(), ghost6: [...c6].filter((c) => !c5.has(c)).sort() }
    assert.deepEqual(d, MAJOR_CLASS_DIFFERENCES[String(b.id)] ?? { ghost5: [], ghost6: [] }, `${b.id}: the majors' class sets differ from what is declared`)
  }
  assert.deepEqual(differing, [...MAJOR_BYTE_DIFFERENCES], 'the blocks whose bytes differ between the majors are not the declared ones')
  // no recording carries the test servers' hostnames: outbound link tagging is off for the run
  for (const major of MAJORS) assert.doesNotMatch(blocks(major, 'variations').map((b) => b.html).join(''), /[?&]ref=/, `Ghost ${major}: an outbound link carries ?ref=`)
})

test('the renderer directory list is recorded, and the NFT card has no Lexical renderer on either major (DW-101)', () => {
  for (const major of MAJORS) {
    const nodes = (recording(major, 'capture')['renderer'] as { nodes: string[] }).nodes
    assert.ok(nodes.length > 10, `Ghost ${major}: no renderer directory list recorded`)
    assert.ok(!nodes.includes('nft'), `Ghost ${major} now ships a Lexical NFT renderer — DW-101 and C4's CARDS row are back on the table`)
    for (const c of ['toggle', 'image', 'gallery', 'bookmark']) assert.ok(nodes.includes(c), `Ghost ${major}: no ${c} renderer`)
  }
})

test('fixture 3 — a Ghost PAGE carrying the article prints the same body, on each major', () => {
  for (const major of MAJORS) assert.equal(styleGuidePageBody(major), styleGuideBody(major))
  const p = subject('page')
  assert.equal(p['show_title_and_feature_image'], true)
  assert.ok(typeof p['feature_image'] === 'string', 'the page must have a feature image for the guard\'s shown state to show one')
})

// FR-H3's own enumeration (prd.md:319) — the design surface, written down because it IS the
// requirement. Each row is a marker a recorded block carries or lacks, so the sheet is checked by what
// Ghost printed, not by the labels we gave it.
test('the variation sheet carries every class-affecting variant FR-H3 enumerates, each labelled', () => {
  const sheet = blocks('6', 'variations')
  const labels = new Map(variants().map((v) => [v.id, v]))
  for (const b of sheet) assert.ok((labels.get(String(b.id))?.label ?? '') !== '', `${b.id} is unlabelled`)
  const of = (card: string) => sheet.filter((b) => labels.get(String(b.id))?.card === card).map((b) => b.html)
  const has = (card: string, test: (h: string) => boolean, what: string) => assert.ok(of(card).some(test), `${card}: no ${what}`)
  const cap = (h: string) => /<figcaption/.test(h)

  for (const w of ['wide', 'full']) for (const c of [true, false]) has('image', (h) => classes(h).has(`kg-width-${w}`) && cap(h) === c, `${w} ${c ? 'with' : 'without'} caption`)
  for (const c of [true, false]) has('image', (h) => ![...classes(h)].some((x) => x.startsWith('kg-width-')) && cap(h) === c, `regular ${c ? 'with' : 'without'} caption`)
  for (const n of [1, 2, 3, 4, 5]) has('gallery', (h) => (h.match(/class="kg-gallery-image"/g) ?? []).length === n, `${n}-image gallery`)
  has('gallery', cap, 'captioned gallery')
  for (const w of ['regular', 'wide', 'full']) has('video', (h) => classes(h).has(`kg-width-${w}`), `${w} video`)
  has('video', (h) => /\sloop[\s=>]/.test(h), 'looping video')
  const colours = new Set(of('callout').flatMap((h) => [...classes(h)].filter((c) => /^kg-callout-card-/.test(c))))
  assert.equal(colours.size, 9, `callout ×9 colours — recorded ${[...colours].join(', ')}`)
  has('callout', (h) => !classes(h).has('kg-callout-emoji'), 'callout without an emoji')
  for (const a of ['left', 'center']) has('button', (h) => classes(h).has(`kg-align-${a}`), `${a}-aligned button`)
  for (const [c, what] of [['kg-product-card-rating', 'rating'], ['kg-product-card-button', 'button'], ['kg-product-card-image', 'image']]) {
    has('product', (h) => classes(h).has(c), `product with ${what}`)
    has('product', (h) => !classes(h).has(c), `product without ${what}`)
  }
  for (const w of ['regular', 'wide', 'full']) has('header_v2', (h) => classes(h).has(`kg-width-${w}`) && !classes(h).has('kg-layout-split'), `${w} header`)
  has('header_v2', (h) => classes(h).has('kg-layout-split') && !classes(h).has('kg-swapped'), 'split header')
  has('header_v2', (h) => classes(h).has('kg-swapped'), 'swapped header')
  for (const w of ['regular', 'wide', 'full']) has('signup', (h) => classes(h).has(`kg-width-${w}`) && !classes(h).has('kg-layout-split'), `${w} signup`)
  has('signup', (h) => classes(h).has('kg-layout-split'), 'split signup')
  const grounds = new Set(of('cta').flatMap((h) => [...classes(h)].filter((c) => /^kg-cta-bg-/.test(c))))
  assert.equal(grounds.size, 9, `cta ×9 backgrounds — recorded ${[...grounds].join(', ')}`)
  for (const [c, what] of [['kg-cta-minimal', 'minimal'], ['kg-cta-immersive', 'immersive']]) {
    has('cta', (h) => classes(h).has(c) && classes(h).has('kg-cta-has-img'), `${what} with image`)
    has('cta', (h) => classes(h).has(c) && !classes(h).has('kg-cta-has-img'), `${what} without image`)
  }
  has('cta', (h) => classes(h).has('kg-cta-no-dividers'), 'cta without dividers')
  has('cta', (h) => classes(h).has('kg-cta-sponsor-label'), 'cta with sponsor label')
  has('cta', (h) => !classes(h).has('kg-cta-sponsor-label'), 'cta without sponsor label')
  const text = (h: string, c: string) => new RegExp(`class="${c}">[^<]+<`).test(h)
  for (const t of [true, false]) for (const c of [true, false]) {
    has('file', (h) => text(h, 'kg-file-card-title') === t && text(h, 'kg-file-card-caption') === c, `file ${t ? 'with' : 'without'} title, ${c ? 'with' : 'without'} caption`)
  }
  has('toggle', (h) => /data-kg-toggle-state="close"/.test(h), 'toggle (the renderer emits it closed; toggle.js opens it)')
  for (const c of [true, false]) has('code', (h) => cap(h) === c, `code ${c ? 'with' : 'without'} caption`)
  for (const t of [true, false]) for (const c of [true, false]) {
    has('bookmark', (h) => classes(h).has('kg-bookmark-thumbnail') === t && cap(h) === c, `bookmark ${t ? 'with' : 'without'} thumbnail, ${c ? 'with' : 'without'} caption`)
  }
})

// C4's "What the fixture covers" card (`C Post Body.dc.html:1913-1929`), CARDS and ABSENT rows, as drawn.
// `image` there is the feature image, which the post head draws rather than a kg-image-card; `nft` has no
// Lexical renderer on either major (DW-101, asserted above from the recording).
const C4_CARDS = ['callout', 'bookmark', 'blockquote', 'toggle', 'table', 'code', 'image', 'gallery', 'audio', 'video', 'embed', 'file', 'product', 'button', 'nft', 'divider', 'signup']
const C4_ABSENT = ['header', 'header_v2', 'gif', 'markdown', 'html', 'email', 'email-cta', 'paywall']

test('C4 — the readable article: one of each, C4\'s CARDS and ABSENT rows, three H2s and one H3, no paywall', () => {
  const order = articleOrder().filter((x): x is string => x !== null)
  const cards = order.map((id) => variants().find((v) => v.id === id)?.card)
  assert.equal(new Set(cards).size, cards.length, `a card appears twice in the article: ${cards.join(', ')}`)
  const drawn = C4_CARDS.filter((c) => c !== 'image' && c !== 'nft').sort()
  assert.deepEqual(cards.filter((c) => c !== 'list').sort(), drawn, "the article's cards are not C4's CARDS row (less the feature image and the NFT card)")
  for (const c of C4_ABSENT) assert.ok(!cards.includes(c), `C4's ABSENT row: ${c} belongs to the sheet or nowhere`)
  const body = styleGuideBody('6')
  // the one `<!--kg-card-begin: html-->` in the article is the TABLE: Ghost has no table node, so a table IS an
  // HTML card, which is how C4 can list "table" under CARDS and "HTML" under ABSENT at once
  assert.equal((body.match(/kg-card-begin: html/g) ?? []).length, 1, "C4's ABSENT row: the table is the only HTML card in the article")
  assert.ok(!/kg-header-card|kg-card-begin: markdown/.test(body), "C4's ABSENT row: no header or markdown card in the article")
  // the article's own headings — a card's heading (the signup card's h2) is the card's, not the TOC's
  const prose = blocks('6', 'article').filter((b) => b.id === null).map((b) => b.html).join('')
  assert.equal((prose.match(/<h2[\s>]/g) ?? []).length, 3)
  assert.equal((prose.match(/<h3[\s>]/g) ?? []).length, 1)
  assert.ok(!/kg-paywall|<!--members-only-->/.test(body), 'the paywall has its own canvas (C3)')
  assert.ok(/<code>/.test(body) && /<a href=/.test(body) && /<ul>/.test(body), 'TEXT: inline code, an inline link and a bulleted list')
  for (const w of ['kg-width-wide', 'kg-width-full']) assert.ok(classes(body).has(w), `WIDTHS: ${w}`)
})

// ─── fixture 2, and the seam ──────────────────────────────────────────────────

test('fixture 2 — the comments block states its count, carries its threads, and draws both states', () => {
  const member = commentsFixture('member')
  const out = commentsFixture('signedout')
  assert.ok(commentCount() > commentThreads(), 'no thread carries a reply')
  assert.equal((member.match(/♡/g) ?? []).length, commentCount(), 'the drawn comments are not the stated count')
  assert.ok(/border:1px dashed/.test(member), "the dashed outline: the theme styles nothing inside Ghost's block")
  assert.ok(/Join the discussion/.test(member) && !/start commenting/.test(member))
  assert.ok(/start commenting/.test(out) && !/Join the discussion/.test(out))
  assert.ok(!/<script/i.test(member + out))
})

test('`{{content}}` with no fixture still REFUSES by name; with the preview fixtures it is the article', () => {
  assert.throws(() => bareHelper('content', {}), /FR-H3/)
  assert.throws(() => bareHelper('comments', {}), /FR-H3/)
  const fixtures = previewFixtures('6')
  assert.equal(bareHelper('content', { fixtures }), styleGuideBody('6'))
  assert.equal(bareHelper('comments', { fixtures }), commentsFixture('member'))
})

// ─── the simulated cards.min.css ──────────────────────────────────────────────

test('the simulated bundle is exactly the complement of the derived exclude list', () => {
  const chunks = ['video', 'audio', 'callout', 'header', 'header_v2', 'toggle']
  assert.deepEqual(simulatedChunks(chunks, []), ['audio', 'callout', 'header', 'header_v2', 'toggle', 'video'], 'nothing designed: every chunk, in build order')
  assert.deepEqual(cardAssetsExclude(chunks, ['header']), ['header', 'header_v2'], 'header and header_v2 are separate names — designing one excludes both')
  assert.deepEqual(simulatedChunks(chunks, ['callout', 'image']), ['audio', 'header', 'header_v2', 'toggle', 'video'], 'a designed card with no chunk excludes nothing')
  for (const designed of [[], ['toggle'], ['header_v2', 'video']]) {
    const inc = simulatedChunks(chunks, designed)
    const exc = cardAssetsExclude(chunks, designed)
    assert.deepEqual([...inc, ...exc].sort(), [...chunks].sort())
    assert.ok(inc.every((c) => !exc.includes(c)))
  }
})

// ─── Story 5.13 — the preview subject (FR-D22) ────────────────────────────────
//
// The I/O matrix's rows over the PURE half. The pill, the menu and the write are `apps/web`'s
// (`preview-subject.test.ts` and the deployed walk); what is asserted here is the resolution and the render.
//
// THE CONTROL IS THE FIRST TEST AND IT IS THE WHOLE STORY'S: `templateContext(target, feed)` with no third
// argument answers exactly what it answered before this story, so `/pilots`, `tools/check-snapshots.mjs`
// (NFR-6(c1)) and the render matrix are untouched. Its BYTE-level half is `node tools/check-snapshots.mjs`,
// which calls this function with two arguments and compares every committed snapshot.

/** Every template file the library has an opinion about, derived from `placement.ts`'s own table rather than
 *  listed — a template added later joins this walk by construction (standing rule 4). */
const FILES = [...NATIVE_FILES, 'custom-signup.hbs'] // + one custom route, which has no row by design

test('THE CONTROL — with no subject passed, templateContext answers exactly what it answered before this story', () => {
  for (const target of FILES) {
    for (const feed of ['first', 'middle', 'last', 'empty'] as const) {
      const ctx = templateContext(target, feed)
      assert.deepEqual(ctx, templateContext(target, feed, undefined), `${target}/${feed}: undefined is not the same as absent`)
      assert.deepEqual(ctx, templateContext(target, feed, null), `${target}/${feed}: null is not the same as absent`)
      if (target === 'post.hbs' || target === 'page.hbs') {
        // the hard-coded fixture, spread FLAT — §3a's wrapper is the shim's, not this context's
        assert.equal(ctx.ghost['slug'], subject(target === 'post.hbs' ? 'post' : 'page').slug)
      }
      if (target === 'tag.hbs' || target === 'author.hbs') {
        // and the archives still get the WHOLE bundled feed, with no taxonomy object: today's behaviour, wrong
        // on its own terms and deliberately unchanged where nothing states a subject
        assert.equal(ctx.ghost['tag'], undefined, `${target}: an unstated subject must not invent a taxonomy`)
        assert.equal(ctx.ghost['author'], undefined)
        assert.deepEqual(ctx.ghost['pagination'], templateContext('home.hbs', feed).ghost['pagination'], `${target}: not the feed's own pagination`)
      }
    }
  }
})

test('a canvas has a subject exactly where the NATIVE table gives it a singular resource — derived, never listed', () => {
  for (const file of FILES) {
    const native = nativeResourceOf(file)
    assert.equal(fixtureSubject(file) === null, native === null, file)
    assert.equal(subjectKindOf(file) === null, native === null, file)
  }
  // §4.2's one distinction a RESOURCE cannot draw: page.hbs carries the same `post` object and is a different
  // product, and the two fixtures are two different rows
  assert.equal(nativeResourceOf('page.hbs'), nativeResourceOf('post.hbs'))
  assert.equal(subjectKindOf('post.hbs'), 'post')
  assert.equal(subjectKindOf('page.hbs'), 'page')
})

test('untouched, every canvas with a subject gets its fixture — the style-guide post and page, and the fixed archives', () => {
  assert.deepEqual(fixtureSubject('post.hbs'), { kind: 'post', slug: subject('post').slug })
  assert.deepEqual(fixtureSubject('page.hbs'), { kind: 'page', slug: subject('page').slug })
  assert.deepEqual(fixtureSubject('tag.hbs'), { kind: 'tag', slug: subject('tag').slug })
  assert.deepEqual(fixtureSubject('author.hbs'), { kind: 'author', slug: subject('author').slug })
  // the two archive fixtures are rows that REALLY EXIST, which is what lets their archives fill
  assert.ok(tags().some((t) => t.slug === subject('tag').slug))
  assert.ok(authors().some((a) => a.slug === subject('author').slug))
  // and each was chosen for coverage: a full first page. The counts are DERIVED (standing rule 4).
  assert.ok(subject('tag').count.posts > postsPerPage(), 'the fixture tag must fill a first page and have a second')
  assert.ok(subject('author').count.posts > 0)
  // resolving with nothing stored is the fixture, and nothing fell back
  for (const file of FILES) {
    assert.deepEqual(resolveSubject(file), { subject: fixtureSubject(file), fellBack: false }, file)
    assert.deepEqual(resolveSubject(file, null), { subject: fixtureSubject(file), fellBack: false }, file)
  }
})

test('an archive renders ITS OWN posts, with a pagination sized on those rows and the taxonomy object at the root', () => {
  for (const [file, kind] of [['tag.hbs', 'tag'], ['author.hbs', 'author']] as const) {
    const of = fixtureSubject(file) as Subject
    const ctx = templateContext(file, 'first', of)
    const rows = ctx.ghost['posts'] as { slug: string }[]
    const pagination = ctx.ghost['pagination'] as { total: number; pages: number; limit: number }
    // §3: the taxonomy object at the root, `posts` and `pagination` flat beside it
    const taxonomy = ctx.ghost[kind] as { slug: string; count: { posts: number } }
    assert.equal(taxonomy.slug, of.slug)
    // EXACTLY the rows carrying it — the same set the hydrated count derives, never a subset and never the feed
    const mine = posts().filter((p) => (kind === 'tag' ? p.tags : p.authors).some((r) => r.slug === of.slug))
    assert.ok(mine.length > 0 && mine.length < posts().length, 'the fixture must be a real, proper subset')
    assert.equal(pagination.total, mine.length)
    assert.equal(pagination.total, taxonomy.count.posts, 'the pagination and the hydrated count must agree')
    assert.equal(pagination.pages, Math.max(1, Math.ceil(mine.length / postsPerPage())))
    assert.deepEqual(rows.map((r) => r.slug), mine.slice(0, pagination.limit).map((r) => r.slug))
    // and the LAST page is the remainder of those rows, never the feed's
    const last = templateContext(file, 'last', of)
    assert.equal((last.ghost['pagination'] as { page: number }).page, pagination.pages)
    assert.deepEqual(
      (last.ghost['posts'] as { slug: string }[]).map((r) => r.slug),
      mine.slice((pagination.pages - 1) * pagination.limit).map((r) => r.slug),
    )
    // the site half carries the same pagination the pager reads
    assert.deepEqual(ctx.site.pagination, pagination)
  }
})

test('choosing a subject changes the row the canvas renders — and never the body', () => {
  const chosen = posts().find((p) => p['feature_image'] === null || p['feature_image'] === undefined) ?? posts()[posts().length - 1]
  const ctx = templateContext('post.hbs', 'first', { kind: 'post', slug: chosen.slug })
  assert.equal(ctx.ghost['slug'], chosen.slug)
  assert.equal(ctx.ghost['title'], chosen.title)
  assert.notEqual(ctx.ghost['slug'], subject('post').slug)
  // FR-H8's structural claim, at the data: the two subjects differ by WHETHER the field is there at all
  const withImage = posts().find((p) => typeof p['feature_image'] === 'string')
  assert.ok(withImage !== undefined)
  assert.equal(typeof templateContext('post.hbs', 'first', { kind: 'post', slug: withImage.slug }).ghost['feature_image'], 'string')
  // `{{content}}` is never read from the row — the style-guide fixture is the body for every subject (Story 4.4)
  assert.equal(previewFixtures('6').content, styleGuideBody('6'))
})

test('a subject that is gone falls back to the fixture and SAYS SO — and the canvas is never empty', () => {
  const bad: Subject[] = [
    { kind: 'post', slug: 'no-such-post' },
    { kind: 'tag', slug: 'no-such-tag' },
    { kind: 'author', slug: 'no-such-author' },
  ]
  for (const stored of bad) {
    const file = stored.kind === 'post' ? 'post.hbs' : `${stored.kind}.hbs`
    const answer = resolveSubject(file, stored)
    assert.deepEqual(answer, { subject: fixtureSubject(file), fellBack: true }, JSON.stringify(stored))
  }
  // WRONG KIND for the file — a post subject stored under the tag canvas — is the same answer
  assert.deepEqual(resolveSubject('tag.hbs', { kind: 'post', slug: subject('post').slug }), { subject: fixtureSubject('tag.hbs'), fellBack: true })
  assert.deepEqual(resolveSubject('post.hbs', { kind: 'page', slug: subject('page').slug }), { subject: fixtureSubject('post.hbs'), fellBack: true })
  // a PAGE has no feed: a feed post's slug stored under `page` names no page (review, 2026-09-21)
  assert.deepEqual(resolveSubject('page.hbs', { kind: 'page', slug: posts()[0]!.slug }), { subject: fixtureSubject('page.hbs'), fellBack: true })
  // a canvas with no subject at all never reports a fallback, whatever is stored against it
  assert.deepEqual(resolveSubject('home.hbs', { kind: 'post', slug: 'anything' }), { subject: null, fellBack: false })
  // and the render door itself never empties: a slug nothing holds still draws the fixture
  assert.equal(templateContext('post.hbs', 'first', { kind: 'post', slug: 'no-such-post' }).ghost['slug'], subject('post').slug)
  const ghost = templateContext('tag.hbs', 'first', { kind: 'tag', slug: 'no-such-tag' }).ghost
  assert.equal((ghost['tag'] as { slug: string }).slug, subject('tag').slug)
  assert.ok((ghost['posts'] as unknown[]).length > 0, 'the fallback archive must not be empty')
})

// ─── Story 5.16 — page 2, and the page's own address (FR-D21, R-176, DW-218) ───────────────────────────────────
//
// `second` is PAGE 2 of the list a target renders, and `feedPages` is the one question the editor asks before it
// offers one. Every expectation is DERIVED from the dataset's own rows and `posts_per_page` — no page count, post
// count or slug of a row is written down here, beyond the fixture subjects the library itself names.

const tagOf = (slug: string): Subject => ({ kind: 'tag', slug })
const authorOf = (slug: string): Subject => ({ kind: 'author', slug })
const pagesOf = (total: number) => Math.max(1, Math.ceil(total / postsPerPage()))

test('`second` on the home feed is page 2 of the bundled feed: its own rows, and BOTH links (FR-D21\'s middle page)', () => {
  for (const target of ['home.hbs', 'index.hbs']) {
    const ctx = templateContext(target, 'second')
    const pagination = ctx.ghost['pagination'] as { page: number; pages: number }
    assert.deepEqual(pagination, feedPagination(2), target)
    assert.deepEqual((ctx.ghost['posts'] as { slug: string }[]).map((p) => p.slug), feedPage(2).map((p) => p.slug), target)
    const pager = paginationContext(pagination)
    assert.ok(pager.prev !== null && pager.next !== null, `${target}: page 2 of the feed must carry a Newer and an Older link`)
    assert.ok(pagination.pages > 2, 'the control: the feed must run past page 2 for page 2 to be a middle page')
    assert.deepEqual(ctx.site.pagination, pagination)
  }
  // and it is NOT `middle`, which is the feed's own middle page — page 3 of five
  assert.notDeepEqual(templateContext('index.hbs', 'second').ghost['pagination'], templateContext('index.hbs', 'middle').ghost['pagination'])
})

test('an archive\'s `second` is ITS OWN page 2, and throws where the archive has one page (R-176)', () => {
  // every tag, derived: a tag with a second page renders its own remainder; one without has no page 2 to render
  for (const t of tags()) {
    const of = tagOf(t.slug)
    const mine = posts().filter((p) => p.tags.some((r) => r.slug === t.slug))
    if (pagesOf(mine.length) < 2) {
      assert.throws(() => templateContext('tag.hbs', 'second', of), /page 2 does not exist/, `${t.slug} has no page 2`)
      continue
    }
    const ctx = templateContext('tag.hbs', 'second', of)
    const pagination = ctx.ghost['pagination'] as { page: number; pages: number; total: number; limit: number }
    assert.equal(pagination.page, 2)
    assert.equal(pagination.total, mine.length)
    assert.deepEqual(
      (ctx.ghost['posts'] as { slug: string }[]).map((p) => p.slug),
      mine.slice(pagination.limit, 2 * pagination.limit).map((p) => p.slug),
      t.slug,
    )
    assert.equal((ctx.ghost['tag'] as { slug: string }).slug, t.slug)
  }
  // the fixture tag is the one the Tag canvas opens on: two pages, so its page 2 is its LAST — a Newer and no Older
  const fixture = templateContext('tag.hbs', 'second', fixtureSubject('tag.hbs'))
  const pager = paginationContext(fixture.ghost['pagination'] as Record<string, unknown>)
  assert.equal(pager.page, pager.pages, 'the fixture tag\'s page 2 is its last page')
  assert.ok(pager.prev !== null && pager.next === null)
  // every writer's archive fits on one page, so no Author canvas can render a page 2
  for (const a of authors()) assert.throws(() => templateContext('author.hbs', 'second', authorOf(a.slug)), /page 2 does not exist/, a.slug)
})

test('`feedPages` agrees with the rows on every tag and every writer, and is 1 where nothing paginates', () => {
  for (const t of tags()) assert.equal(feedPages('tag.hbs', tagOf(t.slug)), pagesOf(t.count.posts), t.slug)
  for (const a of authors()) {
    assert.equal(feedPages('author.hbs', authorOf(a.slug)), pagesOf(a.count.posts), a.slug)
    // R-176's premise, stated as the data: no writer reaches a second page, so no Author page offers one
    assert.equal(feedPages('author.hbs', authorOf(a.slug)), 1, a.slug)
  }
  for (const target of ['home.hbs', 'index.hbs']) assert.equal(feedPages(target), feedPagination(1).pages, target)
  // the same answer `templateContext` renders from — the pages it counts are the pages it draws
  for (const t of tags()) {
    assert.equal((templateContext('tag.hbs', 'first', tagOf(t.slug)).ghost['pagination'] as { pages: number }).pages, feedPages('tag.hbs', tagOf(t.slug)))
  }
  for (const target of ['default.hbs', 'post.hbs', 'page.hbs', 'error.hbs', 'private.hbs', 'custom-signup.hbs']) {
    assert.equal(feedPages(target), 1, target)
  }
  // a subject of the wrong kind is no archive: the tag canvas with no tag subject is the whole feed, as it renders
  assert.equal(feedPages('tag.hbs', authorOf(authors()[0]!.slug)), feedPagination(1).pages)
})

test('DW-218: every page of a list knows its OWN address, and the pager is based on the list it sits on', () => {
  const home = (feed: 'first' | 'second') => templateContext('home.hbs', feed).site
  assert.equal(home('first').currentUrl, '/')
  assert.equal(templateContext('index.hbs', 'second').site.currentUrl, '/page/2/')
  assert.equal(home('first').paginationBase, '/')
  const fixture = fixtureSubject('tag.hbs') as Subject
  const archive = `/tag/${fixture.slug}/`
  const one = templateContext('tag.hbs', 'first', fixture).site
  const two = templateContext('tag.hbs', 'second', fixture).site
  assert.equal(one.currentUrl, archive)
  assert.equal(two.currentUrl, `${archive}page/2/`)
  assert.equal(one.paginationBase, archive)
  const writer = fixtureSubject('author.hbs') as Subject
  assert.equal(templateContext('author.hbs', 'first', writer).site.currentUrl, `/author/${writer.slug}/`)
  // THE ADDRESS IS GHOST'S RULE, the one the shim's `pageUrl` already is: page 1 is the list itself, page n beneath it
  for (const [ctx, n] of [[one, 1], [two, 2]] as const) assert.equal(ctx.currentUrl, pageUrl(n, ctx.paginationBase))
  // `meta/paginated-url.js`, read on both majors: on page 2 the Newer link is the list itself, the Older link page 3
  const feed2 = templateContext('index.hbs', 'second').site
  const at2 = paginationContext(feed2.pagination as Record<string, unknown>)
  assert.equal(pageUrl(at2.prev, feed2.paginationBase), '/')
  assert.equal(pageUrl(at2.next, feed2.paginationBase), '/page/3/')
  assert.equal(pageUrl(paginationContext(two.pagination as Record<string, unknown>).prev, two.paginationBase), archive)
  // every other target keeps `/` (Post, Page and 404 are a later story's — a DW)
  for (const target of ['default.hbs', 'post.hbs', 'page.hbs', 'error.hbs']) assert.equal(templateContext(target, 'first').site.currentUrl, '/', target)
})

test('`{{navigation}}` marks what Ghost marks on that address — `nav-current` on an exact match only (`utils.js:61`)', () => {
  const current = (url: string) =>
    navigationItems(site().navigation as { label?: unknown; url?: unknown }[], { currentUrl: url, siteUrl: site().url }).filter((i) => i.current).map((i) => i.label)
  const home = site().navigation.find((i) => i.url === '/')
  assert.ok(home, 'the control: the bundled menu carries a `/` item for any of this to be about')
  assert.deepEqual(current(templateContext('home.hbs', 'first').site.currentUrl), [home.label], 'page 1 of Home marks Home')
  assert.deepEqual(current(templateContext('index.hbs', 'second').site.currentUrl), [], '/page/2/ marks nothing — the `/` item gets nav-home alone')
  // an archive's page 1 marks its own item where the menu has one, and Home never
  const fixture = fixtureSubject('tag.hbs') as Subject
  const own = site().navigation.filter((i) => i.url === `/tag/${fixture.slug}/`).map((i) => i.label)
  assert.deepEqual(current(templateContext('tag.hbs', 'first', fixture).site.currentUrl), own)
  const menuTag = site().navigation.find((i) => /^\/tag\/[^/]+\/$/.test(i.url))
  if (menuTag) {
    const slug = menuTag.url.split('/')[2]!
    assert.deepEqual(current(templateContext('tag.hbs', 'first', tagOf(slug)).site.currentUrl), [menuTag.label], `${slug}'s archive marks its own item`)
  }
})

test('THE CONTROL, again — no caller of the four review states is moved by `second`: /pilots, the snapshots and the matrix', () => {
  // the four states still answer their own pages on the feed; `second` is an addition beside them, never a rename
  const page = (feed: 'first' | 'middle' | 'last' | 'empty') => (templateContext('index.hbs', feed).ghost['pagination'] as { page: number }).page
  const pages = feedPagination(1).pages
  assert.deepEqual([page('first'), page('middle'), page('last'), page('empty')], [1, Math.ceil(pages / 2), pages, 1])
  // and with no subject an archive is still the whole feed on every one of them, as Story 5.13 left it
  for (const feed of ['first', 'middle', 'last', 'empty'] as const) {
    assert.deepEqual(templateContext('tag.hbs', feed).ghost['posts'], templateContext('home.hbs', feed).ghost['posts'], feed)
    assert.equal(templateContext('tag.hbs', feed).site.paginationBase, '/', feed)
  }
})
