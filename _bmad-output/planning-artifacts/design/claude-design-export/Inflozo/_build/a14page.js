// A14 page assembler — turns a design descriptor into a full .dc.html canvas file.
globalThis.A14PAGE = (function () {
const K = globalThis.A14LIB;
const { L, D, MONO, PC, b, code } = K;

function stdWrap(t, w, inner, o) {
  o = o || {}; const g = K.G(w);
  return `<div style="padding:0 ${g.m}px">${K.padTop(t, w, o.padNote)}<div style="width:${g.box}px">${inner}</div>${K.padBot(t, w)}</div>`;
}
function bleedWrap(t, w, inner, label) {
  const g = K.G(w);
  return `<div>${K.padTop(t, w, label || 'SIDE PADDING 0 AT EVERY WIDTH ⚑ · VERTICAL PADDING UNCHANGED')}${inner}${K.padBot(t, w)}</div>`;
}

/* the frame's three states — one component, identical in all fifteen designs */
function hoverStates(t, d) {
  const g = K.ground(t, d.stateGround || 'page');
  const w = 176, item = K.IMAGES[0], crop = d.crop || 'Landscape';
  const h = K.hFor(w, item, crop);
  const cell = (label, inner, note) => `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px"><span style="font-family:${MONO};font-size:10px;color:${g.muted}">${label}</span>${inner}<span style="font-size:11px;line-height:1.45;color:${g.muted};font-family:${g.pack.body}">${note}</span></div>`;
  const fig = (o) => `<div style="${o.lift ? 'transform:translateY(-2px);' : ''}${o.ring ? `outline:4px solid ${t.accent};outline-offset:3px;border-radius:${g.r + 2}px;` : ''}display:flex;flex-direction:column;gap:9px">
      ${K.plate(t, g, { w, h, cap:K.two(item.n) + ' · 4:3', r:g.r })}
      <span style="font-size:13px;line-height:1.45;color:${g.muted};font-family:${g.pack.body};${o.underline ? `text-decoration:underline;text-underline-offset:3px;color:${g.text};` : ''}">${item.cap}</span></div>`;
  return `<div style="background:${g.bg};border-radius:8px;padding:20px;display:flex;gap:26px;flex-wrap:wrap;box-sizing:border-box">
    ${cell('RESTING', fig({}), 'Caption in <b>text-muted</b>, no underline, no shadow.')}
    ${cell('HOVER', fig({ lift:true, underline:true }), 'The frame lifts <b>2 px</b> and the caption underlines, 160 ms ease-out.')}
    ${cell('FOCUS', fig({ ring:true, underline:true }), 'A6’s <b>4 px accent ring</b>, 3 px outside the frame ⚑.')}
    ${cell('REDUCED MOTION', fig({ underline:true }), '<b>The lift is dropped, the underline stays</b> ⚑ — the hover is still legible without movement.')}</div>`;
}

function statesFrame(t, d) {
  const box = d.miniBox || 604;
  const counts = d.counts || [
    { n:1, label:`ONE IMAGE · MINIATURE DRAWN AT ${box} ⚑ · NOT A BREAKPOINT` },
    { n:2, label:`TWO IMAGES · MINIATURE AT ${box}` },
    { n:d.manyN || 6, noCapAt:1, label:'A CAPTION LEFT EMPTY ON FRAME 02 ⚑' }
  ];
  const tiles = counts.map(c => K.tile({
    w:d.tileW || 652, label:c.label, bg:'#FBF9F5', border:'#EBE5DB',
    body:`<div style="min-height:${d.tileMin || 240}px;display:flex;align-items:flex-start;overflow:hidden">${d.mini(t, box, c)}</div>` }));
  tiles.push(K.tile({ w:1328, label:'THE FRAME’S FOUR STATES · ONE COMPONENT, IDENTICAL IN ALL FIFTEEN DESIGNS', bg:'#FFFFFF', border:'#EBE5DB', body:hoverStates(t, d) }));
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
  out += K.section(`A14-${d.n} desktop light`, K.cap(d.primaryCap) + K.frame(L, 1440, d.body(L, 1440, {})) + K.note(d.primaryNote));
  out += K.section(`A14-${d.n} counts and states`, K.cap(d.statesCap || 'WHAT THE ARRANGEMENT DOES AT ONE, AT TWO AND WITH A CAPTION MISSING · AND THE FRAME’S OWN STATES') + statesFrame(L, d) + K.note(d.statesNote));
  if (d.extraSection) out += d.extraSection;
  out += K.wrapIf('showControls', K.section(`A14-${d.n} controls`, K.cap(d.controls.cap) + K.panel(d.controls)));
  out += K.wrapIf('showResponsive', K.section(`A14-${d.n} responsive`, K.cap(d.respCap) + twoWidths(d) + K.note(d.respNote)));
  out += K.wrapIf('showDark', K.section(`A14-${d.n} dark`, K.cap(d.darkCap || 'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED') + K.frame(D, 1440, d.body(D, 1440, {})) + K.note(d.darkNote)));
  out += K.wrapIf('showSpec', K.section(`A14-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}

/* quoted from the registry, verbatim */
const LIGHTBOX_QUOTE = 'Each thumbnail is an <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;a href&gt;</code> to the full-size image; clicking opens it as a normal page.';
const CAROUSEL_QUOTE = 'The slide track is a native horizontally-scrollable <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">scroll-snap</code> strip — <strong style="font-weight:600">fully usable</strong>, only dots and arrow buttons are hidden.';
const LIGHTBOX_LINE = `<strong style="font-weight:600">${'lightbox'}</strong>, <strong style="font-weight:600">edit-safe: no</strong> ⚑ — it does not open while the section is being edited, so the resting grid is the frame the editor draws and the overlay is specified rather than triggered. <strong style="font-weight:600">No-JS, quoted:</strong> “${LIGHTBOX_QUOTE}” <strong style="font-weight:600">A14 reads that as: every frame is already an <code style="font-family:'JetBrains Mono',monospace;font-size:12px">&lt;a href&gt;</code> to the original file</strong>, so with no script the gallery is a set of links to full-size images and nothing is lost but the overlay.`;

return { stdWrap, bleedWrap, hoverStates, statesFrame, twoWidths, buildPage, LIGHTBOX_QUOTE, CAROUSEL_QUOTE, LIGHTBOX_LINE };
})();
