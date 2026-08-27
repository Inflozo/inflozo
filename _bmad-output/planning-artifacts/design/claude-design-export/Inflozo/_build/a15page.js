// A15 page assembler — turns a design descriptor into a full .dc.html canvas file.
globalThis.A15PAGE = (function () {
const K = globalThis.A15LIB;
const { L, D, MONO, PC, b, code } = K;

function stdWrap(t, w, inner, o) {
  o = o || {}; const g = K.G(w);
  return `<div style="padding:0 ${g.m}px">${K.padTop(t, w, o.padNote)}<div style="width:${g.box}px">${inner}</div>${K.padBot(t, w)}</div>`;
}
function bleedWrap(t, w, inner, label) {
  return `<div>${K.padTop(t, w, label || 'SIDE PADDING 0 AT EVERY WIDTH ⚑ · VERTICAL PADDING UNCHANGED')}${inner}${K.padBot(t, w)}</div>`;
}
function bandWrap(t, w, inner, label) {
  const g = K.G(w);
  return `<div><div style="padding:0 ${g.m}px"><div style="height:26px;display:flex;align-items:flex-end;padding-bottom:6px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${label || 'SECTION PADDING 0 AT EVERY WIDTH · THE BAND CARRIES IT ⚑'}</span></div></div>${inner}<div style="height:20px"></div></div>`;
}

const MODE_LABEL = {
  poster:  'RESTING · THE POSTER · NOTHING HAS BEEN REQUESTED FROM THE PROVIDER ⚑',
  loaded:  'PLAYING · THE PLAYER IN THE SAME RESERVED BOX · NOTHING MOVED ⚑',
  plate:   'NO POSTER UPLOADED · THE PLATE NAMES THE PROVIDER AND THE FILM ⚑',
  consent: 'THE NOTICE · DRAWN WHEN PRIVACY NOTICE IS ON, OVER THE POSTER ⚑'
};

/* the play target’s four states — one component, identical in all fifteen designs */
function playStates(t, d) {
  const g = K.ground(t, d.stateGround || 'page');
  const w = 176, item = K.VIDEOS[0];
  const cell = (label, inner, note) => `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px"><span style="font-family:${MONO};font-size:10px;color:${g.muted}">${label}</span>${inner}<span style="font-size:11px;line-height:1.45;color:${g.muted};font-family:${g.pack.body}">${note}</span></div>`;
  const fig = o => `<div style="${o.ring ? `outline:4px solid ${t.accent};outline-offset:3px;border-radius:${g.r + 2}px;` : ''}display:flex;flex-direction:column;gap:9px">
      <span style="display:block;${o.grow ? 'transform:scale(1.02);transform-origin:center;' : ''}">${K.vframe(t, g, item, { w, aspect:'16:9', playSize:o.grow ? 46 : 44, dur:false })}</span>
      <span style="font-size:13px;line-height:1.45;color:${o.under ? g.text : g.muted};font-family:${g.pack.body};${o.under ? 'text-decoration:underline;text-underline-offset:3px;' : ''}">${item.title}</span></div>`;
  return `<div style="background:${g.bg};border-radius:8px;padding:20px;display:flex;gap:26px;flex-wrap:wrap;box-sizing:border-box">
    ${cell('RESTING', fig({}), 'The play control is <b>surface-filled with a text glyph</b> ⚑, never the accent.')}
    ${cell('HOVER', fig({ grow:true, under:true }), 'The control grows <b>2%</b> and the title underlines, 160 ms ease-out. <b>The frame itself does not lift</b> ⚑.')}
    ${cell('FOCUS', fig({ ring:true, under:true }), 'A6’s <b>4 px accent ring</b> around the whole frame, 3 px outside it ⚑ — the frame is the target.')}
    ${cell('REDUCED MOTION', fig({ under:true }), '<b>The growth is dropped, the underline stays</b> ⚑. Nothing else in A15 moves.')}</div>`;
}

function statesFrame(t, d) {
  const box = d.miniBox || 604;
  const tiles = [];
  (d.modes || ['poster', 'loaded', 'plate', 'consent']).forEach(m => tiles.push(K.tile({
    w:d.tileW || 652, label:(d.modeLabels && d.modeLabels[m]) || MODE_LABEL[m] || m, bg:'#FBF9F5', border:'#EBE5DB',
    body:`<div style="min-height:${d.tileMin || 240}px;display:flex;align-items:flex-start;overflow:hidden">${d.mini(t, box, { mode:m })}</div>` })));
  (d.counts || []).forEach(c => tiles.push(K.tile({
    w:d.tileW || 652, label:c.label, bg:'#FBF9F5', border:'#EBE5DB',
    body:`<div style="min-height:${d.countMin || d.tileMin || 240}px;display:flex;align-items:flex-start;overflow:hidden">${d.mini(t, box, c)}</div>` })));
  tiles.push(K.tile({ w:1328, label:'THE PLAY TARGET’S FOUR STATES · ONE COMPONENT, IDENTICAL IN ALL FIFTEEN DESIGNS', bg:'#FFFFFF', border:'#EBE5DB', body:playStates(t, d) }));
  (d.extraTiles || []).forEach(x => tiles.push(K.textTile({ w:x.w || 652, label:x.label, body:x.body, min:x.min || 120 })));
  return `<div style="width:1368px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${tiles.join('')}</div>`;
}

function twoWidths(d) {
  const cell = (w, label, inner) => `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">${label}</span>${inner}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
    cell(834, d.tabletLabel, K.frame(L, 834, d.body(L, 834, {})))}${
    cell(390, d.mobileLabel, K.frame(L, 390, d.body(L, 390, {})))}</div>`;
}

function buildPage(d) {
  let out = K.DOC_HEAD;
  out += K.intro({ rail:d.rail, title:`${d.n} · ${d.name}`, paras:d.paras });
  out += K.section(`A15-${d.n} desktop light`, K.cap(d.primaryCap) + K.frame(L, 1440, d.body(L, 1440, {})) + K.note(d.primaryNote));
  out += K.section(`A15-${d.n} states`, K.cap(d.statesCap || 'THE FRAME’S FOUR STATES · THE POSTER · THE PLAYER · NO POSTER · THE NOTICE') + statesFrame(L, d) + K.note(d.statesNote));
  if (d.extraSection) out += d.extraSection;
  out += K.wrapIf('showControls', K.section(`A15-${d.n} controls`, K.cap(d.controls.cap) + K.panel(d.controls)));
  out += K.wrapIf('showResponsive', K.section(`A15-${d.n} responsive`, K.cap(d.respCap) + twoWidths(d) + K.note(d.respNote)));
  out += K.wrapIf('showDark', K.section(`A15-${d.n} dark`, K.cap(d.darkCap || 'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED') + K.frame(D, 1440, d.body(D, 1440, {})) + K.note(d.darkNote)));
  out += K.wrapIf('showSpec', K.section(`A15-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}

/* quoted from the registry, verbatim */
const FACADE_QUOTE = 'The poster is an <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;a href&gt;</code> to the video’s canonical URL (YouTube/Vimeo watch page).';
const TABS_QUOTE = 'All panels render stacked and visible, each preceded by its tab label as a heading.';
const CAROUSEL_QUOTE = 'The slide track is a native horizontally-scrollable <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">scroll-snap</code> strip — <strong style="font-weight:600">fully usable</strong>, only dots and arrow buttons are hidden.';
const LIGHTBOX_NOTE = 'A14’s <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">lightbox</code> is not declared anywhere in A15 ⚑ — a still opens an image overlay, a poster opens a player, and the two are different modules.';
const FACADE_LINE = `${b('video-facade')}, ${b('edit-safe: yes')} — A4·10’s call, carried verbatim ⚑: it does not run while the section is edited and writes nothing into authored DOM, which is why every frame here draws the poster as a still. ${b('No-JS, quoted:')} “${FACADE_QUOTE}” ${b('A15 settles A4·10’s finding')} ⚑: ${b('the trigger compiles as that anchor')} — an ${code('&lt;a href&gt;')} to the canonical watch page wrapping the poster — ${b('and the module upgrades it in place')} to the control that loads the player, so the design and the registry no longer disagree. With JavaScript off the reader reaches the film in one navigation, and ${b('no third-party request is made either way until they act')} ⚑.`;

return { stdWrap, bleedWrap, bandWrap, statesFrame, playStates, twoWidths, buildPage,
  MODE_LABEL, FACADE_QUOTE, TABS_QUOTE, CAROUSEL_QUOTE, LIGHTBOX_NOTE, FACADE_LINE };
})();
