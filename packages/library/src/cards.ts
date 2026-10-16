// Story 7.13 — FR-Q7's card design module, as data: EVERY KOENIG CARD an author can put in a post, in Ghost's own menu
// order, the Ghost chunk names each one switches off, and each card's own panel as named values. ONE registry, read by
// the editor (the Card dropdown and the panel), the canvas (the variations it draws first and the ring) and the compiler
// (`cards.css` and `card_assets`) alike, so the three cannot disagree.
//
// THE MENU ORDER is Koenig's (`buildCardMenu.ts:24-103`, by priority, read in koenig-lexical 1.7.2 and 1.9.2 — both majors'
// main group alike), less what leaves no element or never shows (the spec's Design Notes): public preview, email call to
// action (hidden by default on both), Transistor (off by default on Ghost 6, absent on Ghost 5), NFT (stays Ghost's,
// owner 2026-09-03), the blockquote (A25's measure) and Unsplash (it inserts an image card). None of them is ever excluded.
//
// A DESIGNED CARD STARTS FROM GHOST'S OWN STYLESHEET FOR IT (routine call 3): `cardsCss` copies the vendored chunk byte for
// byte, then writes the rules its changed values add. Every control starts at the step nearest Ghost's own declaration
// and that step adds no rule, so "untouched", "reset" and "Ghost's default" are one look. A card is CUSTOMISED exactly
// while one of its values differs from its start, and only then is it excluded (`excludedChunks`) — a stored record holds
// the values that differ and nothing else (`withValue`).
//
// THE VALUES ARE NAMES, NEVER CSS (AD-36, AD-27(a)): `parseCardDesigns` refuses the whole record unless every key is a
// listed card, every name one of its controls and every value one that control offers, and every byte `cardsCss` writes
// comes from this file — a stored value only chooses which.
//
// PURE (AD-1, AD-14): the vendored chunks and the icon drawings are HANDED IN, by the shell that read them.

import { vendoredChunks } from './modules.ts'

/** A control's value as stored, and its words in the panel. */
export type CardValue = { readonly value: string; readonly label: string }

/** One control of a card's own panel. `kind` picks the Kit control the panel draws: `choice` a segmented row, `toggle` a
 *  switch (`on` · `off`), `roles` the swatch row of pack roles, `icon` P0-2's icon slot (any icon Tabler draws, by name). */
export type CardControl = {
  /** its key in the card's record */
  readonly name: string
  readonly label: string
  /** what the reset confirm calls it — "colours", "emoji size" (S14c) */
  readonly noun: string
  readonly kind: 'choice' | 'toggle' | 'roles' | 'icon'
  /** every value offered, in the panel's order; `icon` offers every icon the set draws, so it lists none */
  readonly values: readonly CardValue[]
  /** the step nearest Ghost's own declaration, which adds no rule */
  readonly start: string
  /** P0-0: greyed while another control of this card holds one of these values */
  readonly greyedWhile?: { readonly control: string; readonly values: readonly string[] }
}

/** A card's values, every control filled in — its start where the record holds none. */
export type CardValues = Readonly<Record<string, string>>

/** The drawing of a Tabler icon as `iconSvg` writes it, or null for a name the set does not draw — handed in by the shell. */
export type GlyphLookup = (name: string) => string | null

export type CardEntry = {
  /** its key in `project_treatments.card_designs` */
  readonly key: string
  /** its name everywhere (R-170) */
  readonly label: string
  /** "everywhere callouts appear" (S14c) */
  readonly plural: string
  /** Ghost's chunk names (`card_assets.exclude`) — the header card is two, `header` and `header_v2`; none for a card Ghost
   *  ships no stylesheet for (image, divider, embed) */
  readonly chunks: readonly string[]
  /** R-6: false for header, signup and call to action — the post's author sets their colours inline in Ghost's editor */
  readonly colour: boolean
  /** the variation corpus's card name whose recorded blocks the canvas draws first (`orbitWeekly.variants()`), or null */
  readonly sample: string | null
  /** the canvas's selector for one card of this kind — the ring, the scroll and a click — or null where Ghost prints none */
  readonly root: string | null
  /** its own panel; empty for a card with nothing of its own to set (its one line is `CARD_WORDS`') */
  readonly controls: readonly CardControl[]
  /** the rules its values add, in order — none at its start */
  readonly rules: (v: CardValues, glyph?: GlyphLookup) => readonly string[]
  /** the rules every designed card of this kind writes after Ghost's copy: its corners re-pointed to the pack's radius
   *  (FR-Q7, declined per card), and the names gscan asks for that Ghost's own stylesheet lacks (routine call 10) */
  readonly always?: readonly string[]
}

const ON_OFF: readonly CardValue[] = [{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]
const toggle = (name: string, label: string, noun: string, start: 'on' | 'off', more: Partial<CardControl> = {}): CardControl =>
  ({ name, label, noun, kind: 'toggle', values: ON_OFF, start, ...more })
const choice = (name: string, label: string, noun: string, values: readonly (readonly [string, string])[], start: string, more: Partial<CardControl> = {}): CardControl =>
  ({ name, label, noun, kind: 'choice', values: values.map(([value, l]) => ({ value, label: l })), start, ...more })

/** Ghost's callout colours (`callout.css:15-50`, kg-default-nodes' `kg-callout-card-<colour>`), in its file's order. */
const CALLOUT_COLOURS = ['grey', 'white', 'blue', 'green', 'yellow', 'red', 'pink', 'purple', 'accent'] as const

/** The callout at Pack tokens: one background token per role, and the text token that reads on it (the spec's Design
 *  Notes). Tint is the pack's computed hover plate, the swatch S14e draws. */
const CALLOUT_ROLES: Readonly<Record<string, readonly [string, string]>> = {
  base: ['--bg-page', '--text-body'],
  surface: ['--bg-surface', '--text-body'],
  tint: ['--plate', '--text-body'],
  accent: ['--accent', '--text-on-accent'],
}

/** The divider's glyph as a CSS mask over the icon's own drawing (routine call 8): the `hr` stays bare, because a card
 *  may add no markup to `{{content}}` (A33 §0.4). `encodeURIComponent` leaves no `"` or `<`, and the url is double-quoted,
 *  so the `(` and `)` it leaves cannot end it. */
const glyphRule = (name: string, glyph: GlyphLookup | undefined): string => {
  const svg = glyph?.(name) ?? null
  if (svg === null) throw new Error(`the divider's glyph "${name}" is no icon Tabler draws, so cards.css cannot draw it`)
  return `hr:not([class]) { height: 24px; border: 0; background: var(--text-muted); mask: url("data:image/svg+xml,${encodeURIComponent(svg)}") center / 24px 24px no-repeat; }`
}

/** EVERY CARD, in Koenig's menu order. The table is the spec's Design Notes' card table, which the owner's three rulings
 *  of 2026-10-15 wrote; each start is the step nearest the vendored chunk's own declaration. */
export const CARDS: readonly CardEntry[] = [
  { key: 'image', label: 'Image', plural: 'images', chunks: [], colour: true, sample: 'image', root: '.kg-image-card', controls: [], rules: () => [] },
  {
    key: 'divider', label: 'Divider', plural: 'dividers', chunks: [], colour: true, sample: 'divider', root: 'hr',
    controls: [
      toggle('glyph', 'Glyph instead of a rule', 'glyph', 'off'),
      { name: 'icon', label: 'Glyph', noun: 'glyph icon', kind: 'icon', values: [], start: 'asterisk', greyedWhile: { control: 'glyph', values: ['off'] } },
    ],
    rules: (v, glyph) => (v['glyph'] === 'on' ? [glyphRule(v['icon'] as string, glyph)] : []),
  },
  {
    key: 'button', label: 'Button', plural: 'buttons', chunks: ['button'], colour: true, sample: 'button', root: '.kg-button-card',
    controls: [
      // button.css:24 — `height: 2.4em`, `padding: 0 1.2em`
      choice('height', 'Height', 'height', [['compact', 'Compact'], ['standard', 'Standard'], ['tall', 'Tall']], 'standard'),
      choice('fill', 'Fill', 'fill', [['solid', 'Solid'], ['outline', 'Outline']], 'solid'),
      choice('label', 'Label', 'label', [['sentence', 'Sentence'], ['uppercase', 'Uppercase']], 'sentence'),
      // button.css:36-38 — Ghost's hover is its own `opacity: 0.85`
      choice('hover', 'Hover', 'hover', [['darken', 'Darken'], ['none', 'None']], 'darken'),
    ],
    rules: (v) => [
      ...(v['height'] === 'compact' ? ['.kg-button-card a.kg-btn { height: 2em; }'] : []),
      ...(v['height'] === 'tall' ? ['.kg-button-card a.kg-btn { height: 3em; padding: 0 1.6em; }'] : []),
      ...(v['fill'] === 'outline' ? ['.kg-button-card a.kg-btn-accent { background-color: transparent; color: var(--ghost-accent-color); box-shadow: inset 0 0 0 2px var(--ghost-accent-color); }'] : []),
      ...(v['label'] === 'uppercase' ? ['.kg-button-card a.kg-btn { text-transform: uppercase; letter-spacing: 0.04em; }'] : []),
      ...(v['hover'] === 'none' ? ['.kg-button-card a.kg-btn:hover { opacity: 1; }'] : []),
    ],
    // both gscans ask for `.kg-button-card.kg-align-center`, which button.css lacks: a real rule, centring as Ghost centres
    always: ['.kg-button-card a.kg-btn { border-radius: var(--button-radius); }', '.kg-button-card.kg-align-center { justify-content: center; }'],
  },
  {
    key: 'bookmark', label: 'Bookmark', plural: 'bookmarks', chunks: ['bookmark'], colour: true, sample: 'bookmark', root: '.kg-bookmark-card',
    controls: [
      toggle('thumbnail', 'Show thumbnail', 'thumbnail', 'on'),
      choice('side', 'Thumbnail side', 'thumbnail side', [['right', 'Right'], ['left', 'Left'], ['above', 'Above']], 'right', { greyedWhile: { control: 'thumbnail', values: ['off'] } }),
      toggle('description', 'Description', 'description', 'on'),
      toggle('author', 'Author', 'author', 'on'),
      toggle('publisher', 'Publisher', 'publisher', 'on'),
      toggle('icon', 'Site icon', 'site icon', 'on'),
    ],
    rules: (v) => [
      ...(v['thumbnail'] === 'off' ? ['.kg-bookmark-card .kg-bookmark-thumbnail { display: none; }'] : []),
      ...(v['side'] === 'left' ? ['.kg-bookmark-card a.kg-bookmark-container { flex-direction: row-reverse; }'] : []),
      ...(v['side'] === 'above' ? ['.kg-bookmark-card a.kg-bookmark-container { flex-direction: column-reverse; }', '.kg-bookmark-card .kg-bookmark-thumbnail { aspect-ratio: 16 / 9; }'] : []),
      ...(v['description'] === 'off' ? ['.kg-bookmark-card .kg-bookmark-description { display: none; }'] : []),
      ...(v['author'] === 'off' ? ['.kg-bookmark-card .kg-bookmark-author { display: none; }'] : []),
      ...(v['publisher'] === 'off' ? ['.kg-bookmark-card .kg-bookmark-publisher { display: none; }'] : []),
      ...(v['icon'] === 'off' ? ['.kg-bookmark-card .kg-bookmark-icon { display: none; }'] : []),
    ],
    // bookmark.css:13-21 writes its corner on the container and on its hover alike
    always: ['.kg-bookmark-card a.kg-bookmark-container, .kg-bookmark-card a.kg-bookmark-container:hover { border-radius: var(--radius-card); }'],
  },
  {
    key: 'gallery', label: 'Gallery', plural: 'galleries', chunks: ['gallery'], colour: true, sample: 'gallery', root: '.kg-gallery-card',
    // gallery.css:8-11, 46-51 — `--gap: 1.2rem`, and 0.6rem under 600px
    controls: [choice('gutter', 'Gutter', 'gutter', [['tight', 'Tight'], ['normal', 'Normal'], ['loose', 'Loose']], 'normal')],
    rules: (v) => [
      ...(v['gutter'] === 'tight' ? ['.kg-gallery-card { --gap: 0.6rem; }', '@media (max-width: 600px) { .kg-gallery-card { --gap: 0.3rem; } }'] : []),
      ...(v['gutter'] === 'loose' ? ['.kg-gallery-card { --gap: 2rem; }', '@media (max-width: 600px) { .kg-gallery-card { --gap: 1rem; } }'] : []),
    ],
  },
  // Question 3, ruled option 1 (owner, 2026-10-15): listed with one line and no controls — so never designed, never excluded
  { key: 'cta', label: 'Call to action', plural: 'calls to action', chunks: ['cta'], colour: false, sample: 'cta', root: '.kg-cta-card', controls: [], rules: () => [] },
  { key: 'email', label: 'Email content', plural: 'email content cards', chunks: [], colour: true, sample: null, root: null, controls: [], rules: () => [] },
  {
    key: 'callout', label: 'Callout', plural: 'callouts', chunks: ['callout'], colour: true, sample: 'callout', root: '.kg-callout-card',
    controls: [
      // routine call 7: Ghost's palette is Ghost's look, so it is the start
      choice('colours', 'Callout colours', 'colours', [['ghost', "Ghost's palette"], ['tokens', 'Pack tokens']], 'ghost'),
      // Question 1, ruled option 1 (owner, 2026-10-15, DW-109): "Callout background", the four drawn values
      {
        name: 'background', label: 'Callout background', noun: 'background', kind: 'roles', start: 'base',
        values: [{ value: 'base', label: 'Base' }, { value: 'surface', label: 'Surface' }, { value: 'tint', label: 'Tint' }, { value: 'accent', label: 'Accent' }],
        greyedWhile: { control: 'colours', values: ['ghost'] },
      },
      toggle('emoji', 'Emoji', 'emoji', 'on'),
      // callout.css:54-58 — `font-size: 1.15em`
      choice('emoji-size', 'Emoji size', 'emoji size', [['small', 'Small'], ['large', 'Large']], 'small'),
    ],
    rules: (v) => {
      const role = CALLOUT_ROLES[v['background'] as string] ?? (CALLOUT_ROLES['base'] as readonly [string, string])
      return [
        // after Ghost's copy, one class each: the later rule wins over every colour class, the white one's ring included;
        // a link follows the text, the accent callout's own white link too (`callout.css:48-51`)
        ...(v['colours'] === 'tokens' ? [`.kg-callout-card { background: var(${role[0]}); color: var(${role[1]}); box-shadow: none; }`, '.kg-callout-card a, .kg-callout-card.kg-callout-card-accent a { color: inherit; }'] : []),
        ...(v['emoji'] === 'off' ? ['.kg-callout-card div.kg-callout-emoji { display: none; }'] : []),
        ...(v['emoji-size'] === 'large' ? ['.kg-callout-card div.kg-callout-emoji { font-size: 1.6em; }'] : []),
      ]
    },
    always: [
      '.kg-callout-card { border-radius: var(--radius-card); }',
      // gscan 4.49.7 asks for names Ghost has never printed: each sits in the selector list beside the real class it stands
      // for, on a rule that restates Ghost's own `box-sizing` for it — so it matches nothing and changes nothing
      `.kg-callout-card div.kg-callout-emoji, .kg-callout-card-emoji, .kg-callout-card div.kg-callout-text, .kg-callout-card-text, ${CALLOUT_COLOURS.map((c) => `.kg-callout-card-${c}, .kg-callout-card-background-${c}`).join(', ')} { box-sizing: border-box; }`,
    ],
  },
  {
    key: 'signup', label: 'Signup', plural: 'signup cards', chunks: ['signup'], colour: false, sample: 'signup', root: '.kg-signup-card',
    controls: [
      // signup.css:232-241 — `height: 2.9em`, `min-height: 46px`
      choice('field-height', 'Field height', 'field height', [['compact', 'Compact'], ['standard', 'Standard'], ['tall', 'Tall']], 'standard'),
      choice('layout', 'Form layout', 'form layout', [['side', 'Side by side'], ['stacked', 'Stacked']], 'side'),
      // signup.css:20-23 — `grid-template-columns: 1fr 1fr`
      choice('split', 'Split picture', 'split picture', [['third', 'Third'], ['half', 'Half']], 'half'),
      choice('disclaimer', 'Disclaimer', 'disclaimer', [['small', 'Small'], ['hidden', 'Hidden']], 'small'),
    ],
    rules: (v) => [
      ...(v['field-height'] === 'compact' ? ['.kg-signup-card .kg-signup-card-input { height: 2.4em; min-height: 38px; }', '.kg-signup-card .kg-signup-card-button { min-height: 38px; }'] : []),
      ...(v['field-height'] === 'tall' ? ['.kg-signup-card .kg-signup-card-input { height: 3.4em; min-height: 54px; }', '.kg-signup-card .kg-signup-card-button { min-height: 54px; }'] : []),
      ...(v['layout'] === 'stacked' ? ['.kg-signup-card .kg-signup-card-fields { flex-direction: column; gap: 3px; }', '.kg-signup-card .kg-signup-card-input { margin: 0; }', '.kg-signup-card .kg-signup-card-button { justify-content: center; }'] : []),
      // the picture is first in the markup and the text first once swapped (`.kg-swapped`); Ghost's own single column
      // under 641px stays
      ...(v['split'] === 'third' ? ['@media (min-width: 641px) { .kg-signup-card.kg-layout-split .kg-signup-card-content { grid-template-columns: 1fr 2fr; } .kg-signup-card.kg-layout-split.kg-swapped .kg-signup-card-content { grid-template-columns: 2fr 1fr; } }'] : []),
      ...(v['disclaimer'] === 'hidden' ? ['.kg-signup-card .kg-signup-card-disclaimer { display: none; }'] : []),
    ],
    always: ['.kg-signup-card .kg-signup-card-fields { border-radius: var(--radius-card); }', '.kg-signup-card .kg-signup-card-button { border-radius: var(--button-radius); }'],
  },
  {
    key: 'header', label: 'Header', plural: 'header cards', chunks: ['header', 'header_v2'], colour: false, sample: 'header_v2', root: '.kg-header-card',
    // the current renderer only (owner, 2026-09-03): Ghost 6's `kg-v2`. header_v2.css:31-60 — `min(6.4vmax, 120px)` and up
    controls: [choice('height', 'Height', 'height', [['tight', 'Tight'], ['generous', 'Generous']], 'tight')],
    rules: (v) => (v['height'] === 'generous'
      ? [
        '.kg-header-card.kg-v2 .kg-header-card-text { padding-top: min(10vmax, 200px); padding-bottom: min(10vmax, 200px); }',
        '.kg-header-card.kg-v2.kg-width-wide .kg-header-card-text, .kg-header-card.kg-v2.kg-width-full .kg-header-card-text, .kg-header-card.kg-v2.kg-layout-split .kg-header-card-text { padding-top: min(16vmax, 340px); padding-bottom: min(16vmax, 340px); }',
      ]
      : []),
    always: ['.kg-header-card.kg-v2 .kg-header-card-button { border-radius: var(--button-radius); }'],
  },
  {
    key: 'toggle', label: 'Toggle', plural: 'toggles', chunks: ['toggle'], colour: true, sample: 'toggle', root: '.kg-toggle-card',
    controls: [
      choice('chevron', 'Chevron side', 'chevron side', [['right', 'Right'], ['left', 'Left']], 'right'),
      choice('divider', 'Divider under the heading', 'divider', [['rule', 'Rule'], ['none', 'None']], 'none'),
      // toggle.css:38-44 — `font-size: 1.15em`, bold
      choice('heading', 'Heading size', 'heading size', [['body', 'Body'], ['small-head', 'Small head']], 'body'),
    ],
    rules: (v) => [
      ...(v['chevron'] === 'left' ? ['.kg-toggle-card .kg-toggle-heading { flex-direction: row-reverse; justify-content: flex-end; }', '.kg-toggle-card .kg-toggle-card-icon { margin-left: 0; margin-right: 1em; }'] : []),
      ...(v['divider'] === 'rule' ? ['.kg-toggle-card[data-kg-toggle-state="open"] .kg-toggle-heading { padding-bottom: 0.75em; border-bottom: 1px solid var(--border-hairline); }'] : []),
      ...(v['heading'] === 'small-head' ? ['.kg-toggle-card h4.kg-toggle-heading-text { font-size: 0.8em; letter-spacing: 0.06em; text-transform: uppercase; }'] : []),
    ],
    always: ['.kg-toggle-card { border-radius: var(--radius-card); }'],
  },
  {
    key: 'video', label: 'Video', plural: 'videos', chunks: ['video'], colour: true, sample: 'video', root: '.kg-video-card',
    controls: [
      // video.css:51-61 — the play button is 72px
      choice('play', 'Play button', 'play button', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']], 'medium'),
      // video.css:37-49 — a 0.3 gradient over the top 70%
      choice('scrim', 'Overlay scrim', 'overlay scrim', [['none', 'None'], ['light', 'Light'], ['heavy', 'Heavy']], 'light'),
      choice('bar', 'Control bar', 'control bar', [['dark', 'Dark'], ['light', 'Light']], 'dark'),
    ],
    rules: (v) => [
      ...(v['play'] === 'small' ? ['.kg-video-card .kg-video-large-play-icon { width: 56px; height: 56px; }'] : []),
      ...(v['play'] === 'large' ? ['.kg-video-card .kg-video-large-play-icon { width: 96px; height: 96px; }'] : []),
      ...(v['scrim'] === 'none' ? ['.kg-video-card .kg-video-overlay { background-image: none; }'] : []),
      ...(v['scrim'] === 'heavy' ? ['.kg-video-card .kg-video-overlay { background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0, rgba(0, 0, 0, 0.25) 100%); }'] : []),
      ...(v['bar'] === 'light'
        ? [
          '.kg-video-card .kg-video-player { background: var(--bg-surface); }',
          '.kg-video-card .kg-video-current-time, .kg-video-card .kg-video-playback-rate { color: var(--text-body); }',
          '.kg-video-card .kg-video-time { color: var(--text-muted); }',
          '.kg-video-card .kg-video-play-icon svg, .kg-video-card .kg-video-pause-icon svg, .kg-video-card .kg-video-mute-icon svg, .kg-video-card .kg-video-unmute-icon svg { fill: var(--text-body); }',
        ]
        : []),
    ],
    // gscan 4.49.7's three video names Ghost never prints (its thumbnail is `data-kg-thumbnail`, MEASUREMENTS §35d's dated
    // note): beside the poster they stand for and the caption, on Ghost's own `box-sizing` — matching nothing
    always: ['.kg-video-container video, .kg-video-thumbnail, .kg-video-thumbnail.placeholder, .kg-video-card figcaption, .kg-video-title { box-sizing: border-box; }'],
  },
  {
    key: 'audio', label: 'Audio', plural: 'audio players', chunks: ['audio'], colour: true, sample: 'audio', root: '.kg-audio-card',
    controls: [
      toggle('thumbnail', 'Show thumbnail', 'thumbnail', 'on'),
      // audio.css:22-33 — an 80px square
      choice('thumbnail-size', 'Thumbnail size', 'thumbnail size', [['inline', 'Inline'], ['large', 'Large']], 'inline', { greyedWhile: { control: 'thumbnail', values: ['off'] } }),
      // audio.css:35-37 — the placeholder is Ghost's accent
      choice('accent', 'Player accent', 'player accent', [['accent', 'Accent'], ['text', 'Text']], 'accent'),
    ],
    rules: (v) => [
      ...(v['thumbnail'] === 'off' ? ['.kg-audio-card .kg-audio-thumbnail { display: none; }'] : []),
      ...(v['thumbnail-size'] === 'large' ? ['.kg-audio-card .kg-audio-thumbnail { width: 120px; min-width: 120px; }'] : []),
      ...(v['accent'] === 'text' ? ['.kg-audio-card .kg-audio-thumbnail.placeholder { background: currentColor; }'] : []),
    ],
    always: ['.kg-audio-card { border-radius: var(--radius-card); }'],
  },
  {
    key: 'file', label: 'File', plural: 'file cards', chunks: ['file'], colour: true, sample: 'file', root: '.kg-file-card',
    controls: [
      choice('icon-side', 'Download icon', 'download icon', [['right', 'Right'], ['left', 'Left']], 'right'),
      toggle('description', 'Show description', 'description', 'on'),
      toggle('size', 'Show file size', 'file size', 'on'),
    ],
    rules: (v) => [
      ...(v['icon-side'] === 'left' ? ['.kg-file-card a.kg-file-card-container { flex-direction: row-reverse; }'] : []),
      // the description is `.kg-file-card-caption` on the web (kg-default-nodes)
      ...(v['description'] === 'off' ? ['.kg-file-card .kg-file-card-caption { display: none; }'] : []),
      ...(v['size'] === 'off' ? ['.kg-file-card .kg-file-card-filesize { display: none; }'] : []),
    ],
    always: ['.kg-file-card a.kg-file-card-container { border-radius: var(--radius-card); }'],
  },
  {
    key: 'product', label: 'Product', plural: 'product cards', chunks: ['product'], colour: true, sample: 'product', root: '.kg-product-card',
    controls: [
      choice('image', 'Image position', 'image position', [['above', 'Above'], ['beside', 'Beside']], 'above'),
      // product.css:104-109 — the stars are `currentColor`, the card's text: the chunk wins over the table's ▸Accent
      choice('rating', 'Rating colour', 'rating colour', [['accent', 'Accent'], ['text', 'Text']], 'text'),
      choice('button', 'Button', 'button', [['match', 'Match the Button card'], ['link', 'Text link']], 'match'),
    ],
    rules: (v) => [
      ...(v['image'] === 'beside'
        ? ['@media (min-width: 641px) { .kg-product-card .kg-product-card-container { grid-template-columns: minmax(0, 2fr) minmax(0, 3fr) min-content; column-gap: 20px; } .kg-product-card .kg-product-card-image { grid-column: 1 / 2; grid-row: 1 / span 3; align-self: start; width: 100%; height: auto; } .kg-product-card .kg-product-card-title-container { grid-column: 2 / 3; } .kg-product-card .kg-product-card-rating { grid-column: 3 / 4; } .kg-product-card .kg-product-card-description, .kg-product-card a.kg-product-card-button { grid-column: 2 / 4; } }']
        : []),
      ...(v['rating'] === 'accent' ? ['.kg-product-card .kg-product-card-rating-star svg { fill: var(--accent); }'] : []),
      ...(v['button'] === 'link' ? ['.kg-product-card a.kg-product-card-button, .kg-product-card a.kg-product-card-btn-accent { justify-content: flex-start; height: auto; padding: 0; background: none; color: var(--ghost-accent-color); text-decoration: underline; }'] : []),
    ],
    always: ['.kg-product-card .kg-product-card-container { border-radius: var(--radius-card); }', '.kg-product-card a.kg-product-card-button { border-radius: var(--button-radius); }'],
  },
  { key: 'gif', label: 'GIF', plural: 'GIFs', chunks: [], colour: true, sample: null, root: null, controls: [], rules: () => [] },
  { key: 'html', label: 'HTML', plural: 'HTML cards', chunks: [], colour: true, sample: 'table', root: null, controls: [], rules: () => [] },
  { key: 'markdown', label: 'Markdown', plural: 'Markdown cards', chunks: [], colour: true, sample: null, root: null, controls: [], rules: () => [] },
  {
    // Ghost's Embeds group (YouTube, X, Vimeo, CodePen, Spotify, SoundCloud, Other…) is one card on the web
    key: 'embed', label: 'Embed', plural: 'embeds', chunks: [], colour: true, sample: 'embed', root: '.kg-embed-card',
    controls: [choice('align', 'Alignment', 'alignment', [['left', 'Left'], ['centred', 'Centred']], 'centred')],
    rules: (v) => (v['align'] === 'left' ? ['.kg-embed-card { display: flex; flex-direction: column; align-items: flex-start; }'] : []),
  },
]

/** One card's entry, or undefined. */
export const cardOf = (key: string): CardEntry | undefined => CARDS.find((c) => c.key === key)

/** The project's card designs as stored: each designed card's key → the controls whose value differs from its start. */
export type CardDesigns = Readonly<Record<string, Readonly<Record<string, string>>>>

/** Tabler's names (`iconSvg`'s grammar) — what the divider's icon slot holds. */
const ICON_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const own = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k)
const isRecord = (v: unknown): v is Readonly<Record<string, unknown>> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Does `control` offer `value`? An icon slot offers every name the set draws — by its grammar, and by `drawable` when the
 *  caller handed the set in. */
const offers = (control: CardControl, value: string, drawable?: (name: string) => boolean): boolean =>
  control.kind === 'icon' ? ICON_NAME_RE.test(value) && (drawable === undefined || drawable(value)) : control.values.some((v) => v.value === value)

/** AD-36, AD-27(a): `card_designs`' ONE schema. A record whose every key is a listed card, every name one of its controls
 *  and every value one that control offers comes back as stored, a start value or an emptied card dropped (what
 *  `withValue` would have written); anything else — an unknown card, control or value, a non-object, a non-string value —
 *  refuses the WHOLE record with one sentence. `null` (no row) is no card designed. The sync route refuses before the
 *  write, the editor opens on Ghost's defaults and says so, and the compile refuses with this sentence. */
export function parseCardDesigns(raw: unknown, drawable?: (name: string) => boolean): CardDesigns | string {
  if (raw === null || raw === undefined) return {}
  if (!isRecord(raw)) return 'The card designs are not a record of cards, so none of them was read.'
  const out: Record<string, Record<string, string>> = {}
  for (const key of Object.keys(raw)) {
    const card = CARDS.find((c) => c.key === key)
    if (card === undefined) return `The card designs name "${key.slice(0, 40)}", which is no card this editor lists, so none of them was read.`
    const values = raw[key]
    if (!isRecord(values)) return `The card designs hold no controls for ${card.label}, so none of them was read.`
    const kept: Record<string, string> = {}
    for (const name of Object.keys(values)) {
      const control = card.controls.find((c) => c.name === name)
      if (control === undefined) return `The card designs give ${card.label} a control "${name.slice(0, 40)}" it does not have, so none of them was read.`
      const value = values[name]
      if (typeof value !== 'string' || !offers(control, value, drawable)) return `The card designs set ${card.label}'s ${control.label} to a value it does not offer, so none of them was read.`
      if (value !== control.start) kept[name] = value
    }
    if (Object.keys(kept).length > 0) out[key] = kept
  }
  // the record in list order, each card's controls in panel order — the same bytes whatever order it was stored in
  return Object.fromEntries(CARDS.filter((c) => own(out, c.key)).map((c) => [c.key, Object.fromEntries(c.controls.filter((x) => own(out[c.key] as object, x.name)).map((x) => [x.name, (out[c.key] as Record<string, string>)[x.name] as string]))]))
}

/** A card's values in force: each control's stored value, else its start. */
export function cardValues(designs: CardDesigns, card: CardEntry): CardValues {
  const stored = designs[card.key] ?? {}
  return Object.fromEntries(card.controls.map((c) => [c.name, own(stored, c.name) ? (stored[c.name] as string) : c.start]))
}

/** The record with one control set: its key leaves the card's record at its start, and a card with no key left leaves the
 *  record — so the record only ever holds what differs, and the badge, the count and the exclusion follow. */
export function withValue(designs: CardDesigns, cardKey: string, control: string, value: string): CardDesigns {
  const card = cardOf(cardKey)
  const def = card?.controls.find((c) => c.name === control)
  if (card === undefined || def === undefined) return designs
  const next: Record<string, string> = { ...(designs[cardKey] ?? {}) }
  if (value === def.start) delete next[control]
  else next[control] = value
  const out: Record<string, Readonly<Record<string, string>>> = { ...designs }
  if (Object.keys(next).length === 0) delete out[cardKey]
  else out[cardKey] = next
  return Object.fromEntries(CARDS.filter((c) => own(out, c.key)).map((c) => [c.key, out[c.key] as Readonly<Record<string, string>>]))
}

/** The record with one card reset to Ghost's default: its key gone. */
export function withoutCard(designs: CardDesigns, cardKey: string): CardDesigns {
  const out: Record<string, Readonly<Record<string, string>>> = { ...designs }
  delete out[cardKey]
  return out
}

/** A card's values IN FORCE: `cardValues`, with every control another one greys (P0·0's `greyedWhile`) back at its start.
 *  A greyed value is KEPT, so the panel shows what returns (P0·0), but it renders nothing — so it is no change: Pack tokens
 *  → Tint → Ghost's palette leaves the card on Ghost's look, uncustomised and not excluded (routine call 3; Review,
 *  2026-10-16). The badge, the count, the exclusion, S14c's sentence and the rules all read this. */
export function valuesInForce(designs: CardDesigns, card: CardEntry): CardValues {
  const v = cardValues(designs, card)
  return Object.fromEntries(card.controls.map((c) => [c.name, c.greyedWhile !== undefined && c.greyedWhile.values.includes(v[c.greyedWhile.control] ?? '') ? c.start : (v[c.name] as string)]))
}

/** The customised cards, in list order — every card with a value IN FORCE that differs from its start. */
export const designedCards = (designs: CardDesigns): CardEntry[] =>
  CARDS.filter((c) => {
    const v = valuesInForce(designs, c)
    return c.controls.some((x) => v[x.name] !== x.start)
  })

/** S14c's count and names: the controls of one card IN FORCE that differ from their start, in panel order. */
export function cardChanges(designs: CardDesigns, cardKey: string): { count: number; nouns: string[] } {
  const card = cardOf(cardKey)
  if (card === undefined) return { count: 0, nouns: [] }
  const v = valuesInForce(designs, card)
  const nouns = card.controls.filter((c) => v[c.name] !== c.start).map((c) => c.noun)
  return { count: nouns.length, nouns }
}

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/** `card_assets.exclude` (research §6.5's `designedCards ∩ ghostCardAssetNames`): the designed cards' Ghost chunk names
 *  that Ghost ships — `chunkNames` is the vendored directory, read by the shell, never written down — in code-unit order,
 *  each once. The header card names both of its chunks; a card with none (a divider) adds no name. */
export const excludedChunks = (designs: CardDesigns, chunkNames: readonly string[]): string[] =>
  [...new Set(designedCards(designs).flatMap((c) => c.chunks).filter((n) => chunkNames.includes(n)))].sort(byCode)

/** What opens Ghost's block in `cards.css`, and what opens this theme's own rules after it — the two lines a reader splits
 *  the file at (`ownCardsCss`), so FR-G8's lint and the `!important` check read the theme's rules and skip Ghost's. */
export const GHOST_BLOCK_HEAD = "/* Ghost's own styles for these cards: "
export const OWN_RULES_HEAD = "/* This theme's card settings */"

/** D12's two Koenig widths, on tokens (DW-334, AD-18): on every theme, first. */
export const KOENIG_WIDTHS = '.kg-width-wide { max-width: var(--site-width); }\n.kg-width-full { max-width: 100%; }\n'

/** FR-Q7's `cards.css`: D12's widths; then, for each designed card in list order, Ghost's own chunk for it (the vendored
 *  file, head cut, byte for byte) under one header naming Ghost, its version and `LICENSE-ghost.txt`; then this theme's
 *  rules — each designed card's corners and gscan's names (`always`), then what its changed values add. `chunks` is the
 *  vendored stylesheets by chunk name, `glyph` the icon drawings (the divider's glyph only). Pure and deterministic. */
export function cardsCss(designs: CardDesigns, chunks: Readonly<Record<string, string>>, glyph?: GlyphLookup): string {
  const designed = designedCards(designs)
  const names = designed.flatMap((c) => c.chunks).filter((n) => own(chunks, n))
  let out = KOENIG_WIDTHS
  if (names.length > 0) {
    const { version, copyright, chunks: copied } = vendoredChunks(names, chunks, 'css')
    out += `${GHOST_BLOCK_HEAD}${copied.map(([n]) => n).join(' · ')} — copied unchanged from Ghost ${version}, core/frontend/src/cards/css/.\n   ${copyright}. MIT licence: the full text is LICENSE-ghost.txt. */\n`
    out += copied.map(([n, body]) => `/* ${n}.css */\n${body.endsWith('\n') ? body : `${body}\n`}`).join('')
  }
  const rules = designed.flatMap((c) => [...(c.always ?? []), ...c.rules(valuesInForce(designs, c), glyph)])
  if (rules.length > 0) out += `${OWN_RULES_HEAD}\n${rules.join('\n')}\n`
  return out
}

/** The Ghost version a designed set's stylesheets are copied from, or null when it copies none — README.md's line. */
export function cardsCssVersion(designs: CardDesigns, chunks: Readonly<Record<string, string>>): string | null {
  const names = designedCards(designs).flatMap((c) => c.chunks).filter((n) => own(chunks, n))
  return names.length === 0 ? null : vendoredChunks(names, chunks, 'css').version
}

/** `cards.css` without Ghost's block — D12's widths and this theme's rules, the bytes Inflozo writes. */
export function ownCardsCss(text: string): string {
  const from = text.indexOf(GHOST_BLOCK_HEAD)
  if (from === -1) return text
  const to = text.indexOf(`${OWN_RULES_HEAD}\n`, from)
  return text.slice(0, from) + (to === -1 ? '' : text.slice(to))
}
