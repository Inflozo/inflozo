// A31-0 Category Proof — settlements, the three pages anatomised, tokenisation proof,
// stress frame, roster, shared field list, component inventory, findings.
globalThis.A31PROOF = (function () {
const K = globalThis.A31LIB, P = globalThis.A31PAGE;
const { L, D, MONO, PACKS, PK, b, code, cap, note, section, tile, table, gap, hb, PAGE, LINKS } = K;

/* ── the tokenisation proof · 1 Centred in three packs, light and dark ── */
function proofCell(pk, dark) {
  const t = dark ? pk.d : pk.l;
  const g = K.ground(t, 'page', pk);
  const chip = `<span style="display:inline-flex;align-items:center;height:26px;padding:0 11px;border:1px solid ${g.border};border-radius:${Math.min(pk.r, 8)}px;font-family:${MONO};font-size:11.5px;letter-spacing:.06em;color:${g.muted}">404 · Not found</span>`;
  const field = `<span style="width:100%;height:48px;background:${g.fieldBg};border:1px solid ${g.border};border-radius:${pk.r}px;display:flex;align-items:center;gap:11px;padding:0 15px;box-sizing:border-box;font-size:15px;color:${g.ph};font-family:${pk.body}"><span style="font-size:18px;color:${g.ph}">⌕</span>Search 412 essays and interviews</span>`;
  const inner = `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;max-width:460px;margin:0 auto">
    ${chip}<div style="height:16px"></div>
    <span style="font-family:${pk.head};font-size:32px;font-weight:700;line-height:1.12;letter-spacing:-0.03em;color:${g.text}">${PAGE.e404.heading}</span>
    <div style="height:13px"></div>
    <span style="font-size:15px;line-height:1.6;color:${g.muted};font-family:${pk.body}">${PAGE.e404.blurb}</span>
    <div style="height:22px"></div>${field}<div style="height:22px"></div>
    <div style="display:flex;align-items:center;gap:18px">${K.btn(g, { label:PAGE.e404.cta, pack:pk, h:44, px:20 })}
      <span style="font-size:14px;color:${g.text};font-family:${pk.body};text-decoration:underline;text-underline-offset:3px">${PAGE.e404.link}</span></div></div>`;
  return `<div style="display:flex;flex-direction:column;gap:8px">
    <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${pk.name.toUpperCase()} · ${dark ? 'DARK' : 'LIGHT'} · RADIUS ${pk.r} · ${pk.head.replace(/'/g, '').split(',')[0].toUpperCase()}</span>
    <div style="background:${t.bg};border-radius:${pk.r + 6}px;padding:36px 24px;box-sizing:border-box;width:640px;${dark ? `border:1px solid ${t.border};` : 'box-shadow:0 6px 22px rgba(28,27,26,.10);'}">
      <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:22px;border-bottom:1px solid ${t.border}">
        <div style="display:flex;align-items:center;gap:9px"><span style="width:22px;height:22px;border-radius:${Math.min(pk.r, 7)}px;background:${t.accent}"></span>
          <span style="font-family:${pk.head};font-size:15px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>
        <span style="font-size:13px;color:${t.muted};font-family:${pk.body}">Reporting · Interviews · Writers</span></div>
      <div style="height:34px"></div>${inner}</div></div>`;
}

/* ── the three pages, anatomised: what each may reach ─────────────────── */
function pageAnatomy() {
  const line = '#E7E2DB';
  const cell = (txt, kind) => {
    const col = kind === 'yes' ? '#3A3835' : kind === 'no' ? '#B0A79A' : '#6E6A64';
    const mark = kind === 'yes' ? '●' : kind === 'no' ? '○' : '◐';
    return `<span style="width:236px;flex-shrink:0;font-size:12.5px;line-height:1.55;color:${col};padding-right:14px;box-sizing:border-box"><span style="font-family:${MONO};font-size:10px;margin-right:7px">${mark}</span>${txt}</span>`;
  };
  const row = (label, a, b_, c) => `<div style="display:flex;align-items:flex-start;padding:11px 0;border-top:1px solid ${line}">
    <span style="width:262px;flex-shrink:0;font-size:12.5px;font-weight:600;color:#1C1B1A;padding-right:14px;box-sizing:border-box">${label}</span>${a}${b_}${c}</div>`;
  const head = `<div style="display:flex;padding-bottom:9px">
    <span style="width:262px;flex-shrink:0"></span>
    ${['404 · error.hbs', '500 · error.hbs', 'GATE · private.hbs'].map(h =>
      `<span style="width:236px;flex-shrink:0;font-family:${MONO};font-size:10px;letter-spacing:.05em;color:#6E6A64">${h}</span>`).join('')}</div>`;
  return `<div style="width:1288px;background:#FFFFFF;border:1px solid ${line};border-radius:12px;padding:22px;box-sizing:border-box;display:flex;flex-direction:column">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.05em;color:#6E6A64;padding-bottom:12px">WHAT EACH OF THE THREE PAGES MAY REACH · ● DRAWN · ◐ AVAILABLE, REFUSED BY THE CATEGORY · ○ NOT AVAILABLE</span>
    ${head}
    ${row('The site title', cell('Lockup: mark and wordmark', 'yes'), cell('Wordmark as plain text ⚑', 'yes'), cell('Lockup: mark and wordmark', 'yes'))}
    ${row('Navigation', cell('Full header nav and footer', 'yes'), cell('None ⚑ — navigation is data', 'no'), cell('None ⚑ — refused, not unavailable', 'mid'))}
    ${row('Search', cell('A23’s field, a real GET form', 'yes'), cell('None ⚑ — the index is a request', 'no'), cell('None ⚑ — refused', 'mid'))}
    ${row(`Posts · ${code(hb('#get "posts"'))}`, cell('8 Elsewhere draws five rows', 'yes'), cell('No query at all ⚑', 'no'), cell('Refused ⚑ — titles are the thing withheld', 'mid'))}
    ${row('The member state', cell('A1’s header pill, if signed in', 'yes'), cell('None ⚑', 'no'), cell('None — the gate precedes membership ⚑', 'no'))}
    ${row('An image from settings', cell('7 Cover draws an authored file', 'yes'), cell('None ⚑ — a file URL is a settings value', 'no'), cell('An authored file, drawn', 'yes'))}
    ${row('The status code', cell('404, from Ghost', 'yes'), cell('500, from Ghost', 'yes'), cell('None — there is no code at /private/ ⚑', 'no'))}
    ${row('A form', cell('Search only', 'yes'), cell('None', 'no'), cell('The password POST — the page’s point', 'yes'))}
    ${row('The footer', cell('A3·1, drawn', 'yes'), cell('None ⚑', 'no'), cell('None ⚑', 'no'))}
    <div style="height:14px"></div>
    <span style="font-size:12.5px;line-height:1.65;color:#3A3835">${b('The middle column is the category’s discipline and the right column is its manners')} ⚑. A 500 may be the data layer failing, so ${b('every query on it is a second chance to fail')} — it draws static text, the site title and one link to ${code('/')}. The gate ${b('could')} draw nav, search and titles and ${b('refuses to')}: a visitor at ${code('/private/')} has not been admitted, and each of those describes the site to someone standing outside it.</span></div>`;
}

/* ── the stress frame · the worst realistic content, on 1 Centred ─────── */
function stressFrame() {
  const t = L, g = K.ground(t, 'page');
  const mono = txt => `<span style="font-family:${MONO};font-size:10px;color:#B0A79A">${txt}</span>`;
  const inner = `<div style="width:100%;display:flex;flex-direction:column;align-items:center;text-align:center;max-width:720px;margin:0 auto">
    ${K.codeChip(g, '429 · Too many requests')}${gap(8)}
    ${mono('A CODE THAT IS NEITHER 404 NOR 500 ⚑ · THE CHIP TAKES GHOST’S STATUS AND MESSAGE VERBATIM AND THE COPY SET FALLS BACK TO THE 500’S')}
    ${gap(16)}
    <h1 style="margin:0;font-family:${PK.head};font-size:40px;font-weight:700;line-height:1.12;letter-spacing:-0.03em;color:${g.text};max-width:720px;text-wrap:pretty">The page you asked for is not here, and the section of the site it used to live in has been retired</h1>
    ${gap(8)}${mono('A 106-CHARACTER HEADING · IT WRAPS TO THREE LINES AND NOTHING IS TRUNCATED ⚑ · 10 DISPLAY WOULD KEEP ITS NUMERAL AND WRAP THE SAME WAY')}
    ${gap(16)}
    <p style="margin:0;font-size:17px;line-height:1.6;color:${g.muted};font-family:${PK.body};max-width:560px">Something went wrong at our end.</p>
    ${gap(8)}${mono('A ONE-LINE SENTENCE UNDER A THREE-LINE HEADING · THE STACK DOES NOT RE-BALANCE ⚑')}
    ${gap(24)}
    <div style="width:520px">${K.searchField(g, { w:520, state:'empty', ph:'Search 412 essays and interviews', pack:PK })}</div>
    ${gap(22)}
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center">
      ${K.btn(g, { label:'Return to the Orbit Weekly home…', pack:PK, h:46, px:22 })}
      <span style="font-size:14px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-underline-offset:3px">Browse the archive</span></div>
    ${gap(8)}${mono('A 41-CHARACTER BUTTON LABEL · CLIPPED AT 30 WITH AN ELLIPSIS, WHOLE STRING KEPT IN THE DOM ⚑ (A18·3) · IT NEVER WRAPS TO TWO LINES')}
    ${gap(26)}<div style="width:620px;height:1px;background:${g.border}"></div>${gap(20)}
    <div style="display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;max-width:620px">
      ${['The archive index, by year and by section', 'This week’s issue', 'Corrections and clarifications, 2019 to date', 'Write to the desk', 'Jobs', 'Our approach to funding'].map(l =>
        `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:15px;font-weight:500;color:${g.text};font-family:${PK.body};text-decoration:underline;text-underline-offset:3px">${l}</span>`).join('')}</div>
    ${gap(8)}${mono('SIX AUTHORED LINKS, TWO OF THEM LONG · THE ROW WRAPS TO THREE LINES AND STAYS CENTRED ⚑ · 4 BOXED WOULD RULE THEM AND DROP THE URLS AT 390')}</div>`;
  return K.frame(L, 1440, inner, { kind:'e404', searchOn:true, h:'auto', top:true,
    extra:'STRESS · THE WORST REALISTIC CONTENT A31 WILL MEET' });
}

function stressTiles() {
  return K.tiles([
    K.textTile('THE SIX HARD CASES, AND WHAT THE CATEGORY DOES', [
      `${b('A status code that is neither 404 nor 500.')} 429, 403, 502 — Ghost hands the template whatever happened. ${b('The chip draws Ghost’s code and message verbatim and the copy set falls back to the 500’s')} ⚑, because “something went wrong at our end” is true of all of them and “we can’t find that page” is not.`,
      `${b('A 106-character heading.')} It wraps and is never clipped, in all ten ⚑ — including 10 Display, where the numeral holds its column and the heading wraps in the other. ${b('The only clipped string in A31 is a button label')}, at 30 characters, A18·3’s rule.`,
      `${b('Six authored links, two of them a full line long.')} The row wraps to three lines; 4 Boxed rules them and drops the URLs below 767; 5 Panel’s column takes them without stacking. ${b('None of the ten truncates a link label')} ⚑ — a shortened destination is a wrong destination.`,
      `${b('A site with no navigation at all.')} New publications have none. ${b('9 Directory hands off to 1 Centred')} ⚑; every other design is unaffected, because the header’s nav is A1’s and its absence is A1’s problem.`,
      `${b('A publication with no authored links, no image and no search enabled.')} ${b('Every design still renders a heading, a sentence and one button')} ⚑ — that is the floor, and it is why the heading has a default in all three copy sets.`,
      `${b('A visitor who mistypes the password four times.')} ${b('Nothing in the theme counts attempts')} ⚑ — there is no module for it and no data to read. Each attempt is a fresh render of the same page with Ghost’s message; ${b('rate limiting is Ghost’s and is invisible to the theme')}.`
    ]),
    K.textTile('REFUSED CATEGORY-WIDE · EACH WITH ITS REASON', [
      `${b('A drawn illustration')} ⚑ — the obvious 404 idiom, and it cannot survive the library’s first rule: ${b('an illustration is not re-skinnable by tokens')} and the user cannot author one. ${b('7 Cover’s photograph is the tokenisable answer')} — an authored file under a derived scrim.`,
      `${b('A soft 404 that renders the archive below the message')} ⚑ — a page that looks like it worked. It also cannot exist on a 500, ${b('and a design that can only draw one of the three pages is not a design in this category')}.`,
      `${b('An automatic redirect after a few seconds')} ⚑ — it needs a module the registry does not have, and it takes the decision away from a reader who may want to read the URL they mistyped.`,
      `${b('“Did you mean …?” from the URL')} ⚑ — Ghost offers no fuzzy match, so the suggestion would be invented. ${b('The search field is the honest version')} of the same intent.`,
      `${b('Search-as-you-type on the 404')} ⚑ — the index is a network request, and A23 owns live search. Here the field is a real GET form and ${b('the results page is A23’s')}.`,
      `${b('A member greeting on the gate')} ⚑ (the visitor is not signed in and cannot be) · ${b('a themed 503 or maintenance page')} ⚑ (Ghost’s is not themable, so a design would never render) · ${b('red as an error colour')} ⚑ (no pack has an error token) · ${b('a countdown, a retry timer or an attempt counter')} ⚑ (no data, no module) · ${b('a per-item control of any kind')} ⚑.`
    ])
  ]);
}

function gateStatesFrame() {
  const t = L, g = K.ground(t, 'page');
  const one = (label, st) => tile({ w:440, bg:'#FFFFFF', border:'#EBE5DB', pad:16, label,
    body:`<div style="min-height:210px">${K.block(t, g, 834, { kind:'gate', measure:360, codeStyle:'chip',
      formState:st, formW:340, formMono:false })}</div>` });
  return K.tiles([
    one('EMPTY · WHAT ALMOST EVERY VISITOR SEES', 'empty'),
    one('FOCUSED · 1.5 PX ACCENT BORDER, CARET, NO SHADOW', 'focus'),
    one('WRONG PASSWORD · GHOST’S STRING, ABOVE THE LABEL ⚑', 'error')
  ]);
}

function build() {
  let out = K.DOC_HEAD;
  out += K.intro({
    rail:'A31 ERROR AND UTILITY · CATEGORY PROOF · 10 DESIGNS · PAPER PACK · DRAWN 24 AUGUST 2026',
    title:'A31 Error and Utility — the category',
    paras:[
      'Ten designs for three pages: the 404, the 500 and the private-site gate. Each design draws all three from one field list, so a publication picks an arrangement once and gets a coherent set — which is the only way a category of whole pages can behave like a category of sections.',
      'The fact to read first is what each page is allowed to touch. <strong style="font-weight:600">The 404 may query Ghost freely, the 500 may query nothing at all, and the gate may query nothing the visitor is not yet entitled to see.</strong> Two of the ten designs cannot draw all three pages and hand off to a design that can, saying so on the frame.',
      'This frame carries what belongs to the category rather than to any one design: the four questions §8 asked, the three pages anatomised, the tokenisation proof, the stress frame, the roster with its ten structural descriptors, the shared field list, the item rules for the one authored repeater, the component inventory and the findings for the architect. ' +
      'The per-design frames are <a href="./A31-1 Centred.dc.html">A31-1</a> … <a href="./A31-10 Display.dc.html">A31-10</a>, and the written specification is <code style="font-family:\'JetBrains Mono\',monospace;font-size:14px">A31 Error and Utility - Spec.md</code>.'
    ]
  });

  out += section('A31 settlements', cap('THE FOUR QUESTIONS §8 ASKED, ANSWERED') + K.tiles([
    K.textTile('1 · 404, 500 AND THE GATE — AND WHAT NAVIGATION EACH KEEPS', [
      `${b('The 404 keeps everything')} ⚑ — header, nav, search, footer, and the member pill if the reader is signed in. ${b('A 404 is a page of a working site')}: the request failed, the site did not, and stripping its chrome would tell the reader otherwise.`,
      `${b('The 500 keeps the site title as text and one link to ')}${code('/')} ⚑. Nothing else. ${b('Navigation is data')}, the footer is navigation, search is a request, the member state is a query — and on a 500 the data layer is the suspect. ${b('The wordmark is drawn as text rather than as ')}${code('@site.logo')} ⚑, because a logo is a file URL from settings.`,
      `${b('The gate keeps the lockup and nothing else')} ⚑ — no nav, no search, no post titles, no footer. Ghost would give it all of them; ${b('the category refuses them')}, because each describes the site to a visitor who has not been admitted to it. ${b('The one optional line is the site description')}, which Ghost’s own private page shows.`
    ]),
    K.textTile('2 · THE GATE’S FORM STATES', [
      `${b('Four states, one geometry')}: empty, focused, filled, wrong password. ${b('Empty is the state to design for')} — almost every visitor sees only that one.`,
      `${b('Wrong password is a fresh server render, not an inline check')} ⚑. Ghost re-renders ${code('private.hbs')} with its own error string; ${b('the field comes back empty')} (Ghost does not echo a password) and ${b('focus returns to it')}. The message sits ${b('above the label')} so it is met before the input in reading order and in focus order.`,
      `${b('There is no themed submitting state')} ⚑. The form is a native POST to ${code('/private/?r=')}, so the browser owns the wait: the button keeps its resting look and the page navigates. ${b('A spinner would need a module the registry does not have')} — the closest is ${code('member-form')}, which posts to the members endpoint and is the wrong one. ${b('That is a finding, not a new module')}.`,
      `${b('The message is Ghost’s string and never a field')} ⚑, and it is drawn in the text colour on the plate under a hairline — ${b('never in red')}: no pack has an error token, and inventing one would fail in the other eleven.`
    ]),
    K.textTile('3 · WHETHER SEARCH APPEARS ON A 404', [
      `${b('Yes, on the 404, and on by default')} ⚑. A reader who has hit a 404 typed or followed something wrong; ${b('a field is the fastest way out')}, faster than any list a design can draw.`,
      `${b('It is A23’s field, verbatim')} — 52 px, the ⌕ glyph, the same placeholder — over ${b('a real ')}${code(hb('form action="/search/" method="get"'))} ⚑, so it works with JavaScript off. ${b('It searches what A23’s index carries')}: title, excerpt and slug. ${b('Body text is not indexed')} ⚑, which is A23’s finding and is repeated here because a reader on a 404 is exactly the person who will search for a phrase from the middle of an article.`,
      `${b('Never on a 500')} ⚑ — the index is a request to the site that is failing. ${b('Never on the gate')} ⚑ — searching a site one has not been admitted to. ${b('Every design offers the Show / Hide row and none of them offers it on the other two pages')}.`
    ]),
    K.textTile('4 · WHAT A 500 CAN RELY ON RENDERING', [
      `${b('Its own words, the site title as text, and one link to ')}${code('/')} ⚑. That is the whole list. ${b('No ')}${code(hb('#get'))}, no navigation, no member state, no settings image, no search, no footer — ${b('because a 500 may be the data layer failing, and every query is a second chance to fail')}.`,
      `${b('The ceiling is lower still')} ⚑: if the theme itself is what failed, Ghost serves its own built-in error page and ${b('nothing designed here renders at all')}. A31 cannot design that page and does not pretend to. ${b('What it can do is make the theme’s own 500 depend on nothing')}.`,
      `${b('Three designs cannot draw a 500 as themselves')} ⚑ — 7 Cover (a file is a settings value), 8 Elsewhere (its rows are a query), 9 Directory (its items are navigation) — ${b('and all three hand off to 1 Centred with the 500’s copy set')} and annotate it. A1·11 and A29·5’s hand-off rule, carried.`
    ])
  ]));

  out += section('A31 the three pages', cap('THE THREE PAGES, ANATOMISED · THE CATEGORY’S ONE UNAVOIDABLE FACT') + pageAnatomy());

  out += section('A31 gate states', cap('THE GATE’S FORM · EMPTY, FOCUSED, WRONG PASSWORD · DRAWN ON 1 CENTRED · §8·2') +
    gateStatesFrame() +
    note(`${b('The three states differ by one border, one caret and one plate')} ⚑. ${b('Ghost does not echo a submitted password')}, so the wrong-password render comes back with an empty field — which is why the message has to carry the whole explanation and why it sits above the label. ${b('There is no fourth state to draw')}: a correct password is a redirect to the page the visitor asked for, and the gate is gone.`));

  const cells = [];
  ['paper', 'studio', 'garden'].forEach(k => { cells.push(proofCell(PACKS[k], false)); cells.push(proofCell(PACKS[k], true)); });
  out += section('A31 pack proof', cap('THE TOKENISATION PROOF · 1 CENTRED IN THREE PACKS, LIGHT AND DARK · ONE FUNCTION, SIX TOKEN OBJECTS') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${cells.join('')}</div>` +
    note(`${b('Nothing moved.')} Six frames, one function, six token objects: ground, surface, text, muted, border, accent, a radius and a font pair. ${b('The status chip is the piece that proves it')} ⚑ — it is a hairline and a radius and nothing else, so at Studio’s radius 2 it is a rectangle and at Garden’s 20 a lozenge, and ${b('neither needed a nudge')}. ${b('The search field, the button and the chip all read the same radius token')}: three shapes, one number. ${b('The accent appears exactly once per frame')} — the button — and re-checks in all six: Studio’s blue 4.6:1, Garden’s green 4.8:1, Paper’s ${code('#D96C3F')} 4.4:1 on the page ground ⚑, which is why the label is 15 px and 600 rather than 14. ${b('Nothing in A31 hard-codes a colour, and the two designs on a contrast ground derive every value from the band’s carried ink')} ⚑.`));

  out += section('A31 stress', cap('THE STRESS FRAME · THE WORST REALISTIC CONTENT THIS CATEGORY WILL MEET · DRAWN ON 1 CENTRED') +
    stressFrame() +
    note(`${b('A 429 where the design expects a 404, a 106-character heading over a one-line sentence, a 41-character button label, and six authored links two of which are a full line long')} ⚑ — every one of them a thing a real publication has. ${b('The heading wraps and is never clipped')}; ${b('the button clips at 30 characters and keeps the whole string in the DOM')} ⚑ (A18·3), because a two-line button stops being a button. ${b('The stack does not re-balance when the sentence is shorter than the heading')} ⚑ — an error page that re-composes itself around content length is an error page that looks different every time it is seen.`) +
    stressTiles());

  const roster = [
    ['1', 'Centred', 'stack · none · page · none · none · the centred column', '6', 'core', '—'],
    ['2', 'Split Reason', 'split · none · page · none · none · the reason beside the action', '6', 'core', '—'],
    ['3', 'Card', 'stack · card · page · none · none · a raised card on the page ground', '6', 'core', '—'],
    ['4', 'Boxed', 'stack · box · page · none · none · one hairline box in the measure', '5', 'core', '—'],
    ['5', 'Panel', 'stack · none · surface · none · none · one raised plane across the box', '6', 'core', '—'],
    ['6', 'Contrast Band', 'stack · none · contrast · none · none · an inverted full-bleed band', '6', 'core', '—'],
    ['7', 'Cover', 'stack · none · image · none · background · the block over a photograph', '6', 'core', '500 → 1 · no image → 6'],
    ['8', 'Elsewhere', 'feed · none · page · many · none · recent posts under the message', '6', 'core', '500 → 1 · gate → 1'],
    ['9', 'Directory', 'nav · none · page · many · none · the site’s own navigation as the page', '6', 'core', '500 → 1 · gate → 1 · no nav → 1'],
    ['10', 'Display', 'split · none · contrast · none · none · the code at display size', '6', 'core', '—']
  ].map(r => [r[0], r[1], `<code style="font-family:${MONO};font-size:11.5px">${r[2]}</code>`, r[3], r[4], r[5]]);
  out += section('A31 roster', cap('THE ROSTER · TEN DESIGNS, TEN STRUCTURAL DESCRIPTORS') +
    table({ cols:['#', 'DESIGN', 'TUPLE', 'CTL', 'MODULES', 'HAND-OFFS'], widths:[32, 132, 636, 40, 120, 260], rows:roster }) +
    K.tiles([
      K.textTile('TUPLE UNIQUENESS · THE HONEST STATEMENT', [
        `${b('All ten are distinct on the five closed slots')} ⚑, and ${b('three slots do the work')}. ${b('Containment separates 1, 3 and 4')} — ${code('none')}, ${code('card')}, ${code('box')} — ${b('ground separates 1, 5, 6 and 7')} — ${code('page')}, ${code('surface')}, ${code('contrast')}, ${code('image')} — and ${b('archetype separates 1, 2, 8 and 9')} — ${code('stack')}, ${code('split')}, ${code('feed')}, ${code('nav')}.`,
        `${b('10 Display is the only one that needs two slots')} ⚑: ${code('split')} against 6 Contrast Band, ${code('contrast')} against 2 Split Reason. ${b('Item-count separates nothing on its own here')} — 8 and 9 are both ${code('many')} and are separated by archetype; ${b('media placement separates 7 alone')}, at ${code('background')}.`,
        `${b('Containment is ')}${code('none')}${b(' in eight of ten')} ⚑. The recovery links, the post rows and the nav items are all ${b('the items’ own geometry or no geometry at all')}, never the section’s — the slot this project gets wrong most often, and the reason 4 Boxed’s ${code('box')} is a real claim rather than a description of its rows.`
      ]),
      K.textTile('WHAT THE CHECK CANNOT PROMISE', [
        `${b('3 Card and 4 Boxed are one design in two containments')} ⚑ — a fill and a shadow apart. Visible at rest, thin written down, ${b('and 4 spends its saved control on the ruled-row list')} to earn the distance.`,
        `${b('8 Elsewhere and 9 Directory reach the same first five slots but for archetype')}, and what actually distinguishes them is ${b('the source of their items')} — posts against navigation — which no machine reads from a tuple ⚑.`,
        `${b('1 Centred and 3 Card differ on one slot and on nothing else a machine can see')}; ${b('what separates them in practice is whether the page has an object on it')}. ${b('Each design’s panel names the designs it is closest to, by number')}, and says which control value would take it there ⚑. That is the honest version of a uniqueness claim.`
      ])
    ]));

  const F = [
    ['<em>the copy set, ×3</em>', '—', '—', '—', 'all 10', '<strong style="font-weight:600">The six fields below exist once per page</strong> ⚑ — 404, 500, gate — so a publication writes three sets and switching designs never loses one'],
    ['code', 'text', 'opt', '4 ch', 'all 10', '<strong style="font-weight:600">Ghost’s status code overwrites it on the error pages</strong> ⚑; the field exists for the gate, where there is none'],
    ['eyebrow', 'text', 'opt', '24 ch', 'all 10', 'Defaults “Not found” · “Our end” · “Private” ⚑. Drawn inside the chip, or alone at Code = Eyebrow'],
    ['heading', 'text', '<strong style="font-weight:600">has a default</strong>', '60 ch advisory', 'all 10', '<strong style="font-weight:600">Never clipped in any design</strong> ⚑ — it wraps. The one field with a default in all three sets'],
    ['blurb', 'text', 'opt', '240 ch', 'all 10', 'One sentence. The stack closes up without it and reserves nothing ⚑'],
    ['primaryLabel · primaryUrl', 'text · url', 'opt', '30 ch', 'all 10', 'Defaults “Go to the home page” → <code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">/</code>. <strong style="font-weight:600">Forced to <code>/</code> on the 500</strong> ⚑. Clipped at 30, whole string in the DOM'],
    ['secondaryLabel · secondaryUrl', 'text · url', 'opt', '30 ch', 'all 10', 'A text link, never a second button ⚑. <strong style="font-weight:600">On the 500 it is an authored mailto</strong>, never generated ⚑'],
    ['links[]', 'list 0–6', 'opt', 'label 40 ch · url', '1, 2, 3, 4, 5, 6, 7, 10', '<strong style="font-weight:600">The category’s only authored repeater</strong> ⚑. <strong style="font-weight:600">Dropped on the 500 and absent on the gate</strong> ⚑; 8 and 9 store it and draw their own list instead'],
    ['linksLabel', 'text', 'opt', '24 ch', 'as links[]', 'Default “Try one of these”. <strong style="font-weight:600">The accessible name of 5 Panel’s nav landmark</strong> ⚑'],
    ['searchPlaceholder', 'text', 'opt', '60 ch', 'all 10, 404 only', 'Default “Search 412 essays and interviews” — A23’s, with A23’s count ⚑'],
    ['image · imageAlt · imageFocus', 'image · text · enum', '<strong style="font-weight:600">req in 7</strong>', '≥ 2,400 px · 120 ch · 9 positions', '7', '<strong style="font-weight:600">No image → 7 renders 6 Contrast Band</strong> ⚑. Focus is a field, not a control ⚑. <strong style="font-weight:600">Not drawn on the 500 at all</strong>'],
    ['postsLabel', 'text', 'opt', '24 ch', '8', 'Default “Recently on Orbit Weekly”. Stored by the other nine ⚑'],
    ['directoryLabel', 'text', 'opt', '24 ch', '9', 'Default “Everything the site does have”. The nav landmark’s accessible name ⚑'],
    ['gateDisplayWord', 'text', 'opt', '16 ch', '10', 'Default “Private” ⚑ — <strong style="font-weight:600">invented</strong>: there is no status code at <code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">/private/</code>'],
    ['<em>statusCode · message</em>', 'Ghost', 'req', '—', 'all 10', '<strong style="font-weight:600">The chip’s text on the error pages</strong>; a code that is neither 404 nor 500 falls back to the 500’s copy set ⚑. <strong style="font-weight:600">Variable names to be verified</strong> ⚑'],
    ['<em>@site.title · @site.description</em>', 'Ghost', 'req', '—', 'all 10', 'The wordmark, drawn <strong style="font-weight:600">as text on the 500</strong> ⚑. The description is the gate’s one optional line'],
    ['<em>navigation</em>', 'Ghost', 'opt', '—', '9 · the header in all 10 on the 404', '<strong style="font-weight:600">Label and URL only</strong> ⚑ — no counts, no descriptions. <strong style="font-weight:600">Never queried on the 500 or the gate</strong> ⚑'],
    ['<em>posts</em>', 'Ghost', 'opt', '—', '8', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">#get "posts" limit=5</code>, <strong style="font-weight:600">on the 404 only</strong> ⚑. 0 posts → the list is absent, not empty'],
    ['<em>{&#8203;{error}&#8203;}</em>', 'Ghost', 'opt', '—', 'all 10, gate only', '<strong style="font-weight:600">The wrong-password string, and it is Ghost’s</strong> ⚑ — not a field, and no control changes its words']
  ];
  out += section('A31 fields', cap('THE SHARED FIELD LIST · THE CONTRACT THAT MAKES DESIGN-SWITCHING SAFE') +
    table({ cols:['FIELD', 'TYPE', 'REQ', 'LIMIT', 'USED BY', 'NOTES'], widths:[236, 124, 96, 168, 176, 452], rows:F }) +
    note(`${b('Ten authored field groups — the first six multiplied by three pages — one authored list, and six things read from Ghost.')} ${b('A design may draw as few as five')}: 10 Display is a code, a heading, a sentence, a button and a link. ${b('None needs a field the category does not have')}, so switching between any two of the ten preserves everything the publication typed. ${b('Four fields are drawn by exactly one design each')} — the image group (7), ${code('postsLabel')} (8), ${code('directoryLabel')} (9), ${code('gateDisplayWord')} (10) — ${b('and all four are stored by the other nine')} ⚑. ${b('The copy set is the field that makes the category work')}: because all three pages’ words are stored at once, a publication that turns privacy on for a week does not have to write the gate from scratch and then lose it ⚑.`));

  out += section('A31 items', cap('THE ONE AUTHORED REPEATER · links[] · WHAT THE SIDEBAR DOES WITH IT') + K.tiles([
    K.textTile('THE ITEM LIST · ADD, REMOVE, REORDER', [
      `${b('One authored repeater in the whole category')} ⚑: ${code('links[]')}, the recovery list, drawn by eight of the ten. ${b('8 Elsewhere’s post rows and 9 Directory’s nav items are Ghost’s objects')} — queried, not authored — ${b('and neither gets an Add, a Remove or a reorder in the sidebar')} ⚑. Posts are edited in Ghost; navigation is edited in Ghost’s own navigation settings.`,
      `${b('Add an item')} sits at the foot of the list in the sidebar — “+ Add a link”. ${b('A new item arrives with content, never as an empty shell')} ⚑: label “The archive index”, URL ${code('/archive/')}. ${b('It lands last')}, because the list is a reading order and a new item’s place is the author’s decision, not the panel’s.`,
      `${b('Remove')} is a row action on the item. ${b('Removing the last one is allowed')} ⚑ — the minimum is zero — and at zero ${b('the list, its label and its hairline all leave together')} and the design closes up. Nothing reserves the space, and no design shows a placeholder row.`,
      `${b('Reorder is a drag on the sidebar rows, and order is meaningful')} ⚑ — first is the destination the publication most wants a lost reader to take. ${b('4 Boxed’s ruled rows and 5 Panel’s column read top to bottom')}; ${b('1, 3, 6, 7 and 10’s wrapping rows read left to right, then down')}.`
    ]),
    K.textTile('COUNTS, FIELDS AND WHAT AN EMPTY FIELD LOOKS LIKE', [
      `${b('Minimum 0, maximum 6, designed for 2–4')} ⚑. ${b('At 1')} the row does not stretch to fill the measure. ${b('At 5–6')} the wrapping rows go to two or three lines and 5 Panel’s column simply gets taller. ${b('Above 6 the sidebar’s Add is disabled with the reason shown')} — a recovery list longer than six is a navigation menu, and ${b('that is 9 Directory')}.`,
      `${b('Inside an item the user edits content only')} ⚑ — ${b('the label and the URL, and nothing else')}. No per-item size, weight, colour, order-number or emphasis. Selecting a link on the canvas opens those two fields and closes.`,
      `${b('The label is required and the URL is required')} ⚑ — a link with no destination is not a link — but ${b('4 Boxed draws the URL as text and the others do not')}, so a long URL is only visible in one design, and there it is dropped below 767.`,
      `${b('Design controls apply to every item at once')} ⚑. “Make the third link bigger” is not expressible, by construction: a control writes one value onto the section and the stylesheet reads it. ${b('A list where one item needs to be louder is a list with a first item')}, and the fix is order.`
    ])
  ]));

  const CI = [
    ['Utility page frame', 'A page whose block is optically centred between header and footer at ≥ 768 and top-aligned at 64 below it; <code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">min-height: 100svh</code> minus the chrome', '<strong style="font-weight:600">A31</strong> (1)'],
    ['Status code chip', 'Mono 11.5 px, tracked, in a hairline pill at the pack radius — “404 · Not found”, from Ghost’s own status and message', '<strong style="font-weight:600">A31</strong> (1)'],
    ['Display code', 'A tabular numeral at 156 px in the heading font, <code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">aria-hidden</code>, holding a column of a split', '<strong style="font-weight:600">A31</strong> (10)'],
    ['Password field, 46 px', 'A16’s field geometry with an 8-dot value at .18em tracking; label above, 1.5 px focus border', '<strong style="font-weight:600">A31</strong> (1) · A16 · A30'],
    ['Server error plate', 'Ghost’s own message in the text colour on the plate under a 1.5 px hairline, above the label — never red, never a token that does not exist', '<strong style="font-weight:600">A31</strong> (1)'],
    ['Recovery link list', 'An authored list drawn three ways: a wrapping row of underlined links, an arrowed list, or ruled rows with the URL in mono', '<strong style="font-weight:600">A31</strong> (1, 4, 5)'],
    ['Directory list', 'Ghost’s navigation at page scale — 56 px rows, heading font at 19, one hairline each, an aria-hidden arrow', '<strong style="font-weight:600">A31</strong> (9)'],
    ['Hand-off annotation', 'A mono line naming the design that renders instead, and why — drawn on the frame, never shipped in the page', '<strong style="font-weight:600">A31</strong> (7, 8, 9)'],
    ['Page boundary strip', 'The mono line on every frame naming the template, what the page may query and what navigation it keeps', '<strong style="font-weight:600">A31</strong> (0)'],
    ['Search field, 52 px', 'The ⌕ glyph, one line, a clear affordance when filled; here over a real GET form', 'A4 (15) · A23'],
    ['Result row', 'Title at 21 in the heading font, one excerpt line, meta at 13, one hairline, the whole row one link', 'A18 (2) · A23'],
    ['Primary button', 'Accent fill, 15 px/600, the pack radius, 46 px on these pages', 'A1 (1)'],
    ['Outline / ghost action', 'Hairline border, text label, 38 px in a row and 46 px in a form', 'A1 (1)'],
    ['Logo lockup', '24 px accent rounded-square mark and the wordmark on a 10 px gap', 'A1 (1)'],
    ['Nav drawer', 'The header’s ≤ 767 drawer — A1’s, still declared by the header on the 404 and absent from the other two pages', 'A1 (2)'],
    ['Focus ring', '2 px accent at a 4 px offset; the carried colour on a contrast or image ground', 'A6 · A17 (18)'],
    ['Surface plane', 'Pack radius + 4, one hairline, md warm shadow at Raised, forced Flat in dark', 'A19 (3) · A29 (4)'],
    ['Warm scrim', 'A flat wash of the pack’s text colour at 30 / 45 / 60 %, never black and never a gradient', 'A20 (13)'],
    ['On-contrast derivation', 'muted 72 % · hairline 20 % · plate 8 % of the band’s carried colour', 'A17 (7)'],
    ['Content box and padding ladder', '1,296 on 72 · 754 on 40 · 350 on 20; 96 · 80 · 64 vertical', 'A17'],
    ['Clipped-string rule', 'Clip visually, keep the whole string in the DOM', 'A18 (3)'],
    ['Hand-off rule', 'A design that cannot exist without a precondition renders another, and says which', 'A1 (11, 15) · A29 (5)'],
    ['Image placeholder plate', 'Striped 45° fill at the pack radius with a mono caption naming the crop', 'A1'],
    ['Minimal line footer', 'One hairline, copyright left, three links right — drawn on the 404 and on neither of the others', 'A3 (1)']
  ];
  out += section('A31 components', cap('COMPONENT INVENTORY · CUMULATIVE · NINE NEW, FIFTEEN CARRIED FORWARD') +
    table({ cols:['COMPONENT', 'WHAT IT IS', 'FIRST FROM'], widths:[236, 814, 200], rows:CI }));

  const FI = [
    [`${b('The error-context variable names must be verified before build')} ⚑. A31 draws Ghost’s status and message in the chip and assumes ${code(hb('statusCode'))} and ${code(hb('message'))} are available to ${code('error.hbs')}. ${b('Whether the build ships one ')}${code('error.hbs')}${b(' with a match on the code, or a separate ')}${code('error-404.hbs')}${b(', is the build’s call')} — the designs are identical either way, and ${b('the copy set is what differs')}.`,
     `${b('Whether an error template may run ')}${code(hb('#get'))}${b(' at all is the category’s largest open question')} ⚑. ${b('8 Elsewhere and 9 Directory query on the 404 and refuse to on the 500')}, which is the honest split — but under load an error page that queries is an error page that can fail. ${b('If the answer is no, both designs hand off on all three pages')} and A31 loses two of ten. That is a decision for the architect, not a defect in the designs.`,
     `${b('The ')}${code('/search/')}${b(' route the 404’s field posts to is A23’s assumption, inherited')} ⚑. If a publication’s ${code('routes.yaml')} has no search collection, ${b('the no-JS path returns a 404 from a 404')} — which is the worst outcome in this category. ${b('A31 asks that the field be rendered only when the route exists')}, and that is a build condition rather than a control.`,
     `${b('What ')}${code('private.hbs')}${b(' actually receives needs confirming')} ⚑ — the error string certainly, ${code('@site.title')} and ${code('@site.description')} almost certainly, ${b('and whether the ')}${code('?r=')}${b(' redirect parameter is required for the visitor to land where they were going')}. ${b('Every design assumes it is')}, and if it is not the gate still works and simply lands on the home page.`],
    [`${b('A themed submitting state on the gate would need a module the registry does not have')} ⚑. The closest is ${code('member-form')}, which posts to Ghost’s members endpoint — the wrong endpoint. ${b('No design in A31 requires it')}: the native POST is the whole behaviour, and ${b('this is a finding rather than a request for a thirty-second module')}.`,
     `${b('Ghost’s maintenance and 503 pages are not themable')} ⚑, so A31 does not cover them and no design should be asked to. ${b('A publication that wants a designed maintenance page is asking for something the platform does not offer')}, and saying so now is cheaper than drawing an eleventh design that never renders.`,
     `${b('Whether ')}${code('@member')}${b(' is available to ')}${code('error.hbs')}${b(' decides one detail of the 404’s header')} ⚑ — the signed-in pill A1 draws. ${b('If it is not, the 404’s header shows the signed-out state to a signed-in member')}, which is a small wrong rather than a broken page. ${b('The 500 and the gate do not ask')}.`,
     `${b('A31 declares no behaviour module at all')} ⚑ — ${code('core')} in all ten, and the registry’s thirty-one are otherwise untouched. ${b('It is the first category in the library with nothing to degrade')}, which is what makes its no-JS statement a single line: ${b('every design is pixel-identical with JavaScript off')}. ${b('The header’s ')}${code('nav-drawer')}${b(' on the 404 belongs to A1')}, and is named here only so the omission does not look like an oversight.`]
  ];
  out += section('A31 findings', cap('FINDINGS FOR THE ARCHITECT · EIGHT, SEVEN OF THEM NEW') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${FI.map(col =>
      tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', body:`<div style="display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${col.map(x => `<span>${x}</span>`).join('')}</div>` })).join('')}</div>` +
    note(`${b('None of these is a request for a new behaviour module.')} A31 uses one of the registry’s thirty-one — ${code('core')} — and ${b('declares nothing in any of the ten designs')}. ${b('Where behaviour was wanted')} — a submitting state on the gate, a retry timer, an attempt counter, a live search — ${b('the category refused it and named the closest module')}, which is the process the brief asks for. ${b('The two findings that could change a design are the ')}${code(hb('#get'))}${b(' question and the ')}${code('/search/')}${b(' route')}; the rest are confirmations.`));

  out += K.DOC_TAIL;
  return out;
}

return { build, proofCell, pageAnatomy, stressFrame, stressTiles, gateStatesFrame };
})();
