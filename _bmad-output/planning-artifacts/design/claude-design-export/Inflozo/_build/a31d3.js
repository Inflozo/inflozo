// A31 designs 8–10 · Elsewhere · Directory · Display
globalThis.A31D3 = (function () {
const K = globalThis.A31LIB, P = globalThis.A31PAGE;
const { L, D, MONO, PK, b, code, gap, hb, PAGE, NAVSET } = K;
const R = K.specRow;
const S = a => [a.slice(0, 5), a.slice(5)];
const FLAGGED = extra => `${b('Flagged ⚑')} ${extra}`;
const SEARCH_SETTLE = `${b('Search is drawn on the 404 only')} ⚑ — A23’s field over a real ${code(hb('form action="/search/" method="get"'))}. ${b('Never on a 500')}, never on the gate.`;
const HANDOFF = (why, to) => `<span style="font-family:${MONO};font-size:10px;color:#6B6459">HAND-OFF ⚑ · ${why} · THIS DESIGN RENDERS ${to} · A1·11 AND A29·5’S RULE, CARRIED</span>`;

/* ── 8 · Elsewhere ────────────────────────────────────────────────────── */
const d8 = {
  n:8, name:'Elsewhere', gnd:'page',
  rail:'A31 ERROR AND UTILITY · DESIGN 8 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'The message, a hairline, and then five recent posts as A18’s ruled rows. It treats a 404 as an archive page that happens to open with an apology, which is the most useful thing a lost reader can be given: something to read.',
    'It is the design that shows what a 500 costs. The rows are a query, a 500 may not query, so at a 500 the list is gone and the page is the message alone — drawn here rather than described.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · MESSAGE AT 620, THEN FIVE POST ROWS ON THE 820 MEASURE',
  frameOpt:(kind) => kind === 'e404' ? { searchOn:true, top:true, h:'auto' } : { top:true },
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const kind = o.kind;
    const head = K.block(t, g, w, { kind, measure:w === 390 ? 350 : 620, codeStyle:'chip',
      search:kind === 'e404', links:false, row:w !== 390, formState:o.formState,
      formW:w === 390 ? undefined : 360, searchW:w === 1440 ? 460 : undefined });
    if (kind === 'e500') {
      return `<div style="width:100%;display:flex;flex-direction:column;gap:18px">${head}
        ${HANDOFF('A 500 MAY NOT QUERY POSTS · THE LIST IS DROPPED, NOT EMPTIED', 'AS 1 CENTRED, FLUSH LEFT')}</div>`;
    }
    if (kind === 'gate') {
      return `<div style="width:100%;display:flex;flex-direction:column;gap:18px">${head}
        ${HANDOFF('POST TITLES ARE WHAT A PRIVATE SITE WITHHOLDS', 'THE MESSAGE AND THE FORM ALONE')}</div>`;
    }
    const measure = w === 1440 ? 820 : w === 834 ? 674 : 350;
    const label = `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${PK.body}">Recently on Orbit Weekly</span>`;
    const rows = K.rows(t, g, { n:w === 390 ? 3 : 5, q:false, measure, density:w === 390 ? 18 : 22,
      titleSize:w === 390 ? 18 : 21, excerpt:w !== 390, read:true, pack:PK, width:measure });
    return `<div style="width:100%;display:flex;flex-direction:column">${head}${gap(w === 390 ? 34 : 44)}${label}${gap(6)}${rows}
      ${gap(14)}<span style="font-family:${MONO};font-size:10px;color:${g.muted}">${hb('#get "posts" limit="5" order="published_at desc"')} · THE 404 MAY QUERY FREELY ⚑ · NO EXCERPT AT ≤ 767</span></div>`;
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'page');
    const head = K.block(t, g, 834, { kind, measure:520, codeStyle:'chip', search:kind === 'e404',
      links:false, row:true, formState:o.formState, formW:320 });
    if (kind !== 'e404') return `<div style="display:flex;flex-direction:column;gap:14px">${head}${
      HANDOFF(kind === 'e500' ? 'NO QUERY ON A 500' : 'NO TITLES ON THE GATE', 'THE MESSAGE ALONE')}</div>`;
    return `<div>${head}${gap(24)}${K.rows(t, g, { n:2, q:false, measure:560, density:18, titleSize:18, excerpt:false, pack:PK })}</div>`;
  },
  note404:`${b('Two measures, and that is the design')} ⚑ — the message at 620 because it is prose, the rows at 820 because they are A18’s list and that is A18’s measure. ${b('The rows are the standard result row, verbatim')}: title at 21 in the heading font, one excerpt line, meta at 13. ${b('Nothing is marked, highlighted or badged')} — these posts are not results and there is no query to mark them against ⚑.`,
  note500:`${b('This is what a 500 costs, drawn rather than described')} ⚑. The rows are ${code(hb('#get "posts"'))}, a 500 may not query, ${b('so the list is dropped and not emptied')} — no “nothing to show”, no skeleton rows, ${b('no reserved space')} ⚑. What is left is the message, flush left, which is 1 Centred at its left alignment.`,
  noteGate:`${b('Post titles are exactly what a private site is withholding')} ⚑, so the gate draws the message and the form and nothing else. ${b('It is the only hand-off in A31 made for a privacy reason rather than a technical one')}, and it is the design’s most important line.`,
  noteStates:`The gate is the message and the form, so ${b('its states are 1 Centred’s at this design’s left alignment')} ⚑ — the error above the label, the field empty, focus returned to it.`,
  noteFocus:`One accent, on the button. ${b('The rows’ hover is the title going to the accent-free text colour with its underline appearing')} ⚑ — A18’s row hover, carried; ${b('the row is one link and the excerpt is inside it')}.`,
  capResp:'TABLET 834 · ROWS AT 674 · MOBILE 390 · THREE ROWS, NO EXCERPT ⚑',
  labelTablet:'834 · message 560 · rows 674 · five rows with excerpts',
  labelMobile:'390 · message 350 · rows 350 · three rows, title and meta',
  labelMobileGate:'390 · THE GATE · message and form, no rows ⚑',
  noteResp:`${b('At ≤ 767 the list drops to three rows and loses its excerpts')} ⚑ — five rows with excerpts is 900 px of scroll under an apology. ${b('The count is a rule and not the control’s value')}: whatever How many posts says, ${b('three is the ceiling below 767')} ⚑. Title 18, meta 13, density 18.`,
  noteDark:`Rows, rules and meta all move with the tokens; ${b('nothing about the two measures changes')}. ${b('The row hairline is ')}${code('#332E27')}${b(' and the rows are the page ground, not a surface')} ⚑ — a list of five cards on an error page is five objects competing with one message.`,
  controls:{
    name:'Elsewhere', n:8, count:'SIX', sub:'The message, then recent posts as ruled rows.',
    rows:[
      K.seg('How many posts', ['3', '5', '8'], 1, `${b('Three is the ceiling below 767')} ⚑ whatever this says. At 8 the page scrolls, which on a 404 is acceptable — the reader has nothing else to do here.`),
      K.seg('Row', ['Title only', 'Title and meta', 'Title, meta and excerpt'], 2, 'A18’s row treatments, carried. Excerpt is dropped below 767 at every value ⚑.'),
      K.seg('Selection', ['Most recent', 'Featured only', 'Most recent in the same tag'], 0, `${b('Most recent in the same tag')} is drawn disabled ⚑ — ${b('a 404 has no tag')}: the URL did not match anything, so there is nothing to be the same as. ${b('It is shown struck through rather than omitted')} so nobody goes looking for it.`, [2]),
      K.seg('Thumbnails', ['None', 'Small 96', 'Standard 128'], 0, `${b('None is the default')} ⚑ — five thumbnails on an error page turn an apology into a grid. Small and Standard are A18·2’s thumb sizes, carried.`),
      K.seg('Code', ['Chip', 'Plain', 'Hidden'], 0, 'As 1 Centred.'),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} ${b('Above the rows, in the message block')} — the field and the list are two answers to the same question, and the field is the faster one.`)
    ],
    settles:[
      `${b('Alignment is not a control here')} ⚑. A list of ruled rows is flush left by construction, and a centred message over a left-aligned list is two designs in one page. ${b('That is the row this design spends instead of Alignment')}: Thumbnails.`,
      `${b('A disabled value with its reason is better than a missing one')} ⚑ — “Most recent in the same tag” is the first thing a publication will ask for, and the panel answers it in place: a 404 has no tag.`,
      `${b('Closest neighbour: 9 Directory')}, the other ${code('many')} design ⚑ — its items are Ghost’s navigation and ${b('mine are Ghost’s posts')}. ${b('Neither is an authored repeater')}: the only authored list in A31 is ${code('links[]')}, and this design hides it ⚑.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'The message at 620 with an optional search field, a hairline, then five recent posts as A18’s ruled rows at 820. Hands off to the message alone on a 500 and on the gate ⚑.'),
    R(2, 'Structural descriptor', `${code('feed · none · page · many · none · recent posts under the message')}<br><span style="color:#6B6459">Archetype ${code('feed')} and item-count ${code('many')} together are the claim ⚑. ${b('Containment ')}${code('none')} — the rows are ruled, not carded, and even at Thumbnails = Standard the section itself is in no box.</span>`),
    R(3, 'Archetype', 'feed. Its ladder: rows narrow with the measure, meta wraps under the title below 767. Departures: **three rows and no excerpt below 767** ⚑, and **no list at all on a 500 or the gate** ⚑.'),
    R(4, 'Responsive rule', `${b('1440')} message 620, rows 820, five rows, excerpt one line, density 22, title 21. ${b('834')} message 560, rows 674, five rows. ${b('≤ 767')} message 350, rows 350, ${b('three rows, no excerpt')} ⚑, title 18, density 18, button and field full width, top-aligned throughout ⚑.`),
    R(5, 'Content fields', `The union less ${code('image')} and less ${code('links[]')} — ${b('this design stores the authored list and does not draw it')} ⚑, because the rows are the recovery. Adds ${code('postsLabel')} (default “Recently on Orbit Weekly”).`),
    R(6, 'Controls', 'How many posts (3 · 5 · 8) · Row (Title only · Title and meta · Title, meta and excerpt) · Selection (Most recent · Featured only · ~~Most recent in the same tag~~ disabled) · Thumbnails (None · Small 96 · Standard 128) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide). Then the page source group.'),
    R(7, 'Data', `${code(hb('#get "posts" limit="5" order="published_at desc"'))} on the 404 only ⚑. ${b('0 posts')} → the label and the hairline leave with the list and the page is the message ⚑ — a new site’s 404 is not an empty state to fill. ${b('1')} → one row, no stretch. ${b('many')} → capped at the control’s value. ${b('On a 500 and the gate no query is made at all')} ⚑.`),
    R(8, 'Empty state', `As above: ${b('the list is absent, never empty')} ⚑. No excerpt on a post → the row is title and meta and closes up. No feature image at Thumbnails = Standard → ${b('the row draws without one and does not reserve the slot')} ⚑ (A18’s rule).`),
    R(9, 'Behaviour module', P.NONE + ` ${b('The rows are ')}${code('a')}${b(' elements')} — there is nothing to load, page or shuffle. ${b('It does not declare ')}${code('load-more')} ⚑: an error page with pagination is an archive page wearing an apology.`),
    R(10, 'Accessibility', `Heading is the ${code('h1')}; ${b('the list is a ')}${code('ul')}${b(' of links with an accessible name from ')}${code('postsLabel')} ⚑. Each row is one link containing title, excerpt and meta, ${b('so a screen reader reads a whole row as one target')} — A18’s decision, carried. Meta 13 px at 5.4:1.`),
    FLAGGED('Two measures (620 and 820) is invented, as is dropping to three rows below 767 and defaulting thumbnails off. The disabled “same tag” value is this design’s finding stated as a control. Whether a 404 may safely query at all — under load, an error page that runs a query is an error page that can fail — is flagged for the architect.')
  ])
};

/* ── 9 · Directory ────────────────────────────────────────────────────── */
const d9 = {
  n:9, name:'Directory', gnd:'page',
  rail:'A31 ERROR AND UTILITY · DESIGN 9 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'The message, then the site’s own navigation drawn at page scale in two columns — every section the publication has, ruled, at 19 px. It answers a 404 with a map instead of a sentence.',
    'It is the design that makes §8’s navigation question visible, because it is the one made of navigation: on a 500 there is none to draw and on the gate there must be none, so it hands off twice and says so both times.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · MESSAGE AT 560, THEN GHOST’S NAVIGATION IN TWO COLUMNS',
  frameOpt:(kind) => kind === 'e404' ? { searchOn:true, top:true, h:'auto' } : { top:true },
  body(t, w, o) {
    const g = K.ground(t, 'page');
    const kind = o.kind;
    const head = K.block(t, g, w, { kind, measure:w === 390 ? 350 : 560, codeStyle:'chip',
      search:kind === 'e404', links:false, row:w !== 390, formState:o.formState,
      formW:w === 390 ? undefined : 360, searchW:w === 1440 ? 460 : undefined });
    if (kind !== 'e404') {
      return `<div style="width:100%;display:flex;flex-direction:column;gap:18px">${head}
        ${HANDOFF(kind === 'e500' ? 'NAVIGATION IS DATA, AND A 500 MAY NOT ASK FOR IT' : 'NAV LABELS DESCRIBE A SITE THE VISITOR IS NOT IN YET', 'AS 1 CENTRED, FLUSH LEFT')}</div>`;
    }
    const cols = w === 390 ? 1 : 2;
    const label = `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${PK.body}">Everything the site does have</span>`;
    const item = n => `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:${w === 390 ? 48 : 56}px;border-top:1px solid ${g.border}">
      <span style="font-family:${PK.head};font-size:${w === 1440 ? 19 : w === 834 ? 18 : 17}px;font-weight:700;color:${g.text}">${n}</span>
      <span style="font-size:13px;color:${g.muted};font-family:${PK.body}">→</span></div>`;
    const half = Math.ceil(NAVSET.length / cols);
    const col = i => `<div style="flex:1;min-width:0;display:flex;flex-direction:column">${
      NAVSET.slice(i * half, (i + 1) * half).map(item).join('')}<div style="height:1px;background:${g.border}"></div></div>`;
    return `<div style="width:100%;display:flex;flex-direction:column">${head}${gap(w === 390 ? 32 : 44)}${label}${gap(8)}
      <div style="display:flex;gap:${w === 1440 ? 48 : 32}px;width:${w === 1440 ? 1000 : '100%'}${w === 1440 ? 'px' : ''}">${
        Array.from({ length:cols }, (_, i) => col(i)).join('')}</div>
      ${gap(14)}<span style="font-family:${MONO};font-size:10px;color:${g.muted}">${hb('navigation')} · GHOST’S OWN NAV: LABEL AND URL, NOTHING ELSE ⚑ · NO COUNTS, NO DESCRIPTIONS, NO IMAGES</span></div>`;
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'page');
    const head = K.block(t, g, 834, { kind, measure:500, codeStyle:'chip', search:kind === 'e404',
      links:false, row:true, formState:o.formState, formW:320 });
    if (kind !== 'e404') return `<div style="display:flex;flex-direction:column;gap:14px">${head}${
      HANDOFF(kind === 'e500' ? 'NO NAVIGATION ON A 500' : 'NO NAVIGATION ON THE GATE', 'AS 1 CENTRED')}</div>`;
    return `<div>${head}${gap(22)}<div style="display:flex;flex-direction:column">${
      NAVSET.slice(0, 3).map(n => `<div style="display:flex;align-items:center;justify-content:space-between;min-height:48px;border-top:1px solid ${g.border}">
        <span style="font-family:${PK.head};font-size:18px;font-weight:700;color:${g.text}">${n}</span><span style="font-size:13px;color:${g.muted}">→</span></div>`).join('')}
      <div style="height:1px;background:${g.border}"></div></div></div>`;
  },
  note404:`${b('The nav is drawn from ')}${code(hb('navigation'))}${b(' and carries a label and a URL and nothing else')} ⚑ — ${b('no counts, no descriptions, no images')}, because Ghost’s navigation has none of those and a design that showed them would be showing invented data. ${b('The items are 56 px tall with a hairline each')}, in the heading font at 19, which is what makes this a directory rather than a footer.`,
  note500:`${b('Navigation is data')} ⚑, and a 500 may not ask for data — ${b('so the design that is made of navigation cannot render at a 500')} and hands off to 1 Centred, flush left, with the 500’s copy. ${b('It is the sharpest illustration of §8·4 in the category')}: the honest answer to “what can a 500 rely on” is “its own words and one link”.`,
  noteGate:`${b('The second hand-off, and it is not technical')} ⚑ — Ghost would happily give the gate its navigation; ${b('the design refuses it')}, because a list of section names is a description of a site the visitor has not been admitted to. ${b('The gate is the message and the form')}.`,
  noteStates:`As 1 Centred at this design’s left alignment ⚑ — the gate is that arrangement, so the form’s four states are the same four.`,
  noteFocus:`One accent, on the button. ${b('Nav item hover is the label’s underline and the arrow moving 2 px')} ⚑ — the only motion in A31, at 160 ms, and it is dropped under reduced-motion while the underline stays.`,
  capResp:'TABLET 834 · TWO COLUMNS HOLD AT 32 · MOBILE 390 · ONE COLUMN, ITEMS AT 48 ⚑',
  labelTablet:'834 · message 560 · two columns · items 56',
  labelMobile:'390 · message 350 · one column · items 48',
  labelMobileGate:'390 · THE GATE · the hand-off: message and form',
  noteResp:`${b('Two columns to one at 767')} ⚑, in source order — first column then second, which is alphabetical-by-nothing and matches Ghost’s own order. ${b('Items step 56 → 56 → 48')}, and 48 is above the 44 floor because a directory is a list a thumb reads down. ${b('Three columns is offered above 1,200 only')} ⚑ and is ignored below it.`,
  noteDark:`${b('The item hairlines are the whole design in dark')} ⚑ — ${code('#332E27')}, one per item and one closing the column, which is the same doubled-line problem 4 Boxed has and the same answer: one token, used once per boundary.`,
  controls:{
    name:'Directory', n:9, count:'SIX', sub:'The site’s own navigation, drawn at page scale.',
    rows:[
      K.seg('Columns', ['One', 'Two', 'Three'], 1, `${b('Three is ignored below 1,200')} ⚑ and resolves to two. One column is the right answer for a publication with four sections.`),
      K.seg('Item size', ['Standard 17', 'Large 19', 'Display 24'], 1, `The heading font at page scale. ${b('At Display 24 the item height goes to 64')} ⚑ — the type ladder and the target ladder move together, always.`),
      K.seg('Which navigation', ['Primary', 'Primary and secondary'], 0, `Ghost’s two navigation lists ⚑. ${b('Secondary is drawn in the same treatment, not smaller')} — a directory with two type sizes is a hierarchy the publication did not author.`),
      K.seg('Rules', ['Hairline per item', 'None'], 0, 'A hairline above each item and one closing the list, or nothing at all. At None the items keep their heights ⚑.'),
      K.seg('Code', ['Chip', 'Plain', 'Hidden'], 0, 'As 1 Centred.'),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} ${b('Above the directory')} — a reader who knows the word wants the field, and a reader who does not wants the map.`)
    ],
    settles:[
      `${b('No control adds anything to a nav item')} ⚑ — no count, no description, no icon, no thumbnail. Ghost’s navigation is a label and a URL; ${b('everything else would have to be invented per item')}, and per-item content is not something a design control can hold.`,
      `${b('The nav list is Ghost’s and is edited in Ghost')} ⚑ — there is no Add, no Remove and no reorder in this panel. ${b('It is the same rule A32 applied to tiers')}: an object the user manages elsewhere is not a repeater the section owns.`,
      `${b('Two hand-offs, both stated')} ⚑: 500 and gate. ${b('This is the only design in A31 that cannot draw two of the three pages')}, and the panel names 1 Centred as what renders instead.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'The message at 560, then Ghost’s own navigation drawn at page scale in two ruled columns at 19 px. A 404 answered with a map. Hands off to 1 Centred on the 500 and on the gate ⚑.'),
    R(2, 'Structural descriptor', `${code('nav · none · page · many · none · the site’s own navigation as the page')}<br><span style="color:#6B6459">Archetype ${code('nav')} is the claim and it is literal — ${b('the section’s arrangement is a navigation list')}. It shares ${code('many')} with 8 Elsewhere and differs on archetype and on source: ${b('Ghost’s nav, not Ghost’s posts')} ⚑.</span>`),
    R(3, 'Archetype', 'nav. Its ladder: columns collapse to one at 767, items keep their targets. Departures: **three columns only above 1,200** ⚑, and **two hand-offs** ⚑.'),
    R(4, 'Responsive rule', `${b('1440')} message 560, two columns at 1,000 total on a 48 gap, items 56, labels 19. ${b('834')} two columns on a 32 gap, items 56, labels 18. ${b('≤ 767')} one column in source order, items 48, labels 17, ${b('button and field full width')}, top-aligned. ${b('Three columns is ignored below 1,200')} ⚑.`),
    R(5, 'Content fields', `The union less ${code('image')} and less ${code('links[]')} — ${b('stored, not drawn')} ⚑: the navigation is the recovery. Adds ${code('directoryLabel')} (default “Everything the site does have”).`),
    R(6, 'Controls', 'Columns (One · Two · Three) · Item size (Standard 17 · Large 19 · Display 24) · Which navigation (Primary · Primary and secondary) · Rules (Hairline per item · None) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide). Then the page source group.'),
    R(7, 'Data', `${code(hb('navigation'))} — ${b('label and URL only')} ⚑. ${b('0 items')} → the design hands off to 1 Centred ⚑, because a directory with nothing in it is a heading over a hairline. ${b('1–3')} → one column whatever Columns says ⚑. ${b('many')} → columns fill down then across, and 14 items is the most a publication has. ${b('No query on the 500 or the gate')} ⚑.`),
    R(8, 'Empty state', `As above — ${b('an empty navigation is a hand-off, not an empty state')} ⚑. A nav item with a very long label wraps to two lines inside its own row and the row grows; ${b('it is never clipped')} ⚑, because a truncated section name is a wrong section name.`),
    R(9, 'Behaviour module', P.NONE + ` ${b('The header’s own drawer still declares ')}${code('nav-drawer')}${b(' at ≤ 767')} — that is A1’s header, not this section ⚑.`),
    R(10, 'Accessibility', `${b('The directory is a ')}${code('nav')}${b(' landmark with an accessible name')} ⚑ — the second nav on the page after the header’s, which is why the name matters. Items are ${code('a')} elements filling their row, 48 px minimum ⚑. ${b('The arrow is ')}${code('aria-hidden')} ⚑. Heading is the ${code('h1')}.`),
    FLAGGED('Refusing to draw navigation on the gate is a design decision rather than a technical limit, and it is the category’s most arguable line. The 1,000 px two-column block, the 56 → 48 item ladder and the 1,200 px threshold for three columns are invented. Whether Ghost exposes a secondary navigation list to an error template is flagged for the architect.')
  ])
};

/* ── 10 · Display ─────────────────────────────────────────────────────── */
const d10 = {
  n:10, name:'Display', gnd:'contrast',
  rail:'A31 ERROR AND UTILITY · DESIGN 10 OF 10 · PAPER PACK · SIX CONTROLS + THE PAGE SOURCE',
  paras:[
    'The status code at 156 px in the heading font, held in the left column of an inverted band, with the message and the way out in the right. It is the category’s one display moment and the only design in A31 that makes the number the picture.',
    'On the gate there is no number, so the display slot draws the word Private at the same size. That is the design’s one invention and the panel offers two alternatives for it.'
  ],
  cap404:'DESKTOP 1440 · LIGHT · THE 404 · CODE AT 156 IN THE LEFT COLUMN · CONTRAST BAND, FULL BLEED',
  frameOpt:() => ({ bleed:true }),
  body(t, w, o) {
    const g = K.ground(t, 'contrast');
    const kind = o.kind;
    const pad = w === 1440 ? '96px 72px' : w === 834 ? '80px 40px' : '56px 20px';
    const size = w === 1440 ? 156 : w === 834 ? 104 : 68;
    const disp = K.displayCode(g, PAGE[kind].code || 'Private', size);
    const right = kind === 'gate'
      ? `${K.headingEl(g, w, PAGE.gate.heading, { measure:w === 1440 ? 520 : 420 })}${gap(14)}${
          K.blurbEl(g, w, PAGE.gate.blurb, { measure:w === 1440 ? 480 : 400 })}${gap(26)}${
          K.gateForm(t, g, w, { state:o.formState, w:w === 390 ? undefined : 360 })}`
      : `${K.headingEl(g, w, PAGE[kind].heading, { measure:w === 1440 ? 520 : 420 })}${gap(14)}${
          K.blurbEl(g, w, PAGE[kind].blurb, { measure:w === 1440 ? 480 : 400 })}${
          kind === 'e404' ? gap(24) + K.searchRow(g, w, { w:w === 1440 ? 440 : undefined }) : ''}${gap(26)}${
          K.actions(g, w, kind, {})}${kind === 'e404' ? gap(26) + `<div style="width:100%;max-width:480px;height:1px;background:${g.border}"></div>` + gap(18) + K.linkList(g, { style:'row' }) : ''}`;
    const inner = w === 390
      ? `<div style="display:flex;flex-direction:column;gap:22px;width:100%">${disp}<div>${right}</div></div>`
      : `<div style="display:flex;gap:${w === 1440 ? 72 : 48}px;align-items:flex-start;width:100%">
          <div style="width:${w === 1440 ? 38 : 34}%;flex-shrink:0">${disp}</div>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column">${right}</div></div>`;
    return `<div style="width:100%;flex:1;background:${g.bg};padding:${pad};box-sizing:border-box;display:flex;align-items:center">${inner}</div>`;
  },
  stateBody(t, kind, o) {
    o = o || {};
    const g = K.ground(t, 'contrast');
    return `<div style="width:100%;background:${g.bg};border-radius:${g.r}px;padding:24px;box-sizing:border-box;display:flex;gap:24px;align-items:flex-start">
      <div style="flex-shrink:0">${K.displayCode(g, PAGE[kind].code || 'Private', 72)}</div>
      <div style="flex:1;min-width:0">${K.headingEl(g, 834, PAGE[kind].heading, { measure:280, size:24 })}${gap(12)}
        ${kind === 'gate' ? K.gateForm(t, g, 834, { state:o.formState, w:280, mono:false }) : K.actions(g, 834, kind, {})}</div></div>`;
  },
  note404:`${b('156 px of tabular numeral, in the heading font, on the band’s carried ink')} ⚑ — one display moment, and the design spends it on the only piece of content that is genuinely a number. ${b('The columns are 38 · 62 and top-aligned')}: the numeral’s cap height sits on the heading’s, which is the alignment that makes a display figure read as a title rather than a decoration ⚑.`,
  note500:`${b('500 is the same picture with a different number')}, and it is the one design where the 500 is as strong as the 404 ⚑ — the numeral carries the page, the message is two lines, and nothing was queried to draw either.`,
  noteGate:`${b('There is no numeral at ')}${code('/private/')} ⚑, so the display slot draws the word ${b('Private')} at the same size. ${b('It is the design’s one invention')} and the panel offers the two alternatives — the site title, or nothing at all with the message taking the full width.`,
  noteStates:`${b('The form sits in the right column and the numeral does not move')} ⚑. ${b('The error message is carried ink on a 12 % plate')}, above the label, as 6 Contrast Band’s is — the two designs share the band’s derivation exactly.`,
  noteFocus:`${b('Carried ink, not accent')} ⚑ — this is a band, so the button, the ring and the field’s focus border all come from the band’s ink. ${b('The accent value is disabled with its ratio')}, as in 6.`,
  capResp:'TABLET 834 · CODE 104, COLUMNS 34 · 66 · MOBILE 390 · CODE 68, STACKED ABOVE THE MESSAGE ⚑',
  labelTablet:'834 · code 104 · columns 34 · 66 · gap 48',
  labelMobile:'390 · code 68 · stacked · the numeral first ⚑',
  labelMobileGate:'390 · THE GATE · “Private” at 68, then the form',
  noteResp:`${b('The split collapses at 833 and the numeral goes first')} ⚑ — it is the page’s title, and a title below its own subtitle is not a title. ${b('The numeral steps 156 · 104 · 68')}, which keeps it at roughly 2.4 × the heading at every width ⚑ rather than at a fixed ratio of the viewport.`,
  capDark:'DESKTOP 1440 · DARK · THE BAND INVERTS WITH THE MODE ⚑ · THE NUMERAL IS THE DARK INK',
  noteDark:`${b('The band inverts')} ⚑ — ${code('#EDE7DA')} carrying ${code('#171511')} — so in dark the numeral is dark ink on a light band. ${b('At 156 px that is the highest-contrast object in the whole library')} and it is worth saying out loud: ${b('a display numeral is where a mis-tuned dark mode shows first')}.`,
  darkSecond:'gate',
  controls:{
    name:'Display', n:10, count:'SIX', sub:'The code at display size, on an inverted band.',
    rows:[
      K.seg('Display size', ['Large 120', 'Standard 156', 'Huge 200'], 1, `${b('The numeral only')} ⚑ — the heading, the sentence and the button do not move with it. ${b('The type ladder is never scaled by a control')}, and this row is the exception that proves it: it moves one element.`),
      K.seg('Split', ['Code 38 / 62', 'Even'], 0, `38 · 62 is the default ⚑. ${b('Even gives a 200 px numeral half the page')}, which is a poster rather than an error page — offered, not recommended.`),
      K.seg('The gate’s display slot', ['The word Private', 'The site title', 'Nothing'], 0, `${b('There is no status code at ')}${code('/private/')} ⚑. At ${b('Nothing')} the right column takes the full width and the design becomes 6 Contrast Band on that page ⚑ — stated rather than hidden.`),
      K.seg('Band height', ['Fill the viewport', 'Content height'], 0, 'As 6 Contrast Band.'),
      K.seg('Search on the 404', ['Show', 'Hide'], 0, `${SEARCH_SETTLE} At 440 in the right column.`),
      K.seg('Recovery links', ['Show', 'Hide'], 0, 'A wrapping row in the right column under a 20 % hairline. Dropped on the 500 ⚑.')
    ],
    settles:[
      `${b('One control moves one element, and it is named for that element')} ⚑ — “Display size”, not “Scale”. A row that scaled the whole ladder would let a user make the sentence 30 px, and ${b('no panel in this library offers that')}.`,
      `${b('The gate’s display slot is the design’s honest gap')} ⚑. There is no number, so something has to be invented or nothing drawn; ${b('all three answers are offered and the invented one is the default')}, marked as invented.`,
      `${b('Closest neighbours: 6 Contrast Band')} (same ground, no numeral) ${b('and 2 Split Reason')} (same split, page ground). ${b('Set the gate slot to Nothing and this design is 6 on that one page')} — which is why the row says so.`
    ]
  },
  spec:S([
    R(1, 'Descriptor', 'The status code at 156 px in the heading font in the left column of an inverted full-bleed band, message, search field, action and recovery list in the right. The category’s one display moment.'),
    R(2, 'Structural descriptor', `${code('split · none · contrast · none · none · the code at display size')}<br><span style="color:#6B6459">${b('Ground ')}${code('contrast')}${b(' separates it from 2 Split Reason')}; ${b('archetype ')}${code('split')}${b(' separates it from 6 Contrast Band')} ⚑. It is the only design in A31 whose uniqueness needs two slots rather than one.</span>`),
    R(3, 'Archetype', 'split. Its ladder: two columns above 833, stacked below with **the numeral first** ⚑. One departure: the block stays centred on the band at ≤ 767, as 6 does ⚑.'),
    R(4, 'Responsive rule', `${b('1440')} band full bleed, padding 96 · 72, columns 38 · 62 on a 72 gap, numeral 156, heading 40, field 440. ${b('834')} padding 80 · 40, columns 34 · 66 on a 48 gap, numeral 104, heading 34. ${b('≤ 767')} stacked, ${b('numeral 68 first')} ⚑, padding 56 · 20, heading 28, field and button full width, block centred.`),
    R(5, 'Content fields', `The union less ${code('image')}. ${code('code')} ${b('is the field this design is built on')} ⚑ — at 4 characters it is the shortest in the union and the only one drawn at 156 px. Adds ${code('gateDisplayWord')} (default “Private”) ⚑.`),
    R(6, 'Controls', 'Display size (Large 120 · Standard 156 · Huge 200) · Split (Code 38 / 62 · Even) · The gate’s display slot (The word Private · The site title · Nothing) · Band height (Fill the viewport · Content height) · Search on the 404 (Show · Hide) · Recovery links (Show · Hide). Then the page source group.'),
    R(7, 'Data', `${code('statusCode')} on the error pages ⚑ — ${b('the numeral is Ghost’s, not the author’s')}, and a publication that types “404” into the field gets it overwritten. Nothing is queried. On the gate the slot is the authored word.`),
    R(8, 'Empty state', `${b('No code cannot happen on an error page')} ⚑ — Ghost always has a status. ${b('On the gate an empty display word renders nothing and the right column takes the full width')} ⚑. Other fields as 1 Centred.`),
    R(9, 'Behaviour module', P.NONE),
    R(10, 'Accessibility', `${b('The numeral is ')}${code('aria-hidden')}${b(' and the heading carries the meaning')} ⚑ — “404” read aloud before the sentence is noise, and the page title already names the code. ${b('It is decorative type, not a heading')}, and it is not in the focus order. Derived values as 6 Contrast Band; the accent is disabled at 4.0:1 ⚑.`),
    FLAGGED('The word Private in the gate’s display slot is invented and marked as such in the panel. The 38 · 62 split, the 156 · 104 · 68 ladder and the 2.4 × relationship to the heading are A31’s own. Marking the numeral aria-hidden is a judgement: it is the only design where the page’s largest element is not read out.')
  ])
};

return { designs:[d8, d9, d10] };
})();
