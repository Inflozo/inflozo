// A30-0 Category Proof — settlements, tokenisation proof, stress frame, roster, fields, components, findings.
globalThis.A30PROOF = (function () {
const K = globalThis.A30LIB, P = globalThis.A30PAGE;
const { L, D, MONO, PACKS, b, code, cap, note, section, tile, table, COPY, BENEFITS, TIERS, MEMBER } = K;

/* ── the tokenisation proof · 3 Card in three packs, light and dark ───── */
function proofCell(pk, dark) {
  const t = dark ? pk.d : pk.l;
  const g = K.ground(t, 'surface', pk);
  const pad = 24;
  const body = `<div style="background:${t.bg};border-radius:${pk.r + 6}px;padding:26px;box-sizing:border-box;width:640px;${dark ? `border:1px solid ${t.border};` : 'box-shadow:0 6px 22px rgba(28,27,26,.10);'}">
    <div style="width:480px;margin:0 auto;background:${g.bg};border:1px solid ${g.border};border-radius:${pk.r + 4}px;${dark ? '' : `box-shadow:${t.shadow};`}padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;text-align:center">
      ${K.eyebrow(g, COPY.eyebrow, pk)}${K.gap(10)}
      ${K.heading(g, COPY.heading, 26, pk, 'h3')}${K.gap(16)}
      ${K.formBlock(t, g, { state:'typed', full:true, center:true, pack:pk, legal:false, legalMax:420 })}
      ${K.gap(18)}<div style="width:100%;height:1px;background:${g.border}"></div>${K.gap(14)}
      <div style="width:100%;text-align:left">${K.benefitList(g, { n:2, gap:9, fs:14, tone:'muted', pack:pk })}</div>
    </div></div>`;
  return `<div style="display:flex;flex-direction:column;gap:8px">
    <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${pk.name.toUpperCase()} · ${dark ? 'DARK' : 'LIGHT'} · RADIUS ${pk.r} · ${pk.head.replace(/'/g, '').split(',')[0].toUpperCase()}</span>${body}</div>`;
}

/* ── the stress frame · worst realistic content, drawn on 8 Tiers ─────── */
function stressFrame() {
  const t = L, g = K.ground(t, 'page');
  const STRESS_TIERS = [
    { name:'Free', m:'¥0', y:'¥0', blurb:'Two open pieces a month and the Friday letter.', bens:[], cta:'Sign up free', free:true },
    { name:'Member', m:'¥1,200', y:'¥12,000', blurb:'', bens:[], cta:'Choose Member' },
    { name:'Patron, with the printed quarterly and the annual index', m:'¥3,600', y:'¥36,000',
      blurb:'All of Member, the printed quarterly, the annual index, your name in the back of both, and an invitation to the two reader evenings we run each year in London and online.',
      bens:[], cta:'Choose Patron' },
    { name:'Institutional', m:'¥18,000', y:'¥180,000', blurb:'Up to twenty readers on one invoice.', bens:[], cta:'Enquire' }
  ];
  const rows = STRESS_TIERS.map((tr, i) => `<div style="display:flex;align-items:center;gap:20px;padding:20px 0;border-top:1px solid ${g.border}">
    <div style="display:flex;flex-direction:column;gap:5px;flex:1;min-width:0">
      <span style="font-family:Georgia,serif;font-size:19px;font-weight:700;line-height:1.25;color:${g.text};text-wrap:pretty">${tr.name}</span>
      ${tr.blurb ? `<span style="font-size:14px;line-height:1.5;color:${g.muted};max-width:640px;text-wrap:pretty">${tr.blurb}</span>` : ''}</div>
    <span style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:${g.text};font-variant-numeric:tabular-nums;white-space:nowrap">${tr.m}${tr.free ? '' : '<span style="font-size:13px;font-weight:400;color:#6B6459"> / mo</span>'}</span>
    <span style="height:44px;display:inline-flex;align-items:center;background:${tr.free ? 'transparent' : g.btnBg};border:${tr.free ? `1px solid ${g.border}` : 'none'};color:${tr.free ? g.text : g.btnText};font-size:14px;font-weight:600;padding:0 18px;border-radius:${g.r}px;flex-shrink:0">${tr.free ? 'Free' : 'Choose'}</span>
    <span style="font-family:${MONO};font-size:9.5px;color:#B0A79A;width:186px;text-align:right;flex-shrink:0">${
      i === 0 ? 'NO BENEFITS ON THE TIER · THE ROW IS NAME AND PRICE' :
      i === 1 ? 'NO DESCRIPTION · THE ROW CLOSES UP, NOTHING RESERVED' :
      i === 2 ? '54-CHAR TIER NAME · 190-CHAR DESCRIPTION · BOTH WRAP' : 'A FOURTH TIER · ROWS, NEVER A 4-UP OF CARDS ⚑'}</span></div>`).join('');
  const inner = `<div style="display:flex;flex-direction:column">
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center">
      <span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted}">Membership</span>
      <div style="height:14px"></div>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:40px;font-weight:700;line-height:1.08;letter-spacing:-0.03em;color:${g.text};max-width:820px;text-wrap:pretty">Support independent reporting on infrastructure, procurement and the long tail of municipal maintenance</h1>
      <div style="height:8px"></div>
      <span style="font-family:${MONO};font-size:10px;color:${g.muted}">A 104-CHARACTER HEADING · IT WRAPS TO THREE LINES AND NOTHING IS TRUNCATED ⚑</span>
      <div style="height:22px"></div>
      ${K.periodToggle(g, { period:'yearly' })}</div>
    <div style="height:30px"></div>
    ${rows}
    <div style="height:34px"></div>
    <div style="border-top:1px solid ${g.border};padding-top:26px;display:flex;gap:40px;align-items:flex-start;justify-content:space-between">
      <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
        <span style="font-family:Georgia,serif;font-size:19px;font-weight:700;color:${g.text}">Only want the free letter?</span>
        <span style="font-size:14px;line-height:1.55;color:${g.muted}">The Friday letter and two open pieces a month, at no cost.</span></div>
      <div style="width:520px"><div style="display:flex;align-items:flex-end;gap:10px;width:100%">${K.field(g, { state:'typed', value:'marta.kovacs-fernandez@institute-for-municipal-studies.example.org' })}${K.btn(g, { label:'Sign up free', minW:150 })}</div>
        <div style="height:8px"></div><span style="font-family:${MONO};font-size:9.5px;color:#B0A79A">A 63-CHARACTER ADDRESS · THE FIELD CLIPS AND KEEPS THE WHOLE STRING IN THE DOM ⚑ (A18·3’S RULE)</span></div></div></div>`;
  return K.frame(L, 1440, P.stdWrap(L, 1440, inner, { role:'signup' }));
}

function accountStress() {
  const t = L, g = K.ground(t, 'page');
  const ROWS = [
    { l:'Signed in as', v:'marta.kovacs-fernandez@institute-for-municipal-studies.example.org', a:'Change email', portal:true },
    { l:'Plan', v:'Patron, with the printed quarterly and the annual index · ¥36,000 a year', a:'Change plan', portal:true },
    { l:'Ends', v:'14 September 2026', note:'cancelled and comped at once — the gift outlives the cancellation ⚑' },
    { l:'Newsletters', v:'The Friday letter · The Tuesday note · Weekend long reads · Corrections · Events', a:'Manage', portal:true },
    { l:'Member since', v:'2 January 2019' }
  ];
  return `<div style="width:1288px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:22px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.05em;color:#6E6A64">THE ACCOUNT PAGE’S WORST REALISTIC CONTENT · DRAWN ON 1 CENTRED’S ROW TREATMENT AT 900</span>
    <div style="display:flex;align-items:center;gap:14px">
      <span style="width:44px;height:44px;border-radius:44px;background:${t.hover};border:1px solid ${g.border};display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:${g.muted}"></span>
      <div style="display:flex;flex-direction:column;gap:5px;min-width:0">
        <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap">
          <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-0.02em;color:${g.text};overflow-wrap:anywhere">marta.kovacs-fernandez@institute-for-municipal-studies.example.org</span>
          <span style="display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:8px;font-size:12.5px;font-weight:600;border:1px solid ${g.border};color:${g.muted}">Complimentary</span></div>
        <span style="font-size:14px;color:${g.muted}">No name on the member record · member since 2 January 2019</span></div></div>
    <div style="width:900px;display:flex;flex-direction:column">${ROWS.map(r => K.accountRow(g, { row:r, labW:200 })).join('')}</div>
    <span style="font-family:${MONO};font-size:9.5px;color:#B0A79A">NO NAME · A 63-CHARACTER EMAIL IN THE NAME SLOT AT 26 PX, WRAPPING · AN EMPTY AVATAR WITH NO INITIAL ⚑ · FIVE NEWSLETTERS ON ONE LINE, WRAPPING · COMPED AND CANCELLED AT ONCE</span></div>`;
}

function build() {
  let out = K.DOC_HEAD;
  out += K.intro({
    rail: 'A30 MEMBERS PAGES · CATEGORY PROOF · 13 DESIGNS · PAPER PACK · DRAWN 23 AUGUST 2026 · CONTROLS RECONCILED 25 AUGUST 2026',
    title: 'A30 Members Pages — the category',
    paras: [
      'Thirteen full-page membership designs. Each one draws three routes: the signup page, the sign-in page, and the account page — one design, one field list, three arrangements, because a publication picks a design and gets all three.',
      'The category’s boundary is the thing to read first. <strong style="font-weight:600">Signup and sign-in are themeable; the account page is display-only; everything that changes a subscription is Ghost’s Portal.</strong> Every frame in the category carries that line, and no control in any design moves it.',
      'This frame carries what belongs to the category rather than to any one design: the four questions §8 asked, the tokenisation proof, the stress frames, the roster with its thirteen structural descriptors, the shared field list, the component inventory and the findings for the architect. ' +
      'The per-design frames are <a href="./A30-1 Centred.dc.html">A30-1</a> … <a href="./A30-13 Steps.dc.html">A30-13</a>, and the written specification is <code style="font-family:\'JetBrains Mono\',monospace;font-size:14px">A30 Members Pages - Spec.md</code>.'
    ]
  });

  // ── settlements ─────────────────────────────────────────────────────
  const st = [
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'1 · WHICH PAGES ARE THEMEABLE, AND WHICH ARE PORTAL’S',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('Themed:')} ${code('/signup/')}, ${code('/signin/')} and ${code('/account/')} — Ghost pages on ${code('custom-signup.hbs')}, ${code('custom-signin.hbs')} and ${code('custom-account.hbs')} ⚑. A30 draws all three, and each frame in the category names which one it is.</span>
      <span>${b('Portal’s:')} Stripe checkout, plan changes, billing and card detail, email changes, newsletter preferences, and the account panel Ghost opens from its own floating button. ${b('None of it is themeable and none of it is drawn here')} ⚑ — the theme draws the trigger and Portal draws the rest, over the page.</span>
      <span>${b('So the account page is a summary with hand-offs')}, and that is a platform fact rather than a design choice ⚑. Every action on it that would write something is an outline button with ${code('PORTAL ↗')} beside it, in all thirteen designs.</span></div>` }),
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'2 · THE FORM STATES, INCLUDING SENT AND EXPIRED',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('Seven states, drawn by every design:')} sign-in · sent · expired · invalid · focus · already-signed-in · no-JavaScript. ${b('Sending is an eighth and is the button’s label change alone')} ⚑.</span>
      <span>${b('Sent replaces the field in place')} with a panel carrying the address back and “Send another link” ⚑ — never a disabled field with a message under it. ${b('Expired is read from the query string')} (${code('?action=signin&success=false')}), so it is ${b('JS-only')} ⚑, and without JavaScript a reader gets the plain form, which is the same recovery in one step fewer.</span>
      <span>${b('Invalid is the browser first')} — ${code('type="email"')} — ${b('then Ghost’s reply')}; no theme-side domain checking ⚑. ${b('A signed-in member never sees a signup form')}: the route draws the membership summary instead ⚑.</span></div>` }),
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'3 · THE ACCOUNT PAGE FOR FREE, PAID AND COMPED',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('Paid:')} signed in as · plan and price · renews · payment (Stripe) · newsletters · member since. ${b('Free:')} the same list without price, renewal or payment — ${b('four rows, and the absent rows are absent, not empty')} ⚑. ${b('Comped:')} plan reads “Member · complimentary” with ${b('no billing hand-off at all')} ⚑, because there is nothing to bill.</span>
      <span>${b('Cancelled but still running is the fourth member every account page meets')} ⚑ — “Renews” becomes “Ends”, the action becomes Resume, and access is stated as full until the date. ${code('cancel_at_period_end')} is the flag, and it is the one subscription field a theme must read rather than print.</span>
      <span>${b('No card detail ever reaches a theme')} ⚑, so “Payment · Managed by Stripe” is the whole row. ${b('Every design draws these rows; only their arrangement differs')}, which is what makes switching designs safe.</span></div>` }),
    tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'4 · THE A1·14 ASSUMPTION · TIER AND RENEWAL DATE ARE READABLE',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('Confirmed, with one qualification.')} A1·14’s member pill assumed a theme can read the member’s tier name and renewal date. ${b('The tier name is readable')} ⚑ — it is on the member’s subscription — ${b('and so is the current period’s end date')}, which is what “renews on” means.</span>
      <span>${b('The qualification: “renews” and “ends” are the same field')} ⚑. Which word is correct depends on ${code('cancel_at_period_end')}, so ${b('a theme that prints “Renews” unconditionally will lie to every cancelling member')} — the commonest members-page defect, and the reason this is a settlement rather than a note.</span>
      <span>${b('Also readable:')} status (free · paid · comped), price and interval, newsletter subscriptions, join date. ${b('Not readable:')} card detail, invoices, Stripe customer state, and ${b('the number of days left')} ⚑ — that is arithmetic a theme should not do on a date it did not compute.</span></div>` })
  ];
  out += section('A30 settlements', cap('THE FOUR QUESTIONS §8 ASKED, ANSWERED') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${st.join('')}</div>`);

  // ── pack proof ──────────────────────────────────────────────────────
  const cells = [];
  ['paper', 'studio', 'garden'].forEach(k => { cells.push(proofCell(PACKS[k], false)); cells.push(proofCell(PACKS[k], true)); });
  out += section('A30 pack proof', cap('THE TOKENISATION PROOF · 3 CARD IN THREE PACKS, LIGHT AND DARK · ONE FUNCTION, SIX TOKEN OBJECTS') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${cells.join('')}</div>` +
    note(`${b('Nothing moved.')} Six frames, one function, six token objects: ground, surface, text, muted, border, accent, contrast, a radius and a font pair. ${b('The card, the field and the button all read the same radius token')} ⚑ — Studio at 2 makes a rectangular form and Garden at 20 a rounded one, and neither needed a nudge. ${b('The field is one step from its container in every pack and both modes')}: page ground behind a surface card in light, and the ground colour inside a lifted card in dark ⚑. ${b('The accent appears exactly once per frame')} — the button — and was re-checked in all six: Studio’s blue on white measures 4.6:1 with white text, Garden’s green 4.8:1, Paper’s ${code('#D96C3F')} 4.4:1 ⚑, which is why the button’s label is 15 px and 600 rather than 14.`));

  // ── stress ──────────────────────────────────────────────────────────
  out += section('A30 stress', cap('THE STRESS FRAME · THE WORST REALISTIC CONTENT THIS CATEGORY WILL MEET · DRAWN ON 8 TIERS') +
    stressFrame() +
    note(`${b('Four tiers, a 54-character tier name, a 190-character description, a tier with no description at all, prices in yen at five figures, a 104-character heading and a 63-character email address')} ⚑ — every one of them a thing a real publication has. ${b('The four tiers force the row arrangement')}: three cards is the design, four is rows, and there is no 4-up ⚑. ${b('The tier with no description closes up')} rather than reserving a line, so the rows are three different heights and that is correct.`) +
    accountStress() +
    note(`${b('And the state that breaks every design in the category: a member with no name.')} Ghost’s signup asks for an email and nothing else, so ${b('most members have no name')} ⚑ — the email goes in the name slot, ${b('the avatar draws no initial rather than a “?”')} ⚑, and 9 Big Type sets a 63-character address at 72 px, which is the one place the library’s display ladder meets a string it cannot flatter. ${b('Refused: truncation, an “Untitled member” fallback, a generated initial, and a fixed row height')} ⚑ — all four lie about the record. ${b('Comped and cancelled at once')} is the edge Ghost allows and no design assumed: the gift outlives the cancellation, so the row reads “Ends” with no billing action beside it ⚑.`));

  // ── roster ──────────────────────────────────────────────────────────
  const roster = [
    ['1', 'Centred', 'form · none · page · none · none · one centred column', '9', 'member-form'],
    ['2', 'Split Pitch', 'split · none · page · none · none · the case beside the form', '10', 'member-form'],
    ['3', 'Card', 'form · card · page · none · none · a raised card holding the form', '9', 'member-form'],
    ['4', 'Panel', 'form · none · surface · none · none · the page on one raised plane', '10', 'member-form'],
    ['5', 'Contrast Band', 'form · none · contrast · none · none · the page as an inverted band', '11', 'member-form'],
    ['6', 'Cover', 'form · none · image · none · background · the form over a photograph', '10', 'member-form'],
    ['7', 'Image Split', 'split · none · page · none · edge · a picture column to the page edge', '10', 'member-form'],
    ['8', 'Tiers', 'grid-of-N · none · page · few · none · tier cards above the form', '10', 'member-form · price-toggle'],
    ['9', 'Big Type', 'stack · none · page · none · none · the promise at display size', '8', 'member-form'],
    ['10', 'Boxed', 'form · box · page · none · none · one hairline box on the ground', '9', 'member-form'],
    ['11', 'Rail', 'edge rail · none · page · few · none · a pinned rail beside the page', '9', 'member-form · scroll-spy'],
    ['12', 'Ledger', 'stack · none · page · many · none · what is included as ruled rows', '6', 'member-form'],
    ['13', 'Steps', 'stack · none · surface · few · none · the signup as numbered steps', '10', 'member-form']
  ].map(r => [r[0], r[1], `<code style="font-family:${MONO};font-size:11.5px">${r[2]}</code>`, r[3], r[4]]);
  out += section('A30 roster', cap('THE ROSTER · THIRTEEN DESIGNS, THIRTEEN STRUCTURAL DESCRIPTORS') +
    table({ cols:['#', 'DESIGN', 'TUPLE', 'CTL', 'MODULES'], widths:[32, 148, 700, 40, 300], rows:roster }) +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
      tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'TUPLE UNIQUENESS · THE HONEST STATEMENT', body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
        <span>${b('All thirteen are distinct on the five closed slots')} ⚑, and ${b('two slots do most of the work')}. ${b('Containment separates 1, 3 and 10')} — ${code('none')}, ${code('card')}, ${code('box')} — and ${b('ground separates 1, 4 and 5')} — ${code('page')}, ${code('surface')}, ${code('contrast')}. Those five designs are deliberately the same components five ways, which is the case the ground and containment slots exist for.</span>
        <span>${b('Media separates the two picture designs')}: ${code('background')} in 6 Cover against ${code('edge')} in 7 Image Split. ${b('Item-count separates the three that repeat something')} — ${code('few')} in 8 Tiers and 11 Rail, ${code('many')} in 12 Ledger — and ${b('archetype separates those two fews')}.</span>
        <span>${b('Containment is none in ten of thirteen')} ⚑. 8 Tiers’ cards and 13 Steps’ tier boxes are the ${b('items’')} geometry, not the section’s — A21·2’s rule, and the slot most easily got wrong.</span></div>` })}${
      tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'WHAT THE CHECK CANNOT PROMISE', body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
        <span>${b('9 Big Type and 12 Ledger are both stacks on the page ground')} and are separated by item-count alone; what actually distinguishes them is scale against enumeration, and ${b('no machine reads that')}. ${b('2 Split Pitch and 7 Image Split are the same split')} with prose or a photograph in the second column.</span>
        <span>${b('13 Steps and 4 Panel are both forms on a plane')} — the tuple separates them on archetype and item-count, and the emphasis phrase carries the rest. ${b('1 Centred and 3 Card are one design in two containments')}, which is a real and visible difference at rest and a thin one written down.</span>
        <span>${b('Each design’s panel names the ones it is closest to, by number')} ⚑, and says which control value would turn it into its neighbour. That is the honest version of a uniqueness claim.</span></div>` })}</div>`);

  // ── shared field list ───────────────────────────────────────────────
  const F = [
    ['eyebrow', 'text', 'opt', '24 ch', 'all but 12', 'Default “Membership” ⚑'],
    ['heading', 'text', 'opt', '60 ch', 'all 13', '<strong style="font-weight:600">9 Big Type caps it at 60 in the editor</strong> ⚑; 2 draws two lines at 44'],
    ['blurb', 'text', 'opt', '240 ch', 'all 13', '12 Ledger draws it as the price sentence beside the form ⚑'],
    ['emailLabel', 'text', 'opt', '24 ch', 'all 13', 'Default “Your email”'],
    ['placeholder', 'text', 'opt', '40 ch', 'all 13', 'Default “you@example.com”'],
    ['ctaLabel', 'text', 'opt', '24 ch', 'all 13', 'Default “Continue” ⚑ — not “Subscribe”, because a paid tier continues in Portal'],
    ['note', 'text', 'opt', '90 ch', 'all but 8, 12', 'Default “We send a sign-in link. There is no password to remember.”'],
    ['legal', 'text', 'opt', '160 ch', 'all 13', '<strong style="font-weight:600">Authored, never generated</strong> ⚑ — a theme does not know a publication’s terms'],
    ['signinPrompt · signinLinkLabel', 'text', 'opt', '30 · 24 ch', 'all 13', 'Defaults “Already a member?” · “Sign in”'],
    ['signupPrompt · signupLinkLabel', 'text', 'opt', '30 · 24 ch', 'all 13', 'The sign-in route’s pair; defaults “New here?” · “Start a membership”'],
    ['signinHeading · signinBlurb · signinCta', 'text', 'opt', '60 · 240 · 24 ch', 'all 13', 'The sign-in route’s own head; default CTA “Send the link”'],
    ['sentHeading · sentText · sentAgainLabel', 'text', 'opt', '40 · 200 · 24 ch', 'all 13', '<strong style="font-weight:600">{email} and {hours} are the only tokens</strong> ⚑'],
    ['expiredHeading · expiredText', 'text', 'opt', '40 · 200 ch', 'all 13', 'Read at ?action=signin&success=false — JS-only ⚑'],
    ['invalidText', 'text', 'opt', '90 ch', 'all 13', 'Default “That address doesn’t look right.”'],
    ['benefits[]', 'list 0–6', 'opt', 'name 60 ch · detail 90 ch', '1, 2, 3, 4, 5, 7, 10, 11, 12', '<strong style="font-weight:600">The category’s only authored list</strong> ⚑ — <strong style="font-weight:600">the detail is drawn only by 12 Ledger</strong>; 6, 8, 9, 13 store it'],
    ['benefitsLabel', 'text', 'opt', '24 ch', 'as benefits[]', 'Default “What a membership includes”; “Included” in 10 Boxed ⚑'],
    ['image · imageAlt · imageFocus', 'image · text · enum', '<strong style="font-weight:600">req in 6</strong>', '≥ 2,400 px · 120 ch · —', '6, 7', '<strong style="font-weight:600">Required in 6 Cover, optional in 7 Image Split</strong> ⚑; focus is a field, not a control'],
    ['accountHeading · accountBlurb', 'text', 'opt', '60 · 240 ch', 'all 13', '2 Split Pitch is the design they exist for'],
    ['rowLabels (six)', 'text', 'opt', '24 ch each', 'all 13', 'Signed in as · Plan · Renews · Payment · Newsletters · Member since ⚑'],
    ['endsLabel', 'text', 'opt', '24 ch', 'all 13', 'Default “Ends” — <strong style="font-weight:600">used when cancel_at_period_end is true</strong> ⚑'],
    ['signOutLabel · portalNote', 'text', 'opt', '24 · 200 ch', 'all 13', 'The note explaining that plan and billing open Portal'],
    ['tierNote · freeRowHeading · freeRowText · freeCtaLabel', 'text', 'opt', '90 · 40 · 120 · 24 ch', '8', 'The free row beneath the cards'],
    ['periodLabels', 'text', 'opt', '12 ch × 2', '8', 'Defaults “Monthly” · “Yearly”'],
    ['railLabels (four)', 'text', 'opt', '24 ch each', '11', 'Membership · Newsletters · Billing · Sign out ⚑ — <strong style="font-weight:600">labels only; the rows are fixed</strong>'],
    ['stepLabels (three) · stepThreeText', 'text', 'opt', '40 ch each · 160 ch', '13', 'Defaults as drawn ⚑'],
    ['<em>@member</em>', 'Ghost', 'req', '—', 'all 13 on /account/', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">email · name · status · created_at · subscriptions · newsletters</code>'],
    ['<em>subscription</em>', 'Ghost', 'opt', '—', 'all 13 on /account/', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">tier.name · price · interval · current_period_end · cancel_at_period_end</code> ⚑'],
    ['<em>tiers</em>', 'Ghost', 'opt', '—', '8, 13', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">name · monthly_price · yearly_price · currency · description · benefits</code> — <strong style="font-weight:600">read by all 13, drawn by 2</strong>'],
    ['<em>@site.title</em>', 'Ghost', 'req', '—', 'all 13', 'The heading’s fallback and the form’s accessible name ⚑']
  ];
  out += section('A30 fields', cap('THE SHARED FIELD LIST · THE CONTRACT THAT MAKES DESIGN-SWITCHING SAFE') +
    table({ cols:['FIELD', 'TYPE', 'REQ', 'LIMIT', 'USED BY', 'NOTES'], widths:[268, 108, 66, 150, 152, 508], rows:F }) +
    note(`${b('Twenty-five authored field groups and four things read from Ghost.')} A design may draw six of them — 9 Big Type draws a heading, a field, a button and a blurb — but ${b('none needs a field the category does not have')}, so switching between any two of the thirteen preserves everything the user typed. ${b('Three fields are drawn by exactly one design each')} — the benefit detail (12), the rail labels (11), the step labels (13) — ${b('and all three are stored by the other twelve')} ⚑. ${b('The account rows are the same six in every design')}, which is what makes the account page safe to re-skin: only the arrangement changes.`));

  // ── component inventory ─────────────────────────────────────────────
  const CI = [
    ['Email field, 46 px', 'Label above at 13/500, hairline border, 15 px value, 1.5 px accent border on focus', '<strong style="font-weight:600">A30</strong> (1) · A16’s field height'],
    ['Magic-link sent panel', 'Plate fill, heading-font 22, the address echoed, “Send another link” outline button', '<strong style="font-weight:600">A30</strong> (1)'],
    ['Link-expired panel', 'The sent panel’s geometry with the form beneath it, read from the query string', '<strong style="font-weight:600">A30</strong> (1)'],
    ['Signed-in summary', 'Avatar, name, tier line, and two actions — what a signup route draws for a member', '<strong style="font-weight:600">A30</strong> (1)'],
    ['Account row', 'Label column, value, and an outline action with PORTAL ↗ where it leaves the theme', '<strong style="font-weight:600">A30</strong> (1)'],
    ['Portal hand-off tag', '9.5 px mono “PORTAL ↗” beside any action that opens Ghost’s Portal', '<strong style="font-weight:600">A30</strong> (1)'],
    ['Status badge', '26 px pill: accent fill for paid, hairline and muted for free and complimentary', '<strong style="font-weight:600">A30</strong> (1)'],
    ['Boundary strip', 'The mono line on every frame naming the route, its template and what Portal owns', '<strong style="font-weight:600">A30</strong> (0)'],
    ['Period toggle', 'Two named cells in a plate, 44 px, Monthly and Yearly — never a switch', '<strong style="font-weight:600">A30</strong> (8)'],
    ['Step ordinal chip', '34 px square at the pack radius: filled for done or true, outlined for next', '<strong style="font-weight:600">A30</strong> (13)'],
    ['Tier card', 'Name, price at 38 in the heading font, blurb, three benefits, full-width button', 'A7 (1)'],
    ['Tier row', 'The card as a hairline row: name and blurb left, price and button right', 'A7 (3)'],
    ['Tick list', '✓ glyph at 14 px muted, 15 px lines, 10 px gaps', 'A5 (11)'],
    ['Numbered rows', 'Mono ordinal in a 26 px column, name, one muted line, over a hairline', 'A9 (15)'],
    ['Directory column', 'A 240 px list column of 44 px rows beside a content column', 'A12 (10)'],
    ['Split head', 'Two columns of the content box with a stated gap, stacking at 833', 'A5 (5)'],
    ['Surface plane', 'Pack radius + 4, one hairline, md shadow at Raised, forced Flat in dark', 'A19 (3) · A29 (4)'],
    ['Warm scrim', 'A flat wash of the pack’s text colour at 30 / 45 / 60 %, never black', 'A20 (13)'],
    ['On-contrast derivation', 'muted 72 % · hairline 20 % · plate 8 % of the band’s carried colour', 'A17 (7)'],
    ['Primary button', 'Accent fill, 15 px/600, the pack radius, 46 px on a members page', 'A1 (1)'],
    ['Ghost action / outline button', 'Hairline border, text label, 38 px in a row and 46 px in a form', 'A1 (1)'],
    ['Avatar with initials fallback', 'Circle at the plate colour with the initial in the heading font', 'A1 (6)'],
    ['Eyebrow', '13 px uppercase, .08em tracked, muted', 'A1 (1)'],
    ['Focus ring', '2 px accent at a 4 px offset; inset by 4 where it meets a container edge', 'A6 · A17 (18)'],
    ['Content box and padding ladder', '1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132, 80 at 834, 64 at 390', 'A17'],
    ['Clipped-string rule', 'Clip visually, keep the whole string in the DOM', 'A18 (3)'],
    ['Image placeholder plate', 'Striped 45° fill at the pack radius with a mono caption naming the crop', 'A1'],
    ['Hand-off rule', 'A design that cannot exist without a precondition renders another, and says so', 'A1 (11, 15) · A29 (5)']
  ];
  out += section('A30 components', cap('COMPONENT INVENTORY · CUMULATIVE · TEN NEW, EIGHTEEN CARRIED FORWARD') +
    table({ cols:['COMPONENT', 'WHAT IT IS', 'FIRST FROM'], widths:[268, 782, 200], rows:CI }));

  // ── the reconciliation pass ─────────────────────────────────────────
  const RC = [[
    b("Fourteen frames changed — this one and all thirteen designs.") + " Every control panel: " + b("Padding retired into the universal Vertical spacing") + " (5 Contrast Band’s Band padding and 6 Cover’s Cover height keep their own names, being different ladders), the universal trio added outside each design’s list, the Membership source group recut as " + b("the Data group") + ", and " + b("Content") + " and " + b("Editing") + " groups drawn.",
    b("New rows, by count:") + " " + b("Eyebrow") + " and " + b("Note line") + " in twelve and eleven designs — both fields ship with defaults, so clearing them brought the default straight back and the lines could not be turned off ⚑. " + b("Sign-in link") + " in the nine designs that drew the line untoggleable, with its /signin/ mirror named. " + b("List marker") + " — Tick · Custom icon — wherever a tick is drawn. " + b("CTA icon") + " — None · Before · After — in all thirteen. " + b("Order") + " in 8 Tiers and 13 Steps, matching A32.",
    b("An eighth state is drawn by every design") + " ⚑: the sent panel at " + b("One-time code entry: On") + ", marked " + b("ARCHITECT: member-form registry extension") + ". All eight states are now " + b("reached in place through P0·6") + " rather than only drawn, which is what makes their copy editable where it shows."
  ], [
    b("Wired to Ghost:") + " the forms carry " + code("data-members-form=&quot;signup&quot;") + " / " + code("&quot;signin&quot;") + " and map onto Ghost’s own " + code("loading") + " · " + code("success") + " · " + code("error") + " form states; " + b("the sign-out button carries") + " " + code("data-members-signout") + " ⚑, which answers the “verify the attribute” note thirteen frames carried. 8 Tiers’ and 13 Steps’ tier buttons are " + b("Portal tier deep links") + ", and 11 Rail’s rows are " + b("Portal’s named panels") + " — both previously assumed.",
    b("No fixed English visitor-facing string ships.") + " Four literals became fields — " + code("paymentText") + ", " + code("accessLabel") + " + " + code("accessText") + ", " + code("signedInText") + " + " + code("signedInCtaLabel") + ", and the code panel’s two — and four became " + b("theme translation-catalog strings") + ": the three status words and “Sending…”. " + code("benefits[]") + " is named as " + b("the P0·3 authored list") + " at 0–6 everywhere, including 12 Ledger, whose own row said 2–6 while its empty state described nought ⚑.",
    b("What did not arrive, and why.") + " " + b("No Member visibility row and no P0·4 action editor") + " ⚑ — the route is the member state, and the Data group’s “A signed-in member on this page” is the richer model the rule defers to. " + b("No Preview control was removed") + " because A30 never had one. " + b("imageFocus stays a field") + " and is now reachable in the Image Picker’s popover, which was the half of that ruling that was wrong."
  ]];
  out += section("A30 reconciliation", cap("THE CONTROLS-RECONCILIATION PASS · 25 AUGUST 2026 · WHAT CHANGED IN FOURTEEN FRAMES") +
    "<div style=\"display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start\">" + RC.map(function (col) {
      return tile({ w:652, bg:"#FFFFFF", border:"#E7E2DB", body:"<div style=\"display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835\">" + col.map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</div>" });
    }).join("") + "</div>" +
    note(b("The ceiling is the PRD’s ~15 visible controls per design") + ", plus the three universal rows and the Data group, and " + b("the highest count in A30 is eleven") + " (5 Contrast Band) " + b("against a low of six") + " (12 Ledger, which draws neither an eyebrow nor a note). " + b("Quick Controls stay three to five") + " and are named at the head of every panel."));
  // ── findings ────────────────────────────────────────────────────────
  const FI = [
    [`${b('A themed members page is a Ghost page on a custom template, not a route')} ⚑. There is no ${code('/signup/')} route in Ghost: the publication creates pages and the theme supplies ${code('custom-signup.hbs')}, ${code('custom-signin.hbs')} and ${code('custom-account.hbs')}. ${b('Ghost’s Portal will intercept membership links unless it is configured not to')}, so ${b('the generator has to write those pages and set Portal’s links')} — a product step, not a design one.`,
     `${b('The 24-hour magic-link expiry and “works once” are asserted from Ghost’s member auth behaviour')} ⚑, and both appear in reader-facing copy (${code('sentText')}, ${code('expiredText')}). ${b('If the interval differs, the strings are fields and change without a redesign')} — which is why they are fields.`,
     `${b('“Renews” and “Ends” are one date and two words.')} ${code('cancel_at_period_end')} decides which ⚑. ${b('Confirm a theme can read that flag')}: if it cannot, every design in A30 must drop the word and print the date alone, and thirteen frames change.`,
     `${b('Portal can be opened at a named panel')} — ${code('account/plans')}, ${code('account/newsletters')}, ${code('account/profile')} — ${b('and 11 Rail is wired to all three')} ⚑. ${b('Answered in the reconciliation pass')}: this was the open question the rail’s two rows assumed, and the rows now name their targets. ${b('The remaining dependency is product, not theme')} — Portal has to be configured not to intercept the themed pages.`],
    [`${b('A tier’s benefit list may not be exposed to themes in the shape 8 Tiers draws')} ⚑ — name, price and description are certain; ${b('benefits are the doubt')}. If they are unavailable, Benefits per card becomes a no-op and the cards are name, price, description, button.`,
     `${b('There is no stepped-flow module in the registry')} ⚑. 13 Steps wanted one panel at a time and does not have it, so it draws the steps as typography with all three visible. ${b('The closest module is tabs')}, whose no-JS rendering is what the design already is. ${b('This is the category’s one request-shaped finding')}, and it is deliberately not a new module name.`,
     `${b('Comped and cancelled can be true at once')} ⚑ — a gift that outlives a cancellation — and no design assumed it. It is drawn in the account stress frame. ${b('The row reads “Ends” with no billing action')}, which is the only arrangement that is not misleading.`,
     `${b('Most members have no name')} ⚑, because Ghost’s signup asks for an email. Every design puts the email in the name slot and draws no initial. ${b('9 Big Type sets it at 72 px')}, and that is the one place in the library where the display ladder meets a string it cannot flatter — flagged rather than fixed, because truncating an address is worse.`]
  ];
  out += section('A30 findings', cap('FINDINGS FOR THE ARCHITECT · TEN, TWO OF THEM NEW IN THE RECONCILIATION PASS') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${FI.map(col =>
      tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', body:`<div style="display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${col.map(x => `<span>${x}</span>`).join('')}</div>` })).join('')}</div>` +
    note(`${b('None of these is a request for a new behaviour module.')} The registry is closed and A30 uses three of its thirty-one — ${code('member-form')}, ${code('price-toggle')}, ${code('scroll-spy')} — with ${b('eleven of the thirteen declaring one')}. ${b('Where a design wanted behaviour no module covers')} — 13 Steps’ one-panel-at-a-time flow — ${b('it says so and names the closest module')} ⚑ rather than inventing a name the build cannot compile.`));

  out += K.DOC_TAIL;
  return out;
}

return { build, proofCell, stressFrame, accountStress };
})();
