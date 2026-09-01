// A15 designs 6–10: Cover · Grid · Lead and Grid · Carousel · Playlist.
globalThis.A15D2 = (function () {
const K = globalThis.A15LIB, P = globalThis.A15PAGE;
const { b, code, two, VIDEOS, VID } = K;
const V1 = VIDEOS[0];

const NO_AUTOPLAY = `${b('Nothing autoplays anywhere in A15')} ⚑ — no design has an autoplay value and none has a muted-loop value.`;
const BOX_RULE = `${b('The box is reserved before anything loads')} ⚑ — every frame is an ${code('aspect-ratio')} box and the poster, the notice and the player all sit inside it. Nothing moves when a film is played. Settlement 2.`;
const CONSENT = `${b('No third-party request is made until the reader acts')} ⚑ — settlement 3, and ${b('there is no “load with the page” value anywhere in A15')} ⚑.`;
const POSTER_RULE = `${b('The poster is the author’s uploaded image, and if there is none it is the plate')} ⚑ — ${b('never the provider’s own thumbnail')}, because fetching it is the request the facade exists to prevent.`;
const TRANSCRIPT = `${b('A transcript is a link, never a panel')} ⚑ — ${code('transcriptUrl')} points at a Ghost page, a post or a file, and A25 owns the page it points at.`;
const DATA_LINE = `${b('Nothing is read from Ghost’s content API')} ⚑ — the list is authored in the section. Ghost supplies the poster’s ${code('img_url')} derivatives; ${b('the provider is derived from the URL')} ⚑.`;
const ZERO = `${b('0 videos')} → ${b('the section does not render on the published page')} ⚑; in the editor it draws one paste field carrying “Paste a YouTube, Vimeo or file URL” ⚑.`;
const A11Y_TAIL = `${b('The accessible name of every frame is its film’s title plus its duration')} ⚑, never “Play”. ${b('The 4 px accent ring sits 3 px outside the frame')} so it survives a dark poster. Meta 5.4:1 light, 5.6:1 dark.`;
const ITEM_FIELDS = `${b('Inside an item')}: ${b('URL')} (req), ${b('title')} ≤ 70, ${b('description')} ≤ 160, ${b('poster')} image, ${b('duration')} ≤ 8, ${b('transcript link')} — everything but the URL optional ⚑. No title → the sidebar row shows the URL; no poster → the plate; no duration → no pill and the meta row closes up ⚑.`;
const LIST_RULE = `${b('Add takes one pasted URL and lands it last')} ⚑; Remove is on the row and undoable; ${b('drag reorders and authored order is drawn order')} ⚑; ${b('1–24')}, and Add is disabled at 24 with the reason shown.`;

const padRow = K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.');
const aspectRow = (help, dis) => K.seg('Aspect', ['16:9', '4:3', '1:1', '9:16'], 0, help || `The box the frame reserves before anything loads ⚑. ${b('There is no “as the provider reports it” value')} ⚑ — settlement 2.`, dis);
const metaCtl = (active, help) => K.seg('Meta', ['Duration and transcript', 'Duration only', 'Off'], active === undefined ? 0 : active, help || `The 13 px line under the frame. ${b('Off never deletes the transcript link')} ⚑ — it stays in the item and in the theatre.`);
const playsRow = help => K.seg('Plays', ['In the frame', 'In a theatre'], 0, help || `In the frame swaps the player into the reserved box; In a theatre opens A15·1’s dialog and ${b('falls back to In the frame at 390')} ⚑.`);
const gapRow = K.seg('Gap', ['Tight', 'Even', 'Airy'], 1, '8 · 24 · 40 px, the same value between columns and rows.');

/* ── 6 · Cover ────────────────────────────────────────────────────────── */
const d6 = {
  n:6, name:'Cover', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 6 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'The poster is the section: full bleed at 620, the head over it on A14·11’s warm wash, the play control at the centre. The film opens in the theatre rather than under the words.',
    'It is the section for the film a page is built around — a trailer, a title sequence — and the only design in A15 where type sits on the picture.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · POSTER 1,440 × 620 · TEXT ON THE WARM WASH · PLAY 88 · OPENS THE THEATRE ⚑',
  body(t, w) {
    const g = K.ground(t, 'page');
    const gg = K.G(w);
    const stacked = w === 390;
    const h = w === 1440 ? 620 : w === 834 ? 430 : 260;
    const wash = `<span style="position:absolute;left:0;right:0;bottom:0;height:${Math.round(h * 0.6)}px;background:linear-gradient(180deg, rgba(35,32,25,0) 0%, rgba(35,32,25,.34) 42%, rgba(35,32,25,.66) 100%)"></span>`;
    const over = stacked ? '' : `<span style="position:absolute;left:${gg.m}px;right:${gg.m}px;bottom:${w === 1440 ? 48 : 36}px;display:flex;flex-direction:column;gap:14px;max-width:${w === 1440 ? 760 : 560}px">
      <span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:rgba(251,249,245,.8);font-family:${g.pack.body}">${VID.eyebrow}</span>
      <span style="font-family:${g.pack.head};font-size:${w === 1440 ? 46 : 34}px;font-weight:700;line-height:1.08;letter-spacing:-0.03em;color:#FBF9F5;text-wrap:pretty">${VID.heading}</span>
      <span style="display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(251,249,245,.8);font-family:${g.pack.body}">${V1.dur}<span style="opacity:.5">·</span><span style="text-decoration:underline;text-underline-offset:3px">Transcript ↗</span></span></span>`;
    const poster = `<span style="display:block;position:relative;width:${w}px;height:${h}px;background:${g.stripe};overflow:hidden">
      <span style="position:absolute;top:9px;left:11px;font-family:${K.MONO};font-size:10px;color:${g.muted}">01 · POSTER · COVER CROP, NOT AN ASPECT ⚑</span>
      ${wash}${over}
      <span style="position:absolute;left:50%;top:${stacked ? '50%' : '44%'};transform:translate(-50%,-50%)">${K.playBtn(t, { size:stacked ? 44 : 88 })}</span></span>`;
    const under = stacked
      ? `<div style="padding:20px 20px 0;display:flex;flex-direction:column;gap:12px">${K.headBlock(g, w, { measure:350, max:350, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:false })}${K.metaRow(g, V1, {})}</div>`
      : '';
    return `<div>${K.padTop(t, w, 'SIDE PADDING 0 ⚑ · THE POSTER IS THE SECTION')}${poster}${under}<div style="padding:${stacked ? 16 : 20}px ${gg.m}px 0">${K.creditEl(g, {})}</div>${K.padBot(t, w)}</div>`;
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const h = 200;
    const wash = `<span style="position:absolute;left:0;right:0;bottom:0;height:120px;background:linear-gradient(180deg, rgba(35,32,25,0) 0%, rgba(35,32,25,.34) 42%, rgba(35,32,25,.66) 100%)"></span>`;
    if (o.mode === 'loaded') return `<div style="width:${box}px;display:flex;flex-direction:column;gap:10px">${K.theatreEl(t, { w:box, h:280, counter:'01 / 06', behind:'' })}<span style="font-size:11.5px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">Playing means the theatre, on this design only ⚑ — the head sits on the poster and a player cannot be drawn under words.</span></div>`;
    const body = o.mode === 'consent'
      ? `<span style="position:absolute;inset:0;background:rgba(35,32,25,.62);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:16px;box-sizing:border-box;text-align:center"><span style="font-size:13px;line-height:1.5;color:#FBF9F5;font-family:${g.pack.body};max-width:340px">Loads from ${V1.prov}. Playing this film sets cookies in your browser.</span><span style="display:inline-flex;align-items:center;height:38px;padding:0 16px;border-radius:8px;background:#FBF9F5;color:#232019;font-size:14px;font-weight:600;font-family:${g.pack.body}">Load and play</span></span>`
      : `${wash}<span style="position:absolute;left:20px;right:20px;bottom:20px;display:flex;flex-direction:column;gap:8px"><span style="font-family:${g.pack.head};font-size:26px;font-weight:700;line-height:1.1;letter-spacing:-0.03em;color:#FBF9F5">${VID.heading}</span><span style="font-size:12px;color:rgba(251,249,245,.8);font-family:${g.pack.body}">12:40 · Transcript ↗</span></span><span style="position:absolute;left:50%;top:42%;transform:translate(-50%,-50%)">${K.playBtn(t, { size:56 })}</span>`;
    const label = o.mode === 'plate' ? '01 · NO POSTER UPLOADED · THE COVER FALLS BACK TO THE CONTRAST BAND ⚑' : '01 · POSTER · COVER CROP';
    const bg = o.mode === 'plate' ? K.ground(t, 'contrast').bg : g.stripe;
    return `<span style="display:block;position:relative;width:${box}px;height:${h}px;background:${bg};overflow:hidden;border-radius:8px"><span style="position:absolute;top:9px;left:11px;font-family:${K.MONO};font-size:10px;color:${o.mode === 'plate' ? 'rgba(251,249,245,.7)' : g.muted}">${label}</span>${body}</span>`;
  },
  tileMin:290,
  primaryNote:`A14·11’s warm scrim, carried verbatim: ${b('a wash of the contrast colour, strongest at the foot, over the lower 60% of the poster')} ⚑ — never black, never a full-frame darkening. ${b('The type on the poster is the carried colour in every pack')} ⚑, which is why this design has no accent: a coloured heading over an unknown photograph cannot be checked for contrast. ${b('Cover is the one design in A15 with no aspect control')} ⚑ — the poster is a cover crop at a height, not a ratio, and the Height control is what sets it.`,
  statesNote:`${b('This design plays in the theatre and nowhere else')} ⚑ — the head sits on the poster, and swapping a player in underneath the words would put type over a moving picture. ${b('With no poster the cover falls back to the pack’s contrast band')} ⚑ rather than to the striped plate: a wash over stripes is unreadable, and A4·4’s flat panel is the established answer. ${CONSENT}`,
  extraTiles:[{
    label:'WHAT HAPPENS AT 390 ⚑',
    body:[`${b('At ≤ 767 the text comes off the picture')} ⚑ — poster at 390 × 260 with the play control centred, then the eyebrow, heading and meta line underneath on the page ground. A 46 px heading over a 260 px poster leaves no picture, and a scrim over most of a small photograph is a grey rectangle.`,
      `${b('Because the text is no longer on the poster, the phone plays in the frame')} ⚑ — the theatre’s 390 fallback, which every design shares, is the right behaviour here rather than an exception to be explained.`,
      `${b('Height: Full screen is ignored at 390')} ⚑ — a 100 vh poster on a phone is a page the reader has to scroll past to reach anything.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Cover', n:6, sub:'The head on the poster.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[K.seg('Height', ['Short', 'Tall', 'Full screen'], 1, `480 · 620 · 100 vh. ${b('Full screen is ignored at 390')} ⚑.`),
      K.seg('Text position', ['Bottom left', 'Centred'], 0, `Where the head sits on the wash. ${b('Never the top')} ⚑ — a wash at the head of a picture reads as a banner.`),
      K.seg('Scrim', ['Soft', 'Standard'], 1, `${b('Standard measures 4.9:1 against a mid-tone, Soft 3.6:1')} ⚑ — A14·11’s measurement, carried, stated rather than hidden. Soft is offered anyway: the author can see their own poster.`),
      K.seg('Play control', ['Centred', 'Beside the head'], 0, 'Centred at 88; beside the head at 56, on the same baseline as the meta line.'),
      metaCtl(0, `Drawn on the wash under the heading. ${b('Off leaves the duration in the theatre')} ⚑.`),
      K.sel('Plays', 'In a theatre', `${b('Locked')} ⚑ — see the states. At 390, where the text is off the picture, it plays in the frame.`, true)],
    videos:{ count:6, single:true },
    settles:[
      `${b('Six controls.')} Cut: an aspect value (${b('the poster is a crop at a height')} ⚑), a blurb value — ${b('no blurb is drawn on the poster')} ⚑, because three lines of body copy on a photograph is where covers go wrong — and a scrim-colour value: it is the pack’s contrast token at two opacities.`,
      `${b('No accent anywhere on this design')} ⚑, as on 4 Contrast Band. The focus ring takes the carried colour with a 1 px dark outline, which holds against both a white sky and a dark hull.`,
      `${b('Nothing here is per-item.')} This design draws the first film and keeps the rest ⚑.`
    ]
  },
  tabletLabel:'834 · poster 834 × 430 · text still on the wash',
  mobileLabel:'390 · text under the poster ⚑ · play 44',
  respCap:'TABLET 834 · THE ARRANGEMENT HOLDS · MOBILE 390 · THE TEXT COMES OFF THE PICTURE ⚑',
  respNote:`overlay’s ladder with ${b('one departure, and it is a real one')}: ${b('at ≤ 767 the text leaves the poster and sits under it')} ⚑ on the page ground, which is the only structural change any A15 design makes at a breakpoint. ${b('1440')} poster 1,440 × 620, heading 46, play 88, wash over the lower 372. ${b('834')} poster 834 × 430, heading 34, play 88, wash over the lower 258. ${b('≤ 767')} poster 390 × 260, ${b('play 44, no wash, no type on the picture')} ⚑, heading 28 beneath, padding 64. ${b('Tablet is drawn because 834 still carries the type on the picture')} and is the widest frame that does.`,
  darkNote:`${b('The wash does not change between modes')} ⚑ — it is a wash over a photograph, and the photograph does not know what mode the page is in. A14·11’s finding, carried verbatim. What re-tunes is the credit line and the ground the section sits on. ${b('The no-poster fallback inverts with the pack')}: the contrast band is ${code('#EDE7DA')} carrying ${code('#171511')} in dark ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The poster full bleed at 620 with the eyebrow, heading and meta line on a warm wash at its foot and the play control at the centre. Opens the theatre.'),
    K.specRow(2, 'Structural descriptor', `${code('overlay · none · image · one · background · the head on the poster')}<br><span style="color:#6B6459">Ground ${code('image')} — the picture is the section’s ground rather than a thing sitting on it, which is what separates this from 5 Full Bleed.</span>`),
    K.specRow(3, 'Archetype', `overlay. ${b('One departure')} — at ≤ 767 the text leaves the picture ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} poster 1,440 × 620, heading 46, play 88, wash 372. ${b('834')} poster 834 × 430, heading 34, wash 258. ${b('≤ 767')} poster 390 × 260, no wash, text underneath, heading 28, play 44 ⚑, padding 64.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('credit')} and ${code('videos[]')} item 1. ${b('blurb is stored and not drawn')} ⚑. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Height ${b('Short · Tall · Full screen')} — Text position ${b('Bottom left · Centred')} — Scrim ${b('Soft · Standard')} — Play control ${b('Centred · Beside the head')} — Meta ${b('Duration and transcript · Duration only · Off')} — Plays ${b('locked at In a theatre')} ⚑. Then the videos block. ${b('No Padding row')} ⚑ — the poster is the section and Height is its size.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → as drawn. ${b('many')} → item 1 drawn, the rest kept ⚑.`),
    K.specRow(8, 'Empty state', `${b('No poster → the pack’s contrast band')} ⚑, not the striped plate, with the head and play control unchanged on it — A4·4’s flat panel, carried. No heading → the play control alone on the picture, which is legitimate ⚑. No duration → the meta line closes up.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE + ` ${b('With JavaScript off the whole poster is the anchor')} and the reader reaches the watch page in one navigation; ${b('the wash and the type are CSS and are unaffected')} ⚑.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')} at 46 px. ${b('The poster is an')} ${code('&lt;img&gt;')} ${b('inside the anchor, not a CSS background')} ⚑ — A19·2’s rule, so it prints and is announced; the wash is a sibling ${code('aria-hidden')} span. ${b('No accent anywhere')} ⚑; the ring is the carried colour with a 1 px dark outline. Type on the wash 4.9:1 at Standard, ${b('3.6:1 at Soft and stated')} ⚑. ${A11Y_TAIL}<br>${b('Repeating items')} — ${LIST_RULE} This design is designed for 1 ⚑.<br>${b('Flagged ⚑')} the text leaving the picture at 390 · the theatre locked on · the contrast-band fallback with no poster · no aspect control · no accent · the blurb stored and undrawn.`)
  ]]
};

/* ── 7 · Grid ─────────────────────────────────────────────────────────── */
const d7 = {
  n:7, name:'Grid', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 7 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'Six films in three even columns, each poster over its title and meta line, every frame at the same reserved ratio. The design that holds a series rather than a film.',
    'It is the section for a channel page, a season of interviews, a set of recorded talks — where the reader is choosing what to watch rather than being handed one thing.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THREE COLUMNS ON 1,296 · FRAME 416 × 234 · TITLE 17 · PLAY 44 IN THE CELL ⚑',
  body(t, w) {
    const g = K.ground(t, 'page');
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gp = w === 390 ? 16 : w === 834 ? 20 : 24;
    const box = K.G(w).box;
    const cw = Math.floor((box - gp * (cols - 1)) / cols);
    const cells = K.take(6).map(v => K.vcard(t, g, v, { w:cw, aspect:'16:9', playSize:w === 390 ? 44 : 44, titleSize:17 })).join('');
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px">
      ${K.headBlock(g, w, { measure:w === 390 ? 350 : 560, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      <div style="display:flex;flex-wrap:wrap;gap:${gp + 12}px ${gp}px;width:${box}px;align-items:flex-start">${cells}</div>
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const n = o.n || 3, gp = 14;
    const cw = Math.floor((box - gp * 2) / 3);
    return `<div style="display:flex;flex-wrap:wrap;gap:${gp + 8}px ${gp}px;width:${box}px;align-items:flex-start">${
      K.take(n).map((v, i) => K.vcard(t, g, v, { w:cw, aspect:'16:9', playSize:40, titleSize:15, mode:i === 0 ? o.mode : 'poster' })).join('')}</div>`;
  },
  tileMin:250,
  counts:[
    { n:1, label:'ONE FILM · THE CELL KEEPS ITS COLUMN WIDTH ⚑ · MINIATURE AT 604' },
    { n:2, label:'TWO FILMS · ONE SHORT ROW, LEFT-ALIGNED' },
    { n:5, label:'FIVE FILMS · THE LAST ROW IS SHORT AND LEFT-ALIGNED ⚑' }
  ],
  primaryNote:`A17’s content box and A14·1’s grid, carried verbatim, with A15’s frame in the cell. ${b('416 × 234')} is 1,296 on three columns at a 24 px gap taken to 16:9. ${b('The play control is 44 in a grid cell and 64 in a single-film design')} ⚑ — 64 px on a 416 px poster covers the subject, and 44 is the target floor. ${b('The duration pill stays on the poster')} and the meta line under it carries the transcript, so the cell reads at a glance and in full.`,
  statesNote:`${b('Only the cell the reader acted on changes state')} ⚑ — playing film 3 does not touch films 1, 2 and 4–6, and ${b('two films cannot play at once')}: starting one destroys the player in any other cell ⚑. ${BOX_RULE} ${POSTER_RULE}`,
  extraTiles:[{
    label:'WHAT THE GRID SETTLES FOR THE CATEGORY',
    body:[`${b('There is no Show ladder in A15')} ⚑ — A17’s 3 · 6 · 9 · 12 counts a query and there is no query here. ${b('The count is the length of the list')}, 1–24, and every arrangement has to hold at whatever the author pasted.`,
      `${b('At one film the cell keeps its column width and does not stretch')} ⚑ — a 416 poster blown to 1,296 is 1 Player, and the panel names it. ${b('A short last row is left-aligned and short')} ⚑.`,
      `${b('Titles are clamped to two lines and never truncated in the middle')} ⚑; a 70-character title wraps to two lines at 416 and the cells in a row share the taller height, so the grid stays aligned.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Grid', n:7, sub:'A series in even columns.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Columns', ['Two', 'Three', 'Four'], 1, `The desktop count. ${b('Two and three go to two at 834; four goes to three')} ⚑ — and all of them go to one at 390.`),
      aspectRow(),
      gapRow,
      K.seg('Meta', ['Duration and transcript', 'Duration and provider', 'Off'], 0, `${b('Duration and provider is the value for a mixed set')} ⚑ — where some films are on YouTube and some are uploaded files, the reader is told which before they act.`),
      playsRow()],
    videos:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a Show ladder (there is no query), a “stretch the last row” value (${b('the last row is left-aligned and short')} ⚑), a per-cell size value — that is 8 Lead and Grid — and a description value: ${b('descriptions are not drawn in a three-column cell')} ⚑, they are 13 Thumb Rows’ job.`,
      `${b('Nothing here is per-item.')} A control writes one value onto the section and the stylesheet reads it ⚑. If one film in the set should be larger than the others, that is 8 Lead and Grid, and the panel names it rather than growing a seventh control.`,
      NO_AUTOPLAY + ` ${b('And nothing plays on hover')} ⚑ — a preview that starts because the pointer passed over it is autoplay with extra steps.`
    ]
  },
  tabletLabel:'834 · two columns · frame 367 × 206',
  mobileLabel:'390 · one column · frame 350 × 197',
  respCap:'TABLET 834 · TWO COLUMNS · MOBILE 390 · ONE COLUMN, THE TITLES UNCHANGED',
  respNote:`grid-of-N’s ladder with ${b('one departure')}: ${b('one column at 390 rather than two')} ⚑ — A14’s category-wide step, carried, because a 167 px poster is a thumbnail of something the reader cannot see. ${b('1440')} three columns, gap 24, frame 416 × 234, title 17, play 44. ${b('834')} two columns, gap 20, frame 367 × 206, padding 80. ${b('390')} one column, frame 350 × 197, padding 64. ${b('The aspect does not change with the width')} ⚑.`,
  darkNote:`Ground ${code('#171511')}, titles ${code('#F2EDE4')}, meta ${code('#A79E8F')} at 5.6:1. ${b('Posters, play controls and duration pills are identical in both modes')} ⚑ — A14’s rule that the ground changes and the pictures do not.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'Six films in three even columns, each poster above its title and meta line, one reserved ratio across every cell.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · many · top · even posters in three columns')}<br><span style="color:#6B6459">Media ${code('top')}: the poster sits above its own text. 8 Lead and Grid is ${code('inline')} — the same ground and count, one film laid in at a different size.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('One departure')} — one column at 390 rather than two ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} three columns, gap 24, frame 416 × 234, title 17, meta 13, play 44, padding 96. ${b('834')} two columns, gap 20, frame 367 × 206, padding 80. ${b('≤ 767')} one column, gap 16, frame 350 × 197, padding 64.`),
    K.specRow(5, 'Content fields', `The four section strings and ${code('videos[]')} 1–24, ${b('all of them drawn')}. ${b('description is stored and not drawn in this design')} ⚑. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Columns ${b('Two · Three · Four')} — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Gap ${b('Tight · Even · Airy')} — Meta ${b('Duration and transcript · Duration and provider · Off')} — Plays ${b('In the frame · In a theatre')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one cell at its column width, left-aligned, not stretched ⚑. ${b('2–3')} → one short row. ${b('many')} → wraps; ${b('the last row is left-aligned and short')} ⚑. ${b('Above 24')} Add is disabled with the reason shown. ${b('Designed for 3–12')} ⚑.`),
    K.specRow(8, 'Empty state', `Absent strings close up ⚑. ${b('A cell with no title is its poster and meta line alone')} ⚑ — no “Untitled”. No poster → the plate, naming the provider. ${b('A dead URL keeps its cell')} and draws the plate with “No longer available at that address” at 13 px ⚑.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE + ` ${b('One player at a time')} ⚑ — starting a second destroys the first, which is a rule of this design rather than a second module.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; the set is a ${code('&lt;ul&gt;')} of ${code('&lt;li&gt;')}, each cell a ${code('&lt;figure&gt;')} with the title inside the anchor ⚑. Focus order is authored order. ${A11Y_TAIL} ${b('The 44 px play control is decoration')}: the target is the whole 416 × 234 cell ⚑.<br>${b('Repeating items')} — ${LIST_RULE} At 1 the cell holds its column width; at 0 the section does not render ⚑. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} one column at 390 · the short last row · play at 44 in a cell · one player at a time · nothing plays on hover · no Show ladder.`)
  ]]
};

/* ── 8 · Lead and Grid ────────────────────────────────────────────────── */
const d8 = {
  n:8, name:'Lead and Grid', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 8 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'The first film at the full content box with its title beside its meta line, and the rest of the set in a row of three beneath it. One film is the point; the others are what else there is.',
    'It is the section for a new release with a back catalogue under it — this week’s film, then the season — and the only design in A15 where two sizes of frame sit in one arrangement.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · LEAD 1,296 × 729 · ROW OF THREE AT 416 × 234 · THE LEAD IS ALWAYS ITEM 1 ⚑',
  body(t, w) {
    const g = K.ground(t, 'page');
    const box = K.G(w).box;
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gp = w === 390 ? 16 : w === 834 ? 20 : 24;
    const cw = Math.floor((box - gp * (cols - 1)) / cols);
    const lead = `<div style="display:flex;flex-direction:column;gap:14px;width:${box}px">
      ${K.vframe(t, g, VIDEOS[0], { w:box, aspect:'16:9', playSize:w === 390 ? 44 : 88 })}
      <div style="display:flex;${w === 390 ? 'flex-direction:column;gap:8px;' : 'align-items:baseline;justify-content:space-between;gap:24px;'}">
        ${K.titleEl(g, VIDEOS[0], { head:true, size:w === 1440 ? 28 : w === 834 ? 24 : 21, max:w === 390 ? 350 : 760 })}
        ${K.metaRow(g, VIDEOS[0], {})}</div></div>`;
    const rest = `<div style="display:flex;flex-wrap:wrap;gap:${gp + 12}px ${gp}px;width:${box}px;align-items:flex-start">${
      K.VIDEOS.slice(1, 4).map(v => K.vcard(t, g, v, { w:cw, aspect:'16:9', playSize:44, titleSize:16 })).join('')}</div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px">
      ${K.headBlock(g, w, { measure:w === 390 ? 350 : 560, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      ${lead}${rest}${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const gp = 14, cw = Math.floor((box - gp * 2) / 3);
    const n = o.n === undefined ? 4 : o.n;
    const lead = `<div style="display:flex;flex-direction:column;gap:8px;width:${box}px">${K.vframe(t, g, VIDEOS[0], { w:box, aspect:'16:9', mode:o.mode, playSize:56 })}${K.titleEl(g, VIDEOS[0], { head:true, size:19 })}</div>`;
    const rest = n > 1 ? `<div style="display:flex;flex-wrap:wrap;gap:${gp}px;width:${box}px;align-items:flex-start">${
      K.VIDEOS.slice(1, n).map(v => K.vcard(t, g, v, { w:cw, aspect:'16:9', playSize:36, titleSize:14, meta:false })).join('')}</div>` : '';
    return `<div style="display:flex;flex-direction:column;gap:14px;width:${box}px">${lead}${rest}</div>`;
  },
  tileMin:420, countMin:420,
  counts:[
    { n:1, label:'ONE FILM · THE LEAD ALONE, NO EMPTY ROW ⚑' },
    { n:3, label:'THREE FILMS · THE LEAD AND A SHORT ROW OF TWO ⚑' }
  ],
  primaryNote:`A14·10’s lead-and-grid, carried, with one difference: ${b('the lead here is the content box rather than a bleed')} ⚑ — a film crossing the page margin is 5 Full Bleed, and two designs should not both do it. ${b('The lead is always item 1 and no control changes that')} ⚑; reordering the list is how the lead is chosen, which is A14·3’s rule and the reason this design needs no lead picker. ${b('The lead carries the 88 px play control and the row carries 44')} ⚑ — the two sizes are the emphasis, not a colour or a border.`,
  statesNote:`${b('The lead and the row share every state')} ⚑ — one component at two sizes, and the notice, the plate and the loaded player look the same in both. ${b('Playing a film in the row does not promote it to the lead')} ⚑: the arrangement is the author’s order, not the reader’s history. ${BOX_RULE}`,
  extraTiles:[{
    label:'THE COUNTS THIS DESIGN IS WRITTEN FOR ⚑',
    body:[`${b('Designed for 4–10')} ⚑ — a lead and one to three rows of three. ${b('At 1 the lead is drawn alone and no empty row is reserved')} ⚑; the section is then 1 Player at Width: Wide, and the panel says so.`,
      `${b('At 2 and 3 the row is short and left-aligned')} ⚑ — never centred, never stretched to fill the box.`,
      `${b('Above 10 the rows continue in threes')} ⚑ and the lead is never repeated. There is no “load more” here — ${code('load-more')} is A17 and A18’s module and the list is authored, not paged.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Lead and Grid', n:8, sub:'One film, then the rest.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Lead size', ['Full box', 'Two thirds'], 0, `1,296 × 729, or 856 × 482 with the row starting beside it ⚑. ${b('Both keep the lead at item 1')}.`),
      aspectRow(),
      gapRow,
      metaCtl(0, `Drawn under the lead and under each cell in the row. ${b('The lead’s meta line sits beside its title')}, not under it ⚑.`),
      playsRow()],
    videos:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a lead picker (${b('the lead is item 1, and reordering the list is how it is chosen')} ⚑ — A14·3’s rule, carried), a row-count value (three at 1440, and it is the grid’s own step), and a “promote on play” value.`,
      `${b('Nothing here is per-item.')} ${b('The lead is bigger because of where it sits in the list, not because a control was set on it')} ⚑ — which is the only way one item can differ from another in this library.`,
      NO_AUTOPLAY
    ]
  },
  tabletLabel:'834 · lead 754 × 424 · row of two',
  mobileLabel:'390 · one column · the lead is the same size as the rest ⚑',
  respCap:'TABLET 834 · LEAD AND A ROW OF TWO · MOBILE 390 · THE LEAD LOSES ITS SIZE ⚑',
  respNote:`grid-of-N’s ladder with ${b('two departures')}: ${b('one column at 390')} ⚑, and ${b('at 390 the lead is drawn at the same size as every other film')} ⚑ — A14·3’s call, carried verbatim: at one column there is no larger to be, and the order alone says which film is first. ${b('1440')} lead 1,296 × 729 with the title at 28 beside its meta, row of three at 416 × 234. ${b('834')} lead 754 × 424, title 24, row of two at 367 × 206, padding 80. ${b('≤ 767')} every frame 350 × 197, titles 17, play 44, padding 64.`,
  darkNote:`Ground ${code('#171511')}; the lead’s title takes ${code('#F2EDE4')} at 28 px and the row’s at 16. ${b('Nothing about either frame changes')} ⚑. The only dark-mode decision here is that ${b('the lead is not given a plane to lift it')} — the size is the emphasis in both modes.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'Item 1 at the full content box with its title and meta line beneath, then the rest of the set in a row of three. Two frame sizes in one arrangement.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · many · inline · one lead film above the row')}<br><span style="color:#6B6459">Media ${code('inline')} — the frames are laid into one arrangement at two sizes rather than each sitting above its own text, which is what separates this from 7 Grid.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('Two departures')} — one column at 390, and the lead loses its size there ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} lead 1,296 × 729, title 28 beside meta, row of three 416 × 234, play 88 and 44. ${b('834')} lead 754 × 424, title 24, row of two 367 × 206, padding 80. ${b('≤ 767')} one column at 350 × 197, all frames equal ⚑, play 44, padding 64.`),
    K.specRow(5, 'Content fields', `The four section strings and ${code('videos[]')} 1–24, all drawn. ${b('The lead is item 1')} ⚑. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Lead size ${b('Full box · Two thirds')} — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Gap ${b('Tight · Even · Airy')} — Meta ${b('Duration and transcript · Duration only · Off')} — Plays ${b('In the frame · In a theatre')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → the lead alone, no empty row ⚑. ${b('2–3')} → lead and a short row. ${b('many')} → rows of three continue; the lead is never repeated ⚑. ${b('Designed for 4–10')} ⚑.`),
    K.specRow(8, 'Empty state', `As 7 Grid. ${b('A lead with no poster draws the plate at 1,296 × 729')} ⚑ — the largest plate in the library, and the reason the plate’s type stays at 13 px.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE + ` ${b('One player at a time across the lead and the row')} ⚑.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; one ${code('&lt;ul&gt;')} in authored order with the lead as its first ${code('&lt;li&gt;')} ⚑ — ${b('the lead is not promoted in the heading structure')}, it is a bigger frame. ${A11Y_TAIL}<br>${b('Repeating items')} — ${LIST_RULE} ${b('Reordering is how the lead is chosen')} ⚑. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} the lead as item 1 · the lead at the content box rather than a bleed · the lead losing its size at 390 · no promote-on-play · rows of three above 10.`)
  ]]
};

/* ── 9 · Carousel ─────────────────────────────────────────────────────── */
const d9 = {
  n:9, name:'Carousel', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 9 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'One film at a time on a scroll-snap track, its neighbours showing at both edges, with dots, arrows and a counter beneath. The set is walked rather than scanned.',
    'It is the section for a short series where each film deserves the whole width — an interview series, a set of five talks — and the reader is expected to move through them in order.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · SLIDE 960 × 540 CENTRED · NEIGHBOURS PEEKING AT 148 · NATIVE SCROLL-SNAP TRACK',
  body(t, w) {
    const g = K.ground(t, 'page');
    const box = K.G(w).box;
    const sw = w === 1440 ? 960 : w === 834 ? 630 : 302;
    const gp = w === 390 ? 12 : 20;
    const peek = w === 1440 ? 148 : w === 834 ? 42 : 12;
    const slide = (v, i) => `<div style="width:${sw}px;flex-shrink:0;display:flex;flex-direction:column;gap:12px">${K.vframe(t, g, v, { w:sw, aspect:'16:9', playSize:w === 390 ? 44 : 64 })}<div style="display:flex;flex-direction:column;gap:6px">${K.titleEl(g, v, { size:w === 390 ? 16 : 17, max:sw })}${K.metaRow(g, v, {})}</div></div>`;
    const track = `<div style="width:${box}px;overflow:hidden"><div style="display:flex;gap:${gp}px;margin-left:-${sw - peek}px">${K.take(3).map(slide).join('')}</div></div>`;
    const controls = `<div style="display:flex;align-items:center;justify-content:space-between;width:${box}px">
      <div style="display:flex;align-items:center;gap:8px;height:44px">${[0, 1, 2, 3, 4, 5].map(i => `<span style="height:8px;width:${i === 0 ? 24 : 8}px;border-radius:99px;background:${i === 0 ? t.accent : g.border};display:block"></span>`).join('')}</div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-family:${K.MONO};font-size:12px;color:${g.muted}">01 / 06</span>
        <span style="width:44px;height:44px;border:1px solid ${g.border};border-radius:${Math.min(g.r, 8)}px;display:inline-flex;align-items:center;justify-content:center;font-size:16px;color:${g.muted};box-sizing:border-box">←</span>
        <span style="width:44px;height:44px;border:1px solid ${g.border};border-radius:${Math.min(g.r, 8)}px;display:inline-flex;align-items:center;justify-content:center;font-size:16px;color:${g.text};box-sizing:border-box">→</span></div></div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 24 : 32}px">
      ${K.headBlock(g, w, { measure:w === 390 ? 350 : 560, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      ${track}${controls}${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const sw = 420, peek = 80;
    return `<div style="width:${box}px;display:flex;flex-direction:column;gap:10px">
      <div style="width:${box}px;overflow:hidden"><div style="display:flex;gap:16px;margin-left:-${sw - peek}px">${K.take(3).map((v, i) => `<div style="width:${sw}px;flex-shrink:0">${K.vframe(t, g, v, { w:sw, aspect:'16:9', mode:i === 1 ? o.mode : 'poster', playSize:52 })}</div>`).join('')}</div></div>
      <div style="display:flex;align-items:center;gap:8px">${[0, 1, 2, 3].map(i => `<span style="height:8px;width:${i === 1 ? 24 : 8}px;border-radius:99px;background:${i === 1 ? t.accent : g.border};display:block"></span>`).join('')}</div></div>`;
  },
  tileMin:290,
  primaryNote:`A19·15’s carousel track, dots and arrows, carried verbatim — ${b('a native')} ${code('scroll-snap')} ${b('strip')}, which is why the module degrades to a usable strip rather than to nothing. ${b('The active dot is this design’s one accent')} ⚑. ${b('One slide is centred and both neighbours peek at 148')} ⚑ so the reader can see there is more without being shown half a film. ${b('The counter is drawn')} at 12 px mono beside the arrows: dots alone stop scaling past about eight.`,
  statesNote:`${b('Advancing the track destroys a loaded player')} ⚑ — nothing plays off-screen, and a film left running in a slide the reader has scrolled past is the clearest case of a section taking a decision that is not its to take. ${b('The arrows are drawn but disabled while a film is loaded')} ⚑ is the alternative, and it was rejected: the reader should not have to close a player to move on. ${BOX_RULE}`,
  extraTiles:[{
    label:'REDUCED MOTION AND NO SCRIPT',
    body:[`${b('Under reduced motion the track jumps rather than glides')} ⚑ — ${code('scroll-behavior:auto')} instead of ${code('smooth')} — and nothing else changes. A14·7’s answer, carried verbatim.`,
      `${b('With JavaScript off the track is still a scroll-snap strip and still works')} ⚑; the dots, the arrows and the counter are hidden. That is the ${code('carousel')} module’s own degradation and this design needs no help from it.`,
      `${b('There is no autoadvance value')} ⚑ — a track that moves on a timer is autoplay applied to the arrangement instead of to the film.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Carousel', n:9, sub:'One film at a time.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      aspectRow(),
      K.seg('Peek', ['On', 'Off'], 0, `On shows both neighbours at 148; Off snaps one slide to the content box ⚑.`),
      K.seg('Controls', ['Dots', 'Arrows', 'Both'], 2, `${b('Both is the default')} ⚑ — dots say how many, arrows say how to move, and the counter is drawn with either.`),
      metaCtl(),
      playsRow(`${b('In a theatre is the safer value here')} ⚑ — a film in a dialog is not affected by the track moving underneath it.`)],
    videos:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: an autoadvance value and its interval (see the frame), a slides-per-view value (${b('one, always')} ⚑ — two 630 px films side by side is 7 Grid at Columns: Two), and a loop value: ${b('the track stops at both ends')} ⚑ and the arrows disable there, because a set of six that wraps to the start hides how long it is.`,
      `${b('Nothing here is per-item.')} Every slide is the same frame at the same size ⚑.`,
      `${b('Designed for 3–12 films')} ⚑. At 1 the track is a single frame and the dots, arrows and counter are not drawn ⚑ — the design is then 1 Player at Width: Content and the panel names it. At 2 both slides are reachable and the peek shows the other one.`
    ]
  },
  tabletLabel:'834 · slide 630 × 354 · peek 42',
  mobileLabel:'390 · slide 302 × 170 · peek 12 · arrows dropped ⚑',
  respCap:'TABLET 834 · SLIDE 630 · MOBILE 390 · THE ARROWS GO AND THE TRACK IS SWIPED ⚑',
  respNote:`carousel’s ladder with ${b('one departure')}: ${b('at ≤ 767 the arrows are not drawn')} ⚑ — the track is swiped, the dots stay as the position indicator, and two 44 px buttons on a 350 px row is a third of the width spent saying what a swipe already does. ${b('1440')} slide 960 × 540, peek 148, gap 20, dots + arrows + counter. ${b('834')} slide 630 × 354, peek 42, gap 20. ${b('≤ 767')} slide 302 × 170, peek 12, gap 12, ${b('dots and counter only')} ⚑, play 44, padding 64.`,
  darkNote:`The active dot re-checks at ${code('#E0805A')} — ${b('4.6:1 against')} ${code('#171511')} ⚑, and it is a graphical object rather than text, so the 3:1 floor applies and it clears it in both modes. The inactive dots take the hairline token ${code('#332E27')}. ${b('The frames are unchanged')} ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One film centred on a native scroll-snap track with both neighbours peeking, dots, arrows and a counter beneath.'),
    K.specRow(2, 'Structural descriptor', `${code('carousel · none · page · many · inline · one film at a time')}<br><span style="color:#6B6459">Media ${code('inline')} — the frames are laid along one track. The only ${code('carousel')} archetype in A15; A14·7 is its still-photograph sibling.</span>`),
    K.specRow(3, 'Archetype', `carousel. ${b('One departure')} — the arrows are dropped at ≤ 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} slide 960 × 540, peek 148, gap 20, play 64, dots + arrows + counter, padding 96. ${b('834')} slide 630 × 354, peek 42, padding 80. ${b('≤ 767')} slide 302 × 170, peek 12, gap 12, dots and counter only ⚑, play 44, padding 64.`),
    K.specRow(5, 'Content fields', `The four section strings and ${code('videos[]')} 1–24, all drawn, each slide carrying ${code('title')}, ${code('duration')} and ${code('transcriptUrl')}. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Peek ${b('On · Off')} — Controls ${b('Dots · Arrows · Both')} — Meta ${b('Duration and transcript · Duration only · Off')} — Plays ${b('In the frame · In a theatre')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one frame, no dots, no arrows, no counter ⚑. ${b('2')} → both reachable, peek shows the other. ${b('many')} → the track runs to the end and stops ⚑; it does not wrap. ${b('Designed for 3–12')} ⚑.`),
    K.specRow(8, 'Empty state', `As 7 Grid; a slide with no poster draws the plate at the slide’s size ⚑. ${b('A slide is never skipped for being incomplete')} ⚑ — the counter would then disagree with the dots.`),
    K.specRow(9, 'Behaviour module', `${code('carousel')} ${b('and')} ${code('video-facade')} ⚑ — two modules on one section, as A14·7 declared. ${b('carousel, edit-safe: yes')} — the track is a scroll container and the editor scrolls it. ${b('No-JS, quoted:')} “${P.CAROUSEL_QUOTE}” ${P.FACADE_LINE}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. The track is a ${code('&lt;ul&gt;')} with ${code('scroll-snap-type:x mandatory')}; ${b('the arrows are')} ${code('&lt;button&gt;')} ${b('elements that scroll it')}, and ${b('the dots are buttons with the film’s title as their label')} ⚑, never bare dots. Focus follows the track: tabbing to a slide scrolls it into view ⚑. Arrows disable at both ends with ${code('aria-disabled')}. ${A11Y_TAIL}<br>${b('Repeating items')} — ${LIST_RULE} ${b('Order is meaningful here')} ⚑ and the counter reads it. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} advancing destroys a loaded player · no autoadvance · no loop · arrows dropped at 390 · the active dot as the only accent · one slide per view.`)
  ]]
};

/* ── 10 · Playlist ────────────────────────────────────────────────────── */
const d10 = {
  n:10, name:'Playlist', stateGround:'surface',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 10 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'The player on a surface plane with the rest of the set queued beside it: one row per film, the current one marked, the whole list reachable without leaving the section.',
    'It is the section for a course, a season or an archive — where the reader picks one film, then another, and the list is as much the point as the picture.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · PLANE 1,296 · PLAYER 800 × 450 · QUEUE 400 · ROW 1 IS THE CURRENT FILM',
  body(t, w) {
    const g = K.ground(t, 'surface');
    const stacked = w !== 1440;
    const pad = w === 1440 ? 32 : w === 834 ? 24 : 16;
    const inner = w === 1440 ? 1232 : w === 834 ? 706 : 318;
    const pw = stacked ? inner : 800;
    const qw = stacked ? inner : 400;
    const player = `<div style="width:${pw}px;display:flex;flex-direction:column;gap:12px">
      ${K.vframe(t, g, VIDEOS[0], { w:pw, aspect:'16:9', playSize:w === 390 ? 44 : 64 })}
      <div style="display:flex;flex-direction:column;gap:6px">${K.titleEl(g, VIDEOS[0], { head:true, size:w === 390 ? 19 : 22, max:pw })}${K.metaRow(g, VIDEOS[0], {})}</div></div>`;
    const rows = K.take(w === 390 ? 4 : 5).map((v, i) => K.queueRow(t, g, v, { active:i === 0, thumbW:w === 390 ? 84 : 96, tail:`<span style="font-family:${K.MONO};font-size:11px;color:${g.muted};flex-shrink:0">${K.two(v.n)}</span>` })).join('');
    const queue = `<div style="width:${qw}px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:baseline;justify-content:space-between"><span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">In this series</span><span style="font-family:${K.MONO};font-size:11px;color:${g.muted}">06 FILMS · 1:12:24</span></div>
      <div style="display:flex;flex-direction:column;gap:2px">${rows}</div>
      <span style="font-size:13px;color:${g.muted};font-family:${g.pack.body};padding-left:10px">One more film ↓</span></div>`;
    const plane = `<div style="background:${g.bg};border:1px solid ${g.border};border-radius:${g.r}px;${t.dark ? '' : `box-shadow:${t.shadow};`}padding:${pad}px;box-sizing:border-box;display:flex;${stacked ? 'flex-direction:column;gap:24px;' : 'gap:32px;align-items:flex-start;'}">${player}${queue}</div>`;
    const body = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 24 : 32}px">
      ${K.headBlock(g, w, { measure:w === 390 ? 350 : 560, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      ${plane}${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, body);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'surface');
    const pw = 360, qw = box - pw - 40;
    return `<div style="width:${box}px;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r}px;padding:16px;box-sizing:border-box;display:flex;gap:16px;align-items:flex-start">
      <div style="width:${pw}px;display:flex;flex-direction:column;gap:8px">${K.vframe(t, g, VIDEOS[0], { w:pw, aspect:'16:9', mode:o.mode, playSize:48 })}${K.titleEl(g, VIDEOS[0], { head:true, size:16, max:pw })}</div>
      <div style="width:${qw}px;display:flex;flex-direction:column;gap:2px">${K.take(3).map((v, i) => K.queueRow(t, g, v, { active:i === 0, thumbW:60, titleSize:13, pad:7 })).join('')}</div></div>`;
  },
  tileMin:250,
  primaryNote:`A26·3’s surface plane holding two columns: ${b('800 + 32 + 400 inside 32 px of plane padding')} ⚑. The queue row is A18·2’s thumb row at 96 × 54, carried verbatim, with ${b('the current row on the plane’s hover surface and a 28 px play glyph on its thumbnail')} ⚑. ${b('The running total is drawn')} — “06 films · 1:12:24” at 11 px mono ⚑ — ${b('and it is summed from the typed durations')}, so it is only as right as the author’s typing, which is stated here and in the spec.`,
  statesNote:`${b('Choosing a row swaps the player and nothing else moves')} ⚑ — the plane, the queue and the head all hold their positions, which is the whole reason the box is reserved. ${b('The queue does not scroll to follow the current film')} ⚑ unless the reader scrolls it. ${CONSENT} — and the notice is drawn once, on the first film the reader plays, not on every swap ⚑.`,
  extraTiles:[{
    label:'THE MODULE, AND WHAT IT COSTS',
    body:[`${b('This design declares')} ${code('tabs')} ${b('as well as')} ${code('video-facade')} ⚑. Each queue row is a tab and the player is its panel — which is what a playlist is, structurally, and it is the closest thing in the registry to a queue.`,
      `${b('No-JS, quoted:')} “${P.TABS_QUOTE}” ${b('A15 reads that as: the plane renders every film stacked')} ⚑, each with its own poster, title and meta line, in authored order — six frames instead of one player and a queue. Longer, and everything is reachable.`,
      `${b('There is no autoadvance and no “play all”')} ⚑ — the queue is a list of choices, not a schedule, and a section that starts the next film on its own is autoplay by another name.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Playlist', n:10, sub:'A player and its queue.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Queue side', ['Left', 'Right'], 1, `Which side the list takes above 1,080. ${b('Stacked, the queue is always under the player')} ⚑.`),
      K.seg('Queue height', ['Four rows', 'Six rows', 'All'], 1, `Four and Six scroll inside the plane with the rest reachable ⚑; All grows the plane instead.`),
      aspectRow(),
      K.seg('Numbering', ['On', 'Off'], 0, 'The 11 px mono index at the end of each row.'),
      metaCtl()],
    videos:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: an autoadvance value, a “play all” action, a Plays value (${b('this design plays in the frame, always')} ⚑ — a theatre would empty the plane it was opened from), and a running-total toggle: ${b('the total is drawn whenever every film has a typed duration and absent otherwise')} ⚑.`,
      `${b('Nothing here is per-item.')} The current row is marked by the reader’s choice, ${b('and the first row is current on load')} ⚑ — never a stored position, never a remembered one.`,
      `${b('Designed for 3–12 films')} ⚑. At 1 the queue is not drawn and the design is 3 Panel; at 2 the queue holds one other film, which is thin but honest, and the panel names 13 Thumb Rows as the better arrangement for a short set.`
    ]
  },
  tabletLabel:'834 · stacked · queue under the player',
  mobileLabel:'390 · stacked · thumbs 84 · four rows',
  respCap:'TABLET 834 AND MOBILE 390 · BOTH STACKED · THE COLLAPSE IS AT 1,080 ⚑',
  respNote:`split’s ladder with ${b('one departure')}: ${b('the collapse is at 1,080 rather than 767')} ⚑ — A16·1’s number, carried, because an 800 px player and a 400 px queue both stop working before 767. ${b('1440')} plane 1,296, padding 32, player 800 × 450, queue 400, thumbs 96 × 54. ${b('1080–768')} stacked: player at the plane’s inner width, queue beneath it full width, padding 24. ${b('≤ 767')} plane 350, padding 16, player 318 × 179, ${b('thumbs 84 × 47 and four rows')} ⚑, play 44, padding 64.`,
  darkNote:`Plane ${code('#211D17')} on ground ${code('#171511')}, ${b('the shadow dropped')} ⚑ as in 3 Panel, and ${b('the current row takes the hover surface')} ${code('#2A251E')} — a one-step lift rather than an accent fill ⚑, so the mark survives a pack whose accent is close to its surface. The thumbnails and the player are unchanged.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'A player and a queue on one surface plane: 800 × 450 beside a 400 px list of rows, the current film marked, the running total in the queue’s head.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · surface · many · left · a queue beside the player')}<br><span style="color:#6B6459">Media ${code('left')} at the default — the player is the media half and the queue is the text half; 2 Split is the ${code('one')}-film, page-ground case.</span>`),
    K.specRow(3, 'Archetype', `split. ${b('One departure')} — the collapse is at 1,080 rather than 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,296, padding 32, player 800 × 450, queue 400, rows 96 × 54, title 22. ${b('1080–768')} stacked, player first, queue full width beneath, padding 24. ${b('≤ 767')} plane 350, padding 16, player 318 × 179, thumbs 84 × 47, four rows ⚑, padding 64.`),
    K.specRow(5, 'Content fields', `The four section strings, ${code('queueLabel')} ≤ 20 (default “In this series”) ⚑ and ${code('videos[]')} 1–24, all drawn as rows. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Queue side ${b('Left · Right')} — Queue height ${b('Four rows · Six rows · All')} — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Numbering ${b('On · Off')} — Meta ${b('Duration and transcript · Duration only · Off')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → the queue is not drawn and the section is 3 Panel ⚑. ${b('2')} → a queue of one other film. ${b('many')} → the queue scrolls inside the plane at Four and Six rows ⚑. ${b('The running total is the sum of the typed durations')} and is absent if any film has none ⚑. ${b('Designed for 3–12')} ⚑.`),
    K.specRow(8, 'Empty state', `A row with no title shows its URL ⚑ — the one place in A15 a URL is drawn on the page, because a queue row with nothing in it cannot be chosen. No poster → the plate at 96 × 54, ${b('which is small enough that it carries no text')} ⚑. No duration → the row shows the title alone.`),
    K.specRow(9, 'Behaviour module', `${code('tabs')} ${b('and')} ${code('video-facade')} ⚑. ${b('tabs, edit-safe: yes')} — A9·5’s call, carried: the first tab is active on load, nothing is remembered, and no state is written while the section is edited. ${b('No-JS, quoted:')} “${P.TABS_QUOTE}” ${b('A15 reads that as: every film renders stacked with its own poster, title and meta line')} ⚑, in authored order. ${P.FACADE_LINE}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; ${code('queueLabel')} is an ${code('h3')} ⚑. The queue is a ${code('&lt;ul&gt;')} of ${code('role="tab"')} buttons with ${code('aria-selected')}, the player their one ${code('role="tabpanel"')}; ${b('← and → move between rows and Home and End jump to the ends')} ⚑, which is the tab pattern A9·5 established. ${b('The current row is marked by the hover surface and a bold title, never by colour alone')} ⚑. ${A11Y_TAIL}<br>${b('Repeating items')} — ${LIST_RULE} ${b('Order is meaningful')} ⚑ — it is the running order, and row 1 is what loads. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} the 1,080 collapse · the queue under the player when stacked · first row current on load · no stored position · no autoadvance · the summed total and its dependence on typed durations.`)
  ]]
};

return [d6, d7, d8, d9, d10];
})();
