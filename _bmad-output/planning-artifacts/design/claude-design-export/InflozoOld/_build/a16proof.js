// A16-0 Category Proof builder.
globalThis.A16PROOF = (function () {
const K = globalThis.A16LIB, P = globalThis.A16PAGE;
const { b, code, cap, note, tile, tableCard, section, intro, wrapIf, specCards, MONO } = K;
const PC = K.PC;

/* ---- the tokenisation proof: 3 Card, three packs, light and dark ---- */
function cardMini(pack, mode) {
  const p = K.PACKS[pack], t = mode === 'd' ? p.d : p.l;
  const gp = K.ground(t, 'page', p), gs = K.ground(t, 'surface', p);
  const card = `<div style="width:100%;background:${gs.bg};border:1px solid ${gs.border};border-radius:${gs.r}px;padding:24px;box-sizing:border-box;${t.dark ? '' : `box-shadow:${t.shadow};`}">${K.formBlock(gs, { fields: 3, message: 'Short' })}</div>`;
  return `<div style="width:432px;background:${t.bg};border-radius:8px;padding:28px;box-sizing:border-box;display:flex;flex-direction:column;gap:22px;align-items:center;box-sizing:border-box">
    ${K.headBlock(gp, 834, { align: 'center', hSize: 26, measure: 340, max: 380 })}${card}</div>`;
}
function packProof() {
  const names = { paper: 'PAPER · RADIUS 8 · GEORGIA + INTER', studio: 'STUDIO · RADIUS 2 · BRICOLAGE + INTER', garden: 'GARDEN · RADIUS 20 · BRICOLAGE + INTER' };
  const col = pack => `<div style="display:flex;flex-direction:column;gap:10px">
      <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${names[pack]}</span>
      ${cardMini(pack, 'l')}
      <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${names[pack].split(' · ')[0]} · DARK</span>
      ${cardMini(pack, 'd')}</div>`;
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${['paper', 'studio', 'garden'].map(col).join('')}</div>`;
}

/* ---- the stress frame ---- */
const STRESS_HEAD = 'Corrections, complaints and letters intended for publication in the weekly edition';
const STRESS_DETAILS = [
  { label: 'Email', value: 'corrections.and.complaints@orbitweekly.example.com', link: true },
  { label: 'Post', value: 'Orbit Weekly, Edifício Boavista, 14 Rua da Boavista, 4.º andar, sala 12, 1200-067 Lisboa, Portugal' },
  { label: 'Phone', value: '+351 21 346 0188 (Tuesdays and Thursdays only)', link: true },
  { label: 'Replies', value: 'Within two working days, Monday to Friday, except during the August break.' }
];
const STRESS_SOCIALS = K.SOCIALS.concat([{ name: 'YouTube', ini: 'YT' }, { name: 'Bluesky', ini: 'BS' }]);
function stressFrame(t, w) {
  const g = K.ground(t, 'page');
  const inner = `<div style="display:flex;gap:96px;align-items:flex-start">
      <div style="width:560px;display:flex;flex-direction:column;gap:36px">
        ${K.headBlock(g, w, { measure: 520, max: 560, headingText: STRESS_HEAD, blurbText: 'Everything we published that is wrong, unfair or out of date, plus anything you would like printed with your name on it. A person reads every message and we answer all of them, including the ones we would rather not.' })}
        ${K.detailsBlock(g, { max: 520, items: STRESS_DETAILS })}
        ${K.socialRow(g, { items: STRESS_SOCIALS, n: 6 })}
      </div>
      <div style="width:640px">${K.formBlock(g, { fields: 5, message: 'Tall', consent: 'checkbox' })}</div></div>`;
  return P.stdWrap(t, w, inner, { padNote: 'THE STRESS FRAME · PADDING UNCHANGED' });
}

/* ---- tables ---- */
const ROSTER = [
  ['1', 'Split', 'split · none · page · none · none · form beside the details column', '6', 'member-form ⚑'],
  ['2', 'Centred', 'form · none · page · none · none · one centred form, no details', '6', 'member-form ⚑'],
  ['3', 'Card', 'form · card · page · none · none · the ask on an inset card', '6', 'member-form ⚑'],
  ['4', 'Panel', 'form · none · surface · none · none · the ask on a raised plane', '6', 'member-form ⚑'],
  ['5', 'Contrast Band', 'form · none · contrast · none · none · the ask on an inverted band', '6', 'member-form ⚑'],
  ['6', 'Details Grid', 'grid-of-N · none · page · few · none · detail blocks without a form', '5', 'none'],
  ['7', 'Map Split', 'split · none · surface · none · left · a map holding one half', '6', 'member-form ⚑'],
  ['8', 'Locations', 'grid-of-N · none · surface · few · top · one card per location', '5', 'none'],
  ['9', 'Slim Bar', 'bar · none · surface · none · none · one line, the address inline', '5', 'none'],
  ['10', 'Big Type', 'stack · none · transparent · none · none · the address at display scale', '5', 'none'],
  ['11', 'Enquiry Types', 'form · none · surface · few · none · one radio row per enquiry', '6', 'member-form ⚑'],
  ['12', 'Boxed', 'form · box · page · none · none · the ask in a hairline box', '6', 'member-form ⚑'],
  ['13', 'Directory', 'table · none · page · many · none · one row per enquiry address', '5', 'none'],
  ['14', 'Reasons', 'split · none · page · few · none · three reasons beside the form', '6', 'member-form ⚑'],
  ['15', 'Cover', 'form · none · image · none · background · the ask over a cover photograph', '6', 'member-form ⚑']
];
const FIELDS = [
  ['<code>eyebrow</code>', 'text', 'opt', '24 ch', '1–8, 10–15', 'Stored and not drawn in 9 ⚑'],
  ['<code>heading</code>', 'text', 'opt', '60 ch', 'all but 9, 10', '9 and 10 store it and never draw it ⚑'],
  ['<code>blurb</code>', 'text', 'opt', '240 ch', '1–8, 11–15', 'Clamped 560 on the page, 520 over an image ⚑'],
  ['<code>headingSmall</code>', 'text', 'opt', '30 ch', '10', 'The Heading value’s line; not an <code>h2</code> ⚑'],
  ['<code>nameLabel</code> … <code>messageLabel</code>', 'text', 'opt', '24 ch each', 'the 10 form designs', 'The five field labels; defaults supplied'],
  ['<code>placeholder</code> set', 'text', 'opt', '32 ch each', 'the 10 form designs', 'One per field; defaults supplied'],
  ['<code>buttonLabel</code>', 'text', 'opt', '18 ch', 'the 10 form designs', 'Default “Send message”'],
  ['<code>consentText</code>', 'text', 'opt', '110 ch', 'the 10 form designs', 'The line or the checkbox label ⚑'],
  ['<code>sentHeading</code>', 'text', 'opt', '40 ch', 'the 10 form designs', 'Default “Message sent”'],
  ['<code>sentText</code>', 'text', 'opt', '140 ch', 'the 10 form designs', '<b>Names the address that was typed</b> ⚑'],
  ['<code>invalidText</code>', 'text', 'opt', '60 ch', 'the 10 form designs', 'One per validated field ⚑'],
  ['<code>failedText</code>', 'text', 'opt', '140 ch', 'the 10 form designs', 'Offers the <code>mailto:</code> as the way out ⚑'],
  ['<code>postal</code>', 'text', 'opt', '140 ch', '1, 4, 6, 12', 'A3·10’s contact block, verbatim'],
  ['<code>email</code>', 'text', 'req in 9, 10, 13', '80 ch', '1, 4, 5, 6, 9, 10, 12', 'The one field some designs cannot live without ⚑'],
  ['<code>phone</code>', 'text', 'opt', '40 ch', '1, 4, 5, 6, 9, 12', 'Drawn as a <code>tel:</code> link'],
  ['<code>replyHours</code>', 'text', 'opt', '140 ch', '1, 4, 6, 12', '<b>Not drawn on the band (5)</b> ⚑'],
  ['<code>socialsLabel</code>', 'text', 'opt', '20 ch', '6, 10', 'Defaults “Elsewhere” and “Also on” ⚑'],
  ['<code>socials[]</code>', 'list 0–6', 'opt', 'A3’s fields', '1, 5, 6, 9, 10, 12', '<b>A3’s list, carried verbatim</b>, with its picker'],
  ['<code>locations[]</code>', 'list 1–6', 'opt', 'see notes', '7 (one), 8 (all)', '<b>New in A16</b> ⚑ — name, address, hours, map image, map URL, coords'],
  ['<code>enquiries[]</code>', 'list 1–12', 'opt', 'see notes', '11 (2–4), 13 (1–12)', '<b>New in A16</b> ⚑ — label ≤ 28, address, note ≤ 60'],
  ['<code>reasons[]</code>', 'list 1–3', 'opt', '40 ch each', '14', '<b>A6·11’s field, carried verbatim</b> ⚑'],
  ['<code>columnLabels</code>', 'text ×3', 'opt', '20 ch each', '13', 'The table’s three header strings ⚑'],
  ['<code>label</code>', 'text', 'opt', '20 ch', '9', 'The strip’s label; defaults to <code>@site.title</code> ⚑'],
  ['<code>directionsLabel</code>', 'text', 'opt', '20 ch', '8', 'Default “Directions”'],
  ['<code>image</code> · <code>imageAlt</code> · <code>imageFocus</code>', 'image + text + enum', 'req in 15', '120 ch alt', '15', '<code>imageFocus</code> is <b>a field, not a control</b> ⚑'],
  ['<code>deliveryMode</code> · <code>deliveryTarget</code> · <code>afterSending</code> · <code>consentMode</code>', 'enum + text', 'req', '—', 'the 10 form designs', 'The shared delivery group'],
  ['<i>@site.title</i>', 'Ghost', 'req', '—', '9, and every form with no heading', 'The form’s <code>aria-label</code> where no heading exists ⚑']
];
const COMPONENTS = [
  ['Eyebrow', '13 px uppercase tracked .08em in <code>text-muted</code>', 'A1·1'],
  ['Primary button · ghost action', 'Accent fill 15/600 at 46 px; carried-colour fill on a band or an image', 'A1·1, A6·5'],
  ['Icon button', '44 px box at the pack radius, bare or outlined', 'A1·14'],
  ['Focus ring', '4 px accent ring; <b>suppressed on form fields</b>, which take a 1.5 px border', 'A2·5, A6'],
  ['Striped image plate', 'The placeholder and its mono crop caption', 'A1'],
  ['Content box and padding ladder', '1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132', 'A17'],
  ['On-contrast derivation', 'Every colour on a band from two <code>contrast</code> tokens', 'A17·7'],
  ['Surface card', 'Radius token, <code>md</code> shadow in light, hairline in dark', 'A19·3'],
  ['Surface plane', 'Surface + hairline + <code>md</code> shadow; flat in dark; a full-width fill is a ground', 'A26·3, A27·4'],
  ['Warm scrim', 'Warm dark gradient, strongest at the foot, white over it', 'A20·13'],
  ['Contact block', '<b>Four fixed rows — post, email, phone, replies — 12 px labels, no repeater</b>', 'A3·10 — carried verbatim'],
  ['Social list and its picker', '0–6 entries, Glyphs · Labels · Off, Add opens a platform picker, never a blank row', 'A3·1'],
  ['Reasons list', '1–3 authored lines, ≤ 40 ch, text only, with its repeater', 'A6·11'],
  ['Ledger row', 'A ruled row with a label column and a value column', 'A9·15'],
  ['Repeater', 'Drag handle, remove, <i>Add …</i> at the foot, seeded not blank', 'A3'],
  ['Missing-image vocabulary', 'Reflow · Plate · Hand off', 'A19'],
  ['Disabled-value convention', 'A value that would fail is disabled with its measurement shown', 'A9·8, A29·3'],
  ['<b>The labelled field</b>', '<b>13 px label in <code>text</code>, 8 px above a 46 px field at the pack radius; 48 and 16 px stacked</b>', '<b>A16 — new</b>'],
  ['<b>The message field</b>', '<b>The same label over a 96 · 144 · 216 px box; the only field whose height is a control</b>', '<b>A16 — new</b>'],
  ['<b>The seven form states</b>', '<b>Empty · focus · invalid · submitting · sent · failed · no destination</b>', '<b>A16 — new, extending A22’s seven for a form that Ghost cannot receive</b>'],
  ['<b>The failed banner</b>', '<b>A <code>text</code>-bordered block above the first field keeping everything typed, offering the <code>mailto:</code></b>', '<b>A16 — new</b>'],
  ['<b>The consent line</b>', '<b>One 13 px line, or a 20 px checkbox in a 44 px row, under the button</b>', '<b>A16 — new</b>'],
  ['<b>The static map plate</b>', '<b>A generated image inside a link, never an embed; re-generated for dark, never filtered</b>', '<b>A16·7 — new</b>'],
  ['<b>The location card</b>', '<b>16:9 map thumb flush to the top, name <code>h3</code> 22, address, hours under a hairline, Directions</b>', '<b>A16·8 — new</b>'],
  ['<b>The enquiry radio row</b>', '<b>A fieldset of 46 px radio rows that looks like tabs and is not one</b>', '<b>A16·11 — new</b>'],
  ['<b>The delivery group</b>', '<b>Five shared rows: Where it goes · The destination · After sending · A consent line · Spam (read-only)</b>', '<b>A16 — new</b>']
];
const FINDINGS = [
  ['<b>Ghost cannot receive a form.</b> ⚑', 'Its theme layer has no handler, and <code>/members/api/send-magic-link/</code> takes an email and nothing else. Every A16 form posts to a <code>mailto:</code> or to a third-party endpoint the user pastes. <b>This is the largest finding in the category</b> and it shapes the delivery group, the default, and the failed state.'],
  ['<b>The registry has no contact-form module.</b> ⚑', '<code>member-form</code> is the closest and the ten form designs declare it, flagged. Its degradation statement reads correctly for A16 once “Ghost’s members endpoint” is read as “whatever <code>action</code> the form carries”, but the name is wrong and a build reading it literally would post to the wrong place.'],
  ['<b>The registry has no segmented-control module.</b> ⚑', '11 Enquiry Types looks like <code>tabs</code> and is a radio group, so it needs no module at all. <b>It costs nothing today</b>, but a segmented control that writes a form value is a common shape and the registry has no entry for it.'],
  ['<b>Ghost has no location object.</b> ⚑', '8 Locations and 7 Map Split author every address. Nothing in Ghost’s settings or content API carries a postal address, so there is no fallback and no generated content.'],
  ['<b>Ghost exposes no author emails to a theme.</b> ⚑', '13 Directory cannot be generated from the site’s users; every row is authored. An author directory with contact addresses is not buildable, and A21 Author Showcases will meet the same wall.'],
  ['<b>Spam is a service’s problem and A16 has no service.</b> ⚑', 'The section adds a honeypot and nothing else — <b>no captcha at any value</b>, because a captcha is a third-party script. A publication that gets flooded is a publication that needs a form service, and the panel says so.'],
  ['<b>A16 cannot know what sits above or below it.</b> ⚑', 'The same route-awareness gap A21, A22 and A26–A29 each raised: the seam is A17’s ladder and a page that stacks 9 Slim Bar under A3·4’s newsletter band gets two strips in a row with no way for either to know.']
];

const SETTLEMENTS = [
  ['1 · THE FIELD SET, AND WHAT IS EVER REQUIRED', [
    `${b('Three fields are the core')} — name, email, message — with subject and phone the two that may join them. ${b('The set is a control with four values and never a field builder')} ⚑: <i>Email and message</i> · <i>Name, email, message</i> (default) · <i>Name, email, subject, message</i> · <i>Name, email, phone, subject, message</i>.`,
    `${b('Email and message are required at every value')} ⚑. ${b('Name is required when drawn')} and can be made optional; ${b('subject and phone are never required')} ⚑ — a required field a reader cannot fill is a form they abandon.`,
    `${b('A per-field editor was refused')} ⚑. It is a form builder, it is a different product, and it would make every design’s spec unwritable: the collapse rule, the empty state and the tab order all depend on knowing what the fields are.`
  ]],
  ['2 · VALIDATION, SUBMITTING, SUCCESS AND ERROR', [
    `${b('Seven states, not four')} ⚑ — empty, focus, invalid, submitting, ${b('sent')}, ${b('failed')} and ${b('no destination')}. The last two are A16’s own: A22 needed neither, because Ghost’s endpoint is Ghost’s and cannot be misconfigured by a theme.`,
    `${b('Checked on blur and on submit, never per keystroke')} ⚑. ${b('The message sits under the field it belongs to')}, not in a banner ⚑, and ${b('the first invalid field takes focus on submit')} ⚑. ${b('No red anywhere')} — the seven roles contain no error colour, so invalid is a 1.5 px <code>text</code> border and a 13 px line.`,
    `${b('Sent replaces the form in place and the section shrinks')} ⚑ — A16’s one departure from A22’s hold-the-height rule, because a five-field form is 520 px and its confirmation is 96, and reserving 424 px on every page that never sends costs more than the reflow. ${b('Failed keeps everything typed')} ⚑ and offers the <code>mailto:</code>. ${b('No destination is editor-only')} ⚑.`
  ]],
  ['3 · CAN GHOST RECEIVE IT? NO.', [
    `${b('Ghost’s theme layer has no form handler')} ⚑. There is no route, no endpoint and no storage: <code>/members/api/send-magic-link/</code> accepts an email address and nothing else, and comments belong to a post. ${b('A contact form on a Ghost theme posts somewhere else or nowhere.')}`,
    `${b('So the default destination is a')} <code>mailto:</code> ⚑ — it needs nothing set up, it works on every device that has mail configured, and it fails visibly rather than silently. The alternative is ${b('a form service')}: the user pastes an endpoint URL and the form posts to it natively.`,
    `${b('With JavaScript off the form still posts')} ⚑ — it is a real <code>&lt;form action method="post"&gt;</code> and the service’s own page answers. Only submitting, the in-place sent state and the failed banner need script. ${b('13 Directory is the design that needs none of it')}, and the panel offers it as the fallback.`
  ]],
  ['4 · THE DETAILS BESIDE THE FORM, AND 390', [
    `${b('A3·10’s contact block is carried verbatim')}: four fixed rows in a fixed order — post, email, phone, replies — with no Add, no Remove and no reorder ⚑. It is drawn in 1, 4, 6 and 12; ${b('5 draws three of the four')} ⚑.`,
    `${b('Below 1,081 the details go beneath the form')} ⚑ in every two-column design, ${b('with two stated exceptions')}: ${b('7 Map Split puts the map above')} ⚑ — a map below a five-field form is a map nobody sees — and ${b('14 Reasons puts its lines above')} ⚑, because a promise read after pressing send is not a promise.`,
    `${b('A16’s splits collapse at 1,080, not 767')} ⚑ — one breakpoint earlier than the archetype’s ladder — because a form column below 480 px is a form nobody finishes and 754 cannot hold 480 plus a gutter plus a details column.`
  ]]
];

function build() {
  const L = K.L, D = K.D;
  let out = K.DOC_HEAD;
  out += intro({
    rail: 'A16 CONTACT · CATEGORY PROOF · 15 DESIGNS · PAPER PACK · DRAWN 23 AUGUST 2026',
    title: 'A16 · Contact',
    paras: [
      'The category’s own artefacts: the four settlements §8 asked for, the tokenisation proof, the stress frame, the roster with its fifteen structural descriptors, the shared field list, the cumulative component inventory and the findings.',
      'A16 is the second category in the library whose primary element is an input, and the first whose submission Ghost cannot receive. Ten of the fifteen designs draw a form; five do not, and those five declare no behaviour module at all.'
    ]
  });

  out += section('A16 settlements', cap('THE FOUR QUESTIONS §8 ASKED, ANSWERED') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${SETTLEMENTS.map(s => tile({
      w: 652, label: s[0], bg: '#FFFFFF', border: '#E7E2DB',
      body: `<div style="display:flex;flex-direction:column;gap:10px;font-size:12.5px;line-height:1.65;color:#3A3835">${s[1].map(x => `<span>${x}</span>`).join('')}</div>`
    })).join('')}</div>`);

  out += section('A16 pack proof', cap('THE TOKENISATION PROOF · 3 CARD IN THREE PACKS, LIGHT AND DARK · ONE FUNCTION, SIX TOKEN OBJECTS') +
    packProof() +
    note(`Six frames from ${b('one render function and six token objects')}. Nothing moves: the head is centred in all six, the card is the same width, the field is the same height, the label sits 8 px above it. What changes is ${b('the radius token')} — 8 in Paper, 2 in Studio, 20 in Garden, taken by the card, the fields and the button together and never mixed — ${b('the type pairing')}, and ${b('the seven colour roles')}. ${b('The accent appears once')} in every frame, on the button. ${b('The field is a step away from the plane it sits on in all six')} ⚑: lighter than the card in light, darker in dark.`));

  out += section('A16 stress', cap('THE STRESS FRAME · THE WORST REALISTIC CONTENT THIS CATEGORY WILL MEET') +
    K.frame(L, 1440, stressFrame(L, 1440)) +
    note(`1 Split carrying ${b('an 82-character heading')}, ${b('a 218-character blurb')}, ${b('a five-field set at Message: Tall')}, ${b('a 48-character email address')}, ${b('a four-line postal address')}, ${b('a phone number with a parenthetical')}, ${b('a two-clause reply line')}, ${b('six social glyphs')} and ${b('the consent checkbox rather than the line')}. The heading wraps to three lines at 40 px and the column grows; ${b('the form column does not move')} ⚑, because the two columns are independent and only the taller one sets the section’s height. The email address is the one thing that cannot be made to fit — ${b('it wraps mid-string rather than overflowing')} ⚑ and the 460 px measure is why the details column is 560 rather than 480.`));

  out += section('A16 roster', cap('THE ROSTER · FIFTEEN DESIGNS, FIFTEEN STRUCTURAL DESCRIPTORS') +
    tableCard({ cols: ['#', 'DESIGN', 'TUPLE', 'CTL', 'MODULE'], widths: [30, 130, 720, 40, 150], rows: ROSTER.map(r => [r[0], `<b>${r[1]}</b>`, `<code style="font-family:'JetBrains Mono',monospace;font-size:11px">${r[2]}</code>`, r[3], `<code style="font-family:'JetBrains Mono',monospace;font-size:11px">${r[4]}</code>`]) }) +
    note(`${b('All fifteen are distinct on the five closed slots.')} ${b('Archetype spreads the category')} — six ${code('form')}, three ${code('split')}, two ${code('grid-of-N')}, and one each of ${code('bar')}, ${code('stack')} and ${code('table')}. ${b('Containment separates 2, 3 and 12')} on the page ground — ${code('none')}, ${code('card')}, ${code('box')}. ${b('Ground separates the six forms')}: ${code('page')} (2, 3, 12), ${code('surface')} (4, 11), ${code('contrast')} (5), ${code('image')} (15). ${b('Item-count separates 1 from 14')} on ${code('split · page')} and ${b('4 from 11')} on ${code('form · surface')}. ${b('Containment is')} ${code('none')} ${b('in thirteen of fifteen')} ⚑ — 8 Locations’ cards are the ${b('items’')} geometry, not the section’s, which is A21·2’s rule.<br><br>${b('What the check cannot promise.')} 3 Card and 12 Boxed differ by a fill; 4 Panel and 3 Card by whether the plane is inset; 6 Details Grid and 9 Slim Bar are the same four fields at two densities. ${b('Each panel names the others by number')} ⚑ rather than pretending the overlap is not there. Those distinctions are real and visible; they are not machine-checkable.`));

  out += section('A16 fields', cap('THE SHARED FIELD LIST · THE CONTRACT THAT MAKES DESIGN-SWITCHING SAFE') +
    tableCard({ cols: ['FIELD', 'TYPE', 'REQ', 'LIMIT', 'USED BY', 'NOTES'], widths: [230, 120, 90, 90, 170, 370], rows: FIELDS }) +
    note(`${b('Twenty-six authored fields and one thing read from Ghost.')} A design may use far fewer — 10 Big Type draws four — but ${b('none needs a field the category does not have')}, so switching between any two of the fifteen preserves everything the user typed. ${b('Three lists are authored')}: ${code('socials[]')} is A3’s carried verbatim, ${code('reasons[]')} is A6·11’s carried verbatim, and ${code('locations[]')} and ${code('enquiries[]')} are new here ⚑. ${b('11 Enquiry Types and 13 Directory share one list')} ⚑, which is why a publication can outgrow a three-way chooser without retyping a single address.`));

  out += section('A16 components', cap('COMPONENT INVENTORY · CUMULATIVE · TEN NEW, SEVENTEEN CARRIED FORWARD') +
    tableCard({ cols: ['COMPONENT', 'WHAT IT IS', 'FIRST SET'], widths: [250, 720, 200], rows: COMPONENTS }));

  out += section('A16 findings', cap('FINDINGS FOR THE ARCHITECT · SEVEN, FIVE OF THEM NEW') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${FINDINGS.map((f, i) => tile({
      w: 652, label: `FINDING ${i + 1}`, bg: '#FFFFFF', border: '#E7E2DB',
      body: `<div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;line-height:1.65;color:#3A3835"><span>${f[0]}</span><span>${f[1]}</span></div>`
    })).join('')}</div>`);

  out += section('A16 items', cap('REPEATING ITEMS · THE WHOLE CATEGORY, IN ONE PLACE') +
    specCards([[
      `${b('Four kinds of item appear in A16 and all four are authored')} ⚑ — Ghost supplies none of them.`,
      `${b('socials[]')} — 1, 5, 6, 9, 10, 12. ${b('A3’s list, carried verbatim')}: Add opens the ${b('platform picker')} and lands last, never a blank row ⚑; Remove is on the row and undoable; ${b('drag reorders and authored order is drawn order')}; ${b('0–6')}, drawn for 3–5, and ${b('Add is disabled at six')} with the reason shown ⚑ — six 44 px boxes on a 6 px gap are 294 px of a 350 px measure. ${b('Zero removes the row and its gap')}, and in 6 and 10 the rule above it goes too ⚑. Inside an entry the user edits ${b('the platform and the URL')} and nothing else; ${b('the handle is optional')} and an entry without one draws its platform name alone ⚑.`,
      `${b('locations[]')} — 7 (the first only), 8 (all). ${b('New in A16')} ⚑. Add is ${b('seeded with the site’s own city and a placeholder address')} and lands last ⚑; Remove is on the row and ${b('disabled at one in 8')} ⚑; ${b('reorder is meaningful in both')} — in 8 it is reading order, and ${b('in 7 the first entry is the one on the page')} ⚑. ${b('1–6, drawn for 2–3')}; four or more wraps at the same card size rather than shrinking ⚑; ${b('zero means 8 does not render')} and 7 falls back to 4 Panel. Inside an item: ${b('name, address, hours, map image, map URL')}. ${b('Hours and the map are optional')} — no hours drops the line and its hairline; no map starts the card at its name ⚑.`
    ], [
      `${b('enquiries[]')} — 11 (2–4 as radios), 13 (1–12 as rows). ${b('New in A16, and one list serving two designs')} ⚑. Add is ${b('seeded “New enquiry” with the section’s default address')} and lands last ⚑; Remove is ${b('disabled at two in 11')} and never disabled in 13 ⚑; ${b('drag reorders')}, and ${b('in 11 the first entry is the one selected on load')} ⚑. ${b('11 refuses a fifth and names 13')} ⚑. Inside an item: ${b('label, address, note')} — the note is optional, and an entry without one leaves 13’s cell empty at full row height ⚑ and 11’s line beneath the row absent ⚑.`,
      `${b('reasons[]')} — 14 alone. ${b('A6·11’s field and repeater, carried verbatim')} ⚑: 1–3 lines, ≤ 40 characters, text only, ${b('no icons at any value')} ⚑, ${b('Add disabled at three')} ⚑, ${b('Add never produces a blank line')}, an emptied line removed on blur with an undo. ${b('Reordering renumbers')} ⚑. One reason is a supported state, not a degraded one; removing the last leaves the column empty and ${b('the panel names 1 Split')} ⚑.`,
      `${b('The contact block is not a list')} ⚑ — four fixed fields in a fixed order with no Add, no Remove and no reorder. A3·10 made that call and A16 does not reopen it. ${b('Per-item styling does not exist anywhere in A16')}, by construction: every control writes a single value onto the section and the stylesheet reads it, so “make this card bigger” is not expressible. ${b('Inside an item the user edits content only')} — its text, its image, its link — never its layout, spacing, alignment or emphasis.`
    ]]));

  out += K.DOC_TAIL;
  return out;
}
return { build };
})();
