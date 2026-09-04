// A32 Paywall / Content CTA — shared frame builders. Extends A30LIB (which extends A23LIB).
// A25's measure and body type, A24's post header, A7's tier card, A1's button / eyebrow,
// A17's content box and padding ladder, A30's Portal boundary — all carried verbatim.
globalThis.A32LIB = (function () {
const K = globalThis.A30LIB;
const { L, D, PACKS, MONO, b, code, tile, gap } = K;
const PK = PACKS.paper;
const hb = K.hb;

/* ── article fixtures · Orbit Weekly · the piece A23 already indexed ───── */
const ARTICLE = {
  title: 'Orbital debris, and the people who count it',
  tag: 'Reporting', author: 'Nadia Okonjo', date: '27 July 2026', read: '12 min read',
  heading: 'What the fence actually sees',
  paras: [
    'The catalogue is public, and on any given day a good deal of it is wrong by a few hundred metres. That is not a failure of the people who keep it. It is what happens when you track thirty-six thousand objects with a network of radars built for something else.',
    'The fence sees a fragment the size of a fist at eight hundred kilometres, roughly. The word doing the work in that sentence is roughly: a fragment is not a sphere, it tumbles, and its radar cross-section changes while it does. The same piece of debris can appear to grow and shrink across one pass.',
    'The analysts who reconcile those passes into a single number work in an office outside Colorado Springs. I spent three weeks with them, and the part I could not get past was how much of the job is'
  ]
};
const CUT_LABEL = 'THE MEMBERS-ONLY CUT · EVERYTHING BELOW THIS LINE IS WITHHELD BY GHOST AND NEVER SENT ⚑';

/* ── the four gates · §8·2 and §8·3 ───────────────────────────────────── */
const GATE = {
  paid: { key:'paid', eyebrow:'Members only',
    heading:'The rest of this piece is for members',
    blurb:'Members get everything we publish, the Tuesday note from the desk, and the archive back to 2019. From $6 a month, and you can stop whenever you like.',
    cta:'See membership', prompt:'Already a member?', link:'Sign in',
    portal:'#/portal/signup', short:'The rest of this piece is for members' },
  free: { key:'free', eyebrow:'Free account',
    heading:'Keep reading with a free account',
    blurb:'Orbit Weekly opens two pieces a month to anyone with an account. It takes one email address and there is no password to remember.',
    cta:'Sign up free', prompt:'Already a member?', link:'Sign in',
    portal:'#/portal/signup', short:'Keep reading with a free account' },
  upgrade: { key:'upgrade', eyebrow:'Members only',
    heading:'This one is for paying members',
    blurb:'You are signed in as Marta on the free plan. Member is $6 a month and opens everything we publish, including this piece.',
    cta:'Upgrade', prompt:'', link:'Manage your membership',
    portal:'#/portal/account/plans', short:'This one is for paying members' },
  tier: { key:'tier', eyebrow:'Patron members',
    heading:'This piece is for Patron members',
    blurb:'Patron adds the printed quarterly and the annual index to everything in Member. It is $14 a month.',
    cta:'See Patron', prompt:'Already a Patron?', link:'Sign in',
    portal:'#/portal/signup/patron', short:'This piece is for Patron members' }
};
const INCLUDED = [
  'Every piece, the day it goes out',
  'The Tuesday note from the desk',
  'The full archive back to 2019',
  'Comment threads, and replies from writers'
];
const LEDGER = [
  ['Every piece, the day it goes out', 'Two open pieces a month on the free plan'],
  ['The Tuesday note from the desk', 'What we are working on, and what we dropped'],
  ['The full archive back to 2019', '412 essays, interviews and corrections'],
  ['Comment threads', 'Members only, and writers reply in them'],
  ['The printed quarterly', 'Patron tier · four issues a year'],
  ['Your name in the back of it', 'Patron tier · if you want it there']
];

/* ── the boundary strip · on every frame · A30's strip, re-worded ──────── */
function boundary(t, w, extra) {
  const line = (txt, o) => `<span style="font-family:${MONO};font-size:10px;color:${t.muted}${o ? ';opacity:.85' : ''}">${txt}</span>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;padding:9px 0 0">
    ${line('THEMED · INSIDE post.hbs AT THE MEMBERS-ONLY CUT ⚑')}
    ${line('GHOST SENDS THE PREVIEW AND NOTHING BELOW IT · THERE IS NO HIDDEN TEXT IN THE PAGE', 1)}
    ${line('PORTAL OWNS: SIGNUP, SIGN-IN, CHECKOUT AND EVERY PLAN CHANGE', 1)}
    ${extra ? line(extra, 1) : ''}</div>`;
}
const portalNote = (t, dest, txt) => `<span style="font-family:${MONO};font-size:10px;color:${t.muted}">ACTION → GHOST PORTAL · ${dest.toUpperCase()} · ${txt || 'THE THEME DRAWS THE TRIGGER, PORTAL DRAWS THE REST ⚑'}</span>`;

/* ── measures · A25's ladder, carried ─────────────────────────────────── */
const AM = w => w === 1440 ? 720 : w === 834 ? 754 : 350;
const rgb0 = hex => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},0)`;
};

/* ── the post header above · A24, drawn low so the cut has context ────── */
function postHead(t, w) {
  const g = K.ground(t, 'page');
  return `<div style="padding-top:${w === 390 ? 20 : 26}px">
    <span style="font-family:${MONO};font-size:10px;color:${t.muted}">A24 POST HEADER AND A25·2 PLAIN BODY ABOVE · NOT THIS SECTION · DRAWN LOW</span>
    <div style="opacity:.55;padding-top:12px;display:flex;flex-direction:column;gap:${w === 390 ? 8 : 10}px;width:${AM(w)}px;margin:0 auto">
      <span style="font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};font-family:${PK.body}">${ARTICLE.tag}</span>
      <span style="font-family:${PK.head};font-size:${w === 390 ? 24 : 30}px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:${g.text};text-wrap:pretty">${ARTICLE.title}</span>
      <span style="font-size:13.5px;color:${g.muted};font-family:${PK.body}">${ARTICLE.author} · ${ARTICLE.date} · ${ARTICLE.read}</span></div></div>`;
}

/* ── the preview and the cut · §8·1 and §8·4 ──────────────────────────── */
// last: 'para' | 'heading' | 'image'   fade: 0 | 96 | 160 | 240   blur: bool
function preview(t, w, o) {
  o = o || {};
  const g = K.ground(t, 'page');
  const m = o.measure || AM(w);
  const fs = w === 390 ? 17 : 19, lead = w === 390 ? 22 : 26;
  const last = o.last || 'para';
  const fadeH = o.fade === undefined ? (w === 390 ? 120 : 160) : o.fade;
  const n = o.n === undefined ? 2 : o.n;
  const para = (txt, isLast) => `<p style="margin:0${isLast ? '' : ` 0 ${lead}px`};font-size:${fs}px;line-height:1.7;color:${g.text};font-family:${PK.body};max-width:${m}px;text-wrap:pretty;${isLast && o.blur ? 'filter:blur(2.6px);' : ''}">${txt}</p>`;
  const body = ARTICLE.paras.slice(0, n).map(x => para(x, false)).join('');
  let tail;
  if (last === 'heading') {
    tail = `<h2 style="margin:${lead}px 0 0;font-family:${PK.head};font-size:${w === 390 ? 25 : 32}px;font-weight:700;line-height:1.25;letter-spacing:-0.02em;color:${g.text};max-width:${m}px">${ARTICLE.heading}</h2>`;
  } else if (last === 'image') {
    tail = `<div style="margin-top:${lead}px">${K.plate(t, { w:m, h:w === 390 ? 200 : 300, cap:'FEATURE IMAGE · 3:2 · THE LAST BLOCK ABOVE THE CUT', pack:PK })}</div>`;
  } else {
    tail = para(ARTICLE.paras[2], true);
  }
  const faded = last === 'para' && fadeH
    ? `<div style="position:relative;max-width:${m}px">${tail}<div style="position:absolute;left:0;right:0;bottom:-1px;height:${fadeH}px;background:linear-gradient(to bottom,${rgb0(t.bg)} 0%,${t.bg} 100%);pointer-events:none"></div></div>`
    : tail;
  const why = last === 'heading'
    ? 'THE LAST VISIBLE BLOCK IS A HEADING · NO FADE, AND THE HEADING KEEPS ITS OWN SPACE ⚑'
    : last === 'image'
      ? 'THE LAST VISIBLE BLOCK IS AN IMAGE · NO FADE OVER A PHOTOGRAPH · A19’S RULE ⚑'
      : (fadeH ? `THE FADE IS ${fadeH} PX OF THE PAGE GROUND OVER THE LAST VISIBLE PARAGRAPH${o.blur ? ' · BLURRED 2.6 PX' : ''}` : 'FADE OFF · THE PARAGRAPH ENDS WHERE GHOST CUT IT');
  return `<div style="width:${m}px${o.centre === false ? '' : ';margin:0 auto'}">${body}${faded}
    ${o.mono === false ? '' : `<div style="padding-top:${w === 390 ? 12 : 14}px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${why}</span></div>`}</div>`;
}

/* the cut line · drawn on annotation frames only, never in the section */
const cutLine = (t, w, m) => `<div style="width:${m || AM(w)}px;margin:0 auto;display:flex;align-items:center;gap:12px;padding:6px 0">
  <span style="flex:1;height:1px;background:${t.border}"></span>
  <span style="font-family:${MONO};font-size:9.5px;color:${t.muted};white-space:nowrap">${CUT_LABEL}</span>
  <span style="flex:1;height:1px;background:${t.border}"></span></div>`;

/* ── the gate block · A32's own · eyebrow, heading, blurb, action ──────── */
function accessEyebrow(g, txt, o) {
  o = o || {};
  return `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${o.tone === 'text' ? g.text : g.muted};font-family:${PK.body}">${txt}</span>`;
}
function gateHead(g, w, o) {
  o = o || {};
  const k = o.gate || GATE.paid;
  const hs = o.hSize || (w === 1440 ? 34 : w === 834 ? 30 : 25);
  const al = o.align === 'center';
  const items = [];
  if (o.eyebrow !== false) items.push(accessEyebrow(g, k.eyebrow) + gap(o.eyebrowGap || 12));
  items.push(`<h2 style="margin:0;font-family:${PK.head};font-size:${hs}px;font-weight:700;line-height:1.15;letter-spacing:-0.03em;color:${g.text};text-wrap:pretty;max-width:${o.measure || 560}px">${o.headingText || k.heading}</h2>`);
  if (o.blurb !== false) items.push(gap(o.blurbGap || 14) + `<p style="margin:0;font-size:${w === 390 ? 16 : 17}px;line-height:1.6;color:${g.muted};font-family:${PK.body};max-width:${o.measure || 560}px;text-wrap:pretty">${o.blurbText || k.blurb}</p>`);
  return `<div style="display:flex;flex-direction:column;${al ? 'align-items:center;text-align:center;' : ''}${al ? `max-width:${o.measure || 560}px;margin:0 auto` : ''}">${items.join('')}</div>`;
}
// the action row: primary button, then the secondary line
function action(t, g, w, o) {
  o = o || {};
  const k = o.gate || GATE.paid;
  const al = o.align === 'center';
  const narrow = w === 390;
  const full = o.full === undefined ? narrow : o.full;
  const btn = K.btn(g, { label:o.ctaLabel || k.cta, pack:PK, h:o.h || 46, px:22, full });
  const link = o.link === false ? '' : (k.prompt
    ? K.signinRow(g, { pack:PK, center:al, prompt:k.prompt, link:k.link })
    : `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-underline-offset:3px">${k.link}</span>`);
  if (o.field) {
    const pair = narrow
      ? `<div style="display:flex;flex-direction:column;gap:10px;width:100%">${K.field(g, { state:'typed', pack:PK, label:false, full:true })}${K.btn(g, { label:o.ctaLabel || k.cta, pack:PK, h:46, px:20, full:true })}</div>`
      : `<div style="display:flex;align-items:flex-end;gap:10px;width:100%;max-width:${o.fieldMax || 480}px">${K.field(g, { state:'typed', pack:PK, label:false, full:true })}${K.btn(g, { label:o.ctaLabel || k.cta, pack:PK, h:46, px:20, minW:132 })}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;${al ? 'align-items:center;' : ''}width:100%">${pair}${link}</div>`;
  }
  if (o.row && !narrow) {
    return `<div style="display:flex;align-items:center;gap:${o.rowGap || 20}px;flex-wrap:wrap;${al ? 'justify-content:center;' : ''}">${btn}${link}</div>`;
  }
  return `<div style="display:flex;flex-direction:column;gap:${o.gap || 6}px;${al ? 'align-items:center;' : ''}${narrow ? 'width:100%;' : ''}">${btn}${link}</div>`;
}
function included(g, o) {
  o = o || {};
  return K.benefitList(g, { list:INCLUDED, n:o.n || 3, gap:o.gap || 10, fs:o.fs || 15,
    tone:o.tone, label:o.label, max:o.max, pack:PK, style:o.style, dens:o.dens });
}

/* ── the preview meter · A32's own · design 12 ────────────────────────── */
function meter(g, o) {
  o = o || {};
  const w = o.w || 720, pct = o.pct === undefined ? 34 : o.pct;
  const track = `<span style="position:relative;display:block;width:100%;height:${o.h || 4}px;border-radius:${o.h || 4}px;background:${g.border};overflow:hidden">
      <span style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:${g.text};border-radius:${o.h || 4}px"></span></span>`;
  const seg = `<span style="display:flex;gap:4px;width:100%">${Array.from({ length:12 }, (_, i) =>
      `<span style="flex:1;height:${o.h || 4}px;border-radius:2px;background:${i < 4 ? g.text : g.border}"></span>`).join('')}</span>`;
  const lab = o.label === false ? '' : `<span style="font-size:13.5px;color:${g.muted};font-family:${PK.body}">${o.labelText || 'You have read 4 of this piece’s 12 minutes'}</span>`;
  return `<div style="display:flex;flex-direction:column;gap:10px;width:${w}px;max-width:100%">${o.style === 'segments' ? seg : track}${lab}</div>`;
}

/* ── the tier pair · A7·1's card at the cut ───────────────────────────── */
function tierCards(t, g, o) {
  o = o || {};
  const list = (o.list || K.TIERS).slice(o.from === undefined ? 1 : o.from, (o.from === undefined ? 1 : o.from) + (o.n || 2));
  return `<div style="display:${o.stack ? 'flex' : 'grid'};${o.stack ? 'flex-direction:column;' : `grid-template-columns:repeat(${o.n || 2},1fr);`}gap:${o.gap || 20}px;width:100%;align-items:start">${
    list.map((tr, i) => K.tierCard(t, g, { tier:tr, pack:PK, period:o.period, pad:o.pad || 22,
      benN:o.benN === undefined ? 3 : o.benN, bens:o.benN === 0 ? false : undefined, flat:o.flat, raised:o.raised,
      mark:o.mark && i === (o.markIndex === undefined ? 0 : o.markIndex) ? 'Most popular' : '' })
      .replace('width:400px;', 'width:100%;')).join('')}</div>`;
}

/* ── neighbours · A26 below, not A3 ───────────────────────────────────── */
function below(t, w) {
  const g = K.ground(t, 'page');
  const m = AM(w);
  return `<div style="padding:0 ${K.G(w).m}px ${w === 390 ? 24 : 32}px">
    <span style="font-family:${MONO};font-size:10px;color:${t.muted}">A26 POST FOOTER BELOW · NOT THIS SECTION · DRAWN LOW · IT RENDERS ON A GATED POST TOO ⚑</span>
    <div style="opacity:.4;width:${m}px;margin:10px auto 0;padding-top:14px;border-top:1px solid ${g.border};display:flex;align-items:center;justify-content:space-between;font-size:13px;color:${g.muted};font-family:${PK.body}">
      <span>${ARTICLE.author} · ${ARTICLE.tag}</span><span>Share · Copy link</span></div></div>`;
}
function frame(t, w, inner, o) {
  o = o || {};
  const sh = t.dark ? '0 12px 40px rgba(0,0,0,.34)' : '0 12px 40px rgba(28,27,26,.14)';
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:${sh};overflow:hidden;box-sizing:border-box;${o.style || ''}">${
    o.noBar ? '' : K.siteBar(t, w, PK, o)}${inner}${o.noFoot ? '' : below(t, w)}</div>`;
}

/* ── the scene · header, preview, the cut, the gate ───────────────────── */
// o: { last, fade, blur, gate, bleed, padTop, padBot, noHead, extra }
function scene(t, w, gateInner, o) {
  o = o || {};
  const m = K.G(w).m;
  const pt = o.padTop === undefined ? (w === 1440 ? 96 : w === 834 ? 80 : 64) : o.padTop;
  const pb = o.padBot === undefined ? pt : o.padBot;
  const head = `<div style="padding:0 ${m}px">${boundary(t, w, o.extra)}${o.noHead ? '' : postHead(t, w)}
    <div style="height:${w === 390 ? 22 : 28}px"></div>${preview(t, w, o)}</div>`;
  const padLabel = `<div style="padding:0 ${m}px"><div style="height:${pt}px;display:flex;align-items:flex-end;padding-bottom:4px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${pt} · A32’S OWN TOP PADDING · ${o.padNote || 'MEASURED FROM THE LAST VISIBLE BLOCK, NOT FROM THE FADE ⚑'}</span></div></div>`;
  const gate = o.bleed ? gateInner : `<div style="padding:0 ${m}px">${gateInner}</div>`;
  return `${head}${o.noPad ? '' : padLabel}${gate}<div style="height:${pb}px"></div>`;
}

/* ── tiles for the state frames ───────────────────────────────────────── */
const GATE_LABEL = {
  free:    'FREE-SIGNUP GATE · A MEMBERS-ONLY POST, A SIGNED-OUT READER',
  paid:    'PAID GATE · A PAID POST, A SIGNED-OUT READER',
  upgrade: 'UPGRADE GATE · A PAID POST, A SIGNED-IN FREE MEMBER ⚑ · NO SIGN-IN LINK',
  tier:    'SPECIFIC-TIER GATE · THE POST IS SOLD TO ONE TIER ⚑',
  focus:   'HOVER AND FOCUS · A6’S 2 PX ACCENT RING AT A 4 PX OFFSET, CARRIED',
  editor:  'IN THE EDITOR · THE GATE DRAWS AT ITS RESTING STATE, ALWAYS ⚑',
  nojs:    'NO JAVASCRIPT · IDENTICAL · THE GATE IS SERVER-RENDERED HTML',
  member:  'A MEMBER WHO HAS ACCESS · THE SECTION DOES NOT RENDER AT ALL ⚑'
};
function stateTiles(t, d, kinds, o) {
  o = o || {};
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
    kinds.map(kind => tile({ w:o.w || 652, label:GATE_LABEL[kind] || kind, bg:'#FFFFFF', border:'#EBE5DB',
      body:`<div style="min-height:${o.min || 240}px;display:flex;align-items:flex-start">${d.stateBody(t, kind)}</div>` })).join('')}${
    o.extra ? tile({ w:o.w || 652, label:o.extra.label, bg:'#F7F5F2', border:'#E7E2DB',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;min-height:${o.min || 240}px">${o.extra.body.map(x => `<span>${x}</span>`).join('')}</div>` }) : ''}</div>`;
}
const LAND_LABEL = {
  para:    'THE CUT LANDS AFTER A PARAGRAPH · THE FADE RUNS · THE NORMAL CASE',
  heading: 'THE CUT LANDS AFTER A HEADING · NO FADE ⚑ · CSS :last-child, NOT A SCRIPT',
  image:   'THE CUT LANDS AFTER AN IMAGE · NO FADE OVER A PHOTOGRAPH ⚑'
};
function landingTiles(t, d) {
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
    ['para', 'heading', 'image'].map(last => tile({ w:440, label:LAND_LABEL[last], bg:'#FFFFFF', border:'#EBE5DB', pad:14,
      body:`<div style="width:412px;overflow:hidden;border-radius:8px;border:1px solid #EFEAE1">${d.landing(t, last)}</div>` })).join('')}</div>`;
}

/* ── control panel · A32's picker and source group ────────────────────── */
const PC = K.PC;
function designPicker(name, n, sub) {
  return `<div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid ${PC.line};padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:${PC.mute}">Design</span>
      <div style="height:38px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${name}</span><span style="font-size:10px;color:${PC.dim}">${n} / 12 ▾</span></div>
      <span style="font-size:11px;color:${PC.mute};line-height:1.5">${sub}</span>
    </div>`;
}
function sourceGroup(o) {
  o = o || {};
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE ACCESS SOURCE · IDENTICAL IN ALL TWELVE · NOT COUNTED</span>
    ${K.sel('Which gate this is', 'From the post’s visibility', `Read-only. ${b('Ghost decides')} — ${code('post.visibility')} is public, members, paid or a named tier ⚑, and the section draws the matching copy. ${b('A reader who has access never sees this section at all')}.`, true)}
    ${K.sel('A signed-in free member on a paid post', o.upgrade || 'The upgrade gate', `The upgrade gate · The same gate as a visitor. ${b('The upgrade gate is the default')} ⚑ — it drops the sign-in link, greets them by name and sends them to Portal’s plans panel rather than its signup panel.`)}
    ${K.sel('Tiers', o.tiers || 'From Ghost, visible only', `From Ghost, visible only · From Ghost, all · Off. Reads ${code(hb('#get "tiers"'))}; ${b('the user cannot add or remove a tier here')} ⚑ — tiers are Ghost objects and are edited in Ghost.`)}
    ${K.sel('What is above the cut', 'Ghost’s preview, unchanged', `Read-only. ${b('The theme receives the free portion and nothing else')} ⚑. The section cannot lengthen, shorten or restore the preview; ${b('the fade is drawn over text the browser already has')}, and everything below the cut was never sent.`, true)}
    ${K.sel('Where every action goes', 'Ghost Portal', `Read-only. ${b('Signup, sign-in, checkout and plan changes are Portal’s')} ⚑ — the theme draws the trigger and Portal draws the rest, over the page. ${b('This is the category’s boundary')} and no control moves it.`, true)}
  </div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.count} CONTROLS + THE SOURCE</span></div>`;
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${sourceGroup(o.source)}${foot}</div>`;
  const settles = `<div style="width:948px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">WHAT THIS PANEL SETTLES</span>${o.settles.map(s => `<span>${s}</span>`).join('')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${side}${settles}</div>`;
}

return { ...K, PK, ARTICLE, CUT_LABEL, GATE, INCLUDED, LEDGER, boundary, portalNote, AM, rgb0,
  postHead, preview, cutLine, accessEyebrow, gateHead, action, included, meter, tierCards,
  below, frame, scene, stateTiles, landingTiles, GATE_LABEL, LAND_LABEL,
  designPicker, sourceGroup, panel };
})();
