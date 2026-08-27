// A32-0 Category Proof — settlements, the cut anatomised, tokenisation proof, stress frames,
// roster, shared field list, component inventory, findings.
globalThis.A32PROOF = (function () {
const K = globalThis.A32LIB, P = globalThis.A32PAGE;
const { L, D, MONO, PACKS, PK, b, code, cap, note, section, tile, table, gap, GATE, ARTICLE } = K;

/* ── the tokenisation proof · 2 Card in three packs, light and dark ────── */
function proofCell(pk, dark) {
  const t = dark ? pk.d : pk.l;
  const g = K.ground(t, 'surface', pk);
  const gp = K.ground(t, 'page', pk);
  const para = (txt, last) => `<p style="margin:0${last ? '' : ' 0 16px'};font-size:15px;line-height:1.7;color:${gp.text};font-family:${pk.body};text-wrap:pretty">${txt}</p>`;
  const faded = `<div style="position:relative">${para(ARTICLE.paras[1], true)}<div style="position:absolute;left:0;right:0;bottom:-1px;height:96px;background:linear-gradient(to bottom,${K.rgb0(t.bg)} 0%,${t.bg} 100%)"></div></div>`;
  const card = `<div style="width:100%;background:${g.bg};border:1px solid ${g.border};border-radius:${pk.r + 4}px;${dark ? '' : `box-shadow:${t.shadow};`}padding:22px;box-sizing:border-box;display:flex;flex-direction:column">
    <span style="font-size:12.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};font-family:${pk.body}">${GATE.paid.eyebrow}</span>
    <div style="height:10px"></div>
    <span style="font-family:${pk.head};font-size:24px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:${g.text}">${GATE.paid.heading}</span>
    <div style="height:12px"></div>
    <span style="font-size:14px;line-height:1.6;color:${g.muted};font-family:${pk.body}">Everything we publish, the Tuesday note, and the archive back to 2019.</span>
    <div style="height:18px"></div>
    <div style="display:flex;align-items:center;gap:18px">${K.btn(g, { label:GATE.paid.cta, pack:pk, h:44, px:20 })}
      <span style="font-size:13.5px;color:${g.muted};font-family:${pk.body}">Already a member? <span style="color:${g.text};text-decoration:underline;text-underline-offset:3px">Sign in</span></span></div></div>`;
  return `<div style="display:flex;flex-direction:column;gap:8px">
    <span style="font-family:${MONO};font-size:11px;color:#6E6A64">${pk.name.toUpperCase()} · ${dark ? 'DARK' : 'LIGHT'} · RADIUS ${pk.r} · ${pk.head.replace(/'/g, '').split(',')[0].toUpperCase()}</span>
    <div style="background:${t.bg};border-radius:${pk.r + 6}px;padding:24px;box-sizing:border-box;width:640px;${dark ? `border:1px solid ${t.border};` : 'box-shadow:0 6px 22px rgba(28,27,26,.10);'}">
      ${para(ARTICLE.paras[0], false)}${faded}<div style="height:48px"></div>${card}</div></div>`;
}

/* ── the cut, anatomised ──────────────────────────────────────────────── */
function cutAnatomy() {
  const t = L, g = K.ground(t, 'page');
  const lane = (label, inner, o) => `<div style="display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-top:1px solid ${g.border}">
    <span style="width:210px;flex-shrink:0;font-family:${MONO};font-size:10px;line-height:1.6;color:${o === 'dim' ? '#B0A79A' : '#6E6A64'}">${label}</span>
    <div style="flex:1;min-width:0">${inner}</div></div>`;
  const line = (w, dim) => `<span style="display:block;height:11px;border-radius:3px;background:${dim ? '#F1EDE6' : '#E4DDD1'};width:${w}%;margin-bottom:7px"></span>`;
  const dashed = `<div style="border:1px dashed #D9D0C2;border-radius:6px;padding:12px;display:flex;flex-direction:column;gap:8px">
    <span style="font-family:${MONO};font-size:10px;color:#B0A79A">NOT IN THE DOCUMENT · NOT IN THE RESPONSE · NOT ANYWHERE THE BROWSER CAN REACH ⚑</span>
    ${line(94, true)}${line(88, true)}${line(52, true)}</div>`;
  return `<div style="width:1288px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:22px;box-sizing:border-box;display:flex;flex-direction:column">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.05em;color:#6E6A64;padding-bottom:12px">WHAT THE BROWSER RECEIVES AT A MEMBERS-ONLY CUT</span>
    ${lane('GHOST’S PREVIEW<br>SENT AS HTML', `${line(97)}${line(93)}${line(96)}${line(61)}`)}
    ${lane('THE LAST VISIBLE BLOCK<br>THE FADE’S TARGET', `<div style="position:relative">${line(95)}${line(88)}${line(43)}<div style="position:absolute;left:0;right:0;bottom:0;height:52px;background:linear-gradient(to bottom,rgba(255,255,255,0),#FFFFFF)"></div></div>
      <span style="font-family:${MONO};font-size:10px;color:#6E6A64">160 PX OF THE PAGE GROUND, OVER TEXT THE BROWSER ALREADY HAS · SELECTABLE, COPYABLE, PRESENT ⚑</span>`)}
    ${lane('A32 · THE GATE', `<div style="display:flex;flex-direction:column;gap:9px"><span style="font-size:13px;line-height:1.6;color:#3A3835">${b('The only element A32 owns.')} It is server-rendered HTML in the document, after the preview and before A26’s post footer.</span></div>`)}
    ${lane('THE WITHHELD TEXT', dashed, 'dim')}
    <div style="height:14px"></div>
    <span style="font-size:12.5px;line-height:1.65;color:#3A3835">${b('So the fade is presentation and the truncation is the protection')} ⚑. ${b('A blur is decoration too')}: at Blur = On the last visible paragraph is blurred in CSS and its words remain selectable, copyable and in the page source. ${b('Nothing A32 draws hides anything')} — and the help text in every panel that offers a blur says so, so nobody ships it believing otherwise ⚑.</span></div>`;
}

/* ── the stress frame · worst realistic content, on 1 Fade ────────────── */
function stressFrame() {
  const t = L, g = K.ground(t, 'page');
  const m = 720;
  const inner = `<div style="width:${m}px;margin:0 auto;display:flex;flex-direction:column">
    <p style="margin:0;font-size:19px;line-height:1.7;color:${g.text};font-family:${PK.body};text-wrap:pretty">A first sentence, and then the cut.</p>
    <div style="height:10px"></div>
    <span style="font-family:${MONO};font-size:10px;color:#B0A79A">A 34-CHARACTER PREVIEW · THE FADE IS SUPPRESSED UNDER 2 LINES OF TEXT ⚑ — THERE IS NOTHING TO FADE INTO</span>
    <div style="height:96px"></div>
    <span style="font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:${g.muted};font-family:${PK.body}">Members only · Patron</span>
    <div style="height:12px"></div>
    <h2 style="margin:0;font-family:${PK.head};font-size:34px;font-weight:700;line-height:1.15;letter-spacing:-0.03em;color:${g.text};max-width:${m}px;text-wrap:pretty">Support independent reporting on infrastructure, procurement and the long tail of municipal maintenance</h2>
    <div style="height:8px"></div>
    <span style="font-family:${MONO};font-size:10px;color:#B0A79A">A 104-CHARACTER HEADING · IT WRAPS TO THREE LINES AND NOTHING IS TRUNCATED ⚑ · 9 BIG TYPE WOULD REFUSE IT AT 60</span>
    <div style="height:14px"></div>
    <p style="margin:0;font-size:17px;line-height:1.6;color:${g.muted};font-family:${PK.body};max-width:560px;text-wrap:pretty">Patron, with the printed quarterly and the annual index is ¥36,000 a year.</p>
    <div style="height:26px"></div>
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      ${K.btn(g, { label:'Continue to Patron, with the pri…', pack:PK, h:46, px:22 })}
      <span style="font-size:14px;color:${g.muted};font-family:${PK.body}">Already a Patron? <span style="color:${g.text};text-decoration:underline;text-underline-offset:3px">Sign in</span></span></div>
    <div style="height:8px"></div>
    <span style="font-family:${MONO};font-size:10px;color:#B0A79A">A 47-CHARACTER CTA LABEL · CLIPPED AT THE 24-CHARACTER LIMIT WITH AN ELLIPSIS, WHOLE STRING KEPT IN THE DOM ⚑ (A18·3)</span>
    <div style="height:28px"></div>
    <div style="width:100%;height:1px;background:${g.border}"></div>
    <div style="height:20px"></div>
    <div style="display:flex;align-items:flex-start;gap:10px"><span style="font-size:14px;line-height:1.5;color:${g.muted}">✓</span>
      <span style="font-size:15px;line-height:1.5;color:${g.text};font-family:${PK.body}">The printed quarterly</span></div>
    <div style="height:8px"></div>
    <span style="font-family:${MONO};font-size:10px;color:#B0A79A">ONE INCLUDED LINE WHERE THE DESIGN EXPECTS THREE · THE HAIRLINE STAYS AND THE ROW DOES NOT STRETCH ⚑</span></div>`;
  return K.frame(L, 1440, `<div style="padding:0 72px">${K.boundary(L, 1440, 'STRESS · THE WORST REALISTIC CONTENT A32 WILL MEET')}</div>
    <div style="height:40px"></div><div style="padding:0 72px">${inner}</div><div style="height:96px"></div>`);
}

function stressTiles() {
  return `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'THE FIVE HARD CASES, AND WHAT EACH DESIGN DOES',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('A preview of one sentence.')} A publication can put the cut in the first paragraph. ${b('Under two lines of text the fade is suppressed')} ⚑ — a 160 px gradient over 30 px of type is a grey block — and the gate’s padding is unchanged, so the page reads as a very short article followed by an offer.</span>
      <span>${b('A preview that ends mid-sentence.')} It is the normal case, not an edge one: Ghost cuts at a card boundary and the author wrote a paragraph that runs on. ${b('No design adds an ellipsis')} ⚑ — the fade is the punctuation, and an inserted “…” is the theme writing in the author’s voice.</span>
      <span>${b('A 104-character heading.')} It wraps in eleven designs and ${b('is refused at 60 in 9 Big Type')}, which is the only enforced limit in the category ⚑.</span>
      <span>${b('A member with no name')} on the upgrade gate → the greeting drops to “You are signed in on the free plan”, ${b('never “Hello, friend”')} ⚑. A30’s finding, carried: most members have no name.</span>
      <span>${b('One included line where three are expected')} → the row does not stretch and the hairline stays ⚑.</span></div>` })}${
    tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'REFUSED CATEGORY-WIDE · EACH WITH ITS REASON',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('An overlay or modal over the preview')} ⚑ — ${b('there is nothing to cover')}. An overlay says the article is behind it; the article was never sent. It would also trap a reader who wants to re-read what they did get.</span>
      <span>${b('A blur over withheld text')} ⚑ — same reason, and it is the misconception the anatomy frame exists to kill.</span>
      <span>${b('“2 of 3 free articles this month”')} ⚑ — ${b('Ghost has no metering')}, so the number would be invented. No module counts reads and none should be requested for it.</span>
      <span>${b('A countdown or a limited-time price')} ⚑ — the registry’s ${code('countdown')} is for a deadline a publication authored, not for pressure a theme manufactures at a paywall.</span>
      <span>${b('A card form')} ⚑ (Stripe’s, and PCI’s) · ${b('a member count or “join 4,000 readers” line')} ⚑ (not queryable) · ${b('a permanent dismissal')} ⚑ (a paywall a reader can hide forever is a paywall a publication cannot use) · ${b('an accent left border on a box')} ⚑ · ${b('a per-item control of any kind')} ⚑.</span></div>` })}</div>`;
}

function build() {
  let out = K.DOC_HEAD;
  out += K.intro({
    rail:'A32 PAYWALL / CONTENT CTA · CATEGORY PROOF · 12 DESIGNS · PAPER PACK · DRAWN 24 AUGUST 2026',
    title:'A32 Paywall / Content CTA — the category',
    paras:[
      'Twelve designs for one element: the thing that renders mid-article where a members-only post stops. Each draws four gates — free signup, paid, upgrade for a signed-in free member, and a post sold to one named tier — from one field list, so a publication picks a design and gets all four.',
      'The fact to read first is what the browser has. <strong style="font-weight:600">Ghost sends the free preview and nothing below it. The fade and the blur cover text the reader already has; the withheld text was never in the response.</strong> Every frame in the category carries that line, and no control in any design moves it.',
      'This frame carries what belongs to the category rather than to any one design: the four questions §8 asked, the cut anatomised, the tokenisation proof, the stress frames, the roster with its twelve structural descriptors, the shared field list, the component inventory and the findings for the architect. ' +
      'The per-design frames are <a href="./A32-1 Fade.dc.html">A32-1</a> … <a href="./A32-12 Meter.dc.html">A32-12</a>, and the written specification is <code style="font-family:\'JetBrains Mono\',monospace;font-size:14px">A32 Paywall - Spec.md</code>.'
    ]
  });

  // ── settlements ─────────────────────────────────────────────────────
  const st = [
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'1 · THE CUT · WHAT FADES, WHAT BLURS, AND WHAT WAS NEVER SENT',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('The fade is a gradient of the page ground over the last visible block')} — 96, 160 or 240 px, ${b('never over the gate and never over withheld text')} ⚑, because there is no withheld text in the page to cover.</span>
      <span>${b('The fade belongs to the last visible block, not to the section')} ⚑. That is what makes it a stylesheet rule — ${code('p:last-child')}, ${code('ul:last-child')}, ${code('ol:last-child')} — rather than a script, and it is why ${b('a heading, a figure, a code block or an embed gets no fade at all')} ⚑: fading a heading promises a sentence that does not exist, and A19’s rule forbids tinting a photograph.</span>
      <span>${b('Blur is offered and is labelled as decoration')} ⚑ — 2.6 px on the last visible paragraph, whose words stay selectable and stay in the page source. ${b('The truncation is the protection; the blur is a picture of one')}, and the panel’s help text says exactly that.</span></div>` }),
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'2 · FREE-SIGNUP VERSUS PAID-UPGRADE, AND THE COPY FOR EACH',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('Four gates, and Ghost picks which')} from ${code('post.visibility')} ⚑. ${b('Free signup')} — “Keep reading with a free account” · “Sign up free”. ${b('Paid')} — “The rest of this piece is for members” · “See membership”. ${b('Upgrade')} — “This one is for paying members” · “Upgrade”. ${b('Named tier')} — “This piece is for Patron members” · “See Patron” ⚑. All four sets are fields; the words above are defaults.</span>
      <span>${b('The free gate is the only one a theme can complete itself')} ⚑ — an email address and Ghost’s members endpoint — which is why ${b('the email-field control value exists only there')} and is greyed on the other three with the reason shown.</span>
      <span>${b('No design states a price it was not given')} ⚑. With many tiers the paid gate reads “From $6 a month”, with one it reads that tier’s price, and ${b('with none the price clause disappears')} rather than defaulting to a number ⚑.</span></div>` }),
    tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'3 · THE PORTAL HAND-OFF, AND THE SIGNED-IN FREE MEMBER',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('Every action opens Portal')} ⚑ — ${code('#/portal/signup')} for the free and paid gates, ${code('#/portal/signin')} for the secondary link, ${code('#/portal/account/plans')} for the upgrade. ${b('The theme draws the trigger and Portal draws the rest, over the page')}. A30’s boundary, carried verbatim.</span>
      <span>${b('A32 does not draw the ')}${code('PORTAL ↗')}${b(' tag')} ⚑. A30’s account rows carry it because they look like settings; ${b('these are calls to action')}, and a tag beside a primary button reads as a warning. The destination is annotated on every frame in mono, ${b('outside the section')}.</span>
      <span>${b('A signed-in free member on a paid post gets the upgrade gate')} ⚑: no sign-in link, greeted by name where Ghost has one, and pointed at the plans panel. ${b('On a members-only post the same reader has access and A32 does not render at all')} ⚑ — there is no unlocked state to design, and no design may draw one.</span></div>` }),
    tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'4 · A PARAGRAPH, A HEADING, AN IMAGE · AND A25’S OPEN CONTRACT',
      body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span>${b('After a paragraph')} the fade runs at its control value and the gate’s padding is the ladder’s. ${b('After a heading')} the fade is suppressed and the space above the gate grows ⚑ — 72 in the boxed and carded designs, 132 in 9 Big Type — so the heading is never read as the gate’s own title. ${b('After an image')} the fade is suppressed absolutely ⚑; two designs recommend another design at that landing (7 Tiers and 10 Cover) and neither forces it.</span>
      <span>${b('A25’s finding 8 asked A32 to state what it expects to be handed')} ⚑. It is three things: ${b('the article’s ground or box closed above the cut')} (three A25 designs already do it by rule), ${b('the page ground unchanged at the seam')}, and ${b('the last visible block’s element type reachable from CSS')}.</span>
      <span>${b('The third is the one that is not settled')} ⚑ — ${code(':last-child')} works only if Ghost’s truncation leaves the last block as the last child and not inside a wrapper. ${b('A32 asks the build for a class on the article naming the last block’s type')}, and that is a finding rather than a design.</span></div>` })
  ];
  out += section('A32 settlements', cap('THE FOUR QUESTIONS §8 ASKED, ANSWERED') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${st.join('')}</div>`);

  // ── the cut, anatomised ─────────────────────────────────────────────
  out += section('A32 the cut', cap('THE CUT, ANATOMISED · THE CATEGORY’S ONE UNAVOIDABLE FACT') + cutAnatomy());

  // ── pack proof ──────────────────────────────────────────────────────
  const cells = [];
  ['paper', 'studio', 'garden'].forEach(k => { cells.push(proofCell(PACKS[k], false)); cells.push(proofCell(PACKS[k], true)); });
  out += section('A32 pack proof', cap('THE TOKENISATION PROOF · 2 CARD IN THREE PACKS, LIGHT AND DARK · ONE FUNCTION, SIX TOKEN OBJECTS') +
    `<div style="width:1360px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">${cells.join('')}</div>` +
    note(`${b('Nothing moved.')} Six frames, one function, six token objects: ground, surface, text, muted, border, accent, a radius and a font pair. ${b('The fade is written from the ground token in every one')} ⚑ — ${code('rgba(<ground>,0)')} to ${code('<ground>')} — which is the single most important line in the category to tokenise, because a gradient hard-coded to white is invisible in dark and wrong in five of the twelve packs. ${b('The card, the button and the fade all read the same radius and ground tokens')}: Studio at radius 2 makes a rectangular gate and Garden at 20 a rounded one, and neither needed a nudge. ${b('The accent appears exactly once per frame')} — the button — and was re-checked in all six: Studio’s blue 4.6:1, Garden’s green 4.8:1, Paper’s ${code('#D96C3F')} 4.4:1 on white ⚑, which is why the label is 15 px and 600 rather than 14.`));

  // ── stress ──────────────────────────────────────────────────────────
  out += section('A32 stress', cap('THE STRESS FRAME · THE WORST REALISTIC CONTENT THIS CATEGORY WILL MEET · DRAWN ON 1 FADE') +
    stressFrame() +
    note(`${b('A one-sentence preview, a 104-character heading, a 54-character tier name inside a 24-character button label, prices in yen at five figures, and one included line where the design expects three')} ⚑ — every one of them a thing a real publication has. ${b('The fade is suppressed rather than drawn over 30 px of type')} ⚑: that is the rule the frame exists to state. ${b('The button clips its label and keeps the whole string in the DOM')} ⚑ — A18·3’s rule — rather than wrapping to two lines, because a two-line button stops being a button.`) +
    stressTiles());

  // ── roster ──────────────────────────────────────────────────────────
  const roster = [
    ['1', 'Fade', 'article body · none · page · none · none · the fade into the measure', '6', 'core · member-form at one value'],
    ['2', 'Card', 'stack · card · page · none · none · a raised card over the fade', '6', 'core'],
    ['3', 'Panel', 'stack · none · surface · none · none · the gate on one raised plane', '6', 'core'],
    ['4', 'Contrast Band', 'stack · none · contrast · none · none · an inverted full-bleed band', '6', 'core'],
    ['5', 'Boxed', 'stack · box · page · none · none · one hairline box in the measure', '6', 'core'],
    ['6', 'Split Pitch', 'split · none · page · none · none · the reason beside the action', '6', 'core · member-form at one value'],
    ['7', 'Tiers', 'grid-of-N · none · page · few · none · tier cards at the cut', '6', 'price-toggle'],
    ['8', 'Ledger', 'stack · none · page · many · none · what is included as ruled rows', '6', 'core'],
    ['9', 'Big Type', 'stack · none · page · none · none · the promise at display size', '6', 'core'],
    ['10', 'Cover', 'stack · none · image · none · background · the gate over a photograph', '6', 'core'],
    ['11', 'Sticky Bar', 'sticky · none · surface · none · none · a bar pinned to the foot', '6', 'core · dismiss at one value'],
    ['12', 'Meter', 'bar · none · page · none · none · a read meter above the gate', '6', 'reading-progress']
  ].map(r => [r[0], r[1], `<code style="font-family:${MONO};font-size:11.5px">${r[2]}</code>`, r[3], r[4]]);
  out += section('A32 roster', cap('THE ROSTER · TWELVE DESIGNS, TWELVE STRUCTURAL DESCRIPTORS') +
    table({ cols:['#', 'DESIGN', 'TUPLE', 'CTL', 'MODULES'], widths:[32, 148, 700, 40, 300], rows:roster }) +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
      tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', label:'TUPLE UNIQUENESS · THE HONEST STATEMENT', body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
        <span>${b('All twelve are distinct on the five closed slots')} ⚑, and ${b('three slots do the work')}. ${b('Containment separates 1, 2 and 5')} — ${code('none')}, ${code('card')}, ${code('box')} — and ${b('ground separates 1, 3, 4 and 10')} — ${code('page')}, ${code('surface')}, ${code('contrast')}, ${code('image')}. Those six are deliberately the same components six ways, which is the case those two slots exist for.</span>
        <span>${b('Archetype separates the four that share ')}${code('none · page · none · none')}: 1 is ${code('article body')}, 9 is ${code('stack')}, 12 is ${code('bar')}, 6 is ${code('split')}. ${b('Item-count separates 7 and 8')} — ${code('few')} queried tiers against ${code('many')} authored rows — and ${b('media placement separates 10')} alone, at ${code('background')}.</span>
        <span>${b('Containment is none in ten of twelve')} ⚑. 7 Tiers’ cards are the ${b('items’')} geometry, not the section’s — A21·2’s rule, and the slot most easily got wrong.</span></div>` })}${
      tile({ w:652, bg:'#F7F5F2', border:'#E7E2DB', label:'WHAT THE CHECK CANNOT PROMISE', body:`<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;line-height:1.65;color:#3A3835">
        <span>${b('9 Big Type and 1 Fade differ on archetype and on nothing a machine can see')} ⚑ — what actually distinguishes them is scale, and no machine reads scale. ${b('12 Meter’s ')}${code('bar')}${b(' claim rests on the meter being the arrangement')} rather than an ornament above a stack; that is a judgement.</span>
        <span>${b('3 Panel and 11 Sticky Bar are both ')}${code('surface')}${b(' grounds')} and are separated by archetype alone. ${b('2 Card and 5 Boxed are one design in two containments')} — a real and visible difference at rest, a thin one written down.</span>
        <span>${b('Each design’s panel names the ones it is closest to, by number')} ⚑, and says which control value would turn it into its neighbour. That is the honest version of a uniqueness claim.</span></div>` })}</div>`);

  // ── shared field list ───────────────────────────────────────────────
  const F = [
    ['<em>the gate copy set, ×4</em>', '—', '—', '—', 'all 12', '<strong style="font-weight:600">The five fields below exist once per gate</strong> ⚑ — free, paid, upgrade, tier — so switching designs never loses a gate’s wording'],
    ['eyebrow', 'text', 'opt', '24 ch', 'all but 12', 'Defaults “Members only” · “Free account” · “Patron members” ⚑'],
    ['heading', 'text', 'opt', '60 ch', 'all 12', '<strong style="font-weight:600">Enforced at 60 in 9 Big Type</strong> ⚑, advisory elsewhere; 6 sets two lines at 40'],
    ['blurb', 'text', 'opt', '240 ch', 'all 12', '11 draws it in the twin only ⚑; 9 hides it at Sentence = Hide'],
    ['ctaLabel', 'text', 'opt', '24 ch', 'all 12', 'Defaults “See membership” · “Sign up free” · “Upgrade” · “See Patron”'],
    ['signinPrompt · signinLinkLabel', 'text', 'opt', '30 · 24 ch', 'all 12', 'Defaults “Already a member?” · “Sign in”. <strong style="font-weight:600">Absent on the upgrade gate</strong> ⚑'],
    ['manageLinkLabel', 'text', 'opt', '24 ch', 'all 12', 'The upgrade gate’s secondary; default “Manage your membership” ⚑'],
    ['legal', 'text', 'opt', '160 ch', '1, 6', '<strong style="font-weight:600">Authored, never generated</strong> ⚑; drawn only where there is an email field'],
    ['benefits[]', 'list 0–6', 'opt', 'name 60 ch · detail 90 ch', '1, 2, 3, 4, 5, 6, 8, 10', '<strong style="font-weight:600">The category’s only authored repeater</strong> ⚑ — <strong style="font-weight:600">the detail is drawn only by 8 Ledger</strong>; 7, 9, 11, 12 store it'],
    ['benefitsLabel', 'text', 'opt', '24 ch', 'as benefits[]', 'Default “What a membership includes”; stored and not drawn by 4 and 8 ⚑'],
    ['image · imageAlt · imageFocus', 'image · text · enum', '<strong style="font-weight:600">req in 10</strong>', '≥ 2,400 px · 120 ch · 9 positions', '10', '<strong style="font-weight:600">Required in 10 Cover; no image → hand-off to 4</strong> ⚑. Focus is a field, not a control ⚑'],
    ['barLine · barSub', 'text', 'opt', '60 · 60 ch', '11', 'barLine defaults to the gate’s heading, clipped to one line ⚑'],
    ['meterLabel', 'text', 'opt', '90 ch', '12', '<strong style="font-weight:600">{read} and {total} are the only tokens</strong> ⚑; never a percentage numeral'],
    ['periodLabels · tierNote', 'text', 'opt', '12 ch × 2 · 90 ch', '7', 'Defaults “Monthly” · “Yearly”; the note is the price-and-cancellation line'],
    ['<em>post.visibility</em>', 'Ghost', 'req', '—', 'all 12', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">public · members · paid · tiers</code> — <strong style="font-weight:600">this is what picks the gate</strong> ⚑'],
    ['<em>post.access</em>', 'Ghost', 'req', '—', 'all 12', '<strong style="font-weight:600">false is the only value at which A32 renders</strong> ⚑'],
    ['<em>@member</em>', 'Ghost', 'opt', '—', 'all 12', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">name · status · subscriptions</code> — decides the upgrade gate; <strong style="font-weight:600">most members have no name</strong> ⚑'],
    ['<em>post.reading_time</em>', 'Ghost', 'opt', '—', '12', '<strong style="font-weight:600">The meter’s denominator ⚑ — verify it is the whole post, not the preview</strong>'],
    ['<em>tiers</em>', 'Ghost', 'opt', '—', '7', '<code style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">name · monthly_price · yearly_price · currency · description · benefits</code> — <strong style="font-weight:600">read by all 12, drawn by 7</strong>'],
    ['<em>@site.title</em>', 'Ghost', 'req', '—', 'all 12', 'The heading’s fallback and the gate’s accessible name ⚑']
  ];
  out += section('A32 fields', cap('THE SHARED FIELD LIST · THE CONTRACT THAT MAKES DESIGN-SWITCHING SAFE') +
    table({ cols:['FIELD', 'TYPE', 'REQ', 'LIMIT', 'USED BY', 'NOTES'], widths:[248, 118, 76, 172, 158, 480], rows:F }) +
    note(`${b('Thirteen authored field groups — each of the first five multiplied by four gates — and six things read from Ghost.')} A design may draw four of them: ${b('9 Big Type draws an eyebrow, a heading, a sentence and a button')}. ${b('None needs a field the category does not have')}, so switching between any two of the twelve preserves everything the user typed. ${b('Four fields are drawn by exactly one design each')} — the benefit detail (8), the bar’s two lines (11), the meter label (12), the period labels (7) — ${b('and all four are stored by the other eleven')} ⚑. ${b('The gate copy set is the field that makes the category work')}: because all four gates’ words are stored at once, a post whose visibility changes from members to paid does not lose its wording ⚑.`));

  // ── component inventory ─────────────────────────────────────────────
  const CI = [
    ['Preview fade', 'A 96 · 160 · 240 px gradient of the page ground over the last visible block, written from the ground token; suppressed on headings, figures, code and embeds', '<strong style="font-weight:600">A32</strong> (1)'],
    ['Access eyebrow', '13 px uppercase tracked, naming the gate: Members only · Free account · Patron members', '<strong style="font-weight:600">A32</strong> (1)'],
    ['Gate block', 'Eyebrow, heading, one sentence, primary action, secondary line — the stack eight A32 designs share', '<strong style="font-weight:600">A32</strong> (1)'],
    ['Read meter', 'A 4 px rule or twelve segments, fill in the text colour and track in the border token, label in words', '<strong style="font-weight:600">A32</strong> (12)'],
    ['Sticky foot bar', '76 px surface bar with a top hairline and an upward shadow, pinned with position: sticky; bottom: 0', '<strong style="font-weight:600">A32</strong> (11)'],
    ['In-flow twin', 'A sticky bar’s line and button repeated at the cut; the bar is aria-hidden and the twin is the accessible copy', '<strong style="font-weight:600">A32</strong> (11)'],
    ['Portal destination annotation', 'A mono line naming the Portal panel an action opens — a frame annotation, never shipped in the section', '<strong style="font-weight:600">A32</strong> (0)'],
    ['Cut boundary strip', 'The mono line on every frame naming the template, what Ghost sent and what Portal owns', '<strong style="font-weight:600">A32</strong> (0)'],
    ['Tier card', 'Name, price at 38 in the heading font, blurb, three benefits, full-width button', 'A7 (1)'],
    ['Tier row', 'The card as a hairline row: name and blurb left, price and button right', 'A7 (3)'],
    ['Period toggle', 'Two named cells in a plate, 44 px, Monthly and Yearly — never a switch', 'A30 (8)'],
    ['Email field, 46 px', 'Label above at 13/500, hairline border, 15 px value, 1.5 px accent border on focus', 'A30 (1) · A16'],
    ['Tick list', '✓ glyph at 14 px muted, 15 px lines, 10 px gaps', 'A5 (11)'],
    ['Numbered rows', 'Mono ordinal in a 22 px column, name, one muted line, over a hairline', 'A9 (15)'],
    ['Ledger row', 'Label column, value, hairline above each and one below the last', 'A9 (15)'],
    ['Split head', 'Two columns of the content box with a stated gap, stacking at 833', 'A5 (5)'],
    ['Surface plane', 'Pack radius + 4, one hairline, md shadow at Raised, forced Flat in dark', 'A19 (3) · A29 (4)'],
    ['Warm scrim', 'A flat wash of the pack’s text colour at 30 / 45 / 60 %, never black and never a gradient', 'A20 (13)'],
    ['On-contrast derivation', 'muted 72 % · hairline 20 % · plate 8 % of the band’s carried colour', 'A17 (7)'],
    ['Primary button', 'Accent fill, 15 px/600, the pack radius, 46 px at a gate', 'A1 (1)'],
    ['Ghost action / outline button', 'Hairline border, text label, 38 px in a row and 46 px in a form', 'A1 (1)'],
    ['Focus ring', '2 px accent at a 4 px offset; the carried colour on a contrast or image ground', 'A6 · A17 (18)'],
    ['Article measure and body type', '620 · 720 · 840 at 1440, 754 at 834, 350 at 390; body 19/1.7, h2 32', 'A25'],
    ['Content box and padding ladder', '1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132, 80 at 834, 64 at 390', 'A17'],
    ['Clipped-string rule', 'Clip visually, keep the whole string in the DOM', 'A18 (3)'],
    ['Image placeholder plate', 'Striped 45° fill at the pack radius with a mono caption naming the crop', 'A1'],
    ['Hand-off rule', 'A design that cannot exist without a precondition renders another, and says so', 'A1 (11, 15) · A29 (5)']
  ];
  out += section('A32 components', cap('COMPONENT INVENTORY · CUMULATIVE · EIGHT NEW, NINETEEN CARRIED FORWARD') +
    table({ cols:['COMPONENT', 'WHAT IT IS', 'FIRST FROM'], widths:[248, 802, 200], rows:CI }));

  // ── findings ────────────────────────────────────────────────────────
  const FI = [
    [`${b('The fade and the blur protect nothing, and the product copy must say so')} ⚑. Both are drawn over text the browser already received. ${b('The protection is Ghost’s truncation')}, which is real and total. This is a documentation finding rather than a design one, and it is first because it is the thing a publication will get wrong.`,
     `${b('A25’s finding 8 is answered, except for one part')} ⚑. A32 expects the article’s ground or box closed above the cut, the page ground unchanged at the seam, and ${b('the last visible block’s element type reachable from CSS')}. ${b('The third needs the build’s help')}: ${code(':last-child')} only works if Ghost’s truncation leaves the last block as the article’s last child. ${b('A32 asks for a class on the article naming that type')} — one class, set server-side.`,
     `${b('Whether ')}${code('post.reading_time')}${b(' is computed on the whole post or on the truncated preview must be verified')} ⚑. ${b('12 Meter depends on it entirely')}: if it is the preview, the meter always reads full and the design cannot be built as specified. It is the only design in A32 with a single-point dependency.`,
     `${b('Whether Portal can be opened at a named panel')} — ${code('#/portal/account/plans')} — ${b('from a themed link needs verifying')} ⚑. A30·11 raised it; ${b('here four designs’ upgrade gates assume it')}. If it cannot, the upgrade action opens Portal’s default panel and the member has to find plans themselves, which is a worse gate rather than a broken one.`],
    [`${b('There is no metering in Ghost and A32 does not ask for one')} ⚑. “Two free articles left this month” is the commonest paywall pattern on the web and ${b('the number would be invented')}. It is refused category-wide rather than left unmentioned, so it is clear the omission is a decision.`,
     `${b('An overlay paywall is refused for a structural reason, not a taste one')} ⚑ — an overlay claims to cover something, and there is nothing under it. ${b('If a thirteenth design is ever requested it should not be that')}, and this is where to look first.`,
     `${b('The registry already names A32 #12')} ⚑ — ${code('reading-progress')}’s degradation reads “A32 #12’s meter renders at its server-known static value”. ${b('That is honoured exactly')}: the static value is the designed value and the module only animates the fill. ${b('No new module is requested by any of the twelve')}, and eight of them declare none at all — A32 is the least scripted category in the library so far ⚑.`,
     `${b('A tier’s benefit list may not be exposed to themes in the shape 7 Tiers draws')} ⚑ — A30’s open finding, restated because a second category now depends on it. If benefits are unavailable, Benefits per card becomes a no-op and the card is name, price, description, button. ${b('Marking the rows a member already has, in 8 Ledger’s upgrade gate, needs the same data and is flagged with it')} ⚑.`]
  ];
  out += section('A32 findings', cap('FINDINGS FOR THE ARCHITECT · EIGHT, SIX OF THEM NEW') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${FI.map(col =>
      tile({ w:652, bg:'#FFFFFF', border:'#E7E2DB', body:`<div style="display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${col.map(x => `<span>${x}</span>`).join('')}</div>` })).join('')}</div>` +
    note(`${b('None of these is a request for a new behaviour module.')} The registry is closed and A32 uses five of its thirty-one — ${code('core')}, ${code('member-form')}, ${code('price-toggle')}, ${code('dismiss')}, ${code('reading-progress')} — with ${b('seven designs declaring nothing beyond ')}${code('core')}. ${b('Where a design wanted behaviour no module covers')} — nothing in A32 did — ${b('it would say so and name the closest')}. ${b('The one place the registry was ahead of the design')} is ${code('reading-progress')}, which already described 12 Meter before it was drawn ⚑.`));

  out += K.DOC_TAIL;
  return out;
}

return { build, proofCell, cutAnatomy, stressFrame, stressTiles };
})();
