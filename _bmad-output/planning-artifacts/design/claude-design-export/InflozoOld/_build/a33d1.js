// A33 designs 1–3 · Plain · Card · Panel
globalThis.A33D1 = (function () {
const K = globalThis.A33LIB;
const { L, D, MONO, PK, b, code, tile, specRow } = K;
const AM = K.AM, WIDE = K.WIDE, BOX = K.BOX;

const STD_MEDIA = (w, k) => k === 'regular' ? AM(w) : k === 'wide' ? WIDE(w) : BOX(w);
const NOJS = `${b('Modules:')} ${code('accordion')} for the toggle card, ${code('core')} for everything else — ${b('the same two in all six treatments')}, because a treatment is a stylesheet ⚑. ${b('Edit-safe:')} yes; the resting state is the only state and nothing animates, posts or pins while the post is edited. ${b('No-JS:')} ${b('the registry’s quoted degradation for')} ${code('accordion')} ${b('does not hold here')} ⚑ — Ghost’s toggle card is a plain container with an ${code('h4')} and a ${code('button')} rather than disclosure markup, so ${b('with JavaScript off it cannot open')}. A33 still declares ${code('accordion')} as the nearest module and drops the quote. ${code('core')} — “Never runs; the ${code('.js-enabled')} class is never set, so all JS-conditional CSS stays in its no-JS branch.” ${b('Fourteen of the twenty cards are identical with JavaScript off; six depend on a script, and every one of those scripts is Ghost’s or the provider’s')} ⚑ — the toggle’s open and close, the gallery’s row ratios, the two players, the signup card’s post and the embed’s provider markup, and the registry has no module for any of them. That is a finding for the architect, not a degradation A33 may quote.`;
const FIELDS = `${b('The whole category union, every time')} ⚑ — a treatment cannot decline a card the author inserted. Authored: ${code('image.src')} (file, required), ${code('image.alt')} (text ≤ 125), ${code('image.caption')} (rich text, optional), ${code('image.width')} (regular · wide · full), ${code('gallery.images[]')} (1–9 files, ordered), ${code('gallery.caption')}, ${code('bookmark.url')}, ${code('callout.text')} (required) + ${code('callout.emoji')} + ${code('callout.colour')} (nine values), ${code('toggle.heading')} + ${code('toggle.content')} (both required), ${code('button.label')} (≤ 40) + ${code('button.url')} + ${code('button.align')}, ${code('embed.url')}, ${code('product.title')} + ${code('product.description')} + ${code('product.image')} + ${code('product.rating')} (1–5) + ${code('product.buttonLabel')}/${code('buttonUrl')}, ${code('file.file')} + ${code('file.title')} + ${code('file.description')}, ${code('header.heading')} + ${code('header.subheading')} + ${code('header.buttonLabel')}/${code('buttonUrl')} + ${code('header.size')} + ${code('header.style')} + ${code('header.backgroundImage')}, ${code('markdown.md')} (rich text, no wrapper class), ${code('html.html')} + ${code('html.visibility')} (public · free · paid), ${code('email.greeting')} + ${code('email.fallback')} + ${code('email.text')} (newsletter only), ${code('cta.text')} + ${code('cta.image')} + ${code('cta.sponsorLabel')} + ${code('cta.buttonLabel')}/${code('buttonUrl')} + ${code('cta.background')} + ${code('cta.visibility')} + ${code('cta.showOn')} (web · newsletter · both), ${code('audio.file')} + ${code('audio.title')} + ${code('audio.thumbnail')}, ${code('video.file')} + ${code('video.poster')} + ${code('video.loop')} + ${code('video.width')}, ${code('signup.heading')} + ${code('signup.subheading')} + ${code('signup.disclaimer')} + ${code('signup.buttonText')} + ${code('signup.layout')} + ${code('signup.background')} + ${code('signup.label')}. ${b('Three cards carry no fields a treatment can read')}: the divider, the public-preview marker and the GIF (which is an image card) ⚑. Read-only, scraped or derived: the bookmark’s title, description, icon, author, publisher and thumbnail; the embed’s provider markup; the file’s name and size.`;
const DATA = `${b('Everything comes from')} ${code(K.hb('content'))} ${b('as Ghost renders it')} — A33 adds no markup of its own ⚑. ${b('Zero cards → the treatment renders nothing at all')}: no wrapper, no padding, no trace, because there is nothing to select for. ${b('One card')} → it takes its own space and the article closes around it. ${b('Many')} → the rhythm is the space value, repeated; ${b('two cards of the same type in a row keep one space between them, not two')} ⚑. The same treatment renders on pages, and above a paywall cut inside A32’s preview.`;
const REPEAT = `${b('One authored array in the whole category:')} ${code('gallery.images[]')} ⚑. ${b('Its Add, Remove and Reorder are Koenig’s, on the canvas, not in this sidebar')} — the images belong to the post. ${b('Minimum 1, maximum 9')} (Ghost’s limit); at 1 it renders as a single image at the card’s width, at 9 as three rows of three, and ${b('at 0 the card cannot exist')} — Ghost deletes an empty gallery card. ${b('No control in A33 styles one image, one card or one post')} ⚑: a value is written once, site-wide. Inside a card the author edits content only — text, image, link — never its layout.`;

/* ── 1 · Plain ─────────────────────────────────────────────────────────── */
const trPlain = { key:'plain', contain:'none', rules:'both', pad:0, space:48, shadow:false,
  mediaW:STD_MEDIA, capMode:'measure', capAlign:'left', credit:'own', calloutPlane:'tint', emoji:'shown', gutter:12 };

const d1 = {
  n:1, name:'Plain', tr:trPlain,
  rail:'A33 KOENIG CARD TREATMENTS · TREATMENT 1 OF 6 · PAPER PACK · SIX CONTROLS + WHAT GHOST OWNS',
  paras:[
    'Nothing is raised and nothing is boxed. Every card sits directly on the page ground at the article’s measure, and the six cards that must read as one object — HTML, bookmark, toggle, audio, file, product — are bounded by a single hairline above and below rather than by a frame.',
    'It is the category default and the treatment the other five depart from. A callout keeps a tinted plane, because a callout that loses its plane stops being a callout; everything else loses its container and keeps its content.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE ARTICLE AT THIS TREATMENT · MEASURE 720 · SPACE COMFORTABLE 48 · RULES ABOVE AND BELOW',
  primaryNote:`${b('The measure is A25’s and A33 never changes it')} — 720 at 1440 ⚑. What A33 owns is the space above and below each card (48 here), the plane under it (none here), the caption’s size and place, and ${b('what the author’s width class resolves to')}. ${b('The hairline is the pack’s border token at 1 px')} and it runs the measure exactly, so a card’s boundary and a paragraph’s left edge line up.`,
  rollNote:`${b('Twenty cards, one vocabulary.')} The hairline pair does the work of a frame for bookmark, toggle, file and product; ${b('the callout keeps a tinted plane at the pack’s hover surface')} ⚑ and the button card keeps Ghost’s accent fill, which is the author’s and not a treatment value. ${b('The header card is the one card that is never plain')} ⚑ — it ships with its own surface in Ghost and A33 gives it the pack’s surface at the wide column.`,
  rollNotes:{
    callout:'THE ONE PLANE IN THIS TREATMENT · HOVER SURFACE, PACK RADIUS · CONTROL: TINTED · HAIRLINE BOX · NONE',
    button:'THE FILL IS THE SITE ACCENT AND GHOST OWNS IT · A33 OWNS HEIGHT, PADDING AND CORNERS ⚑',
    header:'DRAWN TO THE TILE HERE · IN THE PAGE THE HEADER CARD TAKES THE CONTENT BOX, 1,296',
    embed:'THE FRAME AND THE CAPTION ARE A33’S · THE IFRAME’S CONTENTS ARE THE PROVIDER’S ⚑'
  },
  widthNote:{ regular:'THE MEASURE', wide:'THE WIDE COLUMN', full:'A17’S CONTENT BOX' },
  widthsNote:`${b('Regular 720 · wide 1,040 · full 1,296')} — the default resolution, and the one 2 Card and 3 Panel keep ⚑. ${b('The caption returns to the measure whatever the media does')}: at wide and full the caption block is 720 wide and centred, so its left edge sits on the paragraph’s left edge and the eye keeps one column of text. ${b('Below 1024 there is no wide column')} ⚑ — wide and full both resolve to the content box, which at 834 is 754 and at 390 is 350.`,
  statesNote:`${b('One hover per card and never two')}. The bookmark’s whole card is one link, so ${b('its hover is the surface stepping to the hover token and nothing moving')} ⚑ — no lift, no scale, no shadow appearing. The button card derives its hover from the accent at 93 % brightness, A32’s rule carried. ${b('Focus is A6’s 2 px accent ring at a 4 px offset')} in every card that is focusable, and the toggle’s only focus stop is Ghost’s ${code('button')} ⚑ — the card is not disclosure markup.`,
  absentNote:`${b('An absent optional field removes its element and never leaves a slot')} ⚑. The rule that matters most here: ${b('a bookmark Ghost could not scrape a thumbnail for gets no grey box')} — the text takes the full width, which is A19’s missing-image rule carried into the card module.`,
  a11y:[
    `${b('The hairline is decoration and carries no role')} ⚑. A screen reader hears the bookmark’s title, then its description, then its publisher line — the visual boundary is not announced, and does not need to be.`,
    `${b('The callout’s emoji carries')} ${code('aria-hidden="true"')} ⚑ so the text is not prefixed with “pushpin”. If the author writes a callout that is nothing but an emoji, the glyph is the content and the attribute is dropped — a build rule, flagged.`,
    `${b('Caption Hidden hides the caption, never the alt text')} ⚑. ${code('image.alt')} is Ghost’s field and no treatment in A33 reaches it.`,
    `${b('Contrast:')} body 16.5 px at ${code('text')} on ${code('background')} is 12.6:1; captions at ${code('text-muted')} are 5.4:1; the tinted callout’s text on the hover surface is 11.8:1. All pass AA at these sizes.`
  ],
  a11yNote:`${b('The markup is Ghost’s and the treatment’s job is to not break it')} ⚑ — which is why every A33 design shares this frame and only the last card differs. ${b('The one thing a treatment can break is the heading outline')}: the toggle’s heading and the header card’s heading must stay where Ghost put them.`,
  controls:{
    name:'Plain', n:1, count:'SIX',
    sub:'No plane, no box. Hairlines where a card needs a boundary.',
    rows:K.quickRows({ space:1, cap:0, credit:1 }).concat([
      K.seg('Rules', ['Above and below', 'Below only', 'None'], 0,
        `The hairline pair on the six cards that need a boundary — HTML, bookmark, toggle, audio, file, product. ${b('Never on a media card')} ⚑ — a rule under a photograph reads as a caption that failed to load — and never on markdown, the divider, the preview marker or email content, which have no plane of their own.`),
      K.seg('Tinted cards', ['Tinted', 'Hairline box', 'None'], 0,
        `The pack’s hover surface · a 1 px border with no fill · nothing. ${b('It governs the two cards that carry a plane in this treatment')} ⚑ — the callout and the call to action. ${b('At None the callout is a paragraph with an emoji')}, which is why it is not the default.`),
      K.seg('Emoji', ['Shown', 'Hidden'], 0,
        `Ghost’s own emoji field. ${b('Hidden hides every callout’s glyph site-wide')} ⚑ — there is no per-callout control, by construction.`)
    ]),
    settles:[
      `${b('Six controls, and not one of them is a colour, a font or a radius.')} Colour is the pack’s seven roles, type is the pack’s pairing, ${b('and the radius token answers C.1’s “corners” for all eleven cards that listed it')} ⚑. A treatment that offered corners would mix radii the moment a user changed pack.`,
      `${b('Rules exclude media by rule, not by taste.')} The control names the six cards it applies to and the help text says why the other fourteen are exempt — the same pattern as A32’s fade suppression: ${b('the amount is the user’s, the rule is the design’s')}.`,
      `${b('Two cards keep a plane in a treatment called Plain')} ⚑ — the callout and the call to action — and the control is named Tinted cards rather than Callout plane so nobody meets a third behaviour they were not told about. Cut: a per-card plane control (that is 2 Card), a plane-width control (3 Panel), and a caption-over-image value — ${b('a caption over a photograph is A19’s scrim, not a card treatment')}.`
    ]
  },
  respCap:'TABLET 834 · MEASURE 754 · MOBILE 390 · MEASURE 350 · THE ARTICLE-BODY LADDER, NOT A SECTION’S',
  tabletLabel:'834 · measure 754 · wide and full both resolve to 754 · space 48',
  mobileLabel:'390 · measure 350 · every width resolves to 350 · space 32',
  respNote:`${b('The archetype’s ladder, unaltered')}: the measure narrows with the page and nothing rearranges. Two departures, both stated: ${b('space steps to 32 at ≤ 767 whatever the control says')} ⚑ — 48 above and below every card on a phone is a scroll of empty ground — and ${b('the bookmark’s thumbnail moves above its text at ≤ 767')} rather than shrinking to a stamp. ${b('The gallery keeps Ghost’s own rows at 834 and becomes one column at 390')}, which is Ghost’s behaviour and not A33’s ⚑.`,
  darkNote:`${b('Re-tuned, never inverted')}: background deepens to ${code('#171511')}, ${b('surfaces lift one step')} to ${code('#211D17')}, the hairline is ${code('#332E27')}, and ${b('the warm shadows are dropped entirely rather than darkened')} ⚑ — a shadow on a dark ground is a smudge. ${b('The callout’s tint becomes the dark hover token')}, not a lighter version of the light one. ${b('The accent re-checks at 4.9:1')} for ${code('#171511')} on ${code('#E0805A')}, so the button card keeps the accent fill. ${b('The striped image placeholder changes too')} — cards are the one place a theme must look at its own placeholders in both modes.`,
  spec:[[
    specRow(1, 'Descriptor', 'Every card on the page ground at the article’s measure, with no plane and no frame; a single hairline above and below the cards that must read as one object, and a tinted plane on the callout alone. The category default.'),
    specRow(2, 'Structural descriptor', `${code('article body · none · page · variable · inline · hairline rules only')}<br><span style="color:#6B6459">${b('In A33 the tuple’s containment and ground slots describe the card, not a section')} ⚑ — A33 has no section of its own; it is CSS over the cards inside A25’s. Containment ${code('none')} and ground ${code('page')} are what 2 Card, 3 Panel and 6 Contrast Band each change exactly one of.</span>`),
    specRow(3, 'Archetype', `article body. Its ladder: the measure narrows with the page and nothing rearranges. ${b('Two departures')} — space steps to 32 at ≤ 767, and the bookmark’s thumbnail moves above its text at ≤ 767 ⚑.`),
    specRow(4, 'Responsive rule', `${b('1440')} measure 720 centred in the 1,296 box on a 72 margin; wide 1,040, full 1,296; space 48; caption 13.5 at the measure. ${b('834')} measure 754, wide and full both 754 — there is no wide column below 1024 ⚑ — space 48. ${b('≤ 767')} measure 350 on a 20 margin, every width 350, ${b('space 32')}, bookmark thumbnail above its text, gallery one column (Ghost’s own collapse).`),
    specRow(5, 'Content fields', FIELDS),
    specRow(6, 'Controls, in sidebar order', `${b('Space around cards')} Compact 32 · Comfortable 48 · Spacious 64. ${b('Captions')} Under, left · Under, centred · Hidden. ${b('Credit line')} With the caption · Its own line · Hidden. ${b('Rules')} Above and below · Below only · None — ${b('on HTML, bookmark, toggle, audio, file and product only')} ⚑. ${b('Tinted cards')} Tinted · Hairline box · None — ${b('governs the callout and the call to action')} ⚑. ${b('Emoji')} Shown · Hidden. ${b('Then the six read-only rows of What Ghost owns')}, identical in all six treatments and not counted.`)
  ], [
    specRow(7, 'Data', DATA),
    specRow(8, 'Empty state', `No caption → no ${code('&lt;figcaption&gt;')} and the space below returns to the card’s spacing value, never an empty line ⚑. No credit → the caption is one line. ${b('No scraped thumbnail → the bookmark’s text takes the full width and no grey box appears')} ⚑ (A19’s rule). One gallery image → one image at the card’s width. No product image → title, description, rating and button keep the card’s padding. No emoji → the callout’s text takes the full plane. ${b('No cards at all → nothing renders')}; in the editor the Cards panel shows the treatment’s preview against the C.4 style-guide fixture rather than an empty canvas ⚑.`),
    specRow(9, 'Behaviour module', NOJS),
    specRow(10, 'Accessibility', `${code('&lt;figure&gt;')}/${code('&lt;figcaption&gt;')} kept paired on image, gallery and embed. Bookmark: one ${code('&lt;a&gt;')}, one focus stop, thumbnail ${code('aria-hidden')}, title as the accessible name. Toggle: a plain ${code('div')} holding an ${code('h4')} and a ${code('button')} — ${b('not disclosure markup')} ⚑; the heading level is Ghost’s, the button is the only focus stop, and no stylesheet can add the ${code('aria-expanded')} it lacks. Button card: ${code('&lt;a&gt;')} at 48 px, 44 px minimum target. Product: ${b('Ghost renders the rating as stars with no text equivalent and a theme cannot add one')} — a Ghost limitation ⚑. File: the link names the file and its size. Header: ${code('h2')}, never promoted to ${code('h1')}. ${b('The hairline carries no role')}; the callout’s emoji carries ${code('aria-hidden')}. Focus order is document order in every treatment ⚑.`),
    specRow('—', 'Repeating items', REPEAT),
    `${b('Flagged ⚑')} — the tuple describing the card rather than a section; the hairline pair as containment, on six named cards; ${b('the callout and the call to action keeping a plane in a treatment called Plain')}; the radius token answering C.1’s per-card “corners”; space 32 at ≤ 767 overriding the control; the bookmark thumbnail moving above its text; ${b('Ghost’s gallery row script having no registry module')}; the credit being the caption’s trailing ${code('&lt;em&gt;')} run rather than a field.`
  ]]
};

/* ── 2 · Card ──────────────────────────────────────────────────────────── */
const trCard = { key:'card', contain:'card', rules:'none', pad:24, space:48, shadow:true,
  mediaW:(w, k) => STD_MEDIA(w, k) - 48, capMode:'measure', capAlign:'left', credit:'own', gutter:12 };

const d2 = {
  n:2, name:'Card', tr:trCard,
  rail:'A33 KOENIG CARD TREATMENTS · TREATMENT 2 OF 6 · PAPER PACK · SIX CONTROLS + WHAT GHOST OWNS',
  paras:[
    'Every card sits on a surface panel: a hairline, the pack’s radius, the warm sm shadow and 24 px of padding. The media cards are included — an image is a photograph inside a panel with its caption below it, in the same box.',
    'It is the treatment that makes a post look assembled rather than typeset. The panel is what changes; the arrangement inside every card is 1 Plain’s, unchanged.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · PANELS AT THE MEASURE · HAIRLINE AND SHADOW · PADDING COMFORTABLE 24',
  primaryNote:`${b('The panel is 720 wide, not 768')} ⚑ — the media inside it is 672 so that the panel’s outer edge, not the image’s, sits on the measure. ${b('That is the decision this treatment turns on')}: a panel that padded outward would put every card 48 px wider than the paragraphs above it, and the article would read as two columns of different widths. ${b('The shadow is the pack’s sm')} — ${code('0 1px 2px rgba(28,27,26,.06)')} — and it is dropped entirely in dark mode.`,
  rollNote:`${b('Twenty cards, one panel.')} The gain is the bookmark, the product and the file, which are objects and now look like objects. ${b('The cost is the image card')} ⚑ — a photograph inside a panel is a photograph with a mount, and at Image in the panel: To the panel edge the mount goes away while the caption stays inside. ${b('The header card is unchanged from 1 Plain')}: it already had a surface, and a panel around a panel is the one thing this treatment must not do.`,
  rollNotes:{
    image:'THE MEDIA IS 672 INSIDE A 720 PANEL · CONTROL: INSET · TO THE PANEL EDGE',
    header:'NO PANEL AROUND A PANEL ⚑ · THE HEADER CARD ALREADY CARRIES ITS OWN SURFACE',
    button:'THE PANEL IS OPTIONAL HERE AND ON BY DEFAULT · A BUTTON ALONE IN A PANEL IS A DIALOG ⚑',
    callout:'THE CALLOUT’S TINT BECOMES THE PANEL · ONE PLANE, NOT TWO'
  },
  widthNote:{ regular:'PANEL 720, MEDIA 672', wide:'PANEL 1,040, MEDIA 992', full:'PANEL 1,296, MEDIA 1,248' },
  widthsNote:`${b('The panel takes the authored width and the media sits inside it')} ⚑ — regular 720, wide 1,040, full 1,296, each less 24 px of padding on both sides. ${b('The caption is inside the panel')} in this treatment, which is the one place A33 lets a caption leave the measure: at full width the caption runs 1,248 and that is deliberate, because it is part of the card rather than part of the article. ${b('At Image in the panel: To the panel edge the media takes the full panel and the caption keeps the padding')}.`,
  statesNote:`${b('The panel is what hovers')}, and it hovers by changing its surface — not by lifting. ${b('A panel that rose 2 px on hover would announce that every card is clickable')} ⚑ and only the bookmark is. The button card’s hover and every focus ring are 1 Plain’s, unchanged.`,
  absentNote:`${b('The panel holds its shape and its padding whatever is missing')} ⚑, which is this treatment’s advantage in the ugly test and its cost everywhere else: ${b('an empty optional field leaves a slightly shorter panel, never a hole')}. A bookmark with no thumbnail is a panel of text; a product with no image is a panel of text with a rating.`,
  a11y:[
    `${b('The panel is a')} ${code('&lt;div&gt;')} ${b('with no role and no label')} ⚑. It is a visual boundary; announcing “group” ten times in an article is worse than announcing nothing.`,
    `${b('The image card’s panel sits inside the')} ${code('&lt;figure&gt;')} ⚑, not around it, so the caption stays the figure’s caption and the reading order is image then caption.`,
    `${b('Contrast on the surface, not the ground')}: body 16.5 px at ${code('text')} on ${code('surface')} is 13.4:1, captions 5.7:1, and the accent button on ${code('surface')} is 3.9:1 for its fill with white label at 4.6:1 — all AA at these sizes.`,
    `${b('Focus rings are drawn outside the panel’s radius')} at a 4 px offset, so a focused card is never clipped by its own corner.`
  ],
  a11yNote:`${b('Ten panels do not add ten landmarks')} ⚑. The only structural change from 1 Plain is where the ${code('&lt;figure&gt;')} sits relative to the panel, and it sits outside — the panel is inside the figure.`,
  controls:{
    name:'Card', n:2, count:'SIX',
    sub:'Every card on a surface panel: hairline, radius, sm shadow, 24 px.',
    rows:K.quickRows({ space:1, cap:0, credit:1 }).concat([
      K.seg('Panel', ['Hairline', 'Hairline and shadow', 'Fill only'], 1,
        `${b('Fill only is the pack’s surface with no border')} — the right value in packs whose surface and background differ enough to draw the edge themselves ⚑.`),
      K.seg('Panel padding', ['Compact 16', 'Comfortable 24', 'Spacious 32'], 1,
        `Inside every panel, all four sides. ${b('16 at ≤ 767 whatever this says')} ⚑ — 32 px of padding inside a 350 measure leaves 286 for the words.`),
      K.seg('Image in the panel', ['Inset', 'To the panel edge'], 0,
        `${b('At To the panel edge the media takes the panel’s full width')} and the caption keeps the padding — the layout most themes call a media card ⚑.`)
    ]),
    settles:[
      `${b('The panel takes the authored width; the media gives up 48.')} The alternative — panel wider than the measure — was drawn and cut: it puts every card out of line with the paragraphs, which is a defect no user asked for and every user sees.`,
      `${b('Panel: Fill only exists for the packs, not for taste')} ⚑. Paper’s surface is #FFFFFF on a #FBF9F5 ground and needs the hairline; a pack whose surface is two steps from its ground does not, and the same treatment must survive both.`,
      `${b('Cut: a shadow-depth control.')} The brief allows two warm shadows and one of them is for overlays; ${b('a card that could take the md shadow would float')}, and “nothing you do can make it ugly” is the promise this category is most able to break.`
    ]
  },
  respCap:'TABLET 834 · MEASURE 754 · MOBILE 390 · MEASURE 350 · PADDING 16 AT ≤ 767',
  tabletLabel:'834 · panel 754, media 706 · padding 24 · space 48',
  mobileLabel:'390 · panel 350, media 318 · padding 16 · space 32',
  respNote:`${b('Same ladder as 1 Plain with one addition')}: ${b('panel padding steps to 16 at ≤ 767 whatever the control says')} ⚑. ${b('The panel never loses its radius on a phone')} — the pack’s token is the token at every width — and ${b('the shadow is kept')}, because at 350 the hairline alone is hard to see against a warm ground.`,
  darkNote:`${b('The panel is where dark mode does its work')}: ${code('surface')} lifts to ${code('#211D17')} one step above the ${code('#171511')} ground, ${b('the shadow is dropped entirely')} ⚑ and the hairline does the whole job of the edge. ${b('That is the re-tune, not an inversion')} — the light panel’s shadow-plus-hairline becomes hairline-only, and the lift comes from the surface token instead.`,
  spec:[[
    specRow(1, 'Descriptor', 'Every card on a surface panel at the article’s measure — hairline, pack radius, warm sm shadow, 24 px padding — with the media inset inside the panel and the caption in the panel with it.'),
    specRow(2, 'Structural descriptor', `${code('article body · card · surface · variable · inline · the raised panel')}<br><span style="color:#6B6459">Containment ${code('card')} and ground ${code('surface')} are the two slots this treatment changes from 1 Plain, and they are the whole design. ${b('3 Panel shares the surface and changes the containment; 6 Contrast Band shares the containment and changes the ground')} ⚑.</span>`),
    specRow(3, 'Archetype', `article body. ${b('Three departures')}: space 32 and panel padding 16 at ≤ 767, and the bookmark’s thumbnail above its text at ≤ 767 ⚑.`),
    specRow(4, 'Responsive rule', `${b('1440')} panel 720 / media 672, wide panel 1,040 / media 992, full panel 1,296 / media 1,248; padding 24; space 48; ${b('the caption sits inside the panel')} ⚑. ${b('834')} panel 754 / media 706; wide and full both 754. ${b('≤ 767')} panel 350 / media 318, ${b('padding 16')}, space 32, radius unchanged, ${b('shadow kept')} ⚑.`),
    specRow(5, 'Content fields', FIELDS),
    specRow(6, 'Controls, in sidebar order', `${b('Space around cards')} Compact 32 · Comfortable 48 · Spacious 64. ${b('Captions')} Under, left · Under, centred · Hidden. ${b('Credit line')} With the caption · Its own line · Hidden. ${b('Panel')} Hairline · Hairline and shadow · Fill only. ${b('Panel padding')} Compact 16 · Comfortable 24 · Spacious 32. ${b('Image in the panel')} Inset · To the panel edge. ${b('Then What Ghost owns')}, not counted.`)
  ], [
    specRow(7, 'Data', DATA),
    specRow(8, 'Empty state', `${b('The panel keeps its shape and padding whatever is absent')} ⚑ — a missing field shortens the panel and never leaves a hole. No caption → no ${code('&lt;figcaption&gt;')}, the panel’s bottom padding closes the gap. No thumbnail → a panel of text at full width. No product image → panel of text plus rating. ${b('No cards → nothing renders, and in particular no empty panel')} ⚑. ${b('The header card gets no panel at any value')} — it carries its own surface.`),
    specRow(9, 'Behaviour module', NOJS),
    specRow(10, 'Accessibility', `As 1 Plain, with two changes: ${b('the panel is a')} ${code('div')} ${b('with no role and no label')} ⚑, and ${b('the panel sits inside the')} ${code('&lt;figure&gt;')} so the figure/caption pair is preserved and reading order stays image → caption. Focus rings draw outside the panel radius at a 4 px offset. Body on ${code('surface')} 13.4:1, captions 5.7:1.`),
    specRow('—', 'Repeating items', REPEAT),
    `${b('Flagged ⚑')} — the panel taking the authored width while the media gives up 48; ${b('no panel around the header card')}; padding 16 at ≤ 767 overriding the control; the shadow kept at 390 and dropped in dark; the panel inside the figure; ${b('Fill only existing for the packs rather than for taste')}; the cut shadow-depth control.`
  ]]
};

/* ── 3 · Panel ─────────────────────────────────────────────────────────── */
const trPanel = { key:'plane', contain:'plane', rules:'none', pad:32, space:56, shadow:false,
  planeW:w => WIDE(w), mediaW:STD_MEDIA, capMode:'measure', capAlign:'left', credit:'own', gutter:12 };

const d3 = {
  n:3, name:'Panel', tr:trPanel,
  rail:'A33 KOENIG CARD TREATMENTS · TREATMENT 3 OF 6 · PAPER PACK · SIX CONTROLS + WHAT GHOST OWNS',
  paras:[
    'The plane under a card runs past the measure to the wide column — 1,040 at 1440 — while the card’s content stays at 720. The card is not wider; its ground is.',
    'It gives an article a second rhythm: text at one width, interruptions at another, and no card that has to be read at a width the body was not set for. The media cards stay in the measure by default, because a photograph on a plane is two rectangles arguing.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · PLANE 1,040 · CONTENT 720 INSIDE IT · PADDING 32 · SPACE 56',
  primaryNote:`${b('The plane is 1,040 and the content inside it is 720')} — 160 px of surface on each side ⚑. ${b('That is the whole treatment')}: the reader’s column never changes, and the card announces itself by widening its ground rather than its line length. ${b('Space is 56 here rather than 48')} ⚑, because a plane needs a little more air than a hairline to read as a separate object.`,
  rollNote:`${b('The plane suits the cards that are arguments')} — callout, toggle, product, file — and it is wasted on the button, which is why Button keeps the plane but centres in it. ${b('Drawn to the tile’s edge here')}; in the page every plane is 1,040 and every content column inside it is 720 ⚑.`,
  rollNotes:{
    callout:'THE CLEAREST CASE · A CALLOUT ON A 1,040 PLANE WITH 720 OF TEXT',
    bookmark:'THE THUMBNAIL STAYS INSIDE THE 720 COLUMN · IT DOES NOT USE THE PLANE’S EXTRA WIDTH ⚑',
    image:'MEDIA STAYS IN THE MEASURE BY DEFAULT · CONTROL: IN MEASURE · ON THE PLANE',
    header:'THE HEADER CARD TAKES THE PLANE WIDTH RATHER THAN THE CONTENT BOX HERE ⚑'
  },
  widthNote:{ regular:'THE MEASURE, ON THE PAGE GROUND', wide:'THE PLANE’S WIDTH', full:'A17’S CONTENT BOX' },
  widthsNote:`${b('Media resolves as 1 Plain does')} — 720 · 1,040 · 1,296 ⚑ — ${b('but wide now lands exactly on the plane’s width')}, which is the coincidence this treatment is built on: an author who marks an image wide gets an image the width of every callout’s ground, and the page holds one secondary width instead of two. ${b('At Media on the plane: On the plane the media sits inside a 1,040 plane at 976')}, and the caption stays at 720.`,
  statesNote:`${b('The plane does not hover')} ⚑ — it is a ground, and a ground that changes colour under the pointer reads as a selection. Only the bookmark’s inner column responds, and it responds by stepping to the hover token. Focus rings draw around the ${b('link')}, not around the plane.`,
  absentNote:`${b('The plane is the risk in this treatment and the empty cases are where it shows')} ⚑. A short callout on a 1,040 plane is a wide band with one line in it; the answer is padding, not a minimum height — ${b('the plane is only ever as tall as its content plus 64')}, and a one-line callout is allowed to look like a one-line callout.`,
  a11y:[
    `${b('The plane is a')} ${code('&lt;div&gt;')} ${b('with no role')} ⚑, exactly as 2 Card’s panel is. It is 160 px of ground on each side and nothing more.`,
    `${b('The content column inside the plane is where the measure lives')}, so line length for a screen-magnifier user at 400 % is 720, not 1,040 — the reason the content column exists at all.`,
    `${b('Contrast:')} body on ${code('surface')} 13.4:1, captions 5.7:1. ${b('The plane meets the page ground with no border')}, and Paper’s two grounds are 1.05:1 apart — visible, but ${b('never the only signal')}: the padding carries it too.`,
    `${b('At ≤ 1023 the plane and the measure are the same width')} and the treatment becomes 2 Card without a shadow — stated so nobody reports it as a bug ⚑.`
  ],
  a11yNote:`${b('A wide ground does not widen the reading column')} ⚑ — that separation is the accessibility argument for this treatment and the reason the content column is not a control.`,
  controls:{
    name:'Panel', n:3, count:'SIX',
    sub:'The card’s ground runs to the wide column; its content keeps the measure.',
    rows:K.quickRows({ space:1, spaceVals:['Compact 32', 'Comfortable 56', 'Spacious 72'], cap:0, credit:1, capHelp:`13.5 px in ${code('text-muted')}, ${b('at the content column’s width and never the plane’s')} ⚑.` }).concat([
      K.seg('Plane width', ['Measure 720', 'Wide 1040', 'Content 1296'], 1,
        `${b('At Measure 720 this treatment is 2 Card with no shadow')} ⚑ — a legitimate value, and the one it falls back to below 1024 whatever this says.`),
      K.seg('Plane', ['Surface', 'Tinted', 'Hairline box'], 0,
        `The pack’s surface · its hover surface · a 1 px border with no fill. ${b('Hairline box at 1,040 draws a rectangle around 160 px of empty ground on each side')} and is offered for the packs that need it ⚑.`),
      K.seg('Media on the plane', ['In measure', 'On the plane'], 0,
        `${b('In measure keeps photographs off the plane')} ⚑ — two rectangles of different widths, one of them a photograph, is the failure this default avoids.`)
    ]),
    settles:[
      `${b('One secondary width, not two.')} The plane is 1,040 and so is the wide media rung, on purpose: ${b('a page with a 1,040 plane and a 960 image has two secondary widths and reads as a mistake')} ⚑.`,
      `${b('The content column is not a control.')} It is the article’s measure, A25 owns it, and a card whose text ran wider than the paragraph above it would break the one rule this whole category exists to keep.`,
      `${b('Cut: a plane-height control and a plane-alignment control.')} A plane taller than its content is decoration; a plane aligned left inside 1,296 puts 256 px of ground on one side only — ${b('both were drawn, both were ugly at two packs out of three')}.`
    ]
  },
  respCap:'TABLET 834 · THE PLANE IS THE CONTENT BOX · MOBILE 390 · THE PLANE IS THE MEASURE',
  tabletLabel:'834 · plane 754 = content box · content 690 inside it · padding 32',
  mobileLabel:'390 · plane 350 · content 302 · padding 24 · space 32',
  respNote:`${b('The plane is the first thing to go')} ⚑. ${b('At 834 the plane and the content box are the same 754')}, so the plane still reads — 32 px of ground on each side of a 690 column — and ${b('at ≤ 767 the plane is the measure')} and the treatment becomes a tinted or bordered box at 350 with 24 px of padding. ${b('The content column is 302 at 390')}, which is the one width in A33 that is narrower than A25’s measure, and it is stated in the panel ⚑.`,
  darkNote:`${b('The plane is the surface token and lifts one step')} to ${code('#211D17')} ⚑. ${b('Dark is where this treatment is strongest')}: 160 px of lifted ground on each side of the text needs no border and no shadow to read, and the light mode’s faint 1.05:1 step becomes a clear one. ${b('At Plane: Tinted the dark hover token')} ${code('#2A251E')} is used, not a lightened copy of the light tint.`,
  spec:[[
    specRow(1, 'Descriptor', 'The card’s ground runs past the article measure to the wide column — 1,040 at 1440 — with the card’s content held at 720 inside it and the media staying in the measure by default.'),
    specRow(2, 'Structural descriptor', `${code('article body · box · surface · variable · inline · plane past the measure')}<br><span style="color:#6B6459">Containment ${code('box')} rather than ${code('card')}: ${b('there is no border and no shadow, only a plane')} ⚑, and it is wider than the thing it contains — which is what separates this from 2 Card, the only other surface-ground treatment.</span>`),
    specRow(3, 'Archetype', `article body. ${b('Three departures')}: the plane becomes the content box at 834, the measure at ≤ 767, and ${b('the content column is 302 at 390 — narrower than A25’s 350')} ⚑.`),
    specRow(4, 'Responsive rule', `${b('1440')} plane 1,040 centred, content 720 inside it, padding 32, space 56; media 720 · 1,040 · 1,296 on the page ground. ${b('834')} plane 754 (= the content box), content 690, padding 32. ${b('≤ 767')} ${b('plane 350 (= the measure)')}, content 302, padding 24, space 32 ⚑.`),
    specRow(5, 'Content fields', FIELDS),
    specRow(6, 'Controls, in sidebar order', `${b('Space around cards')} Compact 32 · Comfortable 56 · Spacious 72 — ${b('this treatment’s ladder, one step above 1 Plain’s')} ⚑. ${b('Captions')} Under, left · Under, centred · Hidden. ${b('Credit line')} With the caption · Its own line · Hidden. ${b('Plane width')} Measure 720 · Wide 1040 · Content 1296. ${b('Plane')} Surface · Tinted · Hairline box. ${b('Media on the plane')} In measure · On the plane. ${b('Then What Ghost owns')}, not counted.`)
  ], [
    specRow(7, 'Data', DATA),
    specRow(8, 'Empty state', `${b('The plane is only ever as tall as its content plus its padding')} ⚑ — there is no minimum height, and a one-line callout on a 1,040 plane is allowed to be one line. No caption → no ${code('&lt;figcaption&gt;')}. No thumbnail → the bookmark’s text takes the content column, not the plane. ${b('No cards → nothing renders, and no plane')} ⚑.`),
    specRow(9, 'Behaviour module', NOJS),
    specRow(10, 'Accessibility', `As 1 Plain, plus: ${b('the plane is a')} ${code('div')} ${b('with no role')} ⚑; ${b('the content column keeps the 720 measure at 400 % zoom')} — the reason it exists; the plane-to-ground step is 1.05:1 in Paper light and ${b('is never the only signal')} (padding carries it); focus rings draw around the link, never the plane.`),
    specRow('—', 'Repeating items', REPEAT),
    `${b('Flagged ⚑')} — the plane width and the wide media rung being the same 1,040 on purpose; ${b('space 56 as this treatment’s default')}; media staying in the measure by default; the header card taking the plane rather than the content box; ${b('the 302 content column at 390')}; the plane collapsing to the measure below 768; the cut plane-height and plane-alignment controls.`
  ]]
};

d3.extraSection = K.section('A33-3 media on the plane', K.cap('THE ONE CONTROL VALUE THIS TREATMENT MUST DRAW · MEDIA IN MEASURE, AND MEDIA ON THE PLANE') +
  `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
    tile({ w:670, bg:'#FFFFFF', border:'#EBE5DB', label:'IN MEASURE · THE DEFAULT · THE PHOTOGRAPH SITS ON THE PAGE GROUND',
      body:`<div style="background:${L.bg};border-radius:8px;padding:20px;display:flex;justify-content:center">${
        K.imageCard(L, 1440, trPanel, { m:560, mw:560, plateCap:'IMAGE CARD · IN THE MEASURE' })}</div>
        <span style="font-family:${MONO};font-size:9.5px;line-height:1.5;color:#6E6A64">ONE RECTANGLE · THE CAPTION AT THE MEASURE · A19’S RULE THAT NOTHING FRAMES, TINTS OR DIMS A PHOTOGRAPH, CARRIED ⚑</span>` })}${
    tile({ w:670, bg:'#FFFFFF', border:'#EBE5DB', label:'ON THE PLANE · THE ALTERNATIVE VALUE',
      body:`<div style="background:${L.bg};border-radius:8px;padding:20px;display:flex;justify-content:center">${
        K.shell(L, 1440, trPanel, { m:560, pw:616, inner:K.imageCard(L, 1440, Object.assign({}, trPanel, { contain:'none', rules:'none' }), { m:552, mw:552, plateCap:'IMAGE CARD · ON THE PLANE' }) })}</div>
        <span style="font-family:${MONO};font-size:9.5px;line-height:1.5;color:#6E6A64">TWO RECTANGLES · 32 PX OF SURFACE AROUND THE PHOTOGRAPH · OFFERED, NOT DEFAULT ⚑</span>` })}</div>` +
  K.note(`${b('Both values are legitimate and one is the default for a reason')} ⚑. On the plane gives the photograph a mount and a consistent ground with the callouts around it; in measure gives the photograph the page and nothing else. ${b('The default is in measure because the failure mode is worse the other way')} — a 4:3 photograph inside a 1,040 plane has 160 px of surface on each side and reads as a mistake, not a mount.`));

globalThis.A33SHARED = { NOJS, FIELDS, DATA, REPEAT, STD_MEDIA };
return [d1, d2, d3];
})();
