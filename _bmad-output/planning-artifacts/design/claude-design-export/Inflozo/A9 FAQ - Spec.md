# A9 FAQ — written specification

15 designs · Paper pack · drawn in this project as `A9-1 Accordion.dc.html` … `A9-15 Ledger.dc.html`, with the category's shared artefacts in `A9-0 Category Proof.dc.html`.

Read `A9-0` first. It carries the four settlements §8 asks A9 to make, the question ladder, the row component and its marker, the rules all fifteen share, the roster, the shared field list, the tokenisation proof across three packs, the stress frame and the consistency pass — including **the seven amendments the drawn designs forced on it**. This document is the prose companion: one section per design, plus the shared floor that would otherwise be repeated fifteen times.

Every rule below is stated once here and once on the design's own frames and spec card, in the same words. Where a rule is invented rather than given, it is marked **Flagged**. Where the two ever disagree, **the drawn panel is the authority**.

**Specification-only pass, this session.** Every design now carries four added fields — descriptor, structural descriptor, archetype, behaviour module — at the head of its section, plus an **Items** field naming what the sidebar does with this category's repeating list. Nothing drawn changed, no frame moved and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand as written. **No module rename was needed** — this document named no modules at all, having written behaviour as motion and state rather than as JavaScript. Every module name below is the fixed 31-module registry's (FR-G7) and every no-JS sentence is quoted from it rather than composed here.

**Fourth pass — the controls-reconciliation patch (this document's current state), 24 August 2026.** The category was audited, design by design, against the PRD's control vocabulary, Ghost's verified data surface and the shared **P0 editor primitives** — the inline text toolbar and its link popover, the icon slot and Icon Picker, the item-list controls, the member-aware action editor, the “Populate from…” data panel and the editor state switcher — thinking like a person editing their own site. **Six things changed everywhere:** the universal trio (Background role · Vertical spacing · Top divider) now sits outside every design's control list and every per-design Padding and Ground row retires into it; **every visible text edits inline on canvas**, the answer raising a marks toolbar of bold · italic · link · inline code with **no underline**; **ten designs gain Open rows: Many · One at a time**, which native `<details name>` grouping gives for nothing; **fourteen gain Member visibility**, 13 Slim excepted for having no ask to gate; every panel carries a **Data group** stating the category's one data fact; and **the ten accordions' structure is corrected from `<button aria-expanded aria-controls>` to `<details>` / `<summary>`**, taking the find-in-page disclosure with it. **Three per-design additions:** 8 Contrast Band gains **Open on load**, 12 Filter's placeholder and no-match line become **fields with defaults**, and 14 Ask's button gains the **Link Picker** and an optional icon. **The control ceiling is lifted** from six per design to the PRD's ~15 plus the trio and the Data group; A9 now uses five to eight of its own. **No “Preview” control existed anywhere in A9**, so none was removed. §18 lists every frame this pass changed and every earlier ruling it overturns.

**A9 uses five modules.** `accordion` on the ten accordions — **1, 2, 5, 6, 7, 8, 10, 12, 13, 14** — `tabs` on **11**, `scroll-spy` and `share` on **7**, and `filter-strip` named on **12** as the closest module to a field it does not describe. **Four designs declare nothing: 3 Open List, 4 Cards, 9 Numbered, 15 Ledger** — the always-open five minus 11 Tabs, because always open means nothing to toggle. The head, the rows, the answers, the group labels, the numerals, the photograph and the ask panel are server-rendered in all fifteen: **no A9 design loses authored content without JavaScript.**

**`core` is assumed, not declared per design.** Every no-JS branch in A9 — the open row, the stacked panels, the absent filter field — is CSS keyed off `.js-enabled`, which is `core`'s job: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than fifteen times. *Flagged: not listing it per design is mine.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. **All five are edit-safe**, which is why every frame in A9 is a resting state.

**Three findings for the architect, and the first is the largest this category has produced.**

1. **`accordion` compiles to `<details>` / `<summary>`, and A9-0 refused exactly that** — for two stated reasons: a heading cannot sit cleanly inside a `<summary>`, and the marker and the open state cannot be styled to one rule across twelve packs. The registry owns module mechanics, so **the refusal and the ten accessibility fields that specify `<button aria-expanded aria-controls>` with a `role="region"` answer are what owe the correction**, not the registry. It also reverses a cost ten panels disclose: text inside a closed `<details>` **is** matched by a browser's find-in-page, so “a browser's find does not match them” stops being true and the disclosure that names 3 Open List needs rewriting rather than deleting. The registry's own accordion row cites “A9's `default state` control” — that control is 1 Accordion's **Open on load**, so the registry has already assumed this category compiles to `<details>` and resolves First open as the server-rendered `open` attribute. **This pass makes the correction rather than owing it:** the row is now a `<details>` whose `<summary>` holds the question's heading, `aria-expanded`, `aria-controls` and `role="region"` are gone from all ten accessibility fields, the find-in-page disclosure is rewritten in all ten panels, and **Open rows: Many · One at a time** exists because `<details name>` gives it with no JavaScript at all.
2. **`filter-strip` does not describe 12 Filter's field.** The registry's filter-strip is anchor links to Ghost routes; A9·12 is a text input filtering authored rows client-side, with no routes to link to. Named as the closest module, with the mismatch stated in that design's section. Either the registry needs a client-side filter module or the field is out of scope for a generated theme; that is the architect's call, not this document's.
3. **Deep-linking declares no module.** Settlement 2 — arriving at an anchor opens that row, scrolls it to 96 px, moves focus, animates nothing and highlights nothing — needs script the registry has no name for, and `accordion`'s no-JS branch resolves `open` server-side and cannot know the fragment. With JavaScript off an anchor still scrolls to its row and the question is visible; whether the answer is open depends on the browser's own fragment handling of `<details>`, **which the spec should not rely on**. The one part of settlement 2 a module does cover is 7 Index's copy button, which is `share`. Listed once here rather than in fifteen sections. **Written on every frame as ARCHITECT: registry addition** after this pass, per the ground rules: the no-JS state is drawn, and no module name is coined.

---

## 0. The shared floor

Everything here applies to all fifteen unless a design says otherwise.

**Nothing comes from Ghost, and the category's real problem is elsewhere.** Ghost has no FAQ resource, so every field is authored in the section, in a repeater — the same as A8. Pulling rows from posts under an internal tag was considered and refused: a post has its own URL, and a page of tagged posts is a documentation index rather than a section. The only failure available is an empty repeater, and the answer is that the section does not render. **What is new is that ten of the fifteen designs withhold the thing the section is for.** A9 is the first category in the library where most designs' resting state hides their content, and every accordion's panel says so. **Flagged**: the refusal of tagged posts.

**The universal trio, and what it retired.** Every placeable section carries **Background role**, **Vertical spacing** (Compact / Comfortable / Spacious) and **Top divider** (None / Line / Fade) outside its own control list. **A9's per-design Padding row was Vertical spacing under another name and retires into it in all fifteen** — 64 · 96 · 132 on thirteen designs, and the two with a ladder of their own keep it as the trio's resolution rather than as a second row: **8 Contrast Band's band padding, 44 · 64 · 88** (on that design the band *is* the section) and **13 Slim's 32 · 44 · 56**. Ladders that measure something else keep their names and their rows: **15 Ledger's Row padding**, and 13 Slim's fixed 14 px row, which is not a control at all. **13 Slim's Ground row retires into Background role**, keeping its argument and losing only the row. **Background role is locked at Contrast on 8 Contrast Band**, whose band is the design rather than a value of it, with the reason shown at the lock; **Contrast is disabled on the other fourteen** with 8 named. **Top divider is locked None where the design already draws a rule at its own top edge**: 3 Open List at Rules Above and below, 13 Slim at Above and below and at Above only, 15 Ledger at Above and below, and 8 Contrast Band at Band width Full bleed. **Flagged**: which designs lock which row, and the reading that a band's padding is a section's spacing.

**Everything visible edits inline, on canvas.** Eyebrow, title, sub, note and the link label take the **P0·1 floating toolbar** — bold · italic · underline · link, the link popover carrying “Open in new tab” and rel nofollow / noreferrer / sponsored. **The questions, the answers and the group labels edit inline too**, selected where they are drawn rather than only in the sidebar repeater. **The answer raises the marks toolbar on selection with bold · italic · link and inline code, and no underline** — an underline inside prose is a link that is not one, and settlement 3 allows inline code where A8's quote allowed no marks at all. That mark set is **a PRD delta, recorded rather than smoothed over**. **A group label lives in a second repeater, so renaming it on canvas renames the group for every question in it**, and the confirm says so before it happens. **Nothing in A9 is Ghost-owned** — the category reads no Ghost resource — so **nothing in it ever says “Edit in Ghost”**, and every URL field opens the Ghost-aware **Link Picker** with its new-tab and rel options.

**No fixed English visitor-facing string ships.** A9 shipped three, in two designs, and this pass splits them by who owns them. **Fields, with defaults:** 12 Filter's `filterPlaceholder`, default “Filter questions”, and its `noMatch`, default “No question here mentions “{term}”.” with `{term}` filled at render — a site that filters in Dutch can say so, and the default still says what the field does rather than what a search would do. **Theme catalog strings:** 12 Filter's visually hidden input label and its Clear button's name, and 7 Index's “Copy link to this question”, “Link copied” and the index's “On this page” — the theme's to translate, not the section's to type. **Flagged**: which of the two routes each string takes.

**Member visibility, and the one design that cannot have it.** Every design that bears an ask carries **Member visibility — Everyone / Logged out / Free members / Paid members**, applied server-side to the whole section: a FAQ about cancelling, gifting and what happens to an address is written for members, and the section link can be a Portal target. **Fourteen designs carry it.** **13 Slim does not**: it draws no head, no note, no link and no button at any value, so there is no ask to gate — which also makes it **the one design in A9 a site cannot hide from a member state**, named here rather than buried. **14 Ask is where the control earns its place**, its filled button being the category's one action, and that button uses the **P0·4 member-aware action editor**. **Flagged**: the fourteen-and-one split.

**The Data group, on all fifteen panels.** Outside the design's control list, a **Data** group states the category's one data fact — nothing here comes from Ghost — with the refusal of tagged posts and the seven refusals of ornament on record where a site would look for them rather than only in this document. **No “Populate from…” panel is offered on any A9 design**: there is nothing to populate from.

**The shared field list — thirteen fields.** Section: `eyebrow` text opt ≤ 26 · `title` text opt ≤ 104 · `sub` text opt ≤ 178 · `note` text opt ≤ 120 · `linkLabel` text opt ≤ 20 · `linkUrl` url opt · `image` image opt · `imageAlt` text opt ≤ 120. Groups, in `groups[]`, none to six: `groupLabel` text **req** ≤ 24. Items, in `items[]`, one to twenty-four: `question` text **req 12–120** · `answer` limited rich text **req 20–900** · `anchor` slug, seeded from the question on first save and editable · `group` reference opt, empty meaning ungrouped. `linkLabel` and `linkUrl` are a pair: one without the other is not drawn. `image` is read by **10 Image Split** alone and kept by the other fourteen. `groups[]` is read by **6 Grouped, 7 Index and 11 Tabs** and kept by the other twelve. **Twenty-four is the ceiling**, reached by 7 Index and 12 Filter only. **Flagged**: the ceiling, the stored anchor, the group cap of six and the 24-character label.

**Settlement 1 — accordion and always-open are designs, not two values of one control.** Ten accordions (1, 2, 5, 6, 7, 8, 10, 12, 13, 14) and five always-open (3, 4, 9, 11, 15). A control that turned eight closed rows into eight open ones would rebuild the section under the site. **Many rows may be open at once, and Many is the default**, because a reader holding two answers side by side is the ordinary case. **One at a time now exists as a value:** the ten accordions carry **Open rows — Many · One at a time**, which is native `<details name>` grouping — one open row per group, no JavaScript, nothing remembered between visits, and the same drawing with JS off. The blanket refusal this settlement used to carry was written against a JavaScript cost the registry's `<details>` compilation removes; **the scope is stated per design** — one name group per section everywhere, including across 2 Two Column's two columns, and **one group per group in 6 Grouped and 7 Index**, where the group is the unit a reader is reading in. **Open on load has two values, All closed and First open, and is offered in 1 Accordion and 8 Contrast Band**; in the other eight accordions All closed is fixed and stated in the panel. **There is no All open** — that is 3 Open List. **An Expand all control is refused at every value.** The open state is never remembered between visits, nothing auto-opens on scroll, and nothing runs while editing. **Flagged**: all of it.

**Settlement 2 — deep-linking.** Every row has an anchor in every design, the always-open five included. **The `anchor` is stored, seeded from the question on first save**, so editing a question does not break a link somebody has already sent. Arriving at it **opens that row and leaves every other row exactly as the design would have drawn it** — the closed rows stay closed; the question scrolls to 96 px below the viewport top; **focus moves to the row’s summary**, or to the heading via `tabindex="-1"` in the always-open designs; the row is **open on arrival without the 160 ms animation**; and there is **no highlight, flash, pulse or accent tint**. A row inside a container opens its container: 11 Tabs selects the tab, 12 Filter loads unfiltered with an empty field, 6 Grouped and 7 Index draw every group at all times. **Opening a row does not write to the URL and does not push a history entry.** A visible copy-link affordance is drawn in **7 Index** only. **Flagged**: the stored anchor, the 96 px margin, the focus move, the refusal of a highlight, the history rule and the single copy-link design.

**Settlement 3 — the answer.** Limited rich text, **20 to 900 characters**. Allowed: paragraphs, one level of unordered or ordered list, inline links, inline code, bold and italic. **Refused: headings, images, embeds, tables, blockquotes, multi-line code blocks, buttons and nested lists** — an answer that needs a heading is a page with sections, one that needs a table is a comparison, one that needs a screenshot is documentation, and `C Post Body` owns full rich text. **The measure is 620 px at every width above 767, whatever the design's row is**: the question takes the row's full width and the answer is capped at 620 and sits at the row's left edge. **The answer is 16 px on 1.65 in `text`, never muted, and never steps with the question** — it is reading matter rather than meta, which is where A9 parts from A8's muted role lines. Paragraphs 12 px apart; lists at a 20 px indent with markers in `text-muted`, items 8 px apart, 12 above and 8 below the list. Links take the section link's treatment at body size — `text` with a 1 px `accent` underline at a 3 px offset, 2 px on hover. Inline code is mono at 0.92em on the hover surface, 1 × 5 px of padding, at the pack radius. **13 Slim is the one design that refuses lists and code**, and caps its answers at 300. **Flagged**: the allowed list, every refusal, the ceiling, the 620 measure and its left alignment, the answer taking `text`, and the code treatment.

**Settlement 4 — two columns.** **2 Two Column is the only two-column list of questions in A9.** Two independent lists split by count, the first half at the left and the second at the right, **the extra row going left on an odd count**, **equal in number of rows and never equalised by height**. Both alternatives are refused for what they do when a row opens: **CSS multi-column reflows items across the break**, so opening question 2 moves question 4 into the other column; **a row-major grid couples two rows into one height**, so opening question 1 leaves a hole beside question 2. At ≤ 767 the two lists stack and read as one sequence in authored order; the split is applied above 767 and not below it, so **nothing is reordered at any width and the DOM never changes**. **Flagged**: all of it.

**The question ladder is A9's one new scale.** Row 17 · Large 20 · Feature 24 at 1440; 17 · 19 · 22 at 834; 17 · 18 · 20 at 390. Line height 1.4, tracking 0, **weight 600 in every pack**. **The question takes the pack's body font, not its heading font** — in ten designs it is the label on a button, and eight questions in a display serif is eight headlines. **The heading font appears once per section, on the title**, and once more in 9 Numbered's numerals. **Flagged**: the ladder, the body font and the numerals exception.

**The head is A6's title ladder unchanged** — Medium 34 · Large 40 · Display 48 at 1440, 30 / 34 / 38 at 834, 26 / 28 / 30 at 390 — on a 780 px measure; sub 17 px muted on 620 (560 at 834); eyebrow 13 px uppercase tracked `.08em` muted; **head to rows 48 px**. **Two designs draw no head at all and keep the fields: 13 Slim and 15 Ledger.** 9 Numbered caps the title at Medium 34; 5 Split Head and 10 Image Split cap it at Large 40.

**The row is one component.** A hairline `border-top` on every row and **none under the last**, so a list of eight has eight rules and not nine. Row padding **Compact 16 · Comfortable 20 · Spacious 28**, following the question's step rather than taking a control — **except in 13 Slim, which fixes it at 14, and 15 Ledger, which gives it its own control**. The whole row is the `<summary>`, **44 px minimum target at every width**. The marker sits at the right in `text-muted`, going to `text` on hover and while open, and **is aligned to the question's first line, never centred against the row**. Question to answer follows the question's step: 12 at Row, 16 at Large, 20 at Feature. **Hover fills the row with the hover surface and extends 16 px past the measure on both sides**; the hairline does not move; **the open row takes no plane, no accent tint and no border change**. **Flagged**: the padding scale, the marker's colour behaviour and first-line alignment, the step-linked gap, the hover overhang, and the last row carrying no hairline.

**The marker has two values and no third.** **Chevron · Plus** — a 20 px box holding a 9 px chevron or a 14 px plus in 1.5 px strokes, always at the right. There is no None: a row with nothing at its right does not look openable, and the five always-open designs draw no marker because they have nothing to open. **The plus loses its vertical bar rather than rotating** — a plus that rotates into a cross says close, and nothing here closes. **The marker is never the accent**, in any pack or mode, and **it is not A1·14's icon button**: no box, no border, no fill, and the target is the row. **Flagged**: both values, the refusal of a third, the position and the stroke weight.

**Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; the set a `<ul>` of `<li>`. **Every question is a heading** — an `<h3>` in twelve designs, an `<h4>` under a group label's `<h3>` in **6 Grouped and 7 Index**; **11 Tabs reads the same field and keeps `<h3>`**, because its tab is the label and no heading is drawn inside the panel. A reader using a heading rotor gets the whole question list in one gesture, which is the largest single accessibility win a FAQ can offer. **In the ten accordions the row is a `<details>` whose `<summary>` holds the question's heading, and the answer is that `<details>`'s own content** — no `aria-expanded`, no `aria-controls` and no `role="region"`, because the element carries its own open state and nothing has to be kept in step with it. The native marker is suppressed and the category's own is drawn. **In the five always-open designs there is no `<details>` and no summary at all**, because a disclosure nobody can toggle is a door in a wall. **Two designs have no `<h2>` and take no accessible name: 13 Slim and 15 Ledger.**

**Three structures were considered; two stay refused and one is now what A9 uses.** `<dl><dt><dd>`: a question is not a term, a three-paragraph answer is not its definition, and the questions stop being headings. **`<details><summary>`: refused before this pass and now the structure the category uses.** The registry owns module mechanics and `accordion` compiles to it, so the two objections were answered rather than argued: the heading sits *inside* the `<summary>` — the summary is the row, the heading is its content — and the marker and the open state are styled by suppressing the native marker and drawing A9's own, which is what the packs already do. **What the reversal buys is the cost ten panels used to disclose: a browser's find matches text inside a closed row and opens the row it found.** `role="tablist"` for an accordion: an accordion is not a tab set, and A5·12 owns tabs. **Flagged**: both surviving refusals, and the reversal on `<details>`.

**The accordion's cost, stated in ten panels.** Closed answers are in the DOM, inside a closed `<details>` — not removed, not `hidden`, not lazily fetched — so the page's source is complete. **What a closed row costs is a reader scanning: they do not see the answer.** What it no longer costs is find-in-page: **a browser's find matches text inside a closed `<details>` and opens the row it found**, so the disclosure ten panels carried is rewritten rather than deleted, and each still names **3 Open List** for a site whose readers should not have to search at all. **11 Tabs' cost is untouched by the correction**: its inactive panels are `hidden`, which is correct for a tablist and does mean a find misses them. **Flagged**, following A8·11's disclosure.

**No `FAQPage` schema in any of the fifteen.** The section cannot know what the page is: three FAQ sections on one page would emit three graphs, and a marketing page with a FAQ band is not a FAQ page. A site that wants the markup adds it once, at page level, in code injection — the only place it can be written truthfully. **Flagged**.

**Motion: one behaviour, in ten designs.** The answer's height animates 160 ms ease-out and the marker rotates in the same 160 ms, one transition per state change. **Under reduced motion both are instant and the row still opens** — the arrangement, the thresholds and the open state are unchanged. **11 Tabs' tablist and 12 Filter's field are the category's two other reader-driven behaviours**; the filter animates nothing at any motion setting. Nothing runs on a timer, nothing opens on scroll, nothing runs while editing, and **every frame in A9 is a resting state**.

**Focus** is A6's ring verbatim: 2 px accent, 2 px outside, the inner gap taking the ground, the carried colour on a band. **The ring hugs the whole row**, not the question's text and not the marker.

**The accent is spent in four places and nowhere else:** a link's underline — the optional section link and every link inside an answer — **11 Tabs' active tab underline**, **7 Index's current-group item** (A1·1's active nav item), and the focus ring. The marker is muted or `text`, an open row takes no tint, and a group label is not accented. **8 Contrast Band substitutes the band's carried colour for all of them**, because the pack's dark accent is 2.3:1 on the light band. **14 Ask carries the category's one filled accent button.** Two designs can contain no accent pixel at all: 3 Open List and 15 Ledger with no link authored.

**Seven stated refusals.** No Expand all or Collapse all — that is 3 Open List, chosen once by the site. No question count in the resting state, and no per-group count — **12 Filter's count while the field has text is the stated exception**. No “Was this helpful?”, votes or thumbs: Ghost stores no answer to that question. No icon per question — the marker is the only glyph in a row. No chat launcher, “ask AI” or search-the-site field. No accordion inside an accordion, and no answer that opens a second answer. No “popular”, “new” or “important” flag on a row — order is the site's statement of priority, and 9 Numbered is the design that makes it visible. **Flagged**: all seven.

**Print: every row prints open, in every design, and the marker is not printed.** A printed FAQ with eight closed rows is eight questions and no answers. 8 Contrast Band drops its band, 12 Filter drops its field, 7 Index drops its index, 11 Tabs prints every group, 14 Ask prints its label with the URL beside it. **Flagged**.

**Section padding Compact 64 · Comfortable 96 · Spacious 132**, 80 at 834, 64 at 390; page margin 72 / 40 / 20; content width 1,296. Two designs carry their own scale: **8 Contrast Band's band at 44 · 64 · 88** (A4·9's) and **13 Slim's at 32 · 44 · 56** (A7·8's).

**Responsive floor.** A one-column list of rows needs no collapse, which is why eleven designs change nothing but their type and their padding. **What collapses is a second axis:** 2 Two Column's two lists stack at ≤ 767 · 4 Cards takes two columns at 1080 and one at 767 · 5 Split Head puts its head above the rows at 1080 · 7 Index moves its index above the rows at 1080 · 10 Image Split stacks image over rows at 1080 · 11 Tabs hands its behaviour to 6 Grouped at 767 · 15 Ledger puts its answer under its question at 1080. **The authored order is the drawn order at every width in all fifteen.**

**Empty.** No eyebrow, sub, note or link → absent. No groups → the designs that read them hand off. **No items → the section does not render**; the editor shows the empty repeater and its Add question control. An item cannot be saved without both a question and an answer, so there is no half-row to draw. One item where a design wants more → the design named in its panel.

**The item list — where it lives, and the rules that hold in all fifteen.** The repeater sits in the sidebar below the design's own controls: one row per item showing its question, a drag handle, a remove action, and **Add question** at the end. **It is P0·3's shared item-list control, unchanged:** add arrives with content, remove is never disabled, drag reorders, per-item content only — and because nothing in A9 comes from Ghost, **every list in the category is authored, so Add is offered on all of them**. Selecting a row on the canvas selects it in the repeater and opens that item's fields; ⌥↑ / ⌥↓ moves the focused row. The three designs that read `groups[]` — **6 Grouped, 7 Index, 11 Tabs** — show a second repeater above it, each group holding its own questions.

**Add never produces a blank row.** A new item arrives as **“What does a membership include?”** / **“Answer this in two or three sentences. Keep it to one idea.”**, lands last, and opens its question for typing. Both fields clear their minimums, so the item is savable the moment it exists — which matters in A9, because an item cannot be saved without both a question and an answer, and a half-item would be a row the section refuses to draw. The `anchor` is seeded from the question on first save. *Flagged: the seeded wording is mine.*

**Remove is never disabled in A9.** Every design draws one row, and a design with a floor **hands off to the design named in its panel rather than blocking the edit** — the list is the user's, and what to draw at five rows is the theme's problem. Removing the last item empties the list, at which point the section does not render. *Flagged: mine — A3 disables remove at a design's minimum; A9 hands off instead, because it already has hand-offs for every other count.*

**Reorder is meaningful in all fifteen**, because authored order is drawn order at every width and **order is the site's only statement of priority** — which is why A9 refuses “popular”, “new” and “important” flags. Three designs make it consequential rather than merely visible: **9 Numbered**, where order *is* the numbering; **2 Two Column**, where order decides which column a row lands in; **11 Tabs**, where the first group is the panel a reader is given on load.

**Counts.** One is the field's floor and **twenty-four its ceiling**; Add question is disabled at twenty-four with “Twenty-four is the most a FAQ section holds. A longer list is a documentation page.” A design's Rows shown control caps what is *drawn*: fewer authored than shown draws what exists, and **more authored than shown draws the first N, keeps the rest, and the panel reads “6 of 9”**. Where a count falls below what a design is built for it hands off, per design. *Flagged: the twenty-four message, the overflow behaviour and the “N of M” wording are mine — the drawn panels state the fewer-than-shown case only.*

**Zero items** is the category's one real failure and the shared floor already answers it: **the section does not render**, and nothing partial stands in for it — no head on its own, no band, no field, no ask panel, no empty card. The editor shows the empty repeater and its Add question control.

**Inside an item the user edits content only:** `question`, `answer`, `anchor`, and `group` where a design reads it. Nothing about an item's layout, spacing, alignment or emphasis is exposed anywhere in A9. **Design controls write one value onto the section and every item reads it** — Question size, Marker, Row padding, the card's fill, the band's derived mixes — so “open row three by default” and “make card three wider” are not expressible by construction. **A9 already ships the pair that proves the rule**: 1 Accordion and 8 Contrast Band are the same rows on two grounds, and 3 Open List is what an all-open control would have been. **Two designs refuse a per-item control in writing:** 9 Numbered refuses a numeral field, and 12 Filter refuses a per-item keyword field.

**The optional field inside an item, and what empty looks like.** `anchor` is optional to touch and never empty in effect. **`group` is the only field whose emptiness is visible**, and only in three designs: **6 Grouped** draws ungrouped questions as a final unlabelled set, **7 Index** does the same and does not list them in the index because there is no label to list, and **11 Tabs** does not draw them at all and says how many are being left out. In the other twelve `group` is kept and inert.

**Content.** Orbit Weekly's membership questions throughout. Head: eyebrow **Questions**, title **“What members ask us most”**, sub **“If your question is not here, write to us and a person will answer it.”**, note **“If something here is out of date, tell us and we will fix it.”**, link **“Email the editors”**. The first four questions are settlement 3's four answer shapes in order: **“What do I get with a membership?”** (a paragraph and a three-item list) · **“When does the Thursday letter arrive?”** (one sentence) · **“Can I read the archive without a membership?”** (a paragraph with a link) · **“How do I cancel?”** (two sentences, no formatting). Eight more carry the longer designs: **“Do you offer student rates?”** · **“The letter isn't arriving. What should I check?”** (a list with inline code) · **“Can I gift a membership?”** · **“Is there an app?”** · **“Do you take corporate subscriptions?”** · **“What happens to my email address?”** · **“Can I write for Orbit Weekly?”** · **“Where does the printed quarterly ship?”** Four group labels: **Membership · The letter · The archive · Everything else**. **Flagged**: every fact inside these answers is invented — the Thursday 07:00 send, the student rate, the printed quarterly, the corporate threshold, the RSS path.

---

## 1 · Accordion

One column of hairline rows on a 780 px measure, centred in the 1,296 width. The design a site reaches for when it types “FAQ” into the picker, the one A9-0's row component was drawn for, and **the design seven others hand off to**.

**Descriptor.** The category's floor accordion — one column of hairline rows with nothing added to it, the only design with no count control and the only one offering Open on load, and the arrangement seven others hand off to rather than inventing one of their own.

**Structural descriptor.** `stack · none · page · variable · none · full-width row as button`

**Archetype.** stack

**Behaviour module.** `accordion`. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” **The `default state` the registry names is this design's Open on load**, and First open compiles as the `open` attribute on the first row — which is why this and 8 Contrast Band, which gains the control in this pass, are the two designs whose open state exists without script. What the module adds is the 160 ms height transition and the marker's rotation, and nothing else. The category's two `accordion` findings — the `<details>` refusal and the reversed find-in-page cost — are stated once at the head of this document and apply here first, because this is the design ten panels' disclosure was written for.

**Items** · `items[]` at full range; every other design's item rules are stated against this one.

- **Add.** *Add question* at the foot of the repeater; lands last, seeded as the shared floor says, question open for typing.
- **Remove.** On the row, undoable, never disabled. **This design has no floor** — one row is a legitimate section and it hands off to nothing — so removing down to one is an ordinary edit and removing the last empties the list.
- **Reorder.** Meaningful: authored order is drawn order at every width, and with no count control the order is the whole of what the section says about priority.
- **Counts.** 1–24, drawn for four to twelve. **No Rows shown control — every authored question is drawn**, which is why the panel reads “24 of 24” and why this design never keeps an item it does not draw.
- **Zero.** The section does not render; the repeater shows Add question and a line saying so.
- **Inside an item.** `question`, `answer`, `anchor`; `group` kept and inert. **Open on load writes First open onto the section, not onto a row**, so “open row three by default” is not expressible — the rule's clearest case in the category.

**Fields** · every field except `image`, `imageAlt` and `groupLabel`; **every item of `items[]`, one to twenty-four**. `group` kept and ignored.

**Controls** · Head: Centred · Flush left · None. Title size: Medium 34 · Large 40 · Display 48, unavailable at head None. Question size: Row 17 · Large 20 · Feature 24. Marker: Chevron · Plus. **Open on load: All closed · First open** — shared with 8 Contrast Band after this pass, and refused in the other eight accordions with the reason stated in each panel. **Open rows: Many · One at a time**. Member visibility: Everyone · Logged out · Free members · Paid members. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Arrangement** · list 780, answer 620 at the row's left edge; **row padding follows the question, 16 · 20 · 28**; **Rows shown is not a control — every authored question is drawn**, so the panel reads “24 of 24”. The list follows the head's alignment: centred on 780, or at the left margin.

**Responsive** · nothing collapses. List 780 → 690 at 834 → the full column at 390; **the answer's 620 measure is a cap and does not scale**. At 834: padding 80, title 34, question one step down, sub on 560. At ≤ 767: padding 64 / 20, row padding 14 with a 44 px target, list indent 20 unchanged.

**Empty** · head parts, note and link → absent; at head None there is no `<h2>` and no accessible name. **One question → one row.** This design has no floor and hands off to nothing.

**a11y** · the row a `<details>` whose full-width `<summary>` holds the question's `<h3>`; the answer the `<details>`'s own content, with no `aria-expanded`, no `aria-controls` and no `role="region"` to keep in step with it; a closed row is a closed `<details>` and not a `hidden` panel. One tab stop per row, Enter and Space, **no arrow-key navigation** — an accordion is not a composite widget and stealing the arrow keys stops a reader scrolling. Marker `aria-hidden`, never the only signal. Contrast: question 15.8:1 / 15.1:1, marker 5.6:1 / 6.2:1 resting, underline 3.3:1 / 6.3:1.

**Flagged** · the 780 list and its 690 tablet step; the answer at the row's left edge rather than indented; **drawing every authored question with no count control**; row padding following the question; the 16 px hover overhang; the plus losing its bar; refusing arrow keys; the panel's find-in-page wording.

---

## 2 · Two Column

Two independent lists of 632 on a 32 px gutter, split by count. Settlement 4, built.

**Descriptor.** The only design that divides one list into two independent columns — split by count and never equalised by height — which is what makes settlement 4's two refusals visible on the page.

**Structural descriptor.** `split · none · page · many · none · count-split into two lists`

**Archetype.** split

**Behaviour module.** `accordion` — one module across two lists, not one per column. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” **Open on load is not offered here, so the `open` attribute is never set**: with JavaScript off this design is its own resting state exactly — eight closed native rows in two columns, the split being CSS and the stack at ≤ 767 a media query. The divider, at either value, is CSS.

**Items** · `items[]`, and the one design where the count is a layout instruction.

- **Add.** Lands last, which at Eight shown is the foot of the right column — and at Six shown the addition of a seventh redraws the split as 4 + 3 the moment Rows shown reaches it.
- **Remove.** Never disabled. At five drawn the split is 3 + 2; **at four or fewer authored the design hands off to 1 Accordion** and the sidebar says so, because two columns of two rows is a table of contents.
- **Reorder.** Meaningful twice over: order sets the reading sequence, and **order decides which column a row lands in**. At eight, moving row five to position four moves it from the head of the right column to the foot of the left.
- **Counts.** Five to twenty-four authored, six, eight or twelve drawn; extra authored items are kept and not drawn. Designed for eight and twelve, where two columns earn the width.
- **Zero.** The section does not render — neither column, no divider.
- **Inside an item.** As 1 Accordion. **Nothing about an item decides its column** — the count does, and the extra row on an odd count goes left by the section's rule.

**Fields** · 1 Accordion's exactly, **six, eight or twelve items**. Switching to or from 1 Accordion changes the arrangement and nothing else.

**Controls** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Question size: Row 17 · Large 20** — Feature 24 not offered, Row forced at 834 and below. **Divider: Gutter · Rule**, the rule's inset 32 at 1440 and 20 at 834. Rows shown: Six · Eight · Twelve. **Open rows: Many · One at a time**, one name group across both columns, so opening a row on the right closes the row open on the left. Member visibility: Everyone · Logged out · Free members · Paid members. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Not offered, and stated in the panel** · Open on load, because First open would open the left column alone and read as a mistake in the right; Marker, because two columns of plus signs read as arithmetic.

**Arrangement** · 632 · 32 · 632 = 1,296 at Gutter. **At Rule, two halves of 648 and 647 with 32 px of inset either side of the hairline, measures 616 and 615** — 616 + 32 + 1 + 32 + 615 = 1,296, and the rule's own pixel comes out of the right half, which is the only asymmetry an odd content width allows. Both columns top-aligned and **never equal in height**. Row padding follows the question, 16 or 20. The answer takes the column inside its padding, capped at 620. The rule is a `border-left` and runs the height of the taller column.

**Responsive** · two columns above 767. At 834, 365 + 24 + 365 = 754 inside the margins, halves 377 and 376 at a 20 px inset, **the question forced to Row 17 and the control saying “Row at this width”**. **At ≤ 767 the two lists stack and read as one sequence in authored order**; the divider is not drawn.

**Empty** · fewer authored than shown → that many drawn, still split by count. **Four or fewer → hands off to 1 Accordion**, because two columns of two rows is a table of contents.

**a11y** · **two `<ul>`s, not one** — two independent columns, and pretending otherwise would misreport where a row's neighbours are; it costs a screen-reader user one extra “list of four” announcement, and the panel says so. The lists take no roles, labels or headings. Tab order 1 to 8, authored order at every width. The divider is decorative. Every row prints open in one column.

**Flagged** · the 632/32 division and the 648/647 Rule halves; the count split and the extra row going left; **both refusals and their reasons**; two lists rather than one and its stated cost; the default at Row 17; the forced Row and 20 px inset at 834; not offering Open on load or Marker; the hand-off at four.

---

## 3 · Open List

Every answer drawn: question above answer, rows between hairlines, one column on 780. **No button, no marker, no region, and — unless a link is authored — nothing focusable in the whole section.** The design ten accordion panels name.

**Descriptor.** The only design that draws every answer with no button, no marker and no region — nothing here can be hidden by a state, which is why ten accordion panels name it.

**Structural descriptor.** `stack · none · page · many · none · every answer drawn open`

**Archetype.** stack

**Behaviour module.** **none.** There is nothing to declare: no button, no region, no hover, no motion, and the anchor is an `id` on a heading. **JS off:** the design is identical — print, screen and no-JS are one drawing. **This is the state the ten accordions degrade towards**, which is the strongest form of the argument their panels already make. Deep-linking's focus move is the category's script and the category's finding, not this design's; without it the anchor still lands on a question whose answer is already visible.

**Items** · `items[]`, every one drawn open.

- **Add.** Lands last, seeded as the shared floor says. Because every answer is visible at all times, **a seeded answer left as it arrived publishes as it arrived** — there is no closed row to hide it.
- **Remove.** Never disabled; no hand-off at any count. **One question is one row with no hairline under it.**
- **Reorder.** Meaningful; authored order, no columns and no groups to fall into.
- **Counts.** 1–24 authored, four, six or eight drawn; extra kept and not drawn, and the panel names 1 Accordion for a longer list — eight open answers is already a page of prose.
- **Zero.** The section does not render.
- **Inside an item.** `question`, `answer`, `anchor` — the anchor drawn even though nothing opens, so a link into this design lands where it would in every other one. `group` inert.

**Fields** · 1 Accordion's, **four, six or eight items**. The `anchor` is drawn as an `id` on the `<h3>` even though nothing opens, so a link into this design lands where it would in every other one.

**Controls** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20 · Feature 24. **Rules: Between · Above and below · None.** Rows shown: Four · Six · Eight. Member visibility: Everyone · Logged out · Free members · Paid members. **Open rows is not offered:** nothing here closes. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider **locked None** at Rules Above and below, where the design draws its own top rule. Plus the **Data group**.

**Arrangement** · 1 Accordion's row with the button taken out: same 780 list, same 620 answer, same row padding and same step-linked gap. **At Rules None the rows sit 40 px apart whatever the padding control says** — the row padding is what a hairline needs on each side of it, and with no hairline 20 px does not end an answer. **The answer stays 16 px at every question size**, so the ratio narrows from 20:16 to 17:16 and the hierarchy is carried by weight.

**Responsive** · nothing collapses; the 620 cap and the 20 px list indent do not scale. At ≤ 767: padding 64 / 20, answer 16 / 1.6, row padding 16.

**Empty** · **one question → one row with no hairline under it**; no hand-off at any count. **Nothing here can be missing at a width or hidden by a state.**

**a11y** · `<h2>`, `<ul>`, `<h3>` and prose. **No `<details>`, no `<summary>`, no button, no `role="region"`, no marker, no hover, no motion.** The `<h3>` carries `tabindex="-1"` so a deep link can move focus without adding a tab stop — **the only `tabindex` in A9's accordions' sibling designs**. **Print and screen are the same drawing.** In forced colours the design is unchanged apart from the system's colours.

**Flagged** · reusing 1 Accordion's row rather than drawing a second; **holding the answer at 16 px while the question steps**; the 40 px Rules None value; the `tabindex="-1"` heading; eight as the ceiling; drawing the anchor where nothing opens; the panel's advice to use 1 Accordion for long answers.

---

## 4 · Cards

One question and its answer per card, three of 416 on a 24 px gutter — A8·2's grid and card carrying a question. Always open, because **a card that has to be pressed to show its contents is a card with nothing in it**.

**Descriptor.** The only design that gives each question a card of its own, so what a reader sees is the item's geometry rather than the section's — and the only one where a row of items shares a height.

**Structural descriptor.** `grid-of-N · none · page · few · none · one question per card`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Always open by construction — a card that has to be pressed to show its contents is a card with nothing in it — so no button, no region, no marker, no hover and no motion. The equal-height row is CSS. **JS off:** identical.

**Items** · `items[]`, one item per card.

- **Add.** Lands last, filling the grid left to right and top to bottom. At Questions shown Three a fourth item is kept and not drawn until the control is moved to Six — the one design where Add can appear to do nothing, and the panel's “3 of 4” is what says otherwise.
- **Remove.** Never disabled. **At two, two 416 cards centre rather than widen; at one the design hands off to 1 Accordion**, because a single card is a card with a question in it and not a FAQ.
- **Reorder.** Meaningful: order fills the grid, so moving an item changes both its place and **which row it shares a height with**.
- **Counts.** Designed for three and six — a full row and two full rows. 1–24 authored, extra kept and not drawn; five at Six draws five and the last cell is **absent, not empty**.
- **Zero.** The section does not render — no empty cards, no ghost cells.
- **Inside an item.** `question`, `answer`, `anchor`. The 450-character counter is advice on every item at once and truncates nothing. **Card fill and card padding are the section's one value read by every card**: “make card three bigger” is not expressible, and a design that needed it would be two designs.

**Fields** · head fields, note, link pair, **three or six items**.

**Controls** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Columns: Two · Three.** Questions shown: Three · Six. Cards: Surface · Ground. Member visibility: Everyone · Logged out · Free members · Paid members. **Open rows is not offered:** a card that has to be pressed to show its contents is a card with nothing in it. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**. The Cards row above sets the **card's** fill; Background role sets the **section's** ground, and the panel keeps the two apart.

**Not offered** · Question size, fixed at Row 17 because 20 px in a 416 card runs most questions to three lines; Marker and Open on load; Hairline columns, refused as in A8·4 — a vertical rule that stops between two rows is a table's rule without a table's header.

**Arrangement** · 416 · 24 at three columns, 632 · 32 at two; **card padding follows the count, 28 and 32**; pack radius, 1 px hairline, **no shadow at any value**; question to answer 12; the answer takes the card inside its padding. **Rows are equal within a row and never across the grid**, the slack falling at the foot of the short cards; nothing is truncated, clamped or moved to another row. **The editor's counter turns muted past 450 characters and names 1 Accordion**; the field's ceiling is still 900.

**Responsive** · three columns above 1081; **two at 1080 and below at both Columns values**, disclosed as “Two at this width” — 365 cells on 24 at 834, card padding 24. **At ≤ 767 one column 16 px apart, and every card is its own height because there is no row.**

**Empty** · **fewer authored than shown draws what exists** — five at Six is five cards and the last cell is absent, not empty. **Two → two 416 cards centred, not widened; one → hands off to 1 Accordion.**

**a11y** · **one `<ul>` of six, never two lists of three**; `<h3>` per question with `tabindex="-1"`; no button, region, marker, hover or motion; cards are not links. The equal-height stretch is invisible to assistive technology. **In forced colours the card keeps its hairline and loses its fill, which makes Surface and Ground the same drawing** — stated, not corrected. Print: one column, hairlines kept.

**Flagged** · fixing the question at Row 17; the 12 px gap in a card; **the 450-character advice**; six as the ceiling; two cards centred and not widened; the hand-off at one; the forced-colours note.

---

## 5 · Split Head

The head in a 416 px column at the left margin, the accordion in an 824 px column at the right, on A8·6's 56 px gutter. **The head does not move when a row opens** — it is not centred against the list, which is why the top alignment was worth inheriting.

**Descriptor.** The only design that puts the head in a column of its own beside the rows, so the publication's voice and the reader's questions sit side by side — and the head does not move when a row opens.

**Structural descriptor.** `split · none · page · many · none · head column beside rows`

**Archetype.** split

**Behaviour module.** `accordion`, on the rows column only — the head column declares nothing. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” Open on load is not offered, so `open` is never set; the Foot control is markup order and the 1080 collapse is a media query, so **the whole design except the row's height transition survives with JavaScript off**.

**Items** · `items[]`, in the right-hand column.

- **Add.** Lands last in the rows column. The head is not in the list and cannot be reordered into it.
- **Remove.** Never disabled. **At two or fewer authored the design hands off to 1 Accordion** — a 416 px head column beside two rows is a head with a footnote.
- **Reorder.** Meaningful among the rows; the head, the note and the link are section fields and hold their places at both Foot values.
- **Counts.** Three to twenty-four authored, five or eight drawn, extra kept and not drawn. Designed for eight, which is the count that makes the 824 column worth its width.
- **Zero.** The section does not render — **the head column included**. A head beside nothing is not a section, which is the case worth stating here: this design has the most to lose to an empty list and loses all of it.
- **Inside an item.** As 1 Accordion. The 620 cap inside an 824 row is the section's measure, not an item's property.

**Fields** · every field except `image`, `imageAlt` and `groupLabel`; **five or eight items**.

**Controls** · **Title size: Medium 34 · Large 40** — Display 48 not offered in a 416 column. Rows shown: Five · Eight. Head column: Left · Right. **Foot: Under the head · Under the rows.** Marker: Chevron · Plus. **Open rows: Many · One at a time**. Member visibility: Everyone · Logged out · Free members · Paid members. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Not offered** · Question size, fixed at Large 20 — Row 17 in an 824 row reads as small print beside a 40 px title; Head alignment, because the head column is always left-aligned inside itself; Open on load.

**Arrangement** · 416 · 56 · 824 = 1,296, both columns top-aligned, **the head never sticky and never vertically centred**. Row padding 20, question to answer 16, **the answer capped at 620 inside an 824 row** — the widest gap in A9 between a row's width and its answer's measure. Head to sub 12, sub to foot 20. **The foot is under the head by default** — the note and the link are the publication speaking and the rows are the reader asking. **Under the rows takes a rule above it**, the same hairline that separates two questions, **which makes the note look like one more row**. The note and the link always travel together. Head column Right is `row-reverse`, visual only.

**Responsive** · **the split is what leaves.** At 1080 and below the head goes above the rows, full width on a 620 measure; **Head column Right draws left**; **the foot at Under the head lands above the rows**, disclosed in the sidebar. At ≤ 767 this design and 1 Accordion are the same drawing, and the panel says so.

**Empty** · no eyebrow or sub → the head column closes up. **No title → hands off to 15 Ledger.** No note and no link → the foot is absent and the control unavailable. **Two or fewer questions → 1 Accordion.**

**a11y** · **the two columns are a flex row, not two landmarks** — no `<aside>`, no roles, no second heading. The head is read first at both Head column values; **the Foot control changes reading order as well as position**. Hairlines are borders, never `<hr>`.

**Flagged** · fixing the question at Large 20; the 620 cap inside an 824 row; **keeping the head's internal left alignment at Head column Right**; not offering Open on load; both hand-offs; stating that the phone frame is 1 Accordion's drawing.

---

## 6 · Grouped

Group labels with their own rows beneath, stacked down one column. The first of three designs that read `groups[]`.

**Descriptor.** The only design that draws every group's rows at once under its own label, so the list is grouped and complete at the same time — no container hides anything.

**Structural descriptor.** `stack · none · page · many · none · labelled group breaks`

**Archetype.** stack

**Behaviour module.** `accordion`, on the rows. **A group cannot be collapsed as a whole** — A9-0 refuses an accordion inside an accordion — so there is no second module and the labels are static headings. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” Every group, every label and every question is server-rendered, so with JavaScript off this is the whole list in native rows — **which is also 11 Tabs' no-JS drawing**, and the reason that design's cost is a JavaScript cost only.

**Items** · two lists: `groups[]` and `items[]`, joined by the item's `group` reference.

- **Add.** *Add question* lands last **inside the group selected in the repeater**, or in the ungrouped set if none is. *Add group* lands last and arrives labelled **“More”** holding one question; a group with no questions is not drawn at all, so an empty new group is invisible until its first question. *Flagged: the seeded label is mine.*
- **Remove.** A question, or a group. **Removing a group does not remove its questions** — they lose their reference and fall to the final unlabelled set, and the confirm says so rather than deleting somebody's writing on their behalf. **No groups authored → 1 Accordion.**
- **Reorder.** Meaningful twice: group order down the page, question order inside a group. **Dragging a question onto another group's rows re-parents it**, which is the second way to set `group` besides the field itself.
- **Counts.** One to six groups, two to four drawn; one to twenty-four questions. **A group of one is drawn as a group of one.** Past four groups the extras are kept and not drawn, and the panel says how many.
- **Zero.** The section does not render — labels included, since a label is not content.
- **Inside an item.** `question`, `answer`, `anchor`, **`group`** — the first of the three designs where the optional reference changes the drawing: empty means the item falls to the last unlabelled set, and **no label is invented for it**, not “Other”, not “More”, not “General”.

**Fields** · `title`, `sub`, `note`, link pair, **two to four groups drawn (six the field's ceiling)** and every item with its `group`. **`eyebrow` is kept and never drawn** — the group labels take the eyebrow's type, and two ranks of 13 px uppercase in one section is one of them competing.

**Controls** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. **Question size: Row 17 · Large 20** — Feature not offered, because three labels and twelve questions is already three ranks. **Group label: Above the rows · Beside the rows.** Marker: Chevron · Plus. **Open rows: Many · One at a time**, one name group per group, so a reader can hold one row open in each. Member visibility: Everyone · Logged out · Free members · Paid members. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Arrangement** · list 780 at both label values; at Beside, **200 · 56 · 780 = 1,036 centred**, the label top-aligned with its first row's text rather than with the hairline. **Group label 13 px / 600 / uppercase / .08em in `text`, never muted, never stepping with width** — a muted label above full-strength questions reads as a caption for them. Label to first row 20 · 16 · 14; **group to group 48 · 40 · 32**, the same 48 the head takes above a list. Every group's rows carry a hairline each and none under the last, so the gap is the only thing dividing two groups.

**Responsive** · at Group label Above nothing collapses. **At Beside, 834 and below draws Above** and the control says “Above at this width”, because 200 + 56 + 690 does not fit inside 754.

**Empty** · **a group with no questions is not drawn, label included.** **Questions with no group are drawn as a last unlabelled set** after every labelled group — no label is invented for them, not “Other”, not “More”, not “General”. **A group of one is drawn as a group of one.** **No groups authored → 1 Accordion.**

**a11y** · **each group label an `<h3>` and each question an `<h4>`**, which amends A9-0 and is logged in its consistency pass. **One `<ul>` per group**, the ungrouped set a final list with no heading. Labels are not focusable and **a group cannot be collapsed as a whole** — that is an accordion inside an accordion. Every group is drawn at all times, so a deep link reveals no container. Print: rows open, labels and gaps kept.

**Flagged** · the label's type and full-strength colour; suppressing the section eyebrow; both group gaps and their steps; the 200/56/780 geometry and its 834 fallback; the unlabelled last set; not drawing an empty group; the hand-off; **the `<h4>` heading level**.

---

## 7 · Index

A jump list of group labels at the left margin, every group of rows at the right. Up to twenty-four questions in up to six groups, all drawn. **The only design in A9 with a copy-link affordance, and the library's first sticky element inside a section.**

**Descriptor.** The only design with a jump index beside its rows — the library's one sticky element inside a section and A9's one copy-link affordance, holding twenty-four questions by showing a reader the shape of the whole list.

**Structural descriptor.** `sticky · none · page · many · none · sticky jump index`

**Archetype.** sticky

**Behaviour module.** Three, the most in the category. `accordion` for the rows — **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” `scroll-spy` for the current-group mark — **JS off:** “The sticky list renders with the first item marked current; no active-item tracking.”, which is this design's Static value with its first group marked. `share` for the copy button — **JS off:** “Share links are real `<a href="https://…">` URLs and work normally; only the copy-link button is hidden.”, which is exactly the design's Copy links: Hidden value, the anchors still working. All three edit-safe. **The sticky position declares nothing**: `position: sticky`, its four conditions and the forced-colours exception are CSS, not script — *and that is why the module is `scroll-spy` rather than `header-scroll`.* *Finding: `share`'s no-JS line describes a copy button beside real share links, and A9·7 has no share links — only the button. The mapping holds for the degradation and not for the render.*

**Items** · `groups[]` and `items[]`, **both drawn in full — no count control anywhere in this design**.

- **Add.** As 6 Grouped: a question into the selected group, a group last labelled “More”. **A new group appears in the index the moment it has a question**, because the index is generated from `groups[]` and is not a second list to keep in step with the first.
- **Remove.** As 6 Grouped, plus: removing a group drops its index item with it, and its questions fall to the final unlabelled set — **which is not listed in the index, because it has no label to list**. **No groups → 6 Grouped; fewer than six questions → 1 Accordion.**
- **Reorder.** Meaningful: **group order is index order**, question order is row order. The index cannot be reordered on its own — it has no list of its own to reorder.
- **Counts.** Up to six groups and twenty-four questions, all drawn. Below six questions the index has nothing to do and the design hands off; at twenty-four Add question is disabled at the field's ceiling.
- **Zero.** The section does not render, index included.
- **Inside an item.** `question`, `answer`, **`anchor`** — the one design where the anchor does visible work: it is the row's `id` **and the copy button's clipboard value**, so editing it changes what a reader is handed. `group` as 6 Grouped.

**Fields** · head fields, note, link pair, **every group and every item, up to twenty-four**. `anchor` is drawn as the row's `id` and as the copy button's clipboard value. **The index is generated from `groups[]` and is not a separate field** — a second list of labels to keep in step with the first is a list that goes wrong.

**Controls** · Title size: 34 · 40 · 48. Question size: Row 17 · Large 20. Index column: Left · Right. **Index behaviour: Sticky · Static.** **Copy links: Shown · Hidden.** **Open rows: Many · One at a time**, one name group per group. Member visibility: Everyone · Logged out · Free members · Paid members. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Not offered** · Head alignment — always flush left, because a centred head over a left-hand index is two alignments; Marker, fixed at Chevron; Open on load, fixed at All closed; Groups shown, because this design draws everything.

**Arrangement** · **240 · 56 · 780 = 1,076, the remaining 220 px of the content width left empty** — a FAQ's rows do not get wider because the page has an index beside them. **The head and the foot sit on the rows' column**, not across both. Group label and gaps as 6 Grouped. **The index item is A1·1's nav item cited verbatim**: 15 px, muted at 500 resting, `text` at 600 with a 2 px accent underline for the current group — **a fourth place A9 spends the accent, amending A9-0**. The current-group mark follows the scroll; it is not a timer and nothing animates.

**Sticky, with four conditions** · 24 px from the top of the viewport; **above 1080 only**; **only while the rows are taller than the viewport**; and it stops at the foot of the rows rather than travelling into the next section. A8·6 settled that a *head* never sticks; an index is not a head — its whole use is arriving somewhere else, and at twenty-four rows an index that leaves after the first group can be used once. **Static is a second value, not a fallback**, for a site whose header already sticks. **Position is not motion**: reduced motion changes none of it.

**The copy link** · a mono `#` at 14 px — a typed character rather than an icon, so it needs no glyph set and survives every pack. **`border`-coloured at rest (1.19:1, not information) and muted on the row a pointer is over or a keyboard has focused.** It is a `<button>` **beside** the question’s `<summary>`, never nested, 44 px tall, always in the DOM and always in the tab order, named with the catalog's “Copy link to this question”. **Pressed replaces the character with the catalog's “Link copied” for two seconds**, announced once through a polite live region — no toast, no tooltip, no tick. **Hidden removes the button entirely** rather than hiding it from pointers; the anchors still work. **Not drawn at ≤ 767 at either value**: there is no hover to reveal it and a phone's share sheet already copies the URL.

**Responsive** · two columns above 1080. **At 1080 and below the index moves above the rows as a wrapping row of links over a hairline and stops sticking**; Index column and Index behaviour are disclosed as having no effect. At ≤ 767: group to group 32, no copy buttons.

**Empty** · a group with no questions is not drawn; **ungrouped questions are drawn last, unlabelled, and are not listed in the index** — there is no label to list. **No groups → 6 Grouped; fewer than six questions → 1 Accordion.**

**a11y** · the index a `<nav>` labelled with the catalog's “On this page” and carrying **`aria-current="location"`** on the current group — not `page`, because the page has not changed. Group labels `<h3>` with `tabindex="-1"`, questions `<h4>`. **The copy button costs one extra tab stop per row**, which is why it has a control. **In forced colours the index also stops sticking**, because a floating column with a transparent background over moving text is unreadable when the system picks both colours. Print: index dropped, rows open.

**Flagged** · the 240/56/780 division and the 220 px left empty; **the sticky exception and its four conditions**; **the accent's fourth place**; the `#` and its two resting colours; “Link copied” for two seconds; dropping the button below 767; the head inside the rows' column; both hand-offs; the forced-colours rule.

---

## 8 · Contrast Band

1 Accordion inverted onto the `contrast` token. **Switching between this design and 1 Accordion changes nothing but the colours** — the tokenisation claim at its hardest.

**Descriptor.** The only design on the `contrast` token — 1 Accordion's rows with every colour derived from the band's own pair, and the only section in A9 that can contain no accent pixel by construction rather than by an authoring choice.

**Structural descriptor.** `stack · none · contrast · few · none · inverted contrast band`

**Archetype.** stack

**Behaviour module.** `accordion`, 1 Accordion's exactly — the tokenisation claim covers behaviour as well as colour. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” The band is a background and the derived mixes are CSS, so **the no-JS drawing is this design in its own colours with the height transition absent** — the same relationship print already has to it, minus the band.

**Items** · `items[]`, on the band.

- **Add.** Lands last. Nothing about a new item is band-specific: it takes the section's derived muted, hairline and 6% plane on arrival.
- **Remove.** Never disabled. **One question is one row on the band and this design hands off to nothing** — the band is what the site picked, and handing a band's single row to 1 Accordion would take the ground away as well as the row.
- **Reorder.** Meaningful; authored order.
- **Counts.** 1–24 authored, four or six drawn, extra kept and not drawn; **six is the ceiling** and past it the panel names 1 Accordion, because a tall band is a section that has become a page.
- **Zero.** The section does not render — **and no empty band is drawn**, which is this design's whole exposure: a band with no rows is a coloured stripe.
- **Inside an item.** As 1 Accordion. The derived colours are the section's mixes read by every row, so **an item cannot opt out of the band** — which is what makes switching to and from 1 Accordion a colour change and nothing else.

**Fields** · 1 Accordion's exactly, **four or six items**.

**Controls** · Band width: Full bleed · Inset. Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20 · Feature 24. Rows shown: Four · Six. **Open on load: All closed · First open** — added in this pass: the value 1 Accordion had and this design silently dropped. **Open rows: Many · One at a time**. Member visibility: Everyone · Logged out · Free members · Paid members. **Universal, outside this list:** Background role **locked at Contrast**, the reason shown at the lock — the band is the design, not a value of it · Vertical spacing resolving the band's own **44 · 64 · 88** (40 · 56 · 72 at 834, 32 · 44 · 56 at 390), which is where Band padding retired · Top divider **locked None** at Band width Full bleed. Plus the **Data group**.

**Derived colours, all from the token pair** · muted = carried at **72% in light and 70% in dark** (A8·9's pair), hairline = carried at 18%, **hover plane and inline-code chip = carried at 6%**. Light `#232019` / `#FBF9F5` → `#BEBCB7`, `#4A4741`, `#302D26`. Dark `#EDE7DA` / `#171511` → `#57544D`, `#C6C1B6`, `#E0DACE`. Using `surface` or `border` here would put a light hairline on a dark band. No shadow at any value. **A hovered row's code chip disappears into the plane** — two 6% fields on one row is a boundary nobody needs to see.

**The accent is unavailable** · the pack's dark accent is **2.3:1** against the light band and a 2 px indicator needs 3:1, so **the answer's links and the focus ring take the carried colour in both modes**. The light-mode accent would pass at 4.8:1 and is still not used: a link that is accent-underlined in light and carried-underlined in dark is two different links in one theme. The sidebar shows the failing ratio at the disabled value. **This section has no accent in it at all.**

**Responsive** · 1 Accordion's, plus the band's own padding step. **The band always keeps a horizontal margin** — 72 / 40 / 20. **Inset draws full bleed at ≤ 767**: an inset band inside a 20 px margin is a card, and A9 has no card design on a band.

**Empty** · **one question → one row on the band; this design keeps its own frame and hands off to nothing**, because the band is what the site picked.

**a11y** · 1 Accordion's structure unchanged; **the band is a background, not an element**. Text on band 15.8:1 light / 14.7:1 dark, muted 8.7:1 / 6.0:1, hairline 2.4:1, **focus ring 15.8:1 / 14.7:1 — the strongest ring in A9**. **Forced colours drop the band and keep every hairline; print drops the band and prints every row open in `text` on white.**

**Flagged** · the 6% hover plane and its 1.15:1 step; the code chip sharing that mix; six as the ceiling; dropping the band in print; the panel's “one band per page” line. **Cited rather than mine:** the band, the 44 · 64 · 88 scale, the three mixes, the accent substitution and the 2.3:1 refusal — all A8·9's and A4·9's.

---

## 9 · Numbered

Questions numbered in the pack's heading font at Display 40, the question at Feature 24 beside the numeral, the answer beneath. Always open. **Order is the only thing a FAQ can say about priority**, and this is the design that makes it visible.

**Descriptor.** The only design that numbers its questions — the numerals in the pack's heading font at display scale, so an item's position in the list becomes the first thing a reader sees.

**Structural descriptor.** `stack · none · page · few · none · display-scale numeral column`

**Archetype.** stack

**Behaviour module.** **none.** Always open; no button, region, marker, hover or motion. The numerals are the `<ol>`'s own positions, rendered server-side rather than counted by script. **JS off:** identical — and the numbering is still right, which is the point of taking it from the markup instead of from a field or a counter.

**Items** · `items[]`, and the design where the list's order is its content.

- **Add.** Lands last **and is numbered by where it lands** — there is nothing to type. Seeded as the shared floor says.
- **Remove.** Never disabled. **Removing item two renumbers everything below it**, which is the design's whole argument rather than a side effect. One question is one row numbered 01.
- **Reorder.** **The most consequential reorder in A9:** order is the numbering, so dragging a row changes what a reader is told comes first. Padded and Plain both renumber from 01 or 1 — the control changes the glyphs, never the sequence.
- **Counts.** 1–24 authored, four or six drawn, extra kept and not drawn; past six the panel names 1 Accordion **without refusing the content**.
- **Zero.** The section does not render.
- **Inside an item.** `question`, `answer`, `anchor`. **There is no numeral field** — a list whose sixth row says “09” is a list with a mistake in it, and a typed numeral is per-item styling wearing a content field's clothes. The clearest refusal of rule 1 in the category, and it was written before the rule was.

**Fields** · head fields, note, link pair, **four or six items**. **There is no numeral field:** numbers come from the item's position in the repeater, so reordering renumbers and a site cannot type its own — a list whose sixth row says “09” is a list with a mistake in it.

**Controls** · Head: Centred · Flush left · None. Questions shown: Four · Six. **Numerals: Padded 01 · Plain 1.** **Numeral position: In a column · Above the question.** Rules: Between · None. Member visibility: Everyone · Logged out · Free members · Paid members. **Open rows is not offered:** nothing here closes. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Not offered** · **Title size — fixed at Medium 34**, because §2 allows one display moment per section and the numerals have taken it; Question size, fixed at Feature 24; Marker and Open on load.

**Arrangement** · **72 · 32 · 676 = 780** at In a column — 72 because “06” at Display 40 in a serif is 48 px wide and a two-digit numeral at twelve would be wider, and holding 72 at every count keeps the questions on one vertical. **The numeral sits on the question's cap height, not its baseline.** Numeral **Display 40 / 34 / 28 in `text-muted`** — large text at 5.6:1, and not the accent, because six accent numerals would be the loudest thing in the category. Row padding 28 / 24 / 20; question to answer 20; answer capped 620 inside 676. At Above the question: no column, text on 780, numeral to question 20 — deliberately the same as question to answer, because there the numeral belongs to the question. **At Rules None the rows sit 48 px apart, 40 on a phone.**

**Responsive** · the numeral column narrows 72 → 64 at 834 with the gutter at 28 and the text column at 598. **At ≤ 767 the numeral goes above the question at both position values**, disclosed as “Above at this width”, because a 64 px column leaves 258 px of question.

**Empty** · fewer authored than shown → that many rows, numbered from 01. **One question → one row numbered 01.** Past six the panel names 1 Accordion without refusing the content.

**a11y** · **an `<ol>` — the only ordered list in A9** — with the drawn numeral `aria-hidden` and **outside the `<h3>`**, so it is in neither the heading's name nor the announcement, and a screen reader hears “1 of 6” once. `tabindex="-1"` on each heading. No button, region, marker, hover or motion. **In forced colours the numeral takes the system's text colour and stops being quieter than the question**, which flattens the hierarchy to size alone — stated, not corrected. Print and screen are the same drawing.

**Flagged** · the 72/32 division and its 64/28 step; the cap-height alignment; the muted numeral; **capping the title at Medium 34**; Padded as the default and both values sharing one column width; **refusing a numeral field**; the 48 and 40 Rules None values; forcing Above below 767.

---

## 10 · Image Split

A photograph on one half, the accordion on the other, both top-aligned, on a 32 px gutter. **The only design in A9 that reads `image`.**

**Descriptor.** The only design that reads `image` — a photograph on one half and the rows on the other, with neither column stretching to meet the other's height.

**Structural descriptor.** `split · none · page · many · left · photograph beside rows`

**Archetype.** split

**Behaviour module.** `accordion`, on the rows column. **The photograph declares nothing:** it is a plain `<img>` and not a `lightbox` — a reader cannot open it, and A14 Galleries owns anything they could. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” The image, its crop and the 1080 stack are CSS and markup, so with JavaScript off this is a photograph beside native rows — the media placement is unaffected at every width.

**Items** · `items[]`, in the rows column. The photograph is a **section** field and never an item's.

- **Add.** Lands last in the rows column, and can make the rows the taller column — which is allowed: neither column stretches, and the photograph simply stops at its own foot.
- **Remove.** Never disabled. **Two or fewer authored → 1 Accordion**, and **no image → 1 Accordion** as well, which are the two ways out of this design.
- **Reorder.** Meaningful in the rows column. The image never moves in the list because it is not in it.
- **Counts.** Three to twenty-four authored, four or six drawn, extra kept and not drawn. **Six closed rows is the count Square comes closest to matching**, and the panel says so.
- **Zero.** The section does not render — **not the photograph on its own**, which would be A4's hero with a caption's worth of head above it.
- **Inside an item.** `question`, `answer`, `anchor` — **no per-item image**, and this is the design where that rule is worth stating plainly: one photograph belongs to the section, and a picture per question is a different category. `imageAlt` is the section's and optional; empty means `alt=""`, never a filename and never an invented description.

**Fields** · head fields, note, link pair, **`image` and `imageAlt`**, and **four or six items**. The photograph is an uploaded file on the section, not a post's feature image. No `imageAlt` → `alt=""`.

**Controls** · Title size: Medium 34 · Large 40. **Division: Even 632/632 · Rows-led 760/504** — an image-led division is refused, because a 504 px accordion is a column of two-line questions and a section whose photograph is wider than its content is A4's hero. Image side: Left · Right. **Crop: Portrait 4:5 · Square 1:1 · Landscape 3:2**, named and not computed, `object-fit: cover`. **No free focal point — Image focus (Centre · Top · Bottom) ships in the Image Picker popover and is the whole of it**: three named values are not a draggable point, and the old refusal was of the point. Rows shown: Four · Six. **Open rows: Many · One at a time**. Member visibility: Everyone · Logged out · Free members · Paid members. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Not offered** · Question size, fixed at Large 20; Marker; Open on load; **any visible caption** — a caption under a photograph beside a FAQ is a third voice.

**Arrangement** · 32 px gutter; **both columns top-aligned and neither stretching** — the image is its crop's height (790 · 632 · 421 at 632 px wide), the rows are as tall as their content, and the shorter column simply ends. Open three more rows and the rows become the taller column while the photograph stops at its own foot. **No `align-items: stretch`, no cropping to match, no sticky image.** Head above the pair on 780, foot below on 620. Image at the pack radius, **no shadow and no scrim**. Row padding 20, question to answer 16, answer capped 620. **Square comes closest to matching six closed rows**, and the panel says so.

**Responsive** · two halves above 1080. **At 1080 and below they stack, image above the rows at both Image side values, and the crop is forced to 3:2** — a 4:5 portrait at 754 px is a screen of photograph before a reader reaches a question, and a photograph *under* a FAQ reads as an illustration of the last answer. Division and Image side are disclosed as having no effect. At 834: image 754 × 503. At ≤ 767: image 350 × 233.

**Empty** · **no image → hands off to 1 Accordion**; there is no placeholder and no coloured block at any width. Two or fewer questions → 1 Accordion.

**a11y** · the photograph an `<img>` with real alt text — **the only image in A9** — never a CSS background, not a link, no hover, no motion; A14 Galleries owns anything a reader can open a photograph into. The two halves are a flex row, not two landmarks. **Image side changes DOM order and the control says so**: at Left the photograph is read before the questions, at Right after them. In forced colours the image is kept and the halves stack.

**Flagged** · the 632/32 division and the 760/504 alternative; **refusing an image-led division**; **refusing to stretch either column**; the head above the pair; fixing the question at Large 20; the three crop heights and the Square advice; refusing a caption; the hand-off.

---

## 11 · Tabs

Group labels as a tab row, one group's questions shown at a time. **A5·12's tablist structure and behaviour with A8·11's tab styling** — 15/500 resting, 15/600 active, a hover surface plane, a 2 px accent underline — the second use of that departure rather than a new one.

**Descriptor.** The only design that shows one group at a time — and the only one whose resting state withholds its questions as well as its answers.

**Structural descriptor.** `nav · none · page · many · none · tab row over panel`

**Archetype.** nav

**Behaviour module.** `tabs`. Edit-safe — the first tab is active on load, nothing is remembered, and no state is written while the section is edited. **JS off:** “All panels render stacked and visible, each preceded by its tab label as a heading.” **That is 6 Grouped's drawing** — the same drawing this design already hands to at ≤ 767 and prints — so **the cost the panel states is a JavaScript cost only**: with the module inert, nothing is missing from the heading rotor or from find-in-page. No `accordion` here: the rows inside a panel are 3 Open List's, always open.

**Items** · `groups[]` and `items[]`; **a group is a tab**.

- **Add.** *Add group* adds a tab, last in the row, labelled “More”, holding one question. *Add question* lands last inside the selected group's panel. **A group with no questions gets no tab**, so a new group is invisible until its first question arrives.
- **Remove.** A question, or a group with its tab. **Removing the group whose tab is active selects the first tab** rather than leaving an empty panel. **One group → 6 Grouped** (a tablist of one is a heading); **no groups → 1 Accordion**.
- **Reorder.** Meaningful twice: **group order is tab order** left to right, and **the first tab is the panel a reader is given on load**, so reordering groups changes what the section opens with. Question order inside a panel is drawn order.
- **Counts.** Three or four groups drawn, six the field's ceiling; a fifth or sixth authored group is kept, gets no tab, and the panel says how many are left out — the same sentence it already uses for ungrouped questions. One to twenty-four questions across the drawn groups.
- **Zero.** The section does not render. **Ungrouped questions are not drawn at all**, so an item with an empty `group` is authored, saved, kept and invisible here — **the one place in A9 where leaving an optional field empty costs a reader content**, and the panel states the count rather than inventing an “Other” tab for them.
- **Inside an item.** `question`, `answer`, `anchor`, `group`. `group` is optional in the field and effectively required in this design, which the panel says in those terms.

**Fields** · head fields, note, link pair, **three or four groups** and every item belonging to a drawn group. **Ungrouped questions are not drawn at all and no “Other” tab is invented; the panel names the ones being left out** — “Do you take corporate subscriptions?” and “Where does the printed quarterly ship?” on the drawn frame — **rather than only counting them**: a count says something is missing, a name says which sentence a reader is not being shown. **This is the one place in A9 where an empty optional field silently costs a reader content**, which is why the warning is specific.

**Controls** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20. Rules: Between · None. **Groups shown: Three · Four.** Member visibility: Everyone · Logged out · Free members · Paid members. **Open rows is not offered:** the rows inside a panel are always open. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Not offered** · a tab row below the panel; six groups — two rows of tabs above three questions is a section whose navigation is taller than its content; **an All tab**, because a tablist whose first tab contains every other tab is not a choice; **a disclosure inside the panel** — A9-0's refusal, since a disclosure inside a disclosure is two doors to one sentence.

**Arrangement** · the tab row 4 px apart, following the head's alignment, on a hairline with the active tab's 2 px accent underline over it; the panel 48 px below. **The rows inside a panel are 3 Open List's rows exactly.** **The panel is its own height and the section's height changes when a reader switches** — against A8·11, which fixed its panel to the longest quotation: a group of five and a group of one are honestly different lengths, and forcing the shorter to the taller would put 400 px of white space under two questions. **160 ms cross-fade, instant under reduced motion, first tab active on load and never remembered.** At Rules None the rows sit 40 px apart.

**The cost, stated** · **seven of ten questions are not on the page on load, and neither are their answers.** They carry `hidden` — correct for a tablist — so **they are absent from the heading rotor as well as from find-in-page**, which is worse than an accordion's cost: an accordion hides answers but shows every question. **The panel states it and names 6 Grouped.**

**Responsive** · tabs above 767. At 834 four labels fit on one row; a fifth or a longer one **wraps to a centred second row with the hairline under the last row**; **a horizontally scrolling tab row is refused at every width**. **At ≤ 767 the behaviour is handed off: no tabs, every group drawn as 6 Grouped's stack with its label**, and the sidebar says “Tabs above 767, every group below”.

**Empty** · a group with no questions gets no tab. **One group → 6 Grouped**, since a tablist of one is a heading. **No groups → 1 Accordion.**

**a11y** · `role="tablist"` / `role="tab"` with `aria-selected` and `aria-controls`, roving `tabindex`, arrow keys, `role="tabpanel"` labelled by its tab, inactive panels `hidden`. The tab's accessible name is the group label and nothing else. **Questions are `<h3>`** — the tab is the label, so no `<h4>` here. No buttons or regions inside the panel. **Print: every group printed in full with its label** — a printed page with three tabs and one panel is a page missing three quarters of its content.

**Flagged** · **the panel taking its own height**; the `<h3>` level and its reason; four as the ceiling; **refusing an All tab**; not drawing ungrouped questions and stating the count; printing every group; both hand-offs. **Cited:** the tablist (A5·12), the tab's weights and plane (A8·11), wrap-not-scroll (A8·11).

---

## 12 · Filter

A4·15's field above the accordion, narrowing the list as a reader types. With 7 Index one of the two designs that hold twenty-four questions, and the opposite answer to the same content: **an index shows a reader the shape of the whole thing; a filter shows them one part of it and hides the rest.**

**Descriptor.** The only design with an input — a field that narrows twenty-four questions to the few a reader typed for, and the only place in A9 where content leaves the DOM.

**Structural descriptor.** `form · none · page · many · none · live filter field`

**Archetype.** form

The archetype names the arrangement — a field governing a list — and **not the element:** this design deliberately has no `<form>`, no submit button and a dead Enter key.

**Behaviour module.** `accordion` for the rows, and **`filter-strip` as the closest registry module for the field — it does not describe it.** Both edit-safe; nothing filters while the section is edited. **JS off, rows:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” **JS off, field:** the registry's line is “Filters are `<a href>` links to Ghost routes and **work perfectly** — this module needs JS least of all”, and **it does not hold here**: A9·12 filters authored rows client-side over question text and queries nothing, so there are no routes to link to and no links to render. **What the section does with JavaScript off, plainly: every authored question renders, unfiltered, as native rows** — the field and the count sit in `core`'s no-JS branch and are not drawn, and nothing authored is lost, so FR-G4 is satisfied by the list rather than by the control. *Flagged: not rendering the field, rather than rendering it inert, is mine.* **Finding for the architect:** either the registry needs a client-side filter module or this field is out of scope for a generated theme.

**Items** · `items[]`, and the longest list in the category alongside 7 Index.

- **Add.** Lands last in the authored list; drawn immediately while the field is empty, and matched or not the moment there is text in it.
- **Remove.** Never disabled. **Below twelve authored the design hands off to 1 Accordion** — a filter over eight rows is a control with nothing to do.
- **Reorder.** Meaningful in the unfiltered list. **Filtering never reorders:** matches are drawn in authored order and nothing is ranked, because a relevance order over a list somebody wrote by hand is a second opinion nobody asked for. *Flagged: mine.*
- **Counts.** Twelve to twenty-four, drawn at twelve, eighteen or twenty-four; extra kept and not drawn; at twenty-four Add question is disabled at the field's ceiling. **Twelve is the floor of the design, not of the field.**
- **Zero.** The section does not render — **the field included**, because a filter with nothing to filter is not an empty state, it is furniture.
- **Inside an item.** `question`, `answer`, `anchor`. **The filter matches `question` only**, which makes that field the one to write for a reader who is typing; the panel says so and names 3 Open List and a browser's own find for text inside answers. **No per-item keyword, weight or pin field** — that is per-item styling for a search engine, and the answer is to write the question a reader would type. *Flagged: refusing a keywords field is mine.*

**Fields** · head fields, note, **link pair used twice — in the foot and in the no-match state** — and **twelve, eighteen or twenty-four items**. **The placeholder and the no-match line are fields with defaults** — `filterPlaceholder` “Filter questions” and `noMatch` “No question here mentions “{term}”.”, with `{term}` filled at render — because a non-English site cannot ship an English literal. The defaults keep the ruling this design was protecting: a filter that says something other than what it does is the failure it is avoiding. **What stays the theme's is the visually hidden input label and the Clear button's name**, both catalog strings. The filter is client-side over the authored rows and queries nothing.

**Controls** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20. **Field width: Full · Narrow 420.** Rows shown: Twelve · Eighteen · Twenty-four. **Open rows: Many · One at a time**. Member visibility: Everyone · Logged out · Free members · Paid members. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**The field** · A4·15's — 48 px tall, `surface`, 1 px `border`, pack radius, 16 px text, a 19 px glyph inset 16, **32 px above the first row**, on the list's measure at Full. **No submit button and no `<form>`**; Enter is a no-op. A 44 px Clear button with a 15 px cross when there is text, labelled “Clear”; Escape clears and keeps focus in the field. **The placeholder's default says “Filter questions” rather than “Search”**, because it filters the rows on this page and does not search the site; a site may rewrite it, and the field it edits is `filterPlaceholder`.

**The behaviour** · **matches question text only**, case- and accent-insensitive, whole substrings, **no stemming and no fuzzy matching**. Matching a closed answer would return rows whose visible words do not contain the term, which reads as a broken filter; **for text inside answers the panel names 3 Open List and a browser's own find**. The matched term is marked in the question **with the hover surface as a `<mark>` plane, no accent and no bold**. **The count “N of M questions” is drawn and announced only while the field has text** — 13 px muted, 12 px above the first row — which is the stated exception to A9-0's refusal of counts, and the only way either a sighted or a screen-reader reader knows the list got shorter. **Filtered-out rows are removed from the flow with no transition at any motion setting**: a list that animates on every keystroke is unreadable. An open row stays open while it matches. **Nothing is remembered, written to the URL or read from it**, and **a deep link loads the section unfiltered with an empty field**.

**No match** · the term is quoted back — “No question here mentions “refund”.” — with **the section's own authored link** beneath it, not a new one; **with no link authored the first line stands alone**. The rows are gone, not dimmed, and the field keeps its text so a reader can edit rather than retype.

**Responsive** · **nothing collapses.** The field takes the list's width at Full — 780 / 690 / the column — and 420 at Narrow, **full width at ≤ 767 at both values**. Field height 48 at every width, because 48 is a touch target rather than a proportion.

**Empty** · fewer authored than shown → that many rows. **Fewer than twelve → hands off to 1 Accordion**, since a filter over eight rows is a control with nothing to do.

**a11y** · `<input type="search">` with a **visually hidden real `<label>` from the theme's catalog** — a placeholder that disappears when a reader types is not a name, and an editable placeholder is not one either. **The count is one `aria-live="polite"` element serving both sighted and screen-reader readers, debounced 500 ms.** **Filtered-out rows are removed from the DOM, the only place in A9 where content leaves the tree**; clearing restores every row in authored order. **Focus is never moved for a reader.** The `<mark>` survives forced colours as the system's own mark styling. Print: no field, every row open and unfiltered.

**Flagged** · **matching questions only**; **the count as the stated exception**; the `<mark>` plane; removing rather than hiding rows; “Filter questions” and the theme owning the copy; the no-match wording and its reuse of the section's link; refusing a submit button; the 420 Narrow value; twelve as the floor; not printing the field.

---

## 13 · Slim

Three or four rows in a tight band, no head, **its own 32 · 44 · 56 padding scale** (A7·8's) and a **300-character ceiling** no other design imposes. The design for the four questions that follow a pricing table.

**Descriptor.** The only design with no head at any value — its own padding scale, a 300-character answer ceiling and no lists or code, three or four short questions as a band inside somebody else's page.

**Structural descriptor.** `stack · box · surface · few · none · tight band, no head`

**Archetype.** stack

**Behaviour module.** `accordion`. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” The 14 px row, the surface panel and the three Rules values are CSS, so the no-JS drawing is the same band with native rows — **and with the tightest targets in the category still at 44 px, because 13 + 24 + 13 is markup and padding rather than script.**

**Items** · `items[]`, three or four of them, and **the only design whose item content has a ceiling of its own**.

- **Add.** Lands last. **The seeded answer is written to this design's ceiling** — “A short answer, two sentences at most.” — because a placeholder that handed the section off to 1 Accordion the moment it arrived would be a placeholder that breaks the design. *Flagged: mine.*
- **Remove.** Never disabled; **one or two questions are drawn as one or two rows**, and there is no hand-off downwards.
- **Reorder.** Meaningful; three or four rows in authored order.
- **Counts.** Three or four drawn. **Five or more authored → four drawn and the panel names 1 Accordion**; one or two are drawn as they are.
- **Zero.** The section does not render, and **nothing survives it**: with no head, no note and no link at any value, the item list is the entire section — the only design in A9 where that is literally true.
- **Inside an item.** `question` and `answer`, plus `anchor`; ten fields are kept and never drawn, so an item's `group` is inert. **The answer's ceiling is a content constraint, not a style:** past 300 characters, or with a list or inline code in it, **the section draws 1 Accordion instead** — a hand-off rather than a truncation, and the editor says “Lists and code need a full section” rather than stripping markup out of what somebody wrote. Links and bold are kept.

**Fields** · **three drawn** — `question`, `answer`, `anchor` — from three or four items. **Ten kept and never drawn**: `eyebrow`, `title`, `sub`, `note`, `linkLabel`, `linkUrl`, `image`, `imageAlt`, `groupLabel`, `group`. **The most any design in A9 keeps, and the reason switching away loses nothing.**

**Controls** · **Rules: Above and below · Above only · None** — **Above and below is the default**, the only design in A9 whose Rules default is not Between: with no head above them, the rows need a top edge to start against. Question size: Row 17 · Large 20. Rows shown: Three · Four. Marker: Chevron · Plus. **Open rows: Many · One at a time**. **Universal, outside this list:** Background role — the old Ground row, Surface being the `surface` panel and Background the page's own ground — Contrast disabled · Vertical spacing resolving this design's **32 · 44 · 56** (28 · 40 · 48 at 834, 20 · 28 · 36 at 390); the fixed 14 px row inside it is not a control · Top divider **locked None** at Rules Above and below and at Above only. Plus the **Data group**. **No Member visibility:** this design bears no ask at any value, and is the one section in A9 a site cannot hide from a member state.

**Not offered** · Head, at any value; Title size; Open on load.

**Arrangement** · list 780 centred, answer capped 620, **row padding fixed at 14 at both question sizes — the only place A9 tightens the row** — question to answer 12, **Rules None 28 px apart**. At Ground Surface the rows sit in a `surface` panel with a 1 px hairline, the pack radius, **32 px of padding and 20 on a phone, no shadow**, and the Rules values apply inside it. **The difference between this design and 1 Accordion at head None is the padding, the answer ceiling and the refusal of lists**, and the panel states all three.

**The ceiling** · **300 characters, hard, and a hand-off rather than a truncation.** Past 300 the section draws 1 Accordion and the counter reads “312 characters — drawing 1 Accordion. Under 300 for a slim band.” The field still stores 900. **A list, an ordered list or inline code in an answer hands off too, at any length** — three bullet points inside a 44 px band is a section pretending to be a strip — and the editor says “Lists and code need a full section” rather than stripping the markup out of what somebody wrote. **Links and bold are kept.**

**Responsive** · nothing collapses and nothing is cropped; all three or four rows are drawn at every width. Row padding 14 above 767 and 13 below.

**Empty** · nothing to be absent. **One or two questions → drawn as one or two rows.** **Five or more authored → four drawn and the panel names 1 Accordion.**

**The boundary** · **A6·10 Slim** is a banner: it asks for something and ends in a link. **A2's bars** sit above the header, are dismissible and can rotate. **1 Accordion at head None** is these rows with the section's own padding, no ceiling and lists allowed. This is a band in the flow of a page that answers three or four short questions and asks for nothing: **no head, no note, no link, no button, nothing sticky, nothing dismissible.**

**a11y** · **no `<h2>` and no accessible name** — with 15 Ledger the only two in A9 — the questions still `<h3>`, a skipped level that is the honest structure for a band inside somebody else's section. Otherwise 1 Accordion exactly. The panel is a plain `<div>` with no role. **44 px targets at the tightest padding in the category:** 13 + 24 + 13 on a phone.

**Flagged** · the 14 px row padding; **the 300-character ceiling and the refusal of lists and code, with the hand-off rather than a strip**; Above and below as the default; the 28 px Rules None value; the panel's 32 / 20 padding; four as the ceiling; drawing no head, note or link at any value; the three boundaries.

---

## 14 · Ask

The accordion with a contact panel at its foot: the section's `note` as one sentence and its link as **the only filled accent button in A9**.

**Descriptor.** The only design that ends in a contact panel — A9's one filled accent button, spending the section's whole accent budget on the reader's own question rather than on an offer.

**Structural descriptor.** `stack · none · page · few · none · filled accent button`

**Archetype.** stack

**Behaviour module.** `accordion`, for the rows. **The panel declares nothing:** the note is text and the button is an `<a href>`, so `member-form` is not it and neither is anything else in the registry — this button navigates, and a `mailto:` announced as a button would promise something that happens on the page. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” The panel, the note and the button are server-rendered and unaffected at every Ask panel value; **print already drops the fill and keeps the panel**, which is the same drawing.

**Items** · `items[]`, above the panel.

- **Add.** Lands last **among the rows** — above the panel, which is not in the list and cannot be reordered into it.
- **Remove.** Never disabled; **one question and the panel is a legitimate section** and there is no hand-off out of this design.
- **Reorder.** Meaningful among the rows. Tab order is the rows and then the button, at every panel value, whatever the order.
- **Counts.** 1–24 authored, four or six drawn, extra kept and not drawn; six is the ceiling and the panel names 1 Accordion past it.
- **Zero.** The section does not render — **including the panel**, which is the case worth stating: a note and a filled button with no questions above them is A6 CTA Banners' section, not this one.
- **Inside an item.** As 1 Accordion. **The panel's note and link are the section's fields, not an item's**, so no question can carry a button of its own — a design where every answer ended in one would be six buttons and a different category.

**Fields** · head fields, **`note` and the link pair as the panel**, and four or six items. **No new field:** the panel has no heading of its own, because inventing one would mean inventing a field.

**The button needs a reason** · A6 CTA Banners owns the ask, and a FAQ that ends in “Subscribe” is a banner with questions as its copy. This button asks for nothing except the reader's own question. **It is a `mailto:`, a contact page or a help address and never a subscribe, a trial or a purchase** — **the editor warns on a link to a checkout, signup or trial and names A6·11 Reasons**, and the warning does not block the save, because a theme cannot know every URL. **The URL is picked, not typed:** the field opens the **Link Picker**, so a mailto:, a contact page or a help address is chosen from what the site has, and the warning fires on what comes back.

**Controls** · Head: Centred · Flush left · None. Title size: 34 · 40 · 48. Question size: Row 17 · Large 20 · Feature 24. Rows shown: Four · Six. **Ask panel: Card · Rule above · None.** **Open rows: Many · One at a time**. Member visibility: Everyone · Logged out · Free members · Paid members, through the **P0·4** member-aware action editor, because the panel's button is the ask it gates. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider None · Line · Fade. Plus the **Data group**.

**Arrangement** · at **Card**, the shared card at the list's width — `surface`, 1 px hairline, pack radius, **32 px padding, 24 at 834, 20 at 390, no shadow** — holding the note at 17 px in `text` on a 480 measure and the button at the right, **40 px below the last row**. **The note is `text` here and muted everywhere else in A9**: in the other fourteen designs it is a footnote under a list, and in this one it is the panel's whole sentence. At **Rule above**: no plane, the row's own hairline, 24 px either side, so the panel reads as the last item in the list. At **None**: the category's ordinary muted foot and an underlined text link — **not an empty state**, but a value, so a site can take the button off after a campaign without switching designs. **The panel is not drawn unless both the note and the link pair are authored.**

**The button** · **A1·1's primary, cited whole** — accent fill, carried text, 14 px at 600, padding 9 × 17, the radius token; hover darkens the fill one step; focus takes A6's ring with the card as the inner gap. Its label is `linkLabel`, capped at 20 characters, and it takes **an optional icon before or after the label** from the Icon Picker with its size / colour-role popover, **off by default** — an icon takes the label's carried colour, never a second one, and the drawn frame has none. **The button never changes size except at ≤ 767**, where the panel stacks and it goes full width at 15 px with 12 px of vertical padding — A1·1's drawer rule.

**Responsive** · the note and the button hold one row down to 767, the note's measure narrowing to 420 at 834. Nothing else collapses.

**Empty** · **no link pair → the panel is not drawn and the note falls back to the muted foot**; no note and no link → no foot at all and the control unavailable. **One question → one row and the panel.** No hand-off out.

**a11y** · 1 Accordion's structure plus a plain `<div>` holding a `<p>` and an `<a>` — **no role, no label, no heading**. **The button is an `<a href>` styled as a button**, never a `<button>`: it navigates, and a `mailto:` announced as a button would promise something that happens on the page. Tab order: the rows, then the button last, at every Ask panel value. **Carried text on the accent fill is 4.6:1 light and 4.9:1 dark — the only place in A9 where accent carries text.** Forced colours: the fill is dropped and the button takes system button colours with a 1 px border. **Print: the panel is kept, the fill is not printed, and the label prints with its URL beside it.**

**Flagged** · **allowing one filled button and the `mailto:`-or-contact rule that limits it**; the note taking `text` in the panel; refusing a panel heading; the three values and the 40 / 24 gaps; requiring both note and link; six as the ceiling; the print rule.

---

## 15 · Ledger

The question in a 300 px column at the left, the answer on 620 at the right, rows between hairlines — A8·12's geometry holding formatted prose. Always open, no head, no marker, no button. **The category's floor.**

**Descriptor.** The only design that puts the question in a column of its own beside its answer, and the only one where the answer's measure and the row's width are the same number.

**Structural descriptor.** `split · none · page · many · none · question column beside answer`

**Archetype.** split

**Behaviour module.** **none.** Always open; no button, no marker, no region, no hover, no motion — and with no link authored, no tab stop in the whole section. **JS off:** identical. With 3 Open List these are the two designs nothing can be hidden by, and here print, screen and no-JS are one drawing at every width.

**Items** · `items[]`, each drawn as a question column and an answer column.

- **Add.** Lands last. **The seeded question is short on purpose** — 300 px at Row 17 is about 34 characters a line, so a long placeholder arrives as three lines of label. *Flagged: mine.*
- **Remove.** Never disabled; one question is one row. **No hand-off out, and two arrive here** — 5 Split Head with no title, and any design a site leaves to put every answer beside its question.
- **Reorder.** Meaningful; authored order at every width. **The flex row never reverses**, so a row's question is read before its answer wherever it sits and whatever Alignment says.
- **Counts.** 1–24 authored, four, six or eight drawn, extra kept and not drawn. Designed for six and eight, which is where a label column earns its 300 px.
- **Zero.** The section does not render. Seven fields are kept and never drawn, so **there is no head to survive an empty list** — as in 13 Slim, the item list is the section.
- **Inside an item.** `question`, `answer`, `anchor`; `group` inert. **The question column's width is the section's**, so a long question makes its own row taller and rebalances nothing: the counter's advice past 70 characters is advice, the row grows, and a row can be taller than its own answer.

**Fields** · `note`, link pair, and **four, six or eight items**. **`eyebrow`, `title`, `sub`, `image`, `imageAlt`, `groupLabel` and `group` are kept and never drawn** — seven fields, second only to 13 Slim's ten.

**Controls** · Alignment: Centred · Flush left. Question size: Row 17 · Large 20. **Rules: Between · Above and below · None.** **Row padding: Compact 24 · Comfortable 32 · Spacious 44.** Rows shown: Four · Six · Eight. Member visibility: Everyone · Logged out · Free members · Paid members. **Open rows is not offered:** nothing here closes. **Universal, outside this list:** Background role, Contrast disabled with 8 Contrast Band named · Vertical spacing resolving 64 · 96 · 132, the old Padding row under the name every section uses · Top divider **locked None** at Rules Above and below. Plus the **Data group**. **Row padding keeps its own row**: it measures the space between two answers, not the space around the section.

**Not offered** · Head, at any value; Title size; Marker and Open on load.

**Arrangement** · **300 · 56 · 620 = 976**, centred or flush left, **320 px of the content width left unused** — the question column is a label column, not a second column of prose, and widening it would make a 90-character question look like the row's main text. Both halves top-aligned. **The answer's measure is the row's 620 exactly**, the one design where the two are the same number because the row was built around the cap. **Row padding is its own control, not the question's step**: with no marker and no plane, the space around a row is the only thing separating two answers. **At Rules None the rows sit 44 px apart at every value.** Rules run the full 976, never the length of a column. The foot sits 32 px under the last row on the block's left edge. Alignment moves the block and changes neither column's width.

**The long question** · 300 px at Row 17 is about 34 characters a line, so the field's 120-character ceiling is six lines and **a row can be taller than its own answer**. Nothing is truncated and the columns do not rebalance; the row grows and the answer stays at the top of it. **The editor's counter turns muted past 70 characters with “Shorter questions read better in a ledger”** — advice, not a limit.

**Responsive** · two columns above 1080; at 834 **240 · 40 · 474 = 754, the full width inside the margins** — the one width with no unused space — with the question forced to Row 17 and row padding 28. **At ≤ 767 the answer goes under the question at both Alignment values**, disclosed as “Under the question at this width”, **at which point this design and 3 Open List are the same drawing, and the panel says so.**

**Empty** · no note and no link → no foot. **One question → one row.** No hand-off out. **Two hand-offs arrive here:** 5 Split Head with no title, and any design a site leaves to put every answer beside its question.

**a11y** · a `<ul>` of `<li>`, each an `<h3>` and its prose in a flex row. **Not a `<table>`** — two columns of unrelated pairs are not tabular data, there is no header row, and a table would promise that the columns can be compared down their length — **and not a `<dl>`**, A9-0's refusal, in the layout that most tempts one. **No `<h2>` and no accessible name.** `tabindex="-1"` on each heading; reading order question then answer at every width, because the flex row never reverses. **No tab stop at all with no links authored.** Forced colours unchanged; **print and screen are the same drawing**.

**Flagged** · the 300/56/620 division and the 320 px left unused; **row padding as its own control**; the 44 px Rules None value; the 70-character advice; the 240/40/474 tablet division; stating that the phone frame is 3 Open List's drawing; taking 5 Split Head's hand-off.

---

## 16. What A9 settled, in one place

1. **Accordion or always open** · both, as designs rather than values. **Many rows open at once by default, and One at a time is a value on all ten accordions** — native `<details name>`, one name group per section and one per group in 6 Grouped and 7 Index. Open on load is offered in 1 Accordion and 8 Contrast Band; All open is 3 Open List; Expand all is refused.
2. **Deep-linking** · a **stored** `anchor` per item, seeded from the question. Arriving opens that row, **leaves every other row as drawn**, scrolls with 96 px above, moves focus, animates nothing and highlights nothing. Containers open with it; opening rows never touches the URL or the history. One design draws a copy-link affordance. **At Open rows One at a time arriving closes whatever row the server drew open**, because native grouping allows one open row per group — the one clause of this settlement the new value amends.
3. **Lists, links and code** · limited rich text, 20–900, on a **620 px measure** at 16 px in `text`. Headings, tables, images, embeds, blockquotes, code blocks and nested lists are refused with reasons. 13 Slim caps at 300 and refuses lists and code outright.
4. **Two columns** · two independent lists split by count, the extra row left, **equal in count and never in height**; CSS multi-column and a row-major grid both refused for what they do when a row opens; one column in authored order at ≤ 767 with no reordering at any width.

**And what the drawing changed** · seven statements in `A9-0` were written before the designs and overruled by them: the `<h3>` rule (two designs use `<h4>`, and 11 Tabs keeps `<h3>` for a stated reason), the accent's three places (four), sticky elements (one exists, with four conditions), the refusal of question counts (12 Filter's count while typing), the `<h2>` count (two designs have none), row padding following the question's step (13 Slim and 15 Ledger override it), and the marker's alignment (the question's first line, not the row's centre — the one change the stress frame forced on the whole category). All seven are amended in `A9-0` and logged in its consistency pass.

**Fifteen designs, five to eight controls each, plus the universal trio, the Data group and the Design picker.** 13 Slim is the five; 8 Contrast Band is the eight; the ceiling is the PRD's ~15 and no design comes near it. **One image** (10 Image Split), **one input** (12 Filter), **one filled button** (14 Ask), **one `<ol>`** (9 Numbered), **one sticky element** (7 Index), **one band** (8 Contrast Band). **Nine designs hand off and three receive** — 1 Accordion from seven, 6 Grouped from two, 15 Ledger from one — and **ten panels name 3 Open List** for the cost every accordion carries.

---

## 17 · Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fifteen checked against each other; **no two are the same.**

| # | Design | Tuple |
|---|---|---|
| 1 | Accordion | `stack · none · page · variable · none · full-width row as button` |
| 2 | Two Column | `split · none · page · many · none · count-split into two lists` |
| 3 | Open List | `stack · none · page · many · none · every answer drawn open` |
| 4 | Cards | `grid-of-N · none · page · few · none · one question per card` |
| 5 | Split Head | `split · none · page · many · none · head column beside rows` |
| 6 | Grouped | `stack · none · page · many · none · labelled group breaks` |
| 7 | Index | `sticky · none · page · many · none · sticky jump index` |
| 8 | Contrast Band | `stack · none · contrast · few · none · inverted contrast band` |
| 9 | Numbered | `stack · none · page · few · none · display-scale numeral column` |
| 10 | Image Split | `split · none · page · many · left · photograph beside rows` |
| 11 | Tabs | `nav · none · page · many · none · tab row over panel` |
| 12 | Filter | `form · none · page · many · none · live filter field` |
| 13 | Slim | `stack · box · surface · few · none · tight band, no head` |
| 14 | Ask | `stack · none · page · few · none · filled accent button` |
| 15 | Ledger | `split · none · page · many · none · question column beside answer` |

**Distribution.** Archetype: stack ×7 (1, 3, 6, 8, 9, 13, 14) · split ×4 (2, 5, 10, 15) · grid-of-N, sticky, nav, form ×1 each (4, 7, 11, 12). Containment: none ×14, box ×1 (13). Ground: page ×13, contrast ×1 (8), surface ×1 (13). Count: many ×9 (2, 3, 5, 6, 7, 10, 11, 12, 15) · few ×5 (4, 8, 9, 13, 14) · variable ×1 (1). Media: none ×14, left ×1 (10).

**What the closed slots could not separate — and that is the finding.** A9 is fifteen designs that are, for the most part, one column of rows on the page's own ground: **containment is `none` in fourteen and ground is `page` in thirteen**, so the first five slots leave **five pairs identical and the emphasis slot doing the separating** — (3, 6), (9, 14), and the three-way (2, 5, 15). No category in the library so far has leaned on the sixth slot this hard. It is less a taxonomy failure than the category's own claim restated: **eleven designs change nothing but their type and their padding**, and what makes each a separate design is one device.

**Four slots worth stating explicitly, because a reader would reasonably fill them in differently.**

- **4 Cards is `none · page`.** The cards are the *item's* geometry; the section has no container and no ground of its own. The Cards control (Surface · Ground) sets the card's fill, not the section's ground — the slot the brief warns is most often got wrong, and this is the design it warns about.
- **13 Slim's tuple is written at Ground Surface** — `box · surface`, the value that gives the section a container and a ground of its own. At Ground Background it is `none · page` and the emphasis slot still separates it from every stack in the table, which is the same argument the design's boundary paragraph makes in words.
- **12 Filter's archetype is `form`** for the arrangement — a field governing a list — and **not for the element**: the design has no `<form>`, no submit button and a dead Enter key.
- **1 Accordion is the category's only `variable`**, because it is the only design with no count control: every authored question is drawn, which is what the panel's “24 of 24” says. Where a Rows shown control spans the few/many boundary (four or six, three or six) the class is taken at the design's lower drawn value — stated so the reading is reproducible rather than a judgement each time.

**8 Contrast Band and 1 Accordion are the pair the brief describes** — the same rows, the same module, the same items, separated by ground alone — and A9 ships them as two designs deliberately, which is what makes the ground slot load-bearing rather than descriptive.

---

## 18 · Reconciliation notes

**Frames changed in this pass.** **All fifteen control-panel frames** — `A9-1 Accordion`, `A9-2 Two Column`, `A9-3 Open List`, `A9-4 Cards`, `A9-5 Split Head`, `A9-6 Grouped`, `A9-7 Index`, `A9-8 Contrast Band`, `A9-9 Numbered`, `A9-10 Image Split`, `A9-11 Tabs`, `A9-12 Filter`, `A9-13 Slim`, `A9-14 Ask`, `A9-15 Ledger`. On every one: the **Padding** row retired into **Vertical spacing** (8's Band padding and 13's compact ladder with it, as that design's resolution rather than as a second row), **13's Ground** row retired into **Background role**, the **universal trio** is drawn outside the design's list, and an **EDITING · the P0 primitives**, a **BEHAVIOUR · from the fixed registry** and a **DATA · nothing from Ghost** group were added, with every footer count rewritten to “N controls + the universal trio + the Data group” and a **Reconciled card** added to each spec block naming that design's Quick Controls. Beyond that, per frame: **Open rows: Many · One at a time** on **1, 2, 5, 6, 7, 8, 10, 12, 13, 14**, its scope stated at the control; **Member visibility** on all but **13**; **Open on load** added on **8**, whose Background role is also **locked at Contrast** with the reason shown; **Top divider locked None** on **3, 8, 13, 15**; the **`<details>` / `<summary>`** correction and the rewritten find-in-page disclosure in the structure notes, the spec cards and the sidebar status lines of the ten accordions; **7 Index's** three visitor-facing strings marked as catalog strings; **12 Filter's** placeholder and no-match line marked as fields with defaults, its hidden label and Clear as catalog strings, and its **ARCHITECT: registry ruling** flag kept; **11 Tabs'** ungrouped warning rewritten to name the two questions it leaves out; **10 Image Split's** photograph given **Image focus** in the Image Picker popover; **14 Ask's** button given the **Link Picker** and an optional icon, with the checkout / signup warning intact; and **ARCHITECT: registry addition** written on every frame for deep-linking.

**No section frame was redrawn, and the reason is worth stating rather than assuming.** Nothing this pass changes is visible at a drawn value. The new fields ship with the drawn text as their defaults — 12 Filter's frame already reads “Filter questions” and “No question here mentions “refund”.”, which are now the defaults of `filterPlaceholder` and `noMatch`. **Open rows' resting state is identical at both values**: Many and One at a time differ only in what happens to the row that was open, and every A9 frame is a resting state. 14 Ask's icon is **off by default**, so the button is drawn as it was. 8 Contrast Band's new Open on load is drawn at All closed, which is the frame. The `<details>` correction is a structure change with no pixels in it: the summary is the row that was already the button, and the marker, the target, the ring and the 160 ms transition are unchanged. **The one frame whose words changed rather than its drawing is 11 Tabs**, and that text is an editor warning in the sidebar, not something a reader sees.

**Conflicts with earlier rulings, one line each.**

1. **Settlement 1's “there is no one-at-a-time value anywhere in A9”** — **overturned.** `<details name>` grouping costs no JavaScript and degrades cleanly, so the value ships on all ten accordions with **Many as the default**; the argument that survives is why Many is the default, not why the value could not exist.
2. **§0's refusal of `<details><summary>`** — **overturned**, and by the registry rather than by taste: `accordion` compiles to it. The heading sits inside the `<summary>`, the native marker is suppressed and A9's own is drawn, and the packs style one rule as they already did.
3. **The ten accessibility fields specifying `<button aria-expanded aria-controls>` with a `role="region"` answer** — **corrected** in all ten: the row is a `<details>`, the answer is its content, and `aria-expanded`, `aria-controls`, `role="region"` and the `hidden` attribute are gone. One tab stop per row, Enter and Space, and no arrow keys — all unchanged, and now native.
4. **“A browser's find does not match them”, disclosed in ten panels** — **corrected, not deleted.** A find matches inside a closed row and opens it; what a closed row still costs is a reader scanning, and each panel still names **3 Open List**. **11 Tabs' version of the sentence stands** — its panels are `hidden`, which is correct for a tablist.
5. **§0's “Section padding Compact 64 · Comfortable 96 · Spacious 132” as a per-design control** — retires into **Vertical spacing** on all fifteen. **8's 44 · 64 · 88 and 13's 32 · 44 · 56 survive as those designs' resolutions**; **15's Row padding** keeps its row as a ladder that measures something else, and 13's fixed 14 px row was never a control.
6. **13 Slim's Ground control** — retires into **Background role** with its argument intact: Surface is the `surface` panel with its hairline and 32 px of padding, Background is the rows on the page's ground.
7. **8 Contrast Band's “switching from 1 Accordion changes nothing but the colours”** — was **false as written**, because 1 Accordion had Open on load and this design had no row for it. The control ships here; the claim is now true.
8. **§0's “Open on load … is offered in 1 Accordion only”** — **two designs**, 1 and 8. All closed stays fixed in the other eight accordions, stated in each panel.
9. **12 Filter's “the placeholder and the no-match wording are the theme's, not fields”** — **half overturned.** Both become fields with the drawn strings as defaults, because a non-English site cannot ship English literals; the ruling they were protecting survives in the defaults. The visually hidden label and Clear stay **catalog strings** — a name that changes when a site edits a placeholder is a name nobody controls.
10. **10 Image Split's “no focal-point control”** — **stands as written for a free point, and the escape hatch ships:** **Image focus — Centre · Top · Bottom** in the Image Picker popover, three named values rather than a draggable one, with Crop unchanged. Ground rule 10 is satisfied without a hidden field.
11. **11 Tabs' “the panel says how many are being left out”** — **superseded:** it names them. A count tells a site that something is missing; a name tells them which sentence a reader is not being shown, and this is the one place in A9 where an empty optional field costs content.
12. **The spec's routing of every edit through the sidebar repeater** — **overturned:** questions, answers and group labels edit inline on canvas. The repeater keeps what only it can do — add, remove, reorder, and which rows a design draws.
13. **Group labels, renamed on canvas** — a ruling of this pass rather than a conflict: a label lives in a second repeater, so **renaming it renames the group for every question in it**, and the confirm says so before it happens. It lands on **6 Grouped, 7 Index and 11 Tabs**, where 11's label is its tab.
14. **14 Ask's “it is a `mailto:`, a contact page or a help address and never a subscribe, a trial or a purchase”** — **unchanged, and now enforced where a user works:** the URL is picked in the **Link Picker** rather than typed, the warning still names A6·11 Reasons, and it still does not block the save. The button also takes an optional icon, **off by default**, in the label's carried colour.
15. **Member visibility, and 13 Slim's exemption** — a ruling of this pass: fourteen designs gate the section, and **13 Slim bears no ask at any value**, so it is the one A9 section a site cannot hide from a member state. Named rather than buried. *Flagged.*
16. **§0's seven refusals of ornament** — unchanged, and now **on record in every panel's Data group**: no Expand all, no resting-state count (12 Filter's while-typing count excepted), no votes or thumbs, no per-question icon, no chat launcher or ask-AI field, no accordion inside an accordion, no popular / new / important flag. They were the easiest things in the library to re-add by accident.
17. **The category's “six controls each” footers** — **lifted.** The ceiling is the PRD's ~15 plus the trio and the Data group, and A9 lands at **five to eight**: 13 at five; 3, 4, 9, 11, 15 at six; 1, 2, 5, 6, 7, 10, 12, 14 at seven; 8 at eight.
18. **Behaviour, and what no module covers** — **deep-linking carries ARCHITECT: registry addition** on every frame and in §0's finding 3, with the no-JS state drawn and **no module name coined**; **12 Filter keeps ARCHITECT: registry ruling** on its field, `filter-strip` being anchor links to Ghost routes rather than a client-side text filter. **Open rows needed no addition** — `<details name>` is markup.
19. **The answer's mark set** — **a PRD delta, recorded here:** bold · italic · link · **inline code**, and **no underline**. Inline code is in settlement 3's allowed list, so the toolbar has to offer it; an underline inside prose is a link that is not one.
20. **Settlement 2's “leaves every other row exactly as the design would have drawn it”** — **amended at one value:** at Open rows One at a time, arriving at an anchor closes the row the server drew open, because native grouping allows one open row per group. Everything else in settlement 2 stands — the 96 px, the focus move, no highlight, no history entry.
21. **§0's “Design controls write one value onto the section and every item reads it”** — **unchanged, and the new controls obey it.** Open rows, Open on load and Member visibility are section values; “open row three by default” and “hide this one answer from logged-out readers” are still not expressible, by construction.
22. **`A9-0 Category Proof` predates this pass.** The universal trio, Open rows, Member visibility, the Data group, the P0 primitives and the `<details>` correction are not in it; it was not redrawn, and **per the category's own consistency rule the drawn panels are the authority until it is**.
23. **§17's structural-descriptor table** — **unmoved.** Nothing here changes a drawn tuple: 8's lock confirms the `contrast` ground its tuple already names, 13's Ground row becoming Background role leaves `box · surface` at Surface exactly as written, and Open rows is a behaviour value rather than an arrangement.

**Quick Controls, per design.** 1 Head · Question size · Marker · Open on load · Open rows — 2 Question size · Divider · Rows shown · Open rows — 3 Head · Question size · Rules · Rows shown — 4 Head · Columns · Questions shown · Cards — 5 Rows shown · Head column · Foot · Open rows — 6 Question size · Group label · Marker · Open rows — 7 Index column · Index behaviour · Copy links · Open rows — 8 Band width · Question size · Rows shown · Open on load · Open rows — 9 Head · Questions shown · Numerals · Numeral position — 10 Division · Image side · Crop · Rows shown · Open rows — 11 Head · Question size · Rules · Groups shown — 12 Question size · Field width · Rows shown · Open rows — 13 Ground · Rules · Rows shown · Open rows — 14 Question size · Rows shown · Ask panel · Open rows · Member visibility — 15 Alignment · Question size · Rules · Row padding · Rows shown.
