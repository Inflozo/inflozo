// A23 designs 11–15 · Thumb Rows · Cover · Facet Rail · Load More · Grouped
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
// 11 · Thumb Rows
// ═══════════════════════════════════════════════════════════════════════
const d11 = {
  n: 11, name: 'Thumb Rows',
  rail: 'A23 SEARCH · DESIGN 11 OF 15 · PAPER PACK · FIVE CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'A18·2’s thumb row, used as a result row: a 160 × 107 picture at the left, the title and excerpt beside it, the meta beneath. The list arrangement for an archive that runs photographs.',
    'It is the middle ground between 1 Field and Results and 10 Grid — a list, not a grid, but a list in which the picture is the first thing the eye lands on.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · THUMB 160 × 107 LEFT · TEXT ON THE 820 MEASURE · ROW PADDING 24',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const col = w === 1440 ? 1000 : w === 834 ? 754 : 350;
    const th = w === 390 ? 88 : w === 834 ? 128 : 160;
    const inner = `<div style="max-width:${col}px;display:flex;flex-direction:column">
      ${K.searchField(g, { w:w === 390 ? '100%' : 520, full:w === 390, state:'typed', typed:'orbital' })}
      ${K.gap(18)}
      ${K.countLine(g, {})}
      ${K.gap(10)}
      ${K.rows(t, g, { n:w === 390 ? 3 : 4, thumb:th, thumbSide:'left', excerpt:w !== 390, meta:w === 390 ? 'date' : 'all',
        density:w === 390 ? 16 : 24, measure:w === 1440 ? 700 : 520, titleSize:w === 390 ? 18 : 21, markOn:true })}
      ${K.gap(14)}
      ${mono(t, 'ROWS 5–12 CONTINUE BELOW · FOUR DRAWN SO THE FRAME FITS ⚑', 10)}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A18·2’s thumb row, carried verbatim: ${b('160 × 107 at 3:2 with the pack radius, 20 px from the text, the row’s text held to 700 and the meta beneath rather than hung')} ⚑. ${b('The thumb is the row’s only image and it is never a placeholder')} ⚑ — a post with no feature image draws that row as though Thumbnails were Off, which A18·8 established and this design inherits. ${b('The content column is 1,000, not 1,296')}: 160 of picture plus 700 of text plus 20 of gap, and the rest is margin.`,
  tileMin: 196,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const f = (st, ex) => K.searchField(g, { w:420, state:st, ...ex });
    const rr = (n, extra) => K.rows(t, g, { n, thumb:88, thumbSide:'left', excerpt:false, meta:'all', density:10, measure:380, titleSize:17, markOn:true, ruleFirst:false, ...extra });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('empty')}${K.eyebrow(g, 'Featured')}${rr(2, { markOn:false })}</div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('focus', { typedOnFocus:true, typed:'orbi' })}${K.countLine(g, { text:'12 results for', query:'orbi', fs:14 })}${rr(1)}</div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { fs:14 })}${rr(2)}</div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { text:'1 result for', query:'letterpress', fs:14 })}${K.rows(t, g, { n:1, list:[K.RESULTS[1]], thumb:88, thumbSide:'left', excerpt:false, meta:'all', density:0, measure:380, titleSize:17, ruleFirst:false })}${mono(t, 'ONE ROW · THE THUMB KEEPS ITS SIZE, THE TEXT ITS MEASURE ⚑', 10)}</div>`;
    if (s === 'none') return K.noResults(g, { query:'helioseismology', size:20, measure:520, chipN:3, gap:11 });
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('searching')}<div style="opacity:.45">${rr(2, { markOn:false })}</div>${mono(t, 'NO SKELETON THUMBS · THE PREVIOUS ROWS DIM ⚑', 10)}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('submitted')}<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span>${mono(t, 'GET /search/?q=orbital · THE ROUTE SERVES THE FIELD AND THE LINK · NO ROWS ⚑', 10)}</div>`;
  },
  statesNote: `${b('A row with no picture is not a row with a grey box')} ⚑ — the text starts at the row’s left edge and the row is shorter. A18·8’s rule, and the reason this design passes the ugly test on an archive that only illustrates half its pieces. ${b('The mark is drawn in the title and the excerpt, never in the meta')} ⚑: a highlighted date is noise.`,
  extraTile: SETTLE_STATES,
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE',
    name: 'Thumb Rows', n: 11, count: 'FIVE',
    sub: 'Results as rows with a picture each.',
    rows: [
      K.seg('Thumb size', ['Small 88', 'Medium 128', 'Large 160'], 2, 'At 3:2, with the pack radius. ' + b('Steps one value down at 834 and to 88 at 390') + ' ⚑ — A18·8’s ladder. ' + b('The crop is Ghost’s per-post feature image') + ', so there is no focus field here ⚑.'),
      K.seg('Thumb side', ['Left', 'Right'], 0, b('Left at ≤ 767 whatever the value') + ' ⚑ — a right-hand thumb in a 350 column pushes the title into two words a line.'),
      K.seg('Result density', ['Compact', 'Comfortable', 'Spacious'], 1, '16 · 24 · 36 of row padding. ' + b('The thumb sets the row’s minimum height, so Compact and a 160 thumb resolve to the thumb') + ' ⚑.'),
      K.seg('Excerpt', ['Show', 'Hide'], 0, 'One line, clamped to the text measure. Hidden below 767 ⚑.'),
      K.sel('Result meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('New in this pass') + ' ⚑ — beside a picture, Off is a real choice. ' + b('The date alone at ≤ 767') + '.')
    ],
    trio: {},
    editing: `${b('This design draws no authored text at rest')} ⚑ — only the placeholder, which edits inline with the ${b('P0·1')} toolbar. ${b('Row titles, excerpts, meta and images are Ghost’s')} ⚑ — “Edit in Ghost”. ${b('countLabel, emptyHeading, emptyText, emptyLinkLabel, recentLabel and suggestLabel are reached only through the P0·6 switcher')}: No query · Results · No matches ⚑. The archive link opens the ${b('Link Picker')}.`,
    data: `Ghost posts and pages with ${code('feature_image')}: ${b('no Add, no Remove, no drag')} ⚑. ${b('No feature image → that row draws as Thumbnails: Off for itself alone')} ⚑, which is data and not styling. ${b('No Member Visibility row')} ⚑ — a row is a link.`,
    settles: [
      `${b('Match highlight left this panel in the reconciliation pass')} ⚑ — it was a control here and nowhere else, which made the same decision live in two places. It is now one row in the shared source group, and the argument for a quiet text beside a picture is made there.`,
      `${b('No image-ratio control.')} 3:2 is A17’s ratio for the library and a search result is not the place to introduce a second one ⚑.`,
      `${b('The thumb’s minimum-height side effect is stated in the row.')} A control whose named value is silently overridden by another control is the defect this project keeps finding; naming it in the help text is the fix.`,
      `${b('Padding retired into the trio’s Vertical spacing')} and ${b('Result meta arrived')} ⚑ — five of its own, and the row that used to be six is now shared.`
    ]
  },
  respCap: 'TABLET 834 · THUMB 128, TEXT 520 · MOBILE 390 · THUMB 88, EXCERPT GOES',
  tabletLabel: '834 · thumb 128 · text 520 · density unchanged',
  mobileLabel: '390 · thumb 88 left · excerpt hidden · meta is the date',
  respNote: `Feed’s ladder with A18·8’s thumb step. ${b('1440')} thumb 160, text 700, row padding 24. ${b('834')} thumb 128, text 520. ${b('≤ 767')} thumb 88, ${b('side forced Left')} ⚑, excerpt hidden, meta the date, row padding 16. ${b('The thumb never goes below 88')} ⚑ — smaller than that and a photograph is a swatch.`,
  darkNote: `A27’s step; ${b('photographs untouched')} ⚑. The mark re-tunes to 22 % accent. ${b('The thumb’s radius is the pack’s, and its hairline is not drawn')} ⚑ — an image needs no border in either mode, which is A17’s rule and holds here.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The field above a list of result rows, each with a 160 × 107 feature image at the left, the title and excerpt beside it and the meta beneath. The picture-led list.'),
    K.specRow(2, 'Structural descriptor', `${code('feed · none · page · many · left · a thumbnail on each result row')}<br><span style="color:#6B6459">Media ${code('left')} is what separates this from 1 Field and Results — same archetype, same ground, same containment, and the picture is the difference.</span>`),
    K.specRow(3, 'Archetype', 'feed. No departures; the row keeps its arrangement and only its sizes change.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} column 1,000; thumb 160; text 700; row padding 24; field 520. ${b('834')} thumb 128, text 520, column 754. ${b('≤ 767')} thumb 88 forced Left ⚑, excerpt hidden, meta the date, row padding 16.`),
    K.specRow(5, 'Content fields', `${code('placeholder')} · ${code('countLabel')} · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. ${b('eyebrow, heading, blurb and note are stored and not drawn')} ⚑ — the field is the head. ${b('The images are Ghost’s feature images')}, never an authored field.`)
  ], [
    K.specRow(6, 'Controls', 'Thumb size (Small 88 · Medium 128 · Large 160) · Thumb side (Left · Right) · Result density (Compact · Comfortable · Spacious) · Excerpt (Show · Hide) · Result meta (Section, author, date · Section and date · Date · Off). Five, plus the universal trio outside the list and the shared source group — ' + b('Match highlight now lives there') + ' ⚑, not here.'),
    K.specRow(7, 'Data', `Ghost posts and pages with ${code('feature_image')}. ${b('0')} → the no-match block. ${b('1')} → one row, thumb and measure unchanged ⚑. ${b('many')} → to the cap. ${b('No feature image → that row draws as Thumbnails: Off for itself alone')} ⚑, which is data, not styling.`),
    K.specRow(8, 'Empty state', 'No query → featured as three rows with their thumbs, under an eyebrow, ' + b('unmarked') + ' ⚑ — there is no query to mark. No excerpt on a post → title and meta close up. No image → as above.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')}. Edit-safe. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — and ${b('the route renders no rows')} ⚑: the field and the archive link are the floor.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')}; rows are a ${code('<ul>')} of ${code('<li>')}, ${b('the whole row one link named by the title')} ⚑. Thumbs ${code('alt=""')} — decorative beside their own title. ${b('The mark is a <mark> element')}, which some screen readers announce; ${b('at Plain it is absent from the DOM, not just untinted')} ⚑. Visually-hidden ${code('h2')}; polite live region on the count.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Match highlight moved out of this panel into the shared source group')} ⚑, where all thirteen result-drawing designs read it; ${b('Result meta')} added; ${b('Search in')} joined the source group; ${b('the pre-query eyebrow reads “Featured”')} ⚑; the no-JS tile now draws field and archive link only. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 12 · Cover
// ═══════════════════════════════════════════════════════════════════════
const d12 = {
  n: 12, name: 'Cover',
  rail: 'A23 SEARCH · DESIGN 12 OF 15 · PAPER PACK · SIX CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO (BACKGROUND ROLE LOCKED) AND THE SEARCH SOURCE (SIX ROWS) · RECONCILED 25 AUG 2026',
  paras: [
    'One field over a full-bleed photograph, with a warm scrim behind the text. The archive’s front door, and the second of the two designs that render no results.',
    'It is the design for the top of a search route or a section index: a picture, a line, a place to type, and a handoff to whichever design draws the results below or after it.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · COVER 480 TALL · FULL BLEED · SCRIM AT 45 %',
  body(t, w, o) {
    const g = K.ground(t, 'image');
    const h = w === 390 ? 420 : w === 834 ? 440 : 480;
    const cover = `<div style="position:relative;height:${h}px;background:${t.stripe};overflow:hidden">
      <div style="position:absolute;inset:0;background:${t.dark ? 'rgba(9,8,6,.55)' : 'rgba(35,32,25,.45)'}"></div>
      <div style="position:absolute;left:10px;bottom:8px">${mono(t, 'COVER PHOTOGRAPH · ≥ 2400 PX · FOCAL POINT: CENTRE ⚑', 10)}</div>
      <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 ${K.G(w).m}px;box-sizing:border-box">
        ${K.eyebrow(g, 'The archive')}
        ${K.gap(14)}
        <h2 style="margin:0;font-family:Georgia,serif;font-size:${w === 390 ? 30 : w === 834 ? 36 : 44}px;font-weight:700;line-height:1.1;letter-spacing:-0.03em;color:${g.text};max-width:720px;text-wrap:pretty">Seven years of Orbit Weekly, in one field</h2>
        ${K.gap(24)}
        ${K.searchField(g, { w:w === 390 ? '100%' : 560, full:w === 390, state:'empty', ph:'Search 412 essays and interviews' })}
        ${K.gap(12)}
        <span style="font-size:13px;color:${g.muted}">Titles and excerpts are searched — not the body of an article.</span></div></div>`;
    return P.bleedWrap(t, w, cover, 'SECTION PADDING 0 AT EVERY WIDTH · THE COVER IS THE SECTION ⚑');
  },
  primaryNote: `A20·13’s warm scrim and A17·8’s wash, carried: ${b('45 % of the pack’s own text colour in light, 55 % in dark')} ⚑ — never a black gradient. ${b('Over an image the field takes a 14 % white fill, a 28 % white hairline and white text')} ⚑, and its focus border is white rather than accent: ${b('this design draws no accent at all')} ⚑, because accent on a photograph is a contrast gamble the pack cannot promise. ${b('The heading holds at 44, below A22·7 Cover’s display moment')} — the photograph is the moment.`,
  states: ['before', 'typing', 'searching', 'nojs'],
  tileMin: 168, tileBg: '#3A342B',
  stateForm(t, s) {
    const g = K.ground(t, 'image');
    const scene = inner => `<div style="width:100%;position:relative;background:${t.stripe};border-radius:8px;overflow:hidden;padding:22px 18px;box-sizing:border-box">
      <div style="position:absolute;inset:0;background:rgba(35,32,25,.45)"></div><div style="position:relative;display:flex;flex-direction:column;gap:12px">${inner}</div></div>`;
    const cap = txt => `<span style="font-family:${MONO};font-size:10px;color:${g.muted}">${txt}</span>`;
    if (s === 'before') return scene(`<span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:${g.text}">Search the archive</span>${K.searchField(g, { full:true, state:'empty' })}${cap('THE RESTING STATE IS THE DESIGN · NO PANEL, NO LIST ⚑')}`);
    if (s === 'typing') return scene(`${K.searchField(g, { full:true, state:'focus', typedOnFocus:true, typed:'orbital' })}${cap('FOCUS IS A 1.5 PX WHITE BORDER, NOT THE ACCENT ⚑ · THE SCRIM DOES NOT CHANGE')}`);
    if (s === 'searching') return scene(`${K.searchField(g, { full:true, state:'searching' })}${cap('THE BROWSER’S OWN PAGE LOAD · THIS DESIGN HAS NO LIVE QUERY ⚑')}`);
    return scene(`${K.searchField(g, { full:true, state:'empty' })}${cap('NO JAVASCRIPT · IDENTICAL · NO MODULE IS DECLARED ⚑')}<span style="font-size:12.5px;line-height:1.6;color:${g.muted}">A4·15’s call, carried: a real ${code('&lt;form role="search" action="/search/" method="get"&gt;')} needs nothing to work.</span>`);
  },
  statesNote: `${b('Four states, and the picture never changes in any of them')} ⚑ — no scrim deepening on focus, no zoom, no parallax. ${b('Behaviours do not run while editing and the resting state is the design')}, which on a photograph means the resting state is all there is. ${b('The other three states belong to the route this field submits to')}, as in 9 Slim Bar.`,
  extraTile: {
    label: 'WHAT THE COVER SETTLES',
    body: [
      `${b('Image focus is a control and a picker popover, not a hidden field')} ⚑ — changed in this pass: Centre · Top · Bottom, reachable from the sidebar and from the Image Picker, because a cover crop that loses its subject at Height: Short is the commonest complaint about a design like this.`,
      `${b('The scrim is the pack’s text colour, not black')} ⚑ — A20·13’s warm scrim. A black wash over a warm photograph greys it, and the imagery rule in the brief is warm and editorial.`,
      `${b('The image is required and the design is not offered without one')} ⚑ — unlike every other image in the library, there is no “no image” fallback here, because a cover with no cover is 1 Field and Results with extra padding. The editor says so at the picker.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO (ONE LOCKED) + THE SEARCH SOURCE · NO MATCH HIGHLIGHT: NO RESULTS HERE ⚑',
    name: 'Cover', n: 12, count: 'SIX',
    sub: 'One field over a photograph. No results.',
    rows: [
      K.seg('Height', ['Short 380', 'Medium 480', 'Tall 620'], 1, 'At 1440. ' + b('440 · 420 at 834 and 390') + ' — a tall cover on a phone is a page the reader has to scroll past ⚑.'),
      K.sel('Field width', 'Wide 560', 'Medium 480 · Wide 560 · Full 720. ' + b('Wide is the default here') + ' ⚑ — a field over a photograph needs to read as the point of the picture.'),
      K.seg('Scrim', ['Light 30 %', 'Medium 45 %', 'Deep 60 %'], 1, 'Of the pack’s text colour, never black ⚑. ' + b('One step deeper in dark at every value') + '.'),
      K.seg('Alignment', ['Centred', 'Left', 'Bottom left'], 0, 'Where the block sits in the cover. ' + b('Bottom left keeps a 64 px floor') + ' so the text never touches the crop’s edge ⚑.'),
      K.sel('Image focus', 'Centre', b('Promoted to a control in this pass') + ' ⚑ — Centre · Top · Bottom, and ' + b('reachable from the Image Picker popover as well as here') + ', never a hidden field. A face in the top third of a 2,400 px photograph is lost at Height: Short unless this row exists.'),
      K.seg('Note', ['Show', 'Hide'], 0, '13 px under the field. ' + b('The line naming what is indexed') + ' — kept by default, because a reader who searches an article’s body deserves to be told before, not after ⚑. ' + b('Its default follows the source group’s Search in value') + '.')
    ],
    trio: { bgLocked: true, bgValue: 'Image (the cover)',
      bgHelp: b('The photograph is the design') + ' — at Background, Surface or Contrast there is no cover, and that design is 1 Field and Results.',
      vsHelp: b('Resolves 0 at every value') + ' ⚑ — the cover is full bleed and carries its own height; Height is the ladder that matters here.',
      tdHelp: 'None · Line · Fade. ' + b('A divider above a full-bleed photograph is drawn on the ground above it') + ', not on the image ⚑.' },
    editing: `${b('Eyebrow, heading and note edit inline over the photograph')} with the ${b('P0·1')} toolbar — the toolbar keeps its own editor surface rather than the carried white, so it is legible over any crop ⚑. ${b('The image is dropped in the Image Picker')}, whose popover also carries ${b('Image focus')} and ${code('imageAlt')} ⚑. ${b('Every result and empty-state string is stored and not drawn')}, so this design offers the P0·6 switcher no states ⚑.`,
    data: `Nothing from Ghost but the placeholder’s post count ⚑. ${b('No Member Visibility row')} ⚑ — the field is a form and the cover is a picture; neither is a CTA.`,
    settles: [
      `${b('Image focus is a control now, not a hidden field')} ⚑ — the ground rule is that every image field carries Centre · Top · Bottom reachable from the picker, so the row is drawn here ${b('and')} in the Image Picker popover, and the two write the same value.`,
      `${b('No overlay-colour value and no gradient value.')} The scrim is a flat wash of the pack’s text colour at three named strengths; ${b('a gradient over an editorial photograph is the AI-slop tell the brief names')} ⚑.`,
      `${b('Background role is locked and the reason is shown')} ⚑; ${b('Vertical spacing resolves 0')} because the cover is the section. ${b('The source group draws six rows here')} — no Match highlight, because nothing is marked.`,
      `${b('Six controls.')} Cut: results anything (there are none), accent anything (there is none), image ratio (the cover is a height, not a ratio), and a “dim on scroll” behaviour ⚑.`
    ],
    source: { mark: false, head: 'THE SEARCH SOURCE · SIX ROWS · NO MATCH HIGHLIGHT: THIS DESIGN DRAWS NO RESULTS ⚑' }
  },
  respCap: 'TABLET 834 · COVER 440, FIELD 560 · MOBILE 390 · COVER 420, FIELD FULL WIDTH',
  tabletLabel: '834 · cover 440 · heading 36 · field 560',
  mobileLabel: '390 · cover 420 · heading 30 · field full width · note kept',
  respNote: `Media frame’s ladder. ${b('1440')} 480 tall, heading 44, field 560. ${b('834')} 440, heading 36. ${b('≤ 767')} 420, heading 30, field full width at 52. ${b('The scrim steps one value deeper at 390')} ⚑ — a phone crop shows more of the photograph’s busy middle than a wide crop does, so the text needs more help.`,
  darkNote: `${b('The photograph is untouched and the scrim deepens one step')} ⚑ — A22·7’s rule. ${b('White over an image stays white in both modes')} ⚑: the text does not go to the dark pack’s ink, because the image is not a token and does not change with the mode.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A full-bleed cover photograph with a warm scrim, an eyebrow, a heading and one field over it. Renders no results; the query is a navigation to the search route.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · image · none · background · the field over a cover photograph')}<br><span style="color:#6B6459">Ground ${code('image')} and media ${code('background')} — the only design in A23 with either. Item-count ${code('none')}: no repeating unit and no results.</span>`),
    K.specRow(3, 'Archetype', 'form. One departure: ' + b('it hands off its result states to the search route') + ' ⚑, as 9 Slim Bar does — the pattern A1·11 established.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} cover 480, heading 44, field 560, scrim 45 %. ${b('834')} cover 440, heading 36. ${b('≤ 767')} cover 420, heading 30, field full width, ${b('scrim one step deeper')} ⚑.`),
    K.specRow(5, 'Content fields', `${code('image')} (${b('required')} ⚑, ≥ 2,400 px) · ${code('imageAlt')} (opt ≤ 120) · ${code('imageFocus')} (enum Centre · Top · Bottom — ${b('a control in the sidebar and in the Image Picker popover, changed in this pass')} ⚑) · ${code('eyebrow')} · ${code('heading')} · ${code('placeholder')} · ${code('note')}. ${b('blurb and every result and empty-state field are stored and not drawn')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Height (Short 380 · Medium 480 · Tall 620) · Field width (Medium 480 · Wide 560 · Full 720) · Scrim (Light 30 % · Medium 45 % · Deep 60 %) · Alignment (Centred · Left · Bottom left) · Image focus (Centre · Top · Bottom) · Note (Show · Hide). Six, plus the universal trio — ' + b('Background role locked to Image, Vertical spacing resolving 0') + ' ⚑ — and the source group at six rows.'),
    K.specRow(7, 'Data', `Nothing from Ghost but the placeholder’s post count. ${b('0, 1 and many results are the destination route’s')} ⚑ — this section has no list, no count and no live region. ${b('No search route on the site')} → the design is not offered and the editor names the reason (A4·15’s rule).`),
    K.specRow(8, 'Empty state', b('No image, no design') + ' ⚑ — the one required image in the category, because the alternative is 1 Field and Results. No eyebrow or note → the block closes up and stays on its alignment. ' + b('An empty field is not an empty state.')),
    K.specRow(9, 'Behaviour module', `${b('none')} ⚑ — with 9 Slim Bar, the second of the two designs that declare nothing. A real GET form needs no JavaScript, so ${b('there is nothing to degrade and nothing to quote')}. No parallax, no scrim animation, no ${code('reveal')} ⚑.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')} over the image; ${code('h2')}. ${b('The scrim is a real element, not an opacity on the image')} ⚑, so text over it is measured against a known colour: white on Paper’s ink at 45 % over the striped placeholder measures 7.1:1 at the worst pixel. ${code('imageAlt')} is drawn as the ${code('alt')}; ${b('an empty alt is a decorative cover and is allowed')} ⚑. Field 52 px, clear control 44.`),
    `${b('Reconciled.')} ${b('Image focus promoted from a field to a control')} ⚑, drawn in the sidebar and in the Image Picker popover; the trio sits outside the list with ${b('Background role locked to Image')} and ${b('Vertical spacing resolving 0')}; the source group draws ${b('six rows — no Match highlight')} ⚑; ${b('“most read” became “featured”')} in the rows this design stores and never draws. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 13 · Facet Rail
// ═══════════════════════════════════════════════════════════════════════
const d13 = {
  n: 13, name: 'Facet Rail',
  rail: 'A23 SEARCH · DESIGN 13 OF 15 · PAPER PACK · SIX CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'A 240 px column of sections, writers and years beside the results. The archive-directory arrangement, for a publication whose readers narrow before they read.',
    'One facet at a time — and that is the design’s central constraint rather than a simplification, because a Ghost theme cannot express two filters at once without leaving the routes it is given.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · RAIL 240 LEFT · RESULTS 1016 · ONE FACET ACTIVE',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const facet = (label, items) => `<div style="display:flex;flex-direction:column;gap:8px">
      <span style="font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted}">${label}</span>
      <div style="display:flex;flex-direction:column">${items.map(([l, c, act]) => `<div style="height:32px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-size:15px;color:${act ? g.text : g.muted};font-weight:${act ? 600 : 400};${act ? `text-decoration:underline;text-decoration-color:${g.btnBg};text-decoration-thickness:2px;text-underline-offset:4px;` : ''}">${l}</span>
        <span style="font-size:13px;color:${g.muted}">${c}</span></div>`).join('')}</div></div>`;
    const rail = `<div style="width:240px;flex-shrink:0;display:flex;flex-direction:column;gap:26px">
      ${facet('Section', [['Reporting', '42', true], ['Interviews', '31'], ['Pictures', '18'], ['Craft', '12']])}
      ${facet('Writer', [['Ida Brandt', '58'], ['Nadia Okonjo', '24'], ['Tomás Herrera', '19']])}
      ${facet('Year', [['2026', '46'], ['2025', '92'], ['2024', '88']])}
      <span style="font-size:12.5px;line-height:1.5;color:${g.muted}">One at a time ⚑</span></div>`;
    if (w === 1440 || w === 834) {
      const rw = w === 1440 ? 1016 : 474;
      const inner = `<div style="display:flex;gap:40px;align-items:flex-start">${rail}
        <div style="width:${rw}px;display:flex;flex-direction:column">
          ${K.searchField(g, { full:true, state:'typed', typed:'orbital' })}
          ${K.gap(18)}${K.countLine(g, { text:'12 results in Reporting for', query:'orbital' })}${K.gap(10)}
          ${K.rows(t, g, { n:4, excerpt:w === 1440, meta:'all', density:22, measure:w === 1440 ? 700 : 474, titleSize:20, markOn:true })}
          ${K.gap(14)}${mono(t, 'ROWS 5–12 CONTINUE BELOW ⚑', 10)}</div></div>`;
      return P.stdWrap(t, w, inner);
    }
    const inner = `<div style="display:flex;flex-direction:column">
      ${K.searchField(g, { full:true, state:'typed', typed:'orbital' })}
      ${K.gap(14)}
      <div style="display:flex;align-items:center;justify-content:space-between;height:44px;border:1px solid ${g.border};border-radius:${g.r}px;padding:0 14px;box-sizing:border-box">
        <span style="font-size:15px;color:${g.text};font-weight:600">Narrow · Reporting</span><span style="font-size:12px;color:${g.muted}">▾</span></div>
      ${K.gap(8)}${mono(t, 'THE RAIL BECOMES ONE DISCLOSURE ROW ⚑ · NATIVE DETAILS, ACCORDION’S DEGRADATION', 10)}
      ${K.gap(18)}${K.countLine(g, { text:'12 in Reporting for', query:'orbital', fs:14 })}${K.gap(8)}
      ${K.rows(t, g, { n:3, excerpt:false, meta:'date', density:16, measure:350, titleSize:18, markOn:true })}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A1·11’s side rail and A12·10’s directory column, joined: ${b('240 px, three facet groups, 32 px rows, Ghost’s own counts at the right')} ⚑. ${b('The active facet is a 2 px accent underline')} — A1·1’s nav-item active state, carried verbatim rather than a filled pill, because ${b('a filled pill in a rail reads as a button')}. ${b('One facet at a time')} ⚑: each row is a link to a Ghost tag, author or date route, so the rail is single-select by construction and the count line names the active one.`,
  tileMin: 200,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const railMini = (act) => `<div style="width:130px;flex-shrink:0;display:flex;flex-direction:column;gap:6px">
      <span style="font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted}">Section</span>
      ${['Reporting', 'Interviews', 'Pictures'].map((l, i) => `<span style="font-size:14px;color:${i === act ? g.text : g.muted};font-weight:${i === act ? 600 : 400};${i === act ? `text-decoration:underline;text-decoration-color:${g.btnBg};text-decoration-thickness:2px;text-underline-offset:4px;` : ''}">${l}</span>`).join('')}</div>`;
    const two = (act, right) => `<div style="display:flex;gap:20px;width:100%;align-items:flex-start">${railMini(act)}<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px">${right}</div></div>`;
    const f = (st, ex) => K.searchField(g, { full:true, state:st, ...ex });
    if (s === 'before') return two(-1, f('empty') + K.eyebrow(g, 'Featured') + K.rows(t, g, { n:1, excerpt:false, density:0, measure:340, titleSize:17, ruleFirst:false }) + mono(t, 'NO FACET ACTIVE · EVERY COUNT IS THE WHOLE ARCHIVE’S ⚑', 10));
    if (s === 'typing') return two(-1, f('focus', { typedOnFocus:true, typed:'orbi' }) + K.countLine(g, { text:'12 results for', query:'orbi', fs:14 }) + mono(t, 'TYPING WITHOUT A FACET SEARCHES EVERYTHING ⚑', 10));
    if (s === 'results') return two(0, K.countLine(g, { text:'12 in Reporting for', query:'orbital', fs:14 }) + K.rows(t, g, { n:2, excerpt:false, meta:'date', density:10, measure:340, titleSize:17, markOn:true, ruleFirst:false }));
    if (s === 'one') return two(2, K.countLine(g, { text:'1 in Pictures for', query:'orbital', fs:14 }) + K.rows(t, g, { n:1, list:[K.RESULTS[3]], excerpt:false, meta:'date', density:0, measure:340, titleSize:17, markOn:true, ruleFirst:false }) + mono(t, 'THE RAIL DOES NOT HIDE FACETS WITH ONE RESULT ⚑', 10));
    if (s === 'none') return two(1, K.noResults(g, { query:'orbital', size:18, measure:340, chips:false, link:false, gap:8, text:'Nothing in Interviews matches that word. The count beside each section is the whole archive’s, so another section may.' }) + mono(t, 'A FACET WITH NO MATCH KEEPS ITS ROW AND ITS COUNT ⚑', 10));
    if (s === 'searching') return two(0, f('searching') + `<div style="opacity:.45">${K.rows(t, g, { n:1, excerpt:false, density:0, measure:340, titleSize:17, ruleFirst:false })}</div>` + mono(t, 'THE RAIL NEVER DIMS · ONLY THE RESULTS DO ⚑', 10));
    return two(0, f('submitted') + `<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span>` + mono(t, 'THE FACETS ARE LINKS AND WORK PERFECTLY · THE QUERY’S RESULTS NEED JS ⚑', 10));
  },
  statesNote: `${b('The counts beside the facets are the archive’s, not the query’s')} ⚑ — Ghost gives a theme a tag’s post count cheaply and the intersection of a tag and a query not at all. ${b('Stated on the frame and in the rail’s own footnote')}, because a reader who reads “Interviews 31” and then sees no matches has been told something untrue unless the design says which number it is.`,
  extraTile: {
    label: 'THE FINDING THIS DESIGN RAISES',
    body: [
      `${b('Two facets at once is not expressible in a Ghost theme')} ⚑ — routes give a theme one taxonomy at a time, so “Reporting, by Ida Brandt, in 2026” has no URL. ${b('The design is single-select and says so')} rather than drawing checkboxes that cannot combine.`,
      `${b('A finding for the architect, not a module request.')} The closest registry module is ${code('filter-strip')}, which this design declares; ${b('multi-facet filtering would need a query the platform does not expose')}, and naming a new module would not create one.`,
      `${b('Year is the shakiest facet')} ⚑ — Ghost has no year archive route by default; a publication must add one in ${code('routes.yaml')}. ${b('At Facets: Sections and writers')} — the default — ${b('no year rows are drawn')}, and the editor says why.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE',
    name: 'Facet Rail', n: 13, count: 'SIX',
    sub: 'A column of facets beside the results.',
    rows: [
      K.seg('Rail side', ['Left', 'Right'], 0, 'A rail on the right reads as “more like this”; on the left, as “narrow this”. ' + b('Both stack rail-above-results at ≤ 767') + ' ⚑.'),
      K.seg('Rail width', ['Narrow 200', 'Wide 240'], 1, 'Of the 1,296 box on a 40 gap. ' + b('Narrow truncates author names at 18 characters') + ' and the row says so ⚑.'),
      K.sel('Facets', 'Sections and writers', 'Sections · Sections and writers · Sections, writers and years. ' + b('Years need a route the site may not have') + ' ⚑.'),
      K.seg('Facet counts', ['Show', 'Hide'], 0, 'Ghost’s post counts at each row’s right. ' + b('They are the archive’s counts, not the query’s') + ' ⚑ — which is why they can be hidden.'),
      K.seg('Excerpt', ['Show', 'Hide'], 0, 'In the results column, clamped to 700. Hidden below 767 ⚑.'),
      K.sel('Result meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('New in this pass') + ' ⚑. ' + b('At Section and date the rail and the row stop repeating the tag') + ' when a section facet is active — a reason this row exists here.')
    ],
    trio: {},
    editing: `${b('filterHeading, sectionLabel, writerLabel and yearLabel edit inline')} with the ${b('P0·1')} toolbar — they are the rail’s own words. ${b('The facet rows are Ghost’s tags, authors and dates and their counts')} ⚑ — clicking one says ${b('“Edit in Ghost”')}. ${b('countLabel, emptyHeading, emptyText, recentLabel and suggestLabel are edited through the P0·6 switcher')} (No query · Results · No matches) ⚑.`,
    data: `Ghost tags, authors and — where the site has the route — dates: ${b('no Add, no Remove, no drag')} ⚑, and ${b('a facet group with fewer than two rows is not drawn')}. ${b('No Member Visibility row')} ⚑ — facets are navigation.`,
    settles: [
      `${b('No multi-select value')} ⚑ — not a simplification but a platform limit, stated in the panel: two facets at once has no Ghost route, so a checkbox here would be a control that cannot be honoured.`,
      `${b('No “sort” control.')} Ghost’s search returns its own order and a theme cannot re-rank it without holding the whole index; ${b('the count line says “Newest first” where the route is a collection')} and says nothing where it is a query ⚑.`,
      `${b('Rail width names its own truncation.')} At Narrow 200 a three-word author name is clipped at 18 characters with an ellipsis, and the full name stays in the DOM ⚑ — A18·3’s rule for clipped strings.`,
      `${b('Padding retired into the trio’s Vertical spacing')} and ${b('Result meta arrived')} ⚑ — the one control this design was missing, because a section facet and a section in the meta line say the same thing twice.`
    ]
  },
  respCap: 'TABLET 834 · RAIL HELD AT 240, RESULTS 474 · MOBILE 390 · RAIL BECOMES ONE DISCLOSURE ROW',
  tabletLabel: '834 · rail 240 · results 474 · excerpt hidden',
  mobileLabel: '390 · rail → one 44 px disclosure row ⚑ · native <details>',
  respNote: `Edge rail’s ladder with a bespoke collapse. ${b('834')} the rail holds its 240 and the results column takes 474 — ${b('the excerpt goes at 834 rather than 767 in this design alone')} ⚑, because 474 with a picture-less excerpt reads as a paragraph. ${b('≤ 767 the rail becomes a single 44 px disclosure row')} labelled with the active facet ⚑, using native ${code('<details>')} — ${code('accordion')}’s degradation, quoted: “Native ${code('&lt;details&gt;')} — fully functional, keyboard-operable, opens and closes with no JS at all.”`,
  darkNote: `A27’s step. ${b('The active facet’s 2 px accent underline is re-checked')}: ${code('#E0805A')} on ${code('#171511')} measures 6.9:1 as a text decoration, so it holds. ${b('The counts stay in the muted token')} — an accent count would be the section’s third accent use.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A 240 px column of sections, writers and optionally years beside the field and its results, one facet active at a time, each facet a link to a Ghost route.'),
    K.specRow(2, 'Structural descriptor', `${code('edge rail · none · page · many · none · facets pinned beside the results')}<br><span style="color:#6B6459">Archetype ${code('edge rail')} — the rail occupies the page layout rather than floating beside it, which is A1·11’s definition. It is the only ${code('edge rail')} in A23.</span>`),
    K.specRow(3, 'Archetype', 'edge rail. Two departures: ' + b('the excerpt leaves at 834 rather than 767') + ' ⚑, and ' + b('the rail becomes a disclosure row rather than a scrolling strip at 390') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} rail 240, gap 40, results 1,016, excerpt to 700. ${b('834')} rail 240, results 474, excerpt hidden ⚑. ${b('≤ 767')} rail → one 44 px ${code('<details>')} row above the results, results full width, meta the date.`),
    K.specRow(5, 'Content fields', `${code('filterHeading')} (opt ≤ 24, default “Narrow by”) · ${code('sectionLabel')} · ${code('writerLabel')} · ${code('yearLabel')} (each opt ≤ 20) · ${code('placeholder')} · ${code('countLabel')} · ${code('emptyHeading')} · ${code('emptyText')} · ${code('recentLabel')} · ${code('suggestLabel')}. ${b('The facet rows themselves are Ghost’s tags, authors and dates')} — never an authored list ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Rail side (Left · Right) · Rail width (Narrow 200 · Wide 240) · Facets (Sections · Sections and writers · Sections, writers and years) · Facet counts (Show · Hide) · Excerpt (Show · Hide) · Result meta (Section, author, date · Section and date · Date · Off). Then the universal trio outside the list and the shared source group.'),
    K.specRow(7, 'Data', `Ghost tags, authors and — where the site has the route — dates, with their post counts. ${b('0 facets')} → the rail is not drawn and the design is 1 Field and Results, and the panel says so ⚑. ${b('0 results')} → the no-match line in the results column, ${b('the rail unchanged and its counts unchanged')} ⚑. ${b('1')} → one row. ${b('many')} → to the cap.`),
    K.specRow(8, 'Empty state', 'No facet active → every count is the whole archive’s and the results are the unfiltered query ⚑. A facet group with fewer than two rows is not drawn — ' + b('a group of one is not a way to narrow anything') + ' ⚑. No year route on the site → no year group, whatever the control says.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')} for the field, ${b('filter-strip')} for the facets, and ${b('accordion')} for the 390 disclosure row — ${b('the only design in A23 with three')} ⚑, each edit-safe. ${b('filter-strip, quoted:')} “Filters are &lt;a href&gt; links to Ghost routes and work perfectly.” ${b('accordion, quoted:')} “Native &lt;details&gt; — fully functional, keyboard-operable, opens and closes with no JS at all.” ${b('The facets work with JavaScript off and the query’s results do not')} ⚑ — the rail is the part of this design that survives.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')}; the rail is a ${code('<nav aria-label="Narrow by">')} of ${code('<ul>')} groups, each with its own heading at ${code('h3')} under the section’s ${code('h2')} ⚑. The active row carries ${code('aria-current="page"')}. ${b('Counts are inside the link’s accessible name')} — “Reporting, 42 posts” ⚑. Rows 32 px in 44 px targets; the 390 disclosure is a real ${code('<summary>')}.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Result meta')} added; ${b('Search in')} and ${b('Match highlight')} joined the source group; ${b('the pre-query eyebrow reads “Featured”')} ⚑; the no-JS tile now says the facets work and the query’s results do not. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 14 · Load More
// ═══════════════════════════════════════════════════════════════════════
const d14 = {
  n: 14, name: 'Load More',
  rail: 'A23 SEARCH · DESIGN 14 OF 15 · PAPER PACK · FIVE CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'The result list with a button under it that appends the next batch. For an archive where a query can return sixty things and the reader should not have to choose a page number.',
    'A17·16’s load-more button, third use in the library, over A23’s result rows — with the progress line that says how much of the answer the reader has seen.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · TWENTY PER BATCH · BUTTON 45 TALL, CENTRED · PROGRESS LINE ABOVE',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const col = w === 1440 ? 820 : w === 834 ? 754 : 350;
    const btn = `<div style="display:flex;flex-direction:column;align-items:center;gap:12px">
      <span style="font-size:13px;color:${g.muted}">Showing 4 of 12</span>
      <span style="height:45px;${w === 390 ? 'width:100%;' : ''}display:inline-flex;align-items:center;justify-content:center;padding:0 24px;border:1px solid ${g.border};border-radius:24px;font-size:15px;font-weight:600;color:${g.text};box-sizing:border-box">More results</span></div>`;
    const inner = `<div style="max-width:${col}px;margin:0 auto;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:center">${K.searchField(g, { w:w === 390 ? '100%' : 520, full:w === 390, state:'typed', typed:'orbital' })}</div>
      ${K.gap(20)}${K.countLine(g, {})}${K.gap(10)}
      ${K.rows(t, g, { n:w === 390 ? 3 : 4, excerpt:w !== 390, meta:w === 390 ? 'date' : 'all', density:w === 390 ? 18 : 24, measure:col, titleSize:w === 390 ? 18 : 21, markOn:true })}
      ${K.gap(32)}${btn}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A17·16’s load-more button, carried verbatim: ${b('45 px tall, 24 px radius, Outline by default, centred, full width below 767')} ⚑. ${b('The progress line sits above the button, not below it')} ⚑ — a reader reads down, so the count belongs between the last row and the control that changes it. ${b('The button is a <button>, and Ghost’s numbered /page/2/ links are in the markup on every render')}, visually hidden — never ${code('display:none')} — which is why the no-JS branch is automatic.`,
  tileMin: 190,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const btn = (label, o2) => `<span style="height:40px;display:inline-flex;align-items:center;justify-content:center;padding:0 20px;border:1px solid ${(o2 || {}).exhausted ? g.border : g.border};border-radius:24px;font-size:14px;font-weight:600;color:${(o2 || {}).exhausted ? g.muted : g.text};${(o2 || {}).dim ? 'opacity:.7;' : ''}">${label}</span>`;
    const f = (st, ex) => K.searchField(g, { w:420, state:st, ...ex });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('empty')}${K.eyebrow(g, 'Featured')}${K.rows(t, g, { n:1, excerpt:false, density:0, measure:520, titleSize:18, ruleFirst:false })}${mono(t, 'NO QUERY, NO BUTTON ⚑ — FEATURED IS THREE ROWS AND ENDS', 10)}</div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('focus', { typedOnFocus:true, typed:'orbi' })}${K.countLine(g, { text:'12 results for', query:'orbi', fs:14 })}${mono(t, 'A NEW QUERY RESETS THE BATCH TO ONE ⚑', 10)}</div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { fs:14 })}${K.rows(t, g, { n:2, excerpt:false, meta:'all', density:10, measure:520, titleSize:18, markOn:true, ruleFirst:false })}<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><span style="font-size:12.5px;color:${g.muted}">Showing 2 of 12</span>${btn('More results')}</div></div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { text:'1 result for', query:'letterpress', fs:14 })}${K.rows(t, g, { n:1, list:[K.RESULTS[1]], excerpt:false, density:0, measure:520, titleSize:18, ruleFirst:false })}${mono(t, 'UNDER ONE BATCH THE BUTTON IS NOT RENDERED AT ALL ⚑', 10)}</div>`;
    if (s === 'none') return K.noResults(g, { query:'helioseismology', size:20, measure:520, chipN:3, gap:11 });
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.countLine(g, { fs:14 })}${K.rows(t, g, { n:1, excerpt:false, density:0, measure:520, titleSize:18, ruleFirst:false })}<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><span style="font-size:12.5px;color:${g.muted}">Showing 4 of 12</span>${btn('Loading', { dim:true })}</div>${mono(t, 'THE BUTTON KEEPS ITS WIDTH AND ITS NAME BECOMES “LOADING” ⚑ · A17·16', 10)}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('submitted')}<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span><div style="display:flex;align-items:center;gap:10px;font-size:14px;color:${g.muted}"><span style="color:${g.text};font-weight:600">1</span><span>2</span><span>3</span><span>Next →</span></div>${mono(t, 'GHOST’S NUMBERED /PAGE/2/ LINKS RENDER INSTEAD · FR-G4 · THEY PAGE THE ARCHIVE, NOT THE QUERY ⚑', 10)}</div>`;
  },
  statesNote: `${b('Three states this design owns alone')}: loading (the button keeps its width and its name becomes “Loading”), exhausted (${b('the button is replaced by “That is all 12”')} ⚑ — never left inert, A18·15’s rule), and ${b('the no-JS branch, which is Ghost’s numbered pagination')}. ${b('A new query resets the batch to one')} ⚑ — appending a second query’s results under a first query’s is the defect this control invites.`,
  extraTile: {
    label: 'WHAT THE BUTTON SETTLES',
    body: [
      `${b('Load-more, not infinite scroll')} ⚑. A34·7 owns ${code('infinite-scroll')} and owns no query; ${b('a search result list has a cap in the source group')}, and auto-loading past a stated cap makes the control a lie — A17 and A18’s refusal, carried.`,
      `${b('The batch is the cap’s first slice, not a second number')} ⚑. “How many results” in the source group is the total the section will ever show; Batch size is how much of it arrives at once. ${b('At Batch ≥ cap the button never renders.')}`,
      `${b('Focus moves to the first new result’s link after a press')} ⚑ — A18·15’s rule, and the visually-hidden ${code('aria-live="polite"')} region says “Four more results loaded. Showing 8 of 12.” ${b('Not the titles')}: a live region reciting four headlines is worse than silence.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE · SOLID DISABLES MATCH HIGHLIGHT ⚑',
    name: 'Load More', n: 14, count: 'FIVE',
    sub: 'A button that appends the next batch.',
    rows: [
      K.seg('Batch size', ['Ten', 'Twenty'], 1, 'Results per press. ' + b('At or above the source group’s cap the button never renders') + ' ⚑.'),
      K.seg('Button style', ['Outline', 'Solid', 'Text'], 0, 'A17·16’s three. ' + b('Solid is the section’s second accent use') + ' — with the field’s focus border that is the ceiling, so ' + b('Solid disables Match highlight in the source group') + ' ⚑, with the reason shown there. ' + b('The button takes an optional icon before or after its label') + ' from the P0·2 Icon Picker ⚑.'),
      K.seg('Progress', ['Count', 'Meter', 'Nothing'], 0, '“Showing 8 of 12”, a 2 px rule filling to the same proportion, or neither. ' + b('The live region persists at Nothing') + ' ⚑.'),
      K.seg('Excerpt', ['Show', 'Hide'], 0, 'One line, clamped to 820. Hidden below 767 ⚑.'),
      K.sel('Result meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('New in this pass') + ' ⚑ — a long appended list is where a shorter meta line pays. ' + b('The date alone at ≤ 767') + '.')
    ],
    trio: {},
    editing: `${b('loadMoreLabel, exhaustedLabel and progressLabel are the three strings this design owns')}, and ${b('they never show at rest together')} — each is edited in the state that draws it through the ${b('P0·6 switcher')}: No query · Results · No matches, plus the button’s own loading and exhausted states ⚑. ${b('Marks are allowed in them')} through the ${b('P0·1')} toolbar; ${b('the button’s label takes an icon')} from the ${b('P0·2')} picker, before or after, Small and label-coloured. ${b('Row content is Ghost’s')} ⚑ — “Edit in Ghost”.`,
    data: `Ghost posts and pages by scope: ${b('no Add, no Remove, no drag')} ⚑. ${b('A new query resets to batch one')} ⚑. ${b('No Member Visibility row')} ⚑ — a load-more button is not a call to action, it is pagination.`,
    settles: [
      `${b('Solid and Match highlight cannot both be on')} ⚑ — two accent uses is the brief’s ceiling and the button plus the focus border already reach it. ${b('The rule now spans two panels')}: the value is in the source group and the disable is stated in both.`,
      `${b('No “auto-load” value')} ⚑. That is A34·7 Endless and a different design in a different category; offering it here would be ${code('infinite-scroll')} inside a capped query.`,
      `${b('Five controls.')} Cut: result density (the batch is the rhythm), thumbnails (11 Thumb Rows), a count-line value — ${b('the count line and the progress line are one decision')} and Progress is it. ${b('Padding retired into the trio; Result meta arrived.')}`
    ]
  },
  respCap: 'TABLET 834 · UNCHANGED BUT NARROWER · MOBILE 390 · BUTTON FULL WIDTH, EXCERPT GOES',
  tabletLabel: '834 · list 754 · button centred at its own width',
  mobileLabel: '390 · button full width at 45 ⚑ · progress above it · excerpt hidden',
  respNote: `Feed’s ladder plus A17·16’s button rule. ${b('834')} nothing changes but the column. ${b('≤ 767')} ${b('the button goes full width')} ⚑ — A17·16’s rule, carried — the progress line stays above it, the excerpt goes and the meta drops to the date. ${b('Tablet is drawn because the button’s width rule changes at 767 and needs a frame either side of it.')}`,
  darkNote: `A27’s step. ${b('Outline’s hairline is')} ${code('#332E27')} ${b('and its label is the text token')}; ${b('Solid keeps the accent, re-checked at 8.9:1 against')} ${code('#171511')} ⚑. The progress meter’s filled part is the text token at 20 %, not the accent — ${b('a meter is not an action')} ⚑.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The result list with A17·16’s load-more button beneath it and a progress line above the button, appending a batch per press and resetting on a new query.'),
    K.specRow(2, 'Structural descriptor', `${code('feed · none · page · many · none · a button appends the next batch')}<br><span style="color:#6B6459">Its emphasis is the mechanism, which is what separates it from 1 Field and Results — same ground, same containment, same archetype family, and a control at the foot that changes the list’s length.</span>`),
    K.specRow(3, 'Archetype', 'feed. No departures in the rows; ' + b('one addition — the button goes full width below 767') + ' (A17·16).'),
    K.specRow(4, 'Responsive rule', `${b('1440')} list on 820, row padding 24, button at its own width centred, progress above. ${b('834')} list 754, otherwise unchanged. ${b('≤ 767')} button full width at 45 ⚑, excerpt hidden, meta the date, row padding 18.`),
    K.specRow(5, 'Content fields', `${code('placeholder')} · ${code('countLabel')} · ${code('loadMoreLabel')} (opt ≤ 20, default “More results”) · ${code('exhaustedLabel')} (opt ≤ 30, default “That is all {n}”) · ${code('progressLabel')} (opt ≤ 30, default “Showing {m} of {n}”) · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. ${b('eyebrow, heading and blurb stored and not drawn')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Batch size (Ten · Twenty) · Button style (Outline · Solid · Text, with an optional P0·2 icon before or after the label) · Progress (Count · Meter · Nothing) · Excerpt (Show · Hide) · Result meta (Section, author, date · Section and date · Date · Off). Five, plus the universal trio outside the list and the shared source group — where ' + b('Solid disables Match highlight') + ' ⚑.'),
    K.specRow(7, 'Data', `Ghost posts and pages. ${b('0')} → the no-match block, ${b('no button')} ⚑. ${b('1')} → one row, no button. ${b('fewer than one batch')} → no button at all ⚑. ${b('many')} → batches to the cap, then the exhausted label. ${b('A new query resets to batch one')} ⚑.`),
    K.specRow(8, 'Empty state', 'No query → featured as three rows and no button ⚑ — featured is not a query and cannot be paged. Exhausted → the button is replaced by the exhausted label, ' + b('never left in place and disabled') + ' ⚑.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')} and ${b('load-more')} ⚑. Both edit-safe: in the editor neither runs, and the resting frame is the first batch with a resting button. ${b('load-more, quoted:')} “Ghost’s numbered ${code('/page/2/')} pagination links render instead (FR-G4, explicitly).” ${b('Those links are in the markup on every render')}, visually hidden and never ${code('display:none')} ⚑, so the branch needs no detection — ${b('and they page the archive, not the query')} ⚑: Ghost cannot search server-side, so with JavaScript off the reader gets the field, the archive link and Ghost’s own pagination.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')}; a real ${code('<button>')} in a ${code('<nav aria-label="Pagination">')} beside the hidden ${code('<ol>')} of page links. ${b('A visually-hidden aria-live="polite" region announces the count, not the titles')} ⚑; ${b('focus moves to the first new result’s link')} (A18·15). ${code('aria-busy')} on the list while loading; the button’s name becomes “Loading” and its width is reserved. The meter is ${code('aria-hidden')}.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Result meta')} added; ${b('Search in')} and ${b('Match highlight')} joined the source group, ${b('Solid still disabling the mark')} ⚑ with the reason stated in both panels; the button gained ${b('an optional P0·2 icon')}; ${b('“most read” became “featured”')}; the no-JS tile now says Ghost’s numbered links page the archive rather than the query. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 15 · Grouped
// ═══════════════════════════════════════════════════════════════════════
const d15 = {
  n: 15, name: 'Grouped',
  rail: 'A23 SEARCH · DESIGN 15 OF 15 · PAPER PACK · SIX CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'The results split into labelled groups on the page — posts, then pages, then tags and writers — each group a short list under its own heading.',
    'It is 3 Command Palette’s grouping without the overlay: the same answer to the same problem, drawn in the page for a publication whose search route is a real page rather than a panel.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · THREE GROUPS · GROUP HEADING 22 · THREE ROWS EACH',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const col = w === 1440 ? 820 : w === 834 ? 754 : 350;
    const group = (label, count, body) => `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 10 : 14}px">
      <div style="display:flex;align-items:baseline;gap:10px;border-bottom:1px solid ${g.border};padding-bottom:10px">
        <span style="font-family:Georgia,serif;font-size:${w === 390 ? 19 : 22}px;font-weight:700;color:${g.text}">${label}</span>
        <span style="font-size:13px;color:${g.muted}">${count}</span></div>${body}</div>`;
    const tagRows = `<div style="display:flex;flex-direction:column">${[['Reporting', '42 posts'], ['Orbital mechanics', '6 posts']].map(([l, c], i) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;${i ? `border-top:1px solid ${g.border};` : ''}">
      <span style="font-size:17px;font-weight:600;color:${g.text}">${K.hl(g, l, 'orbital', true)}</span><span style="font-size:13px;color:${g.muted}">${c}</span></div>`).join('')}</div>`;
    const inner = `<div style="max-width:${col}px;margin:0 auto;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:center">${K.searchField(g, { w:w === 390 ? '100%' : 520, full:w === 390, state:'typed', typed:'orbital' })}</div>
      ${K.gap(20)}${K.countLine(g, { text:'12 results for' })}${K.gap(w === 390 ? 26 : 36)}
      <div style="display:flex;flex-direction:column;gap:${w === 390 ? 30 : 44}px">
        ${group('Posts', '9', K.rows(t, g, { n:3, excerpt:w !== 390, meta:w === 390 ? 'date' : 'all', density:w === 390 ? 14 : 20, measure:col, titleSize:w === 390 ? 18 : 20, markOn:true, ruleFirst:false }))}
        ${group('Pages', '1', K.rows(t, g, { n:1, list:[{ t:'Orbital atlas — the standing page', tag:'Page', a:'Orbit Weekly', d:'Updated 4 Aug 2026', r_:'', x:'The plates, the corrections and the printing notes, kept in one place.' }], excerpt:w !== 390, meta:'tag', density:w === 390 ? 14 : 20, measure:col, titleSize:w === 390 ? 18 : 20, markOn:true, ruleFirst:false, read:false }))}
        ${group('Tags and writers', '2', tagRows)}</div>
      ${K.gap(20)}${mono(t, 'GROUPS RUN TO THREE ROWS EACH, THEN A “SEE ALL IN POSTS” ROW ⚑', 10)}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `3 Command Palette’s grouping, drawn in the page: ${b('a 22 px heading-font group label with Ghost’s count beside it over a hairline, then that group’s rows')} ⚑. ${b('A group with nothing in it is not drawn')} ⚑ — the palette’s rule, carried, and the reason this design never shows an empty heading. ${b('Tags and writers share one group')} and their rows are ${b('a name and a post count, not a title and a date')} ⚑: a tag is not a piece of writing and should not be dressed as one.`,
  tileMin: 200,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const gh = (l, c) => `<div style="display:flex;align-items:baseline;gap:8px;border-bottom:1px solid ${g.border};padding-bottom:7px"><span style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:${g.text}">${l}</span><span style="font-size:12px;color:${g.muted}">${c}</span></div>`;
    const f = (st, ex) => K.searchField(g, { w:420, state:st, ...ex });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('empty')}${gh('Featured', '3')}${K.rows(t, g, { n:1, excerpt:false, density:0, measure:520, titleSize:17, ruleFirst:false })}${mono(t, 'BEFORE A QUERY THERE IS ONE GROUP ⚑ — GROUPING FEATURED BY TYPE IS A FICTION', 10)}</div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('focus', { typedOnFocus:true, typed:'orbi' })}${gh('Posts', '9')}${K.rows(t, g, { n:1, excerpt:false, density:0, measure:520, titleSize:17, markOn:true, ruleFirst:false })}${mono(t, 'GROUPS APPEAR AND DISAPPEAR AS THE QUERY CHANGES ⚑', 10)}</div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${gh('Posts', '9')}${K.rows(t, g, { n:1, excerpt:false, meta:'all', density:0, measure:520, titleSize:17, markOn:true, ruleFirst:false })}${gh('Tags and writers', '2')}<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:15px;font-weight:600;color:${g.text}">Reporting</span><span style="font-size:12.5px;color:${g.muted}">42 posts</span></div></div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${gh('Posts', '1')}${K.rows(t, g, { n:1, list:[K.RESULTS[1]], excerpt:false, density:0, measure:520, titleSize:17, ruleFirst:false })}${mono(t, 'ONE GROUP, ONE ROW · THE OTHER LABELS ARE NOT DRAWN ⚑', 10)}</div>`;
    if (s === 'none') return K.noResults(g, { query:'helioseismology', size:20, measure:520, chipN:3, gap:11 });
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('searching')}<div style="opacity:.45">${gh('Posts', '9')}${K.rows(t, g, { n:1, excerpt:false, density:0, measure:520, titleSize:17, ruleFirst:false })}</div>${mono(t, 'GROUPS HOLD THEIR ORDER AND THEIR HEADINGS WHILE THE QUERY RUNS ⚑', 10)}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('submitted')}<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span>${mono(t, 'NO JS · NO GROUPS AND NO ROWS ⚑ · THE ROUTE CANNOT SEARCH SERVER-SIDE', 10)}</div>`;
  },
  statesNote: `${b('Groups appear and disappear as the query changes')} ⚑, which is the state behaviour this design owns: three groups for one word, one for another, and no empty headings ever. ${b('Before a query there is exactly one group')} — featured — ${b('because grouping three featured posts by object type would be a fiction')} ⚑.`,
  extraTile: {
    label: 'WHAT THE GROUPS SETTLE',
    body: [
      `${b('A tag row is not a post row')} ⚑ — name and post count, 17 px semibold, no date, no excerpt, no reading time. Dressing a tag as an article is the commonest grouped-search defect.`,
      `${b('Group order is authored, not ranked')} ⚑. Ghost gives a theme no relevance score across object types, so “best match first” would be an invented ranking. ${b('The control offers two orders and both are stated as arrangements')}, not relevance.`,
      `${b('Three rows a group, then a way in.')} A “See all 9 in Posts” row rather than a longer group ⚑ — the same call 2 Overlay makes about its panel, for the same reason: a long group buries the groups below it.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE',
    name: 'Grouped', n: 15, count: 'SIX',
    sub: 'Results grouped by what they are.',
    rows: [
      K.seg('Group order', ['Posts first', 'Most matches first'], 0, b('Neither is relevance') + ' ⚑ — Ghost gives a theme no cross-type score. Posts first is fixed; Most matches first orders the groups by their own counts.'),
      K.seg('Group labels', ['Heading', 'Eyebrow'], 0, 'A 22 px heading-font label over a hairline, or a 13 px uppercase eyebrow with no rule. ' + b('Both are real h3s') + ' ⚑.'),
      K.seg('Rows per group', ['Three', 'Five'], 0, 'Then a “See all in {group}” row where the group is longer. ' + b('A tags-and-writers group is capped at four whatever the value') + ' ⚑ — a list of names is not the answer to a query.'),
      K.seg('Excerpt', ['Show', 'Hide'], 0, 'In post and page rows only; ' + b('never in a tag row') + ' ⚑. Hidden below 767.'),
      K.sel('Result meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('New in this pass') + ' ⚑ — post and page rows only; ' + b('a tag row is a name and a count and takes no meta') + ' ⚑.'),
      K.seg('Group counts', ['Show', 'Hide'], 0, 'Ghost’s count beside each label. ' + b('These are the query’s counts, not the archive’s') + ' ⚑ — unlike 13 Facet Rail’s, and the difference is stated in both panels.')
    ],
    trio: {},
    editing: `${b('The four group labels edit inline')} — ${code('postsLabel')}, ${code('pagesLabel')}, ${code('tagsLabel')}, ${code('authorsLabel')} — with the ${b('P0·1')} toolbar, ${b('in place, at their drawn size')} ⚑. ${b('Post, page, tag and author names and their counts are Ghost’s')} ⚑ — “Edit in Ghost”. ${b('countLabel, seeAllLabel, emptyHeading, emptyText, emptyLinkLabel, recentLabel and suggestLabel are edited through the P0·6 switcher')}: No query · Results · No matches ⚑.`,
    data: `Ghost posts, pages, tags and authors by scope: ${b('no Add, no Remove, no drag')} ⚑. ${b('An empty group is absent, label and all')} ⚑. ${b('No Member Visibility row')} ⚑ — every row here is a link.`,
    settles: [
      `${b('Group counts here are the query’s; 13 Facet Rail’s are the archive’s')} ⚑. Two designs, two numbers, both named — because a reader cannot tell them apart and a developer must.`,
      `${b('No “which groups” control')} ⚑ — that is the source group’s scope. Search posts and there is one group; search everything and there are four.`,
      `${b('Six controls and no seventh.')} Cut: thumbnails (11 Thumb Rows), density (rows-per-group is the rhythm), a per-group control of any kind — ${b('a control writes one value onto the section')}, so “posts bigger than pages” is not expressible and asking for it is asking for two designs ⚑.`,
      `${b('Padding retired into the trio’s Vertical spacing')}; ${b('Result meta arrived')}; ${b('the no-JS claim that the route could render these groups server-side is struck')} ⚑ — Ghost has no server-side search, so with JavaScript off there are no groups at all.`
    ]
  },
  respCap: 'TABLET 834 · GROUPS UNCHANGED, COLUMN 754 · MOBILE 390 · LABELS 19, EXCERPT GOES',
  tabletLabel: '834 · groups unchanged · column 754 · gap 44',
  mobileLabel: '390 · label 19 · group gap 30 · excerpt hidden · meta is the date',
  respNote: `Feed’s ladder, with the group gap as its own quantity. ${b('1440')} 44 px between groups, label 22, rows at 20 padding. ${b('834')} unchanged but narrower. ${b('≤ 767')} ${b('the group gap falls to 30 and the label to 19')} ⚑, excerpt hidden, meta the date. ${b('The groups never become tabs')} ⚑ — that is A5·12’s pattern and would hide two-thirds of the answer behind a control.`,
  darkNote: `A27’s step. ${b('The group hairline is the same')} ${code('#332E27')} ${b('as the row rules')}, which is deliberate: ${b('the label’s size does the separating, not a heavier line')} ⚑ — a two-weight rule system inside one list is the thing hairlines-never-heavy-borders is meant to prevent.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The results split into labelled groups by object type — posts, pages, tags and writers — each a short list under a 22 px heading with its count, in one page column.'),
    K.specRow(2, 'Structural descriptor', `${code('feed · none · page · variable · none · results grouped by what they are')}<br><span style="color:#6B6459">Item-count ${code('variable')} — the author sets rows per group and the query decides how many groups. It is what separates this from 14 Load More and 1 Field and Results, which are ${code('many')} on the same ground.</span>`),
    K.specRow(3, 'Archetype', 'feed. One departure: ' + b('the group gap is a quantity of its own and steps at 767') + ' ⚑, where an ordinary feed has only row density.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} column 820, group gap 44, label 22 over a hairline, three rows a group at 20 padding. ${b('834')} column 754, otherwise unchanged. ${b('≤ 767')} group gap 30, label 19, excerpt hidden, meta the date, row padding 14.`),
    K.specRow(5, 'Content fields', `${code('postsLabel')} · ${code('pagesLabel')} · ${code('tagsLabel')} · ${code('authorsLabel')} (each opt ≤ 20, defaulting to the object name) · ${code('placeholder')} · ${code('countLabel')} · ${code('seeAllLabel')} · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. ${b('eyebrow, heading and blurb stored and not drawn')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Group order (Posts first · Most matches first) · Group labels (Heading · Eyebrow) · Rows per group (Three · Five) · Excerpt (Show · Hide) · Result meta (Section, author, date · Section and date · Date · Off) · Group counts (Show · Hide). Then the universal trio outside the list and the shared source group.'),
    K.specRow(7, 'Data', `Ghost posts, pages, tags and authors by scope. ${b('0')} → the no-match block, no group labels ⚑. ${b('1')} → one group, one row, other labels absent ⚑. ${b('many')} → three or five a group, then a “See all in {group}” row. ${b('A tag row carries its post count; an author row does not')} ⚑ — Ghost gives one cheaply and not the other.`),
    K.specRow(8, 'Empty state', 'No query → one group, “Featured”, three rows ⚑. An empty group is absent, label and all. ' + b('A site with no pages and no public tags reduces this design to one group') + ' — drawn, and the panel names 1 Field and Results as the better design ⚑.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')}. Edit-safe. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — and ${b('the claim that the route can render the groups server-side is struck')} ⚑: Ghost has no server-side search and cannot read ${code('?q=')}, so with JavaScript off there are no groups and no rows, only the field and the archive link.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')}; ${b('each group label is a real h3 under the section’s h2')} ⚑ and stays one at Group labels: Eyebrow. Rows are a ${code('<ul>')} per group. ${b('A tag row’s accessible name is “Reporting, tag, 42 posts”')} ⚑ so its type is spoken, not inferred from a glyph. Count line is a polite live region. Group counts are inside the heading’s text, not a separate element.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Result meta')} added (post and page rows only); ${b('Search in')} and ${b('Match highlight')} joined the source group; ${b('the pre-query group label reads “Featured”')} ⚑; ${b('the server-side grouping claim is struck')} ⚑ and the no-JS tile redrawn as field and archive link. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

globalThis.A23D = (globalThis.A23D || []).concat([d11, d12, d13, d14, d15]);
})();
