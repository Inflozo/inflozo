/* A20 Tag Collections — shared render kit.
   NOTE: any literal Ghost Handlebars in emitted markup must be written with
   {&#8203;{ / }&#8203;} entities — a bare {{ … }} is a DC value hole and renders empty. */
/* Loaded by run_script via new Function(src + ';return {...}')().
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

/* ---- fixtures: Orbit Weekly's tags, as Ghost would return them ---- */
/* n = count.posts · img false → the tag plate · desc '' → the design's no-description rule */
const TAGS = [
  { name: 'Reporting',   n: 42, desc: 'Original reporting from the cities we live in.' },
  { name: 'Interviews',  n: 28, desc: 'Long conversations, lightly edited.' },
  { name: 'Cities',      n: 19, desc: 'Streets, transit, housing, and the people who fix them.' },
  { name: 'Climate',     n: 23, desc: 'The slow story, covered at the pace it moves.' },
  { name: 'Technology',  n: 31, desc: 'What the machines are actually doing.' },
  { name: 'Culture',     n: 17, desc: 'Music, film, and the arguments about them.' },
  { name: 'Archive',     n: 64, desc: 'Everything Orbit Weekly published before 2024.' },
  { name: 'Letters',     n: 12, desc: 'Notes from readers, printed in full.', img: false },
  { name: 'Photography', n: 14, desc: 'Picture stories and the people who shoot them.' },
  { name: 'Books',       n: 9,  desc: '' },
  { name: 'Science',     n: 11, desc: 'Research, checked against the paper it came from.' },
  { name: 'Food',        n: 8,  desc: 'Where the city eats, and what it costs.' },
  { name: 'Housing',     n: 21, desc: 'Who builds, who rents, who decides.' },
  { name: 'Transit',     n: 16, desc: 'Buses, trams, and the timetables that lie.' },
  { name: 'Money',       n: 13, desc: 'Wages, rents, and the local economy.' },
  { name: 'Health',      n: 7,  desc: 'Clinics, waiting lists, and public health.' },
  { name: 'Sport',       n: 6,  desc: 'The teams the city argues about.' },
  { name: 'Education',   n: 5,  desc: 'Schools, funding, and the people teaching.' }
];
const STRESS = [
  { name: 'Housing, transit and the cost of living here', n: 21, desc: 'The single running investigation, and the four reporters carrying it between them, updated most Thursdays.', img: false },
  { name: 'Reporting', n: 42, desc: 'Original reporting from the cities we live in.' },
  { name: 'Books', n: 1, desc: '' },
  { name: 'Interviews', n: 28, desc: 'Long conversations, lightly edited.', img: false },
  { name: 'Climate', n: 23, desc: 'The slow story, covered at the pace it moves.' },
  { name: 'Food', n: 8, desc: '' },
  { name: 'Culture', n: 17, desc: 'Music, film, and the arguments about them.' },
  { name: 'Photography', n: 14, desc: 'Picture stories and the people who shoot them.' }
];
const HEAD = { eyebrow: 'Browse', heading: 'What we cover', intro: 'Every story Orbit Weekly publishes lands in one of these. Follow a topic and you get its whole run, oldest to newest.', link: 'All topics' };
const tags = n => TAGS.slice(0, n);
const plural = t => `${t.n} ${t.n === 1 ? 'post' : 'posts'}`;

/* ---- width table (A17's, unchanged) ---- */
const SZ = {
  1440: { margin: 72, content: 1296, gut: 24, pad: 96 },
  834:  { margin: 40, content: 754,  gut: 24, pad: 80 },
  390:  { margin: 20, content: 350,  gut: 20, pad: 64 }
};
/* A10's cell divisions across 1,296 on a 24 gutter: 636 · 416 · 306 · 240 · 196 */
const cell = (per, content, gut) => Math.floor(((content === undefined ? 1296 : content) - (gut === undefined ? 24 : gut) * (per - 1)) / per);

/* ---- primitives ---- */
const MONO = "'JetBrains Mono',monospace";
const mono = (s, c, txt) => `<span style="font-family:${MONO};font-size:${s}px;color:${c}">${txt}</span>`;
const cap = txt => `<div style="font-family:${MONO};font-size:12px;color:#6E6A64">${txt}</div>`;
const sub = txt => `<span style="font-family:${MONO};font-size:11px;color:#6E6A64">${txt}</span>`;
const note = (txt, w) => `<p style="margin:0;font-size:13px;line-height:1.6;color:#6B6459;max-width:${w || 1290}px">${txt}</p>`;
const b = txt => `<strong style="font-weight:600">${txt}</strong>`;
const code = txt => `<code style="font-family:${MONO};font-size:12px">${txt}</code>`;
const eyebrow = (t, txt, c) => `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${c || t.muted};font-family:${t.body}">${txt}</span>`;
const hair = (t, c) => `<div style="height:1px;background:${c || t.border}"></div>`;
const gap = h => `<div style="height:${h}px"></div>`;

/* Striped image placeholder, A1's, with its mono caption. */
function plate(t, w, h, label, radius) {
  return `<div style="${w ? `width:${w}px;` : 'width:100%;'}height:${h}px;border-radius:${radius === undefined ? t.r : radius}px;background:${t.stripe};display:flex;align-items:flex-end;padding:8px;box-sizing:border-box;overflow:hidden">${label === false ? '' : mono(9.5, t.muted, label || 'TAG IMAGE')}</div>`;
}
/* A17's tag plate, carrying A20's content: the tag's own name, centred, aria-hidden. */
/* The plate is a fixed box, so its content depends on how big the box is:
   under 96 px it carries A1's initial — a 64 px square cannot hold "Photography" at
   any size that reads — and above it the full name, clamped to three lines. */
function tagPlate(t, w, h, name, size) {
  if (w && w < 96) {
    return `<div style="width:${w}px;height:${h}px;border-radius:${t.r}px;background:${t.hover};display:flex;align-items:center;justify-content:center;box-sizing:border-box"><span style="font-family:${t.head};font-size:${Math.round(w * 0.3)}px;font-weight:700;color:${t.muted};line-height:1">${name.trim()[0].toUpperCase()}</span></div>`;
  }
  return `<div style="${w ? `width:${w}px;` : 'width:100%;'}height:${h}px;border-radius:${t.r}px;background:${t.hover};display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:0 8px;overflow:hidden"><span style="font-family:${t.head};font-size:${size || 19}px;font-weight:700;color:${t.muted};text-align:center;line-height:1.15;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${name}</span></div>`;
}
function tagMedia(t, w, h, tag, size) {
  return tag.img === false ? tagPlate(t, w, h, tag.name, size) : plate(t, w, h, false);
}

/* A26·1's tag pill — 13/500 in a hairline box at the pack radius, 32-in-44 target.
   A26·8's large pill is the same at 15 · 17 · 19 in a 44 px box that IS the target. */
function pill(t, tag, o = {}) {
  const s = o.size || 15, large = s >= 15;
  const h = large ? 44 : 32;
  const ink = o.ink || t.text, mutedInk = o.mutedInk || t.muted;
  const countEl = o.count === false ? '' : `<span style="font-size:${Math.max(13, s - 2)}px;color:${mutedInk};font-family:${t.body};font-variant-numeric:tabular-nums">${o.countStyle === 'Posts' ? plural(tag) : tag.n}</span>`;
  return `<span style="height:${h}px;display:inline-flex;align-items:center;gap:8px;padding:0 ${large ? 18 : 13}px;border:1px solid ${o.border || t.border};border-radius:${o.round ? 999 : t.r}px;background:${o.fill || 'transparent'};box-sizing:border-box">
    <span style="font-size:${s}px;font-weight:500;color:${ink};font-family:${t.body};white-space:nowrap">${tag.name}</span>${countEl}</span>`;
}
/* A tile: media on top, name under, count under that. The whole tile is one target. */
function tile(t, w, tag, o = {}) {
  const h = o.h || Math.round(w / (o.ratio || 1.5));
  return `<div style="width:${w}px;display:flex;flex-direction:column;gap:${o.gapY || 12}px;box-sizing:border-box">
    ${tagMedia(t, null, h, tag, 17)}
    <div style="display:flex;flex-direction:column;gap:4px">
      <span style="font-family:${t.head};font-size:${o.size || 19}px;font-weight:700;line-height:1.2;letter-spacing:-0.01em;color:${o.ink || t.text}">${tag.name}</span>
      ${o.count === false ? '' : `<span style="font-size:13px;color:${o.mutedInk || t.muted};font-family:${t.body};font-variant-numeric:tabular-nums">${plural(tag)}</span>`}
      ${o.desc && tag.desc ? `<span style="font-size:15px;line-height:1.55;color:${o.mutedInk || t.muted};font-family:${t.body};padding-top:2px">${tag.desc}</span>` : ''}
    </div></div>`;
}
/* A card: a hairline box carrying name, count and description. */
function tagCard(t, w, tag, o = {}) {
  return `<div style="${w ? `width:${w}px;` : 'flex:1;'}box-sizing:border-box;background:${o.fill || 'transparent'};border:1px solid ${o.border || t.border};border-radius:${t.r}px;padding:${o.pad || '22px 24px'};display:flex;flex-direction:column;gap:6px;min-height:${o.minH || 0}px">
    <span style="font-family:${t.head};font-size:${o.size || 22}px;font-weight:700;line-height:1.2;letter-spacing:-0.01em;color:${o.ink || t.text}">${tag.name}</span>
    <span style="font-size:13px;color:${o.mutedInk || t.muted};font-family:${t.body};font-variant-numeric:tabular-nums">${plural(tag)}</span>
    ${tag.desc ? `<span style="font-size:15px;line-height:1.55;color:${o.mutedInk || t.muted};font-family:${t.body};padding-top:4px">${tag.desc}</span>` : ''}</div>`;
}
/* A row: optional square thumb at the left, name and description, count at the right. */
function tagRowItem(t, w, tag, o = {}) {
  const thumb = o.thumb === false ? '' : tagMedia(t, o.thumbSize || 64, o.thumbSize || 64, tag, 13);
  return `<div style="width:${w ? w + 'px' : '100%'};box-sizing:border-box;display:flex;align-items:center;gap:${o.gapX || 20}px;padding:${o.pad || '16px 0'};min-height:${o.minH || 56}px">
    ${thumb}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
      <span style="font-family:${t.head};font-size:${o.size || 19}px;font-weight:700;line-height:1.25;letter-spacing:-0.01em;color:${o.ink || t.text}">${tag.name}</span>
      ${o.desc === false || !tag.desc ? '' : `<span style="font-size:15px;line-height:1.5;color:${o.mutedInk || t.muted};font-family:${t.body}">${tag.desc}</span>`}
    </div>
    <span style="font-size:${o.countSize || 15}px;color:${o.mutedInk || t.muted};font-family:${t.body};font-variant-numeric:tabular-nums;white-space:nowrap">${o.countStyle === 'Number' ? tag.n : plural(tag)}</span>
    ${o.chevron === false ? '' : `<span style="font-size:13px;color:${o.mutedInk || t.muted};width:12px;text-align:right">›</span>`}</div>`;
}
/* An overlay tile: the picture is the ground, a warm scrim carries the name. */
function overlayTile(t, w, h, tag, o = {}) {
  const scrim = t.mode === 'd'
    ? 'linear-gradient(180deg,rgba(23,21,17,0) 30%,rgba(23,21,17,.62) 100%)'
    : 'linear-gradient(180deg,rgba(35,32,25,0) 30%,rgba(35,32,25,.58) 100%)';
  const inner = `<div style="position:absolute;left:0;right:0;bottom:0;padding:${o.pad || '20px 22px'};display:flex;flex-direction:column;gap:3px">
      <span style="font-family:${t.head};font-size:${o.size || 26}px;font-weight:700;line-height:1.15;letter-spacing:-0.01em;color:#FFFFFF">${tag.name}</span>
      ${o.count === false ? '' : `<span style="font-size:13px;color:rgba(255,255,255,.82);font-family:${t.body};font-variant-numeric:tabular-nums">${plural(tag)}</span>`}</div>`;
  if (tag.img === false) {
    return `<div style="width:${w ? w + 'px' : '100%'};height:${h}px;border-radius:${t.r}px;background:${t.hover};position:relative;overflow:hidden;box-sizing:border-box;display:flex;align-items:flex-end">
      <div style="position:absolute;left:0;right:0;bottom:0;padding:${o.pad || '20px 22px'};display:flex;flex-direction:column;gap:3px">
        <span style="font-family:${t.head};font-size:${o.size || 26}px;font-weight:700;line-height:1.15;letter-spacing:-0.01em;color:${t.text}">${tag.name}</span>
        ${o.count === false ? '' : `<span style="font-size:13px;color:${t.muted};font-family:${t.body};font-variant-numeric:tabular-nums">${plural(tag)}</span>`}</div></div>`;
  }
  return `<div style="width:${w ? w + 'px' : '100%'};height:${h}px;border-radius:${t.r}px;background:${t.stripe};position:relative;overflow:hidden;box-sizing:border-box">
    <div style="position:absolute;inset:0;background:${scrim}"></div>
    <div style="position:absolute;top:8px;left:10px">${mono(9.5, t.mode === 'd' ? '#8E867A' : '#8C8478', 'TAG IMAGE · 3:2 CROP')}</div>
    ${inner}</div>`;
}
/* An index line: name and count on one row, used in columns under a letter. */
function indexLine(t, tag, o = {}) {
  return `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;min-height:${o.minH || 30}px">
    <span style="font-size:${o.size || 15}px;color:${o.ink || t.text};font-family:${t.body}">${tag.name}</span>
    <span style="font-size:13px;color:${o.mutedInk || t.muted};font-family:${t.body};font-variant-numeric:tabular-nums">${tag.n}</span></div>`;
}
function letterHead(t, letter, o = {}) {
  return `<div style="display:flex;flex-direction:column;gap:6px;padding-top:${o.padTop === undefined ? 14 : o.padTop}px">
    ${eyebrow(t, letter, o.mutedInk || t.muted)}${hair(t, o.border)}</div>`;
}

/* The section head — Label · Heading · Heading and intro · None, with an optional
   all-topics link at the right. One component, every design. */
function sectionHead(t, o = {}) {
  const kind = o.kind || 'Heading and intro';
  const ink = o.ink || t.text, mutedInk = o.mutedInk || t.muted;
  const centre = o.align === 'Centre';
  if (kind === 'None') return '';
  const eb = eyebrow(t, o.eyebrow || HEAD.eyebrow, mutedInk);
  const h2 = `<span style="font-family:${t.head};font-size:${o.size || 34}px;font-weight:700;line-height:1.12;letter-spacing:-0.02em;color:${ink};display:block">${o.heading || HEAD.heading}</span>`;
  const intro = `<span style="font-size:${o.introSize || 17}px;line-height:1.6;color:${mutedInk};font-family:${t.body};max-width:${o.introW || 560}px;display:block;${centre ? 'margin:0 auto' : ''}">${o.introText || HEAD.intro}</span>`;
  const link = o.link === false ? '' : `<span style="font-size:14px;font-weight:600;color:${o.accent || t.accent};font-family:${t.body};white-space:nowrap;display:inline-flex;align-items:center;height:44px">${o.linkText || HEAD.link} →</span>`;
  let main;
  if (kind === 'Label') main = `<span style="display:flex;flex-direction:column;gap:0">${eb}</span>`;
  else if (kind === 'Heading') main = `<span style="display:flex;flex-direction:column;gap:10px">${o.eyebrow === false ? '' : eb}${h2}</span>`;
  else main = `<span style="display:flex;flex-direction:column;gap:10px">${o.eyebrow === false ? '' : eb}${h2}${intro}</span>`;
  if (o.stack) return `<div style="display:flex;flex-direction:column;gap:${o.stackGap || 16}px;${centre ? 'align-items:center;text-align:center' : 'align-items:flex-start'};width:100%">${main}${link}</div>`;
  return `<div style="display:flex;align-items:${kind === 'Label' ? 'center' : 'flex-end'};justify-content:${centre ? 'center' : 'space-between'};gap:32px;width:100%;${centre ? 'text-align:center;flex-direction:column' : ''}">${main}${link}</div>`;
}

/* ---- frame chrome ---- */
/* The route: A4 hero · A17 post grid · A20 THIS SECTION · A3 site footer ⚑ */
function above(t, w, o = {}) {
  const s = SZ[w] || SZ[1440];
  const n = w === 390 ? 1 : 3;
  const cw = cell(n, s.content, 24);
  return `<div style="display:flex;flex-direction:column;gap:14px;opacity:.4">
    <div style="display:flex;gap:24px">${['The night shift at the Port of Algeciras', 'Why the new tram line stops short of the hospital', 'Rosa Ferreira on machines that do not exist yet'].slice(0, n).map(ti => `<div style="width:${cw}px;display:flex;flex-direction:column;gap:10px"><div style="height:${Math.round(cw / 1.5)}px;border-radius:${t.r}px;background:${t.stripe}"></div><span style="font-family:${t.head};font-size:19px;font-weight:700;line-height:1.2;color:${t.text}">${ti}</span></div>`).join('')}</div>
  </div>
  <div style="height:24px;display:flex;align-items:flex-end">${mono(10, t.muted, o.aboveNote || 'A17·1 THREE UP ABOVE · NOT THIS SECTION · DRAWN AT HALF OPACITY')}</div>`;
}
function below(t, w, o = {}) {
  return `<div style="height:20px;display:flex;align-items:flex-end">${mono(10, t.muted, o.belowNote || 'A3·2 SITE FOOTER BELOW · NOT THIS SECTION')}</div>
  <div style="display:flex;flex-direction:column;gap:14px;opacity:.4;padding-top:12px">
    ${hair(t)}
    <div style="display:flex;gap:${w === 390 ? 20 : 48}px;flex-wrap:wrap;padding-top:6px">${['Orbit Weekly', 'Reporting', 'Interviews', 'Archive', 'Contact'].map((l, i) => `<span style="font-size:15px;color:${i === 0 ? t.text : t.muted};font-family:${t.body};font-weight:${i === 0 ? 600 : 400}">${l}</span>`).join('')}</div>
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
    ${o.above === false ? '' : `<div style="padding:${o.top === undefined ? 32 : o.top}px ${s.margin}px 0">${above(t, w, o)}</div>`}
    <div style="${o.flush ? '' : `padding:0 ${s.margin}px`}">
      <div style="height:${pad}px;display:flex;align-items:flex-end;padding-bottom:4px;${o.flush ? `padding-left:${s.margin}px` : ''}">${o.padNote === false ? '' : mono(10, t.muted, `${pad} · A20'S OWN TOP PADDING · A20 DRAWS ITS OWN AND CANNOT KNOW WHAT PRECEDES IT ⚑`)}</div>
      ${inner}
      <div style="height:${o.padBottom === undefined ? pad : o.padBottom}px"></div>
    </div>
    ${o.below === false ? '' : `<div style="padding:0 ${s.margin}px 36px">${below(t, w, o)}</div>`}
  </div>`;
}
/* A bare frame: the section alone. For state strips and pack crops. */
function crop(t, w, inner, o = {}) {
  return `<div style="width:${w}px;background:${o.ground || t.bg};border:1px solid ${t.border};border-radius:8px;padding:${o.pad || '20px'};box-sizing:border-box;display:flex;flex-direction:column;gap:${o.gap || 10}px">${inner}${o.label ? sub(o.label) : ''}</div>`;
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
/* The Tags block — four fields, identical in all fifteen, below the design's own
   controls and not counted toward the brief's 4–7. A17's Posts block, for tags. */
function tagsBlock(o = {}) {
  return `<div style="border-top:1px solid #E7E2DB;padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:#6E6A64">THE TAGS BLOCK · IDENTICAL IN ALL FIFTEEN · NOT COUNTED</span>
    ${ctl('Tags', 'select', null, o.source || 'All tags', o.sourceHint === false ? '' : 'All tags · This post\'s tags · This author\'s tags. Compiles to <strong style="font-weight:600">{&#8203;{#get "tags" filter="visibility:public"}&#8203;}</strong> ⚑.')}
    ${ctl('Show', 'select', null, o.show || 'Twelve', o.showHint === false ? '' : 'Four · Six · Eight · Twelve · All. <strong style="font-weight:600">A count, never a chosen set</strong> — the tags are Ghost\'s and cannot be added or removed here.')}
    ${ctl('Order', 'select', null, o.order || 'Most posts first', o.orderHint === false ? '' : 'Most posts first · Fewest first · A–Z · Ghost\'s order ⚑.')}
    ${ctl('Tags with no posts', 'seg', ['Hide', 'Show'], o.empty || 'Hide', o.emptyHint === false ? '' : 'Hidden by default ⚑ — an empty archive is a dead end. <strong style="font-weight:600">Internal <code style="font-family:' + MONO + ';font-size:11px">#hash</code> tags are never drawn</strong> and have no control.')}
  </div>`;
}
function panel(o) {
  return `<div style="width:320px;background:#F7F5F2;border:1px solid #E7E2DB;border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">
    <div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid #E7E2DB;padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:#6E6A64">Design</span>
      <div style="height:38px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${o.name}</span><span style="font-size:10px;color:#8A857C">${o.n} / 15 ▾</span></div>
      <span style="font-size:11px;color:#6E6A64;line-height:1.5">${o.blurb}</span>
    </div>
    ${o.controls.join('\n')}
    ${o.block === false ? '' : tagsBlock(o.blockOpts || {})}
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
  S.push(intro({ kicker: `A20 TAG COLLECTIONS · DESIGN ${o.n} OF 15 · PAPER PACK · ${o.countWord} CONTROLS + THE TAGS BLOCK`, title: o.title, paras: o.paras }));

  S.push(section(`A20-${o.n} desktop light`, o.primaryCap,
    [frame(1440, T, o.render(T, 1440, vals), o.frameOpts || {}), note(o.primaryNote)].join('\n  ')));

  S.push(section(`A20-${o.n} states`, o.statesCap,
    [(o.states || []).map(s => crop(s.dark ? TD : T, s.w || 1336, s.inner, { label: s.label, ground: s.ground, pad: s.pad })).join(''), note(o.statesNote)].join('\n  ')));

  S.push(wrapIf('showControls', section(`A20-${o.n} controls`, `THE CONTROL PANEL · ${o.countWord} CONTROLS + THE SHARED TAGS BLOCK`,
    stack([panel(o.panel), panelNote(o.panelNoteTitle || 'WHAT THIS PANEL SETTLES', o.panelNote)]))));

  S.push(wrapIf('showResponsive', section(`A20-${o.n} responsive`, o.responsiveCap,
    [stack([
      col('834px', o.tabletLabel, frame(834, T, o.render(T, 834, tabletVals), o.tabletFrameOpts || o.frameOpts || {})),
      col('390px', o.mobileLabel, frame(390, T, o.render(T, 390, mobileVals), o.mobileFrameOpts || o.frameOpts || {}))
    ]), note(o.responsiveNote)].join('\n  '))));

  S.push(wrapIf('showDark', section(`A20-${o.n} dark`, o.darkCap,
    [frame(1440, TD, o.render(TD, 1440, o.darkVals || vals), o.frameOpts || {}), note(o.darkNote)].join('\n  '))));

  S.push(wrapIf('showSpec', specSection(`A20-${o.n} spec`, o.spec)));
  return doc(S);
}
