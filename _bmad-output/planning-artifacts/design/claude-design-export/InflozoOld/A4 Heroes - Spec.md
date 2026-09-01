# A4 Heroes — written specification

17 designs, numbered 1–14 and 16–18 · Paper pack · drawn in this project as `A4-1 Centred.dc.html` … `A4-18 Overlap Card.dc.html`, with the category's shared artefacts in `A4-0 Category Proof.dc.html`. **15 Search is deleted and its number is retired — the gap is permanent and is never closed or reused.**

Read `A4-0` first. It carries the four settlements §8 asks A4 to make, the rules all seventeen share, the type and action ladders, the roster, the shared field list, the tokenisation proof across three packs, and the category stress frame. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated seventeen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**.

**Specification-only pass, this session.** Every design now carries four added fields — descriptor, structural descriptor, archetype, behaviour module — at the head of its section, above its content fields. Nothing drawn changed, no frame moved, and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand as written. **No module rename was needed.** This document had named no modules at all — it wrote behaviour as motion and state rather than as JavaScript — so nothing here had to be corrected against the fixed 31-module registry (FR-G7). Every module name below is the registry's, and every no-JS sentence is quoted from it rather than composed here.

**Second specification-only pass: the item controls.** The category's one repeater — **`proof[]`, the 0–3 authored pairs only 2 Flush Left draws** — now carries its controls in full: where the list sits in the panel, what Add produces, what Remove does at the floor, whether order means anything, the counts the row is designed for and what it does outside them, and which fields inside a pair are editable. **The other sixteen designs carry no repeater at all**, and each says so in one line rather than leaving it to be inferred. Nothing drawn changed in this pass either, and no earlier field was rewritten.

**Third pass — the controls-reconciliation patch (this document's current state), 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface, reusing the shared **P0 editor primitives by name** — the P0·1 inline toolbar and link popover, the P0·2 icon slots and Icon Picker, the P0·3 item controls, the P0·4 member-aware action editor, the P0·5 populate-from panel, the P0·6 state switcher — never redesigning them. Every design gains the universal trio outside its own list and Member visibility; every Padding and Ground row is retired into the trio; per-design items landed on 2, 4, 7, 8, 9, 10, 11, 13, 14 and 16 (15's items are void — the design is deleted). No layout was redesigned. Where this pass conflicts with an earlier ruling, the conflict is recorded — one line each — in the closing **Reconciliation notes**, which open with every frame changed.

**Fourth pass — the design patch pass and its confirmation (this document's current state), 28 August 2026.** The ten library-wide rules were applied to the category and then read back, one rule against each of the seventeen designs. What the first sitting changed, what the confirmation sitting finished, and where a rule had nothing to change are all in the closing **Patch notes**, by rule name. Rules are named there and throughout, never numbered. Nothing was redesigned in either sitting: the visual language, type scale, colour packs, spacing system and numbering all stand, and the changes are captions, notes, empty states and spec sentences.

**A4 uses three modules after this pass.** `video-facade` on **10 Video Poster**; `member-form` on **11 Subscribe**, with `countdown` beside it at that design's Deadline line value. ~~`search-overlay` on 15 Search~~ is **void with the design** (the deletion of design 15 Search). Kept for the record: it had been the pass's one module correction, because Ghost has no server-rendered search results and the earlier real-GET-form ruling was a fake results page by another name. **Fourteen of the seventeen declare nothing at all**, which is what a hero should be: the headline, sub, actions, picture, quotation, post, count and field are all in the HTML before any script runs, so **no A4 design loses content without JavaScript** — 15 included, whose no-JS state is the field plus a link to the archive.

**`core` is assumed, not declared per design.** The one place in A4 keyed off `.js-enabled` is 14 Full Height's scroll cue, and `core`'s own line covers it: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than seventeen times. *Flagged: not listing it per design is mine, as it was in A3.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. All four are edit-safe, which is why every frame in A4 is a resting state — the poster drawn as a still, the form empty, the deadline static, the overlay closed. States that never show at rest — 11's four form states and its signed-in state, 15's typed and submitted states — are reached with the P0·6 state switcher and the top bar's View as, never a sidebar preview control; A4 had no “Preview” control to remove, and none was added.

**Two findings and one repeat**, at the end: 10's `<button>`/`<a href>` disagreement with `video-facade`, 14's scroll cue having no module at all, and 6's Fill width, which is A3·7's clamp finding in a second place.

---

## 0. The shared floor

### 0·0 · What the design patch pass changed category-wide

- **Design 15 Search is deleted** (the deletion of design 15 Search), and **A23 Search with it** (the deletion of the Search category). Its subject — "a field that never renders a result" — is now any hero action pointed at **Ghost search** through the link picker's new destination. **No A4 design draws a search affordance**, `search-overlay` leaves the category, and `searchPlaceholder` leaves the shared field list. **Numbering runs 1–14 and 16–18; 15 stays retired** (the numbering rule).
- **No design ever turns into another design.** **6 Big Type**'s four-line cap no longer switches to 1 Centred: the scale steps down toward the clamp's **64 px floor**, and at the floor **the cap lifts** and the headline takes the lines it needs — **confirmed by the owner, 28 August 2026: do not cut the headline** — the same answer given for the Footers category's big-type design. **18 Overlap Card** with no image no longer becomes 2 Flush Left: **the card lands on the page's ground**, radius, shadow and inset dropped. **12 Offset Image** reaches 3 Split's geometry below 1081 by its own media query, not by becoming it. Descriptors that described a design as "the arrangement others resolve to" are rewritten. **Completed in the confirmation pass:** the phrases that survived in the frames and in the empty states of **3 Split, 4 Full Bleed, 5 Image Under, 10 Video Poster, 13 Latest Post, 14 Full Height** and **2 Flush Left**'s 1024 rule are gone; each design now names its own state — the picture's column closes up, the band leaves, the flat contrast panel is drawn — and the word "fall-back" is used for a missing *field*, never for a missing design. **A4-0**'s no-image table and roster are rewritten with it.
- **Header modes are unaffected, and A1·4 is corrected with them.** A design's Overlap or Below mode is still a property of the design. What changed is the header's end: with no full-width picture, **A1·4 renders on its own ground** — its own no-image state — rather than becoming A1·1 Rail (the rule that no design ever turns into another design, and the ruling on A1 Headers' overlay design: the precondition is read at build time, never in the browser).
- **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript.** **11 Subscribe** is the category's only form. It does not render with self-signup off or members disabled; a paid ask needs a payment provider; every Portal link does nothing with JavaScript off. Its field controls stay disabled with the reason. **Extended in the confirmation pass to all seventeen:** any design's primary or secondary action may be pointed at a Portal action, so the rule cannot end at 11. The action editor carries both notes on any action whose destination is signup, signin or a paid tier — it does not render where the connected site cannot support it, and with JavaScript off the pop-up does not open. Written once into the shared floor below rather than seventeen times. **Confirmed by the owner, 28 August 2026: the notes appear on the action's own editor, and only when its destination is a Portal action** — signup, signin or a paid tier. A design whose actions point at ordinary URLs carries neither note, so the warning is shown exactly where it is true.
- **The no-JavaScript notice.** **11 is the only design with a field**, so it is the only one that draws the notice — at the form row's own height, 46 px above 767 and 48 px at ≤ 767, so the hero's height is unchanged. Its **five states stay exactly as drawn**.
- **A design may offer fewer choices on a shared control, and must say why.** 11's email-field override is **Site defaults · This section only**. Universals may narrow with a reason — 4, 9, 10 and 14 lock Background role, 16 narrows Attribution on the contrast ground — and may never be renamed or extended. The swatch row is **Base**.
- **The Remove button never greys out.** **A4 has one repeater — 2 Flush Left's proof pairs — and it has no minimum**: zero pairs is a legal state, drawn as the row's absence. Remove is therefore always visible and always clickable, and there is no floor for it to defend. **Corrected in the confirmation pass:** the earlier note claimed Remove is held active "at the floor" on 2's pairs and on 13's hand-picked list, and answered it with "a proof row needs at least one pair" — which contradicts 2's own stated zero state, and 13 has no repeater at all (its post comes from Ghost's query, with no Add and no Remove). Both claims are withdrawn. **Confirmed by the owner, 28 August 2026: zero pairs stays legal** — the row simply disappears and the hero still reads, so no minimum is introduced and Remove never needs to refuse.
- **Item counts are a number picker.** **No count in A4 is drawn as a row of fixed buttons**, so nothing had to be replaced. 2's proof pairs are an authored list with Add pair and a per-row Remove, capped at three with the reason shown and A10 Stats and Numbers named; 13's Which post is a single pick from Ghost, not a count. **Corrected:** the earlier note called 13's hand-picked posts a stepper. They are one post, picked.
- **Avatars with no photograph.** **16 Pull Quote's portrait placeholder shows one letter** — the first letter of the typed name (“Maya Okonjo” → M). The pass had kept two initials on the reading that a typed name can supply both; **the owner ruled on 28 August 2026 for one letter everywhere**, so the library carries one rule with no exception to explain. Nothing in A4 renders a Ghost author, so this is the only avatar in the category.
- **Member counts.** 2's Member count pairs and 11's count render Ghost's `{{total_members}}` **verbatim, already rounded** ("1,200+"); no copy may imply an exact figure.
- **Two rules had nothing to change here, and that is recorded rather than assumed.** **Slider labels:** A4 draws no slider — every control is a named-value row, and each row's title says what it affects while its values reuse the standard words (Card padding: Compact · Comfortable · Spacious). **Gap names:** A4 has no gap control; the one spacing ladder is the universal Vertical spacing, whose values are Compact · Comfortable · Spacious, so there is no Tight/Even/Airy anywhere to replace.
- **Ctrl-K is unbound.** `command-palette` was never A4's; recorded.
- **The two free designs were put to the owner in the correction pass** as a five-design shortlist — 1 Centred, 17 Slim, 2 Flush Left, 7 Masthead, 9 Contrast Band, all picture-free — and **decided by him on 28 August 2026: 1 Centred and 17 Slim**. They cover two different jobs, a front-page hero and an interior page title, where 1 and 2 cover the same job twice. **The earlier suggestion of 1 Centred and 2 Flush Left is withdrawn.**

**[Free] designs:** 1 Centred · 17 Slim

Everything in this section applies to all seventeen unless a design says otherwise.

**Colour.** Role tokens only — `background`, `surface`, `text`, `text-muted`, `border`, `accent`, `contrast`. Accent appears once or twice per section: the primary action, an active state. Never as decoration.

**Type ladder.** Eyebrow 13 px uppercase tracked `.08em` in `text-muted`. Headline in the pack's heading font at Medium 48 / Large 60 / Display 76 on desktop, 40 / 44 / 48 at 834, 30 / 34 / 38 at 390. Sub 19 px desktop, 18 px at 834, 17 px at 390 — the 17 px floor is absolute. Meta 13–14 px muted. Action labels 15 px desktop, 16 px on a phone.

**Action ladder.** Primary is A1·1's button at hero scale — accent fill, 15 px/600, padding 13×22, 46 px tall, the pack radius. **Flagged as a departure** from A1·1's own 14 px/600 and 9×17, which the header in every frame keeps: the two sizes coexist deliberately, the smaller one in the header and the larger in the hero. The bordered secondary is new to A4 and carries forward from here: surface fill, one hairline, the same metrics less the border's pixel. A1's muted ghost action is not used in a hero. Two actions maximum — a third is refused with A6 CTA Banners named. On a phone both actions stay: side by side where the labels fit a 350 px measure, stacked full width at 48 px where they do not. **The actions never leave at any width.**

**The Actions control**, on every design that has one, is **Both · Primary · None** — those three words, as drawn. Where an entry below writes “Primary only” it means the panel's **Primary**.

**The universal trio — this pass.** Every placeable section carries three controls **outside its own list**: **Background role** (Background · Surface · Contrast), **Vertical spacing** (Compact · Comfortable · Spacious) and **Top divider** (None · Line · Fade — default None on every hero; the header above already ends in a rule). The old per-design Padding and Ground rows were this trio under other names and are retired everywhere. Vertical spacing resolves 64 · 96 · 132 at 1440 (80 at 834, 64 at 390) unless a design names its own resolution — **9 Contrast Band** 44 · 64 · 88, **14 Full Height** 56 · 88 · 120, **17 Slim** 36 · 56 · 80 — a departure survives as a resolution, never a duplicate row. Genuinely different ladders keep their own names: **8 Card**'s Card padding and Inset (Vertical spacing locked there, reason shown) and **18 Overlap Card**'s Overlap (locked there too). A design whose ground is its identity locks Background role with the reason shown: **9** at Contrast, and the three image grounds **4**, **10**, **14**.

**Member visibility.** Every design carries Member visibility — Everyone · Logged out · Free members · Paid members — except **11 Subscribe**, whose richer signed-in model subsumes it. It hides the whole section; one action's audience is P0·4's member-aware editor, and the two are scope-tagged apart, as P0·4 draws. Where an action's target is a Portal action (signup / signin), the P0·4 per-state editor — show / label / link per audience — is offered on that action, the same model as A1's header actions. **Two notes travel with that destination — on the action's own editor, and only where the destination is a Portal action** (the rule that member buttons are conditional): the action **does not render when the connected site cannot support it** — self-signup switched off, members disabled, or, for a paid tier, no payment provider connected — and **with JavaScript off, Ghost's sign-up pop-up does not open**, so nothing happens when the button is pressed. Where a site owner wants the ask to work without script, the honest destination is the signup *page*, not the pop-up, and the editor says so at the field. No design in A4 claims that anything can be subscribed to without JavaScript.

**Editing.** Every visible authored text edits inline with the P0·1 toolbar — bold, italic, underline, link, with the link popover's open-in-new-tab and rel nofollow / noreferrer / sponsored options. Ghost-owned content — the site title, site description, post titles, tags, dates, member counts — is never inline-editable: clicking it shows the plain-text lock pill and “Edit in Ghost”. Every URL field opens the Ghost-aware Link Picker. Every button accepts an optional icon before or after its label from the P0·2 Icon Picker (always Small, label-coloured).

**Image fields.** Every image field carries **Image focus** (Centre · Top · Bottom), reachable from the Image Picker popover — never a hidden field, and no longer a panel row anywhere: 4's old Picture focus row retires into the popover. On a post or page canvas, the pictures of **3, 5, 12, 14 and 18** default to the post's feature image with the source named — 18's rule, extended; no re-upload.

**Visitor-facing strings.** No fixed English ships. Per string: editable fields with defaults — 11's five `email*` fields and its members line, 14's cue label (“Read on”), 15's placeholder and note, 16's attribution; theme translation-catalog strings — 11's invalid-state wording, 13's “Latest” label and “Members only” marker, 15's “Clear search”, 17's count grammar with its plural forms.

**Page margin.** 72 px at 1440, 40 px at 834, 20 px at 390.

**Breakpoints.** Desktop 1441+ and 1440–1081 · tablet 1080–768 · phone ≤ 767. A design that changes arrangement at a width states the width in words.

**Heading structure.** The authored headline is the page's `<h1>`. The eyebrow is a `<p>` above it, never a heading. The section itself is unlabelled — a hero is the top of the page, not a named region. 16 Pull Quote and 13 Latest Post state their own variations; 17 Slim states the heading contract with the section below it.

**Imagery.** Striped placeholder in the frames, with a mono caption naming the crop. `alt` empty by default wherever words sit over or beside the picture; authorable in every case. Hero pictures are `loading="eager"` with high fetch priority and explicit dimensions.

**Motion.** 160 ms ease-out, one transition per state change. No entrance animation, no parallax, no autoplay, no carousel. Thresholds are unchanged under reduced motion; where a design animates anything it says what reduced motion removes.

**Empty headline.** The section does not render and the editor names the field it needs. The one exception is 16 Pull Quote, where the quotation carries the page instead.

**Content.** Orbit Weekly throughout. Every number a site owner sees — issue numbers, post counts, durations, reader counts — is typed by them unless a design says it comes from Ghost. After this pass two Ghost numbers are named: 2's proof values at Value source: Member count, and 11's Show member count — both render `{{total_members}}` exactly as Ghost sends it, a pre-rounded string like “1,200+”, display only, never re-formatted, counted or animated.

**The item list.** One repeater exists in A4: **`proof[]`, read by 2 Flush Left alone** — 0–3 pairs of `value` (≤ 8) and `label` (≤ 24), both authored — though a pair's value may bind Ghost's member count (2's Value source, this pass); the label stays authored. **No other design in the category repeats a unit.** The eyebrow, headline, sub and note are single fields; **the action pair is two named fields rather than a list**, so there is no Add action and a third is refused with A6 named; and 4, 5, 12 and 18's photographs are one field each, not a gallery, which is A24's. **13 Latest Post's post is not an item either** — it comes from Ghost's own query, so it has no Add and no Remove, and Which post and Card style are its controls, the same reading A7 takes of its tiers. Fields a design does not draw are kept rather than cleared, `proof[]` included: switching from 2 to any other design keeps the pairs, and switching back draws them again. *Flagged: the keep-on-switch rule is mine, as it was in A2.*

**Two rules about item controls, and they are architectural rather than stylistic.** (1) **A design control writes one value onto the section and the stylesheet reads it, so it applies to every pair at once.** "Set pair 2 larger", "give the first pair the accent" and "centre only the third" are not expressible by construction; a hero with one number louder than its neighbours has one number, and that number is the headline or A10's design. (2) **Inside a pair the user edits content only** — its value and its label. Never its size, weight, alignment, colour or the gap around it. Selecting a pair on the canvas gives those two text fields and nothing else.

**Zero items** is 2's own empty state in item terms: the row is absent, not a set of zeros, and the rest of the design renders unchanged.

---

## 1. Centred

The whole set centred on a 720 px measure with no picture. The category's floor: every other design is a departure from this one, and the type and action ladders above are established here.

**Descriptor.** The category's floor — the whole set centred on a measure with no picture and nothing added to it, the arrangement 5 Image Under's own no-band state resembles, and the design the type and action ladders are established on.

**Structural descriptor.** `stack · none · page · none · none · centred 720 px measure`

**Archetype.** stack

**Behaviour module.** **none.** Eyebrow, headline, sub, note and the two links are server-rendered, and every state in the design is a CSS hover or focus. **JS off:** identical — the plainest arrangement in the category has nothing that could degrade.

**Items.** No repeater: eyebrow, headline, sub, note and the two actions are single fields, and a third action is A6's. `proof[]` is kept if authored on 2 and not drawn here.

**Fields.** `eyebrow` · `headline` (req) · `sub` · `primaryAction` · `secondaryAction` · `note`.

**Controls.**

| Control | Values |
|---|---|
| Measure | Narrow 620 · Medium 720 · Wide 860 (less if the window is narrower) |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Actions | Both · Primary · None |
| Note under the actions | Show · Hide |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role; Vertical spacing resolving 64 · 96 · 132; Top divider default None. Padding and Ground retired into the trio.

**Responsive.** Measure at its named width down to 1081; at 834 the measure is the column minus margins and the actions stay on one row; at ≤ 767 the set is left-aligned, not centred, and the actions go side by side or stack.

**Empty.** Any optional field absent takes its gap with it. The floor is a headline alone.

**a11y.** The shared floor, unmodified. Nothing here is interactive but the two actions.

**Flagged.** The three measures, the 720 px default, and the left-alignment rule on a phone.

---

## 2. Flush Left

1 Centred's set moved to the left margin on a half measure, the right half deliberately empty, with an optional proof row under the actions.

**Descriptor.** The only design that leaves half its width deliberately empty, and the only one carrying authored proof pairs — the arrangement 3, 13 and 18 each approach in their own no-picture states, none of which switch design (the rule that no design ever turns into another design), when their picture is absent.

**Structural descriptor.** `stack · none · page · few · none · deliberately empty right half`

**Archetype.** stack

**Behaviour module.** **none.** The proof pairs are typed and rendered as static text. `count-up` is the near miss and is deliberately not declared — its own no-JS branch says the final value “renders as static text — it is already in the HTML before JS ever runs”, which is what this design draws at every moment; animating three authored pairs is A10's question, not a hero's. **JS off:** identical.

**Items.** `proof[]` — **the category's only repeater**, and this is the design that draws it: 0–3 pairs of `value` (≤ 8) and `label` (≤ 24), authored, nothing from Ghost.

- **Where the controls sit.** A **Proof pairs** list directly under the **Below the sub** control, shown only at that control's **Proof row** value — one row per pair with a drag handle and a remove action, and **Add pair** at the foot of the list. Selecting a pair on the canvas selects its row and opens its two fields, which nothing prevents because nothing in this design moves while it is edited. Keyboard: ⌥↑ / ⌥↓ moves the focused row.
- **Add.** **Add pair** lands **last**, the right end of the row, and arrives carrying content rather than an empty shell: value **"2,400"**, label **"subscribers"**, with the value selected for typing. Disabled at three with the reason shown and **A10 Stats and Numbers named** — three pairs is this design's cap, not a soft limit.
- **Remove.** On the row, undoable, and **never disabled**: zero pairs is a legal state here, so there is no minimum to defend. Removing the last pair leaves the row absent and the set standing, which is the design at **Below the sub: Nothing** anyway. **The control does not quietly move to Note** — it stays at Proof row and the sidebar says the list is empty, because a control that changed itself would hide the fact that three pairs were just deleted.
- **Reorder.** Drag; authored order is drawn order — left to right in the row, top to bottom in the single column at ≤ 767. **Order is meaningful to read and load-bearing for nothing**: no slot is larger, accented or emphasised, so moving a pair changes the reading sequence and nothing else. Said plainly rather than implying a hierarchy the design does not draw — a first slot that carried the accent would be A2·15's shape and A10's question.
- **Counts.** Designed at **three**. The row is a three-column grid on the text block's measure, so **two pairs fill the left two columns and leave the third empty rather than widening**, and **one pair sits in the first column**, its value's left edge on the headline's. A value's left edge does not move with the count. Above three the repeater stops: Add is disabled, and a fourth pair authored on another design is kept, counted in the sidebar and not drawn. At ≤ 767 the three columns become three rows in the same order.
- **Zero.** The row is absent — **not a set of zeros, not placeholder pairs, not three empty cells** — the gap under the sub closes with it, and the rest of the design renders unchanged. This is the design's stated empty state, reached by emptying the list.
- **Inside a pair.** `value` and `label`, both editable, **both required**: there is no optional field inside a proof pair, because a number with no label means nothing and a label with no number is a word. A pair missing either is **not drawn**, and the sidebar names the row rather than rendering half of it. No link, no picture, no icon — a proof pair is two strings. Size, weight, alignment, colour and the gap between pairs are section values, so **a pair cannot be made larger than its neighbours by construction**; the design that needs that is A10's.
- **Value source — this pass.** Per pair: **Typed · Member count.** At Member count the pair's value renders `{{total_members}}` — Ghost's own pre-rounded string (“1,200+”), verbatim, display only, never re-formatted, counted or animated; the label stays authored (“subscribers”). The earlier spec flagged the proof row as an open invention and its “2,400 subscribers” sample is exactly this hookup. With members disabled in Ghost the source is disabled with the reason shown and the pair renders its typed value instead (the rule that member buttons are conditional). `count-up` stays undeclared — the value is static text either way.

*Flagged, this pass: the placeholder pair's content, the fill-from-the-left grid rule, leaving the control at Proof row over an empty list, and both fields being required.*

**Fields.** As 1, plus `proof[]` — 0–3 rows of value ≤ 8 characters and label ≤ 24, authored; each pair carries `valueSource` (typed · member-count).

**Controls.**

| Control | Values |
|---|---|
| Text block width | Half 620 · Two-thirds 780 (the right side stays empty either way) |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Below the sub | Note · Proof row · Nothing |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role; Vertical spacing resolving 64 · 96 · 132; Top divider default None.

**Note and the proof row share one slot** rather than taking two controls, which is what keeps this design at five plus the universal trio.

**Responsive.** The set holds its measure at the left margin at every width above 767; the empty right half simply narrows. At ≤ 767 the proof row goes from three columns to a single column of three rows.

**Empty.** No proof rows authored → the row is absent, not a set of zeros. A10 Stats and Numbers owns any richer treatment; three pairs is the cap here.

**Flagged.** The three-pair cap, the two named widths, the shared slot under the sub, and the decision that the proof row is authored rather than pulled from Ghost.

---

## 3. Split

Text on seven columns, one picture on five, both on the page's own ground. The design that settles the two-column hero, and the geometry 10, 11 and 13 all borrow.

**Descriptor.** The design that settles the two-column hero — text on seven columns, one contained 4:3 crop on five, both on the page's own ground — and the geometry 10, 11 and 13 borrow rather than restate.

**Structural descriptor.** `split · none · page · none · right · seven/five column geometry`

**Archetype.** split

**Behaviour module.** **none.** The picture, the framed-inset mount and the Picture side swap are CSS; the crop is a fixed aspect box on a server-rendered `<img>` with explicit dimensions. **JS off:** identical.

**Items.** No repeater — one picture in one fixed crop. `proof[]` kept, not drawn.

**Fields.** As 1, plus `image` · `imageAlt` · `imageFocus`.

**Controls.**

| Control | Values |
|---|---|
| Picture side | Right · Left (on a phone the picture is always under the text) |
| Picture | Flush · Framed inset (a mount for photographs with pale edges) |
| Headline size | Medium 48 · Large 60 · Display 76 (Display offered but not advised beside a picture) |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role; Vertical spacing resolving 64 · 96 · 132; Top divider default None.

**Image, this pass.** Image focus (Centre · Top · Bottom) joins the picture, in the Image Picker popover — never a hidden field. On a post or page canvas the picture defaults to the post's feature image with its source named, no re-upload — 18's rule, extended here.

**The crop is not a control.** It is fixed at 4:3, centred, from a picture 1200 px or wider.

**Responsive.** Seven and five on a 64 px gutter at 1440; six and six on a 40 px gutter at 834 with the headline at 40 and the actions stacked; one column at ≤ 767 with the picture between the sub and the actions.

**Empty.** No image → the picture's five columns close up, the text keeps its seven and the header is unchanged; still this design, per the rule that no design ever turns into another design. The picture is never replaced by a placeholder on a published site.

**Flagged.** The seven/five ratio, the fixed 4:3 crop, the framed-inset mount, and the picture's position between sub and actions on a phone.

---

## 4. Full Bleed

One 16:9 photograph edge to edge with the set over it, anchored to the lower third. A1·4 Overlay sits above it. Settles the scrim, the crop floor and the honest contrast limit for text on a picture.

**Descriptor.** The only design where the set sits on the photograph itself, and the design that settles the scrim, the crop floor and the honest contrast limit for text over an unknown picture.

**Structural descriptor.** `media frame · none · image · none · full-bleed · anchored to lower third`

**Archetype.** media frame

**Behaviour module.** **none.** Both scrims are CSS gradients, Picture focus compiles to `object-position`, and Over the picture moves elements between two server-rendered positions rather than at runtime. Not `lightbox` — the photograph is the section, not a thumbnail of anything. **JS off:** identical, scrims included, which is why the contrast argument in the accessibility field holds without script.

**Items.** No repeater. One photograph, not a gallery — a second picture here is A24's — and the two scrims are fixed values rather than a list.

**Fields.** `image` (2400 px or wider) · `imageAlt` · `eyebrow` · `headline` (req) · `sub` · `primaryAction` · `secondaryAction` · `pictureFocus`.

**Controls.**

| Control | Values |
|---|---|
| Text position | Bottom left · Centred (both sit in the lower third) |
| Over the picture | Everything · Headline and actions · Headline only |
| Scrim | Subtle · Standard · Strong |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Locked — the photograph is the ground, reason shown; with no image the section draws its own flat contrast panel |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (measured from the picture's bottom edge) |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role **locked** — the photograph is the ground, reason shown; with no image the section draws its own flat contrast panel, not another role. Vertical spacing resolving 64 · 96 · 132, still measured from the picture's bottom edge. Top divider default None. Picture focus leaves the panel for the Image Picker popover, where every image field now carries it.

**Over the picture** decides how much of the set sits on the photograph; what it drops moves below the picture onto the page's own ground, where the scrim is not needed and the contrast is a measured token pair. It is the control that lets a site with a busy photograph keep a legible sub.

**Scrim — a control this pass.** Subtle 45/22 · Standard 60/30 · Strong 75/40 — bottom value then top, over the fixed geometry (top over 100 px for the overlay header, bottom over 70% of the height for the set). **Standard is the old fixed pair and the default**, so an untouched site renders identically; Subtle is for an already-dark photograph that the fixed 60/30 could only darken further, Strong for a pale one. Dark mode steps each pair down as the fixed values did (Standard: 48/24). Never a heavy black gradient, still — Strong is the ceiling, and where even it cannot carry the sub, Over the picture moves the sub onto the page: a real fix rather than a darker scrim.

**Responsive.** Headline 60 / 44 / 34, margin 72 / 40 / 20, and the crop is the floor — the section is as tall as the picture at 16:9 or the set plus padding, whichever is greater.

**Empty.** No image → this design's own flat `contrast` panel, scrims removed, carried text at A3·5's values, and the header on its own ground — A1·4 Overlay's own no-image state.

**a11y.** Contrast is measured against the scrim, and the specification says plainly that a scrim cannot guarantee a ratio against an unknown photograph. Where a photograph cannot carry the sub, Over the picture moves it onto the page instead — a real fix rather than a darker scrim.

**Flagged.** All scrim values, the crop-as-floor rule, the three Over-the-picture values, and the honest contrast limit.

---

## 5. Image Under

The set centred above a wide band of picture, with a caption under it.

**Descriptor.** The only design that puts its whole picture below the set as a captioned band, so no word in it ever sits on a photograph.

**Structural descriptor.** `stack · none · page · none · bottom · captioned band beneath set`

**Archetype.** stack

**Behaviour module.** **none.** Band width, the 2.4:1 and 16:9 crops and the caption are CSS and markup. **JS off:** identical.

**Items.** No repeater — one band, one crop, one caption. A row of pictures under the set would be a gallery, which is A24's.

**Fields.** As 1, plus `image` · `imageAlt` · `imageFocus` · `imageCaption` (≤ 80).

**Controls.**

| Control | Values |
|---|---|
| Band width | Full bleed · Page margin (always full bleed on a phone) |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Caption under the band | Show · Hide |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (measured above the set) |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role; Vertical spacing resolving 64 · 96 · 132, measured above the set; Top divider default None.

**Image, this pass.** Image focus in the Image Picker popover; on a post or page canvas the band defaults to the post's feature image, source named. The caption edits inline with the P0·1 toolbar.

**The crop is fixed** at 2.4:1, and 16:9 on a phone — not a control.

**Responsive.** The band narrows with the page at Page margin and holds the page's full width at Full bleed; the crop goes 2.4:1 to 16:9 at ≤ 767, where the band is always full bleed. The caption stays 13 px muted under it at every width.

**Empty.** No image → band and caption leave and the set closes up on this design's own padding. No caption → the line is absent.

**Flagged.** The two band widths, the fixed 2.4:1 and 16:9 crops, and the 80-character caption cap.

---

## 6. Big Type

The headline set large enough to be the page, flush left across the whole measure. No eyebrow.

**Descriptor.** The only design whose headline size is measured rather than picked from the category's ladder, and the only one that drops the eyebrow field entirely.

**Structural descriptor.** `stack · none · page · none · none · headline at fill width`

**Archetype.** stack

**Behaviour module.** **none**, and this pass reads Fill width as a CSS clamp on the container — `clamp(64px, …cqw, 160px)` — rather than a measurement taken at build. The clamp is what lets the headline recompute under text zoom and never overflow, with no module involved. **If the build genuinely measures instead, this design needs script no registry module provides.** Confirm the clamp; it is A3·7's finding in a second place, and it is listed again at the end. **JS off:** identical.

**Items.** No repeater; the headline is the design.

**Fields.** `headline` (req) · `sub` · `primaryAction` · `secondaryAction`. No eyebrow field is offered on this design.

**Controls.**

| Control | Values |
|---|---|
| Headline scale | Display 76 · Huge 96 · Fill width (measured, between 64 and 160; always Fill width on a phone) |
| Sub under the rule | Show · Hide |
| Rule under the headline | Show · Hide |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role; Vertical spacing resolving 64 · 96 · 132; Top divider default None.

**Responsive.** Fill width is measured against the column, clamped between 64 and 160 px, and is forced on a phone. The headline's own scale is the design, so it is the one design whose type ladder is not the category's.

**Empty.** No sub authored, or Sub under the rule off → the rule is the last thing before the actions. The floor is a headline alone.

**Flagged.** The three scale values and the 64–160 clamp (the lifted cap itself is no longer flagged — the owner confirmed it), dropping the eyebrow entirely, and putting the sub below the rule rather than above it.

---

## 7. Masthead

The publication's nameplate at the top of its own front page: the site's name set large and centred over a rule, with an issue line under it.

**Descriptor.** The only design whose subject is the site's own name from Settings rather than an authored headline, held between rules with an issue line under it.

**Structural descriptor.** `stack · none · page · none · none · nameplate held between rules`

**Archetype.** stack

**Behaviour module.** **none.** The nameplate is Ghost's site title, the rules are borders and the issue line is typed. **JS off:** identical.

**Items.** No repeater. The nameplate is Ghost's site title, the issue line is one typed field, and the rules are borders rather than items.

**Fields.** Site title (from Ghost) · `headline` (req) · `sub` · `issueLine` (≤ 40, **flagged as invented** — Ghost has no issue number) · `primaryAction`.

**Controls.**

| Control | Values |
|---|---|
| Nameplate scale | Medium 56 · Large 72 · Huge 96 |
| Rules | Above and below · Below only · None |
| Issue line | Show · Hide |
| Issue line source | Typed · Latest post date |
| Standfirst source | Authored · Site description |
| Sub under the standfirst | Show · Hide |
| Actions | None · Primary (a masthead usually carries none, and there is no second action on this design) |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role — new; the masthead previously had no ground control at all. Vertical spacing resolving 64 · 96 · 132. Top divider default None — the design's own Rules stay its own control: they hold the nameplate, not the section's edge.

**Sources, this pass.** Issue line source: Typed keeps the authored `issueLine`; Latest post date renders the newest published post's date in its place — the typed field is kept, not cleared, so switching back loses nothing. Standfirst source: Authored is the `sub`; Site description renders the site's own description from Settings, plain-text-locked with P0·1's pill — edited in Ghost, never inline. The natural standfirst, as the audit put it.

**The nameplate is the site's title from Settings** and is not editable on the section.

**Responsive.** The nameplate steps down with the width and the rule holds its 1 px at every width.

**Empty.** No issue line → the rule closes up. No site title → the design is not offered, and the editor says the site needs a name.

**Flagged.** `issueLine` entirely, the three Rules values, the nameplate's 56/72/96 ladder, and the absence of a second action.

---

## 8. Card

The hero as a surface panel inset from the page's edges, page ground visible around it. A3·12's card geometry, at hero scale.

**Descriptor.** The only design that is a detached panel with the page ground visible around it, the only one whose padding is measured inside a card, and the only one where a phone control decides whether the card survives at all.

**Structural descriptor.** `stack · card · surface · none · none · card inset from edges`

**Archetype.** stack

**Behaviour module.** **none.** Inset, radius, card ground and the Full bleed value at 390 are all CSS. **JS off:** identical.

**Items.** No repeater — 1 Centred's set inside a card. Card padding and Inset are section values written onto the card, not onto anything within it.

**Fields.** As 1, plus `note`.

**Controls.**

| Control | Values |
|---|---|
| Card padding | Compact 48 · Comfortable 64 · Spacious 88 (one step above A3·12's 32 · 48 · 64, because a hero's card carries a headline; **flagged**) |
| Inset | Snug 16 · Comfortable 40 · Wide 72 at the sides and foot (A3·12's values reused unchanged; the gap under the header is always 24) |
| Card ground | Surface · Contrast |
| Alignment | Centred · Left |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Actions | Both · Primary · None |
| Card at 390 | Keep the card · Full bleed |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast (the ground behind the card; the card's own ground keeps its control) |
| Vertical spacing (universal) | Locked — Card padding measures inside the card and Inset around it, and a third ladder would fight both; reason shown |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role — the ground behind the card; the card's own ground keeps its control. Vertical spacing **locked** — Card padding measures inside the card and Inset around it, and a third ladder would fight both; reason shown. Top divider default None.

**Alignment, this pass.** Centred · Left — A6's card design carries it, and no left-aligned sibling exists in A4 for the user to reach for; a card's measure makes left-set type read as deliberate rather than unfinished.

**Two separate controls, two different relationships to A3·12:** the padding inside the card is a step up because a hero's card carries a headline; the inset around it is byte-identical to the footer's, so a site running both reads one shape.

**Responsive.** The inset steps with the margin — 24 px under the header at every width. At ≤ 767 **Card at 390** decides: Keep the card holds the inset and the radius, Full bleed drops both and the card becomes the page. It is a user choice, not automatic.

**Empty.** As 1.

**Flagged.** The 48/64/88 padding, the phone control and its two values, and the fixed 24 px gap under the header.

---

## 9. Contrast Band

The whole hero on the inverted ground. Ground is not a control here: it is the design.

**Descriptor.** The only design with no Ground control — the inverted ground is the design rather than a setting on 1 Centred — and the only one that redraws the action pair for a contrast band.

**Structural descriptor.** `stack · none · contrast · none · none · inverted whole hero`

**Archetype.** stack

**Behaviour module.** **none.** The inverted ground and the action pair are token work, and the disabled Accent value with its 3.1:1 shown is editor behaviour rather than theme JavaScript. **JS off:** identical.

**Items.** No repeater; the band carries one set. `proof[]` kept, not drawn — proof pairs on an inverted ground are A10's question, not this design's.

**Fields.** As 1, plus `note`.

**Controls.**

| Control | Values |
|---|---|
| Band edges | Full bleed · Page margin (always full bleed on a phone) |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Primary action | Surface fill · Outline · Accent (Accent disabled with its ratio shown in any pack where it fails — 3.1:1 in Paper) |
| Below the sub | Note · Nothing |
| Alignment | Centred · Left |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Contrast (locked — the inverted ground is the design, and on any other role this is 1 Centred) |
| Vertical spacing (universal) | Compact 44 · Comfortable 64 · Spacious 88 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role **locked** at Contrast, reason shown — the inverted ground is the design, and on any other role this is 1 Centred. Vertical spacing resolving 44 · 64 · 88 — the tighter ladder survives as a resolution. Top divider default None.

**Alignment, this pass.** Centred · Left — A6's band design carries it and this one did not, with no left-aligned sibling for the user to reach for.

**There is no Background role to set:** the universal control is locked at Contrast with the reason shown — the ground is the design.

**Actions on the band.** The primary is a solid `text`-coloured fill carrying the band's colour; the secondary is a 28% hairline. The **Primary action** control offers Accent as a third value, and it is **disabled with its ratio shown** in any pack where it fails — 3.1:1 in Paper. §7·4: a value that would fail contrast is disabled with its ratio, never silently allowed.

**No form and no field** is drawn on this design, for the same reason A4·15's Contrast ground is disabled: a field on an inverted band needs a surface step the packs do not define.

**Flagged.** The 44/64/88 padding and its departure from the category's, the inverted action pair, and disabling Accent with its ratio rather than removing it.

---

## 10. Video Poster

A 16:9 poster with a labelled play control at its centre and the set in the lower third. Opens A15's player in a dialog.

**Descriptor.** The only design carrying a video, and the only one whose control opens a dialog rather than navigating, scrolling or submitting.

**Structural descriptor.** `media frame · none · image · one · full-bleed · centred labelled play control`

**Archetype.** media frame

**Behaviour module.** `video-facade`. Edit-safe — it does not run while the section is edited and writes nothing into authored DOM, which is why every frame draws the poster as a still. **JS off:** “The poster is an `<a href>` to the video's canonical URL (YouTube/Vimeo watch page).” The reader still reaches the video, one navigation away; the set, the scrims and the typed duration are unaffected. **The design's labelled `<button>` and the module's `<a href>` disagree** — the registry owns module mechanics, so the trigger compiles as the anchor and script upgrades it to the button that opens A15's dialog. Finding at the end; it is A3·2's finding in a new place.

**Items.** No repeater — one video, one poster. A second video, or a list of them, is A15's.

**Fields.** `videoUrl` · `videoPoster` (falls back to `image`) · `videoDuration` (typed, ≤ 8, **flagged as invented**) · the set as 4.

**Controls.**

| Control | Values |
|---|---|
| Play control | Large centred · Inline (always inline on a phone, unless nothing else is over the poster) |
| Show how long it runs | Show · Hide |
| Over the poster | Everything · Headline and play · Play only |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Locked — the poster is the ground; with neither poster nor image the section draws its own flat contrast panel |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (measured from the poster's bottom edge) |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role **locked** — the poster is the ground; with neither poster nor image the section draws its own flat contrast panel. Vertical spacing resolving 64 · 96 · 132, measured from the poster's bottom edge. Top divider default None.

**Field contracts, this pass.** `videoUrl` accepts YouTube and Vimeo watch pages — the same canonical URLs the module's no-JS anchor navigates to; uploaded video is A15's ground, and the editor says so at the field. `videoDuration` edits inline on the canvas with the P0·1 toolbar; nothing reads it from the video, as flagged. The poster gains Image focus in the Image Picker popover.

The scrims are 4 Full Bleed's, measured and fixed rather than a control. **Over the poster** works as it does in 4: what it drops moves below the poster onto the page's own ground.

**Behaviour.** Nothing autoplays and nothing is muted-looping. The poster is a still. The play control is a labelled `<button>` that opens a dialog with focus trapped and returned; A15 owns the player inside it.

**Empty.** No poster and no image → this design's own flat contrast panel, the one 4 Full Bleed settles. No video URL → the design is not offered.

**Flagged.** `videoDuration` and the note that nothing reads it from the video, the two play-control positions, the dialog the poster opens, and the no-autoplay rule.

---

## 11. Subscribe

The set with A3·4's one-row form standing where the actions would be. The hero's only form.

**Descriptor.** The only design that takes an email address, and the only one where a form row stands in the actions' slot at the actions' own height.

**Structural descriptor.** `form · none · page · one · none · email row replaces actions`

**Archetype.** form

**Behaviour module.** `member-form`, plus `countdown` at Above the form: Deadline line. Both edit-safe. **JS off, `member-form` — corrected this pass (the no-JavaScript notice):** ~~the form posts natively to Ghost's members endpoint~~. **It cannot.** Tested against both live Ghost servers, **Ghost's signup endpoint refuses a plain form submission**, so a scriptless field would take an address and lose it. The form is **replaced by P0·4's notice at the form row's own height — 46 px above 767, 48 px at ≤ 767** — so the hero's height does not change and nothing below it moves; headline and note stay; it is plain text, not an alert. **The five states are untouched** — empty, focus, invalid, submitting and done are Ghost's own script (Part D). Also **conditional on the connected site (the rule that member buttons are conditional):** with self-signup off or members disabled the field does not render and the button stands alone; a paid ask needs a payment provider; the field controls stay in the panel disabled with the reason. ~~Ghost's own server response replaces the designed sent state” — so the designed success state is what the module adds, not what the form depends on. **JS off, `countdown`:** “The static deadline renders as a `<time datetime>` element (“Ends 3 September 2026”); no ticking digits.” The four field states are CSS `:focus` and `:invalid` and stand without either module; the 46 px row, the reserved button width and the suppressed focus ring are CSS.

**Items.** No repeater. The form is one row with one field: the five `email*` strings are separate named fields shared with the footer's form rather than a list, and the deadline is one date.

**Fields.** The set as 1, minus the actions, plus the five `email*` fields — placeholder, button label, note, success, short success — with A3·4's names and caps, and `deadline` (**flagged as invented**).

**Controls.**

| Control | Values |
|---|---|
| Field width | Narrow 320 · Medium 400 · Wide 480 (steps down one value on a tablet) |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Above the form | Nothing · Deadline line |
| Note under the form | Show · Hide |
| When a member is signed in | Show a members line · Hide the section |
| Show member count | On · Off |
| Email form fields | Site defaults · This section only |
| Background role (universal) | Background · Surface · Contrast (Contrast disabled — a field on a contrast band needs a surface step the packs do not define) |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role, with Contrast disabled in the same words as before — a field on a contrast band needs a surface step the packs do not define. Vertical spacing resolving 64 · 96 · 132. Top divider default None. **Member visibility does not appear** — the signed-in model below subsumes it, per the ground rule.

**The member model, this pass — A6·14's, reused.** A signed-in member never sees the form: it would ask for an email Ghost already has. At **Show a members line** the form's slot carries one authored line (default “You already get the Thursday letter.” — a field, not fixed copy) and one Portal link (account, via the P0·4 member-aware editor) at the form's own height, so the page never jumps between audiences; at **Hide the section** the hero is absent for members and the page opens on whatever follows. **Show member count: On** renders `{{total_members}}` exactly as Ghost sends it — pre-rounded, display only, never re-formatted — plus an authored suffix in the note. The states are reached with the P0·6 state switcher and View as, never a sidebar preview. Compiles to server-side member checks; nothing flashes.

**The email-field override, this pass.** The five shared `email*` fields gain a per-section override with **Site defaults** the default (the same rule strikes “Inherit”: no control in the library carries that value) — a hero can say “Get the Thursday letter” while the footer says “Subscribe”. **The invalid state's wording ships as a theme translation-catalog string** — a correction: the earlier ruling called it fixed copy, and the no-fixed-strings rule wins.

The five `email*` fields are shared with the footer's form — change them once and both follow, unless this section's override (above) is set.

**Five states** at one height, in the frame's own names: **empty · focus · invalid · submitting · done**. (Corrected this pass — the enumeration read "empty, focus, error, success", which both undercounted and renamed two of them; Part D makes which states exist load-bearing, since A10 turns on knowing that all five are Ghost's script rather than ours.) The field is 46 px — **A4's hero button height, not A3·4's 44 px footer row**, because a form standing in the actions' slot has to be the height of the actions it replaced. Flagged as a departure, and the only measurement in this design that is one. The button sits inside the row, the note under it. Success replaces the row in place; the short success is for the narrow width. Every other value is A3·4's, including the suppressed focus ring, the reserved button width and the refusal of red. **A3·4 draws four crops to this design's five** — it takes the resting band as its empty state rather than drawing it twice; the state model is the same.

**Empty.** No deadline → the countdown line is absent. Past its date the line is removed and the form stays.

**Flagged.** `deadline` and the countdown's wording, which is A2·6's verbatim, the 46 px row, and the three field widths.

---

## 12. Offset Image

Text on a 620 px measure at the left margin with the picture running off the right edge of the window.

**Descriptor.** The only design whose picture leaves the window, and the only one that corrects settlement 1 by refusing a transparent header outright.

**Structural descriptor.** `split · none · page · none · edge · picture off window edge`

**Archetype.** split

**Behaviour module.** **none.** The bleed is a full-bleed grid column with a negative side margin, the 1080 change of crop is a media query, and Header mode Below is a markup decision taken before render. **JS off:** identical.

**Items.** No repeater — one picture, as 3.

**Fields.** As 3.

**Controls.**

| Control | Values |
|---|---|
| Picture side | Right · Left |
| Picture height | Short 420 · Medium 520 · Tall 620 |
| Bleed | Off the edge · To the margin (off the edge needs a picture 2000 px or wider) |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role — new; this design previously had no ground control. Vertical spacing resolving 64 · 96 · 132. Top divider default None.

**Image, this pass.** Image focus in the Image Picker popover; on a post or page canvas the picture defaults to the post's feature image, source named.

**Responsive.** Above 1080 the picture bleeds past the margin. Below 1081 there is no margin to spare: the picture takes a contained crop — the same geometry 3 Split uses at that width, arrived at by this design's own media query and not by becoming it (the rule that no design ever turns into another design) — and the arrangement, stated on the frame. **Header mode is Below, a correction to settlement 1** — a part-width picture cannot carry a transparent header, because the header would be half over a photograph and half over the page.

**Frame height.** The text block plus its padding is the taller side at Medium and above, so it sets the section's height and the 520 px picture centres against it.

**Flagged.** The bleed rule, the 1080 contained crop, and the correction to settlement 1.

---

## 13. Latest Post

3 Split's arrangement with the newest published post as the right half: one card carrying its picture, title, tag and date. The category's only live data.

**Descriptor.** The only design carrying live content from Ghost, and the only one whose second half is a query result rather than an authored picture.

**Structural descriptor.** `feed · none · page · one · right · newest post as card`

**Archetype.** feed

**Behaviour module.** **none.** The post's title, feature image, tag, date and the members-only marker are server-rendered by the template, and the whole card is one `<a>`. Neither `load-more`, `infinite-scroll` nor `shuffle` is declared: the design draws exactly one post and has no next page — A19 owns anything more. **JS off:** identical, live data included.

**Items.** One post, and **it is not an item.** It comes from Ghost's query, so there is no Add, no Remove and no order to set — **Which post** and **Card style** are the controls, and a second post is A19's. The authored `image` beneath it is the fall-back picture, one field.

**Fields.** Authored: the set as 3, where `image` is the fall-back picture. From Ghost: the newest published post's title, feature image, primary tag, date and members access. Drafts, scheduled posts and pages excluded. **No excerpt, author, reading time or second post** — all A19's.

**Controls.**

| Control | Values |
|---|---|
| Which post | Latest published · Latest in a tag · Featured only · By author · Hand-picked |
| Card style | With image · Title and date |
| Card side | Right · Left |
| Show tag | On · Off |
| Show date | On · Off |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role; Vertical spacing resolving 64 · 96 · 132; Top divider default None.

**Which post, this pass.** The set aligns with P0·5's source vocabulary. Latest in a tag gains its missing tag picker — live-searched, tag name + post count, single pick. By author adds an author picker — avatar + name + post count, single pick. Hand-picked opens P0·5's search-and-pick list, one post; an unpublished pick drops out server-side and its row says so. The post stays Ghost's: no Add, no Remove, “From Ghost” marked, and clicking its title, tag or date says “Edit in Ghost”. **Show tag and Show date** pull meta out of the two Card-style bundles rather than burying it there; the bundles keep only their geometry. The fallback `image` gains Image focus in the Image Picker popover. The “Latest” label and the “Members only” marker ship as theme translation strings.

**The card.** Feature image at 3:2, to agree with A24's post crop. Title 24 px in the heading font, two lines maximum, full title in the DOM. A1·6's “tag · date” meta row at 13 px. The whole card is one link named by the title; hover underlines the title and darkens the picture 4% **with no scale** — A3·9's 1.02 would move the fold. At Title and date the card takes `surface`, one hairline, a 13 px “Latest” label and a 28 px title.

**Data states.** Post with no feature image → a hover-surface panel of the same height carrying the title at 15 px clipped to three lines; the title then appears twice, deliberately, as A3·9 decided. No published post, or an empty tag or featured set → the section's own `image` at 4:3 in the card's place; with neither, the right column closes up and the text keeps its place — the design renders either way. Members-only post → a third meta item, “Members only”, in `text`, no glyph and no badge. **This last is a stated departure from A3·9**, which marks nothing in the footer: a hero is where a reader arrives, and sending them from the front door into a paywall unannounced is worse than telling them.

**Routes.** Home and custom routes only.

**a11y.** The authored headline is the page's h1 and the post's title an `<h2>` inside the card's single link. Not a `<nav>` and not a feed. Picture decorative, tag plain text, date a `<time datetime>`. Nothing in the design depends on the length of live content: two-line title cap, fixed 3:2 box, a meta row that never wraps.

**Responsive.** 3 Split's ladder. The card's own steps: title 24 → 22 px at 834; at ≤ 767 the card becomes a row with a 108 × 81 thumbnail at 3:2, an 18 px title and a short-formed date.

**Flagged.** The 3:2 crop and its agreement with A24, the 24 px title and two-line cap, dropping A3·9's hover scale, the four omissions, the mobile thumbnail, the “Latest” label, the route restriction, and the members-only marker.

---

## 14. Full Height

4 Full Bleed's arrangement measured against the window, with a labelled scroll cue at the foot. The only design that knows how tall the browser is.

**Descriptor.** The only design measured against the window rather than against its own content, and the only one carrying a scroll cue.

**Structural descriptor.** `media frame · none · image · none · background · measured to window height`

**Archetype.** media frame

**Behaviour module.** **none for the section.** `min-height: 100svh` is CSS, the picture and the set are server-rendered, and the 560 px sub rule is a media query — the hero is complete without JavaScript. **The scroll cue is the exception, and it is a finding.** Its four behaviours — scroll, move focus to the next section's heading, removal past 40 px of scroll, removal whenever the section is not the window's height — need script that none of the 31 modules describes; the closest is `header-scroll`, whose subject is scroll-position state and whose degradation (“Header renders in its resting state”) is the wrong one for a cue. A4 emits the cue from script, so **JS off:** the picture, the set and the window height all render and the cue is absent — the honest outcome, since a control that promises to scroll and move focus must not be drawn where it can do neither. Named at the end.

**Items.** No repeater — 4's picture and one scroll cue.

**Fields.** As 4, plus `scrollCueLabel` (≤ 24, default “Read on”). Picture focus is 4's field and applies here; it is not a control on this design.

**Controls.**

| Control | Values |
|---|---|
| Height | Full window 100svh · Three-quarters 75svh (a window measure, not a spacing ladder, so it keeps its name) |
| Text position | Bottom left · Centred |
| Scroll cue | Show · Hide |
| Headline size | Medium 48 · Large 60 · Display 76 |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Locked — the picture is the ground behind a window-height set; the empty state keeps the height and swaps in the flat contrast panel |
| Vertical spacing (universal) | Compact 56 · Comfortable 88 · Spacious 120 (from the foot, above the cue) |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role **locked** — the picture is the ground behind a window-height set; the empty state keeps the height and swaps in the flat contrast panel. Vertical spacing resolving 56 · 88 · 120, from the foot, above the cue. Top divider default None.

**This pass.** `scrollCueLabel` edits inline with the P0·1 toolbar. The cue's behaviour keeps its **ARCHITECT: registry ruling** flag, now written on the frame as well as here — no module covers it, no module name is coined, and the no-JS state stands: the cue absent. The picture gains Image focus in the Image Picker popover and defaults to the post's feature image on a post or page canvas, source named.

**Height.** `min-height: 100svh`, never `height`, and never `overflow: hidden`. `svh` rather than `vh` so the section does not jump as a phone's toolbars retract. The header's 76 px sits inside the height rather than being added to it.

**The floor.** Where the set plus its padding needs more room than the window has, the section grows and the reader scrolls — the height is a target, not a cap. Below about 560 px of window height the sub leaves, the only element in A4 dropped by a height rather than a width.

**The cue.** A 13 px uppercase label at 82% over a 1 px × 20 px rule, centred, 24 px from the foot, 44 px hit area. Hover takes the label to full strength and the rule to 28 px. A real `<button>` — it moves the page rather than going somewhere — that scrolls and then moves focus to the next section's heading; instant under reduced motion. **Removed from the DOM** past 40 px of scroll and whenever the section is not the window's height, rather than hidden. No bob, no pulse, no fade.

**Empty.** No image → the flat contrast panel 4 Full Bleed settles, with the window's height and the cue both kept.

**Responsive.** 4's ladder for the set. At 834 portrait the section is taller than it is wide, the only place in A4 that happens, and the picture is cropped hard on its sides. At ≤ 767 the set sits 72 px from the foot, the cue 20 px with a 16 px rule, and the home-indicator safe area is added below the cue rather than taken from it.

**Flagged.** `svh` over `vh`, the two heights and the refusal of a half-window value, the 88/24 px pair, the cue's geometry and its four behaviours, the 560 px sub rule, and the safe-area decision.

---

<!-- 15. Search — DELETED in the design patch pass (the deletion of design 15 Search): "a field that never renders a result" is now any hero action pointed at Ghost search via the link picker. A23 Search is deleted with it (the deletion of the Search category). The number stays retired: A4 runs 1–14, 16–18. -->

## 16. Pull Quote

Somebody else's sentence in the display position, with the publication's own headline demoted to a line above it.

**Descriptor.** The only design where the display position is spent on somebody else's sentence, and the only one where the publication's own headline is demoted to the eyebrow's treatment and is optional.

**Structural descriptor.** `stack · none · page · one · inline · quotation in display position`

**Archetype.** stack

**Behaviour module.** **none.** One quotation, one attribution row, nothing rotating — `rotator` is A2·9's and is refused here in words, and the 180-character step-down is resolved before render. **JS off:** identical.

**Items.** One quotation, and no list. A second quotation is A8 Testimonials' and rotating between them is A2·9's; the attribution is three fields on that one quotation — name, role, portrait — rather than an item shape.

**Fields.** `quote` (req, ≤ 240 **hard**, quotation marks typed by the author) · `quoteName` (req, ≤ 40) · `quoteRole` (opt, ≤ 60) · `quotePortrait` (opt, square, ≥ 88 px) · `headline` (**optional here** — the only design in A4 where it is) · `primaryAction` · `secondaryAction`. `eyebrow` and `sub` are kept and not drawn. Nothing from Ghost — there is no reviews API, and the editor says so.

**Controls.**

| Control | Values |
|---|---|
| Quote size | Medium 36 · Large 46 · Display 60 |
| Attribution | With portrait · Name and role · Name only |
| Alignment | Centred · Left |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role; Vertical spacing resolving 64 · 96 · 132; Top divider default None.

**Editing, this pass.** Quote, name and role edit inline with the P0·1 toolbar; the portrait opens the Image Picker — square, ≥ 88 px, Image focus in the popover. The “nothing from Ghost” stance was audited and kept: there is no reviews API, and the editor still says so.

**The reversal.** The headline renders in the eyebrow's treatment — 13 px uppercase tracked, muted — and the quotation takes the display position in the heading font at **regular weight**, measure 900 px centred or 720 px left. The section has one display moment as every section does; here it is spent on the quotation.

**Attribution.** A1·6's avatar and meta row at 44 px, the library's largest instance and the one place it is a subject rather than a byline. **The name cannot be turned off** — an unattributed quotation in a hero is the site putting words in an anonymous reader's mouth; where a site has permission to quote but not to name, the honest field is a role typed into the name. No stars, ratings, company logos or verified ticks.

**The cap and the step-down.** 240 characters, hard — the only hard cap in A4 — because a paragraph in the display position is an excerpt, not a pull quote. Above 180 characters the quote renders **one size value below** the control's setting, disclosed under the size control rather than silently disagreeing with it.

**Empty.** No portrait → the **one-letter** placeholder at 44 px — the first letter of the typed name, the same everywhere in the library (owner's ruling, 28 August 2026); the circle is never dropped, so a missing picture cannot silently change the chosen value. No headline → the line leaves and the quotation becomes the h1. No quote → the section does not render.

**On the Contrast ground** the portrait is unavailable and Attribution is narrowed to Name and role, with the reason shown (the rule that a shared control may offer fewer choices and must say why): a photograph in a circle on an inverted band reads as a hole punched in it.

**a11y.** `<figure>` → `<blockquote><p>` + `<figcaption>`, so the attribution is programmatically the quote's source. The headline is the h1 despite being the smallest text — visual size is not heading level. Quotation marks are typed characters, not `::before`. Portrait decorative, initials `aria-hidden`, name and role never links. No rotation and no motion; a set of more than one quotation is A8 Testimonials', and A2·9 Rotator is where the library rotates anything at all.

**Responsive.** Quote 46 / 36 / 27 at Large, measure 900 / 700 / full. Actions stay on one row at 834. At ≤ 767 the set is left-aligned whatever Alignment says, and the avatar steps 44 → 40 px.

**Flagged.** The reversal, the regular weight, the two measures, the 44 px avatar and its mobile step, typed quotation marks, the required name and the missing fourth attribution value, the refusal of ratings furniture, the 240 cap, the 180-character step-down, the one-row actions at 834, and the portrait on Contrast.

---

## 17. Slim

A page title, not an argument: one row, about 160 px, for the top of an archive index, a tag page or an About.

**Descriptor.** The only design that is a page title rather than an argument — one row of about 160 px — the only one offered on every route, and the only one whose title can come from Ghost.

**Structural descriptor.** `bar · none · page · none · none · single row page title`

**Archetype.** bar

**Behaviour module.** **none.** Title, eyebrow, description, count and rule are server-rendered, and the count's grammar is template logic. Not `filter-strip` — A29 owns the archive header and the filtering and sorting context that comes with it. **JS off:** identical.

**Items.** No repeater. The count is one number from the archive, and the right-hand slot has exactly one occupant by construction.

**Fields.** `headline` (req, the page title) · `eyebrow` · `sub` (the description, ≤ 120 here) · `meta` (≤ 32) · `primaryAction`. `secondaryAction`, `image` and `imageAlt` are kept and not drawn.

**Controls.**

| Control | Values |
|---|---|
| Arrangement | Title and meta · Title only · Title and description · Title and action |
| Title size | Small 32 · Medium 40 · Large 52 (no Display) |
| Rule | Below · Band · None |
| Alignment | Left · Centred |
| Eyebrow | Show · Hide |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 36 · Comfortable 56 · Spacious 80 |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role — new. Vertical spacing resolving **36 · 56 · 80** — the page-title scale survives as a resolution, not a duplicate row. Top divider default None — the header above already ends in a rule, which is why the design's own Rule control never offered Above.

**The right-hand slot** has exactly one occupant — the meta, or one primary action, or nothing. Title and description drops the meta; Title and action drops the count. One occupant means one collapse, which is what keeps the row one row at every width. The meta is 14 px at every width, bottom-aligned to the title's last line with 6 px of optical lift, and drops to its own right-aligned line above the rule once the title passes 75% of the row. The title wraps at 60% of the measure.

**The rule** is never above — the header already ends in one. Band replaces the hairline with the section's own hover-surface ground (`surface` in dark) rather than stacking with it.

**Data.** The only design in A4 whose title can come from Ghost. On a tag or author page the title, eyebrow and count fill from the archive and the authored fields are shown as overridable placeholders labelled “From your tag”. Count grammar: “1 post”, not “1 posts”; “No posts yet”, not “0 posts” — all shipped as theme translation strings, plural forms included. Ghost-filled titles, eyebrows and counts are plain-text-locked with P0·1's pill — clicking them says “Edit in Ghost”; the authored overrides edit inline. A tag with no description renders Title and meta even where Title and description is chosen, with the fall-back named. Offered on every route — the only design in the category that is.

**The boundary with A29 Archive Headers.** This design is a hero a user places on any page, including a tag or author page. A29 owns the archive header a theme renders on those templates by default, with the filtering, sorting and pagination context that belongs to them. A site uses one or the other, and the editor names the collision rather than drawing both.

**a11y.** The title is the h1, and **the heading contract with the section below is this design's main obligation**: it is nearly always followed by a list of posts, and its h1 makes every card title an h2, so the page's outline is one h1 and a flat run of h2s. The eyebrow names the template in words — “Tag”, “Writer” — rather than a glyph. The count is plain text in the `<header>`, not a live region and not `aria-describedby` on the title. Nothing interactive but the action; no motion.

**Responsive.** Title 40 / 34 / 28 at Medium, padding 56 / 48 / 36, band about 160 / 140 / 112 px. The row holds at 834. At ≤ 767 the right-hand slot stacks under the title, left-aligned, 8 px below; an action there goes full width at 48 px.

**Flagged.** The padding scale and its departure from 96, the 40 px title and the absent Display value, the 6 px optical lift, the 60% and 75% thresholds, the four arrangements and the slot's exclusivity, the refusal of a rule above, Band replacing rather than stacking, the count's grammar, and the placeholder behaviour.

---

## 18. Overlap Card

A wide picture with the text on a surface card pulled up over its bottom edge, the greater part of the card sitting on the page below. The category's only design that reaches into its neighbour.

**Descriptor.** The only design that reaches into the section below it, and the only one where the headline sits on a measured surface over a photograph rather than on the photograph.

**Structural descriptor.** `stack · none · page · none · top · card pulled over picture`

**Archetype.** stack

**Behaviour module.** **none.** The overlap is negative margin, the card's md shadow and its dark hairline substitution are CSS, and the 40% step-down is resolved before render. Not `reveal` — the design states no rise, no fade and no parallax. **JS off:** identical, overlap included.

**Items.** No repeater — one picture, one card.

**Fields.** `image` (required in practice — without it the overlap has nothing to overlap) · `imageAlt` · `eyebrow` · `headline` (req) · `sub` · `primaryAction` · `secondaryAction`. Picture focus applies. Nothing from Ghost, except a post or page's feature image offered as the picture's default with its source named.

**Controls.**

| Control | Values |
|---|---|
| Picture height | Standard 440 · Tall 520 |
| Card side | Left · Right · Centred (the card widens to 820 and the text stays left) |
| Overlap | Small 48 · Medium 96 · Large 144 (how far the card is pulled up onto the picture) |
| Headline size | Medium 48 · Large 60 · ~~Display 76~~ (disabled — 76 px on a 660 px card leaves under 8 characters a line) |
| Overlap on a phone | On · Off |
| Actions | Both · Primary · None |
| Member visibility | Everyone · Logged out · Free members · Paid members |
| Background role (universal) | Background · Surface · Contrast (the ground under the card and past the picture) |
| Vertical spacing (universal) | Locked — the overlap is this design's spacing, as the missing padding control always said; reason shown |
| Top divider (universal) | None · Line · Fade (default None) |

Universal: Background role — the ground under the card and past the picture. Vertical spacing **locked** — the overlap is this design's spacing, as the missing padding control always said; reason shown. Top divider default None. Image focus and the feature-image default were already this design's and now follow the shared placement: the Image Picker popover, source named.

**The card.** 660 px, `surface`, the pack radius on all four corners, 48 px inset. **The md shadow in light and a hairline instead in dark** — A4's only md shadow, with A1·1's dropdown panel the library's other one, and the design's one structural difference between modes. A card with square top corners would be a panel attached to the picture rather than a card over it.

**The overlap** is never more than 40% of the card's height — past that the picture's bottom edge crosses into the card's own text rather than passing behind its top margin. Where a short card would break the rule the value steps down one named value with the reason disclosed. Most of the card sits below the picture, and the section's bottom padding is measured **from the card's foot** rather than the picture's, so the next section's top padding is untouched and nothing overlaps its content. A page that puts a contrast band immediately below gets the card overlapping a dark ground — legible, since the card is opaque, but the band's top padding then reads as smaller than it is, and the editor flags that pairing rather than preventing it.

**Header mode is Overlap** (A1·4 Overlay) with 4 Full Bleed's top scrim.

**Empty.** No image → **the card lands on the page's own ground**: radius, md shadow and inset dropped, text at the page margin, still this design (the rule that no design ever turns into another design). The header, with no picture to sit on, renders on its own ground — A1·4's own no-image state. The design's subject is the relationship between a picture and a card; with no picture the relationship is what is missing, not the card, and the sidebar says the overlap is not in force. No sub or no actions → the card shortens and the overlap may step down. Overlap off on a phone → surface, shadow and inset all leave and the text sits on the page at the page margin.

**a11y.** The headline is the h1 **on a measured surface rather than over a photograph** — this design's real advantage over 4 Full Bleed, since the contrast is a token pair rather than an estimate against an unknown image. The DOM is flat and in visual order; the overlap is negative margin, not absolute positioning, so the section's height includes the card and 200% text zoom grows it downward. The card is not a landmark, a region or a labelled group — it is a visual plane. No motion: no rise, no fade, no parallax.

**Responsive.** Card 660 / 560 / full-minus-16, inset 48 / 36 / 24, overlap 96 → 64 at 834 and 32 at ≤ 767, picture 520 / 400 / 260, headline 60 / 40 / 32. The actions stack at 834 even though the row would fit — a stacked pair inside a card reads as the card's own content. At ≤ 767 the card keeps a 16 px side margin, inside the page's 20, and Card side is ignored.

**Flagged.** The 660/820 px card and 48 px inset, the md shadow and its dark hairline substitution, all-four-corner radius, the three overlap values and the 40% rule, measuring the section's foot from the card, the disabled Display value, stacking at 834, the 16 px phone margin, the contrast-band warning, and the flattened card at no image.

---

## Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All seventeen checked against each other; no two are the same.

| # | Design | Structural descriptor |
|---|---|---|
| 1 | Centred | stack · none · page · none · none · centred 720 px measure |
| 2 | Flush Left | stack · none · page · few · none · deliberately empty right half |
| 3 | Split | split · none · page · none · right · seven/five column geometry |
| 4 | Full Bleed | media frame · none · image · none · full-bleed · anchored to lower third |
| 5 | Image Under | stack · none · page · none · bottom · captioned band beneath set |
| 6 | Big Type | stack · none · page · none · none · headline at fill width |
| 7 | Masthead | stack · none · page · none · none · nameplate held between rules |
| 8 | Card | stack · card · surface · none · none · card inset from edges |
| 9 | Contrast Band | stack · none · contrast · none · none · inverted whole hero |
| 10 | Video Poster | media frame · none · image · one · full-bleed · centred labelled play control |
| 11 | Subscribe | form · none · page · one · none · email row replaces actions |
| 12 | Offset Image | split · none · page · none · edge · picture off window edge |
| 13 | Latest Post | feed · none · page · one · right · newest post as card |
| 14 | Full Height | media frame · none · image · none · background · measured to window height |
| 16 | Pull Quote | stack · none · page · one · inline · quotation in display position |
| 17 | Slim | bar · none · page · none · none · single row page title |
| 18 | Overlap Card | stack · none · page · none · top · card pulled over picture |

**Containment is `none` seventeen times, and that is the honest answer.** A hero is the top of the page, and the page is not a container. **8 Card is the one exception**, because the section *is* a panel inset from the page's edges with the page ground visible around it — A3·12's reading, at hero scale. Three near misses, stated rather than left to trip someone: **18 Overlap Card's** card is an object *inside* the section — the section is a full-bleed picture and a card over it, so the section itself is uncontained and the tuple says `none`; **13 Latest Post's** post is drawn as a card, which is the item's geometry rather than the section's; and **3 Split's** framed inset is a mount on a photograph, not a box around a hero. `box` and `pill` are unused in A4 — nothing in the category is bounded to the measure by a rule, and the only capsule shapes are the actions.

**Ground does the most separating.** `page` on 1, 2, 3, 5, 6, 7, 11, 12, 13, 15, 16, 17, 18 · `surface` on 8 · `contrast` on 9 · `image` on 4, 10, 14. Each is the drawn default, never the control's full range: eleven designs offer Background · Surface · Contrast and are still `page`, which is the settlement the category rests on — **9 Contrast Band is its own design because it has no Ground control**, so it is not 1 Centred on a setting. **8 Card is `surface`** because its drawn card ground is Surface and the page is only what shows around it. **18 is `page`, not `image`**: the picture is the section's media, and the card — with the greater part of the section — rests on the page's own ground, which is exactly what its accessibility field claims. `transparent` and `accent` are unused: no A4 design renders on another section's picture — **12 Offset Image's correction to settlement 1 is the refusal of precisely that** — and a hero on an accent ground would spend the whole accent budget on a ground.

**Item-count reads the design's own repeating or bound unit, not the set.** The eyebrow, headline, sub, note and two actions are on nearly every design, so none of them counts. What counts: **2's** authored proof pairs (`few` — 0–3, designed at three, capped there with A10 named), **10's** one video, **11's** one form row, **13's** one post from Ghost, **15's** one field, **16's** one quotation. Everything else is `none`. **`many` and `variable` are unused, and that is the category's shape rather than an oversight** — the moment a hero repeats a unit five deep or lets the author decide how many, it is A5 Features, A10 Stats or A19's design, and the category-boundary table says so.

**Media placement.** `none` on 1, 2, 6, 7, 8, 9, 11, 15, 17 · `right` on 3 and 13 · `bottom` on 5 · `top` on 18 · `edge` on 12 · `full-bleed` on 4 and 10 · `background` on 14 · `inline` on 16. `left` is unused as a drawn value: 3 and 12 both offer Picture side: Left, and a control setting is not a design. **`background` is what separates 14 Full Height from 4 Full Bleed** — in 4 the picture's own 16:9 crop sets the section's height, so the photograph is the content and the placement is `full-bleed`; in 14 the window sets the height and the picture fills behind the set, cropped hard on its sides at 834 portrait. **16's `inline`** is the 44 px portrait inside the attribution row, the library's largest instance of A1·6's avatar and the one place it is a subject.

**Two clusters share their first five slots and separate on the emphasis phrase.** They are named here rather than papered over. **1 Centred, 6 Big Type and 7 Masthead** are all `stack · none · page · none · none`: three text stacks on the page's own ground, differing in what carries the page — a centred 720 px measure, the headline's own measured scale, or the site's nameplate between rules. ****11 Subscribe** is the category's only `form · none · page · one · none` tuple now that 15 is deleted, so it shares its first five slots with nothing. Formerly the pair differed in what the row does — post to Ghost's members endpoint, or navigate to a search route — which is also why they declare different modules. In both clusters the closed slots are honest and the sixth is doing the work it exists for; inventing a distinction in a closed slot to force them apart would be worse than saying so.

**13 Latest Post is a `feed` one item deep.** The archetype names what the right half *is* — a query result, newest first, with Ghost's own exclusions — and that is exactly what separates it from **3 Split**, whose right half is an authored picture. Drawing one post rather than three does not make it a split; it makes it the shallowest feed in the library.

**Not used as a separator.** Padding, Headline size, Actions, Ground where it is a control, Picture side, Over the picture, Measure and every phone-only value: they are controls, and two designs that differ only by a control setting are one design. Nor is the fallback web — and after the rule that no design ever turns into another design there is none: **no A4 design resolves to another design.** Each hides what does not apply and keeps its own arrangement, which is a state, not a structure.

---

## Behaviour modules — roster

Four of the registry's 31, and nothing coined. Fourteen designs declare none; `core` is assumed category-wide and not repeated per design.

| # | Design | Modules | Note |
|---|---|---|---|
| 1 | Centred | none | every part server-rendered; nothing degrades |
| 2 | Flush Left | none | `count-up` the near miss, deliberately not declared |
| 3 | Split | none | crop, mount and side swap are CSS |
| 4 | Full Bleed | none | both scrims are gradients; not `lightbox` |
| 5 | Image Under | none | two crops and a caption, no script |
| 6 | Big Type | none | Fill width read as a CSS clamp — **finding** |
| 7 | Masthead | none | nameplate from Settings, rules are borders |
| 8 | Card | none | inset, radius and the phone value are CSS |
| 9 | Contrast Band | none | the disabled Accent value is editor behaviour |
| 10 | Video Poster | `video-facade` | markup disagreement, `<button>` vs `<a href>` — **finding** |
| 11 | Subscribe | `member-form`, plus `countdown` at Deadline line | native post; Ghost's response replaces the success state |
| 12 | Offset Image | none | bleed is a grid column; the 1080 crop change is a media query |
| 13 | Latest Post | none | one post, no next page; not `load-more`, not `shuffle` |
| 14 | Full Height | none for the section; the scroll cue has no module | **finding** |
| 16 | Pull Quote | none | `rotator` is A2·9's and is refused in words |
| 17 | Slim | none | count is template logic; not `filter-strip` |
| 18 | Overlap Card | none | overlap is negative margin; not `reveal` |

**Modules A4 deliberately does not use.** `nav-drawer`, `header-scroll`, `command-palette` and `mode-toggle` are the header's; `search-overlay` is gone with design 15 and with A23 itself (the deletion of the Search category, and of design 15 Search with it) — **no A4 design draws a search affordance**, and any hero action may point at Ghost search through the link picker; `dismiss`, `rotator` and `marquee` are A2's; `accordion`, `tabs` and `toc` have nothing to fold in a hero; `carousel` and `shuffle` are refused by the no-carousel rule in the shared floor; `lightbox` is refused because no A4 photograph is a thumbnail of a larger one; `load-more` and `infinite-scroll` have no next page to fetch; `reveal`, `confetti`, `typewriter`, `count-up`, `reading-progress`, `scroll-spy` and `slide-in-card` are all refused by “no entrance animation, no parallax, no autoplay”; `price-toggle` is A7's and `share` is the post's. **Nothing in A4 animates on scroll, counts, reveals, rotates or shuffles.**

---

## Findings for the architect

Three, carried forward and still open, none a licence to name a module. The reconciliation pass adds no new finding: 14's cue flag is now written on the frame as **ARCHITECT: registry ruling**, and 15's correction resolved into an existing module rather than a coined one.

1. **10 Video Poster's trigger markup disagrees with its module.** The design specifies a labelled `<button>` that opens a dialog with focus trapped and returned; `video-facade` degrades to “The poster is an `<a href>` to the video's canonical URL”, which requires the trigger to *be* an anchor in the served HTML. The registry owns module mechanics, so the compiled trigger is the anchor and script upgrades it — the drawn frame and the spec card owe that correction, and the accessibility note should name the anchor as the resting state. **This is A3·2's accordion finding in a new place**, which makes it a library-level pattern: where a design draws the JS-on control, the served markup must be the no-JS one.
2. **14 Full Height's scroll cue has no module.** Four behaviours are load-bearing — scroll, move focus to the next section's heading, remove past 40 px of scroll, remove whenever the section is not the window's height — and no module in the registry describes any of them. `header-scroll` is the closest, and its degradation is the wrong one: a resting state is exactly what a cue must not have when it cannot function. **A4 ships the cue emitted from script**, absent with JavaScript off, and records the loss here. Either the registry gains a scroll-cue behaviour or the cue stays script-only and the section keeps working without it, which it does.
3. **6 Big Type's Fill width was written as “measured, between 64 and 160”.** This pass reads it as a CSS clamp on the container, which needs no module and is what makes the design's zoom claim true. If the build genuinely measures, the design needs script no module provides. **Confirm the clamp — this is A3·7's finding again**, and two categories asking the same question of the same phrase makes it the build's answer to give rather than a category's.

---

## Category artefacts

In `A4-0 Category Proof.dc.html`:

- **The four settlements** §8 asks A4 to make — where A1·4 Overlay lands on each hero, the image / no-image / video-poster variants, how the set scales from 1440 to 390 without dropping the actions, and what a hero renders on a page with no feature image and on templates other than home.
- **The tokenisation proof** — 3 Split in three packs, light and dark, six frames, with only tokens changing.
- **The stress frame** — the category's worst realistic content: an eyebrow at 29 of 32 characters, a 119-character headline against about 90 advised, a sub at 219 of 220, both action labels at 18 of 20, a portrait photograph in a landscape crop, and Headline size left at Display where the content wanted Medium.
- **The roster** — all seventeen, what each is for, what it settles, and its header mode.
- **The shared field list** — the union of everything the seventeen need, with types, caps and which designs draw each field. This is the contract that makes design-switching safe: a design may draw fewer fields, but none may need one that is not on the list, and fields a design does not draw are kept rather than cleared.
- **The consistency pass** — §9, written after all seventeen were drawn: what was checked, the eight things that were wrong, and the pattern in them. Every control list in this document was rewritten from its drawn panel as part of it; where the two ever disagree again, **the drawn panel is the authority**.

## What A4 leaves to other categories

Under the rule that no design ever turns into another design, no A4 design becomes another design. This table is about **category boundaries** — work that belongs to another category — not about designs swapping at runtime.

| Boundary | Owner |
|---|---|
| The post as subject — excerpt, author, reading time, more than one post | A19 Featured and Spotlight |
| A set of more than one quotation | A8 Testimonials |
| Rotating anything | A2·9 Rotator |
| The archive header a theme renders on tag and author templates | A29 Archive Headers |
| A third action, or a row of them | A6 |
| Richer statistics than three authored pairs | A10 Stats and Numbers |
| The video player inside the dialog | A15 |
| The site-wide countdown and its wording | A2·6 |
| The post's own feature-image crop | A24 |

---

## Reconciliation notes

**Frames changed in this pass.** All seventeen control-panel frames — Padding and Ground rows retired; the universal trio drawn outside each list, locked with the reason shown on 4, 9, 10, 14 (Background role) and 8, 18 (Vertical spacing); Member visibility added everywhere but 11; footer counts rewritten. New control rows drawn: 4's Scrim, 7's Issue line source and Standfirst source, 8's and 9's Alignment, 11's three member rows, 13's five-value Which post plus Show tag and Show date. New section frames: 4's scrim triptych (Subtle · Standard · Strong) and 11's signed-in members line. Annotation-only panel changes: 3's and 10's field notes, 14's cue label, 15's placeholder, 16's quote fields, 17's Ghost-locked title. No layout was redesigned, and no "Preview" control existed in A4 to remove.

**Conflicts with earlier rulings, one line each.**

1. ~~**15's no-JS claim**~~ — **void: design 15 is deleted and A23 with it** (the deletion of design 15 Search, and of the Search category with it). Nothing in A4 posts a query anywhere. Kept for the record: the spec ruled a real GET form to `/search/` and no module; Ghost has no server-rendered results, so the design had declared `search-overlay` and its no-JS state is the field plus an archive link. The search-landmark reading survives; the submitted state hands to the overlay.
2. **11's invalid wording** — "fixed copy, not a field" loses to the no-fixed-strings rule: it ships as a theme translation-catalog string.
3. **11's shared email fields** — "change them once and both follow" vs the per-section override: reconciled as **Site defaults** by default, override opt-in per section — renamed from “Inherit from site” because **no control in the library carries an Inherit value** (the rule that a shared control may offer fewer choices and must say why).
4. **4's scrims** — "Fixed, not a control" vs the new Scrim control: Standard keeps the old 60/30 as the default, so an untouched site renders identically.
5. **14's Picture focus** — "4's field, not a control on this design" vs image-focus-everywhere: resolved by placement — focus lives in the Image Picker popover on every image field and is a panel row nowhere, 4's included.
6. **The shared floor's "every number is typed"** — Member count (2's Value source, 11's Show member count) is the named exception; the Ghost value renders verbatim, display only.
7. **7's flagged `issueLine` invention** — stands; Latest post date is a source substitution, not a new field, and the typed field is kept when the source switches.
8. **The six-control norm** — 7, 8 and 13 now run eight rows; legal under the lifted ~15 ceiling plus the universal trio, and Quick Controls stay the 3–5 highest-impact per design.
9. **Member visibility on 11** — subsumed by the signed-in model per the ground rule; it is the one design without the four-value row, stated on its frame.
10. **Fixed English** — 13's "Latest" and "Members only" and 17's count grammar were fixed strings; all are translation-catalog strings now (15's "Clear search" is void with the design), and 14's "Read on", 15's placeholder and 11's members line are editable fields with defaults.
11. **A4-0 Category Proof** — its shared field list gains this pass's fields (`imageFocus`, `valueSource`, the sources on 7, the member rows on 11, Scrim, the two Alignments, the meta toggles on 13, the icon slot on 15, Member visibility); A4-0 was not redrawn this pass, and per the consistency rule the drawn panels are the authority until it is.
12. **14's scroll cue** — no registry module then, none now; the **ARCHITECT: registry ruling** flag is on the frame as well as in this document, and no module name was coined.

## Patch notes — design patch pass

Two sittings are recorded here. The first applied the ten library-wide rules to A4 and is listed under **What changed**. The second — the **confirmation pass** — checked every rule against every design in the roster one by one, finished the work the first sitting left half-applied, and is listed under **Confirmed design by design**. Rules are named, never numbered: the letter-and-number labels elsewhere in the project are filing codes and say nothing about what a rule requires.

Frames updated in the first sitting: all seventeen design panels (eyebrow counts), `A4-0 Category Proof`, `A4-1`, `A4-6`, `A4-9`, `A4-11`, `A4-12`, `A4-18`. Frame deleted: `A4-15 Search`.

Frames updated in the confirmation pass: `A4-0 Category Proof` (the no-image table, the roster's three entries, the reference audit), `A4-2`, `A4-3`, `A4-4`, `A4-5`, `A4-10`, `A4-13`, `A4-14`. Nothing was redrawn: every change is a caption, a note or a spec-card sentence, and no layout, type scale, colour pack or spacing value moved.

### What changed, and the rule that required it

| Rule | Change |
|---|---|
| The deleted Search design | **Design 15 Search deleted** — frame, spec §15, roster row, both table rows, the `searchPlaceholder` field, 9 Contrast Band's reference to it, and its module. Numbering runs **1–14, 16–18**; 15 stays retired and is not reused. |
| The deleted Search category | The Search category goes with it; `search-overlay` leaves A4 and the forward-reference list is corrected. Any hero action may point at **Ghost search** through the link picker. |
| No design ever turns into another design | **6 Big Type**: the scale steps to the 64 px floor and then **the cap lifts** ⚑, instead of switching to 1 Centred. **18 Overlap Card**: with no image the card lands on the page's ground. **12 Offset Image**: the 1081 crop is its own media query. **1** and **12**'s header notes corrected — A1·4 renders on its own ground. **Confirmation pass:** the same rule applied to the seven places it had been missed — 3 Split, 4 Full Bleed, 5 Image Under, 10 Video Poster, 13 Latest Post, 14 Full Height and 2 Flush Left's 1024 rule — plus A4-0's no-image table and roster. "Hand-offs out of A4" is now "What A4 leaves to other categories", about category boundaries only. |
| Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript | 11 Subscribe's ask is conditional on self-signup, members enabled, and a payment provider for a paid tier; its field controls stay disabled with the reason. **Confirmation pass:** the rule reaches past 11 — any design's action may be pointed at a Portal destination, so both notes (does not render where the site cannot support it; with JavaScript off nothing happens) are written into the shared floor and carried by the action editor on all seventeen. |
| The no-JavaScript notice | **11's "posts natively" claim withdrawn** — new no-JavaScript frame, the notice at the form row's own height (46 px desktop, 48 px at ≤ 767). **The five form states are untouched.** |
| A design may offer fewer choices on a shared control, and must say why | **"Inherit from site" → "Site defaults"** on 11's email-field override; no control in the library carries an Inherit value. The narrowings that remain each show their reason: Background role locked on 4, 9, 10 and 14; Vertical spacing locked on 8 and 18; Attribution narrowed on 16's contrast ground; Accent disabled with its ratio on 9. |
| The Remove button never greys out | **Confirmation pass, correction.** A4's one repeater — 2 Flush Left's proof pairs — has no minimum, so Remove is always active and there is no floor. The earlier claim that Remove is "held active at the floor" with the clause "a proof row needs at least one pair" is withdrawn: it contradicted 2's own zero state. The claim that 13's hand-picked list keeps an active Remove is withdrawn too — 13 has no repeater. |
| Item counts are a number picker | Nothing in A4 was a row of fixed counts, so nothing was replaced. 2's pairs are an authored list, Add pair with a per-row Remove, capped at three with the reason shown. **Confirmation pass, correction:** 13's hand-picked post was described as a stepper; it is one post, picked. |
| Avatars with no photograph | **16's portrait shows one letter.** The pass first kept two initials, since the name is typed; the owner ruled for one letter everywhere on 28 August 2026, and the frame, the a11y note and the spec are drawn and written that way. No A4 design renders a Ghost author, so this is the category's only avatar. |
| Mark the two free designs | **1 Centred and 17 Slim**, decided by the owner in the correction pass and marked in the roster. The earlier suggestion of 1 and 2 is withdrawn. |
| Slider labels | **Already satisfied.** A4 draws no slider; every control is a named-value row whose title says what it affects and whose values reuse the standard words. |
| Gap names are "Tight · Normal · Loose" | **Already satisfied.** A4 has no gap control, and no Tight/Even/Airy or Tight/Standard/Wide exists in the category to replace. |
| Ctrl-K is unbound | Recorded: `command-palette` was never A4's. |

### Confirmed design by design

Each of the ten rules was read against each of the seventeen. Only the designs with a subject are listed; where a rule has no subject in a design, the design is silent on it rather than carrying a note about a rule that cannot apply to it.

| Rule | Designs with a subject | Outcome |
|---|---|---|
| Avatars with no photograph | 16 | One letter, per the owner's ruling. No other design draws an avatar. |
| The Remove button never greys out | 2 | No minimum, so Remove never has a floor. Earlier claim corrected. |
| Slider labels | none | No slider in the category. |
| Gap names | none | No gap control in the category. |
| Item counts are a number picker | 2 | An authored list with a stated cap, not a row of counts. |
| Fewer choices on a shared control, with the reason said | 4, 8, 9, 10, 11, 14, 16, 18 | Every narrowing shows its reason; no shared control renamed or extended; the swatch row is Base; no Inherit value anywhere. |
| Mark the two free designs | 1, 17 | Marked in the roster; decided by the owner in the correction pass. |
| No design ever turns into another design | 2, 3, 4, 5, 6, 10, 12, 13, 14, 18 | All ten now name their own state. Nothing in the category resolves to another design. |
| Member buttons are conditional | 11 by construction; all seventeen by destination | Both notes on any Portal-pointed action; 11's form conditional on the connected site. |
| The no-JavaScript notice | 11 | The only design with a field; the notice replaces the form at the row's own height. |

### Answered by the owner, 28 August 2026

1. **Big Type's lifted cap — do not cut the headline.** At the 64 px floor the cap lifts and a long headline takes the lines it needs; no word is ever removed. The same answer given for the Footers category's big-type design now holds here, where the limit had been an explicit design rule. The flag is cleared on 6's frame and in §6.
2. **The proof row keeps no minimum.** Zero pairs stays legal: the row disappears and the hero still reads. Remove is always active and never has to refuse, so the rule that the Remove button never greys out is satisfied by there being no floor at all.
3. **The two member-button notes sit on the action's own editor,** and appear only when that action's destination is a Portal action — signup, signin or a paid tier. Fifteen designs whose actions point at ordinary URLs carry neither note.

### Correction pass — 28 August 2026

| What | Change |
|---|---|
| The two free designs were never put to the owner | Corrected. The category had chosen 1 Centred and 2 Flush Left on its own reasoning. A five-design shortlist of the plainest, photography-free heroes — 1 Centred, 17 Slim, 2 Flush Left, 7 Masthead, 9 Contrast Band — was put to the owner with a recommendation, and **he decided 1 Centred and 17 Slim**: 1 and 2 are the same job twice, while 17 is the interior-page hero and never looks empty. The decision is recorded as the single line **`**[Free] designs:** 1 Centred · 17 Slim`** in §0·0, which is the line the merge reads. |
| The roster badges | `A4-0 Category Proof`: design 1's badge reads **[Free] — confirmed**, **2 loses its badge**, **17 gains it**, and the settlement row now reads **1 · 17** with the owner's reason. |
| Numbering | Confirmed unchanged: **1–14 then 16–18, no 15**, seventeen designs. Nothing was renumbered. |

### Open questions

**No open questions remain in this category.**
4. **The portrait circle shows one letter,** not two — “Maya Okonjo” → M — whether the name was typed or came from Ghost. One rule across the library, and the second letter is given up deliberately.
5. **The free pair stays 1 Centred and 2 Flush Left.** Both are picture-free, so a free theme is never gated on having photography.

— End of specification —

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** seventeen designs, numbered **1–14 and 16–18** — 15 stays retired.
