// A31 designs 1–4 · Centred · Split Reason · Card · Boxed
globalThis.A31D1 = (function () {
const K = globalThis.A31LIB, P = globalThis.A31PAGE;
const { L, D, MONO, PK, b, code, gap, hb, PAGE, LINKS } = K;
const R = K.specRow;
const S = a => [a.slice(0, 5), a.slice(5)];
const FLAGGED = extra => `${b('Flagged ⚑')} ${extra}`;
const NAV_SETTLE = `${b('The 404 keeps the whole site chrome')} — header, nav, search, footer — ${b('the 500 keeps the site title as text and one link to ')}${code('/')}, and ${b('the gate keeps nothing')} ⚑. That is the category’s rule and not this design’s choice.`;
const SEARCH_SETTLE = `${b('Search is drawn on the 404 only')} ⚑ — A23’s 52 px field over a real ${code(hb('form action="/search/" method="get"'))}, searching title, excerpt and slug. ${b('Never on a 500')} (an index request to the site that is failing) and ${b('never on the gate')}.`;

/* ── 1 · Centred ──────────────────────────────────────────────────────── */
const d1 = {
  n:1, name:'Centred', gnd:'page',
  rail:'A31 ERROR AND UTILITY · DESIGN 1 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'One column, optically centred in the viewport: the code as a chip, the heading, one sentence, the search field, the primary action beside a text link, and the authored recovery list under a hairline. The category default, and the arrangement the other nine depart from.',
    'It is also the design that states the category’s three settlements plainly, because it has nothing else in it: the 404 keeps the whole site chrome, the 500 keeps the title and one link, and the gate keeps neither.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · MEASURE 620 CENTRED IN THE 1,296 BOX · FULL CHROME',
  frameOpt:(kind) => kind === 'e404' ? { searchOn:true } : {},
  body(t, w, o) {
    const g = K.ground(t, 'page');
    return K.block(t, g, w, { kind:o.kind, align:'center', measure:620, codeStyle:'chip', search:true,
      links:true, linkStyle:'row', row:w !== 390, formState:o.formState, formLabel:false, align2:1 });
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'page');
    return `<div style="width:100%">${K.block(t, g, 834, { kind, align:'center', measure:560, codeStyle:'chip',
      search:kind === 'e404', links:true, linkStyle:'row', row:true, formState:o.formState, formW:340 })}</div>`;
  },
  note404:`${b('Everything is on one axis and the axis is the viewport’s')} ⚑ — the block is centred in the space between the header and the footer, ${b('not in the document')}, so a 404 on a tall screen does not sit under the fold. The measure is 620, the heading 40, and ${b('the search field is 520 rather than the measure’s full width')}: a field as wide as a paragraph reads as a paragraph. ${NAV_SETTLE}`,
  note500:`${b('The same arrangement with everything queried taken out')} ⚑. The nav goes, the search field goes, the footer goes and ${b('the authored link list goes')} — its targets may be failing too. What is left is static text, the site title, and one link to ${code('/')}, ${b('the only URL a theme can be sure of')} ⚑. The second line is an authored mailto address, ${b('not a generated one')}.`,
  noteGate:`${b('No navigation, no search, no footer, and no post titles')} ⚑ — a visitor at ${code('/private/')} has not been admitted to the site, and every one of those describes it. What is left is the lockup, the sentence, the field and the button. ${b('The description under the title is the one optional line')}, and it is drawn because Ghost’s own private page shows it.`,
  noteStates:`${b('Four states, one geometry')}: empty, focused, filled, and wrong password. ${b('There is no submitting state to draw')} ⚑ — the POST is native, so the browser owns the wait. ${b('The message sits above the label')}, in the text colour on the plate under a hairline border, ${b('never in red')} ⚑: the packs have no error token.`,
  noteFocus:`${b('One accent in the page, and it is the primary button')} ⚑. Hover derives from it at 93 % brightness; focus is A6’s 2 px ring at a 4 px offset. ${b('The secondary is a text link whose rule thickens')} and never becomes a second button — two buttons on a 404 is two decisions where the reader has one.`,
  capResp:'TABLET 834 · MEASURE 560 · MOBILE 390 · TOP-ALIGNED, BUTTON FULL WIDTH · A17’S LADDER',
  labelTablet:'834 · measure 560 · heading 34 · the action row holds · padding 80',
  labelMobile:'390 · measure 350 · heading 28 · top-aligned ⚑ · button full width',
  noteResp:`${b('At ≤ 767 the block stops being centred and goes to the top')} ⚑ — 64 px under the bar. A centred column on a short phone viewport with a keyboard open is a column nobody can see. ${b('The action row stacks')}, the button goes full width, the link moves beneath it, and ${b('the recovery list stays a wrapping row')} rather than becoming a menu.`,
  capDark:'DESKTOP 1440 · DARK · RE-TUNED, NOT INVERTED · THE ONE THING THAT CHANGES IS THE GROUND',
  noteDark:`${b('Ground ')}${code('#171511')}${b(', hairline ')}${code('#332E27')}${b(', shadows dropped')} — A27’s step, carried. The chip’s hairline is the only border on the page and it holds at 1.6:1 against the ground, ${b('which is a hairline’s job rather than text’s')}. ${b('The accent re-checks at 4.9:1')} for ${code('#171511')} on ${code('#E0805A')}, so the button keeps the accent.`,
  controls:{
    name:'Centred', n:1, count:'SIX', sub:'One column, centred in the viewport. The default.',
    rows:[
      K.seg('Alignment', ['Centred', 'Flush left'], 0, `Centred is the default ⚑. ${b('Flush left aligns the column to the content box’s left edge')} and keeps the same measure — at 620 the two are a different page, not a different width.`),
      K.seg('Measure', ['Narrow 520', 'Standard 620', 'Wide 720'], 1, `The heading and sentence measure. ${b('The search field does not follow it')} ⚑ — it holds at 520, and at Narrow the two are the same width.`),
      K.seg('Code', ['Chip', 'Plain', 'Eyebrow', 'Hidden'], 0, `${b('Chip')} is “404 · Not found” in a hairline pill · ${b('Plain')} is mono, tracked, no pill · ${b('Eyebrow')} drops the numeral for the words · ${b('Hidden')} shows neither. ${b('On the gate there is no numeral')} ⚑ and every value draws the word Private.`),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, SEARCH_SETTLE),
      K.seg('Recovery links', ['Show', 'Hide'], 0, `The authored ${code('links[]')} list, drawn as a wrapping row of text links under a hairline. ${b('Dropped on the 500 whatever this says')} ⚑, and ${b('never drawn on the gate')} ⚑.`),
      K.seg('Height', ['Fill the viewport', 'Content height'], 0, `${b('Fill')} centres the block between the header and the footer — ${code('min-height: 100svh')} minus both ⚑. ${b('Content height')} lets the page be as short as it is, which is the right answer when a publication’s footer is tall.`)
    ],
    settles:[
      `${b('Six controls, and not one of them is a colour, a font, a width or a radius.')} Cut: a ground value (that is 5 Panel and 6 Contrast Band), a containment value (3 Card and 4 Boxed), a code-size value (${b('that is 10 Display')} ⚑), and a “list recent posts” value — ${b('that is 8 Elsewhere')}, and it is a different design because on a 500 it has nothing to list.`,
      `${b('The page switch is not a control')} ⚑. Which of the three pages is being drawn comes from the status code and the template, and it is the first row of the source group, read-only. ${b('A user cannot preview a 500 by choosing one')} — they choose it in the switch above the canvas, which is an editor affordance rather than a section setting.`,
      `${b('Alignment and Measure are the only two rows that move anything')}, and both move it on one axis. That is deliberate: ${b('this design is the reference the other nine are read against')}, so its panel has to be legible at a glance.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'One column optically centred in the viewport — code chip, heading, sentence, search field, primary action beside a text link, and the authored recovery list under a hairline. No box, plane or band. The category default.'),
    R(2, 'Structural descriptor', `${code('stack · none · page · none · none · the centred column')}<br><span style="color:#6B6459">Containment ${code('none')} and ground ${code('page')} are what 3 Card, 4 Boxed, 5 Panel and 6 Contrast Band each change exactly one of. ${b('The recovery links are not items')} — they are one authored list drawn as a row, and item-count stays ${code('none')} because the arrangement does not repeat a unit ⚑.</span>`),
    R(3, 'Archetype', `stack. Its ladder: the measure narrows with the page, nothing rearranges. ${b('Two departures')} — ${b('at ≤ 767 the block top-aligns instead of centring')} ⚑, and the action row stacks.`),
    R(4, 'Responsive rule', `${b('1440')} measure 620 in the 1,296 box on a 72 margin, heading 40, search field 520, action row horizontal, block centred in the viewport. ${b('834')} measure 560, heading 34, field 460, row holds. ${b('≤ 767')} measure 350, heading 28, ${b('top-aligned at 64')} ⚑, field full width, button full width with the link beneath it, recovery links a wrapping row.`),
    R(5, 'Content fields', `${code('code')} · ${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('primaryLabel')} · ${code('secondaryLabel')} · ${code('links[]')} · ${code('linksLabel')} · ${code('searchPlaceholder')} — ${b('and the first six again for each of the three pages')} ⚑. ${code('image')} is stored and not drawn.`),
    R(6, 'Controls', 'Alignment (Centred · Flush left) · Measure (Narrow 520 · Standard 620 · Wide 720) · Code (Chip · Plain · Eyebrow · Hidden) · Search on the 404 (Show · Hide) · Recovery links (Show · Hide) · Height (Fill the viewport · Content height). Then the page source group.'),
    R(7, 'Data', `${b('The 404 may query freely')} — ${code('@site.title')}, ${code('navigation')}, the search index. ${b('The 500 queries nothing')} ⚑. ${b('The gate queries title and description only')} ⚑. At ${b('0 authored links')} the list and its hairline leave; at ${b('1')} the row holds; at ${b('many')} it wraps at the measure and never scrolls.`),
    R(8, 'Empty state', `No blurb → the stack closes up, nothing reserved. No links → hairline and label go together ⚑. No code → the heading rises. ${b('The heading has a default in all three pages')} ⚑, because a page with no heading is a status code with a button.`),
    R(9, 'Behaviour module', P.NONE + ` ${b('Search is a real GET form')}; if a publication later wires A23’s overlay to it, that design declares ${code('search-overlay')}, ${b('and this one does not')} ⚑.`),
    R(10, 'Accessibility', `${b('The heading is the page’s ')}${code('h1')} ⚑ — on these three pages nothing else claims it. Focus order: skip link, header, ${b('search field, primary action, secondary link, recovery links')}. The chip is decorative text and is not a target. Muted on the page ground 5.4:1; accent button 4.7:1 ⚑. ${b('The page sets ')}${code('lang')}${b(' and a title naming the code')} — “Not found · Orbit Weekly” ⚑.`),
    FLAGGED('The three copy sets are invented — Ghost supplies a status code and a message string, not the words a publication would want. Centring on the viewport rather than the document is this design’s decision. The 620 measure and the 520 field width are A31’s own numbers, chosen against A23’s field and A25’s measure.')
  ])
};

/* ── 2 · Split Reason ─────────────────────────────────────────────────── */
const d2 = {
  n:2, name:'Split Reason', gnd:'page',
  rail:'A31 ERROR AND UTILITY · DESIGN 2 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'The reason on the left, the way out on the right: code, heading and sentence in one column of the content box, and the search field, the action and the recovery list in the other. Both columns are 620-and-under, so neither reads as a caption of the other.',
    'It is the design for a publication whose error pages carry more than one route out, and the one that survives a long heading best — the heading grows down its own column instead of pushing the button off the fold.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · TWO COLUMNS OF THE 1,296 BOX ON AN 80 GAP',
  frameOpt:(kind) => kind === 'e404' ? { searchOn:true } : {},
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const kind = o.kind;
    if (w === 390) {
      return K.block(t, g, w, { kind, measure:350, codeStyle:'chip', search:true, links:true,
        linkStyle:'list', formState:o.formState, formLabel:true });
    }
    const colW = w === 1440 ? 560 : 340;
    const left = `<div style="width:${colW}px;flex-shrink:0;display:flex;flex-direction:column">
      ${K.codeSlot(g, kind, { style:'chip' })}${gap(16)}
      ${K.headingEl(g, w, PAGE[kind].heading, { measure:colW })}${gap(14)}
      ${K.blurbEl(g, w, PAGE[kind].blurb, { measure:colW })}</div>`;
    const rightBits = kind === 'gate'
      ? K.gateForm(t, g, w, { state:o.formState, w:Math.min(colW, 400) })
      : `${kind === 'e404' ? K.searchRow(g, w, { w:Math.min(colW, 460) }) + gap(26) : ''}${K.actions(g, w, kind, {})}${
          kind === 'e404' ? gap(28) + `<div style="width:${colW}px;height:1px;background:${g.border}"></div>` + gap(20) + K.linkList(g, { style:'list' }) : ''}`;
    return `<div style="width:100%;display:flex;gap:${w === 1440 ? 80 : 56}px;align-items:flex-start">
      ${left}<div style="flex:1;min-width:0;display:flex;flex-direction:column">${rightBits}</div></div>`;
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'page');
    return `<div style="width:100%;display:flex;gap:28px;align-items:flex-start">
      <div style="width:270px;flex-shrink:0;display:flex;flex-direction:column">${K.codeSlot(g, kind, { style:'chip' })}${gap(14)}
        ${K.headingEl(g, 834, PAGE[kind].heading, { measure:270, size:26 })}${gap(12)}
        ${K.blurbEl(g, 834, PAGE[kind].blurb, { measure:270 })}</div>
      <div style="flex:1;min-width:0">${kind === 'gate' ? K.gateForm(t, g, 834, { state:o.formState, w:300 })
        : K.actions(g, 834, kind, {})}</div></div>`;
  },
  note404:`${b('Two columns, and the split is 560 · 656 on an 80 gap')} — ${b('not an even half')} ⚑, because the left column carries type that wants a measure and the right carries controls that do not. The columns are ${b('top-aligned, never centred to each other')} ⚑: a heading of two lines and a heading of four should not move the button.`,
  note500:`${b('The right column loses the field and the list and keeps the button')} ⚑, so on a 500 the split reads as a wide statement with one action — which is all a 500 has. ${b('The gap and the column widths do not change')}: the same stylesheet, two page kinds.`,
  noteGate:`${b('The form takes the right column at 380')} ⚑ and the label sits above the field, because in a two-column arrangement a labelless field beside a paragraph reads as a search box. ${b('The left column loses the code slot')} — there is no numeral at ${code('/private/')} — ${b('and keeps the eyebrow')}.`,
  noteStates:`${b('The error message sits at the top of the right column')} ⚑, above the label, so it is met before the field in both reading order and focus order. ${b('The left column is untouched by the error')}: what went wrong is a property of the form, not of the page.`,
  noteFocus:`One accent, on the primary button, in the right column ⚑. ${b('The columns share one focus order')} — left column’s links first (there are none by default), then the field, the button, the list.`,
  capResp:'TABLET 834 · COLUMNS HOLD AT 340 · 356 ON A 56 GAP · MOBILE 390 · ONE COLUMN, LEFT THEN RIGHT',
  labelTablet:'834 · columns 340 · 356 · gap 56 · heading 34',
  labelMobile:'390 · stacked: code, heading, sentence, field, button, links ⚑',
  labelMobileGate:'390 · THE GATE · one column, the label above the field',
  noteResp:`${b('The split collapses at 833')} ⚑ — A5·5’s breakpoint, carried — ${b('and the left column goes first')}: the reason before the remedy, which is the reading order the desktop arrangement already implies. ${b('Nothing is dropped in the collapse')}; the 32 px gap between the two former columns is the only new number.`,
  noteDark:`${b('The columns and the gap are unchanged')} — dark mode moves the ground, the hairline and the accent and nothing else. ${b('The vertical divider, at Divider = Hairline between, is ')}${code('#332E27')} ⚑ and is the one element that has to be re-checked, because a hairline that reads on paper can vanish on a dark ground.`,
  controls:{
    name:'Split Reason', n:2, count:'SIX', sub:'The reason beside the way out. Two columns of the box.',
    rows:[
      K.seg('Split', ['Even', 'Text-heavy', 'Action-heavy'], 1, `${b('Even')} 628 · 628 · ${b('Text-heavy')} 560 · 656 (the default ⚑) · ${b('Action-heavy')} 460 · 756, for a publication whose recovery list is long.`),
      K.seg('Gap', ['Tight 48', 'Standard 80', 'Wide 112'], 1, 'A5·5’s gap ladder, carried. 56 at 834, and the value is ignored below 833 where the columns stack ⚑.'),
      K.seg('Divider', ['None', 'Hairline between'], 0, `A single vertical hairline in the gap. ${b('It is a hairline and never a rule')} ⚑ — and it is dropped in the collapse rather than becoming a horizontal one.`),
      K.seg('Code', ['Chip', 'Plain', 'Hidden'], 0, 'As 1 Centred. The chip sits above the heading in the left column at every value.'),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} ${b('It is the first thing in the right column')} when shown.`),
      K.seg('Recovery links', ['Show', 'Hide'], 0, `Drawn as a list in the right column under a hairline — ${b('a list rather than 1 Centred’s row')} ⚑, because a column this narrow turns a row into a ragged block.`)
    ],
    settles:[
      `${b('The split is not even by default and that is the design’s point')} ⚑. A 40-character heading and a button do not want the same measure; ${b('Even is offered for publications whose recovery list is as long as their sentence')}.`,
      `${b('Nothing in this panel changes what the columns contain')}, only their proportion and the gap. The contents are fixed by the page kind: ${b('field, button and list on the 404')} · ${b('button alone on the 500')} · ${b('the form on the gate')} ⚑.`,
      `${b('Closest neighbour: 10 Display')}, which is also a split ⚑ — it differs on ground (${code('contrast')}) and on what the left column holds (a display numeral rather than the heading). ${b('Set Code = Hidden here and the two do not converge')}: the heading stays left.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'Code, heading and sentence in the left column of the content box; search field, primary action and the recovery list in the right. Top-aligned, on an 80 px gap, with an optional hairline between.'),
    R(2, 'Structural descriptor', `${code('split · none · page · none · none · the reason beside the action')}<br><span style="color:#6B6459">Archetype ${code('split')} is what separates it from 1 Centred, which is otherwise the same five slots ⚑. 10 Display is the other ${code('split')} and differs on ground.</span>`),
    R(3, 'Archetype', 'split. Its ladder: two columns above 833, stacked below, left column first. No departures.'),
    R(4, 'Responsive rule', `${b('1440')} 560 · 656 on an 80 gap, heading 40, field 460, top-aligned. ${b('834')} 340 · 356 on a 56 gap, heading 34. ${b('≤ 833')} one column, ${b('left column first')} ⚑, 32 px between them, heading 28, button and field full width, list unchanged. ${b('The divider is dropped in the collapse')} ⚑.`),
    R(5, 'Content fields', `As the category union. ${b('This design draws every authored field except ')}${code('image')} ⚑ — it is the widest user of the list.`),
    R(6, 'Controls', 'Split (Even · Text-heavy · Action-heavy) · Gap (Tight 48 · Standard 80 · Wide 112) · Divider (None · Hairline between) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide) · Recovery links (Show · Hide). Then the page source group.'),
    R(7, 'Data', `As 1 Centred. ${b('At 0 links the right column is field, button and nothing else')} — it does not stretch ⚑. At many links the column scrolls with the page and never internally.`),
    R(8, 'Empty state', `No sentence → the left column is a chip and a heading, and ${b('the columns stay top-aligned')} ⚑ rather than re-centring. No links → hairline and label leave together. ${b('An empty right column cannot happen')}: the primary action always renders.`),
    R(9, 'Behaviour module', P.NONE),
    R(10, 'Accessibility', `Heading is the ${code('h1')}; ${b('the two columns are one ')}${code('main')}${b(' in source order')} ⚑, so the stacked order and the focus order are the same list. The divider is CSS on the wrapper, not an element. Contrast as 1.`),
    FLAGGED('The 560 · 656 default split is invented, as is the decision to top-align rather than centre the columns to each other. Dropping the divider in the collapse rather than rotating it is this design’s call.')
  ])
};

/* ── 3 · Card ─────────────────────────────────────────────────────────── */
const d3 = {
  n:3, name:'Card', gnd:'surface',
  rail:'A31 ERROR AND UTILITY · DESIGN 3 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'The same stack, inside one surface card centred on the page ground: pack radius + 4, one hairline, the md warm shadow. 720 wide with 40 of padding, and the page ground visible on all four sides.',
    'On the private gate it is the arrangement that reads most like a door — a form on a raised card is the shape every sign-in on the web has, which is exactly why it is worth having as one of ten rather than as the default.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · ONE 720 SURFACE CARD, CENTRED · RADIUS 12 · MD SHADOW',
  frameOpt:(kind) => kind === 'e404' ? { searchOn:true } : {},
  body(t, w, o) {
    const g = K.ground(t, 'surface');
    const cw = w === 1440 ? 720 : w === 834 ? 640 : 350;
    const inner = K.block(t, g, w, { kind:o.kind, align:'center', measure:cw - (w === 390 ? 48 : 80),
      codeStyle:'chip', search:true, links:true, linkStyle:'row', row:w !== 390, formState:o.formState,
      formW:w === 390 ? undefined : 340, searchW:w === 1440 ? 480 : undefined });
    return `<div style="width:100%;display:flex;justify-content:center">${K.card(t, g, { w:cw, pad:w === 390 ? 24 : 40, body:inner })}</div>`;
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'surface');
    return K.card(t, g, { w:0, pad:26, body:K.block(t, g, 834, { kind, align:'center', measure:520,
      codeStyle:'chip', search:kind === 'e404', links:true, linkStyle:'row', row:true, formState:o.formState, formW:320 }) });
  },
  note404:`${b('The card is the section’s containment and the page ground stays visible around it')} ⚑ — that is the whole difference between this and 5 Panel, which fills the box. ${b('Its radius is the pack’s + 4')} and ${b('its shadow is the warm md')}, both A19·3’s plane, carried. ${b('The card does not grow with the viewport')}: 720 at 1440 and 720 at 1920 ⚑.`,
  note500:`${b('A 500 on a card is the one case where the card earns its keep twice')}: the page has almost nothing on it, and the card gives the little there is an edge to sit in. ${b('Everything queried is still gone')} ⚑ — nav, search, footer, links.`,
  noteGate:`${b('The form is 340 inside the card’s 640 of content')} ⚑ and the card does not shrink to it — a form-width card is a modal, and this is a page. ${b('The label sits above the field')} at every width here, because a card is a box and a boxed field with no label reads as a search.`,
  noteStates:`${b('The message is inside the card, above the label')} ⚑, and the card does not change colour, border or depth when it appears. ${b('An error is not a state of the container')} — a red card would be the design shouting at a visitor who mistyped.`,
  noteFocus:`${b('The focus ring is drawn against the card’s surface, not the page ground')} ⚑ — the ring’s 4 px offset is filled with ${code('surface')}, which is what makes it read on both. One accent, on the button.`,
  capResp:'TABLET 834 · CARD 640 · MOBILE 390 · THE CARD KEEPS ITS HAIRLINE AND LOSES ITS MARGINS ⚑',
  labelTablet:'834 · card 640 · pad 40 · heading 34',
  labelMobile:'390 · card 350 · pad 24 · the card stays a card ⚑',
  labelMobileGate:'390 · THE GATE · the card at 350, the field full width',
  noteResp:`${b('The card holds at 390 rather than becoming a full-bleed panel')} ⚑ — at 350 wide with 20 px of page ground either side it still reads as a card, and dissolving it at the last breakpoint would mean the design becomes 1 Centred on a phone. ${b('Padding steps 40 → 40 → 24')}; ${b('the radius never changes')}, because radius is a pack token.`,
  noteDark:`${b('Depth is forced to Flat in dark')} ⚑ — A27’s rule — so the card is ${code('#211D17')} on ${code('#171511')} with a ${code('#332E27')} hairline and no shadow. ${b('The one step of lift is the surface token itself')}, which is why the token exists.`,
  controls:{
    name:'Card', n:3, count:'SIX', sub:'The stack inside one raised card on the page ground.',
    rows:[
      K.seg('Card width', ['Narrow 560', 'Standard 720', 'Wide 880'], 1, `${b('The card does not grow with the viewport')} ⚑. At Narrow the search field drops to 440 with it; at Wide the measure inside holds at 640 rather than filling ⚑.`),
      K.seg('Depth', ['Raised', 'Flat'], 0, `${b('Raised')} is the warm md shadow with a hairline · ${b('Flat')} is the hairline alone. ${b('Forced to Flat in dark')} ⚑, whatever this says.`),
      K.seg('Alignment', ['Centred', 'Flush left'], 0, 'Inside the card. Flush left aligns to the card’s padding edge and keeps the card centred on the page.'),
      K.seg('Code', ['Chip', 'Plain', 'Hidden'], 0, 'As 1 Centred.'),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} Inside the card it is 480 at Standard width.`),
      K.seg('Recovery links', ['Show', 'Hide'], 0, 'A wrapping row under a hairline inside the card. The hairline is the card’s only internal rule ⚑.')
    ],
    settles:[
      `${b('Card width is a card control, not a measure control')} ⚑ — at Wide 880 the text measure inside stays 640, because a 780-wide line of 17 px type is unreadable however handsome the box is.`,
      `${b('No control moves the card off the page ground')} ⚑: a card that fills the content box is 5 Panel, and a card with no fill and no shadow is 4 Boxed. ${b('Those are two other designs and this panel cannot reach them')} — Depth = Flat still leaves a filled surface.`,
      `${b('Closest neighbours: 4 Boxed')} (same stack, no fill, no shadow) ${b('and 5 Panel')} (same fill, full width). ${b('Depth = Flat is the nearest this design gets to 4')}, and it is still a filled card on a page ground.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'The stack inside one surface card centred on the page ground — pack radius + 4, one hairline, the warm md shadow, 720 wide with 40 of padding.'),
    R(2, 'Structural descriptor', `${code('stack · card · page · none · none · a raised card on the page ground')}<br><span style="color:#6B6459">${b('Containment ')}${code('card')}${b(' is the section’s own geometry')} — the card is the section, not an item in it ⚑. Ground stays ${code('page')} because the page ground is what the card sits on and is visible around it.</span>`),
    R(3, 'Archetype', 'stack. Its ladder, with one departure: the card keeps its containment at every width ⚑ and never goes full-bleed.'),
    R(4, 'Responsive rule', `${b('1440')} card 720, padding 40, measure 640, field 480. ${b('834')} card 640, padding 40. ${b('≤ 767')} card 350 on the 20 px margin, padding 24, heading 28, button and field full width, ${b('top-aligned')}. ${b('The radius is the pack’s at every width')} ⚑.`),
    R(5, 'Content fields', `As the union, less ${code('image')} ⚑ (stored, not drawn).`),
    R(6, 'Controls', 'Card width (Narrow 560 · Standard 720 · Wide 880) · Depth (Raised · Flat) · Alignment (Centred · Flush left) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide) · Recovery links (Show · Hide). Then the page source group.'),
    R(7, 'Data', 'As 1 Centred. The card renders at every data state, including the 500 where nothing is queried at all ⚑.'),
    R(8, 'Empty state', `Missing fields close the stack up; ${b('the card does not shrink below 320 of content height')} ⚑, so a page with a heading and a button alone is still a card and not a strip.`),
    R(9, 'Behaviour module', P.NONE),
    R(10, 'Accessibility', `The card is a ${code('div')}, not a ${code('section')} with a label — ${b('it has no accessible name to give')} ⚑. Heading is the ${code('h1')}. ${b('The focus ring’s offset is filled with the surface token')} so it reads on the card ⚑. Surface-on-page is a 1.3:1 step, ${b('which is why the hairline is not optional')} ⚑.`),
    FLAGGED('720 · 40 and the 640 inner measure cap are invented numbers. Keeping the card at 390 rather than dissolving it is this design’s decision, and it is the one most likely to be argued with.')
  ])
};

/* ── 4 · Boxed ────────────────────────────────────────────────────────── */
const d4 = {
  n:4, name:'Boxed', gnd:'page',
  rail:'A31 ERROR AND UTILITY · DESIGN 4 OF 10 · PAPER PACK · FIVE CONTROLS + THE PAGE SOURCE',
  paras:[
    'One hairline box in the measure — no fill, no shadow, nothing lifted. The recovery links become ruled rows inside it, which is the arrangement’s real argument: the box already draws hairlines, so the list may as well use them.',
    'It is the quietest of the ten and the one that reads as a document rather than an interface, which suits a publication whose whole site is set in one column.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · ONE HAIRLINE BOX AT 720 · RULED ROWS INSIDE',
  frameOpt:(kind) => kind === 'e404' ? { searchOn:true } : {},
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const bw = w === 1440 ? 720 : w === 834 ? 640 : 350;
    const pad = w === 390 ? 22 : 36;
    const inner = K.block(t, g, w, { kind:o.kind, measure:bw - pad * 2, codeStyle:'plain', search:true,
      links:true, linkStyle:'rows', row:w !== 390, formState:o.formState, formW:w === 390 ? undefined : 340,
      searchW:w === 1440 ? 460 : undefined, ruleMax:bw - pad * 2, linkDens:w === 390 ? 44 : 48, linkUrl:w !== 390 });
    return `<div style="width:100%;display:flex;justify-content:center">${K.box(t, g, { w:bw, pad, body:inner })}</div>`;
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'page');
    return K.box(t, g, { w:0, pad:24, body:K.block(t, g, 834, { kind, measure:520, codeStyle:'plain',
      search:kind === 'e404', links:true, linkStyle:'rows', row:true, formState:o.formState, formW:320 }) });
  },
  note404:`${b('The box is a hairline and nothing else')} ⚑ — no fill, no shadow, no tint — which is why it needs the ruled list to justify itself. ${b('The rows are the box’s own hairlines continued inwards')}, at 48 px each with the URL set in mono at the right end ⚑: on an error page the destination is information, not decoration.`,
  note500:`${b('On a 500 the box loses its rows and keeps its border')}, and that is the honest picture: ${b('the rows are links and links are navigation')} ⚑. What is left is a bordered statement with one button, which at least tells the reader the page was designed rather than served by accident.`,
  noteGate:`${b('The gate is the box’s best case')}: a bordered form with the label above the field is a document’s idea of a login, and ${b('it needs no fill to look deliberate')}. ${b('The mono note under the field is the same 10 px annotation the rows use')} — one type ladder, two purposes.`,
  noteStates:`${b('The message takes a row of its own at the top of the box')} ⚑, ruled like the others, in the text colour. ${b('The box’s border does not change')} — an error is inside the box, not a property of it.`,
  noteFocus:`One accent, on the button. ${b('The row hover is the label’s underline and the URL going to the text colour')} ⚑ — no fill, because a filled row inside a hairline box is two containments arguing.`,
  capResp:'TABLET 834 · BOX 640 · MOBILE 390 · BOX 350, ROWS AT 44 · THE URL LEAVES THE ROW ⚑',
  labelTablet:'834 · box 640 · pad 36 · rows 48',
  labelMobile:'390 · box 350 · pad 22 · rows 44 · label only',
  labelMobileGate:'390 · THE GATE · the box at 350, field and button full width',
  noteResp:`${b('At ≤ 767 the mono URL leaves the row')} ⚑ and the label keeps the full width — a 350 px row cannot hold both without one of them clipping, and the label is the part a thumb aims at. ${b('The rows drop to 44')}, which is the floor rather than a taste ⚑. ${b('The box holds')}, as 3 Card’s does.`,
  noteDark:`${b('The hairline is the design')} ⚑, so dark is the one mode where it has to be checked rather than assumed: ${code('#332E27')} on ${code('#171511')} reads at 1.6:1, ${b('and the row rules use the same token as the box’s edge')} so nothing looks doubled. No shadow to drop — there was never one.`,
  controls:{
    name:'Boxed', n:4, count:'FIVE', sub:'One hairline box in the measure. The links are its rows.',
    rows:[
      K.seg('Box width', ['Narrow 560', 'Standard 720', 'Wide 880'], 1, 'As 3 Card. The inner measure caps at 640 ⚑.'),
      K.seg('Padding inside', ['Compact 24', 'Comfortable 36', 'Spacious 52'], 1, 'A17’s ladder at box scale. 22 at 390 whatever this says ⚑.'),
      K.seg('Recovery links', ['Ruled rows', 'Plain list', 'Hide'], 0, `${b('Ruled rows')} is this design’s reason to exist ⚑ — label left, URL in mono right, one hairline each. ${b('Plain list')} is 1 Centred’s treatment inside the box. ${b('Dropped on the 500')} ⚑ at every value.`),
      K.seg('Code', ['Plain', 'Chip', 'Hidden'], 0, `${b('Plain defaults here')} ⚑ — mono and tracked, because a pill inside a box is a box inside a box.`),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} At 460 inside the box, ${b('above the button and below the sentence')}.`)
    ],
    settles:[
      `${b('Five controls, not six')} ⚑ — this design has no depth to offer (there is no fill and no shadow) and no alignment worth offering (a hairline box with centred text inside reads as a certificate). ${b('The brief’s floor is four')}, and dropping two rows that would only ever be set once is the point of a minimum.`,
      `${b('The URL in the row is a decision about error pages specifically')} ⚑. On a normal page a visible URL is noise; on a 404 the reader is lost, and “/archive/” tells them where they are being sent.`,
      `${b('Closest neighbour: 3 Card')} — set Recovery links = Plain list and the two differ only in fill and shadow ⚑, which is a real difference at rest and a thin one written down. ${b('The panel says so rather than pretending otherwise')}.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'One hairline box at 720 in the content box — no fill, no shadow — with the authored recovery links drawn as ruled rows inside it, label left and URL in mono right.'),
    R(2, 'Structural descriptor', `${code('stack · box · page · none · none · one hairline box in the measure')}<br><span style="color:#6B6459">${b('Containment ')}${code('box')}${b(' against 3 Card’s ')}${code('card')} is the whole structural distinction ⚑: a box is a border, a card is a raised surface. Item-count stays ${code('none')} — the ruled rows are one authored list, not a repeating unit the arrangement is built from ⚑.</span>`),
    R(3, 'Archetype', 'stack. Its ladder, with one departure: the box keeps its border at every width ⚑.'),
    R(4, 'Responsive rule', `${b('1440')} box 720, padding 36, rows 48, URL shown, field 460. ${b('834')} box 640, padding 36, rows 48. ${b('≤ 767')} box 350, padding 22, ${b('rows 44 and the URL dropped')} ⚑, field and button full width, top-aligned.`),
    R(5, 'Content fields', `As the union, less ${code('image')}. ${b('It is the only design that draws ')}${code('links[].url')}${b(' as text')} ⚑ — the others draw the label alone.`),
    R(6, 'Controls', 'Box width (Narrow 560 · Standard 720 · Wide 880) · Padding inside (Compact 24 · Comfortable 36 · Spacious 52) · Recovery links (Ruled rows · Plain list · Hide) · Code (Plain · Chip · Hidden) · Search on the 404 (Show · Hide). Then the page source group. **Five, deliberately** ⚑.'),
    R(7, 'Data', `As 1 Centred. ${b('At 0 links the box loses its rows and its internal hairlines')} and is a bordered statement ⚑. At 6 the rows run to 6 and the box grows; ${b('it never scrolls internally')} ⚑.`),
    R(8, 'Empty state', `A row whose ${code('url')} is empty draws the label and reserves no space for the URL ⚑. No links → no rows. ${b('The box itself has no empty state')}: it always has a heading and a button in it.`),
    R(9, 'Behaviour module', P.NONE),
    R(10, 'Accessibility', `The rows are ${code('a')} elements filling the row, ${b('44 px minimum at every width')} ⚑ — the mono URL is inside the same link and is not read separately. ${b('The URL is not ')}${code('aria-hidden')} ⚑: a reader who cannot see it is the reader most likely to want it. Heading is the ${code('h1')}.`),
    FLAGGED('Showing the URL is invented and is the design’s distinguishing decision. Five controls rather than six is a deliberate departure from the project’s working norm and is flagged as such. The 48 → 44 row ladder is A31’s own.')
  ])
};

return { designs:[d1, d2, d3, d4] };
})();
