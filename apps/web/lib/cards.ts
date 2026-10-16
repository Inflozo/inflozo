// STORY 7.13 — EVERY SENTENCE THE EDITOR CARDS SURFACE SAYS, AS ONE LIST (R-170, standing rule 4): the switcher row and its
// caption, the Card dropdown, the `customised` badge, the no-colour mark and sentence, the left panel's lines, each card's
// one line in place of a panel, S14c's reset confirm, the greyed reasons, the malformed-record line and the announcements.
// The deployed walk (`run-verify-editor.cjs` step 107) and the keyboard journey read these words from here, never a copy.
//
// The names — a card's, a control's, a value's — are the library's registry (`CARDS`, `@inflozo/library`), the one place
// the editor, the canvas and the compiler read them; this file holds only the surface's own sentences. Pure and
// client-safe, so `node --test` reaches it and the Shell may import it.

import { cardOf, cardChanges, designedCards, parseCardDesigns, type CardDesigns, type CardEntry } from '@inflozo/library'

/** "colours, emoji and emoji size" — S14c's names, joined as the panel's other confirms join theirs. */
const inWords = (words: readonly string[]): string =>
  words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`

/** R-170: the surface is "Editor cards" everywhere — the switcher row, Theme settings' rail, the page title, every
 *  announcement — where C3a's group draws "Cards" */
const LABEL = 'Editor cards'

export const CARD_WORDS = {
  label: LABEL,
  /** the card document's own `<title>` and the iframe's accessible name */
  canvasTitle: `${LABEL} canvas`,
  /** the switcher row's one line (R-171), written to fit the 284px menu */
  caption: "Ghost's cards, styled once",
  /** S14d's amber count, read aloud as words (the frame's a11y note); absent at zero, never "0" */
  count: (n: number): string => `${n} customised ${n === 1 ? 'card' : 'cards'}`,
  /** the ink bar's Card dropdown (S14a): its label, the trigger's accessible name and the menu's heading */
  cardLabel: 'Card',
  menuHeading: "Every card, in Ghost's order",
  /** the badge a changed card carries in the dropdown, the left panel and the panel head — lowercase, as S14a draws it */
  customised: 'customised',
  /** R-6's mark on the header, signup and call-to-action rows (S14a's "NO COLOUR CTLS", in words), and its sentence in
   *  those cards' panels (S14a, S14e) — the owner's manual test step 10 reads it word for word */
  noColourMark: 'No colour controls',
  noColour: "Header, signup and call-to-action cards offer no colour controls — authors set those inline in Ghost's editor.",
  /** the left panel (S14a): its group heading, the line while nothing is customised, the count of the rest, and the
   *  site-wide sentence at its foot */
  customisedHeading: 'Customised',
  noneCustomised: 'No customised cards yet',
  onDefaults: (n: number): string => `${n} ${n === 1 ? 'card' : 'cards'} on Ghost's defaults`,
  siteWide: 'Cards are styled once, site-wide. Authors keep inserting them per post in Ghost.',
  /** the line a card with nothing of its own shows in place of a panel (C1c's reasons; Question 3 for call to action) */
  none: {
    image: "Nothing of its own to set: an image takes the post's own look.",
    cta: "Its colours, layout and button are the author's, set per post in Ghost.",
    email: 'Stripped from the published post.',
    gif: 'Renders as an image card.',
    html: "The author's markup wins, and it should.",
    markdown: 'Ordinary headings, lists and links.',
  } as Readonly<Record<string, string>>,
  /** GIF's way to the card it renders as (C1c's "Open Image →") */
  openImage: 'Open Image →',
  /** S14e's foot, and S14c's confirm — one step, opening on Cancel, "Posts keep their content." always second */
  reset: 'Reset to Ghost default',
  resetTitle: (label: string): string => `Reset ${label} to Ghost's default?`,
  resetBody: (count: number, nouns: readonly string[], plural: string): string =>
    `Removes your ${count} ${count === 1 ? 'change' : 'changes'} — ${inWords(nouns)} — everywhere ${plural} appear. Posts keep their content.`,
  cancel: 'Cancel',
  resetCard: 'Reset card',
  /** the arrow beside a changed control, as the section panel's (its accessible name and its title) */
  resetControl: (control: string): string => `Reset ${control}`,
  /** P0-0's reason beside a greyed control, keyed `card.control` — every `greyedWhile` the registry declares has one
   *  (`cards.test.ts` holds that) */
  greyed: {
    'divider.icon': 'Turn on Glyph instead of a rule to choose one.',
    'bookmark.side': 'Shown while the thumbnail shows.',
    'callout.background': "Choose Pack tokens to set a background — Ghost's palette keeps each author's own colour.",
    'audio.thumbnail-size': 'Shown while the thumbnail shows.',
  } as Readonly<Record<string, string>>,
  /** shown where a stored record `parseCardDesigns` refused (a hand-made row) opened every card on Ghost's defaults, until
   *  the first card change here saves over it */
  malformed: "Your saved card designs could not be read, so every card shows Ghost's default. Your next change here saves over them.",
  /** the right panel's accessible name */
  panel: (label: string): string => `${label} card settings`,
  /** `#editor-said`'s words */
  chosen: (label: string): string => `${label} selected`,
  changed: (label: string, control: string, value: string): string => `${label} — ${control}: ${value}`,
  wasReset: (label: string): string => `${label} is back to Ghost's default.`,
  /** an undo or a redo that changed cards — said wherever it lands, since from another canvas the change is out of sight */
  restyled: (labels: readonly string[]): string => `${inWords(labels)} restyled.`,
} as const

/** The number of customised cards — the switcher's amber count and the left panel's list. */
export const customisedCount = (designs: CardDesigns): number => designedCards(designs).length

/** S14c's sentence for one card, from the registry's own count and names (`cardChanges`). */
export const resetSentence = (designs: CardDesigns, key: string): string => {
  const card = cardOf(key)
  const { count, nouns } = cardChanges(designs, key)
  return card === undefined ? '' : CARD_WORDS.resetBody(count, nouns, card.plural)
}

/** The card the surface opens on — the last one viewed in this project (`sessionStorage`; S14d's "with the last-viewed
 *  card selected"), else Callout, the card S14a and S14e draw. */
export const FIRST_CARD = 'callout'
export const lastCardKey = (projectId: string): string => `inflozo-last-card-${projectId}`
export const cardOrFirst = (key: string | null | undefined): CardEntry => cardOf(key ?? '') ?? (cardOf(FIRST_CARD) as CardEntry)

/** AD-36, AD-27(a): a STORED or SENT record read the way the compile reads it — `parseCardDesigns` with the icon set as
 *  judge of the divider's glyph, so the sync route refuses an undrawn name BEFORE the write and `read.ts` opens such a row
 *  on Ghost's defaults with the malformed line, exactly where the compile would refuse it. The set (megabytes of path data)
 *  is imported only when the record names a divider glyph; every other save reads no icon. `load` is the import, handed in
 *  only by `cards.test.ts` to see that it is not called. */
export async function parseStoredCards(
  raw: unknown,
  load: () => Promise<{ iconDrawing: (name: string) => unknown }> = () => import('@inflozo/library/icons'),
): Promise<CardDesigns | string> {
  const divider = typeof raw === 'object' && raw !== null && Object.hasOwn(raw, 'divider') ? (raw as Record<string, unknown>)['divider'] : undefined
  const named = typeof divider === 'object' && divider !== null && Object.hasOwn(divider, 'icon') && typeof (divider as Record<string, unknown>)['icon'] === 'string'
  if (!named) return parseCardDesigns(raw)
  const { iconDrawing } = await load()
  return parseCardDesigns(raw, (n) => iconDrawing(n) !== undefined)
}

/** The editor's two card props from a stored record (`read.ts`, and the harness's planted one): a refused record opens on
 *  Ghost's defaults, its sentence handed on to be said once (`CARD_WORDS.malformed`). */
export async function storedCards(raw: unknown): Promise<{ cardDesigns: CardDesigns; cardsRefused: string | null }> {
  const cards = await parseStoredCards(raw)
  return typeof cards === 'string' ? { cardDesigns: {}, cardsRefused: cards } : { cardDesigns: cards, cardsRefused: null }
}
