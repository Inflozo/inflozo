import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CARDS, cardChanges } from '@inflozo/library'
import { iconDrawing } from '@inflozo/library/icons'
import { CARD_WORDS, cardOrFirst, customisedCount, FIRST_CARD, parseStoredCards, resetSentence } from './lib/cards.ts'
import { CARDS_KEY } from './lib/journal.ts'
import { CANVASES, isCards, isPaywall, isSurface, SURFACES_HEADING } from './lib/editor.ts'

/* Story 7.13 — Editor cards' words (`CARD_WORDS`, R-170, standing rule 4) and the sync route's card door, held where
   `node --test` reaches them. The registry itself is `packages/library/src/cards.test.ts`'s; the vendored directory the
   registry's chunk names are held to is `style-guide.test.ts`'s. */

const ROUTE = readFileSync(join(import.meta.dirname, 'app', '(app)', 'app', '(authed)', 'projects', '[id]', 'sync', 'route.ts'), 'utf8')

test('(7.13) one name for the surface — "Editor cards" on the switcher row — in the Template surfaces group, after Paywall', () => {
  assert.equal(CARD_WORDS.label, 'Editor cards')
  assert.equal(CANVASES.cards.label, CARD_WORDS.label)
  assert.equal(CANVASES.cards.caption, CARD_WORDS.caption)
  assert.equal(SURFACES_HEADING, 'Template surfaces')
  assert.ok(isSurface('cards') && isCards('cards') && !isPaywall('cards'))
})

test('(7.13) the words the owner\'s manual test reads, word for word (steps 2, 6, 10 and 11)', () => {
  assert.equal(CARD_WORDS.noColour, "Header, signup and call-to-action cards offer no colour controls — authors set those inline in Ghost's editor.")
  assert.equal(CARD_WORDS.none['cta'], "Its colours, layout and button are the author's, set per post in Ghost.")
  assert.equal(CARD_WORDS.resetTitle('Callout'), "Reset Callout to Ghost's default?")
  assert.equal(resetSentence({ callout: { colours: 'tokens', background: 'tint' } }, 'callout'),
    'Removes your 2 changes — colours and background — everywhere callouts appear. Posts keep their content.')
  // S14c's own sentence, three changes
  assert.equal(resetSentence({ callout: { colours: 'tokens', emoji: 'off', 'emoji-size': 'large' } }, 'callout'),
    'Removes your 3 changes — colours, emoji and emoji size — everywhere callouts appear. Posts keep their content.')
  assert.equal(CARD_WORDS.resetBody(1, ['emoji'], 'callouts'), 'Removes your 1 change — emoji — everywhere callouts appear. Posts keep their content.')
  assert.equal(CARD_WORDS.count(1), '1 customised card')
  assert.equal(CARD_WORDS.count(2), '2 customised cards')
})

test('(7.13) every card with nothing of its own has its one line, and no card with a panel has one; every greyed control has its reason', () => {
  for (const c of CARDS) {
    const none = CARD_WORDS.none[c.key]
    assert.equal(none !== undefined, c.controls.length === 0, `${c.key}: a one-line card is exactly one with no controls`)
    for (const x of c.controls) {
      if (x.greyedWhile === undefined) continue
      assert.ok((CARD_WORDS.greyed[`${c.key}.${x.name}`] ?? '').trim().length > 0, `${c.key}.${x.name} is greyed with no reason (P0-0)`)
    }
  }
  // and no reason names a control that is never greyed
  for (const key of Object.keys(CARD_WORDS.greyed)) {
    const [card, control] = key.split('.')
    assert.ok(CARDS.find((c) => c.key === card)?.controls.find((x) => x.name === control)?.greyedWhile !== undefined, key)
  }
})

test('(7.13) R-170: no sentence says CTA, and the call-to-action card is "Call to action"', () => {
  const words = JSON.stringify(CARD_WORDS) + JSON.stringify(CARDS.map((c) => [c.label, c.controls.map((x) => [x.label, x.values.map((v) => v.label)])]))
  assert.doesNotMatch(words, /\bCTA\b/)
  assert.equal(CARDS.find((c) => c.key === 'cta')?.label, 'Call to action')
})

test('(7.13) the surface opens on the last card viewed, else Callout; the count is the customised cards', () => {
  assert.equal(FIRST_CARD, 'callout')
  assert.equal(cardOrFirst(null).key, 'callout')
  assert.equal(cardOrFirst('nft').key, 'callout', 'an unknown key is the first card')
  assert.equal(cardOrFirst('toggle').key, 'toggle')
  assert.equal(customisedCount({}), 0)
  assert.equal(customisedCount({ callout: { emoji: 'off' }, toggle: { chevron: 'left' } }), 2)
  assert.equal(cardChanges({ callout: { emoji: 'off' } }, 'callout').count, 1)
})

test('(7.13) the sync route parses the card designs with their one schema BEFORE the lock read and the write, answers 422 "Not a card design", and hands the parsed record to the RPC', () => {
  const refused = ROUTE.indexOf("no(422, 'Not a card design')")
  assert.ok(refused > 0 && ROUTE.includes('await parseStoredCards(cards)'), 'the route no longer parses the record through the icon set\'s judge')
  assert.ok(ROUTE.indexOf('await parseStoredCards(cards)') < refused, 'the 422 is not the parse\'s answer')
  assert.ok(refused < ROUTE.indexOf(".from('edit_locks')") && refused < ROUTE.indexOf("rpc('sync_project_doc'"), 'refused only after a read or a write')
  assert.match(ROUTE, /p_cards: parsedCards \?\? null/, 'the parsed record reaches the RPC, or null')
  // the read-back compare reads the stored record, as it reads the own packs
  assert.match(ROUTE, /from\('project_treatments'\)\.select\('card_designs'\)/)
  // and the journal key is no template key: the route's TEMPLATE_KEY refuses it
  const pattern = /const TEMPLATE_KEY = \/(.+)\/\n/.exec(ROUTE)?.[1]
  assert.ok(pattern !== undefined && !new RegExp(pattern).test(CARDS_KEY) && !new RegExp(pattern).test('cards'))
})

test('(7.13) parseStoredCards judges a divider\'s glyph by the icon set, before the write: an undrawn name refused with the parser\'s sentence, a drawn one kept (the control), and a record naming no glyph never loads the set', async () => {
  const undrawn = 'zz-no-such-icon'
  assert.equal(iconDrawing(undrawn), undefined, 'the control for the refusal: the set really draws no such name')
  assert.notEqual(iconDrawing('leaf'), undefined, 'the control for the kept record: the set draws leaf')
  const said = await parseStoredCards({ divider: { glyph: 'on', icon: undrawn } })
  assert.equal(typeof said, 'string')
  assert.match(said as string, /Divider's Glyph to a value it does not offer, so none of them was read/)
  assert.deepEqual(await parseStoredCards({ divider: { glyph: 'on', icon: 'leaf' } }), { divider: { glyph: 'on', icon: 'leaf' } })
  // the set is the import's to load, and only for a record that names a glyph
  let loads = 0
  const load = async () => { loads += 1; return { iconDrawing } }
  assert.deepEqual(await parseStoredCards({ callout: { emoji: 'off' }, divider: { glyph: 'on' } }, load), { callout: { emoji: 'off' }, divider: { glyph: 'on' } })
  assert.deepEqual(await parseStoredCards(null, load), {})
  assert.equal(loads, 0, 'a record naming no glyph loaded the icon set')
  assert.equal(typeof (await parseStoredCards({ divider: { icon: undrawn } }, load)), 'string')
  assert.equal(loads, 1, 'the control: a record naming a glyph loads it once')
  // a refusal the grammar alone makes needs no set either way, and still refuses
  assert.equal(typeof (await parseStoredCards({ nft: {} }, load)), 'string')
})
