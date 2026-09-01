/* A29 · per-design panel patches. Reads globalThis.A29K (a29kit.js). */
globalThis.A29P = (function () {
const K = globalThis.A29K;
const { b, bd, code, hb, seg, sel, ro, txt, note, trio, dataGroup, contentGroup, editingGroup } = K;

const EYE = `Show · Hide, ${bd('new in this pass')} ⚑. The eyebrow defaults by route — Tag · Author · Archive — so clearing the field brought the default straight back and the label could not be turned off ⚑. All fourteen designs now carry this row.`;
const cEye = txt('Eyebrow text', 'Tag', 'INLINE', K.C_EYEBROW);
const cName = txt('Name override', '— using Ghost&#8217;s name', 'INLINE', K.C_TITLE);
const cDesc = txt('Description text', 'Reporting on the pipes, cables and rails that carry&#8230;', 'INLINE', `Inline at Data → Description: Custom text. ${bd('At From Ghost the words are Ghost&#8217;s')} and the lock pill replaces the toolbar ⚑.`);
const cBack = txt('Back link label', 'All posts', 'INLINE', 'Inline. Default "All posts" ⚑, 24 characters.');
const cBackUrl = txt('Back link URL', hb('@site.url'), 'LINK PICKER', K.C_BACKURL);
const cEmpty = txt('Empty notice', 'No posts filed here yet&#8230;', 'INLINE', K.C_EMPTY);
const cZero = txt('Zero count string', 'No posts yet', 'CATALOG', K.C_ZERO);
const cActLabel = txt('Action label', 'Subscribe', 'P0·4 · PER STATE', `Plain text — ${bd('the P0·1 toolbar never appears on an action label')} ⚑. Written per member state in the ${bd('P0·4')} member-aware editor: logged out, free member, paid member.`);
const cActUrl = txt('Action link', 'Portal · Sign up', 'LINK PICKER', `Link Picker with ${bd('Portal actions first')} ⚑; a Portal target renders as "Portal · Sign up". Default ${code('#/portal/signup')}.`);
const rActIcon = seg('Action icon', ['None', 'Before', 'After'], 'None', `An optional icon before or after the label from the ${bd('Icon Picker')} ⚑ — P0·2's button-icon rules: always Small, label-coloured, its Size and Colour rows hidden.`);
const rMemberVis = sel('Member visibility', 'Everyone', `Everyone · Logged out · Free members · Paid members. ${bd('New in this pass')} ⚑ — a paid member should not be shown "Subscribe". P0·4's scope tags keep the two apart: this row is ${bd('SECTION')}, the per-state rows in the action editor are ${bd('ONE ACTION')}.`);
const BOTTOM = `A hairline under the section, above the grid. Off by default — A17 draws its own head ⚑. ${bd('Renamed from Divider in this pass')} ⚑: the universal Top divider sits above the section, this rule sits under the head, and two rows called Divider in one sidebar is one too many.`;
const E_LIST = `${code('eyebrow')}, ${code('titleOverride')}, ${code('description')}, ${code('backLabel')}, ${code('emptyText')}`;

/* the trio, page-ground designs */
const trioPage = extraVs => trio({
  bgNote: `From the pack. Background · Surface · Contrast, and the head keeps its arrangement at all three ⚑.`,
  vsNote: extraVs || K.VS_STD,
  tdNote: `None · Line · Fade above the section. ${bd('Not the row this design calls Bottom rule')} ⚑ — that one is under the head. Default None: A29 is the first thing on the route and A1's header is its own edge.`
});

const P = {};

/* ── 1 · Centred ───────────────────────────────────────────────────────── */
P[1] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 1 OF 14 · PAPER PACK · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SIX OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: NAME SIZE, DESCRIPTION, POST COUNT, BACK LINK',
  footc: 'SIX + TRIO + DATA',
  rows: [
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '40 · 52 · 68 at 1440; 34 · 44 · 56 at 834; 28 · 34 · 40 at 390 ⚑.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'Shows only when there is one. Most tags have none ⚑.'),
    sel('Post count', 'Under the description', 'Under the description · Beside the eyebrow · Off.'),
    seg('Back link', ['Show', 'Hide'], 'Show', `Points at ${code(hb('@site.url'))} and reads "All posts" ⚑.`),
    seg('Bottom rule', ['On', 'Off'], 'Off', BOTTOM),
    contentGroup([cEye, cName, cDesc, cBack, cBackUrl, cEmpty, cZero]),
    trioPage(),
    dataGroup({}),
    editingGroup(E_LIST, [`${bd('Member Visibility lands nowhere in this design')} ⚑ — a centred archive head has no call to action. P0·2, P0·3 and P0·4 never open here; P0·6 steps the 0 · 1 · many count states and the no-description case.`])
  ],
  rec: `Padding retired into ${bd('Vertical spacing')}, Divider renamed ${bd('Bottom rule')}, and ${bd('Eyebrow: Show · Hide')} arrives — the eyebrow defaulted by route, so clearing the field could never turn it off ⚑. The zero count string leaves the template and becomes the ${code('archive.count_empty')} catalog string. The Content group names all five authored strings, ${code('backUrl')} opens the Link Picker, and the Archive source group is recut as ${bd('the Data group')} with its Image row drawn disabled. ${bd('Six controls of its own.')}`,
  specCtl: `${b('Name size')} Regular · Large · Display — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} Show · Hide — ${b('Post count')} Under the description · Beside the eyebrow · Off — ${b('Back link')} Show · Hide — ${b('Bottom rule')} On · Off (was Divider ⚑). ${b('Six.')} Plus the universal trio — Background role · Vertical spacing (the old Padding) · Top divider — and the Data group, neither counted.`,
  specRec: `Padding → Vertical spacing · Divider → Bottom rule · Eyebrow: Show · Hide added · the zero count is the ${code('archive.count_empty')} catalog string · every authored string inline with P0·1, ${code('backUrl')} through the Link Picker · Image row disabled in the Data group.`
};

/* ── 2 · Split Head ────────────────────────────────────────────────────── */
P[2] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 2 OF 14 · PAPER PACK · SEVEN CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SEVEN OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: SPLIT, NAME SIZE, DESCRIPTION, POST COUNT',
  footc: 'SEVEN + TRIO + DATA',
  rows: [
    sel('Split', 'Even', 'Even 596 · 600 · Wide name 776 · 420 · Wide description 420 · 776. The 100 px gutter is fixed ⚑.'),
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '40 · 48 · 60 at 1440. Display is disabled at Wide description ⚑ — 60 px in a 420 column breaks two words a line.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'The right column\'s first element. With none, the column is a count and a link.'),
    sel('Post count', 'In the right column', 'In the right column · Under the name · Off.'),
    seg('Back link', ['Show', 'Hide'], 'Show', 'Foot of the right column at 1440; under the count when stacked.'),
    seg('Bottom rule', ['On', 'Off'], 'Off', BOTTOM),
    contentGroup([cEye, cName, cDesc, cBack, cBackUrl, cEmpty, cZero]),
    trioPage(),
    dataGroup({}),
    editingGroup(E_LIST, [`${bd('Member Visibility lands nowhere')} ⚑ — the right column's only interactive element is the back link. P0·6 steps the near-empty right column, which is the state this design is judged on.`])
  ],
  rec: `Padding retired into ${bd('Vertical spacing')}, Divider renamed ${bd('Bottom rule')}, ${bd('Eyebrow: Show · Hide')} added ⚑, the zero count string moved to the ${code('archive.count_empty')} catalog. Content group added; ${code('backUrl')} through the Link Picker; Archive source recut as ${bd('the Data group')}. ${bd('Seven controls of its own.')}`,
  specCtl: `${b('Split')} Even · Wide name · Wide description — ${b('Name size')} Regular · Large · Display (Display disabled at Wide description ⚑) — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} Show · Hide — ${b('Post count')} In the right column · Under the name · Off — ${b('Back link')} Show · Hide — ${b('Bottom rule')} On · Off (was Divider ⚑). ${b('Seven.')} Plus the universal trio and the Data group, neither counted.`,
  specRec: `Padding → Vertical spacing · Divider → Bottom rule · Eyebrow row added · catalog zero count · Content and Data groups drawn · Image row disabled.`
};

/* ── 3 · Contrast Band ─────────────────────────────────────────────────── */
P[3] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 3 OF 14 · PAPER PACK · EIGHT CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · EIGHT OF ITS OWN + THE UNIVERSAL TRIO (BACKGROUND ROLE LOCKED) + THE DATA GROUP · QUICK: BAND DEPTH, NAME SIZE, ALIGNMENT, ACTION',
  footc: 'EIGHT + TRIO + DATA',
  rows: [
    seg('Band depth', ['Compact', 'Comfortable', 'Spacious'], 'Comfortable', `48 · 72 · 104 ${bd('inside the band')} ⚑ — its own ladder, not the page's 64 · 96 · 132. ${bd('Renamed from Padding in this pass')} ⚑ so it reads as a different thing from the universal Vertical spacing, which resolves to 0 here.`),
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '40 · 48 · 60 at 1440.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'Clamped at 640 on the band ⚑, narrower than on page — long measures read worse in reverse.'),
    sel('Post count', 'Beside the eyebrow', 'Beside the eyebrow · Under the description · Off.'),
    seg('Alignment', ['Left', 'Centre'], 'Left', 'Centre pulls the button under the description and centres all four lines.'),
    sel('Action', 'Button', `Button · Link · Off. ${bd('Accent fill is disabled on this band in Paper')} — 4.0:1 at 14 px ⚑. ${bd('Each pack re-checks its own accent on its own band')} ⚑ and may enable the accent value; the ratio is shown either way. A30's band already states this and A29 now states it too.`),
    rActIcon,
    rMemberVis,
    contentGroup([cEye, cName, cDesc, cActLabel, cActUrl, cEmpty, cZero]),
    trio({
      bgLock: true, bgValue: 'Contrast', bgNote: `${bd('Locked')} ⚑ — the inverted ground is this design's identity and what separates it from 1, 4 and 10. A value that painted it Background or Surface would delete the design rather than restyle it.`,
      vsLock: true, vsValue: 'Resolves to 0', vsNote: `${bd('Resolves to 0 at every value')} ⚑ — the band is full-bleed, sits directly under A1's header and carries its own depth in ${bd('Band depth')} above. Rule 3's band-internal exemption is taken here on the name and declined on the mechanism: there is exactly one spacing ladder for this section and it is the band's.`,
      tdLock: true, tdValue: 'None', tdNote: `${bd('Locked at None')} ⚑ — the band's own top edge is a colour change from the page to the contrast ground; a hairline or a fade drawn on top of it is invisible at best.`
    }),
    dataGroup({}),
    editingGroup(`${code('eyebrow')}, ${code('titleOverride')}, ${code('description')}, ${code('actionLabel')}, ${code('emptyText')}`, [`${bd('The action is the P0·4 member-aware editor')} ⚑, new in this pass: Show, Label and Link per state — logged out, free member, paid member — so a paid member is not offered "Subscribe" on the archive they already pay for. ${bd('Member visibility')} above is the section-level row over the top of it, and P0·4's scope tags label which is which. The label takes an optional ${bd('Icon Picker')} icon before or after it.`])
  ],
  rec: `Padding becomes ${bd('Band depth')} (48 · 72 · 104, the band's own ladder) and the universal ${bd('Vertical spacing')} is locked at 0 ⚑; ${bd('Background role is locked at Contrast')} with the reason shown; ${bd('Top divider')} locked at None. ${bd('Eyebrow: Show · Hide')} added. ${bd('The Subscribe action is now P0·4')} — per-state show, label and link — under a section-level ${bd('Member visibility')} row, and the label takes an optional icon. ${bd('Each pack re-checks accent on its own band')} ⚑. ${bd('Eight controls of its own.')}`,
  specCtl: `${b('Band depth')} Compact · Comfortable · Spacious, 48 · 72 · 104 inside the band (was Padding ⚑) — ${b('Name size')} — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Post count')} — ${b('Alignment')} Left · Centre — ${b('Action')} Button · Link · Off, accent disabled in Paper at 4.0:1 and re-checked per pack ⚑ — ${b('Action icon')} None · Before · After (new ⚑) — ${b('Member visibility')} Everyone · Logged out · Free · Paid (new ⚑). ${b('Eight.')} Plus the trio — ${b('Background role locked at Contrast')}, Vertical spacing resolving 0, Top divider locked None — and the Data group.`,
  specRec: `Padding → Band depth · Vertical spacing resolves 0 · Background role locked at Contrast · the action is P0·4's member-aware editor with Member visibility over it · Eyebrow row added · catalog zero count · accent re-checked per pack.`
};

/* ── 4 · Panel ─────────────────────────────────────────────────────────── */
P[4] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 4 OF 14 · PAPER PACK · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SIX OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: PLANE, NAME SIZE, DESCRIPTION, POST COUNT',
  footc: 'SIX + TRIO + DATA',
  rows: [
    seg('Plane', ['Raised', 'Flat'], 'Raised', 'Raised is surface + hairline + md shadow. Flat drops the shadow and keeps the hairline. Dark is always Flat ⚑.'),
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '38 · 44 · 56 on the plane ⚑ — one step down from the open-page ladder.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'Clamped at 640 inside the plane.'),
    sel('Post count', 'Right of the name', 'Right of the name · Under the name · Off.'),
    seg('Back link', ['Show', 'Hide'], 'Show', "Under the count at the plane's right edge."),
    contentGroup([cEye, cName, cDesc, cBack, cBackUrl, cEmpty, cZero]),
    trioPage(`64 · 96 · 132 ${bd('around the plane')}; 80 at 834, 64 at 390. ${bd('This is the row this design called Padding')} ⚑ — and the plane's internal 44 × 48 stays fixed and uncontrolled, which is what the old row already said.`),
    dataGroup({}),
    editingGroup(E_LIST, [`${bd('Member Visibility lands nowhere')} ⚑ — the plane carries a count and a back link, not an action. The zero state is this design's strongest and P0·6 steps it.`])
  ],
  rec: `Padding retired into ${bd('Vertical spacing')} — same three values, same ladder, so the row was a duplicate ⚑ — and the plane's fixed 44 × 48 inside is stated there. ${bd('Eyebrow: Show · Hide')} added, the zero count string moved to the catalog, the Content group added, and Archive source recut as ${bd('the Data group')}. ${bd('Six controls of its own.')}`,
  specCtl: `${b('Plane')} Raised · Flat (dark forces Flat ⚑) — ${b('Name size')} 38 · 44 · 56 ⚑ — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Post count')} Right of the name · Under the name · Off — ${b('Back link')} Show · Hide. ${b('Six.')} Plus the trio — Vertical spacing is the old Padding, around the plane; the inside stays fixed — and the Data group.`,
  specRec: `Padding → Vertical spacing (around the plane; inside still fixed at 44 × 48) · Eyebrow row added · catalog zero count · Content and Data groups drawn · Image row disabled.`
};

/* ── 5 · Full Bleed ────────────────────────────────────────────────────── */
P[5] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 5 OF 14 · PAPER PACK · SEVEN CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP WITH IMAGE FOCUS · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SEVEN OF ITS OWN + THE UNIVERSAL TRIO (BACKGROUND ROLE LOCKED) + THE DATA GROUP WITH IMAGE FOCUS · QUICK: HEIGHT, SCRIM, NAME SIZE, ALIGNMENT',
  footc: 'SEVEN + TRIO + DATA',
  rows: [
    seg('Height', ['Short', 'Standard', 'Tall'], 'Standard', '340 · 440 · 560 at 1440; 300 · 380 · 460 at 834; 360 · 420 · 500 at 390 ⚑. The image height, not the section\'s spacing.'),
    seg('Scrim', ['Light', 'Medium', 'Strong'], 'Medium', '38% · 58% · 74% at the foot ⚑. Light is disabled on images lighter than the check — the name would fall under 4.5:1 ⚑.'),
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '40 · 52 · 68 at 1440.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'Clamped at 560 on the image ⚑ — narrower than on page, because a long line over a picture is hard to hold.'),
    sel('Post count', 'Beside the eyebrow', 'Beside the eyebrow · Under the description · Off.'),
    seg('Alignment', ['Left', 'Centre'], 'Left', "Centre puts all four lines on the box's centre line, still bottom-anchored ⚑."),
    contentGroup([cEye, cName, cDesc, cEmpty, cZero]),
    trio({
      bgLock: true, bgValue: 'Image', bgNote: `${bd('Locked')} ⚑ — the photograph is the ground, which is what this design is. A3·14's footer image made the same call and this follows it.`,
      vsLock: true, vsValue: 'Resolves to 0', vsNote: `${bd('Resolves to 0')} ⚑ — the image is full-bleed under A1's header and ${bd('Height')} above sets the depth. That row is a media height, not the space around a section, so it keeps its own name.`,
      tdLock: true, tdValue: 'None', tdNote: `${bd('Locked at None')} ⚑ — the image edge is the divider. A hairline over a photograph is a scratch.`
    }),
    dataGroup({ image: true, tail: `${bd('At Image: Off, or with no image on the tag or author')}, this design hands off to 1 Centred, drawn in place with a flag in the editor and invisible on the site ⚑ — the user's chosen design is never silently changed.` }),
    editingGroup(`${code('eyebrow')}, ${code('titleOverride')}, ${code('description')}, ${code('emptyText')}`, [`${bd('Image focus is the pass\'s addition here')} ⚑ — Centre · Top · Bottom in the Image Picker's popover, applied to the uploaded image ${bd('and to the Ghost feature image')}. A29 cropped from the centre only and a tag image with its subject at the top lost it. ${bd('Member Visibility lands nowhere')} — this design draws no action.`])
  ],
  rec: `${bd('Image focus (Centre · Top · Bottom) arrives')} ⚑ in the Data group's Image Picker popover, for the uploaded image and the Ghost one alike — the category's "no focal point" refusal is withdrawn, and A30, A31 and A32 already carry the field. ${bd('Background role is locked at Image')} and ${bd('Vertical spacing resolves 0')}; ${bd('Height')} keeps its own name because it is a media height. ${bd('Eyebrow: Show · Hide')} added; the zero count string is now a catalog string. ${bd('Seven controls of its own.')}`,
  specCtl: `${b('Height')} Short · Standard · Tall — ${b('Scrim')} Light · Medium · Strong (Light disabled by the bottom-third check ⚑) — ${b('Name size')} — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Post count')} — ${b('Alignment')} Left · Centre. ${b('Seven.')} Plus the trio — ${b('Background role locked at Image')}, Vertical spacing resolving 0, Top divider locked None — and the Data group, which now carries ${b('Image focus')} Centre · Top · Bottom ⚑.`,
  specRec: `${code('imageFocus')} added to the Data group and applied to the Ghost image too ⚑ · Background role locked at Image · Vertical spacing resolves 0 · Height keeps its own name · Eyebrow row added · catalog zero count.`
};

/* ── 6 · Image Split ───────────────────────────────────────────────────── */
P[6] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 6 OF 14 · PAPER PACK · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP WITH IMAGE FOCUS · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SIX OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP WITH IMAGE FOCUS · QUICK: IMAGE SIDE, IMAGE SHAPE, NAME SIZE, DESCRIPTION',
  footc: 'SIX + TRIO + DATA',
  rows: [
    seg('Image side', ['Left', 'Right'], 'Right', 'Which half the picture takes. The DOM order does not change — the name is always first ⚑.'),
    sel('Image shape', 'Landscape 3:2', 'Landscape 3:2 · Four by three · Square. 636×424 · 636×477 · 636×636 ⚑.'),
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '38 · 44 · 56 in a 636 column ⚑.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'Clamped at 560 inside the 636 column.'),
    sel('Post count', 'Under the description', 'Under the description · Beside the eyebrow · Off.'),
    contentGroup([cEye, cName, cDesc, cBack, cBackUrl, cEmpty, cZero]),
    trioPage(),
    dataGroup({ image: true, tail: `${bd('No image')} → the picture column goes and the text keeps its 636 ⚑; there is no hand-off, because what remains is still a legitimate head.` }),
    editingGroup(E_LIST, [`${bd('Image focus is the pass\'s addition here')} ⚑ — Centre · Top · Bottom in the Image Picker's popover, on the uploaded image ${bd('and the Ghost one')}. It does its most visible work at ${bd('Square')}, where a landscape file is cropped hardest. ${bd('Member Visibility lands nowhere')} — the only interactive element is the back link.`])
  ],
  rec: `${bd('Image focus (Centre · Top · Bottom) arrives')} ⚑ for the uploaded image and the Ghost one, in the Image Picker popover; the old "no focal point" refusal is withdrawn. Padding retired into ${bd('Vertical spacing')}, ${bd('Eyebrow: Show · Hide')} added, the zero count string moved to the catalog, Content and ${bd('Data')} groups drawn. ${bd('Six controls of its own.')}`,
  specCtl: `${b('Image side')} Left · Right (visual only ⚑) — ${b('Image shape')} Landscape 3:2 · Four by three · Square — ${b('Name size')} — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Post count')}. ${b('Six.')} Plus the universal trio (Vertical spacing is the old Padding) and the Data group, which now carries ${b('Image focus')} Centre · Top · Bottom ⚑.`,
  specRec: `${code('imageFocus')} added and applied to the Ghost image too ⚑ · Padding → Vertical spacing · Eyebrow row added · catalog zero count · Content and Data groups drawn.`
};

/* ── 7 · Rail ──────────────────────────────────────────────────────────── */
P[7] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 7 OF 14 · PAPER PACK · SEVEN CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SEVEN OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: RAIL CONTENTS, NAME SIZE, DESCRIPTION, RAIL SIDE',
  footc: 'SEVEN + TRIO + DATA',
  rows: [
    seg('Rail side', ['Left', 'Right'], 'Left', 'Right mirrors the division to 1,008 · 48 · 240. DOM order does not change ⚑.'),
    sel('Rail contents', 'Label, count and link', 'Label and count · Label, count and link · Label, count and action ⚑.'),
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '40 · 48 · 60 in the 1,008 body.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', `${EYE} In this design the eyebrow is the rail's first line, so Hide leaves the rail a count and a link.`),
    seg('Description', ['Show', 'Hide'], 'Show', 'Clamped at 720 in the body.'),
    seg('Gutter rule', ['On', 'Off'], 'Off', `A hairline ${bd('down the gutter')} ⚑, not under the head. Off by default — the 48 px gap is the division. ${bd('Renamed from Divider in this pass')} ⚑: the patch called for "Bottom rule", but this rule is vertical and calling it a bottom rule would be a second wrong name. Recorded in the spec's reconciliation notes.`),
    rMemberVis,
    contentGroup([cEye, cName, cDesc, cBack, cBackUrl, cActLabel, cActUrl, cEmpty, cZero]),
    trioPage(),
    dataGroup({}),
    editingGroup(`${code('eyebrow')}, ${code('titleOverride')}, ${code('description')}, ${code('backLabel')}, ${code('actionLabel')}, ${code('emptyText')}`, [`${bd('At Rail contents: Label, count and action the action is the P0·4 member-aware editor')} ⚑, new in this pass — per-state show, label and link, so a paid member is not sold a subscription in the margin. ${bd('Member visibility')} above is the section-level row and greys at the other two Rail contents values, where there is no action to gate. The action label takes an optional ${bd('Icon Picker')} icon.`])
  ],
  rec: `Padding retired into ${bd('Vertical spacing')}; Divider renamed ${bd('Gutter rule')} ⚑ — the patch asked for "Bottom rule" and this rule runs down the gutter, so the name is recorded as a deviation rather than taken silently. ${bd('Eyebrow: Show · Hide')} added. ${bd('The rail\'s Subscribe action is now P0·4')} with a section-level ${bd('Member visibility')} row and an optional icon. Catalog zero count; Content and ${bd('Data')} groups drawn. ${bd('Seven controls of its own.')}`,
  specCtl: `${b('Rail side')} Left · Right (visual only ⚑) — ${b('Rail contents')} Label and count · Label, count and link · Label, count and action — ${b('Name size')} — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Gutter rule')} On · Off (was Divider ⚑) — ${b('Member visibility')} (new ⚑, greyed unless the rail carries the action). ${b('Seven.')} Plus the trio and the Data group.`,
  specRec: `Padding → Vertical spacing · Divider → ${b('Gutter rule')} (not "Bottom rule" — the rule is vertical; recorded) · Eyebrow row added · the rail action is P0·4's member-aware editor under a Member visibility row · catalog zero count.`
};
return P;
})();
