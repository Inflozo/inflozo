/* A29 Archive Headers — shared render kit.
   NOTE: any literal Ghost Handlebars in emitted markup must be written with
   {&#8203;{ / }&#8203;} entities — a bare {{ … }} is a DC value hole and renders empty.
   Loaded by run_script via new Function(src + ';return {...}')().
   Every block takes a token object t, so light, dark and the three packs are the
   same code with a different t — the category's own rule. */

const PACKS = {
  paper: {
    name: 'PAPER', r: 8, head: "Georgia,serif", body: "'Inter',sans-serif",
    l: { bg:'#FBF9F5', surface:'#FFFFFF', hover:'#F4F0E8', text:'#232019', muted:'#6B6459', border:'#EBE5DB', accent:'#D96C3F', onAccent:'#FFFFFF', contrast:'#232019', onContrast:'#FBF9F5', onContrastMuted:'#B5AC9C', contrastBorder:'#3A342B', stripe:'repeating-linear-gradient(45deg,#EDE4D8 0 10px,#E5DACB 10px 20px)', shadow:'0 4px 16px rgba(28,27,26,.08)', shadowSm:'0 1px 2px rgba(28,27,26,.06)' },
    d: { bg:'#171511', surface:'#211D17', hover:'#2A251E', text:'#F2EDE4', muted:'#A79E8F', border:'#332E27', accent:'#E0805A', onAccent:'#171511', contrast:'#EDE7DA', onContrast:'#171511', onContrastMuted:'#5A5348', contrastBorder:'#D2CBBC', stripe:'repeating-linear-gradient(45deg,#3A342B 0 10px,#332E26 10px 20px)', shadow:'none', shadowSm:'none' }
  },
  tangerine: {
    name: 'TANGERINE', r: 14, head: "'Bricolage Grotesque',sans-serif", body: "'Inter',sans-serif",
    l: { bg:'#FFF4EA', surface:'#FFFFFF', hover:'#F6E3D2', text:'#2A1B12', muted:'#7A6154', border:'#EFD8C3', accent:'#E8541F', onAccent:'#FFFFFF', contrast:'#2A1B12', onContrast:'#FFF4EA', onContrastMuted:'#B7A395', contrastBorder:'#433024', stripe:'repeating-linear-gradient(45deg,#F6E3D2 0 10px,#F0E0CE 10px 20px)', shadow:'0 4px 16px rgba(42,27,18,.08)', shadowSm:'0 1px 2px rgba(42,27,18,.06)' },
    d: { bg:'#1E1310', surface:'#2A1B15', hover:'#33241B', text:'#FDF3E7', muted:'#AA9B8E', border:'#3A2A21', accent:'#F27C4A', onAccent:'#1E1310', contrast:'#FDF3E7', onContrast:'#1E1310', onContrastMuted:'#6B5C50', contrastBorder:'#D8C9BB', stripe:'repeating-linear-gradient(45deg,#33241B 0 10px,#3B2A20 10px 20px)', shadow:'none', shadowSm:'none' }
  },
  ink: {
    name: 'INK', r: 6, head: "'Inter',sans-serif", body: "'Inter',sans-serif",
    l: { bg:'#F5F5F7', surface:'#FFFFFF', hover:'#E7E7EC', text:'#16161A', muted:'#63636E', border:'#E3E3E8', accent:'#2F6FED', onAccent:'#FFFFFF', contrast:'#16161A', onContrast:'#F5F5F7', onContrastMuted:'#9A9AA4', contrastBorder:'#2E2E34', stripe:'repeating-linear-gradient(45deg,#E7E7EC 0 10px,#DEDEE4 10px 20px)', shadow:'0 4px 16px rgba(22,22,26,.08)', shadowSm:'0 1px 2px rgba(22,22,26,.06)' },
    d: { bg:'#16161A', surface:'#1F1F25', hover:'#25252B', text:'#F4F4F6', muted:'#9C9CA2', border:'#2E2E34', accent:'#5A8CF5', onAccent:'#16161A', contrast:'#F4F4F6', onContrast:'#16161A', onContrastMuted:'#6C6C74', contrastBorder:'#C9C9D0', stripe:'repeating-linear-gradient(45deg,#25252B 0 10px,#1E1E24 10px 20px)', shadow:'none', shadowSm:'none' }
  }
};
function tok(pack, mode) {
  const p = PACKS[pack] || PACKS.paper;
  return Object.assign({ r: p.r, head: p.head, body: p.body, pack: p.name, mode }, mode === 'd' ? p.d : p.l);
}
const T = tok('paper', 'l');
const TD = tok('paper', 'd');

/* ---- fixtures ---- Orbit Weekly, throughout. */
const TAG = { kind: 'tag', eyebrow: 'Tag', name: 'Infrastructure', desc: 'Reporting on the pipes, cables and rails that carry everything else. New pieces most weeks.', n: 42, img: true };
const AUTHOR = { kind: 'author', eyebrow: 'Author', name: 'Rosa Menendez', ini: 'RM', desc: 'Writes about the parts of the internet that stopped changing. Ten years at a daily paper before this; now in Lisbon.', n: 68, img: true, meta: ['Lisbon', 'orbitweekly.com/rosa'] };
const DATE = { kind: 'date', eyebrow: 'Archive', name: 'August 2026', desc: null, n: 9, img: false };
const BARE = { kind: 'tag', eyebrow: 'Tag', name: 'Corrections', desc: null, n: 3, img: false };
const EMPTY = { kind: 'tag', eyebrow: 'Tag', name: 'Corrections', desc: null, n: 0, img: false };
const STRESS = { kind: 'tag', eyebrow: 'Tag', name: 'Infrastructure, procurement and the long tail of municipal maintenance', desc: 'Everything the city owns and has to keep working: water, drains, bridges, lifts, the lights on the ring road, and the budget lines that decide which of them gets fixed this year and which waits until the next one.', n: 1, img: false };
const NOTICE = 'No posts filed here yet. When one is, it will show up on this page.';
const SIBLINGS = [
  { name: 'Infrastructure', n: 42 }, { name: 'Transport', n: 31 }, { name: 'Housing', n: 26 },
  { name: 'Energy', n: 24 }, { name: 'Climate', n: 22 }, { name: 'Money', n: 19 },
  { name: 'Interviews', n: 17 }, { name: 'Culture', n: 17 }, { name: 'Photography', n: 14 },
  { name: 'Letters', n: 11 }, { name: 'Data', n: 8 }, { name: 'Corrections', n: 3 }
];
const POSTS = ['The night shift at the Port of Algeciras', 'Why the new tram line stops short of the hospital', 'Rosa Ferreira on machines that do not exist yet'];
const plural = a => `${a.n} ${a.n === 1 ? 'post' : 'posts'}`;
const countText = a => (a.n === 0 ? 'No posts yet' : plural(a));
const BACK = 'All posts';

/* ---- width table (A17's, unchanged) ---- */
const SZ = {
  1440: { margin: 72, content: 1296, gut: 24, pad: 96 },
  834:  { margin: 40, content: 754,  gut: 24, pad: 80 },
  390:  { margin: 20, content: 350,  gut: 20, pad: 64 }
};

/* ---- primitives ---- */
const MONO = "'JetBrains Mono',monospace";
const mono = (s, c, txt) => `<span style="font-family:${MONO};font-size:${s}px;color:${c}">${txt}</span>`;
const cap = txt => `<div style="font-family:${MONO};font-size:12px;color:#6E6A64">${txt}</div>`;
const sub = txt => `<span style="font-family:${MONO};font-size:11px;color:#6E6A64">${txt}</span>`;
const note = (txt, w) => `<p style="margin:0;font-size:13px;line-height:1.6;color:#6B6459;max-width:${w || 1290}px">${txt}</p>`;
const b = txt => `<strong style="font-weight:600">${txt}</strong>`;
const code = txt => `<code style="font-family:${MONO};font-size:12px">${txt}</code>`;
const hb = s => s.replace(/\{\{/g, '{&#8203;{').replace(/\}\}/g, '}&#8203;}');
const hbc = s => code(hb(s));
const eyebrowEl = (t, txt, c) => `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${c || t.muted};font-family:${t.body}">${txt}</span>`;
const hair = (t, c) => `<div style="height:1px;background:${c || t.border}"></div>`;
const gap = h => `<div style="height:${h}px"></div>`;

/* A1's striped plate with its mono caption. */
function plate(t, w, h, label, radius) {
  return `<div style="${w ? `width:${w}px;` : 'width:100%;'}height:${h}px;border-radius:${radius === undefined ? t.r : radius}px;background:${t.stripe};display:flex;align-items:flex-end;padding:10px;box-sizing:border-box;overflow:hidden">${label === false ? '' : mono(9.5, t.muted, label || 'TAG FEATURE IMAGE')}</div>`;
}
/* A1's avatar with A1's initials fallback. */
function avatar(t, a, size, o = {}) {
  if (a.img === false || o.initials) {
    return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${o.ink ? 'rgba(255,255,255,.16)' : t.hover};display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-family:${t.head};font-size:${Math.round(size * 0.4)}px;font-weight:700;color:${o.ink || t.muted}">${a.ini || a.name.trim()[0]}</span></span>`;
  }
  return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${t.stripe};flex-shrink:0;display:block"></span>`;
}
/* A20·1's pill, verbatim: 15/500 in a hairline box at the pack radius, 44 px target. */
function pill(t, item, o = {}) {
  const s = o.size || 15, h = o.h || 44;
  const active = o.active;
  const ink = active ? (o.onAccent || t.onAccent) : (o.ink || t.text);
  const countEl = o.count === false ? '' : `<span style="font-size:13px;color:${active ? (o.onAccent || t.onAccent) : (o.mutedInk || t.muted)};font-family:${t.body};font-variant-numeric:tabular-nums;opacity:${active ? .8 : 1}">${item.n}</span>`;
  return `<span style="height:${h}px;display:inline-flex;align-items:center;gap:8px;padding:0 18px;border:1px solid ${active ? (o.accent || t.accent) : (o.border || t.border)};border-radius:${t.r}px;background:${active ? (o.accent || t.accent) : 'transparent'};box-sizing:border-box;flex-shrink:0">
    <span style="font-size:${s}px;font-weight:${active ? 600 : 500};color:${ink};font-family:${t.body};white-space:nowrap">${item.name}</span>${countEl}</span>`;
}
/* A20·7's index line: name and count on one row under a hairline. */
function indexLine(t, item, o = {}) {
  const active = o.active;
  return `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;min-height:${o.minH || 36}px;border-bottom:1px solid ${o.border || t.border};padding-bottom:2px">
    <span style="font-size:${o.size || 15}px;font-weight:${active ? 600 : 400};color:${o.ink || t.text};font-family:${t.body};${active ? `box-shadow:inset 0 -2px 0 ${o.accent || t.accent};padding-bottom:1px` : ''}">${item.name}</span>
    <span style="font-size:13px;color:${o.mutedInk || t.muted};font-family:${t.body};font-variant-numeric:tabular-nums">${o.counts === false ? '' : item.n}</span></div>`;
}

/* ---- the head's own parts ---- */
function titleEl(t, a, o = {}) {
  const s = o.size || 52;
  return `<h1 style="margin:0;font-family:${t.head};font-size:${s}px;font-weight:700;line-height:${s >= 76 ? 0.98 : (s >= 44 ? 1.06 : 1.14)};letter-spacing:${s >= 76 ? '-0.04em' : (s >= 40 ? '-0.03em' : '-0.02em')};color:${o.ink || t.text};${o.w ? `max-width:${o.w}px;` : ''}text-wrap:pretty">${o.text || a.name}</h1>`;
}
function descEl(t, a, o = {}) {
  if (!a.desc && !o.text) return '';
  return `<p style="margin:0;font-size:${o.size || 17}px;line-height:1.6;color:${o.mutedInk || t.muted};font-family:${t.body};max-width:${o.w || 620}px;text-wrap:pretty">${o.text || a.desc}</p>`;
}
function countEl(t, a, o = {}) {
  return `<span style="font-size:${o.size || 15}px;color:${o.mutedInk || t.muted};font-family:${t.body};font-variant-numeric:tabular-nums;white-space:nowrap">${o.text || countText(a)}</span>`;
}
function backEl(t, o = {}) {
  return `<span style="display:inline-flex;align-items:center;gap:7px;min-height:44px;font-size:14px;font-weight:500;color:${o.ink || t.text};font-family:${t.body}"><span style="color:${o.mutedInk || t.muted}">←</span>${o.text || BACK}</span>`;
}
function actionEl(t, o = {}) {
  if (o.kind === 'Link') return `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:600;color:${o.accent || t.accent};font-family:${t.body}">${o.text || 'Subscribe'} →</span>`;
  return `<span style="height:44px;display:inline-flex;align-items:center;background:${o.fill || t.accent};color:${o.onAccent || t.onAccent};font-size:14px;font-weight:600;padding:0 18px;border-radius:${t.r}px;font-family:${t.body};${o.outline ? `background:transparent;border:1px solid ${o.fill};color:${o.fill};` : ''}">${o.text || 'Subscribe'}</span>`;
}
function metaEl(t, a, o = {}) {
  const items = o.items || [].concat(a.meta || [], [plural(a)]);
  return `<span style="display:flex;flex-wrap:wrap;align-items:center;gap:0 10px;font-size:14px;color:${o.mutedInk || t.muted};font-family:${t.body}">${items.map((m, i) => `${i ? '<span>·</span>' : ''}<span style="font-variant-numeric:tabular-nums">${m}</span>`).join('')}</span>`;
}
/* The 0-post notice. A17 does not render at 0, so A29 owns this line. */
function noticeEl(t, o = {}) {
  return `<p style="margin:0;font-size:${o.size || 17}px;line-height:1.6;color:${o.mutedInk || t.muted};font-family:${t.body};max-width:${o.w || 560}px">${o.text || NOTICE}</p>`;
}

/* The composed head, used by most designs. Left or Centre; the count either
   beside the eyebrow on one row, under the description, or off. */
function head(t, a, o = {}) {
  const centre = o.align === 'Centre';
  const parts = [];
  const eb = o.eyebrow === false ? '' : eyebrowEl(t, o.eyebrowText || a.eyebrow, o.mutedInk || t.muted);
  const ct = o.countPos === 'Off' ? '' : countEl(t, a, { mutedInk: o.mutedInk, size: o.countSize });
  if (eb || (ct && o.countPos === 'Beside')) {
    parts.push(`<div style="display:flex;align-items:center;gap:10px">${eb}${o.countPos === 'Beside' && ct ? `<span style="color:${o.mutedInk || t.muted};font-size:13px">·</span>${ct}` : ''}</div>`);
    parts.push(gap(o.gapEyebrow || 14));
  }
  parts.push(titleEl(t, a, { size: o.size, ink: o.ink, w: o.titleW, text: o.titleText }));
  if (o.desc !== false && (a.desc || o.descText)) {
    parts.push(gap(o.gapDesc || 18));
    parts.push(descEl(t, a, { mutedInk: o.mutedInk, w: o.descW, size: o.descSize, text: o.descText }));
  }
  if (a.n === 0 && o.notice !== false) {
    parts.push(gap(o.gapDesc || 18));
    parts.push(noticeEl(t, { mutedInk: o.mutedInk, w: o.descW, size: o.descSize }));
  }
  if (ct && o.countPos !== 'Beside') {
    parts.push(gap(o.gapCount || 18));
    parts.push(ct);
  }
  if (o.meta) { parts.push(gap(o.gapCount || 16)); parts.push(metaEl(t, a, { mutedInk: o.mutedInk })); }
  if (o.back || o.action) {
    parts.push(gap(o.gapBack === undefined ? 10 : o.gapBack));
    parts.push(`<div style="display:flex;align-items:center;gap:16px;${centre ? 'justify-content:center' : ''}">${o.back ? backEl(t, { ink: o.ink, mutedInk: o.mutedInk }) : ''}${o.action ? actionEl(t, { kind: o.action, accent: o.accent, fill: o.fill, onAccent: o.onAccent, outline: o.outline, text: o.actionText }) : ''}</div>`);
  }
  return `<div style="display:flex;flex-direction:column;${centre ? 'align-items:center;text-align:center;' : ''}${o.w ? `max-width:${o.w}px;` : ''}${centre && o.w ? 'margin:0 auto;' : ''}">${parts.join('')}</div>`;
}

/* ---- frame chrome ---- */
/* The route: A1 site header · A29 THIS SECTION · A17 or A18 posts · A34 pagination · A3 footer ⚑ */
function siteHeader(t, w) {
  const s = SZ[w] || SZ[1440];
  return `<div style="height:${w === 390 ? 52 : 60}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${t.border};padding:0 ${s.margin}px">
      <div style="display:flex;align-items:center;gap:10px"><span style="width:24px;height:24px;border-radius:${Math.min(t.r, 7)}px;background:${t.accent}"></span><span style="font-family:${t.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>
      ${w === 390 ? `<span style="font-size:18px;color:${t.text}">☰</span>` : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${t.body}"><span>Reporting</span><span>Interviews</span><span style="color:${t.text};font-weight:600">Archive</span><span>Subscribe</span></div>`}
    </div>`;
}
function gridBelow(t, w, o = {}) {
  const s = SZ[w] || SZ[1440];
  const n = w === 390 ? 1 : 3;
  const cw = Math.floor((s.content - 24 * (n - 1)) / n);
  return `<div style="height:22px;display:flex;align-items:flex-end">${mono(10, t.muted, o.belowNote || 'A17·1 THREE UP AND A34 PAGINATION BELOW · NOT THIS SECTION · DRAWN AT LOW OPACITY')}</div>
  <div style="display:flex;flex-direction:column;gap:14px;opacity:.4;padding-top:14px">
    <div style="display:flex;gap:24px">${POSTS.slice(0, n).map(ti => `<div style="width:${cw}px;display:flex;flex-direction:column;gap:10px"><div style="height:${Math.round(cw / 1.5)}px;border-radius:${t.r}px;background:${t.stripe}"></div><span style="font-family:${t.head};font-size:19px;font-weight:700;line-height:1.2;color:${t.text}">${ti}</span></div>`).join('')}</div>
  </div>`;
}
function frame(w, t, inner, o = {}) {
  const s = SZ[w] || SZ[1440];
  const pad = o.padTop === undefined ? s.pad : o.padTop;
  const padNote = o.padNoteText === undefined ? `${pad} · A29'S OWN TOP PADDING · A29 SITS BELOW A1 AND ABOVE A17 ⚑` : o.padNoteText;
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:0 12px 40px rgba(28,27,26,${t.mode === 'd' ? '.24' : '.14'});overflow:hidden;box-sizing:border-box">
    ${o.chrome === false ? '' : siteHeader(t, w)}
    <div style="${o.flush ? '' : `padding:0 ${s.margin}px`}">
      <div style="height:${pad}px;display:flex;align-items:flex-end;padding-bottom:4px;${o.flush ? `padding-left:${s.margin}px;` : ''}">${padNote === false ? '' : mono(10, t.muted, padNote)}</div>
      ${inner}
      <div style="height:${o.padBottom === undefined ? pad : o.padBottom}px"></div>
    </div>
    ${o.below === false ? '' : `<div style="padding:0 ${s.margin}px 36px">${gridBelow(t, w, o)}</div>`}
  </div>`;
}
/* A bare frame: the section alone. For state strips and pack crops. */
function crop(t, w, inner, o = {}) {
  return `<div style="width:${w}px;background:${o.ground || t.bg};border:1px solid ${t.border};border-radius:8px;padding:${o.pad === undefined ? '20px' : o.pad};box-sizing:border-box;display:flex;flex-direction:column;gap:${o.gap || 10}px;overflow:hidden">${inner}${o.label ? `<span style="font-family:${MONO};font-size:11px;color:${o.labelInk || '#6E6A64'};padding:${o.pad === '0' ? '0 20px 16px' : '0'}">${o.label}</span>` : ''}</div>`;
}

/* ---- the control panel ---- */
function seg(values, active) {
  return `<div style="display:flex;background:#EFECE7;border-radius:24px;padding:3px">${values.map(v => `<span style="flex:1;text-align:center;font-size:11.5px;padding:6px 4px;border-radius:24px;${v === active ? 'background:#FFFFFF;box-shadow:0 1px 2px rgba(28,27,26,.06);font-weight:600' : 'color:#6E6A64'}">${v}</span>`).join('')}</div>`;
}
function selectRow(value, disabled) {
  return `<div style="height:36px;background:${disabled ? '#F2EFEA' : '#FFFFFF'};border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:12.5px;color:${disabled ? '#8A857C' : '#1C1B1A'}">${value}</span><span style="font-size:10px;color:#8A857C">${disabled ? '🔒' : '▾'}</span></div>`;
}
function ctl(name, kind, values, active, hint, disabled) {
  const body = kind === 'seg' ? seg(values, active) : selectRow(active, disabled);
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:#6E6A64">${name}</span>${body}${hint ? `<span style="font-size:11px;color:#6E6A64;line-height:1.5">${hint}</span>` : ''}</div>`;
}
/* The item list — only 11 Filter and 13 Index draw it, and only at List: Chosen tags. */
function itemList(o = {}) {
  const items = o.items || SIBLINGS.slice(0, 5).map(s => s.name);
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:#6E6A64">${o.name || 'Chosen tags'}</span>
    <div style="display:flex;flex-direction:column;gap:6px">${items.map(r => `<div style="height:34px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;gap:8px;padding:0 9px"><span style="font-size:11px;color:#B3ADA3">⠿</span><span style="font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r}</span><span style="font-size:11px;color:#8A857C">✕</span></div>`).join('')}
    <div style="height:34px;border:1px dashed #D8D2C8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#6E6A64">+ Add a tag</div></div>
    <span style="font-size:11px;color:#6E6A64;line-height:1.5">${o.hint || 'Two to twelve. <strong style="font-weight:600">Add opens Ghost\'s tag picker and the chosen tag lands at the foot</strong> ⚑, never an empty row. Drag to reorder. Removing the last one returns the control to Every tag.'}</span></div>`;
}
/* The Archive source group — five rows, identical in all fourteen, below the
   design's own controls and not counted toward the brief's 4–7. */
function sourceBlock(o = {}) {
  return `<div style="border-top:1px solid #E7E2DB;padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:#6E6A64">THE ARCHIVE SOURCE · IDENTICAL IN ALL FOURTEEN · NOT COUNTED</span>
    ${ctl('Name', 'select', null, o.name || 'From Ghost', o.nameHint === false ? '' : `From Ghost · Custom text. From Ghost reads ${hbc('{{#tag}}{{name}}')}, ${hbc('{{#author}}{{name}}')} or the route\'s own title ⚑.`)}
    ${ctl('Description', 'select', null, o.desc || 'From Ghost', o.descHint === false ? '' : `From Ghost · Custom text · Off. From Ghost reads the tag description or the author bio; most tags have none ⚑.`)}
    ${ctl('Image', 'select', null, o.img || 'From Ghost', o.imgHint === false ? '' : `From Ghost · Upload · Off. Reads ${hbc('{{#tag}}{{feature_image}}')} or the author\'s cover.`, o.imgDisabled)}
    ${ctl('When the archive is empty', 'select', null, o.empty || 'Head and notice', o.emptyHint === false ? '' : 'Head and notice · Head only. <strong style="font-weight:600">Hide is not offered</strong> — A17 renders nothing at zero, so hiding the head leaves a blank route ⚑.')}
    ${ctl('Where this runs', 'select', null, o.route || 'Tag archive', 'Read-only. <strong style="font-weight:600">Ghost\'s route decides</strong> — tag, author, or a routes.yaml collection; the section reports it and cannot change it ⚑.', true)}
  </div>`;
}
function panel(o) {
  return `<div style="width:320px;background:#F7F5F2;border:1px solid #E7E2DB;border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">
    <div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid #E7E2DB;padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:#6E6A64">Design</span>
      <div style="height:38px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${o.name}</span><span style="font-size:10px;color:#8A857C">${o.n} / 14 ▾</span></div>
      <span style="font-size:11px;color:#6E6A64;line-height:1.5">${o.blurb}</span>
    </div>
    ${o.controls.join('\n')}
    ${o.source === false ? '' : sourceBlock(o.sourceOpts || {})}
    <div style="border-top:1px solid #E7E2DB;padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:#6E6A64">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:#6E6A64">${o.count} CONTROLS + THE SOURCE</span></div></div>`;
}
function panelNote(title, paras, w) {
  return `<div style="width:${w || 948}px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${sub(title)}${paras.map(p => `<span>${p}</span>`).join('')}</div>`;
}
function specCol(items, w) {
  return `<div style="width:${w || 634}px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${items.map(p => `<span>${p}</span>`).join('')}</div>`;
}
function trow(cols, widths, headRow) {
  return `<div style="display:grid;grid-template-columns:${widths};${headRow ? 'background:#F7F5F2;' : ''}border-bottom:1px solid ${headRow ? '#E7E2DB' : '#F1EDE6'}">${cols.map(c => `<span style="font-size:${headRow ? 10.5 : 11.5}px;${headRow ? 'font-weight:600;color:#6E6A64;letter-spacing:.04em;text-transform:uppercase;' : 'color:#3A3835;'}padding:${headRow ? '8px 11px' : '7px 11px'};line-height:1.45">${c}</span>`).join('')}</div>`;
}
function table(rows, widths, w) {
  return `<div style="width:${w || 1288}px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;overflow:hidden;box-sizing:border-box">${rows.map((r, i) => trow(r, widths, i === 0)).join('')}</div>`;
}

/* ---- section + document wrappers ---- */
function section(label, capText, inner, pad) {
  return `<section${label ? ` data-screen-label="${label}"` : ''} style="padding:${pad || '0 56px 48px'};display:flex;flex-direction:column;gap:16px">
  ${capText ? cap(capText) : ''}
  ${inner}
</section>`;
}
function wrapIf(prop, s) { return `<sc-if value="{{ ${prop} }}" hint-placeholder-val="{{ true }}">\n${s}\n</sc-if>`; }
function stack(parts) { return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${parts.join('')}</div>`; }
function col(w, label, inner) {
  return `<div style="display:flex;flex-direction:column;gap:8px;width:${w}">${label ? sub(label) : ''}${inner}</div>`;
}

const PROPS = '{&quot;showControls&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showResponsive&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showDark&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showSpec&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;}}';

function doc(sections, props, logic) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
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
${sections.join('\n\n')}
</x-dc>
<script type="text/x-dc" data-dc-script data-props="${props || PROPS}">
${logic || `class Component extends DCLogic {
  renderVals() {
    return {
      showControls: this.props.showControls ?? true,
      showResponsive: this.props.showResponsive ?? true,
      showDark: this.props.showDark ?? true,
      showSpec: this.props.showSpec ?? true
    };
  }
}`}
</script>
</body>
</html>
`;
}

function intro(o) {
  return `<section style="padding:56px 56px 24px;display:flex;flex-direction:column;gap:14px;max-width:1100px">
  ${mono(12, '#6E6A64', o.kicker)}
  <h1 style="margin:0;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:46px;letter-spacing:-0.03em;line-height:1.04">${o.title}</h1>
  ${o.paras.map(p => `<p style="margin:0;font-size:16px;line-height:1.6;color:#3A3835;max-width:760px;text-wrap:pretty">${p}</p>`).join('\n  ')}
</section>`;
}

/* The ten spec fields, in order, as one pair of columns. */
function specSection(label, o) {
  const left = [
    `${b('1 · Descriptor.')} ${o.descriptor}`,
    `${b('2 · Structural descriptor.')} ${code(o.tuple)}<br><span style="color:#6B6459">${o.tupleNote}</span>`,
    `${b('3 · Archetype.')} ${o.archetype}`,
    `${b('4 · Responsive rule.')} ${o.responsive}`,
    `${b('5 · Content fields.')} ${o.fields}`
  ];
  const right = [
    `${b('6 · Controls, in sidebar order.')} ${o.controls}`,
    `${b('7 · Data.')} ${o.data}`,
    `${b('8 · Empty state.')} ${o.empty}`,
    `${b('9 · Behaviour module.')} ${o.module}`,
    `${b('10 · Accessibility.')} ${o.a11y}`,
    `${b('Flagged ⚑')} ${o.flagged}`
  ];
  return section(label, 'THE WRITTEN SPEC · ALL TEN FIELDS', stack([specCol(left), specCol(right)]));
}

/* One design file, assembled. Each design supplies render(t, w, vals) and its words. */
function buildDesign(o) {
  const vals = o.vals || {}, tabletVals = o.tabletVals || vals, mobileVals = o.mobileVals || vals;
  const S = [];
  S.push(intro({ kicker: `A29 ARCHIVE HEADERS · DESIGN ${o.n} OF 14 · PAPER PACK · ${o.countWord} CONTROLS + THE ARCHIVE SOURCE`, title: o.title, paras: o.paras }));

  S.push(section(`A29-${o.n} desktop light`, o.primaryCap,
    [frame(1440, T, o.render(T, 1440, vals), o.frameOpts || {}), note(o.primaryNote)].join('\n  ')));

  S.push(section(`A29-${o.n} states`, o.statesCap,
    [(o.states || []).map(s => crop(s.dark ? TD : T, s.w || 1336, s.inner, { label: s.label, ground: s.ground, pad: s.pad, gap: s.gap })).join(''), note(o.statesNote)].join('\n  '),
    '0 56px 48px'));

  S.push(wrapIf('showControls', section(`A29-${o.n} controls`, `THE CONTROL PANEL · ${o.countWord} CONTROLS + THE SHARED ARCHIVE SOURCE GROUP`,
    stack([panel(o.panel), panelNote(o.panelNoteTitle || 'WHAT THIS PANEL SETTLES', o.panelNote)]))));

  S.push(wrapIf('showResponsive', section(`A29-${o.n} responsive`, o.responsiveCap,
    [stack([
      col('834px', o.tabletLabel, frame(834, T, o.render(T, 834, tabletVals), o.tabletFrameOpts || o.frameOpts || {})),
      col('390px', o.mobileLabel, frame(390, T, o.render(T, 390, mobileVals), o.mobileFrameOpts || o.frameOpts || {}))
    ]), note(o.responsiveNote)].join('\n  '))));

  S.push(wrapIf('showDark', section(`A29-${o.n} dark`, o.darkCap,
    [frame(1440, TD, o.render(TD, 1440, o.darkVals || vals), o.frameOpts || {}), note(o.darkNote)].join('\n  '))));

  S.push(wrapIf('showSpec', specSection(`A29-${o.n} spec`, o.spec)));
  return doc(S);
}
