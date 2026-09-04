# A12 About and Team — written specification

15 designs · Paper pack · drawn in this project as `A12-1 Grid.dc.html` … `A12-15 Groups.dc.html`, with the category's shared artefacts in `A12-0 Category Proof.dc.html`.

Read `A12-0` first. It carries the four settlements §8 asks A12 to make, the person card, the two photo families and their ladders, the rules all fifteen share, the fifteen-field shared list, the roster, the twelve people every frame draws, the tokenisation proof across three packs and the stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times, plus the amendments the drawn designs forced on the proof.

**About and Team patch (28 August 2026).** Two rulings landed on this category and one of them touched every design in it. **The initials block now follows its source:** a list the site types itself keeps **two letters** ("RF"), and **an author pulled from Ghost shows one letter** ("R"), because Ghost cannot produce two initials from a name — restated in the shared floor, in all fifteen empty states and in every design's Ghost paragraph. **No design turns into another design any more:** every hand-off this document carried — 8 Founder at a team of one, 9 Faces above twelve, 1 Grid in the ten designs that named it, 1 Grid at a rail whose cards already fit — is now **a line of advice in the panel**, and the section draws what it has, holds what it cannot draw, and hides what does not apply. **13 Rail's measured precondition is withdrawn** and replaced by the hidden arrows and fades it always implied. **9 Faces' Row gap takes the library's gap words**, Tight · Normal, two of the three with the reason shown. **The per-author role override was already keyed by the author's slug** and is confirmed rather than changed. Nothing else moved: no layout, type scale, colour pack or spacing value, and **nothing was renumbered.**

**Pass two patch (31 August 2026).** Nine further rulings and two Ghost server findings landed on the library, and four of them have a subject here. **Count per row keeps its three named values** — the one carve-out to the rule that an item count is a number you type, because each value is a drawn cell width and no frame exists at any other. **The avatar rule is stated in every empty state that draws a face**: two initials where the site types the list itself, one letter where the person came from Ghost, and the two forms never mixed inside one component. **13 Rail no longer names another design in its own responsive line** — it describes the result, a plain grid with no arrows, no fades and no scroll container. **A value another control switches off is greyed with the reason beside it**, never hidden and never left accepting a value it will not honour. Nothing was redrawn, nothing renumbered, and no design total appears anywhere in this category.

**[Free] designs:** 1 Grid · 10 Directory

*(Shortlisted and recommended in this pass — **the owner's confirmation is still open**; see the question at the end of this document.)*

**Controls-reconciliation patch (this document’s current state), 24 August 2026.** The category was audited, design by design, against the PRD’s control vocabulary and Ghost’s verified data surface, reusing the shared editor primitives designed in **P0 · Editor primitives** — the P0·1 inline text toolbar and its link popover, the P0·2 icon slot and Icon Picker, the P0·3 item-list controls, the Ghost-aware Link Picker and the P0·6 editor state switcher. **Seven things changed across all fifteen designs.** **The Ghost source became real:** a **Data** group on every panel — Source: Authored · Ghost authors, and at Ghost authors, Authors All · Hand-picked · Limit (stepper, ≤ 24) · Order Name A–Z · Most posts — with the platform fact stated in the panel, that **only authors with at least one published post appear**. **The repeater reconciles with that source:** at Ghost authors it is P0·3’s read-only card — no Add person, no drag handles, no Remove — carrying **one editable field per row, a Role override keyed by the author’s slug**, which is the mechanism the floor’s “the role line is empty unless the site authors one” implied and never had. **A false claim is deleted:** “the site changes author order in Ghost rather than here” — Ghost Admin has no author reorder, and the Order row is the fix. **The universal trio — Background role, Vertical spacing, Top divider — sits outside every design’s control list** and every per-design Padding row is retired into Vertical spacing; **7 Contrast Band’s 44 · 64 · 88 and 11 Slim’s width-independent 32 · 44 · 56 survive as that control’s resolutions rather than as second rows**, while 2 Cards’ Card padding and 9 Faces’ Row gap keep their own. Two values are locked: **7 Contrast Band’s Background role, at Contrast, with the reason shown**, and **11 Slim’s Top divider, at None**, because that design’s own Rule row already draws both edges. **Author socials ship behind a control:** Socials Off (default) · Shown on twelve designs, four bare 28 px Icon Picker slots a person, populated from the author’s own Ghost handles at that source — version-gated, Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36 — refused with a reason on 9 Faces, 10 Directory and 11 Slim. **`socials[]` makes the shared field list sixteen.** **Image focus is adopted as a field rather than refused as a control** — in the Image Picker’s popover on every `photo` and on 4 Story and Team’s `image`, its values P0·9’s and not restated here *(the three values this line carried were removed in pass five)*, A14’s ruling that where a photograph is cropped is content; the ratio stays the section’s and a per-person crop is still refused. **And every visible string edits inline on canvas** with the P0·1 toolbar — the head fields, `note`, the link label, a person’s name, role and bio, 11 Slim’s sentence, 15 Groups’ labels, and the `body` prose in 4 Story and Team, 5 Split Head and 8 Founder — while **Ghost-owned content is never inline-editable** and answers “Edit in Ghost”. Per design: **Bios: Shown · Hidden** on 2 Cards and 3 Rows, 13 Rail’s and 15 Groups’ Bio rows renamed to it, and **a one-shot Sort A–Z at the repeater’s head in 9 Faces and 10 Directory** — an edit, not a control. **Three published strings become theme catalog strings**: 13 Rail’s “Team, scrollable”, “Scroll left” and “Scroll right”; the socials row adds a fourth pattern, “{name} on {platform}”. Full list of conflicts and frames touched in **Reconciliation notes** at the end.

**This round closes the pass.** Each of the fifteen sections gains an **Editing** line, stating inline editability per field in the same words as its frame's editing block — 1 Grid carries the category's statement and the other fourteen state only what they add to it — and **the document now ends with a Reconciliation notes section**, opening with the frames this pass changed and recording, one line each, every place an item overruled something this document had already ruled.

Every rule below is stated once here and once on the design’s own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

**Specification-only pass, this session.** Every design now carries four added fields — descriptor, structural descriptor, archetype, behaviour module — at the head of its section, plus an **Items** field naming what the sidebar does with `people[]`. Nothing drawn changed, no frame moved and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand as written. **No module rename was needed** — this document named no modules at all, having written 13 Rail's behaviour as A11·9's rail carried over and 14 Reveal's as a disclosure. Both now declare a registry module by name, and every no-JS sentence below is quoted from the fixed 31-module registry (FR-G7) rather than composed here.

**A12 uses two modules and thirteen designs declare none.** `carousel` on **13 Rail** and `accordion` on **14 Reveal** — the two designs the shared floor already named as the category's only behaviours. Everywhere else the resting state is the only state and the resting state is markup and stylesheet: the two photo families, the initials block, the named crops, 6 Portraits' scrim, 7 Contrast Band's band, 10 Directory's hairline rows, 11 Slim's overlap ring, 15 Groups' blocks, the name link's hover and A6's focus ring are all CSS, and the roster is server-rendered. **No A12 design loses an authored person without JavaScript**, and thirteen of the fifteen are pixel-identical with it switched off.

**`core` is assumed, not declared per design.** A12 has JS-conditional CSS in two designs only, and `core`'s job is that branch: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than fifteen times, as in A11. *Flagged: not listing it per design is mine.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. **Both are edit-safe**, which the behaviour floor below already says in its own words: 13 Rail's scroll position is never persisted or restored, and 14 Reveal's open state is never persisted and resets on reload at both Start values. That is why every frame in A12 is a resting state.

**Five findings for the architect.**

1. **`accordion`'s no-JS branch is native `<details>`, and 14 Reveal is drawn as a `<button aria-expanded aria-controls>`.** Both cannot be true at once. The registry's degradation is an acceptance criterion (FR-G4) and this document's rule is that the drawn panel is the authority, so the collision is real: **a `<summary>` is named by its own content**, and A12·14's `aria-labelledby` naming — the device by which the category avoids generating a second string — is not expressible in `<details>` markup. Either the module gains a button-based branch, or A12·14 generates a label and the category has two generated strings instead of one. **The architect's call, not this document's.**
2. **14 Reveal's second control value cannot degrade as drawn.** At Bio opens **Under the row** the trigger sits in the card and the panel is a full-width element below that row; native disclosure requires the panel to be the trigger's own child. With JavaScript off that value therefore draws as **In the card, every bio open** — no bio is lost and no content is unreachable, but the drawn arrangement is not preserved. Stated plainly rather than claimed as a degradation.
3. **13 Rail refuses `scroll-snap`, and here the refusal is not forced.** A11·9 refused snapping for a measured reason — a 216 px wordmark and a 26 px mark cannot share a snap point. **A12·13's cards are 240 or 306 px and equal**, so the registry's snap strip is buildable and this design refuses it only to stay identical to the rail it inherits. Settle whether an equal-card rail snaps; if it does, the refusal comes off A12·13's flagged list and **the no-JS drawing is better than the drawn one.**
4. **13 Rail's precondition is a measurement and no module measures.** The precondition as first written — if the cards are not wider than the content width, draw 1 Grid — needed the track's rendered width, and `carousel` has no branch for it. **It is withdrawn: no design turns into another design, so the rail hides its arrows and its fades where the track already fits and draws a row.** **With JavaScript off the section stays a rail**: a natural-width track scrolled natively, arrows and fades absent. It does not become another design, and it no longer claims to: **where the track already fits the content width the arrows and the fades are hidden and the rail rests as a row** — the section hiding what does not apply, which is what a measurement was being asked to decide. At ≤ 767 the arrows are already dropped, **so the phone drawing and the no-JS drawing are the same drawing** — the one place in A12 where a degradation is already a designed state.
5. ~~**The Image focus vocabulary is short a horizontal axis.**~~ **SETTLED — the owner’s ruling of 3 September 2026 gives Image focus a side-to-side axis, and P0·9 now carries both.** Kept for the record: the case that made the field necessary — a 4:5 crop of a landscape photograph — **crops left and right, not top and bottom**, and three vertical values had nothing to say about it. That case is now answered by reference to **P0·9** rather than by anything restated here, and the field goes on doing its old work on tall files in 6 Portraits, 8 Founder, 13 Rail and on 4 Story and Team’s Band 3:1 group photograph. **Nothing in A12 narrows either axis.**

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**A12's finding, stated first: this is the first category whose list has two sources.** A site can author `people[]` by hand, or point the section at Ghost's authors, and **the fifteen designs cannot tell which they were handed**. Most of A12's decisions come from that: a role that Ghost does not store, a bio with no length limit, an author page that may or may not be published, a photograph that may be a 400 px avatar. It is also the first category where the missing image is a face. A11 answered a missing logo with a second upload; a missing photograph cannot be answered that way, so **the initials block is a first-class state here rather than a fallback**, and a row mixing photographs with initials is the ordinary case. **Flagged**, and the category's headline finding.

**The person card is A12's one new component: photo, name, role, bio, in that order, in the DOM, in all fifteen designs.** What varies is whether the photograph sits above the text or beside it; 10 Directory draws no photograph at all. **A design never re-orders the parts**, so switching designs never changes what a screen reader hears about a person. The name is set in the pack's **body** font at 17/600, rising to 20 where the photograph is large enough to carry it — twelve names in a display face is twelve headlines, and the section already has one. Role 14 in `text-muted`, bio 15/1.6 in `text-muted`. **There is no card fill, border, shadow or radius on a person**: 2 Cards is where a person gets a plane, and it is the only design in A12 with one. **Flagged**.

**Two photo families, and a design offers one of them, never both.** **Circle** — A1·14's avatar at scale: Small 56 · Medium 72 · Large 96 at 1440; 48 · 64 · 80 at 834; 44 · 56 · 64 at 390. **Crop** — A8·8's named crops, the box being the cell's width and the height following the ratio: Portrait 4:5 · Square 1:1 · Landscape 3:2. **No design offers a control that switches between them**, because that control would move every other element on the frame. Two off-ladder sizes exist and each is flagged on its frame: **32 px in 11 Slim**, the smallest face in A12, and **44 px at Count Eight in 9 Faces**. The crop is named and never computed, `object-fit: cover`, centred, at the pack radius; **a circle is `border-radius: 50%` and does not take the pack radius**, which is the one place a pack's radius token has no effect in this category. **Refused in both families: a ring, a border, a shadow, a duotone, a greyscale filter and a hover zoom** — and **a focal-point *control*, which is now a focal-point *field*: Image focus sits in the Image Picker’s popover on every `photo`**, A14’s ruling that where a photograph is cropped is content. The refusal is kept exactly where it was aimed — **the ratio is the section’s, there is no per-person crop, and no control moves a crop** — with two stated exceptions: 6 Portraits' scrim under overlaid type, and 11 Slim's 2 px `background` ring, which exists only where overlapped circles touch. Upload advice, not a limit: 2 × the drawn box on its longest edge. **Flagged**, the whole ladder.

**Image focus, and it is P0·9’s — one control, defined once, not restated here.** Where a design crops a photograph into a frame of its own shape, Image focus says which part of the photograph survives the crop; **the values are P0·9’s, on both axes, and this document enumerates neither.** In A12 the control sits in the Image Picker’s popover on every `photo`, and on 4 Story and Team’s section `image` as well — **one control per image slot**, so that design draws two and no design draws one for a whole section. **No design in A12 narrows either axis**, so both are in force wherever a photograph is drawn, and the wording is P0·9’s, so the next change to it reaches A12 without an edit. **Ghost never sees this:** focus is **a hint the compiler resolves** into the crop the theme ships — never a field, never a binding, never a template variable — which is why it declares no behaviour module and why nothing about it degrades with JavaScript off. It is live wherever a box covers, a circle included, and load-bearing in 6 Portraits, 8 Founder, 13 Rail and on 4 Story and Team’s Band 3:1 group photograph. **On a missing photograph it is inert:** the initials block is not a crop. **10 Directory is the category’s one unsettled case** — it draws no photograph at any setting, so the control could never do anything there; it is left as found and put to the owner in the Patch notes.

**The initials block is the photograph's equal, not its apology.** The pack's **hover surface** (`#F4F0E8` in Paper light, a derived `#2A251E` in dark), the family's own shape, and **initials in the pack's heading font at 0.34 × the box height in `text-muted`**, tracked `.02em`. **The number of letters follows the source, and the two forms are not interchangeable.** In a list the site types itself it is **two initials** — the first letter of the first word and the first letter of the last word; one-word names take one letter; particles are not skipped, so “van der Meer” gives VM. **At Source Ghost authors it is one letter** — the first letter of the name, so “Jane Doe” gives J — because Ghost cannot split a name on the versions we support, so two initials are unreachable for anything Ghost supplies and the theme will not guess a surname out of a string. **The two forms are never mixed inside one component.** **Nothing else about the block changes with the source**: same box, same fill, same size, same position, same 0.34 × ratio, and a row mixing photographs with one-letter blocks is as ordinary as one mixing photographs with two. **Refused: a silhouette icon, a generated illustration, a hashed hue per person, an empty box, and the site's own logo in the hole.** **A row that mixes photographs and initials is the ordinary case and nothing marks the difference** — same box, same size, same position in the card. **Flagged**.

**`role` is 48 characters and wraps rather than truncating. `bio` is 240 in a card, 400 in a full-width row, and the section's `body` carries 900 for one person in 8 Founder.** **A person with neither is drawn as a name alone** — no “Team member”, no dash, no reserved line, no italic “Bio to come”. **The row's height comes from its tallest card and a short card sits at the top of its cell**, never stretched and never vertically centred against its neighbours — amended once, by 2 Cards, which stretches a card to its row's height because a card has a visible edge. **Ghost has no role field**: at Source Ghost the role line is empty unless the site authors one, and the theme does not press `location` or `website` into service as one. **Reconciled: “unless the site authors one” now has a mechanism** — the repeater’s Ghost card carries **one editable field per row, a Role override stored in the theme against the author’s slug**. Image focus is stored the same way, because a Ghost file cannot be re-cropped from here. **Ghost's bio has no length limit, so an over-length Ghost bio is clamped by line rather than by character** — three lines in a card, four in a row, six in 8 Founder — with no ellipsis and no “more” link. **Flagged**, every limit and every clamp.

**Count is a per-row count, never a total** — Three 416 · Four 306 · Five 240 on a 24 px gutter across 1,296, A10's divisions inherited a third time; **Six 196 and Eight 141 are offered in 9 Faces alone**. **Count per row is a named set of drawn layouts and not a number picker** — the one carve-out to the rule that an item count is a number you type. At Three the photograph is large and a job title has room to wrap; at Five it is small and a long title wraps twice; those are the only widths any frame here has been drawn and checked at, against a long role and a wrapping name. Six across would give 196 px photographs, which is the size the wall-of-faces design uses precisely **because** it draws no roles, and a typed number would let an editor choose a width nobody has looked at. **How many people to show is a separate control and stays a number picker** — the Ghost `Limit` stepper, 1 to the design's ceiling. The total is whatever the site authored, **one to twenty-four**, and 24 is reached in 9 Faces and 10 Directory only. **The short last row keeps the cell width and is left-aligned in every design in A12** — a category-wide departure from A11, where centring was the default in four designs, and the reason is that these cells are people: one person centred under a full row reads as a rank the site did not author. Stretching the last row is refused, because a wider cell is a bigger photograph. **Rebalancing rows, hiding the orphan and re-sorting the list are all refused**; the editor's counter names the counts that divide. **A team of one is drawn as one cell at the count's width and every grid design advises 8 Founder in the panel; a team of two is drawn as two cells at the count's width.** **Flagged**, and A12's headline settlement.

**The name is the link. Never the card, never the photograph.** A card-sized target would make the whole person clickable, and a person is not a call to action. Authored: `url`, one per person, optional. From Ghost: the author's own page, **and only when the site's routes actually publish author pages** — where they are off, the name is plain text and nothing is generated. **A row where some names link and some do not is ordinary** and the panel says how many. Resting shows no underline and no glyph; hover is a 2 px accent underline at a 3 px offset, 160 ms; focus is A6's ring on the name's box. **Refused everywhere in A12 until this pass: a row of social icons, an email or `mailto:`, a “read more” chevron, an external-link glyph, a generated label like “Read their posts”, and a second link per person.** **Reconciled: the icon row is the one refusal lifted**, behind a per-design control — **Socials: Off (default) · Shown** — drawn as up to four bare 28 px Icon Picker slots on a 6 px gap, 44 px at ≤ 767, glyphs from the Social / Brands group, each link named by the catalog string “{name} on {platform}” with `rel="me"` and an `aria-hidden` glyph. **The old reason is answered rather than overruled**: Ghost stored two handles and a row of two icons implied a set the platform did not have — **on ≥ 6.36 it has nine**, and the row is version-gated on that. **Twelve designs carry it; 9 Faces, 10 Directory and 11 Slim refuse it, each with its reason.** The other five refusals stand, and there is still no second link per person. Two designs vary the target and each says so: **9 Faces at Names None** moves the link to the photograph, and **11 Slim keeps `url` and never draws it.** **Flagged**.

**Order.** Authored: the repeater's order, and nothing re-sorts it — in a masthead the order is often the hierarchy. From Ghost: the API's **Order: Name A–Z · Most posts, set here in the Data group** — the old sentence, “the API’s default author order, which the site changes in Ghost rather than here”, is **deleted as false**: Ghost Admin has no author reorder. **No section-level sort control in any design, and no drag-to-reorder of a Ghost list** — those stand. What alphabetical order and sort-by-posts now have is **the Ghost Order row**, and, for an authored list, **a one-shot Sort A–Z at the repeater’s head in 9 Faces and 10 Directory** — the two designs that reach twenty-four. It is an edit rather than a control: undoable, storing nothing on the section, absent at Source Ghost authors, and sorting on `name` as typed. **15 Groups is the one design that regroups**, and it groups by an authored field rather than sorting.

**Space.** **Reconciled: this is the universal Vertical spacing control**, outside every design’s list, and every per-design Padding row is retired into it. Compact 64 · Comfortable 96 · Spacious 132, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. **Two designs carry their own vertical scale:** 7 Contrast Band's band at 44 · 64 · 88 (A4·9's) and 11 Slim's at 32 · 44 · 56 (A7·8's, which does not step with width). **Row gaps:** 40 between rows of people in the grid designs, **24 in 2 Cards**, **32 between full-width rows in 3 Rows**, 48 in 6 Portraits, **56 between blocks in 15 Groups**.

**Head.** Eyebrow 13 px uppercase tracked `.08em` muted, 10 px above the title; title on a 780 measure; sub 17 px muted on 620, 12 px below; **head to people 48**; note 32 under the block on 620; link 20 under the note. **Title ladder: Small 28 · Medium 34 in twelve designs, Large 40 in 5 Split Head and 12 Big Type, Display 48 in 12 Big Type only**, whose 1,040 measure and 64 px head gap are A11·15's two exceptions carried over.

**Responsive floor.** Five → four at 1080 → three at 834 → **two at ≤ 767 where the card is a photograph, a name and a role; one at ≤ 767 where a bio is drawn.** The collapse follows the card's content rather than the design's identity, which is A12's one departure from A11's flat “never one across”. Three designs depart further and each says so: **9 Faces keeps three across on a phone**, **10 Directory goes to one column at every setting** because it has no photograph, and **6 Portraits always ends at one**. Six designs collapse a second axis: 4 Story and Team's story stacks at 1080 · 5 Split Head's head column goes above at 1080 · 15 Groups' label leaves its column at 1080 · 8 Founder's halves stack at 1080 · 13 Rail drops its arrows at 767 · 14 Reveal forces its bio under the row at 767. **Flagged**.

**Behaviour: two designs have one, thirteen have none.** **13 Rail** is scrolled by the reader — A11·9's rail, verbatim, including the measured precondition, the fades, the arrow placements and the `role="group"`. **14 Reveal** opens a bio on a `<button aria-expanded>`, 160 ms, **independently per card — one-at-a-time is refused**. **Nothing auto-advances anywhere in A12**, there is no carousel, no timer and no scroll trigger, and **behaviours do not run while editing**: every design's resting state is its primary frame. Reduced motion keeps every threshold and drops the animation.

**Dark mode.** The ground deepens, the initials block lifts to a derived `#2A251E`, hairlines take `#332E27`, and **the photographs are untouched** — no plate, no second upload, no filter. **A12 has no equivalent of A11's dark plate**, and it does not need one: a photograph carries its own ground.

**The accent is spent in two places in this whole category**: the section link's underline, and a name link's hover underline and focus ring. With no section link and no person URLs authored, **thirteen of the fifteen contain no accent pixel** — **13 Rail** and **14 Reveal** are the exceptions, because an arrow and a disclosure are controls.

**Print.** Every design prints as drawn except two: **13 Rail prints as a wrapped grid at three across**, because a page has no viewport to scroll, and **14 Reveal prints every bio open**. Print is the light mode; 7 Contrast Band drops its band and prints on the page's own ground — it stays 7 Contrast Band without its band rather than printing as another design.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the people a `<ul>` of `<li>`; name and role as `<p>`s, never headings; a photograph an `<img alt="">` with the initials block `aria-hidden`; a linked name an `<a>` around the name text. **Three designs depart: 8 Founder has no list at all, 11 Slim has no accessible name at any setting, and 15 Groups has an `<h3>` per group** — the one second heading level in A12. **9 Faces at Names None is the one place a person's photograph carries alt text.** **13 Rail generates the category's only string** — “Team, scrollable” — **reconciled: it is a theme translation-catalog string rather than a generated one, as are “Scroll left” and “Scroll right”, so A12 has three catalog strings and none composed at runtime** — and 14 Reveal avoids needing a fourth by naming its buttons with `aria-labelledby` on the person’s own name. The socials row adds one catalog *pattern*, “{name} on {platform}”, whose two values are content.

**The shared field list — sixteen fields, `socials[]` added this pass.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `body` rich opt ≤ 900 · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 24 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 60. In `people[]`, one to twenty-four: `name` text **req** ≤ 48 · `role` text opt ≤ 48 · `bio` text opt ≤ 240 · `photo` image opt · `url` url opt · `group` text opt ≤ 24 · **`socials[]` list opt, zero to four, each an Icon Picker slot from Social / Brands plus a URL** — drawn by the twelve designs that offer Socials, stored and never drawn by 9 Faces, 10 Directory and 11 Slim. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. **Four fields are read by one design each and kept by the other fourteen:** `image` and `imageAlt` by 4 Story and Team, `group` by 15 Groups; `body` is read by three — 4 Story and Team, 5 Split Head and 8 Founder. **`name` is the only field that cannot be empty**, and **there is no `photoAlt` field at all**. **Flagged**: every limit, the twenty-four ceiling, and `group` existing as a per-person field rather than as a repeater of groups.

**The item list is the P0·3 item list, and the Ghost card is an extension of it.** At Source Ghost authors there is no Add person, no drag handle and no Remove; name, photograph and bio are read-only and answer “Edit in Ghost”; **one field stays editable per row — the Role override** — which is a thing P0·3’s Ghost-sourced card did not anticipate, and it is recorded as an extension of the primitive rather than a redesign of it. **Where it lives, and the rules that hold in all fifteen.** The repeater sits in the sidebar below the design's own controls: one row per person showing a 32 px circle of the photograph — or that person's initials where there is none, the same first-class state the canvas draws — with `name` as the row's label, `role` in muted beside it where authored, a drag handle, a remove action, and **Add person** at the end. **The name is the row's identity, not the thumbnail** — the opposite of A11, where `alt` was the only text an item had. Selecting a person on the canvas selects their row and opens that item's fields; ⌥↑ / ⌥↓ moves the focused row.

**A12 has one repeater and it is `people[]`.** There is no `images[]` and no `values[]` in this category: `image` and `imageAlt` are single section fields read by 4 Story and Team alone, and no design draws a list of values. Every item rule below is a rule about `people[]`, whose item is `{name, role, bio, photo, url, group}`.

**Add produces a publishable person, and A12 is the first category where that is true.** `name` is the only required field and it is text rather than a file, so nothing has to be invented and nothing is held back: a new item arrives with `name` seeded **“New person”** and every other field empty — no role, no bio, no photograph, no URL. It therefore draws immediately as **the initials block NP above a name alone**, which are the two hard cases already on every frame in the category, and the file picker opens on the empty `photo`. It lands **last**. *Flagged: the seeded string and publishing the new item straight away are mine — A11's equivalent was an editor-only placeholder tile, because there the required field was an upload.*

**Remove is never disabled, and a design below its designed count draws what is left rather than blocking the edit.** The list is the user's, and what to draw at two people is the theme's problem — so a design below its designed count **draws what exists and its panel advises the design that suits the count**, which is **1 Grid in ten cases and 8 Founder at a team of one in every grid design**. The advice is a line of text in the panel and nothing else: **no design in A12 turns into another design at any count, any width or any empty field.** Removing the last item empties the list, at which point **the section does not render — except 4 Story and Team**, which draws its story and photograph alone. *Flagged: the draw-what-is-left-instead-of-block rule is A11's, carried here unchanged.*

**A value another control switches off is greyed, with the reason beside it.** Never hidden, and never left accepting a value it will not honour: the reason is a short sentence at the control rather than a tooltip. A12 has five cases and no others — **Title size at head None**, **Large 96 at Count Five** in 1 Grid and in 14 Reveal, **Medium 72 at Count Eight** in 9 Faces, **Spaced above sixteen people** in 11 Slim, and **Bio opens: In the card at Count Five and at ≤ 767** in 14 Reveal, where the forced value is drawn and the value it displaces is greyed rather than silently ignored. A value a design does not offer at all is a different thing and stays absent from the panel with the panel saying why — 2 Cards' Count Five, 13 Rail's Landscape crop, 15 Groups' Large 96. **Remove is the reference case in the other direction and never greys.**

**Reorder is meaningful in all fifteen, and in A12 it is meaningful by default rather than by exception** — in a masthead the order is the hierarchy, nothing re-sorts, and there is no alphabetical control, no sort-by-posts and no drag-to-reorder of a Ghost list. **It decides more than order in six designs:** 8 Founder, where **the first item is the founder** and there is no featured flag · 12 Big Type, where the first three or four items *are* the section and the rest are held · 15 Groups, where the position of a group's first member decides the block order · 11 Slim, where the first face is the one on top · 14 Reveal at Bio opens Under the row, where open bios stack in authored order · 10 Directory, where a column-major fill moves the column break for everything after the moved row.

**Counts.** The field's range is **one to twenty-four**, and **one is a real count in A12 rather than a failure**, because 8 Founder is a design. Twenty-four is reached in 9 Faces and 10 Directory only; Add person is disabled there with “Twenty-four people is the most a section holds.” Every design states its designed range, and outside it there are two answers in the whole category and no others: **draw what exists · draw the first N and hold the rest** — with the panel free to advise a design that suits the count, which is advice and never a switch. **Nothing is padded, stretched, repeated, re-sorted or hidden to make a count come out even** — a wider cell is a bigger photograph, and one person drawn larger than the rest is a rank the site did not author. *Flagged: the twenty-four message is mine.*

**Zero people** is answered once and the same way everywhere: **the section does not render** — no head on its own, no band, no empty cell, no placeholder face, no silhouette — with **4 Story and Team the one exception**, where the story and the group photograph are the section and the list is optional. The editor shows the empty repeater and its Add person control.

**Inside an item the user edits content only:** `name`, `role`, `bio`, `photo`, `url`, `socials[]`, and `group` where 15 Groups reads it — **plus Image focus on the photograph, which is content by the same rule** and not a design control. **Nothing about an item's size, crop, spacing, alignment, emphasis or ground is exposed anywhere in A12** — Photo size, Crop, Count per row, Card padding, Bio measure, the two photo families and the initials block's fill are section values that every item reads. So **“draw her photograph larger”, “square this one portrait” and “start this bio open” are not expressible by construction.** A12 ships the designs those controls would have been, which is the answer the category gives instead: **8 Founder is one person given the whole section**, **12 Big Type is a row of three or four drawn from a longer list**, **6 Portraits is the whole section at portrait scale**, and **15 Groups is a per-person field that is content rather than styling**. **Four per-item controls are refused in writing:** a per-person photo size (the ladder, in all fifteen), a per-person crop (6 Portraits and 13 Rail), a per-person featured flag (8 Founder and 12 Big Type), and a per-person open state (14 Reveal, where Start First open is positional).

**The optional fields inside an item, and what empty looks like.** **`name` is required — an item with no name cannot be saved**, the one required field in A12 and the only required field in any category so far that is text rather than a file. **`photo` empty is the category's headline emptiness and the initials block is the answer** — two initials in a list the site types itself, one letter at Source Ghost authors, first-class and unmarked: same box, same size, same position, and a row mixing photographs with initials is the ordinary case. **`role` empty draws the name alone** — nothing reserved, nothing generated — and **at Source Ghost that is every person**, since Ghost stores no role. **`bio` empty draws a shorter card that stays shorter**, except in 2 Cards where the card keeps its row's height and the space falls at its foot, and in 14 Reveal where the person has no button and the tab order skips them. **`url` empty is invisible**: plain text, and the resting state gives no sign either way — the cost all fifteen disclose. **`group` empty lands the person in 15 Groups' unlabelled final block**, counted in the panel, and is stored and never read by the other fourteen.

**Editing, stated once for the category.** Every visible string edits inline on canvas with the **P0·1** toolbar — bold · italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow · noreferrer · sponsored**: `eyebrow`, `title`, `sub`, `note` and `linkLabel`; **a person’s `name`, `role` and `bio` where they are drawn**; **11 Slim’s sentence**, which is `title` at 15 px; **15 Groups’ labels, where one edit renames every member of that block and the editor says how many people it changed**; and **the `body` prose in 4 Story and Team, 5 Split Head and 8 Founder**, as prose on canvas rather than in a sidebar field, with the toolbar’s five marks and nothing else — no headings, lists or images inside it. Every URL opens the Ghost-aware **Link Picker**, and the section link takes an optional **P0·2** icon before or after its label, off by default. **Ghost-owned content is never inline-editable**: at Source Ghost authors a name and a bio show the plain-text lock pill and clicking says “Edit in Ghost”, while the Role override stays ours and stays inline. **Two strings are edited in the item row rather than on canvas**, because neither is drawn: a person’s `name` at 9 Faces’ Names None, and `socials[]` URLs. **Nothing in A12 has ever carried a “Preview” control**, so ground rule 7 removes nothing here — the P0·6 state switcher was always the answer for 13 Rail and 14 Reveal, and 14 Reveal’s editor draws every bio panel open while the section is selected rather than offering a preview of them.

**Member Visibility lands nowhere in A12 and is recorded rather than added.** The category bears no call to action: its one link is a text link at the section-link treatment, 11 Slim draws no name at all, and the socials row is a row of the person’s own links. If the architect wants the control universal rather than CTA-scoped, all fifteen gain it at once. *Flagged.*

**Content.** Orbit Weekly throughout, twelve people in one order in every frame: Okonjo · Reith · Raghunathan · Lindqvist · Ferreira · Alder · Câmara · Osgood · Vance · Watanabe · Boivin · Adeyemi. **Three carry the category's awkward cases in every frame:** Rosa Ferreira has no photograph and draws the initials block, Henry Osgood has neither a role nor a bio and draws as a name alone, and Priya Raghunathan's 42-character role wraps. **Four names link and eight do not.** Head: eyebrow **The masthead**, title **“Twelve people make the Thursday letter”**, sub, `body`, note **“Roles as of March. Freelance contributors are credited on their own posts.”**, link **“Write for Orbit Weekly”**. **Flagged: every name, role, bio, string, date and number is invented for this library, and no frame in A12 contains a drawn face** — photographs are striped placeholders with a mono caption naming the crop.

---

## 1 · Grid

Three to twelve people, photo above name and role, three to five across. The default — what a site gets when it types “team” — and **the design ten others advise in the panel**.

**Descriptor.** The category's floor — a circle above a name and a role in equal cells, with no container, no bio, no second size and no behaviour: the arrangement ten other designs advise rather than inventing one of their own.

**Structural descriptor.** `grid-of-N · none · page · many · top · grid of equal cells`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Nothing here is script: the cells, the photo ladder, the initials block, the name link's hover underline and A6's focus ring are stylesheet, and the roster is server-rendered. **JS off:** identical in every particular — there is no JS-conditional CSS to fall out of, which is what `core` being assumed rather than declared means in this category.

**Items** · `people[]`, three to twelve; **every other design's item rules are stated against this one.**

- **Add.** *Add person* at the foot of the repeater; lands last; seeded name and nothing else, as the shared floor says. Count is a per-row count, so a new person extends the short last row or starts a new one, **and nothing is ever held back here** — this design draws every authored person.
- **Remove.** Never disabled. Down to two → two cells at the count's width; **down to one → drawn as one, 8 Founder advised in the panel**, named in the panel before the edit; removing the last empties the list and the section does not render.
- **Reorder.** Meaningful. Authored order is drawn order and nothing re-sorts, so the only thing a move changes is which person lands on the short last row — which is why the editor's counter names the counts that divide.
- **Counts.** **Three to twelve, all drawn**, at three, four or five per row. Two draws two cells; one is drawn as one cell with 8 Founder advised in the panel; **over twelve → the rows keep wrapping, 9 Faces advised in the panel**, which drops the roles and says so.
- **Zero.** The section does not render; the repeater shows Add person and a line saying so.
- **Inside an item.** `name` required, `role`, `photo`, `url`; `bio` and `group` stored and never drawn. **Photo size, Count and Cells are section values, so a person cannot be singled out** — the rule's clearest case in A12, because there is nothing else in this design for a control to attach to.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; three to twelve people reading `name`, `role`, `photo`, `url`. `bio`, `group`, `body`, `image`, `imageAlt` kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · Flush left · None |
| Title size | Small 28 · Medium 34 — **greyed at head None, with the reason beside it** |
| Photo size | Small 56 · Medium 72 · Large 96 — **Large greyed at Count Five, with the reason beside it** |
| Count per row | Three · Four · Five |
| Cells | Flush left · Centred |
| Socials | Off · Shown |
| Background role (universal) | Background · Surface · Contrast — Contrast is available here and brings 7 Contrast Band’s derived values with it, no second upload needed |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 12 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. In Ghost mode a name links to the author page **only where the site’s routes publish author pages**, and nothing is generated where they do not.

**Editing** · `eyebrow`, `title`, `sub`, `note` and `linkLabel` edit inline on canvas with the **P0·1** toolbar — bold · italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow · noreferrer · sponsored**; **per person, `name` and `role` edit inline in the cell** — no bio is drawn here. `linkUrl` and every person’s `url` open the Ghost-aware **Link Picker**, and the section link takes an optional **P0·2** icon before or after its label, off by default. **At Source Ghost authors `name` and `bio` are Ghost-owned**: the toolbar is replaced by the plain-text lock pill and clicking says “Edit in Ghost”, while **the Role override is ours and stays inline**. `socials[]` URLs are edited in the item row, because a bare icon has no text to select. **This statement is the category’s, and the fourteen sections below state only what they add to it.**

**Arrangement** · cells 416 · 306 · 240 on a 24 px gutter across 1,296; rows 40 apart; photo to name 14, name to role 4; name 17/600 rising to 20 at Large 96. **Every card sits at the top of its cell and is never stretched.**

**Responsive** · every count becomes three across at 834 and two at ≤ 767, **and this design never goes to one**, because it draws no bio. At 834 cells 234 on 26; at ≤ 767 cells 163 on 24, row gap 28.

**Empty** · no photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors. No role → the name alone. One person → drawn as one, 8 Founder advised in the panel; two → two cells at the count's width; over twelve → the rows keep wrapping, 9 Faces advised in the panel. No people → the section does not render. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · one `<ul>`, name and role as two `<p>`s, `alt=""`, one tab stop per linked name plus the section link. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · the three-to-twelve range; the 40 px row gap and 14 px photo gap; disabling Large 96 at Count Five; drawing every authored person rather than the first N; the last row keeping its width at the left.

---

## 2 · Cards

One person per card on a plane with a hairline. **The only design in A12 with a card**, and the design for a team with bios.

**Descriptor.** The only design where a person gets a plane of their own — a fill, a hairline and the pack radius around each card, equalised to its row's height — and therefore the only one where a short card is stretched rather than left short.

**Structural descriptor.** `grid-of-N · none · page · many · top · one card per person`

**Archetype.** grid-of-N

**Behaviour module.** **none**, and this is the design most likely to be assumed to have one. **The equal heights are a CSS grid row track, not a measurement**: every card in a row shares the row's height, which is exactly what makes the equalisation per row and not per section. The card's fill, hairline and radius are stylesheet and there is no link on the card to handle. **JS off:** identical.

**Items** · `people[]`, three to twelve, one card each.

- **Add.** Lands last. A new card holds the seeded name and **is drawn at its row's height straight away**, so the empty space at its foot is where the settlement-2 amendment is visible in the editor rather than in a stress frame.
- **Remove.** Never disabled, and it has a second effect here: a card leaving a row re-equalises that row, so **removing one person can shorten its neighbours.** One → drawn as one, 8 Founder advised in the panel; zero → the section does not render.
- **Reorder.** Meaningful twice over — order, and **height**: cards equalise per row, so moving the longest bio into another row moves that height with it.
- **Counts.** **Three to twelve** at Three or Four per row; Count Five is not offered and the measure is the reason. **Over twelve → the rows keep wrapping, 1 Grid advised in the panel**, which drops the bios and says so.
- **Zero.** The section does not render.
- **Inside an item.** `name`, `role`, `bio` ≤ 240, `photo`, `url`; `group` stored. **Card padding, Cards fill and Photo size are section values**: a card cannot be given its own padding, its own fill or its own height, and there is no per-card hover, lift or link.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · 1 Grid's, plus `bio` ≤ 240.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · Flush left · None |
| Card padding | Compact 24 · Comfortable 32 · Spacious 40 |
| Count per row | Three · Four |
| Photo size | Small 56 · Medium 72 |
| Cards | Surface · Ground |
| Bios | Shown · Hidden |
| Socials | Off · Shown |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Seven controls of its own, plus the universal trio and the Data group. **Card padding keeps its own row**, because it measures the card rather than the section.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 12 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **Bios Hidden is the only way to remove a Ghost bio**: it arrives with the author record and deleting it there is not an option, and the card keeps its plane and re-equalises without it.

**Not offered** · Title size, fixed at Medium 34; Count Five; Large 96; a shadow; a hover lift or scale; a link on the card.

**Editing** · head strings and `linkLabel` as 1 Grid; **per person, `name`, `role` and the ≤ 240 `bio` edit inline in the card**. At **Bios Hidden** the bio is not on canvas at all and is edited in the item row — the control hides it and never deletes it, which is the whole of the difference between Hidden and an empty field.

**Arrangement** · 1 Grid's cells at 416 or 306 with a card at each; surface or ground fill, 1 px `border`, pack radius, no shadow; **rows 24 apart**, because two hairlines 40 apart read as a gap in a table; role to bio 14; **equal heights per row, the space falling at a short card's foot.**

**Responsive** · both counts become two across at 834 and one at ≤ 767 — two rather than three at 834 is this design's stated departure, and the measure is the reason.

**Empty** · no bio → a photograph, a name and a role at its row's height. No photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors. Over twelve → the rows keep wrapping, 1 Grid advised in the panel, which drops the bios and says so. At Bios Hidden a card is a photograph, a name and a role at its row’s height. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · the card a presentational `<div>` — no role, no label, no `tabindex`, never `<figure>` or `<article>`; contrast measured against the card's fill; forced colours keep the border and lose the fill. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · **stretching a short card to its row's height, the amendment to settlement 2**; the 24 px row gap; the padding scale; the three-line Ghost clamp; refusing Count Five, Large 96, a shadow, a lift and a card link; per-row rather than per-section equalisation.

---

## 3 · Rows

Full-width rows: photograph at the left, name, role and the longest bio in the category at the right. **`bio` ≤ 400 here, and nowhere else.**

**Descriptor.** The only design that gives a person a full-width row — photograph at the left, the category's longest bio on an 824 measure with the remaining 344 left deliberately empty — and the only one whose collapse depends on the photo size rather than on the width alone.

**Structural descriptor.** `stack · none · page · many · left · full-width row per person`

**Archetype.** stack

**Behaviour module.** **none.** The rule is a `border-top` and never an `<hr>`, Meta at the right is a flex row with no DOM reorder, and the forcing of Meta under the name at 1080 and the photo-size-dependent break at ≤ 767 are media queries. **JS off:** identical at every width.

**Items** · `people[]`, three to twelve, one full-width row each.

- **Add.** Lands last, at the foot of the stack; the section grows by one row plus its 32 px gap, and **the panel states the section's height rather than capping the count** — the rule this design already carries, restated against the list.
- **Remove.** Never disabled; the rows close up and the rule redraws in the new gaps. One → drawn as one, 8 Founder advised in the panel; zero → the section does not render.
- **Reorder.** Meaningful, and **this is the design where order reads most like a ranking** — twelve full-width rows are a masthead in sequence. Stated rather than corrected: nothing re-sorts, and there is no control that would.
- **Counts.** **Three to twelve.** Over twelve → the rows keep wrapping, 1 Grid advised in the panel, which drops the 400-character bios to nothing and says so.
- **Zero.** The section does not render.
- **Inside an item.** `name`, `role`, `bio` ≤ 400 — **the only place in A12 that ceiling exists** — `photo`, `url`; `group` stored. **Bio measure, Photo size, Meta and Rule are section values**: one row cannot be given a wider measure, its own rule or its meta in a different place.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · 1 Grid's, plus `bio` ≤ 400.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · Flush left · None |
| Photo size | Small 56 · Medium 72 · **Large 96, the default** |
| Bio measure | Wide 824 · Narrow 620 |
| Meta | Under the name · At the right of the row |
| Rule | None · Between |
| Bios | Shown · Hidden — at Hidden a row is a photograph, a name and a role, and the panel advises 1 Grid |
| Socials | Off · Shown |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Seven controls of its own, plus the universal trio and the Data group.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 12 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **Bios Hidden is the only way to drop a Ghost bio**, which arrives with the author record; the widest measure in A12 is also the one that clamps an unlimited Ghost bio latest, at four lines.

**Editing** · head strings and `linkLabel` as 1 Grid; **the ≤ 400 `bio` edits inline in the row — the longest inline field in A12**, on its own measure and with the toolbar’s five marks only. At **Bios Hidden** it moves to the item row and the row closes up.

**Arrangement** · 96 · 32 · 824 inside 1,296, **the remaining 344 left empty**; the photograph pinned to the top of its row; name 20/600 at Large 96; rows 32 apart with the rule in the centre of the gap at the full content width.

**Responsive** · the row holds at 834 and breaks at ≤ 767, **where the photograph goes above the text at Medium and Large and stays beside it at Small**. Meta is forced under the name at 834.

**Empty** · no bio → a shorter row. No role → nothing, and at Meta at the right the end of the line is left empty. No photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors. Over twelve → the rows keep wrapping, 1 Grid advised in the panel. The panel states the section's height rather than capping the count. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · one `<ul>`, three `<p>`s each, the rule a `border-top` and never an `<hr>`; Meta at the right changes no DOM order. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · the 824 measure and the empty 344; pinning the photograph to the top; Large 96 as the default here alone; the 400-character ceiling and the four-line clamp; Meta's 1080 destination; the photo-size-dependent collapse at ≤ 767.

---

## 4 · Story and Team

The about paragraphs and a group photograph above the team. **The design the category is named for**, and the only one that reads `image` and `imageAlt`.

**Descriptor.** The only design with prose and a group photograph of its own above the people — the one that reads `body`, `image` and `imageAlt` together — and the only section in A12 that renders with an empty `people[]`.

**Structural descriptor.** `stack · none · page · variable · top · group photograph above team`

**Archetype.** stack

**Behaviour module.** **none.** The four blocks are a flow at one repeated gap, Story Beside is a two-column flex row that stacks at 1080 in source order with no `order` property, and the photograph's named ratio is an aspect box. **JS off:** identical at every width.

**Items** · `people[]`, **zero to twelve** — the one design whose designed range includes zero.

- **Add.** Lands last in the team grid under the photograph. Adding the first person is the edit that brings the team block into existence at all; before it there is no `<ul>` in the DOM.
- **Remove.** Never disabled, and **removing every person is a valid section here**: the story and the photograph draw alone, the blocks close up, and nothing is generated in the team's place. One person draws one cell at the count's width, **and this design draws that one cell rather than advising 8 Founder**, because the story rather than the person is the section. *Flagged: the one-person drawing is mine; the drawn empty state only names the zero case.*
- **Reorder.** Meaningful inside the team, and it has no effect on the story or the photograph, which are section fields rather than items.
- **Counts.** **Zero to twelve**, four or five per row. Above twelve the rows keep wrapping and the panel advises 1 Grid, which is the same team without the story. *Flagged: the above-twelve message is mine.*
- **Zero.** **Renders** — head, story, photograph, note and link, with no list element at all. The one exception to the category's zero rule.
- **Inside an item.** `name`, `role`, `photo`, `url`; `bio` and `group` stored. **`image` and `imageAlt` are section fields and are not part of any item** — the group photograph cannot be authored per person, and a person's photograph never takes real alt text here.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · `eyebrow`, `title`, **`body` ≤ 900 and ≤ 3 paragraphs**, `image`, `imageAlt`, `note`, the link pair; up to twelve people reading `name`, `role`, `photo`, `url`. `sub`, `bio`, `group` kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · Flush left · None |
| Story | Above the photograph · Beside it |
| Photograph | Band 3:1 · Landscape 3:2 · None |
| Team count per row | Four · Five |
| Team photo size | Small 56 · Medium 72 |
| Socials | Off · Shown |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group. **Image focus is live on `image` as well as on every `photo`** — a Band 3:1 crop of a landscape group shot discards most of its height, and Top is what keeps the faces. **P0·9’s per-slot rule applies: two image slots, two Image focus controls**, one under each, never one for the whole section; the values are P0·9’s on both axes.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 12 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **The story is always authored at both sources** — nothing in Ghost holds an about paragraph, and the group photograph is a site upload.

**Not offered** · Title size; the sub; a side for the story; text over the photograph; Large 96; a bio.

**Editing** · head strings and `linkLabel` as 1 Grid; **the story edits inline as prose** — `body` ≤ 900 and ≤ 3 paragraphs, selected on canvas rather than typed into a sidebar field, with the toolbar’s five marks and **nothing else: no headings inside the story, no lists, no images**. `imageAlt` stays a sidebar field, being alt text rather than visible copy. Per person, `name` and `role` edit inline in the team card.

**Arrangement** · head, story, photograph, team, **at one 48 px gap used three times**; story on 620 at 17/1.7 in `text`; photograph at the content width at its named ratio; team cells 306 or 240, the card side by side — photograph, 16, name and role. Beside the photograph: 632 · 32 · 632, top-aligned, 4:3.

**Responsive** · Story Beside stacks at 1080; the team goes three across at 834 and one across at ≤ 767; the photograph keeps its ratio at every width.

**Empty** · no group photograph → the blocks close up. **A person with no photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors.** No story → the story block is hidden and the remaining blocks close up, 1 Grid advised in the panel. **No people → the story and photograph draw alone, the one design in A12 that renders with an empty `people[]`.** No `imageAlt` → `alt=""`, never a generated string. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · **the group photograph is the one image in A12 with real alt text**, a bare `<img>` and not a `<figure>`; every person's photograph stays `alt=""`. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · the four-block order and the repeated 48; the 900-character and three-paragraph limits; Band 3:1 as the default and 4:3 beside the story; the story always at the left; rendering with no people at all.

---

## 5 · Split Head

Head and story in a 416 column, the people in the 824 beside it. A8·6's split, and **the design for a long sub**.

**Descriptor.** The only design that sets the head, the story and the foot in a 416 column beside the people rather than above them, and the only one that offers Count Two — where the person card turns side by side instead of stacked.

**Structural descriptor.** `split · none · page · many · right · head column beside people`

**Archetype.** split

**Behaviour module.** **none.** Both column sides and the 1080 reorder — head above, foot below — are media queries on a flex row with real DOM order and no `order` property; the head is never sticky, which is the one control this design refuses that would have needed a module (`sticky` behaviour is `scroll-spy`'s neighbourhood, and neither is declared). **JS off:** identical at every width.

**Items** · `people[]`, three to twelve, inside the 824 block.

- **Add.** Lands last inside the block. **At Count Two a new person adds a row of one**, which is the count where the short last row is most visible — 400 px of empty beside a single card.
- **Remove.** Never disabled; one → drawn as one, 8 Founder advised in the panel; zero → the section does not render. Removing people shortens the right column and **the head column is unaffected**, so a short list leaves the story taller than the people it introduces.
- **Reorder.** Meaningful; nothing re-sorts, and the first person sits level with the top of the title because both columns are top-aligned.
- **Counts.** **Three to twelve** at Two, Three or Four per row. Over twelve → the rows keep wrapping, 1 Grid advised in the panel, which has the full width for them. *Flagged: the above-twelve message is mine.*
- **Zero.** The section does not render — the head column alone is not a section.
- **Inside an item.** `name`, `role`, `photo`, `url`; `bio` and `group` stored. **`body` is a section field in the head column and is not a per-person bio** — the distinction this design exists on. Count, Photo size and Foot are section values.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · every section field except `image` and `imageAlt`, including `body` ≤ 900; three to twelve people. `title` required in practice.

**Controls.**

| Control | Values |
|---|---|
| Head column | Left · Right |
| Title size | Medium 34 · Large 40 |
| Count per row | Two · Three · Four |
| Photo size | Small 56 · Medium 72 |
| Foot | In the head column · Under the people |
| Socials | Off · Shown |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 12 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **The story in the head column is always authored**, and it edits inline as prose with the P0·1 toolbar at 16/1.7 on a 416 measure.

**Not offered** · head alignment; Head None; Display 48; Large 96; a sticky head; a rule between the columns.

**Editing** · head strings and `linkLabel` as 1 Grid; **the `body` in the 416 column edits inline as prose**, at the same limits and the same allowed marks as 4 Story and Team’s story. Per person, `name`, `role` and the bio where drawn edit inline in the cell.

**Arrangement** · **416 · 56 · 824 = 1,296**, both columns top-aligned; cells 400 at two, **258 on a 25 px gutter at three**, 188 at four; the column's own rhythm 24; story 16/1.7. At Count Two the card is side by side; at three and four it is stacked.

**Responsive** · at 1080 the head column goes above the people and the foot moves under them at both Foot values; the people then take 1 Grid's grid.

**Empty** · no title → the head column draws without one and the section has no accessible name, 1 Grid advised in the panel. No story → the column is a head and a foot. No photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors. One person → drawn as one, 8 Founder advised in the panel. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · two `<div>`s, neither a landmark; both reorders done in the source with no `order` property; **at an empty title this design has no accessible name** — there is no `<h2>` for `aria-labelledby` to point at, and the panel advises supplying a title, or 1 Grid, which puts the title above the people. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · the 16 px story on a 416 column; the 24 px rhythm; the foot's 1080 destination; the side-by-side card at Count Two; Large 40 offered here; the advice given with no title.

---

## 6 · Portraits

Two or three editorial portraits at a named crop, the name under the image or set over it. **The one design in A12 with a scrim.**

**Descriptor.** The only design that draws a person at editorial scale — two or three named crops filling their cells, with the category's one scrim under an overlaid caption — and the only one that ends at a single column on a phone.

**Structural descriptor.** `grid-of-N · none · page · few · top · scrim under overlaid caption`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The scrim is a three-stop gradient, Caption Overlaid is absolute positioning with the name and role in the same DOM position as at Caption Under, and the forced-colours fallback that drops the scrim and returns the caption is a media query. **JS off:** identical, scrim included.

**Items** · `people[]`, two or three, one crop each.

- **Add.** Lands last, completing the row at three. **A fourth person does not break the section, it changes the design**: the panel reads “4 people — 1 Grid draws all four” before the add, in 1 Grid's own wording.
- **Remove.** Never disabled. Three → two draws two 632 cells at the same crop, which is the widest photograph in A12; two → one is drawn as one cell with 8 Founder advised in the panel; zero → the section does not render.
- **Reorder.** Meaningful, and **the strongest ordering signal in the category** — two or three portraits at this scale read as a masthead, and nothing softens that.
- **Counts.** **Two or three, and the design is designed for exactly those.** Over three → the cells keep wrapping at three across, 1 Grid advised; one → drawn as one, 8 Founder advised in the panel.
- **Zero.** The section does not render; no empty crop is drawn.
- **Inside an item.** `name`, `role`, `photo`, `url`; `bio` and `group` stored. **Crop, Caption and Name size are section values, and this is the design where a per-item control is asked for most** — one landscape photograph among portraits. It is refused: the crop is one named ratio for every cell and a per-person ratio is still refused — **but Image focus is now a field on the image**, moving the crop inside that ratio on either of P0·9’s axes, and the old answer, **a different upload cropped to the section's ratio.** A person with no photograph draws the initials block at the cell's full size, its caption staying under the block even at Caption Overlaid.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · 1 Grid's, two or three people. Crop family.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · Flush left · None |
| Count | Two · Three |
| Crop | Portrait 4:5 · Square 1:1 |
| Caption | Under the image · Overlaid |
| Name size | Medium 20 · Large 27 |
| Socials | Off · Shown — under the caption at both Caption values, because a link target does not go on the scrim |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group. **Image focus is a field on the image** — P0·9’s shared control, both axes, values not restated here — in the Image Picker’s popover: this is the design it was adopted for.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 3 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. A Ghost `profile_image` is often 400 px square and a 632 × 790 cell upscales it — the editor warns and draws it, the one place the Ghost source is visibly weaker than an upload.

**Not offered** · Title size; Landscape 3:2; a bio; a border, shadow or filter; a hover on the image.

**Editing** · head strings and `linkLabel` as 1 Grid; **`name` and `role` edit inline in the caption at both Caption values**, and **at Overlaid the toolbar sits above the caption on the scrim** while the text keeps its carried colour as it is edited — the one place in A12 where the toolbar draws over an image.

**Arrangement** · cells 416 on 24 at three, **632 on a 32 px gutter at two**; the crop fills the cell's width; image to name 16, name to role 6; **the scrim `contrast` at 72 / 42 / 0% over the bottom 45%**, the caption in the carried colour.

**Responsive** · three across holds at 834 and both counts go to one at ≤ 767 — **the one design in A12 that always ends at one**; both name sizes draw 20 there.

**Empty** · no photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors at the cell's full size, **its caption staying under the block even at Caption Overlaid**, with the unequal cell heights that follow. Four or more → the cells keep wrapping at three across, 1 Grid advised in the panel; one → drawn as one, 8 Founder advised in the panel. Forced colours drop the scrim and return the caption. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · name and role in the same DOM position at both Caption values; never `<figure>`/`<figcaption>`; overlaid contrast measured against the scrim. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · the three-person ceiling; the initials rule for a crop — 0.34 × the shorter edge, capped at 96; the scrim's three stops and 45% height; Name Large 27; the forced-colours fallback.

---

## 7 · Contrast Band

1 Grid inverted onto the `contrast` token, at the band's own vertical scale. **No extra upload of any kind is needed for the band — the finding this design exists to state.**

**Descriptor.** The only design on the `contrast` token — 1 Grid's exact wall at the band's own vertical scale, separated from it by ground alone — and the only one in A12 where the accent is disabled with its ratio shown.

**Structural descriptor.** `grid-of-N · none · contrast · many · top · inverted ground, no uploads`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The band is a `background-color` on the section and the derived muted, initials fill and hairline are CSS mixes of one token pair; **the photographs are untouched, which is why no second upload exists** — the finding this design carries needs no script to hold. **JS off:** identical, and print and forced colours drop the band and draw 1 Grid with or without script either way.

**Items** · `people[]`, three to twelve, on the band. **Identical to 1 Grid's in every particular, which is the point of the pair.**

- **Add · Remove · Reorder · Counts · Zero.** As 1 Grid, without exception: lands last, never disabled, authored order, three to twelve drawn, one → drawn as one, 8 Founder advised in the panel, over twelve → the rows keep wrapping, 9 Faces advised in the panel, zero → the section does not render.
- **The one difference the band makes to the list.** At Band Inset the cells are 274 or 214 rather than 306 or 240, so **the same list draws smaller inside the 1,168** — a section value, not an item one.
- **Inside an item.** 1 Grid's fields exactly. **The initials block takes the derived 10% fill rather than the pack's hover surface**, and that is a section value every item reads; a person cannot opt out of the band or carry a plate, because a photograph carries its own ground.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · 1 Grid's exactly.

**Controls.**

| Control | Values |
|---|---|
| Band width | Full bleed · Inset |
| Head | Centred · Flush left · None |
| Count per row | Three · Four · Five |
| Photo size | Small 56 · Medium 72 |
| Cells | Flush left · Centred |
| Socials | Off · Shown |
| Background role (universal) | **Contrast (locked)**, with the reason shown — the one lock in A12, and the reason is the artwork rather than the aesthetics |
| Vertical spacing (universal) | the band’s own **44 · 64 · 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390), which is where the Band padding row went |
| Top divider (universal) | None · Line · Fade (at None, landing above the band on the page ground) |

Six controls of its own, plus the universal trio and the Data group.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 12 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **No extra upload of any kind is needed for the band**, and that holds for Ghost author photographs too.

**Editing** · exactly 1 Grid’s statement, **on the band**: the toolbar draws in its own light chrome above the carried-colour text rather than inverting with it, and the carried colour is what a field shows while it is being edited. Nothing here is Ghost-owned that is not Ghost-owned in 1 Grid.

**Derived values** · from one token pair: muted = the carried colour at 72% (`#BEBCB7` light, `#57544D` dark); initials fill = 10%; hairline 18%, never drawn. **The accent is unavailable at 2.3:1 light and 2.1:1 dark**; links and rings take the carried colour. Cells 306 · 240 at Full bleed, **274 · 214 at Inset** inside the 1,168.

**Responsive** · 1 Grid's rule plus the band's own padding step; at Inset the cells are 143 at ≤ 767 rather than 163.

**Empty** · as 1 Grid, the initials block included: no photograph → two initials in a list the site types itself and one letter at Source Ghost authors, on the band's derived 10% fill. **Forced colours and print both drop the band and the section draws on the page's own ground** — it stays 7 Contrast Band without its band and never becomes another design. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · the band a `background-color` on the section, so the DOM and the announcement are 1 Grid's exactly. **§7.4 applied: the accent is disabled with its ratio shown.** **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · the 72% muted, the 10% initials fill and the 18% hairline that is never drawn; the Inset cell widths; the statement that four grounds need one set of uploads.

---

## 8 · Founder

One person: portrait, name, role and the 900-character letter. **The team of one, and the design every grid advises at one person.**

**Descriptor.** The only design that draws one person, and the only one whose two halves are vertically centred against each other — a named crop beside a 900-character letter, with no list in the DOM at all.

**Structural descriptor.** `split · none · page · one · left · vertically centred halves`

**Archetype.** split

**Behaviour module.** **none.** Division, Image side, the 1080 stack and the crop forced to 3:2 there are CSS; **the `body`-then-`bio` fallback is a template condition resolved on the server**, not a runtime choice. **JS off:** identical, fallback included.

**Items** · `people[]`, **and the first item only** — the one design in A12 where the repeater holds items the section does not draw.

- **Add.** Allowed, and it changes the design: **a second person makes this 1 Grid**, and the panel says so before the add — “2 people — 1 Grid draws both.” The added row is not drawn while the section is still 8 Founder.
- **Remove.** Never disabled. **Removing the first item promotes the second** — the only place in A12 where a remove changes who the section is about. Removing the last empties the list and the section does not render.
- **Reorder.** Meaningful in exactly one way, and it is the whole hierarchy: **the first item is the founder, and there is no featured field.** Dragging a row to the top changes the person drawn.
- **Counts.** **One.** Two or more → the first person is drawn and the rest are held, with 1 Grid advised in the panel; the list may hold up to twenty-four and only the first is read.
- **Zero.** The section does not render — the letter is a section field but a letter with nobody attached is not a section.
- **Inside an item.** `name`, `role`, `photo`, `url`, and **`bio` as the fallback text where `body` is empty**; `group` stored. Division, Crop, Image side and Name size are section values. **With one item, “every item at once” and “this item” are the same set — stated rather than exploited**: no per-item control is exposed here either, because a value nothing else reads would be lost the moment a second person turned the section into 1 Grid.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · `eyebrow`, `title`, `body` ≤ 900 and ≤ 3 paragraphs, `note`, the link pair; **the first item of `people[]` only**, reading `name`, `role`, `bio`, `photo`, `url`. **The text is `body`, falling back to `bio`**; with both authored, `body` wins and the editor says so.

**Controls.**

| Control | Values |
|---|---|
| Division | **Even 632/632 · Text-led 504/760 · Image-led 760/504**, all on a 32 px gutter |
| Image side | Left · Right |
| Crop | Portrait 4:5 · Square 1:1 · **Landscape 3:2** |
| Name size | Medium 20 · Large 27 |
| Head | Shown · None |
| Socials | Off · Shown — directly under the name and role, above the letter |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group. **Image focus is a field on the image, and it is P0·9’s — both axes, values not restated here**, and this is the largest photograph in A12 — a 760 × 950 crop, or 3:2 forced at 1080 and below.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 1 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **At Authors All the drawn person is whoever the Order returns first** — alphabetically, or by post count — so **Hand-picked is the only honest way to choose a founder**, and the Limit is 1 by construction.

**Not offered** · Title size; the sub; “match the text”; an overlap; a frame, shadow or caption; a second person.

**Editing** · head strings and `linkLabel` as 1 Grid; **the letter edits inline as prose** — `body` ≤ 900 and ≤ 3 paragraphs on the text half’s measure. **Where `body` is empty the `bio` fallback is what edits, and typing into it writes `bio`**, which the editor says before the first keystroke. `name` and `role` edit inline beside it. **Nothing else is added: no signature image, no pull quote, no second column.**

**Arrangement** · the two halves vertically centred against each other — **the only centred pairing in A12**; the text half a stack 24 apart: name and role, letter, note, link; letter 17/1.7 on the half's own measure.

**Responsive** · at 1080 and below the halves stack with the image above the text at both Image side values, **and the crop is forced to 3:2**.

**Empty** · no photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors at the crop's full size. **No `body` → the `bio`; neither → a portrait, a name and a role, which is a valid section.** At Head None there is no `<h2>` and no accessible name. Two or more people → the first person is drawn and the rest are held, 1 Grid advised in the panel. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · **no list — the one design in A12 without one**; the 27 px name is not a heading; not a `<figure>`. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · the `body`-then-`bio` fallback and the six-line Ghost clamp; offering Landscape 3:2 where 6 Portraits refuses it; Head None as a real value and the nameless section it creates; receiving from every grid at one person and handing off at two.

---

## 9 · Faces

Eight to twenty-four people, four to eight across, a circle and a name and nothing else. §8.3's team of twelve, and **the only design in A12 that refuses the role.**

**Descriptor.** The only design that draws a face and a name and nothing else — eight to twenty-four circles at four, six or eight across, with the role kept and refused — and the only one where turning the names off moves the link and the alt text onto the photograph.

**Structural descriptor.** `grid-of-N · none · page · many · top · face and name only`

**Archetype.** grid-of-N

**Behaviour module.** **none**, and Names None is the reason to say so twice: **it is a control value resolved on the server**, changing the photograph's alt text, the initials block's `aria-label` and where the `<a>` sits in the markup before anything runs. **JS off:** identical, **including the alt-text switch**, because it is authored into the HTML rather than applied to it. No tooltip, no hover name and no “+4 more” — the three things a wall of twenty-four is usually given, each of which would have needed script.

**Items** · `people[]`, eight to twenty-four, one circle each.

- **Add.** Lands last; **the wall absorbs it** — a new face extends the last row at the same cell width, and cells never widen to take it.
- **Remove.** Never disabled. **Under eight → drawn as authored, 1 Grid advised in the panel**, which draws the roles this design is refusing; zero → the section does not render.
- **Reorder.** Meaningful but **the least consequential in A12**: at four to eight across nothing is emphasised by position except the first row. Stated, because a wall of twenty-four is where a site is most likely to want alphabetical order and **there is no sort *control* anywhere in the category — this design and 10 Directory now carry a one-shot Sort A–Z *edit* at the repeater’s head instead**, undoable, storing nothing, sorting on `name` as typed.
- **Counts.** **Eight to twenty-four** — the category's ceiling, reached here and in 10 Directory. Add person is disabled at twenty-four; over twenty-four the repeater stops.
- **Zero.** The section does not render.
- **Inside an item.** `name` required, `photo`, `url`; **`role` and `bio` stored and never drawn, with the panel naming the count it is leaving out.** At Names None **the name is still content even though it is not drawn** — it is the photograph's alt text and the initials block's label — which is why the field stays required in a design with no visible type on a person.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials are refused in this design**, and `socials[]` is stored and never drawn — the panel advises 1 Grid.

- **Sort A–Z, an edit rather than a control.** One shot at the repeater’s head, undoable from the editor’s own undo stack, storing nothing on the section and leaving no row in the panel; it rewrites the authored order once and **sorts on `name` as typed**, locale-aware, so “Priya Raghunathan” files under P. **Absent at Source Ghost authors**, where Order does the same work. *Flagged: offering it on these two designs only, and sorting on the name as typed.*


**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; **eight to twenty-four** people reading `name`, `photo`, `url`. **`role` and `bio` are kept and never drawn**, and the panel names the count it is leaving out.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · Flush left · None |
| Count per row | Four · **Six** · Eight |
| Photo size | Small 56 · Medium 72 — **fixed at 44 at Count Eight, where Medium is greyed with the reason beside it** |
| Names | Under the face · None |
| Row gap | Tight 24 · Normal 32 — two values rather than three, because a loose gap breaks the wall into rows |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Five controls of its own, plus the universal trio and the Data group. **No socials row: socials are refused here**, with the reason shown — this design refuses even the role, and four 28 px slots under a 14 px name in a 141 px cell would be a control row larger than the name. Row gap keeps its own row, because it measures between rows rather than around the section.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 24 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **This is the design for Source Ghost authors** — the one whose field list matches what the API returns — and **Order: Name A–Z is the Ghost-mode equivalent of the Sort A–Z button**.

**Editing** · head strings and `linkLabel` as 1 Grid; **`name` edits inline under the face**, and **at Names None it is edited in the item row instead**, because nothing is drawn to select. **Sort A–Z sits at the repeater’s head** — an edit rather than a control, undoable, storing nothing on the section and absent at Source Ghost authors, where Order Name A–Z is the equivalent.

**Arrangement** · cells 306 · 196 · 141 on a fixed 24 px gutter; **the name at 14/1.4 — the one design where the name is not 17**; photograph to name 12; **the name block equalised per row, not per wall.**

**Responsive** · all three counts become four across at 834 and **three across at ≤ 767 — the only design in A12 that keeps three on a phone.**

**Empty** · no photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors, same size, same place. Under eight → drawn as authored, 1 Grid advised in the panel, which draws the roles; over twenty-four → the repeater stops. **`socials[]` is stored and never drawn here**, like the other fields this design keeps, and the panel names the count it is leaving out.

**a11y** · one flat `<ul>` of up to twenty-four `<li>`, no grouping, no skip link. **At Names None the photograph takes the person's name as its alt text, the initials block takes an `aria-label`, and the link moves to the image** at a 56 or 44 px target — **the one exception to settlement 1 in the category.** **Socials are refused here, so the tab-stop count is unchanged.** A12’s three published strings are 13 Rail’s, and they are theme catalog strings rather than generated ones.

**Flagged** · the eight-to-twenty-four range; the 14 px name; the 141 px cells and 44 px circle at Count Eight; **Names None turning alt text on**; refusing the role, a tooltip and a “+4 more”; three counts converging at 834; three across on a phone.

---

## 10 · Directory

Names and roles in hairline rows, in one, two or three columns. **The one design in A12 that draws no photograph at any setting** — `photo` is kept, twelve are authored, none are drawn, and the panel advises 1 Grid.

**Descriptor.** The only design that draws no photograph at any setting — names and roles in hairline rows, filled down and then across in one, two or three columns — and the only one that goes to a single column at every width.

**Structural descriptor.** `table · none · page · many · none · hairline rows, no photograph`

**Archetype.** table. **The archetype names the shape, not the markup**: rows share a height across columns so the hairlines line up, and a row is a name and a role in two aligned fields, which is the table archetype's geometry. **The existing a11y note stands unchanged** — it is a `<ul>`, not a `<table>`, there are no column headers, and nothing in column two relates to the row beside it.

**Behaviour module.** **none**, and the three refusals are the reason it stays none: **an alphabet index, a filter and a search field are all refused**, and each is a module — `toc`, `filter-strip`, `search-expand`. The column-major fill, the shared row heights and the hairline under every row including the last are CSS. **JS off:** identical.

**Items** · `people[]`, four to twenty-four, one hairline row each.

- **Add.** Lands last, which in a column-major fill means **the foot of the last column** — and because the columns are balanced, one added item can re-flow the break in every column. The panel states the rows per column rather than the total alone. *Flagged: the re-flow note is mine.*
- **Remove.** Never disabled, and it re-flows the columns the same way. **Under four → drawn as authored, 1 Grid advised in the panel**, which draws the photographs this design is keeping and not drawing; zero → the section does not render.
- **Reorder.** Meaningful and **unusually consequential**: with columns filled down then across, moving one row moves the column break for everything after it, so a drag can change which names sit side by side.
- **Counts.** **Four to twenty-four.** Add person is disabled at twenty-four; over twenty-four the repeater stops. **The design is built for the top of that range** — twenty-four names in three columns is the case it exists for.
- **Zero.** The section does not render.
- **Inside an item.** `name`, `role`, `url`; **`photo` stored and never drawn at any setting** — the one design in A12 where an uploaded photograph is kept and refused, with 1 Grid named in the panel. `bio` and `group` stored. Columns, Rule, Role position and Density are section values: a row cannot be given its own density or its role in a different place.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials are refused in this design**, and `socials[]` is stored and never drawn — the panel advises 1 Grid.

- **Sort A–Z, an edit rather than a control.** One shot at the repeater’s head, undoable from the editor’s own undo stack, storing nothing on the section and leaving no row in the panel; it rewrites the authored order once and **sorts on `name` as typed**, locale-aware, so “Priya Raghunathan” files under P. **Absent at Source Ghost authors**, where Order does the same work. *Flagged: offering it on these two designs only, and sorting on the name as typed.*


**Fields** · `eyebrow` ≤ 26, `title` ≤ 104, `note` ≤ 120, the link pair; **four to twenty-four** people reading `name`, `role`, `url`. `photo`, `bio`, `group`, `body`, `sub`, `image`, `imageAlt` kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · Flush left · None |
| Columns | One 1,296 · **Two 636** · Three 416 |
| Rule | **Hairlines** · None |
| Role | **Beside the name** · Under the name |
| Density | Compact · **Comfortable** |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Five controls of its own, plus the universal trio and the Data group. **No socials row: socials are refused here** — a hairline row is two aligned fields, and a third would break the alignment the design is built on. **Image focus — P0·9’s control, both axes, values not restated here — is present on `photo` and has no effect at any setting here**, and the field says so rather than hiding. **This design draws no photograph at any setting, so the control could never do anything here**: whether that makes it P0·9’s not-drawn note rather than a field that says it has no effect is **open for the owner** in the Patch notes, and the treatment is left exactly as found.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 24 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **At Ghost authors a ledger of names is what arrives** until the Role overrides are typed; Name A–Z is the order an index wants.

**Not offered** · a photograph at any size; a Title size; a sub; an alphabet index; a filter; a search field; a section-level order control — **the Ghost Order row and the one-shot Sort A–Z are the answers**.

**Editing** · head strings and `linkLabel` as 1 Grid; **`name` and `role` edit inline in the hairline row**, the whole of what this design draws. **Sort A–Z sits at the repeater’s head**, the same one-shot edit as 9 Faces and for the same reason: this is the other design that reaches twenty-four.

**Arrangement** · columns **filled down and then across** on a 24 px gutter; name 17/600 in `text`, role 14 in `text-muted` right-aligned to its column at Beside; **a row is 14 px of padding above and below a 17 px name, 53 px including its hairline** (10 at Compact, 12 at Role Under); **rows share a height across columns, so the hairlines line up**; a hairline under every row including the last and never above the first.

**Responsive** · **Three columns becomes Two at 834, and every value becomes One column at ≤ 767 with the role under the name.** At 834 columns 365 on 24, row padding 13, title 30. At ≤ 767 one column, row padding 12, title 26. **One across at ≤ 767 is this design's stated departure from A12's two-across floor**, allowed because there is no photograph in the row.

**Empty** · no role → the name alone and the rest of the row empty. No eyebrow, note or link → absent. Under four people → drawn as authored, 1 Grid advised in the panel; over twenty-four → the repeater stops. At head None there is no `<h2>` and no accessible name. **`socials[]` is stored and never drawn here**, like the other fields this design keeps, and the panel names the count it is leaving out.

**a11y** · one `<ul>` of up to twenty-four `<li>`; **not a `<table>` and not marked up as columns** — no column headers, and nothing in column two relates to the row beside it; the role a `<span>` inside the person's item, so a reader hears “name, role” as one item at both Role values; the grid flows down then across, so reading order is authored order; the hairline never a target. Name 15.8:1 / 15.1:1, role 5.6:1 / 6.0:1, hairline 1.3:1 as a non-text divider. **Socials are refused here, so the tab-stop count is unchanged.** A12’s three published strings are 13 Rail’s, and they are theme catalog strings rather than generated ones.

**Flagged** · drawing no photograph at any setting; the column-major fill; the 1,296 / 636 / 416 divisions; the 53 px row and the two densities; right-aligning the role; **the wrapping role dropping under its name and growing its neighbour's row**; the hairline under the last row and never above the first; the four-person floor; one column at ≤ 767; refusing an index, a filter and a search field.

---

## 11 · Slim

A 96 to 144 px band: a line of overlapped faces, one sentence, and the section link at the far end. **The shortest section in A12 and the only one with no heading of any kind.**

**Descriptor.** The only design with no heading at all — a 96 to 144 px band of overlapped 32 px faces, one sentence and a link — and the only one that keeps `url` without drawing it, because no name is drawn to carry it.

**Structural descriptor.** `bar · none · page · many · left · overlapped faces, no heading`

**Archetype.** bar

**Behaviour module.** **none.** The overlap is a negative margin with a 2 px `background` ring, the first-face-on-top order is `z-index` in source order, the wrap at ≤ 767 is the flex container's, and **Spaced being unavailable above sixteen people is a disabled control value rather than a measurement.** **JS off:** identical — and with no link authored there is nothing focusable in the section at all.

**Items** · `people[]`, three to twenty-four, one 32 px circle each.

- **Add.** Lands last, which here means **the back of the stack**: the first face is on top, so a new face goes under every existing one. The band widens rather than growing, until ≤ 767, where the line wraps and **the band grows 32 px a line.**
- **Remove.** Never disabled; the band narrows and the sentence and link stay pinned to their ends. **Under three → drawn as authored, 1 Grid advised in the panel**; zero → the section does not render.
- **Reorder.** Meaningful **for one reason only, and it is a visual one: overlap order.** The first row is the face in front, and there is no other way to say which face is on top.
- **Counts.** **Three to twenty-four.** Twelve overlapped are 274 px and twenty-four are 538; **Spaced is greyed above sixteen, with the reason beside it,** because sixteen spaced faces are 632 px and the sentence and link need about 470, and the control says so. Over twenty-four the repeater stops.
- **Zero.** The section does not render — a sentence and a link with no faces is not this design.
- **Inside an item.** `photo`, and `name` **only as the initials block's letters — two in an authored list, one at Source Ghost authors**. `role`, `bio`, `url` and `group` are stored and none of them are drawn: **a person's URL cannot be reached in this design at all**, which the frame states rather than works around. The circle size, the overlap and the ring are section values.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials are refused in this design**, and `socials[]` is stored and never drawn — the panel advises 1 Grid.



**Fields** · **`title` ≤ 104, drawn as one sentence at 15 px in `text` rather than as a heading**, and the link pair; three to twenty-four people reading `photo` and `name` — the name for the initials block only. **Kept and never drawn: `eyebrow`, `sub`, `note`, `body`, `image`, `imageAlt`, `role`, `bio`, `group` and `url`** — the only design in A12 that keeps `url` without drawing it, because no name is drawn to carry it.

**Controls.**

| Control | Values |
|---|---|
| Faces side | **Left** · Right |
| Faces | **Overlapped** · Spaced — **Spaced greyed above sixteen people, with the reason beside it** |
| Rule | None · Above · **Above and below** |
| Width | **Content** · Full bleed |
| Sentence | **Beside the faces** · Under them |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | **32 · 44 · 56, a band of 96 · 120 · 144** — the retired Padding row, and the one ladder in A12 that does not step with width |
| Top divider (universal) | **Locked at None**, because this design’s own Rule row draws the top edge and the bottom one too |

Five controls of its own, plus the universal trio and the Data group. **No socials row: socials are refused here** — no name is drawn at any setting, so there is nothing for a person’s links to hang from. 16 spaced faces are 632 px, 24 are 952, and the sentence and link need about 470.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 24 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **The thinnest author record survives here**: `profile_image` and `name` are all this design reads.

**Not offered** · a Head; a Title size; a photo size; a name; a role; a counter.

**Editing** · **the sentence edits inline** — it is `title` at 15 px rather than a heading, and the only section string this design draws; `linkLabel` edits inline and `linkUrl` opens the Link Picker. **Every person’s `name` is edited in the item row**, since no name is drawn at any setting, and the row is also where `url` is authored for a link this design never draws.

**Arrangement** · a **32 px circle**, off the category's ladder and the smallest face in A12, at a **10 px overlap with a 2 px `background` ring**, first face on top; twelve faces overlapped are 274 px and twenty-four are 538; at Spaced an 8 px gap, no ring, and twelve faces are 472; faces to sentence 20, the sentence centred on the circles, the link pushed to the column's end. At Full bleed the rule runs to the viewport and the content stays on 1,296.

**Responsive** · at 834 the band holds and only its sizes step — circle 28, overlap 9, gap 16. **At ≤ 767 it stops being a band and becomes a stack of faces, sentence and link**, and Faces side and Sentence stop having an effect; circle 24, overlap 8, and **faces past the width wrap at the same overlap, the band growing 32 px a line.**

**Empty** · no photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors at 32 px. No title → the band is faces and a link, and the panel says the sentence is missing. **No link → no interactive content and no tab stop.** Under three people → drawn as authored, 1 Grid advised in the panel; over twenty-four → the repeater stops. **`socials[]` is stored and never drawn here**, like the other fields this design keeps, and the panel names the count it is leaving out.

**a11y** · **no accessible name at any setting**, A11·10 Slim's position; the sentence a `<p>`; the faces a `<ul>` of `<img alt="">` with `aria-hidden` on the initials block, **decorative because the sentence says what they are** — the opposite of 9 Faces at Names None, where the faces are the whole content; one tab stop, and none with no link authored. **Socials are refused here, so the tab-stop count is unchanged.** A12’s three published strings are 13 Rail’s, and they are theme catalog strings rather than generated ones.

**Flagged** · the 32 px off-ladder circle; the 10 px overlap and first-face-on-top order; **the 2 px `background` ring, the one ring on a photograph in A12**; drawing `title` as a 15 px sentence; keeping `url` undrawn; the sixteen-person limit on Spaced; **the band of 96 · 120 · 144, which amends the roster's “96 to 132 px”**; the wrap at ≤ 767; refusing a counter, a tooltip and a hover name.

---

## 12 · Big Type

One sentence at Display 48 on a 1,040 measure, with a single row of three or four people under it. **The only design in A12 that offers Display 48.**

**Descriptor.** The only design that offers Display 48 — one statement on a 1,040 measure with a single row of three or four people under it — and the only one that holds authored people out of the DOM entirely rather than drawing them somewhere.

**Structural descriptor.** `stack · none · page · few · top · display statement above row`

**Archetype.** stack

**Behaviour module.** **none**, and the held people are what proves it: **the theme renders the first N and stops**, so there is nothing hidden to reveal, expand or fetch — refusing a “see all” is refusing `load-more`. The statement's size steps, the 64 px head gap and the full-width Between rule are CSS. **JS off:** identical, and **the held people are absent with or without script**, because they were never emitted.

**Items** · `people[]`, **the first three or four drawn**, the rest held.

- **Add.** Lands last, and **past the count it is held rather than drawn**: the panel reads “4 of 9 drawn — 1 Grid draws all nine”, 1 Grid's wording used for the whole library.
- **Remove.** Never disabled. **Removing a drawn person promotes the next held one into the row**, which is the only place in A12 where a remove makes a person appear. One or two → that many cells, left-aligned; one → drawn as one, 8 Founder advised in the panel; zero → the section does not render.
- **Reorder.** Meaningful and **the most consequential in A12**: the repeater decides which three or four people exist on the page. It is also why the category's two hard cases are drawn on a labelled hypothetical row here — the authored order holds them back.
- **Counts.** **Three or four drawn**, at 416 or 306; the list may hold up to twenty-four.
- **Zero.** The section does not render — and neither does it with no title, since the statement is the design.
- **Inside an item.** `name`, `role`, `photo`, `url`; `bio` and `group` stored. **There is no per-person featured field**: the statement is the emphasis and it is section copy, so the way to give one person the section is 8 Founder. Title size, Alignment, Count, Photo size and Rule are section values — **Alignment Centred centres each card's contents too**, which is the clearest case in A12 of one value writing itself onto every item.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · `eyebrow` ≤ 26, **`title` ≤ 104 and required in practice**, the link pair; **the first three or four of `people[]`** reading `name`, `role`, `photo`, `url`. **Kept and not drawn: `sub` and `note`** — the only design in A12 that holds two authored section fields at once — plus `bio`, `group`, `body`, `image`, `imageAlt` and every person past the count.

**Controls.**

| Control | Values |
|---|---|
| Title size | Large 40 · **Display 48** |
| Alignment | **Flush left** · Centred |
| Count | Three 416 · **Four 306** |
| Photo size | **Medium 72** · Large 96 |
| Rule | **None** · Between |
| Socials | Off · Shown |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 24 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **Limit says how many authors arrive; Count says how many are drawn** — set Limit above Count and the panel reads “4 of 9 drawn”, exactly as for an authored list.

**Not offered** · Small 28 or Medium 34; a Head None; a sub; a note; a bio; a second row; a “see all”.

**Editing** · **the sentence edits inline at Display 48 on its 1,040 measure**, and the measure does not change while it is edited; `note` and `linkLabel` as 1 Grid. Per person, `name` and `role` edit inline in the row — **and the held people are edited in the repeater rather than on canvas**, because they are not drawn.

**Arrangement** · statement on a 1,040 measure inside the 1,296 column, 1.08 leading at Display and 1.12 at Large; **head to people 64**, A11·15's exception; cells 416 / 306 on a 24 px gutter, the same cells 1 Grid uses; name 17, or 20 at Large 96; link 32 under the row. **Rule Between is one hairline across the full 1,296, inside the 64 px gap.** Alignment Centred centres the statement, the row, each card's contents and the link together.

**Responsive** · the statement steps 48 → 40 → 32 and 40 → 34 → 32, **so the two sizes converge at ≤ 767**; Count Four becomes three across at 834 and two at ≤ 767, and the people past the width join the held list. At 834 measure 700, cells 234 on 26, head gap 56.

**Empty** · no title → the section does not render, since the statement is the design. No role → the name alone. No photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors. One or two people → that many cells, left-aligned; one person → drawn as one, 8 Founder advised in the panel. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · the statement is the `<h2>` and the section's accessible name; **the held people are not in the DOM at all** — not `display:none`, not `aria-hidden`, not behind a “more” control: the theme renders the first N and stops. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · the two-size ladder and refusing Small and Medium; the 1,040 measure and 64 px gap at this size; **one row only, with the rest held and named in the panel**; refusing the sub and the note; Centred centring the cards' contents; the full-width Between rule; the sizes converging at 32 on a phone; drawing the two hard cases on a labelled hypothetical row, because the authored order holds them back.

---

## 13 · Rail

One line of portrait cards wider than the window, scrolled by the reader. **A11·9's rail carried over verbatim**, with logos swapped for the person card at a named crop.

**Descriptor.** The only design the reader moves — a full-bleed track of portrait cards wider than the window — and the only one in A12 whose existence is decided by a measurement at render rather than by what was authored.

**Structural descriptor.** `carousel · none · page · variable · top · reader-scrolled card track`

**Archetype.** carousel

**Behaviour module.** `carousel`, **named as the closest module in the registry rather than as a description of this design.** Edit-safe — it does not run while the section is being edited and the scroll position is never persisted or restored, which is why every frame is drawn at rest. **JS off:** “The slide track is a native horizontally-scrollable `scroll-snap` strip — **fully usable**, only dots and arrow buttons are hidden.” Two mismatches, both stated at the head of this document and landing here. **This design refuses snapping and, unlike A11·9, the refusal is not forced** — its cards are equal at 240 or 306, so the registry's snap strip is buildable and the no-JS drawing may be better than the drawn one; that is finding 3 and it is the architect's to settle. **The measured precondition is not something the module covers**, so with JavaScript off the section stays a rail whose track happens not to overflow rather than becoming 1 Grid: **a grid is a cell layout, and nothing without script can decide to build one.** **This design declares a width: the arrows retire under 768**, so its no-JS line describes both sides of it — at 768 and above the track is scrolled natively with the arrows and the fades absent; under 768 the arrows are already gone. At ≤ 767 the arrows are already dropped, so the phone drawing and the no-JS drawing are the same drawing. Reduced motion keeps the scroll and drops the animation, which needs no script either.

**Items** · `people[]`, five to twenty-four, one card each on the track.

- **Add.** Lands last, at the right end of the track — **outside the window, and the rail does not scroll to show it**; the repeater's row is what confirms the addition. Adding is also the one edit that can bring this design into existence: **a fifth person at Standard turns a wall that fits into a rail.**
- **Remove.** Never disabled. **Removing until the track fits the content width hides the arrows and the fades at that width and keeps them at narrower ones** — the same list, two designs, decided by the window. One → drawn as one, 8 Founder advised in the panel; zero → the section does not render, track, arrows and the generated “Team, scrollable” name included.
- **Reorder.** Meaningful; the track is authored order, and the first card lines up with the title because the page margin is the track's padding.
- **Counts.** **Five to twenty-four at Standard**, and the count class is `variable` because **the design has no designed count**: a track absorbs any number and the precondition is a width, not a total. Everything fits → the arrows and the fades are hidden and the rail rests as a row, with 1 Grid advised in the panel.
- **Zero.** The section does not render.
- **Inside an item.** `name`, `role`, `bio` ≤ 240, `photo`, `url`; `group` stored. **Card width, Crop, Bio and Arrows are section values**: a card cannot be given its own width, its own crop or a hidden bio, it cannot be pinned to an end, and **no card is a snap point because there are none at all.**

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; **five to twenty-four** people reading `name`, `role`, `bio` ≤ 240, `photo`, `url`. `group`, `body`, `image`, `imageAlt` kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · **Flush left** · None |
| Card width | Narrow 240 · **Standard 306** |
| Crop | **Portrait 4:5** · Square 1:1 |
| Bios | **Shown** · Hidden |
| Arrows | **In the margins** · Above the rail |
| Socials | Off · Shown |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group. **The Bio row is renamed Bios**, the category-wide name. **Image focus is adopted on `photo`, and it is P0·9’s control with both axes** — a 306 card at 4:5 is 382 px tall, so Top is what keeps a head — while the crop stays a section value.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 24 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. A Ghost bio clamps by line here — three in a Standard card, four in a Narrow one.

**Not offered** · a Landscape crop; a gap; autoplay; dots; a per-person crop; a card border.

**Editing** · head strings and `linkLabel` as 1 Grid; **`name`, `role` and the ≤ 240 `bio` edit inline in the card**. **The behaviour is parked while editing**, so a card outside the window is reached from its repeater row rather than by scrolling the track, and the scroll position is neither persisted nor restored.

**Arrangement** · a full-bleed track starting and ending on the page margin, cards on a 24 px gutter, image to name 16; name 20/600, role 14, bio 15/1.6 clamped to three lines in a Standard card and four in a Narrow one; **a 306 card at 4:5 is 382 px tall**, and four cards fill the 1,296 exactly, which is why a fifth person makes this a rail. The initials block fills the crop at 0.34 × its height — **104 px letters at 306 × 382, the largest type in A12.**

**Behaviour** · reader-driven scroll; **a click moves one card plus one gutter — 330 px at Standard, 264 at Narrow**; fades 96 / 72 / 48 in `background`, each drawn only when there is content past that end; no snap; position never restored; nothing auto-advances; **the behaviour does not run while editing**; reduced motion keeps the scroll and drops the animation. **The precondition is withdrawn and nothing measures**: where the cards are not wider than the content width the section **draws as a plain grid, with no arrows, no fades and no scroll container** — the result described rather than another design named, which is the change A14 already made for the same reason. It is still 13 Rail, resting as a row.

**Responsive** · cards and fade step with width; at 834 cards 264 / 216, fade 72, ends on the 40 px margin; **at ≤ 767 the arrows are dropped and the rail is scrolled by touch**, cards 240 / 200, gutter 20, fade 48.

**Empty** · no photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors filling the crop. No role or bio → a shorter card that stays shorter. Under five people at Standard → a shorter rail with its arrows and fades hidden, 1 Grid advised in the panel; one person → drawn as one, 8 Founder advised in the panel; over twenty-four → the repeater stops. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · the track a `role="group"` with the generated label **“Team, scrollable”** — the one generated string in A12 — and `tabindex="0"`; arrows `<button>`s named “Scroll left” and “Scroll right”, outside the group and in drawn order at both placements; a disabled arrow keeps `aria-disabled`, stays focusable and stays 38 px, its glyph 2.1:1 and disclosed; tabbing to a linked name scrolls it into view, the browser's own behaviour. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Print** · **a wrapped grid at three across, every person and every bio.**

**Flagged** · the 240 and 306 card widths and their steps; the 16 px image-to-name gap; the arrows in the foot beside the note; one card plus one gutter per click; refusing snap, autoplay, dots and a Landscape crop; the five-person floor at Standard; printing as a wrapped grid.

---

## 14 · Reveal

1 Grid, where each person's bio opens on a button in their own card. **For the team that has twelve bios and no room for twelve bios.**

**Descriptor.** The only design where a bio opens per person — 1 Grid's cells with a 38 px disclosure in each card, any number open at once — and the only one whose opened panel can be drawn outside the card that opened it.

**Structural descriptor.** `grid-of-N · none · page · many · top · per-card bio disclosure`

**Archetype.** grid-of-N

**Behaviour module.** `accordion` — the disclosure module, **and not the registry's `reveal`**, which is a scroll-in animation and shares nothing with this design but its name. Edit-safe: it does not run while the section is being edited and the open state is never persisted, resetting on reload at both Start values. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” **Start maps exactly onto that**: Start First open is the `open` attribute on the first person's element, Start All closed emits none. Two findings land here and both are stated at the head of this document. **The drawn trigger is a `<button aria-expanded aria-controls>` named with `aria-labelledby` on the person's own name, and a `<summary>` is named by its own content** — so the registry's markup and this design's one avoided generated string cannot both hold; finding 1, for the architect. And **at Bio opens Under the row the panel is not the trigger's child**, which native disclosure requires, so **with JavaScript off that value draws as In the card with every bio open** — no bio is lost and nothing is unreachable, but the drawn arrangement is not preserved; finding 2. **This design declares no width**: the disclosure runs at every width, and what changes at ≤ 767 is where the panel sits rather than whether the script runs — so its no-JS line is one state on both sides of every breakpoint. Reduced motion drops the transition.

**Items** · `people[]`, three to twenty-four, one card and one disclosure each.

- **Add.** Lands last. **A new person has no bio, therefore no button, and the tab order skips them** — the seeded item's most visible consequence anywhere in A12.
- **Remove.** Never disabled. **Removing every bio leaves the section with nothing to open** and the panel says so; one → drawn as one, 8 Founder advised in the panel; zero → the section does not render.
- **Reorder.** Meaningful, and consequential at one control value: **at Bio opens Under the row two open bios stack in authored order**, so a move changes which bio is read first. Inside a card, order changes nothing but position.
- **Counts.** **Three to twenty-four**, at three, four or five per row; over twenty-four the repeater stops. **At Count Five Bio opens is forced Under the row**, a section value the list cannot override.
- **Zero.** The section does not render.
- **Inside an item.** `name`, `role`, `bio` ≤ 240, `photo`, `url`; `group` stored. **Start, Bio opens, Count and Photo size are section values — so a person cannot be set to start open on their own**: Start First open is positional, and the first item is whichever row the repeater has first. A per-person open state is one of the four per-item controls refused in writing.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; three to twenty-four people reading `name`, `role`, `bio` ≤ 240, `photo`, `url`. `group`, `body`, `image`, `imageAlt` kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · **Flush left** · None |
| Count per row | Three 416 · **Four 306** · Five 240 |
| Photo size | **Medium 72** · Large 96 — **Large greyed at Count Five, with the reason beside it** |
| Bio opens | **In the card** · Under the row — **at Count Five and at ≤ 767 the section draws Under the row and In the card is greyed, with the reason beside it** |
| Start | **All closed** · First open |
| Socials | Off · Shown — under the role and above the disclosure, so the button stays the last thing in the card |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list. At Ghost authors: **Authors** All · Hand-picked · **Limit** 1 to 24 · **Order** Name A–Z · Most posts. **Only authors with at least one published post appear** — the Content API returns no others, so an invited colleague who has not published cannot be drawn at any Limit. The repeater becomes P0·3’s read-only Ghost card with **one editable field per row, a Role override keyed by the author’s slug**; Image focus is stored the same way. Socials arrive from the author’s own handles, version-gated: Facebook and X on Ghost 5.x, all nine platform fields on ≥ 6.36. **While the section is selected the editor draws every panel open**, so every bio edits in place; the resting state returns on deselect, and no “Preview” control exists here or anywhere in A12.

**Not offered** · one-at-a-time; a modal; hover-to-open; a card target; a Title size.

**Editing** · head strings and `linkLabel` as 1 Grid; **`name`, `role` and the ≤ 240 `bio` edit inline**. **While the section is selected the editor draws every panel open**, so all eleven bios edit in place and the resting state returns on deselect — **this is the P0·6 state switcher’s work and not a sidebar “Preview” control**, of which A12 has never had one.

**Arrangement** · 1 Grid's cells and 40 px row gap; **the button A1·14's icon button at 38 px on an 8 px radius, 14 px under the role**, bare when closed and on the hover surface with an accent glyph when open; the glyph a plus that becomes a minus and does not rotate; bio 12 px under the button at 15/1.6, four lines in a 306 cell and five in a 240. **A person with no bio has no button.**

**Behaviour** · independent disclosure per card, **any number open at once**; 160 ms ease-out on the height, the glyph swapping at the midpoint; **the row's height follows its tallest open card and closed cards stay at the top of their cells**; at Under the row the cards keep their heights and the bio opens in a full-width panel below that row, above a hairline, **two open bios stacking in authored order, each under its own name at 15/600**; state never persisted, resetting on reload at both Start values; **does not run while editing**; reduced motion drops the transition.

**Responsive** · every count becomes three across at 834 and two at ≤ 767, **and at ≤ 767 Bio opens is forced Under the row** — the design's second-axis collapse and its only forced value. The button stays 38 px at every width.

**Empty** · **no bio → no button, and the tab order skips that person.** No role → the name alone with its button under it. No photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors. No bios at all → no card has a button and the panel advises 1 Grid. One person → drawn as one, 8 Founder advised in the panel. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**a11y** · `<button aria-expanded aria-controls>` **named by the person's name with `aria-labelledby`, so no label is generated**; the glyph `aria-hidden`; the bio in the DOM and toggled with `hidden`, so find-in-page does not land on invisible text; reading order photograph, name, role, button, bio at both values; focus never moved on open, and closing leaves focus on the button. Open glyph 3.9:1 light and 4.7:1 dark. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Print** · **every bio open, at both Bio opens values.**

**Flagged** · the plus-and-minus glyph and refusing a chevron; the button's position and the 14 px gap; dropping the button where there is no bio; independent opening and refusing one-at-a-time; the Under-the-row panel repeating the name; forcing Under at Count Five and at ≤ 767; not persisting state; printing every bio open.

---

## 15 · Groups

People under labelled headings — Editorial, Art and photo, Operations. **The one design in A12 that regroups the list**, and it does it by reading an authored field rather than by sorting.

**Descriptor.** The only design that regroups the list — labelled blocks in the order their first member appears, built from an authored per-person field rather than by sorting — and the only one in A12 with a second heading level.

**Structural descriptor.** `stack · none · page · many · top · authored group headings`

**Archetype.** stack

**Behaviour module.** **none**, and three refusals are the reason it stays none: **a collapsible group would be `accordion`, a filter would be `filter-strip`, and a count in the label would be `count-up`.** The grouping itself is server-side — the theme walks `people[]` once in authored order and opens a block at each new `group` value. **JS off:** identical, blocks, `<h3>`s and hairlines included.

**Items** · `people[]`, four to twenty-four, grouped by an authored field.

- **Add.** Lands last — **and last means the unlabelled final block until a `group` is typed**, which is the one place in A12 where a new item appears somewhere the author did not choose. Typing a label that matches an existing block exactly moves the person to the end of that block; typing a new one opens a new block at the foot.
- **Remove.** Never disabled. **Removing a block's last member removes the block and its `<h3>`**, and the blocks close up at 56. Under four → drawn as authored, 1 Grid advised in the panel; zero → the section does not render.
- **Reorder.** Meaningful twice over: authored order holds inside a block, **and the position of a group's first member decides that group's order**, so moving one row can move a whole block. There is no group order control and no alphabetical sort.
- **Counts.** **Four to twenty-four**, and **counts are per group rather than per section** — a group of five at Count Four is 4 + 1, left-aligned; a group of one is a label and one card. Over twenty-four the repeater stops.
- **Zero.** The section does not render. **No groups at all, or one group for everybody, is not zero — it is one unlabelled block of cards with no group headings**, still this design, with 1 Grid advised in the panel.
- **Inside an item.** `name`, `role`, `bio` ≤ 240, `photo`, `url`, and **`group` ≤ 24 — the one per-item field in A12 that changes layout, and it is content rather than a design control**: the user types a label and the section builds the blocks from it. **Case is not normalised** — “Editorial” and “editorial” are two blocks, which the editor warns about. Count, Photo size, Group label and Bio are section values. At Source Ghost there is no group field, so every author lands in the unlabelled block — one block of cards with no group headings, still this design — and 1 Grid may be advised in the panel.

- **At Source Ghost authors.** No Add person, no drag handles, no Remove; name, photograph and bio read-only and answering “Edit in Ghost”; **the Role override is the one editable field per row**, stored against the author’s slug because Ghost has no role. **An extension of P0·3**, whose Ghost card was read-only throughout. **A Ghost author with no photograph draws one letter, not two** — the first letter of the name — because Ghost cannot produce two initials from a name; an authored person keeps both. 

- **Socials.** `socials[]` is per person, zero to four, each an Icon Picker slot from Social / Brands plus a URL; the section control is **Socials: Off (default) · Shown**, so the field is authored per item and drawn or not for the whole section — the category’s rule about section values holding, restated. At Source Ghost authors the slots arrive from the author’s own handles.



**Fields** · `eyebrow`, `title`, `sub`, `note`, the link pair; **four to twenty-four** people reading `name`, `role`, `bio` ≤ 240, `photo`, `url` and **`group` ≤ 24 — the one design in A12 that reads it.** `body`, `image`, `imageAlt` kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Head | Centred · **Flush left** · None |
| Count per row | Three 416 · **Four 306**, and 336 · 246 at label Beside |
| Photo size | Small 56 · **Medium 72**, **Large 96 not offered** |
| Group label | **Above the row** · Beside the row |
| Bios | Shown · **Hidden** |
| Socials | Off · Shown |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row) |
| Top divider (universal) | None · Line · Fade (drawn at None) |

Six controls of its own, plus the universal trio and the Data group. **The Bio row is renamed Bios**, the category-wide name.

**Not offered** · a group order control; an alphabetical sort; a per-group note; a collapsible group; a filter; a count in the label.

**Editing** · head strings and `linkLabel` as 1 Grid; per person, `name`, `role` and the ≤ 240 `bio` edit inline. **Group labels edit inline on canvas as the `<h3>`s they are, and one edit renames every member of that block** — the only edit in A12 that writes to more than one item at once, so **the editor says how many people it changed** before it commits.

**Arrangement** · **groups in the order their first member appears, authored order kept inside each**; label 13 px uppercase tracked `.08em` in `text-muted` as an `<h3>`, hairline 12 under it, 24 to the first face; **blocks 56 apart, rows 40 apart inside a block**; counts are per group, so a group of five at Count Four is 4 + 1, left-aligned. At Beside: **196 · 44 · 1,056**, A11·2's division verbatim, with no hairline and the label aligned to the top of the first photograph. **Group values are matched exactly and case is the site's** — “Editorial” and “editorial” are two groups, which the editor warns about.

**Responsive** · label Beside becomes Above at 1,080; both counts become three across at 834; **at ≤ 767 the grid is two across with the bio hidden and one across with it shown**, the category's floor rule.

**Empty** · **a person with no `group` → the unlabelled final block, counted in the panel**. No groups at all, or one group for everybody → a single unlabelled block, 1 Grid advised in the panel. A group of one → a label and one card. No photograph → the initials block, two initials in a list the site types itself and one letter at Source Ghost authors. Over twenty-four people → the repeater stops. **No `socials[]` → no row and no gap**, never an empty slot, and a person with none draws nothing there while a neighbour draws four. Image focus on a missing photograph is inert: the initials block is not a crop.

**Data** · **Source: Authored · Ghost authors**, in the Data group outside this design’s list: Authors All · Hand-picked · Limit 1 to 12 · Order Name A–Z · Most posts, with **only authors that have at least one published post** appearing. **Ghost has no group field, so at Source Ghost every author lands in the unlabelled block — one block of cards with no group headings, still this design** — the editor says so in words, and 1 Grid may be advised in the panel, never switched to. **The one design in A12 that cannot be driven from Ghost at all.**

**a11y** · one `<h3>` and one `<ul>` per group — **the one design in A12 with a second heading level**; the unlabelled block a list with no heading and **no invented `aria-label`**; at head None the labels stay `<h3>` and the outline skips a level, because a heading level that changes with a control is worse; DOM order identical at both label values; label 5.6:1 / 6.0:1 at 13 px. **At Socials Shown** each icon is a link named by the catalog string “{name} on {platform}”, the glyph `aria-hidden`, the row a `<ul>` with `rel="me"` on every link — **up to four tab stops a person**, forty-eight across twelve people, which is why the control ships Off.

**Flagged** · first-appearance group order; keeping authored order inside a group; the label at the eyebrow's size as a real `<h3>`; the 56 and 40 gaps; **the unlabelled final block and refusing “Other”**; refusing to promote labels at head None; not normalising case; refusing a count, a pill, a filter and a collapsible group; the four-person floor; the single unlabelled block at Source Ghost.

---

## Amendments the drawn designs forced on the proof

1. **Settlement 1 is amended by 9 Faces.** A person's photograph is `alt=""` because the name is drawn beside it — **except at Names None, where no name is drawn and the photograph takes the person's name as its alt text**, with an `aria-label` on the initials block and the link moving to the image. 11 Slim is the counter-case and is stated on both frames: there the faces are decorative, because the sentence says what they are.
2. **Settlement 2 is amended by 2 Cards.** A short card sits at the top of its cell everywhere in A12 — **except in a card design, where the card stretches to its row's height**, because a card has a visible edge and a short one would read as a mistake.
3. **The roster's “96 to 132 px band” is amended to 96 to 144** by 11 Slim's arithmetic: A7·8's 32 · 44 · 56 padding with a 32 px circle gives 96 · 120 · 144.
4. **`linkLabel` is raised from 20 characters to 24.** The category's own label, “Write for Orbit Weekly”, is 22 — the limit was stated before the string was drawn, and the string is the one every design uses. The stress frame draws a 20-character label as well, to show both inside the ceiling.
5. **The photo ladder gains two off-ladder sizes**, each named on its frame: **32 px in 11 Slim** and **44 px at Count Eight in 9 Faces**.
6. **The ring refusal gains one exception**: 11 Slim's 2 px `background` ring, drawn only where overlapped circles touch.
7. **The category has exactly one generated string** — 13 Rail's “Team, scrollable”. 14 Reveal was the second candidate and avoids it by naming its buttons with `aria-labelledby` on the person's own name.
8. **The responsive floor gains a third departure.** A11's “never one across” became “two, or one where a bio is drawn” in A12-0; **10 Directory goes to one column at every setting**, because a ledger with no photograph in two columns is a table nobody can scan.
9. **`sub` and `note` are each held back by one design** — both by 12 Big Type, which is the only design in A12 that holds two authored section fields at once. **`url` is held back by 11 Slim**, the only design that keeps a link field it cannot draw.
10. **The Ghost source has one design it cannot drive at all**: 15 Groups, because Ghost stores no group. 9 Faces is the design whose field list matches what the API returns.

## The roster at a glance

| # | Design | Photo | Reads beyond the floor | Panel advises |
|---|---|---|---|---|
| 1 | Grid | Circle | — | 8 Founder at one, 9 Faces over twelve |
| 2 | Cards | Circle | `bio` | 8 Founder at one, 1 Grid over twelve |
| 3 | Rows | Circle | `bio` ≤ 400 | 8 Founder at one, 1 Grid over twelve |
| 4 | Story and Team | Circle | `body`, `image`, `imageAlt` | 1 Grid with no story |
| 5 | Split Head | Circle | `body` | 1 Grid with no title |
| 6 | Portraits | Crop | — | 1 Grid over three, 8 Founder at one |
| 7 | Contrast Band | Circle | — | 1 Grid in print and forced colours |
| 8 | Founder | Crop | `body`, `bio` | 1 Grid at two or more |
| 9 | Faces | Circle | — | 1 Grid under eight |
| 10 | Directory | none | — | 1 Grid under four |
| 11 | Slim | Circle 32 | — | 1 Grid under three |
| 12 | Big Type | Circle | — | 8 Founder at one; holds the list past the count |
| 13 | Rail | Crop | `bio` | 1 Grid when the cards fit, 8 Founder at one |
| 14 | Reveal | Circle | `bio` | 1 Grid with no bios, 8 Founder at one |
| 15 | Groups | Circle | `group`, `bio` | 1 Grid with no groups, and at Source Ghost |

**Eleven designs draw a circle, three draw a named crop, one draws no photograph at all. Ten advise 1 Grid in the panel; every grid design advises 8 Founder at a team of one. Two have a behaviour and thirteen have none.**

---

## Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fifteen checked against each other; **no two are the same.**

| # | Design | Tuple |
|---|---|---|
| 1 | Grid | `grid-of-N · none · page · many · top · grid of equal cells` |
| 2 | Cards | `grid-of-N · none · page · many · top · one card per person` |
| 3 | Rows | `stack · none · page · many · left · full-width row per person` |
| 4 | Story and Team | `stack · none · page · variable · top · group photograph above team` |
| 5 | Split Head | `split · none · page · many · right · head column beside people` |
| 6 | Portraits | `grid-of-N · none · page · few · top · scrim under overlaid caption` |
| 7 | Contrast Band | `grid-of-N · none · contrast · many · top · inverted ground, no uploads` |
| 8 | Founder | `split · none · page · one · left · vertically centred halves` |
| 9 | Faces | `grid-of-N · none · page · many · top · face and name only` |
| 10 | Directory | `table · none · page · many · none · hairline rows, no photograph` |
| 11 | Slim | `bar · none · page · many · left · overlapped faces, no heading` |
| 12 | Big Type | `stack · none · page · few · top · display statement above row` |
| 13 | Rail | `carousel · none · page · variable · top · reader-scrolled card track` |
| 14 | Reveal | `grid-of-N · none · page · many · top · per-card bio disclosure` |
| 15 | Groups | `stack · none · page · many · top · authored group headings` |

**Distribution.** Archetype: grid-of-N ×6 (1, 2, 6, 7, 9, 14) · stack ×4 (3, 4, 12, 15) · split ×2 (5, 8) · bar, carousel, table ×1 each (11, 13, 10). **Containment: `none` ×15 — the whole category**, which is A12's taxonomic finding: A11 had one real containment and A12 has none, because a person is drawn on the page and the one design with a plane draws it around the *item*. Ground: page ×14, contrast ×1 (7). Count: many ×10 (1, 2, 3, 5, 7, 9, 10, 11, 14, 15) · variable ×2 (4, 13) · few ×2 (6, 12) · one ×1 (8). Media: top ×10 (1, 2, 4, 6, 7, 9, 12, 13, 14, 15) · left ×3 (3, 8, 11) · right ×1 (5) · none ×1 (10).

**How the slots are read here, stated once so it is reproducible.**

- **Media placement is read from where the photograph sits relative to the person's own type**, because in A12 the media is inside the repeating item rather than beside the section's type: `top` where the photograph is above the name — ten designs, the ordinary case, and the shared floor's stated DOM order · `left` where it is beside the name (**3 Rows**, **11 Slim**) or where the image takes one half of a split at the control's default (**8 Founder** at Image side Left; at Right the tuple reads `right` and stays unique) · `right` in **5 Split Head**, where the people take the side opposite the head column · **`none` in 10 Directory alone, the one design in A12 with no media at all** — where A11 could not spend that value even once, because its item *was* the artwork. *Flagged: the reading is mine.*
- **Containment is the section's, never the item's.** **2 Cards is `none · page`** and it is the category's sharpest case, because the design is called Cards: the card is the person's geometry, the section has no container, and the Cards control (Surface · Ground) sets the card's fill rather than the section's ground. **A12 has no design that draws a container around the whole section** — A11's 4 Boxed has no counterpart here, and the reason is stated in the shared floor: a photograph carries its own ground.
- **Count classes are read at the count the design is drawn at — twelve people, the roster — rather than at the floor of its range.** This is a stated departure from A11, whose rule was to take the class at the lower drawn value: **every range in A12 spans the few/many boundary** (three to twelve, four to twenty-four, five to twenty-four, eight to twenty-four), so reading at the floor would make fourteen designs `few` and the slot would carry nothing. Where the ceiling is low the class follows it: **6 Portraits** is `few` at two or three, **12 Big Type** is `few` at three or four, **8 Founder** is `one`. `variable` is spent twice and both times for a stated reason: **13 Rail** has no designed count because its precondition is a width, and **4 Story and Team** is the one design whose designed range includes zero — the author decides whether there is a list at all. *Flagged: the departure is mine.*
- **10 Directory is `table` and it is the only archetype in A12 that names a shape its own markup refuses.** Rows share a height across columns so hairlines align, and a row is two aligned fields; that is the table archetype. The a11y note's refusal of `<table>`, of column headers and of any relation between column two and the row beside it stands unchanged — **the archetype is a classification, not a tag.**

**1 Grid and 7 Contrast Band are the pair the brief describes** — the same wall, the same items, the same item rules, separated by ground alone. A12's version of that pair is cheaper than A11's in one specific way and the design says so: **the band needs no second upload**, because the photographs are untouched on any ground.

**What the closed slots could not separate — a finding for the architect.** **Four designs share all five closed slots**: 1 Grid, 2 Cards, 9 Faces and 14 Reveal are each `grid-of-N · none · page · many · top`, separated by the emphasis slot alone. That is not a slip, and it is not an accident of this category either: **eleven of the fifteen designs draw a circle above a name on the page ground**, so what actually distinguishes them is **what the item holds besides its image** — 2 Cards adds a plane and a bio, 9 Faces subtracts the role, 14 Reveal adds a disclosure — **and the closed sets have no slot for an item's field set.** They also have **no slot for behaviour**: 1 Grid and 14 Reveal are identical in all five closed slots, and one of them runs `accordion` while the other runs nothing. A11's finding was that the tuple cannot see the scale of a repeating unit; **A12's is that it cannot see the unit's contents or its behaviour.** In both cases the emphasis slot is doing work the closed slots were meant to do.

## Behaviour modules at a glance

| Design | Module | Edit-safe | JavaScript off |
|---|---|---|---|
| 13 Rail | `carousel` | yes — parked, position never persisted | registry: native scroll-snap strip, arrows and dots hidden. **Here:** a natively scrolled rail without snap, no arrows, no fades; **it does not become 1 Grid** |
| 14 Reveal | `accordion` | yes — state never persisted | registry: native `<details>`, fully functional, `open` server-rendered. **Here:** every bio open in its own card; Bio opens Under the row is not preserved |
| The other thirteen | **none** | — | identical, pixel for pixel |

**`core` is assumed in all fifteen** and declared in none, per the note at the head of this document. **No A12 design loses an authored person, name, role, bio, photograph or link with JavaScript switched off**, and the two that change change only in arrangement.

---

## Reconciliation notes

**Frames changed in this pass.** **All sixteen frames**, and no primary section frame among them.

- **All fifteen control-panel frames** — `A12-1 Grid`, `A12-2 Cards`, `A12-3 Rows`, `A12-4 Story and Team`, `A12-5 Split Head`, `A12-6 Portraits`, `A12-7 Contrast Band`, `A12-8 Founder`, `A12-9 Faces`, `A12-10 Directory`, `A12-11 Slim`, `A12-12 Big Type`, `A12-13 Rail`, `A12-14 Reveal`, `A12-15 Groups`: the universal trio drawn outside each list, every per-design Padding row retired into Vertical spacing, the **Data** group added, **Socials** added on twelve, **Bios** added on 2 Cards and 3 Rows, the two locks drawn with their reasons on 7 Contrast Band and 11 Slim, and the footer control count restated.
- **All fifteen spec cards**, in the same words as the panels: Controls, Data, **Editing**, Empty states, and the a11y note wherever the socials row adds tab stops.
- **Five states strips are new**, one per mechanism, so that what is genuinely new is drawn where it can be read against the old: **`A12-1`** the socials row and the Ghost-mode repeater · **`A12-4`** the story editing inline · **`A12-6`** Image focus on a 4:5 crop, with the case it cannot answer — **pass five: the strip draws both axes and the case is answered** · **`A12-9`** Sort A–Z at the repeater's head · **`A12-15`** a group label renaming its block. **`A12-10`** draws the Sort A–Z head too, being the other design that reaches twenty-four.
- **`A12-0 Category Proof`** carries the eleven-point reconciliation card, and its photo-families card was corrected: the refused focal-point *control* now sits beside the focal-point *field* that ships, instead of contradicting it.
- **No primary section frame was redrawn, and the reason is stated on `A12-0`:** every control this pass adds ships at the value the frames were already drawn at — Socials Off, Bios Shown, Image focus Centre, Top divider None, Background role each design's existing ground, Source Authored.

**Control counts after the pass.** Five on 9 Faces, 10 Directory and 11 Slim; six on ten designs; **seven on 2 Cards and 3 Rows**, the two that gained Bios — plus the universal trio and the Data group everywhere, against the PRD's ceiling of about fifteen. Quick Controls stay three to five per design and no design's Quick set grew.

**Where this pass overruled something this document had already ruled.** One line each, and in every case the earlier reason is answered rather than ignored.

1. **The focal point.** The two photo families refused "a focal-point control" outright; **Image focus now ships as a field on every `photo`**, in the Image Picker's popover, on A14's ruling that where a photograph is cropped is content — *the three values this line used to enumerate were removed in pass five, where the control became P0·9's and gained its second axis; nothing else in this record changed.* **The refusal keeps its aim and its wording:** the ratio is the section's, there is no per-person crop, and no *control* moves a crop. Where it does the most work — 6 Portraits, 8 Founder, 13 Rail, and 4 Story and Team's Band 3:1 group photograph — the old answer, "upload a different file", is withdrawn.
2. **The vocabulary that field needs is short one axis.** A 4:5 crop of a landscape photograph crops left and right, and three vertical values had nothing to say about it. ~~**ARCHITECT: the Image focus vocabulary is short a horizontal axis**~~ — drawn on `A12-6`, and a control-vocabulary question rather than a registry one. **Settled in pass five: P0·9 carries a side-to-side axis, and `A12-6` now draws both.** The field is adopted as given; the case stays unanswered.
3. **The row of social icons.** Refused "everywhere in A12" on the reason that Ghost stored two handles and a row of two implied a set the platform did not have. **On Ghost ≥ 6.36 it has nine**, so the refusal's own premise expired: the row ships behind **Socials: Off (default) · Shown**, version-gated — Facebook and X on 5.x, nine on ≥ 6.36. **The other five refusals stand** — no `mailto:`, no chevron, no external-link glyph, no generated "Read their posts", no second link per person — and **9 Faces, 10 Directory and 11 Slim still refuse the row**, each with its own reason on its frame.
4. **"The site changes author order in Ghost rather than here" is deleted as false.** Ghost Admin has no author reorder. **Order: Name A–Z · Most posts** in the Data group is the fix, resolved server-side. The two rules that sentence was protecting stand: no section-level sort control, and no drag-to-reorder of a Ghost list.
5. **"No section-level sort control in any design" is narrowed, not kept.** An authored wall of twenty-four wanted alphabetical order and had no lever. **A one-shot Sort A–Z at the repeater's head in 9 Faces and 10 Directory** is the answer — an edit, not a control: undoable, storing nothing on the section, absent at Source Ghost authors, sorting on `name` as typed. Neither it nor the Ghost Order row is a section control, so the rule survives as written.
6. **"At Source Ghost the role line is empty unless the site authors one" had no mechanism.** It has one now: **a Role override, one editable field per read-only Ghost row, stored in the theme against the author's slug.** Image focus is stored the same way, a Ghost file being un-croppable from here. **This is recorded as an extension of P0·3**, whose Ghost-sourced card was read-only throughout — not a redesign of the primitive.
7. **Reorder is meaningful in all fifteen — for an authored list.** At Source Ghost authors there are no drag handles, no Add person and no Remove, so the six designs where reorder decides more than order (8 Founder's founder, 12 Big Type's drawn three, 15 Groups' block order, 11 Slim's front face, 14 Reveal's stack, 10 Directory's column break) **lose that lever in Ghost mode and gain only Order**. Stated rather than smoothed over.
8. **Every per-design Padding row is retired into Vertical spacing**, the same three values under the universal name. **Two ladders survive as resolutions of that control rather than as second rows** — 7 Contrast Band's band at 44 · 64 · 88 and 11 Slim's width-independent 32 · 44 · 56 — and **two genuinely different ladders keep their own names**: 2 Cards' Card padding (inside the plane) and 9 Faces' Row gap.
9. **Background role is universal, which gives 1 Grid a Contrast value that used to be 7 Contrast Band's whole reason to exist.** Both stay: the control ships everywhere with an advice line naming 7, and **7 Contrast Band's Background role is locked at Contrast with the reason shown**, its ground being its identity. The finding the pair was drawn to state is unchanged and cheaper than A11's — **the band needs no second upload**.
10. **11 Slim's Top divider is locked at None**, because that design's own Rule row already draws both edges; a second edge control would contradict the first.
11. **Bios: Shown · Hidden on 2 Cards and 3 Rows** meets the floor's "a person with neither is drawn as a name alone". Both hold: **Hidden is a section value that hides, never deletes**, the bio moving to the item row; and **in Ghost mode the bio arrives from the author record, so deleting it is not an option here at all.**
12. **The control budget.** The earlier four-to-seven norm is lifted where these items add controls, and **seven is the new high-water mark** (2 Cards, 3 Rows) rather than a ceiling reached. No design needed the PRD's fifteen.
13. **No fixed English visitor-facing string ships.** A12's three — "Team, scrollable", "Scroll left", "Scroll right" — are **theme translation-catalog strings**, and "the category's one generated string" was the wrong description of the first. The socials row adds one catalog *pattern*, **"{name} on {platform}"**, whose two values are content.
14. **Ground rule 7 removes nothing.** **No A12 panel ever carried a "Preview" control.** The P0·6 state switcher was always the answer for 13 Rail and 14 Reveal, and 14 Reveal's editor drawing every panel open while the section is selected is that switcher's work, not a sidebar preview of it.
15. **Ground rule 9 lands nowhere and is recorded rather than added.** **Member Visibility is absent from all fifteen**: the category bears no call to action — its one link is a text link at the section-link treatment, 11 Slim draws no name at all, and the socials row is a row of the person's own links. *Flagged: if the architect wants the control universal rather than CTA-scoped, all fifteen gain it at once.*
16. **Ground rule 6 needed no registry addition and none was invented.** `carousel` on 13 Rail and `accordion` on 14 Reveal remain A12's only modules. The two collisions already at the head of this document are unchanged by this pass and are still the architect's call: **`accordion`'s no-JS `<details>` branch against 14 Reveal's `aria-labelledby` button**, and **13 Rail's precondition being a measurement no module makes**.

---

## Patch notes — about and team patch, 28 August 2026

Every change below carries the **name** of the rule that required it. Rules are named and never numbered:
the letter-and-number labels elsewhere in this project are filing codes and say nothing about what a rule
requires.

**Frames updated — all sixteen.** `A12-0 Category Proof` (the roster's last column renamed **READS ·
PANEL ADVISES**, **[Free]** marked on 1 Grid and 10 Directory, settlement 1's initials rule split by
source, the roster note reworded) and every design frame `A12-1` … `A12-15`, each of which gained an
**ABOUT PATCH** card stating, in one line each, what changed on that frame and which rule required it,
and each of which had its hand-off sentences rewritten as panel advice and its initials sentences
restated by source. **Redrawn beyond captions: nothing.** No layout, type scale, colour pack, spacing
value, photo ladder or drawn state moved.

### What changed, and the rule that required it

| Rule | Change |
|---|---|
| **Avatars with no photograph** | **The main work of this pass, and it touches all fifteen.** The initials block now follows its source: **two letters** where the site typed the list itself ("Rosa Ferreira" → RF), **one letter** where the person came from Ghost ("Rosa Ferreira" → R), because Ghost cannot produce two initials from a name and the theme will not guess a surname out of a string. Restated in the shared floor's initials paragraph, in **every design's Empty line** ("no photograph → the initials block, two letters in an authored list and one letter at Source Ghost authors"), in **every design's Ghost paragraph**, and in the two designs that described the block by its letter count — **11 Slim** (32 px, "two letters, or one at Source Ghost authors") and **9 Faces** (the block's letters stay decorative at Names None). Nothing else about the block changes: same box, same fill, same 0.34 × ratio, same position, and a row mixing photographs with one-letter blocks is as ordinary as one mixing photographs with two. The seeded new person still draws **NP**, because that list is typed here. |
| **A per-author role override is keyed by the author's slug** | **Checked, already correct, recorded rather than changed.** The override — the one editable field on a Ghost-sourced row — was keyed by the author's slug in all fifteen designs, and Image focus is stored the same way. No occurrence of a name-keyed override was found in this document or on any frame. |
| **No design ever turns into another design** | **Every hand-off in the category is now advice in the panel.** Deleted: "one → 8 Founder", "over twelve → 9 Faces", the ten designs that named 1 Grid below their count, **4 Story and Team's** "no story → 1 Grid", **5 Split Head's** "no title → 1 Grid", **15 Groups'** "no groups → 1 Grid", **8 Founder's** "two or more → 1 Grid", **14 Reveal's** "no bios makes the section 1 Grid", **7 Contrast Band's** "print and forced colours make the section 1 Grid", and **13 Rail's** measured "cards narrower than the content width → 1 Grid". In their place the section **draws what exists, or draws the first N and holds the rest, and hides what does not apply**: the rail hides its arrows and fades where the track already fits; 14 Reveal draws no button where no bio is authored; 15 Groups draws one unlabelled block where no group is; 8 Founder draws the first person and holds the rest; 7 Contrast Band prints and renders in forced colours on the page's own ground, still itself, without its band. The panel may say "at this count, 1 Grid reads better" — **advice, never a switch**. The floor's three answers are now two, and the roster's "hands off" column is "panel advises". |
| **Gap names are "Tight · Normal · Loose"** | **One subject: 9 Faces' Row gap**, which read Tight 24 · Comfortable 32. It now reads **Tight 24 · Normal 32**, two of the three words, with the narrowing's reason shown in the panel — a loose gap breaks the wall into rows, which is what this design is not. **2 Cards' Card padding keeps Compact · Comfortable · Spacious**: it measures a card's padding rather than a gap, and those are the standard padding words. |
| **The Remove button never greys out** | **Already satisfied, and this patch strengthened it.** `people[]` has no minimum: Remove is visible and clickable at every count, removing the last person empties the list, and the section then does not render (4 Story and Team excepted). What used to happen below a design's count — the hand-off — is gone, so the edit now simply goes through and the panel advises. At Source Ghost authors there is no Remove at all, which is the source's rule and not a disabled control. |
| **Slider labels** | **No subject.** A12 draws no slider. Every control is a named-value row whose title says what it affects — Photo size, Card padding, Bio measure, Row gap, Count per row — and whose values reuse the standard words. |
| **Item counts are a number picker** | **One subject, already a picker: the Ghost `Limit`**, a stepper from 1 to the design's ceiling with the ceiling's reason stated. **Count per row is not an item count** — it is a cells-across control whose three values *are* three drawn cell widths (416 · 306 · 240, and 196 · 141 in 9 Faces), each of which sets the photograph's size and the role's measure. Turning it into a free number would ask for widths no design has been drawn at. **Recorded here rather than changed, and put to the owner as an open question below** rather than decided in this document. |
| **A design may offer fewer choices on a shared control, and must say why** | **Re-checked across all fifteen.** The swatch row is **Base**; **there is no "Inherit" value anywhere in A12**; no shared control is renamed or extended; and every narrowing shows its reason — 7 Contrast Band's Background role locked at Contrast, 11 Slim's Top divider locked at None, 1 Grid's Large 96 unavailable at Count Five, 2 Cards refusing Count Five on the measure, 9 Faces' Spaced value unavailable above sixteen, and now 9 Faces' two-value Row gap. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject.** A12 bears no call to action: no subscribe button, no paid tier, no Portal link, no member form. Its one section link is a text link and a person's link is their own URL or their Ghost author page. Recorded so the absence is deliberate rather than overlooked. |
| **The no-JavaScript notice** | **No subject, and no claim to withdraw.** A12 contains no subscribe or sign-in form, so there is nothing for the notice to replace. The per-design no-JavaScript line is restated on every frame instead: thirteen designs are pixel-identical with script off; **13 Rail** scrolls natively with its arrows and fades absent; **14 Reveal** draws every bio open in its own card. The sent, error and loading states elsewhere in the library are untouched. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest, photography-independent designs — **1 Grid · 10 Directory · 3 Rows · 2 Cards · 11 Slim** — and recommended **1 Grid and 10 Directory**. Marked on the proof frame's roster and written in §0 as the line the merge reads: **`**[Free] designs:** 1 Grid · 10 Directory`**. **The owner's confirmation is still open** — the question is below, and the line will be rewritten to whatever he picks. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15.** Fifteen designs, no gaps, nothing renumbered, nothing reused, nothing deleted. |

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** — fifteen
   designs, no gap and no renumbering in this category.
2. **The `**[Free] designs:**` line is present** in §0, on its own line, and names **1 Grid** and
   **10 Directory** — both of which exist in this category's roster. It is marked as recommended and
   awaiting the owner's confirmation.

### Open questions

**QUESTION 1 — Which two of the fifteen team designs are free**

**OPEN FOR THE OWNER.**

Two designs in every category ship in the free theme, and which two is your call. These five are the
plainest — a site could publish any of them and not look unfinished — and none of them needs the customer
to have good photography:

- **1 Grid.** A circle, a name and a role in equal cells. It is what a site gets when it types "team", and ten other designs point at it as the sensible arrangement.
- **10 Directory.** Names and roles in hairline rows with **no photographs at all**, so a site with no pictures of anyone still looks finished.
- **3 Rows.** One person per full-width row with a paragraph beside the photograph. Plain, but it wants a real bio for every person.
- **2 Cards.** One person per bordered card. Also plain, but a card is an edge on the page and it wants bios too.
- **11 Slim.** A single line of small overlapping faces with a sentence beside it. Very plain, but it draws no names, so it reads as decoration rather than a team list.

1. **1 Grid and 10 Directory.** *(RECOMMENDED)*
   The two differ in kind rather than degree: one is the ordinary photo grid, the other needs no photographs
   whatsoever. A free customer with twelve headshots and a free customer with none are both covered.
   *A visitor sees:* either twelve circles with names under them, or a clean list of twelve names and roles.
   *It gives up:* nothing a free customer is likely to miss — bios are the paid designs' territory.
2. **1 Grid and 2 Cards.**
   Both are grids, so the free tier looks consistent, and Cards is the one design where a bio has a home.
   *It costs:* a site with no photographs of anyone has no free design that suits it, and a card with
   no bio in it is a lot of empty plane.
3. **1 Grid and 3 Rows.**
   Gives the free tier a full-width row with room for a real paragraph per person.
   *It costs:* twelve full-width rows is a tall section, and a site that has not written bios gets twelve
   mostly empty rows.

~~**QUESTION 2 — How many people across a row: named widths or a number you type**~~

**SETTLED — by the owner, in the pass-two ruling of 31 August 2026: option 1, keep the three named values.** Struck through and kept for the record. The ruling and its reason are written into the shared floor above, and the reason it is the one carve-out — every value is a drawn cell width, and six across would give the 196 px photograph the wall-of-faces design uses precisely because it draws no roles — is recorded in the Patch notes below. Nothing in the question was answered by this document.

Every grid design has a row called **"Count per row"** offering three values — three, four or five —
and each value is a different drawn size: at three the photograph is large and the role has room to
wrap, at five the photograph is small and a long role wraps twice. The library rule that counts should
be a number you type was written for "how many items to show", which in this category is the separate
limit on the Ghost list, and that one **is** a number you type. This row is a layout choice. Which
should it be?

1. **Keep the three named values.** *(RECOMMENDED)*
   They are the three widths every frame in the category is drawn at, and each has been checked against
   a long role and a wrapping name.
   *An editor sees:* Three · Four · Five, with the panel noting that at five a long role wraps twice.
   *It gives up:* an editor cannot ask for six or seven across.
2. **Make it a number you type, two to six, with the reason shown at the limits.**
   *An editor sees:* a small number field. Typing 6 gives 196 px photographs — the size 9 Faces uses for
   a wall of faces, where no roles are drawn.
   *It costs:* two sizes nobody has drawn or checked, and a role line that will wrap three times at six
   across. We would need to draw and check them before this ships.
3. **Number you type, but only the drawn values are selectable and the rest are greyed with the reason.**
   *An editor sees:* a number field where 3, 4 and 5 work and 6 is greyed with "six across leaves no room
   for a role".
   *It costs:* it looks like a free field and behaves like three buttons, which is the most confusing of
   the three for the least gain.

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** fifteen designs, numbered **1–15**.

---

## Patch notes — pass two, 31 August 2026

Every change below carries the **name** of the rule that required it. Rules are named and never numbered.

**Frames updated — all sixteen.** `A12-0 Category Proof` and `A12-1` … `A12-15`, each gaining a **PASS TWO PATCH** card that states, one line each, what changed on that frame and which rule required it. **Redrawn: nothing.** No layout, type scale, colour pack, spacing value, photo ladder or drawn state moved; the changes are captions, panel wording and empty-state sentences. **No design total appears anywhere in this category**, and none was added.

### What changed, and the rule that required it

| Rule | Change |
|---|---|
| **A count that picks between drawn layouts is a named set, not a number picker** | **Count per row keeps its three named values — three, four, five — and this is the category's one carve-out** to the rule that every item count is a number you type. The reason is written into the shared floor and onto every frame that draws the control: the row picks between three **drawn** layouts, at three the photograph is large and a job title has room to wrap, at five it is small and a long title wraps twice, and those are the only widths any frame here has been drawn and checked at, against a long role and a wrapping name. **Six across would give 196 px photographs, which is the size the wall-of-faces design uses precisely because it draws no roles**, and a typed number would let an editor choose a width nobody has looked at. The same reasoning is recorded for the category's other named sets — 2 Cards' Three · Four, 4 Story and Team's Four · Five, 5 Split Head's Two · Three · Four, 6 Portraits' Two · Three, 9 Faces' Four · Six · Eight, 10 Directory's One · Two · Three columns, 12 Big Type's Three · Four, 15 Groups' Three · Four. **"How many people to show" is a separate control and stays a number picker** — the Ghost `Limit` stepper, unchanged. |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **All fourteen Empty lines that draw a face now state it, in the same words: two initials, because a team list is typed by the user** — "Rosa Ferreira" → RF. Five of the fourteen did not carry the sentence at all and now do: **3 Rows, 4 Story and Team, 5 Split Head, 7 Contrast Band** (on the band's derived 10% fill) and **15 Groups**. The nine that carried it read "two letters" and now read **"two initials"**, the rule's own word. **10 Directory is the fifteenth and has no subject**: it draws no photograph, and its Empty line already says so. **The one-letter form is unchanged and stays** — an author pulled from Ghost draws one letter, which is the rule's own second half, since Ghost cannot split a name on the versions we support — and the floor now says outright that **the two forms are never mixed inside one component**. |
| **One design must not name another** | **One subject: 13 Rail.** The line that said the section "draws as 1 Grid" where the cards are not wider than the content width now **describes the result — "draws as a plain grid, with no arrows, no fades and no scroll container"** — and adds that it is still 13 Rail, resting as a row. Changed in the written behaviour line, in the frame's precondition caption and in the frame's prose card. A14 made the same change for the same reason. Everywhere else in A12 a named design is **advice in the panel** and never a switch, which the previous pass had already settled. |
| **A control switched off by another is greyed, with the reason beside it** | **Stated once in the shared floor and applied to all five cases**, which were written as "unavailable" and are now written as greyed with the reason as a short sentence at the control, never a tooltip and never hidden: **Title size at head None**; **Large 96 at Count Five** in 1 Grid and in 14 Reveal; **Medium 72 at Count Eight** in 9 Faces; **Spaced above sixteen people** in 11 Slim; and **Bio opens** in 14 Reveal, where Count Five and ≤ 767 force Under the row — **the displaced value is now greyed with its reason rather than left accepting a setting the section will not honour**. A value a design does not offer at all is a different thing and stays absent with the panel saying why: 2 Cards' Count Five, 13 Rail's Landscape crop, 15 Groups' Large 96. **A12 has no case of the exception** — no control here is one the project can never offer. |
| **The Remove button never greys out** | **Already satisfied; restated on every frame.** `people[]` has no minimum, Remove is visible and fully clickable at every count, and clicking it produces the floor and the reason as one sentence under the list. At Source Ghost authors there is no Remove at all, which is the source's rule and not a disabled control. |
| **A design may declare the width below which its script runs** | **One design declares one: 13 Rail — "the arrows retire under 768".** Its no-JavaScript line now describes **both sides** of that width: at 768 and above the track is scrolled natively with the arrows and the fades absent; under 768 the arrows are already gone, so the no-JavaScript drawing and the phone drawing are the same drawing. **14 Reveal declares none and now says so**: the disclosure runs at every width, and what changes at ≤ 767 is where the panel sits rather than whether the script runs. The other thirteen designs run no script at any width. |
| **The feature-image caption renders differently on the two Ghost versions** | **No subject.** A12 draws no feature-image caption. Its only rich field is the section `body` read by 4 Story and Team, 5 Split Head and 8 Founder, which is authored in the theme rather than rendered from a post's caption, and no design in the category leans on italics. Recorded so the absence is deliberate rather than overlooked. |
| **A comment count renders nothing at all without JavaScript** | **No subject.** No design in A12 reads a comment count. The category's three catalog strings — "Team, scrollable", "Scroll left", "Scroll right" — and its one catalog pattern, "{name} on {platform}", contain no number and no placeholder. |
| **Printed design totals stay out of product copy** | **Nothing to do and nothing touched.** No frame or line in A12 prints a count of designs; the numbers here are people (one to twenty-four), pixels and characters. No number was added. |
| **P0's per-prop mark allowlist** | **Not this document.** The allowlist lives in P0 and was edited in the repository; nothing in A12 restates it, and nothing here was written that could soften it. |
| **The two free designs are the owner's choice** | **Unchanged and still open.** `**[Free] designs:** 1 Grid · 10 Directory` stands in §0 as the recommendation; the question is marked **OPEN FOR THE OWNER** below. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15.** Fifteen designs, no gaps, nothing renumbered, nothing reused, nothing deleted. |

### Housekeeping · the Open questions section

**QUESTION 1** is genuinely still open and is marked **OPEN FOR THE OWNER** on its own line. **QUESTION 2 is struck through: settled by the owner in the pass-two ruling of 31 August 2026** — keep the three named values — and the ruling is written into the shared floor rather than left in a list of things nobody has answered. Neither question was answered by this document.

### Open questions raised by this pass

1. **OPEN QUESTION — does the greying rule cover a value switched off by the count of the content, or only by another control?** Two of A12's five cases are switched off by a control (Title size at head None, Large 96 at Count Five, Medium 72 at Count Eight, Bio opens at Count Five). **11 Slim's Spaced above sixteen people is switched off by how many people are authored, not by a control.** It is written as greyed with the reason beside it, because a control that silently ignores you is the thing the rule rules out, but the rule as given speaks of a control switched off *by another*. If it is control-only, 11 Slim's case comes back out.
2. **OPEN QUESTION — four lines outside 13 Rail's responsive note still say a section "draws as 1 Grid".** The work list named one line, and one line was changed. Three of the four were panel counters whose own spec already carries the corrected sentence, so they were aligned to it rather than rewritten on a guess — **6 Portraits** ("add a fourth person and the cells keep wrapping at three across, 1 Grid advised in the panel"), **8 Founder** ("the first is drawn with the rest held, 1 Grid advised") and **13 Rail's** own count line ("the rail rests as a row with its arrows and fades hidden, 1 Grid advised"). **The fourth was left alone: 15 Groups' Ghost-mode sentence** — "Ghost has no group field, so at Source Ghost authors every author lands in the unlabelled block and the section draws as 1 Grid" — which appears on the frame and in this document, and where no corrected wording exists anywhere to align to. Describing the result would mean writing a new sentence about what a groupless 15 Groups is, and that is a decision rather than a correction. **Closed in pass five, 3 September 2026:** the work list named the sentence and supplied the rule, so it now describes the arrangement — one block of cards with no group headings — with 1 Grid as advice only.
3. **OPEN QUESTION — 13 Rail's Counts bullet still calls the fits-the-width case "a width, not a total".** The measured precondition was withdrawn in the previous pass and the naming is fixed in this one, but that bullet still describes the case in the precondition's vocabulary. It names no design, so it was left alone rather than rewritten on a guess.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** — fifteen designs in A12, no gap, no renumbering, nothing added or removed in this pass.
2. **The `**[Free] designs:**` line is present** in §0, on its own line, and names **1 Grid** and **10 Directory** — both of which exist in this category's roster of fifteen. It remains the recommendation, awaiting the owner's confirmation.

---

## Patch notes — pass five · Image focus becomes one shared control, 3 September 2026

Every change below carries the **name** of the rule that required it. Rules are named, never numbered.
**Two work items reached this category.** The first finishes what pass four started: Image focus was
never a shared control — two dozen category specs each wrote out their own copy of its values, and A12
held one of them, restated in the shared floor, in four design sections and on all sixteen frames. It is
now defined once, in **P0·9**, and it carries **both axes**; this category cites that definition and
enumerates nothing. The second is 15 Groups' Ghost-mode sentence, left alone in pass two because no
corrected wording existed to align it to; 13 Rail's correction now provides one.

**Frames changed — all sixteen.** `A12-0 Category Proof` and `A12-1 Grid` · `A12-2 Cards` ·
`A12-3 Rows` · `A12-4 Story and Team` · `A12-5 Split Head` · `A12-6 Portraits` ·
`A12-7 Contrast Band` · `A12-8 Founder` · `A12-9 Faces` · `A12-10 Directory` · `A12-11 Slim` ·
`A12-12 Big Type` · `A12-13 Rail` · `A12-14 Reveal` · `A12-15 Groups`. In fourteen of them the item
group's Image focus sentence stops listing the values and cites P0·9; `A12-10` has no enumeration to
remove and gains the citation only; `A12-0`'s settlement 6 is rewritten the same way. **`A12-6` is the
one frame whose drawing changed:** its Image focus strip drew three tiles on one axis and a fourth panel
flagging the case it could not answer, and it now draws **two axes, three tiles each**, the second
labelled as the owner's ruling. **No panel gained or lost a row, no control changed its name, values or
default, no primary section frame was redrawn, and no photo ladder, spacing value, type scale or colour
moved** — Image focus is not a panel row in A12 at all: it lives in the Image Picker's popover on the
image it belongs to.

### What changed, and the rule that required it

| Rule (by name) | Change |
|---|---|
| One control name means one set of values | **The shared floor's photo-families paragraph no longer enumerates the focus values.** It names the control, names the slots it sits under — every `photo`, and 4 Story and Team's section `image` — and cites **P0·9** for what the values are. |
| One control name means one set of values | **§0 gains the category's one Image focus paragraph**, by reference: what the control is, whose it is, which slots carry it in A12, that no design here narrows an axis, that Ghost never sees it, and that the values live in P0·9. |
| One control name means one set of values | **The three remaining enumerations in the design sections are removed** — 6 Portraits (twice, in its Items block and in its controls prose) and the shared floor's — and 8 Founder, 10 Directory and 13 Rail, which named the control without listing it, now cite P0·9 in the same words. |
| One control name means one set of values | **The side-to-side axis is in force here by reference rather than by restatement.** A12's old text carried the up-and-down values only. Nothing in this category narrows either axis, so both are in force wherever a photograph is drawn, and the wording is P0·9's, so the next change to it reaches A12 without an edit. |
| One control name means one set of values | **"Ghost never sees this" is written in** — once in §0, once on `A12-0`, and once in each frame's item group. Focus is a hint the compiler resolves into the crop the theme emits: never a field, never a binding, never a template variable, which is also why it declares no module and degrades nowhere. This category had said it only obliquely, in "Image focus is stored the same way" on the Ghost card. |
| One control name means one set of values | **P0·9's per-slot rule is applied where A12 has two slots.** 4 Story and Team draws **two Image focus controls** — one under the group photograph, one under each person's — and never one for the section. Written into §4 and onto `A12-4`. |
| A design may offer fewer choices on a shared control, and must say why | **No subject in A12, and it is stated rather than left silent.** No design narrows an axis and no design offers a different set from another; all fourteen that draw a photograph carry the whole control on both axes. |
| The architect's open findings are settled where a ruling settles them | **Finding 5 — "the Image focus vocabulary is short a horizontal axis" — is struck through and marked settled**, with the ruling's date, in §0's findings list, in the Reconciliation notes and on `A12-0`, `A12-6` and every frame that carried the ARCHITECT flag in its item group. The old text is kept for the record rather than deleted. |
| A control that could never do anything here is not drawn, and the panel says why | **Not applied, and it is one of this pass's two open items — see OPEN FOR THE OWNER.** 10 Directory draws no photograph at any setting, so focus could never do anything there, but its treatment predates the ruling and P0·9's note is written for a design that *places* a photograph at its own shape rather than one that draws none. Left exactly as found. |
| One design must not name another | **15 Groups' Ghost-mode sentence describes the arrangement instead.** "Ghost has no group field, so at Source Ghost every author lands in the unlabelled block and the section draws as 1 Grid" now reads: every author lands in the unlabelled block — **one block of cards with no group headings, still 15 Groups** — and 1 Grid may be **advised** in the panel, never switched to. Changed in the Items block, in the Data line and on `A12-15` in three places: the Data toggle's note, the spec card and the reconciled Data paragraph. **This closes pass two's open question 2**, which left the line alone for want of corrected wording; 13 Rail's correction is the wording it is aligned to. |
| One design must not name another | **The same sentence's two dependants are aligned to it, rather than left contradicting it.** The Limit note — "the Limit follows 1 Grid's range because 1 Grid is what renders" — now reads that the Limit keeps its **1-to-12 range, the range that block is drawn at**; and the Zero bullet's "no groups at all, or one group for everybody, is not zero — **it is 1 Grid**" now names the arrangement, with 1 Grid advised. No range, count or behaviour changed. |
| One design must not name another | **15 Groups' Flagged list drops "handing off to 1 Grid at Source Ghost"** for "the single unlabelled block at Source Ghost" — the same item, named by what it is. |
| Printed design totals stay out of product copy | **Honoured, and nothing written.** No design total — old, corrected or computed — appears in any copy authored in this pass. The numbers here are people (one to twenty-four), pixels, characters and this category's own fifteen designs, none of which is a library total. |
| The marketing and app screens' design total | **Untouched.** A repository edit, re-applied after export and checked independently. A12 holds no copy of that copy and nothing in this pass went near it. |
| P0's per-prop mark allowlist | **Not touched.** It is not in this project's copy of P0's specification, and this pass opened P0 only to read P0·9's definition. |
| Numbering | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15.** Nothing renumbered, renamed, added or removed. |

### What the pass was asked to check, and found unchanged

- **The roster, with [Free] marked** — unchanged, restated in full: **1 Grid [Free]** · 2 Cards ·
  3 Rows · 4 Story and Team · 5 Split Head · 6 Portraits · 7 Contrast Band · 8 Founder · 9 Faces ·
  **10 Directory [Free]** · 11 Slim · 12 Big Type · 13 Rail · 14 Reveal · 15 Groups. The pair is the
  recommendation of 28 August 2026 and the owner's confirmation is still open; this pass did not reopen it.
- **The control lists** — unchanged. No control was added, removed, renamed or re-valued on any of the
  fifteen; every "N controls of its own" count, every Quick Controls line, every lock and every greyed
  value stands as drawn. Image focus is neither new nor changed here — only the sentence describing it,
  and it was never a panel row in A12.
- **The data fields** — unchanged: the sixteen shared fields, `people[]` with `name`, `role`, `bio`,
  `photo`, `url`, `group` and `socials[]`, and `image`/`imageAlt` read by 4 Story and Team alone.
  **Focus adds no field:** it is a compiler hint, now said in those words, and the per-author storage
  against the slug is unchanged.
- **The no-JavaScript line per design** — unchanged, all fifteen. Nothing about focus runs, so nothing
  about it degrades: thirteen designs are pixel-identical with script off, 13 Rail scrolls natively with
  its arrows and fades absent, and 14 Reveal draws every bio open in its own card.
- **The behaviour each design declares** — unchanged: `carousel` on **13 Rail**, `accordion` on
  **14 Reveal**, **none** on the other thirteen, with `core` assumed rather than declared. Focus declares
  no module and needs none.

### OPEN FOR THE OWNER

- **OPEN FOR THE OWNER — is 10 Directory a third member of the never-offered category, or the second one
  again?** What I would have needed to know: whether *a control that could never do anything here is not
  drawn, and the panel says why* reaches a design that **draws no photograph at all**. P0·9 names one
  cropping-side case — a design that *places* a photograph at its own shape — and P0 says outright that a
  category believing it has a third member puts it to the owner rather than drawing it. 10 Directory stores
  `photo` and draws it at no setting, so nothing is cropped, but the note P0·9 supplies ("This design places
  your photograph at its own shape…") would be false here and I will not reword a shared note on my own
  reading. What I did instead: **left the treatment exactly as found** — the field present, saying it has no
  effect at any setting — added P0·9's citation, and wrote the question here and on `A12-10`. If the answer
  is "not drawn", the change is one sentence on one frame and one line in §10.
- **OPEN FOR THE OWNER — does 11 Slim's 32 px circle deserve a narrowed axis?** What I would have needed to
  know: whether an overlapping row of 32 px faces, where a neighbour covers part of each circle, is a case
  for offering fewer values with the reason shown. I could argue it either way and the work list says a
  constraint must be a design decision rather than a private copy. What I did instead: **treated it as no
  constraint** — the whole control on both axes, as everywhere else in A12 — because narrowing it would be
  a new decision and nothing in the category has ever narrowed this control.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** — fifteen
  designs in A12, no gap, nothing renumbered, renamed, added or removed.
- **The `**[Free] designs:**` line is present** in §0, on its own line, and names **1 Grid** and
  **10 Directory** — both of which exist in this category's roster of fifteen.
