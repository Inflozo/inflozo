/* A27 Related Posts — shared render kit.
   Loaded by run_script via new Function(src + ';return {...}')().
   Every block takes a token object t, so light, dark and the three packs
   are the same code with a different t — which is the category's own rule.
   The post card is A17's, verbatim; A27 adds no card of its own. */

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

/* ---- fixtures ---- */
/* The post being read. A26's post, unchanged. */
const CURRENT = {
  title: 'The four hundred domains that refuse to move',
  author: 'Rosa Menendez', ini: 'RM',
  tags: ['Reporting', 'The web', 'Archives'],
  bio: 'Writes about the parts of the internet that stopped changing. Ten years at a daily paper before this; now in Lisbon.'
};

/* The related set. A17's posts, verbatim, in A17's order.
   P2 carries the 69-character title, P3 has no feature image,
   P4 has no tag and no excerpt, P5's author has no photograph. */
const POSTS = [
  { title: 'The night shift at the Port of Algeciras', tag: 'Reporting',
    excerpt: 'Between midnight and four the port belongs to two hundred people and eleven cranes. We spent a week on the night shift.',
    author: 'Marguerite Okonjo', ini: 'MO', photo: true, date: '12 March 2026', short: '12 Mar', read: '9 min read', crop: 'NIGHT PORT', img: true },
  { title: 'Why the new tram line stops four hundred metres short of the hospital', tag: 'Transport',
    excerpt: 'The line was approved with a stop outside the emergency entrance. The stop that was built is uphill.',
    author: 'Daniel Reith', ini: 'DR', photo: true, date: '9 March 2026', short: '9 Mar', read: '12 min read', crop: 'TRAM STOP, UPHILL', img: true },
  { title: 'Rosa Ferreira on drawing machines that do not exist yet', tag: 'Interview',
    excerpt: 'Her studio is full of half-finished mechanisms that will never be built. She says that is the point.',
    author: 'Priya Raghunathan', ini: 'PR', photo: true, date: '5 March 2026', short: '5 Mar', read: '7 min read', crop: null, img: false },
  { title: 'A short note on the Thursday letter', tag: null, excerpt: null,
    author: 'Marguerite Okonjo', ini: 'MO', photo: true, date: '2 March 2026', short: '2 Mar', read: '2 min read', crop: 'DESK, THURSDAY', img: true },
  { title: 'Six months of rain, measured by one gardener', tag: 'Field notes',
    excerpt: "A retired teacher in Braga has measured her garden's rainfall every morning since September.",
    author: 'Naomi Alder', ini: 'NA', photo: false, date: '26 February 2026', short: '26 Feb', read: '6 min read', crop: 'RAIN GAUGE, BRAGA', img: true },
  { title: 'The last analogue switchboard in Lisbon', tag: 'Reporting', excerpt: null,
    author: 'Tomas Lindqvist', ini: 'TL', photo: true, date: '22 February 2026', short: '22 Feb', read: '8 min read', crop: 'SWITCHBOARD', img: true }
];
const SET3 = [POSTS[0], POSTS[1], POSTS[2]];
const SET4 = [POSTS[0], POSTS[1], POSTS[2], POSTS[4]];
const SET2 = [POSTS[0], POSTS[1]];
const STRESS = [POSTS[1], POSTS[2], POSTS[3], POSTS[4]];

const HEAD = 'Keep reading';
const FALLBACK_HEAD = 'Latest from Orbit Weekly';

/* ---- width table ---- */
const SZ = {
  1440: { margin: 72, content: 1296, measure: 720, gut: 24, pad: 96 },
  834:  { margin: 40, content: 754,  measure: 754, gut: 24, pad: 80 },
  390:  { margin: 20, content: 350,  measure: 350, gut: 20, pad: 64 }
};
function cell(content, n, gut) { return Math.floor((content - (gut === undefined ? 24 : gut) * (n - 1)) / n); }

/* ---- primitives ---- */
const MONO = "'JetBrains Mono',monospace";
const mono = (s, c, txt) => `<span style="font-family:${MONO};font-size:${s}px;color:${c}">${txt}</span>`;
const cap = txt => `<div style="font-family:${MONO};font-size:12px;color:#6E6A64">${txt}</div>`;
const sub = txt => `<span style="font-family:${MONO};font-size:11px;color:#6E6A64">${txt}</span>`;
const note = (txt, w) => `<p style="margin:0;font-size:13px;line-height:1.6;color:#6B6459;max-width:${w || 1290}px">${txt}</p>`;
const b = txt => `<strong style="font-weight:600">${txt}</strong>`;
const code = txt => `<code style="font-family:${MONO};font-size:12px">${txt}</code>`;
const rule = t => `<div style="height:1px;background:${t.border}"></div>`;
const eyebrow = (t, txt, c) => `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${c || t.muted};font-family:${t.body}">${txt}</span>`;

/* A1's avatar, with A1's initials fallback. */
function avatar(t, p, size, ink) {
  if (p.photo === false) {
    return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${ink ? 'rgba(255,255,255,.16)' : t.hover};display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-family:${t.head};font-size:${Math.round(size * 0.42)}px;font-weight:700;color:${ink || t.muted}">${p.ini}</span></span>`;
  }
  return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${t.stripe};flex-shrink:0;display:block"></span>`;
}

/* A17's meta line. mode: 'author-date' | 'date' | 'date-read' | 'author-date-read' | 'off' */
function meta(t, p, mode, o = {}) {
  if (mode === 'off') return '';
  const ink = o.ink || t.muted, size = o.size || 13;
  const parts = mode === 'date' ? [p.date]
    : mode === 'date-read' ? [p.date, p.read]
    : mode === 'author-date-read' ? [p.author, p.date, p.read]
    : [p.author, p.date];
  const av = (mode === 'author-date' || mode === 'author-date-read') && o.avatar !== false
    ? avatar(t, p, o.av || 24, o.ink) : '';
  return `<span style="display:flex;align-items:center;gap:8px;${o.top === false ? '' : `margin-top:${o.mt === undefined ? 6 : o.mt}px`}">${av}<span style="font-size:${size}px;color:${ink};font-family:${t.body}">${parts.join(' · ')}</span></span>`;
}

/* A17's feature image box, and A17's tag plate where a post has none. */
function image(t, p, w, h, o = {}) {
  const rad = o.radius === undefined ? t.r : o.radius;
  if (p.img === false) {
    return `<span style="${w ? `width:${w}px;` : ''}height:${h}px;border-radius:${rad}px;background:${t.hover};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box">${p.tag ? eyebrow(t, p.tag) : ''}</span>`;
  }
  return `<span style="${w ? `width:${w}px;` : ''}height:${h}px;border-radius:${rad}px;background:${t.stripe};display:flex;align-items:flex-end;padding:8px;box-sizing:border-box;flex-shrink:0">${o.label === false ? '' : mono(9, t.muted, `${o.ratio || '3:2'} · ${p.crop}`)}</span>`;
}
function ratioH(w, ratio) {
  const r = ratio === '1:1' ? 1 : ratio === '16:9' ? 16 / 9 : ratio === '4:5' ? 0.8 : 1.5;
  return Math.round(w / r);
}
function titleFor(w) { return w >= 560 ? 26 : w >= 400 ? 22 : w >= 280 ? 19 : 17; }

/* A17's post card, verbatim, minus the tag eyebrow — A27's one departure. */
function card(t, o = {}) {
  const p = o.post, w = o.w || 416, ratio = o.ratio || '3:2';
  const h = o.imgH || ratioH(w, ratio);
  const ts = o.titleSize || titleFor(w);
  const ink = o.ink || t.text, mutedInk = o.mutedInk || t.muted;
  const img = o.image === false ? '' : image(t, p, null, h, { ratio, radius: o.radius });
  const ex = (o.excerpt && p.excerpt)
    ? `<span style="font-size:${o.exSize || 15}px;line-height:1.6;color:${mutedInk};font-family:${t.body};display:-webkit-box;-webkit-line-clamp:${o.excerpt};-webkit-box-orient:vertical;overflow:hidden">${p.excerpt}</span>` : '';
  return `<span style="width:${o.flex ? 'auto' : w + 'px'};${o.flex ? 'flex:1;' : ''}display:flex;flex-direction:column;gap:14px;min-width:0">${img}<span style="display:flex;flex-direction:column;gap:8px">${o.tag && p.tag ? eyebrow(t, p.tag, mutedInk) : ''}<span style="font-family:${t.head};font-size:${ts}px;font-weight:700;line-height:1.2;letter-spacing:-0.01em;color:${ink}">${p.title}</span>${ex}${meta(t, p, o.meta || 'author-date', { ink: mutedInk, av: 24 })}</span></span>`;
}

/* A row: a title and its meta on one measure, with an optional thumbnail. */
function postRow(t, o = {}) {
  const p = o.post, ts = o.titleSize || 19;
  const thumb = o.thumb ? image(t, p, o.thumb, o.thumbH || ratioH(o.thumb, o.ratio || '3:2'), { ratio: o.ratio || '3:2', label: false }) : '';
  const inner = `<span style="display:flex;flex-direction:column;gap:${o.gap || 6}px;min-width:0;flex:1">${o.tag && p.tag ? eyebrow(t, p.tag, o.mutedInk || t.muted) : ''}<span style="font-family:${t.head};font-size:${ts}px;font-weight:700;line-height:1.25;letter-spacing:-0.01em;color:${o.ink || t.text}">${p.title}</span>${o.excerpt && p.excerpt ? `<span style="font-size:15px;line-height:1.6;color:${o.mutedInk || t.muted};font-family:${t.body};display:-webkit-box;-webkit-line-clamp:${o.excerpt};-webkit-box-orient:vertical;overflow:hidden;max-width:${o.exWidth || 560}px">${p.excerpt}</span>` : ''}${meta(t, p, o.meta || 'author-date', { ink: o.mutedInk || t.muted, mt: 2, avatar: o.avatar })}</span>`;
  const right = o.right ? `<span style="font-size:13px;color:${o.mutedInk || t.muted};font-family:${t.body};white-space:nowrap;padding-top:3px">${o.right}</span>` : '';
  return `<span style="display:flex;gap:${o.thumbGap || 20}px;align-items:${o.align || 'flex-start'};padding:${o.pad || '0'};min-width:0">${thumb}${inner}${right}</span>`;
}

/* The section head: Label · Heading · None. */
function head(t, o = {}) {
  const kind = o.kind || 'Label', text = o.text || HEAD;
  if (kind === 'None') return '';
  if (kind === 'Heading') {
    return `<span style="display:flex;align-items:baseline;justify-content:${o.align === 'Centre' ? 'center' : 'space-between'};gap:24px;${o.align === 'Centre' ? 'text-align:center;' : ''}width:100%"><span style="font-family:${t.head};font-size:${o.size || 28}px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:${o.ink || t.text}">${text}</span>${o.link && o.align !== 'Centre' ? `<span style="font-size:14px;font-weight:600;color:${o.ink || t.text};font-family:${t.body};white-space:nowrap">${o.link}</span>` : ''}</span>`;
  }
  return `<span style="display:flex;align-items:center;justify-content:${o.align === 'Centre' ? 'center' : 'space-between'};gap:24px;width:100%">${eyebrow(t, text, o.mutedInk || t.muted)}${o.link && o.align !== 'Centre' ? `<span style="font-size:14px;font-weight:600;color:${o.ink || t.text};font-family:${t.body};white-space:nowrap">${o.link}</span>` : ''}</span>`;
}

/* ---- frame chrome ---- */
/* What sits above A27 on a post route: the tail of A26's footer, at half opacity. */
function footerAbove(t, w, o = {}) {
  const s = SZ[w] || SZ[1440];
  const av = w === 390 ? 48 : 56;
  return `<div style="display:flex;flex-direction:column;gap:10px;opacity:.45;width:${o.measure || s.measure}px;${o.centre ? 'margin:0 auto' : ''}">
    <div style="height:1px;background:${t.border}"></div>
    <div style="display:flex;gap:16px;align-items:flex-start;padding-top:14px">${avatar(t, { photo: true }, av)}<div style="display:flex;flex-direction:column;gap:5px">
      <span style="font-family:${t.head};font-weight:700;font-size:19px;line-height:1.25;color:${t.text}">${CURRENT.author}</span>
      <span style="font-size:15px;line-height:1.6;color:${t.muted};font-family:${t.body};max-width:520px">${CURRENT.bio}</span>
    </div></div>
  </div>
  <div style="height:22px;display:flex;align-items:flex-end">${mono(10, t.muted, o.aboveNote || 'A26·1 POST FOOTER ABOVE · NOT THIS SECTION · DRAWN AT HALF OPACITY')}</div>`;
}
/* What sits below: A3's site footer, at half opacity. */
function footerBelow(t, w, o = {}) {
  const s = SZ[w] || SZ[1440];
  return `<div style="height:20px;display:flex;align-items:flex-end">${mono(10, t.muted, o.belowNote || 'A3 SITE FOOTER BELOW · NOT THIS SECTION')}</div>
  <div style="display:flex;flex-direction:column;gap:12px;opacity:.45;padding-top:10px">
    <div style="height:1px;background:${t.border}"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;font-size:14px;color:${t.muted};font-family:${t.body};${w === 390 ? 'flex-direction:column;gap:8px;align-items:flex-start' : ''}"><span>Orbit Weekly, since 2019</span><span style="display:flex;gap:18px"><span>Archive</span><span>About</span><span>Contact</span></span></div>
  </div>`;
}

function frame(w, t, inner, o = {}) {
  const s = SZ[w] || SZ[1440];
  const pad = o.padTop === undefined ? s.pad : o.padTop;
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:0 12px 40px rgba(28,27,26,${t.mode === 'd' ? '.24' : '.14'});overflow:hidden;box-sizing:border-box">
    ${o.chrome === false ? '' : `<div style="height:${w === 390 ? 52 : 60}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${t.border};padding:0 ${s.margin}px">
      <div style="display:flex;align-items:center;gap:10px"><span style="width:24px;height:24px;border-radius:${Math.min(t.r, 7)}px;background:${t.accent}"></span><span style="font-family:${t.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>
      ${w === 390 ? `<span style="font-size:18px;color:${t.text}">☰</span>` : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${t.body}"><span>Reporting</span><span>Interviews</span><span>Archive</span><span style="color:${t.text};font-weight:600">Subscribe</span></div>`}
    </div>`}
    ${o.above === false ? '' : `<div style="padding:${o.top === undefined ? 32 : o.top}px ${s.margin}px 0">${footerAbove(t, w, o)}</div>`}
    <div style="${o.flush ? '' : `padding:0 ${s.margin}px`}">
      <div style="height:${pad}px;display:flex;align-items:flex-end;padding-bottom:4px;${o.flush ? `padding-left:${s.margin}px` : ''}">${o.padNote === false ? '' : mono(10, t.muted, `${pad} · A27'S OWN TOP PADDING · THE SEAM IS THE SECTION BOUNDARY ⚑`)}</div>
      ${inner}
      <div style="height:${o.padBottom === undefined ? pad : o.padBottom}px"></div>
    </div>
    ${o.below === false ? '' : `<div style="padding:0 ${s.margin}px 36px">${footerBelow(t, w, o)}</div>`}
  </div>`;
}

/* A bare frame: the section alone, no page furniture. For crops and state strips. */
function crop(t, w, inner, o = {}) {
  return `<div style="width:${w}px;background:${o.ground || t.bg};border:1px solid ${t.border};border-radius:8px;padding:${o.pad || '20px'};box-sizing:border-box;display:flex;flex-direction:column;gap:${o.gap || 10}px">${inner}${o.label ? sub(o.label) : ''}</div>`;
}

/* ---- the control panel ---- */
function seg(values, active) {
  return `<div style="display:flex;background:#EFECE7;border-radius:24px;padding:3px">${values.map(v => `<span style="flex:1;text-align:center;font-size:11.5px;padding:6px 4px;border-radius:24px;${v === active ? 'background:#FFFFFF;box-shadow:0 1px 2px rgba(28,27,26,.06);font-weight:600' : 'color:#6E6A64'}">${v}</span>`).join('')}</div>`;
}
function selectRow(value) {
  return `<div style="height:36px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:12.5px">${value}</span><span style="font-size:10px;color:#8A857C">▾</span></div>`;
}
function ctl(name, kind, values, active, hint) {
  const body = kind === 'seg' ? seg(values, active) : selectRow(active);
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:#6E6A64">${name}</span>${body}${hint ? `<span style="font-size:11px;color:#6E6A64;line-height:1.5">${hint}</span>` : ''}</div>`;
}
/* The Related block — three fields, identical in all twelve, below the design's own controls
   and not counted toward the brief's 4–7. A17's Posts block, re-cut for a post route. */
function relatedBlock(o = {}) {
  return `<div style="border-top:1px solid #E7E2DB;padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:#6E6A64">RELATED POSTS · THE SHARED BLOCK · IDENTICAL IN ALL TWELVE · NOT COUNTED</span>
    ${ctl('Related by', 'select', null, o.by || 'Same tag', o.byHint === false ? '' : 'Same tag · Same author · Latest. <strong style="font-weight:600">Same tag matches any of this post\'s tags, newest first</strong> ⚑.')}
    ${ctl('Show', 'seg', ['Two', 'Three', 'Four'], o.show || 'Three', o.showHint)}
    ${ctl('When empty', 'select', null, o.empty || 'Show latest posts', o.emptyHint === false ? '' : 'Or Hide the section. <strong style="font-weight:600">The head changes to the fallback line when it falls back</strong> ⚑.')}
    <span style="font-size:11px;color:#6E6A64;line-height:1.5">No Add, no Remove, no reorder, no per-post anything — <strong style="font-weight:600">the set is Ghost's answer to a query</strong>.</span>
  </div>`;
}
function panel(o) {
  return `<div style="width:320px;background:#F7F5F2;border:1px solid #E7E2DB;border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">
    <div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid #E7E2DB;padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:#6E6A64">Design</span>
      <div style="height:38px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${o.name}</span><span style="font-size:10px;color:#8A857C">${o.n} / 12 ▾</span></div>
      <span style="font-size:11px;color:#6E6A64;line-height:1.5">${o.blurb}</span>
    </div>
    ${o.controls.join('\n')}
    ${o.related === false ? '' : relatedBlock(o.relatedOpts || {})}
    <div style="border-top:1px solid #E7E2DB;padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:#6E6A64">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:#6E6A64">${o.count} CONTROLS + THE BLOCK</span></div></div>`;
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

/* One design file, assembled. Each design supplies render(t, w, vals) and its words. */
function buildDesign(o) {
  const vals = o.vals, tabletVals = o.tabletVals || vals, mobileVals = o.mobileVals || vals;
  const S = [];
  S.push(intro({ kicker: `A27 RELATED POSTS · DESIGN ${o.n} OF 12 · PAPER PACK · ${o.countWord} CONTROLS + THE RELATED BLOCK`, title: o.title, paras: o.paras }));

  S.push(section(`A27-${o.n} desktop light`, o.primaryCap,
    [frame(1440, T, o.render(T, 1440, vals), o.frameOpts || {}), note(o.primaryNote)].join('\n  ')));

  S.push(section(`A27-${o.n} states`, o.statesCap,
    [(o.states || []).map(s => crop(s.dark ? TD : T, s.w || 1336, s.inner, { label: s.label, ground: s.ground, pad: s.pad })).join(''), note(o.statesNote)].join('\n  '),
    '0 56px 48px'));

  S.push(wrapIf('showControls', section(`A27-${o.n} controls`, `THE CONTROL PANEL · ${o.countWord} CONTROLS + THE SHARED RELATED BLOCK`,
    stack([panel(o.panel), panelNote(o.panelNoteTitle || 'WHAT THIS PANEL SETTLES', o.panelNote)]))));

  S.push(wrapIf('showResponsive', section(`A27-${o.n} responsive`, o.responsiveCap,
    [stack([
      col('834px', o.tabletLabel, frame(834, T, o.render(T, 834, tabletVals), o.tabletFrameOpts || o.frameOpts || {})),
      col('390px', o.mobileLabel, frame(390, T, o.render(T, 390, mobileVals), o.mobileFrameOpts || o.frameOpts || {}))
    ]), note(o.responsiveNote)].join('\n  '))));

  S.push(wrapIf('showDark', section(`A27-${o.n} dark`, o.darkCap,
    [frame(1440, TD, o.render(TD, 1440, o.darkVals || vals), o.frameOpts || {}), note(o.darkNote)].join('\n  '))));

  S.push(wrapIf('showSpec', specSection(`A27-${o.n} spec`, o.spec)));
  return doc(S);
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
