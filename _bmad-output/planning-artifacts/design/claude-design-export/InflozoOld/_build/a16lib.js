// A16 Contact — shared frame builders. Paper pack tokens; A1/A3/A6/A9/A17/A19/A22 components.
globalThis.A16LIB = (function () {

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
const hb = s => '{&#8203;{' + s + '}&#8203;}';
const G = w => w === 1440 ? { m:72, box:1296, pad:96, bar:60 } : w === 834 ? { m:40, box:754, pad:80, bar:60 } : { m:20, box:350, pad:64, bar:52 };

/* ── on-ground derivation · A17·7 ─────────────────────────────────────── */
function ground(t, kind, p) {
  p = p || PACKS.paper; const r = p.r;
  if (kind === 'contrast') {
    const c = t.contrast, on = t.carried, rgb = t.dark ? '23,21,17' : '251,249,245';
    return { name:'contrast', bg:c, text:on, muted:`rgba(${rgb},.72)`, border:`rgba(${rgb},.20)`,
      fieldBg:`rgba(${rgb},.08)`, plane:`rgba(${rgb},.06)`, btnBg:on, btnText:c, ph:`rgba(${rgb},.62)`, r, pack:p, t };
  }
  if (kind === 'image') {
    return { name:'image', bg:'transparent', text:'#FBF9F5', muted:'rgba(251,249,245,.80)',
      border:'rgba(251,249,245,.28)', fieldBg:'rgba(251,249,245,.14)', plane:'rgba(251,249,245,.10)',
      btnBg:'#FBF9F5', btnText:'#232019', ph:'rgba(251,249,245,.72)', r, pack:p, t };
  }
  if (kind === 'surface') {
    return { name:'surface', bg:t.surf, text:t.text, muted:t.muted, border:t.border, fieldBg:t.bg,
      plane:t.hover, btnBg:t.accent, btnText:t.onAccent, ph:t.muted, r, pack:p, t };
  }
  return { name:'page', bg:t.bg, text:t.text, muted:t.muted, border:t.border, fieldBg:t.surf,
    plane:t.surf, btnBg:t.accent, btnText:t.onAccent, ph:t.muted, r, pack:p, t };
}

/* ── chrome ───────────────────────────────────────────────────────────── */
function siteBar(t, w, p) {
  p = p || PACKS.paper; const g = G(w);
  const nav = w === 390
    ? `<span style="font-size:18px;color:${t.text}">☰</span>`
    : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${p.body}"><span>Reporting</span><span>Interviews</span><span>Writers</span><span style="color:${t.text};font-weight:600">Contact</span></div>`;
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
function padTop(t, w, note) {
  const g = G(w);
  return `<div style="height:${g.pad}px;display:flex;align-items:flex-end;padding-bottom:4px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${g.pad} · A16'S OWN TOP PADDING${note ? ' · ' + note : ' · A16 SITS BETWEEN PAGE SECTIONS ⚑'}</span></div>`;
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
  if (o.eyebrowText !== false) parts.push(eyebrow(g, o.eyebrowText || 'Contact') + gap(14));
  if (o.headingText !== false) parts.push(heading(g, o.headingText || 'Write to us', hs, o.tag) + gap(o.blurbText === false ? 0 : 16));
  if (o.blurbText !== false) parts.push(blurb(g, o.blurbText || BLURB, o.measure || 560, w === 390 ? 16 : 17));
  return `<div style="display:flex;flex-direction:column;${al === 'center' ? 'align-items:center;text-align:center;' : ''}max-width:${o.max || 720}px${al === 'center' ? ';margin:0 auto' : ''}">${parts.join('')}</div>`;
}

/* ── fixtures · Orbit Weekly ──────────────────────────────────────────── */
const BLURB = 'Tips, corrections, letters for publication, or a note about something we got wrong. A person reads every one.';
const DETAILS = [
  { label:'Email', value:'hello@orbitweekly.com', link:true },
  { label:'Post', value:'Orbit Weekly, 14 Rua da Boavista, 1200-067 Lisboa, Portugal' },
  { label:'Phone', value:'+351 21 346 0188', link:true },
  { label:'Replies', value:'Within two working days, Monday to Friday.' }
];
const SOCIALS = [
  { name:'Instagram', handle:'@orbitweekly', ini:'IG' },
  { name:'X', handle:'@orbitweekly', ini:'X' },
  { name:'Mastodon', handle:'@orbit@social.lisboa', ini:'MA' },
  { name:'LinkedIn', handle:'Orbit Weekly', ini:'IN' }
];
const LOCATIONS = [
  { name:'Lisbon', address:'14 Rua da Boavista<br>1200-067 Lisboa, Portugal', hours:'Monday to Friday, 09:00–18:00' },
  { name:'Berlin', address:'Sonnenallee 68<br>12045 Berlin, Germany', hours:'Monday to Thursday, 10:00–17:00' },
  { name:'São Paulo', address:'Rua Augusta 1508, sala 7<br>01304-001 São Paulo, Brazil', hours:'By appointment' }
];
const ENQUIRIES = [
  { label:'Editorial', address:'hello@orbitweekly.com', note:'Tips, letters and corrections.' },
  { label:'Advertising', address:'ads@orbitweekly.com', note:'Rates and the current media pack.' },
  { label:'Rights', address:'rights@orbitweekly.com', note:'Syndication and republishing.' },
  { label:'Press', address:'press@orbitweekly.com', note:'Interviews and speaking.' }
];
const REASONS = ['A person reads every message.', 'We answer within two working days.', 'Corrections are published, not buried.'];
const CONSENT = 'We use your address to answer you and nothing else.';

/* ── the form · A16's own component set ───────────────────────────────── */
const FIELD_SETS = {
  2: [['email']],
  3: [['name'], ['email']],
  4: [['name'], ['email'], ['subject']],
  5: [['name', 'phone'], ['email'], ['subject']]
};
const FIELD_LABEL = { name:'Your name', email:'Your email', subject:'Subject', phone:'Phone', message:'Message' };
const FIELD_PH = { name:'Ida Brandt', email:'you@example.com', subject:'What this is about', phone:'Optional', message:'Tell us what happened, and where.' };
const FIELD_TYPED = { name:'Ida Brandt', email:'ida.brandt@', subject:'A correction to the tram piece', phone:'+351 912 004 771', message:'The tram piece says the line stops at the hospital gate. It stops two blocks short, at Largo do Rato.' };

const MSG_H = { Short:96, Medium:144, Tall:216 };

function fieldLabel(g, txt, o) {
  o = o || {};
  if (o.labels === 'hidden') return '';
  return `<span style="font-size:13px;font-weight:500;color:${g.text};font-family:${g.pack.body};line-height:1.3">${txt}</span>`;
}
function inputEl(g, key, o) {
  o = o || {};
  const st = o.state || 'empty', h = o.h || 46, fs = o.fs || 15;
  const focused = st === 'focus' && (o.focusOn || 'email') === key;
  const bad = st === 'invalid' && (o.invalidOn || 'email') === key;
  const typed = (st === 'submitting' || st === 'invalid' || st === 'focus') && (o.typed !== false);
  let border = `1px solid ${g.border}`, bg = o.fieldBg || g.fieldBg, col = g.ph;
  let val = (o.ph && o.ph[key]) || FIELD_PH[key];
  if (typed) { col = g.text; val = FIELD_TYPED[key]; if (key === 'email' && !(focused || bad)) val = 'ida.brandt@orbitweekly.com'; }
  if (focused) { border = `1.5px solid ${g.name === 'contrast' || g.name === 'image' ? g.text : g.t.accent}`; col = g.text; }
  if (bad) { border = `1.5px solid ${g.text}`; col = g.text; }
  if (st === 'submitting') { bg = g.plane; col = g.muted; }
  const pad = (focused || bad) ? 13.5 : 14;
  return `<span style="width:100%;height:${h}px;background:${bg};border:${border};border-radius:${g.r}px;display:flex;align-items:center;padding:0 ${pad}px;box-sizing:border-box;font-size:${fs}px;color:${col};font-family:${g.pack.body};overflow:hidden;white-space:nowrap">${val}</span>`;
}
function textareaEl(g, o) {
  o = o || {};
  const st = o.state || 'empty', h = o.msgH || MSG_H.Medium, fs = o.fs || 15;
  const typed = (st === 'submitting' || st === 'invalid' || st === 'focus');
  const bad = st === 'invalid' && o.invalidOn === 'message';
  let border = `1px solid ${g.border}`, bg = o.fieldBg || g.fieldBg, col = typed ? g.text : g.ph;
  if (bad) { border = `1.5px solid ${g.text}`; }
  if (st === 'submitting') { bg = g.plane; col = g.muted; }
  const val = typed ? FIELD_TYPED.message : ((o.ph && o.ph.message) || FIELD_PH.message);
  return `<span style="width:100%;height:${h}px;background:${bg};border:${border};border-radius:${g.r}px;display:block;padding:${bad ? 12.5 : 13}px 14px;box-sizing:border-box;font-size:${fs}px;line-height:1.55;color:${col};font-family:${g.pack.body};overflow:hidden">${val}</span>`;
}
function fieldGroup(g, key, o) {
  o = o || {};
  const err = (o.state === 'invalid' && (o.invalidOn || 'email') === key)
    ? `<span style="font-size:13px;font-weight:500;color:${g.text};font-family:${g.pack.body}">${o.invalidText || 'That address doesn’t look right.'}</span>` : '';
  return `<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0">${fieldLabel(g, FIELD_LABEL[key], o)}${inputEl(g, key, o)}${err}</div>`;
}
function btnEl(g, o) {
  o = o || {};
  const dis = o.state === 'submitting';
  return `<span style="${o.full ? 'width:100%;justify-content:center;' : ''}height:${o.h || 46}px;display:inline-flex;align-items:center;background:${g.btnBg};color:${g.btnText};font-size:${o.fs || 15}px;font-weight:600;padding:0 ${o.px || 24}px;border-radius:${g.r}px;font-family:${g.pack.body};box-sizing:border-box;${dis ? 'opacity:.8;' : ''}${o.minW ? `min-width:${o.minW}px;justify-content:center;` : ''}">${dis ? 'Sending…' : (o.label || 'Send message')}</span>`;
}
function consentEl(g, o) {
  o = o || {};
  if (o.consent === 'off') return '';
  if (o.consent === 'checkbox') {
    return `<div style="display:flex;align-items:flex-start;gap:10px;min-height:44px;padding-top:2px"><span style="width:20px;height:20px;border:1px solid ${g.border};border-radius:${Math.min(g.r,5)}px;background:${g.fieldBg};flex-shrink:0;margin-top:1px"></span><span style="font-size:13px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">${o.consentText || CONSENT}</span></div>`;
  }
  return `<span style="font-size:13px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}${o.center ? ';text-align:center' : ''}${o.max ? `;max-width:${o.max}px` : ''}">${o.consentText || CONSENT}</span>`;
}

// the whole form block, in any of the seven states
function formBlock(g, o) {
  o = o || {};
  const st = o.state || 'empty';
  const count = o.fields || 3;
  const stack = o.stack;
  const center = o.align === 'center';
  const fs = stack ? 16 : 15, h = stack ? 48 : 46;
  const msgH = o.msgH || MSG_H[o.message || 'Medium'];
  const wrap = inner => `<div style="display:flex;flex-direction:column;gap:20px;${center ? 'align-items:center;text-align:center;' : ''}${o.width ? `width:${o.width}px;` : 'width:100%;'}box-sizing:border-box">${inner}</div>`;

  if (st === 'sent') {
    return wrap(`<div style="display:flex;flex-direction:column;gap:8px;${center ? 'align-items:center;text-align:center;' : ''}justify-content:center;min-height:${o.sentH || 96}px">
      <span style="font-family:${g.pack.head};font-size:${o.sentSize || 24}px;font-weight:700;color:${g.text};line-height:1.2">${o.sentHeading || 'Message sent'}</span>
      <span style="font-size:15px;line-height:1.6;color:${g.muted};font-family:${g.pack.body};max-width:${o.max || 460}px">${o.sentText || 'Thank you — we have it. You will hear back within two working days, at ida.brandt@orbitweekly.com.'}</span>
      <span style="font-size:13px;color:${g.muted};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px;margin-top:2px">Send another message</span></div>`);
  }
  if (st === 'failed') {
    const banner = `<div style="display:flex;flex-direction:column;gap:5px;padding:13px 15px;border:1px solid ${g.text};border-radius:${g.r}px;background:${g.plane};box-sizing:border-box">
      <span style="font-size:13px;font-weight:600;color:${g.text};font-family:${g.pack.body}">That didn’t send.</span>
      <span style="font-size:13px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">Nothing was lost — your message is still below. Try again, or write to <span style="color:${g.text};text-decoration:underline;text-underline-offset:2px">hello@orbitweekly.com</span>.</span></div>`;
    return wrap(banner + fieldsInner(g, { ...o, state:'focus', focusOn:'__none', stack, fs, h, msgH, count }));
  }
  if (st === 'noDestination') {
    return wrap(`<div style="display:flex;flex-direction:column;gap:5px;padding:13px 15px;border:1px dashed ${g.border};border-radius:${g.r}px;box-sizing:border-box">
      <span style="font-size:13px;font-weight:600;color:${g.text};font-family:${g.pack.body}">No destination set — editor only ⚑</span>
      <span style="font-size:13px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">Set an address in <em>Where it goes</em>. Until then the published page posts to the site’s own email.</span></div>`
      + fieldsInner(g, { ...o, state:'empty', stack, fs, h, msgH, count }));
  }
  return wrap(fieldsInner(g, { ...o, state:st, stack, fs, h, msgH, count }));
}
function fieldsInner(g, o) {
  const rows = FIELD_SETS[o.count] || FIELD_SETS[3];
  const stack = o.stack;
  const rowEls = rows.map(r => {
    if (r.length > 1 && !stack && !o.narrow) {
      return `<div style="display:flex;gap:16px;width:100%">${r.map(k => fieldGroup(g, k, o)).join('')}</div>`;
    }
    return r.map(k => `<div style="display:flex;flex-direction:column;gap:16px;width:100%">${fieldGroup(g, k, o)}</div>`).join('');
  }).join('');
  const msg = `<div style="display:flex;flex-direction:column;gap:8px;width:100%">${fieldLabel(g, FIELD_LABEL.message, o)}${textareaEl(g, o)}</div>`;
  const foot = `<div style="display:flex;${o.buttonFull || stack ? 'flex-direction:column;align-items:stretch;' : 'align-items:center;justify-content:space-between;'}gap:${o.buttonFull || stack ? 14 : 20}px;width:100%;${o.align === 'center' && !stack ? 'flex-direction:column;align-items:center;gap:14px;' : ''}">
    ${o.consent === 'checkbox'
      ? consentEl(g, o) + btnEl(g, { ...o, full:o.buttonFull || stack, minW:o.buttonFull || stack ? 0 : 150 })
      : btnEl(g, { ...o, full:o.buttonFull || stack, minW:o.buttonFull || stack ? 0 : 150 }) + consentEl(g, { ...o, max:o.consentMax || 300 })}</div>`;
  return `<div style="display:flex;flex-direction:column;gap:16px;width:100%">${rowEls}${msg}</div>${foot}`;
}

/* ── the details block · A3·10's four labelled fields, carried verbatim ─ */
function detailsBlock(g, o) {
  o = o || {};
  const items = o.items || DETAILS;
  const dir = o.row ? 'row' : 'column';
  return `<div style="display:flex;flex-direction:${dir};${o.row ? `flex-wrap:wrap;gap:${o.gap || 48}px;` : `gap:${o.gap || 22}px;`}${o.width ? `width:${o.width}px;` : ''}">
    ${items.map(d => `<div style="display:flex;flex-direction:column;gap:5px;${o.row ? `min-width:${o.colW || 200}px;flex:${o.flex || '0 1 auto'};` : ''}max-width:${o.max || 320}px">
      <span style="font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">${d.label}</span>
      <span style="font-size:${o.size || 15}px;line-height:1.55;color:${g.text};font-family:${g.pack.body};${d.link ? 'text-decoration:underline;text-underline-offset:3px;' : ''}">${d.value}</span></div>`).join('')}</div>`;
}

/* ── the social row · A3's list, carried verbatim ─────────────────────── */
function socialRow(g, o) {
  o = o || {};
  const items = (o.items || SOCIALS).slice(0, o.n || 4);
  if (o.mode === 'off') return '';
  if (o.mode === 'labels') {
    return `<div style="display:flex;flex-wrap:wrap;gap:${o.gap || 20}px;align-items:center">${items.map(s =>
      `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:15px;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px">${s.name}</span>`).join('')}</div>`;
  }
  return `<div style="display:flex;flex-wrap:wrap;gap:${o.gap || 8}px;align-items:center">${items.map(s =>
    `<span style="width:44px;height:44px;border:1px solid ${g.border};border-radius:${g.r}px;display:inline-flex;align-items:center;justify-content:center;font-family:${MONO};font-size:11px;font-weight:500;color:${g.muted};box-sizing:border-box">${s.ini}</span>`).join('')}</div>`;
}

/* ── the map plate · a static image, never an embed ⚑ ─────────────────── */
function mapPlate(t, g, o) {
  o = o || {};
  return `<div style="${o.w ? `width:${o.w}px;` : 'width:100%;'}height:${o.h || 360}px;border-radius:${o.r === undefined ? g.r : o.r}px;background:${t.stripe};display:flex;flex-direction:column;justify-content:space-between;padding:12px;box-sizing:border-box;overflow:hidden;flex-shrink:0">
    <span style="font-family:${MONO};font-size:10px;color:${t.muted}">${o.cap || 'STATIC MAP IMAGE · A LINK, NEVER AN EMBED ⚑'}</span>
    ${o.link === false ? '' : `<span style="align-self:flex-start;height:36px;display:inline-flex;align-items:center;padding:0 14px;border-radius:${Math.min(g.r, 8)}px;background:${g.bg === 'transparent' ? t.surf : g.bg};border:1px solid ${g.border};font-size:13px;font-weight:500;color:${g.text};font-family:${g.pack.body}">${o.linkLabel || 'Open in Maps →'}</span>`}</div>`;
}

/* ── the location card ────────────────────────────────────────────────── */
function locationCard(t, g, o) {
  o = o || {};
  const loc = o.loc;
  return `<div style="display:flex;flex-direction:column;gap:0;background:${o.cardBg || g.plane};border:1px solid ${g.border};border-radius:${g.r}px;overflow:hidden;box-sizing:border-box;${o.w ? `width:${o.w}px;` : 'flex:1;min-width:0;'}${o.flat || t.dark ? '' : `box-shadow:${t.sm};`}">
    ${o.thumb === false ? '' : mapPlate(t, g, { h:o.thumbH || 132, r:0, link:false, cap:'MAP THUMB · 16:9 · STATIC ⚑' })}
    <div style="display:flex;flex-direction:column;gap:10px;padding:${o.pad || 22}px">
      <span style="font-family:${g.pack.head};font-size:${o.nameSize || 22}px;font-weight:700;color:${g.text};line-height:1.2">${loc.name}</span>
      <span style="font-size:15px;line-height:1.6;color:${g.muted};font-family:${g.pack.body}">${loc.address}</span>
      ${o.hours === false || !loc.hours ? '' : `<span style="font-size:14px;line-height:1.5;color:${g.muted};font-family:${g.pack.body};border-top:1px solid ${g.border};padding-top:10px">${loc.hours}</span>`}
      <span style="font-size:14px;font-weight:500;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px;min-height:24px;display:inline-flex;align-items:center">Directions →</span>
    </div></div>`;
}

/* ── the enquiry radio row (11) and the enquiry table (13) ────────────── */
function enquiryRadios(g, o) {
  o = o || {};
  const items = (o.items || ENQUIRIES).slice(0, o.n || 3);
  const active = o.active === undefined ? 0 : o.active;
  return `<div style="display:flex;${o.stack ? 'flex-direction:column;' : 'flex-wrap:wrap;'}gap:${o.gap || 10}px;${o.full ? 'width:100%;' : ''}">
    ${items.map((e, i) => `<span style="display:inline-flex;align-items:center;gap:10px;min-height:46px;padding:0 18px;border:1px solid ${i === active ? (g.name === 'contrast' || g.name === 'image' ? g.text : g.t.accent) : g.border};border-radius:${g.r}px;background:${i === active ? (g.name === 'contrast' || g.name === 'image' ? g.plane : 'rgba(217,108,63,.07)') : 'transparent'};box-sizing:border-box;${o.full || o.stack ? 'flex:1;' : ''}">
      <span style="width:18px;height:18px;border-radius:50%;border:${i === active ? '5px' : '1px'} solid ${i === active ? (g.name === 'contrast' || g.name === 'image' ? g.text : g.t.accent) : g.border};box-sizing:border-box;flex-shrink:0;background:${g.fieldBg}"></span>
      <span style="font-size:15px;font-weight:${i === active ? 600 : 500};color:${g.text};font-family:${g.pack.body};white-space:nowrap">${e.label}</span></span>`).join('')}</div>`;
}
function enquiryTable(g, o) {
  o = o || {};
  const items = o.items || ENQUIRIES;
  const rowPad = o.rowPad || 18;
  const notes = o.notes !== false;
  const head = `<div style="display:flex;align-items:center;gap:24px;padding:0 0 10px;border-bottom:1px solid ${g.border}">
    <span style="width:${o.labelW || 220}px;flex-shrink:0;font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">What it is</span>
    ${notes ? `<span style="flex:1;font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">Use it for</span>` : ''}
    <span style="width:${o.addrW || 320}px;flex-shrink:0;font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">Where it goes</span></div>`;
  const rows = items.map((e, i) => `<div style="display:flex;align-items:baseline;gap:24px;padding:${rowPad}px 0;${o.rules === 'ends' ? (i === items.length - 1 ? '' : '') : `border-bottom:1px solid ${g.border};`}">
    <span style="width:${o.labelW || 220}px;flex-shrink:0;font-family:${g.pack.head};font-size:${o.size || 19}px;font-weight:700;color:${g.text};line-height:1.3">${e.label}</span>
    ${notes ? `<span style="flex:1;font-size:15px;line-height:1.55;color:${g.muted};font-family:${g.pack.body}">${e.note}</span>` : ''}
    <span style="width:${o.addrW || 320}px;flex-shrink:0;font-size:15px;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px">${e.address}</span></div>`).join('');
  return `<div style="display:flex;flex-direction:column;${o.rules === 'ends' ? `border-bottom:1px solid ${g.border};` : ''}width:100%">${o.head === false ? '' : head}${rows}</div>`;
}

/* ── striped plate ────────────────────────────────────────────────────── */
function plate(t, g, o) {
  o = o || {};
  return `<span style="width:${o.w ? o.w + 'px' : '100%'};height:${o.h}px;border-radius:${o.r === undefined ? g.r : o.r}px;background:${t.stripe};display:flex;align-items:flex-end;padding:10px;box-sizing:border-box;flex-shrink:0">${o.cap ? `<span style="font-family:${MONO};font-size:10px;color:${t.muted}">${o.cap}</span>` : ''}</span>`;
}
function scrim(o) {
  o = o || {};
  return `<span style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(35,32,25,.34) 0%, rgba(35,32,25,.58) 55%, rgba(35,32,25,.72) 100%)"></span>`;
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
// the repeater · A3's, carried verbatim: drag handle, remove, Add … at the foot
function repeater(o) {
  const rows = o.items.map(i => `<div style="display:flex;align-items:center;gap:8px;height:32px;background:${PC.white};border:1px solid ${PC.line};border-radius:7px;padding:0 9px"><span style="font-size:10px;color:${PC.dim}">${o.reorder === false ? '·' : '⠿'}</span><span style="font-size:12px;color:${PC.ink};flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${i}</span><span style="font-size:11px;color:${PC.dim}">✕</span></div>`).join('');
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
// the shared Delivery group — five rows, identical in every design that draws a form, not counted
function deliveryGroup(o) {
  o = o || {};
  if (o.none) {
    return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:9px">
      <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE DELIVERY GROUP · ABSENT HERE</span>
      <span style="font-size:11px;color:${PC.mute};line-height:1.5">${b('This design draws no form')} ⚑, so the five delivery rows are not shown. They are kept on the section and return the moment you switch to a design that has one.</span></div>`;
  }
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE DELIVERY GROUP · IDENTICAL IN ALL TEN FORM DESIGNS · NOT COUNTED</span>
    ${seg('Where it goes', ['An email address', 'A form service'], o.where === undefined ? 0 : o.where, `${b('Ghost cannot receive a form')} ⚑ — its theme layer has no handler. An email address opens the reader’s mail app and needs nothing set up; a form service takes a URL you paste. ${b('An email address is the default')} ⚑.`)}
    ${txt('The destination', o.dest || 'hello@orbitweekly.com', `The address, or the service’s endpoint URL. ${b('Empty is a real state')} — the editor says so and the published page falls back to the site’s own email ⚑.`)}
    ${sel('After sending', o.after || 'The service’s own page', `Show the message in place · The service’s own page. ${b('Disabled at An email address')} ⚑ — the mail app is the response, and there is nothing for the section to show.`)}
    ${seg('A consent line', ['Off', 'A line of text', 'A checkbox'], o.consent === undefined ? 1 : o.consent, `Under the button. ${b('A line of text is the default')} ⚑ — a checkbox that everyone ticks is a worse record than a sentence that everyone reads. A2·13 Consent owns cookies; this row is about the message.`)}
    ${sel('Spam', 'A hidden field, plus your service’s guard', `Read-only. ${b('The section adds a honeypot and nothing else')} ⚑ — ${b('no captcha at any value')}, because a captcha is a third-party script and a contact form is not worth one.`, true)}
  </div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.count}</span></div>`;
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${deliveryGroup(o.delivery)}${foot}</div>`;
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
function tableCard(o) {
  const head = `<div style="display:flex;gap:0;border-bottom:1px solid ${PC.line};padding-bottom:9px">${o.cols.map((c, i) => `<span style="width:${o.widths[i]}px;font-family:${MONO};font-size:10px;letter-spacing:.05em;color:${PC.mute}">${c}</span>`).join('')}</div>`;
  const rows = o.rows.map(r => `<div style="display:flex;gap:0;padding:8px 0;border-bottom:1px solid #F1EDE6">${r.map((c, i) => `<span style="width:${o.widths[i]}px;font-size:12px;line-height:1.5;color:#3A3835;padding-right:12px;box-sizing:border-box">${c}</span>`).join('')}</div>`).join('');
  return `<div style="width:${o.w || 1288}px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column">${head}${rows}</div>`;
}

return { L, D, PACKS, MONO, hb, G, ground, siteBar, neighbour, frame, padTop, padBot, gap,
  eyebrow, heading, blurb, headBlock, BLURB, DETAILS, SOCIALS, LOCATIONS, ENQUIRIES, REASONS, CONSENT,
  FIELD_SETS, FIELD_LABEL, FIELD_PH, FIELD_TYPED, MSG_H,
  fieldLabel, inputEl, textareaEl, fieldGroup, btnEl, consentEl, formBlock, fieldsInner,
  detailsBlock, socialRow, mapPlate, locationCard, enquiryRadios, enquiryTable, plate, scrim,
  DOC_HEAD, DOC_TAIL, cap, note, code, b, sub, section, intro, wrapIf,
  seg, sel, txt, repeater, designPicker, deliveryGroup, panel, specCards, specRow, tile, tableCard, PC };
})();
