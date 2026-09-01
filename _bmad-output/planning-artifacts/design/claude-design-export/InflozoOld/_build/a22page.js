// A22 page assembler — turns a design descriptor into a full .dc.html canvas file.
globalThis.A22PAGE = (function () {
const K = globalThis.A22LIB;
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
  empty:       'EMPTY · the placeholder in text-muted, nothing announced',
  focus:       'FOCUS · 1.5 px accent border, the library ring suppressed ⚑',
  invalid:     'INVALID · the error replaces the note, no red anywhere ⚑',
  submitting:  'SUBMITTING · “Subscribing…”, button width reserved, no spinner',
  done:        'DONE · replaced in place at the same height, session-lived ⚑',
  subscribed:  'SIGNED-IN SUBSCRIBER · the form is never drawn ⚑',
  membersOff:  'MEMBERS OFF IN GHOST · the field goes, the button becomes a link ⚑'
};

function statesFrame(t, d) {
  const states = d.states || ['empty', 'focus', 'invalid', 'submitting', 'done', 'subscribed', 'membersOff'];
  const tiles = states.map(s => K.tile({
    w: d.tileW || 652, label: STATE_LABEL[s] || s, bg: d.tileBg || '#FFFFFF', border: '#EBE5DB',
    body: `<div style="min-height:${d.tileMin || 118}px;display:flex;align-items:center">${d.stateForm(t, s)}</div>`
  }));
  if (d.extraTile) tiles.push(K.tile({ w: d.tileW || 652, label: d.extraTile.label, bg: '#F7F5F2', border: '#E7E2DB',
    body: `<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;min-height:${d.tileMin || 118}px">${d.extraTile.body.map(x => `<span>${x}</span>`).join('')}</div>` }));
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${tiles.join('')}</div>`;
}

function twoWidths(d) {
  const cell = (w, label, inner) => `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">${label}</span>${inner}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
    cell(834, d.tabletLabel, K.frame(L, 834, d.body(L, 834, {})))}${
    cell(390, d.mobileLabel, K.frame(L, 390, d.body(L, 390, {})))}</div>`;
}

function buildPage(d) {
  let out = K.DOC_HEAD;
  out += K.intro({ rail: d.rail, title: `${d.n} · ${d.name}`, paras: d.paras });
  out += K.section(`A22-${d.n} desktop light`, K.cap(d.primaryCap) + K.frame(L, 1440, d.body(L, 1440, {})) + K.note(d.primaryNote));
  out += K.section(`A22-${d.n} states`, K.cap(d.statesCap || 'THE STATES EVERY A22 DESIGN OWES · EMPTY · FOCUS · INVALID · SUBMITTING · DONE · SUBSCRIBED · MEMBERS OFF') + statesFrame(L, d) + K.note(d.statesNote));
  if (d.extraSection) out += d.extraSection;
  out += K.wrapIf('showControls', K.section(`A22-${d.n} controls`, K.cap(d.controls.cap) + K.panel(d.controls)));
  out += K.wrapIf('showResponsive', K.section(`A22-${d.n} responsive`, K.cap(d.respCap) + twoWidths(d) + K.note(d.respNote)));
  out += K.wrapIf('showDark', K.section(`A22-${d.n} dark`, K.cap(d.darkCap || 'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED') + K.frame(D, 1440, d.body(D, 1440, {})) + K.note(d.darkNote)));
  out += K.wrapIf('showSpec', K.section(`A22-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}

// the module line every A22 spec card carries, quoted from the registry
const MODULE_QUOTE = 'the registry line \u201Cthe <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;form&gt;</code> posts natively to Ghost\u2019s members endpoint\u201D <strong style="font-weight:600">is withdrawn</strong> \u2691 \u2014 Ghost\u2019s signup endpoint refuses a plain form submission, so the form is replaced by the no-JavaScript notice (P0\u00B74) at the form row\u2019s own height: \u201CSigning up needs JavaScript \u2014 turn it on to subscribe.\u201D The sent, error and loading states are untouched.';

return { stdWrap, bleedWrap, statesFrame, twoWidths, buildPage, STATE_LABEL, MODULE_QUOTE };
})();
