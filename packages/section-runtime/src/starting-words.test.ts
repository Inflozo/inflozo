import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDoc } from './doc-schema.ts'
import { untouchedWords, type StartingEntry } from './starting-words.ts'

// Story 7.12 — Question 1, ruled option 1: the sections whose own starting words were never retyped. Each row below is
// the legitimate twin of the one it is kept apart from, so a rule that stopped telling them apart fails here.

const THREE_UP: StartingEntry = {
  name: 'Three Up',
  html: '<section><p data-prop="eyebrow"></p><h2 data-prop="title"></h2><a data-prop="linkLabel"></a>' +
    '<p data-prop="emptyHeading"></p><p data-prop="unprinted-no"></p><ul data-items="items"><li data-prop="items[].label"></li></ul></section>',
  contentSchema: {
    eyebrow: { type: 'text', label: 'Eyebrow', default: 'The archive' },
    title: { type: 'richtext', label: 'Title', default: 'Everything published this spring' },
    linkLabel: { type: 'text', label: 'Link text', default: 'Browse the archive' },
    // a catalog label is Translations' own row, never a starting word
    emptyHeading: { type: 'text', label: 'Empty heading', catalog: 'archive.empty_heading' },
    // a prop the markup never prints is not on the page
    unprinted: { type: 'text', label: 'Unprinted', default: 'Never shown' },
    items: { type: 'array', label: 'Items' },
    'items[].label': { type: 'text', label: 'Item', default: 'An item' },
  },
}
const library = (id: string) => (id === 'a17/1' ? THREE_UP : undefined)

const instance = (instanceId: string, content: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
  ({ instanceId, layerName: '', designId: 'a17/1', content, controls: {}, data: {}, darkOverrides: {}, ...extra })

test('an untouched section lists its starting words in markup order, under its layer name or its design name', () => {
  const docs = {
    'home.hbs': parseDoc({
      schemaVersion: 1,
      instances: [
        instance('fresh', { eyebrow: 'The archive', title: 'Everything published this spring', linkLabel: 'Browse the archive' }, { layerName: 'Spring' }),
        // retyped words are the customer's; marks alone leave the English words as they were; a missing value is the design's
        instance('edited', { eyebrow: 'Das Archiv', title: { text: 'Everything published this spring', marks: [{ mark: 'em', start: 0, end: 5 }] } }),
        // a cleared value is the customer's too
        instance('cleared', { eyebrow: '', title: '', linkLabel: '' }),
      ],
    }, 'home.hbs'),
  }
  assert.deepEqual(untouchedWords(docs, library), [
    { key: 'home.hbs', instanceId: 'fresh', layer: 'Spring', words: ['The archive', 'Everything published this spring', 'Browse the archive'] },
    { key: 'home.hbs', instanceId: 'edited', layer: 'Three Up', words: ['Everything published this spring', 'Browse the archive'] },
  ])
})

test('a hidden section, a synthesized one and a design the library does not hold list nothing', () => {
  const words = { eyebrow: 'The archive' }
  const docs = {
    'home.hbs': parseDoc({
      schemaVersion: 1,
      instances: [
        instance('hidden', words, { hidden: true }),
        instance('auto-home-1', words),
        instance('gone', words, { designId: 'a17/9' }),
        // the control: the same words on a placed, visible section of a held design ARE listed
        instance('placed', words),
      ],
    }, 'home.hbs'),
  }
  assert.deepEqual(untouchedWords(docs, library).map((r) => r.instanceId), ['placed'])
})
