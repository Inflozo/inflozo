// A32 designs 1–4 · Fade · Card · Panel · Contrast Band
(function () {
const K = globalThis.A32LIB, P = globalThis.A32PAGE;
const { L, D, MONO, PK, b, code, tile, gap, GATE, INCLUDED } = K;

/* ── shared A32 drawing helpers, reused by d2 and d3 ──────────────────── */
const mono = (g, txt, size) => `<span style="font-family:${MONO};font-size:${size || 10}px;color:${g.muted}">${txt}</span>`;
const hair = g => `<div style="width:100%;height:1px;background:${g.border}"></div>`;
const M = K.AM;

// the gate as a left-aligned or centred stack — the arrangement eight designs share
function gateStack(t, g, w, o) {
  o = o || {};
  const al = o.align || 'left';
  const bits = [K.gateHead(g, w, { gate:o.gate, align:al, measure:o.measure || 560, hSize:o.hSize, eyebrow:o.eyebrow, blurb:o.blurb })];
  bits.push(gap(o.actGap || (w === 390 ? 22 : 26)));
  bits.push(K.action(t, g, w, { gate:o.gate, align:al, row:o.rowAction !== false, field:o.field, link:o.gate && o.gate.key === 'upgrade' ? true : o.link }));
  if (o.included) {
    bits.push(gap(w === 390 ? 24 : 28) + hair(g) + gap(w === 390 ? 18 : 22));
    bits.push(K.included(g, { n:o.includedN || 3, tone:'muted', fs:15, label:o.includedLabel }));
  }
  return `<div style="display:flex;flex-direction:column;${al === 'center' ? 'align-items:center;text-align:center;' : ''}width:100%">${bits.join('')}</div>`;
}
const dest = (t, k) => K.portalNote(t, (k || GATE.paid).portal, k && k.key === 'upgrade' ? 'PORTAL’S PLANS PANEL, NOT ITS SIGNUP PANEL ⚑' : undefined);

globalThis.A32X = { mono, hair, M, gateStack, dest };

/* ── shared spec language ─────────────────────────────────────────────── */
const CUTROW = `${b('The preview is Ghost’s and the section cannot change it')} ⚑. ${b('The fade is drawn over text the browser already has')}; everything below the cut was never sent, so the fade is presentation and never protection ⚑.`;
const PORTALROW = `${b('Every action opens Ghost’s Portal')} ⚑ — signup, sign-in, checkout and plan changes. The theme draws the trigger; ${b('nothing behind it is themed')}, and no control moves the line.`;
const A11Y = `${b('The gate’s heading is an ')}${code('h2')}${b(', not an h1')} ⚑ — A24’s post header owns the page’s only one, and the gate sits inside ${code('<article>')}. ${b('The fade is a decorative ')}${code('<div aria-hidden="true">')} ⚑ so no screen reader meets it. Focus order: the last visible link in the article, the primary action, then the secondary line. Every action is 44 px or taller. Muted on the page ground 5.4:1; the accent button 4.7:1 ⚑.`;

const SETTLE_GATES = {
  label: 'WHAT THE FOUR GATES SETTLE FOR THE WHOLE CATEGORY',
  body: [
    `${b('Four gates, one arrangement.')} ${b('Free-signup')} (a members post, a signed-out reader) · ${b('paid')} (a paid post, a signed-out reader) · ${b('upgrade')} (a paid post, a signed-in free member) · ${b('specific tier')} (a post sold to one named tier) ⚑. ${b('The design never changes between them')} — only the eyebrow, the heading, the sentence and the button label do, and all four are fields.`,
    `${b('The upgrade gate drops the sign-in link')} ⚑ — a signed-in reader has nothing to sign in to — ${b('greets them by name')}, and its action goes to ${code('#/portal/account/plans')} rather than ${code('#/portal/signup')}. ${b('It is the one gate that must not offer an email field')}: Ghost already has the address.`,
    `${b('A reader with access never sees the section')} ⚑, so there is no unlocked, no “thanks for reading” and no dismissed state. ${b('The free gate is the only one whose action can be an email field')}, because free signup is the only action a theme can complete itself ⚑.`
  ]
};

/* ═══════════════════════════════════════════════════════════════════════
   1 · Fade
   ═══════════════════════════════════════════════════════════════════════ */
const d1 = {
  n:1, name:'Fade', gnd:'page',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 1 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The article’s last visible paragraph fades into the page ground, and the gate continues in the article’s own measure: eyebrow, heading, one sentence, the button, the sign-in line. No box, no plane, no rule.',
    'It is the category default and the arrangement the other eleven depart from. It is also the only design in A32 that collapses under the article-body archetype rather than a section one, because it is not really a section — it is the place the article stops.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · MEASURE 720 CENTRED IN THE 1,296 BOX · FADE 160 · PADDING COMFORTABLE 96',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const m = M(w);
    const k = (o || {}).gate || GATE.paid;
    const inner = `<div style="width:${m}px;margin:0 auto">${gateStack(t, g, w, { gate:k, measure:m, included:true, includedLabel:'What a membership includes' })}
      <div style="padding-top:${w === 390 ? 20 : 24}px">${dest(t, k)}</div></div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k });
  },
  stateBody(t, kind) {
    const g = K.ground(t, 'page');
    return gateStack(t, g, 1440, { gate:GATE[kind] || GATE.paid, measure:560, included:kind === 'paid' });
  },
  primaryNote:`${b('The gate keeps the article’s measure')} — 720 at 1440 — ${b('so nothing about the page’s width changes at the cut')} ⚑. The heading is 34 in the heading font against the body’s 19, which is a step above ${code('h2')} and below A24’s title; ${b('the eyebrow is the only place the word “members” appears before the button')}. ${b('The fade is 160 px of the page ground over the last visible paragraph and nothing else')} ⚑ — it does not run over the gate, and there is no text underneath it.`,
  freeNote:`${b('The same frame with four fields changed')}: eyebrow, heading, sentence, button label. ${b('The free gate is the one that may carry an email field')} instead of a button — Ghost’s free signup is the only action a theme can complete without Portal ⚑ — and at that value the design declares ${code('member-form')}.`,
  gatesNote:`${b('The upgrade gate is the signed-in free member’s')} ⚑ — no sign-in link, the reader’s name in the sentence, and the action pointed at Portal’s plans panel. ${b('The tier gate names the tier')} and nothing else changes. ${b('Neither is a separate design')}: same measure, same type, same button.`,
  landNote:`${b('The fade belongs to the last visible block, not to the section')} ⚑ — which is what makes this rule expressible as ${code('.gh-content > p:last-child')} and its siblings rather than as a script. ${b('After a paragraph:')} 160 px of ground. ${b('After a heading:')} no fade, and 40 px more space above the gate ⚑, because a faded heading promises a sentence that was never sent. ${b('After an image:')} no fade at all ⚑ — A19’s rule that no design filters, dims or tints a photograph, carried here without exception.`,
  statesNote:`${b('One accent in the section, and it is the button')} ⚑. Hover derives from it at 93 % brightness rather than adding a token; focus is A6’s 2 px ring at a 4 px offset. ${b('The secondary line is a text link whose rule thickens on hover')} and never becomes a second button — two buttons at a paywall is two decisions where the reader has one.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Fade', n:1, count:'SIX',
    sub:'The article fades and the gate continues in its measure.',
    rows:[
      K.seg('Fade', ['None', 'Short 96', 'Standard 160', 'Deep 240'], 2, 'Of the page ground over the last visible paragraph. ' + b('Suppressed after a heading, an image, a code block or an embed') + ' ⚑, whatever this says.'),
      K.seg('Blur the last block', ['Off', 'On'], 0, '2.6 px on the last visible paragraph only. ' + b('Decoration, not protection') + ' ⚑ — the blurred words are real words in the page and can be selected and copied. The withheld text is what is protected, and it is not there.'),
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 between the last visible block and the gate. 80 at 834, 64 at 390 — A17’s ladder.'),
      K.seg('Action', ['Button', 'Button and email field', 'Text link'], 0, b('Email field is offered only on the free-signup gate') + ' ⚑ and is greyed on the paid, upgrade and tier gates, where the theme cannot complete the action.'),
      K.seg('Included list', ['Show', 'Hide'], 0, 'Three authored lines under a hairline. ' + b('Hidden on the upgrade gate whatever this says') + ' ⚑ — a member reading the list they already half-own is an argument against upgrading.'),
      K.seg('Sign-in link', ['Show', 'Hide'], 0, '“Already a member? Sign in”. ' + b('Absent on the upgrade gate') + ' ⚑, which offers “Manage your membership” in its place.')
    ],
    settles:[
      `${b('Fade is a control, and suppression is not.')} A user may choose 96, 160, 240 or none; ${b('they may not choose to fade a heading or a photograph')} ⚑, because both are defects rather than tastes. That is the pattern for the whole category: the amount is the user’s, the rule is the design’s.`,
      `${b('Blur is honest about what it is.')} The help text says the blurred words are in the page — ${b('the only protection is that the rest was never sent')} ⚑ — so nobody ships this thinking it hides anything.`,
      `${b('Six controls, and none of them is a colour, a font or a width.')} Cut: a measure value (${b('the article owns the measure')} and A25 sets it ⚑), a ground value (that is 3 Panel and 4 Contrast Band), a containment value (2 Card and 5 Boxed), and an alignment value — ${b('at this measure centred and left are the same picture')}.`
    ]
  },
  respCap:'TABLET 834 · MEASURE 754 · MOBILE 390 · MEASURE 350, FADE 120 · THE ARTICLE’S LADDER, NOT A SECTION’S',
  tabletLabel:'834 · measure 754 · heading 30 · fade 160 · padding 80',
  mobileLabel:'390 · measure 350 · heading 25 · fade 120 · button full width',
  respNote:`${b('The article-body ladder, unaltered')}: the gate is the measure at every width, so it narrows when the article does and never at a breakpoint of its own ⚑. ${b('834')} measure 754, heading 30, fade 160, padding 80. ${b('≤ 767')} measure 350, heading 25, ${b('fade 120')} ⚑ — 160 px of gradient on a phone eats a third of the screen — ${b('the button goes full width')} and the sign-in line moves under it rather than beside it. ${b('The included list holds at three lines at every width')}.`,
  darkNote:`${b('The fade is the dark ground')} ⚑ — ${code('linear-gradient(rgba(23,21,17,0), #171511)')} — which is the whole of what dark mode changes here, and the reason the gradient is written from the token rather than from white. ${b('Body text sits at 12.4:1 and the gate’s heading at 15.1:1')}, A25’s deliberate step, carried. ${b('The accent re-checks at 4.9:1')} for ${code('#171511')} on ${code('#E0805A')}, so the button keeps the accent.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The last visible paragraph fades into the page ground and the gate continues in the article’s own measure — eyebrow, heading, sentence, button, sign-in line — with no box, plane or rule of its own. The category default.'),
    K.specRow(2, 'Structural descriptor', `${code('article body · none · page · none · none · the fade into the measure')}<br><span style="color:#6B6459">Archetype ${code('article body')} because the gate takes the article’s measure and its collapse, not a section’s ⚑ — it is the only design in A32 that does. Containment ${code('none')} and ground ${code('page')} are what 2 Card, 5 Boxed, 3 Panel and 4 Contrast Band each change exactly one of.</span>`),
    K.specRow(3, 'Archetype', 'article body. Its ladder: the measure narrows with the page and nothing rearranges. One departure — ' + b('the fade steps to 120 at ≤ 767') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} measure 720 centred in the 1,296 box on a 72 margin, heading 34, fade 160, padding 96. ${b('834')} measure 754, heading 30, fade 160, padding 80. ${b('≤ 767')} measure 350, heading 25, fade 120, ${b('button full width and the sign-in line beneath it')} ⚑, padding 64.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} opt 24 ch · ${code('heading')} opt 60 ch · ${code('blurb')} opt 240 ch · ${code('ctaLabel')} opt 24 ch · ${code('signinPrompt')} + ${code('signinLinkLabel')} · ${code('benefits[]')} 0–6 × 60 ch · ${code('benefitsLabel')} opt 24 ch — ${b('and the same five again for each of the four gates')} ⚑, which is what makes the gate copy a field set rather than a string. ${b('No image field')}: 10 Cover owns imagery and the field is stored ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Fade (None · Short 96 · Standard 160 · Deep 240) · Blur the last block (Off · On) · Padding (Compact · Comfortable · Spacious) · Action (Button · Button and email field · Text link) · Included list (Show · Hide) · Sign-in link (Show · Hide). Then the shared Access source group, not counted.'),
    K.specRow(7, 'Data', `${code('post.visibility')} decides the gate; ${code('@member')} decides whether the section renders at all ⚑. ${CUTROW} Tiers are read and ${b('not drawn')} — 7 Tiers is the design that draws them. ${b('0 tiers')} → the paid gate’s sentence loses its price clause and the button reads “See membership” ⚑. ${b('1')} → the price is that tier’s. ${b('many')} → the lowest paid price, prefixed “From”.`),
    K.specRow(8, 'Empty state', `No blurb → the stack closes up between heading and button. No benefits → the hairline goes with the list ⚑. No eyebrow → the heading rises 12 px and nothing is reserved. ${b('The heading has a default')} — “The rest of this piece is for members” ⚑ — ${b('because a paywall with no heading is a button with no reason')}.`),
    K.specRow(9, 'Behaviour module', `${P.NONE} ${b('At Action = Button and email field it declares ')}${code('member-form')} ⚑. ${b('No-JS, quoted:')} “${P.plain('member-form')}” ${P.EDITSAFE}`),
    K.specRow(10, 'Accessibility notes', A11Y),
    `${b('Flagged ⚑')} The 160 px default fade is A32’s own number and is not derived from anything ⚑. Suppressing the fade after a heading, an image, a code block and an embed is this category’s invention and is stated as a ${code(':last-child')} rule rather than a script ⚑. The four-gate copy set is invented — Ghost supplies the visibility, not the words ⚑.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   2 · Card
   ═══════════════════════════════════════════════════════════════════════ */
const d2 = {
  n:2, name:'Card', gnd:'surface',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 2 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The gate in one raised surface card at the article’s measure: pack radius plus four, one hairline, the md warm shadow, 32 px of padding. The fade runs into the page ground behind it and the card sits on top.',
    'It is the arrangement a reader recognises before reading a word of it, and the design where the section’s containment is the card rather than its contents.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · CARD 720 CENTRED · SURFACE ON PAGE · INNER PADDING 32',
  card(t, w, inner) {
    const g = K.ground(t, 'surface');
    const cw = w === 1440 ? 720 : w === 834 ? 754 : 350;
    const pad = w === 390 ? 22 : 32;
    return `<div style="width:${cw}px;margin:0 auto;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t.dark ? '' : `box-shadow:${t.shadow};`}padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column">${inner}</div>`;
  },
  body(t, w, o) {
    const g = K.ground(t, 'surface');
    const k = (o || {}).gate || GATE.paid;
    const inner = `${this.card(t, w, gateStack(t, g, w, { gate:k, measure:w === 1440 ? 560 : (w === 390 ? 306 : 620), included:true }))}
      <div style="width:${w === 1440 ? 720 : w === 834 ? 754 : 350}px;margin:0 auto;padding-top:${w === 390 ? 16 : 20}px">${dest(t, k)}</div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k, padTop:w === 1440 ? 72 : w === 834 ? 64 : 52,
      padNote:'AT OVERLAP = 40 THE CARD RISES INTO THE FADE AND THIS BECOMES 32 ⚑' });
  },
  stateBody(t, kind) {
    const g = K.ground(t, 'surface');
    return this.card(t, 834, gateStack(t, g, 1440, { gate:GATE[kind] || GATE.paid, measure:520, included:kind === 'paid' }))
      .replace('width:754px;margin:0 auto;', 'width:100%;');
  },
  primaryNote:`A19·3’s surface plane, carried verbatim: ${b('pack radius + 4, one hairline, the md warm shadow, and the shadow dropped in dark')} ⚑. ${b('The card is the section’s containment')} — the case the tuple’s ${code('card')} value exists for — and its contents are 1 Fade’s stack unchanged. ${b('The fade still ends in the page ground, not in the card’s surface')} ⚑: the fade belongs to the article and the card is a thing standing in front of it.`,
  freeNote:`${b('The card does not resize between gates')} ⚑. The free gate’s sentence is shorter than the paid gate’s and the card is correspondingly shorter — ${b('no minimum height, and nothing padded to match')}. A card with a reserved empty line in it is this arrangement’s commonest defect.`,
  gatesNote:`${b('The upgrade gate is the shortest card in the category')} — no sign-in row, no included list ⚑ — and it is the one to check the radius against, because a short card at a large radius stops reading as a card and starts reading as a pill.`,
  landNote:`${b('The card is the same card in all three landings')} ⚑; only the space above it changes. ${b('After a heading the gap goes to 72')} so the heading is not read as the card’s own title ⚑ — the single most likely misreading in this arrangement. ${b('After an image the card sits 72 below the photograph’s edge')} and never overlaps it, at any Overlap value ⚑.`,
  statesNote:`${b('The ring is drawn against the card’s surface')}, where the accent measures 4.4:1 on ${code('#FFFFFF')} — checked, and the reason the ring is 2 px rather than 1.5 ⚑. ${b('The card’s hairline is not a focus indicator')} and never thickens.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Card', n:2, count:'SIX',
    sub:'The gate in one raised card at the measure.',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'The space between the last visible block and the card: 72 · 96 · 132. ' + b('The card’s inner padding is not a control') + ' — it is 32, and 22 at 390 ⚑.'),
      K.sel('Card width', 'The measure 720', 'Narrow 560 · The measure 720 · Content box 1,040. ' + b('At 1,040 the card is wider than the article above it') + ', which is the point of that value ⚑.'),
      K.seg('Card depth', ['Raised', 'Flat'], 0, 'Raised is the md warm shadow; Flat is the hairline alone. ' + b('Forced to Flat in dark') + ' ⚑ — A19·3’s rule, and the hairline carries the plane there.'),
      K.seg('Overlap', ['Sits below the fade', 'Rises into it by 40'], 0, b('At Rises the card’s top sits 40 px inside the gradient') + ' and the padding above it becomes 32 ⚑. Never over a heading or an image.'),
      K.seg('Fade', ['None', 'Short 96', 'Standard 160'], 2, 'Behind the card, into the page ground. ' + b('Deep 240 is not offered here') + ' ⚑ — a 240 px gradient behind a raised card reads as a shadow twice.'),
      K.seg('Included list', ['Inside the card', 'Hide'], 0, 'Three lines under a hairline inside the card. ' + b('There is no Below the card value') + ' ⚑ — loose text under a card is the thing the card was drawn to avoid.')
    ],
    settles:[
      `${b('The card’s inner padding is not a control.')} Two padding rows in one panel is how a sidebar starts lying about which one is which ⚑; the one a user means when they say the gate is tight is the space above the card.`,
      `${b('No radius and no border-width value')} ⚑ — both come from the pack, and a card with its own radius is the fastest way to make a Style Pack switch look broken.`,
      `${b('Overlap is the control this design exists for.')} It is the only place in A32 where the gate and the fade share pixels, and ${b('it is refused after a heading and after an image')} ⚑ — the card would then be overlapping nothing, or a photograph.`
    ]
  },
  respCap:'TABLET 834 · CARD 754 · MOBILE 390 · CARD 350, INNER PADDING 22, SHADOW KEPT',
  tabletLabel:'834 · card 754 · inner 32 · heading 30',
  mobileLabel:'390 · card 350 · inner 22 · heading 25 · button full width',
  respNote:`Stack’s ladder inside a fixed containment. ${b('The card never goes edge-to-edge')} ⚑: at 390 it is 350 inside the 20 px page margins with its radius and hairline intact, and ${b('the shadow is kept')} ⚑ — on a phone the card’s edge is the only thing telling a reader where the gate begins. ${b('At 834 the card is the content box')}, 754, because the measure and the box are the same number there.`,
  darkNote:`${b('Card depth is forced to Flat')} ⚑ and the ${code('#332E27')} hairline carries the plane; the surface lifts to ${code('#211D17')} one step above the ${code('#171511')} ground, which is A27’s step and the reason the card still reads as raised without a shadow. ${b('The fade behind it stays the page ground')} ⚑ — it is the article’s gradient, not the card’s.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The gate inside one centred surface card at the article’s measure, at the pack’s radius + 4 with the md warm shadow, standing in front of the article’s fade. 1 Fade’s stack in a containment.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · card · page · none · none · a raised card over the fade')}<br><span style="color:#6B6459">Containment ${code('card')} — the section itself sits in one. Ground ${code('page')}: the card is ${b('on')} the page ground and the card’s own surface is not the section’s ground ⚑, which is the whole distinction from 3 Panel.</span>`),
    K.specRow(3, 'Archetype', 'stack. One departure: ' + b('the card does not go edge-to-edge at any width') + ' ⚑ — it keeps its margins, radius and hairline at 390.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} card 720 centred, inner 32, heading 34, fade 160, gap above 72. ${b('834')} card 754, inner 32, heading 30, gap 64. ${b('≤ 767')} card 350, inner 22, heading 25, fade 120, ${b('button full width, shadow kept')} ⚑, gap 52.`),
    K.specRow(5, 'Content fields', `As 1 Fade. ${code('benefits[]')} is drawn at ${b('three lines')} and a fourth is stored and not drawn ⚑ — the field list is the category’s and what a design draws from it is the design’s.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Card width (Narrow 560 · The measure 720 · Content box 1,040) · Card depth (Raised · Flat) · Overlap (Sits below the fade · Rises into it by 40) · Fade (None · Short 96 · Standard 160) · Included list (Inside the card · Hide). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} ${b('The card’s height is its content in every gate')} ⚑ — the upgrade gate is four elements tall and the paid gate seven, and neither is padded to match. Tiers read, not drawn.`),
    K.specRow(8, 'Empty state', `No benefits → the hairline goes with the list and the card ends at the sign-in row. ${b('An empty card is not reachable')}: the heading has a default and the button always renders ⚑. No eyebrow → the card’s first line is the heading.`),
    K.specRow(9, 'Behaviour module', P.NONE),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The card is a plain ')}${code('<div>')} — ${b('not a region, not a dialog, and not ')}${code('aria-modal')} ⚑. It is a paywall, not a blocker: the page behind it is a page the reader may keep reading, upward.`),
    `${b('Flagged ⚑')} The 40 px overlap is invented ⚑. Refusing Deep 240 behind a raised card is a judgement made here and not carried from anywhere ⚑. Forcing Flat in dark is carried from A19·3 rather than re-derived.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   3 · Panel
   ═══════════════════════════════════════════════════════════════════════ */
const d3 = {
  n:3, name:'Panel', gnd:'surface',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 3 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The gate on one raised plane the width of the content box, with the copy centred on a 560 measure and what a membership includes in a row of three beneath a hairline.',
    'The same components as 1 Fade on a different ground. It is the design for a publication whose sections all sit on planes, and the one that makes the paywall look like the rest of the site rather than like an interruption.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · PLANE 1,296 · COPY CENTRED ON 560 · INCLUDED ROW THREE UP',
  body(t, w, o) {
    const g = K.ground(t, 'surface');
    const k = (o || {}).gate || GATE.paid;
    const pw = w === 1440 ? 1296 : w === 834 ? 754 : 350;
    const pad = w === 1440 ? 56 : w === 834 ? 40 : 20;
    const col = w === 1440 ? 560 : w === 834 ? 520 : 310;
    const cols = w === 1440 ? 3 : w === 834 ? 3 : 1;
    const row = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${w === 390 ? 14 : 28}px;width:100%">${
      K.INCLUDED.slice(0, 3).map((x, i) => `<div style="display:flex;flex-direction:column;gap:7px">
        <span style="font-family:${MONO};font-size:10.5px;letter-spacing:.06em;color:${g.muted}">${String(i + 1).padStart(2, '0')}</span>
        <span style="font-size:15px;line-height:1.5;color:${g.text};font-family:${PK.body};text-wrap:pretty">${x}</span></div>`).join('')}</div>`;
    const inner = `<div style="width:${pw}px;margin:0 auto;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t.dark ? '' : `box-shadow:${t.shadow};`}padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column">
        <div style="width:${col}px;margin:0 auto">${gateStack(t, g, w, { gate:k, align:'center', measure:col })}</div>
        ${gap(w === 390 ? 26 : 34)}${A32X.hair(g)}${gap(w === 390 ? 20 : 26)}${row}</div>
      <div style="padding-top:${w === 390 ? 16 : 20}px">${dest(t, k)}</div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k });
  },
  stateBody(t, kind) {
    const g = K.ground(t, 'surface');
    return `<div style="width:100%;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t.dark ? '' : `box-shadow:${t.shadow};`}padding:26px;box-sizing:border-box">${
      gateStack(t, g, 1440, { gate:GATE[kind] || GATE.paid, align:'center', measure:520 })}</div>`;
  },
  primaryNote:`${b('The plane is the section’s ground, not its containment')} ⚑ — A26·3 and A27·4’s call, carried: a full-width raised area is a ground, and the tuple says ${code('surface')} rather than ${code('card')} because of it. ${b('That is the whole distinction from 2 Card, and it is visible at rest')}. The copy is centred on 560 rather than taking the plane’s width, because a 1,184 px line of body text is not a line anybody reads ⚑.`,
  freeNote:`${b('The plane holds its width and loses height')} ⚑ between gates. The included row is the plane’s reason to be this wide, and it is the same three lines on the free gate as on the paid one — ${b('the row is what a membership includes, not what this gate is selling')} ⚑.`,
  gatesNote:`${b('The upgrade gate drops the included row')} ⚑, and at that point the plane is 1,296 px wide holding 560 px of copy. ${b('The panel names 1 Fade as the better design for a site that mostly meets signed-in free members')} ⚑ — that is the hand-off rule, used deliberately.`,
  landNote:`${b('The plane never overlaps anything')} ⚑ and its top edge is the padding value in all three landings. ${b('After an image the plane’s edge and the photograph’s edge are two hard edges 96 px apart')} — checked, and the reason this design does not offer an overlap value ⚑.`,
  statesNote:`${b('The ring is drawn against the plane’s surface')}, where the accent measures 4.4:1 on ${code('#FFFFFF')} ⚑. The mono ordinals in the included row are ${code('aria-hidden')} and are not targets.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Panel', n:3, count:'SIX',
    sub:'The gate on one raised plane.',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'Above and below the plane: 64 · 96 · 132. ' + b('The plane’s own inner padding is 56 · 40 · 20 by width and is not a control') + ' ⚑.'),
      K.seg('Plane width', ['Content box 1,296', 'Held 1,040', 'The measure 720'], 0, b('Held centres a narrower plane in the same box') + '; The measure makes the plane exactly as wide as the article above it ⚑.'),
      K.seg('Plane depth', ['Raised', 'Flat'], 0, 'md warm shadow, or the hairline alone. ' + b('Forced to Flat in dark') + ' ⚑.'),
      K.seg('Alignment', ['Centred', 'Left to the measure'], 0, 'Where the 560 copy column sits on the plane. ' + b('The included row is left-aligned at both values') + ' ⚑ — a three-column row centred inside itself reads as a mistake.'),
      K.seg('Included row', ['Three up', 'Hide'], 0, b('Three up needs three authored lines') + '; with two it draws two columns and the row stays left-aligned, never justified ⚑.'),
      K.seg('Fade', ['None', 'Short 96', 'Standard 160', 'Deep 240'], 2, 'Into the page ground above the plane. ' + b('The fade never runs onto the plane') + ' ⚑ — it is the article’s gradient and it ends where the article does.')
    ],
    settles:[
      `${b('No ground value here.')} This design ${b('is')} the surface ground; a Page value would make it 1 Fade and a Contrast value would make it 4 Contrast Band ⚑. ${b('Two designs that differ by one control value are one design')} — A30·4’s finding, carried.`,
      `${b('Plane width, not copy width.')} The copy is 560 at all three plane values ⚑ — a measure that grows with its container is the one thing this arrangement must not do.`,
      `${b('The included row is why the plane is this wide.')} At Hide the panel names 2 Card as the better design ⚑, because a 1,296 plane holding 560 px of copy and nothing else is a lot of surface for one button.`
    ]
  },
  respCap:'TABLET 834 · PLANE 754, ROW STILL THREE UP · MOBILE 390 · PLANE 350, ROW STACKS, INNER PADDING 20',
  tabletLabel:'834 · plane 754 · inner 40 · copy 520 · row three up',
  mobileLabel:'390 · plane 350 · inner 20 · copy 310 · row stacked',
  respNote:`${b('The plane is always the content box')} ⚑ — 1,296, then 754, then 350 — so it narrows with the page and never goes edge-to-edge. ${b('The included row holds at three up down to 834 and stacks at 767')} ⚑, which is the grid-of-N ladder even though this design is a stack. ${b('The plane’s inner padding is 56 → 40 → 20')}: at 390 it matches the page margin exactly, so the copy’s left edge sits where every other section’s does ⚑.`,
  darkNote:`The plane lifts to ${code('#211D17')} on the ${code('#171511')} ground with ${b('the shadow dropped and Plane depth forced to Flat')} ⚑. ${b('The fade above it is still the page ground')} — ${code('rgba(23,21,17,0)')} to ${code('#171511')} ⚑ — so the gradient ends and the plane begins, rather than one bleeding into the other. Mono ordinals to ${code('#A79E8F')}.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One raised plane the width of the content box carrying the gate centred on a 560 measure and a three-column included row under a hairline. 1 Fade’s components with the section’s ground changed.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · surface · none · none · the gate on one raised plane')}<br><span style="color:#6B6459">Containment ${code('none')} and ground ${code('surface')} — a full-width plane is a ground, not a containment: A26·3 and A27·4’s call ⚑. Item-count ${code('none')}: the included row is authored prose, not a repeating unit.</span>`),
    K.specRow(3, 'Archetype', 'stack. No departures; the plane narrows with the content box and the included row follows the grid ladder.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,296 on a 72 margin, inner 56, copy 560, row three up, padding 96. ${b('834')} plane 754, inner 40, copy 520, row three up, padding 80. ${b('≤ 767')} plane 350, inner 20, copy 310, ${b('row stacked')} ⚑, fade 120, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Fade. ${code('benefits[]')} is the field this design leans on — ${b('three authored lines is what the row is designed for')}, two draws two columns left-aligned, and none hides the row and its hairline ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Plane width (Content box 1,296 · Held 1,040 · The measure 720) · Plane depth (Raised · Flat) · Alignment (Centred · Left to the measure) · Included row (Three up · Hide) · Fade (None · Short 96 · Standard 160 · Deep 240). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} ${b('The plane is never hidden')} ⚑ — it is the ground, and a section with no ground is 1 Fade. Tiers read, not drawn; 0, 1 and many tiers are the same plane.`),
    K.specRow(8, 'Empty state', `No benefits → hairline and row both go and the plane shortens to the copy. No blurb → heading then button. ${b('On the upgrade gate the row is suppressed by rule')} ⚑, not by the control.`),
    K.specRow(9, 'Behaviour module', P.NONE),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The plane is a ')}${code('<div>')}${b(' and not a landmark')} ⚑. The included row is a ${code('<ul>')} with the mono ordinals ${code('aria-hidden')}. ${b('Focus rings are drawn against the surface')}, where the accent measures 4.4:1 — checked, and the reason the ring is 2 px rather than 1.5 ⚑.`),
    `${b('Flagged ⚑')} “Held 1,040” is an invented second plane width, carried from A30·4 ⚑. The mono ordinals on the included row are this design’s own and are not shared with 1 Fade’s tick list ⚑.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   4 · Contrast Band
   ═══════════════════════════════════════════════════════════════════════ */
const d4 = {
  n:4, name:'Contrast Band', gnd:'contrast', bleed:true,
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 4 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The gate as a full-bleed inverted band across the page: the pack’s contrast colour carrying its own text, the copy centred on 560, everything on the band derived from the band rather than from the page.',
    'It is the loudest design in the category and the one that most plainly says the article has stopped. It is also the one with no accent at all, because the accent does not survive the band.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · FULL-BLEED CONTRAST BAND · INNER PADDING 72 · COPY CENTRED ON 560',
  band(t, w, inner) {
    const g = K.ground(t, 'contrast');
    const pad = w === 1440 ? 72 : w === 834 ? 56 : 48;
    return `<div style="width:100%;background:${g.bg};padding:${pad}px ${K.G(w).m}px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center">${inner}</div>`;
  },
  body(t, w, o) {
    const g = K.ground(t, 'contrast');
    const k = (o || {}).gate || GATE.paid;
    const col = w === 1440 ? 560 : w === 834 ? 520 : 310;
    const inner = `${this.band(t, w, `<div style="width:${col}px">${gateStack(t, g, w, { gate:k, align:'center', measure:col, included:true, includedLabel:false })}</div>`)}
      <div style="padding:${w === 390 ? 14 : 18}px ${K.G(w).m}px 0">${dest(t, k)}</div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k, bleed:true,
      padTop:w === 1440 ? 96 : w === 834 ? 80 : 64, padNote:'THE BAND CARRIES ITS OWN PADDING · 72 · 56 · 48 INSIDE ⚑' });
  },
  stateBody(t, kind) {
    const g = K.ground(t, 'contrast');
    return `<div style="width:100%;background:${g.bg};padding:30px 26px;box-sizing:border-box;display:flex;justify-content:center">
      <div style="width:100%;max-width:520px">${gateStack(t, g, 1440, { gate:GATE[kind] || GATE.paid, align:'center', measure:520 })}</div></div>`;
  },
  primaryNote:`A17·7’s on-contrast derivation, carried verbatim: ${b('muted at 72 %, hairlines at 20 % and plates at 8 % of the band’s carried colour')} ⚑ — nothing on the band reads a page token. ${b('The button inverts')}: the carried colour as its fill and the band colour as its label, which is A17·7’s rule and the reason ${b('this design has no accent at all')} ⚑. ${b('The accent measures 4.0:1 on the band and the value is disabled with its ratio shown')} ⚑, never silently allowed.`,
  freeNote:`${b('The band does not change size between gates')} ⚑; it changes height. ${b('The free gate is the one to check the band against')} — its sentence is short, and a 72 px band padding around three short lines is a lot of ink for a free signup ⚑. The panel says so at Compact.`,
  gatesNote:`${b('The upgrade gate on a contrast band is the category’s hardest frame')} ⚑ — an inverted full-bleed band shown to somebody who is already paying you something. It is drawn, and the panel names 1 Fade as the quieter alternative ⚑.`,
  landNote:`${b('The band is the same band in all three landings')} ⚑; only the page padding above it changes. ${b('After an image the band’s top edge meets the photograph’s bottom edge across the full width')} — two hard edges, so ${b('the padding above goes to 96 and never below it')} ⚑.`,
  statesNote:`${b('Focus on the band is the carried colour, not the accent')} ⚑ — ${code('#FBF9F5')} at 2 px on ${code('#232019')} measures 15.9:1, where the accent measures 4.0:1 and fails ⚑. That substitution is A17·7’s, carried, and it is the reason the ring rule reads “the accent, or the carried colour on a contrast ground”.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Contrast Band', n:4, count:'SIX',
    sub:'The gate as an inverted full-bleed band.',
    rows:[
      K.seg('Band padding', ['Compact', 'Comfortable', 'Spacious'], 1, '48 · 72 · 104 inside the band. ' + b('The section has no padding of its own') + ' — the band carries it ⚑, which is A2 and A17·7’s rule for every band in the library.'),
      K.seg('Band edges', ['Full bleed', 'Inset to the content box'], 0, 'Full bleed is edge to edge; Inset is 1,296 with the pack radius and the page ground either side ⚑.'),
      K.seg('Alignment', ['Centred', 'Left to the measure'], 0, 'Where the 560 copy column sits on the band. ' + b('Left aligns it to the article’s left edge above') + ', which is the value for a site that never centres anything.'),
      K.seg('Included list', ['Show', 'Hide'], 0, 'Three lines under a 20 % hairline. ' + b('The ticks are the carried colour at 72 %') + ', never the accent ⚑.'),
      K.seg('Fade', ['None', 'Short 96', 'Standard 160'], 2, 'Into the page ground above the band. ' + b('The fade never runs into the band colour') + ' ⚑ — the article ends in its own ground and the band starts.'),
      K.seg('Sign-in link', ['Show', 'Hide'], 0, 'Underlined in the carried colour at full strength, not at 72 % ⚑ — a link at muted strength on an inverted band is the commonest contrast failure in the library.')
    ],
    settles:[
      `${b('No accent value, and no accent.')} On ${code('#232019')} the Paper accent measures 4.0:1 and fails AA ⚑; ${b('the value is drawn disabled with its ratio shown')} rather than removed, so a user who expected it learns why. ${b('This is the only design in A32 with no accent')}.`,
      `${b('No ground value.')} This design ${b('is')} the contrast ground; Page would make it 1 Fade and Surface 3 Panel ⚑.`,
      `${b('Fade into the band is not offered.')} It was drawn and refused ⚑: a gradient that ends in the band colour makes the band look like a shadow of the article, and at Inset it would end in a colour the band does not have at that x-position. ${b('The fade is the article’s and ends in the article’s ground')} ⚑.`
    ]
  },
  respCap:'TABLET 834 · BAND FULL BLEED, PADDING 56 · MOBILE 390 · PADDING 48, COPY 310 · THE BAND NEVER INSETS AT 390',
  tabletLabel:'834 · band full bleed · inner 56 · copy 520',
  mobileLabel:'390 · band full bleed · inner 48 · copy 310 · button full width',
  respNote:`${b('Bands do not collapse')} ⚑ — the arrangement at 390 is the arrangement at 1440 with smaller numbers. ${b('Inner padding steps 72 → 56 → 48')} and the copy 560 → 520 → 310. ${b('At ≤ 767 Band edges is forced to Full bleed')} ⚑: an inset band inside 20 px page margins is a card, and 2 Card is the design for that. ${b('The included list holds at three lines')} and stacks nothing, because it was never a row here.`,
  darkNote:`${b('Contrast inverts with the mode')} ⚑ — in dark the band is ${code('#EDE7DA')} carrying ${code('#171511')}, so the loud band becomes the light one and the page around it is the dark one. ${b('The derivation is unchanged')}: muted at 72 %, hairlines at 20 %, plates at 8 % of the carried colour ⚑. ${b('The button is ')}${code('#171511')}${b(' on ')}${code('#EDE7DA')} at 16.1:1 ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The gate as a full-bleed inverted band carrying the copy centred on 560 and a three-line included list, with every colour on the band derived from the band’s carried colour. The category’s one accent-free design.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · contrast · none · none · an inverted full-bleed band')}<br><span style="color:#6B6459">Ground ${code('contrast')} is the design. Containment ${code('none')} — a full-bleed band is a ground, and at Band edges = Inset it is still a ground rather than a card, because it has no hairline and no shadow ⚑.</span>`),
    K.specRow(3, 'Archetype', 'stack. One departure: ' + b('the band does not collapse at any width') + ' ⚑ and Band edges is forced to Full bleed at ≤ 767.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} full bleed, inner 72, copy 560, page padding above 96. ${b('834')} full bleed, inner 56, copy 520, padding 80. ${b('≤ 767')} ${b('full bleed forced')} ⚑, inner 48, copy 310, button full width, fade 120, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Fade. ${code('benefitsLabel')} is ${b('stored and not drawn')} ⚑ — a section heading above three lines on a band is one hierarchy level too many.`)
  ], [
    K.specRow(6, 'Controls', 'Band padding (Compact 48 · Comfortable 72 · Spacious 104) · Band edges (Full bleed · Inset to the content box) · Alignment (Centred · Left to the measure) · Included list (Show · Hide) · Fade (None · Short 96 · Standard 160) · Sign-in link (Show · Hide). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} ${PORTALROW} Tiers read, not drawn.`),
    K.specRow(8, 'Empty state', `No benefits → the 20 % hairline goes with the list. No blurb → heading then button, and ${b('the band’s padding is unchanged')} ⚑ — a band that shrinks to fit its shortest gate reads as a different band on every post.`),
    K.specRow(9, 'Behaviour module', P.NONE),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The focus ring on the band is the carried colour, not the accent')} ⚑ — 15.9:1 against 4.0:1. Muted text on the band is the carried colour at 72 %, which measures 8.9:1 ⚑. ${b('The band is a ')}${code('<div>')}${b(', not a landmark')}.`),
    `${b('Flagged ⚑')} The 48 · 72 · 104 padding ladder is this design’s own and is not A17’s ⚑. Refusing “fade into the band” is a judgement made here ⚑. The contrast ratios are computed from the Paper tokens and hold for Paper only — ${b('every pack re-checks them')} ⚑.`
  ]]
};

globalThis.A32D = (globalThis.A32D || []).concat([d1, d2, d3, d4]);
})();
