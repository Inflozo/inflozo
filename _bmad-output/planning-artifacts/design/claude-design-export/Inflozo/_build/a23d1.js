// A23 designs 1–5 · Field and Results · Overlay · Command Palette · Split Head · Tag Chips
(function () {
const K = globalThis.A23LIB, P = globalThis.A23PAGE;
const { MONO, b, code } = K;

// ── shared A23 drawing helpers, reused by d2 and d3 ────────────────────
const mono = (t, txt, size) => `<span style="font-family:${MONO};font-size:${size || 10}px;color:${t.muted}">${txt}</span>`;
const moreNote = (t, g, txt) => `<div style="border-top:1px solid ${g.border};padding-top:10px;margin-top:2px">${mono(t, txt || 'ROWS 5–12 CONTINUE BELOW · FOUR DRAWN SO THE FRAME FITS ⚑')}</div>`;

// count line + rows + the frame's own "more rows" caption
function listBlock(t, g, w, o) {
  o = o || {};
  const n = o.n || (w === 390 ? 3 : 4);
  return `<div style="display:flex;flex-direction:column;gap:${o.gapAbove === undefined ? 18 : o.gapAbove}px;${o.width ? `width:${o.width}px;` : ''}">
    ${o.count === false ? '' : K.countLine(g, { text:o.countText || '12 results for', query:o.query || 'orbital', pack:o.pack })}
    ${K.rows(t, g, { n, excerpt:w === 390 ? false : (o.excerpt !== false), meta:w === 390 ? 'date' : (o.meta || 'all'),
      density:o.density === undefined ? (w === 390 ? 18 : 24) : o.density, measure:o.measure || 820,
      thumb:o.thumb, thumbSide:o.thumbSide, titleSize:o.titleSize || (w === 390 ? 18 : 21), markOn:o.markOn,
      hung:o.hung, pack:o.pack, ruleFirst:o.ruleFirst })}
    ${o.more === false ? '' : moreNote(t, g, o.moreText)}</div>`;
}
globalThis.A23X = { mono, moreNote, listBlock };

const SETTLE_STATES = {
  label: 'WHAT THE SEVEN STATES SETTLE FOR THE WHOLE CATEGORY',
  body: [
    `${b('The count line is the announcement.')} Where results replace in place without a navigation it is a visually-hidden ${code('aria-live="polite"')} region as well as visible text — “12 results for orbital” ⚑. ${b('Where the query was a page navigation there is no live region')}: A34’s rule, a page navigation announces itself.`,
    `${b('One row, two densities')} ⚑ — the suggestion row is title plus “section · author · date”, and the result row is that same row with an excerpt. A1·9’s accessible name, matched exactly.`,
    `${b('No matches is a content state, not an error.')} No red, no icon: the query in the heading, one line of why, and the section chips as the way out. ${b('The line names the index')} — and ${b('the index is whatever the source group’s Search in row says it is')} ⚑, so a reader who searched a word inside an article is told which of the two they asked for.`,
    `${b('The no-JS floor is the field and the archive link')} ⚑ — a Ghost template cannot read ${code('?q=')} or search server-side, so a GET to /search/ lands on a page whose results the same client module renders. ${b('No JavaScript, no results, in any of the fifteen')} — every no-JS frame in the category draws that rather than a rendered list.`
  ]
};

// ═══════════════════════════════════════════════════════════════════════
// 1 · Field and Results
// ═══════════════════════════════════════════════════════════════════════
const d1 = {
  n: 1, name: 'Field and Results',
  rail: 'A23 SEARCH · DESIGN 1 OF 15 · PAPER PACK · SIX CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'A centred head, one field beneath it, and the results in a single column on the page ground. The category default and the arrangement the other fourteen depart from.',
    'It is the design for a publication whose search is a page: the reader arrives at /search/, types, and the list under the field changes. Nothing is raised, banded or photographed.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FIELD 520 CENTRED · LIST HELD TO A 820 MEASURE',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const col = w === 1440 ? 820 : w === 834 ? 754 : 350;
    const fw = w === 390 ? '100%' : 520;
    const inner = `<div style="max-width:${col}px;margin:0 auto;display:flex;flex-direction:column">
      ${K.headBlock(g, w, { align:'center', eyebrowText:'The archive', headingText:'Search the archive', blurbText:'Every issue since 2019 — reporting, interviews and the picture desk’s own notes.', measure:560 })}
      ${K.gap(26)}
      <div style="display:flex;justify-content:center">${K.searchField(g, { w:fw, full:w === 390, state:'typed', typed:'orbital', ph:'Search 412 essays and interviews' })}</div>
      ${K.gap(10)}
      <div style="display:flex;justify-content:center"><span style="font-size:13px;color:${g.muted}">Title and excerpt are searched — not the body of an article.</span></div>
      ${K.gap(w === 390 ? 30 : 40)}
      ${listBlock(t, g, w, { markOn:true, width:col })}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A4·15’s 52 px search field, carried verbatim — ${b('surface fill, the border token, a 19 px glyph, 16 px text and a 32 px clear control inside a 44 px target')}. ${b('The list takes A18’s 820 measure')} and is centred under a centred head ⚑, so the field and the list share one axis instead of the list running the full 1,296. The match is marked with a 16 % accent tint; ${b('the mark and the focus border are the section’s two accent uses')} ⚑.`,
  tileMin: 186,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const f = (st, ex) => K.searchField(g, { w:420, state:st, ...ex });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('empty')}
      <div style="display:flex;flex-direction:column;gap:2px">${K.eyebrow(g, 'Recent searches')}
      ${K.RECENT.map(r => K.suggestRow(g, { label:r, px:0, glyph:'↺' })).join('')}</div></div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${f('focus', { typedOnFocus:true, typed:'orbi' })}
      ${K.countLine(g, { text:'12 results for', query:'orbi' })}
      ${K.rows(t, g, { n:1, excerpt:false, density:0, measure:520, titleSize:19, markOn:true, ruleFirst:false })}
      ${mono(t, 'THREE CHARACTERS RUN THE QUERY · 200 MS DEBOUNCE · A1·9’S NUMBERS ⚑', 10)}</div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${K.countLine(g, {})}
      ${K.rows(t, g, { n:2, density:14, measure:560, titleSize:19, markOn:true, ruleFirst:false })}</div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${K.countLine(g, { text:'1 result for', query:'letterpress' })}
      ${K.rows(t, g, { n:1, list:[K.RESULTS[1]], q:'atlas', density:0, measure:560, titleSize:19, ruleFirst:false })}
      ${mono(t, 'ONE ROW KEEPS THE COLUMN AND THE MEASURE · NOTHING STRETCHES ⚑', 10)}</div>`;
    if (s === 'none') return K.noResults(g, { query:'helioseismology', measure:560, chipN:4 });
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${f('searching')}
      <div style="opacity:.45">${K.rows(t, g, { n:2, excerpt:false, density:12, measure:560, titleSize:19, ruleFirst:false })}</div>
      ${mono(t, 'THE LIST HOLDS ITS HEIGHT AND DIMS ONE STEP · NO SPINNER ⚑', 10)}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${f('submitted')}
      <span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span>
      ${mono(t, 'GET /search/?q=orbital · THE ROUTE SERVES THE FIELD AND THE ARCHIVE LINK · NO RESULTS ⚑', 10)}
      <span style="font-size:12.5px;line-height:1.6;color:${g.muted}">${b('Ghost cannot read a query string or search server-side')} ⚑, so the submitted page is rendered by the same client module. ${b('No JavaScript, no results')} — the honest floor is the field, server-rendered, and a link into the archive.</span></div>`;
  },
  statesNote: `${b('Seven states, one field.')} The field never moves between them: 52 px, the same 520 width, the same axis. ${b('Before a query the list slot carries the reader’s own recent searches')}, then the site’s featured posts — the shared source group chooses which, and ${b('“most read” is no longer offered')} ⚑ because Ghost gives a theme no view counts. ${b('Searching dims the previous list rather than emptying it')} ⚑, so the page does not jump between a full list and a blank one on every keystroke.`,
  extraTile: SETTLE_STATES,
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE · QUICK: ALIGNMENT, FIELD WIDTH, RESULT DENSITY',
    name: 'Field and Results', n: 1, count: 'SIX',
    sub: 'A centred field with the results beneath it.',
    rows: [
      K.seg('Alignment', ['Centred', 'Left'], 0, 'Centred puts head, field and list on one 820 axis. Left pins all three to the content box’s left edge and the list keeps its 820 measure.'),
      K.sel('Field width', 'Medium 520', 'Narrow 400 · Medium 520 · Wide 640. A4·15’s three widths ⚑. Steps one value down at 1080 and below; full width at 390.'),
      K.seg('Result density', ['Compact', 'Comfortable', 'Spacious'], 1, '16 · 24 · 36 of row padding — A18’s row ladder, carried.'),
      K.seg('Excerpt', ['Show', 'Hide'], 0, 'One line, clamped to the 820 measure. ' + b('Hidden below 767 whatever the value') + ' ⚑.'),
      K.sel('Result meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('New in this pass') + ' ⚑ — only 2 Overlay and 10 Grid governed their meta before it. ' + b('Steps down to the date alone at ≤ 767') + ' whatever the value.'),
      K.seg('Count line', ['Show', 'Hide'], 0, 'At Hide the visible line goes and ' + b('the live region stays') + ' ⚑ — the announcement is not decoration.')
    ],
    trio: {},
    editing: `${b('Every visible authored text edits inline on canvas')} with the ${b('P0·1')} toolbar — bold · italic · underline · link, the link popover carrying ${b('Open in new tab')} and rel ${b('nofollow · noreferrer · sponsored')}: the eyebrow, the heading, the blurb and the note. ${b('Post titles, excerpts, tag and author names are Ghost’s')} ⚑ — clicking one says ${b('“Edit in Ghost”')}. ${b('The strings that never show at rest')} — ${code('countLabel')}, ${code('emptyHeading')}, ${code('emptyText')}, ${code('emptyLinkLabel')}, ${code('recentLabel')}, ${code('suggestLabel')} — ${b('are edited in the state that draws them, through the P0·6 switcher')}: No query · Results · No matches ⚑. The archive link opens the Ghost-aware ${b('Link Picker')}.`,
    data: `Results are Ghost’s posts and pages, so ${b('P0·3’s Ghost-sourced rules apply')}: no Add, no Remove, no drag ⚑ — “Add and remove them in Ghost; this design chooses how many to show.” ${b('Order is the query’s answer')} and is not selectable. ${b('No Member Visibility row')} ⚑ — nothing in A23 is a CTA: the field is a form and the archive link is navigation.`,
    settles: [
      `${b('Padding is gone from this list')} ⚑ — it was the trio’s ${b('Vertical spacing')} under another name, and the same three values now sit outside the list with every other section in the library.`,
      `${b('Nothing here is per-result.')} Density, excerpt, meta and the count line write one value onto the section; the stylesheet reads it for every row. ${b('A row is content, not a design')} — selecting one on the canvas is selecting a post, and posts are edited in Ghost.`,
      `${b('The source group is where search itself is configured')}: what it searches, ${b('how deep')} ⚑, what stands in before a query, the character minimum, the cap, the match mark, and the read-only line that reports the index rather than asserting it.`
    ]
  },
  respCap: 'TABLET 834 · FIELD HELD AT 520, LIST TAKES 754 · MOBILE 390 · FIELD FULL WIDTH, EXCERPT GOES',
  tabletLabel: '834 · heading 34 · field 520 · list 754 · padding 80',
  mobileLabel: '390 · field full width at 52 · excerpt hidden · meta is the date',
  respNote: `Form’s ladder with one departure. ${b('The field keeps 52 px at every width')} — A4·15’s rule, because a search field is the page’s primary action ⚑ — and goes full width at 390 rather than stepping to a third named value. ${b('At ≤ 767 the excerpt is hidden and the meta drops to the date')}, A18·2’s rule; the title holds two lines and the mark survives. Nothing else moves.`,
  darkNote: `A27’s dark step: ground ${code('#171511')}, the field on ${code('#211D17')} inside a ${code('#332E27')} hairline, hairlines between rows at the same value. ${b('The field is a step above the ground in both modes')} ⚑ — in light it is white on ${code('#FBF9F5')}, in dark it lifts rather than deepens. ${b('The mark re-tunes from 16 % to 22 % accent')} ⚑; at 16 % it disappears on a dark ground.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A centred eyebrow, heading and blurb; one 52 px field beneath; the results in one column on the page ground, head, field and list sharing an 820 axis. The category default.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · page · many · none · field above a single result column')}<br><span style="color:#6B6459">Containment ${code('none')} — the section sits in nothing. Ground ${code('page')}. Item-count ${code('many')}: the list is built for five or more and holds at one.</span>`),
    K.specRow(3, 'Archetype', 'form. No departures — the field is the form, the list is its output, and both stack at 767.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} content 1,296 on a 72 margin; head, field and list centred on 820; field 520; row padding 24; padding 96. ${b('834')} heading 34, list 754, field 520 held, padding 80. ${b('≤ 767')} heading 28, field full width at 52, excerpt hidden, meta the date alone, row padding 18, padding 64.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} (opt ≤ 24) · ${code('heading')} (opt ≤ 60) · ${code('blurb')} (opt ≤ 240) · ${code('placeholder')} (opt ≤ 40, default “Search 412 essays and interviews” with the live post count) · ${code('note')} (opt ≤ 90) · ${code('countLabel')} (opt ≤ 40, default “{n} results for “{q}””) · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. ${b('No image field')} — 12 Cover owns imagery.`)
  ], [
    K.specRow(6, 'Controls', 'Alignment (Centred · Left) · Field width (Narrow 400 · Medium 520 · Wide 640) · Result density (Compact · Comfortable · Spacious) · Excerpt (Show · Hide) · Result meta (Section, author, date · Section and date · Date · Off) · Count line (Show · Hide). Then the universal trio outside the list — Background role, Vertical spacing, Top divider — and the seven-row Search source group, not counted.'),
    K.specRow(7, 'Data', `Ghost posts and pages, by the source group’s scope. ${b('0 results')} → the no-match block, chips and archive link. ${b('1')} → one row, no stretch, count line reads “1 result”. ${b('many')} → the list runs to the cap and the count names the true total ⚑. Before a query: recent searches (the reader’s own, local), then featured posts ⚑.`),
    K.specRow(8, 'Empty state', 'Three empties, three answers. No query → recent searches, else featured, else the field alone. No matches → the block. No excerpt on a post → the title and meta close up; the row does not reserve the line ⚑.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')} — the query surface: 200 ms debounce, three-character minimum, live count. Edit-safe: the module does not run in the editor, and the resting frame is the field with the route’s server-rendered list. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — ${b('and the route cannot render results either')} ⚑: Ghost has no server-side search and no access to the query string, so the honest floor is the field and the archive link, server-rendered.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')} with a visually-hidden label and ${code('<input type="search" enterkeyhint="search">')}. The section heading is an ${code('h2')} ⚑ (A29 owns the route’s ${code('h1')}). ${b('The list is a <ul> in the document, not a combobox')} ⚑ — arrow keys are the browser’s. Count line doubles as a polite live region. Clear control named “Clear search”, 44 px. Muted meta 5.4:1 on ${code('#FBF9F5')}.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Result meta')} added, four values; ${b('Search in')} and ${b('Match highlight')} joined the source group and ${b('“most read” became “featured”')} ⚑; the no-JS state redrawn as field and archive link. ${b('No Member Visibility')} ⚑ — no CTA here — and ${b('no Preview control existed to remove')}.`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 2 · Overlay
// ═══════════════════════════════════════════════════════════════════════
const OVER_ROWS = (t, g, n, thumb) => K.rows(t, g, {
  n, excerpt:false, meta:'all', density:0, titleSize:17, thumb, measure:520, markOn:true, ruleFirst:false, rule:false,
  style:'', align:'center'
});

function overlayPanel(t, w, o) {
  o = o || {};
  const g = K.ground(t, 'surface');
  const pw = w === 390 ? 350 : (o.w || 640);
  const rowsN = o.n || 5;
  const list = K.RESULTS.slice(0, rowsN).map((r, i) => `<div style="padding:0 8px;${i === 0 && o.active !== false ? '' : ''}">
    <div style="display:flex;align-items:center;gap:14px;padding:12px 12px;border-radius:${Math.min(g.r, 8)}px;${i === 0 && o.active !== false ? `background:${t.hover};` : ''}">
      ${o.thumb ? K.plate(t, { w:o.thumb, h:Math.round(o.thumb / 1.5), r:6 }) : ''}
      <div style="display:flex;flex-direction:column;gap:4px;min-width:0;flex:1">
        <span style="font-family:Georgia,serif;font-size:17px;font-weight:700;line-height:1.3;color:${g.text};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${K.hl(g, r.t, 'orbital', true)}</span>
        <span style="font-size:13px;color:${g.muted};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${r.tag} · ${r.a} · ${r.d}</span>
      </div>${i === 0 && o.active !== false ? `<span style="font-family:${MONO};font-size:10px;color:${g.muted};flex-shrink:0">↵</span>` : ''}</div></div>`).join('');
  const body = `<div style="padding:0 0 8px">
    <div style="height:60px;display:flex;align-items:center;gap:12px;padding:0 18px;border-bottom:1px solid ${t.border};box-sizing:border-box">
      <span style="font-size:19px;line-height:1;color:${g.text}">⌕</span>
      <span style="flex:1;font-size:17px;color:${g.text};font-family:'Inter',sans-serif">orbital</span>
      <span style="width:32px;height:32px;border-radius:8px;border:1px solid ${t.border};display:flex;align-items:center;justify-content:center;font-size:13px;color:${g.muted}">✕</span></div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px 8px">
      <span style="font-size:13px;color:${g.muted}">12 results for <span style="color:${g.text};font-weight:600">“orbital”</span></span>
      <span style="font-size:13px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">See all 12 →</span></div>
    ${list}
    ${o.foot === false ? '' : `<div style="border-top:1px solid ${t.border};margin-top:8px;padding:12px 18px 4px;display:flex;align-items:center;justify-content:space-between">
      ${K.keyHint(g, [['↑↓', 'move'], ['↵', 'open'], ['esc', 'close']])}
      <span style="font-family:${MONO};font-size:10px;color:${g.muted}">SEARCH IS A DIALOG ⚑</span></div>`}</div>`;
  return K.panelEl(t, g, { w:pw, body });
}

const d2 = {
  n: 2, name: 'Overlay',
  rail: 'A23 SEARCH · DESIGN 2 OF 15 · PAPER PACK · SIX CONTROLS OF ITS OWN · + THE SEARCH SOURCE · NO UNIVERSAL TRIO: NOT PLACED ON THE CANVAS ⚑ · RECONCILED 25 AUG 2026',
  paras: [
    'A panel over the dimmed page, holding the field and five suggestion rows. This is the surface A1·9 Search-Forward opens, drawn once here so every header in the library opens the same thing.',
    'It is the only design in A23 that is not part of the page it sits on: nothing above or below it moves, the page keeps its scroll position, and Escape returns the reader exactly where they were.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · PANEL 640 IN THE TOP THIRD · PAGE DIMMED, NOT INERT',
  frameOpt: { searchOn: true },
  body(t, w, o) {
    return K.overlayScene(t, w, { panel:overlayPanel(t, w, {}), top:w === 390 ? 16 : 72, h:w === 390 ? 520 : 620, pos:'top' });
  },
  primaryNote: `A1·1’s dropdown panel, widened to 640 and given the field as its first row — ${b('the panel is the field’s border')} ⚑, so there is no box inside a box. Five rows at A1·9’s cap, ${b('the first row marked as the active descendant')} rather than focused ⚑, and a “See all 12” row into 1 Field and Results. ${b('The page dims but does not scroll-lock or go inert')} — A1·9’s rule, restated: a reader may still read what is behind the panel.`,
  keys: [
    ['⌘K', 'Opens the panel from anywhere. The same shortcut A1·9’s field advertises; ⚑ the palette’s hint is 3 Command Palette’s, not this design’s.'],
    ['↑ ↓', 'Moves the active row. The panel scrolls the row into view; focus stays in the field — <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">aria-activedescendant</code>, never a real focus move ⚑.'],
    ['↵', 'Opens the active row. With no active row it submits the field, which is the GET form, which is the no-JS path.'],
    ['esc', 'Two steps, A1·9’s: first press closes the panel and keeps the query; a second press on an empty panel clears the field ⚑.'],
    ['tab', 'Leaves the field for “See all”, then the rows in document order. Focus is trapped in the panel while it is open — the one place in the library where it is ⚑.']
  ],
  keyNotes: [
    `${b('Combobox semantics, and only here and in 3 Command Palette')} ⚑. ${code('role="combobox"')} on the field, ${code('aria-expanded')}, ${code('aria-controls')} and ${code('aria-activedescendant')}; the list is ${code('role="listbox"')} with ${code('role="option"')} rows. ${b('The eleven page designs are not comboboxes')} — their results are an ordinary ${code('<ul>')} in the document.`,
    `${b('The panel is a modal dialog with one exception.')} ${code('role="dialog" aria-modal="true"')}, focus trapped, Escape closing — but ${b('the page behind is not made inert')} and keeps its scroll position, so a reader can read the page under the dim while the panel is open ⚑.`,
    `${b('A row’s accessible name is title, section, author, date')} — A1·9’s, matched word for word, so a reader who has used the header’s field hears the same row here.`
  ],
  tileMin: 200, tileW: 652,
  stateForm(t, s) {
    const g = K.ground(t, 'surface');
    const shell = body => `<div style="width:100%;background:${t.surf};border:1px solid ${t.border};border-radius:12px;overflow:hidden">${body}</div>`;
    const fieldRow = (val, muted) => `<div style="height:52px;display:flex;align-items:center;gap:11px;padding:0 16px;border-bottom:1px solid ${t.border};box-sizing:border-box">
      <span style="font-size:18px;color:${muted ? g.muted : g.text}">⌕</span><span style="flex:1;font-size:16px;color:${muted ? g.muted : g.text}">${val}</span></div>`;
    if (s === 'before') return shell(fieldRow('Search 412 essays and interviews', true) + `<div style="padding:10px 8px">${K.eyebrow(g, 'Recent searches')}${K.RECENT.map(r => K.suggestRow(g, { label:r, glyph:'↺', px:8, h:40 })).join('')}</div>`);
    if (s === 'typing') return shell(fieldRow('orbi') + `<div style="padding:10px 8px">${K.MOSTREAD.slice(0, 1).map(r => K.suggestRow(g, { label:r.t, meta:r.m, glyph:'⌕', px:8, h:40, active:true })).join('')}${mono(t, 'BELOW THREE CHARACTERS THE PANEL KEEPS FEATURED ⚑', 10)}</div>`);
    if (s === 'results') return shell(fieldRow('orbital') + `<div style="padding:8px">${K.RESULTS.slice(0, 2).map((r, i) => K.suggestRow(g, { label:K.hl(g, r.t, 'orbital', true), meta:r.d, glyph:'→', px:10, h:44, active:i === 0 })).join('')}</div>`);
    if (s === 'one') return shell(fieldRow('letterpress') + `<div style="padding:8px">${K.suggestRow(g, { label:K.RESULTS[1].t, meta:'2 Aug', glyph:'→', px:10, h:44, active:true })}${mono(t, 'ONE ROW · THE PANEL SHRINKS TO IT, NO PADDED VOID ⚑', 10)}</div>`);
    if (s === 'none') return shell(fieldRow('helioseismology') + `<div style="padding:16px">${K.noResults(g, { query:'helioseismology', size:19, measure:420, chipN:3, link:false, gap:10 })}</div>`);
    if (s === 'searching') return shell(fieldRow('orbital') + `<div style="padding:8px;opacity:.45">${K.RESULTS.slice(0, 2).map(r => K.suggestRow(g, { label:r.t, meta:r.d, glyph:'→', px:10, h:44 })).join('')}</div><div style="padding:0 18px 12px">${mono(t, 'THE PANEL HOLDS ITS HEIGHT AND DIMS · NO SPINNER ⚑', 10)}</div>`);
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.searchField(g, { full:true, state:'empty' })}
      ${mono(t, 'NO JAVASCRIPT · THE TRIGGER IS THE FORM · GET /search/?q= · NO PANEL EVER OPENS', 10)}
      <span style="font-size:12.5px;line-height:1.6;color:${g.muted}">The header’s ⌕ becomes a real submit button beside a real field, and the reader lands on the /search/ route — which, ${b('with no JavaScript, renders its own field and its archive link and no results')} ⚑. ${b('Ghost cannot search server-side')}, so the panel is not the only thing JavaScript is carrying here.</span></div>`;
  },
  statesNote: `${b('The panel is sized by its content in every state')} ⚑ — one row is one row tall, five are five, and the no-match block is 132 px. A fixed-height panel with two rows in it looks broken, and that is the commonest overlay defect. ${b('Before a query the panel is not empty')}: recent searches, then featured, by the shared source group ⚑.`,
  extraTile: {
    label: 'WHAT THIS DESIGN SETTLES FOR EVERY HEADER IN THE LIBRARY',
    body: [
      `${b('A1·9 opens this.')} So do A1·2’s drawer field, A1·14’s ⌕ button and every other search affordance in A1 — ${b('one panel, drawn once')} ⚑. A header does not get its own results treatment.`,
      `${b('Five rows, then a way out.')} A1·9’s cap, kept: five rows and a “See all N” row into 1 Field and Results. ${b('The panel never scrolls internally')} ⚑ — if five is not enough the answer is the page, not a longer panel.`,
      `${b('It is a section for the editor’s sake, not the page’s.')} Nothing renders in the flow, so ${b('the section has no padding, no ground and no place in the page order')} ⚑ — which is why ${b('the universal trio is not drawn for it')}: there is no ground to role, no space to set and no edge to divide. ${b('ARCHITECT: editor-surface ruling')} ⚑ — the panel is chosen from a dedicated editor surface listed with the header that opens it, never placed in the page stack. 3 Command Palette is the same case and carries the same note.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS OF ITS OWN + THE SEARCH SOURCE · NO UNIVERSAL TRIO: THIS SECTION IS NOT PLACED ⚑',
    name: 'Overlay', n: 2, count: 'SIX', foot: 'SIX OF ITS OWN · NO TRIO · SOURCE',
    sub: 'A panel over the dimmed page.',
    rows: [
      K.sel('Panel width', 'Medium 640', 'Narrow 520 · Medium 640 · Wide 760. ' + b('Full width minus 40 at 390') + ' ⚑ — a fixed panel width on a phone is a horizontal scrollbar.'),
      K.seg('Panel position', ['Top third', 'Centred'], 0, 'Top third puts the panel 72 from the top so the reader’s eye stays where the header was. Centred vertically centres it; ' + b('at 390 both resolve to 16 from the top') + ' ⚑.'),
      K.seg('Rows shown', ['Five', 'Eight', 'Ten'], 0, 'A1·9’s cap is five. Eight and ten exist for archives whose titles are short; ' + b('the panel never scrolls') + ' ⚑.'),
      K.seg('Thumbnails', ['Off', 'Small 40'], 0, '40 px square at the row’s left, ' + b('cropped square, never letterboxed') + '. A post with no feature image draws the row without one ⚑.'),
      K.seg('Row meta', ['Section and date', 'Section', 'Nothing'], 0, 'The second line of A1·9’s row. ' + b('This design already governed its meta') + ', so the category’s new Result meta row is not added here ⚑. ' + b('The accessible name keeps all four parts whatever this says') + '.'),
      K.seg('Footer keys', ['Show', 'Hide'], 0, '↑↓ move · ↵ open · esc close, at 12.5 px. Hidden on touch by media query, not by this control ⚑.')
    ],
    trio: false,
    trioNote: `${b('Background role, Vertical spacing and Top divider are not drawn for this design')} ⚑. It renders nothing in the page flow: no ground to role, no space above or below, no edge to divide. ${b('ARCHITECT: editor-surface ruling')} — the panel is selected from a dedicated editor surface, listed with the header that opens it rather than in the page stack. ${b('3 Command Palette is the same case')} and carries the same note.`,
    editing: `${b('The panel’s own strings edit inline in the state that draws them')}, through the ${b('P0·6 switcher')} — No query · Results · No matches ⚑: ${code('placeholder')}, ${code('countLabel')}, ${code('seeAllLabel')}, ${code('recentLabel')}, ${code('suggestLabel')}, ${code('emptyHeading')}, ${code('emptyText')}, each with the ${b('P0·1')} toolbar where marks are allowed. ${b('Row titles and meta are Ghost’s')} ⚑ — clicking one says ${b('“Edit in Ghost”')}. ${b('The keycap row is a translation-catalog string')} ⚑, not a field: “move”, “open”, “close”.`,
    data: `Rows are Ghost’s posts and pages: ${b('no Add, no Remove, no drag')} ⚑ (P0·3’s Ghost-sourced list). ${b('The reader’s recent queries are local to their browser')} and the publication can neither see nor seed them ⚑. ${b('No Member Visibility row')} ⚑ — the panel is a search surface, not a CTA.`,
    settles: [
      `${b('No backdrop control.')} The dim is the pack’s own ${code('text')} at 42 % and is not offered as a value — a blur is a pack decision and a lighter dim fails the panel’s edge on a pale ground ⚑.`,
      `${b('No “open on load” value.')} A search panel that opens itself is a takeover, and A2·12 owns takeovers. The panel opens from a trigger, always ⚑.`,
      `${b('No excerpt value')} — a suggestion row is title and meta. ${b('The excerpt is what makes the page’s row a result row')} ⚑, and the page is 1 Field and Results.`,
      `${b('Match highlight is the source group’s now')} ⚑, not a per-design row — the panel marks the query in its titles like every other design that draws a result.`
    ]
  },
  respCap: 'TABLET 834 · PANEL 640 HELD · MOBILE 390 · PANEL IS THE SHEET, 16 FROM THE TOP',
  tabletLabel: '834 · panel 640 · top 72 · five rows',
  mobileLabel: '390 · panel 350 · top 16 · thumbnails off · keys hidden on touch',
  respNote: `Overlay’s ladder. ${b('834')} the panel is unchanged — 640 in a 754 content box, which is why no tablet frame of its own is needed beyond this one. ${b('≤ 767')} the panel takes the width minus 40, sits 16 from the top, ${b('the footer keys go')} (there is no keyboard to hint at) and ${b('the rows lose their meta’s author')}, keeping section and date. ${b('The panel is never a bottom sheet')} ⚑ — it stays at the top, where the field it replaced was.`,
  darkNote: `The dim deepens to ${code('rgba(9,8,6,.62)')} and the panel lifts to ${code('#211D17')} on a ${code('#332E27')} hairline with ${b('the shadow dropped and the hairline carrying the plane')} — A27’s step. ${b('The active row’s fill is the hover token, not the accent')} ⚑, in both modes: an accent-filled row would spend the section’s one accent on a transient state.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A surface panel over the dimmed page holding the field as its first row and five suggestion rows beneath. The surface every search affordance in A1 opens, and the only A23 design that is not in the page flow.'),
    K.specRow(2, 'Structural descriptor', `${code('overlay · card · transparent · many · none · a panel over the dimmed page')}<br><span style="color:#6B6459">Containment ${code('card')} — here the section itself is the card, which is the case the rule is for. Ground ${code('transparent')}: the section has no ground and shows the dimmed page beneath.</span>`),
    K.specRow(3, 'Archetype', 'overlay. One departure: ' + b('it does not become a full-screen sheet at 390') + ' — it keeps the panel shape 16 px from the top ⚑, because it replaces a field that was at the top.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} panel 640, 72 from the top, five rows, footer keys. ${b('834')} unchanged. ${b('≤ 767')} panel = width − 40, 16 from the top, keys hidden, row meta drops the author. ${b('No tablet frame of its own is needed')} — 834 is 1440’s panel in a narrower page.`),
    K.specRow(5, 'Content fields', `${code('placeholder')} (opt ≤ 40) · ${code('countLabel')} · ${code('seeAllLabel')} (opt ≤ 24, default “See all {n} results”) · ${code('recentLabel')} · ${code('suggestLabel')} · ${code('emptyHeading')} · ${code('emptyText')}. ${b('Stored and not drawn: eyebrow, heading, blurb, note')} ⚑ — a panel has no head. They survive a switch to any other design.`)
  ], [
    K.specRow(6, 'Controls', 'Panel width (Narrow 520 · Medium 640 · Wide 760) · Panel position (Top third · Centred) · Rows shown (Five · Eight · Ten) · Thumbnails (Off · Small 40) · Row meta (Section and date · Section · Nothing) · Footer keys (Show · Hide). Then the shared source group. ' + b('No universal trio') + ' ⚑ — the design is not placed in the page, so Background role, Vertical spacing and Top divider have nothing to act on: ARCHITECT, editor-surface ruling.'),
    K.specRow(7, 'Data', `Ghost posts and pages. ${b('0')} → the no-match block inside the panel, 132 px, chips but no archive link. ${b('1')} → the panel shrinks to one row ⚑. ${b('many')} → five, eight or ten by the control, then the “See all N” row; ${b('the panel never scrolls')} ⚑.`),
    K.specRow(8, 'Empty state', 'No query → recent searches (the reader’s own), else featured, else the field alone in a 60 px panel. Under three characters → featured is kept rather than cleared ⚑. No feature image on a post at Thumbnails: Small → that row draws without one.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')}. ${b('Edit-safe')} — the panel never opens in the editor; the resting frame the designer edits is the panel as drawn, rendered inline in a preview. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — ${b('the panel does not exist without JavaScript')}, and the /search/ route it submits to serves a field and an archive link rather than results ⚑: Ghost cannot search server-side.`),
    K.specRow(10, 'Accessibility notes', `${code('role="dialog" aria-modal="true"')} with a visually-hidden “Search Orbit Weekly” label; focus trapped; Escape in two steps. Field is ${code('role="combobox"')} with ${code('aria-expanded')} and ${code('aria-activedescendant')}; rows are ${code('role="option"')}; ${b('focus never leaves the field on arrow keys')} ⚑. Count is a polite live region. ${b('The page behind keeps its scroll and is not inert')} ⚑. Targets 44 px.`),
    `${b('Reconciled.')} ${b('No universal trio')} ⚑ — this section is never placed on the canvas: ${b('ARCHITECT, editor-surface ruling')}, drawn as a note on the states frame. ${b('Search in')} and ${b('Match highlight')} joined the source group; ${b('“most read” became “featured”')} ⚑; ${b('Row meta stays its own')} rather than taking the category’s new Result meta row; the no-JS tile now says the route serves no results. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 3 · Command Palette
// ═══════════════════════════════════════════════════════════════════════
function paletteBody(t, w, o) {
  o = o || {};
  const g = K.ground(t, 'surface');
  const pw = w === 390 ? 350 : (o.w || 660);
  const group = (label, items) => `<div style="padding:10px 8px 4px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.08em;color:${g.muted};padding:0 12px">${label}</span>
    ${items.map((r, i) => `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:${Math.min(g.r, 8)}px;${r.active ? `background:${t.hover};` : ''}">
      <span style="font-size:14px;width:16px;text-align:center;color:${g.muted};flex-shrink:0">${r.glyph}</span>
      <span style="flex:1;min-width:0;font-size:${r.big ? 16 : 15}px;font-family:${r.big ? 'Georgia,serif' : "'Inter',sans-serif"};${r.big ? 'font-weight:700;' : ''}color:${g.text};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${r.label}</span>
      <span style="font-size:12.5px;color:${g.muted};flex-shrink:0">${r.meta || ''}</span></div>`).join('')}</div>`;
  const body = `<div style="padding-bottom:6px">
    <div style="height:60px;display:flex;align-items:center;gap:12px;padding:0 18px;border-bottom:1px solid ${t.border};box-sizing:border-box">
      <span style="font-size:19px;line-height:1;color:${g.text}">⌕</span>
      <span style="flex:1;font-size:17px;color:${g.text}">orbital</span>
      ${K.keycap(g, '⌘K')}</div>
    ${group('POSTS', K.RESULTS.slice(0, 3).map((r, i) => ({ glyph:'→', label:K.hl(g, r.t, 'orbital', true), meta:r.d, active:i === 0, big:true })))}
    ${group('PAGES', [{ glyph:'▤', label:'Orbital atlas — the standing page', meta:'Page' }])}
    ${group('TAGS AND AUTHORS', [{ glyph:'#', label:'Reporting', meta:'42 posts' }, { glyph:'◍', label:'Nadia Okonjo', meta:'Author' }])}
    <div style="border-top:1px solid ${t.border};margin-top:6px;padding:12px 18px 4px;display:flex;align-items:center;justify-content:space-between">
      ${K.keyHint(g, [['↑↓', 'move'], ['↵', 'open'], ['esc', 'close']])}
      <span style="font-size:12.5px;color:${g.muted}">12 results</span></div></div>`;
  return K.panelEl(t, g, { w:pw, body });
}

const d3 = {
  n: 3, name: 'Command Palette',
  rail: 'A23 SEARCH · DESIGN 3 OF 15 · PAPER PACK · SIX CONTROLS OF ITS OWN · + THE SEARCH SOURCE · NO UNIVERSAL TRIO: NOT PLACED ON THE CANVAS ⚑ · RECONCILED 25 AUG 2026',
  paras: [
    'The overlay with its results grouped by what they are — posts, pages, tags and authors — and a ⌘K hint in the field. For a publication whose readers are the sort of people who know what ⌘K does.',
    'It is the only design that shows the reader more than one kind of thing at once, and the grouping is what makes that legible: four short lists under four labels, rather than one list of mixed objects.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · PALETTE 660 CENTRED · FOUR GROUPS, LABELLED',
  frameOpt: { searchOn: true },
  body(t, w, o) {
    return K.overlayScene(t, w, { panel:paletteBody(t, w, {}), pos:w === 390 ? 'top' : 'center', top:16, h:w === 390 ? 560 : 700 });
  },
  primaryNote: `2 Overlay’s panel with ${b('group labels at 10 px mono uppercase')} and a ${b('16 px keycap in the field’s trailing slot')} — A1·14’s ⌘K glyph, promoted from an icon-button caption to a real hint ⚑. ${b('Posts are the heading font; pages, tags and authors are the body font')} ⚑, so the object type reads before the label does. Three rows per group at most, and ${b('a group with nothing in it is not drawn')} ⚑ — no empty headings.`,
  keys: [
    ['⌘K', '<strong style="font-weight:600">Opens and closes the palette.</strong> The hint in the field is this design’s own; the shortcut itself is registered by the module and works from anywhere on the site.'],
    ['↑ ↓', 'Moves the active row <em>across group boundaries</em> ⚑ — the labels are not stops. <code style="font-family:\'JetBrains Mono\',monospace;font-size:12px">aria-activedescendant</code>, focus stays in the field.'],
    ['↵', 'Opens the active row: a post, a page, a tag route or an author route. Nothing in this palette runs a command — <strong style="font-weight:600">it navigates, and the name is inherited from the pattern, not the behaviour</strong> ⚑.'],
    ['esc', 'A1·9’s two steps: close keeping the query, then clear.'],
    ['/', 'The alternative hint value, for sites whose readers are not on a Mac. <strong style="font-weight:600">Ctrl+K is always registered alongside ⌘K</strong> whatever the hint says ⚑.']
  ],
  keyNotes: [
    `${b('The palette navigates; it does not act.')} There are no commands in it — no “subscribe”, no “switch theme”, no “copy link” ⚑. A reader’s palette that performs actions is an admin tool, and this is a published site. ${b('Named for the pattern the reader recognises')}, and flagged as exactly that.`,
    `${b('Groups are announced, not just drawn.')} Each label is a real ${code('role="group"')} with ${code('aria-label')}, so a screen reader hears “Posts, 3 items” before the rows — which is the whole reason to group.`,
    `${b('One module, one hint.')} ${code('command-palette')} owns the shortcut; ${code('search-overlay')}’s panel behaviour is the same panel. ${b('Declaring both would be declaring the panel twice')} ⚑ — the registry’s palette entry already says the trigger remains.`
  ],
  tileMin: 200, tileW: 652,
  stateForm(t, s) {
    const g = K.ground(t, 'surface');
    const shell = body => `<div style="width:100%;background:${t.surf};border:1px solid ${t.border};border-radius:12px;overflow:hidden">${body}</div>`;
    const fieldRow = (val, muted, kc) => `<div style="height:52px;display:flex;align-items:center;gap:11px;padding:0 16px;border-bottom:1px solid ${t.border};box-sizing:border-box">
      <span style="font-size:18px;color:${muted ? g.muted : g.text}">⌕</span><span style="flex:1;font-size:16px;color:${muted ? g.muted : g.text}">${val}</span>${kc === false ? '' : K.keycap(g, '⌘K')}</div>`;
    const grp = (l, rows) => `<div style="padding:8px 8px 2px"><span style="font-family:${MONO};font-size:10px;letter-spacing:.08em;color:${g.muted};padding:0 10px">${l}</span>${rows}</div>`;
    if (s === 'before') return shell(fieldRow('Search or jump to', true) + grp('FEATURED', K.MOSTREAD.slice(0, 2).map((r, i) => K.suggestRow(g, { label:r.t, meta:r.m, glyph:'→', px:10, h:40, active:i === 0 })).join('')));
    if (s === 'typing') return shell(fieldRow('orb') + grp('RECENT', K.RECENT.slice(0, 2).map(r => K.suggestRow(g, { label:r, glyph:'↺', px:10, h:40 })).join('') + mono(t, 'THE GROUPS APPEAR AT THREE CHARACTERS ⚑', 10)));
    if (s === 'results') return shell(fieldRow('orbital') + grp('POSTS', K.RESULTS.slice(0, 2).map((r, i) => K.suggestRow(g, { label:K.hl(g, r.t, 'orbital', true), meta:r.d, glyph:'→', px:10, h:40, active:i === 0 })).join('')) + grp('TAGS', K.suggestRow(g, { label:'Reporting', meta:'42 posts', glyph:'#', px:10, h:40 })));
    if (s === 'one') return shell(fieldRow('letterpress') + grp('POSTS', K.suggestRow(g, { label:K.RESULTS[1].t, meta:'2 Aug', glyph:'→', px:10, h:40, active:true })) + `<div style="padding:0 18px 10px">${mono(t, 'ONE GROUP WITH ONE ROW · THE OTHER THREE LABELS ARE NOT DRAWN ⚑', 10)}</div>`);
    if (s === 'none') return shell(fieldRow('helioseismology') + `<div style="padding:16px">${K.noResults(g, { query:'helioseismology', size:19, measure:420, chipN:3, link:false, gap:10 })}</div>`);
    if (s === 'searching') return shell(fieldRow('orbital') + `<div style="opacity:.45">${grp('POSTS', K.RESULTS.slice(0, 2).map(r => K.suggestRow(g, { label:r.t, meta:r.d, glyph:'→', px:10, h:40 })).join(''))}</div><div style="padding:0 18px 12px">${mono(t, 'GROUPS HOLD THEIR ORDER WHILE THE QUERY RUNS ⚑', 10)}</div>`);
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.searchField(g, { full:true, state:'empty', ph:'Search 412 essays and interviews' })}
      ${mono(t, 'NO JAVASCRIPT · THE ⌘K HINT IS HIDDEN · THE TRIGGER REMAINS', 10)}
      <span style="font-size:12.5px;line-height:1.6;color:${g.muted}">The registry’s words, quoted: “The ⌘K hint is hidden; the visible search trigger remains and behaves as above.” ${b('The groups are the palette’s, so without the module a reader gets the /search/ route’s field and its archive link — and no list at all')} ⚑: Ghost cannot search server-side.</span></div>`;
  },
  statesNote: `${b('A group with nothing in it is not drawn')} ⚑ — that is the state rule this design adds, and it is why the palette is the design that can show four kinds of thing without ever looking half-empty. ${b('Under three characters the groups have not run yet')}: recent searches stand in, ungrouped, because grouping three recent strings by object type would be a fiction.`,
  extraTile: {
    label: 'WHAT THIS DESIGN SETTLES',
    body: [
      `${b('“Palette” names a pattern, not a capability')} ⚑. It navigates to posts, pages, tags and authors. ${b('It runs no commands')} — a public site’s search should not be able to change the site.`,
      `${b('Ctrl+K is always bound')}, whatever the hint shows ⚑. The hint is a label; the shortcut is the module’s, and a Windows reader gets the same behaviour with a different glyph.`,
      `${b('Tags and authors are one group, not two')} ⚑ — at three rows each, two labels for two short lists is more furniture than list. Flagged: the brief does not say, and a site with many authors may want them split.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS OF ITS OWN + THE SEARCH SOURCE · NO UNIVERSAL TRIO: THIS SECTION IS NOT PLACED ⚑',
    name: 'Command Palette', n: 3, count: 'SIX', foot: 'SIX OF ITS OWN · NO TRIO · SOURCE',
    sub: 'Grouped results under one field, with a ⌘K hint.',
    rows: [
      K.sel('Palette width', 'Medium 660', 'Medium 660 · Wide 780. ' + b('No narrow value') + ' ⚑ — group labels plus a meta column need the room, and 520 makes every row an ellipsis.'),
      K.seg('Shortcut hint', ['⌘K', '/', 'Hidden'], 0, 'What the field’s trailing keycap shows. ' + b('Ctrl+K and ⌘K are both bound at every value') + ' ⚑.'),
      K.seg('Rows per group', ['Two', 'Three', 'Five'], 1, 'Then a “See all in Posts” row where a group is longer. ' + b('The palette never scrolls') + ' ⚑.'),
      K.seg('Group labels', ['Show', 'Hide'], 0, 'At Hide the rows run as one list and ' + b('the groups remain in the accessibility tree') + ' ⚑ — the label is visual, the grouping is structural.'),
      K.seg('Row type marks', ['Show', 'Hide'], 0, 'The 16 px glyph column: → post · ▤ page · # tag · ◍ author. ' + b('Text glyphs from the pack’s own font') + ', never an icon set ⚑.'),
      K.seg('Footer keys', ['Show', 'Hide'], 0, '↑↓ move · ↵ open · esc close, with the live count at the right.')
    ],
    trio: false,
    trioNote: `${b('Background role, Vertical spacing and Top divider are not drawn for this design')} ⚑ — like 2 Overlay it renders nothing in the page flow, so there is no ground, no space and no edge for them to act on. ${b('ARCHITECT: editor-surface ruling')}, the same one 2 Overlay raises: a panel is selected from a dedicated editor surface, not placed in the page stack.`,
    editing: `${b('The group labels edit inline')} — ${code('postsLabel')}, ${code('pagesLabel')}, ${code('tagsLabel')}, ${code('authorsLabel')} — with the ${b('P0·1')} toolbar, and so do ${code('placeholder')} and ${code('shortcutHint')}. ${b('The state strings')} (${code('countLabel')}, ${code('seeAllLabel')}, ${code('emptyHeading')}, ${code('emptyText')}, ${code('recentLabel')}, ${code('suggestLabel')}) ${b('are edited in the P0·6 switcher’s No query · Results · No matches states')} ⚑. ${b('Post titles, tag names, author names and post counts are Ghost’s')} ⚑ — “Edit in Ghost”. ${b('The keycap labels are translation-catalog strings')} ⚑.`,
    data: `Posts, pages, tags and authors by scope: ${b('no Add, no Remove, no drag')} ⚑. ${b('A tag row carries its post count and an author row does not')} ⚑ — Ghost gives one cheaply and not the other. ${b('No Member Visibility row')} ⚑ — the palette navigates and never acts.`,
    settles: [
      `${b('No “what to group” control.')} The groups are the source group’s scope — search posts and you get one group; search everything and you get four ⚑. Two controls for one decision is how a sidebar starts lying.`,
      `${b('No command list, so no control for one.')} If a publication wants “Subscribe” in the palette, that is a section that does not exist yet and a finding for the architect, not a value here ⚑.`,
      `${b('Rows per group, not rows total.')} Three posts and one page is four rows; three posts and three pages is six. ${b('The palette’s height is content, and the panel never scrolls')} ⚑.`,
      `${b('Match highlight came from the source group in this pass')} ⚑ — the palette marks matched substrings in its titles, tags and author names, and the row that governs it is shared with the other twelve result-drawing designs.`
    ]
  },
  respCap: 'TABLET 834 · PALETTE 660 CENTRED · MOBILE 390 · GROUPS KEPT, KEYCAP AND FOOTER GO',
  tabletLabel: '834 · palette 660 · centred · groups and marks unchanged',
  mobileLabel: '390 · palette 350 · 16 from the top · no keycap, no footer keys',
  respNote: `Overlay’s ladder, with the palette’s own departure. ${b('834')} unchanged from 1440. ${b('≤ 767')} the palette takes the width minus 40 and moves to 16 from the top; ${b('the ⌘K keycap and the footer keys are hidden — there is no keyboard to hint at')} ⚑; ${b('the group labels stay')}, because the whole reason for the design is that a phone reader can see a tag and a post are different things without reading either.`,
  darkNote: `2 Overlay’s dark step exactly: dim ${code('rgba(9,8,6,.62)')}, panel ${code('#211D17')}, hairline ${code('#332E27')}, shadow dropped. ${b('The keycap’s border is the hairline token, not a lighter grey')} ⚑ — a keycap drawn in a pack-independent grey is the commonest way a palette stops matching its site.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The overlay panel with its results grouped and labelled by object type — posts, pages, tags and authors — and a keyboard-shortcut hint in the field. The only design that shows more than one kind of result at once.'),
    K.specRow(2, 'Structural descriptor', `${code('overlay · box · transparent · variable · none · grouped results under one field')}<br><span style="color:#6B6459">Containment ${code('box')} — a hairline-bounded panel rather than 2 Overlay’s raised card, which is the visible difference between the two at rest. Item-count ${code('variable')}: the author sets rows per group, and how many groups appear is the query’s answer.</span>`),
    K.specRow(3, 'Archetype', 'overlay. Departures as 2 Overlay: no bottom sheet at 390 ⚑, and the panel is content-sized and never scrolls.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} palette 660, vertically centred, three rows per group, marks and footer keys. ${b('834')} unchanged. ${b('≤ 767')} palette = width − 40 at 16 from the top, keycap and footer keys hidden, group labels and type marks kept ⚑.`),
    K.specRow(5, 'Content fields', `${code('placeholder')} (opt ≤ 40, default “Search or jump to”) · ${code('shortcutHint')} (opt ≤ 12, default “⌘K”) · ${code('postsLabel')} · ${code('pagesLabel')} · ${code('tagsLabel')} · ${code('authorsLabel')} (each opt ≤ 20, defaulting to the object name) · ${code('countLabel')} · ${code('seeAllLabel')} · ${code('emptyHeading')} · ${code('emptyText')}. ${b('Eyebrow, heading, blurb and note are stored and not drawn')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', 'Palette width (Medium 660 · Wide 780) · Shortcut hint (⌘K · / · Hidden) · Rows per group (Two · Three · Five) · Group labels (Show · Hide) · Row type marks (Show · Hide) · Footer keys (Show · Hide). Then the shared source group. ' + b('No universal trio') + ' ⚑ — not a placed section: ARCHITECT, editor-surface ruling, as 2 Overlay.'),
    K.specRow(7, 'Data', `Ghost posts, pages, tags and authors, by scope. ${b('0')} → the no-match block, no group labels. ${b('1')} → one group, one row; ${b('the other labels are not drawn')} ⚑. ${b('many')} → up to the rows-per-group value, then a “See all in {group}” row. A tag row carries its post count; an author row carries no count ⚑ — Ghost gives one cheaply and not the other.`),
    K.specRow(8, 'Empty state', 'No query → featured under one label. Under three characters → recent searches, ungrouped ⚑. An empty group is absent, label and all. No author image is ever drawn, so no image empty exists here.'),
    K.specRow(9, 'Behaviour module', `${b('command-palette')}, alone ⚑ — the panel behaviour is the same panel, and declaring ${code('search-overlay')} beside it would declare it twice. ${b('Edit-safe')}: never opens in the editor. ${b('No-JS, quoted:')} “The ⌘K hint is hidden; the visible search trigger remains and behaves as above.” — so the reader gets the header’s form and the /search/ route’s field and archive link, ${b('with no list and no groups')} ⚑: Ghost cannot search server-side.`),
    K.specRow(10, 'Accessibility notes', `${code('role="dialog" aria-modal="true"')}; the field is a combobox as 2 Overlay. ${b('Each group is a role="group" with an aria-label')} ⚑ and keeps it at Group labels: Hide. Arrow keys cross group boundaries; labels are not stops. Type marks are ${code('aria-hidden')} and the object type is in each row’s accessible name instead ⚑. Keycap 4.7:1 muted on surface; the shortcut is announced once in the trigger’s name.`),
    `${b('Reconciled.')} ${b('No universal trio')} ⚑ — not a placed section, under 2 Overlay’s ${b('ARCHITECT editor-surface ruling')}. ${b('Search in')} and ${b('Match highlight')} joined the source group; the pre-query group label is ${b('“Featured”')} rather than “Most read” ⚑; the no-JS tile now says the route serves no list. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 4 · Split Head
// ═══════════════════════════════════════════════════════════════════════
const d4 = {
  n: 4, name: 'Split Head',
  rail: 'A23 SEARCH · DESIGN 4 OF 15 · PAPER PACK · SIX CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'The head in a left column, the field and the results in a right one. The library’s split-head arrangement, applied to a query surface.',
    'It is the design for a search page that has something to say about the archive it searches — a sentence about what is in it, standing beside the results rather than above them.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · HEAD COLUMN 420 · RESULTS COLUMN 836 · 40 GAP',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    if (w === 1440) {
      const inner = `<div style="display:flex;gap:40px;align-items:flex-start">
        <div style="width:420px;flex-shrink:0;display:flex;flex-direction:column">
          ${K.headBlock(g, w, { eyebrowText:'The archive', headingText:'Search seven years of Orbit Weekly', blurbText:'412 pieces, 38 contributors, every correction we have ever printed. Titles and excerpts are searched.', measure:380, max:420 })}
          ${K.gap(22)}
          <span style="font-size:13px;color:${g.muted}">Body text is not indexed ⚑</span></div>
        <div style="width:836px;display:flex;flex-direction:column">
          ${K.searchField(g, { full:true, state:'typed', typed:'orbital' })}
          ${K.gap(26)}
          ${listBlock(t, g, w, { markOn:true, measure:700, width:836 })}</div></div>`;
      return P.stdWrap(t, w, inner);
    }
    const inner = `<div style="display:flex;flex-direction:column">
      ${K.headBlock(g, w, { eyebrowText:'The archive', headingText:'Search seven years of Orbit Weekly', blurbText:'412 pieces, 38 contributors, every correction we have ever printed. Titles and excerpts are searched.', measure:w === 390 ? 350 : 560, max:w === 390 ? 350 : 620 })}
      ${K.gap(24)}
      ${K.searchField(g, { full:true, state:'typed', typed:'orbital' })}
      ${K.gap(24)}
      ${listBlock(t, g, w, { markOn:true, measure:w === 390 ? 350 : 700 })}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A5·5’s split head, carried: ${b('420 and 836 in the 1,296 box with a 40 gap')}, the head’s measure 380 so the column has air at its right. ${b('The field is the right column’s first row and takes its full width')} ⚑ — the one design where Field width is not a control, because the column decides it. The list keeps A18’s hung-meta option off and holds its excerpt to 700.`,
  tileMin: 176,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const f = (st, ex) => K.searchField(g, { full:true, state:st, ...ex });
    const head = `<div style="width:190px;flex-shrink:0;display:flex;flex-direction:column;gap:8px"><span style="font-family:Georgia,serif;font-size:19px;font-weight:700;line-height:1.2;color:${g.text}">Search the archive</span><span style="font-size:12.5px;line-height:1.5;color:${g.muted}">412 pieces since 2019.</span></div>`;
    const right = inner => `<div style="display:flex;gap:20px;width:100%;align-items:flex-start">${head}<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:12px">${inner}</div></div>`;
    if (s === 'before') return right(f('empty') + K.eyebrow(g, 'Recent searches') + K.RECENT.slice(0, 2).map(r => K.suggestRow(g, { label:r, glyph:'↺', px:0, h:36 })).join(''));
    if (s === 'typing') return right(f('focus', { typedOnFocus:true, typed:'orbi' }) + K.countLine(g, { text:'12 results for', query:'orbi', fs:14 }) + mono(t, 'THE HEAD COLUMN DOES NOT MOVE WHILE THE RIGHT ONE CHANGES ⚑', 10));
    if (s === 'results') return right(K.countLine(g, { fs:14 }) + K.rows(t, g, { n:2, density:12, measure:340, titleSize:18, markOn:true, ruleFirst:false, excerpt:false, meta:'all' }));
    if (s === 'one') return right(K.countLine(g, { text:'1 result for', query:'letterpress', fs:14 }) + K.rows(t, g, { n:1, list:[K.RESULTS[1]], q:'atlas', density:0, measure:340, titleSize:18, excerpt:false, ruleFirst:false }) + mono(t, 'THE COLUMNS KEEP THEIR WIDTHS AT ONE RESULT ⚑', 10));
    if (s === 'none') return right(K.noResults(g, { query:'helioseismology', size:19, measure:340, chipN:3, link:false, gap:10 }));
    if (s === 'searching') return right(f('searching') + `<div style="opacity:.45">${K.rows(t, g, { n:1, excerpt:false, density:0, measure:340, titleSize:18, ruleFirst:false })}</div>` + mono(t, 'ONLY THE RIGHT COLUMN DIMS ⚑', 10));
    return right(f('submitted') + `<span style="font-size:14px;font-weight:500;color:${g.text};text-decoration:underline;text-underline-offset:3px">Browse the archive →</span>` + mono(t, 'GET /search/?q=orbital · HEAD AND FIELD ARE SERVER-RENDERED · NO RESULTS ⚑', 10));
  },
  statesNote: `${b('The head column never changes.')} Every state belongs to the right column ⚑ — which is the reason the split exists: the sentence about the archive is true whatever the reader typed, so it should not flicker when they type. ${b('At 834 and below the head becomes a stacked block above the field')} and the states behave as 1 Field and Results.`,
  extraTile: SETTLE_STATES,
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE SEARCH SOURCE · QUICK: HEAD COLUMN, HEAD POSITION, RESULT DENSITY',
    name: 'Split Head', n: 4, count: 'SIX',
    sub: 'The head beside the field and its results.',
    rows: [
      K.seg('Head column', ['Third 420', 'Half 628'], 0, 'Of the 1,296 box, with a 40 gap. ' + b('At Half the results lose their excerpt by default') + ' ⚑ — a 628 column of rows with excerpts reads as two paragraphs, not a list.'),
      K.seg('Head position', ['Left', 'Right'], 0, 'Which side the head takes. ' + b('The stacking order at ≤ 833 is head then field at both values') + ' ⚑ — a head below its own results is not a head.'),
      K.seg('Result density', ['Compact', 'Comfortable', 'Spacious'], 1, '16 · 24 · 36 of row padding.'),
      K.seg('Excerpt', ['Show', 'Hide'], 0, 'Clamped to the results column minus 136. Hidden below 767 whatever the value ⚑.'),
      K.sel('Result meta', 'Section, author, date', 'Section, author, date · Section and date · Date · Off. ' + b('New in this pass') + ' ⚑. ' + b('Steps down to the date alone at ≤ 767') + ' whatever the value.'),
      K.seg('Head sticks', ['Off', 'On'], 0, 'At On the head column pins while the results scroll, ' + b('desktop only and never below 1024') + ' ⚑. Uses no module — ' + code('position:sticky') + ' is CSS.')
    ],
    trio: {},
    editing: `${b('The head is the design’s reason and all of it edits inline')} with the ${b('P0·1')} toolbar — eyebrow, heading, ${code('blurb')} and note, marks and links included, the link popover carrying ${b('Open in new tab')} and the rel toggles. ${b('The result rows are Ghost’s')} ⚑ — “Edit in Ghost”. ${b('countLabel, emptyHeading, emptyText, emptyLinkLabel, recentLabel and suggestLabel are edited through the P0·6 switcher')} — No query · Results · No matches ⚑ — in the right column, where they are drawn.`,
    data: `Ghost posts and pages by the source group’s scope: ${b('no Add, no Remove, no drag')} ⚑. ${b('The head is authored and never queried')}, so no data state can empty it. ${b('No Member Visibility row')} ⚑ — no CTA in this design.`,
    settles: [
      `${b('No Field width control')} ⚑ — the field is the results column’s width, and a 400 px field in an 836 px column is the arrangement’s only ugly state. The column is the control.`,
      `${b('Head sticks is the one behavioural control in the category that needs no module')} ⚑. ${code('position:sticky')} works without JavaScript, so there is nothing to degrade and nothing to declare.`,
      `${b('Padding left this list for the trio’s Vertical spacing')} ⚑, and ${b('Result meta arrived')} in its place — the right column’s rows now have the same meta vocabulary as every other result list in A23.`
    ]
  },
  respCap: 'TABLET 834 · COLUMNS STACK, HEAD ABOVE FIELD · MOBILE 390 · SAME STACK, EXCERPT GOES',
  tabletLabel: '834 · stacked at 833 · head on 620 · field full width · list 754',
  mobileLabel: '390 · head on 350 · excerpt hidden · meta is the date',
  respNote: `Split’s ladder, unaltered: ${b('the two columns become one at 833')}, head first, field second, list third. ${b('The head’s measure goes 380 → 560 → 350')} and ${b('Head sticks is ignored below 1024')} ⚑. Everything else is 1 Field and Results’ ladder, because below the split that is what this design is — and the spec says so rather than pretending otherwise.`,
  darkNote: `A27’s step. ${b('The two columns share one ground')} — there is no plane here, so nothing lifts ⚑, and the only tuned values are the field’s fill, the hairlines and the mark at 22 %.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The head in a 420 column and the field with its results in an 836 one, 40 apart. The head is fixed content that never reacts to the query; the whole search is the right column.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · page · many · none · head column beside the results')}<br><span style="color:#6B6459">Archetype ${code('split')} rather than ${code('form')} because the arrangement, not the field, is the design. Ground ${code('page')}; containment ${code('none')}.</span>`),
    K.specRow(3, 'Archetype', 'split. Its ladder: side by side above 1023, stacked at 833. One departure — ' + b('the stack order is fixed to head-then-results at both Head position values') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} 420 / 40 / 836; head measure 380; field the column’s full width; excerpt to 700; padding 96. ${b('834')} stacked, head on 620, list 754, padding 80. ${b('≤ 767')} head on 350, excerpt hidden, meta the date, padding 64.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} (opt ≤ 60) · ${code('blurb')} (opt ≤ 240, the reason this design exists) · ${code('note')} · ${code('placeholder')} · ${code('countLabel')} · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')} · ${code('recentLabel')} · ${code('suggestLabel')}. Same list as 1, differently arranged.`)
  ], [
    K.specRow(6, 'Controls', 'Head column (Third 420 · Half 628) · Head position (Left · Right) · Result density (Compact · Comfortable · Spacious) · Excerpt (Show · Hide) · Result meta (Section, author, date · Section and date · Date · Off) · Head sticks (Off · On). Then the universal trio outside the list and the shared source group.'),
    K.specRow(7, 'Data', `As 1 Field and Results. ${b('0')} → the no-match block in the right column, head untouched ⚑. ${b('1')} → one row, columns unchanged. ${b('many')} → to the cap. ${b('The head is authored, never queried')}, so no data state can empty it.`),
    K.specRow(8, 'Empty state', 'No query → recent searches, else featured, in the right column. No blurb → the head is eyebrow and heading only and the column narrows to its text; ' + b('the 420 grid column is kept') + ' ⚑, because a moving gutter between states is worse than a short column.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')}. ${b('Head sticks declares nothing')} ⚑ — ${code('position:sticky')} is CSS. Edit-safe. ${b('No-JS, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — the head renders identically and ${b('the right column is the field and the archive link, not a list')} ⚑: Ghost cannot read ${code('?q=')} or search server-side.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')} in the right column; ${code('h2')} in the left. ${b('DOM order is head then form then results at every width')} ⚑, which is why the stack order is fixed. The results are a ${code('<ul>')}, not a combobox. At Head sticks: On the pinned column is not a landmark and does not trap focus.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; ${b('Result meta')} added; ${b('Search in')} and ${b('Match highlight')} joined the source group; ${b('“most read” became “featured”')} ⚑; the no-JS state redrawn as head, field and archive link with no results. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

// ═══════════════════════════════════════════════════════════════════════
// 5 · Tag Chips
// ═══════════════════════════════════════════════════════════════════════
const d5 = {
  n: 5, name: 'Tag Chips',
  rail: 'A23 SEARCH · DESIGN 5 OF 15 · PAPER PACK · FIVE CONTROLS OF ITS OWN · + THE UNIVERSAL TRIO, THE CHIP LIST AND THE SEARCH SOURCE · RECONCILED 25 AUG 2026',
  paras: [
    'A centred field with a row of the publication’s own tags beneath it, and the results below that. The only design in A23 whose list is authored rather than queried.',
    'It is the design for the reader who arrived without a word in mind. The chips are the publication saying: if you do not know what to type, these are the things we write about.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FIELD 520 · FIVE AUTHORED CHIPS · RESULTS ON THE 820 MEASURE',
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const col = w === 1440 ? 820 : w === 834 ? 754 : 350;
    const chips = `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${
      K.CHIPS.map((c, i) => K.chip(g, { label:c, active:i === 0 })).join('')}</div>`;
    const inner = `<div style="max-width:${col}px;margin:0 auto;display:flex;flex-direction:column">
      ${K.headBlock(g, w, { align:'center', eyebrowText:'The archive', headingText:'What are you looking for?', blurbText:false, measure:560 })}
      ${K.gap(24)}
      <div style="display:flex;justify-content:center">${K.searchField(g, { w:w === 390 ? '100%' : 520, full:w === 390, state:'empty' })}</div>
      ${K.gap(18)}
      ${chips}
      ${K.gap(w === 390 ? 30 : 40)}
      ${listBlock(t, g, w, { markOn:false, width:col, countText:'42 posts in', query:'Reporting', moreText:'ROWS 5–42 CONTINUE BELOW · FOUR DRAWN SO THE FRAME FITS ⚑' })}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A17·15’s tag pill, carried verbatim — ${b('36 px, hairline and muted at rest, accent fill with a derived label when active')} ⚑. ${b('The chips are authored, not queried')}: ${code('tagChips[]')} holds two to six of the publication’s own tags in the publication’s own order, because Ghost’s tag order is alphabetical and a publication’s priorities are not. ${b('An active chip is a tag route')}, so the list below it is that tag’s posts and the count line says so.`,
  tileMin: 186,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const chipRow = (act) => `<div style="display:flex;gap:6px;flex-wrap:wrap">${K.CHIPS.slice(0, 4).map((c, i) => K.chip(g, { label:c, active:i === act, h:32, px:12 })).join('')}</div>`;
    const f = (st, ex) => K.searchField(g, { full:true, state:st, ...ex });
    if (s === 'before') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${f('empty')}${chipRow(-1)}${mono(t, 'NO QUERY, NO CHIP · THE CHIPS ARE THE EMPTY STATE ⚑', 10)}</div>`;
    if (s === 'typing') return `<div style="display:flex;flex-direction:column;gap:14px;width:100%">${f('focus', { typedOnFocus:true, typed:'orbi' })}<div style="opacity:.45">${chipRow(-1)}</div>${mono(t, 'TYPING DIMS THE CHIPS AND DOES NOT REMOVE THEM ⚑ · A CHIP IS STILL A WAY OUT', 10)}</div>`;
    if (s === 'results') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${chipRow(0)}${K.countLine(g, { text:'42 posts in', query:'Reporting', fs:14 })}${K.rows(t, g, { n:2, excerpt:false, density:10, measure:520, titleSize:18, ruleFirst:false })}</div>`;
    if (s === 'one') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${chipRow(3)}${K.countLine(g, { text:'1 post in', query:'Corrections', fs:14 })}${K.rows(t, g, { n:1, list:[K.RESULTS[5]], excerpt:false, density:0, measure:520, titleSize:18, ruleFirst:false })}${mono(t, 'A TAG WITH ONE POST IS A NORMAL TAG ⚑', 10)}</div>`;
    if (s === 'none') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${K.noResults(g, { query:'helioseismology', size:19, measure:520, chips:false, link:false, gap:10 })}${chipRow(-1)}${mono(t, 'THE CHIPS ARE THE NO-MATCH BLOCK’S OWN WAY OUT · NOT DRAWN TWICE ⚑', 10)}</div>`;
    if (s === 'searching') return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('searching')}<div style="opacity:.45">${chipRow(-1)}${K.rows(t, g, { n:1, excerpt:false, density:0, measure:520, titleSize:18, ruleFirst:false })}</div></div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;width:100%">${f('submitted')}${chipRow(-1)}${mono(t, 'NO JAVASCRIPT · THE CHIPS WORK PERFECTLY · THE FIELD IS A GET FORM', 10)}<span style="font-size:12.5px;line-height:1.6;color:${g.muted}">${code('filter-strip')}’s words, quoted: “Filters are ${code('&lt;a href&gt;')} links to Ghost routes and ${b('work perfectly')} — this module needs JS least of all.”</span></div>`;
  },
  statesNote: `${b('The chips are the design’s empty state')} ⚑ — before a query they are the only thing under the field, which is why this design does not draw recent searches at all and the source group’s “Before a query” row is ignored ⚑. ${b('Typing dims the chips rather than removing them')}: a reader who mistyped needs the way out to still be there.`,
  extraTile: {
    label: 'THE ITEM LIST · tagChips[] · THE CATEGORY’S ONLY AUTHORED LIST',
    body: [
      `${b('These are the shared P0·3 item controls')} ⚑, named rather than redesigned. ${b('Add')} sits under the last chip as a full-width “Add a tag” row. A new chip arrives ${b('as the publication’s next most-used tag, already filled in')} ⚑, at the end of the order, never as a blank pill. ${b('Add is disabled at six')} and the row says why.`,
      `${b('Remove')} is an ✕ on the selected chip’s own row in the sidebar. ${b('Order is meaningful and is drag-reorderable')} ⚑ — it is a priority list, which is the whole reason the field exists rather than reading Ghost’s alphabetical order. ${b('Minimum two')}: remove the second-to-last and the section falls back to 1 Field and Results and the panel says so ⚑.`,
      `${b('Inside a chip the reader-visible content is a tag reference, not text')} ⚑ — the editable field is which tag, and the label is Ghost’s. ${b('A renamed tag renames the chip')}; ${b('a deleted tag drops it silently')} and the row count falls to one, then to none, then the section is 1 Field and Results ⚑. ${b('Zero chips renders the field alone')}, centred, exactly as 1.`
    ]
  },
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE CHIP LIST + THE SEARCH SOURCE',
    name: 'Tag Chips', n: 5, count: 'FIVE', foot: 'FIVE OF ITS OWN · TRIO · CHIPS · SOURCE',
    sub: 'A field, the publication’s own tags, then results.',
    rows: [
      K.sel('Field width', 'Medium 520', 'Narrow 400 · Medium 520 · Wide 640. Full width at 390.'),
      K.seg('Chips', ['Below the field', 'Above the field'], 0, 'Above puts them between the head and the field, which suits a page whose readers browse more than they type.'),
      K.seg('Chip style', ['Outlined', 'Filled'], 0, 'A17·15’s two rest states. ' + b('The active chip is accent at both values') + ' ⚑.'),
      K.seg('Chip counts', ['Show', 'Hide'], 1, 'Ghost’s post count inside each pill at 12 px. ' + b('Hidden by default') + ' — five counts in a row reads as a table of contents, not an invitation ⚑.'),
      K.sel('Tags', '5 chips · Reporting, Interviews…', b('The P0·3 item list.') + ' Two to six, the publication’s own order, drag to reorder. Add takes the next most-used tag; ' + b('Add is disabled at six') + ' and Remove is never disabled above two ⚑.')
    ],
    trio: {},
    content: `${code('tagChips[]')} is ${b('the category’s only authored list')} ⚑ and takes the ${b('P0·3')} controls verbatim: drag to reorder · per-row overflow with Duplicate and Remove · ${b('Add arrives with content')} (the next most-used tag, already filled in) · the range line reading ${code('2–6 · 5 used')}. ${b('Inside a chip the only editable thing is which tag')} ⚑ — the label is Ghost’s, so a renamed tag renames the chip and a deleted tag drops it.`,
    editing: `${b('Eyebrow, heading and note edit inline')} with the ${b('P0·1')} toolbar. ${b('Tag names are Ghost’s and are not inline-editable')} ⚑ — clicking a chip’s label says ${b('“Edit in Ghost”')}; the chip’s own picker chooses which tag. ${b('countLabel, emptyHeading, emptyText and emptyLinkLabel are edited through the P0·6 switcher')} (No query · Results · No matches) ⚑. ${b('Chip targets open the Ghost-aware Link Picker')} only where a chip points at something other than its own tag route.`,
    data: `Chips are tag references and the results are Ghost’s posts: ${b('the chips are authored, the results never are')} ⚑. ${b('No Member Visibility row')} ⚑ — chips are navigation.`,
    settles: [
      `${b('The chips are a list the user authors, and it is the only one in A23')} ⚑. Everything else in this category comes from Ghost, which is why this is the only panel in the fifteen with an item row in it.`,
      `${b('A control writes one value onto the section.')} Chip style and Chip counts apply to all chips at once; ${b('there is no per-chip styling and asking for one is a request for two designs')} ⚑. Inside a chip the author picks a tag, and that is all.`,
      `${b('No “sort chips by post count” value.')} That is Ghost’s order, and the point of an authored list is that it is not Ghost’s order ⚑.`,
      `${b('Padding left for the trio’s Vertical spacing')} ⚑, and ${b('no Result meta row was added here')} — the chips and the count line are this design’s second signal, not the meta.`
    ]
  },
  respCap: 'TABLET 834 · CHIPS WRAP TO TWO ROWS · MOBILE 390 · CHIPS SCROLL IN ONE ROW',
  tabletLabel: '834 · field 520 · chips wrap, centred · list 754',
  mobileLabel: '390 · chips one row, horizontally scrollable, 20 bleed ⚑',
  respNote: `Form’s ladder, with one bespoke behaviour. ${b('At ≤ 767 the chip row does not wrap')}: it becomes a single horizontally scrollable row bleeding 20 px into the page margin, so a reader can see there are more ⚑. ${b('That is CSS overflow, not the carousel module')} — no dots, no arrows, and it works with JavaScript off. ${b('Wrapped chips at 390 would be three rows of furniture above the results.')}`,
  darkNote: `A27’s step, and A17·15’s active pill re-checked: ${b('accent')} ${code('#E0805A')} ${b('carrying')} ${code('#171511')} ${b('measures 8.9:1')}, so the active chip keeps the accent in dark where a tag row would not. Inactive chips are the hairline and the muted token; ${b('the filled value uses the hover token, one step off the ground')} ⚑.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A centred field with two to six authored tag chips beneath it and the results below. The only design whose list of things is written by the publication rather than answered by the query.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · page · few · none · authored tag chips under the field')}<br><span style="color:#6B6459">Item-count ${code('few')} — the chip row is designed for two to six. It separates this design from 1 Field and Results, which is the same field on the same ground with no authored list.</span>`),
    K.specRow(3, 'Archetype', 'form. One bespoke behaviour: ' + b('the chip row scrolls horizontally at ≤ 767 instead of wrapping') + ' ⚑.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} field 520 centred, chips centred and wrapping, list on 820, padding 96. ${b('834')} chips wrap to two rows, list 754, padding 80. ${b('≤ 767')} field full width, ${b('chips in one scrolling row with a 20 px bleed')} ⚑, excerpt hidden, padding 64.`),
    K.specRow(5, 'Content fields', `${code('tagChips[]')} (${b('list 2–6, each a tag reference')} ⚑) · ${code('eyebrow')} · ${code('heading')} · ${code('placeholder')} · ${code('note')} · ${code('countLabel')} · ${code('emptyHeading')} · ${code('emptyText')} · ${code('emptyLinkLabel')}. ${b('blurb is stored and not drawn')} ⚑ — the chips are the sentence.`)
  ], [
    K.specRow(6, 'Controls', 'Field width (Narrow 400 · Medium 520 · Wide 640) · Chips (Below the field · Above the field) · Chip style (Outlined · Filled) · Chip counts (Show · Hide) · Tags (the P0·3 item list, 2–6). Then the universal trio outside the list and the shared source group.'),
    K.specRow(7, 'Data', `Chips are tag references, so ${b('a renamed tag renames the chip and a deleted tag drops it')} ⚑. Results: ${b('0')} → no-match block, chips kept below it, not drawn twice ⚑. ${b('1')} → one row. ${b('many')} → to the cap; an active chip means the count line reads “42 posts in Reporting”.`),
    K.specRow(8, 'Empty state', b('The chips are the empty state') + ' — no query draws field and chips and nothing else ⚑, and the source group’s “Before a query” row is ignored in this design alone ⚑. Zero chips → the field alone, which is 1 Field and Results. One chip → drawn, and the panel names 1 as the better design.'),
    K.specRow(9, 'Behaviour module', `${b('search-overlay')} for the field and ${b('filter-strip')} for the chips — ${b('the only design in A23 with two modules')} ⚑. Both edit-safe. ${b('filter-strip, quoted:')} “Filters are &lt;a href&gt; links to Ghost routes and work perfectly — this module needs JS least of all.” ${b('search-overlay, quoted:')} “${P.MOD['search-overlay'].replace(/<[^>]+>/g, '')}” — ${b('so the chips work with JavaScript off and the query’s results do not')} ⚑.`),
    K.specRow(10, 'Accessibility notes', `${code('<form role="search">')} then a ${code('<nav aria-label="Sections">')} holding the chips as links ⚑ — ${b('they are navigation, not form controls')}, so no ${code('aria-pressed')}. The active chip carries ${code('aria-current="page"')}. Accent on a chip is 4.6:1 against its derived label. Chips are 36 px in a 44 px target row; the scrolling row at 390 is keyboard-reachable in document order.`),
    `${b('Reconciled.')} Padding retired into the trio’s ${b('Vertical spacing')}; the Tags row is named as ${b('the P0·3 item list')}; ${b('Search in')} and ${b('Match highlight')} joined the source group and the ignored “Before a query” row now reads ${b('featured')} ⚑; no Result meta row here. ${b('No Member Visibility, no Preview control to remove.')}`
  ]]
};

globalThis.A23D = (globalThis.A23D || []).concat([d1, d2, d3, d4, d5]);
})();
