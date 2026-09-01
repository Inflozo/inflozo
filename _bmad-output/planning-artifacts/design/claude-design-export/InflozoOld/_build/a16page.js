// A16 page assembler — turns a design descriptor into a full .dc.html canvas file.
globalThis.A16PAGE = (function () {
const K = globalThis.A16LIB;
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
  empty:         'EMPTY · labels drawn, placeholders in text-muted, nothing announced',
  focus:         'FOCUS · 1.5 px accent border, the library ring suppressed ⚑',
  invalid:       'INVALID · the message sits under its own field, no red anywhere ⚑',
  submitting:    'SUBMITTING · “Sending…”, button width reserved, no spinner',
  sent:          'SENT · replaces the form in place; the section shrinks, and it may ⚑',
  failed:        'FAILED · everything typed is kept, the mailto offered as the way out ⚑',
  noDestination: 'NO DESTINATION · editor only; the published page falls back to mailto ⚑'
};
const ALL_STATES = ['empty', 'focus', 'invalid', 'submitting', 'sent', 'failed', 'noDestination'];

function statesFrame(t, d) {
  const states = d.states || ALL_STATES;
  const tiles = states.map(s => K.tile({
    w: d.tileW || 652, label: (d.stateLabels && d.stateLabels[s]) || STATE_LABEL[s] || s,
    bg: d.tileBg || '#FBF9F5', border: '#EBE5DB',
    body: `<div style="min-height:${d.tileMin || 300}px;display:flex;align-items:flex-start">${d.stateForm(t, s)}</div>`
  }));
  (d.extraTiles || []).forEach(x => tiles.push(K.tile({
    w: d.tileW || 652, label: x.label, bg: '#F7F5F2', border: '#E7E2DB',
    body: `<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;min-height:${x.min || 120}px">${x.body.map(y => `<span>${y}</span>`).join('')}</div>` })));
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
  out += K.section(`A16-${d.n} desktop light`, K.cap(d.primaryCap) + K.frame(L, 1440, d.body(L, 1440, {})) + K.note(d.primaryNote));
  out += K.section(`A16-${d.n} states`, K.cap(d.statesCap || 'THE SEVEN STATES EVERY A16 FORM OWES · EMPTY · FOCUS · INVALID · SUBMITTING · SENT · FAILED · NO DESTINATION') + statesFrame(L, d) + K.note(d.statesNote));
  if (d.extraSection) out += d.extraSection;
  out += K.wrapIf('showControls', K.section(`A16-${d.n} controls`, K.cap(d.controls.cap) + K.panel(d.controls)));
  out += K.wrapIf('showResponsive', K.section(`A16-${d.n} responsive`, K.cap(d.respCap) + twoWidths(d) + K.note(d.respNote)));
  out += K.wrapIf('showDark', K.section(`A16-${d.n} dark`, K.cap(d.darkCap || 'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED') + K.frame(D, 1440, d.body(D, 1440, {})) + K.note(d.darkNote)));
  out += K.wrapIf('showSpec', K.section(`A16-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}

// quoted from the registry, verbatim
const MODULE_QUOTE = 'The <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;form&gt;</code> posts natively to Ghost\u2019s members endpoint; Ghost\u2019s own server response replaces the designed sent state.';
const MODULE_READING = 'A16 reads that as: <strong style="font-weight:600">the form posts natively to whatever <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">action</code> it carries</strong> — a <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">mailto:</code> or the service\u2019s endpoint — and that service\u2019s own response page replaces the designed sent state. <strong style="font-weight:600">Empty, focus and the native required-field messages survive with no script at all</strong>; submitting, the in-place sent state and the failed banner are the JS path.';

return { stdWrap, bleedWrap, statesFrame, twoWidths, buildPage, STATE_LABEL, ALL_STATES, MODULE_QUOTE, MODULE_READING };
})();
