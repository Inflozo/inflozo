// A30 designs 1–4 · Centred · Split Pitch · Card · Panel
(function () {
const K = globalThis.A30LIB, P = globalThis.A30PAGE;
const { L, D, MONO, b, code, tile, PACKS, COPY, BENEFITS, MEMBER } = K;
const PK = PACKS.paper;

/* ── shared A30 drawing helpers, reused by d2 and d3 ──────────────────── */
const mono = (g, txt, size) => `<span style="font-family:${MONO};font-size:${size || 10}px;color:${g.muted}">${txt}</span>`;
const hair = g => `<div style="width:100%;height:1px;background:${g.border}"></div>`;
const onGround = (g, inner, o) => {
  o = o || {};
  return `<div style="background:${g.bg === 'transparent' ? 'none' : g.bg};${o.border === false ? '' : `border:1px solid ${g.border};`}border-radius:${g.r}px;padding:${o.pad === undefined ? 16 : o.pad}px;box-sizing:border-box;width:100%">${inner}</div>`;
};
const pageHead = (g, w, o) => K.headBlock(g, w, Object.assign({ eyebrowText:COPY.eyebrow, headingText:COPY.heading, blurbText:COPY.blurb, tag:'h1' }, o), PK);
const stateHead = (g, txt, sub) => `<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px"><span style="font-family:${PK.head};font-size:20px;font-weight:700;line-height:1.2;color:${g.text}">${txt}</span>${sub ? `<span style="font-size:13.5px;line-height:1.5;color:${g.muted}">${sub}</span>` : ''}</div>`;

/* One state renderer for every design: the same seven states, drawn on the
   design's own ground and inside the design's own containment. */
function stateBody(t, s, o) {
  o = o || {};
  const g = K.ground(t, o.ground || 'page');
  const base = { full:true, gapIn:o.gapIn || 13, fields:o.fields, pad:16 };
  let body;
  if (s === 'signin') body = stateHead(g, COPY.signinHeading, COPY.signinBlurb) +
    K.formBlock(t, g, Object.assign({}, base, { state:'empty', cta:COPY.signinCta, legal:false, fields:undefined,
      noteText:'A link, not a password. It works once.', prompt:COPY.signupPrompt, link:COPY.signupLink }));
  else if (s === 'sent') body = K.formBlock(t, g, Object.assign({}, base, { state:'sent' }));
  else if (s === 'code') body = K.formBlock(t, g, Object.assign({}, base, { state:'code' }));
  else if (s === 'expired') body = K.formBlock(t, g, Object.assign({}, base, { state:'expired' }));
  else if (s === 'signedin') body = K.formBlock(t, g, Object.assign({}, base, { state:'signedin' }));
  else if (s === 'invalid') body = K.formBlock(t, g, Object.assign({}, base, { state:'invalid', legal:false }));
  else if (s === 'focus') body = K.formBlock(t, g, Object.assign({}, base, { state:'focus', legal:false })) +
    `<div style="padding-top:10px">${mono(g, 'THE FIELD BORDER GOES TO 1.5 PX IN THE ACCENT · A6’S RING IS 2 PX AT A 4 PX OFFSET ON THE BUTTON ⚑')}</div>`;
  else if (s === 'sending') body = K.formBlock(t, g, Object.assign({}, base, { state:'sending', legal:false }));
  else body = K.formBlock(t, g, Object.assign({}, base, { state:'nojs', legal:false }));
  return o.plate === false ? `<div style="width:100%">${body}</div>` : onGround(g, body, { pad:o.pad === undefined ? 16 : o.pad });
}

/* The account page, as most designs draw it: head, rows, sign-out, the note. */
function accountBlock(g, w, o) {
  o = o || {};
  const stack = w === 390;
  return `<div style="display:flex;flex-direction:column;width:100%">
    ${o.centre ? `<div style="display:flex;justify-content:center;width:100%">${K.accountHead(g, { status:o.status || 'paid', nameSize:w === 390 ? 22 : (o.nameSize || 26), size:w === 390 ? 38 : 44 })}</div>` : K.accountHead(g, { status:o.status || 'paid', nameSize:w === 390 ? 22 : (o.nameSize || 26), size:w === 390 ? 38 : 44 })}
    ${K.gap(w === 390 ? 22 : 28)}
    ${K.accountRows(g, { status:o.status || 'paid', labW:o.labW === undefined ? 168 : o.labW, layout:stack ? 'stack' : undefined, dens:w === 390 ? 14 : (o.dens || 16) })}
    ${K.gap(w === 390 ? 20 : 26)}
    ${K.signOutRow(g, {})}
    ${K.gap(6)}
    ${K.portalNote(g, { max:o.max || 620 })}</div>`;
}

const benefitGrid = (g, w, cols) => `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${w === 390 ? 16 : 28}px;width:100%">${
  BENEFITS.map((x, i) => `<div style="display:flex;flex-direction:column;gap:7px"><span style="font-family:${MONO};font-size:10.5px;letter-spacing:.06em;color:${g.muted}">${String(i + 1).padStart(2, '0')}</span><span style="font-size:15px;line-height:1.5;color:${g.text};font-family:${PK.body};text-wrap:pretty">${x}</span></div>`).join('')}</div>`;

globalThis.A30X = { mono, hair, onGround, pageHead, stateHead, stateBody, accountBlock, benefitGrid };

/* Shared spec language. Quoted verbatim from the registry, never composed. */
const MEMBERFORM = mod => `${b(mod || 'member-form')}. ${P.MODLINE} ${b('No-JS, quoted:')} “${P.plain('member-form')}”`;
const PORTALROW = `${b('Portal is the boundary')} ⚑ — Change email, Change plan, Billing and Manage newsletters each open Ghost’s Portal over the page. ${b('Nothing behind those buttons is themed')}, and no control moves the line.`;

const SETTLE_STATES = {
  label: 'WHAT THE SEVEN STATES SETTLE FOR THE WHOLE CATEGORY',
  body: [
    `${b('Sign-in is the signup page with one field and no tiers')} ⚑ — same measure, same button, same note. A publication that themes ${code('custom-signup.hbs')} gets ${code('custom-signin.hbs')} for free, which is why the two are one design and not two.`,
    `${b('Sent replaces the field; it never disables it.')} A disabled field with a message under it reads as a failure. ${b('The panel carries “Send another link”')} and the address is echoed so a mistyped one is visible ⚑. ${b('Expired is read from the query string')} (${code('?action=signin&success=false')}) and is therefore JS-only ⚑; without JavaScript the reader gets the plain form, which is the same recovery in one step fewer.`,
    `${b('A signed-in member never sees a signup form')} ⚑. The signup route draws the membership summary and two actions instead. ${b('Invalid is the browser’s constraint first')} — ${code('type="email"')} — then Ghost’s reply; the theme draws the wording and never validates a domain itself.`
  ]
};

// ═══════════════════════════════════════════════════════════════════════
// 1 · Centred
// ═══════════════════════════════════════════════════════════════════════
const d1 = {
  n: 1, name: 'Centred',
  rail: 'A30 MEMBERS PAGES · DESIGN 1 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'One centred column on the page ground: eyebrow, heading, a sentence, the email field, and what the membership includes beneath a hairline. The category default, and the arrangement the other twelve depart from.',
    'It draws the same column on all three routes — signup, sign-in and account — so a publication that wants one membership page rather than three gets it here without deciding anything else.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · COLUMN 480 CENTRED IN THE 1,296 BOX · PADDING COMFORTABLE 96',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const col = w === 1440 ? 480 : w === 834 ? 440 : 350;
    if ((o || {}).role === 'account') {
      const inner = `<div style="width:${w === 1440 ? 640 : w === 834 ? 560 : 350}px;margin:0 auto">${accountBlock(g, w, { centre:w !== 390, labW:w === 1440 ? 160 : 140, max:520 })}</div>`;
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    const inner = `<div style="width:${col}px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center">
      ${pageHead(g, w, { align:'center', measure:col, max:col })}
      ${K.gap(w === 390 ? 26 : 32)}
      ${K.formBlock(t, g, { state:'typed', full:true, center:true, legalMax:col })}
      ${K.gap(w === 390 ? 26 : 34)}
      ${hair(g)}
      ${K.gap(22)}
      <div style="width:100%;text-align:left">${K.benefitList(g, { n:4, gap:12, label:'What a membership includes', pack:PK })}</div></div>`;
    return P.stdWrap(t, w, inner, { role:'signup' });
  },
  primaryNote: `A16’s 46 px field, carried verbatim — label above, hairline border, ${code('you@example.com')} in the placeholder token — and A1·1’s primary button at that same height, full width under it. ${b('The button is the section’s only accent')} ⚑. The column is 480 rather than A25’s 720: a single field wants a shorter line than a paragraph does, and the four included lines sit under a hairline so the page has a second thing to read while the reader decides.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE SAME COLUMN, WIDENED TO 640 FOR THE ROWS · DISPLAY-ONLY',
  accountNote: `The same centred column with the form replaced by six label-and-value rows. ${b('Nothing on this page is editable in the theme')} ⚑: the name, tier, price and renewal date are read from ${code('@member')} and drawn as text. ${PORTALROW} The rows are 168 / flexible / action at 16 px of padding on a hairline — ${b('A9·15’s ledger row, carried')}.`,
  accountStatesNote: `${b('Three members, three row sets')} ⚑. A free member has no price and no renewal date, so those two rows are absent rather than empty — the ladder closes up. A complimentary member has a plan and no billing hand-off at all, because there is nothing to bill. ${b('A cancelled-but-running subscription reads “Ends”, not “Renews”')} ⚑, and its action is Resume rather than Change plan; Ghost exposes ${code('cancel_at_period_end')} and this is the one place a theme must read it.`,
  statesNote: `${b('Seven states, one geometry.')} The field never moves and the column never changes width — every state is a swap inside the same 480 measure ⚑. ${b('Sent replaces the field with a panel')} on the page’s plate colour, carrying the address back and a “Send another link” button; ${b('the field is replaced, not disabled')} ⚑.`,
  extraTile: SETTLE_STATES,
  stateForm(t, s) { return stateBody(t, s, { ground:'page' }); },
  controls: {
    name: 'Centred', n: 1, count: 'SIX',
    sub: 'One centred column: head, field, what is included.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 above and below. 80 at 834, 64 at 390 — A17’s ladder.'),
      K.sel('Column width', 'Medium 480', 'Narrow 380 · Medium 480 · Wide 560. ' + b('Full width less the margins at 390') + ' ⚑ — a fixed column on a phone is a horizontal scrollbar.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost accepts an optional name on signup. ' + b('Email only is the default') + ' ⚑ — every field added costs signups, and the name can be set later in Portal.'),
      K.seg('Included list', ['Show', 'Hide'], 0, 'The four authored lines under the hairline. Hidden on the sign-in and account routes whatever this says ⚑.'),
      K.seg('Legal line', ['Show', 'Hide'], 0, '13 px muted under the button. ' + b('Authored, never generated') + ' ⚑ — the theme does not know a publication’s terms.'),
      K.seg('Sign-in link', ['Show', 'Hide'], 0, '“Already a member? Sign in”, and its opposite on the sign-in route. ' + b('Hidden only where the site links the two pages in its nav') + '.')
    ],
    settles: [
      `${b('Six controls, and none of them is a colour or a font.')} Cut: a ground value (that is 4 Panel and 5 Contrast Band), a card value (3 Card), a tier row (8 Tiers), an image (6 Cover), and a heading-size value — ${b('the heading is not the display moment in this design')}, and 9 Big Type is the design that makes it one.`,
      `${b('One control set for three routes.')} Padding, Column width, Legal line and Sign-in link mean something on all three; ${b('Fields and Included list are ignored on /account/')} ⚑ and the panel greys them there rather than hiding them, so a user switching routes does not think a control vanished.`,
      `${b('Nothing in this panel can change a subscription.')} Plan, price and renewal are read; ${b('every action that writes is a Portal hand-off')} ⚑. That is the category’s boundary, and it is in the source group rather than in any design’s own controls because it is not a design decision.`
    ]
  },
  respCap: 'TABLET 834 · COLUMN 440 · MOBILE 390 · COLUMN IS THE FRAME LESS ITS MARGINS · THE ACCOUNT ROWS STACK',
  tabletLabel: '834 · column 440 · heading 34 · padding 80',
  mobileLabel: '390 · column 350 · heading 28 · field and button full width',
  mobileAccountLabel: '390 · /account/ · EVERY ROW BECOMES A STACKED LABEL, VALUE, ACTION ⚑',
  respNote: `Form’s ladder, with the account page’s own departure. ${b('834')} column 440, heading 34, padding 80. ${b('≤ 767')} the column is the frame less its 20 margins, the heading is 28, ${b('the field and button go full width')} and stay 46 px ⚑. ${b('The account rows stop being rows at 767')}: label, value and action stack in that order at 14 px of padding ⚑, because a 168 px label column beside a 44 px button leaves 100 px for an email address. ${b('The status badge stays beside the name at every width')} — it is the one fact a member came to check.`,
  darkNote: `A27’s step: ground ${code('#171511')}, the field lifting to ${code('#211D17')} inside a ${code('#332E27')} hairline, shadows dropped and the hairline carrying every plane. ${b('The accent re-checks at 4.9:1')} for ${code('#171511')} on ${code('#E0805A')} ⚑, so the primary button keeps the accent in dark. ${b('The status badge inverts with it')} and the muted row labels sit at 5.1:1.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'One centred column on the page ground carrying eyebrow, heading, blurb, the email field and an included list under a hairline; the same column, widened, carries the account rows. The category default.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · page · none · none · one centred column')}<br><span style="color:#6B6459">Containment ${code('none')} — the section draws no box and no plane; the field’s own border is the field’s, not the section’s. Item-count ${code('none')}: the included list is authored prose, not a repeating unit ⚑. Ground ${code('page')}, which is what separates it from 4 Panel and 5 Contrast Band.</span>`),
    K.specRow(3, 'Archetype', 'form. No departures — a centred column is what the ladder collapses every other A30 design into.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} column 480 centred in the 1,296 box on a 72 margin, heading 40, field 46, padding 96; account column 640 with 168 px row labels. ${b('834')} column 440, heading 34, padding 80; account column 560. ${b('≤ 767')} column = frame − 40, heading 28, field and button full width at 46, padding 64, ${b('account rows stacked')} ⚑.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} opt 24 ch · ${code('heading')} opt 60 ch · ${code('blurb')} opt 240 ch · ${code('emailLabel')} opt 24 ch · ${code('placeholder')} opt 40 ch · ${code('ctaLabel')} opt 24 ch, default “Continue” · ${code('note')} opt 90 ch · ${code('legal')} opt 160 ch · ${code('signinPrompt')} + ${code('signinLinkLabel')} · ${code('benefits[]')} 0–6 × 60 ch · ${code('benefitsLabel')} opt 24 ch · the six ${code('rowLabels')} · ${code('signOutLabel')} · ${code('portalNote')} · the six sign-in and magic-link strings. ${b('No image field is drawn')} — 6 Cover owns imagery; the field is stored ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Padding (Compact · Comfortable · Spacious) · Column width (Narrow 380 · Medium 480 · Wide 560) · Fields (Email only · Name and email) · Included list (Show · Hide) · Legal line (Show · Hide) · Sign-in link (Show · Hide). Then the shared Membership source group, not counted.'),
    K.specRow(7, 'Data', `${code('@member')} on /account/ — email, name, status, tier name, price, interval, renewal date, ${code('cancel_at_period_end')}, newsletters, ${code('created_at')}. ${code('#get "tiers"')} is read and ${b('not drawn in this design')} ⚑. ${b('0 tiers')} → nothing changes, the form posts to the free list. ${b('1')} → likewise. ${b('many')} → likewise; 8 Tiers is the design that draws them. Signed out on /account/ → Ghost redirects before the theme renders ⚑.`),
    K.specRow(8, 'Empty state', `No blurb → the stack closes up between heading and field. No benefits → the hairline and the list both go, and the column ends at the legal line ⚑. Free member → no price row, no renewal row. Comped → no billing row. ${b('No “Untitled member” fallback')}: a member with no name shows the email in the name slot and no avatar initial ⚑.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM()),
    K.specRow(10, 'Accessibility notes', `${b('The heading is the page’s h1')} ⚑ — A30 is the whole page, not a section under A29. ${code('<form>')} with a real ${code('<label for>')}, ${code('type="email"')}, ${code('autocomplete="email"')} and ${code('inputmode="email"')}. Focus order: field, button, sign-in link, then the included list. ${b('The sent panel is an aria-live="polite" region')} ⚑ so the swap is announced; the invalid line is ${code('aria-describedby')} on the field. Every action is 44 px or taller. Muted on ground 5.4:1; accent button 4.7:1.`),
    `${b('Flagged ⚑')} The 24-hour magic-link expiry and “works once” wording are asserted from Ghost’s member auth behaviour, not from the brief — ${b('verify the interval before build')}. The status badge vocabulary (Member · Free · Complimentary) is invented ⚑. “Continue” rather than “Subscribe” is a judgement: the button leads to Portal’s checkout on a paid tier and to a sent link on the free one ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 2 · Split Pitch
// ═══════════════════════════════════════════════════════════════════════
const d2 = {
  n: 2, name: 'Split Pitch',
  rail: 'A30 MEMBERS PAGES · DESIGN 2 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The case for membership in a 700 column and the form in a 520 one beside it. The library’s split arrangement, applied to the page where a publication has to argue for money.',
    'It is the design for a publication with something to say: the heading can run to two lines, the blurb to four, and the numbered list of what is included sits under them rather than under the field.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · CASE COLUMN 700 · FORM COLUMN 520 · 76 GAP',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const role = (o || {}).role;
    if (role === 'account') {
      if (w === 1440) {
        const inner = `<div style="display:flex;gap:40px;align-items:flex-start">
          <div style="width:420px;flex-shrink:0;display:flex;flex-direction:column">
            ${K.heading(g, COPY.accountHeading, 34, PK, 'h1')}${K.gap(14)}
            ${K.blurb(g, COPY.accountBlurb, 360, PK, 16)}${K.gap(20)}
            ${K.accountHead(g, { status:'paid', nameSize:20, size:38, sub:`${MEMBER.email}` })}${K.gap(22)}
            ${K.signOutRow(g, {})}</div>
          <div style="width:836px;display:flex;flex-direction:column">
            ${K.accountRows(g, { status:'paid', labW:180, dens:16 })}${K.gap(18)}${K.portalNote(g, { max:640 })}</div></div>`;
        return P.stdWrap(t, w, inner, { role:'account' });
      }
      const inner = `<div style="display:flex;flex-direction:column">
        ${K.heading(g, COPY.accountHeading, w === 834 ? 30 : 26, PK, 'h1')}${K.gap(12)}
        ${K.blurb(g, COPY.accountBlurb, w === 834 ? 520 : 350, PK, 16)}${K.gap(20)}
        ${accountBlock(g, w, { labW:w === 834 ? 160 : 0, max:520 })}</div>`;
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    if (w === 1440) {
      const inner = `<div style="display:flex;gap:76px;align-items:flex-start">
        <div style="width:700px;flex-shrink:0;display:flex;flex-direction:column">
          ${K.eyebrow(g, COPY.eyebrow, PK)}${K.gap(14)}
          ${K.heading(g, 'Orbit Weekly, in full, for the price of a coffee', 44, PK, 'h1')}${K.gap(18)}
          ${K.blurb(g, COPY.blurb, 620, PK, 17)}${K.gap(30)}
          ${K.benefitList(g, { style:'rows', dens:14, pack:PK })}</div>
        <div style="width:520px;display:flex;flex-direction:column">
          ${K.formBlock(t, g, { state:'typed', full:true, label:COPY.fieldLabel, legalMax:520 })}</div></div>`;
      return P.stdWrap(t, w, inner, { role:'signup' });
    }
    const inner = `<div style="display:flex;flex-direction:column">
      ${K.eyebrow(g, COPY.eyebrow, PK)}${K.gap(12)}
      ${K.heading(g, 'Orbit Weekly, in full, for the price of a coffee', w === 834 ? 36 : 28, PK, 'h1')}${K.gap(16)}
      ${K.blurb(g, COPY.blurb, w === 834 ? 620 : 350, PK, w === 390 ? 16 : 17)}${K.gap(26)}
      ${K.formBlock(t, g, { state:'typed', full:true, legalMax:w === 834 ? 520 : 350 })}
      ${K.gap(28)}${hair(g)}${K.gap(18)}
      ${K.benefitList(g, { style:'rows', dens:12, pack:PK })}</div>`;
    return P.stdWrap(t, w, inner, { role:'signup' });
  },
  primaryNote: `A5·5’s split head, re-proportioned for a form: ${b('700 and 520 in the 1,296 box with a 76 gap')} ⚑, the case measure held at 620 so the column has air at its right. ${b('The form is the right column’s full width')} — no Field width control, because the column decides it. The included list is A5·11’s numbered rows, ${b('01–04 in mono over a hairline')}, so the case reads as an argument rather than a tick list.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · HEAD COLUMN 420 · ROWS COLUMN 836 · 40 GAP',
  accountNote: `The split survives the route change: ${b('the head, the member and Sign out on the left; the rows and the Portal note on the right')} ⚑. ${PORTALROW} ${b('The left column never reacts to data')} — it is authored text and a name — so the page has something fixed on it whatever the membership turns out to be.`,
  accountStatesNote: `${b('Only the right column changes.')} A free member drops the price and renewal rows and the column shortens by 96 px; ${b('the left column holds its 420 grid width')} ⚑, because a gutter that moves between member types is worse than a short column. Cancelled-but-running reads “Ends” with a Resume action ⚑.`,
  statesNote: `${b('Every state belongs to the right column')} ⚑ — which is the reason the split exists: the case for membership is true whatever the reader has typed, so it must not flicker when they type. At 834 and below the columns stack, head first, and the states behave as 1 Centred.`,
  extraTile: SETTLE_STATES,
  stateForm(t, s) { return stateBody(t, s, { ground:'page' }); },
  controls: {
    name: 'Split Pitch', n: 2, count: 'SIX',
    sub: 'The case beside the form.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132. 80 at 834, 64 at 390.'),
      K.seg('Case column', ['Wide 700', 'Half 636'], 0, 'Of the 1,296 box; the form takes the rest less the 76 gap. ' + b('At Half the form column is 584 and the field stays full width') + ' ⚑.'),
      K.seg('Form side', ['Right', 'Left'], 0, 'Which side the form takes. ' + b('The stack order at ≤ 833 is case then form at both values') + ' ⚑ — a form above the reason for it is a form nobody fills in.'),
      K.seg('Included list', ['Numbered rows', 'Ticks', 'Hide'], 0, 'A5·11’s two list treatments, carried. ' + b('Numbered rows suit four or more lines; ticks suit two') + '.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name. Email only by default ⚑.'),
      K.seg('Legal line', ['Show', 'Hide'], 0, 'Under the button, clamped to the form column. Authored, never generated ⚑.')
    ],
    settles: [
      `${b('No Field width control')} ⚑ — the field is the form column’s width, and a 400 px field in a 520 px column is this arrangement’s one ugly state. The column is the control.`,
      `${b('No vertical rule between the columns.')} A 76 px gap on a warm ground separates them, and a hairline down the middle of a two-column page reads as a table ⚑. Hairlines here belong to the numbered rows.`,
      `${b('Six controls and no seventh.')} Cut: a tier row (8 Tiers), an image column (7 Image Split), a card value (3 Card), and a sticky value — ${b('a pinned form column beside a scrolling case is 11 Rail')} ⚑.`
    ]
  },
  respCap: 'TABLET 834 · COLUMNS STACK AT 833, CASE FIRST · MOBILE 390 · SAME STACK, LIST BELOW THE FORM',
  tabletLabel: '834 · stacked · heading 36 · case measure 620 · form full width',
  mobileLabel: '390 · heading 28 · form full width · numbered rows at 12 px',
  mobileAccountLabel: '390 · /account/ · HEAD, THEN STACKED ROWS, THEN SIGN OUT',
  respNote: `Split’s ladder, unaltered: ${b('the two columns become one at 833')}, case first, form second. ${b('At ≤ 767 the included list moves below the form')} ⚑ — above it, four numbered rows push the field off a phone screen, and the field is what the page is for. That is this design’s one departure from the archetype, and the stated destination for the element that moves.`,
  darkNote: `A27’s step. ${b('The two columns share one ground')}, so nothing lifts and nothing gains a shadow ⚑; the only tuned values are the field’s fill, the numbered rows’ hairlines and the accent on the button. ${b('The mono numbers go to the muted token')} rather than staying at ${code('#6B6459')}, which is the commonest way a numbered list stops matching its pack in dark.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The case for membership in a 700 column with a numbered included list, and the form alone in a 520 column beside it. The left column is authored and never reacts to data.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · page · none · none · the case beside the form')}<br><span style="color:#6B6459">Archetype ${code('split')} rather than ${code('form')} because the arrangement, not the field, is the design. Media ${code('none')} — 7 Image Split is the same split with a picture column, and that slot is what separates them.</span>`),
    K.specRow(3, 'Archetype', 'split. Its ladder: side by side above 1023, stacked at 833. One departure — ' + b('the included list moves below the form at ≤ 767') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} 700 / 76 / 520; case measure 620; form the column’s full width; padding 96; account 420 / 40 / 836. ${b('834')} stacked, case measure 620, heading 36, padding 80. ${b('≤ 767')} heading 28, form full width, ${b('list below the form')} ⚑, padding 64, account rows stacked.`),
    K.specRow(5, 'Content fields', `As 1 Centred, plus nothing. ${code('heading')}’s limit is the one difference — ${b('60 characters here rather than 40')}, because the column takes two lines at 44 px ⚑. ${code('benefits[]')} is drawn at 0–6 and the numbered treatment is designed for four.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Case column (Wide 700 · Half 636) · Form side (Right · Left) · Included list (Numbered rows · Ticks · Hide) · Fields (Email only · Name and email) · Legal line (Show · Hide). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred. ${b('The case column is authored, never queried')}, so no data state can empty it ⚑. On /account/ the left column carries the member’s name and status and the right carries the rows; ${b('0, 1 or many tiers changes nothing in this design')} ⚑.`),
    K.specRow(8, 'Empty state', `No benefits → the list goes and the case column ends at the blurb; ${b('the 700 grid column is kept')} ⚑. No blurb → heading then list. ${b('Both columns empty is not reachable')}: the form is the form, and the heading defaults to the site title with “membership” appended ⚑.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM()),
    K.specRow(10, 'Accessibility notes', `${code('h1')} in the case column, ${code('<form>')} in the other; ${b('DOM order is case then form at both Form side values')} ⚑, which is why the stack order is fixed. The numbered list is a real ${code('<ol>')} and the mono numerals are ${code('aria-hidden')} ⚑ — the ordinal is the list’s, not the content’s. Field, button, sign-in link, then the list, in that order at every width.`),
    `${b('Flagged ⚑')} The heading copy (“for the price of a coffee”) is invented as fixture text and is not a default ⚑. The 76 px gap is this design’s own — A5·5’s split uses 40 — and is chosen because a form needs more separation from prose than a heading does ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 3 · Card
// ═══════════════════════════════════════════════════════════════════════
const d3 = {
  n: 3, name: 'Card',
  rail: 'A30 MEMBERS PAGES · DESIGN 3 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The whole page in one 560 card on the page ground: hairline, pack radius, warm shadow, 40 px of padding. The arrangement a reader recognises as a sign-in screen before they read a word of it.',
    'It is the design whose containment is the section itself rather than its contents, and the only one in A30 where the card is what the reader sees first.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · CARD 560 CENTRED · SURFACE ON PAGE · PADDING 40 INSIDE',
  accountGround: 'surface',
  body(t, w, o) {
    const t2 = t;
    const gp = K.ground(t, 'page');
    const g = K.ground(t, 'surface');
    const role = (o || {}).role;
    const cw = w === 1440 ? 560 : w === 834 ? 520 : 350;
    const pad = w === 390 ? 22 : 40;
    const card = inner => `<div style="width:${cw}px;margin:0 auto;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t2.dark ? '' : `box-shadow:${t2.shadow};`}padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column">${inner}</div>`;
    if (role === 'account') {
      const aw = w === 1440 ? 760 : w === 834 ? 640 : 350;
      const inner = `<div style="width:${aw}px;margin:0 auto;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t2.dark ? '' : `box-shadow:${t2.shadow};`}padding:${pad}px;box-sizing:border-box">${accountBlock(g, w, { labW:w === 1440 ? 168 : 140, max:560 })}</div>`;
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    const inner = card(`${pageHead(g, w, { align:'center', measure:cw - pad * 2, max:cw - pad * 2, hSize:w === 390 ? 26 : 32 })}
      ${K.gap(26)}
      ${K.formBlock(t, g, { state:'typed', full:true, center:true, legalMax:cw - pad * 2 })}
      ${K.gap(24)}${hair(g)}${K.gap(18)}
      ${K.benefitList(g, { n:3, gap:10, fs:14, tone:'muted', pack:PK })}`);
    return P.stdWrap(t, w, `<div style="display:flex;justify-content:center">${inner}</div>`, { role:'signup' });
  },
  primaryNote: `A19·3’s surface plane, carried: ${b('pack radius + 4, one hairline, the md warm shadow, and the shadow dropped in dark')} ⚑. ${b('The card is the section’s containment')} — the case the tuple’s ${code('card')} value is for — and everything inside it is the same field, button and list as 1 Centred at 32 px of heading instead of 40. ${b('Three included lines, not four')}: a 560 card with four ticks and a legal line runs past 640 px tall and stops looking like one object.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · CARD 760 · THE ROWS INSIDE THE PLANE',
  accountNote: `The card widens to 760 for the rows and keeps its padding. ${b('The rows’ hairlines are the card’s border token, one step lighter against the surface')} ⚑ — a hairline tuned for the page ground disappears on a plane. ${PORTALROW}`,
  accountStatesNote: `${b('The card’s height is its content')} ⚑ — a free member’s card is four rows tall and a paid member’s is six, and neither is padded to match the other. A card with a reserved empty row in it is the commonest defect in this arrangement.`,
  statesNote: `${b('The states are the card’s contents, not the card')} ⚑. Its width and padding never change; sent, expired and signed-in each replace the field block inside the same plane. ${b('The sent panel drops its own border inside the card')} ⚑ — a box inside a box is one border too many, so on this ground it is the plate colour alone.`,
  extraTile: SETTLE_STATES,
  stateForm(t, s) { return stateBody(t, s, { ground:'surface', pad:18 }); },
  controls: {
    name: 'Card', n: 3, count: 'SIX',
    sub: 'The page in one raised card.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'The page’s own padding around the card: 64 · 96 · 132. ' + b('The card’s inner padding is not a control') + ' — it is 40, 36 at 834, 22 at 390 ⚑.'),
      K.sel('Card width', 'Medium 560', 'Narrow 480 · Medium 560 · Wide 680. The account card is this value + 200 ⚑, because six rows need the room and the signup form does not.'),
      K.seg('Card depth', ['Raised', 'Flat'], 0, 'Raised is the md warm shadow; Flat is the hairline alone. ' + b('Forced to Flat in dark') + ' ⚑ — A19·3’s rule, and the hairline carries the plane there.'),
      K.seg('Included list', ['Inside the card', 'Below the card', 'Hide'], 0, 'Below the card puts the three lines on the page ground under it, which keeps the card at the size of a sign-in screen.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name. Email only by default ⚑.'),
      K.seg('Sign-in link', ['Inside the card', 'Below the card'], 0, 'Below the card is the pattern most readers have seen; inside keeps the card self-contained.')
    ],
    settles: [
      `${b('The card’s inner padding is not a control.')} Two padding controls in one panel is how a sidebar starts lying about which one is which ⚑; the page padding is the one a user means when they say the page is tight.`,
      `${b('No radius or border-width value')} ⚑ — both come from the pack, and a card with its own radius is the fastest way to make a Style Pack switch look broken.`,
      `${b('Two of the six place things relative to the card')} — Included list and Sign-in link — because that is the only decision this arrangement really offers. ${b('Everything else is 1 Centred’s panel')}, which is correct: the card is the design.`
    ]
  },
  respCap: 'TABLET 834 · CARD 520 · MOBILE 390 · THE CARD IS THE COLUMN, PADDING 22, SHADOW KEPT',
  tabletLabel: '834 · card 520 · inner padding 36 · heading 32',
  mobileLabel: '390 · card 350 · inner padding 22 · heading 26',
  mobileAccountLabel: '390 · /account/ · THE CARD HOLDS STACKED ROWS AT 22 PX OF PADDING',
  respNote: `Form’s ladder inside a fixed containment. ${b('The card never becomes edge-to-edge')} ⚑: at 390 it is 350 wide inside the 20 px margins with its radius and hairline intact. ${b('The inner padding steps 40 → 36 → 22')} and the heading 32 → 32 → 26; ${b('the shadow is kept at 390')} ⚑, because on a phone the card’s edge is the only thing telling a reader where the page ends.`,
  darkNote: `${b('Card depth is forced to Flat')} ⚑ and the ${code('#332E27')} hairline carries the plane; the surface lifts to ${code('#211D17')} one step above the ${code('#171511')} ground, which is A27’s step and the reason the card still reads as raised without a shadow. ${b('The field lifts again')} to the page ground colour inside the card — the one place in A30 where a field is darker than its container ⚑.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The whole membership page inside one centred surface card at the pack’s radius + 4 with a warm shadow, holding head, field and a three-line included list; the card widens for the account rows.'),
    K.specRow(2, 'Structural descriptor', `${code('form · card · page · none · none · a raised card holding the form')}<br><span style="color:#6B6459">Containment ${code('card')} — the section itself sits in one, which is the case the rule is for. Ground ${code('page')}: the card is on the page ground, and the card’s own surface is not the section’s ground ⚑.</span>`),
    K.specRow(3, 'Archetype', 'form. One departure: ' + b('the card does not go edge-to-edge at any width') + ' ⚑ — it keeps its 20 px margins, radius and hairline at 390.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} card 560 centred, inner padding 40, heading 32, account card 760. ${b('834')} card 520, inner 36, account card 640. ${b('≤ 767')} card = frame − 40, inner 22, heading 26, shadow kept, account rows stacked inside the card ⚑.`),
    K.specRow(5, 'Content fields', `As 1 Centred. ${code('benefits[]')} is drawn at ${b('three lines rather than four')} in this design ⚑ and a fourth is stored and not drawn — the field list is the category’s, and what a design draws from it is the design’s.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Card width (Narrow 480 · Medium 560 · Wide 680) · Card depth (Raised · Flat) · Included list (Inside the card · Below the card · Hide) · Fields · Sign-in link (Inside the card · Below the card). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred. ${b('The card’s height is its content at every member type')} ⚑ — four rows for a free member, six for a paid one, and no minimum height. Tiers are read and not drawn.`),
    K.specRow(8, 'Empty state', `No benefits at Inside the card → the hairline goes with the list and the card ends at the legal line. ${b('An empty card is not reachable')}: the form is always in it ⚑. No name on the member → the email fills the name slot and the avatar shows no initial.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM()),
    K.specRow(10, 'Accessibility notes', `The card is a plain ${code('<div>')} — ${b('not a region, not a dialog')} ⚑; it contains the page’s ${code('h1')} and the form. Focus order is unchanged by containment. ${b('The card’s hairline is not a focus indicator')}: the field’s own 1.5 px accent border and the button’s 2 px offset ring are ⚑, and both are drawn against the surface rather than the page ground.`),
    `${b('Flagged ⚑')} “Account card = signup card + 200” is invented arithmetic that keeps one control doing two jobs ⚑. Forcing Flat in dark is carried from A19·3 rather than re-derived here.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 4 · Panel
// ═══════════════════════════════════════════════════════════════════════
const d4 = {
  n: 4, name: 'Panel',
  rail: 'A30 MEMBERS PAGES · DESIGN 4 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The page on one raised plane the width of the content box, with the form centred on it and what is included in a row of four beneath a hairline. The same components as 1 Centred, on a different ground.',
    'It is the design for a site whose pages all sit on planes — the arrangement that makes the membership page look like the rest of the publication rather than like a form.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · PLANE 1,296 · FORM CENTRED ON 460 · BENEFITS FOUR UP',
  accountGround: 'surface',
  body(t, w, o) {
    const g = K.ground(t, 'surface');
    const role = (o || {}).role;
    const pw = w === 1440 ? 1296 : w === 834 ? 754 : 350;
    const pad = w === 1440 ? 56 : w === 834 ? 40 : 20;
    const plane = inner => `<div style="width:${pw}px;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t.dark ? '' : `box-shadow:${t.shadow};`}padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column">${inner}</div>`;
    if (role === 'account') {
      const inner = plane(`${accountBlock(g, w, { labW:w === 1440 ? 200 : 150, max:680 })}`);
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    const col = w === 1440 ? 460 : w === 834 ? 430 : 310;
    const inner = plane(`<div style="width:${col}px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center">
        ${pageHead(g, w, { align:'center', measure:col, max:col, hSize:w === 390 ? 26 : 36 })}
        ${K.gap(26)}
        ${K.formBlock(t, g, { state:'typed', full:true, center:true, legalMax:col })}</div>
      ${K.gap(w === 390 ? 26 : 34)}${hair(g)}${K.gap(w === 390 ? 20 : 26)}
      ${benefitGrid(g, w, w === 1440 ? 4 : w === 834 ? 2 : 1)}`);
    return P.stdWrap(t, w, inner, { role:'signup' });
  },
  primaryNote: `${b('The plane is the section’s ground, not its containment')} ⚑ — A26·3 and A27·4’s call, carried: a full-width raised area is a ground, and the tuple says ${code('surface')} rather than ${code('card')} because of it. The form keeps 1 Centred’s geometry on a 460 measure; ${b('the four included lines become a four-column row')} with mono ordinals, which is the arrangement the plane’s width earns.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE PLANE HOLDS THE ROWS AT 200 PX OF LABEL COLUMN',
  accountNote: `On the plane the rows get a wider label column — ${b('200 rather than 168')} ⚑ — because the plane’s own padding has already narrowed the value column, and a value that wraps beside a label that does not is the row treatment’s one failure mode. ${PORTALROW}`,
  accountStatesNote: `${b('The plane holds its width and loses height')} ⚑ as rows drop out. Free is four rows, comped four with no billing hand-off, cancelled six with “Ends” in place of “Renews”. ${b('No row is ever drawn empty to keep the plane square')} ⚑.`,
  statesNote: `${b('One plane, seven contents.')} The states sit on the surface ground, so ${b('the sent and expired panels use the page ground colour as their plate')} ⚑ — inverted from 1 Centred, where the plate is the surface. The rule is one step of separation from whatever is behind, in whichever direction is available.`,
  extraTile: SETTLE_STATES,
  stateForm(t, s) { return stateBody(t, s, { ground:'surface', pad:18 }); },
  controls: {
    name: 'Panel', n: 4, count: 'SIX',
    sub: 'The page on one raised plane.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'Above and below the plane: 64 · 96 · 132. The plane’s own inner padding is 56 · 40 · 20 by width and is not a control ⚑.'),
      K.seg('Plane width', ['Content box 1,296', 'Held 1,040'], 0, 'Held centres a narrower plane in the same box, which suits a page with only a form on it.'),
      K.seg('Plane depth', ['Raised', 'Flat'], 0, 'md warm shadow, or the hairline alone. ' + b('Forced to Flat in dark') + ' ⚑.'),
      K.seg('Included row', ['Four up', 'Two up', 'Hide'], 0, 'Under a hairline inside the plane. ' + b('Four up needs four authored lines') + ' — with three it draws three columns and the row is left-aligned, never justified ⚑.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name. Email only by default ⚑.'),
      K.seg('Legal line', ['Show', 'Hide'], 0, 'Under the button, centred with it on the plane.')
    ],
    settles: [
      `${b('Plane width, not form width.')} The form is 460 at both values ⚑ — a field that grows with its container is the one thing this arrangement must not do, because a 900 px email field looks like a mistake.`,
      `${b('No ground value here.')} This design ${b('is')} the surface ground; a Page value would make it 1 Centred and a Contrast value would make it 5 Contrast Band ⚑. Two designs that differ by one control value are one design.`,
      `${b('The included row is the plane’s reason to be this wide')} ⚑. At Hide the panel names 3 Card as the better design, because a 1,296 plane holding a 460 form and nothing else is a lot of surface for one field.`
    ]
  },
  respCap: 'TABLET 834 · PLANE 754, BENEFITS TWO UP · MOBILE 390 · PLANE 350, BENEFITS STACK, PADDING 20',
  tabletLabel: '834 · plane 754 · inner 40 · benefits two up',
  mobileLabel: '390 · plane 350 · inner 20 · benefits stacked',
  mobileAccountLabel: '390 · /account/ · THE PLANE HOLDS STACKED ROWS · LABEL COLUMN GONE',
  respNote: `${b('The plane is always the content box')} ⚑ — 1,296, then 754, then 350 — so it narrows with the page and never goes edge-to-edge. ${b('The included row steps four → two → one')} at the two breakpoints, which is the grid-of-N ladder even though this design is a form. ${b('The plane’s inner padding is 56 → 40 → 20')}: at 390 it matches the page margin exactly, so the form’s left edge sits where every other section’s does ⚑.`,
  darkNote: `The plane lifts to ${code('#211D17')} on the ${code('#171511')} ground with ${b('the shadow dropped and Plane depth forced to Flat')} ⚑. ${b('The field goes the other way')} — down to the page ground colour — so the one-step rule holds in both modes without either element inverting. Mono ordinals to ${code('#A79E8F')}.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'One raised plane the width of the content box carrying a centred 460 form and a four-column included row under a hairline. The same components as 1 Centred with the section’s ground changed.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · surface · none · none · the page on one raised plane')}<br><span style="color:#6B6459">Containment ${code('none')} and ground ${code('surface')} — a full-width plane is a ground, not a containment: A26·3 and A27·4’s call ⚑. That is the whole distinction from 3 Card, and it is a visible one at rest.</span>`),
    K.specRow(3, 'Archetype', 'form. No departures; the plane narrows with the content box and the included row follows the grid ladder.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,296 on a 72 margin, inner 56, form 460, benefits four up, padding 96. ${b('834')} plane 754, inner 40, form 430, benefits two up, padding 80. ${b('≤ 767')} plane 350, inner 20, form full width, benefits stacked, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Centred. ${code('benefits[]')} is the field this design leans on — ${b('four authored lines is what the row is designed for')}, three draws three columns left-aligned, and none hides the row and its hairline ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Plane width (Content box 1,296 · Held 1,040) · Plane depth (Raised · Flat) · Included row (Four up · Two up · Hide) · Fields · Legal line. Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred; tiers read and not drawn. On /account/ the plane holds the rows and ${b('the label column widens to 200')} ⚑. 0, 1 and many tiers are all the same page here.`),
    K.specRow(8, 'Empty state', `No benefits → hairline and row both go and the plane shortens to the form. ${b('The plane itself is never hidden')} ⚑ — it is the ground, and a section with no ground is 1 Centred. Free and comped members drop rows as in 1.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM()),
    K.specRow(10, 'Accessibility notes', `The plane is a ${code('<div>')} and not a landmark ⚑. ${code('h1')}, then the form, then the included row as a ${code('<ul>')} with the mono ordinals ${code('aria-hidden')}. ${b('Focus rings are drawn against the surface')}, where the accent measures 4.4:1 on ${code('#FFFFFF')} — checked, and the reason the ring is 2 px rather than 1.5 ⚑.`),
    `${b('Flagged ⚑')} “Held 1,040” is an invented second plane width ⚑. The 200 px account label column is this design’s own and is not shared with 1 Centred’s 168 ⚑.`
  ]]
};

globalThis.A30D = (globalThis.A30D || []).concat([d1, d2, d3, d4]);
})();
