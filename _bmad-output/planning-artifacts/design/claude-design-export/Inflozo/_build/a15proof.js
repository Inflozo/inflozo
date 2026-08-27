// A15-0 Category Proof builder.
globalThis.A15PROOF = (function () {
const K = globalThis.A15LIB, P = globalThis.A15PAGE;
const { b, code, cap, note, tile, textTile, tableCard, section, intro, wrapIf, specCards, MONO, VID, VIDEOS, PC } = K;

/* ---- the tokenisation proof: 1 Player in three packs, light and dark ---- */
function playerMini(pack, mode) {
  const p = K.PACKS[pack], t = mode === 'd' ? p.d : p.l;
  const g = K.ground(t, 'page', p);
  return `<div style="width:432px;background:${t.bg};border-radius:8px;padding:24px;box-sizing:border-box;display:flex;flex-direction:column;gap:18px;align-items:center">
    ${K.headBlock(g, 834, { align:'center', hSize:24, measure:340, max:380, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:false })}
    <div style="display:flex;flex-direction:column;gap:10px;align-items:center">${K.vframe(t, g, VIDEOS[0], { w:384, aspect:'16:9', playSize:56 })}${K.metaRow(g, VIDEOS[0], {})}</div></div>`;
}
function packProof() {
  const names = { paper:'PAPER · RADIUS 8 · GEORGIA + INTER', studio:'STUDIO · RADIUS 2 · BRICOLAGE + INTER', garden:'GARDEN · RADIUS 20 · BRICOLAGE + INTER' };
  const col = pack => `<div style="display:flex;flex-direction:column;gap:10px">
      <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${names[pack]}</span>${playerMini(pack, 'l')}
      <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${names[pack].split(' · ')[0]} · DARK</span>${playerMini(pack, 'd')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${['paper', 'studio', 'garden'].map(col).join('')}</div>`;
}

/* ---- the stress frame: 7 Grid at its worst realistic content ---- */
const STRESS = [
  { n:1, title:K.LONG_TITLE, dur:'1:48:22', prov:'YouTube', mode:'plate' },
  { n:2, title:'Night crossing to Trafaria', dur:'', prov:'Uploaded file', mode:'poster' },
  { n:3, title:'The flamingo count at Ponta da Erva', dur:'11:16', prov:'YouTube', mode:'dead' },
  { n:4, title:'A net, mended twice', dur:'09:44', prov:'Vimeo', mode:'portrait' },
  { n:5, title:'', dur:'06:30', prov:'Vimeo', mode:'poster' }
];
function stressCell(t, g, item, w) {
  const h = Math.round(w * 9 / 16);
  let inner;
  if (item.mode === 'plate') {
    inner = `<span style="display:block;position:relative;width:${w}px;height:${h}px;border-radius:${g.r}px;background:${g.stripe};overflow:hidden"><span style="position:absolute;top:9px;left:11px;font-family:${MONO};font-size:10px;color:${g.muted}">01 · NO POSTER UPLOADED · 16:9 BOX HELD ⚑</span><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${K.playBtn(t, { size:44 })}</span><span style="position:absolute;left:0;right:0;bottom:14px;text-align:center;font-size:13px;color:${g.muted};font-family:${g.pack.body};padding:0 14px;box-sizing:border-box">YouTube · a film with a very long name</span></span>`;
  } else if (item.mode === 'dead') {
    inner = `<span style="display:block;position:relative;width:${w}px;height:${h}px;border-radius:${g.r}px;background:${g.plane};border:1px solid ${g.border};box-sizing:border-box;overflow:hidden"><span style="position:absolute;top:9px;left:11px;font-family:${MONO};font-size:10px;color:${g.muted}">03 · DEAD URL · THE BOX IS KEPT ⚑</span><span style="position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);text-align:center;font-size:13px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">This film is no longer available at that address</span></span>`;
  } else if (item.mode === 'portrait') {
    const pw = Math.round(h * 9 / 16);
    inner = `<span style="display:flex;align-items:center;justify-content:center;position:relative;width:${w}px;height:${h}px;border-radius:${g.r}px;background:${g.plane};overflow:hidden;border:1px solid ${g.border};box-sizing:border-box"><span style="position:absolute;top:9px;left:11px;font-family:${MONO};font-size:10px;color:${g.muted};z-index:1">04 · 9:16 FILM LETTERBOXED IN THE 16:9 BOX ⚑</span><span style="display:block;position:relative;width:${pw}px;height:${h}px;background:${g.stripe}"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${K.playBtn(t, { size:44 })}</span></span></span>`;
  } else {
    inner = K.vframe(t, g, item, { w, aspect:'16:9', playSize:44, dur:item.dur ? true : false });
  }
  const meta = `<span style="display:flex;align-items:center;gap:8px;font-size:13px;color:${g.muted};font-family:${g.pack.body}">${item.dur || '—'}<span style="opacity:.5">·</span>${item.prov}</span>`;
  const title = item.title
    ? `<span style="font-size:17px;font-weight:600;line-height:1.3;color:${g.text};font-family:${g.pack.body};max-width:${w}px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${item.title}</span>`
    : `<span style="font-size:13px;color:${g.muted};font-family:${g.pack.body};font-style:italic">no title — the cell is its poster and meta ⚑</span>`;
  return `<figure style="margin:0;width:${w}px;display:flex;flex-direction:column;gap:12px">${inner}<div style="display:flex;flex-direction:column;gap:6px">${title}${meta}</div></figure>`;
}
function stressFrame(t, w) {
  const g = K.ground(t, 'page');
  const box = K.G(w).box, gp = 24, cw = Math.floor((box - gp * 2) / 3);
  const cells = STRESS.map(it => stressCell(t, g, it, cw)).join('');
  const inner = `<div style="display:flex;flex-direction:column;gap:40px">
    ${K.headBlock(g, w, { measure:560, eyebrowText:'Film, video, recordings and everything else we shot', headingText:'Everything we filmed on the estuary between September and July, including the material we could not use', blurbText:VID.blurb })}
    <div style="display:flex;flex-wrap:wrap;gap:36px ${gp}px;width:${box}px;align-items:flex-start">${cells}</div>
    ${K.creditEl(g, {})}</div>`;
  return P.stdWrap(t, w, inner, { padNote:'THE STRESS FRAME · PADDING UNCHANGED' });
}

/* ---- tables ---- */
const ROSTER = [
  ['1', 'Player', 'media frame · none · page · one · top · one film at the content width', '6', 'video-facade'],
  ['2', 'Split', 'split · none · page · one · right · a labelled play action beside the frame', '6', 'video-facade'],
  ['3', 'Panel', 'media frame · none · surface · one · top · the film on a raised plane', '6', 'video-facade'],
  ['4', 'Contrast Band', 'media frame · none · contrast · one · top · the film on an inverted band', '6', 'video-facade'],
  ['5', 'Full Bleed', 'media frame · none · transparent · one · full-bleed · no margin at any width', '6', 'video-facade'],
  ['6', 'Cover', 'overlay · none · image · one · background · the head on the poster', '6', 'video-facade'],
  ['7', 'Grid', 'grid-of-N · none · page · many · top · even posters in three columns', '6', 'video-facade'],
  ['8', 'Lead and Grid', 'grid-of-N · none · page · many · inline · one lead film above the row', '6', 'video-facade'],
  ['9', 'Carousel', 'carousel · none · page · many · inline · one film at a time', '6', 'carousel + video-facade ⚑'],
  ['10', 'Playlist', 'split · none · surface · many · left · a queue beside the player', '6', 'tabs + video-facade ⚑'],
  ['11', 'Chapters', 'table · none · page · many · top · timecoded rows under the player', '6', 'video-facade ⚑'],
  ['12', 'Embed Card', 'media frame · box · page · one · inline · a bordered embed naming its provider', '6', 'video-facade ⚑'],
  ['13', 'Thumb Rows', 'stack · none · page · few · left · a ruled row per film', '6', 'video-facade'],
  ['14', 'Slim Bar', 'bar · none · surface · one · left · one line, the film summoned', '5', 'video-facade'],
  ['15', 'Tabs', 'media frame · none · page · variable · inline · a tab per film sharing one frame', '6', 'tabs + video-facade ⚑']
];
const FIELDS = [
  ['<code>eyebrow</code>', 'text', 'opt', '24 ch', 'all fifteen', 'Drawn in 14’s meta line rather than above it ⚑'],
  ['<code>heading</code>', 'text', 'opt', '60 ch', 'all but 14', '14 stores it and never draws it ⚑'],
  ['<code>blurb</code>', 'text', 'opt', '200 ch', 'all but 6, 14', '6 and 14 store it and never draw it ⚑'],
  ['<code>credit</code>', 'text', 'opt', '60 ch', 'all but 14', 'Under the set, never in the head ⚑'],
  ['<code>queueLabel</code>', 'text', 'opt', '20 ch', '10', 'Default “In this series”; an <code>h3</code> ⚑'],
  ['<code>embedKind</code> · <code>embedLabel</code>', 'text', 'opt', '20 · 32 ch', '12', 'Defaults derived from the URL ⚑'],
  ['<code>videos[]</code>', 'list 1–24', '<b>req</b>', '24 ⚑', 'all fifteen', 'The category’s repeating unit; authored, never queried'],
  ['↳ <code>url</code>', 'url', '<b>req</b>', '—', 'all fifteen', '<b>The provider is derived from it</b> ⚑, never a field'],
  ['↳ <code>title</code>', 'text', 'opt', '70 ch', 'all fifteen', 'Names the anchor; the sidebar shows the URL without it'],
  ['↳ <code>description</code>', 'text', 'opt', '160 ch', '1, 5, 13, 15', '<b>Drawn only in 13 and 15</b>; stored everywhere ⚑'],
  ['↳ <code>poster</code>', 'image', 'opt', '—', 'all fifteen', '<b>Never the provider’s thumbnail</b> ⚑; the plate is the fallback'],
  ['↳ <code>duration</code>', 'text', 'opt', '8 ch', 'all fifteen', '<b>Typed by the author</b> ⚑ — A4·10’s field, verbatim'],
  ['↳ <code>transcriptUrl</code>', 'url', 'opt', '—', 'all fifteen', 'Settlement 4 — a link, never a panel ⚑'],
  ['↳ <code>tabLabel</code>', 'text', 'opt', '26 ch', '15', 'Drawn at Tab labels: Custom only ⚑'],
  ['<code>chapters[]</code>', 'list 1–24', 'opt', '24', '11', '<b>The second repeating unit</b> ⚑ — <code>time</code> ≤ 8 and <code>label</code> ≤ 70, both required'],
  ['<i>the position</i>', 'generated', '—', '—', '8, 10, 11, 15', 'The lead; the row index; <b>“Film 3”</b>, A15’s one generated string ⚑'],
  ['<i>@site.title</i>', 'Ghost', 'req', '—', 'any design with no heading', 'The section’s <code>aria-label</code> where none is authored ⚑']
];
const COMPONENTS = [
  ['The reserved frame', 'An <code>aspect-ratio</code> box holding poster, notice and player at <code>inset:0</code>', '<b>A15·1 — new</b>'],
  ['Play target', '64 px surface circle with a text glyph; 44 in a cell and at 390, 88 full bleed', '<b>A15·1 — new</b>'],
  ['Duration pill', 'Carried colour on a 76% contrast wash, bottom right, identical in both modes', '<b>A15·1 — new</b>'],
  ['Meta row', '13 px <code>text-muted</code>: duration · provider · transcript ↗', '<b>A15·1 — new</b>'],
  ['The plate', 'A1’s striped placeholder carrying the provider and the film’s name', 'A1·1, extended in A15·1'],
  ['The notice', 'Click-to-load wash, one line naming the provider, one action', '<b>A15·1 — new</b>'],
  ['The theatre', '<code>&lt;dialog&gt;</code> player: counter, close, caption, meta; focus trapped and returned', '<b>A15·1 — new; called by A4·10</b>'],
  ['Video card', 'Poster over title over meta — the grid cell', '<b>A15·7 — new</b>'],
  ['Queue row', '96 × 54 thumbnail, title, duration; current row on the hover surface', 'A18·2, extended in A15·10'],
  ['Chapter row', '52 px mono timecode, label, hairline', 'A9·15, extended in A15·11'],
  ['Embed label row', 'Kind · provider on the box edge, with an open link', '<b>A15·12 — new</b>'],
  ['Audio bar', 'A 160 px embed height rather than a ratio', '<b>A15·12 — new</b>'],
  ['The videos block', 'The one-paste-field repeater, 1–24, identical in all fifteen', 'A3’s repeater, extended in A15·1'],
  ['Tab strip', 'Labels on a hairline, 2 px accent underline on the active one', 'A5·12 and A1·1, carried verbatim'],
  ['Carousel track', 'Native <code>scroll-snap</code> strip, dots, arrows, counter', 'A19·15, carried verbatim'],
  ['Surface plane', 'Fill, hairline and md shadow; a ground rather than a containment', 'A26·3 and A27·4, carried verbatim'],
  ['Warm scrim', 'Contrast wash over the lower 60% of a picture, never black', 'A14·11, carried verbatim'],
  ['Content box and padding ladder', '1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132', 'A17, carried verbatim'],
  ['On-contrast derivation', 'Carried colour, 72% muted, 20% hairline on the band', 'A17·7, carried verbatim'],
  ['Focus ring', '4 px accent, 3 px outside; inset at a page edge', 'A6, with A17·18’s inset rule'],
  ['Disabled value', 'Struck through, with its reason or its ratio shown', 'A9·8, carried verbatim'],
  ['The 1,080 collapse', 'A split that stacks one step early', 'A16·1, carried verbatim']
];

function rosterCard() {
  return tableCard({ w:1328, cols:['#', 'DESIGN', 'STRUCTURAL DESCRIPTOR (THE TUPLE)', 'CTL', 'MODULE'], widths:[36, 132, 760, 44, 200], rows:ROSTER.map(r => [r[0], `<b>${r[1]}</b>`, `<code style="font-family:${MONO};font-size:11.5px">${r[2]}</code>`, r[3], `<code style="font-family:${MONO};font-size:11.5px">${r[4]}</code>`]) });
}
function fieldsCard() {
  return tableCard({ w:1328, cols:['FIELD', 'TYPE', 'REQ', 'LIMIT', 'USED BY', 'NOTES'], widths:[250, 96, 60, 90, 220, 456], rows:FIELDS });
}
function componentsCard() {
  return tableCard({ w:1328, cols:['COMPONENT', 'WHAT IT IS', 'WHERE IT WAS SET'], widths:[240, 780, 280], rows:COMPONENTS.map(r => [`<b>${r[0]}</b>`, r[1], r[2]]) });
}

function build() {
  let out = K.DOC_HEAD;
  out += intro({
    rail:'A15 VIDEO AND EMBEDS · CATEGORY PROOF · PAPER PACK · 15 DESIGNS',
    title:'A15 · Video and Embeds',
    paras:[
      'Fifteen ways to put a film on a page: one player, one player on a plane, on a band, at the page’s full width, under a head that sits on it, in a grid, with a lead, on a track, beside a queue, with a contents list, in a box that names its provider, in ruled rows, on one line, and behind a tab strip.',
      'This frame carries what belongs to the category rather than to a design: the tokenisation proof, the stress frame, the roster, the shared field list, the component inventory, the four settlements and the two findings. Every design’s own frames and written spec are in <a href="A15-1 Player.dc.html">A15-1</a> through <a href="A15-15 Tabs.dc.html">A15-15</a>.'
    ]
  });

  out += section('A15-0 settlements', cap('THE FOUR SETTLEMENTS · §8 OF THE BRIEF, ANSWERED') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      ${textTile({ w:652, label:'1 · POSTER FRAME VERSUS AUTOPLAY-MUTED, AND WHAT PLAYS ON A PHONE', min:240, body:[
        `${b('A poster frame, everywhere, and nothing autoplays at any value in any design')} ⚑. There is no autoplay control, no muted-loop control and ${b('no hover preview')} ⚑ — a film that starts because a pointer passed over it is autoplay with extra steps. Playback begins on an action the reader took, in all fifteen.`,
        `${b('On a phone the film loads in the frame')}, ${code('playsinline')}, in the same reserved box ⚑. ${b('A15 never asks for full screen')} and never hands off to a native player of its own; if the browser takes the film full screen that is the platform’s decision and the section does not fight it.`,
        `${b('The one thing that changes at 390 is the theatre')} ⚑ — Plays: In a theatre falls back to In the frame, because a dialog on a 390 screen is the frame with a close button on it. ${b('14 Slim Bar is the exception')}: it has no frame to fall back to, so it opens the theatre at every width ⚑.`
      ] })}
      ${textTile({ w:652, label:'2 · HOLDING THE ASPECT RATIO WHILE THE EMBED LOADS', min:240, body:[
        `${b('The box is reserved in CSS before anything loads')} ⚑. Every frame is an ${code('aspect-ratio')} box at the section’s Aspect value; the poster, the notice and the player are all ${code('position:absolute; inset:0')} inside it. ${b('Nothing on the page moves when a film is played')}, because nothing changes size.`,
        `${b('There is no “as the provider reports it” value')} ⚑ — the ratio has to be known before the request is made, and asking the provider for it is the request. ${b('A film at another ratio letterboxes inside the box')} ⚑ rather than resizing the section: 15 Tabs shows it, and the stress frame draws a 9:16 film in a 16:9 box.`,
        `${b('One exception, and it is a control value rather than a hidden case')} ⚑: 12 Embed Card’s ${b('Audio bar')} is a height — 160 px, 120 at 390 — because an audio player has no aspect and reserving 16:9 for one leaves a hole.`
      ] })}
      ${textTile({ w:652, label:'3 · A CONSENT OR CLICK-TO-LOAD PLACEHOLDER', min:240, body:[
        `${b('Every third-party embed is click-to-load, and there is no value that turns it off')} ⚑. No request reaches the provider until the reader acts. A control whose value leaks the reader’s address on page load is a control that will be set wrongly, so A15 does not offer one.`,
        `${b('The poster is the author’s image, and if there is none it is the plate')} ⚑ — ${b('never the provider’s own thumbnail')}, because fetching that thumbnail is the request the facade exists to prevent. The plate names the provider and the film, and holds the same box.`,
        `${b('The notice is on the frame, drawn at the moment the reader acts')} ⚑ — “Loads from YouTube. Playing this film sets cookies in your browser.” ${b('12 Embed Card moves it above the frame')} and has no Off value ⚑: that design’s job is to say what the embed costs before the reader spends it.`
      ] })}
      ${textTile({ w:652, label:'4 · CAPTION, CREDIT AND TRANSCRIPT, AND WHERE A TRANSCRIPT LIVES', min:240, body:[
        `${b('Three different things, three different fields')} ⚑. ${code('description')} is the film’s own line, drawn under the frame in 13 Thumb Rows and 15 Tabs and stored everywhere else; ${code('credit')} is the section’s, under the set in fourteen designs, and belongs to the films rather than to the page; ${code('transcriptUrl')} is per film.`,
        `${b('A transcript is a link, never a panel')} ⚑ — ${b('A15 does not host transcript text')}. ${code('transcriptUrl')} points at a Ghost page, a post or a file, and ${b('A25 Post Content Layouts owns the page it points at')}. An ${code('accordion')} of transcript text inside a video section was considered and refused: it is an article, and articles have a category.`,
        `${b('Where a design has no room for a meta row the transcript travels into the theatre')} ⚑ — 6 Cover and 14 Slim Bar — ${b('and the panel says so')} rather than dropping it quietly. ${b('Meta: Off never deletes the link')} ⚑; it means “not under the frame”.`
      ] })}
    </div>` +
    note(`${b('A fifth question the brief did not ask, answered anyway')}: ${b('a section with no video does not render')} ⚑, at every design. No head, no empty box, no placeholder — and in the editor, one paste field.`));

  out += section('A15-0 tokenisation proof', cap('THE TOKENISATION PROOF · 1 PLAYER IN THREE PACKS, LIGHT AND DARK · SIX FRAMES, ONE ARRANGEMENT') +
    packProof() +
    note(`${b('Nothing moves between packs')} ⚑ — the frame, the head, the play control and the meta line sit where they sit; radius, type and colour are the pack’s. ${b('Studio at radius 2 and Garden at radius 20 take the frame, the poster and the play control together')} ⚑, which is why radius is never a control in A15. ${b('The play control is the one element that does not re-tune')} ⚑: it is a warm-white circle with a dark glyph in every pack and both modes, because it sits on a photograph the pack has never seen. ${b('The duration pill is the same call')} ⚑. Everything else — ground, text, muted, hairline, accent — is read from the seven roles and nothing else.`));

  out += section('A15-0 stress frame', cap('THE STRESS FRAME · 7 GRID AT THE WORST REALISTIC CONTENT · DESKTOP 1440 · LIGHT') +
    K.frame(K.L, 1440, stressFrame(K.L, 1440)) +
    note(`${b('Five films, and every one of them is a problem')}: a 105-character title ${b('with no poster')} ⚑ and a 1:48:22 duration; a film with ${b('no duration at all')}, where the pill is absent and the meta row closes up ⚑; ${b('a dead URL')}, which keeps its box and says so ⚑; ${b('a 9:16 film in a 16:9 box')}, letterboxed rather than resizing the row ⚑; and ${b('a film with no title')}, which is its poster and meta line alone ⚑ — never “Untitled”. ${b('The set is five, so the last row is short and left-aligned')} ⚑, and ${b('the heading is 101 characters and wraps to three lines without moving the grid')}. ${b('Nothing here is an error state')} — every one of them publishes.`));

  out += section('A15-0 roster', cap('THE ROSTER · FIFTEEN DESIGNS, THEIR TUPLES, THEIR CONTROL COUNTS AND THEIR MODULES') + rosterCard() +
    note(`${b('Tuple uniqueness — the honest statement.')} All fifteen are distinct on the five closed slots. ${b('Archetype')}: six ${code('media frame')}, two ${code('grid-of-N')}, two ${code('split')}, and one each of ${code('overlay')}, ${code('carousel')}, ${code('table')}, ${code('stack')} and ${code('bar')} — a wider spread than A14’s, because a film can be one thing large or many things small and both are real sections. ${b('Ground does most of the separating among the six media frames')}: ${code('page')} (1, 15), ${code('surface')} (3), ${code('contrast')} (4), ${code('transparent')} (5), ${code('page')} + ${code('box')} (12). ${b('Containment is')} ${code('none')} ${b('in fourteen of fifteen')} ⚑ — only 12 Embed Card puts the section itself in a box. ${b('What the check cannot promise')}: 1 Player and 3 Panel are a fill apart and separate on ground; ${b('7 Grid and 8 Lead and Grid are the same ground and count')} and separate on media placement, which is the size of the lead; ${b('10 Playlist and 15 Tabs both swap one frame from a list')} and separate on archetype, ground and count class. Each design’s panel names its neighbours by number ⚑ rather than pretending the overlap is not there.`));

  out += section('A15-0 fields', cap('THE SHARED FIELD LIST · THE UNION EVERY DESIGN DRAWS FROM · THE CONTRACT THAT MAKES SWITCHING SAFE') + fieldsCard() +
    note(`${b('Six authored section strings, one authored list of seven fields, one second list of two, and nothing read from Ghost but the site title')} ⚑. No design needs a field the category does not have, so ${b('switching between any two of the fifteen preserves everything the author typed')} — including the descriptions only two designs draw and the chapters only one does. ${b('The one real cost is the 70-character title limit')} ⚑: 13 Thumb Rows would carry 120 comfortably and is held to 70 so that switching to 7 Grid never truncates a cell. ${b('The second cost is')} ${code('duration')} ${b('being typed')} ⚑ — A4·10’s field, carried verbatim — which means the running total in 10 Playlist is only as right as the author’s typing, and that is stated on the design rather than hidden.<br><br>${b('Control-written values')} (twenty-eight, none of them per-item): ${code('padding')} · ${code('width')} · ${code('aspect')} · ${code('alignment')} · ${code('meta')} · ${code('plays')} · ${code('mediaSide')} · ${code('columns')} (2 Split’s Even/Media-led) · ${code('action')} · ${code('head')} · ${code('bandEdges')} · ${code('caption')} · ${code('height')} · ${code('textPosition')} · ${code('scrim')} · ${code('playControl')} · ${code('gridColumns')} · ${code('gap')} · ${code('leadSize')} · ${code('peek')} · ${code('carouselControls')} · ${code('queueSide')} · ${code('queueHeight')} · ${code('numbering')} · ${code('chapterList')} · ${code('rules')} · ${code('timecodes')} · ${code('shape')} · ${code('label')} · ${code('notice')} · ${code('openLink')} · ${code('thumbSide')} · ${code('thumbSize')} · ${code('description')} · ${code('thumbnail')} · ${code('edges')} · ${code('tabLabels')} · ${code('tabAlignment')}. ${b('The only item-level value that is not content is')} ${code('tabLabel')} ⚑, and it is content: the author’s own words, edited inside the item.`));

  out += section('A15-0 items', cap('THE VIDEOS BLOCK · ONE REPEATING UNIT, IDENTICAL IN ALL FIFTEEN DESIGNS') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      ${textTile({ w:652, label:'ADDING, REMOVING AND REORDERING', min:280, body:[
        `${b('Add is one paste field')} ⚑ — a provider URL or an uploaded file — and the new film ${b('lands last')}. ${b('It carries its URL as its title until the author types one')} ⚑, so a new row is never a blank shell; the poster, duration and transcript are empty and the frame draws the plate.`,
        `${b('Remove is on the row and is undoable')}. ${b('At one film Remove is disabled with the reason shown')} ⚑ — A9·8’s convention — because a section with an empty list does not render and deleting the last film would make the section disappear from under the author.`,
        `${b('Drag reorders, and authored order is drawn order in all fifteen designs')} ⚑. ${b('Order is meaningful in ten of them')}: it is the lead in 8, the running order in 9 and 10, the tab order in 15, and the first film in the eight single-film designs. ${b('It is not meaningful in 7 Grid and 13 Thumb Rows')} beyond reading order, and those panels say so.`,
        `${b('1–24')} ⚑. ${b('Below the floor')}: a design written for many draws what it has — 7 Grid at 1 is one cell at its column width, 9 Carousel at 1 loses its dots and arrows, 15 Tabs at 1 loses its strip and is 1 Player — ${b('and every one of those panels names the design that fits')} rather than refusing to draw. ${b('At 24 Add is disabled')} with the reason shown.`,
        `${b('At 0 the section does not render on the published page')} ⚑ and the editor draws one paste field at the section’s full width. That is the same empty state in every design.`
      ] })}
      ${textTile({ w:652, label:'WHAT IS EDITABLE INSIDE AN ITEM, AND WHAT IS NOT', min:280, body:[
        `${b('Selecting a frame on the canvas opens that film’s own fields and nothing else')} ⚑ — ${b('URL, title, description, poster, duration, transcript link')}, plus ${code('tabLabel')} in 15. ${b('Everything but the URL is optional')} ⚑.`,
        `${b('No layout, spacing, alignment or emphasis is editable inside an item')} ⚑. Every design control writes one value onto the section and the stylesheet reads it, so ${b('“make film 3 bigger” is not expressible by construction')}. Where a set genuinely needs one film larger, that is 8 Lead and Grid — ${b('and the lead is item 1, chosen by reordering the list')} ⚑, not by a control on the item.`,
        `${b('What an empty optional field looks like')}: no title → the sidebar row shows the URL and the cell is its poster and meta alone ⚑ (10 Playlist is the exception — its row shows the URL, because a queue row with no name cannot be chosen); no poster → the plate, naming the provider; no duration → no pill and the meta row closes up; no transcript → the link is absent rather than disabled; no description → the row or caption closes up.`,
        `${b('11 Chapters carries the only second list')} ⚑ — ${code('chapters[]')}, 1–24, ${b('time and label both required')}, added rows landing last carrying “New chapter”, ${b('never sorted')} ⚑, and a backwards timecode published as typed with a warning dot in the sidebar.`
      ] })}
    </div>`);

  out += section('A15-0 components', cap('COMPONENT INVENTORY · WHAT A15 ESTABLISHED AND WHAT IT CARRIED FORWARD') + componentsCard() +
    note(`${b('Thirteen components are new here')} and the rest are carried verbatim from earlier categories. ${b('A15 adds nothing to the library’s vocabulary that is not about a moving picture')} ⚑ — no new button, no new card, no new list row that A18 did not already have. ${b('The theatre is the one component another category calls')} ⚑: A4·10 Video Poster opens it, and its spec says “A15 owns the player inside it”, which this pass has now drawn.`));

  out += section('A15-0 findings', cap('FINDINGS · TWO GAPS IN THE MODULE REGISTRY, AND ONE DISAGREEMENT RESOLVED') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      ${textTile({ w:428, label:'FINDING 1 · SEEKING A LOADED PLAYER', min:300, body:[
        `${b('11 Chapters needs to tell a player already on the page to move to 5:03, and no module covers that.')} ${code('video-facade')} covers the swap from poster to player and stops there.`,
        `${b('What the design does instead')} ⚑: every chapter row is a real ${code('&lt;a href&gt;')} to the canonical URL carrying the provider’s own time parameter, so with no script it navigates and the film opens at that point, and with the module running the frame reloads at the new start time. ${b('One behaviour rather than two')}, and no registry addition needed to ship it.`,
        `${b('Named for the architect')}: closest module ${code('video-facade')}. ${b('A15 does not invent a name')} and does not use an ${code('M-')}prefixed alias.`
      ] })}
      ${textTile({ w:428, label:'FINDING 2 · A FACADE FOR A NON-VIDEO EMBED', min:300, body:[
        `${b('12 Embed Card puts an audio player, a map or a data frame behind the same click-to-load placeholder, and the registry’s facade is written for video')} — its degradation names a poster and a watch page.`,
        `${b('What the design does instead')} ⚑: it declares ${code('video-facade')} and reads the degradation as ${b('the embed’s canonical page')} — the episode on its host, the location on the map service — so with no script the reader gets there in one navigation and only the in-page frame is lost.`,
        `${b('Named for the architect')}: a general ${code('embed-facade')} is the architect’s call. ${b('A15 does not name one')}.`
      ] })}
      ${textTile({ w:428, label:'RESOLVED · A4·10’S BUTTON-VERSUS-ANCHOR DISAGREEMENT', min:300, body:[
        `${b('A4·10 Video Poster left a finding')}: its design specified a labelled ${code('&lt;button&gt;')} while ${code('video-facade')} degrades to an ${code('&lt;a href&gt;')}.`,
        `${b('A15 settles it')} ⚑: ${b('the trigger compiles as the anchor')} — an ${code('&lt;a href&gt;')} to the canonical watch page wrapping the poster — ${b('and the module upgrades it in place')} to the control that loads the player or opens the theatre. The design and the registry no longer disagree, and the no-JS path is the registry’s own sentence rather than a special case.`,
        `${b('This is the rule in all fifteen designs')} and in A4·10, which calls A15’s theatre.`
      ] })}
    </div>` +
    note(`${b('Refused, each with its home named')}: ${code('lightbox')} — ${b('A14’s module is not declared anywhere in A15')} ⚑, because a still opens an image overlay and a poster opens a player, and the two are different behaviours; ${code('reveal')} — a film that fades in as it is scrolled to is decoration on a frame the reader is already looking for; ${code('load-more')} and ${code('infinite-scroll')} — both count a query and A15’s list is authored; ${code('count-up')} — there is no number to count; ${code('accordion')} for transcript text — that is an article, and A25 owns it ⚑.`));

  out += section('A15-0 floor', cap('THE SHARED FLOOR · WHAT EVERY DESIGN OBEYS UNLESS ITS OWN ENTRY SAYS OTHERWISE') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      ${textTile({ w:652, label:'THE FRAME, THE CONTROL, THE META LINE', min:260, body:[
        `${b('The frame')} is a ${code('&lt;figure&gt;')} whose anchor wraps the poster; ${b('the whole frame is the target')} and ${b('its accessible name is the film’s title plus its duration')} ⚑, never “Play”. Hover grows the play control 2% and underlines the title; ${b('focus draws A6’s 4 px accent ring 3 px outside the frame')} ⚑ (inset at a page edge, A17·18); ${b('reduced motion drops the growth and keeps the underline')} ⚑.`,
        `${b('The play control')} is 64 px on a single-film frame, ${b('44 in a grid cell and at 390')}, 88 at full bleed and on 6 Cover ⚑. ${b('It is never the accent')} ⚑ — a coloured fill over a photograph nobody has seen cannot be checked for contrast, which is A14·11’s finding in a new place.`,
        `${b('The meta line')} is 13 px in ${code('text-muted')}: duration · transcript, with the provider added at the values that name it. ${b('The credit is one 13 px line under the set')} ⚑, in fourteen designs, and belongs to the films rather than to the page.`,
        `${b('The type')}: eyebrow 13 uppercase tracked .08em · heading 40 · 34 · 28 by width (34 in 3 Panel, 46 on 6 Cover) · blurb 17, 16 at 390 · film title 17 in a cell, 24 in a row, 22 in a queue · description 15 · meta and credit 13 · mono 10–12 for frame labels and timecodes. ${b('A15 has no Big Type design')} ⚑ — the display moment is the film.`
      ] })}
      ${textTile({ w:652, label:'THE COUNT, THE SEAM, THE COLLAPSE, THE PRINT', min:260, body:[
        `${b('The count.')} ${b('There is no Show ladder in A15')} ⚑ — A17’s 3 · 6 · 9 · 12 counts a query and there is no query here. ${b('1–24')} ⚑, and eight designs draw item 1 and keep the rest ⚑.`,
        `${b('The seam.')} A15 draws its own padding — ${b('64 · 96 · 132 at 1440, 80 at 834, 64 at 390')} — A17’s ladder. ${b('4 Contrast Band has no padding of its own')}: the band carries it ⚑. ${b('5 Full Bleed keeps vertical padding and has no side padding at any width')} ⚑. ${b('6 Cover has no padding row at all')} — Height is its size ⚑.`,
        `${b('The collapse.')} Every archetype’s own ladder, with the departures named on each design. ${b('Two designs collapse at 1,080 rather than 767')} ⚑ — 2 Split and 10 Playlist, A16·1’s number. ${b('Grids go to one column at 390 rather than two')} ⚑ — A14’s category-wide step, carried. ${b('The aspect never changes with the width')} ⚑ in any design.`,
        `${b('Print.')} ${b('Every design prints its poster, its title, its meta line and its URL')} ⚑ — a printed film is a still and an address, and the address is what makes it findable. ${b('4 Contrast Band prints as 1 Player on white')} (A17·7’s rule); ${b('9 Carousel prints its slides stacked')}, all of them, in authored order; ${b('15 Tabs prints every panel stacked with its label')} ⚑, which is its no-JS rendering exactly.`
      ] })}
    </div>` +
    note(`${b('Accent, once or never.')} The focus ring in thirteen designs; the active dot in 9 Carousel; the active underline in 15 Tabs; the action in 2 Split and 14 Slim Bar. ${b('None at all in 4 Contrast Band and 6 Cover')} ⚑, where the ring takes the carried colour with a 1 px dark outline — A29·3’s finding that Paper’s accent measures 4.0:1 on the band, and the same argument over an unknown poster. ${b('A15 never dims, tints or filters a poster')} ⚑ — not for dark mode, not on a band, not behind a caption. The ground changes; the pictures do not.`));

  out += K.DOC_TAIL;
  return out;
}

return { build };
})();
