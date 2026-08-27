// A15 designs 1–5: Player · Split · Panel · Contrast Band · Full Bleed.
globalThis.A15D1 = (function () {
const K = globalThis.A15LIB, P = globalThis.A15PAGE;
const { b, code, gap, two, VIDEOS, VID } = K;
const V1 = VIDEOS[0];

/* ── prose the whole category shares ──────────────────────────────────── */
const NO_AUTOPLAY = `${b('Nothing autoplays anywhere in A15')} ⚑ — there is no Autoplay value on any of the fifteen designs, and no muted-loop value either. A film that starts itself takes the decision away from the reader, costs them data they did not agree to spend, and would have to be switched off under reduced-motion anyway.`;
const BOX_RULE = `${b('The box is reserved before anything loads')} ⚑ — the frame is an ${code('aspect-ratio')} box at the section’s Aspect value, and the poster, the notice and the player all sit inside that one box at ${code('position:absolute; inset:0')}. ${b('Nothing on the page moves when a film is played')}, because nothing changes size. Settlement 2.`;
const CONSENT = `${b('No third-party request is made until the reader acts')} ⚑ — settlement 3. ${b('There is no “load with the page” value anywhere in A15')} ⚑: click-to-load is the category’s behaviour and not a control, because a control with a value that leaks the reader’s address on load is a control that will be set wrongly.`;
const POSTER_RULE = `${b('The poster is the author’s uploaded image, and if there is none it is the plate')} ⚑ — ${b('never the provider’s own thumbnail')}, because fetching that thumbnail is exactly the request the facade exists to prevent. The plate names the provider and the film, and the box is the same size either way.`;
const DUR_LINE = `${b('The duration is typed by the author')} ⚑ — A4·10’s field, carried verbatim: ${code('videoDuration')} ≤ 8 characters. ${b('Nothing reads it from the provider')}, because reading it means calling the provider.`;
const TRANSCRIPT = `${b('A transcript is a link, never a panel')} ⚑ — settlement 4. ${b('A15 does not host transcript text')}: ${code('transcriptUrl')} points at a Ghost page, a post or a file, and ${b('A25 Post Content Layouts owns the page it points at')}. The link sits in the meta row under the frame in every design that draws a meta row.`;
const DATA_LINE = `${b('Nothing is read from Ghost’s content API')} ⚑ — as in A14, the list is authored in the section. Ghost supplies ${code('img_url')} derivatives for the poster’s ${code('srcset')} and, for an uploaded file, the file itself; ${b('the provider is derived from the URL')} ⚑ and is not a field the author sets.`;
const ZERO = `${b('0 videos')} → ${b('the section does not render on the published page')} ⚑ — no head, no empty box, no placeholder. ${b('In the editor it draws one paste field')} at the section’s width carrying “Paste a YouTube, Vimeo or file URL” ⚑.`;
const KEPT = `${b('This design draws the first film in the list and keeps the rest')} ⚑ — films 2–24 are stored, not deleted, and switching to 7 Grid draws them all again. The panel says so on the videos block rather than hiding it.`;
const A11Y_TAIL = `${b('The frame is the target')} — 960 × 540 at the default, far past 44 ⚑ — and ${b('the accessible name is the film’s title, not “Play”')} ⚑. ${b('The 4 px accent ring sits 3 px outside the frame')} so it survives a dark poster. Meta 5.4:1 light, 5.6:1 dark.`;

const ITEM_FIELDS = `${b('Inside an item')}: ${b('URL')} (req), ${b('title')} ≤ 70, ${b('description')} ≤ 160, ${b('poster')} image, ${b('duration')} ≤ 8, ${b('transcript link')} — ${b('everything but the URL optional')} ⚑. With no title the row in the sidebar shows the URL; on the page the film is named by the section heading. With no poster the plate draws. With no duration the pill is absent and the meta row closes up ⚑.`;

/* ── shared control rows ──────────────────────────────────────────────── */
const padRow = K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.');
const aspectRow = (help, dis) => K.seg('Aspect', ['16:9', '4:3', '1:1', '9:16'], 0, help || `The box the frame reserves before anything loads ⚑. ${b('There is no “as the provider reports it” value')} ⚑ — the ratio has to be known before the request is made, which is settlement 2.`, dis);
const metaRow = (active, help) => K.seg('Meta', ['Duration and transcript', 'Duration only', 'Off'], active === undefined ? 0 : active, help || `The 13 px line under the frame. ${b('Off never deletes the transcript link')} ⚑ — it stays in the item and in the theatre.`);
const playsRow = (help) => K.seg('Plays', ['In the frame', 'In a theatre'], 0, help || `In the frame swaps the player into the reserved box. ${b('In a theatre opens A15’s dialog')} — the one A4·10 calls ⚑ — and ${b('falls back to In the frame at 390')} ⚑, where a dialog is the frame anyway.`);

/* ── the theatre · drawn once, on 1 Player, referenced by number ──────── */
const theatreSection = (function () {
  const g = K.ground(K.L, 'page');
  const behind = `<div style="padding:20px;display:flex;flex-direction:column;gap:12px;align-items:center">${K.vframe(K.L, g, V1, { w:420, aspect:'16:9' })}</div>`;
  return K.section('A15-1 theatre', K.cap('THE THEATRE · ONE DIALOG FOR ALL FIFTEEN DESIGNS · DRAWN HERE, REFERENCED BY NUMBER EVERYWHERE ELSE') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      ${K.tile({ w:652, label:'THE DIALOG · FILM 01 OF 06 OPEN · DRAWN AT 604 × 392', bg:'#FBF9F5', border:'#EBE5DB', body:K.theatreEl(K.L, { w:604, h:392, behind, counter:'01 / 06' }) })}
      ${K.textTile({ label:'WHAT IT DOES · AND WHO ELSE OPENS IT', min:352, body:[
        `${b('It is a')} ${code('&lt;dialog&gt;')}. ${b('Focus is trapped')} while it is open ⚑ — Tab cycles close · the player · the transcript link — ${b('Escape closes it and focus returns to the frame that opened it')} ⚑.`,
        `${b('The film is paused and the player destroyed on close')} ⚑, so nothing keeps playing behind a closed dialog and no third-party frame survives it.`,
        `${b('The caption and the meta row are drawn inside the dialog')} ⚑, including the transcript link, at every Meta value — Off means “not under the frame”, never “thrown away”.`,
        `${b('At 390 the theatre is not used')} ⚑: Plays: In a theatre falls back to In the frame, because a dialog at 390 is the frame with a close button on it.`,
        `${b('A4·10 Video Poster opens this dialog')} ⚑ — its spec says “A15 owns the player inside it”, and this is it. ${b('A33 owns the video card inside')} ${code('{{content}}')} and does not call it.`,
        P.LIGHTBOX_NOTE
      ] })}
    </div>` +
    K.note(`${b('One dialog, fifteen designs')} ⚑ — every design’s Plays control writes the same value and gets the same theatre, and no design has an overlay of its own. It is ${code('video-facade')} still: ${b('the trigger is the same anchor')}, and what the module upgrades it to is a dialog rather than an in-place swap. ${b('With JavaScript off there is no dialog and the anchor navigates')} ⚑, which is the registry’s degradation exactly.`));
})();

/* ── 1 · Player ───────────────────────────────────────────────────────── */
const d1 = {
  n:1, name:'Player', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 1 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'One film at 960 on the page ground, centred under its head, with the duration on the poster and the meta line under it. The category default, and the arrangement six other designs resolve to at 390.',
    'It is the section for a page that is about one film — a documentary, an interview, a recording of a talk — where the film is the reason the reader came and nothing should compete with it.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · FRAME 960 × 540 CENTRED · 16:9 RESERVED BEFORE ANYTHING LOADS · CLICK TO LOAD',
  body(t, w) {
    const g = K.ground(t, 'page');
    const fw = w === 1440 ? 960 : w === 834 ? 754 : 350;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px;align-items:center">
      ${K.headBlock(g, w, { align:'center', measure:w === 390 ? 350 : 620, max:760, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      <div style="display:flex;flex-direction:column;gap:14px;align-items:center;width:${fw}px">
        ${K.vframe(t, g, V1, { w:fw, aspect:'16:9' })}
        <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
          ${K.metaRow(g, V1, {})}
          ${K.captionEl(g, V1.blurb, { max:Math.min(fw, 620) })}
        </div></div>
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    return `<div style="width:${box}px;display:flex;flex-direction:column;gap:12px;align-items:center">${K.vframe(t, g, V1, { w:420, aspect:'16:9', mode:o.mode })}${K.metaRow(g, V1, {})}</div>`;
  },
  tileMin:270,
  extraSection:theatreSection,
  primaryNote:`A17’s content box and padding ladder, carried verbatim, with A15’s frame in the middle of it. ${BOX_RULE} ${b('The play control is a 64 px surface-filled circle with a text glyph')} ⚑ — ${b('never the accent')}: an accent fill over a photograph nobody has seen cannot be checked for contrast, which is A14·11’s finding in a new place. ${b('The duration pill is the carried colour on a 76% contrast wash')} ⚑ and is identical in both modes, for the same reason.`,
  statesNote:`${POSTER_RULE} ${CONSENT} ${b('The notice is drawn on the poster, not under it')} ⚑ — it is a thing the reader needs at the moment they act, and a permanent line under every frame in a grid of twelve is six lines of small print.`,
  extraTiles:[{
    label:'WHAT 1 PLAYER SETTLES FOR THE CATEGORY',
    body:[NO_AUTOPLAY,
      `${b('What plays on a phone')} ⚑ — settlement 1. The player loads ${b('in the frame')}, ${code('playsinline')}, at the same reserved box; ${b('A15 never asks for full screen')} and never leaves it to a native player of its own. If the reader’s browser takes the film full screen, that is the platform’s decision and the section does not fight it.`,
      DUR_LINE]
  }, {
    label:'CAPTION, CREDIT AND TRANSCRIPT · SETTLEMENT 4',
    body:[TRANSCRIPT,
      `${b('Three different things, three different fields')} ⚑: ${code('description')} is the film’s own line under the frame; ${code('credit')} is the section’s, under the set, and belongs to the films rather than to the page; ${code('transcriptUrl')} is per film. ${b('No design draws a second section-level caption')} — the blurb is already that.`,
      `${b('Where a design has no room for a meta row')} — 6 Cover, 14 Slim Bar — ${b('the transcript link moves into the theatre and the panel says so')} ⚑, rather than being quietly dropped.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Player', n:1, sub:'One film, centred.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Width', ['Content', 'Wide', 'Full'], 0, `960 · 1,296 · edge to edge. ${b('Full is 5 Full Bleed’s arrangement inside this design')} ⚑ and the panel names it; if the head should sit over the film rather than above it, that is 6 Cover.`),
      aspectRow(),
      K.seg('Alignment', ['Left', 'Centred'], 1, 'Moves the head and the meta line together; the frame stays at its own width.'),
      metaRow(),
      playsRow()],
    videos:{ count:6, single:true },
    settles:[
      `${b('Six controls.')} Cut: an autoplay value (${NO_AUTOPLAY}), a “load with the page” value (${CONSENT}), a poster-source value (${POSTER_RULE}), and a play-button-size value — 64 px is the token size and 44 is the floor at 390.`,
      `${b('Nothing here is per-item.')} Every control writes one value onto the section ⚑. ${KEPT}`,
      `${b('Radius is never a control')} ⚑ — the frame, the poster, the theatre and the play control all take the pack’s radius token together, as they do in A14.`
    ]
  },
  tabletLabel:'834 · frame 754 × 424 · the full content box',
  mobileLabel:'390 · frame 350 × 197 · play control 44',
  respCap:'TABLET 834 · THE FRAME TAKES THE CONTENT BOX · MOBILE 390 · THE PLAY CONTROL DROPS TO 44 ⚑',
  respNote:`media frame’s ladder, with ${b('one departure')}: ${b('at 834 and below Width: Content is ignored and the frame takes the whole content box')} ⚑ — 960 does not fit inside 754, and a frame narrower than its own text column looks like a mistake. ${b('1440')} frame 960 × 540, play 64, meta 13, padding 96. ${b('834')} frame 754 × 424, play 64, padding 80. ${b('390')} frame 350 × 197, ${b('play 44')} ⚑, heading 28, padding 64, ${b('Plays: In a theatre falls back to In the frame')} ⚑. ${b('The aspect never changes with the width')} ⚑ — a film cropped by a breakpoint is a film the author did not frame.`,
  darkNote:`Ground ${code('#171511')}, meta ${code('#A79E8F')} at 5.6:1. ${b('The poster, the play control and the duration pill do not change between modes')} ⚑ — A14’s rule that the ground changes and the pictures do not, carried verbatim. ${b('The loaded player is the provider’s own frame')} and A15 does not tint it ⚑; what re-tunes is everything around it.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One film at 960 centred under a centred head, the duration on the poster, one meta line under it. The category default and the frame every other design is built out of.'),
    K.specRow(2, 'Structural descriptor', `${code('media frame · none · page · one · top · one film at the content width')}<br><span style="color:#6B6459">Containment ${code('none')} — the section sits in nothing; 12 Embed Card is the same frame in a box. Count ${code('one')}: the list may hold 24 and this design draws the first ⚑.</span>`),
    K.specRow(3, 'Archetype', `media frame. ${b('One departure')} — at 834 and below the Width value is ignored and the frame takes the content box ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} content 1,296 on a 72 margin; frame 960 × 540 centred, play 64, meta 13, credit under; padding 96. ${b('834')} frame 754 × 424, heading 34, padding 80. ${b('≤ 767')} frame 350 × 197, play 44 ⚑, heading 28, padding 64, theatre falls back to in-frame ⚑. ${b('The aspect is the same at all three widths')} ⚑.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} ≤ 24 · ${code('heading')} ≤ 60 · ${code('blurb')} ≤ 200 · ${code('credit')} ≤ 60 · ${code('videos[]')} 1–24, of which ${b('this design draws item 1')}. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Width ${b('Content · Wide · Full')} — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Alignment ${b('Left · Centred')} — Meta ${b('Duration and transcript · Duration only · Off')} — Plays ${b('In the frame · In a theatre')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → the design as drawn. ${b('many')} → item 1 is drawn and the rest are kept ⚑; the panel names 7 Grid. ${b('Above 24')} the list cannot grow and Add is disabled with the reason shown.`),
    K.specRow(8, 'Empty state', `No eyebrow, heading, blurb or credit → each absent and the block closes up ⚑; with all four gone the section is the frame alone, which is legitimate. ${b('No poster')} → the plate, naming the provider and the film ⚑. ${b('No duration')} → no pill, and the meta row closes up ⚑. ${b('No transcript')} → the link is absent, not disabled. ${b('A dead or private URL')} → the frame keeps its box and draws the plate with “This film is no longer available at that address” at 13 px ⚑, and the editor marks the row.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')} ⚑ — A15 is not the route’s head. The frame is a ${code('&lt;figure&gt;')}; the anchor wraps the poster and ${b('its accessible name is the film’s title plus its duration')} ⚑, so “Two hours before the tide, 12 minutes 40” is what is announced rather than “Play”. ${A11Y_TAIL} ${b('The poster carries')} ${code('alt=""')} ${b('because the anchor is already named')} ⚑. In the theatre: ${code('&lt;dialog&gt;')}, focus trapped, Escape returns focus ⚑.<br>${b('Repeating items')} — ${code('videos[]')}: Add takes one pasted URL and lands it last ⚑; Remove is on the row and undoable; ${b('drag reorders and row 1 is the film this design plays')} ⚑; ${b('1–24, this design designed for 1')}; at 0 the section does not render ⚑. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} click-to-load with no opt-out · no autoplay anywhere · the poster never the provider’s thumbnail · the typed duration · the play control never the accent · the theatre’s 390 fallback.`)
  ]]
};

/* ── 2 · Split ────────────────────────────────────────────────────────── */
const d2 = {
  n:2, name:'Split', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 2 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'The film in a 720 column with its text held beside it: eyebrow, heading, description, a labelled play action and the meta line. Two columns above 1,080, stacked below it.',
    'It is the section for a film that needs selling as well as showing — where the reader has to be told what they are about to watch before they will spend twelve minutes on it.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · TEXT 480 · FRAME 720 × 405 · GAP 96 · THE ACTION CARRIES THE ACCENT',
  body(t, w) {
    const g = K.ground(t, 'page');
    const stacked = w !== 1440;
    const fw = stacked ? K.G(w).box : 720;
    const action = `<span style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:${Math.min(g.r, 8)}px;background:${g.btnBg};color:${g.btnText};font-size:14px;font-weight:600;font-family:${g.pack.body};align-self:flex-start"><span style="font-size:11px">▶</span>Play · ${V1.dur}</span>`;
    const text = `<div style="display:flex;flex-direction:column;gap:16px;${stacked ? '' : 'width:480px;'}">
      ${K.headBlock(g, w, { measure:stacked ? K.G(w).box : 480, max:stacked ? K.G(w).box : 480, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:V1.blurb })}
      ${action}
      ${K.metaRow(g, V1, {})}</div>`;
    const media = `<div style="display:flex;flex-direction:column;gap:12px;${stacked ? '' : 'width:720px;'}">${K.vframe(t, g, V1, { w:fw, aspect:'16:9' })}</div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${stacked ? 28 : 40}px">
      <div style="display:flex;${stacked ? 'flex-direction:column;gap:24px;' : 'gap:96px;'}align-items:${stacked ? 'stretch' : 'center'}">${text}${media}</div>
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    return `<div style="width:${box}px;display:flex;gap:20px;align-items:center">
      <div style="width:184px;display:flex;flex-direction:column;gap:8px">${K.titleEl(g, V1, { head:true, size:19, max:184 })}${K.metaRow(g, V1, {})}</div>
      ${K.vframe(t, g, V1, { w:360, aspect:'16:9', mode:o.mode })}</div>`;
  },
  tileMin:230,
  primaryNote:`A9·5 and A16·1’s two-column split, carried verbatim, with A15’s frame in the media half. ${b('480 + 96 + 720 = 1,296')}. ${b('The action is the accent moment')} ⚑ — a labelled ${code('Play · 12:40')} button that does exactly what the play control on the poster does, ${b('and both are the same anchor')} ⚑, so the reader can act on either without the section growing a second behaviour. ${BOX_RULE}`,
  statesNote:`${b('The action follows the frame through every state')} ⚑: with the player loaded it is not redrawn as “Pause” — ${b('the provider’s own controls own playback once it is loaded')} ⚑, and a second set of transport controls beside them is two truths about one film. ${POSTER_RULE}`,
  extraTiles:[{
    label:'THE 1,080 COLLAPSE · A16’S NUMBER, CARRIED',
    body:[`${b('Two columns above 1,080, stacked below it')} ⚑ — A16·1’s break, carried verbatim, and one step earlier than the library’s 767 because a 480 text column and a 720 frame both stop working before 767.`,
      `${b('Stacked, the text goes above the frame')} ⚑ — never below it. The reader is being told what the film is; being told afterwards is a caption.`,
      `${b('Media side: Left is a DOM order swap, never')} ${code('order')} ⚑ — A17·12’s rule, so reading order and visual order agree at every width.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Split', n:2, sub:'The film beside its text.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Media side', ['Left', 'Right'], 1, `Which side the frame takes above 1,080. ${b('Stacked, the text is always first')} ⚑.`),
      K.seg('Columns', ['Even', 'Media-led'], 1, `588 + 588, or 480 + 720. ${b('Media-led is the default')} — the film is the thing.`),
      aspectRow(),
      K.seg('Action', ['Button', 'Text link', 'None'], 0, `${b('None leaves the poster’s own play control')} ⚑, which is always drawn — there is no value that removes it.`),
      metaRow()],
    videos:{ count:6, single:true },
    settles:[
      `${b('Six controls.')} Cut: an alignment value (the text is top-aligned to the frame at Even and centred at Media-led, which is arrangement rather than choice), a Plays value — ${b('this design has no theatre')} ⚑, because a 720 frame beside its own description is already the theatre — and a second action.`,
      `${b('The action and the poster’s control are one anchor, drawn twice')} ⚑. Tab reaches it once ⚑; the second drawing is ${code('aria-hidden')} and not focusable, which is A6·2’s rule for a repeated call to action.`,
      `${b('Nothing here is per-item.')} ${KEPT}`
    ]
  },
  tabletLabel:'834 · stacked · text above the frame',
  mobileLabel:'390 · stacked · action full width',
  respCap:'TABLET 834 AND MOBILE 390 · BOTH STACKED · THE COLLAPSE IS AT 1,080 ⚑',
  respNote:`split’s ladder with ${b('one departure')}: ${b('the collapse is at 1,080 rather than 767')} ⚑ — A16·1’s number, carried. ${b('1440')} text 480 + gap 96 + frame 720 × 405. ${b('1080–768')} stacked: text at the content box, frame beneath at the content box (754 × 424 at 834), padding 80. ${b('≤ 767')} the same stack at 350 × 197, ${b('the action full width at 44')} ⚑, heading 28, padding 64. ${b('Tablet is drawn because it differs')} — 834 is already the stacked arrangement, not a narrowed split.`,
  darkNote:`The accent action re-checks at ${code('#E0805A')} on ${code('#171511')} ⚑ — 7.1:1 with ${code('#171511')} text on it. ${b('The frame is unchanged in both modes')} ⚑. ${b('The hairline under the meta row is')} ${code('#332E27')}, and nothing else in this design carries a border.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The film in a 720 column with eyebrow, heading, description, a labelled play action and the meta line held in a 480 column beside it. Two columns above 1,080.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · page · one · right · a labelled play action beside the frame')}<br><span style="color:#6B6459">Media ${code('right')} at the default; Media side: Left swaps it and the tuple is written for the default, as A16·1’s is.</span>`),
    K.specRow(3, 'Archetype', `split. ${b('One departure')} — the collapse is at 1,080 rather than 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} 480 + 96 + 720, frame 720 × 405, action 44, padding 96. ${b('1080–768')} stacked, text first, frame at the content box, padding 80. ${b('≤ 767')} stacked at 350, action full width ⚑, heading 28, padding 64.`),
    K.specRow(5, 'Content fields', `The category’s four section strings and ${code('videos[]')} item 1, of which this design draws ${b('title through the heading')} — the section heading is the film’s name here unless the author types both ⚑ — plus ${code('description')}, ${code('duration')}, ${code('transcriptUrl')}, ${code('poster')}. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Media side ${b('Left · Right')} — Columns ${b('Even · Media-led')} — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Action ${b('Button · Text link · None')} — Meta ${b('Duration and transcript · Duration only · Off')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → as drawn. ${b('many')} → item 1 drawn, the rest kept ⚑. ${b('At Aspect 9:16')} the frame is 405 wide inside its 720 column and ${b('left-aligned within it, never stretched')} ⚑.`),
    K.specRow(8, 'Empty state', `No description → the text column is eyebrow, heading, action and meta, and closes up ⚑. ${b('No heading and no title')} → the design is not offered in the picker ⚑, because a split with an empty half is not this design. No poster → the plate. No duration → the action reads “Play” alone ⚑.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE + ` ${b('The action is inside the same anchor')}, so with JavaScript off it navigates to the watch page exactly as the poster does ⚑.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. The two halves are a flex row; ${b('Media side: Left is a DOM order swap, never')} ${code('order')} ⚑. ${b('The action and the poster control are one anchor drawn twice; only one is focusable')} ⚑. ${A11Y_TAIL} Accent action 4.6:1 light, 7.1:1 dark.<br>${b('Repeating items')} — as 1 Player: 1–24, this design draws item 1 and keeps the rest ⚑. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} the 1,080 collapse · text first when stacked · the one-anchor-drawn-twice rule · no theatre on this design · 9:16 left-aligned in its column.`)
  ]]
};

/* ── 3 · Panel ────────────────────────────────────────────────────────── */
const d3 = {
  n:3, name:'Panel', stateGround:'surface',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 3 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'The head, the film and the credit inside one surface plane with a hairline and the pack’s md shadow. The film sits at 960 within the plane’s 40 px padding; nothing inside is raised again.',
    'It is the section for a film dropped into a page that already has a ground of its own — a landing page, an about page — where the film needs to read as one block rather than as three loose things.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · PLANE 1,296 ON A HAIRLINE AND THE MD SHADOW · FRAME 960 × 540 INSIDE 40 PADDING',
  body(t, w) {
    const g = K.ground(t, 'surface');
    const pad = w === 1440 ? 40 : w === 834 ? 32 : 20;
    const fw = w === 1440 ? 960 : w === 834 ? 690 : 310;
    const inner = `<div style="background:${g.bg};border:1px solid ${g.border};border-radius:${g.r}px;${t.dark ? '' : `box-shadow:${t.shadow};`}padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column;gap:${w === 390 ? 24 : 32}px;align-items:center">
      ${K.headBlock(g, w, { align:'center', hSize:w === 1440 ? 34 : w === 834 ? 30 : 26, measure:w === 390 ? 310 : 560, max:700, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      <div style="display:flex;flex-direction:column;gap:12px;align-items:center;width:${fw}px">
        ${K.vframe(t, g, V1, { w:fw, aspect:'16:9' })}
        ${K.metaRow(g, V1, {})}</div>
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'surface');
    return `<div style="width:${box}px;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r}px;padding:20px;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;align-items:center">${K.vframe(t, g, V1, { w:420, aspect:'16:9', mode:o.mode })}${K.metaRow(g, V1, {})}</div>`;
  },
  tileMin:280,
  primaryNote:`A26·3 and A27·4’s surface plane, carried verbatim, with their call that ${b('a full-width fill is a ground rather than a containment')} ⚑ — which is why the tuple reads ${code('surface')} and not ${code('card')}. ${b('One raise, never two')} ⚑: the plane carries the shadow and the frame inside it carries none. ${b('The plate on a plane uses the plane’s stripe')}, one step lighter than the page’s, so a missing poster does not read as a hole ⚑.`,
  statesNote:`${b('The plane does not change with the frame’s state')} ⚑ — it does not darken behind a loaded player and does not grow when the notice is drawn. ${BOX_RULE} ${POSTER_RULE}`,
  extraTiles:[{
    label:'THE NEAREST DESIGNS, NAMED',
    body:[`${b('1 Player is this design without the plane')} ⚑ and 12 Embed Card is this frame in a hairline box with no fill. The tuple separates all three on ground and containment; the judgement that ${b('a plane lifts and a box marks')} is a designer’s, as A14 said of its own pair.`,
      `${b('Head: Above it moves the head onto the page ground')} and leaves the plane holding the film and its meta alone ⚑ — at which point this design and 1 Player differ by a fill, which is the rule working rather than a defect.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Panel', n:3, sub:'The film on a raised plane.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Head', ['Inside the plane', 'Above it'], 0, `Above it leaves the plane holding the film and the meta line ⚑.`),
      aspectRow(),
      K.seg('Alignment', ['Left', 'Centred'], 1, 'Head and meta together; the frame keeps its own width.'),
      metaRow(),
      playsRow()],
    videos:{ count:6, single:true },
    settles:[
      `${b('Six controls.')} Cut: a plane-padding value (40 · 32 · 20 by width, and a second padding control beside the section’s is the fastest way to make a plane look wrong), a shadow value (${b('the pack’s md shadow or nothing')} ⚑), and a plane-width value — the plane is the content box, always ⚑.`,
      `${b('The plane never goes edge to edge')} ⚑ — that is 4 Contrast Band’s job on an inverted ground and 5 Full Bleed’s on none at all, and both are named in the picker.`,
      `${b('Nothing here is per-item.')} ${KEPT}`
    ]
  },
  tabletLabel:'834 · plane 754 · padding 32 · frame 690 × 388',
  mobileLabel:'390 · plane 350 · padding 20 · frame 310 × 174',
  respCap:'TABLET 834 · TABLET IS DRAWN BECAUSE THE PLANE’S PADDING STEPS · MOBILE 390 · PLAY 44',
  respNote:`media frame’s ladder, no departures. ${b('1440')} plane 1,296, padding 40, frame 960 × 540, heading 34, section padding 96. ${b('834')} plane 754, padding 32, frame 690 × 388, heading 30, padding 80. ${b('≤ 767')} plane 350, padding 20, frame 310 × 174, ${b('play 44')}, heading 26, padding 64. ${b('The plane never goes edge to edge at any width')} ⚑ — it keeps the section’s side margin, which is what makes it read as a plane rather than as a band.`,
  darkNote:`Surface ${code('#211D17')} on ground ${code('#171511')}, hairline ${code('#332E27')}, ${b('and the shadow is dropped')} ⚑ — A26·3’s rule, carried: in dark mode a plane is a step in lightness rather than a shadow, because a warm shadow on a near-black ground is invisible and a heavy one is not the pack. ${b('The frame is unchanged')}.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'Head, film, meta line and credit inside one surface plane with a hairline and the md shadow; the film at 960 within 40 px of plane padding.'),
    K.specRow(2, 'Structural descriptor', `${code('media frame · none · surface · one · top · the film on a raised plane')}<br><span style="color:#6B6459">Ground ${code('surface')}, containment ${code('none')} — A26·3’s rule that a full-width fill is a ground. 12 Embed Card is the ${code('box')} case.</span>`),
    K.specRow(3, 'Archetype', 'media frame. No departures.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,296 · padding 40 · frame 960 × 540 · heading 34 · section padding 96. ${b('834')} plane 754 · padding 32 · frame 690 × 388 · heading 30 · padding 80. ${b('≤ 767')} plane 350 · padding 20 · frame 310 × 174 · play 44 · heading 26 · padding 64. ${b('The plane never bleeds')} ⚑.`),
    K.specRow(5, 'Content fields', `The category’s four section strings and ${code('videos[]')} item 1. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Head ${b('Inside the plane · Above it')} — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Alignment ${b('Left · Centred')} — Meta ${b('Duration and transcript · Duration only · Off')} — Plays ${b('In the frame · In a theatre')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → as drawn. ${b('many')} → item 1 drawn, the rest kept ⚑. At Head: Above it with no head authored, the plane holds the film alone and ${b('is identical to this design with every string empty')} ⚑ — stated rather than prevented.`),
    K.specRow(8, 'Empty state', `Absent strings close up inside the plane ⚑. ${b('The plane is drawn even when only the film is left')} ⚑ — it is the design. No poster → the plate on the plane’s stripe ⚑. No duration → no pill.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')} at 34 px — ${b('the size drops, the level does not')} ⚑. The plane is a ${code('&lt;div&gt;')} and carries no role; ${b('its hairline is decoration and measures 1.3:1')}, stated rather than corrected ⚑ (A14·4’s line). ${A11Y_TAIL}<br>${b('Repeating items')} — as 1 Player ⚑. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} the plane as ground rather than containment · one raise never two · the shadow dropped in dark · the plane never bleeding · the plate on the plane’s stripe.`)
  ]]
};

/* ── 4 · Contrast Band ────────────────────────────────────────────────── */
const d4 = {
  n:4, name:'Contrast Band', stateGround:'contrast',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 4 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'One film on a full-bleed inverted band, the head above it in the carried colour, the meta line beneath in the band’s muted step. The same arrangement as 1 Player on a different ground.',
    'It is the section for a film that has to interrupt the page — a trailer at the top of a landing page, the one film in a long article — where a change of ground does the work a bigger frame would otherwise have to.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · BAND FULL BLEED · INNER 1,296 · FRAME 960 × 540 · A17·7’S DERIVATION',
  body(t, w) {
    const g = K.ground(t, 'contrast');
    const gg = K.G(w);
    const fw = w === 1440 ? 960 : w === 834 ? 690 : 310;
    const inner = `<div style="background:${g.bg};padding:${gg.pad}px ${gg.m}px;box-sizing:border-box;display:flex;flex-direction:column;gap:${w === 390 ? 26 : 36}px;align-items:center;width:${w}px">
      ${K.headBlock(g, w, { align:'center', measure:w === 390 ? 310 : 560, max:700, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      <div style="display:flex;flex-direction:column;gap:12px;align-items:center;width:${fw}px">
        ${K.vframe(t, g, V1, { w:fw, aspect:'16:9' })}
        ${K.metaRow(g, V1, {})}</div>
      ${K.creditEl(g, {})}</div>`;
    return P.bandWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'contrast');
    return `<div style="width:${box}px;background:${g.bg};padding:20px;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;align-items:center">${K.vframe(t, g, V1, { w:420, aspect:'16:9', mode:o.mode })}${K.metaRow(g, V1, {})}</div>`;
  },
  tileMin:280,
  primaryNote:`A17·7’s on-contrast derivation, carried verbatim: the band is ${code('contrast')}, the text is the carried colour, ${b('muted is the carried colour at 72%')} and the hairline at 20% ⚑. ${b('The band has no padding of its own')} ⚑ — the section’s padding becomes the band’s, which is why the seam is drawn on the frame. ${b('The play control does not change on the band')} ⚑ — it sits on a photograph either way, and the photograph does not know what the band is doing.`,
  statesNote:`${b('The plate on the band is the inverted stripe')} ⚑ — A17·7’s derivation applied to A1’s placeholder, so a missing poster reads as part of the band rather than as a light hole punched in it. ${CONSENT}`,
  extraTiles:[{
    label:'NO ACCENT ON THIS DESIGN ⚑',
    body:[`${b('This is the one design in A15 with no accent anywhere')} ⚑. Paper’s accent measures ${b('4.0:1 on the band')} — A29·3’s finding — so the focus ring takes ${b('the carried colour with a 1 px dark outline')}, which holds against both the band and a bright poster.`,
      `${b('An action on the band would be a surface-filled button carrying the band’s colour')}, as A4·9 specified. ${b('This design does not draw one')}: the poster’s own control is the action, and a second one on an inverted ground is the place packs break first.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Contrast Band', n:4, sub:'The film on an inverted band.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Band edges', ['Full bleed', 'Page margin'], 0, `${b('Always full bleed at 390')} ⚑ — a band inset by 20 px on a phone reads as a mistake.`),
      aspectRow(),
      K.seg('Alignment', ['Left', 'Centred'], 1, 'Head and meta together.'),
      metaRow(),
      playsRow(`In a theatre over an inverted band uses ${b('the same ink wash as everywhere else')} ⚑ — the dialog does not re-tune to the band it was opened from.`)],
    videos:{ count:6, single:true },
    settles:[
      `${b('Six controls.')} Cut: a band-colour value (${b('it is the pack’s contrast token')} ⚑), an accent value (see the frame — there is no accent on this design), and a Width value: ${b('the frame is 960 inside the band’s 1,296')} and a wider film on an inverted ground stops being a band and becomes 5 Full Bleed.`,
      `${b('There is no Ground control')} ⚑ — A4·9’s line, carried: the ground is the design. Switching to 1 Player is how the page ground is chosen.`,
      `${b('Nothing here is per-item.')} ${KEPT}`
    ]
  },
  tabletLabel:'834 · band full bleed · frame 690 × 388',
  mobileLabel:'390 · band full bleed always ⚑ · frame 310 × 174',
  respCap:'TABLET 834 · MOBILE 390 · THE BAND IS FULL BLEED AT BOTH; ONLY THE FRAME NARROWS',
  respNote:`media frame’s ladder, no departures. ${b('1440')} band 1,440 wide, inner 1,296 on 72, frame 960 × 540, padding 96. ${b('834')} inner 754 on 40, frame 690 × 388, padding 80. ${b('≤ 767')} inner 350 on 20, frame 310 × 174, play 44, padding 64, ${b('Band edges: Page margin is ignored')} ⚑. ${b('The band’s padding is the section’s padding')} ⚑ at every width.`,
  darkNote:`${b('The band inverts again in dark mode')} ⚑ — contrast is ${code('#EDE7DA')} carrying ${code('#171511')}, so a section that is dark on a light page is light on a dark one. That is A17·7’s rule and the one thing about this design that surprises people. ${b('The frame, the play control and the duration pill are identical in both modes')} ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', '1 Player’s arrangement on a full-bleed inverted band: head in the carried colour, film at 960, meta line in the carried colour at 72%.'),
    K.specRow(2, 'Structural descriptor', `${code('media frame · none · contrast · one · top · the film on an inverted band')}<br><span style="color:#6B6459">Ground ${code('contrast')} is the whole difference from 1 Player, and this slot is what says so.</span>`),
    K.specRow(3, 'Archetype', 'media frame. No departures.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} band full bleed, inner 1,296 on 72, frame 960 × 540, padding 96. ${b('834')} inner 754 on 40, frame 690 × 388, padding 80. ${b('≤ 767')} inner 350 on 20, frame 310 × 174, play 44, padding 64, band always full bleed ⚑.`),
    K.specRow(5, 'Content fields', `The category’s four section strings and ${code('videos[]')} item 1. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Band edges ${b('Full bleed · Page margin')} — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Alignment ${b('Left · Centred')} — Meta ${b('Duration and transcript · Duration only · Off')} — Plays ${b('In the frame · In a theatre')}. Then the videos block. ${b('No Ground control')} ⚑.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → as drawn. ${b('many')} → item 1 drawn, the rest kept ⚑.`),
    K.specRow(8, 'Empty state', `Absent strings close up and the band keeps its padding ⚑ — a band that shrinks to the height of one frame is still a band. No poster → ${b('the inverted stripe')} ⚑.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('No accent anywhere')} ⚑ — Paper’s accent is 4.0:1 on the band (A29·3), so ${b('the focus ring is the carried colour with a 1 px dark outline')} ⚑, which holds on the band and on a bright poster. Carried text 13.4:1; muted at 72% measures 5.1:1 ⚑. ${b('Print: the band prints as 1 Player on white')} ⚑ — A17·7’s rule.<br>${b('Repeating items')} — as 1 Player ⚑. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} no accent on this design · the band’s padding being the section’s · full bleed forced at 390 · the band inverting again in dark mode · printing as 1 Player.`)
  ]]
};

/* ── 5 · Full Bleed ───────────────────────────────────────────────────── */
const d5 = {
  n:5, name:'Full Bleed', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 5 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'The film edge to edge at the viewport’s full width, square-cornered, with the head above it and the meta line beneath, both inside the page’s margins. The section has no ground of its own.',
    'It is the section for a film that is the page — a title sequence, an aerial, anything shot to be seen large — and the one design in A15 where the frame is bigger than the reading measure by design.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · FRAME 1,440 × 810 · SIDE PADDING 0 ⚑ · SQUARE CORNERS AT THE PAGE EDGE ⚑',
  body(t, w) {
    const g = K.ground(t, 'page');
    const gg = K.G(w);
    const head = `<div style="padding:0 ${gg.m}px"><div style="width:${gg.box}px">${K.headBlock(g, w, { measure:w === 390 ? 350 : 620, max:760, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}</div></div>`;
    const foot = `<div style="padding:0 ${gg.m}px"><div style="width:${gg.box}px;display:flex;flex-direction:column;gap:8px">${K.metaRow(g, V1, {})}${K.creditEl(g, {})}</div></div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 24 : 32}px">${head}${K.vframe(t, g, V1, { w, aspect:'16:9', r:0, playSize:w === 390 ? 44 : 88 })}${foot}</div>`;
    return P.bleedWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    return `<div style="width:${box}px;display:flex;flex-direction:column;gap:10px">${K.vframe(t, g, V1, { w:box, aspect:'16:9', r:0, mode:o.mode, playSize:56 })}<div style="padding:0 12px">${K.metaRow(g, V1, {})}</div></div>`;
  },
  miniBox:604, tileMin:400,
  primaryNote:`A14·9’s full-bleed rule, carried verbatim: ${b('vertical padding is kept and side padding is 0 at every width')} ⚑, and ${b('the radius token is dropped to 0 where the frame meets the page edge')} ⚑ — a rounded corner against the viewport edge reads as a mistake rather than as a pack. ${b('The play control grows to 88')} ⚑ here and nowhere else: 64 px in the middle of 1,440 is a full stop in a paragraph.`,
  statesNote:`${b('At this width the plate carries the provider and the film at 13 px and no larger')} ⚑ — a missing poster should look like a missing poster, not like a title card. ${BOX_RULE} ${b('810 px of reserved height is the strongest case for settlement 2 in the library')}: an embed that sized itself on load would move the entire page below it.`,
  extraTiles:[{
    label:'THE TWO DISABLED ASPECT VALUES ⚑',
    body:[`${b('1:1 and 9:16 are disabled at Width: Full')} ⚑, shown struck through with the reason — A9·8’s convention. A 1,440 square is 1,440 tall and a 9:16 frame at this width is 2,560: both are taller than the viewport they are drawn in, so the reader would never see one whole.`,
      `${b('They are offered again the moment the design is switched')} — 1 Player at Width: Content takes all four ⚑. The value is not removed from the section’s data, so switching back and forth loses nothing.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Full Bleed', n:5, sub:'The film at the page’s full width.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      aspectRow(`${b('1:1 and 9:16 are disabled at this width')} ⚑ with the reason shown — both are taller than the viewport at 1,440. A9·8’s convention.`, [2, 3]),
      K.seg('Head', ['Above the film', 'Below it', 'None'], 0, `${b('None leaves the film and the meta line')} ⚑ — the head is not deleted, it is not drawn.`),
      metaRow(),
      K.seg('Caption', ['Under the frame', 'Off'], 0, `The film’s own description, at 14 px in the page’s margins ⚑ — never over the film.`),
      playsRow(`${b('In a theatre is disabled here')} ⚑ — the frame is already larger than the dialog would be.`)],
    videos:{ count:6, single:true },
    settles:[
      `${b('Six controls.')} Cut: a height value (${b('the aspect is the height')} ⚑), a corner value (0 at the page edge, the token everywhere else, and both are structural), and a scrim value — ${b('nothing is drawn over this film')} ⚑; text over a poster is 6 Cover.`,
      `${b('This is the only design in A15 that ignores the content box')} ⚑. Everything else — head, meta, caption, credit — stays inside it, so the film is the one thing that crosses the margin.`,
      `${b('Nothing here is per-item.')} ${KEPT}`
    ]
  },
  tabletLabel:'834 · frame 834 × 469 · play 64',
  mobileLabel:'390 · frame 390 × 219 · play 44',
  respCap:'TABLET 834 · MOBILE 390 · THE FRAME IS ALWAYS THE VIEWPORT’S WIDTH; ONLY THE CONTROL STEPS',
  respNote:`media frame’s ladder, with ${b('one departure')}: ${b('side padding is 0 at every width')} ⚑, so the frame is the viewport. ${b('1440')} frame 1,440 × 810, play 88, head and meta on a 72 margin, padding 96. ${b('834')} frame 834 × 469, play 64, margin 40, padding 80. ${b('≤ 767')} frame 390 × 219, play 44, margin 20, padding 64. ${b('Corners are square at every width')} ⚑ and ${b('the aspect never changes')} ⚑.`,
  darkNote:`${b('Nothing about the frame changes')} ⚑ — it is the same 16:9 box on the same poster, and in dark mode the page around it is what re-tunes. This design is the clearest case in A15 of A14’s rule that ${b('dark mode is a property of the page and not of the pictures')} ⚑. The meta and credit take ${code('#A79E8F')}; the head takes ${code('#F2EDE4')}.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The film at the viewport’s full width, square-cornered, head above and meta beneath inside the page’s margins. The only design that crosses the content box.'),
    K.specRow(2, 'Structural descriptor', `${code('media frame · none · transparent · one · full-bleed · no margin at any width')}<br><span style="color:#6B6459">Ground ${code('transparent')} — the section paints no ground of its own and shows the page beneath it; the film supplies the only fill.</span>`),
    K.specRow(3, 'Archetype', `media frame. ${b('One departure')} — side padding 0 at every width ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} frame 1,440 × 810, play 88, head and meta on a 72 margin, padding 96. ${b('834')} frame 834 × 469, play 64, margin 40, padding 80. ${b('≤ 767')} frame 390 × 219, play 44, margin 20, padding 64. Corners square at every width ⚑.`),
    K.specRow(5, 'Content fields', `The category’s four section strings and ${code('videos[]')} item 1, ${code('description')} drawn as the caption. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Aspect ${b('16:9 · 4:3')} with ${b('1:1 and 9:16 disabled')} ⚑ — Head ${b('Above the film · Below it · None')} — Meta ${b('Duration and transcript · Duration only · Off')} — Caption ${b('Under the frame · Off')} — Plays ${b('In the frame')}, theatre disabled ⚑. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → as drawn. ${b('many')} → item 1 drawn, the rest kept ⚑; the panel names 8 Lead and Grid, which is this frame with the others under it.`),
    K.specRow(8, 'Empty state', `Head: None and every string empty → the film alone, edge to edge, with no text at all ⚑ — legitimate, and the shortest section in A15. No poster → the plate at the full width with its label at 13 px ⚑.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('The frame is 1,440 × 810 and the anchor is the whole of it')} ⚑; the accessible name is the title and duration. ${b('The focus ring is drawn inset by 4 px rather than outside')} ⚑ — A17·18’s rule where an element meets the page edge — so it is never clipped by the viewport. Meta 5.4:1.<br>${b('Repeating items')} — as 1 Player ⚑. ${ITEM_FIELDS}<br>${b('Flagged ⚑')} side padding 0 · square corners · play at 88 · two disabled aspect values · the theatre disabled · nothing drawn over the film.`)
  ]]
};

return [d1, d2, d3, d4, d5];
})();
