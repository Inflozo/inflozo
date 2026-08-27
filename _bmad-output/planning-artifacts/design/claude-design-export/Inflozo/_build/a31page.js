// A31 page assembler — turns a design descriptor into a full .dc.html canvas file.
globalThis.A31PAGE = (function () {
const K = globalThis.A31LIB;
const { L, D, MONO, PK, b, code, tile, gap, hb, PAGE } = K;

const fo = (d, kind, w) => Object.assign({ kind }, typeof d.frameOpt === 'function' ? d.frameOpt(kind, w) : (d.frameOpt || {}));

/* ── hover / focus · A6's ring, carried ──────────────────────────────── */
function focusTile(t, d) {
  const g = K.ground(t, d.gnd || 'page');
  const cell = (lab, inner) => `<div style="display:flex;flex-direction:column;gap:8px"><span style="font-family:${MONO};font-size:9.5px;color:${g.muted}">${lab}</span>${inner}</div>`;
  const btn = o => K.btn(g, Object.assign({ label:PAGE.e404.cta, pack:PK, h:46, px:22 }, o));
  const ringBg = g.bg === 'transparent' ? 'rgba(0,0,0,0)' : g.bg;
  const ring = `<span style="display:inline-flex;border-radius:${g.r}px;box-shadow:0 0 0 4px ${ringBg},0 0 0 6px ${g.btnBg}">${btn({})}</span>`;
  const link = u => `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-decoration-thickness:${u ? '2px' : '1px'};text-underline-offset:3px">${PAGE.e404.link}</span>`;
  const carried = g.name === 'image' || g.name === 'contrast';
  const cells = `<div style="display:flex;flex-wrap:wrap;gap:26px 34px;align-items:flex-end">
    ${cell('RESTING', btn({}))}
    ${cell(carried ? 'HOVER · THE CARRIED COLOUR AT 93 % BRIGHTNESS ⚑' : 'HOVER · THE ACCENT AT 93 % BRIGHTNESS, DERIVED ⚑', `<span style="display:inline-flex;filter:brightness(.93)">${btn({})}</span>`)}
    ${cell(carried ? 'KEYBOARD FOCUS · 2 PX IN THE CARRIED COLOUR ⚑' : 'KEYBOARD FOCUS · 2 PX ACCENT AT A 4 PX OFFSET', ring)}
    ${cell('SECONDARY · RESTING', link(false))}
    ${cell('SECONDARY · HOVER · THE RULE THICKENS ⚑', link(true))}
    ${cell('THE PASSWORD FIELD, FOCUSED', `<div style="width:230px">${K.pwField(g, { state:'focus', label:false })}</div>`)}</div>`;
  if (g.name === 'image') {
    return `<div style="position:relative;background:${t.stripe};border-radius:${g.r}px;overflow:hidden">
      ${K.scrim(t, {})}<div style="position:relative;padding:20px">${cells}</div></div>`;
  }
  return `<div style="background:${g.bg};border-radius:${g.r}px;padding:20px">${cells}</div>`;
}

const NOCHANGE = K.textTile('WHAT DOES NOT CHANGE · THE THREE STATES EVERY A31 DESIGN OWES', [
  `${b('In the editor the page draws its 404, at rest')} ⚑ — the 500 and the gate are picked from the page switch in the sidebar, not from a behaviour, and ${b('nothing in A31 has a behaviour to preview')}. The edit-time frame and the published frame are the same picture.`,
  `${b('With JavaScript off every design is identical')} ⚑, in all ten. The copy is server-rendered, the search field is a real ${code(hb('form action="/search/" method="get"'))} and the gate is a native POST to ${code('/private/')}. ${b('No design in A31 declares a module beyond ')}${code('core')} ⚑.`,
  `${b('None of these pages renders on a working request')} ⚑ — the 404 and 500 exist only at their status codes, and ${b('the gate exists only while the site is set private in Ghost')}. There is no “now you are in” state to design: after a correct password Ghost redirects to the page the visitor asked for.`
], { min:150 });

function gateStates(d) {
  const t = L;
  return K.tiles([
    K.stateTile(K.TILE_LABEL.focus, d.stateBody(t, 'gate', { formState:'focus' }), { min:270 }),
    K.stateTile(K.TILE_LABEL.error, d.stateBody(t, 'gate', { formState:'error' }), { min:270 }),
    K.textTile(K.TILE_LABEL.nojs, d.gateNotes || [
      `${b('There is no themed submitting state')} ⚑. The form is a native POST, so the browser owns the wait: the button keeps its resting look and the page navigates. ${b('A spinner would need a module the registry does not have')} — the closest is ${code('member-form')}, which posts to Ghost’s members endpoint and is the wrong endpoint. ${b('That is a finding, not a new module')}.`,
      `${b('Wrong password is a fresh server render')} ⚑, not an inline check: Ghost re-renders ${code('private.hbs')} with its own error, ${b('the field comes back empty')} — Ghost does not echo a password — ${b('and focus returns to the field')}. The message sits above the label so a screen reader meets it before the input.`,
      `${b('The message is Ghost’s string and not a field')} ⚑. A design decides where it sits and how it is marked, and no control changes its words. It is drawn in the text colour on the plate with a hairline, ${b('never in red')}: the Paper pack has no error token, and inventing one would break in the other eleven packs.`
    ], { min:270 })
  ]);
}

function buildPage(d) {
  let out = K.DOC_HEAD;
  out += K.intro({ rail:d.rail, title:`${d.n} · ${d.name}`, paras:d.paras });

  out += K.section(`A31-${d.n} 404 desktop light`, K.cap(d.cap404) +
    K.frame(L, 1440, d.body(L, 1440, { kind:'e404' }), fo(d, 'e404', 1440)) + K.note(d.note404));

  out += K.section(`A31-${d.n} 500 desktop light`, K.cap(d.cap500 || 'DESKTOP 1440 · LIGHT · THE 500 · THE SAME ARRANGEMENT WITH EVERYTHING QUERIED TAKEN OUT ⚑') +
    K.frame(L, 1440, d.body(L, 1440, { kind:'e500' }), fo(d, 'e500', 1440)) + K.note(d.note500));

  out += K.section(`A31-${d.n} private gate desktop light`, K.cap(d.capGate || 'DESKTOP 1440 · LIGHT · THE PRIVATE-SITE GATE · private.hbs · NO NAVIGATION ⚑') +
    K.frame(L, 1440, d.body(L, 1440, { kind:'gate' }), fo(d, 'gate', 1440)) + K.note(d.noteGate));

  out += K.section(`A31-${d.n} gate states`, K.cap('THE GATE’S FORM STATES · FOCUSED, WRONG PASSWORD, AND WHAT A NATIVE POST MEANS · §8·2') +
    gateStates(d) + K.note(d.noteStates));

  out += K.section(`A31-${d.n} states`, K.cap('HOVER, FOCUS, THE EDITOR AND NO-JAVASCRIPT') +
    K.tiles([tile({ w:652, bg:'#FFFFFF', border:'#EBE5DB', label:'HOVER AND FOCUS · A6’S 2 PX RING AT A 4 PX OFFSET, CARRIED', body:focusTile(L, d) }), NOCHANGE]) +
    K.note(d.noteFocus));

  if (d.extraSection) out += d.extraSection;

  out += K.wrapIf('showControls', K.section(`A31-${d.n} controls`,
    K.cap(d.controls.cap || `THE CONTROL PANEL · ${d.controls.count} CONTROLS + THE SHARED PAGE SOURCE`) + K.panel(d.controls)));

  const cell = (w, label, inner) => `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">${label}</span>${inner}</div>`;
  out += K.wrapIf('showResponsive', K.section(`A31-${d.n} responsive`, K.cap(d.capResp) +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      ${cell(834, d.labelTablet, K.frame(L, 834, d.body(L, 834, { kind:'e404' }), fo(d, 'e404', 834)))}
      ${cell(390, d.labelMobile, K.frame(L, 390, d.body(L, 390, { kind:'e404' }), fo(d, 'e404', 390)))}
      ${cell(390, d.labelMobileGate || '390 · THE GATE · THE FIELD AND THE BUTTON GO FULL WIDTH, STACKED', K.frame(L, 390, d.body(L, 390, { kind:'gate' }), fo(d, 'gate', 390)))}</div>` +
    K.note(d.noteResp)));

  out += K.wrapIf('showDark', K.section(`A31-${d.n} dark`, K.cap(d.capDark || 'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED') +
    K.frame(D, 1440, d.body(D, 1440, { kind:d.darkKind || 'e404' }), fo(d, d.darkKind || 'e404', 1440)) +
    (d.darkSecond ? K.frame(D, 1440, d.body(D, 1440, { kind:d.darkSecond }), fo(d, d.darkSecond, 1440)) : '') +
    K.note(d.noteDark)));

  out += K.wrapIf('showSpec', K.section(`A31-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}

/* registry degradations, quoted verbatim — never composed */
const MOD = {
  core: 'Never runs; the <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">.js-enabled</code> class is never set, so all JS-conditional CSS stays in its no-JS branch.',
  'search-overlay': 'The trigger is a real <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">&lt;form action="/search/" method="get"&gt;</code>, so search submits as a normal page navigation.',
  'nav-drawer': 'Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown.'
};
const NONE = `${b('None; ')}${code('core')}${b(' assumed.')} ${b('No-JS: pixel-identical')} ⚑ — every word is server-rendered, the search field is a real GET form and the gate is a native POST. ${b('Edit-safe:')} there is no behaviour to suppress while editing.`;

return { buildPage, focusTile, NOCHANGE, gateStates, MOD, NONE, fo };
})();
