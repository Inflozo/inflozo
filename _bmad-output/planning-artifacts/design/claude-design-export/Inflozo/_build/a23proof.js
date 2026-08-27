// A23-0 Category Proof — settlements, tokenisation proof, stress frame, roster, fields, components, findings.
globalThis.A23PROOF = (function () {
const K = globalThis.A23LIB, P = globalThis.A23PAGE;
const { L, D, MONO, PACKS, b, code, cap, note, section, tile, table, specCards } = K;

// ── the tokenisation proof · 1 Field and Results in three packs ────────
function proofCell(pk, dark) {
  const t = dark ? pk.d : pk.l;
  const g = K.ground(t, 'page', pk);
  const w = 660;
  const body = `<div style="background:${g.bg};border-radius:${pk.r + 4}px;padding:28px 28px 24px;box-sizing:border-box;width:${w}px;${dark ? '' : `box-shadow:0 6px 22px rgba(28,27,26,.10);`}${dark ? `border:1px solid ${t.border};` : ''}">
    <div style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;align-items:center">
      ${K.eyebrow(g, 'The archive', pk)}${K.gap(10)}
      ${K.heading(g, 'Search the archive', 30, pk)}${K.gap(20)}
      ${K.searchField(g, { w:380, state:'typed', typed:'orbital', pack:pk })}
    </div>${K.gap(24)}
    ${K.countLine(g, { pack:pk })}
    ${K.rows(t, g, { n:2, density:16, measure:520, titleSize:19, markOn:true, pack:pk })}</div>`;
  return `<div style="display:flex;flex-direction:column;gap:8px">
    <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${pk.name.toUpperCase()} · ${dark ? 'DARK' : 'LIGHT'} · RADIUS ${pk.r} · ${pk.head.replace(/'/g, '').split(',')[0].toUpperCase()}</span>${body}</div>`;
}

// ── the stress frame · worst realistic content, on 11 Thumb Rows ───────
function stressFrame() {
  const t = L, g = K.ground(t, 'page');
  const STRESS = [
    { t:'The orbital mechanics of a two-person newsroom, the corrections desk, and every Friday since the spring of two thousand and nineteen',
      tag:'Reporting and corrections', a:'Ida Brandt and Nadia Okonjo', d:'14 Aug 2026', r_:'34 min',
      x:'A ninety-eight character title with no excerpt behind it is the commonest thing a real archive contains, so it is the first row.' },
    { t:'Orbital', tag:'Pictures', a:'Ida Brandt', d:'19 Jul 2026', r_:'1 min', x:'' },
    { t:'What we learned printing an orbital atlas by hand', tag:'Craft', a:'Tomás Herrera', d:'2 Aug 2026', r_:'6 min',
      x:'This row has no feature image at all, so its text starts at the row’s left edge and the row is shorter than the two above it.' }
  ];
  const row = (r, i) => {
    const noImg = i === 2;
    const noEx = !r.x;
    return `<div style="display:flex;align-items:flex-start;padding:24px 0;border-top:1px solid ${g.border}">
      ${noImg ? '' : `<div style="margin-right:20px">${K.plate(t, { w:160, h:107, cap:'FEATURE IMAGE' })}</div>`}
      <div style="display:flex;flex-direction:column;gap:7px;flex:1;min-width:0">
        <span style="font-family:Georgia,serif;font-size:21px;font-weight:700;line-height:1.25;letter-spacing:-0.01em;color:${g.text};max-width:700px;display:block;text-wrap:pretty">${K.hl(g, r.t, 'orbital', true)}</span>
        ${noEx ? '' : `<span style="font-size:15px;line-height:1.55;color:${g.muted};max-width:700px;display:block">${K.hl(g, r.x, 'orbital', true)}</span>`}
        <span style="font-size:13px;line-height:1.5;color:${g.muted}">${[r.tag, r.a, r.d, r.r_].filter(Boolean).join(' · ')}</span>
      </div>
      <span style="font-family:${MONO};font-size:9.5px;color:#B0A79A;width:150px;text-align:right;flex-shrink:0;padding-left:16px">${
        i === 0 ? '98-CHAR TITLE · TWO AUTHORS · 25-CHAR TAG' : i === 1 ? 'ONE-WORD TITLE · NO EXCERPT · THE MARK IS THE WHOLE TITLE' : 'NO FEATURE IMAGE · TEXT TAKES THE ROW’S LEFT EDGE'}</span></div>`;
  };
  const q = 'the orbital mechanics of a two person newsroom and the corrections desk since 2019 and after';
  const inner = `<div style="max-width:1152px;display:flex;flex-direction:column">
    ${K.searchField(g, { w:520, state:'typed', typed:q })}
    ${K.gap(8)}<span style="font-family:${MONO};font-size:10px;color:${g.muted}">A 91-CHARACTER QUERY · THE FIELD CLIPS WITH AN ELLIPSIS AND KEEPS THE WHOLE STRING IN THE DOM ⚑ (A18·3’S RULE)</span>
    ${K.gap(20)}${K.countLine(g, { text:'3 results for', query:'the orbital mechanics of a two person newsroom and the corr…' })}
    ${K.gap(4)}<span style="font-family:${MONO};font-size:10px;color:${g.muted}">THE COUNT LINE TRUNCATES THE ECHOED QUERY AT 60 CHARACTERS ⚑ · THE LIVE REGION SPEAKS THE COUNT, NOT THE QUERY</span>
    ${K.gap(16)}${STRESS.map(row).join('')}
    ${K.gap(28)}
    <div style="display:flex;gap:20px;flex-wrap:wrap">
      ${tile({ w:560, bg:'#F7F5F2', border:'#E7E2DB', label:'AND THE ONE THAT BREAKS EVERY OTHER CATEGORY', body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
        <span>${b('A query with results the reader cannot see.')} A word that appears only in an article’s body returns nothing, ${b('and the archive plainly contains it')} ⚑ — the single worst state in A23, because the section looks broken while working exactly as specified. ${b('Every empty state names the index for this reason')}, and it is the category’s first finding.</span>
        <span>${b('A one-word title where the mark is the whole title.')} The 16 % tint over 21 px of heading font reads as a highlight, not a fill — checked, and the reason the mark is a tint rather than a background swap ⚑.</span></div>` })}
      ${tile({ w:560, bg:'#FFFFFF', border:'#E7E2DB', label:'WHAT HOLDS AND WHAT IS ALLOWED TO GIVE', body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
        <span>${b('Holds:')} the 700 text measure, the 160 thumb, the 24 row padding, the meta on one line at 13 px, the field at 52.</span>
        <span>${b('Gives:')} the title wraps to three lines, the excerpt is absent where the post has none, the thumb is absent where the post has none, ${b('and the meta wraps to two lines past 64 characters')} ⚑ rather than truncating a writer’s name.</span>
        <span>${b('Refused:')} a placeholder image, an “Untitled” fallback, a truncated title, and a minimum row height ⚑ — three rows of different heights is a real archive, and forcing them level is how a list starts lying about its contents.</span></div>` })}</div></div>`;
  return K.frame(L, 1440, P.stdWrap(L, 1440, inner));
}

function build() {
  let out = K.DOC_HEAD;
  out += K.intro({
    rail: 'A23 SEARCH · CATEGORY PROOF · 15 DESIGNS · PAPER PACK · DRAWN 23 AUGUST 2026 · RECONCILED 25 AUGUST 2026',
    title: 'A23 Search — the category',
    paras: [
      'Fifteen designs for the surface a reader lands on when they want one thing out of an archive. Thirteen of them draw results; two hand the query to the search route and stop. One of them, 2 Overlay, is the panel every search affordance in A1 Headers opens — drawn once here so no header has to invent its own.',
      'This frame carries what belongs to the category rather than to any one design: the four questions §8 asked, the tokenisation proof, the stress frame, the roster with its fifteen structural descriptors, the shared field list, the component inventory and the findings for the architect. ' +
      'The per-design frames are <a href="./A23-1 Field and Results.dc.html">A23-1</a> … <a href="./A23-15 Grouped.dc.html">A23-15</a>, and the written specification is <code style="font-family:\'JetBrains Mono\',monospace;font-size:14px">A23 Search - Spec.md</code>.'
    ]
  });

  // ── the reconciliation pass ──────────────────────────────────
  out += section('A23 reconciled', cap('RECONCILED · CONTROLS PASS · 25 AUGUST 2026 · WHAT CHANGED ACROSS THE CATEGORY') +
    `<div style="width:1288px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:20px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span style="font-family:${MONO};font-size:11px;color:#6E6A64">SIXTEEN FRAMES CHANGED · EVERY CONTROL PANEL, FOUR STATES FRAMES, THIS ONE</span>
      <span>${b('1 · The universal trio sits outside every placeable design’s list.')} Background role · Vertical spacing · Top divider. ${b('Eleven Padding rows retired into Vertical spacing')} and ${b('9 Slim Bar’s Bar ground became Background role')} ⚑. ${b('6 Contrast Band and 12 Cover lock Background role with the reason shown')}; 6’s Band padding and 7’s Plane padding keep their own names, being the space ${b('inside')} an object rather than around it. ${b('2 Overlay and 3 Command Palette get no trio at all')} ⚑ — they are not placed in the page: ${b('ARCHITECT, editor-surface ruling')}.</span>
      <span>${b('2 · The Search source group is seven rows, not five.')} ${b('Search in: Titles and excerpts (default) · Full content')} ⚑ — A23’s index is client-side over the Content API, which can fetch ${code('plaintext')}, so full-content search is real here even though Ghost’s own bundle cannot do it; the row states the index-size cost and ${b('the read-only “What is indexed” line now follows the value')}. ${b('Match highlight (Marked · Plain) moved in from 11 Thumb Rows')} and governs all thirteen result-drawing designs ⚑; ${b('14 Load More’s Solid button still disables it')}. ${b('9 Slim Bar and 12 Cover draw six rows')} — nothing to mark.</span>
      <span>${b('3 · “Most read” is gone, everywhere.')} Ghost gives a theme no view counts, so the promise was unkeepable. ${b('Before a query: Recent searches, then featured (default) · Featured posts · Latest posts · Nothing')} ⚑, and ${code('suggestLabel')} defaults to “Featured”. Redrawn on the pre-query tiles of ${b('2, 3, 10, 11, 13, 14 and 15')}.</span>
      <span>${b('4 · Result meta joins eight designs.')} Section, author, date · Section and date · Date · Off — on ${b('1, 4, 6, 7, 11, 13, 14 and 15')} ⚑. ${b('2 Overlay and 10 Grid keep their own meta rows')} (10’s gains an Off value); the responsive step-down to the date alone at ≤ 767 still applies at every value.</span>
      <span>${b('5 · The no-JS story is now honest in all fifteen.')} ${b('Ghost templates cannot read a query string or search server-side')} ⚑, so the floor is ${b('a server-rendered field and archive link, with results only where JavaScript runs')}. ${b('8 Big Type’s “the route renders the submitted query” is struck')} and ${b('15 Grouped’s “the route can render the groups server-side” is struck')} ⚑. Every no-JS tile was redrawn; 5 Tag Chips’ and 13 Facet Rail’s link-based filters still work with everything off, and now say which half survives.</span>
      <span>${b('6 · Editing is stated per panel, in the P0 primitives’ own words.')} Authored strings edit inline with the ${b('P0·1')} toolbar and its link popover; ${b('Ghost-owned content is never inline-editable')} ⚑ — clicking it says “Edit in Ghost”; ${b('the state strings that never show at rest are edited through the P0·6 switcher')} — No query · Results · No matches. ${b('9 Slim Bar’s trailing group gained Trailing tags')} (Most posts · Hand-picked, 2–3 refs on 5 Tag Chips’ pattern with the ${b('P0·3')} controls), adding ${code('trailingTags[]')} to the shared field list; ${b('12 Cover’s Image focus is now a control')} in the sidebar and the Image Picker popover; ${b('14’s button takes an optional P0·2 icon')}.</span>
      <span>${b('7 · Two ground rules land nowhere in A23, and are recorded rather than invented into it.')} ${b('Member Visibility')} ⚑ — nothing here is a CTA: a search field is a form and “Browse the archive” is navigation, so no design carries the row. ${b('And there was no Preview control to remove')}: this category never had one.</span>
    </div>`);

  // ── settlements ───────────────────────────────────────────────────────
  const st = [
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'1 · THE SURFACE A1·9 OPENS, AND ITS KEYBOARD MODEL',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('2 Overlay is that surface')}, and ${b('every search affordance in A1 opens it')} ⚑ — A1·9’s persistent field, A1·2’s drawer field, A1·14’s ⌕ button. One panel, drawn once. A header does not get its own results treatment.</span>
      <span>${b('One row, two densities')} ⚑. The suggestion row is A1·9’s: title, then “section · author · date”, and its accessible name is those four things in that order. ${b('The result row is that row with an excerpt')}, and 11 Thumb Rows adds the picture. Nothing else differs.</span>
      <span>${b('Combobox keys in two designs, not fifteen')} ⚑. 2 Overlay and 3 Command Palette are comboboxes: ${code('aria-activedescendant')}, arrows that never move focus, Escape in A1·9’s two steps. ${b('The other thirteen are documents')} — their results are a ${code('<ul>')} and the arrow keys are the browser’s. Drawing a page of results as a listbox is the commonest search-page accessibility defect.</span></div>` }),
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'2 · EMPTY QUERY, NO RESULTS, MANY RESULTS, AND THE COUNT',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('Empty query is not an empty state')} — it is the recent-search state: the reader’s own last three queries, then the site’s ${b('featured posts')}, then the field alone. ${b('The reader’s queries never leave their browser')} ⚑. ${b('“Most read” was struck in the reconciliation pass')} ⚑ — Ghost gives a theme no view counts. 5 Tag Chips ignores all of it: its chips are the pre-query state ⚑.</span>
      <span>${b('No matches is a content state.')} No red, no icon: the query, one line of why, the section chips, an archive link. ${b('And the line names the index')} — title, excerpt and slug, not body text ⚑ — because the worst state in this category is a query that plainly exists in the archive and returns nothing.</span>
      <span>${b('The count line is the announcement')} ⚑. Visible text and a visually-hidden ${code('aria-live="polite"')} region where results replace in place; ${b('no live region where the query was a page navigation')} — A34’s rule. ${b('The count always names the true total')}, never the capped one, and the cap is the source group’s.</span></div>` }),
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'3 · FILTERS — THE DESIGN OR A CONTROL?',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('Three designs are the filter; twelve have none')} ⚑. 5 Tag Chips draws the publication’s own tags as an authored row, 13 Facet Rail draws Ghost’s tags, authors and years in a column, 15 Grouped splits the answer by object type. ${b('Everywhere else a filter would be a second query the reader did not ask for.')}</span>
      <span>${b('One facet at a time, and that is a platform limit rather than a simplification')} ⚑. A Ghost theme is given one taxonomy route at a time, so “Reporting, by Ida Brandt, in 2026” has no URL. ${b('13 Facet Rail is single-select and says so in the rail')}; the finding is the architect’s, not a new module.</span>
      <span>${b('Filters are links, so they work with everything off')} — ${code('filter-strip')}, declared by 5 and 13, and ${b('the module in the registry that needs JavaScript least')}. ${b('Two counts, two meanings')}: 13’s facet counts are the archive’s, 15’s group counts are the query’s, and both panels say which ⚑.</span></div>` }),
    tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'4 · WHAT IS INDEXED, AND WHAT THE SPEC PROMISES',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('The promise is title, excerpt and slug — or the body too, if the author asks')} ⚑. ${b('Search in')}, added in the reconciliation pass, offers ${b('Titles and excerpts (default)')} and ${b('Full content')}: A23’s index is client-side over the Content API, which can fetch ${code('plaintext')}, ${b('so the body is reachable here even though Ghost’s own search bundle cannot reach it')} ⚑. The panel states the index-size cost, and ${b('the read-only “What is indexed” row reports the value rather than asserting a floor')}.</span>
      <span>${b('Tags and authors are matched on their names')}, not their descriptions, and only where the source group’s scope asks for them. ${b('Pages are searched by default')} — a publication’s About page is a legitimate answer to a query and excluding it surprises people.</span>
      <span>${b('Flagged, and the first finding:')} what the index carries is a build decision — ${b('title, excerpt and slug at the default, plus body text at Full content')} ⚑ — and ${b('every empty state’s wording follows the value')}, which is why the wording is a field and not a hard-coded string.</span></div>` })
  ];
  out += section('A23 settlements', cap('THE FOUR QUESTIONS §8 ASKED, ANSWERED') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${st.join('')}</div>`);

  // ── pack proof ──────────────────────────────────────────────────────
  const cells = [];
  ['paper', 'studio', 'garden'].forEach(k => { cells.push(proofCell(PACKS[k], false)); cells.push(proofCell(PACKS[k], true)); });
  out += section('A23 pack proof', cap('THE TOKENISATION PROOF · 1 FIELD AND RESULTS IN THREE PACKS, LIGHT AND DARK · ONE FUNCTION, SIX TOKEN OBJECTS') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${cells.join('')}</div>` +
    note(`${b('Nothing moved.')} The six frames are one function called with six token objects: ground, surface, text, muted, border, accent, contrast, a radius and a font pair. ${b('Studio at radius 2 and Garden at radius 20 change the field, the mark and the thumb together')}, because all three read the same token ⚑. ${b('The mark is the one place a pack’s accent is used at low alpha')} — 16 % in light, 22 % in dark — and it was checked in all three: on Garden’s green it reads as a wash, on Studio’s blue as a highlight, and in neither does the text underneath change colour ⚑. ${b('The only per-pack judgement in A23 is 6 Contrast Band’s refusal of the accent')}, which is a measurement rather than a taste, and it holds for every pack because it is derived from the band’s own carried colour.`));

  // ── stress ──────────────────────────────────────────────────────────
  out += section('A23 stress', cap('THE STRESS FRAME · THE WORST REALISTIC CONTENT THIS CATEGORY WILL MEET · DRAWN ON 11 THUMB ROWS') +
    stressFrame() +
    note(`${b('Three rows, three different heights, and that is correct')} ⚑. A 98-character title over two authors and a 25-character tag; a one-word title with no excerpt where the mark covers the whole title; a post with no feature image at all. ${b('Refused: a placeholder image, an “Untitled” fallback, a truncated title and a minimum row height')} — every one of them makes the list lie about what is in the archive. ${b('The query itself is the real stress')}: 91 characters in a 520 field, clipped with an ellipsis, whole in the DOM, truncated at 60 in the echo, and never spoken by the live region.`));

  // ── roster ──────────────────────────────────────────────────────────
  const roster = [
    ['1', 'Field and Results', 'form · none · page · many · none · field above a single result column', '6', 'search-overlay'],
    ['2', 'Overlay', 'overlay · card · transparent · many · none · a panel over the dimmed page', '6', 'search-overlay'],
    ['3', 'Command Palette', 'overlay · box · transparent · variable · none · grouped results under one field', '6', 'command-palette'],
    ['4', 'Split Head', 'split · none · page · many · none · head column beside the results', '6', 'search-overlay'],
    ['5', 'Tag Chips', 'form · none · page · few · none · authored tag chips under the field', '5', 'search-overlay · filter-strip'],
    ['6', 'Contrast Band', 'feed · none · contrast · many · none · field and results on an inverted band', '7', 'search-overlay'],
    ['7', 'Panel', 'feed · none · surface · many · none · the query surface on a raised plane', '5', 'search-overlay'],
    ['8', 'Big Type', 'stack · none · page · many · none · the query at display size', '4', 'search-overlay'],
    ['9', 'Slim Bar', 'bar · none · surface · none · none · one line, the query navigates away', '5', '<strong style="font-weight:600">none</strong>'],
    ['10', 'Grid', 'grid-of-N · none · page · many · top · results as a card grid', '5', 'search-overlay'],
    ['11', 'Thumb Rows', 'feed · none · page · many · left · a thumbnail on each result row', '5', 'search-overlay'],
    ['12', 'Cover', 'form · none · image · none · background · the field over a cover photograph', '6', '<strong style="font-weight:600">none</strong>'],
    ['13', 'Facet Rail', 'edge rail · none · page · many · none · facets pinned beside the results', '6', 'search-overlay · filter-strip · accordion'],
    ['14', 'Load More', 'feed · none · page · many · none · a button appends the next batch', '5', 'search-overlay · load-more'],
    ['15', 'Grouped', 'feed · none · page · variable · none · results grouped by what they are', '6', 'search-overlay']
  ].map(r => [r[0], r[1], `<code style="font-family:${MONO};font-size:11.5px">${r[2]}</code>`, r[3], r[4]]);
  out += section('A23 roster', cap('THE ROSTER · FIFTEEN DESIGNS, FIFTEEN STRUCTURAL DESCRIPTORS · CTL IS EACH DESIGN’S OWN CONTROLS, OUTSIDE THE TRIO AND THE SOURCE GROUP') +
    table({ cols:['#', 'DESIGN', 'TUPLE', 'CTL', 'MODULES'], widths:[34, 156, 700, 44, 330], rows:roster }) +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
      tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'TUPLE UNIQUENESS · THE HONEST STATEMENT', body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
        <span>${b('All fifteen are distinct on the five closed slots.')} Archetype spreads the category — five ${code('feed')}, three ${code('form')}, two ${code('overlay')}, and one each of ${code('split')}, ${code('stack')}, ${code('bar')}, ${code('grid-of-N')} and ${code('edge rail')}. ${b('Ground separates the three forms')}: ${code('page')} on 1 and 5, ${code('image')} on 12; ${b('item-count separates 1 from 5')}; ${b('ground separates the five feeds')} — ${code('contrast')} on 6, ${code('surface')} on 7, ${code('page')} on 11, 14 and 15 — and ${b('media and item-count separate those three')}.</span>
        <span>${b('Containment is none in thirteen of fifteen')} ⚑. 2 Overlay is ${code('card')} and 3 Command Palette is ${code('box')} because in those two the section itself is the panel — the case the rule is for. ${b('10 Grid’s cards are the items’ geometry')}, not the section’s: A21·2’s rule.</span></div>` })}${
      tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'WHAT THE CHECK CANNOT PROMISE', body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
        <span>${b('1 Field and Results and 14 Load More are the same column')}, with and without a button at its foot; the tuple separates them on archetype (${code('form')} against ${code('feed')}) and the emphasis phrase carries the rest. ${b('4 Split Head and 13 Facet Rail are both two columns')}, and what differs is whether the narrow one is prose or links.</span>
        <span>${b('2 Overlay and 3 Command Palette are the same panel')} until the groups appear. ${b('7 Panel and 6 Contrast Band are the same feed on two grounds')} — which is the case the ground slot exists to distinguish, and the one place in this category where the machine check is doing real work.</span>
        <span>${b('Each panel names the others by number')} ⚑ rather than pretending the overlap is not there. Those distinctions are real and visible; they are not machine-checkable.</span></div>` })}</div>`);

  // ── shared field list ───────────────────────────────────────────────
  const F = [
    ['eyebrow', 'text', 'opt', '24 ch', '1, 4, 5, 6, 7, 8, 12', 'Stored and not drawn in 2, 3, 9, 10, 11, 13, 14, 15 ⚑'],
    ['heading', 'text', 'opt', '60 ch', '1, 4, 5, 6, 7, 8, 12', '<strong style="font-weight:600">8 draws it in the display slot only before a query</strong> ⚑'],
    ['blurb', 'text', 'opt', '240 ch', '1, 4', 'Stored and not drawn in eleven ⚑ — 4 Split Head is the design it exists for'],
    ['placeholder', 'text', 'opt', '40 ch', 'all 15', 'Default “Search 412 essays and interviews” with the live post count'],
    ['note', 'text', 'opt', '90 ch', '1, 4, 6, 7, 12', '<strong style="font-weight:600">The line naming what is indexed</strong> ⚑'],
    ['countLabel', 'text', 'opt', '40 ch', 'all but 9, 12', 'Default “{n} results for “{q}””; <strong style="font-weight:600">{q} truncated at 60 characters</strong> ⚑'],
    ['emptyHeading', 'text', 'opt', '40 ch', 'all but 8, 9, 12', 'Default “No matches for “{q}””; 8 draws the query instead ⚑'],
    ['emptyText', 'text', 'opt', '160 ch', 'all but 9, 12', '<strong style="font-weight:600">Names the index</strong> — the category’s most load-bearing sentence ⚑'],
    ['emptyLinkLabel', 'text', 'opt', '24 ch', 'all but 2, 3, 9, 12', 'Default “Browse the archive”'],
    ['recentLabel', 'text', 'opt', '24 ch', 'all but 5, 9, 12', 'Default “Recent searches”'],
    ['suggestLabel', 'text', 'opt', '24 ch', 'all but 5, 9, 12', 'Default “Featured” — <strong style="font-weight:600">“Most read this week” was struck</strong> ⚑, Ghost has no view counts'],
    ['seeAllLabel', 'text', 'opt', '24 ch', '2, 3, 15', 'Default “See all {n} results”'],
    ['sortNote', 'text', 'opt', '20 ch', '10', 'Default “Newest first”'],
    ['label', 'text', 'opt', '20 ch', '9', 'The strip’s inline label; default “Search”'],
    ['trailingTags[]', 'list 2–3', 'opt', 'tag refs', '9', '<strong style="font-weight:600">New in the reconciliation pass</strong> ⚑ — drawn only at Trailing tags: Hand-picked; 5 Tag Chips’ pattern, P0·3’s controls'],
    ['shortcutHint', 'text', 'opt', '12 ch', '3', 'Default “⌘K”; <strong style="font-weight:600">Ctrl+K is bound whatever it says</strong> ⚑'],
    ['postsLabel · pagesLabel · tagsLabel · authorsLabel', 'text', 'opt', '20 ch each', '3, 15', 'Default to the object name'],
    ['filterHeading', 'text', 'opt', '24 ch', '13', 'Default “Narrow by”'],
    ['sectionLabel · writerLabel · yearLabel', 'text', 'opt', '20 ch each', '13', 'The facet group labels'],
    ['loadMoreLabel · exhaustedLabel · progressLabel', 'text', 'opt', '20 · 30 · 30 ch', '14', 'Defaults “More results” · “That is all {n}” · “Showing {m} of {n}”'],
    ['tagChips[]', 'list 2–6', 'opt', 'tag refs', '5', '<strong style="font-weight:600">The category’s only authored list</strong> ⚑ — the publication’s own order'],
    ['image', 'image', '<strong style="font-weight:600">req</strong>', '≥ 2400 px', '12', '<strong style="font-weight:600">The one required field in A23</strong> ⚑'],
    ['imageAlt', 'text', 'opt', '120 ch', '12', 'An empty alt is a decorative cover and is allowed ⚑'],
    ['imageFocus', 'enum', 'opt', '—', '12', 'Centre · Top · Bottom — <strong style="font-weight:600">a control in the sidebar and the Image Picker popover</strong> ⚑, changed in this pass'],
    ['<em>posts and pages</em>', 'Ghost', 'req', '—', 'all but 9, 12', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">title · excerpt · slug · feature_image · primary_tag · primary_author · published_at · reading_time · url</code>'],
    ['<em>tags</em>', 'Ghost', 'opt', '—', '3, 5, 9, 13, 15', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">name · slug · count.posts</code> — a count Ghost gives cheaply'],
    ['<em>authors</em>', 'Ghost', 'opt', '—', '3, 13, 15', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">name · slug</code> — <strong style="font-weight:600">no post count</strong> ⚑'],
    ['<em>post count</em>', 'Ghost', 'opt', '—', 'all 15', 'The placeholder’s number'],
    ['<em>@site.title</em>', 'Ghost', 'req', '—', '9', 'The form’s <code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">aria-label</code> where no heading exists ⚑']
  ];
  out += section('A23 fields', cap('THE SHARED FIELD LIST · THE CONTRACT THAT MAKES DESIGN-SWITCHING SAFE') +
    table({ cols:['FIELD', 'TYPE', 'REQ', 'LIMIT', 'USED BY', 'NOTES'], widths:[300, 78, 48, 108, 176, 554], rows:F }) +
    note(`${b('Twenty-four authored fields and five things read from Ghost.')} A design may draw three — 9 Slim Bar draws a label, a placeholder and three tag links — but ${b('none needs a field the category does not have')}, so switching between any two of the fifteen preserves everything the user typed. ${b('The two designs that render no results still store every result field')} ⚑, which is the whole reason the contract is written at the category level and not per design. ${b('The reconciliation pass added one field')}: ${code('trailingTags[]')} for 9 Slim Bar’s hand-picked trailing group ⚑.`));

  // ── component inventory ─────────────────────────────────────────────
  const CI = [
    ['Result row', 'Title, one-line excerpt, “section · author · date” meta, on A18’s 700 measure', '<strong style="font-weight:600">A23</strong> (1)'],
    ['Suggestion row', 'The result row without its excerpt — 44 px, title plus meta; A1·9’s row', '<strong style="font-weight:600">A23</strong> (2)'],
    ['Match mark', 'A <code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">&lt;mark&gt;</code> at 16 % accent in light, 22 % in dark; the text underneath unchanged', '<strong style="font-weight:600">A23</strong> (1)'],
    ['Count line', '“12 results for “orbital”” — visible text and a polite live region in one element', '<strong style="font-weight:600">A23</strong> (1)'],
    ['No-match block', 'The query as a heading, one line naming the index, section chips, an archive link', '<strong style="font-weight:600">A23</strong> (1)'],
    ['Recent-query row', '44 px, ↺ glyph, the reader’s own string; never leaves the browser', '<strong style="font-weight:600">A23</strong> (1)'],
    ['Search panel', 'A 640 surface panel whose first row is the field — “the panel is the field’s border”', '<strong style="font-weight:600">A23</strong> (2)'],
    ['Keycap and key-hint row', '20 px mono caps in a hairline box; ↑↓ move · ↵ open · esc close', '<strong style="font-weight:600">A23</strong> (2)'],
    ['Group label', 'A 22 px heading-font label with its count over a hairline; a real <code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">h3</code>', '<strong style="font-weight:600">A23</strong> (15)'],
    ['Facet row', '32 px, label and count, active as A1·1’s 2 px accent underline', '<strong style="font-weight:600">A23</strong> (13)'],
    ['Progress line and meter', '“Showing 8 of 12” and a 2 px rule filling to the same proportion', '<strong style="font-weight:600">A23</strong> (14)'],
    ['Search field, 52 px', 'Surface fill, border token, 19 px ⌕, 16 px text, 32 px clear in a 44 px target', 'A4 (A4·15)'],
    ['Tag pill', 'Filter chip; inactive on hairline or hover-surface, active on accent with a derived label', 'A17 (15)'],
    ['Load-more button', 'Outline / Solid / Text at 24 px radius, 45 px tall, full width below 767', 'A17 (16)'],
    ['Post card', 'Image at 3:2 carrying the radius, title, one meta line; the whole card is the link', 'A17 (1)'],
    ['Thumb row', '160 × 107 at 3:2, 20 px from the text; steps 128 then 88', 'A18 (2)'],
    ['On-contrast derivation', 'muted 72 % · hairline 20 % · plate 7 % of the band’s carried colour', 'A17 (7)'],
    ['Warm scrim', 'A flat wash of the pack’s text colour at 30 / 45 / 60 %, never black', 'A20 (13)'],
    ['Surface plane', 'Pack radius + 4, one hairline, md shadow at Raised, forced Flat in dark', 'A19 (3) · A29 (4)'],
    ['Dropdown panel', '248 px surface, hairline, md shadow — widened to 640 here', 'A1 (1, 7)'],
    ['Focus ring', '2 px accent at a 4 px offset; <code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">-4px</code> inset where it meets a container edge', 'A6 · A17 (18)'],
    ['Icon button', '38 px box, 8 px radius, bare / outlined / filled', 'A1 (14)'],
    ['Eyebrow', '13 px uppercase, .08em tracked, muted', 'A1 (1)'],
    ['Nav item and active underline', '15 px muted at rest, text plus a 2 px accent underline active', 'A1 (1)'],
    ['Directory column', 'A 240 px list column of labels and counts beside a content column', 'A12 (10)'],
    ['Split head', '420 / 40 / 836 of the 1,296 box, stacking at 833', 'A5 (5)'],
    ['Content box and padding ladder', '1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132, 80 at 834, 64 at 390', 'A17'],
    ['Clipped-string rule', 'Clip visually, keep the whole string in the DOM', 'A18 (3)'],
    ['Batch focus rules', 'Focus to the first new item after a press; never on an automatic load', 'A18 (15) · A34'],
    ['Editor count line', '“N posts match. M drawn.” — the editor’s sibling of the public count line', 'A17']
  ];
  out += section('A23 components', cap('COMPONENT INVENTORY · CUMULATIVE · ELEVEN NEW, NINETEEN CARRIED FORWARD') +
    table({ cols:['COMPONENT', 'WHAT IT IS', 'FIRST FROM'], widths:[280, 830, 178], rows:CI }));

  // ── findings ────────────────────────────────────────────────────────
  const FI = [
    [`${b('What the index carries is a build decision, and the reconciliation pass made it a control.')} ${b('Search in: Titles and excerpts (default) · Full content')} ⚑ — the client-side index can fetch ${code('plaintext')} from the Content API, at a stated cost in index size. ${b('Every empty state’s wording follows the value')}, which is why the wording is an authored field. ${b('Verify the fetch budget on a large archive before build')} ⚑.`,
     `${b('Two facets at once has no Ghost route.')} Routes give a theme one taxonomy at a time, so 13 Facet Rail is single-select by construction. ${b('The closest module is filter-strip, which it declares')}; multi-facet filtering would need a query the platform does not expose to a theme.`,
     `${b('There is no year archive route by default.')} 13’s year facet needs a collection in ${code('routes.yaml')}. At the default Facets value no year rows are drawn and the editor names the reason ⚑.`,
     `${b('No cross-type relevance score exists.')} 15 Grouped’s order is an arrangement — Posts first, or Most matches first — and ${b('“best match” is deliberately not offered')}, because a theme cannot compute it.`,
     `${b('And no view counts reach a theme at all')} ⚑ — which is why ${b('“Most read” was struck from the pre-query row')} in this pass and replaced by featured and latest. ${b('If the platform ever exposes counts, the row gains a value and nothing else changes.')}`],
    [`${b('A section cannot scope a query to the route it sits on.')} 9 Slim Bar wanted “search this section” and cannot have it: A23 assumes page sections around it and ${b('cannot know what they are')} — the same route-awareness gap A21, A22 and A26–A29 each raised. ${b('Five categories have now reported it')} ⚑.`,
     `${b('2 Overlay and 3 Command Palette render nothing in the page flow.')} No ground, no padding, no place in the page order — and therefore ${b('no universal trio')}. ${b('ARCHITECT: editor-surface ruling')} ⚑ — the editor needs a surface that lists a panel with the header that opens it rather than in the page stack. A product decision, drawn as a note on both frames.`,
     `${b('Ghost gives a tag’s post count cheaply and an author’s not at all.')} 3 and 15 draw one and not the other, which looks like an inconsistency on the frame and is a data limit. ${b('Named in both panels.')}`,
     `${b('There is no server-side search in a Ghost theme.')} A template cannot read ${code('?q=')}, so ${b('the no-JS floor across all fifteen is a field and an archive link')} ⚑ — 8 Big Type’s and 15 Grouped’s server-side claims were struck in this pass. ${b('Ghost’s numbered /page/2/ links page the archive, not the query.')}`,
     `${b('8 Big Type echoes reader input at 96 px')} — the only place in the library that renders a reader’s string at display size. ${b('Escape it, and cap the echo at 60 characters')}: a build requirement, written into the spec rather than left as a design note ⚑.`,
     `${b('search-expand is in the registry and A23 declares it nowhere')} ⚑. A23’s fields are persistent or in a panel, so nothing expands from a trigger. ${b('It belongs to A1’s header affordances')}, and if no category claims it the registry has an unused entry — a finding for the architect.`]
  ];
  out += section('A23 findings', cap('FINDINGS FOR THE ARCHITECT · ELEVEN AFTER THE RECONCILIATION PASS · TWO NEW, TWO REWRITTEN') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${FI.map(col =>
      tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', body:`<div style="display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${col.map(x => `<span>${x}</span>`).join('')}</div>` })).join('')}</div>` +
    note(`${b('None of these is a request for a new behaviour module.')} The registry is closed and A23 uses five of its thirty-one — ${code('search-overlay')}, ${code('command-palette')}, ${code('filter-strip')}, ${code('accordion')}, ${code('load-more')} — with ${b('two designs declaring none at all')}. Where a design wanted behaviour no module covers, it says so and names the closest one ⚑.`));

  out += K.DOC_TAIL;
  return out;
}

return { build, proofCell, stressFrame };
})();
