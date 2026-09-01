// A33 Koenig Card Treatments — shared card renderers. Extends A30LIB (which extends A23LIB).
// C Post Body's card module is the surface: same panel vocabulary, same ownership matrix.
// A25's measure and body type, A1's button / eyebrow, A17's content box and padding ladder,
// A19's rule that no design tints a photograph, A30's field set — all carried verbatim.
globalThis.A33LIB = (function () {
const K = globalThis.A30LIB;
const { L, D, PACKS, MONO, b, code, tile, gap } = K;
let PK = PACKS.paper;
const setPack = n => { PK = PACKS[n]; };
const hb = K.hb;

/* ── measures · A25's ladder, carried ─────────────────────────────────── */
const AM   = w => w === 1440 ? 720 : w === 834 ? 754 : 350;   // the measure
const BOX  = w => w === 1440 ? 1296 : w === 834 ? 754 : 350;  // A17's content box
const WIDE = w => w === 1440 ? 1040 : w === 834 ? 754 : 350;  // the wide column

/* ── the article this category is drawn inside · A32's fixture, carried ── */
const ARTICLE = {
  title: 'Orbital debris, and the people who count it',
  tag: 'Reporting', author: 'Nadia Okonjo', date: '27 July 2026', read: '12 min read',
  paras: [
    'The catalogue is public, and on any given day a good deal of it is wrong by a few hundred metres. That is not a failure of the people who keep it. It is what happens when you track thirty-six thousand objects with a network of radars built for something else.',
    'The fence sees a fragment the size of a fist at eight hundred kilometres, roughly. The word doing the work in that sentence is roughly: a fragment is not a sphere, it tumbles, and its radar cross-section changes while it does.',
    'The analysts who reconcile those passes into a single number work in an office outside Colorado Springs, and the part I could not get past was how much of the job is arithmetic done twice.'
  ]
};

/* ── the ten cards §8·1 · Orbit Weekly content, never lorem ────────────── */
const CARDS = {
  image: { plate:'IMAGE CARD · THE FENCE AT KWAJALEIN', ratio:0.625,
    cap:'The fence at Kwajalein, photographed from the service road.', credit:'Ida Brandt for Orbit Weekly' },
  gallery: { n:3, ratio:0.72, cap:'Six plates from the proof run, in the order they came off the press.', credit:'Tomás Herrera' },
  bookmark: { title:'The public catalogue of orbital objects',
    desc:'Space-Track publishes the two-line element sets that every other tracker in the world starts from.',
    pub:'space-track.org', author:'United States Space Force' },
  callout: { emoji:'📌',
    text:'Numbers in this piece come from the 12 August catalogue. The July figures we published earlier were revised down by four per cent.' },
  toggle: { head:'How the catalogue is built',
    body:'Radar and optical stations report what they see. The reconciliation into a single element set happens twice a day, and that result is what every other tracker starts from.' },
  button: { label:'Read the correction' },
  embed: { provider:'YOUTUBE', ratio:0.5625, cap:'The 1978 briefing film, digitised by the archive.', credit:'US National Archives' },
  product: { title:'Orbit Weekly Atlas, 2026', desc:'Eleven letterpress plates, sewn, 240 pages.',
    rating:4, cta:'See the atlas' },
  file: { title:'The August catalogue, as published', desc:'Two-line element sets for 36,412 objects.',
    name:'catalogue-2026-08.csv', size:'1.4 MB' },
  header: { head:'A field guide to the fence', sub:'Six stations, one catalogue, and the arithmetic between them', cta:'Start reading' },
  markdown: { body:'Ghost parses Markdown as it is typed, and the Markdown card renders the same HTML with <strong style="font-weight:600">no wrapper class of its own</strong>.', head:'What the fence reports', list:['Radar returns, twice a day', 'Optical passes, weather permitting', 'One reconciliation, published at 06:00'] },
  html: { code:'&lt;table class="orbit-elements"&gt;\n  &lt;tr&gt;&lt;th&gt;Object&lt;/th&gt;&lt;th&gt;Altitude&lt;/th&gt;&lt;/tr&gt;\n  &lt;tr&gt;&lt;td&gt;1998-067A&lt;/td&gt;&lt;td&gt;408 km&lt;/td&gt;&lt;/tr&gt;\n&lt;/table&gt;', vis:'Paid members' },
  divider: { },
  email: { greet:'Hey {first_name},', text:'a short note before the piece: the August catalogue landed on Tuesday and we have re-run the tables.' },
  cta: { label:'Sponsored by Kepler Optics', text:'Kepler Optics builds the tracking mounts three of the six stations use. They are offering Orbit Weekly readers a look at the new mount before it ships.', btn:'See the mount', vis:'Public visitors' },
  preview: { },
  gif: { plate:'GIF · RENDERS AS AN IMAGE CARD', cap:'Six hours of the catalogue, sped up.', credit:'Orbit Weekly' },
  audio: { title:'Counting the fence, episode 14', sub:'Orbit Weekly · 41 min', time:'0:00', dur:'41:12' },
  video: { plate:'VIDEO CARD · GHOST’S OWN PLAYER · POSTER FRAME', ratio:0.5625, cap:'The reconciliation run, recorded over one shift.', credit:'Orbit Weekly', dur:'6:24' },
  signup: { head:'The Tuesday note, from the desk', sub:'What we are working on, what we dropped, and the corrections before anyone else sees them.',
    btn:'Subscribe', legal:'No spam. Unsubscribe any time.', label:'signup-card-post' }
};
const CARD_LABEL = {
  image:'IMAGE · .kg-image-card', markdown:'MARKDOWN · NO WRAPPER CLASS', html:'HTML · THE AUTHOR’S OWN MARKUP',
  gallery:'GALLERY · .kg-gallery-card', divider:'DIVIDER · hr', bookmark:'BOOKMARK · .kg-bookmark-card',
  email:'EMAIL CONTENT · NEWSLETTER ONLY', cta:'CALL TO ACTION · .kg-cta-card',
  preview:'PUBLIC PREVIEW · THE MEMBERS-ONLY MARKER', button:'BUTTON · .kg-button-card',
  callout:'CALLOUT · .kg-callout-card', gif:'GIF · .kg-image-card', toggle:'TOGGLE · .kg-toggle-card',
  audio:'AUDIO · .kg-audio-card', video:'VIDEO · .kg-video-card', file:'FILE · .kg-file-card',
  product:'PRODUCT · .kg-product-card', header:'HEADER · .kg-header-card', embed:'EMBEDS · .kg-embed-card',
  signup:'SIGNUP · .kg-signup-card'
};
/* Ghost's own order, from ghost.org/help/cards · twenty cards, all drawn */
const ORDER = ['image', 'markdown', 'html', 'gallery', 'divider', 'bookmark', 'email', 'cta', 'preview',
  'button', 'callout', 'gif', 'toggle', 'audio', 'video', 'file', 'product', 'header', 'embed', 'signup'];
const OWNS = {
  image:'theme', markdown:'a25', html:'author', gallery:'ghost', divider:'theme', bookmark:'theme',
  email:'none', cta:'theme', preview:'a32', button:'theme', callout:'theme', gif:'theme', toggle:'ghost',
  audio:'ghost', video:'ghost', file:'theme', product:'theme', header:'theme', embed:'provider', signup:'theme'
};
const OWNS_NOTE = {
  theme:'A33 OWNS THE ARRANGEMENT',
  ghost:'GHOST SHIPS CSS AND A SCRIPT · A33 RE-STYLES THE SHELL ⚑',
  author:'WHATEVER THE AUTHOR PASTES WINS · A33 OWNS THE SPACE AROUND IT ONLY ⚑',
  provider:'THE THIRD PARTY’S MARKUP · A33 OWNS THE FRAME ONLY ⚑',
  a25:'A25’S TYPE, NOT A CARD · NO WRAPPER CLASS TO STYLE ⚑',
  a32:'A32 RENDERS THE GATE HERE · A33 OWNS THE MARKER’S SPACE ⚑',
  none:'NEVER RENDERS ON THE WEB · STRIPPED FROM THE PUBLISHED POST ⚑'
};

/* ── the boundary strip · on every frame ───────────────────────────────── */
function boundary(t, w, extra) {
  const line = (txt, o) => `<span style="font-family:${MONO};font-size:10px;color:${t.muted}${o ? ';opacity:.85' : ''}">${txt}</span>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;padding:9px 0 0">
    ${line('THEMED · CSS OVER GHOST’S OWN CARD CLASSES INSIDE ' + hb('content') + ' ⚑')}
    ${line('GHOST OWNS THE MARKUP AND THE WIDTH CLASS · A33 OWNS WHAT THEY RESOLVE TO', 1)}
    ${line('SET ONCE, SITE-WIDE · NO A25 SECTION DESIGN CHANGES IT · C.2, CARRIED', 1)}
    ${extra ? line(extra, 1) : ''}</div>`;
}

/* ── the post header above · A24, drawn low so the body has context ────── */
function postHead(t, w) {
  const g = K.ground(t, 'page');
  return `<div style="padding-top:${w === 390 ? 20 : 26}px">
    <span style="font-family:${MONO};font-size:10px;color:${t.muted}">A24 POST HEADER AND A25·1 MEASURED ABOVE · NOT THIS CATEGORY · DRAWN LOW</span>
    <div style="opacity:.55;padding-top:12px;display:flex;flex-direction:column;gap:${w === 390 ? 8 : 10}px;width:${AM(w)}px;margin:0 auto">
      <span style="font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};font-family:${PK.body}">${ARTICLE.tag}</span>
      <span style="font-family:${PK.head};font-size:${w === 390 ? 24 : 30}px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:${g.text};text-wrap:pretty">${ARTICLE.title}</span>
      <span style="font-size:13.5px;color:${g.muted};font-family:${PK.body}">${ARTICLE.author} · ${ARTICLE.date} · ${ARTICLE.read}</span></div></div>`;
}
/* body paragraph · A25's 19/1.7 at the measure */
function para(t, w, i, o) {
  o = o || {}; const g = K.ground(t, 'page');
  const m = o.m || AM(w);
  return `<p style="margin:0;font-size:${w === 390 ? 17 : 19}px;line-height:1.7;color:${g.text};font-family:${PK.body};width:${m}px;max-width:100%;text-wrap:pretty">${ARTICLE.paras[i]}</p>`;
}

/* ── the treatment · six of these, and every card reads it ─────────────── */
// tr = { key, contain:'none'|'card'|'plane'|'band', rules, pad, planeW, mediaW, capMode,
//        credit, space, calloutPlane, shadow, bleedAt, gutter }
function groundFor(t, tr, kind) {
  if (tr.contain === 'band' && kind !== 'media') return K.ground(t, 'contrast', PK);
  if (tr.contain === 'card' || tr.contain === 'plane') return K.ground(t, 'surface', PK);
  return K.ground(t, 'page', PK);
}
const rad = (t, tr) => tr.radius === undefined ? PK.r : tr.radius;
/* a media width that fits a tile · the canvas caps drawn image height at 520 ⚑ */
const fitMW = (tr, m) => tr.contain === 'card' ? m - 2 * tr.pad : m;
const capH = h => Math.min(h, 520);

/* the wrapper every copy-bearing card sits in */
function shell(t, w, tr, o) {
  o = o || {};
  const m = o.m || AM(w);
  const inner = o.inner;
  if (tr.contain === 'card') {
    const g = K.ground(t, 'surface', PK);
    return `<div style="width:${m}px;max-width:100%;background:${g.bg};border:1px solid ${g.border};border-radius:${rad(t, tr)}px;${tr.shadow && !t.dark ? `box-shadow:${t.sm};` : ''}padding:${tr.pad}px;box-sizing:border-box">${inner}</div>`;
  }
  if (tr.contain === 'plane' || tr.contain === 'band') {
    const g = groundFor(t, tr, 'copy');
    const pw = o.pw || tr.planeW(w);
    const iw = Math.min(m, pw - 2 * tr.pad);
    return `<div style="width:${pw}px;max-width:100%;background:${g.bg};border-radius:${rad(t, tr)}px;padding:${tr.pad}px;box-sizing:border-box;display:flex;justify-content:center">
      <div style="width:${iw}px;max-width:100%">${inner}</div></div>`;
  }
  if (o.tint) {
    const g = K.ground(t, 'page', PK);
    return `<div style="width:${m}px;max-width:100%;background:${t.hover};border-radius:${rad(t, tr)}px;padding:${o.tintPad || 22}px;box-sizing:border-box">${inner}</div>`;
  }
  if (tr.rules === 'none') return `<div style="width:${m}px;max-width:100%">${inner}</div>`;
  const bd = K.ground(t, 'page', PK).border;
  return `<div style="width:${m}px;max-width:100%;border-top:1px solid ${bd};${tr.rules === 'both' ? `border-bottom:1px solid ${bd};` : ''}padding:${o.rulePad || 20}px 0;box-sizing:border-box">${inner}</div>`;
}

/* ── caption and credit · §8·2 ─────────────────────────────────────────── */
function caption(t, w, tr, o) {
  o = o || {};
  const g = groundFor(t, tr, o.on || 'media');
  if (tr.capMode === 'hidden') return '';
  const centre = tr.capAlign === 'centre';
  const bits = [];
  const cw = o.w || AM(w);
  const cred = tr.credit === 'hidden' ? '' : o.credit;
  if (tr.credit === 'with' && cred) {
    bits.push(`<span style="font-size:13.5px;line-height:1.55;color:${g.muted};font-family:${PK.body};text-wrap:pretty">${o.text} <span style="opacity:.8">${cred}</span></span>`);
  } else {
    bits.push(`<span style="font-size:13.5px;line-height:1.55;color:${g.muted};font-family:${PK.body};text-wrap:pretty">${o.text}</span>`);
    if (cred) bits.push(`<span style="font-size:13px;line-height:1.5;color:${g.muted};opacity:.8;font-family:${PK.body}">${cred}</span>`);
  }
  return `<div style="width:${cw}px;max-width:100%;display:flex;flex-direction:column;gap:4px;padding-top:${o.pt === undefined ? 12 : o.pt};${centre ? 'text-align:center;align-items:center;' : ''}">${bits.join('')}</div>`;
}

/* ── media cards · image, gallery, embed ───────────────────────────────── */
function figure(t, w, tr, o) {
  o = o || {};
  const width = o.width || 'regular';
  const m = o.m || AM(w);
  const mw = o.mw || tr.mediaW(w, width, m);
  const bleed = tr.bleedAt && width === tr.bleedAt;
  const capW = tr.capMode === 'media' ? mw : Math.min(m, mw);
  const inner = `${o.media}${caption(t, w, tr, { text:o.cap, credit:o.credit, w:capW, pt:o.capPt })}`;
  if (tr.contain === 'card' && o.panel !== false) {
    const g = K.ground(t, 'surface', PK);
    return `<div style="width:${mw + 2 * tr.pad}px;max-width:100%;background:${g.bg};border:1px solid ${g.border};border-radius:${rad(t, tr)}px;${tr.shadow && !t.dark ? `box-shadow:${t.sm};` : ''}padding:${tr.pad}px;box-sizing:border-box;display:flex;flex-direction:column;align-items:${tr.capAlign === 'centre' ? 'center' : 'flex-start'}">${inner}</div>`;
  }
  return `<div style="width:${bleed ? '100%' : mw + 'px'};max-width:100%;display:flex;flex-direction:column;align-items:center">${inner}</div>`;
}
function imageCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.image;
  const width = o.width || 'regular';
  const m = o.m || AM(w);
  const mw = o.mw || tr.mediaW(w, width, m);
  const bleed = tr.bleedAt && width === tr.bleedAt;
  const media = K.plate(t, { w:bleed ? '100%' : mw, h:capH(Math.round((bleed ? (o.vw || w) : mw) * c.ratio)),
    cap:o.plateCap === false ? '' : (o.plateCap || c.plate), r:bleed ? 0 : rad(t, tr), pack:PK });
  return figure(t, w, tr, { width, m, mw, media, cap:o.cap === false ? '' : c.cap, credit:c.credit, panel:o.panel });
}
function galleryCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.gallery;
  const width = o.width || 'wide';
  const m = o.m || AM(w);
  const mw = o.mw || tr.mediaW(w, width, m);
  const n = o.n === undefined ? c.n : o.n;
  const gut = tr.gutter === undefined ? 12 : tr.gutter;
  const rowsN = o.rows || 1;
  const iw = n === 1 ? mw : Math.floor((mw - gut * (n - 1)) / n);
  const rowHtml = Array.from({ length:rowsN }, (_, r) => `<div style="display:flex;gap:${gut}px;width:${mw}px;max-width:100%">${
    Array.from({ length:n }, (_, i) => K.plate(t, { w:iw, h:capH(Math.round(iw * c.ratio)),
      cap:iw > 200 ? `PLATE ${r * n + i + 1}` : '', r:rad(t, tr), pack:PK })).join('')}</div>`).join('');
  const media = rowsN > 1
    ? `<div style="display:flex;flex-direction:column;gap:${gut}px;width:${mw}px;max-width:100%">${rowHtml}</div>`
    : rowHtml;
  return figure(t, w, tr, { width, m, mw, media, cap:c.cap, credit:c.credit });
}
function embedCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.embed;
  const width = o.width || 'regular';
  const m = o.m || AM(w);
  const mw = o.mw || tr.mediaW(w, width, m);
  const bleed = tr.bleedAt && width === tr.bleedAt;
  const media = `<div style="width:${bleed ? '100%' : mw + 'px'};max-width:100%;height:${capH(Math.round((bleed ? (o.vw || w) : mw) * c.ratio))}px;border-radius:${bleed ? 0 : rad(t, tr)}px;background:${t.dark ? '#0E0D0B' : '#1C1A16'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-sizing:border-box">
    <span style="width:56px;height:56px;border-radius:56px;background:rgba(251,249,245,.92);display:flex;align-items:center;justify-content:center;font-size:19px;color:#232019">▶</span>
    <span style="font-family:${MONO};font-size:10px;color:rgba(251,249,245,.72)">${c.provider} EMBED · THE PROVIDER’S OWN IFRAME · A33 OWNS THE FRAME, NOT WHAT IS INSIDE IT ⚑</span></div>`;
  return figure(t, w, tr, { width, m, mw, media, cap:c.cap, credit:c.credit });
}

/* ── copy-bearing cards ────────────────────────────────────────────────── */
function bookmarkCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.bookmark;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const narrow = w === 390 || m < 460;
  const thumb = o.thumb === false ? '' : K.plate(t, { w:narrow ? '100%' : (o.tw || 168), h:narrow ? 132 : (o.tw || 168),
    cap:'', r:tr.contain === 'card' || tr.contain === 'plane' || tr.contain === 'band' ? Math.max(rad(t, tr) - 4, 0) : rad(t, tr), pack:PK });
  const text = `<div style="display:flex;flex-direction:column;gap:7px;flex:1;min-width:0">
    <span style="font-family:${PK.head};font-size:${narrow ? 18 : 19}px;font-weight:700;line-height:1.25;color:${g.text};text-wrap:pretty">${c.title}</span>
    ${c.desc ? `<span style="font-size:14.5px;line-height:1.55;color:${g.muted};font-family:${PK.body};text-wrap:pretty">${c.desc}</span>` : ''}
    <div style="display:flex;align-items:center;gap:8px;padding-top:3px">
      <span style="width:16px;height:16px;border-radius:4px;background:${g.muted};opacity:.5;flex-shrink:0"></span>
      <span style="font-size:13px;color:${g.muted};font-family:${PK.body};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.pub} · ${c.author}</span></div></div>`;
  const inner = narrow
    ? `<div style="display:flex;flex-direction:column;gap:14px">${thumb}${text}</div>`
    : `<div style="display:flex;align-items:${o.align || 'flex-start'};gap:20px">${text}${thumb}</div>`;
  return shell(t, w, tr, { inner, m, pw:o.pw, rulePad:22 });
}
function calloutCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.callout;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const emoji = tr.emoji === 'hidden' ? '' : `<span style="font-size:19px;line-height:1.5;flex-shrink:0" aria-hidden="true">${c.emoji}</span>`;
  const inner = `<div style="display:flex;align-items:flex-start;gap:13px">${emoji}
    <span style="font-size:16.5px;line-height:1.6;color:${g.text};font-family:${PK.body};text-wrap:pretty">${o.text || c.text}</span></div>`;
  const tint = tr.contain === 'none' && tr.calloutPlane !== 'none';
  return shell(t, w, tr, { inner, m, pw:o.pw, tint, tintPad:22, rulePad:20 });
}
function toggleCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.toggle;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const open = o.open;
  const head = `<div style="display:flex;align-items:center;gap:14px;min-height:44px">
    <span style="flex:1;font-family:${PK.head};font-size:${w === 390 ? 18 : 19}px;font-weight:700;line-height:1.3;color:${g.text}">${c.head}</span>
    <span style="font-size:15px;line-height:1;color:${g.muted};flex-shrink:0;${open ? 'transform:rotate(180deg);' : ''}display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px">⌄</span></div>`;
  const body = open ? `<div style="padding-top:14px;margin-top:14px;border-top:1px solid ${g.border}">
    <span style="font-size:16px;line-height:1.65;color:${g.muted};font-family:${PK.body};text-wrap:pretty">${c.body}</span></div>` : '';
  return shell(t, w, tr, { inner:head + body, m, pw:o.pw, rulePad:18 });
}
function buttonCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.button;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const centre = o.align !== 'left';
  const inner = `<div style="display:flex;justify-content:${centre ? 'center' : 'flex-start'};width:100%">${
    K.btn(g, { label:o.label || c.label, pack:PK, h:48, px:24, variant:o.variant || (tr.contain === 'band' ? 'carried' : 'primary') })}</div>`;
  if (tr.contain === 'card' || tr.contain === 'plane' || tr.contain === 'band') return shell(t, w, tr, { inner, m, pw:o.pw });
  return `<div style="width:${m}px;max-width:100%">${inner}</div>`;
}
function productCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.product;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const img = o.image === false ? '' : K.plate(t, { w:'100%', h:o.imgH || 200, cap:'PRODUCT IMAGE · 16:9',
    r:Math.max(rad(t, tr) - 4, 0), pack:PK, style:'margin-bottom:18px' });
  const stars = `<div style="display:flex;align-items:center;gap:8px">
    <span style="font-size:14px;letter-spacing:2px;color:${g.btnBg}">★★★★<span style="opacity:.28">★</span></span>
    <span style="font-size:13px;color:${g.muted};font-family:${PK.body}">${c.rating} out of 5</span></div>`;
  const inner = `${img}<div style="display:flex;flex-direction:column;gap:10px">
    <span style="font-family:${PK.head};font-size:${w === 390 ? 19 : 21}px;font-weight:700;line-height:1.25;color:${g.text}">${c.title}</span>
    <span style="font-size:15px;line-height:1.55;color:${g.muted};font-family:${PK.body}">${c.desc}</span>${stars}
    <div style="padding-top:6px">${K.btn(g, { label:c.cta, pack:PK, h:44, px:20, variant:tr.contain === 'band' ? 'carried' : 'primary' })}</div></div>`;
  return shell(t, w, tr, { inner, m, pw:o.pw, rulePad:22 });
}
function fileCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.file;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const glyph = `<span style="width:44px;height:44px;border-radius:${Math.min(rad(t, tr), 8)}px;border:1px solid ${g.border};display:flex;align-items:center;justify-content:center;font-size:17px;color:${g.text};flex-shrink:0">↓</span>`;
  const text = `<div style="display:flex;flex-direction:column;gap:5px;flex:1;min-width:0">
    <span style="font-size:16px;font-weight:600;line-height:1.35;color:${g.text};font-family:${PK.body};text-wrap:pretty">${c.title}</span>
    ${o.desc === false ? '' : `<span style="font-size:14.5px;line-height:1.5;color:${g.muted};font-family:${PK.body}">${c.desc}</span>`}
    <span style="font-family:${MONO};font-size:12px;color:${g.muted};padding-top:2px">${c.name} · ${c.size}</span></div>`;
  const inner = `<div style="display:flex;align-items:center;gap:16px">${text}${glyph}</div>`;
  return shell(t, w, tr, { inner, m, pw:o.pw, rulePad:18 });
}
function headerCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.header;
  const size = o.size || 'medium';
  const m = o.m || AM(w);
  const pw = o.pw || (tr.contain === 'band' || tr.contain === 'plane' ? tr.planeW(w) : (o.headerW || BOX(w)));
  const g = tr.contain === 'band' ? K.ground(t, 'contrast') : K.ground(t, 'surface');
  const h = size === 'small' ? (w === 390 ? 200 : 232) : size === 'large' ? (w === 390 ? 320 : 400) : (w === 390 ? 250 : 312);
  const hs = size === 'small' ? (w === 390 ? 25 : 30) : size === 'large' ? (w === 390 ? 32 : 46) : (w === 390 ? 28 : 38);
  return `<div style="width:${pw}px;max-width:100%;min-height:${h}px;background:${g.bg};border-radius:${rad(t, tr)}px;padding:${w === 390 ? 28 : 44}px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px">
    <span style="font-family:${PK.head};font-size:${hs}px;font-weight:700;line-height:1.12;letter-spacing:-0.03em;color:${g.text};max-width:${Math.min(m, pw - 88)}px;text-wrap:pretty">${c.head}</span>
    <span style="font-size:${w === 390 ? 15 : 17}px;line-height:1.55;color:${g.muted};font-family:${PK.body};max-width:${Math.min(m - 40, pw - 120)}px;text-wrap:pretty">${c.sub}</span>
    <div style="padding-top:8px">${K.btn(g, { label:c.cta, pack:PK, h:46, px:22, variant:tr.contain === 'band' ? 'carried' : 'primary' })}</div></div>`;
}
/* ── the ten cards Ghost ships CSS for, or hands over entirely ─────────── */
function markdownCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.markdown;
  const g = K.ground(t, 'page', PK);
  const m = o.m || AM(w);
  return `<div style="width:${m}px;max-width:100%;display:flex;flex-direction:column;gap:14px">
    <p style="margin:0;font-size:${w === 390 ? 17 : 19}px;line-height:1.7;color:${g.text};font-family:${PK.body};text-wrap:pretty">${c.body}</p>
    <h3 style="margin:0;font-family:${PK.head};font-size:${w === 390 ? 21 : 24}px;font-weight:700;line-height:1.3;color:${g.text}">${c.head}</h3>
    <div style="display:flex;flex-direction:column;gap:8px">${c.list.map(x =>
      `<div style="display:flex;gap:12px"><span style="color:${g.muted};flex-shrink:0">·</span><span style="font-size:${w === 390 ? 16 : 17}px;line-height:1.6;color:${g.text};font-family:${PK.body}">${x}</span></div>`).join('')}</div>
    <span style="font-family:${MONO};font-size:10px;color:${g.muted}">NO WRAPPER CLASS · A25’S TYPE, VERBATIM · NO A33 CONTROL REACHES THIS CARD ⚑</span></div>`;
}
function htmlCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.html;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const inner = `<div style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="font-family:${MONO};font-size:10px;letter-spacing:.05em;color:${g.muted}">THE AUTHOR’S MARKUP</span>
      <span style="display:inline-flex;align-items:center;height:22px;padding:0 9px;border:1px solid ${g.border};border-radius:${Math.min(rad(t, tr), 8)}px;font-size:11.5px;color:${g.muted};font-family:${PK.body}">Visible to ${c.vis}</span></div>
    <pre style="margin:0;font-family:${MONO};font-size:12.5px;line-height:1.7;color:${g.text};background:${g.name === 'page' ? t.hover : 'transparent'};border-radius:${Math.min(rad(t, tr), 8)}px;padding:14px 16px;overflow:hidden;white-space:pre-wrap">${c.code}</pre>
    <span style="font-family:${MONO};font-size:10px;color:${g.muted}">A33 OWNS THE SPACE AROUND IT AND NOTHING INSIDE ⚑ · VISIBILITY IS GHOST’S, PER CARD</span></div>`;
  return shell(t, w, tr, { inner, m, pw:o.pw, rulePad:20 });
}
function dividerCard(t, w, tr, o) {
  o = o || {};
  const g = K.ground(t, 'page', PK);
  const m = o.m || AM(w);
  const wide = tr.dividerWidth === 'short';
  return `<div style="width:${m}px;max-width:100%;display:flex;flex-direction:column;gap:10px;align-items:center">
    ${tr.dividerGlyph
      ? `<span style="font-family:${PK.head};font-size:19px;letter-spacing:.5em;color:${g.muted};padding-left:.5em">···</span>`
      : `<span style="width:${wide ? '96px' : '100%'};height:1px;background:${g.border}"></span>`}
    <span style="font-family:${MONO};font-size:10px;color:${g.muted}">DIVIDER · A BARE hr · WEIGHT, WIDTH, THE SPACE AROUND IT AND AN OPTIONAL GLYPH ARE A33’S</span></div>`;
}
function emailCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.email;
  const g = K.ground(t, 'page', PK);
  const m = o.m || AM(w);
  return `<div style="width:${m}px;max-width:100%;display:flex;flex-direction:column;gap:12px;border:1px dashed ${g.border};border-radius:${rad(t, tr)}px;padding:20px;box-sizing:border-box">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.05em;color:${g.muted}">NEWSLETTER ONLY · STRIPPED FROM THE PUBLISHED POST ⚑ · DRAWN SO A USER CAN SEE THAT NOTHING RENDERS</span>
    <div style="opacity:.42;display:flex;flex-direction:column;gap:6px">
      <span style="font-size:${w === 390 ? 17 : 19}px;line-height:1.7;color:${g.text};font-family:${PK.body}">${c.greet}</span>
      <span style="font-size:${w === 390 ? 17 : 19}px;line-height:1.7;color:${g.text};font-family:${PK.body};text-wrap:pretty">${c.text}</span></div>
    <span style="font-family:${MONO};font-size:10px;color:${g.muted}">THE FALLBACK FOR first_name IS THE AUTHOR’S · GHOST’S NEWSLETTER TEMPLATE OWNS THE TYPE</span></div>`;
}
function ctaCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.cta;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const narrow = w === 390 || m < 460;
  const img = K.plate(t, { w:narrow ? '100%' : 200, h:narrow ? 150 : 150, cap:'', r:Math.max(rad(t, tr) - 4, 0), pack:PK });
  const text = `<div style="display:flex;flex-direction:column;gap:10px;flex:1;min-width:0">
    <span style="font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};font-family:${PK.body}">${c.label}</span>
    <span style="font-size:16px;line-height:1.6;color:${g.text};font-family:${PK.body};text-wrap:pretty">${c.text}</span>
    <div style="padding-top:4px">${K.btn(g, { label:c.btn, pack:PK, h:44, px:20, variant:tr.contain === 'band' ? 'carried' : 'primary' })}</div></div>`;
  const inner = `<div style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;${narrow ? 'flex-direction:column;' : ''}align-items:${narrow ? 'stretch' : 'flex-start'};gap:20px">${img}${text}</div>
    <span style="font-family:${MONO};font-size:10px;color:${g.muted}">SHOWN TO ${c.vis.toUpperCase()} · ON THE WEB, IN THE NEWSLETTER, OR BOTH — GHOST’S CHOICE, PER CARD ⚑</span></div>`;
  return shell(t, w, tr, { inner, m, pw:o.pw, tint:tr.contain === 'none' && tr.calloutPlane !== 'none', tintPad:22, rulePad:22 });
}
function previewCard(t, w, tr, o) {
  o = o || {};
  const g = K.ground(t, 'page', PK);
  const m = o.m || AM(w);
  return `<div style="width:${m}px;max-width:100%;display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:center;gap:12px">
      <span style="flex:1;height:1px;background:${g.border}"></span>
      <span style="font-family:${MONO};font-size:9.5px;letter-spacing:.05em;color:${g.muted};white-space:nowrap">PUBLIC PREVIEW ENDS HERE</span>
      <span style="flex:1;height:1px;background:${g.border}"></span></div>
    <span style="font-family:${MONO};font-size:10px;color:${g.muted};text-align:center">NOT A CARD ON THE WEB ⚑ · GHOST CUTS THE RESPONSE HERE AND A32 RENDERS THE GATE · A33 OWNS THE SPACE ABOVE IT</span></div>`;
}
function gifCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.gif;
  const width = o.width || 'regular';
  const m = o.m || AM(w);
  const mw = o.mw || tr.mediaW(w, width, m);
  const media = `<div style="position:relative;width:${mw}px;max-width:100%">${
    K.plate(t, { w:'100%', h:capH(Math.round(mw * 0.56)), cap:c.plate, r:rad(t, tr), pack:PK })}
    <span style="position:absolute;top:10px;left:10px;font-family:${MONO};font-size:9.5px;letter-spacing:.06em;color:${t.dark ? '#171511' : '#FBF9F5'};background:${t.dark ? 'rgba(237,231,218,.92)' : 'rgba(35,32,25,.82)'};border-radius:4px;padding:3px 6px">GIF</span></div>`;
  return figure(t, w, tr, { width, m, mw, media, cap:c.cap, credit:c.credit });
}
function audioCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.audio;
  const g = groundFor(t, tr, 'copy');
  const m = o.m || AM(w);
  const thumb = o.thumb === false ? '' : K.plate(t, { w:64, h:64, cap:'', r:Math.max(rad(t, tr) - 4, 0), pack:PK });
  const bar = `<div style="display:flex;align-items:center;gap:12px;width:100%">
    <span style="font-family:${MONO};font-size:11.5px;color:${g.muted};flex-shrink:0">${c.time}</span>
    <span style="position:relative;flex:1;height:4px;border-radius:4px;background:${g.border}"><span style="position:absolute;left:0;top:0;bottom:0;width:22%;border-radius:4px;background:${g.name === 'contrast' ? g.text : t.accent}"></span></span>
    <span style="font-family:${MONO};font-size:11.5px;color:${g.muted};flex-shrink:0">${c.dur}</span>
    <span style="font-family:${MONO};font-size:11px;color:${g.muted};flex-shrink:0">1×</span></div>`;
  const inner = `<div style="display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;align-items:center;gap:16px">${thumb}
      <div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0">
        <span style="font-size:16px;font-weight:600;line-height:1.35;color:${g.text};font-family:${PK.body};text-wrap:pretty">${c.title}</span>
        <span style="font-size:13.5px;color:${g.muted};font-family:${PK.body}">${c.sub}</span></div>
      <span style="width:44px;height:44px;border-radius:44px;background:${g.name === 'contrast' ? g.text : t.accent};color:${g.name === 'contrast' ? g.bg : t.onAccent};display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">▶</span></div>${bar}
    <span style="font-family:${MONO};font-size:10px;color:${g.muted}">GHOST SHIPS THE PLAYER AND ITS SCRIPT ⚑ · A33 STYLES THE SHELL, THE THUMBNAIL AND THE PROGRESS ACCENT</span></div>`;
  return shell(t, w, tr, { inner, m, pw:o.pw, rulePad:20 });
}
function videoCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.video;
  const width = o.width || 'regular';
  const m = o.m || AM(w);
  const mw = o.mw || tr.mediaW(w, width, m);
  const bleed = tr.bleedAt && width === tr.bleedAt;
  const h = capH(Math.round((bleed ? (o.vw || w) : mw) * c.ratio));
  const media = `<div style="position:relative;width:${bleed ? '100%' : mw + 'px'};max-width:100%">${
    K.plate(t, { w:'100%', h, cap:c.plate, r:bleed ? 0 : rad(t, tr), pack:PK })}
    <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
      <span style="width:64px;height:64px;border-radius:64px;background:rgba(251,249,245,.92);display:flex;align-items:center;justify-content:center;font-size:21px;color:#232019">▶</span></span>
    <span style="position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:10px;height:34px;border-radius:${Math.min(rad(t, tr), 8)}px;background:rgba(28,26,22,.72);padding:0 12px;box-sizing:border-box">
      <span style="font-family:${MONO};font-size:11px;color:rgba(251,249,245,.9)">0:00</span>
      <span style="position:relative;flex:1;height:3px;border-radius:3px;background:rgba(251,249,245,.28)"><span style="position:absolute;left:0;top:0;bottom:0;width:12%;background:#FBF9F5;border-radius:3px"></span></span>
      <span style="font-family:${MONO};font-size:11px;color:rgba(251,249,245,.9)">${c.dur}</span></span></div>`;
  return figure(t, w, tr, { width, m, mw, media, cap:c.cap, credit:c.credit });
}
function signupCard(t, w, tr, o) {
  o = o || {}; const c = CARDS.signup;
  const g = tr.contain === 'band' ? K.ground(t, 'contrast', PK) : K.ground(t, 'surface', PK);
  const m = o.m || AM(w);
  const pw = o.pw || (tr.contain === 'band' || tr.contain === 'plane' ? tr.planeW(w) : (o.headerW || BOX(w)));
  const narrow = w === 390 || pw < 560;
  const form = `<div style="display:flex;flex-direction:column;gap:10px;width:${narrow ? '100%' : '360px'};max-width:100%">
    ${K.field(g, { state:'empty', pack:PK, label:false, ph:'you@example.com' })}
    ${K.btn(g, { label:c.btn, pack:PK, h:46, px:22, full:true, variant:tr.contain === 'band' ? 'carried' : 'primary' })}
    <span style="font-size:12.5px;color:${g.muted};font-family:${PK.body}">${c.legal}</span></div>`;
  const copy = `<div style="display:flex;flex-direction:column;gap:12px;flex:1;min-width:0">
    <span style="font-family:${PK.head};font-size:${w === 390 ? 24 : 30}px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:${g.text};text-wrap:pretty">${c.head}</span>
    <span style="font-size:${w === 390 ? 15 : 16.5}px;line-height:1.6;color:${g.muted};font-family:${PK.body};text-wrap:pretty">${c.sub}</span></div>`;
  return `<div style="width:${pw}px;max-width:100%;background:${g.bg};border-radius:${rad(t, tr)}px;padding:${w === 390 ? 24 : 36}px;box-sizing:border-box;display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;${narrow ? 'flex-direction:column;' : ''}align-items:${narrow ? 'stretch' : 'center'};gap:${narrow ? 20 : 40}px">${copy}${form}</div>
    <span style="font-family:${MONO};font-size:10px;color:${g.muted}">THE AUTHOR’S COLOURS ARRIVE AS INLINE STYLES ⚑ — C.1 · A33 OFFERS SHAPE AND SPACING, NEVER COLOUR · MEMBER LABEL: ${c.label}</span></div>`;
}

const RENDER = { image:imageCard, gallery:galleryCard, markdown:markdownCard, html:htmlCard,
  divider:dividerCard, email:emailCard, cta:ctaCard, preview:previewCard, gif:gifCard,
  audio:audioCard, video:videoCard, signup:signupCard, bookmark:bookmarkCard, callout:calloutCard,
  toggle:toggleCard, button:buttonCard, embed:embedCard, product:productCard, file:fileCard, header:headerCard };
function card(kind, t, w, tr, o) { return RENDER[kind](t, w, tr, o); }

/* ── the roll · all twenty cards, two to a row, at a tile measure ─────── */
function cardOpts(kind, tr, m, pw) {
  const opt = { m, pw, mw:fitMW(tr, m) };
  if (kind === 'toggle') opt.open = true;
  if (kind === 'gallery') { opt.n = 3; opt.width = 'regular'; }
  if (kind === 'header' || kind === 'signup') { opt.headerW = m; opt.pw = pw; }
  if (kind === 'image' || kind === 'embed' || kind === 'video' || kind === 'gif') opt.width = 'regular';
  return opt;
}
function roll(t, w, tr, o) {
  o = o || {};
  const tw = 652, m = o.m || 560;
  const cell = (kind, i) => {
    const note = o.notes && o.notes[kind];
    return tile({ w:tw, bg:'#FFFFFF', border:'#EBE5DB', label:`${String(i + 1).padStart(2, '0')} · ${CARD_LABEL[kind]}`,
      body:`<div style="background:${t.bg};border-radius:8px;padding:18px;box-sizing:border-box;display:flex;justify-content:center">${
        card(kind, t, w, tr, cardOpts(kind, tr, m, tw - 36))}</div>
        <span style="font-family:${MONO};font-size:9.5px;line-height:1.5;color:#6E6A64">${OWNS_NOTE[OWNS[kind]]}${note ? ' · ' + note : ''}</span>` });
  };
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${ORDER.map(cell).join('')}</div>`;
}

/* ── the article scene · every card in the flow, at any width ─────────── */
const SCENE = ['image', 'callout', 'divider', 'bookmark', 'toggle', 'button', 'gallery', 'embed',
  'video', 'audio', 'gif', 'file', 'product', 'markdown', 'html', 'cta', 'signup', 'header', 'preview', 'email'];
function scene(t, w, tr, o) {
  o = o || {};
  const m = K.G(w).m;
  const g = K.ground(t, 'page', PK);
  const n = ORDER.length;
  const label = (kind, i) => `<div style="width:${AM(w)}px;max-width:100%;margin:0 auto"><span style="font-family:${MONO};font-size:9.5px;letter-spacing:.04em;color:${t.muted}">CARD ${String(ORDER.indexOf(kind) + 1).padStart(2, '0')} OF ${n} · ${CARD_LABEL[kind]}</span></div>`;
  const item = (kind, i) => {
    const opt = {};
    if (kind === 'gallery') opt.width = 'wide';
    if (kind === 'image') opt.width = o.imgWidth || 'regular';
    if (kind === 'video') opt.width = 'regular';
    return `<div style="display:flex;flex-direction:column;gap:8px;align-items:center;width:100%">${label(kind, i)}
      <div style="display:flex;justify-content:center;width:100%">${card(kind, t, w, tr, opt)}</div></div>`;
  };
  const stack = [`<div style="display:flex;justify-content:center;width:100%">${para(t, w, 0)}</div>`];
  SCENE.forEach((kind, i) => {
    stack.push(item(kind, i));
    if (i === 1) stack.push(`<div style="display:flex;justify-content:center;width:100%">${para(t, w, 1)}</div>`);
    if (i === 12) stack.push(`<div style="display:flex;justify-content:center;width:100%">${para(t, w, 2)}</div>`);
  });
  return `<div style="padding:0 ${m}px">${boundary(t, w, o.extra)}${o.noHead ? '' : postHead(t, w)}</div>
    <div style="height:${w === 390 ? 22 : 28}px"></div>
    <div style="display:flex;flex-direction:column;gap:${tr.space}px;align-items:center;padding:0 ${tr.bleedAt ? 0 : m}px">${stack.join('')}</div>
    <div style="height:${w === 390 ? 40 : 64}px"></div>`;
}
function frame(t, w, inner, o) {
  o = o || {};
  const sh = t.dark ? '0 12px 40px rgba(0,0,0,.34)' : '0 12px 40px rgba(28,27,26,.14)';
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:${sh};overflow:hidden;box-sizing:border-box;${o.style || ''}">${
    o.noBar ? '' : K.siteBar(t, w, PK, o)}${inner}${o.noFoot ? '' : K.neighbour(t, w, PK)}</div>`;
}

/* ── the widths frame · what regular, wide and full resolve to ─────────── */
const WLABEL = { regular:'REGULAR', wide:'WIDE', full:'FULL' };
function widths(t, w, tr, d) {
  const cell = kind => {
    const mw = tr.mediaW(w, kind, AM(w));
    const bleed = tr.bleedAt === kind;
    const lab = `${WLABEL[kind]} · AUTHORED IN GHOST · RESOLVES TO ${bleed ? 'THE VIEWPORT EDGE, ' + w : mw}${bleed ? '' : ' PX'}${d.widthNote && d.widthNote[kind] ? ' · ' + d.widthNote[kind] : ''}`;
    const inner = `<div style="padding:${bleed ? '26px 0' : '26px 0'};display:flex;justify-content:center">${
      imageCard(t, w, tr, { width:kind, vw:w, plateCap:`IMAGE CARD · ${WLABEL[kind]}` })}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px">
      <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${lab}</span>
      ${frame(t, w, `<div style="padding:0 ${K.G(w).m}px">${boundary(t, w)}</div>${inner}`, { noFoot:true })}</div>`;
  };
  return `<div style="display:flex;flex-direction:column;gap:20px">${['regular', 'wide', 'full'].map(cell).join('')}
    <span style="font-family:${MONO};font-size:10px;color:#6E6A64">DRAWN IMAGE HEIGHT IS CAPPED AT 520 ON THIS CANVAS SO THREE FRAMES FIT ⚑ · IN THE PAGE THE HEIGHT IS THE AUTHOR’S FILE AND NO TREATMENT CROPS IT · A19, CARRIED</span></div>`;
}

/* ── hover, focus and the states every design owes ─────────────────────── */
function states(t, w, tr, d) {
  const g = groundFor(t, tr, 'copy');
  const cell = (lab, inner) => `<div style="display:flex;flex-direction:column;gap:8px"><span style="font-family:${MONO};font-size:9.5px;color:#6E6A64">${lab}</span>${inner}</div>`;
  const bk = o => bookmarkCard(t, w, tr, Object.assign({ m:420, tw:104, pw:456 }, o));
  const ring = `<span style="display:inline-flex;border-radius:${rad(t, tr) + 2}px;box-shadow:0 0 0 4px ${t.bg},0 0 0 6px ${t.accent}">${bk({})}</span>`;
  const hoverCard = `<span style="display:inline-flex;filter:${t.dark ? 'brightness(1.08)' : 'brightness(.985)'}">${bk({})}</span>`;
  const first = tile({ w:652, bg:'#FFFFFF', border:'#EBE5DB', label:'BOOKMARK · THE WHOLE CARD IS ONE LINK · ONE FOCUS STOP ⚑',
    body:`<div style="background:${t.bg};border-radius:8px;padding:18px;display:flex;flex-direction:column;gap:20px">${
      cell('RESTING', bk({}))}${cell('HOVER · THE SURFACE STEPS TO THE HOVER TOKEN, NOTHING MOVES', hoverCard)}${
      cell('KEYBOARD FOCUS · A6’S 2 PX ACCENT RING AT A 4 PX OFFSET, CARRIED', ring)}</div>` });
  const btnRow = `<div style="display:flex;flex-wrap:wrap;gap:22px 30px;align-items:flex-end">${
    cell('BUTTON CARD · RESTING', K.btn(g, { label:CARDS.button.label, pack:PK, h:48, px:24, variant:tr.contain === 'band' ? 'carried' : 'primary' }))}${
    cell('HOVER · THE FILL AT 93 % BRIGHTNESS, DERIVED ⚑', `<span style="display:inline-flex;filter:brightness(.93)">${K.btn(g, { label:CARDS.button.label, pack:PK, h:48, px:24, variant:tr.contain === 'band' ? 'carried' : 'primary' })}</span>`)}${
    cell('FOCUS · THE SAME RING', `<span style="display:inline-flex;border-radius:${rad(t, tr)}px;box-shadow:0 0 0 4px ${g.bg === 'transparent' ? t.bg : g.bg},0 0 0 6px ${g.name === 'contrast' ? g.text : t.accent}">${K.btn(g, { label:CARDS.button.label, pack:PK, h:48, px:24, variant:tr.contain === 'band' ? 'carried' : 'primary' })}</span>`)}${
    cell('FILE · THE GLYPH IS THE ONLY HOVER', `<span style="display:inline-flex;filter:brightness(.97)">${fileCard(t, w, tr, { m:400, pw:436, desc:false })}</span>`)}</div>`;
  const second = tile({ w:652, bg:'#FFFFFF', border:'#EBE5DB', label:'BUTTON, FILE · 44 PX MINIMUM TARGET EVERYWHERE',
    body:`<div style="background:${t.bg};border-radius:8px;padding:18px">${btnRow}</div>` });
  const third = tile({ w:652, bg:'#FFFFFF', border:'#EBE5DB', label:'TOGGLE · CLOSED AND OPEN · GHOST EMITS A DIV, AN H4 AND A BUTTON — NOT DISCLOSURE MARKUP ⚑',
    body:`<div style="background:${t.bg};border-radius:8px;padding:18px;display:flex;flex-direction:column;gap:18px">${
      toggleCard(t, w, tr, { m:420, pw:456 })}${toggleCard(t, w, tr, { m:420, pw:456, open:true })}</div>` });
  const fourth = tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'WHAT DOES NOT CHANGE · THE FOUR STATES EVERY A33 DESIGN OWES',
    body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;min-height:150px">
      <span>${b('In the editor every card draws at its resting state')} ⚑ — the toggle closed, no hover, no ring. ${b('The treatment is CSS')}, so the edit-time picture and the published picture are the same.</span>
      <span>${b('With JavaScript off fourteen of the twenty cards are identical')} ⚑. ${b('The toggle cannot open')} — Ghost emits a plain container with an ${code('h4')} and a ${code('button')}, not disclosure markup, so its open and close are Ghost’s script. ${b('Six depend on scripts that are Ghost’s or the provider’s, not A33’s')} ⚑: the toggle’s open and close, the gallery’s row ratios, the audio and video players, the signup card’s post, and the embed’s provider markup. ${b('The registry has no module for any of them')} — a finding, not a design, and A33 declares ${code('core')} rather than inventing one.</span>
      <span>${b('The treatment never restyles what is inside an iframe')} ⚑. The embed card’s frame, radius and caption are A33’s; the provider’s markup is the provider’s.</span>
      <span>${b('No control in A33 styles one card of one post')} ⚑ — a value is written once, site-wide, and every card of that type reads it.</span></div>` });
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${first}${second}${third}${fourth}</div>`;
}

/* ── absent content · the empty states, per card ───────────────────────── */
function absent(t, w, tr, d) {
  const cellW = 440, m = 372;
  const one = (label, inner, note) => tile({ w:cellW, bg:'#FFFFFF', border:'#EBE5DB', pad:14, label,
    body:`<div style="background:${t.bg};border-radius:8px;padding:16px;box-sizing:border-box;display:flex;justify-content:center">${inner}</div>
      <span style="font-family:${MONO};font-size:9.5px;line-height:1.5;color:#6E6A64">${note}</span>` });
  const trNoCap = Object.assign({}, tr, { capMode:'hidden' });
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
    one('AN IMAGE WITH NO CAPTION · NO EMPTY SLOT ⚑', imageCard(t, w, trNoCap, { m, mw:fitMW(tr, m), plateCap:'IMAGE CARD · NO CAPTION' }),
      'NO <em>figcaption</em> IS EMITTED AND THE SPACE BELOW RETURNS TO THE CARD’S OWN SPACING VALUE')}${
    one('A BOOKMARK GHOST COULD NOT SCRAPE A THUMBNAIL FOR', bookmarkCard(t, w, tr, { m, pw:m + 36, thumb:false }),
      'THE TEXT TAKES THE FULL WIDTH · NEVER A GREY PLACEHOLDER BOX ⚑ — A19’S MISSING-IMAGE RULE, CARRIED')}${
    one('A GALLERY WITH ONE IMAGE', galleryCard(t, w, tr, { m, mw:fitMW(tr, m), n:1, width:'regular' }),
      'ONE IMAGE RENDERS AS ONE IMAGE AT THE CARD’S WIDTH · GHOST’S OWN BEHAVIOUR, NOT A ONE-ITEM ROW')}${
    one('A PRODUCT WITH NO IMAGE', productCard(t, w, tr, { m, pw:m + 36, image:false }),
      'TITLE, DESCRIPTION, RATING, BUTTON · THE CARD KEEPS ITS PADDING AND LOSES NOTHING ELSE')}${
    one('A CALLOUT WITH THE EMOJI TURNED OFF', calloutCard(t, w, Object.assign({}, tr, { emoji:'hidden' }), { m, pw:m + 36 }),
      'THE TEXT TAKES THE FULL PADDING · THE GLYPH IS DECORATIVE AND CARRIES <em>aria-hidden</em> WHEN SHOWN ⚑')}${
    one('THE UGLY TEST · A 168-CHARACTER CALLOUT', calloutCard(t, w, tr, { m, pw:m + 36,
      text:'The 12 August catalogue revised the July figures down by four per cent, which changes the second table in this piece and the sentence above it, and we have left both as they were published.' }),
      'THE PLANE GROWS DOWNWARD · NO CLAMP, NO ELLIPSIS, NO SCROLL INSIDE A CARD ⚑')}</div>`;
}

/* ── accessibility · the annotated frame every design owes ─────────────── */
function a11y(t, w, tr, d) {
  const rows = d.a11y || [];
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
    tile({ w:652, bg:'#FFFFFF', border:'#EBE5DB', label:'THE MARKUP A33 STYLES · GHOST’S, ANNOTATED',
      body:`<div style="display:flex;flex-direction:column;gap:0;font-size:12.5px;line-height:1.6;color:#3A3835">${
        [['image, gallery, embed', `${code('&lt;figure&gt;')} + ${code('&lt;figcaption&gt;')} — the caption is inside the figure, so it is read with the image, not after it`],
         ['bookmark', `one ${code('&lt;a&gt;')} around the whole card · one focus stop · the thumbnail is ${code('aria-hidden')} and the title is the accessible name`],
         ['callout', `a ${code('&lt;div&gt;')} with no role · ${b('the emoji carries aria-hidden')} ⚑ so it is not announced as “pushpin”`],
         ['toggle', `a plain ${code('&lt;div&gt;')} holding an ${code('h4')} and a ${code('button')} — ${b('not disclosure markup')} ⚑; the heading level is Ghost’s, the button is the only focus stop, and ${b('no stylesheet can add the aria-expanded it lacks')} — a Ghost limitation`],
         ['button', `an ${code('&lt;a&gt;')} styled as a button · 48 px tall, 44 px minimum target at every width`],
         ['product', `${b('Ghost renders the rating as stars with no text equivalent and a theme cannot add one')} ⚑ — a Ghost limitation, recorded rather than fixed: a screen-reader user hears no rating at all`],
         ['file', `the link names the file and its size: “Download catalogue-2026-08.csv, 1.4 MB” ⚑`],
         ['header', `${b('the heading is an h2')} ⚑ — Ghost emits ${code('h2')}/${code('h3')} and A33 never promotes one to ${code('h1')}; the post title is the page’s only ${code('h1')}`]].map(([k, v], i) =>
          `<div style="display:flex;gap:14px;padding:9px 0;${i ? 'border-top:1px solid #F1EDE6' : ''}"><span style="width:150px;flex-shrink:0;font-family:${MONO};font-size:10.5px;color:#6E6A64;padding-top:2px">${k.toUpperCase()}</span><span style="flex:1">${v}</span></div>`).join('')}</div>` })}${
    tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'THIS DESIGN’S OWN ACCESSIBILITY NOTES',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;min-height:150px">${rows.map(r => `<span>${r}</span>`).join('')}</div>` })}</div>`;
}

/* ── each card's own design panel · the global-design point, drawn ────── */
const PANEL_ROWS = {
  image: [['Corners', ['From the pack'], 0, 'Read-only ⚑ — the treatment owns it.'], ['Border or shadow', ['None', 'Hairline', 'Shadow'], 0], ['Caption alignment', ['Left', 'Centred'], 0], ['Space above and below', ['From the treatment'], 0, 'Read-only ⚑ — Space around cards, site-wide.']],
  callout: [['Emoji', ['Shown', 'Hidden'], 0, 'The treatment’s value, shown here so the user sees where it came from.'], ['Emoji size', ['Small', 'Regular'], 1], ['Text scale', ['Body', 'One step up'], 0], ['Palette variants', ['All nine styled'], 0, 'Read-only ⚑ — Ghost’s nine colours, mapped by Callout colours.']],
  bookmark: [['Thumbnail', ['Right', 'Left', 'Hidden'], 0], ['Thumbnail size', ['Small', 'Regular', 'Large'], 1], ['Metadata rows', ['Publisher', 'Publisher and author', 'All'], 1], ['Description', ['One line', 'Two lines', 'Full'], 1]],
  signup: [['Layout', ['Stacked', 'Side by side', 'Split image'], 1], ['Field and button', ['Same height', 'Field taller'], 0], ['Form spacing', ['Compact', 'Comfortable', 'Spacious'], 1], ['Colour', ['The author’s, inline'], 0, 'Read-only ⚑ — C.1: inline styles win, so the panel offers shape and spacing only.']]
};
function cardPanels(t, w, tr, o) {
  o = o || {};
  const kinds = o.kinds || ['image', 'callout', 'bookmark', 'signup'];
  const one = kind => {
    const rows = PANEL_ROWS[kind].map(([lab, vals, act, help]) => K.seg(lab, vals, act, help));
    const side = `<div style="width:290px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:13px;box-sizing:border-box;flex-shrink:0">
      <div style="display:flex;flex-direction:column;gap:6px;border-bottom:1px solid ${PC.line};padding-bottom:12px">
        <span style="font-family:${MONO};font-size:9.5px;letter-spacing:.05em;color:${PC.mute}">CARDS › ${kind.toUpperCase()}</span>
        <span style="font-size:13px;font-weight:600">${CARD_LABEL[kind].split(' · ')[0].replace(/\b\w/g, c => c)}</span>
        <span style="font-size:11px;color:${PC.mute};line-height:1.5">Selected on the canvas. ${b('These values are the site’s')} — every ${kind} card in every post and page reads them ⚑.</span></div>
      ${rows.join('')}
      <div style="border-top:1px solid ${PC.line};padding-top:11px;display:flex;flex-direction:column;gap:6px">
        <span style="font-size:11.5px;font-weight:600">Applies everywhere</span>
        <span style="font-size:11px;color:${PC.mute};line-height:1.5">Saving writes one value onto the site. ${b('There is no per-post and no per-card override')} ⚑, by construction.</span></div></div>`;
    const canvas = `<div style="flex:1;min-width:0;background:${t.bg};border-radius:8px;padding:18px;box-sizing:border-box;display:flex;justify-content:center;position:relative">
      <span style="position:absolute;inset:10px;border:1.5px solid ${t.accent};border-radius:8px;pointer-events:none"></span>
      ${card(kind, t, w, tr, cardOpts(kind, tr, 400, 456))}</div>`;
    return tile({ w:1288, bg:'#FFFFFF', border:'#E7E2DB',
      label:`${CARD_LABEL[kind]} · SELECTED ON THE CANVAS, ITS OWN PANEL OPEN`,
      body:`<div style="display:flex;gap:18px;align-items:stretch">${canvas}${side}</div>` });
  };
  return `<div style="display:flex;flex-direction:column;gap:20px">${kinds.map(one).join('')}</div>`;
}

/* ── control panel · A33's picker and the Ghost-owns group ─────────────── */
const PC = K.PC;
function designPicker(name, n, sub) {
  return `<div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid ${PC.line};padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:${PC.mute}">Treatment</span>
      <div style="height:38px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${name}</span><span style="font-size:10px;color:${PC.dim}">${n} / 6 ▾</span></div>
      <span style="font-size:11px;color:${PC.mute};line-height:1.5">${sub}</span>
    </div>`;
}
function sourceGroup(o) {
  o = o || {};
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">WHAT GHOST OWNS · IDENTICAL IN ALL SIX · NOT COUNTED</span>
    ${K.sel('Which cards appear', 'Whatever the author inserted', `Read-only. ${b('The author writes the post')} ⚑ — a treatment styles every card Ghost renders and cannot add, remove or reorder one. ${b('A33 has no item list')}.`, true)}
    ${K.sel('Card widths', 'The author’s, per card', `Read-only. ${b('Regular, wide and full are authored in Ghost, one card at a time')} ⚑ — ${b('the treatment decides what each of the three resolves to')}, which is the whole of designs 4 and 5.`, true)}
    ${K.sel('Callout colours', o.callout || 'Pack tokens', `Pack tokens · Ghost’s palette. ${b('Ghost ships nine literal background colours')} and the pack ships seven roles ⚑. ${b('At Pack tokens the nine collapse onto the pack’s planes')} and author intent is lost; at Ghost’s palette the literal colours render and the pack’s harmony is. A finding, and the user’s choice.`)}
    ${K.sel('Bookmark metadata', 'Scraped by Ghost', `Read-only. ${b('Title, description, icon, author, publisher and thumbnail are all scraped from the URL')} ⚑ — C.1’s matrix. A treatment chooses which rows show, never what they say.`, true)}
    ${K.sel('Gallery rows', 'Ghost’s own script', `Read-only. ${b('Ghost’s card script computes each row’s ratios')} ⚑ and no registry module covers it. ${b('With JavaScript off the images render at equal widths')} — a finding for the architect, not a degradation A33 can quote.`, true)}
    ${K.sel('Corners', 'From the pack’s radius token', `Read-only in every treatment ⚑. ${b('C.1’s matrix lists corners as a per-card setting; A33 answers that the pack’s radius token is that value')} and offers no other — a card that mixed radii would fail §3·1 in eleven of twelve packs.`, true)}
  </div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this treatment</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.count} CONTROLS + WHAT GHOST OWNS</span></div>`;
  const perCard = `<div style="background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px">
      <span style="font-size:12px;font-weight:600">Per-card panels are still there</span>
      <span style="font-size:11.5px;color:${PC.mute};line-height:1.5">${o.perCard || 'The treatment sets the plane, the spacing and the captions for every card at once. Thumbnail side, chevron side and the rest stay in each card’s own panel — C.1, unchanged.'}</span>
      <span style="font-size:12px;font-weight:600;color:#C2381F">Open Cards →</span></div>`;
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${perCard}${sourceGroup(o.source)}${foot}</div>`;
  const settles = `<div style="width:948px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">WHAT THIS PANEL SETTLES</span>${o.settles.map(s => `<span>${s}</span>`).join('')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${side}${settles}</div>`;
}

/* the three quick controls every treatment carries, in this order */
function quickRows(d) {
  const q = d.quick || {};
  return [
    K.seg('Space around cards', q.spaceVals || ['Compact 32', 'Comfortable 48', 'Spacious 64'], q.space === undefined ? 1 : q.space,
      q.spaceHelp || `Above and below every card, at the measure. ${b('32 at 390 whatever this says')} ⚑ — the ladder A17 set.`),
    K.seg('Captions', ['Under, left', 'Under, centred', 'Hidden'], q.cap === undefined ? 0 : q.cap,
      q.capHelp || `13.5 px in ${code('text-muted')}. ${b('Hidden hides the caption and keeps the alt text')} ⚑ — alt is Ghost’s and no treatment touches it.`),
    K.seg('Credit line', ['With the caption', 'Its own line', 'Hidden'], q.credit === undefined ? 1 : q.credit,
      `${b('Ghost has no credit field')} ⚑ — the credit is the caption’s trailing ${code('&lt;em&gt;')} run, and this control decides whether it sits inline or drops to a second line at 13 px.`)
  ];
}

/* ── registry degradations, quoted verbatim — never composed ──────────── */
const MOD = {
  core: 'Never runs; the <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">.js-enabled</code> class is never set, so all JS-conditional CSS stays in its no-JS branch.',
  accordion: 'The registry’s quoted degradation does not hold inside a Koenig post ⚑ — Ghost’s toggle card is a plain container with a heading and a button, not disclosure markup, so <b>with JavaScript off it cannot open</b>. A33 declares <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">accordion</code> as the nearest module and drops the quote.',
  lightbox: 'Each thumbnail is an <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;a href&gt;</code> to the full-size image; clicking opens it as a normal page.',
  'video-facade': 'The poster is an <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;a href&gt;</code> to the video’s canonical URL (YouTube/Vimeo watch page).'
};

/* ── canvas scaffolding ───────────────────────────────────────────────── */
const cap = K.cap, note = K.note, section = K.section, intro = K.intro, wrapIf = K.wrapIf;

return { ...K, PK, hb, AM, BOX, WIDE, ARTICLE, CARDS, CARD_LABEL, ORDER, OWNS, OWNS_NOTE, SCENE,
  boundary, postHead, para,
  groundFor, rad, fitMW, capH, shell, caption, figure, imageCard, galleryCard, embedCard, bookmarkCard,
  calloutCard, toggleCard, buttonCard, productCard, fileCard, headerCard, markdownCard, htmlCard,
  dividerCard, emailCard, ctaCard, previewCard, gifCard, audioCard, videoCard, signupCard,
  RENDER, card, cardOpts, roll, scene, frame, widths, cardPanels, caption, figure, imageCard, galleryCard, embedCard, bookmarkCard, calloutCard,
  toggleCard, buttonCard, productCard, fileCard, headerCard, RENDER, card, roll, scene, frame, widths,
  states, absent, a11y, designPicker, sourceGroup, panel, quickRows, MOD, cap, note, section, intro, wrapIf, setPack, PACKS };
})();
