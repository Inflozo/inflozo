// A16 designs 1–5.
globalThis.A16D1 = (function () {
const K = globalThis.A16LIB, P = globalThis.A16PAGE;
const { b, code, gap } = K;
const G = K.G;

const SPLIT_MIN = `<strong style="font-weight:600">Two columns need 1,081</strong> ⚑ — a form column below 480 px is a form nobody finishes, and 754 cannot hold 480 + a gutter + a details column. So A16's splits collapse one breakpoint earlier than the archetype's ladder.`;

/* ── 1 · Split ─────────────────────────────────────────────────────── */
const d1 = {
  n: 1, name: 'Split',
  rail: 'A16 CONTACT · DESIGN 1 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'The head and the publication’s own details standing in a 560 column at the left, the form in a 640 column at the right, on a 96 px gutter. The category default and the arrangement five other designs resolve to.',
    'It is the design for a contact page that has both things to say and something to ask: an address, a phone number and reply hours on one side, and the form on the other. Nothing is raised, boxed or photographed.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · 560 · 96 · 640 = 1,296 · FORM COLUMN 640 · THREE FIELDS',
  body(t, w) {
    const g = K.ground(t, 'page');
    const inner = w >= 1440
      ? `<div style="display:flex;gap:96px;align-items:flex-start">
          <div style="width:560px;display:flex;flex-direction:column;gap:36px">
            ${K.headBlock(g, w, { measure: 520, max: 560 })}
            ${K.detailsBlock(g, { max: 460 })}
            ${K.socialRow(g, {})}
          </div>
          <div style="width:640px">${K.formBlock(g, { fields: 3, message: 'Medium' })}</div>
        </div>`
      : `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 40 : 48}px">
          ${K.headBlock(g, w, { measure: w === 390 ? 350 : 560, max: w === 390 ? 350 : 640 })}
          ${K.formBlock(g, { fields: 3, message: 'Medium', stack: w === 390, narrow: true, buttonFull: w === 390 })}
          <div style="display:flex;flex-direction:column;gap:28px;border-top:1px solid ${g.border};padding-top:${w === 390 ? 28 : 32}px">
            ${K.detailsBlock(g, w === 390 ? { max: 350 } : { row: true, colW: 220, gap: 40, max: 300 })}
            ${K.socialRow(g, {})}
          </div>
        </div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A9·5's two-column split with A3·10's contact block carried verbatim into the left column and A16's form in the right. ${b('560 · 96 · 640')} is the only division of 1,296 that leaves the form the 640 it needs and the details a 460 measure they read well at. ${SPLIT_MIN} ${b('The form column sits at the right in the default')} because the details are the thing a reader scans first and the form is the thing they act on second.`,
  stateForm(t, s) { const g = K.ground(t, 'page'); return K.formBlock(g, { state: s, fields: 3, message: 'Short' }); },
  tileMin: 300,
  statesNote: `The state tiles draw the form at ${b('Message: Short')} so all seven fit on one row of the canvas; ${b('the field set is the design’s own three')} ⚑. ${b('Invalid puts its message under the field it belongs to')}, never in one banner at the top ⚑ — a reader who mistyped an address should not have to hunt for which line is wrong. ${b('Sent shrinks the section')} and A16 lets it ⚑: a three-field form is 340 px and its confirmation is 96, and reserving 244 px of empty space on every page that never sends costs more than the reflow does. ${b('Failed keeps everything typed')} ⚑.`,
  extraTiles: [{
    label: 'WHAT THE SPLIT DOES THAT THE OTHERS DO NOT',
    body: [
      `${b('Both columns are left-aligned, always')} ⚑ — there is no alignment control, because a centred head over a left-aligned form is two alignments in one section.`,
      `${b('The details column keeps its width when the form is in any state')} ⚑, including sent: the left column is not part of the form and does not move when the form does.`,
      `${b('Socials sit under the details, not under the form')} ⚑ — they are another way to reach the publication, which is what that column is.`
    ]
  }],
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED DELIVERY GROUP + THE SOCIAL REPEATER',
    name: 'Split', n: 1, sub: 'Details left, form right.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.sel('Fields', 'Name, email, message', `Email and message · Name, email, message · Name, email, subject, message · Name, email, phone, subject, message. ${b('Four values, never a field builder')} ⚑ — a per-field editor is a different product. ${b('Email and message are required at every value')} ⚑.`),
      K.seg('Details column', ['Left', 'Right'], 0, 'Which side the head and the contact block take. The form takes the other.'),
      K.seg('Message height', ['Short', 'Medium', 'Tall'], 1, '3 · 5 · 8 lines — 96 · 144 · 216 px. The only field whose height is a control ⚑.'),
      K.seg('Social', ['Glyphs', 'Labels', 'Off'], 0, `A3·1’s values, carried verbatim. Glyphs are 44 px boxes; Labels are the platform names as links.`),
      K.sel('Contact block', 'All four rows', `All four rows · Email and replies · Off. ${b('The order is fixed')} ⚑ — post, email, phone, replies — which is A3·10’s call and the reason the block is not a repeater.`),
      K.repeater({ label: 'Socials', items: ['Instagram · @orbitweekly', 'X · @orbitweekly', 'Mastodon · @orbit@social.lisboa', 'LinkedIn · Orbit Weekly'], add: '+ Add platform', help: `A3’s list, verbatim. ${b('Add opens the platform picker, never a blank row')} ⚑, and lands last. Six is the ceiling ⚑. Drag to reorder — authored order is drawn order.` })
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: an alignment value (both columns are left-aligned, always ⚑), a column-width value (560 · 96 · 640 is the only division of 1,296 that fits a form), a button-width value (auto above 1,080 and full width below, which is the responsive rule and not a choice ⚑), and a labels value — ${b('this design always draws its labels above the fields')} ⚑, because it has the width for them.`,
      `${b('Nothing here is per-item.')} Every control writes a single value onto the section and the stylesheet reads it, so no social entry and no contact row can be styled on its own ⚑. Inside a social entry the user edits the platform and the URL and nothing else.`,
      `${b('Where the message goes')} is the delivery group below, and it is the same five rows in all ten designs that draw a form. ${b('Ghost cannot receive it')} ⚑ — that is settlement 3, and it is the reason the default destination is an email address rather than an endpoint.`
    ]
  },
  tabletLabel: '834 · one column · form, then details ⚑',
  mobileLabel: '390 · one column · fields 48 px, text 16',
  respCap: 'TABLET 834 · THE SPLIT IS ALREADY GONE ⚑ · MOBILE 390 · STACKED FIELDS, FULL-WIDTH BUTTON',
  respNote: `${SPLIT_MIN} So this design’s ladder has ${b('one departure from split')}: it collapses at ${b('1,080')}, not 767 ⚑. Below that the order is ${b('head · form · rule · details · socials')} ⚑ — the form above the details, because a reader who came to write should not scroll past an address to find the box. At 390 fields go full width at 48 px, ${b('field text 15 → 16 px so iOS does not zoom the page on focus')} ⚑ (A22’s rule, carried verbatim), and the button goes full width.`,
  darkNote: `Ground ${code('#171511')}, fields ${code('#211D17')} — ${b('the field is always a step away from the plane it sits on')} ⚑, lighter in light and darker in dark, which is A22’s finding carried over. Hairlines ${code('#332E27')}; the accent re-checked at ${code('#E0805A')} on the button. Nothing is raised in either mode, so dark changes token values and nothing else.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The head and the publication’s own contact details in a 560 column at the left, the form in a 640 column at the right on a 96 px gutter. The category default; nothing is raised, boxed or photographed.'),
    K.specRow(2, 'Structural descriptor', `${code('split · none · page · none · none · form beside the details column')}<br><span style="color:#6B6459">Containment ${code('none')} — the section sits in nothing. Item-count ${code('none')}: the socials are a row inside the details column, not the section’s repeating unit, and 14 Reasons is the ${code('few')} on this ground.</span>`),
    K.specRow(3, 'Archetype', `split. ${b('One departure')} — it collapses at 1,080 rather than 767 ⚑, because two columns cannot hold a 480 px form at 834.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} content 1,296 on a 72 margin; 560 · 96 · 640; head measure 520, details 460, form fields full-width in their column, name and phone paired only at Fields: five; padding 96. ${b('1080')} one column, ${b('form then details')} ⚑, details as a wrapping row of 220 px blocks. ${b('834')} the same one column, padding 80, heading 34. ${b('≤ 767')} padding 64, heading 28, fields 48 px, field text 16 ⚑, button full width, details as a stack.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · ${code('nameLabel')}…${code('messageLabel')} (the five field labels) · ${code('placeholder')} set · ${code('buttonLabel')} · ${code('consentText')} · ${code('sentHeading')} · ${code('sentText')} · ${code('invalidText')} · ${code('failedText')} · the four contact rows (${code('postal')}, ${code('email')}, ${code('phone')}, ${code('replyHours')}) · ${code('socials[]')}. From Ghost: nothing but the site title, used as the form’s ${code('aria-label')} where no heading is drawn.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Fields ${b('Email and message · Name, email, message · Name, email, subject, message · Name, email, phone, subject, message')} — Details column ${b('Left · Right')} — Message height ${b('Short · Medium · Tall')} — Social ${b('Glyphs · Labels · Off')} — Contact block ${b('All four rows · Email and replies · Off')}. Then the socials repeater, then the delivery group.`),
    K.specRow(7, 'Data', `Nothing is read from Ghost. ${b('0 socials')} → the row and its gap are removed ⚑. ${b('1')} → one 44 px box, not stretched. ${b('many')} → wraps at six, which is the ceiling. ${b('All four contact rows empty')} → the block and its gap are removed and the left column is head and socials alone ⚑; if socials are also off, the left column keeps its 560 and the head sits in it, which is a legitimate section.`),
    K.specRow(8, 'Empty state', `No eyebrow, blurb or contact row → each absent, the column closing up ⚑. ${b('No heading is allowed')}; the ${code('&lt;form&gt;')} then takes ${code('aria-label="Contact Orbit Weekly"')}. Placeholders and the button label fall back to their defaults rather than rendering empty ⚑. ${b('Nothing is substituted for what is missing')} — A3’s empty-data floor, carried verbatim.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe — the form does not post while the section is being edited and the seven states are drawn rather than triggered. ${b('Flagged ⚑: the registry has no contact-form module')} and this is the closest. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')} ⚑ — A16 is not the route’s head; the page’s ${code('h1')} is the page title above it. Every field has a real ${code('&lt;label&gt;')} drawn above it, ${code('autocomplete')} on name, email and phone, ${code('required')} on email and message. ${b('On submit the first invalid field takes focus')} ⚑ and its message is its ${code('aria-describedby')}. ${b('The library’s 4 px accent ring is suppressed on fields')} ⚑ (A2·5’s departure) — 1.5 px accent border instead; the button keeps the ring. Light: heading 13.4:1, labels 13.4:1, placeholder 5.1:1, button label 4.6:1; dark 8.1:1.<br>${b('Repeating items')} — ${code('socials[]')} only: Add opens the platform picker and lands last, Remove is on the row and undoable, drag reorders, 0–6, designed for 3–4, zero removes the row and its gap.<br>${b('Flagged ⚑')} the 1,080 collapse · form-before-details below it · the fixed contact-block order · sent shrinking the section · no alignment control · the ${code('member-form')} declaration.`)
  ]]
};

/* ── 2 · Centred ───────────────────────────────────────────────────── */
const d2 = {
  n: 2, name: 'Centred',
  rail: 'A16 CONTACT · DESIGN 2 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'A centred eyebrow, heading and blurb on a 720 measure with the form beneath on a 560 one, and no contact details at all. The smallest complete form in the category.',
    'It is the design for a page whose only job is the form — a dedicated contact route, or a tips page — where an address and a phone number would be two more things to read before the box.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · HEAD CENTRED ON 720 · FORM 560 · LABELS ABOVE · THREE FIELDS',
  body(t, w) {
    const g = K.ground(t, 'page');
    const fw = w === 1440 ? 560 : w === 834 ? 520 : 350;
    const inner = `<div style="display:flex;flex-direction:column;align-items:center;gap:${w === 390 ? 32 : 44}px">
        ${K.headBlock(g, w, { align: 'center', measure: w === 390 ? 350 : 560, max: 720 })}
        <div style="width:${fw}px">${K.formBlock(g, { fields: 3, message: 'Medium', stack: w === 390, narrow: true, align: 'center', buttonFull: w === 390, consentMax: fw })}</div>
      </div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A22·1’s centred head over A16’s form. ${b('The head is centred and the form is not')} ⚑ — labels sit at the left of their fields at every value, because a centred label above a full-width field points at nothing. ${b('The button and the consent line are centred as a unit under the form')} ⚑, which is A22’s centred-row rule carried over. ${b('This design draws no contact details at any value')} ⚑; the sidebar names 1 Split as the design that does, so the fields are kept rather than lost.`,
  stateForm(t, s) { const g = K.ground(t, 'page'); return K.formBlock(g, { state: s, fields: 3, message: 'Short', align: 'center' }); },
  tileMin: 300,
  statesNote: `Identical to 1 Split’s seven, with the button and consent centred. ${b('Sent is centred too')} and reads at 24 px in the heading font. ${b('No destination is an editor-only state')} ⚑ in every design: the published page never draws that notice — it falls back to a ${code('mailto:')} on the site’s own address, so a half-configured section still works for a reader.`,
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED DELIVERY GROUP',
    name: 'Centred', n: 2, sub: 'Head centred, form beneath.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, '64 · 96 · 132 at 1440; 80 at 834; 64 at 390.'),
      K.sel('Fields', 'Name, email, message', `The category’s four-value set. ${b('At Email and message the form is 2 fields and 246 px')} ⚑ — the shortest A16 draws.`),
      K.seg('Labels', ['Above', 'Hidden'], 0, `Above draws a 13 px label over each field. ${b('Hidden keeps a visually-hidden label')} ⚑ and leans on the placeholder — offered because designers ask for it, and it never removes the label from the accessibility tree.`),
      K.seg('Form width', ['Narrow', 'Medium', 'Wide'], 1, '480 · 560 · 640. The head stays on 720 at all three ⚑ — the measure of a sentence and the measure of a field are different problems.'),
      K.seg('Message height', ['Short', 'Medium', 'Tall'], 1, '3 · 5 · 8 lines — 96 · 144 · 216 px.'),
      K.seg('Blurb', ['Show', 'Hide'], 0, 'Hide leaves the eyebrow and heading; the field is kept ⚑.')
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: an alignment value — ${b('this design is the centred one')} ⚑ and 1 Split is the flush-left one, so a control that turned one into the other would make two designs one; a details value, because the design draws none; a depth value, because nothing here is raised.`,
      `${b('Labels: Hidden is the only control in A16 that trades legibility for looks')} ⚑, and it is drawn here rather than everywhere: the other nine form designs always draw their labels. The panel says what it costs.`,
      `${b('The contact fields are kept and never drawn')} ⚑. Switching to 1 Split, 4 Panel or 12 Boxed brings them straight back — that is what the shared field list is for.`
    ]
  },
  tabletLabel: '834 · form 520, head measure 560',
  mobileLabel: '390 · fields 48 px, button full width',
  respCap: 'TABLET 834 · A SIMPLE NARROWING · MOBILE 390 · STACKED',
  respNote: `${b('The arrangement does not change at any width')} — it is one centred column throughout, so this is the one design in A16 where 834 is a simple narrowing and nothing else. Head 40 → 34 → 28; form 560 → 520 → 350; padding 96 → 80 → 64; fields 46 → 46 → 48 with the text going to 16 px at 390 ⚑.`,
  darkNote: `The field is a step away from its ground in both modes ⚑: ${code('#FFFFFF')} on ${code('#FBF9F5')} in light, ${code('#211D17')} on ${code('#171511')} in dark. Labels take ${code('text')} in both, not ${code('text-muted')} — a field label is not meta ⚑.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A centred head on a 720 measure with the form beneath on 560, and no contact details at any value. The smallest complete form in A16.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · page · none · none · one centred form, no details')}<br><span style="color:#6B6459">Ground ${code('page')} and containment ${code('none')}: this is 3 Card without the card and 12 Boxed without the box, and those two slots are what say so.</span>`),
    K.specRow(3, 'Archetype', 'form. No departures — one column at every width.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} head centred on 720, blurb clamped 560, form 560, fields 46, message 144, padding 96. ${b('834')} heading 34, form 520, padding 80. ${b('≤ 767')} heading 28, form 350, fields 48 and stacked, field text 16 ⚑, button full width, padding 64.`),
    K.specRow(5, 'Content fields', `${code('eyebrow')} · ${code('heading')} · ${code('blurb')} · the five field labels · the placeholder set · ${code('buttonLabel')} · ${code('consentText')} · ${code('sentHeading')} · ${code('sentText')} · ${code('invalidText')} · ${code('failedText')}. ${b('The contact rows and')} ${code('socials[]')} ${b('are stored and never drawn')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Fields (the four-value set) — Labels ${b('Above · Hidden')} — Form width ${b('Narrow 480 · Medium 560 · Wide 640')} — Message height ${b('Short · Medium · Tall')} — Blurb ${b('Show · Hide')}. Then the delivery group.`),
    K.specRow(7, 'Data', `Nothing is read from Ghost. There is no repeating unit, so 0, 1 and many do not arise ⚑ — the counts that matter here are the field count, which is a control, and the character counts on the authored strings.`),
    K.specRow(8, 'Empty state', `No eyebrow → absent, the block closing up. No blurb → the same, and Blurb: Hide is the same result reached deliberately. ${b('No heading')} → the form takes ${code('aria-label="Contact Orbit Weekly"')} from the site title ⚑. All three empty → the form alone, centred, which is a legitimate section and the floor of this design at 246 px.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('At Labels: Hidden the')} ${code('&lt;label&gt;')} ${b('is still emitted, visually hidden')} ⚑ — the placeholder is never the accessible name. ${code('required')} on email and message; the first invalid field takes focus on submit. Focus ring suppressed on fields, kept on the button ⚑. Placeholder contrast 5.1:1 light, 5.0:1 dark; at Labels: Hidden the placeholder is doing label work and ${b('the panel says so')} ⚑.<br>${b('Repeating items')} — none drawn. ${code('socials[]')} is kept intact and returns on switching to a design that draws it ⚑.<br>${b('Flagged ⚑')} labels left-aligned under a centred head · Labels: Hidden and its cost · the head measure holding at 720 across all three form widths · the contact fields kept and never drawn.`)
  ]]
};

/* ── 3 · Card ──────────────────────────────────────────────────────── */
const d3 = {
  n: 3, name: 'Card',
  rail: 'A16 CONTACT · DESIGN 3 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'The form on an inset surface card, raised off the page ground with the pack’s md shadow, and the head above it on the page. A19·3’s card, carried verbatim.',
    'It is the design for a contact section sitting inside a longer page — an about page, a home page — where the form needs an edge to say that it is a different kind of thing from the prose above it.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · CARD 680 CENTRED · HEAD ABOVE ON THE PAGE · MD SHADOW',
  body(t, w) {
    const gp = K.ground(t, 'page'), gs = K.ground(t, 'surface');
    const cw = w === 1440 ? 680 : w === 834 ? 640 : 350;
    const pad = w === 390 ? 24 : 40;
    const card = `<div style="width:${cw}px;background:${gs.bg};border:1px solid ${gs.border};border-radius:${gs.r}px;padding:${pad}px;box-sizing:border-box;${t.dark ? '' : `box-shadow:${t.shadow};`}">${K.formBlock(gs, { fields: 3, message: 'Medium', stack: w === 390, narrow: true, buttonFull: w === 390 })}</div>`;
    const inner = `<div style="display:flex;flex-direction:column;align-items:center;gap:${w === 390 ? 28 : 40}px">
        ${K.headBlock(gp, w, { align: 'center', measure: w === 390 ? 350 : 560, max: 720 })}${card}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A19·3’s surface card at A16’s scale: ${b('680 wide, 40 px inside, the pack radius, md shadow in light and a hairline alone in dark')} ⚑ (A29·4’s call that cards force Flat in dark, carried verbatim). ${b('The fields sit on the page ground inside the card')} ⚑ — the field is always a step away from the plane it sits on, so on a white card the field takes the warm ${code('#FBF9F5')} rather than more white. The head stays on the page outside the card at the default, which is what makes this 3 and not 2 Centred with a border.`,
  stateForm(t, s) {
    const gs = K.ground(t, 'surface');
    return `<div style="width:100%;background:${gs.bg};border:1px solid ${gs.border};border-radius:${gs.r}px;padding:20px;box-sizing:border-box;box-shadow:${t.dark ? 'none' : t.sm}">${K.formBlock(gs, { state: s, fields: 3, message: 'Short' })}</div>`;
  },
  tileMin: 320,
  statesNote: `The seven states on the card’s surface rather than the page. ${b('The card does not resize between empty and submitting')}, and ${b('it does shrink at sent')} ⚑ — the card is the form’s container, so it follows the form. ${b('Failed’s banner sits inside the card')}, above the first field, at the card’s own padding.`,
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED DELIVERY GROUP',
    name: 'Card', n: 3, sub: 'The form on an inset card.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'The section’s padding, outside the card: 64 · 96 · 132.'),
      K.sel('Fields', 'Name, email, message', 'The category’s four-value set.'),
      K.seg('Card width', ['Narrow', 'Medium', 'Wide'], 1, '560 · 680 · 800. Inside padding is 32 · 40 · 48 to match ⚑ — one value, two effects, which is cheaper than two controls.'),
      K.sel('Head', 'Above the card', `Above the card · On the card · None. ${b('On the card puts the head inside it')}, which makes the card the whole section and is the value to use when A16 is the only thing on the route ⚑.`),
      K.seg('Message height', ['Short', 'Medium', 'Tall'], 1, '3 · 5 · 8 lines.'),
      K.seg('Depth', ['Raised', 'Flat'], 0, `Raised is the md shadow; Flat is the hairline alone. ${b('Dark forces Flat')} ⚑ — A29·4, carried verbatim.`)
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: a card-ground value (a card is ${code('surface')}, and a card on the page ground is 12 Boxed ⚑ — the panel names it), a radius value (radius comes from the pack token and mixing radii inside one section is the defect rule 2 exists to prevent), and an alignment value.`,
      `${b('Card width sets the inside padding too')} ⚑ — 560/32, 680/40, 800/48. A user who wants a wide card with tight padding is describing a different design, and the panel says which.`,
      `${b('Head: On the card')} is the one value that changes what the section is: at that value the page ground shows only as a margin and the card is the composition. It is drawn on the states frame rather than described ⚑.`
    ]
  },
  tabletLabel: '834 · card 640, inside padding 40',
  mobileLabel: '390 · card 350, inside 24, fields 48',
  respCap: 'TABLET 834 · CARD 640 · MOBILE 390 · CARD FULL MEASURE, INSIDE PADDING 24',
  respNote: `The card takes the content measure at 390 ⚑ — 350 wide with 24 px inside — rather than keeping a page margin outside a card margin, which would leave the fields at 302 px. ${b('That is the one thing this design does that 2 Centred does not')}: below 768 a card and a plain form are 26 px apart, and the card earns its keep above 768 or not at all. Card width 680 → 640 → 350; inside 40 → 40 → 24; the head’s measure follows 2 Centred’s.`,
  darkNote: `${b('Flat is forced')} ⚑: surface ${code('#211D17')} on ground ${code('#171511')} with a ${code('#332E27')} hairline and no shadow, because a warm shadow on a dark ground is a smudge. The field inside the card goes ${b('darker')} than the card — ${code('#171511')} — which is the same rule as light read the other way ⚑.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'The form on an inset surface card raised off the page ground, with the head above it on the page. A19·3’s card at A16’s scale.'),
    K.specRow(2, 'Structural descriptor', `${code('form · card · page · none · none · the ask on an inset card')}<br><span style="color:#6B6459">Containment ${code('card')} is the whole distinction from 2 Centred and 12 Boxed: same archetype, same ground, three containments.</span>`),
    K.specRow(3, 'Archetype', 'form. No departures.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} card 680 centred in 1,296, inside padding 40, section padding 96, head above on 720. ${b('834')} card 640, inside 40, padding 80. ${b('≤ 767')} card 350 — the full content measure ⚑ — inside 24, fields 48 and stacked, field text 16, button full width, padding 64.`),
    K.specRow(5, 'Content fields', `As 2 Centred. ${b('The contact rows and')} ${code('socials[]')} ${b('are stored and never drawn')} ⚑.`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Fields (the four-value set) — Card width ${b('Narrow 560 · Medium 680 · Wide 800')} — Head ${b('Above the card · On the card · None')} — Message height ${b('Short · Medium · Tall')} — Depth ${b('Raised · Flat')}.`),
    K.specRow(7, 'Data', 'Nothing is read from Ghost; no repeating unit.'),
    K.specRow(8, 'Empty state', `At Head: None the card is the whole section and takes the form’s ${code('aria-label')} ⚑. Everything else as 2 Centred. ${b('A card with an empty form cannot happen')} — the field set is a control with a floor of two.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}, above the card or on it. ${b('The card is not a landmark and takes no role')} ⚑ — it is a fill and a shadow, and the ${code('&lt;form&gt;')} inside it is the thing that gets named. Card border 1.4:1 against the ground in light, which is a hairline and not an interactive boundary, so it is not held to 3:1 ⚑. Rest as 2 Centred.<br>${b('Repeating items')} — none drawn; ${code('socials[]')} kept.<br>${b('Flagged ⚑')} card width setting inside padding · Flat forced in dark · the card taking the full measure at 390 · the field going darker than the card in dark.`)
  ]]
};

/* ── 4 · Panel ─────────────────────────────────────────────────────── */
const d4 = {
  n: 4, name: 'Panel',
  rail: 'A16 CONTACT · DESIGN 4 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'A raised surface plane the full width of the content box, carrying the contact details as a row across its top and the form beneath them. The design where the details and the form are one object rather than two columns.',
    'It is 1 Split’s content in one container: the same head, the same four contact rows, the same form — arranged as a band of detail over a form rather than as two standing columns.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · PLANE 1,296 · DETAILS ROW ACROSS THE TOP · FORM 640 BENEATH',
  body(t, w) {
    const gp = K.ground(t, 'page'), gs = K.ground(t, 'surface');
    const g = G(w);
    const pad = w === 390 ? 24 : 44;
    const fw = w === 1440 ? 640 : w === 834 ? '100%' : '100%';
    const plane = `<div style="width:100%;background:${gs.bg};border:1px solid ${gs.border};border-radius:${gs.r}px;padding:${pad}px;box-sizing:border-box;${t.dark ? '' : `box-shadow:${t.shadow};`}display:flex;flex-direction:column;gap:${w === 390 ? 28 : 36}px">
        ${K.detailsBlock(gs, w === 390 ? { max: 302 } : { row: true, colW: w === 1440 ? 240 : 200, gap: w === 1440 ? 40 : 28, max: 260, flex: '1 1 200px' })}
        <div style="border-top:1px solid ${gs.border};padding-top:${w === 390 ? 28 : 36}px;${typeof fw === 'number' ? `width:${fw}px` : ''}">${K.formBlock(gs, { fields: 3, message: 'Medium', stack: w === 390, narrow: w !== 1440, buttonFull: w === 390 })}</div>
      </div>`;
    const inner = `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 28 : 40}px">${K.headBlock(gp, w, { measure: w === 390 ? 350 : 560, max: 720 })}${plane}</div>`;
    return P.stdWrap(t, w, inner);
  },
  primaryNote: `A26·3 and A27·4’s surface plane, full content width, with A3·10’s four contact rows laid across the top of it on a 240 px column each and the form under a hairline beneath. ${b('The form is clamped to 640 inside a 1,296 plane')} ⚑ and the remaining 656 is left empty — a text field does not get wider because its container did, which is the same call A9·7 made about its rows.`,
  stateForm(t, s) {
    const gs = K.ground(t, 'surface');
    return `<div style="width:100%;background:${gs.bg};border:1px solid ${gs.border};border-radius:${gs.r}px;padding:20px;box-sizing:border-box;box-shadow:${t.dark ? 'none' : t.sm}">${K.formBlock(gs, { state: s, fields: 3, message: 'Short' })}</div>`;
  },
  tileMin: 320,
  statesNote: `Drawn on the plane, with the details row cropped out of the tiles so the form is legible at 616 px. ${b('The details row never changes state')} ⚑ — it is not part of the form, so at sent, failed and submitting it is drawn exactly as at empty, and only the block under the hairline moves.`,
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED DELIVERY GROUP',
    name: 'Panel', n: 4, sub: 'Details over form, on one plane.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Padding', ['Compact', 'Comfortable', 'Spacious'], 1, 'The section’s padding, outside the plane: 64 · 96 · 132.'),
      K.sel('Fields', 'Name, email, message', 'The category’s four-value set.'),
      K.sel('Contact row', 'Across the top', `Across the top · Under the form · Off. ${b('Across the top is the default')} — a reader who can answer their own question from an address should not have to pass a form to find it ⚑.`),
      K.seg('Plane padding', ['Compact', 'Comfortable', 'Spacious'], 1, '32 · 44 · 64 inside the plane. Separate from the section’s own padding, because they are two different edges ⚑.'),
      K.seg('Message height', ['Short', 'Medium', 'Tall'], 1, '3 · 5 · 8 lines.'),
      K.seg('Depth', ['Raised', 'Flat'], 0, 'Raised is the md shadow; Flat is the hairline alone. Dark forces Flat ⚑.')
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: a form-width value — ${b('the form is 640 on the plane at every value')} ⚑ and widening it is what 12 Boxed at Wide does; a social value, because ${b('this design draws no socials')} ⚑ and the panel names 1 Split and 12 Boxed as the two that do; a ground value, because a plane is ${code('surface')} by definition and a plane on the page ground is 12 Boxed.`,
      `${b('Two padding controls is deliberate')} ⚑ and it is the only design in A16 with both: the section’s seam and the plane’s inside edge are independent, and one value driving both would make a Spacious section a Spacious plane whether or not that reads.`,
      `${b('Contact row: Off')} leaves the plane holding a form alone, which is 3 Card at 1,296 — the panel names it rather than pretending the overlap is not there ⚑.`
    ]
  },
  tabletLabel: '834 · details row two-across, form full plane width',
  mobileLabel: '390 · details stacked, then the form',
  respCap: 'TABLET 834 · DETAILS TWO-ACROSS · MOBILE 390 · DETAILS STACK, FORM BENEATH',
  respNote: `The details row is a ${code('flex-wrap')} of 200 px blocks, so it goes four-across at 1440, ${b('two-across at 834')} and one per row at 390 with no rule stating each step ⚑ — the wrap is the rule. The form loses its 640 clamp at 834 and takes the plane’s inside width, because 640 of a 754 plane leaves 114 px of nothing. Plane inside padding 44 → 44 → 24; the plane keeps a page margin at 390 rather than going full bleed, which is what separates it from 5 Contrast Band.`,
  darkNote: `Plane ${code('#211D17')} on ground ${code('#171511')}, Flat forced, hairline ${code('#332E27')} both around the plane and under the details row. ${b('The details row’s labels stay')} ${code('text-muted')} ${b('and its values stay')} ${code('text')} ⚑ — the same two roles in both modes, re-checked at 6.4:1.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A raised surface plane the full content width, carrying the four contact rows across its top and the form beneath a hairline. The details and the form as one object.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · surface · none · none · the ask on a raised plane')}<br><span style="color:#6B6459">Ground ${code('surface')} with containment ${code('none')}: A26·3’s call that a full-width fill is a ground rather than a containment, carried verbatim. 3 Card is the inset version and is ${code('card · page')}.</span>`),
    K.specRow(3, 'Archetype', 'form. No departures.'),
    K.specRow(4, 'Responsive rule', `${b('1440')} plane 1,296, inside 44, details four-across on 240, form clamped 640 under a hairline, section padding 96. ${b('834')} plane 754, details two-across, ${b('form takes the plane’s inside width')} ⚑, padding 80. ${b('≤ 767')} plane 350, inside 24, details one per row, fields 48, field text 16, button full width, padding 64.`),
    K.specRow(5, 'Content fields', `As 1 Split, minus ${code('socials[]')}, which is ${b('stored and never drawn')} ⚑. The four contact rows are section fields, not items: each may be left empty and takes its 12 px label with it ⚑ (A3·10’s rule, verbatim).`)
  ], [
    K.specRow(6, 'Controls', `Padding ${b('Compact · Comfortable · Spacious')} — Fields (the four-value set) — Contact row ${b('Across the top · Under the form · Off')} — Plane padding ${b('Compact 32 · Comfortable 44 · Spacious 64')} — Message height ${b('Short · Medium · Tall')} — Depth ${b('Raised · Flat')}.`),
    K.specRow(7, 'Data', `Nothing from Ghost. ${b('The contact row at 0 filled rows')} → the row and its hairline are removed and the plane holds the form alone ⚑, which the panel names as 3 Card at full width. ${b('1')} → one block at the plane’s left, not stretched ⚑. ${b('4')} is the ceiling; there is no fifth row to add, because the block is not a repeater.`),
    K.specRow(8, 'Empty state', `As 2 Centred for the head. ${b('All four contact rows empty and Contact row: Across the top')} → the plane starts at the form and keeps its inside padding, ${b('no empty band is drawn')} ⚑.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')} above the plane. ${b('The contact row is a')} ${code('&lt;dl&gt;')} ⚑ — label and value are a term and its definition, which is the one place in A16 where that is literally true. The plane is not a landmark. Rest as 1 Split.<br>${b('Repeating items')} — none drawn. The contact block is four fixed fields with no Add, no Remove and no reorder ⚑; ${code('socials[]')} is kept.<br>${b('Flagged ⚑')} the 640 form clamp on a 1,296 plane · two padding controls · Contact row: Off naming 3 Card · the ${code('&lt;dl&gt;')} · the details row not changing state.`)
  ]]
};

/* ── 5 · Contrast Band ─────────────────────────────────────────────── */
const d5 = {
  n: 5, name: 'Contrast Band',
  rail: 'A16 CONTACT · DESIGN 5 OF 15 · PAPER PACK · SIX CONTROLS + THE DELIVERY GROUP',
  paras: [
    'A full-bleed inverted band carrying the head and the contact details at the left and the form at the right, with every colour in it derived from two tokens.',
    'It is the design that ends a page. On the band the accent is unavailable — it measures 4.0:1 against contrast and an action needs 4.5 — so the button takes the carried colour, which is A29·3’s finding carried forward without change.'
  ],
  primaryCap: 'DESKTOP 1440 · LIGHT · FULL-BLEED CONTRAST BAND · HEAD LEFT, FORM RIGHT · BUTTON CARRIES',
  body(t, w) {
    const g = K.ground(t, 'contrast');
    const gg = G(w);
    const pad = w === 1440 ? 88 : w === 834 ? 72 : 56;
    const inner = w >= 1440
      ? `<div style="display:flex;gap:96px;align-items:flex-start"><div style="width:520px;display:flex;flex-direction:column;gap:36px">${K.headBlock(g, w, { measure: 480, max: 520 })}${K.detailsBlock(g, { max: 440, items: K.DETAILS.slice(0, 3) })}${K.socialRow(g, {})}</div><div style="width:640px">${K.formBlock(g, { fields: 3, message: 'Medium' })}</div></div>`
      : `<div style="display:flex;flex-direction:column;gap:${w === 390 ? 36 : 44}px">${K.headBlock(g, w, { measure: w === 390 ? 310 : 560, max: 640 })}${K.formBlock(g, { fields: 3, message: 'Medium', stack: w === 390, narrow: true, buttonFull: w === 390 })}<div style="display:flex;flex-direction:column;gap:24px;border-top:1px solid ${g.border};padding-top:28px">${K.detailsBlock(g, w === 390 ? { max: 278 } : { row: true, colW: 200, gap: 32, max: 260 })}${K.socialRow(g, {})}</div></div>`;
    const band = `<div style="width:${w}px;background:${g.bg};padding:${pad}px ${gg.m}px;box-sizing:border-box"><div style="width:${gg.box}px;margin:0 auto">${inner}</div></div>`;
    return P.bleedWrap(t, w, band);
  },
  primaryNote: `A17·7’s on-contrast derivation, unchanged: ${b('every colour in the band comes from the two contrast tokens')} — muted at 72%, hairlines at 20%, the field fill at 8%, and the button taking the carried colour with the band colour as its label. ${b('The accent appears nowhere on this band')} ⚑ — at 4.0:1 it fails an action’s 4.5, which A29·3 measured and A22·4 repeated. ${b('The section’s own padding is 0 at every width')} ⚑; the band carries it, at 64 · 88 · 120.`,
  stateForm(t, s) {
    const g = K.ground(t, 'contrast');
    return `<div style="width:100%;background:${g.bg};border-radius:8px;padding:20px;box-sizing:border-box">${K.formBlock(g, { state: s, fields: 3, message: 'Short' })}</div>`;
  },
  tileMin: 320, tileBg: '#F7F5F2',
  statesNote: `Every state re-derived on the band. ${b('Invalid’s 1.5 px border takes the carried colour, not the accent')} ⚑, and so does focus — on ${code('contrast')} and over an image the accent substitution is the carried colour, which is A22’s rule verbatim. ${b('The failed banner’s border is the carried colour at full strength')} and its plane is the carried colour at 6% ⚑.`,
  controls: {
    cap: 'THE CONTROL PANEL · SIX CONTROLS + THE SHARED DELIVERY GROUP + THE SOCIAL REPEATER',
    name: 'Contrast Band', n: 5, sub: 'Inverted, full bleed.', count: 'SIX CONTROLS + THE DELIVERY GROUP',
    rows: [
      K.seg('Band padding', ['Compact', 'Comfortable', 'Spacious'], 1, `64 · 88 · 120 inside the band; 72 at 834, 56 at 390. ${b('It replaces the section’s Padding control')} ⚑ — the section’s own padding is 0 at every value.`),
      K.sel('Fields', 'Name, email, message', 'The category’s four-value set.'),
      K.seg('Band width', ['Full bleed', 'Inset'], 0, 'Inset holds the band to the 1,296 content box at the pack radius; Full bleed runs it edge to edge with square corners ⚑.'),
      K.seg('Arrangement', ['Head left, form right', 'Head above'], 0, 'The two-column value needs 1,081; below that both values are the same stack ⚑.'),
      K.seg('Message height', ['Short', 'Medium', 'Tall'], 1, '3 · 5 · 8 lines.'),
      K.seg('Social', ['Glyphs', 'Labels', 'Off'], 0, 'A3·1’s values. On the band the glyph boxes take a 20% carried hairline ⚑.'),
      K.repeater({ label: 'Socials', items: ['Instagram · @orbitweekly', 'X · @orbitweekly', 'Mastodon · @orbit@social.lisboa', 'LinkedIn · Orbit Weekly'], add: '+ Add platform', help: 'A3’s list, verbatim. Add opens the platform picker, lands last; six is the ceiling; drag to reorder.' })
    ],
    delivery: {},
    settles: [
      `${b('Six controls.')} Cut: a button-colour value — ${b('the accent is unavailable on the band and the value would be a disabled row')} ⚑; a text-colour value, because every colour here is derived from two tokens and derivation is the point; a depth value, because a band is never raised.`,
      `${b('Band padding replaces Padding')} ⚑ rather than joining it. Two padding controls on a full-bleed band would let a user set 132 px of page padding above a band that is already 120 px tall inside, and the seam would be 252 px of nothing.`,
      `${b('The contact block draws three rows here, not four')} ⚑ — replies is dropped on the band because the form’s consent line already says when to expect an answer, and two sentences making the same promise 40 px apart reads as filler.`
    ]
  },
  tabletLabel: '834 · one column ⚑ · band padding 72',
  mobileLabel: '390 · full bleed, padding 56, stacked',
  respCap: 'TABLET 834 · ONE COLUMN, THE ARRANGEMENT CONTROL HAS NO EFFECT ⚑ · MOBILE 390 · FULL BLEED',
  respNote: `${SPLIT_MIN} At 1,080 and below ${b('Arrangement has no effect and the sidebar says so')} ⚑ rather than silently doing nothing. The order below the split is ${b('head · form · rule · details · socials')}, the same order as 1 Split. ${b('Band width: Inset becomes full bleed at 390')} ⚑ — a 350 px inset band inside a 390 px viewport is a 20 px margin either side, which reads as an accident.`,
  darkNote: `${b('The band gets lighter in dark, not darker')} ⚑ — contrast is ${code('#EDE7DA')} carrying ${code('#171511')}, which is A22·4’s call and A17·7’s derivation. Every derived value re-runs against the new pair: muted at 72%, hairline at 20%, field fill at 8%. The button is ${code('#171511')} on ${code('#EDE7DA')} in dark and ${code('#FBF9F5')} on ${code('#232019')} in light.`,
  spec: [[
    K.specRow(1, 'Descriptor', 'A full-bleed inverted band carrying the head and three contact rows at the left and the form at the right, with every colour derived from the two contrast tokens.'),
    K.specRow(2, 'Structural descriptor', `${code('form · none · contrast · none · none · the ask on an inverted band')}<br><span style="color:#6B6459">Ground ${code('contrast')} is the whole distinction from 4 Panel: same archetype, same containment, a different ground, and that is what rule 2 means by structure being the design.</span>`),
    K.specRow(3, 'Archetype', `form. ${b('Two departures')} — the section’s own padding is 0 at every value ⚑, and the two-column arrangement needs 1,081 rather than 768 ⚑.`),
    K.specRow(4, 'Responsive rule', `${b('1440')} band full bleed, inside 88 × 72, content 1,296, 520 · 96 · 640, three contact rows, socials as glyphs. ${b('1080')} one column; ${b('Arrangement stops having an effect and the sidebar says so')} ⚑. ${b('834')} inside 72 × 40, heading 34. ${b('≤ 767')} inside 56 × 20, heading 28, ${b('Inset forced to full bleed')} ⚑, fields 48, field text 16, button full width.`),
    K.specRow(5, 'Content fields', `As 1 Split. ${b('The')} ${code('replyHours')} ${b('row is stored and not drawn')} ⚑ — three rows on the band, four everywhere else.`)
  ], [
    K.specRow(6, 'Controls', `Band padding ${b('Compact 64 · Comfortable 88 · Spacious 120')} — Fields (the four-value set) — Band width ${b('Full bleed · Inset')} — Arrangement ${b('Head left, form right · Head above')} — Message height ${b('Short · Medium · Tall')} — Social ${b('Glyphs · Labels · Off')}. Then the socials repeater and the delivery group.`),
    K.specRow(7, 'Data', `Nothing from Ghost. ${code('socials[]')} at ${b('0')} → row and gap removed; ${b('1')} → one box; ${b('many')} → wraps, six the ceiling. Contact rows as 4 Panel, three of the four drawn.`),
    K.specRow(8, 'Empty state', `As 1 Split. ${b('An empty left column is a real state')} — head off, contact rows empty, socials off — and the band then centres the form on its 1,296 rather than leaving 616 px of band empty ⚑.`),
    K.specRow(9, 'Behaviour module', `${code('member-form')}, edit-safe. ${b('No-JS, quoted:')} “${P.MODULE_QUOTE}” ${P.MODULE_READING}`),
    K.specRow(10, 'Accessibility', `Heading ${b('h2')}. ${b('No')} ${code('color-scheme')} ${b('switch inside the band')} ⚑ — A3·5’s rule: a band that flipped the UA’s form colours would give the reader a dark field on a light band. Derived contrasts, light band: heading 13.4:1, muted 5.6:1, field placeholder 4.9:1, button label 13.4:1. ${b('The accent is refused at 4.0:1')} ⚑. Focus ring on the band is the carried colour, not the accent.<br>${b('Repeating items')} — ${code('socials[]')}: as 1 Split, 0–6, designed for 3–4.<br>${b('Flagged ⚑')} zero section padding · the 1,081 collapse · Arrangement inert below it · Inset forced to full bleed at 390 · three contact rows not four · the band lightening in dark.`)
  ]]
};

return [d1, d2, d3, d4, d5];
})();
