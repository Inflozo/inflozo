// A23 designs 6–10 · Contrast Band · Panel · Big Type · Slim Bar · Grid
(function () {
const K = globalThis.A23LIB, P = globalThis.A23PAGE, X = globalThis.A23X;
const { MONO, b, code } = K;
const { mono, moreNote, listBlock } = X;

const SETTLE_STATES = {
  label: 'WHAT THE SEVEN STATES SETTLE FOR THE WHOLE CATEGORY',
  body: [
    `${b('The count line is the announcement.')} Where results replace in place without a navigation it is a visually-hidden ${code('aria-live="polite"')} region as well as visible text ⚑. ${b('Where the query was a page navigation there is no live region')} — A34’s rule.`,
    `${b('One row, two densities')} ⚑ — the suggestion row is title plus “section · author · date”; the result row is that row with an excerpt. A1·9’s accessible name, matched.`,
    `${b('No matches is a content state, not an error.')} No red, no icon: the query in the heading, one line of why, the section chips as the way out, and ${b('a line naming what is indexed')} ⚑ — which is now whatever the source group’s ${b('Search in')} row says it is.`,
    `${b('The no-JS floor is the field and the archive link')} ⚑ — Ghost cannot read ${code('?q=')} or search server-side, so a GET to /search/ lands on a page whose results the same client module renders. ${b('No JavaScript, no results, in any of the fifteen.')}`
  ]
};

// ═══════════════════════════════════════════════════════════════════════
// 6 · Contrast Band
// ═══════════════════════════════════════════════════════════════════════
const d6 = {
  n: 6, name: 'Contrast Band',
  rail: 'A23 SEARCH · DESIGN 6 OF 15 · PAPER PACK · SEVEN CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO (BACKGROUND ROLE LOCKED) AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'The field and its results on the inverted band. The whole section changes ground — not the head alone — so the results are read on the band rather than under it.',
    'It is the design for a search that ends a page: an archive strip at the foot of a section index, dark against everything above it, with the accent handed back to the carried colour.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · BAND FULL BLEED · FIELD AND RESULTS BOTH ON CONTRAST',
  body(t, w, o) {
    const g = K.ground(t, 'contrast');
    const gg = K.G(w);
    const col = w === 1440 ? 820 : w === 834 ? 674 : 310;
    const band = `<div style="background:${g.bg};padding:${w === 390 ? 56 : w === 834 ? 72 : 88}px ${gg.m}px">
      <div style="max-width:${col}px;margin:0 auto;display:flex;flex-direction:column">
        ${K.headBlock(g, w, { align:'center', eyebrowText:'The archive', headingText:'Search everything we have printed', blurbText:false, measure:560 })}
        ${K.gap(24)}
        <div style="display:flex;justify-content:center">${K.searchField(g, { w:w === 390 ? '100%' : 520, full:w === 390, state:'typed', typed:'orbital' })}</div>
        ${K.gap(w === 390 ? 28 : 38)}
        ${listBlock(t, g, w, { markOn:true, width:col, measure:col, moreText:'ROWS 5–12 CONTINUE · THE BAND ENDS AT THE LAST ROW ⚑' })}</div></div>`;
    return P.bleedWrap(t, w, band, 'SECTION PADDING 0 AT EVERY WIDTH · THE BAND CARRIES 88 · 72 · 56 ⚑');
  },
  primaryNote: `A17·7’s on-contrast derivation, carried verbatim: ${b('muted at 72 % of the carried colour, hairlines at 20 %, the field’s fill at 8 %')} ⚑. ${b('No accent anywhere in this design')} ⚑ — A29·3’s finding is that Paper’s accent measures 4.0:1 on the band, so the field’s focus border and the match mark both take the carried colour instead. ${b('The band carries the padding and the section has none')}, which is why it can butt against the section above it.`,
  tileMin: 186, tileBg: '#232019',
  stateForm(t, s) {
    const g = K.ground(t, 'contrast');
    const f = (st, ex) => K.searchField(g, { w:420, state:st, ...ex });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('empty')}
      <div style="display:flex;flex-direction:column;gap:2px">${K.eyebrow(g, 'Recent searches')}${K.RECENT.slice(0, 2).map(r => K.suggestRow(g, { label:r, px:0, glyph:'↺', h:38 })).join('')}</div></div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('focus', { typedOnFocus:true, typed:'orbi' })}
      ${K.countLine(g, { text:'12 results for', query:'orbi', fs:14 })}
      <span style="font-family:${MONO};font-size:10px;color:${g.muted}">THE FOCUS BORDER IS THE CARRIED COLOUR, NOT THE ACCENT ⚑</span></div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { fs:14 })}${K.rows(t, g, { n:2, density:12, measure:560, titleSize:19, markOn:true, ruleFirst:false, excerpt:false, meta:'all' })}</div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { text:'1 result for', query:'letterpress', fs:14 })}${K.rows(t, g, { n:1, list:[K.RESULTS[1]], excerpt:false, density:0, measure:560, titleSize:19, ruleFirst:false })}<span style="font-family:${MONO};font-size:10px;color:${g.muted}">THE BAND SHRINKS TO ITS CONTENT · NO RESERVED HEIGHT ⚑</span></div>`;
    if (s === 'none') return K.noResults(g, { query:'helioseismology', size:20, measure:520, chipN:3, link:false, gap:11 });
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('searching')}<div style="opacity:.45">${K.rows(t, g, { n:1, excerpt:false, density:0, measure:560, titleSize:19, ruleFirst:false })}</div><span style="font-family:${MONO};font-size:10px;color:${g.muted}">ON THE BAND THE DIM IS OPACITY, NOT A LIGHTER TOKEN ⚑</span></div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('submitted')}<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span><span style="font-family:${MONO};font-size:10px;color:${g.muted}">GET /search/?q=orbital · THE BAND, THE FIELD AND THE LINK ARE SERVER-RENDERED · NO RESULTS ⚑</span></div>`;
  },
  statesNote: `${b('Every state is drawn on the band, because the band is the section')} ⚑ — a design whose head inverts and whose results do not is two grounds and reads as two sections. ${b('The dim in Searching is opacity on the list')}, not a second token: on ${code('contrast')} there is no lighter step to move to ⚑.`,
  extraTile: {
    label: 'WHAT THE BAND SETTLES',
    body: [
      `${b('The whole section inverts, not its head.')} A23’s ground slot names what the section rests on, and ${b('half a section on contrast is not a ground')} ⚑. A publication that wants an inverted head over page-ground results is asking for two sections stacked.`,
      `${b('No accent in the design at all')} ⚑ — A29·3’s finding, carried: Paper’s accent on Paper’s contrast is 4.0:1. Focus border, match mark and the active state all take the carried colour. ${b('A pack whose accent passes on its band still does not get it here')}, because the design must survive all twelve.`,
      `${b('The band gets lighter in dark, not darker')} ⚑ — A22’s call, carried. ${code('#EDE7DA')} carrying ${code('#171511')}, so the inversion is still an inversion when the page is already dark.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · SEVEN CONTROLS OF ITS OWN + THE UNIVERSAL TRIO (ONE LOCKED) + THE SEARCH SOURCE',
    name: 'Contrast Band', n: 6, count: 'SEVEN',
    sub: 'The field and its results on the inverted band.',
    rows: [
      K.seg('Band width', ['Full bleed', 'Inset'], 0, 'Inset holds the band to the 1,296 content box with the pack radius. ' + b('Overridden to Full bleed at ≤ 767') + ' ⚑ — an inset band inside a 20 px margin is a card, and 7 Panel is the card.'),
      K.seg('Band padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 88 · 120 ' + b('inside') + ' the band — a different ladder from the trio’s Vertical spacing, which is the space ' + b('around') + ' it ⚑. A17·7’s rule that a band needs more air than a page section.'),
      K.sel('Field width', 'Medium 520', 'Narrow 400 · Medium 520 · Wide 640. Full width at 390.'),
      K.seg('Result density', ['Compact', 'Comfortable', 'Spacious'], 1, '16 · 24 · 36 of row padding.'),
      K.seg('Excerpt', ['Show', 'Hide'], 0, 'Clamped to the band’s 820 column. Hidden below 767 ⚑.'),
      K.sel('Result meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('New in this pass') + ' ⚑. On the band the meta is the carried colour at 72 %, measured at 7.3:1. ' + b('The date alone at ≤ 767') + '.'),
      K.seg('Row rules', ['Show', 'Hide'], 0, 'The 20 % carried hairline between rows. ' + b('At Hide the density rises one named step') + ' ⚑ — without a rule the rows need the space to separate.')
    ],
    trio: { bgLocked: true, bgValue: 'Contrast (the band)',
      bgHelp: b('The inverted band is the design') + ' — at Background it is 1 Field and Results and at Surface it is 7 Panel, and both of those exist.',
      vsHelp: b('Resolves 0 at Band width: Full bleed') + ' ⚑ — the band butts against its neighbours; at Inset it resolves 64 · 96 · 132. ' + b('Band padding is the band’s own ladder') + ' and is a separate row.',
      tdHelp: 'None · Line · Fade. ' + b('At Full bleed the band’s own edge is the divider') + ' and a Line would be drawn on the ground above it ⚑.' },
    editing: `${b('Eyebrow, heading and note edit inline')} with the ${b('P0·1')} toolbar — on the band the toolbar is editor chrome and keeps its own surface, not the carried colour ⚑. ${b('Row titles, excerpts and meta are Ghost’s')} ⚑ — “Edit in Ghost”. ${b('countLabel, emptyHeading, emptyText, emptyLinkLabel, recentLabel and suggestLabel are edited through the P0·6 switcher')}: No query · Results · No matches ⚑. The archive link opens the ${b('Link Picker')}.`,
    data: `Ghost posts and pages by scope: ${b('no Add, no Remove, no drag')} ⚑. ${b('No Member Visibility row')} ⚑ — no CTA on the band; the field is a form and the archive link is navigation.`,
    settles: [
      `${b('No accent control, because there is no accent')} ⚑. The value a designer would reach for — an accent button or an accent mark — is the one thing A29·3 proved fails on this ground, so ${b('the source group’s Match highlight resolves to the carried colour here')} rather than the accent.`,
      `${b('Row rules changes density, and says so.')} A control that silently changes a second quantity is how a sidebar becomes untrustworthy; this one names its side effect in its own help text ⚑.`,
      `${b('Background role is locked and the reason is shown')} ⚑ — not hidden. ${b('Vertical spacing resolves 0 at Full bleed')}, and ${b('Band padding stays as its own row')} because a band’s internal air is a different quantity from the space around it.`
    ]
  },
  respCap: 'TABLET 834 · BAND FULL BLEED, PADDING 72 · MOBILE 390 · INSET OVERRIDDEN, PADDING 56',
  tabletLabel: '834 · band full bleed · column 674 · padding 72',
  mobileLabel: '390 · Inset overridden to Full bleed ⚑ · padding 56 · excerpt hidden',
  respNote: `Feed’s ladder plus the band’s own padding scale. ${b('1440')} band padding 88, column 820. ${b('834')} padding 72, column 674. ${b('≤ 767')} padding 56, ${b('Inset overridden to Full bleed')} ⚑, excerpt hidden, meta the date. ${b('The band never has a radius at 390')} — a rounded band in a 20 px margin is a card.`,
  darkNote: `${b('The band inverts the other way in dark')} ⚑: ${code('#EDE7DA')} carrying ${code('#171511')}, hairlines at 20 % of the carried ink, the field’s fill at 8 %. ${b('The section is the lightest thing on a dark page')}, which is the point of an inverted band and is why it cannot simply be re-tinted.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The field, the count line and the results, all on the inverted band, which carries the section’s padding and butts against whatever is above and below it.'),
    K.specRow(2, 'Structural descriptor', `${code('feed · none · contrast · many · none · field and results on an inverted band')}<br><span style="color:#6B6459">Ground ${code('contrast')} is the design. Containment ${code('none')} ⚑ — a full-width fill is a ground, not a containment: A26·3 and A27·4’s call, carried.</span>`),
    K.specRow(3, 'Archetype', 'feed. One addition: the band’s own padding scale, 64 · 88 · 120, replacing the section ladder ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} band full bleed or inset at 1,296; padding 88; column 820; field 520. ${b('834')} padding 72, column 674. ${b('≤ 767')} padding 56, Inset overridden to Full bleed ⚑, excerpt hidden, meta the date.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('placeholder')} · ${code('note')} · ${code('countLabel')} · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. ${b('blurb is stored and not drawn')} ⚑ — a band with a paragraph in it stops being a band.`)
  ], [
    K.specRow(6, 'Controls', 'Band width (Full bleed · Inset) · Band padding (Compact 64 · Comfortable 88 · Spacious 120) · Field width (Narrow 400 · Medium 520 · Wide 640) · Result density (Compact · Comfortable · Spacious) · Excerpt (Show · Hide) · Result meta (Section, author, date · Section and date · Date · Off) · Row rules (Show · Hide). Then the universal trio — ' + b('Background role locked to Contrast, with the reason shown') + ' ⚑, Vertical spacing resolving 0 at Full bleed, Top divider — and the shared source group.'),
    K.specRow(7, 'Data', `As 1 Field and Results. ${b('0')} → the no-match block on the band, chips drawn as hairline pills in the carried colour ⚑. ${b('1')} → one row and the band shrinks to it. ${b('many')} → to the cap, and the band’s height is its content’s.`),
    K.specRow(8, 'Empty state', 'No query → recent searches, else featured, on the band. ' + b('No result at all still draws the band') + ' ⚑ — a section that vanishes leaves two page sections touching, and A23 cannot see what they are.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')}. Edit-safe. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — the band, the field and the archive link render identically; ${b('the results do not render at all')} ⚑, because Ghost cannot search server-side.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')} on the band; ${code('h2')}. ${b('Every colour is derived from the carried ink')}, so contrast is a property of the pack’s band pair and is checked once ⚑: muted 72 % measures 7.3:1 on Paper’s band, hairlines are decorative. ${b('The accent is not used, so it is not measured here')} ⚑.`),
    `${b('Reconciled.')} Padding was already the band’s own ladder and stays as ${b('Band padding')}; the trio sits outside the list with ${b('Background role locked to Contrast')} ⚑ and ${b('Vertical spacing resolving 0 at Full bleed')}. ${b('Result meta')} added; ${b('Search in')} and ${b('Match highlight')} joined the source group — the mark resolving to the carried colour here ⚑; ${b('“most read” became “featured”')}; the no-JS tile now draws field and archive link only. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 7 · Panel
// ═══════════════════════════════════════════════════════════════════════
const d7 = {
  n: 7, name: 'Panel',
  rail: 'A23 SEARCH · DESIGN 7 OF 15 · PAPER PACK · FIVE CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'The field and its results on one raised surface plane, inset from the page. The search is an object on the page rather than a stretch of it.',
    'It is the design for a search that sits among other sections and needs an edge — a plane on the page ground, holding its own padding, with the results inside it rather than beneath it.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · PLANE 1296 · INTERNAL PADDING 48 · RESULTS INSIDE THE PLANE',
  body(t, w, o) {
    const g = K.ground(t, 'surface');
    const pad = w === 390 ? 20 : w === 834 ? 32 : 48;
    const col = w === 1440 ? 820 : w === 834 ? 690 : 310;
    const plane = `<div style="background:${g.bg};border:1px solid ${t.border};border-radius:${g.r + 4}px;box-shadow:${t.shadow};padding:${pad}px;box-sizing:border-box">
      <div style="max-width:${col}px;margin:0 auto;display:flex;flex-direction:column">
        ${K.headBlock(g, w, { align:'center', eyebrowText:'The archive', headingText:'Search the archive', blurbText:false, measure:520, hSize:w === 1440 ? 34 : w === 834 ? 30 : 26 })}
        ${K.gap(22)}
        <div style="display:flex;justify-content:center">${K.searchField(g, { w:w === 390 ? '100%' : 520, full:w === 390, state:'typed', typed:'orbital' })}</div>
        ${K.gap(w === 390 ? 26 : 34)}
        ${listBlock(t, g, w, { markOn:true, width:col, measure:col, moreText:'ROWS 5–12 CONTINUE · THE PLANE ENDS AT THE LAST ROW ⚑' })}</div></div>`;
    return P.stdWrap(t, w, plane);
  },
  primaryNote: `A19·3’s surface card and A26·3’s plane, carried: ${b('the pack radius plus 4, one hairline, the md shadow at Raised')} ⚑. ${b('The heading holds at 34 rather than 40')} ⚑ — a plane’s head is inside a boundary and 40 crowds it. ${b('The field is the page ground on a surface plane')}: one step away from whatever it sits on, in both modes, which is the rule A22 set and this design inherits.`,
  tileMin: 186, tileBg: '#FFFFFF',
  stateForm(t, s) {
    const g = K.ground(t, 'surface');
    const f = (st, ex) => K.searchField(g, { w:420, state:st, ...ex });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('empty')}<div style="display:flex;flex-direction:column;gap:2px">${K.eyebrow(g, 'Recent searches')}${K.RECENT.slice(0, 2).map(r => K.suggestRow(g, { label:r, px:0, glyph:'↺', h:38 })).join('')}</div></div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('focus', { typedOnFocus:true, typed:'orbi' })}${K.countLine(g, { text:'12 results for', query:'orbi', fs:14 })}${mono(t, 'THE PLANE GROWS DOWNWARD ONLY · ITS TOP EDGE NEVER MOVES ⚑', 10)}</div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { fs:14 })}${K.rows(t, g, { n:2, density:12, measure:560, titleSize:19, markOn:true, ruleFirst:false, excerpt:false, meta:'all' })}</div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { text:'1 result for', query:'letterpress', fs:14 })}${K.rows(t, g, { n:1, list:[K.RESULTS[1]], excerpt:false, density:0, measure:560, titleSize:19, ruleFirst:false })}${mono(t, 'THE PLANE KEEPS ITS 48 PADDING AT ONE ROW ⚑', 10)}</div>`;
    if (s === 'none') return K.noResults(g, { query:'helioseismology', size:20, measure:520, chipN:3, link:false, gap:11 });
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('searching')}<div style="opacity:.45">${K.rows(t, g, { n:1, excerpt:false, density:0, measure:560, titleSize:19, ruleFirst:false })}</div>${mono(t, 'THE PLANE HOLDS ITS HEIGHT WHILE THE QUERY RUNS ⚑', 10)}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('submitted')}<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span>${mono(t, 'GET /search/?q=orbital · THE PLANE, THE FIELD AND THE LINK ARE SERVER-RENDERED · NO RESULTS ⚑', 10)}</div>`;
  },
  statesNote: `${b('The plane’s top edge never moves')} ⚑ — every state grows or shrinks downward, so a reader typing does not watch the object they are typing into slide up the page. ${b('The plane keeps its 48 px padding at one result')}: shrinking the padding with the content would make a one-result plane read as a different component.`,
  extraTile: SETTLE_STATES,
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE',
    name: 'Panel', n: 7, count: 'FIVE',
    sub: 'The field and its results on a raised plane.',
    rows: [
      K.seg('Plane width', ['Content 1296', 'Inset 1080'], 0, 'Inset centres a narrower plane in the same content box, for a page whose other sections are full width.'),
      K.seg('Plane padding', ['Compact', 'Comfortable', 'Spacious'], 1, '32 · 48 · 64 ' + b('inside') + ' the plane — the trio’s Vertical spacing is the space ' + b('around') + ' it, and the two ladders are different quantities ⚑. 32 at 834, 20 at 390 whatever the value.'),
      K.seg('Depth', ['Flat', 'Raised'], 1, 'Flat is the hairline alone; Raised adds the md shadow. ' + b('Forced to Flat in dark') + ' ⚑ — A29·4’s rule, because a warm shadow on a dark ground is invisible and the hairline is doing the work.'),
      K.seg('Excerpt', ['Show', 'Hide'], 0, 'Clamped to the plane’s 820 column. Hidden below 767 ⚑.'),
      K.sel('Result meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('New in this pass') + ' ⚑ — muted meta on the plane measures 5.1:1. ' + b('The date alone at ≤ 767') + '.')
    ],
    trio: { bgActive: 1,
      bgHelp: b('Surface is this design') + ' — the plane is the ground the section rests on. ' + b('At Background the plane is the page and the design is 1 Field and Results') + '; at Contrast it is 6 Contrast Band ⚑, so the role is left open and the panel names what each value becomes.',
      vsHelp: 'Resolves 64 · 96 · 132 ' + b('around') + ' the plane; 80 at 834, 64 at 390. ' + b('This is the retired Padding row under its real name') + ' — Plane padding is the plane’s own inside measure and stays.' },
    editing: `${b('Eyebrow, heading and note edit inline')} with the ${b('P0·1')} toolbar. ${b('Row content is Ghost’s')} ⚑ — “Edit in Ghost”. ${b('The state strings')} — ${code('countLabel')}, ${code('emptyHeading')}, ${code('emptyText')}, ${code('emptyLinkLabel')}, ${code('recentLabel')}, ${code('suggestLabel')} — ${b('are edited inside the plane through the P0·6 switcher')}: No query · Results · No matches ⚑. The archive link opens the ${b('Link Picker')}.`,
    data: `Ghost posts and pages by scope: ${b('no Add, no Remove, no drag')} ⚑. ${b('No Member Visibility row')} ⚑ — no CTA on the plane.`,
    settles: [
      `${b('Five controls, not six.')} There is no Field width value: ${b('the plane’s column decides it')} ⚑, exactly as the column does in 4 Split Head. Adding one would let a designer put a 400 px field in a 1,296 px plane, which is the arrangement’s worst state.`,
      `${b('No result density value either')} ⚑ — a plane has one internal rhythm, and its padding sets it. Density plus plane padding is two controls arguing about the same whitespace.`,
      `${b('Depth is the only control in A23 that a mode overrides.')} It is stated in the help text rather than silently applied, and it is A29·4’s rule for every card in the library. ${b('Padding retired into the trio; Plane padding stayed')}, because one is the space around the object and the other is inside it ⚑.`
    ]
  },
  respCap: 'TABLET 834 · PLANE FULL BOX, PADDING 32 · MOBILE 390 · PLANE KEEPS ITS EDGE, PADDING 20',
  tabletLabel: '834 · plane 754 · internal padding 32 · heading 30',
  mobileLabel: '390 · plane 350 · internal padding 20 · radius kept ⚑',
  respNote: `Feed’s ladder inside a plane. ${b('834')} plane takes the content box, internal padding 32, heading 30. ${b('≤ 767')} internal padding 20, heading 26, excerpt hidden. ${b('The plane keeps its radius and hairline at 390')} ⚑ — unlike 6 Contrast Band’s inset value, which is overridden, because a card at 350 is still legibly a card while a rounded full-bleed band is not.`,
  darkNote: `A27’s step with A29·4’s override: ground ${code('#171511')}, plane ${code('#211D17')}, hairline ${code('#332E27')}, ${b('Depth forced to Flat')} ⚑. ${b('The field goes darker than the plane, not lighter')} ⚑ — on a lifted plane the recess is the step that reads, which is the one place A23 departs from A22’s “the field is always lighter” rule and says so.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'One raised surface plane holding the head, the field and the results, inset from the page ground and keeping its own internal padding at every result count.'),
    K.specRow(2, 'Structural descriptor', `${code('feed · none · surface · many · none · the query surface on a raised plane')}<br><span style="color:#6B6459">Ground ${code('surface')}; containment ${code('none')} ⚑ — the plane is a ground the section rests on, not a box it sits in: A26·3 and A27·4’s call. It separates this design from 6 Contrast Band by ground alone.</span>`),
    K.specRow(3, 'Archetype', 'feed. No departures; the plane is a ground, and the rows collapse as any feed’s do.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,296 or 1,080; internal padding 48; column 820; field 520; heading 34; padding 96. ${b('834')} internal 32, column 690, heading 30, padding 80. ${b('≤ 767')} internal 20, heading 26, excerpt hidden, padding 64.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('placeholder')} · ${code('note')} · ${code('countLabel')} · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. ${b('blurb stored and not drawn')} ⚑ — the plane’s head is a line, not a paragraph.`)
  ], [
    K.specRow(6, 'Controls', 'Plane width (Content 1296 · Inset 1080) · Plane padding (Compact 32 · Comfortable 48 · Spacious 64) · Depth (Flat · Raised) · Excerpt (Show · Hide) · Result meta (Section, author, date · Section and date · Date · Off). Five, plus the universal trio outside the list — Background role defaulting to Surface — and the shared source group.'),
    K.specRow(7, 'Data', `As 1 Field and Results. ${b('0')} → the no-match block inside the plane, padding unchanged. ${b('1')} → one row, padding unchanged ⚑. ${b('many')} → to the cap; the plane’s height is its content’s.`),
    K.specRow(8, 'Empty state', 'No query → recent searches, else featured, inside the plane. ' + b('The plane is drawn in every state') + ' — there is no state in which this design renders nothing ⚑.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')}. Edit-safe. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — the plane, the field and the archive link render identically and ${b('the results do not render at all')} ⚑.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')} inside the plane; ${code('h2')}. ${b('The plane is not a landmark')} and has no role — it is a ground ⚑. A6’s focus ring is drawn at ${code('outline-offset:-4px')} where the field meets the plane edge at 390 (A17·18’s inset ring). Field text 12.6:1 on the plane; muted meta 5.1:1.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')} and ${b('Plane padding kept its own name')} ⚑ — different ladders. ${b('Result meta')} added; ${b('Search in')} and ${b('Match highlight')} joined the source group; ${b('“most read” became “featured”')}; the no-JS tile now draws field and archive link only. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 8 · Big Type
// ═══════════════════════════════════════════════════════════════════════
const d8 = {
  n: 8, name: 'Big Type',
  rail: 'A23 SEARCH · DESIGN 8 OF 15 · PAPER PACK · FOUR CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'The reader’s own query set at display size, with the field under it and the results below. The category’s one display moment, spent on the word the reader typed rather than on a heading the publication wrote.',
    'Before a query the display line is the section’s heading. Once a query runs, the query replaces it — which is the whole design, and the reason it is not simply a large heading.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · QUERY AT 96 · FIELD 520 BENEATH · RESULTS ON THE 820 MEASURE',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const col = w === 1440 ? 820 : w === 834 ? 754 : 350;
    const size = w === 1440 ? 96 : w === 834 ? 68 : 44;
    const inner = `<div style="max-width:${col}px;margin:0 auto;display:flex;flex-direction:column">
      ${K.eyebrow(g, 'Searching for')}
      ${K.gap(16)}
      <p style="margin:0;font-family:Georgia,serif;font-size:${size}px;font-weight:700;line-height:1.0;letter-spacing:-0.04em;color:${g.text};word-break:break-word">orbital</p>
      ${K.gap(w === 390 ? 24 : 34)}
      ${K.searchField(g, { w:w === 390 ? '100%' : 520, full:w === 390, state:'typed', typed:'orbital' })}
      ${K.gap(w === 390 ? 28 : 40)}
      ${listBlock(t, g, w, { markOn:true, width:col, measure:col })}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `${b('96 px, and the category’s only type above 40')} ⚑ — A22·8’s display ladder, one step down because a query is a word and not a sentence. ${b('The display line is a <p>, not a heading')} ⚑: it is the reader’s text, and promoting a reader’s input to an ${code('h2')} would make the document outline change as they type. ${b('The section’s real h2 is visually hidden')} ⚑ and reads “Search results”.`,
  tileMin: 190,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const big = (txt, size) => `<p style="margin:0;font-family:Georgia,serif;font-size:${size || 40}px;font-weight:700;line-height:1.0;letter-spacing:-0.04em;color:${g.text};word-break:break-word">${txt}</p>`;
    const f = (st, ex) => K.searchField(g, { w:380, state:st, ...ex });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${big('Search the archive', 34)}${f('empty')}${mono(t, 'BEFORE A QUERY THE DISPLAY LINE IS THE HEADING ⚑ · AND IT IS THE REAL H2', 10)}</div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${big('orbi', 40)}${f('focus', { typedOnFocus:true, typed:'orbi' })}${mono(t, 'THE LINE FOLLOWS THE FIELD FROM THE THIRD CHARACTER ⚑', 10)}</div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${big('orbital', 40)}${K.countLine(g, { fs:14 })}${K.rows(t, g, { n:1, density:0, measure:520, titleSize:19, markOn:true, ruleFirst:false, excerpt:false, meta:'all' })}</div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${big('letterpress', 34)}${K.countLine(g, { text:'1 result for', query:'letterpress', fs:14 })}${mono(t, 'A LONG WORD SETS THE SIZE DOWN ONE STEP, NOT THE LINE TO TWO ⚑', 10)}</div>`;
    if (s === 'none') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${big('helioseismology', 30)}<span style="font-size:15px;line-height:1.6;color:${g.muted};max-width:520px">Nothing in the archive uses that word. Titles and excerpts are searched — not the body of an article.</span>${mono(t, 'THE QUERY IS ALREADY THE HEADING · THE NO-MATCH BLOCK DROPS ITS OWN ⚑', 10)}</div>`;
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${big('orbital', 40)}${f('searching')}<div style="opacity:.45">${K.rows(t, g, { n:1, excerpt:false, density:0, measure:520, titleSize:19, ruleFirst:false })}</div></div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${big('Search the archive', 34)}${f('submitted')}<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span>${mono(t, 'NO JS · THE DISPLAY LINE IS THE HEADING, NOT THE QUERY ⚑ · GHOST CANNOT READ ?q=', 10)}</div>`;
  },
  statesNote: `${b('The display line has three jobs and one slot')}: the heading before a query, the query while there is one, and the query again in the no-match state — where ${b('the no-match block drops its own heading')} because the word is already 96 px tall ⚑. ${b('A long query steps the size down rather than wrapping')} ⚑: 96 → 76 → 56 by character count, so the line never becomes a paragraph.`,
  extraTile: {
    label: 'WHAT THE DISPLAY LINE SETTLES',
    body: [
      `${b('It is a <p>, not a heading')} ⚑. A reader’s query in the document outline would mean the outline changes on every keystroke. ${b('The section keeps a visually-hidden h2')} reading “Search results”, so the outline is stable and the landmark is still named.`,
      `${b('The query is echoed, and echoed text is escaped')} ⚑ — the one place in A23 where reader input is rendered at all, let alone at 96 px. ${b('Named as a build requirement, not a design note')}: escape it, and cap the echo at 60 characters with an ellipsis.`,
      `${b('One display moment per section, spent here')} ⚑ — so this design draws no blurb at any value and holds its results at the ordinary 21 px title. A 96 px line above 28 px rows would be two display moments.`,
      `${b('Without JavaScript the display line is the heading, not the query')} ⚑ — the earlier claim that the route renders the submitted query into the line ${b('is struck')}: a Ghost template cannot read ${code('?q=')}. The mechanism is the module’s, and the no-JS floor is the heading, the field and the archive link.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · FOUR CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE',
    name: 'Big Type', n: 8, count: 'FOUR',
    sub: 'The query itself at display size.',
    rows: [
      K.seg('Query size', ['Large 76', 'Display 96'], 1, 'At 1440. ' + b('Both step down by query length') + ' — 96 → 76 → 56 past 12 and 22 characters ⚑.'),
      K.seg('Field position', ['Below the line', 'Above the line'], 0, 'Below reads as a caption to the query; Above reads as a form with a large answer. ' + b('Below is the default because the reader’s eye lands on their own word first') + '.'),
      K.seg('Result density', ['Compact', 'Comfortable', 'Spacious'], 1, '16 · 24 · 36 of row padding.'),
      K.seg('Count line', ['Show', 'Hide'], 1, b('Hidden by default in this design alone') + ' ⚑ — the query is already stated at 96 px and the count reads as furniture beneath it. The live region stays.')
    ],
    trio: {},
    editing: `${b('The eyebrow and the heading edit inline')} with the ${b('P0·1')} toolbar — and ${b('the heading is what the display slot draws before a query')}, so it is edited at display size, in place ⚑. ${b('The reader’s query is not editable content at all')} ⚑: it is reader input, escaped and capped at 60 characters. ${b('emptyText, emptyLinkLabel, countLabel, recentLabel and suggestLabel are edited through the P0·6 switcher')} (No query · Results · No matches) ⚑, which is the only way to reach them — they never show at rest.`,
    data: `Ghost posts and pages by scope: ${b('no Add, no Remove, no drag')} ⚑. ${b('No Member Visibility row')} ⚑ — no CTA in this design.`,
    settles: [
      `${b('No excerpt control')} ⚑ — the display line is the emphasis, and rows with excerpts under a 96 px word make the section two competing weights. The rows are title and meta, always.`,
      `${b('No alignment control.')} The line is flush left at every value: ${b('a centred 96 px word above a 520 px field centres nothing')} ⚑, because the two objects have no shared axis.`,
      `${b('Four controls, one fewer than before.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Match highlight')} moved into the source group; ${b('no Result meta row was added')} here ⚑ — with a 96 px line above them the rows keep one meta grammar and the display slot does the differentiating.`,
      `${b('The substitution stays unconfigurable')} ⚑ — heading before a query, query after it. Making it optional would leave a design with no reason to exist.`
    ]
  },
  respCap: 'TABLET 834 · QUERY AT 68 · MOBILE 390 · QUERY AT 44, FIELD FULL WIDTH',
  tabletLabel: '834 · query 68 · field 520 · list 754',
  mobileLabel: '390 · query 44 · field full width · excerpt never drawn',
  respNote: `Stack’s ladder. ${b('The display line steps 96 → 68 → 44')} and ${b('the length-based step-down applies at every width')} ⚑, so a 22-character query at 390 sets 32. ${b('word-break is on the line at 390')} ⚑ — a single unbreakable query longer than the viewport is the one case where breaking a word beats a horizontal scrollbar.`,
  darkNote: `A27’s step. ${b('The display line is text, not accent')} ⚑ — 96 px of accent would be the whole page, and the roles allow one or two accent uses, not a poster. The field’s focus border and the mark remain the two.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The reader’s query set at 96 px as a paragraph, with the field beneath it and the results below. Before a query the same slot holds the section’s heading, and the substitution is the design.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · page · many · none · the query at display size')}<br><span style="color:#6B6459">Archetype ${code('stack')} — three blocks in one column, no split and no grid. Its emphasis is the only one in A23 that changes as the reader types.</span>`),
    K.specRow(3, 'Archetype', 'stack. No departures; the blocks keep their order at every width.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} eyebrow, line 96, field 520, list on 820, padding 96. ${b('834')} line 68, field 520, list 754, padding 80. ${b('≤ 767')} line 44 with ${code('word-break')} ⚑, field full width, excerpt never drawn, padding 64. ${b('The length step-down applies at all three widths')} ⚑.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} (opt ≤ 24, default “Searching for”) · ${code('heading')} (opt ≤ 60 — ${b('drawn in the display slot only before a query')} ⚑) · ${code('placeholder')} · ${code('countLabel')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. ${b('blurb, note and emptyHeading are stored and not drawn')} ⚑ — the last because the query is the heading.`)
  ], [
    K.specRow(6, 'Controls', 'Query size (Large 76 · Display 96) · Field position (Below the line · Above the line) · Result density (Compact · Comfortable · Spacious) · Count line (Show · Hide, hidden by default ⚑). Four, plus the universal trio outside the list and the shared source group.'),
    K.specRow(7, 'Data', `As 1 Field and Results. ${b('0')} → the query at display size and one line of why, no separate empty heading ⚑. ${b('1')} → “1 result”. ${b('many')} → to the cap. ${b('The echoed query is escaped and capped at 60 characters')} ⚑.`),
    K.specRow(8, 'Empty state', 'No query → the heading in the display slot, field beneath, and recent searches or featured below it. ' + b('If the heading is empty too, the display slot is not drawn') + ' and the field moves up ⚑ — a 96 px blank is worse than a smaller section.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')}. Edit-safe — ${b('in the editor the display line shows the heading')}, because no query has been typed ⚑. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — and ${b('the display line is then the heading, not the query')} ⚑. ${b('The earlier claim that the route renders the submitted query into the line is struck')}: a Ghost template cannot read ${code('?q=')} or search server-side, so the no-JS floor here is heading, field and archive link.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')}; ${b('a visually-hidden h2 reading “Search results”')} ⚑ and the display line as a ${code('<p>')}. The count line remains a polite live region at Count line: Hide. Display text 13.1:1. ${b('96 px at 200 % zoom reflows to two lines rather than scrolling')} ⚑ — the one place the line is allowed to wrap.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Search in')} and ${b('Match highlight')} joined the source group; ${b('“most read” became “featured”')} ⚑; ${b('the no-JS claim is struck')} ⚑ — with JavaScript off the display line is the heading and no results render, redrawn on the states frame. ${b('No Result meta row here')}; ${b('no Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 9 · Slim Bar
// ═══════════════════════════════════════════════════════════════════════
const d9 = {
  n: 9, name: 'Slim Bar',
  rail: 'A23 SEARCH · DESIGN 9 OF 15 · PAPER PACK · FIVE CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE (SIX ROWS) · RECONCILED 25 AUG 2026',
  paras: [
    'One line: a label, a field, and three tag links at the right. The only design in A23 that renders no results of its own — it hands the query to the search route and gets out of the way.',
    'It is the strip a publication puts between two sections of a long index page, or under an archive header, where a full search section would be a second page inside the first.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · BAR 72 TALL ON SURFACE · LABEL, FIELD 400, THREE TAG LINKS',
  body(t, w, o) {
    const g = K.ground(t, 'surface');
    const gg = K.G(w);
    if (w === 390) {
      const bar = `<div style="background:${g.bg};border-top:1px solid ${t.border};border-bottom:1px solid ${t.border};padding:16px ${gg.m}px;display:flex;flex-direction:column;gap:12px">
        <span style="font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted}">Search</span>
        ${K.searchField(g, { full:true, state:'empty', h:48, ph:'Search the archive' })}
        <div style="display:flex;gap:14px;font-size:14px;color:${g.muted}"><span>Reporting</span><span>Interviews</span><span>Pictures</span></div></div>`;
      return P.bleedWrap(t, w, bar, 'SECTION PADDING 0 · THE STRIP CARRIES 16 · THREE ROWS AT 390 ⚑');
    }
    const bar = `<div style="background:${g.bg};border-top:1px solid ${t.border};border-bottom:1px solid ${t.border};height:${w === 834 ? 68 : 72}px;padding:0 ${gg.m}px;display:flex;align-items:center;gap:${w === 834 ? 20 : 28}px;box-sizing:border-box">
      <span style="font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};flex-shrink:0">Search</span>
      ${K.searchField(g, { w:w === 834 ? 300 : 400, state:'empty', h:44, ph:'Search 412 essays and interviews', fs:15 })}
      <div style="margin-left:auto;display:flex;align-items:center;gap:${w === 834 ? 16 : 22}px;font-size:14px;color:${g.muted};flex-shrink:0"><span>Reporting</span><span>Interviews</span><span>Pictures</span></div></div>`;
    return P.bleedWrap(t, w, bar, 'SECTION PADDING 0 AT EVERY WIDTH · THE STRIP IS THE SECTION ⚑');
  },
  primaryNote: `A18·3 Slim’s strip geometry and A1·9’s persistent field, joined: ${b('a 72 px bar on the surface token with a hairline top and bottom, a 44 px field and three tag links at the right')} ⚑. ${b('The field is 44 here, not 52')} ⚑ — the category’s one departure from A4·15, because a 52 px field inside a 72 px bar leaves 10 px of air and reads as a form that has been squeezed. ${b('Nothing in this design renders a result')}: return navigates to the search route.`,
  states: ['before', 'typing', 'searching', 'nojs'],
  tileMin: 150, tileBg: '#FFFFFF',
  stateForm(t, s) {
    const g = K.ground(t, 'surface');
    const strip = inner => `<div style="width:100%;background:${g.bg};border-top:1px solid ${t.border};border-bottom:1px solid ${t.border};height:72px;padding:0 18px;display:flex;align-items:center;gap:20px;box-sizing:border-box">${inner}</div>`;
    const label = `<span style="font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};flex-shrink:0">Search</span>`;
    const links = `<div style="margin-left:auto;display:flex;gap:16px;font-size:14px;color:${g.muted};flex-shrink:0"><span>Reporting</span><span>Interviews</span></div>`;
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${strip(label + K.searchField(g, { w:300, state:'empty', h:44, fs:15 }) + links)}${mono(t, 'THE RESTING STATE IS THE DESIGN · NO PANEL, NO LIST, NO COUNT ⚑', 10)}</div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${strip(label + K.searchField(g, { w:300, state:'focus', typedOnFocus:true, typed:'orbital', h:44, fs:15 }) + links)}${mono(t, 'TYPING DOES NOT OPEN ANYTHING · THE BAR HAS NO PANEL ⚑ · ↵ NAVIGATES', 10)}</div>`;
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${strip(label + K.searchField(g, { w:300, state:'searching', h:44, fs:15 }) + links)}${mono(t, 'THE ONLY “SEARCHING” HERE IS THE BROWSER’S OWN PAGE LOAD ⚑', 10)}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${strip(label + K.searchField(g, { w:300, state:'empty', h:44, fs:15 }) + links)}${mono(t, 'NO JAVASCRIPT · IDENTICAL · THIS DESIGN DECLARES NO MODULE AT ALL ⚑', 10)}<span style="font-size:12.5px;line-height:1.6;color:${g.muted}">A4·15’s call, carried: a real ${code('&lt;form role="search" action="/search/" method="get"&gt;')} needs nothing to work, so there is nothing to degrade.</span></div>`;
  },
  statesNote: `${b('Four states, not seven')} ⚑ — before a query, typing, the browser’s own load, and no-JS, which is identical to the first. ${b('The other three are the destination’s')}: results, one result and no matches all happen on the search route, drawn by whichever design that route carries. ${b('This is the handoff A1·11 established')}, used deliberately and named here.`,
  extraTile: {
    label: 'WHAT THE HANDOFF SETTLES',
    body: [
      `${b('A section may end at the query')} ⚑ — 9 Slim Bar and 12 Cover both do. The spec names the destination rather than inventing a truncated results list, and ${b('the editor warns when no search route exists')}, exactly as A4·15’s panel does.`,
      `${b('Three tag links, not chips')} ⚑ — A17·15’s pill is 36 px and would make the bar 88. These are plain links at 14 px in the muted token, and they are ${code('<a href>')} to Ghost routes, so they work with everything off. ${b('Which three is now a stated selection')} ⚑: ${b('Trailing tags')} — Most posts, or two to three hand-picked tag references on the category’s own chips pattern with the P0·3 controls.`,
      `${b('No results means no live region and no count')} ⚑. A34’s rule: the navigation announces itself. This design has the smallest accessibility surface in the category and that is the point of it.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE · NO MATCH HIGHLIGHT: NO RESULTS HERE ⚑',
    name: 'Slim Bar', n: 9, count: 'FIVE',
    sub: 'One line. The query goes to the search route.',
    rows: [
      K.seg('Bar width', ['Full bleed', 'Content'], 0, 'Content holds the strip to the 1,296 box with the pack radius; Full bleed runs it edge to edge with hairlines only.'),
      K.sel('Field width', 'Medium 400', 'Narrow 320 · Medium 400. ' + b('No Wide value') + ' ⚑ — past 400 the strip stops being a strip. Takes 300 at 834 and full width at 390.'),
      K.seg('Label', ['Show', 'Hide'], 0, '13 px uppercase at the left. At Hide the field takes the leading edge and ' + b('the form keeps an aria-label naming the site') + ' ⚑ — A3·4’s rule for a form with no visible heading.'),
      K.seg('Trailing', ['Tag links', 'Nothing'], 0, 'Three of the publication’s tags as plain links, or the field alone.'),
      K.sel('Trailing tags', 'Most posts', b('New in this pass') + ' ⚑. Most posts · Hand-picked. ' + b('Most posts') + ' takes Ghost’s three most-used tags; ' + b('Hand-picked') + ' is two to three tag references on ' + b('5 Tag Chips’ own pattern') + ', with the P0·3 item controls — drag to reorder, Add arrives filled in, Remove never disabled above two. ' + b('Disabled at Trailing: Nothing') + ', and the row says why.')
    ],
    trio: { bgActive: 1,
      bgHelp: b('This is the retired Bar ground row') + ' ⚑ — Surface gives the strip an edge against the page; at Background the two hairlines are all that separate it, which is the value for a page that is already one ground. Contrast inverts the strip.',
      vsHelp: b('Resolves 0') + ' ⚑ — the strip is the section and carries its own 16 px internal padding at 390. A slim bar with space above and below it is 1 Field and Results with a short list.',
      tdHelp: 'None · Line · Fade. ' + b('The strip already draws its own top hairline') + ', so at Line only one rule is drawn ⚑ — never two touching.' },
    editing: `${b('The label and the placeholder edit inline')} with the ${b('P0·1')} toolbar — they are the only visitor-facing strings this design draws. ${b('Tag names are Ghost’s')} ⚑ — “Edit in Ghost”; at Hand-picked the row chooses ${b('which')} tag, never its text. ${b('Every result and empty-state string is stored and not drawn')}, so the P0·6 switcher offers this design no states ⚑ — it has one. ${b('The form’s aria-label at Label: Hide is @site.title')}, Ghost’s own, plain-text-locked.`,
    data: `Ghost tags for the trailing links and ${b('nothing else')} ⚑. At ${b('Most posts')} the order is Ghost’s; at ${b('Hand-picked')} it is the author’s. ${b('Fewer than three tags')} → those that exist; ${b('none')} → the trailing group is absent and the field takes the room. ${b('No Member Visibility row')} ⚑ — a search strip is not a CTA.`,
    settles: [
      `${b('No results control, because there are no results')} ⚑. Everything a designer would want to configure about the list belongs to the route the bar navigates to — which is also why ${b('the source group draws six rows here, not seven')}: with nothing marked, Match highlight would be a control with no effect.`,
      `${b('No height control.')} 72 is the bar, 68 at 834, three rows at 390. ${b('A slim bar with a height control is 1 Field and Results with extra steps')} ⚑.`,
      `${b('Bar ground left this list and became the trio’s Background role')} ⚑ — the same two values, plus Contrast, under the name every other section uses. ${b('Trailing tags arrived')} in its place, because “three tag links” was drawn with nothing saying which three.`,
      `${b('Still no “search this section” scope')} ⚑ — a section cannot see the route it sits on. Flagged as a finding, unchanged by this pass.`
    ],
    source: { mark: false, head: 'THE SEARCH SOURCE · SIX ROWS · NO MATCH HIGHLIGHT: THIS DESIGN DRAWS NO RESULTS ⚑' }
  },
  respCap: 'TABLET 834 · BAR 68, FIELD 300 · MOBILE 390 · THREE ROWS, THE STRIP BECOMES A BLOCK',
  tabletLabel: '834 · bar 68 · field 300 · links unchanged',
  mobileLabel: '390 · label, field, links on three rows at 16 padding ⚑',
  respNote: `Bar’s ladder with one bespoke collapse. ${b('834')} height 68, field 300, gaps tighten from 28 to 20. ${b('≤ 767 the bar is no longer a bar')} ⚑: label, a 48 px full-width field and the tag links take a row each at 16 px padding, and ${b('the hairlines stay so the strip is still legibly one object')}. ${b('The links do not scroll horizontally here')} — at three items they fit ⚑.`,
  darkNote: `A27’s step. ${b('At Bar ground: Surface the strip lifts to')} ${code('#211D17')} ${b('and the field goes darker than the strip')} ⚑ — 7 Panel’s rule, carried: on a lifted plane the field is the recess. At Page both take ${code('#171511')} and the hairlines do all the work.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'One 72 px line holding a label, a field and three tag links, rendering no results of its own. The query is a page navigation to the search route.'),
    K.specRow(2, 'Structural descriptor', `${code('bar · none · surface · none · none · one line, the query navigates away')}<br><span style="color:#6B6459">Item-count ${code('none')} — no repeating unit at all: the trailing tags are a fixed two-to-three group, not the layout’s repeating unit ⚑. ${b('Trailing tags: Hand-picked makes that group authored')}, which is recorded in the Reconciliation notes rather than changing the tuple.</span>`),
    K.specRow(3, 'Archetype', 'bar. One departure: ' + b('at ≤ 767 it becomes three stacked rows rather than a scrolling row') + ' ⚑, because a field cannot be scrolled past.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} height 72, field 400 at 44 px, 28 px gaps, three links. ${b('834')} height 68, field 300, 20 px gaps. ${b('≤ 767')} three rows, 16 px padding, field 48 px full width, links on their own row ⚑.`),
    K.specRow(5, 'Content fields', `${code('label')} (opt ≤ 20, default “Search”) · ${code('placeholder')} (opt ≤ 40) · ${code('note')} — ${b('stored and not drawn')} ⚑ · ${code('trailingTags[]')} (${b('list 2–3, tag references, new in this pass')} ⚑ — drawn only at Trailing tags: Hand-picked). ${b('eyebrow, heading, blurb and every result and empty-state field are stored and not drawn')} ⚑: this design draws three fields and keeps the rest so a switch to any other design loses nothing.`)
  ], [
    K.specRow(6, 'Controls', 'Bar width (Full bleed · Content) · Field width (Narrow 320 · Medium 400) · Label (Show · Hide) · Trailing (Tag links · Nothing) · Trailing tags (Most posts · Hand-picked, 2–3 tag refs). Five, plus the universal trio outside the list — ' + b('Background role is the retired Bar ground row') + ' ⚑, Vertical spacing resolving 0 — and the shared source group at six rows: ' + b('no Match highlight, because nothing here is marked') + ' ⚑.'),
    K.specRow(7, 'Data', `Ghost tags for the trailing links; ${b('nothing else')} ⚑. ${b('At Trailing tags: Most posts')} the three are Ghost’s most-used, in Ghost’s order; ${b('at Hand-picked')} they are two to three authored tag references in the author’s order ⚑. ${b('0, 1 and many results are the destination route’s')} ⚑ — this section has no result count and no live region. ${b('Fewer than three tags')} → the links that exist are drawn; ${b('none')} → the trailing group is absent and the field takes the room.`),
    K.specRow(8, 'Empty state', b('The resting state is the only state') + ' — an empty field is not an empty state ⚑. No tags → no trailing group. No search route on the site → the editor names the reason and does not offer the design, A4·15’s rule.'),
    K.specRow(9, 'Behaviour module', `${b('none')} ⚑ — the one design in A23 besides 12 Cover that declares nothing. A real ${code('<form role="search" action="/search/" method="get">')} needs no JavaScript, so ${b('there is nothing to degrade and nothing to quote')}. ${code('search-expand')} is deliberately not declared: the field is persistent, and A1·9 made the same call.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')} with a visually-hidden label; ${b('at Label: Hide the form takes aria-label="Search Orbit Weekly"')} ⚑ (A3·4’s rule). ${code('<input type="search" enterkeyhint="search">')}. Tag links are a ${code('<nav aria-label="Sections">')}. ${b('No heading at all')} ⚑ — the strip has no head, so nothing is promoted to one. Field 44 px; links in 44 px rows at 390. Muted label 5.4:1.`),
    `${b('Reconciled.')} ${b('Bar ground retired into the trio’s Background role')} ⚑ (Surface · Background · Contrast), ${b('Vertical spacing resolves 0')} and the Top divider coincides with the strip’s own hairline. ${b('Trailing tags')} added — Most posts · Hand-picked, 2–3 tag refs on 5 Tag Chips’ pattern, adding ${code('trailingTags[]')} to the shared field list ⚑. ${b('The source group draws six rows here')}: no Match highlight where nothing is marked. ${b('“Most read” became “featured”')} in the row this design never reads. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 10 · Grid
// ═══════════════════════════════════════════════════════════════════════
const d10 = {
  n: 10, name: 'Grid',
  rail: 'A23 SEARCH · DESIGN 10 OF 15 · PAPER PACK · FIVE CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'The field above a three-column grid of result cards, each with its feature image. For an archive whose pieces are told apart by their pictures before their titles.',
    'It is the one design in A23 where a result is a card rather than a row, and the count and the query line sit above the grid exactly as they sit above a list.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · THREE COLUMNS AT 405 · IMAGE 3:2 ON TOP · GAP 40',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gapx = w === 390 ? 24 : 40;
    const cw = Math.floor((K.G(w).box - gapx * (cols - 1)) / cols);
    const card = (r, i) => `<div style="width:${cw}px;display:flex;flex-direction:column;gap:12px">
      ${K.plate(t, { w:cw, h:Math.round(cw / 1.5), cap:'FEATURE IMAGE · 3:2' })}
      <span style="font-family:Georgia,serif;font-size:${w === 390 ? 19 : 21}px;font-weight:700;line-height:1.25;letter-spacing:-0.01em;color:${g.text};text-wrap:pretty">${K.hl(g, r.t, 'orbital', true)}</span>
      <span style="font-size:13px;color:${g.muted}">${r.tag} · ${r.a} · ${r.d}</span></div>`;
    const inner = `<div style="display:flex;flex-direction:column">
      <div style="display:flex;justify-content:center">${K.searchField(g, { w:w === 390 ? '100%' : 520, full:w === 390, state:'typed', typed:'orbital' })}</div>
      ${K.gap(20)}
      <div style="display:flex;align-items:baseline;justify-content:space-between">${K.countLine(g, {})}<span style="font-size:13px;color:${g.muted}">Newest first</span></div>
      ${K.gap(28)}
      <div style="display:flex;flex-wrap:wrap;gap:${gapx}px">${K.RESULTS.slice(0, cols === 1 ? 2 : cols === 2 ? 4 : 6).map(card).join('')}</div>
      ${K.gap(24)}
      ${mono(t, 'ROWS 7–12 CONTINUE BELOW · SIX DRAWN SO THE FRAME FITS ⚑', 10)}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A17·1’s three-up grid, carried verbatim: ${b('405 columns on a 40 gap, the image carrying the radius and the card carrying no fill, border or shadow')} ⚑. ${b('The whole card is the link')} and takes its accessible name from the title — A17’s rule, which is why the tag inside a card is text and not a link. ${b('The field is centred above a left-aligned grid')} ⚑: the field belongs to the section, the grid to the results.`,
  tileMin: 200,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const mini = (r, wd) => `<div style="width:${wd}px;display:flex;flex-direction:column;gap:8px">${K.plate(t, { w:wd, h:Math.round(wd / 1.5), pad:0 })}<span style="font-family:Georgia,serif;font-size:15px;font-weight:700;line-height:1.3;color:${g.text}">${K.hl(g, r.t, 'orbital', true)}</span><span style="font-size:12px;color:${g.muted}">${r.tag} · ${r.d}</span></div>`;
    const grid = (n, wd) => `<div style="display:flex;gap:14px">${K.RESULTS.slice(0, n).map(r => mini(r, wd)).join('')}</div>`;
    const f = (st, ex) => K.searchField(g, { full:true, state:st, ...ex });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('empty')}${K.eyebrow(g, 'Featured')}${grid(3, 178)}</div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('focus', { typedOnFocus:true, typed:'orbi' })}${K.countLine(g, { text:'12 results for', query:'orbi', fs:14 })}${grid(3, 178)}</div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { fs:14 })}${grid(3, 178)}${mono(t, 'THE GRID IS THREE UP AT 1440 · IT DOES NOT RE-COLUMN BY RESULT COUNT ⚑', 10)}</div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { text:'1 result for', query:'letterpress', fs:14 })}${grid(1, 260)}${mono(t, 'ONE CARD KEEPS ITS COLUMN WIDTH AND SITS AT THE GRID’S LEFT ⚑', 10)}</div>`;
    if (s === 'none') return K.noResults(g, { query:'helioseismology', size:20, measure:520, chipN:3, gap:11 });
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('searching')}<div style="opacity:.45">${grid(3, 178)}</div>${mono(t, 'THE GRID HOLDS ITS HEIGHT AND DIMS · NO SKELETON CARDS ⚑', 10)}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('submitted')}<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span>${mono(t, 'GET /search/?q=orbital · THE ROUTE SERVES THE FIELD AND THE LINK · NO GRID ⚑', 10)}</div>`;
  },
  statesNote: `${b('The grid does not re-column by result count')} ⚑ — one result is one card at 405 at the grid’s left, not a stretched card and not a centred one. A17·1’s rule, and the reason this design survives the ugly test. ${b('Searching dims the previous grid')}; ${b('there are no skeleton cards')} ⚑, because a grid of grey rectangles is indistinguishable from a grid of missing images.`,
  extraTile: {
    label: 'WHAT THE CARDS SETTLE',
    body: [
      `${b('A result card is A17’s post card, unchanged')} ⚑ — same image ratio, same title size, same meta line, same “the whole card is the link”. A search result and a post grid item are the same object, and a reader should not have to learn two.`,
      `${b('A post with no feature image is the hard case.')} ${b('It draws as a card with no image')}, title at the top of the column ⚑ — not a placeholder, not a letter-tile. ${b('Mixed grids are expected')}: at ${b('Image: Off')} the whole grid is title-and-meta cards, which is the value for archives that do not run pictures.`,
      `${b('The excerpt is the card’s optional third line')}, clamped to two. ${b('It is off by default')} ⚑ — the image is doing the work the excerpt would do, and three columns of prose is a page of prose.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE',
    name: 'Grid', n: 10, count: 'FIVE',
    sub: 'Results as cards with their pictures.',
    rows: [
      K.seg('Columns', ['Two', 'Three', 'Four'], 1, 'At 1440, on a 40 gap. ' + b('Two at 834 and one at 390 whatever the value') + ' ⚑ — A17’s collapse, unchanged. Four is disabled at Excerpt: Show ⚑.'),
      K.seg('Image', ['3:2', '4:3', 'Off'], 0, 'The card’s feature image. ' + b('At Off the grid is title and meta cards and the columns tighten to a 32 gap') + ' ⚑. ' + b('Image focus is Ghost’s per-post crop') + ' and is not a section control ⚑.'),
      K.seg('Excerpt', ['Show', 'Hide'], 1, 'Two lines under the title, clamped. ' + b('Off by default') + ' — the image is already the second signal ⚑.'),
      K.sel('Meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('This design already governed its meta') + ', so it keeps its own row rather than taking the category’s new Result meta one ⚑ — ' + b('Off is the value this pass added') + '. Drops to the date alone at 390.'),
      K.seg('Count line', ['Show', 'Hide'], 0, 'Above the grid, with the sort note at its right. The live region stays at Hide ⚑.')
    ],
    trio: {},
    editing: `${b('The sort note and the state strings are the only authored text this design draws')} ⚑ — ${code('sortNote')} edits inline with the ${b('P0·1')} toolbar; ${code('countLabel')}, ${code('emptyHeading')}, ${code('emptyText')}, ${code('emptyLinkLabel')}, ${code('recentLabel')} and ${code('suggestLabel')} are edited through the ${b('P0·6 switcher')} (No query · Results · No matches). ${b('Eyebrow and heading are stored and not drawn')}, and remain editable in the designs that draw them. ${b('Card titles, meta and images are Ghost’s')} ⚑ — “Edit in Ghost”.`,
    data: `Ghost posts and pages with ${code('feature_image')}: ${b('no Add, no Remove, no drag')} ⚑. ${b('A post with no feature image draws as a card without one')} ⚑ — never a placeholder. ${b('No Member Visibility row')} ⚑ — a card is a link, not a CTA.`,
    settles: [
      `${b('No card fill, border, shadow or radius value')} ⚑ — A17’s call, carried whole: the image has the radius and the card has nothing. ${b('7 Panel is the design for a plane')}; a grid of planes is a different category.`,
      `${b('Columns is a width value, not a count value.')} It says how wide a card is at 1440; ${b('how many cards there are is the source group’s cap')} ⚑. Two controls for one number is how a sidebar starts lying.`,
      `${b('Four is disabled at Excerpt: Show')}, with the reason in the row: a 300 px card with two lines of excerpt and a 3:2 image is four stacked objects in a column too narrow for any of them ⚑.`,
      `${b('Padding retired into the trio’s Vertical spacing')} ⚑ and ${b('Match highlight moved into the source group')} — the card titles mark the query like every other result in the category.`
    ]
  },
  respCap: 'TABLET 834 · TWO COLUMNS AT 357 · MOBILE 390 · ONE COLUMN, IMAGES KEPT',
  tabletLabel: '834 · two columns · gap 40 · meta unchanged',
  mobileLabel: '390 · one column · gap 24 · meta is the date · images kept',
  respNote: `Grid-of-N’s ladder, A17’s exactly: ${b('three at 1440, two at 834, one at 390')}, with the gap stepping 40 → 40 → 24. ${b('Images are kept at 390')} ⚑ — this is the design whose reason for existing is the pictures, so dropping them on a phone would leave 11 Thumb Rows with a different name. ${b('The excerpt is hidden below 767')} whatever the value.`,
  darkNote: `A27’s step, and ${b('photographs are untouched')} ⚑ — A17’s rule: an image is not re-tinted by mode. Only the title, the meta and the mark move; ${b('the mark goes to 22 % accent')} so it still reads over a dark ground.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A centred field above a three-column grid of result cards, each carrying its feature image at 3:2, its title and one meta line. The only design in A23 whose result is a card.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · many · top · results as a card grid')}<br><span style="color:#6B6459">Containment ${code('none')} ⚑ — the cards are the items’ geometry, not the section’s: A21·2’s rule. Media ${code('top')}: the image is above the text inside each card.</span>`),
    K.specRow(3, 'Archetype', 'grid-of-N. No departures — A17’s collapse ladder, three to two to one.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} three columns at 405 on a 40 gap; image 3:2; title 21; field 520 centred; padding 96. ${b('834')} two columns at 357, padding 80. ${b('≤ 767')} one column, gap 24, title 19, excerpt hidden, meta the date, images kept ⚑, padding 64.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} — ${b('both stored and not drawn')} ⚑ (the field is the head here) · ${code('placeholder')} · ${code('countLabel')} · ${code('sortNote')} (opt ≤ 20, default “Newest first”) · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. Card content is Ghost’s.`)
  ], [
    K.specRow(6, 'Controls', 'Columns (Two · Three · Four) · Image (3:2 · 4:3 · Off) · Excerpt (Show · Hide) · Meta (Section, author, date · Section and date · Date · Off) · Count line (Show · Hide). Five, plus the universal trio outside the list and the shared source group.'),
    K.specRow(7, 'Data', `Ghost posts and pages with ${code('feature_image')}, ${code('primary_tag')}, ${code('primary_author')}, ${code('published_at')}. ${b('0')} → the no-match block, no grid. ${b('1')} → one card at column width, left ⚑. ${b('many')} → wraps to the cap. ${b('A post with no feature image draws as a card without one')} ⚑; ${b('a page has no image at all and always draws that way')}.`),
    K.specRow(8, 'Empty state', 'No query → featured as three cards under an eyebrow ⚑ — the one design where the pre-query state is the same shape as the result state. No matches → the block, chips and archive link, no grid.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')}. Edit-safe. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — and ${b('the route renders no grid')} ⚑: the field and the archive link are the floor, because Ghost cannot search server-side.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')}; the grid is a ${code('<ul>')} of ${code('<li>')} with ${b('the whole card as one link')} ⚑, its name the title. Images are ${code('alt=""')} — decorative, because the title is the name (A17’s rule). ${code('h2')} visually hidden, reading “Search results”. Count line is a polite live region. Cards are their own 44 px-plus targets.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Meta gained an Off value')} and keeps its own name rather than taking the category’s Result meta row ⚑; ${b('Search in')} and ${b('Match highlight')} joined the source group; ${b('the pre-query eyebrow reads “Featured”')} ⚑, not “Most read this week”; the no-JS tile now draws field and archive link only. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

globalThis.A23D = (globalThis.A23D || []).concat([d6, d7, d8, d9, d10]);
})();
