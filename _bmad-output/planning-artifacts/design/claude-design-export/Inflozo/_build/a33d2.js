// A33 designs 4–6 · Wide · Full Bleed · Contrast Band
globalThis.A33D2 = (function () {
const K = globalThis.A33LIB;
const { L, D, MONO, PK, b, code, tile, specRow } = K;
const AM = K.AM, WIDE = K.WIDE, BOX = K.BOX;
const { NOJS, FIELDS, DATA, REPEAT, STD_MEDIA } = globalThis.A33SHARED;

/* ── 4 · Wide ──────────────────────────────────────────────────────────── */
const trWide = { key:'wide', contain:'none', rules:'both', pad:0, space:56, shadow:false,
  mediaW:(w, k) => w === 1440 ? (k === 'regular' ? 1040 : 1296) : STD_MEDIA(w, k),
  capMode:'media', capAlign:'left', credit:'own', calloutPlane:'tint', emoji:'shown', gutter:12 };

const d4 = {
  n:4, name:'Wide', tr:trWide,
  rail:'A33 KOENIG CARD TREATMENTS · TREATMENT 4 OF 6 · PAPER PACK · SIX CONTROLS + WHAT GHOST OWNS',
  paras:[
    'Every media card steps up one rung from the width its author gave it: an image marked regular renders at the wide column’s 1,040, and one marked wide takes the content box’s 1,296. The text keeps the measure at 720, unmoved.',
    'It is the treatment for a publication whose pictures are the point. The copy-bearing cards are 1 Plain’s, unchanged — this design spends its whole claim on width, and the caption follows the media rather than the measure.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · MEDIA ONE RUNG UP · REGULAR RESOLVES TO 1,040 · TEXT STAYS AT 720 · SPACE 56',
  primaryNote:`${b('Nothing here changes the article’s measure')} ⚑ — 720 for every paragraph, every callout and every caption of text. ${b('What changes is the resolution table')}: regular → 1,040, wide → 1,296, full → 1,296. ${b('Wide and full land on the same width, and the panel says so')} ⚑ rather than pretending there are three rungs when the step-up has used one of them.`,
  rollNote:`${b('Five cards move and fifteen do not.')} Image, gallery, embed, video, GIF and the product’s own photograph take the wider rung; ${b('every card that carries copy is 1 Plain’s exactly')} ⚑. That asymmetry is the design: a bookmark at 1,040 is a link with 320 px of empty description, and a photograph at 1,040 is a photograph.`,
  rollNotes:{
    image:'REGULAR RESOLVES TO 1,040 IN THE PAGE · DRAWN AT THE TILE’S WIDTH HERE',
    gallery:'THREE PLATES AT 1,040 RATHER THAN 720 · GHOST STILL COMPUTES THE ROW RATIOS ⚑',
    bookmark:'DOES NOT STEP UP ⚑ · A BOOKMARK AT 1,040 IS A LINK WITH 320 PX OF EMPTY DESCRIPTION',
    embed:'A 16:9 EMBED AT 1,040 IS 585 TALL · THE ONE CARD WHERE THE STEP-UP COSTS VERTICAL SPACE'
  },
  widthNote:{ regular:'STEPPED UP ONE RUNG', wide:'STEPPED UP ONE RUNG', full:'ALREADY THE BOX' },
  widthsNote:`${b('This is the only treatment where the three authored values do not map to three widths')} ⚑. Regular → 1,040 · wide → 1,296 · full → 1,296. ${b('An author who marks a card full gets what they asked for; one who marks it wide gets the same thing')}, and the alternative — inventing a fourth rung past the content box — is 5 Full Bleed. ${b('At Media steps up: Two rungs, regular goes straight to 1,296')} and every media card in the post is the content box.`,
  statesNote:`${b('Nothing about hover or focus changes with width')} ⚑. The bookmark, the button and the toggle are the same components at the same sizes as 1 Plain; ${b('the only state this treatment adds is the caption’s alignment')}, which is not a state at all.`,
  absentNote:`${b('A missing caption is more visible here')} ⚑, because the caption is what tied a 1,040 photograph back to the 720 column. ${b('At Caption alignment: To the measure the tie is structural rather than textual')} and a caption-less image simply sits wide — which is why that value exists.`,
  a11y:[
    `${b('Width is not an accessibility problem; caption width is')} ⚑. ${b('At To the media the caption line is 1,040 wide')}, which is 130 characters at 13.5 px — past the 80-character guidance and stated here as a known trade, mitigated by the caption being at most two lines.`,
    `${b('To the measure is the accessible default for caption-heavy publications')}, and the panel says so in words rather than hiding the choice ⚑.`,
    `${b('The figure/caption pair is unchanged')}: a wider figure is still one figure, and reading order is still image → caption.`,
    `${b('At 400 % zoom the step-up disappears')} — the viewport is under 1024, there is no wide column, and every media card is the content box.`
  ],
  a11yNote:`${b('The step-up is a width, and widths are not announced')} ⚑. The one real cost is a 1,040 caption line, which is named in the panel and in field 10 rather than discovered.`,
  controls:{
    name:'Wide', n:4, count:'SIX',
    sub:'Every media card one rung wider than authored; text unmoved.',
    rows:K.quickRows({ space:1, spaceVals:['Compact 32', 'Comfortable 56', 'Spacious 72'], cap:0, credit:1,
      capHelp:`13.5 px in ${code('text-muted')}. ${b('Its width is the Caption alignment row below')}, not the measure.` }).concat([
      K.seg('Media steps up', ['One rung', 'Two rungs', 'Not at all'], 0,
        `Regular → 1,040 · regular → 1,296 · no change. ${b('Not at all makes this treatment 1 Plain')} ⚑ and is offered so a user can keep the caption behaviour without the width.`),
      K.seg('What steps up', ['Images', 'Images and galleries', 'Every media card'], 2,
        `${b('Every media card means image, gallery, embed and the product’s image')} ⚑ — never the bookmark’s thumbnail, which is furniture rather than media.`),
      K.seg('Caption alignment', ['To the measure', 'To the media'], 1,
        `${b('To the media is this treatment’s default and the reason it is a separate design')} ⚑ — the caption belongs to the picture here, not to the column.`)
    ]),
    settles:[
      `${b('A treatment may re-resolve the author’s width, and this is the design that proves it.')} Ghost gives regular, wide and full; ${b('the theme decides what each is')} ⚑, and A25·3 Sheet and A25·5 Full Bleed already set the precedent for a layout overruling the card module — this is the card module doing it deliberately.`,
      `${b('Wide and full collapsing to one width is named, not hidden.')} The alternative was a fourth rung past the content box, and that rung is a different treatment.`,
      `${b('Cut: a per-card width override.')} “Make this one image narrower” is expressible in Ghost — it is the author’s width class — and ${b('a treatment that added a second per-card control would put the same decision in two places')} ⚑.`
    ]
  },
  respCap:'TABLET 834 · NO WIDE COLUMN, SO NO STEP-UP · MOBILE 390 · EVERY WIDTH IS 350',
  tabletLabel:'834 · media 754 = the content box · the step-up has nowhere to go ⚑',
  mobileLabel:'390 · media 350 · caption 350 · space 32',
  respNote:`${b('The step-up needs a wide column and there is none below 1024')} ⚑, so at 834 every media card is the content box’s 754 and this treatment is 1 Plain with a caption that happens to be the same width as the measure. ${b('That is not a degradation, it is the ladder')} — and it is the reason the primary frame is drawn at 1440 and labelled 1440. ${b('At ≤ 767 caption alignment has no meaning')}: media and measure are both 350.`,
  darkNote:`${b('Dark changes nothing about width')} ⚑ — the resolution table is the same at both. What it changes is the ${b('placeholder')}: the striped fill goes to the dark pair, and ${b('a 1,040 image on a #171511 ground needs no border where the light mode’s #FBF9F5 sometimes wants one')} ⚑. The caption at ${code('text-muted')} on the dark ground is 6.1:1.`,
  spec:[[
    specRow(1, 'Descriptor', 'Every media card renders one rung wider than the width its author gave it — regular at the wide column’s 1,040, wide and full at the content box’s 1,296 — with the text at the measure and the caption aligned to the media.'),
    specRow(2, 'Structural descriptor', `${code('media frame · none · page · variable · edge · media one rung wider')}<br><span style="color:#6B6459">Archetype ${code('media frame')} rather than ${code('article body')} because ${b('the media, not the column, sets this design’s geometry')} ⚑. Media placement ${code('edge')}: the card reaches the content box’s edge but never the viewport’s — ${b('that is 5 Full Bleed, and it is the only slot between them')}.</span>`),
    specRow(3, 'Archetype', `media frame. Its ladder: the frame narrows to the container and the caption follows it. ${b('One departure')} — ${b('below 1024 the step-up has nowhere to go')} and every media card is the content box ⚑.`),
    specRow(4, 'Responsive rule', `${b('1440')} text 720; media regular → 1,040, wide → 1,296, full → 1,296; caption at the media’s width; space 56. ${b('834')} text 754; ${b('every media card 754')} ⚑; caption 754. ${b('≤ 767')} everything 350, space 32, ${b('caption alignment has no meaning')}.`),
    specRow(5, 'Content fields', FIELDS),
    specRow(6, 'Controls, in sidebar order', `${b('Space around cards')} Compact 32 · Comfortable 56 · Spacious 72. ${b('Captions')} Under, left · Under, centred · Hidden. ${b('Credit line')} With the caption · Its own line · Hidden. ${b('Media steps up')} One rung · Two rungs · Not at all. ${b('What steps up')} Images · Images and galleries · Every media card. ${b('Caption alignment')} To the measure · To the media. ${b('Then What Ghost owns')}, not counted.`)
  ], [
    specRow(7, 'Data', DATA),
    specRow(8, 'Empty state', `${b('A media card with no caption sits wide with nothing tying it to the column')} ⚑ — the known cost of this treatment, and the reason Caption alignment: To the measure exists. No caption → no ${code('&lt;figcaption&gt;')}, space closes. One gallery image → one image at the stepped-up width. ${b('A post with no media cards at all renders as 1 Plain')} ⚑ — nothing in this treatment applies, and nothing looks broken. No cards → nothing renders.`),
    specRow(9, 'Behaviour module', NOJS),
    specRow(10, 'Accessibility', `As 1 Plain, plus: ${b('at To the media the caption line runs 1,040 — about 130 characters — past the 80-character guidance')} ⚑, a named trade mitigated by a two-line maximum; To the measure is the accessible value and the panel says so. The figure/caption pair is unchanged. ${b('At 400 % zoom the step-up disappears')} with the wide column.`),
    specRow('—', 'Repeating items', REPEAT),
    `${b('Flagged ⚑')} — the treatment re-resolving the author’s width class; ${b('wide and full collapsing to one width')}; the bookmark’s thumbnail excluded from “every media card”; the 1,040 caption line as a named accessibility trade; ${b('no step-up below 1024')}; the cut per-card width override.`
  ]]
};

/* ── 5 · Full Bleed ────────────────────────────────────────────────────── */
const trBleed = { key:'bleed', contain:'none', rules:'both', pad:0, space:56, shadow:false,
  mediaW:(w, k) => k === 'regular' ? AM(w) : k === 'wide' ? BOX(w) : w,
  bleedAt:'full', capMode:'measure', capAlign:'left', credit:'own', calloutPlane:'tint', emoji:'shown', gutter:12 };

const d5 = {
  n:5, name:'Full Bleed', tr:trBleed, sceneOpt:{ imgWidth:'full' },
  rail:'A33 KOENIG CARD TREATMENTS · TREATMENT 5 OF 6 · PAPER PACK · SIX CONTROLS + WHAT GHOST OWNS',
  paras:[
    'A card marked full takes the viewport’s whole width and loses its corners; one marked wide takes the content box; one marked regular stays in the measure. The caption returns to the 720 column underneath.',
    'It is the treatment that gives an author a real full-width moment inside an article, and the one place in A33 where the radius token is deliberately not applied — a rounded corner against the window’s edge is a mistake, not a style.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · A FULL CARD AT THE VIEWPORT EDGE · NO RADIUS · CAPTION BACK IN THE MEASURE',
  primaryNote:`${b('Full means the viewport, not the container')} ⚑ — 1,440 here, and the card sits outside the 72 px margin every other element obeys. ${b('The radius is dropped at the bleed and only at the bleed')} ⚑: the pack’s token still governs regular and wide media, every plane and every button. ${b('The caption comes back to 720 and is left-aligned to the measure')}, which is the thread that keeps a bleeding photograph part of the article.`,
  rollNote:`${b('Only the five media cards can bleed')} ⚑ — image, gallery, embed, video and GIF. ${b('A callout at the viewport edge is a band, and bands are A32’s and A6’s, not a card treatment’s')}; a bookmark at 1,440 is unreadable. ${b('Everything that carries copy is 1 Plain’s, exactly')}, which is what keeps this treatment from becoming a page builder.`,
  rollNotes:{
    image:'THE CARD THIS TREATMENT EXISTS FOR · AT FULL IT LEAVES THE MARGIN AND THE RADIUS ⚑',
    gallery:'AT FULL, THREE PLATES ACROSS 1,440 WITH GHOST’S GUTTER · CONTROL: BLEED APPLIES TO',
    callout:'NEVER BLEEDS ⚑ · A CALLOUT AT THE VIEWPORT EDGE IS A BAND, AND A BAND IS A SECTION',
    header:'THE HEADER CARD IS THE ONE COPY CARD THAT MAY TAKE THE BOX · IT NEVER TAKES THE VIEWPORT ⚑'
  },
  widthNote:{ regular:'THE MEASURE', wide:'THE CONTENT BOX', full:'THE VIEWPORT, NO RADIUS' },
  widthsNote:`${b('Regular 720 · wide 1,296 · full the viewport')} ⚑. ${b('Wide skips the 1,040 column entirely in this treatment')} — with a viewport-edge rung in play, three widths that step 720 → 1,040 → 1,296 → 1,440 give four secondary widths and no hierarchy. ${b('Two visible rungs and one bleed is the whole ladder')}, and it is why this is a different design from 4 Wide rather than a control on it.`,
  statesNote:`${b('A bleeding image has no hover and no focus')} ⚑ — it is not a link unless the author made one, and A33 does not make one. ${b('No lightbox module is declared')}: the registry’s ${code('lightbox')} degrades to an ${code('&lt;a href&gt;')} per thumbnail, and Ghost’s image card is not a link, so declaring it would promise markup that is not there ⚑.`,
  absentNote:`${b('The caption is the only thing holding a bleed to the article')} ⚑, so its absence is the case that matters: at Caption on a bleed: In the measure the space below simply closes, and the next paragraph follows at the card’s spacing value. ${b('It looks intentional, which is the test')}.`,
  a11y:[
    `${b('A full-bleed figure is still a figure')} ⚑ — ${code('&lt;figure&gt;')} with its ${code('&lt;figcaption&gt;')} at 720 inside it, so the caption is read with the image however wide the image is.`,
    `${b('Nothing bleeds under a fixed header')}: A1’s sticky bar keeps its own stacking context and a bleeding card scrolls beneath it, not over it ⚑.`,
    `${b('No horizontal scroll at any width')} — the bleed is ${code('width:100vw')} with the scrollbar gutter accounted for, which is a build note as much as a design one ⚑.`,
    `${b('Caption on a bleed: Over the image, at the foot is the one value with a contrast condition')} ⚑ — it renders on A20·13’s warm scrim and is ${b('disabled, with its ratio shown, when the pack’s carried colour fails AA on the scrim')}.`
  ],
  a11yNote:`${b('The bleed is the one thing in A33 that can break a page rather than a card')} ⚑ — horizontal scroll, a fixed header, and a scrim over a photograph are all named here because each is a build condition, not a preference.`,
  controls:{
    name:'Full Bleed', n:5, count:'SIX',
    sub:'Full takes the viewport and loses its corners; wide takes the box.',
    rows:K.quickRows({ space:1, spaceVals:['Compact 32', 'Comfortable 56', 'Spacious 72'], cap:0, credit:1 }).concat([
      K.seg('Full resolves to', ['Content 1296', 'Viewport edge'], 1,
        `${b('At Content 1296 this treatment is 1 Plain')} ⚑ — offered so a publication can keep the two-rung ladder without the bleed, on a site whose layout has no room for one.`),
      K.seg('Bleed applies to', ['Images', 'Images and galleries', 'Every media card'], 1,
        `${b('Every media card includes the embed')}, and an embedded iframe at 1,440 is 810 px tall ⚑ — offered, and not the default for that reason.`),
      K.seg('Caption on a bleed', ['In the measure', 'Under, full width', 'Over the image, at the foot'], 0,
        `${b('In the measure is the default and the only value that keeps one text column')} ⚑. Over the image uses A20·13’s warm scrim and ${b('is disabled where the carried colour fails AA')}, with the ratio shown.`)
    ]),
    settles:[
      `${b('The radius token is not applied at the viewport edge, and that is not a violation of §3·1.')} ⚑ The token governs every corner that exists; ${b('a bleeding card has two corners, not four')}, and rounding the two that meet the window is the defect the rule was written to prevent.`,
      `${b('Wide skips 1,040 here.')} Four secondary widths in one article is no hierarchy at all, so this treatment runs 720 → 1,296 → viewport and says so in the panel.`,
      `${b('Cut: a scrim-strength control and a bleed-height control.')} The scrim is A20·13’s, one value, already contrast-checked; ${b('a height control on a photograph crops the author’s picture')} ⚑ and A19 settled that a section never crops what it was given.`
    ]
  },
  respCap:'TABLET 834 · THE BLEED IS THE VIEWPORT · MOBILE 390 · THE BLEED IS 390 AND THE MARGIN IS 20',
  tabletLabel:'834 · full = 834 · wide = 754 · regular = 754 · caption 690',
  mobileLabel:'390 · full = 390 · everything else 350 · caption 350',
  respNote:`${b('The bleed is the one thing that gets better as the screen narrows')} ⚑ — at 390 a full card is 390 wide against a 350 measure, so it reads as a picture that has left the margin rather than as a banner. ${b('The caption keeps the 20 px margin at every width')} ⚑, which is what makes the bleed legible as a decision. ${b('At 834 wide is 754 and regular is 754')}: the two visible rungs collapse into one below 1024, and only the bleed remains distinct.`,
  darkNote:`${b('A bleeding photograph on a #171511 ground is the strongest frame in this pack')} ⚑ and it needs the least work: no border, no scrim, no shadow. ${b('The one change is the placeholder pair')}, and ${b('the caption at 20 px from the edge is 6.1:1')}. ${b('At Caption over the image the scrim is re-checked')} — the warm scrim carries #FBF9F5 in both modes, and the ratio is drawn in the panel rather than assumed.`,
  spec:[[
    specRow(1, 'Descriptor', 'A media card marked full takes the viewport’s whole width and drops its corner radius; wide takes the content box; regular stays in the measure; the caption returns to the 720 column beneath. Copy cards are 1 Plain’s, unchanged.'),
    specRow(2, 'Structural descriptor', `${code('media frame · none · page · variable · full-bleed · the viewport-edge bleed')}<br><span style="color:#6B6459">Media placement ${code('full-bleed')} is the only slot that separates this from 4 Wide, and it is the right one: ${b('4 Wide reaches the container’s edge, this reaches the window’s')} ⚑.</span>`),
    specRow(3, 'Archetype', `media frame. ${b('Two departures')}: the bleed is the viewport at every width including 390, and ${b('wide skips the 1,040 rung')} ⚑.`),
    specRow(4, 'Responsive rule', `${b('1440')} regular 720, wide 1,296, ${b('full 1,440 with no radius and no margin')}; caption 720 left-aligned to the measure; space 56. ${b('834')} regular and wide both 754, full 834, caption 690. ${b('≤ 767')} regular and wide 350, ${b('full 390')}, caption 350 on the 20 margin, space 32.`),
    specRow(5, 'Content fields', FIELDS),
    specRow(6, 'Controls, in sidebar order', `${b('Space around cards')} Compact 32 · Comfortable 56 · Spacious 72. ${b('Captions')} Under, left · Under, centred · Hidden. ${b('Credit line')} With the caption · Its own line · Hidden. ${b('Full resolves to')} Content 1296 · Viewport edge. ${b('Bleed applies to')} Images · Images and galleries · Every media card. ${b('Caption on a bleed')} In the measure · Under, full width · Over the image, at the foot — ${b('the last value disabled with its ratio shown where the carried colour fails AA on the scrim')} ⚑. ${b('Then What Ghost owns')}, not counted.`)
  ], [
    specRow(7, 'Data', DATA),
    specRow(8, 'Empty state', `${b('A bleed with no caption closes its space and the next paragraph follows at the spacing value')} ⚑ — no empty band, no placeholder line. A gallery with one image bleeds as one image. ${b('An author who marks no card full sees 1 Plain with a 1,296 wide rung')} ⚑ — the treatment is not broken by the absence of the thing it is for. No cards → nothing renders.`),
    specRow(9, 'Behaviour module', `${NOJS} ${b('This design deliberately declares no')} ${code('lightbox')} ⚑ — the registry’s degradation is “Each thumbnail is an ${code('&lt;a href&gt;')} to the full-size image”, and Ghost’s image card is not a link unless the author made one, so declaring it would promise markup the page does not have.`),
    specRow(10, 'Accessibility', `As 1 Plain, plus: ${b('the figure keeps its caption at 720 however wide the image is')}; ${b('no horizontal scroll at any width')} — ${code('100vw')} with the scrollbar gutter accounted for ⚑; ${b('a bleeding card scrolls beneath A1’s sticky bar, never over it')} ⚑; ${b('Caption over the image renders on A20·13’s warm scrim and is disabled with its ratio shown where the carried colour fails AA')}.`),
    specRow('—', 'Repeating items', REPEAT),
    `${b('Flagged ⚑')} — ${b('the radius token not applied at the viewport edge')}; wide skipping the 1,040 rung; only media cards bleeding, and the header card never; ${b('no')} ${code('lightbox')} ${b('declared, with the reason')}; the ${code('100vw')} scrollbar note; the sticky-header stacking note; the scrim value disabled on contrast; the cut scrim-strength and bleed-height controls.`
  ]]
};

/* ── 6 · Contrast Band ─────────────────────────────────────────────────── */
const trBand = { key:'band', contain:'band', rules:'none', pad:32, space:56, shadow:false,
  planeW:w => WIDE(w), mediaW:STD_MEDIA, capMode:'measure', capAlign:'left', credit:'own', gutter:12 };

const d6 = {
  n:6, name:'Contrast Band', tr:trBand,
  rail:'A33 KOENIG CARD TREATMENTS · TREATMENT 6 OF 6 · PAPER PACK · SIX CONTROLS + WHAT GHOST OWNS',
  paras:[
    'The cards that carry copy sit on the inverted contrast colour at the wide column, carrying the pack’s carried text; the cards that carry photographs stay on the page ground, untouched. Callout, toggle, bookmark, button, product, file and header invert. Image, gallery and embed do not.',
    'It is the loudest treatment in the category and the one with the firmest rule: A19 settled that no design filters, dims or tints a photograph, and a contrast band under a photograph is a tint by another name.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · BAND 1,040 · CONTENT 720 · COPY CARDS INVERT, MEDIA DOES NOT ⚑',
  primaryNote:`${b('The band is the pack’s contrast token carrying its carried colour')} — ${code('#232019')} carrying ${code('#FBF9F5')} in Paper light ⚑ — and it takes the wide column’s 1,040 with the content held at 720, exactly as 3 Panel’s plane does. ${b('The single accent in the section is the button card, and on the band it becomes the carried colour')} ⚑: A17·7’s on-contrast derivation, carried without exception. ${b('The image card above sits on the page ground and is untouched')}.`,
  rollNote:`${b('Eleven cards take the band, five never do, and four have no plane to invert.')} The five are image, gallery, embed, video and GIF — ${b('the photograph rule')} ⚑; the four are markdown, the divider, the public-preview marker and email content. ${b('The product card is the interesting case')}: it carries a photograph inside a copy card, and the answer is that the card inverts and the photograph keeps its own plane, which is the only reading of A19’s rule that survives contact with this card.`,
  rollNotes:{
    image:'DOES NOT INVERT ⚑ · A19: NO DESIGN FILTERS, DIMS OR TINTS A PHOTOGRAPH',
    product:'THE CARD INVERTS, THE PHOTOGRAPH KEEPS ITS OWN PLANE ⚑ · THE HARDEST CASE IN THE CATEGORY',
    button:'THE ACCENT BECOMES THE CARRIED COLOUR ON THE BAND · A17·7, CARRIED',
    header:'THE HEADER CARD TAKES THE BAND · IT IS THE ONE CARD DESIGNED FOR ONE ⚑'
  },
  widthNote:{ regular:'THE MEASURE, ON THE PAGE GROUND', wide:'THE WIDE COLUMN', full:'A17’S CONTENT BOX' },
  widthsNote:`${b('Media resolves as 1 Plain does — 720 · 1,040 · 1,296 — and none of it inverts')} ⚑. ${b('The band’s own width is a separate control')} (Measure 720 · Wide 1040 · Content 1296) and it defaults to 1,040 so that a band and a wide image share one secondary width, which is 3 Panel’s argument reused deliberately.`,
  statesNote:`${b('Every state re-derives on the band and none of them uses the accent')} ⚑. The bookmark’s hover is the carried colour at 8 % over the band, not the hover token; ${b('the focus ring is 2 px of the carried colour, not the accent')} ⚑ — A17·7’s rule, and the reason the ring is drawn twice in this frame. The toggle’s divider is the carried colour at 20 %.`,
  absentNote:`${b('An empty field on a band is more visible than an empty field on a page')} ⚑, and the answer is the same: the element leaves. ${b('The one addition is the bookmark with no thumbnail')} — on the band its text takes the whole content column, and the 168 px the thumbnail would have occupied is not held open.`,
  a11y:[
    `${b('The band is where contrast is re-checked rather than assumed')} ⚑. Paper light: carried ${code('#FBF9F5')} on ${code('#232019')} is 14.8:1 for body, and the muted derivation at 72 % is 8.2:1. Paper dark: ${code('#171511')} on ${code('#EDE7DA')} is 14.1:1, muted 7.9:1.`,
    `${b('The accent is not used on the band at all')} ⚑ — #D96C3F on #232019 is 3.4:1 and fails for a button fill, which is why the action becomes the carried colour. ${b('The control that offers the accent shows the failing ratio and is disabled')}, never silently allowed.`,
    `${b('The band is a')} ${code('&lt;div&gt;')} ${b('with no role')}, like every other plane in A33.`,
    `${b('A photograph never sits on the band')} ⚑, so there is no scrim, no filter and no contrast question for image, gallery or embed.`
  ],
  a11yNote:`${b('Every colour on the band is derived from two tokens')} — contrast and carried — ${b('and every derivation is stated with its ratio')} ⚑. That is what makes this treatment survive a pack change, which is the only test that matters here.`,
  controls:{
    name:'Contrast Band', n:6, count:'SIX',
    sub:'Copy cards on the inverted band; photographs on the page ground.',
    perCard:'The band, its width and what inverts are set here for every card at once. Thumbnail side, chevron side and the rest stay in each card’s own panel — C.1, unchanged. The per-card panels show the on-band variant when this treatment is active.',
    rows:K.quickRows({ space:1, spaceVals:['Compact 32', 'Comfortable 56', 'Spacious 72'], cap:0, credit:1,
      capHelp:`13.5 px. ${b('A caption belongs to a media card, and media cards do not invert')} ⚑ — so captions in this treatment are always on the page ground.` }).concat([
      K.seg('Band width', ['Measure 720', 'Wide 1040', 'Content 1296'], 1,
        `${b('1,040 by default so a band and a wide image share one secondary width')} ⚑. Below 1024 the band is the content box; below 768 it is the measure.`),
      K.seg('Which cards invert', ['Callout only', 'Every copy card', 'Copy cards and the header'], 1,
        `${b('Image, gallery, embed, video and GIF never invert at any value')} ⚑ — A19’s photograph rule is not a control. Every copy card means callout, toggle, bookmark, button, product, file, call to action, audio, HTML and signup.`),
      K.seg('Action on the band', ['The carried colour', 'The accent, re-checked'], 0, undefined, [1]),
      `<div style="display:flex;flex-direction:column;gap:5px;margin-top:-9px"><span style="font-size:11px;color:#6E6A64;line-height:1.5">${b('The accent is disabled in Paper: #D96C3F on #232019 is 3.4:1 and fails AA')} ⚑. The value is shown struck through with its ratio rather than removed, because it passes in four of the twelve packs.</span></div>`
    ]),
    settles:[
      `${b('The photograph rule is not a control.')} ⚑ Five of the twenty cards never invert, at any value, in any pack — and the panel states it in the control’s help text rather than leaving a user to discover that Which cards invert has no effect on their image.`,
      `${b('A failing value is disabled with its ratio, never silently allowed.')} §7·4, and this is the category’s one instance of it: Action on the band offers the accent, shows 3.4:1, and strikes it out in Paper.`,
      `${b('Cut: a band-colour control and a per-card invert list.')} Colour is the pack’s contrast role; ${b('a per-card list would put ten checkboxes in a site-wide panel')} ⚑ and the first thing a user would do with it is invert their photographs.`
    ]
  },
  respCap:'TABLET 834 · THE BAND IS THE CONTENT BOX · MOBILE 390 · THE BAND IS THE MEASURE',
  tabletLabel:'834 · band 754 = content box · content 690 · padding 32',
  mobileLabel:'390 · band 350 = the measure · content 302 · padding 24 · space 32',
  respNote:`${b('The band follows 3 Panel’s ladder exactly')} ⚑ — content box at 834, measure at ≤ 767 — and ${b('at 390 a band at the measure with 24 px of padding is the strongest card treatment on a phone')}, because inversion is the one signal that survives a 350 px column. ${b('The content column is 302 at 390')}, stated in the panel.`,
  darkNote:`${b('In dark the band inverts the other way')}: contrast is ${code('#EDE7DA')} carrying ${code('#171511')} ⚑, so a dark article gets a light band — re-tuned, never inverted, and the phrase means something specific here. ${b('The photograph cards are unchanged in both modes')}, which is what stops the article from looking like two different pages. ${b('Body on the dark band is 14.1:1 and the muted derivation 7.9:1')}; ${b('the accent fails on this ground too')} — 3.6:1 — and stays disabled.`,
  spec:[[
    specRow(1, 'Descriptor', 'The copy-bearing cards on the pack’s inverted contrast colour at the wide column, carrying the carried text; the photograph cards — image, gallery, embed — left on the page ground untouched.'),
    specRow(2, 'Structural descriptor', `${code('article body · box · contrast · variable · inline · the inverted card plane')}<br><span style="color:#6B6459">Ground ${code('contrast')} is the only slot that separates this from 3 Panel, and ${b('ground is what earns a design its place')} — the same plane on ${code('surface')} and on ${code('contrast')} are two treatments, and this slot is what says so.</span>`),
    specRow(3, 'Archetype', `article body. ${b('Three departures')}: the band becomes the content box at 834 and the measure at ≤ 767; ${b('the content column is 302 at 390')}; ${b('five of the twenty cards never take the band')} ⚑.`),
    specRow(4, 'Responsive rule', `${b('1440')} band 1,040 centred, content 720, padding 32, space 56; media 720 · 1,040 · 1,296 on the page ground. ${b('834')} band 754, content 690. ${b('≤ 767')} band 350, content 302, padding 24, space 32 ⚑.`),
    specRow(5, 'Content fields', FIELDS),
    specRow(6, 'Controls, in sidebar order', `${b('Space around cards')} Compact 32 · Comfortable 56 · Spacious 72. ${b('Captions')} Under, left · Under, centred · Hidden. ${b('Credit line')} With the caption · Its own line · Hidden. ${b('Band width')} Measure 720 · Wide 1040 · Content 1296. ${b('Which cards invert')} Callout only · Every copy card · Copy cards and the header. ${b('Action on the band')} The carried colour · The accent, re-checked — ${b('the second value disabled in Paper with 3.4:1 shown')} ⚑. ${b('Then What Ghost owns')}, not counted.`)
  ], [
    specRow(7, 'Data', DATA),
    specRow(8, 'Empty state', `As 1 Plain, with one addition: ${b('a bookmark with no scraped thumbnail takes the whole content column on the band and the 168 px is not held open')} ⚑. ${b('A post whose only cards are images renders with no band at all')} ⚑ — the treatment is invisible, and that is correct rather than broken. No cards → nothing renders.`),
    specRow(9, 'Behaviour module', NOJS),
    specRow(10, 'Accessibility', `As 1 Plain, plus every derivation stated: ${b('carried on contrast 14.8:1 light and 14.1:1 dark')}, the muted derivation 8.2:1 and 7.9:1, ${b('the accent 3.4:1 and 3.6:1 — failing, disabled, shown')} ⚑. ${b('The focus ring on the band is 2 px of the carried colour, not the accent')} ⚑. The band is a ${code('div')} with no role. ${b('No photograph ever sits on the band')}, so there is no scrim and no contrast question for the five media cards.`),
    specRow('—', 'Repeating items', REPEAT),
    `${b('Flagged ⚑')} — ${b('five cards never inverting, at any control value')}; the product card inverting while its photograph keeps its own plane; the band defaulting to 1,040 to share the wide media rung; ${b('the accent disabled with its ratio rather than removed')}; the focus ring re-derived on the band; the 302 content column at 390; the cut band-colour and per-card invert controls.`
  ]]
};

return [d4, d5, d6];
})();
