// A14 designs 1–5: Grid · Masonry · Mosaic · Panel · Split Head.
globalThis.A14D1 = (function () {
const K = globalThis.A14LIB, P = globalThis.A14PAGE;
const { b, code, gap, two } = K;

const NO_SHOW = `${b('A14 has no Show ladder')} ⚑ — A17's 3 · 6 · 9 · 12 and A19's 1 · 2 · 3 · 5 count a query, and there is no query here. ${b('The count is the length of the list')}, so every design's arrangement has to hold at whatever the user typed.`;
const CELL_RULE = `${b('At one image the cell keeps its column width and does not stretch')} ⚑ — a photograph blown to 1,296 is 10 Lead and Grid, and the panel names it.`;
const DATA_LINE = `${b('Nothing is read from Ghost’s content API')} ⚑ — the list is authored in the section, which makes A14 the first category in the library with no query behind it. Ghost supplies the ${code('img_url')} derivatives (${code('w=600 · 1000 · 1600 · 2400')}) for the ${code('srcset')}, and ${b('the lightbox requests the original file')} ⚑.`;
const ZERO = `${b('0 images')} → ${b('the section does not render on the published page')} ⚑ — no head, no empty grid, no placeholder. ${b('In the editor it draws a drop zone')} at the section's full width carrying “Drag photographs here, or choose from your library” ⚑.`;
const ALT_LINE = `${b('alt is not the caption and the caption is not alt')} ⚑ — separate fields, separate jobs. A frame with a caption and no alt gets ${code('alt=""')} and ${code('aria-hidden')} on the image, ${b('with the caption doing the describing in the flow')}; the editor marks the image with a warning dot and never blocks publishing ⚑.`;

/* ── 1 · Grid ──────────────────────────────────────────────────────── */
const d1 = {
  n:1, name:'Grid', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 1 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'Six photographs in three even columns on the page ground, every frame cropped to the same ratio, each caption under its own frame. The category default and the arrangement six other designs resolve to at 390.',
    'It is the gallery for a photo essay inside a page — a set that wants to be read in order and looked at one frame at a time. Nothing is raised, boxed, banded or overlaid.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THREE COLUMNS ON 1,296 · CELL 416 × 312 · CROP LANDSCAPE 4:3 · CAPTIONS UNDER EACH',
  body(t, w) {
    const g = K.ground(t, 'page');
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gp = w === 390 ? 16 : w === 834 ? 20 : 24;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 44}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}
      ${K.gridBlock(t, g, { box:K.G(w).box, cols, gap:gp, crop:'Landscape', captions:'Under each', n:6 })}
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    return K.gridBlock(t, g, { box, cols:3, gap:16, crop:'Landscape', captions:'Under each', n:o.n, noCapAt:o.noCapAt, capSize:12 });
  },
  tileMin:250,
  primaryNote:`A17's content box and padding ladder, carried verbatim, with A14's frame in the cell. ${b('416 × 312')} is 1,296 on three columns at a 24 px gap taken to 4:3 — ${b('the crop is enforced and the panel says so')} ⚑: a grid of mixed ratios is a ragged grid, and the mono label on each plate names the ratio it was cropped from. ${CELL_RULE} ${b('The credit sits under the set, not in the head')} ⚑ — it belongs to the photographs rather than to the essay.`,
  statesNote:`${CELL_RULE} ${b('A caption left empty shortens its own figure and moves nothing else')} ⚑ — the frames are the same height, the row is set by the tallest figure, and the grid does not re-align. ${ALT_LINE}`,
  extraTiles:[{
    label:'WHAT THE GRID SETTLES FOR THE CATEGORY',
    body:[
      `${b('Crop is enforced by default, and “As uploaded” is one value of the control')} ⚑ — settlement 2. Four values: ${b('Square 1:1 · Landscape 4:3 · Portrait 3:4 · As uploaded')}. Everything but the last sets one ${code('aspect-ratio')} on every cell and covers; ${b('the focal point is a field on the image, not a control')} ⚑, because where a picture is cropped is content.`,
      `${NO_SHOW}`,
      `${b('Radius is never a control')} ⚑ — it is the pack's token, taken by the frame, the lightbox and the card together, and mixing two radii in one gallery is the single fastest way to make it look wrong.`
    ]
  }],
  extraSection:(function () {
    const g = K.ground(K.L, 'page');
    const behind = `<div style="padding:18px">${K.gridBlock(K.L, g, { box:568, cols:3, gap:12, crop:'Landscape', captions:'Off', n:6 })}</div>`;
    return K.section('A14-1 lightbox', K.cap('THE LIGHTBOX · ONE OVERLAY FOR ALL FIFTEEN DESIGNS · DRAWN HERE, REFERENCED BY NUMBER EVERYWHERE ELSE') +
      `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
        ${K.tile({ w:652, label:'THE OVERLAY · FRAME 03 OF 06 OPEN · DRAWN AT 604 × 392', bg:'#FBF9F5', border:'#EBE5DB', body:K.lightboxEl(K.L, { w:604, h:392, behind, i:3, n:6 }) })}
        ${K.textTile({ label:'WHAT IT DOES · SETTLEMENT 4', min:352, body:[
          `${b('Focus is trapped inside the overlay')} while it is open ⚑ — Tab cycles close · previous · next · the caption's link if the caption has one, and nothing behind it is reachable.`,
          `${b('Escape closes it and focus returns to the frame that opened it')} ⚑, never to the top of the page.`,
          `${b('← and → step, and they wrap')} ⚑ — from the last image → goes to the first. ${b('The counter is drawn')} at 12 px mono, top left.`,
          `${b('The caption is drawn inside the overlay at every Captions value, including Off')} ⚑ — Off means “not under the frame”, never “thrown away”. That is settlement 3, and it is the reason Captions has three values rather than two.`,
          `${b('The overlay requests the original file, not the cropped derivative')} ⚑ — the crop is a grid decision and the lightbox is where the photograph is looked at.`,
          `${b('The background does not scroll')} while it is open, and the overlay is a ${code('&lt;dialog&gt;')} ⚑.`
        ] })}
      </div>` +
      K.note(`${b('One overlay, fifteen designs')} ⚑ — every design's Lightbox control writes the same value and gets the same overlay, and no design has an overlay of its own. ${b('It is')} ${code('lightbox')} ${b('from the registry, edit-safe: no')} ⚑ — it does not open in the editor, so what the editor draws is the resting grid. ${b('No-JS, quoted:')} “${P.LIGHTBOX_QUOTE}” ${b('Which A14 satisfies by construction')}: the frame is an ${code('&lt;a href&gt;')} to the original file before any script runs, so with JavaScript off the gallery is a set of links to full-size photographs. ${b('An image carrying its own link is never a lightbox trigger')} ⚑ — the author's link wins, and the panel says so.`));
  })(),
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Grid', n:1, sub:'Even columns, captions under.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Columns', ['Two', 'Three', 'Four'], 1, `The desktop count. ${b('Two and three go to two at 834; four goes to three')} ⚑ — and all of them go to one at 390.`),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `1:1 · 4:3 · 3:4 · the file's own ratio. ${b('As uploaded in an even grid gives ragged rows')} ⚑ and the panel says so; 2 Masonry is the design that wants it.`),
      K.seg('Gap', ['Tight', 'Even', 'Airy'], 1, '8 · 24 · 40 px, the same value between columns and rows.'),
      K.seg('Captions', ['Under each', 'In the lightbox only', 'Off'], 0, `${b('Off never deletes a caption')} ⚑ — it is still in the overlay and still in the export. Settlement 3.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `On makes every frame open the overlay. ${b('Off leaves the frame a plain')} ${code('&lt;a&gt;')} ${b('to the file')} ⚑, which is what no-JS gets either way.`)
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a ratio-per-row value (that is 3 Mosaic), a “stretch the last row” value (${b('the last row is left-aligned and short')} ⚑, because stretching one frame to fill a gap makes that frame more important than the author said), a radius value, and ${b('a Show ladder')} — ${NO_SHOW}`,
      `${b('Nothing here is per-item.')} Every control writes one value onto the section and the stylesheet reads it ⚑. If a set needs one frame bigger than the others, that is 10 Lead and Grid or 3 Mosaic, and the panel names them rather than growing an eighth control.`,
      `${b('Autoplay does not exist in A14 at any value')} ⚑ — not here, and not in 7 Carousel or 8 Filmstrip. A gallery that moves on its own takes the reading decision away from the reader, and reduced-motion would have to switch it off anyway.`
    ]
  },
  tabletLabel:'834 · two columns · cell 367 × 275',
  mobileLabel:'390 · one column · cell 350 × 263',
  respCap:'TABLET 834 · TWO COLUMNS · MOBILE 390 · ONE COLUMN, THE CROP UNCHANGED',
  respNote:`grid-of-N's ladder, with ${b('one departure')}: ${b('A14 goes to one column at 390 rather than two')} ⚑. Two columns at 390 is a 167 px cell, and a photograph at 167 px is a thumbnail of something the reader cannot see. ${b('1440')} three columns, gap 24, cell 416 × 312, caption 14. ${b('834')} two columns, gap 20, cell 367 × 275, padding 80. ${b('390')} one column, gap 16, cell 350 × 263, caption 14, padding 64. ${b('The crop does not change with the width')} ⚑ — the same ratio at all three, so the reader sees the same photograph the author framed.`,
  darkNote:`Ground ${code('#171511')}, hairlines ${code('#332E27')}, captions ${code('#A79E8F')} at 5.6:1. ${b('The stripe placeholder is re-tuned, never filtered')} ⚑ — and the same rule holds for real photographs: ${b('A14 never dims, tints or filters an image in dark mode')} ⚑. What changes is the ground behind it and the caption on it. ${b('Nothing is raised in either mode')}, so dark is token values and nothing else.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'Six photographs in three even columns on the page ground, one enforced crop across every cell, each caption under its own frame. The category default.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · many · top · one enforced crop across every cell')}<br><span style="color:#6B6459">Containment ${code('none')} — the section sits in nothing; 15 Boxed is the same arrangement in a box and that slot is what says so. Media ${code('top')}: the frame sits above its caption.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('One departure')} — the ladder's final step is one column at 390 rather than two ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} content 1,296 on a 72 margin; three columns, gap 24, cell 416 × 312, caption 14, credit under the set; padding 96. ${b('834')} two columns, gap 20, cell 367 × 275, heading 34, padding 80. ${b('≤ 767')} one column, gap 16, cell 350 × 263, heading 28, padding 64. ${b('The crop is the same at all three widths')} ⚑.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} ≤ 24 · ${code('heading')} ≤ 60 · ${code('blurb')} ≤ 200 · ${code('credit')} ≤ 60 · ${code('images[]')} 1–48, each ${code('image')} (req), ${code('alt')} ≤ 120, ${code('caption')} ≤ 80, ${code('link')}. All four section strings optional. ${ALT_LINE}`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Two · Three · Four')} — Crop ${b('Square · Landscape · Portrait · As uploaded')} — Gap ${b('Tight · Even · Airy')} — Captions ${b('Under each · In the lightbox only · Off')} — Lightbox ${b('On · Off')}. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one cell at its column width, left-aligned, not stretched ⚑. ${b('2–3')} → one short row, left-aligned. ${b('many')} → wraps; ${b('the last row is left-aligned and short')} ⚑. ${b('Above 48')} the list cannot grow and Add is disabled with the reason shown.`),
    K.specRow(8, 'Empty state', `No eyebrow, heading, blurb or credit → each absent and the block closes up ⚑; with all four gone the section is the grid alone, which is a legitimate section. ${b('A caption left empty draws nothing')} — no rule, no reserved line, no “Untitled” ⚑. ${b('A frame whose image fails to load keeps its box at the crop ratio')} and draws the pack's hover surface with its alt text centred at 13 px in ${code('text-muted')} ⚑ — A17's plate, carried verbatim.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE + ` ${b('At Lightbox: Off the section declares no module at all')} ⚑ and is pixel-identical with JavaScript off.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')} ⚑ — A14 is not the route's head. The set is a ${code('&lt;ul&gt;')} of ${code('&lt;li&gt;')}, each frame a ${code('&lt;figure&gt;')} with its ${code('&lt;figcaption&gt;')}; ${b('the caption is inside the figure, never a sibling')} ⚑. Focus order is authored order. The frame's target is the whole cell — 416 × 312, far past 44 ⚑. ${b('The 4 px accent ring sits 3 px outside the frame')} ⚑ so it is never lost against a dark photograph. Caption 5.4:1 light, 5.6:1 dark; heading 13.4:1.<br>${b('Repeating items')} — ${code('images[]')}: Add opens the media picker, takes several files at once and lands them last in the order chosen ⚑, never a blank frame; Remove is on the row and undoable; drag reorders and ${b('authored order is drawn order')}; ${b('1–48, drawn for 3–12')}; at 1 the cell holds its column width; at 0 the section does not render ⚑. Inside an item: ${b('image, alt, caption, link')} — caption and link optional, and an empty caption draws nothing.<br>${b('Flagged ⚑')} one column at 390 · the enforced crop and its four values · the short last row · no Show ladder · no autoplay anywhere in A14 · the credit under the set.`)
  ]]
};

/* ── 2 · Masonry ───────────────────────────────────────────────────── */
const d2 = {
  n:2, name:'Masonry', crop:'As uploaded',
  rail:'A14 GALLERIES · DESIGN 2 OF 15 · PAPER PACK · FIVE CONTROLS + A LOCKED ROW + THE IMAGES BLOCK',
  paras:[
    'Three columns filled top to bottom, every photograph at the ratio it was uploaded at, nothing cropped and nothing measured. The design that answers settlement 2 in the other direction.',
    'It is the gallery for a set that was not shot to one shape — a portrait beside a panorama beside a square — where forcing one ratio would cut the subject out of half the frames.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THREE COLUMNS ON 1,296 · COLUMN 416 · NATIVE RATIOS · NOTHING CROPPED',
  body(t, w) {
    const g = K.ground(t, 'page');
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gp = w === 390 ? 16 : w === 834 ? 20 : 24;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 44}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}
      ${K.masonryBlock(t, g, { box:K.G(w).box, cols, gap:gp, captions:'Under each', n:6 })}
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    return K.masonryBlock(t, g, { box, cols:3, gap:16, captions:'Under each', n:o.n, capSize:12 });
  },
  tileMin:250,
  primaryNote:`${b('It is CSS')} ${code('column-count')}${b(', and nothing measures or packs')} ⚑ — A17·11's finding, carried verbatim into a category where the ratios are real rather than cycled. The consequence is stated rather than hidden: ${b('the browser balances the columns by height, so where the list breaks from one column to the next moves with the content')} ⚑, and ${b('reading order runs down a column, not across the row')} ⚑. ${b('Crop is locked at As uploaded')} ⚑ — this design is the reason that value exists, and cropping it would make it 1 Grid.`,
  statesNote:`${b('At one image masonry is one column')} ⚑ and the frame keeps its column width — the same rule as 1 Grid, reached a different way. ${b('At two the second column fills and the third stays empty')} ⚑; the set never re-centres. ${b('A missing caption closes up')} and the column below it moves up by exactly the caption's height, which is what a column layout does and is not a defect ⚑.`,
  extraTiles:[{
    label:'THE COST OF NOT CROPPING · STATED, NOT HIDDEN',
    body:[
      `${b('Columns end at different heights')} ⚑ — the ragged foot is the design, not a bug, and it is why 1 Grid rather than this one is the category default.`,
      `${b('Reading order runs down each column')} ⚑. With ${code('column-count')} the DOM is one list and the visual order is column-major, so a screen reader hears 01 · 02 · 03 · 04 while an eye reading across sees 01 · 03 · 05. ${b('The list stays one')} ${code('&lt;ul&gt;')} ${b('in authored order')} and the divergence is accepted and flagged, exactly as A17·11 accepted it.`,
      `${b('A very tall portrait can own a column')} ⚑. A 2:3 frame at 416 is 624 px, and three of them stacked is 1,900 px of one column. The ceiling is the author's: the panel says so and offers Columns: Four as the answer.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · FIVE CONTROLS, ONE LOCKED ROW + THE IMAGES BLOCK',
    name:'Masonry', n:2, sub:'Native ratios, three columns.', count:'FIVE CONTROLS + ONE LOCKED ROW',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Columns', ['Two', 'Three', 'Four'], 1, `Four is the answer to a set of tall portraits ⚑ — it shortens every column by a quarter.`),
      K.seg('Gap', ['Tight', 'Even', 'Airy'], 1, '8 · 24 · 40 px, columns and rows alike.'),
      K.seg('Captions', ['Under each', 'In the lightbox only', 'Off'], 0, `Under each is the default here ⚑ — a set of mixed ratios is a set that usually needs telling apart.`),
      K.seg('Lightbox', ['On', 'Off'], 0, 'The same overlay as 1 Grid, opening on the original file.'),
      K.sel('Crop', 'As uploaded — locked in this design', `Read-only. ${b('Cropping a masonry is 1 Grid')} ⚑, and the panel names it rather than offering a value that would erase the design. The other four values are live in 1, 4, 5, 6, 9, 10, 11, 13 and 15.`, true)
    ],
    images:{ count:6 },
    settles:[
      `${b('Five controls and one locked row.')} The locked row is a ${b('disclosure, not a control')} ⚑ — A9·8's convention, carried verbatim: a value that would erase the design is shown disabled with the reason, never quietly removed from the panel.`,
      `${b('There is no “balance the columns” value')} ⚑ and no measured packing. Real masonry needs JavaScript that runs on every resize, the registry has no module for it, and ${b('the closest module is')} ${code('reveal')}${b(', which is not it')} — a finding for the architect rather than a new module name.`,
      `${b('Nothing here is per-item.')} A frame is tall because the photograph is tall, not because the user made it tall ⚑ — which is the whole argument for this design and against a per-item size control anywhere in A14.`
    ]
  },
  tabletLabel:'834 · two columns · column 367',
  mobileLabel:'390 · one column · native ratios kept',
  respCap:'TABLET 834 · TWO COLUMNS · MOBILE 390 · ONE COLUMN, THE RAGGED FOOT GONE',
  respNote:`grid-of-N's ladder with ${b('the same 390 departure as 1 Grid')} ⚑. ${b('1440')} three columns of 416, gap 24. ${b('834')} two columns of 367, gap 20 — ${b('and the column break moves')} ⚑, so a frame that was third at 1440 may be first in the second column at 834. ${b('390')} one column of 350: ${b('at one column masonry and 1 Grid are the same layout')} ⚑ except that the ratios are still the author's. The captions and their order never change.`,
  darkNote:`Identical treatment to 1 Grid — ground, hairline and caption re-tuned, ${b('the photographs untouched')} ⚑. ${b('The ragged foot is more visible in dark')} because the ground is closer in value to the plate, and that is accepted rather than corrected with a border ⚑.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'Three columns filled top to bottom with the list in order, every photograph at its uploaded ratio, captions under each frame. Nothing measures and nothing packs.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · variable · top · native ratios in balanced columns')}<br><span style="color:#6B6459">Item-count ${code('variable')} separates it from 1 Grid on the same ground and archetype: ${b('this design is written to hold any count at all')}, including the tall-portrait set that breaks an even grid.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('One departure')} — one column at 390 ⚑, as 1 Grid. ${b('Cells have no shared height')}, so nothing aligns row-wise at any width.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} three columns of 416 on a 24 gap; frame heights are the file's own; padding 96. ${b('834')} two columns of 367, gap 20, padding 80 — ${b('the column break moves with the content')} ⚑. ${b('≤ 767')} one column of 350, gap 16, padding 64. ${b('No crop at any width')}.`),
    K.specRow(5, 'Content fields', `The same five as 1 Grid: ${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('credit')} · ${code('images[]')}. ${b('This design reads no field 1 Grid does not')} ⚑ — what differs is the crop value it is fixed at.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Two · Three · Four')} — Gap ${b('Tight · Even · Airy')} — Captions ${b('Under each · In the lightbox only · Off')} — Lightbox ${b('On · Off')} — and ${b('Crop, locked at As uploaded')} ⚑ with 1 Grid named. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one column, one frame at 416 ⚑, the other two columns absent rather than empty. ${b('2')} → two columns fill and the third stays empty ⚑. ${b('many')} → the browser balances by height and ${b('the break point is not stable across widths')} ⚑.`),
    K.specRow(8, 'Empty state', `As 1 Grid: absent strings close up, an empty caption draws nothing, a failed image keeps its ${b('native')} box and draws the hover surface with its alt text ⚑ — the box is the file's ratio, which the theme knows from Ghost's image dimensions.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE + ` ${b('The columns themselves need no module')} ⚑ — ${code('column-count')} is CSS, so with JavaScript off the masonry is pixel-identical.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. One ${code('&lt;ul&gt;')} in authored order; ${b('visual order is column-major and DOM order is not')} ⚑ — the divergence is accepted, as A17·11 accepted it, and is the honest cost of not cropping. Frames are ${code('&lt;figure&gt;')} + ${code('&lt;figcaption&gt;')}. Ring, targets and contrasts as 1 Grid.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid, ${b('with one difference')} — reordering here changes which column a frame lands in ⚑, so the editor previews the move rather than only the row order.<br>${b('Flagged ⚑')} the locked Crop row · column-major reading order · the ragged foot · the moving break point · no measured packing and no module for one.`)
  ]]
};

/* ── 3 · Mosaic ────────────────────────────────────────────────────── */
const d3 = {
  n:3, name:'Mosaic', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 3 OF 15 · PAPER PACK · FIVE CONTROLS + THE IMAGES BLOCK',
  paras:[
    'One frame held at twice the size of the others in a fixed tile, the rest filling the cells around it. The first photograph is the large one, and that is the whole of the hierarchy.',
    'It is the gallery for a set with one picture that carries it — the frame the essay was commissioned for — where an even grid would say all six are equal when they are not.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · LEAD 856 × 648 · FOUR CELLS AT 416 × 312 · CAPTIONS IN THE LIGHTBOX ONLY',
  set(t, g, box, o) {
    o = o || {};
    const gp = o.gap === undefined ? 24 : o.gap;
    const cw = Math.floor((box - gp * 2) / 3), ch = Math.round(cw * 3 / 4);
    const lw = cw * 2 + gp, lh = ch * 2 + gp;
    const items = K.take(o.n || 6);
    const lead = items[0], right = items.slice(1, 3), row = items.slice(3, 6);
    const leadEl = K.figureEl(t, g, lead, { w:lw, h:lh, crop:'Landscape', captions:o.captions, plateNote:'THE LEAD CELL' });
    const rightEl = `<div style="display:flex;flex-direction:column;gap:${gp}px">${right.map(it => K.figureEl(t, g, it, { w:cw, h:ch, crop:'Landscape', captions:o.captions })).join('')}</div>`;
    const top = `<div style="display:flex;gap:${gp}px;${o.leadRight ? 'flex-direction:row-reverse;justify-content:flex-end;' : ''}">${leadEl}${right.length ? rightEl : ''}</div>`;
    const bottom = row.length ? `<div style="display:flex;gap:${gp}px">${row.map(it => K.figureEl(t, g, it, { w:cw, h:ch, crop:'Landscape', captions:o.captions })).join('')}</div>` : '';
    return `<div style="display:flex;flex-direction:column;gap:${gp}px;width:${box}px">${top}${bottom}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'page');
    if (w === 390) {
      const inner = `<div style="display:flex;flex-direction:column;gap:32px">
        ${K.headBlock(g, w, { measure:350 })}
        ${K.gridBlock(t, g, { box:350, cols:1, gap:16, crop:'Landscape', captions:'In the lightbox only', n:6 })}
        ${K.creditEl(g, {})}</div>`;
      return P.stdWrap(t, w, inner, { padNote:'THE MOSAIC IS GONE AT 390 ⚑ · ONE COLUMN, THE LEAD FIRST AND NO LARGER' });
    }
    const box = K.G(w).box;
    const inner = `<div style="display:flex;flex-direction:column;gap:${44}px">
      ${K.headBlock(g, w, { measure: 560 })}
      ${w === 834 ? this.set834(t, g, box) : this.set(t, g, box, { captions:'In the lightbox only' })}
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  set834(t, g, box) {
    const gp = 20, cw = Math.floor((box - gp) / 2), ch = Math.round(cw * 3 / 4);
    const items = K.take(6);
    const lead = K.figureEl(t, g, items[0], { w:box, h:Math.round(box * 3 / 4), crop:'Landscape', plateNote:'THE LEAD CELL · FULL BOX AT 834 ⚑' });
    const rest = `<div style="display:flex;flex-wrap:wrap;gap:${gp}px">${items.slice(1).map(it => K.figureEl(t, g, it, { w:cw, h:ch, crop:'Landscape' })).join('')}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:${gp}px;width:${box}px">${lead}${rest}</div>`;
  },
  mini(t, box, o) { return this.set(t, K.ground(t, 'page'), box, { gap:12, n:o.n, captions:'Off' }); },
  tileMin:250,
  primaryNote:`A17·12's bento, reduced to one rule: ${b('the lead is the first image in the list and there is no control that changes which')} ⚑ — reorder the list and the lead changes with it, which is the only per-item decision A14 allows because it is a content decision. ${b('The tile is fixed, not fluid')} ⚑: 2 × 2 cells for the lead, two stacked at its side, three under. ${b('Captions default to the lightbox here')} ⚑ — five captions under five different cell sizes is five different measures, and it reads as noise.`,
  statesNote:`${b('The mosaic needs three images to exist')} ⚑. At ${b('1')} it draws the lead alone at 856 × 648 — the tile does not collapse to a full-width frame, because that is 10 Lead and Grid. At ${b('2')} the lead keeps its size and one cell sits beside it, ${b('the second cell left empty rather than stretched')} ⚑. ${b('At 4 and 5 the bottom row is short and left-aligned')}; at 7 or more the extra frames continue in rows of three under it ⚑.`,
  extraTiles:[{
    label:'WHY THIS IS A DESIGN AND NOT A CONTROL ON 1 GRID',
    body:[
      `${b('A “make one frame bigger” control would be per-item styling')} ⚑, which A14 does not have anywhere, by construction. Making it a design instead means the rule is structural: ${b('the first image is the lead')}, always, in every pack and at every count.`,
      `${b('The lead is the first image, so reordering is how you choose it')} ⚑ — drag a frame to the top of the images block and it becomes the lead. The panel says this in the images block's help line rather than adding a “Lead image” picker.`,
      `${b('Lead position is a mirror, not a size')} ⚑ — Left or Right, and both are the same tile flipped. It is the one control here that is purely visual.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · FIVE CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Mosaic', n:3, sub:'One lead frame, the rest around it.', count:'FIVE CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Lead position', ['Left', 'Right'], 0, `Which side of the tile the large frame takes. ${b('The stacked pair takes the other')} ⚑; the row beneath is unchanged.`),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `${b('As uploaded is disabled in this design')} ⚑ — the tile is built from a fixed cell size and a native ratio would break it. A9·8's convention: shown, struck through, with the reason.`, [3]),
      K.seg('Gap', ['Tight', 'Even', 'Airy'], 1, '8 · 24 · 40 px. The gap sets the lead size too — the lead is two cells plus one gap ⚑.'),
      K.seg('Captions', ['In the lightbox only', 'Under each', 'Off'], 0, `${b('The lightbox is the default here')} ⚑, against 1 Grid's Under each, because five captions under five cell sizes read as noise.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `At Lightbox: Off with Captions: In the lightbox only, ${b('the captions have nowhere to go')} ⚑ — the panel resolves Captions to Under each and says so.`)
    ],
    images:{ count:6 },
    settles:[
      `${b('Five controls plus one disabled value.')} Cut: a “which frame is the lead” picker (${b('it is the first in the list')} ⚑), a per-cell ratio (that is the whole of 2 Masonry), and a column count — ${b('the tile is three columns at every value')} ⚑, because a mosaic that reflows to four is a different tile.`,
      `${b('The lead cell is 856 × 648 at Even')}, which is 2 × 2 cells plus the gap. ${b('Changing Gap changes the lead')} ⚑ and the panel says so, because it is the one place in A14 where a spacing control changes a picture's size.`,
      `${b('Nothing here is per-item.')} The lead is not styled — it is a position, and the position is the list's.`
    ]
  },
  tabletLabel:'834 · lead full box, then two-up ⚑',
  mobileLabel:'390 · one column, the mosaic gone ⚑',
  respCap:'TABLET 834 · THE TILE IS ALREADY GONE ⚑ · MOBILE 390 · ONE COLUMN',
  respNote:`${b('This design has the shortest ladder in A14')} ⚑. ${b('1440')} the tile: lead 856 × 648, two cells at 416 × 312 beside it, three under. ${b('Below 1,080 the tile cannot hold')} ⚑ — the lead would be 496 px and the cells 236 — so ${b('834 draws the lead at the full 754 box with the remaining five two-up under it')}, which keeps the hierarchy and drops the interlock. ${b('390')} one column at 350 and ${b('the lead is no larger than the rest')} ⚑ — at one column a 2 × 2 cell is just a taller frame, and the design hands its hierarchy to reading order.`,
  darkNote:`Token values only. ${b('The lead reads as the lead in both modes because it is bigger, not because it is brighter')} ⚑ — there is no accent, no border and no shadow on it in either mode.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'A fixed tile: the first image at 2 × 2 cells, two cells stacked beside it, three in a row beneath. The lead is the list’s first frame and no control changes that.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · many · inline · one lead cell at twice the size')}<br><span style="color:#6B6459">Media ${code('inline')} — the frames are laid into one tile rather than each sitting above its own caption, which is what separates it from 1 Grid on identical archetype, containment, ground and count.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('Two departures')} — the tile dissolves at 1,080 rather than narrowing ⚑, and ${b('at 390 the lead loses its size entirely')} ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} lead 856 × 648, cells 416 × 312, gap 24, three columns. ${b('1080–834')} lead at the full box (754 × 566 at 834) with the rest two-up at 367 × 275, gap 20 ⚑. ${b('≤ 767')} one column at 350 × 263, ${b('the lead the same size as every other frame')} ⚑, order unchanged.`),
    K.specRow(5, 'Content fields', `The category's five: ${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('credit')} · ${code('images[]')}. ${b('Designed for 6')}; 3 is the floor at which the tile is still a tile ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Lead position ${b('Left · Right')} — Crop ${b('Square · Landscape · Portrait')} with ${b('As uploaded disabled')} ⚑ — Gap ${b('Tight · Even · Airy')} — Captions ${b('In the lightbox only · Under each · Off')} — Lightbox ${b('On · Off')}. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → the lead alone at 856 × 648 ⚑. ${b('2')} → lead plus one cell, ${b('the second cell empty, never stretched')} ⚑. ${b('3–5')} → the tile fills in order and the bottom row is short. ${b('6')} → exact. ${b('7+')} → rows of three continue beneath ⚑, and ${b('the lead is never repeated')}.`),
    K.specRow(8, 'Empty state', `As 1 Grid. ${b('The lead caption is not special')} ⚑ — at Captions: Under each it takes the same 14 px line as the others, on a 856 measure.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. One ${code('&lt;ul&gt;')} in authored order placed by explicit grid coordinates, so ${b('DOM order and visual order agree at every count')} ⚑ — including at Lead position: Right, which is a ${code('grid-column')} swap and never ${code('order')}. ${b('The lead is not promoted in the heading structure')} ⚑ — it is a bigger picture, not a more important heading.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid, ${b('with the lead consequence stated')} — dragging a frame to position 1 makes it the lead ⚑, and the editor says so on the drag.<br>${b('Flagged ⚑')} the fixed tile · As uploaded disabled · Gap changing the lead's size · the 1,080 dissolve · the lead losing its size at 390 · captions defaulting to the lightbox.`)
  ]]
};

/* ── 4 · Panel ─────────────────────────────────────────────────────── */
const d4 = {
  n:4, name:'Panel', crop:'Landscape', stateGround:'surface',
  rail:'A14 GALLERIES · DESIGN 4 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'The whole set lifted onto one surface plane with a hairline and the pack’s md shadow, the head inside it, three columns within its padding. A26·3’s plane, carried verbatim.',
    'It is the gallery for a page that is mostly prose — an about page, a long report — where the photographs need an edge to say that they are a different kind of thing from the paragraphs above them.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · PLANE 1,296 WIDE, 40 PADDING · THREE COLUMNS AT 389 × 292 · MD SHADOW',
  body(t, w) {
    const gp2 = K.ground(t, 'page'), g = K.ground(t, 'surface');
    const pad = w === 390 ? 20 : w === 834 ? 32 : 40;
    const box = K.G(w).box - pad * 2;
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gpx = w === 390 ? 16 : w === 834 ? 20 : 24;
    const inner = `<div style="background:${g.bg};border:1px solid ${g.border};border-radius:${g.r}px;padding:${pad}px;box-sizing:border-box;width:${K.G(w).box}px;${t.dark ? '' : `box-shadow:${t.shadow};`}">
      <div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 36}px">
        ${K.headBlock(g, w, { measure: w === 390 ? 310 : 560, hSize: w === 1440 ? 34 : w === 834 ? 30 : 26 })}
        ${K.gridBlock(t, g, { box, cols, gap:gpx, crop:'Landscape', captions:'Under each', n:6 })}
        ${K.creditEl(g, {})}</div></div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'surface');
    return `<div style="background:${g.bg};border:1px solid ${g.border};border-radius:${g.r}px;padding:20px;box-sizing:border-box;width:${box}px;${t.dark ? '' : `box-shadow:${t.shadow};`}">${K.gridBlock(t, g, { box:box - 40, cols:3, gap:14, crop:'Landscape', captions:'Under each', n:o.n, noCapAt:o.noCapAt, capSize:12 })}</div>`;
  },
  tileMin:230,
  primaryNote:`A26·3 and A27·4's plane, carried verbatim, and their call that ${b('a full-width fill is a ground rather than a containment')} ⚑ — which is why the tuple reads ${code('surface')} in slot three and ${code('none')} in slot two. ${b('The heading drops to 34')} inside the plane ⚑: a 40 px heading on a raised panel competes with the page's own ${code('h1')} above it. ${b('The plane is the only thing raised')} — the frames inside it are flat, with no second shadow and no card, because two levels of raise inside one section is where a gallery starts to look like a dashboard.`,
  statesNote:`${b('The plane holds its width at every count')} ⚑ — at one image the panel is still 1,296 wide with one 389 px frame in it, left-aligned. That is the one place where A14's “never stretch a frame” rule looks odd, and it is kept because the alternative is a panel that changes width when a user removes a photograph ⚑. ${b('Below three images the panel names 12 Captioned Rows')} in the editor as the design built for two ⚑.`,
  extraTiles:[{
    label:'THE PLANE, AND WHAT IT COSTS',
    body:[
      `${b('One raise, never two')} ⚑ — the plane carries the shadow and the frames inside it carry none. 15 Boxed is this design with the fill removed and the shadow gone, and the panel names it.`,
      `${b('In dark the plane is flat')} ⚑ — surface ${code('#211D17')} against ground ${code('#171511')} with a ${code('#332E27')} hairline and no shadow at all, which is A26·3's dark rule carried verbatim. Shadows in dark read as haze.`,
      `${b('The plane padding is not a control')} ⚑ — 40 · 32 · 20 by width, fixed. Padding (the section's) moves the plane away from its neighbours; the plane's own inset is structure.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Panel', n:4, sub:'The set on a raised plane.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'The section’s own, outside the plane: 64 · 96 · 132 at 1440.'),
      K.seg('Columns', ['Two', 'Three', 'Four'], 1, 'Inside the plane’s padding — 389 at three, 604 at two, 281 at four.'),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `All four live. ${b('As uploaded on a plane leaves a ragged foot inside a straight edge')} ⚑ — legible, and the panel says it is 2 Masonry's territory.`),
      K.seg('Head', ['Inside the plane', 'Above it'], 0, `${b('Above it puts the head on the page ground')} and the plane holds the frames alone ⚑ — the arrangement 5 Split Head uses, reached from here.`),
      K.seg('Captions', ['Under each', 'In the lightbox only', 'Off'], 0, 'The category’s three values.'),
      K.seg('Lightbox', ['On', 'Off'], 0, 'The same overlay as 1 Grid.')
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a fill value (${b('the plane is surface or it is 15 Boxed')} ⚑), a shadow value (the pack's ${code('md')}, or flat in dark — never a choice), a radius value, and an inner-padding value.`,
      `${b('Head: Above it is the one control in A14 that moves an element out of its containment')} ⚑. It is kept because a plane holding a head, a blurb, a credit and six frames is a lot of things in one box, and the alternative is a seventh design.`,
      `${b('Nothing here is per-item.')} The plane is the section's, and no frame can be lifted onto its own plane — that would be a card grid, which A14 refused ⚑: a card around a photograph adds a border to something that already has four edges.`
    ]
  },
  tabletLabel:'834 · plane 754, padding 32, two columns',
  mobileLabel:'390 · plane 350, padding 20, one column',
  respCap:'TABLET 834 · THE PLANE NARROWS WITH THE BOX · MOBILE 390 · PADDING 20, ONE COLUMN',
  respNote:`grid-of-N's ladder inside a plane that is always the content box wide. ${b('1440')} plane 1,296, padding 40, three columns at 389 × 292, heading 34. ${b('834')} plane 754, padding 32, two columns at 351 × 263, heading 30. ${b('390')} plane 350, ${b('padding 20')} ⚑ — the plane keeps its edges at 390 rather than going edge to edge, which is A26·3's call and the reason 9 Full Bleed exists as a separate design. One column at 310 × 233, heading 26.`,
  darkNote:`${b('Surface lifts one step and the shadow is dropped entirely')} ⚑ — plane ${code('#211D17')} on ground ${code('#171511')}, hairline ${code('#332E27')}. The frames inside are unchanged: A14 never filters a photograph for dark ⚑. Caption on surface measures 5.4:1.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The head, the set and the credit inside one surface plane with a hairline and the pack’s md shadow; three columns within the plane’s 40 px padding. Nothing inside the plane is raised again.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · surface · many · top · the whole set on one raised plane')}<br><span style="color:#6B6459">Ground ${code('surface')} and containment ${code('none')} — A26·3's rule that a full-width fill is a ground. 15 Boxed is ${code('box')} on ${code('page')}; 13 Contact Sheet is ${code('surface')} with media ${code('inline')}.</span>`),
    K.specRow(3, 'Archetype', 'grid-of-N. No departures beyond the category’s one-column-at-390 step; the plane narrows with the content box and keeps its padding.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,296 · padding 40 · three columns 389 × 292 · heading 34 · section padding 96. ${b('834')} plane 754 · padding 32 · two columns 351 × 263 · heading 30 · padding 80. ${b('≤ 767')} plane 350 · padding 20 · one column 310 × 233 · heading 26 · padding 64. ${b('The plane never goes edge to edge')} ⚑.`),
    K.specRow(5, 'Content fields', `The category's five, all of them drawn: ${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('credit')} · ${code('images[]')}.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Two · Three · Four')} — Crop ${b('Square · Landscape · Portrait · As uploaded')} — Head ${b('Inside the plane · Above it')} — Captions ${b('Under each · In the lightbox only · Off')} — Lightbox ${b('On · Off')}. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → the plane holds its full width with one 389 px frame in it ⚑. ${b('2–3')} → one short row. ${b('many')} → wraps inside the padding; the last row is left-aligned and short.`),
    K.specRow(8, 'Empty state', `${b('Head: Inside the plane with every string empty leaves the plane holding frames alone')} ⚑, which is a legitimate section and identical to Head: Above it with no head authored. Failed image → the plate at the crop ratio with its alt text, as 1 Grid.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')} at 34 px — ${b('the size drops, the level does not')} ⚑. The plane is a ${code('&lt;div&gt;')} and carries no role; the set is a ${code('&lt;ul&gt;')}. ${b('The hairline is decoration and measures 1.3:1')}, which is stated rather than corrected — it is not carrying information ⚑. Caption 5.4:1 on surface in both modes.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid. ${b('At 1 image the plane does not shrink to fit')} ⚑.<br>${b('Flagged ⚑')} the plane as ground rather than containment · one raise never two · no card around a photograph · the plane keeping its edges at 390 · the heading at 34.`)
  ]]
};

/* ── 5 · Split Head ────────────────────────────────────────────────── */
const d5 = {
  n:5, name:'Split Head', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 5 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'The head held in a 380 column at the left with the set in a 868 column at the right, the two on a 48 px gutter. The essay’s title stays beside the photographs instead of above them.',
    'It is the gallery for a set that needs a paragraph of context read alongside it rather than before it — a commissioned essay, an archive selection, a series with a note about how it was made.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · 380 · 48 · 868 · TWO COLUMNS OF FRAMES AT 410 × 308 · HEAD STICKY: OFF',
  body(t, w) {
    const g = K.ground(t, 'page');
    if (w === 1440) {
      const inner = `<div style="display:flex;gap:48px;align-items:flex-start">
        <div style="width:380px;display:flex;flex-direction:column;gap:20px">
          ${K.headBlock(g, w, { measure:340, max:380, hSize:34 })}
          ${K.creditEl(g, {})}</div>
        <div style="width:868px">${K.gridBlock(t, g, { box:868, cols:2, gap:24, crop:'Landscape', captions:'Under each', n:6 })}</div></div>`;
      return P.stdWrap(t, w, inner);
    }
    const cols = w === 834 ? 2 : 1, gpx = w === 390 ? 16 : 20;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 40}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}
      ${K.gridBlock(t, g, { box:K.G(w).box, cols, gap:gpx, crop:'Landscape', captions:'Under each', n:6 })}
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner, { padNote:'THE SPLIT IS GONE BELOW 1,080 ⚑ · HEAD ABOVE, CREDIT UNDER THE SET' });
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const hw = 168, gw = box - hw - 24;
    return `<div style="display:flex;gap:24px;align-items:flex-start;width:${box}px">
      <div style="width:${hw}px">${K.headBlock(g, 390, { measure:hw, max:hw, hSize:20, blurbText:false })}</div>
      <div style="width:${gw}px">${K.gridBlock(t, g, { box:gw, cols:2, gap:14, crop:'Landscape', captions:'Under each', n:o.n, noCapAt:o.noCapAt, capSize:12 })}</div></div>`;
  },
  tileMin:230,
  primaryNote:`A9·5's two-column split, carried verbatim, with A14's grid in the wide column. ${b('380 · 48 · 868')} gives the head a 340 measure — a comfortable 45 characters — and leaves the set two columns of 410, ${b('wider frames than the three of 1 Grid')} ⚑, which is the argument for the arrangement: fewer, larger photographs beside their context. ${b('The head does not stick')} ⚑ — a sticky head is a ${code('sticky')} archetype and A14 does not have one; the panel offers it as a value and it is disabled with the reason.`,
  statesNote:`${b('The head column holds its 380 at every count')} ⚑ — it is not part of the set and does not move when the set does. At ${b('1')} the right column draws one 410 frame and ${b('the section is 380 · 48 · 410 with 458 px of empty right margin')} ⚑, which is the honest cost of a fixed split and the reason the panel names 1 Grid below three images.`,
  extraTiles:[{
    label:'THE SPLIT’S ONE HARD NUMBER',
    body:[
      `${b('Two columns need 1,081')} ⚑ — A16's finding, carried verbatim into A14 for the same reason at a different scale: below that the frame column is under 500 px and the head column is under 320, and a 300 px measure with a 34 px heading in it is a column of two-word lines.`,
      `${b('So this design collapses one breakpoint earlier than the archetype ladder')} ⚑, at 1,080 rather than 767 — and what it collapses to is exactly 1 Grid at two columns.`,
      `${b('Head column: Left or Right, and nothing else')} ⚑. There is no width value: 380 is the measure that works, and offering 300 or 460 would be offering a worse one.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS, ONE DISABLED VALUE + THE IMAGES BLOCK',
    name:'Split Head', n:5, sub:'Head beside the set.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Head column', ['Left', 'Right'], 0, 'Which side the head takes. The set takes the other; the gutter is 48 either way.'),
      K.seg('Columns', ['Two', 'Three'], 0, `Inside the 868 column — 410 at two, 273 at three. ${b('Four is not offered')} ⚑: 199 px frames beside a 34 px heading is a contact sheet, and that is design 13.`),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, 'All four live.'),
      K.seg('Captions', ['Under each', 'In the lightbox only', 'Off'], 0, 'The category’s three values.'),
      K.seg('Lightbox', ['On', 'Off'], 0, 'The same overlay as 1 Grid.'),
      K.sel('Head behaviour', 'Static — sticky not offered', `Read-only ⚑. ${b('A sticky head would make this a')} ${code('sticky')} ${b('archetype')}, which A14 has no design in and no module for — ${code('scroll-spy')} is the nearest and it tracks a list, not a head. A finding for the architect, not a new module.`, true)
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls and one locked row.')} Cut: a head-width value (380 is the measure that works ⚑), an alignment value (${b('both columns are flush left, always')} ⚑ — a centred head beside a left grid is two alignments in one section), and a gutter value.`,
      `${b('The credit moves with the head')} ⚑, not with the set — it sits under the blurb in the head column at 1440 and under the set below 1,080. It is the one element in A14 that changes parent with the width, and it is stated in the responsive rule rather than left to be discovered.`,
      `${b('Nothing here is per-item.')} The split is the section's; no frame can be pulled into the head column.`
    ]
  },
  tabletLabel:'834 · the split is gone · two columns',
  mobileLabel:'390 · one column, head above',
  respCap:'TABLET 834 · COLLAPSED AT 1,080 ⚑ · MOBILE 390 · ONE COLUMN',
  respNote:`split's ladder with ${b('one departure')}: ${b('it collapses at 1,080, not 767')} ⚑ — A16's number, for A14's reason. ${b('1440')} 380 · 48 · 868; head measure 340, heading 34, credit in the head column; frames 410 × 308 two-up. ${b('1080 and below')} one column: ${b('head · set · credit')} ⚑, heading 34 at 834 and 28 at 390, frames 367 × 275 two-up at 834 and 350 × 263 one-up at 390. ${b('The credit changes parent')} ⚑ — head column above 1,080, under the set below it.`,
  darkNote:`Token values only; no raise in either mode. ${b('The gutter is space, not a rule')} ⚑ — there is no vertical hairline between the columns at any value, in either mode, because a rule there would make the head look like a sidebar.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The head, blurb and credit in a 380 column beside a 868 column holding the set two-up, on a 48 px gutter. Fewer, larger frames read alongside their context.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · page · many · right · head held beside the set')}<br><span style="color:#6B6459">The only ${code('split')} in A14. Media ${code('right')} names where the pictures sit relative to the text, which is the whole claim; at Head column: Right the slot still reads ${code('right')} ⚑ — the tuple describes the default, and the mirror is a control.</span>`),
    K.specRow(3, 'Archetype', `split. ${b('One departure')} — collapses at 1,080 rather than 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} 380 · 48 · 868; head measure 340, heading 34; frames 410 × 308 on a 24 gap; credit in the head column; padding 96. ${b('1080')} one column, order ${b('head · set · credit')} ⚑. ${b('834')} heading 34, frames 367 × 275 two-up, padding 80. ${b('≤ 767')} heading 28, one column at 350 × 263, gap 16, padding 64.`),
    K.specRow(5, 'Content fields', `The category's five. ${b('The blurb is drawn at its full 200 characters here')} ⚑ — the 340 measure is the one place in A14 where a long blurb is an asset rather than a wrapping problem.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Head column ${b('Left · Right')} — Columns ${b('Two · Three')} — Crop ${b('Square · Landscape · Portrait · As uploaded')} — Captions ${b('Under each · In the lightbox only · Off')} — Lightbox ${b('On · Off')} — and ${b('Head behaviour, locked at Static')} ⚑. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one 410 frame in the right column and ${b('458 px of empty right margin')} ⚑; the panel names 1 Grid. ${b('2')} → one row of two. ${b('many')} → wraps inside the 868 column, last row left-aligned and short.`),
    K.specRow(8, 'Empty state', `${b('With no heading and no blurb the head column is the credit alone')} ⚑ and the design still holds — 380 of white beside the set is a legitimate composition, and the alternative (collapsing to one column when the head empties) would move the photographs when a user deletes a sentence ⚑.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE + ` ${b('The head does not stick and no module is declared for it')} ⚑.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')} at 34. ${b('The head column comes first in the DOM at both Head column values')} ⚑ — Right is a ${code('flex-direction')} swap, never ${code('order')}, so a keyboard reader always meets the title before the photographs. Set is a ${code('&lt;ul&gt;')}; frames ${code('&lt;figure&gt;')}.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid, designed for 4–8 here ⚑ rather than 3–12, because the right column is two-up.<br>${b('Flagged ⚑')} the 1,080 collapse · the credit changing parent · no head-width control · sticky refused and locked · Columns: Four withheld · the empty right margin at one image.`)
  ]]
};

return [d1, d2, d3, d4, d5];
})();
