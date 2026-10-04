import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_PRESET, otherPreset, PACK_WORDS } from './lib/pack-switch.ts'
import { NO_RING_MOVES, NOTHING_TO_REMIX, REROLL_WHAT, remixBothAsk, remixPackAsk, remixPackSaid, REMIX_CHOICES } from './lib/remix.ts'

/* STORY 6.3 — the switch's pure rows: Remix's pack re-roll and the one word list (R-170). The gestures — the press, the
   crossfade, the pill, ⌘Z — are the keyboard journey's and the deployed walk's. Nothing below is a count written down: the
   ids are a list made here for the draw, never the presets (those are the server's, `lib/style-pack.ts`). */

const IDS = ['paper', 'ink', 'tangerine', 'mono', 'neon']

test('otherPreset never answers the pack in force, and reaches every other one', () => {
  for (const current of IDS) {
    const reached = new Set<string>()
    // the draw's whole range, in even steps: `random` is handed in (AD-1), so every outcome is reachable on purpose
    for (let n = 0; n < 100; n += 1) {
      const to = otherPreset(IDS, current, () => n / 100)
      assert.notEqual(to, current, `${current} answered itself`)
      if (to !== null) reached.add(to)
    }
    assert.deepEqual([...reached].sort(), IDS.filter((id) => id !== current).sort(), `${current}: every other pack is reachable`)
  }
  // the control: nowhere to go is null, never the pack in force
  assert.equal(otherPreset(['paper'], 'paper', () => 0.5), null)
  assert.equal(otherPreset(IDS, 'harbor', () => 0.5), null, 'a pack the list does not hold has nowhere to go')
})

test('the words: one name, the pill and the announcement — and Paper is the default', () => {
  assert.equal(DEFAULT_PRESET, 'paper')
  assert.equal(PACK_WORDS.name, 'Style Pack')
  assert.equal(PACK_WORDS.trying('Tangerine'), 'Trying on Tangerine…')
  assert.equal(PACK_WORDS.said('Tangerine'), 'Style Pack — Tangerine')
  // R-170: Remix's group says the same name the panel does
  assert.equal(REROLL_WHAT, 'Re-roll what')
  assert.deepEqual(REMIX_CHOICES.map((c) => c.label), [PACK_WORDS.name, 'Designs', 'Both'])
})

test('Remix\'s pack sentences, singular and plural — and the greyed reason is the nothing-to-remix sentence\'s own words', () => {
  assert.match(remixPackAsk, /^Re-rolls the Style Pack to a different one\. Every section keeps its design, its words and its settings — only the look changes\.$/)
  assert.equal(remixBothAsk(1, 'Home'), 'Re-rolls the Style Pack, and 1 section on Home to a different design in its own category. Your text, images and settings stay.')
  assert.equal(remixBothAsk(3, 'Home'), 'Re-rolls the Style Pack, and 3 sections on Home to a different design in its own category. Your text, images and settings stay.')
  assert.equal(remixPackSaid('Neon'), 'Remixed the Style Pack — Neon.')
  assert.equal(remixPackSaid('Neon', 1, 'Home'), 'Remixed the Style Pack — Neon — and 1 section on Home.')
  assert.equal(remixPackSaid('Neon', 4, 'Post'), 'Remixed the Style Pack — Neon — and 4 sections on Post.')
  // the reason Designs and Both are greyed is NOTHING_TO_REMIX's own words, without its "nothing to remix yet"
  assert.equal(NO_RING_MOVES, 'Every section here is the only design its category has so far. More are coming.')
  assert.ok(NOTHING_TO_REMIX.startsWith(NO_RING_MOVES.split('.')[0]!) && NOTHING_TO_REMIX.endsWith('More are coming.'))
})
