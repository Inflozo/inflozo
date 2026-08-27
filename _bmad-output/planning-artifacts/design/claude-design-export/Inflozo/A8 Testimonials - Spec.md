# A8 Testimonials — written specification

15 designs · Paper pack · drawn in this project as `A8-1 Single.dc.html` … `A8-15 Overlap.dc.html`, with the category's shared artefacts in `A8-0 Category Proof.dc.html`.

Read `A8-0` first. It carries the four settlements §8 asks A8 to make, the quote ladder, the attribution block, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass — including **the six amendments the drawn designs forced on it**. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

**Specification-only pass, this session.** Every design now carries five added fields at the head of its section — descriptor, structural descriptor, archetype, behaviour module, and an **Items** field naming what the sidebar does with `quotes[]`. Nothing drawn changed, no frame moved, and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand exactly as written.

**Fourth pass — the controls-reconciliation patch (this document's current state), 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary, Ghost's verified data surface and the shared **P0 editor primitives** — the inline text toolbar and its link popover, the icon slot and Icon Picker, the item-list controls, the member-aware action editor, the “Populate from…” data panel and the editor state switcher — thinking like a person editing their own site. **Six things changed everywhere:** the universal trio (Background role · Vertical spacing · Top divider) now sits outside every design's control list and every per-design Padding and Ground row retires into it; **every visible text edits inline on canvas**, the quote with the marks toolbar suppressed; the section link goes through the Ghost-aware Link Picker and takes an optional icon; **eleven designs gain Avatars: Shown · Hidden**; fourteen gain Member visibility; and every panel carries a Data group stating the category's one data fact. **The control ceiling is lifted** from the old 4–7 norm to the PRD's ~15 plus the trio and the Data group; A8 uses four to seven of its own on every design. **No “Preview” control existed anywhere in A8**, so none was removed, and **no registry addition is asked for**. The full list of frames changed and of earlier rulings this pass overturns is in §19.

**No module rename was needed.** This document had named no modules at all — it wrote behaviour as motion and state rather than as JavaScript — so nothing here had to be corrected against the fixed 31-module registry (FR-G7), and **no drawn frame or spec card in A8 carries a module name either**, so unlike A7 there is no drawing pass owed. Every module name below is the registry's and every no-JS sentence is quoted from it rather than composed here.

**A8 uses two modules.** **`carousel`** on 7 Slider and **`tabs`** on 11 Faces. **Thirteen of the fifteen declare nothing**, which is what an authored quotation section should be: every quote, name, role, organisation and avatar in A8 is server-rendered on all fifteen designs, so **no A8 design loses a word without JavaScript**. What looks like behaviour elsewhere in the category is CSS or the template — the 1080 and 767 hand-offs are media queries, 5 Wall's arrangement is `column-count` with `break-inside: avoid`, 7 Slider's rail is native `overflow-x` with `scroll-snap`, its set-wide equal card height is a stretched flex track, and **the step-down, the character counters and 14 Slim Line's 120-character hand-off are computed from the authored string before the page is served**. None of those is a module.

**`core` is assumed, not declared per design.** Every JS-conditional branch in A8 — and there are only two — is CSS keyed off `.js-enabled`, which is `core`'s job: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than fifteen times. *Flagged: not listing it per design is mine.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM — the category's motion rule stated as a property of the module. Both A8 modules are edit-safe, with no exceptions, which is why **every frame in A8 is a resting state**.

**One finding, and it is `tabs` against A8's own structure rule.** The registry's degradation for `tabs` is “All panels render stacked and visible, each preceded by its tab label as a heading.” A8's floor says there is not one `<h3>` in the whole category and that a person's name is not a heading at any size. With JavaScript off, 11 Faces' module would put three to six headings — each one a reader's name — into a category that has none, and the design would be 12 Rows with headings rather than 12 Rows. **The registry is the authority on degradation, so its sentence stands as quoted and the conflict is the architect's to settle**: either 11 Faces takes `<h3>` names in its no-JS branch alone, or `tabs` takes a stated exception for a category whose panel labels are attributions. **The closest module is the one already declared; nothing here asks for a new one.**

**The item shape, reconciled.** The brief's `items[] {quote, name, role?, avatar?, rating?, link?}` is this document's `quotes[] {quote, name, role, org, avatar}`. Two differences, both written before this pass and neither changed by it: **`rating` does not exist anywhere in A8** — no rating, score, star, tick or “verified” mark at any value in any of the fifteen, because Ghost stores none of it and the mark implies a review system behind it — and **there is no per-item `link`**; the category's only link is the section's optional `linkLabel`/`linkUrl` pair, because a card whose only destination is the quotation it already shows is a link to nowhere. **`org` is the field A8 adds**: role and organisation are two fields drawn as one comma-joined line.

**Item controls — the floor, stated once, and it is P0·3's.** The repeater is labelled **Quotes**, sits under the head fields in every design and uses the **shared item-list controls** unchanged: add arrives with content, remove is never disabled, drag reorders, per-item content only. **Add quote** sits at the foot of the list and appends; authored order is the drawn order in all fifteen, so a new quote lands last and is drawn last wherever the design's count reaches it. **A new quote arrives with content, never an empty shell** — `quote` reads “Type the quotation here, as the reader wrote it — at least forty characters.”, `name` reads “Reader's name”, `role`, `org` and `avatar` are empty, and the editor opens the quote field with the placeholder selected. The placeholder is over the 40-character floor, so the item is valid the moment it exists and no design is ever asked to draw an invalid one. **Remove** is on the row; removing down to one is allowed and each design says what it then draws, and removing the last row is allowed too — **the section then does not render**, and the editor keeps the empty repeater and its Add quote control rather than drawing a placeholder person. **Reorder** is a drag handle on the row, and **order is meaningful in every design in A8**: it is the drawn order, and in the eleven designs that draw fewer quotes than may be authored it also decides which ones are drawn. **Inside an item the user edits content only** — `quote` (required, 40–300), `name` (required, ≤ 40), `role` (optional, ≤ 40), `org` (optional, ≤ 40), `avatar` (optional, square, ≥ 88 px) — and never layout, spacing, alignment or emphasis. Empty optionals: role alone or organisation alone sits on the line by itself; with neither, the name stands alone; **with no avatar the block closes up** — no circle, no initials, no indent held for it — 11 Faces excepted. **No control in the sidebar addresses one item.** Every design control writes one value onto the section and the stylesheet reads it, so there is no bigger card 3, no per-item alignment and no featured flag; 13 Highlight's lead is the repeater's first row and nothing else.

**Flagged, for this pass.** The structural-descriptor vocabulary; **the count-class convention** — a design whose count control stays inside one class is written as that class, and one whose control crosses classes is `variable`; the tuple naming the drawn ground rather than the range a Ground control offers; the placeholder strings a new quote arrives with and the drag handle; not declaring `core` per design; and reading A8's two drawn behaviours as `carousel` and `tabs`.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**Nothing comes from Ghost. That is the category.** Ghost has no testimonial, review or endorsement resource, so **every word in these fifteen designs is authored in the section**, in a repeater. Comments are refused as a source — a reader who replied under a post agreed to be read there, not lifted into a marketing band, and A28 Comments owns that surface. Members are refused too: a name and an email in Ghost's members table are private data. **A8 is the first category in the library that reads no Ghost resource at all**, which means it has no missing-data branch: the only failure available is an empty repeater, and the answer is that the section does not render. **Flagged**: both refusals.

**The universal trio, and what it retired.** Every placeable section carries **Background role**, **Vertical spacing** (Compact / Comfortable / Spacious) and **Top divider** (None / Line / Fade) outside its own control list. **A8's per-design Padding row was Vertical spacing under another name and retires into it everywhere** — 64 · 96 · 132 on twelve designs, and the two designs with their own ladder keep it as the trio's resolution rather than as a second row: **9 Contrast Band's 44 · 64 · 88** (on that design the band *is* the section, so the band's padding is the section's spacing) and **14 Slim Line's 32 · 44 · 56**. Ladders that measure something else keep their names and their rows: **2 Three Up's and 3 Two Up's Card padding, 12 Rows' Row padding, 15 Overlap's Overlap**. The three Ground rows — 1 Single, 10 Big Quote, 14 Slim Line — retire into **Background role**, keeping their reasoning and losing only the row. **Contrast is disabled on Background role on thirteen designs** with 9 Contrast Band named as the design for it; **two designs lock the control with the reason shown** — 9, whose band is the design rather than a value, and 15 Overlap, whose photograph is the ground. **Top divider is locked None where the design already draws a rule at its own top edge**: 12 Rows at Rules Above and below, 14 Slim Line at Rules Above and below and Above only, 9 Contrast Band at Band width Full bleed, and 15 Overlap at head Over the band and head None.

**Everything visible edits inline, on canvas.** Eyebrow, title, sub, note and the link label take the **P0·1 floating toolbar** — bold · italic · underline · link, the link popover carrying “Open in new tab” and rel nofollow / noreferrer / sponsored. **The per-quote fields edit inline too** — quote, name, role and organisation are selected where they are drawn and edited in place, not only through the sidebar repeater, which is how a person editing their own site expects a card to work. **The quote edits with the marks toolbar suppressed:** the category's rule that the quote field is plain text is right, and the way to enforce it is to withhold the marks rather than to offer them and refuse the paste. **Nothing in A8 is Ghost-owned**, so nothing in the category says “Edit in Ghost” — it is the one category where every word on the page is the site's own to edit.

**The section link, and the member question it raises.** `linkLabel` / `linkUrl` go through the **Ghost-aware Link Picker** with the new-tab and rel options, and **“Become a member” is a legal target** — Portal · Sign up is in the picker like any other. That makes the link an ask, which is why **fourteen designs carry Member Visibility** (Everyone / Logged out / Free members / Paid members), gating the whole section server-side: a wall of member quotations ending in “Become a member” should not be shown to paid members. **14 Slim Line is the exemption**, and the reason is structural rather than an oversight: it never draws the link at any value, so it bears no ask to gate. *Flagged: the exemption is mine.* The link also takes an optional **P0·2 icon** before or after its label, off by default — **it is A8's only action, and the category draws no labelled button at all**, so rule-11's icon offer lands on this one element and on nothing else. 7 Slider's arrows keep A1·14's glyph pair and are **not** Icon-Picker editable: they are the module's affordance, not an action. *Flagged.*

**Avatars: Shown · Hidden, on every design that draws one.** Eleven designs gain it — 1, 2, 3, 4, 5, 6, 7, 9, 10, 13, 15 — because **the only route to a text-only wall was deleting twelve image files**, and a site that wants names without faces was being asked to destroy its own content to get them. **Hidden draws exactly what the no-avatar case already draws:** the block closes up, no circle, no initials, no indent held for it, and the files stay on the items. **Where both controls exist — 5 Wall — Avatars Hidden wins at every Cards value**, Cards None included: the two never disagree because Hidden is the stronger of the two. **Four designs are exempt**, each for its own reason: **8 Portrait** suppresses the avatar at every value already; **11 Faces** needs the circle for its tab row and draws the initials fallback, and 12 Rows is the text-only arrangement it already hands off to; **12 Rows** and **14 Slim Line** draw no avatar at any value. **Hiding an avatar changes nothing in the accessibility tree** — it was `aria-hidden` and unlabelled at every value, so the control removes a decoration and no information. *Flagged: the control, its default and 5 Wall's precedence rule.*

**Image focus, on every image field but one.** Centre / Top / Bottom, reachable from the **Image Picker popover** rather than as a hidden field: **15 Overlap's band** and **every item's avatar** carry it. **8 Portrait is the exception and its refusal stands** — the design names its crop (Portrait 4:5 · Square 1:1 · Match the text) instead of computing where to cut a face — **but the refusal only stands because the escape hatch ships with it**: Image focus is drawn *disabled with its reason* in that design's Image Picker popover, and the help line “**a wide face in a narrow box — crop the file, or switch Crop to Match the text**” is in the panel beside the Crop control. Without it a site would file the centre crop as a bug. *Flagged: shipping the refusal as a disabled field rather than as an absence.*

**The item controls are the shared ones.** `quotes[]` is an authored list, so it takes **P0·3** verbatim: **Add quote arrives with content** (never an empty shell), **Remove is never disabled** — including down to one and down to zero, where the section stops rendering — **drag to reorder**, and **per-item content only**. **No Add button appears on any Ghost-sourced list** anywhere in the library; A8 has no Ghost-sourced list at all, so the rule is stated and never used here.

**One visitor-facing English string ships, and it becomes a catalog string.** 7 Slider's arrow labels, “Previous quotes” and “Next quotes”, are the theme's **translation catalog**, not fields: they are accessible names for a control, not content, and a site should not be able to mistype them. **Everything else visitor-facing in A8 is already an authored field with a default** — eyebrow, title, sub, note, link label and every word of every quotation. 11 Faces' tab labels are the authored names. The editor's own strings — the counters, the hand-off notices, “On the wall, quotes read down each column.” — are editor copy and not shipped to a reader.

**The Data group, on all fifteen panels.** It says the one thing there is to say and says it where a user looks for a data source: **nothing here comes from Ghost**. No testimonial, review or endorsement resource exists, so **no “Populate from…” panel is offered on any A8 design** — the category is the library's one authored-only section set. Comments are refused as a source and members are refused as one, both with the reason on the panel. **The four refusals stay on record at every value so nobody re-adds them:** no rating, score, star or “verified” mark; no per-item link; no decorative quote glyph; no autoplay.

**Control budget.** The old 4–7 norm is lifted: the ceiling is the PRD's ~15 visible controls per design plus the universal trio and the Data group. **A8 lands between four and seven of its own on every design** — 14 Slim Line at four, six designs at six, eight at seven — and **Quick Controls stay the 3–5 highest-impact**, named per design below.

**The shared field list — fourteen fields.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 20 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 120. Per quote in `quotes[]`, one to twelve: `quote` text **req 40–300** · `name` text **req** ≤ 40 · `role` text opt ≤ 40 · `org` text opt ≤ 40 · `avatar` image opt, square, ≥ 88 px. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. `image` is read by 8 Portrait and 15 Overlap and **kept by the other thirteen**. The role line's combined cap is 40 characters advised, 80 possible, and the editor advises against filling both.

**Quote length: 40 at the floor, 300 at the ceiling, and the ceiling is hard.** Under 40 a quote is a slogan the site wrote itself; over 300 it is an excerpt from a post, and the editor names A19 Featured. **A quote is never truncated, clamped, faded or given a “read more” at any width or any value.** What happens instead is the **step-down**, carried from A4·16: above 180 characters the quote renders one value below its design's step on the ladder, above 260 two, measured from the authored string and **disclosed under the size control**. The card grows, the row grows with it, and its neighbours are honestly unequal in content. Three designs are exceptions and each states it: **3 Two Up stops at one step**, **5 Wall has nowhere to step** (its quote is the ladder's floor), **14 Slim Line never reaches a threshold** (its own ceiling is 120). **Flagged**: floor, ceiling, both thresholds, all three exceptions.

**The quote ladder is A8's one new scale.** Small 17 · Card 20 · Feature 27 · Display 40 at 1440; 16 · 19 · 24 · 34 at 834; 16 · 18 · 22 · 28 at 390. Line height 1.45 · 1.45 · 1.35 · 1.2; tracking 0 · 0 · −0.01em · −0.02em. **Heading font at regular weight and roman at every step** — a quotation set in italic is one the design is performing, and one set bold is a headline. **Flagged**: the whole ladder; the regular weight is A4·16's.

**The head is A6's title ladder unchanged** — Medium 34 · Large 40 · Display 48 at 1440, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390 — on a 780 px measure; sub 17 px muted on 620; eyebrow 13 px uppercase tracked `.08em` muted; **head to quotes 48 px**. The head keeps the pack's bold weight while the quotes take regular, which is what stops a 34 px title and a 27 px quotation reading as one voice. **Four designs draw no title**: 8 Portrait and 10 Big Quote keep the field and never draw it; **12 Rows and 14 Slim Line draw no head at all**.

**The quote card is one component, at four scales.** `surface`, a 1 px `border`, the pack radius, **no shadow on a page ground**. Padding follows the card's width: 20 in 5 Wall's 306, 28 in a 416, 32 in 3 Two Up's 632, 40 in 13 Highlight's 848 and 15 Overlap's. **Quote to attribution follows the quote's step**: 16 at Small, 20 at Card, 24 at Feature, 32 at Display. Blockquote takes the slack and **the figcaption is pinned to the card's foot**, so cards of unequal content keep their attributions level. Name 15/600, role line 14 px muted. **15 Overlap's card is the one exception to the shadow rule** — it sits over a photograph and carries the md warm shadow, dropped in dark where the plane step does the work.

**The attribution.** The name is required; role, organisation and avatar are not. **Role and organisation are two fields drawn as one line, comma-joined**, 14 px muted — a three-line attribution under a two-line quote is a caption taller than its subject. Where only one is authored it sits alone. **Where there is no avatar the block closes up** — no circle, no initials, no indent held for it — with one exception: **11 Faces draws the initials fallback**, because its tab row is a fixed row of circles. Avatar sizes: **44 at Feature and Display, 36 in a card, 32 in 5 Wall, 36 everywhere on a phone**; none at all in 8 Portrait (the photograph is the same person), 12 Rows or 14 Slim Line.

**Refused at every value, in all fifteen.** No rating, score, star, tick or “verified” mark — Ghost stores none of it and the mark implies a review system behind it. No date, source, post link or “as seen in” on a quote. No organisation logo (A11 Logo Walls owns marks). No decorative quote glyph — the 120 px grey `“` is the trope this category most obviously reaches for, and it takes a display moment the quotation has earned. **The quotation marks are typed characters in the authored string**, never a `::before` and never substituted. **The quote field is plain text**: no bold, italic, links, line breaks or lists inside somebody else's sentence; ellipses and square brackets are typed by the author. No “+4 more”, no pagination, no “load more”. **Flagged**: all of them.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the set a `<ul>` of `<li>`, each holding **A4·16's figure: `<figure>` → `<blockquote><p>` + `<figcaption>`**, so the attribution is programmatically the quotation's source. **There is not one `<h3>` in the whole category** — a quotation is not a heading at any size, including 10 Big Quote's and 13 Highlight's 40 px. **Four designs have no `<h2>` and take no `aria-labelledby`** rather than being labelled by invented text: 8 Portrait, 10 Big Quote, 12 Rows, 14 Slim Line. **No `cite` attribute and no `schema.org/Review` markup anywhere**: `cite` takes a URL for a source document and a reader's letter has none; review markup invites a star rating into a search result no reader gave. **Single-quote designs use no `<ul>`** — a list of one is not drawn as a list where the design only ever holds one.

**The avatar is `aria-hidden` and takes no alt text**, initials fallback included: the name it sits beside is already text. **Alt text exists in exactly two designs** — 8 Portrait's photograph and 15 Overlap's band, both `<img>` elements with `imageAlt`, `alt=""` where none is authored, never a filename.

**Nothing in A8 is a link except the optional section link**, and 11 Faces' tabs and 7 Slider's arrows are its only `<button>`s. Names are not links, avatars are not links, cards are not links: a card whose only destination is the quotation it already shows is a link to nowhere. **Hover on a card does nothing** — no lift, no shadow, no border change, no scale.

**There is no accent by default.** A testimonial section asks a reader for nothing, so most of the fifteen spend the accent zero times. It appears in exactly three places: **the optional link's underline** (label in `text`, underline in `accent` — accent on `background` is 3.3:1 and fails AA as text), **11 Faces' active tab underline**, and **a focus ring**. 9 Contrast Band substitutes the band's carried colour for all three, because the pack's dark accent is 2.3:1 on the light band. 12 Rows and 14 Slim Line can contain no accent pixel at all.

**Motion: two behaviours in the category**, both reader-driven — 7 Slider's rail and 11 Faces' tabs. Both 160 ms ease-out, both instant under reduced motion, neither runs while editing, and **every frame in A8 is a resting state**. Nothing advances on a timer, fades between quotes on its own, loops, or hints at a swipe; no parallax, no scroll reveal. **Focus** is A6's ring verbatim: 2 px accent, 2 px outside, the inner gap taking the ground it sits on, the carried colour on a band. **Forced colours** keep every hairline and drop the band; the striped placeholder becomes a bordered box; **15 Overlap moves its head above the band**, the one arrangement change forced colours causes in A8.

**Section padding Compact 64 · Comfortable 96 · Spacious 132**, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. Two designs carry their own scale: **9 Contrast Band's band at 44 · 64 · 88** (A4·9's) and **14 Slim Line's at 32 · 44 · 56** (A7·8's).

**Responsive floor.** Three or more cards hold above 1081; **at 1080 and below the columned designs take 2 Three Up's two-column grid**, last row left-aligned; at ≤ 767 one column at 16 px apart, card padding 24, quote at the phone step, attribution unchanged. **The authored order is the drawn order at every width in all fifteen** — nothing is sorted by length, nothing shuffled, and no design promotes a quote with an avatar over one without. 5 Wall is the one design whose visual order is not left-to-right, and it says so in the editor: **its columns read down, then across**.

**Empty.** No eyebrow, sub, note or link → absent. No avatar → the block closes up. No role and no organisation → the name alone. **No quotes → the section does not render**; the editor shows the empty repeater and its Add quote control and never draws a frame with a placeholder person in it. One quote where a design wants more → the design named in its panel. A quote past 180 or 260 characters → the step-down, disclosed at the size control.

**The count drawn, and what is not drawn.** Each design draws a stated count and **the panel says how many are authored and not drawn** — “3 of 7 drawn” beside the design picker. **Twelve is the category ceiling**, reached by 5 Wall and 7 Slider only; the repeater stops accepting a thirteenth and names them.

**The hand-off map — eight designs hand off, three receive.** To **1 Single**: 2 Three Up, 4 Grid, 6 Split Head, 12 Rows and 13 Highlight at one quotation; 8 Portrait and 15 Overlap with no photograph; 14 Slim Line past 120 characters. To **2 Three Up**: 5 Wall at three or fewer, 7 Slider at three. To **4 Grid**: 7 Slider at four. To **12 Rows**: 6 Split Head with no title, 11 Faces at ≤ 767 and at two quotations. Every hand-off is named in the sidebar before the frame changes under the site, and none of them is a fallback for missing data.

**Content.** Orbit Weekly's readers throughout. Head: eyebrow **Readers**, title **“What readers say about the Thursday letter”**, sub **“Every quote here was sent to us by a member, and is used with their permission.”**, note **“Quotes are used with permission and trimmed only for length.”**, link **“Read more letters”**. The first three quotes are the three attribution cases in order — **Mariam Okonjo** · Reader since 2019 · avatar; **Dan Whitlock** · Flight software engineer, Kestrel Aerospace · avatar; **Priya Raghunathan** · Physics teacher, Leeds · no avatar — then **Tomas Alvarez**, **Ruth Nakamura**, **Jonas Ekwueme**, **Cormac Deane**, **Elif Şahin**, **Adaeze Kalu**, **Peter Lindqvist**, **Sofia Brandt**, **Hannah Beeck**. **Every organisation named is fictional** — Kestrel Aerospace, Halden Observatory, Fieldnote — because a real employer beside an invented quotation is a claim about a real company.

---

## 1 · Single

One quotation at Feature 27 on a 780 px measure, the attribution beneath it, no card. The design six others hand off to at a count of one, and the one a site picks deliberately when it has one endorsement it trusts.

**Descriptor.** The only design that draws one quotation with no card and no plane around it — the category's floor, and the arrangement eight other designs hand off to at a count of one rather than inventing one of their own.

**Structural descriptor.** `stack · none · page · one · none · lone quotation at Feature`

**Archetype.** stack

**Behaviour module.** **none.** Alignment, Attribution, Ground and Head are values written onto the section and read by the stylesheet; there is no motion at any value and nothing to suspend while editing. **JS off:** unchanged — nothing in this design ever ran.

**Items.** The repeater holds up to twelve; **this design draws the first row and no other**, and the panel reads “1 of N drawn”.

- **Add quote** appends as the floor. A second row is authored, counted and not drawn — kept for the design a site switches to next rather than refused at the repeater.
- **Remove** the drawn row and **the second row is promoted into the frame**; there is no gap and nothing re-sorts. Remove the last row and the section does not render.
- **Reorder** is how a site chooses which quotation this design draws: the first row is the drawn one, so dragging a row to the top is the whole mechanism. There is no “featured” flag here or anywhere in A8.
- **Minimum and maximum.** Designed for exactly one. One is the floor and the drawn count stays one at every authored count above it; twelve is the category ceiling on the list itself.
- **At zero items** the section does not render and the editor shows the empty repeater — never a frame with a placeholder person in it.
- **Inside the item**: `quote` and `name` required, `role`, `org` and `avatar` optional. **The avatar is drawn here at 44**; with none, the block closes up and the name sits where the circle would have been.

**Fields** · head fields, note, link pair, and **the first item of `quotes[]` only**. `image` kept, not drawn.

**Controls · six** · **Head: Eyebrow · Eyebrow and title · None** — the title is fixed at Medium 34 with no size control, the only capped head in A8. Quote size: Card 20 · Feature 27 · Display 40. Alignment: Centred · Flush left. Attribution: Below · Above. **Avatars: Shown · Hidden** — Hidden draws the no-avatar case this design already frames. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named; the old Ground row retires here — with no card the ground is the only plane the section has) · Vertical spacing resolving 64 · 96 · 132 (the old Padding row) · Top divider, all three available. **Quick Controls:** Head · Quote size · Alignment · Avatars.

**Arrangement** · one column on 780, centred in the 1,296 width or set at the left margin; no card, border or shadow; avatar 44. Eyebrow to quote 20, quote to attribution 20, attribution to note 32, note to link 10; head to quote 48 where a title is drawn. **Attribution Above drops the eyebrow** and is offered here, on 8 Portrait and on 10 Big Quote only.

**Responsive** · there is no collapse. At 834: padding 80, quote Feature 24, measure 690, avatar 44. At ≤ 767: padding 64, quote Feature 22, avatar 36, gaps 20 → 18, link target 44 px. Alignment and Attribution are obeyed at every width.

**Empty** · as the floor. At head None the section has no `<h2>` and no accessible name.

**a11y** · figure, blockquote, figcaption; **no `<ul>`**; the eyebrow is not a heading; reading order is quote then source at both Attribution values. One focus stop. Contrast 15.8:1 / 5.6:1 light, 15.1:1 / 6.4:1 dark, ring 3.3:1 / 6.3:1.

**Flagged** · the 780 measure and its 690 tablet step; the 44 px feature avatar and its drop to 36; capping the title at Medium 34 and defaulting to Eyebrow; Attribution Above and the eyebrow it displaces; the 32 px attribution-to-note gap; the wording of the step-down disclosure.

---

## 2 · Three Up

Three cards of 416 on a 24 px gutter under a centred head. **The quote card's home, and the collapse target every columned design in A8 names at 1080.**

**Descriptor.** The category's card grid at its home scale — three equal 416 px cards on the page's own ground — and the collapse target every columned design in A8 names at 1080 rather than inventing a second arrangement.

**Structural descriptor.** `grid-of-N · none · page · few · none · three equal card columns`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Equal heights are a stretched grid row, Hairline columns is a border with a 32 px inset, and the two- and one-column steps are media queries. **JS off:** unchanged.

**Items.** Three drawn, from a list of up to twelve.

- **Add quote** appends. **The fourth row is counted and not drawn** — “3 of 4 drawn” beside the design picker — and the panel names 4 Grid at six authored and 5 Wall at twelve.
- **Remove.** At **two → two 416 cards centred, not widened**; at **one → hands off to 1 Single**, named in the sidebar before the frame changes; at zero the section does not render.
- **Reorder** decides both which three are drawn and their left-to-right order, which is the same order the phone stacks in.
- **Minimum and maximum.** Designed for three, honest at two. Below two it is another design; above three the surplus is kept, counted and named.
- **At zero items** the section does not render.
- **Inside an item**: the five content fields, avatar drawn at 36. With no avatar the card's foot holds the name and role line alone; with no role and no organisation, the name alone.

**Fields** · head fields, note, link pair, **first three of `quotes[]`**. `image` kept, not drawn.

**Controls · seven** · Head: Centred · Flush left · None. Title size: Medium 34 · Large 40 · Display 48, unavailable at head None. **Cards: Surface · Ground · Hairline columns.** Card padding: Compact 20 · Comfortable 28 · Spacious 36, **relabelled “Column inset” at Hairline columns** — the one place in A8 a control changes what it measures, and the reason it survives the trio as its own row. Quote size: Small 17 · Card 20. **Avatars: Shown · Hidden.** Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 · Top divider, all three available — the column rules run vertically and never meet it. **Quick Controls:** Title size · Cards · Quote size · Avatars.

**Arrangement** · 416 · 24 · 416 · 24 · 416 = 1,296, equal height, `surface` fill, hairline border, pack radius, **no shadow at any value**. Blockquote takes the slack, figcaption pinned to the foot, 20 px gap, avatar 36. Head to cards 48, cards to note 40, note to link 10; **the foot follows the head's alignment**. At Hairline columns: no gutter, a 1 px rule with a 32 px inset either side, running the full height of the tallest column.

**Responsive** · three columns above 1081. **At 1080 and below two columns** — at 834: 365 px each on 24, third card starting a second row under the first, **last row left-aligned**; padding 80, card padding 24, title 34, quote 19. At ≤ 767 one column at 16 px, authored order, card padding 24, quote 18, internal gap 20. **Hairline columns becomes hairline rows on a phone**, the inset becoming a 24 px vertical padding. Rows are equal within a row, never across a grid.

**Empty** · **two quotes → two cards of 416 centred, not widened**; one quote → hands off to 1 Single, named in the panel; four or more authored → three drawn, the panel naming 4 Grid for six and 5 Wall for twelve.

**a11y** · `<ul>` of three figures, DOM order = authored order at every width, one `<h2>`, no `<h3>`. Cards are not links and carry no hover state. One focus stop. Quote 16.6:1 / 15.1:1, role 5.9:1 / 6.4:1, ground text 5.6:1 / 6.8:1. **At cards Ground the hairline is 1.3:1** — a boundary, not information.

**Flagged** · 416 / 24 as the category's card grid; pinning the figcaption to the foot; the three Cards values, the 32 px hairline inset and the control's rename; holding the card width at two quotes; the one-quote hand-off; the left-aligned final row; Hairline columns turning into rows on a phone.

---

## 3 · Two Up

Two cards of 632 on a 32 px gutter, the quotation at Feature 27 inside the card. Every control is 2 Three Up's at this card's scale, so switching keeps all six values.

**Descriptor.** The only card grid whose quotation reaches Feature 27 inside the card, which is what a 632 px measure buys — and the only design in A8 whose step-down stops one step short of the ladder's floor.

**Structural descriptor.** `grid-of-N · none · page · few · none · Feature quote inside card`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The one-step cap is computed from the authored string and the forced Feature → Card at 834 is a media query; both are disclosed in the sidebar rather than done on the page. **JS off:** unchanged.

**Items.** Two drawn.

- **Add quote** appends; **the third row is counted and not drawn** — “2 of 3 drawn” — and the panel names 2 Three Up and 4 Grid.
- **Remove.** At **one → one 632 card centred; this design does not hand off**, because the card at this scale is what the site picked. At zero the section does not render.
- **Reorder** decides which two are drawn and which sits left.
- **Minimum and maximum.** Designed for exactly two, drawn at one, surplus kept above two.
- **At zero items** the section does not render.
- **Inside an item**: the five content fields, **avatar held at 36 even at Feature 27**.

**Fields** · as 2 Three Up, **first two of `quotes[]`**.

**Controls · seven** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Cards: Surface · Ground · Hairline columns. **Card padding: Compact 24 · Comfortable 32 · Spacious 40** — one step above Three Up's, and a card ladder rather than a section one. Quote size: Card 20 · Feature 27. **Avatars: Shown · Hidden** — Hidden closes up both card feet, the case the phone frame already draws. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 · Top divider, all three available. **Quick Controls:** Title size · Cards · Quote size · Avatars. **Every one of the seven is 2 Three Up's at this card's scale, so switching still keeps every value.**

**Arrangement** · 632 · 32 · 632 = 1,296. The 32 px gutter because two planes need a wider gap than three to read as two things. Feature 27 in a 632 card is a 42-character line — the only card in A8 that takes the step. Avatar stays 36. Shared card otherwise verbatim.

**The one-step cap** · **this design's step-down stops at one step**: 300 characters lands at Card 20, not Small 17, because 632 px at Small is a 62-character line and reads as small print. The sidebar says “Feature · stepped down to Card, N characters · this design stops at one step”. The step-down is per quotation, not per row.

**Responsive** · the pair holds down to 767. At 834: two columns of 365 on 24, padding 80, card padding 24, title 34, and **the quote forced from Feature to the tablet Card 19**, disclosed at the control — the only width-driven size change in A8 that is not a length step-down. At ≤ 767 one column, 16 px apart, quote at the phone Card 18. **The cap holds at every width.**

**Empty** · **one quote → one 632 card centred; this design does not hand off.** Three or more authored → two drawn, the panel naming 2 Three Up and 4 Grid.

**a11y** · as 2 Three Up with two items. **The step-down is never announced** — no attribute, class or label tells a screen reader a quote was set smaller. At Hairline columns the rule is a `border-left`, not a separator role.

**Flagged** · the 32 px gutter and 632 card; Feature 27 inside a card; the card-padding scale one step above Three Up's; **the one-step cap and its disclosure**; the forced Feature → Card at 834; keeping the frame at one quote; holding the avatar at 36 at Feature.

---

## 4 · Grid

Six cards, three columns and two rows, on Three Up's 416 / 24 grid. **Settles the row-stretch rule: rows are equal within themselves and never across the grid.**

**Descriptor.** The only design with more than one row of cards, and so the only one that has to settle row stretch — rows equal within themselves and never across the grid, with both alternatives refused by name.

**Structural descriptor.** `grid-of-N · none · page · variable · none · per-row equal heights`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Row-wise stretch is `align-items` on each grid row, the card padding following the column count is a selector, and “Two at this width” is a media query with a sidebar line. **JS off:** unchanged.

**Items.** Four or six drawn by Quotes shown.

- **Add quote** appends and lands in the last occupied cell's place in the reading order — left to right, then down.
- **Remove.** **Fewer authored than shown draws what exists** — five at Six is five cards and the last cell is absent, not empty. Three or fewer are drawn as authored in one row; **one → hands off to 1 Single**; zero → the section does not render.
- **Reorder** fills the grid in authored order, left to right then down. 5 Wall is the one design in A8 whose order does not read that way.
- **Minimum and maximum.** Designed for four or six; honest from three to six; a seventh is counted and not drawn, and the panel names 5 Wall for a longer list.
- **At zero items** the section does not render.
- **Inside an item**: the five content fields, avatar 36. **Which cell an item lands in is its position in the list, not a property of the item** — there is no control that moves one card.

**Fields** · head fields, note, link pair, **first four or six of `quotes[]`** by Quotes shown.

**Controls · seven** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Columns: Two · Three.** Quotes shown: Four · Six. Cards: Surface · Ground. **Avatars: Shown · Hidden** — Hidden closes up every card; row heights are set by each row's longest quotation, so the grid does not reflow. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 · Top divider, all three available. **Card padding is still not a control** — it follows the column count, which is why nothing retired from it. **Quick Controls:** Columns · Quotes shown · Cards · Avatars.

**Arrangement** · 416 cells on a 24 px column and row gap at three columns; 632 on 32 at two. **Card padding is not a control — it follows the column count**, 28 at three and 32 at two. Shared card verbatim. Each row is as tall as its own tallest quotation; the slack falls at the foot of the short cards inside a row. **Equal-across-the-grid is refused** (every short quote pays for one long one) and **packed is refused** (that is 5 Wall, which uses columns and no equal heights). **Hairline columns is not offered**: a vertical rule that stops between two rows is a table's rule without a table's header, and 12 Rows is the honest version of that idea.

**Responsive** · three columns above 1081; **two at 1080 and below at both Columns values**, disclosed as “Two at this width” — six cards become three rows of two, three row heights. At 834: 365 cells on 24, padding 80, card padding 24, title 34, quote 19. At ≤ 767 one column, 16 px apart, **and every card is its own height because there is no row.**

**Empty** · **fewer authored than shown draws what exists** — five at Six is five cards and the last cell is absent, not empty. Three or fewer → drawn as authored in one row; one → hands off to 1 Single.

**a11y** · **one `<ul>` of six, never two lists of three**; the equal-height stretch is invisible to assistive technology; **six cards, one focus stop.**

**Flagged** · six as the ceiling; rows equal within a row; both refused alternatives; card padding following the column count; refusing Hairline columns in a two-row grid; the “Two at this width” disclosure; drawing what exists rather than padding the grid.

---

## 5 · Wall

Up to twelve quotations in three or four CSS columns at their natural heights. **The many answer**, and the design that gives up equal heights entirely.

**Descriptor.** The only design that gives up equal heights entirely — up to twelve quotations at their natural heights in CSS columns, with an uneven bottom edge as a stated outcome rather than a defect.

**Structural descriptor.** `grid-of-N · none · page · many · none · unstretched columns read down`

**Archetype.** grid-of-N

**Behaviour module.** **none**, and that is the design decision: `column-count` with `break-inside: avoid` does the whole arrangement, so there is **no measuring script, no masonry library and no balancing pass**. The shortest column simply finishes above the tallest. **JS off:** unchanged, which is the reason for choosing columns over a script.

**Items.** Six, nine or twelve drawn by Quotes shown.

- **Add quote** appends and lands at the foot of the last column, which is the end of the reading order.
- **Remove.** Fewer than six authored are drawn as authored; **three or fewer → hands off to 2 Three Up**, since three cards in three columns is Three Up with smaller type; zero → the section does not render.
- **Reorder** is meaningful and **reads down each column, then across** — the editor says so at the repeater: “On the wall, quotes read down each column.” **No quote is moved between columns to balance heights.**
- **Minimum and maximum.** Designed for six, nine or twelve. **Twelve is the category ceiling**: the repeater stops accepting a thirteenth and names the count.
- **At zero items** the section does not render.
- **Inside an item**: the five content fields, avatar 32. **At Cards None the avatar is read and not drawn** — the one place in A8 where a section control takes an item's field out of the drawing, and the sidebar says so at the control.

**Fields** · head fields, note, link pair, **first six, nine or twelve of `quotes[]`**. `avatar` is read at Cards Surface and Ground and **not drawn at Cards None**.

**Controls · seven** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Columns: Three · Four.** Quotes shown: Six · Nine · Twelve. Cards: Surface · Ground · None. **There is no quote-size control: the quote is Small 17.** **Avatars: Shown · Hidden**, and **Hidden wins at every Cards value, Cards None included** — Cards None already drops the circle, Hidden drops it at Surface and Ground too, and the two controls never disagree because Hidden is the stronger of them. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 — the 24 px rhythm down a column, 32 at Cards None, stays uncontrolled · Top divider, all three available. **Quick Controls:** Columns · Quotes shown · Cards · Avatars. **This design proved the Hidden mechanism before the control existed**, which is why the control reads as a promotion of a behaviour rather than a new one.

**Arrangement** · `column-count` on the list — 306 px columns at four, 416 at three, 24 px column gap — items 24 px apart down a column (32 at Cards None), `break-inside: avoid` on each. Card padding 20, **internal gap 16 rather than the category's 20**, avatar 32, name 14/600, role 13 muted. No shadow. **Natural heights, no stretch, an uneven bottom edge** — the shortest column finishes above the tallest and the section's padding starts from the lowest. **Cards None drops the avatar and opens the rhythm to 32.**

**Reading order** · **authored order runs down each column and then across.** The DOM is one sequence in authored order and the visual order agrees with it; only the eye's habit of reading rows disagrees. **The editor says so at the repeater**: “On the wall, quotes read down each column.” No quote is moved between columns to balance heights.

**The step-down does not apply.** Small is the ladder's floor, so a long quotation simply takes more of its column — the one design where length costs nothing but height.

**Responsive** · four columns at 1440 and above only; three from 1439 to 1081; **two at 1080 and below**, disclosed as “Two at this width”; one at ≤ 767, where the arrangement is a plain stack 16 px apart and the reading-order rule no longer applies. At 834: padding 80, quote 16, items 20 px apart.

**Empty** · fewer than six authored → drawn as authored; **three or fewer → hands off to 2 Three Up**, since three cards in three columns is Three Up with smaller type.

**a11y** · one `<ul>` with `column-count`, never three lists; `break-inside: avoid` so no quotation is split from its attribution; **twelve quotations, one focus stop**; the 13 px role line checked as body text at 5.9:1 / 6.4:1.

**Flagged** · twelve as the ceiling; fixing the quote at Small 17 with no control; **the suspended step-down**; the 16 px internal gap and 32 px avatar; the 306/24 measure and its 1440 floor; Cards None dropping the avatar; the uneven bottom edge as a stated outcome; the hand-off at three or fewer; the editor's reading-order line.

---

## 6 · Split Head

A5·5's division: the head in a 416 px column at the left margin, the quotations as rows in an 824 px column at the right. **Settles where the note and the link go when the head is not above the quotes.**

**Descriptor.** The only design whose head is a column beside the quotations rather than a block above them, and so the only one that has to decide where the section's own two sentences go when the head is not on top.

**Structural descriptor.** `split · none · page · few · none · head beside the rows`

**Archetype.** split

**Behaviour module.** **none.** The two columns are a flex row, Head column Right is `row-reverse`, and the 1080 change — head above, rows full width — is a media query with a sidebar disclosure. The head never sticks, so there is no `sticky` module to declare either. **JS off:** unchanged.

**Items.** Two, three or four drawn by Quotes shown.

- **Add quote** appends to the foot of the right column, under the last rule.
- **Remove.** **One → hands off to 1 Single**; zero → the section does not render. Removing a row changes no other row's height: the rows have no equal-height mechanism.
- **Reorder** is top to bottom in the right column at both Rows values.
- **Minimum and maximum.** Designed for two to four; a fifth is counted and not drawn — “4 of 5 drawn”.
- **At zero items** the section does not render, and that is true whether or not a title, note or link is authored.
- **Inside an item**: the five content fields, avatar 36 at Rows Hairline and Rows Cards alike.

**Fields** · every field except `image`, **first two, three or four of `quotes[]`**.

**Controls · seven** · **Title size: Medium 34 · Large 40** — Display 48 is not offered in a 416 px column. Quotes shown: Two · Three · Four. Rows: Hairline · Cards. Head column: Left · Right. **Foot: Under the head · Under the quotes.** **Avatars: Shown · Hidden** — Hidden closes up every row, at both Rows values. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 — the 32 px above and below each rule stays uncontrolled · Top divider, all three available. **Quick Controls:** Quotes shown · Rows · Head column · Avatars. **The foot control is where the link and note live, so Member visibility and the Link Picker both land on this design's second column** and the panel says so at the Foot row.

**Arrangement** · 416 · 56 · 824 = 1,296; the 56 px gutter is A5·5's, the widest in A8, because the two columns are two kinds of thing. Both columns top-aligned; **the head never sticks and is never vertically centred**. Rows: quote Card 20 on a 60-character measure, attribution 20 px under it, **32 px above and below each rule, rules between the quotations and never around them**, avatar 36. At Rows Cards: the shared card, padding 28, 16 px apart, no rules. Head to sub 12, sub to foot 20.

**The foot** · **default under the head** — the note and the link are the publication speaking and the quotations are readers speaking, so keeping the site's two sentences together stops the section ending in the site's own voice. **Under the quotes takes a rule above it**, the same hairline that separates two quotations, which is why it is the second value: it makes the note look like a fourth item in the list. **The note and the link always travel together.**

**Head column Right** is `flex-direction: row-reverse` — visual only, the head is read first at both values.

**Responsive** · **the split is what leaves.** At 1080 and below the head goes above the rows, full width on a 620 px measure, and the rows take the whole column; **Head column Right draws left**, having nothing to be right of; **the foot at Under the head lands above the quotes**, disclosed in the sidebar. At 834: padding 80, title 30, quote 19, row padding 28. At ≤ 767: title 26, quote 18, row padding 24, internal gap 16.

**Empty** · no eyebrow or sub → the head column closes up. **No title → hands off to 12 Rows**, named in the panel. No note and no link → the foot is absent and the control unavailable. One quote → hands off to 1 Single.

**a11y** · one `<h2>` in the head column; **the two columns are a flex row, not two landmarks** — no `aside`, no roles, no second heading. Hairlines are `border-top` on the items, never `<hr>`. One focus stop. No motion at any value.

**Flagged** · the 416/56/824 division; capping the title at Large 40; **the foot's default and the rule above the second value**; keeping note and link together; the 32 px row padding and rules-between rule; top-aligning rather than centring the head; the collapse target and the foot's disclosure at 1080; the hand-off to 12 Rows.

---

## 7 · Slider

**A5·14 Scroller's rail carrying quote cards** — settlement 3, built. A `<ul>` in an `overflow-x:auto` box, every quotation in the tree at all times, proximity snap, A1·14's outlined arrows in the head, no dots, one card per press, bleeding past the right margin.

**Descriptor.** The only design whose set overflows sideways instead of wrapping, with a card sliced by the page's right margin as its affordance — and the only one whose arrangement is identical at every width.

**Structural descriptor.** `carousel · none · page · many · none · rail bleeding past margin`

**Archetype.** carousel

**Behaviour module.** **`carousel`** — A5·14's rail declared as the registry module it is. **Edit-safe**: it does not run while the section is being edited, writes nothing to authored DOM and remembers no scroll position between loads, so the frames are all drawn at rest. **JS off:** “The slide track is a native horizontally-scrollable `scroll-snap` strip — **fully usable**, only dots and arrow buttons are hidden.” **This design draws no dots at any value**, so the whole of the degradation is the two arrows going away: every quotation stays in the DOM in authored order, the rail still scrolls, drags and snaps, and the set-wide equal card height holds because it is a stretched flex track rather than a measurement. **One mechanic is lost rather than degraded** — the 40% `disabled` arrow that says the rail has run out, which needs the scroll position; the module hides the arrows rather than leaving them inert, which is the better of the two.

**Items.** Five to twelve, **all drawn**.

- **Add quote** appends to the right end of the rail. **Twelve is the ceiling** and the repeater stops there, naming the count.
- **Remove.** **Five is the floor** — four cards fit at 1440 without a cut, and a rail with nothing past its edge is a row that scrolls for no reason. At **four → 4 Grid**; at **three or fewer → 2 Three Up**; zero → the section does not render.
- **Reorder** is left to right along the rail, and **the first row is the card a reader sees whole at load**.
- **Minimum and maximum.** Designed for five to twelve, and the only design besides 5 Wall that reaches the ceiling.
- **At zero items** the section does not render.
- **Inside an item**: the five content fields, avatar 36. **Card width is a section value** — Narrow, Medium or Wide applies to every card at once, so a longer quotation takes a taller card and never a wider one.

**Fields** · head fields, note, link pair, **five to twelve items of `quotes[]`, all drawn**. **`sub` is not drawn at 834 and below.**

**Controls · seven** · Title size: 34 · 40 · 48. **Card width: Narrow 320 · Medium 416 · Wide 632** — A8's own scale, wider than A5·14's 280/320/380 because a card holding only type needs a reading measure. Rail edges: Bleeds right · Contained. Rail controls: Arrows · None. Cards: Surface · Ground. **Avatars: Shown · Hidden** — Hidden shortens every card without reflowing the rail, since height is set by the longest quotation in the set. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 — the rail's 24 px gutter stays uncontrolled · Top divider, all three available. **Quick Controls:** Card width · Rail edges · Rail controls · Avatars.
**Strings and icons** · **the arrow labels “Previous quotes” and “Next quotes” are catalog strings**, not fields: they are accessible names for a control rather than content. **The arrows keep A1·14's glyph pair and are not Icon-Picker editable** — they are `carousel`'s affordance, not an action, and the Icon Picker's offer in A8 lands on the section link alone. *Flagged: both rulings.*

**The rail** · 24 px gutter; **proximity snap, not mandatory** — a reader who drags halfway between two cards is left between them. One card per arrow press (the card plus its gutter). A1·14's outlined 38 px icon button with a 19 px glyph in the head's right; **40% and `disabled` at an end**; **no dots at any value**; bleeding past the right margin at rest and both margins once scrolled, the first card sliced by the page's left margin. **No loop**: at the last card the right arrow goes to 40% and stays there. **Every card is as tall as the longest quotation in the set**, not the tallest on screen, so the section never jumps as it scrolls — this design's cost, disclosed at the count control.

**Reduced motion** · **allowed, because the reader drives it.** The arrangement is unchanged; the arrow's animated scroll becomes instant and snap is dropped. A5·14's own rule. **If the rail advanced on its own, reduced motion would have to stop it — the honest way to avoid that argument is not to build the timer.**

**Responsive** · **the arrangement does not change at any width.** At 834: padding 80, margin 40, card padding one value down, title 34, quote 19, **Wide reads “Medium at this width”**, and the sub is not drawn. At ≤ 767: card 300 px at every width value, gutter 16, Rail controls default to None, and **where arrows are kept they move under the rail at 44 px square**.

**Empty** · **five is the floor** — four cards fit at 1440 without a cut, and a rail with nothing past its edge is a row that scrolls for no reason. **Four → 4 Grid; three or fewer → 2 Three Up**, both named in the panel.

**a11y** · every quotation in the DOM at all times, in authored order — nothing hidden, nothing lazy, so a screen reader hears twelve and Ctrl-F finds the eleventh. Arrows are `<button>`s labelled “Previous quotes” / “Next quotes” — **plural, because a press moves the rail rather than selecting a quote** — with `aria-controls`. The rail is a `tabindex="0"` scroll container named by the `<h2>`; **tabbing to an off-screen card scrolls it fully into view with its ring**. No card is a link. Arrow glyph 15.8:1 / 15.1:1, unavailable 6.3:1 / 6.2:1.

**Flagged** · citing A5·14 rather than designing a carousel; the reduced-motion answer; the 320/416/632 scale; the five-quote floor and twelve ceiling; **the set-wide equal height and its cost**; dropping the sub at 834; the 44 px arrows under the rail on a phone.

---

## 8 · Portrait

One quotation beside one photograph of the person who said it. With 15 Overlap the only design that reads `image`, and the only one where the photograph is a person. **The avatar is not drawn** — a 36 px circle of the same face beside a 632 px photograph of it is the same fact twice.

**Descriptor.** The only design that draws a photograph of the person speaking, and the only one that suppresses the avatar because of it — a 36 px circle of the same face beside a 632 px photograph of it is the same fact twice.

**Structural descriptor.** `split · none · page · one · left · photograph of the speaker`

**Archetype.** split

**Behaviour module.** **none.** Division, Image side, Crop, the vertical centring and the forced 3:2 stacking at 1080 are all CSS; `object-fit: cover` centred on its own centre needs no focal-point script, and **the absence of one is the design's stated refusal rather than an omission**. `lightbox` is the module a photograph invites and it is not declared: this picture is not a thumbnail of anything. **JS off:** unchanged.

**Items.** One item drawn — its `quote`, `name`, `role` and `org`.

- **Add quote** appends and is not drawn; the panel reads “1 of N drawn”.
- **Remove** the drawn row and the next is promoted into the frame. Zero → the section does not render.
- **Reorder** chooses the drawn quotation. **The photograph is a section field, not an item field**, so it does not travel with the row: reordering changes the words and not the picture, and keeping the pairing true is the site's job. A site with two people to photograph has two sections.
- **Minimum and maximum.** Designed for exactly one. **No image → hands off to 1 Single and the avatar returns** — there is no placeholder and no initials block at any width.
- **At zero items** the section does not render, photograph or no photograph.
- **Inside the item**: `quote`, `name`, `role`, `org` editable and drawn. **`avatar` is editable, kept and never drawn here**; it returns the moment the design is switched or the photograph is removed.

**Fields** · `eyebrow`, `note`, link pair, **`image` and `imageAlt`**, and the first item of `quotes[]` (`quote`, `name`, `role`, `org`). **`title`, `sub` and `avatar` are kept and never drawn.**

**Controls · six** · **Division: Even 632/632 · Quote-led 760/504 · Image-led 504/760**, all on a 32 px gutter. Image side: Left · Right. **Crop: Portrait 4:5 · Square 1:1 · Match the text.** Quote size: Card 20 · Feature 27 — Display is not offered. Attribution: Below · Above · Under the image. Member visibility: Everyone · Logged out · Free · Paid. **No Avatars control:** this design suppresses the avatar at every value already, and the panel says so where a site would look for the row.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 · Top divider, all three available. **Quick Controls:** Division · Image side · Crop · Quote size.
**The focal refusal, and the escape hatch that lets it stand** · **Image focus is drawn disabled in the Image Picker popover, with its reason**, rather than left absent — a user who goes looking for it finds the answer instead of nothing. **The help line ships in the panel beside Crop:** “a wide face in a narrow box — crop the file, or switch Crop to Match the text.” Without that line the centre crop is a bug report waiting to be filed; with it the refusal is a stated design decision. *Flagged: shipping the refusal as a disabled field.*

**Arrangement** · two halves **vertically centred against each other** — the only centred pairing in A8, because a 790 px photograph beside a 260 px quotation would otherwise hang the words off a corner. Image radius the pack token, `object-fit: cover`, **centred on its own centre with no focal-point control**; a site that needs a different focal point crops the file, and the editor says so. **No scrim: nothing is laid over this photograph.** Eyebrow to quote 24, quote to attribution 24, attribution to note 32. **At Image-led the quote steps down one** — a width decision, disclosed like a length one.

**The crop is named, not computed.** A theme that decides where to cut a photograph of a person will eventually cut through a chin. **Match the text** is the honest third value and the only one that can put a wide face in a narrow box; the editor's help line names the risk.

**Responsive** · two halves above 1081. **At 1080 and below they stack, image above the quotation at both Image side values, and the crop is forced to 3:2** — a 4:5 portrait at 754 px is a screen of face — with Division and Image side disclosed as having no effect. A photograph under a quotation reads as an illustration of it; above it reads as the person about to speak. At 834: padding 80, quote Feature 24. At ≤ 767: image 350 × 233, quote Feature 22.

**Empty** · **no image → hands off to 1 Single and the avatar returns**, named in the panel; there is no placeholder and no initials block at any width. No `imageAlt` → `alt=""`.

**a11y** · one `<figure>` holding image, blockquote and figcaption — **the photograph is inside the figure**; no `<ul>`, **no `<h2>` and no accessible name**; **the one image in A8 with real alt text**, requested by the editor. The quotation is read before its source at all three attribution values. Not a link, no hover, no motion.

**Flagged** · suppressing the avatar; dropping title and sub; the vertical centring; the three divisions and three crops; **refusing a focal-point control**; the Image-led step; the forced 3:2 and image-above stacking; Attribution Under the image; the hand-off with the avatar returning.

---

## 9 · Contrast Band

The section inverted onto the `contrast` token, the quotations drawn as panels on the band. The band, its **44 · 64 · 88 padding scale** and its derived mixes are A4·9's.

**Descriptor.** The only design whose ground is the design rather than a control value — 2 Three Up's arrangement on the inverted band, with every mix, the accent's substitution and the panel's disappearance at one quotation all following from the token pair.

**Structural descriptor.** `grid-of-N · none · contrast · variable · none · panels on inverted band`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The band, the derived mixes, the dropped panel at one quotation, Inset becoming full bleed at ≤ 767 and the forced-colours drop are all CSS; the disabled accent value is a sidebar state showing its failing ratio, not a script. **JS off:** unchanged.

**Items.** One or three drawn by Quotes shown.

- **Add quote** appends; a fourth is counted and not drawn.
- **Remove.** **One authored → Quotes shown One, the panel dropped entirely, the quote at Feature 27** — **this design keeps its own frame and does not hand off**, because the band is what the site picked. Zero → the section does not render.
- **Reorder** sets the left-to-right order at Three and chooses the drawn quotation at One.
- **Minimum and maximum.** Designed for one or three — the one design in A8 whose count control crosses from `one` to `few`, which is why the tuple reads `variable`. Four or more are counted and not drawn.
- **At zero items** the section does not render, and no band is drawn: there is no empty coloured field on a live page.
- **Inside an item**: the five content fields, avatar 36 drawn on the panel and on the bare band alike. **At Quotes shown One the panel goes and the item's own geometry does not change.**

**Fields** · 2 Three Up's exactly, **one or three of `quotes[]`**. **Switching between this design and 2 Three Up changes nothing but the colours** — the tokenisation claim at its hardest.

**Controls · seven** · Band width: Full bleed · Inset. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Quotes shown: One · Three. Panels: Panels · Hairline columns, unavailable at One. **Avatars: Shown · Hidden** — Hidden closes up the panels and the bare band alike. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · **Background role locked at Contrast, with the reason shown:** the band is the design and not a value, and 2 Three Up is this same arrangement on the page's ground — switching design is how a site leaves the band, which is also why this design never had a Ground row. **Vertical spacing resolves this design's own 44 · 64 · 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390): **the old Band padding row retires into it** rather than beside it, because on this design the band is the section. **Top divider locked None at Band width Full bleed** — the band's own top edge is the divider — and available at Inset. **Quick Controls:** Band width · Quotes shown · Panels · Avatars.

**Derived mixes, all from the token pair** · muted = carried at **72% in light and 70% in dark (A4·9's pair)**, panel = carried at 6%, hairline = carried at 18%. Light band `#232019` / `#FBF9F5` → `#BEBCB7`, `#302D26`, `#4A4741`. **Dark band `#EDE7DA` / `#171511`** → `#57544D`, `#E0DACE`, `#C6C1B6`. Using `surface` or `border` here would put a light card on a dark band. **The striped image placeholder takes the light stripe pair on a light band in either mode.** No shadow at any value. **At Quotes shown One the panel is dropped entirely** — a single 6%-lighter rectangle on a band is a box around nothing. Inset takes the pack radius; Full bleed has no corners to round.

**The accent is unavailable on a band.** The pack's dark accent is **2.3:1** against the light band and a 2 px underline needs 3:1, so **the underline and the focus ring both take the carried colour**, in both modes — a link that is accent-underlined in light and carried-underlined in dark is two different links in one theme. The sidebar shows the failing ratio at the disabled value. The light-mode accent would pass at 4.8:1 and is still not used. **This section has no accent in it at all.**

**Responsive** · 2 Three Up's collapse exactly. The band's padding takes its own step at each width and **always keeps a horizontal margin** (72 / 40 / 20), because type running to the edge of a coloured field reads as a mistake. **Inset draws full bleed at ≤ 767.**

**Empty** · **one authored quote → Quotes shown One, panel dropped, Feature 27; this design keeps its own frame** and does not hand off, because the band is what the site picked.

**a11y** · 2 Three Up's structure unchanged; **the band is a background, not an element**. Text on the band 15.8:1 light / 14.7:1 dark, muted 8.7:1 / 6.0:1. **Forced colours drop the band** and keep every hairline.

**Flagged** · the 6% panel and 18% hairline percentages (the muted pair is A4·9's); **the accent substitution and its consistency across modes**; dropping the panel at one quote; the radius rule; the band keeping a horizontal margin; Inset becoming full bleed on a phone; the light stripe placeholder on a light band.

---

## 10 · Big Quote

One quotation at **Display 40**, flush left on a 1,000 px measure, the attribution at its foot. The only design that reaches the top of the ladder outside a card.

**Descriptor.** The only design that reaches Display 40 outside a card, and the only one that drops the section's title by construction in order to do it — the quotation is the section's largest voice and there is no second one.

**Structural descriptor.** `stack · none · page · one · none · Display quotation, no title`

**Archetype.** stack

**Behaviour module.** **none.** Measure, Alignment, Attribution and Ground are section values; the 90-character advice is a counter in the sidebar and the step-down is computed from the authored string — neither is script on the page. **`typewriter` is the module this design most obviously invites and it is refused at every value**, along with any reveal or fade, so there is nothing to degrade. **JS off:** unchanged.

**Items.** The first row drawn.

- **Add quote** appends and is not drawn; “1 of N drawn”.
- **Remove** promotes the next row into the frame; zero → the section does not render.
- **Reorder** chooses the drawn quotation — the whole mechanism, as in 1 Single.
- **Minimum and maximum.** Designed for exactly one. Past 180 characters the quotation steps to Feature 27 and past 260 to Card 20, disclosed at the control; **the 90-character line is advice and never a limit.**
- **At zero items** the section does not render.
- **Inside the item**: the five content fields; **avatar 44, and dropped at Attribution Above** — a section value, not a property of the item.

**Fields** · `eyebrow`, `note`, link pair, first item of `quotes[]`. **`title` and `sub` kept and never drawn** — a Display 40 quotation is the section's largest voice and a title above it would be a second one.

**Controls · six** · **Measure: Narrow 780 · Wide 1000** — the width-not-height control. Quote size: Feature 27 · Display 40. Alignment: Flush left · Centred. Attribution: Below · Above. **Avatars: Shown · Hidden** — Attribution Above already drops the circle, so at that value the control has nothing left to do and the panel says so. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named) — **the old Ground row retires here, and Ground Surface was always the whole section rather than a card**, which it still is · Vertical spacing resolving 64 · 96 · 132; the repeated 32 px separation inside the design stays uncontrolled · Top divider, all three available. **Quick Controls:** Measure · Quote size · Alignment · Avatars.

**Arrangement** · one column on the measure; no card, border, shadow or title. Display 40 / 1.2 / −0.02em, roman and regular. **Every separation is 32 px** — eyebrow to quote, quote to attribution, attribution to foot — one measurement repeated, because at this size a 20 px gap reads as a collision. Avatar 44, **dropped at Attribution Above**. **The foot is one row**, note and link 24 px apart. **Ground Surface is the whole section, not a card.** The measure is capped at 1,000 of the 1,296 available: at 1,296 a 40 px line is 65 characters and past what a reader can track.

**The 90-character advice** · the editor's counter turns muted past 90 with “Two lines reads best at this size” — **advice, not a limit**. The rule is the ladder: past 180 characters the quotation drops to Feature 27 and past 260 to Card 20, disclosed as “Display · stepped down to Card, N characters”. At Card 20 this design is 1 Single with a wider measure, which is honest rather than embarrassing.

**Responsive** · no collapse. At 834 **both Measure values draw 690** and the control says so; quote Display 34, gaps 28. At ≤ 767 quote Display 28, avatar 36, gaps 24, the foot stacks.

**a11y** · **no `<h2>` and no heading semantics on the 40 px quotation**, so no accessible name — the most important line in this spec. One focus stop. **No motion at any value** — no reveal, no fade, no letter-by-letter anything. The quote is full-strength `text` despite qualifying as large text.

**Flagged** · the 1,000 measure and the 780 alternative; **the 90-character advice and its wording**; the repeated 32 px separation; the single-row foot; dropping title and sub; dropping the avatar at Attribution Above; Ground Surface being the section; both measures collapsing to 690.

---

## 11 · Faces

The attributions become the control: a row of avatars and names, one quotation shown at a time. **A5·12's tablist structure and behaviour** — `role="tablist"`, roving focus, arrow keys, a 2 px accent underline from A1·1's nav item — cross-fading at 160 ms. **Three properties of the tab itself are changed and flagged: resting 15/500 and active 15/600 where A5·12 is 400 / 500, and a hover surface plane where A5·12 has none.**

**Descriptor.** The only design that turns the attributions into the control — a reader picks a face and the quotation follows — and so the only one whose resting state hides most of what is authored in it.

**Structural descriptor.** `carousel · none · page · variable · none · avatars as tab row`

**Archetype.** carousel

**Behaviour module.** **`tabs`** — A5·12's tablist, declared as the registry module it is. **Edit-safe**: it does not run while the section is being edited, activation is never remembered between loads, and every frame is drawn at rest with the first tab active. **JS off:** “All panels render stacked and visible, each preceded by its tab label as a heading.” **Every quotation becomes present and readable, so the hidden-quotation cost this design states with JavaScript on disappears with it off** — the arrangement is 12 Rows' stack, the same drawing the design already hands to a phone, and the fixed panel height stops mattering because no panel is hidden. **The conflict, stated rather than resolved here:** A8 has no `<h3>` anywhere and holds that a person's name is not a heading, so the registry's per-panel heading would put three to six of them into this one design. The registry is the authority on degradation, so its sentence stands as quoted; **whether 11 Faces takes `<h3>` names in its no-JS branch alone, or `tabs` takes an exception for a category whose panel labels are attributions, is the architect's call.**

**Items.** Three, four or six drawn by Quotes shown, one visible at a time.

- **Add quote** appends and lands as **the rightmost tab**; at six the tab row is already forced to Name only, and a new item joins it there.
- **Remove.** **Removing the active tab returns activation to the first tab**, which is where every load starts anyway. **Two or fewer → hands off to 12 Rows at every width**, since a tablist of two is a toggle; zero → the section does not render.
- **Reorder** is left to right along the tab row, and **the first row is the tab active on load** — the only thing that decides which quotation a reader sees first, and the reason order matters more here than in any other design in A8.
- **Minimum and maximum.** Designed for three, four or six; a seventh is counted and not drawn.
- **At zero items** the section does not render — no empty tab row, no lone circle.
- **Inside an item**: the five content fields. **The tab shows `org` if authored, otherwise `role`, never both**, while the figcaption under the quotation shows the full comma-joined line — one item, two treatments, both from the same fields. **No avatar → the initials fallback**, the only design in A8 that draws it, because the tab row is a fixed row of circles.

**Fields** · `eyebrow`, `title`, `note`, link pair, **three, four or six of `quotes[]`**. **`sub` kept and not drawn** — the tab row sits where a sub would. **The tab shows `org` if authored, otherwise `role`, never both**; the figcaption under the quotation shows the full comma-joined line.

**Controls · six** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Tabs: Avatar and name · Name only**, Name only forced at Quotes shown Six. Tab row: Above the quote · Below. Quotes shown: Three · Four · Six. Member visibility: Everyone · Logged out · Free · Paid. **No Avatars control, and this is the one exemption worth arguing:** the tab row is a fixed row of circles with an initials fallback, so Hidden would leave a row of names pretending to be tabs. **Tabs Name only is the nearest thing this design has to it**, and **12 Rows is the text-only arrangement** — which this design already hands off to at two quotations and below 767.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132; the 48 px under the tab row stays uncontrolled · Top divider, all three available. **Quick Controls:** Tabs · Tab row · Quotes shown · Title size.

**The behaviour** · 44 px targets at every width with a 36 px avatar inside (32 at 834); name 15/500 resting in `text-muted` and 15/600 active in `text`; **avatar 70% → 100%**; hover surface behind the tab — **the weights and the plane are this design's, not A5·12's**; **2 px accent underline over the row's hairline**. **Active is never colour alone** — underline, weight and avatar change together. Quote Feature 27 on a 900 px measure, 48 px below the row. **The panel is as tall as the longest quotation in the set**, so switching never moves the page. First tab active on load at every value and never remembered. **Instant under reduced motion; nothing on a timer; nothing while editing.**

**The cost, stated** · **five of six quotations are hidden on load.** They are in the DOM with the `hidden` attribute — correct for a tablist — but not on the page, so a scanning reader does not see them and a browser's find does not match them. **The panel says so and names 12 Rows for a site that wants everything visible.**

**Responsive** · tabs above 767. At 834 three avatar-and-name tabs fit, **four wrap to a centred second row** with the hairline under the last row, six force Name only. **A horizontally scrolling tab row is refused at every width** — 7 Slider is the design that scrolls, and a scroll that hides the choice this section exists to offer is worse than a wrap. **At ≤ 767 the behaviour is handed off: no tabs, every quotation drawn as 12 Rows' stack**, and the sidebar says “Tabs above 767, a stack below”.

**Empty** · **no avatar → the initials fallback, the only design in A8 that draws it.** Fewer authored than shown → that many tabs; **two or fewer → hands off to 12 Rows at every width**, since a tablist of two is a toggle.

**a11y** · `role="tablist"` / `role="tab"` with `aria-selected` and `aria-controls`, one tab stop with roving `tabindex`, arrow keys, `role="tabpanel"` labelled by its tab, inactive panels `hidden`. The tab's accessible name is the person's name; avatars and initials `aria-hidden`. Active 15.8:1 / 15.6:1, resting 5.6:1 / 6.8:1, underline 3.3:1 / 6.3:1, initials 5.4:1 / 5.9:1.

**Flagged** · the avatar as a tab; **the 500 / 600 tab weights and the hover plane against A5·12's 400 / 500 and no plane**; the 70% resting opacity; the trimmed role line and the repeated full attribution; the 900 px measure; **pairing Tabs with Quotes shown**; the fixed panel height; wrapping rather than scrolling; **handing the behaviour off to 12 Rows on a phone and at two quotes**; stating the hidden-quotation cost in the panel.

---

## 12 · Rows

Quotations as rows between hairlines: the words at the left on 780, the attribution in a 300 px column at the right. **No title, no eyebrow, no card, no shadow, no avatar** — the plainest thing the category can put on a page, and its floor.

**Descriptor.** The plainest thing the category can put on a page — quotations as hairline rows with the attribution in a caption column, no head, no card, no avatar and no accent pixel available to it — and the design three hand-offs arrive at.

**Structural descriptor.** `stack · none · page · variable · none · hairline rows, caption column`

**Archetype.** stack

**Behaviour module.** **none**, and this design has the least to declare of the fifteen: nothing is focusable unless a link is authored, there is no hover state anywhere, there is no motion at any value, and forced colours leave it unchanged. **JS off:** unchanged.

**Items.** Three, four or six drawn by Quotes shown, from a list of two to six.

- **Add quote** appends to the foot of the list, under the last rule.
- **Remove.** **One → hands off to 1 Single**, the only hand-off out of this design; zero → the section does not render. **There is no equal-height mechanism at all**, so a removed row — or a stepped-down long one — affects no other row.
- **Reorder** is top to bottom, and at Quotes shown Three or Four it also decides which of the authored rows are drawn.
- **Minimum and maximum.** Designed for three, four or six; honest at two; a seventh is counted and not drawn.
- **At zero items** the section does not render — which for this design means no rules either, since the rules are borders on the items.
- **Inside an item**: `quote`, `name`, `role`, `org` editable and drawn. **`avatar` is editable, kept and never drawn** — one of six fields this design keeps, every one waiting for the design a site switches to next.

**Fields** · `note`, link pair, **two to six of `quotes[]`**. **`eyebrow`, `title`, `sub`, `avatar`, `image` and `imageAlt` are kept and never drawn** — six of the fourteen fields, the most any design in A8 keeps, every one waiting for the design a site switches to next.

**Controls · six** · Quotes shown: Three · Four · Six. Attribution: Right column · Under the quote. **Rules: Between · Above and below · None.** Quote size: Small 17 · Card 20 · **Feature 27 — the only multi-quote design that offers it.** Row padding: Compact 24 · Comfortable 32 · Spacious 44 — a rule ladder, not a section one, which is why it keeps its row. Member visibility: Everyone · Logged out · Free · Paid. **No Avatars control:** no avatar is drawn at any value, and the field stays on every item waiting for the design a site switches to next.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 · **Top divider locked None at Rules Above and below** — that value already draws a rule across the section's top edge and two hairlines 24 px apart is a mistake — available at Between and None. **Quick Controls:** Quotes shown · Attribution · Rules · Quote size. **This design can still contain no accent pixel**: the only accent A8 has left here is the optional link's underline, and a site that authors no link has none.

**Arrangement** · 780 · 56 · 300, **160 px of the content width left unused** — the attribution column is a caption column, not a second text column — both halves top-aligned so the name is level with the quotation's first line. Rules are `border-top` on the items with the row padding above and below each; at Rules Above and below the outer two are borders on the `<ul>`. **At Rules None the rows take the Spacious spacing whatever the control says**, because 32 px of nothing between two quotations is not enough to end one. Foot 32 px under the last row.

**Responsive** · the two-column row holds above 1081. **At 1080 and below the attribution goes under the quotation at both values**, disclosed as “Under the quote at this width”, and the quotation takes the full content width. At 834 row padding 28, quote 19; at ≤ 767 row padding 24, quote at the phone step. **Nothing else changes at any width; there is nothing else to change.**

**Empty** · **one quote → hands off to 1 Single**, the only hand-off out. **This design has no equal-height mechanism at all**, so a stepped-down long quotation affects no other row.

**Three hand-offs arrive here** · 6 Split Head with no title; 11 Faces at ≤ 767 and at two quotations. **The phone frames of 11 Faces and this design are the same drawing.**

**a11y** · `<ul>` of figures; **no `<h2>` and no accessible name** — naming it “Testimonials” would be the theme writing copy. Rules are borders, never `<hr>`. **Nothing focusable unless a link is authored; no hover state anywhere; no motion.** **In forced colours this design is unchanged.**

**Flagged** · the 780/56/300 division and the unused 160; top-aligning the halves; dropping the avatar entirely; the three Rules values and the forced spacing at None; offering Feature 27 here; taking the three hand-offs; handing off to 1 Single at one quotation.

---

## 13 · Highlight

One quotation at Display 40 in an 848 px card with two at Small 17 stacked in 416 px cards beside it. **Settles how far one voice may lead: two steps of the ladder and no more.**

**Descriptor.** The only design that draws one quotation larger than its neighbours, taking that emphasis from the repeater's order rather than from any control — and the only one that settles how far one voice may lead: two steps of the ladder and no more.

**Structural descriptor.** `grid-of-N · none · page · few · none · one lead, two small`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The even height split of the right column is a grid, the two padding scales and two internal gaps are CSS, and the lead's step-down is computed from its own string. **JS off:** unchanged.

**Items.** First three drawn; **item one is the lead**.

- **Add quote** appends; a fourth is counted and not drawn — “3 of 4 drawn”.
- **Remove.** **Two → one 848 card beside one 416 card at full column height**, not restretched; **one → 1 Single**; zero → the section does not render. Removing the lead promotes the next row into the lead slot.
- **Reorder is the only way to change which quotation leads.** The lead is the repeater's first row, **nothing about “featured” is stored**, and this is the design where the no-per-item-control rule is clearest: there is no Make this one big, because that would be a control addressing one item. A site that wants a different lead drags a row to the top.
- **Minimum and maximum.** Designed for exactly three, drawn at two, handed off at one.
- **At zero items** the section does not render.
- **Inside an item**: the five content fields, identical in both slots. Avatar 44 in the lead and 36 in the pair; **the pair's role line is trimmed to `org`, or `role` where there is no organisation**, and the lead's shows the full line. **Which slot an item lands in is its position in the list, not a property of the item.**

**Fields** · `eyebrow`, `title`, `note`, link pair, **first three of `quotes[]` — item one is the lead**. `sub` and `image` kept, not drawn. The lead's attribution shows the full role line; **the pair's is trimmed to `org`, or `role` where there is no organisation** — 11 Faces' trim reused. **Which quotation leads is the repeater's order, never a flag**, so nothing about “featured” is stored.

**Controls · seven** · Head: Centred · Flush left · None. **Title size: Medium 34 · Large 40** — Display 48 would outrun the lead. Lead: Left · Right. **Lead size: Feature 27 · Display 40**, against Small 17 at both. Cards: Surface · Ground. **Avatars: Shown · Hidden** — **Hidden drops the lead's 44 and the pair's 36 together; there is no per-slot value**, as there is no per-item control anywhere in A8. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · Background role (Contrast disabled, 9 named) · Vertical spacing resolving 64 · 96 · 132 — the lead's 40 and the pair's 28 follow the type and stay uncontrolled · Top divider, all three available. **Quick Controls:** Lead · Lead size · Cards · Avatars.

**Arrangement** · 848 · 32 · 416; the two small cards divide the right column's height evenly, so the pair reads as a pair rather than a leftover. **Lead padding 40 and small padding 28; lead internal gap 32 and small internal gap 16** — the only design in A8 that departs from the card's step-linked gap in both directions, because the type does. Lead avatar 44, small avatars 36. **The lead never takes a lighter plane than the pair**: a card that was lighter as well as larger would be two signals for one hierarchy.

**The ratio** · Display 40 against Small 17 is 2.35×; Feature 27 against Small 17 is 1.6×. **A third step was drawn and refused** — at Display against a hypothetical 13 px the small cards read as a caption to the big one, and a section that quietly demotes two of its three readers is worse than a section with one. **The small quotations are never muted in colour at any value**: `text` at 17 px, 16.6:1 / 15.1:1, the same as the lead. **The hierarchy is size only.**

**Responsive** · the pairing holds above 1081. **At 1080 and below the lead goes full width above and the two small cards go side by side under it**, with Lead disclosed as having no effect. At 834: lead Display 34, small 16, paddings 32 and 24. At ≤ 767 one column, lead first at both values, 16 px apart, **and the ratio narrows to 28 against 16 because that is the phone ladder** — stated in the sidebar rather than corrected.

**Empty** · **two quotes → one 848 card beside one 416 card at full column height**, not restretched; one → 1 Single. Over 180 / 260 characters the lead steps down, **which can bring it to the same step as the pair**, and the sidebar says so.

**a11y** · one `<ul>` of three items — the shared right column is a wrapper, not a nested list; **no heading semantics on the 40 px lead**; **nothing marks the lead as more important to assistive technology** — the emphasis is visual only.

**Flagged** · the 848/416 division; **two ladder steps as the maximum and the refusal of a third**; never muting the small quotations; the two padding scales and two internal gaps; the trimmed role line; the even height split; the two-quote answer; the phone's narrowed ratio.

---

## 14 · Slim Line

One short quotation on a single line between rules, the attribution inline after it. **No head, no card, its own 32 · 44 · 56 padding scale** (A7·8's), and a **120-character ceiling** no other design imposes.

**Descriptor.** The only design that fits a quotation and its source on one line, on its own compact padding scale, with a 120-character ceiling no other design imposes and a hand-off rather than a truncation at the top of it.

**Structural descriptor.** `bar · none · page · one · none · one line between rules`

**Archetype.** bar

**Behaviour module.** **none**, and this is the only design in A8 with no interactive element at all — nothing focusable, hoverable, dismissible or animated at any value. **The 120-character hand-off is a template branch on the authored string, decided before the page is served**, not a script and not a measurement of the window. **JS off:** unchanged. It is also worth naming what this design is not: **A2's bars are `dismiss` and can be `rotator` or `marquee`; this is a section in the flow of a page and declares none of the three.**

**Items.** Four fields from the first row; **every quote after the first is kept and never drawn**.

- **Add quote** appends and is not drawn — part of the ten fields this design keeps, and the reason switching away from it loses nothing.
- **Remove** promotes the next row into the line; zero → the section does not render.
- **Reorder** chooses the drawn quotation.
- **Minimum and maximum.** Designed for exactly one drawn, twelve authored. **The field stores up to 300 characters and this design draws up to 120**: over 120 the section draws 1 Single and the counter reads “121 characters — drawing 1 Single. Under 120 for one line.” **The step-down never fires here** — 120 is under the first threshold.
- **At zero items** the section does not render, rules included.
- **Inside the item**: `quote`, `name`, `role`, `org` drawn; **`avatar` editable, kept and never drawn**. Role alone or organisation alone sits in the inline string by itself; with neither, the string is the name.

**Fields** · **four drawn** — `quote`, `name`, `role`, `org` from the first item. **Ten kept and never drawn**, including `avatar`, both image fields, the whole head, the note, the link and every quote after the first: the most any design in A8 keeps, and the reason switching away loses nothing. **The field stores up to 300 characters; this design draws up to 120.**

**Controls · four, the shortest list in A8** · Rules: Above and below · Above only · None. Alignment: Centred · Flush left. Quote size: Small 17 · Card 20 — **Feature and Display would not sit on one line with a source after them**. Attribution: Inline · At the right. **No Avatars control** (none is drawn at any value) and **no Member visibility** — the section link is never drawn here, so there is no ask to gate and nothing member-aware in the design. *Flagged: the Member visibility exemption is mine, and it is the one place in A8 a site cannot hide a section from a member state.*
**Universal** · Background role (Contrast disabled, 9 named; the old Ground row retires here) · **Vertical spacing resolving this design's own 32 · 44 · 56** (28 · 40 · 48 at 834, 20 · 28 · 36 at 390) — **the old Padding row retires into the trio and keeps its compact ladder as this design's resolution** · **Top divider locked None at Rules Above and below and at Rules Above only**, because the design already draws a rule at its top edge; available at Rules None. **Quick Controls:** Rules · Alignment · Quote size · Attribution.

**Arrangement** · one line, baseline-aligned, 16 px between quotation and source; the attribution **one inline string** — name 14/600 in `text`, comma, role and organisation 14 in `text-muted`. **Rules run the full content width at every value**, not the length of the type, because a rule that stops where the quotation stops is an underline. No avatar, no accent, nothing focusable. **At Attribution at the right a short quotation and a long role line can end up 900 px apart**, and the sidebar names Inline for that case rather than centring the pair automatically.

**The ceiling** · **120 characters, hard, and a hand-off rather than a truncation.** At 1440 the content width holds about 118 characters at Card 20 with the attribution after it; past that the line wraps, and a two-line quotation between two rules is 1 Single with rules. Over 120 the section draws 1 Single and the counter reads “121 characters — drawing 1 Single. Under 120 for one line.” **The step-down never fires here**: 120 is under the first threshold.

**Responsive** · at 834 about 88 characters fits on one line and the counter's advice says so. **At ≤ 767 the attribution goes to its own line at both values**, 10 px under the quotation, disclosed as “On its own line below 767”. **A quotation that wraps at a narrower width is drawn wrapped and does not hand off** — the hand-off is measured from the authored string, not the window.

**The boundary** · **A6·10 Slim** is a banner: it asks for something and ends in a link, and a quotation with “Subscribe” after it is **A6·11 Reasons**. **A2's bars** sit above the header, are dismissible and can rotate. **A4·16 Pull Quote** is a quotation inside an article, from the article. This is a section in the flow of a page that says one reader's sentence and asks for nothing: **no button, no dismiss, no link, nothing sticky, nothing that changes.**

**a11y** · figure, blockquote, figcaption; no `<ul>`; **no `<h2>` and no accessible name**, with 12 Rows the only two. **The attribution is one figcaption reading as one sentence**, the comma typed, the muted half styling rather than a field. Rules are borders on the figure. **Nothing focusable, hoverable, dismissible or animated at any value** — the only design in A8 with no interactive element at all.

**Flagged** · the 120-character ceiling and its hand-off; the inline attribution as one string; the 16 px baseline gap; full-width rules; refusing Feature and Display; the phone's forced own-line attribution; the three stated boundaries.

---

## 15 · Overlap

**A4·18's shape**: a full-bleed image band with a quote card pulled up over its foot. The only design in A8 whose geometry depends on the section after it, and the only one that puts text over a photograph.

**Descriptor.** The only design that puts a quotation over a photograph, and the only one whose geometry reaches into the section below it — the card's overhang reserved out of its own bottom padding so no page needs to know it is there.

**Structural descriptor.** `media frame · none · image · one · full-bleed · card pulled over band`

**Archetype.** media frame

**Behaviour module.** **none.** Band height, crop, the scrim gradient, the overlap and the reserved overhang are all CSS, and the band's height is reserved before the image arrives. **No parallax, no reveal, nothing scroll-linked — in the most tempting place in the library to attach one** — so `reveal` is refused rather than degraded, and the forced-colours move of the head above the band is a media query. **JS off:** unchanged.

**Items.** One item drawn, **`avatar` included**.

- **Add quote** appends and is not drawn; “1 of N drawn”.
- **Remove** promotes the next row into the card; zero → the section does not render, band and all.
- **Reorder** chooses the words. **The band is a section field, not an item field**, so the photograph does not travel with the row — which is defensible here in a way it is not in 8 Portrait, because the band is a scene rather than a picture of the speaker.
- **Minimum and maximum.** Designed for exactly one. **No image → hands off to 1 Single**; there is no striped placeholder and no coloured band on a live page.
- **At zero items** the section does not render — a photograph with no quotation over it is not this design with something missing, it is A24's.
- **Inside the item**: the five content fields, **avatar drawn at 44 on the card** where 8 Portrait suppresses it. **The card grows downward with a long quotation and the band never stretches to match it.**

**Fields** · `eyebrow`, `title`, `note`, link pair, **`image` and `imageAlt`**, and the first item of `quotes[]` **including `avatar` — unlike 8 Portrait, the avatar is drawn here**, because the band is a scene rather than a portrait of the speaker. `sub` kept, not drawn.

**Controls · seven** · **Band height: Short 320 · Tall 420.** Head: Over the band · Above the band · None. Card width: Narrow 632 · Wide 848. Card position: Left · Centre. **Overlap: Compact 48 · Comfortable 72** — it measures the card's pull, not the section, which is why it keeps its row. **Avatars: Shown · Hidden** — Hidden drops the 44 px circle on the card; **the band's photograph is a section field and is unaffected**, because it is a scene rather than a portrait of the speaker. Member visibility: Everyone · Logged out · Free · Paid.
**Universal** · **Background role locked, with the reason shown: the photograph is the ground.** Remove the image and the design hands off to 1 Single, which carries the control. **Vertical spacing resolving 64 · 96 · 132 above the band** (the old Padding row). **Top divider locked None at head Over the band and at head None** — a hairline above a full-bleed photograph is a line on nothing — available at head Above the band. **Quick Controls:** Band height · Head · Card width · Overlap.
**The band image carries Image focus — Centre · Top · Bottom** — in its Image Picker popover, beside its alt text. **8 Portrait is the only image field in A8 without it**, and its refusal is stated there rather than inherited here.

**Arrangement** · full-bleed band; card pulled up by the overlap; quote Feature 27, card padding 40, avatar 44; **the md warm shadow — the only shadow in A8, and dropped in dark** where the plane step from `background` to `surface` plus the hairline does the work. The shadow is allowed because **the card is in front of something**. **The card grows downward with a long quotation and the band never stretches to match it.**

**The scrim rule** · **a scrim is drawn only under text, only as far as the text reaches, and only from the `contrast` token** — `#232019` at 55% fading to 0 over the top 200 px (160 at 834, 130 at 390), at head Over the band and nowhere else. **Nothing behind the card**, which is opaque: a scrim there would darken a photograph for no reader. **Not black, not a full-height overlay, not a uniform wash** — all three flatten a warm photograph into a grey one. Head text takes the band's carried colours, `#FBF9F5` and `#EDE7DA`, 9 Contrast Band's pair reused. **Contrast is measured against the darkest 20% of the scrimmed area** — 12.4:1 for the title, 10.1:1 for the eyebrow — and a photograph that cannot hold the title there is the site's crop to fix; **the theme does not deepen the scrim until anything passes.** The photograph's own darkness is never adjusted in dark mode: “image scrims adjust” means the scrim, not the picture.

**The overhang is reserved** · the section's own bottom padding is the overlap plus its normal step, so **the next section starts where it would have anyway** and no page needs to know this design is above it. The reservation grows with the card.

**Responsive** · the shape holds at every width. **At 1080 and below the card takes the full content width inside the margins** at both Card width values, Card width and Card position are disclosed as having no effect, **the band is 320 at both height values and the overlap is 48.** At 834: padding 80, quote Feature 24, card padding 32, scrim 160. At ≤ 767: band 240, overlap 32, card padding 24, quote Feature 22, avatar 36, scrim 130.

**Empty** · **no image → hands off to 1 Single**, named in the panel; there is no striped placeholder and no coloured band on a live page. No `imageAlt` → `alt=""`. No eyebrow or title → head None, no scrim, no accessible name.

**a11y** · **the band is an `<img>`, not a CSS background**, with the scrim an `aria-hidden` sibling `<div>` and never a filter on the image. The card is not a link and does not lift, scale or move. **No motion at any value — no parallax, no reveal, nothing scroll-linked**, in the most tempting place in the library to attach one. **Forced colours: the head moves above the band**, the one arrangement change forced colours causes in A8.

**Flagged** · the 55%-to-0 scrim and its 200 px reach; drawing it only under text; **the reservation rule**; allowing the md shadow here and dropping it in dark; the band heights and overlap values; the card growing while the band holds; drawing the avatar where 8 Portrait suppresses it; the hand-off with no image; the forced-colours head move.

---

## 16. What A8 settled, in one place

1. **Quote length** · 40–300, hard at both ends. **Step-down, never truncation**: one value down past 180, two past 260, measured from the string and disclosed at the control. Three stated exceptions — 3 Two Up caps at one step, 5 Wall has no step to take, 14 Slim Line never reaches a threshold and hands off at 120 instead.
2. **Attribution** · name required; role and organisation one comma-joined line; avatar 44 / 36 / 32 by context and **absent rather than substituted** — except in 11 Faces, whose fixed row of circles draws the initials fallback.
3. **Single, grid and slider** · all three exist. **The slider is A5·14's rail, not a carousel**, and it is allowed under reduced motion because the reader drives it. **Nothing in A8 advances on a timer, loops, cross-fades on its own or hints at a swipe.**
4. **Authored, all of it** · Ghost has no reviews API; comments and members are refused with reasons. 0 quotes → no render; 1 quote → seven designs draw it and eight hand off; many → a stated count per design with “N of M drawn” in the panel, twelve at the ceiling.

**And what the drawing changed** · six statements in `A8-0` were written before the designs and overruled by them: the shadow rule (15 Overlap's card carries the md shadow over an image), the `<h2>` count (four designs, not two), the one-quote list (1, 3, 8, 9, 10, 14, 15), the card's padding (it follows the card's width), the quote-to-attribution gap (it follows the quote's step), and 8 Portrait's divisions (a third was drawn). All six are amended in `A8-0` and logged in its consistency pass.

---

## 17. Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fifteen, in order:

| # | Design | Tuple |
|---|---|---|
| 1 | Single | `stack · none · page · one · none · lone quotation at Feature` |
| 2 | Three Up | `grid-of-N · none · page · few · none · three equal card columns` |
| 3 | Two Up | `grid-of-N · none · page · few · none · Feature quote inside card` |
| 4 | Grid | `grid-of-N · none · page · variable · none · per-row equal heights` |
| 5 | Wall | `grid-of-N · none · page · many · none · unstretched columns read down` |
| 6 | Split Head | `split · none · page · few · none · head beside the rows` |
| 7 | Slider | `carousel · none · page · many · none · rail bleeding past margin` |
| 8 | Portrait | `split · none · page · one · left · photograph of the speaker` |
| 9 | Contrast Band | `grid-of-N · none · contrast · variable · none · panels on inverted band` |
| 10 | Big Quote | `stack · none · page · one · none · Display quotation, no title` |
| 11 | Faces | `carousel · none · page · variable · none · avatars as tab row` |
| 12 | Rows | `stack · none · page · variable · none · hairline rows, caption column` |
| 13 | Highlight | `grid-of-N · none · page · few · none · one lead, two small` |
| 14 | Slim Line | `bar · none · page · one · none · one line between rules` |
| 15 | Overlap | `media frame · none · image · one · full-bleed · card pulled over band` |

**No two tuples are identical.** Four designs are separated on the sixth slot alone, and they are named below rather than papered over.

**Containment is `none` on all fifteen, and it is the slot most likely to be got wrong here.** Eight designs draw cards — 2, 3, 4, 5, 7, 9, 13 and 15 — and not one of those cards contains the section: **they are the item's own geometry**, which is exactly what the closed set means by `none`. **15 Overlap is the case worth stating**: its single card sits over a photograph and carries the category's only shadow, and it is still the item's geometry rather than the section's container, so the slot reads `none` while the ground reads `image`. **A8 contains no boxed, pilled or card-contained section at all.**

**Ground.** Thirteen on `page`, one on `contrast` (9), one on `image` (15). **Three designs offer a section Ground control of Background and Surface — 1 Single, 10 Big Quote and 14 Slim Line — and the tuple names the ground the design is drawn on, not the range the control offers**: a site that switches 1 Single to Surface has changed a value, not a design. 9 Contrast Band has no Ground control, which is why the band is in its tuple rather than in its controls. *Flagged: the convention.*

**Item-count class.** `one` on 1, 8, 10, 14, 15 · `few` on 2, 3, 6, 13 · `many` on 5, 7 · `variable` on 4, 9, 11, 12. The convention: **a design whose count control stays inside one class is written as that class, and one whose control crosses classes is `variable`** — 4 Grid (four or six), 9 Contrast Band (one or three), 11 Faces and 12 Rows (three, four or six) all cross. `none` is unused in A8: every design draws at least one repeating unit, because the repeating unit is the category.

**Media placement.** `none` on thirteen. A8 draws no imagery except in the two designs that read `image` — 8 Portrait at `left` (Image side Left drawn, Right offered on the same tuple) and 15 Overlap at `full-bleed`. **Avatars are not media placement**: an 88 px square of a face inside an attribution is part of the item, and calling it media would write `inline` onto eleven designs and say nothing about any of them.

**The four designs separated on emphasis alone.**

1. **2 Three Up, 3 Two Up and 13 Highlight** all read `grid-of-N · none · page · few · none`. Three 416 cards at Card 20, two 632 cards at Feature 27, and an 848 card beside two 416s. The document already concedes the first two are the same controls at two scales. **The closed vocabulary cannot express what actually separates them — card count inside the `few` class, card width, and which step of the quote ladder the card takes** — so the sixth slot carries all of it. If the architect wants these structurally distinct, the fix is a finer count class or a scale slot, not a longer emphasis phrase.
2. **1 Single and 10 Big Quote** both read `stack · none · page · one · none`. Feature 27 on a 780 measure with an optional title, against Display 40 on a 1,000 measure with the title dropped by construction. §10 already says that at Card 20 this design is 1 Single with a wider measure. **This is the pair the tuple is least able to tell apart**, and it is a finding rather than a defect in either design: the difference is real and it is a difference of scale, which the closed slots do not carry.

---

## 18. Findings for the architect

1. **`tabs` against A8's no-`<h3>` rule.** The registry's degradation for `tabs` renders each panel preceded by its tab label as a heading; A8 has no `<h3>` in fifteen designs and holds that a reader's name is not a heading. 11 Faces is the only design affected. The registry's sentence stands as quoted; the exception is the architect's to grant or refuse.
2. **The closed slots cannot separate A8's card grids.** Four designs — 2, 3, 13 and the 1/10 pair — differ from a category sibling on the emphasis phrase alone, in every case because the real difference is scale: card width, card count inside a class, or the step of the quote ladder. Named in §17.
3. **One mechanic degrades to nothing rather than to a fallback.** 7 Slider's arrow `disabled` end-state needs the scroll position, and `carousel` hides the arrows rather than leaving them inert. Nothing else in A8 loses a mechanic: the rail still scrolls, snaps and drags with JavaScript off, and no quotation anywhere in the category is JavaScript-dependent.
4. **The library is inconsistent on the archetype for a tablist.** A5·12 Tabs is `carousel`; A7·10 Tabs is `nav`. **A8·11 follows A5·12**, whose structure and behaviour it borrows verbatim, but one of the two needs to change and it is not this document's call.
5. **Nothing was owed to the frames on modules, and two names have now been drawn anyway.** This document coined no module names, so no correction was needed; the reconciliation pass added the registry's own names where a user would look for behaviour — a **BEHAVIOUR** group on **7 Slider** (`carousel`) and on **11 Faces** (`tabs`), each quoting the registry's no-JS sentence. **Thirteen designs still declare nothing.**
6. **No registry addition is asked for by this pass.** The universal trio, Member Visibility, Avatars, Image focus and the inline-editing route are all server-rendered or editor-side, so **A8 still declares exactly two modules** and **no module name is coined anywhere in it**. The one flag that stays on a frame is 11 Faces' `tabs` ruling, which is a degradation question rather than a missing module.
7. **One design cannot be hidden from a member state.** 14 Slim Line takes no Member Visibility because it draws no ask. If the architect wants the control universal rather than CTA-scoped, that design is the only one that would gain it. *Flagged.*

---

## 19 · Reconciliation notes

**Frames changed in this pass.** **All fifteen control-panel frames.** Every **Padding** row retired into **Vertical spacing** — **9 Contrast Band's Band padding** and **14 Slim Line's compact ladder** with them, as that design's resolution rather than as a second row — and the three **Ground** rows (**1 Single**, **10 Big Quote**, **14 Slim Line**) retired into **Background role**. The **universal trio** is now drawn outside every design's list, with **Background role locked on 9** (the band is the design) and **on 15** (the photograph is the ground), **Contrast disabled on the other thirteen** with 9 named, and **Top divider locked None on 9** (Full bleed), **12** (Rules Above and below), **14** (Rules Above and below, Above only) and **15** (head Over the band, head None). **Avatars: Shown · Hidden added on 1, 2, 3, 4, 5, 6, 7, 9, 10, 13, 15**, with **5 Wall's precedence rule stated at the control** — Hidden wins at every Cards value. **Member visibility added on all but 14.** An **AVATARS · not offered** note added on **8, 11, 12, 14**, each carrying its own reason. An **EDITING · the P0 primitives** group added to all fifteen (the P0·1 toolbar on every visible text, the marks toolbar suppressed on the quote, the Link Picker and its new-tab/rel options, the optional P0·2 icon on the section link, the P0·3 item list, Image focus on avatars). A **BEHAVIOUR · from the fixed registry** group added to **7** (`carousel`) and **11** (`tabs`), each quoting the registry's degradation sentence. A **DATA · nothing from Ghost** group added to all fifteen, carrying the two refusals of source and the four refusals of ornament. Every **footer count** rewritten to “N controls + the universal trio + the Data group”, and a **Reconciled card** added to all fifteen spec blocks with that design's Quick Controls. Beyond the panels: **8 Portrait's Crop advice now carries the help line and the disabled Image focus**, and **11 Faces gained a visible ARCHITECT: `tabs` registry ruling flag at the head of its frame set**.

**No section frame was redrawn**, and the reason is worth stating rather than assuming: nothing in this pass changes what a reader sees at a drawn value. The new fields ship with the drawn text as their defaults, no ornament was added or removed, and **Avatars Hidden draws the closed-up block that fourteen of the fifteen frame sets already show** — Priya is third in the roster and carries no avatar, **1 Single** and **10 Big Quote** frame the case explicitly, and **5 Wall's Cards None** draws it as a whole arrangement. **15 Overlap is the one design whose Hidden state is not drawn**: it draws one quotation and that quotation has an avatar. Named here rather than glossed — the rule is the shared floor's and the drawing is 1 Single's. **No “Preview” control existed anywhere in A8**, so none was removed.

**Conflicts with earlier rulings, one line each.**

1. **§0's “Section padding Compact 64 · Comfortable 96 · Spacious 132” as a per-design control** — retires into **Vertical spacing** on all fifteen; **9's 44 · 64 · 88 and 14's 32 · 44 · 56 survive as that design's resolutions**, and **2's and 3's Card padding, 12's Row padding and 15's Overlap keep their rows** as ladders that measure something other than the section.
2. **1 Single's, 10 Big Quote's and 14 Slim Line's Ground control** — retires into **Background role** with the argument intact and only the row gone: 1's “there is no card, so the ground is the only plane the section has” and 10's “Ground Surface is the whole section, not a card” are now that control's advice lines.
3. **§17's “the tuple names the ground the design is drawn on, not the range a Ground control offers”** — unchanged and now easier to hold: the range is universal, the drawn ground is still the tuple's, and **9's and 15's locks are the two cases where the two coincide**.
4. **§0's “Where there is no avatar the block closes up”** — survives and gains a control: it was a data state and is now also a decision, and **the drawing is identical either way**. The old sentence stands; what changes is that a site no longer has to delete twelve files to reach it.
5. **5 Wall's “At Cards None the avatar is read and not drawn — the one place in A8 where a section control takes an item's field out of the drawing”** — loses its uniqueness, not its behaviour: **eleven designs now do that through Avatars Hidden**, and 5 Wall is where the mechanism was proved. **Hidden wins at every Cards value**, so the two controls can never disagree.
6. **8 Portrait's “centred on its own centre with no focal-point control”** — **stands, conditionally.** Ground rule 10 asks every image field to carry Image focus; this design's refusal is more specific and wins, **but only because the escape hatch ships**: Image focus is drawn **disabled with its reason** in the Image Picker popover and the help line sits beside Crop. An absence would have been re-filed as a bug; a disabled field with a reason is an answer.
7. **§0's “Nothing in A8 is a link except the optional section link”** — survives, and that link is now the whole surface rule-11 touches: it goes through the **Link Picker** with open-in-new-tab and rel options and takes an **optional icon, off by default**. **A8 draws no labelled button at all**, so the icon offer lands nowhere else. **7 Slider's arrows are excluded by name** — the module's affordance, not an action.
8. **§0's “There is no accent by default … it appears in exactly three places”** — unchanged. The icon offer adds no accent (an icon takes the label's colour role), and **12 Rows and 14 Slim Line can still contain no accent pixel**.
9. **§0's “The quote field is plain text: no bold, italic, links, line breaks or lists inside somebody else's sentence”** — survives, and this pass changes only how it is enforced: **the quote edits inline with the marks toolbar suppressed** rather than offering marks and refusing the paste. Withholding is the honest mechanism.
10. **The spec's routing of every edit through the sidebar repeater** — overturned: **selection on canvas edits in place** for eyebrow, title, sub, note, link label and the per-quote quote, name, role and organisation. The repeater keeps what only it can do — add, remove, reorder, and choosing which rows a design draws.
11. **§0's “Nothing comes from Ghost. That is the category.”** — unchanged and now drawn: the **Data group** states it on all fifteen panels, **no “Populate from…” panel is offered on any A8 design**, and the two refusals of source (comments, members) are on the panel rather than only in this document.
12. **§0's four refusals of ornament** — unchanged and now **on record in every panel**: no rating, score, star or “verified” mark; no per-item link; no decorative quote glyph; no autoplay. They were the easiest things in the library to re-add by accident.
13. **7 Slider's arrow labels “Previous quotes” / “Next quotes”** — become **catalog strings**, not fields. The a11y ruling behind them is untouched: plural, because a press moves the rail rather than selecting a quote. **They are the only fixed visitor-facing English strings A8 shipped.**
14. **11 Faces' exemption from Avatars** — a ruling of this pass rather than a conflict: the tab row is a fixed row of circles with an initials fallback, **Tabs Name only is the nearest thing the design has**, and **12 Rows is the text-only arrangement it already hands off to**. Stated in the panel where a site would look for the row.
15. **14 Slim Line's exemption from Member Visibility** — a ruling of this pass: it draws no link at any value, so it bears no ask to gate. **It is also the one design in A8 a site cannot hide from a member state**, which is a cost and is named in §18 rather than buried. *Flagged.*
16. **The category's “six controls” footers** — lifted: the ceiling is the PRD's ~15 plus the trio and the Data group, and **A8 now lands between four and seven of its own** (14 at four; 1, 8, 10, 11, 12 at six; the other eight at seven). **Quick Controls stay the 3–5 highest-impact** and are named per design.
17. **§18's finding 1, `tabs` against the no-`<h3>` rule** — unchanged and now **visible on the frame**: 11 Faces carries the **ARCHITECT: `tabs` registry ruling** flag until it is settled, the registry's sentence still stands as quoted, and the no-JS state is drawn either way. **No module name was coined.**
18. **§18's finding 5, “nothing is owed to the frames”** — superseded in the small: nothing was owed on module *names*, and this pass drew the registry's two anyway, in a BEHAVIOUR group, because a user looking for what a section does should not have to read a specification to find out.
19. **`A8-0 Category Proof` predates this pass.** The universal trio, Avatars, Member visibility, the Data group, the P0 primitives and the two drawn module names are not in it; it was not redrawn, and **per the category's own consistency rule the drawn panels are the authority until it is**.
20. **The structural-descriptor table** — unmoved. No tuple in §17 depends on a control this pass touched: the retirements changed where a control lives, not what any design draws, and **9's and 15's locks confirm the grounds their tuples already name**.
