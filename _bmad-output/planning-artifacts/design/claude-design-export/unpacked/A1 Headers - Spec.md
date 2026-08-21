# A1 · Headers & Navigation — written specification

Pack drawn: **Paper**. **All 16 designs complete.** Category artefacts (tokenisation proof, stress frame, shared field list, roster) are in **A1-0 Category Proof.dc.html**.

Frames: `A1-1 Rail` · `A1-2 Split Rail` · `A1-3 Stacked Masthead` · `A1-4 Overlay` · `A1-5 Floating Pill` · `A1-6 Drawer-First` · `A1-7 Mega Bar` · `A1-8 Utility + Nav` · `A1-9 Search-Forward` · `A1-10 Contrast Band` · `A1-11 Side Rail` · `A1-12 Boxed` · `A1-13 Centre Nav` · `A1-14 Icon Utilities` · `A1-15 Big Type` · `A1-16 Reveal` (all `.dc.html`)

**Frame set per design, from design 5 onward:** desktop 1440 light (primary) · the design's behaviour state · a hover/focus states frame · tablet 834 always, even when it only narrows · mobile 390 closed and open · dark desktop · an annotated accessibility frame · control panel · spec card. Designs 1–4 predate the last three of those; their states and accessibility notes live in their spec cards and in §0 below.

---

## 0 · Category-wide rules

These apply to all 16 designs and are not repeated per design.

**Placement.** Site-wide furniture. Sits below the announcement bar (A2) and above everything else. Present on every template.

**Breakpoints.** Desktop ≥ 1024 · tablet 768–1023 · mobile ≤ 767. The drawer arrives at 767 in every design except A1·6, where it is the design.

**Type floors.** Nav 15 px desktop / 15 px mobile, never below. Meta and utility 13–14 px. Wordmark 17 px minimum. Tap targets 44 px.

**Motion.** 160 ms ease-out, one transition per state change, no in-between states. Sticky transitions fire once at 80 px of scroll. Drawer opens with a 160 ms translate, no bounce. All of it is suppressed under `prefers-reduced-motion` — the states still change, instantly. Nothing animates while the section is being edited: the resting state is what the editor shows.

**Hover, focus and pressed — library-wide.** Nav items change colour only on hover (`text-muted` → `text`); the accent underline means "you are here" and hover never imitates it. Focus-visible is a 2 px `accent` ring at 2 px offset, 6 px radius — on an accent fill it gets a `background`-coloured gap first, and on a `contrast` ground it switches to the pack's lightest surface. Buttons darken the accent one step on hover and two when pressed, both supplied by the pack. Hover and keyboard focus land on the same shape in dropdowns and panels. Two exceptions, each justified on its frame: takeover items at display size underline in accent on hover (A1·6), and 13 px utility-strip links underline in `border` colour (A1·8).

**Content parity across frames.** Every frame of a design draws the same authored content: the same four nav items, the same children and grandchildren, the same two member actions, the same tag chips. Only what a stated rule names may differ by width — a fold to More, a column stack, a dropped rail, an element that moves to the drawer. A frame that quietly carries less content than its siblings is a defect, not a simplification.

**Accent budget.** Once or twice per header. The permitted uses are: the primary action's fill, the active nav item's 2 px underline, the logo mark, and (A1·3 only) the reading-progress rule. Never on hairlines, never on hover backgrounds.

**Shared components established here, reused verbatim for the rest of the library.**

| Component | Definition |
|---|---|
| Logo lockup | 26 px accent rounded-square mark (radius token − 1) + wordmark in the pack heading font at 19 px, 10 px gap. Mark is optional; wordmark alone is valid. |
| Nav item | 15 px body font. Resting `text-muted`; active `text` + 2 px `accent` underline offset 2 px. Hover → `text`, 160 ms. |
| Dropdown panel | 248 px, `surface`, 1 px `border`, radius token, md shadow, 8 px padding, items 14 px in 6 px-radius rows, hovered row on a one-step-warmer surface. Left-aligned to trigger. Two levels: a child may carry its own group, shown indented under it against a hairline at 13.5 px, never a third level and never a second flyout panel. |
| Primary button | `accent` fill, `background`-coloured label, 14 px / 600, padding 9 × 17, radius token. |
| Ghost action | `text-muted` label, 14 px, no border in the bar; 1 px `border` and radius token when it appears as a full-width drawer button. |
| Overflow menu | Label "More" + 9 px caret, uses the dropdown panel. |
| Drawer | Full-height panel on `surface` (or `contrast` for A1·4), 64 px close row, nav items in the heading font at 22–26 px, actions pinned to the foot, focus trapped. |
| Search affordance | 38 px icon button (1 px `border`, radius token, 19 px glyph) in the bar; a 44 px target with a 20 px glyph on mobile; a labelled field in the drawer. Opens the A23 surface. |

**Accessibility floor for every design.** One `<header>` landmark; one `<nav aria-label="Primary">`. The wordmark links to `/` and is not an `<h1>` except on the home page. Dropdown triggers are `<button aria-expanded>`; panels close on Escape and on focus leaving. The drawer traps focus and returns it to its toggle. A skip-to-content link is first in focus order on every design. Visual focus is a 2 px `accent` ring at 2 px offset. DOM order follows reading order regardless of visual arrangement.

**Data.** `navItems` is Ghost's primary navigation; `secondaryNav` is Ghost's secondary navigation; `socialLinks` reads Ghost's social fields. Member actions are hidden wholesale when members are disabled in Ghost. Children and descriptions are authored in Inflozo because Ghost's navigation is flat; two levels of child are supported, three are not.

**Empty-data floor.** Zero nav items never leaves a ruled empty band: the nav row or the hairline that framed it is removed. Zero member actions shifts remaining content, it does not leave a gap. A missing logo image falls back to the wordmark as text, never to a broken-image box.

---

## 1 · Rail

Logo left, nav inline beside it, actions right, hairline under. The library's baseline; every other design's sticky state falls back to it.

**Content fields.** `logo` (image, opt) · `siteTitle` (text, from Ghost, req) · `navItems[]` (link list, opt — 4 shown at every width above the drawer, items 5+ fold to More) · `navItems[].children[]` (link list, opt, ≤ 8 per parent, two levels) · `signInLabel` (text, opt, default "Sign in") · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18 chars, optional `ctaLabelShort`) · `searchEnabled` (bool, default off) · `darkModeToggle` (bool, opt).

**Controls.**

| Control | Values |
|---|---|
| Height | Compact · Comfortable · Spacious |
| On scroll | Static · Sticky · Shrink |
| Nav position | Beside logo · Centre · Right |
| Actions | None · Sign in · Subscribe · Sign in + Subscribe |
| Divider | Hairline · Shadow · None |
| Search in header | On · Off |

**Data.** Primary nav from Ghost. Empty nav → logo + actions only, full height, hairline kept. Members off in Ghost → both actions hidden, nav unchanged in position.

**Responsive.** 1440–1024 as drawn. 1023–768 is a simple narrowing — bar height holds at 76 (height follows the Height control, never the width), wordmark 19 → 18, mark 26 → 24, padding 72 → 40, nav gaps 28 → 20; both actions stay in the bar and the 4-item cap is unchanged, so the four drawn items all survive at 834. ≤ 767 nav to drawer, primary CTA stays in the bar (short label if given), hairline kept, bar height 64 minimum and grows if the wordmark takes two lines.

**Behaviour.** *Shrink*: 76 → 56 px, wordmark 19 → 16, mark 26 → 22, hairline replaced by md shadow, ghost Sign in dropped so the primary action survives. Fires once at 80 px. *Dropdown*: 248 px panel, left-aligned, opens on click and on focus, 160 ms.

**Empty state.** No logo → wordmark text. No CTA → nav gains the space, bar keeps its height. No children on a nav item → no caret rendered.

**Accessibility.** As the category floor. The More trigger is a button with `aria-expanded`; its panel is the same component as a nav dropdown so keyboard behaviour is identical.

---

## 2 · Split Rail

Wordmark centred, nav divided around it, utilities right. Same components, one axis of symmetry.

**Content fields.** Shared list. Uses `logo`, `siteTitle`, `navItems[]` (6 shown at ≥ 1024, 3 at 768–1023, overflow folds to More — 1–3 left, 4–6 right), `children[]`, `ctaLabel`/`ctaUrl`, `searchEnabled`. Does not display `signInLabel` — if filled, it renders in the drawer, never dropped.

**Controls.**

| Control | Values |
|---|---|
| Height | Compact · Comfortable · Spacious |
| Wordmark size | Small · Medium · Large |
| Split | Even · Weight left · Weight right |
| Right cluster | Subscribe · Search + Subscribe · Search only · Hidden |
| On scroll | Static · Re-form left · Hide |
| Hairline under | On · Off |

**Data.** Ghost nav, split by index. Odd counts weight left; at 5 items "Even" is not achievable and degrades to Weight left, stated in the sidebar. 0 items → centred wordmark alone at Comfortable height.

**Responsive.** 1440–1024 three-column grid. 1023–768 even narrowing, items 4+ to More. ≤ 767 hamburger left / wordmark centre / search right; the CTA moves to the drawer and pins to its foot on a hairline, because a centred wordmark and a button cannot share a 390 bar without one dropping below its floor. In the drawer, children expand in place beneath their parent (indented against a hairline, body size, accent caret) rather than sliding to a second panel; opening one parent collapses any other.

**Behaviour.** *Re-form left*: on scroll the header becomes A1·1 Rail at 58 px — logo left, nav single-file. This is the only structural change on scroll permitted anywhere in the library, and it is why Rail is design 1.

**Empty state.** No CTA and no search → nav splits 3/3 and the right column holds nothing; the grid keeps the wordmark optically centred rather than re-centring on content.

**Accessibility.** DOM order is logo → nav → utilities regardless of the visual split, so focus never zig-zags across the wordmark. One nav landmark containing both halves, not two.

---

## 3 · Stacked Masthead

Masthead row (date · wordmark + tagline · actions) over a ruled nav row. The nav row detaches on scroll and carries the reading-progress rule. A1's one display moment.

**Content fields.** Shared list plus `tagline` (text, opt, ≤ 48 chars, defaults to Ghost's site description) and `dateLine` (bool). `navItems[]` max 8 here — the row is full-width.

**Controls.**

| Control | Values |
|---|---|
| Masthead height | Compact · Comfortable · Spacious |
| Nav row | Centred · Left · Justified |
| On scroll | Static · Nav row sticks · Whole header sticks |
| Rules | Hairline · Double · None |
| Tagline | On · Off |
| Reading progress | On · Off (post and page templates only; disabled elsewhere with the reason shown) |

**Data.** Ghost nav for the row; tagline from Ghost's description unless overridden. Empty nav → both rules and the nav row are removed, leaving the masthead alone. Reading progress requires a post context.

**Responsive.** 1440–1024 as drawn. 1023–768 **re-arranges**: the date line and both actions leave the masthead row (to the drawer), the wordmark centres alone, and the nav row becomes a horizontally scrolling rail with a fade at its right edge — six equal magazine sections have no obvious sixth-place item to hide, so nothing folds to More. ≤ 767 wordmark 23 px, rail shows two items, drawer holds the rest plus date and actions.

**Behaviour.** *Nav row sticks*: masthead scrolls away with the page, nav row pins at 52 px and gains the wordmark at body size so the site name is never off-screen. Progress is a 2 px accent rule on the pinned bar's bottom edge.

**Empty state.** No tagline → wordmark sits alone, masthead height unchanged (the space is the design, not the text's). No date → left cell empty, wordmark stays optically centred.

**Accessibility.** Wordmark is the site link, not an `<h1>`, on every template except home. Tagline is a `<p>`. The scroll rail is keyboard-scrollable and no item is reachable by focus while clipped from view — focus scrolls it into the rail.

---

## 4 · Overlay

Rail's arrangement with no ground of its own, sitting on the first section's image; solidifies once the hero passes.

**Content fields.** Shared list plus `logoLight` (image, opt) — a second logo file for dark imagery. If absent, "Header colour on image: Light" renders the wordmark as text rather than tinting the user's file.

**Controls.**

| Control | Values |
|---|---|
| Scrim | None · Subtle · Strong |
| Header colour on image | Light · Dark · Match pack |
| On scroll | Stay transparent · Solidify to surface · Solidify to contrast |
| Height | Compact · Comfortable · Spacious |
| Drawer | Full screen · Sheet |
| Actions in bar | On · Off (moves both to the drawer) |

**Data.** Ghost nav as elsewhere. **Depends on the section below it:** if the first section has no image, or its image fails to load, the header renders as A1·1 Rail on the pack's surface and the sidebar says so. No transparent header over a flat pack colour.

**Responsive.** 1440–768 transparent, nav folds to More past 4 items. ≤ 767 wordmark + toggle only; both actions move to the drawer foot.

**Behaviour.** *Solidify*: crossing the hero's bottom edge the bar takes `background` at 94 % with the md shadow, the logo mark returns to `accent`, the inverted button becomes the standard accent button, height 76 → 64. One transition, no in-between. *Drawer*: full-screen on the `contrast` token — the only use of contrast in A1 — so the drawer never has to solve legibility against the image behind it.

**Empty state.** No hero image → falls back to Rail (above). No CTA → nav gains the space; the scrim is unchanged, since it serves the hero text as well as the header.

**Accessibility.** AA is checked against the **scrimmed** image, not the raw image. Subtle is the minimum that passes at the drawn crop; choosing None disables the Light/Dark auto-pick and warns. The accent is deliberately absent from the transparent state because a pack accent is not guaranteed to hold contrast over an arbitrary photograph — the inverted action uses the pack's lightest surface instead.

---

## 5 · Floating Pill

A capsule on `surface`, inset from three sides, with the page ground visible around it. Rail's contents held in an object. The only design with a shadow at rest.

**Content fields.** Shared list, no additions.

**Controls.** Height (Compact · Comfortable · Spacious) · Pill width (Narrow · Page gutter · Edge to edge) · On scroll (Static · Stick · Stick and narrow) · Lift (Flat · Subtle · Lifted) · Actions (None · Sign in · Subscribe · Sign in + Subscribe) · Search in pill (On · Off).

**Data.** Ghost primary nav. Empty nav → the pill shrinks to logo + actions and stays centred at Page-gutter width. Members off → both actions hidden; with no actions and no search the pill narrows to its content, the one case where it stops tracking the page gutter.

**Responsive.** 1440–1024 inset 20/72. 1023–768 narrows only: inset 16/32, gaps 26 → 18; height, search, both actions and the 4-item cap hold. ≤ 767 inset 12/12, height floor 60, nav and Sign in move to the drawer, short CTA label stays in the pill; the drawer inherits the pill's surface, border and inset — the only drawer in A1 that does not touch the screen edges.

**Behaviour.** *Stick and narrow*: pill pulls to 74 % of the gutter, top inset 20 → 12, height 68 → 56, ground to 94 % opacity, search and ghost action drop. The shadow does not change — it was already there.

**Empty state.** No logo → wordmark alone. No CTA → nav gains the room, height unchanged. Minimum pill width 240 px; below that it carries the wordmark only.

**Accessibility.** Skip link sits over the page ground above the pill, not inside it, where the capsule would clip it. Focus rings are drawn inside the pill for the same reason. Contrast is checked against the pill's `surface`, not the page `background`. Narrowing on scroll does not reorder the DOM.

**Flagged.** The full-round outer corner overrides the pack radius token — the only such override in A1. Inner elements still take the token.

---

## 6 · Drawer-First

No nav in the bar at any width: wordmark, labelled Menu button, one action, and a takeover holding the whole navigation at display size.

**Content fields.** Shared list — the only design that uses all of it, with no cap on `navItems`, both levels of children, `secondaryNav`, `socialLinks`. Adds `featuredPost` (post reference or "latest", opt).

**Controls.** Height · Menu button (Icon + label · Label only · Icon only) · Takeover (Full page below bar · Panel from right · Panel from left) · Takeover ground (Surface · Contrast) · Featured post in menu (Latest post · Chosen post · None) · Subscribe in bar (On · Off).

**Data.** Primary nav fills column one, secondary nav the row beneath column two. Featured post is the latest published post or a chosen one; 0 posts → the block is dropped and the columns re-centre. **Empty primary nav → the Menu button is not rendered at all** — a takeover with nothing in it is a dead end — and the bar becomes wordmark + action.

**Responsive.** Closed: 1440–768 narrowing only, height and both buttons hold; ≤ 767 wordmark 17, short CTA label, Menu keeps its label at 13 px. Open: two section columns ≥ 1024; one column at 834 with the featured post beneath the list; at ≤ 767 one column, items 30 → 25, secondary links become a wrapping row on a hairline, and the featured post is **dropped** — the only content this design drops rather than relocates, stated in the sidebar.

**Behaviour.** Takeover keeps the bar in place and fills the rest with `surface` (or `contrast`); Menu becomes Close; the rules cross-fade with the label rather than morphing into an X. Opens on click only, never on hover.

**Empty state.** No featured post → columns re-centre. No secondary nav → the second column holds sections only.

**Accessibility.** `aria-expanded` + `aria-controls` on the toggle, its accessible name changing Menu → Close with no aria-label overriding visible text. Focus moves to the search field on open (or the first nav item), is trapped, and returns to the toggle on Escape; the page behind is inert. One `nav` containing two labelled lists, then the secondary list, then the featured post as its own region — column layout is CSS, never DOM order. Display-size rows are full-width targets with a 44 px minimum height.

---

## 7 · Mega Bar

Rail's bar with a full-width panel behind it: children in columns with descriptions, a grandchild group indented under any child that has one. The resting bar is the primary frame.

**Content fields.** Shared list plus `panelTags` (tag list, opt), `featuredPost`, and `panelColumns[]` — the per-column binding record: `{title, source, tagOrAuthor, order, count, secondLine, footLink, whenEmpty, links[]}`. Uses `children[].description` (≤ 60 chars) and grandchildren (≤ 6 per child) — the design where both earn their place.

**Controls.** Height · Panel width (Full bleed · Page gutter · Under trigger) · Columns (Two · Three · Four) · Descriptions (On · Off) · Panel rail (Latest post · Chosen post · Tag list · None) · On scroll (Static · Sticky · Shrink). Six, as everywhere in A1 — the seventh slot is deliberately unspent here, because the panel's content is already the most complex thing in the category.

**Data block (separate from the controls).** The sidebar carries a Data section listing the panel's columns — reorderable, addable up to the Columns setting — with the selected column's binding beneath it:

| Field | Values |
|---|---|
| Column title | free text; defaults to the tag or author name |
| Fill with | Authored links · Posts in a tag · Posts by an author · Latest posts · Tag list |
| Tag / Author | Ghost picker showing each option's post count |
| Order | Newest · Oldest · Featured first |
| Show | Three · Four · Six |
| Second line | Date · Excerpt · None |
| Foot link | Tag archive · Custom link · None — label carries the real count |
| If the tag is empty | Hide column · Show fallback |

One source per column; a column never mixes authored links with bound posts, because sort order cannot be defined across both. A bound column renders posts in the same shape as an authored one — title 15 px, meta 13.5 px — so the reader cannot tell which is which. Bindings are stored with the content, so switching to A1·1 renders the same bound posts as a flat dropdown list.

**Data.** Ghost primary nav in the bar; authored columns from Inflozo, bound columns from Ghost per the Data block above; the tag column reads Ghost tags with a count-capped "All N tags" link; the rail reads the latest or a chosen post. **0 children → a plain link, no caret. 1 child → a 248 px dropdown, not a panel.** A bound column whose tag has 0 published posts hides and the remaining columns re-flow (or shows its fallback line, by setting). 0 posts on the site → rail dropped.

**Responsive.** ≥ 1024 columns as set plus a fixed 300 px rail divided by a hairline. 768–1023 all columns stack in order with their grandchild groups intact, divided by hairlines; the rail and featured post are dropped; the bar keeps every item and its cap, losing only search and the ghost Sign in. ≤ 767 **no panel at all** — the drawer carries children with their descriptions at 13 px and a caret for grandchildren.

**Behaviour.** Panel is full-bleed `surface`, hairline above, md shadow below; the bar's own hairline disappears while it is open. Opens on click, on Enter, or on hover after 120 ms of intent (fine pointers only). Closes on click outside, Escape, pointer leaving bar and panel for 200 ms, or another trigger opening — never while focus is inside it.

**Empty state.** Descriptions off or unwritten → titles tighten to a 14 px row list and the panel loses half its height.

**Accessibility.** Focus is **not** trapped: Tab moves through the panel and on to the next bar item, because a mega panel is an expansion of the page, not a modal. Column eyebrows are the lists' headings. Grandchildren are a nested `ul` inside their child's `li`, always visible when the panel is — never a hover-revealed flyout. Each link's accessible name is title plus description as one string, not `aria-describedby`.

---

## 8 · Utility + Nav

A 38 px utility strip above the main bar: secondary links, social, mode toggle, an optional editorial note. The first design to render Ghost's secondary navigation in the header.

**Content fields.** Shared list plus `stripNote` (text, opt, ≤ 40 chars). Renders `secondaryNav[]` (capped 5) and `socialLinks[]` (capped 3) in the strip, which makes both rows final in the category field list.

**Controls.** Strip content (Links · Links + social · Links + note + social · Links + note + social + mode) · Strip ground (Surface · Background · Contrast) · Bar height · Nav position (Beside logo · Centre · Right) · On scroll (Static · Main bar sticks · Whole header sticks) · Divider (Hairline · Shadow · None).

**Data.** Strip links from Ghost's secondary navigation; social from Ghost's social fields plus authored extras. **Empty secondary nav and no social and no note → the strip is not rendered and the design degrades to Rail**, stated in the sidebar. The mode toggle appears only if the pack ships both modes.

**Responsive.** ≥ 1024 both tiers full. 768–1023 the strip sheds social, then the note, keeping links and the mode toggle; the bar loses search and the ghost action. ≤ 767 the strip is removed entirely and its contents move into a labelled group in the drawer, with the mode toggle as a switch row; the note is dropped. Strip height 38 and bar height hold at every width above the drawer.

**Behaviour.** *Main bar sticks*: the strip scrolls away with the page and does not return until the reader is back at the top; bar 74 → 60, wordmark 19 → 16, hairline to md shadow.

**Empty state.** A strip with one link renders as one link — it does not stretch or centre.

**Accessibility.** Two navs, two names: `aria-label="Secondary"` on the strip, `"Primary"` on the bar, one `header` around both. Focus order is top tier first, which makes the skip link mandatory here rather than merely required. 13 px `text-muted` on `surface` is the lowest-contrast pair in the design and every pack must clear AA at it or the strip falls back to `text`. The mode toggle is a button with `aria-pressed` and the name "Dark mode", never a glyph alone, and it stays in sync with the drawer's switch row. Scrolling away is not removal from the tree or the tab order.

**Flagged.** The shed order (social, then note), the 5/3 caps, and the assumption that an announcement bar may sit above a utility strip — with A2 taking `contrast` so three bands read as three — are mine. A2 decides the last one.

---

## 9 · Search-Forward

A persistent search field between the nav and the actions, taking the slack in the bar.

**Content fields.** Shared list plus `searchPlaceholder` (text, opt, ≤ 40 chars; defaults to "Search N essays and interviews" with the live post count). `searchEnabled` is forced on — the field is the design — and the sidebar states that.

**Controls.** Height · Field position (After nav · Before nav · Second row) · Field width (Compact · Takes the slack · Wide) · Field treatment (Outlined · Filled · Underlined) · Suggestions (Recent, then results · Results only · Off) · Actions.

**Data.** Queries run against Ghost content — title, excerpt, tag — debounced 200 ms, minimum 3 characters, 5 rows plus a "See all results" row into the A23 surface. Recent queries are local to the reader; a first-time visitor gets the site's three most-read posts instead. 0 results → one line, "No matches for '…' — try a tag", plus the tag list. Under 20 posts on the site → the placeholder drops to plain "Search".

**Responsive.** ≥ 1024 one row, field 240 px minimum. 768–1023 the field moves to a full-width second row and the header becomes two tiers; nav, both actions and the placeholder are unchanged. ≤ 767 the field keeps its second row in the bar — the only design where search survives the drawer collapse — and is focused on open in the drawer, where results push the nav list down rather than replacing it.

**Behaviour.** Suggestions align to the field and never exceed its width. The page dims behind the panel but does not scroll or become inert. Escape has two steps: close the panel keeping the query, then clear.

**Empty state.** No recent queries and no typing → most-read posts. Field never narrower than 240 px; below that the design falls back to the second row.

**Accessibility.** The field sits in its own `search` region with a visually hidden label — the placeholder carries the archive size and a placeholder is not a label. Combobox semantics: `aria-expanded`, `aria-activedescendant` for arrow-key selection, and a polite live region announcing the result count. Each row's accessible name is title, section, author, date. Hit area 44 px; clear button named "Clear search". Focus order is logo → nav → search → actions at every width.

**Flagged.** The 200 ms debounce, 3-character minimum, 5-row cap, 240 px floor and the most-read fallback are mine.

---

## 10 · Contrast Band

Rail's arrangement on the `contrast` token. The structure is settled; the design is the answer to what the accent does on an inverted ground.

**Content fields.** Shared list. Uses `logoLight` — an image logo on the band needs its inverted file; without one the wordmark renders as text rather than being tinted.

**Controls.** Height · Band width (Full bleed · Page gutter) · Nav position · Primary action (Surface fill · Outline · Accent) · On scroll (Static · Sticky · Shrink) · Search in band.

**Data.** Identical to Rail. No data of its own.

**Responsive.** 1440–1024 as drawn. 1023–768 narrowing only — wordmark 18, mark 24, padding 40, gaps 18, search button leaves; height, both actions and the 4-item cap hold. ≤ 767 nav to drawer; the drawer continues the band's contrast ground and Subscribe stays in the bar as a surface fill.

**Behaviour.** Sticky **stays opaque** — the only design that does not drop to 94 %, because a near-black band at 94 % over moving text turns to mud. It takes a deeper shadow instead. Height 76 → 56 on Shrink.

**Three substitutions, and no others.** Logo mark takes `surface` instead of `accent`; the primary button becomes a surface fill with contrast-coloured text; the active underline uses the pack's *opposite-mode* accent, already tuned for a deep ground. Muted text is surface at 76 %, not a new token. The dropdown keeps the light surface and opens over the page, ignoring the band.

**Empty state.** No image logo → wordmark in surface colour. Empty nav → band holds logo and actions at full height; a contrast band reads fine with two items in it.

**Accessibility.** 76 % is the muted floor (8.1:1 on Paper); a pack that cannot meet it renders muted items at full surface. "Primary action: Accent" is **disabled where it fails** — Paper measures 3.1:1 — and the sidebar shows the number. The focus ring on the band is always `surface`, never accent, and takes a band-coloured gap over a surface fill; off the band it returns to accent. The band is not a colour scheme: `color-scheme` stays as the site's, and forced-colours mode gets system colours plus a real border.

**Flagged.** The 76 % opacity, the stays-opaque rule, the opposite-mode accent underline, and the schema requirement that **`contrast` be defined per mode in every pack** — near-ink in light, pale warm neutral in dark. Confirm before the 12 packs are built.

---

## 11 · Side Rail

A fixed 240 px column at the left: logo top, nav as rows, actions pinned to the foot. It changes the page's layout rather than sitting on top of it, and it exists only at 1200 and wider.

**Content fields.** Shared list. Highest cap in the category: **7 nav items** shown, items 8+ fold to a More row, because a fixed column has vertical room a bar does not.

**Controls.** Rail width (Narrow 200 · Comfortable 240 · Wide 280) · Rail ground (Background · Surface · Contrast) · Rail side (Left · Right) · Actions (Pinned to the foot · Under the nav) · Becomes a top bar (Early 1400 · Standard 1200 · Late 1024) · Search in rail. No Height control — a rail has no height.

**Data.** Ghost primary nav as rows; children in a 248 px panel opening to the side, two levels. Empty nav → the rail keeps its width and holds logo, search and actions, because the page layout depends on it.

**Responsive.** ≥ 1200 the rail. **1199 and below the design becomes A1·1 Rail** — rows to inline items, leading accent bar to underline, panel opens downward, foot actions rejoin the bar, cap folds 7 → 4 with items 5+ in More. ≤ 767 Rail's drawer. The sidebar states which design is in force at the previewed width.

**Behaviour.** Rail is fixed; the page scrolls beside it and the rail never scrolls. The side panel overlaps the page rather than pushing it, never covers its own row, and closes on Escape, on leaving both, or on scroll — a fixed panel over scrolling text loses its anchor.

**States.** The whole 220 px row is the target. Hover fills it with the hover surface; the active row adds a 2 px leading accent bar on top of that same fill, so hover and active differ by the bar alone. The primary action is full-width here, since a 240 px column has no right side for it to sit on, with the ghost action as centred text beneath it.

**Empty state.** No CTA → the foot holds the ghost action alone, still pinned. No logo image → wordmark, wrapping to two lines if it must; two lines are comfortable at this width.

**Accessibility.** Source order is header-first regardless of Rail side — "Right" is a visual swap only. The skip link is mandatory and lands on the reading column. `aria-current="page"` on the active row, since a 2 px bar on its own is a colour-only signal. At 200 % zoom a 1440 viewport is effectively 720, so the design has already handed off to Rail and cannot crowd the text; that is why the threshold is 1200 rather than lower.

**Flagged.** The 1200 threshold, the 7-item cap, the three rail widths, and the decision that this design **becomes another design** below its threshold instead of inventing a narrow-rail variant. The last of those matters most: it establishes that library designs may hand off to one another. Confirm before A2.

---

## 12 · Boxed

A hairline box aligned to the content column, so the nav's left edge is the headline's left edge.

**Content fields.** Shared list, no additions. 4 nav items shown, items 5+ fold to More, children two deep.

**Controls.** Height · Box width (Content column · Page gutter · Narrow) · Box treatment (Hairline · Filled · Both) · Nav position · Actions · On scroll (Static · Stick and fill · Hide). No radius control — the box takes the pack token exactly, which is what distinguishes it from A1·5.

**Data.** Identical to Rail. Empty nav → the box holds logo and actions and keeps its width, which comes from the content column, not its contents.

**Responsive.** 1440–1024 inset 28/120 on the content column. 1023–768 narrowing only: inset 22/40, gaps 16, search leaves; height, radius, both actions and the cap hold. ≤ 767 inset 14/16, height 62, nav to drawer; the drawer inherits the box's inset, hairline and radius and fills with surface.

**Behaviour.** *Stick and fill*: the box fills with `surface` and takes the md shadow — at rest it is transparent with a hairline, so without a fill the page would run visibly underneath. Top inset 28 → 14, height 72 → 60, search and ghost action drop. It keeps the content-column width while stuck, staying aligned with the text behind it.

**Empty state.** No CTA → nav gains the room. The box never shrinks to fit its contents; the alignment with body text is the design.

**Accessibility.** The box is the header's own border, not a nested region — nothing extra announced. 22 px side padding guarantees a 2 px focus ring at 2 px offset never touches the hairline. Forced-colours mode gets a system border and no fill. Sticky adds 74 px of scroll padding so in-page anchors do not land under it. **A pack whose dark border falls under 1.5:1 against its background renders Filled instead of Hairline**, so the header is never an invisible container.

**Flagged.** The 22 px padding, the 74 px scroll padding and the 1.5:1 dark-border fallback are mine. The content-column width comes from the pack's measure, which is why the control has no pixel value.

---

## 13 · Centre Nav

Logo left, actions right, nav centred between them in a three-column grid.

**Content fields.** Shared list, no additions. 4 nav items shown, items 5+ fold to More.

**Controls.** Height · Centring (True centre · Optical · Space between) · Actions · Divider · On scroll · Nav spacing (Tight 20 · Even 30 · Airy 40).

**Data.** Identical to Rail. Empty nav → the centre column is removed and the grid becomes logo left, actions right, at full height.

**Responsive.** ≥ 1025 three-column grid with the nav truly centred on the page. ≤ 1024 the grid becomes a row and the nav anchors beside the logo; nothing is dropped or folded at that point. 1023–768 narrowing only. ≤ 767 nav and Sign in to the drawer, Subscribe stays with its short label.

**Behaviour.** The re-anchor is a layout change with no change to content or order. Shrink follows Rail: 76 → 56, search and the ghost action drop.

**Empty state.** No CTA → the right column holds search and Sign in; the nav stays centred, since the grid's outer columns are equal regardless of contents.

**Accessibility.** Grid placement only — DOM order stays logo → nav → actions in both arrangements, so focus never zig-zags. Nothing is announced on re-anchor and no focus is lost. Nav spacing has a 20 px floor so 15 px labels do not read as one string and the focus ring has room.

**Flagged.** The 1024 re-anchor threshold, the 20/30/40 spacing values, and making True centre the default over Optical — optical centring shifts the nav when the CTA label changes.

---

## 14 · Icon Utilities

Rail's bar with a bare-icon cluster at the right: search, RSS, dark mode, and the member's avatar. The signed-in state is the primary frame.

**Content fields.** Shared list, and the design that renders `socialLinks[]` as icons in the bar — capped at 2 alongside search and the mode toggle. No new fields.

**Controls.** Height · Icons (Search · Search + RSS · Search + RSS + Dark mode · Search + Dark mode) · Icon style (Bare · Outlined · Filled) · Member control (Avatar + name · Avatar · Text) · Nav position · On scroll.

**Data.** Member name, tier and renewal date come from Ghost; anything that changes a subscription opens Ghost's Portal, so "Account" is a handoff rather than a page of ours. Signed out → the avatar is replaced by Sign in + Subscribe and the icon cluster is unchanged, so the header does not appear to rearrange itself when a reader signs in. Members disabled → no member control. Dark mode appears only if the pack ships both modes.

**Responsive.** 1440–1024 as drawn. 1023–768 narrowing only: padding 40, nav gaps 16, cluster gaps 3; icons stay 38 px and the member pill keeps its name. ≤ 767 the avatar stays in the bar as a bare 32 px circle — a signed-in reader's route to their account should not be two taps deep — and the rest of the cluster becomes labelled rows in the drawer: search as a field, dark mode as a switch, RSS as a link.

**Empty state.** No social links and no dark mode → the cluster is search alone and the hairline separator is dropped rather than left dividing one item from the member pill. No member picture → initials on accent.

**Accessibility.** Every icon has a text accessible name — "Search", "RSS feed", "Dark mode" — plus a tooltip on hover and focus after 500 ms; glyphs are decorative and hidden from the tree. The toggle is a button with `aria-pressed`, its on state a fill rather than a colour change so it survives forced-colours mode, kept in sync with the drawer's switch. The member menu has `aria-expanded`, arrow-key rows, and a static member block that is not a focus stop. Bare icons need muted-on-background to clear 4.5:1; a pack that cannot manage it renders Outlined instead. The avatar's accessible name is the member's full name; initials are decorative.

**Flagged.** The 2-social cap, the 500 ms tooltip delay, setting RSS as a mono wordmark instead of a drawn glyph, keeping the avatar in the mobile bar, and the Bare → Outlined fallback. The member block's three lines of Ghost data assume the theme may read tier and renewal date — confirm with A30 Members Pages.

---

## 15 · Big Type

The wordmark at 64 px with the nav small and low beside it. Suits a home page or an archive rather than a post.

**Content fields.** Shared list, using `tagline` as A1·3 does. `logo` is accepted but **not rendered** — an image logo cannot be set at 64 px reliably — and the sidebar says so.

**Controls.** Wordmark size (Large 48 · Larger 64 · Largest 80) · Nav placement (Low right · Below · Top right) · Padding · Tagline · Actions · On scroll (Static · Collapse to bar · Hide). The logo mark is not offered: a 26 px badge beside 64 px type reads as debris.

**Data.** Ghost site title and description. A site title over 24 characters drops one size step automatically, since at 80 px a long name would wrap on desktop.

**Responsive.** 1440 wordmark 64, nav and actions stacked at the right on a shared baseline with the tagline. 1023–768 the nav drops to its own row beneath, actions stay top right, wordmark 46. ≤ 767 wordmark 28 — the floor — with a two-line wrap and the bar growing to fit; tagline 11; nav and Sign in to the drawer; drawer wordmark 20.

**Behaviour.** *Collapse to bar*: the stuck state is A1·1 Rail at 56 px with the wordmark at 17. Tagline, search and the ghost action leave with the large type. The transition is a 160 ms cross-fade rather than a size animation — interpolating 64 px down to 17 px draws the eye to the movement instead of the page.

**Empty state.** No tagline → the wordmark sits alone and the header keeps its padding. Empty nav → the actions hold their position and the second row is removed rather than left empty.

**Accessibility.** Size confers no heading level: the wordmark is a link to `/` at every size and an `h1` only on the home page. The hover underline is 3 px at 8 px offset — the 2 px body-size underline proportioned to display type. The 28 px floor and two-line wrap keep the wordmark inside a 320 px viewport with no horizontal scrolling. Under reduced motion the collapse swaps instantly; neither state reorders the DOM. The tagline is a paragraph, hidden by its control rather than emptied.

**Flagged.** The 48/64/80 sizes, the 28 px mobile floor, the 24-character auto-step, dropping the logo mark, the cross-fade over a size animation, and not rendering an image logo at all — confirm that last one, since a site with a wordmark image may expect it to be used.

---

## 16 · Reveal

Rail's bar, hidden while the reader goes down the page and back on any upward scroll. Three states, and the design is the rules between them.

**Content fields.** Shared list, no additions. The Returned-contents control decides what the panel carries.

**Controls.** Height · Hides after (Immediately · Short scroll 200 px · Long scroll) · Returned ground (Surface · Contrast · Page) · Returned shape (Inset panel · Full-width bar) · Returned contents (Nav only · Nav + Subscribe · Nav + both actions · Wordmark + nav) · Search at the top. No On-scroll control — the scroll behaviour is the design.

**Data.** Identical to Rail. Empty nav → the panel carries the wordmark and the action. On pages shorter than two viewports the header never hides, since there is no scroll for it to respond to.

**Three states.** *At top*: Rail's bar, in flow, 76 px, page ground, hairline under, search and both actions. *Hidden*: off-screen after 200 px of downward scroll, 160 ms. *Returned*: a 58 px floating panel on surface, inset 12/24, md shadow, nav + Subscribe at 14 px. Reaching the top restores the in-flow state — the only transition that changes the page's layout rather than sliding an overlay.

**Responsive.** 1023–768 panel insets 12/20, gaps 16, height and contents hold. ≤ 767 panel 56 px inset 10/12 carrying wordmark, short CTA and the drawer toggle; nav in the drawer.

**Empty state.** As above; the reveal behaviour itself never turns off, since a returning reader may still want the CTA.

**Accessibility.** Hidden is not removed: the header stays in the DOM, the accessibility tree and the tab order, and tabbing into it returns it — no `display:none`, no `aria-hidden`. Reduced motion drops the slide and keeps the thresholds; suppressing the reveal would leave a reader mid-post with no header at all. Anchors get 70 px of scroll padding. While the drawer is open the reveal rules are suspended and the page behind is inert. The skip link stays the first focus stop in every state and does not trigger a return.

**Flagged.** The 200 px threshold and three named distances, the 58 px panel height, the 12/24 insets, dropping search and the ghost action from the returned state, and suspending the behaviour while the drawer is open.

---

## 17 · Flagged inventions

Decisions I made where the brief is thin. Each is cheap to overturn now and expensive later.

1. **Sticky is a control, not a design.** Rail and "Sticky Rail" are one design with an On-scroll control. This buys four more arrangements out of the 16 slots. If you would rather spend slots on behaviour, the roster changes.
2. **Two levels of dropdown** — approved. Children and grandchildren are Inflozo-authored because Ghost's nav is flat; grandchildren render as an indented group under their child, never as a second flyout, and there is no third level.
3. **Unused fields go to the drawer foot.** Content is never lost when switching design. Some drawers get long as a result.
4. **Numeric limits** — 280 px wordmark cap, 150 px nav-label ellipsis, max-6 nav items on Rail, 248 px dropdown, 44 px targets — are mine. The brief fixes roles and named values, not these.
5. **Pack details** — Ink's header on `surface` rather than `background`, and the dark-mode border values for Tangerine and Ink — are mine, extending the existing Calibration Set.
6. **A2 above.** Every A1 design must tolerate an announcement bar above it, including Overlay, where the bar is opaque and the header is not, and Utility + Nav, where it makes three stacked bands. That interaction is drawn in A2, not here.
7. **Per-design inventions** are flagged in each design's Flagged line and on its frames.
8. **Designs may hand off to other designs.** A1·11 becomes A1·1 below 1200; A1·15's collapsed state is A1·1; A1·4 and A1·8 fall back to A1·1 when their preconditions are absent. This is now a category rule, established by those four, and it needs your confirmation before A2 relies on it.

---

## 18 · A1 is closed

Sixteen designs, each with desktop 1440, its behaviour states, hover/focus states, tablet 834, mobile 390 closed and open, dark desktop, an annotated accessibility frame, its control panel and its spec. Category artefacts — the three-pack tokenisation proof, the stress frame and the shared field list — are in `A1-0 Category Proof.dc.html`.

**The shared field list is final.** Sixteen fields: logo, logoLight, siteTitle, tagline, dateLine, navItems[], children[] (two levels), descriptions, secondaryNav[], signInLabel, ctaLabel/ctaUrl, searchEnabled, searchPlaceholder, socialLinks[], darkModeToggle, plus the three structural records panelColumns[], panelTags[], featuredPost and stripNote. Every design draws from it; nothing a design ignores is discarded — unused content goes to the drawer foot.

**Components established here, carried forward verbatim:** logo lockup, nav item, dropdown panel (248 px, two levels), primary button, ghost action, overflow "More" menu, drawer, search affordance (38 px / 19 px glyph), member pill and account menu, icon button (38 px box, three styles), takeover, floating panel.

**Three decisions waiting on you before A2:**

1. Designs may hand off to other designs (§17.8).
2. `contrast` must be defined per mode in every pack (§10).
3. The member block reads tier and renewal date from Ghost (§14) — confirm with A30.

**Next category: A2 Announcement Bars, 15 designs.** It sits above every A1 design, including Overlay, where the bar is opaque and the header is not, and Utility + Nav, where it makes three stacked bands.
