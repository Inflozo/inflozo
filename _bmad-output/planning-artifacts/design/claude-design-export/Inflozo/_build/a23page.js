// A23 page assembler — turns a design descriptor into a full .dc.html canvas file.
globalThis.A23PAGE = (function () {
const K = globalThis.A23LIB;
const { L, D, MONO, PC } = K;

function stdWrap(t, w, inner, o) {
  o = o || {}; const g = K.G(w);
  return `<div style="padding:0 ${g.m}px">${K.padTop(t, w, o.padNote)}<div style="width:${g.box}px">${inner}</div>${K.padBot(t, w)}</div>`;
}
function bleedWrap(t, w, inner, label) {
  const g = K.G(w);
  return `<div><div style="padding:0 ${g.m}px"><div style="height:26px;display:flex;align-items:flex-end;padding-bottom:6px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${label || 'SECTION PADDING 0 AT EVERY WIDTH · THE BAND CARRIES IT ⚑'}</span></div></div>${inner}<div style="height:20px"></div></div>`;
}

const STATE_LABEL = {
  before:   'BEFORE A QUERY · recent searches, then featured ⚑',
  typing:   'TYPING · debounced 200 ms, three characters minimum ⚑',
  results:  'RESULTS · the count line names the true total',
  one:      'ONE RESULT · the row keeps its geometry, nothing stretches ⚑',
  none:     'NO MATCHES · the word is not in the index ⚑',
  searching:'SEARCHING · the field says so, the list holds its height ⚑',
  nojs:     'NO JAVASCRIPT · field and archive link only · results need JS ⚑'
};

function statesFrame(t, d) {
  const states = d.states || ['before', 'typing', 'results', 'one', 'none', 'searching', 'nojs'];
  const tiles = states.map(s => K.tile({
    w: d.tileW || 652, label: STATE_LABEL[s] || s, bg: d.tileBg || '#FFFFFF', border: '#EBE5DB',
    body: `<div style="min-height:${d.tileMin || 168}px;display:flex;align-items:flex-start">${d.stateForm(t, s)}</div>`
  }));
  if (d.extraTile) tiles.push(K.tile({ w: d.tileW || 652, label: d.extraTile.label, bg: '#F7F5F2', border: '#E7E2DB',
    body: `<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;min-height:${d.tileMin || 168}px">${d.extraTile.body.map(x => `<span>${x}</span>`).join('')}</div>` }));
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${tiles.join('')}</div>`;
}

function twoWidths(d) {
  const cell = (w, label, inner) => `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">${label}</span>${inner}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
    cell(834, d.tabletLabel, K.frame(L, 834, d.body(L, 834, {}), d.frameOpt || {}))}${
    cell(390, d.mobileLabel, K.frame(L, 390, d.body(L, 390, {}), d.frameOpt || {}))}</div>`;
}

function keysFrame(d) {
  const g = K.ground(L, 'page');
  const rows = d.keys.map(([k, l]) => `<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid #F1EDE6">${K.keycap(g, k)}<span style="font-size:12.5px;line-height:1.6;color:#3A3835">${l}</span></div>`).join('');
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start"><div style="width:634px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:18px;box-sizing:border-box"><span style="font-family:${MONO};font-size:11px;color:${PC.mute}">THE KEYBOARD MODEL · A1·9'S, MATCHED</span>${rows}</div>${
    K.tile({ w:634, bg:'#F7F5F2', border:'#E7E2DB', label:'WHAT THE MODEL SETTLES',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">${d.keyNotes.map(x => `<span>${x}</span>`).join('')}</div>` })}</div>`;
}

function buildPage(d) {
  const fo = d.frameOpt || {};
  let out = K.DOC_HEAD;
  out += K.intro({ rail: d.rail, title: `${d.n} · ${d.name}`, paras: d.paras });
  out += K.section(`A23-${d.n} desktop light`, K.cap(d.primaryCap) + K.frame(L, 1440, d.body(L, 1440, {}), fo) + K.note(d.primaryNote));
  out += K.section(`A23-${d.n} states`, K.cap(d.statesCap || 'THE STATES EVERY A23 DESIGN OWES · BEFORE A QUERY · TYPING · RESULTS · ONE · NONE · SEARCHING · NO-JS') + statesFrame(L, d) + K.note(d.statesNote));
  if (d.keys) out += K.section(`A23-${d.n} keys`, keysFrame(d));
  if (d.extraSection) out += d.extraSection;
  out += K.wrapIf('showControls', K.section(`A23-${d.n} controls`, K.cap(d.controls.cap) + K.panel(d.controls)));
  out += K.wrapIf('showResponsive', K.section(`A23-${d.n} responsive`, K.cap(d.respCap) + twoWidths(d) + K.note(d.respNote)));
  out += K.wrapIf('showDark', K.section(`A23-${d.n} dark`, K.cap(d.darkCap || 'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED') + K.frame(D, 1440, d.body(D, 1440, {}), fo) + K.note(d.darkNote)));
  out += K.wrapIf('showSpec', K.section(`A23-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}

// registry degradations, quoted verbatim — never composed
const MOD = {
  'search-overlay': 'The trigger is a real <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;form action="/search/" method="get"&gt;</code>, so search submits as a normal page navigation.',
  'command-palette': 'The ⌘K hint is hidden; the visible search trigger remains and behaves as above.',
  'filter-strip': 'Filters are <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;a href&gt;</code> links to Ghost routes and <strong style="font-weight:600">work perfectly</strong> — this module needs JS least of all.',
  'load-more': 'Ghost’s numbered <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">/page/2/</code> pagination links render instead (<strong style="font-weight:600">FR-G4, explicitly</strong>).'
};

return { stdWrap, bleedWrap, statesFrame, twoWidths, keysFrame, buildPage, STATE_LABEL, MOD };
})();
