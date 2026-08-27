// A15 designs 11–15: Chapters · Embed Card · Thumb Rows · Slim Bar · Tabs.
globalThis.A15D3 = (function () {
const K = globalThis.A15LIB, P = globalThis.A15PAGE;
const { b, code, two, VIDEOS, VID, CHAPTERS } = K;
const V1 = VIDEOS[0];
const AUDIO = { n:1, title:'The estuary, read aloud', dur:'26:10', prov:'Soundcloud', blurb:'The written essay, read by its author, with the field recordings under it.' };

const NO_AUTOPLAY = `${b('Nothing autoplays anywhere in A15')} ⚑ — no design has an autoplay value and none has a muted-loop value.`;
const BOX_RULE = `${b('The box is reserved before anything loads')} ⚑ — poster, notice and player all sit inside one ${code('aspect-ratio')} box, so nothing moves when a film is played. Settlement 2.`;
const CONSENT = `${b('No third-party request is made until the reader acts')} ⚑ — settlement 3, and ${b('there is no “load with the page” value anywhere in A15')} ⚑.`;
const POSTER_RULE = `${b('The poster is the author’s uploaded image, and if there is none it is the plate')} ⚑ — ${b('never the provider’s own thumbnail')}.`;
const DATA_LINE = `${b('Nothing is read from Ghost’s content API')} ⚑ — the list is authored in the section; ${b('the provider is derived from the URL')} ⚑.`;
const ZERO = `${b('0 videos')} → ${b('the section does not render on the published page')} ⚑; in the editor it draws one paste field ⚑.`;
const A11Y_TAIL = `${b('The accessible name of every frame is its film’s title plus its duration')} ⚑, never “Play”. ${b('The 4 px accent ring sits 3 px outside the frame')}. Meta 5.4:1 light, 5.6:1 dark.`;
const ITEM_FIELDS = `${b('Inside an item')}: ${b('URL')} (req), ${b('title')} ≤ 70, ${b('description')} ≤ 160, ${b('poster')} image, ${b('duration')} ≤ 8, ${b('transcript link')} — everything but the URL optional ⚑. No title → the sidebar row shows the URL; no poster → the plate; no duration → no pill and the meta row closes up ⚑.`;
const LIST_RULE = `${b('Add takes one pasted URL and lands it last')} ⚑; Remove is on the row and undoable; ${b('drag reorders and authored order is drawn order')} ⚑; ${b('1–24')}, and Add is disabled at 24 with the reason shown.`;
const KEPT = `${b('This design draws the first film in the list and keeps the rest')} ⚑ — films 2–24 are stored, not deleted, and switching to 7 Grid draws them all again.`;

const padRow = K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.');
const aspectRow = (help, dis) => K.seg('Aspect', ['16:9', '4:3', '1:1', '9:16'], 0, help || `The box the frame reserves before anything loads ⚑. ${b('There is no “as the provider reports it” value')} ⚑ — settlement 2.`, dis);
const metaCtl = (active, help) => K.seg('Meta', ['Duration and transcript', 'Duration only', 'Off'], active === undefined ? 0 : active, help || `The 13 px line under the frame. ${b('Off never deletes the transcript link')} ⚑ — it stays in the item and in the theatre.`);

/* ── 11 · Chapters ────────────────────────────────────────────────────── */
const d11 = {
  n:11, name:'Chapters', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 11 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS AND CHAPTERS BLOCKS',
  paras:[
    'One film with its contents underneath: a ruled row per chapter, the timecode in mono at the left, each row a link that starts the film at that point.',
    'It is the section for a film long enough to be navigated — a recorded talk, a two-hour interview, a walkthrough — where the reader wants the six minutes that answer their question rather than the whole thing.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · FRAME 960 × 540 · FIVE CHAPTER ROWS AT 960 · TIMECODE COLUMN 52 MONO',
  body(t, w) {
    const g = K.ground(t, 'page');
    const fw = w === 1440 ? 960 : w === 834 ? 754 : 350;
    const rows = CHAPTERS.map((c, i) => K.chapterRow(g, c, { active:i === 0, size:w === 390 ? 15 : 16, tail:false })).join('');
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 26 : 36}px;align-items:center">
      ${K.headBlock(g, w, { align:'center', measure:w === 390 ? 350 : 620, max:760, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      <div style="width:${fw}px;display:flex;flex-direction:column;gap:14px">
        ${K.vframe(t, g, V1, { w:fw, aspect:'16:9' })}
        ${K.metaRow(g, V1, {})}
        <div style="display:flex;flex-direction:column;margin-top:6px;border-top:1px solid ${g.border}">
          <div style="display:flex;align-items:baseline;justify-content:space-between;padding:12px 0 4px"><span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">Chapters</span><span style="font-family:${K.MONO};font-size:11px;color:${g.muted}">05 · ${V1.dur} TOTAL</span></div>
          ${rows}</div></div>
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const fw = 340;
    return `<div style="width:${box}px;display:flex;gap:20px;align-items:flex-start">
      <div style="width:${fw}px">${K.vframe(t, g, V1, { w:fw, aspect:'16:9', mode:o.mode, playSize:48 })}</div>
      <div style="width:${box - fw - 20}px;display:flex;flex-direction:column;border-top:1px solid ${g.border}">${CHAPTERS.slice(0, 3).map((c, i) => K.chapterRow(g, c, { active:i === 0, size:13, pad:8, tail:false })).join('')}</div></div>`;
  },
  tileMin:220,
  primaryNote:`A9·15’s ledger row, carried verbatim, with a mono timecode in place of its label column: ${b('52 px for the timecode, the rest for the chapter')} ⚑, hairline between rows and none under the last. ${b('The current chapter is marked in')} ${code('text')} ${b('while the rest are')} ${code('text-muted')} ⚑ — a weight and colour step, never an accent fill, so the mark survives every pack. ${b('The total beside the head is the film’s own duration')}, not a sum of the chapters ⚑.`,
  statesNote:`${b('The chapter rows do not change with the frame’s state')} ⚑ — they are links before the player loads and links after it, and the row the reader chose is marked whether or not a player is running. ${BOX_RULE}`,
  extraTiles:[{
    label:'A FINDING FOR THE ARCHITECT ⚑',
    body:[`${b('Seeking a loaded player is behaviour no module in the registry covers.')} ${code('video-facade')} covers the swap from poster to player; nothing covers “tell the player already on the page to move to 5:03”.`,
      `${b('What this design does instead')} ⚑: every chapter row is a real ${code('&lt;a href&gt;')} to the canonical URL with the provider’s own time parameter on it. ${b('With no script it navigates and the film opens at that point')}; with the module running it loads the player at that start time. ${b('It never seeks a player that is already playing')} — it reloads the frame at the new point, which is one behaviour rather than two.`,
      `${b('Named plainly rather than solved')}: the closest module is ${code('video-facade')} and this design declares it. A registry addition is the architect’s call, not a name A15 may invent.`]
  }, {
    label:'THE CHAPTERS BLOCK · A SECOND REPEATING UNIT ⚑',
    body:[`${b('chapters[]')} is the only second list in A15 ⚑ — 1–24 rows, each ${b('time')} ≤ 8 characters and ${b('label')} ≤ 70, both required. ${b('Add appends a row carrying the film’s current position as its timecode')} ⚑ and “New chapter” as its label; Remove is on the row; ${b('drag reorders')}.`,
      `${b('Rows are drawn in authored order and never sorted')} ⚑. A timecode that runs backwards is marked with a warning dot in the sidebar and is published as typed — the editor does not know whether the author is wrong or the film is.`,
      `${b('At 0 chapters the list and its head are not drawn')} ⚑ and the section is 1 Player with a heading. ${b('At 1 the row is drawn alone')}, which is thin but legitimate: a single “00:00 Introduction” is a statement about the film.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE VIDEOS AND CHAPTERS BLOCKS',
    name:'Chapters', n:11, sub:'A film and its contents.', count:'SIX CONTROLS + TWO ITEM BLOCKS',
    rows:[padRow,
      aspectRow(),
      K.seg('Chapter list', ['Under the film', 'Beside it'], 0, `Beside it puts the rows in a 416 column to the right of an 856 frame above 1,080 ⚑, and returns them underneath below it.`),
      K.seg('Rules', ['Hairline', 'None'], 0, 'The line between rows. None leaves 8 px of space doing the same job.'),
      K.seg('Timecodes', ['Shown', 'Hidden'], 0, `${b('Hidden leaves the labels as a plain contents list')} ⚑ — the rows still carry their start times in the link.`),
      K.sel('Plays', 'In the frame', `${b('Locked')} ⚑ — a chapter row starts the film in the frame it points at; a theatre would open a second player beside the list.`, true)],
    videos:{ count:6, single:true, extra:`<div style="border-top:1px solid #E7E2DB;padding-top:13px;display:flex;flex-direction:column;gap:11px"><span style="font-family:${K.MONO};font-size:10px;letter-spacing:.06em;color:#6E6A64">THE CHAPTERS BLOCK · THIS DESIGN ONLY ⚑</span>${K.repeater({ label:'Chapters · 5', items:['00:00 · The first ferry of the day', '02:14 · Loading the crates at Cais…', '05:03 · Ana Reis on the bridge', '07:41 · The turn at Cacilhas'], add:'+ Add a chapter', help:`${b('1–24 rows')} ⚑, ${b('time')} and ${b('label')} both required. Added rows land last carrying “New chapter” ⚑. ${b('Never sorted')} ⚑ — a backwards timecode gets a warning dot and is published as typed.` })}</div>` },
    settles:[
      `${b('Six controls.')} Cut: a sort value (${b('authored order, always')} ⚑), a “jump to chapter on load” value, a numbering value — ${b('the timecode is the number')} ⚑ — and a chapter-thumbnail value: a still per chapter is twelve more images to upload and A14 already owns sets of stills.`,
      `${b('Nothing here is per-item.')} A chapter row cannot be emphasised, coloured or resized on its own ⚑; the current row is marked by where the reader is, not by a control.`,
      `${b('Two item blocks and six controls is the largest sidebar in A15')} ⚑. It is still six design controls: the lists are content, and content is never counted.`
    ]
  },
  tabletLabel:'834 · frame 754 × 424 · rows beneath at 754',
  mobileLabel:'390 · frame 350 × 197 · timecode column 52 unchanged ⚑',
  respCap:'TABLET 834 · MOBILE 390 · THE ROWS NARROW AND THE TIMECODE COLUMN DOES NOT',
  respNote:`table’s ladder with ${b('one departure')}: ${b('the timecode column stays at 52 px at every width')} ⚑ — it holds ${code('1:02:14')} at 13 px mono and a column that shrinks would wrap a timecode, which is the one thing in the row that must not wrap. ${b('1440')} frame 960 × 540, rows 960, label 16, padding 96. ${b('834')} frame 754 × 424, rows 754, padding 80. ${b('≤ 767')} frame 350 × 197, rows 350, label 15, play 44, padding 64. ${b('At Chapter list: Beside it the collapse is at 1,080')} ⚑ and the rows return underneath.`,
  darkNote:`Rows on ${code('#171511')} with hairlines at ${code('#332E27')}; the current chapter takes ${code('#F2EDE4')} and the rest ${code('#A79E8F')} at 5.6:1. ${b('The timecode is mono in both modes and never accent')} ⚑ — an accent timecode would read as a link colour, and every row here is already a link.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One film at 960 with a ruled contents list beneath it: mono timecode at the left, chapter label at the right, each row a link that starts the film at that point.'),
    K.specRow(2, 'Structural descriptor', `${code('table · none · page · many · top · timecoded rows under the player')}<br><span style="color:#6B6459">Count ${code('many')} counts the chapters, not the films — this design draws one film and its rows. The only ${code('table')} archetype in A15.</span>`),
    K.specRow(3, 'Archetype', `table. ${b('One departure')} — the timecode column does not narrow ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} frame 960 × 540 centred, rows 960, timecode 52, label 16, padding 96. ${b('834')} frame and rows 754, padding 80. ${b('≤ 767')} frame and rows 350, label 15, play 44, padding 64. ${b('At Chapter list: Beside it')} the split collapses at 1,080 ⚑.`),
    K.specRow(5, 'Content fields', `The four section strings, ${code('videos[]')} item 1, and ${code('chapters[]')} 1–24 with ${code('time')} ≤ 8 and ${code('label')} ≤ 70, ${b('both required')} ⚑. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Chapter list ${b('Under the film · Beside it')} — Rules ${b('Hairline · None')} — Timecodes ${b('Shown · Hidden')} — Plays ${b('locked at In the frame')} ⚑. Then the videos block and ${b('the chapters block')} ⚑.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('0 chapters')} → the list and its head are not drawn ⚑ and the section is 1 Player. ${b('1')} → one row, drawn. ${b('many')} → rows continue; ${b('the list does not scroll and the section grows')} ⚑. ${KEPT}`),
    K.specRow(8, 'Empty state', `Absent strings close up ⚑. ${b('A chapter with a label and no time is not publishable')} — both fields are required and the editor blocks the row rather than the section ⚑. No poster → the plate. ${b('The total beside the head is absent when the film has no typed duration')} ⚑.`),
    K.specRow(9, 'Behaviour module', `${code('video-facade')}, edit-safe: yes. ${b('No-JS, quoted:')} “${P.FACADE_QUOTE}” ${b('Every chapter row is also that anchor')}, with the provider’s time parameter on it ⚑, so with no script the contents list works and each row opens the film at its point. ${b('Finding ⚑: seeking a player already on the page is behaviour no module covers')} — named for the architect, closest module ${code('video-facade')}, and this design avoids needing it by reloading the frame at the new start time instead.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; “Chapters” is an ${code('h3')} ⚑. The list is an ${code('&lt;ol&gt;')} — ${b('ordered, because the order is the film')} ⚑ — of anchors whose accessible name is “${b('5 minutes 3 — Ana Reis on the bridge')}” ⚑, the timecode spoken rather than spelled. ${b('Each row is a 44 px target')} at every width ⚑. Current row 13.4:1; the rest 5.4:1. ${A11Y_TAIL}<br>${b('Repeating items')} — ${code('videos[]')}: ${LIST_RULE} ${code('chapters[]')}: 1–24, ${b('time and label both required')}, added rows land last ⚑, ${b('never sorted')} ⚑, drag reorders, Remove undoable. ${b('Inside a chapter the author edits its time and its label and nothing else')} ⚑.<br>${b('Flagged ⚑')} the fixed timecode column · rows never sorted · the seek finding · the locked Plays row · the total from the film rather than the chapters · the ${code('&lt;ol&gt;')}.`)
  ]]
};

/* ── 12 · Embed Card ──────────────────────────────────────────────────── */
const d12 = {
  n:12, name:'Embed Card', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 12 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'One embed inside a hairline box that names what it is and where it loads from, with the notice above the frame rather than on it. The design for everything that is not a film.',
    'It is the section for an audio episode, a map, a form, a data frame — the embeds a publication ends up with — and the place A15 says out loud what a third-party frame costs the reader.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · BOX 1,296 ON A HAIRLINE · LABEL ON THE TOP EDGE · AUDIO BAR AT 160 ⚑',
  body(t, w) {
    const g = K.ground(t, 'page');
    const box = K.G(w).box;
    const pad = w === 390 ? 16 : 24;
    const inner = box - pad * 2;
    const bar = `<span style="display:block;position:relative;width:${inner}px;height:${w === 390 ? 120 : 160}px;border-radius:${Math.min(g.r, 8)}px;background:${g.stripe};overflow:hidden;box-sizing:border-box">
      <span style="position:absolute;top:9px;left:11px;font-family:${K.MONO};font-size:10px;color:${g.muted}">EMBED · AUDIO BAR · 160 HIGH, NOT A RATIO ⚑</span>
      <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:14px">${K.playBtn(t, { size:48 })}<span style="display:flex;flex-direction:column;gap:6px"><span style="font-size:15px;font-weight:600;color:${g.text};font-family:${g.pack.body}">${AUDIO.title}</span><span style="font-size:13px;color:${g.muted};font-family:${g.pack.body}">${AUDIO.prov} · ${AUDIO.dur}</span></span></span></span>`;
    const label = `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px">
      <span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">Audio · ${AUDIO.prov}</span>
      <span style="font-size:13px;color:${g.muted};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px">Open on ${AUDIO.prov} ↗</span></div>`;
    const notice = `<span style="font-size:13px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">Nothing is requested from ${AUDIO.prov} until you press play. Playing it sets cookies in your browser.</span>`;
    const card = `<div style="width:${box}px;border:1px solid ${g.border};border-radius:${g.r}px;padding:${pad}px;box-sizing:border-box;display:flex;flex-direction:column;gap:${w === 390 ? 12 : 16}px">${label}${notice}${bar}<span style="font-size:14px;line-height:1.5;color:${g.muted};font-family:${g.pack.body};max-width:620px;text-wrap:pretty">${AUDIO.blurb}</span></div>`;
    const body = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 24 : 32}px">
      ${K.headBlock(g, w, { measure:w === 390 ? 350 : 560, eyebrowText:VID.eyebrow, headingText:'Listen to the essay instead', blurbText:false })}
      ${card}${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, body);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const inner = box - 32;
    if (o.shape === 'video') return `<div style="width:${box}px;border:1px solid ${g.border};border-radius:${g.r}px;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px"><span style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">Film · Vimeo</span>${K.vframe(t, g, VIDEOS[1], { w:inner, aspect:'16:9', playSize:48 })}</div>`;
    if (o.shape === 'map') return `<div style="width:${box}px;border:1px solid ${g.border};border-radius:${g.r}px;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px"><span style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">Map · OpenStreetMap</span><span style="display:block;position:relative;width:${inner}px;height:${Math.round(inner * 0.75)}px;border-radius:8px;background:${g.stripe};overflow:hidden"><span style="position:absolute;top:9px;left:11px;font-family:${K.MONO};font-size:10px;color:${g.muted}">EMBED · 4:3 · THE SAME BOX RULE ⚑</span><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:inline-flex;align-items:center;height:38px;padding:0 14px;border-radius:8px;background:${g.plane};border:1px solid ${g.border};font-size:13px;font-weight:600;color:${g.text};font-family:${g.pack.body}">Load the map</span></span></div>`;
    const barMode = o.mode === 'loaded'
      ? `<span style="display:block;width:${inner}px;height:120px;border-radius:8px;background:#0E0D0B;position:relative"><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px"><span style="font-family:${K.MONO};font-size:10px;color:rgba(251,249,245,.6)">SOUNDCLOUD IFRAME · 160 HIGH · SAME BOX ⚑</span><span style="width:240px;height:4px;border-radius:99px;background:rgba(251,249,245,.24)"></span></span></span>`
      : o.mode === 'consent'
      ? `<span style="display:block;position:relative;width:${inner}px;height:120px;border-radius:8px;background:${g.stripe};overflow:hidden"><span style="position:absolute;inset:0;background:rgba(35,32,25,.62);display:flex;align-items:center;justify-content:center;gap:12px;padding:14px;box-sizing:border-box"><span style="font-size:13px;color:#FBF9F5;font-family:${g.pack.body};max-width:280px">Loads from Soundcloud. Cookies may be set.</span><span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;background:#FBF9F5;color:#232019;font-size:13px;font-weight:600;font-family:${g.pack.body}">Load and play</span></span></span>`
      : `<span style="display:block;position:relative;width:${inner}px;height:120px;border-radius:8px;background:${g.stripe};overflow:hidden"><span style="position:absolute;top:9px;left:11px;font-family:${K.MONO};font-size:10px;color:${g.muted}">${o.mode === 'plate' ? 'NO ARTWORK · THE BOX IS HELD ⚑' : 'EMBED · AUDIO BAR'}</span><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:12px">${K.playBtn(t, { size:40 })}<span style="font-size:14px;font-weight:600;color:${g.text};font-family:${g.pack.body}">${AUDIO.title}</span></span></span>`;
    return `<div style="width:${box}px;border:1px solid ${g.border};border-radius:${g.r}px;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px"><span style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">Audio · Soundcloud</span>${barMode}</div>`;
  },
  tileMin:200,
  counts:[
    { shape:'video', label:'THE SAME BOX AT 16:9 · A FILM IN THE CARD ⚑' },
    { shape:'map', label:'THE SAME BOX AT 4:3 · A MAP, AND ITS OWN LOAD ACTION ⚑' }
  ],
  primaryNote:`${b('The box is a hairline and nothing else')} ⚑ — no fill, no shadow — which is what separates it from 3 Panel’s raised plane; A14·15’s call, carried. ${b('The label sits inside the top edge and names the kind and the provider')} ⚑: “Audio · Soundcloud”, “Film · Vimeo”, “Map · OpenStreetMap”. ${b('The notice is above the frame here rather than on it')} ⚑ — this is the one design whose job is to say what the embed costs, so it is read before the reader acts rather than at the moment they do.`,
  statesNote:`${b('Shape: Audio bar is a height, not a ratio')} ⚑ — 160 px at 1440 and 834, 120 at 390 — because an audio player has no aspect and reserving 16:9 for one would leave a hole. ${b('Everything else in A15 reserves a ratio')}; this is the one exception and it is a control value, not a hidden case. ${CONSENT}`,
  extraTiles:[{
    label:'A SECOND FINDING FOR THE ARCHITECT ⚑',
    body:[`${b('The registry has no facade module for a non-video embed.')} ${code('video-facade')}’s degradation is written in terms of a poster and a watch page: “${P.FACADE_QUOTE}”`,
      `${b('This design declares')} ${code('video-facade')} ${b('anyway')} ⚑ and reads it as: ${b('the frame is an')} ${code('&lt;a href&gt;')} ${b('to the embed’s canonical page')} — the episode on Soundcloud, the location on OpenStreetMap — ${b('so with no script the reader gets there in one navigation')}. Nothing is lost but the in-page frame.`,
      `${b('Named plainly rather than solved')}: a general ${code('embed-facade')} is the architect’s call. ${b('A15 does not invent one')}, and no design in the library gets an ${code('M-')}prefixed alias.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Embed Card', n:12, sub:'One embed, in a box that names it.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Shape', ['16:9', '4:3', '1:1', 'Audio bar'], 3, `${b('Audio bar is a height rather than a ratio')} ⚑ — 160 px, the only such value in A15.`),
      K.seg('Label', ['Kind and provider', 'Custom', 'Off'], 0, `“Audio · Soundcloud”, or the author’s own words. ${b('Off removes the label and not the notice')} ⚑.`),
      K.seg('Notice', ['Above the frame', 'On the frame'], 0, `${b('There is no Off')} ⚑ — a click-to-load frame that does not say what it loads is a button with a secret.`),
      K.seg('Open link', ['Shown', 'Hidden'], 0, 'The “Open on Soundcloud ↗” link at the label’s right.'),
      metaCtl(1, `Drawn under the frame. ${b('An audio embed has no transcript link by convention')} ⚑ and the value is still offered — some do.`)],
    videos:{ count:6, single:true },
    settles:[
      `${b('Six controls.')} Cut: a fill value (${b('a filled box is 3 Panel')} ⚑), a border-weight value (hairlines, never heavy borders), a corner value, and a provider-allowlist value — ${b('which providers a site permits is a theme setting, not a section control')} ⚑, and A31’s territory.`,
      `${b('This is the only design in A15 whose primary frame is not a film')} ⚑. Everything else in the category assumes a poster and a duration; this one assumes neither, which is why it exists.`,
      `${b('Nothing here is per-item.')} ${KEPT}`
    ]
  },
  tabletLabel:'834 · box 754 · bar 160 unchanged',
  mobileLabel:'390 · box 350 · bar 120 ⚑',
  respCap:'TABLET 834 · THE BOX NARROWS · MOBILE 390 · THE BAR DROPS TO 120 AND THE LABEL WRAPS',
  respNote:`media frame’s ladder with ${b('one departure')}: ${b('the audio bar drops from 160 to 120 at ≤ 767')} ⚑ — the only element in A15 whose reserved height changes with the width, because it is a height rather than a ratio and 160 px of a 219 px viewport row is too much. ${b('1440')} box 1,296, padding 24, bar 160, label 13. ${b('834')} box 754, padding 24, bar 160, padding 80. ${b('≤ 767')} box 350, padding 16, bar 120, ${b('the label and the open link stack')} ⚑, padding 64. ${b('At Shape: 16:9 the frame narrows like every other frame in the category')}.`,
  darkNote:`Hairline ${code('#332E27')} on ground ${code('#171511')} — ${b('the box is a line in both modes and never becomes a fill')} ⚑. The notice takes ${code('#A79E8F')} at 5.6:1, which is the smallest text in the design and the one that most has to be read.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One embed in a hairline box whose top edge names the kind and the provider, with the click-to-load notice above the frame and the description beneath it.'),
    K.specRow(2, 'Structural descriptor', `${code('media frame · box · page · one · inline · a bordered embed naming its provider')}<br><span style="color:#6B6459">Containment ${code('box')} — the only design in A15 where the section itself sits in one. Media ${code('inline')}: the frame is laid into the box with the label and the notice rather than sitting above its own text.</span>`),
    K.specRow(3, 'Archetype', `media frame. ${b('One departure')} — the audio bar’s height changes at ≤ 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} box 1,296, padding 24, bar 160, label 13 uppercase, notice 13. ${b('834')} box 754, bar 160, padding 80. ${b('≤ 767')} box 350, padding 16, bar 120 ⚑, label and open link stacked, padding 64.`),
    K.specRow(5, 'Content fields', `The four section strings, ${code('embedKind')} ≤ 20 and ${code('embedLabel')} ≤ 32 (both optional, defaults derived) ⚑, and ${code('videos[]')} item 1 — ${b('where an item may be any embed the provider list allows')} ⚑, not only a film. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Shape ${b('16:9 · 4:3 · 1:1 · Audio bar')} — Label ${b('Kind and provider · Custom · Off')} — Notice ${b('Above the frame · On the frame')}, ${b('no Off')} ⚑ — Open link ${b('Shown · Hidden')} — Meta ${b('Duration and transcript · Duration only · Off')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${b('The provider is derived from the URL')} and the kind from the provider ⚑. ${ZERO} ${b('An unrecognised provider')} → the box is drawn, the label reads the domain, and ${b('the frame is a link rather than an embed')} ⚑ — nothing is put in an iframe that the theme cannot name. ${KEPT}`),
    K.specRow(8, 'Empty state', `No description → the box closes up under the frame ⚑. No artwork on an audio embed → the bar is drawn with its title and provider, ${b('which is the plate for this shape')} ⚑. ${b('No URL')} → the design is not offered in the picker.`),
    K.specRow(9, 'Behaviour module', `${code('video-facade')}, edit-safe: yes. ${b('No-JS, quoted:')} “${P.FACADE_QUOTE}” ${b('Read here as the embed’s canonical page')} ⚑ — the episode, the map location — ${b('and the finding is stated rather than solved')} ⚑: the registry has no facade for a non-video embed and naming one is the architect’s call.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; the label is a ${code('&lt;p&gt;')} and not a heading ⚑ — it names a thing, it does not open a section. ${b('The notice is inside the same')} ${code('&lt;figure&gt;')} ${b('as the frame')} and is read before it ⚑. The load action is a 44 px target. ${b('An iframe that does load carries a')} ${code('title')} ${b('naming the embed')} ⚑ — “The estuary, read aloud, on Soundcloud”. Notice 5.4:1. ${A11Y_TAIL}<br>${b('Repeating items')} — ${LIST_RULE} This design is designed for 1 ⚑.<br>${b('Flagged ⚑')} the audio bar as a height · the notice with no Off value · the unrecognised-provider fallback · the non-video facade finding · box rather than plane.`)
  ]]
};

/* ── 13 · Thumb Rows ──────────────────────────────────────────────────── */
const d13 = {
  n:13, name:'Thumb Rows', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 13 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'One film a row: a 320 poster at the left, the title, the description and the meta line at the right, a hairline between rows. The set is read rather than scanned.',
    'It is the section for three or four films that each need explaining — a documentary strand, a set of lectures — where a grid cell would leave the description with nowhere to go.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THUMB 320 × 180 · TEXT 944 · HAIRLINE BETWEEN ROWS · THREE ROWS DRAWN',
  body(t, w) {
    const g = K.ground(t, 'page');
    const box = K.G(w).box;
    const stacked = w === 390;
    const tw = w === 1440 ? 320 : 260;
    const gp = w === 1440 ? 32 : 24;
    const row = (v, i) => `<div style="display:flex;${stacked ? 'flex-direction:column;gap:14px;' : `gap:${gp}px;`}padding:${i === 0 ? 0 : (stacked ? 24 : 28)}px 0 ${stacked ? 24 : 28}px;${i === 2 ? '' : `border-bottom:1px solid ${g.border};`}align-items:${stacked ? 'stretch' : 'flex-start'}">
      ${K.vframe(t, g, v, { w:stacked ? box : tw, aspect:'16:9', playSize:44 })}
      <div style="display:flex;flex-direction:column;gap:8px;${stacked ? '' : `width:${box - tw - gp}px;`}">
        ${K.titleEl(g, v, { head:true, size:w === 1440 ? 24 : w === 834 ? 21 : 20, max:640 })}
        ${K.captionEl(g, v.blurb, { max:640, size:15 })}
        ${K.metaRow(g, v, { prov:true })}</div></div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${stacked ? 24 : 36}px">
      ${K.headBlock(g, w, { measure:stacked ? 350 : 560, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      <div style="display:flex;flex-direction:column;width:${box}px">${K.take(3).map(row).join('')}</div>
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const tw = 200, gp = 16;
    const n = o.n || 2;
    return `<div style="width:${box}px;display:flex;flex-direction:column">${K.take(n).map((v, i) => `<div style="display:flex;gap:${gp}px;padding:${i === 0 ? 0 : 14}px 0 14px;${i === n - 1 ? '' : `border-bottom:1px solid ${g.border};`}align-items:flex-start">
      ${K.vframe(t, g, v, { w:tw, aspect:'16:9', mode:i === 0 ? o.mode : 'poster', playSize:40 })}
      <div style="display:flex;flex-direction:column;gap:6px;width:${box - tw - gp}px">${K.titleEl(g, v, { head:true, size:17 })}${K.captionEl(g, v.blurb, { size:13 })}</div></div>`).join('')}</div>`;
  },
  tileMin:240,
  counts:[{ n:1, label:'ONE FILM · ONE ROW, NO RULE ⚑ · MINIATURE AT 604' }],
  primaryNote:`A18·2’s thumb row at a film’s size: ${b('320 × 180 beside a 944 text column')} ⚑, with A9·15’s hairline between rows and none under the last. ${b('This is the only design in A15 that draws the description')} ⚑ — 15 px in ${code('text-muted')}, clamped to three lines — which is what the row exists for. ${b('The meta line carries the provider here')} ⚑: a strand where one film is a file and another is on Vimeo is exactly the set that needs telling.`,
  statesNote:`${b('A row holds its height when its film is playing')} ⚑ — the poster and the player are the same 320 × 180 box, so the rows below do not move. ${b('One player at a time')} ⚑, as in 7 Grid. ${POSTER_RULE}`,
  extraTiles:[{
    label:'THE UGLY TEST · A 90-CHARACTER TITLE AND NO DESCRIPTION',
    body:[`${b('The title wraps to three lines at 640 and the row grows')} ⚑; the thumbnail stays at 320 × 180 and top-aligns, and nothing is truncated. A15 does not clamp a title in a row — only in a grid cell, where the cells must share a height.`,
      `${b('With no description the row is title and meta')} ⚑ and closes to about 120 px; with no title it is the description alone, which reads badly and is stated rather than prevented.`,
      `${b('At Thumb size: Large the text column is 864')} and the same rules hold. The row never drops below the thumbnail’s own height ⚑ — a 180 px poster beside 40 px of text is a row with a hole in it, and the empty space is left rather than filled.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Thumb Rows', n:13, sub:'One film a row.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Thumb side', ['Left', 'Right'], 0, `${b('Stacked at 390 the poster is always first')} ⚑.`),
      K.seg('Thumb size', ['Small', 'Medium', 'Large'], 1, '240 · 320 · 400 at 1440; 200 · 260 · 300 at 834.'),
      K.seg('Rules', ['Hairline', 'None'], 0, 'The line between rows; None leaves 40 px of space instead.'),
      K.seg('Description', ['Shown', 'Hidden'], 0, `${b('Hidden leaves title and meta')} ⚑ — at which point 7 Grid holds more films in the same height, and the panel says so.`),
      K.seg('Meta', ['Duration and transcript', 'Duration and provider', 'Off'], 1, 'The 13 px line under the description.')],
    videos:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: an alignment value (${b('the text top-aligns to the poster, always')} ⚑ — centring a two-line row against a 180 px poster leaves it floating), a per-row size value, and a Plays value: ${b('this design plays in the frame')} ⚑, because the frame is 320 px and a theatre is the better film — which is 14 Slim Bar’s answer, and the panel names it.`,
      `${b('Nothing here is per-item.')} A control writes one value onto the section ⚑.`,
      `${b('Designed for 2–6 films')} ⚑. At 1 the row is drawn with no rule ⚑; above 6 the rows continue and the section is long, which is legitimate for a strand page and thin for a landing page.`
    ]
  },
  tabletLabel:'834 · thumb 260 × 146 · text 470',
  mobileLabel:'390 · stacked · poster full width above the text ⚑',
  respCap:'TABLET 834 · THE ROW HOLDS · MOBILE 390 · THE ROW STACKS AND THE POSTER GOES FIRST ⚑',
  respNote:`stack’s ladder with ${b('one departure')}: ${b('at ≤ 767 the row stacks and the poster takes the full width')} ⚑ — a 120 px thumbnail beside two lines of text is A18·3’s slim row, which is a different design. ${b('1440')} thumb 320 × 180, gap 32, text 944, title 24, rules on. ${b('834')} thumb 260 × 146, gap 24, text 470, title 21, padding 80. ${b('≤ 767')} poster 350 × 197 above the text, title 20, description 15, play 44, padding 64, ${b('the rule between rows kept')} ⚑.`,
  darkNote:`Hairlines ${code('#332E27')}; titles ${code('#F2EDE4')}; descriptions and meta ${code('#A79E8F')} at 5.6:1. ${b('The rows are the only structure in this design')} — there is no fill, no card and no plane in either mode ⚑, which is what keeps a set of six from reading as six boxes.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One film a row: a 320 × 180 poster at the left, title, description and meta line at the right, a hairline between rows. The only design that draws the description.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · page · few · left · a ruled row per film')}<br><span style="color:#6B6459">Count ${code('few')} — written for two to six rows. 7 Grid is the ${code('many')} case on the same ground.</span>`),
    K.specRow(3, 'Archetype', `stack. ${b('One departure')} — the row stacks and the poster takes the full width at ≤ 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} thumb 320 × 180, gap 32, text 944, title 24, description 15, meta 13. ${b('834')} thumb 260 × 146, gap 24, text 470, title 21, padding 80. ${b('≤ 767')} stacked, poster 350 × 197 first, title 20, play 44, padding 64.`),
    K.specRow(5, 'Content fields', `The four section strings and ${code('videos[]')} 1–24, all drawn, ${b('with description drawn here and nowhere else')} ⚑. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Thumb side ${b('Left · Right')} — Thumb size ${b('Small · Medium · Large')} — Rules ${b('Hairline · None')} — Description ${b('Shown · Hidden')} — Meta ${b('Duration and transcript · Duration and provider · Off')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one row, no rule ⚑. ${b('many')} → rows continue in authored order; ${b('nothing is paged')} ⚑ — ${code('load-more')} counts a query and there is none here. ${b('Designed for 2–6')} ⚑.`),
    K.specRow(8, 'Empty state', `${b('No description → the row is title and meta and closes up')} ⚑. No title → the description alone, which reads badly and is stated rather than prevented ⚑. No poster → the plate at 320 × 180 ⚑. ${b('The row never drops below the poster’s height')} ⚑ and the space is left empty.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE + ` ${b('One player at a time across the rows')} ⚑.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; the rows are a ${code('&lt;ul&gt;')} and each title is inside its anchor ⚑ — ${b('the title is not a heading')}, because a list of six ${code('h3')}s would put the strand into the document outline twice. ${b('The poster and the title are one anchor')} ⚑, so the row has one tab stop. ${A11Y_TAIL}<br>${b('Repeating items')} — ${LIST_RULE} ${ITEM_FIELDS}<br>${b('Flagged ⚑')} the description drawn only here · the poster first when stacked · one player at a time · the row never shorter than its poster · titles not headings.`)
  ]]
};

/* ── 14 · Slim Bar ────────────────────────────────────────────────────── */
const d14 = {
  n:14, name:'Slim Bar', stateGround:'surface',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 14 OF 15 · PAPER PACK · FIVE CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'One line on a surface plane: a 96 px thumbnail, the film’s title, its duration, and a watch action at the right. The film opens in the theatre; the page it interrupts is barely interrupted.',
    'It is the section for a film that is an aside — “there is a film of this”, halfway down an article — where a 960 px frame would stop the reader for something they may not want.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · BAR 1,296 × 88 ON THE SURFACE PLANE · THUMB 96 × 54 · ACTION AT THE RIGHT',
  body(t, w) {
    const g = K.ground(t, 'surface');
    const box = K.G(w).box;
    const stacked = w === 390;
    const action = `<span style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:${Math.min(g.r, 8)}px;background:${g.btnBg};color:${g.btnText};font-size:14px;font-weight:600;font-family:${g.pack.body};flex-shrink:0;${stacked ? 'justify-content:center;' : ''}"><span style="font-size:11px">▶</span>Watch · ${V1.dur}</span>`;
    const thumb = `<span style="position:relative;width:96px;height:54px;border-radius:${Math.min(g.r, 6)}px;background:${g.stripe};flex-shrink:0;display:block"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${K.playBtn(t, { size:28 })}</span></span>`;
    const text = `<span style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1">
      <span style="font-size:${stacked ? 16 : 17}px;font-weight:600;line-height:1.35;color:${g.text};font-family:${g.pack.body};text-wrap:pretty">${V1.title}</span>
      <span style="font-size:13px;color:${g.muted};font-family:${g.pack.body}">${VID.eyebrow} · ${V1.dur} · ${V1.prov}</span></span>`;
    const bar = `<div style="width:${box}px;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r}px;${t.dark ? '' : `box-shadow:${t.sm};`}padding:${stacked ? '16px' : '16px 20px'};box-sizing:border-box;display:flex;${stacked ? 'flex-direction:column;gap:14px;' : 'align-items:center;gap:16px;'}">
      ${stacked ? `<div style="display:flex;align-items:center;gap:12px">${thumb}${text}</div>${action}` : `${thumb}${text}${action}`}</div>`;
    return P.stdWrap(t, w, bar);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'surface');
    if (o.mode === 'loaded') return `<div style="width:${box}px;display:flex;flex-direction:column;gap:10px">${K.theatreEl(t, { w:box, h:250, counter:'01 / 06' })}<span style="font-size:11.5px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">${'The bar always plays in the theatre ⚑ — an 88 px row has nowhere to put a player, and the transcript link travels into the dialog with it.'}</span></div>`;
    const thumb = o.mode === 'plate'
      ? `<span style="position:relative;width:96px;height:54px;border-radius:6px;background:${g.stripe};flex-shrink:0;display:block"><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:${K.MONO};font-size:9px;color:${g.muted}">NO POSTER</span></span>`
      : `<span style="position:relative;width:96px;height:54px;border-radius:6px;background:${g.stripe};flex-shrink:0;display:block"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${K.playBtn(t, { size:28 })}</span></span>`;
    const notice = o.mode === 'consent' ? `<span style="font-size:12px;color:${g.muted};font-family:${g.pack.body};padding-left:112px">Opens a player that loads from YouTube. Cookies may be set. ⚑</span>` : '';
    return `<div style="width:${box}px;display:flex;flex-direction:column;gap:8px"><div style="width:${box}px;background:${g.bg};border:1px solid ${g.border};border-radius:${g.r}px;padding:14px 16px;box-sizing:border-box;display:flex;align-items:center;gap:14px">${thumb}
      <span style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0"><span style="font-size:15px;font-weight:600;color:${g.text};font-family:${g.pack.body}">${V1.title}</span><span style="font-size:12px;color:${g.muted};font-family:${g.pack.body}">Watch · ${V1.dur} · ${V1.prov}</span></span>
      <span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;background:${g.btnBg};color:${g.btnText};font-size:13px;font-weight:600;font-family:${g.pack.body}">Watch</span></div>${notice}</div>`;
  },
  tileMin:150,
  primaryNote:`A16·9 and A2·1’s bar, carried: ${b('one line, 88 px high, on the surface plane with a hairline and the sm shadow')} ⚑. ${b('The thumbnail is 96 × 54 — the queue row’s thumbnail from 10 Playlist, verbatim')} ⚑. ${b('The action carries the accent')} and is the one accent in the design. ${b('The transcript link is not drawn on the bar')} ⚑ — there is no room for it, and it travels into the theatre, which is the promise 1 Player’s settlement 4 makes for exactly this case.`,
  statesNote:`${b('The bar has no loaded state')} ⚑ — it always opens the theatre, at every width, because an 88 px row has nowhere to put a player. It is the one design in A15 where ${b('Plays: In a theatre survives 390')} ⚑, and the reason is that the alternative is not a smaller player but no player at all. ${CONSENT} — and the notice is a line under the bar rather than a wash over a thumbnail this small ⚑.`,
  extraTiles:[{
    label:'FIVE CONTROLS, AND WHY',
    body:[`${b('Five, not six')} ⚑ — there is no Aspect row. ${b('The thumbnail is 16:9 and nothing else')}: a 9:16 thumbnail in an 88 px bar is 50 px wide and reads as an icon.`,
      `${b('And no Plays row')} ⚑ — see the states. ${b('A15’s working norm is six controls and the ceiling is seven')}; five is what this design needs, and a sixth would be a control invented to reach a number.`,
      `${b('The bar is the shortest section in A15')} at 88 px plus its padding, and ${b('at Padding: Compact it is 216 px tall in total')} ⚑ — which is the number that matters when it sits between two paragraphs of an article.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · FIVE CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Slim Bar', n:14, sub:'One line, one film.', count:'FIVE CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      K.seg('Thumbnail', ['Shown', 'Hidden'], 0, `Hidden leaves the title, the meta and the action ⚑ — the bar then reads as A2·1’s announcement rule with a play action on it.`),
      K.seg('Action', ['Button', 'Text link'], 0, `Button carries the accent; Text link is the muted “Watch · 12:40 ↗” ⚑ for a bar that should not shout.`),
      K.seg('Meta', ['Duration and provider', 'Duration only', 'Off'], 0, `The 13 px line under the title. ${b('The transcript link is never drawn here')} ⚑ — it is in the theatre.`),
      K.seg('Edges', ['Content box', 'Full bleed'], 0, `Full bleed runs the bar to the page edges and drops its radius ⚑, as 5 Full Bleed does.`)],
    videos:{ count:6, single:true },
    settles:[
      `${b('Five controls')} ⚑ — the working norm is six and this design does not need a sixth. See the frame for the two that were cut.`,
      `${b('Nothing here is per-item.')} ${KEPT}`,
      `${b('The nearest designs, named')}: 2 Split is this film with room to explain it, and 12 Embed Card is this film in a box that says where it loads from. ${b('This one assumes the reader already knows why they might want it')} ⚑.`
    ]
  },
  tabletLabel:'834 · bar 754 × 88 · unchanged',
  mobileLabel:'390 · two rows ⚑ · action full width',
  respCap:'TABLET 834 · THE BAR HOLDS ITS LINE · MOBILE 390 · IT BECOMES TWO ROWS ⚑',
  respNote:`bar’s ladder with ${b('one departure')}: ${b('at ≤ 767 the bar becomes two rows')} ⚑ — thumbnail and title on the first, the action full width at 44 on the second. A 96 px thumbnail, a two-line title and a 140 px button do not fit in 318 px, and shrinking the action below 44 is the one thing that cannot be done. ${b('1440')} bar 1,296 × 88, thumb 96 × 54, title 17, action 44. ${b('834')} bar 754 × 88, unchanged. ${b('≤ 767')} bar 350, two rows, title 16, ${b('action full width')} ⚑, padding 64.`,
  darkNote:`Plane ${code('#211D17')}, hairline ${code('#332E27')}, ${b('the sm shadow dropped')} ⚑ as everywhere in dark. The accent action re-checks at ${code('#E0805A')} carrying ${code('#171511')} — 7.1:1. ${b('The 96 px thumbnail is unchanged')}, as every poster in A15 is.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One 88 px line on a surface plane: a 96 × 54 thumbnail, the title, a meta line and a watch action at the right. Opens the theatre at every width.'),
    K.specRow(2, 'Structural descriptor', `${code('bar · none · surface · one · left · one line, the film summoned')}<br><span style="color:#6B6459">The only ${code('bar')} archetype in A15. Media ${code('left')}: the thumbnail leads the line rather than sitting above it.</span>`),
    K.specRow(3, 'Archetype', `bar. ${b('One departure')} — two rows at ≤ 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} bar 1,296 × 88, thumb 96 × 54, title 17, meta 13, action 44 at the right. ${b('834')} bar 754 × 88, unchanged, padding 80. ${b('≤ 767')} bar 350 in two rows, action full width ⚑, title 16, padding 64.`),
    K.specRow(5, 'Content fields', `The four section strings — ${b('heading and blurb are stored and not drawn')} ⚑, the eyebrow is drawn in the meta line — and ${code('videos[]')} item 1. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Thumbnail ${b('Shown · Hidden')} — Action ${b('Button · Text link')} — Meta ${b('Duration and provider · Duration only · Off')} — Edges ${b('Content box · Full bleed')}. ${b('Five')} ⚑. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → as drawn. ${b('many')} → item 1 drawn, the rest kept ⚑; the panel names 13 Thumb Rows. ${b('No duration')} → the action reads “Watch” alone ⚑.`),
    K.specRow(8, 'Empty state', `No title → ${b('the section does not render')} ⚑ — a bar with a thumbnail, a duration and no name is a button that says nothing. No poster → the thumbnail is the plate at 96 × 54, ${b('too small for text and drawn plain')} ⚑.`),
    K.specRow(9, 'Behaviour module', P.FACADE_LINE + ` ${b('Here the anchor always opens the theatre')} ⚑ — there is no in-frame value — ${b('and with JavaScript off it navigates to the watch page')}, which is the same one-navigation outcome as everywhere else in A15.`),
    K.specRow(10, 'Accessibility', `${b('No heading is drawn')} ⚑ — the section is a ${code('&lt;figure&gt;')} with an ${code('aria-label')} from the film’s title, so it is announced without adding an ${code('h2')} to an article’s outline halfway down ⚑. ${b('The whole bar is the anchor')}, 1,296 × 88, and the action inside it is drawn rather than focusable ⚑. Accent action 4.6:1 light, 7.1:1 dark. Title 13.4:1.<br>${b('Repeating items')} — ${LIST_RULE} This design is designed for 1 ⚑.<br>${b('Flagged ⚑')} five controls · no aspect row · the theatre at every width including 390 · no heading in the outline · the transcript link only in the theatre · two rows at 390.`)
  ]]
};

/* ── 15 · Tabs ────────────────────────────────────────────────────────── */
const d15 = {
  n:15, name:'Tabs', stateGround:'page',
  rail:'A15 VIDEO AND EMBEDS · DESIGN 15 OF 15 · PAPER PACK · SIX CONTROLS + THE VIDEOS BLOCK',
  paras:[
    'One frame shared by the whole set, with a tab per film above it and the accent under the active label. The section stays the same height however many films are in it.',
    'It is the section for a small set the reader compares rather than works through — three cuts of the same interview, four language versions, a before and an after.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · FOUR TABS ON THE HAIRLINE · SHARED FRAME 960 × 540 · ACTIVE LABEL UNDERLINED IN ACCENT',
  body(t, w) {
    const g = K.ground(t, 'page');
    const fw = w === 1440 ? 960 : w === 834 ? 754 : 350;
    const n = w === 390 ? 4 : 4;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 24 : 32}px;align-items:center">
      ${K.headBlock(g, w, { align:'center', measure:w === 390 ? 350 : 620, max:760, eyebrowText:VID.eyebrow, headingText:VID.heading, blurbText:VID.blurb })}
      <div style="width:${fw}px;display:flex;flex-direction:column;gap:${w === 390 ? 18 : 24}px">
        ${K.tabsStrip(g, K.take(n), 0, { size:w === 390 ? 14 : 15, gap:w === 390 ? 16 : 28, clip:w === 390 ? 18 : 26 })}
        ${K.vframe(t, g, V1, { w:fw, aspect:'16:9', playSize:w === 390 ? 44 : 64 })}
        <div style="display:flex;flex-direction:column;gap:8px">
          ${K.captionEl(g, V1.blurb, { max:fw, size:15 })}
          ${K.metaRow(g, V1, {})}</div></div>
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const n = o.n || 4;
    return `<div style="width:${box}px;display:flex;flex-direction:column;gap:14px;align-items:center">
      <div style="width:${box}px">${K.tabsStrip(g, K.take(n), 0, { size:13, gap:18, clip:18 })}</div>
      ${K.vframe(t, g, V1, { w:420, aspect:'16:9', mode:o.mode, playSize:48 })}</div>`;
  },
  tileMin:270,
  counts:[
    { n:2, label:'TWO FILMS · TWO TABS · THE FLOOR THIS DESIGN IS WRITTEN FOR ⚑' },
    { n:7, label:'SEVEN FILMS · THE STRIP SCROLLS RATHER THAN WRAPPING ⚑' }
  ],
  primaryNote:`A5·12’s tab strip, carried verbatim: ${b('labels on a hairline with a 2 px accent underline on the active one')} ⚑ — A1·1’s active nav item, which is where that mark was set. ${b('The frame beneath is the same one every design uses')}, at 960. ${b('The tab labels are the films’ own titles, clipped at 26 characters with an ellipsis')} ⚑ — never renumbered, never rewritten, and the full title is drawn under the frame.`,
  statesNote:`${b('Switching tabs destroys the loaded player')} ⚑ — the same rule as 9 Carousel’s track, for the same reason. ${b('The frame does not change size between tabs')} ⚑ even when the films differ in ratio: the section’s Aspect value wins and a 4:3 film letterboxes inside a 16:9 box, which is settlement 2 doing its job. ${CONSENT}`,
  extraTiles:[{
    label:'WHAT THE TABS ARE, AND WHAT THEY ARE NOT',
    body:[`${b('Count class')} ${code('variable')} ⚑ — this design is written to hold whatever the author put in, 2 to 24, ${b('and it is the only design in A15 that is')}. ${b('Below 2 it is 1 Player')} and the picker says so; ${b('above about 6 the strip scrolls horizontally')} ⚑ rather than wrapping to a second line, because two rows of tabs stop reading as one control.`,
      `${b('The strip never becomes a')} ${code('&lt;select&gt;')} ⚑, at any width — A5·12’s finding, carried: a dropdown hides how many there are, which is the one thing a tab strip is for.`,
      `${b('No-JS, quoted:')} “${P.TABS_QUOTE}” ${b('A15 reads that as: every film renders stacked, each with its own poster, title and meta line')} ⚑, in authored order — the section becomes 13 Thumb Rows without the thumbnails, which is longer and loses nothing.`]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED VIDEOS BLOCK',
    name:'Tabs', n:15, sub:'One frame, a tab per film.', count:'SIX CONTROLS + THE VIDEOS BLOCK',
    rows:[padRow,
      aspectRow(`One box for every tab ⚑ — a film at another ratio letterboxes inside it rather than resizing the section.`),
      K.seg('Tab labels', ['Film titles', 'Numbers', 'Custom'], 0, `Numbers draws “01 · 02 · 03”; Custom takes the ${code('tabLabel')} field on each item ⚑ — the one place an item carries a label the page does not otherwise draw.`),
      K.seg('Tab alignment', ['Left', 'Centred'], 0, 'On the hairline, above the frame.'),
      K.seg('Caption', ['Description', 'Title', 'Off'], 0, `What is drawn under the frame for the active film ⚑.`),
      metaCtl()],
    videos:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a Plays value (${b('in the frame, always')} ⚑ — the frame is what the tabs point at), a remember-the-tab value (${b('the first tab is active on load and nothing is stored')} ⚑ — A9·5 and A13’s call, carried), and a tab-position value: ${b('above the frame, always')}, because tabs under a frame read as a caption.`,
      `${b('Nothing here is per-item')} except ${code('tabLabel')}, ${b('which is content rather than styling')} ⚑ — it is the item’s own text, edited in the item, exactly as its title is.`,
      NO_AUTOPLAY
    ]
  },
  tabletLabel:'834 · four tabs · frame 754 × 424',
  mobileLabel:'390 · the strip scrolls ⚑ · frame 350 × 197',
  respCap:'TABLET 834 · THE STRIP HOLDS FOUR · MOBILE 390 · IT SCROLLS AND NEVER WRAPS ⚑',
  respNote:`media frame’s ladder with ${b('one departure')}: ${b('at ≤ 767 the tab strip scrolls horizontally')} ⚑ with the active tab scrolled into view, and ${b('it never wraps and never becomes a select')} ⚑. ${b('1440')} four tabs at 15 px on a 28 gap, frame 960 × 540, caption 15, meta 13. ${b('834')} same strip, frame 754 × 424, padding 80. ${b('≤ 767')} labels 14 px on a 16 gap clipped at 18 characters, strip scrolls, frame 350 × 197, play 44, padding 64.`,
  darkNote:`The active underline re-checks at ${code('#E0805A')} — ${b('4.6:1 against')} ${code('#171511')} ⚑, above the 3:1 floor for a graphical mark. ${b('The active label itself is')} ${code('text')} ${b('and the rest are')} ${code('text-muted')} ⚑, so the state is carried by weight and colour as well as by the underline and never by the accent alone.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'A tab per film on a hairline strip above one shared frame, the active label underlined in accent, the active film’s description and meta line beneath.'),
    K.specRow(2, 'Structural descriptor', `${code('media frame · none · page · variable · inline · a tab per film sharing one frame')}<br><span style="color:#6B6459">Count ${code('variable')} — the only one in A15: the design is written to hold whatever the author put in, and the strip scrolls rather than the arrangement changing.</span>`),
    K.specRow(3, 'Archetype', `media frame. ${b('One departure')} — the strip scrolls at ≤ 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} tabs 15 px, gap 28, clip 26 characters, frame 960 × 540, caption 15, padding 96. ${b('834')} frame 754 × 424, padding 80. ${b('≤ 767')} tabs 14 px, gap 16, clip 18, strip scrolls ⚑, frame 350 × 197, play 44, padding 64.`),
    K.specRow(5, 'Content fields', `The four section strings, ${code('videos[]')} 2–24 all drawn, and ${code('tabLabel')} ≤ 26 per item ⚑ — drawn only at Tab labels: Custom. ${ITEM_FIELDS}`)
  ], [
    K.specRow(6, 'Controls', `Padding — Aspect ${b('16:9 · 4:3 · 1:1 · 9:16')} — Tab labels ${b('Film titles · Numbers · Custom')} — Tab alignment ${b('Left · Centred')} — Caption ${b('Description · Title · Off')} — Meta ${b('Duration and transcript · Duration only · Off')}. Then the videos block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → ${b('the strip is not drawn and the section is 1 Player')} ⚑; the picker says so rather than drawing one tab. ${b('2–6')} → the strip as drawn. ${b('7+')} → ${b('the strip scrolls horizontally at every width')} ⚑. ${b('Designed for 2–6')} ⚑.`),
    K.specRow(8, 'Empty state', `A film with no title at Tab labels: Film titles → ${b('its tab shows its position, “Film 3”')} ⚑, which is the one generated string in A15 and is flagged. No description at Caption: Description → the line closes up ⚑. No poster → the plate in the shared frame.`),
    K.specRow(9, 'Behaviour module', `${code('tabs')} ${b('and')} ${code('video-facade')} ⚑. ${b('tabs, edit-safe: yes')} — A9·5’s call: the first tab is active on load, nothing is remembered, nothing is written while editing. ${b('No-JS, quoted:')} “${P.TABS_QUOTE}” ${P.FACADE_LINE}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. The strip is ${code('role="tablist"')} with one ${code('role="tab"')} per film and the frame as the single ${code('role="tabpanel"')} ⚑; ${b('← and → move between tabs, Home and End jump to the ends')} ⚑, and ${b('the tab is activated on arrow, not on focus alone')} ⚑ — nothing loads because focus passed over it. ${b('The active state is weight, colour and the underline together')} ⚑, never colour alone. Active underline 4.6:1 as a graphical mark. ${A11Y_TAIL}<br>${b('Repeating items')} — ${LIST_RULE} ${b('Order is the tab order')} ⚑ and tab 1 is active on load. Inside an item: the usual fields plus ${code('tabLabel')} ⚑.<br>${b('Flagged ⚑')} the scrolling strip · never a select · clipped labels · “Film 3” as the one generated string · switching destroys the player · the shared box across mixed ratios.`)
  ]]
};

return [d11, d12, d13, d14, d15];
})();
