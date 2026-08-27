// A30 page assembler — turns a design descriptor into a full .dc.html canvas file.
globalThis.A30PAGE = (function () {
const K = globalThis.A30LIB;
const { L, D, MONO, PC, b, code, tile } = K;

function padTop(t, w, note) {
  const g = K.G(w);
  return `<div style="height:${g.pad}px;display:flex;align-items:flex-end;padding-bottom:4px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${g.pad} · A30’S OWN TOP PADDING · ${note || 'A30 IS THE WHOLE PAGE BETWEEN A1’S HEADER AND A3’S FOOTER ⚑'}</span></div>`;
}
function stdWrap(t, w, inner, o) {
  o = o || {}; const g = K.G(w);
  return `<div style="padding:0 ${g.m}px">${K.boundary(t, w, o.role || 'signup', o.extra)}${padTop(t, w, o.padNote)}<div style="width:${o.box || g.box}px;${o.wrapStyle || ''}">${inner}</div><div style="height:${g.pad}px"></div></div>`;
}
function bleedWrap(t, w, inner, o) {
  o = o || {}; const g = K.G(w);
  return `<div><div style="padding:0 ${g.m}px">${K.boundary(t, w, o.role || 'signup', o.extra)}<div style="height:26px;display:flex;align-items:flex-end;padding-bottom:6px"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${o.label || 'SECTION PADDING 0 AT EVERY WIDTH · THE BAND CARRIES ITS OWN ⚑'}</span></div></div>${inner}<div style="height:${o.after === undefined ? 20 : o.after}px"></div></div>`;
}

const STATE_LABEL = {
  signin:   'SIGN-IN · THE SAME ARRANGEMENT, ONE FIELD, NO TIERS ⚑',
  sent:     'MAGIC LINK SENT · THE FIELD IS REPLACED IN PLACE',
  expired:  'LINK EXPIRED · READ FROM THE QUERY STRING, SO JS-ONLY ⚑',
  invalid:  'INVALID ADDRESS · THE BROWSER FIRST, THEN GHOST’S REPLY',
  focus:    'FOCUS · 2 PX ACCENT RING AT A 4 PX OFFSET · A6’S RING, CARRIED',
  signedin: 'ALREADY SIGNED IN · THE SIGNUP PAGE FOR A MEMBER ⚑',
  sending:  'SENDING · THE BUTTON HOLDS ITS BOX AND ITS LABEL CHANGES ⚑',
  nojs:     'NO JAVASCRIPT · A NATIVE POST · GHOST RENDERS ITS OWN REPLY',
  code:     'SENT, WITH ONE-TIME CODE ENTRY: ON ⚑ · ARCHITECT: MEMBER-FORM EXTENSION',
  free:     'FREE MEMBER · NO PRICE ROW, NO RENEWAL ROW ⚑',
  comped:   'COMPLIMENTARY · NO PRICE, NO RENEWAL, NO BILLING HAND-OFF ⚑',
  cancelled:'CANCELLED, STILL RUNNING · “RENEWS” BECOMES “ENDS” ⚑'
};

function statesFrame(t, d) {
  const states = d.states || ['signin', 'sent', 'code', 'expired', 'invalid', 'focus', 'signedin', 'nojs'];
  const tiles = states.map(s => tile({
    w: d.tileW || 652, label: STATE_LABEL[s] || s, bg: '#FFFFFF', border: '#EBE5DB',
    body: `<div style="min-height:${d.tileMin || 210}px;display:flex;align-items:flex-start">${d.stateForm(t, s)}</div>`
  }));
  if (d.extraTile) tiles.push(tile({ w: d.tileW || 652, label: d.extraTile.label, bg: '#F7F5F2', border: '#E7E2DB',
    body: `<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;min-height:${d.tileMin || 210}px">${d.extraTile.body.map(x => `<span>${x}</span>`).join('')}</div>` }));
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${tiles.join('')}</div>`;
}

function accountStates(t, d) {
  const kinds = d.accountStates || ['free', 'comped', 'cancelled'];
  const fn = d.accountTile || ((tt, kind) => {
    const g = K.ground(tt, d.accountGround || 'page');
    const status = kind === 'cancelled' ? 'paid' : kind;
    const rows = kind === 'cancelled'
      ? `${K.accountRow(g, { row:{ l:'Plan', v:'Member · $6 a month' }, layout:'stack', dens:12 })}${K.accountRow(g, { row:{ l:'Ends', v:'14 September 2026', note:'cancel_at_period_end is true ⚑' }, layout:'stack', dens:12 })}${K.accountRow(g, { row:{ l:'Access', v:'Full until then', a:'Resume', portal:true }, layout:'stack', dens:12 })}`
      : K.accountRows(g, { status, layout:'stack', dens:12 });
    return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${K.accountHead(g, { status, nameSize:20, size:36 })}${rows}</div>`;
  });
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
    kinds.map(kind => tile({ w:d.accountTileW || 428, label:STATE_LABEL[kind] || kind, bg:'#FFFFFF', border:'#EBE5DB',
      body:`<div style="min-height:${d.accountTileMin || 268}px">${fn(t, kind)}</div>` })).join('')}</div>`;
}

function twoWidths(d, role) {
  const cell = (w, label, inner) => `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">${label}</span>${inner}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
    cell(834, d.tabletLabel, K.frame(L, 834, d.body(L, 834, { role:role || 'signup' }), d.frameOpt || {}))}${
    cell(390, d.mobileLabel, K.frame(L, 390, d.body(L, 390, { role:role || 'signup' }), d.frameOpt || {}))}${
    cell(390, d.mobileAccountLabel || '390 · THE ACCOUNT PAGE · ROWS BECOME STACKED PAIRS', K.frame(L, 390, d.body(L, 390, { role:'account' }), d.frameOpt || {}))}</div>`;
}

function buildPage(d) {
  const fo = d.frameOpt || {};
  let out = K.DOC_HEAD;
  out += K.intro({ rail: d.rail, title: `${d.n} · ${d.name}`, paras: d.paras });
  out += K.section(`A30-${d.n} signup desktop light`, K.cap(d.primaryCap) + K.frame(L, 1440, d.body(L, 1440, { role:'signup' }), fo) + K.note(d.primaryNote));
  out += K.section(`A30-${d.n} account desktop light`, K.cap(d.accountCap || 'DESKTOP 1440 · LIGHT · THE ACCOUNT PAGE · DISPLAY-ONLY, EVERY ACTION HANDS OFF TO PORTAL') +
    K.frame(L, 1440, d.body(L, 1440, { role:'account' }), fo) + K.note(d.accountNote));
  out += K.section(`A30-${d.n} account states`, K.cap(d.accountStatesCap || 'THE THREE MEMBERS EVERY ACCOUNT PAGE MEETS · FREE · COMPLIMENTARY · CANCELLED-BUT-RUNNING') +
    accountStates(L, d) + K.note(d.accountStatesNote));
  out += K.section(`A30-${d.n} form states`, K.cap(d.statesCap || 'THE FORM STATES EVERY A30 DESIGN OWES · SIGN-IN · SENT · EXPIRED · INVALID · FOCUS · SIGNED-IN · NO-JS') +
    statesFrame(L, d) + K.note(d.statesNote));
  if (d.extraSection) out += d.extraSection;
  out += K.wrapIf('showControls', K.section(`A30-${d.n} controls`, K.cap(d.controls.cap || 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED MEMBERSHIP SOURCE GROUP') + K.panel(d.controls)));
  out += K.wrapIf('showResponsive', K.section(`A30-${d.n} responsive`, K.cap(d.respCap) + twoWidths(d, d.respRole) + K.note(d.respNote)));
  out += K.wrapIf('showDark', K.section(`A30-${d.n} dark`, K.cap(d.darkCap || 'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED') +
    K.frame(D, 1440, d.body(D, 1440, { role:d.darkRole || 'signup' }), fo) + K.note(d.darkNote)));
  out += K.wrapIf('showSpec', K.section(`A30-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}

// registry degradations, quoted verbatim — never composed
const MOD = {
  'member-form': 'The <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;form&gt;</code> posts natively to Ghost’s members endpoint; Ghost’s own server response replaces the designed sent state.',
  'price-toggle': 'Both monthly and yearly prices render side by side, each labelled — no toggle control shown.',
  'tabs': 'All panels render stacked and visible, each preceded by its tab label as a heading.',
  'scroll-spy': 'The sticky list renders with the first item marked current; no active-item tracking.',
  'accordion': 'Native <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;details&gt;</code> — fully functional, keyboard-operable, opens and closes with no JS at all.',
  'reveal': 'Content renders fully visible; the hide-then-reveal CSS is scoped to <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">.js-enabled</code>.'
};
const plain = k => MOD[k].replace(/<[^>]+>/g, '');
const MODLINE = `${b('Edit-safe:')} nothing posts while the section is edited and the states are drawn rather than reached.`;

return { padTop, stdWrap, bleedWrap, statesFrame, accountStates, twoWidths, buildPage, STATE_LABEL, MOD, plain, MODLINE };
})();
