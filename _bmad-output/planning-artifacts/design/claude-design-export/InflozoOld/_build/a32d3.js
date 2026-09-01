// A32 designs 9–12 · Big Type · Cover · Sticky Bar · Meter
(function () {
const K = globalThis.A32LIB, P = globalThis.A32PAGE, X = globalThis.A32X;
const { L, D, MONO, PK, b, code, tile, gap, GATE } = K;
const { mono, hair, M, gateStack, dest } = X;

const CUTROW = `${b('The preview is Ghost’s and the section cannot change it')} ⚑. ${b('The fade is drawn over text the browser already has')}; everything below the cut was never sent, so the fade is presentation and never protection ⚑.`;
const A11Y = `${b('The gate’s heading is an ')}${code('h2')}${b(', not an h1')} ⚑ — A24’s post header owns the page’s only one, and the gate sits inside ${code('<article>')}. ${b('The fade is a decorative ')}${code('<div aria-hidden="true">')} ⚑. Focus order: the last visible link in the article, the primary action, then the secondary line. Every action is 44 px or taller. Muted on the page ground 5.4:1; the accent button 4.7:1 ⚑.`;
const SETTLE_GATES = {
  label:'WHAT THE FOUR GATES SETTLE FOR THE WHOLE CATEGORY',
  body:[
    `${b('Four gates, one arrangement.')} ${b('Free-signup')} · ${b('paid')} · ${b('upgrade')} (a paid post, a signed-in free member) · ${b('specific tier')} ⚑. ${b('The design never changes between them')} — only the eyebrow, heading, sentence and button label do, and all four are fields.`,
    `${b('The upgrade gate drops the sign-in link')} ⚑, greets the member by name, and goes to ${code('#/portal/account/plans')} rather than ${code('#/portal/signup')}. ${b('It must not offer an email field')}: Ghost already has the address.`,
    `${b('A reader with access never sees the section')} ⚑ — no unlocked state, no thank-you, no dismissal. ${b('The free gate is the only one whose action a theme can complete itself')} ⚑.`
  ]
};

/* ═══════════════════════════════════════════════════════════════════════
   9 · Big Type
   ═══════════════════════════════════════════════════════════════════════ */
const d9 = {
  n:9, name:'Big Type', gnd:'page',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 9 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The promise at display size: the heading at 84 across the content box, one line under it, and the button. Nothing else — no list, no card, no plane, no rule.',
    'It is the category’s one display moment. The heading is the design, which means the heading is also the risk: this is the only A32 design with a character limit the editor enforces.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · HEADING 84 ACROSS 1,040 · ONE LINE UNDER IT · PADDING 132',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const k = (o || {}).gate || GATE.paid;
    const hs = w === 1440 ? 84 : w === 834 ? 52 : 34;
    const inner = `<div style="display:flex;flex-direction:column">
      ${K.accessEyebrow(g, k.eyebrow)}${gap(w === 390 ? 16 : 22)}
      <h2 style="margin:0;font-family:${PK.head};font-size:${hs}px;font-weight:700;line-height:1.03;letter-spacing:-0.04em;color:${g.text};max-width:${w === 1440 ? 1040 : w === 834 ? 700 : 350}px;text-wrap:pretty">${k.heading}</h2>
      ${gap(w === 390 ? 20 : 28)}
      <p style="margin:0;font-size:${w === 390 ? 16 : 18}px;line-height:1.6;color:${g.muted};font-family:${PK.body};max-width:${w === 390 ? 350 : 560}px;text-wrap:pretty">${k.blurb}</p>
      ${gap(w === 390 ? 24 : 30)}
      ${K.action(t, g, w, { gate:k, row:true, rowGap:24 })}
      ${gap(w === 390 ? 16 : 20)}${dest(t, k)}</div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k,
      padTop:w === 1440 ? 132 : w === 834 ? 96 : 72, padBot:w === 1440 ? 132 : w === 834 ? 96 : 72,
      padNote:'DISPLAY TYPE NEEDS SPACIOUS · IT IS THE DEFAULT HERE AND NOWHERE ELSE IN A32 ⚑' });
  },
  stateBody(t, kind, narrow) {
    const g = K.ground(t, 'page');
    const k = GATE[kind] || GATE.paid;
    return `<div style="display:flex;flex-direction:column;width:100%">
      ${K.accessEyebrow(g, k.eyebrow)}${gap(14)}
      <span style="font-family:${PK.head};font-size:${narrow ? 30 : 42}px;font-weight:700;line-height:1.05;letter-spacing:-0.03em;color:${g.text};text-wrap:pretty">${k.heading}</span>
      ${gap(18)}${K.action(t, g, narrow ? 390 : 834, { gate:k, row:true })}</div>`;
  },
  primaryNote:`${b('One display moment per section, and this design spends it on the heading')} ⚑ — 84 px at 1.03 with −0.04em of tracking, in the pack’s heading font. ${b('The measure is 1,040 rather than the full 1,296')}: at 84 px, 1,296 gives about 26 characters a line and a two-line heading becomes a four-word one ⚑. ${b('Nothing else in the section grows with it')} — the sentence stays at 18 and the button at 15/600 ⚑, which is A10·15 and A18·9’s rule for every display design in the library.`,
  freeNote:`${b('“Keep reading with a free account” is 33 characters and sets in two lines at 84')} ⚑. That is what the editor’s 60-character limit is for: the same limit A30·9 imposed, and the same reason ⚑.`,
  gatesNote:`${b('The upgrade gate is the display heading’s hardest case')} — “This one is for paying members” at 84 px, addressed to somebody already paying you nothing ⚑. It is drawn. ${b('The tier gate names a tier at display size')}, which reads as an announcement rather than a limit ⚑.`,
  landNote:`${b('Display type does not sit close to anything')} ⚑. Padding is 132 by default here and the panel’s Compact value is 96, not 64 — ${b('the ladder is shifted one step up in this design and nowhere else')} ⚑. After a heading the 84 px display and the article’s 32 px ${code('h2')} are 132 apart and read as two different things, which is the point ⚑.`,
  statesNote:`${b('The button is the only accent and the only target')} ⚑; at this scale a text link beside it is invisible, so the sign-in line is drawn at 14 px in the text colour with a rule, not at muted ⚑.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Big Type', n:9, count:'SIX',
    sub:'The promise at display size.',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 2, '96 · 116 · 132 — ' + b('one step up from A17’s ladder, in this design only') + ' ⚑. 96 at 834, 72 at 390.'),
      K.seg('Display size', ['Large 64', 'Larger 84', 'Largest 104'], 1, b('Of the heading alone') + '. Nothing else scales with it ⚑. At Largest the measure holds at 1,040 and a 60-character heading takes three lines.'),
      K.seg('Alignment', ['Left', 'Centred'], 0, b('Left is the default') + ' — display type centred over a left-set article is the commonest way this design stops matching the page above it ⚑.'),
      K.seg('Sentence', ['Show', 'Hide'], 0, 'The 18 px line under the heading. ' + b('At Hide the design is a heading and a button') + ', which is coherent and is the value for a short heading ⚑.'),
      K.seg('Action', ['Button', 'Text link'], 0, b('Text link at display scale is a 16 px underlined line') + ', not 14 ⚑ — the one place in A32 where a control changes a type size.'),
      K.seg('Fade', ['None', 'Short 96', 'Standard 160', 'Deep 240'], 3, b('Deep 240 is the default here') + ' ⚑ — a display heading arriving 96 px after full-strength body text reads as a mis-set page.')
    ],
    settles:[
      `${b('The type ladder is never scaled by a control, and Display size is the exception that proves it')} ⚑ — it moves the heading and nothing else. A single scale control that moved the sentence and the button with it would produce a 26 px button, which is not a button.`,
      `${b('Two defaults are shifted in this design and both are stated')}: padding starts at Spacious and fade at Deep ⚑. ${b('A design whose defaults differ from its category must say so in its own panel')}, which is the rule A18·9 set.`,
      `${b('No included list, and no room for one.')} At 84 px the heading is the argument; three ticks under it are a footnote to a poster ⚑. 8 Ledger is the design that lists.`
    ]
  },
  respCap:'TABLET 834 · HEADING 52 · MOBILE 390 · HEADING 34 · THE DISPLAY LADDER, NOT THE SECTION LADDER',
  tabletLabel:'834 · heading 52 · measure 700 · sentence 18 · padding 96',
  mobileLabel:'390 · heading 34 · measure 350 · button full width · padding 72',
  respNote:`${b('The heading steps 84 → 52 → 34')} ⚑, which is steeper than every other A32 design because display type is the only thing in the library that must be re-set rather than re-flowed. ${b('At 390 the heading is 34 — nine points above the article’s h2 and nothing more')} ⚑; a 60-character heading at 34 on 350 takes four lines, which is drawn and is accepted. ${b('The sentence and button hold their sizes at every width')}.`,
  darkNote:`A27’s step, and ${b('display type is where dark mode’s weight problem shows')} ⚑ — 84 px of ${code('#F2EDE4')} on ${code('#171511')} reads heavier than the same type in light. ${b('The weight is unchanged at 700')} and the letter-spacing unchanged at −0.04em: ${b('the library does not carry an optical-size adjustment')} ⚑, and inventing one here would be one design’s private rule. Flagged, and left.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The gate’s heading at display size across a 1,040 measure with one 18 px line under it and the button beneath — no list, no containment, no ground of its own. The category’s one display moment.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · page · none · none · the promise at display size')}<br><span style="color:#6B6459">Every closed slot matches 1 Fade’s except the archetype, and ${b('what actually distinguishes them is scale — which no machine reads')} ⚑. The emphasis phrase carries it, and this is the pair the honest-uniqueness note names.</span>`),
    K.specRow(3, 'Archetype', 'stack. One departure: ' + b('the padding ladder is shifted one step up') + ' ⚑ — 96 · 116 · 132 rather than 64 · 96 · 132.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} heading 84 on a 1,040 measure, sentence 18 on 560, fade 240, padding 132. ${b('834')} heading 52 on 700, padding 96. ${b('≤ 767')} heading 34 on 350, ${b('button full width')}, fade 120, padding 72.`),
    K.specRow(5, 'Content fields', `As 1 Fade, and ${code('heading')}’s limit is the difference: ${b('60 characters, enforced in the editor')} ⚑ — the only field limit in A32 that is enforced rather than advisory, because at 84 px an over-long heading does not wrap badly, it wraps into the button. ${code('benefits[]')} and ${code('benefitsLabel')} are stored and not drawn ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Padding (Compact 96 · Comfortable 116 · Spacious 132) · Display size (Large 64 · Larger 84 · Largest 104) · Alignment (Left · Centred) · Sentence (Show · Hide) · Action (Button · Text link) · Fade (None · Short 96 · Standard 160 · Deep 240). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} Tiers read, not drawn; ${b('the paid gate’s price clause is in the sentence and disappears with it')} ⚑ — at Sentence = Hide the design never states a price, which the panel says plainly.`),
    K.specRow(8, 'Empty state', `No sentence → heading and button, and ${b('the gap between them stays 30')} rather than closing to 20 ⚑. No eyebrow → the heading is the first thing in the section. ${b('No heading is not reachable')}: the default is the category’s ⚑.`),
    K.specRow(9, 'Behaviour module', P.NONE),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The display heading is still an ')}${code('h2')} ⚑ — its size is a style and not a level. At Action = Text link the link is 16 px and its 44 px target is padding, not line-height ⚑.`),
    `${b('Flagged ⚑')} The 1,040 measure at 84 px is A32’s own ⚑. The shifted padding ladder is invented for this design ⚑. Leaving dark-mode optical weight unadjusted is a stated refusal rather than an oversight ⚑.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   10 · Cover
   ═══════════════════════════════════════════════════════════════════════ */
const d10 = {
  n:10, name:'Cover', gnd:'image', bleed:true,
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 10 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The gate over a photograph: a full-bleed cover 520 tall carrying a warm scrim, with the copy centred on it and every colour on the cover derived from the carried light rather than from the page.',
    'It is the only A32 design with an image, and the only one whose image is required rather than optional — a cover with no photograph is not a quieter version of this design, it is a different one.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · FULL-BLEED COVER 520 · WARM SCRIM 45 % · COPY CENTRED ON 560',
  cover(t, w, inner, o) {
    o = o || {};
    const h = o.h || (w === 1440 ? 520 : w === 834 ? 460 : 420);
    const scrim = t.dark ? 'rgba(9,8,6,.52)' : 'rgba(35,32,25,.45)';
    return `<div style="position:relative;width:100%;height:${h}px;background:${t.stripe};overflow:hidden;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:0 ${K.G(w).m}px">
      <div style="position:absolute;inset:0;background:${scrim}"></div>
      <div style="position:relative;width:100%;display:flex;justify-content:center">${inner}</div>
      <span style="position:absolute;left:${K.G(w).m}px;bottom:12px;font-family:${MONO};font-size:9.5px;color:rgba(251,249,245,.72)">PLACEHOLDER · EDITORIAL PHOTOGRAPH · 2,400 PX WIDE · SCRIM 45 % OF THE PACK’S TEXT COLOUR, NEVER BLACK ⚑</span></div>`;
  },
  body(t, w, o) {
    const g = K.ground(t, 'image');
    const k = (o || {}).gate || GATE.paid;
    const col = w === 1440 ? 560 : w === 834 ? 520 : 310;
    const inner = `${this.cover(t, w, `<div style="width:${col}px">${gateStack(t, g, w, { gate:k, align:'center', measure:col })}</div>`)}
      <div style="padding:${w === 390 ? 14 : 18}px ${K.G(w).m}px 0">${dest(t, k)}</div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k, bleed:true,
      padTop:w === 1440 ? 96 : w === 834 ? 80 : 64, padNote:'THE COVER CARRIES ITS OWN HEIGHT · THE SECTION HAS NO PADDING OF ITS OWN ⚑' });
  },
  stateBody(t, kind) {
    const g = K.ground(t, 'image');
    return this.cover(t, 834, `<div style="width:100%;max-width:480px">${gateStack(t, g, 1440, { gate:GATE[kind] || GATE.paid, align:'center', measure:480 })}</div>`, { h:300 });
  },
  primaryNote:`A20·13’s warm scrim, carried verbatim — ${b('a flat wash of the pack’s text colour at 30 / 45 / 60 %, never black and never a gradient')} ⚑. ${b('Every colour on the cover is derived from the carried light')}: text at full, muted at 80 %, hairlines at 28 %, and ${b('the button is the carried colour with the pack’s text colour as its label')} ⚑ — so like 4 Contrast Band this design spends no accent. ${b('The image is not filtered, dimmed or tinted')} ⚑ (A19’s rule): the scrim is a layer over it, not a treatment of it.`,
  freeNote:`${b('A free signup over a photograph is the frame to argue about')} ⚑ — a cover is a lot of production for “sign up free”, and the panel says so at Cover height = Compact. It is drawn because publications will do it.`,
  gatesNote:`${b('The upgrade gate over a cover is the category’s loudest frame')} ⚑ and the panel names 1 Fade as the alternative. ${b('The tier gate is where the cover earns itself')}: a named tier with a photograph reads as a product, which is what a Patron tier is ⚑.`,
  landNote:`${b('After an image this design draws two photographs 96 px apart')} ⚑ — the article’s and the cover’s. ${b('It is the one landing where a design in A32 recommends another')}: the panel names 1 Fade, and does not force it ⚑. ${b('The fade above the cover is the page ground, not the cover')} ⚑, at every landing.`,
  statesNote:`${b('Focus on the cover is the carried colour at 2 px')} ⚑ — the accent measures 2.9:1 against a 45 % scrim over a mid-tone photograph and fails, so it is not used ⚑. That is A20·13’s substitution, carried.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Cover', n:10, count:'SIX',
    sub:'The gate over a photograph.',
    rows:[
      K.seg('Cover height', ['Compact 420', 'Comfortable 520', 'Spacious 640'], 1, b('The cover carries its own height and the section has no padding') + ' ⚑. 460 and 420 at the two lower widths.'),
      K.seg('Scrim', ['30 %', '45 %', '60 %'], 1, 'A flat wash of the pack’s text colour. ' + b('Never black, never a gradient') + ' ⚑ — A20·13’s rule. ' + b('30 % is disabled when the image is light') + ', with the measured ratio shown ⚑.'),
      K.seg('Cover edges', ['Full bleed', 'Inset to the content box'], 0, 'Inset draws the cover at 1,296 with the pack radius and the page ground either side ⚑.'),
      K.seg('Alignment', ['Centred', 'Left to the measure'], 0, 'Where the 560 copy column sits on the cover. ' + b('Focus point is a field, not a control') + ' ⚑ — it belongs to the image.'),
      K.seg('Included list', ['Show', 'Hide'], 1, b('Hidden by default') + ' ⚑ — three ticks over a photograph is the fastest way to make a cover look like a stock advertisement.'),
      K.seg('Fade', ['None', 'Short 96', 'Standard 160'], 2, 'Into the page ground above the cover. ' + b('The fade never runs onto the image') + ' ⚑.')
    ],
    settles:[
      `${b('The image is required, and that is a field-level fact rather than a control')} ⚑. With no image the design ${b('hands off to 4 Contrast Band')} — the band is what a cover is without its photograph ⚑ — and the editor says so rather than drawing a grey rectangle.`,
      `${b('Focus point is a field on the image, not a control on the section')} ⚑ — A30·6’s call, carried. A crop belongs to the picture, and a control that moved it would move it for every post.`,
      `${b('No accent, and no accent value.')} On a 45 % scrim the Paper accent measures 2.9:1 ⚑; the button is the carried light. ${b('This and 4 Contrast Band are the two accent-free designs in A32')}.`
    ]
  },
  respCap:'TABLET 834 · COVER 460 · MOBILE 390 · COVER 420, COPY 310 · THE COVER NEVER INSETS AT 390',
  tabletLabel:'834 · cover 460 · copy 520 · scrim 45 %',
  mobileLabel:'390 · cover 420 · copy 310 · button full width',
  respNote:`${b('Covers do not collapse')} ⚑ — the arrangement at 390 is the arrangement at 1440 with smaller numbers. ${b('At ≤ 767 Cover edges is forced to Full bleed')} ⚑: an inset cover inside 20 px margins is a card with a picture in it. ${b('The cover’s height floor is 420')} and it is a floor rather than a step ⚑ — below it the copy and the scrim stop having anywhere to sit, and a 320 px cover with four lines on it is a caption.`,
  darkNote:`${b('The scrim deepens rather than inverting')} ⚑ — 45 % of the pack’s text colour in light becomes 52 % of the pack’s dark ground in dark, ${b('because the photograph is the same photograph in both modes')} and only the light around it changed. ${b('The image is not filtered or dimmed in either mode')} ⚑ (A19’s rule). The carried light stays ${code('#FBF9F5')}: it is the scrim’s counterpart, not the page’s text colour ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'A full-bleed cover 520 tall carrying a warm flat scrim, with the gate centred on it and every colour derived from the carried light. The only A32 design with an image, and the only one where it is required.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · image · none · background · the gate over a photograph')}<br><span style="color:#6B6459">Ground ${code('image')} and media ${code('background')} — the photograph is the ground, which is what separates this from every other design in the category ⚑. Containment ${code('none')}: a full-bleed cover is a ground.</span>`),
    K.specRow(3, 'Archetype', 'stack. One departure: ' + b('the cover does not collapse at any width') + ' ⚑ and Cover edges is forced to Full bleed at ≤ 767.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} full bleed, cover 520, copy 560 centred, scrim 45 %, page padding above 96. ${b('834')} cover 460, copy 520, padding 80. ${b('≤ 767')} ${b('full bleed forced')}, cover 420, copy 310, button full width, fade 120, padding 64 ⚑.`),
    K.specRow(5, 'Content fields', `As 1 Fade, plus ${code('image')} (${b('required')} ⚑, ≥ 2,400 px), ${code('imageAlt')} (opt 120 ch) and ${code('imageFocus')} (enum, nine positions — ${b('a field, not a control')} ⚑). ${code('benefits[]')} is drawn only at Included list = Show and is stored otherwise ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Cover height (Compact 420 · Comfortable 520 · Spacious 640) · Scrim (30 % · 45 % · 60 %) · Cover edges (Full bleed · Inset to the content box) · Alignment (Centred · Left to the measure) · Included list (Show · Hide) · Fade (None · Short 96 · Standard 160). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} ${b('No image → hand-off to 4 Contrast Band')} ⚑, stated in the editor. ${b('An image narrower than 1,600 px → the editor warns and the cover still renders')} ⚑; it is not blocked, because a warning a publication can act on beats a section that refuses to draw. Tiers read, not drawn.`),
    K.specRow(8, 'Empty state', `No image → the hand-off. No blurb → heading then button, centred, and ${b('the cover keeps its height')} ⚑. No benefits at Show → the control resolves to Hide and nothing is reserved ⚑.`),
    K.specRow(9, 'Behaviour module', `${P.NONE} ${b('The image is a real ')}${code('<img>')}${b(' with ')}${code('loading="lazy"')} ⚑ — not a CSS background — so it is in the document and has an alt attribute.`),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The scrim is a sibling ')}${code('<div aria-hidden="true">')}${b(', not an overlay on the img')} ⚑. ${b('Focus is the carried light at 2 px, not the accent')} — 2.9:1 measured and refused ⚑. Text on the cover measures 8.1:1 at 45 % over a mid-tone image; ${b('30 % is disabled where it would fall below 4.5:1')} ⚑.`),
    `${b('Flagged ⚑')} The 420 px height floor is invented ⚑. The 8.1:1 measurement assumes a mid-tone photograph — ${b('a real light image needs the higher scrim and the editor cannot know that')}, which is why 30 % is a value and not the default ⚑. The 52 % dark scrim is invented ⚑.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   11 · Sticky Bar
   ═══════════════════════════════════════════════════════════════════════ */
const d11 = {
  n:11, name:'Sticky Bar', gnd:'surface', bleed:true,
  frameOpt:{ noFoot:true },
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 11 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'A 76 px bar on the surface colour, pinned to the foot of the viewport from the moment the cut comes into view, carrying one line and one button. In flow at the cut, its twin: the same line and the same button, so the reader who scrolls past the bar still meets the offer.',
    'It is the quietest paid gate in the category and the only one that lets the reader keep reading upward without a wall in front of them. It needs no script — a sticky element with bottom: 0 does it in CSS.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · IN-FLOW TWIN AT THE CUT, AND THE BAR PINNED AT THE FRAME’S FOOT',
  bar(t, w, o) {
    o = o || {};
    const g = K.ground(t, o.gnd || 'surface');
    const k = o.gate || GATE.paid;
    const h = o.h || (w === 390 ? 132 : 76);
    const stack = w === 390;
    return `<div style="width:100%;min-height:${h}px;background:${g.bg};border-top:1px solid ${g.border};${t.dark ? '' : 'box-shadow:0 -4px 16px rgba(28,27,26,.08);'}box-sizing:border-box;padding:${stack ? '16px' : '0'} ${K.G(w).m}px;display:flex;align-items:center;${stack ? 'flex-direction:column;align-items:stretch;gap:12px;' : 'justify-content:space-between;gap:28px;'}">
      <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
        <span style="font-size:${w === 390 ? 15 : 16}px;font-weight:600;color:${g.text};font-family:${PK.body};text-wrap:pretty">${k.short}</span>
        <span style="font-size:13.5px;color:${g.muted};font-family:${PK.body}">${o.sub || 'From $6 a month. Stop whenever you like.'}</span></div>
      <div style="display:flex;align-items:center;gap:${stack ? 14 : 18}px;flex-shrink:0;${stack ? '' : ''}">
        ${K.btn(g, { label:k.cta, pack:PK, h:46, px:20, full:stack })}
        ${o.secondary === false ? '' : `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-underline-offset:3px;white-space:nowrap">${k.link}</span>`}
        ${o.close ? `<span style="width:38px;height:38px;border-radius:${Math.min(g.r, 8)}px;border:1px solid ${g.border};display:inline-flex;align-items:center;justify-content:center;font-size:13px;color:${g.muted};flex-shrink:0">✕</span>` : ''}</div></div>`;
  },
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const k = (o || {}).gate || GATE.paid;
    const twin = `<div style="width:${M(w)}px;margin:0 auto;display:flex;flex-direction:column;gap:14px">
        ${K.gateHead(g, w, { gate:k, measure:M(w), hSize:w === 1440 ? 28 : w === 834 ? 26 : 23, blurb:false })}
        ${K.action(t, g, w, { gate:k, row:true })}
        ${dest(t, k)}</div>`;
    const inner = `${twin}<div style="height:${w === 390 ? 40 : 56}px"></div>
      <div style="padding:0 ${K.G(w).m}px 8px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">A26 POST FOOTER WOULD FOLLOW · THE BAR SITS OVER IT · ${w === 390 ? 'THE BAR IS 132 AND STACKS ⚑' : 'THE BAR IS 76 AND HOLDS ONE LINE'}</span></div>
      ${this.bar(t, w, { gate:k })}
      <div style="padding:8px ${K.G(w).m}px 0"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">PINNED WITH position: sticky; bottom: 0 · NO SCRIPT ⚑ · IT UNPINS WHEN A3’S FOOTER REACHES IT</span></div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k, bleed:true,
      padTop:w === 1440 ? 72 : w === 834 ? 64 : 52, padBot:16, padNote:'THE IN-FLOW TWIN’S OWN PADDING · THE BAR HAS NONE ⚑' });
  },
  stateBody(t, kind, narrow) {
    return this.bar(t, narrow ? 390 : 834, { gate:GATE[kind] || GATE.paid });
  },
  primaryNote:`${b('Two things, one design')} ⚑: the bar pinned to the viewport foot, and its twin in the document flow at the cut. ${b('They carry the same line and the same button')} — the bar is the offer following the reader, and the twin is the offer where the article stopped. A2’s bar geometry, carried, at ${b('64 · 76 · 88 rather than A2’s 48 · 56 · 68')} ⚑, because A2’s bar carries one line and this one carries a line and a button. ${b('The bar’s shadow points upward')} ⚑ — ${code('0 -4px 16px')} — which is the only inverted shadow in the library and is stated as such.`,
  freeNote:`${b('The free gate is where the bar is at its best')} ⚑: one line, one button, no wall, and a reader who ignores it keeps reading the two open pieces they already had. ${b('The bar never carries an email field')} ⚑ — a 46 px field in a 76 px bar leaves 15 px of padding, and A2·12’s inline-field bar is the design that does it properly.`,
  gatesNote:`${b('The upgrade gate’s bar addresses a member by name in 16 px')} ⚑ and drops the secondary link, so it is a line and a button. ${b('The tier gate names the tier in the line')}; the bar does not grow for it ⚑ — it clips and keeps the whole string in the DOM, A18·3’s rule.`,
  landNote:`${b('The bar is unaffected by the landing')} ⚑ — it is pinned to the viewport, not to a block. ${b('The twin follows 1 Fade’s rules exactly')}: fade after a paragraph, no fade and 72 px after a heading, no fade after an image ⚑. That is why the twin exists rather than the bar alone: the cut still needs marking.`,
  statesNote:`${b('The close button is 38 px in a 44 px target')} and is the only thing in A32 that removes the section ⚑. ${b('Dismissal is for the session, not forever')} ⚑ — a paywall a reader can permanently hide is a paywall a publication cannot use.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Sticky Bar', n:11, count:'SIX',
    sub:'A bar pinned to the foot, and its twin at the cut.',
    rows:[
      K.seg('Bar height', ['Compact 64', 'Comfortable 76', 'Spacious 88'], 1, b('A2’s ladder, shifted up 16') + ' ⚑ — A2’s bar carries one line and this one carries a line and a button. ' + b('132 at 390, where it stacks') + '.'),
      K.seg('Bar ground', ['Surface', 'Contrast'], 0, 'Surface with a top hairline and an upward shadow, or the inverted band. ' + b('On Contrast the button inverts and the accent is not used') + ' ⚑.'),
      K.seg('Bar width', ['Full bleed', 'Held to the content box'], 0, 'Held draws the bar at 1,296 with the pack radius, floating 20 px above the viewport foot ⚑.'),
      K.seg('At the cut', ['The twin, in flow', 'Nothing'], 0, b('The twin is the default') + ' ⚑ — with Nothing the article simply stops and only the bar offers anything, which the panel says is the weakest gate in A32.'),
      K.seg('Dismissible', ['No', 'Yes'], 0, b('At Yes the bar gets a 38 px close button and the design declares ') + code('dismiss') + '. ' + b('For the session only') + ' ⚑.'),
      K.seg('Secondary link', ['Show', 'Hide'], 0, '“Sign in” beside the button. ' + b('Hidden at 390 whatever this says') + ' ⚑ — a stacked bar with two actions is 180 px of phone screen.')
    ],
    settles:[
      `${b('The bar needs no script and the panel says so')} ⚑. ${code('position: sticky; bottom: 0')} inside the article pins it while the article is on screen and unpins it when the footer arrives — ${b('the only module here is ')}${code('dismiss')}${b(', and only if the user asks for a close button')}.`,
      `${b('At the cut = Nothing is drawn and argued against.')} A32’s whole job is to mark the place the article stopped; ${b('a bar alone marks the viewport instead')} ⚑, and a reader who scrolls fast past the cut sees no boundary at all.`,
      `${b('Dismissal is session-scoped, and that is a product decision stated in a design panel')} ⚑ because the alternative — a permanent hide — makes the section useless and no control should be able to do that.`
    ]
  },
  respCap:'TABLET 834 · BAR 76, ONE LINE · MOBILE 390 · BAR 132, STACKED, SECONDARY LINK GONE',
  tabletLabel:'834 · bar 76 · one line · twin at the cut',
  mobileLabel:'390 · bar 132 stacked · button full width · no secondary link ⚑',
  respNote:`${b('Sticky’s ladder')}: the bar holds its arrangement to 767 and stacks below it — line, then button full width ⚑, at 132 px. ${b('The secondary link is dropped at 390')} and its destination is the twin at the cut, which keeps it ⚑. ${b('At Held to the content box the bar becomes full bleed at ≤ 767')} ⚑, because a floating bar inside 20 px margins is a toast.`,
  darkNote:`A27’s step, and ${b('the upward shadow is dropped')} ⚑ — the ${code('#332E27')} top hairline carries the bar, which is the same rule every plane in the library follows in dark. ${b('At Bar ground = Contrast the bar is ')}${code('#EDE7DA')}${b(' carrying ')}${code('#171511')}, so in dark the sticky bar is the lightest thing on the page ⚑ — checked, and kept, because a dark bar on a dark page has no edge.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'A 76 px surface bar pinned to the foot of the viewport carrying one line and one button, with an in-flow twin of the same line and button at the cut. The quietest gate in the category.'),
    K.specRow(2, 'Structural descriptor', `${code('sticky · none · surface · none · none · a bar pinned to the foot')}<br><span style="color:#6B6459">Archetype ${code('sticky')} — the only one in A32 ⚑. Ground ${code('surface')} matches 3 Panel’s and the archetype is what separates them; the emphasis phrase carries the rest.</span>`),
    K.specRow(3, 'Archetype', 'sticky. Its ladder: pinned at every width, stacking its contents at 767. One departure — ' + b('the secondary link is dropped at 390') + ' ⚑, its destination being the twin.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} bar 76 full bleed, line 16 and sub 13.5, button 46, twin at the measure with a 28 px heading, twin padding 72. ${b('834')} bar 76 unchanged, twin heading 26, padding 64. ${b('≤ 767')} ${b('bar 132, stacked, button full width, secondary link gone')} ⚑, twin heading 23, fade 120, padding 52.`),
    K.specRow(5, 'Content fields', `As 1 Fade, plus ${code('barLine')} (opt 60 ch — defaults to the gate’s heading ⚑) and ${code('barSub')} (opt 60 ch). ${code('blurb')} is ${b('drawn only in the twin')} ⚑ and never in the bar. ${code('benefits[]')} stored, not drawn.`)
  ], [
    K.specRow(6, 'Controls', 'Bar height (Compact 64 · Comfortable 76 · Spacious 88) · Bar ground (Surface · Contrast) · Bar width (Full bleed · Held to the content box) · At the cut (The twin, in flow · Nothing) · Dismissible (No · Yes) · Secondary link (Show · Hide). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} ${b('A long tier name in the bar clips and keeps the whole string in the DOM')} ⚑ — A18·3’s rule. Tiers read, not drawn.`),
    K.specRow(8, 'Empty state', `No ${code('barLine')} → the gate’s heading fills it, clipped to one line ⚑. At the cut = Nothing → the article stops and the bar is the only offer; ${b('the panel names this the weakest configuration in A32')} ⚑ rather than hiding it. No secondary link → the button sits alone at the bar’s right.`),
    K.specRow(9, 'Behaviour module', `${b('At Dismissible = No, none; ')}${code('core')}${b(' assumed — ')}${code('position: sticky')}${b(' is CSS and declares nothing')} ⚑. ${b('At Dismissible = Yes it declares ')}${code('dismiss')}${b('.')} ${b('No-JS, quoted:')} “${P.plain('dismiss')}” ${P.EDITSAFE} ${b('While editing the bar is drawn in flow at the foot of the section')} ⚑, not pinned to the editor viewport.`),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The bar and the twin carry the same two links, so the same destination appears twice in the tab order')} ⚑ — the bar is ${code('aria-hidden')} when the twin is drawn and the twin is the accessible copy ⚑, which is the only way to have both without duplicating the offer for a screen reader. The close button has a real label and is 38 px in a 44 px target ⚑.`),
    `${b('Flagged ⚑')} The 64 · 76 · 88 ladder departs from A2’s 48 · 56 · 68 ⚑. The upward shadow is A32’s own and is the only one in the library ⚑. Session-scoped dismissal is a product assumption ⚑. ${b('Hiding the bar from assistive technology when the twin is present is a judgement')} and should be reviewed ⚑.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   12 · Meter
   ═══════════════════════════════════════════════════════════════════════ */
const d12 = {
  n:12, name:'Meter', gnd:'page',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 12 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The gate opened by a measurement: a 4 px meter across the measure showing how much of the piece the reader has had, its label in words beneath, and the gate under that. The one design in A32 that states a quantity.',
    'The number is server-known — the words in the preview against the reading time Ghost computed for the whole post — so the meter is in the HTML before any script runs. What the module adds is the live fill while the reader scrolls, and the registry’s degradation is exactly that value drawn statically.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · METER 720 AT 4 PX · LABEL IN WORDS · GATE BENEATH',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const k = (o || {}).gate || GATE.paid;
    const m = M(w);
    const inner = `<div style="width:${m}px;margin:0 auto;display:flex;flex-direction:column">
      ${K.meter(g, { w:m, pct:34 })}
      ${gap(w === 390 ? 26 : 34)}
      ${gateStack(t, g, w, { gate:k, measure:m, eyebrow:false, hSize:w === 1440 ? 30 : w === 834 ? 28 : 24 })}
      ${gap(w === 390 ? 16 : 20)}${dest(t, k)}
      ${gap(10)}<span style="font-family:${MONO};font-size:10px;color:${t.muted}">THE VALUE IS SERVER-RENDERED: THE PREVIEW’S WORD COUNT AGAINST post.reading_time ⚑ · VERIFY reading_time IS THE WHOLE POST</span></div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k,
      padTop:w === 1440 ? 64 : w === 834 ? 56 : 48, padNote:'THE METER SITS CLOSER TO THE TEXT THAN ANY OTHER A32 GATE ⚑ — IT IS ABOUT THE TEXT' });
  },
  stateBody(t, kind, narrow) {
    const g = K.ground(t, 'page');
    const k = GATE[kind] || GATE.paid;
    const w = narrow ? 390 : 834;
    return `<div style="display:flex;flex-direction:column;width:100%">
      ${K.meter(g, { w:narrow ? 340 : 520, pct:34 })}
      ${gap(20)}${K.gateHead(g, w, { gate:k, measure:narrow ? 340 : 520, hSize:narrow ? 22 : 26, eyebrow:false })}
      ${gap(16)}${K.action(t, g, w, { gate:k, row:true })}</div>`;
  },
  primaryNote:`${b('The meter replaces the eyebrow')} ⚑ — it is the same job, done with a number: this design never writes the words “members only” above the heading, because the meter has already said where the reader is. ${b('The fill is the text colour and the track is the border token')} ⚑; ${b('the accent stays on the button')}, which is A25’s rule that a colour on a repeated element marks nothing. ${b('The label is in words, never a percentage')} ⚑ — “4 of this piece’s 12 minutes” is a sentence a reader can check, and “34 %” is a number they cannot.`,
  freeNote:`${b('On the free gate the meter is the whole argument')} ⚑: the reader can see they are a third of the way in and that the rest costs an email address. It is the one gate where a measurement is more persuasive than a sentence.`,
  gatesNote:`${b('The upgrade gate keeps the meter')} ⚑ — a paying-nothing member is still a reader mid-piece — and ${b('the tier gate keeps it too')}. ${b('The meter’s value is the same in all four gates')}: it describes the article, not the reader’s account ⚑.`,
  landNote:`${b('The meter sits 64 px from the last visible block')} — closer than any other A32 gate ⚑ — because it is about that block. ${b('After a heading it goes to 96')} and after an image to 96 ⚑; a 4 px rule 64 px under a photograph reads as the photograph’s caption rule.`,
  statesNote:`${b('The meter is not interactive')} ⚑ and is not in the tab order. Hover does nothing to it; ${b('it is a reading, not a control')}, and a reader who drags it would expect the article to move.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Meter', n:12, count:'SIX',
    sub:'How much you have read, then the gate.',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 0, '64 · 96 · 132 — ' + b('Compact is the default here and nowhere else') + ' ⚑, because the meter belongs to the text above it.'),
      K.seg('Meter style', ['Rule', 'Segments'], 0, 'A single 4 px rule with a filled portion, or twelve 4 px segments — ' + b('one per minute of the post') + ' ⚑. Segments needs ' + code('reading_time') + ' and falls back to Rule without it ⚑.'),
      K.sel('Meter label', 'Minutes, in words', 'Minutes, in words · Share of the piece, in words · Hide. ' + b('Never a percentage numeral') + ' ⚑.'),
      K.seg('Meter width', ['The measure 720', 'Content box 1,296'], 0, b('The measure is the default') + ' — the meter measures the text, so it is the text’s width ⚑.'),
      K.seg('Action', ['Button', 'Text link'], 0, 'Under the heading and sentence. ' + b('No email field') + ' ⚑ — a field under a meter reads as an input the meter responds to.'),
      K.seg('Fade', ['None', 'Short 96', 'Standard 160', 'Deep 240'], 1, b('Short 96 is the default here') + ' ⚑ — a deep fade above a meter hides the text the meter is measuring.')
    ],
    settles:[
      `${b('The label is words, not a percentage, and that is the design’s one real opinion')} ⚑. “You have read 4 of this piece’s 12 minutes” is checkable; ${b('a percentage invites the reader to argue with the arithmetic')} and a theme should not be doing arithmetic on a number it did not compute.`,
      `${b('Three defaults are shifted here and all three are stated')}: padding Compact, fade Short, and no eyebrow ⚑. Each is because the meter is about the paragraph above it rather than about the section.`,
      `${b('Segments is offered and is the value to be careful with')} ⚑ — twelve segments for a twelve-minute post is legible; ${b('forty-one for a forty-one-minute post is a hairline')}, so above 20 minutes the control resolves to Rule and the panel says so.`
    ]
  },
  respCap:'TABLET 834 · METER 754 · MOBILE 390 · METER 350, LABEL WRAPS TO TWO LINES',
  tabletLabel:'834 · meter 754 · heading 28 · padding 56',
  mobileLabel:'390 · meter 350 · label two lines · button full width',
  respNote:`Bar’s ladder: ${b('the meter is always its container’s full width and never a fixed one')} ⚑, so it needs no breakpoint of its own. ${b('At ≤ 767 the label wraps to two lines and is not shortened')} ⚑ — an abbreviated reading (“4/12 min”) is the percentage problem in another form. ${b('At Segments the segment count is unchanged at 390')} and each segment is 25 px wide, which is drawn and holds ⚑.`,
  darkNote:`A27’s step. ${b('The fill is ')}${code('#F2EDE4')}${b(' and the track ')}${code('#332E27')} ⚑ — 12.4:1, the same step as body text on ground, ${b('so the meter reads at the same strength as the prose it measures')}. ${b('The accent is not used in the meter in either mode')} ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'A 4 px meter across the measure showing how much of the post the preview was, its label in words, and the gate beneath it. The only A32 design that states a quantity, and the only one with no eyebrow.'),
    K.specRow(2, 'Structural descriptor', `${code('bar · none · page · none · none · a read meter above the gate')}<br><span style="color:#6B6459">Archetype ${code('bar')} — the meter is a bar and it sets the arrangement; the gate hangs off it. Containment ${code('none')}, ground ${code('page')}, and the archetype is what separates this from 1 Fade and 9 Big Type ⚑.</span>`),
    K.specRow(3, 'Archetype', 'bar. Its ladder: full width of its container at every width, contents wrapping rather than rearranging. No departures.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} meter 720 at 4 px, label 13.5, heading 30, fade 96, padding 64. ${b('834')} meter 754, heading 28, padding 56. ${b('≤ 767')} meter 350, ${b('label two lines, not abbreviated')} ⚑, heading 24, button full width, fade 120, padding 48.`),
    K.specRow(5, 'Content fields', `As 1 Fade, minus ${code('eyebrow')} (${b('stored and not drawn')} ⚑) and plus ${code('meterLabel')} (opt 90 ch, with ${code('{read}')} and ${code('{total}')} as its only tokens ⚑). ${code('benefits[]')} stored, not drawn.`),
    K.specRow(6, 'Controls', 'Padding (Compact · Comfortable · Spacious) · Meter style (Rule · Segments) · Meter label (Minutes, in words · Share of the piece, in words · Hide) · Meter width (The measure 720 · Content box 1,296) · Action (Button · Text link) · Fade. Then the shared source group.')
  ], [
    K.specRow(7, 'Data', `${code('post.reading_time')} and the preview’s own word count, ${b('both known server-side')} ⚑ — which is why the value is in the HTML before any script runs. ${b('No ')}${code('reading_time')} → the meter hides and the design is 1 Fade without an eyebrow ⚑. ${b('A preview longer than the reading time')} (a short post cut late) → ${b('the meter clamps at 90 % and never at 100')} ⚑: a full meter at a paywall says the reader has finished. ${CUTROW}`),
    K.specRow(8, 'Empty state', `No label → the meter alone, and ${b('the design still works')} ⚑ — a filled rule above a gate reads. No reading time → no meter. ${b('No heading is not reachable')}: the default is the category’s.`),
    K.specRow(9, 'Behaviour module', `${b(code('reading-progress'))}${b('.')} ${P.EDITSAFE} ${b('No-JS, quoted:')} “${P.plain('reading-progress')}” — ${b('which is this design’s whole case')}: the static value is the designed value, and the module only animates the fill as the reader scrolls the preview ⚑.`),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The meter is a ')}${code('<div role="img">')}${b(' with the label as its accessible name')} ⚑ — not a ${code('<progress>')}, which announces a percentage, and not ${code('aria-hidden')}, because the reading is content. ${b('It is not focusable')} ⚑. At Meter label = Hide the ${code('role="img"')} accessible name is still present and is the only place it appears ⚑.`),
    `${b('Flagged ⚑')} ${b('Whether ')}${code('post.reading_time')}${b(' is computed on the whole post or on the truncated preview must be verified before build')} ⚑ — the whole design depends on it, and if it is the preview the meter cannot be built as specified. The 90 % clamp is invented ⚑. The 20-minute fall-back from Segments to Rule is invented ⚑. This is A32’s one finding-shaped design.`
  ]]
};

globalThis.A32D = (globalThis.A32D || []).concat([d9, d10, d11, d12]);
})();
