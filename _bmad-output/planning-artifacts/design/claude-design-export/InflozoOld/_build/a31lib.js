// A31 Error and Utility — shared frame builders. Extends A30LIB (which extends A23LIB).
// A1's button / logo lockup / eyebrow, A4·15 + A23's search field, A16/A30's 46 px field,
// A17's content box and padding ladder, A18's rows, A20's pills, A29's hand-off rule — carried.
// NOTE: literal Handlebars in emitted markup must go through hb().
globalThis.A31LIB = (function () {
const K = globalThis.A30LIB;
const { L, D, PACKS, MONO, b, code, tile, gap, hb } = K;
const PK = PACKS.paper;

/* ── the three pages · one field list, three copy sets · §8·1 ─────────── */
const PAGE = {
  e404: { key:'e404', label:'404', code:'404', eyebrow:'Not found',
    heading:'We can’t find that page',
    blurb:'The link may be old, or the piece may have moved. The archive index is the quickest way to find it again.',
    cta:'Go to the home page', link:'Browse the archive',
    tpl:'error.hbs', at:'AT A 404 · ANY URL GHOST CANNOT MATCH',
    nav:'FULL SITE CHROME · HEADER, NAV, SEARCH AND FOOTER · A 404 IS A PAGE OF A WORKING SITE ⚑',
    may:'MAY QUERY GHOST FREELY · NAVIGATION, POSTS, TAGS, THE SEARCH INDEX' },
  e500: { key:'e500', label:'500', code:'500', eyebrow:'Our end',
    heading:'Something went wrong at our end',
    blurb:'Nothing you did caused this and nothing on your side will fix it. Try the page again in a minute.',
    cta:'Go to the home page', link:'hello@orbitweekly.com',
    tpl:'error.hbs', at:'AT A 500 · THE SAME TEMPLATE, A DIFFERENT STATUS CODE ⚑',
    nav:'THE SITE TITLE AS TEXT AND ONE LINK TO / · NO NAV, NO SEARCH, NO FOOTER ⚑',
    may:'MAY ASK GHOST FOR NOTHING ⚑ · NO {&#8203;{#get}&#8203;}, NO NAVIGATION, NO MEMBER STATE' },
  gate: { key:'gate', label:'PRIVATE', code:'', eyebrow:'Private',
    heading:'Orbit Weekly is private just now',
    blurb:'The desk has the password. If somebody sent you a link, it came with one.',
    cta:'Continue', link:'',
    tpl:'private.hbs', at:'AT /private/ · GHOST’S OWN ROUTE WHEN THE SITE IS PRIVATE',
    nav:'NO NAVIGATION AT ALL ⚑ · NAV LABELS DESCRIBE A SITE THE VISITOR IS NOT IN YET',
    may:'MAY QUERY NOTHING THE VISITOR MAY NOT SEE ⚑ · TITLE AND DESCRIPTION ONLY' }
};
const KINDS = ['e404', 'e500', 'gate'];
const GATE_COPY = {
  fieldLabel: 'Password',
  note: 'Ask whoever sent you the link. We cannot send it to you from here.',
  error: 'Wrong password',
  desc: 'Reporting on the pipes, cables and rails that carry everything else.'
};
const LINKS = [
  ['The archive index', '/archive/'],
  ['This week’s issue', '/issues/28/'],
  ['Write to the desk', '/contact/']
];
const NAVSET = ['Reporting', 'Interviews', 'Pictures', 'Craft', 'Corrections', 'The archive', 'About the desk', 'Newsletter'];
const SEARCH_PH = 'Search 412 essays and interviews';

/* ── the boundary strip · on every frame, naming what the page may do ─── */
function boundary(t, w, kind, extra) {
  const p = PAGE[kind];
  const line = (txt, dim) => `<span style="font-family:${MONO};font-size:10px;color:${t.muted}${dim ? ';opacity:.85' : ''}">${txt}</span>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:9px 18px;align-items:center;padding:9px 0 0">
    ${line(`THEMED · ${p.tpl} · ${p.at}`)}
    ${line(p.may, 1)}
    ${line(p.nav, 1)}
    ${extra ? line(extra, 1) : ''}</div>`;
}

/* ── chrome · what each page keeps · §8·1 ─────────────────────────────── */
function titleBar(t, w, kind, o) {
  o = o || {};
  const g = K.G(w);
  const centre = kind === 'gate';
  const lock = `<div style="display:flex;align-items:center;gap:10px">
      <span style="width:24px;height:24px;border-radius:${Math.min(PK.r, 7)}px;background:${t.accent}"></span>
      <span style="font-family:${PK.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>`;
  const plain = `<span style="font-family:${PK.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span>`;
  const right = kind === 'e500'
    ? `<span style="font-size:14px;font-weight:500;color:${t.text};font-family:${PK.body};text-decoration:underline;text-underline-offset:3px">Home</span>`
    : '';
  return `<div style="height:${g.bar}px;display:flex;align-items:center;${centre ? 'justify-content:center' : 'justify-content:space-between'};border-bottom:1px solid ${t.border};padding:0 ${g.m}px">
    ${kind === 'e500' ? plain : lock}${right}</div>`;
}
function chromeBar(t, w, kind, o) {
  o = o || {};
  return kind === 'e404' ? K.siteBar(t, w, PK, o) : titleBar(t, w, kind, o);
}
function footRow(t, w, kind) {
  const g = K.G(w);
  if (kind === 'e404') {
    return `<div style="padding:0 ${g.m}px ${w === 390 ? 20 : 26}px">
      <span style="font-family:${MONO};font-size:10px;color:${t.muted}">A3·1 MINIMAL LINE FOOTER BELOW · NOT THIS SECTION · DRAWN LOW · THE 404 KEEPS IT ⚑</span>
      <div style="opacity:.4;padding-top:12px;border-top:1px solid ${t.border};margin-top:9px;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:${t.muted};font-family:${PK.body}"><span>© 2026 Orbit Weekly</span><span>Privacy · Terms · Published with Ghost</span></div></div>`;
  }
  const why = kind === 'e500'
    ? 'NO FOOTER ON A 500 ⚑ · EVERY LINK IN A3’S FOOTER IS NAVIGATION, AND NAVIGATION IS DATA'
    : 'NO FOOTER ON THE GATE ⚑ · A FOOTER IS A SITEMAP, AND THE VISITOR IS NOT IN THE SITE YET';
  return `<div style="padding:0 ${g.m}px ${w === 390 ? 18 : 24}px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${why}</span></div>`;
}
const FRAME_H = w => w === 1440 ? 880 : w === 834 ? 800 : 812;

/* the utility page frame: bar, the block on a filled viewport, the foot */
// o: { kind, searchOn, h, top (top-align instead of centre), bleed, extra }
function frame(t, w, inner, o) {
  o = o || {};
  const kind = o.kind || 'e404';
  const g = K.G(w);
  const sh = t.dark ? '0 12px 40px rgba(0,0,0,.34)' : '0 12px 40px rgba(28,27,26,.14)';
  const h = o.h || 'auto';
  const hStyle = h === 'auto' ? `min-height:${FRAME_H(w)}px;` : `height:${h}px;`;
  const align = o.bleed ? 'stretch' : (o.top || w === 390 ? 'flex-start' : 'center');
  const pad = o.bleed ? '' : `padding:${w === 390 ? 64 : 48}px ${g.m}px;`;
  return `<div style="width:${w}px;${hStyle}background:${t.bg};border-radius:8px;box-shadow:${sh};overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;${o.style || ''}">
    ${chromeBar(t, w, kind, o)}
    <div style="padding:0 ${g.m}px">${boundary(t, w, kind, o.extra)}</div>
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:${align};${o.bleed ? '' : 'justify-content:center;'}${pad}box-sizing:border-box">${inner}</div>
    ${footRow(t, w, kind)}</div>`;
}

/* ── the block's parts ───────────────────────────────────────────────── */
const CODE_H = w => w === 1440 ? 156 : w === 834 ? 104 : 68;
function codeChip(g, txt, o) {
  o = o || {};
  return `<span style="display:inline-flex;align-items:center;height:26px;padding:0 11px;border:1px solid ${g.border};border-radius:${o.pill ? 13 : Math.min(g.r, 8)}px;font-family:${MONO};font-size:11.5px;letter-spacing:.06em;color:${g.muted};background:${o.fill ? g.plate : 'transparent'};white-space:nowrap">${txt}</span>`;
}
function codePlain(g, txt) {
  return `<span style="font-family:${MONO};font-size:12px;letter-spacing:.1em;color:${g.muted}">${txt}</span>`;
}
function displayCode(g, txt, size) {
  return `<span style="display:block;font-family:${PK.head};font-size:${size}px;font-weight:700;line-height:.9;letter-spacing:-0.05em;color:${g.text};font-variant-numeric:tabular-nums">${txt}</span>`;
}
function eyebrowEl(g, txt) {
  return `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${PK.body}">${txt}</span>`;
}
// code slot: 'chip' | 'plain' | 'eyebrow' | 'hidden'
function codeSlot(g, kind, o) {
  o = o || {};
  const p = PAGE[kind];
  const style = o.style || 'chip';
  if (style === 'hidden') return '';
  if (style === 'eyebrow') return eyebrowEl(g, p.eyebrow);
  if (style === 'plain') return codePlain(g, p.code ? `${p.code} · ${p.eyebrow.toUpperCase()}` : p.eyebrow.toUpperCase());
  return codeChip(g, p.code ? `${p.code} · ${p.eyebrow}` : p.eyebrow, o);
}
function headingEl(g, w, txt, o) {
  o = o || {};
  const s = o.size || (w === 1440 ? 40 : w === 834 ? 34 : 28);
  return `<h1 style="margin:0;font-family:${PK.head};font-size:${s}px;font-weight:700;line-height:1.12;letter-spacing:-0.03em;color:${g.text};max-width:${o.measure || 620}px;text-wrap:pretty">${txt}</h1>`;
}
function blurbEl(g, w, txt, o) {
  o = o || {};
  return `<p style="margin:0;font-size:${w === 390 ? 16 : 17}px;line-height:1.6;color:${g.muted};font-family:${PK.body};max-width:${o.measure || 560}px;text-wrap:pretty">${txt}</p>`;
}
/* the action pair · A1's primary + a text link · never two buttons ⚑ */
function actions(g, w, kind, o) {
  o = o || {};
  const p = PAGE[kind];
  const narrow = w === 390;
  const full = o.full === undefined ? narrow : o.full;
  const btn = K.btn(g, { label:o.ctaLabel || p.cta, pack:PK, h:o.h || 46, px:22, full });
  let second = '';
  if (kind === 'e404' && o.link !== false) {
    second = `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-underline-offset:3px">${p.link}</span>`;
  } else if (kind === 'e500' && o.link !== false) {
    second = `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;color:${g.muted};font-family:${PK.body}">If it keeps happening, write to <span style="color:${g.text};text-decoration:underline;text-underline-offset:3px;margin-left:4px">${p.link}</span></span>`;
  }
  const row = o.row && !narrow;
  return `<div style="display:flex;${row ? `align-items:center;gap:${o.gap || 20}px;flex-wrap:wrap;` : `flex-direction:column;gap:${o.gap || 8}px;`}${o.align === 'center' ? (row ? 'justify-content:center;' : 'align-items:center;') : ''}${narrow && !o.row ? 'width:100%;' : ''}">${btn}${second}</div>`;
}
/* the authored recovery list · links[] · 'row' | 'rows' | 'cols' */
function linkList(g, o) {
  o = o || {};
  const list = (o.list || LINKS).slice(0, o.n === undefined ? 3 : o.n);
  if (!list.length) return '';
  const label = o.label === false ? '' : `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${PK.body};margin-bottom:${o.style === 'rows' ? 4 : 2}px">${o.labelText || 'Try one of these'}</span>`;
  if (o.style === 'row') {
    return `<div style="display:flex;flex-direction:column;gap:9px;${o.align === 'center' ? 'align-items:center;' : ''}">${label}
      <div style="display:flex;flex-wrap:wrap;gap:8px 18px;${o.align === 'center' ? 'justify-content:center;' : ''}">${list.map(([lab]) =>
        `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:15px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-underline-offset:3px">${lab}</span>`).join('')}</div></div>`;
  }
  if (o.style === 'rows') {
    return `<div style="display:flex;flex-direction:column;${o.w ? `width:${o.w}px;` : 'width:100%;'}">${label}
      ${list.map(([lab, url]) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:${o.dens || 48}px;border-top:1px solid ${g.border}">
        <span style="font-size:15px;font-weight:500;color:${g.text};font-family:${PK.body}">${lab}</span>
        ${o.url === false ? '' : `<span style="font-family:${MONO};font-size:11.5px;color:${g.muted}">${url}</span>`}</div>`).join('')}
      <div style="height:1px;background:${g.border}"></div></div>`;
  }
  return `<div style="display:flex;flex-direction:column;gap:${o.gap || 10}px;${o.align === 'center' ? 'align-items:center;' : ''}">${label}
    ${list.map(([lab]) => `<div style="display:flex;align-items:center;gap:10px;min-height:32px"><span style="font-size:13px;color:${g.muted};flex-shrink:0">→</span>
      <span style="font-size:15px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-underline-offset:3px">${lab}</span></div>`).join('')}</div>`;
}
/* search · A23's 52 px field, 404 only ⚑ */
function searchRow(g, w, o) {
  o = o || {};
  const fw = o.w || (w === 1440 ? 520 : w === 834 ? 460 : undefined);
  return `<div style="display:flex;flex-direction:column;gap:8px;${o.align === 'center' ? 'align-items:center;' : ''}${fw ? '' : 'width:100%;'}">
    ${K.searchField(g, { w:fw, full:!fw, state:o.state || 'empty', ph:SEARCH_PH, pack:PK, treatment:o.treatment })}
    ${o.hint === false ? '' : `<span style="font-family:${MONO};font-size:10px;color:${g.muted}">REAL ${hb('form action="/search/" method="get"')} · IT WORKS WITH NO JAVASCRIPT ⚑ · TITLE, EXCERPT AND SLUG ONLY (A23)</span>`}</div>`;
}
/* ── the private gate's form · four states · §8·2 ─────────────────────── */
// state: empty | focus | typed | error
function pwField(g, o) {
  o = o || {};
  const st = o.state || 'empty';
  const focused = st === 'focus' || st === 'typed';
  const bad = st === 'error';
  let border = `1px solid ${g.border}`;
  if (focused) border = `1.5px solid ${g.name === 'contrast' || g.name === 'image' ? g.text : g.btnBg}`;
  if (bad) border = `1.5px solid ${g.text}`;
  const dots = st === 'typed' ? '••••••••' : '';
  const lab = o.label === false ? '' : `<span style="font-size:13px;font-weight:500;color:${g.text};font-family:${PK.body};line-height:1.3">${GATE_COPY.fieldLabel}</span>`;
  return `<div style="display:flex;flex-direction:column;gap:8px;width:100%;min-width:0">${lab}
    <span style="width:100%;height:${o.h || 46}px;background:${g.fieldBg};border:${border};border-radius:${g.r}px;display:flex;align-items:center;padding:0 ${focused || bad ? 13.5 : 14}px;box-sizing:border-box;font-size:${dots ? 19 : 15}px;letter-spacing:${dots ? '.18em' : '0'};color:${g.text};font-family:${PK.body};overflow:hidden;white-space:nowrap">${dots}${focused && !dots ? `<span style="width:1px;height:19px;background:${g.text}"></span>` : ''}</span></div>`;
}
function gateForm(t, g, w, o) {
  o = o || {};
  const st = o.state || 'empty';
  const narrow = w === 390;
  const fw = o.w || (narrow ? undefined : 380);
  const err = st === 'error'
    ? `<div style="display:flex;align-items:center;gap:9px;padding:${o.errPad || '11px 13px'};border:1px solid ${g.text};border-radius:${g.r}px;background:${g.plate}">
        <span style="font-size:14px;font-weight:600;color:${g.text};font-family:${PK.body}">${GATE_COPY.error}</span>
        <span style="font-family:${MONO};font-size:9.5px;color:${g.muted};margin-left:auto;white-space:nowrap">GHOST’S OWN STRING ⚑</span></div>`
    : '';
  const btn = K.btn(g, { label:PAGE.gate.cta, pack:PK, h:46, px:22, full:o.inline ? false : true, minW:o.inline ? 120 : 0 });
  const inputs = o.inline && !narrow
    ? `<div style="display:flex;align-items:flex-end;gap:10px;width:100%">${pwField(g, { state:st === 'error' ? 'empty' : st, label:o.label })}${btn}</div>`
    : `${pwField(g, { state:st === 'error' ? 'empty' : st, label:o.label })}${btn}`;
  const note = o.note === false ? '' : `<span style="font-size:13px;line-height:1.55;color:${g.muted};font-family:${PK.body};${o.align === 'center' ? 'text-align:center;' : ''}max-width:${o.noteMax || 380}px">${GATE_COPY.note}</span>`;
  const mono = o.mono === false ? '' : `<span style="font-family:${MONO};font-size:10px;color:${g.muted}">NATIVE &lt;form action="/private/?r={&#8203;{@path}&#8203;}" method="post"&gt; · NO MODULE, NO SCRIPT ⚑</span>`;
  return `<div style="display:flex;flex-direction:column;gap:${o.gap || 13}px;${fw ? `width:${fw}px;` : 'width:100%;'}${o.align === 'center' ? 'align-items:center;' : ''}">${err}${inputs}${note}${mono}</div>`;
}

/* ── the whole block · the thing every design arranges ────────────────── */
// o: { kind, align, measure, codeStyle, search, links, linkStyle, row, formState, small, hSize }
function block(t, g, w, o) {
  o = o || {};
  const kind = o.kind || 'e404';
  const p = PAGE[kind];
  const al = o.align === 'center';
  const m = o.measure || 620;
  const parts = [];
  const cs = codeSlot(g, kind, { style:o.codeStyle || 'chip', fill:o.codeFill, pill:o.codePill });
  if (cs) parts.push(cs + gap(o.codeGap || 16));
  parts.push(headingEl(g, w, o.headingText || p.heading, { measure:m, size:o.hSize }));
  if (o.blurb !== false) parts.push(gap(o.blurbGap || 14) + blurbEl(g, w, o.blurbText || p.blurb, { measure:Math.min(m, o.blurbMeasure || 560) }));
  if (kind === 'gate') {
    parts.push(gap(o.formGap || 26) + gateForm(t, g, w, { state:o.formState, align:o.align, inline:o.inline, w:o.formW, label:o.formLabel, mono:o.formMono, note:o.formNote }));
  } else {
    if (kind === 'e404' && o.search) parts.push(gap(o.searchGap || 24) + searchRow(g, w, { align:o.align, w:o.searchW, hint:o.searchHint, treatment:o.searchTreatment }));
    parts.push(gap(o.actionGap || 26) + actions(g, w, kind, { align:o.align, row:o.row, full:o.full, gap:o.actionsGap }));
    if (o.links && kind !== 'e500') {
      parts.push(gap(o.linkGap || 28) + (o.rule === false ? '' : `<div style="width:100%;max-width:${o.ruleMax || m}px;height:1px;background:${g.border}"></div>` + gap(20)) +
        linkList(g, { style:o.linkStyle, align:o.align, w:o.linkW, n:o.linkN, labelText:o.linkLabel, dens:o.linkDens, url:o.linkUrl }));
    }
    if (o.links && kind === 'e500') {
      parts.push(gap(14) + `<span style="font-family:${MONO};font-size:10px;color:${g.muted}">THE AUTHORED LINK LIST IS DROPPED ON A 500 ⚑ · IT IS NAVIGATION, AND ITS TARGETS MAY BE FAILING TOO</span>`);
    }
  }
  return `<div style="display:flex;flex-direction:column;${al ? 'align-items:center;text-align:center;' : ''}width:${o.wrapW || '100%'};${al ? `max-width:${m}px;margin:0 auto;` : ''}${o.style || ''}">${parts.join('')}</div>`;
}

/* ── containers the designs put the block in ─────────────────────────── */
function card(t, g, o) {
  return `<div style="width:${o.w ? o.w + 'px' : '100%'};max-width:100%;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t.dark || o.flat ? '' : `box-shadow:${t.shadow};`}padding:${o.pad || 40}px;box-sizing:border-box;display:flex;flex-direction:column;${o.style || ''}">${o.body}</div>`;
}
function box(t, g, o) {
  return `<div style="width:${o.w ? o.w + 'px' : '100%'};max-width:100%;border:1px solid ${g.border};border-radius:${g.r}px;padding:${o.pad || 36}px;box-sizing:border-box;display:flex;flex-direction:column;${o.style || ''}">${o.body}</div>`;
}
function scrim(t, o) {
  o = o || {};
  const pct = o.pct === undefined ? 45 : o.pct;
  const rgb = t.dark ? '9,8,6' : '35,32,25';
  return `<div style="position:absolute;inset:0;background:rgba(${rgb},.${pct})"></div>`;
}
function cover(t, w, o) {
  return `<div style="position:relative;flex:1;width:100%;min-height:${o.h || 420}px;background:${t.stripe};border-radius:${o.r === undefined ? 0 : o.r}px;overflow:hidden;display:flex;align-items:${o.align || 'center'};justify-content:${o.justify || 'center'}">
    ${scrim(t, { pct:o.pct })}
    <div style="position:relative;padding:${o.pad || 56}px;box-sizing:border-box;width:100%;display:flex;justify-content:${o.justify || 'center'}">${o.body}</div>
    <span style="position:absolute;left:${o.pad || 56}px;bottom:14px;font-family:${MONO};font-size:10px;color:rgba(251,249,245,.78)">${o.cap || 'FULL-BLEED IMAGE · FILLS THE VIEWPORT · THE DESK, PHOTOGRAPHED FROM THE DOOR'}</span></div>`;
}

/* ── the tile grids the page assembler uses ──────────────────────────── */
const TILE_LABEL = {
  e404: '404 · error.hbs AT A 404 · THE FULL SITE CHROME',
  e500: '500 · error.hbs AT A 500 · TITLE AND ONE LINK, NOTHING QUERIED ⚑',
  gate: 'PRIVATE GATE · private.hbs AT /private/ · NO NAVIGATION ⚑',
  empty: 'THE GATE, EMPTY · THE STATE 99 % OF VISITORS SEE',
  focus: 'FOCUSED · 1.5 PX ACCENT BORDER · A6’S RING ON THE BUTTON',
  typed: 'FILLED · EIGHT CHARACTERS · THE BUTTON IS UNCHANGED ⚑',
  error: 'WRONG PASSWORD · A FRESH SERVER RENDER, NOT AN INLINE CHECK ⚑',
  nojs: 'NO JAVASCRIPT · IDENTICAL · THE FORM IS A NATIVE POST ⚑'
};
function tiles(rows, o) {
  o = o || {};
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${rows.join('')}</div>`;
}
function stateTile(label, body, o) {
  o = o || {};
  return tile({ w:o.w || 652, bg:o.bg || '#FFFFFF', border:o.border || '#EBE5DB', pad:o.pad, label,
    body:`<div style="min-height:${o.min || 250}px;display:flex;align-items:${o.center ? 'center' : 'flex-start'}">${body}</div>` });
}
function textTile(label, lines, o) {
  o = o || {};
  return tile({ w:o.w || 652, bg:o.bg || '#F7F5F2', border:o.border || '#E7E2DB', label,
    body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;${o.min ? `min-height:${o.min}px` : ''}">${lines.map(x => `<span>${x}</span>`).join('')}</div>` });
}

/* ── control panel · A31's picker and page-source group ──────────────── */
const PC = K.PC;
function designPicker(name, n, sub) {
  return `<div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid ${PC.line};padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:${PC.mute}">Design</span>
      <div style="height:38px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${name}</span><span style="font-size:10px;color:${PC.dim}">${n} / 10 ▾</span></div>
      <span style="font-size:11px;color:${PC.mute};line-height:1.5">${sub}</span>
    </div>`;
}
function sourceGroup(o) {
  o = o || {};
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE PAGE SOURCE · IDENTICAL IN ALL TEN · NOT COUNTED</span>
    ${K.sel('Which page this is', 'From the status code', `Read-only. ${b('Ghost decides')} — ${code('error.hbs')} at a 404, the same file at a 500, ${code('private.hbs')} at ${code('/private/')} ⚑ — and the section draws the matching copy set. ${b('One design, three pages')}.`, true)}
    ${K.sel('What a 500 may ask Ghost for', 'Nothing', `Read-only. ${b('No ')}${code(hb('#get'))}${b(', no navigation, no member state, no settings image')} ⚑ — a 500 may be the data layer failing, so every query is a second chance to fail. ${b('Static text, the site title and one link to ')}${code('/')}.`, true)}
    ${K.sel('Navigation on this page', o.nav || 'Set by the page', `Read-only. ${b('Full chrome on the 404')} · ${b('title and one link on the 500')} · ${b('none on the gate')} ⚑. A visitor at ${code('/private/')} is not in the site yet, and nav labels describe a site they have not been admitted to.`, true)}
    ${K.sel('Where the gate posts', 'Ghost’s /private/', `Read-only. ${b('A native POST to Ghost’s own route')} ⚑ — ${code('&lt;form action="/private/?r={&#8203;{@path}&#8203;}" method="post"&gt;')}. ${b('The wrong-password message is Ghost’s string')}, not a field; the design decides only where it sits.`, true)}
    ${K.sel('What search reaches', o.search || 'Title, excerpt and slug', `Read-only. A23’s index ⚑ — ${b('body text is not indexed')}. ${b('Search is offered on the 404 only')}: never on a 500 (the index is a request to the site that is failing) and never on the gate.`, true)}
  </div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.count} CONTROLS + THE SOURCE</span></div>`;
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${sourceGroup(o.source)}${foot}</div>`;
  const settles = `<div style="width:948px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">WHAT THIS PANEL SETTLES</span>${o.settles.map(s => `<span>${s}</span>`).join('')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${side}${settles}</div>`;
}

return { ...K, PK, PAGE, KINDS, GATE_COPY, LINKS, NAVSET, SEARCH_PH, boundary, titleBar, chromeBar,
  footRow, FRAME_H, frame, CODE_H, codeChip, codePlain, displayCode, eyebrowEl, codeSlot, headingEl,
  blurbEl, actions, linkList, searchRow, pwField, gateForm, block, card, box, scrim, cover,
  TILE_LABEL, tiles, stateTile, textTile, designPicker, sourceGroup, panel };
})();
