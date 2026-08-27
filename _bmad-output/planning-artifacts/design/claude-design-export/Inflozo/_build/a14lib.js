// A14 Galleries — shared frame builders. Paper pack tokens; A1/A3/A6/A17/A19/A20/A16 components.
globalThis.A14LIB = (function () {

const L = { dark:false, bg:'#FBF9F5', surf:'#FFFFFF', hover:'#F4F0E8', text:'#232019', muted:'#6B6459',
  border:'#EBE5DB', accent:'#D96C3F', onAccent:'#FFFFFF', contrast:'#232019', carried:'#FBF9F5',
  stripe:'repeating-linear-gradient(45deg,#EDE4D8 0 10px,#E5DACB 10px 20px)', shadow:'0 4px 16px rgba(28,27,26,.08)', sm:'0 1px 2px rgba(28,27,26,.06)' };
const D = { dark:true, bg:'#171511', surf:'#211D17', hover:'#2A251E', text:'#F2EDE4', muted:'#A79E8F',
  border:'#332E27', accent:'#E0805A', onAccent:'#171511', contrast:'#EDE7DA', carried:'#171511',
  stripe:'repeating-linear-gradient(45deg,#3A342B 0 10px,#332E26 10px 20px)', shadow:'none', sm:'none' };

const PACKS = {
  paper: { name:'Paper', head:'Georgia,serif', body:"'Inter',sans-serif", r:8, l:L, d:D },
  studio:{ name:'Studio', head:"'Bricolage Grotesque',sans-serif", body:"'Inter',sans-serif", r:2,
    l:{ dark:false, bg:'#F4F4F2', surf:'#FFFFFF', hover:'#EAEAE6', text:'#141414', muted:'#5F5F5A', border:'#E0E0DA', accent:'#2E5BFF', onAccent:'#FFFFFF', contrast:'#141414', carried:'#F4F4F2', stripe:'repeating-linear-gradient(45deg,#E6E6E2 0 10px,#DEDED9 10px 20px)', shadow:'0 4px 16px rgba(20,20,20,.08)', sm:'0 1px 2px rgba(20,20,20,.06)' },
    d:{ dark:true, bg:'#101010', surf:'#191919', hover:'#222222', text:'#F2F2F0', muted:'#9C9C97', border:'#2C2C2C', accent:'#6B8CFF', onAccent:'#101010', contrast:'#EDEDEA', carried:'#101010', stripe:'repeating-linear-gradient(45deg,#2A2A2A 0 10px,#242424 10px 20px)', shadow:'none', sm:'none' } },
  garden:{ name:'Garden', head:"'Bricolage Grotesque',sans-serif", body:"'Inter',sans-serif", r:20,
    l:{ dark:false, bg:'#F6F8F3', surf:'#FFFFFF', hover:'#EAEFE4', text:'#1E2A20', muted:'#5E6D60', border:'#DEE6D8', accent:'#3F7D4E', onAccent:'#FFFFFF', contrast:'#1E2A20', carried:'#F6F8F3', stripe:'repeating-linear-gradient(45deg,#E3EBDC 0 10px,#DAE3D2 10px 20px)', shadow:'0 4px 16px rgba(30,42,32,.08)', sm:'0 1px 2px rgba(30,42,32,.06)' },
    d:{ dark:true, bg:'#121712', surf:'#1B211B', hover:'#232A23', border:'#2E362E', text:'#EEF3EA', muted:'#9EAB9C', accent:'#69A878', onAccent:'#121712', contrast:'#E7EEE2', carried:'#121712', stripe:'repeating-linear-gradient(45deg,#2A322A 0 10px,#242B24 10px 20px)', shadow:'none', sm:'none' } }
};

const MONO = "'JetBrains Mono',monospace";
const G = w => w === 1440 ? { m:72, box:1296, pad:96, bar:60 } : w === 834 ? { m:40, box:754, pad:80, bar:60 } : { m:20, box:350, pad:64, bar:52 };

/* ── on-ground derivation · A17·7, carried verbatim ───────────────────── */
function ground(t, kind, p) {
  p = p || PACKS.paper; const r = p.r;
  if (kind === 'contrast') {
    const c = t.contrast, on = t.carried, rgb = t.dark ? '23,21,17' : '251,249,245';
    return { name:'contrast', bg:c, text:on, muted:`rgba(${rgb},.72)`, border:`rgba(${rgb},.20)`,
      plane:`rgba(${rgb},.06)`, btnBg:on, btnText:c, r, pack:p, t,
      stripe: t.dark ? 'repeating-linear-gradient(45deg,#D9D2C3 0 10px,#CFC7B6 10px 20px)' : 'repeating-linear-gradient(45deg,#3A342B 0 10px,#332E26 10px 20px)' };
  }
  if (kind === 'surface') {
    return { name:'surface', bg:t.surf, text:t.text, muted:t.muted, border:t.border,
      plane:t.hover, btnBg:t.accent, btnText:t.onAccent, r, pack:p, t, stripe:t.stripe };
  }
  return { name:'page', bg:t.bg, text:t.text, muted:t.muted, border:t.border,
    plane:t.surf, btnBg:t.accent, btnText:t.onAccent, r, pack:p, t, stripe:t.stripe };
}

/* ── chrome ───────────────────────────────────────────────────────────── */
function siteBar(t, w, p) {
  p = p || PACKS.paper; const g = G(w);
  const nav = w === 390
    ? `<span style="font-size:18px;color:${t.text}">☰</span>`
    : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${p.body}"><span>Reporting</span><span>Interviews</span><span style="color:${t.text};font-weight:600">Photography</span><span>Writers</span></div>`;
  return `<div style="height:${g.bar}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${t.border};padding:0 ${g.m}px">
      <div style="display:flex;align-items:center;gap:10px"><span style="width:24px;height:24px;border-radius:${Math.min(p.r,7)}px;background:${t.accent}"></span><span style="font-family:${p.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>${nav}</div>`;
}
function neighbour(t, w, p) {
  p = p || PACKS.paper; const g = G(w);
  return `<div style="padding:0 ${g.m}px 28px"><div style="height:22px;display:flex;align-items:flex-end"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">A25·1 ARTICLE BODY CONTINUES BELOW · NOT THIS SECTION · DRAWN AT LOW OPACITY</span></div>
    <div style="opacity:.4;padding-top:14px;border-top:1px solid ${t.border};margin-top:10px;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:${t.muted};font-family:${p.body}"><span>The estuary is measured twice a day, and has been since 1911.</span><span>Continue reading →</span></div></div>`;
}
function frame(t, w, inner, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const sh = t.dark ? '0 12px 40px rgba(0,0,0,.34)' : '0 12px 40px rgba(28,27,26,.14)';
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:${sh};overflow:hidden;box-sizing:border-box">${o.noBar ? '' : siteBar(t, w, p)}${inner}${o.noFoot ? '' : neighbour(t, w, p)}</div>`;
}
function padTop(t, w, note) {
  const g = G(w);
  return `<div style="height:${g.pad}px;display:flex;align-items:flex-end;padding-bottom:4px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${g.pad} · A14'S OWN TOP PADDING${note ? ' · ' + note : ' · A14 SITS INSIDE A PAGE OR AN ARTICLE ⚑'}</span></div>`;
}
const padBot = (t, w) => `<div style="height:${G(w).pad}px"></div>`;
const gap = h => `<div style="height:${h}px"></div>`;

/* ── head ─────────────────────────────────────────────────────────────── */
function eyebrow(g, txt) {
  return `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">${txt}</span>`;
}
function heading(g, txt, size, tag) {
  tag = tag || 'h2';
  return `<${tag} style="margin:0;font-family:${g.pack.head};font-size:${size}px;font-weight:700;line-height:1.1;letter-spacing:-0.03em;color:${g.text};text-wrap:pretty">${txt}</${tag}>`;
}
function blurb(g, txt, max, size) {
  return `<p style="margin:0;font-size:${size || 17}px;line-height:1.6;color:${g.muted};font-family:${g.pack.body};max-width:${max}px;text-wrap:pretty">${txt}</p>`;
}
function headBlock(g, w, o) {
  o = o || {};
  const hs = o.hSize || (w === 1440 ? 40 : w === 834 ? 34 : 28);
  const al = o.align || 'left';
  const parts = [];
  if (o.eyebrowText !== false) parts.push(eyebrow(g, o.eyebrowText || GAL.eyebrow) + gap(14));
  if (o.headingText !== false) parts.push(heading(g, o.headingText || GAL.heading, hs, o.tag) + gap(o.blurbText === false ? 0 : 16));
  if (o.blurbText !== false) parts.push(blurb(g, o.blurbText || GAL.blurb, o.measure || 560, w === 390 ? 16 : 17));
  return `<div style="display:flex;flex-direction:column;${al === 'center' ? 'align-items:center;text-align:center;' : ''}max-width:${o.max || 720}px${al === 'center' ? ';margin:0 auto' : ''}">${parts.join('')}</div>`;
}
function creditEl(g, o) {
  o = o || {};
  if (o.credit === false) return '';
  return `<span style="font-size:13px;color:${g.muted};font-family:${g.pack.body}">${o.creditText || GAL.credit}</span>`;
}

/* ── fixtures · Orbit Weekly ──────────────────────────────────────────── */
const GAL = {
  eyebrow: 'Photo essay',
  heading: 'The estuary, twice a day',
  blurb: 'Twelve mornings on the Tagus between April and July, at the two hours when the river is worked.',
  credit: 'Photographs by Marta Sequeira'
};
const IMAGES = [
  { n:1,  cap:'The 06:12 ferry leaving Cais do Sodré', nat:[3,2] },
  { n:2,  cap:'Ana Reis, harbourmaster, on the north jetty', nat:[4,5] },
  { n:3,  cap:'Salt pans at Alcochete, drained for the season', nat:[3,2] },
  { n:4,  cap:'A crew change at the Trafaria terminal', nat:[1,1] },
  { n:5,  cap:'The last of the sardine boats, Seixal', nat:[3,2] },
  { n:6,  cap:'Reeds on the mudflats at first light', nat:[4,5] },
  { n:7,  cap:'Mooring ropes, Doca de Belém', nat:[1,1] },
  { n:8,  cap:'Hugo Marques mending a net he has mended before', nat:[3,2] },
  { n:9,  cap:'The tide gauge at Pedrouços, read twice a day', nat:[4,5] },
  { n:10, cap:'Storm light over the Vasco da Gama bridge', nat:[16,9] },
  { n:11, cap:'A flamingo count in progress, Ponta da Erva', nat:[3,2] },
  { n:12, cap:'The estuary from the ferry, 18:40', nat:[3,2] }
];
const take = n => IMAGES.slice(0, n);
const DATES = ['12 April', '12 April', '19 April', '3 May', '3 May', '17 May', '17 May', '31 May', '14 June', '28 June', '5 July', '5 July'];

/* ── the crop rule · settlement 2 ─────────────────────────────────────── */
const RATIO = { 'Square':[1,1], 'Landscape':[4,3], 'Portrait':[3,4], 'Wide':[16,9] };
const two = n => (n < 10 ? '0' : '') + n;
function hFor(w, item, crop) {
  if (!crop || crop === 'As uploaded') return Math.round(w * item.nat[1] / item.nat[0]);
  const r = RATIO[crop] || RATIO.Landscape;
  return Math.round(w * r[1] / r[0]);
}
function cropLabel(item, crop, extra) {
  const nat = item.nat.join(':');
  if (!crop || crop === 'As uploaded') return `${two(item.n)} · ${nat} · AS UPLOADED${extra ? ' · ' + extra : ''}`;
  const r = (RATIO[crop] || RATIO.Landscape).join(':');
  return `${two(item.n)} · ${r}${r === nat ? '' : ` ← ${nat} ⚑`}${extra ? ' · ' + extra : ''}`;
}

/* ── the striped plate · A1's placeholder, carried verbatim ───────────── */
function plate(t, g, o) {
  o = o || {};
  const r = o.r === undefined ? g.r : o.r;
  return `<span style="display:flex;${o.w ? `width:${o.w}px;` : 'width:100%;'}height:${o.h}px;border-radius:${r}px;background:${o.stripe || g.stripe || t.stripe};align-items:flex-end;padding:${o.pad === undefined ? 9 : o.pad}px;box-sizing:border-box;flex-shrink:0;overflow:hidden;position:relative">${o.cap === false ? '' : `<span style="font-family:${MONO};font-size:${o.capSize || 10}px;color:${o.capCol || t.muted};line-height:1.3">${o.cap || ''}</span>`}${o.over || ''}</span>`;
}
const scrim = h => `<span style="position:absolute;left:0;right:0;bottom:0;height:${h}px;background:linear-gradient(180deg, rgba(35,32,25,0) 0%, rgba(35,32,25,.34) 42%, rgba(35,32,25,.66) 100%)"></span>`;

/* ── the frame · A14's own unit: plate, optional caption, one link ────── */
function captionEl(g, txt, o) {
  o = o || {};
  return `<figcaption style="font-size:${o.size || 14}px;line-height:1.5;color:${o.col || g.muted};font-family:${g.pack.body};max-width:${o.max || 'none'}${o.max ? 'px' : ''};text-wrap:pretty">${txt}</figcaption>`;
}
function figureEl(t, g, item, o) {
  o = o || {};
  const w = o.w, h = o.h || hFor(w, item, o.crop);
  const capOn = o.captions === 'Under each' || o.captions === 'Under the frame' || o.captions === 'Beside';
  const missing = o.noCap;
  const inner = plate(t, g, { w:o.fill ? undefined : w, h, r:o.r, cap:cropLabel(item, o.crop, o.plateNote), capCol:o.capCol, stripe:o.stripe, over:o.over });
  const cap = capOn && !missing ? captionEl(g, item.cap, { max:o.capMax || w, size:o.capSize }) : '';
  const num = o.number ? `<span style="font-family:${MONO};font-size:11px;color:${g.muted}">${two(item.n)}</span>` : '';
  return `<figure style="margin:0;${o.fill ? 'flex:1;min-width:0;' : `width:${w}px;`}display:flex;flex-direction:column;gap:${o.capGap || 10}px">${inner}${num}${cap}</figure>`;
}

/* ── the grid · the category's default arrangement ────────────────────── */
function gridBlock(t, g, o) {
  o = o || {};
  const items = o.items || take(o.n || 6);
  const cols = o.cols || 3, gp = o.gap === undefined ? 24 : o.gap;
  const cw = Math.floor((o.box - gp * (cols - 1)) / cols);
  return `<div style="display:flex;flex-wrap:wrap;gap:${o.rowGap === undefined ? gp + 8 : o.rowGap}px ${gp}px;width:${o.box}px;align-items:flex-start">${
    items.map((it, i) => figureEl(t, g, it, { ...o, w:cw, noCap:o.noCapAt === i })).join('')}</div>`;
}

/* ── masonry · CSS column-count, nothing measures, nothing packs ⚑ ────── */
function masonryBlock(t, g, o) {
  o = o || {};
  const items = o.items || take(o.n || 9);
  const cols = o.cols || 3, gp = o.gap === undefined ? 24 : o.gap;
  const cw = Math.floor((o.box - gp * (cols - 1)) / cols);
  const per = Math.ceil(items.length / cols);
  const chunks = [];
  for (let i = 0; i < cols; i++) chunks.push(items.slice(i * per, (i + 1) * per));
  return `<div style="display:flex;gap:${gp}px;width:${o.box}px;align-items:flex-start">${
    chunks.map(ch => `<div style="display:flex;flex-direction:column;gap:${gp}px;width:${cw}px">${
      ch.map(it => figureEl(t, g, it, { ...o, crop:'As uploaded', w:cw })).join('')}</div>`).join('')}</div>`;
}

/* ── carousel furniture · A19·15's dots and arrows, carried verbatim ──── */
function dotsRow(g, n, active, o) {
  o = o || {};
  return `<div style="display:flex;align-items:center;gap:8px;height:44px">${
    Array.from({ length:n }).map((_, i) => `<span style="height:8px;width:${i === active ? 24 : 8}px;border-radius:99px;background:${i === active ? (o.on || g.t.accent) : g.border};display:block"></span>`).join('')}</div>`;
}
function arrowBtn(g, dir, o) {
  o = o || {};
  return `<span style="width:44px;height:44px;border:1px solid ${g.border};border-radius:${Math.min(g.r, 8)}px;display:inline-flex;align-items:center;justify-content:center;font-size:16px;color:${o.dim ? g.muted : g.text};background:${o.fill || 'transparent'};box-sizing:border-box">${dir === 'prev' ? '←' : '→'}</span>`;
}
function counterEl(g, i, n) {
  return `<span style="font-family:${MONO};font-size:12px;color:${g.muted}">${two(i)} / ${two(n)}</span>`;
}

/* ── the lightbox · A14's own, one overlay for all fifteen designs ────── */
function lightboxEl(t, o) {
  o = o || {};
  const w = o.w || 604, h = o.h || 392;
  const ink = 'rgba(23,21,17,.88)';
  const iw = Math.min(w - 96, 430), ih = Math.round(iw * 2 / 3);
  return `<div style="width:${w}px;height:${h}px;border-radius:8px;overflow:hidden;position:relative;background:${t.bg};box-sizing:border-box">
    <div style="opacity:.28;pointer-events:none">${o.behind || ''}</div>
    <div style="position:absolute;inset:0;background:${ink};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;box-sizing:border-box">
      <div style="position:absolute;top:14px;left:18px;font-family:${MONO};font-size:11px;color:rgba(251,249,245,.72)">${two(o.i || 3)} / ${two(o.n || 12)}</div>
      <div style="position:absolute;top:10px;right:14px;width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#FBF9F5;border:1px solid rgba(251,249,245,.28);box-sizing:border-box">✕</div>
      <div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#FBF9F5;border:1px solid rgba(251,249,245,.28);box-sizing:border-box">←</div>
      <div style="position:absolute;right:14px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#FBF9F5;border:1px solid rgba(251,249,245,.28);box-sizing:border-box">→</div>
      <span style="width:${iw}px;height:${ih}px;border-radius:8px;background:${L.stripe};display:flex;align-items:flex-end;padding:9px;box-sizing:border-box"><span style="font-family:${MONO};font-size:10px;color:#6B6459">03 · 3:2 · FULL SIZE, NEVER THE CROP ⚑</span></span>
      <span style="font-size:14px;line-height:1.5;color:#FBF9F5;font-family:'Inter',sans-serif;text-align:center;max-width:${iw}px">${o.cap || IMAGES[2].cap}</span>
    </div></div>`;
}

/* ── canvas scaffolding ───────────────────────────────────────────────── */
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
const sub = txt => `<span style="font-family:${MONO};font-size:11px;color:#6E6A64">${txt}</span>`;

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

/* ── control panel ────────────────────────────────────────────────────── */
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
function txt(label, value, help) {
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:${PC.mute}">${label}</span><div style="height:36px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;padding:0 11px"><span style="font-size:12.5px;color:${PC.ink};font-family:${MONO}">${value}</span></div>${help ? `<span style="font-size:11px;color:${PC.mute};line-height:1.5">${help}</span>` : ''}</div>`;
}
function repeater(o) {
  const rows = o.items.map(i => `<div style="display:flex;align-items:center;gap:8px;height:${o.thumbs ? 40 : 32}px;background:${PC.white};border:1px solid ${PC.line};border-radius:7px;padding:0 9px"><span style="font-size:10px;color:${PC.dim}">${o.reorder === false ? '·' : '⠿'}</span>${o.thumbs ? `<span style="width:34px;height:26px;border-radius:4px;background:${L.stripe};flex-shrink:0"></span>` : ''}<span style="font-size:12px;color:${PC.ink};flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${i}</span><span style="font-size:11px;color:${PC.dim}">✕</span></div>`).join('');
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:${PC.mute}">${o.label}</span>
    <div style="display:flex;flex-direction:column;gap:5px">${rows}</div>
    <div style="height:30px;border:1px dashed ${PC.line};border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11.5px;color:${o.addOff ? '#B8B2A8' : PC.mute};${o.addOff ? 'text-decoration:line-through;' : ''}">${o.add}</div>
    ${o.help ? `<span style="font-size:11px;color:${PC.mute};line-height:1.5">${o.help}</span>` : ''}</div>`;
}
function designPicker(name, n, subtitle) {
  return `<div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid ${PC.line};padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:${PC.mute}">Design</span>
      <div style="height:38px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${name}</span><span style="font-size:10px;color:${PC.dim}">${n} / 15 ▾</span></div>
      <span style="font-size:11px;color:${PC.mute};line-height:1.5">${subtitle}</span>
    </div>`;
}
// the images block — the item list itself, identical in all fifteen designs, not counted
function imagesGroup(o) {
  o = o || {};
  const shown = o.items || ['01 · The 06:12 ferry leaving Cais…', '02 · Ana Reis, harbourmaster, on…', '03 · Salt pans at Alcochete, dra…', '04 · A crew change at the Trafar…'];
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE IMAGES BLOCK · IDENTICAL IN ALL FIFTEEN DESIGNS · NOT COUNTED</span>
    ${repeater({ label:`Images · ${o.count || 12}`, thumbs:true, items:shown, add:'+ Add images', help:`${b('Add opens the media picker and may take several files at once')} ⚑; they land last, ${b('in the order they were chosen')}. Never a blank frame ⚑. Drag to reorder — ${b('authored order is drawn order in all fifteen designs')}. Remove is on the row and undoable. ${b('1–48')} ⚑; ${b('Add is disabled at 48')} with the reason shown.` })}
    <span style="font-size:11px;color:${PC.mute};line-height:1.5">${b('Selecting a frame on the canvas opens that image’s own fields and nothing else')} ⚑ — ${b('image, alt, caption, link')}. ${b('No layout, spacing, alignment or emphasis is editable inside an item')}: every design control writes one value onto the section, so “make frame 3 bigger” is not expressible by construction ⚑.</span>
    ${o.extra || ''}</div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.count}</span></div>`;
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${imagesGroup(o.images)}${foot}</div>`;
  const settles = `<div style="width:948px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">WHAT THIS PANEL SETTLES</span>${o.settles.map(s => `<span>${s}</span>`).join('')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${side}${settles}</div>`;
}
function specCards(cols) {
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${cols.map(c =>
    `<div style="width:634px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${c.map(s => `<span>${s}</span>`).join('')}</div>`).join('')}</div>`;
}
const specRow = (n, name, body) => `${b(n + ' · ' + name + '.')} ${body}`;
function tile(o) {
  return `<div style="background:${o.bg || '#FFFFFF'};border:1px solid ${o.border || '#EBE5DB'};border-radius:10px;padding:${o.pad || 18}px;box-sizing:border-box;${o.w ? `width:${o.w}px;` : ''}display:flex;flex-direction:column;gap:${o.gap || 10}px;${o.style || ''}">
    ${o.label ? `<span style="font-family:${MONO};font-size:10px;letter-spacing:.05em;color:${o.labelCol || '#6E6A64'}">${o.label}</span>` : ''}${o.body}</div>`;
}
function textTile(o) {
  return tile({ w:o.w || 652, label:o.label, bg:o.bg || '#F7F5F2', border:'#E7E2DB',
    body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;${o.min ? `min-height:${o.min}px` : ''}">${o.body.map(x => `<span>${x}</span>`).join('')}</div>` });
}
function tableCard(o) {
  const head = `<div style="display:flex;gap:0;border-bottom:1px solid ${PC.line};padding-bottom:9px">${o.cols.map((c, i) => `<span style="width:${o.widths[i]}px;font-family:${MONO};font-size:10px;letter-spacing:.05em;color:${PC.mute}">${c}</span>`).join('')}</div>`;
  const rows = o.rows.map(r => `<div style="display:flex;gap:0;padding:8px 0;border-bottom:1px solid #F1EDE6">${r.map((c, i) => `<span style="width:${o.widths[i]}px;font-size:12px;line-height:1.5;color:#3A3835;padding-right:12px;box-sizing:border-box">${c}</span>`).join('')}</div>`).join('');
  return `<div style="width:${o.w || 1288}px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column">${head}${rows}</div>`;
}

return { L, D, PACKS, MONO, G, ground, siteBar, neighbour, frame, padTop, padBot, gap,
  eyebrow, heading, blurb, headBlock, creditEl, GAL, IMAGES, DATES, take, RATIO, two, hFor, cropLabel,
  plate, scrim, captionEl, figureEl, gridBlock, masonryBlock, dotsRow, arrowBtn, counterEl, lightboxEl,
  DOC_HEAD, DOC_TAIL, cap, note, code, b, sub, section, intro, wrapIf,
  seg, sel, txt, repeater, designPicker, imagesGroup, panel, specCards, specRow, tile, textTile, tableCard, PC };
})();
