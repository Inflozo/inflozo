/* A29 · per-design panel patches, 8–14. Reads globalThis.A29K (a29kit.js). */
globalThis.A29P2 = (function () {
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
const rMemberVis = sel('Member visibility', 'Everyone', `Everyone · Logged out · Free members · Paid members. ${bd('New in this pass')} ⚑ — a paid member should not be shown "Subscribe". P0·4's scope tags keep the two apart: this row is ${bd('SECTION')}, the per-state rows in the action editor are ${bd('ONE ACTION')}.`);
const E_LIST = `${code('eyebrow')}, ${code('titleOverride')}, ${code('description')}, ${code('backLabel')}, ${code('emptyText')}`;
const ICON_NOTE = `The action label takes an optional icon before or after it from the ${bd('Icon Picker')} ⚑ — P0·2's button-icon rules: always Small, label-coloured, its Size and Colour rows hidden. It is reached from the button on canvas, not from a sidebar row.`;

const trioPage = extraVs => trio({
  bgNote: `From the pack. Background · Surface · Contrast, and the head keeps its arrangement at all three ⚑.`,
  vsNote: extraVs || K.VS_STD,
  tdNote: `None · Line · Fade above the section. Default None — A29 is the first thing on the route and A1's header is its own edge.`
});

/* the two authored tag lists, kept verbatim from the drawn panels */
const ITEM_ROWS = ['Infrastructure','Transport','Housing','Energy','Climate'].map(t =>
  `<div style="height:34px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;gap:8px;padding:0 9px"><span style="font-size:11px;color:#B3ADA3">⠿</span><span style="font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t}</span><span style="font-size:11px;color:#8A857C">✕</span></div>`).join('');
const itemList = n => `<div style="display:flex;flex-direction:column;gap:5px">${K.lab('Chosen tags')}
    <div style="display:flex;flex-direction:column;gap:6px">${ITEM_ROWS}
    <div style="height:34px;border:1px dashed #D8D2C8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#6E6A64">+ Add a tag</div></div>
    ${note(n)}</div>`;

const P = {};

/* ── 8 · Bar ───────────────────────────────────────────────────────────── */
P[8] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 8 OF 14 · PAPER PACK · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SIX OF ITS OWN + THE UNIVERSAL TRIO (VERTICAL SPACING AND TOP DIVIDER LOCKED) + THE DATA GROUP · QUICK: BAR HEIGHT, NAME SIZE, POST COUNT, RULES',
  footc: 'SIX + TRIO + DATA',
  rows: [
    seg('Bar height', ['Compact', 'Comfortable', 'Spacious'], 'Comfortable', `${bd('A real height, not padding')} ⚑ — 88 px at Comfortable on 1440 and the contents centre in the row. ${bd('Renamed from Height in this pass')} ⚑ so a strip height reads as a different thing from the universal Vertical spacing, which resolves to 0 here. Inert at 390, where the bar becomes two rows.`),
    seg('Name size', ['Regular', 'Large'], 'Large', '24 · 30. No Display value — 60 px in an 88 px bar is not a bar ⚑.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', `"Tag" · "Author" · "Archive" before the name. ${bd('This design and 9 Big Type were the only two that already had this row')} ⚑; the other twelve have it now.`),
    sel('Post count', 'At the right', 'At the right · After the name · Off.'),
    seg('Back link', ['Show', 'Hide'], 'Show', 'Right of the count. 44 px target inside an 88 px bar.'),
    sel('Rules', 'Top and bottom', `Top and bottom · Bottom only · None ⚑. ${bd('This row owns the bar&#8217;s own edges')}, which is why the universal Top divider is locked here — two lines a pixel apart is a mistake, not a choice.`),
    contentGroup([cEye, cName,
      txt('Description text', 'Not drawn in this design', 'KEPT', `${bd('Greyed, not deleted')} ⚑ — 8 Bar draws no description at any width. The field stays on the section and comes back the moment the design changes to 1 Centred, 2 Split Head or 4 Panel.`, true),
      cBack, cBackUrl, cEmpty, cZero]),
    trio({
      bgActive: 'Surface', bgNote: `Default ${bd('Surface')} — the bar is the ground ⚑. At Background the bar reads as a rule-bounded row and the Rules row above stops being optional.`,
      vsLock: true, vsValue: 'Resolves to 0', vsNote: `${bd('Resolves to 0')} ⚑ — the bar sits directly under A1's header with no space of its own, and ${bd('Bar height')} above is the only vertical measure this design has.`,
      tdLock: true, tdValue: 'None', tdNote: `${bd('Locked at None')} ⚑ — the bar's top edge is the ${bd('Rules')} row's business. Recorded in the spec's reconciliation notes as the one place a design's own control overlaps a universal one.`
    }),
    dataGroup({ tail: `${bd('At zero the count reads the catalog string')} and the notice renders below the bar on the page ground ⚑ — the bar itself has no empty state, because it always has a name and a number.` }),
    editingGroup(E_LIST, [`${bd('Long names ellipsise in CSS')}, so the full name stays in the accessible name and in the inline editor ⚑ — what you edit is never what is cut. ${bd('Member Visibility lands nowhere')} — the bar carries no action.`])
  ],
  rec: `Height renamed ${bd('Bar height')} ⚑ — a strip height is not the space around a section — and the universal ${bd('Vertical spacing')} is locked at 0, ${bd('Top divider')} locked at None because the ${bd('Rules')} row already owns the bar's top edge. The zero count string becomes the ${code('archive.count_empty')} catalog string; the kept-not-drawn ${code('description')} is now visible in the Content group as a greyed field. ${bd('Six controls of its own.')}`,
  specCtl: `${b('Bar height')} Compact · Comfortable · Spacious, 88 at Comfortable (was Height ⚑) — ${b('Name size')} Regular · Large, no Display ⚑ — ${b('Eyebrow')} Show · Hide — ${b('Post count')} At the right · After the name · Off — ${b('Back link')} Show · Hide — ${b('Rules')} Top and bottom · Bottom only · None. ${b('Six.')} Plus the trio — ${b('Vertical spacing resolving 0')}, ${b('Top divider locked None')} because Rules owns the top edge — and the Data group.`,
  specRec: `Height → Bar height · Vertical spacing resolves 0 · Top divider locked None (Rules owns the bar's edges) · catalog zero count · the kept ${code('description')} drawn greyed in the Content group.`
};

/* ── 9 · Big Type ──────────────────────────────────────────────────────── */
P[9] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 9 OF 14 · PAPER PACK · FIVE CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · FIVE OF ITS OWN + THE UNIVERSAL TRIO (BACKGROUND ROLE LOCKED AT INHERIT) + THE DATA GROUP · QUICK: NAME SIZE, DESCRIPTION, POST COUNT, COUNT ANIMATION',
  footc: 'FIVE + TRIO + DATA',
  rows: [
    seg('Name size', ['Large', 'Display', 'Poster'], 'Display', '76 · 104 · 132 at 1440; 60 · 76 · 88 at 834; 40 · 48 · 54 at 390 ⚑. No auto-fit ⚑.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', `13 uppercase above the name. ${bd('This design and 8 Bar were the only two that already had this row')} ⚑.`),
    seg('Description', ['Show', 'Hide'], 'Show', 'Clamped at 620 under the name.'),
    sel('Post count', 'In the corner', 'In the corner · Under the name · Off.'),
    seg('Count animation', ['On', 'Off'], 'Off', 'Counts up from zero on first view. Off by default ⚑, does not run while editing, and does not run under reduced-motion.'),
    contentGroup([cEye, cName, cDesc, cEmpty, cZero]),
    trio({
      bgLock: true, bgValue: 'Inherit', bgNote: `${bd('Locked at Inherit')} ⚑, and ${bd('Inherit is a value the product does not have yet')}: this design's ground is ${code('transparent')} — it declares none and shows whatever it is dropped onto, which is the whole of its difference from 1 Centred. Background · Surface · Contrast all paint. ${bd('A28·10 Slim raised this as its finding 7')} and A29·9 is the second design to need it; the alternative is that this design loses the reason it exists.`,
      vsNote: K.VS_STD,
      tdNote: `None · Line · Fade above the section. Default None — a hairline over a 104 px name is furniture the design does not need.`
    }),
    dataGroup({ tail: `${bd('At zero the corner reads the catalog string')} and ${bd('Count animation does nothing')} ⚑ — there is no number to count to.` }),
    editingGroup(`${code('eyebrow')}, ${code('titleOverride')}, ${code('description')}, ${code('emptyText')}`, [`${bd('The count is Ghost&#8217;s')} ⚑ — clicking it shows P0·1's lock pill, "Post count — from Ghost", and its zero form is the ${code('archive.count_empty')} catalog string rather than an authored field. ${bd('Member Visibility lands nowhere')}: no action, no back link, nothing to gate. ${code('count-up')} is the category's only module and P0·6 previews it — the resting frame is the final value.`])
  ],
  rec: `Padding retired into ${bd('Vertical spacing')} and ${bd('Background role is locked at Inherit')} ⚑ — a value the product does not have yet, because this design's ground is ${code('transparent')} and the three universal values all paint. ${bd('A28·10 raised it as finding 7; A29·9 is the second design to need it')} and the spec asks for it again. The zero count string becomes a catalog string. ${bd('Five controls of its own')} — the category's shortest list.`,
  specCtl: `${b('Name size')} Large · Display · Poster, its own ladder and its own value names ⚑ — ${b('Eyebrow')} Show · Hide — ${b('Description')} Show · Hide — ${b('Post count')} In the corner · Under the name · Off — ${b('Count animation')} On · Off, off by default ⚑. ${b('Five.')} Plus the trio — ${b('Background role locked at Inherit')} ⚑, a value the product does not yet have (A28 finding 7); Vertical spacing is the old Padding — and the Data group.`,
  specRec: `Padding → Vertical spacing · ${b('Background role locked at Inherit')}, the value A28·10 asked for and this design needs second ⚑ · Eyebrow row kept and now shared by all fourteen · catalog zero count.`
};

/* ── 10 · Boxed ────────────────────────────────────────────────────────── */
P[10] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 10 OF 14 · PAPER PACK · SEVEN CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SEVEN OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: BOX PADDING, ALIGNMENT, NAME SIZE, POST COUNT',
  footc: 'SEVEN + TRIO + DATA',
  rows: [
    seg('Box padding', ['Compact', 'Comfortable', 'Spacious'], 'Comfortable', `${bd('Inside the box')} — 48 × 56 at Comfortable on 1440, 40 at 834, 28 × 24 at 390 ⚑. ${bd('Renamed from Padding in this pass')} ⚑ so it reads as a different thing from the universal Vertical spacing, which now owns the space ${bd('around')} the box.`),
    seg('Alignment', ['Left', 'Centre'], 'Centre', 'Centre holds the 720 measure; Left starts the stack at the box\'s padding edge.'),
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '36 · 40 · 52 inside the box ⚑ — a step down from the open-page ladder, as in 4.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'Clamped at 560 inside the box.'),
    sel('Post count', 'Under the description', 'Under the description · Beside the eyebrow · Off.'),
    seg('Back link', ['Show', 'Hide'], 'Show', 'Under the count, inside the box.'),
    contentGroup([cEye, cName, cDesc, cBack, cBackUrl, cEmpty, cZero]),
    trioPage(`64 · 96 · 132 ${bd('around the box')}; 80 at 834, 64 at 390. ${bd('New in this pass')} ⚑ — this design's outside space was fixed at 96 with no control, and the universal row now owns it. The inside is ${bd('Box padding')} above, which is what inverted 4 Panel and still does.`),
    dataGroup({}),
    editingGroup(E_LIST, [`${bd('Member Visibility lands nowhere')} ⚑ — a hairline box round a name and a count has nothing to gate. P0·6 steps the zero state, which with 4 Panel is one of the two that look finished rather than broken.`])
  ],
  rec: `Padding renamed ${bd('Box padding')} ⚑ — the box's inside is a different ladder from the space around a section — and the universal ${bd('Vertical spacing')} now owns that outside space, which this design had fixed at 96 with no control ⚑. ${bd('Eyebrow: Show · Hide')} added; catalog zero count; Content and ${bd('Data')} groups drawn. ${bd('Seven controls of its own.')}`,
  specCtl: `${b('Box padding')} Compact · Comfortable · Spacious, inside the box (was Padding ⚑) — ${b('Alignment')} Left · Centre — ${b('Name size')} 36 · 40 · 52 ⚑ — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Post count')} — ${b('Back link')}. ${b('Seven.')} Plus the trio — ${b('Vertical spacing now owns the space around the box')}, which used to be fixed at 96 ⚑ — and the Data group.`,
  specRec: `Padding → Box padding (inside) and the space outside, once fixed at 96, is now the universal Vertical spacing ⚑ · Eyebrow row added · catalog zero count · Content and Data groups drawn.`
};

/* ── 11 · Filter ───────────────────────────────────────────────────────── */
P[11] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 11 OF 14 · PAPER PACK · SEVEN CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SEVEN OF ITS OWN (PLUS THE ITEM LIST) + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: TAG ROW, NAME SIZE, COUNTS ON TAGS, ALL TOPICS LINK',
  footc: 'SEVEN + TRIO + DATA',
  rows: [
    seg('Name size', ['Regular', 'Large', 'Display'], 'Regular', '40 · 48 · 60 at 1440.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'Between the name and the row.'),
    sel('Tag row', 'Most used', `Most used · Alphabetical · Chosen tags ⚑. Most used is ${code('order="count.posts desc"')}, limit 12 ⚑. ${bd('At the first two values this is a Ghost query')} and the list below is P0·3's Ghost-sourced card — read-only rows, "From Ghost", ${bd('and no Add button')} ⚑.`),
    itemList(`Shown only at Tag row: Chosen tags. Two to twelve, the ${bd('P0·3')} item controls. ${bd("Add opens Ghost's tag picker and the chosen tag lands at the foot")} ⚑, never an empty row — add arrives with content. Drag to reorder — ${bd('order is meaningful')}, the row is read left to right ⚑. ${bd('Remove is never disabled')}: removing the last one returns the control to Most used. Per-item content only — the label edits inline, the archive URL does not ⚑.`),
    seg('Counts on tags', ['Show', 'Hide'], 'Show', `The 13 px number inside each pill. Needs ${code('include="count.posts"')} ⚑.`),
    seg('Row overflow', ['Wrap', 'Scroll'], 'Wrap', 'Wrap runs to a second line; Scroll keeps one line and scrolls sideways. 390 is always Scroll ⚑.'),
    seg('All topics link', ['Show', 'Hide'], 'Show', `${bd('New in this pass')} ⚑ — the exit from the twelve-tag truncation. A 44 px text link at the end of the row, never a pill, so it cannot be mistaken for a tag. The row truncated at the query limit and said nothing about it; finding 5 now has an answer in this design.`),
    contentGroup([cEye, cName, cDesc,
      txt('All topics label', 'All topics →', 'INLINE', `Inline, ${bd('P0·1')}. Default "All topics →" ⚑, and a translation-catalog fallback exists for a site that authors nothing.`),
      txt('All topics link target', '— not set ⚑', 'LINK PICKER', `${bd('ARCHITECT: the tags-route decision')} ⚑ — the Link Picker offers pages, posts, tags, authors and a URL, and this field ${bd('defaults to the product&#8217;s tags route once that route exists')}. Ghost provides no tag index, which is what A20 and A29 both found. ${bd('With no target the link does not render')}, so the default state is honest rather than broken.`),
      cEmpty, cZero]),
    trioPage(),
    dataGroup({ tail: `${bd('The query is site-wide')} ⚑ — Ghost cannot return "tags that co-occur with this one", so the row is the site's tags ordered by post count with the current one marked. ${bd('On an author or date route nothing is marked')} and that is drawn rather than faked.` }),
    editingGroup(`${code('eyebrow')}, ${code('titleOverride')}, ${code('description')}, ${code('links[]')} labels, ${code('allTopicsLabel')}, ${code('emptyText')}`, [`${bd('The authored list is P0·3')} ⚑ and the queried list is P0·3's Ghost-sourced card with no Add button. ${bd('A chosen tag&#8217;s label stays inline-editable')} ⚑ even though it arrives from Ghost — once picked it is authored text on the section — while ${bd('a tag name drawn by the query is Ghost&#8217;s')} and answers "Edit in Ghost". Recorded in the reconciliation notes, because rule 4 and this category's own ruling meet here. ${code('allTopicsUrl')} and every other URL open the ${bd('Link Picker')}. ${bd('Member Visibility lands nowhere')} — the pills are navigation, not a call to action.`])
  ],
  rec: `${bd('All topics link: Show · Hide')} arrives ⚑ — a trailing 44 px text link that gives the twelve-tag truncation an exit, with its target through the Link Picker and ${bd('ARCHITECT: the tags-route decision')} on the frame. Padding retired into ${bd('Vertical spacing')}; ${bd('Eyebrow: Show · Hide')} added; the item list is named as ${bd('P0·3')} and the queried list as P0·3's Ghost-sourced card with no Add; catalog zero count. ${bd('Seven controls of its own, plus the item list.')}`,
  specCtl: `${b('Name size')} — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Tag row')} Most used · Alphabetical · Chosen tags (+ the P0·3 item list at that value ⚑) — ${b('Counts on tags')} Show · Hide — ${b('Row overflow')} Wrap · Scroll, forced Scroll at 390 ⚑ — ${b('All topics link')} Show · Hide, new ⚑. ${b('Seven')}, plus the item list. Plus the trio (Vertical spacing is the old Padding) and the Data group.`,
  specRec: `${b('All topics link')} added as the exit from the twelve-tag truncation ⚑, its target through the Link Picker and flagged ARCHITECT: tags route · Padding → Vertical spacing · Eyebrow row added · P0·3 named for both list states · catalog zero count.`
};

/* ── 12 · Portrait ─────────────────────────────────────────────────────── */
P[12] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 12 OF 14 · PAPER PACK · EIGHT CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · EIGHT OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: CARD WIDTH, PORTRAIT, META LINE, ACTION',
  footc: 'EIGHT + TRIO + DATA',
  rows: [
    sel('Card width', 'Inset', 'Inset 864 · Wide 1,296 ⚑. Wide is 4 Panel with a face and the hint says so.'),
    seg('Portrait', ['Large', 'Small', 'Off'], 'Large', '96 · 64 · none. Nothing to draw on a tag route and the control greys ⚑.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'The author bio, clamped at 520 inside the card. Ghost-owned — the lock pill, not the toolbar ⚑.'),
    sel('Meta line', 'Location, posts and site', 'Location, posts and site · Posts only · Off ⚑. Absent items and their separators drop.'),
    seg('Socials', ['Show', 'Hide'], 'Hide', `${bd('New in this pass')} ⚑ — the author's Ghost handles as ${bd('A21·6&#8217;s author social row')}: 32-in-44 icon slots from P0·2's brand set, in Ghost's order, under the meta line. ${bd('Version-gated')} ⚑ — Facebook, X and the website on 5.x; nine handles and the website on ≥ 6.36. ${bd('An absent handle drops silently')} and nothing is reserved, which is why the row is Hide by default. Read from the author's own fields, ${bd('never')} ${code('social_url')} ⚑.`),
    sel('Action', 'Button', 'Button · Link · Off. Accent fill, the category\'s only one in a resting state ⚑.'),
    rMemberVis,
    contentGroup([cEye, cName,
      txt('Bio', 'Writes about the parts of the internet that stopped&#8230;', 'FROM GHOST', `${bd('Ghost-owned')} ⚑ — the author bio is edited in Ghost, and P0·1 shows its lock pill here. At Data → Description: Custom text the section's own words replace it and become inline-editable.`, true),
      cActLabel, cActUrl, cEmpty, cZero]),
    trioPage(),
    dataGroup({ tail: `${bd('On a tag route')} the portrait slot is empty and the card holds the tag head ⚑. ${code('profile_image')}, ${code('location')}, ${code('website')} and ${bd('the social handles')} are all Ghost's, all optional and commonly empty — each drops with its separators.` }),
    editingGroup(`${code('eyebrow')}, ${code('titleOverride')}, ${code('actionLabel')}, ${code('emptyText')}`, [`${bd('The Subscribe action is the P0·4 member-aware editor')} ⚑, new in this pass: per-state show, label and link, so a paid member is not shown "Subscribe" on the writer's archive. ${bd('Member visibility')} above is the section-level row over it. ${ICON_NOTE}`, `${bd('Everything the card draws about the person is Ghost&#8217;s')} ⚑ — name, portrait, bio, location, website and every handle answer "Edit in Ghost". A21·6 set the social row and A29·12 reuses it rather than redrawing it.`])
  ],
  rec: `${bd('Socials: Show · Hide')} arrives ⚑ — A21·6's author social row, icon slots for the handles Ghost actually stores, version-gated at 6.36, absent handles dropping silently, Hide by default because most authors fill in none. ${bd('The Subscribe action is now P0·4')} with a section-level ${bd('Member visibility')} row and an optional icon. Padding retired into ${bd('Vertical spacing')}; ${bd('Eyebrow: Show · Hide')} added; catalog zero count. ${bd('Eight controls of its own.')}`,
  specCtl: `${b('Card width')} Inset · Wide — ${b('Portrait')} Large · Small · Off (greys on a tag route ⚑) — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Meta line')} Location, posts and site · Posts only · Off — ${b('Socials')} Show · Hide, new ⚑ (A21·6's row, version-gated) — ${b('Action')} Button · Link · Off — ${b('Member visibility')} Everyone · Logged out · Free · Paid, new ⚑. ${b('Eight.')} Plus the trio and the Data group.`,
  specRec: `${b('Socials')} added as A21·6's icon-slot row, version-gated and Hide by default ⚑ · the action is P0·4's member-aware editor under a Member visibility row · Padding → Vertical spacing · Eyebrow row added · catalog zero count.`
};

/* ── 13 · Index ────────────────────────────────────────────────────────── */
P[13] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 13 OF 14 · PAPER PACK · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SIX OF ITS OWN (PLUS THE ITEM LIST) + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: INDEX LIST, COLUMNS, NAME SIZE, COUNTS',
  footc: 'SIX + TRIO + DATA',
  rows: [
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', '36 · 40 · 52 in the 416 column ⚑.'),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', EYE),
    seg('Description', ['Show', 'Hide'], 'Show', 'Clamped at 380 in the head column ⚑.'),
    sel('Index list', 'Most used', `Most used · Alphabetical · Chosen tags ⚑. Twelve maximum ⚑. ${bd('At the first two values this is a Ghost query')} and the list below is P0·3's Ghost-sourced card — read-only rows, "From Ghost", ${bd('no Add button')} ⚑.`),
    itemList(`Shown only at Index list: Chosen tags. Two to twelve, the ${bd('P0·3')} item controls. ${bd("Add opens Ghost's tag picker; the tag lands at the foot")} ⚑ carrying its real name and count. Drag to reorder — ${bd('order is meaningful')}, the list reads down each column then across ⚑. ${bd('Remove is never disabled')}: removing the last returns the control to Most used. Per-item content only — the label edits inline, the archive URL does not ⚑.`),
    seg('Columns', ['Two', 'Three'], 'Three', `Of the 856. ${bd('Four is removed in this pass')} ⚑ — 202 px a column clipped tag names over 22 characters, and nothing else in this library clips a name it could wrap. Below the column count the last columns are empty and the panel says to use Two ⚑.`),
    seg('Counts', ['Show', 'Hide'], 'Show', `The number at each line's right. Needs ${code('include="count.posts"')} ⚑.`),
    contentGroup([cEye, cName, cDesc, cBack, cBackUrl, cEmpty, cZero]),
    trioPage(),
    dataGroup({ tail: `${bd('The index is site-wide')} ⚑ — there is no sibling-tag query in Ghost — and the current tag is marked with ${code('aria-current="page"')}, a weight change and a 2 px accent underline. ${bd('Above twelve the list still truncates silently')} ⚑: 11 Filter's All topics link is this pass's answer and ${bd('13 does not have one')}, because a thirteenth ruled line in a printed index is not an exit.` }),
    editingGroup(`${code('eyebrow')}, ${code('titleOverride')}, ${code('description')}, ${code('backLabel')}, ${code('links[]')} labels, ${code('emptyText')}`, [`${bd('The authored list is P0·3')} ⚑; the queried list is its Ghost-sourced card with no Add. A chosen tag's label stays inline-editable once picked; a name drawn by the query is Ghost's and answers "Edit in Ghost". ${bd('Member Visibility lands nowhere')} — the index is navigation. ${bd('The whole row is the target')} ⚑, not the name, which is also what the inline editor selects.`])
  ],
  rec: `${bd('Columns: Four is removed')} ⚑ — 202 px clipped names over 22 characters, against the library's never-clip ethos. Padding retired into ${bd('Vertical spacing')}; ${bd('Eyebrow: Show · Hide')} added; the two list states are named as ${bd('P0·3')}; catalog zero count; Archive source recut as ${bd('the Data group')}, where the silent truncation above twelve is now stated with 11 Filter's answer named and declined here. ${bd('Six controls of its own, plus the item list.')}`,
  specCtl: `${b('Name size')} 36 · 40 · 52 ⚑ — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} — ${b('Index list')} Most used · Alphabetical · Chosen tags (+ the P0·3 item list ⚑) — ${b('Columns')} Two · Three, ${b('Four removed in this pass')} ⚑ — ${b('Counts')} Show · Hide. ${b('Six')}, plus the item list. Plus the trio and the Data group.`,
  specRec: `${b('Columns: Four removed')} — it clipped names over 22 characters ⚑ · Padding → Vertical spacing · Eyebrow row added · P0·3 named for both list states · catalog zero count · the twelve-tag truncation stated, with 11's All topics link named and declined here.`
};

/* ── 14 · Sticky ───────────────────────────────────────────────────────── */
P[14] = {
  mast: 'A29 ARCHIVE HEADERS · DESIGN 14 OF 14 · PAPER PACK · SIX CONTROLS OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · RECONCILED 25 AUGUST 2026',
  ctl: 'THE CONTROL PANEL · SIX OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: NAME SIZE, POST COUNT, BAR CONTENTS, BAR RULE',
  footc: 'SIX + TRIO + DATA',
  rows: [
    seg('Name size', ['Regular', 'Large', 'Display'], 'Large', "40 · 44 · 56 in the head. The bar's 17 px is fixed ⚑."),
    seg('Eyebrow', ['Show', 'Hide'], 'Show', `${EYE} At Hide the bar's label goes with it — ${bd('Bar contents')} below still decides whether the bar carries one at all.`),
    seg('Description', ['Show', 'Hide'], 'Show', 'In the head only. Never in the bar ⚑.'),
    sel('Post count', 'In the bar', 'In the bar · In both · Off. Not "in the head only" — a bar without a number is a label with nothing to say ⚑.'),
    sel('Bar contents', 'Label, name, count and link', 'Label, name and count · Label, name, count and link · Name and count only.'),
    seg('Bar rule', ['Hairline', 'None'], 'Hairline', 'The line under the bar. None is disabled while the bar is pinned — an edgeless bar over scrolling posts has no boundary ⚑.'),
    contentGroup([cEye, cName, cDesc, cBack, cBackUrl, cEmpty, cZero]),
    trioPage(`64 · 96 · 132 ${bd('above only; below is 0 at every value')} ⚑ — the bar is the section's last pixel. ${bd('This is the row this design called Padding')}.`),
    dataGroup({ tail: `${bd('The bar authors nothing of its own')} ⚑ — it is a second rendering of the head's fields, so every string in the Content group above appears once and is edited once.` }),
    editingGroup(E_LIST, [`${bd('Editing the name edits both renderings')} ⚑ — head and bar are one field, and the inline editor selects the head. ${bd('Member Visibility lands nowhere')}: the bar carries a label, a name, a count and at most a back link. ${bd('No module')} ⚑ — ${code('position: sticky')} is CSS; a shrinking or solidifying bar would need ${code('header-scroll')}, which is A1's, and A29 does not claim it.`])
  ],
  rec: `Padding retired into ${bd('Vertical spacing')}, above only, with the below-is-0 rule stated in the row ⚑. ${bd('Eyebrow: Show · Hide')} added, and it takes the bar's label with it. Catalog zero count; Content and ${bd('Data')} groups drawn; the bar's "authors nothing of its own" rule is now in the Data group where the fields are listed. ${bd('Six controls of its own.')}`,
  specCtl: `${b('Name size')} 40 · 44 · 56 in the head, the bar fixed at 17 ⚑ — ${b('Eyebrow')} Show · Hide (new ⚑) — ${b('Description')} Show · Hide, head only ⚑ — ${b('Post count')} In the bar · In both · Off — ${b('Bar contents')} three named combinations — ${b('Bar rule')} Hairline · None, None disabled while pinned ⚑. ${b('Six.')} Plus the trio — Vertical spacing is the old Padding, above only — and the Data group.`,
  specRec: `Padding → Vertical spacing (above only; below stays 0) · Eyebrow row added, and it takes the bar's label with it · catalog zero count · Content and Data groups drawn.`
};
return P;
})();
