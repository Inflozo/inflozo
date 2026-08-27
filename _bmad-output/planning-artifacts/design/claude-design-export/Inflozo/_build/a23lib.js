// A23 Search — shared frame builders. Paper pack tokens; A1/A4/A17/A18/A22 components carried.
globalThis.A23LIB = (function () {

const L = { dark:false, bg:'#FBF9F5', surf:'#FFFFFF', hover:'#F4F0E8', text:'#232019', muted:'#6B6459',
  border:'#EBE5DB', accent:'#D96C3F', onAccent:'#FFFFFF', contrast:'#232019', carried:'#FBF9F5',
  tint:'rgba(217,108,63,.16)', stripe:'repeating-linear-gradient(45deg,#EDE4D8 0 10px,#E5DACB 10px 20px)',
  shadow:'0 4px 16px rgba(28,27,26,.08)', sm:'0 1px 2px rgba(28,27,26,.06)', dim:'rgba(35,32,25,.42)' };
const D = { dark:true, bg:'#171511', surf:'#211D17', hover:'#2A251E', text:'#F2EDE4', muted:'#A79E8F',
  border:'#332E27', accent:'#E0805A', onAccent:'#171511', contrast:'#EDE7DA', carried:'#171511',
  tint:'rgba(224,128,90,.22)', stripe:'repeating-linear-gradient(45deg,#3A342B 0 10px,#332E26 10px 20px)',
  shadow:'none', sm:'none', dim:'rgba(9,8,6,.62)' };

const PACKS = {
  paper: { name:'Paper', head:'Georgia,serif', body:"'Inter',sans-serif", r:8, l:L, d:D },
  studio:{ name:'Studio', head:"'Bricolage Grotesque',sans-serif", body:"'Inter',sans-serif", r:2,
    l:{ dark:false, bg:'#F4F4F2', surf:'#FFFFFF', hover:'#EAEAE6', text:'#141414', muted:'#5F5F5A', border:'#E0E0DA', accent:'#2E5BFF', onAccent:'#FFFFFF', contrast:'#141414', carried:'#F4F4F2', tint:'rgba(46,91,255,.14)', stripe:'repeating-linear-gradient(45deg,#E6E6E2 0 10px,#DEDED9 10px 20px)', shadow:'0 4px 16px rgba(20,20,20,.08)', sm:'0 1px 2px rgba(20,20,20,.06)', dim:'rgba(20,20,20,.42)' },
    d:{ dark:true, bg:'#101010', surf:'#191919', hover:'#222222', text:'#F2F2F0', muted:'#9C9C97', border:'#2C2C2C', accent:'#6B8CFF', onAccent:'#101010', contrast:'#EDEDEA', carried:'#101010', tint:'rgba(107,140,255,.22)', stripe:'repeating-linear-gradient(45deg,#2A2A2A 0 10px,#242424 10px 20px)', shadow:'none', sm:'none', dim:'rgba(0,0,0,.62)' } },
  garden:{ name:'Garden', head:"'Bricolage Grotesque',sans-serif", body:"'Inter',sans-serif", r:20,
    l:{ dark:false, bg:'#F6F8F3', surf:'#FFFFFF', hover:'#EAEFE4', text:'#1E2A20', muted:'#5E6D60', border:'#DEE6D8', accent:'#3F7D4E', onAccent:'#FFFFFF', contrast:'#1E2A20', carried:'#F6F8F3', tint:'rgba(63,125,78,.16)', stripe:'repeating-linear-gradient(45deg,#E3EBDC 0 10px,#DAE3D2 10px 20px)', shadow:'0 4px 16px rgba(30,42,32,.08)', sm:'0 1px 2px rgba(30,42,32,.06)', dim:'rgba(30,42,32,.42)' },
    d:{ dark:true, bg:'#121712', surf:'#1B211B', hover:'#232A23', border:'#2E362E', text:'#EEF3EA', muted:'#9EAB9C', accent:'#69A878', onAccent:'#121712', contrast:'#E7EEE2', carried:'#121712', tint:'rgba(105,168,120,.22)', stripe:'repeating-linear-gradient(45deg,#2A322A 0 10px,#242B24 10px 20px)', shadow:'none', sm:'none', dim:'rgba(0,0,0,.6)' } }
};

const HEAD = 'Georgia,serif', BODY = "'Inter',sans-serif", MONO = "'JetBrains Mono',monospace";
const G = w => w === 1440 ? { m:72, box:1296, pad:96, bar:60 } : w === 834 ? { m:40, box:754, pad:80, bar:60 } : { m:20, box:350, pad:64, bar:52 };

// ── on-ground derivation · A17·7's rule, carried ────────────────────────
function ground(t, kind, p) {
  p = p || PACKS.paper;
  const r = p.r;
  if (kind === 'contrast') {
    const c = t.contrast, on = t.carried, base = t.dark ? '23,21,17' : '251,249,245';
    return { name:'contrast', bg:c, text:on, muted:`rgba(${base},.72)`, border:`rgba(${base},.20)`,
      fieldBg:`rgba(${base},.08)`, plate:`rgba(${base},.07)`, btnBg:on, btnText:c, ph:`rgba(${base},.62)`,
      tint:`rgba(${base},.16)`, r, t };
  }
  if (kind === 'image') {
    return { name:'image', bg:'transparent', text:'#FBF9F5', muted:'rgba(251,249,245,.80)',
      border:'rgba(251,249,245,.28)', fieldBg:'rgba(251,249,245,.14)', plate:'rgba(251,249,245,.10)',
      btnBg:'#FBF9F5', btnText:'#232019', ph:'rgba(251,249,245,.72)', tint:'rgba(251,249,245,.20)', r, t };
  }
  if (kind === 'surface') {
    return { name:'surface', bg:t.surf, text:t.text, muted:t.muted, border:t.border, fieldBg:t.bg,
      plate:t.hover, btnBg:t.accent, btnText:t.onAccent, ph:t.muted, tint:t.tint, r, t };
  }
  return { name:'page', bg:t.bg, text:t.text, muted:t.muted, border:t.border, fieldBg:t.surf,
    plate:t.surf, btnBg:t.accent, btnText:t.onAccent, ph:t.muted, tint:t.tint, r, t };
}

// ── chrome ──────────────────────────────────────────────────────────────
function siteBar(t, w, p, o) {
  p = p || PACKS.paper; o = o || {}; const g = G(w);
  const glyph = `<span style="width:38px;height:38px;border-radius:${Math.min(p.r,8)}px;display:flex;align-items:center;justify-content:center;font-size:19px;line-height:1;color:${o.searchOn ? t.text : t.muted};${o.searchOn ? `background:${t.hover};` : ''}">⌕</span>`;
  const nav = w === 390
    ? `<div style="display:flex;align-items:center;gap:4px">${glyph}<span style="font-size:18px;color:${t.text}">☰</span></div>`
    : `<div style="display:flex;align-items:center;gap:16px;font-size:15px;color:${t.muted};font-family:${p.body}"><span>Reporting</span><span>Interviews</span><span>Writers</span>${glyph}<span style="padding:9px 17px;border-radius:${Math.min(p.r,8)}px;background:${t.accent};color:${t.onAccent};font-size:14px;font-weight:600">Subscribe</span></div>`;
  return `<div style="height:${g.bar}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${t.border};padding:0 ${g.m}px">
      <div style="display:flex;align-items:center;gap:10px"><span style="width:24px;height:24px;border-radius:${Math.min(p.r,7)}px;background:${t.accent}"></span><span style="font-family:${p.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>${nav}</div>`;
}

function neighbour(t, w, p) {
  p = p || PACKS.paper; const g = G(w);
  return `<div style="padding:0 ${g.m}px 28px"><div style="height:22px;display:flex;align-items:flex-end"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">A3·1 MINIMAL LINE FOOTER BELOW · NOT THIS SECTION · DRAWN AT LOW OPACITY</span></div>
    <div style="opacity:.4;padding-top:14px;border-top:1px solid ${t.border};margin-top:10px;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:${t.muted};font-family:${p.body}"><span>© 2026 Orbit Weekly</span><span>Privacy · Terms · Published with Ghost</span></div></div>`;
}

function frame(t, w, inner, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const sh = t.dark ? '0 12px 40px rgba(0,0,0,.34)' : '0 12px 40px rgba(28,27,26,.14)';
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:${sh};overflow:hidden;box-sizing:border-box;${o.style || ''}">${o.noBar ? '' : siteBar(t, w, p, o)}${inner}${o.noFoot ? '' : neighbour(t, w, p)}</div>`;
}

function padTop(t, w, note) {
  const g = G(w);
  return `<div style="height:${g.pad}px;display:flex;align-items:flex-end;padding-bottom:4px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${g.pad} · A23'S OWN TOP PADDING${note ? ' · ' + note : ' · A23 SITS ON A ROUTE IT CANNOT SEE ⚑'}</span></div>`;
}
const padBot = (t, w) => `<div style="height:${G(w).pad}px"></div>`;

// ── head pieces ─────────────────────────────────────────────────────────
const gap = h => `<div style="height:${h}px"></div>`;
function eyebrow(g, txt, p) {
  p = p || PACKS.paper;
  return `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${p.body}">${txt}</span>`;
}
function heading(g, txt, size, p, tag) {
  p = p || PACKS.paper; tag = tag || 'h2';
  return `<${tag} style="margin:0;font-family:${p.head};font-size:${size}px;font-weight:700;line-height:1.1;letter-spacing:-0.03em;color:${g.text};text-wrap:pretty">${txt}</${tag}>`;
}
function blurb(g, txt, max, p, size) {
  p = p || PACKS.paper;
  return `<p style="margin:0;font-size:${size || 17}px;line-height:1.6;color:${g.muted};font-family:${p.body};max-width:${max}px;text-wrap:pretty">${txt}</p>`;
}
function headBlock(g, w, o, p) {
  p = p || PACKS.paper;
  const al = o.align || 'left';
  const hs = o.hSize || (w === 1440 ? 40 : w === 834 ? 34 : 28);
  const items = [];
  if (o.eyebrow !== false) items.push(eyebrow(g, o.eyebrowText || 'The archive', p) + gap(14));
  if (o.headingText) items.push(heading(g, o.headingText, hs, p, o.tag) + gap(o.blurbText ? 16 : 0));
  if (o.blurbText) items.push(blurb(g, o.blurbText, o.measure || 560, p, w === 390 ? 16 : 17));
  return `<div style="display:flex;flex-direction:column;${al === 'center' ? 'align-items:center;text-align:center;' : ''}max-width:${o.max || 720}px${al === 'center' ? ';margin:0 auto' : ''}">${items.join('')}</div>`;
}

// ── the search field · A4·15's 52 px field, carried verbatim ────────────
// state: empty | focus | typed | searching | submitted
function searchField(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const h = o.h || 52, st = o.state || 'empty';
  const filled = o.treatment === 'filled';
  let border = `1px solid ${g.border}`, bg = filled ? g.plate : g.fieldBg, txt = g.ph;
  let val = o.ph || 'Search 412 essays and interviews';
  if (st === 'focus') { border = `1.5px solid ${g.name === 'contrast' || g.name === 'image' ? g.text : (o.accent || g.btnBg)}`; }
  if (st === 'typed' || st === 'searching' || st === 'submitted') { txt = g.text; val = o.typed || 'orbital'; }
  if (st === 'focus' && o.typedOnFocus) { txt = g.text; val = o.typed || 'orbital'; }
  const clear = (st === 'typed' || st === 'searching' || st === 'submitted')
    ? `<span style="width:${o.clearBox || 32}px;height:${o.clearBox || 32}px;border-radius:${Math.min(g.r,8)}px;background:${g.name === 'page' ? g.plate : 'transparent'};border:1px solid ${g.border};display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;color:${g.muted};flex-shrink:0">✕</span>` : '';
  const trailing = st === 'searching'
    ? `<span style="font-family:${MONO};font-size:11px;color:${g.muted};flex-shrink:0">SEARCHING…</span>`
    : clear;
  const pad = st === 'focus' ? 15.5 : 16;
  return `<span style="${o.full ? 'width:100%;' : `width:${o.w || 520}px;`}height:${h}px;background:${bg};border:${border};border-radius:${o.r === undefined ? g.r : o.r}px;display:flex;align-items:center;gap:${o.gap || 11}px;padding:0 ${o.pxRight === undefined ? pad : o.pxRight}px 0 ${pad}px;box-sizing:border-box;font-family:${p.body};${o.style || ''}">
    <span style="font-size:${o.glyph || 19}px;line-height:1;color:${st === 'empty' ? g.ph : g.text};flex-shrink:0">⌕</span>
    <span style="flex:1;font-size:${o.fs || 16}px;color:${txt};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${val}</span>${trailing}</span>`;
}

// ── the match mark · A23's own · 16% accent tint, text unchanged ────────
function hl(g, s, q, on) {
  if (on === false || !q) return s;
  const re = new RegExp('(' + q + ')', 'gi');
  return s.replace(re, `<mark style="background:${g.tint};color:inherit;border-radius:3px;padding:0 1px">$1</mark>`);
}

// ── the result row · A18·2's thumb row, on A18's 820 measure ────────────
function resultRow(t, g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const q = o.q === undefined ? 'orbital' : o.q;
  const dens = o.density === undefined ? 24 : o.density;
  const measure = o.measure || 820;
  const thumbW = o.thumb || 0;
  const thumb = thumbW ? plate(t, { w:thumbW, h:Math.round(thumbW / 1.5), cap:thumbW >= 128 ? 'FEATURE IMAGE' : '', r:g.r, pack:p }) : '';
  const metaBits = [];
  if (o.meta !== 'none') {
    if (o.meta !== 'date') metaBits.push(o.tag);
    if (o.meta !== 'tag') metaBits.push(o.a);
    metaBits.push(o.d);
    if (o.read !== false) metaBits.push(o.r_);
  }
  const meta = metaBits.length ? `<span style="font-size:13px;line-height:1.5;color:${g.muted};font-family:${p.body}">${metaBits.filter(Boolean).join(' · ')}</span>` : '';
  const excerpt = o.excerpt === false ? '' : `<span style="font-size:15px;line-height:1.55;color:${g.muted};font-family:${p.body};max-width:${measure}px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:${o.clampOne ? 'nowrap' : 'normal'}">${hl(g, o.x, q, o.markOn)}</span>`;
  const title = `<span style="font-family:${p.head};font-size:${o.titleSize || 21}px;font-weight:700;line-height:1.25;letter-spacing:-0.01em;color:${g.text};max-width:${measure}px;display:block;text-wrap:pretty">${hl(g, o.t, q, o.markOn)}</span>`;
  const hung = o.hung ? `<span style="width:200px;text-align:right;flex-shrink:0;font-size:13px;line-height:1.5;color:${g.muted};font-family:${p.body}">${o.d}${o.read === false ? '' : ' · ' + o.r_}</span>` : '';
  const body = `<div style="display:flex;flex-direction:column;gap:${o.gapIn || 7}px;flex:1;min-width:0">${title}${excerpt}${o.hung ? '' : meta}</div>`;
  const inner = o.thumbSide === 'right'
    ? `${body}${thumb ? `<div style="margin-left:20px">${thumb}</div>` : ''}${hung}`
    : `${thumb ? `<div style="margin-right:20px">${thumb}</div>` : ''}${body}${hung}`;
  return `<div style="display:flex;align-items:${o.align || 'flex-start'};padding:${dens}px 0;${o.rule === false ? '' : `border-top:1px solid ${g.border};`}${o.first && o.rule !== false ? '' : ''}${o.bg ? `background:${o.bg};` : ''}${o.style || ''}">${inner}</div>`;
}

const RESULTS = [
  { t:'The orbital mechanics of a two-person newsroom', tag:'Reporting', a:'Ida Brandt', d:'14 Aug 2026', r_:'9 min',
    x:'Two editors, one week, and a production schedule that only holds because nobody takes Friday off.' },
  { t:'What we learned printing an orbital atlas by hand', tag:'Craft', a:'Tomás Herrera', d:'2 Aug 2026', r_:'6 min',
    x:'Eleven plates, four proofs and a colour we could not match until the fifth attempt.' },
  { t:'Orbital debris, and the people who count it', tag:'Reporting', a:'Nadia Okonjo', d:'27 Jul 2026', r_:'12 min',
    x:'A catalogue of 36,000 objects is maintained by fewer people than work on this paper.' },
  { t:'A field guide to orbital photography at dusk', tag:'Pictures', a:'Ida Brandt', d:'19 Jul 2026', r_:'5 min',
    x:'What the picture desk carries, and the twenty minutes in which any of it is useful.' },
  { t:'Interview: the engineer who names orbital paths', tag:'Interviews', a:'Sam Whitfield', d:'11 Jul 2026', r_:'8 min',
    x:'Naming is the last human step in a process that is otherwise entirely arithmetic.' },
  { t:'Corrections, week 28: orbital heights', tag:'Corrections', a:'The desk', d:'7 Jul 2026', r_:'2 min',
    x:'We had the altitude wrong by a factor of ten, and three readers wrote in the same hour.' }
];
const RECENT = ['orbital debris', 'letterpress', 'Nadia Okonjo'];
const MOSTREAD = [
  { t:'The quiet return of the personal homepage', m:'Reporting · 9 min' },
  { t:'Six writers on the tools they refuse to use', m:'Interviews · 14 min' },
  { t:'How the Friday letter gets made', m:'Craft · 7 min' }
];
const CHIPS = ['Reporting', 'Interviews', 'Pictures', 'Craft', 'Corrections'];

function rows(t, g, o) {
  o = o || {};
  const n = o.n || 4;
  const list = (o.list || RESULTS).slice(0, n);
  return `<div style="display:flex;flex-direction:column;${o.width ? `width:${o.width}px;` : ''}${o.style || ''}">${
    list.map((r, i) => resultRow(t, g, { ...r, ...o, first:i === 0, rule:i === 0 ? (o.ruleFirst !== false) : (o.rule !== false) })).join('')}</div>`;
}

// ── the count line · A17's count line, public wording ───────────────────
function countLine(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return `<div style="display:flex;align-items:baseline;gap:8px;font-family:${p.body}">
    <span style="font-size:${o.fs || 15}px;color:${g.muted}">${o.text || '12 results for'} ${o.q === false ? '' : `<span style="color:${g.text};font-weight:600">“${o.query || 'orbital'}”</span>`}</span>${o.right || ''}</div>`;
}

// ── suggestion / recent row · 44 px, A1·9's suggestion row ─────────────
function suggestRow(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return `<div style="height:${o.h || 44}px;display:flex;align-items:center;gap:11px;padding:0 ${o.px === undefined ? 16 : o.px}px;box-sizing:border-box;${o.active ? `background:${g.plate};` : ''}border-radius:${o.active ? Math.min(g.r, 8) + 'px' : '0'};${o.style || ''}">
    <span style="font-size:14px;line-height:1;color:${g.muted};flex-shrink:0;width:16px;text-align:center">${o.glyph || '↺'}</span>
    <span style="font-size:${o.fs || 15}px;color:${g.text};font-family:${p.body};flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${o.label}</span>
    ${o.meta ? `<span style="font-size:13px;color:${g.muted};font-family:${p.body};flex-shrink:0">${o.meta}</span>` : ''}
    ${o.trail ? `<span style="font-size:13px;color:${g.muted};font-family:${p.body};flex-shrink:0">${o.trail}</span>` : ''}</div>`;
}

// ── tag chip · A17·15's filter pill, carried verbatim ──────────────────
function chip(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const act = o.active;
  return `<span style="height:${o.h || 36}px;display:inline-flex;align-items:center;padding:0 ${o.px || 15}px;border-radius:${o.pill ? 18 : Math.min(g.r, 8)}px;font-size:14px;font-weight:${act ? 600 : 500};font-family:${p.body};box-sizing:border-box;${
    act ? `background:${g.btnBg};color:${g.btnText};` : (o.filled ? `background:${g.plate};color:${g.text};` : `border:1px solid ${g.border};color:${g.muted};`)}">${o.label}${o.count ? `<span style="font-size:12px;margin-left:7px;opacity:.7">${o.count}</span>` : ''}</span>`;
}

// ── keycap · mono, for the palette footer and the keyboard model ───────
function keycap(g, txt, p) {
  p = p || PACKS.paper;
  return `<span style="min-width:20px;height:20px;padding:0 5px;border:1px solid ${g.border};border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-family:${MONO};font-size:11px;color:${g.muted};box-sizing:border-box">${txt}</span>`;
}
function keyHint(g, pairs, p) {
  p = p || PACKS.paper;
  return `<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">${pairs.map(([k, l]) =>
    `<span style="display:inline-flex;align-items:center;gap:6px">${keycap(g, k, p)}<span style="font-size:12.5px;color:${g.muted};font-family:${p.body}">${l}</span></span>`).join('')}</div>`;
}

// ── the no-match block · A23's own ─────────────────────────────────────
function noResults(g, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  return `<div style="display:flex;flex-direction:column;${o.align === 'center' ? 'align-items:center;text-align:center;' : ''}gap:${o.gap || 14}px;${o.width ? `width:${o.width}px;` : ''}${o.style || ''}">
    <span style="font-family:${p.head};font-size:${o.size || 24}px;font-weight:700;line-height:1.25;color:${g.text}">No matches for “${o.query || 'helioseismology'}”</span>
    <span style="font-size:15px;line-height:1.6;color:${g.muted};font-family:${p.body};max-width:${o.measure || 520}px">${o.text || 'Nothing in the archive uses that word. Try a shorter query, or start from a section.'}</span>
    ${o.chips === false ? '' : `<div style="display:flex;gap:8px;flex-wrap:wrap;${o.align === 'center' ? 'justify-content:center;' : ''}margin-top:2px">${CHIPS.slice(0, o.chipN || 5).map(c => chip(g, { label:c, pack:p })).join('')}</div>`}
    ${o.link === false ? '' : `<span style="font-size:14px;font-weight:500;color:${g.text};font-family:${p.body};text-decoration:underline;text-underline-offset:3px;margin-top:2px">Browse the archive →</span>`}</div>`;
}

// ── striped image plate ───────────────────────────────────────────────
function plate(t, o) {
  const p = o.pack || PACKS.paper;
  return `<span style="width:${o.w}${typeof o.w === 'number' ? 'px' : ''};height:${o.h}${typeof o.h === 'number' ? 'px' : ''};border-radius:${o.r === undefined ? p.r : o.r}px;background:${t.stripe};display:flex;align-items:flex-end;padding:${o.pad === undefined ? 10 : o.pad}px;box-sizing:border-box;flex-shrink:0;${o.style || ''}">${o.cap ? `<span style="font-family:${MONO};font-size:10px;color:${t.muted}">${o.cap}</span>` : ''}</span>`;
}

// ── the panel · A1·1's dropdown panel geometry, widened ───────────────
function panelEl(t, g, o) {
  o = o || {};
  return `<div style="width:${o.w || 640}px;background:${t.surf};border:1px solid ${t.border};border-radius:${g.r + 4}px;box-shadow:${t.dark ? '0 18px 48px rgba(0,0,0,.5)' : '0 18px 48px rgba(28,27,26,.16)'};overflow:hidden;box-sizing:border-box;${o.style || ''}">${o.body}</div>`;
}

// a dimmed page behind an overlay, with the panel over it
function overlayScene(t, w, o) {
  o = o || {}; const p = o.pack || PACKS.paper; const g = G(w);
  const ghost = `<div style="padding:0 ${g.m}px;opacity:.5"><div style="height:34px"></div>
    <div style="width:${Math.round(g.box * 0.52)}px;height:${w === 390 ? 26 : 34}px;background:${t.border};border-radius:6px"></div>
    <div style="height:18px"></div><div style="width:${Math.round(g.box * 0.7)}px;height:14px;background:${t.border};border-radius:5px"></div>
    <div style="height:10px"></div><div style="width:${Math.round(g.box * 0.6)}px;height:14px;background:${t.border};border-radius:5px"></div>
    <div style="height:26px"></div><div style="display:flex;gap:20px">${[0, 1, 2].map(() => plate(t, { w:Math.round((g.box - 40) / 3), h:w === 390 ? 90 : 150, pack:p })).join('')}</div></div>`;
  return `<div style="position:relative;height:${o.h || 620}px;overflow:hidden">${ghost}
    <div style="position:absolute;inset:0;background:${t.dim}"></div>
    <div style="position:absolute;inset:0;display:flex;justify-content:center;align-items:${o.pos === 'center' ? 'center' : 'flex-start'};padding-top:${o.pos === 'center' ? 0 : (o.top || 72)}px">${o.panel}</div></div>`;
}

// ── canvas scaffolding ────────────────────────────────────────────────
const DOC_HEAD = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"><\/script>
</head>
<body>
<x-dc>
<helmet>
<meta name="design_doc_mode" content="canvas">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  body { margin:0; background:#EDEAE6; font-family:'Inter',sans-serif; color:#1C1B1A; -webkit-font-smoothing:antialiased; }
  a { color:#232019; text-decoration:none; }
  a:hover { color:#D96C3F; }
  mark { background:transparent; color:inherit; }
</style>
</helmet>
`;

const DOC_TAIL = `</x-dc>
<script type="text/x-dc" data-dc-script data-props="{&quot;showControls&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showResponsive&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showDark&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showSpec&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;}}">
class Component extends DCLogic {
  renderVals() {
    return {
      showControls: this.props.showControls ?? true,
      showResponsive: this.props.showResponsive ?? true,
      showDark: this.props.showDark ?? true,
      showSpec: this.props.showSpec ?? true
    };
  }
}
<\/script>
</body>
</html>
`;

const cap = txt => `<div style="font-family:${MONO};font-size:12px;color:#6E6A64">${txt}</div>`;
const note = txt => `<p style="margin:0;font-size:13px;line-height:1.6;color:#6B6459;max-width:1290px">${txt}</p>`;
const code = txt => `<code style="font-family:${MONO};font-size:12px">${txt}</code>`;
const b = txt => `<strong style="font-weight:600">${txt}</strong>`;

function section(label, inner, pad) {
  return `\n<section data-screen-label="${label}" style="padding:${pad || '0 56px 48px'};display:flex;flex-direction:column;gap:16px">\n${inner}\n</section>\n`;
}
function intro(o) {
  return `\n<section style="padding:56px 56px 24px;display:flex;flex-direction:column;gap:14px;max-width:1100px">
  <span style="font-family:${MONO};font-size:12px;color:#6E6A64">${o.rail}</span>
  <h1 style="margin:0;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:46px;letter-spacing:-0.03em;line-height:1.04">${o.title}</h1>
  ${o.paras.map(t => `<p style="margin:0;font-size:16px;line-height:1.6;color:#3A3835;max-width:760px;text-wrap:pretty">${t}</p>`).join('\n  ')}
</section>\n`;
}
const wrapIf = (prop, inner) => `\n<sc-if value="{{ ${prop} }}" hint-placeholder-val="{{ true }}">${inner}</sc-if>\n`;

// ── control panel ─────────────────────────────────────────────────────
const PC = { panel:'#F7F5F2', line:'#E7E2DB', white:'#FFFFFF', mute:'#6E6A64', ink:'#1C1B1A', track:'#EFECE7', lock:'#F2EFEA', dim:'#8A857C' };
function seg(label, values, active, help, disabled) {
  const cells = values.map((v, i) => {
    const off = disabled && disabled.includes(i);
    return `<span style="flex:1;text-align:center;font-size:11.5px;padding:6px 4px;border-radius:24px;${i === active ? `background:${PC.white};box-shadow:0 1px 2px rgba(28,27,26,.06);font-weight:600` : `color:${off ? '#B8B2A8' : PC.mute}${off ? ';text-decoration:line-through' : ''}`}">${v}</span>`;
  }).join('');
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:${PC.mute}">${label}</span><div style="display:flex;background:${PC.track};border-radius:24px;padding:3px">${cells}</div>${help ? `<span style="font-size:11px;color:${PC.mute};line-height:1.5">${help}</span>` : ''}</div>`;
}
function sel(label, value, help, locked) {
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:${PC.mute}">${label}</span><div style="height:36px;background:${locked ? PC.lock : PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:12.5px;color:${locked ? PC.dim : PC.ink}">${value}</span><span style="font-size:10px;color:${PC.dim}">${locked ? '🔒' : '▾'}</span></div>${help ? `<span style="font-size:11px;color:${PC.mute};line-height:1.5">${help}</span>` : ''}</div>`;
}
function designPicker(name, n, sub) {
  return `<div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid ${PC.line};padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:${PC.mute}">Design</span>
      <div style="height:38px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${name}</span><span style="font-size:10px;color:${PC.dim}">${n} / 15 ▾</span></div>
      <span style="font-size:11px;color:${PC.mute};line-height:1.5">${sub}</span>
    </div>`;
}
// ── the universal trio · outside every placeable section's own list ───
function trioRow(label, values, active, help) {
  const cells = values.map((v, i) => `<span style="flex:1;text-align:center;font-size:11px;padding:5px 4px;border-radius:24px;${i === active ? `background:${PC.white};box-shadow:0 1px 2px rgba(28,27,26,.06);font-weight:600;color:${PC.ink}` : `color:${PC.mute}`}">${v}</span>`).join('');
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:${PC.mute}">${label}</span><div style="display:flex;background:${PC.track};border-radius:24px;padding:3px">${cells}</div><span style="font-size:11px;color:${PC.mute};line-height:1.5">${help}</span></div>`;
}
function panelNote(label, text) {
  return `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;flex-direction:column;gap:10px"><span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">${label}</span><span style="font-size:11px;color:${PC.mute};line-height:1.5">${text}</span></div>`;
}
function universalTrio(o) {
  o = o || {};
  const bg = o.bgLocked
    ? sel('Background role', o.bgValue || 'Locked', `Locked ⚑. ${o.bgHelp} ${b('The reason is shown in the row rather than the row being hidden')}.`, true)
    : trioRow('Background role', ['Background', 'Surface', 'Contrast'], o.bgActive === undefined ? 0 : o.bgActive,
        o.bgHelp || `Background · Surface · Contrast. ${b('The role moves the ground under the whole section')} ⚑ — field, count line and rows together, never one of them.`);
  const vs = trioRow('Vertical spacing', ['Compact', 'Comfortable', 'Spacious'], 1,
    o.vsHelp || `Resolves 64 · 96 · 132; 80 at 834, 64 at 390. ${b('This is the retired Padding row under its real name')} — one ladder, not two.`);
  const td = trioRow('Top divider', ['None', 'Line', 'Fade'], 0,
    o.tdHelp || 'None · Line · Fade, drawn above the section on the page ground.');
  return `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;flex-direction:column;gap:10px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE UNIVERSAL TRIO · EVERY PLACEABLE SECTION · OUTSIDE THIS DESIGN’S LIST</span>${bg}${vs}${td}</div>`;
}
// the shared Search source group — seven rows where a design draws results, not counted
function sourceGroup(o) {
  o = o || {};
  const mark = o.mark === false ? '' : seg('Match highlight', ['Marked', 'Plain'], 0, o.markHelp ||
    `A real ${code('&lt;mark&gt;')} at 16 % accent, 22 % in dark, ${b('in the title and the excerpt and never in the meta')} ⚑. At Plain it is absent from the DOM rather than untinted. ${b('Promoted here from 11 Thumb Rows')}, so every design that draws a result governs it in the same row ⚑.`);
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">${o.head || 'THE SEARCH SOURCE · SEVEN ROWS · IDENTICAL WHEREVER RESULTS ARE DRAWN · NOT COUNTED'}</span>
    ${sel('What it searches', o.scope || 'Posts and pages', o.scopeHelp || `Posts · Posts and pages · Posts, pages and tags · Everything, including authors. ${b('Ghost decides what a theme can reach')}; this row says which of it this section asks for ⚑.`)}
    ${sel('Search in', o.searchIn || 'Titles and excerpts', o.searchInHelp || `Titles and excerpts · Full content. ${b('Full content is available here and is not in Ghost’s own bundle')} ⚑ — A23’s index is client-side over the Content API, which can return ${code('plaintext')}. ${b('It costs index size')}: roughly 4–8 kB a post, so a 400-post archive fetches a few megabytes before the first query. ${b('Titles and excerpts is the default')}, and this row is what the read-only line below reports.`)}
    ${sel('Before a query', o.before || 'Recent searches, then featured', o.beforeHelp || `Recent searches, then featured · Featured posts · Latest posts · Nothing. ${b('Recent searches are the reader’s own')} and never leave their browser ⚑; a first visit falls through to the second value. ${b('“Most read” is gone')} ⚑ — Ghost gives a theme no view counts, so it was a promise the platform cannot keep.`)}
    ${sel('Start searching after', o.min || '3 characters', `2 · 3 · 4 characters. A1·9’s three-character minimum and 200 ms debounce, carried ⚑.`)}
    ${sel('How many results', o.many || '20', `10 · 20 · 50 · All matches. ${b('The cap is the section’s, not Ghost’s')} — the count line always names the true total ⚑.`)}
    ${mark}
    ${sel('What is indexed', o.indexed || 'Title, excerpt and slug', o.indexedHelp || `Read-only, and ${b('it follows Search in')} ⚑. At Titles and excerpts it reads ${b('title, excerpt and slug')}; at Full content, ${b('title, excerpt, slug and body text')}. ${code('emptyText')}’s default follows the same value, which is why that sentence is a field and not a string.`, true)}
  </div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.foot || o.count + ' OF ITS OWN · TRIO · SOURCE'}</span></div>`;
  const trio = o.trio === false ? panelNote('THE UNIVERSAL TRIO · NOT DRAWN HERE ⚑', o.trioNote) : universalTrio(o.trio);
  const editing = o.editing ? panelNote(o.editingLabel || 'EDITING · THE P0 PRIMITIVES', o.editing) : '';
  const content = o.content ? panelNote(o.contentLabel || 'CONTENT · THE P0·3 ITEM CONTROLS', o.content) : '';
  const data = o.data ? panelNote(o.dataLabel || 'DATA · GHOST’S OWN, AND NEVER AN AUTHORED LIST', o.data) : '';
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${trio}${sourceGroup(o.source)}${content}${editing}${data}${foot}</div>`;
  const settles = `<div style="width:948px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">WHAT THIS PANEL SETTLES</span>${o.settles.map(s => `<span>${s}</span>`).join('')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${side}${settles}</div>`;
}

// ── spec cards ────────────────────────────────────────────────────────
function specCards(cols) {
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${cols.map(c =>
    `<div style="width:634px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${c.map(s => `<span>${s}</span>`).join('')}</div>`).join('')}</div>`;
}
function specRow(n, name, body) { return `${b(n + ' · ' + name + '.')} ${body}`; }

function tile(o) {
  return `<div style="background:${o.bg || '#FFFFFF'};border:1px solid ${o.border || '#EBE5DB'};border-radius:10px;padding:${o.pad === undefined ? 18 : o.pad}px;box-sizing:border-box;${o.w ? `width:${o.w}px;` : ''}display:flex;flex-direction:column;gap:${o.gap || 10}px;${o.style || ''}">
    ${o.label ? `<span style="font-family:${MONO};font-size:10px;letter-spacing:.05em;color:${o.labelCol || '#6E6A64'}">${o.label}</span>` : ''}${o.body}</div>`;
}
function table(o) {
  const th = `<div style="display:flex;gap:0;border-bottom:1px solid ${PC.line};padding-bottom:8px;margin-bottom:2px">${o.cols.map((c, i) =>
    `<span style="width:${o.widths[i]}px;font-family:${MONO};font-size:10px;letter-spacing:.05em;color:${PC.mute};flex-shrink:0">${c}</span>`).join('')}</div>`;
  const tr = o.rows.map(r => `<div style="display:flex;gap:0;padding:7px 0;border-bottom:1px solid #F1EDE6">${r.map((c, i) =>
    `<span style="width:${o.widths[i]}px;font-size:12.5px;line-height:1.5;color:${i === 0 ? '#1C1B1A' : '#3A3835'};${i === 0 ? 'font-weight:600;' : ''}flex-shrink:0;padding-right:12px;box-sizing:border-box">${c}</span>`).join('')}</div>`).join('');
  return `<div style="width:${o.w || 1288}px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column">${th}${tr}</div>`;
}

return { L, D, PACKS, HEAD, BODY, MONO, G, ground, siteBar, neighbour, frame, padTop, padBot,
  gap, eyebrow, heading, blurb, headBlock, searchField, hl, resultRow, rows, countLine, suggestRow,
  chip, keycap, keyHint, noResults, plate, panelEl, overlayScene, RESULTS, RECENT, MOSTREAD, CHIPS,
  DOC_HEAD, DOC_TAIL, cap, note, code, b, section, intro, wrapIf, seg, sel, designPicker,
  sourceGroup, panel, specCards, specRow, tile, table, PC, trioRow, universalTrio, panelNote };
})();
