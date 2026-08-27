// A30 designs 5–8 · Contrast Band · Cover · Image Split · Tiers
(function () {
const K = globalThis.A30LIB, P = globalThis.A30PAGE, X = globalThis.A30X;
const { L, D, MONO, b, code, tile, PACKS, COPY, BENEFITS, TIERS, MEMBER } = K;
const PK = PACKS.paper;
const { mono, hair, onGround, pageHead, stateBody, accountBlock, benefitGrid } = X;

const MEMBERFORM = `${b('member-form')}. ${P.MODLINE} ${b('No-JS, quoted:')} “${P.plain('member-form')}”`;
const PORTALROW = `${b('Portal is the boundary')} ⚑ — Change email, Change plan, Billing and Manage newsletters each open Ghost’s Portal over the page. ${b('Nothing behind those buttons is themed')}, and no control moves the line.`;
const SETTLE_STATES = {
  label: 'WHAT THE SEVEN STATES SETTLE FOR THE WHOLE CATEGORY',
  body: [
    `${b('Sign-in is the signup page with one field and no tiers')} ⚑ — same measure, same button, same note.`,
    `${b('Sent replaces the field; it never disables it.')} The address is echoed so a mistyped one is visible, and “Send another link” is the recovery ⚑. ${b('Expired is read from the query string')} and is therefore JS-only ⚑.`,
    `${b('A signed-in member never sees a signup form')} ⚑ — the route draws the membership summary and two actions instead.`
  ]
};

// ═══════════════════════════════════════════════════════════════════════
// 5 · Contrast Band
// ═══════════════════════════════════════════════════════════════════════
const d5 = {
  n: 5, name: 'Contrast Band',
  rail: 'A30 MEMBERS PAGES · DESIGN 5 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The membership page as one inverted band running the full width of the viewport, carrying its own padding. The same column as 1 Centred with the ground changed, which is what makes it a different design.',
    'It is the loudest page in the category and the one where the accent cannot be used: on the band, accent measures 4.0:1 against the carried text and the button becomes the carried colour instead.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · FULL-BLEED BAND · SECTION PADDING 0 · THE BAND CARRIES 96',
  frameOpt: {},
  body(t, w, o) {
    const g = K.ground(t, 'contrast');
    const s = K.G(w);
    const role = (o || {}).role;
    const pad = w === 1440 ? 96 : w === 834 ? 80 : 64;
    const band = inner => `<div style="width:100%;background:${g.bg};padding:${pad}px ${s.m}px;box-sizing:border-box">${inner}</div>`;
    if (role === 'account') {
      const inner = band(`<div style="width:${w === 1440 ? 760 : w === 834 ? 640 : 350}px;margin:0 auto">${accountBlock(g, w, { labW:w === 1440 ? 168 : 140, max:560 })}</div>`);
      return P.bleedWrap(t, w, inner, { role:'account', label:`THE BAND CARRIES THE PADDING · ${pad} AT THIS WIDTH · SECTION PADDING 0 ⚑` });
    }
    const col = w === 1440 ? 480 : w === 834 ? 440 : 350;
    const inner = band(`<div style="width:${col}px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center">
      ${pageHead(g, w, { align:'center', measure:col, max:col })}
      ${K.gap(w === 390 ? 26 : 32)}
      ${K.formBlock(t, g, { state:'typed', full:true, center:true, legalMax:col })}
      ${K.gap(w === 390 ? 24 : 30)}${hair(g)}${K.gap(20)}
      <div style="width:100%;text-align:left">${K.benefitList(g, { n:4, gap:12, label:'What a membership includes', pack:PK })}</div></div>`);
    return P.bleedWrap(t, w, inner, { role:'signup', label:`THE BAND CARRIES THE PADDING · ${pad} AT THIS WIDTH · SECTION PADDING 0 ⚑` });
  },
  primaryNote: `A17·7’s on-contrast derivation, carried verbatim: ${b('muted at 72 %, hairline at 20 % and the field’s plate at 8 % of the band’s carried colour')} ⚑ — no new colours are introduced, which is what lets one band survive twelve packs. ${b('The button is the carried colour with the band colour as its label')}, and ${b('accent is disabled here with its ratio shown')} ⚑: ${code('#D96C3F')} on ${code('#232019')} measures 4.0:1 at 15 px, under AA for body text.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE BAND HOLDS THE ROWS · HAIRLINES AT 20 % OF THE CARRIED COLOUR',
  accountNote: `The account page on the band is the one place the row treatment needed re-checking: ${b('a 20 % hairline on the inverted ground reads at the same weight as a 100 % border token on the page ground')} ⚑ — measured, not assumed. The Portal buttons are outlined in that hairline with carried-colour labels. ${PORTALROW}`,
  accountStatesNote: `${b('The band’s height is its rows')} ⚑, and a free member’s band is 96 px shorter than a paid member’s. Nothing is padded to keep the band a fixed height — a band with dead space at the bottom is the arrangement’s one visible failure.`,
  statesNote: `${b('Every state stays on the band')} ⚑. The sent and expired panels use the 7 % plate rather than a surface colour, because a light card on an inverted band is a hole in it. ${b('The field’s focus border is the carried colour, not the accent')} ⚑ — the same substitution the button makes, for the same measured reason.`,
  extraTile: {
    label: 'WHAT THE BAND SETTLES ABOUT ACCENT',
    body: [
      `${b('Accent is not available on this ground and the control says so')} ⚑ — the Button control’s Accent value is disabled with “4.0:1” beside it, rather than being silently allowed. That is §7·4 of this project’s rules, applied.`,
      `${b('The substitution is derived, not chosen')}: the button takes the band’s own carried colour, so it re-derives correctly in all twelve packs without a per-pack decision ⚑.`,
      `${b('One accent use survives')} — none. ${b('This is the only design in A30 with no accent on it at all')} ⚑, and the category’s only section where the primary action is a neutral.`
    ]
  },
  stateForm(t, s) { return stateBody(t, s, { ground:'contrast', pad:18 }); },
  accountTile(t, kind) {
    const g = K.ground(t, 'contrast');
    const status = kind === 'cancelled' ? 'paid' : kind;
    const rows = kind === 'cancelled'
      ? `${K.accountRow(g, { row:{ l:'Plan', v:'Member · $6 a month' }, layout:'stack', dens:12 })}${K.accountRow(g, { row:{ l:'Ends', v:'14 September 2026', note:'cancel_at_period_end is true ⚑' }, layout:'stack', dens:12 })}${K.accountRow(g, { row:{ l:'Access', v:'Full until then', a:'Resume', portal:true }, layout:'stack', dens:12 })}`
      : K.accountRows(g, { status, layout:'stack', dens:12 });
    return `<div style="background:${g.bg};border-radius:${g.r}px;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;width:100%">${K.accountHead(g, { status, nameSize:20, size:36 })}${rows}</div>`;
  },
  controls: {
    name: 'Contrast Band', n: 5, count: 'SIX',
    sub: 'The page as one inverted band.',
    rows: [
      K.seg('Band padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 inside the band. ' + b('The section’s own padding is 0 at every width') + ' ⚑ — the band carries it, so two bands stacked have one seam and not two.'),
      K.seg('Band width', ['Full bleed', 'Content box'], 0, 'Full bleed runs to the viewport edge; Content box holds the band to 1,296 with the page ground either side. ' + b('At 390 both are full bleed') + ' ⚑.'),
      K.seg('Alignment', ['Centred', 'Left'], 0, 'Centred on the 480 measure, or pinned to the content box’s left edge. Left is the arrangement for a band under a full-bleed hero.'),
      K.seg('Button', ['Carried fill', 'Outline', 'Accent'], 0, b('Accent is disabled at 4.0:1') + ' ⚑ — under AA on this ground. Carried fill is the carried colour; Outline is a 20 % hairline with a carried label.', [2]),
      K.seg('Included list', ['Show', 'Hide'], 0, 'The four authored lines under a 20 % hairline.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name. Email only by default ⚑.')
    ],
    settles: [
      `${b('No ground control.')} The band ${b('is')} the ground; a Page value makes it 1 Centred and a Surface value makes it 4 Panel ⚑. The three are one arrangement on three grounds, which is precisely what the tuple’s ground slot exists to record.`,
      `${b('Band padding is not the section’s padding')} ⚑ — this is the one design in A30 whose section padding is fixed at 0, and the panel names it so a user does not go looking for the control they had in 1 Centred.`,
      `${b('A disabled value with its ratio is more useful than a missing one')} ⚑. A user who wants the accent button learns why they cannot have it here, and that 4 Panel is where they can.`
    ]
  },
  respCap: 'TABLET 834 · BAND FULL BLEED, COLUMN 440 · MOBILE 390 · BAND KEEPS ITS BLEED, PADDING 64',
  tabletLabel: '834 · band full bleed · column 440 · padding 80',
  mobileLabel: '390 · band full bleed · column 350 · padding 64',
  mobileAccountLabel: '390 · /account/ · ROWS STACK ON THE BAND · HAIRLINES HOLD AT 20 %',
  respNote: `${b('Bands do not collapse')} ⚑ — A29’s rule, carried: the band is full bleed at every width and only its inner padding and column change. ${b('At Band width: Content box the band holds 1,296 above 1,439 and goes full bleed below it')} ⚑, because a boxed band with 20 px of page either side reads as a mistake. Otherwise 1 Centred’s ladder exactly.`,
  darkNote: `${b('In dark the band inverts to the light contrast token')} ${code('#EDE7DA')} ${b('carrying')} ${code('#171511')} ⚑ — the band is always the opposite of the page, which is why it is a re-tune and not an inversion. The 72 / 20 / 8 derivations recompute from the new carried colour, and ${b('the button is again the carried colour')}: ${code('#171511')} on ${code('#EDE7DA')} at 15.6:1.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The whole membership page on one full-bleed inverted band carrying its own padding, with the form centred on a 480 measure and the included list under a 20 % hairline. The only design in A30 with no accent on it.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · contrast · none · none · the page as an inverted band')}<br><span style="color:#6B6459">Ground ${code('contrast')} is the whole distinction from 1 Centred and 4 Panel — same components, same measure, three grounds, three designs. Containment ${code('none')}: a full-width band is a ground ⚑.</span>`),
    K.specRow(3, 'Archetype', 'form. One departure: ' + b('the section has no padding of its own at any width') + ' ⚑ — the band carries it.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} band full bleed, inner padding 96, column 480 centred, heading 40. ${b('834')} inner 80, column 440, heading 34. ${b('≤ 767')} inner 64, column = frame − 40, heading 28, field and button full width. ${b('Band width: Content box resolves to full bleed below 1,440')} ⚑.`),
    K.specRow(5, 'Content fields', `As 1 Centred, and nothing more — ${b('the band adds no field')} ⚑. What changes is the derivation of every colour in it, and that is not a field.`)
  ], [
    K.specRow(6, 'Controls', 'Band padding (Compact · Comfortable · Spacious) · Band width (Full bleed · Content box) · Alignment (Centred · Left) · Button (Carried fill · Outline · <s>Accent</s> — disabled at 4.0:1) · Included list (Show · Hide) · Fields. Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred; tiers read and not drawn. ${b('The band renders identically for every member type')} and only its height changes ⚑.`),
    K.specRow(8, 'Empty state', `No benefits → hairline and list go, band shortens. ${b('The band is never hidden')} ⚑. Free and comped drop rows as in 1 Centred.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM),
    K.specRow(10, 'Accessibility notes', `${code('h1')} then the form, as 1 Centred. ${b('Every contrast pair on the band was measured')} ⚑: carried on band 13.4:1, muted 72 % 7.1:1, the 8 % field plate’s placeholder 4.9:1, the carried-fill button 13.4:1, ${b('and the accent 4.0:1 — which is why it is disabled')}. The focus ring is the carried colour at 2 px on a 4 px offset ⚑, never the accent, because on this ground the accent ring is invisible against the band.`),
    `${b('Flagged ⚑')} The 4.0:1 figure is computed from Paper’s own tokens; ${b('each pack re-checks its own accent on its own band')} and a pack whose accent passes may enable the value — that is a build-time derivation, not a design decision ⚑. “Band width: Content box” is invented ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 6 · Cover
// ═══════════════════════════════════════════════════════════════════════
const coverBand = (t, w, inner, o) => {
  o = o || {};
  const s = K.G(w);
  return `<div style="position:relative;width:100%;min-height:${o.h}px;background:${t.stripe};overflow:hidden;display:flex;align-items:center">
    <div style="position:absolute;inset:0;background:${t.dark ? 'rgba(9,8,6,.62)' : 'rgba(35,32,25,.45)'}"></div>
    <div style="position:relative;width:100%;padding:${o.pad}px ${s.m}px;box-sizing:border-box;display:flex;justify-content:${o.align || 'center'}">${inner}</div>
    <span style="position:absolute;left:${s.m}px;bottom:10px;font-family:${MONO};font-size:9.5px;color:rgba(251,249,245,.72)">${o.cap || 'COVER IMAGE · 2,400 × 1,350 MINIMUM · WARM SCRIM AT 45 % OF THE PACK’S TEXT COLOUR ⚑'}</span></div>`;
};
const d6 = {
  n: 6, name: 'Cover',
  rail: 'A30 MEMBERS PAGES · DESIGN 6 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The form over a full-bleed photograph under a warm scrim. The only design in A30 with a required field, and the only one that hands off to another design when that field is empty.',
    'On the account route the photograph becomes a 200 px band above the rows rather than the ground behind them: a membership summary over a picture is unreadable, and the rule that says so is on the frame.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · FULL-BLEED COVER · SCRIM 45 % · FORM 460 CENTRED · MIN-HEIGHT 620',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'image');
    const gp = K.ground(t, 'page');
    const role = (o || {}).role;
    const s = K.G(w);
    if (role === 'account') {
      const head = coverBand(t, w, `<div style="width:100%;max-width:${s.box}px;display:flex;align-items:flex-end">${K.accountHead(g, { status:'paid', nameSize:w === 390 ? 24 : 30, size:w === 390 ? 40 : 48 })}</div>`,
        { h:w === 390 ? 150 : 200, pad:w === 390 ? 20 : 28, align:'flex-start', cap:'COVER IMAGE · THE ACCOUNT BAND IS 200 TALL, NOT THE GROUND ⚑' });
      const rows = `<div style="padding:0 ${s.m}px"><div style="height:${w === 390 ? 32 : 44}px"></div><div style="width:${w === 1440 ? 760 : w === 834 ? 640 : 350}px">
        ${K.accountRows(gp, { status:'paid', labW:w === 1440 ? 168 : (w === 834 ? 140 : 0), layout:w === 390 ? 'stack' : undefined, dens:w === 390 ? 14 : 16 })}
        ${K.gap(24)}${K.signOutRow(gp, {})}${K.gap(6)}${K.portalNote(gp, { max:560 })}</div><div style="height:${s.pad}px"></div></div>`;
      return P.bleedWrap(t, w, head + rows, { role:'account', after:0, label:'THE PICTURE IS A 200 BAND ABOVE THE ROWS ⚑ · THE ROWS ARE ON THE PAGE GROUND' });
    }
    const col = w === 1440 ? 460 : w === 834 ? 430 : 350;
    const inner = `<div style="width:${col}px;display:flex;flex-direction:column;align-items:center;text-align:center">
      ${pageHead(g, w, { align:'center', measure:col, max:col, hSize:w === 390 ? 28 : 40 })}
      ${K.gap(w === 390 ? 24 : 30)}
      ${K.formBlock(t, g, { state:'typed', full:true, center:true, legalMax:col })}</div>`;
    return P.bleedWrap(t, w, coverBand(t, w, inner, { h:w === 390 ? 560 : 620, pad:w === 390 ? 64 : 96 }),
      { role:'signup', after:0, label:'SECTION PADDING 0 · THE COVER CARRIES 96 · 80 · 64 ⚑' });
  },
  primaryNote: `A20·13’s warm scrim, carried verbatim: ${b('a flat wash of the pack’s own text colour at 30 / 45 / 60 %')} ⚑, never a black gradient. On this ground every colour is derived from the carried white — ${b('muted at 80 %, hairline at 28 %, the field at 14 %')} — and ${b('the button is the carried white with the pack’s text as its label')} ⚑. The form holds 460 whatever the viewport does, because a field that grows with a photograph stops looking like a field.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE PICTURE IS A 200 BAND · THE ROWS ARE ON THE PAGE GROUND',
  accountNote: `${b('This is the design’s one bespoke behaviour and it is a route change, not a width change')} ⚑: six label-and-value rows over a photograph cannot be read, so on /account/ the cover becomes a 200 px band carrying the member’s name and badge, and the rows sit on the page ground beneath it. ${PORTALROW}`,
  accountStatesNote: `${b('The band is fixed at 200 and the rows below it change')} ⚑ — the picture is not doing any work that depends on the member type, which is the reason it can be a fixed height here and nowhere else in the design.`,
  statesNote: `${b('Every state is drawn over the scrim')} ⚑, so the sent and expired panels are the 10 % white plate inside a 28 % hairline rather than a surface card. ${b('The no-JS state is the one that matters most here')}: the form posts natively and Ghost’s own reply page replaces the cover entirely — ${b('a reader never sees a broken photograph')}.`,
  extraTile: {
    label: 'THE MISSING IMAGE · THE CATEGORY’S ONLY HAND-OFF',
    body: [
      `${b('With no image this design hands off to 1 Centred')} ⚑ — A29·5’s rule, carried verbatim. The hand-off is what gets rendered, ${b('not what gets selected')}: the editor still shows Cover as the chosen design, with a flag saying an image is needed, and the site shows 1 Centred rather than a grey rectangle.`,
      `${b('A scrim over nothing is worse than no scrim')} ⚑. Drawing the arrangement with the plate colour behind the form would produce a section that looks deliberately grey, and a user cannot tell that from a design decision.`,
      `${b('imageFocus is a field, and it is reachable')} ⚑ — Centre · Top · Bottom, stored with the image because it belongs to the picture and not to the section, ${b('and offered in the Image Picker’s popover')} rather than hidden. A17’s call, carried; the reachability is this pass’s correction.`
    ]
  },
  stateForm(t, s) {
    const g = K.ground(t, 'image');
    const body = stateBody(t, s, { ground:'image', plate:false });
    return `<div style="position:relative;width:100%;background:${t.stripe};border-radius:${g.r}px;overflow:hidden">
      <div style="position:absolute;inset:0;background:${t.dark ? 'rgba(9,8,6,.62)' : 'rgba(35,32,25,.45)'}"></div>
      <div style="position:relative;padding:18px;box-sizing:border-box">${body}</div></div>`;
  },
  controls: {
    name: 'Cover', n: 6, count: 'SIX',
    sub: 'The form over a photograph.',
    rows: [
      K.seg('Cover height', ['Compact 480', 'Comfortable 620', 'Tall 760'], 1, 'Minimum height of the picture band. ' + b('The form’s own height sets the floor') + ' — a 480 cover with a name field and a legal line is 520 tall and the control gives way to the content ⚑.'),
      K.seg('Scrim', ['Light 30', 'Medium 45', 'Heavy 60'], 1, 'A flat wash of the pack’s text colour. ' + b('Never a gradient, never black') + ' ⚑ — A20·13’s rule.'),
      K.seg('Alignment', ['Centred', 'Left'], 0, 'Left pins the form to the content box’s left edge, which suits a photograph with a subject on its right.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name. Email only by default ⚑.'),
      K.seg('Legal line', ['Show', 'Hide'], 0, '13 px at 80 % of the carried white, under the button.'),
      K.sel('Account band', 'Picture band 200', b('Picture band 200 · No picture.') + ' What /account/ does with the image ⚑. There is no “rows over the picture” value — it is unreadable, and this is the control that says so.')
    ],
    settles: [
      `${b('No form-width control')} ⚑ — 460 at every width above 767 and full width below it. The photograph is the variable in this design; the form must not be.`,
      `${b('Scrim is three named values and no custom one')} ⚑. A per-site opacity slider is how a page ends up with white text at 4:1 over a pale sky. The three values were each checked against the striped placeholder’s lightest band.`,
      `${b('The Account band control exists because the route changes the arrangement')} ⚑, and a user needs to see that decision rather than discover it. It is the only control in A30 that applies to one route only.`
    ]
  },
  respCap: 'TABLET 834 · COVER FULL BLEED, FORM 430 · MOBILE 390 · COVER 560 TALL, FORM FULL WIDTH',
  tabletLabel: '834 · cover full bleed · form 430 · padding 80',
  mobileLabel: '390 · cover 560 min · form full width · scrim held at 45',
  mobileAccountLabel: '390 · /account/ · PICTURE BAND 150 · ROWS STACKED BELOW',
  respNote: `${b('The cover never collapses')} ⚑ — it is full bleed at every width and only its height and the form’s width change. ${b('The scrim value does not step down at 390')} ⚑: a smaller picture is more likely to be busy, not less. ${b('The account band steps 200 → 200 → 150')}, and its name drops from 30 to 24.`,
  darkNote: `${b('The scrim deepens rather than inverting')} ⚑ — A20·13’s rule and this project’s dark rule agreeing: the wash goes to 62 % of the pack’s dark ground, ${code('rgba(9,8,6,.62)')}, and ${b('the white over it stays white')}. The field, button and hairline derivations are unchanged, because they are derived from the carried white and not from the mode.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The form over a full-bleed photograph under a warm scrim, with every colour derived from the carried white. On /account/ the photograph becomes a 200 px band above rows on the page ground.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · image · none · background · the form over a photograph')}<br><span style="color:#6B6459">Ground ${code('image')} and media ${code('background')} — the picture is the ground, which is what separates this from 7 Image Split, where the picture is a column. Containment ${code('none')}.</span>`),
    K.specRow(3, 'Archetype', 'form. Two departures: ' + b('no section padding') + ' (the cover carries it) and ' + b('a different arrangement on /account/') + ' ⚑ — a route change, not a width change.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} cover full bleed at 620 min, inner 96, form 460 centred, heading 40, account band 200. ${b('834')} inner 80, form 430. ${b('≤ 767')} cover 560 min, inner 64, form full width, heading 28, account band 150 ⚑.`),
    K.specRow(5, 'Content fields', `As 1 Centred, plus ${code('image')} ${b('image req')} ⚑ ≥ 2,400 px · ${code('imageAlt')} text opt 120 ch — ${b('an empty alt is a decorative cover and is allowed')} ⚑ · ${code('imageFocus')} enum opt (Centre · Top · Bottom), ${b('a field and not a control')} ⚑. ${b('The one required field in A30.')}`)
  ], [
    K.specRow(6, 'Controls', 'Cover height (Compact 480 · Comfortable 620 · Tall 760) · Scrim (Light 30 · Medium 45 · Heavy 60) · Alignment (Centred · Left) · Fields · Legal line (Show · Hide) · Account band (Picture band 200 · No picture). Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred for members and tiers. ${b('The image is authored, never queried')} ⚑ — there is no post feature image to fall back to on a members page, which is why the field is required rather than optional.`),
    K.specRow(8, 'Empty state', `${b('No image → the design hands off to 1 Centred')} ⚑, drawn in place, flagged in the editor, invisible on the site. ${b('The user’s chosen design is never silently changed')} ⚑. No blurb → the stack closes up. Free and comped members drop rows as in 1 Centred.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM),
    K.specRow(10, 'Accessibility notes', `${code('h1')} over the scrim at 45 % measures 8.9:1 against the placeholder’s lightest band ⚑; the 80 % muted line measures 6.4:1. ${code('<img alt>')} authored, or ${code('alt=""')} where decorative and the photograph carries no information. ${b('The scrim is a real element, not a filter')} ⚑, so the text is never affected by it. Focus ring is the carried white at 2 px on a 4 px offset.`),
    `${b('Flagged ⚑')} The 2,400 px minimum is invented ⚑. The three scrim values are checked against the striped placeholder rather than a real photograph — ${b('re-check against a real cover before build')}. The /account/ band height of 200 is invented ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 7 · Image Split
// ═══════════════════════════════════════════════════════════════════════
const d7 = {
  n: 7, name: 'Image Split',
  rail: 'A30 MEMBERS PAGES · DESIGN 7 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The form in a column on the page ground and a photograph running from the gap to the viewport’s edge. The picture is a column here, not a ground, which is the whole difference from 6 Cover.',
    'It is the design for a publication whose membership page has one good photograph and text that has to stay readable on the page’s own ground.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · TEXT COLUMN 560 ON A 72 MARGIN · PICTURE 768 TO THE EDGE',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const role = (o || {}).role;
    const s = K.G(w);
    if (role === 'account') {
      const inner = `<div style="width:${w === 1440 ? 760 : w === 834 ? 640 : 350}px">${accountBlock(g, w, { labW:w === 1440 ? 168 : 140, max:560 })}</div>`;
      return P.stdWrap(t, w, inner, { role:'account', extra:'NO PICTURE ON /ACCOUNT/ ⚑ · A SUMMARY BESIDE A PHOTOGRAPH READS AS AN ADVERT' });
    }
    if (w === 390) {
      const pic = `<div style="width:100%;height:200px;background:${t.stripe};display:flex;align-items:flex-end;padding:10px;box-sizing:border-box">${mono(K.ground(t, 'image'), 'PICTURE ABOVE THE FORM AT ≤ 767 · 16:9 CROP ⚑')}</div>`;
      const form = `<div style="padding:0 ${s.m}px"><div style="height:40px"></div>
        ${pageHead(g, w, { measure:350, max:350, hSize:28 })}${K.gap(24)}
        ${K.formBlock(t, g, { state:'typed', full:true, legalMax:350 })}<div style="height:${s.pad}px"></div></div>`;
      return P.bleedWrap(t, w, pic + form, { role:'signup', after:0, label:'THE PICTURE IS ON TOP AT ≤ 767 · 200 TALL, FULL BLEED ⚑' });
    }
    const textW = w === 1440 ? 560 : 400;
    const inner = `<div style="display:flex;align-items:stretch;gap:${w === 1440 ? 40 : 32}px">
      <div style="width:${s.m + textW}px;flex-shrink:0;padding:${s.pad}px 0 ${s.pad}px ${s.m}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center">
        ${pageHead(g, w, { measure:textW, max:textW, hSize:w === 1440 ? 40 : 32 })}${K.gap(26)}
        ${K.formBlock(t, g, { state:'typed', full:true, legalMax:textW })}
        ${K.gap(24)}${hair(g)}${K.gap(16)}
        ${K.benefitList(g, { n:3, gap:9, fs:14, tone:'muted', pack:PK })}</div>
      <div style="flex:1;min-height:${w === 1440 ? 640 : 560}px;background:${t.stripe};display:flex;align-items:flex-end;padding:12px;box-sizing:border-box">${mono(K.ground(t, 'image'), `PICTURE COLUMN · ${w - s.m - textW - (w === 1440 ? 40 : 32)} WIDE · BLEEDS TO THE VIEWPORT EDGE ⚑`)}</div></div>`;
    return P.bleedWrap(t, w, inner, { role:'signup', after:0, label:'THE TEXT COLUMN KEEPS THE PAGE MARGIN · THE PICTURE TAKES EVERYTHING RIGHT OF THE GAP ⚑' });
  },
  primaryNote: `A22·6’s image split, carried and re-proportioned: ${b('the text column keeps the page’s own 72 margin and its 560 measure')}, and ${b('the picture takes everything right of the 40 gap — 768 at this width')} ⚑. The picture is ${b('a column with no scrim and no text on it')} ⚑, so it needs no derived colours and no contrast check; the form is on the page ground where every other A30 form is.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · NO PICTURE · THE ROWS ON A 760 COLUMN',
  accountNote: `${b('The picture does not appear on /account/')} ⚑ — a membership summary beside a photograph reads as an advert for something the reader has already bought. The route falls back to a left-aligned 760 column on the page ground, and the boundary strip on the frame says so. ${PORTALROW}`,
  accountStatesNote: `${b('No picture in any of the three')} ⚑, so the account states are 1 Centred’s exactly — left-aligned rather than centred. Stated here rather than left to be inferred, because a design that drops its defining element on one route has to say what is left.`,
  statesNote: `${b('The states are the text column’s')} ⚑ and the picture column is unaffected: at 1440 it holds its 768 and its full height while the form beside it swaps state. ${b('That is the difference the split buys')} — 6 Cover’s picture is behind every state, and this one is beside them.`,
  extraTile: SETTLE_STATES,
  stateForm(t, s) { return stateBody(t, s, { ground:'page' }); },
  controls: {
    name: 'Image Split', n: 7, count: 'SIX',
    sub: 'The form beside a picture column.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'Above and below the text column: 64 · 96 · 132. ' + b('The picture always matches the column’s full height') + ' ⚑.'),
      K.seg('Picture side', ['Right', 'Left'], 0, 'Which side bleeds to the edge. ' + b('At ≤ 767 the picture is above the form at both values') + ' ⚑.'),
      K.sel('Text column', 'Medium 560', 'Narrow 480 · Medium 560 · Wide 640, plus the page margin. The picture takes the rest ⚑.'),
      K.seg('Picture crop', ['Fill the column', 'Sixteen by nine'], 0, 'Fill matches the text column’s height whatever it is; 16:9 fixes the ratio and centres it. ' + b('16:9 is what ≤ 767 uses at both values') + ' ⚑.'),
      K.seg('Included list', ['Show', 'Hide'], 0, 'Three lines under a hairline in the text column.'),
      K.seg('Fields', ['Email only', 'Name and email'], 0, 'Ghost’s optional name. Email only by default ⚑.')
    ],
    settles: [
      `${b('No scrim control, because nothing is over the picture')} ⚑. That is the design’s advantage over 6 Cover and the reason both exist: one is legible on any photograph, the other needs a good one.`,
      `${b('The picture is not optional')} in the arrangement but it is optional in the data ⚑ — with none, the text column takes the content box and the design becomes 2 Split Pitch without its case. ${b('No hand-off')}: unlike 6 Cover, this design still works, so it renders itself.`,
      `${b('Six controls and no seventh.')} Cut: an image-focus value (a field, not a control ⚑), a caption, and a “picture on /account/” value — that decision is made and is on the frame rather than in the panel.`
    ]
  },
  respCap: 'TABLET 834 · SPLIT HELD, TEXT 400 · MOBILE 390 · PICTURE ON TOP AT 200, FORM BELOW',
  tabletLabel: '834 · text 400 + margin · picture 362 · split held ⚑',
  mobileLabel: '390 · picture 200 on top · form on 350 · list hidden',
  mobileAccountLabel: '390 · /account/ · NO PICTURE · STACKED ROWS',
  respNote: `Split’s ladder with one departure and one addition. ${b('The split is held at 834')} ⚑ rather than collapsing at 833 — a 400 px form column and a 362 px picture both still work, and stacking here would waste the tablet’s width. ${b('At ≤ 767 the picture goes on top at 200 px in a 16:9 crop')} ⚑ and ${b('the included list is hidden')}, its stated destination being 1 Centred’s treatment on the next design up. Everything else is Split’s ladder.`,
  darkNote: `A27’s step, and ${b('the picture column is the only element that needs no re-tune')} ⚑ — it is a photograph, and in the frames a striped placeholder whose dark values are the pack’s own. The hairline under the form and the muted list step to ${code('#332E27')} and ${code('#A79E8F')}; ${b('the accent button holds')} at 4.9:1.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The form and a three-line list in a 560 column on the page ground, with a photograph filling everything right of the 40 px gap to the viewport edge. No text sits on the picture.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · page · none · edge · a picture column to the page edge')}<br><span style="color:#6B6459">Media ${code('edge')} — the picture bleeds past the content box on one side only; ${code('background')} would be 6 Cover and ${code('right')} would be a picture inside the box. Ground ${code('page')}, which is why the form needs no derived colours ⚑.</span>`),
    K.specRow(3, 'Archetype', 'split. Two departures: ' + b('the split is held at 834 rather than collapsing at 833') + ' ⚑, and ' + b('the picture is absent on /account/') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} margin 72 + text 560 + gap 40 + picture 768; picture height = the column’s; padding 96. ${b('834')} margin 40 + text 400 + gap 32 + picture 362; padding 80. ${b('≤ 767')} picture on top, full bleed, 200 tall at 16:9; form on 350; ${b('included list hidden')} ⚑; padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Centred, plus ${code('image')} ${b('opt')} ⚑ ≥ 1,600 px · ${code('imageAlt')} opt 120 ch · ${code('imageFocus')} enum opt. ${b('Optional here and required in 6 Cover')} — the same field, two obligations, which is why the limit lives on the design and not on the field ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Picture side (Right · Left) · Text column (Narrow 480 · Medium 560 · Wide 640) · Picture crop (Fill the column · Sixteen by nine) · Included list (Show · Hide) · Fields. Then the shared source group.'),
    K.specRow(7, 'Data', `As 1 Centred. ${b('No picture → the text column takes the content box')} and the page is 2 Split Pitch without its case column ⚑; no hand-off, because the design still reads. Tiers read and not drawn.`),
    K.specRow(8, 'Empty state', `No image → as above, and the editor flags it without changing the design ⚑. No benefits → the hairline and list go. On /account/ the picture is absent by rule, which is not an empty state ⚑.`),
    K.specRow(9, 'Behaviour module', MEMBERFORM),
    K.specRow(10, 'Accessibility notes', `${code('h1')} in the text column; the picture is a sibling ${code('<img>')} with authored alt, or ${code('alt=""')} where decorative. ${b('DOM order is text then picture at both Picture side values')} ⚑ — the form is what the page is for, and at ≤ 767 the picture’s visual position above it is CSS order, not document order ⚑. Focus order unaffected by the flip.`),
    `${b('Flagged ⚑')} Holding the split at 834 is this design’s own call, against the archetype’s ladder ⚑. Dropping the picture on /account/ is invented ⚑. The 1,600 px minimum is invented ⚑.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 8 · Tiers
// ═══════════════════════════════════════════════════════════════════════
const tierStrip = (t, kinds) => {
  const g = K.ground(t, 'page');
  const cell = (label, inner) => tile({ w:652, bg:'#FFFFFF', border:'#EBE5DB', label, body:`<div style="min-height:250px">${inner}</div>` });
  const card = (tier, o) => K.tierCard(t, g, Object.assign({ tier, w:286, pad:18, priceSize:30, benN:2, pack:PK }, o || {}));
  return [
    cell('NO PAID TIERS · THE CARDS GO AND THE FORM IS THE PAGE ⚑', `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${K.formBlock(t, g, { state:'typed', full:true, legal:false })}${mono(g, 'GHOST WITH STRIPE UNCONNECTED HAS ONE TIER: FREE · THE DESIGN RENDERS 1 CENTRED’S COLUMN ⚑')}</div>`),
    cell('ONE PAID TIER · TWO CARDS, CENTRED, NOT STRETCHED ⚑', `<div style="display:flex;gap:16px;justify-content:center">${card(TIERS[0])}${card(TIERS[1], { mark:'Most read' })}</div>`),
    cell('THREE · THE ARRANGEMENT THE DESIGN IS DRAWN FOR', `<div style="display:flex;gap:10px">${K.TIERS.map(tr => card(tr, { w:196, pad:14, priceSize:24, benN:1, blurb:false })).join('')}</div>`),
    cell('FOUR OR MORE · THE CARDS BECOME ROWS ⚑ (A7·3’S STACK)', `<div style="display:flex;flex-direction:column;width:100%">${K.TIERS.concat([{ name:'Patron plus', m:'$28', y:'$280', blurb:'Everything, and two copies of the quarterly to give away.', bens:[], cta:'Choose' }]).map(tr => K.tierRow(t, g, { tier:tr, dens:12, measure:300, pack:PK })).join('')}</div>`)
  ].join('');
};
const d8 = {
  n: 8, name: 'Tiers',
  rail: 'A30 MEMBERS PAGES · DESIGN 8 OF 13 · PAPER PACK · SIX CONTROLS + THE MEMBERSHIP SOURCE',
  paras: [
    'The publication’s tiers as three cards above a hairline, with the free option as an email row beneath it. The only design in A30 that draws what Ghost’s tiers say, and the only one with a monthly-yearly toggle.',
    'Every paid card’s button opens Portal’s checkout: the theme draws the price, the benefits and the button, and Stripe’s side of the transaction is not themeable. The boundary is on the frame.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · /signup/ · THREE CARDS AT 400 · 48 GAPS · PERIOD TOGGLE ABOVE',
  accountGround: 'page',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const role = (o || {}).role;
    const s = K.G(w);
    const period = 'monthly';
    const cards = () => w === 1440
      ? `<div style="display:flex;gap:48px;align-items:stretch">${TIERS.map((tr, i) => K.tierCard(t, g, { tier:tr, w:400, period, pack:PK, mark:i === 1 ? 'Most read' : '', benN:3 })).join('')}</div>`
      : `<div style="display:flex;flex-direction:column;width:100%">${TIERS.map(tr => K.tierRow(t, g, { tier:tr, period, pack:PK, dens:w === 390 ? 16 : 20, measure:w === 834 ? 430 : 190 })).join('')}</div>`;
    if (role === 'account') {
      const inner = `<div style="display:flex;flex-direction:column">
        ${accountBlock(g, w, { labW:w === 1440 ? 168 : (w === 390 ? 0 : 140), max:600 })}
        ${K.gap(w === 390 ? 26 : 34)}${hair(g)}${K.gap(w === 390 ? 20 : 26)}
        ${K.eyebrow(g, 'The other tiers', PK)}${K.gap(16)}
        ${w === 1440
          ? `<div style="display:flex;gap:48px;align-items:stretch">${TIERS.map(tr => K.tierCard(t, g, { tier:tr, w:400, period, pack:PK, current:tr.name === MEMBER.tier, mark:tr.name === MEMBER.tier ? 'Your plan' : '', benN:2, ctaVariant:tr.name === MEMBER.tier ? 'quiet' : 'outline', foot:tr.name === MEMBER.tier ? 'CURRENT PLAN · NOTHING TO PRESS ⚑' : 'CHANGE PLAN OPENS PORTAL ↗' })).join('')}</div>`
          : `<div style="display:flex;flex-direction:column;width:100%">${TIERS.map(tr => K.tierRow(t, g, { tier:tr, period, pack:PK, dens:16, measure:w === 834 ? 430 : 190 })).join('')}</div>`}
        ${K.gap(14)}${mono(g, 'DISPLAY-ONLY · EVERY BUTTON IN THIS ROW OPENS PORTAL’S PLAN PICKER ⚑')}</div>`;
      return P.stdWrap(t, w, inner, { role:'account' });
    }
    const inner = `<div style="display:flex;flex-direction:column">
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center">
        ${pageHead(g, w, { align:'center', measure:w === 390 ? 350 : 620, max:w === 390 ? 350 : 620, hSize:w === 390 ? 28 : 40 })}
        ${K.gap(24)}${K.periodToggle(g, { period, pack:PK })}
        ${K.gap(8)}${mono(g, 'YEARLY SHOWS THE YEARLY PRICE ON EVERY CARD · price-toggle ⚑')}</div>
      ${K.gap(w === 390 ? 26 : 36)}
      ${cards()}
      ${K.gap(w === 390 ? 28 : 36)}${hair(g)}${K.gap(w === 390 ? 22 : 26)}
      <div style="display:flex;flex-direction:${w === 390 ? 'column' : 'row'};gap:${w === 390 ? 16 : 40}px;align-items:${w === 390 ? 'stretch' : 'flex-start'};justify-content:space-between">
        <div style="display:flex;flex-direction:column;gap:6px;max-width:420px">
          <span style="font-family:${PK.head};font-size:19px;font-weight:700;color:${g.text}">Only want the free letter?</span>
          <span style="font-size:14px;line-height:1.55;color:${g.muted};font-family:${PK.body}">The Friday letter and two open pieces a month, at no cost.</span></div>
        <div style="width:${w === 390 ? '100%' : '460px'}">${K.formBlock(t, g, { state:'empty', full:true, inline:w !== 390, cta:'Sign up free', legal:false, signin:true, note:false })}</div></div></div>`;
    return P.stdWrap(t, w, inner, { role:'signup', extra:'PORTAL OWNS EVERY PAID BUTTON HERE ⚑' });
  },
  primaryNote: `A7·1’s tier card, carried verbatim — ${b('name, price at 38 in the heading font, blurb, three benefits, a full-width button, and one marked card')} ⚑. ${b('The mark is text, not a ribbon')}: 12 px accent beside the tier name, which is the design’s single accent use. ${b('The free option is a row beneath the hairline rather than a fourth card')} ⚑ — free is not a tier a reader chooses between, it is what they get if they choose none.`,
  accountCap: 'DESKTOP 1440 · LIGHT · /account/ · THE ROWS, THEN THE THREE TIERS WITH THE MEMBER’S OWN MARKED',
  accountNote: `${b('The account page shows the tiers again, with the member’s own marked “Your plan” and its button inert')} ⚑. The other two carry Change plan, and ${b('every one of those buttons opens Portal’s plan picker')} — the theme cannot price, prorate or switch a subscription. ${PORTALROW}`,
  accountStatesNote: `${b('A free member sees the paid cards with live buttons')}; a paid member sees their own marked and inert; ${b('a complimentary member sees the cards with no buttons at all')} ⚑ — a comped plan is a gift from the desk and offering to “change” it would start a checkout the publication did not intend. Cancelled-but-running shows Resume on the member’s own card.`,
  statesNote: `${b('The tier cards are unaffected by the form’s state')} ⚑ — they are links to Portal, not part of the form, so sent, expired and invalid all belong to the free row at the foot. ${b('The signed-in state is the one exception')}: it replaces the whole free row with the membership summary.`,
  extraSection: (function () {
    return K.section('A30-8 tier counts', K.cap('HOW MANY TIERS GHOST GIVES · 0 · 1 · 3 · 4 OR MORE · THE USER CANNOT ADD OR REMOVE ONE ⚑') +
      `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${tierStrip(L)}</div>` +
      K.note(`${b('Tiers are Ghost objects and the section has no Add or Remove control for them')} ⚑ — they are created in Ghost, and the sidebar’s Tiers row only chooses ${b('visible only')}, ${b('all')} or ${b('off')}. ${b('Order is Ghost’s')}: the tiers’ own sort order, ascending by price, and ${b('the section cannot reorder them')} ⚑. Which fields each card draws: name, price for the chosen period, description, up to three benefits, and the button. ${b('A tier with no description draws none and the card closes up')}; ${b('a tier with no benefits draws the button directly under the price')} ⚑, and the card is shorter than its neighbours rather than padded to match.`));
  })(),
  stateForm(t, s) { return stateBody(t, s, { ground:'page' }); },
  controls: {
    name: 'Tiers', n: 8, count: 'SIX',
    sub: 'The tiers as cards, with a free row beneath.',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132. 80 at 834, 64 at 390.'),
      K.seg('Period toggle', ['Monthly and yearly', 'Monthly only', 'Yearly only'], 0, 'Shows the toggle and both prices, or fixes one. ' + b('Monthly only hides the toggle and the module with it') + ' ⚑.'),
      K.seg('Card treatment', ['Raised', 'Flat', 'Hairline rows'], 0, 'Raised is A7·1’s card with the warm shadow; Hairline rows is A7·3’s stack, and ' + b('it is what every value resolves to at ≤ 833') + ' ⚑.'),
      K.seg('Marked tier', ['Middle', 'Highest', 'None'], 0, '12 px accent text beside the name. ' + b('Never a colour change to the whole card') + ' ⚑ — a filled card on a warm ground reads as disabled.'),
      K.seg('Benefits per card', ['Two', 'Three', 'All'], 1, 'From the tier’s own benefit list in Ghost. ' + b('All is capped by the longest tier and the cards match its height') + ' ⚑.'),
      K.seg('Free row', ['Show', 'Hide'], 0, 'The email row under the hairline. ' + b('Hidden where the publication has no free tier') + ' — Ghost always has one, so this is an editorial choice ⚑.')
    ],
    settles: [
      `${b('No Add tier and no Remove tier')} ⚑ — tiers are Ghost objects with their own prices and benefits, and a section that could delete one would be deleting a product. The Tiers row in the source group chooses which are shown, and that is all.`,
      `${b('No per-card control')} ⚑. Marked tier, Benefits per card and Card treatment each write one value onto the section and the stylesheet reads it for every card. ${b('Styling one card differently is not expressible')}, and asking for it is asking for a second design.`,
      `${b('No price, currency or interval control')} ⚑ — all three come from Ghost and Stripe. ${b('The theme renders what Ghost says and nothing else')}, which is also why there is no “from £X” value: a computed price a publication cannot see in Ghost is a support ticket.`
    ]
  },
  respCap: 'TABLET 834 · CARDS BECOME HAIRLINE ROWS · MOBILE 390 · ROWS TIGHTEN, FREE ROW STACKS',
  tabletLabel: '834 · cards → rows at 833 ⚑ · toggle centred · free row inline',
  mobileLabel: '390 · rows at 16 px · price right-aligned · free row stacked',
  mobileAccountLabel: '390 · /account/ · ROWS, THEN THE TIERS AS ROWS',
  respNote: `grid-of-N’s ladder with one departure: ${b('three cards do not become two at 833, they become rows')} ⚑ — A7·3’s stack — because two 353 px cards and one orphan below them is the worst of both arrangements. ${b('The row keeps name, blurb, price and button on one line at 834')} and ${b('drops the blurb to a second line at 390')} ⚑. The period toggle stays 44 px and centred at every width.`,
  darkNote: `A27’s step. ${b('The cards go flat and the hairline carries them')} ⚑, so at 834 and below light and dark are the same arrangement. ${b('The marked tier’s accent text re-checks at 5.6:1')} on ${code('#211D17')} ⚑ and holds; ${b('the price’s tabular numerals are the one place a pack’s heading font is used at a size where its numeral width matters')} — Georgia’s are proportional and the figure is set in tabular-nums to stop the toggle shifting the column ⚑.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'Ghost’s tiers as three cards with a monthly-yearly toggle above them and the free option as an email row beneath a hairline. The only design in A30 that draws tier data.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · few · none · tier cards above the form')}<br><span style="color:#6B6459">Item-count ${code('few')} — the row is designed for two to three and becomes rows at four ⚑. Containment ${code('none')}: ${b('the cards are the items’ geometry, not the section’s')} — A21·2’s rule, and the slot most easily got wrong.</span>`),
    K.specRow(3, 'Archetype', 'grid-of-N. One departure: ' + b('3 → rows, never 3 → 2') + ' ⚑ at 833.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} three 400 cards with 48 gaps in the 1,296 box, toggle centred above, free row inline at 460, padding 96. ${b('834')} cards become hairline rows at 20 px, blurb on one line, padding 80. ${b('≤ 767')} rows at 16 px, blurb wraps, price above the button, free row stacked, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Centred, plus ${code('tierNote')} opt 90 ch · ${code('freeRowHeading')} opt 40 ch · ${code('freeRowText')} opt 120 ch · ${code('freeCtaLabel')} opt 24 ch, default “Sign up free” · ${code('periodLabels')} 2 × 12 ch, defaults “Monthly” and “Yearly”. ${b('Tier names, prices, descriptions and benefits are Ghost’s and are not fields')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Padding · Period toggle (Monthly and yearly · Monthly only · Yearly only) · Card treatment (Raised · Flat · Hairline rows) · Marked tier (Middle · Highest · None) · Benefits per card (Two · Three · All) · Free row (Show · Hide). Then the shared source group.'),
    K.specRow(7, 'Data', `${code('#get "tiers"')} — name, ${code('monthly_price')}, ${code('yearly_price')}, currency, description, ${code('benefits')}. ${b('0 paid tiers')} → cards and toggle both go and the page is 1 Centred’s column ⚑. ${b('1')} → two cards centred, not stretched ⚑. ${b('2–3')} → the drawn arrangement. ${b('4 or more')} → rows at every width ⚑. ${b('Order is Ghost’s and is not selectable')} ⚑. A tier with no description or no benefits draws a shorter card, never a padded one ⚑.`),
    K.specRow(8, 'Empty state', `No tiers → as above. No benefits on a tier → the button sits under the price. ${b('No “contact us” card and no placeholder tier')} ⚑. On /account/ a comped member’s cards carry no buttons ⚑.`),
    K.specRow(9, 'Behaviour module', `${b('member-form')} and ${b('price-toggle')} — ${b('the only design in A30 with two')} ⚑. Both edit-safe; the toggle’s resting state is Monthly. ${b('price-toggle, quoted:')} “${P.plain('price-toggle')}” ${b('member-form, quoted:')} “${P.plain('member-form')}”`),
    K.specRow(10, 'Accessibility notes', `${code('h1')} above the toggle; ${b('each card’s name is an h2 and the card is not a link')} ⚑ — the button is. The toggle is a ${code('role="radiogroup"')} of two radios with a visible label, ${b('not a switch')} ⚑, because both states are named and neither is “off”. Prices are ${code('<span>')}s inside the card’s accessible name so a screen reader hears “Member, six dollars a month, choose Member”. The marked tier’s accent text is announced as part of the name ⚑. Cards are 44 px-target compliant; at ≤ 833 the whole row is not the target, the button is ⚑.`),
    `${b('Flagged ⚑')} “Most read” as the mark’s wording is invented ⚑. Prices, benefit strings and the 3-then-rows threshold are fixtures and a judgement ⚑. ${b('Whether Ghost exposes a tier’s benefit list to a theme in the shape drawn here needs verifying before build')} ⚑.`
  ]]
};

globalThis.A30D = (globalThis.A30D || []).concat([d5, d6, d7, d8]);
})();
