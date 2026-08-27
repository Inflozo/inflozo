// A30 designs 9–13 · Big Type · Boxed · Rail · Ledger · Steps
(function () {
const K = globalThis.A30LIB, P = globalThis.A30PAGE, X = globalThis.A30X;
const { L, D, MONO, b, code, tile, PACKS, COPY, BENEFITS, TIERS, MEMBER } = K;
const PK = PACKS.paper;
const { mono, hair, onGround, pageHead, stateBody, accountBlock } = X;

const MEMBERFORM = `${b('member-form')}. ${P.MODLINE} ${b('No-JS, quoted:')} “${P.plain('member-form')}”`;
const PORTALROW = `${b('Portal is the boundary')} ⚑ — Change email, Change plan, Billing and Manage newsletters each open Ghost’s Portal over the page. ${b('Nothing behind those buttons is themed')}, and no control moves the line.`;
const SETTLE_STATES = {
  label: 'WHAT THE SEVEN STATES SETTLE FOR THE WHOLE CATEGORY',
  body: [
    `${b('Sign-in is the signup page with one field and no tiers')} ⚑ — same measure, same button, same note.`,
    `${b('Sent replaces the field; it never disables it.')} The address is echoed so a mistyped one is visible ⚑. ${b('Expired is read from the query string')} and is therefore JS-only ⚑; without JavaScript the plain form is the recovery.`,
    `${b('A signed-in member never sees a signup form')} ⚑ — the route draws the membership summary and two actions instead.`
  ]
};

/* A9·15’s ledger row, carried: mono ordinal, name, one line. */
const ledgerRow = (g, o) => `<div style="display:flex;align-items:${o.align || 'baseline'};gap:${o.gap || 24}px;padding:${o.dens}px 0;border-top:1px solid ${g.border}">
    ${o.n === false ? '' : `<span style="font-family:${MONO};font-size:11px;color:${g.muted};width:26px;flex-shrink:0">${o.n}</span>`}
    <span style="font-size:${o.fs || 17}px;font-weight:500;color:${g.text};font-family:${PK.body};${o.nameW ? `width:${o.nameW}px;flex-shrink:0;` : 'flex:1;min-width:0;'}">${o.name}</span>
    ${o.text ? `<span style="font-size:14px;line-height:1.55;color:${g.muted};font-family:${PK.body};flex:1;min-width:0;text-wrap:pretty">${o.text}</span>` : ''}
    ${o.right || ''}</div>`;

/* The rail: a 240 column of labels with the current one marked. */
const railList = (g, items, active, o) => {
  o = o || {};
  return `<div style="display:flex;flex-direction:column;${o.row ? 'flex-direction:row;gap:6px;flex-wrap:wrap;' : ''}">${items.map((it, i) => {
    const on = i === active;
    return `<div style="min-height:44px;display:flex;align-items:center;gap:10px;padding:0 12px;box-sizing:border-box;${on ? `box-shadow:inset 2px 0 0 ${g.btnBg};` : ''}${o.row ? `border:1px solid ${on ? g.text : g.border};border-radius:${g.r}px;box-shadow:none;` : ''}">
      <span style="font-size:15px;font-weight:${on ? 600 : 400};color:${on ? g.text : g.muted};font-family:${PK.body};white-space:nowrap">${it.label}</span>
      ${it.tag ? `<span style="font-family:${MONO};font-size:9.5px;color:${g.muted};margin-left:auto">${it.tag}</span>` : ''}</div>`;
  }).join('')}</div>`;
};
const RAIL_ACCOUNT = [
  { label:'Membership' }, { label:'Newsletters', tag:'PORTAL ↗' }, { label:'Billing', tag:'PORTAL ↗' }, { label:'Sign out' }
];

// ═══════════════════════════════════════════════════════════════════════
// 9 · Big Type
// ═══════════════════════════════════════════════════════════════════════
const d9 = {
  n: 9, name: 'Big Type',
  rail: 'A30 MEMBERS PAGES · DESIGN 9 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'One sentence at 96 px and a field under it. The page’s display moment is the promise, and everything else on it is small.',
    'On the account route the display moment moves to the member’s own name, which is the one thing on that page a reader came to see.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · HEADING 96 ON A 1,000 MEASURE · INLINE FIELD ROW AT 560',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const role = (o || {}).role;
    const hs = w === 1440 ? 96 : w === 834 ? 60 : 40;
    if (role === 'account') {
      const inner = `<div style="display:flex;flex-direction:column">
        ${K.eyebrow(g, 'Your membership', PK)}${K.gap(16)}
        <div style="display:flex;align-items:${w === 390 ? 'flex-start' : 'baseline'};gap:${w === 390 ? 12 : 20}px;flex-direction:${w === 390 ? 'column' : 'row'};flex-wrap:wrap">
          <h1 style="margin:0;font-family:${PK.head};font-size:${w === 1440 ? 72 : w === 834 ? 52 : 34}px;font-weight:700;line-height:1.02;letter-spacing:-0.04em;color:${g.text}">${MEMBER.name}</h1>
          ${K.statusBadge(g, { status:'paid', pack:PK })}</div>
        ${K.gap(w === 390 ? 22 : 30)}
        <div style="width:${w === 1440 ? 900 : w === 834 ? 640 : 350}px">
          ${K.accountRows(g, { status:'paid', labW:w === 1440 ? 200 : (w === 390 ? 0 : 150), layout:w === 390 ? 'stack' : undefined, dens:w === 390 ? 14 : 18 })}
          ${K.gap(26)}${K.signOutRow(g, {})}${K.gap(6)}${K.portalNote(g, { max:600 })}</div></div>`;
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    const inner = `<div style="display:flex;flex-direction:column">
      ${K.eyebrow(g, COPY.eyebrow, PK)}${K.gap(w === 390 ? 16 : 22)}
      <h1 style="margin:0;font-family:${PK.head};font-size:${hs}px;font-weight:700;line-height:${hs >= 76 ? 0.98 : 1.06};letter-spacing:-0.04em;color:${g.text};max-width:${w === 1440 ? 1000 : w === 834 ? 700 : 350}px;text-wrap:pretty">Read Orbit Weekly in full</h1>
      ${K.gap(w === 390 ? 24 : 34)}
      <div style="width:${w === 390 ? '100%' : '560px'}">${K.formBlock(t, g, { state:'typed', full:true, inline:w !== 390, legalMax:560 })}</div>
      ${K.gap(w === 390 ? 22 : 28)}${hair(g)}${K.gap(18)}
      <div style="max-width:${w === 1440 ? 820 : w === 834 ? 640 : 350}px">${K.blurb(g, COPY.blurb, w === 1440 ? 820 : w === 834 ? 640 : 350, PK, w === 390 ? 16 : 17)}</div></div>`;
    return P.stdWrap(t, w, inner, { role:'signup' });
  },
  primaryNote: `A4·6’s display ladder, carried: ${b('76 · 96 · 132 at 1440, 60 at 834, 40 at 390')} ⚑, the heading font at −0.04em on a 1,000 measure so the line breaks where the sentence does. ${b('The blurb moves below the field and below a hairline')} ⚑ — at 96 px the heading is the argument, and a paragraph between it and the field would be read by nobody. ${b('The field row is inline')}: 46 px field, 46 px button, 10 px apart.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE MEMBER’S NAME AT 72 · ROWS ON A 900 COLUMN',
  accountNote: `${b('The display moment moves rather than disappearing')} ⚑ — the member’s name at 72 px with the status badge on its baseline. ${b('72 and not 96')}: a name is a proper noun and a long one at 96 px wraps to three lines ⚑. The rows take a 200 px label column on 900. ${PORTALROW}`,
  accountStatesNote: `${b('The name is the same size for every member type')} ⚑ — it is not scaled by how much the member pays. Free drops the price and renewal rows, comped drops billing, cancelled reads “Ends”.`,
  statesNote: `${b('The states are the inline row’s')} ⚑ and the heading never changes. ${b('Sent and expired become full-width panels under the heading')} rather than 560 ones, because a panel narrower than the sentence above it looks like a mistake at this scale.`,
  extraTile: SETTLE_STATES,
  stateForm(t, s) { return stateBody(t, s, { ground:'page' }); },
  controls: {
    name: 'Big Type', n: 9, count: 'SIX',
    sub: 'One sentence at display size, a field beneath.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132. 80 at 834, 64 at 390.'),
      K.seg('Heading size', ['Large 76', 'Display 96', 'Huge 132'], 1, 'At 1440. ' + b('60 at 834 and 40 at 390 whatever this says') + ' ⚑ — a 132 px heading on a phone is four words a line.'),
      K.seg('Alignment', ['Left', 'Centred'], 0, 'Left is flush with the content box; Centred puts the heading and the field row on one axis and holds the measure at 900.'),
      K.seg('Form', ['Inline row', 'Stacked'], 0, 'Inline is field and button side by side at 560. ' + b('Stacked below 767 whatever this says') + ' ⚑.'),
      K.seg('Blurb', ['Below the field', 'Hide'], 0, 'Under a hairline at 17 px. ' + b('Never above the field in this design') + ' ⚑.'),
      K.seg('Sign-in link', ['Show', 'Hide'], 0, '“Already a member? Sign in”, 14 px under the field row.')
    ],
    settles: [
      `${b('Heading size is the only type control in A30')} ⚑ and it exists here because the heading is the design. Everywhere else the ladder is fixed, which is what keeps thirteen designs looking like one library.`,
      `${b('No included list.')} At this scale a tick list under a 96 px sentence competes with it ⚑; the blurb is the one supporting line, and 12 Ledger is the design for a publication that wants the list to be the page.`,
      `${b('The heading is authored, and it is capped at 60 characters')} ⚑ — not truncated at render, ${b('capped in the editor')}, because a 90-character sentence at 96 px is four lines and the field falls below the fold. The panel says so at the field.`
    ]
  },
  respCap: 'TABLET 834 · HEADING 60 · MOBILE 390 · HEADING 40, FORM STACKS, BLURB HELD',
  tabletLabel: '834 · heading 60 · measure 700 · inline row 520',
  mobileLabel: '390 · heading 40 · form stacked · blurb 16',
  mobileAccountLabel: '390 · /account/ · NAME 34 · BADGE BELOW IT · ROWS STACKED',
  respNote: `Stack’s ladder with the display ladder over it. ${b('The heading steps 96 → 60 → 40')} and its measure 1,000 → 700 → 350; ${b('the inline field row becomes stacked at ≤ 767')} ⚑, which is this design’s one departure and the reason the button is full width there. ${b('On /account/ the name steps 72 → 52 → 34 and the badge drops below it at 390')} ⚑ rather than shrinking.`,
  darkNote: `A27’s step, and ${b('the heading is the one element that needed checking at scale')} ⚑: ${code('#F2EDE4')} on ${code('#171511')} measures 14.8:1, and at 96 px the type reads heavier in dark than in light, so ${b('the weight stays at 700 rather than stepping to 600')} — a judgement, and the only one in the category that is about optics rather than contrast ⚑.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'One authored sentence at 96 px with an inline field row beneath it and the blurb under a hairline. On /account/ the same treatment applied to the member’s own name at 72 px.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · page · none · none · the promise at display size')}<br><span style="color:#6B6459">Archetype ${code('stack')} rather than ${code('form')} — the sentence is the design and the field is under it, which is a stack of two blocks rather than a form with a head. Ground ${code('page')}, containment ${code('none')}.</span>`),
    K.specRow(3, 'Archetype', 'stack. One departure: ' + b('the inline field row becomes stacked at ≤ 767') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} heading 96 on a 1,000 measure, inline row 560, blurb 820, padding 96; account name 72 on a 900 column. ${b('834')} heading 60 on 700, row 520, padding 80; name 52. ${b('≤ 767')} heading 40 on 350, ${b('form stacked')}, blurb 16, padding 64; name 34 with the badge below it ⚑.`),
    K.specRow(5, 'Content fields', `As 1 Centred, with ${code('heading')} ${b('capped at 60 characters rather than 60 as a limit')} ⚑ — the editor enforces it. ${code('benefits[]')} is ${b('stored and not drawn')} ⚑, so a switch to any other design keeps the list.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Heading size (Large 76 · Display 96 · Huge 132) · Alignment (Left · Centred) · Form (Inline row · Stacked) · Blurb (Below the field · Hide) · Sign-in link (Show · Hide). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred; tiers read and not drawn. ${b('The account name is Ghost’s')} — ${code('@member.name')} — and ${b('a member with no name gets their email at 72 px')} ⚑, which is drawn in the stress frame because it is the state that breaks this design.`),
    K.specRow(8, 'Empty state', `No heading → the site title with “membership” appended at the same size ⚑. No blurb → the hairline goes with it. ${b('No benefits are drawn, so there is no benefits empty state here')} ⚑.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM),
    K.specRow(10, 'Accessibility notes', `The sentence is the page’s ${code('h1')} ⚑. ${b('At 96 px the label above the field is still 13 px')} — the type ladder is not scaled by the heading control ⚑, because a 20 px field label reads as a heading itself. Inline row keeps ${code('<label>')} above the field and the button after it in document order. Focus ring 2 px accent at a 4 px offset; ${b('at 40 px and below the heading is not a focus target')} and never receives one.`),
    `${b('Flagged ⚑')} The 60-character cap is invented ⚑. The 72 px account name and the “not scaled by what the member pays” rule are both this design’s own ⚑. The dark-mode weight judgement is a call, not a measurement ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 10 · Boxed
// ═══════════════════════════════════════════════════════════════════════
const d10 = {
  n: 10, name: 'Boxed',
  rail: 'A30 MEMBERS PAGES · DESIGN 10 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The page inside one hairline box on the page ground: no fill, no shadow, the pack’s radius, and an internal rule between the head and the form. The quietest containment in the category.',
    'It is the design for a publication whose pages are ruled rather than raised, and the one whose zero-content state still looks finished — an empty box is a frame, not a hole.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · BOX 720 CENTRED · HAIRLINE ONLY · NO FILL, NO SHADOW',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const role = (o || {}).role;
    const bw = role === 'account' ? (w === 1440 ? 880 : w === 834 ? 674 : 350) : (w === 1440 ? 720 : w === 834 ? 600 : 350);
    const pad = w === 390 ? 20 : 40;
    const box = inner => `<div style="width:${bw}px;margin:0 auto;border:1px solid ${g.border};border-radius:${g.r}px;box-sizing:border-box">${inner}</div>`;
    if (role === 'account') {
      const inner = box(`<div style="padding:${pad}px ${pad}px ${pad - 8}px">${K.accountHead(g, { status:'paid', nameSize:w === 390 ? 22 : 26 })}</div>
        <div style="padding:0 ${pad}px">${K.accountRows(g, { status:'paid', labW:w === 1440 ? 168 : (w === 390 ? 0 : 140), layout:w === 390 ? 'stack' : undefined, dens:w === 390 ? 14 : 16 })}</div>
        <div style="padding:${pad - 12}px ${pad}px ${pad}px;border-top:1px solid ${g.border};margin-top:${pad - 14}px;display:flex;flex-direction:column;gap:8px">${K.signOutRow(g, {})}${K.portalNote(g, { max:520, pt:0 })}</div>`);
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    const inner = box(`<div style="padding:${pad}px;display:flex;flex-direction:column;align-items:center;text-align:center">
        ${pageHead(g, w, { align:'center', measure:Math.min(bw - pad * 2, 520), max:bw - pad * 2, hSize:w === 390 ? 26 : 34 })}</div>
      <div style="border-top:1px solid ${g.border};padding:${pad}px;display:flex;justify-content:center">
        <div style="width:${w === 390 ? '100%' : '420px'}">${K.formBlock(t, g, { state:'typed', full:true, center:w !== 390, legalMax:420 })}</div></div>
      <div style="border-top:1px solid ${g.border};padding:${w === 390 ? 20 : 26}px ${pad}px">${K.benefitList(g, { n:4, gap:10, fs:14, tone:'muted', pack:PK, label:'Included' })}</div>`);
    return P.stdWrap(t, w, inner, { role:'signup' });
  },
  primaryNote: `${b('A hairline box is a containment; a fill or a shadow would make it a card')} ⚑ — 3 Card is that design, and the tuple’s containment slot is what separates them. ${b('The internal rules are the same hairline as the box')}, which is what makes three stacked compartments read as one object: head, form, included. ${b('Nothing inside the box has a border of its own except the field')} ⚑.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · BOX 880 · ROWS INSIDE, SIGN-OUT IN ITS OWN COMPARTMENT',
  accountNote: `The box widens to 880 and its compartments become head, rows, and sign-out. ${b('The row hairlines and the box hairline are the same token')} ⚑, so the rows read as the box’s own divisions rather than as a table dropped into it. ${PORTALROW}`,
  accountStatesNote: `${b('This is the design whose thin state looks finished')} ⚑ — a free member’s box has four rows and three compartments, and the box’s own edge is what makes it a composition rather than a fragment. That is the reason to draw one at all.`,
  statesNote: `${b('The box holds; its middle compartment changes')} ⚑. The sent and expired panels are drawn ${b('without their own border')} inside it — the compartment is already bounded ⚑ — and the plate colour alone carries them, which is the same rule 3 Card follows for the opposite reason.`,
  extraTile: SETTLE_STATES,
  stateForm(t, s) { return stateBody(t, s, { ground:'page' }); },
  controls: {
    name: 'Boxed', n: 10, count: 'SIX',
    sub: 'The page in one hairline box.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'The page’s padding around the box: 64 · 96 · 132. The box’s own is 40, 20 at 390 ⚑.'),
      K.sel('Box width', 'Held 720', 'Held 720 · Wide 960 · Content box 1,296. The account box is this value + 160, capped at the content box ⚑.'),
      K.seg('Internal rules', ['Show', 'Hide'], 0, 'The hairlines between head, form and included. ' + b('At Hide the compartments become one padded block') + ' and the gaps grow from 0 to 28.'),
      K.seg('Included list', ['Third compartment', 'Hide'], 0, 'Four lines at 14 px muted under the form. ' + b('Never above the form') + ' ⚑ — the box’s reading order is why the page exists, then the field, then the detail.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name. Email only by default ⚑.'),
      K.seg('Sign-in link', ['Show', 'Hide'], 0, 'Inside the form compartment, under the button.')
    ],
    settles: [
      `${b('No fill value and no depth value')} ⚑. Both exist in 3 Card, and a Boxed with a fill is a Card — two designs that differ by one control value are one design.`,
      `${b('No radius control')}, here or anywhere: the box takes the pack’s radius token, which is how the same box reads as sharp in Studio at 2 and soft in Garden at 20 ⚑.`,
      `${b('Internal rules is the design’s only real decision.')} With them the box is a form; without them it is a panel with a border ⚑ — and the panel names 4 Panel as the design for that.`
    ]
  },
  respCap: 'TABLET 834 · BOX 600 · MOBILE 390 · BOX 350, PADDING 20, RULES HELD',
  tabletLabel: '834 · box 600 · inner 40 · heading 34',
  mobileLabel: '390 · box 350 · inner 20 · heading 26',
  mobileAccountLabel: '390 · /account/ · THE BOX HOLDS STACKED ROWS · SIGN-OUT COMPARTMENT KEPT',
  respNote: `Form’s ladder inside a fixed containment, as 3 Card. ${b('The box never goes edge-to-edge')} ⚑: at 390 it is 350 inside the 20 px margins with its radius and hairline intact, and ${b('its inner padding matches the page margin at 20')} so the field’s left edge sits where the page’s does. ${b('The internal rules are kept at every width')} ⚑ — they are the arrangement, not decoration.`,
  darkNote: `A27’s step, and ${b('this is the design dark mode treats most simply')} ⚑ — there is no plane to lift and no shadow to drop, so the box is one token change: ${code('#EBE5DB')} to ${code('#332E27')}. ${b('The field is the only element that lifts')}, to ${code('#211D17')}, which is what stops the box reading as an empty rectangle.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The whole page inside one hairline box at the pack radius with internal rules dividing head, form and included list. No fill, no shadow — the quietest containment in the category.'),
    K.specRow(2, 'Structural descriptor', `${code('form · box · page · none · none · one hairline box on the ground')}<br><span style="color:#6B6459">Containment ${code('box')} — a hairline-bounded section, against 3 Card’s raised ${code('card')} and 4 Panel’s ${code('surface')} ground. The three are the same components in three containments, and this slot is what says so ⚑.</span>`),
    K.specRow(3, 'Archetype', 'form. One departure: ' + b('the box does not go edge-to-edge at any width') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} box 720 centred, inner 40, heading 34, form 420, account box 880. ${b('834')} box 600, account 674. ${b('≤ 767')} box 350, inner 20, heading 26, form full width, account rows stacked, rules kept ⚑.`),
    K.specRow(5, 'Content fields', `As 1 Centred. ${code('benefitsLabel')} defaults to “Included” here rather than “What a membership includes” ⚑ — the compartment is short and the longer label wraps.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Box width (Held 720 · Wide 960 · Content box 1,296) · Internal rules (Show · Hide) · Included list (Third compartment · Hide) · Fields · Sign-in link. Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred; tiers read and not drawn. ${b('At every member type the box keeps its width and loses compartments')} ⚑, never height alone.`),
    K.specRow(8, 'Empty state', `No benefits → the third compartment and its rule go. No blurb → the head compartment is eyebrow and heading. ${b('The box with only a form in it is still a composition')} ⚑ — the reason this design and 4 Panel are the two whose zero states look finished.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM),
    K.specRow(10, 'Accessibility notes', `The box is a ${code('<div>')}, not a region or a fieldset ⚑ — ${b('the compartments are visual and the form is one form')}. ${code('h1')} in the first compartment. ${b('The internal rules are not separators in the accessibility tree')} and carry no ${code('role')}. Focus ring is inset by 4 px where it meets the box edge — A6’s rule, carried ⚑.`),
    `${b('Flagged ⚑')} “Account box = box + 160, capped at the content box” is invented arithmetic ⚑. The default benefits label change is this design’s own ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 11 · Rail
// ═══════════════════════════════════════════════════════════════════════
const d11 = {
  n: 11, name: 'Rail',
  rail: 'A30 MEMBERS PAGES · DESIGN 11 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'A 240 px rail pinned beside the page: on /account/ it is the membership’s own sections with the current one marked, and on /signup/ it is what the membership includes.',
    'It is the only design in A30 that draws navigation, and it is the design an account page wants when a publication has more than six rows to show.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · RAIL 240 · GAP 48 · CONTENT COLUMN 1,008',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const role = (o || {}).role;
    const s = K.G(w);
    const railItems = role === 'account' ? RAIL_ACCOUNT : BENEFITS.map(x => ({ label:x }));
    if (w === 1440 || w === 834) {
      const railW = w === 1440 ? 240 : 200;
      const gapW = w === 1440 ? 48 : 32;
      const colW = s.box - railW - gapW;
      const railCol = `<div style="width:${railW}px;flex-shrink:0;display:flex;flex-direction:column;gap:12px">
        ${K.eyebrow(g, role === 'account' ? 'Your membership' : 'Included', PK)}
        <div style="margin-left:-12px">${railList(g, railItems, role === 'account' ? 0 : -1)}</div>
        ${mono(g, role === 'account' ? 'STICKS AT 96 FROM THE TOP · scroll-spy MARKS THE SECTION IN VIEW ⚑' : 'NO ACTIVE ITEM ON /SIGNUP/ · THE RAIL IS A LIST, NOT A NAV ⚑')}</div>`;
      const content = role === 'account'
        ? `<div style="width:${colW}px;display:flex;flex-direction:column">
            ${K.accountHead(g, { status:'paid', nameSize:w === 1440 ? 30 : 26 })}${K.gap(26)}
            ${K.accountRows(g, { status:'paid', labW:w === 1440 ? 200 : 150, dens:16 })}${K.gap(24)}
            ${K.signOutRow(g, {})}${K.gap(6)}${K.portalNote(g, { max:600 })}</div>`
        : `<div style="width:${colW}px;display:flex;flex-direction:column">
            ${pageHead(g, w, { measure:Math.min(colW, 620), max:colW, hSize:w === 1440 ? 40 : 34 })}${K.gap(28)}
            <div style="width:${Math.min(colW, 480)}px">${K.formBlock(t, g, { state:'typed', full:true, legalMax:480 })}</div></div>`;
      return P.stdWrap(t, w, `<div style="display:flex;gap:${gapW}px;align-items:flex-start">${railCol}${content}</div>`, { role });
    }
    const railRow = `<div style="display:flex;flex-direction:column;gap:10px">
      ${K.eyebrow(g, role === 'account' ? 'Your membership' : 'Included', PK)}
      ${railList(g, railItems, role === 'account' ? 0 : -1, { row:true })}
      ${mono(g, 'THE RAIL BECOMES A WRAPPED ROW OF LINKS ABOVE THE CONTENT AT ≤ 767 ⚑')}</div>`;
    const content = role === 'account'
      ? `${K.accountHead(g, { status:'paid', nameSize:22, size:38 })}${K.gap(20)}${K.accountRows(g, { status:'paid', labW:0, layout:'stack', dens:14 })}${K.gap(20)}${K.signOutRow(g, {})}${K.gap(6)}${K.portalNote(g, { max:350 })}`
      : `${pageHead(g, w, { measure:350, max:350, hSize:28 })}${K.gap(22)}${K.formBlock(t, g, { state:'typed', full:true, legalMax:350 })}`;
    return P.stdWrap(t, w, `<div style="display:flex;flex-direction:column;gap:26px">${railRow}${content}</div>`, { role });
  },
  primaryNote: `A12·10’s directory column, carried: ${b('a 240 rail of 44 px rows beside a content column, 48 apart')} ⚑. ${b('The active row is marked with a 2 px accent bar on its left edge')} — A1·1’s active convention turned through ninety degrees ⚑, and the rail’s only accent. ${b('On /signup/ there is no active row')}: the rail is a list of what is included, not a navigation, and the frame says so in mono ⚑.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE RAIL IS THE MEMBERSHIP’S OWN SECTIONS · TWO OF THEM ARE PORTAL',
  accountNote: `${b('Two of the four rail rows are Portal hand-offs and are marked “PORTAL ↗” in the rail itself')} ⚑ — a reader should know before they click that they are leaving the themed page. ${b('Membership is the only row that scrolls; Newsletters and Billing open Portal and Sign out is a link')} ⚑. ${PORTALROW}`,
  accountStatesNote: `${b('The rail does not change with the member type')} ⚑ — a free member still has newsletters and can still sign out, and a rail that grew and shrank per member would make the page’s furniture look unreliable. ${b('Billing is the one row that goes')}, on a comped membership, because there is nothing to bill ⚑.`,
  statesNote: `${b('The rail is unaffected by every form state')} ⚑ — it is the design’s fixed element, which is why this arrangement suits an account page more than a signup one. ${b('At ≤ 767 the rail is above the form')}, so the states sit below a wrapped row of links.`,
  extraTile: {
    label: 'THE RAIL’S ITEMS · AUTHORED ON /SIGNUP/, FIXED ON /ACCOUNT/',
    body: [
      `${b('On /signup/ the rail is the benefits field')} — 0 to 6 authored lines, and ${b('with none the rail is absent and the content column takes the content box')} ⚑. That is the same field 1 Centred draws as a tick list.`,
      `${b('On /account/ the rail is fixed and is not authored')} ⚑: Membership, Newsletters, Billing, Sign out. ${b('There is no Add or Remove')} — three of the four are Ghost’s own surfaces and one is a link. ${b('Only their labels are authored')}, at 24 characters each.`,
      `${b('Rail sticks uses position: sticky and declares no module for that')} ⚑; ${code('scroll-spy')} is declared for the active-row marking alone, and ${b('with JavaScript off the first row is marked and nothing tracks')} — the registry’s own words.`
    ]
  },
  stateForm(t, s) { return stateBody(t, s, { ground:'page' }); },
  controls: {
    name: 'Rail', n: 11, count: 'SIX',
    sub: 'A pinned rail beside the page.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132. 80 at 834, 64 at 390.'),
      K.seg('Rail side', ['Left', 'Right'], 0, 'Which side the rail takes. ' + b('The rail is above the content at ≤ 767 at both values') + ' ⚑.'),
      K.sel('Rail width', 'Medium 240', 'Narrow 200 · Medium 240. ' + b('No wide value') + ' ⚑ — past 240 the rail competes with the content column, and A12·10’s 240 is the library’s figure.'),
      K.seg('Rail sticks', ['On', 'Off'], 0, 'At On the rail pins 96 from the top while the content scrolls. ' + b('Ignored below 1024') + ' ⚑, and ' + code('position:sticky') + ' needs no module.'),
      K.seg('Rail marks', ['Show', 'Hide'], 0, 'The 2 px accent bar on the current row. ' + b('At Hide the row is still current in the accessibility tree') + ' ⚑.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name. Email only by default ⚑.')
    ],
    settles: [
      `${b('The rail’s contents are not a control')} ⚑ — they are the route: the benefits field on /signup/ and four fixed rows on /account/. A control offering to put the account sections on the signup page would be offering to link to pages a visitor cannot reach.`,
      `${b('“PORTAL ↗” is not a control either.')} It is drawn wherever a row leaves the theme, in every design in A30 ⚑, and a user cannot turn it off — hiding it would be hiding where the reader is about to go.`,
      `${b('Six controls and no seventh.')} Cut: a rail heading, a counts value (there is nothing to count), and a rail-on-mobile value — ${b('the wrapped row is the only arrangement that works')} ⚑, so it is a rule and not a choice.`
    ]
  },
  respCap: 'TABLET 834 · RAIL 200, SPLIT HELD · MOBILE 390 · RAIL BECOMES A WRAPPED ROW ABOVE THE CONTENT',
  tabletLabel: '834 · rail 200 · gap 32 · content 522',
  mobileLabel: '390 · rail is a wrapped row of pills above the form ⚑',
  mobileAccountLabel: '390 · /account/ · SAME ROW, THEN THE STACKED ROWS',
  respNote: `Edge rail’s ladder. ${b('Held at 834 with the rail at 200')} ⚑ — 200 and 522 both still work, and stacking a four-item rail above a form on a tablet wastes the width. ${b('At ≤ 767 the rail becomes a wrapped row of hairline pills above the content')} ⚑, its stated destination, and ${b('Rail sticks is ignored below 1024')} ⚑. The 2 px accent bar becomes a 1 px accent border on the current pill ⚑.`,
  darkNote: `A27’s step. ${b('The rail’s accent bar re-checks at 4.9:1')} against ${code('#171511')} and holds ⚑; the inactive rows are the muted token and the pills’ borders are the hairline. ${b('No plane, no shadow, nothing lifts')} — the rail is a list on the ground in both modes.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A 240 px rail beside a content column: the membership’s own sections with the current one marked on /account/, and the included list on /signup/. The only design in A30 that draws navigation.'),
    K.specRow(2, 'Structural descriptor', `${code('edge rail · none · page · few · none · a pinned rail beside the page')}<br><span style="color:#6B6459">Item-count ${code('few')} — the rail is designed for three to six rows and is absent at none ⚑. Containment ${code('none')}; the rail draws no box of its own, which is what keeps it from reading as a sidebar card.</span>`),
    K.specRow(3, 'Archetype', 'edge rail. One departure: ' + b('held at 834 rather than collapsing') + ' ⚑; the collapse is at 767, to a wrapped pill row.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} rail 240 + gap 48 + content 1,008; rail sticks at 96; form 480 in the content column; padding 96. ${b('834')} rail 200 + gap 32 + content 522; padding 80. ${b('≤ 767')} ${b('rail is a wrapped pill row above the content')} ⚑, sticking ignored, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Centred, plus ${code('railLabels')} 4 × 24 ch on /account/ (defaults Membership · Newsletters · Billing · Sign out) ⚑. ${code('benefits[]')} is what the /signup/ rail draws, so ${b('the same field is a tick list in 1, a numbered list in 2, a four-up row in 4 and a rail here')} — one field, four arrangements.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Rail side (Left · Right) · Rail width (Narrow 200 · Medium 240) · Rail sticks (On · Off) · Rail marks (Show · Hide) · Fields. Then the shared source group.'),
    K.specRow(7, 'Data', `${code('@member')} as 1 Centred. ${b('The rail’s /account/ rows are fixed and not data')} ⚑ except Billing, which is absent on a comped membership ⚑. ${b('0 benefits on /signup/')} → no rail, content column takes the box. ${b('1')} → a rail with one row, which is drawn rather than suppressed. ${b('6')} → the cap; a seventh is stored and not drawn ⚑.`),
    K.specRow(8, 'Empty state', `No benefits → the rail is absent on /signup/ and the design is 1 Centred left-aligned ⚑. No blurb → the head closes up. ${b('The /account/ rail is never empty')} — its rows do not depend on authored content.`),
    K.specRow(9, 'Behaviour module', `${b('member-form')} and ${b('scroll-spy')} ⚑. Both edit-safe; ${b('Rail sticks declares nothing')} — ${code('position:sticky')} is CSS. ${b('scroll-spy, quoted:')} “${P.plain('scroll-spy')}” ${b('member-form, quoted:')} “${P.plain('member-form')}”`),
    K.specRow(10, 'Accessibility notes', `The rail is a ${code('<nav aria-label="Your membership">')} on /account/ and a plain ${code('<ul>')} on /signup/ ⚑ — a list of benefits is not navigation. The current row carries ${code('aria-current="true"')} and keeps it at Rail marks: Hide ⚑. Rows are 44 px; ${b('the whole row is the target, not the label')} ⚑. Portal rows are announced as leaving: the accessible name ends “opens in Ghost’s Portal” ⚑. ${code('h1')} is in the content column, not the rail.`),
    `${b('Flagged ⚑')} The four /account/ rail rows are invented, as is their order ⚑. The 2 px left accent bar as the vertical form of A1·1’s underline is a derivation, not a carried component ⚑. Whether Ghost’s Portal can be opened at a named panel (newsletters, billing) from a theme link needs verifying before build ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 12 · Ledger
// ═══════════════════════════════════════════════════════════════════════
const LEDGER = BENEFITS.concat(['The archive, indexed and searchable', 'Events, when we run them']);
const d12 = {
  n: 12, name: 'Ledger',
  rail: 'A30 MEMBERS PAGES · DESIGN 12 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'What the membership includes as six ruled rows across the content box, with the form at the foot. The list is the page and the field is its conclusion.',
    'It is the design for a publication whose case is a long one, and the only one in A30 built for five or more included lines.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · SIX RULED ROWS ACROSS 1,296 · FORM AT THE FOOT ON 460',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const role = (o || {}).role;
    const s = K.G(w);
    const dens = w === 390 ? 14 : 18;
    if (role === 'account') {
      const inner = `<div style="display:flex;flex-direction:column">
        ${K.accountHead(g, { status:'paid', nameSize:w === 390 ? 22 : 28 })}
        ${K.gap(w === 390 ? 22 : 30)}
        ${K.accountRows(g, { status:'paid', labW:w === 1440 ? 240 : (w === 390 ? 0 : 150), layout:w === 390 ? 'stack' : undefined, dens:w === 390 ? 14 : 20 })}
        ${K.gap(24)}${K.signOutRow(g, {})}${K.gap(6)}${K.portalNote(g, { max:640 })}</div>`;
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    const rows = LEDGER.map((x, i) => ledgerRow(g, {
      n: String(i + 1).padStart(2, '0'), name:x, dens,
      nameW: w === 1440 ? 420 : w === 834 ? 300 : 0,
      text: w === 390 ? '' : ['Published at 6 a.m. UK time, every weekday.', 'A short note on what the desk is working on.', 'Seven years, 412 pieces, all of it open to members.', 'Threads under every piece, and writers in them.', 'Search by tag, author or year.', 'Two or three a year, in London and online.'][i],
      fs: w === 390 ? 16 : 17
    })).join('');
    const inner = `<div style="display:flex;flex-direction:column">
      ${pageHead(g, w, { measure:w === 1440 ? 620 : (w === 834 ? 560 : 350), max:w === 1440 ? 820 : s.box, hSize:w === 390 ? 28 : 40 })}
      ${K.gap(w === 390 ? 26 : 34)}
      ${rows}
      <div style="border-top:1px solid ${g.border};padding-top:${w === 390 ? 24 : 34}px;display:flex;flex-direction:${w === 390 ? 'column' : 'row'};gap:${w === 390 ? 18 : 48}px;align-items:flex-start;justify-content:space-between">
        <div style="max-width:${w === 1440 ? 520 : 420}px;display:flex;flex-direction:column;gap:8px">
          <span style="font-family:${PK.head};font-size:${w === 390 ? 20 : 24}px;font-weight:700;line-height:1.2;color:${g.text}">Six pounds a month, or sixty a year</span>
          ${K.blurb(g, 'Cancel whenever you like. We send a sign-in link, so there is no password to remember.', w === 1440 ? 480 : 400, PK, 15)}</div>
        <div style="width:${w === 390 ? '100%' : '460px'};flex-shrink:0">${K.formBlock(t, g, { state:'typed', full:true, note:false, legalMax:460 })}</div></div></div>`;
    return P.stdWrap(t, w, inner, { role:'signup' });
  },
  primaryNote: `A9·15’s ledger row, carried verbatim: ${b('a mono ordinal in a 26 px column, the name at 17/500 in a 420 column, one muted line filling the rest, over a hairline')} ⚑. ${b('Six rows is what this design is for')} — at three it reads as a wide, empty table and the panel names 1 Centred instead ⚑. The form is the last row’s consequence: a hairline, a price line at the left, the field at the right.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE ROWS ARE THE LEDGER · 240 PX LABEL COLUMN ACROSS 1,296',
  accountNote: `${b('The account page is already a ledger, so this design changes almost nothing on it')} ⚑ — the same ruled rows across the full content box with a 240 px label column, which is the widest row treatment in A30 and the one a publication with long values wants. ${PORTALROW}`,
  accountStatesNote: `${b('Rows leave and the ledger closes')} ⚑ — no reserved lines, no “—” in an empty value. A free member’s ledger is four rows across 1,296, which is wide for four things and is the honest cost of one row treatment serving every member type.`,
  statesNote: `${b('The states belong to the foot')} ⚑; the six rows above are authored content and never change. ${b('Sent and expired take the 460 foot column')}, so the panel’s width matches the field it replaced and the price line beside it stays put.`,
  extraTile: {
    label: 'THE INCLUDED LIST · SIX ROWS, AUTHORED, AND THE ONLY LIST IN A30 THE USER BUILDS',
    body: [
      `${b('Add sits under the last row')} as a full-width “Add a line” row; a new line arrives ${b('empty and focused')}, because unlike a tier there is nothing to prefill it from ⚑. ${b('Add is disabled at six')} and the row says why.`,
      `${b('Order is meaningful and drag-reorderable')} ⚑ — the ordinals are positional, so moving a row renumbers it. ${b('Remove is an ✕ on the row')}. ${b('At two the design still draws')}; ${b('at zero the rows and the foot hairline go')} and the page is 1 Centred with a heading and a field ⚑.`,
      `${b('Each line is a name and an optional detail')} ⚑, 60 and 90 characters. ${b('The detail is what makes the row a ledger row')}; with none the name sits alone and the row is 44 px rather than 62.`
    ]
  },
  stateForm(t, s) { return stateBody(t, s, { ground:'page' }); },
  controls: {
    name: 'Ledger', n: 12, count: 'SIX',
    sub: 'The included list as ruled rows, form at the foot.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132. 80 at 834, 64 at 390.'),
      K.seg('Row density', ['Compact', 'Comfortable', 'Spacious'], 1, '12 · 18 · 26 of row padding — A18’s row ladder, carried.'),
      K.seg('Ordinals', ['Numerals', 'Rules only'], 0, 'The 01–06 mono column. At Rules only the names start at the box’s left edge and ' + b('the list stops implying an order') + ' ⚑.'),
      K.seg('Row detail', ['One line', 'Name only'], 0, 'The muted line at the right of each row. ' + b('Hidden below 767 whatever this says') + ' ⚑.'),
      K.seg('Form position', ['At the foot', 'At the head'], 0, 'At the head puts the field under the heading and the ledger below it, for a page whose readers already know the case.'),
      K.sel('Included lines', '6 lines · Every piece, the day…', b('The item list.') + ' Two to six, drag to reorder, ' + b('Add is disabled at six') + ' ⚑. Each line is a name and an optional detail.')
    ],
    settles: [
      `${b('This is the only design in A30 with an item list in its panel')} ⚑ — everything else in the category is Ghost’s. The included lines are the user’s own writing, which is why they can be added, removed and reordered here and tiers cannot.`,
      `${b('A control writes one value onto the section, never onto a row')} ⚑. Density, ordinals and detail apply to all six at once; ${b('per-row styling is not expressible')} and asking for it is asking for a second design.`,
      `${b('No “price line” control')} ⚑ — the sentence beside the form is the blurb field, moved, and a publication that does not want it clears the field. One field, one place, whatever the arrangement.`
    ]
  },
  respCap: 'TABLET 834 · NAME COLUMN 300, DETAIL HELD · MOBILE 390 · DETAIL GOES, ROWS BECOME NAMES',
  tabletLabel: '834 · name 300 · detail to the right · form 460 at the foot',
  mobileLabel: '390 · ordinals kept · detail hidden ⚑ · form full width',
  mobileAccountLabel: '390 · /account/ · STACKED ROWS · THE LEDGER IS THE SAME ROW TREATMENT',
  respNote: `Stack’s ladder with the row treatment’s own. ${b('The name column steps 420 → 300 → auto')} and ${b('the detail line is hidden at ≤ 767')} ⚑ — its stated destination is nowhere: a 90-character detail under a name on a phone doubles the page’s height and the row’s job is the name. ${b('The ordinals are kept at 390')} ⚑, because they are what tells a reader the list has an order at all. The foot stacks: price line, then field.`,
  darkNote: `A27’s step. ${b('Six hairlines are the design, so the hairline token is the one value that matters')} ⚑: ${code('#332E27')} on ${code('#171511')} reads at the same weight as ${code('#EBE5DB')} on ${code('#FBF9F5')} — checked, because a ledger whose rules vanish in dark is six lines of floating text. ${b('The mono ordinals go to the muted token')} and the detail line with them.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'Six authored ruled rows across the content box — mono ordinal, name, one muted line — with a price sentence and the form on a hairline at the foot. The only A30 design built for five or more included lines.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · page · many · none · what is included as ruled rows')}<br><span style="color:#6B6459">Item-count ${code('many')} — the rows are a repeating unit designed for five or more, which is what separates this from 1 Centred’s ${code('none')} and 8 Tiers’ ${code('few')}. Containment ${code('none')}; the rules are the items’ own edges ⚑.</span>`),
    K.specRow(3, 'Archetype', 'stack. One departure: ' + b('the row detail is hidden at ≤ 767 with no destination') + ' ⚑ — stated, not implied.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} six rows across 1,296, ordinal 26, name 420, detail fills the rest, row padding 18, foot 520 / 48 / 460, padding 96. ${b('834')} name 300, detail kept, padding 80. ${b('≤ 767')} detail hidden, name auto, ordinals kept, foot stacked, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Centred, with ${code('benefits[]')} extended: ${b('each line is a name (60 ch) and an optional detail (90 ch)')} ⚑, 0–6 lines. ${b('The detail is stored by every other design and drawn only here')} ⚑ — which is the field list doing exactly the job it exists for.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Row density (Compact · Comfortable · Spacious) · Ordinals (Numerals · Rules only) · Row detail (One line · Name only) · Form position (At the foot · At the head) · Included lines (the item list, 2–6). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred; tiers read and not drawn. ${b('The rows are authored, not queried')}, so no Ghost state can empty them ⚑. On /account/ the rows are ${code('@member')}’s and the label column widens to 240.`),
    K.specRow(8, 'Empty state', `${b('0 lines')} → rows and foot hairline go; the page is a heading, a blurb and a field ⚑, and the panel names 1 Centred as the design for that. ${b('1–2')} → drawn, with a note in the editor that the arrangement wants four or more ⚑. ${b('A line with no detail')} → the name alone at 44 px.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM),
    K.specRow(10, 'Accessibility notes', `${code('h1')}, then the rows as an ${code('<ol>')} where Ordinals is Numerals and a ${code('<ul>')} where it is Rules only ⚑ — the list type follows the meaning, not the styling. ${b('Mono ordinals are aria-hidden')} ⚑; the list’s own numbering carries the order. The detail is inside its row’s ${code('<li>')}, so a row is read as one item. Row hairlines are decorative and carry no ${code('role="separator"')}.`),
    `${b('Flagged ⚑')} The six fixture lines and their details are invented ⚑. The price sentence beside the form is the blurb field reused, which is a judgement ⚑. The “wants four or more” editor note is invented ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 13 · Steps
// ═══════════════════════════════════════════════════════════════════════
const d13 = {
  n: 13, name: 'Steps',
  rail: 'A30 MEMBERS PAGES · DESIGN 13 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The signup as three numbered steps on one plane: choose what you get, put your address in, open the link we send. All three are visible at once and none of them is a panel.',
    'It is the design for a publication whose readers ask what happens next, and it answers that before they type. On /account/ the same numbering carries the three facts a member came to check.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · PLANE 1,040 · THREE STEPS, ALL VISIBLE, STEP 2 IS THE FORM',
  accountGround: 'surface',
  body(t, w, o) {
    const g = K.ground(t, 'surface');
    const role = (o || {}).role;
    const pw = w === 1440 ? 1040 : w === 834 ? 754 : 350;
    const pad = w === 1440 ? 48 : w === 834 ? 36 : 20;
    const plane = inner => `<div style="width:${pw}px;margin:0 auto;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t.dark ? '' : `box-shadow:${t.shadow};`}padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column">${inner}</div>`;
    const step = (n, title, body, o2) => {
      o2 = o2 || {};
      const on = o2.on;
      return `<div style="display:flex;gap:${w === 390 ? 14 : 22}px;align-items:flex-start;padding:${w === 390 ? 18 : 24}px 0;${o2.first ? '' : `border-top:1px solid ${g.border};`}">
        <span style="width:${w === 390 ? 28 : 34}px;height:${w === 390 ? 28 : 34}px;border-radius:${Math.min(g.r, 8)}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:${w === 390 ? 12 : 13}px;${on ? `background:${g.btnBg};color:${g.btnText};` : `border:1px solid ${g.border};color:${g.muted};`}">${n}</span>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:${w === 390 ? 10 : 13}px">
          <span style="font-family:${PK.head};font-size:${w === 390 ? 18 : 21}px;font-weight:700;line-height:1.25;color:${g.text}">${title}</span>${body}</div></div>`;
    };
    if (role === 'account') {
      const facts = [
        ['Signed in as', MEMBER.email, 'Change email'],
        ['Your plan', `${MEMBER.tier} · ${MEMBER.price}`, 'Change plan'],
        ['Renews', MEMBER.renews, '']
      ];
      const inner = plane(`${K.accountHead(g, { status:'paid', nameSize:w === 390 ? 22 : 26 })}
        ${K.gap(w === 390 ? 14 : 18)}
        ${facts.map((f, i) => step(String(i + 1).padStart(2, '0'), f[0],
          `<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap"><span style="font-size:16px;color:${g.text};font-family:${PK.body};overflow-wrap:anywhere">${f[1]}</span>${f[2] ? `<div style="display:flex;align-items:center;gap:9px">${K.btn(g, { label:f[2], variant:'outline', h:38, fs:13.5, px:14, pack:PK })}<span style="font-family:${MONO};font-size:9.5px;color:${g.muted}">PORTAL ↗</span></div>` : ''}</div>`,
          { first:i === 0, on:true })).join('')}
        <div style="border-top:1px solid ${g.border};padding-top:${w === 390 ? 18 : 22}px;display:flex;flex-direction:column;gap:12px">
          ${K.accountRow(g, { row:{ l:'Newsletters', v:MEMBER.letters, a:'Manage', portal:true }, labW:w === 390 ? 0 : 150, layout:w === 390 ? 'stack' : undefined, dens:0 })}
          ${K.accountRow(g, { row:{ l:'Member since', v:MEMBER.since }, labW:w === 390 ? 0 : 150, layout:w === 390 ? 'stack' : undefined, dens:0 })}
          ${K.gap(8)}${K.signOutRow(g, {})}${K.portalNote(g, { max:600, pt:0 })}</div>`);
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    const tierChoice = w === 1440
      ? `<div style="display:flex;gap:16px">${TIERS.slice(0, 2).map((tr, i) => `<div style="flex:1;border:1px solid ${i === 1 ? g.text : g.border};border-radius:${g.r}px;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px"><span style="font-family:${PK.head};font-size:17px;font-weight:700;color:${g.text}">${tr.name}</span><span style="font-family:${PK.head};font-size:19px;font-weight:700;color:${g.text};font-variant-numeric:tabular-nums">${tr.m}${tr.free ? '' : '<span style="font-size:13px;font-weight:400"> / mo</span>'}</span></div>
          <span style="font-size:13.5px;line-height:1.5;color:${g.muted};font-family:${PK.body}">${tr.blurb}</span>${i === 1 ? `<span style="font-family:${MONO};font-size:9.5px;color:${g.muted};padding-top:2px">CHOSEN · PAID TIERS CONTINUE IN PORTAL ⚑</span>` : ''}</div>`).join('')}</div>`
      : `<div style="display:flex;flex-direction:column;gap:10px">${TIERS.slice(0, 2).map((tr, i) => `<div style="border:1px solid ${i === 1 ? g.text : g.border};border-radius:${g.r}px;padding:14px;box-sizing:border-box;display:flex;align-items:baseline;justify-content:space-between;gap:12px">
          <span style="font-family:${PK.head};font-size:16px;font-weight:700;color:${g.text}">${tr.name}</span>
          <span style="font-family:${PK.head};font-size:17px;font-weight:700;color:${g.text};font-variant-numeric:tabular-nums">${tr.m}${tr.free ? '' : ' / mo'}</span></div>`).join('')}</div>`;
    const inner = plane(`<div style="display:flex;flex-direction:column;align-items:${w === 390 ? 'flex-start' : 'center'};text-align:${w === 390 ? 'left' : 'center'};padding-bottom:${w === 390 ? 6 : 10}px">
        ${pageHead(g, w, { align:w === 390 ? 'left' : 'center', measure:560, max:560, hSize:w === 390 ? 26 : 34 })}</div>
      ${step('01', 'Choose what you get', tierChoice, { first:true, on:true })}
      ${step('02', 'Put your address in', `<div style="width:${w === 390 ? '100%' : '460px'}">${K.formBlock(t, g, { state:'typed', full:true, legalMax:460, signin:false })}</div>`, { on:true })}
      ${step('03', 'Open the link we send', `<span style="font-size:15px;line-height:1.55;color:${g.muted};font-family:${PK.body};max-width:520px">It arrives in a few seconds, lasts 24 hours ⚑ and works once. Opening it signs you in on this device.</span>`, {})}
      <div style="border-top:1px solid ${g.border};padding-top:${w === 390 ? 16 : 20}px;display:flex;align-items:center;gap:7px;${w === 390 ? '' : 'justify-content:center;'}">${K.signinRow(g, { pack:PK, center:w !== 390 })}</div>`);
    return P.stdWrap(t, w, inner, { role:'signup' });
  },
  primaryNote: `${b('All three steps are visible and none of them is hidden behind the others')} ⚑ — this is a numbered explanation, not a wizard. ${b('Steps 1 and 2 carry a filled ordinal and step 3 an outlined one')}, which is the only state distinction drawn: 3 is what happens next, not something to do here. ${b('The ordinal chip is 34 px and is not a target')} ⚑; nothing in it is clickable.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE NUMBERING CARRIES THE THREE FACTS, THEN THE REST PLAINLY',
  accountNote: `${b('On /account/ the three steps become the three facts a member came to check')} ⚑ — who they are signed in as, what they pay, and when it renews — with newsletters and join date beneath in plain rows. ${b('The ordinals stay filled because all three are true')} ⚑, not sequential. ${PORTALROW}`,
  accountStatesNote: `${b('A free member has two facts, not three')} ⚑ — there is no renewal — so the numbering runs 01 and 02 and the third step is absent rather than empty. ${b('A comped member’s 02 reads “Member · complimentary” with no action')} ⚑. Cancelled reads “Ends” at 03 with Resume beside it.`,
  statesNote: `${b('Every state replaces step 02’s contents')} ⚑ and the other two steps hold. ${b('Sent moves the filled ordinal from 02 to 03')} ⚑ — the one place in A30 where a state changes something outside the form block, and it is drawn because the numbering would otherwise be lying about where the reader is.`,
  extraTile: {
    label: 'WHAT THIS DESIGN IS NOT · AND THE FINDING THAT COMES WITH IT',
    body: [
      `${b('It is not a wizard.')} A real multi-step signup — one panel at a time, forward and back — ${b('needs behaviour no module in the registry covers')} ⚑. ${b('The closest is tabs')}, and this design deliberately does not declare it: tabs would render all three panels stacked with their labels as headings, which is what this design already is at rest ⚑.`,
      `${b('So the steps are typography, not state')} ⚑. That is a finding for the architect rather than a request: if a stepped members flow is wanted, it is a new module, and no design in A30 assumes one exists.`,
      `${b('Step 1 is a choice a theme cannot complete')} ⚑ — picking a paid tier hands to Portal’s checkout immediately. The chip on the chosen tier says so on the frame, in the sidebar, and in the spec.`
    ]
  },
  stateForm(t, s) { return stateBody(t, s, { ground:'surface', pad:18 }); },
  controls: {
    name: 'Steps', n: 13, count: 'SIX',
    sub: 'The signup as three numbered steps.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'Around the plane: 64 · 96 · 132. The plane’s own padding is 48 · 36 · 20 ⚑.'),
      K.sel('Plane width', 'Held 1,040', 'Held 1,040 · Content box 1,296 · Narrow 720. ' + b('Narrow drops step 1 to stacked tier rows') + ' ⚑.'),
      K.seg('Step numbers', ['Numerals', 'Dots', 'Hide'], 0, 'Filled 34 px chips, 10 px dots, or nothing — at Hide the steps are headings alone and ' + b('the list is still an ordered list in the markup') + ' ⚑.'),
      K.seg('Step one', ['Two tiers', 'Every tier', 'Hide'], 0, 'What the first step offers. ' + b('Hide makes it a two-step page and renumbers') + ' ⚑; 8 Tiers is the design for a full tier comparison.'),
      K.seg('Step three', ['Show', 'Hide'], 0, '“Open the link we send.” ' + b('Hidden where the publication uses passwords') + ' — which Ghost does not, so this is for publications who find the sentence unnecessary ⚑.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name, inside step 02.')
    ],
    settles: [
      `${b('No “one step at a time” value')} ⚑ — that is the module that does not exist, and offering it as a control would promise behaviour the build cannot compile. The panel says so where a user would look for it.`,
      `${b('Step one is tiers, and it is a read-only offer')} ⚑: two tiers or all of them, from Ghost, in Ghost’s order. ${b('No Add, no Remove, no reorder')} — the same rule 8 Tiers states, restated here because this is the second design that draws them.`,
      `${b('Renumbering is automatic')} ⚑. Hide step one and the remaining two are 01 and 02, not 02 and 03 — a numbered list with a missing first item is the fastest way to make a page look broken.`
    ]
  },
  respCap: 'TABLET 834 · PLANE 754, TIERS STACK · MOBILE 390 · PLANE 350, ORDINALS 28, STEPS TIGHTEN',
  tabletLabel: '834 · plane 754 · inner 36 · tier rows stacked',
  mobileLabel: '390 · plane 350 · inner 20 · ordinals 28 · head left-aligned',
  mobileAccountLabel: '390 · /account/ · THE THREE FACTS, THEN STACKED ROWS',
  respNote: `Stack’s ladder. ${b('The two tier cards in step 01 become stacked rows at ≤ 833')} ⚑ — name and price on one line, blurb dropped — and ${b('the plane’s head goes left-aligned at 390')} ⚑ while the steps were left-aligned all along, so the page gains one axis instead of two. ${b('The ordinal chips step 34 → 34 → 28')} and stay square.`,
  darkNote: `A27’s step: the plane lifts to ${code('#211D17')}, the shadow drops, ${b('and the filled ordinal chips keep the accent')} ⚑ — ${code('#171511')} on ${code('#E0805A')} at 4.9:1, checked, because a numeral in a filled chip is small text and this is the one accent-on-accent pairing in A30 ⚑. Outlined chips take the hairline and the muted token.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'Three numbered steps on one raised plane — choose a tier, enter an address, open the link — with all three visible at rest. On /account/ the same numbering carries the member’s three facts.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · surface · few · none · the signup as numbered steps')}<br><span style="color:#6B6459">Item-count ${code('few')} — three steps, two or three by control. Ground ${code('surface')} with containment ${code('none')}: the plane is the ground, which is 4 Panel’s call carried ⚑. Archetype ${code('stack')}, because the steps are a sequence of blocks and the form is one of them.</span>`),
    K.specRow(3, 'Archetype', 'stack. No departures at width; ' + b('one at state') + ' — the filled ordinal moves from 02 to 03 when the link is sent ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,040 centred, inner 48, ordinals 34, step 01 two cards side by side, form 460, padding 96. ${b('834')} plane 754, inner 36, ${b('tier cards become rows')} ⚑, padding 80. ${b('≤ 767')} plane 350, inner 20, ordinals 28, head left-aligned, form full width, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Centred, plus ${code('stepLabels')} 3 × 40 ch (defaults as drawn) ⚑ · ${code('stepThreeText')} opt 160 ch. ${b('benefits[] is stored and not drawn')} ⚑ — the steps are the page’s structure and a benefits list beside them is a second argument.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Plane width (Held 1,040 · Content box 1,296 · Narrow 720) · Step numbers (Numerals · Dots · Hide) · Step one (Two tiers · Every tier · Hide) · Step three (Show · Hide) · Fields. Then the shared source group.'),
    K.specRow(7, 'Data', `${code('#get "tiers"')} for step 01 — ${b('two tiers means free and the lowest paid one')} ⚑, and Every tier draws them all in Ghost’s order. ${b('0 paid tiers')} → step 01 is absent and the page renumbers to two steps ⚑. ${b('1')} → free and that one. ${b('4 or more')} → Every tier stacks them as rows whatever the width ⚑. ${code('@member')} on /account/ as 1 Centred.`),
    K.specRow(8, 'Empty state', `No tiers → two steps, as above. ${b('A comped or free member’s /account/ has two facts, not three')} ⚑ and the numbering closes up. No blurb → the plane’s head is eyebrow and heading.`),
    K.specRow(9, 'Behaviour module', `${b('member-form')}, ${b('and no second module')} ⚑. ${P.MODLINE} ${b('No-JS, quoted:')} “${P.plain('member-form')}” ${b('A stepped flow would need behaviour the registry does not cover')} ⚑ — ${b('the closest module is tabs')}, whose no-JS rendering (“${P.plain('tabs')}”) is what this design already is at rest, which is why it is drawn as typography and declares nothing for it.`),
    K.specRow(10, 'Accessibility notes', `${code('h1')} in the plane’s head, then ${b('an <ol> of three <li>')} ⚑ — the numbering is the list’s, and the ordinal chips are ${code('aria-hidden')}. ${b('Step 02 contains the whole form')}; steps are not fieldsets and carry no ${code('aria-current')} ⚑ — nothing here is a state a reader is in. The tier choice in step 01 is two links, not radios ⚑, because choosing one navigates to Portal. Chips are not targets and are excluded from focus order.`),
    `${b('Flagged ⚑')} The three step labels and step three’s text are invented ⚑. Moving the filled ordinal on sent is this design’s own state rule ⚑. “Two tiers = free plus the lowest paid” is invented ⚑. ${b('The absence of a stepped-flow module is a finding for the architect')}, recorded here and on the proof frame ⚑.`
  ]]
};

globalThis.A30D = (globalThis.A30D || []).concat([d9, d10, d11, d12, d13]);
})();
