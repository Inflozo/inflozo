// A33-0 Category Proof — the four settlements, the tokenisation proof, the stress frame,
// the roster, the shared field list, the findings and the component inventory.
globalThis.A33PROOF = (function () {
const K = globalThis.A33LIB;
const { L, D, PACKS, MONO, PC, b, code, tile, table } = K;

const TAIL = `</x-dc>
<script type="text/x-dc" data-dc-script data-props="{&quot;showDark&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showSpec&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;}}">
class Component extends DCLogic {
  renderVals() {
    return { showDark: this.props.showDark ?? true, showSpec: this.props.showSpec ?? true };
  }
}
<\/script>
</body>
</html>
`;

/* the treatments, re-declared here so the proof does not depend on load order */
const AM = K.AM, WIDE = K.WIDE, BOX = K.BOX;
const STD = (w, k) => k === 'regular' ? AM(w) : k === 'wide' ? WIDE(w) : BOX(w);
const TR = {
  plain:{ key:'plain', contain:'none', rules:'both', pad:0, space:48, shadow:false, mediaW:STD,
    capMode:'measure', capAlign:'left', credit:'own', calloutPlane:'tint', emoji:'shown', gutter:12 },
  card:{ key:'card', contain:'card', rules:'none', pad:24, space:48, shadow:true,
    mediaW:(w, k) => STD(w, k) - 48, capMode:'measure', capAlign:'left', credit:'own', gutter:12 },
  band:{ key:'band', contain:'band', rules:'none', pad:32, space:56, shadow:false, planeW:w => WIDE(w),
    mediaW:STD, capMode:'measure', capAlign:'left', credit:'own', gutter:12 }
};

/* ── the tokenisation proof · 2 Card in three packs, light and dark ────── */
function packTile(packName, dark) {
  K.setPack(packName);
  const p = PACKS[packName];
  const t = dark ? p.d : p.l;
  const tr = TR.card;
  const m = 560, mw = K.fitMW(tr, m);
  const body = `<div style="background:${t.bg};border-radius:8px;padding:22px;display:flex;flex-direction:column;gap:${tr.space}px;align-items:center">
      ${K.imageCard(t, 1440, tr, { m, mw })}
      ${K.calloutCard(t, 1440, tr, { m })}
      ${K.bookmarkCard(t, 1440, tr, { m, tw:120 })}
      ${K.toggleCard(t, 1440, tr, { m, open:true })}
      ${K.audioCard(t, 1440, tr, { m })}
      ${K.buttonCard(t, 1440, tr, { m })}</div>`;
  const meta = `<span style="font-family:${MONO};font-size:9.5px;line-height:1.6;color:#6E6A64">RADIUS ${p.r} · ${p.head.replace(/'/g, '').split(',')[0].toUpperCase()} / ${p.body.replace(/'/g, '').split(',')[0].toUpperCase()} · SURFACE ${t.surf} ON ${t.bg} · ACCENT ${t.accent}</span>`;
  return tile({ w:670, bg:dark ? '#211D17' : '#FFFFFF', border:dark ? '#332E27' : '#EBE5DB',
    labelCol:dark ? '#A79E8F' : '#6E6A64',
    label:`${p.name.toUpperCase()} · ${dark ? 'DARK' : 'LIGHT'} · TREATMENT 2 CARD, UNCHANGED`, body:body + meta });
}

/* ── the stress frame · the worst realistic post ───────────────────────── */
function stress(t, w) {
  const tr = TR.plain;
  const C = K.CARDS;
  const keep = JSON.parse(JSON.stringify({ bookmark:C.bookmark, file:C.file, product:C.product, image:C.image }));
  C.bookmark.title = 'Space-Track.org — the United States Space Force public catalogue of resident space objects, two-line element sets, conjunction messages and decay predictions';
  C.bookmark.desc = '';
  C.file.name = 'orbit-weekly-catalogue-export-2026-08-12-final-revised-two-line-elements.csv';
  C.file.description = '';
  C.product.desc = 'Eleven letterpress plates, sewn.';
  const m = K.G(w).m;
  const row = html => `<div style="display:flex;justify-content:center;width:100%">${html}</div>`;
  const label = txt => `<div style="width:${AM(w)}px;margin:0 auto"><span style="font-family:${MONO};font-size:10px;color:${t.muted}">${txt}</span></div>`;
  const out = `<div style="padding:0 ${m}px">${K.boundary(t, w, 'STRESS · ONE POST, EVERY HARD CASE, TREATMENT 1 PLAIN')}</div>
    <div style="height:26px"></div>
    <div style="display:flex;flex-direction:column;gap:${tr.space}px;align-items:center;padding:0 ${m}px">
      ${label('A 168-CHARACTER CALLOUT AND A 12-WORD ONE, ADJACENT · TWO CARDS OF THE SAME TYPE IN A ROW KEEP ONE SPACE, NOT TWO ⚑')}
      ${row(K.calloutCard(t, w, tr, { text:'The 12 August catalogue revised the July figures down by four per cent, which changes the second table in this piece and the sentence above it, and we have left both as they were published.' }))}
      ${row(K.calloutCard(t, w, tr, { text:'The correction is at the foot of this piece.' }))}
      ${label('A SCRAPED TITLE OF 162 CHARACTERS, NO DESCRIPTION AND NO THUMBNAIL · NOTHING IS CLAMPED AND NO BOX IS DRAWN ⚑')}
      ${row(K.bookmarkCard(t, w, tr, { thumb:false }))}
      ${label('NINE GALLERY IMAGES · GHOST’S OWN ROWS · THREE, THREE, THREE AT THIS WIDTH · ONE CAPTION FOR THE CARD, NOT ONE PER ROW ⚑')}
      ${row(K.galleryCard(t, w, tr, { n:3, rows:3, width:'regular', m:AM(w), mw:AM(w) }))}
      ${label('A FILE WHOSE NAME IS 74 CHARACTERS AND WHOSE DESCRIPTION THE AUTHOR LEFT EMPTY')}
      ${row(K.fileCard(t, w, tr, { desc:false }))}
      ${label('A PRODUCT WITH NO IMAGE, A ONE-LINE DESCRIPTION AND A FIVE-STAR RATING')}
      ${row(K.productCard(t, w, tr, { image:false }))}
      ${label('A HEADER CARD AT LARGE, IMMEDIATELY FOLLOWED BY A BUTTON CARD · NO PARAGRAPH BETWEEN THEM ⚑')}
      ${row(K.headerCard(t, w, tr, { size:'large' }))}
      ${row(K.buttonCard(t, w, tr, {}))}
      ${label('AN IMAGE WITH A 190-CHARACTER CAPTION AND A CREDIT ON ITS OWN LINE')}
      ${row(K.imageCard(t, w, tr, {}))}
    </div><div style="height:56px"></div>`;
  Object.assign(C.bookmark, keep.bookmark); Object.assign(C.file, keep.file);
  Object.assign(C.product, keep.product); Object.assign(C.image, keep.image);
  return out;
}

/* ── tables ────────────────────────────────────────────────────────────── */
const ROSTER = table({ w:1288, cols:['#', 'TREATMENT', 'TUPLE', 'CTL', 'MODULES'], widths:[34, 148, 780, 56, 190],
  rows:[
    ['1', 'Plain', 'article body · none · page · variable · inline · hairline rules only', '6', 'accordion, core'],
    ['2', 'Card', 'article body · card · surface · variable · inline · the raised panel', '6', 'accordion, core'],
    ['3', 'Panel', 'article body · box · surface · variable · inline · plane past the measure', '6', 'accordion, core'],
    ['4', 'Wide', 'media frame · none · page · variable · edge · media one rung wider', '6', 'accordion, core'],
    ['5', 'Full Bleed', 'media frame · none · page · variable · full-bleed · the viewport-edge bleed', '6', 'accordion, core'],
    ['6', 'Contrast Band', 'article body · box · contrast · variable · inline · the inverted card plane', '6', 'accordion, core']
  ] });

const FIELDS = table({ w:1288, cols:['CARD', 'FIELD', 'TYPE', 'OPT', 'LIMIT AND NOTE'], widths:[124, 214, 150, 62, 700],
  rows:[
    ['Image', 'src · alt · caption · width', 'file · text · rich text · enum', 'alt, caption', 'alt ≤ 125 chars · width is regular · wide · full, authored per card'],
    ['Gallery', 'images[] · caption', 'file array · rich text', 'caption', '1–9 images, ordered · Ghost’s script computes the row ratios'],
    ['Bookmark', 'url → title, description, icon, author, publisher, thumbnail · caption', 'url → scraped · rich text', 'caption, and every scraped field', 'the author owns the URL only ⚑ · any scraped field may be absent'],
    ['Callout', 'text · emoji · colour', 'rich text · emoji · enum', 'emoji', 'nine colour values, Ghost’s own palette ⚑ · text required'],
    ['Toggle', 'heading · content', 'text · rich text', '—', 'both required · Ghost supplies the chevron and the open/close script'],
    ['Button', 'label · url · align', 'text · url · enum', '—', 'label ≤ 40 chars · align is left or centre · the fill is the site accent'],
    ['Embed', 'url → html · caption', 'url → provider markup · rich text', 'caption', 'the markup is the third party’s and A33 styles only the frame ⚑'],
    ['Product', 'title · description · image · rating · buttonLabel + buttonUrl', 'text · rich text · file · int · text + url', 'image, rating, button pair', 'rating 1–5 · the button pair is both-or-neither'],
    ['File', 'file · title · description → name, size', 'file · text · rich text → derived', 'description', 'name and size come from the upload and are read-only'],
    ['Header', 'heading · subheading · buttonLabel + buttonUrl · size · style · backgroundImage', 'text · text · text + url · enum · enum · file', 'subheading, button pair, image', 'three sizes × four styles = twelve variants the theme owes ⚑ · C.1'],
    ['Markdown', 'md', 'rich text', '—', 'no wrapper class · renders as ordinary headings, lists, links and images ⚑'],
    ['HTML', 'html · visibility', 'author markup · enum', '—', 'public · free members · paid members · whatever the author pastes wins ⚑'],
    ['Divider', 'position only', '—', '—', 'a bare hr · weight, width, space and an optional glyph are the treatment’s'],
    ['Email content', 'greeting · fallback · text', 'text · text · rich text', 'greeting, fallback', '<b>never renders on the web</b> ⚑ · first_name placeholder with the author’s fallback'],
    ['Call to action', 'text · image · sponsorLabel · buttonLabel + buttonUrl · background · visibility · showOn', 'rich text · file · text · text + url · enum · enum · enum', 'image, sponsorLabel, button pair', '<b>renders on the web, in the newsletter, or both</b> ⚑ · audience is public, free or paid'],
    ['Public preview', 'position only', 'marker', '—', 'not a card on the web ⚑ · Ghost cuts the response here and A32 renders the gate'],
    ['GIF', 'the search and the pick', 'file', '—', 'renders as an image card and follows those settings'],
    ['Audio', 'file · title · thumbnail', 'file · text · file', 'thumbnail', 'Ghost ships the player and its script ⚑ · A33 styles the shell and the progress accent'],
    ['Video', 'file · poster · loop · width', 'file · file · bool · enum', 'poster, loop', 'three widths · Ghost ships the player · A33 styles the play button, scrim and bar'],
    ['Signup', 'heading · subheading · disclaimer · buttonText · layout · background · label', 'text · text · text · text · enum · colour or file · text', 'subheading, disclaimer, background, label', '<b>the author’s colours arrive as inline styles</b> ⚑ · shape and spacing only'],
    ['Every card', 'the treatment’s own values', 'site-wide settings', '—', 'space, captions, credit, plane, width resolution — one value each, site-wide ⚑']
  ] });

const INVENTORY = table({ w:1288, cols:['COMPONENT', 'WHAT IT IS', 'FIRST FROM'], widths:[248, 800, 232],
  rows:[
    ['Card plane vocabulary', 'The four grounds a Koenig card may sit on — none, panel, plane, band — and the rule that a treatment picks one for every card at once', 'A33·1–3, 6'],
    ['Caption and credit pair', '13.5 px caption in text-muted with the credit as the caption’s trailing em run, inline or on its own 13 px line', 'A33·1'],
    ['Width resolution table', 'What Ghost’s regular, wide and full resolve to, per treatment and per width — the category’s central artefact', 'A33·1'],
    ['Bookmark card', 'One link: text column, publisher line with a 16 px icon, 168 px thumbnail right, thumbnail above at ≤ 767', 'A33·1'],
    ['Toggle card', 'Native details/summary with a 24 px chevron and a hairline divider between summary and body', 'A33·1'],
    ['File card', 'Title, description, mono filename · size, and a 44 px download glyph at the right', 'A33·1'],
    ['Product card', 'Image, title, description, five-star rating with its text equivalent, and one action', 'A33·1'],
    ['Koenig header card', 'Three sizes (232 · 312 · 400 min-height) with a centred heading, subheading and action on a plane', 'A33·1'],
    ['Embed frame', 'A provider iframe in an aspect-ratio box: the theme owns the frame, the radius and the caption and nothing inside', 'A33·1'],
    ['Gallery row', 'Up to three plates per row at Ghost’s computed ratios with one gutter token', 'A33·1'],
    ['The bleed rule', 'The radius token is dropped at the viewport edge and nowhere else — two corners, not four', 'A33·5'],
    ['On-band card derivation', 'Action becomes the carried colour, focus ring 2 px carried, divider carried at 20 %', 'A17·7 → A33·6'],
    ['Primary button', 'Accent fill, 14–15 px/600, radius token', 'A1·1'],
    ['Striped image plate', 'The placeholder with a mono crop caption, one pair of stripes per mode', 'A4 → A19'],
    ['Warm scrim', 'The one scrim over a photograph, contrast-checked, used only by 5 Full Bleed’s caption-over value', 'A20·13'],
    ['Focus ring', '2 px accent at a 4 px offset, re-derived to the carried colour on contrast', 'A6 → A17·7'],
    ['Missing-image rule', 'A missing photograph reflows or hands off; it never becomes a grey box', 'A19'],
    ['Content box and padding ladder', '1,296 on 72 · 754 on 40 · 350 on 20; 32 · 48 · 64 named, never numeric in a control', 'A17'],
    ['Article measure and body type', '720 at 1440, 754 at 834, 350 at 390; body 19/1.7', 'A25'],
    ['Site bar and footer neighbour', 'The chrome every frame is drawn inside, at low opacity', 'A1·1, A3·1'],
    ['Sidebar control kit', 'Segmented row, select, treatment picker, help line, disabled value with its ratio', 'Editor Sidebar Kit'],
    ['Tile and spec card', 'The 634 / 652 / 1,288 canvas furniture these frames are annotated with', 'A23']
  ] });

const FINDINGS = [
  ['Ghost’s callout palette is nine literal colours and the pack ships seven roles. ⚑',
    'There is no mapping that keeps both. Collapsing the nine onto the pack’s planes loses the author’s intent — blue and green become the same plane; honouring them breaks §2 and every pack’s harmony. <b>A33 offers the choice as one shared control (Callout colours: Pack tokens · Ghost’s palette) and defaults to tokens.</b> The architect should decide whether that control belongs in the Cards module or in the Style Pack.'],
  ['Ghost’s gallery card ships its own row-ratio script and the registry has no module for it. ⚑',
    'FR-G7 is closed and none of the 31 modules describes it. With JS off the images render at equal widths, which is legible but not what the author arranged. <b>The closest module is <code>core</code>, and A33 declares that.</b> This is the second category to hit a Ghost-owned script with no registry entry — the toggle card is the first.'],
  ['C.1’s ownership matrix lists “corners” as a per-card setting for eleven cards. A33 answers with the pack’s radius token and offers no control. ⚑',
    '<b>Two drawn artefacts now disagree</b>, and the panel is the authority per this project’s own rule. A card that could mix radii would fail §3·1 the moment a user changed pack, so A33’s answer is the shippable one — but C.1’s matrix and its per-card panels should be amended rather than left to contradict it.'],
  ['A treatment re-resolves the author’s width class, and so does a section. ⚑',
    'A25·3 Sheet and A25·5 Full Bleed already overrule the Cards module for their own ground; A33·4 Wide and A33·5 Full Bleed now do it site-wide. <b>Two layers can disagree about what “wide” means.</b> A33’s answer: the section wins inside its own ground, the treatment wins everywhere else. That precedence is not written anywhere the user can see it.'],
  ['The toggle card’s open/close script is Ghost’s, not the theme’s. ⚑',
    'Tested against Ghost: the card is <b>a plain container with a heading and a button, not disclosure markup</b>, so the registry degradation — native <code>&lt;details&gt;</code>, fully functional — is false here and <b>with JavaScript off the toggle cannot open</b>. A33 still declares <code>accordion</code> as the nearest module and drops the quoted degradation. The registry needs either a degradation that matches Ghost’s markup or an entry saying the behaviour is Ghost’s own.'],
  ['A33 has no section, so its tuples describe the card. ⚑',
    'Every other category’s containment and ground slots describe a section on a page. A33 is a stylesheet over cards inside A25’s section. <b>The tuple slots are read as the card’s</b>, which the reconciliation pass should expect rather than flag — otherwise all six read <code>none · page</code> and the uniqueness check fails on a technicality.'],
  ['Six treatments plus per-card panels means a user meets up to twelve controls to style one callout. ⚑',
    'The treatment carries six and the callout’s own panel carries six more. <b>That is within the letter of §3·5 and against its spirit.</b> The product question: does the per-card panel collapse to “exceptions only” once a treatment is chosen — showing three controls instead of six — or does the treatment become a preset that writes the per-card panels and then steps out of the way?']
];

function build() {
  let out = K.DOC_HEAD;
  out += K.intro({ rail:'A33 KOENIG CARD TREATMENTS · CATEGORY PROOF · SIX TREATMENTS · PAPER PACK',
    title:'A33 · Category Proof',
    paras:[
      'A33 is not a section. It is the site-wide styling of the cards an author inserts into a post, and it lives on the same surface as C Post Body’s card module: one treatment picker at the top of the Cards panel, six treatments, and the per-card panels underneath it unchanged.',
      'Six treatments, twenty cards each. What separates them is the plane under a card and what the author’s width class resolves to — never colour, type or radius, which the Style Pack owns. This frame carries the four settlements, the tokenisation proof, the stress frame, the roster, the shared field list, the findings and the cumulative component inventory.'
    ] });

  /* the four settlements */
  const set = (n, head, body) => tile({ w:634, bg:'#FFFFFF', border:'#E7E2DB',
    label:`SETTLEMENT ${n}`, body:`<div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;line-height:1.65;color:#3A3835">
      <span style="font-size:14px;font-weight:600;line-height:1.4;color:#1C1B1A">${head}</span>${body.map(x => `<span>${x}</span>`).join('')}</div>` });
  out += K.section('A33-0 settlements', K.cap('WHAT A33 SETTLES · §8 OF THE BRIEF, ANSWERED') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
      set(1, 'Every card Ghost can render', [
        `${b('All twenty cards on ghost.org/help/cards are drawn in every treatment')}, in Ghost’s own order: image, markdown, HTML, gallery, divider, bookmark, email content, call to action, public preview, button, callout, GIF, toggle, audio, video, file, product, header, embeds, signup.`,
        `${b('Seven of the twenty are not the theme’s to arrange, and the roll says so on each one')} ⚑: ${b('markdown')} carries no wrapper class and is A25’s type verbatim; ${b('HTML')} is whatever the author pasted; ${b('embeds')} are the provider’s markup; ${b('gallery, toggle and audio')} ship Ghost’s own CSS and script, so A33 re-styles the shell only; ${b('email content never renders on the web at all')} ⚑ and is drawn dashed so a user can see that. ${b('The public-preview marker is A32’s')} — A33 owns the space above the cut and nothing below it. ${b('Blockquote and the code block are text formats rather than cards')} and belong to A25’s measure ⚑.`,
        `${b('The call-to-action card renders on the web')} ⚑ — Ghost lets the author show it on the site, in the newsletter or both, so it is a themed card with a sponsor label, an image, a button and its own visibility. ${b('The line between a treatment and A25’s measure')}: A25 owns the column, the paragraph rhythm, the heading scale and the type for everything that is words on the page. ${b('A33 owns the plane under a card, the space around it, its caption and what its width class resolves to')} ⚑. A blockquote is A25’s. A callout is A33’s.`
      ])}${
      set(2, 'Captions, credits and dark mode', [
        `${b('The caption is 13.5 px in')} ${code('text-muted')}, ${b('at the measure by default')}, and it belongs to the ${code('&lt;figcaption&gt;')} of the card that owns it. Three values in every treatment: under-left, under-centred, hidden. ${b('Hidden never touches')} ${code('image.alt')} ⚑.`,
        `${b('Ghost has no credit field')} ⚑. The credit is the caption’s trailing ${code('&lt;em&gt;')} run — the convention editors already use — and the Credit line control decides whether it sits inline with the caption or drops to a 13 px second line. ${b('That is an invented reading of an existing field, and it is flagged in all six specs')}.`,
        `${b('Dark is re-tuned per card, not inverted')}: ${b('the warm shadows are dropped entirely')} rather than darkened ⚑, surfaces lift one step, the callout takes the dark hover token rather than a lightened copy of the light one, ${b('the placeholder stripes change pair')}, and ${b('the contrast band inverts the other way')} — a light band in a dark article.`
      ])}${
      set(3, 'The relationship to C Post Body’s card module', [
        `${b('Same surface, one vocabulary')} ⚑. The six treatments are ${b('a picker at the top of the Cards module')}, where a section’s Design picker sits. Below it are the treatment’s own six controls, which write ${b('one value each, site-wide')}.`,
        `${b('The per-card panels stay exactly as C.1 drew them')} — thumbnail side, chevron side, emoji shown, which metadata rows show. ${b('What the treatment claims, the per-card panel no longer offers')} ⚑: plane, padding, caption placement, width resolution and corners are the treatment’s, in one place, for every card.`,
        `${b('This is the reading A33 chose and Prompt 2 Part C does not state it')} ⚑ — the module was drawn with per-card panels and no treatment layer. ${b('Finding 7 puts the product question plainly')} rather than assuming the answer.`
      ])}${
      set(4, 'What a treatment may and may not do', [
        `${b('May:')} choose the plane, the space, the caption, the credit, the emoji, ${b('and what regular, wide and full resolve to')} ⚑.`,
        `${b('May not:')} set a colour, a font, a radius or a width in pixels; style one card of one post; crop, tint, filter or dim a photograph (A19) ⚑; add markup to ${code(K.hb('content'))}; touch alt text; reach inside an embed’s iframe; or invert an image, a gallery or an embed at any control value ⚑.`,
        `${b('And one rule that reads like a restriction and is the point:')} ${b('A33 renders nothing of its own')} ⚑. With no cards in a post there is no wrapper, no padding and no trace — which is why the empty state of every treatment is the same three words.`
      ])}</div>` +
    K.note(`${b('All twenty editor cards drawn, in Ghost’s own order')} ⚑ — and the twelve are named because §8·1 asks for “every card Ghost can render” and ${b('a list that quietly stopped at ten would be the worse answer')}. ${b('Three of the twelve are A25’s, not A33’s')}, which is §8·4 answered: ${b('if it is words in the column it is the measure’s; if it is an object in the column it is a card’s')}.`));

  /* tokenisation */
  out += K.section('A33-0 tokenisation light', K.cap('THE TOKENISATION PROOF · TREATMENT 2 CARD IN THREE PACKS · LIGHT · 560 MEASURE IN A 670 TILE') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
      ['paper', 'studio', 'garden'].map(p => packTile(p, false)).join('')}</div>` +
    K.note(`${b('Same structure, three token sets, nothing moved')} ⚑. Radius 8 · 2 · 20; Georgia · Bricolage · Bricolage; ${b('and the one place the packs are visibly different is the one place they should be')} — the panel’s edge, where Studio’s 2 px radius and #F4F4F2 ground read as flat and Garden’s 20 px reads as soft. ${b('No element changed position, size or order')}, which is the test §3·1 sets.`));
  out += K.wrapIf('showDark', K.section('A33-0 tokenisation dark', K.cap('THE SAME THREE PACKS · DARK · SHADOWS DROPPED, SURFACES LIFTED ONE STEP') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${
      ['paper', 'studio', 'garden'].map(p => packTile(p, true)).join('')}</div>` +
    K.note(`${b('Dark is where the treatment earns its tokens')} ⚑: ${b('every pack drops its shadow and the hairline does the whole job of the panel’s edge')}. Studio’s #191919 on #101010 is the tightest step of the three and the reason ${b('Panel: Fill only exists as a control value')} — a pack whose surface is one step from its ground needs the border, and a pack two steps away does not.`)));
  K.setPack('paper');

  /* stress */
  out += K.section('A33-0 stress', K.cap('THE STRESS FRAME · DESKTOP 1440 · ONE POST CARRYING EVERY HARD CASE · TREATMENT 1 PLAIN') +
    K.frame(L, 1440, stress(L, 1440), {}) +
    K.note(`${b('Seven hard cases in one post')}: two callouts of wildly different lengths side by side, ${b('a 162-character scraped bookmark title with no description and no thumbnail')}, nine gallery images, a 74-character filename, a product with no image, ${b('a large header card immediately followed by a button card')}, and a 190-character caption with a credit under it. ${b('Nothing is clamped, nothing scrolls inside a card and nothing is centred to hide its length')} ⚑. ${b('The one rule the frame proves')}: two cards of the same type in a row keep one space between them, not two.`));

  /* roster + fields + inventory + findings */
  out += K.wrapIf('showSpec', K.section('A33-0 roster', K.cap('THE ROSTER · SIX TREATMENTS · EVERY TUPLE UNIQUE, EVERY CONTROL COUNT SIX') + ROSTER +
    K.note(`${b('Six treatments, six controls each, two modules each')} ⚑ — and the module list being identical in all six is the honest answer for a category that is a stylesheet. ${b('The tuples differ in a closed slot every time')}: containment separates 1 from 2 and 3; ground separates 3 from 6; ${b('media placement is the only thing between 4 Wide and 5 Full Bleed')}, and it is enough — one reaches the container’s edge, the other the window’s.`)));

  out += K.wrapIf('showSpec', K.section('A33-0 fields', K.cap('THE SHARED FIELD LIST · THE UNION EVERY TREATMENT DRAWS FROM') + FIELDS +
    K.note(`${b('Fifty-nine authored fields and eight scraped or derived ones, and every treatment draws all of them')} ⚑ — which is what makes switching treatment safe: ${b('a treatment cannot decline a card the author inserted')}, so there is no field with nowhere to live. ${b('The one field list that is not the author’s is the bookmark’s')}: they own the URL and Ghost owns the other six.`)));

  out += K.wrapIf('showSpec', K.section('A33-0 findings', K.cap('FINDINGS FOR THE ARCHITECT · SEVEN, FIVE OF THEM NEW') +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${FINDINGS.map(([h, x], i) =>
      tile({ w:634, bg:'#FFFFFF', border:'#E7E2DB', label:`FINDING ${i + 1}`,
        body:`<div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;line-height:1.65;color:#3A3835">
          <span style="font-size:13.5px;font-weight:600;line-height:1.45;color:#1C1B1A">${h}</span><span>${x}</span></div>` })).join('')}</div>` +
    K.note(`${b('Two of the seven are carried forward rather than new')}: the width-resolution conflict A25 raised at section level, and the Ghost-owned-script gap A14 raised about the gallery card. ${b('The five new ones are all the same shape')} — ${b('Ghost owns a piece of the card and the token system owns the rest')}, and the seam between them needs a decision the design pass can flag but not make.`)));

  out += K.wrapIf('showSpec', K.section('A33-0 inventory', K.cap('COMPONENT INVENTORY · CUMULATIVE · TWELVE ESTABLISHED HERE, TEN REUSED VERBATIM') + INVENTORY +
    K.note(`${b('Twelve components established, ten carried in unchanged')}. The twelve are the cards themselves and the three rules that govern them — ${b('the width resolution table, the bleed rule and the on-band derivation')}. ${b('Nothing in A33 replaces an earlier component')}: A1’s button is the button card, A19’s missing-image rule is the bookmark’s empty state, and A17·7’s on-contrast derivation is the whole of 6 Contrast Band’s colour.`)));

  out += TAIL;
  return out;
}
return { build };
})();
