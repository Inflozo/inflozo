// A16 designs 6–10.
globalThis.A16D2 = (function () {
const K = globalThis.A16LIB, P = globalThis.A16PAGE;
const { b, code } = K;
const G = K.G;
const NOFORM = `${b('This design draws no form')} ⚑, so it declares ${b('no behaviour module')} and there is nothing in it to degrade: every element is server-rendered text, a link, or a static image. The delivery group is absent from the sidebar and the form fields are kept on the section ⚑, returning the moment the user switches to one of the ten designs that has a form.`;

/* ── 6 · Details Grid ──────────────────────────────────────────────── */
function detailCell(g, d, o) {
  o = o || {};
  return `<div style="display:flex;flex-direction:column;gap:8px;${o.w ? `width:${o.w}px;` : 'flex:1;min-width:0;'}${o.rule ? `border-left:1px solid ${g.border};padding-left:${o.pad || 28}px;` : ''}">
    <span style="font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:${g.muted};font-family:${g.pack.body}">${d.label}</span>
    <span style="font-size:${o.size || 17}px;line-height:1.55;color:${g.text};font-family:${g.pack.body};${d.link ? 'text-decoration:underline;text-underline-offset:3px;' : ''}text-wrap:pretty">${d.value}</span></div>`;
}
function detailGrid(g, w, o) {
  o = o || {};
  const items = o.items || K.DETAILS;
  const rules = o.rules !== false;
  const cols = w === 1440 ? 4 : w === 834 ? 2 : 1;
  const gapx = w === 1440 ? 32 : 28;
  return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${w === 390 ? 26 : 40}px ${gapx}px;width:100%">
    ${items.map((d, i) => detailCell(g, d, { rule: rules && (i % cols !== 0), pad: gapx, size: w === 390 ? 16 : 17 })).join('')}</div>`;
}
const d6 = {
  n: 6, name: 'Details Grid',
  rail: 'A16 CONTACT · DESIGN 6 OF 15 · PAPER PACK · FIVE CONTROLS · NO FORM, NO MODULE',
  paras: [
    'Four labelled detail blocks across the content box — email, post, phone, reply hours — divided by hairlines, with the social row beneath. No form at any value.',
    'It is the design for a publication that would rather be written to directly than through a box, and for the contact block at the foot of an about page. It is also A16’s answer to a form that nobody monitors: an address that works is better than a form that does not.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FOUR CELLS ON 1,296 · HAIRLINE DIVIDERS · SOCIAL ROW BENEATH',
  body(t, w) {
    const g = K.ground(t, 'page');
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 48}px">
        ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560, max: 720 })}
        ${detailGrid(g, w, {})}
        <div style="border-top:1px solid ${g.border};padding-top:${w === 390 ? 26 : 32}px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <span style="font-size:15px;color:${g.muted};font-family:${g.pack.body}">Elsewhere</span>${K.socialRow(g, { mode: 'labels', gap: 28 })}</div>
      </div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A3·10’s contact block taken out of a footer and given the whole content box: ${b('four cells at 1fr with a hairline between them, never around them')} ⚑. The values are 17 px rather than the block’s footer 15, because at this size they are the section’s content and not its small print. ${b('The social row is the labels value here, not glyphs')} ⚑ — a section with no form has room for the platform names, and a name is easier to scan than a two-letter box.`,
  states: ['four', 'three', 'one', 'socialsOff', 'six', 'long'],
  stateLabels: {
    four: 'FOUR ROWS · the design as authored',
    three: 'ONE ROW EMPTY · the cell goes and the rest widen to 1fr ⚑',
    one: 'ONE ROW ONLY · one cell at the left, not stretched ⚑',
    socialsOff: 'NO SOCIALS · the row and its hairline are removed ⚑',
    six: 'SIX SOCIALS · the ceiling; a seventh is refused with the reason shown ⚑',
    long: 'THE UGLY TEST · a four-line postal address beside three short ones'
  },
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const D = K.DETAILS;
    const LONG = [{ label: 'Post', value: 'Orbit Weekly, Edifício Boavista, 14 Rua da Boavista, 4.º andar, sala 12, 1200-067 Lisboa, Portugal' }, D[0], D[2], D[3]];
    const sets = { four: D, three: [D[0], D[1], D[3]], one: [D[0]], socialsOff: D, six: D, long: LONG };
    const items = sets[s] || D;
    const cols = s === 'one' ? 1 : Math.min(items.length, 2);
    const grid = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:26px 28px;width:100%">${items.map((d, i) => detailCell(g, d, { rule: i % cols !== 0, pad: 28, size: 16 })).join('')}</div>`;
    const soc = s === 'socialsOff' ? '' : `<div style="border-top:1px solid ${g.border};padding-top:20px;display:flex;align-items:center;gap:20px;flex-wrap:wrap"><span style="font-size:14px;color:${g.muted};font-family:${g.pack.body}">Elsewhere</span>${K.socialRow(g, { mode: 'labels', gap: 20, n: s === 'six' ? 6 : 4, items: s === 'six' ? K.SOCIALS.concat([{ name: 'YouTube' }, { name: 'Bluesky' }]) : K.SOCIALS })}</div>`;
    return `<div style="width:100%;display:flex;flex-direction:column;gap:24px">${grid}${soc}</div>`;
  },
  statesCap: 'THE DATA STATES · THIS DESIGN HAS NO FORM, SO IT HAS NO FORM STATES ⚑',
  tileMin: 200,
  statesNote: `${NOFORM} ${b('An empty cell takes its label with it and the remaining cells re-fit to 1fr')} ⚑ — nothing is substituted for what is missing, which is A3’s empty-data floor carried verbatim. ${b('At one filled row the cell sits at the left of the grid and is not stretched')} ⚑; a single value spread across 1,296 px reads as a mistake.`,
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS · NO DELIVERY GROUP ⚑',
    name: 'Details Grid', n: 6, sub: 'Four cells, no form.', count: 'FIVE CONTROLS · NO DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.sel('Columns', 'Auto', `Auto · Two · Three · Four. ${b('Auto follows the number of filled rows')} ⚑ — four filled is four columns, three is three — which is A3·2’s rule for link columns carried over.`),
      K.sel('Head', 'Flush left', 'Centred · Flush left · None. At None the grid is the whole section and the cells’ labels do the naming ⚑.'),
      K.seg('Social', ['Labels', 'Glyphs', 'Off'], 0, `A3·1’s values with ${b('Labels as the default here')} ⚑, which is the opposite of 1 Split — this design has the room.`),
      K.seg('Dividers', ['Hairlines', 'None'], 0, 'Hairlines sit between cells, never around them ⚑. None leaves the grid to its gutters.'),
      K.repeater({ label: 'Socials', items: ['Instagram · @orbitweekly', 'X · @orbitweekly', 'Mastodon · @orbit@social.lisboa', 'LinkedIn · Orbit Weekly'], add: '+ Add platform', help: 'A3’s list, verbatim. Add opens the platform picker and lands last; six is the ceiling and Add is disabled there with the reason shown ⚑.' })
    ],
    delivery: { none: true },
    settles: [
      `${b('Five controls and no delivery group.')} ⚑ There is no form here, so the five delivery rows are not drawn — but they are ${b('kept on the section')}, along with the field set and every form string, so switching to 1 Split loses nothing.`,
      `${b('The contact block’s order is fixed')} ⚑ — post, email, phone, replies — so there is no reorder and no repeater for it. A3·10 made that call and this design does not reopen it; only the socials are a list.`,
      `${b('Cut:')} a value size (17 px is the size at which four cells across 1,296 stay one composition), an emphasis value (${b('no cell can be made the important one')} ⚑ — that is per-item styling, and a design that needs it is 9 Slim Bar or 10 Big Type), and a form toggle, because a form is a different design and the picker is where you get one.`
    ]
  },
  tabletLabel: '834 · two-across, hairline between the pair',
  mobileLabel: '390 · one per row, dividers become rules above',
  respCap: 'TABLET 834 · TWO-ACROSS · MOBILE 390 · ONE PER ROW',
  respNote: `grid-of-N’s ladder, unchanged: ${b('4 → 2 → 1')}. ${b('The vertical hairlines become horizontal ones at 390')} ⚑ — a divider between two cells in a column is a rule above the second, not a line down the side of nothing. Head measure 560 → 560 → 350; values 17 → 17 → 16; the social row wraps under its “Elsewhere” label at 390 rather than sitting beside it.`,
  darkNote: `Ground ${code('#171511')}, hairlines ${code('#332E27')}, labels ${code('#A79E8F')} and values ${code('#F2EDE4')}. ${b('Nothing here has a fill in either mode')} — this is the flattest design in A16 and dark changes four token values and no geometry.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'Four labelled detail cells across the content box divided by hairlines, with the social row beneath a rule. No form at any value.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · page · few · none · detail blocks without a form')}<br><span style="color:#6B6459">Item-count ${code('few')}: the grid is built for two to four cells. 8 Locations is the other ${code('grid-of-N')} and differs on ground and media placement.</span>`),
    K.specRow(3, 'Archetype', 'grid-of-N. No departures — 4 → 2 → 1.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} four cells at 1fr on 32 px gutters with a hairline between each pair, values 17, padding 96. ${b('834')} two-across, one hairline, padding 80. ${b('≤ 767')} one per row, ${b('hairlines become rules above')} ⚑, values 16, padding 64.`),
    K.specRow(5, 'Content fields', `The four contact rows (${code('postal')}, ${code('email')}, ${code('phone')}, ${code('replyHours')}), each ≤ 140 characters · ${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('socialsLabel')} (opt, ≤ 20, default “Elsewhere”) · ${code('socials[]')}. ${b('Every form field and every form string is stored and never drawn')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Auto · Two · Three · Four')} — Head ${b('Centred · Flush left · None')} — Social ${b('Labels · Glyphs · Off')} — Dividers ${b('Hairlines · None')}. Then the socials repeater. ${b('No delivery group')} ⚑.`),
    K.specRow(7, 'Data', `Nothing from Ghost. ${b('0 filled contact rows')} → the grid is removed and the section is head and socials ⚑; if socials are also off the section does not render at all and the editor says so. ${b('1')} → one cell at the left, not stretched. ${b('many')} → four is the ceiling, because the block is four fixed fields.`),
    K.specRow(8, 'Empty state', `Each empty row removes its cell and its divider ⚑. No head → the grid alone. ${b('No socials')} → the row and the rule above it go together ⚑.`),
    K.specRow(9, 'Behaviour module', `${b('none.')} ⚑ Text, links and no script. There is no degradation statement to quote because there is nothing that could fail: every link is a real ${code('&lt;a href&gt;')} — ${code('mailto:')}, ${code('tel:')} and the social URLs — and they work with JavaScript off, on, or blocked.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('The grid is a')} ${code('&lt;dl&gt;')} ⚑, as 4 Panel’s row is. ${code('mailto:')} and ${code('tel:')} links carry their full value as text so they are readable when printed ⚑. Social links take ${code('rel="me"')} and their visible name as the accessible name — ${b('at Social: Glyphs the two-letter box has a visually-hidden platform name')} ⚑. Labels 5.4:1 light, 6.4:1 dark; values 13.4:1 and 8.1:1.<br>${b('Repeating items')} — ${code('socials[]')}: Add opens the platform picker and lands last, Remove is on the row, drag reorders, 0–6, ${b('designed for 3–5')}, zero removes the row and its rule.<br>${b('Flagged ⚑')} Labels as the social default here · dividers between and never around · hairlines becoming rules at 390 · one cell not stretching · no delivery group · the ${code('&lt;dl&gt;')}.`)
  ]]
};

/* ── 7 · Map Split ─────────────────────────────────────────────────── */
const d7 = {
  n: 7, name: 'Map Split',
  rail: 'A16 CONTACT · DESIGN 7 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'A static map holding one half of a surface plane and the address, hours and form holding the other. The map is an image with a link on it, never an embedded frame.',
    'It is the design for a publication with an office a reader might walk to. It is also where A16 settles what a map is: a picture the theme can render, not a third-party script the reader has to consent to.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · MAP 560 FLUSH TO THE PLANE · RIGHT COLUMN 736 ON 48 PADDING',
  body(t, w) {
    const gs = K.ground(t, 'surface'), gp = K.ground(t, 'page');
    const loc = K.LOCATIONS[0];
    const details = `<div style="display:flex;flex-direction:column;gap:10px">
        <span style="font-family:${gs.pack.head};font-size:${w === 390 ? 20 : 22}px;font-weight:700;color:${gs.text};line-height:1.2">${loc.name}</span>
        <span style="font-size:15px;line-height:1.6;color:${gs.muted};font-family:${gs.pack.body}">${loc.address}</span>
        <span style="font-size:14px;line-height:1.5;color:${gs.muted};font-family:${gs.pack.body}">${loc.hours}</span></div>`;
    if (w >= 1440) {
      const plane = `<div style="width:100%;display:flex;background:${gs.bg};border:1px solid ${gs.border};border-radius:${gs.r}px;overflow:hidden;box-sizing:border-box;${t.dark ? '' : `box-shadow:${t.shadow};`}">
          ${K.mapPlate(t, gs, { w: 560, h: 560, r: 0 })}
          <div style="width:736px;padding:48px;box-sizing:border-box;display:flex;flex-direction:column;gap:28px">${details}<div style="border-top:1px solid ${gs.border};padding-top:28px">${K.formBlock(gs, { fields: 3, message: 'Short' })}</div></div></div>`;
      const inner = `<div style="display:flex;flex-direction:column;gap:40px">${K.headBlock(gp, w, { measure: 560, max: 720 })}${plane}</div>`;
      return P.stdWrap(t, w, inner);
    }
    const plane = `<div style="width:100%;background:${gs.bg};border:1px solid ${gs.border};border-radius:${gs.r}px;overflow:hidden;box-sizing:border-box;${t.dark ? '' : `box-shadow:${t.shadow};`}">
        ${K.mapPlate(t, gs, { h: w === 390 ? 220 : 300, r: 0 })}
        <div style="padding:${w === 390 ? 24 : 40}px;box-sizing:border-box;display:flex;flex-direction:column;gap:${w === 390 ? 24 : 28}px">${details}<div style="border-top:1px solid ${gs.border};padding-top:${w === 390 ? 24 : 28}px">${K.formBlock(gs, { fields: 3, message: 'Short', stack: w === 390, narrow: true, buttonFull: w === 390 })}</div></div></div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px">${K.headBlock(gp, w, { measure: w === 390 ? 350 : 560, max: 720 })}${plane}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `${b('The map is a static image with a link on it and never an embedded frame')} ⚑ — that is this design’s settlement and it holds at every value. An embed is a third-party script, a cookie banner and a layout that shifts when it loads; a picture is none of those. The image is generated from the location’s coordinates at build and ${b('the button on it opens the reader’s own map application')} ⚑. The map runs flush to the plane’s edge with no padding, so the plane’s radius clips it — the only place in A16 where an image touches a container edge.`,
  stateForm(t, s) {
    const gs = K.ground(t, 'surface');
    return `<div style="width:100%;background:${gs.bg};border:1px solid ${gs.border};border-radius:${gs.r}px;padding:20px;box-sizing:border-box;box-shadow:${t.dark ? 'none' : t.sm}">${K.formBlock(gs, { state: s, fields: 3, message: 'Short' })}</div>`;
  },
  tileMin: 320,
  statesNote: `The seven states in the plane’s right column, drawn without the map so the form is legible at 616 px. ${b('The map and the address never change state')} ⚑ — at sent the right column shrinks and ${b('the map shrinks with it, keeping the two halves the same height')} ⚑, which is the one thing this design does that 4 Panel does not.`,
  extraTiles: [{
    label: 'WHAT A MISSING MAP DOES · A19’S VOCABULARY, UNCHANGED',
    body: [
      `${b('No map image')} → ${b('Plate')}: the striped placeholder with its crop caption in the editor, and ${b('on the published page the map half is removed and the right column takes the whole plane')} ⚑ — Reflow, not an empty grey box.`,
      `${b('No coordinates but an address')} → the map is generated from the address string, and ${b('the editor says which')} ⚑.`,
      `${b('No location at all')} → the plane holds the form alone at full width, which is 4 Panel with the contact row off, and the panel names it ⚑.`
    ]
  }],
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED DELIVERY GROUP',
    name: 'Map Split', n: 7, sub: 'Map one half, form the other.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 outside the plane.'),
      K.sel('Fields', 'Name, email, message', `The category’s four-value set. ${b('Message defaults to Short here')} ⚑ — the right column is already carrying an address and hours.`),
      K.seg('Map side', ['Left', 'Right'], 0, 'Which half the map takes. The form takes the other.'),
      K.seg('Map height', ['Short', 'Medium', 'Tall'], 1, `400 · 560 · 720 at 1440. ${b('The plane is as tall as the taller half')} ⚑ — a short map beside a five-field form leaves the map letterboxed, and the panel says so rather than cropping the form.`),
      K.sel('Beside the map', 'Address and hours', 'Address and hours · Address only · Off. Off leaves the form alone in its half ⚑.'),
      K.seg('Depth', ['Raised', 'Flat'], 0, 'Raised is the md shadow; Flat is the hairline. Dark forces Flat ⚑.')
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: a map-provider value (${b('the provider is a platform decision, not a section control')} ⚑ — the same call A22 made about its endpoint), a zoom value (the image is generated at a fixed zoom that fits a street and its two neighbours), a pin-colour value, and a message-height value — ${b('this design fixes Message at Short')} ⚑ and the Fields row says so.`,
      `${b('The map is never an embed')} ⚑ at any value, and there is no control that makes it one. A user who needs a live map is describing an A15 Video and Embeds section, and the panel names it.`,
      `${b('Map height and the plane’s height are the same thing')} — the shorter half is padded, never stretched, and the image is never distorted to fill ⚑.`
    ]
  },
  tabletLabel: '834 · one column · map above ⚑ · 300 tall',
  mobileLabel: '390 · map above at 220 · form beneath',
  respCap: 'TABLET 834 AND MOBILE 390 · ONE COLUMN, MAP ABOVE ⚑ — A16’S ONE DEPARTURE FROM DETAILS-BENEATH',
  respNote: `Every other two-column design in A16 puts its details ${b('beneath')} the form below 1,081. ${b('This one puts the map above')} ⚑, and it is the category’s single stated departure from that rule: a map below a five-field form is a map nobody sees, and the map is why a reader opened this section. The map goes ${b('16:9 rather than square')} below 1,081 ⚑ — 300 px tall at 834 and 220 at 390 — because a 560 px square map on a 390 px screen is most of a phone. Address and hours follow the map; the form is last.`,
  darkNote: `Plane ${code('#211D17')}, Flat forced, hairline ${code('#332E27')}. ${b('The map image is re-generated for dark, not filtered')} ⚑ — a CSS ${code('invert')} on a map turns water into land and roads into rivers. The striped placeholder switches to the dark stripe accordingly.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A static map holding one half of a surface plane and the address, hours and form holding the other. The map is an image with a link, never an embed.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · surface · none · left · a map holding one half')}<br><span style="color:#6B6459">Media placement ${code('left')} and ground ${code('surface')} together separate it from 1 Split, which is ${code('page')} with no media.</span>`),
    K.specRow(3, 'Archetype', `split. ${b('Two departures')} — it collapses at 1,080 like every A16 split ⚑, and ${b('the media goes above rather than below')} ⚑, which no other A16 design does.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,296; map 560 square flush to the edge; right column 736 on 48 padding holding name, address, hours, a hairline and the form. ${b('1080')} one column: ${b('map above at 16:9')} ⚑, then address and hours, then the form. ${b('834')} map 300 tall, plane padding 40. ${b('≤ 767')} map 220 tall, padding 24, fields 48, field text 16, button full width.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · one entry of ${code('locations[]')} — ${code('name')} (req, ≤ 40) · ${code('address')} (req, ≤ 120) · ${code('hours')} (opt, ≤ 80) · ${code('mapImage')} (opt) · ${code('mapUrl')} (opt) · ${code('coords')} (opt) — plus the form’s fields and strings. ${b('The first location is the one drawn')} ⚑; further entries are kept and 8 Locations is named as the design that draws them all.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Fields (the four-value set) — Map side ${b('Left · Right')} — Map height ${b('Short 400 · Medium 560 · Tall 720')} — Beside the map ${b('Address and hours · Address only · Off')} — Depth ${b('Raised · Flat')}. Then the delivery group.`),
    K.specRow(7, 'Data', `Nothing from Ghost. ${code('locations[]')} at ${b('0')} → the map half is removed and the plane holds the form at full width ⚑, which the panel names as 4 Panel. ${b('1')} is the design. ${b('many')} → the first is drawn, the rest kept, and ${b('the sidebar names which one is on the page')} ⚑.`),
    K.specRow(8, 'Empty state', `No hours → the line goes and the block closes up. ${b('No map image and no coordinates')} → A19’s ${b('Reflow')}: the map half is removed rather than drawn empty ⚑; the editor shows the striped Plate with its caption so the gap is visible while editing.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe. ${b('The map declares no module')} ⚑ — it is an ${code('&lt;img&gt;')} inside an ${code('&lt;a&gt;')}. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; the location name is an ${code('h3')} ⚑. ${b('The map image’s alt names the place, not the picture')} ⚑ — “Map showing 14 Rua da Boavista, Lisbon” — and the link around it says where it goes. The address is an ${code('&lt;address&gt;')} element. ${b('Focus order is map link, then address, then form')} ⚑, which follows the reading order in both arrangements because Map side: Right reorders the DOM, not just the flex.<br>${b('Repeating items')} — ${code('locations[]')}: one drawn. Add lands last and is seeded with the site’s own city ⚑, never a blank card; Remove is on the row; ${b('reorder is meaningful here')} ⚑, because the first entry is the one on the page.<br>${b('Flagged ⚑')} the static-map settlement · map above at ≤ 1,080 · Message fixed at Short · both halves matching height · dark re-generating rather than filtering the image.`)
  ]]
};

/* ── 8 · Locations ─────────────────────────────────────────────────── */
const d8 = {
  n: 8, name: 'Locations',
  rail: 'A16 CONTACT · DESIGN 8 OF 15 · PAPER PACK · FIVE CONTROLS · NO FORM, NO MODULE',
  paras: [
    'One card per place, on a full-bleed surface ground: a map thumbnail above, then the name, the address, the opening hours and a link to directions.',
    'It is the design for a publication with more than one office, and the only design in A16 built for a list of places. Two or three is what it is drawn for; one and four are stated.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FULL-BLEED SURFACE GROUND · THREE CARDS AT 416 ON 24 GUTTERS',
  body(t, w) {
    const g = K.ground(t, 'surface'), gg = G(w);
    const pad = w === 1440 ? 96 : w === 834 ? 80 : 64;
    const n = w === 390 ? 3 : 3;
    const cards = K.LOCATIONS.slice(0, n).map(loc => K.locationCard(t, g, { loc, cardBg: t.bg, pad: w === 390 ? 20 : 22, nameSize: w === 390 ? 20 : 22, w: w === 390 ? 350 : undefined, thumbH: w === 390 ? 150 : 132 })).join('');
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 44}px">
        ${K.headBlock(g, w, { align: w === 390 ? 'left' : 'center', measure: w === 390 ? 350 : 560, max: 720, headingText: 'Where we are', blurbText: 'Two newsrooms and a desk. Post reaches all three; the door only opens at the first two.' })}
        <div style="display:flex;${w === 390 ? 'flex-direction:column;' : ''}gap:24px;align-items:stretch">${cards}</div></div>`;
    const band = `<div style="width:${w}px;background:${g.bg};padding:${pad}px ${gg.m}px;box-sizing:border-box"><div style="width:${gg.box}px;margin:0 auto">${inner}</div></div>`;
    return P.bleedWrap(t, w, band, 'SECTION PADDING 0 AT EVERY WIDTH · THE SURFACE GROUND CARRIES IT ⚑');
  },
  primaryNote: `A full-bleed ${code('surface')} fill carrying the padding, with the cards drawn in the page colour on top of it — ${b('the inverse of every other card in the library')} ⚑, and the reason this design’s ground slot reads ${code('surface')} while 3 Card’s reads ${code('page')}. A26·3’s call stands: a full-width fill is a ground, not a containment. ${b('The map thumb is 16:9 and flush to the card’s top edge')}; the name is an ${code('h3')} at 22; hours sit under a hairline because they are the one line that changes.`,
  states: ['three', 'two', 'one', 'four', 'nohours', 'nomap'],
  stateLabels: {
    three: 'THREE · what the grid is drawn for',
    two: 'TWO · each card takes half the box, not a third ⚑',
    one: 'ONE · the card takes 640 and sits at the left, and the panel names 7 ⚑',
    four: 'FOUR · wraps to 2 × 2 rather than shrinking to 312 ⚑',
    nohours: 'NO HOURS · the line and its hairline go together ⚑',
    nomap: 'NO MAP IMAGE · the card starts at its name, no grey box ⚑'
  },
  stateForm(t, s) {
    const g = K.ground(t, 'surface');
    const L = K.LOCATIONS;
    const four = L.concat([{ name: 'Porto', address: 'Rua de Cedofeita 212<br>4050-176 Porto, Portugal', hours: 'Tuesdays only' }]);
    const map = { three: L, two: L.slice(0, 2), one: [L[0]], four, nohours: [{ ...L[0], hours: null }, { ...L[1], hours: null }], nomap: L.slice(0, 2) };
    const items = map[s] || L;
    const cols = s === 'one' ? 1 : 2;
    return `<div style="width:100%;background:${g.bg};border-radius:8px;padding:16px;box-sizing:border-box;display:grid;grid-template-columns:repeat(${cols},1fr);gap:14px">${items.map(loc => K.locationCard(t, g, { loc, cardBg: t.bg, pad: 16, nameSize: 18, thumbH: s === 'nomap' ? undefined : 84, thumb: s === 'nomap' ? false : true, hours: s === 'nohours' ? false : true, flat: true })).join('')}</div>`;
  },
  statesCap: 'THE ITEM-COUNT STATES · THIS DESIGN HAS NO FORM, SO IT HAS NO FORM STATES ⚑',
  tileMin: 240,
  statesNote: `${NOFORM} ${b('The grid is drawn for two and three')} ⚑. At one the card takes 640 and sits at the left rather than stretching to 1,296 — and ${b('the panel names 7 Map Split')} as the design for a single place, since a card that wide beside 656 px of nothing is a worse answer than a map. At four the grid wraps to two rows of two rather than shrinking the cards to 312 ⚑, because a 16:9 thumb at 312 is 175 px tall and the address under it wraps to four lines.`,
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS + THE LOCATION REPEATER · NO DELIVERY GROUP ⚑',
    name: 'Locations', n: 8, sub: 'One card per place.', count: 'FIVE CONTROLS · NO DELIVERY GROUP',
    rows: [
      K.seg('Ground padding', ['Compact', 'Comfortable', 'Spacious'], 1, `64 · 96 · 132 inside the surface fill. ${b('It replaces the section’s Padding')} ⚑ — the section’s own is 0 at every value.`),
      K.sel('Columns', 'Auto', `Auto · Two · Three. ${b('Auto follows the count')} ⚑: two locations is two columns, three or more is three. There is no Four ⚑ — see the item note.`),
      K.seg('Map thumbs', ['Show', 'Hide'], 0, 'Hide leaves a text card and the grid closes up by 132 px ⚑ — the cards do not keep the space.'),
      K.seg('Hours', ['Show', 'Hide'], 0, 'Hide removes the line and the hairline above it together ⚑.'),
      K.sel('Head', 'Centred', 'Centred · Flush left · None.'),
      K.repeater({ label: 'Locations', items: ['Lisbon · 14 Rua da Boavista', 'Berlin · Sonnenallee 68', 'São Paulo · Rua Augusta 1508'], add: '+ Add location', help: `${b('Add is seeded with the site’s own city and a placeholder address')} ⚑, never a blank card, and lands last. ${b('Reorder is meaningful')} — authored order is reading order. 1–6; drawn for 2–3; ${b('Remove is disabled at one')} with the reason shown ⚑.` })
    ],
    delivery: { none: true },
    settles: [
      `${b('Five controls and no delivery group.')} ⚑ No form, no module, no delivery rows — and every form field is kept on the section.`,
      `${b('Inside a location the user edits content only')} ⚑: name, address, hours, the map image and the directions URL. Not the card’s padding, not its thumb height, not whether that one card is wider. ${b('A design that needed one card bigger would be two designs')}, and this one says so rather than growing a per-item control.`,
      `${b('Columns has no Four value')} ⚑ even though the field allows six locations: four cards on 1,296 are 312 wide, and the 16:9 thumb, the two-line address and the hours line stop composing at that width. Five and six wrap to a second row of the same size.`
    ]
  },
  tabletLabel: '834 · two-across, third wraps',
  mobileLabel: '390 · one per row, thumb 150',
  respCap: 'TABLET 834 · TWO-ACROSS · MOBILE 390 · ONE PER ROW, THUMB TALLER',
  respNote: `grid-of-N’s ladder: ${b('3 → 2 → 1')}. ${b('The third card at 834 wraps to a second row at half width and is not stretched')} ⚑ — a lone full-width card under two half-width ones reads as a mistake. At 390 the thumb goes ${b('150 px rather than 132')} ⚑: it is the full 350 measure there, so 16:9 is taller. The surface ground stays full bleed at every width and never takes a page margin.`,
  darkNote: `${b('The ground and the cards swap roles, not colours')}: ground ${code('#211D17')} — the surface step — and cards ${code('#171511')}, the page ground, exactly as in light. Hairline ${code('#332E27')}, shadows dropped ⚑. The map thumbs are re-generated for dark, not filtered ⚑.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'One card per location on a full-bleed surface ground — map thumb, name, address, hours, directions. The only design in A16 built for a list of places.'),
    K.specRow(2, 'Structural descriptor', `${code('grid-of-N · none · surface · few · top · one card per location')}<br><span style="color:#6B6459">Containment ${code('none')}: the cards are the ${b('items’')} geometry, not the section’s — A21·2’s rule. Ground ${code('surface')} and media ${code('top')} separate it from 6 Details Grid.</span>`),
    K.specRow(3, 'Archetype', `grid-of-N. ${b('One departure')} — the section’s own padding is 0 and the ground carries it ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} full-bleed surface, inside 96 × 72, three cards at 416 on 24 gutters, thumb 132 at 16:9. ${b('834')} inside 80 × 40, two-across, the third wrapping at half width ⚑. ${b('≤ 767')} inside 64 × 20, one per row, thumb 150, name 20.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('locations[]')} (1–6) with ${code('name')} (req, ≤ 40) · ${code('address')} (req, ≤ 120) · ${code('hours')} (opt, ≤ 80) · ${code('mapImage')} (opt) · ${code('mapUrl')} (opt) · ${code('directionsLabel')} (opt, ≤ 20, default “Directions”). Every form field and ${code('socials[]')} are stored and not drawn ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Ground padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Auto · Two · Three')} — Map thumbs ${b('Show · Hide')} — Hours ${b('Show · Hide')} — Head ${b('Centred · Flush left · None')}. Then the locations repeater. ${b('No delivery group')} ⚑.`),
    K.specRow(7, 'Data', `Nothing from Ghost — ${b('Ghost has no location object')} ⚑, which is a finding. ${b('0')} → the section does not render and the editor says a location is needed ⚑. ${b('1')} → one card at 640 at the left, and the panel names 7 Map Split. ${b('2–3')} is the design. ${b('4–6')} wraps at the same card size ⚑.`),
    K.specRow(8, 'Empty state', `No hours → line and hairline go together. ${b('No map image')} → A19’s ${b('Reflow')}: the card starts at its name and the grid’s rows re-fit ⚑; the editor shows the Plate. No directions URL → the link is not drawn ⚑, the address stays.`),
    K.specRow(9, 'Behaviour module', `${b('none.')} ⚑ Static images, text and real links. Nothing to degrade.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; each location name an ${code('h3')} ⚑. The card is an ${code('&lt;article&gt;')} holding an ${code('&lt;address&gt;')}; hours are a ${code('&lt;p&gt;')}, not a table ⚑ — one line of prose is not tabular data. ${b('The whole card is not a link')} ⚑; only “Directions” is, so the address stays selectable and copyable. Thumb alt names the place. Card border 1.4:1 on the surface ground — a hairline, not a control.<br>${b('Repeating items')} — ${code('locations[]')}: Add seeded with the site’s city and landing last; Remove on the row, ${b('disabled at one')} ⚑; drag reorders and order is reading order; ${b('1–6, drawn for 2–3')}; zero does not render.<br>${b('Flagged ⚑')} the inverted ground · zero section padding · no Four column value · the wrap at four · the 150 px thumb at 390 · Remove disabled at one · Ghost having no location object.`)
  ]]
};

/* ── 9 · Slim Bar ──────────────────────────────────────────────────── */
const d9 = {
  n: 9, name: 'Slim Bar',
  rail: 'A16 CONTACT · DESIGN 9 OF 15 · PAPER PACK · FIVE CONTROLS · NO FORM, NO MODULE',
  paras: [
    'A full-bleed surface strip between hairlines carrying a label, one address and the social row on a single line. The smallest contact section in the library — 94 px including both rules.',
    'It is the design for a page that asks somewhere else: a strip above the footer, a break between two post grids, the foot of an archive. It has no heading, no blurb and no form.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · STRIP FULL BLEED · 94 PX INCLUDING BOTH HAIRLINES',
  body(t, w) {
    const g = K.ground(t, 'surface'), gg = G(w);
    const pad = w === 390 ? 20 : 24;
    const line = w === 390
      ? `<div style="display:flex;flex-direction:column;gap:14px">
          <span style="font-family:${g.pack.head};font-size:17px;font-weight:700;color:${g.text};line-height:1.3">Orbit Weekly</span>
          <span style="font-size:16px;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px">hello@orbitweekly.com</span>
          ${K.socialRow(g, {})}</div>`
      : `<div style="width:${gg.box}px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:32px">
          <div style="display:flex;align-items:center;gap:${w === 1440 ? 28 : 20}px">
            <span style="font-family:${g.pack.head};font-size:${w === 1440 ? 19 : 17}px;font-weight:700;color:${g.text};line-height:1.3">Orbit Weekly</span>
            <span style="width:1px;height:22px;background:${g.border}"></span>
            <span style="font-size:${w === 1440 ? 16 : 15}px;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px">hello@orbitweekly.com</span></div>
          ${K.socialRow(g, {})}</div>`;
    const strip = `<div style="width:${w}px;background:${g.bg};border-top:1px solid ${g.border};border-bottom:1px solid ${g.border};padding:${pad}px ${gg.m}px;box-sizing:border-box">${line}</div>`;
    return P.bleedWrap(t, w, strip, 'SECTION PADDING 0 AT EVERY WIDTH · THE STRIP CARRIES IT ⚑');
  },
  primaryNote: `A22·9’s strip geometry with an address in it instead of a field: content 1,296 on a 72 margin, 24 px inside, hairlines above and below, ${b('94 px total at 1440')}. ${b('There is no heading and no blurb at any value')} ⚑ — both are stored and neither is drawn, because a strip that grows a paragraph is 6 Details Grid. The label is the site title by default and a 20-character ${code('label')} field at Custom ⚑. ${b('The social glyphs are the only thing at the right')}, and at Off the address moves to the strip’s centre ⚑.`,
  states: ['email', 'phone', 'social', 'nosocial', 'long', 'page'],
  stateLabels: {
    email: 'CARRIES: EMAIL · the default',
    phone: 'CARRIES: EMAIL AND PHONE · a middot between them ⚑',
    social: 'CARRIES: EMAIL AND SOCIALS · what the primary frame draws',
    nosocial: 'SOCIAL: OFF · the address centres in the strip ⚑',
    long: 'THE UGLY TEST · a 34-character address and six glyphs',
    page: 'GROUND: PAGE · the strip is the page colour between two rules'
  },
  stateForm(t, s) {
    const g = K.ground(t, s === 'page' ? 'page' : 'surface');
    const addr = s === 'long' ? 'corrections@orbitweekly.example.com' : 'hello@orbitweekly.com';
    const phone = s === 'phone' ? `<span style="color:${g.muted}">·</span><span style="font-size:15px;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px">+351 21 346 0188</span>` : '';
    const soc = (s === 'nosocial') ? '' : K.socialRow(g, { n: s === 'long' ? 6 : 4, items: s === 'long' ? K.SOCIALS.concat([{ ini: 'YT' }, { ini: 'BS' }]) : K.SOCIALS });
    const centred = s === 'nosocial';
    return `<div style="width:100%;background:${g.bg};border-top:1px solid ${g.border};border-bottom:1px solid ${g.border};padding:20px 16px;box-sizing:border-box;display:flex;align-items:center;${centred ? 'justify-content:center;' : 'justify-content:space-between;'}gap:20px">
      <div style="display:flex;align-items:center;gap:16px">
        <span style="font-family:${g.pack.head};font-size:17px;font-weight:700;color:${g.text}">Orbit Weekly</span>
        <span style="width:1px;height:20px;background:${g.border}"></span>
        <span style="font-size:15px;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px">${addr}</span>${phone}</div>${soc}</div>`;
  },
  statesCap: 'THE STRIP’S OWN STATES · THIS DESIGN HAS NO FORM, SO IT HAS NO FORM STATES ⚑',
  tileMin: 120,
  statesNote: `${NOFORM} ${b('The strip is the one design in A16 whose height is fixed by its padding and a 44 px row and nothing else')} ⚑ — 20 · 24 · 36 inside, plus 46 for the tallest thing on the line, plus two hairlines. Nothing it can be given makes it taller at 1440, ${b('including a 34-character address and six glyphs')}, which is the ugly test and is drawn.`,
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS · NO DELIVERY GROUP ⚑',
    name: 'Slim Bar', n: 9, sub: 'One line, the address inline.', count: 'FIVE CONTROLS · NO DELIVERY GROUP',
    rows: [
      K.seg('Strip padding', ['Compact', 'Comfortable', 'Spacious'], 1, `16 · 24 · 36 ${b('inside the strip')} ⚑; the section’s own padding is 0 at every value.`),
      K.seg('Ground', ['Surface', 'Page'], 0, 'At Page the strip is the page colour between two rules, and the hairlines are doing all the work ⚑.'),
      K.seg('Rules', ['Above and below', 'Below only', 'None'], 0, `Hairlines. ${b('At None the strip padding rises one named step')} ⚑ — without an edge the line needs the air. A22·9’s rule, carried verbatim.`),
      K.sel('The strip carries', 'Email and socials', 'Email · Email and phone · Email and socials. ⚑ Three values and no fourth — a strip with an address, a phone number and six glyphs is 6 Details Grid on one line.'),
      K.seg('Label', ['Site name', 'Custom'], 0, `Site name reads Ghost’s ${code('@site.title')}; Custom draws the ${code('label')} field, ≤ 20 characters ⚑.`),
      K.repeater({ label: 'Socials', items: ['Instagram', 'X', 'Mastodon', 'LinkedIn'], add: '+ Add platform', help: 'A3’s list, verbatim; six the ceiling. Drawn only at The strip carries: Email and socials ⚑.' })
    ],
    delivery: { none: true },
    settles: [
      `${b('Five controls and no delivery group.')} ⚑ Cut: a heading value (${b('there is no heading')} ⚑), a blurb value (there is none), an alignment value — label and address left, socials right, always — and a height value, because the strip’s height is its padding plus a 46 px row and nothing else sets it.`,
      `${b('Ground: Page makes this 6 Details Grid’s ground on one line')}, and the two designs are named on each other’s panels rather than pretending the overlap is not there ⚑.`,
      `${b('Nothing here is per-item.')} A social entry cannot be made larger, first-among-equals, or a different colour; the list has one drawn order and one drawn size ⚑.`
    ]
  },
  tabletLabel: '834 · line holds, label 17',
  mobileLabel: '390 · stacked into three rows ⚑',
  respCap: 'TABLET 834 · THE LINE HOLDS · MOBILE 390 · THREE ROWS, NOT A COMPRESSED LINE',
  respNote: `Bar’s ladder with ${b('one departure')}: ${b('it stacks into three rows at ≤ 767 rather than compressing')} ⚑ — label, address, glyphs — because a 20-character label, a 21-character address and four 44 px boxes are 386 px of a 350 px measure. At 834 the line holds with the label at 17 and the separator kept. ${b('The strip is full bleed at every width and never takes a page margin')} ⚑.`,
  darkNote: `Surface ${code('#211D17')} between ${code('#332E27')} hairlines on the ${code('#171511')} ground, and ${b('no shadow at any value')} — the strip is never raised in light either, so dark changes four token values and nothing else. At Ground: Page the strip is ${code('#171511')} and only the two rules separate it from what is above.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A full-bleed surface strip between hairlines carrying a label, one address and the social row on a single line. No heading, no blurb, no form.'),
    K.specRow(2, 'Structural descriptor', `${code('bar · none · surface · none · none · one line, the address inline')}<br><span style="color:#6B6459">Archetype ${code('bar')} is the category’s only one. Ground ${code('surface')} is what its Ground control can leave, and the panel names 6 Details Grid when it does.</span>`),
    K.specRow(3, 'Archetype', `bar. ${b('Two departures')} — the section’s own padding is 0 ⚑, and it stacks at ≤ 767 rather than compressing ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} strip full bleed, content 1,296 on a 72 margin, 24 inside, label 19, address 16, glyphs 44, total 94. ${b('834')} 24 inside, label 17, address 15, line holds. ${b('≤ 767')} 20 inside, ${b('three rows')} ⚑ — label, address at 16, glyphs — total 190.`),
    K.specRow(5, 'Content fields', `${code('label')} (opt, ≤ 20, defaults to ${code('@site.title')}) ⚑ · ${code('email')} (req — the whole design) · ${code('phone')} (opt) · ${code('socials[]')}. ${b('Everything else in the category is stored and not drawn')} ⚑: heading, blurb, the postal address, reply hours, every form field and every form string.`)
  ], [
    K.specRow(6, 'Controls', `Strip padding ${b('Compact 16 · Comfortable 24 · Spacious 36')} — Ground ${b('Surface · Page')} — Rules ${b('Above and below · Below only · None')} — The strip carries ${b('Email · Email and phone · Email and socials')} — Label ${b('Site name · Custom')}. Then the socials repeater. ${b('No delivery group')} ⚑.`),
    K.specRow(7, 'Data', `${code('@site.title')} for the label at its default. ${code('socials[]')} at ${b('0')} → the glyph row goes and ${b('the label and address centre in the strip')} ⚑. ${b('1')} → one box at the right. ${b('many')} → six is the ceiling; at 1440 six glyphs and a 21-character address use 720 of 1,296.`),
    K.specRow(8, 'Empty state', `${b('No email is the one thing this design cannot survive')} ⚑ — the section does not render and the editor says an address is needed, because a strip whose only content is a label is a rule with a word on it.`),
    K.specRow(9, 'Behaviour module', `${b('none.')} ⚑ A label, two links and a row of links. Nothing to degrade.`),
    K.specRow(10, 'Accessibility', `${b('No heading at any level')} ⚑ — a one-line strip with a heading would put an empty entry in the document outline. The strip is a ${code('&lt;section aria-label="Contact"&gt;')} ⚑. The address is a ${code('mailto:')} carrying its full text. Glyph boxes have visually-hidden platform names ⚑. Separator is a ${code('&lt;span aria-hidden&gt;')} rule, not a character. Label 13.4:1 light, 8.1:1 dark; glyph border 1.4:1, and ${b('the 44 px box is the target, the border is decoration')} ⚑.<br>${b('Repeating items')} — ${code('socials[]')}: as elsewhere, 0–6, drawn only at the third carries value.<br>${b('Flagged ⚑')} zero section padding · the ≤ 767 stack · Rules: None raising the padding · three carries values and no fourth · centring when socials are off · the ${code('aria-label')} instead of a heading.`)
  ]]
};

/* ── 10 · Big Type ─────────────────────────────────────────────────── */
const d10 = {
  n: 10, name: 'Big Type',
  rail: 'A16 CONTACT · DESIGN 10 OF 15 · PAPER PACK · FIVE CONTROLS · NO FORM, NO MODULE',
  paras: [
    'The address itself at display scale, with one short line above it and the social row beneath. The category’s one display moment, and it is spent on the thing a reader is meant to copy.',
    'It is the design for a publication whose contact page is a statement: no form, no hours, no map — an address large enough to read across a room, and the places it is also on.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · ADDRESS AT 76 · TRANSPARENT GROUND · SOCIAL ROW BENEATH',
  body(t, w) {
    const g = K.ground(t, 'page');
    const size = w === 1440 ? 76 : w === 834 ? 46 : 30;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 26 : 36}px">
        ${K.eyebrow(g, 'Write to us')}
        <a href="mailto:hello@orbitweekly.com" style="margin:0;font-family:${g.pack.head};font-size:${size}px;font-weight:700;line-height:1.02;letter-spacing:-0.04em;color:${g.text};text-decoration:none;word-break:break-word;max-width:${w === 390 ? 350 : 1180}px">hello@orbitweekly.com</a>
        <div style="display:flex;align-items:center;gap:${w === 390 ? 16 : 28}px;flex-wrap:wrap;border-top:1px solid ${g.border};padding-top:${w === 390 ? 24 : 28}px">
          <span style="font-size:15px;color:${g.muted};font-family:${g.pack.body}">Also on</span>${K.socialRow(g, { mode: 'labels', gap: w === 390 ? 18 : 28 })}</div></div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `The category’s ${b('one display moment')}, and it is spent here — on the address, not on a heading ⚑. ${b('The address is the link')}: the whole 76 px line is a ${code('mailto:')}, so the target is the type. ${b('The section draws no ground of its own')} ⚑, which is what ${code('transparent')} means in the tuple and why this design sits equally well on a page and inside a contrast band above it. ${b('There is no heading at any value')} ⚑ — an ${code('h2')} above a 76 px address would be a label on a title.`,
  states: ['default', 'long', 'nosocial', 'heading', 'left', 'small'],
  stateLabels: {
    default: 'AS AUTHORED · 21 characters at 76',
    long: 'THE UGLY TEST · 34 characters; it wraps at the @, never shrinks ⚑',
    nosocial: 'SOCIAL: OFF · the rule goes with the row ⚑',
    heading: 'ABOVE THE ADDRESS: HEADING · 24 px, still not an h2 ⚑',
    left: 'ALIGNMENT: CENTRED · the row centres with it',
    small: 'ADDRESS SIZE: LARGE 64 · the value for a long address'
  },
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const addr = s === 'long' ? 'corrections@orbitweekly.example.com' : 'hello@orbitweekly.com';
    const size = s === 'small' ? 30 : s === 'long' ? 30 : 34;
    const centred = s === 'left';
    const above = s === 'heading'
      ? `<span style="font-family:${g.pack.head};font-size:20px;font-weight:700;color:${g.text}">Say hello</span>`
      : K.eyebrow(g, 'Write to us');
    const soc = s === 'nosocial' ? '' : `<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;border-top:1px solid ${g.border};padding-top:16px;${centred ? 'justify-content:center;' : ''}"><span style="font-size:14px;color:${g.muted};font-family:${g.pack.body}">Also on</span>${K.socialRow(g, { mode: 'labels', gap: 16 })}</div>`;
    return `<div style="width:100%;display:flex;flex-direction:column;gap:18px;${centred ? 'align-items:center;text-align:center;' : ''}">${above}
      <span style="font-family:${g.pack.head};font-size:${size}px;font-weight:700;line-height:1.05;letter-spacing:-0.03em;color:${g.text};word-break:break-word">${addr}</span>${soc}</div>`;
  },
  statesCap: 'THE DISPLAY STATES · THIS DESIGN HAS NO FORM, SO IT HAS NO FORM STATES ⚑',
  tileMin: 190,
  statesNote: `${NOFORM} ${b('The address never shrinks to fit')} ⚑ — a 34-character address at Display 76 wraps at the ${code('@')} onto two lines and the section grows by 78 px. Type that resizes itself to its content is type the user cannot predict, and the panel offers ${b('Large 64')} as the value for a long address instead. ${b('Above the address: Heading draws a 24 px line, and it is still not an')} ${code('h2')} ⚑.`,
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS · NO DELIVERY GROUP ⚑',
    name: 'Big Type', n: 10, sub: 'The address at display scale.', count: 'FIVE CONTROLS · NO DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Address size', ['Large', 'Display', 'Full'], 1, `64 · 76 · 96 at 1440; 40 · 46 · 54 at 834; 28 · 30 · 32 at 390. ${b('Full 96 is disabled above 24 characters')} ⚑ with the count shown — 96 px × 25 characters is 1,340 of a 1,296 box.`),
      K.seg('Alignment', ['Flush left', 'Centred'], 0, 'The eyebrow, the address and the social row move together ⚑.'),
      K.sel('Above the address', 'Eyebrow', `Eyebrow · Heading · Nothing. ${b('Heading draws a 24 px line in the heading font and is still not an')} ${code('h2')} ⚑ — the section’s heading level is settled below.`),
      K.seg('Social', ['Labels', 'Glyphs', 'Off'], 0, 'A3·1’s values. Off removes the rule with the row ⚑.'),
      K.repeater({ label: 'Socials', items: ['Instagram · @orbitweekly', 'X · @orbitweekly', 'Mastodon · @orbit@social.lisboa', 'LinkedIn · Orbit Weekly'], add: '+ Add platform', help: 'A3’s list, verbatim; six the ceiling; drag to reorder.' })
    ],
    delivery: { none: true },
    settles: [
      `${b('Five controls and no delivery group.')} ⚑ Cut: a colour value (the address is ${code('text')}, and accent at 76 px is a headline in a warning colour), a ground value — ${b('this design has none')} ⚑ and that is the point of it — and a phone value, because a second display line is two display moments and rule 2 allows one.`,
      `${b('Full 96 disables itself above 24 characters')} ⚑ and shows the count rather than letting the address run off the box. That is the named-value rule from §7·4: a value that would break is disabled with its reason, never silently allowed.`,
      `${b('Nothing here is per-item.')} The social list has one size and one order; ${b('the address is not an item')} — it is a section field, which is why it can be display type at all.`
    ]
  },
  tabletLabel: '834 · address 46, one line',
  mobileLabel: '390 · address 30, wraps at the @',
  respCap: 'TABLET 834 · ADDRESS 46 · MOBILE 390 · ADDRESS 30, WRAPPING AT THE @',
  respNote: `stack’s ladder. The display ladder is ${b('76 → 46 → 30')} at Display, ${b('64 → 40 → 28')} at Large and ${b('96 → 54 → 32')} at Full — ${b('three ladders, one per named value')} ⚑, because a single ratio would put Full at 38 on a phone and Large at 24, and 24 px is not a display moment. At 390 a 21-character address at 30 px is 288 px of a 350 measure and holds one line; anything longer wraps at the ${code('@')} ⚑.`,
  darkNote: `${b('Nothing changes but the token values')} ⚑ — this is the design that proves the tuple’s ${code('transparent')}: there is no ground, no fill and no shadow to re-tune, so dark is ${code('#F2EDE4')} type on whatever the page is, with a ${code('#332E27')} rule above the social row.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The address at display scale with one short line above it and the social row beneath. The category’s single display moment, spent on the thing a reader copies.'),
    K.specRow(2, 'Structural descriptor', `${code('stack · none · transparent · none · none · the address at display scale')}<br><span style="color:#6B6459">Ground ${code('transparent')}: the section paints no ground of its own and shows whatever is beneath it — the only design in A16 that does.</span>`),
    K.specRow(3, 'Archetype', 'stack. No departures — one column at every width.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} eyebrow 13, address 76 on a 1,180 measure, rule, social row as labels, padding 96. ${b('834')} address 46, padding 80. ${b('≤ 767')} address 30, social labels wrapping under “Also on”, padding 64. ${b('Three ladders, one per Address size value')} ⚑.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} (opt, ≤ 24) · ${code('headingSmall')} (opt, ≤ 30 — the Heading value’s line) ⚑ · ${code('email')} (req — the whole design) · ${code('socialsLabel')} (opt, ≤ 20, default “Also on”) · ${code('socials[]')}. ${b('Everything else in the category is stored and not drawn')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Address size ${b('Large 64 · Display 76 · Full 96')} (Full disabled above 24 characters ⚑) — Alignment ${b('Flush left · Centred')} — Above the address ${b('Eyebrow · Heading · Nothing')} — Social ${b('Labels · Glyphs · Off')}. Then the socials repeater. ${b('No delivery group')} ⚑.`),
    K.specRow(7, 'Data', `Nothing from Ghost. ${code('socials[]')} at ${b('0')} → row and rule removed together ⚑; ${b('1')} → one label; ${b('many')} → six the ceiling, wrapping to a second line at 390.`),
    K.specRow(8, 'Empty state', `${b('No email → the section does not render')} ⚑ and the editor says so; there is nothing else in it. No eyebrow → the address starts the section. Social off → the rule goes too.`),
    K.specRow(9, 'Behaviour module', `${b('none.')} ⚑ One ${code('mailto:')} link at 76 px and a row of links.`),
    K.specRow(10, 'Accessibility', `${b('No heading at any level, at any value')} ⚑ — including Above the address: Heading, which is a styled ${code('&lt;p&gt;')}. The section is a ${code('&lt;section aria-label="Contact"&gt;')} ⚑. ${b('The address is the link and the link text is the address')} — no “email us”, so a screen reader announces the address itself. ${b('Display type is not a target problem')}: the line is 84 px tall at 76 px type, well past 44. Address 13.4:1 light, 8.1:1 dark. Reduced motion: nothing moves here in any state.<br>${b('Repeating items')} — ${code('socials[]')}: 0–6, drawn for 3–5.<br>${b('Flagged ⚑')} spending the display moment on the address · no heading at any value · Full disabled above 24 characters · three size ladders · wrapping at the ${code('@')} rather than shrinking · the ${code('transparent')} ground.`)
  ]]
};

return [d6, d7, d8, d9, d10];
})();
