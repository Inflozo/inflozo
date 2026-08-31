// A32 page assembler — turns a design descriptor into a full .dc.html canvas file.
globalThis.A32PAGE = (function () {
const K = globalThis.A32LIB;
const { L, D, MONO, PK, b, code, tile, gap, GATE } = K;

/* ── the shared hover / focus tile · A6's ring, carried ───────────────── */
function focusTile(t, d) {
  const g = K.ground(t, d.gnd || 'page');
  const cell = (lab, inner) => `<div style="display:flex;flex-direction:column;gap:8px"><span style="font-family:${MONO};font-size:9.5px;color:${g.muted}">${lab}</span>${inner}</div>`;
  const btn = o => K.btn(g, Object.assign({ label:GATE.paid.cta, pack:PK, h:46, px:22 }, o));
  const ring = `<span style="display:inline-flex;border-radius:${g.r}px;box-shadow:0 0 0 4px ${g.bg === 'transparent' ? 'rgba(0,0,0,0)' : g.bg},0 0 0 6px ${g.btnBg}">${btn({})}</span>`;
  const link = u => `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-decoration-thickness:${u ? '2px' : '1px'};text-underline-offset:3px">Sign in</span>`;
  const isImg = g.name === 'image';
  const cells = `<div style="display:flex;flex-wrap:wrap;gap:26px 34px;align-items:flex-end">
    ${cell('RESTING', btn({}))}
    ${cell(isImg || g.name === 'contrast' ? 'HOVER · THE CARRIED COLOUR AT 93 % BRIGHTNESS ⚑' : 'HOVER · THE ACCENT AT 93 % BRIGHTNESS, DERIVED ⚑', `<span style="display:inline-flex;filter:brightness(.93)">${btn({})}</span>`)}
    ${cell(isImg || g.name === 'contrast' ? 'KEYBOARD FOCUS · 2 PX IN THE CARRIED COLOUR, NOT THE ACCENT ⚑' : 'KEYBOARD FOCUS · 2 PX ACCENT AT A 4 PX OFFSET', ring)}
    ${cell('SECONDARY · RESTING', link(false))}
    ${cell('SECONDARY · HOVER · THE RULE THICKENS ⚑', link(true))}</div>`;
  if (isImg) {
    return `<div style="position:relative;background:${t.stripe};border-radius:${g.r}px;overflow:hidden">
      <div style="position:absolute;inset:0;background:${t.dark ? 'rgba(9,8,6,.52)' : 'rgba(35,32,25,.45)'}"></div>
      <div style="position:relative;padding:20px">${cells}</div></div>`;
  }
  return `<div style="background:${g.bg};border-radius:${g.r}px;padding:20px">${cells}</div>`;
}

const NOCHANGE = t => tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'WHAT DOES NOT CHANGE · THE THREE STATES EVERY A32 DESIGN OWES',
  body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835;min-height:150px">
    <span>${b('In the editor the gate draws at its resting state')} ⚑ — the paid gate, the fade at its control value, no hover and no ring. ${b('Nothing in A32 has a behaviour to preview')}, so the edit-time frame and the published frame are the same picture.</span>
    <span>${b('With JavaScript off the section is drawn identically and every action in it is dead')} ⚑ — the gate is server-rendered HTML, the fade is a gradient and the suppression rules are ${code(':last-child')} selectors, but ${b('every action opens Ghost’s Portal, which is JavaScript')}. ${b('1 Fade and 6 Split Pitch replace their email field with the no-JavaScript notice')}; ${b('11 Sticky Bar hides its close button')}; ${b('12 Meter keeps its static reading-time line and loses the fill')}. ${b('And no member button renders at all where the connected site cannot take it')} ⚑.</span>
    <span>${b('A reader who has access never sees this section')} ⚑ — Ghost sends the whole post and A32 does not render. There is no “unlocked” state to design, and no design may draw one.</span></div>` });

/* ── the three landings · §8·4 ────────────────────────────────────────── */
function landings(t, d) {
  const cellW = 440, inner = 412;
  const one = last => {
    const body = `<div style="background:${t.bg}">
      <div style="padding:14px 16px 0">${K.preview(t, 390, { last, n:1, measure:inner - 32, mono:false, centre:false, fade:last === 'para' ? 96 : 0 })}</div>
      <div style="height:${last === 'para' ? (d.landPad || 30) : (d.landPad || 30) + 10}px"></div>
      <div style="${d.bleed ? '' : 'padding:0 16px'}">${d.stateBody(t, 'paid', true)}</div>
      <div style="height:18px"></div></div>`;
    return tile({ w:cellW, bg:'#FFFFFF', border:'#EBE5DB', pad:14, label:K.LAND_LABEL[last],
      body:`<div style="width:${inner}px;overflow:hidden;border-radius:8px;border:1px solid #EFEAE1">${body}</div>` });
  };
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${['para', 'heading', 'image'].map(one).join('')}</div>`;
}

/* ── responsive · 834 and 390, both drawn in full ─────────────────────── */
function twoWidths(d) {
  const fo = d.frameOpt || {};
  const cell = (w, label, inner) => `<div style="display:flex;flex-direction:column;gap:8px;width:${w}px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">${label}</span>${inner}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
    cell(834, d.tabletLabel, K.frame(L, 834, d.body(L, 834, { gate:GATE.paid }), fo))}${
    cell(390, d.mobileLabel, K.frame(L, 390, d.body(L, 390, { gate:GATE.paid }), fo))}${
    cell(390, d.mobileAltLabel || '390 · THE FREE-SIGNUP GATE · THE SAME ARRANGEMENT, DIFFERENT COPY', K.frame(L, 390, d.body(L, 390, { gate:GATE.free }), fo))}</div>`;
}

function buildPage(d) {
  const fo = d.frameOpt || {};
  let out = K.DOC_HEAD;
  out += K.intro({ rail:d.rail, title:`${d.n} · ${d.name}`, paras:d.paras });

  out += K.section(`A32-${d.n} paid gate desktop light`, K.cap(d.primaryCap) +
    K.frame(L, 1440, d.body(L, 1440, { gate:GATE.paid }), fo) + K.note(d.primaryNote));

  out += K.section(`A32-${d.n} free gate desktop light`, K.cap(d.freeCap || 'DESKTOP 1440 · LIGHT · THE FREE-SIGNUP GATE · A MEMBERS-ONLY POST AND A SIGNED-OUT READER · SAME ARRANGEMENT, DIFFERENT COPY') +
    K.frame(L, 1440, d.body(L, 1440, { gate:GATE.free }), fo) + K.note(d.freeNote));

  out += K.section(`A32-${d.n} gates`, K.cap(d.gatesCap || 'THE OTHER TWO GATES · A SIGNED-IN FREE MEMBER, AND A POST SOLD TO ONE TIER') +
    K.stateTiles(L, d, ['upgrade', 'tier'], { extra:d.extraTile, min:d.tileMin || 230 }) + K.note(d.gatesNote));

  out += K.section(`A32-${d.n} the cut`, K.cap(d.landCap || 'WHERE THE CUT LANDS · AFTER A PARAGRAPH, AFTER A HEADING, AFTER AN IMAGE · §8·4') +
    landings(L, d) + K.note(d.landNote));

  out += K.section(`A32-${d.n} states`, K.cap('HOVER, FOCUS, THE EDITOR AND NO-JAVASCRIPT') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
      tile({ w:652, bg:'#FFFFFF', border:'#EBE5DB', label:K.GATE_LABEL.focus, body:focusTile(L, d) })}${NOCHANGE(L)}</div>` +
    K.note(d.statesNote));

  if (d.extraSection) out += d.extraSection;

  out += K.wrapIf('showControls', K.section(`A32-${d.n} controls`, K.cap(d.controls.cap || 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED ACCESS SOURCE GROUP') + K.panel(d.controls)));
  out += K.wrapIf('showResponsive', K.section(`A32-${d.n} responsive`, K.cap(d.respCap) + twoWidths(d) + K.note(d.respNote)));
  out += K.wrapIf('showDark', K.section(`A32-${d.n} dark`, K.cap(d.darkCap || 'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED · THE FADE IS THE DARK GROUND') +
    K.frame(D, 1440, d.body(D, 1440, { gate:GATE.paid }), fo) + K.note(d.darkNote)));
  out += K.wrapIf('showSpec', K.section(`A32-${d.n} spec`, K.cap('THE WRITTEN SPEC · ALL TEN FIELDS') + K.specCards(d.spec)));
  out += K.DOC_TAIL;
  return out;
}

/* registry degradations, quoted verbatim — never composed */
const MOD = {
  'core': 'Never runs; the <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">.js-enabled</code> class is never set, so all JS-conditional CSS stays in its no-JS branch.',
  'member-form': 'Ghost’s signup endpoint refuses a plain form submission, so the form is replaced by P0·4’s no-JavaScript notice at the form row’s own height — <em>Signing up needs JavaScript — turn it on to subscribe.</em> — no field, no button, the legal line kept beneath. The sent, error and loading states are unchanged.',
  'price-toggle': 'Both monthly and yearly prices render side by side, each labelled — no toggle control shown.',
  'dismiss': 'The bar renders and stays; the close button is hidden rather than rendered inert.',
  'reading-progress': 'The bar is hidden entirely (it is decorative). The static reading-time line stays — it is built from post.reading_time and needs no script — and the proportional fill goes with the module.'
};
const plain = k => MOD[k].replace(/<[^>]+>/g, '');
const NONE = `${b('None; ')}${code('core')}${b(' assumed.')} ${b('No-JS: the section is drawn identically and every action in it is dead')} ⚑ — Portal is JavaScript — the gate is server-rendered HTML, the fade is a gradient and the suppression rules are ${code(':last-child')} selectors, and ${b('the button does not render at all where the connected site cannot take it')} ⚑. ${b('Edit-safe:')} there is no behaviour to suppress while editing.`;
const EDITSAFE = `${b('Edit-safe:')} the resting state is the only state, and nothing posts, ticks or pins while the section is edited.`;

return { buildPage, focusTile, landings, twoWidths, NOCHANGE, MOD, plain, NONE, EDITSAFE };
})();
