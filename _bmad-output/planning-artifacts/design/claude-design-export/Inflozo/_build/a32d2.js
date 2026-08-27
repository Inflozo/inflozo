// A32 designs 5–8 · Boxed · Split Pitch · Tiers · Ledger
(function () {
const K = globalThis.A32LIB, P = globalThis.A32PAGE, X = globalThis.A32X;
const { L, D, MONO, PK, b, code, tile, gap, GATE, INCLUDED, LEDGER } = K;
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
   5 · Boxed
   ═══════════════════════════════════════════════════════════════════════ */
const d5 = {
  n:5, name:'Boxed', gnd:'page',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 5 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'One hairline box at the article’s measure, on the page ground, with no fill and no shadow. The gate inside it at 28 px of padding: eyebrow, heading, sentence, button, sign-in line.',
    'It is 2 Card with the plane taken away — the design for a publication whose pages are ruled rather than layered, and the cheapest containment in the library.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · BOX 720 · HAIRLINE ALL ROUND · NO FILL, NO SHADOW · INNER PADDING 28',
  box(t, w, inner, rule) {
    const g = K.ground(t, 'page');
    const bw = w === 1440 ? 720 : w === 834 ? 754 : 350;
    const pad = w === 390 ? 20 : 28;
    const border = rule === 'tb'
      ? `border-top:1px solid ${g.border};border-bottom:1px solid ${g.border};border-radius:0;`
      : `border:1px solid ${g.border};border-radius:${g.r}px;`;
    return `<div style="width:${bw}px;margin:0 auto;${border}padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column">${inner}</div>`;
  },
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const k = (o || {}).gate || GATE.paid;
    const inner = `${this.box(t, w, gateStack(t, g, w, { gate:k, measure:w === 1440 ? 560 : (w === 390 ? 310 : 620), included:true }))}
      <div style="width:${w === 1440 ? 720 : w === 834 ? 754 : 350}px;margin:0 auto;padding-top:${w === 390 ? 16 : 20}px">${dest(t, k)}</div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k });
  },
  stateBody(t, kind) {
    const g = K.ground(t, 'page');
    return `<div style="width:100%;border:1px solid ${g.border};border-radius:${g.r}px;padding:24px;box-sizing:border-box;background:${g.bg}">${
      gateStack(t, g, 1440, { gate:GATE[kind] || GATE.paid, measure:520, included:kind === 'paid' })}</div>`;
  },
  primaryNote:`${b('A box is a hairline and nothing else')} ⚑ — no fill, no shadow, no lift. The page ground runs through it, which is why ${b('the fade behind it is visible right up to the box’s top rule')} and why this is the one containment in A32 that does not need the fade to stop early. ${b('The tuple says ')}${code('box')}${b(' rather than ')}${code('card')}${b(' for exactly that reason')}: containment without a plane.`,
  freeNote:`${b('The box holds its width and loses height')} between gates ⚑. ${b('It is the containment that survives a short gate best')} — a 720 × 190 box still reads as a box, where a 720 × 190 card starts reading as a banner ⚑.`,
  gatesNote:`${b('The upgrade gate is three elements in a hairline box')} ⚑. At Box rule = Top and bottom only it becomes two rules and no sides, which is this design’s quietest state and the one the panel recommends for a site that meets free members often.`,
  landNote:`${b('After a heading the box’s top rule and the heading are 72 px apart')} ⚑ — closer and the box reads as the heading’s content. ${b('After an image the box’s top rule is the second horizontal line in 96 px')}; the panel notes it, and ${b('Top and bottom only is refused after an image')} ⚑ because three rules in a row is a table.`,
  statesNote:`${b('The box’s hairline never thickens on hover or focus')} ⚑ — it is containment, not state. The ring is drawn against the page ground where the accent measures 4.7:1 ⚑.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Boxed', n:5, count:'SIX',
    sub:'One hairline box at the measure.',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 between the last visible block and the box. ' + b('The box’s inner padding is 28, and 20 at 390') + ' — not a control ⚑.'),
      K.sel('Box width', 'The measure 720', 'Narrow 560 · The measure 720 · Content box 1,296. ' + b('At 1,296 the box is wider than the article and the copy stays at 560') + ' ⚑.'),
      K.seg('Box rule', ['All round', 'Top and bottom only', 'Left edge only'], 0, b('Left edge only is a 2 px rule in the text colour') + ', never the accent ⚑ — an accent left border on a box is the library’s most-refused pattern.'),
      K.seg('Fade', ['None', 'Short 96', 'Standard 160', 'Deep 240'], 2, 'Into the page ground above the box. ' + b('The ground runs through the box') + ', so a deep fade and a box do not fight ⚑.'),
      K.seg('Included list', ['Show', 'Hide'], 0, 'Three lines under a hairline inside the box. ' + b('The inner hairline is the same token as the box’s own') + ' ⚑ — one border weight in one containment.'),
      K.seg('Action', ['Button', 'Text link'], 0, b('No email field here') + ' ⚑ — a 46 px field inside a hairline box at 28 px of padding puts three rules within 60 px of each other. 6 Split Pitch is the design with the field.')
    ],
    settles:[
      `${b('Left edge only is drawn in the text colour, and that is the whole argument.')} A hairline box with an accent left border is the shape every template on the internet uses for a callout ⚑; the value exists, the colour does not.`,
      `${b('No fill value.')} A filled box is 2 Card without its shadow, and ${b('a design that is another design minus one property is not a design')} ⚑. If a publication wants the plane, the picker offers it two rows up.`,
      `${b('Six controls.')} Cut: an alignment value (the copy is left at every width and centring it inside a left-ruled box is incoherent ⚑), a radius value (the pack’s), and a second hairline weight.`
    ]
  },
  respCap:'TABLET 834 · BOX 754 · MOBILE 390 · BOX 350, INNER PADDING 20 · THE BOX NEVER GOES EDGE-TO-EDGE',
  tabletLabel:'834 · box 754 · inner 28 · heading 30',
  mobileLabel:'390 · box 350 · inner 20 · heading 25 · button full width',
  respNote:`Stack’s ladder inside a fixed containment. ${b('At ≤ 767 the box keeps its 20 px page margins, its radius and its hairline')} ⚑ and the inner padding steps to 20 — so the copy sits 40 px from the frame edge, which is 20 more than the article above it. ${b('That inset is deliberate and is the only place in A32 where the gate is narrower than the article')} ⚑. At Box rule = Top and bottom only the inset disappears and the copy lines up with the article again.`,
  darkNote:`${b('The hairline is the whole design, so the hairline is the whole of dark')} ⚑: ${code('#EBE5DB')} becomes ${code('#332E27')} on the ${code('#171511')} ground. ${b('Nothing lifts and nothing gains a shadow')} — there was never a plane to drop one from, which makes this the design that changes least between modes ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One hairline box at the article’s measure with no fill and no shadow, holding the gate at 28 px of padding. Containment without a plane.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · box · page · none · none · one hairline box in the measure')}<br><span style="color:#6B6459">Containment ${code('box')} — a hairline with the page ground running through it, which is what separates it from 2 Card’s ${code('card')} ⚑. Ground ${code('page')}: the box has no ground of its own, and that is the definition being used.</span>`),
    K.specRow(3, 'Archetype', 'stack. One departure: ' + b('the box does not go edge-to-edge at any width') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} box 720, inner 28, copy 560, heading 34, fade 160, padding 96. ${b('834')} box 754, inner 28, heading 30, padding 80. ${b('≤ 767')} box 350, inner 20, heading 25, ${b('button full width')}, fade 120, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Fade. No field is added and none is dropped; ${code('benefits[]')} draws three ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Box width (Narrow 560 · The measure 720 · Content box 1,296) · Box rule (All round · Top and bottom only · Left edge only) · Fade (None · Short 96 · Standard 160 · Deep 240) · Included list (Show · Hide) · Action (Button · Text link). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} Tiers read, not drawn.`),
    K.specRow(8, 'Empty state', `No benefits → the inner hairline goes with the list. ${b('An empty box is not reachable')} ⚑. ${b('At Box rule = Left edge only with no benefits the box is a 2 px rule beside four lines')}, which is the design at its smallest and is still coherent ⚑.`),
    K.specRow(9, 'Behaviour module', P.NONE),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The box is a plain ')}${code('<div>')} ⚑. At Left edge only the rule is a ${code('border-left')} and carries no meaning a screen reader needs.`),
    `${b('Flagged ⚑')} The 28 px inner padding is A32’s own ⚑. Refusing an accent left border is a library judgement stated here for the first time ⚑. Refusing Top and bottom only after an image is this design’s own rule ⚑.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   6 · Split Pitch
   ═══════════════════════════════════════════════════════════════════════ */
const d6 = {
  n:6, name:'Split Pitch', gnd:'page',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 6 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The reason in a 700 column and the action in a 520 one beside it, across the full content box — so the gate is wider than the article it interrupts, and the widening is the signal that the article has stopped.',
    'It is the design for a publication with something to say at the cut: the heading can run to two lines, the sentence to three, and what a membership includes sits under them as numbered rows rather than beside the button.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · REASON 700 · ACTION 520 · 76 GAP · THE FULL 1,296 BOX',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const k = (o || {}).gate || GATE.paid;
    if (w === 1440) {
      const inner = `<div style="display:flex;gap:76px;align-items:flex-start">
        <div style="width:700px;flex-shrink:0;display:flex;flex-direction:column">
          ${K.gateHead(g, w, { gate:k, measure:620, hSize:40 })}
          ${gap(30)}${K.included(g, { style:'rows', dens:14, n:4 })}</div>
        <div style="width:520px;display:flex;flex-direction:column">
          ${K.action(t, g, w, { gate:k, field:true, fieldMax:520 })}
          ${gap(20)}${dest(t, k)}</div></div>`;
      return K.scene(t, w, inner, { last:'para', fade:160, gate:k });
    }
    const inner = `<div style="display:flex;flex-direction:column">
      ${K.gateHead(g, w, { gate:k, measure:w === 834 ? 620 : 350, hSize:w === 834 ? 32 : 25 })}
      ${gap(w === 390 ? 22 : 26)}${K.action(t, g, w, { gate:k, field:true, fieldMax:w === 834 ? 520 : 350 })}
      ${gap(w === 390 ? 24 : 28)}${hair(g)}${gap(w === 390 ? 16 : 20)}
      ${K.included(g, { style:'rows', dens:w === 390 ? 12 : 14, n:4 })}
      ${gap(18)}${dest(t, k)}</div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k });
  },
  stateBody(t, kind, narrow) {
    const g = K.ground(t, 'page');
    const k = GATE[kind] || GATE.paid;
    const w = narrow ? 390 : 834;
    return `<div style="display:flex;flex-direction:column;width:100%">${K.gateHead(g, w, { gate:k, measure:narrow ? 340 : 560, hSize:narrow ? 23 : 28 })}
      ${gap(20)}${K.action(t, g, w, { gate:k, field:k.key === 'free', fieldMax:420 })}</div>`;
  },
  primaryNote:`A5·5’s split head, re-proportioned for a gate: ${b('700 and 520 in the 1,296 box with a 76 gap')} ⚑, the reason’s measure held at 620 so the column has air at its right. ${b('The gate is 1,296 wide where the article above it is 720')} ⚑ — that widening is the design, and it is the reason this is the only A32 design whose left edge does not line up with the paragraph above it. ${b('The included list is A5·11’s numbered rows')}, 01–04 in mono over hairlines.`,
  freeNote:`${b('The free gate is the one this design was drawn for')} ⚑ — the email field completes the action in place, so the reason and the action are genuinely side by side rather than a pitch beside a link to a pitch. At this value the design declares ${code('member-form')}.`,
  gatesNote:`${b('The upgrade gate loses the field')} ⚑ — Ghost already has the member’s address — so the right column is a button and a “Manage your membership” link, and the panel says the split is doing less work there. ${b('The tier gate keeps the field only when the tier has a free option')}, which it never does ⚑, so it is a button.`,
  landNote:`${b('The split does not care what the cut landed on')} ⚑; it is the widest gate in the category and reads as a change of gear at any landing. ${b('After an image the numbered rows and the photograph’s bottom edge are both hard horizontals')} — the panel notes it and the Included list value Ticks is the way out ⚑.`,
  statesNote:`${b('The field’s focus border is 1.5 px in the accent')} and the button’s ring is 2 px at a 4 px offset — A16 and A6’s treatments, carried, and the two are never on screen at once ⚑.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Split Pitch', n:6, count:'SIX',
    sub:'The reason beside the action.',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132. 80 at 834, 64 at 390 — A17’s ladder.'),
      K.seg('Split', ['Wide left 700', 'Even 636'], 0, 'Of the 1,296 box; the action takes the rest less the 76 gap. ' + b('At Even the action column is 584 and the field stays full width') + ' ⚑.'),
      K.seg('Action side', ['Right', 'Left'], 0, 'Which side the action takes. ' + b('The stack order at ≤ 833 is reason then action at both values') + ' ⚑ — an action above the reason for it is an action nobody takes.'),
      K.seg('Included list', ['Numbered rows', 'Ticks', 'Hide'], 0, 'A5·11’s two list treatments, carried. ' + b('Numbered rows suit four or more lines; ticks suit two') + '.'),
      K.seg('Action', ['Button', 'Button and email field'], 1, b('The field is offered only on the free-signup gate') + ' ⚑ and is greyed elsewhere with the reason shown.'),
      K.seg('Fade', ['None', 'Short 96', 'Standard 160', 'Deep 240'], 2, 'Into the page ground above the split. ' + b('The fade is the article’s width, 720, not the gate’s 1,296') + ' ⚑.')
    ],
    settles:[
      `${b('The fade is 720 wide and the gate is 1,296.')} That mismatch was drawn, checked and kept ⚑ — the gradient belongs to the paragraph it covers, and widening it to the gate’s width would fade page ground into page ground either side ⚑.`,
      `${b('No field-width control')} ⚑ — the field is the action column’s width, and a 400 px field in a 520 px column is this arrangement’s one ugly state.`,
      `${b('No vertical rule between the columns.')} A 76 px gap on a warm ground separates them; ${b('a hairline down the middle reads as a table')} ⚑, and the hairlines here belong to the numbered rows.`
    ]
  },
  respCap:'TABLET 834 · COLUMNS STACK AT 833, REASON FIRST · MOBILE 390 · SAME STACK, LIST UNDER THE ACTION',
  tabletLabel:'834 · stacked · heading 32 · reason measure 620 · field full width',
  mobileLabel:'390 · heading 25 · field and button stack · numbered rows at 12 px',
  respNote:`Split’s ladder, unaltered: ${b('the two columns become one at 833')}, reason first, action second. ${b('At ≤ 767 the field and its button stop sitting on one line and stack')} ⚑ — a 46 px field beside a 132 px button inside 350 px leaves 200 px for an email address. ${b('The included list stays below the action at both stacked widths')}, which is its stated destination and this design’s one departure from the archetype ⚑.`,
  darkNote:`A27’s step. ${b('The two columns share one ground')}, so nothing lifts and nothing gains a shadow ⚑; the tuned values are the field’s fill, the numbered rows’ hairlines and the accent on the button. ${b('The mono ordinals go to the muted token')} rather than staying at ${code('#6B6459')} — the commonest way a numbered list stops matching its pack in dark ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The reason for membership in a 700 column with numbered included rows and the action alone in a 520 column beside it, across the full content box — a gate wider than the article it interrupts.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · page · none · none · the reason beside the action')}<br><span style="color:#6B6459">Archetype ${code('split')} rather than ${code('stack')} because the arrangement, not the copy, is the design. Media ${code('none')} — 10 Cover is the design with a picture, and that slot is what separates them ⚑.</span>`),
    K.specRow(3, 'Archetype', 'split. Its ladder: side by side above 1023, stacked at 833. One departure — ' + b('the included list sits below the action at every stacked width') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} 700 / 76 / 520 in the 1,296 box; reason measure 620; heading 40; fade 160 at 720 wide; padding 96. ${b('834')} stacked, reason measure 620, heading 32, padding 80. ${b('≤ 767')} heading 25, ${b('field and button stacked')} ⚑, list under the action, fade 120, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Fade, plus nothing. ${code('heading')}’s limit is the one difference — ${b('60 characters here rather than 40')}, because the column takes two lines at 40 px ⚑. ${code('benefits[]')} is drawn at four in the numbered treatment.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Split (Wide left 700 · Even 636) · Action side (Right · Left) · Included list (Numbered rows · Ticks · Hide) · Action (Button · Button and email field) · Fade. Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} ${b('The reason column is authored and never queried')}, so no data state can empty it ⚑. Tiers read, not drawn; ${b('0, 1 or many tiers changes nothing here')}.`),
    K.specRow(8, 'Empty state', `No benefits → the list goes and the reason column ends at the sentence; ${b('the 700 grid column is kept')} ⚑. ${b('Both columns empty is not reachable')}: the action is the action, and the heading has a default ⚑.`),
    K.specRow(9, 'Behaviour module', `${b('At Action = Button, none; ')}${code('core')}${b(' assumed, and no-JS is pixel-identical.')} ${b('At Button and email field it declares ')}${code('member-form')} ⚑. ${b('No-JS, quoted:')} “${P.plain('member-form')}” ${P.EDITSAFE}`),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('DOM order is reason then action at both Action side values')} ⚑, which is why the stack order is fixed. The numbered list is a real ${code('<ol>')} and the mono ordinals are ${code('aria-hidden')} ⚑. The field has a real ${code('<label>')}, ${code('type="email"')} and ${code('autocomplete="email"')}.`),
    `${b('Flagged ⚑')} The 76 px gap is carried from A30·2 rather than A5·5’s 40 ⚑. A gate wider than its article is this design’s claim and is not a library rule ⚑.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   7 · Tiers
   ═══════════════════════════════════════════════════════════════════════ */
const d7 = {
  n:7, name:'Tiers', gnd:'page',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 7 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'The cut answered with prices: a short head, the period toggle, and the publication’s paid tiers as A7·1 cards side by side. The only design in A32 that repeats anything, and the only one that asks the reader to choose rather than to agree.',
    'The tiers are Ghost’s objects. The user picks how many are shown and in what order, and cannot add one, remove one or restyle one — a control here writes a single value onto the section and every card reads it.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · HEAD CENTRED · TWO TIER CARDS AT 636 EACH IN THE 1,296 BOX',
  freeCap:'DESKTOP 1440 · LIGHT · THE FREE-SIGNUP GATE · THE HAND-OFF ⚑ · 7 TIERS DRAWS 1 FADE’S STACK, BECAUSE THERE IS NOTHING TO BUY',
  mobileAltLabel:'390 · THE FREE-SIGNUP GATE · THE HAND-OFF TO 1 FADE’S STACK ⚑',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const k = (o || {}).gate || GATE.paid;
    if (k.key === 'free') {
      const hand = `<div style="width:${M(w)}px;margin:0 auto;display:flex;flex-direction:column">
        ${gateStack(t, g, w, { gate:k, measure:M(w), included:true, includedLabel:'What a membership includes' })}
        ${gap(w === 390 ? 18 : 22)}${dest(t, k)}
        ${gap(8)}${mono(g, 'HAND-OFF ⚑ · ON THE FREE-SIGNUP GATE 7 TIERS DRAWS 1 FADE’S STACK · THERE IS NOTHING TO BUY, SO THERE ARE NO CARDS · A29·5’S RULE')}</div>`;
      return K.scene(t, w, hand, { last:'para', fade:w === 390 ? 120 : 160, gate:k });
    }
    const cols = w === 390 ? 1 : 2;
    const head = `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;width:100%">
      ${K.gateHead(g, w, { gate:k, align:'center', measure:w === 390 ? 350 : 620, hSize:w === 1440 ? 34 : w === 834 ? 30 : 25 })}
      ${gap(w === 390 ? 20 : 24)}${K.periodToggle(g, { period:'monthly', pack:PK })}</div>`;
    const inner = `${head}${gap(w === 390 ? 24 : 32)}
      ${K.tierCards(t, g, { n:2, gap:w === 390 ? 16 : 20, stack:cols === 1, mark:true, markIndex:0, benN:3, period:'monthly', pad:w === 390 ? 20 : 24 })}
      ${gap(w === 390 ? 18 : 22)}
      <div style="display:flex;flex-wrap:wrap;gap:10px 20px;align-items:center;justify-content:center;text-align:center">
        ${K.signinRow(g, { pack:PK, center:true })}
        <span style="font-size:13.5px;line-height:1.55;color:${g.muted};font-family:${PK.body}">Prices in USD. You can change tier or stop at any time.</span></div>
      ${gap(14)}<div style="display:flex;justify-content:center">${dest(t, k)}</div>`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k });
  },
  stateBody(t, kind, narrow) {
    const g = K.ground(t, 'page');
    const k = GATE[kind] || GATE.paid;
    const one = kind === 'tier' || narrow;
    return `<div style="display:flex;flex-direction:column;width:100%;align-items:center;text-align:center">
      ${K.gateHead(g, narrow ? 390 : 834, { gate:k, align:'center', measure:narrow ? 340 : 520, hSize:narrow ? 22 : 26, blurb:false })}${gap(16)}
      ${K.tierCards(t, g, { n:one ? 1 : 2, from:kind === 'tier' ? 2 : 1, gap:16, benN:2, pad:18, period:'monthly' })}
      ${narrow ? `<div style="padding-top:8px">${mono(g, 'STACKED · THE MARKED TIER FIRST ⚑')}</div>` : ''}</div>`;
  },
  primaryNote:`A7·1’s tier card, carried verbatim — ${b('name, price at 38 in the heading font, one sentence, three benefits, a full-width button')} ⚑ — at 636 in the 1,296 box. ${b('The marked tier’s label is this design’s single accent use besides the button')} ⚑, and it is a 12 px label rather than a fill, because a filled ribbon on one of two cards is a decision made for the reader. ${b('Two cards is the arrangement')}: three is offered and four becomes rows ⚑, which is A30·8’s rule carried.`,
  freeNote:`${b('The free gate does not draw tiers')} ⚑ — there is nothing to buy — so at that gate this design falls through to ${b('1 Fade’s stack with the free copy')}, and the panel says so. That is A29·5’s hand-off rule, used deliberately ⚑.`,
  gatesNote:`${b('The tier gate draws one card')} ⚑ — the named tier, alone and centred at 636, with the other tiers absent rather than greyed. ${b('The upgrade gate draws the tiers above the member’s current one')} and marks the current one “Your plan” rather than “Most popular” ⚑.`,
  landNote:`${b('Two cards at the cut are the heaviest thing A32 puts under an article')} ⚑. After a heading the padding goes to 132 whatever the control says ⚑; after an image the panel recommends 1 Fade, and does not force it.`,
  statesNote:`${b('The card is not the target — its button is')} ⚑. Hovering a card raises nothing and changes nothing; the whole card is not a link, because two links to two places inside one rectangle is a card nobody can operate with a keyboard cleanly.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Tiers', n:7, count:'SIX',
    sub:'The paid tiers as cards at the cut.',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132. ' + b('Forced to Spacious after a heading') + ' ⚑.'),
      K.sel('Tiers shown', 'The two lowest paid', 'The lowest paid · The two lowest paid · All paid tiers · All, including free. ' + b('The user cannot add or remove a tier') + ' ⚑ — tiers are Ghost objects and are edited in Ghost. ' + b('Four or more draws rows, never a 4-up') + ' ⚑.'),
      K.sel('Order', 'Price, low to high', 'Ghost’s own order · Price, low to high · Price, high to low. ' + b('Order is chosen from a closed list, never dragged') + ' ⚑ — the section cannot store a per-tier position.'),
      K.seg('Period', ['Toggle', 'Monthly only', 'Yearly only'], 0, 'Toggle draws A30·8’s two named cells at 44 px. ' + b('Never a switch') + ' ⚑ — a switch does not say what its two states are.'),
      K.seg('Benefits per card', ['None', 'Three', 'All'], 1, b('Three is what the card was drawn for') + '. At All a tier with nine benefits makes a card twice its neighbour’s height, and the row is top-aligned ⚑.'),
      K.seg('Mark a tier', ['None', 'Most popular'], 1, b('The label is a 12 px accent word, not a fill or a ribbon') + ' ⚑. On the upgrade gate it is replaced by “Your plan” on the member’s current tier ⚑.')
    ],
    settles:[
      `${b('No Add tier and no Remove tier')} ⚑ — and no per-card control of any kind. ${b('A control here writes one value onto the section and every card reads it')}; per-item styling is not expressible, which is why Mark a tier picks a rule (“the most expensive”) rather than a card.`,
      `${b('Order is a closed list, not a drag handle')} ⚑. Dragging implies a stored position per tier, and the tier is Ghost’s object — a tier added in Ghost tomorrow would have no position and would land nowhere.`,
      `${b('The period toggle is two named cells, and it is the reason this design declares a module')} ⚑. Everything else in A32 is server-rendered HTML.`
    ]
  },
  respCap:'TABLET 834 · TWO CARDS AT 367 · MOBILE 390 · CARDS STACK, MARKED TIER FIRST',
  tabletLabel:'834 · two cards at 367 · head 30 · toggle centred',
  mobileLabel:'390 · cards stacked · marked tier first ⚑ · buttons full width',
  respNote:`Grid-of-N’s ladder: ${b('2-up above 767, stacked below')} ⚑. ${b('At ≤ 767 the marked tier is drawn first')} whatever Order says ⚑ — a reader who scrolls past one card to reach the recommended one has been shown the wrong card first, and this is the one place order is overruled. ${b('The toggle stays centred and stays 44 px')} at every width. ${b('At All paid tiers with four or more, the 834 frame is already rows')}, not cards ⚑.`,
  darkNote:`A27’s step, and ${b('Card depth is forced to Flat')} ⚑ — the ${code('#332E27')} hairline carries both cards. ${b('The marked tier’s accent label re-checks at 4.9:1')} on the dark surface ⚑ and stays. ${b('The toggle’s active cell is the surface colour on the plate colour')}, which is one step in both modes and needs no accent ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'A short centred head, the monthly-yearly toggle, and the publication’s paid tiers as A7·1 cards side by side at the cut. The only A32 design that repeats an item.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · few · none · tier cards at the cut')}<br><span style="color:#6B6459">Item-count ${code('few')} — two to four tiers. ${b('Containment ')}${code('none')} ⚑: the cards are the ${b('items’')} geometry, not the section’s — A21·2’s rule, and the slot most easily got wrong.</span>`),
    K.specRow(3, 'Archetype', 'grid-of-N. Its ladder: 2-up above 767, stacked below. One departure — ' + b('the marked tier is drawn first when stacked') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} two cards at 636 in the 1,296 box, head 34 centred, toggle 44, padding 96. ${b('834')} two cards at 367, head 30. ${b('≤ 767')} cards stacked full width, ${b('marked tier first')} ⚑, head 25, buttons full width, fade 120, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Fade, plus ${code('periodLabels')} (2 × 12 ch, defaults “Monthly” · “Yearly”) and ${code('tierNote')} (opt 90 ch — the price and cancellation line under the cards). ${code('benefits[]')} is ${b('stored and not drawn')} ⚑: the benefits on the cards are the tiers’ own, from Ghost.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Tiers shown (The lowest paid · The two lowest paid · All paid tiers · All, including free) · Order (Ghost’s own · Price, low to high · Price, high to low) · Period (Toggle · Monthly only · Yearly only) · Benefits per card (None · Three · All) · Mark a tier (None · Most popular). Then the shared source group.'),
    K.specRow(7, 'Data', `${code(K.hb('#get "tiers"'))} filtered to paid, plus ${code('post.visibility')} and ${code('@member')}. ${b('0 paid tiers')} → ${b('the design hands off to 1 Fade with the free copy')} ⚑ and the editor says so. ${b('1')} → one card centred at 636, and Mark a tier is greyed ⚑. ${b('2–3')} → as drawn. ${b('4+')} → A7·3’s tier rows, never a 4-up ⚑. ${b('A tier with no description')} → the card closes up and reserves nothing ⚑. ${b('A tier with no benefits')} → name, price, button. ${CUTROW}`),
    K.specRow(8, 'Empty state', `No heading → the tiers carry the section and the toggle rises 12 px. ${b('No paid tier is the empty state that matters')} ⚑, and it is a hand-off rather than a message. ${b('Prices are never invented')}: a tier with no yearly price disables the Yearly cell with the reason shown ⚑.`),
    K.specRow(9, 'Behaviour module', `${b(code('price-toggle'))}${b('.')} ${P.EDITSAFE} ${b('No-JS, quoted:')} “${P.plain('price-toggle')}”`),
    K.specRow(10, 'Accessibility notes', `${A11Y} ${b('The toggle is two radio inputs with a visible group label')} ⚑, not a switch and not two buttons. Each card is a ${code('<li>')} with the tier name as an ${code('h3')}; ${b('the card is not a link')} ⚑ and only its button is a target. “Most popular” is real text inside the card’s heading area, not a ${code('::before')} ⚑.`),
    `${b('Flagged ⚑')} The four-tier row rule is carried from A30·8 ⚑. “Your plan” on the upgrade gate is invented here ⚑. Whether a tier’s benefit list is exposed to themes in the shape this card draws is A30’s open finding, restated ⚑ — if it is not, Benefits per card becomes a no-op and the card is name, price, description, button.`
  ]]
};

/* ═══════════════════════════════════════════════════════════════════════
   8 · Ledger
   ═══════════════════════════════════════════════════════════════════════ */
const FREE_ROWS = [
  ['The Friday letter', 'Every Friday, to anyone with an account'],
  ['Two open pieces a month', 'Chosen by the desk, and open to everyone']
];
const d8 = {
  n:8, name:'Ledger', gnd:'page',
  rail:'A32 PAYWALL / CONTENT CTA · DESIGN 8 OF 12 · PAPER PACK · SIX CONTROLS + THE ACCESS SOURCE',
  paras:[
    'What a membership includes, enumerated: six ruled rows across the content box, each a mono ordinal, a name and one line of detail, with the heading above them and the action at the foot.',
    'It is the design that argues by listing rather than by asserting, and the only A32 design whose item count is many. The rows are authored, not queried — which is what separates it from 7 Tiers.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THE PAID GATE · SIX RULED ROWS ACROSS THE 1,296 BOX · ORDINALS IN MONO',
  rows(t, g, w, o) {
    o = o || {};
    const dens = o.dens || (w === 390 ? 13 : 16);
    const stack = w === 390;
    const src = o.list || K.LEDGER;
    return `<div style="display:flex;flex-direction:column;width:100%">${
      src.slice(0, o.n || 6).map(([name, detail], i) => `<div style="display:flex;align-items:${stack ? 'flex-start' : 'baseline'};gap:${stack ? 12 : 20}px;padding:${dens}px 0;border-top:1px solid ${g.border};${stack ? 'flex-wrap:wrap;' : ''}">
        ${o.ordinals === false ? '' : `<span style="font-family:${MONO};font-size:11px;color:${g.muted};width:22px;flex-shrink:0">${String(i + 1).padStart(2, '0')}</span>`}
        <span style="font-size:${w === 390 ? 16 : 17}px;line-height:1.45;color:${g.text};font-family:${PK.body};${stack ? 'flex:1;min-width:0;' : `width:${w === 1440 ? 460 : 330}px;flex-shrink:0;`}text-wrap:pretty">${name}</span>
        ${o.detail === false ? '' : `<span style="font-size:14px;line-height:1.5;color:${g.muted};font-family:${PK.body};${stack ? 'width:100%;padding-left:34px;' : 'flex:1;min-width:0;'}text-wrap:pretty">${detail}</span>`}</div>`).join('')}
      <div style="height:1px;background:${g.border}"></div></div>`;
  },
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const k = (o || {}).gate || GATE.paid;
    const head = w === 1440
      ? `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:40px">
          <div style="width:700px">${K.gateHead(g, w, { gate:k, measure:640, hSize:34 })}</div>
          <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">${K.action(t, g, w, { gate:k })}</div></div>`
      : `<div>${K.gateHead(g, w, { gate:k, measure:w === 834 ? 620 : 350, hSize:w === 834 ? 30 : 25 })}</div>`;
    const foot = w === 1440 ? `${gap(18)}${dest(t, k)}`
      : `${gap(w === 390 ? 22 : 26)}${K.action(t, g, w, { gate:k })}${gap(16)}${dest(t, k)}`;
    const free = k.key === 'free';
    const inner = `${head}${gap(w === 390 ? 22 : 30)}${this.rows(t, g, w, free ? { list:FREE_ROWS, n:2 } : {})}${
      free ? `${gap(10)}${mono(g, 'THE FREE PLAN INCLUDES TWO THINGS, SO THE LEDGER IS TWO ROWS ⚑ · THE COUNT IS DATA, NOT A CONTROL')}` : ''}${foot}`;
    return K.scene(t, w, inner, { last:'para', fade:w === 390 ? 120 : 160, gate:k });
  },
  stateBody(t, kind, narrow) {
    const g = K.ground(t, 'page');
    const k = GATE[kind] || GATE.paid;
    const w = narrow ? 390 : 834;
    return `<div style="display:flex;flex-direction:column;width:100%">${K.gateHead(g, w, { gate:k, measure:narrow ? 340 : 540, hSize:narrow ? 22 : 26, blurb:false })}
      ${gap(16)}${this.rows(t, g, w, { n:3, dens:12 })}${gap(16)}${K.action(t, g, w, { gate:k, row:true })}</div>`;
  },
  primaryNote:`A9·15’s ledger row, carried: ${b('a mono ordinal in a 22 px column, a name, one muted line of detail, a hairline above each and one below the last')} ⚑. ${b('The action sits beside the heading rather than under the rows')} at 1440 — six rows plus a button under them is a 620 px column that ends in a decision the reader has already scrolled past ⚑. ${b('The rows are authored')}: this is a list of what a membership includes, not a list of tiers, and that is what makes item-count ${code('many')} true here and ${code('few')} true in 7.`,
  freeNote:`${b('The free gate draws two rows, not six')} ⚑ — “The Friday letter” and “Two open pieces a month” — because the free plan includes two things and a six-row ledger for a free signup is a promise the publication has not made. ${b('The count is data, not a control')}.`,
  gatesNote:`${b('The upgrade gate marks the rows the member already has')} ⚑ — their ordinals go to the muted token and the row keeps its full text, ${b('never struck through and never dimmed')} ⚑. Struck text on a list of things somebody is paying for reads as a cancellation.`,
  landNote:`${b('Six hairlines under a photograph is seven horizontals')} ⚑, and the panel names it. ${b('After an image the design forces Detail line = Show')}, so the rows are 56 px tall rather than 40 and the rhythm reads as prose rather than as a table ⚑.`,
  statesNote:`${b('No row is a link and no row is a target')} ⚑ — the ledger is prose in a grid, and the only interactive things in the section are the button and the sign-in line.`,
  extraTile:SETTLE_GATES,
  controls:{
    name:'Ledger', n:8, count:'SIX',
    sub:'What is included, as ruled rows.',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132. 80 at 834, 64 at 390.'),
      K.seg('Row density', ['Compact', 'Comfortable', 'Spacious'], 1, '12 · 16 · 20 above and below each row. ' + b('The hairline weight never changes with it') + ' ⚑.'),
      K.seg('Detail line', ['Show', 'Hide'], 0, 'The muted second column. ' + b('At Hide the rows are 40 px tall and the design reads as an index') + '; at Show they are 56 and it reads as prose ⚑.'),
      K.seg('Ordinals', ['Mono numerals', 'None'], 0, '01–06 in a 22 px column. ' + b('Never accent, never the heading font') + ' ⚑.'),
      K.seg('Action position', ['Beside the heading', 'Under the rows'], 0, b('Beside is the default above 1023 and the only value below it') + ' ⚑ — under 700 px of rows there is nothing to sit beside.'),
      K.sel('Rows shown', 'All authored', 'Four · Six · All authored. ' + b('A cap, not a source') + ' — the rows are the section’s own ' + code('benefits[]') + ' and the user adds and removes them there ⚑.')
    ],
    settles:[
      `${b('The rows are authored, so this is the one A32 design with a real repeater')} ⚑ — Add and Remove are legitimate here, where they are refused in 7 Tiers, because these rows are the user’s text and those cards are Ghost’s objects.`,
      `${b('Detail line is the control that decides what the design is.')} At Hide it is an index; at Show it is an argument ⚑. Both are drawn, and the panel says which suits four rows and which suits six.`,
      `${b('No hairline-weight and no ordinal-colour value')} ⚑. One border token, one muted token; a ledger whose rules are heavier than the page’s other rules is a table pretending to be a list.`
    ]
  },
  respCap:'TABLET 834 · ROWS HOLD, ACTION MOVES UNDER THEM · MOBILE 390 · THE DETAIL WRAPS BENEATH THE NAME',
  tabletLabel:'834 · rows 330 / flexible · action under the rows · head 30',
  mobileLabel:'390 · ordinal and name on one line, detail beneath at a 34 px indent',
  respNote:`${b('At 1023 the action leaves the heading’s side and goes under the rows')} ⚑ — its stated destination. ${b('At ≤ 767 each row becomes two lines')}: ordinal and name, then the detail indented 34 px to clear the ordinal column ⚑, so the ordinals still form a column and the rows still scan. ${b('Row density holds its value at every width')} and the rows grow taller rather than tighter, which is the opposite of the usual instinct and is deliberate ⚑.`,
  darkNote:`A27’s step. ${b('Six hairlines at ')}${code('#332E27')}${b(' on ')}${code('#171511')} ⚑ — checked, because a ledger is the arrangement where a hairline tuned for light disappears in dark. ${b('The mono ordinals go to ')}${code('#A79E8F')} and the detail column with them; ${b('the name column stays at the text token')}, so the two-tone reading survives the mode ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'What a membership includes as six ruled rows across the content box — mono ordinal, name, one line of detail — with the heading and the action above them. Argument by enumeration.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · page · many · none · what is included as ruled rows')}<br><span style="color:#6B6459">Item-count ${code('many')} — five or more, and the rows are ${b('authored')}, which is what separates this from 7 Tiers’ ${code('few')} queried cards ⚑. Containment ${code('none')}: hairlines are not a box.</span>`),
    K.specRow(3, 'Archetype', 'stack. One departure: ' + b('the action moves from beside the heading to under the rows at 1023') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} rows across 1,296 at 460 / flexible, ordinals 22, action beside the heading, padding 96. ${b('834')} rows at 330 / flexible, ${b('action under the rows')} ⚑, head 30. ${b('≤ 767')} ${b('each row is two lines')} — ordinal and name, detail indented 34 ⚑ — action under the rows, fade 120, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Fade, and ${code('benefits[]')} is the field this design is built on: ${b('0–6 items of name 60 ch and detail 90 ch')}, and ${b('the detail is drawn only here')} ⚑ — the other eleven store it. ${code('benefitsLabel')} is stored and not drawn ⚑; the heading is the label.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Row density (Compact 12 · Comfortable 16 · Spacious 20) · Detail line (Show · Hide) · Ordinals (Mono numerals · None) · Action position (Beside the heading · Under the rows) · Rows shown (Four · Six · All authored). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Fade. ${CUTROW} ${b('The rows are authored, not queried')} ⚑. ${b('0 rows')} → the design hands off to 1 Fade and the editor says so ⚑. ${b('1')} → one row between two hairlines, which is drawn and is coherent. ${b('7+')} → the cap in Rows shown applies and nothing is truncated mid-row ⚑. ${b('A row with no detail')} → the row closes up to 40 px and its neighbours do not ⚑.`),
    K.specRow(8, 'Empty state', `No benefits → hand-off to 1 Fade. No detail on any row → Detail line resolves to Hide and the design is an index ⚑. No heading → the rows carry the section and the action stays beside where the heading was, never centred ⚑.`),
    K.specRow(9, 'Behaviour module', P.NONE),
    K.specRow(10, 'Accessibility notes', `${A11Y} The rows are an ${code('<ol>')} and the mono ordinals are ${code('aria-hidden')} ⚑ — the ordinal is the list’s, not the content’s. ${b('The detail is in the same ')}${code('<li>')}${b(' as its name')}, not a ${code('<dd>')}: it is a clause, not a definition ⚑. No row is focusable.`),
    `${b('Flagged ⚑')} The six fixture rows are invented content ⚑. Marking rows the member already has, on the upgrade gate, is invented and assumes the theme can compare a tier’s benefits to the member’s — ${b('the same open finding as 7 Tiers')} ⚑.`
  ]]
};

globalThis.A32D = (globalThis.A32D || []).concat([d5, d6, d7, d8]);
})();
