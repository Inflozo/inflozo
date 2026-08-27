// A16 designs 11–15.
globalThis.A16D3 = (function () {
const K = globalThis.A16LIB, P = globalThis.A16PAGE;
const { b, code } = K;
const G = K.G;

/* ── 11 · Enquiry Types ────────────────────────────────────────────── */
const d11 = {
  n: 11, name: 'Enquiry Types',
  rail: 'A16 CONTACT · DESIGN 11 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'A row of enquiry types above one form, on a full-bleed surface ground. Choosing a type sets where the message goes and swaps the line under the row; the fields never change.',
    'It looks like a tab strip and it is not one. It is a radio group in a fieldset — which is why it needs no JavaScript, posts natively, and is the one place in A16 where the honest answer to “which module?” is “none of them”.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FULL-BLEED SURFACE GROUND · THREE RADIO ROWS ABOVE A 640 FORM',
  body(t, w) {
    const g = K.ground(t, 'surface'), gg = G(w);
    const pad = w === 1440 ? 96 : w === 834 ? 80 : 64;
    const fw = w === 1440 ? 640 : w === 390 ? 350 : 560;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px">
        ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560, max: 720, headingText: 'What is it about?' })}
        <div style="display:flex;flex-direction:column;gap:14px">
          ${K.enquiryRadios(g, { n: 3, stack: w === 390 })}
          <span style="font-size:14px;line-height:1.5;color:${g.muted};font-family:${g.pack.body}">Tips, letters and corrections. This one goes to hello@orbitweekly.com.</span></div>
        <div style="width:${fw}px;border-top:1px solid ${g.border};padding-top:${w === 390 ? 28 : 32}px">${K.formBlock(g, { fields: 3, message: 'Medium', stack: w === 390, narrow: w !== 1440, buttonFull: w === 390 })}</div></div>`;
    const band = `<div style="width:${w}px;background:${g.bg};padding:${pad}px ${gg.m}px;box-sizing:border-box"><div style="width:${gg.box}px;margin:0 auto">${inner}</div></div>`;
    return P.bleedWrap(t, w, band, 'SECTION PADDING 0 AT EVERY WIDTH · THE SURFACE GROUND CARRIES IT ⚑');
  },
  primaryNote: `${b('This is a radio group, not a tablist')} ⚑ — a ${code('&lt;fieldset&gt;')} of ${code('&lt;input type="radio"&gt;')} with a visually-hidden legend, styled as a row of 46 px rows at the pack radius. There are no panels to switch, because ${b('every type gets the same form')}: the choice sets the destination and the line beneath the row, and nothing else. That is what makes it work with JavaScript off — the chosen value posts with the message like any other field. ${b('The accent appears twice here')} ⚑, on the selected row and on the button, which is the category’s ceiling and is stated.`,
  stateForm(t, s) {
    const g = K.ground(t, 'surface');
    return `<div style="width:100%;background:${g.bg};border-radius:8px;padding:20px;box-sizing:border-box;display:flex;flex-direction:column;gap:16px">${K.enquiryRadios(g, { n: 3, gap: 8 })}${K.formBlock(g, { state: s, fields: 3, message: 'Short' })}</div>`;
  },
  tileMin: 380,
  statesNote: `The seven states with the radio row above them, because ${b('the row is part of the form')} ⚑ — it posts with it, and at submitting it greys with the rest of the fields. ${b('At sent the row goes with the form')} ⚑ and the confirmation names the type that was chosen: “Sent to Editorial.” ${b('At failed the chosen type is kept')} along with everything typed.`,
  extraTiles: [{
    label: 'THE FINDING · WHAT THIS DESIGN NEEDED AND THE REGISTRY DOES NOT HAVE',
    body: [
      `${b('The closest module is')} ${code('tabs')} ⚑, and it is the wrong one: its degradation is “All panels render stacked and visible, each preceded by its tab label as a heading”, and ${b('there are no panels here')} — one form serves every type.`,
      `${b('So this design declares')} ${code('member-form')} ${b('and nothing else')} ⚑. The radio row is plain HTML and needs no module at all; naming ${code('tabs')} would compile a behaviour that has nothing to operate on.`,
      `${b('The finding for the architect')} ⚑: a segmented control that writes a form value is a shape the registry has no entry for, and it is common enough — enquiry type, subject, department — to be worth one. Until then it costs nothing, because it needs no script.`
    ]
  }],
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE ENQUIRY REPEATER + THE SHARED DELIVERY GROUP',
    name: 'Enquiry Types', n: 11, sub: 'A type row above one form.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Ground padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 inside the surface fill; the section’s own padding is 0 ⚑.'),
      K.sel('Fields', 'Name, email, message', `The category’s four-value set. ${b('The chosen type is not one of the fields')} ⚑ — it is always posted and never counted.`),
      K.seg('Type row', ['Flush left', 'Centred', 'Full width'], 0, 'Full width divides the content box between the types, so three types are 429 each ⚑.'),
      K.seg('Message height', ['Short', 'Medium', 'Tall'], 1, '3 · 5 · 8 lines.'),
      K.seg('Ground', ['Surface', 'Page'], 0, `At Page the fill goes and the section is 2 Centred with a type row, and the panel says so ⚑.`),
      K.seg('The line beneath', ['Show', 'Hide'], 0, `The chosen type’s note. ${b('Hide leaves the addresses invisible to the reader')} ⚑ and the panel says that too — the choice still routes, it just stops explaining itself.`),
      K.repeater({ label: 'Enquiry types', items: ['Editorial · hello@orbitweekly.com', 'Advertising · ads@orbitweekly.com', 'Rights · rights@orbitweekly.com'], add: '+ Add type', help: `${b('A16’s own list')} ⚑. Add is seeded “New enquiry” with the section’s default address and lands last, never blank. ${b('2–4; drawn for three')} ⚑. Remove is disabled at two ⚑ — one type is not a choice, and the panel names 2 Centred. Drag to reorder; ${b('the first is the one selected on load')} ⚑.` })
    ],
    delivery: { where: 0, dest: 'per type — see the list', after: 'The service’s own page' },
    settles: [
      `${b('Six controls.')} Cut: a marker value (a radio is a radio; A9’s chevron-or-plus belongs to a disclosure and this discloses nothing), a per-type field set — ${b('every type gets the same fields')} ⚑, which is rule 1 about item controls read strictly — and a per-type colour, for the same reason.`,
      `${b('The destination is per type, and it is the one place in A16 where the delivery group’s address row defers to the list')} ⚑: each enquiry carries its own address, and the group’s single destination becomes the fallback for a type that has none.`,
      `${b('Inside a type the user edits three things')} ⚑: the label, the address and the note. Not its width, not its order relative to the others except by dragging, and not whether it is the selected one — that is always the first.`
    ]
  },
  tabletLabel: '834 · three types on one row, form 560',
  mobileLabel: '390 · types stack to three rows ⚑',
  respCap: 'TABLET 834 · ROW HOLDS · MOBILE 390 · ONE TYPE PER ROW, FULL WIDTH',
  respNote: `form’s ladder with ${b('one departure')}: ${b('the type row stacks at ≤ 767 rather than scrolling sideways')} ⚑ — three 46 px rows one above the other, each full width, each its own 46 px target. A horizontally scrolling row of radios hides choices behind an edge, which is the same objection A9·11 raised against a scrolling tab row and the same answer. At 834 three types fit on one row at their natural widths; ${b('a fourth wraps to a second row and is not compressed')} ⚑.`,
  darkNote: `Ground ${code('#211D17')} full bleed on the ${code('#171511')} page, hairlines ${code('#332E27')}, fields ${code('#171511')} — a step ${b('down')} from the ground they sit on ⚑. The selected radio takes ${code('#E0805A')} with a 7% accent wash, re-checked at 4.6:1 for its label; the unselected rows take the plain hairline.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A row of enquiry types above one form on a full-bleed surface ground. The choice sets the destination and the line beneath the row; the fields never change.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · surface · few · none · one radio row per enquiry')}<br><span style="color:#6B6459">Item-count ${code('few')} is the whole distinction from 4 Panel — same archetype, same containment, same ground. The types are the repeating unit; 4 has none.</span>`),
    K.specRow(3, 'Archetype', `form. ${b('Two departures')} — the section’s own padding is 0 and the ground carries it ⚑, and the type row stacks at ≤ 767 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} full-bleed surface, inside 96 × 72, three types on one row at natural width, note beneath, hairline, form 640. ${b('834')} inside 80 × 40, row holds, form 560. ${b('≤ 767')} inside 64 × 20, ${b('one type per row at full width')} ⚑, form 350, fields 48, field text 16, button full width.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('enquiries[]')} (2–4) with ${code('label')} (req, ≤ 28) · ${code('address')} (req) · ${code('note')} (opt, ≤ 60) — plus the form’s fields and strings. ${code('socials[]')}, the contact rows and ${code('locations[]')} are stored and not drawn ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Ground padding ${b('Compact · Comfortable · Spacious')} — Fields (the four-value set) — Type row ${b('Flush left · Centred · Full width')} — Message height ${b('Short · Medium · Tall')} — Ground ${b('Surface · Page')} — The line beneath ${b('Show · Hide')}. Then the enquiry repeater and the delivery group.`),
    K.specRow(7, 'Data', `Nothing from Ghost. ${code('enquiries[]')} at ${b('0 or 1')} → the row is not drawn and the form posts to the delivery group’s single destination, ${b('which is 2 Centred and the panel names it')} ⚑. ${b('2–4')} is the design. ${b('5 or more')} → the field refuses a fifth and names 13 Directory ⚑, which is the design for a long list of addresses.`),
    K.specRow(8, 'Empty state', `A type with no note → the line beneath is empty for that type and ${b('the space is not reserved')} ⚑; choosing a type with a note grows the block by 21 px, which is the one reflow this design allows and it is stated. A type with no address falls back to the delivery group’s destination ⚑.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe — ${b('and nothing for the radio row, which needs none')} ⚑. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING} ${b('The type row is fully functional with no script at all')} ⚑: it is a fieldset of radios, and the checked one posts.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. The row is a ${code('&lt;fieldset&gt;')} with a visually-hidden ${code('&lt;legend&gt;What is it about?&lt;/legend&gt;')} ⚑ — arrow keys move between types, which is radio behaviour and is why this is not a tablist. ${b('The note beneath is the fieldset’s')} ${code('aria-describedby')} ${b('and an')} ${code('aria-live="polite"')} ${b('region')} ⚑, so the destination is announced when the choice changes. Selected label 4.6:1 on the wash; the 7% accent wash is decoration and the border carries the state ⚑. Whole row is the 46 px target.<br>${b('Repeating items')} — ${code('enquiries[]')}: Add seeded and landing last; Remove disabled at two ⚑; drag reorders and ${b('the first is selected on load')} ⚑; 2–4, drawn for three; zero renders no row.<br>${b('Flagged ⚑')} radios not tabs · accent twice · zero section padding · the stacked row at 390 · the per-type address overriding the delivery group · the unreserved note line · the registry gap.`)
  ]]
};

/* ── 12 · Boxed ────────────────────────────────────────────────────── */
const d12 = {
  n: 12, name: 'Boxed',
  rail: 'A16 CONTACT · DESIGN 12 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'The form inside a hairline box with no fill and no shadow, and the contact row beneath it on the page. The quietest way to give a form an edge.',
    'It is 3 Card without the card: the same containment argument answered with a rule instead of a plane, for a page whose other sections are already carrying fills.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · BOX 680 · HAIRLINE ONLY, NO FILL, NO SHADOW · DETAILS BENEATH',
  body(t, w) {
    const g = K.ground(t, 'page');
    const bw = w === 1440 ? 680 : w === 834 ? 640 : 350;
    const pad = w === 390 ? 22 : 40;
    const box = `<div style="width:${bw}px;border:1px solid ${g.border};border-radius:${g.r}px;padding:${pad}px;box-sizing:border-box">${K.formBlock(g, { fields: 3, message: 'Medium', stack: w === 390, narrow: true, buttonFull: w === 390 })}</div>`;
    const inner = `<div style="display:flex;flex-direction:column;align-items:${w === 390 ? 'stretch' : 'center'};gap:${w === 390 ? 28 : 40}px">
        ${K.headBlock(g, w, { align: w === 390 ? 'left' : 'center', measure: w === 390 ? 350 : 560, max: 720 })}${box}
        <div style="width:100%;border-top:1px solid ${g.border};padding-top:${w === 390 ? 26 : 32}px;display:flex;flex-direction:column;gap:${w === 390 ? 24 : 26}px">
          ${K.detailsBlock(g, w === 390 ? { max: 350 } : { row: true, colW: 240, gap: 32, max: 280, flex: '1 1 200px' })}
          ${K.socialRow(g, {})}</div></div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `${b('A hairline and nothing else')}: no fill, no shadow, and the fields inside the box taking the ${code('surface')} step rather than the box doing it ⚑ — which is what keeps the box legible when the field is the only lighter thing in it. ${b('The contact row sits beneath the box, outside it')} ⚑, under a rule that runs the full 1,296 while the box is 680: the box holds the ask, the row holds the alternatives, and the difference in width is what says which is which.`,
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    return `<div style="width:100%;border:1px solid ${g.border};border-radius:${g.r}px;padding:20px;box-sizing:border-box">${K.formBlock(g, { state: s, fields: 3, message: 'Short' })}</div>`;
  },
  tileMin: 320,
  statesNote: `The seven states inside the box. ${b('The box shrinks at sent with its form')} ⚑, exactly as 3 Card does. ${b('The failed banner sits inside the box')}, which is the one state where two hairline rectangles are nested — the banner takes the ${code('text')} border at full strength so the two do not read as the same edge ⚑.`,
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED DELIVERY GROUP + THE SOCIAL REPEATER',
    name: 'Boxed', n: 12, sub: 'The form in a hairline box.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 outside the box.'),
      K.sel('Fields', 'Name, email, message', 'The category’s four-value set.'),
      K.seg('Box width', ['Narrow', 'Medium', 'Wide'], 1, `560 · 680 · 1,296. ${b('At Wide the box is the content box and the fields inside stay 640')} ⚑ — the box gets wider, the form does not.`),
      K.sel('Contact row', 'Under the box', `Under the box · Inside the box · Off. ${b('Inside puts the four rows above the fields, under the box’s own hairline')} ⚑, which is 4 Panel drawn without a fill and the panel says so.`),
      K.seg('Message height', ['Short', 'Medium', 'Tall'], 1, '3 · 5 · 8 lines.'),
      K.seg('Social', ['Glyphs', 'Labels', 'Off'], 0, 'A3·1’s values. The row sits with the contact row, wherever that is ⚑.'),
      K.repeater({ label: 'Socials', items: ['Instagram · @orbitweekly', 'X · @orbitweekly', 'Mastodon · @orbit@social.lisboa', 'LinkedIn · Orbit Weekly'], add: '+ Add platform', help: 'A3’s list, verbatim; six the ceiling; drag to reorder.' })
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: a fill value — ${b('a box with a fill is 3 Card')} ⚑ and the picker is where you get one; a border-weight value, because the design system says hairlines and never heavy borders; a radius value, which comes from the pack token.`,
      `${b('Box width: Wide does not widen the form')} ⚑. 1,296 of box with 640 of fields is deliberate: the box is a frame around the ask, and a 1,296 px text field is a field nobody can read the start and end of at once.`,
      `${b('Nothing here is per-item')} — the contact rows are four fixed fields and the socials have one size and one order.`
    ]
  },
  tabletLabel: '834 · box 640, contact row two-across',
  mobileLabel: '390 · box 350, inside 22, details stacked',
  respCap: 'TABLET 834 · BOX 640 · MOBILE 390 · BOX FULL MEASURE, INSIDE 22',
  respNote: `form’s ladder. ${b('The box takes the full 350 measure at 390 with 22 px inside')} ⚑ — the same call 3 Card makes and for the same reason: a box margin inside a page margin leaves the fields at 306. ${b('The rule above the contact row runs the box’s width at 390, not the content box’s')} ⚑, because at that width they are the same thing and a rule wider than everything above it has nothing to align to. Box 680 → 640 → 350; inside 40 → 40 → 22.`,
  darkNote: `${b('The box is a')} ${code('#332E27')} ${b('hairline on the')} ${code('#171511')} ${b('ground and has no fill in either mode')} ⚑ — this design does not change shape in dark at all, which is what makes it the quiet one. The fields inside go to ${code('#211D17')}, a step ${b('up')} from the ground in dark and a step ${b('down')} in light: the same rule read both ways.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The form inside a hairline box with no fill and no shadow, with the contact row and socials beneath it on the page under a full-width rule.'),
    K.specRow(2, 'Structural descriptor', `${code('form · box · page · none · none · the ask in a hairline box')}<br><span style="color:#6B6459">Containment ${code('box')} is the whole distinction from 2 Centred (${code('none')}) and 3 Card (${code('card')}): same archetype, same ground, three containments and three designs.</span>`),
    K.specRow(3, 'Archetype', 'form. No departures.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} head centred on 720, box 680 with 40 inside, rule at 1,296, contact row four-across, socials as glyphs, padding 96. ${b('834')} box 640, contact row two-across, padding 80. ${b('≤ 767')} head flush left ⚑, box 350 with 22 inside, contact rows stacked, fields 48, field text 16, button full width, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Split — head, the five field labels, the placeholder set, the form strings, the four contact rows, ${code('socials[]')}. ${code('locations[]')} and ${code('enquiries[]')} are stored and not drawn ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Fields (the four-value set) — Box width ${b('Narrow 560 · Medium 680 · Wide 1,296')} — Contact row ${b('Under the box · Inside the box · Off')} — Message height ${b('Short · Medium · Tall')} — Social ${b('Glyphs · Labels · Off')}. Then the socials repeater and the delivery group.`),
    K.specRow(7, 'Data', `Nothing from Ghost. Contact rows: ${b('0')} → the row and its rule go and the box stands alone, which is 3 Card without a fill ⚑; ${b('1')} → one block at the left, not stretched; ${b('4')} is the ceiling. Socials 0–6 as everywhere.`),
    K.specRow(8, 'Empty state', `${b('Head centred over an empty page below the box is the state to watch')} ⚑ — with the contact rows empty and socials off, the section is head plus box, and it holds: 96 + head + 40 + box. Nothing is substituted for what is missing.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}; the contact row a ${code('&lt;dl&gt;')} ⚑. ${b('The box takes no role and no label')} — it is a border. Box hairline 1.4:1, which is decoration; ${b('the field borders inside it are the ones held to 3:1')} ⚑ and they clear it. The nested failed banner takes ${code('role="alert"')} and focus moves to it ⚑. Rest as 1 Split.<br>${b('Repeating items')} — ${code('socials[]')} only: 0–6, drawn for 3–4.<br>${b('Flagged ⚑')} the fields carrying the surface step rather than the box · Wide not widening the form · the rule running the box width at 390 · the head going flush left at 390 · the nested banner’s full-strength border.`)
  ]]
};

/* ── 13 · Directory ────────────────────────────────────────────────── */
const d13 = {
  n: 13, name: 'Directory',
  rail: 'A16 CONTACT · DESIGN 13 OF 15 · PAPER PACK · FIVE CONTROLS · NO FORM, NO MODULE',
  paras: [
    'One row per address: what it is, what to use it for, and where it goes. A table, ruled, on the page ground.',
    'It is the design for a publication where different letters go to different desks — press, advertising, rights, corrections — and the honest answer to a reader’s question is a list rather than a box that routes invisibly.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FOUR ROWS · 220 · NOTE · 320 · RULED EVERY ROW',
  body(t, w) {
    const g = K.ground(t, 'page');
    const inner = w === 390
      ? `<div style="display:flex;flex-direction:column;gap:32px">${K.headBlock(g, w, { measure: 350, max: 350, headingText: 'Who to write to' })}
          <div style="display:flex;flex-direction:column">${K.ENQUIRIES.map((e, i) => `<div style="display:flex;flex-direction:column;gap:6px;padding:18px 0;border-top:1px solid ${g.border};${i === K.ENQUIRIES.length - 1 ? `border-bottom:1px solid ${g.border};` : ''}">
            <span style="font-family:${g.pack.head};font-size:19px;font-weight:700;color:${g.text};line-height:1.25">${e.label}</span>
            <span style="font-size:15px;line-height:1.55;color:${g.muted};font-family:${g.pack.body}">${e.note}</span>
            <span style="font-size:15px;color:${g.text};font-family:${g.pack.body};text-decoration:underline;text-underline-offset:3px;min-height:32px;display:inline-flex;align-items:center">${e.address}</span></div>`).join('')}</div></div>`
      : `<div style="display:flex;flex-direction:column;gap:${w === 834 ? 36 : 44}px">${K.headBlock(g, w, { measure: 560, max: 720, headingText: 'Who to write to' })}
          ${K.enquiryTable(g, { labelW: w === 1440 ? 220 : 150, addrW: w === 1440 ? 320 : 260, size: w === 1440 ? 19 : 17, rowPad: w === 1440 ? 20 : 16 })}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A9·15’s ledger read as a table: a 12 px tracked header row, then one row per address on a hairline. ${b('The label column is 220, the address column is 320, and the note takes what is left')} ⚑ — 736 at 1440 — because the note is the only column whose length the publication controls. ${b('Every address is a real')} ${code('mailto:')} ${b('link carrying its own text')} ⚑, so the table prints and copies correctly, which a routing form does not.`,
  states: ['four', 'two', 'nonote', 'one', 'long', 'ends'],
  stateLabels: {
    four: 'FOUR ROWS · what the table is drawn for',
    two: 'TWO ROWS · the table holds; the panel names 11 ⚑',
    nonote: 'A ROW WITH NO NOTE · the cell is empty, the row keeps its height ⚑',
    one: 'ONE ROW · the header goes and it becomes a labelled pair ⚑',
    long: 'THE UGLY TEST · a 60-character note and a 34-character address',
    ends: 'RULES: HEAD AND FOOT ONLY · rows separated by space alone'
  },
  stateForm(t, s) {
    const g = K.ground(t, 'page');
    const E = K.ENQUIRIES;
    const LONG = [{ label: 'Corrections and complaints', note: 'Anything we published that is wrong, unfair, or out of date — with the URL.', address: 'corrections@orbitweekly.example.com' }, E[1]];
    const sets = { four: E, two: E.slice(0, 2), nonote: [E[0], { ...E[1], note: '' }, E[2]], one: [E[0]], long: LONG, ends: E.slice(0, 3) };
    const items = sets[s] || E;
    return `<div style="width:100%">${K.enquiryTable(g, { items, labelW: 120, addrW: 190, size: 15, rowPad: 12, head: s !== 'one', rules: s === 'ends' ? 'ends' : 'all' })}</div>`;
  },
  statesCap: 'THE ROW-COUNT STATES · THIS DESIGN HAS NO FORM, SO IT HAS NO FORM STATES ⚑',
  tileMin: 200,
  statesNote: `${b('This design draws no form')} ⚑, declares ${b('no behaviour module')}, and has no delivery group — every row is a link. ${b('At one row the header row is removed and the table becomes a labelled pair')} ⚑, because a table header above a single row is a heading for nothing; the panel names 9 Slim Bar as the design for one address. ${b('A row with no note keeps its height')} ⚑ — the columns are a grid and a short row would break the alignment that makes a table readable.`,
  controls: {
    cap: 'THE CONTROL PANEL · FIVE CONTROLS + THE ENQUIRY REPEATER · NO DELIVERY GROUP ⚑',
    name: 'Directory', n: 13, sub: 'One row per address.', count: 'FIVE CONTROLS · NO DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.seg('Columns', ['Label and address', 'With the note'], 1, `Two columns or three. ${b('At two the label takes 320 and the address the rest')} ⚑, and the notes are kept, not deleted.`),
      K.sel('Head', 'Flush left', 'Centred · Flush left · None.'),
      K.seg('Rules', ['Every row', 'Head and foot'], 0, 'Head and foot leaves the rows separated by space alone, which needs the taller row height ⚑ and the panel sets it.'),
      K.seg('Row height', ['Compact', 'Comfortable', 'Spacious'], 1, '14 · 20 · 28 above and below. A9·1’s row padding ladder, carried verbatim.'),
      K.repeater({ label: 'Addresses', items: ['Editorial · hello@…', 'Advertising · ads@…', 'Rights · rights@…', 'Press · press@…'], add: '+ Add address', help: `${b('The same')} ${code('enquiries[]')} ${b('list 11 draws as radios')} ⚑ — one list, two designs, so switching between them keeps every address. Add is seeded and lands last; ${b('1–12, drawn for 3–6')} ⚑; drag reorders and order is reading order.` })
    ],
    delivery: { none: true },
    settles: [
      `${b('Five controls and no delivery group.')} ⚑ Nothing here is submitted, so there is nothing to deliver — the form fields and all five delivery rows are kept on the section and return on switching.`,
      `${b('The list is')} ${code('enquiries[]')}, ${b('the same one 11 Enquiry Types draws as radios')} ⚑. That is the point of the shared field list: a publication that outgrows a three-way chooser switches to this design and its addresses are already here.`,
      `${b('Cut:')} an alignment value per column (the label is left, the address is left, and a right-aligned address column in a three-column table leaves a river down the middle), a sort value — ${b('authored order is the order')} ⚑ — and a “copy address” action, which is ${code('share')}’s territory and a table of ${code('mailto:')} links does not need it.`
    ]
  },
  tabletLabel: '834 · three columns hold, 150 · note · 260',
  mobileLabel: '390 · each row becomes a stacked block ⚑',
  respCap: 'TABLET 834 · THE TABLE HOLDS · MOBILE 390 · ROWS BECOME STACKED BLOCKS',
  respNote: `table’s ladder with ${b('one departure')}: ${b('at ≤ 767 the table stops being a table')} ⚑ and each row becomes a stacked block — label at 19, note beneath at 15, address beneath that as a 32 px link — separated by the same hairlines. A three-column table at 350 px gives the note 90 px and that is four words a line. ${b('The header row goes at 390')} ⚑, because with the columns stacked it has nothing to label. At 834 the table holds with the label column at 150 and the address at 260.`,
  darkNote: `Hairlines ${code('#332E27')}, labels ${code('#F2EDE4')}, notes ${code('#A79E8F')}, addresses ${code('#F2EDE4')} underlined. ${b('No fill in either mode')} — like 12 Boxed this design is rules and type, so dark changes token values and no geometry.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'One ruled row per address — what it is, what to use it for, where it goes — as a three-column table on the page ground. No form.'),
    K.specRow(2, 'Structural descriptor', `${code('table · none · page · many · none · one row per enquiry address')}<br><span style="color:#6B6459">Archetype ${code('table')} is the category’s only one. Item-count ${code('many')}: the layout is built for five or more rows and holds down to two.</span>`),
    K.specRow(3, 'Archetype', `table. ${b('One departure')} — at ≤ 767 the rows become stacked blocks and the header row is removed ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} header row at 12 px tracked; rows 220 · note · 320 with 20 above and below and a hairline under each; padding 96. ${b('834')} 150 · note · 260, row padding 16, padding 80. ${b('≤ 767')} ${b('stacked blocks, no header row')} ⚑, label 19, note 15, address a 32 px link, padding 64.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('enquiries[]')} (1–12) with ${code('label')} (req, ≤ 28) · ${code('note')} (opt, ≤ 60) · ${code('address')} (req) · ${code('columnLabels')} (opt — the three header strings, defaults “What it is”, “Use it for”, “Where it goes”) ⚑. Everything else in the category is stored and not drawn ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Columns ${b('Label and address · With the note')} — Head ${b('Centred · Flush left · None')} — Rules ${b('Every row · Head and foot')} — Row height ${b('Compact · Comfortable · Spacious')}. Then the enquiry repeater. ${b('No delivery group')} ⚑.`),
    K.specRow(7, 'Data', `Nothing from Ghost — ${b('Ghost exposes no author emails to a theme')} ⚑, so this table cannot be generated from the site’s users and every row is authored. That is a finding. ${b('0')} → the section does not render ⚑. ${b('1')} → header removed, a labelled pair, 9 Slim Bar named. ${b('2')} → the table holds and 11 Enquiry Types is named. ${b('3–12')} is the design.`),
    K.specRow(8, 'Empty state', `A row with no note → the cell is empty and ${b('the row keeps its height')} ⚑. At Columns: Label and address the notes are kept and not drawn ⚑. No head → the header row starts the section.`),
    K.specRow(9, 'Behaviour module', `${b('none.')} ⚑ A table of ${code('mailto:')} links. Nothing to degrade — and notably, ${b('this is the design that works when the reader has no mail client and no JavaScript and the form service is down')}, which is why the panel offers it as the fallback A16 always has.`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('A real')} ${code('&lt;table&gt;')} ${b('with')} ${code('&lt;th scope="col"&gt;')} ⚑ — this is tabular data and the one place in A16 where that is true. At ≤ 767 ${b('the same table is restyled with CSS, not rebuilt')} ⚑; the header cells become visually hidden and stay in the accessibility tree. Addresses carry their own text. Header 5.4:1, labels 13.4:1, notes 5.4:1.<br>${b('Repeating items')} — ${code('enquiries[]')}: shared with 11 ⚑. Add seeded, lands last; Remove on the row, never disabled — this design supports one; drag reorders; 1–12, drawn for 3–6; zero does not render.<br>${b('Flagged ⚑')} sharing 11’s list · the 390 restyle · header removed at one row and at 390 · notes kept at two columns · Ghost exposing no author emails.`)
  ]]
};

/* ── 14 · Reasons ──────────────────────────────────────────────────── */
const d14 = {
  n: 14, name: 'Reasons',
  rail: 'A16 CONTACT · DESIGN 14 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'The head and form in a standing left column with one to three authored lines in the column beside them: what happens after a reader presses send.',
    'It is 1 Split with the contact block replaced by promises. A6·11’s reasons list, carried verbatim — the same field, the same repeater, the same three-line ceiling.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FORM 640 LEFT · THREE REASONS IN A 480 COLUMN RIGHT',
  body(t, w) {
    const g = K.ground(t, 'page');
    const reasons = (num) => `<div style="display:flex;flex-direction:column;gap:0">${K.REASONS.slice(0, num || 3).map((r, i) => `<div style="display:flex;gap:16px;align-items:baseline;padding:${w === 390 ? 16 : 20}px 0;border-top:1px solid ${g.border};${i === 2 ? `border-bottom:1px solid ${g.border};` : ''}">
        <span style="font-family:${MONOF};font-size:12px;color:${g.muted};flex-shrink:0;width:18px">0${i + 1}</span>
        <span style="font-size:${w === 390 ? 16 : 17}px;line-height:1.5;color:${g.text};font-family:${g.pack.body};text-wrap:pretty">${r}</span></div>`).join('')}</div>`;
    const inner = w >= 1440
      ? `<div style="display:flex;gap:96px;align-items:flex-start">
          <div style="width:640px;display:flex;flex-direction:column;gap:36px">${K.headBlock(g, w, { measure: 560, max: 640 })}${K.formBlock(g, { fields: 3, message: 'Medium' })}</div>
          <div style="width:480px;padding-top:6px">${reasons(3)}</div></div>`
      : `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 32 : 44}px">
          ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560, max: 640 })}
          ${reasons(3)}
          ${K.formBlock(g, { fields: 3, message: 'Medium', stack: w === 390, narrow: true, buttonFull: w === 390 })}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A6·11’s ${code('reasons[]')} carried verbatim into A16: ${b('one to three lines, forty characters each, text only, and no icons')} ⚑. Here they are numbered and ruled, at 20 px above and below on a hairline, because three unadorned lines beside a form read as a caption unless something gives them structure. ${b('The column is 480 and the form is 640')} — the wider column is the one being acted in, which is the reverse of 1 Split and is the reason both exist.`,
  stateForm(t, s) { const g = K.ground(t, 'page'); return K.formBlock(g, { state: s, fields: 3, message: 'Short' }); },
  tileMin: 300,
  statesNote: `The same seven as 1 Split. ${b('The reasons column does not change state')} ⚑ and does not move when the form shrinks at sent — it is a separate column, and a promise that disappears the moment it is kept is a strange thing to draw. ${b('Below 1,081 the reasons sit above the form')} ⚑, so at sent the confirmation appears under them, which reads correctly: the promise, then the receipt.`,
  extraTiles: [{
    label: 'WHY THIS IS NOT AN FAQ, AND WHERE ONE GOES',
    body: [
      `${b('These are one-line promises, not questions')} ⚑ — forty characters, no answer body, no disclosure, no anchor.`,
      `${b('A16 does not draw a question list at any value')} ⚑. ${b('A9 FAQ owns questions')}, and a second question list in a second category would be the same content in two places with two sets of controls.`,
      `${b('The panel names A9 FAQ')} as the section to place above A16 when a publication wants to reduce the mail rather than promise about it ⚑.`
    ]
  }],
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE REASONS REPEATER + THE SHARED DELIVERY GROUP',
    name: 'Reasons', n: 14, sub: 'Promises beside the form.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.sel('Fields', 'Name, email, message', 'The category’s four-value set.'),
      K.seg('Reasons column', ['Right', 'Left'], 0, 'Which side the lines take. The form takes the other and keeps its 640 ⚑.'),
      K.seg('Reasons', ['Numbered', 'Ruled', 'Plain'], 0, `Numbered is 01 · 02 · 03 in the mono face at 12 px; Ruled drops the numbers and keeps the hairlines; Plain drops both and sets the lines 20 px apart. ${b('No icon value at any setting')} ⚑ — A6·11 refused icons and this does not reopen it.`),
      K.seg('Message height', ['Short', 'Medium', 'Tall'], 1, '3 · 5 · 8 lines.'),
      K.seg('Blurb', ['Show', 'Hide'], 0, 'Hide leaves the eyebrow and heading above the form; the field is kept ⚑.'),
      K.repeater({ label: 'Reasons', items: ['A person reads every message.', 'We answer within two working days.', 'Corrections are published, not buried.'], add: '+ Add reason', addOff: true, help: `${b('A6·11’s field and repeater, verbatim')} ⚑ — 1–3 lines, ≤ 40 characters each, text only. ${b('Add is disabled at three')} ⚑ with the reason shown, and ${b('never produces a blank line')}. Removing the last leaves the column empty and ${b('the panel names 1 Split')} ⚑.` })
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: a count value (${b('every authored reason is drawn')} ⚑, so the ceiling is the field’s, not a control’s), an icon value ⚑, and a column-width value — 640 · 96 · 480 is the division that keeps the form at the width every other A16 design gives it.`,
      `${b('Inside a reason the user edits one string')} ⚑ and nothing else: no per-line emphasis, no per-line number override, no “make this one bold”. The number is generated from the position, which is why reordering renumbers ⚑.`,
      `${b('At zero reasons this is 1 Split without a contact block')} — the panel names it rather than drawing an empty 480 px column ⚑.`
    ]
  },
  tabletLabel: '834 · one column ⚑ · reasons above the form',
  mobileLabel: '390 · reasons above, form beneath',
  respCap: 'TABLET 834 AND MOBILE 390 · ONE COLUMN, REASONS ABOVE THE FORM ⚑',
  respNote: `A16’s split rule: ${b('two columns need 1,081')} ⚑. Below it the order is ${b('head · reasons · form')} ⚑ — and this is the one two-column design in A16 that does ${b('not')} put its second column beneath the form, because a promise read after pressing send is not a promise. 7 Map Split is the other exception and for the same kind of reason. At 390 the numbered rows keep their rules and the lines go to 16 px.`,
  darkNote: `Hairlines ${code('#332E27')} above and below the reason rows; the numbers ${code('#A79E8F')} in the mono face; the lines ${code('#F2EDE4')}. ${b('No fill anywhere in either mode')} ⚑ — the rules do the work, which is what keeps this and 1 Split in the same visual family.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'Head and form in a standing 640 column with one to three authored lines numbered and ruled in a 480 column beside them. A6·11’s reasons list, carried verbatim.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · page · few · none · three reasons beside the form')}<br><span style="color:#6B6459">Item-count ${code('few')} is the whole distinction from 1 Split, which is ${code('none')} on the same four other slots — the reasons are the repeating unit and 1’s contact block is four fixed fields.</span>`),
    K.specRow(3, 'Archetype', `split. ${b('Two departures')} — it collapses at 1,080 ⚑, and ${b('the second column goes above the form, not below it')} ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} 640 · 96 · 480; head measure 560; reasons at 17 with 20 above and below on hairlines; padding 96. ${b('1080')} one column, ${b('reasons above the form')} ⚑. ${b('834')} padding 80, heading 34. ${b('≤ 767')} padding 64, heading 28, reasons 16 with 16 above and below, fields 48, field text 16, button full width.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('reasons[]')} (1–3, ≤ 40 characters each, text only) ⚑ · the form’s fields and strings. The contact rows, ${code('socials[]')}, ${code('locations[]')} and ${code('enquiries[]')} are stored and not drawn ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Fields (the four-value set) — Reasons column ${b('Right · Left')} — Reasons ${b('Numbered · Ruled · Plain')} — Message height ${b('Short · Medium · Tall')} — Blurb ${b('Show · Hide')}. Then the reasons repeater and the delivery group.`),
    K.specRow(7, 'Data', `Nothing from Ghost. ${code('reasons[]')} at ${b('0')} → the column is not drawn and the form takes 640 at the left with 656 empty, ${b('which the panel names as 1 Split')} ⚑. ${b('1')} → one row, ruled top and bottom, at the column’s top — ${b('a supported state, not a degraded one')} ⚑. ${b('2–3')} is the design; ${b('Add is disabled at three')} ⚑.`),
    K.specRow(8, 'Empty state', `As 2 Centred for the head. ${b('A reason cannot be empty')} — Add never produces a blank line and an emptied line is removed on blur with an undo ⚑, which is A6·11’s behaviour carried verbatim.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe. ${b('The reasons declare nothing')} — they are three lines of text. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('The reasons are an')} ${code('&lt;ol&gt;')} ${b('at Numbered and a')} ${code('&lt;ul&gt;')} ${b('at Ruled and Plain')} ⚑ — the numbers are meaningful order at one value and decoration at the others, and the markup says which. The generated numbers are ${code('::before')} content on the list marker, not typed text ⚑. ${b('Focus order below 1,081 is head, reasons, form')}, which matches the visual order because the DOM is reordered, not the flex ⚑. Numbers 5.4:1; lines 13.4:1.<br>${b('Repeating items')} — ${code('reasons[]')}: A6·11’s repeater verbatim. Add disabled at three ⚑, never blank, lands last; Remove on the row, never disabled, and removing the last empties the column; drag reorders and ${b('reordering renumbers')} ⚑; 1–3, drawn for three.<br>${b('Flagged ⚑')} carrying A6·11’s list rather than inventing one · reasons above the form below 1,081 · the 1,080 collapse · no icon value · reordering renumbering · A9 FAQ named for questions.`)
  ]]
};
const MONOF = "'JetBrains Mono',monospace";

/* ── 15 · Cover ────────────────────────────────────────────────────── */
const d15 = {
  n: 15, name: 'Cover',
  rail: 'A16 CONTACT · DESIGN 15 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'A full-bleed photograph under a warm scrim carrying a centred head and the form in white. The category’s one image moment.',
    'It is the design for a contact page that is also a picture of the newsroom. The accent is unavailable over an image, so the button takes white with the ink colour on it, which is A22·7’s call carried forward without change.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FULL-BLEED IMAGE 640 TALL · WARM SCRIM · FORM 560 CENTRED',
  body(t, w) {
    const g = K.ground(t, 'image'), gg = G(w);
    const h = w === 1440 ? 700 : w === 834 ? 660 : 720;
    const fw = w === 1440 ? 560 : w === 834 ? 520 : 350;
    const inner = `<div style="position:relative;width:${w}px;height:${h}px;background:${t.stripe};overflow:hidden;box-sizing:border-box">
        <span style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(35,32,25,.34) 0%, rgba(35,32,25,.58) 55%, rgba(35,32,25,.72) 100%)"></span>
        <span style="position:absolute;left:${gg.m}px;top:14px;font-family:${MONOF};font-size:10px;color:rgba(251,249,245,.72)">COVER PHOTOGRAPH · ≥ 2,400 PX · THE NEWSROOM, WIDE ⚑</span>
        <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${w === 390 ? 28 : 36}px;padding:0 ${gg.m}px;box-sizing:border-box">
          ${K.headBlock(g, w, { align: 'center', measure: w === 390 ? 350 : 520, max: 640, headingText: 'Come and find us' })}
          <div style="width:${fw}px">${K.formBlock(g, { fields: 2, message: 'Short', stack: w === 390, narrow: true, align: 'center', buttonFull: w === 390, consentMax: fw })}</div></div></div>`;
    return P.bleedWrap(t, w, inner, 'SECTION PADDING 0 AT EVERY WIDTH · THE IMAGE CARRIES IT ⚑');
  },
  primaryNote: `A20·13’s warm scrim, carried verbatim: a warm dark gradient strongest at the foot, ${b('never a heavy black one')}. Over it every colour is derived from ${code('#FBF9F5')} — text at full strength, muted at 80%, field fill at 14%, hairlines at 28%. ${b('The accent appears nowhere')} ⚑: the button is white carrying the ink colour, which is the same substitution 5 Contrast Band makes and for the same measured reason. ${b('The field set is fixed at two here')} ⚑ — email and message — because a five-field form over a photograph is a form with a photograph behind it, which is neither.`,
  stateForm(t, s) {
    const g = K.ground(t, 'image');
    return `<div style="position:relative;width:100%;background:${t.stripe};border-radius:8px;overflow:hidden;padding:20px;box-sizing:border-box">
      <span style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(35,32,25,.40) 0%, rgba(35,32,25,.64) 100%)"></span>
      <div style="position:relative">${K.formBlock(g, { state: s, fields: 2, message: 'Short' })}</div></div>`;
  },
  tileMin: 260, tileBg: '#F7F5F2',
  statesNote: `Every state re-derived over the image. ${b('Focus and invalid both take white, not the accent')} ⚑ — A22’s rule for ${code('image')} and ${code('contrast')} grounds, carried verbatim, and the difference between them is the border weight and the message beneath. ${b('The scrim deepens one step at focus')} ⚑ so the field’s 14% fill stays legible against whatever is behind it, and that is the only motion in this design.`,
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED DELIVERY GROUP',
    name: 'Cover', n: 15, sub: 'The form over a photograph.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Image height', ['Short', 'Medium', 'Tall'], 1, `560 · 700 · 840 at 1440; 660 at 834; 720 at 390 ⚑ — ${b('the phone value is taller than the tablet one')}, because a stacked form needs the room and a 560 px image on a phone is a band.`),
      K.sel('Fields', 'Email and message', `${b('Fixed at Email and message')} ⚑ — the four-value set is disabled here with the reason shown. Five fields over a photograph is not a design this section can hold.`),
      K.seg('Form position', ['Centred', 'Flush left'], 0, 'The head moves with it ⚑. Flush left takes the page margin, not the content box’s centre.'),
      K.seg('Scrim', ['Light', 'Medium', 'Heavy'], 1, `The warm scrim at three strengths. ${b('Light is disabled when the image is lighter than 60% mean luminance')} ⚑, with the measurement shown — white on a bright photograph under a light scrim is 2.1:1.`),
      K.seg('Message height', ['Short', 'Medium'], 0, `3 or 5 lines. ${b('No Tall value')} ⚑ — an 8-line box over an image is a hole in the picture.`),
      K.seg('Head', ['Show', 'Hide'], 0, 'Hide leaves the form alone over the image, and the form then takes the section’s accessible name from the site title ⚑.')
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: an accent value (${b('the accent is unavailable over an image')} ⚑ and the row would be permanently disabled), an image-focus value — ${b('that is a field, not a control')} ⚑, exactly as A22·7 settled it, because the right crop belongs to the picture and not to the layout — and a blur value, which is a filter, not a token.`,
      `${b('Fields is fixed and shown disabled rather than hidden')} ⚑, so a user switching from 1 Split can see that their subject and phone fields are kept and not drawn here, rather than wondering where they went.`,
      `${b('Scrim: Light disables itself against a bright image')} ⚑ and shows the measurement. That is §7·4 read literally: a value that would fail contrast is disabled with its ratio, never silently allowed.`
    ]
  },
  tabletLabel: '834 · image 660, form 520',
  mobileLabel: '390 · image 720 ⚑ — taller than tablet',
  respCap: 'TABLET 834 · IMAGE 660 · MOBILE 390 · IMAGE 720, THE ONE VALUE THAT GROWS AS THE SCREEN SHRINKS ⚑',
  respNote: `The image is full bleed at every width and the section has no padding of its own ⚑. ${b('The 390 image is taller than the 834 one')} ⚑ — 720 against 660 — which is the only measurement in A16 that goes up as the viewport goes down, and the reason is the stacked form: two fields at 48, a message at 96, a button at 48 and a consent line need 320 px of the image before the head is drawn. The head’s measure goes 520 → 520 → 350 and the heading 40 → 34 → 28.`,
  darkNote: `${b('White over an image stays white')} ⚑ and ${b('the scrim deepens one step in dark')} — A22’s rule, carried verbatim. The image itself is not swapped: a photograph is a photograph in both modes, and ${b('a dark-mode variant of it is a second image field this section does not have')} ⚑, which is stated rather than invented. The striped placeholder does switch, because it is a placeholder.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A full-bleed photograph under a warm scrim carrying a centred head and a two-field form in white. The category’s one image moment.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · image · none · background · the ask over a cover photograph')}<br><span style="color:#6B6459">Ground ${code('image')} and media ${code('background')} together are unique in A16; 7 Map Split is the only other design with media at all and its placement is ${code('left')}.</span>`),
    K.specRow(3, 'Archetype', `form. ${b('Two departures')} — the section’s own padding is 0 and the image carries it ⚑, and ${b('the mobile image is taller than the tablet one')} ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} image full bleed 700 tall, scrim Medium, head centred on 520, form 560, two fields at 46, message 96, padding 0. ${b('834')} image 660, form 520, heading 34. ${b('≤ 767')} ${b('image 720')} ⚑, form 350, fields 48 and stacked, field text 16, button full width, heading 28.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('image')} (${b('required')} — the design is the photograph) · ${code('imageAlt')} (opt, ≤ 120) · ${code('imageFocus')} (${b('Centre · Top · Bottom — a field, not a control')} ⚑) · the form’s email and message strings. ${b('Name, subject and phone are stored and never drawn')} ⚑, along with the contact rows, ${code('socials[]')}, ${code('locations[]')} and ${code('enquiries[]')}.`)
  ], [
    K.specRow(6, 'Controls', `Image height ${b('Short 560 · Medium 700 · Tall 840')} — Fields ${b('fixed at Email and message, shown disabled')} ⚑ — Form position ${b('Centred · Flush left')} — Scrim ${b('Light · Medium · Heavy')} (Light disabled against a bright image ⚑) — Message height ${b('Short · Medium')} — Head ${b('Show · Hide')}. Then the delivery group.`),
    K.specRow(7, 'Data', `Nothing from Ghost. No repeating unit. ${b('No image')} → A19’s vocabulary: ${b('Hand off')} ⚑ — the section renders as 2 Centred on the page ground and ${b('the sidebar says which design is on the page and why')} ⚑, because a cover design with no cover is not a degraded cover, it is a different section.`),
    K.specRow(8, 'Empty state', `No eyebrow or blurb → each absent. ${b('Head: Hide')} → the form alone over the image, centred, and the ${code('&lt;form&gt;')} takes ${code('aria-label="Contact Orbit Weekly"')} ⚑. ${b('No')} ${code('imageAlt')} → the image is decorative and takes ${code('alt=""')} ⚑, because the head above it already says what the section is.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe. ${b('The scrim’s one-step deepening at focus is CSS')} ⚑ and respects reduced-motion by holding the deeper value rather than transitioning to it. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('Derived contrasts, measured under Medium scrim on the darkest quarter of the image')}: heading 12.1:1, blurb 8.4:1, placeholder 4.8:1, button label 12.6:1, field border 3.2:1 ⚑. ${b('The accent is refused over an image at every scrim value')} ⚑. Focus takes a 1.5 px white border and the scrim deepens; the button keeps the library ring in white. ${b('Text is never placed over the top quarter of the image')} ⚑, where the scrim is weakest.<br>${b('Repeating items')} — none drawn; all four lists kept.<br>${b('Flagged ⚑')} zero section padding · the taller mobile image · Fields fixed and shown disabled · Scrim: Light self-disabling · ${code('imageFocus')} as a field · Hand off with no image · no dark-mode image variant · the top-quarter rule.`)
  ]]
};

return [d11, d12, d13, d14, d15];
})();
