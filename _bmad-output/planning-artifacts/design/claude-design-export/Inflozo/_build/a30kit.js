/* A30 Members Pages — controls-reconciliation kit, 25 August 2026.
   Panel rows in A30's own drawn vocabulary (A30LIB.seg / .sel), plus the shared
   Content / Universal / Data / Editing groups the whole pass reuses. Nothing here
   is a new visual idea: rows are A30-1's drawn panel and A29's reconciled panels. */
globalThis.A30K = (function () {
const K = globalThis.A30LIB;
const { MONO, PC, seg, sel, code, b, hb } = K;
const bd = s => `<strong style="font-weight:600;color:#3A3835">${s}</strong>`;
const lab = s => `<span style="font-size:12px;font-weight:500;color:${PC.mute}">${s}</span>`;
const note = s => `<span style="font-size:11px;color:${PC.mute};line-height:1.5">${s}</span>`;
const row = inner => `<div style="display:flex;flex-direction:column;gap:5px">${inner}</div>`;
const tag = (t, c) => `<span style="font-family:${MONO};font-size:9px;color:${c || '#A2765A'};white-space:nowrap">${t}</span>`;

/* read-only / locked row */
function ro(label, value, n) {
  return row(`${lab(label)}<div style="height:36px;background:${PC.lock};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:12.5px;color:${PC.dim}">${value}</span><span style="font-size:10px;color:${PC.dim}">🔒</span></div>${note(n)}`);
}
/* an authored string · INLINE · LINK PICKER · CATALOG · FROM GHOST · P0·6 */
function txt(label, value, t, n, locked) {
  const bg = locked ? PC.lock : PC.white, col = locked ? PC.dim : PC.ink;
  return row(`${lab(label)}<div style="height:34px;background:${bg};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 11px"><span style="font-size:12px;color:${col};flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${value}</span>${tag(t, locked ? PC.dim : '#A2765A')}</div>${note(n)}`);
}
function group(title, rows) {
  return `<div style="border-top:1px solid ${PC.line};padding-top:12px;display:flex;flex-direction:column;gap:10px"><span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${PC.mute}">${title}</span>${rows.join('')}</div>`;
}
/* the P0·3 authored item list */
function itemList(o) {
  const rows = o.items.map(t =>
    `<div style="height:34px;background:${PC.white};border:1px solid ${PC.line};border-radius:8px;display:flex;align-items:center;gap:8px;padding:0 9px"><span style="font-size:11px;color:#B3ADA3">⠿</span><span style="font-size:12px;color:${PC.ink};flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t}</span><span style="font-size:11px;color:${PC.dim}">⋯</span></div>`).join('');
  return row(`<div style="display:flex;align-items:center;gap:8px">${lab(o.label || 'Included lines')}<span style="margin-left:auto;font-family:${MONO};font-size:9.5px;color:${PC.dim}">${o.range || '0–6 · 4 USED'}</span></div>
    <div style="display:flex;flex-direction:column;gap:6px">${rows}
    <div style="height:34px;border:1px dashed #D8D2C8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:${PC.mute}">${o.add || '+ Add a line'}</div></div>${note(o.note)}`);
}

/* ── the three universal rows · outside every design's own list ────────── */
const VS_STD = `Resolves 64 · 96 · 132 above and below; 80 at 834, 64 at 390 — A17's ladder. ${bd('This is the row this design called Padding')} ⚑, under its real name and counted nowhere.`;
function trio(o) {
  o = o || {};
  const rows = [];
  rows.push(o.bgLock
    ? ro('Background role', o.bgValue, o.bgNote)
    : seg('Background role', ['Background', 'Surface', 'Contrast'], o.bgActive === undefined ? 0 : o.bgActive, o.bgNote, o.bgOff));
  rows.push(o.vsLock
    ? ro('Vertical spacing', o.vsValue || 'Comfortable', o.vsNote)
    : seg('Vertical spacing', ['Compact', 'Comfortable', 'Spacious'], 1, o.vsNote || VS_STD));
  rows.push(o.tdLock
    ? ro('Top divider', o.tdValue || 'None', o.tdNote)
    : seg('Top divider', ['None', 'Line', 'Fade'], 0, o.tdNote || TD_STD));
  return group("UNIVERSAL · EVERY PLACEABLE SECTION · OUTSIDE THIS DESIGN'S LIST", rows);
}
const TD_STD = `None · Line · Fade above the section. ${bd('Default None')} ⚑ — A30 is the whole page under A1's header, and a rule between a header and a page is a second header edge.`;
const BG_PAGE = `Background · Surface · Contrast, from the pack. ${bd('The role moves the ground under the whole page')} ⚑ — head, field and rows together. ${bd('At Contrast this design does not become 5 Contrast Band')}: 5 is full-bleed and carries its own internal padding, which no role gives a page-ground design ⚑, and the accent is re-checked per pack on the darker ground.`;

/* ── the Data group · the Membership source, recut ─────────────────────── */
const D_WIRING = `Read-only, ${bd('new in this pass')} ⚑. The form carries ${code('data-members-form="signup"')} or ${code('"signin"')} and ${bd("the drawn states are Ghost's own")}: Ghost writes ${code('loading')}, ${code('success')} and ${code('error')} onto the form element, which are ${bd('sending, sent and invalid')} ⚑. Expired stays the query string's and already-signed-in is server-side. ${bd('The sign-out button carries')} ${code('data-members-signout')} ⚑ — ${bd("Ghost's only sign-out mechanism")}, and the answer to the "verify the attribute" note the frames carried.`;
const D_CODE = `Off (default) · On, ${bd('new in this pass')} ⚑. Ghost's magic-link email now carries a sign-in code as well as a link and the themed sent panel said only "check your email". At On the sent panel adds a code field and its own button, under the ${bd('sentHeading')} text. ${bd('ARCHITECT: member-form registry extension, and an endpoint to verify the code against')} ⚑ — no module in the registry verifies a code today. ${bd('No-JS:')} the field is absent from the DOM and the emailed link still works.`;
const D_TIERS = `From Ghost, visible only · From Ghost, all · Off. Reads ${code(hb('#get "tiers"'))}; ${bd('the user cannot add or remove a tier here')} ⚑ — tiers are Ghost objects and are edited in Ghost.`;
const D_IMGFOCUS = `Centre · Top · Bottom, ${bd("reachable from the Image Picker's popover and never a hidden field")} ⚑. It travels with the picture rather than the section, which is why it is listed here and not in the design's own controls — ${bd('the "field, not a control" ruling stands; the "unreachable" part of it does not')} ⚑.`;
function dataGroup(o) {
  o = o || {};
  const rows = [
    ro('Which page this is', o.role || 'Signup', `Read-only. ${bd('The template decides')} — the section reports whether it is drawing ${code('custom-signup')}, ${code('custom-signin')} or ${code('custom-account')} ⚑, and draws the matching arrangement.`),
    ro('Form wiring', 'data-members-form', D_WIRING),
    sel('Tiers', o.tiers || 'From Ghost, visible only', o.tiersHelp || D_TIERS)
  ];
  if (o.order) rows.push(sel('Order', "Ghost's own", o.orderHelp));
  rows.push(sel('After the address is sent', 'Sent panel in place', `Sent panel in place · Portal takes over. ${bd('In place is the default')} ⚑ — the themed page keeps the reader where they were; Portal's own notification is the alternative.`));
  rows.push(sel('One-time code entry', 'Off', D_CODE));
  rows.push(sel('A signed-in member on this page', 'Membership summary', `Membership summary · Send them to the account page. ${bd('Never the signup form')} ⚑ — a member who lands on ${code('/signup/')} has nothing to sign up for. ${bd('This is the category&#8217;s member-state model')}, and the reason no design carries a Member visibility row ⚑.`));
  if (o.image) {
    rows.push(sel('Image', o.imageValue || 'Upload', o.imageHelp));
    rows.push(sel('Image focus', 'Centre', D_IMGFOCUS));
  }
  rows.push(ro('Everything that changes a subscription', 'Ghost Portal', `Read-only. ${bd('Plan changes, checkout, billing, email changes and newsletter preferences are Portal&#8217;s')} ⚑ — the theme draws the trigger and Portal draws the rest. ${bd('This is the category&#8217;s boundary')} and no control moves it.`));
  if (o.tail) rows.push(note(o.tail));
  return group('THE DATA GROUP · THE MEMBERSHIP SOURCE, RECUT · IDENTICAL IN ALL THIRTEEN · NOT COUNTED', rows);
}

/* ── the Content group · the authored strings ──────────────────────────── */
const C_EYE = `Inline, ${bd('P0·1')}. Default "Membership" ⚑, 24 characters. ${bd('Clearing it brings the default back')}, which is why Eyebrow: Show · Hide now exists above.`;
const C_HEAD = `Inline, ${bd('P0·1')} — bold, italic, underline and link, the link popover carrying Open in new tab and rel nofollow · noreferrer · sponsored. 60 characters; empty draws ${code(hb('@site.title'))} with "membership" appended ⚑.`;
const C_CTA = `Inline, ${bd('P0·1')}. Default "Continue" ⚑ — not "Subscribe": a paid tier continues in Portal. ${bd('The button takes the optional icon')} from the CTA icon row above.`;
const C_NOTE = `Inline. Default as drawn ⚑ — a default, which is what Note line: Show · Hide above is for.`;
const C_LEGAL = `Inline. ${bd('Authored, never generated')} ⚑ — a theme does not know a publication's terms. ${bd('No default')}, so clearing it is how it is hidden and it needs no Show row.`;
const C_SIGNIN = `Inline, both halves. "Already a member?" · "Sign in" on /signup/; ${bd('"New here?" · "Start a membership" on /signin/')} ⚑. ${bd('The link target is the Link Picker&#8217;s')}, with Portal actions first.`;
const C_STATES = `${bd('Edited in place through P0·6')} ⚑, new in this pass: the State pill in the canvas chrome renders sent · expired · invalid · already-signed-in — and the code panel at One-time code entry: On — ${bd('in the section, so the copy is inline-editable where it shows')}. The spec's "the states are drawn rather than reached" is now reachable ⚑. ${bd('{email} and {hours} are the only tokens')}.`;
const C_PAYMENT = `Inline, ${bd('new in this pass')} ⚑. It was a fixed English literal in the template: ${bd('no card detail reaches a theme')}, so this row is the whole Payment value and a publication that does not use Stripe should be able to say so.`;
const C_ACCESS = `Inline, ${bd('new in this pass')} ⚑ — label and value both. The cancelled-but-running member's row was a hardcoded "Access · Full until then"; ${bd('it is the seventh row label')} and joins the six.`;
const C_SIGNEDIN = `Inline, ${bd('new in this pass')} ⚑. "You already have a membership. Nothing to sign up for." and the button label beside Sign out were fixed English. ${bd('Edited in the already-signed-in state')} through P0·6.`;
const C_CATALOG = `${bd('Theme translation-catalog strings, new in this pass')} ⚑ — ${code('members.status_member')}, ${code('members.status_free')}, ${code('members.status_comped')} and ${code('members.sending')}. ${bd('Not authored fields')}: the badge vocabulary and the button's sending word are system words for a state Ghost reports, not the publication's pitch ⚑, and a translated theme needs them in the catalog.`;
const C_ROWS = `Inline, ${bd('seven now')} ⚑ — Signed in as · Plan · Renews · Payment · Newsletters · Member since, ${bd('and Access')}. ${code('endsLabel')} replaces "Renews" where ${code('cancel_at_period_end')} is true.`;
const C_CODE = `Inline, ${bd('new in this pass')} ⚑ — the field label and the button beside it, drawn only at One-time code entry: On. Defaults "Or paste the code from the email" · "Sign in".`;
function contentGroup(o) {
  o = o || {};
  const rows = [
    txt('Eyebrow text', 'Membership', 'INLINE', C_EYE),
    txt('Heading', 'Read Orbit Weekly in full', 'INLINE', C_HEAD),
    txt('CTA label', 'Continue', 'INLINE', C_CTA),
    txt('Note line', 'We send a sign-in link. There is no&#8230;', 'INLINE', C_NOTE),
    txt('Legal line', 'By continuing you agree to the terms&#8230;', 'INLINE', C_LEGAL),
    txt('Sign-in prompt and link', 'Already a member? · Sign in', 'INLINE + LINK PICKER', C_SIGNIN),
    txt('State copy', 'Check your inbox · That link has&#8230;', 'P0·6 · IN PLACE', C_STATES),
    txt('Payment row text', 'Managed by Stripe', 'INLINE', C_PAYMENT),
    txt('Access row label and text', 'Access · Full until then', 'INLINE', C_ACCESS),
    txt('Already-signed-in text', 'You already have a membership&#8230;', 'INLINE', C_SIGNEDIN),
    txt('Code panel strings', 'Or paste the code from the email', 'INLINE', C_CODE),
    txt('Status and sending words', 'Member · Free · Complimentary · Sending&#8230;', 'CATALOG', C_CATALOG),
    txt('Account row labels', 'Signed in as · Plan · Renews&#8230;', 'INLINE', C_ROWS)
  ];
  const out = (o.omit || []).length
    ? rows.filter(r => !(o.omit || []).some(k => r.indexOf('>' + k + '</span>') !== -1))
    : rows;
  (o.extra || []).forEach(x => out.push(x));
  return group('CONTENT · THE AUTHORED STRINGS · EDITED ON CANVAS', out);
}

/* ── the Editing group ────────────────────────────────────────────────── */
function editingGroup(fields, extra) {
  const rows = [note(`${bd('Every authored string edits inline on canvas')} with the ${bd('P0·1')} toolbar — bold · italic · underline · link, its popover carrying ${bd('Open in new tab')} and rel ${bd('nofollow · noreferrer · sponsored')}: ${fields}. ${bd('Ghost-owned content is never inline-editable')} ⚑ — the member's name and email, the tier name, the price, the renewal date, the newsletter names and a tier's description and benefits all answer ${bd('"Edit in Ghost"')} or show P0·1's lock pill. ${bd('Every URL field opens the Ghost-aware Link Picker')}, Portal actions first. ${bd('No fixed English visitor-facing string ships')}: the rescued literals above are fields with defaults, and the badge vocabulary and sending word are catalog strings. ${bd('There is no Preview control')} in this panel and there never was one to remove — states are ${bd('P0·6')}'s switcher, audiences are View as.`)];
  (extra || []).forEach(x => rows.push(note(x)));
  return group('EDITING · THE P0 PRIMITIVES', rows);
}
const E_NOVIS = `${bd('Member Visibility lands nowhere in A30')} ⚑, and it is a judgement rather than an omission: ${bd('the route is the member state')}. A signed-in member never sees a signup form — the Data group's "A signed-in member on this page" decides what they see instead — so a section-level Everyone / Logged out / Free / Paid row would hide a page from readers the route has already sorted. ${bd('P0·4&#8217;s member-aware action editor never opens here')} for the same reason. Recorded in the Reconciliation notes.`;
const E_ICON = `${bd('The one icon slot is the primary button&#8217;s')} ⚑ — P0·2's button-icon rules: Before or After the label, always Small, always the label's colour, its Size and Colour rows hidden. ${bd('The list marker is the second')} where a design draws ticks, and it is whole-list.`;
const E_ITEMS = `${bd('benefits[] is the P0·3 authored list')} ⚑ — drag to reorder, per-row overflow with Duplicate and Remove, ${bd('Add arrives with content')} rather than an empty shell, ${bd('Remove is never disabled')}, and the range line reads ${code('0–6 · 4 used')}. ${bd('Add disables at six')} with its reason in a sentence. Per-item content only: a name and a detail edit inline, and ${bd('no per-item layout control exists')} ⚑. ${bd('Tiers are the other list and are Ghost&#8217;s')} — no Add, no Remove, no drag.`;

return { bd, lab, note, row, tag, ro, txt, group, itemList, trio, dataGroup, contentGroup, editingGroup,
  VS_STD, TD_STD, BG_PAGE, D_WIRING, D_CODE, D_IMGFOCUS, C_STATES, E_NOVIS, E_ICON, E_ITEMS };
})();
