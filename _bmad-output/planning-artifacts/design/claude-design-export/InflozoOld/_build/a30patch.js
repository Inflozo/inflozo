/* A30 · per-design panel patches. Reads globalThis.A30K (a30kit.js) and splices
   into each design's existing row list — the rows the pass does not touch keep
   their drawn help text verbatim. */
globalThis.A30P = (function () {
const K = globalThis.A30LIB, A = globalThis.A30K;
const { seg, sel, code, hb } = K;
const { bd, txt, trio, dataGroup, contentGroup, editingGroup, itemList, note } = A;

/* ── the rows every design gains ───────────────────────────────────────── */
const rEye = seg('Eyebrow', ['Show', 'Hide'], 0, `Show · Hide, ${bd('new in this pass')} ⚑. The eyebrow ships with a default — "Membership" — so ${bd('clearing the field brought the default straight back')} and the line could not be turned off at all ⚑. Twelve designs carry this row; 12 Ledger draws no eyebrow.`);
const rNote = seg('Note line', ['Show', 'Hide'], 0, `Show · Hide, ${bd('new in this pass')} ⚑. The same trap: "We send a sign-in link. There is no password to remember." is a ${bd('default')}, not a placeholder, and clearing it restored it. ${bd('The legal line needs no such row')} — it has no default, so clearing it is how it is hidden.`);
const rIcon = seg('CTA icon', ['None', 'Before', 'After'], 0, `None · Before · After, ${bd('new in this pass')} ⚑. An optional icon on the primary button from the ${bd('Icon Picker')}, under ${bd('P0·2')}'s button-icon rules — always Small, always the label's colour, its Size and Colour rows hidden. 8 px to the label.`);
const SIGNIN_BASE = `Show · Hide, ${bd('new in this pass')} ⚑ — the line was drawn untoggleable in nine of the thirteen designs. ${bd('One row, two routes')}: on /signup/ it governs "Already a member? Sign in", on /signin/ the mirror ${bd('"New here? Start a membership"')} ⚑ — a publication that could hide one and not the other would ship a page with no way back.`;
const rSignin = tail => seg('Sign-in link', ['Show', 'Hide'], 0, SIGNIN_BASE + (tail ? ' ' + tail : ''));
const MARKER_BASE = `Tick (default) · Custom icon, ${bd('new in this pass')} ⚑ — the tick was a literal ✓ with nothing governing it. Custom opens the ${bd('Icon Picker')} with its size and colour-role popover and ${bd('writes one marker for the whole list')}, never per item ⚑, which is the category's per-item refusal restated.`;
const rMarker = tail => sel('List marker', 'Tick', MARKER_BASE + (tail ? ' ' + tail : ''));
const ORDER = `Ghost's own · Price low–high · Price high–low, ${bd('new in this pass')} ⚑. ${bd('A32 Paywall has this row and A30 said "Ghost&#8217;s, and not selectable"')}, so two categories drew the same tiers under two rules. Ghost's own is the default and is the behaviour the old flag described; the two price values sort on the ${bd('period being shown')} ⚑.`;
const rOrder = sel('Order', "Ghost's own", ORDER);

const BENEFIT_ITEMS = ['Every piece, the day it goes out', 'The Tuesday note from the desk', 'The full archive back to 2019', 'Comment threads, and replies&#8230;'];
const listNote = tail => `${bd('The P0·3 authored list, named in this pass')} ⚑ — the repeating-items section covered tiers only. ${bd('Add arrives with content')} rather than an empty row, ${bd('Remove is never disabled')}, drag reorders, and per-item editing is content only: a ${bd('name (60)')} and a ${bd('detail (90)')} inline, no per-item layout ⚑. ${bd('Minimum 0, maximum 6')}; at six Add disables with its reason in a sentence.${tail ? ' ' + tail : ''}`;
const rList = tail => itemList({ items: BENEFIT_ITEMS, range: '0–6 · 4 USED', add: '+ Add a line', note: listNote(tail) });

/* ── content-group extras ─────────────────────────────────────────────── */
const cDetail = txt('Line detail', 'Tuesday, and never later than seven', 'INLINE', `Inline, 90 characters, ${bd('optional per line')}. ${bd('Drawn only by this design')} ⚑ and stored by the other twelve, so a line written here survives a switch to 1 Centred and comes back.`);
const cRail = txt('Rail labels (four)', 'Membership · Newsletters · Billing&#8230;', 'INLINE', `Inline, 24 characters each. ${bd('Labels only — the rows are fixed')} ⚑, and their targets are Portal's named panels named in the Data group below.`);
const cStep = txt('Step labels and step three', 'Choose a tier · Enter your email&#8230;', 'INLINE', `Inline, 40 characters each plus step three's 160. Defaults as drawn ⚑.`);
const cFree = txt('Free row strings', 'Not ready to pay? · Sign up free', 'INLINE', `Inline — heading, text and CTA label. ${bd('The free row is authored')} ⚑; the paid cards are Ghost's and answer "Edit in Ghost".`);
const cPeriod = txt('Period labels', 'Monthly · Yearly', 'INLINE', `Inline, 12 characters each. The toggle's two labels; ${bd('the prices under them are Ghost&#8217;s')} ⚑.`);
const cCase = txt('Case-column heading', 'Read {site title} in full', 'INLINE', `Inline, 60 characters. ${bd('A real default at last')} ⚑ — it was fixture text, so a fresh section drew lorem-shaped copy. The default is the category's own fallback shape, ${code(hb('@site.title'))} in a sentence, and it reads as a heading on a site that has typed nothing.`);
const cAlt = req => txt('Image alt text', 'The desk at seven, before the letter goes out', 'INLINE', `Inline, 120 characters. ${req ? `${bd('An empty alt is a decorative cover and is allowed')} ⚑.` : `Empty means ${code('alt=""')} — a decorative picture, which is what a mood shot beside a form usually is.`}`);

/* ── shared data-group tails ──────────────────────────────────────────── */
const TIER_LINKS = `${bd('The card buttons are Portal tier deep links, new in this pass')} ⚑ — ${code('signup/{tierId}/monthly')} and ${code('signup/{tierId}/yearly')}, and ${bd('price-toggle swaps the hrefs as well as the prices')} ⚑ (module note on the frame). The free row's CTA is plain ${code('signup')}. ${bd('Prices render through Ghost&#8217;s')} ${code(hb('price'))} ${bd('helper')} ⚑: ${code('monthly_price')} and ${code('yearly_price')} are in the smallest currency unit, so a raw print shows "600" for $6 — including in the no-JS state where both prices render side by side.`;
const RAIL_LINKS = `${bd('The rail rows open Portal&#8217;s named panels')} ⚑, new in this pass — ${code('account/plans')}, ${code('account/newsletters')} and ${code('account/profile')}. ${bd('They exist')}, which answers the spec's open question; the row's accessible name still ends "opens in Ghost's Portal" and Billing is absent on a comped membership.`;

const P = {};
const railLine = (n, count) => `A30 MEMBERS PAGES · DESIGN ${n} OF 13 · PAPER PACK · ${count} CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026`;

/* ── 1 · Centred ───────────────────────────────────────────────────────── */
P[1] = {
  count: 'NINE', quick: 'COLUMN WIDTH, INCLUDED LIST, EYEBROW, SIGN-IN LINK',
  own: r => [r[1], r[2], r[3], r[4], rSignin(), rEye, rNote, rMarker(), rIcon],
  list: rList(), trio: { bgNote: A.BG_PAGE },
  data: {}, fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, the sign-in pair, ${code('benefits[]')}, the seven row labels and every state string`,
  edit: [A.E_ITEMS, A.E_ICON, A.E_NOVIS],
  rec: `Padding retired into ${bd('Vertical spacing')} — same ladder, one row. ${bd('Eyebrow, Note line and List marker arrive')} ⚑, the sign-in row now names its mirror on /signin/, and the button takes an optional icon. ${bd('benefits[] is named as the P0·3 list')} at 0–6. The source group is recut as ${bd('the Data group')} with ${code('data-members-form')}, ${code('data-members-signout')} and ${bd('One-time code entry')} in it; four fixed English literals become fields and four become catalog strings. ${bd('Nine controls of its own.')}`,
  specCtl: `${bd('Column width')} Narrow 380 · Medium 480 · Wide 560 — ${bd('Fields')} Email only · Name and email — ${bd('Included list')} Show · Hide — ${bd('Legal line')} Show · Hide — ${bd('Sign-in link')} Show · Hide — ${bd('Eyebrow')} Show · Hide (new ⚑) — ${bd('Note line')} Show · Hide (new ⚑) — ${bd('List marker')} Tick · Custom icon (new ⚑) — ${bd('CTA icon')} None · Before · After (new ⚑). ${bd('Nine')}, plus the ${bd('P0·3')} ${code('benefits[]')} list. Then the universal trio — Background role · Vertical spacing (the old Padding) · Top divider — and the Data group, neither counted.`,
  specRec: `Padding → Vertical spacing · Eyebrow, Note line, List marker and CTA icon added · the sign-in row names its /signin/ mirror · ${code('benefits[]')} named as the P0·3 list at 0–6 · Data group carries the form attributes and One-time code entry · Payment, Access, already-signed-in and code-panel strings become fields; the status badges and "Sending…" become catalog strings.`
};

/* ── 2 · Split Pitch ───────────────────────────────────────────────────── */
P[2] = {
  count: 'TEN', quick: 'CASE COLUMN, FORM SIDE, INCLUDED LIST, EYEBROW',
  own: r => [r[1], r[2], r[3], r[4], r[5], rSignin('Under the form in both Form side values ⚑.'), rEye, rNote, rMarker('Shown at Included list: Ticks; the numbered treatment uses the mono ordinal instead ⚑.'), rIcon],
  list: rList('The numbered treatment is designed for four lines.'), trio: { bgNote: A.BG_PAGE },
  data: {}, content: { extra: [cCase] },
  fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, ${code('benefits[]')} and every state string`,
  edit: [A.E_ITEMS, A.E_ICON, A.E_NOVIS],
  rec: `${bd('The case-column heading gets a real default')} ⚑ — it was fixture text, so a fresh section was lorem-shaped; the default is ${code(hb('@site.title'))} in the category's own fallback sentence. Padding retired into ${bd('Vertical spacing')}; ${bd('Eyebrow, Note line, Sign-in link, List marker and CTA icon')} arrive; ${code('benefits[]')} is named as the ${bd('P0·3')} list. Data group recut with the form attributes and One-time code entry. ${bd('Ten controls of its own.')}`,
  specCtl: `${bd('Case column')} Wide 700 · Half 636 — ${bd('Form side')} Right · Left — ${bd('Included list')} Numbered rows · Ticks · Hide — ${bd('Fields')} — ${bd('Legal line')} — ${bd('Sign-in link')} Show · Hide (new ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('List marker')} (new ⚑, at Ticks) — ${bd('CTA icon')} (new ⚑). ${bd('Ten')}, plus the P0·3 list. Then the trio and the Data group.`,
  specRec: `The case-column heading gets a real default ⚑ · Padding → Vertical spacing · Eyebrow, Note line, Sign-in link, List marker, CTA icon added · ${code('benefits[]')} named as the P0·3 list at 0–6 · Data group carries the form attributes and One-time code entry · the rescued literals and catalog strings as 1 Centred.`
};

/* ── 3 · Card ──────────────────────────────────────────────────────────── */
P[3] = {
  count: 'NINE', quick: 'CARD WIDTH, CARD DEPTH, INCLUDED LIST, SIGN-IN LINK',
  own: r => [r[1], r[2], r[3], r[4],
    sel('Sign-in link', 'Inside the card', `Inside the card · Below the card · ${bd('Hide')} ⚑ — the third value is new in this pass; the row was a placement with no off. ${bd('One row, two routes')}: the mirror "New here? Start a membership" on /signin/ ⚑.`),
    rEye, rNote, rMarker('Three lines inside the card; a fourth is stored and not drawn ⚑.'), rIcon],
  list: rList('Three lines are drawn inside the card and a fourth is stored ⚑ — the P0·3 partial-display line reads it out: "4 items · 3 shown in this design".'),
  trio: { bgNote: `Background · Surface · Contrast. ${bd('Surface is disabled with its reason shown')} ⚑ — the card's own plane is one step above the ground, and at Surface the two are the same tone and the card disappears. ${bd('At Contrast the card carries the inverted plane')} and the accent is re-checked per pack.`, bgOff: [1] },
  data: {}, fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, ${code('benefits[]')} and every state string`,
  edit: [A.E_ITEMS, A.E_ICON, A.E_NOVIS],
  rec: `${bd('Sign-in link gains Hide')} ⚑ — it was a placement control with no off, which the patch counted as one of the nine untoggleable lines. Padding retired into ${bd('Vertical spacing')}, and ${bd('Surface is disabled in Background role')} with the card-on-surface reason shown. ${bd('Eyebrow, Note line, List marker and CTA icon')} arrive; ${code('benefits[]')} is the ${bd('P0·3')} list with its partial-display line. ${bd('Nine controls of its own.')}`,
  specCtl: `${bd('Card width')} Narrow 480 · Medium 560 · Wide 680 — ${bd('Card depth')} Raised · Flat — ${bd('Included list')} Inside the card · Below the card · Hide — ${bd('Fields')} — ${bd('Sign-in link')} Inside the card · Below the card · ${bd('Hide')} (new value ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('List marker')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Nine')}, plus the P0·3 list. Then the trio — ${bd('Background role with Surface disabled')} ⚑ — and the Data group.`,
  specRec: `Sign-in link gains Hide ⚑ · Padding → Vertical spacing · Background role offered with Surface disabled and the reason shown ⚑ · Eyebrow, Note line, List marker, CTA icon added · ${code('benefits[]')} named as the P0·3 list with its partial-display line · Data group carries the form attributes and One-time code entry.`
};

/* ── 4 · Panel ─────────────────────────────────────────────────────────── */
P[4] = {
  count: 'TEN', quick: 'PLANE WIDTH, PLANE DEPTH, INCLUDED ROW, EYEBROW',
  own: r => [r[1], r[2], r[3], r[4], r[5], rSignin(), rEye, rNote, rMarker('The four-up row draws ticks at Two up and mono ordinals at Four up ⚑ — the marker governs the ticks.'), rIcon],
  list: rList('Four lines is what the row is designed for; three draws three columns left-aligned.'),
  trio: { bgLock: true, bgValue: 'Background', bgNote: `${bd('Locked at Background')} ⚑, with the reason shown: ${bd('the plane is this design&#8217;s ground')} and the page behind it has to stay one step below it. At Surface the plane and the page are the same tone and the design is 1 Centred with extra padding. A26·3 and A27·4's call, carried.` },
  data: {}, fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, ${code('benefits[]')} and every state string`,
  edit: [A.E_ITEMS, A.E_ICON, A.E_NOVIS],
  rec: `Padding retired into ${bd('Vertical spacing')} and ${bd('Background role is locked at Background')} ⚑ with the plane-is-the-ground reason in the row. ${bd('Sign-in link, Eyebrow, Note line, List marker and CTA icon')} arrive; ${code('benefits[]')} is named as the ${bd('P0·3')} list. Data group recut with the form attributes and One-time code entry. ${bd('Ten controls of its own.')}`,
  specCtl: `${bd('Plane width')} Content box 1,296 · Held 1,040 — ${bd('Plane depth')} Raised · Flat — ${bd('Included row')} Four up · Two up · Hide — ${bd('Fields')} — ${bd('Legal line')} — ${bd('Sign-in link')} (new ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('List marker')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Ten')}, plus the P0·3 list. Then the trio — ${bd('Background role locked at Background')} ⚑ — and the Data group.`,
  specRec: `Padding → Vertical spacing · Background role locked at Background, the plane being the ground ⚑ · Sign-in link, Eyebrow, Note line, List marker, CTA icon added · ${code('benefits[]')} named as the P0·3 list · Data group carries the form attributes and One-time code entry.`
};

/* ── 5 · Contrast Band ─────────────────────────────────────────────────── */
P[5] = {
  count: 'ELEVEN', quick: 'BAND PADDING, BAND WIDTH, BUTTON, INCLUDED LIST',
  own: r => [r[0], r[1], r[2], r[3], r[4], r[5], rSignin('Carried colour, underlined, never the accent ⚑.'), rEye, rNote, rMarker('The tick is the carried colour at 72 %; a custom icon takes the same role ⚑ — Accent is disabled in the icon popover here for the same 4.0:1 reason as the button.'), rIcon],
  list: rList(), 
  trio: { bgLock: true, bgValue: 'Contrast', bgNote: `${bd('Locked at Contrast')} ⚑, with the reason shown: ${bd('the inverted band is the design')}. At Background or Surface this is 1 Centred and 4 Panel, which both exist. ${bd('The lock is why the accent value on Button is disabled')} rather than conditional — the ground cannot change under it.`,
    vsLock: true, vsValue: 'Resolves to 0', vsNote: `${bd('Resolves to 0 at every value')} ⚑ — ${bd('the band carries its own padding')} and ${bd('Band padding')} above is the real ladder, which is why that row keeps its own name instead of being retired. The band's edges are the section's edges.`,
    tdLock: true, tdValue: 'None', tdNote: `${bd('Locked at None')} ⚑ — a rule above a full-bleed inverted band is a second edge on the same line. Recorded in the Reconciliation notes as one of the two places a universal row is locked off.` },
  data: {}, fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, ${code('benefits[]')} and every state string`,
  edit: [A.E_ITEMS, `${A.E_ICON} ${bd('On the band the icon&#8217;s Accent colour role is disabled at 4.0:1')} ⚑ — P0·2's rule that a role failing AA on its ground is disabled with its ratio shown, met here for the first time.`, A.E_NOVIS],
  rec: `${bd('Band padding keeps its name')} ⚑ — it is the band's internal ladder, not the section's, and the universal ${bd('Vertical spacing')} is locked at 0 beside it with that reason shown. ${bd('Background role is locked at Contrast')} and ${bd('Top divider at None')} ⚑. ${bd('Sign-in link, Eyebrow, Note line, List marker and CTA icon')} arrive, and the icon's Accent role is disabled at 4.0:1 like the button's. ${bd('Eleven controls of its own.')}`,
  specCtl: `${bd('Band padding')} Compact · Comfortable · Spacious (${bd('kept')} — it is the band's own ladder ⚑) — ${bd('Band width')} Full bleed · Content box — ${bd('Alignment')} Centred · Left — ${bd('Button')} Carried fill · Outline · <s>Accent</s>, disabled at 4.0:1 ⚑ — ${bd('Included list')} — ${bd('Fields')} — ${bd('Sign-in link')} (new ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('List marker')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Eleven')}, plus the P0·3 list. Then the trio, ${bd('all three rows locked')} ⚑ — Background role at Contrast, Vertical spacing resolving to 0, Top divider at None — and the Data group.`,
  specRec: `Band padding kept as a genuinely different ladder ⚑, with Vertical spacing locked at 0 beside it · Background role locked at Contrast and Top divider at None ⚑ · Sign-in link, Eyebrow, Note line, List marker, CTA icon added · the icon's Accent role disabled at 4.0:1 like the button's · Data group carries the form attributes and One-time code entry.`
};

/* ── 6 · Cover ─────────────────────────────────────────────────────────── */
P[6] = {
  count: 'TEN', quick: 'COVER HEIGHT, SCRIM, ALIGNMENT, ACCOUNT BAND',
  own: r => [r[0], seg('Scrim', ['Light 30', 'Medium 45', 'Heavy 60'], 1, `A flat wash of the pack's text colour. ${bd('Never a gradient, never black')} ⚑ — A20·13's rule. ${bd('The three values are still checked against the striped placeholder rather than a photograph')} ⚑ — the flag stays on the frame and this row: ${bd('re-check all three against a real image before build')}.`), r[2], r[3], r[4], r[5], rSignin('Carried white, underlined, over the scrim ⚑.'), rEye, rNote, rIcon],
  trio: { bgLock: true, bgValue: 'Image', bgNote: `${bd('Locked at Image')} ⚑, with the reason shown: ${bd('the photograph is the ground')} and every colour on it is derived from the carried white. A role that replaced the picture would replace the design — ${bd('and with no picture the design hands off to 1 Centred')} rather than falling back to a role.`,
    vsLock: true, vsValue: 'Resolves to 0', vsNote: `${bd('Resolves to 0 at every value')} ⚑ — ${bd('the cover carries its own padding')} and ${bd('Cover height')} above is the ladder that matters. Kept as its own row for the same reason 5's Band padding is.`,
    tdLock: true, tdValue: 'None', tdNote: `${bd('Locked at None')} ⚑ — a rule above a full-bleed photograph is a line on a picture.` },
  data: { image: true, imageValue: 'Upload · required', imageHelp: `Upload. ${bd('Required in this design')} ⚑ — ${bd('there is no post feature image to fall back to on a members page')}, which is why the field is required here and optional in 7 Image Split. ${bd('At ≥ 2,400 px')} ⚑; with none the design hands off to 1 Centred, flagged in the editor and invisible on the site.` },
  content: { extra: [cAlt(true)] },
  fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, ${code('imageAlt')} and every state string`,
  edit: [A.E_ICON, A.E_NOVIS, `${bd('benefits[] is stored and not drawn here')} ⚑, so ${bd('P0·3 never opens in this design')} — a tick list over a photograph is two things competing for the same scrim. The field survives a switch to 1 Centred with everything in it.`],
  rec: `${bd('The scrim values keep their verify-against-a-real-photograph flag')} ⚑ — on the frame and now in the row itself. ${bd('All three universal rows are locked')}: Background role at Image, Vertical spacing at 0 (the cover carries its padding, and Cover height is the ladder), Top divider at None. ${bd('Sign-in link, Eyebrow, Note line and CTA icon')} arrive; ${bd('Image focus joins the Data group')} as an Image Picker popover row rather than a hidden field ⚑. ${bd('Ten controls of its own.')}`,
  specCtl: `${bd('Cover height')} Compact 480 · Comfortable 620 · Tall 760 — ${bd('Scrim')} Light 30 · Medium 45 · Heavy 60 (${bd('the verify-against-a-photograph flag is in the row')} ⚑) — ${bd('Alignment')} Centred · Left — ${bd('Fields')} — ${bd('Legal line')} — ${bd('Account band')} Picture band 200 · No picture — ${bd('Sign-in link')} (new ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Ten.')} Then the trio, ${bd('all three locked')} ⚑, and the Data group, where ${bd('Image and Image focus')} now sit.`,
  specRec: `The scrim's verify-against-a-real-photograph flag is now in the control row as well as on the frame ⚑ · all three universal rows locked, each with its reason shown · Sign-in link, Eyebrow, Note line, CTA icon added · Image focus reachable in the Image Picker popover, drawn in the Data group ⚑ · Data group carries the form attributes and One-time code entry.`
};

/* ── 7 · Image Split ───────────────────────────────────────────────────── */
P[7] = {
  count: 'TEN', quick: 'PICTURE SIDE, TEXT COLUMN, PICTURE CROP, INCLUDED LIST',
  own: r => [r[1], r[2], r[3], r[4], r[5], rSignin(), rEye, rNote, rMarker('Hidden with the list at ≤ 767 ⚑.'), rIcon],
  list: rList('Three lines are drawn beside the form; the list is hidden at ≤ 767 ⚑ and the lines are stored.'),
  trio: { bgNote: `${A.BG_PAGE} ${bd('The picture column is unaffected')} — it runs to the viewport edge on every role.` },
  data: { image: true, imageValue: 'Upload', imageHelp: `Upload · Off. ${bd('Optional here and required in 6 Cover')} ⚑ — the same field, two obligations, because with no picture this design is still a form on a page and 6 is a scrim over nothing. ${bd('At ≥ 1,600 px')} ⚑; with none the text column takes the content box.` },
  content: { extra: [cAlt(false)] },
  fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, ${code('benefits[]')}, ${code('imageAlt')} and every state string`,
  edit: [A.E_ITEMS, A.E_ICON, A.E_NOVIS],
  rec: `Padding retired into ${bd('Vertical spacing')}. ${bd('Sign-in link, Eyebrow, Note line, List marker and CTA icon')} arrive; ${code('benefits[]')} is the ${bd('P0·3')} list; ${bd('Image focus joins the Data group')} beside the Image row ⚑ rather than living as a hidden field. Data group recut with the form attributes and One-time code entry. ${bd('Ten controls of its own.')}`,
  specCtl: `${bd('Picture side')} Right · Left — ${bd('Text column')} Narrow 480 · Medium 560 · Wide 640 — ${bd('Picture crop')} Fill the column · Sixteen by nine — ${bd('Included list')} Show · Hide — ${bd('Fields')} — ${bd('Sign-in link')} (new ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('List marker')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Ten')}, plus the P0·3 list. Then the trio and the Data group, where ${bd('Image and Image focus')} sit.`,
  specRec: `Padding → Vertical spacing · Sign-in link, Eyebrow, Note line, List marker, CTA icon added · ${code('benefits[]')} named as the P0·3 list · Image focus reachable in the Image Picker popover ⚑ · Data group carries the form attributes and One-time code entry.`
};

/* ── 8 · Tiers ─────────────────────────────────────────────────────────── */
P[8] = {
  count: 'TEN', quick: 'PERIOD TOGGLE, CARD TREATMENT, MARKED TIER, ORDER',
  own: r => [r[1], r[2], r[3], r[4], r[5], rOrder, rSignin('Under the free row, on the page ground ⚑.'), rEye, rMarker("The tick beside a tier's benefits. Whole-list ⚑ — one marker for every card, never one per tier, because the benefits are Ghost's."), rIcon],
  trio: { bgNote: `${A.BG_PAGE} ${bd('The cards keep their own plane one step above whatever the role is')} ⚑ — Card treatment above is what changes them.` },
  data: { order: true, orderHelp: ORDER, tail: TIER_LINKS },
  content: { omit: ['Note line'], extra: [cFree, cPeriod, txt('Tier note', 'Prices in USD. Cancel whenever you like.', 'INLINE', `Inline, 90 characters, under the cards. ${bd('The tier names, prices, descriptions and benefits are Ghost&#8217;s')} ⚑ and answer "Edit in Ghost".`)] },
  fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('legal')}, ${code('tierNote')}, the free row's three strings, ${code('periodLabels')} and every state string`,
  edit: [`${bd('The tier cards are the P0·3 Ghost-sourced list')} ⚑ — no Add, no Remove, no drag, a "From Ghost" mark and the sentence that says tiers are edited in Ghost. ${bd('Order and the Data group&#8217;s Tiers row are its whole control surface')}, which is P0·3's rule for a queried list. ${bd('The free row beneath is authored')} and is not part of it.`, A.E_ICON, A.E_NOVIS],
  rec: `${bd('The card buttons are wired')} ⚑: Portal tier deep links ${code('signup/{tierId}/monthly')} and ${code('/yearly')}, with ${bd('price-toggle swapping hrefs as well as prices')}, the free row's CTA going to plain ${code('signup')}, and ${bd('prices rendering through')} ${code(hb('price'))} because the raw fields are in the smallest currency unit. ${bd('Order arrives')} ⚑ and matches A32's row. ${bd('Eyebrow, Sign-in link, List marker and CTA icon')} arrive; Padding retires into ${bd('Vertical spacing')}. ${bd('Ten controls of its own.')}`,
  specCtl: `${bd('Period toggle')} Monthly and yearly · Monthly only · Yearly only — ${bd('Card treatment')} Raised · Flat · Hairline rows — ${bd('Marked tier')} Middle · Highest · None — ${bd('Benefits per card')} Two · Three · All — ${bd('Free row')} Show · Hide — ${bd('Order')} Ghost's own · Price low–high · Price high–low (new ⚑, and A32's row) — ${bd('Sign-in link')} (new ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('List marker')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Ten.')} ${bd('No Note line row')} — this design draws no note. Then the trio and the Data group, where the tier deep links and the ${code(hb('price'))} helper are named.`,
  specRec: `Card buttons wired to Portal tier deep links, price-toggle swapping hrefs as well as prices, the free row to plain ${code('signup')} ⚑ · prices through Ghost's ${code(hb('price'))} helper, the raw fields being in the smallest currency unit ⚑ · Order added, matching A32 ⚑ · Padding → Vertical spacing · Eyebrow, Sign-in link, List marker, CTA icon added · tiers named as P0·3's Ghost-sourced list with no Add.`
};

/* ── 9 · Big Type ──────────────────────────────────────────────────────── */
P[9] = {
  count: 'EIGHT', quick: 'HEADING SIZE, ALIGNMENT, FORM, BLURB',
  own: r => [r[1], r[2], r[3], r[4], rSignin(), rEye, rNote, rIcon],
  trio: { bgNote: `${A.BG_PAGE} ${bd('The sentence is not re-weighted by the role')} ⚑ — the dark-mode weight judgement is the pack's, not this row's.` },
  data: {},
  fields: `${code('eyebrow')}, ${code('heading')} (capped at 60 ⚑), ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')} and every state string`,
  edit: [A.E_ICON, A.E_NOVIS, `${bd('benefits[] is stored and not drawn')} ⚑ — ${bd('P0·3 never opens here')} — and the field survives a switch to 1 Centred intact. ${bd('The heading&#8217;s 60-character cap is the editor&#8217;s')} ⚑: P0·1 marks work inside it, and bold renders the pack's heavier heading weight rather than faux-bold.`],
  rec: `Padding retired into ${bd('Vertical spacing')}. ${bd('Eyebrow, Note line and CTA icon')} arrive, and the sign-in row now names its mirror on /signin/. No list controls: ${code('benefits[]')} is stored and not drawn, so ${bd('P0·3 never opens')} ⚑. Data group recut with the form attributes and One-time code entry — ${bd('at 96 px the state panels still hold the 13 px ladder')} ⚑. ${bd('Eight controls of its own.')}`,
  specCtl: `${bd('Heading size')} Large 76 · Display 96 · Huge 132 — ${bd('Alignment')} Left · Centred — ${bd('Form')} Inline row · Stacked — ${bd('Blurb')} Below the field · Hide — ${bd('Sign-in link')} Show · Hide — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Eight.')} Then the trio — Vertical spacing is the old Padding — and the Data group. ${bd('The type ladder is never scaled by the heading control')} ⚑.`,
  specRec: `Padding → Vertical spacing · Eyebrow, Note line, CTA icon added · the sign-in row names its /signin/ mirror · no P0·3 list, ${code('benefits[]')} being stored and not drawn ⚑ · Data group carries the form attributes and One-time code entry.`
};

/* ── 10 · Boxed ────────────────────────────────────────────────────────── */
P[10] = {
  count: 'NINE', quick: 'BOX WIDTH, INTERNAL RULES, INCLUDED LIST, SIGN-IN LINK',
  own: r => [r[1], r[2], r[3], r[4], rSignin('In the box, under the rule ⚑.'), rEye, rNote, rMarker('In the third compartment, where the label defaults to "Included" ⚑.'), rIcon],
  list: rList('The third compartment is short, which is why ${benefitsLabel} defaults to "Included" here.'.replace('${benefitsLabel}', code('benefitsLabel'))),
  trio: { bgNote: `${A.BG_PAGE} ${bd('The box has no fill')} ⚑, so every role shows through it and only the hairline moves — which is the difference between this design and 3 Card.` },
  data: {}, fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, ${code('benefits[]')}, ${code('benefitsLabel')} and every state string`,
  edit: [A.E_ITEMS, A.E_ICON, A.E_NOVIS],
  rec: `Padding retired into ${bd('Vertical spacing')}. ${bd('Eyebrow, Note line, List marker and CTA icon')} arrive and the sign-in row names its mirror; ${code('benefits[]')} is the ${bd('P0·3')} list. ${bd('Background role is offered in full')} ⚑ — the box has no fill, so the role shows through it and nothing collides. Data group recut with the form attributes and One-time code entry. ${bd('Nine controls of its own.')}`,
  specCtl: `${bd('Box width')} Held 720 · Wide 960 · Content box 1,296 — ${bd('Internal rules')} Show · Hide — ${bd('Included list')} Third compartment · Hide — ${bd('Fields')} — ${bd('Sign-in link')} Show · Hide — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('List marker')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Nine')}, plus the P0·3 list. Then the trio — ${bd('Background role offered in full, the box having no fill')} ⚑ — and the Data group.`,
  specRec: `Padding → Vertical spacing · Eyebrow, Note line, List marker, CTA icon added · the sign-in row names its /signin/ mirror · ${code('benefits[]')} named as the P0·3 list, ${code('benefitsLabel')} still defaulting to "Included" here · Data group carries the form attributes and One-time code entry.`
};

/* ── 11 · Rail ─────────────────────────────────────────────────────────── */
P[11] = {
  count: 'NINE', quick: 'RAIL SIDE, RAIL WIDTH, RAIL STICKS, RAIL MARKS',
  own: r => [r[1], r[2], r[3], r[4], r[5], rSignin('Under the form in the content column ⚑, never in the rail.'), rEye, rNote, rIcon],
  list: rList('On /signup/ these lines are the rail; six is the cap and a seventh is stored and not drawn ⚑. The /account/ rail is fixed and is not this list.'),
  trio: { bgNote: `${A.BG_PAGE} ${bd('The rail has no plane of its own')} ⚑ — that is what keeps it from reading as a sidebar card — so the role moves rail and content together.` },
  data: { tail: RAIL_LINKS },
  content: { extra: [cRail] },
  fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, ${code('benefits[]')}, the four ${code('railLabels')} and every state string`,
  edit: [A.E_ITEMS, A.E_ICON, A.E_NOVIS, `${bd('The /account/ rail&#8217;s rows are fixed and are not an item list')} ⚑ — their labels are editable, their targets are Portal's named panels, and Billing is absent on a comped membership. ${bd('Their accessible names end "opens in Ghost&#8217;s Portal"')}.`],
  rec: `${bd('The rail&#8217;s rows are wired')} ⚑ — ${code('account/plans')}, ${code('account/newsletters')} and ${code('account/profile')}, Portal's named panels, which ${bd('exist')}: the spec's open question is answered and the two rows that assumed it are no longer assuming. Padding retired into ${bd('Vertical spacing')}; ${bd('Sign-in link, Eyebrow, Note line and CTA icon')} arrive; the /signup/ rail is named as the ${bd('P0·3')} list. ${bd('Nine controls of its own.')}`,
  specCtl: `${bd('Rail side')} Left · Right — ${bd('Rail width')} Narrow 200 · Medium 240 — ${bd('Rail sticks')} On · Off — ${bd('Rail marks')} Show · Hide — ${bd('Fields')} — ${bd('Sign-in link')} (new ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Nine')}, plus the P0·3 list, which is the /signup/ rail. Then the trio and the Data group, where ${bd('Portal&#8217;s named panels')} are named ⚑.`,
  specRec: `Billing, Newsletters and Profile wired to Portal's named panels — ${code('account/plans')}, ${code('account/newsletters')}, ${code('account/profile')} — answering the spec's open question ⚑ · Padding → Vertical spacing · Sign-in link, Eyebrow, Note line, CTA icon added · the /signup/ rail named as the P0·3 list at 0–6.`
};

/* ── 12 · Ledger ───────────────────────────────────────────────────────── */
P[12] = {
  count: 'SIX', quick: 'ROW DENSITY, ORDINALS, ROW DETAIL, FORM POSITION',
  own: r => [r[1], r[2], r[3], r[4], rSignin('Beside the price sentence at the foot ⚑.'), rIcon],
  list: rList(`${bd('0–6 here, not 2–6')} ⚑ — the design's own row said two minimum while its empty state already described nought lines; the category's range wins and the editor note at one or two lines stays ("the arrangement wants four or more").`),
  trio: { bgNote: `${A.BG_PAGE} ${bd('The rules are the items&#8217; own edges')} ⚑ and take the role's hairline with them.` },
  data: {},
  content: { omit: ['Eyebrow text', 'Note line'], extra: [cDetail] },
  fields: `${code('heading')}, ${code('blurb')} (the price sentence ⚑), ${code('ctaLabel')}, ${code('legal')}, ${code('benefits[]')} names and details, and every state string`,
  edit: [A.E_ITEMS, A.E_ICON, A.E_NOVIS, `${bd('This design draws no eyebrow and no note')} ⚑, so neither row appears — the two traps the pass fixed elsewhere do not exist here, and the panel says so rather than showing a control that governs nothing.`],
  rec: `${bd('The item list becomes 0–6')} ⚑ — the row said two minimum and the empty state described nought, which was the design contradicting itself; and it is now named as the ${bd('P0·3')} list with the ${bd('detail (90)')} field it alone draws. Padding retired into ${bd('Vertical spacing')}; ${bd('Sign-in link and CTA icon')} arrive. ${bd('No Eyebrow or Note line row')}: this design draws neither ⚑. ${bd('Six controls of its own.')}`,
  specCtl: `${bd('Row density')} Compact · Comfortable · Spacious — ${bd('Ordinals')} Numerals · Rules only — ${bd('Row detail')} One line · Name only — ${bd('Form position')} At the foot · At the head — ${bd('Sign-in link')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Six')}, plus the ${bd('P0·3')} list, now ${bd('0–6')} rather than 2–6 ⚑. ${bd('No Eyebrow or Note line row')} — this design draws neither ⚑. Then the trio and the Data group.`,
  specRec: `The item list is 0–6, not 2–6 ⚑ — the control and the empty state disagreed · named as the P0·3 list, with the detail field this design alone draws · Padding → Vertical spacing · Sign-in link and CTA icon added · no Eyebrow or Note line row, neither being drawn here.`
};

/* ── 13 · Steps ────────────────────────────────────────────────────────── */
P[13] = {
  count: 'TEN', quick: 'PLANE WIDTH, STEP NUMBERS, STEP ONE, ORDER',
  own: r => [r[1], r[2], r[3], r[4], r[5], rOrder, rSignin('Under step 02, inside the plane ⚑.'), rEye, rNote, rIcon],
  trio: { bgLock: true, bgValue: 'Background', bgNote: `${bd('Locked at Background')} ⚑, with the reason shown: ${bd('the plane is the design&#8217;s ground')} and the page around a 1,040 plane has to stay one step below it. 4 Panel's lock, carried for the same reason.` },
  data: { order: true, orderHelp: `${ORDER} ${bd('Step one&#8217;s two-tier default reads it')} ⚑ — "free and the lowest paid" is the first paid tier in whatever order this row sets.`, tail: `${bd('Step 01&#8217;s tier links are Portal tier deep links')} ⚑, new in this pass — ${code('signup/{tierId}')}, the same as 8 Tiers' card buttons. ${bd('They are links and not radios')}, because choosing one navigates to Portal. ${bd('Prices render through Ghost&#8217;s')} ${code(hb('price'))} ${bd('helper')} ⚑ for the same smallest-currency-unit reason.` },
  content: { extra: [cStep] },
  fields: `${code('eyebrow')}, ${code('heading')}, ${code('blurb')}, ${code('ctaLabel')}, ${code('note')}, ${code('legal')}, the three ${code('stepLabels')}, ${code('stepThreeText')} and every state string`,
  edit: [A.E_ICON, A.E_NOVIS, `${bd('The tier boxes in step 01 are the P0·3 Ghost-sourced list')} ⚑ — no Add, no Remove, no drag; Step one and Order are its whole control surface. ${bd('benefits[] is stored and not drawn')}, so the authored list never opens here.`],
  rec: `${bd('Step 01&#8217;s tier links are wired')} ⚑ — ${code('signup/{tierId}')}, the same Portal deep links as 8 Tiers, with prices through ${code(hb('price'))}. ${bd('Order arrives')} and matches 8 and A32 ⚑. ${bd('Background role is locked at Background')} with the plane-is-the-ground reason. ${bd('Sign-in link, Eyebrow, Note line and CTA icon')} arrive; Padding retires into ${bd('Vertical spacing')}. ${bd('Ten controls of its own.')}`,
  specCtl: `${bd('Plane width')} Held 1,040 · Content box 1,296 · Narrow 720 — ${bd('Step numbers')} Numerals · Dots · Hide — ${bd('Step one')} Two tiers · Every tier · Hide — ${bd('Step three')} Show · Hide — ${bd('Fields')} — ${bd('Order')} Ghost's own · Price low–high · Price high–low (new ⚑) — ${bd('Sign-in link')} (new ⚑) — ${bd('Eyebrow')} (new ⚑) — ${bd('Note line')} (new ⚑) — ${bd('CTA icon')} (new ⚑). ${bd('Ten.')} Then the trio — ${bd('Background role locked at Background')} ⚑ — and the Data group, where the tier deep links are named.`,
  specRec: `Step 01's tier links wired to ${code('signup/{tierId}')}, as 8 Tiers ⚑, with prices through the ${code(hb('price'))} helper · Order added, matching 8 and A32 ⚑ · Background role locked at Background, the plane being the ground · Padding → Vertical spacing · Sign-in link, Eyebrow, Note line, CTA icon added.`
};

/* build the full row list for a design */
function rows(n, existing) {
  const p = P[n];
  const out = p.own(existing).slice();
  if (p.list) out.push(p.list);
  out.push(contentGroup(p.content || {}));
  out.push(trio(p.trio || {}));
  return out;
}
return { P, rows, railLine, dataOf: n => P[n].data || {},
  tailOf: n => editingGroup(P[n].fields, P[n].edit) };
})();
