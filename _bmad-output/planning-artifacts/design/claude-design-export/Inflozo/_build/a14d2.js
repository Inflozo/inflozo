// A14 designs 6–10: Contrast Band · Carousel · Filmstrip · Full Bleed · Lead and Grid.
globalThis.A14D2 = (function () {
const K = globalThis.A14LIB, P = globalThis.A14PAGE;
const { b, code, two } = K;

const DATA_LINE = `${b('Nothing is read from Ghost’s content API')} ⚑ — the list is authored in the section. Ghost supplies the ${code('img_url')} derivatives (${code('w=600 · 1000 · 1600 · 2400')}) for the ${code('srcset')}, and ${b('the lightbox requests the original file')} ⚑.`;
const ZERO = `${b('0 images')} → ${b('the section does not render on the published page')} ⚑; in the editor it draws a drop zone carrying “Drag photographs here, or choose from your library” ⚑.`;
const ALT_LINE = `${b('alt is not the caption')} ⚑ — separate fields, separate jobs; a frame with no alt gets ${code('alt=""')} and the caption does the describing.`;

function bandWrap(t, w, inner, g, o) {
  o = o || {};
  const gg = K.G(w), pad = w === 390 ? 64 : w === 834 ? 80 : 96;
  const label = `<div style="padding:0 ${gg.m}px"><div style="height:26px;display:flex;align-items:flex-end;padding-bottom:6px"><span style="font-family:${K.MONO};font-size:10px;color:${t.muted}">${o.label || 'SECTION PADDING 0 AT EVERY WIDTH · THE BAND CARRIES IT ⚑'}</span></div></div>`;
  return `<div>${label}<div style="background:${g.bg};padding:${pad}px ${gg.m}px;box-sizing:border-box;width:${w}px"><div style="width:${gg.box}px">${inner}</div></div><div style="height:20px"></div></div>`;
}

/* ── 6 · Contrast Band ─────────────────────────────────────────────── */
const d6 = {
  n:6, name:'Contrast Band', crop:'Landscape', stateGround:'contrast',
  rail:'A14 GALLERIES · DESIGN 6 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'The same three columns as 1 Grid, standing on an inverted band that runs the full width of the page and carries the section’s padding itself.',
    'It is the gallery that has to separate itself from what is above and below it — a set dropped into the middle of a long page, where a change of ground does the work a rule or a box would do badly.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · BAND EDGE TO EDGE · CONTENT 1,296 · THREE COLUMNS AT 416 × 312 · NO ACCENT ON THE BAND ⚑',
  body(t, w) {
    const g = K.ground(t, 'contrast');
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gp = w === 390 ? 16 : w === 834 ? 20 : 24;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 44}px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}
      ${K.gridBlock(t, g, { box:K.G(w).box, cols, gap:gp, crop:'Landscape', captions:'Under each', n:6 })}
      ${K.creditEl(g, {})}</div>`;
    return bandWrap(t, w, inner, g);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'contrast');
    return `<div style="background:${g.bg};padding:20px;border-radius:6px;box-sizing:border-box;width:${box}px">${K.gridBlock(t, g, { box:box - 40, cols:3, gap:14, crop:'Landscape', captions:'Under each', n:o.n, noCapAt:o.noCapAt, capSize:12 })}</div>`;
  },
  tileMin:230,
  primaryNote:`A17·7's on-contrast derivation, carried verbatim: ${b('every colour on the band comes from the two contrast tokens')} ⚑ — text is the carried colour, captions are that colour at 72%, hairlines at 20%. ${b('The striped placeholder is re-derived for the band')} ⚑ and so is the real thing’s surround; ${b('the photographs themselves are untouched')}. ${b('No accent appears anywhere on the band')} ⚑ — A29·3's finding, carried verbatim: the Paper accent measures 4.0:1 against ${code('#232019')} and fails AA, so the focus ring on the band is the carried colour instead ⚑.`,
  statesNote:`${b('The band does not shrink with the count')} ⚑ — one image on a full-width inverted band is a lot of dark for one photograph, and the panel says so and names 1 Grid. ${b('Below three images the band is a poor container')} and the editor says it rather than silently switching design ⚑. Otherwise the counts behave exactly as 1 Grid: nothing stretches, the last row is short and left-aligned.`,
  extraTiles:[{
    label:'WHAT THE BAND CHANGES, AND WHAT IT MUST NOT',
    body:[
      `${b('The band carries the section’s vertical padding')} ⚑ — the section’s own padding is 0 at every width, which is A16·5's rule and A17·7's before it. Without that the band would float in a gap and read as a very wide card.`,
      `${b('It bleeds at every width, including 390')} ⚑ — a contrast band with margins is 4 Panel in the wrong colour.`,
      `${b('Photographs are never tinted to match the band')} ⚑. The ground inverts; the pictures do not. This is the same rule as dark mode, stated in a second place because a band is where the temptation is strongest.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Contrast Band', n:6, sub:'The set on an inverted band.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, `The band’s inner padding — 64 · 96 · 132 at 1440. ${b('The section’s own is 0 at every value')} ⚑.`),
      K.seg('Columns', ['Two', 'Three', 'Four'], 1, 'The desktop count; two at 834, one at 390.'),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `All four live. ${b('As uploaded on a band leaves ragged dark between the frames')} ⚑, which reads worse here than on the page ground; the panel says so.`),
      K.seg('Gap', ['Tight', 'Even', 'Airy'], 1, '8 · 24 · 40 px.'),
      K.seg('Captions', ['Under each', 'In the lightbox only', 'Off'], 0, `On the band the caption is the carried colour at 72% — ${b('5.9:1')} in Paper light ⚑.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `The same overlay as 1 Grid. ${b('The overlay is not re-derived for the band')} ⚑ — it is dark in both modes and in all twelve packs, because it is a room with the lights off.`)
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a band-colour value (${b('it is the pack’s contrast token or it is nothing')} ⚑), a width value (${b('the band bleeds, always')} ⚑ — a contained band is 4 Panel), and a “round the band’s corners” value.`,
      `${b('The accent is absent from this design entirely')} ⚑, which makes it one of two in A14 (the other is 11 Overlay, on the same contrast reasoning). Where every other design would put an accent — the focus ring — this one puts the carried colour, and the panel states the ratio.`,
      `${b('Nothing here is per-item.')} The band is the section’s ground; no frame sits on a ground of its own.`
    ]
  },
  tabletLabel:'834 · band bleeds · two columns',
  mobileLabel:'390 · band bleeds · one column',
  respCap:'TABLET 834 · MOBILE 390 · THE BAND BLEEDS AT BOTH ⚑',
  respNote:`grid-of-N's ladder inside a band that is always the full width. ${b('1440')} band 1,440 wide, inner padding 96 · 72, content 1,296, three columns at 416 × 312. ${b('834')} inner padding 80 · 40, content 754, two columns at 367 × 275. ${b('390')} inner padding 64 · 20, content 350, one column at 350 × 263. ${b('The band never gains a margin and never gains a radius')} ⚑.`,
  darkNote:`In dark the contrast token inverts the other way — band ${code('#EDE7DA')} carrying ${code('#171511')} ⚑ — so ${b('the light band is the dark-mode frame')}. That is A17·7's derivation and it is the single most surprising thing in the pack: ${b('the section that is dark in light mode is light in dark mode')}, on purpose, because contrast means “against the ground” and not “dark”. Captions on it measure 6.1:1.`,
  spec:[[
    K.specRow(1, 'Descriptor', '1 Grid’s three columns standing on a full-bleed inverted band that carries the section’s padding. The ground is the whole of the difference.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · contrast · many · top · the set on an inverted band')}<br><span style="color:#6B6459">Ground ${code('contrast')} is the only slot that separates this from 1 Grid, and settlement-wise that is the point: the same header on ${code('surface')} and on ${code('contrast')} are two designs.</span>`),
    K.specRow(3, 'Archetype', 'grid-of-N. No departures beyond the category’s one-column-at-390 step. The band bleeds at every width.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} band full width, inner padding 96 vertical · 72 horizontal, content 1,296, three columns 416 × 312. ${b('834')} 80 · 40, content 754, two columns 367 × 275. ${b('≤ 767')} 64 · 20, content 350, one column 350 × 263. ${b('Section padding is 0 at every width')} ⚑.`),
    K.specRow(5, 'Content fields', `The category’s five: ${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('credit')} · ${code('images[]')}. ${ALT_LINE}`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Two · Three · Four')} — Crop ${b('Square · Landscape · Portrait · As uploaded')} — Gap ${b('Tight · Even · Airy')} — Captions ${b('Under each · In the lightbox only · Off')} — Lightbox ${b('On · Off')}. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1–2')} → the band holds its full width ⚑ and the editor names 1 Grid. ${b('many')} → as 1 Grid.`),
    K.specRow(8, 'Empty state', `As 1 Grid, with one addition: ${b('a failed image draws the band’s own plane')} (carried colour at 6%) rather than the page’s hover surface ⚑, so the hole in the set is not a bright rectangle on a dark band.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. Every colour derived from two tokens; ${b('the focus ring is the carried colour, not the accent')} ⚑ — Paper’s accent is 4.0:1 on ${code('#232019')} and fails AA, which A29·3 found and this design inherits. Text 13.1:1, caption 5.9:1 light and 6.1:1 dark.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; designed for 3–12.<br>${b('Flagged ⚑')} the band carrying the padding · bleeding at 390 · no accent anywhere · the overlay not re-deriving · photographs never tinted · the light band in dark mode.`)
  ]]
};

/* ── 7 · Carousel ──────────────────────────────────────────────────── */
const d7 = {
  n:7, name:'Carousel', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 7 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'One photograph at a time on a snapping track, the frames either side showing at the margins so the reader can see there is more. Dots and a counter beneath, arrows beside the head.',
    'It is the gallery for a set that is too big for a grid or too slow to scroll — twenty frames on a page that has other things to say. It is the only design in A14 where the reader sees one picture at a time by default.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · ACTIVE FRAME 968 × 726 · PEEK 140 EACH SIDE · DOTS + COUNTER · NO AUTOPLAY AT ANY VALUE ⚑',
  track(t, g, w) {
    const box = K.G(w).box;
    const cfg = w === 1440 ? { active:968, peek:140, gap:24 } : w === 834 ? { active:594, peek:60, gap:20 } : { active:302, peek:12, gap:12 };
    const ah = Math.round(cfg.active * 3 / 4);
    const items = K.take(6);
    const peekEl = (it, side) => `<span style="width:${cfg.peek}px;height:${ah}px;border-radius:${g.r}px;background:${g.stripe};display:block;flex-shrink:0;opacity:.55"></span>`;
    return `<div style="display:flex;gap:${cfg.gap}px;width:${box}px;align-items:flex-start;overflow:hidden">
      ${peekEl(items[1], 'prev')}
      <div style="display:flex;flex-direction:column;gap:14px;width:${cfg.active}px">
        ${K.plate(t, g, { w:cfg.active, h:ah, cap:K.cropLabel(items[2], 'Landscape', 'THE ACTIVE FRAME') })}
        <span style="font-size:${w === 390 ? 14 : 15}px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">${items[2].cap}</span>
      </div>
      ${peekEl(items[3], 'next')}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'page');
    const head = w === 1440
      ? `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:40px">${K.headBlock(g, w, { measure:560 })}<div style="display:flex;gap:8px">${K.arrowBtn(g, 'prev', { dim:true })}${K.arrowBtn(g, 'next')}</div></div>`
      : K.headBlock(g, w, { measure: w === 390 ? 350 : 560 });
    const foot = `<div style="display:flex;align-items:center;justify-content:space-between;gap:24px;width:${K.G(w).box}px">
      <div style="display:flex;align-items:center;gap:16px">${K.dotsRow(g, 6, 2)}${K.counterEl(g, 3, 6)}</div>
      ${w === 1440 ? K.creditEl(g, {}) : `<div style="display:flex;gap:8px">${K.arrowBtn(g, 'prev', { dim:true })}${K.arrowBtn(g, 'next')}</div>`}</div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 24 : 36}px">${head}${this.track(t, g, w)}${foot}${w === 1440 ? '' : K.creditEl(g, {})}</div>`;
    return P.stdWrap(t, w, inner);
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const n = o.n, active = n === 1 ? box : Math.round(box * 0.72), ah = Math.round(active * 3 / 4);
    const peek = n === 1 ? 0 : Math.round((box - active - 24) / 2);
    const pk = peek > 0 ? `<span style="width:${peek}px;height:${ah}px;border-radius:${g.r}px;background:${g.stripe};display:block;flex-shrink:0;opacity:.55"></span>` : '';
    return `<div style="display:flex;flex-direction:column;gap:12px;width:${box}px">
      <div style="display:flex;gap:12px;align-items:flex-start;overflow:hidden">${n > 2 ? pk : ''}${K.plate(t, g, { w:active, h:ah, cap:K.cropLabel(K.IMAGES[0], 'Landscape') })}${n > 1 ? pk : ''}</div>
      ${K.dotsRow(g, Math.min(n, 6), 0)}</div>`;
  },
  tileMin:230,
  counts:[
    { n:1, label:'ONE IMAGE · NO TRACK, NO DOTS, NO PEEK ⚑ · MINIATURE AT 604' },
    { n:2, label:'TWO IMAGES · ONE PEEK, TWO DOTS ⚑' },
    { n:6, label:'SIX IMAGES · THE DEFAULT · MINIATURE AT 604' }
  ],
  primaryNote:`A19·15's track, dots and arrows, carried verbatim, with A14's frame on it. ${b('140 · 24 · 968 · 24 · 140 = 1,296')} — ${b('the peek is the design')} ⚑: it is what tells a reader there is a set here at all, and it is why the track is not simply one full-width frame. ${b('The peeking frames are dimmed to 55% and are not interactive')} ⚑ — clicking one scrolls it in rather than opening the overlay. ${b('There is no autoplay at any value')} ⚑, in this design or anywhere in A14.`,
  statesNote:`${b('At one image the carousel is not a carousel')} ⚑ — no track, no dots, no counter, no arrows, and the frame draws at the full 1,296 as a single picture. ${b('At two there is one peek and two dots')}, and the track still snaps. ${b('The caption sits under the active frame and changes with it')} ⚑; at Captions: Off the line is removed and ${b('the frame does not grow to fill it')} ⚑ — the track holds one height so the section does not jump as the reader steps.`,
  extraTiles:[{
    label:'REDUCED MOTION, AND WHAT SURVIVES IT · SETTLEMENT 1',
    body:[
      `${b('The track is a native')} ${code('scroll-snap')} ${b('strip')}, so ${b('stepping works with no JavaScript at all')} ⚑ — the module adds the dots, the arrows and the counter, and the registry says so.`,
      `${b('Under reduced-motion the scroll is instant rather than smooth')} ⚑ — ${code('scroll-behavior: auto')} instead of ${code('smooth')}. ${b('Nothing else changes')}: same track, same snap points, same dots. The design is fully usable because it never moved on its own to begin with.`,
      `${b('This design declares two modules')} ⚑ — ${code('carousel')} and ${code('lightbox')} — and it is the first section in the library to declare two. The registry has no rule against it and no rule for it; that is a finding for the architect, not a new module name.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Carousel', n:7, sub:'One frame at a time, on a track.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Controls', ['Dots', 'Arrows', 'Dots and arrows'], 2, `A19·15’s three values, carried verbatim. ${b('Arrows are dropped below 1,080 whatever the value')} ⚑ — a 44 px arrow over a photograph on a touch screen is a mis-tap waiting to happen — and the value resolves to Dots.`),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `${b('As uploaded is disabled here')} ⚑ — slides of different heights make the section jump as the reader steps. A9·8’s convention: shown, struck through, with the reason.`, [3]),
      K.seg('Peek', ['On', 'Off'], 0, `${b('Off makes the active frame the full 1,296')} and the track a plain one-up ⚑. On is the default because the peek is what says the set continues.`),
      K.seg('Captions', ['Under the frame', 'In the lightbox only', 'Off'], 0, `The caption belongs to the active frame and changes with it ⚑. ${b('Its line is reserved at Off')}, so the section does not jump.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `On, the active frame opens the overlay and ${b('the overlay’s arrows step the same list')} ⚑ — closing it leaves the track on whatever frame the reader stopped at.`)
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: ${b('autoplay and its interval')} ⚑ — refused everywhere in A14, because a gallery that moves on its own takes the reading decision from the reader and reduced-motion would have to switch it off anyway; ${b('a per-view count')} (the track is one-up at every width, which is A19·15’s finding carried verbatim ⚑); a loop value; and a transition-style value.`,
      `${b('The arrows sit beside the head, never over the picture')} ⚑ — A19·15’s call, carried verbatim, and the reason the head keeps a 40 px gap at its right at 1440.`,
      `${b('Nothing here is per-item.')} A frame cannot be pinned first — reorder the list instead, and the images block says so.`
    ]
  },
  tabletLabel:'834 · active 594 · peek 60 · dots below',
  mobileLabel:'390 · active 302 · peek 12 · arrows gone ⚑',
  respCap:'TABLET 834 · ARROWS MOVE UNDER THE TRACK · MOBILE 390 · ARROWS GONE, THE PEEK KEPT',
  respNote:`carousel’s ladder with ${b('one departure')}: ${b('arrows are dropped below 1,080 rather than moving over the media')} ⚑, and Controls resolves to Dots. ${b('1440')} 140 · 24 · 968 · 24 · 140; arrows beside the head; dots and counter under the track at the left, credit at the right. ${b('834')} 60 · 20 · 594 · 20 · 60; ${b('arrows move under the track')} beside the dots. ${b('390')} 12 · 12 · 302 · 12 · 12 — ${b('a 12 px sliver is still a peek')} ⚑ — dots only, credit under everything.`,
  darkNote:`Token values only. ${b('The dimmed peek is 55% opacity in both modes')} ⚑ rather than a colour, so it re-tunes itself. The active dot is the accent in both — ${b('the one place the accent appears in this design')} ⚑, which A19·15 also spends there.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One frame at a time on a snapping track at 968 × 726, the previous and next frames peeking 140 px at the margins, dots and a counter beneath and arrows beside the head.'),
    K.specRow(2, 'Structural descriptor', `${code('carousel · none · page · many · inline · one frame at a time')}<br><span style="color:#6B6459">One of two ${code('carousel')} archetypes in A14; 8 Filmstrip is the other and differs on ground, count class and media placement. ${b('The containment is of time rather than space')} — A19·15’s phrase, and the reason slot two is ${code('none')}.</span>`),
    K.specRow(3, 'Archetype', `carousel. ${b('One departure')} — arrows are dropped below 1,080 rather than moved over the media ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} 140 · 24 · 968 · 24 · 140; frame 968 × 726; arrows beside the head; dots 24/8 × 6 and the counter under the track; credit at the right. ${b('834')} 60 · 20 · 594 · 20 · 60; arrows under the track. ${b('≤ 767')} 12 · 12 · 302 · 12 · 12; dots only; credit last. ${b('One-up at every width')} ⚑.`),
    K.specRow(5, 'Content fields', `The category’s five. ${b('Designed for 4–20')} ⚑ — this is the design that holds a long list, and the only one that does not get taller as the list grows.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Controls ${b('Dots · Arrows · Dots and arrows')} — Crop ${b('Square · Landscape · Portrait')} with ${b('As uploaded disabled')} ⚑ — Peek ${b('On · Off')} — Captions ${b('Under the frame · In the lightbox only · Off')} — Lightbox ${b('On · Off')}. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → ${b('no track, no dots, no counter, no arrows')} ⚑ — one frame at the full 1,296. ${b('2')} → one peek, two dots, the track still snapping. ${b('many')} → the track scrolls and ${b('the section’s height never changes')} ⚑.`),
    K.specRow(8, 'Empty state', `A caption left empty leaves its reserved line blank ⚑ — the one place in A14 where an empty caption reserves space, because the alternative is a section that changes height as the reader steps. Failed image → the plate at the crop ratio with its alt text, as 1 Grid.`),
    K.specRow(9, 'Behaviour module', `${b('Two modules')} ⚑ — ${code('carousel')} and ${code('lightbox')}. ${code('carousel')} is ${b('edit-safe: no')} ⚑ (A19·15’s finding: the editor shows the resting slide only). ${b('No-JS, quoted:')} “${P.CAROUSEL_QUOTE}” ${b('And for the overlay:')} “${P.LIGHTBOX_QUOTE}” ${b('So with JavaScript off this design is a horizontally scrollable strip of links to full-size photographs')} — the dots, the counter and the arrows are hidden and nothing else is lost.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. The track is a ${code('&lt;ul&gt;')} and ${b('no slide is hidden from the accessibility tree at any position')} ⚑ — every frame is reachable by scrolling and by Tab, which is A19·15’s rule carried verbatim. Dots are ${code('&lt;button&gt;')}s with “Go to photograph 3 of 6”; the counter is ${code('aria-hidden')} because the dots already say it. ${b('Arrow keys move the track only when a track element has focus')} ⚑, never globally. Peeking frames are dimmed but not ${code('aria-hidden')} ⚑.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; ${b('designed for 4–20')} and the only design where a list of 40 is not punished ⚑.<br>${b('Flagged ⚑')} the peek and its 55% · arrows dropped below 1,080 · As uploaded disabled · the reserved caption line · no autoplay · two modules declared.`)
  ]]
};

/* ── 8 · Filmstrip ─────────────────────────────────────────────────── */
const d8 = {
  n:8, name:'Filmstrip', crop:'As uploaded', stateGround:'surface',
  rail:'A14 GALLERIES · DESIGN 8 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'One row of frames at a single height, each at its own width, scrolling sideways and running off the right edge of the page rather than stopping at the margin.',
    'It is the gallery that does not want a block of the page — a strip under an article, a set of process shots, an archive teaser with a link to the rest. It reads as a continuation, not a chapter.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · STRIP ON SURFACE · FRAME HEIGHT 320 · NATIVE WIDTHS · RUNS PAST THE RIGHT EDGE ⚑',
  strip(t, g, w, o) {
    o = o || {};
    const h = o.h || (w === 390 ? 220 : w === 834 ? 280 : 320);
    const gp = o.gap || (w === 390 ? 12 : 16);
    const items = K.take(o.n || 6);
    return `<div style="display:flex;gap:${gp}px;align-items:flex-start;padding-left:${K.G(w).m}px;width:${w}px;box-sizing:border-box;overflow:hidden">${
      items.map(it => {
        const fw = Math.round(h * it.nat[0] / it.nat[1]);
        return `<figure style="margin:0;display:flex;flex-direction:column;gap:10px;width:${fw}px;flex-shrink:0">${
          K.plate(t, g, { w:fw, h, cap:K.cropLabel(it, 'As uploaded') })}${
          o.captions === false ? '' : K.captionEl(g, it.cap, { max:fw, size:13 })}</figure>`;
      }).join('')}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'surface');
    const gg = K.G(w), pad = w === 390 ? 64 : w === 834 ? 80 : 96;
    const head = `<div style="padding:0 ${gg.m}px;display:flex;align-items:flex-end;justify-content:space-between;gap:40px">
      ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560, max: w === 390 ? 350 : 720 })}
      ${w === 390 ? '' : `<span style="font-size:15px;font-weight:600;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px;white-space:nowrap">See all 48 →</span>`}</div>`;
    const foot = `<div style="padding:0 ${gg.m}px;display:flex;align-items:center;justify-content:space-between;gap:24px">${K.creditEl(g, {})}${w === 1440 ? `<div style="display:flex;gap:8px">${K.arrowBtn(g, 'prev', { dim:true })}${K.arrowBtn(g, 'next')}</div>` : `<span style="font-size:15px;font-weight:600;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px">See all 48 →</span>`}</div>`;
    const label = `<div style="padding:0 ${gg.m}px"><div style="height:26px;display:flex;align-items:flex-end;padding-bottom:6px"><span style="font-family:${K.MONO};font-size:10px;color:${t.muted}">SECTION PADDING 0 ⚑ · THE SURFACE STRIP CARRIES IT · THE ROW HAS NO RIGHT MARGIN ⚑</span></div></div>`;
    return `<div>${label}<div style="background:${g.bg};padding:${pad}px 0;width:${w}px;box-sizing:border-box;display:flex;flex-direction:column;gap:${w === 390 ? 24 : 32}px">${head}${this.strip(t, g, w, {})}${foot}</div><div style="height:20px"></div></div>`;
  },
  mini(t, box, o) {
    const g = K.ground(t, 'surface');
    const h = 130, gp = 12;
    return `<div style="background:${g.bg};padding:16px 0 16px 16px;border-radius:6px;width:${box}px;box-sizing:border-box;overflow:hidden"><div style="display:flex;gap:${gp}px;align-items:flex-start">${
      K.take(o.n).map(it => { const fw = Math.round(h * it.nat[0] / it.nat[1]);
        return `<figure style="margin:0;display:flex;flex-direction:column;gap:8px;width:${fw}px;flex-shrink:0">${K.plate(t, g, { w:fw, h, cap:K.two(it.n), capSize:9 })}${K.captionEl(g, it.cap, { max:fw, size:11 })}</figure>`; }).join('')}</div></div>`;
  },
  tileMin:210,
  primaryNote:`${b('The strip has a left margin and no right margin')} ⚑ — it starts on the 72 px grid like every other section and then runs off the edge of the page, which is what says “this scrolls” without drawing a single arrow. ${b('One height, native widths')} ⚑: this is the second design that refuses to crop, and the only one where the refusal costs nothing, because a row aligned on its height stays a row whatever the ratios are. ${b('The surface ground is what makes the overflow legible')} ⚑ — against the page ground a strip that bleeds looks like a mistake.`,
  statesNote:`${b('At one and two images the strip does not fill and does not stretch')} ⚑ — the frames sit at the left on their own widths and the surface runs on behind them, which is the only honest thing a scrolling row can do. ${b('The arrows are hidden below three frames')} ⚑, and below the point where the row overflows the box: an arrow that scrolls nothing is worse than no arrow.`,
  extraTiles:[{
    label:'THE STRIP’S THREE RULES',
    body:[
      `${b('It is the same')} ${code('carousel')} ${b('module as 7')} ⚑ — a snapping, overflowing row is what the registry’s carousel is, and the difference between 7 and 8 is one-up snapping against free scroll. ${b('Snap is')} ${code('proximity')} ${b('here, not')} ${code('mandatory')} ⚑, so a reader can stop between frames.`,
      `${b('“See all 48 →” is an authored link, not a generated one')} ⚑ — ${code('moreLabel')} and ${code('moreUrl')}, both optional, and the count in the label is typed by the author. ${b('The section cannot count the archive')}: there is no query behind A14.`,
      `${b('It is the one design that never goes to a column')} ⚑. At 390 it is still a scrolling row, at a 220 px height — because a strip that stacks is 1 Grid, and the reader who chose a strip chose the sideways.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Filmstrip', n:8, sub:'One scrolling row, native widths.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, `The strip’s inner padding — 64 · 96 · 132. ${b('The section’s own is 0')} ⚑.`),
      K.seg('Frame height', ['Short', 'Medium', 'Tall'], 1, `240 · 320 · 420 at 1440 ⚑ — ${b('the one control in A14 that sets a size in a direction the crop does not')}, because on a strip the height is the shared edge.`),
      K.seg('Gap', ['Tight', 'Even', 'Airy'], 1, '8 · 16 · 32 px between frames.'),
      K.seg('Captions', ['Under each', 'In the lightbox only', 'Off'], 0, 'Under each is the default; captions wrap to the frame’s own width, which varies.'),
      K.seg('Arrows', ['On', 'Off'], 0, `${b('Hidden automatically when the row does not overflow')} ⚑, at either value. Off is for a strip that is obviously scrollable on touch.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `The same overlay as 1 Grid. ${b('Opening it does not scroll the strip')}; closing it leaves the strip where it was ⚑.`)
    ],
    images:{ count:6, extra:`<span style="font-size:11px;color:#6E6A64;line-height:1.5"><strong style="font-weight:600">This design draws two more section fields</strong> — <strong style="font-weight:600">See all: label</strong> and <strong style="font-weight:600">See all: link</strong>, both optional and both blank by default ⚑. They are content, not controls, and they sit under the images block rather than in the counted six.</span>` },
    settles:[
      `${b('Six controls.')} Cut: a crop value (${b('the strip is native widths or it is a row of identical rectangles, which is 1 Grid at Columns: Four')} ⚑), a “stop at the margin” value (that is the design), and a snap-strength value.`,
      `${b('Frame height is the only size control in A14')} ⚑ and it exists because this is the only design whose frames share a height rather than a width. Everywhere else the column count sets the size.`,
      `${b('Nothing here is per-item.')} A frame is wide because the photograph is wide.`
    ]
  },
  tabletLabel:'834 · height 280 · still a row',
  mobileLabel:'390 · height 220 · still a row ⚑',
  respCap:'TABLET 834 · MOBILE 390 · IT NEVER BECOMES A COLUMN ⚑',
  respNote:`carousel’s ladder with ${b('one departure')}: ${b('it never collapses to a stack at any width')} ⚑. ${b('1440')} strip padding 96, left margin 72, frame height 320, gap 16, arrows at the foot right. ${b('834')} padding 80, left margin 40, height 280, gap 16, ${b('arrows replaced by the See-all link')} ⚑. ${b('390')} padding 64, left margin 20, height 220, gap 12, no arrows, See-all under the strip. ${b('The right margin is 0 at all three')} ⚑.`,
  darkNote:`Surface lifts to ${code('#211D17')} and the strip keeps its edge-to-edge run; ${b('no shadow in dark')} ⚑, hairline only where the surface meets the ground. The photographs are untouched.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'One horizontally scrolling row on a full-width surface strip: every frame at one shared height and its own native width, starting at the page margin and running off the right edge.'),
    K.specRow(2, 'Structural descriptor', `${code('carousel · none · surface · variable · edge · a row that runs off the right edge')}<br><span style="color:#6B6459">Media ${code('edge')} is the claim, and it is the only ${code('edge')} in A14. Separates from 7 Carousel on ground, count class and media placement; from 2 Masonry on archetype.</span>`),
    K.specRow(3, 'Archetype', `carousel. ${b('One departure')} — it never becomes a stack ⚑, at any width.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} strip padding 96 · 0, left margin 72, height 320, gap 16, arrows at the foot; See-all beside the head. ${b('834')} padding 80, left margin 40, height 280; arrows replaced by See-all. ${b('≤ 767')} padding 64, left margin 20, height 220, gap 12, no arrows, See-all under the strip. ${b('Right margin 0 at every width')} ⚑.`),
    K.specRow(5, 'Content fields', `The category’s five, plus ${code('moreLabel')} ≤ 24 and ${code('moreUrl')}, both optional ⚑. ${b('The count in “See all 48” is authored')} ⚑ — nothing counts the archive for the author.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Frame height ${b('Short 240 · Medium 320 · Tall 420')} — Gap ${b('Tight · Even · Airy')} — Captions ${b('Under each · In the lightbox only · Off')} — Arrows ${b('On · Off')} — Lightbox ${b('On · Off')}. Then the images block and the two See-all fields.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1–2')} → frames sit at the left at their own widths, ${b('the strip does not centre them and does not stretch them')} ⚑; arrows hidden. ${b('many')} → the row overflows and scrolls; ${b('the section’s height never changes with the count')} ⚑. ${b('No')} ${code('moreUrl')} → the link is absent and the head keeps its full measure ⚑.`),
    K.specRow(8, 'Empty state', `As 1 Grid. ${b('A failed image keeps its native width at the strip’s height')} ⚑ — the row must not reflow around a hole — and draws the surface’s hover plane with its alt text.`),
    K.specRow(9, 'Behaviour module', `${b('Two modules')} ⚑ — ${code('carousel')} and ${code('lightbox')}, as 7. ${b('No-JS, quoted:')} “${P.CAROUSEL_QUOTE}” ${b('Which is exactly this design with its arrows hidden')} — the strip is a native overflow row before any script runs, and ${b('snap is')} ${code('proximity')} ${b('rather than')} ${code('mandatory')} ⚑ so a reader can stop between frames. And for the overlay: “${P.LIGHTBOX_QUOTE}”`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. The row is a ${code('&lt;ul&gt;')} with ${code('tabindex="0"')} on the scroll container so a keyboard can scroll it ⚑, and an ${code('aria-label')} naming it “Photographs, scrollable row”. ${b('Every frame is a tab stop in authored order')}; focus scrolls the frame into view natively. Arrows are ${code('&lt;button&gt;')}s and ${b('are')} ${code('aria-hidden')} ${b('when the row does not overflow')} ⚑. Caption 5.4:1 on surface.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; ${b('designed for 5–20')}, and ${b('the only design where a short list looks unfinished')} ⚑, which the editor says at fewer than three.<br>${b('Flagged ⚑')} no right margin · never becomes a column · Frame height as the one size control · proximity snap · the authored See-all count · two modules.`)
  ]]
};

/* ── 9 · Full Bleed ────────────────────────────────────────────────── */
const d9 = {
  n:9, name:'Full Bleed', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 9 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'The set edge to edge with no side margins and a hairline between the frames, the head alone keeping the page’s measure above it. The photographs cover the width of the screen.',
    'It is the gallery for a set that is the page rather than part of it — a cover feature, a portfolio, a photographer’s own site. It is the loudest design in A14 and the panel says what that costs.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · THREE COLUMNS EDGE TO EDGE · CELL 479 × 359 · GUTTER HAIRLINE · CAPTIONS IN THE LIGHTBOX ONLY',
  set(t, g, w, o) {
    o = o || {};
    const cols = o.cols || (w === 1440 ? 3 : w === 834 ? 2 : 1);
    const gp = o.gutter === undefined ? 1 : o.gutter;
    const cw = Math.floor((w - gp * (cols - 1)) / cols), ch = Math.round(cw * 3 / 4);
    const items = K.take(o.n || 6);
    return `<div style="display:flex;flex-wrap:wrap;gap:${gp}px;width:${w}px;background:${g.border}">${
      items.map(it => K.plate(t, g, { w:cw, h:ch, r:0, cap:K.cropLabel(it, 'Landscape') })).join('')}</div>`;
  },
  body(t, w) {
    const g = K.ground(t, 'page');
    const gg = K.G(w);
    const head = `<div style="padding:0 ${gg.m}px;display:flex;flex-direction:column;gap:${w === 390 ? 24 : 32}px">${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}</div>`;
    const foot = `<div style="padding:${w === 390 ? 20 : 28}px ${gg.m}px 0">${K.creditEl(g, {})}</div>`;
    return `<div>${K.padTop(t, w, 'SIDE PADDING 0 AT EVERY WIDTH ⚑ · THE HEAD KEEPS THE MARGIN, THE SET DOES NOT')}${head}<div style="height:${w === 390 ? 28 : 40}px"></div>${this.set(t, g, w, {})}${foot}${K.padBot(t, w)}</div>`;
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    return this.set(t, g, box, { n:o.n, cols:3 });
  },
  tileMin:210,
  primaryNote:`${b('The head keeps the margin and the set does not')} ⚑ — which is the whole composition: one line of type on the 72 px grid, then photographs wall to wall. ${b('The gutter is a hairline, not a gap')} ⚑ at the default: ${code('border')} colour showing through a 1 px flex gap, so the frames read as one surface divided rather than six objects placed. ${b('Captions default to the lightbox')} ⚑ — there is no margin for a caption to sit in, and a caption inside the frame is 11 Overlay.`,
  statesNote:`${b('A short last row leaves the page ground showing at the right')} ⚑ and A14 accepts it rather than stretching the last frame — stretching would make that photograph larger than the author asked. ${b('The panel says a full-bleed set reads best at a multiple of the column count')} ⚑ and the editor repeats it, which is advice rather than a rule. At ${b('1')} the frame is one third of the screen at the left ⚑, not the whole of it: that is 10 Lead and Grid.`,
  extraTiles:[{
    label:'WHAT EDGE TO EDGE COSTS',
    body:[
      `${b('There is no ground of its own')} ⚑ — the tuple reads ${code('transparent')} because the frames cover the section entirely and whatever is beneath shows only where the set is short. ${b('That makes it the one design whose appearance depends on the section above it')}, and A14 cannot know what that is ⚑ — the same route-awareness gap A16, A21, A22 and A26–A29 each raised.`,
      `${b('Under-each captions are disabled at Gutter: None')} ⚑ — a 14 px line with no gutter to sit in touches the frame below it. A9·8’s convention: the value is shown, struck through, with the reason.`,
      `${b('At 390 it is one column of full-width frames')} ⚑, which is the only place where 9 and 1 Grid look nearly the same — and the difference is still real: 1 Grid keeps its 20 px margin, this one has none.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS, ONE CONDITIONAL VALUE + THE IMAGES BLOCK',
    name:'Full Bleed', n:9, sub:'Edge to edge, hairline gutters.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, `Vertical only ⚑ — ${b('the side padding is 0 at every value')}, which is the design.`),
      K.seg('Columns', ['Three', 'Four', 'Six'], 0, `479 · 359 · 239 at 1440. ${b('Six is a contact sheet at full width')} ⚑ and the panel names 13 as the design built for that.`),
      K.seg('Crop', ['Square', 'Landscape', 'Portrait', 'As uploaded'], 1, `${b('As uploaded is disabled here')} ⚑ — a wall-to-wall set of mixed ratios has no alignment anywhere and reads as a mistake.`, [3]),
      K.seg('Gutter', ['None', 'Hairline', 'Even'], 1, `0 · 1 px in ${code('border')} · 16 px in the ground ⚑. ${b('At None the frames touch')} and the set reads as one image.`),
      K.seg('Captions', ['In the lightbox only', 'Under each', 'Off'], 0, `${b('Under each is disabled at Gutter: None')} ⚑ — there is no space for a line to sit in. Change the gutter first and the value returns.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `${b('On is strongly the default here')} ⚑ — with captions in the overlay, switching the lightbox off leaves them nowhere, and the panel resolves Captions to Under each and says so.`)
    ],
    images:{ count:6 },
    settles:[
      `${b('Six controls.')} Cut: a side-margin value (${b('it is 0 or it is 1 Grid')} ⚑), a “stretch the last row” value ⚑, a radius value (${b('frames at the screen edge take no radius, in any pack')} ⚑ — the pack token is suspended here and this is the one place in A14 where that happens), and a height value.`,
      `${b('The radius suspension is worth stating twice')} ⚑: a rounded corner against the viewport edge is a gap, so a full-bleed frame is square-cornered in Paper, in Garden at radius 20, and in every pack between. ${b('Frames not touching an edge keep the token')}.`,
      `${b('Nothing here is per-item.')} No frame can be pulled out to full width — that is 10 Lead and Grid, and the panel names it.`
    ]
  },
  tabletLabel:'834 · two columns edge to edge',
  mobileLabel:'390 · one column, no margin at all ⚑',
  respCap:'TABLET 834 · TWO COLUMNS · MOBILE 390 · ONE COLUMN AT THE FULL SCREEN WIDTH',
  respNote:`grid-of-N’s ladder with ${b('the side margin fixed at 0')} ⚑. ${b('1440')} three columns at 479 × 359, hairline gutter; head on the 72 margin. ${b('834')} two columns at 376 × 282; head on 40. ${b('390')} one column at 390 × 293 — ${b('the frame is the whole screen')} ⚑ — head on 20. ${b('The head and credit keep the page margin at all three widths')} ⚑; only the set bleeds.`,
  darkNote:`The hairline gutter becomes ${code('#332E27')} and effectively disappears against dark photographs, which is accepted ⚑ — in dark the frames are meant to run together. ${b('Nothing is filtered')}, and the ground shows only where the last row is short.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The set edge to edge with a 1 px hairline gutter and no side margins; the head and the credit alone keep the page’s measure. Captions live in the lightbox.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · transparent · many · full-bleed · no margin at any width')}<br><span style="color:#6B6459">Ground ${code('transparent')} — the section has no ground of its own; the frames cover it and what is beneath shows only where the set is short. That, and media ${code('full-bleed')}, separate it from 1 Grid and from 10 Lead and Grid respectively.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('One departure')} — side padding is 0 at every width and the final step is one full-screen column ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} three columns 479 × 359, gutter 1; head and credit on the 72 margin; vertical padding 96. ${b('834')} two columns 376 × 282, head on 40, padding 80. ${b('≤ 767')} one column at the full screen width, head on 20, padding 64. ${b('The crop does not change with the width')} ⚑.`),
    K.specRow(5, 'Content fields', `The category’s five. ${b('Designed for 6, 9 or 12')} ⚑ — a multiple of the column count — and the panel says so rather than enforcing it.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} (vertical only) — Columns ${b('Three · Four · Six')} — Crop ${b('Square · Landscape · Portrait')} with ${b('As uploaded disabled')} ⚑ — Gutter ${b('None · Hairline · Even')} — Captions ${b('In the lightbox only · Under each · Off')}, ${b('Under each disabled at Gutter: None')} ⚑ — Lightbox ${b('On · Off')}. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → one frame at one third of the screen, at the left ⚑, the ground showing beside it. ${b('2')} → two frames, one third of the screen empty. ${b('many')} → wraps; ${b('a short last row shows the ground and nothing stretches')} ⚑.`),
    K.specRow(8, 'Empty state', `As 1 Grid, with one difference: ${b('a failed image is very visible here')} ⚑ because there is no margin around it, so the plate draws its alt text at 15 px rather than 13 ⚑ — the one size change in the missing-image vocabulary.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE + ` ${b('At Lightbox: Off this design still needs its captions somewhere')} ⚑ and the panel resolves them to Under each, which forces Gutter off None. That is the only control interaction in A14 that changes two values at once, and it is stated on the panel.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. The set is a ${code('&lt;ul&gt;')}; ${b('with captions in the overlay the accessible name of each frame is its')} ${code('alt')} ⚑, which makes ${code('alt')} load-bearing in this design in a way it is not in 1 Grid — the editor’s warning dot matters most here. ${b('The focus ring is drawn inset by 3 px rather than outside')} ⚑, the one design where it is, because an outside ring on a frame at the viewport edge is clipped. Ring contrast 4.6:1 on the photograph’s scrim-free edge, which is ${b('not guaranteed against every image')} ⚑ — flagged, and the ring carries a 1 px carried-colour outline for that reason.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; designed for 6, 9 or 12.<br>${b('Flagged ⚑')} zero side margin · the radius token suspended at the screen edge · As uploaded disabled · Under each disabled at Gutter: None · the inset focus ring and its unguaranteed contrast · the ground-dependence at ${code('transparent')}.`)
  ]]
};

/* ── 10 · Lead and Grid ────────────────────────────────────────────── */
const d10 = {
  n:10, name:'Lead and Grid', crop:'Landscape',
  rail:'A14 GALLERIES · DESIGN 10 OF 15 · PAPER PACK · SIX CONTROLS + THE IMAGES BLOCK',
  paras:[
    'One photograph across the full width of the page with the rest of the set in a contained row beneath it. The lead is the first image in the list, and it is the only one that bleeds.',
    'It is the gallery that opens something — the top of a photo essay, a feature’s first screen — where one frame has to hold the page before the set is offered.'
  ],
  primaryCap:'DESKTOP 1440 · LIGHT · LEAD 1,440 × 640 FULL BLEED · THREE FOLLOWERS AT 416 × 312 ON 1,296',
  body(t, w) {
    const g = K.ground(t, 'page');
    const gg = K.G(w);
    const leadH = w === 1440 ? 640 : w === 834 ? 460 : 292;
    const lead = K.plate(t, g, { w, h:leadH, r:0, cap:K.cropLabel(K.IMAGES[0], 'Landscape', 'THE LEAD · FULL BLEED · NO RADIUS AT THE SCREEN EDGE ⚑') });
    const leadCap = `<div style="padding:${w === 390 ? 12 : 14}px ${gg.m}px 0">${K.captionEl(g, K.IMAGES[0].cap, { max:640 })}</div>`;
    const cols = w === 1440 ? 3 : w === 834 ? 2 : 1;
    const gp = w === 390 ? 16 : w === 834 ? 20 : 24;
    const rest = `<div style="padding:0 ${gg.m}px">${K.gridBlock(t, g, { box:gg.box, cols, gap:gp, crop:'Landscape', captions:'Under each', items:K.IMAGES.slice(1, 4) })}</div>`;
    const head = `<div style="padding:0 ${gg.m}px">${K.headBlock(g, w, { measure: w === 390 ? 350 : 560 })}</div>`;
    const foot = `<div style="padding:${w === 390 ? 20 : 28}px ${gg.m}px 0">${K.creditEl(g, {})}</div>`;
    return `<div>${K.padTop(t, w, 'THE LEAD BLEEDS, THE FOLLOWERS DO NOT ⚑')}${head}<div style="height:${w === 390 ? 28 : 40}px"></div>${lead}${leadCap}<div style="height:${w === 390 ? 28 : 40}px"></div>${rest}${foot}${K.padBot(t, w)}</div>`;
  },
  mini(t, box, o) {
    const g = K.ground(t, 'page');
    const items = K.take(o.n);
    const lead = K.plate(t, g, { w:box, h:Math.round(box * 0.44), r:0, cap:K.cropLabel(items[0], 'Landscape', 'LEAD') });
    const rest = items.length > 1
      ? `<div style="padding:0 16px">${K.gridBlock(t, g, { box:box - 32, cols:3, gap:12, crop:'Landscape', captions:'Under each', items:items.slice(1), capSize:11 })}</div>` : '';
    return `<div style="display:flex;flex-direction:column;gap:16px;width:${box}px">${lead}${rest}</div>`;
  },
  tileMin:210,
  counts:[
    { n:1, label:'ONE IMAGE · THE LEAD ALONE, WHICH IS A LEGITIMATE SECTION ⚑ · MINIATURE AT 604' },
    { n:2, label:'TWO IMAGES · LEAD + ONE FOLLOWER AT COLUMN WIDTH ⚑' },
    { n:4, label:'FOUR IMAGES · THE DEFAULT · LEAD + THREE' }
  ],
  primaryNote:`${b('The lead bleeds and the followers do not')} ⚑ — two different measures in one section, deliberately, because the lead is doing the work a hero does and the followers are doing the work a grid does. ${b('The lead is the first image in the list')} ⚑, as in 3 Mosaic, and reordering is how it is chosen. ${b('Its caption sits under it on the page margin')}, clamped to 640 ⚑ — the full 1,440 measure would be an unreadable line of text.`,
  statesNote:`${b('At one image this design is a single full-bleed photograph with a caption')} ⚑, which is a legitimate section and the only place in A14 where one image fills the width. ${b('At two the follower sits at column width at the left')} ⚑ and does not stretch. ${b('At five or more the followers wrap into a second row')} ⚑ — the lead is never repeated and never joined.`,
  extraTiles:[{
    label:'THE TWO MEASURES, AND WHY THEY ARE ALLOWED',
    body:[
      `${b('A14’s rule is that a design has one measure')} — this is the stated exception ⚑, and it is stated because the lead is not part of the grid: it is the section’s opening image, and the grid beneath is the set.`,
      `${b('Lead width: Contained is the value that removes the exception')} ⚑ — the lead drops to 1,296 and the design becomes one measure with a big first frame. Both are supported; the bleed is the default because the design has no reason to exist otherwise.`,
      `${b('At Lead width: Contained the lead takes the pack radius')} ⚑; at Full bleed it takes none, which is 9 Full Bleed’s suspension rule carried verbatim.`
    ]
  }],
  controls:{
    cap:'THE CONTROL PANEL · SIX CONTROLS + THE SHARED IMAGES BLOCK',
    name:'Lead and Grid', n:10, sub:'One frame across, the rest beneath.', count:'SIX CONTROLS + THE IMAGES BLOCK',
    rows:[
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Lead height', ['Short', 'Medium', 'Tall'], 1, `480 · 640 · 760 at 1440 ⚑ — ${b('a height, not a ratio')}, because a full-bleed frame’s ratio is the screen’s and the author cannot know it.`),
      K.seg('Lead width', ['Full bleed', 'Contained'], 0, `Contained draws the lead at 1,296 with the pack radius ⚑ and makes the section one measure.`),
      K.seg('Followers', ['Three', 'Four'], 0, '416 or 306 at 1440. Two at 834, one at 390, whichever the value.'),
      K.seg('Captions', ['Under each', 'Lead only', 'In the lightbox only'], 0, `${b('Lead only is this design’s own value')} ⚑ — the opening frame is captioned and the set is not, which is how a printed essay usually does it.`),
      K.seg('Lightbox', ['On', 'Off'], 0, `On, ${b('the lead is the first frame in the overlay’s order')} ⚑ — the overlay steps the whole list, lead included.`)
    ],
    images:{ count:4 },
    settles:[
      `${b('Six controls.')} Cut: a “which image leads” picker (${b('it is the first in the list')} ⚑), a lead-ratio value (a bleeding frame has the screen’s ratio ⚑), an alignment value, and a second-row value.`,
      `${b('Captions: Lead only exists here and nowhere else')} ⚑, because this is the only design with a frame that is structurally different from the others. It is not a per-item control — it names a position, not an item.`,
      `${b('Nothing here is per-item.')} The lead is a position in the list; drag another photograph to the top and it leads instead.`
    ]
  },
  tabletLabel:'834 · lead 834 × 460 · two followers',
  mobileLabel:'390 · lead 390 × 292 · one column',
  respCap:'TABLET 834 · MOBILE 390 · THE LEAD KEEPS BLEEDING AT BOTH ⚑',
  respNote:`grid-of-N’s ladder for the followers; ${b('the lead is full-bleed at every width')} ⚑. ${b('1440')} lead 1,440 × 640, caption on the 72 margin clamped to 640; followers three-up at 416 × 312 on 1,296. ${b('834')} lead 834 × 460; followers two-up at 367 × 275. ${b('390')} lead 390 × 292; followers one-up at 350 × 263. ${b('The lead’s height is a value, not a ratio')} ⚑ — at 390 it is 292 px, which is the Medium value scaled by the ladder rather than the ratio of the frame above.`,
  darkNote:`Token values only. ${b('The lead is the largest single element in A14')} and in dark it is the one place where a bright photograph against ${code('#171511')} can feel like a lamp ⚑ — accepted, and not corrected with a scrim, because a scrim over an uncaptioned image is decoration.`,
  spec:[[
    K.specRow(1, 'Descriptor', 'The first image across the full width of the page at a set height, its caption on the page margin beneath it, and the rest of the set in a contained three-up row below.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · many · full-bleed · one lead frame across the page')}<br><span style="color:#6B6459">Media ${code('full-bleed')} on ground ${code('page')} — 9 Full Bleed is the same placement on ${code('transparent')}, and the difference is real: there, everything bleeds; here, one frame does and the rest keep the margin.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('One departure')} — the lead sits outside the content box at every width ⚑ while the followers stay inside it.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} lead 1,440 × 640 (Medium), caption on the 72 margin clamped to 640; followers 416 × 312 three-up on 1,296; padding 96. ${b('834')} lead 834 × 460; followers 367 × 275 two-up; padding 80. ${b('≤ 767')} lead 390 × 292; followers 350 × 263 one-up; padding 64.`),
    K.specRow(5, 'Content fields', `The category’s five. ${b('Designed for 4 or 7')} ⚑ — a lead plus one or two full rows.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Lead height ${b('Short 480 · Medium 640 · Tall 760')} — Lead width ${b('Full bleed · Contained')} — Followers ${b('Three · Four')} — Captions ${b('Under each · Lead only · In the lightbox only')} — Lightbox ${b('On · Off')}. Then the images block.`),
    K.specRow(7, 'Data', `${DATA_LINE} ${ZERO} ${b('1')} → the lead alone with its caption ⚑, which is a legitimate section. ${b('2–3')} → lead plus a short row, left-aligned, nothing stretched. ${b('many')} → followers wrap into further rows; ${b('the lead is never repeated')} ⚑.`),
    K.specRow(8, 'Empty state', `${b('The lead’s caption is the one caption this design will not silently lose')} ⚑ — at Captions: In the lightbox only it moves to the overlay; at Off it is still in the overlay. As 1 Grid otherwise.`),
    K.specRow(9, 'Behaviour module', P.LIGHTBOX_LINE + ` ${b('The lead is the first item in the overlay’s order')} ⚑, so ← from it wraps to the last follower.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('The lead is a')} ${code('&lt;figure&gt;')} ${b('inside the same')} ${code('&lt;ul&gt;')} ${b('as the followers')} ⚑ — one list, authored order, no promotion — because a reader stepping the gallery should not meet the lead outside the set. Focus ring inset by 3 px on the lead (9 Full Bleed’s rule) and outside on the followers ⚑. Caption 5.4:1.<br>${b('Repeating items')} — ${code('images[]')}: as 1 Grid; ${b('dragging a frame to position 1 makes it the lead')} ⚑ and the editor says so on the drag.<br>${b('Flagged ⚑')} two measures in one section · lead height as a value not a ratio · radius suspended on the bleeding lead · Captions: Lead only · the lead never repeated.`)
  ]]
};

return [d6, d7, d8, d9, d10];
})();
