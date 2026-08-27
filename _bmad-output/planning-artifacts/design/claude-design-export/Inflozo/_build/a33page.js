// A33 page assembler — turns a treatment descriptor into a full .dc.html canvas file.
globalThis.A33PAGE = (function () {
const K = globalThis.A33LIB;
const { L, D, MONO, PK, b, code, tile } = K;

function buildPage(d) {
  const tr = d.tr;
  let out = K.DOC_HEAD;
  out += K.intro({ rail:d.rail, title:`${d.n} · ${d.name}`, paras:d.paras });

  out += K.section(`A33-${d.n} article desktop light`, K.cap(d.primaryCap) +
    K.frame(L, 1440, K.scene(L, 1440, tr, d.sceneOpt || {}), d.frameOpt || {}) + K.note(d.primaryNote));

  out += K.section(`A33-${d.n} twenty cards`, K.cap(d.rollCap ||
    'EVERY EDITOR CARD AT THIS TREATMENT · ALL TWENTY, IN GHOST’S OWN ORDER · LIGHT · DRAWN AT A 560 MEASURE IN THE TILE, 720 IN THE PAGE') +
    K.roll(L, 1440, tr, { notes:d.rollNotes }) + K.note(d.rollNote));

  out += K.section(`A33-${d.n} card panels`, K.cap(
    'EACH CARD IS EDITABLE, AND EVERY EDIT IS GLOBAL · FOUR CARDS SELECTED ON THE CANVAS WITH THEIR OWN PANELS OPEN') +
    K.cardPanels(L, 1440, tr, {}) + K.note(d.panelsNote ||
      `${b('A card is selected on the canvas and its own panel opens')} — C.1’s panel, unchanged. ${b('What the treatment already decided is shown read-only in it')} ⚑, so a user can see where a value came from instead of finding two controls that disagree. ${b('Saving writes one value onto the site')}: every card of that type, in every post and every page, reads it. ${b('There is no per-post override and no per-card override')} ⚑ — that is what makes a card a global component rather than a piece of formatting.`));

  out += K.section(`A33-${d.n} widths`, K.cap(d.widthCap ||
    'THE AUTHOR’S THREE WIDTHS, RESOLVED · DESKTOP 1440 · THE ONE THING GHOST AUTHORS AND A33 DECIDES') +
    K.widths(L, 1440, tr, d) + K.note(d.widthsNote));

  out += K.section(`A33-${d.n} states`, K.cap(d.statesCap || 'HOVER, FOCUS, THE TOGGLE’S TWO STATES, THE EDITOR AND NO-JAVASCRIPT') +
    K.states(L, 1440, tr, d) + K.note(d.statesNote));

  out += K.section(`A33-${d.n} absent content`, K.cap(d.absentCap ||
    'WHAT RENDERS WHEN A FIELD IS EMPTY · SIX CASES, INCLUDING THE UGLY TEST') +
    K.absent(L, 1440, tr, d) + K.note(d.absentNote));

  out += K.section(`A33-${d.n} accessibility`, K.cap('ACCESSIBILITY · THE MARKUP IS GHOST’S AND THE TREATMENT MUST NOT BREAK IT') +
    K.a11y(L, 1440, tr, d) + K.note(d.a11yNote));

  if (d.extraSection) out += d.extraSection;

  out += K.wrapIf('showControls', K.section(`A33-${d.n} controls`,
    K.cap(d.controls.cap || 'THE CONTROL PANEL · SIX CONTROLS + WHAT GHOST OWNS') + K.panel(d.controls)));

  out += K.wrapIf('showResponsive', K.section(`A33-${d.n} responsive`, K.cap(d.respCap) +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      <div style="display:flex;flex-direction:column;gap:8px;width:834px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">${d.tabletLabel} · ALL TWENTY CARDS</span>${K.frame(L, 834, K.scene(L, 834, tr, d.sceneOpt || {}), d.frameOpt || {})}</div>
      <div style="display:flex;flex-direction:column;gap:8px;width:390px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">${d.mobileLabel} · ALL TWENTY CARDS</span>${K.frame(L, 390, K.scene(L, 390, tr, d.sceneOpt || {}), d.frameOpt || {})}</div></div>` + K.note(d.respNote)));

  out += K.wrapIf('showDark', K.section(`A33-${d.n} dark`, K.cap(d.darkCap ||
    'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED · THE SAME ARRANGEMENT AND THE SAME CONTENT') +
    K.frame(D, 1440, K.scene(D, 1440, tr, d.sceneOpt || {}), d.frameOpt || {}) +
    `<div style="height:4px"></div>` + K.cap('THE FOUR CARDS DARK CHANGES MOST · SAME TREATMENT, DARK TOKENS') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
      ['bookmark', 'product', 'audio', 'signup'].map(kind => tile({ w:652, bg:'#211D17', border:'#332E27', labelCol:'#A79E8F',
        label:K.CARD_LABEL[kind], body:`<div style="background:${D.bg};border-radius:8px;padding:18px;display:flex;justify-content:center">${
          K.card(kind, D, 1440, tr, K.cardOpts(kind, tr, 560, 616))}</div>` })).join('')}</div>` +
    K.note(d.darkNote)));

  out += K.wrapIf('showSpec', K.section(`A33-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}
return { buildPage };
})();
