// A14-0 Category Proof builder.
globalThis.A14PROOF = (function () {
const K = globalThis.A14LIB, P = globalThis.A14PAGE;
const { b, code, cap, note, tile, textTile, tableCard, section, intro, wrapIf, specCards, MONO } = K;
const PC = K.PC;

/* ---- the tokenisation proof: 1 Grid, three packs, light and dark ---- */
function gridMini(pack, mode) {
  const p = K.PACKS[pack], t = mode === 'd' ? p.d : p.l;
  const g = K.ground(t, 'page', p);
  return `<div style="width:432px;background:${t.bg};border-radius:8px;padding:24px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px">
    ${K.headBlock(g, 390, { hSize:24, measure:360, max:384 })}
    ${K.gridBlock(t, g, { box:384, cols:2, gap:12, crop:'Landscape', captions:'Under each', n:4, capSize:12 })}
    ${K.creditEl(g, {})}</div>`;
}
function packProof() {
  const names = { paper:'PAPER · RADIUS 8 · GEORGIA + INTER', studio:'STUDIO · RADIUS 2 · BRICOLAGE + INTER', garden:'GARDEN · RADIUS 20 · BRICOLAGE + INTER' };
  const col = pack => `<div style="display:flex;flex-direction:column;gap:10px">
      <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${names[pack]}</span>${gridMini(pack, 'l')}
      <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${names[pack].split(' · ')[0]} · DARK</span>${gridMini(pack, 'd')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${['paper', 'studio', 'garden'].map(col).join('')}</div>`;
}

/* ---- the stress frame ---- */
const STRESS_HEAD = 'Twelve mornings on the Tagus, photographed between April and July at the two hours when the river is worked';
const STRESS_BLURB = 'A commission that began as a single page about the 06:12 ferry and became a year of standing on jetties in the dark, waiting for the light to arrive at the same time as the crews.';
const STRESS = [
  { n:1, cap:'The 06:12 ferry leaving Cais do Sodré on the morning the fog did not lift until nearly nine', nat:[3,2] },
  { n:2, cap:'', nat:[4,5] },
  { n:3, cap:'Salt pans at Alcochete, drained for the season', nat:[16,9] },
  { n:4, cap:'A crew change at the Trafaria terminal', nat:[3,4] },
  { n:5, cap:'The last of the sardine boats, Seixal', nat:[1,1] },
  { n:6, cap:'Reeds on the mudflats at first light', nat:[2,3] },
  { n:7, cap:'Mooring ropes, Doca de Belém', nat:[16,9] }
];
function failedPlate(t, g, w, h) {
  return `<figure style="margin:0;width:${w}px;display:flex;flex-direction:column;gap:10px">
    <span style="width:${w}px;height:${h}px;border-radius:${g.r}px;background:${t.hover};display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;text-align:center">
      <span style="font-size:13px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">A tide gauge on a concrete post, read twice a day</span></span>
    <figcaption style="font-size:14px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">The tide gauge at Pedrouços, read twice a day</figcaption></figure>`;
}
function stressBody(t, w) {
  const g = K.ground(t, 'page'), gg = K.G(w);
  const cw = Math.floor((gg.box - 48) / 3);
  const cells = STRESS.map(it => K.figureEl(t, g, it, { w:cw, crop:'As uploaded', captions:'Under each', noCap:!it.cap }));
  cells.splice(4, 0, failedPlate(t, g, cw, Math.round(cw * 3 / 4)));
  const inner = `<div style="display:flex;flex-direction:column;gap:44px">
    ${K.headBlock(g, w, { measure:560, headingText:STRESS_HEAD, blurbText:STRESS_BLURB })}
    <div style="display:flex;flex-wrap:wrap;gap:32px 24px;width:${gg.box}px;align-items:flex-start">${cells.join('')}</div>
    ${K.creditEl(g, { creditText:'Photographs by Marta Sequeira, with additional frames by the Museu do Tejo archive and the estuary authority’s survey team' })}</div>`;
  return P.stdWrap(t, w, inner, { padNote:'THE STRESS FRAME · 1 GRID AT CROP: AS UPLOADED · PADDING UNCHANGED' });
}

/* ---- tables ---- */
const ROSTER = [
  ['1', 'Grid', 'grid-of-N · none · page · many · top · one enforced crop across every cell', '6', 'lightbox'],
  ['2', 'Masonry', 'grid-of-N · none · page · variable · top · native ratios in balanced columns', '5 + 1', 'lightbox'],
  ['3', 'Mosaic', 'grid-of-N · none · page · many · inline · one lead cell at twice the size', '6', 'lightbox'],
  ['4', 'Panel', 'grid-of-N · none · surface · many · top · the whole set on one raised plane', '6', 'lightbox'],
  ['5', 'Split Head', 'split · none · page · many · right · head held beside the set', '6 + 1', 'lightbox'],
  ['6', 'Contrast Band', 'grid-of-N · none · contrast · many · top · the set on an inverted band', '6', 'lightbox'],
  ['7', 'Carousel', 'carousel · none · page · many · inline · one frame at a time', '6', 'carousel + lightbox ⚑'],
  ['8', 'Filmstrip', 'carousel · none · surface · variable · edge · a row that runs off the right edge', '6', 'carousel + lightbox ⚑'],
  ['9', 'Full Bleed', 'grid-of-N · none · transparent · many · full-bleed · no margin at any width', '6', 'lightbox'],
  ['10', 'Lead and Grid', 'grid-of-N · none · page · many · full-bleed · one lead frame across the page', '6', 'lightbox'],
  ['11', 'Overlay', 'grid-of-N · none · page · many · background · caption inside the frame', '6', 'lightbox'],
  ['12', 'Captioned Rows', 'stack · none · page · few · left · caption beside every frame', '6', 'lightbox'],
  ['13', 'Contact Sheet', 'grid-of-N · none · surface · many · inline · a dense numbered sheet', '6', 'lightbox'],
  ['14', 'Index', 'table · none · page · many · right · a ruled row per photograph', '6', 'lightbox'],
  ['15', 'Boxed', 'grid-of-N · box · page · many · top · the set in a hairline box', '6', 'lightbox']
];
const FIELDS = [
  ['<code>eyebrow</code>', 'text', 'opt', '24 ch', 'all fifteen', 'Doubles as the box label in 15 ⚑'],
  ['<code>heading</code>', 'text', 'opt', '60 ch', 'all fifteen', 'Always the <code>h2</code>; absent is a supported state'],
  ['<code>blurb</code>', 'text', 'opt', '200 ch', 'all fifteen', 'Clamped 560 on the page, 340 in 5 Split Head'],
  ['<code>credit</code>', 'text', 'opt', '60 ch', 'all fifteen', '<b>Under the set, never in the head</b> ⚑; moves with the head column in 5'],
  ['<code>moreLabel</code> · <code>moreUrl</code>', 'text + url', 'opt', '24 ch', '8, 13', '<b>“See all 48” is authored</b> ⚑ — nothing counts the archive'],
  ['<code>images[]</code>', 'list 1–48', '<b>req</b>', '48 max ⚑', 'all fifteen', '<b>The category’s one repeating unit</b>; authored, never queried'],
  ['↳ <code>image</code>', 'image', '<b>req</b>', '—', 'all fifteen', 'Ghost’s <code>img_url</code> derivatives for the grid, <b>the original in the overlay</b> ⚑'],
  ['↳ <code>alt</code>', 'text', 'opt ⚑', '120 ch', 'all fifteen', '<b>Not the caption</b>; load-bearing in 9 and 13, where nothing else describes the frame'],
  ['↳ <code>caption</code>', 'text', 'opt', '80 ch', 'all fifteen', 'Drawn under, inside, beside, or in the overlay — <b>never deleted by a control</b> ⚑'],
  ['↳ <code>link</code>', 'url', 'opt', '—', 'all fifteen', '<b>An item’s own link beats the lightbox</b> ⚑'],
  ['<i>the position</i>', 'generated', '—', '—', '3, 10, 12, 13, 14, 15', 'The lead (3, 10), the row number (12, 13, 14), the count in 15’s label ⚑'],
  ['<i>@site.title</i>', 'Ghost', 'req', '—', 'any design with no heading', 'The set’s <code>aria-label</code> where no heading is authored ⚑']
];
const CONTROL_FIELDS = [
  ['<code>padding</code>', 'Compact · Comfortable · Spacious', 'all fifteen'],
  ['<code>columns</code>', 'Two · Three · Four (Three · Four · Six in 9; Four · Six · Eight in 13; Two · Three in 5)', '1, 2, 4, 5, 6, 9, 11, 13, 15'],
  ['<code>crop</code>', 'Square · Landscape · Portrait · As uploaded', '1, 3, 4, 5, 6, 9, 11, 12, 13, 15 — <b>locked in 2, disabled at As uploaded in 3, 7, 9</b> ⚑'],
  ['<code>gap</code>', 'Tight · Even · Airy', '1, 2, 3, 6, 8, 11, 13'],
  ['<code>captions</code>', 'Under each · In the lightbox only · Off (+ Lead only in 10)', '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15 — <b>absent in 11, 12, 14</b> ⚑'],
  ['<code>lightbox</code>', 'On · Off', 'all fifteen'],
  ['<code>leadPosition</code> · <code>leadHeight</code> · <code>leadWidth</code>', 'Left · Right / Short · Medium · Tall / Full bleed · Contained', '3, 10'],
  ['<code>headColumn</code> · <code>headPlacement</code>', 'Left · Right / Inside the plane · Above it', '5, 4'],
  ['<code>peek</code> · <code>carouselControls</code> · <code>arrows</code>', 'On · Off / Dots · Arrows · Dots and arrows / On · Off', '7, 8'],
  ['<code>frameHeight</code>', 'Short · Medium · Tall', '8'],
  ['<code>gutter</code>', 'None · Hairline · Even', '9'],
  ['<code>scrim</code>', 'Soft · Standard', '11'],
  ['<code>imageSide</code> · <code>frameWidth</code> · <code>rules</code>', 'Left · Right · Alternating / Half · Two thirds / Between rows · Off', '12, 14'],
  ['<code>numbering</code> · <code>thumb</code> · <code>rowHeight</code>', 'On · Off / Small · Medium · Off / Compact · Comfortable', '13, 14'],
  ['<code>boxLabel</code>', 'Off · The eyebrow · The eyebrow and the count', '15']
];
const COMPONENTS = [
  ['Eyebrow', '13 px uppercase tracked .08em in <code>text-muted</code>', 'A1·1'],
  ['Icon button', '44 px box at the pack radius — the carousel arrows', 'A1·14'],
  ['Focus ring', '4 px accent ring, 3 px outside the frame; <b>inset in 9 and 10, carried colour in 6 and 11</b>', 'A6, A2·5'],
  ['Striped image plate', 'The placeholder and its mono crop caption', 'A1'],
  ['Content box and padding ladder', '1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132', 'A17'],
  ['On-contrast derivation', 'Every colour on a band from two <code>contrast</code> tokens', 'A17·7'],
  ['Surface plane', 'Surface + hairline + <code>md</code> shadow; flat in dark; a full-width fill is a ground', 'A26·3, A27·4'],
  ['Warm scrim', 'Warm contrast wash, strongest at the foot, carried colour over it', 'A20·13'],
  ['Missing-image plate', 'Hover surface at the crop ratio carrying the alt text', 'A17'],
  ['Bento tile', 'One cell at 2 × 2 among cells of one size', 'A17·12'],
  ['Column masonry', '<code>column-count</code>; nothing measures, nothing packs', 'A17·11'],
  ['Carousel track, dots and arrows', 'Snapping track, widening active dot, 44 px arrows beside the head', 'A19·15'],
  ['Two-column split', '380 · 48 · 868, collapsing at 1,080', 'A9·5, A16·1'],
  ['Ledger row', 'A ruled row with a label column and a value column', 'A9·15'],
  ['Repeater', 'Drag handle, remove, <i>Add …</i> at the foot, seeded not blank', 'A3'],
  ['Disabled-value convention', 'A value that would erase the design is shown struck through with the reason', 'A9·8, A29·3'],
  ['<b>The frame</b>', '<b>A <code>figure</code>: one plate at the section’s crop, one optional <code>figcaption</code>, the whole cell a link</b>', '<b>A14 — new</b>'],
  ['<b>The frame’s four states</b>', '<b>Resting · hover (2 px lift + underlined caption) · focus (ring) · reduced motion (no lift, underline kept)</b>', '<b>A14 — new</b>'],
  ['<b>The crop rule</b>', '<b>Square · Landscape · Portrait · As uploaded, written onto the section; the focal point is a field, not a control</b>', '<b>A14 — new</b>'],
  ['<b>The caption, in four places</b>', '<b>Under the frame · inside it on a wash · beside it at body size · in the overlay. Off never deletes it</b>', '<b>A14 — new</b>'],
  ['<b>The lightbox overlay</b>', '<b>A <code>dialog</code>: trapped focus, Escape returns focus, ← → wrap, counter, caption, the original file</b>', '<b>A14 — new</b>'],
  ['<b>The images block</b>', '<b>A repeater with thumbnails whose Add is a multi-file media picker; 1–48; drag reorders</b>', '<b>A14 — new</b>'],
  ['<b>The edge-running strip</b>', '<b>A row with a left margin and no right margin, one shared height, native widths</b>', '<b>A14·8 — new</b>'],
  ['<b>The numbered thumbnail</b>', '<b>A square plate with its position in mono beneath, at 209 px or smaller</b>', '<b>A14·13 — new</b>'],
  ['<b>The box legend</b>', '<b>A mono label breaking the top hairline of a box, optionally carrying the generated count</b>', '<b>A14·15 — new</b>'],
  ['<b>The generated count</b>', '<b>“6 photographs” from the list length, with its singular — the only number A14 generates</b>', '<b>A14·15 — new</b>']
];
const FINDINGS = [
  ['<b>A14 is the first category with no query behind it.</b> ⚑', 'Every other category so far reads posts, tags or authors from Ghost; this one reads nothing. That removes the Show ladder entirely — <b>the count is the length of the authored list</b> — and it makes the images block a new kind of control: a repeater whose Add is a multi-file media picker rather than a single blank row. The panel shape works, but it is the first of its kind and the host will meet it again in A15 and A33.'],
  ['<b>Ghost’s own gallery card is a different thing from an A14 section.</b> ⚑', 'A Koenig gallery inside <code>{&#8203;{content}&#8203;}</code> is authored in the post, laid out by Ghost’s own rules, and <b>none of A14’s controls reach it</b>. A33 Koenig Card Treatments owns that surface. A user who sets Crop: Square on an A14 section and then adds a gallery card to a post will reasonably expect the two to match, and they will not. <b>This needs a product answer, not a design one.</b>'],
  ['<b>The registry has no module for measured masonry, and none is needed.</b> ⚑', '2 Masonry is <code>column-count</code> and runs with no script at all. <b>A true packed masonry — one that measures and places — is not buildable</b> from the registry; the nearest entries are <code>reveal</code> and <code>shuffle</code>, and neither is it. Recorded so that nobody later specifies packing and assumes a module exists.'],
  ['<b>Two designs declare two modules each.</b> ⚑', '7 Carousel and 8 Filmstrip declare <code>carousel</code> <i>and</i> <code>lightbox</code>. Nothing in FR-G7 forbids it and nothing permits it explicitly; <b>no section in A1–A13 needed two</b>. Both degradations are quoted in full on those designs, and they compose cleanly — a scroll-snap strip of links to full-size images.'],
  ['<b><code>alt</code> is required for the design to work and cannot be enforced.</b> ⚑', 'In 9 Full Bleed and 13 Contact Sheet the frame carries no visible text, so <code>alt</code> is the accessible name and nothing else is. The editor shows a warning dot on the item and <b>never blocks publishing</b> — that is the right call for a publication tool, and it means <b>the accessibility of two designs depends on a field the theme cannot require</b>.'],
  ['<b>The overlay needs the original file and Ghost does not guarantee a middle size.</b> ⚑', 'The grid uses <code>img_url</code> derivatives; the lightbox asks for the original, which on a photographer’s upload can be several megabytes. <b>There is no “large but not original” derivative to fall back on</b>, and a reader on a phone connection pays for it. Flagged as a build decision: either accept it, or add a size and accept the loss of detail.'],
  ['<b>A14 cannot know what sits above or below it.</b> ⚑', 'The same route-awareness gap A16, A21, A22 and A26–A29 each raised, and <b>9 Full Bleed makes it acute</b>: its ground is <code>transparent</code>, so what shows through where the last row is short belongs to whatever section is beneath. Two full-bleed galleries stacked would touch with no seam and neither can know.'],
  ['<b>There is no sort module, and 14 Index is where it would be wanted.</b> ⚑', 'A sortable header is the obvious thing to add to an index and <b>the registry has no entry for it</b> — <code>shuffle</code> randomises, which is the opposite. Refused rather than invented; recorded here.']
];

const SETTLEMENTS = [
  ['1 · GRID, MASONRY AND CAROUSEL — AND WHAT SURVIVES REDUCED MOTION', [
    `${b('Four arrangements, and they are four designs rather than four values')} ⚑ — the even grid (1, and the eight designs that vary its ground and containment), the column masonry (2), the one-up track (7) and the edge-running strip (8). ${b('A single “layout” control would make nine designs one')}, and the collapse rules alone make that impossible: a grid goes to one column at 390 and a strip never does.`,
    `${b('Masonry is')} ${code('column-count')} ${b('and measures nothing')} ⚑ — A17·11’s finding, carried verbatim. ${b('The carousel is a native')} ${code('scroll-snap')} ${b('track')}, so both work with no JavaScript at all.`,
    `${b('Everything survives reduced motion, because almost nothing moves')} ⚑. There is ${b('no autoplay at any value anywhere in A14')} ⚑. Under reduced-motion two things change and are stated on their frames: ${b('the carousel scrolls instantly rather than smoothly')}, and ${b('the frame’s 2 px hover lift is dropped while its underline stays')} ⚑ — the hover is still legible without movement.`
  ]],
  ['2 · MIXED ASPECT RATIOS, AND WHETHER CROPS ARE ENFORCED', [
    `${b('Crops are enforced by default and “As uploaded” is one value of the control')} ⚑ — ${b('Square 1:1 · Landscape 4:3 · Portrait 3:4 · As uploaded')}. An even grid of mixed ratios is a ragged grid, so the default protects the arrangement; the value that gives the photographs back exists for the author who wants it.`,
    `${b('As uploaded is disabled in three designs and locked on in one')} ⚑ — disabled in 3 Mosaic (a fixed tile), 7 Carousel (slides of different heights make the section jump) and 9 Full Bleed (wall-to-wall mixed ratios align nowhere); locked in 2 Masonry, which exists for it. ${b('A9·8’s convention throughout')}: shown, struck through, with the reason.`,
    `${b('Where a photograph is cropped is content, so the focal point is a field on the image and not a control')} ⚑. A control would crop every frame the same way, which is exactly wrong: the subject is in a different place in every picture. ${b('The mono label on every plate names the crop and the ratio it was taken from')} — ${code('03 · 4:3 ← 3:2')} — so the cost is visible on the frame.`
  ]],
  ['3 · CAPTIONS: PER IMAGE, PER GALLERY, OR NONE', [
    `${b('Per image, and the gallery already has a blurb')} ⚑ — they are different fields with different jobs, and no design draws a second gallery-level caption. ${code('caption')} is per item, ≤ 80 characters; ${code('blurb')} is the section’s, ≤ 200; ${code('credit')} is the photographer’s line and sits under the set in all fifteen.`,
    `${b('Four places a caption can be drawn')}: under the frame (1, 2, 4, 5, 6, 8, 15), inside it on a wash (11), beside it at body size (12), or in the overlay only (3, 9, 13 by default). ${b('Three designs have no Captions control at all')} ⚑ — in 11, 12 and 14 the caption is the design, and switching it off would make each of them a different design that already exists.`,
    `${b('Off never deletes a caption')} ⚑. It means “not under the frame”: the text stays in the item, stays in the overlay, and returns the moment the value changes or the design does. ${b('And a caption is never')} ${code('alt')} ⚑ — separate fields, separate jobs; a frame with a caption and no alt still gets ${code('alt=""')}, with the caption doing the describing in the flow.`
  ]],
  ['4 · THE LIGHTBOX — FOCUS, ESCAPE, ARROWS AND THE CAPTION INSIDE IT', [
    `${b('One overlay for all fifteen designs')} ⚑, drawn in full on 1 Grid and referenced by number everywhere else. It is a ${code('&lt;dialog&gt;')}: ${b('focus is trapped')} while it is open — Tab cycles close · previous · next · the caption’s link — ${b('Escape closes it and returns focus to the frame that opened it')} ⚑, and ${b('← and → step and wrap')} ⚑.`,
    `${b('The caption is drawn inside the overlay at every Captions value, including Off')} ⚑, with a mono counter at the top left. ${b('The overlay requests the original file, not the cropped derivative')} ⚑ — the crop is a grid decision, and the overlay is where the photograph is actually looked at.`,
    `${b('An image carrying its own link is never a lightbox trigger')} ⚑ — the author’s link wins and that frame opens it instead, which every panel states. ${b('The module is')} ${code('lightbox')}${b(', edit-safe: no')} ⚑ — it does not open in the editor. ${b('No-JS, quoted:')} “${P.LIGHTBOX_QUOTE}” ${b('A14 satisfies that by construction')}: the frame is an ${code('&lt;a href&gt;')} to the original before any script runs.`
  ]]
];

function build() {
  const L = K.L, D = K.D;
  let out = K.DOC_HEAD;
  out += intro({
    rail:'A14 GALLERIES · CATEGORY PROOF · 15 DESIGNS · PAPER PACK · DRAWN 23 AUGUST 2026',
    title:'A14 · Galleries',
    paras:[
      'The category’s own artefacts: the four settlements §8 asked for, the tokenisation proof, the stress frame, the roster with its fifteen structural descriptors, the shared field list, the cumulative component inventory and the findings.',
      'A14 is the first category in the library with no query behind it. Every photograph is authored in the section, which removes the Show ladder, makes the images block the category’s one repeating unit, and puts the count entirely in the author’s hands — so every arrangement here has to hold at whatever they typed.'
    ]
  });

  out += section('A14 settlements', cap('THE FOUR QUESTIONS §8 ASKED, ANSWERED') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${SETTLEMENTS.map(s => tile({
      w:652, label:s[0], bg:'#FFFFFF', border:'#E7E2DB',
      body:`<div style="display:flex;flex-direction:column;gap:10px;font-size:12.5px;line-height:1.65;color:#3A3835">${s[1].map(x => `<span>${x}</span>`).join('')}</div>`
    })).join('')}</div>`);

  out += section('A14 pack proof', cap('THE TOKENISATION PROOF · 1 GRID IN THREE PACKS, LIGHT AND DARK · ONE FUNCTION, SIX TOKEN OBJECTS') +
    packProof() +
    note(`Six frames from ${b('one render function and six token objects')}. ${b('Nothing moves')}: two columns, a 12 px gap, the caption 10 px under its frame, the credit under the set. What changes is ${b('the radius token')} — 8 in Paper, 2 in Studio, 20 in Garden, taken by every frame together and never mixed — ${b('the type pairing')}, and ${b('the seven colour roles')}. ${b('The photographs are the same photographs')} ⚑: the placeholder stripe is re-derived per pack because it stands in for an image, but a real photograph is untouched by the pack, by the mode, and by everything else in A14. ${b('The accent appears nowhere in this design')} ⚑ — 1 Grid spends it only on the focus ring, which is why the proof reads as one gallery in three publications rather than three galleries.`));

  out += section('A14 stress', cap('THE STRESS FRAME · THE WORST REALISTIC CONTENT THIS CATEGORY WILL MEET') +
    K.frame(L, 1440, stressBody(L, 1440)) +
    note(`1 Grid at ${b('Crop: As uploaded')} carrying ${b('a 106-character heading')}, ${b('a 176-character blurb')}, ${b('eight frames in six different ratios')} (3:2, 4:5, 16:9, 3:4, 1:1, 2:3), ${b('one photograph with no caption')}, ${b('one caption of 90 characters')}, ${b('one image that failed to load')} and ${b('a 118-character credit')}. Everything that can go wrong in this category at once. ${b('The rows are ragged and stay ragged')} ⚑ — nothing is stretched to close a gap. ${b('The empty caption removes its own line and nothing else moves')} ⚑. ${b('The failed image holds its box at the crop ratio and carries its alt text')} ⚑ — A17’s plate, carried verbatim, and the reason the alt field matters. ${b('The 90-character caption wraps to three lines and the row below it starts lower')}, which is what a flex-wrap row does and is not a defect. ${b('This frame is the argument for the enforced crop being the default')}: it is legible, and it is not as good as the same content at Landscape.`));

  out += section('A14 roster', cap('THE ROSTER · FIFTEEN DESIGNS, FIFTEEN STRUCTURAL DESCRIPTORS') +
    tableCard({ cols:['#', 'DESIGN', 'TUPLE', 'CTL', 'MODULE'], widths:[30, 130, 700, 50, 170], rows:ROSTER.map(r => [r[0], `<b>${r[1]}</b>`, `<code style="font-family:'JetBrains Mono',monospace;font-size:11px">${r[2]}</code>`, r[3], `<code style="font-family:'JetBrains Mono',monospace;font-size:11px">${r[4]}</code>`]) }) +
    note(`${b('All fifteen are distinct on the five closed slots.')} ${b('Archetype')}: ten ${code('grid-of-N')}, two ${code('carousel')}, and one each of ${code('split')}, ${code('stack')} and ${code('table')} — a narrower spread than A16’s, because a gallery is mostly a grid and pretending otherwise would have produced five designs nobody would choose. ${b('Ground does the separating')}: ${code('page')} (1, 2, 3, 5, 7, 10, 11, 12, 14, 15), ${code('surface')} (4, 8, 13), ${code('contrast')} (6), ${code('transparent')} (9). ${b('Media placement carries the rest')} — ${code('top')}, ${code('inline')}, ${code('background')}, ${code('full-bleed')}, ${code('edge')}, ${code('left')}, ${code('right')} all appear. ${b('Containment is')} ${code('none')} ${b('in fourteen of fifteen')} ⚑ — only 15 Boxed puts the section itself in a container; nothing in A14 draws a card around a photograph, which is a category decision and not an omission.<br><br>${b('What the check cannot promise.')} ${b('4 Panel and 15 Boxed are the closest pair')} — a fill and a shadow apart — and the tuple separates them on containment and ground, but the judgement that a box marks and a plane lifts is a designer’s. ${b('1 Grid and 6 Contrast Band are the same arrangement on two grounds')}, which is the rule working as intended. ${b('9 Full Bleed at Columns: Six and 13 Contact Sheet at Columns: Six are close in density')} and separate on ground, margin and numbering. ${b('Each panel names its neighbours by number')} ⚑ rather than pretending the overlap is not there.`));

  out += section('A14 fields', cap('THE SHARED FIELD LIST · THE CONTRACT THAT MAKES DESIGN-SWITCHING SAFE') +
    tableCard({ cols:['FIELD', 'TYPE', 'REQ', 'LIMIT', 'USED BY', 'NOTES'], widths:[210, 110, 80, 90, 190, 400], rows:FIELDS }) +
    note(`${b('Six authored section fields, one authored list of four fields, and nothing read from Ghost but the site title')} ⚑. Every design uses ${code('images[]')}; ${b('thirteen of fifteen use nothing but the first six rows')}. ${b('No design needs a field the category does not have')}, so switching between any two of the fifteen preserves everything the user typed — including the captions a design does not draw. ${b('The one real cost is the 80-character caption limit')} ⚑: 12 Captioned Rows and 14 Index would carry 200 comfortably, and they are held to 80 so that switching to 11 Overlay — which clamps at three lines — never truncates. ${b('That is the shared list working, and it is stated rather than solved.')}`) +
    `<div style="height:8px"></div>` +
    tableCard({ w:1288, cols:['CONTROL-WRITTEN VALUE', 'ITS CLOSED SET', 'WRITTEN BY'], widths:[290, 560, 430], rows:CONTROL_FIELDS.map(r => [`<code style="font-family:'JetBrains Mono',monospace;font-size:11px">${r[0]}</code>`, r[1], r[2]]) }) +
    note(`${b('Fifteen control-written values on the section, and not one of them is per-item')} ⚑ — every control writes a single value and the stylesheet reads it, so “make frame 3 bigger” is not expressible by construction. ${b('Three designs need a value that is a position rather than a style')} — the lead in 3 and 10, the alternation in 12 — and all three take it from the list order rather than from a picker ⚑.`));

  out += section('A14 items', cap('REPEATING ITEMS · THE WHOLE CATEGORY, IN ONE PLACE') +
    specCards([[
      `${b('A14 has exactly one repeating unit')} ⚑ — ${code('images[] { image, alt?, caption?, link? }')} — and it is authored. There is no second list anywhere in the category.`,
      `${b('Add')} sits at the foot of the images block and ${b('opens the media picker, which takes several files at once')} ⚑. New frames ${b('land last, in the order they were chosen')}, and each arrives ${b('carrying the file’s own name as a placeholder caption the author can accept or clear')} ⚑ — never a blank shell, never “Untitled”. ${b('Add is disabled at 48')} with the reason shown ⚑.`,
      `${b('Remove')} is on the row and is undoable. ${b('Removing to one is allowed in every design')} ⚑; ${b('removing the last one is allowed too')}, and the section then does not render on the published page while the editor draws its drop zone ⚑. No design has a floor that blocks removal — a gallery of one photograph is a legitimate thing to publish, and 12 Captioned Rows and 10 Lead and Grid are designed for it.`,
      `${b('Reorder')} is a drag on the row, and ${b('order is meaningful in all fifteen designs')} ⚑ — authored order is drawn order everywhere, and it carries real weight in five: ${b('the first image is the lead in 3 Mosaic and 10 Lead and Grid')}, ${b('the numbers renumber in 12, 13 and 14')}, ${b('the side alternates in 12')}, and ${b('the column a frame lands in changes in 2 Masonry')}. The editor previews the move rather than only the row order in those five ⚑.`
    ], [
      `${b('Minimum and maximum: 1 and 48')} ⚑. The ceiling is A14’s own invention and is stated on every panel: 48 frames at 13 Contact Sheet’s six columns is eight rows and 1,736 px, which is where a section stops being a section. ${b('Above 48 the picker refuses the extra files and says how many it took')} ⚑.`,
      `${b('What each design is drawn for')}: 1, 2, 4, 6, 15 for 3–12 · 3 Mosaic for 6 (3 is its floor) · 5 Split Head for 4–8 · 7 Carousel for 4–20, the only design a list of forty does not punish ⚑ · 8 Filmstrip for 5–20 · 9 Full Bleed for 6, 9 or 12 · 10 Lead and Grid for 4 or 7 · 11 Overlay for 3–12 · 12 Captioned Rows for 2–4 · 13 Contact Sheet for 9–48 · 14 Index for 6–48. ${b('Outside its range a design still renders')} ⚑ — the panel names a better one and nothing is disabled.`,
      `${b('At zero the section does not render')} ⚑ — no head, no empty grid, no sample photographs, no placeholder. ${b('In the editor it draws a full-width drop zone')} carrying “Drag photographs here, or choose from your library” ⚑, which is the one place in A14 where the editor and the published page draw different things.`,
      `${b('Inside an item the user edits content only')} ⚑ — ${b('image, alt, caption and link')}, and nothing else. ${b('alt and caption and link are all optional')}: a frame with no caption draws no line in 1 Grid, keeps its wash in 11 Overlay, keeps its column in 12 Captioned Rows and keeps its full row height in 14 Index; a frame with no alt gets ${code('alt=""')} and a warning dot in the editor ⚑; a frame with a link opens the link instead of the overlay ⚑. ${b('No layout, spacing, alignment or emphasis is editable inside an item')}, in any design, by construction.`
    ]]));

  out += section('A14 components', cap('COMPONENT INVENTORY · CUMULATIVE · TEN NEW, SIXTEEN CARRIED FORWARD') +
    tableCard({ cols:['COMPONENT', 'WHAT IT IS', 'FIRST SET'], widths:[250, 720, 200], rows:COMPONENTS }));

  out += section('A14 findings', cap('FINDINGS FOR THE ARCHITECT · EIGHT, SEVEN OF THEM NEW') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${FINDINGS.map((f, i) => tile({
      w:652, label:`FINDING ${i + 1}`, bg:'#FFFFFF', border:'#E7E2DB',
      body:`<div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;line-height:1.65;color:#3A3835"><span>${f[0]}</span><span>${f[1]}</span></div>`
    })).join('')}</div>`);

  out += section('A14 dark proof', cap('DARK · 1 GRID AND 6 CONTRAST BAND AT 1440 · THE ONE PAIR WHERE DARK CHANGES MORE THAN TOKENS') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      <div style="display:flex;flex-direction:column;gap:8px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">1 GRID · DARK 1440 · GROUND DEEPENS, PHOTOGRAPHS UNTOUCHED</span>${K.frame(D, 1440, globalThis.A14D1[0].body(D, 1440, {}))}</div>
      <div style="display:flex;flex-direction:column;gap:8px"><span style="font-family:${MONO};font-size:11px;color:#6E6A64">6 CONTRAST BAND · DARK 1440 · THE BAND GOES LIGHT ⚑</span>${K.frame(D, 1440, globalThis.A14D2[0].body(D, 1440, {}))}</div>
    </div>` +
    note(`${b('Dark mode in A14 is a property of the page and not of the pictures')} ⚑ — the ground deepens, surfaces lift a step, hairlines and captions re-tune, and ${b('no photograph is dimmed, tinted or filtered in any design')} ⚑. The striped placeholder is re-derived because it stands in for an image; a real image is untouched. ${b('6 Contrast Band is the one design where dark changes the composition')}: the contrast token inverts the other way, so ${b('the band that is dark in light mode is light in dark mode')} ⚑ — A17·7’s derivation, and the most surprising thing in the pack.`));

  out += K.DOC_TAIL;
  return out;
}
return { build };
})();
