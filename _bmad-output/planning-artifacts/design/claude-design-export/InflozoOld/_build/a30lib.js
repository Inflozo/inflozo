// A30 Members Pages — shared frame builders. Extends A23LIB; A16's field set, A7's tier card,
// A1's button / avatar / eyebrow, A17's box and padding ladder, all carried verbatim.
globalThis.A30LIB = (function () {
const K = globalThis.A23LIB;
const { L, D, PACKS, MONO, b, code, tile } = K;
const hb = s => '{&#8203;{' + s + '}&#8203;}';
const gap = K.gap;

/* ── the boundary strip · §8·1 · on every frame ────────────────────────── */
const ROUTE = {
  signup:  ['/signup/', 'custom-signup.hbs'],
  signin:  ['/signin/', 'custom-signin.hbs'],
  account: ['/account/', 'custom-account.hbs']
};
function boundary(t, w, role, extra) {
  const r = ROUTE[role] || ROUTE.signup;
  const owns = role === 'account'
    ? 'PORTAL OWNS: PLAN CHANGES, BILLING, EMAIL CHANGE, NEWSLETTER PREFERENCES'
    : 'PORTAL OWNS: STRIPE CHECKOUT AND EVERY PAID SIGNUP AFTER THE TIER IS PICKED';
  return `<div style="display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;padding:9px 0 0">
    <span style="font-family:${MONO};font-size:10px;color:${t.muted}">THEMED · ${r[0]} · A GHOST PAGE ON ${r[1].toUpperCase()} ⚑</span>
    <span style="font-family:${MONO};font-size:10px;color:${t.muted};opacity:.85">${owns}</span>
    ${extra ? `<span style="font-family:${MONO};font-size:10px;color:${t.muted};opacity:.85">${extra}</span>` : ''}</div>`;
}

/* ── fixtures · Orbit Weekly ───────────────────────────────────────────── */
const COPY = {
  eyebrow: 'Membership',
  heading: 'Read Orbit Weekly in full',
  blurb: 'Everything we publish, the Tuesday note from the desk, and the archive back to 2019. Cancel whenever you like.',
  cta: 'Continue',
  fieldLabel: 'Your email',
  ph: 'you@example.com',
  typed: 'marta.kovacs@fastmail.com',
  note: 'We send a sign-in link. There is no password to remember.',
  legal: 'By continuing you agree to the terms. We never sell your address.',
  signinPrompt: 'Already a member?',
  signinLink: 'Sign in',
  signinHeading: 'Sign in to Orbit Weekly',
  signinBlurb: 'We send a link to your inbox. There is no password.',
  signinCta: 'Send the link',
  signupPrompt: 'New here?',
  signupLink: 'Start a membership',
  sentHeading: 'Check your inbox',
  sentText: 'We sent a link to marta.kovacs@fastmail.com. It expires in 24 hours ⚑ and works once.',
  sentAgain: 'Send another link',
  expiredHeading: 'That link has expired',
  expiredText: 'Links last 24 hours and can only be used once. Put your address in again and we will send a fresh one.',
  invalid: 'That address doesn’t look right.',
  codeLabel: 'Or paste the code from the email',
  codeCta: 'Sign in',
  accountHeading: 'Your membership',
  accountBlurb: 'What you are signed in as, and what it includes.'
};
const BENEFITS = [
  'Every piece, the day it goes out',
  'The Tuesday note from the desk',
  'The full archive back to 2019',
  'Comment threads, and replies from writers'
];
const TIERS = [
  { name:'Free', m:'$0', y:'$0', per:'', blurb:'Two open pieces a month and the Friday letter.',
    bens:['The Friday letter', 'Two open pieces a month'], cta:'Sign up free', free:true },
  { name:'Member', m:'$6', y:'$60', per:'a month', blurb:'Everything we publish, the Tuesday note, and the comment threads.',
    bens:['Every piece, the day it goes out', 'The Tuesday note', 'Comment threads'], cta:'Choose Member' },
  { name:'Patron', m:'$14', y:'$140', per:'a month', blurb:'All of Member, the printed quarterly, and your name in the back of it.',
    bens:['Everything in Member', 'The printed quarterly', 'Your name in the back'], cta:'Choose Patron' }
];
const MEMBER = {
  name:'Marta Kovács', email:'marta.kovacs@fastmail.com', ini:'MK',
  since:'March 2024', tier:'Member', price:'$6 a month', renews:'14 September 2026',
  letters:'The Friday letter · The Tuesday note'
};
const ACCOUNT_ROWS = {
  paid: [
    { l:'Signed in as', v:MEMBER.email, a:'Change email', portal:true },
    { l:'Plan', v:`${MEMBER.tier} · ${MEMBER.price}`, a:'Change plan', portal:true },
    { l:'Renews', v:MEMBER.renews, note:'from the subscription ⚑' },
    { l:'Payment', v:'Managed by Stripe', a:'Billing', portal:true, note:'no card detail reaches a theme ⚑' },
    { l:'Newsletters', v:MEMBER.letters, a:'Manage', portal:true },
    { l:'Member since', v:MEMBER.since }
  ],
  free: [
    { l:'Signed in as', v:MEMBER.email, a:'Change email', portal:true },
    { l:'Plan', v:'Free', a:'See membership', themed:true },
    { l:'Newsletters', v:'The Friday letter', a:'Manage', portal:true },
    { l:'Member since', v:'August 2026' }
  ],
  comped: [
    { l:'Signed in as', v:MEMBER.email, a:'Change email', portal:true },
    { l:'Plan', v:'Member · complimentary', note:'a gift from the desk ⚑' },
    { l:'Newsletters', v:MEMBER.letters, a:'Manage', portal:true },
    { l:'Member since', v:'January 2025' }
  ]
};
const STATUS = { paid:'Member', free:'Free', comped:'Complimentary' };

/* ── the field · A16's 46 px input, carried verbatim ───────────────────── */
function field(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const st = o.state || 'empty', h = o.h || 46;
  const focused = st === 'focus' || st === 'typed';
  const bad = st === 'invalid';
  const filled = st === 'typed' || st === 'invalid' || st === 'sending';
  let border = `1px solid ${g.border}`;
  if (focused) border = `1.5px solid ${g.name === 'contrast' || g.name === 'image' ? g.text : g.btnBg}`;
  if (bad) border = `1.5px solid ${g.text}`;
  const val = filled ? (bad ? 'marta.kovacs@fastmail' : (o.value || COPY.typed)) : (o.ph || COPY.ph);
  const lab = o.label === false ? '' :
    `<span style="font-size:13px;font-weight:500;color:${g.text};font-family:${p.body};line-height:1.3">${o.label || COPY.fieldLabel}</span>`;
  const err = bad ? `<span style="font-size:13px;font-weight:500;color:${g.text};font-family:${p.body}">${COPY.invalid}</span>` : '';
  return `<div style="display:flex;flex-direction:column;gap:8px;${o.full === false ? '' : 'width:100%;'}min-width:0">${lab}
    <span style="width:100%;height:${h}px;background:${st === 'sending' ? g.plate : g.fieldBg};border:${border};border-radius:${g.r}px;display:flex;align-items:center;gap:0;padding:0 ${focused || bad ? 13.5 : 14}px;box-sizing:border-box;font-size:${o.fs || 15}px;color:${filled ? g.text : g.ph};font-family:${p.body};overflow:hidden;white-space:nowrap">${val}${focused && !bad ? `<span style="width:1px;height:19px;background:${g.text};margin-left:1px"></span>` : ''}</span>${err}</div>`;
}
/* ── the button · A1·1's primary, A16's 46 px height ───────────────────── */
function btn(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const v = o.variant || 'primary';
  const base = `height:${o.h || 46}px;display:inline-flex;align-items:center;justify-content:center;font-size:${o.fs || 15}px;font-weight:600;font-family:${p.body};border-radius:${g.r}px;padding:0 ${o.px || 20}px;box-sizing:border-box;${o.full ? 'width:100%;' : `min-width:${o.minW === undefined ? 0 : o.minW}px;`}`;
  if (v === 'outline') return `<span style="${base}border:1px solid ${g.border};color:${g.text};background:transparent">${o.label}</span>`;
  if (v === 'quiet') return `<span style="${base}color:${g.muted};background:transparent;font-weight:500">${o.label}</span>`;
  if (v === 'carried') return `<span style="${base}background:${g.btnBg};color:${g.btnText}">${o.label}</span>`;
  return `<span style="${base}background:${g.btnBg};color:${g.btnText}">${o.label}</span>`;
}
const smallLink = (g, txt, p) => `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:500;color:${g.text};font-family:${(p || PACKS.paper).body};text-decoration:underline;text-underline-offset:3px">${txt}</span>`;
function signinRow(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return `<div style="display:flex;align-items:center;gap:7px;${o.center ? 'justify-content:center;' : ''}font-size:14px;color:${g.muted};font-family:${p.body}">
    <span>${o.prompt || COPY.signinPrompt}</span>${smallLink(g, o.link || COPY.signinLink, p)}</div>`;
}
const legalLine = (g, o) => `<span style="font-size:13px;line-height:1.55;color:${g.muted};font-family:${(o && o.pack || PACKS.paper).body};${o && o.center ? 'text-align:center;' : ''}max-width:${(o && o.max) || 420}px">${(o && o.text) || COPY.legal}</span>`;
const noteLine = (g, o) => `<span style="font-size:13px;line-height:1.55;color:${g.muted};font-family:${(o && o.pack || PACKS.paper).body};${o && o.center ? 'text-align:center;' : ''}">${(o && o.text) || COPY.note}</span>`;

/* ── the form block · seven states, one geometry ───────────────────────── */
// state: empty | focus | typed | sending | sent | expired | invalid | signedin | nojs
function formBlock(t, g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const st = o.state || 'typed';
  const w = o.w || 420;
  const wrap = inner => `<div style="display:flex;flex-direction:column;gap:${o.gapIn || 14}px;${o.full ? 'width:100%;' : `width:${w}px;`}${o.center ? 'align-items:center;' : ''}${o.style || ''}">${inner}</div>`;
  if (st === 'sent') return wrap(sentPanel(t, g, o));
  if (st === 'code') return wrap(codePanel(t, g, o));
  if (st === 'expired') return wrap(expiredPanel(t, g, o));
  if (st === 'signedin') return wrap(signedInPanel(t, g, o));
  const two = o.fields === 'name';
  const cta = btn(g, { label: st === 'sending' ? 'Sending…' : (o.cta || COPY.cta), full: o.inline ? false : true, pack:p, minW: o.inline ? 130 : 0 });
  const inputs = o.inline
    ? `<div style="display:flex;align-items:flex-end;gap:10px;width:100%">${field(g, { state:st, pack:p, label:o.label, ph:o.ph })}${cta}</div>`
    : `${two ? field(g, { state: st === 'invalid' ? 'typed' : st, pack:p, label:'Your name', ph:'Marta Kovács', value:'Marta Kovács' }) : ''}${field(g, { state:st, pack:p, label:o.label, ph:o.ph })}${cta}`;
  const bits = [inputs];
  if (o.note !== false) bits.push(noteLine(g, { pack:p, center:o.center, text:o.noteText }));
  if (o.legal !== false) bits.push(legalLine(g, { pack:p, center:o.center, max:o.legalMax || w }));
  if (o.signin !== false) bits.push(signinRow(g, { pack:p, center:o.center, prompt:o.prompt, link:o.link }));
  if (st === 'nojs') bits.push(`<span style="font-family:${MONO};font-size:10px;color:${g.muted}">NATIVE POST TO GHOST’S MEMBERS ENDPOINT · GHOST’S OWN RESPONSE REPLACES THE SENT PANEL</span>`);
  return wrap(bits.join(''));
}
function panelPlate(t, g, o) {
  o = o || {};
  return `<div style="${o.w ? `width:${o.w}px;` : 'width:100%;'}background:${o.bg || (g.name === 'page' ? g.plate : g.fieldBg)};border:1px solid ${g.border};border-radius:${g.r}px;padding:${o.pad || 20}px;box-sizing:border-box;display:flex;flex-direction:column;gap:${o.gap || 10}px;${o.style || ''}">${o.body}</div>`;
}
function sentPanel(t, g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return panelPlate(t, g, { pad:o.pad || 20, body:
    `<span style="font-family:${p.head};font-size:${o.size || 22}px;font-weight:700;line-height:1.2;color:${g.text}">${COPY.sentHeading}</span>
     <span style="font-size:15px;line-height:1.55;color:${g.muted};font-family:${p.body}">${COPY.sentText}</span>
     <div style="display:flex;align-items:center;gap:14px;margin-top:2px">${btn(g, { label:COPY.sentAgain, variant:'outline', pack:p })}<span style="font-family:${MONO};font-size:10px;color:${g.muted}">THE FIELD IS REPLACED, NOT DISABLED ⚑</span></div>` });
}
function codePanel(t, g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const codeField = `<span style="width:186px;height:46px;background:${g.fieldBg};border:1px solid ${g.border};border-radius:${g.r}px;display:flex;align-items:center;padding:0 14px;box-sizing:border-box;font-family:${MONO};font-size:16px;letter-spacing:.22em;color:${g.ph};flex-shrink:0">· · · · · ·</span>`;
  return panelPlate(t, g, { pad:o.pad || 20, body:
    `<span style="font-family:${p.head};font-size:${o.size || 22}px;font-weight:700;line-height:1.2;color:${g.text}">${COPY.sentHeading}</span>
     <span style="font-size:15px;line-height:1.55;color:${g.muted};font-family:${p.body}">${COPY.sentText}</span>
     <div style="width:100%;height:1px;background:${g.border};margin:2px 0"></div>
     <span style="font-size:13px;font-weight:500;color:${g.text};font-family:${p.body}">${COPY.codeLabel}</span>
     <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">${codeField}${btn(g, { label:COPY.codeCta, pack:p, minW:104 })}</div>
     <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:2px">${btn(g, { label:COPY.sentAgain, variant:'outline', pack:p })}</div>
     <span style="font-family:${MONO};font-size:10px;line-height:1.5;color:${g.muted}">ARCHITECT: MEMBER-FORM REGISTRY EXTENSION + AN ENDPOINT TO VERIFY THE CODE ⚑ · NO-JS: THE FIELD IS ABSENT FROM THE DOM AND THE EMAILED LINK STILL WORKS</span>` });
}
function expiredPanel(t, g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">
    ${panelPlate(t, g, { pad:o.pad || 20, body:
      `<span style="font-family:${p.head};font-size:${o.size || 22}px;font-weight:700;line-height:1.2;color:${g.text}">${COPY.expiredHeading}</span>
       <span style="font-size:15px;line-height:1.55;color:${g.muted};font-family:${p.body}">${COPY.expiredText}</span>` })}
    ${field(g, { state:'empty', pack:p, label:COPY.fieldLabel })}${btn(g, { label:COPY.signinCta, full:true, pack:p })}
    <span style="font-family:${MONO};font-size:10px;color:${g.muted}">READ FROM ?ACTION=SIGNIN&SUCCESS=FALSE · JS-ONLY, AND THE NO-JS FALL-THROUGH IS THE PLAIN FORM ⚑</span></div>`;
}
function signedInPanel(t, g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return panelPlate(t, g, { pad:o.pad || 20, body:
    `<div style="display:flex;align-items:center;gap:11px">${avatar(g, { ini:MEMBER.ini, size:36, pack:p })}
      <div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600;color:${g.text};font-family:${p.body}">${MEMBER.name}</span>
      <span style="font-size:13px;color:${g.muted};font-family:${p.body}">${MEMBER.tier} · signed in</span></div></div>
     <span style="font-size:15px;line-height:1.55;color:${g.muted};font-family:${p.body}">You already have a membership. Nothing to sign up for.</span>
     <div style="display:flex;gap:10px;flex-wrap:wrap">${btn(g, { label:'Your membership', pack:p })}${btn(g, { label:'Sign out', variant:'outline', pack:p })}</div>` });
}

/* ── benefits · A5's tick list, carried ────────────────────────────────── */
function benefitList(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const list = (o.list || BENEFITS).slice(0, o.n || 4);
  const row = (x, i) => o.style === 'rows'
    ? `<div style="display:flex;align-items:center;gap:12px;padding:${o.dens || 13}px 0;border-top:1px solid ${g.border}"><span style="font-family:${MONO};font-size:11px;color:${g.muted};width:18px;flex-shrink:0">${String(i + 1).padStart(2, '0')}</span><span style="font-size:15px;line-height:1.5;color:${g.text};font-family:${p.body}">${x}</span></div>`
    : `<div style="display:flex;align-items:flex-start;gap:10px"><span style="font-size:14px;line-height:1.5;color:${o.tickAccent ? g.btnBg : g.muted};flex-shrink:0">✓</span><span style="font-size:${o.fs || 15}px;line-height:1.5;color:${o.tone === 'muted' ? g.muted : g.text};font-family:${p.body};text-wrap:pretty">${x}</span></div>`;
  return `<div style="display:flex;flex-direction:column;gap:${o.style === 'rows' ? 0 : (o.gap || 10)}px;${o.max ? `max-width:${o.max}px;` : ''}${o.wrapStyle || ''}">
    ${o.label ? `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${p.body};margin-bottom:2px">${o.label}</span>` : ''}
    ${list.map(row).join('')}</div>`;
}

/* ── the tier card · A7·1, carried verbatim ────────────────────────────── */
function tierCard(t, g, o) {
  const p = o.pack || PACKS.paper; const tr = o.tier;
  const price = o.period === 'yearly' ? tr.y : tr.m;
  const per = tr.free ? '' : (o.period === 'yearly' ? 'a year' : 'a month');
  return `<div style="width:${o.w || 400}px;background:${o.raised === false ? 'transparent' : g.plate};border:1px solid ${o.current ? g.text : g.border};border-radius:${g.r}px;padding:${o.pad || 24}px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;${o.raised === false ? '' : (t.dark ? '' : `box-shadow:${o.flat ? 'none' : '0 1px 2px rgba(28,27,26,.06)'};`)}">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <span style="font-family:${p.head};font-size:21px;font-weight:700;color:${g.text}">${tr.name}</span>
      ${o.mark ? `<span style="font-size:12px;font-weight:600;color:${g.btnBg};font-family:${p.body}">${o.mark}</span>` : ''}</div>
    <div style="display:flex;align-items:baseline;gap:7px"><span style="font-family:${p.head};font-size:${o.priceSize || 38}px;font-weight:700;letter-spacing:-0.03em;color:${g.text};font-variant-numeric:tabular-nums">${price}</span>${per ? `<span style="font-size:14px;color:${g.muted};font-family:${p.body}">${per}</span>` : ''}</div>
    ${o.blurb === false ? '' : `<span style="font-size:14px;line-height:1.55;color:${g.muted};font-family:${p.body};text-wrap:pretty">${tr.blurb}</span>`}
    ${o.bens === false ? '' : benefitList(g, { list:tr.bens, n:o.benN || 3, gap:8, fs:14, pack:p })}
    <div style="margin-top:auto;padding-top:4px">${btn(g, { label:tr.cta, full:true, variant:o.ctaVariant || (tr.free ? 'outline' : 'primary'), pack:p })}</div>
    ${o.foot ? `<span style="font-family:${MONO};font-size:10px;color:${g.muted}">${o.foot}</span>` : ''}</div>`;
}
function tierRow(t, g, o) {
  const p = o.pack || PACKS.paper; const tr = o.tier;
  const price = o.period === 'yearly' ? tr.y : tr.m;
  return `<div style="display:flex;align-items:center;gap:20px;padding:${o.dens || 20}px 0;border-top:1px solid ${g.border};${o.style || ''}">
    <div style="display:flex;flex-direction:column;gap:5px;flex:1;min-width:0">
      <span style="font-family:${p.head};font-size:19px;font-weight:700;color:${g.text}">${tr.name}</span>
      <span style="font-size:14px;line-height:1.5;color:${g.muted};font-family:${p.body};max-width:${o.measure || 520}px">${tr.blurb}</span></div>
    <span style="font-family:${p.head};font-size:24px;font-weight:700;color:${g.text};font-variant-numeric:tabular-nums;white-space:nowrap">${price}${tr.free ? '' : `<span style="font-size:13px;font-weight:400;color:${g.muted};font-family:${p.body}"> ${o.period === 'yearly' ? '/ yr' : '/ mo'}</span>`}</span>
    ${btn(g, { label:tr.free ? 'Free' : 'Choose', variant:tr.free ? 'outline' : 'primary', pack:p, minW:104 })}</div>`;
}
function periodToggle(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const cell = (lab, on) => `<span style="padding:8px 15px;border-radius:${Math.max(g.r - 2, 4)}px;font-size:13.5px;font-weight:${on ? 600 : 500};font-family:${p.body};color:${on ? g.text : g.muted};${on ? `background:${g.fieldBg};` : ''}">${lab}</span>`;
  return `<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;background:${g.plate};border:1px solid ${g.border};border-radius:${g.r + 2}px;min-height:44px;box-sizing:border-box">${cell('Monthly', o.period !== 'yearly')}${cell('Yearly', o.period === 'yearly')}</div>`;
}

/* ── account · display-only, everything mutating hands off ─────────────── */
function avatar(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper; const s = o.size || 44;
  return `<span style="width:${s}px;height:${s}px;border-radius:${s}px;background:${g.plate};border:1px solid ${g.border};display:inline-flex;align-items:center;justify-content:center;font-size:${Math.round(s / 3.2)}px;font-weight:600;color:${g.muted};font-family:${p.body};flex-shrink:0">${o.ini || MEMBER.ini}</span>`;
}
function statusBadge(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const paid = o.status === 'paid';
  return `<span style="display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:${o.pill ? 13 : Math.min(g.r, 8)}px;font-size:12.5px;font-weight:600;font-family:${p.body};${paid ? `background:${g.btnBg};color:${g.btnText};` : `border:1px solid ${g.border};color:${g.muted};`}">${STATUS[o.status] || STATUS.paid}</span>`;
}
const portalTag = (g, p) => `<span style="font-family:${MONO};font-size:9.5px;letter-spacing:.04em;color:${g.muted};white-space:nowrap">PORTAL ↗</span>`;
function accountRow(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper; const r = o.row;
  const val = `<div style="display:flex;flex-direction:column;gap:3px;min-width:0">
    <span style="font-size:15px;color:${g.text};font-family:${p.body};overflow-wrap:anywhere;${o.mono ? `font-family:${MONO};font-size:13.5px;` : ''}">${r.v}</span>
    ${r.note ? `<span style="font-family:${MONO};font-size:9.5px;color:${g.muted}">${r.note.toUpperCase()}</span>` : ''}</div>`;
  const act = r.a ? `<div style="display:flex;align-items:center;gap:9px;flex-shrink:0">${btn(g, { label:r.a, variant:o.actVariant || 'outline', h:38, fs:13.5, px:14, pack:p })}${r.portal ? portalTag(g, p) : ''}</div>` : '';
  if (o.layout === 'stack') return `<div style="display:flex;flex-direction:column;gap:8px;padding:${o.dens || 16}px 0;border-top:1px solid ${g.border}">
    <span style="font-size:13px;color:${g.muted};font-family:${p.body}">${r.l}</span>${val}${act}</div>`;
  return `<div style="display:flex;align-items:center;gap:20px;padding:${o.dens || 16}px 0;border-top:1px solid ${g.border}">
    <span style="width:${o.labW || 168}px;flex-shrink:0;font-size:13.5px;color:${g.muted};font-family:${p.body}">${r.l}</span>
    <div style="flex:1;min-width:0;${o.right ? 'text-align:right;' : ''}">${val}</div>${act}</div>`;
}
function accountHead(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return `<div style="display:flex;align-items:center;gap:14px">${o.avatar === false ? '' : avatar(g, { pack:p, size:o.size || 44 })}
    <div style="display:flex;flex-direction:column;gap:5px;min-width:0">
      <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap"><span style="font-family:${p.head};font-size:${o.nameSize || 26}px;font-weight:700;letter-spacing:-0.02em;color:${g.text}">${MEMBER.name}</span>${statusBadge(g, { status:o.status || 'paid', pack:p })}</div>
      <span style="font-size:14px;color:${g.muted};font-family:${p.body}">${o.sub || `${MEMBER.email} · member since ${o.status === 'free' ? 'August 2026' : (o.status === 'comped' ? 'January 2025' : MEMBER.since)}`}</span></div></div>`;
}
function accountRows(g, o) {
  o = o || {};
  const rows = ACCOUNT_ROWS[o.status || 'paid'];
  return `<div style="display:flex;flex-direction:column;${o.w ? `width:${o.w}px;` : ''}${o.style || ''}">${rows.map(r => accountRow(g, { ...o, row:r })).join('')}</div>`;
}
function accountCards(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const rows = ACCOUNT_ROWS[o.status || 'paid'];
  return `<div style="display:flex;flex-wrap:wrap;gap:${o.gap || 20}px;${o.w ? `width:${o.w}px;` : ''}">${rows.map(r => `
    <div style="width:${o.cw || 302}px;background:${g.plate};border:1px solid ${g.border};border-radius:${g.r}px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:9px;min-height:${o.ch || 132}px">
      <span style="font-size:13px;color:${g.muted};font-family:${p.body}">${r.l}</span>
      <span style="font-size:16px;line-height:1.4;color:${g.text};font-family:${p.body};font-weight:500;overflow-wrap:anywhere">${r.v}</span>
      ${r.note ? `<span style="font-family:${MONO};font-size:9.5px;color:${g.muted}">${r.note.toUpperCase()}</span>` : ''}
      ${r.a ? `<div style="margin-top:auto;display:flex;align-items:center;gap:9px">${btn(g, { label:r.a, variant:'outline', h:38, fs:13.5, px:14, pack:p })}${r.portal ? portalTag(g, p) : ''}</div>` : ''}</div>`).join('')}</div>`;
}
function signOutRow(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return `<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;${o.style || ''}">${btn(g, { label:'Sign out', variant:'outline', pack:p, h:o.h || 44 })}
    <span style="font-family:${MONO};font-size:9.5px;color:${g.muted}">SIGN-OUT IS DATA-MEMBERS-SIGNOUT ⚑ · GHOST’S ONLY MECHANISM</span></div>`;
}
function portalNote(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return `<div style="display:flex;align-items:flex-start;gap:10px;padding-top:${o.pt === undefined ? 4 : o.pt}px;max-width:${o.max || 560}px">
    <span style="font-family:${MONO};font-size:9.5px;color:${g.muted};flex-shrink:0;padding-top:3px">↗</span>
    <span style="font-size:13px;line-height:1.55;color:${g.muted};font-family:${p.body}">${o.text || 'Plan changes, billing and newsletter preferences open Ghost’s Portal over this page. Nothing on it is themed. ⚑'}</span></div>`;
}

/* ── control panel · A30's own picker and source group ─────────────────── */
const PC = K.PC;
function designPicker(name, n, sub) {
  return `<div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid ${PC.line};padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:${PC.mute}">Design</span>
      <div style="height:38px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${name}</span><span style="font-size:10px;color:${PC.dim}">${n} / 13 ▾</span></div>
      <span style="font-size:11px;color:${PC.mute};line-height:1.5">${sub}</span>
    </div>`;
}
function sourceGroup(o) {
  o = o || {};
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE MEMBERSHIP SOURCE · IDENTICAL IN ALL THIRTEEN · NOT COUNTED</span>
    ${K.sel('Which page this is', o.role || 'Signup', `Read-only. ${b('The template decides')} — the section reports whether it is drawing ${code('custom-signup')}, ${code('custom-signin')} or ${code('custom-account')} ⚑, and draws the matching arrangement.`, true)}
    ${K.sel('Tiers', o.tiers || 'From Ghost, visible only', o.tiersHelp || `From Ghost, visible only · From Ghost, all · Off. Reads ${code(hb('#get "tiers"'))}; ${b('the user cannot add or remove a tier here')} ⚑ — tiers are Ghost objects and are edited in Ghost.`)}
    ${K.sel('After the address is sent', o.after || 'Sent panel in place', `Sent panel in place · Portal takes over. ${b('In place is the default')} ⚑ — the themed page keeps the reader where they were; Portal’s own notification is the alternative.`)}
    ${K.sel('A signed-in member on this page', o.signed || 'Membership summary', `Membership summary · Send them to the account page. ${b('Never the signup form')} ⚑ — a member who lands on ${code('/signup/')} has nothing to sign up for.`)}
    ${K.sel('Everything that changes a subscription', 'Ghost Portal', `Read-only. ${b('Plan changes, checkout, billing, email changes and newsletter preferences are Portal’s')} ⚑ — the theme draws the trigger and Portal draws the rest. ${b('This is the category’s boundary')} and no control moves it.`, true)}
  </div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.count}${o.foot === false ? '' : ' OF ITS OWN · TRIO · DATA'}</span></div>`;
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${o.dataGroup || sourceGroup(o.source)}${o.tail || ''}${foot}</div>`;
  const settles = `<div style="width:948px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">WHAT THIS PANEL SETTLES</span>${o.settles.map(s => `<span>${s}</span>`).join('')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${side}${settles}</div>`;
}

return { ...K, hb, boundary, ROUTE, COPY, BENEFITS, TIERS, MEMBER, ACCOUNT_ROWS, STATUS,
  field, btn, smallLink, signinRow, legalLine, noteLine, formBlock, panelPlate, sentPanel, codePanel,
  expiredPanel, signedInPanel, benefitList, tierCard, tierRow, periodToggle, avatar, statusBadge,
  portalTag, accountRow, accountHead, accountRows, accountCards, signOutRow, portalNote,
  designPicker, sourceGroup, panel, gap };
})();
