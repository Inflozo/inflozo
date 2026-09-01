// A31 designs 5–7 · Panel · Contrast Band · Cover
globalThis.A31D2 = (function () {
const K = globalThis.A31LIB, P = globalThis.A31PAGE;
const { L, D, MONO, PK, b, code, gap, hb, PAGE } = K;
const R = K.specRow;
const S = a => [a.slice(0, 5), a.slice(5)];
const FLAGGED = extra => `${b('Flagged ⚑')} ${extra}`;
const SEARCH_SETTLE = `${b('Search is drawn on the 404 only')} ⚑ — A23’s field over a real ${code(hb('form action="/search/" method="get"'))}. ${b('Never on a 500')}, never on the gate.`;

/* ── 5 · Panel ────────────────────────────────────────────────────────── */
const d5 = {
  n:5, name:'Panel', gnd:'surface',
  rail:'A31 ERROR AND UTILITY · DESIGN 5 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'One raised surface plane across the whole content box, with the message on the left of it and the recovery links in a column at the right. The plane is the page’s only object, and the page ground shows above and below it rather than around it.',
    'It is the widest of the calm arrangements and the one that holds a long recovery list without stacking anything — the list has its own column instead of queueing under the button.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · ONE SURFACE PLANE ACROSS THE 1,296 BOX · LINKS IN THE RIGHT COLUMN',
  frameOpt:(kind) => kind === 'e404' ? { searchOn:true } : {},
  body(t, w, o) {
    const g = K.ground(t, 'surface');
    const kind = o.kind;
    const pad = w === 1440 ? 56 : w === 834 ? 40 : 24;
    const measure = w === 1440 ? 620 : w === 834 ? 480 : 302;
    const left = K.block(t, g, w, { kind, measure, codeStyle:'chip', search:true, links:false,
      row:w !== 390, formState:o.formState, formW:w === 390 ? undefined : 360, searchW:w === 1440 ? 460 : undefined });
    const right = (kind === 'e404' && w !== 390)
      ? `<div style="width:${w === 1440 ? 300 : 210}px;flex-shrink:0;border-left:1px solid ${g.border};padding-left:${w === 1440 ? 32 : 24}px">${K.linkList(g, { style:'list' })}</div>`
      : '';
    const stackedLinks = (kind === 'e404' && w === 390)
      ? gap(24) + `<div style="width:100%;height:1px;background:${g.border}"></div>` + gap(18) + K.linkList(g, { style:'list' })
      : '';
    const inner = right
      ? `<div style="display:flex;gap:${w === 1440 ? 48 : 32}px;align-items:flex-start;width:100%"><div style="flex:1;min-width:0">${left}</div>${right}</div>`
      : `<div style="width:100%">${left}${stackedLinks}</div>`;
    return `<div style="width:100%;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;${t.dark ? '' : `box-shadow:${t.shadow};`}padding:${pad}px;box-sizing:border-box">${inner}</div>`;
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'surface');
    return `<div style="width:100%;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r + 4}px;padding:24px;box-sizing:border-box">${
      K.block(t, g, 834, { kind, measure:500, codeStyle:'chip', search:kind === 'e404', links:false,
        row:true, formState:o.formState, formW:320 })}</div>`;
  },
  note404:`${b('The plane fills the content box and stops there')} ⚑ — 1,296 on the 72 margin, never full-bleed, which is what keeps it a panel rather than 6’s band. ${b('The links get a column with a hairline down its left edge')} ⚑ at 300 wide, so a list of six does not push the button down. ${b('The plane’s height is its content’s')}; it is not stretched to the viewport by default.`,
  note500:`${b('The plane stays and the right column goes')} ⚑ — there is nothing to put in it, and an empty 300 px column beside a paragraph is worse than no column. ${b('The left side keeps its measure')} rather than expanding into the space, because a 940-wide sentence is not a sentence.`,
  noteGate:`${b('The form sits in the left column at 360 and the right column is absent')} ⚑. A plane this wide with a small form on it is the arrangement’s weakest case, ${b('and the panel says so')}: at Panel height = Content the plane is 280 tall and reads deliberate; stretched to the viewport it reads empty.`,
  noteStates:`${b('The message is above the label inside the plane')}, and ${b('the plane’s depth does not change')} ⚑. ${b('Nothing about a wrong password is a property of the container')}.`,
  noteFocus:`${b('The ring is drawn against the surface token')} ⚑, as 3 Card’s is. One accent, on the button. ${b('The link column’s hover is the underline alone')} — no fill, because the plane is already a fill.`,
  capResp:'TABLET 834 · PLANE 754 · LINK COLUMN 210 · MOBILE 390 · THE COLUMN GOES UNDER THE BUTTON ⚑',
  labelTablet:'834 · plane 754 · pad 40 · measure 480 · link column 210',
  labelMobile:'390 · plane 350 · pad 24 · links stacked under a hairline',
  labelMobileGate:'390 · THE GATE · the plane at 350, the form full width',
  noteResp:`${b('At ≤ 767 the right column moves under the button')} ⚑ — under a hairline, in the same list treatment, which is the destination the desktop hairline already implies. ${b('The plane keeps its radius, its hairline and its padding floor of 24')}, and ${b('it does not go full-bleed at the last breakpoint')} ⚑: a plane that touches both edges is a band, and that is design 6.`,
  noteDark:`${b('Depth forced to Flat')} ⚑ — the plane is ${code('#211D17')} on ${code('#171511')} with a ${code('#332E27')} hairline. ${b('The link column’s divider is the same token')}, so in dark the panel has exactly two lines in it and both are the same value.`,
  controls:{
    name:'Panel', n:5, count:'SIX', sub:'One raised plane across the content box.',
    rows:[
      K.seg('Panel height', ['Content', 'Fill the viewport'], 0, `${b('Content')} is the plane’s own height ⚑ · ${b('Fill')} stretches it between header and footer and centres the block inside. ${b('Fill is the value to avoid on the gate')} — the help text says so.`),
      K.seg('Depth', ['Raised', 'Flat'], 0, 'Warm md shadow with a hairline, or the hairline alone. Forced to Flat in dark ⚑.'),
      K.seg('Block position', ['Flush left', 'Centred'], 0, 'Inside the plane. Centred keeps the link column at the right and centres the text against the remaining width ⚑.'),
      K.seg('Recovery links', ['Beside the text', 'Under the text', 'Hide'], 0, `${b('Beside')} is the right column with its hairline — the design’s reason to exist ⚑. ${b('Under')} is 1 Centred’s treatment inside the plane. ${b('Below 767 both resolve to Under')} ⚑.`),
      K.seg('Code', ['Chip', 'Plain', 'Hidden'], 0, 'As 1 Centred.'),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} At 460 in the left column.`)
    ],
    settles:[
      `${b('The plane’s width is not a control')} ⚑ — it is the content box, and a control that narrowed it would make this 3 Card. ${b('Two designs, one difference, and no panel row may cross it')}.`,
      `${b('Panel height = Fill is offered and is discouraged in its own help text')} ⚑. It is the honest way to handle a value some publications will want on a 404 and nobody should use on the gate.`,
      `${b('Closest neighbours: 3 Card')} (same surface, narrower, on the page ground) ${b('and 2 Split Reason')} (same two-column reading, no plane). ${b('Recovery links = Under and Depth = Flat is the nearest this gets to 3')}, and it is still 1,296 wide.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'One raised surface plane across the content box: message and action on the left, the authored recovery links in a right column behind a hairline. The page ground shows above and below, not around.'),
    R(2, 'Structural descriptor', `${code('stack · none · surface · none · none · one raised plane across the box')}<br><span style="color:#6B6459">${b('Ground ')}${code('surface')}${b(' is the distinction')} ⚑ — the section rests on a raised plane rather than on the page. Containment is ${code('none')}: ${b('the plane is the section’s ground, not a box it sits in')} ⚑, which is the slot most easily got wrong here.</span>`),
    R(3, 'Archetype', 'stack. One departure: the right column moves beneath the button at 767 ⚑ rather than narrowing further.'),
    R(4, 'Responsive rule', `${b('1440')} plane 1,296, padding 56, measure 620, link column 300 behind a hairline, gap 48. ${b('834')} plane 754, padding 40, measure 480, column 210, gap 32. ${b('≤ 767')} plane 350, padding 24, ${b('column under the button behind a horizontal hairline')} ⚑, button and field full width.`),
    R(5, 'Content fields', `As the union, less ${code('image')}. ${b('It is the only design that draws the links as a second column')} ⚑.`),
    R(6, 'Controls', 'Panel height (Content · Fill the viewport) · Depth (Raised · Flat) · Block position (Flush left · Centred) · Recovery links (Beside the text · Under the text · Hide) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide). Then the page source group.'),
    R(7, 'Data', `As 1 Centred. ${b('At 0 links the right column and its hairline leave and the left side keeps its measure')} ⚑. At 6 the column holds and grows downward; ${b('the plane grows with it')}.`),
    R(8, 'Empty state', 'No sentence → the stack closes. No links → no column. On the 500 there is no column by rule ⚑. The plane never renders empty: heading and button always draw.'),
    R(9, 'Behaviour module', P.NONE),
    R(10, 'Accessibility', `Heading is the ${code('h1')}. ${b('The link column is a ')}${code('nav')}${b(' with an accessible name from ')}${code('linksLabel')} ⚑ — it is the only place in A31 where a nav landmark is drawn, and ${b('it is absent on the 500 and the gate')}. Surface-on-page 1.3:1, so the hairline is not optional ⚑.`),
    FLAGGED('The 300 px link column and its hairline are invented. Offering Panel height = Fill while advising against it is a judgement. Naming the link column a nav landmark is this design’s call and should be checked by the build.')
  ])
};

/* ── 6 · Contrast Band ────────────────────────────────────────────────── */
const d6 = {
  n:6, name:'Contrast Band', gnd:'contrast',
  rail:'A31 ERROR AND UTILITY · DESIGN 6 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'The page as one inverted full-bleed band: the contrast token edge to edge, the block centred on it, and every colour in it derived from the band’s carried ink rather than from the pack’s accent. It is the loudest of the ten and the only one that changes what the page is made of.',
    'It is also the one design where the accent is disabled with its ratio shown. Paper’s coral measures 4.0:1 on the dark band, so the button carries the band’s own ink instead — and in dark mode the whole band inverts with the page.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · CONTRAST BAND, FULL BLEED, VIEWPORT HEIGHT · NO ACCENT ⚑',
  frameOpt:() => ({ bleed:true }),
  body(t, w, o) {
    const g = K.ground(t, 'contrast');
    const pad = w === 1440 ? '96px 72px' : w === 834 ? '80px 40px' : '56px 20px';
    const inner = K.block(t, g, w, { kind:o.kind, align:'center', measure:w === 1440 ? 620 : w === 834 ? 560 : 350,
      codeStyle:'chip', search:true, links:true, linkStyle:'row', row:w !== 390, formState:o.formState,
      formW:w === 390 ? undefined : 360, searchW:w === 1440 ? 520 : undefined });
    return `<div style="width:100%;flex:1;background:${g.bg};padding:${pad};box-sizing:border-box;display:flex;align-items:center;justify-content:center">
      <div style="width:100%;display:flex;justify-content:center">${inner}</div></div>`;
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'contrast');
    return `<div style="width:100%;background:${g.bg};border-radius:${g.r}px;padding:28px 24px;box-sizing:border-box">${
      K.block(t, g, 834, { kind, align:'center', measure:520, codeStyle:'chip', search:kind === 'e404',
        links:true, linkStyle:'row', row:true, formState:o.formState, formW:320 })}</div>`;
  },
  note404:`${b('One band, edge to edge, and it is the page')} ⚑ — the header sits on it too, so there is no seam. ${b('Every colour inside is derived from the carried ink')}: muted at 72 %, the hairline at 20 %, the field’s fill at 8 % — A17·7’s derivation, carried verbatim ⚑. ${b('The button is the carried colour with the band’s colour as its label')}, which is the only high-contrast pair available on a band.`,
  note500:`${b('The band is the one design that does not lose anything on a 500')} ⚑ — it draws no image, queries nothing and needs no navigation to look intentional. ${b('A publication that wants one design for all three pages should look here first')}, and the panel says so.`,
  noteGate:`${b('An inverted band is a strong signal for “not for you, yet”')}, which is the gate’s job — and ${b('the field is the 8 % plate with a 20 % hairline')} ⚑, focused to the carried ink rather than the accent. ${b('The lockup’s mark keeps the accent')}: it is a 24 px square, not text, and it is the one accent left on the page ⚑.`,
  noteStates:`${b('On a band the error message is the carried ink on a 12 % plate')} ⚑ with a 1.5 px carried-ink border — the same geometry as the light version with every value derived. ${b('Nothing here is red, and nothing here is the accent')}.`,
  noteFocus:`${b('The focus ring is 2 px of the carried ink at a 4 px offset filled with the band')} ⚑ — not the accent, which on this ground fails. ${b('That is the rule the disabled control value states')}: where a value would fail contrast it is disabled with its ratio shown, never silently allowed.`,
  capResp:'TABLET 834 · BAND UNCHANGED, PADDING 80 · MOBILE 390 · PADDING 56 · THE BAND NEVER COLLAPSES ⚑',
  labelTablet:'834 · band full bleed · padding 80 · measure 560',
  labelMobile:'390 · band full bleed · padding 56 · measure 350',
  labelMobileGate:'390 · THE GATE ON THE BAND · field and button full width',
  noteResp:`${b('A band has nothing to collapse')} ⚑ — it is full-bleed at every width by definition, so the ladder is padding and measure only: 96 · 80 · 56 vertical, 620 · 560 · 350 measure. ${b('At ≤ 767 the block stays centred rather than top-aligning')} ⚑, which is this design’s single departure from the category floor: on a band there is no page ground for it to align to.`,
  capDark:'DESKTOP 1440 · DARK · THE BAND INVERTS WITH THE MODE ⚑ · A LIGHT BAND ON A DARK PAGE',
  darkKind:'e404',
  noteDark:`${b('The band inverts with the mode')} ⚑ — ${code('#EDE7DA')} carrying ${code('#171511')}, so in dark it is the light object on the page and not a darker dark. ${b('Every derived value re-derives from the new carried ink')} and nothing in the markup changes. ${b('The accent is disabled here too')}: ${code('#E0805A')} on ${code('#EDE7DA')} is 2.1:1 ⚑.`,
  controls:{
    name:'Contrast Band', n:6, count:'SIX', sub:'The page as one inverted band. Nothing queried, nothing lifted.',
    rows:[
      K.seg('Band height', ['Fill the viewport', 'Content height'], 0, `${b('Fill')} is the default ⚑ — a band that stops short of the fold shows a strip of page ground under it and reads as a mistake. ${b('Content height')} exists for publications whose footer is part of the design.`),
      K.seg('Alignment', ['Centred', 'Flush left'], 0, 'Centred is the default on a band ⚑ — a full-bleed ground with everything on its left edge reads as an unfinished layout.'),
      K.seg('Button', ['Carried colour', 'Outline', 'Accent'], 0, `${b('Carried colour')} is the band’s ink with the band’s colour as the label ⚑ · ${b('Outline')} is a 1 px carried-ink border. ${b('Accent is disabled: 4.0:1 on this band')} ⚑, and 2.1:1 on the inverted one in dark.`, [2]),
      K.seg('Code', ['Chip', 'Plain', 'Hidden'], 0, 'The chip’s hairline is the derived 20 % line, not the border token ⚑.'),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} On the band the field is the 8 % plate with a 20 % hairline ⚑.`),
      K.seg('Recovery links', ['Show', 'Hide'], 0, 'A wrapping row in the carried ink under a 20 % hairline. Dropped on the 500 ⚑, absent on the gate.')
    ],
    settles:[
      `${b('The accent value is drawn, disabled, with its ratio')} ⚑ — 4.0:1 in light and 2.1:1 in dark. That is this project’s rule for a value that would fail: ${b('shown and struck through, never quietly missing')}, so the user learns why rather than wondering where it went.`,
      `${b('No control changes the band’s colour')} ⚑. It is the ${code('contrast')} token, which is the pack’s, and a band the user could tint is twelve packs’ worth of contrast failures waiting.`,
      `${b('Closest neighbour: 10 Display')}, the other ${code('contrast')} design ⚑ — it differs on archetype (${code('split')}) and on the display numeral. ${b('Set Code = Hidden here and the gap widens')} rather than closing.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'The page as one inverted full-bleed band at viewport height, the block centred on it, every value derived from the band’s carried ink. No accent, no plane, no shadow.'),
    R(2, 'Structural descriptor', `${code('stack · none · contrast · none · none · an inverted full-bleed band')}<br><span style="color:#6B6459">Ground ${code('contrast')} is the claim. ${b('Containment is ')}${code('none')} ⚑ — the band is a ground, not a box; a band the section sat inside would be a card the width of the viewport.</span>`),
    R(3, 'Archetype', `stack. One departure: ${b('the block stays centred at ≤ 767')} ⚑ instead of top-aligning, because on a band there is no page ground to align against.`),
    R(4, 'Responsive rule', `${b('1440')} full bleed, padding 96 · 72, measure 620, field 520. ${b('834')} padding 80 · 40, measure 560, field 460. ${b('≤ 767')} padding 56 · 20, measure 350, ${b('block still centred')} ⚑, field and button full width. ${b('The band never collapses, narrows or gains a margin')} ⚑.`),
    R(5, 'Content fields', `As the union, less ${code('image')} — ${b('an image behind a band is 7 Cover')} ⚑.`),
    R(6, 'Controls', 'Band height (Fill the viewport · Content height) · Alignment (Centred · Flush left) · Button (Carried colour · Outline · ~~Accent~~ disabled, 4.0:1) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide) · Recovery links (Show · Hide). Then the page source group.'),
    R(7, 'Data', `As 1 Centred. ${b('This design’s 500 loses nothing but the list')} ⚑ — no image, no plane, no query.`),
    R(8, 'Empty state', 'As 1 Centred. The band renders whatever is missing, which is the reason it is the safest of the ten on a 500 ⚑.'),
    R(9, 'Behaviour module', P.NONE),
    R(10, 'Accessibility', `${b('Every derived value was re-checked on the band')} ⚑: carried ink on contrast 13.6:1, muted at 72 % 6.9:1, the 20 % hairline 1.7:1, the button’s inverted pair 13.6:1. ${b('The accent is not used because it does not pass')} ⚑. Heading is the ${code('h1')}; the focus ring is carried ink, not accent.`),
    FLAGGED('The band inverting with the mode is A32’s rule, carried. The 4.0:1 and 2.1:1 accent measurements are this pack’s and were computed for these tokens. Keeping the block centred at 390 is this design’s departure from the category floor.')
  ])
};

/* ── 7 · Cover ────────────────────────────────────────────────────────── */
const d7 = {
  n:7, name:'Cover', gnd:'image',
  rail:'A31 ERROR AND UTILITY · DESIGN 7 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'A photograph filling the page, a warm scrim over it, and the block on top in the image ground’s derived values. It is the only design in A31 that draws an image, and the only one that hands off: a 500 may not ask Ghost for a file, so at a 500 it renders 1 Centred and says so.',
    'The image is an authored field rather than the site’s cover, because a 404 that shows the homepage hero looks like a homepage that has broken rather than a page that is missing.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · FULL-BLEED IMAGE FILLING THE FRAME, 45 % WARM SCRIM · THE BLOCK IN CARRIED VALUES',
  frameOpt:(kind) => kind === 'e500' ? { searchOn:false } : { bleed:true, searchOn:kind === 'e404' },
  body(t, w, o) {
    const kind = o.kind;
    if (kind === 'e500') {
      const g = K.ground(t, 'page');
      return `<div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:18px">
        <span style="font-family:${MONO};font-size:10px;color:${t.muted};text-align:center">HAND-OFF ⚑ · A 500 MAY NOT ASK GHOST FOR A FILE, SO 7 COVER RENDERS 1 CENTRED AT A 500 · A1·11’S RULE, CARRIED</span>
        ${K.block(t, g, w, { kind, align:'center', measure:620, codeStyle:'chip', search:false, links:true, row:w !== 390 })}</div>`;
    }
    const g = K.ground(t, 'image');
    const inner = K.block(t, g, w, { kind, align:'center', measure:w === 1440 ? 620 : w === 834 ? 560 : 350,
      codeStyle:'chip', search:true, links:true, linkStyle:'row', row:w !== 390, formState:o.formState,
      formW:w === 390 ? undefined : 360, searchW:w === 1440 ? 520 : undefined });
    return K.cover(t, w, { body:`<div style="width:100%;display:flex;justify-content:center">${inner}</div>`,
      pad:w === 1440 ? 72 : w === 834 ? 48 : 24, h:w === 390 ? 520 : 420,
      cap:kind === 'gate' ? 'AUTHORED IMAGE · FILLS THE FRAME · THE DESK’S DOOR · NOT THE SITE COVER ⚑' : 'AUTHORED IMAGE · FILLS THE FRAME · A CROP THAT SURVIVES TYPE OVER ITS CENTRE ⚑' });
  },
  stateBody(t, kind, o) {
    o = o || {};
    if (kind === 'e500') {
      const gp = K.ground(t, 'page');
      return K.block(t, gp, 834, { kind, align:'center', measure:520, codeStyle:'chip', search:false, links:true, row:true });
    }
    const g = K.ground(t, 'image');
    return `<div style="position:relative;width:100%;border-radius:${g.r}px;overflow:hidden;background:${t.stripe}">
      ${K.scrim(t, {})}<div style="position:relative;padding:26px 22px">${
        K.block(t, g, 834, { kind, align:'center', measure:480, codeStyle:'chip', search:kind === 'e404',
          links:true, linkStyle:'row', row:true, formState:o.formState, formW:320 })}</div></div>`;
  },
  note404:`${b('One flat warm scrim at 45 %, never a gradient and never black')} ⚑ — A20·13’s scrim, carried: a wash of the pack’s own text colour, so the image dims towards the publication’s ink rather than towards grey. ${b('Every value on top is derived')}: carried ink, muted at 80 %, hairlines at 28 %, and ${b('the button is the carried colour, not the accent')} ⚑.`,
  note500:`${b('This is the hand-off')} ⚑. A 500 may not ask Ghost for a file — an image URL is a settings value, and settings are the layer that may be failing — so ${b('at a 500 this design renders 1 Centred with the 500’s copy set')} and annotates it. ${b('A1·11’s rule, carried')}: a design that cannot exist without a precondition renders another and says which.`,
  noteGate:`${b('A photograph is the one thing a private site can show without leaking anything')} ⚑ — no titles, no nav, no author names — which makes the cover a good gate. ${b('The form is 360 on the scrim')} with its field at the 14 % plate and its label in carried ink.`,
  noteStates:`${b('On an image the error message is carried ink on a 20 % plate with a 28 % hairline')} ⚑. ${b('The scrim does not deepen for the error state')} — dimming the photograph to say “wrong password” is the design blaming the picture.`,
  noteFocus:`${b('The ring is the carried colour at 2 px with a 4 px offset filled with nothing')} ⚑ — on an image there is no ground to fill, so the offset carries a 40 % scrim of the ink instead, which is the one place A31 departs from A6’s ring ⚑.`,
  capResp:'TABLET 834 · SCRIM AND CROP UNCHANGED · MOBILE 390 · THE CROP GETS TALLER, THE SCRIM DOES NOT ⚑',
  labelTablet:'834 · full bleed · pad 48 · measure 560',
  labelMobile:'390 · full bleed · pad 24 · measure 350 · at least 4:5 tall',
  labelMobileGate:'390 · THE GATE ON THE COVER · form full width on the scrim',
  noteResp:`${b('The image fills the frame at every width — the crop is the viewport’s, not a fixed ratio')} ⚑. ${b('At ≤ 767 it gets taller rather than wider')}: a floor of ${b('4:5')} ⚑, because a landscape crop at 390 wide is 219 px tall and cannot hold a heading, a field and a button over it. ${b('The scrim percentage does not change with width')} ⚑: it is a legibility value, and legibility does not improve on a phone.`,
  capDark:'DESKTOP 1440 · DARK · THE SCRIM DEEPENS ONE STEP, THE IMAGE IS UNTOUCHED ⚑',
  noteDark:`${b('In dark the scrim is the dark ink at the same percentage')} ⚑ — ${code('rgba(9,8,6,.45)')} — which reads one step deeper because the ink is darker, and ${b('that is the only change')}. ${b('The photograph itself is never filtered, dimmed or tinted')} ⚑: A19’s rule, carried without exception.`,
  controls:{
    name:'Cover', n:7, count:'SIX', sub:'The block over a photograph. The only design that draws an image.',
    rows:[
      K.seg('Scrim', ['Light 30', 'Standard 45', 'Heavy 60'], 1, `A flat wash of the pack’s text colour ⚑ — ${b('never black and never a gradient')}. ${b('Light 30 is offered and is not safe on every photograph')}; the help text says to check the crop.`),
      K.seg('Alignment', ['Centred', 'Flush left', 'Bottom left'], 0, `${b('Bottom left')} sits the block on the image’s lower edge with the caption line above it ⚑ — the arrangement that suits a picture with sky in it.`),
      K.seg('Image height', ['Fill the viewport', 'Fixed 640'], 0, 'Fill is the default. At Fixed 640 the page ground shows below the image and the footer sits on it ⚑.'),
      K.seg('Code', ['Chip', 'Plain', 'Hidden'], 0, 'The chip’s hairline is the derived 28 % line ⚑.'),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} On an image the field is the 14 % plate ⚑.`),
      K.seg('Recovery links', ['Show', 'Hide'], 0, 'A wrapping row in carried ink under a 28 % hairline.')
    ],
    settles:[
      `${b('The image is a field and the focus point is a field')} ⚑ — not a control. Which part of a photograph matters is a property of that photograph, so it travels with it; ${b('a control would set one focus for every image the publication ever uses')}.`,
      `${b('No control turns the scrim off')} ⚑. Type on an unscrimmed photograph is the single most reliable way to make a page unreadable, and this category’s pages are the ones a reader arrives at already annoyed.`,
      `${b('The 500 is not in this design’s hands')} ⚑ — it hands off to 1 Centred and the editor says so in place. ${b('Closest neighbour: 6 Contrast Band')}, which is this arrangement with a token instead of a picture.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'A photograph filling the page under a flat 45 % warm scrim, the block centred on it in derived carried values. Hands off to 1 Centred at a 500 ⚑.'),
    R(2, 'Structural descriptor', `${code('stack · none · image · none · background · the block over a photograph')}<br><span style="color:#6B6459">${b('The only ')}${code('image')}${b(' ground and the only ')}${code('background')}${b(' media placement in A31')} ⚑ — the two slots that make it unique are the same fact stated twice, which is what a cover is.</span>`),
    R(3, 'Archetype', 'stack. Departures: the crop gets taller at 767 rather than narrower ⚑, and the design does not render at all on a 500 — it hands off ⚑.'),
    R(4, 'Responsive rule', `${b('1440')} full bleed at the viewport’s own ratio, padding 72, measure 620, scrim 45 %. ${b('834')} full bleed, padding 48, measure 560. ${b('≤ 767')} ${b('a 4:5 floor on the crop')} ⚑, padding 24, measure 350, block centred, field and button full width. ${b('The scrim never changes with width')} ⚑.`),
    R(5, 'Content fields', `The union plus ${code('image')} · ${code('imageAlt')} · ${code('imageFocus')} — ${b('required here and drawn nowhere else')} ⚑. ${b('No image → the design renders 6 Contrast Band')} ⚑, which needs no file.`),
    R(6, 'Controls', 'Scrim (Light 30 · Standard 45 · Heavy 60) · Alignment (Centred · Flush left · Bottom left) · Image height (Fill the viewport · Fixed 640) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide) · Recovery links (Show · Hide). Then the page source group.'),
    R(7, 'Data', `${b('404')}: the image is an uploaded file on the section, drawn directly. ${b('500')}: hand-off to 1 Centred ⚑ — no file, no query, no settings value. ${b('Gate')}: the image draws; it leaks nothing about the site’s contents ⚑.`),
    R(8, 'Empty state', `${b('No image is the one empty state that changes the design')} ⚑ — it hands off to 6 Contrast Band rather than drawing an empty grey plate. ${b('No alt text is a warning in the editor, not a blocked save')} ⚑. Other fields as 1 Centred.`),
    R(9, 'Behaviour module', P.NONE + ` ${b('The image is a plain ')}${code('img')}${b(' with ')}${code('loading="eager"')} ⚑ — an error page’s picture is above the fold by definition, so it is not lazy-loaded.`),
    R(10, 'Accessibility', `${b('Derived values re-checked on the scrim')}: carried ink on the 45 % wash 8.9:1 at the crop’s lightest area ⚑, muted at 80 % 6.4:1. ${b('The focus ring’s offset carries a 40 % ink scrim')} because there is no ground behind it ⚑. ${code('imageAlt')} is required when the picture carries meaning and ${b('empty ')}${code('alt')}${b(' is the correct answer when it is decoration')} ⚑.`),
    FLAGGED('The 4:5 mobile floor, the 45 % default and the hand-off targets (1 Centred at a 500, 6 Contrast Band with no image) are all invented here. The ring’s 40 % ink offset is A31’s one departure from A6. Whether a 500 can safely reference an uploaded file is the finding behind the hand-off and belongs to the architect.')
  ])
};

return { designs:[d5, d6, d7] };
})();
