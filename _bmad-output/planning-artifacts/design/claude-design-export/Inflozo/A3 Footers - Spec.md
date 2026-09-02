# A3 · Footers — written specification

Pack drawn: **Paper**. **All 16 designs complete.** Category artefacts — the four settlements, the category-wide rules, the tokenisation proof, the stress frame, the shared field list and the roster — are in **A3-0 Category Proof.dc.html**.

Frames: `A3-1 Minimal Line` · `A3-2 Columns` · `A3-3 Two-Tier` · `A3-4 Newsletter Band` · `A3-5 Contrast Band` · `A3-6 Centred Stack` · `A3-7 Big Type` · `A3-8 Sitemap` · `A3-9 Latest Posts` · `A3-10 Contact Block` · `A3-11 Colophon` · `A3-12 Card` · `A3-13 Tags` · `A3-14 Image Band` · `A3-15 Wrap` · `A3-16 Mini Bar` (all `.dc.html`).

**Footer links pass — 29 August 2026 (this document's current state).** Three items landed on this category and two of them were already done. **The member rulings were applied by an earlier session and stand:** A3·4's subscribe ask is conditional on the connected site, its Portal manage link is marked as doing nothing without script, and the no-JavaScript notice already replaces its form with the four working states left alone. This pass re-checked both against the frames and changed neither. **What is new: a social link takes its web address from Ghost's own link helper, never from the stored handle.** Ghost saves Facebook and X as usernames rather than as addresses, so a theme that prints the stored value into an `href` publishes a broken link and shows a handle where an address belongs. **The member ruling is also extended from buttons to links:** a footer link whose destination is Ghost's sign-up, sign-in or account pop-up carries the two notes that rule requires. One leftover was cleared: the Category Proof frame's caps card still listed the hand-offs the previous pass withdrew. **Nothing was renumbered.**

**Three rulings came back from the owner on 29 August 2026 and are applied in this revision.** (1) **The free pair is confirmed:** 1 Minimal Line and 16 Mini Bar. (2) **A footer link that reaches a member destination is an ordinary authored link** — the editor sets its label and its address, and INFLOZO offers no member-destination picker; the notes the member rule requires are written against what the author types. (3) **INFLOZO does not let anyone add a social account.** Accounts are configured in Ghost Admin under Settings → General → Social accounts and the footer renders only those, through **Ghost's `{{#social_accounts @site}}` block helper**. This removes the invented theme-level extension list from the category: `social[]` stops being an authored repeater, and the handle question closes with it — the helper hands the theme a finished address.

**[Free] designs:** 1 Minimal Line · 16 Mini Bar

*(Shortlisted this pass — 1 Minimal Line, 16 Mini Bar, 6 Centred Stack, 2 Columns, 15 Wrap: the five plainest footers, none of which needs a photograph — **and confirmed by the owner on 29 August 2026**.)*

**Controls-reconciliation patch applied — 24 August 2026.** This revision reconciles the category against the PRD's control vocabulary, Ghost's verified data surface and the shared **P0 editor primitives** — the inline text toolbar and Link popover (P0·1), the icon slot + Icon Picker (P0·2), the item-list controls (P0·3), the member-aware action editor (P0·4), the Populate-from panel (P0·5) and the editor state switcher (P0·6) — reused by name, never redesigned. The headline changes: the credit becomes **“Built with Inflozo”** with a plan-gated control; social icons move to the Icon Picker's Social / Brands group with an **Icon style** control and a **Short labels** display form; `legalLinks[]` gains the P0·3 repeater and a six-link cap; one category-wide **Legal layout** control; link columns may bind to **Ghost secondary navigation** (ARCHITECT: `nav-transform`); the per-design Padding, Ground and Top edge rows retire into the three **universal controls**; plus the ten per-design items. Everything not named by an item stands as written. The pass closes with a **Reconciliation notes** section listing every changed frame and every conflict ruling.

**Frame set per design:** desktop 1440 light (primary, drawn under the end of a post) · a states frame showing hover, focus-visible and pressed · the design's own behaviour or data states · tablet 834 · mobile 390 twice — once as authored, once in a named second state · dark desktop 1440 · an annotated accessibility frame · the control panel · the spec card.

**Specification-only pass, this session.** Every design now carries four added fields — descriptor, structural descriptor, archetype, behaviour module — at the head of its section, plus an **Items** field naming what the sidebar does with this category's repeating lists. Nothing drawn changed, no frame moved, and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand as written. **No module rename was needed.** This document had named no modules at all — it wrote behaviour as motion and state rather than as JavaScript — so nothing here had to be corrected against the fixed 31-module registry (FR-G7). Every module name below is the registry's, and every no-JS sentence is quoted from it rather than composed here.

**A3 uses three modules.** `accordion` on **2 Columns**, **3 Two-Tier** and **8 Sitemap** — the designs whose column count can reach five at ≤ 767 — and conditionally on **7 Big Type** and **14 Image Band** at their Columns settings; `member-form` on **4 Newsletter Band**; `slide-in-card` on **16 Mini Bar**, where it is the closest the registry comes and two of the design's mechanics fall outside it. **Eleven of the sixteen declare nothing at all**, which is what a footer should be. The lockup, the columns, the legal line, the generated year, the glyph row, the chips, the posts and the prose are server-rendered on all sixteen: **no A3 design loses content without JavaScript.** **This pass adds one architect item:** columns bound to Ghost secondary navigation (A3·2 Columns source, A3·11 Links source) need a behaviour no registry module covers — **ARCHITECT: registry addition, `nav-transform`** — and per owner ruling the prefix scheme requires JavaScript and gets no no-JS accommodation: the degradation line states the flat raw-prefix list and stops.

**`core` is assumed, not declared per design.** Every no-JS branch in A3 — the open accordion, the static form, the unpinned bar — is CSS keyed off `.js-enabled`, which is `core`'s job: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than sixteen times. *Flagged: not listing it per design is mine.*

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. All three are edit-safe, which is why every frame in A3 is a resting state — including A3·16's, drawn pinned rather than mid-release.

**Back to top declares no module, and that is a finding.** The shared Site-wide control and A3·16's own compile as `<a href="#top">`, which needs nothing; the registry has no back-to-top module, and the accessibility note's move of focus to the document's skip target needs script that an anchor does not have. Listed at the end with the other findings rather than repeated per design.

---

## 0 · Category-wide rules

### 0·0 · What the design patch pass changed category-wide

- **No design turns into another design (Part A·A8).** Every hand-off in A3 is withdrawn — six designs once resolved to **A3·1** or **A3·2** when their content ran out. Each now **hides what does not apply and keeps its own arrangement**: A3·2, A3·8 and A3·10 draw the brand block alone above the legal row when there are no columns; A3·15 draws its row with fewer items; **A3·7 shrinks a long name toward a 44 px floor and adds a line rather than cutting it** ⚑. Caps still exist, and the panel may **advise** — A3·5 and A3·12 advise A3·8 past four columns — but advice never switches a design. A3·1's own note that it "is the fallback five designs hand off to" is struck.
- **Remove never greys (Part A·A2).** Every repeating list in A3 — columns, links, legal links, credits, chips — keeps **Remove visible and active at its floor**; the click states the floor in one clause, and **points at no other control**: **"A footer column needs at least one link."** · **"A legal line needs at least one item."**
- **Counts are number pickers (Part A·A5).** Links per column, legal links, credit rows, chips and **How many posts (2–4)** are steppers; a design may cap its own maximum with the reason visible. **Columns stays a named arrangement control** (Auto · Two · Three · Four) — confirmed by the owner: A5 covers how many *items*, not how they are arranged.
- **Universals (Part A·A6).** The trio may narrow with a stated reason — A3·5's Background role is locked at Contrast, A3·3's is locked to its ground pair, A3·4's band ground disables Contrast — and may never be renamed or extended. The swatch row is **Base**. **No "Inherit" value exists in A3.**
- **Scale and gap names (Part A·A3, A·A4).** Vertical spacing keeps Compact · Comfortable · Spacious; A3·8's Density keeps its own title. Any gap control reads **Tight · Normal · Loose**.
- **Member asks are conditional (Part A·A9).** A3·4 is the category's only design with a subscribe affordance. It does not render when the connected site has **self-signup off** or **members disabled**, and a paid ask needs a **payment provider**; the **Portal manage link does nothing with JavaScript off**.
- **The no-JavaScript form notice (Part A·A10).** **A3·4 is the only design in A3 with a field**, so it is the only one that draws the notice: **Ghost's signup endpoint refuses a plain form submission**, so the earlier "posts natively, works without JavaScript" claim is withdrawn and the form is replaced by P0·4's notice at the band's own height. **The four form states stay exactly as drawn.**
- **The social row comes from Ghost Admin, through Ghost's own helper — owner's ruling, 29 August 2026.** **INFLOZO does not let anyone add a social account.** Accounts are set in Ghost under Settings → General → Social accounts, and the footer iterates them with **`{{#social_accounts @site}}`**: each row's address is the helper's `href` — **a finished address, so no A3 design ever prints a stored handle** — its accessible name is the helper's `name` (X, Facebook, LinkedIn…), and its icon is chosen by the helper's `type`. Ghost's own order is the drawn order. The helper's nine platforms are **x, facebook, linkedin, bluesky, threads, mastodon, tiktok, youtube, instagram**, and a platform with nothing set is skipped by Ghost before the theme sees it. The helper's `{{else}}` branch is the row's empty state: **no accounts connected → the row and its gap are removed.** **What this deletes from A3:** the authored extension list (previously **invented** — Ghost had no field for it, and now it needs none), Add platform, per-row Remove, drag reorder, the six-entry cap, and the platform picker. Nothing drawn changes: same 34 px box, same glyphs, same names, same disappearance. The sidebar's rows are read-only, headed **“Set in Ghost → Settings → Social accounts”**, with no Add. **Icon style** and **Social display** stay, because they are display controls over whatever Ghost supplies.
- **Member destinations are links as well as buttons (Part A·A9) — and they are ordinary links.** Owner's ruling: a footer link that reaches sign-in, sign-up or a reader's account is **an authored link whose label and address the editor sets and may change**, exactly like every other footer link. There is no member-destination picker, no special row type and no substitution. Two consequences, both stated in the panel rather than hidden: **an address that is Ghost's own pop-up needs script — with JavaScript off, nothing happens**, so the sidebar says so beside the field and names Ghost's ordinary account page as the address that does not; and because it is an authored link the theme cannot know a site has members switched off, so **it cannot hide the link on the author's behalf** — the sidebar states that where it can, and the author owns the decision. A3 still makes no claim that anything can be subscribed to, signed into or managed without script. **A3·4's own subscribe ask is unchanged** — it is a member button, and every rule already written for it stands.
- **Avatars (Part A·A1).** A3 renders no person, so neither initial rule applies. A3·9's post rows carry no author avatar.
- **Search (Part B·B1) and Ctrl-K (Part B·B5).** A3 draws no search affordance; any footer link may point at **Ghost search** through the link picker's new destination. Nothing in A3 bound Ctrl-K.
- **[Free], two per category (Part A·A7): 1 Minimal Line and 16 Mini Bar** — confirmed by the owner this pass.
- **The footer accordions declare their width (Part A · a design may declare the width below which its script runs).** The declaration is one sentence in the design's own words — **“collapses into sections under 768”** — and it is written on **A3·2**, **A3·3** and **A3·8**, and on **A3·7** and **A3·14** with the setting that turns their accordion on named inside it (“under 768, at Links: Columns”), because on those two the module is conditional on a control as well as on a width. **Where a design declares a width, its no-JavaScript line reads both sides of it.** Above 768 nothing is collapsed at any column count: the grid, every heading, every link and the legal row are server-rendered, and no A3 design runs anything at that width. Below 768 two to four columns stay an open grid and five to seven are native `<details>` — first group server-open, counts static text, every link reachable and keyboard-operable — so **the only thing lost on either side of the width is the 160 ms height transition**. A3·8's declaration carries no condition: five groups is its floor, so the width alone decides. **The other eleven designs declare no width**, because nothing in them runs at any width.

These apply to all 16 designs and are not repeated per design.

**Placement.** One `<footer role="contentinfo">` per page, the last landmark, a sibling of `<main>`. **One A3 per site**, on every template. A3·16's pinned bar and its released footer are the same element — never two landmarks.

**The top edge.** A footer whose ground matches the page's draws one hairline above it. A footer whose ground differs draws none: the ground change is the edge. A3·12's card draws neither — the gap is the separator. The footer is the only category in the library allowed to assume what precedes it, because something always does.

**The three universal controls.** Every placeable section carries **Background role**, **Vertical spacing** (Compact / Comfortable / Spacious) and **Top divider** (None / Line / Fade) **outside its own control list** — the reconciliation pass retires the per-design rows that duplicated them. The old Padding rows were Vertical spacing under another name; each design's px values below now describe what the universal ladder resolves to on that design (a one-line footer's Comfortable is 28 px a side, a column footer's 56 px top, an inverted band's 64). Genuinely different ladders keep their own names inside the design's list: A3·4's band padding, A3·12's card padding and inset, A3·16's bar height. The old Ground rows are the universal Background role; A3·3's Ground pair, A3·4's Band ground and A3·12's Card ground are the design's own planes and stay. **A design whose ground is its identity locks Background role with the reason shown:** A3·5 (the contrast band is the design) and A3·14 (the photograph is the ground). A3·8 disables Contrast above four columns with its ratio-and-reason line. The old Top edge values map onto Top divider — Hairline → Line; Ground change → None with the differing ground doing the work; Fade is newly available everywhere — and A3·3 locks it (the pair always differ, so the edge is the ground change).

**The four settlements.**

1. **Link columns — auto-fit by the authored count.** Two keep the 1fr width they would have had at four and sit against the brand block on a half measure, leaving the right quarter empty; the editor does not warn about it. Three or four fill the measure. Five or more move the brand block above the grid and wrap four across — 4 + 3 at seven, last cell empty, never justified. **Seven columns is the cap**: Add column is disabled with “Seven is the most a footer can hold. Consider a second column heading instead.” **Eight links per column** is the second cap: “Eight links is the most a column can hold.” Columns are top-aligned, never stretched, and links are never moved between them. At 1080 columns go two-across (three-across in A3·8). At ≤ 767, **two to four columns stack open** as a two-across grid with links padded to 44 px; **five to seven collapse to accordions**, one per row, 48 px rows on hairlines, count at the right end, first group open.
2. **The newsletter form — one row only.** Visually-hidden label, email field, button, one 13 px reassurance line ≤ 90 characters. No heading, no body copy, no image: A22 Newsletter owns the persuasive version. Four states at one height — **focus, invalid, submitting, done** — with the resting band serving as the empty state rather than being drawn twice. (Corrected this pass: the list had named "empty" where the frame draws focus.) Detail in §4.
3. **The social row renders only what Ghost has — and its glyphs are the theme's own per-platform set.** The glyphs are the same Tabler family the Icon Picker uses (P0·2's library ruling), **never typed two-letter boxes**, but they are no longer picked per row: the theme ships one partial per platform and the helper's `type` chooses it, in block form with a neutral fallback glyph inside so a platform Ghost adds before the set catches up still renders. The drawn frames use neutral stroke placeholders for them. **The split is withdrawn by the owner's ruling of 29 August 2026: there is one source, and it is Ghost.** Accounts are configured in Ghost Admin (Settings → General → Social accounts) and the row is **`{{#social_accounts @site}}`** over them — nine platforms (**x, facebook, linkedin, bluesky, threads, mastodon, tiktok, youtube, instagram**), a platform with no value skipped by Ghost, Ghost's order the drawn order. Each row takes its address from the helper's **`href`**, which is a finished address: **no design in A3 prints a stored handle**, and the helper's `username` is read by nothing. The accessible name is the helper's **`name`**; the icon is selected by the helper's **`type`** through a dynamic partial in **block form** with a fallback glyph inside it, so a platform Ghost adds before the icon set catches up degrades to a neutral mark instead of erroring the page. **Version gate:** on Ghost 5.x, which has no such helper, the row is Facebook and X through their own link helpers; on 6.x it is the nine. The **`{{else}}` branch is the empty state** — nothing connected, and the row and its gap are removed, never empty circles, never a heading over nothing. **The authored extension list, its platform picker, its Add, its Remove and its six-entry cap are all deleted**, and with them the category's fourth invented field group. Two controls, category-wide: **Icon style** (Bare · Outlined box · Filled box) and the display control, extended — **Glyphs · Labels · Short labels (Fb, X, Li, In, Yt) · Off**. Size and colour role are **one value for the whole row** rather than per icon — the rows are Ghost's, so there is nothing per-row to open — set as roles, never hexes, and a role failing AA on its ground disables with the ratio shown. Geometry unchanged: 34 px box (bare, outlined or filled per Icon style), 30 px inside a legal line (A3·8, A3·15), a real 44 px box at ≤ 767. Names are platforms, not glyphs — the glyph is `aria-hidden`, the accessible name is the platform's; the list is a `<ul>` labelled “Orbit Weekly elsewhere”, and each link carries `rel="me noopener"` with `target="_blank"` — the markup inside the helper's block is ours, which is where those attributes are added.
4. **The legal line.** One order everywhere: **copyright · Privacy · Terms · Built with Inflozo**, 13 px muted, middots in the border token generated as CSS. The year is generated, never typed. **`legalLinks[]` is a standard P0·3 repeater** — Add arrives with content (“New page” → `/`), Remove never disabled above zero, drag reorders, labels edit inline (P0·1), URLs open the Ghost-aware Link Picker — **capped at six, raised from four**: Privacy · Terms · Disclaimer · Imprint already makes four. **The credit reads “Built with Inflozo”, linking to inflozo.com. On the Free plan the control is disabled-on with the reason shown in the sidebar; only Pro may hide it.** The previous “Published with Ghost” with a free Show/Hide toggle is corrected across all sixteen designs — one change, every frame that draws the line. **Legal layout** is one category control — **One line · Copyright left, links right** — carrying the owner's “move Privacy / Terms right” asks: drawn at the split value on A3·4, A3·5, A3·7, A3·9 and A3·11 (copyright and the credit left, Privacy and Terms right); A3·6 keeps its stacked variant, locked, with © and the credit under the links; A3·16's bar defers to the released footer's own legal line. At ≤ 767 the split stacks back into the wrapped group, items never breaking mid-item.

**Ghost secondary navigation as a source.** Wherever a design draws link columns, a **Columns source** control offers **Authored · From Ghost secondary nav (prefixes)**, the same scheme as A1: a `+` label heads a column, following `-` items are its links, unprefixed items are plain links. Bound columns become read-only rows (“Edit navigation in Ghost”) with no Add. **ARCHITECT: registry addition — `nav-transform`**, stated on the frames and here; per owner ruling the scheme requires JavaScript and gets **no no-JS accommodation** — the degradation line states the flat raw-prefix list and stops. Drawn in the panel on A3·2 (the design that settles the columns) and as A3·11's Links source; every other design drawing the shared column list inherits the control with it.

**No fixed visitor-facing string ships.** Each visible string is an editable field with a default or a theme translation-catalog string, decided per string. **Fields:** `postsHeading` (“Latest”), `tagsHeading` (“Browse by subject”), `contactHeading` (“Get in touch”), `creditsHeading` (“Masthead”), the newsletter placeholder, button label, note and both success lines, and A3·4's two signed-in sentences. **Catalog strings:** the accordion count template (“{n} links”), A3·13's overflow line (“All {n} tags”), “Back to top”, the visually-hidden “Email address” label, the aria labels (“Legal”, “{site title} elsewhere”), and A3·4's error line — it must match what was actually rejected, so it is the catalog's, never a field. The credit “Built with Inflozo” is neither: it is the product's own line, plan-gated.

**Member awareness.** A3·4 is the category's one CTA-bearing design, and its richer member-state model (**Signed-in members**, §4) subsumes the standard Member Visibility control per the reconciliation ground rules; no other A3 design carries a CTA, so none carries Member Visibility. Member checks compile server-side; nothing flashes.

**Image focus.** Every image field carries an Image focus (Centre · Top · Bottom) reachable from the Image Picker popover — in A3 that is A3·14's footer image, including its site-cover binding. Post feature images are Ghost's own and take no focus control here.

**Button icons.** Any button accepts an optional icon before or after the label from the Icon Picker, per P0·2's button-icon rules — always Small, label-coloured, Size and Colour rows hidden. In A3: A3·4's subscribe button and A3·16's Back to top.

**Control budget.** The earlier 4–7 norm is lifted where this pass adds controls: the ceiling is the PRD's ≈15 visible controls per design, plus the three universal controls, the category Legal layout and the Data group. Quick Controls stay the 3–5 highest-impact. **No Preview-type control existed in A3** — the audit found none to remove; states preview through the P0·6 state switcher (A3·4's form states, A3·16's release), never through a sidebar control.

**Type floors.** Links 15 px; 14 px only in A3·8 Sitemap. Column headings 13 px / 600 uppercase tracked 0.08em, in `text` at full strength — never muted, they are what holds a grid. Meta and legal 13 px muted. Prose 17 px (16 px at ≤ 767). **One exception in the category:** A3·10's 12 px field labels, each a `<dt>` naming a 15 px value.

**Link states.** Muted at rest; hover → `text` with a 35% underline, 160 ms, no movement; focus → the library ring, 2 px accent at 2 px offset, tight to the text box rather than the hit area. On a contrast ground hover and focus both switch to the pack's lightest surface, never accent: Paper's accent on its contrast measures 4.85:1 and a darker pack's fails.

**Accent budget.** Once per footer. Permitted: the logo mark, A3·4's newsletter button, A3·13's current-tag chip (via contrast), and the focus ring. A3·4 spends the footer's whole budget on its button.

**Depth.** Pack radius, hairlines, warm `sm 0 1px 2px rgba(28,27,26,.06)` and `md 0 4px 16px rgba(28,27,26,.08)`. In dark, shadows are dropped and the hairline separates (A3·12, A3·16). Under forced colours the hairline is what remains, which is why no design relies on a shadow alone.

**Motion.** 160 ms ease-out, one transition per state change. The category's whole budget: link and glyph hovers, the accordion's height at ≤ 767, A3·9's 1.02 image hover, A3·16's release. All suppressed under `prefers-reduced-motion`, thresholds unchanged. Nothing animates while the section is being edited.

**Data from Ghost.** Site title, logo, Facebook and X from settings; posts, tags and counts from content. Social accounts come from Ghost too, through `{{#social_accounts @site}}`. Everything else is section content — including the contact fields, the credits and `footerBelow`, **three invented groups where there were four**: the extra social platforms are gone, deleted with the authored list by the owner's ruling. **Flagged:** a site with several footers keeps those four in step by hand; Ghost gives us nowhere else to put them.

**Empty-data floor.** Every element that leaves takes its gap; nothing is substituted for what is missing. No site title → no footer, and the editor says the site needs a name. Where a design's own subject is absent, **the design hides what does not apply and keeps its own arrangement** (Part A·A8); the sidebar states what is not drawn. No design names a sibling. Fields a design does not draw are kept, not cleared, and return on switching.

**The Site-wide group.** `showAttribution` (disabled-on for Free with the reason shown; Pro may hide), Back to top and Shows on sit below each design's own controls, beside the universal Background role, Vertical spacing and Top divider and the category's Legal layout; none count against the design's own list.

**The item lists.** Two repeaters run through the category, and two designs add a third. `linkColumns[]` — a column is `heading` (req, ≤ 24) plus `links[]`, each `label` (req, ≤ 28) and `url` (req). `social[]` — **not a repeater at all, as of the owner's ruling:** read-only rows from Ghost's own social accounts through `{{#social_accounts @site}}` (Facebook and X through their link helpers on 5.x; the nine platforms on 6.x), each row linking to the setting in Ghost that owns it, with **no Add, no Remove, no reorder and no authored extension list**. `legalLinks[]` — the P0·3 repeater, 0–6. A3·11 adds `credits[]` and, this pass, `creditsGroups[]`; A3·13's `tagsList[]` is a picker over Ghost's tags rather than an authored list.

**Where the controls sit.** Each list is a repeater in the sidebar, below the design's own controls and above the Site-wide group: one row per item with a drag handle, a remove action, and **Add …** at the end of the list. Selecting an item on the canvas selects its row and opens that item's fields. Keyboard: ⌥↑ / ⌥↓ moves the focused row.

**What Add produces — never a blank row.** A new column arrives as heading “More” holding one link, “Archive” → `/archive/`, and lands last. A new link arrives as “New link” → `/`, lands at the foot of its column, and opens its label for typing. **There is no Add for a social account** — accounts come from Ghost, so where the Add would have been the sidebar says “Set in Ghost → Settings → Social accounts” instead of leaving an author looking for a button. An empty shell in a footer publishes as a hole, so nothing is added empty.

**Remove, and the floors.** Remove sits on the row and is undoable. Removing a column's last link removes the column and says so. **At a design's minimum Remove stays visible and fully clickable** (Part A · the remove button never greys out): the click does not remove, and the floor and the reason arrive as one sentence under the list, pointing at no other control. Nothing greys, and nothing is silent.

**Reorder.** Columns read left to right and links read top to bottom, so authored order is drawn order everywhere in A3. Two designs make it consequential rather than merely visible: **A3·6** reads the first authored group as its primary row, and **A3·16** draws the first column's first N links in the pinned bar.

**Caps, stated once.** Seven columns and eight links a column are settlement 1's, and they are now the only authored caps in the category. **The six-social cap is deleted** with the authored list it capped: Ghost decides how many accounts exist, up to its nine, so there is nothing to cap and nothing to refuse. What the design owes instead is a **fit rule**: six 44 px boxes on a 6 px gap are 294 px of a 350 px measure at 390, so **a seventh onward wraps onto a second centred row at the same gap**, and the row's own height grows rather than the boxes shrinking. *Flagged: the wrap is mine; the nine are Ghost's.*

**Two rules about item controls, and they are architectural rather than stylistic.** (1) **A design control writes one value onto the section and the stylesheet reads it, so it applies to every item at once.** “Make column three wider” is not expressible by construction, and where a design appears to need per-item styling it is two designs — A3 already ships that pair, A3·2 on the page ground and A3·5 on contrast. (2) **Inside an item the user edits content only** — text, image, link — never layout, spacing, alignment or emphasis. Selecting a column gives its heading and its links; selecting a link gives label and URL; selecting a social entry gives the URL alone, because the platform's name is the platform's.

**Zero items** is each design's own empty state, and each design states it again in item terms below.

**Accessibility floor.** One `contentinfo` per page, last in focus order. Lockup is one link named “{site title}, home” with the mark `aria-hidden`. Link columns are per-group `<nav aria-labelledby>` pointing at their visible `<h2>`; a single ungrouped list is one `<nav aria-label="Footer">`. Legal is a `<ul>` labelled “Legal”; separators are CSS. No footer borrows the site title as a heading. Hit targets 44 px at ≤ 767.

---

## 1 · Minimal Line

A brand-and-social row above the legal line's own second row, over one hairline. The baseline — the least a footer can be — and where the legal line, the locked attribution, the legalLinks repeater and the social row's disappearance are set. Spends no accent beyond the mark. **Reconciled from a single row:** the owner's legal-row move (patch items 1 and 4) gives the legal line its own second row.

**Descriptor.** The category's floor — a brand row over a legal row with nothing added to them, spending no accent — the category's least-furnished arrangement, which is what makes it the baseline.

**Structural descriptor.** `bar · none · page · none · none · brand row over legal row`

**Archetype.** bar

**Behaviour module.** **none.** The lockup, the glyph row, the legal line and the generated year are all server-rendered, and every state in the design is a CSS hover or focus. There is nothing to degrade: with JavaScript off this footer is identical. **No design hands off to it** (Part A·A8) — five designs once did. Back to top, when the shared Site-wide control is on, compiles as `<a href="#top">` and declares nothing — the category's finding, not this design's.

**Items.** `social[]` only: this design draws no columns.

- **Add.** **None, by the owner's ruling.** Accounts are added in Ghost Admin, not here; where the Add button was, the sidebar reads **“Set in Ghost → Settings → Social accounts”** and links out to it.
- **Remove.** **None here either** — a row is removed by clearing that platform in Ghost. The rule that Remove never greys out has no subject in this list, because there is no Remove to grey.
- **Reorder.** Not offered. **Ghost's order is the drawn order**, left to right; an inert drag handle would be worse than no handle, so there is none, and the sidebar says where the order comes from.
- **Counts.** 0–9, and none of them ours: Ghost's nine platforms, skipping any with no value set. Two to four is what most sites will have. There is no minimum and no maximum to police — **at seven and above the row wraps onto a second centred row** at ≤ 767 rather than shrinking its boxes.
- **Zero.** Nothing connected in Ghost → the helper's `{{else}}` branch runs, and the row and its 8 px gap are removed; the lockup and the legal group close up. Never an empty circle, never an outlined icon pointing at a contact page, never a heading over nothing.
- **Inside an item.** **Nothing is editable here.** The address is the helper's `href`, the name is the helper's `name`, the icon follows the helper's `type`; selecting a row on the canvas selects the read-only row in the sidebar and offers the link out to Ghost. This is what keeps “names are platforms, not glyphs” true without anyone typing anything.
- **The kept column list is not shown on this design.** A repeater whose items are never drawn invites editing into a void; the list is kept intact and returns on switching to a design that draws it. *Flagged: mine.*

**Content fields.** `wordmark` (req) · `mark` (opt) · `social[]` (**read-only, from Ghost**) · `copyright` · `legalLinks[]` · `showAttribution`. Does not display `linkColumns`, `tagline`, `description`, the newsletter group, the contact group, `credits`, `latestPosts`, `tags`, `image` — all kept.

**Controls.**

| Control | Values |
|---|---|
| Arrangement | Spread · Centred |
| Social position | In brand block (near the logo) · In legal row · Off |
| Social display | Glyphs · Labels · Short labels (Fb, X, Li, In, Yt) · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal, outside the list: Background role; Vertical spacing, resolving 20 · 28 · 40 a side here; Top divider, drawn at Line (the old Top edge's values map onto it). Attribution is the locked Site-wide control. **The panel draws `legalLinks[]`'s P0·3 repeater** — this is the settlement design, so the drawn example lives here: two rows (Privacy, Terms), Add-with-content, the 2–6 range line.

**Data.** Site title and logo from Ghost settings. **The social row is Ghost's, whole:** `{{#social_accounts @site}}` over the accounts set in Ghost Admin, each row's address the helper's finished `href`, its name the helper's `name`, its icon keyed off the helper's `type`, in Ghost's order, with `{{else}}` as the empty state — **nothing about it is authored in INFLOZO, and no handle is ever printed.** This is the design that settles the social row, so the rule is recorded here for the other fifteen; the theme-level extension list it used to name is deleted. Copyright year generated. No logo → the initial square.

**Responsive.** 1440–768: two rows — lockup and social above (Social position: In brand block draws the glyphs beside the lockup), the legal line on its own row beneath; page padding 72 → 40, social gap 8 → 4. ≤ 767: three centred rows in source order — lockup, social, legal; glyph boxes 34 → 44 px with a 6 px gap; the legal line wraps as a group at 8 px and items never split mid-item.

**Empty state.** No social → row and gap removed. No legal links → copyright and the credit alone. Attribution hidden (Pro), no legal links, no copyright → the legal row is removed and the brand row stands alone above the hairline.

**Accessibility.** Category floor. No heading, visible or hidden: with three groups a hidden “Footer” heading would describe nothing. Muted legal text on background 5.4:1 light, 6.4:1 dark.

**Flagged as mine.** The three-row mobile order, attribution last in the line, the 16 px lockup-to-social gap on the brand row, and the neutral placeholder glyph shapes standing in for Tabler brands.

---

## 2 · Columns

Brand block at the left margin, link columns filling the measure, legal line on its own row under a hairline. The design that settles the column rule for the category.

**Descriptor.** The design that settles the column grid — brand block at the left margin, authored columns filling the measure — and the only one whose column count is free to run the whole 2–7 range, which is what the seven-column cap, the eight-link cap and the accordion threshold are written against.

**Structural descriptor.** `grid-of-N · none · page · variable · none · brand block beside columns`

**Archetype.** grid-of-N

**Behaviour module.** `accordion`, and only at ≤ 767 with five to seven columns authored; two to four stack open and the design declares nothing. Edit-safe — `<details>` is markup, so nothing runs while the section is edited. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” First-group-open is that `open` attribute; the counts at the right end are static text; what the module adds is the 160 ms height transition and nothing else. **The accessibility field's `<button aria-expanded aria-controls>` and the module's `<details>`/`<summary>` disagree** — the registry owns module mechanics, so the drawn accordion and the spec card owe a correction. *Finding, and it is A2·14's finding again.* **Declared width: “collapses into sections under 768”**, and only at five to seven authored columns — the declaration names the condition as well as the width. **JS off at 768 and above:** nothing is collapsed at any column count; the brand block, every heading, every link, the social row and the legal line are server-rendered, four across at 1440 and two across at 1080, and there is no accordion at that width to lose. **JS off below 768:** two to four columns stay the open two-across grid with links padded to 44 px and still nothing runs; five to seven are native `<details>`, first group server-open, counts static, every link reachable — only the 160 ms height transition is lost.

**Items.** The category's column list at full range; every other design's item rules are stated against this one.

- **Add column** at the end of the list, landing last, which is the right end of the grid. At four the measure is full and a fifth moves the brand block above a four-across wrapping grid — settlement 1's rule, reached by pressing Add rather than by a control. Disabled at seven: “Seven is the most a footer can hold. Consider a second column heading instead.”
- **Add link** inside a column, landing at its foot. Disabled at eight: “Eight links is the most a column can hold.”
- **Remove.** A column or a link at a time; links are never moved between columns to fill a gap. **At two columns Remove stays active**; the click states the floor under the list: “Two is the fewest this design draws.”
- **Reorder.** Meaningful in both directions: columns left to right in authored order, links top to bottom within a column. Dragging column five to position two changes the grid rather than the wrap.
- **Counts.** 2–7 columns, 1–8 links. Designed for three or four, which fill the measure. Two keep the 1fr they would have had at four and leave the right quarter empty on purpose — the editor does not warn. Five to seven re-arrange as the settlement says. **One column** renders on that same 1fr with three-quarters of the measure empty and the sidebar names A3·1.
- **Zero.** No columns → the column grid is absent and the brand block sits alone above the legal row, still this design (Part A·A8); the repeater shows Add column and a line saying what the footer draws until one exists.
- **Inside an item.** Column: `heading` (req) and its links. Link: `label` and `url`. A link whose target has been deleted keeps rendering and is flagged — the user's text is never removed on their behalf. Nothing else: the column's width, its gutter, its top alignment and its 11 px link rhythm are the section's, written once and read by all of them.

**Content fields.** `wordmark` · `mark` · `tagline` (≤ 80) · `linkColumns[]` (2–7 groups; heading req ≤ 24, links 1–8 of label ≤ 28 + url) · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`.

**Controls.**

| Control | Values |
|---|---|
| Columns | Auto · Two · Three · Four (Auto follows the authored count, default) |
| Columns source | Authored · From Ghost secondary nav (prefixes) |
| Fill column | Authored links · Ghost tags |
| Brand block | Lockup and tagline · Lockup only · Off |
| Social position | In brand block · In legal row · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal, outside the list: Background role; Vertical spacing, resolving 40 · 56 · 80 top (bottom always 26 under the legal row); Top divider Line. **Columns source: From Ghost secondary nav** reads A1's prefix scheme — a `+` label heads a column, following `-` items are its links, unprefixed items are plain links; bound columns become read-only rows (“Edit navigation in Ghost”), no Add, no caps to police. **ARCHITECT: registry addition — `nav-transform`**, on the frame and here; owner-ruled JS-only, degradation is the flat raw-prefix list, full stop. **Fill column: Ghost tags** renders one generated column of read-only rows with post counts, matching A3·8's generated group; its heading stays authored.

**Data.** At Columns source: Authored, lists are authored and a column may point anywhere; a link whose target is deleted keeps rendering and the editor flags it rather than removing the user's text. At From Ghost secondary nav, the columns follow the navigation and are edited in Ghost; the caps do not apply to bound columns. Fill column: Ghost tags follows Ghost's tag list, counts included.

**Responsive.** 1440–1081: brand block 300 px fixed, columns 1fr, 40 px gutters, 11 px link rhythm. Two columns stay 1fr and leave the right quarter empty. Five to seven put the brand block above a four-across wrapping grid. 1080–768: two columns across, brand block spanning at 260 px, gutters 32, row gap 36. ≤ 767: two to four columns become a two-across grid, open, links padded to 44 px (list gap 11 → 2 px, the padding does the spacing); five to seven become accordions, first open, count at the right end.

**Empty state.** No columns → the grid is absent and the brand block sits alone above the legal row, still this design (Part A·A8). No tagline → lockup and social close up. No social → row and gap removed.

**Accessibility.** Each column is `<nav aria-labelledby>` on its visible `<h2>` — four columns is four small navs, which is correct: they are four groupings, and one unlabelled list of sixteen links is what we are avoiding. Accordion headings keep their `<h2>` and use `aria-expanded`; closed groups are `hidden`. Focus order is reading order. Links 5.4:1 light / 6.4:1 dark; headings 12.1:1 / 11.8:1.

**Flagged as mine.** The seven-column cap and its wording, the eight-link cap, the 1080 two-across threshold, the five-column accordion threshold, the empty right quarter at two columns, the accordion counts, and the fall-back to A3·1.

---

## 3 · Two-Tier

Links on one ground, a full-bleed legal bar on another. The lockup lives in the bar, not the tier — the whole difference from A3·2, and what lets the bar be the site's constant. The bar is A3·1 Minimal Line, verbatim.

**Descriptor.** The only footer split across two grounds, with the lockup in the lower bar rather than in the tier — which is what lets the bar be the site's constant while the tier above it changes.

**Structural descriptor.** `stack · none · surface · variable · none · full-bleed legal bar`

**Archetype.** stack

**Behaviour module.** `accordion`, on the same condition as A3·2 — ≤ 767 with five to seven columns in the tier. The bar repeats A3·1's composition and adds nothing; the ground pair, the fixed hairline and the 24 px bar padding are CSS. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all.” Both grounds and both tiers render, so the division a reader sees is the division without JavaScript too. The `<button aria-expanded>` correction A3·2 owes applies here unchanged. *Finding.* **Declared width: “collapses into sections under 768” — the tier only.** The bar declares nothing at any width and never has. **JS off at 768 and above:** both grounds and both tiers render whole, the tier's columns open at every count, the bar exactly as drawn. **JS off below 768:** the tier follows A3·2 — two to four open, five to seven as native `<details>` with the first group server-open — and the bar is unchanged; only the 160 ms height transition is lost. The division a reader sees is the same on both sides of the declared width.

**Items.** A3·2's list, and the same repeater: the tier draws the columns and the bar never does.

- **Add, remove, reorder** as A3·2, including both caps and the accordion at five.
- **Counts.** 2–7 in the tier, 1–8 links. The bar's contents are set by the Bar contents control and do not change with the count at any width.
- **Zero.** No columns → the tier is removed and what remains is A3·1 on the bar's ground, one landmark and one row, stated in the sidebar. Bar contents: Legal only takes the lockup out as well, which is the smallest this design gets.
- **Inside an item.** As A3·2.
- **Social belongs to the tier or the bar** as Social's value says; moving it moves the row, not the list, and the list is the same one in both places.

**Content fields.** As A3·2 minus `tagline`, which has nowhere to sit in either tier and is kept.

**Controls.**

| Control | Values |
|---|---|
| Ground pair | Surface tier · background bar / Background tier · contrast bar / Contrast tier · background bar |
| Columns | Auto · Two · Three · Four |
| Bar contents | Lockup, social, legal · Lockup and legal · Legal only |
| Social position | In brand block · In legal row · Off |
| Social display | Glyphs · Labels · Short labels · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal: Vertical spacing resolves 40 · 56 · 80 on the tier (the bar is fixed at 24 and does not follow); Background role is **locked** — the Ground pair is this design, two grounds never one role; Top divider is **locked** at None — the pair always differ, so the ground change is the divider and the tier–bar hairline is fixed on. A matched pair is not offered. Copyright and the credit sit in the bar, below the tier's nav — the design already had the reconciled arrangement.

**Data.** As A3·2.

**Responsive.** The tier follows A3·2's column rule at every width, including the accordion threshold; the bar follows A3·1 — one row to 768, three centred rows at ≤ 767. Both keep their grounds at every width; at 390 the ground change is the only thing telling the reader the bar is not another column. Tier padding 56 → 44 at 834, bar 24 → 20.

**Empty state.** No columns → the tier is removed and what remains is A3·1 on the bar's ground; the sidebar says so. Bar contents: Legal only → the lockup leaves and the legal line spans left.

**Accessibility.** One `contentinfo` around both tiers — two grounds are a visual division, not a structural one. No CSS re-ordering at any width. Measured per pairing: links on surface 5.1:1, headings 12.6:1, legal on background 5.4:1; on a contrast bar legal at 78% carried gives 8.9:1 and the wordmark 13.9:1; on a contrast tier links at 72% give 7.6:1. Any pairing that drops a value below 4.5:1 in a given pack is disabled there with its ratio shown.

**Flagged as mine.** The three ground pairings and the refusal of a matched pair, the bar's fixed 24 px padding, the mark's inversion on contrast, and the 72% / 78% carried values.

---

## 4 · Newsletter Band

A band across the top of the footer holding one form row, with the links beneath. Settles the footer's inline form for the category.

**Descriptor.** The only footer that takes input — one form row as a band across the top of the footer, with no heading and no body copy, which is exactly what separates it from A22 Newsletter.

**Structural descriptor.** `form · none · surface · one · none · band above links`

**Archetype.** form

**Behaviour module.** `member-form`. Edit-safe: the form does not post while the section is being edited, and the four states are drawn rather than triggered. **JS off (corrected this pass — Part A·A10):** ~~the form posts natively to Ghost's members endpoint~~. **It cannot.** Tested against both live Ghost servers, **Ghost's signup endpoint will not accept a plain form submission**, so a scriptless field would take an address and lose it. The form is therefore **replaced by the no-JavaScript notice** (P0·4) — one line, the band's own height, the note kept beneath it: *“Signing up needs JavaScript — turn it on to subscribe.”* **The four working states are untouched:** empty, invalid, submitting and sent are Ghost's own script doing its job and stay exactly as drawn (Part D). What was withdrawn is only the claim that any of it survives without script. **Members off in Ghost is a separate question** and is not about JavaScript: the field is replaced by the button-as-link at the server, and that substitution holds either way.

**Items.** One item list, and it is not the form: `linkColumns[]` beneath the band, plus `social[]`.

- **Add column** as A3·2, but **Columns tops out at Three here.** A fourth and beyond are kept, counted, and not drawn, with the sidebar naming the number it will render — kept rather than refused, because the field is the category's and the author may be on their way to A3·2. *Flagged: keeping rather than refusing is mine.*
- **Add link** as A3·2, 1–8 a column.
- **Remove, reorder** as A3·2; drawn order for the three that are drawn, and a dragged fourth column becomes visible by arriving in the first three.
- **Counts.** 0–3 columns drawn, 1–8 links. Three is the design's own high end because 1080 puts the columns two-across with the brand block as a cell.
- **Zero.** Columns: Off, or none authored → the band sits directly above the legal row. The band is the design, so this is its floor (Part A·A8), and the sidebar says so instead of recommending another design.
- **Inside an item.** As A3·2. The placeholder, button label, note and both success lines are section fields rather than items — one form to a footer, never a list of forms.

**Content fields.** `newsletterPlaceholder` (opt, ≤ 28, default “you@example.com”) · `newsletterButtonLabel` (opt, ≤ 16, default “Subscribe”) · `newsletterNote` (opt, ≤ 90, one line) · `newsletterSuccess` (opt, ≤ 60) · `newsletterSuccessShort` (opt, ≤ 32, used ≤ 767) · `memberSubscribedLine` (opt, ≤ 60, default “You're subscribed to {site title}.”) · `memberManageLabel` (opt, ≤ 40, default “Manage your newsletters in your account”) · plus `wordmark`, `mark`, `linkColumns[]`, `social[]`, `copyright`, `legalLinks[]`, `showAttribution`. **There is no heading or body field** — that is the settlement, not an omission. The error line is a theme translation-catalog string, not a field: it has to match what was actually rejected.

**Controls.**

| Control | Values |
|---|---|
| Band padding | Compact 28 · Comfortable 40 · Spacious 56 — the band's own ladder, kept under its own name |
| Band ground | Surface · Background · ~~Contrast~~ (disabled — a field on a contrast band needs a surface step the packs do not define) |
| Field width | Narrow 320 · Medium 400 · Wide 480 |
| Band alignment | Centred · Left |
| Columns | Auto · Two · Three · Off |
| Signed-in members | Show form · Hide band · Show manage link (Portal account/newsletters) — **the manage link opens Portal, so with JavaScript off nothing happens** (Part A·A9) |

Universal: Background role and Vertical spacing govern the section around the band; Top divider None (the band's ground change is the edge). Legal layout drawn at the split value — © and the credit left, Privacy and Terms right. **Signed-in members is the reconciliation item: today a subscriber is asked to subscribe.** A server-side member check — no JS, nothing flashes, the module stays `member-form` — decides what a signed-in reader gets: the form, no band, or a manage line linking to Portal's account / newsletters. Drawn at Show manage link; both sentences are editable fields with defaults (“You're subscribed to {site title}.” · “Manage your newsletters in your account”). This model subsumes the standard Member Visibility control (P0·4 scope: SECTION). The subscribe button accepts an optional icon, before or after the label, per P0·2.

**States.** *Empty*: placeholder in muted. *Focus*: 1.5 px accent border on the field, library ring suppressed — it would collide with a button 10 px away; A2·5 Capture's documented departure, repeated so the two forms behave identically. *Invalid*: the error replaces the note at 13 px / 500 in `text`, field border 1.5 px `text`, **no red anywhere** — the seven roles contain no error colour; band height unchanged; checked on blur and submit, never per keystroke. *Submitting*: label “Subscribing…”, field disabled on the pack's hover surface, button label to 80%, width reserved for the longer label so the row does not twitch; no spinner. *Done*: field, button and note replaced in place by the confirmation and a way back, at identical height; session-lived — a reload shows the empty form, because Ghost's confirmation email is the record.

**Data.** Posts to Ghost's members subscribe endpoint **via Ghost's script**; Ghost sends its own confirmation. An already-subscribed address gets Ghost's response in the same slot. **Conditional on the connected site (Part A·A9):** with **self-signup switched off**, or **members disabled altogether**, the field does not render — the band keeps its own shape and drops the ask, the sidebar states which of the two conditions is in force and links to the setting, and placeholder and note are kept. Field width and Submit style stay in the panel, **disabled with the reason** (owner's ruling), since the site's settings can change without the author touching this footer. **A paid ask additionally needs a payment provider connected.** **The Portal manage link, and every button that opens Portal, does nothing with JavaScript off.**

**Responsive.** 1440–1081: one row at the named field width, note under. 1080–768: field steps one value down (400 → 320), row holds, columns two-across with the brand block as a cell. ≤ 767: field and button take a row each at 48 px, field text 15 → 16 px so iOS does not zoom, note centred, success copy uses `newsletterSuccessShort`.

**Empty state.** No note → the band is the row alone and loses 22 px. Columns: Off, or none authored → the band sits directly above A3·1's bar.

**Accessibility.** A real visually-hidden `<label>Email address</label>`, plus `aria-label="Subscribe to {site title}"` on the form, since there is no visible heading. **The no-JavaScript notice is plain text in the band, not an alert** — nothing has changed for the reader, so there is nothing to announce. `type="email"`, `autocomplete="email"`, `inputmode="email"`, `required`; `aria-invalid` on error with focus held in the field. The note is both the `aria-describedby` target and the `aria-live="polite"` region, so the outcome is announced where the terms were. Button is `<button type="submit">` whose visible label is its whole name; disabled while submitting. Placeholder 5.1:1 light / 5.9:1 dark; button label on the darkened accent 4.6:1 light, 8.1:1 dark.

**Flagged as mine.** The 90-character note cap, the suppressed focus ring, the reserved button width, the session-lived done state, the shortened mobile success line, and the rule that this design takes the footer's whole accent budget.

---

## 5 · Contrast Band

The whole footer on one contrast ground — brand, columns and legal together, no second tier. Ground is not a control: it is the design.

**Descriptor.** The same grid as A3·2 with the inverted ground as the design rather than as a setting — no Ground picker, one step more padding, and a four-column cap, which is what makes it a separate design instead of a control value.

**Structural descriptor.** `grid-of-N · none · contrast · few · none · inverted whole footer`

**Archetype.** grid-of-N

**Behaviour module.** **none.** The four-column cap keeps the ≤ 767 collapse at the open two-across grid, never the accordion, so this design declares nothing at any width — the cap and the absence of a module are the same decision seen twice. Carried opacities, the derived bottom strip, its lift-instead-of-darken rule and the wrapping odd list at 834 are all CSS. With JavaScript off it is identical.

**Items.**

- **Add column** as A3·2 up to four, then disabled **with the reason visible** (Part A·A5): twenty-plus links on an inverted band is a wall. The panel **advises** that A3·8 Sitemap suits more — advice, never a switch (Part A·A8).
- **Add link** as A3·2, 1–8 a column.
- **Remove.** Active at every count, as A3·2. At two, the click states the floor under the list: “Two is the fewest this design draws.”
- **Reorder.** Drawn order, left to right. At 834 an odd third list becomes a wrapping row and keeps its authored position rather than being moved to the end.
- **Counts.** 2–4 columns, 1–8 links. Designed for three or four; two leaves the right quarter empty as A3·2 does, and the band's padding does not change to compensate.
- **Zero.** The band holds the brand block and the legal line and keeps its full padding — a band is a band at any content length.
- **Inside an item.** As A3·2. Nothing about an item changes on contrast: the carried 72% for links is the section's value, written once and read by every one of them, and there is no per-column opacity.

**Content fields.** As A3·2, with `linkColumns[]` capped at 4. A logo image with a light background is the one content case this design cannot carry: the sidebar asks for a light-ground version and falls back to the initial square until one is supplied.

**Controls.**

| Control | Values |
|---|---|
| Columns | Auto · Two · Three · Four |
| Brand block | Lockup and tagline · Lockup only |
| Legal line | In the band · Own strip |
| Social display | Glyphs · Labels · Short labels · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal: Vertical spacing resolves 44 · 64 · 88 — one step larger than the light-ground designs at every value; Top divider None (the ground change is the edge). **Background role is locked at Contrast with the reason shown** — the inverted ground is this design's identity; unlock it and it is A3·2 on a setting. Legal layout drawn at the split value: © and the credit left, Privacy and Terms right, in the band and on the strip alike. Carried values are fixed: full strength for headings and wordmark, 72% for links, tagline and legal (70% in dark), 15% for hairlines, 60% on the derived bottom strip. The strip is the contrast token darkened one step; packs whose contrast is already near-black get a 6% lift instead.

**Data.** As A3·2.

**Responsive.** 1440–1081: brand block 340 px, columns 1fr. 1080–768: two-across with the brand block spanning; an odd third list takes the full remaining width and lays its links out as a wrapping row rather than a stub column — the one place in the category where a list changes direction at a width. ≤ 767: two-across as A3·2, legal left-aligned rather than centred, band full-bleed with no radius and no hairline. **Five to seven columns are not offered** — the stepper is capped at four with the reason visible, and the panel advises A3·8 Sitemap for more (Part A·A5, A·A8).

**Empty state.** No columns → the band holds the brand block and legal line and keeps its padding. No social → row and gap removed.

**Accessibility.** Structure identical to A3·2. Hover and focus use the pack's lightest surface, never accent. No `color-scheme` switch inside the band — a band that flipped the UA's form colours would break any field a later design puts on it. Paper light: headings and wordmark 13.9:1, links at 72% 7.6:1. Paper dark: headings 13.2:1, links at 70% 7.1:1. Focus ring 13.9:1 / 13.2:1.

**Flagged as mine.** The one-step-larger padding, the four-column cap and its advice line, the derived strip and its lift-instead-of-darken rule, the wrapping odd list at 834, and the light-logo requirement.

---

## 6 · Centred Stack

One centred column on a fixed measure: lockup, tagline, one wrapping row of links, social, legal. No columns and no grid.

**Descriptor.** The only footer with no grid at all — one centred column on a fixed measure, with the authored columns flattened into a wrapping row of links and their headings kept but never drawn.

**Structural descriptor.** `stack · none · page · many · none · centred fixed measure`

**Archetype.** stack

**Behaviour module.** **none.** Nothing collapses because there is nothing to collapse: the stack order is the same at every width, so no accordion, no threshold and no module. The measure-minus-80 formula is a CSS `min()`. With JavaScript off it is identical.

**Items.** The authored columns are still the list; the row is what the design draws of them.

- **Add link** is the one that matters here, and it lands at the end of the first group — which at Links: two rows is the end of the primary row. **Add column** still exists, because headings are kept for the switch back to A3·2, and a new column's links continue the row rather than starting a second one.
- **Remove.** Any link, any column. Removing the first group's last link promotes the second group to primary, and the two type sizes — 15 px / 500 in `text` and 14 px muted — move with it.
- **Reorder.** Consequential rather than decorative: authored order is row order, and **the first group is the primary row**. Dragging a group to first changes which links are drawn at 15 px and which at 14 px, which is the design's only emphasis mechanism and is a section rule, not a per-item one.
- **Counts.** 12 links across all groups; a thirteenth is refused with A3·2 named. 1–8 a group as everywhere. Designed for six to twelve at one row and eight to twelve at two.
- **Zero.** No links → lockup, tagline, social and legal, each element that leaves taking its gap. The floor is lockup, hairline and legal at 148 px, which is also a brand-new site.
- **Inside an item.** Label and URL. **The group heading is editable and not drawn** — at Links: two rows it becomes the visually-hidden list heading; left empty, that list is unlabelled rather than labelled with nothing.

**Content fields.** `wordmark` · `mark` · `tagline` · `linkColumns[]` read as rows, flattened in authored order, 12 links maximum across all groups · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. Group headings are kept but not drawn; at Links: two rows they become the visually-hidden list headings.

**Controls.**

| Control | Values |
|---|---|
| Measure | Narrow 560 · Medium 640 · Wide 760 |
| Links | One row · Two rows · Off |
| Social display | Glyphs · Labels · Short labels · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal: Background role; Vertical spacing resolving 44 · 64 · 88; Top divider Line (the measure-wide hairline above the legal group stays the design's own). **Legal layout is locked at the stacked variant with the reason shown:** Privacy and Terms on one line, copyright and “Built with Inflozo” on the line beneath them (category items 1 and 4) — a split line inside a centred column would be the only left-and-right thing in the design.

The lockup is one step up from A3·1's — 30 px mark, 22 px wordmark — because at the top of a centred stack it is the only anchor. Link row gaps are 28 px, chosen so two adjacent focus rings never touch. No separators: separators in a centred row read as an equation. The hairline above the legal line is the measure's width, not full-bleed.

**Links: two rows.** Above eight links the row splits by content, not by wrapping: the first authored group becomes a primary row at 15 px / 500 in `text`, everything after it a secondary row at 14 px muted.

**Data.** As A3·2. A thirteenth link is refused and A3·2 named.

**Responsive.** Measure is the lesser of its named value and the container minus 80 (minus 40 at ≤ 767) — 600 px at 834, where the row gap tightens to 26. Stack order never changes at any width; this design has no collapse to specify. ≤ 767: links gain vertical padding for 44 px targets (row gap 4, column gap 20), glyphs 34 → 44 px, hairline the full measure. 344 px tall.

**Empty state.** Every element that leaves takes its gap. The floor is lockup, hairline, legal at 148 px — which is also a brand-new site before anything is authored, and why it has to be composed rather than merely legal.

**Accessibility.** One `<nav aria-label="Footer">` with a single list; at two rows, two lists with visually-hidden headings from the authored group names. The 22 px wordmark is not a heading. Desktop links get 8 px of vertical padding inside the 28 px gap for a 31 px mouse target; 44 px at ≤ 767.

**Flagged as mine.** The 12-link cap, the two-row split rule and its two type sizes, the measure-minus-80 formula, the 28 px gap, and the measure-wide hairline.

---

## 7 · Big Type

The site's name set large enough to be the last thing on the page, with links and legal kept small above it. The category's one display moment. The mark is dropped by construction — a 26 px square beside 128 px letters is a mistake at every size.

**Descriptor.** The only footer whose subject is the site's own name at display scale, and the only one that drops the mark and the tagline by construction rather than by a control.

**Structural descriptor.** `stack · none · page · one · none · name at display scale`

**Archetype.** stack

**Behaviour module.** **none at the drawn setting.** Fill width is a CSS clamp on the container — `clamp(72px, …cqw, 200px)` — which is why it survives text zoom and needs no script; the Name scale control's “measured at build” resolves to that clamp rather than to a measurement. *Flagged: reading it as a clamp is this pass's inference, and it is listed as a finding.* At **Links: Columns above** with five to seven authored, the category's ≤ 767 rule applies and the design declares `accordion` — edit-safe, **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all.” At Links: Row above, the drawn default, and at Off, it declares nothing. **Declared width: “collapses into sections under 768, at Links: Columns above”** — the setting is named inside the declaration because the module is conditional on it, and at Row above and at Off no width is declared, since nothing runs on either side of one. **JS off at 768 and above:** the name is a CSS clamp, so it still fits and still zooms, and the links draw as an open row or as open columns above it. **JS off below 768:** at Row above the row wraps and nothing runs; at Columns above with five to seven authored the groups are native `<details>`, first server-open, every link reachable, only the 160 ms height transition lost. The name is Fill width at this width whatever the control says — the clamp, not script.

**Items.** The name is Ghost's site title and is not an item. The list is the shared one, read as a row or as columns.

- **Add, remove, reorder** as A3·2 at Columns above; at Row above the links flatten as A3·6's row does and Add link appends to it.
- **Counts.** 1–7 columns at Columns above, 1–8 links; twelve links in the row at Row above, as A3·6. Designed for a short row — four to six — because everything above the name is meant to be subordinate to it.
- **Zero.** No links → the name and one legal line with nothing between them, 192 px at 390. **The name is never dropped**, and no site title means no design.
- **Inside an item.** Label and URL. The heading is drawn only at Columns above and is kept, not drawn, at Row above.

**Content fields.** `wordmark` (req — the whole design) · `linkColumns[]` (one row, or columns above at that setting) · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. `mark` and `tagline` are kept, never drawn.

**Controls.**

| Control | Values |
|---|---|
| Name scale | Large 96 · Huge 128 · Fill width (measured at build, clamped 72–200) |
| Ink | Full · Soft · Faint |
| Offset | None · Sunken · Cropped |
| Links | Row above · Columns above · Off |
| Social display | Glyphs · Labels · Short labels · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal: Background role; Vertical spacing resolving 32 · 48 · 72 top (the bottom stays the type's optical inset, 26 px at Huge); Top divider Line. **Ink is opacity by name** — Full 100%, Soft 55%, Faint 24% — and **Faint keeps a stated visual floor**: never below 12% effective against the ground, and under forced colours the name renders solid; the name is `aria-hidden` decoration, so Ink is a visual choice, not a contrast question, and the small type above it never inherits it. **Offset:** None (baseline 26 px above the page's bottom edge, as drawn) · Sunken (the baseline drops to the page edge and the descenders crop) · Cropped (the name sinks to its cap-height midline; the bottom third crops). At Sunken and Cropped the optical inset rule is replaced by the crop; text zoom recomputes the clamp first, so nothing ever overflows horizontally. Legal layout drawn at the split value — Privacy and Terms right.

Type: the pack's heading font, −0.045em at Huge, line-height 0.84, descender allowance pulled back so the baseline sits 26 px above the page's bottom edge. Dark tightens tracking to −0.043em — light type on a deep ground looks about 2% wider at this size, and this is the category's only optical correction. Above one line, leading opens to 0.9.

**Data.** The name is Ghost's site title. No site title → no design.

**Responsive.** Below 1080 the scale steps one named value down (Huge → Large) and Fill width recomputes against the new measure — the letters are never squeezed. ≤ 767 the scale is always Fill width whatever the control says, and the control's value is remembered and returns above the breakpoint; a twelve-character name fills the 350 px measure on **one line at 64 px** — at the measured 0.442 em advance that is 339 px of ink, where 66 px would sit exactly on the measure and break at the space. The single line and the larger type are what the rule takes when the floor allows it. **Fill width sizes the name to span its measure on as few lines as the floor allows.** A name too long for one line shrinks until it fits two, and **a name too long for two at the floor takes a third rather than going below it** (owner's ruling this pass) — smaller type, the whole name, no cut and no switch to another design (Part A·A8). **The floor is 44 px at every width.** Measured on this design's own drawn names with `Range.getClientRects`, **a character costs 0.44 em** including the tracking, consistent at 76, 96, 128 and 158 px. That puts two lines at the floor near **134 characters** on the 1296 px measure and near **36** on a phone's 350 — a bound at both widths rather than one a publication name meets. **The second line arrives past about 67 characters on the desktop measure; the floor itself only past about 134** ⚑.

**Empty state.** Floor is one legal line and the name, 192 px at 390. The name is never dropped.

**Accessibility.** The name is an `aria-hidden` `<p>`, not a heading and not a link: the header's lockup has already announced the site title, and repeating it as an `h2` on every page adds an outline entry that says nothing new. **Flagged** — a real heading is defensible and I chose against it. The home link, when the theme adds one, is the link row's first item. Fill width recomputes under text zoom, so the name never overflows horizontally. Name 12.1:1 / 11.8:1.

**Flagged as mine.** The 44–200 clamp, the dropped mark and tagline, the un-linked name, the `aria-hidden` decision, the dark tracking correction, the descender inset, the 44 px floor, the measured 0.44 em advance the character figures rest on, and the shrink-then-add-a-line rule ⚑, and this pass's Ink percentages and both crop geometries — the control names and value words are the owner's.

---

## 8 · Sitemap

Five to seven columns, every route, at the category's smallest link size. The only design above four columns, and the only Density control. A3·5 and A3·12 **advise** it when their own caps are reached; neither hands off to it (Part A·A8).

**Descriptor.** The only design above four columns, drawn at the category's smallest link size, and the only one with a Density control — which is the control the extra columns pay for.

**Structural descriptor.** `grid-of-N · none · page · many · none · column density control`

**Archetype.** grid-of-N

**Behaviour module.** `accordion` at ≤ 767, always — five to seven groups is this design's floor, so unlike A3·2 the module is not conditional. Edit-safe. **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute.” First group open is that attribute; the counts are static text and `aria-hidden`; the three-across tablet rule and both Density values are CSS. The `<button aria-expanded aria-controls>` in the accessibility field disagrees with `<details>`/`<summary>` — the same correction A3·2 owes, and it matters most here because this is the design that is always an accordion on a phone. *Finding.* **Declared width: “collapses into sections under 768”, unconditional** — unlike A3·2 the declaration carries no column-count clause, because five to seven groups is this design's floor and the width alone decides. **JS off at 768 and above:** no accordion exists — five to seven columns across at 1440, three-across in authored order at 1080, every heading and every link open and server-rendered, both Density values CSS. **JS off below 768:** native `<details>` throughout, first group server-open, 48 px rows on hairlines, counts static and `aria-hidden`, links back up to 15 px, Density not applied; every link is reachable and only the 160 ms height transition is lost.

**Items.**

- **Add column** lands last; disabled at seven with settlement 1's wording. This is the design the seven-column cap was written for.
- **Add link** as A3·2, eight a column.
- **Remove.** Below five the grid renders at the authored count and the sidebar recommends A3·2 rather than refusing — the opposite direction to A3·5's hard cap, and deliberate: shrinking a sitemap is ordinary, growing a contrast band is not. **At one column Remove stays active**; the click states the floor under the list: “A sitemap needs at least one column.”
- **Reorder.** Drawn order across the grid and across the 1080 three-across wrap: five give 3 + 2, seven give 3 + 3 + 1, so dragging a column changes which row it lands in as well as its position. At ≤ 767 it is accordion order, first group open.
- **Counts.** 5–7 designed, 1–7 possible, 1–8 links. **Density is a section value and applies to every column at once**; there is no per-column density, and a design that needed one would be two designs.
- **Zero.** A group with no links is not drawn and its heading goes with it. No groups at all → the grid is absent and the brand block sits alone above the legal row, still this design (Part A·A8).
- **Inside an item.** Heading and links. **A group generated from Ghost's tags — or, this pass, from Ghost's authors ranked by post count — is one item whose links are not editable:** the sidebar shows the count it will render and points at what owns them, rather than offering rows that would be overwritten on the next publish.

**Content fields.** `wordmark` · `mark` · `linkColumns[]` (5–7 here; 2–4 makes the editor recommend A3·2, it does not refuse) · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. `tagline` and `description` are kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Columns | Auto · Five · Six · Seven |
| Density | Comfortable (9 px link rhythm, 32 px row gap) · Compact (6 px, 24 px) |
| Social | In legal row · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal: Vertical spacing resolves 36 · 52 · 72; Top divider Line; Background role Background · Surface with **Contrast disabled above four columns, ratio and reason shown** — 28 links at 14 px on an inverted band is a wall.

Density changes spacing only; type sizes hold, because 13 px is the floor for a tracked heading and 14 px for a link. The lockup takes its own row above the grid so every column is the same width; gutters 28 px; the social row sits in the legal line at 30 px so it does not read as an extra column. 6 px is the rhythm floor — below it two adjacent focus rings touch.

**Data.** Lists are authored; a group may be generated from Ghost's **tags**, or — new this pass, at parity — from Ghost's **authors, ranked by post count**. A generated group is one item whose links are not editable: read-only rows, the count it will render, and a line pointing at what owns them (the tag, or the author list). Ghost-sourced rows never show an Add. Eight links per column as A3·2; a generated group longer than eight renders its first eight and says so.

**Responsive.** 1440–1081: five to seven columns across. 1080–768: **three-across in authored order** — this design's own rule, not A3·2's two-across, because six lists in two columns is three screens of the same information. Five give 3 + 2, seven give 3 + 3 + 1. ≤ 767: accordions, 48 px rows, count at the right, first group open, links back up to 15 px; Density does not apply, since the constraint is the finger.

**Empty state.** A group with no links is not drawn and its heading goes with it. Fewer than five groups → the grid renders at the authored count and the sidebar recommends A3·2.

**Accessibility.** Headings are `<h2>` at every width and hold the accordion `<button aria-expanded aria-controls>` at ≤ 767, so the outline does not change with a tap. Closed groups are `hidden`, not clipped. Counts are `aria-hidden` — the list announces its own length. The whole row is the button. Opening is a 160 ms height transition, suppressed under reduced-motion with the scroll position held. 14 px links 5.4:1 / 6.4:1.

**Flagged as mine.** The 14 px link floor, both Density values, the three-across tablet rule, the disabled contrast ground above four columns, the 30 px glyphs in the legal row, and the lockup on its own row.

---

## 9 · Latest Posts

The three most recent posts beside one link column. The only design whose content changes without anyone editing it, and the only one carrying imagery.

**Descriptor.** The only footer whose main content changes without anyone editing it, and the only one whose repeating unit carries an image.

**Structural descriptor.** `feed · none · page · few · top · posts beside one column`

**Archetype.** feed

**Behaviour module.** **none.** Ghost renders the posts server-side; the 1.02 scale and the 4% darkening are CSS transitions on hover, `loading="lazy"` is an attribute, and the no-image panel is a template branch. **Neither `load-more` nor `infinite-scroll` applies** — the count is two to four and there is no next page to fetch — and `shuffle` is not it either, since Which posts is a query, not a re-roll. With JavaScript off the block is identical, images and all.

**Items.** Two lists, and **the posts are not one of them.**

- **The posts have no Add and no Remove.** They come from Ghost; How many posts and Which posts are the controls; a tag or collection holding fewer than the count renders what exists, down to two. **No reordering** — the order is Ghost's, newest first, and there is no pinning. The sidebar says this in the posts group rather than leaving an author hunting for a button that is not there.
- **The link column** is the authored list, and this design draws one group: the first. Add column adds a group that is kept and not drawn, with the sidebar naming which one is drawn. Add link, remove and reorder work inside it as A3·2.
- **Counts.** One group drawn, 1–8 links; 2–4 posts; 0–6 social. At Links: Row under the same group flattens into a row.
- **Zero.** No links → the posts take the whole measure and the lockup sits beside them. **Fewer than two published posts** → the block is removed, the design renders as A3·2 with the tagline in the posts' place, and the sidebar says “Fewer than two published posts — showing links only.”
- **Inside an item.** Link: label and URL. **A post is not editable here at all** — title, feature image, primary tag and date are the post's own, edited where the post is; selecting one on the canvas opens the post rather than offering fields. That is also why Post style is a section control: it applies to all of them, and “this one without an image” is the data's business, not a setting.

**Content fields.** `postsHeading` (opt, ≤ 20, default “Latest”) · `postsSource` · `postsCount` (2–4) · plus `wordmark`, `mark`, `tagline`, `linkColumns[]` (one group drawn, further groups kept), `social[]`, `copyright`, `legalLinks[]`, `showAttribution`.

**Controls.**

| Control | Values |
|---|---|
| How many posts | **Number picker, 2–4** (Part A·A5), capped by the design with the reason visible |
| Post style | With image · Title and date · Title only |
| Which posts | Latest · Featured · By tag · By author · Hand-picked — the Data group's Filter, P0·5's full set |
| Links | One column · Row under · Off |

Universal: Background role; Vertical spacing resolving 36 · 52 · 72; Top divider Line. Legal layout drawn at the split value — Privacy and Terms right. **The posts controls are the P0·5 Populate-from panel wearing this design's caps:** By tag and By author reveal a single-pick select (name + post count); **Hand-picked** is the search-and-pick list — drag reorders, × unpicks, Count and Order hide because the picked list is both; an unpublished pick drops out server-side and its row stays with an “Unpublished” note. **“A collection” is retired** — collections are route vocabulary, not section vocabulary (P0·5's constraint); recorded in the Reconciliation notes.

Posts take the measure and links a fixed 260 px at the right — the reverse of A3·2, because here the content is the offer and the navigation is the aside. Titles 17 px in the heading font, two lines maximum with the full title in the DOM; meta is the category's 13 px “tag · date” row from A1·6. Images at the pack's radius, 3:2, with a 1.02 scale and 4% darkening on hover — the only image motion in the category.

**Data.** Title, feature image, primary tag and published date from Ghost; the source vocabulary is P0·5's — Latest · Featured · By tag · By author · Hand-picked. Drafts, scheduled posts and pages excluded. Members-only posts appear with no lock or badge: the footer is not the place to sell. Posts are Ghost-owned everywhere they show: clicking one in the editor says “Edit in Ghost”, never offers fields.

**Empty and partial data.** **No feature image on a post** → a hover-surface panel of the same height carrying the title at 15 px, clipped at three lines; the title then appears twice, which is deliberate — a hole in the row, a stock texture and three unequal heights are all worse. **Fewer than two published posts** → the block is removed, the design renders as A3·2 with the tagline in the posts' place, and the sidebar says “Fewer than two published posts — showing links only.” A tag or collection with fewer posts than the count renders what exists, down to two.

**Responsive.** 1440–1081: posts on the measure, one link column right. 1080–768: links leave the column and become a wrapping row under the posts with the lockup beside them; posts hold three across; titles 17 → 16 px. ≤ 767: posts become a divided list with a 72 × 54 thumbnail at the left, rows 78 px, the whole row the link; links two-across.

**Accessibility.** The block is a section labelled by a real `<h2>`, **not** a `<nav>` — it is content, and marking a feed as navigation makes the landmark list useless. Images `alt=""` with explicit dimensions and `loading="lazy"`. One link per post named by its title. Date in `<time datetime>`. The tag is plain text, never a nested link. Hover motion suppressed under reduced-motion; the underline stays. Titles 12.1:1 / 11.8:1; the focus ring wraps the whole card at 4.85:1, above the 3:1 non-text floor.

**Flagged as mine.** The two-post floor and its fall-back, the no-image panel and its duplicated title, the 3:2 crop, the 72 × 54 mobile thumbnail, the 1.02 hover scale, the absence of a members-only badge, and moving attribution to the shared group.

---

## 10 · Contact Block

A postal address, an email, a phone number and reply hours as a labelled block beside the link columns. The only design carrying the contact fields, and the only one whose content may be legally required.

**Descriptor.** The only footer carrying post, email, phone and reply hours as a labelled block, and the only one whose content may be legally required of the site.

**Structural descriptor.** `grid-of-N · none · page · few · none · labelled detail pairs`

**Archetype.** grid-of-N

**Behaviour module.** **none.** `mailto:` and `tel:` are hrefs; the two-by-two field grid at 1080 and the one-line address at ≤ 767 are CSS; two columns never reach the accordion threshold, so no module at any width. **`form` is the archetype A16 owns, not this one** — there is no field here to submit. With JavaScript off it is identical, which for the one design that may carry a legal imprint is the point.

**Items.** One authored list and one fixed block.

- **The contact block is not a repeater.** Four fields in a fixed order — post, email, phone, replies — with no Add, no Remove and no reorder, which is what the fixed order means: Details chooses how many of the four are drawn and never which order they come in. A site needing a fifth detail does not get a fifth row; that is A16 Contact.
- **Add, remove, reorder columns** as A3·2, two drawn.
- **Counts.** 2 columns drawn (Columns: Auto · Two · Off), 1–8 links. A third authored column is kept, counted and not drawn — the two fixed 300 px blocks take the left half and there is no room for it.
- **Zero.** No columns → the brand block and the contact block sit together at the left and the measure's right half stays empty. All four contact fields empty → block and heading removed, the brand block keeps its 300 px and the links flex beside it, still this design (Part A·A8).
- **Inside an item.** Link: label and URL. The contact values are section fields rather than items: each may be left empty and takes its 12 px label with it, and the heading is kept even for a single field — with it, a labelled group; without it, a stray address in a footer.

**Content fields.** `contactHeading` (opt, ≤ 24, default “Get in touch”) · `address` (multi-line, opt, ≤ 120) · `email` (opt) · `phone` (opt) · `hours` (opt, ≤ 40) · plus `wordmark`, `mark`, `tagline`, `linkColumns[]` (2 drawn), `social[]`, `copyright`, `legalLinks[]`, `showAttribution`. **Field order is fixed** — post, email, phone, replies — and is not a control: a contact block whose order varies by site is one nobody can scan.

**Controls.**

| Control | Values |
|---|---|
| Details | All four · Address and email · Email only |
| Columns | Auto · Two · Off |
| Social display | Glyphs · Labels · Short labels · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal: Background role; Vertical spacing resolving 36 · 52 · 72; Top divider Line.

Labels 12 px muted, values 15 px in `text` — an address you cannot read is worse than no address. The block is a fixed 300 px beside the brand block's 300, so the two fixed columns sit together at the left and the link columns flex.

**Data.** None of the contact fields exist in Ghost's settings, so all four are section content. **Flagged:** a site with several footers keeps them in step by hand; a site-wide contact record is not something Ghost gives us. Email becomes a `mailto:` link and phone a `tel:` link automatically.

**Responsive.** 1440–1081: brand 300, contact 300, links flexing. 1080–768: two-across, and the contact block becomes a two-by-two field grid so it matches the brand block's height. ≤ 767: contact comes second, above the links — someone opening a footer on a phone is more often looking for a way to get in touch than for the archive — and the address renders as one comma-separated line, saving 44 px. Email and phone get 44 px targets.

**Empty state.** Each missing field takes its label. All four empty → block and heading removed, the brand block keeps its 300 px and the links flex beside it, still this design (Part A·A8). The heading is kept even for a single field: with it, a labelled group; without it, a stray address in a footer.

**Accessibility.** `<address>` inside a section labelled by its visible `<h2>`, italics reset. Labels and values are a `<dl>`. Link text is the address itself, never “email us”. The phone number keeps its spaces visually and is unspaced in the `href`. The 12 px labels are the category's one type-floor exception, allowed because each `<dt>` names a 15 px value directly under it; 5.4:1 / 6.4:1, and set at 400 in dark rather than 500. **Flagged as a gap:** no jurisdiction's imprint rule is encoded — the field exists, what a country requires in it is the site owner's to know.

**Flagged as mine.** The 12 px labels, the fixed field order, the permanent 20% underline on the two links, the mobile address collapse, contact before links at ≤ 767, and the absence of an imprint rule.

---

## 11 · Colophon

A short paragraph about the publication, set as reading text, with the credits beneath or beside it as labelled pairs. The only footer whose main content is prose.

**Descriptor.** The only footer whose main content is prose, and the only one with a required rich-text field — without the paragraph there is no design.

**Structural descriptor.** `article body · none · page · variable · none · prose measure plus credits`

**Archetype.** article body

**Behaviour module.** **none.** Prose, credits and the borrowed link row are server-rendered; the measure is a fixed width and the 1080 move of the credits is a media query. **`toc` is the module a long paragraph might suggest and it is not declared** — a colophon is one or two paragraphs of reading text, not an article with headings. With JavaScript off it is identical.

**Items.** The category's third list — `credits[]` — plus, this pass, `creditsGroups[]` and the flattened link row.

- **Add credit** at the end of the credits list; a new row arrives as label “Editor”, value “Add a name”, lands last, and opens the value for typing. Rows are drawn in authored order on their hairlines, so drag is the way to change it and order is meaningful.
- **Remove credit.** Any row. At zero, Credits resolves to none: the prose keeps its measure and the right third stays empty — the same result as Credits: Hidden, reached from the list rather than from the control.
- **Counts.** 0–6 credit rows; Add is disabled at six with “Six rows is the most the masthead holds.” Both arrangements assume six or fewer — Beside at 1440, two columns of rows at 1080.
- **The link row** is A3·6's, borrowed whole: Add link appends to it, group headings are kept and never drawn, 1–8 a group.
- **Zero.** No `description` → **the design does not render** and the sidebar offers A3·6. No credits → as above. No links → the row and its gap go and the prose sits directly above the credits.
- **Inside an item.** Credit: `label` (≤ 16) and `value` (≤ 40, optionally a link). **A row whose value is empty is not drawn** — a label with nothing after it reads as a missing name rather than as a blank — and the label column stays locked at 104 px whatever the rows hold. Link: label and URL. The paragraph's own inline links are the prose's, capped at two, and are edited in the text.

**Content fields.** `description` (rich text, **required here** — one or two paragraphs, up to two inline links each, no length cap) · `credits[]` (0–6 rows of label ≤ 16 + value ≤ 40; a value may be a link) · `creditsGroups[]` (0–2 additional masthead columns, each `heading` ≤ 20 + rows of the same label + value(link) shape, 0–6 rows a group — a new group arrives as heading “Contributors” with one placeholder row; the P0·3 repeater at both levels) · `creditsHeading` (opt, ≤ 20, default “Masthead”) · plus `wordmark`, `mark`, `linkColumns[]` (read as one row), `social[]`, `copyright`, `legalLinks[]`, `showAttribution`. `tagline` is kept, not drawn.

**Controls.**

| Control | Values |
|---|---|
| Prose measure | Narrow 480 · Medium 600 · Wide 720 |
| Credits | Beside · Under · Hidden |
| Links | Row · Off |
| Links source | Authored · From Ghost secondary nav (prefixes) |

Universal: Background role; Vertical spacing resolving 40 · 56 · 80; Top divider Line. Legal layout drawn at the split value — Privacy and Terms right. **Links source binds the six flattened links to Ghost secondary navigation** (category item 5): bound, they become read-only rows — “Edit navigation in Ghost”, no Add — under the same **ARCHITECT: `nav-transform`** declaration and owner ruling as A3·2. **Everything under the masthead is editable inline** with the P0·1 toolbar — the prose, the credits heading, every credit label and value; a value that is a link edits through the Link popover.

Prose is 17 px in the heading font on a fixed measure — about 72 characters a line at Medium, which is why the measure is fixed rather than flexing. Credits are label-and-value rows on hairlines with the label column locked at 104 px. Inline links carry a 30% underline at rest, full on hover, in `text` colour — a muted word inside a paragraph reads as a typo. The link row is A3·6's, borrowed.

**Data.** The paragraph may be seeded from Ghost's site description, which is one short line, and the editor says so rather than pretending a meta description is a colophon. Credits are section content — **invented**, Ghost has no field.

**Responsive.** 1440–1081: prose on its measure, credits beside at 1fr. 1080–768: credits move under the prose as two columns of rows, label column 104 → 84 px; the prose keeps its measure. ≤ 767: prose 17 → 16 px with leading 1.65 → 1.7, credits one column. The link row sits between prose and credits at every width.

**Empty state.** No `description` → the design does not render and the sidebar offers A3·6. Credits hidden or none → the prose keeps its measure and the right third stays empty.

**Accessibility.** The paragraph has no heading — it introduces itself in its first four words. Credits are a `<dl>` under a real `<h2>`; the hairlines are row borders, not `<hr>`s. Reading text follows the body rules: `text-wrap: pretty`, no justification, no hyphenation, reflows at any zoom, no character cap. The ugly test here is a 600-word paragraph, and the answer is that it renders in full and the footer gets tall, which is the site's choice. Prose 12.1:1 light; in dark it is `#E8E2D7` at 10.9:1, stepped back deliberately from 11.8:1 to reduce glare, with leading opened to 1.7.

**Flagged as mine.** The required paragraph, the two-link-per-paragraph cap, six credit rows, the 104 px label column, the dark prose colour and leading, no length cap, and the unlinked ISSN row.

---

## 12 · Card

The footer as a panel inset from the page's edges, with the page ground visible around it. The only footer that does not touch the window.

**Descriptor.** The only footer that does not touch the window — a panel inset on three sides with the page ground visible around it, and the only one carrying a shadow at rest.

**Structural descriptor.** `grid-of-N · card · surface · few · none · panel inset from edges`

**Archetype.** grid-of-N

**Behaviour module.** **none.** Inset, radius, hairline and the dropped shadow in dark are CSS; the four-column cap keeps the ≤ 767 collapse at the open two-across grid, so no accordion; **Card at 390: Full bleed is a control value, not a behaviour.** With JavaScript off it is identical — and under forced colours the shadow goes and the always-drawn hairline is what remains.

**Items.**

- **Add column** to four, then disabled with A3·8 named. Five or more is refused here rather than re-arranged: a four-across wrapping grid inside a card is a card with a grid in it.
- **Add link** as A3·2, 1–8 a column.
- **Remove.** Active at every count. At two, the click states the floor under the list: “Two is the fewest this design draws.”
- **Reorder.** Drawn order, left to right; the inset changes nothing about it.
- **Counts.** 2–4 columns, 1–8 links. Designed for three — the card's padding is 48 px at Comfortable and three columns is what sits inside it without the gutters tightening.
- **Zero.** The card holds the brand block and the legal line and keeps its shape, its padding and its inset. **It does not shrink to fit**: a narrow card in a wide page reads as a broken component.
- **Inside an item.** As A3·2. The card's padding, radius and hairline are the section's and apply to every column at once; there is no per-column plane inside the card, and a design that wanted one would be A3·2 with cards as items — two designs, not a control.

**Content fields.** Identical to A3·2, with `linkColumns[]` capped at 4 — five or more is refused and A3·8 named.

**Controls.**

| Control | Values |
|---|---|
| Card padding | Compact 32 · Comfortable 48 · Spacious 64 — the card's own ladder, kept under its own name |
| Inset | Snug 16 · Comfortable 40 · Wide 72 — left, right and bottom; always 0 at the top |
| Card ground | Surface · Contrast |
| Columns | Auto · Two · Three |
| Card at 390 | Keep the card · Full bleed |

Universal: Background role is the page ground **around** the card — the card's own plane stays Card ground; Vertical spacing governs the section box the card sits in; Top divider None — the gap is the separator, as the top-edge rule says.

Depth: pack radius, one hairline, md shadow in light; in dark the shadow is dropped and the raised surface plus hairline carry it. At Wide the card's left edge meets the page's 72 px text margin; at Snug it reads as a raised band. Radius stays the pack's token at every inset — the card never becomes a pill. No hover and no lift on the card itself.

**Data.** As A3·2.

**Responsive.** 1440–1081: inset and padding at their named values. 1080–768: the inset steps one value down and the card's padding goes 48 → 32, so the ratio of frame to content holds; columns two-across. ≤ 767: inset 12, padding 20 — 32 px from the phone's edge to the first word, within a pixel of every other design — or full bleed if that is the control's value, in which case radius, shadow and inset go and a hairline appears above.

**Empty state.** No columns → the card holds the brand block and legal line and keeps its shape. It does not shrink to fit: a narrow card in a wide page reads as a broken component.

**Accessibility.** The card **is** the `contentinfo`; the inset is padding on its wrapper, not a second landmark. No `role`, no `tabindex`, never focusable or clickable as a whole — a footer that is one big clickable panel is a trap, and a card shape invites the mistake. Under forced colours the shadow disappears and the hairline remains, which is why the hairline is always drawn. Links on the card 5.1:1 / 6.1:1; the card's edge against the page ground is 1.4:1 and decorative — nothing is communicated by the edge alone.

**Flagged as mine.** The three inset values and the zero top, the paired padding step at 1080, the 12 px mobile inset, the existence of the Card at 390 control, the dropped shadow in dark, and the four-column cap.

---

## 13 · Tags

The site's subjects as chips, from Ghost's own tags. The only design whose main content the user does not type, and where the chip is established for the library.

**Descriptor.** The only footer whose main content comes from Ghost's own tags rather than from typing, and the design where the chip's geometry is set for the library.

**Structural descriptor.** `nav · none · page · many · none · chips from Ghost tags`

**Archetype.** nav

**Behaviour module.** **none.** Chips, counts, order and the overflow link are all server-rendered; hover and focus are CSS; the eight-chip override at ≤ 767 is a media query over a server-rendered list. **`filter-strip` is the closest module in the registry and is deliberately not declared:** these chips are links to tag archives, not filters over a set on this page — and the registry's own note that filters “work perfectly” without JavaScript is true here for the simpler reason that they were never anything but links. With JavaScript off it is identical.

**Items.** `tagsList[]` — a picker rather than an authored list — plus one link column.

- **Add tag** exists only at Order: A list you choose, and it opens Ghost's tag list rather than a text field: a chip is a real tag or it is nothing, so there is no placeholder content to invent. New picks land at the end of the list. At the other three orders there is no Add at all, because the order *is* the rule.
- **Remove tag.** Any chip. Below three the block is removed and the design renders as A3·2, stated in the sidebar.
- **Reorder.** Meaningful at A list you choose only, where drag sets row order. At Most posts first, A to Z and Ghost's own order the sort owns it and drag is not offered — an inert drag handle is worse than none. The current chip is never re-sorted to the front.
- **Counts.** How many tags is 8 · 12 · 16 and caps the list; a chosen list longer than the count renders the first N and the sidebar says which. Three is the floor and it renders three chips without padding the row. At ≤ 767 eight regardless of the control, the overflow link taking the rest.
- **Zero.** Fewer than three tags with published posts → block removed, design renders as A3·2. Counts off is a young site's setting, not an empty state.
- **Inside an item.** **Nothing.** A chip's label is the tag's name, its count is Ghost's, its URL is the tag's archive; renaming in Ghost changes the chip and nothing is authored twice. This is the one item in A3 with no editable content, which is exactly why its Add is a picker.
- **The link column** is authored: one group drawn, 1–8 links, add, remove and reorder as A3·2.

**Content fields.** `tagsHeading` (opt, ≤ 28, default “Browse by subject”) · `tagsOrder` · `tagsCount` (8 · 12 · 16) · `tagsList[]` (only when Order is “A list you choose”) · `showTagCounts` · plus `wordmark`, `mark`, `linkColumns[]` (one group drawn), `social[]`, `copyright`, `legalLinks[]`, `showAttribution`.

**Controls.**

| Control | Values |
|---|---|
| How many tags | Eight · Twelve · Sixteen |
| Order | Most posts first · A to Z · Ghost's own order · A list you choose |
| Post counts | On · Off |
| Links beside | One column · Off |

Universal: Background role; Vertical spacing resolving 36 · 52 · 72; Top divider Line. The tag list is Ghost-sourced (P0·3's Ghost-list rules): no Add except the picker at A list you choose, and a chip's name is never editable here — renaming happens in Ghost.

**The chip, for the library.** Surface fill, one hairline, pack radius, 15 px label in `text`, optional 12 px muted count, padding 7 × 13 for a 35 px box (10 × 14 → 41 px at ≤ 767), gap 8 px — set by the focus ring's offset. Hover fills with the pack's hover surface, 160 ms, no lift. Focus takes the library ring. **Current** takes the contrast ground with `aria-current="page"`. Every chip is the same size regardless of count: a weighted tag cloud is a data visualisation, and a footer is not the place for one.

**Data.** Tags, counts and URLs from Ghost. Internal `#hash` tags excluded. Tags with zero published posts excluded. Renaming a tag in Ghost changes the chip; nothing is authored twice. The overflow is the list's last item, a plain link “All 34 tags” pointing at the tag index, and it is not rendered if the site has no index page.

**Responsive.** 1440–1081: chips on the measure, one link column at 260 px right. 1080–768: the column leaves, chips take the full measure, lockup, links and social become one row beneath. ≤ 767: chips grow to a 41 px box and **the count drops to eight regardless of the control**, with the overflow link taking the rest; the control's value returns above the breakpoint.

**Empty state.** Fewer than three tags with posts → the block is removed and the design renders as A3·2, stated in the sidebar. At three it renders three chips and does not pad the row. Counts off is the setting for a young site, where “64” beside “2” says something the site would rather not lead with.

**Accessibility.** A `<nav>` labelled by its visible `<h2>` holding a `<ul>` — these are links to archives, so unlike A3·9 this genuinely is navigation. One link per chip named by the tag; the count reads as “Essays, 64 posts”. The current chip keeps `aria-current="page"` and stays a link, is never removed from the row and never re-sorted to the front. Chip label 12.6:1 / 11.4:1; count 5.1:1 / 5.9:1; the border is decorative because the fill always differs from the ground.

**Flagged as mine.** The three-tag floor, the eight-chip mobile override, the refusal of size weighting, the overflow-as-link rule, the current-tag treatment, the count wording, and excluding zero-post tags.

---

## 14 · Image Band

One full-bleed photograph closing the page, with the site's name over it and the links in a plain row beneath. The only footer with imagery as its subject, and the design that settles the scrim.

**Descriptor.** The only footer whose subject is a photograph — one full-bleed band closing the page with the site's name over it — and the design that settles the scrim for the library.

**Structural descriptor.** `media frame · none · image · one · full-bleed · scrimmed photograph band`

**Archetype.** media frame

**Behaviour module.** **none at the drawn setting.** Band, crop, scrim gradient and the 34/30/26 px wordmark ladder are CSS; the height is reserved before the image arrives; there is no parallax and no motion at all. **`lightbox` is not declared** — the photograph is decorative and is not a link, and a footer band that opened a full-size image would be inviting a click that goes nowhere. At **Links: Columns** with five to seven authored, the category's ≤ 767 rule applies and the design declares `accordion`, edit-safe, **JS off:** “Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all.” At Links: Row, the drawn default, it declares nothing. **Declared width: “collapses into sections under 768, at Links: Columns”** — the setting is named inside the declaration because the module is conditional on it, and at Links: Row and at Off no width is declared. **JS off at 768 and above:** band, crop and scrim are CSS, the height is reserved before the image arrives, and the links draw open at either setting. **JS off below 768:** the band floors at 180 px; at Links: Row the link row and the social row take their own rows and nothing runs; at Links: Columns with five to seven authored the groups are native `<details>`, first server-open, every link reachable, only the 160 ms height transition lost.

**Items.** **The image is one field, not a list** — one photograph closes the page, and a second would be a gallery, which is A24's.

- **Add, remove, reorder columns** as A3·2 at Links: Columns; at Links: Row the links flatten and Add link appends to the row.
- **Counts.** 1–7 columns at Columns, 1–8 links; the row is capped at twelve as A3·6's is. Designed for a short row under a tall band.
- **Zero.** No links → the band and the legal line, with the lockup below the band at 26 px. **No image** → the band becomes a flat contrast panel at the same height, no scrim, carried text as A3·5, so the composition holds; in the editor, the striped placeholder and “Drop a footer image here”.
- **Inside an item.** Label and URL. `image` and `imageAlt` are section fields: alt may be left empty, and the editor says plainly that a footer photograph usually carries no information — the words over it are what it is for.

**Content fields.** `imageSource` (Uploaded · Site cover, default Site cover) · `image` (opt, 2400 px wide or more, cover, focus from the Image Picker popover) · `imageAlt` (opt, default empty) · `wordmark` · `mark` (used only when Overlay is Nothing) · `tagline` · `linkColumns[]` · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`.

**Controls.**

| Control | Values |
|---|---|
| Band height | Short 160 · Medium 220 · Tall 300 |
| Image source | Uploaded · Site cover image (default) |
| Over the image | Name and tagline · Name only · Nothing |
| Text position | Bottom left · Centred |
| Links | Row · Columns · Off |
| Social | Glyphs · Short labels · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal: Vertical spacing; Top divider None — the photograph is the edge; **Background role is locked with the reason shown** — the image ground is this design's identity. **Image source defaults to `@site.cover_image`**, so the band works before any upload; Uploaded takes the section's own image. **Image focus (Centre · Top · Bottom) sits in the Image Picker popover** — never a hidden field — and applies to whichever source is active.

Height is in pixels, not an aspect ratio, so the band is the same depth on a 1440 page and a 1920 one and the crop widens instead. Wordmark 34 px at 1440, 30 at 834, 26 at ≤ 767. Text sits on the page's own margin at Bottom left.

**The scrim.** One bottom-up gradient in the contrast token: transparent to 55%, stop at 30% (34% at Tall; 26% and 60% at ≤ 767, where the tagline takes two lines). In dark it is the background token, transparent to 45%, stop at 40% — the picture is already darker than the page, so the gradient weakens rather than strengthens. Removed entirely when nothing is over the image. Never a flat overlay, never black. Photographs are never brightened or dimmed by the theme; only the scrim moves.

**Data.** The default binding is `@site.cover_image`; a site with a cover has a working band on day one. Uploaded with no upload, or Site cover on a site without one → the band becomes a flat contrast panel at the same height with no scrim and carried text as A3·5, so the composition holds; the editor shows the striped placeholder with “Drop a footer image here”. Placeholders belong in the editor, not on a published site.

**Responsive.** As the ladder above; at ≤ 767 the band floors at 180 px and the link row and social take their own rows. This is the only design whose scrim varies by width, and it varies because the text's height as a fraction of the band does.

**Empty state.** Overlay: Nothing → the scrim goes with the text (a gradient over an empty picture is a smudge) and the lockup moves below the band at its standard 26 px.

**Accessibility.** The photograph is decorative — `alt=""` — because the words over it say what it is for; the editor offers an alt field and says plainly that a footer photograph usually does not carry information. The scrim is an `aria-hidden` sibling, never a blend mode on the image, so under forced colours it disappears and leaves text on a solid ground. Wordmark and tagline are plain text, not links: a large silent target over an image invites a click that goes nowhere. Explicit dimensions and `loading="lazy"`; the band reserves its height before the image arrives. No motion at all, no parallax. **Flagged:** the scrim guarantees 4.5:1 against the darkest reasonable photograph, not the average one — a floor, not a guarantee, and the one place in A3 where contrast depends on content nobody has seen. Where a site's own image defeats it, the editor flags the band and offers Overlay: Nothing.

**Flagged as mine.** The three heights, the 6.5:1 crop and centre anchor, every scrim value, the 34/30/26 px wordmark ladder, the flat-panel fall-back, and the honest limit above.

---

## 15 · Wrap

Every link in one wrapping block at reading size, no headings and no columns. For a list with twenty links and no hierarchy worth drawing.

**Descriptor.** The only footer that draws every link at reading size in one wrapping field, with no headings and no columns at any width — the design for a list with no hierarchy worth drawing.

**Structural descriptor.** `nav · none · page · variable · none · one wrapping link field`

**Archetype.** nav

**Behaviour module.** **none.** One `<ul>` laid out with flex-wrap and gap, separators as `::after` content, and no collapse to declare — the field reflows at every width and never becomes an accordion, whatever the authored group count. This is the one design with twenty-odd links and no module, which is the argument for it. With JavaScript off it is identical.

**Items.**

- **Add link** appends to the last authored group, which is the end of the field. **Add column** still exists and adds a group that is hidden rather than headed — the grouping is what survives a switch to A3·2, and a screen reader still hears “About, 4 items”.
- **Remove.** Any link; removing a group's last link removes the hidden group with it and the field closes up.
- **Reorder.** Authored order across groups and then within them, so the field reads as one sequence. Dragging changes where a link falls in the wrap; a separator never starts a line and the last item never carries one, whatever the order.
- **Counts.** A number picker to 24 links across all groups, capped with the reason visible and A3·8 **advised** (Part A·A5, A·A8). Fewer than four still draws as this design — the row simply has fewer items. Six with middots is the intended low end and stays composed, which is why pruning from twenty-two to six needs no design change.
- **Zero.** No links → A3·1, and the repeater renders with Add link and a line saying what the footer draws until one exists.
- **Inside an item.** Label and URL. The group heading is editable, never drawn, and becomes the visually-hidden list heading; left empty, that nested list is unlabelled rather than labelled with nothing. **Link size and separator are section values and apply to every link at once** — one link at 20 px among twenty at 15 px is not expressible here, and should not be.

**Content fields.** `wordmark` · `mark` · `linkColumns[]` flattened to one list in authored order, 24 links maximum; group headings kept in the markup as visually-hidden list headings and never drawn · `social[]` · `copyright` · `legalLinks[]` · `showAttribution`. `tagline` and `description` are kept, not drawn: prose above a field of links makes the links look like a consequence of it.

**Controls.**

| Control | Values |
|---|---|
| Link size | Small 15 (gaps 24 / 10) · Medium 17 (32 / 14) · Large 20 (36 / 16) |
| Separator | None · Middot · Slash · Vertical bar · Icon (icon slot) |
| Social | In legal row · Off |
| Icon style | Bare · Outlined box · Filled box |

Universal: Background role; Vertical spacing resolving 40 · 56 · 80; Top divider Line. Separator None leaves the gap to do the work; Middot, Slash and the new Vertical bar tighten the horizontal gap to 14 px so the mark belongs to the pair either side of it, in the border token, the same middot as the legal line. **Icon opens a P0·2 icon slot**: one icon, chosen once, repeated as every separator — drawn at Small in the border token's role, `aria-hidden`, and an empty slot renders as None rather than as a dashed hole on the live site. A separator never wraps onto the start of a line and the last item never carries one, whichever of the five is set. Social sits in the legal row at 30 px.

**Data.** As A3·2. A twenty-fifth link is refused and A3·8 named.

**Responsive.** 1440–768: the block reflows on the measure; gap 32 → 28 at 834, type held. ≤ 767: type steps one value down (17 → 16), horizontal gap 22, and the vertical gap is replaced by 7 px of padding per link for 44 px targets; social moves out of the legal row onto its own row.

**Empty state.** Fewer than four links → the row draws with fewer items and the design stays itself (Part A·A8). Six links with middots is the intended low end and stays composed — this design meets A3·1 there, one step of type size apart, deliberately: a site pruning from twenty-two links to six should not have to switch design.

**Accessibility.** One `<nav aria-label="Footer">` with a real `<ul>`; where the authored content has groups, each is a nested `<ul>` with a visually-hidden heading, so the grouping survives a switch to A3·2 and a screen reader still hears “About, 4 items”. Links are list items laid out with flex-wrap and gap — never space-separated inline text, never `display: contents`. Separators are `::after` content, so nothing reads “middot” twenty-one times and the marks cannot be copied into a pasted link list. A list of 22 unheaded links announces as “list, 22 items”, which is honest — this design is for the case where that is the truth; above 24 the editor recommends A3·8. 17 px muted 5.4:1 / 6.4:1.

**Flagged as mine.** The three size-and-gap pairs, the 24-link cap, the 14 px separator gap, the mobile type step, keeping hidden group headings, and the four-link floor.

---

## 16 · Mini Bar

A slim bar pinned to the bottom of the window while the reader is in the page, released at the page's end into the real footer beneath. The category's only scroll behaviour.

**Descriptor.** The only footer with a scroll behaviour — a slim bar pinned to the window while the reader is in the page, released at the page's end into whichever A3 design sits below it, one element in both states.

**Structural descriptor.** `sticky · none · page · few · none · pinned bar that releases`

**Archetype.** sticky

**Behaviour module.** `slide-in-card` — the registry's closest, and the module whose stated degradation is already this design's written no-JS state. Edit-safe: it does not run while the section is being edited, which is why the primary frame is drawn pinned rather than mid-release. **JS off:** “The card renders statically in the document flow near the page end rather than sliding in.” That is the design's own sentence — opaque, in flow, no shadow, no back to top — and Releases: Never pins is the same result chosen deliberately. **Two disagreements with the registry, both findings.** (1) *The name.* This is a full-width bar, not a card; the alternative, `header-scroll`, has the wrong degradation — “Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent” — because sticky still working would leave the bar pinned past the page's end, which is the one state this design must not have. (2) *Two mechanics fall outside every module's description:* reserving the bar's measured height as the page's bottom padding, recalculated on release, resize and zoom, and unpinning entirely above a quarter of the viewport height. Both are load-bearing rather than decorative. **The released footer's module is `footerBelow`'s, not this design's:** releasing into A3·2 with six columns brings `accordion` with it.

**Items.** No list of its own — the bar is a projection of the footer's content, which is why order matters more here than anywhere in the category.

- **Add, remove, reorder** happen on the shared column list, as A3·2. **The bar draws the first column's first one, three or five links in authored order**, so dragging a link to the top of the first column puts it in the bar, and dragging a column to first replaces the bar's whole set. Nothing in the sidebar adds a link to the bar directly: two lists holding the same links would drift apart. *Flagged: taking the first N rather than adding a field is mine, as the design's own note says.*
- **Removing the first column** promotes the second into the bar. Removing the last one empties the bar's link slot and leaves lockup, copyright and back to top.
- **Counts.** Links in the bar: One · Three · Five · None, taken from a column holding 1–8; fewer authored than the setting draws what exists rather than padding. At 1080 the copyright leaves the bar and at ≤ 767 the links cut to one — both are width rules, not count rules. The released footer's counts are its own design's.
- **Zero.** No links → lockup, copyright and back to top. With Back to top off as well, the editor suggests A3·1 rather than a bar with nothing to do.
- **Inside an item.** Label and URL — **and it is the same item in both places.** An item edited in the released footer is the item in the bar, because the two are one element. Bar height and ground are section values and apply to the whole bar; there is no per-link treatment in a 52 px strip.

**Content fields.** `wordmark` · `mark` · `linkColumns[]` (the bar takes the first one, three or five links in authored order; the released footer uses the field as its own design specifies) · `copyright` · `legalLinks[]` · `showAttribution` · `social[]` (released footer only) · `footerBelow` (enum — which A3 design the bar releases into, default A3·1). No field is unique to this design: the bar is a projection of the footer's own content.

**Controls.**

| Control | Values |
|---|---|
| Bar height | Compact 44 · Comfortable 52 · Spacious 60 (56 plus the safe area at ≤ 767) |
| Bar ground | Background · Surface · Contrast — each at 92%, blurred where available, opaque where not |
| Links in the bar | One · Three · Five · None |
| Releases | At the page end · Never pins |
| Back to top | On · Off |
| Footer below | Any A3 design, default Minimal Line |

Back to top is this design's own control, not the shared Site-wide one; it accepts an optional icon per P0·2's button rules. The universal trio is **locked with reasons shown**: Background role (the 92% translucent bar ground is its own control, and the released footer's ground belongs to Footer below's design), Vertical spacing (a pinned strip has no spacing ladder — Bar height is the ladder, kept under its own name), Top divider (the hairline above the pinned bar is fixed — the translucent ground needs the edge). The category's Legal layout does not apply to the bar; the released footer follows its own design's setting.

**Behaviour.** Pinned by default: the pack's ground at 92% with a hairline above and the md shadow inverted upward — A1's sticky header values, mirrored. It carries a 22/16 px lockup, the links, the copyright and back to top. **Release:** when the footer below enters the viewport the bar unpins in place, losing translucency and shadow; the two are one element, so nothing crossfades and nothing is drawn twice. The page reserves the bar's measured height as bottom padding, recalculated on release, resize and zoom, so nothing is ever covered — including the last line of a post, a bottom-anchored A2·13 consent bar, and anything the browser scrolls into view. **Unpins entirely if the bar would exceed a quarter of the viewport height** (200% text zoom on a short window). With no JavaScript, or at Releases: Never pins, the bar is simply the last element in the page: opaque, in flow, no shadow, no back to top. In dark the shadow is dropped and the hairline separates.

**Responsive.** 1440–1081: lockup, links, copyright, back to top. 1080–768: the copyright leaves the bar — its destination is the released footer's legal line, which repeats it verbatim seconds later. ≤ 767: bar 56 px plus the home-indicator safe area (74 px reserved), links cut to one, back to top becomes a labelled 44 px glyph button, copyright still absent.

**Empty state.** No links → lockup, copyright and back to top. With Back to top off as well, the editor suggests A3·1 rather than a bar with nothing to do.

**Accessibility.** Pinned and released are one `contentinfo`, last in the document and in focus order at both states, never a live region — a scroll position is not an event worth announcing. Back to top is a `<button>` named “Back to top” that scrolls and then moves focus to the document's skip target, instant under reduced-motion; it is the one control in A3 that does something rather than going somewhere. Text on the 92% ground is measured against the page's own background behind it: 5.4:1 muted, 12.1:1 wordmark; where `backdrop-filter` is unsupported the ground is opaque, which can only improve it.

**Flagged as mine.** The three heights and the mobile 56 plus safe area, the 92% translucency and its opaque fall-back, taking the first N links rather than adding a field, dropping the copyright at 1080, the quarter-viewport unpin rule, the dropped shadow in dark, and the release recalculating the page's bottom padding.

---

## Boundaries with other categories

- **A22 Newsletter** owns any form with a heading, body copy or an image. A3·4 is one row and one reassurance line; if a site wants to argue for the newsletter, the argument goes in A22 and the footer keeps the field.
- **A16 Contact** owns forms, maps and hours tables. A3·10 carries the details as text only; the address is never wired to a map.
- **A17 Post Grids** and **A18 Post Lists** own post collections as sections. A3·9 is capped at four posts and one link column, and never gains an excerpt.
- **A20 Tag Collections** owns tag pages and tag cards. A3·13 is chips only, capped at sixteen.
- **A6 CTA Banners** owns persuasion above the footer. No A3 design carries a headline or a primary action other than A3·4's subscribe button.
- **A2 Announcement Bars** owns the top of the page and the two bottom-anchored designs (A2·11 Toast, A2·13 Consent). A3·16's pinned bar coexists with those: the reservation rule accounts for them, and the consent bar sits above the mini bar, never under it.

---

## Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All sixteen checked against each other; no two are the same, and every emphasis phrase is four words or fewer.

| # | Design | Tuple |
|---|---|---|
| 1 | Minimal Line | bar · none · page · none · none · brand row over legal row |
| 2 | Columns | grid-of-N · none · page · variable · none · brand block beside columns |
| 3 | Two-Tier | stack · none · surface · variable · none · full-bleed legal bar |
| 4 | Newsletter Band | form · none · surface · one · none · band above links |
| 5 | Contrast Band | grid-of-N · none · contrast · few · none · inverted whole footer |
| 6 | Centred Stack | stack · none · page · many · none · centred fixed measure |
| 7 | Big Type | stack · none · page · one · none · name at display scale |
| 8 | Sitemap | grid-of-N · none · page · many · none · column density control |
| 9 | Latest Posts | feed · none · page · few · top · posts beside one column |
| 10 | Contact Block | grid-of-N · none · page · few · none · labelled detail pairs |
| 11 | Colophon | article body · none · page · variable · none · prose measure plus credits |
| 12 | Card | grid-of-N · card · surface · few · none · panel inset from edges |
| 13 | Tags | nav · none · page · many · none · chips from Ghost tags |
| 14 | Image Band | media frame · none · image · one · full-bleed · scrimmed photograph band |
| 15 | Wrap | nav · none · page · variable · none · one wrapping link field |
| 16 | Mini Bar | sticky · none · page · few · none · pinned bar that releases |

**Containment is `none` fifteen times, and that is the honest answer.** A footer is a band across the page's foot, and a band is not a container — it is the section's own ground. **12 Card is the one exception**, because the section *is* a detached panel with the page ground visible around it, and the accessibility field says the card *is* the `contentinfo` rather than sitting inside one. Three near misses, stated rather than left to trip someone: **9 Latest Posts'** posts are drawn as image-and-title cells on the page ground — the cell is the item's geometry, not the section's containment, so the section is `none`; **13 Tags'** chips are contained objects for the same reason and the section is not; and **4 Newsletter Band's** band is a ground change across the full measure, which is `surface`, not `box`. `pill` and `box` are unused in A3 — the only pill-shaped thing in the category is a chip, and 12's own rule refuses the capsule outright: the radius stays the pack's token at every inset.

**Ground does the most separating.** Four values across sixteen: `page` on 1, 2, 6, 7, 8, 9, 10, 11, 13, 15, 16; `surface` on 3, 4, 12; `contrast` on 5 alone; `image` on 14 alone. Each is the drawn default, never the control's full range — ten designs offer Background · Surface · Contrast and are still `page`, and that is the settlement the category rests on: **5 Contrast Band exists as its own design because it has no Ground control**, so it is not A3·2 on a setting. **3 Two-Tier is `surface`** for the tier, which is the design's body; its bar is on the page ground, and that pair is what the design is. **16 Mini Bar is `page` at 92%**: translucency is a treatment of the page's own ground, not a ground of its own, so it is not `transparent`. `transparent` and `accent` are unused: no A3 design renders on another section's image, and the accent budget forbids an accent band — the only accent permitted on a footer ground is A3·4's button.

**Item-count reads the design's own repeating unit, not its furniture.** The social row and the legal line appear on every one of the sixteen, so neither sets the count; what counts is the column, the link, the post, the chip or the credit row. `none` on **1 Minimal Line**, which draws no columns at all. `one` on **4** (one form row), **7** (one name) and **14** (one photograph). `few` on **5** and **12** (capped at four columns), **9** (two to four posts) and **16** (three links in the bar at the drawn default). `many` on **6** (up to twelve links in one row), **8** (five columns minimum) and **13** (eight, twelve or sixteen chips). `variable` on **2**, **3**, **11** and **15**, where the author's own list length decides and the range crosses `few` into `many`.

**The closest pair is 2 Columns and 8 Sitemap**, sharing `grid-of-N · none · page`, and they separate on the count class before the emphasis phrase is even read: A3·2 runs 2–7 and is `variable`, A3·8's floor is five and is `many`. That is not a technicality — it is the whole difference between the design that adapts to any authored count and the design built for the site that has twenty-eight routes.

**Media placement is `none` fourteen times.** **9 Latest Posts** is `top` — the 3:2 image above the title in each cell, which is the drawn default and also what the mobile 72 × 54 thumbnail is a variation of, not a second value. **14 Image Band** is `full-bleed`, the only photograph in the category that is the section rather than an item inside it. `left`, `right`, `background`, `inline`, `bottom` and `edge` are unused: A3·10's contact block is text, A3·11's credits are text, and no A3 design puts an image beside its content.

**Two names that do not match their archetype, stated plainly.** **3 Two-Tier** is a `stack` and not a `split`: two tiers on top of each other is a vertical stack, while `split` would mean two panels side by side, which no footer in A3 is. **16 Mini Bar** is `sticky` rather than `bar` — the archetype names the behaviour, because the pinning is the design and the bar shape is what six other designs already are.

**Not used as a separator.** The universal Vertical spacing, Background role and Top divider, the category Legal layout, Columns, Social, the locked Attribution, Back to top and Shows on never appear in a tuple: they are controls, and two designs that differ only by a control setting are one design. Neither does the fallback web — and after Part A·A8 there is no fallback web: **no A3 design resolves to another design.** Each hides what does not apply and states it.

---

## Behaviour modules — roster

Three of the registry's 31, and nothing coined. Eleven designs declare none at all; two more declare one only at a non-default control value.

| # | Design | Modules | Note |
|---|---|---|---|
| 1 | Minimal Line | none | every part server-rendered; Back to top is an `<a href="#top">` |
| 2 | Columns | `accordion` at ≤ 767, five to seven columns; **ARCHITECT: `nav-transform`** at Columns source: bound | markup disagreement — **finding** |
| 3 | Two-Tier | `accordion`, same condition | the bar repeats A3·1's composition and adds no module |
| 4 | Newsletter Band | `member-form` | native post; Ghost's response replaces the done state |
| 5 | Contrast Band | none | the four-column cap is why |
| 6 | Centred Stack | none | nothing collapses, so nothing to declare |
| 7 | Big Type | `accordion` at Links: Columns above only | Fill width is a CSS clamp — **finding** |
| 8 | Sitemap | `accordion` at ≤ 767, always | the only unconditional accordion in A3 |
| 9 | Latest Posts | none | posts are server-rendered; not `load-more`, not `shuffle` |
| 10 | Contact Block | none | `mailto:` and `tel:` are hrefs |
| 11 | Colophon | none; **ARCHITECT: `nav-transform`** at Links source: bound | prose and credits are server-rendered; not `toc` |
| 12 | Card | none | inset, radius and shadow are CSS |
| 13 | Tags | none | `filter-strip` is closest and deliberately not declared |
| 14 | Image Band | `accordion` at Links: Columns only | scrim is CSS; not `lightbox` |
| 15 | Wrap | none | 24 links, one `<ul>`, no module |
| 16 | Mini Bar | `slide-in-card` — closest, two mismatches | **finding**; the released footer brings its own |

**Modules A3 deliberately does not use.** `header-scroll` (the header's, and the wrong degradation for A3·16), `nav-drawer` (a footer's links stack open; only five-plus columns fold, and as `<details>`), `load-more` and `infinite-scroll` (A3·9 is capped at four posts and has no next page), `filter-strip` (A3·13's chips are archive links), `lightbox` (A3·14's photograph is decorative), `reveal`, `count-up`, `share`, `mode-toggle`, `dismiss` — a footer is not dismissible — and the twenty others. Nothing in A3 animates on scroll, counts, reveals or shuffles.

---

## Item lists — roster

Three authored lists across the category — `social[]` stopped being one this pass and is now read-only rows from Ghost — — this pass gives `legalLinks[]` the P0·3 repeater it lacked (0–6 on every design, Add-with-content, remove never disabled above zero, drag reorder, labels inline, URLs via the Link Picker). `linkColumns[]` is drawn by fourteen designs and kept by all sixteen; `social[]` is drawn by fifteen (Ghost rows read-only and version-gated, plus the authored extension); `credits[]`, `creditsGroups[]` and `tagsList[]` belong to one design each.

| # | Design | Columns drawn | Links a column | Social | Other list |
|---|---|---|---|---|---|
| 1 | Minimal Line | none (kept, not shown) | — | 0–9, Ghost's | — |
| 2 | Columns | 2–7; 1 renders as one column | 1–8 | 0–9, Ghost's | — |
| 3 | Two-Tier | 2–7 | 1–8 | 0–9, Ghost's | — |
| 4 | Newsletter Band | 0–3 drawn; above three kept | 1–8 | 0–9, Ghost's | — |
| 5 | Contrast Band | 2–4, capped | 1–8 | 0–9, Ghost's | — |
| 6 | Centred Stack | flattened, 12 links total | 1–8 | 0–9, Ghost's | — |
| 7 | Big Type | 1–7 at Columns; row of 12 otherwise | 1–8 | 0–9, Ghost's | — |
| 8 | Sitemap | 5–7 designed, 1–7 possible | 1–8 | 0–9, Ghost's | — |
| 9 | Latest Posts | 1 drawn, rest kept | 1–8 | 0–9, Ghost's | posts, 2–4, from Ghost — no Add |
| 10 | Contact Block | 2 drawn, third kept | 1–8 | 0–9, Ghost's | contact fields, fixed four, not a list |
| 11 | Colophon | flattened row | 1–8 | 0–9, Ghost's | `credits[]`, 0–6 rows |
| 12 | Card | 2–4, capped | 1–8 | 0–9, Ghost's | — |
| 13 | Tags | 1 drawn | 1–8 | 0–9, Ghost's | `tagsList[]`, 3–16, a tag picker |
| 14 | Image Band | 1–7 at Columns; row of 12 otherwise | 1–8 | 0–9, Ghost's | image is one field, not a list |
| 15 | Wrap | flattened, 24 links total | 1–8 | 0–9, Ghost's | — |
| 16 | Mini Bar | shared list; bar draws first column's first 1/3/5 | 1–8 | released footer only | — |

**Three lists have no Add at all, and each for a different reason.** **A3·9's posts** come from Ghost and are ordered newest-first; **A3·10's four contact fields** are a fixed set in a fixed order, and a fifth detail is A16's; **A3·13's chips** are tags, so its Add is a picker over Ghost's list rather than a new row. In all three the sidebar says so where the Add button would have been, rather than leaving an author to look for it.

**Reorder is meaningful everywhere it is offered, and consequential twice.** A3·6 reads the first authored group as its primary row at two type sizes, and A3·16 draws the first column's first N links in the pinned bar. It is *not* offered on A3·13 at three of its four Order values, because the sort owns the order there and an inert drag handle is worse than no handle.

**No design has a per-item control**, and two designs record where that pressure showed up: A3·8's Density and A3·15's Link size are section values that every item reads, and A3·12 states outright that a card-per-column footer would be a second design rather than a control on this one.

---

## Findings for the architect

Five — four from the specification pass, one from the reconciliation patch — and none of them a licence to name a module.

1. **`nav-transform` needs to exist.** Columns bound to Ghost secondary navigation (A3·2's Columns source, A3·11's Links source) read the `+`/`-` prefix scheme and no registry module covers the transform. **ARCHITECT: registry addition**, marked on the frames and here. Per owner ruling it requires JavaScript and gets no no-JS accommodation: the degradation line states the flat raw-prefix list and stops — the one deliberate exception to the category's no-JS floor, and it is opt-in per column source.

2. **Back to top has no module.** It is a control in the shared Site-wide group on fifteen designs and A3·16's own on the sixteenth. Compiled as `<a href="#top">` it needs nothing and works with JavaScript off — but the accessibility note's second half, moving focus to the document's skip target after the scroll, needs script, and no registry module covers it. Either the registry gains a back-to-top behaviour or the note drops the focus move and the anchor stands alone. **A3 ships the anchor** and records the loss here.
3. **The accordion markup disagrees with the module, on three designs.** A3·2, A3·3 and A3·8 specify `<button aria-expanded aria-controls>` with `hidden` on closed groups; `accordion` compiles to `<details>`/`<summary>`. The registry is the authority on module mechanics, so the drawn frames and the spec cards owe a correction — including the count at the right end, which becomes `<summary>` content. **This is A2·14's finding again**, which makes it a library-level correction rather than a category one.
4. **A3·16 has no module that fits.** `slide-in-card` is the closest and its degradation is exactly right, but the name says card where the design is a full-width bar, and two mechanics fall outside every module's description: reserving the bar's measured height as the page's bottom padding — recalculated on release, resize and zoom, and accounting for a bottom-anchored A2·13 consent bar — and unpinning entirely above a quarter of the viewport height. Both are load-bearing. The alternative, `header-scroll`, has the wrong degradation: sticky still working would leave the bar pinned past the page's end.
5. **A3·7's Fill width was written as “measured at build”.** This pass reads it as a CSS clamp on the container, `clamp(72px, …cqw, 200px)`, which needs no module and is what makes the accessibility field's claim true — that the name recomputes under text zoom and never overflows. If the build genuinely measures instead, the design needs a module that does not exist and the zoom claim does not hold. Confirm the clamp.

---

## Reconciliation notes

**Frames changed by this pass.**

- **All sixteen designs + A3-0 Category Proof:** every legal line now reads **“Built with Inflozo”**; the two-letter social boxes are replaced by neutral Tabler-style placeholder glyphs; every control panel is rebuilt — the attribution toggle becomes a locked-on row with the Free-plan reason, the Padding / Ground / Top edge rows are removed (or renamed where the ladder is genuinely the design's own: Band padding, Card padding, Bar ground), and a UNIVERSAL block (Background role · Vertical spacing · Top divider) plus a CATEGORY block (Legal layout) now sit above the Site-wide group.
- **A3-1 Minimal Line:** primary, both state frames, DATA, CONTROL, DARK and tablet frames redrawn to the two-row arrangement (brand row over legal row); the CONTROL caption now reads “Attribution hidden — Pro plan only”; the panel adds Social position, Social display (with Short labels), Icon style and the drawn `legalLinks[]` repeater.
- **A3-2 Columns:** panel adds Columns source, Fill column, Icon style; ARCHITECT: `nav-transform` stated on the panel.
- **A3-3 Two-Tier:** panel adds Social position, Short labels, Icon style; universal trio drawn with two locked rows.
- **A3-4 Newsletter Band:** new MEMBER frame (signed-in reader, Manage-link state); legal line split (© + credit left, links right) in the primary and dark frames; panel adds Signed-in members. **This pass:** new NO-JAVASCRIPT frame (P0·4 notice in place of the form) and a corrected self-signup-off state.
- **A3-5 Contrast Band · A3-7 Big Type · A3-9 Latest Posts · A3-11 Colophon:** legal line split in every non-wrapping frame; panels gain their per-design rows (A3·7: Ink, Offset; A3·9: the P0·5 filter set; A3·11: Links source + ARCHITECT note).
- **A3-6 Centred Stack:** all five legal lines redrawn stacked — Privacy · Terms above, © + credit beneath; Legal layout drawn locked.
- **A3-8 Sitemap, A3-10 Contact Block, A3-12 Card, A3-13 Tags, A3-15 Wrap, A3-16 Mini Bar:** panel rebuilds as above; A3-14 Image Band adds the Image source row, A3-15 the five-value Separator row, A3-16 the fully-locked universal trio.

**Rulings — where this patch met something the spec had already settled, one line each.**

1. **Minimal Line's identity was “one row above a hairline”; the owner's legal-row move makes it two rows.** Applied; the tuple's emphasis is now “brand row over legal row” and the descriptor is rewritten — the design stays the category's baseline.
2. **The legal-line settlement's last item** read “Published with Ghost”, shown by default and removed by a free control. Corrected to “Built with Inflozo” → inflozo.com, disabled-on for Free with the reason shown, Pro-only hide.
3. **Top edge (Hairline · Ground change · None) vs the universal Top divider (None · Line · Fade):** mapped — Hairline → Line, Ground change → None with the differing ground as the edge; Fade is newly available; A3·3 locks the row. Not a distinct ladder, so the old control is retired rather than kept.
4. **A3·9's “Which posts” carried “A collection”; P0·5's filter set has no collections.** Aligned to P0·5 (Latest · Featured · By tag · By author · Hand-picked) — collections are route vocabulary. The old value is retired here, on record, not silently.
5. **A3·16's Ground stays its own control** (renamed Bar ground): the 92% translucency is a treatment of the bar, not the universal Background role; the universal trio is locked on that design with reasons shown.
6. **“Names are platforms, not glyphs” vs Icon Picker glyphs:** both hold — the glyph is Tabler's and `aria-hidden`; the accessible name stays the platform's.
7. **The six-social cap vs Ghost ≥ 6.36's nine read-only rows:** the cap governs the authored extension list only; Ghost's own rows render regardless and do not count against it. At ≤ 767 a row past six wraps.
8. **A3·9 and A3·13 had moved attribution to the Site-wide group “since the six are spent”.** The budget lift makes the reason obsolete; the locked attribution sits in the Site-wide group on all sixteen, so the outcome stands and the reason is retired.
9. **Columns source is stated category-wide but drawn in two panels** (A3·2, which settles the columns, and A3·11's Links source); the other column designs inherit the control with the shared list. Drawn-scope choice — mine.
10. **No Preview-type control existed in A3** — ground rule 7 removed nothing; previewing was already the editor's (P0·6).
11. **A3·4's four form states and the fixed error line** stand; the error line is reclassified from “fixed copy” to a translation-catalog string, and the two new signed-in sentences are fields with defaults.
12. **Defaults chosen by this pass, flagged as mine:** Signed-in members drawn at Show manage link; Icon style default Bare; the Ink percentages (100 / 55 / 24) and both Offset crop geometries; `creditsGroups[]` caps (0–2 groups, 0–6 rows); the split legal layout stacking back at ≤ 767.
13. **A3·1's a11y frame** keeps its single-row crop as an annotated structural diagram; its notes still hold (landmark, lockup, labelled lists) and the layout change is documented on the redrawn frames beside it.

## Patch notes — design patch pass

Frames updated: `A3-0 Category Proof`, `A3-2 Columns`, `A3-4 Newsletter Band`, `A3-5 Contrast Band`, `A3-7 Big Type`, `A3-8 Sitemap`, `A3-10 Contact Block`, `A3-12 Card`, `A3-15 Wrap`, `A3-16 Mini Bar`.

| Rule | Change |
|---|---|
| No design ever turns into another design | **All hand-offs withdrawn.** A3·2, A3·8, A3·10 draw the brand block alone when columns run out; A3·15 draws fewer items; **A3·7 shrinks a long name toward a 44 px floor, adding a line before going below it** instead of becoming A3·6 ⚑; A3·3's empty tier leaves the bar as its own composition; A3·5 and A3·12 **advise** A3·8 past their caps rather than handing off. A3·1's "fallback five designs hand off to" is struck, as is the structural-descriptor note about a "fallback web". A3·16's release is described as one element unpinning, not as a hand-off pattern borrowed from A1. |
| Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript | A3·4's subscribe ask is conditional on self-signup, members being enabled, and — for a paid ask — a payment provider; the Portal manage link does nothing without script. Its field controls stay disabled with the reason (owner's ruling). |
| The no-JavaScript notice | **A3·4's "posts natively, works without JavaScript" claim is withdrawn** — Ghost's signup endpoint refuses a plain POST. The form is replaced by P0·4's notice at the band's height; **the four form states are untouched.** New frame. |
| The Remove button never greys out | Remove is active at every floor, with one-clause sentences that point at no other control. |
| Item counts are a number picker | **How many posts becomes a 2–4 picker**; item counts are steppers with visible cap reasons. **Columns keeps its named values** — owner's ruling that A5 covers items, not arrangement. |
| A design may offer fewer choices on a shared control, and must say why | Universals narrow with a reason, never rename or extend; swatch row is **Base**; no "Inherit" anywhere in A3. |
| Avatars with no photograph | Not applicable: A3 renders no person. |
| The deleted Search category | A3 draws no search affordance; footer links may point at **Ghost search** via the link picker. |
| The retired keyboard shortcut | Ctrl-K unbound; nothing in A3 bound it. |
| The two free designs are the owner's choice | **[Free]: 1 Minimal Line and 16 Mini Bar**, confirmed by the owner. |

### Open questions

1. ~~A3·7's two-line clip.~~ **Closed by the owner:** the name **shrinks below 72 px rather than being cut**, to a **44 px floor**, and past the floor **the line count gives rather than the type size**. **One floor at every width.** The character figures come from measuring the drawn names (0.44 em per character): two lines at the floor hold about 134 characters on the desktop measure and about 36 on a phone's. Fill width is already measured at build, so none of this needs browser measurement or script. **Corrected twice in this pass** ⚑ — a first draft claimed 100 characters from an estimate, a second claimed 70 and invented a 28 px mobile floor from an advance mis-read off container widths rather than ink. **Both are withdrawn.** The 44 px floor is the one number here that is mine, and the stress frames now draw the same name at both measures so the arithmetic is checkable by looking.
2. ~~A3·10's imprint gap.~~ **Closed by the owner: left as-is** — the fields exist and the site owner knows their own law; INFLOZO encodes no jurisdiction's rule and adds no panel note. Recorded for the record: Where a footer address is legally required, the field exists but no jurisdiction's rule is encoded, and **Ghost supplies no site address** (Fact 3), so the four contact fields are section content the author types. Unchanged by this pass, restated because Fact 3 makes it sharper: nothing can pre-fill them.
3. **`nav-transform` still needs to exist** (finding 1, unchanged) — and it is the one place in A3 with a deliberate no-JS loss, which now sits beside A10's notice as the category's second script dependency.

   **OPEN FOR THE OWNER.**

*Housekeeping, 31 August 2026: items 1 and 2 above are struck because they were settled in this document — both by the owner, and the sentence naming him is left where it stands. Item 3 is genuinely still open and is marked so on its own line. Nothing here was answered by this pass.*

## Patch notes — footer links pass (29 August 2026)

Frames updated: **`A3-0 Category Proof`** (the social settlement, the legal settlement's stale four-link figure, the Ghost-data line, the caps card, and two new cards in the patch-pass column) and **`A3-1 Minimal Line`** (the social DATA caption, the panel's social group, the spec card's Data paragraph). No other frame needed a change: the member rulings were already drawn, and the social ruling changes where the row's content comes from — not its geometry, its glyphs, its accessible names or any drawn state.

**The owner's three answers, applied.** All three arrived on 29 August 2026 and none is a guess.

| Question | Ruling | What it changed here |
|---|---|---|
| Which two designs are free | **1 Minimal Line and 16 Mini Bar** | Confirmed; the line at the head of this document is now his word rather than a carried-forward suggestion. |
| Where a footer link to sign-in or an account should point | **An ordinary authored link — the editor sets the label and the address** | No member-destination picker, no special row. The panel says the pop-up address needs script, names Ghost's ordinary account page as the address that does not, and states plainly that the theme cannot hide an authored link on a site with no members. A3·4's own subscribe rules are untouched. |
| What to do with a handle pasted into a social entry | **The question is void: INFLOZO does not let anyone add a social account.** Accounts are set in Ghost Admin and the footer renders only those, through Ghost's `{{#social_accounts @site}}` helper | `social[]` stops being a repeater: the authored extension list, its platform picker, Add, Remove, reorder and the six-entry cap are all deleted, and the category's invented field groups drop from four to three. The helper hands the theme a finished address, so the handle problem cannot occur — nine platforms, Ghost's order, `{{else}}` as the empty state, the icon keyed off `type` through a block-form partial with a fallback. |

**Already satisfied before this pass — re-checked, not redone.** The earlier session's work is confirmed rather than repeated.

| Rule | Where it already stood |
|---|---|
| Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript | A3·4 §4: the field does not render with self-signup off or members disabled, a paid ask additionally needs a payment provider, the sidebar names which condition is in force, and the Portal manage link carries **nothing happens without JavaScript**. Drawn on A3-4's DATA and MEMBER frames and in its panel. |
| The no-JavaScript notice | A3·4 §4: the “posts natively” claim is withdrawn, the notice replaces the form at the band's own height, and the four working states are untouched. Drawn on A3-4's NO JAVASCRIPT frame. |
| No design ever turns into another design | Withdrawn across all sixteen in the previous pass — **except one leftover frame card, cleared this pass** (below). |
| The Remove button never greys out | Remove active at every floor, one-clause reasons, pointing at no other control. |
| Slider labels | No subject: A3 draws no slider. |
| Gap names are “Tight · Normal · Loose” | Any gap control in A3 reads those three; Vertical spacing keeps Compact · Comfortable · Spacious. |
| Item counts are a number picker | Links per column, legal links, credit rows, chips and How many posts are steppers; Columns stays a named arrangement control by the owner's ruling. |
| A design may offer fewer choices on a shared control, and must say why | Universals narrow with a stated reason, never rename or extend; the swatch row is **Base**; no “Inherit” anywhere in A3. |
| Avatars with no photograph | No subject: A3 renders no person. |
| The two free designs are the owner's choice | Ruled 1 Minimal Line and 16 Mini Bar — but **the line the merge reads was missing**, and is added by this pass (below). |

**Changed by this pass.**

| Rule or ruling | Change |
|---|---|
| Social links go through Ghost's own link helper | **Settled the whole way by the owner's ruling: the row is Ghost's, whole.** `{{#social_accounts @site}}` supplies each row's finished address, its accessible name and its icon key; **nothing is authored, so no handle can be printed.** The authored extension list and everything attached to it is deleted, and the sidebar's rows are read-only with a link out to Ghost. Nothing drawn changes. |
| Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript | **Extended from buttons to links, in the form the owner ruled.** A member link is an ordinary authored link whose label and address the editor owns; the panel carries **with JavaScript off, nothing happens** for a pop-up address, names Ghost's ordinary account page as the alternative, and states that an authored link cannot be hidden by the theme on a site with no members. A3·4's own rules are unchanged. |
| No design ever turns into another design | **One leftover cleared.** `A3-0`'s caps card still read “A3·2 with no columns → A3·1 … A3·5 above four columns → A3·8”, contradicting the prose that had already withdrawn every hand-off. The card now states the caps, the advice and the hiding rule, and names no design as another design's outcome. |
| The two free designs are the owner's choice | **The `**[Free] designs:**` line is now present**, on its own line at the head of this document, in the required shape, naming **1 Minimal Line · 16 Mini Bar** — **confirmed by the owner on 29 August 2026**. |
| — (not a rule: a stale figure) | The legal settlement's card on `A3-0` said the legal field “accepts up to four”; the cap is six. Corrected to agree with the prose. |

**The no-JavaScript line, all sixteen.** One clause each, so the set can be read at once. Category-wide, `core` never runs, so every JS-conditional rule stays in its no-JS branch, and **no A3 design loses content without JavaScript.**

| # | Design | Module | With JavaScript off |
|---|---|---|---|
| 1 | Minimal Line | none | Identical — lockup, glyph row, legal line and generated year are all server-rendered. |
| 2 | Columns | `accordion` (≤ 767, five to seven columns) | **Declares “collapses into sections under 768”. At 768 and above:** nothing is collapsed at any column count — the open grid, every heading and every link are server-rendered. **Below 768:** two to four columns stay the open grid; five to seven are native `<details>`, first group server-open, every link reachable. Only the 160 ms height transition is lost. |
| 3 | Two-Tier | `accordion` (same condition) | **Declares “collapses into sections under 768” — the tier only. At 768 and above:** both grounds and both tiers render whole with the columns open. **Below 768:** the tier's five-to-seven case is native `<details>`, first group server-open; the bar is unchanged. The division the reader sees is the same on both sides. |
| 4 | Newsletter Band | `member-form` | **The form is replaced by the notice** — “Signing up needs JavaScript — turn it on to subscribe.” The four working states are Ghost's script and stay as drawn. |
| 5 | Contrast Band | none | Identical — the cap keeps the collapse at the open grid, so there is no accordion to lose. |
| 6 | Centred Stack | none | Identical — one order at every width, nothing to collapse. |
| 7 | Big Type | none at the drawn setting; `accordion` at Columns | **Declares “collapses into sections under 768, at Links: Columns above”; at Row above and Off, no width. At 768 and above:** the name is a CSS clamp, so it still fits and still zooms, and the links draw open. **Below 768:** the row wraps at Row above; at Columns above, native `<details>`, first server-open, transition only. |
| 8 | Sitemap | `accordion` (≤ 767, always) | **Declares “collapses into sections under 768”, unconditional. At 768 and above:** no accordion at all — five to seven columns across at 1440, three-across at 1080, every link open and server-rendered. **Below 768:** native `<details>` throughout, first group server-open, counts static; every link is reachable, transition only. |
| 9 | Latest Posts | none | Posts, titles, dates and images are server-rendered; only the 1.02 hover is lost. |
| 10 | Contact Block | none | `mailto:` and `tel:` are hrefs; the block is static text. |
| 11 | Colophon | none | Prose and credits are server-rendered. **Exception:** Links source *From Ghost secondary nav* is JavaScript-only by the owner's ruling — the flat raw-prefix list is what shows, and that is stated rather than accommodated. |
| 12 | Card | none | Identical — inset, radius, hairline and the dark-mode shadow drop are CSS. |
| 13 | Tags | none | Chips, counts, order and the overflow link are server-rendered. |
| 14 | Image Band | none at the drawn setting; `accordion` at Columns | **Declares “collapses into sections under 768, at Links: Columns”; at Links: Row and Off, no width. At 768 and above:** band, crop and scrim are CSS, the height is reserved before the image arrives, links open. **Below 768:** the band floors at 180 px; at Links: Row nothing runs; at Links: Columns, native `<details>`, first server-open, transition only. |
| 15 | Wrap | none | One wrapping list, separators as CSS content; nothing to collapse. |
| 16 | Mini Bar | `slide-in-card` | The bar renders **in flow, unpinned, in place** — the released state is the no-script state, and no content is withheld. |

Two script dependencies exist in the whole category and both are stated, never hidden: **A3·4's form** (the notice replaces it) and **the secondary-navigation prefix scheme** (owner-ruled, no accommodation). To them this pass adds a third, conditional on what an author does: **a footer link pointed at Ghost's own pop-up**, which carries the same sentence.

**Confirmations.**

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16** — sixteen designs, no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the required shape, and names **1 Minimal Line** and **16 Mini Bar** — both of which exist in this category's roster, and both **confirmed by the owner on 29 August 2026**.

### Open questions

Carried forward, unchanged: **`nav-transform` still needs to exist** (finding 1), and the four earlier findings stand as written.

**OPEN FOR THE OWNER.**

*Housekeeping, 31 August 2026: the three items below are struck because the owner settled them on 29 August 2026, and each names him. `nav-transform` is the only item in this list still open, and it is marked above rather than left to look like the rest.*

**Closed on 29 August 2026 — all three of this pass's questions were answered by the owner and are applied above.**

1. ~~Which two designs are free.~~ **1 Minimal Line and 16 Mini Bar**, confirmed.
2. ~~What a footer link pointed at the sign-in or account pop-up should point at.~~ **Neither is prescribed: it is an ordinary authored link and the editor sets its label and address.** The panel carries the script note and names the address that works without script; it does not choose for the author.
3. ~~What the editor should do with a handle pasted into an authored social entry.~~ **Void — no one adds a social account in INFLOZO.** Accounts live in Ghost Admin and the footer renders them through Ghost's own helper, which hands over a finished address.

**One item for the architect, arising from ruling 3 rather than from a rule:** the theme needs one icon partial per platform for Ghost's nine — x, facebook, linkedin, bluesky, threads, mastodon, tiktok, youtube, instagram — plus the neutral fallback glyph that the block-form dynamic partial falls back to. **Ghost 5.x has no `social_accounts` helper**, so the 5.x branch stays Facebook and X through their own link helpers; that branch is now the only place in A3 where a stored handle exists at all, and it is Ghost's helper that resolves it.

— End of specification —

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** sixteen designs, numbered **1–16**.

---

## Patch notes — design patch pass two, 31 August 2026

Frames updated: **`A3-2 Columns`**, **`A3-3 Two-Tier`**, **`A3-7 Big Type`**, **`A3-8 Sitemap`**, **`A3-14 Image Band`** (a DECLARED WIDTH block in each panel, and one sentence in each spec card) and **`A3-0 Category Proof`** (the rule card and its mono line). **No other frame changed**, because no other A3 design runs anything at any width. Nothing was renumbered, no control changed its name or its values, no ground, type size, spacing value or accessibility note was touched, and no roster row moved.

| Rule (by name) | Change |
|---|---|
| A design may declare the width below which its script runs | **The five accordion-bearing designs declare one, and all five declare the same width: “collapses into sections under 768”.** A3·2 and A3·3 name the condition as well (five to seven authored columns); **A3·8 names no condition**, because five groups is its floor and the width alone decides; **A3·7 and A3·14 name the setting inside the declaration** — “under 768, at Links: Columns” — and declare no width at their other settings, where nothing runs on either side of one. Each design's no-JavaScript line now **reads both sides**: above 768 nothing is collapsed at any count and the whole grid is server-rendered; below 768 two to four columns stay open and five to seven are native `<details>`, first group server-open, every link reachable. **On both sides, the only loss is the 160 ms height transition.** Written into §0·0, into the Behaviour module field of §2, §3, §7, §8 and §14, and into rows 2, 3, 7, 8 and 14 of the sixteen-row no-JavaScript table. |
| A control switched off by another is greyed, with the reason beside it | **No subject in this pass, and nothing changed.** A3's controls that another switch turns off are already drawn greyed with the reason at the control: A3·8's **Contrast disabled above four columns** with its ratio-and-reason line, A3·4's **band ground disabling Contrast**, A3·4's field controls disabled with the reason under a site that cannot honour the ask, and A3·5, A3·3 and A3·14's **locked** Background role with its reason shown. None is hidden and none accepts a value it will not honour. The one exception the rule names — a control the project can never offer — has no case in A3: the category draws no visitor dark-mode switch. |
| Avatars with no photograph show initials, and the two forms are not interchangeable | **No subject.** A3 renders no person: A3·9's post rows carry no author avatar and no A3 design draws an author, a member or a commenter. Recorded so the silence is not read as a miss. |
| The remove button never greys out | **Applied the whole way through, on the owner's instruction of 31 August 2026.** §0·0 already stated the rule; the four design sections and the §0 *Remove, and the floors* paragraph that still greyed Remove at a floor are corrected to match it. **§0:** at a minimum Remove stays visible and fully clickable, and the floor and the reason arrive as one sentence under the list. **§2** (two columns), **§5** (two), **§8** (one) and **§12** (two): Remove is active at every count and the click states the floor — “Two is the fewest this design draws.”, “A sitemap needs at least one column.” — each one clause, pointing at no other control. **Add still caps and still greys**: the caps are unaffected, and only Remove is at issue. No frame changed: no A3 panel drew a greyed Remove. |
| A count that picks between drawn layouts is a named set, not a number picker | **Checked design by design; nothing converted in either direction.** Columns (Auto · Two · Three · Four), A3·8's Columns (Auto · Five · Six · Seven), Band height, Name scale and Density stay **named sets** — every value has a drawn frame. Links per column, legal links, credit rows, chips and **How many posts (2–4)** stay **number pickers**. |
| The feature-image caption renders differently on the two Ghost versions (tested 2026-08-31) | **No change, recorded so the omission is not read as a miss.** A3 renders no feature image and no caption; A3·9's post rows draw a title, a date and an image, never a caption. |
| A comment count renders nothing at all without JavaScript (tested 2026-08-31) | **No change, same reason.** No A3 design reads a comment count. The counts A3 does draw — the accordion's “{n} links”, A3·13's tag counts, A3·8's generated-group counts — are server-rendered static text and `aria-hidden`, and none of them is a comment count. |
| Ghost's templates cannot count, add or remember (Fact 1) | **No new subject.** The accordion counts are the catalog string over a list Ghost can length; nothing in this pass asked a template to add, compare or remember. |
| Housekeeping — the Open questions lists | Both lists are now readable at a glance. In the design-patch list, items 1 and 2 stay struck and name the owner as the one who settled them, and **item 3, `nav-transform`, is marked OPEN FOR THE OWNER on its own line**. In the footer-links list the three struck items name the owner and the date, and the carried-forward `nav-transform` line is marked **OPEN FOR THE OWNER** the same way. **Nothing was answered by this pass.** |

**Left alone deliberately.** The **printed-count copy** rule has no subject here — this specification prints no total of the library's designs, only its own sixteen, which is the category's roster and not a product-copy count — and nothing was added that could become one. **P0's per-prop mark allowlist** lives in the P0 specification and was not opened. Where a frame or a sentence might have been edited in the repository rather than here, it was left: the five panels gained a new block each and lost nothing, and no existing sentence in any A3 frame was rewritten.

### OPEN QUESTIONS raised by this pass

1. **The work list describes the above-the-width state as “a plain stacked list of links”; every A3 frame draws an open column grid there.** Above 768 these five designs draw a grid — four across at 1440, two across at 1080, three across on A3·8 — not a stacked list, and below 768 at two to four columns they draw an open two-across grid rather than an accordion. **I wrote the no-JavaScript lines from the frames rather than from that phrasing, and changed no drawn layout.** If the intent was that the accordion designs should render a plain stacked list above 768, that is a layout change to five designs and needs saying as one. ~~**OPEN FOR THE OWNER.**~~ **Closed by the owner on 2 September 2026: the frames were right and the instruction's wording was loose. The columns stay in all five designs, no layout changed, and the wording was corrected rather than the drawings.**
2. ~~Remove at a floor: §0·0 and five design sections contradicted each other.~~ **Closed by the owner on 31 August 2026:** at the minimum, clicking Remove still registers as a click and says why nothing can be removed. Applied to §0's *Remove, and the floors* paragraph and to §2, §5, §8 and §12; the greyed-at-a-floor wording is gone from the category.

**Confirmations.**

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16** — sixteen designs, no number added, removed, reused or moved.
2. **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the required shape, and names **1 Minimal Line** and **16 Mini Bar** — both of which exist in this category's roster.


---

## Patch notes — design patch pass three, 2 September 2026

Frames updated: **`A3-0 Category Proof`** (a pass-three patch block recording the ruling). **No other frame changed**, and the five accordion-bearing panels — `A3-2 Columns`, `A3-3 Two-Tier`, `A3-7 Big Type`, `A3-8 Sitemap`, `A3-14 Image Band` — were read and needed nothing: each already draws the open column grid the ruling confirms and already reads both sides of its declared width. Nothing was restyled, no frame moved, no control, value, field, ground, type size, spacing value or accessibility note changed, no roster row moved, and no design was renumbered.

**One item, and it closes a flag rather than changing anything.** Patch pass two's work list described the wide-screen state of the accordion footers as "a plain stacked list of links"; every A3 frame draws an open column grid there. The previous session wrote the no-JavaScript lines from the frames and raised the difference as an open question instead of acting on it. **The owner has ruled: the frames were right and the instruction's wording was loose. The columns stay, in all five designs, and the wording is corrected rather than the drawings.** Open question 1 of that pass is struck in place with the ruling and its date.

| Rule (by name) | Change |
|---|---|
| Owner's ruling — the wording was corrected, not the drawings | **The flag is closed and no layout moved.** Above 768 the five designs draw a grid — four across at 1440, two across at 1080, three across on A3·8 — and below 768 two to four columns stay an open two-across grid while five to seven become native `<details>`. That is what §0·0, the five design sections, the sixteen-row no-JavaScript table and the five panels already say, and all of it stands unedited. Recorded in patch pass two's open-question list, in the pass-three block on `A3-0`, and here. |
| A design may declare the width below which its script runs | **Confirmed, unchanged.** The declaration stays *"collapses into sections under 768"* on **2, 3, 7, 8 and 14** — with the condition named on 2 and 3, the setting named inside it on 7 and 14, and none on 8, where five groups is the floor and the width alone decides. Each no-JavaScript line still reads both sides of the width, and **on both sides the only loss is the 160 ms height transition**. The other eleven designs declare no width, because nothing in them runs at any width. |
| A control switched off by another is greyed, with the reason beside it | **No new subject.** A3's switched-off controls are already drawn greyed with the reason at the control: A3·8's **Contrast disabled above four columns** with its ratio-and-reason line, A3·4's band ground disabling Contrast and its field controls disabled with the reason under a site that cannot honour the ask, and the **locked** Background role on A3·3, A3·5 and A3·14 with its reason shown. None is hidden, none accepts a value it will not honour. **The never-offerable exception has no case here:** A3 draws no visitor dark-mode switch. |
| Avatars with no photograph show initials, and the two forms are not interchangeable | **No subject.** A3 renders no person — A3·9's post rows carry no author avatar, and no A3 design draws an author, a member or a commenter. Recorded so the silence is not read as a miss. |
| The remove button never greys out | **Confirmed, unchanged.** Remove stays visible and fully clickable at every floor — §2 "Two is the fewest this design draws.", §5 the same, §8 "A sitemap needs at least one column.", §12 two — each one clause under the list, pointing at no other control. Add still caps and still greys; only Remove was ever at issue. |
| A count that picks between drawn layouts is a named set, not a number picker | **Confirmed, unchanged.** Columns (Auto · Two · Three · Four), A3·8's Columns (Auto · Five · Six · Seven), Band height, Name scale and Density stay **named sets**; links per column, legal links, credit rows, chips and How many posts (2–4) stay **number pickers**. Nothing converted in either direction, and this pass added no count. |
| Printed design totals stay out of product copy | **Honoured, and nothing written.** No copy was authored in this pass, and no design total — old, corrected or computed — appears in anything it touched. The counts A3 prints are its own sixteen on a design-library artefact, which is the category's roster and not a product-copy total. That judgement is unchanged, not re-opened. |
| P0's per-prop mark allowlist | **Not touched.** This pass did not open P0. |
| The marketing and app screens print no design total | **Not this category's, and not touched.** A3 holds no marketing or app screen. |

**Left alone deliberately, and why.** Patch pass two's own section is left standing with its open question **struck in place** rather than deleted: it is the record of what was true on 31 August 2026, and removing it would hide the ruling instead of recording it. The same treatment the document already gives three earlier historical sections. The **wording** the ruling corrects lives in the pass-two work list, which is not this document; nothing in A3 repeated the "plain stacked list" phrasing, so there was no sentence here to rewrite — had there been one, it would have been corrected. The four settlements and the reconciliation notes keep their own historical language for the same reason.

### Owner's rulings, this pass

1. **The A3 frames were right and the pass-two wording was loose** — the accordion designs draw an open column grid above 768, the columns stay in all five, and no layout changes. Raised as open question 1 of patch pass two, ruled 2 September 2026.

### Open questions

**None raised by this pass.** Nothing here required inventing a decision. One item remains outstanding and it is the architect's, exactly as written and untouched: **finding 1 — `nav-transform` still needs to exist** in the behaviour registry; the four earlier findings stand as written.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16** — sixteen designs, no number added, removed, reused or moved.
- **The "**[Free] designs:**" line is present**, on its own line at the head of this document, in the required shape, and names **1 Minimal Line** and **16 Mini Bar** — both of which exist in this category's roster.
