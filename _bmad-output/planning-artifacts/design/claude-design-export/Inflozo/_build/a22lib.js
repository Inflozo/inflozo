// A22 Newsletter — shared frame builders. Paper pack tokens, A1/A3/A6/A17/A21 components.
globalThis.A22LIB = (function () {

const L = { dark:false, bg:'#FBF9F5', surf:'#FFFFFF', hover:'#F4F0E8', text:'#232019', muted:'#6B6459',
  border:'#EBE5DB', accent:'#D96C3F', onAccent:'#FFFFFF', contrast:'#232019', carried:'#FBF9F5',
  stripe:'repeating-linear-gradient(45deg,#EDE4D8 0 10px,#E5DACB 10px 20px)', shadow:'0 4px 16px rgba(28,27,26,.08)', sm:'0 1px 2px rgba(28,27,26,.06)' };
const D = { dark:true, bg:'#171511', surf:'#211D17', hover:'#2A251E', text:'#F2EDE4', muted:'#A79E8F',
  border:'#332E27', accent:'#E0805A', onAccent:'#171511', contrast:'#EDE7DA', carried:'#171511',
  stripe:'repeating-linear-gradient(45deg,#3A342B 0 10px,#332E26 10px 20px)', shadow:'none', sm:'none' };

// three packs for the tokenisation proof
const PACKS = {
  paper: { name:'Paper', head:'Georgia,serif', body:"'Inter',sans-serif", r:8,
    l:L, d:D },
  studio:{ name:'Studio', head:"'Bricolage Grotesque',sans-serif", body:"'Inter',sans-serif", r:2,
    l:{ dark:false, bg:'#F4F4F2', surf:'#FFFFFF', hover:'#EAEAE6', text:'#141414', muted:'#5F5F5A', border:'#E0E0DA', accent:'#2E5BFF', onAccent:'#FFFFFF', contrast:'#141414', carried:'#F4F4F2', stripe:'repeating-linear-gradient(45deg,#E6E6E2 0 10px,#DEDED9 10px 20px)', shadow:'0 4px 16px rgba(20,20,20,.08)', sm:'0 1px 2px rgba(20,20,20,.06)' },
    d:{ dark:true, bg:'#101010', surf:'#191919', hover:'#222222', text:'#F2F2F0', muted:'#9C9C97', border:'#2C2C2C', accent:'#6B8CFF', onAccent:'#101010', contrast:'#EDEDEA', carried:'#101010', stripe:'repeating-linear-gradient(45deg,#2A2A2A 0 10px,#242424 10px 20px)', shadow:'none', sm:'none' } },
  garden:{ name:'Garden', head:"'Bricolage Grotesque',sans-serif", body:"'Inter',sans-serif", r:20,
    l:{ dark:false, bg:'#F6F8F3', surf:'#FFFFFF', hover:'#EAEFE4', text:'#1E2A20', muted:'#5E6D60', border:'#DEE6D8', accent:'#3F7D4E', onAccent:'#FFFFFF', contrast:'#1E2A20', carried:'#F6F8F3', stripe:'repeating-linear-gradient(45deg,#E3EBDC 0 10px,#DAE3D2 10px 20px)', shadow:'0 4px 16px rgba(30,42,32,.08)', sm:'0 1px 2px rgba(30,42,32,.06)' },
    d:{ dark:true, bg:'#121712', surf:'#1B211B', hover:'#232A23', border:'#2E362E', text:'#EEF3EA', muted:'#9EAB9C', accent:'#69A878', onAccent:'#121712', contrast:'#E7EEE2', carried:'#121712', stripe:'repeating-linear-gradient(45deg,#2A322A 0 10px,#242B24 10px 20px)', shadow:'none', sm:'none' } }
};

const HEAD = 'Georgia,serif', BODY = "'Inter',sans-serif", MONO = "'JetBrains Mono',monospace";
const hb = s => '{&#8203;{' + s + '}&#8203;}';
const G = w => w === 1440 ? { m:72, box:1296, pad:96, bar:60 } : w === 834 ? { m:40, box:754, pad:80, bar:60 } : { m:20, box:350, pad:64, bar:52 };

// ── on-ground derivation ────────────────────────────────────────────────
// Every colour a section draws comes from the ground it rests on.
function ground(t, kind, p) {
  p = p || PACKS.paper;
  const r = p.r;
  if (kind === 'contrast') {
    const c = t.contrast, on = t.carried;
    return { name:'contrast', bg:c, text:on, muted:`rgba(${t.dark?'23,21,17':'251,249,245'},.72)`,
      border:`rgba(${t.dark?'23,21,17':'251,249,245'},.20)`, fieldBg:`rgba(${t.dark?'23,21,17':'251,249,245'},.08)`,
      btnBg:on, btnText:c, ph:`rgba(${t.dark?'23,21,17':'251,249,245'},.62)`, r };
  }
  if (kind === 'image') {
    return { name:'image', bg:'transparent', text:'#FBF9F5', muted:'rgba(251,249,245,.80)',
      border:'rgba(251,249,245,.28)', fieldBg:'rgba(251,249,245,.14)', btnBg:'#FBF9F5', btnText:'#232019',
      ph:'rgba(251,249,245,.72)', r };
  }
  if (kind === 'surface') {
    return { name:'surface', bg:t.surf, text:t.text, muted:t.muted, border:t.border, fieldBg:t.bg,
      btnBg:t.accent, btnText:t.onAccent, ph:t.muted, r };
  }
  return { name:'page', bg:t.bg, text:t.text, muted:t.muted, border:t.border, fieldBg:t.surf,
    btnBg:t.accent, btnText:t.onAccent, ph:t.muted, r };
}

// ── chrome ──────────────────────────────────────────────────────────────
function siteBar(t, w, p) {
  p = p || PACKS.paper; const g = G(w);
  const nav = w === 390
    ? `<span style="font-size:18px;color:${t.text}">☰</span>`
    : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${p.body}"><span>Reporting</span><span>Interviews</span><span>Writers</span><span style="color:${t.text};font-weight:600">Subscribe</span></div>`;
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
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:${sh};overflow:hidden;box-sizing:border-box">${o.noBar ? '' : siteBar(t, w, p)}${inner}${o.noFoot ? '' : neighbour(t, w, p)}</div>`;
}

// section padding label — A21's convention
function padTop(t, w, note) {
  const g = G(w);
  return `<div style="height:${g.pad}px;display:flex;align-items:flex-end;padding-bottom:4px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${g.pad} · A22'S OWN TOP PADDING${note ? ' · ' + note : ' · A22 SITS BETWEEN PAGE SECTIONS ⚑'}</span></div>`;
}
const padBot = (t, w) => `<div style="height:${G(w).pad}px"></div>`;

// ── content pieces ──────────────────────────────────────────────────────
function eyebrow(g, w, txt, p) {
  p = p || PACKS.paper;
  return `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${p.body}">${txt}</span>`;
}
function heading(g, w, txt, size, p, tag) {
  p = p || PACKS.paper; tag = tag || 'h2';
  return `<${tag} style="margin:0;font-family:${p.head};font-size:${size}px;font-weight:700;line-height:1.1;letter-spacing:-0.03em;color:${g.text};text-wrap:pretty">${txt}</${tag}>`;
}
function blurb(g, w, txt, max, p, size) {
  p = p || PACKS.paper;
  return `<p style="margin:0;font-size:${size || (w === 390 ? 16 : 17)}px;line-height:1.6;color:${g.muted};font-family:${p.body};max-width:${max}px;text-wrap:pretty">${txt}</p>`;
}
const gap = h => `<div style="height:${h}px"></div>`;

// head block: eyebrow / heading / blurb, aligned
function headBlock(g, w, o, p) {
  p = p || PACKS.paper;
  const al = o.align || 'left';
  const hs = o.hSize || (w === 1440 ? 40 : w === 834 ? 34 : 28);
  const items = [];
  if (o.eyebrow !== false) items.push(eyebrow(g, w, o.eyebrowText || 'The Friday edition', p) + gap(14));
  if (o.headingText) items.push(heading(g, w, o.headingText, hs, p, o.tag) + gap(o.blurbText ? 16 : 0));
  if (o.blurbText) items.push(blurb(g, w, o.blurbText, o.measure || 560, p));
  return `<div style="display:flex;flex-direction:column;${al === 'center' ? 'align-items:center;text-align:center;' : ''}max-width:${o.max || 720}px${al === 'center' ? ';margin:0 auto' : ''}">${items.join('')}</div>`;
}

// ── the form row · A3·4's component, verbatim ───────────────────────────
// state: empty | focus | invalid | submitting | done | subscribed | membersOff
function fieldEl(g, o) {
  const h = o.h || 46, w = o.w, st = o.state || 'empty', p = o.pack || PACKS.paper;
  let border = `1px solid ${g.border}`, bg = g.fieldBg, txt = g.ph, val = o.ph || 'you@example.com';
  if (st === 'focus') { border = `1.5px solid ${g.name === 'contrast' || g.name === 'image' ? g.text : (o.accent || '#D96C3F')}`; txt = g.text; val = o.typed || 'ida.brandt@'; }
  if (st === 'invalid') { border = `1.5px solid ${g.text}`; txt = g.text; val = o.typed || 'ida.brandt@'; }
  if (st === 'submitting') { border = `1px solid ${g.border}`; bg = o.hover || g.fieldBg; txt = g.muted; val = o.typedFull || 'ida.brandt@orbitweekly.com'; }
  return `<span style="${o.full ? 'width:100%;' : `width:${w}px;`}height:${h}px;background:${bg};border:${border};border-radius:${g.r}px;display:flex;align-items:center;padding:0 ${st === 'focus' || st === 'invalid' ? 13.5 : 14}px;box-sizing:border-box;font-size:${o.fs || 15}px;color:${txt};font-family:${p.body}">${val}</span>`;
}
function btnEl(g, o) {
  const p = o.pack || PACKS.paper;
  const label = o.label || 'Subscribe';
  const dis = o.state === 'submitting';
  return `<span style="${o.full ? 'width:100%;justify-content:center;' : ''}height:${o.h || 46}px;display:inline-flex;align-items:center;background:${g.btnBg};color:${g.btnText};font-size:${o.fs || 15}px;font-weight:600;padding:0 ${o.px || 22}px;border-radius:${g.r}px;font-family:${p.body};box-sizing:border-box;${dis ? 'opacity:.8;' : ''}${o.minW ? `min-width:${o.minW}px;justify-content:center;` : ''}">${dis ? 'Subscribing…' : label}</span>`;
}
function noteEl(g, o) {
  const p = o.pack || PACKS.paper;
  const st = o.state;
  let txt = o.note || 'Free weekly. One click to leave.', col = g.muted, weight = 400;
  if (st === 'invalid') { txt = o.invalidText || 'That address doesn’t look right.'; col = g.text; weight = 500; }
  return `<span style="font-size:13px;line-height:1.5;color:${col};font-weight:${weight};font-family:${p.body}${o.center ? ';text-align:center' : ''}${o.max ? `;max-width:${o.max}px` : ''}">${txt}</span>`;
}

// one complete form: row (or stack) + note, or the done / subscribed panels
function formBlock(g, o) {
  const p = o.pack || PACKS.paper, st = o.state || 'empty';
  const center = o.align === 'center';
  const stack = o.stack;
  const wrap = inner => `<div style="display:flex;flex-direction:column;gap:${o.noteGap || 10}px;${center ? 'align-items:center;' : ''}${o.width ? `width:${o.width}px;` : ''}">${inner}</div>`;

  if (st === 'done') {
    return wrap(`<div style="display:flex;flex-direction:column;gap:6px;${center ? 'align-items:center;text-align:center;' : ''}min-height:${o.doneH || 104}px;justify-content:center">
      <span style="font-family:${p.head};font-size:${o.doneSize || 22}px;font-weight:700;color:${g.text};line-height:1.2">${o.doneHeading || 'Check your inbox'}</span>
      <span style="font-size:15px;line-height:1.6;color:${g.muted};font-family:${p.body};max-width:${o.max || 440}px">${o.doneText || 'We sent a confirmation link to ida.brandt@orbitweekly.com. Open it and you are in.'}</span>
      <span style="font-size:13px;color:${g.muted};font-family:${p.body};text-decoration:underline;text-underline-offset:3px;margin-top:2px">Use a different address</span></div>`);
  }
  if (st === 'subscribed') {
    return wrap(`<div style="display:flex;flex-direction:column;gap:6px;${center ? 'align-items:center;text-align:center;' : ''}min-height:${o.doneH || 104}px;justify-content:center">
      <span style="font-family:${p.head};font-size:${o.doneSize || 22}px;font-weight:700;color:${g.text};line-height:1.2">You are subscribed</span>
      <span style="font-size:15px;line-height:1.6;color:${g.muted};font-family:${p.body};max-width:${o.max || 440}px">${o.subscribedText || 'The Friday edition lands in ida.brandt@orbitweekly.com every week.'}</span>
      <span style="font-size:14px;font-weight:500;color:${g.text};font-family:${p.body};text-decoration:underline;text-underline-offset:3px;margin-top:2px">Manage your preferences →</span></div>`);
  }
  if (st === 'membersOff') {
    return wrap(`<div style="display:flex;${center ? 'justify-content:center;' : ''}">${btnEl(g, { label:o.label || 'Subscribe', pack:p, px:22 })}</div>` +
      noteEl(g, { note:o.note, center, pack:p }));
  }

  const row = stack
    ? `<div style="display:flex;flex-direction:column;gap:8px;${o.width ? 'width:100%;' : ''}">${fieldEl(g, { ...o, full:true, h:o.h || 48, state:st, pack:p })}${btnEl(g, { ...o, full:true, h:o.h || 48, state:st, pack:p })}</div>`
    : `<div style="display:flex;align-items:center;gap:10px;${center ? 'justify-content:center;' : ''}">${fieldEl(g, { ...o, state:st, pack:p })}${btnEl(g, { ...o, state:st, pack:p, minW:o.minW || 126 })}</div>`;
  const note = o.note === false ? '' : noteEl(g, { ...o, state:st, center, pack:p });
  return wrap(row + note);
}

// ── striped image plate ─────────────────────────────────────────────────
function plate(t, o) {
  const p = o.pack || PACKS.paper;
  return `<span style="width:${o.w}${typeof o.w === 'number' ? 'px' : ''};height:${o.h}px;border-radius:${o.r === undefined ? p.r : o.r}px;background:${t.stripe};display:flex;align-items:flex-end;padding:10px;box-sizing:border-box;flex-shrink:0">${o.cap ? `<span style="font-family:${MONO};font-size:10px;color:${t.muted}">${o.cap}</span>` : ''}</span>`;
}

// ── canvas scaffolding ──────────────────────────────────────────────────
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

// ── control panel ───────────────────────────────────────────────────────
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
      <div style="height:38px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${name}</span><span style="font-size:10px;color:${PC.dim}">${n} / 16 ▾</span></div>
      <span style="font-size:11px;color:${PC.mute};line-height:1.5">${sub}</span>
    </div>`;
}
// the shared Newsletter source group — five rows, identical in all sixteen, not counted
function sourceGroup(o) {
  o = o || {};
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE NEWSLETTER SOURCE · IDENTICAL IN ALL SIXTEEN · NOT COUNTED</span>
    ${sel('Which newsletter', o.which || 'The site default', o.whichHelp || `Site default · Let the reader choose · A named newsletter. ${b('Let the reader choose is disabled unless the site has more than one')} ⚑ — Ghost sites ship with exactly one.`)}
    ${sel('Ask for a name', o.name || 'Off', `Off · Optional · Required. Writes Ghost's ${code('name')} field on the member ⚑; adds one field of the same height above the email.`)}
    ${sel('A signed-in subscriber sees', o.signed || 'The subscribed line', `The subscribed line · The form anyway ⚑. ${b('Default is the subscribed line')} — showing a subscriber a signup form is the commonest newsletter defect.`)}
    ${sel('The form posts to', 'Ghost members', `Read-only. ${code('/members/api/send-magic-link/')} — ${b('the section cannot repoint it')} ⚑; a third-party provider is a platform decision, not a section control.`, true)}
    ${sel('When members are disabled', o.membersOff || 'Hide the section', `Hide the section · Head without the form ⚑. ${b('Members off is a site setting')}, not a control — this row says what this section does about it, and the sidebar links to the setting.`)}
  </div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.count} CONTROLS + THE SOURCE</span></div>`;
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${sourceGroup(o.source)}${foot}</div>`;
  const settles = `<div style="width:948px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">WHAT THIS PANEL SETTLES</span>${o.settles.map(s => `<span>${s}</span>`).join('')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${side}${settles}</div>`;
}

// ── spec card ───────────────────────────────────────────────────────────
function specCards(cols) {
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${cols.map(c =>
    `<div style="width:634px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${c.map(s => `<span>${s}</span>`).join('')}</div>`).join('')}</div>`;
}
function specRow(n, name, body) { return `${b(n + ' · ' + name + '.')} ${body}`; }

// a light card used for state / detail grids
function tile(o) {
  return `<div style="background:${o.bg || '#FBF9F5'};border:1px solid ${o.border || '#EBE5DB'};border-radius:10px;padding:${o.pad || 18}px;box-sizing:border-box;${o.w ? `width:${o.w}px;` : ''}display:flex;flex-direction:column;gap:${o.gap || 10}px;${o.style || ''}">
    ${o.label ? `<span style="font-family:${MONO};font-size:10px;letter-spacing:.05em;color:${o.labelCol || '#6E6A64'}">${o.label}</span>` : ''}${o.body}</div>`;
}

return { L, D, PACKS, HEAD, BODY, MONO, hb, G, ground, siteBar, neighbour, frame, padTop, padBot,
  eyebrow, heading, blurb, gap, headBlock, fieldEl, btnEl, noteEl, formBlock, plate,
  DOC_HEAD, DOC_TAIL, cap, note, code, b, section, intro, wrapIf, seg, sel, designPicker,
  sourceGroup, panel, specCards, specRow, tile, PC };
})();
