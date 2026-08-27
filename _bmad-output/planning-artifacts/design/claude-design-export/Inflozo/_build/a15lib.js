// A15 Video and Embeds — shared frame builders. Extends A14LIB (Paper tokens, panel furniture).
globalThis.A15LIB = (function () {
const K = globalThis.A14LIB;
const { L, D, PACKS, MONO, G, ground, padTop, padBot, gap, eyebrow, heading, blurb, headBlock,
  plate, two, tile, textTile, tableCard, seg, sel, txt, repeater, designPicker, specCards, specRow,
  cap, note, code, b, sub, section, intro, wrapIf, DOC_HEAD, DOC_TAIL, PC } = K;

/* ── fixtures · Orbit Weekly on film ──────────────────────────────────── */
const VID = {
  eyebrow: 'Watch',
  heading: 'The river, on film',
  blurb: 'Eleven months on both banks of the Tagus, filmed at the two hours a day when the estuary is worked.',
  credit: 'Filmed by Marta Sequeira · sound by Hugo Marques',
  transcript: 'Transcript'
};
const VIDEOS = [
  { n:1, title:'Two hours before the tide', dur:'12:40', prov:'YouTube',
    blurb:'The morning shift at Cais do Sodré, filmed over eleven days in April.' },
  { n:2, title:'Ana Reis has run the ferry for forty years', dur:'08:15', prov:'Vimeo',
    blurb:'The harbourmaster on what the river asks of a crew before six in the morning.' },
  { n:3, title:'How a tide gauge works', dur:'04:52', prov:'YouTube',
    blurb:'Two readings a day since 1911, and the man who takes them.' },
  { n:4, title:'Night crossing to Trafaria', dur:'15:08', prov:'Uploaded file',
    blurb:'The 23:40 out of Belém, in one take from the wheelhouse.' },
  { n:5, title:'The salt pans, from the air', dur:'06:30', prov:'Vimeo',
    blurb:'Alcochete drained for the season, shot at 400 feet.' },
  { n:6, title:'A net, mended twice', dur:'09:44', prov:'YouTube',
    blurb:'Hugo Marques repairs a net he repaired in 2019, and explains why.' },
  { n:7, title:'The flamingo count at Ponta da Erva', dur:'11:16', prov:'YouTube',
    blurb:'Four volunteers, one telescope and a number that has to be agreed.' },
  { n:8, title:'The last sardine boat leaves Seixal', dur:'18:02', prov:'Vimeo',
    blurb:'The Nova Esperança, her final morning under her own crew.' }
];
const take = n => VIDEOS.slice(0, n);
const CHAPTERS = [
  { t:'00:00', label:'The first ferry of the day' },
  { t:'02:14', label:'Loading the crates at Cais do Sodré' },
  { t:'05:03', label:'Ana Reis on the bridge' },
  { t:'07:41', label:'The turn at Cacilhas' },
  { t:'09:58', label:'Back before the tide' }
];
const LONG_TITLE = 'Ana Reis, harbourmaster at Cais do Sodré since 1986, on the two hours a day the estuary is actually worked';

/* ── chrome · A15’s own site bar and neighbour ────────────────────────── */
function siteBar(t, w, p) {
  p = p || PACKS.paper; const g = G(w);
  const nav = w === 390
    ? `<span style="font-size:18px;color:${t.text}">☰</span>`
    : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${p.body}"><span>Reporting</span><span>Interviews</span><span style="color:${t.text};font-weight:600">Film</span><span>Writers</span></div>`;
  return `<div style="height:${g.bar}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${t.border};padding:0 ${g.m}px">
      <div style="display:flex;align-items:center;gap:10px"><span style="width:24px;height:24px;border-radius:${Math.min(p.r,7)}px;background:${t.accent}"></span><span style="font-family:${p.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>${nav}</div>`;
}
function neighbour(t, w, p) {
  p = p || PACKS.paper; const g = G(w);
  return `<div style="padding:0 ${g.m}px 28px"><div style="height:22px;display:flex;align-items:flex-end"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">A25·1 ARTICLE BODY CONTINUES BELOW · NOT THIS SECTION · DRAWN AT LOW OPACITY</span></div>
    <div style="opacity:.4;padding-top:14px;border-top:1px solid ${t.border};margin-top:10px;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:${t.muted};font-family:${p.body}"><span>The films were made on both banks between September and July.</span><span>Continue reading →</span></div></div>`;
}
function frame(t, w, inner, o) {
  o = o || {}; const p = o.pack || PACKS.paper;
  const sh = t.dark ? '0 12px 40px rgba(0,0,0,.34)' : '0 12px 40px rgba(28,27,26,.14)';
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:${sh};overflow:hidden;box-sizing:border-box">${o.noBar ? '' : siteBar(t, w, p)}${inner}${o.noFoot ? '' : neighbour(t, w, p)}</div>`;
}
function padTop15(t, w, nt) {
  const g = G(w);
  return `<div style="height:${g.pad}px;display:flex;align-items:flex-end;padding-bottom:4px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${g.pad} · A15’S OWN TOP PADDING${nt ? ' · ' + nt : ' · A15 SITS INSIDE A PAGE OR AN ARTICLE ⚑'}</span></div>`;
}

/* ── the reserved box · settlement 2 ──────────────────────────────────── */
const AR = { '16:9':[16,9], '4:3':[4,3], '1:1':[1,1], '9:16':[9,16] };
const hFor = (w, a) => Math.round(w * (AR[a] || AR['16:9'])[1] / (AR[a] || AR['16:9'])[0]);

/* ── the play target · never the accent over an unknown frame ⚑ ───────── */
function playBtn(t, o) {
  o = o || {};
  const s = o.size || 64;
  const ring = o.focus ? `outline:4px solid ${t.accent};outline-offset:3px;` : '';
  return `<span style="width:${s}px;height:${s}px;border-radius:99px;background:${o.solid || 'rgba(251,249,245,.92)'};border:1px solid rgba(35,32,25,.14);${ring}display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;box-shadow:0 1px 2px rgba(28,27,26,.06)"><span style="font-size:${Math.round(s * 0.3)}px;color:#232019;line-height:1;margin-left:${Math.round(s * 0.05)}px">▶</span></span>`;
}
const durPill = (txt2, o) => `<span style="position:absolute;${(o && o.pos) || 'right:12px;bottom:12px'};background:rgba(35,32,25,.76);color:#FBF9F5;font-size:${(o && o.size) || 13}px;font-family:'Inter',sans-serif;line-height:1;padding:6px 8px;border-radius:6px">${txt2}</span>`;

/* ── the frame · A15’s one unit, in five states ───────────────────────── */
function vframe(t, g, item, o) {
  o = o || {};
  const w = o.w, a = o.aspect || '16:9';
  const h = o.h || hFor(w, a);
  const mode = o.mode || 'poster';
  const r = o.r === undefined ? g.r : o.r;
  const wide = w >= 260;
  const ps = o.playSize || (w >= 700 ? 64 : w >= 340 ? 56 : 44);
  const label = mode === 'loaded'
    ? `${item.prov.toUpperCase()} IFRAME · SAME BOX · ${a} · NOTHING MOVED ⚑`
    : mode === 'plate' ? `${two(item.n)} · NO POSTER UPLOADED · ${a} BOX HELD ⚑`
    : `${two(item.n)} · POSTER · ${a}`;
  let body = '';
  if (mode === 'loaded') {
    body = `<span style="position:absolute;inset:0;background:#0E0D0B;border-radius:${r}px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">
      <span style="font-family:${MONO};font-size:${wide ? 11 : 9}px;color:rgba(251,249,245,.6);text-align:center;padding:0 10px">${label}</span>
      ${wide ? `<span style="width:${Math.min(w - 40, 300)}px;height:4px;border-radius:99px;background:rgba(251,249,245,.24);position:relative"><span style="position:absolute;left:0;top:0;bottom:0;width:34%;background:#FBF9F5;border-radius:99px"></span></span>` : ''}</span>`;
  } else if (mode === 'consent') {
    body = `<span style="position:absolute;inset:0;background:rgba(35,32,25,.62);border-radius:${r}px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:16px;box-sizing:border-box;text-align:center">
      <span style="font-size:${wide ? 14 : 12}px;line-height:1.5;color:#FBF9F5;font-family:${g.pack.body};max-width:${Math.min(w - 48, 380)}px">Loads from ${item.prov}. Playing this film sets cookies in your browser.</span>
      <span style="display:inline-flex;align-items:center;height:40px;padding:0 16px;border-radius:${Math.min(r, 8)}px;background:#FBF9F5;color:#232019;font-size:14px;font-weight:600;font-family:${g.pack.body}">Load and play</span></span>`;
  } else {
    const centre = o.play === 'corner'
      ? `<span style="position:absolute;left:12px;bottom:12px">${playBtn(t, { size:Math.min(ps, 48), focus:o.focus })}</span>`
      : o.play === 'none' ? '' : `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${playBtn(t, { size:ps, focus:o.focus })}</span>`;
    const plateNote = mode === 'plate'
      ? `<span style="position:absolute;left:0;right:0;bottom:${Math.max(10, Math.round(h * 0.12))}px;text-align:center;font-size:${wide ? 13 : 11}px;color:${g.muted};font-family:${g.pack.body};padding:0 14px;box-sizing:border-box">${item.prov} · ${item.title}</span>`
      : '';
    body = `${centre}${plateNote}${o.dur === false || !wide ? '' : durPill(item.dur, { size:w >= 420 ? 13 : 12 })}${o.over || ''}`;
  }
  const bg = mode === 'loaded' ? '#0E0D0B' : (o.stripe || g.stripe);
  return `<span style="display:block;position:relative;width:${o.fill ? '100%' : w + 'px'};height:${h}px;border-radius:${r}px;background:${bg};overflow:hidden;box-sizing:border-box">
    ${mode === 'loaded' ? '' : `<span style="position:absolute;top:9px;left:11px;font-family:${MONO};font-size:10px;color:${mode === 'consent' ? 'rgba(251,249,245,.7)' : g.muted}">${label}</span>`}${body}</span>`;
}

/* ── the meta row · duration · provider · transcript ──────────────────── */
function metaRow(g, item, o) {
  o = o || {};
  const bits = [];
  if (o.dur !== false) bits.push(item.dur);
  if (o.prov) bits.push(item.prov);
  if (o.transcript !== false) bits.push(`<span style="text-decoration:underline;text-underline-offset:3px">${VID.transcript} ↗</span>`);
  if (!bits.length) return '';
  return `<span style="display:flex;align-items:center;gap:8px;font-size:${o.size || 13}px;color:${o.col || g.muted};font-family:${g.pack.body}">${bits.join('<span style="opacity:.5">·</span>')}</span>`;
}
const titleEl = (g, item, o) => `<span style="font-family:${(o && o.head) ? g.pack.head : g.pack.body};font-size:${(o && o.size) || 17}px;font-weight:${(o && o.head) ? 700 : 600};line-height:1.3;letter-spacing:${(o && o.head) ? '-0.02em' : '0'};color:${(o && o.col) || g.text};${(o && o.max) ? `max-width:${o.max}px;` : ''}text-wrap:pretty">${(o && o.text) || item.title}</span>`;
const captionEl = (g, txt2, o) => `<span style="font-size:${(o && o.size) || 14}px;line-height:1.5;color:${(o && o.col) || g.muted};font-family:${g.pack.body};${(o && o.max) ? `max-width:${o.max}px;` : ''}text-wrap:pretty">${txt2}</span>`;
const creditEl = (g, o) => (o && o.credit === false) ? '' : `<span style="font-size:13px;color:${g.muted};font-family:${g.pack.body}">${(o && o.text) || VID.credit}</span>`;

/* ── the video card · poster, title, meta — the grid unit ─────────────── */
function vcard(t, g, item, o) {
  o = o || {};
  return `<figure style="margin:0;${o.fill ? 'flex:1;min-width:0;' : `width:${o.w}px;`}display:flex;flex-direction:column;gap:${o.gap || 12}px">
    ${vframe(t, g, item, { ...o, w:o.w })}
    <div style="display:flex;flex-direction:column;gap:${o.textGap || 6}px">${titleEl(g, item, { size:o.titleSize || 17, max:o.w })}${o.blurb ? captionEl(g, item.blurb, { max:o.w, size:o.blurbSize || 14 }) : ''}${o.meta === false ? '' : metaRow(g, item, { prov:o.prov, transcript:o.transcript, size:13 })}</div></figure>`;
}

/* ── the queue row · playlist and slim bar ────────────────────────────── */
function queueRow(t, g, item, o) {
  o = o || {};
  const tw = o.thumbW || 96, th = Math.round(tw * 9 / 16);
  return `<div style="display:flex;align-items:center;gap:12px;padding:${o.pad || 10}px;border-radius:${Math.min(g.r, 8)}px;background:${o.active ? g.plane : 'transparent'};${o.rule ? `border-bottom:1px solid ${g.border};border-radius:0;` : ''}box-sizing:border-box">
    <span style="position:relative;width:${tw}px;height:${th}px;border-radius:${Math.min(g.r, 6)}px;background:${g.stripe};flex-shrink:0;display:block">${o.active ? `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${playBtn(t, { size:28 })}</span>` : ''}</span>
    <span style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1">
      <span style="font-size:${o.titleSize || 15}px;font-weight:${o.active ? 600 : 500};line-height:1.35;color:${g.text};font-family:${g.pack.body};overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${item.title}</span>
      <span style="font-size:13px;color:${g.muted};font-family:${g.pack.body}">${o.active ? 'Now playing · ' : ''}${item.dur}</span></span>
    ${o.tail || ''}</div>`;
}

/* ── the chapter row · a timecode and a line ──────────────────────────── */
function chapterRow(g, ch, o) {
  o = o || {};
  return `<div style="display:flex;align-items:baseline;gap:16px;padding:${o.pad || 11}px 0;border-bottom:1px solid ${g.border};box-sizing:border-box">
    <span style="font-family:${MONO};font-size:13px;color:${o.active ? g.text : g.muted};width:52px;flex-shrink:0;${o.active ? 'font-weight:500;' : ''}">${ch.t}</span>
    <span style="font-size:${o.size || 15}px;line-height:1.45;color:${o.active ? g.text : g.muted};font-family:${g.pack.body};flex:1;text-wrap:pretty">${ch.label}</span>
    ${o.tail === false ? '' : `<span style="font-size:13px;color:${g.muted};font-family:${g.pack.body}">${o.right || ''}</span>`}</div>`;
}

/* ── the tab strip · A5·12’s tabs, carried ────────────────────────────── */
function tabsStrip(g, items, active, o) {
  o = o || {};
  return `<div style="display:flex;gap:${o.gap || 24}px;border-bottom:1px solid ${g.border};overflow:hidden">${
    items.map((it, i) => `<span style="display:flex;flex-direction:column;gap:9px;padding-bottom:0;flex-shrink:0">
      <span style="font-size:${o.size || 15}px;font-weight:${i === active ? 600 : 500};color:${i === active ? g.text : g.muted};font-family:${g.pack.body};padding-bottom:11px;border-bottom:2px solid ${i === active ? g.t.accent : 'transparent'};white-space:nowrap">${it.title.length > (o.clip || 28) ? it.title.slice(0, o.clip || 28) + '…' : it.title}</span></span>`).join('')}</div>`;
}

/* ── the theatre · A15’s own dialog, opened by A4·10 too ──────────────── */
function theatreEl(t, o) {
  o = o || {};
  const w = o.w || 604, h = o.h || 392;
  const iw = Math.min(w - 96, 460), ih = Math.round(iw * 9 / 16);
  return `<div style="width:${w}px;height:${h}px;border-radius:8px;overflow:hidden;position:relative;background:${t.bg};box-sizing:border-box">
    <div style="opacity:.28;pointer-events:none">${o.behind || ''}</div>
    <div style="position:absolute;inset:0;background:rgba(23,21,17,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;box-sizing:border-box">
      <div style="position:absolute;top:14px;left:18px;font-family:${MONO};font-size:11px;color:rgba(251,249,245,.72)">${o.counter || '01 / 06'}</div>
      <div style="position:absolute;top:10px;right:14px;width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#FBF9F5;border:1px solid rgba(251,249,245,.28);box-sizing:border-box">✕</div>
      <span style="width:${iw}px;height:${ih}px;border-radius:8px;background:#0E0D0B;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px"><span style="font-family:${MONO};font-size:10px;color:rgba(251,249,245,.6);text-align:center;padding:0 12px">${o.label || 'YOUTUBE IFRAME · 16:9 · THE PROVIDER’S OWN CONTROLS ⚑'}</span><span style="width:${Math.round(iw * 0.6)}px;height:4px;border-radius:99px;background:rgba(251,249,245,.24)"></span></span>
      <span style="display:flex;flex-direction:column;gap:6px;align-items:center;max-width:${iw}px">
        <span style="font-size:14px;line-height:1.5;color:#FBF9F5;font-family:'Inter',sans-serif;text-align:center">${o.cap || VIDEOS[0].title}</span>
        <span style="font-size:13px;color:rgba(251,249,245,.72);font-family:'Inter',sans-serif">${o.meta || '12:40 · YouTube · Transcript ↗'}</span></span>
    </div></div>`;
}

/* ── the videos block · the item list, identical in all fifteen ───────── */
function videosGroup(o) {
  o = o || {};
  const shown = o.items || ['01 · Two hours before the tide', '02 · Ana Reis has run the ferry…', '03 · How a tide gauge works', '04 · Night crossing to Trafaria'];
  const single = o.single;
  const help = single
    ? `${b('This design draws one film')}, the first in the list. ${b('Films 2–6 are kept, not deleted')} ⚑ — switching to 7 Grid draws all of them again. Add appends to the end; Remove is undoable; ${b('drag reorders, and row 1 is the film this design plays')} ⚑.`
    : `${b('Add opens one paste field')} — a provider URL or an uploaded file ⚑ — and the new film lands ${b('last')}, carrying its URL as its title until the author types one ⚑. Never a blank frame. Drag to reorder — ${b('authored order is drawn order in all fifteen designs')}. Remove is on the row and undoable. ${b('1–24')} ⚑; ${b('Add is disabled at 24')} with the reason shown.`;
  return `<div style="border-top:1px solid ${PC.line};padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">THE VIDEOS BLOCK · IDENTICAL IN ALL FIFTEEN DESIGNS · NOT COUNTED</span>
    ${repeater({ label:`Videos · ${o.count || 6}`, thumbs:true, items:shown, add:o.addOff ? '+ Add a video — 24 is the ceiling' : '+ Add a video', addOff:o.addOff, help })}
    <span style="font-size:11px;color:${PC.mute};line-height:1.5">${b('Selecting a frame on the canvas opens that film’s own fields and nothing else')} ⚑ — ${b('URL, title, description, poster, duration, transcript link')}. ${b('No layout, spacing, alignment or emphasis is editable inside an item')}: every design control writes one value onto the section, so “make film 3 bigger” is not expressible by construction ⚑.</span>
    ${o.extra || ''}</div>`;
}
function panel(o) {
  const foot = `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:${PC.mute}">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:${PC.mute}">${o.count}</span></div>`;
  const side = `<div style="width:320px;background:${PC.panel};border:1px solid ${PC.line};border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">${designPicker(o.name, o.n, o.sub)}${o.rows.join('\n')}${videosGroup(o.videos)}${foot}</div>`;
  const settles = `<div style="width:948px;background:${PC.white};border:1px solid ${PC.line};border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">WHAT THIS PANEL SETTLES</span>${o.settles.map(s => `<span>${s}</span>`).join('')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${side}${settles}</div>`;
}

return { L, D, PACKS, MONO, G, ground, gap, eyebrow, heading, blurb, headBlock, plate, two,
  tile, textTile, tableCard, seg, sel, txt, repeater, designPicker, specCards, specRow,
  cap, note, code, b, sub, section, intro, wrapIf, DOC_HEAD, DOC_TAIL, PC,
  VID, VIDEOS, CHAPTERS, LONG_TITLE, take, AR, hFor,
  siteBar, neighbour, frame, padTop:padTop15, padBot, playBtn, durPill, vframe, metaRow,
  titleEl, captionEl, creditEl, vcard, queueRow, chapterRow, tabsStrip, theatreEl, videosGroup, panel };
})();
