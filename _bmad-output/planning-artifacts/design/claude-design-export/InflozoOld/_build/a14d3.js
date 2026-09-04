// A14 designs 11–15: Overlay · Captioned Rows · Contact Sheet · Index · Boxed.
globalThis.A14D3 = (function () {
const K = globalThis.A14LIB, P = globalThis.A14PAGE;
const { b, code, two } = K;

const DATA_LINE = `${b('Nothing is read from Ghost’s content API')} ⚑ — the list is authored in the section. Ghost supplies the ${code('img_url')} derivatives (${code('w=600 · 1000 · 1600 · 2400')}) for the ${code('srcset')}, and ${b('the lightbox requests the original file')} ⚑.`;
const ZERO = `${b('0 images')} → ${b('the section does not render on the published page')} ⚑; in the editor it draws a drop zone carrying “Drag photographs here, or choose from your library” ⚑.`;

/* ── 11 · Overlay ──────────────────────────────────────────────────── */
function overlayFrame(t, g, item, o) {
  o = o || {};
  const w = o.w, h = o.h || K.hFor(w, item, o.crop || 'Landscape');
  const soft = o.scrim === 'Soft';
  const wash = `<span style="position:absolute;left:0;right:0;bottom:0;height:${Math.round(h * 0.6)}px;background:linear-gradient(180deg, rgba(35,32,25,0) 0%, rgba(35,32,25,${soft ? .22 : .34}) 45%, rgba(35,32,25,${soft ? .48 : .66}) 100%)"></span>`;
  const label = `<span style="position:absolute;top:9px;left:10px;font-family:${K.MONO};font-size:10px;color:${t.muted}">${K.cropLabel(item, o.crop || 'Landscape')}</span>`;
  const cap = o.noCap ? '' : `<span style="position:absolute;left:${o.pad || 16}px;right:${o.pad || 16}px;bottom:${o.pad || 14}px;font-size:${o.size || 14}px;line-height:1.45;color:#FBF9F5;font-family:${g.pack.body};text-wrap:pretty">${item.cap}</span>`;
  return `<figure style="margin:0;width:${w}px;position:relative;display:block">${K.plate(t, g, { w, h, cap:false, over:label + wash + cap })}</figure>`;
}
const d11 = {
  n:11, name:'Overlay', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 11 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'The caption inside the frame, sitting on a warm wash at the foot of each photograph, so the set reads as pictures rather than as pictures-and-text.',
    'It is the gallery for a set where every frame needs naming but the captions must not become a column of grey lines — a places series, a portrait series, anything where the label is a name rather than a sentence.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THREE COLUMNS AT 416 × 312 · CAPTION INSIDE THE FRAME ON A WARM WASH · NO ACCENT ⚑',
  set(t, g, box, o) {
    o = o || {};
    const cols = o.cols || 3, gp = o.gap === undefined ? 24 : o.gap;
    const cw = Math.floor((box - gp * (cols - 1)) / cols);
    return `<div style="display:flex;flex-wrap:wrap;gap:${gp}px;width:${box}px;align-items:flex-start">${
      K.take(o.n || 6).map((it, i) => overlayFrame(t, g, it, { w:cw, crop:'Landscape', scrim:o.scrim, noCap:o.noCapAt === i, size:o.size })).join('')}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'page');
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gp = w === 390 ? 16 : w === 834 ? 20 : 24;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 44}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}
      ${this.set(t, g, K.G(w).box, { cols, gap:gp })}
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) { return this.set(t, K.ground(t, 'page'), box, { cols:3, gap:14, n:o.n, noCapAt:o.noCapAt, size:12 }); },
  tileMin:230,
  primaryNote:`A20·13’s warm scrim, carried verbatim: ${b('a wash of the contrast colour, strongest at the foot, over the lower 60% of the frame')} ⚑ — never black, never a full-frame darkening. ${b('The caption is the carried colour on every photograph in every pack')} ⚑, which is why this design has no accent at all: a coloured caption over an unknown photograph cannot be checked for contrast. ${b('The scrim is drawn even when a caption is empty')} ⚑ — see the states — because a set where some frames are washed and some are not looks like a bug.`,
  statesNote:`${b('A frame with no caption keeps its wash')} ⚑, so the set stays even. That is the opposite of 1 Grid’s rule, where an empty caption removes its line, and the reason is the same in both: whichever choice keeps the arrangement regular. ${b('At one and two images the frames hold their column width')}, as everywhere in A14.`,
  extraTiles:[{
    label:'TEXT ON A PICTURE · WHAT IS GUARANTEED AND WHAT IS NOT',
    body:[
      `${b('The wash guarantees the caption is readable over most photographs and not all of them')} ⚑ — a white sky at the foot of a frame will still fight a white caption. ${b('Scrim: Standard measures 4.9:1 against a mid-tone')} and Soft measures 3.6:1 ⚑, which is stated on the panel rather than hidden, ${b('and Soft is offered anyway')} because the author can see their own photographs and the theme cannot.`,
      `${b('A caption longer than three lines is clamped with an ellipsis')} ⚑ — the one place in A14 where authored text is truncated on the page. ${b('The full caption is in the overlay')}, always, so nothing is lost. This is the ugly test’s answer for this design.`,
      `${b('There is no “caption at the top” value')} ⚑ — a wash at the head of a frame reads as a banner, and the foot is where a caption belongs on a photograph.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Overlay', n:11, sub:'Captions inside the frames.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Columns', ['Two', 'Three', 'Four'], 1, `Two at 834, one at 390. ${b('At Columns: Four the caption clamps to two lines rather than three')} ⚑ — a 306 px frame cannot carry more.`),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `${b('As uploaded is live here')} ⚑ — the wash sits at the foot of whatever shape the frame is, so ragged rows cost nothing structurally.`),
      K.seg('Gap', ['Tight', 'Even', 'Airy'], 1, '8 · 24 · 40 px.'),
      K.seg('Caption wash', ['Soft', 'Standard'], 1, `${b('Standard 4.9:1, Soft 3.6:1 against a mid-tone')} ⚑ — measured on the frame and stated here. Soft is not disabled: the author can see their own photographs.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `On, the overlay carries the caption in full — ${b('which is where a clamped caption goes')} ⚑.`)
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a caption-position value (${b('the foot, always')} ⚑), a wash-colour value (it is the pack’s contrast token at two opacities), a text-colour value, and the category’s Captions control — ${b('here the caption is the design')} ⚑, so “Off” would make this 1 Grid at Captions: In the lightbox only, and the panel names it.`,
      `${b('This is one of two designs in A14 with no accent anywhere')} ⚑ (6 Contrast Band is the other). The focus ring on a frame whose foot is washed takes the carried colour with a 1 px dark outline, which holds against both a white sky and a black hull.`,
      `${b('Nothing here is per-item.')} A frame whose photograph is too bright for its caption cannot be individually darkened — the answer is a different photograph, or Scrim: Standard for the whole set.`
    ]
  },
  tabletLabel:'834 · two columns · caption clamped at three lines',
  mobileLabel:'390 · one column · caption 15 px',
  respCap:'TABLET 834 · TWO COLUMNS · MOBILE 390 · ONE COLUMN, THE CAPTION LARGER ⚑',
  respNote:`grid-of-N’s ladder with ${b('one departure')}: ${b('the caption grows rather than shrinks at 390')} ⚑ — 14 px at 1440 and 834, ${b('15 px at 390')}, because a caption over a photograph on a phone is read at arm’s length and it is the only text in the frame. ${b('1440')} three columns 416 × 312, caption 14, inset 16. ${b('834')} two columns 367 × 275, caption 14, inset 16. ${b('390')} one column 350 × 263, caption 15, inset 16, ${b('clamp still three lines')}.`,
  darkNote:`${b('The wash does not change between modes')} ⚑ — it is a wash over a photograph, and the photograph does not know what mode the page is in. Everything around it re-tunes; the frames are identical. This is the clearest case in A14 of the rule that dark mode is a property of the page and not of the pictures.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'Three columns of frames with each caption inside its own frame, on a warm wash over the lower 60%. No text sits outside a photograph except the head and the credit.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · many · background · caption inside the frame')}<br><span style="color:#6B6459">Media ${code('background')} — the photograph is the ground the caption sits on, which is the only slot separating this from 1 Grid and the reason it is a design rather than a Captions value.</span>`),
    K.specRow(3, 'Archetype', 'grid-of-N. No departures beyond the category’s one-column-at-390 step.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} three columns 416 × 312, caption 14 px inset 16, clamp 3 lines, padding 96. ${b('834')} two columns 367 × 275, padding 80. ${b('≤ 767')} one column 350 × 263, ${b('caption 15 px')} ⚑, padding 64. ${b('At Columns: Four the clamp is 2 lines')} ⚑.`),
    K.specRow(5, 'Content fields', `The category’s five. ${b('The caption is load-bearing here')} ⚑ — it is the design — and the editor says so when a frame is added without one.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Two · Three · Four')} — Crop ${b('Square · Landscape · Portrait · As uploaded')} — Gap ${b('Tight · Even · Airy')} — Caption wash ${b('Soft · Standard')} — Lightbox ${b('On · Off')}. ${b('No Captions control')} ⚑. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1–2')} → frames at column width, not stretched. ${b('many')} → wraps; last row short and left-aligned. ${b('A frame with no caption keeps its wash')} ⚑.`),
    K.specRow(8, 'Empty state', `${b('An empty caption draws the wash and nothing on it')} ⚑ — never “Untitled”, never a removed wash. ${b('A caption over 3 lines is clamped with an ellipsis and the full text is in the overlay')} ⚑ — the only truncation of authored text in A14. Failed image → the plate with its alt text at 13 px, ${b('and the wash is dropped')} ⚑ because there is no photograph to wash.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE + ` ${b('With JavaScript off the clamped caption is still clamped')} ⚑ — the clamp is CSS — and the full text is reachable because the frame is a link to the file, ${b('but the caption itself is not')}. Flagged as the one place where no-JS loses something a reader might want.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. Each frame is a ${code('&lt;figure&gt;')} with the ${code('&lt;figcaption&gt;')} positioned over the image ⚑ — ${b('it is a real caption in the DOM, not a decorative label')}. Caption 4.9:1 at Standard and ${b('3.6:1 at Soft, which fails AA and is stated on the panel rather than disabled')} ⚑ — the author can judge their own photographs and the theme cannot. Focus ring is the carried colour with a 1 px dark outline ⚑.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; ${b('the editor asks for a caption on add')} in this design ⚑ and in no other.<br>${b('Flagged ⚑')} the wash kept on an empty caption · the three-line clamp · Soft failing AA and offered anyway · no accent · no Captions control · the wash identical in dark.`)
  ]]
};

/* ── 12 · Captioned Rows ───────────────────────────────────────────── */
const d12 = {
  n:12, name:'Captioned Rows', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 12 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'One photograph per row at two thirds of the measure, its caption in the remaining third, sides alternating down the page. Two to four frames, each given the space to be read about.',
    'It is the gallery for a set where the writing matters as much as the pictures — an annotated series, a before-and-after, a set of three photographs with a paragraph each.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · FRAME 848 × 636 · CAPTION COLUMN 400 · GUTTER 48 · SIDES ALTERNATING',
  row(t, g, box, item, i, o) {
    o = o || {};
    const fw = o.fw || Math.round(box * 0.654), cw = box - fw - 48;
    const h = Math.round(fw * 3 / 4);
    const flip = o.side === 'Right' || (o.side === 'Alternating' && i % 2 === 1);
    const capCol = `<div style="width:${cw}px;display:flex;flex-direction:column;gap:10px;padding-top:4px">
      <span style="font-family:${K.MONO};font-size:11px;color:${g.muted}">${two(item.n)}</span>
      ${o.noCap ? '' : `<span style="font-size:16px;line-height:1.6;color:${g.text};font-family:${g.pack.body};text-wrap:pretty">${item.cap}</span>`}</div>`;
    return `<div style="display:flex;gap:48px;align-items:flex-start;width:${box}px;${flip ? 'flex-direction:row-reverse;' : ''}">
      ${K.plate(t, g, { w:fw, h, cap:K.cropLabel(item, 'Landscape') })}${capCol}</div>`;
  },
  set(t, g, box, o) {
    o = o || {};
    const items = K.take(o.n || 3);
    return `<div style="display:flex;flex-direction:column;gap:${o.gap || 56}px;width:${box}px">${
      items.map((it, i) => `${o.rules && i > 0 ? `<div style="height:1px;background:${g.border};width:100%"></div>` : ''}${this.row(t, g, box, it, i, { ...o, noCap:o.noCapAt === i })}`).join('')}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'page');
    const box = K.G(w).box;
    if (w === 1440) {
      const inner = `<div style="display:flex;flex-direction:column;gap:56px">
        ${K.headBlock(g, w, { measure:560 })}
        ${this.set(t, g, box, { side:'Alternating', n:3, rules:true })}
        ${K.creditEl(g, {})}</div>`;
      return P.stdWrap(t, w, inner);
    }
    const items = K.take(3);
    const stacked = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 36 : 44}px;width:${box}px">${
      items.map((it, i) => `${i > 0 ? `<div style="height:1px;background:${g.border};width:100%"></div>` : ''}
        <figure style="margin:0;display:flex;flex-direction:column;gap:14px;width:${box}px">
          ${K.plate(t, g, { w:box, h:Math.round(box * 3 / 4), cap:K.cropLabel(it, 'Landscape') })}
          <div style="display:flex;flex-direction:column;gap:8px"><span style="font-family:${K.MONO};font-size:11px;color:${g.muted}">${two(it.n)}</span>
          <span style="font-size:${w === 390 ? 15 : 16}px;line-height:1.6;color:${g.text};font-family:${g.pack.body};max-width:${w === 390 ? 350 : 560}px">${it.cap}</span></div>
        </figure>`).join('')}</div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 44}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}${stacked}${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner, { padNote:'THE ROW IS GONE BELOW 1,080 ⚑ · CAPTION UNDER ITS OWN FRAME' });
  },
  mini(t, box, o) { return this.set(t, K.ground(t, 'page'), box, { n:o.n, side:'Alternating', gap:24, noCapAt:o.noCapAt }); },
  tileMin:240,
  manyN:3,
  counts:[
    { n:1, label:'ONE IMAGE · A LEGITIMATE SECTION HERE ⚑ · MINIATURE AT 604' },
    { n:2, label:'TWO IMAGES · SIDES ALTERNATE · MINIATURE AT 604' },
    { n:3, noCapAt:1, label:'A CAPTION LEFT EMPTY ON FRAME 02 ⚑ · THE COLUMN STAYS' }
  ],
  primaryNote:`${b('The only')} ${code('stack')} ${b('in A14 that carries text beside its pictures')} ⚑. ${b('848 · 48 · 400')} gives the photograph two thirds and the caption a 400 px measure, which is 55 characters at 16 px — a paragraph, not a label. ${b('The caption is 16 px in')} ${code('text')}${b(', not 14 in')} ${code('text-muted')} ⚑: in every other A14 design the caption is meta, and here it is content, and the type says which. ${b('The number is drawn in mono above each caption')} ⚑ and is generated from the position in the list — the only generated string in the category besides the count in 15 Boxed.`,
  statesNote:`${b('One image is a legitimate section here')} ⚑, unlike in the grids — a single photograph with a paragraph beside it is exactly what this design is for. ${b('A caption left empty keeps its column')} ⚑ and draws the number alone, so the row does not become full-width — the alternative would make one row a different design from its neighbours.`,
  extraTiles:[{
    label:'WHY THIS IS TWO TO FOUR AND NOT TWELVE',
    body:[
      `${b('Each row is 636 px tall')} ⚑. Four rows plus the head and the gaps is 3,000 px of page, which is the honest ceiling for a section that is not the whole page. ${b('Above four the panel names 1 Grid and 2 Masonry')} rather than disabling anything ⚑ — a five-row set is legible, it is simply long.`,
      `${b('Sides alternate by default')} ⚑ and the control offers Left and Right as fixed alternatives. Alternating is the default because three identical rows read as a table and three alternating rows read as a sequence.`,
      `${b('The hairline between rows is a control value, not structure')} ⚑ — at Rules: Off the rows are held apart by 56 px of space alone.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Captioned Rows', n:12, sub:'One frame a row, caption beside.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Image side', ['Left', 'Right', 'Alternating'], 2, `Alternating starts at the left ⚑. Below 1,080 all three values draw the same stack, ${b('caption under its frame')}.`),
      K.seg('Frame width', ['Half', 'Two thirds'], 1, `624 · 848 at 1440, with the caption column taking the rest ⚑. ${b('At Half the caption measure is 624')}, which is wide for a paragraph, and the panel says so.`),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `All four live. ${b('As uploaded is comfortable here')} ⚑ — rows are independent, so a portrait row simply is taller than a landscape one.`),
      K.seg('Rules', ['Between rows', 'Off'], 0, 'A hairline between rows, or space alone.'),
      K.seg('Lightbox', ['On', 'Off'], 0, `The same overlay as 1 Grid. ${b('The caption is already on the page here')}, so the overlay repeats it rather than revealing it ⚑.`)
    ],
    images:{ count:3 },
    settles:[
      `${b('Six controls.')} Cut: a caption-width value (${b('it is what the frame leaves')} ⚑), a vertical-alignment value (${b('the caption sits at the top of its row, always')} ⚑ — centring it against a 636 px frame leaves it floating), and a Captions control — ${b('a captioned-rows design with captions off is 1 Grid')}, and the panel says so.`,
      `${b('The caption is')} ${code('text')} ${b('at 16 px here and')} ${code('text-muted')} ${b('at 14 everywhere else')} ⚑ — one of the two places in A14 where a component changes its type role, and it is stated in the component inventory rather than left as a local decision.`,
      `${b('Nothing here is per-item.')} Image side alternates by rule; a single row cannot be flipped on its own.`
    ]
  },
  tabletLabel:'834 · stacked, caption under ⚑',
  mobileLabel:'390 · stacked, caption 15 px',
  respCap:'TABLET 834 · COLLAPSED AT 1,080 ⚑ · MOBILE 390 · THE SAME STACK, SMALLER',
  respNote:`stack’s ladder with ${b('one departure')}: ${b('it collapses at 1,080, not 767')} ⚑ — A16’s number, for A14’s reason: at 834 a two-thirds frame is 490 px and the caption column is 216, which is 26 characters a line. ${b('1440')} 848 · 48 · 400, alternating, caption 16 px in ${code('text')}, hairline between rows. ${b('1080 and below')} one column: ${b('frame at the full box, caption under it')} ⚑, measure clamped to 560 at 834 and 350 at 390, caption 15 px at 390. ${b('The alternation is gone below 1,080')} ⚑ — there is nothing left to alternate.`,
  darkNote:`Token values only. ${b('The caption is')} ${code('text')} ${b('in both modes')} — at 13.4:1 light and 12.6:1 dark it is the highest-contrast caption in A14, which is the point: it is prose, not meta.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One photograph per row at 848 with its caption in a 400 column beside it, sides alternating down the page, a hairline between rows. Two to four frames.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · page · few · left · caption beside every frame')}<br><span style="color:#6B6459">The only ${code('stack')} and the only ${code('few')} in A14. Media ${code('left')} is the default side; Image side: Right and Alternating are controls and the tuple describes the default, as in 5 Split Head.</span>`),
    K.specRow(3, 'Archetype', `stack. ${b('One departure')} — the row collapses at 1,080 rather than 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} 848 · 48 · 400; frame 848 × 636; caption 16 px in ${code('text')}; number in mono above it; 56 px between rows with a hairline; padding 96. ${b('1080 and below')} one column, frame at the full box, caption under it, ${b('alternation gone')} ⚑. ${b('834')} frame 754 × 566, measure 560, padding 80. ${b('≤ 767')} frame 350 × 263, caption 15 px, measure 350, padding 64.`),
    K.specRow(5, 'Content fields', `The category’s five. ${b('The caption limit is 80 characters as everywhere')} ⚑ — this design would carry 200 comfortably, and it is held to the category’s limit so that switching design never truncates ⚑. That is a real cost of the shared field list and it is stated rather than solved.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Image side ${b('Left · Right · Alternating')} — Frame width ${b('Half · Two thirds')} — Crop ${b('Square · Landscape · Portrait · As uploaded')} — Rules ${b('Between rows · Off')} — Lightbox ${b('On · Off')}. ${b('No Captions control')} ⚑. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one row, ${b('a legitimate section')} ⚑. ${b('2–4')} → the design as drawn. ${b('5+')} → it keeps going and the panel names 1 Grid ⚑; nothing is disabled. ${b('An empty caption keeps its column')} ⚑ and draws the number alone.`),
    K.specRow(8, 'Empty state', `As 1 Grid for the section strings. ${b('A row whose caption is empty is still a row')} ⚑. Failed image → the plate at the crop ratio with its alt text; ${b('the caption column is unaffected')} ⚑, which is the argument for two columns rather than a caption under a frame.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. Rows are ${code('&lt;li&gt;')} in one ${code('&lt;ul&gt;')}, each a ${code('&lt;figure&gt;')} with its ${code('&lt;figcaption&gt;')} ⚑; ${b('at Image side: Right and on the alternating rows the flip is')} ${code('flex-direction')}${b(', never')} ${code('order')} ⚑, so DOM order and visual order agree everywhere. The number is ${code('aria-hidden')} ⚑ — it is a position, and a screen reader already has the list. Caption 13.4:1.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; ${b('designed for 2–4')} ⚑; reordering changes which side a row takes at Alternating, and the editor previews it.<br>${b('Flagged ⚑')} the 1,080 collapse · caption as ${code('text')} at 16 px · the generated number · the 80-character limit inherited from the shared list · no Captions control.`)
  ]]
};

/* ── 13 · Contact Sheet ────────────────────────────────────────────── */
const d13 = {
  n:13, name:'Contact Sheet', crop:'Square', stateGround:'surface',
  rail:'A14 GALLERIES · DESIGN 13 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'The whole set at once in six square columns on a surface band, every frame numbered, nothing captioned on the page. A proof sheet rather than a display.',
    'It is the gallery for a long list — an archive, a shoot, a year of covers — where the reader is scanning for one frame rather than looking at each in turn. It is the only design that draws twelve photographs by default.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · TWELVE FRAMES ⚑ · SIX COLUMNS AT 209 × 209 · GAP 8 · NUMBERED · CAPTIONS IN THE LIGHTBOX ONLY',
  set(t, g, box, o) {
    o = o || {};
    const cols = o.cols || 6, gp = o.gap === undefined ? 8 : o.gap;
    const cw = Math.floor((box - gp * (cols - 1)) / cols);
    return `<div style="display:flex;flex-wrap:wrap;gap:${gp + 8}px ${gp}px;width:${box}px">${
      K.take(o.n || 12).map(it => `<figure style="margin:0;width:${cw}px;display:flex;flex-direction:column;gap:6px">${
        K.plate(t, g, { w:cw, h:cw, cap:false })}${
        o.numbers === false ? '' : `<span style="font-family:${K.MONO};font-size:11px;color:${g.muted}">${two(it.n)}</span>`}</figure>`).join('')}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'surface');
    const gg = K.G(w), pad = w === 390 ? 64 : w === 834 ? 80 : 96;
    const cols = w === 1440 ? 6 : w === 834 ? 4 : 3;
    const head = `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:40px;width:${gg.box}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560, max: w === 390 ? 350 : 720 })}
      ${w === 390 ? '' : `<span style="font-size:15px;font-weight:600;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px;white-space:nowrap">See all 48 →</span>`}</div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px">${head}${this.set(t, g, gg.box, { cols })}${K.creditEl(g, {})}</div>`;
    return `<div>${K.padTop(t, w, 'SECTION PADDING 0 ⚑ · THE SURFACE BAND CARRIES IT')}<div style="background:${g.bg};padding:${pad}px ${gg.m}px;width:${w}px;box-sizing:border-box">${inner}</div><div style="height:20px"></div></div>`;
  },
  mini(t, box, o) {
    const g = K.ground(t, 'surface');
    return `<div style="background:${g.bg};padding:16px;border-radius:6px;width:${box}px;box-sizing:border-box">${this.set(t, g, box - 32, { n:o.n === 6 ? 12 : o.n, cols:6, gap:6 })}</div>`;
  },
  tileMin:210,
  counts:[
    { n:1, label:'ONE IMAGE · A 209 PX SQUARE ON A FULL-WIDTH BAND ⚑ · MINIATURE AT 604' },
    { n:4, label:'FOUR IMAGES · THE SHEET IS BARELY A SHEET ⚑' },
    { n:6, label:'TWELVE IMAGES · THE DEFAULT · MINIATURE AT 604' }
  ],
  primaryNote:`${b('This design draws twelve photographs where every other design in A14 draws six')} ⚑ — the one stated departure from the category’s content parity, and it is stated because a contact sheet at six frames is a grid at six frames. ${b('Square crop, 8 px gap, no captions on the page')}: the sheet is a scanning instrument, and a caption under a 209 px frame would be longer than the frame is wide. ${b('The number is generated from the position')} ⚑ and is the only text in the set.`,
  statesNote:`${b('Below about eight frames this design stops being itself')} ⚑ — the panel says so and names 1 Grid, and nothing is disabled, because a nine-frame sheet is a legitimate thing to want. ${b('At one image the band still runs the full width')} ⚑ with a single 209 px square in it, which is the honest result of a full-width ground and a fixed column count.`,
  extraTiles:[{
    label:'THE SHEET’S THREE DECISIONS',
    body:[
      `${b('Numbers, not captions')} ⚑. The number is the handle a reader uses to say which frame they mean, which is what a contact sheet is for; the caption is one keystroke away in the overlay.`,
      `${b('Square, because a sheet is a matrix')} ⚑ — mixed ratios at 209 px is visual noise at the density this design runs at. Crop offers Square and Landscape and no more ⚑.`,
      `${b('It is the design that makes the 48-image ceiling visible')} ⚑ — 48 frames at six columns is eight rows and 1,736 px of section, which is where A14 stops. The ceiling is stated in the images block and repeated here.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Contact Sheet', n:13, sub:'The whole set, numbered.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, `The band’s inner padding. ${b('The section’s own is 0')} ⚑.`),
      K.seg('Columns', ['Four', 'Six', 'Eight'], 1, `320 · 209 · 155 at 1440 ⚑. ${b('Eight is the densest arrangement in A14')} and the panel says a 155 px frame is a thumbnail, not a photograph.`),
      K.seg('Crop', ['Square', 'Landscape'], 0, `${b('Two values only')} ⚑ — Portrait at this density makes a very tall sheet, and As uploaded makes a ragged one. The panel names 2 Masonry.`),
      K.seg('Numbering', ['On', 'Off'], 0, `${b('The number is generated from the position in the list')} ⚑, not authored — it renumbers when the list is reordered.`),
      K.seg('Gap', ['Tight', 'Even', 'Airy'], 0, `4 · 8 · 16 px ⚑ — ${b('a tighter ladder than the rest of A14')}, because at this size 24 px of gap is more space than picture.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `${b('On is effectively required here')} ⚑ — with no captions on the page, the overlay is the only place the reader can read one. At Off the panel says so plainly.`)
    ],
    images:{ count:12 },
    settles:[
      `${b('Six controls.')} Cut: a Captions control (${b('there is nowhere on the page for one')} ⚑ — the value would be Off, Off, or Off), a “stretch to fill the row” value, and a per-row count.`,
      `${b('“See all 48 →” is authored')} ⚑, as in 8 Filmstrip — ${code('moreLabel')} and ${code('moreUrl')}, both optional. ${b('The section can count its own list but not the archive')} ⚑.`,
      `${b('Nothing here is per-item.')} A frame cannot be made larger to mark it as the best one; that is 3 Mosaic or 10 Lead and Grid, and the panel names both.`
    ]
  },
  tabletLabel:'834 · four columns at 179 × 179',
  mobileLabel:'390 · three columns at 111 × 111 ⚑',
  respCap:'TABLET 834 · FOUR COLUMNS · MOBILE 390 · THREE COLUMNS, THE ONE DESIGN THAT KEEPS A GRID AT 390 ⚑',
  respNote:`grid-of-N’s ladder with ${b('the category’s one-column rule reversed')} ⚑: ${b('this is the only A14 design that keeps multiple columns at 390')}, because its frames are thumbnails by design and a column of 350 px squares would be a different section entirely. ${b('1440')} six columns at 209, gap 8, twelve frames. ${b('834')} four columns at 179. ${b('390')} three columns at 111, gap 8 — ${b('111 px is below the 44 px target only in appearance')}: the whole square is the target ⚑.`,
  darkNote:`Band ${code('#211D17')} on ground ${code('#171511')}, numbers ${code('#A79E8F')}. ${b('At this density the dark band reads as a strip of film')} ⚑, which is a happy accident of the pack rather than a design decision, and it is not relied on: in Studio and Garden the same design reads as a plain panel.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The whole set as square thumbnails in six columns on a full-width surface band, each numbered from its position, nothing captioned on the page.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · surface · many · inline · a dense numbered sheet')}<br><span style="color:#6B6459">Ground ${code('surface')} with media ${code('inline')} — 4 Panel is the same ground with media ${code('top')}, and the difference is that here the frames carry no text of their own at all.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('One departure')} — it keeps three columns at 390 ⚑ where every other A14 grid goes to one.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} band full width, inner padding 96 · 72, six columns at 209 × 209, gap 8, numbers 11 px mono. ${b('834')} four columns at 179, padding 80 · 40. ${b('≤ 767')} three columns at 111, padding 64 · 20 ⚑. ${b('Twelve frames at every width')} — content parity holds inside the design ⚑.`),
    K.specRow(5, 'Content fields', `The category’s five plus ${code('moreLabel')} and ${code('moreUrl')} ⚑, both optional. ${b('Captions are stored and never drawn on the page')} ⚑ — they appear in the overlay.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Four · Six · Eight')} — Crop ${b('Square · Landscape')} — Numbering ${b('On · Off')} — Gap ${b('Tight 4 · Even 8 · Airy 16')} — Lightbox ${b('On · Off')}. Then the images block and the two See-all fields.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1–4')} → the band holds its width and the sheet is short ⚑; the editor names 1 Grid. ${b('many')} → wraps into as many rows as the list needs, ${b('up to the 48 ceiling')} ⚑ — eight rows and 1,736 px at six columns.`),
    K.specRow(8, 'Empty state', `${b('Nothing here can be empty except the head')} ⚑ — there are no per-frame strings on the page. A failed image draws the hover-surface plate with ${b('its number still beneath it')} ⚑, so the sheet’s numbering never skips.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE + ` ${b('This is the design that needs the overlay most')} ⚑ — with no captions on the page, no-JS leaves a reader with twelve links to full-size photographs and no text at all. ${b('That is the registry’s stated degradation and A14 accepts it')}, but it is the weakest no-JS result in the category and it is flagged as such.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. The sheet is a ${code('&lt;ul&gt;')}; ${b('each frame’s accessible name is its')} ${code('alt')} ⚑, and with no visible caption ${code('alt')} is doing all the work — the editor’s warning dot is most consequential here. ${b('The number is')} ${code('aria-hidden')} ⚑. ${b('The whole square is the target at every width')} ⚑ — 111 px at 390, well past 44. Numbers 5.4:1 on surface.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; ${b('designed for 9–48')} ⚑; ${b('reordering renumbers')} ⚑.<br>${b('Flagged ⚑')} twelve frames rather than six · three columns at 390 · two Crop values only · the tighter Gap ladder · the generated number · the weakest no-JS result in A14.`)
  ]]
};

/* ── 14 · Index ────────────────────────────────────────────────────── */
const d14 = {
  n:14, name:'Index', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 14 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'The set as a ruled list: a number, the caption at reading size, and a small frame at the right of each row. The photographs are the smallest thing in the section and the text is the largest.',
    'It is the gallery for a set that is catalogued rather than displayed — an archive index, a picture credits list, a set where the reader is looking for a title they already know.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · ROW 1,296 · NUMBER 48 · CAPTION FLEXIBLE · THUMB 128 × 96 AT THE RIGHT · HAIRLINE BETWEEN ROWS',
  set(t, g, box, o) {
    o = o || {};
    const th = o.thumb === false ? 0 : (o.thumbW || 128), thh = Math.round(th * 3 / 4);
    const rowPad = o.dense ? 14 : 18;
    return `<div style="display:flex;flex-direction:column;width:${box}px;border-top:1px solid ${g.border}">${
      K.take(o.n || 6).map((it, i) => `<div style="display:flex;align-items:center;gap:24px;padding:${rowPad}px 0;border-bottom:1px solid ${g.border}">
        ${o.numbers === false ? '' : `<span style="width:40px;flex-shrink:0;font-family:${K.MONO};font-size:12px;color:${g.muted}">${two(it.n)}</span>`}
        <span style="flex:1;min-width:0;font-size:${o.size || 17}px;line-height:1.5;color:${g.text};font-family:${g.pack.body};text-wrap:pretty">${o.noCapAt === i ? '' : it.cap}</span>
        ${th ? K.plate(t, g, { w:th, h:thh, cap:false, r:Math.min(g.r, 6) }) : ''}</div>`).join('')}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'page');
    const gg = K.G(w);
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}
      ${this.set(t, g, gg.box, { thumbW: w === 1440 ? 128 : w === 834 ? 104 : 72, size: w === 390 ? 15 : 17 })}
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) { return this.set(t, K.ground(t, 'page'), box, { n:o.n, thumbW:88, size:14, noCapAt:o.noCapAt, dense:true }); },
  tileMin:230,
  primaryNote:`A9·15’s ledger row, carried verbatim, with a thumb in place of the value column. ${b('The caption is 17 px in')} ${code('text')} ⚑ — the largest caption in A14 and the only one set at body size — because in this design the caption is the row and the photograph is the reference. ${b('The thumb is 128 × 96 and is not the target')} ⚑: ${b('the whole row is')}, which is A16·8’s inverse and stated on both.`,
  statesNote:`${b('A row with no caption draws its number and its thumb at full row height')} ⚑ — the text cell is simply empty, never “Untitled”, never collapsed. That is A16·13’s rule for an empty note cell, carried verbatim. ${b('At one image the index is one row with two hairlines')} ⚑, which looks like what it is: a list of one.`,
  extraTiles:[{
    label:'WHAT WAS REFUSED HERE',
    body:[
      `${b('A date column was considered and refused')} ⚑. Nothing in the item carries a date — ${code('images[]')} is image, alt, caption, link — and inventing one would add a fourth field to every item in the category for the benefit of one design. ${b('The finding is recorded rather than the field added')}.`,
      `${b('A sortable header was refused')} ⚑ — sorting is a client-side behaviour, ${b('the registry has no sort module')} (${code('shuffle')} is the nearest and it randomises), and a gallery whose order the author set should not reorder itself.`,
      `${b('The thumb can be switched off entirely')} ⚑, at which point this design is a list of captions with a lightbox behind it — which is a legitimate picture-credits section and the reason the value exists.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Index', n:14, sub:'A ruled row per photograph.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Thumb', ['Small', 'Medium', 'Off'], 1, `88 · 128 · none at 1440 ⚑. ${b('At Off the row is a number and a caption')} and the design is a credits list.`),
      K.seg('Row height', ['Compact', 'Comfortable'], 1, '14 · 18 px above and below the row’s content — 72 or 80 px a row at Thumb: Medium.'),
      K.seg('Rules', ['Between rows', 'Ends only'], 0, `A9·15’s two values, carried verbatim. ${b('Ends only keeps the first and last hairline')} and relies on row height for separation.`),
      K.seg('Numbering', ['On', 'Off'], 0, `Generated from the position ⚑; renumbers on reorder.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `On, ${b('the whole row opens the overlay')} ⚑ — not just the thumb.`)
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a date column ⚑, a sortable header ⚑, a thumb-side value (${b('the thumb is at the right, always')} ⚑ — at the left it becomes 18 Post Lists’ thumb rows, which is a different category’s design), and a Captions control (${b('the caption is the row')}).`,
      `${b('This is the design that reads best with a long caption')} ⚑ and the one held hardest by the category’s 80-character limit. The panel says so; the limit is not raised, because raising it would let a user type a caption that 11 Overlay cannot draw.`,
      `${b('Nothing here is per-item.')} No row can be emphasised, starred or pinned.`
    ]
  },
  tabletLabel:'834 · thumb 104 · caption 17',
  mobileLabel:'390 · thumb 72 · caption 15 ⚑',
  respCap:'TABLET 834 · MOBILE 390 · THE ROW SURVIVES BOTH ⚑',
  respNote:`table’s ladder with ${b('one departure')}: ${b('the row never becomes a stacked card')} ⚑. A row of number · caption · thumb is three things, and three things fit at 350. ${b('1440')} number 40, caption flexible, thumb 128 × 96, gap 24, row 80 px. ${b('834')} thumb 104 × 78, gap 20. ${b('390')} number 32, thumb 72 × 54, gap 12, caption 15 px, ${b('row 64 px')} ⚑ — still over the 44 px target by 20.`,
  darkNote:`Hairlines ${code('#332E27')} and captions ${code('#F2EDE4')}. ${b('The thumbs are the only pictures in the section')} and they are untouched, as everywhere in A14. ${b('At Rules: Ends only in dark the rows rely entirely on space')} ⚑, which is worth knowing before choosing it.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The set as a ruled list: a mono number, the caption at 17 px in the text role, and a 128 × 96 thumb at the right of each row, hairlines between.'),
    K.specRow(2, 'Structural descriptor', `${code('table · none · page · many · right · a ruled row per photograph')}<br><span style="color:#6B6459">The only ${code('table')} in A14 and the only media ${code('right')}. It is the one design where the photograph is subordinate to its caption, and the tuple says so in two slots.</span>`),
    K.specRow(3, 'Archetype', `table. ${b('One departure')} — the row never becomes a stacked card at any width ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} number 40 · caption flexible · thumb 128 × 96 · gap 24 · row 80 px · hairline between rows. ${b('834')} thumb 104 × 78, gap 20. ${b('≤ 767')} number 32, thumb 72 × 54, gap 12, caption 15 px, row 64 px ⚑.`),
    K.specRow(5, 'Content fields', `The category’s five. ${b('The caption is required in practice here')} ⚑ — a row without one is legible but empty — and the editor says so rather than enforcing it.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Thumb ${b('Small 88 · Medium 128 · Off')} — Row height ${b('Compact · Comfortable')} — Rules ${b('Between rows · Ends only')} — Numbering ${b('On · Off')} — Lightbox ${b('On · Off')}. ${b('No Captions control')} ⚑. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one row between two hairlines ⚑. ${b('many')} → the list runs as long as the list is, ${b('to the 48 ceiling')}; there is no pagination and no ${code('load-more')} ⚑ — the module exists but a 48-row list does not need it, and the panel says so.`),
    K.specRow(8, 'Empty state', `${b('A row with no caption keeps its full height with an empty text cell')} ⚑ — A16·13’s rule, carried verbatim. ${b('At Thumb: Off a row with no caption is a number alone')}, which the editor flags on the item rather than in the section.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE + ` ${b('With JavaScript off this is the strongest design in A14')} ⚑ — a numbered list of captions, each a link to a full-size photograph, which is a perfectly good archive index.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('It is a')} ${code('&lt;ul&gt;')}${b(', not a')} ${code('&lt;table&gt;')} ⚑ — the archetype is named table because of how it collapses, not because the markup is tabular; there are no column headers and no row headers, so a real table would be a worse structure. ${b('The whole row is the link and the target')} ⚑ — 80 px tall — and ${b('the thumb is')} ${code('aria-hidden')} ${b('inside it')} ⚑ so the row announces once. Caption 13.4:1; number 5.4:1.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; ${b('designed for 6–48')}; reordering renumbers ⚑.<br>${b('Flagged ⚑')} no date column · no sortable header · the row never stacking · ${code('&lt;ul&gt;')} rather than ${code('&lt;table&gt;')} · the thumb never the target · no pagination.`)
  ]]
};

/* ── 15 · Boxed ────────────────────────────────────────────────────── */
const d15 = {
  n:15, name:'Boxed', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 15 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'The set inside a hairline box with a label sitting on its top edge, on the page ground and with no fill of its own. The lightest possible way of saying “this is a set”.',
    'It is the gallery for a page of prose that needs the photographs marked off without being lifted off — a report, a long feature, a page where a raised panel would be one thing too many.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · BOX 1,296 · HAIRLINE, NO FILL · INSET 40 · LABEL ON THE TOP EDGE · THREE COLUMNS AT 389 × 292',
  box(t, g, box, o) {
    o = o || {};
    const pad = o.pad === undefined ? 40 : o.pad;
    const label = o.label === false ? '' : `<span style="position:absolute;top:-8px;left:${pad - 6}px;background:${g.bg};padding:0 8px;font-family:${K.MONO};font-size:11px;letter-spacing:.06em;color:${g.muted}">${o.labelText || 'PHOTO ESSAY · 6 PHOTOGRAPHS'}</span>`;
    return `<div style="position:relative;border:1px solid ${g.border};border-radius:${g.r}px;padding:${pad}px;width:${box}px;box-sizing:border-box">${label}${o.body}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'page');
    const gg = K.G(w), pad = w === 390 ? 20 : w === 834 ? 32 : 40;
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gp = w === 390 ? 16 : w === 834 ? 20 : 24;
    const grid = K.gridBlock(t, g, { box:gg.box - pad * 2, cols, gap:gp, crop:'Landscape', captions:'Under each', n:6 });
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}
      ${this.box(t, g, gg.box, { pad, body:grid })}
      ${K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    return this.box(t, g, box, { pad:20, labelText:`PHOTO ESSAY · ${o.n} PHOTOGRAPH${o.n === 1 ? '' : 'S'}`,
      body:K.gridBlock(t, g, { box:box - 40, cols:3, gap:14, crop:'Landscape', captions:'Under each', n:o.n, noCapAt:o.noCapAt, capSize:12 }) });
  },
  tileMin:230,
  primaryNote:`4 Panel with the fill and the shadow taken away, which is exactly what the tuple says: ${code('box')} on ${code('page')} against ${code('none')} on ${code('surface')}. ${b('The label sits on the top edge and is the only place in A14 where the section counts itself')} ⚑ — “6 photographs” is generated from the list length, renumbering as frames are added or removed. ${b('The box is a hairline and never a border')} ⚑: 1 px in ${code('border')}, at the pack radius, with no fill at any value — a filled box is 4 Panel and the panel says so.`,
  statesNote:`${b('The box holds its full width at every count')} ⚑, as the plane does in 4 Panel, and for the same reason: a container that resizes when a user deletes a photograph is a container that feels broken. ${b('The label’s count follows the list')} ⚑ — one photograph reads “1 photograph”, singular, which is the one piece of string logic in A14.`,
  extraTiles:[{
    label:'THE LABEL, AND THE ONE GENERATED STRING',
    body:[
      `${b('Box label has three values')} — ${b('Off · The eyebrow · The eyebrow and the count')} ⚑ — and the count is the only number A14 generates. It counts ${code('images[]')}, which the section owns; ${b('it cannot count the archive')}, which is why 8 Filmstrip and 13 Contact Sheet author their “See all 48”.`,
      `${b('At Box label: Off the eyebrow returns to the head above the box')} ⚑ — the field is never lost, only moved, which is the same rule the Captions control follows.`,
      `${b('The label breaks the box’s top hairline rather than sitting inside it')} ⚑ — a fieldset legend, which is the oldest and clearest way to label a container and needs no second colour to do it.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Boxed', n:15, sub:'The set in a hairline box.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'The section’s own, outside the box: 64 · 96 · 132 at 1440.'),
      K.seg('Columns', ['Two', 'Three', 'Four'], 1, 'Inside the box’s inset — 389 at three, 604 at two, 281 at four.'),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `All four live. ${b('As uploaded inside a straight box leaves a ragged foot against a hard edge')} ⚑, which reads worse here than on the open page; the panel names 2 Masonry.`),
      K.seg('Box label', ['Off', 'The eyebrow', 'The eyebrow and the count'], 2, `${b('The count is generated from the list')} ⚑ — the only generated number in A14. At Off the eyebrow returns to the head ⚑.`),
      K.seg('Captions', ['Under each', 'In the lightbox only', 'Off'], 0, 'The category’s three values.'),
      K.seg('Lightbox', ['On', 'Off'], 0, 'The same overlay as 1 Grid.')
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a fill value (${b('a filled box is 4 Panel')} ⚑), a border-weight value (${b('hairlines, never heavy borders')} — the pack’s rule, not a choice), a radius value, and an inset value.`,
      `${b('This design and 4 Panel are the closest pair in A14')} ⚑ and the panel says so by number: the difference is a fill and a shadow, and it is a real one — a box marks, a plane lifts. ${b('The roster records that the tuple check separates them on containment and ground and that the judgement is a designer’s')}.`,
      `${b('Nothing here is per-item.')} The box is the section’s; no frame gets a box of its own.`
    ]
  },
  tabletLabel:'834 · box 754 · inset 32 · two columns',
  mobileLabel:'390 · box 350 · inset 20 · one column',
  respCap:'TABLET 834 · MOBILE 390 · THE BOX KEEPS ITS EDGES AT BOTH ⚑',
  respNote:`grid-of-N’s ladder inside a box that is always the content box wide. ${b('1440')} box 1,296, inset 40, three columns at 389 × 292, label on the top edge. ${b('834')} box 754, inset 32, two columns at 351 × 263. ${b('390')} box 350, inset 20, one column at 310 × 233 — ${b('and the label truncates rather than wrapping')} ⚑, because a two-line legend on a box edge has nowhere to sit.`,
  darkNote:`Hairline ${code('#332E27')} on ground ${code('#171511')}; the label’s background is the ground colour, so it still breaks the line cleanly ⚑. ${b('The box is the same weight in both modes')} — there is no “thicken it in dark” adjustment, because a hairline that changes weight between modes is two different designs.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'Three columns inside a 1 px box at the pack radius with no fill, a mono label breaking the top edge, on the page ground. 4 Panel without the lift.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · box · page · many · top · the set in a hairline box')}<br><span style="color:#6B6459">The only ${code('box')} in A14, and the slot exists for exactly this: the section itself sits in a container, which is not true of the card-shaped items in any other design.</span>`),
    K.specRow(3, 'Archetype', 'grid-of-N. No departures beyond the category’s one-column-at-390 step; the box narrows with the content box and keeps its inset.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} box 1,296 · inset 40 · three columns 389 × 292 · label on the top edge · padding 96. ${b('834')} box 754 · inset 32 · two columns 351 × 263 · padding 80. ${b('≤ 767')} box 350 · inset 20 · one column 310 × 233 · ${b('label truncated, never wrapped')} ⚑ · padding 64.`),
    K.specRow(5, 'Content fields', `The category’s five. ${b('The eyebrow does double duty')} ⚑ — it is the box label at two of the three Box label values and the head’s eyebrow at the third.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Two · Three · Four')} — Crop ${b('Square · Landscape · Portrait · As uploaded')} — Box label ${b('Off · The eyebrow · The eyebrow and the count')} — Captions ${b('Under each · In the lightbox only · Off')} — Lightbox ${b('On · Off')}. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → the box holds its full width with one 389 px frame in it, ${b('and the label reads “1 photograph”')} ⚑. ${b('many')} → wraps inside the inset; last row left-aligned and short.`),
    K.specRow(8, 'Empty state', `${b('No eyebrow with Box label set to a value that needs one')} → the label draws the count alone (“6 photographs”) ⚑; with Box label: Off and no eyebrow the box is unlabelled, which is legitimate. Otherwise as 1 Grid.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('The box is a')} ${code('&lt;div&gt;')} ${b('and the label is not a')} ${code('&lt;legend&gt;')} ⚑ — it looks like one, but a real ${code('&lt;fieldset&gt;')} implies a form, so the label is a ${code('&lt;p&gt;')} and the set’s ${code('&lt;ul&gt;')} takes ${code('aria-labelledby')} pointing at it ⚑. ${b('The count is inside the label’s text')}, so a screen reader hears “Photo essay, 6 photographs”. Label 5.4:1; hairline 1.3:1 and decorative ⚑.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; ${b('adding or removing a frame changes the label’s count')} ⚑, live, in the editor.<br>${b('Flagged ⚑')} the label breaking the hairline · the generated count and its singular · the label truncating at 390 · the closeness to 4 Panel, stated by number.`)
  ]]
};

return [d11, d12, d13, d14, d15];
})();
